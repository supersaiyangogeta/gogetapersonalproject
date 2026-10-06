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
         * MAJIN: seven years later, and the thing he lets Babidi do to him is not a power-up he
         * earned: it is a decision. A distinct state, not Super Saiyan 2 with a mark on it:
         *   - look: Super Saiyan 2 hair, Babidi's "M" on the forehead (it belongs to this state,
         *     not to an outfit: it comes and goes with it), a colder cast, gold aura with crimson
         *     edges and the lightning;
         *   - body: a hunched, leashed stance instead of the crossed arms (the form's idle);
         *   - fighting: reckless — heavies that do not stop for your blows (armor), a string that
         *     trades, and a CPU that barely guards and never breathes for long;
         *   - voice: his barks are not the prince's (form.barks).
         * Story-locked, so the wheel never offers it; "The Mark" is the only way in.
         */
        id: 'majin', name: 'Majin', short: 'MAJIN', kiCost: 60, style: 'full', storyLocked: true,
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
         * Flash puts him in it); its numbers are Super Saiyan's — the story sets what the fight needs.
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
    ],
    poses,
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
      },
      ultimate: {
        id: 'finalFlash', name: 'Final Flash', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 70, chargeMax: 70, damage: [5000, 5000], radius: [1.9, 1.9], speed: 120, range: 180, sustain: 55,
        color: 0xffe14a, core: 0xffffff, poses: { charge: 'v_finalFlashCharge', fire: 'beamFire' }, recovery: 36, armor: false, cinematic: true,
      },
    },
    mechanic: { type: 'pride', name: 'Pride', desc: 'Pressing the opponent up close, counters and landed hits build Pride, boosting damage. Taking hits wounds it and retreating loses it. At max he shrugs off one light hit.' },
    vfx: { ghost: 0xc89aff, trail: 0xd8b8ff, dashGhost: true },
    audio: { strikePitch: 1.05, heavyPitch: 0.95 },
    ai: { personality: 'aggressive', aggression: 0.82, defense: 0.5, ranged: 0.3, beam: 0.5, transformHp: 0.55, preferredRange: 2, hooks: 'vegeta' },
    barks: { combo: 'vegeta_combo', hurt: 'vegeta_hurt', lowHp: 'vegeta_lowHp', reactTransform: 'vegeta_reactTransform', counter: 'vegeta_counter', taunt: 'vegeta_taunt' },
    sequences: {
      intro: [
        { pose: 'v_scouterTap', dur: 0.75, speed: 9, expression: 'calm' },
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
})();
