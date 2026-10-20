// Kid Buu (2026-10-02, the owner's Buu Saga brief, priority 11): the original Buu, the Earth destroyed
// as a stage state, the Sacred World of the Kai, Super Saiyan 3 as a draining resource, Vegeta's
// one minute as a real countdown and Good Buu as a playable interruption. Behaviour on the real
// engine, headless.
const H = require('./headless');

module.exports = function buuKidTests({ test, eq, ok }) {
  console.log('\nKid Buu: Pure Evil and Number One (headless)');

  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;

  test('Kid Buu is a body of his own: a child\'s size, black eyes with red irises, his own poses, wild AI and the Majin body', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const D = gg.SL.data.characters;
    const k = D.kid_buu;
    ok(k, 'the character exists');
    ok(k.appearance.height < D.goku.appearance.height && k.appearance.height < D.majin_buu.appearance.height, 'smaller than Goku and than the fat one');
    eq(k.appearance.face.sclera, 0x141418, 'black sclera');
    eq(k.appearance.face.pupil, 0xc01830, 'red irises');
    ok(['kb_idle', 'kb_tell', 'kb_scream', 'kb_burstUp', 'kb_laugh', 'kb_mouth'].every((p) => k.poses[p]), 'his own poses');
    eq(k.ai.hooks, 'kid_buu', 'his own AI hooks');
    ok(gg.SL.AIHooks.kid_buu && gg.SL.AIHooks.kid_buu.pre, 'and they exist');
    ok(k.majin && k.majin.maxReforms >= 1, 'he grows back');
    // the roster expansion (2026-10-14): a Free Battle fighter once his story is over ("Goodbye, Buu"), not before
    ok(k.playable, 'playable in Free Battle');
    const uk = gg.SL.data.unlocks.find((u) => u.type === 'characters' && u.target === 'kid_buu');
    ok(uk && uk.condition.missionComplete === 'buu_spiritbomb', 'unlocked by "Goodbye, Buu": ' + JSON.stringify(uk && uk.condition));
    ok(!gg.SL.Save.isUnlocked('characters', 'kid_buu'), 'and locked until then');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('unpredictable but readable: every trick (behind, hop, scream) comes after a tell the player can see', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'kid_buu', distance: 5, p1InfiniteHp: true });
    const kid = b.fighters[1];
    kid.controller = new SL.AIController(b, { difficulty: 'hard' });
    const tells = [], tricks = [];
    b.on('kidBuuTell', (e) => e.fighter === kid && tells.push({ frame: b.frame, trick: e.trick }));
    b.on('kidBuuTrick', (e) => e.fighter === kid && tricks.push({ frame: b.frame, trick: e.trick }));
    gg.step(b, 60 * 50);
    ok(tricks.length >= 6, 'he keeps doing it: ' + tricks.length + ' tricks in 50 s');
    eq(new Set(tricks.map((t) => t.trick)).size, 3, 'all three kinds: ' + [...new Set(tricks.map((t) => t.trick))].join(','));
    for (const t of tricks) {
      const tell = tells.filter((x) => x.frame <= t.frame).pop();
      ok(tell && tell.trick === t.trick, 'a ' + t.trick + ' is announced as itself');
      ok(tell && t.frame - tell.frame >= 20, 'with time to read it: ' + (tell ? t.frame - tell.frame : 'none') + ' frames');
    }
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Chapter 14 follows Chapter 13: Pure Evil, then Number One', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    eq(order.indexOf('buu_kidbuu'), order.indexOf('buu_inside') + 1, 'Pure Evil straight after the escape from inside Buu');
    eq(order.indexOf('buu_sacred'), order.indexOf('buu_kidbuu') + 1, 'Number One next');
    eq(order.indexOf('buu_spiritbomb'), order.indexOf('buu_sacred') + 1, 'then Goodbye, Buu');
    const chapters = SL.data.story.chapters;
    const c = chapters.find((x) => x.id === 'buu8');
    eq(c.missions.join(','), 'buu_kidbuu,buu_sacred,buu_spiritbomb', 'the chapter lists all three');
    eq(chapters.indexOf(c), chapters.findIndex((x) => x.id === 'buu7') + 1, 'right after Chapter 13');
    const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
    ok(SL.data.storyLocked('buu_kidbuu', results(['buu_vegito'])), 'locked until Chapter 13 is played');
    ok(!SL.data.storyLocked('buu_kidbuu', results(['buu_inside'])), 'and opens after the escape');
  });

  test('"Pure Evil" plays through: the birth, the Planet Burst, the fetch from the Lookout, and the Earth gone — a world state, not a broken stage', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const order = [];
    let cues = 0;
    const r = gg.playMission('buu_kidbuu', {
      maxSeconds: 400,
      watch: true,
      onBattle: (b) => {
        b.on('missionPhase', () => order.push(phaseOf(b)));
        b.on('cue', () => cues++);
      },
    });
    const f = r.m.flags;
    eq(r.state, 'success', 'mission state');
    eq(order.join(','), 'burst,fetch,boom,after', 'the beats after the birth');
    ok(f.kidBorn && f.planetBurst && f.fetched && f.earthDestroyed, 'born, the ball, the fetch, the Earth gone');
    eq(cues, 2, 'two Instant Transmissions, played');
    eq(SL.Save.data.flags.earthDestroyed, true, 'the world state the next chapters read');
    eq(r.b.stage.def.id, 'rocky_canyon', 'the stage is back after the Lookout');
    ok(!SL.data.stages.rocky_canyon.destroyed && !SL.data.stages.lookout.destroyed, 'the reusable stages are never destroyed');
    ok(!r.b.story.burstOrb, 'the ball is cleaned up');
    eq([...new Set(gg.warnings)].join(' | '), '', 'warnings');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Number One" plays through: Goku\'s round in Super Saiyan 3, Vegeta\'s minute (down, up, the Prince, the comeback), the plan', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const seen = {};
    const r = gg.playMission('buu_sacred', {
      maxSeconds: 900,
      onBattle: (b) => {
        b.on('missionPhase', () => (seen[phaseOf(b)] = seen[phaseOf(b)] || {}));
        // who is fighting, read when each fight hands out its objective (the player is switched by then)
        b.on('objectives', (e) => {
          const id = phaseOf(b), p = b.player, s = seen[id];
          if (!s || s.player || !e.changed || !['apart', 'minute'].includes(e.changed.id)) return;
          Object.assign(s, { player: p.def.id, form: p.form.id, gap: b.story.kid.storyNoSell, target: e.changed.target });
        });
      },
    });
    const f = r.m.flags;
    eq(r.state, 'success', 'mission state');
    eq(Object.keys(seen).join(','), 'goku,ask,minute,numberone,plan,after', 'the beats');
    eq(seen.goku.player + ':' + seen.goku.form, 'goku:ssj3', 'Goku fights in Super Saiyan 3');
    ok(f.gokuRound && (f.gokuRound.aparts >= 1 || f.gokuRound.dry || f.gokuRound.beaten), 'his round ends on a reason: ' + JSON.stringify(f.gokuRound));
    eq(seen.minute.player + ':' + seen.minute.form, 'vegeta:ssj2', 'the minute is Vegeta\'s, in Super Saiyan 2');
    eq(seen.minute.target, 60, 'one real minute');
    ok(seen.minute.gap && seen.minute.gap.from && seen.minute.gap.from[0].def.id === 'vegeta' && seen.minute.gap.mul < 1, 'his blows barely register (the power gap)');
    ok(f.minuteSurvived, 'he holds it');
    // the minute is owned by the story: he always goes down, gets up, says it, and lands the four blows
    ok(f.vegetaDown && f.princeDeclared, 'down, and up again: "The Saiyan Prince... VEGETA!"');
    ok(['floor', 'clock'].includes(f.vegetaDownBy), 'brought down by the fight or by the clock: ' + f.vegetaDownBy);
    ok(f.comeback && typeof f.comeback.pressed === 'number', 'the comeback played');
    ok(f.numberOne && f.spiritBombPlan, 'Number One, the Spirit Bomb plan');
    ok(!f.goodBuuStood, 'Good Buu is not out yet (he comes in "Goodbye, Buu")');
    eq(r.b.stage.def.id, 'kai_world', 'on the Sacred World of the Kai');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Super Saiyan 3 is a resource: it drains ki and runs dry; reading his tricks only counts when the player dodges', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const def = SL.data.missions.buu_sacred;
    const b = gg.mission('buu_sacred', { startPhase: def.phases.findIndex((p) => p.id === 'goku') });
    gg.step(b, 60 * 4);
    const g = b.story.goku;
    eq(g.form.id, 'ssj3', 'the round starts in the third level');
    const ki0 = g.ki;
    gg.step(b, 60 * 3);
    ok(g.ki < ki0 || g.form.id !== 'ssj3', 'it burns: ' + Math.round(ki0) + ' -> ' + Math.round(g.ki));
    // an idle player: beaten down or dry, never "reading" anything
    gg.until(b, () => phaseOf(b) !== 'goku', 60 * 120);
    eq(phaseOf(b), 'ask', 'the round ends by itself');
    const tells = b.mission.objectives.find((o) => o.id === 'tells');
    ok(!tells || (tells.count === 0 && !tells.done), 'nothing read without a dodge: ' + (tells && tells.count));
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('STAGING: a placement on the terrain stands on it, one above it is in the air; impacts reach the ground; the cast benches and hides', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 6, stage: 'wasteland' });
    const g = b.player, v = b.fighters[1];
    const gh = (f) => SL.Staging.groundY(b, f.pos.x, f.pos.z);
    SL.Staging.place(v, new V3(3, gh(v) + 0.3, 0));
    ok(v.grounded && Math.abs(v.pos.y - gh(v)) < 1e-6, 'near the ground: stood on it');
    SL.Staging.place(v, new V3(3, gh(v) + 5, 0));
    ok(!v.grounded && v.pos.y - gh(v) > 4.9, 'above it: in the air, not "grounded" a metre up');
    const m = { battle: b, tickHooks: [], onDispose() {} };
    const h = SL.Staging.set(m, v, 'groundImpact', { seconds: 0.1 });
    for (let i = 0; i < 20 && !h.done(); i++) for (const fn of m.tickHooks.slice()) fn();
    ok(h.done() && v.grounded && Math.abs(v.pos.y - gh(v)) < 1e-3, 'the impact ends on the terrain, in its crater');
    SL.Staging.set(m, v, 'air', { height: 4 });
    eq(v.storySpace, 'air', 'the AI is told to stay up');
    SL.Staging.cast(b, { active: [g], hidden: [v] });
    ok(v.hidden && v.untargetable && v.intangible && v.controller.castStub, 'hidden and benched');
    SL.Staging.cast(b, { active: [g, v] });
    ok(!v.hidden && !v.untargetable && !v.controller.castStub, 'and back in the fight with its own controller');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('STORY FIGHT: a floor stops the health where the story turns and announces it once; everything is restored after', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const b = gg.mission('buu_sacred', { startPhase: SL.data.missions.buu_sacred.phases.findIndex((p) => p.id === 'minute') });
    gg.step(b, 30);
    const m = b.mission, v = b.story.vegeta;
    let beats = 0;
    const sf = m.storyFight({ floors: [{ f: v, at: 0.5, onFloor: () => beats++ }], dealt: [{ f: v, mul: 2 }] });
    eq(v.damageDealtMul, 2, 'the window applies');
    for (let i = 0; i < 6; i++) v._applyDamage(Math.round(v.hpMax * 0.2), null, { type: 'melee', impact: 1 }, v.pos.clone());
    eq(v.hp, Math.ceil(v.hpMax * 0.5), 'held at the floor');
    eq(beats, 1, 'the beat is called once');
    sf.off();
    ok(v.damageDealtMul !== 2 && !(v.storyFloor && v.storyFloor.frac === 0.5), 'restored');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Goodbye, Buu" plays through: the wishes, the call, half a sun, Good Buu, Hercule, the throw, a lock-up base form cannot win, the third wish, the push, the end of Buu', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const seen = {};
    let forms = {};
    const r = gg.playMission('buu_spiritbomb', {
      maxSeconds: 900,
      watch: true,
      onBattle: (b) => {
        b.on('missionPhase', () => (seen[phaseOf(b)] = true));
        b.on('objectives', (e) => {
          if (e.changed && e.changed.id === 'stand') seen.standPlayer = b.player.def.id;
          if (e.changed && e.changed.id === 'lock') forms.lock = b.story.goku.form.id;
          if (e.changed && e.changed.id === 'push') forms.push = b.story.goku.form.id;
        });
      },
    });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'mission state');
    eq(Object.keys(seen).filter((k) => k !== 'standPlayer').join(','), 'call,beating,goodbuu,rally,launch,lockup,wish,push,after', 'the beats after the wishes');
    ok(f.earthRestored && f.bombHalf && f.goodBuuBack && f.goodBuuStood && f.vegetaRescued && f.bombFull && f.bombThrown && f.thirdWish && f.farewell && f.kidBuuGone, 'every beat: ' + JSON.stringify(f));
    eq(seen.standPlayer, 'majin_buu', 'Good Buu is the player for the interruption');
    eq(forms.lock, 'base', 'the lock-up is in base form');
    ok(f.lockup && f.lockup.grip < 0.3, 'and it cannot be won, whatever is pressed: ' + JSON.stringify(f.lockup));
    eq(forms.push, 'ssj', 'the push is Super Saiyan');
    ok(f.pushed && f.pushed.won, 'and a player who pushes wins it');
    ok(S.kid.hidden && !S.bomb, 'nothing left of him; the light is gone');
    eq(S.goku.form.id, 'base', 'the gold gone out of Goku at the end');
    ok(SL.Save.data.flags.buuDefeated && !SL.Save.data.flags.earthDestroyed, 'the world state: Buu gone, the Earth back');
    eq(r.b.stage.def.id, 'kai_world', 'back on the Sacred World after the inserts');
    eq([...new Set(gg.warnings)].join(' | '), '', 'warnings');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Majin Vegeta\'s pride is a beat of its own inside the clash: it always plays, and the fight goes on after it', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const scenes = [];
    const r = gg.playMission('buu_pride', {
      maxSeconds: 900,
      startPhase: SL.data.missions.buu_pride.phases.findIndex((p) => p.id === 'clash'),
      onBattle: (b) => b.on('sceneStart', (e) => scenes.push(e.id)),
    });
    ok(scenes.includes('pride_pride'), 'the pride scene played: ' + scenes.join(','));
    ok(scenes.indexOf('pride_pride') < scenes.indexOf('pride_fists'), 'inside the clash, before the fists meet');
    ok(r.m.flags.prideDeclared, 'declared');
    eq(r.state, 'success', 'and the mission goes on to its end');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('watched or skipped, Chapter 14 ends in the same world state', () => {
    for (const id of ['buu_kidbuu', 'buu_sacred', 'buu_spiritbomb']) {
      const flags = [];
      for (const watch of [true, false]) {
        const gg = H.create({ quiet: true, seed: 3 });
        const r = gg.playMission(id, { maxSeconds: 900, watch });
        eq(r.state, 'success', id + (watch ? ' watched' : ' skipped'));
        const keys = Object.keys(r.m.flags).filter((k) => r.m.flags[k] === true).sort();
        flags.push(keys.join(','));
        if (id === 'buu_kidbuu') eq(gg.SL.Save.data.flags.earthDestroyed, true, 'the Earth is gone either way');
        if (id === 'buu_spiritbomb') ok(gg.SL.Save.data.flags.buuDefeated && !gg.SL.Save.data.flags.earthDestroyed, 'Buu gone and the Earth back, either way');
        eq(gg.errors.length, 0, id + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      }
      eq(flags[1], flags[0], id + ': the same story flags');
    }
  });
};
