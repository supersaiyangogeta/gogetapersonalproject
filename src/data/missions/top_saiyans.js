/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "The Berserker" (Goku vs Caulifla and Kale; Kefla's birth).
 * Tournament of power ui.docx §4 and the Kale sections: an exhausted Goku against the Universe 6 Saiyans in the green
 * void. Against Caulifla — fast and direct, and she learns from him. Against Kale — her power surges out of control:
 * the low-angle tilt from her boots as the body swells, the lime-green mane, the blank white eyes, the emerald pressure
 * wave; Super Saiyan 2 Goku in his wide stance and his punches bouncing off her; he leaps back into Blue and fires a
 * Kamehameha point-blank — she walks through it, takes him by the face and slams him into the stone. Against both —
 * pressure from two sides. Then Champa's Potara earrings, and Kefla.
 *
 *   OPEN *       (scene top_saiyans_open) the green void; Goku, still worn from Jiren; the two of them come for him
 *   CAULIFLA *   (play)           Super Saiyan God Goku vs Super Saiyan Caulifla: quick and close. Ring-out / KO =
 *                                 defeat. Ends on her floor
 *   LESSON       (staged)         "Watch close": Goku shows her Super Saiyan 2 — and she has it at once
 *   BERSERK      (staged)         Kale, left behind, breaks — the ToP refinement brief's nine steps: her face changes, the
 *                                 body tenses, the energy surges (dust driven out, stones lifting), the hair flickers and
 *                                 goes green, the body swells (the tilt up from her boots), the aura blows outward, the
 *                                 camera pulls back to the scale of it, everyone reacts, and she charges
 *   JUGGERNAUT * (play)           Super Saiyan 2 Goku vs Berserk Kale: his blows do nothing (storyNoSell) — survive her
 *                                 rush until he can get clear
 *   THROUGH      (cue + staged)   back, Blue, the Kamehameha point-blank (Ult) — she walks through it, the grab, the slam
 *   BOTH *       (play)           Blue Goku against Super Saiyan 2 Caulifla and Kale together (TK.brawl): two directions
 *                                 at once. Ends on their floors or the clock
 *   POTARA       (staged)         Champa's earrings: each puts one on (close on the hand at the ear); the pull together,
 *                                 the light, a silhouette in it; Kefla from the boots up; she tests her speed round him;
 *                                 the stands; "Call me Kefla" — and she is on him before the title
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
  const GREEN = 0x5aff3a;
  const TU = {
    caulifla: { floor: 0.55, dealt: 0.3, taken: 0.5 },
    juggernaut: { seconds: 22, dealt: 0.1 },
    both: { seconds: 45, caulifla: { floor: 0.35, dealt: 0.13, taken: 0.8 }, kale: { floor: 0.45, dealt: 0.07, taken: 0.5 } },
  };
  const SPOT = { goku: [0, 8], caulifla: [-3, -8], kale: [4, -10] };
  // putting on a Potara earring: the hand up at the ear, the head tipped toward it
  SL.data.poses.tp_earL = { root: { y: -0.01 }, chest: [-2, 6, 0], head: [-4, 8, 14], shoulderL: [-120, 0, 46], elbowL: [-138, 0, 0], shoulderR: [-14, 0, -16], elbowR: [-30, 0, 0], thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0], hands: ['point', 'fist'] };
  SL.data.poses.tp_earR = { root: { y: -0.01 }, chest: [-2, -6, 0], head: [-4, -8, -14], shoulderR: [-120, 0, -46], elbowR: [-138, 0, 0], shoulderL: [-14, 0, 16], elbowL: [-30, 0, 0], thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0], hands: ['fist', 'point'] };

  SL.data.scenes.top_saiyans_open = {
    id: 'top_saiyans_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    // the Tournament of Power's own battle music (soundtrack PDF p.91–92, "Genkai Toppa x Survivor": an original stand-in)
    music: { song: 'limit_survivor', level: 1 },
    auraCap: 0,
    events: [
      {
        cam: { from: [-60, 30, 70], to: [-30, 14, 40], look: [0, 4, 0], look2: [0, 3, 4], fov: 54, fov2: 48, ease: 'inOut', raw: true },
        pose: [{ who: 'goku', pose: 'exhausted', face: 'hurt' }],
        title: { chapter: CHAPTER, title: 'THE BERSERKER', subtitle: 'The Saiyans of Universe 6', duration: 4.2 },
        hold: 4.3,
      },
      // the doc's reference still: over Kale's shoulder, Goku small and worn on the rubble opposite
      {
        pose: [{ who: 'caulifla', pose: 'cf_intro', face: 'smirk' }, { who: 'kale', pose: 'ka_shy', face: 'sad' }],
        cam: { subject: 'goku', over: 'caulifla', focus: 'full', angle: 'ots' },
        say: { who: 'caulifla', line: 'You\'re the guy who taught Cabba, right? The one who can go past Super Saiyan.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }],
        say: { who: 'goku', line: 'Heh. I\'m a little beat up right now... but sure. Let\'s see what you\'ve got!', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'kale', focus: 'upper', angle: 'three' },
        say: { who: 'kale', line: 'S-sis... be careful...', duration: 2 },
        hold: 2.1,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      for (const id of ['goku', 'caulifla', 'kale']) K.place(S[id], K.ground(b, new V3(SPOT[id][0], 0, SPOT[id][1])), 0);
      K.faceTo(S.goku, S.caulifla.pos);
      K.faceTo(S.caulifla, S.goku.pos);
      K.faceTo(S.kale, S.goku.pos);
    },
  };

  function setup(b) {
    const S = TK().setup(b, {
      player: 'goku', fight: ['goku', 'caulifla', 'kale', 'kefla'],
      seat: ['beerus', 'whis', 'champa', 'vados', 'krillin', 'tien', 'roshi'],
      edge: { vegeta: [-30, 20], jiren: [30, -24], dyspo: [25, -28] },
    });
    for (const id of ['goku', 'caulifla', 'kale']) K.place(S[id], K.ground(b, new V3(SPOT[id][0], 0, SPOT[id][1])), 0);
    S.kefla.setHidden(true);
    S.kefla.untargetable = S.kefla.intangible = true;
    K.faceTo(S.goku, S.caulifla.pos);
    K.faceTo(S.caulifla, S.goku.pos);
    K.faceTo(S.kale, S.goku.pos);
    return S;
  }

  function stage(m) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    TK().seat(m);
    TK().edge(m);
    BK.give(S.goku, ['god', 'ssj2', 'blue']);
    BK.give(S.caulifla, ['ssj', 'ssj2']);
    BK.give(S.kale, ['berserk', 'controlled']);
    for (const f of [S.goku, S.caulifla, S.kale]) {
      f.untargetable = f.intangible = false;
      f.storyNoSell = null;
    }
    S.kefla.setHidden(true);
    S.kefla.untargetable = S.kefla.intangible = true;
    // Goku is still worn down from Jiren: the story's own wear on his body
    // since the Spirit Bomb the orange top is gone: the navy undershirt, holed, the trousers torn (DAMAGE_GOKU_TOP)
    if (S.goku.setDamage) S.goku.setDamage(2);
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m);
    const S = m.battle.story;
    K.toForm(S.goku, 'base');
    K.toForm(S.caulifla, 'base');
    K.toForm(S.kale, 'base');
    yield* SL.Cinema.play(m, 'top_saiyans_open');
  } };

  /** God against Caulifla: quick and close. */
  P.caulifla = { id: 'caulifla', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, c = S.caulifla, k = S.kale;
    stage(m);
    K.toForm(g, 'god');
    K.toForm(c, 'ssj');
    K.toForm(k, 'base');
    TK().place(m, 'goku', SPOT.goku, 'caulifla');
    TK().place(m, 'caulifla', SPOT.caulifla, 'goku');
    K.place(k, K.ground(b, new V3(14, 0, -14)), 0);
    K.watcher(k, 'ka_shy', 'sad');
    K.faceTo(k, g.pos);
    g.hp = g.hpMax * 0.8;
    g.ki = g.kiMax * 0.6;
    c.hp = c.hpMax;
    m.title(CHAPTER, 'GOKU VS CAULIFLA', 'Super Saiyan God · worn down from Jiren', 2.4);
    m.objective('caulifla', 'She is fast and she learns — keep it close and controlled', { icon: 'fist' });
    m.objective('ring', 'Stay on the platform', { icon: 'target' });
    const ok = yield* TK().brawl(m, { hero: g, foes: [{ f: c, floor: TU.caulifla.floor, dealt: TU.caulifla.dealt, taken: TU.caulifla.taken, ai: { aggression: 0.85 } }] });
    if (!ok) return;
    m.complete('caulifla');
    m.complete('ring');
  } };

  /** "Watch close": Super Saiyan 2 — and she has it at once. */
  P.lesson = { id: 'lesson', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, c = S.caulifla, k = S.kale;
    stage(m);
    const st = ST(m);
    for (const f of [g, c, k]) f.controller = K.scripted();
    K.toForm(g, 'base');
    K.toForm(c, 'ssj');
    TK().place(m, 'goku', [0, 6], 'caulifla');
    TK().place(m, 'caulifla', [0, -2], 'goku');
    TK().place(m, 'kale', [6, -6], 'caulifla');
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
    c.setState('scripted', { pose: 'cf_stance', expression: 'angry' });
    k.setState('scripted', { pose: 'ka_shy', expression: 'sad' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'caulifla', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Okay, watch close. Super Saiyan... and then past it.', 2.8);
    yield* st.wait(2);
    K.toForm(g, 'ssj2');
    b.vfx.ring(g.pos.clone().add(new V3(0, 0.1, 0)), 7, 0xffd23a, 0.5, new V3(0, 1, 0));
    b.vfx.flash(g.chest(), 2.4, 0xffe27a, 0.4, SL.Toon.tex.glow);
    b.sfx('transformBurst', g, { vol: 0.9 });
    g.setState('scripted', { pose: 'g_ssjClench', expression: 'shout', speed: 10, aura: 1 });
    yield* st.wait(1.6);
    SL.Cinema.shotOn(m, S, { subject: 'caulifla', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('caulifla', 'Like this, huh? ...HAAAAH!', 2.2, { style: 'shout' });
    c.setState('scripted', { pose: 'powerUp', expression: 'shout', speed: 12, aura: 1 });
    yield* st.wait(1.2);
    K.toForm(c, 'ssj2');
    b.vfx.ring(c.pos.clone().add(new V3(0, 0.1, 0)), 7, 0xffe25a, 0.5, new V3(0, 1, 0));
    b.vfx.flash(c.chest(), 2.4, 0xffe27a, 0.4, SL.Toon.tex.glow);
    b.sfx('transformBurst', c, { vol: 0.9 });
    c.setState('scripted', { pose: 'cf_victory', expression: 'grin', speed: 8, aura: 1 });
    yield* st.wait(1.4);
    TK().react(m, 'beerus', 'She got it in one try?! What kind of Saiyans does Universe 6 have?!', 3, { style: 'shout' });
    yield* st.wait(3);
    SL.Cinema.shotOn(m, S, { subject: 'kale', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    k.setState('scripted', { pose: 'ka_shy', expression: 'sad', speed: 4 });
    m.say('kale', 'Sis... is going somewhere I can\'t follow...', 2.8);
    yield* st.wait(2.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Kale breaks: the berserk transformation (ToP refinement brief §19, the nine steps; Tournament of power ui §2). */
  P.berserk = { id: 'berserk', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, c = S.caulifla, k = S.kale;
    stage(m);
    const st = ST(m);
    for (const f of [g, c, k]) f.controller = K.scripted();
    K.toForm(g, 'ssj2');
    K.toForm(c, 'ssj2');
    K.toForm(k, 'base');
    TK().place(m, 'goku', [0, 8], 'caulifla');
    TK().place(m, 'caulifla', [-4, 1], 'goku');
    TK().place(m, 'kale', [5, -6], 'caulifla');
    g.setState('scripted', { pose: 'g_godStance', expression: 'serious', aura: 0.5 });
    c.setState('scripted', { pose: 'cf_stance', expression: 'grin', aura: 0.8 });
    k.setState('scripted', { pose: 'ka_shy', expression: 'sad', speed: 4 });
    const right = (f) => new V3(f.forward.z, 0, -f.forward.x);
    const face = (f, dist, side, fov) => m.shot((t, o) => {
      const hd = f.headPos();
      o.pos.copy(hd).addScaledVector(f.forward, dist).addScaledVector(right(f), side).add(new V3(0, -0.1, 0));
      o.look.copy(hd).add(new V3(0, -0.04, 0));
      o.fov = fov;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: f, face: true });
    // 1. HER FACE CHANGES: close on Kale, watching her sister run ahead of her
    face(k, 1.3, 0.3, 40);
    m.say('kale', 'Sis... you\'re so far ahead of me now...', 2.6);
    yield* st.wait(2.7);
    SL.Cinema.shotOn(m, S, { subject: 'caulifla', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('caulifla', 'You see that, Kale? I\'ve got it now — Super Saiyan 2!', 2.6);
    yield* st.wait(2.6);
    // 2. THE BODY TENSES: the shoulders draw in, the fists close, a tremor
    k.setState('scripted', { pose: 'ka_shy', expression: 'grit', speed: 3, aura: 0.15 });
    face(k, 1.6, -0.35, 42);
    b.sfx('heartbeat', k, { vol: 1 });
    const tremor = () => (b.camera.trauma = Math.max(b.camera.trauma, 0.06));
    m.tickHooks.push(tremor);
    m.say('kale', '...left... behind...', 1.8);
    yield* st.wait(2);
    // 3. THE ENERGY SURGES: green lightning, the dust driven out from her feet, stones lifting
    const surge = () => {
      if (b.frame % 3 === 0) b.vfx.streamInward(k.chest(), 4, GREEN, 3, 0.2, 0.4);
      if (b.frame % 6 === 0) b.vfx.bolt(k.chest().add(new V3(U.rand(-0.8, 0.8), U.rand(-0.8, 0.8), U.rand(-0.8, 0.8))), U.rand(0.6, 1.2), GREEN);
      if (b.frame % 8 === 0) b.vfx.rock(k.pos.clone().add(new V3(U.rand(-4, 4), 0.1, U.rand(-4, 4))), new V3(0, U.rand(2, 5), 0), U.rand(0.1, 0.3), 0xa29884);
      if (b.frame % 24 === 0) b.vfx.dust(k.pos.clone(), 1.8, 4);
      b.camera.trauma = Math.max(b.camera.trauma, 0.12);
    };
    m.tickHooks.push(surge);
    K.unhook(m, tremor);
    k.setState('scripted', { pose: 'ka_shy', expression: 'grit', speed: 3, aura: 0.5 });
    m.shot((t, o, el) => {
      const a = el * 0.35;
      o.pos.copy(k.pos).add(new V3(Math.sin(a) * 5.5, 1.1, Math.cos(a) * 5.5));
      o.look.copy(k.chest());
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('kiUp', k, { vol: 1, pitch: 0.7 });
    yield* st.wait(1.8);
    // 4. THE HAIR: it flickers between the two — then the green holds
    const bi = K.formIndex(k, 'berserk'), base = K.formIndex(k, 'base');
    face(k, 1.5, 0.2, 44);
    for (let i = 0; i < 6 && !st.skip.on; i++) {
      k.model.setForm(k.def.forms[i % 2 ? base : bi]);
      k.model.root.scale.setScalar(k.model.baseScale);
      yield* st.wait(0.1);
    }
    // 5. THE BODY SWELLS: the tilt up from her boots as the muscle comes (the scale grows, it does not jump)
    K.toForm(k, 'berserk');
    const s1 = k.model.root.scale.x, s0 = k.model.baseScale;
    k.model.root.scale.setScalar(s0);
    // the aura held down while the body grows (her own aura shell swallowed the low shot): it blows out at step 6
    k.setState('scripted', { pose: 'ka_roar', expression: 'shout', speed: 5, aura: 0.12 });
    let n = 0;
    const swell = () => {
      n++;
      const e = Math.min(1, n / 80);
      k.model.root.scale.setScalar(U.lerp(s0, s1, 1 - (1 - e) * (1 - e)));
    };
    m.tickHooks.push(swell);
    const t0 = performance.now();
    m.shot((t, o) => {
      const kk = Math.min(1, (performance.now() - t0) / 2600);
      o.pos.copy(k.pos).addScaledVector(k.forward, 3.8).add(new V3(0.8, 0.25, 0));
      o.look.copy(k.pos).add(new V3(0, 0.2 + kk * k.height * 0.95, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('kale', 'AAAAAAAAH!', 2.2, { style: 'shout' });
    b.sfx('ssjRise', k, { vol: 1.1, pitch: 0.6 });
    yield* st.wait(2.4);
    K.unhook(m, swell);
    k.model.root.scale.setScalar(s1);
    // 6. THE AURA BLOWS OUTWARD: the emerald pressure wave
    k.setState('scripted', { pose: 'ka_roar', expression: 'shout', speed: 10, aura: 1 });
    SL.ScreenFX.flash(0.35, '#b8ff9a');
    b.vfx.ring(k.pos.clone().add(new V3(0, 0.2, 0)), 24, GREEN, 0.9, new V3(0, 1, 0));
    b.vfx.ring(k.chest(), 8, 0xc8ffb0, 0.5);
    b.vfx.dust(k.pos.clone(), 8, 34);
    b.stage.ringCrack(K.ground(b, k.pos.clone()), 4, 1, null);
    b.sfx('roar', k, { vol: 1.2, pitch: 0.8 });
    b.cameraTraumaAt(k.chest(), 0.9);
    // 7. THE CAMERA PULLS BACK to the scale of it: Goku and Caulifla small at the edges of the frame
    m.shot((t, o, el) => {
      const c0 = k.chest(), kk = Math.min(1, el / 1.8);
      o.pos.copy(c0).addScaledVector(k.forward, 4 + kk * 9).add(new V3(2.5, 0.8 + kk * 2.4, 0));
      o.look.copy(c0).add(new V3(0, 0.3, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    // the others are pushed back by it
    for (const f of [g, c]) {
      const d = f.pos.clone().sub(k.pos).setY(0).normalize();
      K.place(f, K.ground(b, f.pos.clone().addScaledVector(d, 1.6)), f.yaw);
    }
    g.setState('scripted', { pose: 'guard', expression: 'shock', speed: 12, aura: 0.6 });
    c.setState('scripted', { pose: 'guard', expression: 'shock', speed: 12, aura: 0.6 });
    TK().mood(m, 'shock');
    yield* st.wait(2.4);
    // 8. EVERYONE REACTS
    K.unhook(m, surge);
    SL.Cinema.shotOn(m, S, { subject: 'kale', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.3);
    TK().react(m, 'goku', 'Whoa... her power\'s still climbing!', 2.2);
    g.setState('scripted', { pose: 'g_godStance', expression: 'serious', speed: 6, aura: 0.8 });
    yield* st.wait(2.2);
    TK().react(m, 'caulifla', 'Kale?! Hey — snap out of it!', 2.2, { style: 'shout' });
    yield* st.wait(2.2);
    TK().react(m, 'champa', 'KALE!! That\'s it — that\'s the power! Go, go, GO!', 2.8, { style: 'shout' });
    K.watcher(S.champa, 'ch6_shout', 'grin');
    yield* st.wait(2.8);
    TK().react(m, 'beerus', 'That power... it\'s like that Broly. She can\'t control it at all.', 3);
    K.watcher(S.beerus, 'sp_lean', 'serious');
    yield* st.wait(3);
    TK().react(m, 'whis', 'She is drawing on far more than her body can hold. Careful, Goku.', 2.8);
    yield* st.wait(2.8);
    TK().mood(m, null);
    // 9. SHE CHARGES — no hesitation now: straight at Goku, and he has to take it on his guard
    K.faceTo(k, g.pos);
    k.setState('scripted', { pose: 'ka_berserk', expression: 'angry', speed: 8, aura: 1 });
    const kFrom = k.pos.clone(), kTo = K.ground(b, k.pos.clone().lerp(g.pos, 0.82));
    m.shot((t, o) => {
      const mid = k.chest().lerp(g.chest(), 0.5);
      const d = g.pos.clone().sub(kFrom).setY(0).normalize();
      o.pos.copy(mid).add(new V3(-d.z, 0, d.x).multiplyScalar(8)).add(new V3(0, 1.4, 0));
      o.look.copy(mid);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('dash', k, { vol: 1.2, pitch: 0.7 });
    n = 0;
    yield () => {
      n++;
      const e = Math.min(1, n / 20);
      K.place(k, kFrom.clone().lerp(kTo, e * e), k.yaw);
      if (n % 2 === 0) {
        b.vfx.trail(k.chest(), GREEN, 0.6, 0.3);
        b.vfx.dust(k.pos.clone(), 0.8, 2);
      }
      return n >= 20 || st.skip.on;
    };
    k.setState('scripted', { pose: 'ka_grab', expression: 'shout', speed: 20, aura: 1 });
    g.setState('scripted', { pose: 'guard', expression: 'grit', speed: 20, aura: 0.8 });
    b.vfx.explosion(g.chest(), 1.4, GREEN, { smoke: false });
    b.sfx('punchHeavy', g, { vol: 1.4, pitch: 0.7 });
    b.cameraTraumaAt(g.chest(), 0.8);
    const gFrom = g.pos.clone(), gTo = K.ground(b, g.pos.clone().addScaledVector(g.forward, -2.6));
    n = 0;
    yield () => {
      n++;
      K.place(g, gFrom.clone().lerp(gTo, Math.min(1, n / 18)), g.yaw);
      if (n % 3 === 0) b.vfx.dust(g.pos.clone(), 0.6, 3);
      return n >= 18 || st.skip.on;
    };
    yield* st.wait(0.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The juggernaut: his blows bounce off her. */
  P.juggernaut = { id: 'juggernaut', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, c = S.caulifla, k = S.kale;
    stage(m);
    K.toForm(g, 'ssj2');
    K.toForm(k, 'berserk');
    K.toForm(c, 'ssj2');
    TK().place(m, 'goku', [0, 8], 'kale');
    TK().place(m, 'kale', [0, -4], 'goku');
    K.place(c, K.ground(b, new V3(-16, 0, -10)), 0);
    K.watcher(c, 'cf_stance', 'shock');
    K.faceTo(c, k.pos);
    g.hp = Math.max(g.hp, g.hpMax * 0.75);
    // the doc: his punches bounce off her skin — dull taps, no flinch
    k.storyNoSell = { from: [g], mul: 0.04 };
    m.title(CHAPTER, 'BERSERK', 'Super Saiyan 2 Goku vs Kale', 2.2);
    m.objective('survive', 'Your blows bounce off her — survive the rush until you can get clear', { icon: 'target' });
    let said = false;
    const ok = yield* TK().brawl(m, {
      hero: g, seconds: TU.juggernaut.seconds,
      foes: [{ f: k, floor: 0.05, dealt: TU.juggernaut.dealt, taken: 1, ai: { aggression: 0.95, defense: 0.05 } }],
      until: (t) => {
        if (!said && t > 5) {
          said = true;
          m.say('goku', 'My punches... aren\'t even reaching her!', 2.4);
        }
        return false;
      },
    });
    k.storyNoSell = null;
    if (!ok) return;
    m.complete('survive');
  } };

  /** Back, Blue, the Kamehameha — she walks through it. */
  P.through = { id: 'through', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, k = S.kale;
    stage(m);
    const st = ST(m);
    g.controller = K.scripted();
    k.controller = K.scripted();
    K.toForm(k, 'berserk');
    TK().place(m, 'goku', [g.pos.x, U.clamp(g.pos.z + 4, -20, 24)], 'kale');
    TK().place(m, 'kale', [g.pos.x, U.clamp(g.pos.z - 7, -24, 20)], 'goku');
    K.faceTo(g, k.pos);
    K.faceTo(k, g.pos);
    K.toForm(g, 'blue');
    b.vfx.flash(g.chest(), 2.4, 0x8ae0ff, 0.4, SL.Toon.tex.glow);
    b.sfx('transformBurst', g, { vol: 0.9 });
    g.setState('scripted', { pose: 'g_kameCharge', expression: 'shout', aura: 1 });
    k.setState('scripted', { pose: 'ka_berserk', expression: 'angry' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'kale', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Then try THIS! Ka... me... ha... me...', 2.6, { style: 'shout' });
    const r = yield* st.cue('ult', 'HA! — fire it point-blank (Ultimate)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    g.setState('scripted', { pose: 'g_kameFire', expression: 'shout', speed: 30, aura: 1 });
    b.sfx('beamFire', g, { vol: 1.3 });
    const hand = () => g.chest().addScaledVector(g.forward, 0.5);
    const beam = () => {
      const a = hand(), e = a.clone().addScaledVector(g.forward, 30);
      if (b.frame % 2 === 0) {
        b.vfx.slash(a, e, 0x8ad8ff, 0.12, 0.6);
        b.vfx.flash(a, 1.4, 0xe0f6ff, 0.1, SL.Toon.tex.glow);
      }
    };
    m.tickHooks.push(beam);
    // she walks straight through it
    m.shot((t, o) => {
      const mid = g.chest().lerp(k.chest(), 0.5);
      o.pos.copy(mid).add(new V3(8, 1.5, 2));
      o.look.copy(mid);
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    k.setState('scripted', { pose: 'ka_grab', expression: 'angry', speed: 6 });
    const kFrom = k.pos.clone(), kTo = K.ground(b, g.pos.clone().addScaledVector(g.forward, 1.3));
    let n = 0;
    yield () => {
      n++;
      K.place(k, kFrom.clone().lerp(kTo, Math.min(1, n / 90)), k.yaw);
      if (n % 4 === 0) b.vfx.sparks(k.chest(), 0x8ad8ff, 4, 10, 0.1);
      return n >= 90;
    };
    K.unhook(m, beam);
    TK().react(m, 'krillin', 'She walked right through it?!', 2, { style: 'shout' });
    yield* st.wait(1.4);
    // the grab, the slam
    SL.Cinema.shotOn(m, S, { subject: 'kale', with: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    g.setState('scripted', { pose: 'hitBack', expression: 'shock', speed: 30 });
    yield* st.wait(0.5);
    k.setState('scripted', { pose: 'hammer', expression: 'shout', speed: 30 });
    const floor = K.ground(b, g.pos.clone());
    g.setPosition(floor);
    g.setState('scripted', { pose: 'knockdown', expression: 'hurt', speed: 30 });
    b.stage.ringCrack(floor, 4, 1.5, null);
    b.vfx.dust(floor.clone(), 3, 20);
    b.sfx('groundImpact', g, { vol: 1.3 });
    b.cameraTraumaAt(floor, 1);
    g.hp = Math.max(1, g.hp - g.hpMax * 0.12);
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Two at once: Caulifla in Super Saiyan 2 and Kale, her power in hand now (the controlled state). */
  P.both = { id: 'both', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, c = S.caulifla, k = S.kale;
    stage(m);
    const st = ST(m);
    K.toForm(g, 'blue');
    K.toForm(c, 'ssj2');
    K.toForm(k, 'berserk');
    TK().place(m, 'goku', [0, 4], 'kale');
    TK().place(m, 'caulifla', [-8, -6], 'goku');
    TK().place(m, 'kale', [8, -6], 'goku');
    // Caulifla talks her down: the berserk body settles into the controlled one — smaller, the eyes back, focused
    for (const f of [g, c, k]) f.controller = K.scripted();
    g.setState('scripted', { pose: 'g_godStance', expression: 'serious', aura: 0.6 });
    c.setState('scripted', { pose: 'cf_stance', expression: 'shout', aura: 0.8 });
    k.setState('scripted', { pose: 'ka_berserk', expression: 'angry', aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'caulifla', with: 'kale', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('caulifla', 'Kale! It\'s me! Don\'t let it run you — point it at HIM!', 2.8, { style: 'shout' });
    yield* st.wait(2.8);
    K.toForm(k, 'controlled');
    k.setState('scripted', { pose: 'ka_ctrl', expression: 'determined', speed: 6, aura: 1 });
    b.vfx.ring(k.pos.clone().add(new V3(0, 0.2, 0)), 6, GREEN, 0.5, new V3(0, 1, 0));
    b.sfx('kiUp', k, { vol: 0.9, pitch: 0.8 });
    SL.Cinema.shotOn(m, S, { subject: 'kale', focus: 'upper', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('kale', '...Sis. I\'ve got it.', 2);
    yield* st.wait(2);
    TK().react(m, 'goku', 'She\'s controlling it now... this just got fun!', 2.4);
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
    g.hp = Math.max(g.hp, g.hpMax * 0.7);
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    c.hp = Math.min(c.hp, c.hpMax * TU.caulifla.floor);
    k.hp = k.hpMax;
    m.title(CHAPTER, 'TWO ON ONE', 'Blue Goku vs Caulifla and Kale', 2.4);
    m.objective('both', 'They come from two sides — keep both of them in front of you', { icon: 'fist' });
    m.objective('ring', 'Stay on the platform', { icon: 'target' });
    const B = TU.both;
    const ok = yield* TK().brawl(m, {
      hero: g, seconds: B.seconds,
      foes: [
        // staggered: Caulifla keeps him moving in short bursts, Kale commits when he is busy — never both on the same beat
        { f: c, floor: B.caulifla.floor, dealt: B.caulifla.dealt, taken: B.caulifla.taken, ai: { aggression: 0.7, rhythm: { burst: 3, rest: 40 } } },
        { f: k, floor: B.kale.floor, dealt: B.kale.dealt, taken: B.kale.taken, ai: { aggression: 0.55, rhythm: { burst: 2, rest: 64 } } },
      ],
    });
    if (!ok) return;
    m.complete('both');
    m.complete('ring');
  } };

  /** Champa's earrings: Kefla (ToP refinement brief §51; Tournament of power ui: the fusion, then a single, far more dangerous opponent). */
  P.potara = { id: 'potara', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, c = S.caulifla, k = S.kale, kf = S.kefla;
    stage(m);
    const st = ST(m);
    for (const f of [g, c, k]) f.controller = K.scripted();
    K.toForm(c, 'ssj2');
    K.toForm(k, 'base');
    TK().place(m, 'goku', [0, 7], 'caulifla');
    TK().place(m, 'caulifla', [-1.6, -4], 'goku');
    TK().place(m, 'kale', [1.6, -4], 'goku');
    g.setState('scripted', { pose: 'exhausted', expression: 'serious' });
    c.setState('scripted', { pose: 'cf_stance', expression: 'angry' });
    k.setState('scripted', { pose: 'ka_shy', expression: 'sad' });
    // an earring on an ear (side +1 her left, -1 her right) and where it is in the world
    const ear = (f, side) => {
      const R = f.model.b.headR;
      f.model.root.updateMatrixWorld(true);
      return f.model.joints.head.localToWorld(new V3(side * R * 1.04, R * 0.6, 0)).sub(f.object.position).add(f.pos);
    };
    const earOn = (f, side) => {
      const R = f.model.b.headR;
      f.model.addProp({ id: 'potara' + (side > 0 ? 'L' : 'R'), shape: 'potara', joint: 'head', pos: [side * R * 1.04, R * 0.6, 0], rot: [0, 0, 0], scale: 1.3 });
    };
    m.onDispose(() => {
      for (const f of [c, k]) {
        f.model.removeProp('potaraL');
        f.model.removeProp('potaraR');
      }
    });
    TK().react(m, 'champa', 'Vados! The earrings! Caulifla, Kale — put these on!', 3, { style: 'shout' });
    K.watcher(S.champa, 'ch6_shout', 'grin');
    yield* st.wait(2.4);
    // two green specks streak from the stands down to the platform
    const from = S.vados.chest();
    const to = c.chest().lerp(k.chest(), 0.5);
    m.shot((t, o, el) => {
      o.pos.copy(to).add(new V3(5, 2.5, 5));
      o.look.copy(to).add(new V3(0, 1 + (1 - Math.min(1, el)) * 10, 0));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const t0 = performance.now();
    yield () => {
      const kk = Math.min(1, (performance.now() - t0) / 1300);
      const p = from.clone().lerp(to, kk);
      p.y += Math.sin(kk * Math.PI) * 8;
      b.vfx.flash(p, 0.5, 0x3aff6a, 0.1, SL.Toon.tex.glow);
      return kk >= 1 || st.skip.on;
    };
    // each puts one on: close on the hand at the ear
    const right = (f) => new V3(f.forward.z, 0, -f.forward.x);
    const atEar = (f, side) => m.shot((t, o) => {
      const e = ear(f, side);
      o.pos.copy(e).addScaledVector(f.forward, 0.8).addScaledVector(right(f), -side * 0.5).add(new V3(0, 0.05, 0));
      o.look.copy(e).lerp(f.headPos(), 0.4);
      o.fov = 38;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: f, face: true });
    c.setState('scripted', { pose: 'tp_earL', expression: 'determined', speed: 8 });
    atEar(c, 1);
    m.say('caulifla', 'Fine. Kale — one for you. Let\'s do this together.', 2.8);
    yield* st.wait(1.4);
    earOn(c, 1);
    b.vfx.flash(ear(c, 1), 0.4, 0xf2c82a, 0.2, SL.Toon.tex.glow);
    b.sfx('itPop', c, { vol: 0.6, pitch: 1.4 });
    yield* st.wait(1.4);
    k.setState('scripted', { pose: 'tp_earR', expression: 'warm', speed: 6 });
    atEar(k, -1);
    m.say('kale', 'Together... with you, sis!', 2);
    yield* st.wait(1.2);
    earOn(k, -1);
    b.vfx.flash(ear(k, -1), 0.4, 0xf2c82a, 0.2, SL.Toon.tex.glow);
    b.sfx('itPop', k, { vol: 0.6, pitch: 1.4 });
    yield* st.wait(1);
    // THE PULL: the earrings drag them together, faster and faster, the light spiralling round them; the camera circles
    const mid = to.clone();
    const c0 = c.pos.clone(), k0 = k.pos.clone(), meet = K.ground(b, mid.clone());
    c.setState('scripted', { pose: 'tumble', expression: 'shock', speed: 10, aura: 1 });
    k.setState('scripted', { pose: 'tumble', expression: 'shock', speed: 10, aura: 1 });
    m.shot((t, o, el) => {
      const a = 0.6 + el * 1.6;
      o.pos.copy(meet).add(new V3(Math.sin(a) * 6, 1.6 + el * 0.6, Math.cos(a) * 6));
      o.look.copy(meet).add(new V3(0, 1, 0));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('kiUp', c, { vol: 1.1, pitch: 0.6 });
    let n = 0;
    yield () => {
      n++;
      const kk = Math.min(1, n / 44), e = kk * kk * kk;
      const sw = (1 - e) * 0.6;
      K.place(c, c0.clone().lerp(meet, e).add(new V3(0, 0, Math.sin(n * 0.4) * sw)), c.yaw);
      K.place(k, k0.clone().lerp(meet, e).add(new V3(0, 0, -Math.sin(n * 0.4) * sw)), k.yaw);
      if (n % 2 === 0) {
        b.vfx.trail(c.chest(), 0xffe060, 0.5, 0.35);
        b.vfx.trail(k.chest(), 0x6aff4a, 0.5, 0.35);
      }
      b.vfx.flash(meet.clone().add(new V3(0, 1.1, 0)), 0.4 + kk * 3, 0xeaffea, 0.08, SL.Toon.tex.glow);
      b.camera.trauma = Math.max(b.camera.trauma, kk * 0.3);
      return n >= 44 || st.skip.on;
    };
    // the light: a burst, and a silhouette standing in it
    SL.ScreenFX.flash(0.7, '#f0fff0');
    b.vfx.ring(meet.clone().add(new V3(0, 0.2, 0)), 18, 0x9aff6a, 0.8, new V3(0, 1, 0));
    b.vfx.ring(meet.clone().add(new V3(0, 1.2, 0)), 8, 0xfff2a0, 0.6);
    b.sfx('magic', c, { vol: 1.2 });
    b.cameraTraumaAt(meet, 0.7);
    c.setHidden(true);
    k.setHidden(true);
    c.untargetable = c.intangible = k.untargetable = k.intangible = true;
    kf.setHidden(false);
    kf.untargetable = kf.intangible = false;
    K.toForm(kf, 'base');
    K.place(kf, meet, c.yaw);
    K.faceTo(kf, g.pos);
    kf.controller = K.scripted();
    kf.setState('scripted', { pose: 'kf_intro', expression: 'smirk', aura: 1 });
    m.shot((t, o) => {
      o.pos.copy(kf.pos).addScaledVector(kf.forward, 6).add(new V3(0, 1.2, 0));
      o.look.copy(kf.chest());
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    n = 0;
    yield () => {
      n++;
      // the light behind her fades: from silhouette to the whole of her
      b.vfx.flash(kf.chest().addScaledVector(kf.forward, -0.6), Math.max(0.2, 3.6 * (1 - n / 70)), 0xf4fff0, 0.08, SL.Toon.tex.glow);
      return n >= 70 || st.skip.on;
    };
    // her reveal: from the boots up
    kf.setState('scripted', { pose: 'kf_intro', expression: 'smirk', aura: 0.6 });
    m.shot((t, o) => {
      const kk = Math.min(1, t / 2.4);
      o.pos.copy(kf.pos).addScaledVector(kf.forward, 3).add(new V3(0.8, 0.4, 0));
      o.look.copy(kf.pos).add(new V3(0, 0.3 + kk * kf.height * 1.1, 0));
      o.fov = 46;
    }, 2.6, { cut: true, blendIn: 0 });
    yield* st.wait(2.6);
    SL.Cinema.shotOn(m, S, { subject: 'kefla', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('kefla', 'Hmm. So this is what we feel like together. I like it.', 3);
    yield* st.wait(3);
    // SHE TESTS HER SPEED: three bursts round him, readable, each ending in a skid — then she is in front of him again
    m.shot((t, o) => {
      o.pos.copy(g.pos).add(new V3(10, 6, 9));
      o.look.copy(g.pos).add(new V3(0, 1, -3));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    g.setState('scripted', { pose: 'guard', expression: 'serious', speed: 8 });
    const around = [[-6, 2], [6, 0], [0, -4.5]];
    for (const [dx, dz] of around) {
      if (st.skip.on) break;
      const a0 = kf.pos.clone(), a1 = K.ground(b, g.pos.clone().add(new V3(dx, 0, dz)));
      kf.yaw = kf.prevYaw = Math.atan2(a1.x - a0.x, a1.z - a0.z);
      kf.setState('scripted', { pose: 'dash', expression: 'grin', speed: 16, aura: 0.8 });
      b.sfx('dash', kf, { vol: 0.9 });
      n = 0;
      yield () => {
        n++;
        K.place(kf, a0.clone().lerp(a1, Math.min(1, n / 9)), kf.yaw);
        if (n % 2 === 0) b.vfx.trail(kf.chest(), 0x8aff6a, 0.5, 0.3);
        return n >= 9;
      };
      b.vfx.dust(kf.pos.clone(), 1.4, 8);
      K.faceTo(kf, g.pos);
      K.faceTo(g, kf.pos);
      kf.setState('scripted', { pose: 'kf_intro', expression: 'grin', speed: 12, aura: 0.6 });
      yield* st.wait(0.35);
    }
    TK().react(m, 'champa', 'HAHAHA! Look at her go! That\'s Universe 6!', 2.4, { style: 'shout' });
    yield* st.wait(2.4);
    TK().react(m, 'beerus', 'Potara... on two Saiyans. This is bad, Goku.', 2.6);
    K.watcher(S.beerus, 'sp_lean', 'serious');
    yield* st.wait(2.6);
    TK().react(m, 'whis', 'Their power has not merely doubled. It has multiplied.', 2.6);
    yield* st.wait(2.6);
    TK().react(m, 'goku', 'They fused...? With Potara earrings?!', 2.4);
    yield* st.wait(2.4);
    SL.Cinema.shotOn(m, S, { subject: 'kefla', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('kefla', 'Call me Kefla. Now — it\'s our turn.', 2.6);
    yield* st.wait(2.6);
    // and she does not wait for an answer: the first blow, into his guard, his boots scraping back across the stone
    const f0 = kf.pos.clone(), f1 = K.ground(b, g.pos.clone().addScaledVector(g.forward, 1.2));
    kf.yaw = kf.prevYaw = Math.atan2(f1.x - f0.x, f1.z - f0.z);
    kf.setState('scripted', { pose: 'dash', expression: 'grin', speed: 16, aura: 1 });
    m.shot((t, o) => {
      const midp = kf.chest().lerp(g.chest(), 0.5);
      o.pos.copy(midp).add(new V3(6, 1.2, 4));
      o.look.copy(midp);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    n = 0;
    yield () => {
      n++;
      K.place(kf, f0.clone().lerp(f1, Math.min(1, n / 10)), kf.yaw);
      if (n % 2 === 0) b.vfx.trail(kf.chest(), 0x8aff6a, 0.5, 0.3);
      return n >= 10 || st.skip.on;
    };
    kf.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 24, aura: 1 });
    g.setState('scripted', { pose: 'guardHit', expression: 'grit', speed: 20 });
    b.vfx.explosion(g.chest(), 1.2, 0x8aff6a, { smoke: false });
    b.sfx('punchHeavy', g, { vol: 1.3 });
    b.cameraTraumaAt(g.chest(), 0.6);
    const g0 = g.pos.clone(), g1 = K.ground(b, g.pos.clone().addScaledVector(g.forward, -3));
    n = 0;
    yield () => {
      n++;
      K.place(g, g0.clone().lerp(g1, Math.min(1, n / 22)), g.yaw);
      if (n % 3 === 0) b.vfx.dust(g.pos.clone(), 0.6, 3);
      return n >= 22 || st.skip.on;
    };
    yield* st.wait(0.6);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'THE BERSERKER', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.topSaiyans = { TU };
  SL.data.missions.top_saiyans = {
    id: 'top_saiyans', canon: true, chapter: CHAPTER, title: 'The Berserker', character: 'goku', stage: 'top_green',
    subtitle: 'The Tournament of Power · Goku vs Caulifla and Kale', parTime: 720, qteLabel: 'The Kamehameha',
    blurb: 'Still worn down from Jiren, Goku finds Universe 6\'s Saiyans waiting — the girl who learns everything at once, and the quiet one who should not be pushed.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'god', 'ssj2', 'blue'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Kale (playable)', 'Form: Kale — Berserk', 'Form: Caulifla — Super Saiyan 2'],
    setup,
    phases: [P.open, P.caulifla, P.lesson, P.berserk, P.juggernaut, P.through, P.both, P.potara],
  };
})();
