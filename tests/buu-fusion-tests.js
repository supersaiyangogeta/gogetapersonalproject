// The Fusion Dance and Gotenks (2026-09-25, the owner's Buu Saga brief, priority 7): the fusion
// system (two fighters become one, and come apart again), the dance as a rhythm input, the failed
// fusions, Gotenks' own body and kit, Kami's Lookout, and the mission that ties them together.
// Behaviour on the real engine, headless.
const H = require('./headless');

module.exports = function buuFusionTests({ test, eq, ok }) {
  console.log('\nFusion: the dance, Gotenks, the Lookout (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  /** A player who presses the rhythm's button `offset` seconds after each beat (null: never). */
  const dancer = (SL, b, offset) => {
    const st = {};
    return {
      update: () => {
        const it = SL.emptyIntent();
        if (!b.rhythm || offset === null) return it;
        if (b.rhythm.next <= 0.009 - offset && st.i !== b.rhythm.index) {
          st.i = b.rhythm.index;
          it[b.rhythm.key] = true;
        }
        return it;
      },
    };
  };

  test('fusion: two fighters become one where they meet, the player\'s seat moves to the fusion, the parts leave the fight — and come back as they were', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'kid_trunks', p2: 'piccolo', distance: 8 });
    const t = b.player, pic = b.fighters[1];
    const g = b.spawn({ charId: 'goten', team: 0, pos: new V3(-4, 0, 2) });
    t.applyForm(1);
    t.hp = t.hpMax * 0.6;
    g.hp = g.hpMax * 0.8;
    pic.target = t;
    const h = SL.Fusion.fuse(b, g, t, 'gotenks', { seconds: 3 });
    const f = h.fused;
    eq(f.def.id, 'gotenks', 'Gotenks');
    eq(b.player, f, 'the player is the fusion');
    ok(f.pos.distanceTo(g.pos.clone().lerp(t.pos, 0.5)) < 0.01, 'where they met');
    ok(Math.abs(f.hpFrac - 0.7) < 0.01, 'the health of the two, averaged: ' + f.hpFrac.toFixed(2));
    eq(pic.target, f, 'whoever was after one of them is after the fusion');
    for (const p of [g, t]) ok(p.hidden && p.untargetable && p.intangible && !p.isPlayer, p.def.id + ' is out of the fight');
    eq(b.fighters.filter((x) => x.controller instanceof SL.PlayerController && x.alive && !x.hidden).length, 1, 'one player controller');
    // the timer runs only while the game runs
    b.inputLocked = true;
    gg.step(b, 240);
    ok(h.active, 'a scene holding the game does not spend the fusion');
    b.inputLocked = false;
    let ended = null;
    b.on('fusionEnd', (e) => (ended = e));
    f.hp = f.hpMax * 0.5;
    gg.step(b, 200);
    ok(ended && ended.timeUp, 'three seconds of play, and it ends by itself');
    ok(!b.fighters.includes(f), 'the fusion is gone');
    eq(b.player, g, 'the player is handed a part back');
    for (const p of [g, t]) ok(!p.hidden && !p.intangible && Math.abs(p.hpFrac - 0.5) < 0.02, p.def.id + ' is back with the fusion\'s health: ' + p.hpFrac.toFixed(2));
    eq(t.form.id, 'ssj', 'the same fighter, the same form it went in with');
    ok(g.pos.distanceTo(t.pos) > 1, 'side by side, not inside each other');
    eq(b.fighters.filter((x) => x.controller instanceof SL.PlayerController && x.alive).length, 1, 'still one player controller');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the dance is a rhythm: on the beat is perfect, a little late is good, silence misses, and mashing does not get through it', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const grade = (offset, mash) => {
      const b = gg.battle({ p1: 'kid_trunks' });
      // a bare mission on a training fight: the battle ticks its hooks
      const m = new SL.Mission(b, { id: 'rhythm_probe', phases: [] }, {});
      let res = null;
      const co = new SL.Coroutine((function* () {
        res = yield* m.rhythm([1, 2, 3, 4].map(() => ({ key: 'light', label: 'STEP' })), { beat: 0.8, window: 0.2, perfect: 0.075, lead: 0.5 });
      })());
      b.player.controller = mash ? { update: () => Object.assign(SL.emptyIntent(), { light: b.frame % 2 === 0 }) } : dancer(SL, b, offset);
      for (let i = 0; i < 60 * 6 && !res; i++) {
        gg.frame(b);
        co.update(1 / 60);
      }
      b.dispose();
      return res.hits.map((h) => h.grade).join(',');
    };
    eq(grade(0), 'perfect,perfect,perfect,perfect', 'on the beat');
    eq(grade(0.14), 'good,good,good,good', 'a little late');
    eq(grade(null), 'miss,miss,miss,miss', 'nothing pressed');
    ok(!/perfect|good/.test(grade(0, true)), 'mashing through it: ' + grade(0, true));
  });

  test('"Fusion": the first dance comes out fat (Goten\'s finger), a step out of time comes out old, and on the beat it is Gotenks', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('buu_fusion', { startPhase: phaseAt(SL, 'buu_fusion', 'dance1') });
    const fusions = [];
    b.on('fusionDance', (e) => fusions.push(e.id));
    let offset = 0, tries = 0;
    b.on('rhythmDone', () => {
      tries++;
      offset = tries === 1 ? 0.35 : 0; // the second dance (the first of DANCE2) is late on every step
    });
    const st = {};
    const press = { update: () => {
      const it = SL.emptyIntent();
      if (b.rhythm && b.rhythm.next <= 0.009 - offset && st.i !== b.rhythm.index + ':' + tries) {
        st.i = b.rhythm.index + ':' + tries;
        it.light = true;
      }
      return it;
    } };
    gg.until(b, () => phaseId(b) === 'spar' || b.mission.state !== 'running', 60 * 240, () => {
      if (b.player && b.player.controller !== press) b.player.controller = press;
      if (b.inputLocked && !b.rhythm) b.skipRequested = true;
    });
    eq(fusions.join(','), 'gotenks_fat,gotenks_thin,gotenks', 'fat, old, then Gotenks: ' + fusions.join(','));
    eq(b.mission.flags.dance1, 'finger', 'the first one is Goten\'s finger');
    eq(b.mission.flags.dance2Tries, 2, 'two tries in the second dance');
    ok(b.story.gotenks && b.story.gotenks.def.id === 'gotenks' && !b.story.gotenks.hidden, 'Gotenks is standing there');
    ok(b.story.goten.hidden && b.story.trunks.hidden, 'and the boys are inside him');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Gotenks is his own fighter: his own build, hair, vest and gold pads, his own moves; Super Saiyan 3 exists but stays locked until the Time Chamber', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const C = SL.data.characters;
    const gk = C.gotenks;
    ok(gk.appearance.height > C.goten.appearance.height && gk.appearance.height > C.kid_trunks.appearance.height, 'bigger than either boy');
    ok(gk.appearance.hair.style === 'gotenks' && SL.data.hair.gotenks && SL.data.hair.gotenks_ssj && SL.data.hair.gotenks_ssj3, 'his own hair, and his own gold');
    const ids = (d) => new Set([].concat(d.moves.light.map((x) => x.id), Object.values(d.moves.heavy).map((x) => x.id), Object.values(d.specials).map((x) => x.id)));
    const mine = ids(gk);
    for (const other of ['goten', 'kid_trunks']) for (const id of ids(C[other])) ok(!mine.has(id), 'no move shared with ' + other + ': ' + id);
    eq(gk.specials.special2.type, 'bossPose', 'the pose is a special');
    eq(gk.specials.ultimate.projectile.kind, 'ghost', 'the ultimate is ghosts');
    const b = gg.battle({ p1: 'gotenks', p2: 'piccolo' });
    const f = b.player;
    ok(f.model.jacket && f.model.jacket.length, 'the vest');
    let pads = 0;
    f.model.root.traverse((o) => o.name === 'pad' && pads++);
    eq(pads, 2, 'two padded shoulders');
    eq(f.def.forms.map((x) => x.id).join(','), 'base,ssj,ssj3', 'forms');
    ok(!SL.formFreeUnlocked(f.def.forms[2]), 'Super Saiyan 3 is not handed over yet');
    eq(gk.forms[2].drain.kiPerSec > 0, true, 'and it drinks ki when it is');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the Super Ghost Kamikaze Attack: four ghosts fanned out of his mouth, drifting after the target, exploding on contact', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'gotenks', p2: 'piccolo', distance: 10, dummy: 'idle' });
    const f = b.player, p = b.fighters[1];
    f.ki = f.kiMax;
    let hits = 0;
    b.on('damage', (e) => e.target === p && e.source === 'Super Ghost Kamikaze Attack' && hits++);
    f.controller = gg.script(b, { 1: { ult: true, ultHeld: true } });
    let most = 0, dirs = null;
    gg.step(b, 60 * 4, () => {
      const g = b.projectiles.list.filter((x) => x.kind === 'ghost');
      if (g.length > most) {
        most = g.length;
        dirs = g.map((x) => Math.atan2(x.vel.x, x.vel.z));
      }
    });
    eq(most, 4, 'four ghosts');
    ok(Math.max(...dirs) - Math.min(...dirs) > 0.3, 'fanned out');
    ok(hits >= 2, 'and they find him: ' + hits);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the Grim Reaper pose: finished, he hits harder for a while; hit out of it, it is wasted', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    let b = gg.battle({ p1: 'gotenks', p2: 'piccolo', distance: 12 });
    let f = b.player;
    f.ki = f.kiMax;
    let done = null;
    b.on('bossPoseDone', (e) => (done = e));
    f.controller = gg.script(b, { 1: { s2: true, s2Held: true } });
    gg.step(b, 90);
    ok(done && f.damageDealtMul > 1, 'the pose pays off: x' + f.damageDealtMul.toFixed(2));
    b.dispose();
    b = gg.battle({ p1: 'gotenks', p2: 'piccolo', distance: 2 });
    f = b.player;
    f.ki = f.kiMax;
    let broken = false;
    b.on('bossPoseBroken', () => (broken = true));
    f.controller = gg.script(b, { 1: { s2: true, s2Held: true } });
    gg.step(b, 10);
    for (let i = 0; i < 4 && !broken; i++) f.takeHit(b.fighters[1], { type: 'melee', damage: 400, knock: 'held', impact: 1 });
    gg.step(b, 60);
    ok(broken && f.damageDealtMul === 1, 'hit out of it: no buff');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Fusion" played: the spar asks for the gold only after Piccolo does, the ghosts land, and mid-brag the thirty minutes run out', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    let goldTaught = null, lockedBefore = null, timeUp = null;
    const r = gg.playMission('buu_fusion', {
      startPhase: phaseAt(SL, 'buu_fusion', 'spar'), maxSeconds: 300,
      onBattle: (b) => {
        // (the mission starts in the spar: watch from the first tick)
        b.onTick(() => {
          if (b.story.gotenks && lockedBefore === null && !b.inputLocked) lockedBefore = !!(b.story.gotenks.lockedForms && b.story.gotenks.lockedForms.ssj);
          return lockedBefore === null;
        });
        b.on('skillLearned', (e) => e.key === 'form:ssj' && (goldTaught = b.mission.flags.goldAsked));
        b.on('fusionEnd', (e) => (timeUp = e));
      },
    });
    eq(r.state, 'success', 'mission state');
    eq(lockedBefore, true, 'no Super Saiyan in the spar\'s first stretch');
    eq(goldTaught, true, 'the gold is handed over when Piccolo asks for it');
    ok(r.m.flags.sparHits >= 6 && r.m.flags.ghostHit, 'the hits and the ghosts: ' + JSON.stringify({ hits: r.m.flags.sparHits, ghost: r.m.flags.ghostHit }));
    ok(timeUp && timeUp.id === 'gotenks', 'the fusion ends');
    ok(!r.b.fighters.some((f) => f.def.id === 'gotenks'), 'Gotenks is gone');
    ok(!r.b.story.goten.hidden && !r.b.story.trunks.hidden, 'two boys on the floor of the Lookout');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the story: "Fusion" follows "The Third Level", clearing it unlocks Gotenks and his Super Saiyan; Kami\'s Lookout is flat to the rim and falls away past it', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const order = SL.data.storyOrder();
    eq(order.indexOf('buu_fusion'), order.indexOf('buu_ssj3') + 1, 'right after the third level');
    eq(SL.data.formGivenBy['gotenks:ssj'], 'buu_fusion', 'Super Saiyan handed over here');
    ok(SL.data.unlocks.some((u) => u.target === 'gotenks' && u.condition.missionComplete === 'buu_fusion'), 'Gotenks unlocks with it');
    const b = gg.mission('buu_fusion', {});
    const st = b.stage, R = st.def.lookout.radius;
    ok(Math.abs(st.heightAt(0, 0)) < 0.01 && Math.abs(st.heightAt(R - 2, 0)) < 0.01, 'flat inside the rim');
    ok(st.heightAt(R + 6, 0) < -20, 'and nothing past it');
    ok(st.def.storyOnly, 'story only');
    ok(st.obstacles.some((o) => o.shape === 'cyl' && o.r > 7), 'the palace is solid');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
