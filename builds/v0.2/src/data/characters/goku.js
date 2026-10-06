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
  };
  poses.g_victoryFist = C.victory;

  SL.data.characters.goku = {
    id: 'goku',
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
        mult: { damage: 1.12, speed: 1.15, defense: 1, kiRegen: 1, staminaRegen: 1.25 },
        drain: { hpPerSec: 35, minHpFrac: 0.12 },
        // charging ki while in Kaioken raises the multiplier (more power, more strain)
        levels: [
          { name: 'x2', mult: { damage: 1.12, speed: 1.15 }, hpPerSec: 35 },
          { name: 'x3', mult: { damage: 1.22, speed: 1.22 }, hpPerSec: 60, line: 'goku_kaioken3' },
          { name: 'x4', mult: { damage: 1.34, speed: 1.3 }, hpPerSec: 100, line: 'goku_kaioken4' },
        ],
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
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'Vanishing and perfect guards cost less and empower your next strikes. Near defeat, a Saiyan surge restores ki.' },
    ai: { personality: 'martial', aggression: 0.8, defense: 0.62, ranged: 0.4, beam: 0.55, transformHp: 0.55, preferredRange: 2.5, hooks: 'goku' },
    barks: { combo: 'goku_combo', hurt: 'goku_hurt', lowHp: 'goku_lowHp', ultimate: 'goku_ultimateTaunt', reactTransform: 'goku_reactTransform' },
    intro: { pose: 'g_introPalm', expression: 'smirk' },
    victory: { poses: ['g_victory', 'g_victoryFist'], expression: 'grin' },
    defeat: { pose: 'g_defeatKnee', expression: 'hurt' },
  };
})();
