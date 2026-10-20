/*
 * ZARBON — Frieza's other right hand, and the opposite of Dodoria in every way.
 *
 *   NORMAL FORM: elegant, fast, technical. He fights at arm's length with clean
 *   strikes, glides in and out, blinks away from pressure (Mirage) and punishes
 *   from range with the Elegant Blast. Low poise: he is not armored, he is not
 *   supposed to trade — he is supposed to not be there.
 *
 *   MONSTROUS FORM: everything reverses. Slower, heavier, armored, short-ranged,
 *   and far more dangerous up close: crushing smashes, a leaping pounce and a
 *   wave fired point blank. He stops evading and starts walking through hits.
 *
 * Both forms share slots (special1/special2/ultimate) but the monstrous form
 * overrides the moves and the specials, so the fight genuinely changes rather
 * than the numbers moving. The boss phases follow the forms.
 * PROTOTYPE body (Level 1) on the shared procedural rig.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const SKIN = 0x86c98c;
  const SKIN_BEAST = 0x5f9f63;
  const HAIR = 0x2f6a4a;
  const ARMOR_WHITE = 0xf2eee2;
  const ARMOR_TRIM = 0x3f7fa8;

  const poses = {
    // ---------- normal form: upright, poised, hands relaxed ----------
    idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.02 + b * 0.01 }, hips: [0, -12, 0], spine: [-2, 6, 0], chest: [-4, 10, 0], head: [-4, -6, 0],
        shoulderL: [-14, 0, 16], elbowL: [-38, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-30, 0, 0],
        thighL: [-6, 8, 10], kneeL: [10, 0, 0], thighR: [6, -8, -10], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_flourish: (t) => {
      const s = Math.sin(t * 3) * 3;
      return {
        root: { y: 0 }, chest: [-6, 14, 0], head: [-10, -16, 4],
        shoulderR: [-128 + s, 0, -18], elbowR: [-46, 0, 0], handR: [-20, 0, 0],
        shoulderL: [-8, 0, 22], elbowL: [-34, 0, 0],
        thighL: [-4, 6, 10], kneeL: [6, 0, 0], thighR: [4, -6, -10], kneeR: [5, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_jabW: {
      root: { y: -0.04, rx: -2 }, hips: [0, -20, 0], spine: [2, -14, 0], chest: [2, -24, 0], head: [-6, 22, 0],
      shoulderR: [-36, 0, -24], elbowR: [-96, 0, 0], shoulderL: [-20, 0, 26], elbowL: [-70, 0, 0],
      thighL: [-14, 10, 12], kneeL: [20, 0, 0], thighR: [10, -10, -12], kneeR: [16, 0, 0],
    },
    zb_jab: {
      root: { y: -0.04, rx: 4 }, hips: [0, 14, 0], spine: [4, 16, 0], chest: [4, 30, 0], head: [-8, -24, 0],
      shoulderR: [-88, 0, -6], elbowR: [-6, 0, 0], handR: [-10, 0, 0],
      shoulderL: [-14, 0, 30], elbowL: [-86, 0, 0],
      thighL: [-22, 8, 12], kneeL: [28, 0, 0], thighR: [16, -8, -12], kneeR: [12, 0, 0],
    },
    zb_elbowW: {
      root: { y: -0.04 }, spine: [4, 18, 0], chest: [6, 26, 0], head: [-6, -20, 0],
      shoulderL: [-56, 0, 30], elbowL: [-120, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-90, 0, 0],
      thighL: [-16, 10, 12], kneeL: [22, 0, 0], thighR: [12, -10, -12], kneeR: [14, 0, 0],
    },
    zb_elbow: {
      root: { y: -0.05, rx: 6 }, spine: [6, -18, 0], chest: [8, -30, 0], head: [-10, 26, 0],
      shoulderL: [-74, 0, -16], elbowL: [-104, 0, 0], shoulderR: [-18, 0, -26], elbowR: [-80, 0, 0],
      thighL: [-26, 10, 12], kneeL: [32, 0, 0], thighR: [18, -10, -12], kneeR: [14, 0, 0],
    },
    zb_kickW: {
      root: { y: -0.02, rx: -4 }, spine: [-4, -12, 0], chest: [-4, -18, 0], head: [-6, 20, 0],
      shoulderL: [-40, 0, 34], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -34], elbowR: [-60, 0, 0],
      thighR: [-52, 0, -10], kneeR: [86, 0, 0], footR: [20, 0, 0], thighL: [6, 0, 10], kneeL: [10, 0, 0],
    },
    zb_kick: {
      root: { y: 0.02, rx: 8 }, spine: [6, 14, 0], chest: [8, 22, 0], head: [-10, -18, 0],
      shoulderL: [-26, 0, 44], elbowL: [-50, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-40, 0, 0],
      thighR: [-96, 0, -8], kneeR: [16, 0, 0], footR: [-16, 0, 0], thighL: [14, 0, 10], kneeL: [16, 0, 0],
    },
    zb_heelW: {
      root: { y: 0.16, rx: -6 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0],
      shoulderL: [-120, 0, 24], elbowL: [-40, 0, 0], shoulderR: [-120, 0, -24], elbowR: [-40, 0, 0],
      thighR: [-118, 0, -6], kneeR: [30, 0, 0], footR: [10, 0, 0], thighL: [-10, 0, 8], kneeL: [26, 0, 0],
    },
    zb_heel: {
      root: { y: -0.1, rx: 18 }, spine: [16, 0, 0], chest: [18, 0, 0], head: [8, 0, 0],
      shoulderL: [-40, 0, 28], elbowL: [-56, 0, 0], shoulderR: [-40, 0, -28], elbowR: [-56, 0, 0],
      thighR: [12, 0, -8], kneeR: [10, 0, 0], footR: [24, 0, 0], thighL: [-34, 0, 8], kneeL: [46, 0, 0],
    },
    zb_palmW: {
      root: { y: -0.06 }, hips: [0, -18, 0], spine: [2, -16, 0], chest: [2, -28, 0], head: [-4, 26, 0],
      shoulderR: [-30, 0, -40], elbowR: [-110, 0, 0], handR: [-30, 0, 0],
      shoulderL: [-24, 0, 20], elbowL: [-80, 0, 0],
      thighL: [-18, 12, 12], kneeL: [26, 0, 0], thighR: [12, -12, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    zb_palm: {
      root: { y: -0.08, rx: 8 }, hips: [0, 16, 0], spine: [8, 18, 0], chest: [10, 32, 0], head: [-12, -26, 0],
      shoulderR: [-92, 0, -4], elbowR: [-4, 0, 0], handR: [-70, 0, 0],
      shoulderL: [-10, 0, 34], elbowL: [-70, 0, 0],
      thighL: [-30, 10, 12], kneeL: [40, 0, 0], thighR: [22, -10, -12], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    zb_glide: (t) => ({
      root: { y: Math.sin(t * 2) * 0.02, rx: 6 }, spine: [4, 0, 0], chest: [4, -8, 0], head: [-10, 8, 0],
      shoulderL: [-26, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-22, 0, -18], elbowR: [-36, 0, 0],
      thighL: [-10, 0, 8], kneeL: [22, 0, 0], footL: [16, 0, 0], thighR: [-4, 0, -8], kneeR: [16, 0, 0], footR: [12, 0, 0],
      hands: ['open', 'open'],
    }),
    zb_blastW: {
      root: { y: -0.04 }, hips: [0, -16, 0], spine: [0, -12, 0], chest: [0, -22, 0], head: [-4, 20, 0],
      shoulderR: [-56, 0, -30], elbowR: [-70, 0, 0], handR: [-20, 0, 0],
      shoulderL: [-16, 0, 24], elbowL: [-56, 0, 0],
      thighL: [-10, 10, 10], kneeL: [16, 0, 0], thighR: [8, -10, -10], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    zb_blast: {
      root: { y: -0.04, rx: 4 }, hips: [0, 10, 0], spine: [2, 12, 0], chest: [2, 22, 0], head: [-6, -18, 0],
      shoulderR: [-86, 0, -8], elbowR: [-8, 0, 0], handR: [-60, 0, 0],
      shoulderL: [-12, 0, 26], elbowL: [-64, 0, 0],
      thighL: [-18, 8, 10], kneeL: [24, 0, 0], thighR: [14, -8, -10], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    zb_waveCharge: (t) => {
      const s = Math.sin(t * 26) * 1.5;
      return {
        root: { y: -0.08 }, hips: [0, -14, 0], spine: [-4, -10, 0], chest: [-6 + s, -18, 0], head: [-8, 16, 0],
        shoulderR: [-70, 0, -34], elbowR: [-64, 0, 0], handR: [-24, 0, 0],
        shoulderL: [-70, 0, 34], elbowL: [-64, 0, 0], handL: [-24, 0, 0],
        thighL: [-20, 12, 14], kneeL: [30, 0, 0], thighR: [14, -12, -14], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_waveFire: (t) => {
      const s = Math.sin(t * 40) * 2;
      return {
        root: { y: -0.08, rx: 6 }, hips: [0, 8, 0], spine: [6, 10, 0], chest: [8 + s, 18, 0], head: [-10, -14, 0],
        shoulderR: [-92, 0, -6], elbowR: [-4, 0, 0], handR: [-64, 0, 0],
        shoulderL: [-92, 0, 6], elbowL: [-4, 0, 0], handL: [-64, 0, 0],
        thighL: [-30, 10, 14], kneeL: [40, 0, 0], thighR: [22, -10, -14], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ---------- transformation ----------
    zb_morphClench: (t) => {
      const s = Math.sin(t * 34) * 2;
      return {
        root: { y: -0.1, rx: 10 }, spine: [12, 0, 0], chest: [14 + s, 0, 0], neck: [8, 0, 0], head: [10, 0, 0],
        shoulderL: [-34, 0, 26 + s], elbowL: [-116, 0, 0], shoulderR: [-34, 0, -26 - s], elbowR: [-116, 0, 0],
        thighL: [-26, 0, 16], kneeL: [44, 0, 0], thighR: [-26, 0, -16], kneeR: [44, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    zb_morphArch: (t) => {
      const s = Math.sin(t * 50) * 3;
      return {
        root: { y: -0.04, rx: -14 }, spine: [-16, 0, 0], chest: [-26 + s, 0, 0], neck: [-16, 0, 0], head: [-40, 0, 0],
        shoulderL: [22, 0, 52 + s], elbowL: [-34, 0, 0], shoulderR: [22, 0, -52 - s], elbowR: [-34, 0, 0],
        thighL: [-12, 0, 24], kneeL: [28, 0, 0], thighR: [-12, 0, -24], kneeR: [28, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_morphRoar: (t) => {
      const s = Math.sin(t * 22) * 2.5;
      return {
        root: { y: -0.06, rx: -6 }, spine: [-8, 0, 0], chest: [-14 + s, 0, 0], neck: [-12, 0, 0], head: [-26, 0, 0],
        shoulderL: [-8, 0, 68], elbowL: [-72, 0, 0], shoulderR: [-8, 0, -68], elbowR: [-72, 0, 0],
        thighL: [-20, 0, 22], kneeL: [34, 0, 0], thighR: [-20, 0, -22], kneeR: [34, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ---------- monstrous form ----------
    zb_beastIdle: (t) => {
      const b = Math.sin(t * 1.9);
      return {
        root: { y: -0.08 + b * 0.014, rx: 8 }, hips: [0, -8, 0], spine: [8, 0, 0], chest: [10, -4, 0], head: [6, 4, 0],
        shoulderL: [-16, 0, 40], elbowL: [-64, 0, 0], shoulderR: [-14, 0, -38], elbowR: [-60, 0, 0],
        thighL: [-14, 10, 20], kneeL: [26, 0, 0], thighR: [10, -10, -20], kneeR: [22, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    zb_beastSmashW: {
      root: { y: -0.12, rx: -8 }, spine: [-10, -18, 0], chest: [-14, -28, 0], head: [-18, 26, 0],
      shoulderR: [-156, 0, -20], elbowR: [-54, 0, 0], shoulderL: [-40, 0, 26], elbowL: [-88, 0, 0],
      thighL: [-24, 14, 18], kneeL: [34, 0, 0], thighR: [16, -14, -18], kneeR: [26, 0, 0],
      hands: ['fist', 'fist'],
    },
    zb_beastSmash: {
      root: { y: -0.2, rx: 22 }, spine: [22, 20, 0], chest: [26, 34, 0], head: [16, -26, 0],
      shoulderR: [-18, 0, -10], elbowR: [-14, 0, 0], shoulderL: [-30, 0, 34], elbowL: [-76, 0, 0],
      thighL: [-44, 12, 18], kneeL: [58, 0, 0], thighR: [26, -12, -18], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    },
    zb_beastHookW: {
      root: { y: -0.14, rx: -4 }, spine: [-6, 22, 0], chest: [-8, 34, 0], head: [-12, -28, 0],
      shoulderL: [-56, 0, 40], elbowL: [-118, 0, 0], shoulderR: [-20, 0, -36], elbowR: [-96, 0, 0],
      thighL: [-22, 14, 18], kneeL: [32, 0, 0], thighR: [14, -14, -18], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    zb_beastHook: {
      root: { y: -0.16, rx: 14 }, spine: [14, -24, 0], chest: [16, -38, 0], head: [10, 30, 0],
      shoulderL: [-92, 0, -14], elbowL: [-60, 0, 0], shoulderR: [-26, 0, -30], elbowR: [-104, 0, 0],
      thighL: [-36, 14, 18], kneeL: [48, 0, 0], thighR: [22, -14, -18], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    },
    zb_beastPounceW: {
      root: { y: -0.22, rx: 20 }, hips: [0, 0, 0], spine: [20, 0, 0], chest: [22, 0, 0], head: [-14, 0, 0],
      shoulderL: [-30, 0, 44], elbowL: [-100, 0, 0], shoulderR: [-30, 0, -44], elbowR: [-100, 0, 0],
      thighL: [-72, 8, 20], kneeL: [92, 0, 0], footL: [26, 0, 0], thighR: [-72, -8, -20], kneeR: [92, 0, 0], footR: [26, 0, 0],
      hands: ['open', 'open'],
    },
    zb_beastPounce: {
      root: { y: 0.06, rx: 16 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-10, 0, 0],
      shoulderL: [-136, 0, 30], elbowL: [-40, 0, 0], shoulderR: [-136, 0, -30], elbowR: [-40, 0, 0],
      thighL: [-30, 8, 16], kneeL: [52, 0, 0], thighR: [-20, -8, -16], kneeR: [44, 0, 0],
      hands: ['open', 'open'],
    },
    zb_beastGrabW: { ...C.grab, shoulderL: [-74, 0, 52], shoulderR: [-74, 0, -52] },
    zb_beastWaveCharge: (t) => {
      const s = Math.sin(t * 30) * 2;
      return {
        root: { y: -0.14, rx: 10 }, hips: [0, -10, 0], spine: [10, -8, 0], chest: [12 + s, -14, 0], head: [4, 12, 0],
        shoulderR: [-56, 0, -44], elbowR: [-82, 0, 0], handR: [-26, 0, 0],
        shoulderL: [-56, 0, 44], elbowL: [-82, 0, 0], handL: [-26, 0, 0],
        thighL: [-26, 14, 20], kneeL: [38, 0, 0], thighR: [18, -14, -20], kneeR: [28, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_beastWaveFire: (t) => {
      const s = Math.sin(t * 44) * 3;
      return {
        root: { y: -0.14, rx: 4 }, hips: [0, 10, 0], spine: [8, 12, 0], chest: [10 + s, 20, 0], head: [-6, -16, 0],
        shoulderR: [-96, 0, -8], elbowR: [-6, 0, 0], handR: [-68, 0, 0],
        shoulderL: [-96, 0, 8], elbowL: [-6, 0, 0], handL: [-68, 0, 0],
        thighL: [-34, 12, 20], kneeL: [46, 0, 0], thighR: [24, -12, -20], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_beastRoar: (t) => {
      const s = Math.sin(t * 18) * 3;
      return {
        root: { y: -0.06, rx: -10 }, spine: [-10, 0, 0], chest: [-16 + s, 0, 0], neck: [-14, 0, 0], head: [-30, 0, 0],
        shoulderL: [-14, 0, 74], elbowL: [-66, 0, 0], shoulderR: [-14, 0, -74], elbowR: [-66, 0, 0],
        thighL: [-22, 12, 24], kneeL: [36, 0, 0], thighR: [16, -12, -24], kneeR: [28, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_victory: { ...C.victory, chest: [-6, 16, 0], head: [-10, -14, 0] },
    zb_defeat: C.defeatKneel,
  };

  /* ---------------- normal form: fast, clean, at arm's length ---------------- */
  const baseMoves = {
    light: [
      { id: 'zbJab', startup: 4, active: 3, recovery: 9, cancel: 6, damage: 330, reach: 1.2, radius: 0.7, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'zb_jabW', strike: 'zb_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
      { id: 'zbElbow', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 350, reach: 1.2, radius: 0.7, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'zb_elbowW', strike: 'zb_elbow' }, sfx: 'punchLight', hitPose: 'hitLight' },
      { id: 'zbKick', startup: 5, active: 4, recovery: 12, cancel: 8, damage: 400, reach: 1.45, radius: 0.8, lunge: 13, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'zb_kickW', strike: 'zb_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      { id: 'zbHeel', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 470, reach: 1.4, radius: 0.85, lunge: 12, hitstun: 26, knock: 'push', knockSpeed: 9, impact: 2, pose: { wind: 'zb_heelW', strike: 'zb_heel' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
    ],
    heavy: {
      0: { id: 'zbPalm', startup: 11, active: 4, recovery: 20, damage: 760, reach: 1.4, radius: 0.9, lunge: 16, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, guardCrush: true, guardDamage: 40, pose: { wind: 'zb_palmW', strike: 'zb_palm' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      2: { id: 'zbRisingHeel', startup: 9, active: 4, recovery: 20, damage: 700, reach: 1.35, radius: 0.9, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'zb_heelW', strike: 'zb_heel' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    dash: { id: 'zbGlideKnee', startup: 5, active: 8, recovery: 16, damage: 620, reach: 1.3, radius: 0.85, lunge: 34, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'zb_glide', strike: 'zb_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    throw: { id: 'zbToss', name: 'Graceful Toss', damage: 900, knockSpeed: 24, poses: ['grab', 'zb_palmW', 'zb_palm'] },
  };

  const baseSpecials = {
    special1: {
      id: 'elegantBlast', name: 'Elegant Blast', type: 'projectile', kiCost: 22, icon: 'ball',
      startup: 13, recovery: 16, pose: { wind: 'zb_blastW', release: 'zb_blast' },
      projectile: { kind: 'ball', speed: 78, radius: 0.6, damage: 1500, homing: 1.2, color: 0x6fe0c0, core: 0xffffff, explode: 4, knock: 'push', knockSpeed: 16, impact: 2, life: 3 },
    },
    special2: {
      id: 'mirageStep', name: 'Mirage Step', type: 'teleport', kiCost: 18, icon: 'teleport',
      startup: 6, recovery: 10, cooldown: 70, escapeKiCost: 30, followWindow: 26, followBonus: 1.15, pose: 'zb_glide',
      // he slips behind you, or simply is not where you swung
      modes: { behind: true, away: true },
      fatigue: { window: 260, kiStep: 6, cooldownStep: 16, max: 3 },
      shimmer: true,
    },
    ultimate: {
      id: 'sweepingWave', name: 'Sweeping Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
      chargeMin: 34, chargeMax: 70, damage: [3600, 4600], radius: [0.8, 1.25], speed: 120, range: 160, sustain: 34,
      color: 0x6fe0c0, core: 0xeafff8, poses: { charge: 'zb_waveCharge', fire: 'zb_waveFire' }, recovery: 30,
      callout: ['THIS IS WHAT YOU WANTED', '— ISN\'T IT?'],
    },
  };

  /* ---------------- monstrous form: slow, armored, brutal up close ---------------- */
  const beastMoves = {
    light: [
      { id: 'zbBeastHook', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 620, reach: 1.5, radius: 1, lunge: 10, hitstun: 24, knock: 'flinch', impact: 2, pose: { wind: 'zb_beastHookW', strike: 'zb_beastHook' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      { id: 'zbBeastBackhand', startup: 8, active: 4, recovery: 18, cancel: 10, damage: 660, reach: 1.5, radius: 1, lunge: 10, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'zb_beastSmashW', strike: 'zb_beastSmash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      { id: 'zbBeastCrush', startup: 10, active: 5, recovery: 24, cancel: 13, damage: 780, reach: 1.45, radius: 1.05, lunge: 12, hitstun: 30, knock: 'heavy', knockSpeed: 20, impact: 3, pose: { wind: 'zb_beastHookW', strike: 'zb_beastHook' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
    ],
    heavy: {
      0: { id: 'zbBeastSlam', startup: 16, active: 5, recovery: 28, damage: 1500, reach: 1.5, radius: 1.3, lunge: 14, hitstun: 38, knock: 'smash', knockSpeed: 30, impact: 3, armor: true, guardCrush: true, guardDamage: 60, pose: { wind: 'zb_beastSmashW', strike: 'zb_beastSmash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      2: { id: 'zbBeastUppercut', startup: 13, active: 5, recovery: 26, damage: 1250, reach: 1.4, radius: 1.15, lunge: 12, hitstun: 38, knock: 'launch', knockSpeed: 22, impact: 3, armor: true, pose: { wind: 'zb_beastPounceW', strike: 'zb_beastPounce' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    dash: { id: 'zbBeastCharge', startup: 10, active: 12, recovery: 26, damage: 1200, reach: 1.6, radius: 1.3, lunge: 30, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, armor: true, pose: { wind: 'zb_beastPounceW', strike: 'zb_beastPounce' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
    throw: { id: 'zbBeastCrusher', name: 'Monster Crush', damage: 1800, knockSpeed: 30, poses: ['zb_beastGrabW', 'grab', 'zb_beastSmash'] },
  };

  const beastSpecials = {
    // same slots, different fight: the blast becomes a short shoulder-charge pounce
    special1: {
      id: 'beastPounce', name: 'Pounce', type: 'rush', kiCost: 30, icon: 'rush',
      startup: 14, dashFrames: 24, speed: 44, armor: true, recovery: 30,
      poses: { wind: 'zb_beastPounceW' },
      hits: [
        { pose: 'zb_beastPounce', damage: 900, frames: 12, sfx: 'punchHeavy' },
        { pose: 'zb_beastSmash', damage: 1400, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 30, impact: 3 },
      ],
    },
    special2: {
      id: 'beastQuake', name: 'Monster Quake', type: 'groundSlam', kiCost: 34, icon: 'ball',
      crouch: 20, hang: 26, height: 5, maxRange: 16, radius: 6.5, clearHeight: 2.2, damage: 1700, knockSpeed: 20, recovery: 40,
      poses: { crouch: 'zb_beastPounceW', air: 'zb_beastPounce', land: 'zb_beastSmash' },
    },
    ultimate: {
      id: 'monsterWave', name: 'Monster Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
      chargeMin: 40, chargeMax: 70, damage: [5400, 6200], radius: [1.5, 1.9], speed: 100, range: 150, sustain: 44,
      color: 0x8ef07a, core: 0xf2fff0, poses: { charge: 'zb_beastWaveCharge', fire: 'zb_beastWaveFire' }, recovery: 44,
      callout: ['LOOK AT ME NOW!'],
    },
  };

  SL.data.characters.zarbon = {
    id: 'zarbon',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Zarbon',
    fullName: "Zarbon, Frieza's Right Hand",
    era: 'Namek Saga',
    playable: true, // Free Battle after "The Prince Repaid" (unlocks.js); the story still owns his boss phases
    style: 'Duelist',
    blurb: 'Elegant, fast and vain — until vanity costs more than the fight is worth, and he stops being beautiful.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 17000, ki: 100, stamina: 130, speed: 1.14, power: 0.98, defense: 0.92, weight: 0.9, kiRegen: 3, chargeRate: 34, canonPower: 1.25 },
    // he is not armored like Dodoria: light hits break his composure quickly, and he relies on not being hit
    poise: { max: 55, regen: 14, regenDelay: 90, armor: 1, cost: { 1: 7, 2: 12, 3: 20, 4: 30 }, beamMul: 1.2, breakFrames: 140, vulnerable: 1.3 },
    appearance: {
      height: 1.06,
      skin: SKIN,
      build: { chestW: 0.205, chestD: 0.14, shoulderX: 0.21, waistW: 0.13, waistD: 0.11, upperArmR: 0.056, foreArmR: 0.05, thighR: 0.086, shinR: 0.068, headR: 0.118 },
      hair: { style: 'zarbon', color: HAIR },
      headExtras: [
        // the braid over his shoulder
        { a: [0.55, 0.25, -0.75], d: [0.5, -1, -0.6], l: 0.34, r: 0.035, color: HAIR, depth: 0.96, outline: 0.5 },
        { a: [0.6, -0.35, -0.85], d: [0.4, -1, -0.3], l: 0.16, r: 0.028, color: HAIR, depth: 0.96, outline: 0.5 },
      ],
      face: { pupil: 0xffd24a, sclera: 0xffffff, brow: HAIR, eyeW: 1.05, pointedEars: true },
      outfit: {
        topStyle: 'armor', top: 0x2b3f6a, arms: SKIN, pants: 0x2b3f6a, pantsStyle: 'tight',
        gloves: ARMOR_WHITE, boots: ARMOR_WHITE, bootTip: ARMOR_TRIM, bootStyle: 'saiyan', wrist: ARMOR_TRIM,
        armor: { plate: ARMOR_WHITE, belly: ARMOR_WHITE, pads: ARMOR_TRIM, padStyle: 'saga', hipGuards: ARMOR_TRIM, trim: ARMOR_TRIM },
        scouter: { lens: 0x6fe0c0, body: 0xd8d8d8 },
      },
      portraitColor: '#5fbf9a',
    },
    vfx: { ghost: 0xa8ffe0 },
    audio: { strikePitch: 1.12, heavyPitch: 1.0 },
    forms: [
      { id: 'base', name: 'Zarbon', aura: { color: 0x7fe6c4, core: 0xffffff, particles: 0x9ff0d8 }, mult: {} },
      {
        id: 'monster', name: 'Monstrous Form', short: 'MONSTER', kiCost: 40, style: 'full',
        // heavier, tougher, slower: the fight changes hands
        mult: { damage: 1.45, speed: 0.86, defense: 1.32, kiRegen: 0.85, chargeRate: 1.1, guardStamina: 0.8 },
        aura: { color: 0x8ef07a, core: 0xe8ffd8, particles: 0x76d05a, idle: 0.3, speed: 0.9, sharp: 0.1 },
        look: { hair: { style: 'zarbon_beast', color: 0x2a5a36 }, pupil: 0xff5a3a, brow: 0x2a5a36, bulk: 1.34, tint: 0x2f6a3a, tintAmount: 0.22 },
        moves: beastMoves,
        specials: beastSpecials,
        ghost: 0xa8ff88,
        line: 'zarbon_transform',
        music: 3,
        // 2.5 s transformation event: swelling, arching, a burst that changes the silhouette
        sequence: {
          length: 150,
          applyAt: 96,
          steps: [
            { at: 0, pose: 'zb_morphClench', speed: 7, expression: 'grit', aura: 0.35, auraColor: 0x9ff0d8, mood: [0.4, 0x0c2a18, 1], shot: 'orbit', sfx: 'heartbeat', music: 0 },
            { at: 26, pose: 'zb_morphClench', speed: 7, expression: 'shout', aura: 0.6, quake: 0.12, sfx: 'kiUp' },
            { at: 54, pose: 'zb_morphArch', speed: 6, expression: 'shout', aura: 0.9, auraColor: 0x8ef07a, sfx: 'ssjRise', quake: 0.3, lightning: true, hairFlicker: true, rocks: true },
            { at: 80, quake: 0.45 },
            { at: 96, burst: true, pose: 'zb_morphRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', flash: 0.8, crater: 4, hairFlicker: false, lightning: false, rocks: false, mood: [0.3, 0x123a1c, 0.4] },
            { at: 112, pose: 'zb_beastRoar', speed: 8, expression: 'angry', sfx: 'roar', shot: 'face' },
            { at: 132, pose: 'zb_beastIdle', speed: 5, expression: 'angry', mood: [0, 0x000000, 1.2] },
          ],
        },
      },
    ],
    poses,
    moves: baseMoves,
    specials: baseSpecials,
    blast: { color: 0x6fe0c0, core: 0xeafff8, damage: 260, speed: 66, radius: 0.3, sfxPitch: 1.2 },
    mechanic: { type: 'boss', name: 'Vanity', desc: 'Fights elegantly and evasively until he is forced to transform; the monstrous form trades grace for crushing power.' },
    boss: {
      phases: [
        // normal form: keeps his distance, blinks away, punishes from range
        { id: 'elegant', label: 'ELEGANT', hpAbove: 0.45, speed: 1.05, damage: 0.95, patience: 0.9, patterns: { melee: 1, mirage: 0.55, blast: 0.5, taunt: 0.45 } },
        // the transformation happens on entry, then the whole pattern set changes
        { id: 'monstrous', label: 'MONSTROUS', hpAbove: 0, speed: 0.95, damage: 1.15, patience: 0.5, enter: 'morph', line: 'angry', patterns: { melee: 1, pounce: 0.75, quake: 0.6, roar: 0.35 } },
      ],
      patterns: {
        mirage: { slot: 'special2', minDist: 3, maxDist: 26, cooldown: 260 },
        blast: { slot: 'special1', minDist: 9, cooldown: 220 },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 18, cooldown: 620 },
        pounce: { slot: 'special1', minDist: 5, maxDist: 26, cooldown: 300 },
        quake: { slot: 'special2', minDist: 3, maxDist: 16, maxAltitude: 6, cooldown: 360 },
        roar: { technique: 'roar', maxDist: 14, cooldown: 700 },
      },
      techniques: {
        morph: { type: 'bossTransform', frames: 150, form: 1 },
        roar: { type: 'bossRoar', frames: 64, blastAt: 20, radius: 11, knockSpeed: 17, damage: 0, poses: { roar: 'zb_beastRoar' } },
        taunt: { type: 'bossTaunt', frames: 76, line: 'taunt', poses: { taunt: 'zb_flourish' } },
      },
    },
    ai: { personality: 'adaptive', aggression: 0.6, defense: 0.6, ranged: 0.55, beam: 0.4, transformHp: 0.45, preferredRange: 6, hooks: 'boss' },
    barks: { taunt: 'zarbon_taunt', angry: 'zarbon_angry', hurt: 'zarbon_hurt', transform: 'zarbon_transform' },
    intro: { pose: 'zb_flourish', expression: 'smirk' },
    victory: { poses: ['zb_victory'], expression: 'smirk' },
    defeat: { pose: 'zb_defeat', expression: 'hurt' },
  };
})();
