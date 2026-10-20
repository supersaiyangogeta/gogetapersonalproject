/*
 * CHAPTER 19 · FUTURE TRUNKS — "Hakai" (canon; played as Beerus — a short scene with two player beats). Roadmap Three,
 * the owner's Goku Black arc research (`Downloads/Goku black arc research.pdf`): CS-HAK-01 and HAK-S01, Beerus' Hakai on
 * the present-day Zamasu. The research: "While the nightmare in the future is ongoing, Goku, Whis, and Beerus
 * investigate the present-day apprentice Zamasu in Universe 10. They catch Zamasu in the act of raising his energy
 * blade to murder his sleeping mentor, Supreme Kai Gowasu." So it sits between "Rosé" (the first trip) and "Zero
 * Mortals" (the second, where they learn that erasing him here did not save the future). A research draft, not checked
 * against the footage. Lines are paraphrased and written for this project.
 *
 * COMPROMISES (documented, not hidden): Gowasu is not in the cast — he is never on screen; the opening is seen from where
 * he lies (the lens looks up at the blade raised over it). Universe 10's Sacred World is not a stage — Universe 7's
 * (`kai_world`) stands in for it. Where the PDF disagrees with itself: the beat with an ID wins — silence and no scream
 * (the other account has him screaming); CS-HAK-01 has Beerus both "grabbing Zamasu's wrist" and standing "with his left
 * hand behind his back" (HAK-S01 has him holding the wrist as the sphere erases him): here he catches the wrist, lets it
 * go, puts the left hand behind his back, and lifts the right palm — both stances, in that order.
 *
 *   NIGHT *   (staged)  the Sacred World; Zamasu alone; from where his master lies, the blade of light rising over him
 *   CAUGHT    (a cue)   Beerus is suddenly there (Light): the wrist caught in a vise; Zamasu's face; Goku and Whis behind
 *   HAKAI     (a cue)   the wrist let go, the left hand behind the back, the right palm at his chest; the music gone;
 *                       Ultimate: "Hakai." — the violet sphere at the fingertips; HAK-S01: a locked-off profile, close;
 *                       he does not explode: violet light over him and he comes apart into glowing dust from the feet up
 *   AFTER     (staged)  silence, then Whis and Goku: here he is gone — the future is another matter
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const PZ = SL.data.poses;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  const VIOLET = 0xb060ff;
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });

  /* ---------------------------------------------------------------- poses (hands are [left, right]) */

  // the blade of light raised high in the right hand, the head bowed to what lies below it
  PZ.zm_bladeUp = PZ.zm_bladeUp || ((t) => ({
    hands: ['fist', 'open'],
    root: { y: Math.sin(t * 1.2) * 0.003 }, spine: [-6, 0, 0], chest: [-8, 0, 0], neck: [10, 0, 0], head: [22, 0, 0],
    shoulderR: [-168, 0, -14], elbowR: [-18, 0, 0], handR: [0, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-24, 0, 0],
    thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [2, 0, -8], kneeR: [6, 0, 0],
  }));
  // caught: the raised arm stopped, the body twisted round toward whoever holds it, the face open
  PZ.zm_caught = PZ.zm_caught || {
    hands: ['open', 'open'],
    root: { y: -0.02, ry: 14 }, spine: [-4, 10, 0], chest: [-6, 12, 0], neck: [0, 0, 0], head: [-6, 22, 0],
    shoulderR: [-160, 0, -24], elbowR: [-20, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0],
    thighL: [-8, 0, 10], kneeL: [12, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
  };
  // dread: drawn back from the palm, hands half up, the head pulled back
  PZ.zm_dread = PZ.zm_dread || ((t) => {
    const s = Math.sin(t * 40) * 1.2;
    return {
      hands: ['open', 'open'],
      root: { y: -0.04, rx: -8 }, spine: [-10, 0, 0], chest: [-12 + s, 0, 0], neck: [-6, 0, 0], head: [-12, 0, 0],
      shoulderL: [-50, 0, 34], elbowL: [-90, 0, 0], shoulderR: [-50, 0, -34], elbowR: [-90, 0, 0],
      thighL: [-16, 0, 10], kneeL: [26, 0, 0], thighR: [10, 0, -10], kneeR: [14, 0, 0],
    };
  });
  // Beerus' left hand up round a raised wrist (the right stays low)
  PZ.bs_wristGrip = PZ.bs_wristGrip || {
    hands: ['fist', 'open'],
    root: { y: 0 }, spine: [-4, -8, 0], chest: [-6, -10, 0], head: [-10, 10, 0],
    shoulderL: [-158, 0, 18], elbowL: [-24, 0, 0], shoulderR: [-6, 0, -10], elbowR: [-20, 0, 0],
    thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
  };

  /* ---------------------------------------------------------------- setup and helpers */

  const SPOT = { zamasu: [0, 4], beerus: [0.9, 4.6], goku: [-4.5, -3], whis: [-6.2, -2.2] };
  const at = (b, k) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]));

  function setup(b) {
    const S = (b.story = {});
    S.beerus = b.spawn({ charId: 'beerus', team: 0, player: true, pos: at(b, 'beerus'), startKi: 100 });
    S.zamasu = b.spawn({ charId: 'zamasu', team: 1, pos: at(b, 'zamasu'), startKi: 40 });
    S.goku = b.spawn({ charId: 'goku', team: 0, pos: at(b, 'goku'), startKi: 40 });
    S.whis = b.spawn({ charId: 'whis', team: 0, pos: at(b, 'whis'), startKi: 40 });
    for (const f of Object.values(S)) {
      f.cannotDie = true;
      if (f !== S.beerus) f.controller = K.scripted();
      f.untargetable = f.intangible = true;
    }
    for (const f of [S.beerus, S.goku, S.whis]) f.setHidden(true);
    return S;
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }
  const fill = (f, k) => f.model && f.model.setPropFill && f.model.setPropFill('zamasuBlade', k);
  const flat = (v) => v.clone().setY(0).normalize();

  const P = {};

  /* ---------------------------------------------------------------- NIGHT — the blade over the sleeping master */
  P.night = { id: 'night', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, z = S.zamasu;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    for (const f of [S.beerus, S.goku, S.whis]) f.setHidden(true);
    z.setHidden(false);
    K.place(z, at(b, 'zamasu'), 0);
    const fw = new V3(0, 0, -1); // toward where his master lies (off screen, at his feet)
    K.faceTo(z, z.pos.clone().add(fw));
    K.pose(z, 'zm_idle', 'calm', 4);
    m.music('zamasu_theme', 1);
    m.title(CHAPTER, 'HAKAI', 'Universe 10 · the present day', 3.4);
    // wide: alone on the Sacred World's grass
    m.shot((t, o) => K.camAt(o, z.pos.clone().add(new V3(7, 2.4, 6)), z.chest(), 50), 999, { cut: true, blendIn: 0, hold: true });
    m.say('zamasu', 'Forgive me, Master Gowasu. Justice will not wait for you to understand it.', 3.4, { style: 'quiet' });
    yield* st.wait(3.4);
    // from where the master lies: the blade of light raised over the lens
    K.pose(z, 'zm_bladeUp', 'cold', 8);
    const ground = K.ground(b, z.pos.clone().addScaledVector(fw, 1.4));
    m.shot((t, o) => K.camAt(o, ground.clone().add(new V3(0.3, 0.25, 0)), z.headPos().add(new V3(0, 0.6, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
    {
      let n = 0;
      yield () => {
        n++;
        fill(z, b.skipRequested ? 1 : Math.min(1, n / 30));
        return n >= 70 || b.skipRequested;
      };
    }
    fill(z, 1);
    m.flags.bladeRaised = true;
  } };

  /* ---------------------------------------------------------------- CAUGHT — the wrist */
  P.caught = { id: 'caught', run: function* (m) {
    const b = m.battle, S = b.story, z = S.zamasu, bs = S.beerus;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    K.pose(z, 'zm_bladeUp', 'cold', 8);
    fill(z, 1);
    // low beside him, the blade high over the lens's edge: the moment before it falls
    m.shot((t, o) => K.camAt(o, z.pos.clone().add(new V3(3.2, 0.6, -1.6)), z.chest().add(new V3(0, 0.9, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    // he is simply there: the player's beat
    yield* st.cue('light', 'Seize his wrist! (Light)', { auto: 2.6, slow: 0.3 });
    bs.setHidden(false);
    K.place(bs, K.ground(b, z.pos.clone().add(new V3(0.75, 0, 0.45))), 0);
    K.faceTo(bs, z.pos);
    if (!b.skipRequested) {
      b.vfx.afterimage(bs.pos, bs.height, 0xd8b0ff);
      b.sfx('vanish', bs, { vol: 0.9 });
    }
    K.pose(bs, 'bs_wristGrip', 'cold', 30);
    K.pose(z, 'zm_caught', 'shock', 20);
    K.faceTo(z, bs.pos);
    if (!b.skipRequested) {
      b.sfx('block', bs, { vol: 0.8, pitch: 0.8 });
      b.cameraTraumaAt(z.chest(), 0.25);
    }
    m.flags.wristCaught = true;
    // close on the two of them: the hand round the wrist, the face turned
    const mid = z.chest().lerp(bs.chest(), 0.5), side = flat(new V3(1, 0, -1));
    m.shot((t, o) => K.camAt(o, mid.clone().addScaledVector(side, 3).add(new V3(0, 0.5, 0)), mid.clone().add(new V3(0, 0.45, 0)), 44), 999, { cut: true, blendIn: 0, hold: true });
    m.say('zamasu', 'L-Lord Beerus...?!', 1.8, { style: 'shout' });
    yield* st.wait(1.8);
    // Goku and Whis behind them
    for (const f of [S.goku, S.whis]) {
      f.setHidden(false);
      K.faceTo(f, z.pos);
    }
    K.place(S.goku, at(b, 'goku'), 0);
    K.place(S.whis, at(b, 'whis'), 0);
    K.faceTo(S.goku, z.pos);
    K.faceTo(S.whis, z.pos);
    K.pose(S.goku, 'idle', 'serious', 6);
    K.pose(S.whis, 'w_idle', 'calm', 6);
    shot(m, { beerus: bs }, { subject: 'beerus', focus: 'upper', angle: 'three' }, 999);
    m.say('beerus', 'So it was you after all. On your own master, no less.', 2.8);
    yield* st.wait(2.8);
  } };

  /* ---------------------------------------------------------------- HAKAI — CS-HAK-01, HAK-S01 */
  P.hakai = { id: 'hakai', run: function* (m) {
    const b = m.battle, S = b.story, z = S.zamasu, bs = S.beerus;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    // the wrist let go; the left hand behind the back, the right palm flat at his chest
    fill(z, 0);
    K.pose(z, 'zm_dread', 'shock', 10);
    K.place(bs, K.ground(b, z.pos.clone().addScaledVector(flat(bs.pos.clone().sub(z.pos)), 1.15)), 0);
    K.faceTo(bs, z.pos);
    K.faceTo(z, bs.pos);
    K.pose(bs, 'bs_hakaiW', 'cold', 8);
    const toZ = flat(z.pos.clone().sub(bs.pos)), side = new V3(toZ.z, 0, -toZ.x);
    // HAK-S01: medium close-up, locked off, in profile — the two of them, the palm between
    const mid = bs.chest().lerp(z.chest(), 0.5);
    m.shot((t, o) => K.camAt(o, mid.clone().addScaledVector(side, 2.6).add(new V3(0, 0.15, 0)), mid.clone().add(new V3(0, 0.2, 0)), 44), 999, { cut: true, blendIn: 0, hold: true });
    m.say('zamasu', 'Wait— a god cannot be judged by—', 1.8, { style: 'shout' });
    yield* st.wait(1.2);
    // the music gone: absolute silence (CS-HAK-01)
    SL.Music.stop(0.2);
    b.stage.setMood(0.35, 0x140820, 0.4);
    K.pose(bs, 'bs_hakai', 'cold', 14);
    m.flags.silence = true;
    yield* st.cue('ult', 'Hakai (Ultimate)', { auto: 3, slow: 0.5 });
    m.say('beerus', 'Hakai.', 1.4, { style: 'quiet' });
    m.flags.hakai = true;
    // the violet sphere flares at his fingertips
    {
      let n = 0;
      yield () => {
        n++;
        if (!b.skipRequested && n % 3 === 0) {
          const tip = bs.handPos('R').addScaledVector(toZ, 0.15);
          b.vfx.flash(tip, 0.4 + n / 30, VIOLET, 0.12, SL.Toon.tex.glow);
          if (n % 6 === 0) b.vfx.bolt(tip.clone().add(new V3(U.rand(-0.2, 0.2), U.rand(-0.2, 0.2), U.rand(-0.2, 0.2))), 0.5, 0xf0e0ff);
        }
        return n >= 24 || b.skipRequested;
      };
    }
    // he does not explode: violet light over him, and he comes apart into glowing dust from the feet up
    const er = K.erase(m, z, { color: VIOLET, seconds: 2.6 });
    S.erasure = er;
    m.flags.erased = true;
    yield () => er.done() || b.skipRequested;
    er.dispose();
    m.flags.gone = z.hidden;
    yield* st.wait(1);
  } };

  /* ---------------------------------------------------------------- AFTER */
  P.after = { id: 'after', run: function* (m) {
    const b = m.battle, S = b.story, z = S.zamasu, bs = S.beerus;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    z.setHidden(true);
    b.stage.clearMood(0.8);
    for (const f of [bs, S.goku, S.whis]) f.setHidden(false);
    K.pose(bs, 'bs_idle', 'calm', 4);
    K.pose(S.goku, 'idle', 'serious', 4);
    K.pose(S.whis, 'w_idle', 'calm', 4);
    m.shot((t, o) => K.camAt(o, bs.pos.clone().add(new V3(-3.5, 1.8, 6)), bs.chest().lerp(S.goku.chest(), 0.4), 50), 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.2);
    shot(m, { whis: S.whis }, { subject: 'whis', focus: 'upper', angle: 'three' }, 999);
    m.say('whis', 'In this timeline, he is gone. Whether the future agrees is another matter.', 3.2);
    yield* st.wait(3.2);
    shot(m, { goku: S.goku }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    m.say('goku', 'Then we\'d better go and see for ourselves.', 2.4);
    yield* st.wait(2.4);
    m.music('last_hope', 2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'HAKAI', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.missions.ft_hakai = {
    id: 'ft_hakai', canon: true, chapter: CHAPTER, title: 'Hakai', character: 'beerus', stage: 'kai_world',
    subtitle: 'Universe 10 · the present day', parTime: 120, qteLabel: 'The wrist, and the word',
    blurb: 'Between the trips to the future, Beerus, Whis and Goku find the present-day Zamasu with a blade raised over his sleeping master.',
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Beerus\' Hakai on the present-day Zamasu'],
    setup,
    phases: [P.night, P.caught, P.hakai, P.after],
  };
})();
