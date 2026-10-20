/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "Ultra Instinct" (Mastered Ultra Instinct Goku vs Jiren).
 * Tournament of power ui.docx §7–8: the Sign at the start (black hair, silver aura, dodging but not landing); Jiren
 * forces another desperate exchange; Goku begins to block and counter; the arena swallowed by a nebula of energy;
 * Jiren's massive attack; Goku breaks through it and the change completes — silver hair and eyes. The ARMS-DOWN beat:
 * a wide shot of the shattered arena and the aura, a slow push in, Goku upright with his shoulders relaxed and his
 * arms hanging, calm; reactions; a tense quiet. Then the phases: Jiren's attacks fail to connect; Goku takes control;
 * Jiren turns on the spectators and Goku protects them; Jiren at full power; Goku standing over him; and the form's
 * limit — the silver flickers out and he falls.
 *
 *   OPEN *       (scene top_mui_open)  the ruined platform; Vegeta's energy in him; the Sign returns
 *   SIGN *       (play)        Ultra Instinct -Sign- vs Jiren: dodging, not landing. Ends on the clock or when worn
 *   BREAK        (cue + staged) the nebula; Jiren's massive Power Impact; Goku breaks through it (Charge) — silver
 *   STILLNESS    (staged)      the arms-down pose: wide, the slow push, the reactions, the quiet
 *   COUNTER *    (play)        MASTERED: Jiren's blows fail to connect (the evasion nearly always), and every slip opens
 *                              a counter that lands hard. Ends on his floor
 *   PROTECT *    (play)        Jiren turns his Power Impacts on the stands: get to each one before it gets there
 *                              (strike it or blast it). Each one you miss costs Goku's form its time
 *   FULL POWER * (play)        Jiren at full power: heavier, faster — the form still has the edge, but it burns. Ends on
 *                              his floor
 *   OVER HIM     (staged)      Jiren down on the broken stone, Goku above him, arms relaxed; "Finish it."
 *   LIMIT        (staged)      the silver fails: the sound drops away, the aura flickers and is gone, he falls
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const TK = () => SL.data.topKit;
  const ST = (m) => SL.data.u6Kit.staged(m);
  const CHAPTER = 'CHAPTER 22 · THE TOURNAMENT OF POWER';
  const SILVER = 0xe8eeff, RED = 0xff3a2a;
  const TU = {
    sign: { seconds: 25, floor: 0.8, worn: 0.4, dealt: 0.18, taken: 0.25, evade: 0.65 },
    counter: { floor: 0.7, dealt: 0.12, taken: 0.5, evade: 0.95, counterMul: 2.5 },
    protect: { orbs: 3, speed: 9, gap: 4, cost: 25 },
    full: { floor: 0.42, dealt: 0.14, taken: 0.35, evade: 0.85, counterMul: 2 },
  };
  const SPOT = { goku: [0, 6], jiren: [0, -6] };

  SL.data.scenes.top_mui_open = {
    id: 'top_mui_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    // the Tournament of Power's own battle music (soundtrack PDF p.91–92, "Genkai Toppa x Survivor": an original stand-in)
    music: { song: 'limit_survivor', level: 3 },
    auraCap: 0,
    events: [
      {
        cam: { from: [90, 50, 110], to: [50, 28, 60], look: [0, 4, 0], look2: [0, 4, 0], fov: 56, fov2: 50, ease: 'inOut', raw: true },
        title: { chapter: CHAPTER, title: 'ULTRA INSTINCT', subtitle: 'Goku vs Jiren', duration: 4.2 },
        hold: 4.3,
      },
      // the doc's still: Jiren on one side, Goku on the other, the silver flame round him, his head down
      {
        call: (ctx) => K.toForm(ctx.cast.goku, 'uiSign'),
        pose: [{ who: 'goku', pose: 'g_uiStance', face: 'serious' }, { who: 'jiren', pose: 'jr_idle', face: 'cold' }],
        cam: { subject: 'goku', with: 'jiren', focus: 'full', angle: 'side' },
        say: { who: 'jiren', line: 'You again. Your friend gave you his strength... and you will waste it.', duration: 3.6 },
        hold: 3.7,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'Vegeta told me to win. So that\'s what I\'m gonna do.', duration: 3 },
        hold: 3.1,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
      K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
      K.faceTo(S.goku, S.jiren.pos);
      K.faceTo(S.jiren, S.goku.pos);
    },
  };

  /*
   * THE ADVANCE (Roadmap Three: the owner's Gemini research, the MUI block — B-MUI-05, MUI-S02, MUI-S03, TOP-S03; a
   * research draft, not checked against the footage): at the start of the Mastered fight Jiren throws everything at
   * him; Goku walks straight into it, his head and body slipping each fist by a hair — the first one in slow motion,
   * side-on along the fist — and then he is inside the guard: an open palm to the solar plexus, a ring of force across
   * the stone, Jiren skidding back. Then the player has him.
   */
  const MISS = 0xff5a3a;
  /** One of Jiren's blows going past him: a red streak from the fist, past his head, on into the air behind. */
  function whiff(ctx, side) {
    const b = ctx.b, { goku: g, jiren: j } = ctx.cast;
    const fist = j.handPos('R'), head = g.headPos();
    const past = head.clone().add(new V3(-g.forward.z, 0, g.forward.x).multiplyScalar(0.35 * side)).addScaledVector(head.clone().sub(fist).setY(0).normalize(), 2.2);
    b.vfx.slash(fist, past, MISS, 0.3, 0.2);
    b.vfx.slash(fist, past, 0xffe0d0, 0.2, 0.06);
    b.vfx.flash(fist, 1, MISS, 0.12, SL.Toon.tex.glow);
    b.sfx('swing', j, { vol: 1, pitch: 0.7 });
    g.ghost(0.25, 0.35);
  }
  /** Each slip carries him on toward Jiren a step (the walk is the point: he never stops coming). */
  const step = (k) => ({ who: 'goku', to: { at: 'jiren', off: [0, 0, 6 - k * 1.1] }, seconds: 0.3 });
  SL.data.scenes.top_mui_advance = {
    id: 'top_mui_advance',
    cast: (m) => SL.data.brolyKit.cast(m),
    events: [
      // Jiren comes for him; side-on, along the line between them
      {
        call: (ctx) => {
          const { goku: g, jiren: j } = ctx.cast;
          K.place(j, K.ground(ctx.b, new V3(0, 0, -3)), 0);
          K.place(g, K.ground(ctx.b, new V3(0, 0, 4)), Math.PI);
          K.faceTo(g, j.pos);
          K.faceTo(j, g.pos);
        },
        pose: [{ who: 'goku', pose: 'g_uiStance', face: 'calm', aura: 0.9 }, { who: 'jiren', pose: 'jr_strikeW', face: 'angry', aura: 1 }],
        cam: { from: { at: 'jiren', off: [7.5, 1, 3.5] }, look: { at: 'jiren', off: [0, 1.1, 3.5] }, fov: 50 },
        hold: 0.8,
      },
      // the first one in slow motion: the camera along the fist, the head moving out of its way by a hair (MUI-S02)
      {
        call: (ctx) => whiff(ctx, 1),
        pose: [{ who: 'jiren', pose: 'jr_straight', face: 'angry', speed: 24 }, { who: 'goku', pose: 'g_uiSlip', face: 'calm', speed: 10 }],
        slow: { scale: 0.3, seconds: 1.3 },
        cam: { from: { at: 'jiren', off: [7.5, 1.4, 3.2] }, to: { at: 'jiren', off: [7.2, 1.4, 4] }, look: { at: 'jiren', off: [0, 1.3, 3.4] }, look2: { at: 'jiren', off: [0, 1.4, 4.2] }, fov: 50 },
        hold: 1.4,
      },
      // and the rest at full speed, while he keeps walking in
      {
        call: (ctx) => whiff(ctx, -1),
        pose: [{ who: 'jiren', pose: 'jr_jab', face: 'angry', speed: 28 }, { who: 'goku', pose: 'g_uiSlip2', face: 'calm', speed: 18 }],
        move: step(1),
        cam: { from: { at: 'jiren', off: [6.5, 1.2, 2.5] }, look: { at: 'goku', off: [0, 0.6, -1.5] }, fov: 52 },
        hold: 0.32,
      },
      {
        call: (ctx) => whiff(ctx, 1),
        pose: [{ who: 'jiren', pose: 'jr_strike', face: 'angry', speed: 28 }, { who: 'goku', pose: 'g_uiSlip', face: 'calm', speed: 18 }],
        move: step(2),
        hold: 0.3,
      },
      {
        call: (ctx) => whiff(ctx, -1),
        pose: [{ who: 'jiren', pose: 'jr_double', face: 'shout', speed: 28 }, { who: 'goku', pose: 'g_uiSlip2', face: 'calm', speed: 18 }],
        move: step(3),
        hold: 0.3,
      },
      {
        call: (ctx) => whiff(ctx, 1),
        pose: [{ who: 'jiren', pose: 'jr_straight', face: 'shout', speed: 30 }, { who: 'goku', pose: 'g_uiSlip', face: 'calm', speed: 18 }],
        move: step(4),
        hold: 0.34,
      },
      // inside the guard: the open palm to the solar plexus, the ring across the stone, Jiren skidding back (MUI-S03, TOP-S03)
      {
        call: (ctx) => {
          const b = ctx.b, { goku: g, jiren: j } = ctx.cast;
          g.ghost(0.3, 0.45);
          K.place(g, j.pos.clone().addScaledVector(j.forward, 0.95), Math.atan2(-j.forward.x, -j.forward.z));
          const c = j.chest();
          b.vfx.flash(c, 1.4, SILVER, 0.16, SL.Toon.tex.glow);
          b.vfx.ring(c, 3, SILVER, 0.4, j.forward.clone());
          b.vfx.ring(j.pos.clone().add(new V3(0, 0.15, 0)), 14, SILVER, 0.7, new V3(0, 1, 0));
          b.vfx.debrisBurst(j.pos.clone().add(new V3(0, 0.2, 0)), 10, 0x8a8a9a, 9, 0.22);
          b.sfx('punchHeavy', j, { vol: 1.4, pitch: 0.7 });
          b.cameraTraumaAt(c, 0.7);
        },
        pose: [{ who: 'goku', pose: 'g_godPalm', face: 'calm', speed: 30 }, { who: 'jiren', pose: 'hitBody', face: 'shock', speed: 24 }],
        space: { who: 'jiren', mode: 'slide', distance: 4.5, seconds: 0.45, face: 'goku' },
        cam: { from: { at: 'jiren', off: [3.4, 1, 0.8] }, look: { at: 'jiren', off: [0, 1, 0.6] }, fov: 46, cut: true },
        hold: 1.2,
      },
    ],
    end(ctx) {
      const { goku: g, jiren: j } = ctx.cast;
      for (const f of [g, j]) {
        if (!f) continue;
        f.storySpace = null;
        f.storyMode = null;
        f.setState('free');
      }
      ctx.m.flags.muiAdvance = true;
    },
  };

  /*
   * THE TAKEDOWN (Roadmap Three, the MUI block — B-MUI-07; a research draft, not checked against the footage): how
   * Jiren comes to be on his back for OVER HIM — Goku closes the gap at once: an open palm to the chest, a spinning
   * kick to the ribs, an afterimage where he was, and from behind a closed fist wrapped in silver-blue light that puts
   * Jiren flat on the stone.
   */
  SL.data.scenes.top_mui_takedown = {
    id: 'top_mui_takedown',
    cast: (m) => SL.data.brolyKit.cast(m),
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, { goku: g, jiren: j } = ctx.cast;
          const c = K.ground(b, new V3(U.clamp(j.pos.x, -16, 16), 0, U.clamp(j.pos.z, -16, 16)));
          K.place(j, c, 0);
          K.place(g, K.ground(b, c.clone().add(new V3(0, 0, 6))), Math.PI);
          K.faceTo(g, j.pos);
          K.faceTo(j, g.pos);
        },
        pose: [{ who: 'goku', pose: 'g_uiStance', face: 'calm', aura: 0.9 }, { who: 'jiren', pose: 'jr_stance', face: 'hurt', aura: 0.7 }],
        cam: { from: { at: 'jiren', off: [7, 1.2, 3] }, look: { at: 'jiren', off: [0, 1.1, 3] }, fov: 50 },
        hold: 0.6,
      },
      // the palm to the chest — he is simply there
      {
        call: (ctx) => {
          const b = ctx.b, { goku: g, jiren: j } = ctx.cast;
          g.ghost(0.3, 0.45);
          K.place(g, j.pos.clone().addScaledVector(j.forward, 0.95), Math.atan2(-j.forward.x, -j.forward.z));
          b.vfx.flash(j.chest(), 1.3, SILVER, 0.14, SL.Toon.tex.glow);
          b.vfx.ring(j.chest(), 2.4, SILVER, 0.35, j.forward.clone());
          b.sfx('punchHeavy', j, { vol: 1.2, pitch: 0.8 });
          b.cameraTraumaAt(j.chest(), 0.4);
        },
        pose: [{ who: 'goku', pose: 'g_godPalm', face: 'calm', speed: 30 }, { who: 'jiren', pose: 'hitBody', face: 'shock', speed: 26 }],
        cam: { from: { at: 'jiren', off: [3.4, 1, 0.8] }, look: { at: 'jiren', off: [0, 1, 0.5] }, fov: 46, cut: true },
        hold: 0.45,
      },
      // the spinning kick to the ribs
      {
        call: (ctx) => {
          const b = ctx.b, j = ctx.cast.jiren;
          const c = j.chest(), side = new V3(j.forward.z, 0, -j.forward.x);
          b.vfx.slash(c.clone().addScaledVector(side, 1.2).add(new V3(0, 0.3, 0)), c.clone().addScaledVector(side, -0.6), SILVER, 0.22, 0.12);
          b.sfx('punchHeavy', j, { vol: 1.2, pitch: 0.95 });
          b.cameraTraumaAt(c, 0.35);
        },
        pose: [{ who: 'goku', pose: 'g_spinKick', face: 'calm', speed: 30 }, { who: 'jiren', pose: 'hitSideL', face: 'hurt', speed: 26 }],
        space: { who: 'jiren', mode: 'slide', dir: [1, 0, 0], distance: 1.1, seconds: 0.2 },
        cam: { from: { at: 'jiren', off: [-4, 1.2, 0.4] }, look: { at: 'jiren', off: [0, 1, 0.5] }, fov: 48, cut: true },
        hold: 0.42,
      },
      // gone — an afterimage where he was — and behind him
      {
        call: (ctx) => {
          const b = ctx.b, { goku: g, jiren: j } = ctx.cast;
          b.vfx.afterimage(g.pos.clone(), g.height, 0xe8eeff);
          g.ghost(0.4, 0.5);
          K.place(g, j.pos.clone().addScaledVector(j.forward, -1.05), Math.atan2(j.forward.x, j.forward.z));
          b.sfx('vanish', g, { vol: 0.9 });
        },
        pose: [{ who: 'goku', pose: 'g_jabW', face: 'calm', speed: 24 }, { who: 'jiren', pose: 'jr_guard', face: 'shock', speed: 20 }],
        cam: { from: { at: 'jiren', off: [2.6, 1.5, -3.4] }, look: { at: 'jiren', off: [0, 1.1, -0.5] }, fov: 50, cut: true },
        hold: 0.32,
      },
      // the fist from behind, wrapped in silver-blue: a ring across the stone, and he is flat on his back
      {
        call: (ctx) => {
          const b = ctx.b, j = ctx.cast.jiren, c = j.chest();
          b.vfx.flash(c, 1.8, 0x9fd8ff, 0.18, SL.Toon.tex.glow);
          b.vfx.ring(c, 3.2, 0x9fd8ff, 0.4, j.forward.clone());
          b.vfx.ring(j.pos.clone().add(new V3(0, 0.15, 0)), 16, SILVER, 0.8, new V3(0, 1, 0));
          b.vfx.debrisBurst(j.pos.clone().add(new V3(0, 0.2, 0)), 12, 0x8a8a9a, 10, 0.24);
          b.sfx('explosionBig', j, { vol: 0.9, pitch: 0.8 });
          b.cameraTraumaAt(c, 0.8);
        },
        pose: [{ who: 'goku', pose: 'g_jab', face: 'calm', speed: 30, aura: 1 }, { who: 'jiren', pose: 'hitBack', face: 'hurt', speed: 26 }],
        space: { who: 'jiren', mode: 'groundImpact', to: { at: 'jiren', local: [0, 0, 3.4] }, seconds: 0.4, endPose: 'lieBack', expr: 'hurt' },
        cam: { from: { at: 'jiren', off: [6, 0.6, 0.4] }, look: { at: 'jiren', off: [0, 0.8, 1.2] }, fov: 56 },
        hold: 1.1,
      },
    ],
    end(ctx) {
      const { goku: g, jiren: j } = ctx.cast;
      for (const f of [g, j]) {
        if (!f) continue;
        f.storySpace = null;
        f.storyMode = null;
      }
      if (j) j.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      ctx.m.flags.muiTakedown = true;
    },
  };

  function setup(b) {
    const S = TK().setup(b, {
      player: 'goku', fight: ['goku', 'jiren'],
      seat: ['beerus', 'whis', 'krillin', 'tien', 'roshi', 'adult_gohan', 'piccolo', 'android_18', 'vegeta', 'toppo', 'dyspo'],
      edge: { frieza: [28, 24], android_17: [-30, -14] },
    });
    K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
    K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
    K.faceTo(S.goku, S.jiren.pos);
    K.faceTo(S.jiren, S.goku.pos);
    return S;
  }

  /** o.goku / o.jiren: clothing for this beat (Goku 2 the undershirt, 3 bare — Mastered on; Jiren 2 the suit torn off) */
  function stage(m, o = {}) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    b.stage.clearMood(0.6);
    TK().seat(m);
    TK().edge(m);
    TK().ruin(b, 3);
    BK.give(S.goku, ['uiSign', 'mui']);
    BK.give(S.jiren, 'full');
    for (const f of [S.goku, S.jiren]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
    }
    if (S.goku.setDamage) S.goku.setDamage(o.goku === undefined ? 3 : o.goku);
    if (S.jiren.setDamage) S.jiren.setDamage(o.jiren || 0);
    if (S.vegeta.setDamage) S.vegeta.setDamage(3);
  }

  /** The evasion for a stretch, and counters that bite: a blow inside the window a slip opens lands harder. */
  function instinct(m, chance, counterMul) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    g.storyEvade = { mode: 'god', chance, gap: 8, from: [j], kinds: ['sway', 'sway', 'parry', 'step'], swayPose: 'g_uiSlip', stepPose: 'g_uiSlip2', whiff: 22, trace: SILVER, swayVel: 2.4, stepVel: 5.5, overrun: 6 };
    let windowAt = -99, counters = 0, base = 1, boosted = false;
    const watch = () => {
      if (g.counterFrames > 0 || (g.storyEvade && b.frame - (g.storyEvade.last || -99) < 40)) windowAt = b.frame;
      if (!boosted) base = j.damageTakenMul;
      boosted = b.frame - windowAt <= 2;
      j.damageTakenMul = boosted ? base * (counterMul || 1) : base;
    };
    m.tickHooks.push(watch);
    const offD = b.on('damage', (e) => {
      if (e.attacker === g && e.target === j && b.frame - windowAt <= 2) {
        counters++;
        b.vfx.ring(j.chest(), 2.2, SILVER, 0.25);
      }
    });
    let done = false;
    const off = () => {
      if (done) return;
      done = true;
      K.unhook(m, watch);
      offD();
      if (boosted) j.damageTakenMul = base;
      g.storyEvade = null;
    };
    m.onDispose(off);
    return { off, counters: () => counters };
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, { goku: 2 });
    K.toForm(m.battle.story.goku, 'base');
    yield* SL.Cinema.play(m, 'top_mui_open');
  } };

  /** The Sign: dodging, not landing. */
  P.sign = { id: 'sign', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, { goku: 2 });
    K.toForm(g, 'uiSign');
    K.toForm(j, 'base');
    TK().place(m, 'goku', SPOT.goku, 'jiren');
    TK().place(m, 'jiren', SPOT.jiren, 'goku');
    g.hp = g.hpMax * 0.8;
    g.ki = g.kiMax;
    j.hp = j.hpMax;
    const ins = instinct(m, TU.sign.evade, 1);
    m.title(CHAPTER, 'GOKU VS JIREN', 'Ultra Instinct -Sign-', 2.2);
    m.objective('sign', 'Your body slips him — but your blows barely land. Keep pushing', { icon: 'fist' });
    const ok = yield* TK().brawl(m, {
      hero: g, seconds: TU.sign.seconds,
      foes: [{ f: j, floor: TU.sign.floor, dealt: TU.sign.dealt, taken: TU.sign.taken, ai: { aggression: 0.8 } }],
      until: () => g.hpFrac < TU.sign.worn,
    });
    ins.off();
    if (!ok) return;
    m.complete('sign');
  } };

  /** The nebula, the massive attack, the break. */
  P.break = { id: 'break', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren, A = b.stage.arena;
    stage(m, { goku: 2 });
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    K.toForm(g, 'uiSign');
    K.toForm(j, 'full');
    TK().place(m, 'goku', [0, 6], 'jiren');
    TK().place(m, 'jiren', [0, -10], 'goku');
    g.setState('scripted', { pose: 'g_uiStance', expression: 'grit', aura: 1 });
    j.setState('scripted', { pose: 'jr_impactW', expression: 'angry', aura: 1 });
    // the arena swallowed by a nebula: the light turns violet and silver, motes everywhere
    b.stage.setMood(0.55, 0x3a1a6a, 1.2);
    const nebula = () => {
      if (b.frame % 2 === 0) b.vfx.sparks(new V3(U.rand(-30, 30), A.y + U.rand(1, 20), U.rand(-30, 30)), b.frame % 4 ? 0xc0a0ff : 0xe8eeff, 2, 3, 0.15);
    };
    m.tickHooks.push(nebula);
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('jiren', 'Then disappear — with everything!', 2.4, { style: 'shout' });
    yield* st.wait(1.6);
    // the massive attack: a red sphere the size of a house
    const geo = new THREE.SphereGeometry(1, 28, 18);
    const mat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.9, depthWrite: false });
    const orb = new THREE.Mesh(geo, mat);
    b.scene.add(orb);
    m.onDispose(() => {
      if (orb.parent) orb.parent.remove(orb);
      geo.dispose();
      mat.dispose();
    });
    j.setState('scripted', { pose: 'jr_impact', expression: 'angry', speed: 20, aura: 1 });
    b.sfx('kiBlastBig', j, { vol: 1.4, pitch: 0.5 });
    const from = j.chest().addScaledVector(j.forward, 2), to = g.chest();
    m.shot((t, o) => {
      o.pos.copy(g.chest()).addScaledVector(g.forward, -3).add(new V3(1.5, 0.8, 0));
      o.look.copy(orb.position);
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 50);
      orb.position.copy(from.clone().lerp(to, k * 0.85));
      orb.scale.setScalar(1 + k * 4);
      return n >= 50;
    };
    const r = yield* st.cue('charge', 'Break through it (Charge)', { auto: 2.6, slow: 0.25 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    // the change completes in the breaking of it: silver — and what was left of the undershirt goes with the blast
    orb.visible = false;
    K.unhook(m, nebula);
    K.toForm(g, 'mui');
    g.setDamage(3, { burst: true });
    SL.ScreenFX.flash(1, '#ffffff');
    b.vfx.explosion(g.chest(), 6, 0xffffff, { smoke: true });
    b.vfx.ring(g.pos.clone().add(new V3(0, 0.2, 0)), 24, SILVER, 1, new V3(0, 1, 0));
    b.sfx('explosionHuge', g, { vol: 1.3 });
    b.cameraTraumaAt(g.chest(), 1);
    g.setState('scripted', { pose: 'powerUp', expression: 'shout', speed: 14, aura: 1 });
    b.sfx('roar', g, { vol: 1, pitch: 0.75 });
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The arms-down beat. */
  P.stillness = { id: 'stillness', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren, A = b.stage.arena;
    stage(m);
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    K.toForm(g, 'mui');
    K.toForm(j, 'full');
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 4, aura: 0.9 });
    j.setState('scripted', { pose: 'jr_stance', expression: 'shock' });
    b.stage.setMood(0.3, 0x2a1a4a, 1.6);
    // wide: the shattered arena, the immense aura
    m.shot((t, o) => {
      o.pos.copy(g.pos).add(new V3(34 - t * 1.5, 14 - t * 0.6, 26 - t * 1.2));
      o.look.copy(g.chest());
      o.fov = 52;
    }, 3.2, { cut: true, blendIn: 0 });
    yield* st.wait(3.2);
    // the slow push in to the silhouette: upright, shoulders relaxed, the arms hanging, the hands loose
    const t0 = performance.now();
    m.shot((t, o) => {
      const k = Math.min(1, (performance.now() - t0) / 4000);
      const c = g.chest();
      o.pos.copy(c).addScaledVector(g.forward, U.lerp(9, 3.4, k)).add(new V3(0.6, U.lerp(0.4, 0.15, k), 0));
      o.look.copy(c).add(new V3(0, 0.2, 0));
      o.fov = U.lerp(46, 40, k);
    }, 999, { hold: true, cut: true, blendIn: 0, subject: g });
    yield* st.wait(4);
    // the silver eyes, calm. MUI-S01 / B-MUI-03 (Roadmap Three, the owner's Gemini research — a research draft, not checked
    // against the footage): the lens pushing in on them; they open on a high, clear chime (aimFree: the framing pass
    // would stand the close-up back to fit the hair)
    g.setState('scripted', { pose: 'g_uiStance', expression: 'closed', speed: 4, aura: 0.9 });
    const e0 = performance.now();
    m.shot((t, o) => {
      // the face point, not the head joint (the joint left the face on the top edge)
      const hd = SL.Cinema.body(g).face, k = U.easeInOutCubic(Math.min(1, (performance.now() - e0) / 1800));
      o.pos.copy(hd).addScaledVector(g.forward, U.lerp(0.85, 0.55, k));
      o.look.copy(hd);
      o.fov = U.lerp(34, 30, k);
    }, 999, { hold: true, cut: true, blendIn: 0, subject: g, face: true, aimFree: true });
    yield* st.wait(0.35);
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 4, aura: 0.9 });
    b.sfx('tierUp', g, { vol: 0.8, pitch: 1.6 });
    m.flags.muiEyesOpen = true;
    yield* st.wait(1.45);
    // reactions: the gods understand what they are seeing
    TK().mood(m, 'disbelief');
    TK().cheer(m, true);
    TK().react(m, 'beerus', 'The hair... the eyes... he\'s completed it.', 2.8);
    yield* st.wait(2.8);
    TK().cheer(m, false);
    TK().mood(m, 'silent');
    TK().react(m, 'whis', 'Mastered Ultra Instinct. Even among the gods, very few ever reach it.', 3.4);
    yield* st.wait(3.4);
    TK().react(m, 'vegeta', 'Kakarot...', 1.8);
    yield* st.wait(1.8);
    // the quiet before Jiren comes again
    SL.Cinema.shotOn(m, S, { subject: 'jiren', with: 'goku', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.music(null, 0);
    yield* st.wait(1.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Phases 1–2: his blows fail to connect; Goku takes control. */
  P.counter = { id: 'counter', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m);
    K.toForm(g, 'mui');
    K.toForm(j, 'full');
    if (g.pos.distanceTo(j.pos) > 16 || g.pos.distanceTo(j.pos) < 3) {
      TK().place(m, 'goku', [0, 5], 'jiren');
      TK().place(m, 'jiren', [0, -5], 'goku');
    }
    g.hp = Math.max(g.hp, g.hpMax * 0.7);
    g.ki = g.kiMax;
    j.hp = j.hpMax;
    // Mastered Ultra Instinct's own cue (soundtrack PDF p.94–95, "Clash of the Gods": an original stand-in)
    m.music('clash_of_gods', 4);
    // Roadmap Three, B-MUI-05: he walks into Jiren's barrage, slipping every blow, and opens with the palm
    yield* SL.Cinema.play(m, 'top_mui_advance');
    const ins = instinct(m, TU.counter.evade, TU.counter.counterMul);
    m.title(CHAPTER, 'MASTERED ULTRA INSTINCT', 'Phase 1 · his blows fail to connect', 2.4);
    m.objective('counter', 'Stay close — every slip opens a counter that lands hard', { icon: 'fist' });
    const ok = yield* TK().brawl(m, { hero: g, ease: false, foes: [{ f: j, floor: TU.counter.floor, dealt: TU.counter.dealt, taken: TU.counter.taken, ai: { aggression: 0.95 } }] });
    ins.off();
    if (!ok) return;
    m.complete('counter');
  } };

  /** Phase 3: he turns on the spectators — Goku protects them. */
  P.protect = { id: 'protect', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m);
    K.toForm(g, 'mui');
    K.toForm(j, 'full');
    g.ki = Math.max(g.ki, g.kiMax * 0.8);
    TK().place(m, 'goku', [0, -12], 'jiren');
    TK().place(m, 'jiren', [0, 4], 'goku');
    const st = ST(m);
    j.controller = K.scripted();
    TK().control(m, 'goku');
    m.lock(true);
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('jiren', 'Then show me. Can you protect them, too?', 2.6);
    yield* st.wait(2.6);
    m.endShot();
    m.objective('protect', 'Power Impacts are flying at the stands — get to each one first (strike or blast it)', { icon: 'target', target: TU.protect.orbs });
    // the stands' front row, where the spheres are going
    const L = b.stage.landmarks;
    const targets = [L.stand(0, -0.6), L.stand(0, 0), L.stand(0, 0.55)];
    const orbs = [];
    b.muiOrbs = orbs;
    const geo = new THREE.SphereGeometry(1, 20, 14);
    let fired = 0, saved = 0, missed = 0, t = 0;
    const fire = () => {
      const mat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.9, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(1.4);
      mesh.position.copy(j.chest()).add(new V3(0, 1.2, 0));
      b.scene.add(mesh);
      const to = targets[fired % targets.length].clone();
      orbs.push({ mesh, mat, to, vel: to.clone().sub(mesh.position).normalize().multiplyScalar(TU.protect.speed) });
      fired++;
      j.setState('scripted', { pose: 'jr_impact', expression: 'cold', speed: 20, aura: 1 });
      b.after(20, () => j.setState('scripted', { pose: 'jr_stance', expression: 'cold', speed: 10 }));
      b.sfx('kiBlastBig', j, { vol: 1, pitch: 0.6 });
    };
    const kill = (o) => {
      if (o.mesh.parent) o.mesh.parent.remove(o.mesh);
      o.mat.dispose();
      orbs.splice(orbs.indexOf(o), 1);
    };
    m.onDispose(() => {
      for (const o of orbs.slice()) kill(o);
      geo.dispose();
      b.muiOrbs = null;
    });
    const hook = () => {
      if (b.inputLocked) return;
      t += 1 / 60;
      if (fired < TU.protect.orbs && t >= fired * TU.protect.gap + 0.5) fire();
      for (const o of orbs.slice()) {
        o.mesh.position.addScaledVector(o.vel, 1 / 60);
        if (b.frame % 3 === 0) b.vfx.trail(o.mesh.position.clone(), RED, 0.6, 0.3);
        const near = g.chest().distanceTo(o.mesh.position);
        const shot = b.projectiles.list.find((p) => p.alive && p.owner === g && p.pos.distanceTo(o.mesh.position) < 2);
        if ((near < 2.4 && (g.state === 'attack' || g.state === 'dash')) || near < 1.4 || shot) {
          if (shot) b.projectiles._explode(shot, true);
          saved++;
          m.progress('protect', saved);
          b.vfx.explosion(o.mesh.position.clone(), 1.6, 0xffd0c0, { smoke: false });
          b.vfx.ring(o.mesh.position.clone(), 3, SILVER, 0.3);
          b.sfx('punchHeavy', g, { vol: 1.1 });
          if (saved === 1) m.say('krillin', 'He knocked it away!', 1.8, { style: 'shout' });
          TK().mood(m, 'excitement', ['krillin', 'tien', 'adult_gohan', 'piccolo', 'android_18']);
          kill(o);
          continue;
        }
        if (o.mesh.position.distanceTo(o.to) < 2.5) {
          missed++;
          // a barrier of the angels takes it — but holding the form through it costs him
          b.vfx.explosion(o.mesh.position.clone(), 2.4, RED, { smoke: true });
          b.vfx.ring(o.to.clone(), 5, 0x8ad8ff, 0.5);
          g.ki = Math.max(0, g.ki - TU.protect.cost);
          b.sfx('explosionBig', null, { at: o.to, vol: 1 });
          if (missed === 1) m.say('whis', 'Our barrier holds — but you must not let him do that, Goku.', 2.6);
          TK().mood(m, 'shock');
          kill(o);
        }
      }
    };
    m.tickHooks.push(hook);
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = true;
    g.storyEvade = { mode: 'god', chance: 1, gap: 4, from: [j], kinds: ['sway', 'step'], swayPose: 'g_uiSlip', stepPose: 'g_uiSlip2', trace: SILVER };
    yield () => (fired >= TU.protect.orbs && !orbs.length) || m.state !== 'running';
    K.unhook(m, hook);
    g.storyEvade = null;
    m.flags.protected = saved;
    m.lock(true);
    if (m.state !== 'running') return;
    m.complete('protect');
    TK().react(m, 'goku', 'Your fight is with me, Jiren.', 2.4);
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Phase 4: Jiren at full power. */
  P.full = { id: 'full', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m);
    K.toForm(g, 'mui');
    K.toForm(j, 'full');
    if (g.pos.distanceTo(j.pos) > 16 || g.pos.distanceTo(j.pos) < 3) {
      TK().place(m, 'goku', [0, 5], 'jiren');
      TK().place(m, 'jiren', [0, -5], 'goku');
    }
    g.hp = Math.max(g.hp, g.hpMax * 0.6);
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    j.hp = j.hpMax * TU.counter.floor;
    // the battle changes: he stops holding anything back, and the release tears his suit away to the waist
    {
      const st0 = ST(m);
      g.controller = K.scripted();
      j.controller = K.scripted();
      K.faceTo(j, g.pos);
      K.faceTo(g, j.pos);
      g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', aura: 0.9 });
      j.setState('scripted', { pose: 'jr_tfHold', expression: 'angry', speed: 6, aura: 0.6 });
      SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('jiren', 'I will not lose. Not to you. Not to anyone!', 2.8, { style: 'shout' });
      yield* st0.wait(1.8);
      j.setState('scripted', { pose: 'jr_tfOpen', expression: 'shout', speed: 14, aura: 1 });
      b.vfx.ring(j.pos.clone().add(new V3(0, 0.2, 0)), 18, RED, 0.8, new V3(0, 1, 0));
      b.vfx.dust(j.pos.clone(), 6, 24);
      b.sfx('transformBurst', j, { vol: 1.3, pitch: 0.6 });
      b.sfx('roar', j, { vol: 0.9, pitch: 0.55 });
      b.cameraTraumaAt(j.chest(), 0.8);
      j.setDamage(2, { burst: true });
      // pull back on the whole silhouette in the red, Goku small and still at the edge of frame
      m.shot((t, o, el) => {
        const k = Math.min(1, el / 1.4);
        o.pos.copy(j.pos).addScaledVector(j.forward, 4 + k * 8).add(new V3(2.2, 0.3 + k * 1.8, 0));
        o.look.copy(j.chest()).add(new V3(0, 0.4, 0));
        o.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* st0.wait(1.8);
      TK().mood(m, 'shock');
      TK().react(m, 'beerus', 'He was still holding back?!', 2.2, { style: 'shout' });
      yield* st0.wait(2.2);
      TK().mood(m, 'pride', ['toppo', 'dyspo']);
      m.endShot();
      b.skipRequested = false;
    }
    const ins = instinct(m, TU.full.evade, TU.full.counterMul);
    m.title(CHAPTER, 'FULL POWER', 'Jiren holds nothing back now', 2.4);
    m.objective('full', 'Heavier, faster — the form still has the edge, but it is burning', { icon: 'fist' });
    const ok = yield* TK().brawl(m, { hero: g, foes: [{ f: j, floor: TU.full.floor, dealt: TU.full.dealt, taken: TU.full.taken, ai: { aggression: 0.95 } }] });
    ins.off();
    if (!ok) return;
    m.complete('full');
  } };

  /** Goku standing over Jiren. */
  P.over = { id: 'over', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, { jiren: 2 });
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    K.toForm(g, 'mui');
    K.toForm(j, 'full');
    // Roadmap Three, B-MUI-07: the rush that puts him on his back
    yield* SL.Cinema.play(m, 'top_mui_takedown');
    const c = K.ground(b, new V3(U.clamp(j.pos.x, -20, 20), 0, U.clamp(j.pos.z, -20, 20)));
    K.place(j, c, 0);
    K.place(g, K.ground(b, c.clone().add(new V3(0, 0, 2.2))), Math.PI);
    K.faceTo(g, j.pos);
    K.faceTo(j, g.pos);
    j.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
    g.setState('scripted', { pose: 'g_uiStance', expression: 'determined', aura: 0.8 });
    // from the ground beside Jiren, tilting up to Goku
    m.shot((t, o, el) => {
      const k = Math.min(1, el / 2.6);
      o.pos.copy(j.pos).add(new V3(1.2, 0.35, -0.6));
      o.look.copy(g.pos).add(new V3(0, 0.3 + k * g.height * 1.1, 0));
      o.fov = 56;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(2.8);
    m.say('jiren', 'Finish it. Prove that your strength is greater.', 3);
    yield* st.wait(3);
    // the reverse: his view up at Goku
    m.shot((t, o) => {
      const hd = g.headPos();
      o.pos.copy(j.headPos ? j.headPos() : j.chest()).add(new V3(0, 0.2, 0));
      o.look.copy(hd);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('goku', 'I\'m not fighting you to hurt you, Jiren. Strength isn\'t everything — I\'m fighting for everybody behind me.', 4.2);
    yield* st.wait(4.2);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The form's limit. */
  P.limit = { id: 'limit', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, { jiren: 2 });
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    K.toForm(g, 'mui');
    g.setState('scripted', { pose: 'g_uiStance', expression: 'determined', aura: 0.8 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.8);
    // the sound of the battle falls away
    m.music(null, 0);
    b.sfx('heartbeat', g, { vol: 1.1, pitch: 0.8 });
    // the silver flickers... and is gone. MUI-S04 (Roadmap Three, the owner's Gemini research — a research draft, not
    // checked against the footage): close on him, the lens shaking as if held by hand, silver lightning tearing across
    // his body as the form breaks (the draft's blood is not taken: the owner keeps injuries non-graphic)
    m.shot((t, o, el) => {
      const h = g.headPos(), fw = g.forward.clone().setY(0).normalize(), sd = new V3(fw.z, 0, -fw.x);
      const jit = Math.sin(el * 37) * 0.035 + Math.sin(el * 23 + 1) * 0.025;
      o.pos.copy(h).addScaledVector(fw, 1.9).addScaledVector(sd, 0.45 + jit).add(new V3(0, -0.1 + jit * 0.8, 0));
      o.look.copy(h).add(new V3(0, -0.18, 0));
      o.fov = 40;
      o.roll = Math.sin(el * 11) * 0.035;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.flags.muiOverload = true;
    for (let i = 0; i < 8 && !st.skip.on; i++) {
      g.model.setForm(g.def.forms[K.formIndex(g, i % 2 ? 'mui' : 'base')]);
      g.setState('scripted', { pose: 'g_uiStance', expression: 'hurt', aura: i % 2 ? 0.8 : 0 });
      for (let k = 0; k < 2; k++) b.vfx.bolt(g.chest().add(new V3(U.rand(-0.35, 0.35), U.rand(-0.5, 0.6), U.rand(-0.35, 0.35))), 0.8, SILVER);
      b.vfx.sparks(g.chest(), SILVER, 6, 6, 0.12);
      b.camera.addTrauma(0.12);
      yield* st.wait(i < 4 ? 0.18 : 0.1);
    }
    K.toForm(g, 'base');
    g.setState('scripted', { pose: 'g_defeatStagger', expression: 'hurt', speed: 6, aura: 0 });
    // he buckles; the camera follows him down
    m.shot((t, o, el) => {
      const c = g.chest();
      o.pos.copy(c).add(new V3(2.2, 0.4 - Math.min(1, el) * 0.6, 2));
      o.look.copy(c);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1);
    g.setState('scripted', { pose: 'knockdownFace', expression: 'exhausted', speed: 8 });
    b.vfx.dust(g.pos.clone(), 1.2, 8);
    b.sfx('groundImpact', g, { vol: 0.8 });
    TK().mood(m, 'concern');
    // MUI-S05 (research draft): high above, the lens pulling slowly back and up into the void — Goku alone on the broken
    // stone
    const fell = g.pos.clone();
    m.shot((t, o, el) => {
      const k = Math.min(1, el / 2.6), e = 1 - (1 - k) * (1 - k);
      o.pos.copy(fell).add(new V3(3 + 14 * e, 6 + 13 * e, 4 + 20 * e));
      o.look.copy(fell);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.flags.muiPullBack = true;
    yield* st.wait(2.4);
    TK().react(m, 'whis', 'His body could not bear it any longer. The form is gone.', 3);
    yield* st.wait(3);
    // Jiren gets up
    j.setState('scripted', { pose: 'jr_stance', expression: 'angry', speed: 6, aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('jiren', 'So that is your limit.', 2.2);
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'ULTRA INSTINCT', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.topMui = { TU };
  SL.data.missions.top_mui = {
    id: 'top_mui', canon: true, chapter: CHAPTER, title: 'Ultra Instinct', character: 'goku', stage: 'top_arena',
    subtitle: 'The Tournament of Power · Mastered Ultra Instinct Goku vs Jiren', parTime: 780, qteLabel: 'The break',
    blurb: 'Vegeta\'s energy in him and one fighter left between Universe 7 and the end. This time the silver does not stop at his eyes.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'none', emblem: 'none' }, adult_gohan: { outfit: 'ag_ultimate' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'uiSign', 'mui'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Form: Goku — Mastered Ultra Instinct'],
    setup,
    phases: [P.open, P.sign, P.break, P.stillness, P.counter, P.protect, P.full, P.over, P.limit],
  };
})();
