/*
 * CHAPTER 18 · UNIVERSE 6 — Round 6: "The Invisible Blow" (Vegeta vs Hit).
 * documentation/SUPER_SAGA_VISUAL_REFERENCE.md §3, Hit's temporal assault: the static eye-level step forward, the
 * hands in the pockets, the gaze on Vegeta; Blue Vegeta's rush; the deep-purple negative flash; the point-blank blow
 * to the vitals from another angle; the camera following Vegeta down into the floor. Canon: Hit wins by knockout.
 *
 *   OPEN *     (scene u6r6_open)  Cabba is gone; Hit on the ring, hands in his pockets; Champa's boast, Vegeta's
 *                                 answer, Hit's one line, Beerus' warning
 *   BLUE       (ascend)           Vegeta goes Super Saiyan Blue from the start (hold Charge)
 *   SIDESTEP * (play)             Blue Vegeta vs Hit. THE TIME SKIP AS EVASION: while the skip is READY (a violet glint
 *                                 in his eyes) nothing reaches him — the world stops, he is behind you, and his jab
 *                                 lands as time starts again. Then it recharges: bait it (a blast, a feint) and hit
 *                                 him before it is back. A knockout or ring-out is a DEFEAT (retry). Ends on his floor
 *   ORDERS     (staged)           Hit slides back from the blow that landed; Champa orders him to finish it
 *   VITALS *   (play)             THE TIME SKIP AS ATTACK: the tell (he stops, eyes burning, a violet ring closing on
 *                                 Vegeta, a heartbeat; he cannot be touched), then the world stops and the vital strike
 *                                 lands from behind. THE READ: Dodge inside the last moment of the tell — the afterimage
 *                                 takes it, Vegeta is behind him, and Hit is OPEN for a few seconds. The evasion skip
 *                                 still runs. A knockout or ring-out is a DEFEAT (retry). Ends on his floor
 *   ONE BLOW   (cues + staged)    everything into one punch (Charge, Heavy); the temporal flash: the whole arena stops
 *                                 an inch from Hit's face — Hit alone walks out of the punch, round to Vegeta's side,
 *                                 and drives the vital strike into the frozen body; time comes back, and Vegeta is
 *                                 thrown up and down into the floor
 *   FALL       (struggle + staged) "Get up" (mash): one knee, and the body gives out; the Blue goes out; the knockout
 *                                 is called; Goku on the ring for him — "Leave the rest to me"
 *
 * THE TIME SKIP (u6_kit.js, UK.timeSkip; moved there for Goku's match): every other fighter's `freeze` (the per-fighter hitstop: no movement, no
 * animation, no input) holds while Hit moves, and the picture turns a deep-purple negative (a canvas filter, the way
 * SL.ScreenFX.vision dims the picture). The evasion is the existing god-evasion (storyEvade mode 'god', kind
 * 'vanish' → Fighter._vanishCounter); every blow he lands is a real Fighter.takeHit. Nothing in the engine changes.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  const VIOLET = 0xb070ff; // (u6_kit.js VIOLET)
  // TUNING: seconds unless named frames; floors are fractions of Hit's health; jab / vital are raw blow damage
  const TU = {
    blueHold: 2.4,
    // FIGHT 1 — the sidestep
    gap1: 200, floor1: 0.7, hitDealt1: 0.18, hitTaken1: 1.0, skipJab: 520,
    // FIGHT 2 — the vitals
    gap2: 200, strikeEvery: 5.2, firstStrike: 2.6, tell: 1.0, readWindow: 0.45, vital: 4800,
    openFrames: 150, openMul: 2.6, floor2: 0.4, hitDealt2: 0.25, hitTaken2: 0.75,
    // the frames of one skip: Hit reappears, swings, and time comes back
    appear: 5, swing: 11, resume: 14,
  };

  /* =================================================================== THE OPENING */
  SL.data.scenes.u6r6_open = {
    id: 'u6r6_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 1 },
    auraCap: 0,
    events: [
      // §3.1: a static eye-level shot — Hit, the hands in the pockets, the gaze locked on Vegeta
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast, h = S.hit;
          K.place(S.vegeta, UK().at(b, UK().RING.a), Math.PI);
          K.place(h, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.vegeta, h.pos);
          K.faceTo(h, S.vegeta.pos);
          const fwd = h.forward.clone().setY(0).normalize();
          const eye = h.headPos();
          const lens = h.pos.clone().addScaledVector(fwd, 4.2);
          lens.y = eye.y - 0.08;
          ctx.m.shot((t, out) => {
            out.pos.copy(lens);
            out.look.copy(h.chest()).add(new V3(0, 0.28, 0));
            out.fov = 38;
          }, 4, { cut: true, blendIn: 0 });
        },
        pose: [{ who: 'hit', pose: 'ht_pockets', face: 'cold' }, { who: 'vegeta', pose: 'armsCrossed', face: 'serious' }],
        title: { chapter: CHAPTER, title: 'THE INVISIBLE BLOW', subtitle: 'Round 6 · Vegeta vs Hit', duration: 3.8 },
        hold: 3.9,
      },
      {
        pose: [{ who: 'champa', pose: 'ch6_shout', face: 'grin' }],
        cam: { subject: 'champa', focus: 'medium', angle: 'three' },
        say: { who: 'champa', line: 'Meet Hit — the greatest assassin in Universe 6! A thousand years in the trade, and he has never missed a mark!', duration: 4, style: 'shout' },
        hold: 4.1,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cocky' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'An assassin. Then come and try to kill me, if you think you can.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'hit', pose: 'ht_pockets', face: 'cold' }],
        cam: { subject: 'hit', focus: 'closeup', angle: 'front' },
        say: { who: 'hit', line: 'I was hired to win a match. Nothing more.', duration: 2.8 },
        hold: 2.9,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'serious' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Careful, Vegeta. That one isn\'t a fighter. He\'s a professional.', duration: 3.2 },
        hold: 3.3,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.vegeta, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.hit, UK().at(b, UK().RING.c), 0);
      K.faceTo(S.vegeta, S.hit.pos);
      K.faceTo(S.hit, S.vegeta.pos);
    },
  };

  /* =================================================================== THE TIME SKIP (u6_kit.js: UK.timeSkip) */
  const tint = (k) => UK().tint(k);
  const stopWorld = (S, frames) => UK().stopWorld(S, frames);
  const onRing = (b, p) => UK().onRing(b, p);
  // Vegeta's fight over the skip: who says what at each beat
  const LINES = {
    evade1: ['vegeta', 'What—?! He was right in front of me!', 2.4, { style: 'shout' }],
    evade3: ['champa', 'Ha! Nobody lays a finger on Hit!', 2.4, { style: 'shout' }],
    landed: ['beerus', "He landed one. So whatever that trick is, it isn't free.", 3],
    tell1: ['whis', 'Oh dear. Watch his eyes, Vegeta.', 2.4],
    strike1: ['vegeta', 'Gh—! From behind?! When did he...', 2.6, { style: 'shout' }],
    read1: ['vegeta', "There! I felt the air move — you're WIDE open!", 2.6, { style: 'shout' }],
    read2: ['whis', "He's reading it. Remarkable.", 2.2],
  };
  const timeSkip = (m, opts) => UK().timeSkip(m, Object.assign({ tu: TU, lines: LINES }, opts));

  /* =================================================================== THE PHASES */
  function stage(m, place) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    tint(0);
    stopWorld(S, 0);
    UK().ring(m, { place });
    BK.give(S.vegeta, 'blue');
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, true);
    K.toForm(m.battle.story.vegeta, 'base');
    yield* SL.Cinema.play(m, 'u6r6_open');
  } };

  /** No warming up against an assassin: Blue from the first second (hold Charge). */
  P.blue = { id: 'blue', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, h = S.hit;
    stage(m, true);
    K.toForm(v, 'base');
    K.watcher(h, 'ht_pockets', 'cold');
    K.faceTo(h, v.pos);
    UK().control(m);
    v.ki = v.kiMax;
    m.objective('blue', 'Super Saiyan Blue: hold Charge', { icon: 'transform' });
    const fw = () => v.forward.clone().setY(0).normalize();
    yield* C.ascend(m, {
      fighter: v, form: 'blue', witness: h, seconds: TU.blueHold, dust: false,
      label: 'Hold Charge — Super Saiyan Blue', meter: 'SUPER SAIYAN BLUE', music: 4,
      transform: {
        changeShots: [
          // past Vegeta's shoulder at the assassin, who has not moved
          { at: 0, shot: (t, out) => {
            const r = new V3(fw().z, 0, -fw().x);
            out.pos.copy(v.pos).addScaledVector(fw(), -2.2).addScaledVector(r, 0.8).add(new V3(0, 1.5, 0));
            out.look.copy(h.chest());
            out.fov = 46;
          } },
          { at: 0.7, free: true, shot: (t, out) => {
            const hd = v.headPos();
            out.pos.copy(hd).addScaledVector(fw(), 1.3).add(new V3(0, 0.1, 0));
            out.look.copy(hd).add(new V3(0, 0.1, 0));
            out.fov = 40;
          } },
        ],
      },
    });
    m.complete('blue');
    m.say('vegeta', 'I\'m not wasting a single second on you.', 2.4);
  } };

  /** FIGHT 1: the skip as an evasion. */
  P.sidestep = { id: 'sidestep', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, h = S.hit;
    stage(m, true);
    K.toForm(v, 'blue');
    v.hp = v.hpMax;
    v.ki = Math.max(v.ki, v.kiMax * 0.7);
    h.hp = h.hpMax;
    const sf = m.storyFight({ floors: [{ f: h, at: TU.floor1 }], dealt: [{ f: h, mul: TU.hitDealt1 }], taken: [{ f: h, mul: TU.hitTaken1 }], ease: { foe: h, hero: v, below: 0.4, min: 0.5 } });
    const ts = timeSkip(m, { gap: TU.gap1 });
    m.title(CHAPTER, 'ROUND 6', 'Super Saiyan Blue Vegeta vs Hit', 2.4);
    m.objective('fight', 'He is never where your blow lands — bait it (a blast, a feint), then hit him before his eyes glint again', { icon: 'fist' });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    const r = yield* UK().bout(m, { ringOut: [v], ai: { aggression: 0.4, defense: 0.7 }, during: () => (sf.floored(h) ? { pause: true, how: 'story' } : null) });
    ts.off();
    sf.off();
    if (m.state !== 'running' || !r.pause) return;
    m.complete('fight');
    m.complete('ring');
  } };

  /** Hit slides back from the blow; Champa wants it over. */
  P.orders = { id: 'orders', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, h = S.hit;
    stage(m, false);
    const st = UK().staged(m);
    v.controller = K.scripted();
    h.controller = K.scripted();
    if (h.pos.distanceTo(v.pos) < 3) K.place(h, onRing(b, v.pos.clone().addScaledVector(v.forward, 3.2)), h.yaw);
    K.faceTo(v, h.pos);
    K.faceTo(h, v.pos);
    v.setState('scripted', { pose: 'v_gut', expression: 'angry', speed: 20 });
    h.setState('scripted', { pose: 'ht_slide', expression: 'cold', speed: 12 });
    // he slides back on his heels, upright, a furrow in the stone
    const from = h.pos.clone(), to = onRing(b, h.pos.clone().addScaledVector(h.forward, -2.4));
    SL.Cinema.shotOn(m, S, { subject: 'hit', with: 'vegeta', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      K.place(h, from.clone().lerp(to, U.easeOut ? U.easeOut(Math.min(1, n / 30)) : Math.min(1, n / 30)), h.yaw);
      if (n % 3 === 0) b.vfx.dust(h.pos.clone(), 0.5, 3);
      return n >= 30;
    };
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold' });
    v.setState('scripted', { pose: 'armsCrossed', expression: 'cocky' });
    yield* st.wait(0.6);
    SL.Cinema.shotOn(m, S, { subject: 'champa', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.champa, 'ch6_shout', 'angry');
    m.say('champa', 'Hit! Stop toying with him and FINISH IT!', 2.8, { style: 'shout' });
    yield* st.wait(2.8);
    K.watcher(S.champa, 'ch6_idle', 'smirk');
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'Very well.', 1.8);
    yield* st.wait(1.2);
    // the eyes burn, and the picture flickers with it
    for (let i = 0; i < 6 && !st.skip.on; i++) {
      b.vfx.flash((h.headPos ? h.headPos() : h.chest()).addScaledVector(h.forward, 0.14), 0.7, VIOLET, 0.16, SL.Toon.tex.glow);
      tint(i % 2 ? 0 : 0.35);
      yield* st.wait(0.08);
    }
    tint(0);
    b.sfx('heartbeat', h);
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Finally. Show me what you\'ve been hiding.', 2.6);
    yield* st.wait(2.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** FIGHT 2: the skip as an attack — the tell, the vital strike, and the read. */
  P.vitals = { id: 'vitals', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, h = S.hit;
    stage(m, true);
    K.toForm(v, 'blue');
    v.hp = Math.max(v.hp, v.hpMax * 0.85);
    v.ki = Math.max(v.ki, v.kiMax * 0.6);
    h.hp = Math.max(h.hp, h.hpMax * TU.floor1);
    const sf = m.storyFight({ floors: [{ f: h, at: TU.floor2 }], dealt: [{ f: h, mul: TU.hitDealt2 }], taken: [{ f: h, mul: TU.hitTaken2 }], ease: { foe: h, hero: v, below: 0.4, min: 0.5 } });
    const ts = timeSkip(m, { gap: TU.gap2, strike: true });
    m.title(CHAPTER, 'ROUND 6', 'The vital strike', 2.2);
    m.objective('read', 'When his eyes burn and the ring closes on you, Dodge at the last moment — then punish', { icon: 'fist' });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    const r = yield* UK().bout(m, { ringOut: [v], begin: false, keepPlaces: false, ai: { aggression: 0.5, defense: 0.7 }, during: () => (sf.floored(h) ? { pause: true, how: 'story' } : null) });
    m.flags.reads = ts.st.reads;
    ts.off();
    sf.off();
    if (m.state !== 'running' || !r.pause) return;
    m.complete('read');
    m.complete('ring');
  } };

  /** ONE BLOW, and the temporal flash. */
  P.blow = { id: 'blow', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, h = S.hit;
    stage(m, false);
    K.toForm(v, 'blue');
    const st = UK().staged(m);
    v.controller = K.scripted();
    h.controller = K.scripted();
    K.place(v, UK().at(b, [0, 4.5]), Math.PI);
    K.place(h, UK().at(b, [0, -3]), 0);
    K.faceTo(v, h.pos);
    K.faceTo(h, v.pos);
    v.setState('scripted', { pose: 'stagger', expression: 'angry', speed: 6 });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold' });
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', with: 'hit', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Enough tricks. Whatever you\'re doing — you can\'t do it faster than THIS!', 3.2, { style: 'shout' });
    yield* st.wait(2.4);
    // everything into it: the Blue roars up
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    v.setState('scripted', { pose: 'powerUp', expression: 'shout', speed: 12, aura: 1 });
    const r1 = yield* st.cue('charge', 'Everything into one blow (Charge)', { auto: 3, slow: 0.5 });
    m.qteParts.push(r1.pressed ? 1 : 0.5);
    b.vfx.ring(v.pos.clone().add(new V3(0, 0.1, 0)), 7, 0x3ac8ff, 0.5, new V3(0, 1, 0));
    b.vfx.flash(v.chest(), 2.6, 0x8ae0ff, 0.35, SL.Toon.tex.glow);
    b.vfx.dust(v.pos.clone(), 2.2, 14);
    b.sfx('transformBurst', v, { vol: 0.9 });
    b.cameraTraumaAt(v.chest(), 0.4);
    yield* st.wait(0.7);
    // over his shoulder at the target
    v.setState('scripted', { pose: 'v_gutW', expression: 'shout', speed: 16, aura: 1 });
    m.shot((t, o) => {
      const d = h.pos.clone().sub(v.pos).setY(0).normalize();
      const r = new V3(d.z, 0, -d.x);
      o.pos.copy(v.pos).addScaledVector(d, -1.6).addScaledVector(r, 0.7).add(new V3(0, 1.55, 0));
      o.look.copy(h.chest()).add(new V3(0, 0.2, 0));
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const r2 = yield* st.cue('heavy', 'The rush — one punch (Heavy)', { auto: 2.6, slow: 0.4 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    // THE RUSH: a tracking shot from the side as he crosses the stone
    const from = v.pos.clone();
    const stopAt = K.ground(b, h.pos.clone().addScaledVector(h.dirTo(v).setY(0).normalize(), 1.05));
    v.setState('scripted', { pose: 'v_dash', expression: 'shout', speed: 30, aura: 1 });
    b.sfx('dash', v, { vol: 1.2 });
    m.shot((t, o) => {
      const mid = v.chest().lerp(h.chest(), 0.5);
      o.pos.copy(mid).add(new V3(6.2, 0.9, 0));
      o.look.copy(mid);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    let n = 0;
    yield () => {
      n++;
      K.place(v, from.clone().lerp(stopAt, Math.min(1, n / 16)), v.yaw);
      if (n % 3 === 0) b.vfx.afterimage(v.pos, v.height, 0x8ad8ff);
      if (n % 4 === 0) b.vfx.dust(v.pos.clone(), 0.6, 3);
      if (n === 8) v.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 40, aura: 1 });
      return n >= 20;
    };
    // the fist an inch from his face...
    const face = h.headPos ? h.headPos() : h.chest();
    m.shot((t, o) => {
      o.pos.copy(face).add(new V3(1.5, 0.15, 0.9));
      o.look.copy(face).lerp(v.chest(), 0.25);
      o.fov = 36;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    // (long enough for the arm to reach its full extension before time stops on it)
    yield* st.wait(0.2);

    // THE TEMPORAL FLASH: everything stops but him
    stopWorld(S, 99999);
    tint(1);
    SL.ScreenFX.flash(0.3, '#3a0a6a');
    b.sfx('timeWarp', h, { vol: 1.2, pitch: 0.8 });
    b.skipRequested = false;
    // the lens circles slowly through the frozen moment while Hit walks out of the punch, round to Vegeta's side
    const pivot = v.chest().lerp(h.chest(), 0.5);
    const fwd = h.dirTo(v).setY(0).normalize();
    const side = new V3(-fwd.z, 0, fwd.x);
    const hFrom = h.pos.clone();
    const hMid = K.ground(b, hFrom.clone().addScaledVector(side, 1.3));
    const hTo = K.ground(b, v.pos.clone().addScaledVector(side, 0.95).addScaledVector(fwd, 0.15));
    const t0 = performance.now(), walkMs = 2200;
    m.shot((t, o) => {
      const k = Math.min(1, (performance.now() - t0) / 3200);
      const a = Math.atan2(side.x, side.z) - 0.4 + k * 1.3;
      o.pos.copy(pivot).add(new V3(Math.sin(a) * 4.2, 0.6 + k * 0.3, Math.cos(a) * 4.2));
      o.look.copy(pivot);
      o.fov = 42;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    h.setState('scripted', { pose: 'ht_lean', expression: 'cold', speed: 10 });
    yield* st.wait(0.6);
    h.setState('scripted', { pose: 'ht_step', expression: 'cold', speed: 6 });
    b.sfx('heartbeat', h, { vol: 0.8 });
    yield () => {
      const k = Math.min(1, (performance.now() - t0 - 600) / walkMs);
      const p = k < 0.5 ? hFrom.clone().lerp(hMid, k * 2) : hMid.clone().lerp(hTo, (k - 0.5) * 2);
      K.place(h, K.ground(b, p), h.yaw);
      K.faceTo(h, k < 0.5 ? hMid.clone().addScaledVector(fwd, 2) : v.pos);
      return k >= 1 || st.skip.on;
    };
    K.place(h, hTo, h.yaw);
    K.faceTo(h, v.pos);
    // point-blank, under the ribs — into a body that cannot feel it yet
    h.setState('scripted', { pose: 'ht_vitalW', expression: 'cold', speed: 20 });
    SL.Cinema.shotOn(m, S, { subject: 'hit', with: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.5);
    h.setState('scripted', { pose: 'ht_vital', expression: 'cold', speed: 40 });
    b.vfx.ring(v.chest(), 1.4, VIOLET, 0.4);
    b.sfx('punchHeavy', v, { pitch: 0.45, vol: 0.5 });
    yield* st.wait(0.5);
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 10 });
    K.place(h, K.ground(b, hTo.clone().addScaledVector(side, 0.9)), h.yaw);
    yield* st.wait(0.4);

    // TIME COMES BACK — and the blow has already landed
    stopWorld(S, 0);
    tint(0);
    SL.ScreenFX.flash(0.4, '#ffffff');
    v.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 40, aura: 0.6 });
    const chest = v.chest();
    b.vfx.impact(chest, 4, 0xe8d8ff);
    b.vfx.ring(chest, 3, VIOLET, 0.4);
    b.cameraTraumaAt(chest, 0.9);
    b.sfx('punchHeavy', v, { pitch: 0.5, vol: 1.5 });
    b.slowmo(0.25, 0.5);
    v.hp = Math.max(1, Math.min(v.hp, v.hpMax * 0.08));
    v.flash = 1;
    yield* st.wait(0.35);
    // thrown up and down into the floor — the camera follows him all the way
    const vFrom = v.pos.clone();
    const away = side.clone().negate();
    const vTo = onRing(b, vFrom.clone().addScaledVector(away, 4.2).addScaledVector(fwd, 1));
    v.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16, aura: 0.3 });
    m.shot((t, o) => {
      o.pos.copy(vTo).addScaledVector(away, 2.6).add(new V3(0, 0.35, 0)).addScaledVector(fwd, -2.2);
      o.look.copy(v.chest());
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const t1 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - t1) / 750);
      const q = vFrom.clone().lerp(vTo, k);
      q.y = U.lerp(vFrom.y, vTo.y, k) + Math.sin(k * Math.PI) * 2.2;
      v.setPosition(q);
      v.vel.set(0, 0, 0);
      return k >= 1;
    };
    v.setPosition(vTo);
    v.grounded = true;
    v.setState('scripted', { pose: 'knockdownFace', expression: 'ko', speed: 30, aura: 0 });
    b.vfx.dust(vTo.clone(), 2.4, 20);
    b.vfx.ring(vTo.clone().add(new V3(0, 0.1, 0)), 4, 0xd8d0c0, 0.5, new V3(0, 1, 0));
    for (let i = 0; i < 8; i++) b.vfx.rock(vTo.clone().add(new V3(U.rand(-1, 1), 0.2, U.rand(-1, 1))), new V3(U.rand(-3, 3), U.rand(3, 7), U.rand(-3, 3)), U.rand(0.1, 0.25), b.stage.rockColor);
    b.cameraTraumaAt(vTo, 0.8);
    b.sfx('groundImpact', v, { vol: 1.2 });
    b.sfx('crowdGasp', v, { vol: 0.7 });
    yield* st.wait(1.2);
    b.skipRequested = false;
  } };

  /** "Get up." He tries. The body will not. */
  P.fall = { id: 'fall', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, h = S.hit, g = S.goku;
    stage(m, false);
    const st = UK().staged(m);
    v.controller = K.scripted();
    h.controller = K.scripted();
    K.toForm(v, 'blue');
    // where ONE BLOW threw him (or, started here directly, a spot on the ring)
    if (UK().edgeDist(v) < 1.5) {
      K.place(v, UK().at(b, [3, 1]), -Math.PI / 2);
      K.place(h, UK().at(b, [-1.5, -1]), 0);
    }
    v.grounded = true;
    v.hp = Math.max(1, Math.min(v.hp, v.hpMax * 0.08));
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold' });
    K.faceTo(h, v.pos);
    v.setState('scripted', { pose: 'knockdownFace', expression: 'hurt' });
    m.shot((t, o) => {
      const hd = v.headPos ? v.headPos() : v.chest();
      o.pos.copy(hd).add(new V3(2.2, 0.6, 1.8));
      o.look.copy(hd);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('vegeta', 'Get... up...!', 1.8, { style: 'shout' });
    let pose = 'knockdownFace';
    const set = (p, speed) => {
      if (p === pose) return;
      pose = p;
      v.setState('scripted', { pose: p, expression: p === 'knockdownFace' ? 'ko' : 'grit', speed, aura: p === 'defeatKneel' ? 0.4 : 0 });
    };
    const res = yield* m.struggle({
      start: 0.15, drain: 0.22, duration: 5.5, label: 'GET UP!',
      // he gets as far as one knee — and then the body stops answering, whatever you press
      override: (t, grip) => (t > 3.4 ? Math.max(0, Math.min(grip, 0.8) - (t - 3.4) * 0.9) : Math.min(grip, 0.8)),
      onTick: (t, grip) => set(grip > 0.55 ? 'defeatKneel' : grip > 0.3 ? 'getup' : 'knockdownFace', grip > 0.3 ? 8 : 14),
    });
    m.qteParts.push(Math.min(1, res.avg / 0.5));
    m.lock(true);
    set('knockdownFace', 10);
    // the Blue goes out of him
    b.vfx.flash(v.chest(), 2, 0x8ad8ff, 0.3, SL.Toon.tex.glow);
    K.toForm(v, 'base');
    v.setState('scripted', { pose: 'knockdownFace', expression: 'ko', aura: 0 });
    b.sfx('kiUp', v, { pitch: 0.5, vol: 0.6 });
    yield* st.wait(1.2);
    b.emit('matchEnd', { winner: h, loser: v, how: 'ko' });
    yield* SL.Tournament.announce(m, 'ko', { winner: h, loser: v }, { seconds: 3.2 });
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'A proud fighter. Proud fighters always leave the same opening.', 3.2);
    yield* st.wait(3.2);
    SL.Cinema.shotOn(m, S, { subject: 'champa', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.champa, 'ch6_shout', 'grin');
    m.say('champa', 'HA! Did you see that, Beerus? Your prince never even saw it coming!', 3, { style: 'shout' });
    yield* st.wait(3);
    // Goku comes up onto the ring for him
    K.place(g, onRing(b, v.pos.clone().add(new V3(1.4, 0, 1.2))), 0);
    K.faceTo(g, v.pos);
    g.setState('scripted', { pose: 'kneelGrieve', expression: 'serious' });
    // from the ring's side of the pair, a little high: Goku kneeling over the fallen prince, both in profile
    const across = v.pos.clone().sub(g.pos).setY(0).normalize();
    const mid2 = v.pos.clone().lerp(g.pos, 0.5);
    const perp = new V3(-across.z, 0, across.x);
    if (perp.dot(mid2.clone().setY(0).negate()) < 0) perp.negate();
    m.shot((t, o) => {
      o.pos.copy(mid2).addScaledVector(perp, 3.6).addScaledVector(across, 0.8).add(new V3(0, 1.6, 0));
      o.look.copy(mid2).add(new V3(0, 0.3, 0));
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: g, face: true });
    m.say('goku', 'Vegeta! Hey — you okay?', 2.2);
    yield* st.wait(2.2);
    m.say('vegeta', 'Kakarot... he did something. I never saw him move...', 3);
    yield* st.wait(3);
    g.setState('scripted', { pose: 'stand', expression: 'serious', speed: 6 });
    K.faceTo(g, h.pos);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Leave the rest to me.', 2.2);
    yield* st.wait(2.2);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
    yield* UK().close(m, CHAPTER, 'ROUND 6 · HIT WINS');
  } };

  SL.data.u6Hit = { TU };
  SL.data.missions.u6_hit = {
    id: 'u6_hit', canon: true, chapter: CHAPTER, title: 'The Invisible Blow', character: 'vegeta', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 6 · Vegeta vs Hit', parTime: 540, qteLabel: 'The blow',
    blurb: 'Cabba is out. Universe 6 sends its assassin — and Vegeta cannot touch something that is never where his fist arrives.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    // the storyboard: Super Saiyan Blue; nothing in between
    lockForms: { vegeta: SL.data.characters.vegeta.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Universe 7 loses Vegeta'],
    setup: (b) => SL.data.u6Kit.setup(b, 'vegeta', 'hit'),
    phases: [P.open, P.blue, P.sidestep, P.orders, P.vitals, P.blow, P.fall],
  };
})();
