/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "Instinct" (Goku vs Kefla: Ultra Instinct -Sign- returns).
 * Tournament of power ui.docx §4 (Phases A–F) and the frame-by-frame "Phantom Dodge": Kefla overwhelms Goku's normal
 * forms; the quiet before the shift; the perfect-dodge chain (she commits, he moves at the last instant, the body
 * follows, her momentum carries her past, he settles beside her — a brief contour and a few frames of translucent
 * trace, never an afterimage clone); Kefla goes Super Saiyan 2; the aerial exchange; her giant attack dodged and the
 * close-range Kamehameha that drives her off the platform; the Potara separate and both are eliminated.
 *
 *   OPEN *     (scene top_kefla_open) Kefla, fresh and enormous; Goku, worn
 *   OVERWHELM *(play)             Blue Goku vs Kefla: she is faster and heavier — hold on (ends on the clock or when he is
 *                                 worn down; a knockout or ring-out is still a defeat)
 *   SIGN       (staged)           the quiet: the silver in the eyes, the pale shimmer; she hesitates
 *   PHANTOM    (staged)           the doc's five frames: the setup (wide side profile), her lunge (low, over her shoulder),
 *                                 the phantom dodge (close on Goku: the torso slips a hair's breadth, translucent for a
 *                                 few frames), her stumble (ground level behind her foot), the cold re-position
 *                                 (overhead: he is behind her, his back to her). "You didn't even block!"
 *   INSTINCT * (play)             Ultra Instinct -Sign- vs Kefla: the body evades by itself — strike in the gaps. At her
 *                                 floor she goes Super Saiyan 2 (wider, faster combinations); ends on her second floor
 *   AERIAL     (staged)           she launches after him; the side-tracking chase; her miss followed for a moment; he is at
 *                                 her flank
 *   FINISH     (cues + staged)    the Gigantic Ray (Dodge to slip it), the camera whips back, the close-range Kamehameha
 *                                 (Ultimate): white-blue light, and she is driven past the edge; the earrings shatter;
 *                                 Caulifla and Kale fall, eliminated; the silver goes out of Goku
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
  const SILVER = 0xc8d4ff, GREEN = 0x7aff3a;
  const TU = {
    overwhelm: { seconds: 28, worn: 0.45, dealt: 0.22, taken: 0.35 },
    instinct: { floor1: 0.65, floor2: 0.35, dealt: 0.24, taken: 0.8, evade: 0.8 },
  };
  const SPOT = { goku: [0, 9], kefla: [0, -6] };

  SL.data.scenes.top_kefla_open = {
    id: 'top_kefla_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    // the Tournament of Power's own battle music (soundtrack PDF p.91–92, "Genkai Toppa x Survivor": an original stand-in)
    music: { song: 'limit_survivor', level: 2 },
    auraCap: 0,
    events: [
      {
        pose: [{ who: 'kefla', pose: 'kf_stance', face: 'smirk' }, { who: 'goku', pose: 'exhausted', face: 'serious' }],
        cam: { subject: 'goku', over: 'kefla', focus: 'full', angle: 'ots' },
        title: { chapter: CHAPTER, title: 'INSTINCT', subtitle: 'Goku vs Kefla', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { subject: 'kefla', focus: 'upper', angle: 'low' },
        say: { who: 'kefla', line: 'You look tired. Too bad — I\'m just getting started.', duration: 3 },
        hold: 3.1,
      },
      {
        call: (ctx) => K.toForm(ctx.cast.goku, 'blue'),
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'determined' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Heh... two Saiyans in one. Then I\'d better not hold back.', duration: 3 },
        hold: 3.1,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
      K.place(S.kefla, K.ground(b, new V3(SPOT.kefla[0], 0, SPOT.kefla[1])), 0);
      K.faceTo(S.goku, S.kefla.pos);
      K.faceTo(S.kefla, S.goku.pos);
    },
  };

  function setup(b) {
    const S = TK().setup(b, {
      player: 'goku', fight: ['goku', 'kefla', 'caulifla', 'kale'],
      seat: ['beerus', 'whis', 'champa', 'vados', 'krillin', 'tien', 'roshi', 'adult_gohan'],
      edge: { vegeta: [-30, 22], jiren: [30, -26], dyspo: [25, -30] },
    });
    for (const id of ['caulifla', 'kale']) {
      S[id].setHidden(true);
      S[id].untargetable = S[id].intangible = true;
    }
    K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
    K.place(S.kefla, K.ground(b, new V3(SPOT.kefla[0], 0, SPOT.kefla[1])), 0);
    K.faceTo(S.goku, S.kefla.pos);
    K.faceTo(S.kefla, S.goku.pos);
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
    TK().ruin(b, 1);
    TK().edge(m);
    BK.give(S.goku, ['blue', 'uiSign']);
    BK.give(S.kefla, ['ssj', 'ssj2']);
    for (const f of [S.goku, S.kefla]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
    }
    for (const id of ['caulifla', 'kale']) if (!b.top.seated.has(id)) {
      S[id].setHidden(true);
      S[id].untargetable = S[id].intangible = true;
    }
    // since the Spirit Bomb the orange top is gone: the navy undershirt, holed, the trousers torn (DAMAGE_GOKU_TOP)
    if (S.goku.setDamage) S.goku.setDamage(2);
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m);
    K.toForm(m.battle.story.goku, 'base');
    K.toForm(m.battle.story.kefla, 'ssj');
    yield* SL.Cinema.play(m, 'top_kefla_open');
  } };

  /** Phase A: she overwhelms him. */
  P.overwhelm = { id: 'overwhelm', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, kf = S.kefla;
    stage(m);
    K.toForm(g, 'blue');
    K.toForm(kf, 'ssj');
    TK().place(m, 'goku', SPOT.goku, 'kefla');
    TK().place(m, 'kefla', SPOT.kefla, 'goku');
    g.hp = g.hpMax * 0.9;
    g.ki = g.kiMax * 0.5;
    kf.hp = kf.hpMax;
    m.title(CHAPTER, 'KEFLA', 'Blue Goku, worn down', 2.2);
    m.objective('hold', 'She is faster and heavier — hold on', { icon: 'target' });
    const O = TU.overwhelm;
    const ok = yield* TK().brawl(m, {
      hero: g, seconds: O.seconds,
      foes: [{ f: kf, floor: 0.5, dealt: O.dealt, taken: O.taken, ai: { aggression: 0.95, defense: 0.4 } }],
      until: () => g.hpFrac < O.worn,
    });
    if (!ok) return;
    m.complete('hold');
  } };

  /** Phase B: the quiet before the shift. */
  P.sign = { id: 'sign', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, kf = S.kefla;
    stage(m);
    const st = ST(m);
    g.controller = K.scripted();
    kf.controller = K.scripted();
    K.toForm(g, 'blue');
    K.toForm(kf, 'ssj');
    TK().place(m, 'goku', [0, 6], 'kefla');
    TK().place(m, 'kefla', [0, -1.5], 'goku');
    g.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
    kf.setState('scripted', { pose: 'kf_stance', expression: 'grin' });
    m.music(null, 0);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1);
    // the blue goes out — and something quieter comes in
    K.toForm(g, 'uiSign');
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 4, aura: 0.7 });
    b.vfx.ring(g.chest(), 3, SILVER, 0.6);
    b.sfx('heartbeat', g, { vol: 0.8 });
    m.shot((t, o) => {
      const hd = g.headPos();
      o.pos.copy(hd).addScaledVector(g.forward, 0.75);
      o.look.copy(hd);
      o.fov = 34;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: g, face: true });
    yield* st.wait(2);
    SL.Cinema.shotOn(m, S, { subject: 'kefla', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    kf.setState('scripted', { pose: 'kf_stance', expression: 'shock', speed: 6 });
    m.say('kefla', '...? What\'s with that look all of a sudden?', 2.4);
    yield* st.wait(2.4);
    TK().react(m, 'beerus', 'That\'s it... the same state as against Jiren!', 2.6);
    yield* st.wait(2.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The doc's frame-by-frame phantom dodge. */
  P.phantom = { id: 'phantom', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, kf = S.kefla;
    stage(m);
    const st = ST(m);
    g.controller = K.scripted();
    kf.controller = K.scripted();
    K.toForm(g, 'uiSign');
    K.toForm(kf, 'ssj');
    TK().place(m, 'goku', [0, 4], 'kefla');
    TK().place(m, 'kefla', [0, -3], 'goku');
    g.setState('scripted', { pose: 'g_uiStance', expression: 'serious', aura: 0.7 });
    kf.setState('scripted', { pose: 'kf_stance', expression: 'angry' });
    // the phantom dodge plays under Ultra Instinct -Sign-'s own cue (soundtrack PDF p.90–91, an original stand-in)
    m.music('ui_awakening', 5);
    // FRAME 1: wide side profile, both in frame — he stands completely relaxed
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'kefla', focus: 'wide', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.4);
    // FRAME 2: low, over her shoulder — the full-force right cross
    SL.Cinema.shotOn(m, S, { subject: 'goku', over: 'kefla', focus: 'full', angle: 'ots' }, 999, { cut: true, blendIn: 0, hold: true });
    kf.setState('scripted', { pose: 'punchWindR', expression: 'shout', speed: 20 });
    m.say('kefla', 'HAAAAH!', 1.2, { style: 'shout' });
    yield* st.wait(0.45);
    const k0 = kf.pos.clone(), lunge = K.ground(b, g.pos.clone().addScaledVector(kf.dirTo(g).setY(0).normalize(), -0.9));
    kf.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 40 });
    let n = 0;
    yield () => {
      n++;
      K.place(kf, k0.clone().lerp(lunge, Math.min(1, n / 6)), kf.yaw);
      return n >= 6;
    };
    // FRAME 3: medium close on Goku — the torso slips a hair's breadth; translucent for a few frames
    m.shot((t, o) => {
      const c = g.chest();
      o.pos.copy(c).add(new V3(1.9, 0.3, 0.6));
      o.look.copy(c).add(new V3(0, 0.2, 0));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    g.setState('scripted', { pose: 'g_uiSlip', expression: 'calm', speed: 50, aura: 0.8 });
    g.ghost(0.18, 0.35);
    b.vfx.ring(g.chest(), 0.9, SILVER, 0.2);
    b.sfx('dodge', g, { vol: 0.6, pitch: 1.3 });
    b.slowmo(0.25, 0.7);
    yield* st.wait(0.9);
    // FRAME 4: ground level, trailing behind her foot — the stumble
    const past = K.ground(b, lunge.clone().addScaledVector(kf.forward, 2.4));
    m.shot((t, o) => {
      o.pos.copy(kf.pos).addScaledVector(kf.forward, -2.2).add(new V3(0.5, 0.25, 0));
      o.look.copy(kf.pos).add(new V3(0, 0.6, 0));
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    kf.setState('scripted', { pose: 'stagger', expression: 'shock', speed: 16 });
    const k1 = kf.pos.clone();
    n = 0;
    yield () => {
      n++;
      K.place(kf, k1.clone().lerp(past, Math.min(1, n / 22)), kf.yaw);
      if (n % 4 === 0) b.vfx.dust(kf.pos.clone(), 0.5, 3);
      return n >= 22;
    };
    // FRAME 5: overhead — he is already behind her, his back to her
    const behind = K.ground(b, past.clone().addScaledVector(kf.forward, 2.6));
    g.ghost(0.15, 0.3);
    K.place(g, behind, kf.yaw);
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 10, aura: 0.7 });
    m.shot((t, o) => {
      const mid = kf.pos.clone().lerp(g.pos, 0.5);
      o.pos.copy(mid).add(new V3(0.5, 13, 0.5));
      o.look.copy(mid);
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.4);
    // THE SECOND AND THIRD SLIPS (the refinement brief): the camera rides her fist in and settles on him as it misses;
    // he moves only as far as the blow needs, the feet stay down; her weight carries on (the overreach) and she has
    // to plant a foot before she can turn — and he does not answer every miss
    const dodge = function* (pose, gPose, hand) {
      const from = kf.pos.clone(), to = K.ground(b, g.pos.clone().addScaledVector(kf.dirTo(g).setY(0).normalize(), -0.85));
      m.shot((t, o, el) => {
        const c = g.chest();
        o.pos.copy(c).add(new V3(2.2, 0.35, 1.2));
        o.look.copy(kf.handPos(hand)).lerp(c, Math.min(1, el / 0.35));
        o.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      kf.setState('scripted', { pose, expression: 'shout', speed: 40 });
      let i = 0;
      yield () => {
        i++;
        K.place(kf, from.clone().lerp(to, Math.min(1, i / 6)), kf.yaw);
        return i >= 6;
      };
      g.setState('scripted', { pose: gPose, expression: 'calm', speed: 50, aura: 0.8 });
      g.ghost(0.1, 0.25);
      b.sfx('dodge', g, { vol: 0.5, pitch: 1.35 });
      kf.setState('scripted', { pose: 'overreach', expression: 'grit', speed: 14 });
      const k1 = kf.pos.clone(), over = K.ground(b, k1.clone().addScaledVector(kf.forward, 1.3));
      i = 0;
      yield () => {
        i++;
        K.place(kf, k1.clone().lerp(over, Math.min(1, i / 14)), kf.yaw);
        if (i === 10) b.vfx.dust(kf.pos.clone(), 0.5, 4);
        return i >= 14;
      };
      yield* st.wait(0.35);
      K.faceTo(kf, g.pos);
      kf.setState('scripted', { pose: 'kf_stance', expression: 'angry', speed: 10 });
      g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 10, aura: 0.7 });
      yield* st.wait(0.45);
    };
    K.faceTo(g, kf.pos);
    K.faceTo(kf, g.pos);
    kf.setState('scripted', { pose: 'punchWindL', expression: 'shout', speed: 24 });
    yield* st.wait(0.25);
    yield* dodge('punchL', 'g_uiSlip2', 'L');
    // low: the weight goes to the other leg, the torso turns, the kick passes under him
    kf.setState('scripted', { pose: 'kickWindR', expression: 'shout', speed: 24 });
    yield* st.wait(0.25);
    yield* dodge('kickR', 'g_uiSlip', 'R');
    // her frustration; the stands
    K.faceTo(kf, g.pos);
    kf.setState('scripted', { pose: 'kf_stance', expression: 'angry', speed: 8 });
    SL.Cinema.shotOn(m, S, { subject: 'kefla', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('kefla', 'How are you doing that?! You didn\'t even block!', 2.6, { style: 'shout' });
    yield* st.wait(2.6);
    TK().react(m, 'champa', 'Kefla! Keep your distance from him!', 2.2, { style: 'shout' });
    K.watcher(S.champa, 'ch6_shout', 'shock');
    yield* st.wait(2.2);
    TK().react(m, 'beerus', 'He\'s moving without thinking... He really did it!', 2.8);
    K.watcher(S.beerus, 'bs_idle', 'grin');
    yield* st.wait(2.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Phases C–D: Ultra Instinct -Sign- against Kefla; at her floor she goes Super Saiyan 2. */
  P.instinct = { id: 'instinct', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, kf = S.kefla;
    stage(m);
    K.toForm(g, 'uiSign');
    K.toForm(kf, 'ssj');
    if (g.pos.distanceTo(kf.pos) > 18 || g.pos.distanceTo(kf.pos) < 3) {
      TK().place(m, 'goku', [0, 5], 'kefla');
      TK().place(m, 'kefla', [0, -4], 'goku');
    }
    g.hp = Math.max(g.hp, g.hpMax * 0.5);
    g.ki = g.kiMax;
    kf.hp = Math.min(kf.hp, kf.hpMax * 0.9);
    g.storyEvade = { mode: 'god', chance: TU.instinct.evade, gap: 12, from: [kf], kinds: ['sway', 'sway', 'step'], swayPose: 'g_uiSlip', stepPose: 'g_uiSlip2', whiff: 18, trace: SILVER, swayVel: 1.8, stepVel: 4.5, overrun: 7 };
    m.onDispose(() => (g.storyEvade = null));
    m.title(CHAPTER, 'ULTRA INSTINCT -SIGN-', 'Goku vs Kefla', 2.4);
    m.objective('instinct', 'Your body slips her blows — strike in the gaps', { icon: 'fist' });
    const I = TU.instinct;
    let ok = yield* TK().brawl(m, { hero: g, foes: [{ f: kf, floor: I.floor1, dealt: I.dealt, taken: I.taken, ai: { aggression: 0.85 } }] });
    if (!ok) return;
    // SUPER SAIYAN 2: wider, faster combinations
    const st = ST(m);
    g.controller = K.scripted();
    kf.controller = K.scripted();
    g.setState('scripted', { pose: 'g_uiStance', expression: 'serious', aura: 0.7 });
    kf.setState('scripted', { pose: 'powerUp', expression: 'shout', speed: 10, aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'kefla', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('kefla', 'Fine! Then I\'ll go even FURTHER!', 2.4, { style: 'shout' });
    yield* st.wait(1.4);
    K.toForm(kf, 'ssj2');
    b.vfx.ring(kf.pos.clone().add(new V3(0, 0.1, 0)), 12, GREEN, 0.6, new V3(0, 1, 0));
    b.vfx.flash(kf.chest(), 3, 0xd8ff9a, 0.4, SL.Toon.tex.glow);
    b.sfx('transformBurst', kf, { vol: 1.1 });
    b.cameraTraumaAt(kf.chest(), 0.7);
    kf.setState('scripted', { pose: 'kf_victory', expression: 'grin', speed: 8, aura: 1 });
    TK().mood(m, 'excitement', ['champa', 'cabba', 'hit']);
    // the camera pulls back to her whole silhouette and the scale of the aura
    m.shot((t, o, el) => {
      const c = kf.chest();
      o.pos.copy(c).addScaledVector(kf.forward, 3 + Math.min(1, el / 1.4) * 6).add(new V3(1.2, -0.3, 0));
      o.look.copy(c);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.6);
    TK().react(m, 'whis', 'Her attacks will come faster now — but watch how little he moves.', 3);
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
    m.objective('instinct2', 'Super Saiyan 2: faster, wider strings — keep slipping them, keep countering', { icon: 'fist' });
    ok = yield* TK().brawl(m, { hero: g, foes: [{ f: kf, floor: I.floor2, dealt: I.dealt * 1.2, taken: I.taken, ai: { aggression: 0.95, defense: 0.3 } }] });
    g.storyEvade = null;
    if (!ok) return;
    m.complete('instinct');
    m.complete('instinct2');
  } };

  /** Phase E: the chase through the air. */
  P.aerial = { id: 'aerial', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, kf = S.kefla, A = b.stage.arena;
    stage(m);
    const st = ST(m);
    g.controller = K.scripted();
    kf.controller = K.scripted();
    K.toForm(g, 'uiSign');
    K.toForm(kf, 'ssj2');
    // up off the platform
    const g0 = new V3(0, A.y + 9, 6), k0 = new V3(0, A.y + 6, -8);
    g.setPosition(g0);
    kf.setPosition(k0);
    for (const f of [g, kf]) {
      f.grounded = false;
      f.vel.set(0, 0, 0);
    }
    K.faceTo(g, kf.pos);
    K.faceTo(kf, g.pos);
    g.setState('scripted', { pose: 'flyIdle', expression: 'serious', aura: 0.8 });
    kf.setState('scripted', { pose: 'dash', expression: 'shout', speed: 16, aura: 1 });
    // wide: the platform below, the two of them above it
    m.shot((t, o) => {
      o.pos.set(34, A.y + 6, 30);
      o.look.copy(g.pos.clone().lerp(kf.pos, 0.5));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.2);
    // side tracking as she closes; a punch; he leans away; her miss followed; he is at her flank
    const strike = function* (side) {
      const to = g.pos.clone().addScaledVector(kf.dirTo(g), -0.9);
      const from = kf.pos.clone();
      kf.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 40, aura: 1 });
      m.shot((t, o) => {
        const mid = kf.chest().lerp(g.chest(), 0.5);
        o.pos.copy(mid).add(new V3(0, 0.6, 0)).addScaledVector(new V3(kf.forward.z, 0, -kf.forward.x), 6 * side);
        o.look.copy(mid);
        o.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        kf.setPosition(from.clone().lerp(to, Math.min(1, n / 10)));
        return n >= 10;
      };
      g.setState('scripted', { pose: side > 0 ? 'g_uiSlip' : 'g_uiSlip2', expression: 'calm', speed: 50, aura: 0.8 });
      g.ghost(0.15, 0.3);
      b.vfx.ring(g.chest(), 0.9, SILVER, 0.18);
      b.sfx('dodge', g, { vol: 0.5, pitch: 1.3 });
      // her miss carries on past him
      const past = kf.pos.clone().addScaledVector(kf.forward, 4);
      const k1 = kf.pos.clone();
      n = 0;
      yield () => {
        n++;
        kf.setPosition(k1.clone().lerp(past, Math.min(1, n / 12)));
        return n >= 12;
      };
      // and he is at her flank
      g.setPosition(kf.pos.clone().add(new V3(kf.forward.z * side * 1.6, 0.2, -kf.forward.x * side * 1.6)));
      K.faceTo(g, kf.pos);
      g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 12, aura: 0.8 });
      K.faceTo(kf, g.pos);
      kf.setState('scripted', { pose: 'flyIdle', expression: 'angry', speed: 10, aura: 1 });
      yield* st.wait(0.5);
    };
    yield* strike(1);
    yield* strike(-1);
    yield* strike(1);
    // pull back: the two auras, green and silver, separate
    const gp = g.pos.clone(), kp = kf.pos.clone();
    const dir = gp.clone().sub(kp).setY(0).normalize();
    m.shot((t, o) => {
      const mid = g.pos.clone().lerp(kf.pos, 0.5);
      o.pos.copy(mid).add(new V3(dir.z * 16, 4, -dir.x * 16));
      o.look.copy(mid);
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 30);
      g.setPosition(gp.clone().addScaledVector(dir, k * 7));
      kf.setPosition(kp.clone().addScaledVector(dir, -k * 7));
      return n >= 30;
    };
    yield* st.wait(0.4);
    // THE GROUND RECOVERY: she drops back to the platform and lands one foot ahead, leaning on it, and has to
    // straighten before she can turn; he lands several steps away, still composed
    const kLand = K.ground(b, new V3(U.clamp(kf.pos.x, -24, 24), 0, U.clamp(kf.pos.z, -24, 24)));
    const gLand = K.ground(b, kLand.clone().addScaledVector(dir, 6));
    const kAir = kf.pos.clone(), gAir = g.pos.clone();
    kf.setState('scripted', { pose: 'dash', expression: 'angry', speed: 16, aura: 1 });
    g.setState('scripted', { pose: 'flyDown', expression: 'calm', speed: 10, aura: 0.7 });
    m.shot((t, o) => {
      o.pos.copy(kLand).add(new V3(dir.z * 6, 1, -dir.x * 6));
      o.look.copy(kf.pos).add(new V3(0, 0.5, 0));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 20), e = k * k;
      kf.setPosition(kAir.clone().lerp(kLand, e));
      g.setPosition(gAir.clone().lerp(gLand, Math.min(1, n / 26)));
      return n >= 26;
    };
    for (const f of [g, kf]) f.grounded = true;
    K.place(kf, kLand, kf.yaw);
    K.place(g, gLand, g.yaw);
    kf.setState('scripted', { pose: 'overreach', expression: 'grit', speed: 18 });
    b.vfx.dust(kLand.clone(), 1.4, 10);
    b.sfx('groundImpact', kf, { vol: 0.7 });
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 8, aura: 0.7 });
    K.faceTo(g, kf.pos);
    yield* st.wait(0.6);
    K.faceTo(kf, g.pos);
    kf.setState('scripted', { pose: 'kf_stance', expression: 'angry', speed: 6, aura: 1 });
    yield* st.wait(0.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Phase F: the Gigantic Ray, the slip, the Kamehameha at close range, the edge. */
  P.finish = { id: 'finish', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, kf = S.kefla, A = b.stage.arena;
    stage(m);
    const st = ST(m);
    g.controller = K.scripted();
    kf.controller = K.scripted();
    K.toForm(g, 'uiSign');
    K.toForm(kf, 'ssj2');
    g.setPosition(new V3(0, A.y + 6, 10));
    kf.setPosition(new V3(0, A.y + 8, -10));
    for (const f of [g, kf]) {
      f.grounded = false;
      f.vel.set(0, 0, 0);
    }
    K.faceTo(g, kf.pos);
    K.faceTo(kf, g.pos);
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', aura: 0.8 });
    // she charges it in the air: green light on her face and arms
    kf.setState('scripted', { pose: 'beamChargeSide', expression: 'shout', aura: 1 });
    m.shot((t, o) => {
      const c = kf.chest();
      o.pos.copy(c).addScaledVector(kf.forward, 2.4).add(new V3(0.6, 0.2, 0));
      o.look.copy(c);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const glow = () => {
      if (b.frame % 3 === 0) b.vfx.flash(kf.chest().addScaledVector(kf.forward, 0.5), 1.4, GREEN, 0.12, SL.Toon.tex.glow);
    };
    m.tickHooks.push(glow);
    m.say('kefla', 'Dodge THIS — Gigantic... RAAAY!', 2.4, { style: 'shout' });
    yield* st.wait(1.6);
    K.unhook(m, glow);
    kf.setState('scripted', { pose: 'beamFire', expression: 'shout', speed: 20, aura: 1 });
    b.sfx('beamFire', kf, { vol: 1.3 });
    const a = kf.chest().addScaledVector(kf.forward, 0.6);
    const e = a.clone().addScaledVector(kf.forward, 80);
    const ray = () => {
      if (b.frame % 2 === 0) {
        b.vfx.slash(a, e, 0xff6a5a, 0.14, 1.4);
        b.vfx.slash(a, e, GREEN, 0.12, 0.9);
      }
    };
    m.tickHooks.push(ray);
    m.shot((t, o) => {
      const mid = g.chest().lerp(kf.chest(), 0.35);
      o.pos.copy(mid).add(new V3(10, 2, 0));
      o.look.copy(mid);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const r1 = yield* st.cue('dodge', 'Slip it (Dodge)', { auto: 2.4, slow: 0.3 });
    m.qteParts.push(r1.pressed ? 1 : 0.5);
    // he shifts sideways; the ray goes past; the camera follows it a moment, then whips back
    const side = new V3(kf.forward.z, 0, -kf.forward.x);
    const g0 = g.pos.clone();
    g.ghost(0.18, 0.35);
    g.setPosition(g0.clone().addScaledVector(side, 3));
    g.setState('scripted', { pose: 'g_uiSlip', expression: 'calm', speed: 40, aura: 0.8 });
    m.shot((t, o) => {
      o.pos.copy(g0).add(new V3(2, 2, 6));
      o.look.copy(e.clone().lerp(g0, 0.6));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.7);
    K.unhook(m, ray);
    // he closes the distance and begins the Kamehameha at close range
    const close = kf.pos.clone().addScaledVector(kf.forward, 1.6).addScaledVector(side, 0.4);
    g.ghost(0.15, 0.3);
    g.setPosition(close);
    K.faceTo(g, kf.pos);
    g.setState('scripted', { pose: 'g_kameCharge', expression: 'serious', aura: 1 });
    kf.setState('scripted', { pose: 'hitBack', expression: 'shock', speed: 10, aura: 0.6 });
    m.shot((t, o) => {
      const mid = g.chest().lerp(kf.chest(), 0.5);
      o.pos.copy(mid).add(new V3(side.x * 3, 0.6, side.z * 3));
      o.look.copy(mid);
      o.fov = 42;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const r2 = yield* st.cue('ult', 'Kamehameha — point-blank (Ultimate)', { auto: 2.6, slow: 0.35 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    g.setState('scripted', { pose: 'g_kameFire', expression: 'shout', speed: 40, aura: 1 });
    b.sfx('beamFire', g, { vol: 1.4 });
    SL.ScreenFX.flash(0.85, '#e8f4ff');
    b.vfx.explosion(kf.chest(), 3, 0xbfe8ff, { smoke: false });
    b.cameraTraumaAt(kf.chest(), 1);
    // pulled back: she is driven past the edge of the platform
    const push = kf.dirTo(g).negate().setY(0).normalize();
    const kOut = kf.pos.clone();
    m.shot((t, o) => {
      o.pos.set(push.z * 40, A.y + 14, -push.x * 40).add(kOut.clone().multiplyScalar(0.3));
      o.look.copy(kf.pos);
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const beamOn = () => {
      if (b.frame % 2 === 0) b.vfx.slash(g.chest().addScaledVector(g.forward, 0.5), kf.chest(), 0x8ad8ff, 0.12, 0.8);
    };
    m.tickHooks.push(beamOn);
    kf.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 14 });
    const t0 = performance.now();
    const kEnd = kOut.clone().addScaledVector(push, 60);
    kEnd.y = A.y - 4;
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 1600);
      kf.setPosition(kOut.clone().lerp(kEnd, k));
      return k >= 1 || st.skip.on;
    };
    K.unhook(m, beamOn);
    // the earrings shatter: Caulifla and Kale, falling apart
    SL.ScreenFX.flash(0.6, '#d8ffd0');
    b.vfx.flash(kf.chest(), 6, 0x9aff6a, 0.5, SL.Toon.tex.glow);
    b.sfx('warpShatter', kf, { vol: 1 });
    const fallAt = kf.pos.clone();
    kf.setHidden(true);
    for (const [id, dx] of [['caulifla', -1], ['kale', 1]]) {
      const f = S[id];
      f.setHidden(false);
      K.toForm(f, 'base');
      f.setPosition(fallAt.clone().add(new V3(dx * 1.2, 0, 0)));
      f.grounded = false;
      f.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 12 });
    }
    const f0 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - f0) / 1400);
      for (const [id, dx] of [['caulifla', -1], ['kale', 1]]) S[id].setPosition(fallAt.clone().add(new V3(dx * (1.2 + k * 2), -k * 26, 0)));
      return k >= 1 || st.skip.on;
    };
    SL.Cinema.shotOn(m, S, { subject: 'grandpriest', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* TK().priest(m, 'Caulifla and Kale of Universe 6 — eliminated.', 3);
    for (const id of ['caulifla', 'kale']) TK().toSeat(m, id);
    TK().cheer(m, true);
    TK().react(m, 'champa', 'NOOO! My Saiyans!', 2, { style: 'shout' });
    K.watcher(S.champa, 'ch6_shout', 'sad');
    yield* st.wait(2);
    TK().cheer(m, false);
    // the silver goes out of him
    g.setPosition(K.ground(b, new V3(U.clamp(g.pos.x, -20, 20), 0, U.clamp(g.pos.z, -20, 20))));
    g.grounded = true;
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.toForm(g, 'base');
    g.setState('scripted', { pose: 'g_defeatKnee', expression: 'exhausted', speed: 6, aura: 0 });
    b.sfx('kiUp', g, { pitch: 0.5, vol: 0.6 });
    m.say('goku', 'Hah... hah... that was... amazing...', 2.6);
    yield* st.wait(2.6);
    TK().react(m, 'caulifla', 'Next time, Goku! Next time I\'ll beat you myself!', 2.8, { style: 'shout' });
    yield* st.wait(2.8);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'INSTINCT', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.topKefla = { TU };
  SL.data.missions.top_kefla = {
    id: 'top_kefla', canon: true, chapter: CHAPTER, title: 'Instinct', character: 'goku', stage: 'top_green',
    subtitle: 'The Tournament of Power · Goku vs Kefla', parTime: 720, qteLabel: 'The close-range Kamehameha',
    blurb: 'Two Saiyans in one body, fresh and furious, against a Goku who has nothing left — except the thing his body did once against Jiren.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' }, adult_gohan: { outfit: 'ag_ultimate' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue', 'uiSign'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Form: Kefla — Super Saiyan 2', 'Story: Universe 6\'s Saiyans eliminated'],
    setup,
    phases: [P.open, P.overwhelm, P.sign, P.phantom, P.instinct, P.aerial, P.finish],
  };
})();
