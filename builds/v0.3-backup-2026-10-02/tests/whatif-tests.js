// What-If implementation pass (2026-09-23): four branches built from Astra's What-If Bible
// (S01 "Don't Let Go", S27 "Vegeta Refuses the Moon", P03 "The Scouter That Would Not Die",
// N24 "Twenty Is Not Enough Time"). These tests drive the real engine headless: they check the
// divergence actually happens, the gameplay is different, the endings are different, and the
// canon story and its save track are untouched.
const H = require('./headless');

module.exports = function whatIfTests({ test, eq, ok }) {
  console.log('\nWhat-If branches: divergence, alternate endings and canon isolation (headless)');

  const BRANCHES = ['whatif_signal', 'whatif_tail', 'whatif_prince', 'whatif_twenty'];
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  /** Start a mission at a phase and run until control is back. */
  const reach = (gg, id, phase, seconds = 60) => {
    const idx = phaseAt(gg.SL, id, phase);
    const b = gg.mission(id, { startPhase: idx });
    gg.until(b, () => !b.inputLocked && b.mission.phaseIndex >= idx, 60 * seconds, () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    return b;
  };
  /** Play a branch to the end with its bot brain, collecting title cards and spoken lines. */
  const play = (gg, id, maxSeconds = 420) => {
    const seen = { titles: [], said: [], failed: null };
    const r = gg.playMission(id, {
      maxSeconds,
      onBattle: (b) => {
        b.on('titleCard', (e) => seen.titles.push([e.chapter, e.title, e.subtitle].join(' · ')));
        b.on('say', (e) => seen.said.push(e.speaker + ': ' + e.line));
        b.on('missionFailed', (e) => (seen.failed = e.reason));
      },
    });
    return Object.assign(r, seen);
  };
  const objective = (m, id) => m.objectives.find((o) => o.id === id);

  /* ------------------------------------------------- track and unlock isolation */

  test('clearing a What-If writes to the What-If track and leaves canon progress alone', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    SL.Save.data.story.missions = { saiyan_brothers: { completed: true, clears: 1 } };
    SL.Save.data.story.lastMission = 'saiyan_brothers';
    SL.Save.data.story.started = true;
    SL.Save.data.whatIf.missions = {};
    const canonBefore = JSON.stringify(SL.Save.data.story.missions);
    for (const id of BRANCHES) SL.Save.completeMission(id, { score: 1200, rank: 'A' });
    for (const id of BRANCHES) {
      ok(SL.Save.data.whatIf.missions[id] && SL.Save.data.whatIf.missions[id].completed, id + ' recorded on the What-If track');
      eq(SL.Save.data.story.missions[id], undefined, id + ' never appears in canon progress');
    }
    eq(JSON.stringify(SL.Save.data.story.missions), canonBefore, 'canon mission records are byte-identical afterwards');
    eq(SL.Save.data.story.lastMission, 'saiyan_brothers', 'the story never resumes into a What-If');
  });

  test('every branch is flagged, points at a canon mission, and is listed in the What-If menu data', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    for (const id of BRANCHES) {
      const def = SL.data.missions[id];
      ok(def && def.whatIf === true, id + ' is flagged whatIf');
      const parent = SL.data.missions[def.branchOf];
      ok(parent && !parent.whatIf, id + ' branches off a canon mission (' + def.branchOf + ')');
      ok(def.phases.some((p) => p.id === def.branchPoint) || parent.phases.some((p) => p.id === def.branchPoint), id + ' names a real branch point');
      const entry = SL.data.story.whatIf.find((w) => w.mission === id);
      ok(entry && entry.branchOf === def.branchOf, id + ' is on the What-If list with the same parent');
      ok(SL.data.storyOrder().indexOf(id) < 0, id + ' is not in the canon story order');
    }
  });

  test('a branch stays locked until its own canon mission is cleared', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    SL.Save.data.story.missions = {};
    SL.Save.data.whatIf.missions = {};
    const entries = BRANCHES.map((id) => SL.data.story.whatIf.find((w) => w.mission === id));
    for (const w of entries) ok(!SL.Save.conditionMet(SL.Save.data, w.unlock), w.mission + ' is locked on a fresh save');
    for (const w of entries) {
      SL.Save.data.story.missions[w.unlock.missionComplete] = { completed: true, clears: 1 };
      ok(SL.Save.conditionMet(SL.Save.data, w.unlock), w.mission + ' unlocks once "' + w.unlock.missionComplete + '" is cleared');
    }
  });

  /* --------------------------------------------------------- S01: the hold */

  test("the hold is a real fail state: let go and the timeline snaps back to canon", () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = reach(gg, 'whatif_tail', 'hold', 30);
    let reason = null;
    b.on('missionFailed', (e) => (reason = e.reason));
    // nobody touches the button: the grip drains out
    gg.until(b, () => b.mission.state !== 'running', 60 * 40, () => {
      if (b.inputLocked && !b.mission.struggling) b.skipRequested = true;
    });
    eq(b.mission.state, 'failed', 'the mission fails when the grip empties');
    eq(reason, 'gripLost', 'and it fails for the right reason');
    ok(!b.mission.flags.heldOn, 'the divergence flag is never set on the failed run');
  });

  test('steering only counts inside Piccolo\'s firing line, and Raditz is dragged along by the grip', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = reach(gg, 'whatif_tail', 'steer', 40);
    const S = b.story, g = S.goku, r = S.raditz, pc = S.piccolo;
    const V3 = Object.getPrototypeOf(pc.pos).constructor;
    const lane = pc.pos.clone().negate().setY(0).normalize();
    // off the line: no progress
    g.setPosition(pc.pos.clone().addScaledVector(lane, 9).add(new V3(10, 0, 10)));
    g.yaw = g.prevYaw = Math.atan2(-lane.x, -lane.z);
    gg.step(b, 60);
    const objOff = objective(b.mission, 'lane');
    eq(objOff.count, 0, 'standing outside the corridor sends nothing to the objective');
    const held = r.pos.distanceTo(g.pos);
    ok(held < 2.4, 'Raditz is held in front of the player (' + held.toFixed(2) + ' m)');
    // on the line, facing down it: the clock runs
    g.setPosition(pc.pos.clone().addScaledVector(lane, 8));
    g.yaw = g.prevYaw = Math.atan2(lane.x, lane.z);
    gg.step(b, 150);
    ok(objective(b.mission, 'lane').count >= 2, 'holding him in the line advances the objective');
  });

  test('S01 ends the opposite way round: Raditz dies, Goku lives, and the ending says so', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const r = play(gg, 'whatif_tail');
    eq(r.state, 'success', 'the branch can be played to the end');
    ok(r.m.flags.heldOn && r.m.flags.laneHeld && r.m.flags.raditzDown, 'hold, steer and the kill all happened');
    ok(r.b.story.goku.alive, 'Goku is alive at the end — the whole point of the branch');
    ok(!r.b.story.raditz.alive, 'Raditz is not');
    ok(r.titles.some((t) => /THE HOLD NEVER BROKE/.test(t)), 'it ends on its own What-If title card');
    ok(r.said.some((l) => /No King Kai this time/.test(l)), 'and states the consequence: no Other World training');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* ------------------------------------------------------ S27: the prince */

  test('the prince is the player, and nothing from a later era is in his hands', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const b = reach(gg, 'whatif_prince', 'duel', 60);
    eq(b.player.def.id, 'vegeta', 'the player character is Vegeta');
    ok(b.player.lockedSlots && b.player.lockedSlots.ultimate, 'Final Flash is locked in the Saiyan saga');
    ok(b.player.lockedForms && b.player.lockedForms.ssj, 'Super Saiyan is locked');
    const goku = b.story.goku;
    ok(goku.team !== b.player.team && goku.cannotDie, 'Kakarot is the opponent, and the fight does not kill him');
  });

  test('the divergence is the Power Ball: it is crushed, and no Great Ape ever exists in this branch', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const r = play(gg, 'whatif_prince');
    eq(r.state, 'success', 'the branch plays to the end');
    ok(r.m.flags.refusedMoon, 'the ball was crushed, not thrown');
    ok(!r.b.story.ball, 'the Power Ball is gone from the scene');
    ok(!r.b.fighters.some((f) => /great_ape/.test(f.def.id)), 'no Great Ape is ever created');
    ok(r.m.flags.gokuDown, 'the duel is finished with his hands');
    ok(r.titles.some((t) => /THE PRINCE KEPT HIS PRIDE/.test(t)), 'its own ending card');
    ok(r.said.some((l) => /debt/i.test(l)), 'the ending states the unpaid debt');
    // canon keeps its ape
    ok(gg.SL.data.missions.saiyan_vegeta.phases.some((p) => p.id === 'greatApe'), 'the canon mission still has its Great Ape phase');
  });

  test('a counter only counts while Kakarot is committed to a swing', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const b = reach(gg, 'whatif_prince', 'counter', 60);
    const m = b.mission, v = b.story.vegeta, g = b.story.goku;
    const committed = ['attack', 'beamCharge', 'beamFire', 'blast', 'rush', 'throw'];
    // a hit while he is not committed to anything is just a trade: hold him idle first
    g.controller = { update: () => gg.SL.emptyIntent() };
    gg.until(b, () => g.state === 'free', 60 * 20);
    gg.step(b, 30);
    ok(!committed.includes(g.state), 'he is standing, not swinging');
    b.emit('damage', { target: g, attacker: v, amount: 100, blocked: false });
    eq(objective(m, 'counter').count, 0, 'a hit on a standing opponent is not a counter');
    // the same hit while he is committed to something is
    g.controller = new gg.SL.AIController(b, { difficulty: 'normal' });
    const swung = gg.until(b, () => committed.includes(g.state), 60 * 60);
    ok(swung >= 0, 'Kakarot commits to something on his own');
    gg.step(b, 1);
    b.emit('damage', { target: g, attacker: v, amount: 100, blocked: false });
    eq(objective(m, 'counter').count, 1, 'a hit inside his own attack is a counter');
  });

  /* ------------------------------------------------------ P03: the signal */

  test('the broadcast only runs in clear air: anything of theirs on the relay stalls it and eats the hull', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const b = reach(gg, 'whatif_signal', 'send', 60);
    const m = b.mission, pod = b.story.pod;
    ok(pod && pod.alive && pod.hp > 0, 'the relay is a real prop with a hull');
    // clear air: the objective climbs
    for (const f of b.fighters) if (f.team !== b.player.team) f.alive = false;
    gg.step(b, 150);
    const sent = objective(m, 'signal').count;
    ok(sent >= 2, 'with nobody near it the broadcast advances (' + sent + 's)');
    // one of theirs parked on it: the clock stops and the hull goes down
    const jam = m.spawn({ charId: 'frieza_soldier', pos: pod.pos.clone(), grounded: false, tag: 'comm' });
    jam.controller = { update: () => gg.SL.emptyIntent() };
    const hp0 = pod.hp;
    gg.step(b, 120);
    eq(objective(m, 'signal').count, sent, 'the broadcast stalls while they are on it');
    ok(pod.hp < hp0, 'and the relay takes damage (' + Math.round(hp0 - pod.hp) + ')');
    ok(m.flags.jammed === true, 'the mission knows it is jammed');
  });

  test('losing the relay ends the timeline: no transmitter, no warning', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const b = reach(gg, 'whatif_signal', 'send', 60);
    let reason = null;
    b.on('missionFailed', (e) => (reason = e.reason));
    b.stage.damageProp(b.story.pod, 99999, b.player);
    gg.until(b, () => b.mission.state !== 'running', 60 * 20, () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    eq(b.mission.state, 'failed', 'the mission fails with the relay');
    eq(reason, 'relayDown', 'and says why');
  });

  test('P03 ends with Bardock dead and the warning alive in somebody else\'s scouter', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const r = play(gg, 'whatif_signal');
    eq(r.state, 'success', 'the branch plays to the end');
    ok(r.m.flags.broadcast && r.m.flags.sent >= 30, 'the full broadcast went out');
    ok(r.m.flags.bardockFell, 'he still dies — the branch does not save him');
    ok(r.said.some((l) => /scouter: /i.test(l) && /Frieza/.test(l) && /our world/.test(l)), 'the fragment that survives is the two words the Bible names');
    ok(r.said.some((l) => /soldier: /i.test(l) && /(recording|Saiyan)/.test(l)), 'somebody in the fleet hears it and keeps it');
    ok(r.titles.some((t) => /THE SCOUTER THAT WOULD NOT DIE/.test(t)), 'its own ending card');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* ------------------------------------------------------ N24: the bursts */

  test('only a x20 burst breaks a firing position — anything less is refused', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const b = reach(gg, 'whatif_twenty', 'bursts', 60);
    const g = b.story.goku, sp = b.story.spires[0];
    ok(sp && sp.alive, 'the firing positions exist as props');
    const hp0 = sp.hp;
    g.applyForm(0);
    b.stage.damageProp(sp, 1200, g);
    gg.step(b, 2);
    eq(Math.round(sp.hp), Math.round(hp0), 'base form does nothing to it');
    // the Kaioken below twenty is refused by the mission itself
    g.applyForm(1);
    g.formLevel = 2;
    g._applyFormLevel();
    b.stage.damageProp(sp, 1200, g);
    gg.step(b, 1);
    eq(Math.round(sp.hp), Math.round(hp0), 'x4 is not enough either');
    g.formLevel = 4;
    g._applyFormLevel();
    b.stage.damageProp(sp, 1200, g);
    ok(sp.hp < hp0 - 900, 'x20 takes a real bite out of it (' + Math.round(hp0 - sp.hp) + ')');
  });

  test('when the body gives out the mission changes hands: Piccolo plays, Goku is helpless', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const b = reach(gg, 'whatif_twenty', 'defend', 90);
    const g = b.story.goku, pc = b.story.piccolo;
    eq(b.player, pc, 'the player is Piccolo now');
    ok(g.hpFrac <= 0.12, 'Goku is at the end of himself (' + Math.round(g.hpFrac * 100) + '%)');
    ok(g.cannotDie && g.untargetable, 'and he cannot be finished off while he is down');
    ok(g.formIndex === 0, 'the Kaioken is out');
    const hold = objective(b.mission, 'hold');
    ok(hold && hold.target >= 20, 'the job is a clock, not a health bar');
  });

  test('N24 ends in a retreat with Frieza alive and hurt — no invented victory', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const r = play(gg, 'whatif_twenty');
    eq(r.state, 'success', 'the branch plays to the end');
    eq(r.m.flags.spires, 3, 'all three firing positions went down');
    ok(r.m.flags.friezaHurt >= 20, 'the plan actually cost Frieza something (' + r.m.flags.friezaHurt + '%)');
    ok(r.b.story.frieza.alive, 'Frieza is alive — this branch is an escape, not a kill');
    ok(r.m.flags.caught && r.m.flags.held >= 20, 'Piccolo caught him and held the line');
    ok(r.titles.some((t) => /TWENTY WAS NOT ENOUGH TIME/.test(t)), 'its own ending card');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* --------------------------------------------------------- canon safety */

  test('the canon missions these branch from are untouched, and the Namek ending still is what it was', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const M = gg.SL.data.missions;
    const shape = {
      prologue_final_stand: 'intro,blockade,gunners,pods,elite,frieza,ending',
      saiyan_brothers: null, // its phase list is checked by the saga suites; here: it is still canon
      saiyan_vegeta: 'standoff,duel,galick,transform,greatApe,shrink,desperate,moonlight,gohanApe,retreat',
      namek_kaioken20: 'ten,reveal,twenty,desperate,kamehameha,spent',
      namek_end: 'dying,wish,hundred,full,krillin,finish,saucers,mercy,betrayal,escape,after',
    };
    for (const [id, phases] of Object.entries(shape)) {
      const def = M[id];
      ok(def && !def.whatIf, id + ' is still a canon mission');
      if (phases) eq(def.phases.map((p) => p.id).join(','), phases, id + ' still has its canon phases');
    }
    // and no branch was allowed to register itself into the canon story
    const order = gg.SL.data.storyOrder();
    for (const id of BRANCHES) ok(order.indexOf(id) < 0, id + ' is outside the story order');
  });

  test('each branch is played differently from the one it branches from', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const M = gg.SL.data.missions;
    const pairs = [['whatif_tail', 'goku'], ['whatif_prince', 'vegeta'], ['whatif_signal', 'bardock'], ['whatif_twenty', 'goku']];
    for (const [id, who] of pairs) {
      const def = M[id];
      eq(def.character, who, id + ' is played as ' + who);
      const parent = M[def.branchOf];
      const mine = def.phases.map((p) => p.id).join(',');
      ok(mine !== parent.phases.map((p) => p.id).join(','), id + ' does not reuse its parent\'s phase structure');
      ok(def.phases.filter((p) => p.checkpoint).length >= 2, id + ' has checkpoints to retry from');
      ok(Array.isArray(def.rewards) && def.rewards.some((r) => /alternate ending/i.test(r)), id + ' advertises an alternate ending as its reward');
    }
  });
};
