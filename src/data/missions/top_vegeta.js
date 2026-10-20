/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "I Leave the Rest to You" (Vegeta vs Jiren; the energy given to Goku).
 * Tournament of power ui.docx §6: Vegeta has already beaten Toppo; he turns to Jiren to win by his own strength;
 * Jiren overwhelms him; he keeps attacking as his energy runs out; then — not as an attack, as something personal — he
 * entrusts Goku with what he has left and with winning for Universe 7. Staging: start low and close on Vegeta, hold on
 * his face, show the transfer as a restrained light (not an explosion), cut to Goku as he understands, return to Jiren.
 * The owner's stills: shirtless and battered — "I swear that Universe 7 is going to win"; the last yellow sphere in his
 * hands; floating out in the void — "Kakarot... I leave the rest to you."
 *
 *   OPEN *     (scene top_vegeta_open) Vegeta, burned down to base and bare to the waist, below Jiren on his ledge
 *   STAND *    (play)             base Vegeta vs Jiren with nothing left: his ki does not come back on its own (only blows
 *                                 he lands feed it); a dodge or a Perfect Guard opens a counter that bites deep. KO /
 *                                 ring-out = defeat. Ends on the clock, or when he is spent
 *   LAST       (cue + staged)     everything left into one sphere (Charge) — Jiren takes it on his folded arms; the
 *                                 Power Impact throws him down across the stone, beside Goku
 *   ENTRUST    (staged + cue)     THE SPEECH (§6: low and close, hold on his face, no montage): pride, the promise to
 *                                 Cabba, the frustration of not doing it himself; Goku listening; the energy given
 *                                 (hold Charge) as a thin restrained light; "surpass him"; Goku understands. Jiren
 *                                 comes; Vegeta stands up one last time and is thrown out into the void — "Kakarot...
 *                                 I leave the rest to you." The ruling. Jiren: one more.
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
  const TU = { stand: { seconds: 40, spent: 0.3, dealt: 0.08, taken: 0.9, counterMul: 2.4 } };
  // last: where the sphere is fired from and taken; down: where the Power Impact throws him, beside Goku
  const SPOT = { vegeta: [0, 8], jiren: [0, -6], goku: [-18, 14], last: [-8, 2], lastJ: [4, -8], down: [-15, 10.4], stand: [-13.4, 8.6], jirenNear: [-5, 0.5] };
  // the oath: battered, leaning in, the right fist clenched in front of his bare chest (the owner's still)
  // floating out in the void (the owner's still): leaned back and tilted, one hand clutching his side, a knee drawn up,
  // the head turned back up toward the platform
  SL.data.poses.v_voidFloat = { hands: ['open', 'fist'], root: { y: 0, rx: -40, rz: 14 }, spine: [10, 0, 6], chest: [8, 8, 0], head: [-18, -12, 0], shoulderR: [-40, 0, 8], elbowR: [-100, 0, 0], shoulderL: [-14, 0, 38], elbowL: [-28, 0, 0], thighL: [-52, 0, 6], kneeL: [84, 0, 0], thighR: [8, 0, -8], kneeR: [22, 0, 0] };
  SL.data.poses.v_swear = { hands: ['fist', 'fist'], root: { y: -0.04 }, spine: [6, -6, 0], chest: [8, -10, 0], head: [-6, 8, 0], shoulderR: [-60, 30, -10], elbowR: [-120, 0, 0], shoulderL: [-6, 0, 18], elbowL: [-20, 0, 0], thighL: [-14, 0, 10], kneeL: [16, 0, 0], thighR: [6, 0, -10], kneeR: [10, 0, 0] };

  SL.data.scenes.top_vegeta_open = {
    id: 'top_vegeta_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    // the Tournament of Power's own battle music (soundtrack PDF p.91–92, "Genkai Toppa x Survivor": an original stand-in)
    music: { song: 'limit_survivor', level: 2 },
    auraCap: 0,
    events: [
      // from behind Vegeta, low: Jiren above him on his ledge of rock
      {
        pose: [{ who: 'vegeta', pose: 'v_bentGasp', face: 'grit' }, { who: 'jiren', pose: 'jr_idle', face: 'cold' }],
        cam: { subject: 'jiren', over: 'vegeta', focus: 'full', angle: 'ots' },
        title: { chapter: CHAPTER, title: 'I LEAVE THE REST TO YOU', subtitle: 'Vegeta vs Jiren', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { subject: 'jiren', focus: 'upper', angle: 'low' },
        say: { who: 'jiren', line: 'You defeated Toppo. Your energy is spent. Step aside.', duration: 3 },
        hold: 3.1,
      },
      // the doc's still: close on him, a fist clenched in front of his bare chest
      {
        pose: [{ who: 'vegeta', pose: 'v_swear', face: 'angry' }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'I swear that Universe 7 is going to win.', duration: 3 },
        hold: 3.1,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.vegeta, K.ground(b, new V3(SPOT.vegeta[0], 0, SPOT.vegeta[1])), Math.PI);
      K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
      K.faceTo(S.vegeta, S.jiren.pos);
      K.faceTo(S.jiren, S.vegeta.pos);
    },
  };

  function setup(b) {
    const S = TK().setup(b, {
      player: 'vegeta', fight: ['vegeta', 'jiren'],
      seat: ['beerus', 'whis', 'krillin', 'tien', 'roshi', 'adult_gohan', 'piccolo', 'android_18', 'toppo', 'dyspo'],
      edge: { goku: SPOT.goku, frieza: [26, 22], android_17: [-28, -12] },
    });
    K.place(S.vegeta, K.ground(b, new V3(SPOT.vegeta[0], 0, SPOT.vegeta[1])), Math.PI);
    K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
    K.faceTo(S.vegeta, S.jiren.pos);
    K.faceTo(S.jiren, S.vegeta.pos);
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
    TK().ruin(b, 2);
    for (const f of [S.vegeta, S.jiren]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
    }
    K.toForm(S.vegeta, 'base');
    if (S.vegeta.setDamage) S.vegeta.setDamage(3);
    S.vegeta.model.setWorn && S.vegeta.model.setWorn(true);
    // Goku at the edge: worn out from Kefla, on one knee, in what is left of the gi
    K.watcher(S.goku, 'g_defeatKnee', 'exhausted');
    if (S.goku.setDamage) S.goku.setDamage(2);
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m);
    yield* SL.Cinema.play(m, 'top_vegeta_open');
  } };

  /** With nothing left: every counter has to count. */
  P.stand = { id: 'stand', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, j = S.jiren;
    stage(m);
    TK().place(m, 'vegeta', SPOT.vegeta, 'jiren');
    TK().place(m, 'jiren', SPOT.jiren, 'vegeta');
    v.hp = v.hpMax * 0.75;
    v.ki = v.kiMax * 0.3;
    j.hp = j.hpMax;
    // his ki does not come back by itself; only the blows he lands feed it (Fighter._applyDamage)
    const regenWas = v.stats.kiRegen;
    v.stats.kiRegen = 0;
    m.onDispose(() => (v.stats.kiRegen = regenWas));
    // a counter (a blow inside the window a dodge or a Perfect Guard opens) bites deep
    let windowAt = -99;
    const takenWas = j.damageTakenMul;
    const watch = () => {
      if (v.counterFrames > 0) windowAt = b.frame;
    };
    m.tickHooks.push(watch);
    const offPre = b.on('damage', (e) => {
      if (e.attacker === v && e.target === j && b.frame - windowAt <= 2) {
        b.vfx.ring(j.chest(), 2.2, 0xffe27a, 0.3);
        m.progress('counters', (m.flags.counters = (m.flags.counters || 0) + 1));
      }
    });
    m.title(CHAPTER, 'VEGETA VS JIREN', 'Nothing left but pride', 2.4);
    m.objective('stand', 'Your ki will not come back by itself — dodge or Perfect Guard, then counter', { icon: 'fist' });
    m.objective('counters', 'Land counters', { icon: 'fist', optional: true, target: 5 });
    let said = 0;
    // counters do more: the storyFight's taken multiplier is raised for a moment after each defensive success
    const boost = () => {
      if (b.frame - windowAt <= 2) j.damageTakenMul = TU.stand.taken * TU.stand.counterMul;
      else j.damageTakenMul = TU.stand.taken;
    };
    m.tickHooks.push(boost);
    const ok = yield* TK().brawl(m, {
      hero: v, seconds: TU.stand.seconds, ease: false,
      foes: [{ f: j, floor: 0.6, dealt: TU.stand.dealt, taken: TU.stand.taken, ai: { aggression: 0.6 } }],
      until: (t) => {
        if (said === 0 && t > 8) {
          said = 1;
          m.say('jiren', 'Why do you still stand? You cannot win.', 2.6);
        } else if (said === 1 && t > 20) {
          said = 2;
          m.say('vegeta', 'Because I am the Prince of all Saiyans... that\'s why!', 2.8, { style: 'shout' });
        }
        return v.hpFrac < TU.stand.spent;
      },
    });
    K.unhook(m, watch);
    K.unhook(m, boost);
    offPre();
    j.damageTakenMul = takenWas;
    v.stats.kiRegen = regenWas;
    if (!ok) return;
    m.complete('stand');
  } };

  /** The last sphere; the fold; the Power Impact — it throws him down beside Goku, not out. */
  P.last = { id: 'last', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, j = S.jiren, g = S.goku;
    stage(m);
    const st = ST(m);
    v.controller = K.scripted();
    j.controller = K.scripted();
    TK().place(m, 'vegeta', SPOT.last, 'jiren');
    TK().place(m, 'jiren', SPOT.lastJ, 'vegeta');
    K.faceTo(v, j.pos);
    K.faceTo(j, v.pos);
    v.setState('scripted', { pose: 'v_ffCompress', expression: 'grit', aura: 0.6 });
    j.setState('scripted', { pose: 'jr_idle', expression: 'cold' });
    // the sphere between his hands: the owner's still, close on his face over it
    const hand = () => v.chest().addScaledVector(v.forward, 0.45);
    const ball = () => {
      if (b.frame % 2 === 0) b.vfx.flash(hand(), 0.9 + Math.sin(b.frame * 0.3) * 0.15, 0xfff06a, 0.1, SL.Toon.tex.glow);
      if (b.frame % 6 === 0) b.vfx.bolt(hand(), 0.6, 0xffe85a);
    };
    m.tickHooks.push(ball);
    m.shot((t, o) => {
      const hd = v.headPos();
      o.pos.copy(hd).addScaledVector(v.forward, 1.6).add(new V3(0.5, -0.1, 0));
      o.look.copy(hd.clone().lerp(hand(), 0.5));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: v, face: true });
    m.say('vegeta', 'Everything I have left... ALL OF IT!', 2.6, { style: 'shout' });
    const r = yield* st.cue('charge', 'Everything into it (Charge)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    K.unhook(m, ball);
    v.setState('scripted', { pose: 'v_finalFlashCharge', expression: 'shout', speed: 20, aura: 1 });
    b.sfx('beamFire', v, { vol: 1.3 });
    // it hits him square — and he takes it on his folded arms (side-on: both of them and the beam between)
    const a = hand(), e = j.chest();
    m.shot((t, o) => {
      const mid = a.clone().lerp(e, 0.5);
      const side = new V3(e.z - a.z, 0, a.x - e.x).normalize();
      o.pos.copy(mid).addScaledVector(side, 9).add(new V3(0, 2, 0));
      o.look.copy(mid);
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const beam = () => {
      if (b.frame % 2 === 0) {
        b.vfx.slash(a, e, 0xffe85a, 0.14, 0.9);
        b.vfx.flash(e, 2, 0xfff6c0, 0.1, SL.Toon.tex.glow);
      }
    };
    m.tickHooks.push(beam);
    j.setState('scripted', { pose: 'jr_guard', expression: 'cold', speed: 12 });
    yield* st.wait(1.6);
    K.unhook(m, beam);
    b.vfx.explosion(e, 2.4, 0xfff0a0, { smoke: true });
    b.sfx('explosionBig', j, { vol: 1 });
    yield* st.wait(1);
    // the smoke clears: not a mark on him
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    j.setState('scripted', { pose: 'jr_impactW', expression: 'cold', speed: 10 });
    TK().mood(m, 'shock', ['krillin', 'tien', 'adult_gohan', 'piccolo', 'android_18']);
    m.say('jiren', 'It is over.', 1.8);
    yield* st.wait(1.4);
    // the Power Impact: hurled back across the stone, he comes down beside Goku
    j.setState('scripted', { pose: 'jr_impact', expression: 'cold', speed: 30 });
    b.vfx.explosion(v.chest(), 2.4, 0xff6a4a, { smoke: true });
    b.sfx('explosionBig', v, { vol: 1.2 });
    b.cameraTraumaAt(v.chest(), 0.9);
    const from = v.pos.clone(), to = K.ground(b, new V3(SPOT.down[0], 0, SPOT.down[1]));
    // wide and side-on to the throw, Goku kneeling at the far end of it
    m.shot((t, o) => {
      const mid = from.clone().lerp(to, 0.55);
      const d = to.clone().sub(from).setY(0).normalize();
      o.pos.copy(mid).add(new V3(-d.z, 0, d.x).multiplyScalar(13)).add(new V3(0, 3.2, 0));
      o.look.copy(mid).add(new V3(0, 0.8, 0));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    v.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 14 });
    const t0 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 900);
      const q = from.clone().lerp(to, k);
      q.y = U.lerp(from.y, to.y, k) + Math.sin(k * Math.PI) * 2.2;
      v.setPosition(q);
      v.vel.set(0, 0, 0);
      return k >= 1 || st.skip.on;
    };
    K.place(v, to, v.yaw);
    v.setState('scripted', { pose: 'knockdownFace', expression: 'hurt', speed: 10 });
    b.vfx.dust(to.clone(), 2, 12);
    b.sfx('groundImpact', v, { vol: 1 });
    b.cameraTraumaAt(to, 0.5);
    yield* st.wait(1.2);
    b.skipRequested = false;
  } };

  /**
   * THE SPEECH (Tournament of power ui.docx §6). Low and close; held on his face; Goku listening; the light that goes
   * from him to Goku is small and personal (hold Charge: give it), never an attack. Then the last stand and the void.
   */
  P.entrust = { id: 'entrust', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, j = S.jiren, g = S.goku, A = b.stage.arena;
    stage(m);
    const st = ST(m);
    v.controller = K.scripted();
    j.controller = K.scripted();
    const down = K.ground(b, new V3(SPOT.down[0], 0, SPOT.down[1]));
    const gAt = K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1]));
    const jFar = K.ground(b, new V3(SPOT.lastJ[0], 0, SPOT.lastJ[1]));
    K.place(v, down, 0);
    K.place(g, gAt, 0);
    K.place(j, jFar, 0);
    K.faceTo(v, j.pos);
    K.faceTo(g, v.pos);
    K.faceTo(j, v.pos);
    v.setState('scripted', { pose: 'knockdownFace', expression: 'hurt' });
    K.watcher(g, 'exhausted', 'exhausted');
    j.setState('scripted', { pose: 'jr_idle', expression: 'cold' });
    m.music(null, 0);
    const right = (f) => new V3(f.forward.z, 0, -f.forward.x);
    // close on a face (side: + his right), held
    const face = (f, dist, side, fov, drift) => m.shot((t, o, el) => {
      const hd = f.headPos();
      // a little under the eyes, looking up into the face (an exhausted head hangs forward)
      o.pos.copy(hd).addScaledVector(f.forward, dist + (drift ? -el * drift : 0)).addScaledVector(right(f), side).add(new V3(0, -0.14, 0));
      o.look.copy(hd).add(new V3(0, -0.05, 0));
      o.fov = fov;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: f, face: true });
    // the two of them from the side, low: far enough back that both stay well inside the frame, easing in a little
    const two = () => m.shot((t, o, el) => {
      const mid = v.chest().lerp(g.chest(), 0.5);
      const d = g.pos.clone().sub(v.pos).setY(0);
      const sep = d.length();
      d.normalize();
      o.pos.copy(mid).add(new V3(-d.z, 0, d.x).multiplyScalar(sep * 0.78 + 1.8 - Math.min(el, 4) * 0.12)).add(new V3(0, -0.15, 0));
      o.look.copy(mid).add(new V3(0, 0.05, 0));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });

    // he pushes himself up off the stone: start low and close
    m.shot((t, o) => {
      const c = v.chest();
      o.pos.copy(v.pos).addScaledVector(v.forward, 2.2).addScaledVector(right(v), 0.9).add(new V3(0, 0.25, 0));
      o.look.copy(c).add(new V3(0, -0.1, 0));
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: v });
    yield* st.wait(1.4);
    v.setState('scripted', { pose: 'v_bentGasp', expression: 'grit', speed: 3 });
    b.sfx('heartbeat', v, { vol: 0.7, pitch: 0.9 });
    yield* st.wait(1.6);
    two();
    m.say('vegeta', 'Kakarot.', 1.6);
    yield* st.wait(1.8);
    face(g, 1.25, 0.35, 40);
    K.watcher(g, 'exhausted', 'serious');
    yield* st.wait(1.2);
    // pride first: he will not look at him
    face(v, 1.3, -0.4, 40, 0.05);
    m.say('vegeta', 'Don\'t give me that look. I don\'t want your pity.', 2.8);
    yield* st.wait(2.9);
    m.say('vegeta', 'I made Cabba a promise. Universe 7 wins, and his universe comes back. A Saiyan prince keeps his word.', 4.4);
    yield* st.wait(4.5);
    // the frustration: the fist, held on his face — no montage
    v.setState('scripted', { pose: 'v_swear', expression: 'angry', speed: 4 });
    face(v, 1.05, 0.3, 36, 0.04);
    m.say('vegeta', 'I wanted to beat him myself. With my own strength. My own road...', 3.4);
    yield* st.wait(3.5);
    m.say('vegeta', '...but my body won\'t answer me anymore.', 2.6);
    yield* st.wait(2.8);
    // Goku listening
    face(g, 1.2, -0.3, 40);
    yield* st.wait(1.6);
    // he turns to him at last, and holds out his hand
    K.faceTo(v, g.pos);
    v.setState('scripted', { pose: 'v_offerHand', expression: 'calm', speed: 5, aura: 0.3 });
    two();
    m.say('vegeta', 'So you\'ll do it. Take it — every last scrap I have.', 3.2);
    yield* st.wait(1.2);
    // the light: restrained, personal — a thin stream from his hand to Goku (hold Charge: give it)
    const give = () => {
      if (b.frame % 3 !== 0) return;
      const k = (b.frame % 45) / 45;
      const from = v.chest().addScaledVector(v.forward, 0.4);
      b.vfx.trail(from.lerp(g.chest(), k), 0x6ad0ff, 0.26, 0.4);
    };
    m.tickHooks.push(give);
    const r = yield* st.cue('charge', 'Give Kakarot what you have left (hold Charge)', { auto: 3, slow: 0.5 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    b.vfx.flash(g.chest(), 1.4, 0x6ad0ff, 0.4, SL.Toon.tex.glow);
    b.sfx('kiUp', g, { vol: 0.7, pitch: 1.2 });
    // Goku: his expression changes as he understands
    face(g, 1.1, 0.25, 38);
    K.watcher(g, 'exhausted', 'shock');
    m.say('goku', 'Vegeta... you...', 2);
    yield* st.wait(2.1);
    face(v, 1.15, -0.25, 38);
    m.say('vegeta', 'Surpass him, Kakarot. Go past your limits — and when this is over, I\'ll surpass you. That\'s how it\'s always been.', 4.6);
    yield* st.wait(4.7);
    K.unhook(m, give);
    v.setState('scripted', { pose: 'v_bentGasp', expression: 'grit', speed: 4, aura: 0 });
    m.say('vegeta', 'And if you lose to him... I\'ll never forgive you.', 3);
    yield* st.wait(3.1);
    face(g, 1.2, 0.3, 40);
    K.watcher(g, 'g_resolve', 'determined');
    m.say('goku', '...Yeah. I won\'t lose.', 2.2);
    yield* st.wait(2.4);

    // Jiren has been coming the whole time
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    j.setState('scripted', { pose: 'bb_walk', expression: 'cold', speed: 4 });
    const jTo = K.ground(b, new V3(SPOT.jirenNear[0], 0, SPOT.jirenNear[1]));
    const jFrom = j.pos.clone();
    j.yaw = j.prevYaw = Math.atan2(jTo.x - jFrom.x, jTo.z - jFrom.z);
    const tw = performance.now();
    m.say('jiren', 'Are you finished?', 1.8);
    yield () => {
      const k = Math.min(1, (performance.now() - tw) / 2000);
      K.place(j, jFrom.clone().lerp(jTo, k), j.yaw);
      return k >= 1 || st.skip.on;
    };
    K.place(j, jTo, j.yaw);
    K.faceTo(j, v.pos);
    j.setState('scripted', { pose: 'jr_idle', expression: 'cold', speed: 6 });
    // he gets up between Jiren and Goku
    const up = K.ground(b, new V3(SPOT.stand[0], 0, SPOT.stand[1]));
    K.place(v, up, v.yaw);
    K.faceTo(v, j.pos);
    v.setState('scripted', { pose: 'v_tfPride', expression: 'grit', speed: 4, aura: 0.2 });
    m.shot((t, o) => {
      o.pos.copy(v.pos).addScaledVector(v.forward, -3.2).addScaledVector(right(v), 1.1).add(new V3(0, 1.5, 0));
      o.look.copy(j.chest());
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('vegeta', 'Finished? I\'m still standing, aren\'t I?', 2.6, { style: 'shout' });
    yield* st.wait(2.7);
    // the last charge — and the Power Impact that ends it; he goes out over the side, away from Goku
    v.setState('scripted', { pose: 'dash', expression: 'shout', speed: 16, aura: 0.4 });
    b.sfx('dash', v, { vol: 1 });
    const vFrom = v.pos.clone(), vTo = vFrom.clone().lerp(j.pos, 0.72);
    const tc = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - tc) / 320);
      K.place(v, vFrom.clone().lerp(vTo, k), v.yaw);
      return k >= 1 || st.skip.on;
    };
    j.setState('scripted', { pose: 'jr_impact', expression: 'cold', speed: 30 });
    b.vfx.explosion(v.chest(), 2.2, 0xff6a4a, { smoke: true });
    b.sfx('explosionBig', v, { vol: 1.2 });
    b.cameraTraumaAt(v.chest(), 0.9);
    const dir = new V3(-1, 0, 0.3);
    m.shot((t, o) => {
      o.pos.copy(j.pos).addScaledVector(dir, -4).add(new V3(0.8, 2.2, 0));
      o.look.copy(v.chest());
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    TK().mood(m, 'shock');
    yield* TK().fall(m, v, dir, { height: 2.4, ms: 1800, depth: 14 });
    // out in the void, holding his side (the owner's still): he turns his face back up to the platform; the camera hangs
    // between him and the edge looking out and down, so what is behind him is the open void, not the rock
    v.grounded = false;
    v.vel.set(0, 0, 0);
    K.faceTo(v, new V3(0, v.pos.y, 0));
    v.setState('scripted', { pose: 'v_voidFloat', expression: 'hurt', speed: 5 });
    const home = new V3(-v.pos.x, 0, -v.pos.z).normalize();
    m.shot((t, o, el) => {
      const c = v.chest();
      o.pos.copy(c).addScaledVector(home, 2.1).addScaledVector(new V3(-home.z, 0, home.x), 0.7).add(new V3(0, 1.05 - el * 0.04, 0));
      o.look.copy(c).add(new V3(0, 0.1, 0));
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: v, face: true });
    const drift = () => {
      v.pos.y -= 0.01;
      v.setPosition(v.pos);
    };
    m.tickHooks.push(drift);
    yield* st.wait(1.4);
    m.say('vegeta', 'Kakarot... I leave the rest to you.', 3.4);
    yield* st.wait(3.6);
    K.unhook(m, drift);
    // the ruling, while he drifts down out of sight
    SL.Cinema.shotOn(m, S, { subject: 'grandpriest', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* TK().eliminate(m, v, { id: 'vegeta' });
    TK().mood(m, 'concern');
    TK().react(m, 'beerus', 'Vegeta...', 1.6);
    yield* st.wait(1.6);
    // Goku gets up
    face(g, 2.4, 0.5, 44);
    K.watcher(g, 'g_resolve', 'determined');
    yield* st.wait(1.6);
    // back to Jiren: the threat is still there
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('jiren', 'One more.', 1.8);
    yield* st.wait(1.8);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'I LEAVE THE REST TO YOU', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.topVegeta = { TU };
  SL.data.missions.top_vegeta = {
    id: 'top_vegeta', canon: true, chapter: CHAPTER, title: 'I Leave the Rest to You', character: 'vegeta', stage: 'top_arena',
    subtitle: 'The Tournament of Power · Vegeta vs Jiren', parTime: 480, qteLabel: 'The last sphere',
    blurb: 'Toppo is gone and Vegeta has nothing left. Jiren tells him to step aside. Vegeta has never stepped aside in his life.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'none', emblem: 'none' }, adult_gohan: { outfit: 'ag_ultimate' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { vegeta: SL.data.characters.vegeta.forms.filter((x) => x.id !== 'base').map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Vegeta entrusts Universe 7 to Goku'],
    setup,
    phases: [P.open, P.stand, P.last, P.entrust],
  };
})();
