/*
 * MAJIN BUU (Buu Saga, Age 774) — the first shape: the one that comes out of the ball.
 *
 * He is not a big fighter with a lot of health. Everything about him says that the
 * normal answers do not work:
 *   - a punch into the front of him sinks into his belly and bounces back (the gut
 *     takes most of it); strikes from behind, from above, and anything that launches
 *     or smashes land in full;
 *   - what does hurt him leaves a hole, and the hole closes while you watch (the HP
 *     comes back with it, visibly: the wound shrinks, steam, the skin pulls shut);
 *   - hurt him badly enough and he comes apart — pieces on the ground, pink smoke —
 *     and then the pieces crawl back together and he is whole again, laughing;
 *   - his arm stretches across the field to grab you; his antenna turns you into
 *     candy, and then he comes to eat you (struggle out before he gets there);
 *   - he plays: he dances, pats his belly and laughs in the middle of a fight — and
 *     then, without warning, he is on you.
 *
 * The body, the holes, the reform and the candy are the `majinBody` mechanic
 * (src/game/mechanics.js), the play-then-violence rhythm is the `buu` AI hook
 * (src/game/controllers.js), and the numbers live in `majin` below.
 *
 * Level 1 functional prototype (procedural body). Playable in Free Battle after "The Prince's Pride" (unlocks.js).
 */
