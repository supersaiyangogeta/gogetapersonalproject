/*
 * VEGETA (Saiyan Saga) — aggressive, prideful pressure fighter.
 * Identity: compact precise strikes, relentless close range, counters.
 * Mechanic PRIDE: staying in close combat and landing counters builds power.
 *
 * Version 0.3 pass (towards Goku's showcase quality):
 *   - PRINCE'S COUNTER: after a Perfect Guard his next light blinks behind the
 *     attacker for an elbow, his next heavy is a guard-crushing gut punch.
 *   - Branches: Light x2 -> Heavy = Royal Rush (multi-hit knee barrage into a
 *     spinning backhand); aerial heavy set; his own chase dive and chase kick.
 *   - Galick Gun: three charge tiers with callouts, charge light, purple rings,
 *     a growling charge sound, a Super Saiyan variant.
 *   - Proud, stiff dash with violet afterimages.
 *   - AI: presses in, answers Perfect Guards with counters, goes for finishers,
 *     almost never waits.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    /*
     * MAJIN body language: the prince stood straight, arms crossed, above it all. The man with
     * the mark is hunched forward, arms low and wide, fists open and closing, weight on the balls
     * of his feet — something that wants to be let off a leash. It is the Majin form's idle.
     */
    // MAJIN (rebuilt 2026-09-25): wider and lower than the prince ever stands — the shoulders rolled
    // forward over the chest, the head down and the eyes up, the fists low and out from the body, the
    // breathing heavy. Something on a leash that wants to be let off it.
    v_majinStance: (t) => {
      const b = Math.sin(t * 2.6), c = Math.sin(t * 17) * 0.6;
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.13 + b * 0.012 },
        hips: [0, -12, 0], spine: [14 + b * 1.5, 4, 0], chest: [12 + b * 2, 8, 0], neck: [12, 0, 0], head: [-14, 4, c],
        shoulderL: [-26, 0, 42 + c], elbowL: [-38, 0, 0], handL: [-16, 0, 0], shoulderR: [-22, 0, -44 - c], elbowR: [-42, 0, 0], handR: [-16, 0, 0],
        thighL: [-30, 16, 22], kneeL: [50 + b * 3, 0, 0], footL: [-12, 0, -8],
        thighR: [12, -14, -22], kneeR: [44 + b * 3, 0, 0], footR: [-18, 0, 8],
      };
    },
    // running at you: leaning hard into it, the arms swinging low and heavy, long strides
    v_majinRun: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 10.5 * sp;
      const s2 = Math.sin(ph), c2 = Math.cos(ph);
      return {
        root: { y: -0.06 + Math.abs(c2) * 0.05, rx: 26 },
        spine: [12, s2 * 6, 0], chest: [10, s2 * 10, 0], neck: [4, 0, 0], head: [-30, -s2 * 6, 0],
        shoulderL: [s2 * 46 + 18, 0, 22], elbowL: [-50, 0, 0], shoulderR: [-s2 * 46 + 18, 0, -22], elbowR: [-50, 0, 0],
        thighL: [-s2 * 58 - 16, 0, 6], kneeL: [40 + Math.max(0, s2) * 76, 0, 0], footL: [10, 0, 0],
        thighR: [s2 * 58 - 16, 0, -6], kneeR: [40 + Math.max(0, -s2) * 76, 0, 0], footR: [10, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // hanging in the air hunched, the fists low
    v_majinFlyIdle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: b * 0.025 }, spine: [12, 0, 0], chest: [10, 6, 0], neck: [8, 0, 0], head: [-12, 0, 0],
        shoulderL: [-20, 0, 36], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -36], elbowR: [-40, 0, 0],
        thighL: [-40 + b * 3, 0, 10], kneeL: [70, 0, 0], footL: [30, 0, 0], thighR: [-16 - b * 3, 0, -10], kneeR: [52, 0, 0], footR: [36, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // flying at you head first, both fists out in front
    v_majinFly: (t) => {
      const b = Math.sin(t * 6);
      return {
        root: { rx: 74 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-58, 0, 0],
        shoulderL: [-150, 0, 10], elbowL: [-16, 0, 0], shoulderR: [-150, 0, -10], elbowR: [-16, 0, 0],
        thighL: [6 + b * 3, 0, 6], kneeL: [22, 0, 0], footL: [36, 0, 0], thighR: [10 - b * 3, 0, -6], kneeR: [30, 0, 0], footR: [36, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // he does not really guard: he takes it hunched, the forearms up, grinning over them
    v_majinGuard: {
      root: { y: -0.1 }, hips: [0, -10, 0], spine: [14, 0, 0], chest: [12, 6, 0], neck: [8, 0, 0], head: [-6, 0, 0],
      shoulderL: [-70, 0, 26], elbowL: [-120, 0, 0], shoulderR: [-68, 0, -26], elbowR: [-124, 0, 0],
      thighL: [-28, 12, 20], kneeL: [46, 0, 0], thighR: [12, -10, -20], kneeR: [40, 0, 0],
      hands: ['fist', 'fist'],
    },
    // powering up under the mark: not the prince's head thrown back — bent forward, arms out and
    // down, the scream straight ahead
    v_majinCharge: (t) => {
      const sh = Math.sin(t * 40) * 1.8;
      return {
        root: { y: -0.16 + sh * 0.003, rx: 8 }, spine: [12, 0, 0], chest: [8 + sh * 0.4, 0, 0], neck: [4, 0, 0], head: [-18, 0, 0],
        shoulderL: [10, 0, 40 + sh], elbowL: [-30, 0, 0], handL: [-20, 0, 0], shoulderR: [10, 0, -40 - sh], elbowR: [-30, 0, 0], handR: [-20, 0, 0],
        thighL: [-34, 0, 28], kneeL: [60, 0, 0], thighR: [-34, 0, -28], kneeR: [60, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the laugh: head back, arms wide, enjoying it
    v_majinLaugh: (t) => {
      const b = Math.sin(t * 16);
      return {
        root: { y: -0.04 + b * 0.006 }, spine: [-4, 0, 0], chest: [-12 + b * 2, 0, 0], neck: [-8, 0, 0], head: [-24, 0, 0],
        shoulderL: [-20, 0, 58], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -58], elbowR: [-30, 0, 0],
        thighL: [-12, 8, 16], kneeL: [20, 0, 0], thighR: [6, -8, -16], kneeR: [16, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // clutching his head against the spell, bent double
    v_clutchHead: (t) => {
      const s = Math.sin(t * 40) * 2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.16, rx: 14 },
        spine: [24, 0, s], chest: [18, 0, 0], neck: [16, 0, 0], head: [20 + s, 0, 0],
        shoulderL: [-150, 0, 20], elbowL: [-120, 0, 0], shoulderR: [-150, 0, -20], elbowR: [-120, 0, 0],
        thighL: [-34, 0, 16], kneeL: [56, 0, 0], thighR: [-20, 0, -16], kneeR: [40, 0, 0],
      };
    },
    // the moment he stops fighting it: head up, arms open, a smile
    v_acceptMark: {
      hands: ['open', 'open'],
      root: { y: -0.04, rx: -6 }, spine: [-10, 0, 0], chest: [-14, 0, 0], neck: [-8, 0, 0], head: [-18, 0, 0],
      shoulderL: [10, 0, 44], elbowL: [-20, 0, 0], shoulderR: [10, 0, -44], elbowR: [-20, 0, 0],
      thighL: [-10, 0, 14], kneeL: [16, 0, 0], thighR: [-6, 0, -14], kneeR: [12, 0, 0],
    },
    // the chop to the back of Goku's neck
    v_chopW: {
      hands: ['open', 'fist'],
      root: { y: -0.02 }, spine: [-4, 24, 0], chest: [-6, 30, 0], head: [0, -20, 0],
      shoulderR: [-160, 0, -40], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 12], kneeL: [16, 0, 0], thighR: [10, 0, -12], kneeR: [12, 0, 0],
    },
    v_chop: {
      hands: ['open', 'fist'],
      root: { y: -0.06, rx: 10 }, spine: [12, -16, 0], chest: [14, -22, 0], head: [10, 16, 0],
      shoulderR: [-70, 0, 10], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-22, 0, 12], kneeL: [26, 0, 0], thighR: [12, 0, -12], kneeR: [14, 0, 0],
    },
    // holding his son: kneeling, one arm round him
    v_hold: {
      hands: ['open', 'open'],
      root: { y: -0.34, rx: 6 }, spine: [10, 0, 0], chest: [8, 0, 0], neck: [10, 0, 0], head: [16, 0, 0],
      shoulderL: [-70, 0, -30], elbowL: [-80, 0, 0], shoulderR: [-60, 0, 20], elbowR: [-90, 0, 0],
      thighL: [-80, 0, 12], kneeL: [110, 0, 0], thighR: [-10, 0, -12], kneeR: [100, 0, 0],
    },
    // everything he has: arms flung wide, head back, the explosion coming out of him
    v_finalExplosion: (t) => {
      const s = Math.sin(t * 60) * 2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.08, rx: -8 },
        spine: [-16, 0, 0], chest: [-24 + s, 0, 0], neck: [-16, 0, 0], head: [-30, 0, 0],
        shoulderL: [-40, 0, 80 + s], elbowL: [-10, 0, 0], shoulderR: [-40, 0, -80 - s], elbowR: [-10, 0, 0],
        thighL: [-20, 0, 26], kneeL: [34, 0, 0], thighR: [-20, 0, -26], kneeR: [34, 0, 0],
      };
    },
    v_majinHeavyW: {
      hands: ['fist', 'fist'],
      root: { y: -0.1 }, hips: [0, 34, 0], spine: [6, 30, 0], chest: [8, 34, 0], head: [0, -34, 0],
      shoulderR: [-30, 0, -80], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-100, 0, 0],
      thighL: [-30, 10, 16], kneeL: [40, 0, 0], thighR: [20, -8, -12], kneeR: [30, 0, 0],
    },
    v_majinHeavy: {
      hands: ['fist', 'fist'],
      root: { y: -0.14, rx: 12 }, hips: [0, -30, 0], spine: [16, -30, 0], chest: [16, -36, 0], head: [-6, 30, 0],
      shoulderR: [-96, 0, 10], elbowR: [-4, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-100, 0, 0],
      thighL: [-44, 10, 16], kneeL: [50, 0, 0], thighR: [26, -8, -12], kneeR: [20, 0, 0],
    },
    // FINAL IMPACT (the wheel): the knee driven up into the stomach, both hands pulling him onto it by the shoulders
    v_majinKnee: {
      hands: ['open', 'open'],
      root: { y: 0.04, rx: 4 }, spine: [16, 0, 0], chest: [16, 0, 0], neck: [8, 0, 0], head: [-18, 0, 0],
      shoulderL: [-80, 0, -14], elbowL: [-66, 0, 0], shoulderR: [-80, 0, 14], elbowR: [-66, 0, 0],
      thighL: [-112, 0, 4], kneeL: [120, 0, 0], footL: [30, 0, 0], thighR: [8, 0, -6], kneeR: [16, 0, 0],
    },
    // then the hand raised at his chest, the fingers out, the other fist low and back; head down, eyes up, savouring it
    v_finalImpactAim: (t) => {
      const q = Math.sin(t * 30) * 0.8;
      return {
        hands: ['fist', 'open'],
        root: { y: -0.08 }, hips: [0, 16, 0], spine: [10, 12, 0], chest: [8, 20, 0], neck: [6, 0, 0], head: [-16, -26, q],
        shoulderR: [-88 + q, 0, 6], elbowR: [-4, 0, 0], handR: [-78, 0, 0],
        shoulderL: [-24, 0, 30], elbowL: [-70, 0, 0], handL: [-16, 0, 0],
        thighL: [-26, 12, 14], kneeL: [36, 0, 0], thighR: [16, -10, -14], kneeR: [24, 0, 0],
      };
    },
    // the shot: the arm locked straight through the recoil, shoulder behind it, braced low
    v_finalImpact: {
      hands: ['fist', 'open'],
      root: { y: -0.12, rx: 6 }, hips: [0, 24, 0], spine: [8, 18, 0], chest: [2, 30, 0], neck: [4, 0, 0], head: [-12, -38, 0],
      shoulderR: [-92, 0, 2], elbowR: [0, 0, 0], handR: [-84, 0, 0],
      shoulderL: [-14, 0, 34], elbowL: [-80, 0, 0],
      thighL: [-38, 12, 16], kneeL: [48, 0, 0], thighR: [24, -10, -16], kneeR: [16, 0, 0],
    },
    // ATOMIC RUSH (the wheel): the roundhouse that swept Goku through the rocks — the whole hip turned through it
    v_atomicKick: {
      hands: ['fist', 'fist'],
      root: { y: 0.02, rx: -4 }, hips: [0, -50, 0], spine: [-6, -30, 0], chest: [-8, -30, 0], neck: [0, 0, 0], head: [-10, 60, 0],
      shoulderL: [-30, 0, 60], elbowL: [-50, 0, 0], shoulderR: [-40, 0, -50], elbowR: [-70, 0, 0],
      thighL: [-6, 0, 10], kneeL: [14, 0, 0], footL: [10, 0, 0], thighR: [-80, 0, -84], kneeR: [10, 0, 0], footR: [30, 0, 0],
    },
    // ...walking up to the pinned one, one hand open toward him, enjoying it
    v_atomicLoom: (t) => {
      const b = Math.sin(t * 3);
      return {
        hands: ['fist', 'open'],
        root: { y: -0.06 + b * 0.01 }, hips: [0, 10, 0], spine: [12, 6, 0], chest: [10, 10, 0], neck: [10, 0, 0], head: [-20, -10, 0],
        shoulderR: [-70, 0, -10], elbowR: [-30, 0, 0], handR: [-30, 0, 0], shoulderL: [-20, 0, 36], elbowL: [-60, 0, 0],
        thighL: [-24, 10, 14], kneeL: [32, 0, 0], thighR: [14, -8, -14], kneeR: [22, 0, 0],
      };
    },
    // the headbutt: neck and back thrown forward behind the forehead, both fists pulling him onto it
    v_headbutt: {
      hands: ['fist', 'fist'],
      root: { y: -0.04, rx: 18 }, spine: [22, 0, 0], chest: [20, 0, 0], neck: [18, 0, 0], head: [20, 0, 0],
      shoulderL: [-66, 0, -20], elbowL: [-80, 0, 0], shoulderR: [-66, 0, 20], elbowR: [-80, 0, 0],
      thighL: [-40, 6, 12], kneeL: [44, 0, 0], thighR: [20, -6, -12], kneeR: [16, 0, 0],
    },
    // FINAL EXPLOSION (the wheel): gathering everything — crouched, fists clenched at his sides, head down, the
    // whole body trembling harder as it builds
    v_feGather: (t) => {
      const s = Math.sin(t * 50) * 1.6;
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.2 + s * 0.003, rx: 6 }, spine: [16, 0, 0], chest: [12 + s * 0.4, 0, 0], neck: [10, 0, 0], head: [12 + s, 0, 0],
        shoulderL: [6, 0, 30 + s], elbowL: [-36, 0, 0], handL: [-16, 0, 0], shoulderR: [6, 0, -30 - s], elbowR: [-36, 0, 0], handR: [-16, 0, 0],
        thighL: [-46, 0, 26], kneeL: [74, 0, 0], footL: [-22, 0, 0], thighR: [-46, 0, -26], kneeR: [74, 0, 0], footR: [-22, 0, 0],
      };
    },
    // after it: spent, bent over his knees, arms hanging, breathing hard
    v_feSpent: (t) => {
      const b = Math.sin(t * 5);
      return {
        hands: ['open', 'open'],
        root: { y: -0.22 + b * 0.012, rx: 22 }, spine: [24 + b * 2, 0, 0], chest: [14, 0, 0], neck: [8, 0, 0], head: [6, 0, 0],
        shoulderL: [-30, 0, 12], elbowL: [-24, 0, 0], shoulderR: [-30, 0, -12], elbowR: [-24, 0, 0],
        thighL: [-56, 0, 16], kneeL: [70, 0, 0], thighR: [-40, 0, -16], kneeR: [56, 0, 0],
      };
    },
    // PRINCE'S ONSLAUGHT (the wheel): dropped low, the leg swept round through his ankles
    v_poSweep: {
      hands: ['fist', 'open'],
      root: { y: -0.42, rx: 10 }, hips: [0, -40, 0], spine: [18, -20, 0], chest: [10, -20, 0], neck: [0, 0, 0], head: [-16, 40, 0],
      shoulderL: [-10, 0, 40], elbowL: [-20, 0, 0], shoulderR: [30, 0, -60], elbowR: [-10, 0, 0], handR: [-60, 0, 0],
      thighL: [-80, 10, 20], kneeL: [120, 0, 0], footL: [-20, 0, 0], thighR: [-20, 0, -86], kneeR: [6, 0, 0], footR: [20, 0, 0],
    },
    // ...and from behind and above, the knee driven down into his back
    v_poKnee: {
      hands: ['fist', 'fist'],
      root: { y: 0.1, rx: 24 }, spine: [10, 0, 0], chest: [10, 0, 0], neck: [6, 0, 0], head: [10, 0, 0],
      shoulderL: [-110, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-110, 0, -30], elbowR: [-60, 0, 0],
      thighL: [-100, 0, 4], kneeL: [130, 0, 0], footL: [40, 0, 0], thighR: [10, 0, -6], kneeR: [30, 0, 0], footR: [30, 0, 0],
    },
    // DIRTY FIREWORKS (the wheel): two fingers pointed at the sky, the other hand at the hip, a cruel smirk upward
    v_dirtyFireworks: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        hands: ['fist', 'point'],
        root: { y: -0.02 + b * 0.006 }, hips: [0, 10, 0], spine: [-4, 6, 0], chest: [-8, 10, 0], neck: [-10, 0, 0], head: [-34, -8, 0],
        shoulderR: [-172, 0, -6], elbowR: [-6, 0, 0], handR: [-10, 0, 0], shoulderL: [-14, 0, 26], elbowL: [-60, 0, 0],
        thighL: [-12, 8, 12], kneeL: [14, 0, 0], thighR: [8, -6, -12], kneeR: [10, 0, 0],
      };
    },
    // GODLY EXECUTION (the wheel, Super Saiyan God): one arm folded behind his back, the other driving the palm in
    v_godPalm: {
      hands: ['fist', 'open'],
      root: { y: -0.06, rx: 6 }, hips: [0, 20, 0], spine: [6, 14, 0], chest: [4, 22, 0], neck: [0, 0, 0], head: [-6, -30, 0],
      shoulderR: [-88, 0, 6], elbowR: [-6, 0, 0], handR: [-76, 0, 0], shoulderL: [40, 0, 36], elbowL: [-110, 0, 0], handL: [0, 0, 20],
      thighL: [-30, 10, 12], kneeL: [36, 0, 0], thighR: [18, -8, -12], kneeR: [18, 0, 0],
    },
    // ...the second palm higher, at the throat
    v_godPalmHigh: {
      hands: ['fist', 'open'],
      root: { y: -0.02, rx: 2 }, hips: [0, 14, 0], spine: [0, 10, 0], chest: [-4, 18, 0], neck: [-2, 0, 0], head: [-10, -26, 0],
      shoulderR: [-112, 0, 4], elbowR: [-6, 0, 0], handR: [-80, 0, 0], shoulderL: [40, 0, 36], elbowL: [-110, 0, 0], handL: [0, 0, 20],
      thighL: [-24, 10, 12], kneeL: [26, 0, 0], thighR: [16, -8, -12], kneeR: [12, 0, 0],
    },
    // ...and after the flip over his head, the palm flat against his back for the shot
    v_godShot: {
      hands: ['fist', 'open'],
      root: { y: -0.1, rx: 10 }, hips: [0, 24, 0], spine: [10, 16, 0], chest: [6, 26, 0], neck: [2, 0, 0], head: [-10, -34, 0],
      shoulderR: [-90, 0, 2], elbowR: [0, 0, 0], handR: [-86, 0, 0], shoulderL: [40, 0, 36], elbowL: [-110, 0, 0], handL: [0, 0, 20],
      thighL: [-40, 10, 16], kneeL: [50, 0, 0], thighR: [24, -10, -16], kneeR: [14, 0, 0],
    },
    // BLUE GALICK RUSH / FINAL GOD STRIKE (the wheel): the spinning back-kick, heel driven back through him
    v_spinBack: {
      hands: ['fist', 'fist'],
      root: { y: 0.04, rx: -6 }, hips: [0, 160, 0], spine: [-10, 10, 0], chest: [-12, 10, 0], neck: [0, 0, 0], head: [-6, -150, 0],
      shoulderL: [-20, 0, 50], elbowL: [-70, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-70, 0, 0],
      thighL: [-6, 0, 10], kneeL: [16, 0, 0], thighR: [60, 0, -20], kneeR: [10, 0, 0], footR: [40, 0, 0],
    },
    // STORY (playtest round 2): bending to take a hand he has no intention of helping up
    v_offerHand: {
      root: { y: -0.08, rx: 14 }, spine: [16, 0, 0], chest: [10, 6, 0], neck: [8, 0, 0], head: [18, -6, 0],
      shoulderR: [-58, 0, -6], elbowR: [-10, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-24, 0, 0],
      thighL: [-18, 0, 10], kneeL: [24, 0, 0], thighR: [10, 0, -10], kneeR: [16, 0, 0],
      hands: ['open', 'fist'],
    },
    // the throw: arm flung up past his head, body opened up after it
    v_throwUp: {
      root: { y: 0.02, rx: -10 }, spine: [-8, 10, 0], chest: [-14, 18, 0], head: [-26, -8, 0],
      shoulderR: [-172, 0, -8], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 26], elbowL: [-40, 0, 0],
      thighL: [-16, 0, 10], kneeL: [22, 0, 0], thighR: [14, 0, -12], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
    // the palm raised to something above him, chin up, the other fist at the hip
    v_palmUp: {
      root: { y: 0 }, spine: [-6, 12, 0], chest: [-10, 16, 0], head: [-30, -10, 0],
      shoulderR: [-150, 0, -10], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-10, 0, 22], elbowL: [-70, 0, 0],
      thighL: [-12, 0, 12], kneeL: [14, 0, 0], thighR: [10, 0, -12], kneeR: [10, 0, 0],
      hands: ['open', 'fist'],
    },
    // STORY (Planet Zoon): both palms flat against somebody's chest, point blank, not even braced
    v_twoPalms: {
      root: { y: -0.04, rx: 4 }, hips: [0, 0, 0], spine: [4, 0, 0], chest: [4, 0, 0], neck: [-2, 0, 0], head: [-8, 0, 0],
      shoulderL: [-86, 0, -10], elbowL: [-12, 0, 0], handL: [-70, 0, 0], shoulderR: [-86, 0, 10], elbowR: [-12, 0, 0], handR: [-70, 0, 0],
      thighL: [-18, 4, 12], kneeL: [20, 0, 0], thighR: [10, -4, -12], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    // the executioner: arm out straight, palm open at the victim, chin up, the other hand at rest
    v_palmExecute: (t) => {
      const s = Math.sin(t * 1.8);
      return {
        root: { y: -0.02 }, hips: [0, 18, 0], spine: [-2, 14, 0], chest: [-6, 22, 0], neck: [-4, 0, 0], head: [-14 + s, -32, 0],
        shoulderR: [-90, 0, 4], elbowR: [-2, 0, 0], handR: [-72, 0, 0], shoulderL: [-8, 0, 12], elbowL: [-18, 0, 0],
        thighL: [-12, 10, 12], kneeL: [12, 0, 0], thighR: [12, -8, -12], kneeR: [8, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.03 + b * 0.008 },
        hips: [0, -8, 0], spine: [10, 2, 0], chest: [8, 6, 0], head: [-14, 0, 0],
        shoulderL: [-22, 0, 18], elbowL: [-82, 0, 0], handL: [0, 0, 10], shoulderR: [-26, 0, -18], elbowR: [-86, 0, 0], handR: [0, 0, -10],
        thighL: [-14, 8, 11], kneeL: [20 + b * 2, 0, 0], footL: [-6, 0, 0],
        thighR: [8, -6, -11], kneeR: [16 + b * 2, 0, 0], footR: [-8, 0, 0],
      };
    },
    v_jabW: {
      root: { y: -0.04 }, spine: [10, -4, 0], chest: [10, -10, 0], head: [-14, 8, 0],
      shoulderR: [-30, 0, -16], elbowR: [-128, 0, 0], shoulderL: [-40, 0, 12], elbowL: [-110, 0, 0],
      thighL: [-18, 8, 11], kneeL: [26, 0, 0], thighR: [10, -6, -11], kneeR: [20, 0, 0],
    },
    v_jab: {
      root: { y: -0.05, rx: 10 }, spine: [10, 8, 0], chest: [8, 20, 0], head: [-16, -14, 0],
      shoulderR: [-86, 0, 4], elbowR: [-6, 0, 0], shoulderL: [-34, 0, 12], elbowL: [-120, 0, 0],
      thighL: [-26, 8, 11], kneeL: [30, 0, 0], thighR: [14, -6, -11], kneeR: [16, 0, 0],
    },
    v_hookW: {
      root: { y: -0.05 }, spine: [8, 10, 0], chest: [8, 22, 0], head: [-12, -18, 0],
      shoulderL: [-40, 0, 50], elbowL: [-100, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-110, 0, 0],
      thighL: [-18, 8, 11], kneeL: [26, 0, 0], thighR: [10, -6, -11], kneeR: [20, 0, 0],
    },
    v_hook: {
      root: { y: -0.07, rx: 8 }, spine: [8, -12, 0], chest: [10, -32, 0], head: [-14, 26, 0],
      shoulderL: [-86, 0, -22], elbowL: [-78, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-118, 0, 0],
      thighL: [-28, 8, 11], kneeL: [34, 0, 0], thighR: [16, -6, -11], kneeR: [16, 0, 0],
    },
    // the slip: the head and chest pulled back off the line of a punch, the weight on the rear foot, the fists low
    v_leanBack: {
      root: { y: -0.06 }, spine: [-12, 8, 0], chest: [-22, 14, 0], head: [-20, -12, 0],
      shoulderL: [-28, 0, 40], elbowL: [-100, 0, 0], shoulderR: [-24, 0, -36], elbowR: [-105, 0, 0],
      thighL: [-26, 8, 11], kneeL: [20, 0, 0], thighR: [18, -6, -11], kneeR: [32, 0, 0],
    },
    // a blow taken on the right forearm, raised across the face; the left hand drawn back, ready (the air exchange, B02)
    v_forearmBlock: {
      hands: ['open', 'fist'],
      root: { y: -0.05, rx: -4 }, spine: [4, -6, 0], chest: [6, -12, 0], head: [8, 4, 0],
      shoulderR: [-96, 0, 26], elbowR: [-112, 0, 0], shoulderL: [-26, 0, 22], elbowL: [-118, 0, 0],
      thighL: [-26, 8, 11], kneeL: [34, 0, 0], thighR: [14, -6, -11], kneeR: [24, 0, 0],
    },
    // ...and straight off it, the left palm into the chest (v_godPalm on the other hand)
    v_palmL: {
      hands: ['open', 'fist'],
      root: { y: -0.06, rx: 6 }, hips: [0, -20, 0], spine: [6, -14, 0], chest: [4, -22, 0], head: [-6, 30, 0],
      shoulderL: [-88, 0, -6], elbowL: [-6, 0, 0], handL: [-76, 0, 0], shoulderR: [40, 0, -36], elbowR: [-110, 0, 0],
      thighL: [18, 8, 12], kneeL: [18, 0, 0], thighR: [-30, -10, -12], kneeR: [36, 0, 0],
    },
    v_kneeW: {
      root: { y: -0.02 }, chest: [4, 0, 0],
      shoulderL: [-70, 0, 6], elbowL: [-40, 0, 0], shoulderR: [-70, 0, -6], elbowR: [-40, 0, 0],
      thighL: [-40, 0, 8], kneeL: [80, 0, 0], thighR: [4, 0, -8], kneeR: [20, 0, 0],
    },
    v_knee: {
      root: { y: 0.03, rx: -2 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-10, 0, 0],
      shoulderL: [-62, 0, -18], elbowL: [-92, 0, 0], shoulderR: [-62, 0, 18], elbowR: [-92, 0, 0],
      thighL: [-104, 0, 4], kneeL: [122, 0, 0], footL: [30, 0, 0], thighR: [6, 0, -6], kneeR: [14, 0, 0],
    },
    v_elbowW: {
      root: { y: 0.02, rx: -6 }, chest: [-6, -18, 0], head: [-4, 14, 0],
      shoulderR: [-150, 0, 20], elbowR: [-130, 0, 0], shoulderL: [-40, 0, 14], elbowL: [-100, 0, 0],
      thighL: [-20, 8, 11], kneeL: [26, 0, 0], thighR: [10, -6, -11], kneeR: [22, 0, 0],
    },
    v_elbow: {
      root: { y: -0.1, rx: 14 }, spine: [16, 10, 0], chest: [18, 24, 0], head: [-18, -16, 0],
      shoulderR: [-96, 0, 36], elbowR: [-150, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-90, 0, 0],
      thighL: [-36, 8, 11], kneeL: [44, 0, 0], thighR: [18, -6, -11], kneeR: [20, 0, 0],
    },
    v_gutW: {
      root: { y: -0.08 }, spine: [6, -16, 0], chest: [6, -28, 0], head: [-10, 24, 0],
      shoulderR: [-10, 0, -20], elbowR: [-120, 0, 0], shoulderL: [-60, 0, 10], elbowL: [-90, 0, 0],
      thighL: [-30, 8, 12], kneeL: [44, 0, 0], thighR: [16, -6, -12], kneeR: [30, 0, 0],
    },
    v_gut: {
      root: { y: -0.2, rx: 16 }, spine: [20, 12, 0], chest: [22, 22, 0], head: [-24, -14, 0],
      shoulderR: [-80, 0, 8], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-100, 0, 0],
      thighL: [-54, 8, 12], kneeL: [76, 0, 0], thighR: [26, -6, -12], kneeR: [28, 0, 0],
    },
    v_riseKneeW: { ...C.uppercutWind, root: { y: -0.18 } },
    v_riseKnee: {
      root: { y: 0.12, rx: -16 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-20, 0, 0],
      shoulderL: [10, 0, 34], elbowL: [-50, 0, 0], shoulderR: [10, 0, -34], elbowR: [-50, 0, 0],
      thighR: [-122, 0, -4], kneeR: [128, 0, 0], footR: [30, 0, 0], thighL: [16, 0, 6], kneeL: [18, 0, 0], footL: [40, 0, 0],
    },
    v_dash: {
      root: { rx: 76 }, spine: [-6, 0, 0], neck: [-26, 0, 0], head: [-38, 0, 0],
      shoulderR: [-176, 0, -4], elbowR: [-2, 0, 0], shoulderL: [36, 0, 10], elbowL: [-10, 0, 0],
      thighL: [8, 0, 3], kneeL: [10, 0, 0], footL: [60, 0, 0], thighR: [4, 0, -3], kneeR: [18, 0, 0], footR: [60, 0, 0],
    },
    v_galickCharge: (t) => {
      const s = Math.sin(t * 36) * 1.2;
      return {
        root: { y: -0.1 },
        hips: [0, -30, 0], spine: [2, -20, 0], chest: [4, -40 + s, 0], head: [0, 70, 0],
        shoulderR: [-88, 0, -52], elbowR: [-8, 0, 0], handR: [-40, 0, 0],
        shoulderL: [-86, 0, -74], elbowL: [-14, 0, 0], handL: [-40, 0, 0],
        thighL: [-30, 30, 14], kneeL: [40, 0, 0], thighR: [18, 30, -14], kneeR: [32, 0, 0],
      };
    },
    v_bigBangW: {
      root: { y: -0.06 }, spine: [0, -18, 0], chest: [0, -34, 0], head: [0, 30, 0],
      shoulderR: [-20, 0, -40], elbowR: [-100, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-26, 10, 12], kneeL: [34, 0, 0], thighR: [16, -10, -12], kneeR: [28, 0, 0],
    },
    v_bigBang: {
      root: { y: -0.08, rx: 6 }, spine: [4, 12, 0], chest: [4, 26, 0], head: [-4, -24, 0],
      shoulderR: [-90, 0, 4], elbowR: [-2, 0, 0], handR: [-70, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-40, 0, 0],
      thighL: [-34, 10, 12], kneeL: [40, 0, 0], thighR: [22, -10, -12], kneeR: [22, 0, 0],
    },
    // THE FINAL FLASH STANCE (the owner's beat sheet): boots planted wide, the centre of gravity low, both
    // arms straight out to the sides, wrists locked, palms open and turned out to the horizon
    v_ffStance: (t) => {
      const q = Math.sin(t * 36) * 1.2;
      return {
        root: { y: -0.16 }, spine: [-2, 0, 0], chest: [-6 + q * 0.5, 0, 0], head: [-6, 0, 0],
        shoulderL: [-4, 0, 88 + q], elbowL: [-2, 0, 0], handL: [0, 0, 74], shoulderR: [-4, 0, -88 - q], elbowR: [-2, 0, 0], handR: [0, 0, -74],
        thighL: [-20, 0, 30], kneeL: [44, 0, 0], footL: [-10, 0, -14], thighR: [-20, 0, -30], kneeR: [44, 0, 0], footR: [-10, 0, 14],
        hands: ['open', 'open'],
      };
    },
    // wrists slammed together in front of his chest, the hands cupped round one point of light
    v_ffCompress: (t) => {
      const q = Math.sin(t * 44) * 1.6;
      return {
        root: { y: -0.16, rx: 6 }, spine: [4, 0, 0], chest: [2 + q * 0.5, 0, 0], head: [-4, 0, 0],
        shoulderL: [-74 + q, -26, 6], elbowL: [-34, 0, 0], handL: [0, 0, 64], shoulderR: [-74 - q, 26, -6], elbowR: [-34, 0, 0], handR: [0, 0, -64],
        thighL: [-20, 0, 30], kneeL: [44, 0, 0], footL: [-10, 0, -14], thighR: [-20, 0, -30], kneeR: [44, 0, 0], footR: [-10, 0, 14],
        hands: ['open', 'open'],
      };
    },
    // "FINAL...": the head thrown back, the throat straining, the hands still cupped at his chest
    v_ffRear: (t) => {
      const q = Math.sin(t * 46) * 1.6;
      return {
        root: { y: -0.14, rx: -6 }, spine: [-8, 0, 0], chest: [-12 + q, 0, 0], neck: [-14, 0, 0], head: [-34, 0, 0],
        shoulderL: [-70 + q, -26, 6], elbowL: [-38, 0, 0], handL: [0, 0, 64], shoulderR: [-70 - q, 26, -6], elbowR: [-38, 0, 0], handR: [0, 0, -64],
        thighL: [-20, 0, 30], kneeL: [44, 0, 0], footL: [-10, 0, -14], thighR: [-20, 0, -30], kneeR: [44, 0, 0], footR: [-10, 0, 14],
        hands: ['open', 'open'],
      };
    },
    // after it: bent double at the waist, hands on his knees, every muscle twitching
    v_bentGasp: (t) => {
      const s = Math.sin(t * 7), q = Math.sin(t * 31) * 1.5;
      return {
        root: { y: -0.12, rx: 38 }, spine: [22 + s * 3, 0, 0], chest: [14 + s * 3, 0, q], neck: [-10, 0, 0], head: [-26, 0, 0],
        shoulderL: [-36 + q, 0, 16], elbowL: [-24, 0, 0], shoulderR: [-36 - q, 0, -16], elbowR: [-24, 0, 0],
        thighL: [-34, 0, 14], kneeL: [40, 0, 0], thighR: [-34, 0, -14], kneeR: [40, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ...and a ragged laugh at the smoke, the head coming up
    v_raggedLaugh: (t) => {
      const s = Math.abs(Math.sin(t * 9));
      return {
        root: { y: -0.1, rx: 26 }, spine: [16, 0, 0], chest: [8 + s * 4, 0, 0], neck: [-14, 0, 0], head: [-34 - s * 4, 0, 0],
        shoulderL: [-30, 0, 16], elbowL: [-24, 0, 0], shoulderR: [-30, 0, -16], elbowR: [-24, 0, 0],
        thighL: [-30, 0, 14], kneeL: [36, 0, 0], thighR: [-30, 0, -14], kneeR: [36, 0, 0],
        hands: ['open', 'open'],
      };
    },
    v_finalFlashCharge: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        root: { y: -0.04 }, spine: [-4, 0, 0], chest: [-10 + s, 0, 0], head: [-10, 0, 0],
        shoulderL: [-8, 0, 86], elbowL: [-8, 0, 0], handL: [0, 0, 60], shoulderR: [-8, 0, -86], elbowR: [-8, 0, 0], handR: [0, 0, -60],
        thighL: [-24, 0, 14], kneeL: [34, 0, 0], thighR: [16, 0, -14], kneeR: [28, 0, 0],
      };
    },
    // V0.2 identity: stiff, proud flight with clenched fists at the sides
    flyIdle: (t) => ({
      root: { y: Math.sin(t * 2) * 0.03 }, spine: [4, 0, 0], chest: [6, 0, 0], head: [-12, 0, 0],
      shoulderL: [-6, 0, 16], elbowL: [-28, 0, 0], handL: [0, 0, 8], shoulderR: [-6, 0, -16], elbowR: [-28, 0, 0], handR: [0, 0, -8],
      thighL: [-6, 0, 5], kneeL: [24, 0, 0], footL: [34, 0, 0], thighR: [-2, 0, -5], kneeR: [34, 0, 0], footR: [40, 0, 0],
    }),
    v_scouterTap: {
      root: { y: 0 }, chest: [-2, 8, 0], head: [-8, 14, 6],
      shoulderL: [-128, 0, 46], elbowL: [-128, 0, 0], handL: [0, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-30, 0, 0],
      thighL: [-4, 0, 10], kneeL: [4, 0, 0], thighR: [4, 0, -10], kneeR: [4, 0, 0],
      hands: ['point', 'fist'],
    },
    v_chinUp: { ...C.armsCrossed, head: [-18, -10, 0], chest: [-6, 6, 0] },
    v_turnAway: { ...C.armsCrossed, chest: [-4, 34, 0], hips: [0, 14, 0], head: [-14, -52, 0] },
    v_defeatPound: {
      root: { y: -0.5, rx: 18 }, spine: [22, 0, 0], chest: [18, 0, 0], head: [-6, 0, 0],
      shoulderL: [-40, 0, 16], elbowL: [-40, 0, 0], shoulderR: [-70, 0, -10], elbowR: [-20, 0, 0],
      thighL: [-90, 0, 8], kneeL: [100, 0, 0], thighR: [-10, 0, -8], kneeR: [120, 0, 0], footR: [40, 0, 0],
    },
    // Royal Rush: short knees and elbows at close range
    v_rushW: { root: { y: -0.06 }, spine: [12, 0, 0], chest: [14, 0, 0], head: [-18, 0, 0], shoulderL: [-60, 0, 20], elbowL: [-110, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-110, 0, 0], thighL: [-24, 8, 11], kneeL: [36, 0, 0], thighR: [10, -6, -11], kneeR: [22, 0, 0] },
    v_rush: (t) => {
      const s = Math.sin(t * 40);
      return {
        root: { y: -0.04 + Math.abs(s) * 0.02, rx: 6 }, spine: [10, s * 10, 0], chest: [10, s * 18, 0], head: [-16, -s * 8, 0],
        shoulderL: [-70 - s * 20, 0, -10], elbowL: [-90, 0, 0], shoulderR: [-70 + s * 20, 0, 10], elbowR: [-90, 0, 0],
        thighL: [-40 - Math.max(0, s) * 60, 0, 8], kneeL: [60 + Math.max(0, s) * 50, 0, 0], thighR: [-10, 0, -8], kneeR: [20, 0, 0],
      };
    },
    v_backhandW: { root: { y: -0.04 }, spine: [6, -24, 0], chest: [6, -40, 0], head: [-10, 30, 0], shoulderR: [-60, 0, 70], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-100, 0, 0], thighL: [-20, 8, 11], kneeL: [30, 0, 0], thighR: [10, -6, -11], kneeR: [22, 0, 0] },
    v_backhand: { root: { y: -0.05, rx: 6 }, spine: [6, 30, 0], chest: [6, 52, 0], head: [-12, -40, 0], shoulderR: [-88, 0, -70], elbowR: [-8, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-100, 0, 0], thighL: [-26, 8, 11], kneeL: [34, 0, 0], thighR: [14, -6, -11], kneeR: [16, 0, 0] },
    // Prince's Counter: appears behind with a lifted elbow
    v_counterW: { root: { y: 0.02 }, chest: [-4, -30, 0], head: [-12, 30, 0], shoulderR: [-160, 0, 30], elbowR: [-140, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-60, 0, 0], thighL: [-10, 8, 10], kneeL: [16, 0, 0], thighR: [6, -6, -10], kneeR: [12, 0, 0], hands: ['fist', 'fist'] },
    v_diveW: { root: { rx: -30 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-30, 0, 0], shoulderL: [-170, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-40, 0, 0], thighL: [-40, 0, 10], kneeL: [80, 0, 0], thighR: [-30, 0, -10], kneeR: [70, 0, 0] },
    v_dive: { root: { rx: 60 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-10, 0, 0], shoulderL: [-100, 0, 10], elbowL: [-10, 0, 0], shoulderR: [-100, 0, -10], elbowR: [-10, 0, 0], thighL: [10, 0, 6], kneeL: [20, 0, 0], footL: [50, 0, 0], thighR: [10, 0, -6], kneeR: [20, 0, 0], footR: [50, 0, 0] },
    v_galickFire: {
      root: { y: -0.08, rx: 4 }, hips: [0, -10, 0], spine: [2, 0, 0], chest: [4, 0, 0], head: [-8, 0, 0],
      shoulderR: [-88, 0, 6], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-88, 0, -6], elbowL: [-4, 0, 0], handL: [-60, 0, 0],
      thighL: [-30, 16, 14], kneeL: [38, 0, 0], thighR: [16, -16, -14], kneeR: [26, 0, 0],
      hands: ['open', 'open'],
    },
    v_intro: C.armsCrossed,
    v_victory: C.armsCrossed,
    /* ---- his Super Saiyan, as an event: the fists, the pride, the scream, the look at his own hand ---- */
    // fists trembling in front of his chest, head down: everything held in
    v_tfClench: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return {
        root: { y: -0.08 }, spine: [10, 0, 0], chest: [8 + s, 0, 0], neck: [10, 0, 0], head: [24, 0, 0],
        shoulderL: [-40, 0, 28 + s], elbowL: [-120, 0, 0], shoulderR: [-40, 0, -28 - s], elbowR: [-120, 0, 0],
        thighL: [-14, 0, 16], kneeL: [24, 0, 0], thighR: [-14, 0, -16], kneeR: [24, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the scream: arms thrown down and out, chest open, the head back (not so far the face is lost)
    v_tfRoar: (t) => {
      const s = Math.sin(t * 44) * 2;
      return {
        root: { y: -0.14, rx: -4 }, spine: [-8, 0, 0], chest: [-16 + s, 0, 0], neck: [-8, 0, 0], head: [-18, 0, 0],
        shoulderL: [10, 0, 40 + s], elbowL: [-30, 0, 0], shoulderR: [10, 0, -40 - s], elbowR: [-30, 0, 0],
        thighL: [-30, 0, 26], kneeL: [50, 0, 0], thighR: [-30, 0, -26], kneeR: [50, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // after: his right fist raised in front of his face, looking at it — and the smirk
    v_tfPride: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: b * 0.004 }, hips: [0, -8, 2], spine: [-4, 6, 0], chest: [-10, 8, 0], head: [-8, -14, 6],
        shoulderR: [-62, 30, -10], elbowR: [-122, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-20, 0, 0],
        thighL: [-3, 4, 9], kneeL: [4, 0, 0], thighR: [1, -5, -10], kneeR: [9, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    v_victoryPoint: {
      chest: [-6, 10, 0], head: [-10, -10, 0],
      shoulderR: [-92, 0, 6], elbowR: [-4, 0, 0], shoulderL: [-4, 0, 30], elbowL: [-110, 0, 0], handL: [0, 0, 30],
      thighL: [-6, 0, 10], kneeL: [4, 0, 0], thighR: [4, 0, -10], kneeR: [4, 0, 0],
    },
  };

  SL.data.characters.vegeta = {
    id: 'vegeta',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Vegeta',
    fullName: 'Vegeta, Prince of the Saiyans',
    era: 'Saiyan Saga',
    playable: true,
    style: 'Rushdown',
    blurb: 'Prideful elite who overwhelms opponents up close.',
    ratings: { power: 4, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 14000, ki: 100, stamina: 100, speed: 1.05, power: 1.05, defense: 0.95, weight: 0.95, kiRegen: 2, chargeRate: 32, canonPower: 1.15 },
    appearance: {
      height: 0.9,
      skin: 0xf3c7a0,
      build: { chestW: 0.2, shoulderX: 0.2, waistW: 0.125, upperArmR: 0.056 },
      hair: { style: 'vegeta', color: 0x121217 },
      face: { pupil: 0x0d0d0d, eyeW: 0.95, browThick: 1.25 },
      outfit: {
        topStyle: 'armor', top: 0x223a8c, arms: 0xf3c7a0, pants: 0x223a8c, pantsStyle: 'tight',
        gloves: 0xf7f6f0, boots: 0xf7f6f0, bootTip: 0xd2a84a, bootStyle: 'saiyan',
        armor: { plate: 0xf5f2e6, belly: 0xf5f2e6, pads: 0xd2a84a, padStyle: 'up', hipGuards: 0xd2a84a, trim: 0xd2a84a },
        scouter: { lens: 0x3cff78, body: 0xe2e2e2 },
        tail: 0x6b3b1e,
      },
      portraitColor: '#2a47a8',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xe8e0ff, core: 0xffffff, particles: 0xd8d0ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 50, style: 'full',
        mult: { damage: 1.32, speed: 1.12, defense: 1.15, kiRegen: 2, chargeRate: 1.3 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42 },
        look: { hair: { style: 'vegeta_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.05 },
        line: 'vegeta_ssj',
        music: 3,
        // a major event, not a hair swap: the fists, the ground, the gold catching, the scream, the burst,
        // the lens pulling back to the whole of him, and the look at his own fist
        sequence: {
          length: 196,
          applyAt: 132,
          steps: [
            { at: 0, pose: 'v_tfClench', speed: 6, expression: 'grit', aura: 0.2, auraColor: 0xf0e8ff, mood: [0.3, 0x0c1024, 0.9], shot: 'orbit', music: 0, sfx: 'kiUp' },
            { at: 26, rocks: true, quake: 0.14, sfx: 'rumble' },
            { at: 54, aura: 0.55, auraColor: 0xfff0b0, expression: 'angry', sfx: 'ssjRise', quake: 0.2 },
            { at: 80, hairFlicker: true, lightning: true, sfx: 'lightning', quake: 0.26, mood: [0.5, 0x060a18, 0.6] },
            { at: 104, pose: 'v_tfRoar', speed: 8, expression: 'shout', skyBolt: true, quake: 0.4 },
            { at: 132, burst: true, pose: 'v_tfRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x2a2410, 0.3], flash: 0.7, crater: 5, hairFlicker: false, rocks: false, music: 3 },
            { at: 146, shot: 'pull' },
            { at: 162, pose: 'v_tfPride', speed: 4, expression: 'cocky', lightning: true, mood: [0.05, 0x101020, 1.4] },
          ],
        },
      },
      {
        // Super Saiyan 2: reached in the seven years of peace (the story first shows it under the
        // mark); thinner, taller hair, lightning that never stops. The story locks it until
        // "The Mark" (formGivenBy); Free Battle has it once that mission is cleared.
        id: 'ssj2', name: 'Super Saiyan 2', short: 'SUPER SAIYAN 2', kiCost: 70, style: 'full',
        freeUnlock: 'buu_majin',
        mult: { damage: 1.6, speed: 1.22, defense: 1.32, kiRegen: 2.3, chargeRate: 1.45, guardStamina: 0.74 },
        aura: { color: 0xffe04a, core: 0xffffff, particles: 0xfff0a0, idle: 0.6, speed: 1.6, sharp: 0.55, sparks: 0xc8e4ff, lightning: true },
        look: { hair: { style: 'vegeta_ssj2', color: 0xffd83e }, pupil: 0x14b0a0, brow: 0xe8b830, bulk: 1.07 },
        ghost: 0xfff0a0,
        line: 'vegeta_ssj2',
        music: 5,
        // already gold: what changes is the lightning — it comes first, and it never stops
        sequence: {
          length: 170,
          applyAt: 112,
          steps: [
            { at: 0, pose: 'v_tfClench', speed: 6, expression: 'grit', aura: 0.5, mood: [0.35, 0x0c1024, 0.8], shot: 'orbit', music: 0, sfx: 'kiUp', lightning: true },
            { at: 30, rocks: true, quake: 0.2, sfx: 'lightning' },
            { at: 62, hairFlicker: true, skyBolt: true, quake: 0.3, sfx: 'ssjRise', expression: 'angry' },
            { at: 88, pose: 'v_tfRoar', speed: 8, expression: 'shout', skyBolt: true, quake: 0.45 },
            { at: 112, burst: true, pose: 'v_tfRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', flash: 0.65, crater: 5, hairFlicker: false, rocks: false, music: 3 },
            { at: 124, shot: 'pull' },
            { at: 140, pose: 'v_tfPride', speed: 4, expression: 'cocky', mood: [0.05, 0x101020, 1.4] },
          ],
        },
      },
      {
        /*
         * SUPER SAIYAN GOD (Movie 2 · Super Broly — the owner's beat text): the gold condenses into a crimson
         * flame, the hair snaps ruby red, the frame goes leaner and lighter. Placed after Super Saiyan 2 so Free
         * Battle's chain reaches it; the story-only Majin and Super Vegeta stay behind it. The FILM hands it over
         * (formGivenBy 'bb_clash': locked in the whole canon story and every What-If); Free Battle once that is
         * cleared. kiCost 60 like the Majin form that used to follow Super Saiyan 2, so nothing a CPU Vegeta
         * weighs in any older mission changes.
         */
        id: 'god', name: 'Super Saiyan God', short: 'SUPER SAIYAN GOD', kiCost: 60, style: 'full',
        freeUnlock: 'bb_clash',
        mult: { damage: 2.25, speed: 1.44, defense: 1.6, kiRegen: 2.7, chargeRate: 1.6, guardStamina: 0.7, accel: 1.38 },
        aura: { color: 0xff2a48, core: 0xfff0e0, particles: 0xff6a3a, idle: 0.5, speed: 1.4, sharp: 0.16, sparks: 0xffc8a0, flame: [0xff4a1a, 0xff1a4a, 0xffb040, 0xff7a2a, 0xd8183a] },
        look: { hair: { style: 'vegeta_god', color: 0xc8143a }, pupil: 0xb81030, brow: 0xa8102a, bulk: 0.92, muscle: 0.9, scale: 0.985 },
        ai: { personality: 'martial', aggression: 0.86, defense: 0.7, ranged: 0.35, beam: 0.5, preferredRange: 2.2 },
        intro: { pose: 'v_tfPride', expression: 'cocky' },
        ghost: 0xff7a6a,
        line: 'vegeta_god',
        reactLine: 'react_ssj',
        music: 5,
        // no scream: the flame rises off him, quietly, and he is simply something else
        sequence: {
          length: 200,
          applyAt: 140,
          steps: [
            { at: 0, pose: 'v_tfClench', speed: 4, expression: 'closed', aura: 0.3, auraColor: 0xff5a3a, mood: [0.45, 0x2a0610, 1.1], shot: 'orbit', music: 0, sfx: 'heartbeat' },
            { at: 44, sfx: 'kiCharge', quake: 0.08 },
            { at: 84, aura: 0.75, sfx: 'ssjRise', mood: [0.6, 0x3a0814, 0.8] },
            { at: 116, quake: 0.18, sfx: 'rumble' },
            { at: 140, burst: true, pose: 'v_tfPride', speed: 6, expression: 'cold', sfx: 'transformBurst', mood: [0.2, 0x3a1010, 0.4], flash: 0.3, crater: 3 },
            { at: 164, shot: 'face', mood: [0, 0x000000, 1.8] },
          ],
        },
      },
      {
        // SUPER SAIYAN BLUE (Movie 2): the god's power under a Super Saiyan's control — the Super Saiyan shape
        // in cyan, lit from inside, a blue flame. Handed over in the main story by 'rof_finale' and in Movie 2 by
        // 'bb_wrath'; Free Battle once either is cleared.
        id: 'blue', name: 'Super Saiyan Blue', short: 'SUPER SAIYAN BLUE', kiCost: 80, style: 'full',
        freeUnlock: ['rof_finale', 'bb_wrath'],
        mult: { damage: 2.6, speed: 1.5, defense: 1.75, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.66, accel: 1.45 },
        aura: { color: 0x2a9aff, core: 0xd8f6ff, particles: 0x6ad0ff, idle: 0.5, speed: 1.7, sharp: 0.55, sparks: 0xbfe8ff, flame: [0x2a8aff, 0x3ad0ff, 0x1a5ae8, 0x8ae8ff], inner: { color: 0xa8e8ff, core: 0xffffff, scale: 0.66, alpha: 0.5, sharp: 0.6 } },
        look: { hair: { style: 'vegeta_blue', color: 0x34c4ff }, pupil: 0x1a74e0, brow: 0x2aa0e8, bulk: 1.0 },
        ai: { personality: 'martial', aggression: 0.9, defense: 0.7, ranged: 0.35, beam: 0.55, preferredRange: 2.2 },
        intro: { pose: 'v_tfPride', expression: 'cocky' },
        ghost: 0x8ad8ff,
        line: 'vegeta_blue',
        reactLine: 'react_ssj',
        music: 5,
        sequence: {
          length: 196,
          applyAt: 132,
          steps: [
            { at: 0, pose: 'v_tfClench', speed: 6, expression: 'grit', aura: 0.3, auraColor: 0x8ad0ff, mood: [0.35, 0x061024, 0.9], shot: 'orbit', music: 0, sfx: 'kiUp' },
            { at: 30, rocks: true, quake: 0.14, sfx: 'rumble' },
            { at: 60, aura: 0.6, auraColor: 0x4ab8ff, expression: 'angry', sfx: 'ssjRise', quake: 0.22 },
            { at: 98, pose: 'v_tfRoar', speed: 8, expression: 'shout', quake: 0.36 },
            { at: 132, burst: true, pose: 'v_tfRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x0a1a30, 0.3], flash: 0.3, crater: 5, rocks: false },
            { at: 148, shot: 'pull' },
            { at: 164, pose: 'v_tfPride', speed: 4, expression: 'cocky', mood: [0.05, 0x101020, 1.4] },
          ],
        },
      },
      {
        /*
         * MAJIN: seven years later, and the thing he lets Babidi do to him is not a power-up he
         * earned: it is a decision. A distinct state, not Super Saiyan 2 with a mark on it:
         *   - look: Super Saiyan 2 hair, Babidi's "M" on the forehead (it belongs to this state,
         *     not to an outfit: it comes and goes with it), a colder cast, gold aura with crimson
         *     edges and the lightning;
         *   - body: a hunched, leashed stance instead of the crossed arms (the form's idle);
         *   - fighting: reckless — heavies that do not stop for your blows (armor), a string that
         *     trades, and a CPU that barely guards and never breathes for long;
         *   - voice: his barks are not the prince's (form.barks).
         * Story-locked, so the wheel never offers it; "The Mark" is the only way in. Outside the story it is a starting
         * form once that mission is cleared (freeStart), never a transformation (it sits after Blue in this list).
         */
        id: 'majin', name: 'Majin', short: 'MAJIN', kiCost: 60, style: 'full', storyLocked: true, freeStart: 'buu_majin',
        mult: { damage: 1.78, speed: 1.24, defense: 1.2, kiRegen: 2.3, chargeRate: 1.45, guardStamina: 0.8 },
        aura: { color: 0xffc83a, core: 0xfff0d0, particles: 0xff5a7a, idle: 0.7, speed: 1.7, sharp: 0.7, sparks: 0xff3a5a, lightning: true },
        // a body for the state (2026-09-25): heavier arms, legs and neck (muscle), a bigger chest
        // (bulk), the M and the Majin creases on the face, the sneer at rest (restFace)
        look: { hair: { style: 'vegeta_majin', color: 0xffd33a }, pupil: 0x10a894, brow: 0xe8b830, bulk: 1.16, muscle: 1.17, tint: 0x8a1030, tintAmount: 0.12, headExtras: SL.data.majinMark(0x121212, SL.data.majinFace()) },
        restFace: 'majin',
        poses: { idle: poses.v_majinStance, run: poses.v_majinRun, flyIdle: poses.v_majinFlyIdle, flyForward: poses.v_majinFly, guard: poses.v_majinGuard, charge: poses.v_majinCharge },
        moves: {
          heavy: {
            // he takes your punch to land his (armor), and folds you in half
            0: { id: 'majinGut', startup: 10, active: 4, recovery: 20, damage: 1250, reach: 1.25, radius: 0.9, lunge: 16, hitstun: 46, knock: 'crumple', impact: 3, guardCrush: true, guardDamage: 50, armor: true, pose: { wind: 'v_majinHeavyW', strike: 'v_majinHeavy' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            2: { id: 'risingKnee', startup: 9, active: 4, recovery: 20, damage: 820, reach: 1.0, radius: 0.85, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'v_riseKneeW', strike: 'v_riseKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            3: { id: 'majinRush', startup: 6, active: 22, recovery: 18, damage: 190, reach: 1.05, radius: 0.85, lunge: 13, hitstun: 18, knock: 'flinch', impact: 1, multi: [0, 5, 10, 15], finish: { knock: 'smash', knockSpeed: 34, impact: 3, damage: 700 }, pose: { wind: 'v_rushW', strike: 'v_rush' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            4: { id: 'axeHandle', startup: 12, active: 4, recovery: 24, damage: 1150, reach: 1.15, radius: 0.9, lunge: 11, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 3, armor: true, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          },
          dash: { id: 'majinCharge', startup: 4, active: 10, recovery: 16, damage: 980, reach: 1.25, radius: 0.95, lunge: 38, hitstun: 30, knock: 'heavy', knockSpeed: 28, impact: 3, armor: true, pose: { wind: 'v_dash', strike: 'v_dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        // reckless, but a person can still read him: four aggressive decisions, then a breath
        ai: { personality: 'berserker', aggression: 1, defense: 0.18, ranged: 0.3, beam: 0.4, preferredRange: 2.2, whiffBreath: 12, rhythm: { burst: 4, rest: 40 } },
        barks: { combo: 'majin_combo', hurt: 'majin_hurt', lowHp: 'majin_lowHp', taunt: 'majin_taunt', counter: 'majin_combo' },
        intro: { pose: 'v_majinStance', expression: 'majin' },
        victory: { poses: ['v_majinLaugh', 'v_majinStance'], expression: 'grin' },
        ghost: 0xffb070,
        line: 'vegeta_majin',
        music: 6,
        sequence: {
          length: 190,
          applyAt: 122,
          steps: [
            { at: 0, pose: 'v_clutchHead', speed: 6, expression: 'grit', aura: 0.4, auraColor: 0xff3a6a, mood: [0.5, 0x2a0a1a, 0.9], shot: 'orbit', music: 0, sfx: 'heartbeat', rocks: true },
            { at: 36, sfx: 'magic', quake: 0.2 },
            { at: 60, pose: 'v_acceptMark', speed: 5, expression: 'smirk', aura: 0.7, sfx: 'heartbeat' },
            { at: 80, pose: 'v_majinCharge', speed: 9, expression: 'shout', aura: 1, sfx: 'ssjRise', mood: [0.8, 0x14020a, 0.6], lightning: true, skyBolts: true },
            { at: 104, quake: 0.45, skyBolt: true },
            { at: 122, burst: true, pose: 'v_majinCharge', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.3, 0x2a0a14, 0.3], flash: 0.95, crater: 6, rocks: false },
            { at: 146, pose: 'v_majinStance', speed: 5, expression: 'majin', shot: 'face', mood: [0.14, 0x1a0a14, 1.3] },
          ],
        },
      },
      {
        /*
         * SUPER VEGETA (Super Saiyan Grade 2, the Cell Saga — the owner's Final Flash beat sheet, 2026-10-03): the
         * body forced past Super Saiyan into something denser. Chest, shoulders and arms swollen against the
         * suit (bulk, muscle), veins at the temples, the hair stiffer and longer with a near-white core, a
         * burning gold aura with blue static snapping round the boots and knuckles. Story-only (the Final
         * Flash puts him in it); its numbers are Super Saiyan's — the story sets what the fight needs. Not in Free
         * Battle or Training at all, not even as a starting form (owner, 2026-10-17).
         */
        id: 'super_vegeta', name: 'Super Vegeta', short: 'SUPER VEGETA', kiCost: 60, style: 'full', storyLocked: true,
        mult: { damage: 1.32, speed: 1.12, defense: 1.15, kiRegen: 2, chargeRate: 1.3 },
        aura: { color: 0xffcf3a, core: 0xfff8d8, particles: 0xffe680, idle: 0.55, speed: 1.5, sharp: 0.55, sparks: 0x9ad0ff, lightning: true },
        look: {
          hair: { style: 'vegeta_g2', color: 0xffe27a }, pupil: 0x18b89a, brow: 0xe8c040, bulk: 1.2, muscle: 1.24,
          // veins at the temples (painted on the skin like the Majin creases)
          headExtras: [
            { shape: 'line', a: [0.62, 0.45, 0.62], d: [0.2, 1, -0.1], l: 0.04, r: 0.006, flat: 0.25, depth: 1.004, color: 0x9a6a3e },
            { shape: 'line', a: [-0.62, 0.45, 0.62], d: [-0.2, 1, -0.1], l: 0.04, r: 0.006, flat: 0.25, depth: 1.004, color: 0x9a6a3e },
          ],
        },
        line: 'vegeta_ssj',
        ghost: 0xffe680,
        music: 4,
      },
      {
        // SUPER SAIYAN BLUE EVOLUTION (the Tournament of Power, against Toppo): his own road, not Goku's — the blue goes
        // deep and dark, the hair stands sharper, the body heavier, the aura a darker cobalt with lightning running
        // through it. Story-given by top_toppo; Free Battle once that is cleared.
        id: 'blueEvo', name: 'Super Saiyan Blue Evolution', short: 'BLUE EVOLUTION', kiCost: 90, style: 'full',
        freeUnlock: ['top_toppo'],
        mult: { damage: 3.1, speed: 1.6, defense: 1.95, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.6, accel: 1.5 },
        // not a free state: it burns ki every second, and an empty tank ends it
        drain: { kiPerSec: 2.6 },
        aura: { color: 0x1a4ae8, core: 0xb8e0ff, particles: 0x3a7aff, idle: 0.65, speed: 1.8, sharp: 0.6, sparks: 0x9ad8ff, lightning: true, flame: [0x0a2ab8, 0x1a4ae8, 0x2a6aff, 0x6aa8ff], inner: { color: 0x0a2ab8, core: 0x6aa8ff, scale: 0.74, alpha: 0.9, sharp: 0.6 }, trail: 0x2a6aff },
        look: { hair: { style: 'vegeta_blue', color: 0x1a62e0 }, pupil: 0x0a3aa8, brow: 0x1a50c0, bulk: 1.12, muscle: 1.14 },
        // high pressure, and the breath he has to take after it
        ai: { personality: 'aggressive', aggression: 0.95, defense: 0.6, ranged: 0.4, beam: 0.6, preferredRange: 2, rhythm: { burst: 5, rest: 36 } },
        intro: { pose: 'v_tfPride', expression: 'cocky' },
        ghost: 0x4a8aff,
        line: 'vegeta_blue',
        reactLine: 'react_ssj',
        music: 5,
      },
    ],
    poses,
    // on the skill wheel
    extras: [
      // PRINCE'S ONSLAUGHT — a Namek-era rush (the owner's roadmap keeps it there; the name is from the games, the blows
      // a blend of the PDF's two versions): a low sweep through the legs, an uppercut that carries him into the air,
      // Vegeta vanishing behind him for a double axe-handle, then a knee driven down into his back. Base and Super
      // Saiyan; earned for Free Battle by clearing "A Prince on Namek" (namek_vegeta)
      {
        id: 'princesOnslaught', name: "Prince's Onslaught", type: 'rush', kiCost: 45, icon: 'rush',
        forms: ['base', 'ssj'], freeUnlock: 'namek_vegeta', freeOnly: true,
        startup: 12, dashFrames: 30, speed: 48, recovery: 30,
        poses: { wind: 'v_gutW', dash: 'v_dash' },
        hits: [
          { pose: 'v_poSweep', damage: 400, frames: 12, sfx: 'punchLight', hitPose: 'hitSideL' },
          { pose: 'uppercut', damage: 600, frames: 16, sfx: 'punchHeavy', hitPose: 'hitHeavy', lift: 3.5 },
          { pose: 'hammer', damage: 700, frames: 14, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'v_poKnee', damage: 1300, frames: 26, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4, hitPose: 'hitHeavy', to: 'above' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 1.1 },
            { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.35 },
          ],
        },
      },
      // DIRTY FIREWORKS — Namek-era (a named Vegeta technique; the choreography is the PDF's): a body blow, the uppercut
      // that throws him into the sky, then two fingers pointed up with a smirk and the ki he left in him goes off
      // wherever he is. Cut Vegeta off before the fingers go up and nothing goes off. Base and Super Saiyan; earned by
      // clearing "A Prince on Namek"
      {
        id: 'dirtyFireworks', name: 'Dirty Fireworks', type: 'rush', kiCost: 40, icon: 'ball',
        forms: ['base', 'ssj'], freeUnlock: 'namek_vegeta', freeOnly: true,
        startup: 10, dashFrames: 28, speed: 50, recovery: 62,
        poses: { wind: 'v_gutW', dash: 'v_dash' },
        hits: [
          { pose: 'v_gut', damage: 350, frames: 10, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'uppercut', damage: 500, frames: 14, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 34, impact: 3, hitPose: 'hitHeavy' },
        ],
        detonate: { at: 42, damage: 1500, radius: 1.6, color: 0xffb040, pose: 'v_dirtyFireworks' },
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.4 },
            { on: 'finish', shot: 'wide', dur: 0.75 },
            { on: 'finish', at: 42, shot: 'impact', dur: 0.8, quake: 0.3 },
          ],
        },
      },
      // GODLY EXECUTION — Super Saiyan God Vegeta (the PDF's name and blows, inspired by the Broly film; a game rush):
      // calm, one arm behind his back, three palm strikes, a flip over his head, and a red ki blast point blank into
      // his back. God only; earned for Free Battle by clearing "The First Clash" (bb_clash, where the form is his)
      {
        id: 'godlyExecution', name: 'Godly Execution', type: 'rush', kiCost: 50, icon: 'rush',
        forms: ['god'], freeUnlock: 'bb_clash', freeOnly: true,
        startup: 10, dashFrames: 30, speed: 54, recovery: 28,
        poses: { wind: 'v_godPalm', dash: 'v_dash' },
        hits: [
          { pose: 'v_godPalm', damage: 350, frames: 9, sfx: 'punchLight', hitPose: 'hitBody' },
          { pose: 'v_godPalmHigh', damage: 350, frames: 9, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'v_godPalm', damage: 400, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'v_godShot', damage: 1900, frames: 26, sfx: 'kiBlastBig', to: 'behind', ki: { color: 0xff4a5a, hand: 'R', pierce: 4 }, explode: 0.9, knock: 'heavy', knockSpeed: 44, impact: 4, hitPose: 'hitBack' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.4 },
            { on: 'connect', shot: 'wide', dur: 0.6 },
            { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.3 },
          ],
        },
      },
      // THE SAIYAN CHARGE — "We Saiyans have no limits!" (Roadmap Three, the Goku Black arc research CS-CHG-01 / CHG-S01 and
      // its section 5's Blue Dual Charge): the same charge as on Goku's wheel, led by Vegeta — only with Super Saiyan Blue
      // Goku fighting on your side. Side by side in the same low stance, both auras up, the ground cracking; off together and
      // across side by side, Goku on the right; Vegeta's left hook, Goku's right hook, then both at once. Blue only; earned
      // with Vegito Blue ("Vegito", ft_vegito, or "The Final Battle"). Provisional numbers (70 ki; 650 + 650 + 1,900 + 900)
      {
        id: 'saiyanCharge', name: 'Saiyan Charge', type: 'rush', kiCost: 70, icon: 'rush',
        forms: ['blue'], freeUnlock: ['ft_vegito', 'top_finale'], freeOnly: true,
        partner: { ids: ['goku'], forms: ['blue'], name: 'Super Saiyan Blue Goku', range: 45, pose: 'g_crossW', alongside: 'right', windPose: 'powerCrouch', dashPose: 'dash', ignite: 0x4ad8ff },
        startup: 30, dashFrames: 34, speed: 64, recovery: 30,
        poses: { wind: 'powerCrouch', dash: 'v_dash' },
        hits: [
          { pose: 'v_hook', damage: 650, frames: 4, sfx: 'punchHeavy', hitPose: 'hitSideR', ring: { color: 0x4ad8ff, size: 1.2 } },
          { by: 'partner', pose: 'g_cross', damage: 650, frames: 16, sfx: 'punchHeavy', hitPose: 'hitBody', ring: { color: 0x4ad8ff, size: 1.2 } },
          { pose: 'v_hook', damage: 1900, frames: 30, sfx: 'punchHeavy', partnerKi: { pose: 'g_cross', color: 0x4ad8ff, damage: 900, hand: 'R' }, explode: 1.2, knock: 'heavy', knockSpeed: 46, impact: 5, hitPose: 'hitHeavy', ring: { color: 0xffffff, size: 2.4 } },
        ],
        cine: { steps: [{ on: 'start', shot: 'partnerLow', at: 2, dur: 0.5 }, { on: 'release', shot: 'track', dur: 0.5 }, { on: 'connect', shot: 'reverse', dur: 0.9 }, { on: 'finish', shot: 'impact', dur: 1, quake: 0.45 }] },
      },
      // BLUE GALICK RUSH — a game-original Super Saiyan Blue rush (the roadmap's #47), drawn from the way he beat Goku
      // Black (the beatdown itself is a Future Trunks Saga story moment, not this move): gut punches and an elbow,
      // the spinning back-kick that throws him up, and a Galick Gun fired after him point blank. Blue only; earned
      // for Free Battle like the form ("Three Minutes", rof_finale, or the Broly film's "Wrath")
      {
        id: 'blueGalickRush', name: 'Blue Galick Rush', type: 'rush', kiCost: 55, icon: 'beam',
        forms: ['blue'], freeUnlock: ['rof_finale', 'bb_wrath'], freeOnly: true,
        startup: 12, dashFrames: 30, speed: 54, recovery: 34,
        poses: { wind: 'v_gutW', dash: 'v_dash' },
        hits: [
          { pose: 'v_gut', damage: 450, frames: 9, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'v_elbow', damage: 450, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { pose: 'v_spinBack', damage: 500, frames: 18, sfx: 'punchHeavy', hitPose: 'hitHeavy', lift: 3 },
          { pose: 'v_galickFire', damage: 1800, frames: 30, sfx: 'kiBlastBig', ki: { color: 0xb44dff, hand: 'both' }, beam: { length: 16, radius: 0.75, frames: 34 }, explode: 1.1, knock: 'launch', knockSpeed: 40, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.4 },
            { on: 'connect', shot: 'wide', dur: 0.9 },
            { on: 'finish', shot: 'wide', dur: 1, quake: 0.4 },
          ],
        },
      },
      // FINAL GOD STRIKE — Blue Evolution (the PDF's name and blows, against Toppo and Jiren; a game rush): a heavy
      // hook, the spinning back-kick that launches him high, Vegeta above him, and a royal-blue Final Flash fired
      // straight down. Blue Evolution only; earned for Free Battle like the form ("Pride and Destruction", top_toppo)
      {
        id: 'finalGodStrike', name: 'Final God Strike', type: 'rush', kiCost: 60, icon: 'ultimate',
        forms: ['blueEvo'], freeUnlock: 'top_toppo', freeOnly: true,
        startup: 12, dashFrames: 30, speed: 58, recovery: 36,
        poses: { wind: 'v_hookW', dash: 'v_dash' },
        hits: [
          { pose: 'v_hook', damage: 600, frames: 12, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { pose: 'v_spinBack', damage: 700, frames: 20, sfx: 'punchHeavy', hitPose: 'hitHeavy', lift: 4.5 },
          { pose: 'beamFire', damage: 2200, frames: 34, sfx: 'kiBlastBig', to: 'above', ki: { color: 0x3a8cff, hand: 'both' }, beam: { length: 14, radius: 1, frames: 40, core: 0xeaf4ff }, explode: 1.3, knock: 'smash', knockSpeed: 44, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.4 },
            { on: 'connect', shot: 'wide', dur: 0.9 },
            { on: 'finish', shot: 'impact', dur: 1, quake: 0.45 },
          ],
        },
      },
      // FINAL IMPACT — a game-original name (not a named technique) for the Majin Vegeta of the Buu Saga up close:
      // Majin form only, earned for Free Battle by clearing "The Mark" (the mission that gives the form); the story's
      // fights keep their kit. Not the Final Flash and not the Final Explosion: he charges in, drives a knee into the
      // stomach, holds him there with the hand raised at his chest while the ki gathers — and shoots him point blank
      {
        id: 'finalImpact', name: 'Final Impact', type: 'rush', kiCost: 50, icon: 'rush',
        forms: ['majin'], freeUnlock: 'buu_majin', freeOnly: true,
        startup: 12, dashFrames: 28, speed: 50, recovery: 30,
        poses: { wind: 'v_majinHeavyW', dash: 'v_majinFly' },
        hits: [
          { pose: 'v_majinKnee', damage: 800, frames: 22, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'v_finalImpactAim', frames: 28, aim: { color: 0xffd84a, hand: 'R' } },
          { pose: 'v_finalImpact', damage: 1900, frames: 26, sfx: 'kiBlastBig', ki: { color: 0xffd84a, hand: 'R', pierce: 6 }, explode: 1, knock: 'heavy', knockSpeed: 46, impact: 4, hitPose: 'hitHeavy' },
        ],
        // alongside him on the way in, both of them on the knee, on the side of the raised hand (his face and the
        // gathering ki), the blast wide. No slow motion on the blast: it would hold its brightest frames on screen
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 0.55 },
            { on: 'aim', shot: 'aim', dur: 0.5 },
            { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.35 },
          ],
        },
      },
      // ATOMIC RUSH — the name is the owner's PDF's (a heading with no description); the blows are a game adaptation
      // of Majin Vegeta's fight with Goku (Buu Saga): the roundhouse that swept him through the rocks, the rings of ki
      // that pinned his wrists and ankles, the close blows and a headbutt. Majin only, earned for Free Battle by
      // clearing that fight ("Prince of Saiyans", buu_pride); the mission keeps its own staging
      {
        id: 'atomicRush', name: 'Atomic Rush', type: 'rush', kiCost: 45, icon: 'rush',
        forms: ['majin'], freeUnlock: 'buu_pride', freeOnly: true,
        startup: 12, dashFrames: 30, speed: 52, recovery: 30,
        poses: { wind: 'v_majinStance', dash: 'v_majinFly' },
        hits: [
          { pose: 'v_atomicKick', damage: 700, frames: 16, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { pose: 'v_atomicLoom', frames: 34, bind: { color: 0xffd23a }, hitPose: 'hitBody' },
          { pose: 'v_jab', damage: 300, frames: 8, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'v_hook', damage: 320, frames: 8, sfx: 'punchLight', hitPose: 'hitSideR' },
          { pose: 'v_gut', damage: 380, frames: 10, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'v_headbutt', damage: 1200, frames: 24, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 38, impact: 4, hitPose: 'hitHeavy' },
        ],
        // alongside on the way in, both on the kick, over the pinned one's shoulder at him as he walks up, impact
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 0.4 },
            { on: 'bind', shot: 'reverse', dur: 0.6 },
            { on: 'finish', shot: 'impact', dur: 0.7, quake: 0.3 },
          ],
        },
      },
      // FINAL EXPLOSION — the sacrifice against Majin Buu (Buu Saga) made a playable ultimate, for Free Battle only
      // (earned by clearing "The Prince's Pride", buu_sacrifice; the story keeps its own scene and outcome). Majin only. A long,
      // committed charge — the aura swelling, lightning crackling, the ground shaking — then a sphere of ki bursting
      // out of him in every direction: whoever is still near is caught, whoever got away is not. It costs all his ki
      // and half of his own health (never below 1 HP), and leaves him spent: the punish window
      {
        id: 'finalExplosion', name: 'Final Explosion', type: 'bomberWave', kiCost: 100, icon: 'ultimate', ultimate: true,
        forms: ['majin'], freeUnlock: 'buu_sacrifice', freeOnly: true,
        charge: 150, radius: 18, damage: 7000, knockSpeed: 42, impact: 5, recovery: 90, selfCost: 0.5,
        poses: { charge: 'v_feGather', release: 'v_finalExplosion', winded: 'v_feSpent' },
        look: { telegraph: false, color: 0xffd23a, ringColor: 0xfff0b0, aura: 1, grow: true, bolts: 0xfff2a0, blast: 0.6, blastFlash: 0.35, ring: 2.4, light: 3, ground: 0.9, flash: 0.2 },
        // his face as he decides, circling him as it swells and the world darkens, square in front as it peaks, then
        // far off and above as it bursts out of him, drawing back as the sphere swells (never inside it)
        cine: {
          steps: [
            { on: 'start', shot: 'face', dur: 0.9, mood: [0.45, 0x1a0808, 1] },
            { on: 'start', at: 55, shot: 'orbit', dur: 1.3, quake: 0.15 },
            { on: 'start', at: 132, shot: 'front', dur: 0.35, quake: 0.3 },
            { on: 'release', shot: 'nova', dur: 2.2, quake: 0.6 },
          ],
        },
      },
    ],
    moves: {
      light: [
        { id: 'jab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 260, reach: 1.1, radius: 0.7, lunge: 10, hitstun: 19, knock: 'flinch', impact: 1, pose: { wind: 'v_jabW', strike: 'v_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'hook', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 300, reach: 1.1, radius: 0.75, lunge: 10, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'v_hookW', strike: 'v_hook' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'knee', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 330, reach: 0.95, radius: 0.8, lunge: 11, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'v_kneeW', strike: 'v_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'elbowSmash', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 400, reach: 1.1, radius: 0.8, lunge: 11, hitstun: 26, knock: 'push', knockSpeed: 6, impact: 2, pose: { wind: 'v_elbowW', strike: 'v_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gutPunch', startup: 12, active: 4, recovery: 22, damage: 820, reach: 1.25, radius: 0.85, lunge: 13, hitstun: 44, knock: 'crumple', impact: 2, guardCrush: true, guardDamage: 42, pose: { wind: 'v_gutW', strike: 'v_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'risingKnee', startup: 9, active: 4, recovery: 20, damage: 640, reach: 1.0, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'v_riseKneeW', strike: 'v_riseKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        3: { id: 'royalRush', startup: 6, active: 22, recovery: 20, damage: 140, reach: 1.05, radius: 0.85, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, multi: [0, 5, 10, 15], finish: { knock: 'heavy', knockSpeed: 28, impact: 3, damage: 480 }, pose: { wind: 'v_rushW', strike: 'v_rush' }, sfx: 'punchLight', hitPose: 'hitBody' },
        4: { id: 'axeHandle', startup: 12, active: 4, recovery: 24, damage: 920, reach: 1.15, radius: 0.9, lunge: 11, hitstun: 36, knock: 'smash', knockSpeed: 34, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'dashPunch', startup: 5, active: 9, recovery: 17, damage: 720, reach: 1.25, radius: 0.9, lunge: 32, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'v_dash', strike: 'v_dash' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      airHeavy: {
        0: { id: 'royalHammer', startup: 11, active: 4, recovery: 22, damage: 760, reach: 1.15, radius: 0.95, lunge: 13, hitstun: 34, knock: 'smash', knockSpeed: 32, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'airKnee', startup: 8, active: 4, recovery: 18, damage: 620, reach: 1.0, radius: 0.9, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 16, impact: 2, pose: { wind: 'v_riseKneeW', strike: 'v_riseKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      chase: {
        smash: { id: 'princeDive', startup: 5, active: 7, recovery: 22, damage: 700, reach: 1.1, radius: 1.05, lunge: 18, hitstun: 36, knock: 'smash', knockSpeed: 38, impact: 3, pose: { wind: 'v_diveW', strike: 'v_dive' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        strike: { id: 'chaseBackhand', startup: 5, active: 6, recovery: 22, damage: 640, reach: 1.3, radius: 1.05, lunge: 16, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, pose: { wind: 'v_backhandW', strike: 'v_backhand' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      // Prince's Counter: the next strike after a Perfect Guard
      counter: {
        light: { id: 'princesCounter', startup: 3, active: 5, recovery: 18, damage: 780, reach: 1.1, radius: 0.95, lunge: 10, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'v_counterW', strike: 'v_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
        heavy: { id: 'royalBreaker', startup: 6, active: 4, recovery: 22, damage: 900, reach: 1.25, radius: 0.9, lunge: 14, hitstun: 50, knock: 'crumple', impact: 3, guardCrush: true, guardDamage: 60, pose: { wind: 'v_gutW', strike: 'v_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      throw: { id: 'kneeThrow', name: 'Royal Hammer', damage: 1050, knockSpeed: 30, poses: ['grab', 'v_knee', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'galickGun', name: 'Galick Gun', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 20, chargeMax: 96, tiers: [20, 50, 84], damage: [1900, 3400], radius: [0.55, 1.2], speed: 104, range: 150, sustain: 36,
        color: 0xb44dff, core: 0xf3dcff, poses: { charge: 'v_galickCharge', fire: 'v_galickFire' }, recovery: 22,
        style: { rings: 3, ringColor: 0xe0b0ff, ringSpeed: 1.6 },
        sound: 'galick',
        callout: ['GALICK', 'GUN!'],
        chargeLight: 0xb44dff,
        formVariants: { ssj: { name: 'Super Galick Gun', color: 0xd070ff, core: 0xfff0ff, ringColor: 0xffe0ff, damageMul: 1.12 } },
      },
      special2: {
        id: 'bigBang', name: 'Big Bang Attack', type: 'projectile', kiCost: 35, icon: 'ball',
        startup: 14, recovery: 22, pose: { wind: 'v_bigBangW', release: 'v_bigBang' },
        projectile: { kind: 'ball', speed: 58, radius: 1.1, damage: 2100, homing: 1.1, color: 0x7fc6ff, core: 0xffffff, explode: 7, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
        // outside the story: low in front, up at the one-handed pose and in on the sphere; thrown, a cut behind his
        // shoulder along its path to the burst
        cine: { steps: [{ on: 'start', shot: 'hand', dur: 0.3 }, { on: 'release', shot: 'path', dur: 0.9 }] },
      },
      ultimate: {
        id: 'finalFlash', name: 'Final Flash', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        // charge decides its strength (the records PDF): ready at 70 frames as before (same 5000 / 1.9 m there), held
        // on to 110 a fully charged tier — 6000, wider, its own shots (cine 'full', minTier 2)
        chargeMin: 70, chargeMax: 110, tiers: [70, 108], damage: [3250, 6000], radius: [1.03, 2.4], speed: 120, range: 180, sustain: 55,
        color: 0xffe14a, core: 0xffffff, poses: { charge: 'v_finalFlashCharge', fire: 'beamFire' }, recovery: 36, armor: false, cinematic: true,
        // outside the story (2026-10-17): the ground under its path torn open to the impact (projectiles.js spec.trench)
        trench: true,
        // outside the story: circling him as his arms spread and it gathers, square in front as the hands meet, then
        // wide from the side as the beam crosses to the target
        cine: {
          steps: [
            { on: 'start', shot: 'orbit', dur: 0.8 },
            { on: 'start', at: 46, shot: 'front', dur: 0.5 },
            // held to the full tier: square on him again as the gold surges and the ground shakes (the tier-up's own
            // flash only: one more stacked on it and the release washed the frame white)
            { on: 'full', shot: 'front', dur: 0.6, quake: 0.3 },
            { on: 'release', maxTier: 1, shot: 'wide', dur: 1.3, quake: 0.3 },
            // (side-on only once it fires: the charge / front shots stand in the beam's path and the frame went white)
            { on: 'release', minTier: 2, shot: 'wide', dur: 1.7, quake: 0.5, slow: [0.45, 0.3] },
          ],
        },
      },
    },
    mechanic: { type: 'pride', name: 'Pride', desc: 'Pressing the opponent up close, counters and landed hits build Pride, boosting damage. Taking hits wounds it and retreating loses it. At max he shrugs off one light hit.' },
    vfx: { ghost: 0xc89aff, trail: 0xd8b8ff, dashGhost: true },
    audio: { strikePitch: 1.05, heavyPitch: 0.95 },
    ai: { personality: 'aggressive', aggression: 0.82, defense: 0.5, ranged: 0.3, beam: 0.5, transformHp: 0.55, preferredRange: 2, hooks: 'vegeta' },
    barks: { combo: 'vegeta_combo', hurt: 'vegeta_hurt', lowHp: 'vegeta_lowHp', reactTransform: 'vegeta_reactTransform', counter: 'vegeta_counter', taunt: 'vegeta_taunt' },
    sequences: {
      intro: [
        { pose: 'v_scouterTap', dur: 0.75, speed: 9, expression: 'calm', needs: 'scouter' },
        { pose: 'v_intro', dur: 0.6, speed: 8, expression: 'angry' },
        { pose: 'v_chinUp', dur: 1.2, speed: 6, expression: 'smirk' },
      ],
      victory: [
        [{ pose: 'v_victoryPoint', dur: 1.1, speed: 9, expression: 'smirk' }, { pose: 'v_turnAway', dur: 9, speed: 4, expression: 'smirk' }],
        [{ pose: 'v_chinUp', dur: 9, speed: 5, expression: 'smirk' }],
      ],
      defeat: [
        { pose: 'defeatKneel', dur: 0.7, speed: 8, expression: 'hurt' },
        { pose: 'v_defeatPound', dur: 9, speed: 7, expression: 'grit' },
      ],
    },
    intro: { pose: 'v_intro', expression: 'smirk' },
    victory: { poses: ['v_victory', 'v_victoryPoint'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'angry' },
  };
  // SUPER SAIYAN BLUE and BLUE EVOLUTION fight differently from each other, not only harder (ToP refinement brief §12–13):
  // Blue is fast, direct and efficient — the same blows, recovered from sooner and cancelled earlier; Evolution is the
  // high-pressure state — the blows come out sooner and hit the guard harder, the heavies faster to land
  {
    const V = SL.data.characters.vegeta;
    const form = (id) => V.forms.find((f) => f.id === id);
    const heavy = (fn) => Object.fromEntries(Object.entries(V.moves.heavy).map(([k, m]) => [k, fn(m)]));
    const blue = form('blue'), evo = form('blueEvo');
    if (blue) {
      blue.moves = {
        light: V.moves.light.map((m) => Object.assign({}, m, { recovery: Math.max(6, m.recovery - 2), cancel: Math.max(3, (m.cancel || m.recovery) - 1) })),
        heavy: heavy((m) => Object.assign({}, m, { recovery: Math.max(10, m.recovery - 3) })),
      };
    }
    if (evo) {
      evo.moves = {
        // (a longer lunge and a harder knock were tried: the pressure carried him off the platform and into Toppo's spheres)
        light: V.moves.light.map((m) => Object.assign({}, m, { startup: Math.max(3, m.startup - 1), recovery: Math.max(6, m.recovery - 2) })),
        heavy: heavy((m) => Object.assign({}, m, { startup: Math.max(5, m.startup - 2), guardDamage: m.guardDamage && Math.round(m.guardDamage * 1.3) })),
      };
    }
  }
})();
