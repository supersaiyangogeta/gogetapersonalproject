/*
 * CHAPTER 18 · UNIVERSE 6 — Round 3: "The Needle" (Piccolo vs Frost).
 * Owner's combat storyboard row 3: CHARGE → POSITION → POISON → EXPOSED (Jaco points at the needle).
 *
 *   OPEN *     (scene u6r3_open)  Piccolo steps up for Goku; Frost's smile
 *   FIGHT *    (play)             Piccolo vs final-form Frost under tournament rules (a real defeat retries). Piccolo's
 *                                 plan, said out loud: wear him down and make room for the Special Beam Cannon.
 *                                 Ends on Frost's story floor
 *   CHARGE     (hold Charge)      two fingers to the forehead (the storyboard's CHARGE): hold Charge to build the
 *                                 cannon while Frost keeps his distance and watches; letting go drains it
 *   POSITION   (cue + staged)     side-on, the spiral beam (the storyboard's POSITION): fired on the player's Ultimate;
 *                                 Frost slips aside at the last instant — it grazes his shoulder
 *   POISON     (staged)           Frost closes in, the forearm against Piccolo's arm, a purple glint; Piccolo stiffens,
 *                                 Frost's palm puts him over the edge — the authored loss
 *   EXPOSED    (scene u6r3_exposed) Jaco has seen it: the needle in Frost's wrist (a magnified close-up); the referee
 *                                 disqualifies Frost; Piccolo withdraws, poisoned; Whis: Goku's loss is void, he may
 *                                 fight again; Champa demands Frost back — Vegeta: "Let him. I'll beat him myself."
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  // TUNING: story floor and damage, how long the cannon takes to charge
  const TU = { floor: 0.55, frostDealt: 0.5, chargeSeconds: 3.2 };

  SL.data.scenes.u6r3_open = {
    id: 'u6r3_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.piccolo, UK().at(b, UK().RING.a), Math.PI);
          K.place(S.frost, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.piccolo, S.frost.pos);
          K.faceTo(S.frost, S.piccolo.pos);
        },
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'cold' }, { who: 'frost', pose: 'fr_polite', face: 'smirk' }],
        cam: { subject: 'piccolo', with: 'frost', focus: 'full', angle: 'side' },
        title: { chapter: CHAPTER, title: 'THE NEEDLE', subtitle: 'Round 3 · Piccolo vs Frost', duration: 3.6 },
        say: { who: 'piccolo', line: 'Goku didn\'t just get tired. I\'m going to find out what you did.', duration: 3.2 },
        hold: 3.3,
      },
      {
        cam: { subject: 'frost', focus: 'upper', angle: 'three' },
        say: { who: 'frost', line: 'Did? I simply fought well. Shall we?', duration: 2.4 },
        hold: 2.5,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.piccolo, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.frost, UK().at(b, UK().RING.c), 0);
    },
  };

  SL.data.scenes.u6r3_exposed = {
    id: 'u6r3_exposed',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: null, level: 0 },
    auraCap: 0,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          // Jaco hurries to the ring's edge, pointing at Frost's wrist
          K.place(S.jaco, K.ground(b, S.frost.pos.clone().add(new V3(-2.4, 0, 1))), 0);
          K.faceTo(S.jaco, S.frost.pos);
          K.faceTo(S.frost, S.jaco.pos);
        },
        pose: [{ who: 'jaco', pose: 'jc_point', face: 'shock' }, { who: 'frost', pose: 'fr_polite', face: 'shock' }],
        cam: { subject: 'jaco', with: 'frost', focus: 'full', angle: 'three' },
        say: { who: 'jaco', line: 'Hold it! Galactic Patrol! That man has a needle in his wrist!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      {
        // the magnified inset: the needle in Frost's wrist
        call: (ctx) => {
          const f = ctx.cast.frost;
          ctx.m.shot((t, o) => {
            const w = f.handPos ? f.handPos('R') : f.chest();
            o.pos.copy(w).add(new V3(0.45, 0.1, 0.35));
            o.look.copy(w);
            o.fov = 24;
          }, 2.4, { cut: true, blendIn: 0 });
          const w = f.handPos ? f.handPos('R') : f.chest();
          ctx.b.vfx.slash(w, w.clone().addScaledVector(f.forward, 0.22), 0xb84aff, 2.2, 0.012);
          ctx.b.vfx.flash(w, 0.3, 0xb84aff, 2, SL.Toon.tex.glow);
        },
        hold: 2.4,
      },
      {
        cam: { subject: 'frost', focus: 'closeup', angle: 'three' },
        pose: { who: 'frost', pose: 'fr_polite', face: 'angry' },
        say: { who: 'frost', line: '...Tch.', duration: 1.4 },
        hold: 1.5,
      },
      {
        cam: { subject: 'vados', focus: 'upper', angle: 'three' },
        say: { who: 'vados', line: 'A hidden poison needle. Frost is disqualified.', duration: 2.8 },
        hold: 2.9,
      },
      {
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'Which means Goku\'s loss was no loss at all. He may fight again later. Piccolo, I\'m afraid, cannot continue.', duration: 4.2 },
        hold: 4.3,
      },
      {
        cam: { subject: 'champa', focus: 'medium', angle: 'three' },
        pose: { who: 'champa', pose: 'ch6_shout', face: 'angry' },
        say: { who: 'champa', line: 'Disqualified?! Then we\'re a fighter short — I won\'t allow it!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        pose: { who: 'vegeta', pose: 'armsCrossed', face: 'cold' },
        say: { who: 'vegeta', line: 'Let him stay. I want to beat that cheat myself — with every eye on him.', duration: 3.4 },
        hold: 3.5,
      },
    ],
    end(ctx) {
      ctx.m.flags.exposed = true;
    },
  };

  function stage(m, place) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    UK().ring(m, { place });
    K.toForm(S.frost, 'final');
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, true);
    yield* SL.Cinema.play(m, 'u6r3_open');
  } };

  P.fight = { id: 'fight', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, p = S.piccolo, f = S.frost;
    stage(m, true);
    p.hp = p.hpMax;
    p.ki = Math.max(p.ki, p.kiMax * 0.6);
    f.hp = f.hpMax;
    const sf = m.storyFight({ floors: [{ f, at: TU.floor }], dealt: [{ f, mul: TU.frostDealt }], ease: { foe: f, hero: p, below: 0.45, min: 0.5 } });
    m.title(CHAPTER, 'ROUND 3', 'Piccolo vs Frost · final form', 2.4);
    m.objective('fight', 'Wear Frost down — make room for the Special Beam Cannon', { icon: 'fist' });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    m.say('piccolo', 'Keep him busy... then one shot, and it\'s over.', 2.6);
    const r = yield* UK().bout(m, { ringOut: [p], during: () => (sf.floored(f) ? { pause: true, how: 'story' } : null) });
    sf.off();
    if (m.state !== 'running' || !r.pause) return;
    m.complete('fight');
    m.complete('ring');
  } };

  /** The storyboard's CHARGE: two fingers to the forehead, held; Frost keeps his distance and watches. */
  P.charge = { id: 'charge', run: function* (m) {
    const b = m.battle, S = b.story, p = S.piccolo, f = S.frost;
    stage(m, false);
    UK().control(m);
    f.controller = K.scripted();
    K.place(p, UK().at(b, [0, 5]), 0);
    K.place(f, UK().at(b, [0, -7]), 0);
    K.faceTo(p, f.pos);
    K.faceTo(f, p.pos);
    K.watcher(f, 'fr_polite', 'smirk');
    SL.Cinema.shotOn(m, S, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.objective('charge', 'Special Beam Cannon: hold Charge', { icon: 'beam' });
    const lim = Object.assign({}, SL.Mission.ALL_OFF);
    delete lim.charge;
    m.limits(lim);
    b.inputLocked = false;
    b.aiLocked = true;
    m.prompt('u6Cannon', 'charge', 'Hold Charge — Special Beam Cannon', { required: true, until: () => false });
    let power = 0;
    // the body holds the pose; the hold is read from the player's own Charge button
    p.controller = K.scripted();
    p.setState('scripted', { pose: 'twoFingers', expression: 'grit' });
    const hook = () => {
      const holding = !!(SL.Input.held('charge') || (p.intent && p.intent.charge));
      power = U.clamp01(power + (holding ? 1 / (TU.chargeSeconds * 60) : -0.4 / 60));
      const tip = p.headPos ? p.headPos().addScaledVector(p.forward, 0.18).add(new V3(0, 0.08, 0)) : p.chest();
      if (b.frame % 3 === 0) b.vfx.flash(tip, 0.3 + power * 0.7, 0xfff27a, 0.12, SL.Toon.tex.glow);
      if (holding && b.frame % 6 === 0) b.vfx.streamInward(tip, 1.4, 0xfff27a, 2, 0.1, 0.3);
      b.emit('struggle', { active: true, progress: 1 - power, rate: 0, label: 'SPECIAL BEAM CANNON', action: 'charge' });
    };
    m.tickHooks.push(hook);
    // gameplay, not film: a skip never fills it
    b.skipRequested = false;
    yield () => power >= 1 || m.state !== 'running';
    K.unhook(m, hook);
    b.emit('struggle', { active: false });
    m.prompts.delete('u6Cannon');
    b.emit('prompt', { id: 'u6Cannon', show: false });
    m.limits(null);
    m.lock(true);
    m.complete('charge');
  } };

  /** POSITION and POISON: the spiral beam, the dodge, the needle, the edge. */
  P.poison = { id: 'poison', run: function* (m) {
    const b = m.battle, S = b.story, p = S.piccolo, f = S.frost;
    stage(m, false);
    const st = UK().staged(m);
    p.controller = K.scripted();
    f.controller = K.scripted();
    K.place(p, UK().at(b, [0, 5]), 0);
    K.place(f, UK().at(b, [0, -7]), 0);
    K.faceTo(p, f.pos);
    K.faceTo(f, p.pos);
    p.setState('scripted', { pose: 'twoFingers', expression: 'grit' });
    const r = yield* st.cue('ult', 'Fire the Special Beam Cannon (Ultimate)', { auto: 4, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    // side-on: the yellow beam with its spiral, across the ring
    p.setState('scripted', { pose: 'blastR', expression: 'shout', speed: 26 });
    const from = p.handPos ? p.handPos('R') : p.chest();
    const dir = f.chest().sub(from).normalize();
    const end = from.clone().addScaledVector(dir, 26);
    m.shot((t, o) => {
      const mid = from.clone().lerp(f.chest(), 0.5);
      o.pos.copy(mid).add(new V3(10, 1.6, 0));
      o.look.copy(mid);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('beamFire', p, { pitch: 1.4 });
    b.vfx.slash(from, end, 0xfff27a, 0.6, 0.12);
    for (let i = 0; i < 8; i++) b.after(i * 2, () => b.vfx.ring(from.clone().lerp(end, i / 8), 0.55, 0xffe24a, 0.4, dir));
    // Frost slips aside at the last instant: it grazes his shoulder
    K.place(f, K.ground(b, f.pos.clone().add(new V3(1.6, 0, 0))), 0);
    f.setState('scripted', { pose: 'hitSideR', expression: 'hurt', speed: 20 });
    b.vfx.impact(f.chest().add(new V3(0.3, 0.3, 0)), 2, 0xfff27a);
    yield* st.wait(1);
    m.say('frost', 'Close. Very close.', 1.8);
    yield* st.wait(1.6);
    // he closes in: the forearm against Piccolo's arm, the purple glint
    const near = K.ground(b, p.pos.clone().addScaledVector(dir, 1.1));
    K.place(f, near, 0);
    K.faceTo(f, p.pos);
    b.vfx.afterimage(f.pos, f.height, 0xb8d0ff);
    f.setState('scripted', { pose: 'fz_jab', expression: 'cold', speed: 24 });
    p.setState('scripted', { pose: 'guard', expression: 'serious' });
    SL.Cinema.shotOn(m, S, { subject: 'piccolo', with: 'frost', focus: 'upper', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    const w = f.handPos ? f.handPos('R') : f.chest();
    b.vfx.flash(w, 0.35, 0xb84aff, 0.5, SL.Toon.tex.glow);
    b.sfx('punchLight', p);
    b.slowmo(0.3, 0.7);
    yield* st.wait(1.1);
    p.setState('scripted', { pose: 'stagger', expression: 'hurt', speed: 3 });
    m.say('piccolo', 'My arm... it\'s gone numb... just like Goku...!', 2.6);
    yield* st.wait(2.4);
    f.setState('scripted', { pose: 'fz_jab', expression: 'smirk', speed: 30 });
    b.vfx.impact(p.chest(), 3, 0xb8d0ff);
    b.sfx('punchHeavy', p, { pitch: 0.8 });
    yield* UK().ringOutTo(m, p, new V3(0, 0, 1), { height: 2.2 });
    f.setState('scripted', { pose: 'fr_polite', expression: 'calm' });
    b.emit('matchEnd', { winner: f, loser: p, how: 'ringout' });
    yield* SL.Tournament.announce(m, 'ringout', { winner: f, loser: p }, { seconds: 3 });
    m.endShot();
    b.skipRequested = false;
  } };

  P.exposed = { id: 'exposed', run: function* (m) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.clearObjectives();
    UK().bench(m);
    if (!S.piccolo.ringedOut) {
      K.place(S.piccolo, UK().at(b, [0, 19]), 0);
      S.piccolo.ringedOut = true;
    }
    K.watcher(S.piccolo, 'knockdown', 'hurt');
    S.frost.setHidden(false);
    K.toForm(S.frost, 'final');
    yield* SL.Cinema.play(m, 'u6r3_exposed');
    yield* UK().close(m, CHAPTER, 'ROUND 3 · FROST DISQUALIFIED');
  } };

  SL.data.u6FrostPiccolo = { TU };
  SL.data.missions.u6_frost_piccolo = {
    id: 'u6_frost_piccolo', canon: true, chapter: CHAPTER, title: 'The Needle', character: 'piccolo', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 3 · Piccolo vs Frost', parTime: 420, qteLabel: 'The cannon',
    blurb: 'Goku did not just get tired. Piccolo means to find out why — and he has a beam that can pierce anything.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: the needle exposed'],
    setup: (b) => SL.data.u6Kit.setup(b, 'piccolo', 'frost'),
    phases: [P.open, P.fight, P.charge, P.poison, P.exposed],
  };
})();