(function () {
  'use strict';

  const PINK = 0xf2a2c4, VEST = 0x2c1e3e, TRIM = 0xe8c64a, CAPE = 0x6a2c8a, WHITE = 0xf4f2ec;

  const poses = {
    // bouncing on his heels, arms held out from a body too round to hang them against
    bu_idle: (t) => {
      const b = Math.sin(t * 3.2);
      return {
        root: { y: 0.01 + Math.abs(b) * 0.03 },
        hips: [0, b * 4, 0], spine: [-4, 0, b * 2], chest: [-2, 0, 0], head: [-6, b * 6, b * 4],
        shoulderL: [-10, 0, 46], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -46], elbowR: [-30, 0, 0],
        thighL: [-6, 0, 14], kneeL: [10, 0, 0], thighR: [-6, 0, -14], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // hands on the belly, patting it
    bu_bellyPat: (t) => {
      const b = Math.sin(t * 9);
      return {
        root: { y: 0.01 }, spine: [-8, 0, 0], chest: [-6, 0, 0], head: [-14, 0, 0],
        shoulderL: [-38, 0, 22], elbowL: [-70 + b * 12, 0, 0], shoulderR: [-38, 0, -22], elbowR: [-70 - b * 12, 0, 0],
        thighL: [-4, 0, 14], kneeL: [8, 0, 0], thighR: [-4, 0, -14], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a little dance: arms up and waving, weight from foot to foot
    bu_dance: (t) => {
      const b = Math.sin(t * 6);
      return {
        root: { y: 0.02 + Math.abs(b) * 0.05, rz: b * 6 },
        hips: [0, b * 14, 0], spine: [-4, -b * 8, b * 6], chest: [0, 0, 0], head: [-8, b * 10, -b * 8],
        shoulderL: [-150 + b * 20, 0, 30], elbowL: [-40, 0, 0], shoulderR: [-150 - b * 20, 0, -30], elbowR: [-40, 0, 0],
        thighL: [-14 - b * 18, 0, 14], kneeL: [22 + Math.max(0, b) * 30, 0, 0], thighR: [-14 + b * 18, 0, -14], kneeR: [22 + Math.max(0, -b) * 30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // head back, laughing, hands on the belly
    bu_laugh: (t) => {
      const b = Math.sin(t * 14);
      return {
        root: { y: 0.01 + Math.abs(b) * 0.02 }, spine: [-14, 0, 0], chest: [-10, 0, 0], head: [-26 + b * 5, 0, 0],
        shoulderL: [-30, 0, 30], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-80, 0, 0],
        thighL: [-4, 0, 14], kneeL: [6, 0, 0], thighR: [-4, 0, -14], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // sulking: arms down, head down, pouting
    bu_sulk: {
      root: { y: -0.01 }, spine: [8, 0, 0], chest: [4, 0, 0], head: [22, 0, 0],
      shoulderL: [6, 0, 30], elbowL: [-10, 0, 0], shoulderR: [6, 0, -30], elbowR: [-10, 0, 0],
      thighL: [-2, 0, 14], kneeL: [4, 0, 0], thighR: [-2, 0, -14], kneeR: [4, 0, 0],
      hands: ['fist', 'fist'],
    },
    // angry: fists down at his sides, steam coming out of his head
    bu_angry: (t) => {
      const b = Math.sin(t * 22);
      return {
        root: { y: -0.03 + b * 0.004 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [8, 0, b * 3],
        shoulderL: [4, 0, 36], elbowL: [-24, 0, 0], shoulderR: [4, 0, -36], elbowR: [-24, 0, 0],
        thighL: [-16, 0, 18], kneeL: [26, 0, 0], thighR: [-16, 0, -18], kneeR: [26, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // belly bump: lean back, then drive the belly into you
    bu_bumpW: {
      root: { y: -0.02, rx: -14 }, spine: [-18, 0, 0], chest: [-10, 0, 0], head: [8, 0, 0],
      shoulderL: [30, 0, 40], elbowL: [-20, 0, 0], shoulderR: [30, 0, -40], elbowR: [-20, 0, 0],
      thighL: [-6, 0, 14], kneeL: [18, 0, 0], thighR: [10, 0, -14], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    bu_bump: {
      root: { y: 0.02, rx: 16 }, spine: [16, 0, 0], chest: [4, 0, 0], head: [-14, 0, 0],
      shoulderL: [40, 0, 50], elbowL: [-10, 0, 0], shoulderR: [40, 0, -50], elbowR: [-10, 0, 0],
      thighL: [-34, 0, 14], kneeL: [30, 0, 0], thighR: [16, 0, -14], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    // an open-handed slap, big and round
    bu_slapW: {
      root: { y: -0.01 }, spine: [0, 30, 0], chest: [0, 24, 0], head: [0, -24, 0],
      shoulderR: [-60, 0, -100], elbowR: [-30, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 14], kneeL: [16, 0, 0], thighR: [8, 0, -14], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    bu_slap: {
      root: { y: -0.02 }, spine: [4, -34, 0], chest: [4, -30, 0], head: [-4, 24, 0],
      shoulderR: [-90, 0, 20], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-40, 0, 0],
      thighL: [-18, 0, 14], kneeL: [22, 0, 0], thighR: [10, 0, -14], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    // head-butt: the antenna whips forward
    bu_buttW: {
      root: { y: 0, rx: -10 }, spine: [-14, 0, 0], chest: [-10, 0, 0], head: [-24, 0, 0],
      shoulderL: [20, 0, 40], elbowL: [-30, 0, 0], shoulderR: [20, 0, -40], elbowR: [-30, 0, 0],
      thighL: [-6, 0, 14], kneeL: [14, 0, 0], thighR: [4, 0, -14], kneeR: [12, 0, 0],
      hands: ['fist', 'fist'],
    },
    bu_butt: {
      root: { y: -0.02, rx: 22 }, spine: [18, 0, 0], chest: [14, 0, 0], head: [26, 0, 0],
      shoulderL: [30, 0, 30], elbowL: [-20, 0, 0], shoulderR: [30, 0, -30], elbowR: [-20, 0, 0],
      thighL: [-30, 0, 14], kneeL: [30, 0, 0], thighR: [14, 0, -14], kneeR: [10, 0, 0],
      hands: ['fist', 'fist'],
    },
    // belly flop: up, and all of him comes down on you
    bu_flopW: {
      root: { y: 0.1, rx: -18 }, spine: [-16, 0, 0], chest: [-12, 0, 0], head: [-16, 0, 0],
      shoulderL: [-170, 0, 30], elbowL: [-20, 0, 0], shoulderR: [-170, 0, -30], elbowR: [-20, 0, 0],
      thighL: [-40, 0, 20], kneeL: [70, 0, 0], thighR: [-40, 0, -20], kneeR: [70, 0, 0],
      hands: ['open', 'open'],
    },
    bu_flop: {
      root: { y: -0.1, rx: 40 }, spine: [24, 0, 0], chest: [16, 0, 0], head: [-20, 0, 0],
      shoulderL: [-100, 0, 60], elbowL: [-10, 0, 0], shoulderR: [-100, 0, -60], elbowR: [-10, 0, 0],
      thighL: [10, 0, 20], kneeL: [30, 0, 0], thighR: [10, 0, -20], kneeR: [30, 0, 0],
      hands: ['open', 'open'],
    },
    // the rolling charge: tucked into a ball
    bu_roll: {
      root: { y: -0.06, rx: 30 }, spine: [30, 0, 0], chest: [20, 0, 0], head: [30, 0, 0],
      shoulderL: [-60, 0, 20], elbowL: [-110, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-110, 0, 0],
      thighL: [-80, 0, 16], kneeL: [110, 0, 0], thighR: [-80, 0, -16], kneeR: [110, 0, 0],
      hands: ['fist', 'fist'],
    },
    // the antenna: head down and aimed, both hands framing it
    bu_candyW: {
      root: { y: -0.01 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [30, 0, 0],
      shoulderL: [-70, 0, 30], elbowL: [-80, 0, 0], shoulderR: [-70, 0, -30], elbowR: [-80, 0, 0],
      thighL: [-10, 0, 14], kneeL: [14, 0, 0], thighR: [-2, 0, -14], kneeR: [10, 0, 0],
      hands: ['point', 'point'],
    },
    bu_candy: {
      root: { y: -0.01 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [38, 0, 0],
      shoulderL: [-60, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-60, 0, -40], elbowR: [-60, 0, 0],
      thighL: [-10, 0, 14], kneeL: [14, 0, 0], thighR: [-2, 0, -14], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    // the rubber arm: wound back, then thrown across the field
    bu_armW: {
      root: { y: -0.02 }, spine: [0, 34, 0], chest: [0, 26, 0], head: [0, -30, 0],
      shoulderR: [-40, 0, -60], elbowR: [-100, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-50, 0, 0],
      thighL: [-14, 0, 14], kneeL: [18, 0, 0], thighR: [10, 0, -14], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
    bu_arm: {
      root: { y: -0.02 }, spine: [4, -20, 0], chest: [4, -20, 0], head: [0, 16, 0],
      shoulderR: [-92, 0, -4], elbowR: [0, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-50, 0, 0],
      thighL: [-18, 0, 14], kneeL: [22, 0, 0], thighR: [10, 0, -14], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    // a ki ball held over his head, then thrown
    bu_ballW: {
      root: { y: 0.02 }, spine: [-10, 0, 0], chest: [-8, 0, 0], head: [-18, 0, 0],
      shoulderL: [-170, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-30, 0, 0],
      thighL: [-8, 0, 16], kneeL: [12, 0, 0], thighR: [-8, 0, -16], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    bu_ball: {
      root: { y: -0.02, rx: 10 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [0, 0, 0],
      shoulderL: [-80, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-80, 0, -20], elbowR: [-10, 0, 0],
      thighL: [-24, 0, 16], kneeL: [26, 0, 0], thighR: [10, 0, -16], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    // eating: both hands at the mouth
    bu_eat: (t) => {
      const b = Math.sin(t * 12);
      return {
        root: { y: 0.01 }, spine: [-4, 0, 0], chest: [-4, 0, 0], head: [-4 + b * 6, 0, 0],
        shoulderL: [-70, 0, 20], elbowL: [-120, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-120, 0, 0],
        thighL: [-4, 0, 14], kneeL: [8, 0, 0], thighR: [-4, 0, -14], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // stretching after waking up
    bu_stretch: {
      root: { y: 0.03 }, spine: [-16, 0, 0], chest: [-12, 0, 0], head: [-24, 0, 0],
      shoulderL: [-176, 0, 14], elbowL: [-6, 0, 0], shoulderR: [-176, 0, -14], elbowR: [-6, 0, 0],
      thighL: [-2, 0, 12], kneeL: [2, 0, 0], thighR: [-2, 0, -12], kneeR: [2, 0, 0],
      hands: ['fist', 'fist'],
    },
    // down on his knees over something small, both hands open above it: the healing
    bu_heal: (t) => {
      const b = Math.sin(t * 5);
      return {
        root: { y: -0.3, rx: 16 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [24, 0, 0],
        shoulderL: [-58 + b * 3, 0, 12], elbowL: [-24, 0, 0], shoulderR: [-58 - b * 3, 0, -12], elbowR: [-24, 0, 0],
        thighL: [-64, 0, 18], kneeL: [104, 0, 0], thighR: [-64, 0, -18], kneeR: [104, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the puppy held against his chest
    bu_cradle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: b * 0.006 }, spine: [4, b * 3, 0], chest: [2, 0, 0], head: [22, 0, b * 4],
        shoulderL: [-46, 0, 8], elbowL: [-104, 0, 0], shoulderR: [-46, 0, -8], elbowR: [-104, 0, 0],
        thighL: [-4, 0, 14], kneeL: [6, 0, 0], thighR: [-4, 0, -14], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // surprise: hands up, open
    bu_shock: {
      root: { y: 0.02, rx: -8 }, spine: [-10, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 0],
      shoulderL: [-100, 0, 44], elbowL: [-70, 0, 0], shoulderR: [-100, 0, -44], elbowR: [-70, 0, 0],
      thighL: [-4, 0, 14], kneeL: [8, 0, 0], thighR: [-4, 0, -14], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    // the rage he promised not to have: fists shaking at his sides, head down, all of him trembling
    bu_rage: (t) => {
      const s = Math.sin(t * 46) * 2.4, w = Math.sin(t * 31) * 1.6;
      return {
        root: { y: -0.06 + s * 0.004, rx: 4 }, spine: [8, 0, w], chest: [6, 0, -w], head: [6, s, w],
        shoulderL: [14, 0, 30 + s], elbowL: [-40, 0, 0], shoulderR: [14, 0, -30 - s], elbowR: [-40, 0, 0],
        thighL: [-20, 0, 18], kneeL: [30, 0, 0], thighR: [-20, 0, -18], kneeR: [30, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // and the scream, when it comes out of him: head back, arms thrown wide
    bu_scream: (t) => {
      const s = Math.sin(t * 40) * 2;
      return {
        root: { y: 0.02 + s * 0.003, rx: -12 }, spine: [-14, 0, s], chest: [-14, 0, 0], head: [-36, 0, s],
        shoulderL: [-40, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-40, 0, -70], elbowR: [-30, 0, 0],
        thighL: [-12, 0, 22], kneeL: [16, 0, 0], thighR: [-12, 0, -22], kneeR: [16, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // sitting on the ground, legs out
    bu_sit: {
      root: { y: -0.48, rx: -6 }, spine: [-6, 0, 0], chest: [0, 0, 0], head: [-6, 0, 0],
      shoulderL: [-20, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-40, 0, 0],
      thighL: [-86, 0, 20], kneeL: [10, 0, 0], thighR: [-86, 0, -20], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.majin_buu = {
    id: 'majin_buu',
    assetLevel: 1,
    name: 'Majin Buu',
    fullName: 'Majin Buu',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Unkillable',
    blurb: 'A child with no rules and a body that does not stay broken. He plays with you. Then he stops playing.',
    ratings: { power: 4, speed: 3, ki: 4, defense: 4 },
    stats: { hp: 30000, ki: 160, stamina: 200, speed: 1.02, power: 1.25, defense: 1.1, weight: 1.6, kiRegen: 3, chargeRate: 30, canonPower: 2.2 },
    poise: { max: 160, armor: 1, regen: 22, regenDelay: 70, breakFrames: 70, vulnerable: 1.3, beamMul: 1.2, cost: { 1: 8, 2: 16, 3: 28, 4: 44 } },
    appearance: {
      height: 1.14,
      skin: PINK,
      build: {
        hipY: 0.74, pelvisW: 0.25, pelvisH: 0.13, pelvisD: 0.22,
        waistW: 0.34, waistD: 0.33, absLen: 0.22,
        chestW: 0.32, chestD: 0.27, chestTop: 0.24, shoulderX: 0.29, shoulderY: 0.19, delt: 0.1,
        upperArmLen: 0.25, upperArmR: 0.086, foreArmLen: 0.23, foreArmR: 0.076, fist: 0.078,
        hipX: 0.13, thighLen: 0.33, thighR: 0.12, shinLen: 0.3, shinR: 0.092,
        neckLen: 0.03, neckR: 0.1, headR: 0.14, footLen: 1.15,
      },
      hair: { style: 'bald', color: PINK },
      headExtras: [
        // the antenna, curling back over the head
        { a: [0, 0.96, 0.22], d: [0, 0.7, -0.72], l: 0.22, r: 0.05, color: PINK, depth: 0.96 },
        { a: [0, 0.78, -0.52], d: [0, -0.4, -1], l: 0.1, r: 0.034, color: PINK, depth: 1.18 },
        // the holes his steam comes out of
        { shape: 'ball', a: [0.62, 0.62, -0.46], d: [0.7, 0.5, -0.5], l: 0.02, r: 0.02, color: 0x6a2a4a, depth: 0.99, flat: 0.4, outline: 0 },
        { shape: 'ball', a: [-0.62, 0.62, -0.46], d: [-0.7, 0.5, -0.5], l: 0.02, r: 0.02, color: 0x6a2a4a, depth: 0.99, flat: 0.4, outline: 0 },
        { shape: 'ball', a: [0.84, 0.1, 0.02], d: [1, 0.1, 0], l: 0.02, r: 0.018, color: 0x6a2a4a, depth: 0.99, flat: 0.4, outline: 0 },
        { shape: 'ball', a: [-0.84, 0.1, 0.02], d: [-1, 0.1, 0], l: 0.02, r: 0.018, color: 0x6a2a4a, depth: 0.99, flat: 0.4, outline: 0 },
      ],
      face: { noEars: true, pupil: 0x1a0a14, eyeW: 0.72, browThick: 1.3, brow: 0x1a0a14 },
      outfit: {
        topStyle: 'bare', top: PINK, arms: PINK,
        // the 2026-10-15 visual pass (the board p.42): the short vest closes in to frame the chest from the front (it sat
        // round the back only), the wide black belt sits UNDER the belly round the top of the trousers (it stood out of
        // his sides like a ring) with the gold plate of the Majin mark in front, and the cape is knotted at the throat
        jacket: { color: VEST, collar: TRIM, open: 1.22, short: true },
        belly: true,
        cape: CAPE,
        pants: WHITE, pantsStyle: 'gi',
        belt: 0x1a1a22, beltStyle: 'sash', beltAt: -0.1, beltFit: 0.86,
        gloves: WHITE, wrist: TRIM,
        boots: 0xe0b84a, bootTip: 0x1a1a1a, bootStyle: 'saiyan',
      },
      props: [
        { id: 'majinPlate', joint: 'spine', shape: 'tri', pos: [0, -0.1, 0.395], rot: [-0.1, 0, 0], size: [0.075, 0.055, 0.02], color: TRIM, mark: 'majin' },
        { id: 'capeKnot', joint: 'chest', shape: 'ball', pos: [0, 0.24, 0.29], size: [0.055, 0.045, 0.04], color: CAPE },
        { id: 'capeTailL', joint: 'chest', shape: 'tri', pos: [0.045, 0.19, 0.31], rot: [-0.3, 0, 0.35], size: [0.035, 0.06, 0.008], color: CAPE },
        { id: 'capeTailR', joint: 'chest', shape: 'tri', pos: [-0.045, 0.19, 0.31], rot: [-0.3, 0, -0.35], size: [0.035, 0.06, 0.008], color: CAPE },
      ],
      portraitColor: '#f2a2c4',
    },
    vfx: { ghost: 0xffb8d8, trail: 0xffc8e0 },
    audio: { strikePitch: 0.78, heavyPitch: 0.66 },
    // no idle glow: he is not powering up, he is just standing there
    forms: [{ id: 'base', name: 'Majin', aura: { color: 0xff8ac4, core: 0xffe0f0, particles: 0xffa8d8, idle: 0, speed: 1.1 }, mult: {} }],
    poses: Object.assign({ idle: poses.bu_idle }, poses),
    sequences: {
      intro: [
        { pose: 'bu_stretch', dur: 0.9, speed: 6, expression: 'grin' },
        { pose: 'bu_bellyPat', dur: 1, speed: 8, expression: 'grin' },
      ],
      victory: [[{ pose: 'bu_dance', dur: 9, speed: 6, expression: 'grin' }]],
      defeat: [{ pose: 'bu_sulk', dur: 9, speed: 4, expression: 'hurt' }],
    },
    moves: {
      light: [
        { id: 'buSlap', startup: 6, active: 4, recovery: 12, cancel: 7, damage: 480, reach: 1.45, radius: 0.9, lunge: 10, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'bu_slapW', strike: 'bu_slap' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'buBump', startup: 7, active: 4, recovery: 14, cancel: 8, damage: 560, reach: 1.3, radius: 1.0, lunge: 12, hitstun: 24, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'bu_bumpW', strike: 'bu_bump' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'buButt', startup: 8, active: 4, recovery: 15, cancel: 9, damage: 640, reach: 1.25, radius: 0.9, lunge: 12, hitstun: 26, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'bu_buttW', strike: 'bu_butt' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'buFlop', startup: 16, active: 6, recovery: 26, damage: 1500, reach: 1.6, radius: 1.35, lunge: 14, hitstun: 36, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 45, pose: { wind: 'bu_flopW', strike: 'bu_flop' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'buUpper', startup: 10, active: 4, recovery: 20, damage: 900, reach: 1.3, radius: 0.95, lunge: 10, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      },
      dash: { id: 'buRoll', startup: 8, active: 12, recovery: 20, damage: 980, reach: 1.4, radius: 1.2, lunge: 36, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'bu_roll', strike: 'bu_roll' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      throw: { id: 'buSquash', name: 'Big Squeeze', damage: 1300, knockSpeed: 20, poses: ['grab', 'bu_bumpW', 'bu_bump'] },
    },
    specials: {
      // the antenna: a thin pink ray; whatever it touches becomes candy, and he is hungry
      special1: {
        id: 'candyBeam', name: 'Candy Beam', type: 'projectile', kiCost: 30, icon: 'beam', fromHead: true,
        startup: 22, aimLock: 10, recovery: 26, pose: { wind: 'bu_candyW', release: 'bu_candy' },
        projectile: { kind: 'ball', speed: 62, radius: 0.22, damage: 120, homing: 0.18, color: 0xff6ac4, core: 0xffffff, explode: 0.5, knock: 'flinch', knockSpeed: 2, impact: 1, life: 1.6, stone: { frames: 200, mash: 9, kind: 'candy' } },
      },
      // his arm crosses the field, catches you and reels you in
      special2: {
        id: 'rubberArm', name: 'Rubber Arm', type: 'stretchGrab', kiCost: 20, icon: 'rush', cooldown: 110,
        reach: 15, extendFrames: 11, pullFrames: 14, damage: 520, hitstunAfter: 34, recovery: 20, armLength: 0.44,
        poses: { wind: 'bu_armW', reach: 'bu_arm' },
      },
      ultimate: {
        id: 'vanishingBall', name: 'Vanishing Ball', type: 'projectile', kiCost: 80, icon: 'ball', ultimate: true,
        startup: 34, recovery: 30, pose: { wind: 'bu_ballW', release: 'bu_ball' },
        projectile: { kind: 'ball', speed: 30, radius: 1.5, damage: 3600, homing: 0.6, color: 0xff7ab8, core: 0xffffff, explode: 9, knock: 'heavy', knockSpeed: 30, impact: 4, life: 4 },
      },
    },
    boss: {
      phases: [
        // playing: most of what he does is showing off; some of it hurts
        { id: 'playing', label: 'PLAYING', hpAbove: 0.55, speed: 1, damage: 1, patience: 1.5, patterns: { melee: 1, candy: 0.3, arm: 0.45 } },
        // annoyed: the steam comes out of his head, and he stops showing off
        { id: 'annoyed', label: 'ANNOYED', hpAbove: 0, speed: 1.1, damage: 1.18, patience: 0.6, line: 'buu_annoyed', patterns: { melee: 1.2, candy: 0.5, arm: 0.6, ball: 0.3 } },
      ],
      patterns: {
        candy: { slot: 'special1', minDist: 3, maxDist: 20, cooldown: 480, ranged: true },
        arm: { slot: 'special2', minDist: 4.5, maxDist: 15, cooldown: 300 },
        ball: { slot: 'ultimate', minDist: 8, cooldown: 900, ranged: true },
      },
      techniques: {},
    },
    // the body the mechanic reads (see Mechanics.majinBody)
    majin: {
      gut: 0.45, // a light strike into the front of him keeps this much of its damage
      holeHeal: 0.55, // of what a wound took, this much grows back while it closes
      holeSeconds: 2.2,
      breakAt: [0.5, 0], // coming apart at half, and at the end
      reformTo: 0.85,
      reformSeconds: 2.8,
      maxReforms: 2, // outside a story that says otherwise, the third time he stays down
      candyEat: { reach: 1.7, damage: 0.2, heal: 0.08 },
    },
    mechanic: { type: 'majinBody', name: 'Majin Body', desc: 'Punches sink into his belly. Wounds close while you watch, and when he comes apart he puts himself back together. The candy ray: struggle out before he eats you.' },
    ai: { personality: 'berserker', aggression: 0.72, defense: 0.25, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 1.8, hooks: 'buu', rhythm: { burst: 3, rest: 100 } },
    barks: { hurt: 'buu_hurt', lowHp: 'buu_annoyed', taunt: 'buu_taunt' },
    intro: { pose: 'bu_bellyPat', expression: 'grin' },
    victory: { poses: ['bu_dance'], expression: 'grin' },
    defeat: { pose: 'bu_sulk', expression: 'hurt' },
  };
})();
