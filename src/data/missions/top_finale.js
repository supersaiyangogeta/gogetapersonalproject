/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "The Final Battle" (Goku, Frieza and Android 17 vs Jiren; the wish).
 * Tournament of power ui.docx §9 and the implementation blueprint: one continuous sequence. Goku is spent; Frieza and
 * 17 step in (the fight changes hands, it is not three cutscenes); they push Jiren back and 17's surprise attack drops
 * him to one knee; Top calls to him and he rises; his huge attack against Frieza and 17's barrier — Frieza's gold
 * failing — until Goku drags himself up and adds his hands to theirs; "Throw me at him!"; Goku's last burst is a Super
 * Saiyan flash in the middle of the flight, never a stationary transformation; the three go over the edge together.
 * Then the ending the doc insists on: 17 alone on the platform, the Grand Priest's call, the Super Dragon Balls, the
 * erased universes restored, Cabba and Vegeta, Frieza's promise, and Jiren.
 *
 *   ARRIVE *     (staged)       Goku on one knee, Jiren closing; Frieza from the side; 17 revealed; Jiren turns
 *   PUSH *       (play, Frieza) Frieza and 17 (CPU) take the fight to Jiren. Ends on his floor
 *   KNEE         (staged)       17's surprise attack; Jiren on one knee; Frieza's finishing blow; Top; Jiren rises
 *   BARRIER *    (struggle)     Jiren's huge attack on Frieza and 17's barrier: it sags whatever you do — then Goku
 *                               joins it, and together it holds (mash)
 *   THROW *      (cue)          "Throw me at him!" — Goku throws Frieza (Throw); the tracking shot; the grapple
 *   BURST        (staged)       Goku's flight: the side track, his face, the gold flash mid-flight, the acceleration,
 *                               the impact
 *   EDGE         (struggle)     the final push: drive him over the edge (mash) while he fights back; all three fall
 *   WINNER       (staged)       the call; Universe 7's stands; 17 alone; Universe 7 wins; Universe 11 erased
 *   WISH         (staged)       Super Shenron; 17's wish; the universes return; Cabba and Vegeta
 *   AFTER        (staged)       Frieza's promise kept; Goku and Jiren
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const TK = () => SL.data.topKit;
  const EK = () => SL.data.endzKit;
  const ST = (m) => SL.data.u6Kit.staged(m);
  const CHAPTER = 'CHAPTER 22 · THE TOURNAMENT OF POWER';
  const GOLD = 0xffc81e, RED = 0xff3a2a, SHIELD = 0x9ae0ff;
  const TU = {
    push: { floor: 0.55, dealt: 0.22, taken: 0.4 },
    hold: { start: 0.55, drain: 0.32, seconds: 6, sag: 0.07 },
    together: { drain: 0.12, seconds: 9 },
    edge: { start: 0.3, drain: 0.08, seconds: 14, surgeEvery: 2.4, surgeDrain: 0.4 },
  };
  // the line of the fight runs along x: Universe 7 to the west, Jiren to the east, the drop beyond him
  const SPOT = { goku: [-16, 6], frieza: [-4, 1.4], android_17: [-4, -1.4], jiren: [12, 0], kneel: [-4, 0] };
  const RESTORED = ['cabba', 'caulifla', 'kale', 'hit', 'champa', 'vados'];

  function setup(b) {
    const S = TK().setup(b, {
      player: 'frieza', fight: ['frieza', 'jiren', 'android_17', 'goku'],
      seat: ['beerus', 'whis', 'krillin', 'tien', 'roshi', 'adult_gohan', 'piccolo', 'android_18', 'vegeta', 'toppo', 'dyspo', ...RESTORED],
    });
    // Universe 6 was erased: their seats stay empty until the wish
    for (const id of RESTORED) {
      b.top.seated.delete(id);
      S[id].setHidden(true);
      S[id].untargetable = S[id].intangible = true;
    }
    return S;
  }

  /** Everyone where the fight left them: forms, the halo, the damage. over: the fight is over (Frieza back in his
   *  final form in the stands — the phases after the elimination used to put him back in gold) */
  function stage(m, over) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    b.split = null;
    K.clearCombat(b);
    b.stage.clearMood(0.6);
    TK().seat(m);
    TK().ruin(b, 3);
    BK.give(S.frieza, 'golden');
    BK.give(S.jiren, 'full');
    BK.give(S.goku, 'ssj');
    K.toForm(S.frieza, over ? 'final' : 'golden');
    K.toForm(S.jiren, 'full');
    K.toForm(S.goku, 'base');
    TK().halo(S.frieza);
    for (const id of ['goku', 'frieza', 'android_17', 'jiren']) {
      const f = S[id];
      f.setHidden(false);
      f.untargetable = f.intangible = false;
      f.ringedOut = false;
    }
    if (S.goku.setDamage) S.goku.setDamage(3);
    S.goku.model.setWorn && S.goku.model.setWorn(true);
    if (S.jiren.setDamage) S.jiren.setDamage(2);
    if (S.vegeta.setDamage) S.vegeta.setDamage(3);
  }

  /** Frieza's gold gone out of him: his final form, the halo kept (the barrier's end, and every phase after it). */
  function goldGone(m) {
    const fz = m.battle.story.frieza;
    if (fz.form.id === 'golden') {
      K.toForm(fz, 'final');
      if (!m.battle.skipRequested) m.battle.vfx.flash(fz.chest(), 1.6, GOLD, 0.2, SL.Toon.tex.glow);
    }
    fz.model.setForm(fz.form);
    m.flags.friezaGoldGone = true;
  }

  /** Goku out of it, on one knee where the fight left him. */
  function spent(m, at) {
    const S = m.battle.story, g = S.goku;
    TK().place(m, 'goku', at || SPOT.goku, 'jiren');
    g.controller = K.scripted();
    g.untargetable = g.intangible = true;
    K.watcher(g, 'g_defeatKnee', 'exhausted');
  }

  /** f along a straight line to `to` over n frames (a flight, a slide), facing `face`. Skip-safe. */
  function* glide(st, f, to, n, face) {
    const from = f.pos.clone();
    let i = 0;
    yield () => {
      i++;
      const k = st.skip.on ? 1 : Math.min(1, i / n);
      f.setPosition(from.clone().lerp(to, k));
      f.vel.set(0, 0, 0);
      if (face) K.faceTo(f, face.pos || face);
      return k >= 1;
    };
  }

  /**
   * Roadmap Three, S-END-04 (the owner's Gemini research — a research draft, not checked against the footage): the frame
   * split down the middle, Frieza's red eyes on the left and Goku's on the right, both turned to the seam; locked off on
   * each face, shaking hard (scaled by the Camera Shake setting). Goku's teal drops to black twice for a few frames — the
   * spent body, as in the flight's flickers; his hair stays gold (the owner: gold from the mid-flight flash on).
   * opts (the promise exchange's medium split, CS-END-02): reach (m along the face's forward and side), fov, aimDown (m
   * below the eyes), shake (false: locked off), flicker (false), flag.
   */
  function splitEyes(m, opts = {}) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
    const reach = opts.reach || 0.3, fov = opts.fov || 26, aimDown = opts.aimDown || 0, flag = opts.flag || 'splitEyes';
    const shake = opts.shake !== false, flicker = opts.flicker !== false;
    const cams = [new THREE.PerspectiveCamera(fov, 1, 0.05, 400), new THREE.PerspectiveCamera(fov, 1, 0.05, 400)];
    // opts.third: Jiren's straining face across the bottom half (the reference frame of S-END-04 has him under the two)
    const j = opts.third ? S.jiren : null;
    if (j) cams.push(new THREE.PerspectiveCamera(30, 2, 0.05, 400));
    // whose auras the lenses sit in (thinned for the split, given back after)
    const who = j ? [fz, g, j] : [fz, g];
    const pm = g.model.face && g.model.face.pupilMat, teal = pm && flicker ? pm.color.clone() : null, black = new THREE.Color(0x1a1a22);
    let n = 0, caps = null;
    // three-quarter on the eyes from the face's outer side (away from the other one), 0.42 m off, in the HEAD's own
    // frame: Frieza's lunge pitches his head down, and the body's forward put the lens behind it
    const place = (cam, f, other) => {
      f.model.root.updateMatrixWorld(true);
      const q = f.model.joints.head.getWorldQuaternion(new THREE.Quaternion());
      const fw = new V3(0, 0, 1).applyQuaternion(q), side = new V3(1, 0, 0).applyQuaternion(q), up = new V3(0, 1, 0).applyQuaternion(q);
      if (side.dot(other.pos.clone().sub(f.pos)) > 0) side.negate();
      const eyes = f.model.face.pupils.reduce((s, p) => s.add(p.getWorldPosition(new V3())), new V3()).multiplyScalar(0.5);
      const a = shake ? 0.012 * SL.Settings.data.camera.shake : 0;
      const at = eyes.clone().addScaledVector(up, -aimDown);
      cam.position.copy(eyes).addScaledVector(fw, reach).addScaledVector(side, reach).addScaledVector(up, 0.03).add(new V3(U.rand(-a, a), U.rand(-a, a), U.rand(-a, a)));
      cam.up.copy(up);
      cam.lookAt(at);
      if (a) cam.rotateZ(U.rand(-2.5, 2.5) * a);
    };
    // Jiren: square on his face from in front and a little below, between the two of them pushing into him
    const placeFront = (cam, f) => {
      f.model.root.updateMatrixWorld(true);
      const q = f.model.joints.head.getWorldQuaternion(new THREE.Quaternion());
      const fw = new V3(0, 0, 1).applyQuaternion(q), up = new V3(0, 1, 0).applyQuaternion(q);
      const face = SL.Cinema.body(f).face, a = shake ? 0.012 * SL.Settings.data.camera.shake : 0;
      cam.position.copy(face).addScaledVector(fw, opts.thirdReach || 0.8).addScaledVector(up, -(opts.thirdLow || 0.25)).add(new V3(U.rand(-a, a), U.rand(-a, a), U.rand(-a, a)));
      cam.up.copy(up);
      cam.lookAt(face);
      if (a) cam.rotateZ(U.rand(-2.5, 2.5) * a);
    };
    const hook = () => {
      n++;
      place(cams[0], fz, g);
      place(cams[1], g, fz);
      if (j) placeFront(cams[2], j);
      if (teal) pm.color.copy((n >= 20 && n < 23) || (n >= 48 && n < 51) ? black : teal);
    };
    return {
      on: false,
      start() {
        this.on = true;
        // the lenses sit inside the auras: thinned at once for the split (it washed Goku's half 48 % white)
        caps = who.map((f) => f.auraViewCap);
        for (const f of who) {
          f.auraViewCap = 0.1;
          if (f.aura) f.aura.viewMul = 0.1;
        }
        m.tickHooks.push(hook);
        hook();
        b.split = cams;
        m.flags[flag] = true;
      },
      stop() {
        if (!this.on) return;
        this.on = false;
        K.unhook(m, hook);
        if (b.split === cams) b.split = null;
        if (teal) pm.color.copy(teal);
        who.forEach((f, i) => (f.auraViewCap = caps[i]));
      },
    };
  }

  const P = {};

  /** Goku spent; the fight changes hands. */
  P.arrive = { id: 'arrive', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, a17 = S.android_17, j = S.jiren;
    stage(m);
    const st = ST(m);
    for (const f of [g, fz, a17, j]) f.controller = K.scripted();
    TK().place(m, 'goku', SPOT.kneel, 'jiren');
    TK().place(m, 'jiren', [14, 0], 'goku');
    TK().place(m, 'frieza', [-1, 22], 'jiren');
    TK().place(m, 'android_17', [-8, -14], 'jiren');
    fz.setHidden(true);
    a17.setHidden(true);
    g.setState('scripted', { pose: 'g_defeatKnee', expression: 'exhausted', aura: 0 });
    j.setState('scripted', { pose: 'jr_walk', expression: 'cold', speed: 6, aura: 0.6 });
    m.music('desperate', 3);
    // wide: the broken platform, the void
    m.shot((t, o, el) => {
      o.pos.set(-60 + el * 2, 30, 60 - el * 2);
      o.look.set(0, 4, 0);
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.title(CHAPTER, 'THE FINAL BATTLE', 'Universe 7 vs Jiren', 3.4);
    yield* st.wait(3.4);
    // Goku in the foreground, hunched; Jiren walking at him
    m.shot((t, o) => {
      o.pos.copy(g.pos).add(new V3(-2.4, 1.1, 1.3));
      o.look.copy(j.chest());
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* glide(st, j, K.ground(b, new V3(3, 0, 0)), 110, g);
    j.setState('scripted', { pose: 'jr_hammerW', expression: 'cold', speed: 8, aura: 0.8 });
    m.say('jiren', 'You fought well, Son Goku. It ends here.', 2.6);
    yield* st.wait(2.4);
    // Frieza from the side of the frame, not in front of Goku: an intervention
    fz.setHidden(false);
    fz.setState('scripted', { pose: 'flyForward', expression: 'smirk', speed: 10, aura: 1 });
    yield* glide(st, fz, K.ground(b, new V3(1.6, 0, 0.6)), 14, j);
    fz.setState('scripted', { pose: 'fz_kick', expression: 'smirk', speed: 16, aura: 1 });
    b.vfx.ring(j.chest(), 3, GOLD, 0.3);
    b.vfx.flash(j.chest(), 3, GOLD, 0.25, SL.Toon.tex.glow);
    b.sfx('punchHeavy', j, { vol: 1.2 });
    b.cameraTraumaAt(j.chest(), 0.5);
    j.setState('scripted', { pose: 'jr_guard', expression: 'angry', speed: 12, aura: 0.8 });
    yield* glide(st, j, K.ground(b, new V3(10, 0, 0)), 20);
    fz.setState('scripted', { pose: 'idle', expression: 'smirk', speed: 6, aura: 0.8 });
    K.faceTo(fz, j.pos);
    // 17, revealed wide beside him
    a17.setHidden(false);
    K.place(a17, K.ground(b, new V3(0, 0, -2.2)), 0);
    K.faceTo(a17, j.pos);
    a17.setState('scripted', { pose: 'a17_idle', expression: 'calm', speed: 6 });
    m.shot((t, o) => {
      o.pos.set(-12, b.stage.arena.y + 5, -12);
      o.look.set(4, b.stage.arena.y + 1.2, 0);
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1);
    SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('frieza', 'Don\'t misunderstand, Goku. I\'m not saving you. I\'m protecting what you promised me.', 3.6);
    yield* st.wait(3.6);
    SL.Cinema.shotOn(m, S, { subject: 'android_17', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('android_17', 'Catch your breath, Goku. We\'ll hold him.', 2.4);
    yield* st.wait(2.4);
    // Jiren turns to the newcomers
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    j.setState('scripted', { pose: 'jr_stance', expression: 'cold', speed: 6, aura: 1 });
    m.say('jiren', 'Then the two of you will fall first.', 2.4);
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Frieza and 17 push Jiren back. */
  P.push = { id: 'push', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, fz = S.frieza, a17 = S.android_17, j = S.jiren;
    stage(m);
    spent(m);
    TK().place(m, 'frieza', [0, 1.4], 'jiren');
    TK().place(m, 'android_17', [0, -2.2], 'jiren');
    TK().place(m, 'jiren', [10, 0], 'frieza');
    fz.hp = Math.max(fz.hp, fz.hpMax * 0.75);
    fz.ki = fz.kiMax;
    j.hp = j.hpMax * 0.8;
    m.music('frieza_theme', 4);
    m.objective('push', 'Push Jiren back — Frieza and 17 together', { icon: 'fist' });
    const ok = yield* TK().brawl(m, {
      hero: fz, allies: [a17],
      foes: [{ f: j, floor: TU.push.floor, dealt: TU.push.dealt, taken: TU.push.taken, ai: { aggression: 0.85 } }],
    });
    if (!ok) return;
    m.complete('push');
  } };

  /** 17's surprise attack; Jiren on one knee; Top; Jiren rises. */
  P.knee = { id: 'knee', run: function* (m) {
    const b = m.battle, S = b.story, fz = S.frieza, a17 = S.android_17, j = S.jiren;
    stage(m);
    spent(m);
    const st = ST(m);
    for (const f of [fz, a17, j]) f.controller = K.scripted();
    const c = K.ground(b, new V3(U.clamp(j.pos.x, -10, 20), 0, U.clamp(j.pos.z, -12, 12)));
    K.place(j, c, 0);
    K.place(fz, K.ground(b, c.clone().add(new V3(-7, 0, 1))), 0);
    K.faceTo(j, fz.pos);
    K.faceTo(fz, j.pos);
    j.setState('scripted', { pose: 'jr_stance', expression: 'angry', aura: 1 });
    fz.setState('scripted', { pose: 'fz_block', expression: 'grit', aura: 1 });
    // 17 from behind him
    const back = c.clone().addScaledVector(j.forward, -3.2);
    K.place(a17, K.ground(b, back), 0);
    K.faceTo(a17, j.pos);
    a17.setState('scripted', { pose: 'a17_kickW', expression: 'serious', speed: 12 });
    SL.Cinema.shotOn(m, S, { subject: 'android_17', with: 'jiren', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.5);
    a17.setState('scripted', { pose: 'a17_kick', expression: 'serious', speed: 18 });
    b.vfx.explosion(j.chest().addScaledVector(j.forward, -0.4), 2, 0x8ad4ff, { smoke: false });
    b.sfx('punchHeavy', j, { vol: 1.3 });
    b.cameraTraumaAt(j.chest(), 0.6);
    // side-on wide: Jiren drops to one knee
    j.setState('scripted', { pose: 'defeatKneel', expression: 'hurt', speed: 10, aura: 0.3 });
    b.vfx.dust(j.pos.clone(), 1.6, 12);
    m.shot((t, o) => {
      o.pos.copy(c).add(new V3(0, 2.4, 14));
      o.look.copy(c).add(new V3(-2, 1, 0));
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.4);
    // Frieza approaching, upright and composed
    SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    fz.setState('scripted', { pose: 'idle', expression: 'smirk', speed: 4, aura: 0.8 });
    yield* glide(st, fz, K.ground(b, c.clone().add(new V3(-3.4, 0, 0.6))), 70, j);
    // the close-up as he raises the finishing blow
    fz.setState('scripted', { pose: 'fz_ballW', expression: 'smirk', speed: 6, aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'face', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('frieza', 'Goodbye, Jiren. You\'ve been tiresome.', 2.4);
    yield* st.wait(2.4);
    // Top, in the stands, will not give up on him
    TK().react(m, 'toppo', 'Jiren! Stand up! Believe in the strength that brought you this far!', 3.4, { style: 'shout' });
    K.watcher(S.toppo, 'tp_justice', 'shout');
    yield* st.wait(3.4);
    SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('frieza', 'How perfectly revolting.', 2);
    yield* st.wait(2);
    K.watcher(S.toppo, 'tp_idle', 'serious');
    // he hears it: the dangerous man again
    j.setState('scripted', { pose: 'jr_glare', expression: 'angry', speed: 6, aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    b.vfx.ring(j.pos.clone().add(new V3(0, 0.2, 0)), 12, RED, 0.7, new V3(0, 1, 0));
    b.sfx('roar', j, { vol: 1, pitch: 0.7 });
    b.cameraTraumaAt(j.chest(), 0.8);
    fz.setState('scripted', { pose: 'fz_block', expression: 'shock', speed: 10, aura: 1 });
    yield* st.wait(1.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The barrier: it sags; Goku joins; together it holds. */
  P.barrier = { id: 'barrier', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, a17 = S.android_17, j = S.jiren;
    stage(m);
    spent(m);
    const st = ST(m);
    TK().control(m, 'frieza');
    for (const f of [fz, a17, j]) f.controller = K.scripted();
    TK().place(m, 'frieza', SPOT.frieza, 'jiren');
    TK().place(m, 'android_17', SPOT.android_17, 'jiren');
    TK().place(m, 'jiren', SPOT.jiren, 'frieza');
    fz.setState('scripted', { pose: 'fz_aim', expression: 'grit', aura: 1 });
    a17.setState('scripted', { pose: 'a17_barrier', expression: 'grit', aura: 1 });
    j.setState('scripted', { pose: 'jr_impactW', expression: 'angry', speed: 10, aura: 1 });
    // the barrier: a disc of light in front of their hands
    const mid = () => fz.pos.clone().lerp(a17.pos, 0.5);
    const dGeo = new THREE.CircleGeometry(3.6, 40);
    const dMat = new THREE.MeshBasicMaterial({ color: SHIELD, transparent: true, opacity: 0.45, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const disc = new THREE.Mesh(dGeo, dMat);
    b.scene.add(disc);
    // and his attack: a red sphere pressing on it
    const oGeo = new THREE.SphereGeometry(1, 24, 16);
    const oMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.85, depthWrite: false });
    const orb = new THREE.Mesh(oGeo, oMat);
    b.scene.add(orb);
    m.onDispose(() => {
      for (const o of [disc, orb]) if (o.parent) o.parent.remove(o);
      dGeo.dispose();
      dMat.dispose();
      oGeo.dispose();
      oMat.dispose();
    });
    const place = (grip) => {
      const c = mid().add(new V3(2.2, 1.3, 0));
      disc.position.copy(c);
      disc.lookAt(j.chest());
      dMat.opacity = 0.25 + grip * 0.4 + Math.sin(b.frame * 0.7) * 0.08 * (1 - grip);
      orb.position.copy(c).add(new V3(3.2 + grip * 0.8, 0, 0));
      orb.scale.setScalar(2.6 + Math.sin(b.frame * 0.3) * 0.15);
      if (b.frame % 2 === 0) b.vfx.sparks(c.clone().add(new V3(0.4, U.rand(-1.5, 1.5), U.rand(-1.5, 1.5))), b.frame % 4 ? RED : SHIELD, 3, 8, 0.12);
    };
    place(0.5);
    m.music('climax', 5);
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    j.setState('scripted', { pose: 'jr_impact', expression: 'angry', speed: 18, aura: 1 });
    b.sfx('kiBlastBig', j, { vol: 1.4, pitch: 0.5 });
    yield* st.wait(1);
    // behind Frieza and 17: the barrier fills the frame
    m.shot((t, o) => {
      o.pos.copy(mid()).add(new V3(-4.5, 2, 0.6));
      o.look.copy(disc.position);
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.objective('hold', 'Hold the barrier with 17', { icon: 'shield' });
    // it sags whatever you do: Frieza's gold failing, their feet sliding back across the stone
    let flick = 0;
    const r1 = yield* m.struggle({
      start: TU.hold.start, drain: TU.hold.drain, duration: TU.hold.seconds, label: 'HOLD THE BARRIER (mash)',
      override: (t, grip) => (grip > TU.hold.start - t * TU.hold.sag ? TU.hold.start - t * TU.hold.sag : undefined),
      onTick: (t, grip) => {
        place(grip);
        for (const f of [fz, a17]) f.setPosition(f.pos.clone().add(new V3(-0.012, 0, 0)));
        if (t > 2.5 && b.frame % 14 === 0) fz.model.setForm(fz.def.forms[K.formIndex(fz, ++flick % 2 ? 'final' : 'golden')]);
        if (b.frame % 20 === 0) b.vfx.dust(fz.pos.clone(), 0.6, 3);
      },
    });
    // the gold fails (the owner's "Frieza's gold failing"; Roadmap Three, CS-END-01's outcome and every reference image
    // of the final rush: he is in his white final form from here — a research draft, not checked against the footage)
    goldGone(m);
    fz.setState('scripted', { pose: 'fz_aim', expression: 'grit', aura: 1 });
    if (m.state !== 'running') return;
    m.say('frieza', 'This... this is absurd...!', 2, { style: 'shout' });
    // Goku drags himself up and comes, leaning forward, spent
    g.untargetable = g.intangible = false;
    g.setState('scripted', { pose: 'g_defeatStagger', expression: 'grit', speed: 4, aura: 0 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    const slot = fz.pos.clone().add(new V3(-0.2, 0, 1.4));
    yield* glide(st, g, K.ground(b, slot), 80, j);
    // the three-quarter shot: he steps in and adds his hands to theirs
    g.setState('scripted', { pose: 'g_kameFire', expression: 'grit', speed: 8, aura: 0.4 });
    m.shot((t, o, el) => {
      o.pos.copy(mid()).add(new V3(4, 1.6, 6.5 + el * 0.6));
      o.look.copy(mid()).add(new V3(1.4, 1.1, 0.4));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.vfx.ring(disc.position.clone(), 4.2, 0xffffff, 0.4);
    b.sfx('kiUp', g, { vol: 0.9 });
    m.say('goku', 'Hang on... I\'m here!', 2);
    yield* st.wait(1);
    m.complete('hold');
    m.objective('together', 'Hold it — all three of you', { icon: 'shield' });
    const r2 = yield* m.struggle({
      start: Math.max(0.3, r1.grip), drain: TU.together.drain, duration: TU.together.seconds, label: 'HOLD IT — TOGETHER (mash)',
      until: (t, grip) => grip >= 0.97,
      onTick: (t, grip) => place(grip),
    });
    m.qteParts.push((r1.avg + r2.avg) / 2);
    if (m.state !== 'running') return;
    m.complete('together');
    // it holds; the attack breaks apart against it
    orb.visible = false;
    disc.visible = false;
    b.vfx.explosion(disc.position.clone().add(new V3(2, 0, 0)), 5, 0xffd0c0, { smoke: true });
    b.sfx('explosionHuge', j, { vol: 1.1 });
    b.cameraTraumaAt(disc.position, 0.8);
    for (const f of [g, fz, a17]) f.setState('scripted', { pose: 'idle', expression: 'exhausted', speed: 6, aura: 0.4 });
    j.setState('scripted', { pose: 'jr_stance', expression: 'angry', speed: 6, aura: 1 });
    yield* st.wait(1.2);
    // the promise, briefly; Frieza has not become friendly. Roadmap Three, CS-END-02 "the dialogue" (research draft, not
    // checked against the footage): a split frame, Frieza on the left and Goku on the right, both medium close and locked
    // off, each turned to the seam (the lines are the mission's own)
    const promise = splitEyes(m, { reach: 0.72, fov: 34, aimDown: 0.12, shake: false, flicker: false, flag: 'promiseSplit' });
    m.onDispose(() => promise.stop());
    if (!b.skipRequested) promise.start();
    m.say('goku', 'He\'s still this strong... Frieza, I\'ll keep my promise. Just keep yours.', 3.4);
    yield* st.wait(3.4);
    m.say('frieza', 'Spare me the sentiment, monkey. Just don\'t slow me down.', 2.8);
    yield* st.wait(2.8);
    promise.stop();
    m.endShot();
    b.skipRequested = false;
  } };

  /** "Throw me at him!" */
  P.throw = { id: 'throw', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, a17 = S.android_17, j = S.jiren;
    stage(m);
    goldGone(m);
    const st = ST(m);
    TK().control(m, 'goku');
    for (const f of [g, fz, a17, j]) f.controller = K.scripted();
    TK().place(m, 'frieza', SPOT.frieza, 'jiren');
    TK().place(m, 'android_17', SPOT.android_17, 'jiren');
    TK().place(m, 'goku', [SPOT.frieza[0] - 0.2, SPOT.frieza[1] + 1.4], 'jiren');
    TK().place(m, 'jiren', SPOT.jiren, 'frieza');
    g.setState('scripted', { pose: 'idle', expression: 'exhausted', aura: 0.2 });
    a17.setState('scripted', { pose: 'a17_idle', expression: 'serious' });
    j.setState('scripted', { pose: 'jr_stance', expression: 'angry', aura: 1 });
    // the plan: Frieza turns to Goku, torso still angled at Jiren, one arm forward
    K.faceTo(fz, g.pos);
    fz.setState('scripted', { pose: 'fz_point', expression: 'shout', speed: 8, aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'frieza', with: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('frieza', 'Goku! Throw me at him!', 2.2, { style: 'shout' });
    yield* st.wait(2.2);
    // Goku's face: exhausted, then he understands
    g.setState('scripted', { pose: 'idle', expression: 'determined', aura: 0.3 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'face', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.9);
    m.say('goku', '...Got it!', 1.4);
    yield* st.wait(1.4);
    // the stands cannot believe what they are looking at
    TK().mood(m, 'disbelief', ['krillin', 'tien', 'adult_gohan', 'piccolo', 'android_18', 'roshi']);
    TK().react(m, 'krillin', 'Goku and Frieza... fighting side by side?!', 2.2, { style: 'shout' });
    yield* st.wait(2.2);
    TK().react(m, 'vegeta', 'Hmph. Desperate. ...Do it, Kakarot.', 2.4);
    yield* st.wait(2.4);
    // low and side-on: both of them, Jiren in the background
    K.faceTo(fz, j.pos);
    fz.setState('scripted', { pose: 'flyForward', expression: 'grit', speed: 6, aura: 1 });
    fz.setPosition(g.pos.clone().add(new V3(0.6, 1.0, -0.2)));
    g.setState('scripted', { pose: 'throwWind', expression: 'grit', speed: 8, aura: 0.4 });
    m.shot((t, o) => {
      o.pos.copy(g.pos).add(new V3(1.2, 0.5, 5.5));
      o.look.copy(g.chest()).lerp(j.chest(), 0.35);
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.objective('throw', 'Throw Frieza at Jiren', { icon: 'fist' });
    const r = yield* st.cue('throw', 'Throw Frieza (Throw)', { auto: 3, slow: 0.3 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    m.complete('throw');
    g.setState('scripted', { pose: 'throwRelease', expression: 'shout', speed: 16, aura: 0.5 });
    b.sfx('dash', fz, { vol: 1.2 });
    b.vfx.ring(fz.chest(), 2, GOLD, 0.25);
    // the camera goes with him; the arena rushes past
    m.shot((t, o) => {
      o.pos.copy(fz.chest()).add(new V3(-3.5, 1.2, 3.2));
      o.look.copy(fz.chest()).add(new V3(4, 0, 0));
      o.fov = 58;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    j.setState('scripted', { pose: 'jr_guard', expression: 'angry', speed: 10, aura: 1 });
    const hit = j.pos.clone().add(new V3(-1.1, 1.0, 0));
    let n = 0;
    const from = fz.pos.clone();
    yield () => {
      n++;
      const k = st.skip.on ? 1 : Math.min(1, n / 44);
      fz.setPosition(from.clone().lerp(hit, k));
      if (n % 2 === 0) b.vfx.trail(fz.chest(), GOLD, 0.5, 0.3);
      // halfway: Jiren turns to meet it — from over his shoulder, Frieza coming straight at the lens, arms forward
      if (n === 22) {
        j.setState('scripted', { pose: 'jr_guard', expression: 'angry', speed: 14, aura: 1 });
        m.shot((t, o) => {
          const back = j.pos.clone().sub(fz.pos).setY(0).normalize();
          o.pos.copy(j.headPos ? j.headPos() : j.chest()).addScaledVector(back, 2.2).add(new V3(0.9, 0.3, 0));
          o.look.copy(fz.chest());
          o.fov = 48;
        }, 999, { hold: true, cut: true, blendIn: 0 });
      }
      return k >= 1;
    };
    // he reaches Jiren first: a contest of strength, not a clean knockout
    fz.setState('scripted', { pose: 'fz_lunge', expression: 'grit', speed: 12, aura: 1 });
    b.vfx.explosion(j.chest(), 2.4, GOLD, { smoke: false });
    b.sfx('punchHeavy', j, { vol: 1.4 });
    b.cameraTraumaAt(j.chest(), 0.7);
    SL.Cinema.shotOn(m, S, { subject: 'jiren', with: 'frieza', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    n = 0;
    const j0 = j.pos.clone();
    yield () => {
      n++;
      const k = st.skip.on ? 1 : Math.min(1, n / 70);
      const e = 1 - (1 - k) * (1 - k);
      j.setPosition(j0.clone().add(new V3(9 * e, 0, 0)));
      fz.setPosition(j.pos.clone().add(new V3(-1.1, 1.0, 0)));
      if (n % 4 === 0) b.vfx.dust(j.pos.clone(), 0.8, 3);
      return k >= 1;
    };
    m.say('jiren', 'You think this is enough?!', 2, { style: 'shout' });
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Goku's last burst: gold in the middle of the flight. */
  P.burst = { id: 'burst', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, j = S.jiren;
    stage(m);
    goldGone(m);
    const st = ST(m);
    for (const f of [g, fz, j]) f.controller = K.scripted();
    // the grapple where the throw left it
    if (j.pos.x < 16) TK().place(m, 'jiren', [21, 0], 'goku');
    K.faceTo(j, new V3(-50, j.pos.y, 0));
    fz.setPosition(j.pos.clone().add(new V3(-1.1, 1.0, 0)));
    K.faceTo(fz, j.pos);
    fz.setState('scripted', { pose: 'fz_lunge', expression: 'grit', aura: 1 });
    j.setState('scripted', { pose: 'jr_guard', expression: 'angry', aura: 1 });
    if (g.pos.x > j.pos.x - 10) TK().place(m, 'goku', [SPOT.frieza[0], 0], 'jiren');
    g.setPosition(g.pos.clone().add(new V3(0, 1, 0)));
    K.faceTo(g, j.pos);
    g.setState('scripted', { pose: 'flyForward', expression: 'grit', speed: 6, aura: 0.25 });
    const target = () => j.pos.clone().add(new V3(-1.2, 1.0, -0.7));
    let n = 0, speed = 0.18;
    const fly = () => {
      const to = target(), d = to.clone().sub(g.pos);
      const L = d.length();
      if (L > 0.05) g.setPosition(g.pos.clone().addScaledVector(d.normalize(), Math.min(L, speed)));
      g.vel.set(0, 0, 0);
      if (b.frame % 3 === 0) b.vfx.trail(g.chest(), g.form.id === 'ssj' ? GOLD : 0xffffff, 0.3, 0.25);
    };
    m.tickHooks.push(fly);
    m.onDispose(() => K.unhook(m, fly));
    // A — side tracking: all three along the line of travel
    m.shot((t, o) => {
      o.pos.copy(g.chest()).add(new V3(1.5, 0.6, 7));
      o.look.copy(g.chest()).add(new V3(5, 0, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.3);
    // B — his face: black hair, the aura faint. Roadmap Three, CS-END-03 (the owner's Gemini research — a research draft,
    // not checked against the footage): the body is too spent to hold the change, so twice it catches for a few frames —
    // the hair gold, a short yellow burst, an electrical fizz — and drops straight back to black, before the flash (C)
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'face', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    const ssjForm = g.def.forms[K.formIndex(g, 'ssj')], baseForm = g.form;
    n = 0;
    yield () => {
      n++;
      const on = (n >= 22 && n < 26) || (n >= 42 && n < 45);
      if (on !== !!S.flickerOn) {
        S.flickerOn = on;
        g.model.setForm(on ? ssjForm : baseForm);
        if (on) {
          m.flags.ssjFlickers = (m.flags.ssjFlickers || 0) + 1;
          b.vfx.flash(g.headPos(), 0.9, GOLD, 0.12, SL.Toon.tex.glow);
          b.vfx.sparks(g.headPos(), GOLD, 6, 6, 0.12);
          b.sfx('lightning', g, { vol: 0.35, pitch: 1.9 });
        }
      }
      return st.skip.on || n >= 60;
    };
    if (S.flickerOn) g.model.setForm(baseForm);
    S.flickerOn = false;
    // C — the flash: gold, and the camera pulls back to show it, still moving
    K.toForm(g, 'ssj');
    g.setState('scripted', { pose: 'flyForward', expression: 'shout', speed: 8, aura: 1 });
    SL.ScreenFX.flash(0.6, '#ffe070');
    b.vfx.ring(g.chest(), 3, GOLD, 0.35);
    b.sfx('transformBurst', g, { vol: 1 });
    m.shot((t, o, el) => {
      const k = Math.min(1, el / 0.9);
      o.pos.copy(g.chest()).add(new V3(-1 - k * 3, 0.5 + k * 1.2, 2 + k * 5));
      o.look.copy(g.chest());
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.9);
    // D — he leans into it and accelerates
    speed = 0.9;
    m.shot((t, o) => {
      o.pos.copy(g.chest()).add(new V3(-3.2, 0.6, 1.4));
      o.look.copy(target());
      o.fov = 60;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield () => st.skip.on || g.pos.distanceTo(target()) < 0.3;
    K.unhook(m, fly);
    g.setPosition(target());
    // E — the impact: a small shake, then wide on all three moving to the edge
    g.setState('scripted', { pose: 'flyForward', expression: 'shout', speed: 10, aura: 1 });
    b.vfx.explosion(j.chest(), 2.6, GOLD, { smoke: false });
    b.sfx('punchHeavy', j, { vol: 1.5 });
    b.cameraTraumaAt(j.chest(), 0.5);
    yield* st.wait(0.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The final push, and all three over the edge. */
  P.edge = { id: 'edge', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, a17 = S.android_17, j = S.jiren, A = b.stage.arena;
    stage(m);
    goldGone(m);
    K.toForm(g, 'ssj');
    const st = ST(m);
    TK().control(m, 'goku');
    for (const f of [g, fz, a17, j]) f.controller = K.scripted();
    if (j.pos.x < 16) TK().place(m, 'jiren', [21, 0], 'goku');
    const y = j.pos.y;
    K.faceTo(j, new V3(-50, y, 0));
    const lock = () => {
      fz.setPosition(j.pos.clone().add(new V3(-1.1, 1.0, 0.45)));
      g.setPosition(j.pos.clone().add(new V3(-1.2, 1.0, -0.7)));
      for (const f of [fz, g, j]) f.vel.set(0, 0, 0);
      K.faceTo(fz, j.pos);
      K.faceTo(g, j.pos);
    };
    lock();
    fz.setState('scripted', { pose: 'fz_lunge', expression: 'grit', aura: 1 });
    g.setState('scripted', { pose: 'flyForward', expression: 'shout', aura: 1 });
    j.setState('scripted', { pose: 'jr_guard', expression: 'angry', aura: 1 });
    a17.setState('scripted', { pose: 'a17_barrier', expression: 'serious', aura: 0.6 });
    K.faceTo(a17, j.pos);
    // from the side, then to the front: the boundary coming up beneath them
    m.shot((t, o, el) => {
      const k = Math.min(1, el / 6);
      const c = j.chest();
      o.pos.copy(c).add(new V3(U.lerp(-2, 8, k), U.lerp(1.2, 2.4, k), U.lerp(8, 2.5, k)));
      o.look.copy(c).add(new V3(-0.6, -0.2, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const x0 = j.pos.x, edge = A.half + 0.5;
    let stageCut = 0, splitAt = 0;
    const split = splitEyes(m, { third: true });
    m.onDispose(() => split.stop());
    m.objective('edge', 'Drive him over the edge — together', { icon: 'fist' });
    const r = yield* m.struggle({
      start: TU.edge.start, drain: TU.edge.drain, duration: TU.edge.seconds, label: 'PUSH! (mash)',
      surgeEvery: TU.edge.surgeEvery, surgeDrain: TU.edge.surgeDrain, surgeLabel: 'JIREN PUSHES BACK — keep pushing!',
      onSurge: () => {
        b.vfx.ring(j.chest(), 2.4, RED, 0.3);
        b.cameraTraumaAt(j.chest(), 0.3);
        b.sfx('roar', j, { vol: 0.6, pitch: 0.8 });
      },
      // a fast push holds at the edge until the split frame has played out (S-END-04)
      until: (t, grip) => grip >= 0.97 && !split.on,
      onTick: (t, grip) => {
        j.setPosition(new V3(U.lerp(x0, edge, grip), y, j.pos.z));
        lock();
        // halfway: Jiren's resistance, close — his face, the two of them driving into him
        if (stageCut === 0 && (grip > 0.45 || t > TU.edge.seconds * 0.4)) {
          stageCut = 1;
          m.shot((tt, o) => {
            const hd = j.headPos ? j.headPos() : j.chest();
            o.pos.copy(hd).add(new V3(2.6, -0.2, 1.6));
            o.look.copy(hd).lerp(g.chest(), 0.35);
            o.fov = 42;
          }, 999, { hold: true, cut: true, blendIn: 0 });
          m.say('jiren', 'I... will not... be beaten!', 2, { style: 'shout' });
        }
        // near the end: the split frame on their eyes as Frieza shouts (S-END-04), then from the front, the boundary
        // coming up beneath them
        if (stageCut === 1 && (grip > 0.78 || t > TU.edge.seconds * 0.75)) {
          stageCut = 2;
          splitAt = t;
          split.start();
          m.say('frieza', 'Go... OVER!', 1.6, { style: 'shout' });
        }
        if (stageCut === 2 && t - splitAt >= 1.3) {
          stageCut = 3;
          split.stop();
          // already at the edge: straight on to the fall (the front shot would last one frame)
          if (grip < 0.97) m.shot((tt, o) => {
            const c = j.chest();
            o.pos.copy(c).add(new V3(7, -0.6, 2.2));
            o.look.copy(c).add(new V3(-1, -0.4, 0));
            o.fov = 56;
          }, 999, { hold: true, cut: true, blendIn: 0 });
        }
        if (b.frame % 4 === 0) b.vfx.sparks(j.chest(), b.frame % 8 ? GOLD : RED, 3, 8, 0.12);
        // 17 behind them, the openings
        if (b.frame % 90 === 0) {
          b.vfx.flash(a17.handPos ? a17.handPos('R') : a17.chest(), 1.4, 0x8ad4ff, 0.2, SL.Toon.tex.glow);
          b.vfx.ring(j.chest(), 1.6, 0x8ad4ff, 0.25);
        }
      },
    });
    // the push can end inside the split (a fast player, a loss): the full frame back either way
    split.stop();
    m.qteParts.push(r.avg);
    if (m.state !== 'running') return;
    m.complete('edge');
    // wide on the edge: the three cross it together, readable against the void
    j.setPosition(new V3(edge, y, j.pos.z));
    lock();
    const fall = [j, fz, g];
    const from = fall.map((f) => f.pos.clone());
    j.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 10 });
    m.shot((t, o) => {
      o.pos.set(A.half - 6, A.y + 4, j.pos.z + 16);
      o.look.copy(fz.chest());
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    let n = 0;
    yield () => {
      n++;
      const k = st.skip.on ? 1 : Math.min(1, n / 230);
      fall.forEach((f, i) => {
        const q = from[i].clone().add(new V3(10 * k, 0, 0));
        q.y = from[i].y + Math.sin(Math.min(1, k * 2) * Math.PI) * 0.6 - 34 * k * k;
        f.setPosition(q);
        f.vel.set(0, 0, 0);
      });
      // a brief close-up on Goku and Frieza: spent, no smiles
      if (n === 50) {
        fz.setState('scripted', { pose: 'tumble', expression: 'exhausted', speed: 6 });
        K.toForm(g, 'base');
        g.setState('scripted', { pose: 'tumble', expression: 'exhausted', speed: 6, aura: 0 });
        m.shot((t, o) => {
          o.pos.copy(g.chest()).lerp(fz.chest(), 0.5).add(new V3(-1, 0.6, 3.4));
          o.look.copy(g.chest()).lerp(fz.chest(), 0.5);
          o.fov = 44;
        }, 999, { hold: true, cut: true, blendIn: 0 });
        m.say('frieza', 'Hmph... don\'t you dare call this teamwork.', 2.2);
      }
      if (n === 76) m.say('goku', 'Heh... it worked, though.', 1.6);
      // Roadmap Three, CS-END-03 "Jiren's final moments" (research draft, not checked against the footage): close on
      // Jiren as he falls, looking up at the two of them; the fight goes out of his face and he stops struggling
      if (n === 95) {
        // out of the tumble's spin the short way round (its turn runs to many full circles)
        j.anim.root.rx = Math.atan2(Math.sin(j.anim.root.rx), Math.cos(j.anim.root.rx));
        j.setState('scripted', { pose: 'jr_fallAccept', expression: 'hurt', speed: 14, aura: 0 });
        // from their side, above him: his face turned up toward the lens
        SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'face', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      }
      if (n === 113) {
        j.setState('scripted', { pose: 'jr_fallAccept', expression: 'calm', speed: 3, aura: 0 });
        m.flags.jirenAccepts = true;
      }
      // then pull back from the rim and let them drop away together
      if (n === 135) {
        m.shot((t, o) => {
          o.pos.set(A.half - 1, A.y + 6, 0);
          o.look.copy(fz.pos);
          o.fov = 56;
        }, 999, { hold: true, cut: true, blendIn: 0 });
      }
      return k >= 1;
    };
    for (const f of fall) f.ringedOut = true;
    // the stands: Universe 7 — shock first
    TK().mood(m, 'shock');
    SL.Cinema.shotOn(m, S, { subject: 'krillin', with: 'adult_gohan', focus: 'upper', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The call; 17 alone; Universe 7 wins; Universe 11 erased. */
  P.winner = { id: 'winner', run: function* (m) {
    const b = m.battle, S = b.story, a17 = S.android_17;
    stage(m, true);
    const st = ST(m);
    // the three are off the platform: the eliminated sit in the stands
    for (const id of ['goku', 'frieza', 'jiren']) TK().toSeat(m, id);
    K.toForm(S.frieza, 'final');
    TK().halo(S.frieza);
    a17.controller = K.scripted();
    TK().place(m, 'android_17', SPOT.android_17, null);
    K.faceTo(a17, new V3(40, a17.pos.y, 0));
    a17.setState('scripted', { pose: 'a17_idle', expression: 'exhausted', aura: 0 });
    SL.Cinema.shotOn(m, S, { subject: 'grandpriest', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* TK().priest(m, 'Son Goku and Frieza of Universe 7, Jiren of Universe 11 — eliminated.', 3.2);
    // Universe 7's stands: shock, then relief
    b.sfx('crowdGasp', null, { vol: 0.8 });
    TK().react(m, 'krillin', 'They all went over! Then who\'s—', 2.2, { style: 'shout' });
    yield* st.wait(2.2);
    TK().react(m, 'adult_gohan', 'Seventeen. Seventeen is still standing!', 2.4);
    yield* st.wait(2.4);
    // 17 alone on the broken platform; hold it long enough for it to land
    m.shot((t, o, el) => {
      o.pos.copy(a17.pos).add(new V3(14 - el * 0.8, 5 - el * 0.2, 12 - el * 0.6));
      o.look.copy(a17.chest());
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(3);
    SL.Cinema.shotOn(m, S, { subject: 'grandpriest', focus: 'upper', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* TK().priest(m, 'Universe 11 has no fighters remaining. The winner of the Tournament of Power is Universe 7!', 3.8);
    TK().mood(m, 'celebration', ['krillin', 'tien', 'adult_gohan', 'piccolo', 'android_18', 'goku', 'beerus']);
    TK().mood(m, 'pride', ['vegeta', 'frieza']);
    TK().mood(m, 'frustration', ['toppo', 'dyspo']);
    TK().cheer(m, true);
    // Beerus on his feet at the bench, the head going down and a small, proud grin (Roadmap Three, the owner's Gemini
    // research, S-END-06: a research draft, not checked against the footage)
    K.watcher(S.beerus, 'bs_idle', 'smirk');
    SL.Cinema.shotOn(m, S, { subject: 'beerus', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.8);
    SL.Cinema.shotOn(m, S, { subject: 'zeno', focus: 'full', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('zeno', 'Universe 7 wins! That was so fun!', 2.4);
    yield* st.wait(2.4);
    TK().cheer(m, false);
    // and the rule of the tournament: Universe 11 goes
    yield* TK().priest(m, 'As decreed, the defeated universe will now be erased.', 2.8);
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.jiren, 'jr_idle', 'cold');
    yield* st.wait(1.4);
    for (const id of ['jiren', 'toppo', 'dyspo']) {
      const f = S[id];
      b.vfx.flash(f.chest(), 2.4, 0xeef4ff, 0.5, SL.Toon.tex.glow);
      f.setHidden(true);
      b.top.seated.delete(id);
    }
    b.sfx('teleport', null, { vol: 1 });
    yield* st.wait(1.2);
    TK().react(m, 'goku', 'Jiren...', 1.8);
    yield* st.wait(1.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Super Shenron; the wish; the universes return; Cabba and Vegeta. */
  P.wish = { id: 'wish', run: function* (m) {
    const b = m.battle, S = b.story, a17 = S.android_17, A = b.stage.arena;
    stage(m, true);
    const st = ST(m);
    for (const id of ['goku', 'frieza']) TK().toSeat(m, id);
    for (const id of ['jiren', 'toppo', 'dyspo']) {
      S[id].setHidden(true);
      b.top.seated.delete(id);
    }
    a17.controller = K.scripted();
    TK().place(m, 'android_17', [0, 0], null);
    a17.setState('scripted', { pose: 'a17_idle', expression: 'calm' });
    yield* TK().priest(m, 'Android 17. The Super Dragon Balls are yours. Make your wish.', 3.2);
    // he looks down at his hands: any wish at all
    a17.setState('scripted', { pose: 'lookHands', expression: 'calm', speed: 4 });
    m.shot((t, o) => {
      const hd = a17.headPos();
      o.pos.copy(hd).addScaledVector(a17.forward, 1.4).add(new V3(0.4, -0.25, 0));
      o.look.copy(hd).add(new V3(0, -0.2, 0));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: a17, face: true });
    m.say('android_17', '...Any wish at all.', 2);
    yield* st.wait(2.4);
    a17.setState('scripted', { pose: 'a17_idle', expression: 'calm', speed: 4 });
    // the dragon: gold, enormous, rising out of the void beyond the platform
    m.music('peaceful', 1);
    b.stage.setMood(0.45, 0x0a0820, 1.4);
    // far out and enormous: he has to dwarf the platform (the far wide shot below)
    const base = new V3(0, A.y - 230, 210);
    let dragon = null;
    if (EK()) {
      dragon = EK().shenron(b, base, new V3(0, A.y, 0), { body: 0xe8b830, belly: 0xf8e8a8, horn: 0xfff2d0, dark: 0xb07818 });
      dragon.group.scale.setScalar(6);
      dragon.rise(0);
      m.onDispose(() => dragon.dispose());
    }
    K.faceTo(a17, base);
    m.shot((t, o) => {
      o.pos.copy(a17.pos).add(new V3(-3, 1.2, -6));
      o.look.copy(dragon ? dragon.headPos() : base).lerp(a17.chest(), 0.1);
      o.fov = 62;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('rumble', null, { vol: 1 });
    let n = 0;
    yield () => {
      n++;
      const k = st.skip.on ? 1 : Math.min(1, n / 150);
      if (dragon) dragon.rise(k);
      if (n % 3 === 0) b.vfx.sparks(base.clone().add(new V3(U.rand(-30, 30), 150 * k + U.rand(0, 30), U.rand(-10, 10))), 0xffe080, 3, 8, 0.4);
      return k >= 1;
    };
    if (dragon) dragon.eyes(1);
    SL.ScreenFX.flash(0.4, '#fff0b0');
    // the scale of it: from far out in the void, the platform a pale chip under the coils
    m.shot((t, o, el) => {
      const h = dragon ? dragon.headPos() : base;
      o.pos.set(-280 + el * 8, A.y + 70, -200);
      o.look.copy(h).lerp(new V3(0, A.y, 0), 0.55);
      o.fov = 58;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(3);
    m.shot((t, o) => {
      const h = dragon ? dragon.headPos() : base;
      o.pos.copy(h).add(new V3(40, -10, -40));
      o.look.copy(h);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    TK().mood(m, 'silent');
    m.say('super_shenron', 'Speak your wish. Any wish at all shall be granted.', 3.2);
    yield* st.wait(3.2);
    SL.Cinema.shotOn(m, S, { subject: 'android_17', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('android_17', 'I wish for every universe erased in this tournament to be restored.', 3.4);
    yield* st.wait(3.4);
    TK().react(m, 'beerus', 'Hmph... of course he did.', 2);
    yield* st.wait(2);
    m.shot((t, o) => {
      const h = dragon ? dragon.headPos() : base;
      o.pos.copy(h).add(new V3(30, -6, -30));
      o.look.copy(h);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('super_shenron', 'That is easy. Your wish has been granted.', 2.8);
    yield* st.wait(2.8);
    // THE UNIVERSES RETURN — an event, not a line: the dragon's eyes blaze, rings of gold light roll out across the
    // void, the dark lifts to warm light, and the empty seats fill one by one along the stands
    if (dragon) dragon.eyes(1);
    const hd = dragon ? dragon.headPos() : base;
    for (let i = 0; i < 4; i++) b.vfx.ring(hd.clone(), 60 + i * 70, 0xffe08a, 1.4 + i * 0.3, new V3(0, 0, 1));
    b.sfx('magic', null, { at: hd, vol: 1.2 });
    m.shot((t, o, el) => {
      o.pos.copy(hd).add(new V3(60 - el * 4, -20, -70));
      o.look.copy(hd).lerp(new V3(0, A.y, 0), Math.min(0.6, el * 0.25));
      o.fov = 56;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.stage.setMood(0.3, 0xffd080, 1.4);
    yield* st.wait(2.2);
    if (dragon) dragon.eyes(0);
    SL.ScreenFX.flash(0.45, '#fff6d8');
    // along the stands, slowly, while they come back
    const L = b.stage.landmarks;
    m.shot((t, o, el) => {
      const k = Math.min(1, el / 6);
      const p = L.stand(0, U.lerp(-0.05, 0.75, k));
      o.pos.copy(p).add(new V3(0, 5, 20));
      o.look.copy(p);
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const back = [...RESTORED, 'toppo', 'dyspo', 'jiren'];
    for (const id of back) {
      const f = S[id];
      if (!f) continue;
      f.untargetable = f.intangible = true;
      TK().seat(m, [id]);
      b.vfx.flash(f.chest(), 2, 0xfff4c8, 0.6, SL.Toon.tex.glow);
      b.vfx.sparks(f.chest(), 0xfff0c0, 8, 6, 0.3);
      b.sfx('teleport', f, { vol: 0.5, pitch: 1.2 });
      yield* st.wait(0.28);
    }
    b.stage.clearMood(2.4);
    K.watcher(S.cabba, 'cb_idle', 'shock');
    yield* st.wait(1.6);
    TK().cheer(m, true);
    SL.Cinema.shotOn(m, S, { subject: 'zeno', with: 'zeno2', focus: 'full', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('zeno', 'Everybody came back!', 2);
    yield* st.wait(2);
    TK().cheer(m, false);
    yield* TK().priest(m, 'A wish made for others. Zen-Oh-sama is very pleased.', 3);
    // Cabba: his universe is back. Then Vegeta, who promised him
    TK().react(m, 'cabba', 'We\'re... back? Universe 6 is back!', 2.6, { style: 'shout' });
    yield* st.wait(2.6);
    K.watcher(S.vegeta, 'armsCrossed', 'smirk');
    TK().react(m, 'vegeta', 'Hmph. I told you, Cabba. A Saiyan keeps his word.', 3);
    yield* st.wait(3);
    TK().react(m, 'caulifla', 'Ha! Told you that guy was good for something.', 2.6);
    yield* st.wait(2.6);
    if (dragon) dragon.group.visible = false;
    m.endShot();
    b.skipRequested = false;
  } };

  /** Frieza's promise; Goku and Jiren. */
  P.after = { id: 'after', run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m, true);
    const st = ST(m);
    for (const id of ['goku', 'frieza', 'jiren', 'toppo', 'dyspo', ...RESTORED]) TK().toSeat(m, id);
    K.toForm(S.frieza, 'final');
    TK().halo(S.frieza);
    S.android_17.controller = K.scripted();
    TK().toSeat(m, 'android_17');
    // Frieza reminds Goku; Goku keeps it
    TK().react(m, 'frieza', 'Now then, Goku. I believe we had an arrangement.', 2.8);
    yield* st.wait(2.8);
    TK().react(m, 'goku', 'Yeah, yeah, I didn\'t forget. Whis?', 2.2);
    yield* st.wait(2.2);
    TK().react(m, 'whis', 'A deal is a deal. Lord Beerus has already agreed — reluctantly.', 3);
    yield* st.wait(3);
    b.vfx.flash(S.frieza.chest(), 2.6, 0xfff6c8, 0.6, SL.Toon.tex.glow);
    TK().unhalo(S.frieza);
    b.sfx('itPop', S.frieza, { vol: 0.9 });
    TK().react(m, 'frieza', 'Don\'t mistake this for friendship. The next time we meet, I\'ll be the one standing.', 3.6);
    yield* st.wait(3.6);
    // Goku and Jiren
    TK().react(m, 'goku', 'Hey, Jiren! Let\'s fight again sometime!', 2.4, { style: 'shout' });
    yield* st.wait(2.4);
    K.watcher(S.jiren, 'jr_idle', 'calm');
    TK().react(m, 'jiren', '...Son Goku. Next time, I will not stand alone.', 3.2);
    yield* st.wait(3.2);
    TK().react(m, 'toppo', 'Jiren...', 1.6);
    yield* st.wait(1.6);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.2);
    yield* m.cine(1.4);
    m.title(CHAPTER, 'UNIVERSE 7 WINS', m.nextLine(), 4.2);
    yield* m.cine(4.4);
  } };

  SL.data.topFinale = { TU };
  SL.data.missions.top_finale = {
    id: 'top_finale', canon: true, chapter: CHAPTER, title: 'The Final Battle', character: 'frieza', stage: 'top_arena',
    subtitle: 'The Tournament of Power · Goku, Frieza and Android 17 vs Jiren', parTime: 840, qteLabel: 'Together',
    blurb: 'Goku is spent. Frieza has a promise to collect and Android 17 has a family to get home to. None of them can win this alone.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'none', emblem: 'none' }, adult_gohan: { outfit: 'ag_ultimate' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { frieza: SL.data.characters.frieza.forms.filter((x) => x.id !== 'golden').map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Ending: Universe 7 wins the Tournament of Power'],
    setup,
    phases: [P.arrive, P.push, P.knee, P.barrier, P.throw, P.burst, P.edge, P.winner, P.wish, P.after],
  };
})();
