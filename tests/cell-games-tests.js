// The Cell Games as a chain of missions (rebuilt 2026-10-01 from the owner's brief): the arena, Goku vs
// Cell and the Instant Transmission Kamehameha, the forfeit, Gohan's turn and Android 16, the Cell
// Juniors executed one by one, the catch, Goku's sacrifice on King Kai's planet, the Father-Son
// Kamehameha, the Room of Spirit and Time and the Future Trunks epilogue. Replaces the tests of the old
// single 28-phase "cell_games" mission and of "cell_purge" (both gone). Runs the real engine headless.
const H = require('./headless');

module.exports = function cellGamesTests({ test, eq, ok }) {
  console.log('\nThe Cell Games chain: arena, Goku, Gohan, the Juniors, the sacrifice, the Father-Son Kamehameha (headless)');

  const CHAIN = ['cell_chamber', 'cell_games', 'cell_gohan', 'cell_rampage', 'cell_goodbye', 'cell_fatherson', 'cell_future'];
  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const pi = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseOf = (b) => b.mission.def.phases[b.mission.phaseIndex].id;
  const errs = (gg) => 'engine errors: ' + gg.errors.slice(0, 2).join(' | ');
  const hit = (to, from, dmg) => to.takeHit(from, { type: 'melee', damage: dmg, knock: 'flinch', hitstun: 10, impact: 1, dir: to.forward.clone().negate() });

  /** Plays `mission` from phase `from` with the bot (scenes skipped unless o.watch) and stops as phase `stopBefore` begins. */
  function playTo(mission, from, stopBefore, o = {}) {
    const gg = H.create({ quiet: true, seed: o.seed || 5 });
    const { SL } = gg;
    const stopAt = stopBefore ? pi(SL, mission, stopBefore) : null;
    let snap = null, b0 = null;
    const r = gg.playMission(mission, {
      startPhase: from ? pi(SL, mission, from) : 0,
      style: 'reader',
      watch: !!o.watch,
      maxSeconds: o.maxSeconds || 400,
      onBattle: (b) => {
        b0 = b;
        if (o.onBattle) o.onBattle(b, gg);
        b.on('missionPhase', (e) => {
          if (stopAt !== null && e.index === stopAt && !snap) {
            snap = o.snapshot ? o.snapshot(b) : true;
            b.mission.state = 'stopped';
          }
        });
      },
    });
    return { gg, SL, r, b: b0, snap };
  }

  test('the arena is the owner\'s: a 34 m paved ring that cracks, four obelisks, a ridge for the Z Fighters, mesas, a TV van and no crowd', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, THREE } = gg;
    const V3 = THREE.Vector3;
    eq(SL.data.stages.cellarena.builder, 'arena', 'its own builder');
    const b = gg.mission('cell_games', { startPhase: pi(SL, 'cell_games', 'goku') });
    const S = b.stage, A = S.arena;
    ok(A && A.half === 17, 'a ring 34 across');
    eq(S.heightAt(0, 0), A.y, 'the paving is lifted analytically');
    eq(S.heightAt(16.9, -16.9), A.y, 'right to the corner');
    ok(S.heightAt(17.6, 0) < A.y - 1, 'and just past the edge you are off it: ' + S.heightAt(17.6, 0).toFixed(2));
    let cracks = 0, craters = 0;
    b.on('ringDamaged', () => cracks++);
    b.on('crater', () => craters++);
    const before = S.ringDamage;
    S.crater(new V3(2, A.y, 3), 4, 0.6, null);
    eq(cracks, 1, 'an impact on the paving cracks it');
    ok(S.ringDamage > before, 'and the damage accumulates');
    eq(S.heightAt(2, 3), A.y, 'without denting the platform');
    S.crater(new V3(40, S.heightAt(40, 0), 0), 4, 0.6, null);
    eq(craters, 1, 'off the platform the ground still craters');
    // the four obelisks at the corners survive the cast clearing the stage's rocks
    const obelisks = S.obstacles.filter((o) => o.fixture && o.shape === 'cyl' && o.h > 10);
    eq(obelisks.length, 4, 'four obelisks');
    ok(obelisks.every((o) => Math.abs(o.x) > A.half && Math.abs(o.z) > A.half && o.alive && o.group.visible), 'one off each corner, standing: ' + obelisks.map((o) => o.x.toFixed(0) + ',' + o.z.toFixed(0)).join(' '));
    ok(S.heightAt(-10, 44) > 6, 'the ridge the Z Fighters watch from: ' + S.heightAt(-10, 44).toFixed(1) + ' m');
    eq(S.mesas.length, 26, 'mesas all round the valley');
    ok(S.obstacles.some((o) => o.fixture && Math.hypot(o.x - 27, o.z - 14) < 1), 'the TV van by the ring');
    ok(S.crowdGroup.children.length <= 3, 'no crowd: only the van and the camera on its tripod (' + S.crowdGroup.children.length + ')');
    const st = b.story;
    eq(st.jimmy.def.id, 'jimmy', 'Jimmy Firecracker is a real character');
    eq(st.cam.def.id, 'tv_cameraman', 'and so is the cameraman');
    gg.step(b, 120, skipAll(b));
    eq(gg.errors.length, 0, errs(gg));
    b.dispose();
  });

  test('story order: the fever after the virus; the Room of Spirit and Time, then the Games as seven missions, then the Buu Saga; every scene written is played', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    eq(order.indexOf('android_fever'), order.indexOf('android_nineteen') + 1, 'the fever right after the virus');
    eq(order.indexOf('cell_chamber'), order.indexOf('cell_perfect') + 1, 'the Room of Spirit and Time after the perfect form');
    for (let i = 1; i < CHAIN.length; i++) eq(order.indexOf(CHAIN[i]), order.indexOf(CHAIN[i - 1]) + 1, CHAIN[i] + ' follows ' + CHAIN[i - 1]);
    eq(order.indexOf('buu_years'), order.indexOf('cell_future') + 1, 'and the Buu Saga follows the future');
    ok(!SL.data.missions.cell_purge, 'the old purge mission is gone');
    const want = {
      cell_chamber: ['enter,spar,anger,ascend,master,calm', 'spar,master'],
      cell_games: ['open,satan,goku,rise,air,kame,regrow,forfeit,after', 'goku,air'],
      cell_gohan: ['enter,test,powers,hold,crush,born,juniors,sixteen,after', 'test,hold,juniors'],
      cell_rampage: ['open,rampage,catch,toyed,swell', 'rampage,toyed'],
      cell_goodbye: ['bloat,farewell,kingkai,after', 'farewell'],
      cell_fatherson: ['return,beam,end,after', 'beam'],
      cell_future: ['arrive,eighteen,seventeen,cell,after', 'eighteen,seventeen,cell'],
    };
    let src = '';
    for (const id of CHAIN) {
      const def = SL.data.missions[id];
      eq(def.phases.map((p) => p.id).join(','), want[id][0], id + ' phase order');
      eq(def.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), want[id][1], id + ' checkpoints');
      src += def.phases.map((p) => p.run.toString()).join('\n') + '\n';
      // a playable stretch ends on what happens in it, never on a clock
      for (const p of def.phases.filter((x) => x.checkpoint)) ok(!/HOLD_SECONDS|t2 >=|seconds >=/.test(p.run.toString()), id + '.' + p.id + ' does not end on a timer');
    }
    const scenes = Object.keys(SL.data.scenes).filter((k) => /^(cg|gh|rp|cb|cf|fu|ch)_/.test(k));
    ok(scenes.length >= 39, 'the chain has its scenes: ' + scenes.length);
    for (const id of scenes) ok(src.includes("'" + id + "'"), 'scene ' + id + ' is played by its mission');
  });

  test('Goku vs Cell on the ring: Goku a Super Saiyan, Cell restrained (no beams, no flight), on the ground; the stretch ends on what the fight proves', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: pi(SL, 'cell_games', 'goku') });
    gg.step(b, 30, skipAll(b));
    const S = b.story, g = S.goku, c = S.cell;
    eq(b.player, g, 'the player has Goku');
    ok(g.controller instanceof SL.PlayerController, 'with a player controller');
    eq(g.form.id, 'ssj', 'as a Super Saiyan');
    eq(c.form.id, 'perfect', 'against the perfect form');
    ok(S.gohan.untargetable && S.piccolo.untargetable, 'everybody else watches from the ridge');
    ok(c.controller instanceof SL.AIController && c.controller.profileOverride.beam === 0 && c.noFlight, 'Cell is holding back: no beams, no flight');
    eq(b.playerLimits && b.playerLimits.up, false, 'and the first exchange is on the ground');
    for (let i = 0; i < 12 && phaseOf(b) === 'goku'; i++) {
      hit(c, g, 1600);
      gg.step(b, 20);
    }
    gg.step(b, 40, skipAll(b));
    ok(b.mission.phaseIndex > pi(SL, 'cell_games', 'goku'), 'dealt damage ends the stretch: now ' + phaseOf(b));
    ok(b.mission.flags.stage1 && b.mission.flags.stage1.dealt >= c.hpMax * 0.12, 'on the damage Goku dealt');
    eq(b.playerLimits, null, 'and the ground-only limit is lifted');
    eq(gg.errors.length, 0, errs(gg));
    b.dispose();
  });

  test('the aerial exchange counts only blows landed with both of them in the air', () => {
    const run = playTo('cell_games', 'air', 'kame', { seed: 7, snapshot: (b) => ({ hits: b.mission.flags.aerialHits, gokuHp: b.story.goku.hpFrac }) });
    ok(run.snap && (run.snap.hits >= 8 || run.snap.gokuHp <= 0.26), 'the stretch ends on aerial hits (or Goku worn down): ' + JSON.stringify(run.snap));
    eq(run.gg.errors.length, 0, errs(run.gg));
  });

  test('the Instant Transmission Kamehameha: a held charge, then point-blank — Cell swallowed by the beam and lost in a column of green vapour (non-graphic: no body cut apart); watched or skipped, the same', () => {
    const snap = (b) => {
      const S = b.story;
      return JSON.stringify({
        charged: !!b.mission.flags.kameCharged,
        pointBlank: !!b.mission.flags.pointBlank,
        cut: !!S.cellCut,
        inSmoke: !!S.cellInSmoke,
        cellHidden: !!S.cell.hidden,
        gokuClose: S.goku.distTo(S.cell) < 3,
      });
    };
    const holds = [];
    const w = playTo('cell_games', 'kame', 'regrow', { watch: true, snapshot: snap, onBattle: (b) => b.on('prompt', (e) => e.show && e.required && holds.push(e.action)) });
    const s = playTo('cell_games', 'kame', 'regrow', { snapshot: snap });
    ok(w.snap, 'the watched run reaches the regrowth');
    const o = JSON.parse(w.snap);
    ok(o.charged && o.pointBlank, 'charged and fired point-blank: ' + w.snap);
    ok(!o.cut && o.inSmoke && o.cellHidden, 'swallowed: nothing cut apart, Cell hidden inside the vapour until he regrows');
    ok(holds.includes('charge'), 'the charge is the player\'s to hold: ' + holds.join(','));
    eq(s.snap, w.snap, 'skipped leaves exactly the same state');
    eq(w.gg.errors.length + s.gg.errors.length, 0, 'no engine errors');
  });

  test('the regrowth and the forfeit: Cell whole again, a Senzu Bean for the enemy, Goku back in base form lying against his rock on the ridge', () => {
    const run = playTo('cell_games', 'regrow', null);
    const { r, b } = run;
    const S = b.story, f = b.mission.flags, CK = run.SL.data.cellKit;
    eq(r.state, 'success', 'the mission completes');
    ok(f.regrown && f.forfeit && f.senzuToCell, 'regrown, forfeit and the bean: ' + JSON.stringify(f));
    ok(!S.cellCut && !S.cell.hidden && S.cell.alive, 'Cell stands whole');
    eq(S.goku.form.id, 'base', 'Goku in base form');
    eq(S.goku.anim.name, 'lieBackRock', 'lying back against the rock');
    ok(Math.hypot(S.goku.pos.x - CK.LIE_AT.x, S.goku.pos.z - CK.LIE_AT.z) < 0.5, 'at his spot on the ridge');
    eq(run.gg.errors.length, 0, errs(run.gg));
  });

  test('the bed scene: "The Fever" puts Goku in a bed with the heart virus and Chi-Chi beside him, in a room built for it — watched or skipped, the same', () => {
    const run = (skip) => {
      const gg = H.create({ quiet: true, seed: 2 });
      const { SL } = gg;
      const def = SL.data.missions.android_fever;
      eq(def.stage, 'son_house', 'on the interior stage');
      ok(SL.data.stages.son_house.storyOnly, 'which never appears in Free Battle');
      const b = gg.mission('android_fever');
      let atEnd = null, frames = 0;
      b.on('sceneEnd', (e) => {
        if (e.id !== 'goku_bed') return;
        const g = b.story.goku, c = b.story.chichi, L = b.stage.landmarks;
        atEnd = {
          gokuPose: g.state === 'scripted' ? g.anim.name : g.state,
          gokuOnBed: Math.abs(g.pos.y - L.bed.y) < 0.05 && Math.abs(g.pos.z - L.bed.z) < 1.2,
          chichiPose: c.anim.name,
          chichiAtStool: Math.hypot(c.pos.x - L.stool.x, c.pos.z - L.stool.z) < 0.05,
          flag: !!b.mission.flags.feverScene,
          skipped: e.skipped,
        };
      });
      gg.until(b, () => b.mission.state !== 'running', 60 * 90, () => {
        frames++;
        if (skip && b.inputLocked) b.skipRequested = true;
      });
      const out = Object.assign({ state: b.mission.state, frames, errors: gg.errors.length, chichi: SL.data.characters.chichi }, atEnd || {});
      b.dispose();
      return out;
    };
    const watched = run(false);
    const skipped = run(true);
    eq(watched.state, 'success', 'the mission completes');
    eq(watched.gokuPose, 'lieFever', 'Goku lies in bed with the fever');
    ok(watched.gokuOnBed, 'on the bed');
    eq(watched.chichiPose, 'cc_bedside', 'Chi-Chi sits at his bedside');
    ok(watched.chichiAtStool, 'on the stool');
    for (const k of ['gokuPose', 'gokuOnBed', 'chichiPose', 'chichiAtStool', 'flag', 'state']) eq(skipped[k], watched[k], 'skipped matches watched: ' + k);
    ok(watched.frames > 60 * 25, 'and it is allowed to breathe: ' + (watched.frames / 60).toFixed(1) + ' s watched');
    ok(skipped.frames < watched.frames, 'skipping is faster');
    eq(watched.chichi.assetLevel, 1, 'Chi-Chi is a level 1 prototype');
    eq(watched.errors + skipped.errors, 0, 'no engine errors');
  });

  test('Gohan\'s turn: base form first and holding his own; pushed, his own Super Saiyan (not his father\'s hair, not the second form\'s); then he holds back', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('cell_gohan', { startPhase: pi(SL, 'cell_gohan', 'test') });
    gg.step(b, 30, skipAll(b));
    const S = b.story, gh = S.gohan, c = S.cell;
    eq(b.player, gh, 'the player has Gohan');
    eq(gh.form.id, 'base', 'in base form');
    ok(gh.lockedForms && gh.lockedForms.ssj && gh.lockedForms.ssj2, 'with both forms locked by the story');
    ok(gh.damageDealtMul < 0.6, 'hitting like a boy who does not want to: x' + gh.damageDealtMul);
    eq(c.infiniteHp, true, 'Cell is only testing');
    ok(S.goku.untargetable && S.goku.anim.name === 'lieBackRock', 'Goku lies against his rock on the ridge');
    let transformed = 0;
    b.on('transformCinematic', () => transformed++);
    gg.until(b, () => phaseOf(b) === 'hold' && !b.inputLocked, 60 * 120, () => {
      if (b.inputLocked) b.skipRequested = true;
      else if (phaseOf(b) === 'test' && b.frame % 20 === 0) hit(gh, c, 1400);
    });
    eq(gh.form.id, 'ssj', 'he comes out of it a Super Saiyan');
    ok(transformed >= 1, 'through the staged transformation');
    ok(b.mission.flags.gohanSsj, 'and the story knows it');
    const hair = gh.form.look && gh.form.look.hair && gh.form.look.hair.style;
    eq(hair, 'gohan_teen_ssj', 'his own hair in gold');
    const goku = SL.data.characters.goku.forms.find((f) => f.id === 'ssj');
    ok(hair !== goku.look.hair.style && hair !== 'gohan_ssj2', 'not his father\'s shape and not the canopy of the second form');
    ok(gh.lockedForms.ssj2, 'the second form is still locked');
    eq(gg.errors.length, 0, errs(gg));
    b.dispose();
  });

  test('Cell reads the fight while Gohan holds back: he notices a change of form, registers counters, and backs off to regenerate when hurt', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, THREE } = gg;
    const b = gg.mission('cell_gohan', { startPhase: pi(SL, 'cell_gohan', 'hold') });
    const seen = [];
    b.on('cellAdapts', (e) => seen.push(e.reason));
    gg.until(b, () => !b.inputLocked, 60 * 30, skipAll(b));
    gg.step(b, 10);
    const S = b.story, gh = S.gohan, c = S.cell;
    eq(c.controller.profileOverride.hooks, 'cell', 'Cell runs on the adaptive hook in this stretch');
    gh.controller = { update: () => SL.emptyIntent() };
    SL.data.cellKit.toForm(gh, 'base');
    gg.step(b, 30);
    ok(seen.includes('form'), 'he reacts to the change of form: ' + seen.join(','));
    c.infiniteHp = false;
    c.hp = Math.round(c.hpMax * 0.55);
    gh.setPosition(c.pos.clone().add(new THREE.Vector3(0, 0, 12)));
    gh.grounded = true;
    const d0 = gh.distTo(c);
    gg.step(b, 90);
    ok(seen.includes('regen'), 'and backs off to regenerate: ' + seen.join(','));
    ok(gh.distTo(c) > d0 - 0.5, 'by keeping his distance: ' + d0.toFixed(1) + ' -> ' + gh.distTo(c).toFixed(1));
    const ai = c.controller;
    ai.cellCountered = 1;
    gh.state = 'attack';
    gh.sd = { counter: true };
    ai.hooks().pre(ai, c, gh, 3, null, SL.emptyIntent());
    ok(seen.includes('countered') && ai.cellCountered === 2, 'counters register: ' + seen.join(','));
    eq(gg.errors.length, 0, errs(gg));
    b.dispose();
  });

  test('the Cell Juniors against the Z Fighters: seven, at most two on Gohan at once and rotating, never a dogpile, never killed while he holds back; his friends really are beaten', () => {
    for (const seed of [6, 1]) {
      const gg = H.create({ quiet: true, seed });
      const { SL } = gg;
      const b = gg.mission('cell_gohan', { startPhase: pi(SL, 'cell_gohan', 'juniors') });
      gg.until(b, () => !b.inputLocked, 60 * 30, skipAll(b));
      gg.step(b, 20);
      const S = b.story, gh = S.gohan, juniors = S.juniors;
      eq(juniors.length, 7, 'seven Juniors');
      ok(juniors.every((j) => j.alive && !j.hidden && j.controller instanceof SL.AIController && j.cannotDie), 'all alive, fighting, and not to be killed yet');
      ok(juniors.every((j) => j.def.ai.hooks === 'cell_junior'), 'on the squad hook');
      const allies = ['piccolo', 'vegeta', 'trunks', 'krillin', 'tien', 'yamcha', 'goku'].map((k) => S[k]);
      ok(allies.every((a) => !a.untargetable && a.controller instanceof SL.AIController), 'the Z Fighters fight for real (Goku too)');
      // a player who only guards: the worst case for dogpiling (Known Bugs #36 broke on seeds 1 and 6)
      gh.controller = { update: () => Object.assign(SL.emptyIntent(), { guard: b.frame % 90 < 60 }) };
      let maxOnPlayer = 0, maxOnAlly = 0, alliesHurt = 0, chain = 0, longest = 0, lastHit = -999, maxDistinct = 0;
      const pressure = new Set(), roles = new Set(), recent = [];
      b.on('squadRole', (e) => {
        roles.add(e.role);
        if (e.role === 'pressure') pressure.add(e.fighter);
      });
      b.on('damage', (e) => {
        if (e.blocked) return;
        if (allies.includes(e.target) && juniors.includes(e.attacker)) alliesHurt++;
        if (e.target === gh && juniors.includes(e.attacker)) {
          recent.push([b.frame, e.attacker]);
          chain = b.frame - lastHit < 45 ? chain + 1 : 1;
          lastHit = b.frame;
          longest = Math.max(longest, chain);
        }
      });
      const pj = pi(SL, 'cell_gohan', 'juniors');
      gg.step(b, 60 * 20, () => {
        if (b.mission.phaseIndex !== pj) return;
        maxOnPlayer = Math.max(maxOnPlayer, juniors.filter((j) => j.alive && j.target === gh && j.state === 'attack').length);
        for (const a of allies) if (!a.untargetable) maxOnAlly = Math.max(maxOnAlly, juniors.filter((j) => j.alive && j.target === a && j.state === 'attack').length);
        while (recent.length && b.frame - recent[0][0] > 120) recent.shift();
        maxDistinct = Math.max(maxDistinct, new Set(recent.map((r) => r[1])).size);
      });
      ok(maxOnPlayer <= 2, 'seed ' + seed + ': never more than two Juniors in melee on Gohan at once: ' + maxOnPlayer);
      ok(maxOnAlly <= 2, 'never more than two on any one friend: ' + maxOnAlly);
      ok(maxDistinct <= 4, 'at most four different Juniors land hits on him in any two seconds: ' + maxDistinct);
      ok(longest <= 30, 'no endless hit chain: ' + longest);
      ok(roles.has('pressure') && roles.has('ally'), 'the squad splits into roles: ' + [...roles].join(','));
      ok(pressure.size > 2, 'and the pressure rotates: ' + pressure.size + ' Juniors took a turn');
      ok(alliesHurt > 10, 'the Juniors are beating his friends: ' + alliesHurt + ' hits');
      ok(juniors.every((j) => j.alive), 'no Junior has died yet');
      eq(gg.errors.length, 0, errs(gg));
      b.dispose();
    }
    // a fighter the squad has not given a role is never limited, however many are swinging
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'goku', p2: 'saibaman' });
    const p = b.player, s = b.fighters[1];
    for (let i = 0; i < 3; i++) {
      const o = b.spawn({ charId: 'saibaman', team: 1, pos: p.pos.clone().add(new gg.ctx.THREE.Vector3(i + 1, 0, 1)) });
      o.target = p;
      o.setState('attack', { move: o.moveSet.light[0], kind: 'light', hit: false, hitSet: new Set(), startup: 3, bonus: 1, whiffPenalty: 0, window: -1, victim: p });
    }
    s.target = p;
    eq(b.squadMeleeFull(s, p), false, 'Saibamen are not a squad: no cap');
    ok(s._startAttack(s.moveSet.light[0], 'light', 0), 'and their swings start');
    b.dispose();
  });

  test('the rage state on the face: tears, then the shadow — and no red line drawn over his eyes (the line is the screen\'s); composes with forms and the torn gi', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'teen_gohan', p2: 'cell' });
    const gh = b.player;
    const events = [];
    b.on('rageState', (e) => events.push(e.amount));
    gh.setRage(true, 0.3);
    let r = gh.model._rage;
    ok(r.group.visible && r.tears.every((t) => t.visible), 'at 0.3 the tears are there');
    ok(!r.shadow.visible, 'but not the shadow yet');
    gh.setRage(true, 0.55);
    ok(r.shadow.visible, 'at 0.55 the shadow gathers');
    gh.setRage(true, 1);
    let lines = 0;
    r.group.traverse((o) => {
      if (o.material && o.material.color && o.material.color.r > 0.7 && o.material.color.g < 0.2 && o.material.color.b < 0.3) lines++;
    });
    eq(lines, 0, 'at full rage there is nothing red on the face');
    eq(r.line, undefined, 'and no line piece at all');
    gh.setTorn(true);
    gh.applyForm(2);
    r = gh.model._rage;
    ok(gh.raged && r.group.visible && r.shadow.visible, 'it survives the Super Saiyan 2 change');
    ok(gh.torn, 'and so does the torn gi');
    gh.setRage(false);
    ok(!gh.model._rage.group.visible && !gh.raged, 'and it comes off');
    eq(events.join(','), '0.3,0.55,1,0', 'each step is announced');
    // the red line is a screen effect, and the scene that needs it clears it
    ok(typeof gg.SL.ScreenFX.redLine === 'function', 'ScreenFX.redLine exists');
    eq(gg.errors.length, 0, 'engine errors');
    b.dispose();
  });

  test('Android 16\'s death and Super Saiyan 2: silence, the boot (non-graphic: the camera on Gohan\'s face, nothing crushed on screen), the pupils, the red line across the screen snapping, the tears, the roar — and watched or skipped, the same Gohan after', () => {
    const { SL } = H.create({ quiet: true, seed: 1 });
    const sc = SL.data.scenes.gh_sixteen;
    eq(sc.music && sc.music.song, null, 'the music stops');
    const src = sc.events.map((e) => [e.call, e.tick].filter(Boolean).map((f) => f.toString()).join(' ') + (e.pose ? JSON.stringify(e.pose) : '')).map((s, i) => [i, s]);
    const at = (re) => (src.find(([, s]) => re.test(s)) || [-1])[0];
    const boot = at(/cl_stompDown/), pupils = at(/setPupilScale\(0\.35\)/), line = at(/rl\.line/), snap = at(/rl\.snap/), roar = at(/setRage\(true, 1\)/);
    ok(boot >= 0 && pupils > boot && line > pupils && snap > line && roar > snap, 'boot → pupils → red line → snap → roar: ' + [boot, pupils, line, snap, roar].join(','));
    // non-graphic (owner, 2026-10-14): when the boot lands the camera is on Gohan's face, and the head is hidden, never flattened
    const bootCam = sc.events[boot].cam;
    ok(bootCam && /^gohan:face$/.test(bootCam.from.at), 'the boot lands on Gohan\'s face, not on the head');
    const all = [SL.data.scenes.gh_sixteen, SL.data.scenes.gh_crush].map((s2) => s2.events.concat([{ call: s2.end }]).map((e) => [e.call, e.tick].filter(Boolean).map((f) => f.toString()).join(' ') + JSON.stringify(e.sfx || '')).join(' ')).join(' ');
    ok(!/boneCrack/.test(all), 'no bone-crack sounds');
    ok(!/scale\.set\(1\.5, 0\.22/.test(all), 'the head is not shown crushed');
    ok(!/dice\(/.test(all), 'no body pieces');
    ok(sc.events.some((e) => !e.say && (e.hold || 0) >= 1.5 && e.cam && (e.cam.fov || 99) <= 32), 'a silent close-up on his face');
    const run = (watch) =>
      playTo('cell_gohan', 'sixteen', 'after', {
        seed: 4,
        watch,
        snapshot: (b) => {
          const S = b.story, gh = S.gohan;
          return JSON.stringify({
            a16: !!S.a16._gone,
            form: gh.form.id,
            locked: Object.keys(gh.lockedForms || {}).filter((k) => gh.lockedForms[k]),
            raged: gh.rageAmount,
            idleIsStance: gh.anim.poses.idle === gh.form.poses.idle,
            light: gh.moveSet.light.map((x) => x.id),
            s1: gh.specFor('special1').name,
            flags: ['sixteenGone', 'ascended'].map((k) => !!b.mission.flags[k]),
          });
        },
      });
    const w = run(true), s = run(false);
    ok(w.snap, 'the watched run reaches the reveal');
    const o = JSON.parse(w.snap);
    ok(o.a16, '16 is gone');
    eq(o.form, 'ssj2', 'Super Saiyan 2');
    eq(o.locked.length, 0, 'the story unlocked it');
    ok(o.idleIsStance, 'a different stance');
    ok(o.light.every((id) => id.startsWith('tg2')), 'different strikes: ' + o.light.join(','));
    eq(o.s1, 'Super Kamehameha', 'a stronger Kamehameha');
    eq(o.raged, 1, 'wearing the rage');
    ok(o.flags.every(Boolean), 'the story flags: ' + o.flags.join(','));
    eq(s.snap, w.snap, 'skipped: exactly the same');
    ok(s.r.frames < w.r.frames, 'skip is faster');
    eq(w.gg.errors.length + s.gg.errors.length, 0, 'no engine errors');
  });

  test('Super Saiyan 2 as a gameplay identity: stance, strikes, counters, specials, AI personality, lightning, hair — and back again when he leaves the form', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const t = SL.data.characters.teen_gohan;
    const f1 = t.forms.find((x) => x.id === 'ssj'), f2 = t.forms.find((x) => x.id === 'ssj2');
    eq(JSON.stringify(SL.Schema.validateCharacter(t)), '[]', 'Gohan still validates');
    ok(f2.poses && f2.poses.idle, 'own stance');
    ok(f2.moves && f2.moves.counter && f2.moves.counter.light && f2.moves.counter.heavy, 'own Perfect-Guard counters');
    ok(f2.moves.dash.teleport, 'a dash that ends behind the target');
    eq(f2.specials.special2.type, 'rush', 'a signature rush');
    ok(f2.aura.lightning, 'lightning in the aura during play, not just in the cinematic');
    ok(f2.aura.idle > f1.aura.idle, 'a bigger idle aura than the first form: ' + f1.aura.idle + ' -> ' + f2.aura.idle);
    ok(f2.ai && f2.ai.personality === 'aggressive', 'a different AI personality');
    ok(f2.intro && f2.victory, 'its own intro and victory');
    ok(f1.look.hair.style !== f2.look.hair.style, 'the two forms have different hair: ' + f1.look.hair.style + ' / ' + f2.look.hair.style);
    const h1 = SL.data.hair[f1.look.hair.style], h2 = SL.data.hair[f2.look.hair.style];
    ok(h2.spikes.length !== h1.spikes.length || JSON.stringify(h2.spikes) !== JSON.stringify(h1.spikes), 'and different shapes, not a recolour');
    const b = gg.battle({ p1: 'cell', p2: 'teen_gohan', distance: 4 });
    const gh = b.fighters[1];
    gh.controller = new SL.AIController(b, { difficulty: 'normal' });
    gg.step(b, 30);
    const baseAggr = gh.controller.p.aggression;
    gh.applyForm(2);
    gg.step(b, 30);
    ok(gh.controller.p.aggression > baseAggr && gh.controller.p.personality === 'aggressive', 'the CPU fights differently in the form: ' + baseAggr + ' -> ' + gh.controller.p.aggression);
    eq(gh.anim.poses.idle, f2.poses.idle, 'and stands differently');
    gh.applyForm(0);
    gg.step(b, 10);
    eq(gh.controller.p.personality, t.ai.personality, 'leaving the form puts his own profile back');
    eq(gh.anim.poses.idle, gh.poses.idle, 'and his own stance');
    eq(gg.errors.length, 0, errs(gg));
    b.dispose();
  });

  test('the Juniors executed one by one, on camera and in the owner\'s order; between the kills their blows do nothing at all', () => {
    const kinds = [], toGohan = [];
    let noSells = 0;
    const run = playTo('cell_rampage', 'rampage', 'catch', {
      seed: 5,
      maxSeconds: 300,
      onBattle: (b) => {
        b.on('juniorExecuted', (e) => kinds.push(e.kind));
        b.on('noSell', (e) => e.fighter === b.story.gohan && noSells++);
        b.on('damage', (e) => {
          if (e.target === b.story.gohan && b.story.juniors && b.story.juniors.includes(e.attacker)) toGohan.push(e.amount);
        });
      },
      snapshot: (b) => ({ kills: b.story.rampage.kills, gone: b.story.juniors.filter((j) => j._gone && j.hidden).length, flags: b.mission.flags }),
    });
    ok(run.snap, 'the stretch ends');
    eq(run.snap.kills, 7, 'seven executions');
    eq(run.snap.gone, 7, 'and seven Juniors gone');
    eq(kinds.join(','), run.SL.data.cellRampage.ORDER.join(','), 'chop, slice, the double strike, the slam, the flash, the dust — in order');
    ok(run.snap.flags.juniorsDestroyed, 'the after-scene played');
    ok(noSells > 0, 'their blows landed on him: ' + noSells);
    eq(toGohan.filter((a) => a > 0).length, 0, 'and did nothing at all');
    eq(run.gg.errors.length, 0, errs(run.gg));
    // non-graphic (owner, 2026-10-14): each kill ends at the decisive blow in light — nothing is cut apart on screen
    const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'data', 'missions', 'cell_rampage.js'), 'utf8');
    const X = src.slice(src.indexOf('const X = {};'), src.indexOf('const P = {};'));
    ok(!/CK\.split|dice\(|'junior'/.test(X), 'no split bodies, no fragments, no blue-liquid bursts in the executions');
    ok((X.match(/'energy'/g) || []).length >= 6, 'every execution ends in light');
  });

  test('the catch, the gut punch and 18: semi-perfect again; nothing Cell throws registers on the boy; then he swells', () => {
    let atToyed = null, cellOnGohan = 0, noSells = 0;
    const run = playTo('cell_rampage', 'catch', null, {
      onBattle: (b) =>
        b.on('missionPhase', (e) => {
          if (e.phase.id !== 'toyed' || atToyed) return;
          const S = b.story;
          atToyed = { form: S.cell.form.id, a18: !S.a18.hidden && !!S.a18._down, spat: !!b.mission.flags.spat };
          b.on('damage', (d) => d.target === S.gohan && d.attacker === S.cell && (cellOnGohan += d.amount));
          b.on('noSell', (d) => d.fighter === S.gohan && noSells++);
        }),
    });
    ok(atToyed, 'the toyed stretch is reached');
    eq(atToyed.form, 'semi_perfect', 'Cell melts back into the semi-perfect form');
    ok(atToyed.a18 && atToyed.spat, 'and 18 lies on the ring where he threw her up');
    eq(run.r.state, 'success', 'the mission completes');
    ok(run.b.mission.flags.swelling, 'on the swelling');
    ok(cellOnGohan <= run.b.story.gohan.hpMax * 0.08, 'Cell barely scratches him: ' + Math.round(cellOnGohan));
    eq(run.gg.errors.length, 0, errs(run.gg));
  });

  test('Goodbye, Gohan: the bloated Cell, the farewell on a cue, King Kai\'s planet and back — the camera never inside the balloon', () => {
    const stages = [], cues = [];
    let worst = 99, maxR = 0;
    const run = playTo('cell_goodbye', null, null, {
      watch: true,
      onBattle: (b) => {
        b.on('stageChanged', (e) => stages.push(e.id));
        b.on('cue', (e) => cues.push(e.key));
        // measured after the camera update: the lens that is actually rendered that frame
        const cu = b.camera.update.bind(b.camera);
        b.camera.update = (...a) => {
          const out = cu(...a);
          const g = b.story.balloon && b.story.balloon.group;
          if (g && g.visible && g.parent && b.camera.inShot) {
            maxR = Math.max(maxR, g.scale.x);
            worst = Math.min(worst, b.camera.pos.distanceTo(g.position) - g.scale.x);
          }
          return out;
        };
      },
    });
    const f = run.b.mission.flags;
    eq(run.r.state, 'success', 'the mission completes');
    ok(f.bloated && f.transmitted && f.sacrificed && f.silence, 'bloat, Instant Transmission, the supernova, the silence: ' + JSON.stringify(f));
    eq(stages.join(','), 'kingkai,cellarena', 'to King Kai\'s planet and back');
    ok(cues.length >= 1, 'the Instant Transmission is the player\'s cue: ' + cues.join(','));
    ok(maxR <= 1.5, 'the balloon stays a body, not a building: ' + maxR.toFixed(2));
    ok(worst > 0.2, 'the camera never inside it: closest ' + worst.toFixed(2) + ' m from the skin');
    eq(run.gg.errors.length, 0, errs(run.gg));
  });

  test('the Father-Son Kamehameha is played: the clash, Goku\'s voice when pushed back, the Z Fighters, Vegeta\'s blast, and Cell dies to the beam that connects', () => {
    const order = [], kos = [];
    let clashWinner = null;
    const run = playTo('cell_fatherson', 'beam', 'end', {
      maxSeconds: 200,
      onBattle: (b) => {
        b.on('clashEnd', (e) => e.winner && (clashWinner = e.winner.def.id));
        b.on('ko', (e) => kos.push(e.fighter.def.id));
        b.onTick(() => {
          for (const k of ['fskVoice', 'fskZ', 'fskVegeta']) if (b.mission.flags[k] && !order.includes(k)) order.push(k);
          return true;
        });
      },
      snapshot: (b) => ({ flags: Object.assign({}, b.mission.flags), maxSeconds: b.clash.maxSeconds }),
    });
    ok(run.snap, 'the stretch ran');
    const f = run.snap.flags;
    ok(f.fskClashes >= 1, 'the beams met: ' + f.fskClashes);
    eq(order.join(','), 'fskVoice,fskZ,fskVegeta', 'the story beats come from the struggle, in order');
    eq(clashWinner, 'teen_gohan', 'Gohan wins the clash');
    ok(f.cellBeaten && f.finishedWithBeam, 'with the beam');
    eq(run.snap.maxSeconds, 7, 'the long story clash is put back to normal');
    eq(run.gg.errors.length, 0, errs(run.gg));
  });

  test('the Father-Son Kamehameha cannot be spent early: not in the slot before the last stand, locked while Cell only charges, staged from the checkpoint, and a lost struggle puts him back on his spot', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    for (const [mission, id] of [['cell_chamber', 'master'], ['cell_gohan', 'hold'], ['cell_rampage', 'rampage'], ['cell_rampage', 'toyed']]) {
      const b = gg.mission(mission, { startPhase: pi(SL, mission, id) });
      gg.until(b, () => b.player === b.story.gohan && !b.inputLocked, 60 * 60, skipAll(b));
      gg.step(b, 5);
      const ult = b.story.gohan.specFor('ultimate');
      ok(ult && ult.id !== 'fatherSon' && !/Father/i.test(ult.name), id + ': the ultimate is not the Father-Son Kamehameha (' + (ult && ult.name) + ')');
      b.dispose();
    }
    const b = gg.mission('cell_fatherson', { startPhase: pi(SL, 'cell_fatherson', 'beam') });
    gg.until(b, () => b.player === b.story.gohan && !b.inputLocked, 60 * 60, skipAll(b));
    const S = b.story, gh = S.gohan, c = S.cell, ring = b.stage.heightAt(0, 9);
    eq(gh.form.id, 'ssj2', 'Super Saiyan 2');
    ok(gh.torn && gh.raged, 'torn gi and rage');
    ok(Math.abs(gh.pos.z - 9) < 0.3 && Math.abs(gh.pos.y - ring) < 0.3, 'on his spot on the ring');
    ok(c.form.id === 'perfect' && !c.hidden && c.pos.y > ring + 3, 'Cell above the ring');
    ok(S.goku.intangible && S.goku.untargetable && S.spiritOn, 'his father at his back as a spirit, not a fighter');
    let chargeFrames = 0, early = 0, opened = false;
    gg.until(b, () => {
      if (c.state === 'beamCharge' && !b.clash.active && !['beamCharge', 'beamFire', 'clash'].includes(gh.state)) {
        chargeFrames++;
        if (!gh.lockedSlots.ultimate) early++;
        gh.ki = gh.kiMax;
        if (gh._trySpecial('ultimate')) early++;
      }
      if (c.state === 'beamFire' && !gh.lockedSlots.ultimate) opened = true;
      return opened;
    }, 60 * 30);
    ok(chargeFrames > 20, 'Cell charged for a while: ' + chargeFrames + ' frames');
    eq(early, 0, 'Gohan could not answer before the beam was out');
    ok(opened, 'and could once it was');
    b.dispose();
    const b2 = gg.mission('cell_fatherson', { startPhase: pi(SL, 'cell_fatherson', 'beam') });
    gg.until(b2, () => b2.player === b2.story.gohan && !b2.inputLocked, 60 * 60, skipAll(b2));
    gg.step(b2, 5);
    const g2 = b2.story.gohan;
    g2.setPosition(g2.pos.clone().set(0, b2.stage.heightAt(0, 30), 30));
    g2.setState('free');
    ok(b2.story.cell.state !== 'beamFire', 'Cell is not firing yet');
    gg.step(b2, 3);
    ok(Math.abs(g2.pos.z - 9) < 0.5 && Math.abs(g2.pos.y - b2.stage.heightAt(0, 9)) < 0.5, 'back on his spot: ' + g2.pos.toArray().map((v) => v.toFixed(1)).join(','));
    b2.dispose();
    eq(gg.errors.length, 0, errs(gg));
  });

  test('every checkpoint in the chain restores the story it belongs to: the right hero and form, the player driving, Cell\'s form and a fresh brain, who has fallen, no leftover limits', () => {
    const gg = H.create({ quiet: true, seed: 8 });
    const { SL } = gg;
    const expect = [
      ['cell_chamber', 'spar', { hero: 'teen_gohan', form: 'base' }],
      ['cell_chamber', 'master', { hero: 'teen_gohan', form: 'ssj' }],
      ['cell_games', 'goku', { hero: 'goku', form: 'ssj', cell: 'perfect', a16: true }],
      ['cell_games', 'air', { hero: 'goku', form: 'ssj', cell: 'perfect', a16: true }],
      ['cell_gohan', 'test', { hero: 'teen_gohan', form: 'base', cell: 'perfect', a16: true }],
      ['cell_gohan', 'hold', { hero: 'teen_gohan', form: 'ssj', cell: 'perfect', a16: true }],
      ['cell_gohan', 'juniors', { hero: 'teen_gohan', form: 'ssj', cell: 'perfect', a16: false }],
      ['cell_rampage', 'rampage', { hero: 'teen_gohan', form: 'ssj2', cell: 'perfect', a16: false, rage: true }],
      ['cell_rampage', 'toyed', { hero: 'teen_gohan', form: 'ssj2', cell: 'semi_perfect', a16: false, rage: true }],
      ['cell_fatherson', 'beam', { hero: 'teen_gohan', form: 'ssj2', cell: 'perfect', a16: false, rage: true, torn: true }],
      ['cell_future', 'eighteen', { hero: 'future_trunks', form: 'ssj' }],
      ['cell_future', 'seventeen', { hero: 'future_trunks', form: 'ssj' }],
      ['cell_future', 'cell', { hero: 'future_trunks', form: 'ssj', cell: 'base' }],
    ];
    const brains = new Set();
    for (const [mission, id, want] of expect) {
      const b = gg.mission(mission, { startPhase: pi(SL, mission, id) });
      gg.until(b, () => !b.inputLocked, 60 * 90, skipAll(b));
      gg.step(b, 10);
      const S = b.story, p = b.player, tag = mission + '.' + id;
      eq(phaseOf(b), id, tag + ': resumes in its own stretch');
      eq(p.def.id, want.hero, tag + ': hero');
      ok(p.controller instanceof SL.PlayerController, tag + ': the player drives the hero');
      eq(p.form.id, want.form, tag + ': hero form');
      if (want.cell) {
        eq(S.cell.form.id, want.cell, tag + ': Cell form');
        ok(!brains.has(S.cell.controller), tag + ': Cell has a fresh brain');
        brains.add(S.cell.controller);
      }
      if (want.a16 !== undefined) eq(!S.a16._gone, want.a16, tag + ': Android 16 ' + (want.a16 ? 'there' : 'gone'));
      if (want.rage) ok(p.raged && p.rageAmount === 1, tag + ': wearing the rage');
      if (want.torn) ok(p.torn, tag + ': in the torn gi');
      if (id !== 'goku') eq(b.playerLimits, null, tag + ': no leftover input limits');
      b.dispose();
    }
    eq(gg.errors.length, 0, errs(gg));
  });

  test('a bot plays every mission of the chain to the end: every phase in order, every beat recorded, no engine errors', () => {
    const flags = {
      cell_chamber: [],
      cell_games: ['arrived', 'satanFlicked', 'stage1', 'aerialHits', 'kameCharged', 'pointBlank', 'regrown', 'forfeit', 'senzuToCell'],
      cell_gohan: ['gohanEntered', 'gohanBaseHits', 'gohanSsj', 'gohanHeld', 'sixteenBroken', 'juniorsBorn', 'alliesBeaten', 'sixteenGone', 'ascended', 'revealed'],
      cell_rampage: ['executions', 'juniorsDestroyed', 'spat', 'swelling'],
      cell_goodbye: ['bloated', 'transmitted', 'sacrificed', 'silence'],
      cell_fatherson: ['trunksKilled', 'armBroken', 'despair', 'fskVoiceHeard', 'fskClashes', 'cellBeaten', 'finishedWithBeam', 'cellGone', 'cellSagaEnd'],
      cell_future: ['cityReached', 'noSell_android_18', 'eighteenGone', 'seventeenGone', 'ambush', 'futureCellGone', 'futureSaved'],
    };
    for (const id of CHAIN) {
      const gg = H.create({ quiet: true, seed: 5 });
      const r = gg.playMission(id, { style: 'reader', maxSeconds: 900 });
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(r.state, 'success', id + ' (' + r.seconds.toFixed(0) + ' s)');
      eq([...new Set(phases)].join(','), gg.SL.data.missions[id].phases.map((p) => p.id).join(','), id + ': every phase, in order');
      for (const k of flags[id]) ok(r.m.flags[k], id + ': flag ' + k);
      if (id === 'cell_chamber') ok(!r.b.story.gohan.lockedForms.ssj, 'the Super Saiyan is his after the Room');
      if (id === 'cell_fatherson') ok(!r.b.story.cell.alive || r.b.story.cell.hidden, 'Cell is gone');
      eq(gg.errors.length, 0, id + ': ' + errs(gg));
    }
  });

  test('engine: Battle.on returns an unsubscribe, and a story clash can run longer than seven seconds without changing free battles', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    let n = 0;
    const off = b.on('ping', () => n++);
    b.emit('ping', {});
    off();
    b.emit('ping', {});
    eq(n, 1, 'unsubscribed listeners stop hearing events');
    eq(b.clash.maxSeconds, 7, 'free battle clashes resolve at seven seconds by default');
    b.dispose();
  });

  test('bomberWave pressed from a technique slot costs its ki and starts its cooldown (Android 17\'s Energy Field used to be free)', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const b = gg.battle({ p1: 'android_17', p2: 'goku', dummy: 'idle' });
    const a = b.player;
    a.ki = a.kiMax;
    const sp = a.specFor('special2');
    eq(sp.type, 'bomberWave', 'Energy Field is a bomberWave');
    ok(a._trySpecial('special2'), 'it starts');
    ok(a.ki <= a.kiMax - sp.kiCost + 0.01, 'it cost ' + sp.kiCost + ' ki: ' + a.ki.toFixed(1));
    eq(a.cooldowns.special2, sp.cooldown, 'the cooldown started');
    gg.step(b, 80);
    a.ki = a.kiMax;
    eq(a._trySpecial('special2'), false, 'not again until the cooldown is over');
    b.dispose();
  });
};
