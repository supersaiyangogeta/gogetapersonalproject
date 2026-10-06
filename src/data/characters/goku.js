/*
 * GOKU (Saiyan Saga) — V0.2 showcase character.
 * Identity: loose, bouncing, adaptive martial artist. Fast strings that
 * branch into a rapid flurry or an Instant-Transmission axe kick, aerial
 * pursuit, Kamehameha with charge tiers, Instant Transmission with four
 * directions, leveled Kaioken, a full Super Saiyan event, scalable Spirit Bomb.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    idle: (t) => {
      const b = Math.sin(t * 5.2);
      return {
        root: { y: -0.06 + b * 0.015 },
        hips: [0, -18, 0], spine: [4, 6, 0], chest: [8, 14, 0], head: [-6, 6, 0],
        shoulderL: [-56, 0, 10], elbowL: [-100, 0, 0], shoulderR: [-32, 0, -12], elbowR: [-122, 0, 0],
        thighL: [-22, 14, 10], kneeL: [28 + b * 3, 0, 0], footL: [-6, 0, 0],
        thighR: [16, -10, -10], kneeR: [24 + b * 3, 0, 0], footR: [-14, 0, 0],
      };
    },
    // light, confident hover: one knee up, hands loose and open
    flyIdle: (t) => {
      const s = Math.sin(t * 2.4);
      return {
        hands: ['open', 'fist'],
        root: { y: 0.03 * s, rz: s * 2 },
        spine: [2, 6, 0], chest: [0, 8, 0], head: [-4, -4, 0],
        shoulderL: [-26, 0, 24 + s * 3], elbowL: [-60, 0, 0], shoulderR: [-38, 0, -14 - s * 2], elbowR: [-96, 0, 0],
        thighL: [-44 + s * 3, 0, 6], kneeL: [80, 0, 0], footL: [35, 0, 0],
        thighR: [-8 - s * 3, 0, -6], kneeR: [30, 0, 0], footR: [45, 0, 0],
      };
    },
    // Goku flies with one fist leading
    flyForward: (t) => {
      const s = Math.sin(t * 9);
      return {
        root: { rx: 70 },
        spine: [-4, 0, 0], chest: [-6, 4, 0], neck: [-26, 0, 0], head: [-36, 0, 0],
        shoulderR: [-168, 0, -8], elbowR: [-12, 0, 0], shoulderL: [24, 0, 12], elbowL: [-24, 0, 0],
        thighL: [6 + s * 3, 0, 4], kneeL: [20, 0, 0], footL: [55, 0, 0],
        thighR: [2 - s * 3, 0, -4], kneeR: [34, 0, 0], footR: [55, 0, 0],
      };
    },
    dash: {
      root: { rx: 80 },
      spine: [-6, 0, 0], neck: [-30, 0, 0], head: [-40, 0, 0],
      shoulderR: [-176, 0, -4], elbowR: [-2, 0, 0], shoulderL: [40, 0, 8], elbowL: [-10, 0, 0],
      thighL: [8, 0, 3], kneeL: [12, 0, 0], footL: [60, 0, 0], thighR: [4, 0, -3], kneeR: [22, 0, 0], footR: [60, 0, 0],
    },
    // boxer shell guard: forearms vertical, chin tucked
    guard: {
      root: { y: -0.06 },
      spine: [10, 0, 0], chest: [12, 0, 0], head: [16, 0, 0],
      shoulderL: [-70, 0, -18], elbowL: [-138, 0, 0], shoulderR: [-70, 0, 18], elbowR: [-138, 0, 0],
      thighL: [-24, 10, 10], kneeL: [38, 0, 0], footL: [-10, 0, 0], thighR: [10, -10, -10], kneeR: [32, 0, 0], footR: [-15, 0, 0],
    },
    charge: (t) => {
      const s = Math.sin(t * 34) * 1.5;
      return {
        root: { y: -0.16 },
        spine: [2, 0, 0], chest: [-8 + s, 0, 0], neck: [-10, 0, 0], head: [-22, 0, 0],
        shoulderL: [8, 0, 26 + s], elbowL: [-84, 0, 0], shoulderR: [8, 0, -26 - s], elbowR: [-84, 0, 0],
        thighL: [-20, 0, 26], kneeL: [44, 0, 0], footL: [-14, 0, -14], thighR: [-20, 0, -26], kneeR: [44, 0, 0], footR: [-14, 0, 14],
      };
    },
    g_jabW: {
      root: { y: -0.06 }, hips: [0, -14, 0], chest: [6, -6, 0],
      shoulderL: [-40, 0, 16], elbowL: [-125, 0, 0], shoulderR: [-34, 0, -14], elbowR: [-118, 0, 0],
      thighL: [-24, 14, 10], kneeL: [32, 0, 0], thighR: [16, -10, -10], kneeR: [26, 0, 0],
    },
    g_jab: {
      root: { y: -0.08, rx: 6 }, hips: [0, -20, 0], spine: [4, -10, 0], chest: [6, -24, 0], head: [-6, 22, 0],
      shoulderL: [-88, 0, -6], elbowL: [-6, 0, 0], shoulderR: [-40, 0, -16], elbowR: [-115, 0, 0],
      thighL: [-36, 14, 10], kneeL: [40, 0, 0], thighR: [24, -10, -10], kneeR: [18, 0, 0],
    },
    g_crossW: {
      root: { y: -0.07 }, hips: [0, -26, 0], chest: [6, -22, 0], head: [0, 20, 0],
      shoulderR: [-20, 0, -26], elbowR: [-130, 0, 0], shoulderL: [-60, 0, 8], elbowL: [-90, 0, 0],
      thighL: [-30, 14, 10], kneeL: [36, 0, 0], thighR: [20, -10, -10], kneeR: [24, 0, 0],
    },
    g_cross: {
      root: { y: -0.08, rx: 8 }, hips: [0, 12, 0], spine: [6, 12, 0], chest: [6, 30, 0], head: [-8, -26, 0],
      shoulderR: [-88, 0, 6], elbowR: [-4, 0, 0], shoulderL: [-35, 0, 22], elbowL: [-112, 0, 0],
      thighL: [-40, 10, 10], kneeL: [44, 0, 0], thighR: [26, -6, -10], kneeR: [16, 0, 0],
    },
    g_crossF: {
      root: { y: -0.07, rx: 4 }, hips: [0, 18, 0], spine: [4, 16, 0], chest: [4, 38, 0], head: [-6, -30, 0],
      shoulderR: [-70, 0, 24], elbowR: [-30, 0, 0], shoulderL: [-30, 0, 26], elbowL: [-110, 0, 0],
      thighL: [-36, 10, 10], kneeL: [40, 0, 0], thighR: [24, -6, -10], kneeR: [20, 0, 0],
    },
    g_elbowW: {
      root: { y: -0.07 }, hips: [0, 10, 0], chest: [6, 20, 0], head: [0, -16, 0],
      shoulderL: [-60, 0, 44], elbowL: [-150, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-110, 0, 0],
      thighL: [-30, 14, 10], kneeL: [36, 0, 0], thighR: [20, -10, -10], kneeR: [24, 0, 0],
    },
    g_elbow: {
      root: { y: -0.09, rx: 8 }, hips: [0, -24, 0], spine: [4, -14, 0], chest: [10, -38, 0], head: [-6, 34, 0],
      shoulderL: [-86, 0, -38], elbowL: [-150, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-100, 0, 0],
      thighL: [-42, 14, 12], kneeL: [48, 0, 0], thighR: [26, -10, -10], kneeR: [20, 0, 0],
    },
    g_kickW: {
      root: { y: -0.02, rx: -6 }, hips: [0, 10, 0], chest: [-6, -12, 0],
      shoulderL: [-50, 0, 26], elbowL: [-100, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-100, 0, 0],
      thighR: [-90, 0, -12], kneeR: [122, 0, 0], thighL: [-8, 0, 6], kneeL: [22, 0, 0],
    },
    g_kick: {
      root: { y: 0, rx: -8, rz: 18 }, hips: [0, 46, 0], spine: [-4, -12, 0], chest: [-10, -26, 0], head: [8, -20, 0],
      shoulderL: [-30, 0, 42], elbowL: [-70, 0, 0], shoulderR: [-10, 0, -52], elbowR: [-60, 0, 0],
      thighR: [-98, 0, -38], kneeR: [6, 0, 0], footR: [40, 0, 0], thighL: [6, 0, 6], kneeL: [16, 0, 0],
    },
    g_sideKickW: {
      root: { y: -0.02, rx: -10 }, chest: [-16, 0, 0],
      shoulderL: [-40, 0, 36], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -36], elbowR: [-90, 0, 0],
      thighR: [-88, 0, -20], kneeR: [132, 0, 0], thighL: [-6, 0, 6], kneeL: [26, 0, 0],
    },
    g_sideKick: {
      root: { y: 0, rx: -20 }, chest: [-18, 0, 0], head: [16, 0, 0],
      shoulderL: [-10, 0, 46], elbowL: [-50, 0, 0], shoulderR: [0, 0, -46], elbowR: [-50, 0, 0],
      thighR: [-94, 0, -4], kneeR: [2, 0, 0], footR: [-24, 0, 0], thighL: [10, 0, 6], kneeL: [22, 0, 0],
    },
    g_spinKickW: {
      root: { y: -0.1 }, hips: [0, -60, 0], spine: [6, -20, 0], chest: [8, -30, 0], head: [0, 70, 0],
      shoulderL: [-30, 0, 50], elbowL: [-80, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-100, 0, 0],
      thighL: [-30, 0, 10], kneeL: [50, 0, 0], thighR: [0, 0, -10], kneeR: [50, 0, 0],
    },
    g_spinKick: {
      root: { y: 0.02, rz: -26 }, hips: [0, 90, 0], spine: [-4, 30, 0], chest: [-8, 40, 0], head: [10, -90, 0],
      shoulderL: [-20, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -60], elbowR: [-40, 0, 0],
      thighL: [-82, 0, 58], kneeL: [4, 0, 0], footL: [30, 0, 0], thighR: [4, 0, -6], kneeR: [20, 0, 0],
    },
    g_flurry: (t) => {
      const ph = Math.floor(t * 15) % 2;
      const l = ph === 0, s = Math.sin(t * 40) * 3;
      return {
        root: { y: -0.1, rx: 10 }, hips: [0, l ? -12 : 12, 0], spine: [8, l ? -10 : 10, 0], chest: [8, l ? -24 : 24, 0], head: [-10, l ? 16 : -16, 0],
        shoulderL: [l ? -90 + s : -40, 0, l ? -4 : 20], elbowL: [l ? -6 : -110, 0, 0],
        shoulderR: [l ? -40 : -90 + s, 0, l ? -20 : 4], elbowR: [l ? -110 : -6, 0, 0],
        thighL: [-40, 12, 12], kneeL: [52, 0, 0], thighR: [24, -8, -12], kneeR: [24, 0, 0],
      };
    },
    g_axeKickW: {
      root: { y: 0.1, rx: -18 }, spine: [-12, 0, 0], chest: [-14, 0, 0], head: [22, 0, 0],
      shoulderL: [-20, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-60, 0, 0],
      thighR: [-168, 0, -6], kneeR: [8, 0, 0], footR: [20, 0, 0], thighL: [14, 0, 6], kneeL: [30, 0, 0],
    },
    g_axeKick: {
      root: { y: -0.05, rx: 34 }, spine: [18, 0, 0], chest: [14, 0, 0], head: [0, 0, 0],
      shoulderL: [10, 0, 44], elbowL: [-40, 0, 0], shoulderR: [10, 0, -44], elbowR: [-40, 0, 0],
      thighR: [-40, 0, -6], kneeR: [4, 0, 0], footR: [50, 0, 0], thighL: [30, 0, 6], kneeL: [40, 0, 0],
    },
    g_flyingKnee: {
      root: { rx: 22 }, spine: [6, 0, 0], head: [-26, 0, 0],
      shoulderL: [30, 0, 22], elbowL: [-40, 0, 0], shoulderR: [30, 0, -22], elbowR: [-40, 0, 0],
      thighR: [-112, 0, -4], kneeR: [140, 0, 0], thighL: [22, 0, 6], kneeL: [60, 0, 0],
    },
    g_airUpperW: {
      root: { y: -0.08, rx: 20 }, chest: [20, -20, 0], head: [-10, 20, 0],
      shoulderR: [20, 0, -20], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-80, 0, 0],
      thighL: [-80, 0, 10], kneeL: [110, 0, 0], thighR: [-40, 0, -10], kneeR: [90, 0, 0],
    },
    // Kamehameha: cupped hands drawn back to the hip, crouching deeper as it grows
    g_kameCharge: (t, f) => {
      const tier = f && f.sd && f.sd.tier ? f.sd.tier : 0;
      const s = Math.sin(t * (30 + tier * 12)) * (0.8 + tier * 0.8);
      const d = tier * 4;
      return {
        hands: ['open', 'open'],
        root: { y: -0.12 - tier * 0.04 },
        hips: [0, -24, 0], spine: [6 + d * 0.3, -20, 0], chest: [8 + d * 0.4, -40 + s, 0], head: [-4, 60, 0],
        shoulderR: [34 + d, 0, -6], elbowR: [-100, 0, 0], handR: [0, 0, 26],
        shoulderL: [-14, 0, -62], elbowL: [-104, 0, 0], handL: [0, 0, -26],
        thighL: [-34 - d, 22, 14], kneeL: [44 + d * 2, 0, 0], footL: [-10, 0, 0], thighR: [20, 22, -16], kneeR: [36 + d, 0, 0], footR: [-14, 0, 0],
      };
    },
    g_kameFire: (t) => {
      const s = Math.sin(t * 50) * 1.6;
      return {
        hands: ['open', 'open'],
        root: { y: -0.14, rx: -2 },
        hips: [0, 6, 0], spine: [4, 4, 0], chest: [2, 6, 0], head: [2, -4, 0],
        shoulderL: [-88 + s, 0, -7], elbowL: [-2, 0, 0], handL: [-66, 0, -14],
        shoulderR: [-88 - s, 0, 7], elbowR: [-2, 0, 0], handR: [-66, 0, 14],
        thighL: [-40, 0, 14], kneeL: [52, 0, 0], footL: [-12, 0, 0], thighR: [30, 0, -12], kneeR: [22, 0, 0], footR: [-14, 0, 0],
      };
    },
    g_spiritRaise: (t) => {
      const s = Math.sin(t * 6) * 2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.02 }, chest: [-12, 0, 0], neck: [-14, 0, 0], head: [-34, 0, 0],
        shoulderL: [-176 + s, 0, 14], elbowL: [-6, 0, 0], handL: [-20, 0, 0], shoulderR: [-176 - s, 0, -14], elbowR: [-6, 0, 0], handR: [-20, 0, 0],
        thighL: [-12, 0, 12], kneeL: [20, 0, 0], thighR: [8, 0, -12], kneeR: [16, 0, 0],
      };
    },
    g_spiritThrow: {
      hands: ['open', 'open'],
      root: { y: -0.08, rx: 14 }, spine: [16, 0, 0], chest: [20, 0, 0], head: [-18, 0, 0],
      shoulderL: [-100, 0, -8], elbowL: [-10, 0, 0], shoulderR: [-100, 0, 8], elbowR: [-10, 0, 0],
      thighL: [-40, 0, 12], kneeL: [50, 0, 0], thighR: [24, 0, -12], kneeR: [24, 0, 0],
    },
    // Super Saiyan choreography
    g_ssjClench: (t) => {
      const s = Math.sin(t * 60) * 1.4;
      return {
        root: { y: -0.14, rx: 8 },
        spine: [18, 0, 0], chest: [16 + s, 0, 0], neck: [10, 0, 0], head: [12, 0, 0],
        shoulderL: [-40, 0, 30 + s], elbowL: [-120, 0, 0], shoulderR: [-40, 0, -30 - s], elbowR: [-120, 0, 0],
        thighL: [-30, 0, 18], kneeL: [52, 0, 0], footL: [-20, 0, 0], thighR: [-30, 0, -18], kneeR: [52, 0, 0], footR: [-20, 0, 0],
      };
    },
    g_ssjRage: (t) => {
      const s = Math.sin(t * 70) * 2.4;
      return {
        root: { y: -0.08, rx: -6 },
        spine: [-12, 0, 0], chest: [-24 + s, 0, 0], neck: [-18, 0, 0], head: [-40, 0, 0],
        shoulderL: [30, 0, 44 + s], elbowL: [-40, 0, 0], shoulderR: [30, 0, -44 - s], elbowR: [-40, 0, 0],
        thighL: [-10, 0, 26], kneeL: [26, 0, 0], footL: [-10, 0, -14], thighR: [-10, 0, -26], kneeR: [26, 0, 0], footR: [-10, 0, 14],
      };
    },
    /*
     * The Angry Kamehameha, thrown over his shoulder at a man behind him: the body is already
     * turned away, the firing arm is swung back along the line to him, the free fist is up,
     * and the head is turned to look down the arm. (Owner reference: the "You fool!!" panel.)
     */
    g_angryKame: (t) => {
      const s = Math.sin(t * 46) * 1.8;
      return {
        hands: ['open', 'fist'],
        root: { y: -0.12, rx: 6 },
        hips: [0, 34, 0], spine: [-6, 30, 0], chest: [-10 + s * 0.4, 40, 0], neck: [-4, -22, 0], head: [-6, -34, 0],
        shoulderR: [-84 - s, 0, 14], elbowR: [0, 0, 0], handR: [-78, 0, 6],
        shoulderL: [28, 0, 64 + s], elbowL: [-142, 0, 0], handL: [-12, 0, 0],
        thighL: [-30, 16, 16], kneeL: [40, 0, 0], footL: [-12, 0, 0], thighR: [24, 10, -18], kneeR: [30, 0, 0], footR: [-16, 0, 0],
      };
    },
    /* After it lands: nothing left to say to him, looking down at what is there. */
    g_lookDown: (t) => {
      const b = Math.sin(t * 2.2) * 1.2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.04 + b * 0.004 },
        spine: [6, 0, 0], chest: [8 + b * 0.3, 0, 0], neck: [16, 0, 0], head: [26, -6, 0],
        shoulderL: [-6, 0, 12], elbowL: [-22, 0, 0], handL: [0, 0, 0],
        shoulderR: [-6, 0, -12], elbowR: [-20, 0, 0], handR: [0, 0, 0],
        thighL: [-6, 4, 10], kneeL: [12, 0, 0], footL: [-6, 0, 0], thighR: [4, -4, -10], kneeR: [10, 0, 0], footR: [-6, 0, 0],
      };
    },
    /*
     * SUPER SAIYAN 2 body language: not the loose, bouncing stance of the man who enjoys a fight
     * but a low, square, coiled one — weight forward, fists tight and close, chin down. It is
     * the stance the form fights from (the form's idle), so the change reads before he moves.
     */
    g2_stance: (t) => {
      const b = Math.sin(t * 6.4);
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.1 + b * 0.008 },
        hips: [0, -26, 0], spine: [10, 8, 0], chest: [12, 18, 0], neck: [6, 0, 0], head: [4, 8, 0],
        shoulderL: [-70, 0, 14], elbowL: [-118, 0, 0], shoulderR: [-40, 0, -16], elbowR: [-128, 0, 0],
        thighL: [-30, 18, 14], kneeL: [40 + b * 2, 0, 0], footL: [-10, 0, 0],
        thighR: [22, -12, -14], kneeR: [34 + b * 2, 0, 0], footR: [-18, 0, 0],
      };
    },
    // SUPER SAIYAN GOD (Battle of Gods): not a fighting crouch — loose, upright, open hands low and a little
    // forward, the weight light on the balls of the feet; the calm of someone who no longer has to try
    g_godStance: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        hands: ['open', 'open'],
        root: { y: -0.05 + b * 0.006 },
        hips: [0, -14, 0], spine: [2, 6, 0], chest: [0, 10, 0], neck: [0, 0, 0], head: [-2, 6, 0],
        shoulderL: [-34, 0, 18], elbowL: [-74, 0, 0], shoulderR: [-18, 0, -20], elbowR: [-58, 0, 0],
        thighL: [-18, 12, 10], kneeL: [22, 0, 0], footL: [-4, 0, 0],
        thighR: [12, -8, -10], kneeR: [18, 0, 0], footR: [-8, 0, 0],
      };
    },
    // the God Ki settling: eyes closed, hands open at his sides, breathing it in
    g_godCalm: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        hands: ['open', 'open'],
        root: { y: 0.01 * b }, spine: [-2, 0, 0], chest: [-4 + b * 2, 0, 0], head: [-6, 0, 0],
        shoulderL: [-8, 0, 22], elbowL: [-14, 0, 0], shoulderR: [-8, 0, -22], elbowR: [-14, 0, 0],
        thighL: [-4, 0, 6], kneeL: [6, 0, 0], thighR: [-4, 0, -6], kneeR: [6, 0, 0],
      };
    },
    // the ascent to the second level: pulled up and back, the scream going straight up
    g2_ascend: (t) => {
      const s = Math.sin(t * 80) * 2.6;
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.04, rx: -10 },
        spine: [-18, 0, 0], chest: [-28 + s, 0, 0], neck: [-22, 0, 0], head: [-46, 0, 0],
        shoulderL: [40, 0, 50 + s], elbowL: [-30, 0, 0], shoulderR: [40, 0, -50 - s], elbowR: [-30, 0, 0],
        thighL: [-14, 0, 30], kneeL: [30, 0, 0], footL: [-10, 0, -16], thighR: [-14, 0, -30], kneeR: [30, 0, 0], footR: [-10, 0, 16],
      };
    },
    g2_elbowW: {
      hands: ['fist', 'fist'],
      root: { y: -0.08 }, hips: [0, 30, 0], spine: [4, 20, 0], chest: [6, 24, 0], head: [2, -30, 0],
      shoulderR: [-40, 0, -70], elbowR: [-140, 0, 0], shoulderL: [-60, 0, 20], elbowL: [-110, 0, 0],
      thighL: [-24, 10, 14], kneeL: [34, 0, 0], thighR: [18, -8, -12], kneeR: [26, 0, 0],
    },
    g2_elbow: {
      hands: ['fist', 'fist'],
      root: { y: -0.1, rx: 6 }, hips: [0, -30, 0], spine: [10, -28, 0], chest: [10, -34, 0], head: [-4, 30, 0],
      shoulderR: [-90, 0, 40], elbowR: [-140, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-110, 0, 0],
      thighL: [-36, 10, 14], kneeL: [44, 0, 0], thighR: [24, -8, -12], kneeR: [20, 0, 0],
    },
    // the third level: roaring straight at the sky, fists at the hips, the whole body shaking
    g3_ascend: (t) => {
      const s = Math.sin(t * 90) * 3;
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.12, rx: -4 },
        spine: [-10, 0, s * 0.5], chest: [-20 + s, 0, 0], neck: [-24, 0, 0], head: [-52, 0, 0],
        shoulderL: [20, 0, 34 + s], elbowL: [-70, 0, 0], shoulderR: [20, 0, -34 - s], elbowR: [-70, 0, 0],
        thighL: [-22, 0, 28], kneeL: [44, 0, 0], footL: [-14, 0, -18], thighR: [-22, 0, -28], kneeR: [44, 0, 0], footR: [-14, 0, 18],
      };
    },
    g_ssjReveal: {
      root: { y: -0.02 },
      spine: [2, 0, 0], chest: [2, 8, 0], head: [8, -6, 0],
      shoulderL: [-10, 0, 16], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -14], elbowR: [-80, 0, 0],
      thighL: [-8, 6, 12], kneeL: [10, 0, 0], thighR: [6, -6, -12], kneeR: [8, 0, 0],
    },
    // intro / victory / defeat
    g_introStretch: {
      hands: ['open', 'open'],
      root: { y: 0.02 }, chest: [-10, 0, 0], head: [-16, 0, 0],
      shoulderL: [-170, 0, -20], elbowL: [-40, 0, 0], shoulderR: [-170, 0, 20], elbowR: [-40, 0, 0],
      thighL: [-2, 0, 9], kneeL: [2, 0, 0], thighR: [2, 0, -9], kneeR: [2, 0, 0],
    },
    g_introShoulder: {
      root: { y: -0.02 }, chest: [4, 20, 10], head: [0, -20, -16],
      shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0], shoulderR: [-60, 0, -30], elbowR: [-110, 0, 0],
      thighL: [-6, 0, 10], kneeL: [8, 0, 0], thighR: [4, 0, -10], kneeR: [6, 0, 0],
    },
    g_introPalm: {
      hands: ['open', 'fist'],
      root: { y: -0.04 }, chest: [6, 0, 0], head: [-4, 0, 0],
      shoulderL: [-70, 0, -30], elbowL: [-100, 0, 0], handL: [0, 0, -40], shoulderR: [-66, 0, 28], elbowR: [-104, 0, 0],
      thighL: [-16, 10, 12], kneeL: [20, 0, 0], thighR: [10, -8, -12], kneeR: [16, 0, 0],
    },
    // FUTURE TRUNKS' TEST (Chapter 5): one finger up, and every cut stops on it. g_finger is the
    // wait; the two blocks alternate high and low so a string of cuts reads as a string of stops.
    g_finger: (t) => ({
      hands: ['fist', 'point'],
      root: { y: -0.01 + Math.sin(t * 1.8) * 0.004 }, chest: [0, 6, 0], head: [-4, -4, 0],
      shoulderR: [-70, 0, -18], elbowR: [-96, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
      thighL: [-6, 4, 10], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [6, 0, 0],
    }),
    g_fingerBlock: {
      hands: ['fist', 'point'],
      root: { y: -0.02 }, chest: [-2, 10, 0], head: [-10, -6, 0],
      shoulderR: [-120, 0, -10], elbowR: [-70, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
      thighL: [-8, 4, 10], kneeL: [10, 0, 0], thighR: [4, -4, -10], kneeR: [6, 0, 0],
    },
    g_fingerBlock2: {
      hands: ['fist', 'point'],
      root: { y: -0.03 }, chest: [2, -8, 0], head: [2, 6, 0],
      shoulderR: [-60, 0, -40], elbowR: [-70, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
      thighL: [-8, 4, 10], kneeL: [10, 0, 0], thighR: [4, -4, -10], kneeR: [6, 0, 0],
    },
    // the medicine in his hand: he looks at it for a while
    g_lookMed: {
      hands: ['fist', 'fist'],
      root: { y: -0.01 }, chest: [6, 0, 0], head: [22, 0, 0],
      shoulderR: [-56, 0, -8], elbowR: [-78, 0, 0], handR: [-20, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
      thighL: [-6, 4, 10], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [6, 0, 0],
    },
    g_wave: (t) => ({
      hands: ['fist', 'open'],
      root: { y: -0.01 }, chest: [-4, 0, 0], head: [-10, 0, 0],
      shoulderR: [-160, 0, -26 + Math.sin(t * 8) * 12], elbowR: [-26, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
      thighL: [-6, 4, 10], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [6, 0, 0],
    }),
    g_victory: {
      chest: [-6, 0, 0], head: [-6, 0, 0],
      shoulderL: [-148, 0, 62], elbowL: [-150, 0, 0], shoulderR: [-148, 0, -62], elbowR: [-150, 0, 0],
      thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
    },
    g_victoryHop: {
      root: { y: 0.12 }, chest: [-10, 0, 0], head: [-14, 0, 0],
      shoulderR: [-176, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-70, 0, 0],
      thighL: [-40, 0, 8], kneeL: [70, 0, 0], thighR: [-20, 0, -8], kneeR: [40, 0, 0],
    },
    g_peace: {
      hands: ['fist', 'point'],
      chest: [-4, 10, 0], head: [-6, -10, 6],
      shoulderR: [-120, 0, -24], elbowR: [-30, 0, 0], shoulderL: [-8, 0, 36], elbowL: [-110, 0, 0], handL: [0, 0, 40],
      thighL: [-6, 0, 9], kneeL: [6, 0, 0], thighR: [4, 0, -9], kneeR: [4, 0, 0],
    },
    g_defeatStagger: C.hitBody,
    g_defeatKnee: {
      hands: ['open', 'fist'],
      root: { y: -0.5, rx: 18 },
      spine: [26, 0, 0], chest: [16, 0, 0], neck: [10, 0, 0], head: [-10, 0, 0],
      shoulderL: [-70, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-10, 0, -10], elbowR: [-40, 0, 0],
      thighL: [-94, 0, 6], kneeL: [96, 0, 0], thighR: [14, 0, -6], kneeR: [118, 0, 0], footR: [40, 0, 0],
    },
    // Kaioken activation: fists clenched low, body flexed, a red burst
    g_kaiokenFlex: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.16 }, spine: [10, 0, 0], chest: [16 + s, 0, 0], neck: [6, 0, 0], head: [-10, 0, 0],
        shoulderL: [-20, 0, 34], elbowL: [-70, 0, 0], shoulderR: [-20, 0, -34], elbowR: [-70, 0, 0],
        thighL: [-34, 0, 20], kneeL: [52, 0, 0], thighR: [16, 0, -20], kneeR: [40, 0, 0],
      };
    },
    // story (Chapter 1) poses
    g_tailGrab: {
      hands: ['fist', 'fist'],
      root: { y: -0.16, rx: 12 }, spine: [16, 0, 0], chest: [22, 0, 0], head: [-26, 0, 0],
      shoulderL: [-62, 0, 8], elbowL: [-24, 0, 0], shoulderR: [-56, 0, -8], elbowR: [-30, 0, 0],
      thighL: [-44, 0, 12], kneeL: [52, 0, 0], thighR: [32, 0, -12], kneeR: [14, 0, 0],
    },
    g_fullNelson: (t) => {
      const s = Math.sin(t * 22) * 2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.08 }, spine: [8, 0, 0], chest: [10 + s, 0, 0], head: [-6, 0, 0],
        shoulderL: [-128, 0, 30], elbowL: [-118, 0, 0], shoulderR: [-128, 0, -30], elbowR: [-118, 0, 0],
        thighL: [-24, 0, 14], kneeL: [34, 0, 0], thighR: [18, 0, -14], kneeR: [20, 0, 0],
      };
    },
    g_pierced: {
      hands: ['open', 'open'],
      root: { y: -0.05, rx: -14 }, spine: [-12, 0, 0], chest: [-24, 0, 0], head: [-30, 0, 0],
      shoulderL: [-50, 0, 60], elbowL: [-20, 0, 0], shoulderR: [-50, 0, -60], elbowR: [-20, 0, 0],
      thighL: [-10, 0, 10], kneeL: [26, 0, 0], thighR: [4, 0, -10], kneeR: [30, 0, 0],
    },
    g_resolve: {
      hands: ['fist', 'fist'],
      root: { y: -0.1 }, chest: [6, 0, 0], head: [-8, 0, 0],
      shoulderL: [-30, 0, 30], elbowL: [-100, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-100, 0, 0],
      thighL: [-26, 0, 16], kneeL: [30, 0, 0], thighR: [16, 0, -16], kneeR: [24, 0, 0],
    },
    // STORY (Buu saga): down on one knee, arms open, for a son he is meeting for the first time
    g_kneelOpen: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.42, rx: 4 }, spine: [8, 0, 0], chest: [0, 0, 0], head: [2 + b, 0, 0],
        shoulderL: [-52, 0, 58], elbowL: [-22, 0, 0], shoulderR: [-52, 0, -58], elbowR: [-22, 0, 0],
        thighL: [-86, 0, 10], kneeL: [96, 0, 0], thighR: [4, 0, -10], kneeR: [110, 0, 0], footR: [-30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ...and standing up with him in his arms
    g_holdKid: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [10, 0, b * 3],
        shoulderL: [-52, 0, 22], elbowL: [-100, 0, 0], shoulderR: [-48, 0, -22], elbowR: [-104, 0, 0],
        thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };
  poses.g_victoryFist = C.victory;

  SL.data.characters.goku = {
    id: 'goku',
    assetLevel: 2, // polished prototype (see SL.ASSET_LEVELS)
    name: 'Goku',
    fullName: 'Son Goku',
    era: 'Saiyan Saga',
    playable: true,
    style: 'Balanced',
    blurb: 'Adaptive martial artist who grows stronger in every fight.',
    ratings: { power: 3, speed: 4, ki: 4, defense: 3 },
    stats: { hp: 14000, ki: 100, stamina: 100, speed: 1.02, power: 1.05, defense: 1.02, weight: 1.0, kiRegen: 2.2, chargeRate: 36, canonPower: 1.0 },
    appearance: {
      height: 0.97,
      skin: 0xf6c49a,
      build: { chestW: 0.215, chestD: 0.14, shoulderX: 0.218, upperArmR: 0.061, foreArmR: 0.054, fist: 0.064, delt: 0.08, thighR: 0.088, neckR: 0.06, headR: 0.121, footLen: 1.08 },
      hair: { style: 'goku', color: 0x16161c },
      face: { pupil: 0x1c1c26, eyeW: 1.08 },
      outfit: {
        topStyle: 'gi', top: 0xf57b22, under: 0x1f3d9e, sleeves: 'short', sleeveColor: 0x1f3d9e,
        wrist: 0x1f3d9e, belt: 0x1f3d9e, pants: 0xf57b22, pantsStyle: 'gi',
        boots: 0x1d2f7a, bootTrim: 0xf1c64a, bootStyle: 'gi',
        emblem: { text: '王', fg: '#111111', bg: '#ffffff' },
      },
      portraitColor: '#f57b22',
    },
    // presentation identity
    vfx: { ghost: 0xbfe6ff, trail: 0xdff2ff },
    audio: { strikePitch: 1.12, heavyPitch: 1.0 },
    sequences: {
      intro: [
        { pose: 'g_introStretch', dur: 0.8, speed: 6, expression: 'calm' },
        { pose: 'g_introShoulder', dur: 0.55, speed: 8, expression: 'smirk' },
        { pose: 'g_introPalm', dur: 0.6, speed: 12, expression: 'grin' },
        { pose: 'idle', dur: 1, speed: 10, expression: 'smirk' },
      ],
      victory: [
        [{ pose: 'g_victoryHop', dur: 0.45, speed: 12, expression: 'grin' }, { pose: 'g_peace', dur: 9, speed: 8, expression: 'grin' }],
        [{ pose: 'g_victoryFist', dur: 0.9, speed: 8, expression: 'grin' }, { pose: 'g_victory', dur: 9, speed: 6, expression: 'grin' }],
      ],
      defeat: [
        { pose: 'g_defeatStagger', dur: 0.5, speed: 10, expression: 'hurt' },
        { pose: 'g_defeatKnee', dur: 9, speed: 5, expression: 'grit' },
      ],
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe9ff }, mult: {} },
      {
        id: 'kaioken', name: 'Kaioken', short: 'KAIOKEN', kiCost: 25, style: 'burst',
        mult: { damage: 1.12, speed: 1.15, defense: 1, kiRegen: 1, staminaRegen: 1.25, accel: 1.35 },
        drain: { hpPerSec: 20, minHpFrac: 0.12 },
        // charging ki while in Kaioken raises the multiplier (more power, more strain)
        levels: [
          { name: 'x2', mult: { damage: 1.12, speed: 1.15, accel: 1.35 }, hpPerSec: 20 },
          { name: 'x3', mult: { damage: 1.24, speed: 1.22, accel: 1.45 }, hpPerSec: 40, kiPerSec: 3, line: 'goku_kaioken3' },
          { name: 'x4', mult: { damage: 1.36, speed: 1.3, accel: 1.55 }, hpPerSec: 70, kiPerSec: 6, line: 'goku_kaioken4' },
          // Namek: the two he is not supposed to survive. Story missions decide when they exist
          // (formCaps), because on Earth against Vegeta a x10 would not be the same fight.
          { name: 'x10', mult: { damage: 1.7, speed: 1.45, accel: 1.7 }, hpPerSec: 120, kiPerSec: 9, line: 'goku_kaioken4' },
          { name: 'x20', mult: { damage: 2.1, speed: 1.6, accel: 1.85 }, hpPerSec: 190, kiPerSec: 14, line: 'goku_kaioken4' },
        ],
        // STRAIN: builds while active (faster at higher levels), lingers after powering down.
        // Above soreAt the body is sore (slower, weaker); at max the form collapses (overload).
        strain: { buildPerSec: [4.5, 9, 16, 26, 40], max: 100, recoverPerSec: 7, soreAt: 35, reentryAt: 60, overloadDamage: 0.06, overloadLockSeconds: 6, penalty: { speed: 0.85, damage: 0.9, staminaRegen: 0.6 } },
        activation: { pose: 'g_kaiokenFlex' },
        // Kaioken-only techniques
        moves: {
          heavy: {
            4: { id: 'kaiokenAssault', startup: 7, active: 26, recovery: 26, damage: 150, reach: 1.2, radius: 0.95, lunge: 26, hitstun: 20, knock: 'flinch', impact: 1, multi: [0, 5, 10, 15, 20], finish: { knock: 'smash', knockSpeed: 36, impact: 3, damage: 520 }, pose: { wind: 'g_kaiokenFlex', strike: 'g_flurry' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
          dash: { id: 'kaiokenCharge', startup: 4, active: 11, recovery: 16, damage: 820, reach: 1.25, radius: 1.0, lunge: 44, hitstun: 32, knock: 'heavy', knockSpeed: 30, impact: 3, pose: { wind: 'dash', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        // x10 and x20 exist for the Namek missions that hand them over; everywhere else the
        // technique stops at x4 (Free Battle, Training, the Saiyan saga)
        defaultLevelCap: 2,
        levelCost: 15,
        levelChargeFrames: 45,
        aura: { color: 0xff2a1e, core: 0xffc0b0, particles: 0xff5040, idle: 0.55, speed: 1.9, sharp: 0.75, steam: 0xff9a8a },
        look: { tint: 0xff1a0a, tintAmount: 0.28 },
        ghost: 0xff5a44,
        line: 'goku_kaioken',
      },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 50, style: 'full',
        mult: { damage: 1.3, speed: 1.12, defense: 1.18, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.75 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42, speed: 1.25, sharp: 0.25, sparks: 0xfff3a0 },
        look: { hair: { style: 'goku_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.06 },
        ghost: 0xffe27a,
        line: 'goku_ssj',
        reactLine: 'react_ssj',
        music: 3,
        // data-driven transformation event (frames at 60 Hz)
        sequence: {
          length: 156,
          applyAt: 100,
          steps: [
            { at: 0, pose: 'g_ssjClench', speed: 8, expression: 'grit', aura: 0.3, auraColor: 0xffffff, mood: [0.35, 0x121428, 0.9], shot: 'orbit', music: 0, sfx: 'heartbeat', rocks: true },
            { at: 26, sfx: 'heartbeat', quake: 0.12 },
            { at: 44, pose: 'g_ssjRage', speed: 6, expression: 'shout', aura: 0.85, sfx: 'ssjRise', mood: [0.72, 0x08080f, 0.6], hairFlicker: true, lightning: true, skyBolts: true },
            { at: 74, quake: 0.3, skyBolt: true },
            { at: 88, quake: 0.45, skyBolt: true },
            { at: 100, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.25, 0x2a2410, 0.3], flash: 0.85, crater: 5, hairFlicker: false, lightning: false, rocks: false },
            { at: 114, pose: 'g_ssjReveal', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.4] },
          ],
        },
      },
      {
        // SUPER SAIYAN 2 (Buu Saga): not a brighter Super Saiyan. Sharper hair with the one loose
        // bang, lightning that never stops crackling, a lower, coiled stance, shorter and meaner
        // strings, a knee that arrives from behind, and a CPU that stops playing. The story hands
        // it over in "Prince of Saiyans" (formGivenBy) and Free Battle only has it once that is
        // cleared (freeUnlock).
        id: 'ssj2', name: 'Super Saiyan 2', short: 'SUPER SAIYAN 2', kiCost: 70, style: 'full',
        freeUnlock: 'buu_pride',
        mult: { damage: 1.62, speed: 1.24, defense: 1.36, kiRegen: 2.3, chargeRate: 1.45, guardStamina: 0.72 },
        aura: { color: 0xffe25a, core: 0xffffff, particles: 0xfff3a0, idle: 0.6, speed: 1.6, sharp: 0.5, sparks: 0xbfe4ff, lightning: true },
        look: { hair: { style: 'goku_ssj2', color: 0xffd83e }, pupil: 0x14b0a0, brow: 0xe8b830, bulk: 1.08 },
        poses: { idle: poses.g2_stance },
        moves: {
          light: [
            { id: 'g2Jab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 300, reach: 1.15, radius: 0.72, lunge: 13, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_jabW', strike: 'g_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'g2Elbow', startup: 3, active: 3, recovery: 10, cancel: 5, damage: 360, reach: 1.1, radius: 0.76, lunge: 14, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'g2_elbowW', strike: 'g2_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'g2Cross', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 380, reach: 1.2, radius: 0.72, lunge: 13, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'g_crossW', strike: 'g_cross' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
            { id: 'g2Round', startup: 5, active: 4, recovery: 13, cancel: 8, damage: 480, reach: 1.4, radius: 0.85, lunge: 13, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 3, pose: { wind: 'g_kickW', strike: 'g_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          ],
          // the lightning knee: he is not in front of you any more
          dash: { id: 'g2Knee', startup: 3, active: 7, recovery: 14, damage: 900, reach: 1.3, radius: 0.95, lunge: 26, hitstun: 30, knock: 'heavy', knockSpeed: 28, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
        },
        ai: { personality: 'aggressive', aggression: 0.88, defense: 0.66, ranged: 0.34, beam: 0.5, preferredRange: 2.2 },
        intro: { pose: 'g2_stance', expression: 'angry' },
        victory: { poses: ['g2_stance'], expression: 'angry' },
        ghost: 0xfff0a0,
        line: 'goku_ssj2',
        reactLine: 'react_ssj',
        music: 5,
        // the event: the ground gives way, the sky goes, and the lightning does not stop afterwards
        sequence: {
          length: 196,
          applyAt: 132,
          steps: [
            { at: 0, pose: 'g_ssjClench', speed: 8, expression: 'grit', aura: 0.45, auraColor: 0xffe25a, mood: [0.45, 0x0e1020, 0.9], shot: 'orbit', music: 0, sfx: 'heartbeat', rocks: true, lightning: true },
            { at: 30, sfx: 'heartbeat', quake: 0.2 },
            { at: 50, pose: 'g2_ascend', speed: 6, expression: 'shout', aura: 1, sfx: 'ssjRise', mood: [0.8, 0x06060e, 0.6], skyBolts: true },
            { at: 76, quake: 0.35, skyBolt: true },
            { at: 96, quake: 0.5, skyBolt: true, sfx: 'lightning' },
            { at: 116, quake: 0.6, skyBolt: true },
            { at: 132, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.3, 0x202410, 0.3], flash: 0.95, crater: 7, rocks: false },
            { at: 150, pose: 'g2_stance', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.4] },
          ],
        },
      },
      {
        // SUPER SAIYAN 3 (Buu Saga): the mane, no eyebrows, the biggest aura in the game so far —
        // and a body that cannot hold it: the form burns ki every second (drain.kiPerSec) and
        // natural ki recovery stops; charge to keep it, or it drops you back to base. The story
        // hands it over in "The Third Level"; Free Battle has it once that is cleared.
        id: 'ssj3', name: 'Super Saiyan 3', short: 'SUPER SAIYAN 3', kiCost: 90, style: 'full',
        freeUnlock: 'buu_ssj3',
        mult: { damage: 2.05, speed: 1.3, defense: 1.5, kiRegen: 0, chargeRate: 1.15, guardStamina: 0.8 },
        drain: { kiPerSec: 5.5 },
        aura: { color: 0xffd23a, core: 0xffffff, particles: 0xfff0a0, idle: 0.8, speed: 1.9, sharp: 0.7, sparks: 0xbfe4ff, lightning: true },
        look: { hair: { style: 'goku_ssj3', color: 0xffd23a }, pupil: 0x14b0a0, pupilScale: 0.55, brow: 0xf6c49a, bulk: 1.1, headExtras: SL.data.ssj3Brow(0xf6c49a) },
        poses: { idle: poses.g2_stance },
        moves: {
          dash: { id: 'g3Knee', startup: 3, active: 7, recovery: 14, damage: 1100, reach: 1.35, radius: 1.0, lunge: 28, hitstun: 32, knock: 'heavy', knockSpeed: 32, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
        },
        ai: { personality: 'aggressive', aggression: 0.9, defense: 0.6, ranged: 0.3, beam: 0.55, preferredRange: 2.3 },
        intro: { pose: 'g2_stance', expression: 'angry' },
        victory: { poses: ['g2_stance'], expression: 'angry' },
        ghost: 0xfff0a0,
        line: 'goku_ssj3',
        reactLine: 'react_ssj',
        music: 6,
        // the longest transformation in the game: the ground, the sky, a silence, and the reveal
        sequence: {
          length: 330,
          applyAt: 262,
          steps: [
            { at: 0, pose: 'g_ssjClench', speed: 6, expression: 'grit', aura: 0.5, auraColor: 0xffd23a, mood: [0.5, 0x0a0a18, 1], shot: 'orbit', music: 0, sfx: 'heartbeat', rocks: true, lightning: true },
            { at: 40, sfx: 'rumble', quake: 0.3 },
            { at: 70, pose: 'g3_ascend', speed: 6, expression: 'shout', aura: 1, sfx: 'ssjRise', mood: [0.85, 0x04040a, 0.8], skyBolts: true },
            { at: 110, quake: 0.5, skyBolt: true, sfx: 'lightning' },
            // the hair GROWS out of the scalp (staged, see hair.js ssj3Stage) — no flicker between two finished heads
            { at: 140, quake: 0.6, skyBolt: true, hair: 'goku_ssj2' },
            { at: 160, hair: 'goku_ssj3_g1', sfx: 'kiUp' },
            { at: 185, quake: 0.8, skyBolt: true, sfx: 'rumble', hair: 'goku_ssj3_g2' },
            { at: 210, hair: 'goku_ssj3_g3' },
            // the silence before it lands
            { at: 232, music: 0, aura: 0.2, lightning: false, rocks: false, pose: 'g_ssjClench', speed: 4, expression: 'grit' },
            { at: 262, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.35, 0x201c08, 0.3], flash: 0.3, crater: 9, lightning: true },
            { at: 284, pose: 'g2_stance', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.6] },
          ],
        },
      },
      {
        // SUPER SAIYAN GOD (Battle of Gods, Age 778): the power of six righteous Saiyans poured into one. Not a
        // brighter Super Saiyan: the hair keeps its base shape and turns crimson, the eyes go red, the body is
        // leaner and younger, and the aura is a FLAME — orange, magenta and gold licking up off him — with no
        // lightning at all. He stops tensing: an upright, open-handed stance; light, very fast, every blow
        // efficient. The story hands it over in "The Super Saiyan God" (formGivenBy) — Free Battle has it once
        // that is cleared.
        id: 'god', name: 'Super Saiyan God', short: 'SUPER SAIYAN GOD', kiCost: 80, style: 'full',
        freeUnlock: 'bog_ritual',
        mult: { damage: 2.3, speed: 1.46, defense: 1.62, kiRegen: 2.8, chargeRate: 1.6, guardStamina: 0.68, accel: 1.4 },
        aura: { color: 0xff3a52, core: 0xfff2d8, particles: 0xff7a3a, idle: 0.5, speed: 1.35, sharp: 0.12, sparks: 0xffd8a0, flame: [0xff5a1a, 0xff2a6a, 0xffc040, 0xff8a2a, 0xe8205a] },
        look: { hair: { style: 'goku', color: 0xd81c40 }, pupil: 0xc8142e, brow: 0xb0142e, bulk: 0.9, muscle: 0.88, scale: 0.985 },
        poses: { idle: poses.g_godStance },
        moves: {
          // the flash step: he is just there, already striking
          dash: { id: 'godStep', startup: 2, active: 7, recovery: 12, damage: 1200, reach: 1.3, radius: 1.0, lunge: 34, hitstun: 32, knock: 'heavy', knockSpeed: 34, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
        },
        ai: { personality: 'martial', aggression: 0.86, defense: 0.72, ranged: 0.34, beam: 0.5, preferredRange: 2.2 },
        intro: { pose: 'g_godStance', expression: 'calm' },
        victory: { poses: ['g_godCalm'], expression: 'calm' },
        ghost: 0xff7a6a,
        line: 'goku_god',
        reactLine: 'react_ssj',
        music: 5,
        // in Free Battle: no scream, no lightning — a warm red light that rises, and he is simply different
        sequence: {
          length: 210,
          applyAt: 150,
          steps: [
            { at: 0, pose: 'g_godCalm', speed: 4, expression: 'closed', aura: 0.3, auraColor: 0xff5a3a, mood: [0.45, 0x2a0610, 1.2], shot: 'orbit', music: 0, sfx: 'heartbeat' },
            { at: 40, sfx: 'kiCharge', quake: 0.08 },
            { at: 80, aura: 0.75, sfx: 'ssjRise', mood: [0.6, 0x3a0814, 0.8] },
            { at: 120, quake: 0.2, sfx: 'rumble' },
            { at: 150, burst: true, pose: 'g_godCalm', speed: 6, expression: 'calm', sfx: 'transformBurst', mood: [0.2, 0x3a1010, 0.4], flash: 0.35, crater: 3 },
            { at: 172, pose: 'g_godStance', speed: 4, expression: 'calm', shot: 'face', mood: [0, 0x000000, 1.8] },
          ],
        },
      },
      {
        // SUPER SAIYAN WITH GOD KI (Battle of Gods, the stratosphere): the red is gone from his hair, but his body
        // kept the divine power. Super Saiyan's look; a gold aura with a red flame still running through it; the
        // God form's speed. Handed over in "My World".
        id: 'godki', name: 'Super Saiyan (God Ki)', short: 'GOD KI', kiCost: 60, style: 'full',
        freeUnlock: 'bog_sphere',
        mult: { damage: 2.2, speed: 1.42, defense: 1.56, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.7, accel: 1.35 },
        aura: { color: 0xffcc3a, core: 0xffffff, particles: 0xfff0a0, idle: 0.55, speed: 1.5, sharp: 0.3, sparks: 0xffb08a, flame: [0xffd23a, 0xff6a2a, 0xffe890, 0xff3a5a] },
        look: { hair: { style: 'goku_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.0 },
        poses: { idle: poses.g_godStance },
        moves: {
          dash: { id: 'godKiStep', startup: 2, active: 7, recovery: 13, damage: 1150, reach: 1.3, radius: 1.0, lunge: 32, hitstun: 32, knock: 'heavy', knockSpeed: 32, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
        },
        ai: { personality: 'martial', aggression: 0.86, defense: 0.7, ranged: 0.36, beam: 0.55, preferredRange: 2.3 },
        intro: { pose: 'g_godStance', expression: 'determined' },
        victory: { poses: ['g_godCalm'], expression: 'grin' },
        ghost: 0xffe08a,
        line: 'goku_godki',
        reactLine: 'react_ssj',
        music: 5,
      },
    ],
    poses,
    moves: {
      light: [
        { id: 'jab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 260, reach: 1.15, radius: 0.7, lunge: 10, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_jabW', strike: 'g_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cross', startup: 4, active: 3, recovery: 11, cancel: 6, damage: 290, reach: 1.2, radius: 0.7, lunge: 10, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_crossW', strike: 'g_cross', follow: 'g_crossF' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'elbow', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 320, reach: 1.05, radius: 0.75, lunge: 11, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'g_elbowW', strike: 'g_elbow' }, sfx: 'punchLight', hitPose: 'hitBody' },
        { id: 'roundhouse', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 380, reach: 1.35, radius: 0.8, lunge: 11, hitstun: 26, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'g_kickW', strike: 'g_kick' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'sideKick', startup: 13, active: 4, recovery: 22, damage: 760, reach: 1.45, radius: 0.85, lunge: 12, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, guardCrush: true, guardDamage: 38, pose: { wind: 'g_sideKickW', strike: 'g_sideKick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        1: { id: 'flurry', startup: 6, active: 20, recovery: 16, damage: 125, reach: 1.1, radius: 0.85, lunge: 9, hitstun: 16, knock: 'flinch', impact: 1, multi: [0, 4, 8, 12, 16], finish: { knock: 'push', knockSpeed: 10, impact: 2, damage: 260 }, pose: { wind: 'g_jabW', strike: 'g_flurry' }, sfx: 'punchLight', hitPose: 'hitLight' },
        2: { id: 'uppercut', startup: 9, active: 4, recovery: 20, damage: 620, reach: 1.1, radius: 0.85, lunge: 10, hitstun: 34, knock: 'launch', knockSpeed: 17, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitLight', stretch: true },
        3: { id: 'meteorCrash', startup: 10, active: 5, recovery: 24, damage: 820, reach: 1.1, radius: 1.0, lunge: 14, hitstun: 36, knock: 'smash', knockSpeed: 34, impact: 3, teleport: { to: 'above', at: 2, kiCost: 10 }, pose: { wind: 'g_axeKickW', strike: 'g_axeKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        4: { id: 'spinHeel', startup: 11, active: 5, recovery: 24, damage: 900, reach: 1.45, radius: 0.9, lunge: 11, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, pose: { wind: 'g_spinKickW', strike: 'g_spinKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      // used when both fighters are airborne
      airHeavy: {
        0: { id: 'airHammer', startup: 11, active: 4, recovery: 22, damage: 720, reach: 1.15, radius: 0.95, lunge: 13, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'airUpper', startup: 8, active: 4, recovery: 18, damage: 600, reach: 1.1, radius: 0.9, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 16, impact: 2, pose: { wind: 'g_airUpperW', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitLight', stretch: true },
        4: { id: 'airSpin', startup: 10, active: 5, recovery: 22, damage: 880, reach: 1.4, radius: 0.95, lunge: 12, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, pose: { wind: 'g_spinKickW', strike: 'g_spinKick' }, sfx: 'punchHeavy', hitPose: 'hitAirSpin' },
      },
      dash: { id: 'flyingKnee', startup: 5, active: 8, recovery: 17, damage: 700, reach: 1.2, radius: 0.9, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      chase: {
        smash: { id: 'chaseAxe', startup: 5, active: 6, recovery: 22, damage: 660, reach: 1.1, radius: 1.05, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 3, pose: { wind: 'g_axeKickW', strike: 'g_axeKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        strike: { id: 'chaseKick', startup: 5, active: 6, recovery: 22, damage: 620, reach: 1.3, radius: 1.05, lunge: 16, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, pose: { wind: 'g_kickW', strike: 'g_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      throw: { id: 'spinThrow', name: 'Spinning Throw', damage: 1000, knockSpeed: 28, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'kamehameha', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 22, chargeMax: 110, tiers: [22, 55, 95],
        damage: [1800, 3300], radius: [0.55, 1.25], speed: 100, range: 160, sustain: 40,
        color: 0x3fb2ff, core: 0xe8f8ff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 22,
        style: { rings: 4, ringColor: 0xc8ecff, ringSpeed: 1.3 },
        sound: 'kame',
        callout: ['KA', 'ME', 'HA', 'ME', 'HA!'],
        chargeLight: 0x5ac8ff,
        // fired right after Instant Transmission: almost no charge, point blank
        instant: { name: 'Instant Kamehameha', chargeMin: 6, chargeMax: 16, damageMul: 0.9, kiCost: 25 },
        formVariants: {
          kaioken: { name: 'Kaioken Kamehameha', color: 0xff5a48, core: 0xffe6e0, ringColor: 0xffb0a0, damageMul: 1.15 },
          ssj: { name: 'Super Kamehameha', radiusMul: 1.2, damageMul: 1.1, core: 0xffffff },
          ssj2: { name: 'Super Kamehameha', radiusMul: 1.35, damageMul: 1.2, core: 0xffffff, ringColor: 0xeaf6ff },
          ssj3: { name: 'Super Kamehameha', radiusMul: 1.55, damageMul: 1.35, core: 0xffffff, ringColor: 0xfff4c0 },
          god: { name: 'God Kamehameha', color: 0xff4a5a, core: 0xfff0e0, ringColor: 0xffb0a0, radiusMul: 1.5, damageMul: 1.45 },
          godki: { name: 'God Kamehameha', radiusMul: 1.5, damageMul: 1.4, core: 0xffffff, ringColor: 0xffd0a0 },
        },
      },
      special2: {
        id: 'instantTransmission', name: 'Instant Transmission', type: 'teleport', kiCost: 18, icon: 'teleport',
        startup: 8, recovery: 8, cooldown: 45, escapeKiCost: 32, followWindow: 30, followBonus: 1.25, pose: 'twoFingers',
        // direction held when pressed: neutral/side = behind, forward = in front with a strike,
        // back = retreat far away, up = above the target
        modes: { behind: true, front: true, away: true, above: true },
        fatigue: { window: 240, kiStep: 8, cooldownStep: 18, max: 3 },
        shimmer: true,
      },
      ultimate: {
        id: 'spiritBomb', name: 'Spirit Bomb', type: 'spiritBomb', kiCost: 100, icon: 'bomb',
        chargeMin: 80, chargeFrames: 260, holdToCharge: true,
        radius: [1.8, 5.4], damage: [3000, 6200], explode: [7, 17], speed: 22, homing: 1.3,
        color: 0x74d6ff, core: 0xffffff,
        poses: { charge: 'g_spiritRaise', release: 'g_spiritThrow' }, recovery: 34,
        mood: { amount: 0.55, color: 0x15254a },
        clashPower: [0.9, 1.9],
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'Vanishing and Perfect Guards cost less and empower your next strikes. Every hit taken or blocked teaches him the fight: a full Adaptation meter empowers him too. Near defeat, a Saiyan surge restores ki.' },
    ai: { personality: 'martial', aggression: 0.8, defense: 0.62, ranged: 0.4, beam: 0.55, transformHp: 0.55, preferredRange: 2.5, hooks: 'goku' },
    barks: { combo: 'goku_combo', hurt: 'goku_hurt', lowHp: 'goku_lowHp', ultimate: 'goku_ultimateTaunt', reactTransform: 'goku_reactTransform' },
    intro: { pose: 'g_introPalm', expression: 'smirk' },
    victory: { poses: ['g_victory', 'g_victoryFist'], expression: 'grin' },
    defeat: { pose: 'g_defeatKnee', expression: 'hurt' },
  };
})();
