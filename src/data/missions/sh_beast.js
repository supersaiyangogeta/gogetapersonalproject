/*
 * MOVIE 3 · DRAGON BALL SUPER: SUPER HERO — "Beast" (movie continuity; played as Gohan). The owner's moveset roadmap
 * #63 (2026-10-17): Gohan Beast — its look, its aura, and the Special Beam Cannon drilled straight through Cell Max's
 * core. One mission of the film (the rest of it is not built). Lines are paraphrased and written for this project.
 *
 *   AWAKEN *   (staged)  the Red Ribbon's canyon; Cell Max woken, roaring over it; his blast comes for Gohan and
 *                        Piccolo throws himself in front of it and goes down (no wound shown); Gohan snaps — the
 *                        Beast: the silver mane, the red eyes, the purple core in the blue-white flame
 *   FIGHT *    (played)  Gohan Beast against the giant (hit zones: the head is his weak point). Optional: land the
 *                        Special Beam Cannon (the Beast's Ultimate). The stretch ends at the giant's floor, or when
 *                        Gohan is worn down
 *   CANNON     (staged)  Piccolo was never dead: he gets up and pins the giant with rings of light; two fingers to the
 *                        brow, a spiral of green and yellow — the Special Beam Cannon straight through the core; the
 *                        giant goes up in light
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const CHAPTER = 'MOVIE 3 · SUPER HERO';
  // seconds: the stretch also ends when Piccolo is back on his feet (he was never dead), however it is going
  const TU = { maxFloor: 0.35, gohanFloor: 0.25, maxTaken: 0.9, maxDealt: 0.6, seconds: 80 };
  const SPOT = { gohan: [0, -8], piccolo: [-3, -10], max: [0, 18] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const DRILL = 0xd8ff6a;
  // the scene's Special Beam Cannon: a real beam that ends on him and does no damage of its own (the story does)
  const CANNON = {
    id: 'beastCannonScene', name: 'Special Beam Cannon', type: 'beam', damage: [0, 0], radius: [0.7, 0.7], speed: 200, range: 140, sustain: 80,
    color: 0xf0ff7a, core: 0xffffff, pierce: true, style: { rings: 9, ringColor: 0x9aff5a, ringSpeed: 3 },
  };

  function setup(b) {
    const S = (b.story = {});
    S.gohan = b.spawn({ charId: 'adult_gohan', team: 0, player: true, pos: at(b, 'gohan'), startKi: 100 });
    S.gohan._playerController = S.gohan.controller;
    S.piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(b, 'piccolo'), startKi: 60 });
    S.max = b.spawn({ charId: 'cell_max', team: 1, pos: at(b, 'max'), startKi: 100, tags: { boss: true, priority: true } });
    for (const f of Object.values(S)) f.cannotDie = true;
    bench(S.piccolo);
    K.faceTo(S.gohan, S.max.pos);
    K.faceTo(S.piccolo, S.max.pos);
    K.faceTo(S.max, S.gohan.pos);
    return S;
  }

  /** Out of the fight: nobody can reach him, he reaches nobody. */
  function bench(f) {
    f.controller = K.scripted();
    f.untargetable = f.intangible = true;
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  const P = {};

  P.awaken = { id: 'awaken', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.gohan, pc = S.piccolo, mx = S.max;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    K.toForm(g, 'ultimate');
    g.controller = K.scripted();
    mx.controller = K.scripted();
    bench(pc);
    K.place(g, at(b, 'gohan'), 0);
    K.place(pc, at(b, 'piccolo'), 0);
    K.place(mx, at(b, 'max'), Math.PI);
    for (const f of [g, pc]) K.faceTo(f, mx.pos);
    K.faceTo(mx, g.pos);
    K.pose(g, 'ag_fight', 'serious', 6);
    K.pose(pc, 'idle', 'serious', 6);
    // the giant, from low in the canyon, roaring
    m.music('battle', 2);
    K.pose(mx, 'ga_roar', 'shout', 6);
    m.shot((t, out) => K.camAt(out, at(b, 'gohan', 1.2).add(new V3(4, 0, -4)), mx.chest().add(new V3(0, 2, 0)), 60), 999, { cut: true, blendIn: 0, hold: true });
    m.title(CHAPTER, 'BEAST', 'The Red Ribbon\'s last weapon', 3.4);
    b.sfx('roar', mx, { vol: 1.2, pitch: 0.6 });
    b.cameraTraumaAt(mx.chest(), 0.6);
    yield* st.wait(3);
    shot(m, { piccolo: pc }, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 999);
    m.say('piccolo', 'Gohan — that thing is no ordinary android. Aim for the head!', 3);
    yield* st.wait(3);
    // his blast, and Piccolo in front of it
    K.pose(mx, 'ga_beamFire', 'shout', 20);
    const blast = mx.chest().clone();
    const hit = g.chest().clone().add(new V3(-1, 0, -0.5));
    m.shot((t, out) => K.camAt(out, g.pos.clone().add(new V3(9, 3, -2)), g.chest().lerp(blast, 0.3), 54), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.vfx.slash(blast, hit, 0xff3a5a, 0.4, 0.8);
      b.sfx('kiBlastBig', mx, { vol: 1.1 });
    }
    K.place(pc, K.ground(b, g.pos.clone().add(new V3(-0.8, 0, 1.2))), 0);
    K.faceTo(pc, mx.pos);
    K.pose(pc, 'p_grenadeW', 'shout', 30);
    b.vfx.explosion(pc.chest(), 2.4, 0xff5a6a, { smoke: true });
    b.sfx('explosionBig', pc, { vol: 1.1 });
    b.cameraTraumaAt(pc.chest(), 0.7);
    K.place(pc, K.ground(b, g.pos.clone().add(new V3(-2.4, 0, -1))), 0);
    K.pose(pc, 'knockdown', 'hurt', 10);
    m.flags.piccoloDown = true;
    yield* st.wait(0.8);
    shot(m, { gohan: g }, { subject: 'gohan', focus: 'closeup', angle: 'three' }, 999);
    m.say('adult_gohan', 'Mr. Piccolo...?! MR. PICCOLO!', 2.4, { style: 'shout' });
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
    // the Beast
    yield* SL.data.cinematics.transform(m, { fighter: g, formIndex: K.formIndex(g, 'beast'), witness: mx, music: 6 });
    K.toForm(g, 'beast');
    m.flags.beast = g.form.id === 'beast';
    m.endShot();
    b.skipRequested = false;
  } };

  P.fight = { id: 'fight', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.gohan, mx = S.max, pc = S.piccolo;
    stage(m);
    bench(pc);
    K.place(pc, K.ground(b, at(b, 'piccolo').add(new V3(-6, 0, -4))), 0);
    K.pose(pc, 'knockdown', 'hurt', 6);
    K.toForm(g, 'beast');
    mx.setHidden(false);
    mx.untargetable = mx.intangible = g.untargetable = g.intangible = false;
    if (g.pos.distanceTo(mx.pos) < 10) K.place(mx, K.ground(b, g.pos.clone().add(new V3(0, 0, 18))), Math.PI);
    g.hp = g.hpMax;
    mx.hp = mx.hpMax;
    g.ki = g.kiMax;
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    g.target = mx;
    mx.target = g;
    mx.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, mx.def.ai) });
    g.setState('free');
    mx.setState('free');
    m.title(CHAPTER, 'BEAST', 'Gohan Beast vs Cell Max', 2.4);
    m.objective('fight', 'Bring the giant down — his head is the weak point', { icon: 'fist' });
    m.objective('cannon', 'Land the Special Beam Cannon (Ultimate)', { icon: 'target', optional: true });
    m.music('battle', 6);
    let cannon = false;
    const offD = b.on('damage', (e) => {
      if (cannon || e.attacker !== g || e.target !== mx || e.source !== 'Special Beam Cannon (Beast)') return;
      cannon = true;
      m.complete('cannon');
    });
    m.onDispose(offD);
    const sf = m.storyFight({
      floors: [{ f: mx, at: TU.maxFloor }], dealt: [{ f: mx, mul: TU.maxDealt }], taken: [{ f: mx, mul: TU.maxTaken }],
      ease: { foe: mx, hero: g, below: 0.5, min: 0.5 },
      fighters: [g, mx],
    });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    let t = 0;
    const clock = () => {
      if (!b.inputLocked) t += 1 / 60;
    };
    m.tickHooks.push(clock);
    yield () => sf.floored(mx) || g.hpFrac < TU.gohanFloor || t >= TU.seconds || m.state !== 'running';
    K.removeHook(m, clock);
    offD();
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    m.flags.brought = sf.floored(mx);
    m.flags.cannonLanded = cannon;
    m.qteParts.push(m.flags.brought ? 1 : 0.5);
    m.complete('fight');
  } };

  P.cannon = { id: 'cannon', run: function* (m) {
    const b = m.battle, S = b.story, g = S.gohan, mx = S.max, pc = S.piccolo;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    mx.controller = K.scripted();
    bench(pc);
    K.toForm(g, 'beast');
    K.place(mx, K.ground(b, mx.pos.clone()), mx.yaw);
    K.pose(mx, 'ga_winded', 'hurt', 8);
    // Piccolo gets up — he was never dead — and pins him with rings of light
    K.place(pc, K.ground(b, mx.pos.clone().add(new V3(9, 0, -9))), 0);
    K.faceTo(pc, mx.pos);
    K.pose(pc, 'p_grenade', 'shout', 10);
    shot(m, { piccolo: pc }, { subject: 'piccolo', focus: 'upper', angle: 'low' }, 999);
    m.say('piccolo', 'Did you think I\'d go down that easily? I\'ll hold him — finish it, Gohan!', 3.2, { style: 'shout' });
    m.flags.piccoloUp = true;
    const pins = () => {
      if (b.frame % 6) return;
      for (const p of [mx.handPos('L'), mx.handPos('R'), mx.pos.clone().add(new V3(0, 1.6, 0))]) b.vfx.ring(p, 1.8, 0xe8ff8a, 0.3, new V3(0, 1, 0));
      b.vfx.ring(mx.chest(), 3.2, 0xe8ff8a, 0.3, new V3(0, 1, 0));
    };
    m.tickHooks.push(pins);
    yield* st.wait(3.2);
    // two fingers to the brow, in front of his head
    const front = mx.chest().add(new V3(Math.sin(mx.yaw), 0, Math.cos(mx.yaw)).multiplyScalar(12)).add(new V3(0, 1, 0));
    g.grounded = false;
    g.setPosition(front);
    g.vel.set(0, 0, 0);
    K.faceTo(g, mx.pos);
    g.setState('scripted', { pose: 'ub_sbcCharge', expression: 'angry', speed: 12, aura: 1 });
    b.sfx('beamCharge', g, { vol: 1.1 });
    m.shot((t, out) => {
      const h = g.headPos();
      const fw = new V3(Math.sin(g.yaw), 0, Math.cos(g.yaw));
      K.camAt(out, h.clone().addScaledVector(fw, 1.5).add(new V3(0.5, -0.05, 0)), h, 38);
    }, 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 3 === 0) {
        const tip = g.handPos('R');
        const a = n * 0.5;
        b.vfx.flash(tip.clone().add(new V3(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0)), 0.4, n % 6 ? DRILL : 0x9aff5a, 0.1, SL.Toon.tex.glow);
      }
      return n >= 100 || b.skipRequested;
    };
    m.flags.charged = true;
    const ctx = { b, m };
    if (!b.skipRequested) {
      mx.intangible = true;
      g.setState('scripted', { pose: 'ub_sbcFire', expression: 'shout', speed: 24, aura: 1 });
      SL.Cinema.beam(ctx, g, mx, CANNON);
      b.sfx('beamFire', g, { vol: 1.4, pitch: 1.3 });
      m.say('adult_gohan', 'SPECIAL BEAM... CANNON!', 2, { style: 'shout' });
      const pin = () => SL.Cinema.pinBeam(ctx, 0xe8ff8a);
      m.tickHooks.push(pin);
      // along the drill, then wide and side-on as it goes through him
      m.shot((t, out) => K.camAt(out, g.chest().add(new V3(Math.sin(g.yaw + 2.6) * 3, 0.6, Math.cos(g.yaw + 2.6) * 3)), mx.chest(), 50), 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1);
      m.shot((t, out) => {
        const mid = g.chest().lerp(mx.chest(), 0.5);
        K.camAt(out, mid.clone().add(new V3(Math.cos(g.yaw) * 26, 2, -Math.sin(g.yaw) * 26)), mid, 56);
      }, 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1.4);
      K.removeHook(m, pin);
    }
    if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
    K.removeHook(m, pins);
    // straight through the core: he goes up in light
    const core = mx.chest();
    b.vfx.explosion(core, 7, 0xfff0c0, { smoke: true });
    b.vfx.ring(core, 18, 0xffe8a0, 0.8);
    SL.ScreenFX.flash(0.4, '#fff8e0');
    b.sfx('explosionHuge', mx, { vol: 1.2 });
    b.cameraTraumaAt(core, 1);
    mx.setHidden(true);
    mx.untargetable = true;
    m.flags.destroyed = true;
    yield* st.wait(1.4);
    // after: down beside Piccolo
    const land = K.ground(b, pc.pos.clone().add(new V3(1.6, 0, 1.2)));
    K.place(g, land, 0);
    K.faceTo(g, pc.pos);
    K.faceTo(pc, g.pos);
    K.pose(g, 'ag_calm', 'soft', 6);
    K.pose(pc, 'idle', 'smirk', 6);
    shot(m, { gohan: g }, { subject: 'gohan', focus: 'upper', angle: 'three' }, 999);
    m.say('adult_gohan', 'Mr. Piccolo... you\'re alive! I thought—', 2.6, { style: 'quiet' });
    yield* st.wait(2.6);
    shot(m, { piccolo: pc }, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 999);
    m.say('piccolo', 'Hmph. Somebody had to get you angry enough. Took you long enough.', 3);
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'BEAST', 'Gohan Beast: open in Free Battle', 4);
    yield* m.cine(4.2);
  } };

  SL.data.shBeast = { TU };
  SL.data.missions.sh_beast = {
    id: 'sh_beast', movie: 'super_hero', chapter: CHAPTER, title: 'Beast', character: 'adult_gohan', stage: 'rocky_canyon',
    subtitle: 'Dragon Ball Super: Super Hero · the Red Ribbon\'s last weapon', parTime: 300, qteLabel: 'Against the giant',
    blurb: 'The Red Ribbon Army wakes its last weapon before it is finished. When Piccolo goes down shielding him, Gohan finally lets go — and something new comes out.',
    lockForms: { adult_gohan: ['ssj', 'ssj2'] },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Free Battle: Gohan Beast and his Special Beam Cannon'],
    setup,
    phases: [P.awaken, P.fight, P.cannon],
  };
})();
