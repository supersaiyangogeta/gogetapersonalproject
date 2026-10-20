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
    // DRAGON FIST: sunk low, the right fist chambered at the hip, the left palm held out ahead to sight along
    g_dragonFistW: {
      hands: ['open', 'fist'],
      root: { y: -0.16 }, hips: [0, -34, 0], spine: [6, -14, 0], chest: [10, -30, 0], head: [-6, 40, 0],
      shoulderL: [-84, 0, 8], elbowL: [-14, 0, 0], handL: [-60, 0, 0], shoulderR: [-10, 0, -34], elbowR: [-136, 0, 0],
      thighL: [-48, 22, 16], kneeL: [62, 0, 0], footL: [-10, 0, 0], thighR: [26, 20, -18], kneeR: [44, 0, 0], footR: [-14, 0, 0],
    },
    // flying in behind the fist: body laid out flat, the right arm straight ahead, the left drawn back along his side
    g_dragonFistDash: {
      root: { rx: 78 }, spine: [-6, 0, 0], neck: [-30, 0, 0], head: [-44, 0, 0],
      shoulderR: [-174, 0, -2], elbowR: [0, 0, 0], shoulderL: [36, 0, 14], elbowL: [-60, 0, 0],
      thighL: [6, 0, 4], kneeL: [16, 0, 0], footL: [60, 0, 0], thighR: [-6, 0, -4], kneeR: [34, 0, 0], footR: [60, 0, 0],
    },
    // through him: the whole body behind the right fist, the left pulled back to the hip, the front knee deep
    g_dragonFist: {
      root: { y: -0.12, rx: 14 }, hips: [0, 22, 0], spine: [8, 18, 0], chest: [10, 38, 0], head: [-12, -34, 0],
      shoulderR: [-92, 0, 2], elbowR: [0, 0, 0], shoulderL: [-14, 0, 34], elbowL: [-124, 0, 0],
      thighL: [-58, 10, 12], kneeL: [64, 0, 0], footL: [-8, 0, 0], thighR: [34, -6, -10], kneeR: [8, 0, 0], footR: [-20, 0, 0],
    },
    // RADITZ RUSH (game-original, after the fight with Raditz): driving forward off the front foot, the lead fist
    // high, the rear one cocked back by the ear
    g_raditzW: {
      root: { y: -0.12, rx: 14 }, hips: [0, -16, 0], spine: [10, -8, 0], chest: [12, -14, 0], head: [-14, 12, 0],
      shoulderL: [-64, 0, 14], elbowL: [-104, 0, 0], shoulderR: [-40, 0, -16], elbowR: [-118, 0, 0],
      thighL: [-46, 14, 10], kneeL: [58, 0, 0], footL: [-10, 0, 0], thighR: [30, -8, -10], kneeR: [26, 0, 0], footR: [-20, 0, 0],
    },
    // closing in shoulder-first, low, forearms up across the face
    g_raditzDash: {
      root: { rx: 42 }, spine: [8, -10, 0], chest: [10, -20, 0], head: [-30, 16, 0],
      shoulderL: [-50, 0, -20], elbowL: [-110, 0, 0], shoulderR: [-20, 0, -26], elbowR: [-120, 0, 0],
      thighL: [-60, 0, 8], kneeL: [70, 0, 0], footL: [20, 0, 0], thighR: [40, 0, -6], kneeR: [40, 0, 0], footR: [40, 0, 0],
    },
    // the opener: both hands pull him down onto a rising knee
    g_raditzKnee: {
      hands: ['open', 'open'],
      root: { y: 0.02, rx: 4 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-4, 0, 0],
      shoulderL: [-70, 0, 20], elbowL: [-80, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-80, 0, 0],
      thighR: [-110, 0, -6], kneeR: [120, 0, 0], footR: [30, 0, 0], thighL: [8, 0, 6], kneeL: [16, 0, 0],
    },
    // the finish: off the ground into a side kick through his chest, the other leg tucked
    g_raditzKick: {
      root: { y: 0.12, rx: -14, rz: 10 }, hips: [0, 40, 0], spine: [-6, -10, 0], chest: [-10, -20, 0], head: [10, -24, 0],
      shoulderL: [-20, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-90, 0, 0],
      thighR: [-96, 0, -30], kneeR: [4, 0, 0], footR: [30, 0, 0], thighL: [-30, 0, 10], kneeL: [90, 0, 0],
    },
    // NAPPA RUSH (game-original, after the fight with Nappa): sunk low and wide, weight back, open hands low —
    // waiting for the big swing to slip
    g_nappaW: {
      hands: ['open', 'open'],
      root: { y: -0.22, rx: 10 }, hips: [0, -20, 0], spine: [10, -6, 0], chest: [8, -12, 0], head: [-14, 14, 0],
      shoulderL: [-58, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -22], elbowR: [-100, 0, 0],
      thighL: [-56, 18, 20], kneeL: [78, 0, 0], footL: [-14, 0, 0], thighR: [26, -12, -20], kneeR: [56, 0, 0], footR: [-24, 0, 0],
    },
    // slipping in under it: ducked low, leaning off to the side, eyes on him
    g_nappaPass: {
      root: { rx: 30, rz: -20 }, spine: [10, 14, 0], chest: [10, 20, 0], head: [-24, -26, 0],
      shoulderL: [-30, 0, 40], elbowL: [-70, 0, 0], shoulderR: [30, 0, -30], elbowR: [-30, 0, 0],
      thighL: [-70, 0, 14], kneeL: [90, 0, 0], footL: [20, 0, 0], thighR: [30, 0, -14], kneeR: [60, 0, 0], footR: [40, 0, 0],
    },
    // standing on his head, feet together on the crown, arms folded, looking down at him
    g_nappaPerch: {
      ...C.armsCrossed, chest: [4, 0, 0], head: [26, 0, 0],
      thighL: [-6, 0, 3], kneeL: [12, 0, 0], thighR: [-4, 0, -3], kneeR: [12, 0, 0],
    },
    // the finish: up off the crown and the heel driven straight down into it, the other knee tucked, arms thrown up
    g_nappaStomp: {
      root: { y: 0.15, rx: 10 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [24, 0, 0],
      shoulderL: [-150, 0, 24], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -24], elbowR: [-30, 0, 0],
      thighR: [8, 0, -4], kneeR: [0, 0, 0], thighL: [-100, 0, 10], kneeL: [120, 0, 0],
    },
    // METEOR COMBINATION (the wheel, SSJ2): from under him, both palms thrust straight up for the Kamehameha
    g_meteorKame: {
      hands: ['open', 'open'],
      root: { y: -0.1, rx: -18 }, spine: [-14, 0, 0], chest: [-16, 0, 0], neck: [-14, 0, 0], head: [-30, 0, 0],
      shoulderL: [-160, 0, -6], elbowL: [-4, 0, 0], handL: [-70, 0, -10], shoulderR: [-160, 0, 6], elbowR: [-4, 0, 0], handR: [-70, 0, 10],
      thighL: [-30, 0, 14], kneeL: [44, 0, 0], thighR: [-10, 0, -14], kneeR: [30, 0, 0],
    },
    // SUPER DRAGON TWIN FIST (the wheel, SSJ3): the knee driven up into the stomach, both hands dragging his head down onto it
    g_twinKnee: {
      hands: ['open', 'open'],
      root: { y: 0.06, rx: 10 }, spine: [14, 0, 0], chest: [16, 0, 0], neck: [6, 0, 0], head: [-10, 0, 0],
      shoulderL: [-110, 0, -10], elbowL: [-60, 0, 0], shoulderR: [-110, 0, 10], elbowR: [-60, 0, 0],
      thighR: [-118, 0, -4], kneeR: [124, 0, 0], footR: [30, 0, 0], thighL: [10, 0, 6], kneeL: [14, 0, 0],
    },
    // ...dropped low, the leg swept round at shin height
    g_sweep: {
      hands: ['open', 'fist'],
      root: { y: -0.44, rx: 12 }, hips: [0, -46, 0], spine: [16, -20, 0], chest: [10, -20, 0], head: [-14, 44, 0],
      shoulderL: [20, 0, 40], elbowL: [-10, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-60, 0, 0],
      thighL: [-84, 10, 18], kneeL: [124, 0, 0], footL: [-20, 0, 0], thighR: [-16, 0, -88], kneeR: [4, 0, 0], footR: [20, 0, 0],
    },
    // ...both palms driven into his chest together, the guard broken
    g_twinPalms: {
      hands: ['open', 'open'],
      root: { y: -0.12, rx: 10 }, spine: [8, 0, 0], chest: [8, 0, 0], head: [-8, 0, 0],
      shoulderL: [-90, 0, -12], elbowL: [-4, 0, 0], handL: [-80, 0, 0], shoulderR: [-90, 0, 12], elbowR: [-4, 0, 0], handR: [-80, 0, 0],
      thighL: [-50, 8, 12], kneeL: [56, 0, 0], thighR: [24, -6, -12], kneeR: [10, 0, 0],
    },
    // ...and the dragon uppercut: up off the ground behind the fist, the arm straight at the sky
    g_dragonUpper: {
      hands: ['fist', 'fist'],
      root: { y: 0.2, rx: -14 }, hips: [0, 20, 0], spine: [-10, 16, 0], chest: [-14, 24, 0], neck: [-10, 0, 0], head: [-26, -20, 0],
      shoulderR: [-176, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-10, 0, 40], elbowL: [-80, 0, 0],
      thighR: [-30, 0, -6], kneeR: [40, 0, 0], footR: [30, 0, 0], thighL: [10, 0, 6], kneeL: [20, 0, 0], footL: [40, 0, 0],
    },
    // DIVINE RUSH (the wheel, God): gliding in behind an open palm, the other hand loose at the hip
    g_godPalm: {
      hands: ['open', 'open'],
      root: { y: -0.04, rx: 6 }, hips: [0, 18, 0], spine: [4, 14, 0], chest: [2, 22, 0], head: [-4, -30, 0],
      shoulderR: [-88, 0, 4], elbowR: [-4, 0, 0], handR: [-74, 0, 0], shoulderL: [-16, 0, 22], elbowL: [-30, 0, 0],
      thighL: [-28, 8, 12], kneeL: [34, 0, 0], thighR: [18, -6, -12], kneeR: [16, 0, 0],
    },
    // ...the "God Shot": index finger out like a gun, a flick of ki point blank
    g_godShot: {
      hands: ['open', 'point'],
      root: { y: -0.02 }, hips: [0, 24, 0], spine: [0, 18, 0], chest: [-2, 28, 0], head: [-6, -36, 0],
      shoulderR: [-92, 0, 2], elbowR: [-2, 0, 0], handR: [0, 0, 0], shoulderL: [-14, 0, 24], elbowL: [-40, 0, 0],
      thighL: [-20, 8, 12], kneeL: [24, 0, 0], thighR: [14, -6, -12], kneeR: [12, 0, 0],
    },
    // ...the blazing shoulder tackle through him, head down behind it
    g_shoulder: {
      hands: ['fist', 'fist'],
      root: { y: -0.1, rx: 30 }, hips: [0, -40, 0], spine: [16, -30, 0], chest: [14, -40, 0], neck: [10, 0, 0], head: [10, 40, 0],
      shoulderL: [-40, 0, 20], elbowL: [-110, 0, 0], shoulderR: [-20, 0, -30], elbowR: [-90, 0, 0],
      thighL: [-70, 6, 10], kneeL: [70, 0, 0], thighR: [40, -6, -10], kneeR: [10, 0, 0], footR: [-20, 0, 0],
    },
    // GOD FIST RUSH (the wheel, Blue): the gut punch, shoulder and hip turned all the way into it
    g_godFistGut: {
      hands: ['open', 'fist'],
      root: { y: -0.2, rx: 18 }, hips: [0, 30, 0], spine: [16, 20, 0], chest: [18, 36, 0], head: [-20, -30, 0],
      shoulderR: [-76, 0, 6], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 36], elbowL: [-100, 0, 0],
      thighL: [-60, 8, 12], kneeL: [80, 0, 0], thighR: [30, -6, -12], kneeR: [30, 0, 0],
    },
    // STORY (the Namek finale, the owner's PDF "brush-off"): a ball of ki swatted aside with the back of the hand without
    // looking at it, the rest of him hardly moving
    g_brushOff: {
      hands: ['fist', 'open'],
      root: { y: -0.02 }, hips: [0, -10, 0], spine: [2, -16, 0], chest: [0, -24, 0], neck: [0, 0, 0], head: [-6, 22, 0],
      shoulderR: [-60, 0, -86], elbowR: [-20, 0, 0], handR: [0, 0, -30], shoulderL: [-14, 0, 18], elbowL: [-30, 0, 0],
      thighL: [-14, 6, 10], kneeL: [16, 0, 0], thighR: [8, -6, -10], kneeR: [10, 0, 0],
    },
    // MASTERED ULTRA INSTINCT (the wheel): the silver hook up into the gut from inside the guard
    g_silverHook: {
      hands: ['open', 'fist'],
      root: { y: -0.16, rx: 12 }, hips: [0, 34, 0], spine: [10, 26, 0], chest: [10, 40, 0], head: [-16, -38, 0],
      shoulderR: [-60, 0, 30], elbowR: [-70, 0, 0], shoulderL: [-14, 0, 26], elbowL: [-50, 0, 0],
      thighL: [-48, 10, 14], kneeL: [60, 0, 0], thighR: [26, -8, -12], kneeR: [16, 0, 0],
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
    /* Then up, at the sky he has to get through (Namek's end, the departure): the chin lifts, the knees give a little. */
    g_lookUp: (t) => {
      const b = Math.sin(t * 2.2) * 1.2;
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.06 + b * 0.004 },
        spine: [-4, 0, 0], chest: [-6 + b * 0.3, 0, 0], neck: [-14, 0, 0], head: [-24, 4, 0],
        shoulderL: [-4, 0, 14], elbowL: [-24, 0, 0], handL: [0, 0, 0],
        shoulderR: [-4, 0, -14], elbowR: [-24, 0, 0], handR: [0, 0, 0],
        thighL: [-14, 4, 10], kneeL: [24, 0, 0], footL: [-8, 0, 0], thighR: [-12, -4, -10], kneeR: [22, 0, 0], footR: [-8, 0, 0],
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
    // ULTRA INSTINCT (the Tournament of Power): upright, shoulders relaxed, the arms hanging naturally at his sides and
    // the hands loose — not a guard, not a crouch; the stillness the reference asks for
    g_uiStance: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        hands: ['open', 'open'],
        root: { y: b * 0.004 }, spine: [-1, 0, 0], chest: [-2, 0, 0], neck: [0, 0, 0], head: [2, 0, 0],
        shoulderL: [-4, 0, 9], elbowL: [-10, 0, 0], handL: [0, 0, 0], shoulderR: [-4, 0, -9], elbowR: [-10, 0, 0], handR: [0, 0, 0],
        thighL: [-2, 4, 6], kneeL: [4, 0, 0], thighR: [-1, -4, -6], kneeR: [3, 0, 0],
      };
    },
    // Ultra Instinct's evasion: the head and shoulders slip a hand's width aside, the feet hardly move
    g_uiSlip: { hands: ['open', 'open'], root: { y: -0.02, rz: 6 }, spine: [0, 6, 8], chest: [-2, 10, 10], head: [4, -8, 12], shoulderL: [-14, 0, 22], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-20, 0, 0], thighL: [-4, 6, 8], kneeL: [8, 0, 0], thighR: [2, -6, -8], kneeR: [6, 0, 0] },
    g_uiSlip2: { hands: ['open', 'open'], root: { y: -0.03, rz: -6 }, spine: [2, -6, -8], chest: [0, -10, -10], head: [2, 8, -12], shoulderL: [-10, 0, 14], elbowL: [-20, 0, 0], shoulderR: [-14, 0, -22], elbowR: [-30, 0, 0], thighL: [2, 6, 8], kneeL: [6, 0, 0], thighR: [-4, -6, -8], kneeR: [8, 0, 0] },
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
    // GOD BIND (Movie 2): both arms straight out, palms open and turned up toward him, the knees bent, holding
    g_bind: (t) => {
      const s = Math.sin(t * 30) * 1.2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.08, rx: 4 }, spine: [4, 0, 0], chest: [2, 0, s * 0.3], head: [-4, 0, 0],
        shoulderL: [-84 + s, -14, 10], elbowL: [-8, 0, 0], handL: [-70, 0, 0], shoulderR: [-84 - s, 14, -10], elbowR: [-8, 0, 0], handR: [-70, 0, 0],
        thighL: [-26, 8, 14], kneeL: [34, 0, 0], thighR: [14, -8, -14], kneeR: [20, 0, 0],
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
        // more decisive than his base self, less than God or Blue: he presses, then reads (base is the explorer)
        ai: { aggression: 0.78, rhythm: { burst: 3, rest: 34 } },
        // every Super Saiyan after the awakening (the ToP refinement brief §5): he braces and his fists tighten, the
        // camera comes in, a small disturbance and the dust driven out from his feet, the aura grows, the hair and brows
        // go gold, the camera pulls back to the whole silhouette — 1.7 seconds, no lightning, no darkened sky
        practiced: {
          length: 104,
          applyAt: 52,
          steps: [
            { at: 0, pose: 'g_ssjClench', speed: 10, expression: 'grit', aura: 0.25, shot: 'face', sfx: 'kiUp' },
            { at: 14, aura: 0.45, quake: 0.08, dust: 2.5 },
            { at: 30, aura: 0.8, quake: 0.14, sfx: 'ssjRise', dust: 4, expression: 'shout' },
            { at: 52, burst: true, small: true, pose: 'powerUp', speed: 16, expression: 'shout', flash: 0.25, crater: 2.5 },
            { at: 60, shot: 'pull' },
            { at: 76, pose: 'g_ssjReveal', speed: 6, expression: 'angry' },
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
        look: { hair: { style: 'goku_god', color: 0xd81c40 }, pupil: 0xc8142e, brow: 0xb0142e, bulk: 0.9, muscle: 0.88, scale: 0.985 },
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
      {
        // SUPER SAIYAN BLUE: the god's ki under a Super Saiyan's control — the Super Saiyan shape in cyan,
        // lit from inside, a deep cobalt flame with a pale edge. Canon grants it against Frieza; the Broly
        // film keeps its own reveal in "Beyond the Limits". Either clear gives it to Free Battle.
        id: 'blue', name: 'Super Saiyan Blue', short: 'SUPER SAIYAN BLUE', kiCost: 90, style: 'full',
        freeUnlock: ['rof_goku', 'bb_legend'],
        mult: { damage: 2.6, speed: 1.52, defense: 1.78, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.66, accel: 1.45 },
        aura: { color: 0x2a8aff, core: 0xd8f6ff, particles: 0x6ad0ff, idle: 0.55, speed: 1.5, sharp: 0.3, sparks: 0xbfe8ff, flame: [0x1a5ae8, 0x2a8aff, 0x3ad0ff, 0x8ae8ff], inner: { color: 0x9ae4ff, core: 0xffffff, scale: 0.7, alpha: 0.5 } },
        look: { hair: { style: 'goku_blue', color: 0x34c4ff }, pupil: 0x1a74e0, brow: 0x2aa0e8, bulk: 1.0 },
        poses: { idle: poses.g_godStance },
        moves: {
          dash: { id: 'blueStep', startup: 2, active: 7, recovery: 12, damage: 1300, reach: 1.3, radius: 1.0, lunge: 34, hitstun: 32, knock: 'heavy', knockSpeed: 34, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
        },
        ai: { personality: 'martial', aggression: 0.88, defense: 0.72, ranged: 0.36, beam: 0.55, preferredRange: 2.2 },
        intro: { pose: 'g_godStance', expression: 'determined' },
        victory: { poses: ['g_godCalm'], expression: 'grin' },
        ghost: 0x8ad8ff,
        line: 'goku_blue',
        reactLine: 'react_ssj',
        music: 5,
        sequence: {
          length: 196,
          applyAt: 132,
          steps: [
            { at: 0, pose: 'g_ssjClench', speed: 6, expression: 'grit', aura: 0.3, auraColor: 0x8ad0ff, mood: [0.35, 0x061024, 0.9], shot: 'orbit', music: 0, sfx: 'kiUp' },
            { at: 30, rocks: true, quake: 0.14, sfx: 'rumble' },
            { at: 60, aura: 0.6, auraColor: 0x4ab8ff, expression: 'shout', sfx: 'ssjRise', quake: 0.24 },
            { at: 98, pose: 'g2_ascend', speed: 8, expression: 'shout', quake: 0.36 },
            { at: 132, burst: true, pose: 'powerUp', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x0a1a30, 0.3], flash: 0.3, crater: 5, rocks: false },
            { at: 148, shot: 'pull' },
            { at: 164, pose: 'g_godStance', speed: 4, expression: 'determined', mood: [0.05, 0x101020, 1.4] },
          ],
        },
      },
      {
        // SUPER SAIYAN BLUE KAIOKEN (Universe 6, against Hit; the Tournament of Power, against Jiren): the Kaioken
        // stacked on Blue. The hair stays blue — a cobalt flame inside an exploding crimson shell, the skin flushed.
        // x10 (Hit) and x20 (Jiren): the story caps the level (formCaps); the strain builds fast and the body pays
        // for it (the Kaioken strain model: sore, then overload). Story-given by u6_goku_hit.
        id: 'blueKaioken', name: 'Super Saiyan Blue Kaioken', short: 'BLUE KAIOKEN', kiCost: 60, style: 'burst',
        freeUnlock: ['u6_goku_hit'],
        mult: { damage: 3.4, speed: 1.75, defense: 1.6, kiRegen: 2, chargeRate: 1.4, guardStamina: 0.7, accel: 1.8 },
        drain: { hpPerSec: 50, minHpFrac: 0.1 },
        levels: [
          { name: 'x10', mult: { damage: 3.4, speed: 1.75, defense: 1.6, accel: 1.8 }, hpPerSec: 50, kiPerSec: 5 },
          { name: 'x20', mult: { damage: 4.1, speed: 1.95, defense: 1.5, accel: 2.0 }, hpPerSec: 110, kiPerSec: 10, line: 'goku_kaioken4' },
        ],
        strain: { buildPerSec: [7, 16], max: 100, recoverPerSec: 6, soreAt: 40, reentryAt: 60, overloadDamage: 0.08, overloadLockSeconds: 8, penalty: { speed: 0.85, damage: 0.9, staminaRegen: 0.6 } },
        defaultLevelCap: 0,
        levelCost: 20,
        levelChargeFrames: 45,
        activation: { pose: 'g_kaiokenFlex' },
        moves: {
          heavy: {
            4: { id: 'blueKaiokenAssault', startup: 6, active: 26, recovery: 24, damage: 170, reach: 1.2, radius: 0.95, lunge: 28, hitstun: 20, knock: 'flinch', impact: 1, multi: [0, 5, 10, 15, 20], finish: { knock: 'smash', knockSpeed: 38, impact: 3, damage: 620 }, pose: { wind: 'g_kaiokenFlex', strike: 'g_flurry' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
          dash: { id: 'blueKaiokenCharge', startup: 3, active: 11, recovery: 15, damage: 980, reach: 1.25, radius: 1.0, lunge: 48, hitstun: 32, knock: 'heavy', knockSpeed: 32, impact: 3, pose: { wind: 'dash', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        // the two flames: blue at the core and in the hair, red all round it
        aura: { color: 0xff2a3a, core: 0xff4a30, particles: 0xff5a4a, idle: 0.7, speed: 2.0, sharp: 0.6, sparks: 0xff9a7a, flame: [0x2a8aff, 0x3ad0ff, 0xff2a1e, 0xff5a3a], steam: 0xff9a8a, inner: { color: 0x1a7aff, core: 0x8ad8ff, scale: 0.8, alpha: 1.4, sharp: 0.3 }, trail: [0xff3a2a, 0x3ab0ff] },
        look: { hair: { style: 'goku_blue', color: 0x34c4ff }, pupil: 0x1a74e0, brow: 0x2aa0e8, bulk: 1.03, tint: 0xff1a0a, tintAmount: 0.07 },
        poses: { idle: poses.g_godStance },
        ai: { personality: 'martial', aggression: 0.92, defense: 0.6, ranged: 0.3, beam: 0.5, preferredRange: 2 },
        intro: { pose: 'g_kaiokenFlex', expression: 'grit' },
        victory: { poses: ['g_godCalm'], expression: 'grin' },
        ghost: 0xff6a5a,
        line: 'goku_kaioken',
        reactLine: 'react_ssj',
        music: 5,
      },
      {
        // ULTRA INSTINCT -SIGN- (the Tournament of Power, after the Spirit Bomb against Jiren): the hair stays black
        // with a cold silver sheen, the eyes turn silver-grey, the aura a pale blue-white shimmer with faint violet in
        // it. Its identity is the body moving by itself: `evade` — while ki lasts, a share of the blows that would land
        // never do (a slip of the head and shoulders, a few frames of translucent trace, no afterimage clone); the ki
        // burns while it is held (drain) and an empty tank ends it. Story-given by top_jiren.
        id: 'uiSign', name: 'Ultra Instinct -Sign-', short: 'ULTRA INSTINCT -SIGN-', kiCost: 60, style: 'full',
        freeUnlock: ['top_jiren'],
        mult: { damage: 2.5, speed: 1.75, defense: 1.6, kiRegen: 1.4, chargeRate: 1.2, guardStamina: 0.7, accel: 1.7 },
        drain: { kiPerSec: 2.2 },
        // the slip is a few centimetres (swayVel), never a teleport; the attacker's weight carries on through (overrun)
        evade: { mode: 'god', chance: 0.5, gap: 32, kinds: ['sway', 'sway', 'step'], swayPose: 'g_uiSlip', stepPose: 'g_uiSlip2', whiff: 18, kiCost: 6, trace: 0xc8d4ff, swayVel: 1.8, stepVel: 4.5, overrun: 7 },
        // pale blue-white outside, a bright core inside it; the colours at the edges are a restrained detail
        aura: { color: 0xb8d0ff, core: 0xffffff, particles: 0xd8e4ff, idle: 0.45, speed: 1.3, sharp: 0.2, sparks: 0xc8b0ff, flame: [0xdfe8ff, 0xb8c8ff, 0xffffff, 0xc8b8f0], inner: { color: 0xeef4ff, core: 0xffffff, scale: 0.74, alpha: 0.6 } },
        // the body takes a faint cold cast from the aura; the face waits, focused (look.tint, restFace)
        look: { hair: { style: 'goku_ui_sign', color: 0x262a3a }, pupil: 0xb8c0d0, brow: 0x2a2e3e, bulk: 1.02, tint: 0x5a6ab0, tintAmount: 0.05 },
        restFace: 'focused',
        poses: { idle: poses.g_uiStance },
        // the Sign waits: short exchanges, long watching; it does not answer every miss
        ai: { personality: 'martial', aggression: 0.55, defense: 0.92, ranged: 0.25, beam: 0.45, preferredRange: 2, rhythm: { burst: 2, rest: 48 } },
        intro: { pose: 'g_uiStance', expression: 'calm' },
        victory: { poses: ['g_uiStance'], expression: 'calm' },
        ghost: 0xc8d4ff,
        reactLine: 'react_ssj',
        music: 5,
      },
      {
        // MASTERED ULTRA INSTINCT (against Jiren, the end of the Tournament of Power): silver hair and eyes, a silver-
        // white aura with violet in its edges. The evasion nearly always (`evade`), the counters come out of it, and the
        // body pays: the ki burns fast and an empty tank ends it. Story-given by top_mui.
        id: 'mui', name: 'Mastered Ultra Instinct', short: 'ULTRA INSTINCT', kiCost: 90, style: 'full',
        freeUnlock: ['top_mui'],
        mult: { damage: 3.6, speed: 2.0, defense: 2.0, kiRegen: 1.2, chargeRate: 1.2, guardStamina: 0.5, accel: 2.0 },
        drain: { kiPerSec: 3.2 },
        evade: { mode: 'god', chance: 0.8, gap: 16, kinds: ['sway', 'sway', 'parry', 'step'], swayPose: 'g_uiSlip', stepPose: 'g_uiSlip2', whiff: 22, kiCost: 4, trace: 0xeef2ff, swayVel: 2.4, stepVel: 5.5, overrun: 8 },
        // silver-white with cool blue in it, a brighter core: it surrounds the silhouette without hiding it
        aura: { color: 0xd8e4ff, core: 0xffffff, particles: 0xf2f4ff, idle: 0.6, speed: 1.4, sharp: 0.25, sparks: 0xb8c8ff, flame: [0xffffff, 0xd8e2ff, 0xa8c0ff, 0xf0f4ff], inner: { color: 0xffffff, core: 0xffffff, scale: 0.72, alpha: 0.75 }, trail: 0xe8f0ff },
        // a silver sheen over the whole body, stronger than the Sign's; the face at rest is calm, untroubled
        look: { hair: { style: 'goku_ui', color: 0xcdd3e2 }, pupil: 0xc8ccd8, brow: 0xc8ccd8, bulk: 1.04, tint: 0xb4c2f0, tintAmount: 0.09 },
        restFace: 'calm',
        poses: { idle: poses.g_uiStance },
        // decisive: shorter rests, and it closes in after a slip instead of watching
        ai: { personality: 'martial', aggression: 0.85, defense: 0.9, ranged: 0.3, beam: 0.5, preferredRange: 1.8, rhythm: { burst: 4, rest: 18 } },
        intro: { pose: 'g_uiStance', expression: 'calm' },
        victory: { poses: ['g_uiStance'], expression: 'calm' },
        ghost: 0xeef2ff,
        reactLine: 'react_ssj',
        music: 5,
      },
    ],
    poses,
    // on the skill wheel, in the god forms only: GOD BIND (Movie 2) — one enemy held in a crimson ring
    extras: [
      {
        id: 'godBind', name: 'God Bind', type: 'godBind', kiCost: 30, icon: 'guard', cooldown: 600, forms: ['god', 'blue'],
        range: 14, startup: 16, holdFrames: 150, kiPerSecond: 9, recovery: 20, color: 0xff2a48,
        poses: { hold: 'g_bind' },
      },
      // RADITZ RUSH — a game-original rush after the fight with Raditz (not a named technique): Goku's grounded
      // martial arts, in his base body (and Kaioken), earned for Free Battle by clearing "Saiyan Brothers"; the
      // story's own fight keeps its kit. Practical rather than grand: a stance, a shoulder-first rush, a knee that
      // doubles him up, a cross and an elbow, and a jumping side kick that sends him away. The cooperative
      // version with Piccolo belongs to that mission and is not this move
      {
        id: 'raditzRush', name: 'Raditz Rush', type: 'rush', kiCost: 45, icon: 'rush',
        forms: ['base', 'kaioken'], freeUnlock: 'saiyan_brothers', freeOnly: true,
        startup: 14, dashFrames: 30, speed: 46, recovery: 26,
        poses: { wind: 'g_raditzW', dash: 'g_raditzDash' },
        hits: [
          { pose: 'g_raditzKnee', damage: 700, frames: 14, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'g_cross', damage: 450, frames: 10, sfx: 'punchLight', hitPose: 'hitSideR' },
          { pose: 'g_elbow', damage: 500, frames: 12, sfx: 'punchHeavy', hitPose: 'hitLight' },
          { pose: 'g_raditzKick', damage: 1300, frames: 26, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 40, impact: 4, hitPose: 'hitHeavy' },
        ],
        // the normal camera for the stance; alongside him on the way in, both of them through the blows, wide on the kick
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.5 },
            { on: 'connect', shot: 'wide', dur: 0.9 },
            { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.25 },
          ],
        },
      },
      // NAPPA RUSH — a game-original rush after the fight with Nappa (not a named technique): the same base body
      // (and Kaioken), earned for Free Battle by clearing "Nappa Attacks"; the story's fight keeps its kit. Goku
      // makes the bigger fighter look slow: a low stance, a slip in under the swing, an elbow and a cross that
      // straighten him up, then he stands on his head for a moment and stamps him down into the ground
      {
        id: 'nappaRush', name: 'Nappa Rush', type: 'rush', kiCost: 45, icon: 'rush',
        forms: ['base', 'kaioken'], freeUnlock: 'saiyan_nappa', freeOnly: true,
        startup: 14, dashFrames: 30, speed: 46, recovery: 30,
        poses: { wind: 'g_nappaW', dash: 'g_nappaPass' },
        hits: [
          { pose: 'g_elbow', damage: 450, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'g_cross', damage: 450, frames: 12, sfx: 'punchLight', hitPose: 'hitLight' },
          { perch: 'head', pose: 'g_nappaPerch', frames: 30, hitPose: 'stand' },
          { pose: 'g_nappaStomp', damage: 1400, frames: 24, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 30, impact: 4, hitPose: 'hitHeavy' },
        ],
        // alongside him on the way in, both of them as it lands, low and up at him on the head, a short impact
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 0.5 },
            { on: 'perch', shot: 'perch', dur: 0.6 },
            { on: 'finish', shot: 'impact', dur: 0.7, quake: 0.3 },
          ],
        },
      },
      // DRAGON FIST (Wrath of the Dragon): Super Saiyan 3 only, earned for Free Battle by clearing Kid Buu (the
      // story's fights keep the kit they were tuned with). A rush: it can be side-stepped or guarded, and the
      // recovery is the punish; landed, a golden dragon rises out of the blow
      {
        id: 'dragonFist', name: 'Dragon Fist', type: 'rush', kiCost: 100, icon: 'rush', ultimate: true,
        forms: ['ssj3'], freeUnlock: 'buu_kidbuu', freeOnly: true,
        startup: 18, dashFrames: 30, speed: 52, recovery: 34,
        poses: { wind: 'g_dragonFistW', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_cross', damage: 1200, frames: 14, sfx: 'punchHeavy' },
          { pose: 'g_dragonFist', damage: 4800, frames: 30, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 46, impact: 5 },
        ],
        dragon: { color: 0xffc83a, core: 0xfff4c8 },
        // tight on the stance, low beside him as he goes, then wide on the one it hits as the dragon climbs
        cine: {
          steps: [
            { on: 'start', shot: 'charge', dur: 0.4 },
            { on: 'release', shot: 'track', dur: 0.8 },
            { on: 'finish', shot: 'impact', dur: 1.7, slow: [0.35, 0.3], quake: 0.5 },
          ],
        },
      },
      // ANGRY KAMEHAMEHA — story-inspired (the Namek finale's "You fool!": Frieza's shot into his back answered with a
      // one-handed wave), made a Super Saiyan wheel move for Free Battle (earned by clearing that finale, namek_end; the
      // story keeps its own scene). Quick to charge, gold outside and white inside, his face as he turns
      {
        id: 'angryKamehameha', name: 'Angry Kamehameha', type: 'beam', kiCost: 45, icon: 'beam',
        forms: ['ssj'], freeUnlock: 'namek_end', freeOnly: true,
        chargeMin: 26, chargeMax: 40, tiers: [26], damage: [2600, 2900], radius: [0.9, 1.05], speed: 120, range: 150, sustain: 34,
        color: 0xffd84a, core: 0xffffff, poses: { charge: 'g_angryKame', fire: 'g_angryKame' }, recovery: 24,
        sound: 'kame', chargeLight: 0xffe27a,
        cine: {
          steps: [
            { on: 'start', shot: 'face', dur: 0.45 },
            { on: 'release', shot: 'wide', dur: 1, quake: 0.3 },
          ],
        },
      },
      // METEOR COMBINATION — the Super Dragon Meteor idea from the games (game-style rush): an elbow, kicks that carry
      // him up into the air, Goku vanishing behind him for an axe-handle, then under him for a Kamehameha point blank.
      // Super Saiyan 2 only; earned for Free Battle like the form ("Prince of Saiyans", buu_pride)
      {
        id: 'meteorCombination', name: 'Meteor Combination', type: 'rush', kiCost: 55, icon: 'beam',
        forms: ['ssj2'], freeUnlock: 'buu_pride', freeOnly: true,
        startup: 12, dashFrames: 30, speed: 54, recovery: 34,
        poses: { wind: 'g_raditzW', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_elbow', damage: 450, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { pose: 'g_kick', damage: 300, frames: 8, sfx: 'punchLight', hitPose: 'hitLight', lift: 1.5 },
          { pose: 'g_spinKick', damage: 350, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideL', lift: 1.5 },
          { pose: 'hammer', damage: 600, frames: 14, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'g_meteorKame', damage: 1900, frames: 30, sfx: 'kiBlastBig', to: 'below', ki: { color: 0x3fb2ff, hand: 'both' }, beam: { length: 16, radius: 0.85, frames: 34, core: 0xe8f8ff }, explode: 1.2, knock: 'launch', knockSpeed: 40, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 1 },
            { on: 'finish', shot: 'wide', dur: 1, quake: 0.4 },
          ],
        },
      },
      // SUPER DRAGON TWIN FIST — Super Saiyan 3's second dragon (the games' "True Dragon Fist" idea; a game-style rush,
      // not the film's Dragon Fist, which stays its own ultimate): a blur of blows, a knee into the stomach, a sweep, both
      // palms through the guard, and a golden dragon uppercut that throws him into the sky. From low, up at the hair
      {
        id: 'superDragonTwinFist', name: 'Super Dragon Twin Fist', type: 'rush', kiCost: 60, icon: 'rush',
        forms: ['ssj3'], freeUnlock: 'buu_kidbuu', freeOnly: true,
        startup: 14, dashFrames: 30, speed: 52, recovery: 34,
        poses: { wind: 'g_dragonFistW', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_jab', damage: 150, frames: 4, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'g_cross', damage: 150, frames: 4, sfx: 'punchLight', hitPose: 'hitSideR' },
          { pose: 'g_jab', damage: 150, frames: 4, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'g_cross', damage: 150, frames: 4, sfx: 'punchLight', hitPose: 'hitSideL' },
          { pose: 'g_elbow', damage: 200, frames: 6, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'g_twinKnee', damage: 600, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'g_sweep', damage: 400, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { pose: 'g_twinPalms', damage: 500, frames: 12, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          { pose: 'g_dragonUpper', damage: 2200, frames: 30, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 52, impact: 5, hitPose: 'hitHeavy' },
        ],
        dragon: { color: 0xffc83a, core: 0xfff4c8, size: 0.9 },
        cine: {
          steps: [
            { on: 'start', shot: 'low', dur: 0.4 },
            { on: 'release', shot: 'track', dur: 0.5 },
            { on: 'connect', shot: 'wide', dur: 1 },
            { on: 'finish', shot: 'impact', dur: 1.3, quake: 0.45 },
          ],
        },
      },
      // DIVINE RUSH — Super Saiyan God (the PDF's "God Bound / Divine Rush"; a game-style rush): gliding in, palm thrusts,
      // two "God Shot" flicks of ki from the finger, a crimson ring of God Bind holding him, then the blazing shoulder
      // tackle. God only; earned for Free Battle like the form ("The Ritual", bog_ritual). Not the God Bind extra: that
      // one holds for as long as he pays; here the hold is one beat of the rush
      {
        id: 'divineRush', name: 'Divine Rush', type: 'rush', kiCost: 50, icon: 'rush',
        forms: ['god'], freeUnlock: 'bog_ritual', freeOnly: true,
        startup: 10, dashFrames: 30, speed: 56, recovery: 28,
        poses: { wind: 'g_godStance', dash: 'g_godPalm' },
        hits: [
          { pose: 'g_godPalm', damage: 350, frames: 8, sfx: 'punchLight', hitPose: 'hitBody' },
          { pose: 'g_godPalm', damage: 350, frames: 8, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'g_godShot', damage: 250, frames: 7, sfx: 'kiBlast', ki: { color: 0xff3a4a, hand: 'R' }, hitPose: 'hitLight' },
          { pose: 'g_godShot', damage: 250, frames: 9, sfx: 'kiBlast', ki: { color: 0xff3a4a, hand: 'R' }, hitPose: 'hitSideR' },
          { pose: 'g_bind', frames: 26, bind: { color: 0xff2a48 }, hitPose: 'hitBody' },
          { pose: 'g_shoulder', damage: 1800, frames: 26, sfx: 'kiBlastBig', ki: { color: 0xff5030, hand: 'L' }, explode: 1.3, knock: 'heavy', knockSpeed: 46, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 0.7 },
            { on: 'bind', shot: 'reverse', dur: 0.45 },
            { on: 'finish', shot: 'impact', dur: 0.9, quake: 0.4 },
          ],
        },
      },
      // GOD FIST RUSH — Super Saiyan Blue (the PDF's; a game-style rush): a gut punch, the spinning hook kick, Goku
      // behind him for a sledgehammer, then hovering over him with a God Kamehameha fired straight down. Blue only;
      // earned for Free Battle like the form
      {
        id: 'godFistRush', name: 'God Fist Rush', type: 'rush', kiCost: 55, icon: 'beam',
        forms: ['blue'], freeUnlock: ['rof_goku', 'bb_legend'], freeOnly: true,
        startup: 12, dashFrames: 30, speed: 56, recovery: 36,
        poses: { wind: 'g_raditzW', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_godFistGut', damage: 550, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'g_spinKick', damage: 450, frames: 12, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { pose: 'hammer', damage: 600, frames: 16, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'g_kameFire', damage: 2000, frames: 34, sfx: 'kiBlastBig', to: 'above', ki: { color: 0x40d8ff, hand: 'both' }, beam: { length: 12, radius: 0.9, frames: 36, core: 0xeafcff }, explode: 1.2, knock: 'smash', knockSpeed: 40, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.45 },
            { on: 'connect', shot: 'wide', dur: 0.8 },
            { on: 'finish', shot: 'impact', dur: 1, quake: 0.45 },
          ],
        },
      },
      // BLUE KAIOKEN RUSH — Super Saiyan Blue Kaioken (the PDF's "Kaioken x20 rush"; a game-style rush): blows from every
      // side as he flickers round him, then up above him and a red-and-blue Kamehameha fired down. "Twenty hits" is the
      // art direction, not twenty copies of one blow. Blue Kaioken only; earned like the form ("Goku vs Hit", u6_goku_hit)
      {
        id: 'blueKaiokenRush', name: 'Blue Kaioken Rush', type: 'rush', kiCost: 65, icon: 'beam',
        forms: ['blueKaioken'], freeUnlock: 'u6_goku_hit', freeOnly: true,
        startup: 10, dashFrames: 26, speed: 64, recovery: 36,
        poses: { wind: 'g_kaiokenFlex', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_jab', damage: 180, frames: 4, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'g_cross', damage: 180, frames: 4, sfx: 'punchLight', hitPose: 'hitBack', to: 'behind' },
          { pose: 'g_elbow', damage: 180, frames: 4, sfx: 'punchLight', hitPose: 'hitSideR', to: 'front' },
          { pose: 'g_kick', damage: 200, frames: 5, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'g_jab', damage: 180, frames: 4, sfx: 'punchLight', hitPose: 'hitLight', to: 'front' },
          { pose: 'g_spinKick', damage: 220, frames: 5, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'g_cross', damage: 200, frames: 4, sfx: 'punchLight', hitPose: 'hitSideL', to: 'front' },
          { pose: 'g_godFistGut', damage: 400, frames: 10, sfx: 'punchHeavy', hitPose: 'hitBody', lift: 2 },
          { pose: 'g_kameFire', damage: 2100, frames: 36, sfx: 'kiBlastBig', to: 'above', ki: { color: 0xff3a48, hand: 'both' }, beam: { length: 14, radius: 1.1, frames: 40, core: 0x8ad8ff }, explode: 1.4, knock: 'smash', knockSpeed: 44, impact: 5, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.35 },
            { on: 'connect', shot: 'wide', dur: 1 },
            { on: 'finish', shot: 'impact', dur: 1.1, quake: 0.5 },
          ],
        },
      },
      // DIVINE KAMEHAMEHA RUSH — Ultra Instinct -Sign- (the PDF's "Divine Kamehameha Rush"; for when nobody is firing a
      // beam at him): he glides in, up and over the other's head, and fires a Kamehameha into his chest point blank. The
      // dodging itself is the form's own evasion (form.evade). The surf along an enemy beam is Instinct Surf, below
      {
        id: 'divineKameRush', name: 'Divine Kamehameha Rush', type: 'rush', kiCost: 60, icon: 'beam',
        forms: ['uiSign'], freeUnlock: 'top_jiren', freeOnly: true,
        startup: 8, dashFrames: 30, speed: 58, recovery: 32,
        poses: { wind: 'g_uiStance', dash: 'g_uiSlip' },
        hits: [
          { pose: 'g_uiSlip2', frames: 14, move: true, to: 'above', hitPose: 'hitLight' },
          { pose: 'g_kameFire', damage: 2400, frames: 34, sfx: 'kiBlastBig', to: 'front', ki: { color: 0x9ad8ff, hand: 'both' }, beam: { length: 14, radius: 0.9, frames: 36, core: 0xffffff }, explode: 1.2, knock: 'heavy', knockSpeed: 46, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.5 },
            { on: 'connect', shot: 'wide', dur: 0.5 },
            { on: 'finish', shot: 'impact', dur: 1, quake: 0.4 },
          ],
        },
      },
      // UNLIKELY ALLIANCE — the PDF's Tournament of Power team rush (Goku in Blue and Golden Frieza against Dyspo; a game
      // rush): only with Golden Frieza fighting on your side (Free Battle / Training → Partner). Frieza is there at once on
      // the far side: his cage of light holds him, Goku's low kick, Frieza's tail, two finger lasers, Goku kicks him back
      // into them, and both fire at once — the Kamehameha and the Death Beam. Blue only; earned by clearing "The Final
      // Battle" (top_finale, where the two of them fight together). The same move led by Frieza is on his wheel
      {
        id: 'unlikelyAlliance', name: 'Unlikely Alliance', type: 'rush', kiCost: 60, icon: 'rush',
        forms: ['blue'], freeUnlock: 'top_finale', freeOnly: true,
        partner: { ids: ['frieza'], forms: ['golden'], name: 'Golden Frieza', range: 45, pose: 'idle' },
        startup: 10, dashFrames: 30, speed: 56, recovery: 32,
        poses: { wind: 'g_raditzW', dash: 'g_dragonFistDash' },
        hits: [
          { by: 'partner', pose: 'fz_aim', damage: 300, frames: 16, sfx: 'kiBlast', ki: { color: 0xffd060, hand: 'R' }, slashes: 8, slashColor: 0xffd060, hitPose: 'hitBody' },
          { pose: 'g_sweep', damage: 450, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { by: 'partner', pose: 'fz_tail', damage: 450, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { by: 'partner', pose: 'fz_aim', damage: 250, frames: 7, sfx: 'kiBlast', ki: { color: 0xff3a6a, hand: 'R' }, hitPose: 'hitLight' },
          { by: 'partner', pose: 'fz_aim', damage: 250, frames: 9, sfx: 'kiBlast', ki: { color: 0xff3a6a, hand: 'R' }, hitPose: 'hitLight' },
          { pose: 'g_kick', damage: 500, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBack' },
          { pose: 'g_kameFire', damage: 1800, frames: 32, sfx: 'kiBlastBig', ki: { color: 0x40d8ff, hand: 'both' }, beam: { length: 14, radius: 0.9, frames: 34, core: 0xeafcff }, partnerKi: { pose: 'fz_aim', color: 0xff3a6a, damage: 700, hand: 'R' }, explode: 1.2, knock: 'heavy', knockSpeed: 48, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: { steps: [{ on: 'release', shot: 'track', dur: 0.4 }, { on: 'connect', shot: 'wide', dur: 1.6 }, { on: 'finish', shot: 'impact', dur: 1, quake: 0.4 }] },
      },
      // THE SAIYAN CHARGE — "We Saiyans have no limits!" (Roadmap Three, the Goku Black arc research: CS-CHG-01 / CHG-S01,
      // and its section 5 "Super Saiyan Blue Dual Charge: a high-cost tag-team super with synchronized rush animations"):
      // only with Super Saiyan Blue Vegeta fighting on your side (Free Battle / Training → Partner). The same low stance side
      // by side, both auras up and the ground cracking under them; they kick off together (twin rings) and fly the charge
      // side by side — Goku on the right, Vegeta on the left (Fighter: sp.partner.alongside); Goku's right hook, Vegeta's
      // left hook, then both at once — a double blow bursting out in a ring. Blue only; earned with Vegito Blue ("Vegito",
      // ft_vegito, or "The Final Battle"). The same charge led by Vegeta is on his wheel. Provisional numbers (70 ki;
      // 650 + 650 + 1,900 + 900). The story's own charge waits on the owner (which fight, which targets: plan 9.17)
      {
        id: 'saiyanCharge', name: 'Saiyan Charge', type: 'rush', kiCost: 70, icon: 'rush',
        forms: ['blue'], freeUnlock: ['ft_vegito', 'top_finale'], freeOnly: true,
        partner: { ids: ['vegeta'], forms: ['blue'], name: 'Super Saiyan Blue Vegeta', range: 45, pose: 'v_hookW', alongside: 'left', windPose: 'powerCrouch', dashPose: 'v_dash', ignite: 0x4ad8ff },
        startup: 30, dashFrames: 34, speed: 64, recovery: 30,
        poses: { wind: 'powerCrouch', dash: 'dash' },
        hits: [
          { pose: 'g_cross', damage: 650, frames: 4, sfx: 'punchHeavy', hitPose: 'hitSideL', ring: { color: 0x4ad8ff, size: 1.2 } },
          { by: 'partner', pose: 'v_hook', damage: 650, frames: 16, sfx: 'punchHeavy', hitPose: 'hitBody', ring: { color: 0x4ad8ff, size: 1.2 } },
          { pose: 'g_cross', damage: 1900, frames: 30, sfx: 'punchHeavy', partnerKi: { pose: 'v_hook', color: 0x4ad8ff, damage: 900, hand: 'L' }, explode: 1.2, knock: 'heavy', knockSpeed: 46, impact: 5, hitPose: 'hitHeavy', ring: { color: 0xffffff, size: 2.4 } },
        ],
        cine: { steps: [{ on: 'start', shot: 'partnerLow', at: 2, dur: 0.5 }, { on: 'release', shot: 'track', dur: 0.5 }, { on: 'connect', shot: 'reverse', dur: 0.9 }, { on: 'finish', shot: 'impact', dur: 1, quake: 0.45 }] },
      },
      // THE SAIYAN ASSAULT (2026-10-19; Dragon Ball Super episode 65 — "Goku and Vegeta combine their power ... when they
      // attack Zamasu directly, he blocks them easily and knocks them down"; the owner remembers kicks and blows in
      // succession with slow motion. THE BLOWS, THEIR ORDER AND THE SLOW MOTION ARE AN ADAPTATION — no source gives them;
      // documentation/FUSED_ZAMASU_EPISODES_64_67.md): with Super Saiyan Blue Vegeta on the far side of him, blow for blow
      // from both sides — Goku's front kick, Vegeta's knee, Goku's spinning kick (slowed), Vegeta's spinning back kick,
      // Goku down on him from above with the axe kick (slowed), Vegeta's elbow, Goku back in front with the cross — and
      // both at once, the fist and Vegeta's kick (slowed). Blue only; earned with "Vegito" (ft_vegito: its played stretch
      // uses these blows and ends on the god catching the last). Provisional numbers (80 ki; 5,690 in all)
      {
        id: 'saiyanAssault', name: 'Saiyan Assault', type: 'rush', kiCost: 80, icon: 'rush',
        // (top_finale as the Saiyan Charge: a save that cleared The Final Battle before "Vegito" existed)
        forms: ['blue'], freeUnlock: ['ft_vegito', 'top_finale'], freeOnly: true,
        partner: { ids: ['vegeta'], forms: ['blue'], name: 'Super Saiyan Blue Vegeta', range: 45, pose: 'v_hookW' },
        startup: 14, dashFrames: 30, speed: 60, recovery: 34,
        poses: { wind: 'g_raditzW', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_kick', damage: 420, frames: 13, sfx: 'punchHeavy', hitPose: 'hitBody', ring: { color: 0x4ad8ff, size: 1 } },
          { by: 'partner', pose: 'v_knee', damage: 420, frames: 13, sfx: 'punchHeavy', hitPose: 'hitBack', ring: { color: 0x4ad8ff, size: 1 } },
          { pose: 'g_spinKick', damage: 520, frames: 16, sfx: 'punchHeavy', hitPose: 'hitSideL', ring: { color: 0x4ad8ff, size: 1.4 }, slow: { scale: 0.3, seconds: 0.35 } },
          { by: 'partner', pose: 'v_spinBack', damage: 520, frames: 14, sfx: 'punchHeavy', hitPose: 'hitSideR', ring: { color: 0x4ad8ff, size: 1.4 } },
          { to: 'above', pose: 'g_axeKick', damage: 650, frames: 18, sfx: 'punchHeavy', hitPose: 'hitHeavy', ring: { color: 0xffffff, size: 1.6 }, slow: { scale: 0.25, seconds: 0.45 } },
          { by: 'partner', pose: 'v_elbow', damage: 480, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { to: 'front', pose: 'g_cross', damage: 480, frames: 12, sfx: 'punchHeavy', hitPose: 'hitLight' },
          { pose: 'g_cross', damage: 1600, frames: 30, sfx: 'punchHeavy', partnerKi: { pose: 'v_atomicKick', color: 0x4ad8ff, damage: 600, hand: 'L' }, explode: 1.2, knock: 'heavy', knockSpeed: 44, impact: 5, hitPose: 'hitHeavy', ring: { color: 0xffffff, size: 2.4 }, slow: { scale: 0.2, seconds: 0.7 } },
        ],
        cine: { steps: [{ on: 'release', shot: 'track', dur: 0.5 }, { on: 'connect', shot: 'wide', dur: 1.8 }, { on: 'finish', shot: 'impact', dur: 1.1, quake: 0.5 }] },
      },
      // INSTINCT SURF — Ultra Instinct -Sign- (the PDF's "Surf" rush): only while an enemy beam is coming at him — he
      // rides along the top of it to the one firing it, flips over his head and fires a Kamehameha into his chest point
      // blank, ending the beam (techniques.js beamSurf). The wheel says when there is nothing to surf
      {
        id: 'instinctSurf', name: 'Instinct Surf', type: 'beamSurf', kiCost: 50, icon: 'beam',
        forms: ['uiSign'], freeUnlock: 'top_jiren', freeOnly: true,
        rideFrames: 32, flipFrames: 12, recovery: 30, damage: 3000, color: 0x9ad8ff,
        poses: { ride: 'g_uiSlip', flip: 'g_uiSlip2', fire: 'g_kameFire' },
        cine: { steps: [{ on: 'start', shot: 'track', dur: 0.6 }, { on: 'finish', shot: 'impact', dur: 1, quake: 0.4 }] },
      },
      // SILVER DRAGON STRIKE — Mastered Ultra Instinct (the PDF's; a game-style rush): he flickers round him in silver,
      // strike-lines cutting across his body faster than the eye, then a silver hook into the gut and a silver dragon
      // rising behind it. MUI only; earned like the form ("Mastered", top_mui)
      {
        id: 'silverDragonStrike', name: 'Silver Dragon Strike', type: 'rush', kiCost: 70, icon: 'rush', ultimate: true,
        forms: ['mui'], freeUnlock: 'top_mui', freeOnly: true,
        startup: 8, dashFrames: 26, speed: 62, recovery: 34,
        poses: { wind: 'g_uiStance', dash: 'g_uiSlip' },
        hits: [
          { pose: 'g_cross', damage: 300, frames: 6, sfx: 'punchLight', hitPose: 'hitSideR', slashes: 3, to: 'behind' },
          { pose: 'g_kick', damage: 300, frames: 6, sfx: 'punchLight', hitPose: 'hitBack', slashes: 3, to: 'front' },
          { pose: 'g_elbow', damage: 300, frames: 6, sfx: 'punchLight', hitPose: 'hitSideL', slashes: 4, to: 'behind' },
          { pose: 'g_silverHook', damage: 3600, frames: 32, sfx: 'punchHeavy', to: 'front', knock: 'launch', knockSpeed: 54, impact: 5, hitPose: 'hitHeavy', slashes: 6 },
        ],
        dragon: { color: 0xdfe6ff, core: 0xffffff, size: 1.1 },
        cine: {
          steps: [
            { on: 'start', shot: 'face', dur: 0.4 },
            { on: 'release', shot: 'track', dur: 0.4 },
            { on: 'connect', shot: 'wide', dur: 0.6 },
            { on: 'finish', shot: 'impact', dur: 1.6, slow: [0.4, 0.25], quake: 0.5 },
          ],
        },
      },
    ],
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
        // outside the story the lens snaps in behind the one he reappeared behind, and the wave comes at it
        instant: { name: 'Instant Kamehameha', chargeMin: 6, chargeMax: 16, damageMul: 0.9, kiCost: 25, cine: { steps: [{ on: 'start', shot: 'reverse', dur: 0.9 }] } },
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
        // outside the story: low behind him as it grows over his head, then wide on the arena it will fall on;
        // released, the lens rides behind it to the explosion
        cine: {
          steps: [
            { on: 'start', shot: 'rise', dur: 2.6 },
            { on: 'start', at: 156, shot: 'wide', dur: 2.6 },
            { on: 'release', shot: 'follow' },
          ],
        },
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'Vanishing and Perfect Guards cost less and empower your next strikes. Every hit taken or blocked teaches him the fight: a full Adaptation meter empowers him too. Near defeat, a Saiyan surge restores ki.' },
    ai: { personality: 'martial', aggression: 0.8, defense: 0.62, ranged: 0.4, beam: 0.55, transformHp: 0.55, preferredRange: 2.5, hooks: 'goku' },
    barks: { combo: 'goku_combo', hurt: 'goku_hurt', lowHp: 'goku_lowHp', ultimate: 'goku_ultimateTaunt', reactTransform: 'goku_reactTransform' },
    intro: { pose: 'g_introPalm', expression: 'smirk' },
    victory: { poses: ['g_victory', 'g_victoryFist'], expression: 'grin' },
    defeat: { pose: 'g_defeatKnee', expression: 'hurt' },
  };
  // MASTERED ULTRA INSTINCT's own timing: the same hands with no wasted motion — each strike starts sooner, closes
  // further and he is set again sooner, so the counter lands inside the opening a slip makes
  {
    const G = SL.data.characters.goku, mui = G.forms.find((f) => f.id === 'mui');
    mui.moves = {
      light: G.moves.light.map((m) => Object.assign({}, m, { startup: Math.max(2, m.startup - 2), recovery: Math.max(5, m.recovery - 4), cancel: m.cancel && Math.max(3, m.cancel - 2), lunge: (m.lunge || 0) * 1.3 })),
    };
  }
})();
