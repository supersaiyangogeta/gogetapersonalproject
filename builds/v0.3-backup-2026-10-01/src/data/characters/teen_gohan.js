/*
 * GOHAN AT ELEVEN (Cell Saga) — the same child from Namek, after a year in a
 * room where time does not behave and three more of being told what he is for.
 *
 * Identity: his father's technique with none of his father's enjoyment. He does
 * not want the fight, he is better at it than anybody in the cast, and the only
 * thing that unlocks the top of him is being pushed past what he can stand —
 * which is the same `hiddenPotential` mechanic he had as a five-year-old, grown
 * up: the meter fills from damage and from watching people fall, and the story
 * uses it to open Super Saiyan 2.
 *
 * Forms: base → Super Saiyan → Super Saiyan 2 (its own hair, its own lightning).
 *
 * Level 1 functional prototype; playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    tg_idle: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: -0.03 + b * 0.012 },
        hips: [0, -8, 0], spine: [6, 0, 0], chest: [5, 8, 0], head: [-5, -6, 0],
        shoulderL: [-48, 0, 16], elbowL: [-96, 0, 0], shoulderR: [-44, 0, -16], elbowR: [-100, 0, 0],
        thighL: [-18, 6, 12], kneeL: [26 + b * 2, 0, 0], thighR: [10, -6, -12], kneeR: [22 + b * 2, 0, 0],
      };
    },
    tg_jabW: {
      root: { y: -0.05 }, chest: [4, -18, 0], head: [-6, 12, 0],
      shoulderR: [-34, 0, -16], elbowR: [-120, 0, 0], shoulderL: [-54, 0, 16], elbowL: [-100, 0, 0],
      thighL: [-22, 0, 12], kneeL: [32, 0, 0], thighR: [14, 0, -12], kneeR: [22, 0, 0],
    },
    tg_jab: {
      root: { y: -0.07, rx: 8 }, chest: [8, 22, 0], head: [-12, -14, 0],
      shoulderR: [-92, 0, 0], elbowR: [-4, 0, 0], shoulderL: [-46, 0, 18], elbowL: [-110, 0, 0],
      thighL: [-32, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0],
    },
    tg_kickW: { ...C.kickWindR, root: { y: -0.08 } },
    tg_kick: {
      root: { y: 0.02, rz: -10 }, chest: [-4, 40, 0], head: [-6, -30, 0],
      shoulderL: [-18, 0, 54], elbowL: [-34, 0, 0], shoulderR: [-18, 0, -54], elbowR: [-34, 0, 0],
      thighR: [-88, 0, -26], kneeR: [10, 0, 0], footR: [28, 0, 0], thighL: [12, 0, 8], kneeL: [18, 0, 0],
    },
    tg_riseW: { ...C.uppercutWind },
    tg_rise: {
      root: { y: 0.16, rx: -24 }, spine: [-10, 0, 0], chest: [-16, 0, 0], neck: [-18, 0, 0], head: [-28, 0, 0],
      shoulderR: [-168, 0, -10], elbowR: [-10, 0, 0], shoulderL: [30, 0, 22], elbowL: [-24, 0, 0],
      thighL: [-28, 0, 8], kneeL: [38, 0, 0], thighR: [18, 0, -8], kneeR: [18, 0, 0], footR: [36, 0, 0],
    },
    tg_axeW: {
      root: { y: 0.04 }, spine: [-12, 0, 0], chest: [-16, 0, 0], head: [-16, 0, 0],
      shoulderR: [-176, 0, -10], elbowR: [-16, 0, 0], shoulderL: [-170, 0, 12], elbowL: [-22, 0, 0],
      thighL: [-20, 0, 12], kneeL: [30, 0, 0], thighR: [12, 0, -12], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg_axe: {
      root: { y: -0.14, rx: 26 }, spine: [16, 0, 0], chest: [22, 0, 0], head: [-6, 0, 0],
      shoulderR: [-42, 0, -8], elbowR: [-4, 0, 0], shoulderL: [-46, 0, 8], elbowL: [-8, 0, 0],
      thighL: [-54, 0, 14], kneeL: [66, 0, 0], thighR: [26, 0, -14], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg_kameCharge: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return {
        root: { y: -0.08 }, spine: [-6, 0, 0], chest: [-10 + s * 0.3, -34, 0], head: [-8, 26, 0],
        shoulderL: [-86, 0, 26], elbowL: [-108, 0, 0], shoulderR: [-86, 0, -26], elbowR: [-108, 0, 0],
        thighL: [-30, 0, 16], kneeL: [44, 0, 0], thighR: [18, 0, -16], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    tg_kameFire: {
      root: { y: -0.12, rx: 10 }, spine: [8, 0, 0], chest: [12, 0, 0], head: [-10, 0, 0],
      shoulderL: [-100, 0, 10], elbowL: [-10, 0, 0], handL: [-42, 0, 0],
      shoulderR: [-100, 0, -10], elbowR: [-10, 0, 0], handR: [-42, 0, 0],
      thighL: [-42, 0, 16], kneeL: [54, 0, 0], thighR: [26, 0, -16], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    tg_masenkoW: (t) => {
      const s = Math.sin(t * 34) * 1.4;
      return {
        root: { y: -0.08 }, spine: [-6, 0, 0], chest: [-12 + s, 0, 0], head: [-12, 0, 0],
        shoulderL: [-168, 0, 12], elbowL: [-40, 0, 0], shoulderR: [-168, 0, -12], elbowR: [-40, 0, 0],
        thighL: [-28, 0, 16], kneeL: [42, 0, 0], thighR: [16, 0, -16], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    tg_ssjClench: (t) => {
      const s = Math.sin(t * 26) * 1.6;
      return {
        root: { y: -0.1 + s * 0.004, rx: 8 }, spine: [8, 0, 0], chest: [10 + s * 0.4, 0, 0], neck: [6, 0, 0], head: [10, 0, 0],
        shoulderL: [-22, 0, 46], elbowL: [-80, 0, 0], shoulderR: [-22, 0, -46], elbowR: [-80, 0, 0],
        thighL: [-30, 0, 18], kneeL: [46, 0, 0], thighR: [16, 0, -18], kneeR: [34, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    tg_ascend: (t) => {
      const s = Math.sin(t * 44) * 2.6;
      return {
        root: { y: -0.04 + s * 0.007, rx: -14 }, spine: [-12, 0, 0], chest: [-18 + s * 0.5, 0, 0], neck: [-18, 0, 0], head: [-32, 0, 0],
        shoulderL: [-2, 0, 70], elbowL: [-26, 0, 0], shoulderR: [-2, 0, -70], elbowR: [-26, 0, 0],
        thighL: [-24, 0, 24], kneeL: [38, 0, 0], thighR: [14, 0, -24], kneeR: [28, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    tg_cold: {
      root: { y: -0.02 }, chest: [2, 10, 0], head: [-4, -8, 0],
      shoulderL: [-20, 0, 20], elbowL: [-54, 0, 0], shoulderR: [-20, 0, -20], elbowR: [-54, 0, 0],
      thighL: [-10, 0, 12], kneeL: [16, 0, 0], thighR: [8, 0, -12], kneeR: [12, 0, 0],
      hands: ['fist', 'fist'],
    },
    // ---- Super Saiyan 2: squared up, chin down, hands low and loose. He is not guarding any more.
    tg2_stance: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.05 + b * 0.006 },
        hips: [0, -14, 0], spine: [8, 6, 0], chest: [10, 12, 0], neck: [6, 0, 0], head: [8, -10, 0],
        shoulderL: [-14, 0, 26], elbowL: [-36, 0, 0], shoulderR: [-10, 0, -24], elbowR: [-30, 0, 0],
        thighL: [-20, 8, 14], kneeL: [30 + b, 0, 0], thighR: [16, -8, -14], kneeR: [26 + b, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    tg2_elbowW: {
      root: { y: -0.06 }, chest: [6, -26, 0], head: [2, 18, 0],
      shoulderR: [-60, 0, -40], elbowR: [-140, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-60, 0, 0],
      thighL: [-24, 0, 14], kneeL: [34, 0, 0], thighR: [16, 0, -14], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg2_elbow: {
      root: { y: -0.08, rx: 10 }, chest: [10, 30, 0], head: [0, -20, 0],
      shoulderR: [-88, 0, 30], elbowR: [-138, 0, 0], shoulderL: [-24, 0, 30], elbowL: [-50, 0, 0],
      thighL: [-36, 0, 12], kneeL: [44, 0, 0], thighR: [22, 0, -12], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg2_kneeW: {
      root: { y: -0.04 }, spine: [4, 0, 0], chest: [4, 0, 0], head: [4, 0, 0],
      shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-50, 0, -30], elbowR: [-90, 0, 0],
      thighL: [-6, 0, 10], kneeL: [14, 0, 0], thighR: [-40, 0, -8], kneeR: [90, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg2_knee: {
      root: { y: 0.04, rx: -6 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [10, 0, 0],
      shoulderL: [-20, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-60, 0, 0],
      thighL: [6, 0, 10], kneeL: [10, 0, 0], thighR: [-96, 0, -6], kneeR: [110, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg2_gutW: {
      root: { y: -0.1 }, spine: [6, 0, 0], chest: [4, -34, 0], head: [6, 26, 0],
      shoulderR: [-20, 0, -30], elbowR: [-120, 0, 0], shoulderL: [-70, 0, 20], elbowL: [-80, 0, 0],
      thighL: [-34, 0, 14], kneeL: [48, 0, 0], thighR: [20, 0, -14], kneeR: [34, 0, 0],
      hands: ['fist', 'fist'],
    },
    tg2_gut: {
      root: { y: -0.16, rx: 18 }, spine: [16, 0, 0], chest: [16, 30, 0], head: [2, -24, 0],
      shoulderR: [-84, 0, 6], elbowR: [-6, 0, 0], shoulderL: [-30, 0, 34], elbowL: [-90, 0, 0],
      thighL: [-52, 0, 14], kneeL: [64, 0, 0], thighR: [30, 0, -14], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    // "The Difference in Power" (the purge): a Junior's fist stopped in one open hand
    tg2_catch: {
      root: { y: -0.05 }, hips: [0, -10, 0], spine: [4, 0, 0], chest: [6, -14, 0], neck: [4, 0, 0], head: [6, 10, 0],
      shoulderR: [-98, 0, -6], elbowR: [-14, 0, 0], shoulderL: [-14, 0, 24], elbowL: [-40, 0, 0],
      thighL: [-20, 8, 14], kneeL: [28, 0, 0], thighR: [16, -8, -14], kneeR: [24, 0, 0],
      hands: ['fist', 'open'],
    },
    // a blow from behind taken on one forearm, eyes already on whoever threw it
    tg2_block: {
      root: { y: -0.06 }, hips: [0, -10, 0], spine: [6, 0, 0], chest: [8, 18, 0], head: [4, -16, 0],
      shoulderL: [-70, 0, 40], elbowL: [-110, 0, 0], shoulderR: [-16, 0, -24], elbowR: [-40, 0, 0],
      thighL: [-24, 8, 14], kneeL: [32, 0, 0], thighR: [18, -8, -14], kneeR: [26, 0, 0],
      hands: ['fist', 'fist'],
    },
    // surrounded, not worried: the stance with the eyes moving round the circle
    tg2_glance: (t) => {
      const b = Math.sin(t * 1.6), look = Math.sin(t * 1.1) * 26;
      return {
        root: { y: -0.05 + b * 0.006 },
        hips: [0, -14, 0], spine: [8, 6, 0], chest: [10, 12, 0], neck: [6, look * 0.3, 0], head: [8, -10 + look, 0],
        shoulderL: [-14, 0, 26], elbowL: [-36, 0, 0], shoulderR: [-10, 0, -24], elbowR: [-30, 0, 0],
        thighL: [-20, 8, 14], kneeL: [30 + b, 0, 0], thighR: [16, -8, -14], kneeR: [26 + b, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // one arm hangs useless after Cell's blast; the other one is enough
    tg2_oneArm: (t) => {
      const b = Math.sin(t * 3.2);
      return {
        root: { y: -0.07 + b * 0.008 },
        hips: [0, -10, 0], spine: [10, 4, 0], chest: [12, 8, 0], head: [6, -6, 0],
        shoulderL: [8, 0, 6], elbowL: [-8, 0, 0], shoulderR: [-18, 0, -26], elbowR: [-40, 0, 0],
        thighL: [-24, 8, 14], kneeL: [34 + b, 0, 0], thighR: [18, -8, -14], kneeR: [30 + b, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    tg2_oneKameCharge: (t) => {
      const s = Math.sin(t * 34) * 1.4;
      return {
        root: { y: -0.1 }, spine: [-4, 0, 0], chest: [-8 + s * 0.3, -40, 0], head: [-8, 30, 0],
        shoulderL: [8, 0, 6], elbowL: [-8, 0, 0],
        shoulderR: [-90, 0, -40], elbowR: [-100, 0, 0],
        thighL: [-34, 0, 18], kneeL: [48, 0, 0], thighR: [20, 0, -18], kneeR: [34, 0, 0],
        hands: ['open', 'open'],
      };
    },
    tg2_oneKameFire: {
      root: { y: -0.14, rx: 12 }, spine: [8, 0, 0], chest: [14, 10, 0], head: [-10, -6, 0],
      shoulderL: [10, 0, 8], elbowL: [-6, 0, 0],
      shoulderR: [-96, 0, 4], elbowR: [-4, 0, 0], handR: [-46, 0, 0],
      thighL: [-46, 0, 16], kneeL: [58, 0, 0], thighR: [28, 0, -16], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    tg_scared: {
      root: { y: -0.08 }, spine: [10, 0, 0], chest: [10, 0, 0], head: [-10, 0, 0],
      shoulderL: [-60, 0, -10], elbowL: [-120, 0, 0], shoulderR: [-60, 0, 10], elbowR: [-120, 0, 0],
      thighL: [-24, 0, 14], kneeL: [40, 0, 0], thighR: [16, 0, -14], kneeR: [34, 0, 0],
      hands: ['fist', 'fist'],
    },
  };

  SL.data.characters.teen_gohan = {
    id: 'teen_gohan',
    assetLevel: 1,
    name: 'Gohan',
    fullName: 'Son Gohan (age 11)',
    era: 'Cell Saga',
    playable: true,
    prototype: true,
    style: 'Hidden Power',
    blurb: 'He does not want to fight anybody. He is better at it than everybody.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 3 },
    stats: { hp: 17000, ki: 120, stamina: 130, speed: 1.08, power: 1.1, defense: 0.95, weight: 0.85, kiRegen: 2.6, chargeRate: 32, canonPower: 1 },
    appearance: {
      height: 0.78,
      skin: 0xf6cda6,
      build: { chestW: 0.215, chestD: 0.155, shoulderX: 0.215, waistW: 0.165, upperArmR: 0.058, foreArmR: 0.05, fist: 0.054, thighR: 0.09, shinR: 0.07, headR: 0.15, neckLen: 0.05 },
      hair: { style: 'gohan_teen', color: 0x141418 },
      face: { pupil: 0x101010, eyeW: 1.05 },
      outfit: {
        topStyle: 'gi', top: 0x9a3a8e, sleeves: 'none', sleeveColor: 0x9a3a8e, wrist: 0xe8e4dc,
        belt: 0xe6c24a, pants: 0x9a3a8e, pantsStyle: 'gi', boots: 0xe8e4dc, bootStyle: 'gi',
        // his own clothing damage (Model.setDamage): the Juniors fight wears the sleeveless gi through
        // to the skin at the thigh and chest first, then the back and the knees; the gi only comes
        // off at 3, which is what Cell's return does (setTorn)
        damage: {
          tearAt: 3,
          rips: [
            { at: 'thighR', t: 0.5, ang: 0.3, w: 0.7, h: 0.08, fill: 'skin', level: 1 },
            { at: 'chest', y: 0.22, ang: 0.7, w: 0.35, h: 0.06, fill: 'skin', level: 1, until: 1 },
            { at: 'chest', y: 0.16, ang: 0.8, w: 0.6, h: 0.1, fill: 'skin', level: 2 },
            { at: 'spine', y: 0.12, ang: -0.5, w: 0.5, h: 0.08, fill: 'skin', level: 2 },
            { at: 'kneeL', t: 0.35, ang: 0.2, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
            { at: 'thighL', t: 0.3, ang: -0.6, w: 0.6, h: 0.08, fill: 'skin', level: 2 },
          ],
        },
      },
      portraitColor: '#9a3a8e',
    },
    vfx: { ghost: 0xffe0ff },
    audio: { strikePitch: 1.2, heavyPitch: 1.1 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xf4f0ff, core: 0xffffff, particles: 0xe8e0ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 45, style: 'full',
        mult: { damage: 1.32, speed: 1.12, defense: 1.18, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.8 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42, speed: 1.25, sharp: 0.25, sparks: 0xfff3a0 },
        look: { hair: { style: 'goku_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.04 },
        ghost: 0xffe27a,
        line: 'gohan_ssj',
        music: 3,
        sequence: {
          length: 120,
          applyAt: 72,
          steps: [
            { at: 0, pose: 'tg_ssjClench', speed: 9, expression: 'grit', aura: 0.35, auraColor: 0xffffff, mood: [0.3, 0x141026, 0.8], shot: 'orbit', music: 0, sfx: 'kiUp', rocks: true },
            { at: 34, pose: 'tg_ascend', speed: 7, expression: 'shout', aura: 0.9, sfx: 'ssjRise', mood: [0.66, 0x0a0a12, 0.6], hairFlicker: true, lightning: true },
            { at: 72, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.22, 0x2a2410, 0.3], flash: 0.8, crater: 4, hairFlicker: false, lightning: false, rocks: false },
            { at: 92, pose: 'tg_cold', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.3] },
          ],
        },
      },
      {
        id: 'ssj2', name: 'Super Saiyan 2', short: 'SUPER SAIYAN 2', kiCost: 80, style: 'full',
        // the jump the whole saga is pointing at: not a tier, a different fighter
        mult: { damage: 2.1, speed: 1.35, defense: 1.5, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.9 },
        aura: { color: 0xffe25a, core: 0xffffff, particles: 0xfff3a0, idle: 0.6, speed: 1.5, sharp: 0.45, sparks: 0xbfe4ff, lightning: true },
        look: { hair: { style: 'gohan_ssj2', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.08 },
        // a different fighter's body language: the stance replaces the idle of the frightened boy
        poses: { idle: poses.tg2_stance },
        // faster, shorter, meaner strings; a gut punch that folds a guard; a blink that ends behind you
        moves: {
          light: [
            { id: 'tg2Elbow', startup: 3, active: 3, recovery: 8, cancel: 5, damage: 560, reach: 1.15, radius: 0.76, lunge: 16, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'tg2_elbowW', strike: 'tg2_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'tg2Knee', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 600, reach: 1.1, radius: 0.8, lunge: 16, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'tg2_kneeW', strike: 'tg2_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'tg2Hook', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 620, reach: 1.2, radius: 0.78, lunge: 16, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'tg_jabW', strike: 'tg_jab' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
            { id: 'tg2Spin', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 860, reach: 1.5, radius: 0.9, lunge: 15, hitstun: 26, knock: 'push', knockSpeed: 16, impact: 3, pose: { wind: 'tg_kickW', strike: 'tg_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          ],
          heavy: {
            0: { id: 'tg2Gut', startup: 8, active: 4, recovery: 18, damage: 1700, reach: 1.25, radius: 0.95, lunge: 20, hitstun: 50, knock: 'crumple', impact: 4, guardCrush: true, guardDamage: 60, pose: { wind: 'tg2_gutW', strike: 'tg2_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            2: { id: 'tg2Rise', startup: 7, active: 4, recovery: 16, damage: 1200, reach: 1.3, radius: 0.95, lunge: 14, hitstun: 34, knock: 'launch', knockSpeed: 22, impact: 3, pose: { wind: 'tg_riseW', strike: 'tg_rise' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            3: { id: 'tg2Axe', startup: 9, active: 5, recovery: 20, damage: 1800, reach: 1.4, radius: 1.05, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 34, impact: 4, pose: { wind: 'tg_axeW', strike: 'tg_axe' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          },
          dash: { id: 'tg2Blink', startup: 3, active: 6, recovery: 12, damage: 1100, reach: 1.4, radius: 0.95, lunge: 20, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'tg2_elbowW', strike: 'tg2_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
          // after a Perfect Guard he does not step back: he is behind you, or through your guard
          counter: {
            light: { id: 'tg2Punish', startup: 2, active: 5, recovery: 14, damage: 1000, reach: 1.15, radius: 0.95, lunge: 10, hitstun: 36, knock: 'heavy', knockSpeed: 28, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'tg2_elbowW', strike: 'tg2_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
            heavy: { id: 'tg2GutCounter', startup: 4, active: 4, recovery: 18, damage: 1400, reach: 1.25, radius: 0.95, lunge: 14, hitstun: 54, knock: 'crumple', impact: 4, guardCrush: true, guardDamage: 70, pose: { wind: 'tg2_gutW', strike: 'tg2_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
        },
        specials: {
          special1: {
            id: 'tg2Kame', name: 'Super Kamehameha', type: 'beam', kiCost: 36, icon: 'beam',
            chargeMin: 14, chargeMax: 60, tiers: [14, 36], damage: [3000, 5200], radius: [1, 1.5], speed: 118, range: 170, sustain: 38,
            color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'tg_kameCharge', fire: 'tg_kameFire' }, recovery: 22,
            style: { rings: 2, ringColor: 0xdff2ff, ringSpeed: 2 },
            callout: ['KAME', 'HAME', 'HA!'], chargeLight: 0x8ad4ff,
          },
          special2: {
            id: 'tg2Rush', name: 'Unleashed Rush', type: 'rush', kiCost: 30, icon: 'rush',
            startup: 5, dashFrames: 16, speed: 58, recovery: 18,
            poses: { wind: 'tg2_elbowW' },
            hits: [
              { pose: 'tg2_elbow', damage: 700, frames: 7, sfx: 'punchHeavy' },
              { pose: 'tg2_knee', damage: 760, frames: 7, sfx: 'punchHeavy' },
              { pose: 'tg2_gut', damage: 900, frames: 9, sfx: 'punchHeavy' },
              { pose: 'tg_axe', damage: 1800, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 },
            ],
          },
        },
        // as a CPU he stops circling and starts punishing
        ai: { personality: 'aggressive', aggression: 0.95, defense: 0.75, ranged: 0.3, beam: 0.45, preferredRange: 2.2 },
        intro: { pose: 'tg2_stance', expression: 'angry' },
        victory: { poses: ['tg2_stance'], expression: 'angry' },
        ghost: 0xfff0a0,
        line: 'gohan_ssj2',
        music: 6,
        sequence: {
          length: 210,
          applyAt: 138,
          steps: [
            { at: 0, pose: 'tg_ssjClench', speed: 6, expression: 'grit', aura: 0.4, auraColor: 0xffffff, mood: [0.4, 0x100c20, 1], shot: 'orbit', music: 0, sfx: 'heartbeat', rocks: true },
            { at: 40, sfx: 'heartbeat', quake: 0.2 },
            { at: 64, pose: 'tg_ascend', speed: 8, expression: 'shout', aura: 1, sfx: 'ssjRise', mood: [0.78, 0x07070f, 0.6], hairFlicker: true, lightning: true, skyBolts: true },
            { at: 100, quake: 0.4, skyBolt: true },
            { at: 120, quake: 0.6, skyBolt: true },
            { at: 138, burst: true, pose: 'powerUp', speed: 18, expression: 'shout', sfx: 'transformBurst', mood: [0.3, 0x2a2410, 0.3], flash: 1, crater: 7, hairFlicker: false, rocks: false },
            { at: 160, pose: 'tg_cold', speed: 4, expression: 'angry', shot: 'face', lightning: true, mood: [0.12, 0x101020, 1.4] },
          ],
        },
      },
    ],
    poses: Object.assign({ idle: poses.tg_idle }, poses),
    moves: {
      light: [
        { id: 'tgJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 420, reach: 1.15, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'tg_jabW', strike: 'tg_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'tgCross', startup: 4, active: 3, recovery: 11, cancel: 6, damage: 450, reach: 1.15, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'tg_jabW', strike: 'tg_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'tgKick', startup: 6, active: 4, recovery: 14, cancel: 8, damage: 620, reach: 1.45, radius: 0.85, lunge: 13, hitstun: 24, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'tg_kickW', strike: 'tg_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'tgAxe', startup: 12, active: 5, recovery: 23, damage: 1500, reach: 1.4, radius: 1, lunge: 14, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 44, pose: { wind: 'tg_axeW', strike: 'tg_axe' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'tgRise', startup: 9, active: 4, recovery: 19, damage: 1000, reach: 1.3, radius: 0.9, lunge: 12, hitstun: 32, knock: 'launch', knockSpeed: 19, impact: 2, pose: { wind: 'tg_riseW', strike: 'tg_rise' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'tgDash', startup: 5, active: 8, recovery: 17, damage: 1000, reach: 1.4, radius: 0.95, lunge: 34, hitstun: 28, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'tg_jabW', strike: 'tg_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'tgToss', name: 'Shoulder Toss', damage: 900, knockSpeed: 24, poses: ['grab', 'tg_riseW', 'tg_axe'] },
    },
    specials: {
      special1: {
        id: 'tgMasenko', name: 'Masenko', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 18, chargeMax: 76, tiers: [18, 48], damage: [1900, 3600], radius: [0.6, 1.1], speed: 100, range: 150, sustain: 32,
        color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'tg_masenkoW', fire: 'tg_kameFire' }, recovery: 24,
        callout: ['MASEN', 'KO!'], chargeLight: 0xffe25a,
      },
      special2: {
        id: 'tgKame', name: 'Kamehameha', type: 'beam', kiCost: 40, icon: 'beam',
        chargeMin: 24, chargeMax: 80, tiers: [24, 52], damage: [2400, 4400], radius: [0.8, 1.3], speed: 104, range: 160, sustain: 36,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'tg_kameCharge', fire: 'tg_kameFire' }, recovery: 28,
        callout: ['KAME', 'HAME', 'HA!'],
      },
      ultimate: {
        id: 'fatherSon', name: 'Father-Son Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 60, chargeMax: 60, damage: [8200, 8200], radius: [2.2, 2.2], speed: 112, range: 180, sustain: 56,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'tg_kameCharge', fire: 'tg_kameFire' }, recovery: 44, cinematic: true,
        callout: ['KA', 'ME', 'HA', 'ME', 'HA!'],
      },
    },
    mechanic: { type: 'hiddenPotential', name: 'Hidden Potential', desc: 'Damage and fallen allies fill it. When it bursts he is briefly unleashed — and it is what the story uses to open Super Saiyan 2.' },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.6, ranged: 0.5, beam: 0.5, transformHp: 0.5, preferredRange: 4, hooks: 'kid_gohan' },
    barks: { combo: 'kid_gohan_combo', hurt: 'kid_gohan_hurt', lowHp: 'kid_gohan_lowHp' },
    intro: { pose: 'tg_scared', expression: 'hurt' },
    victory: { poses: ['tg_cold'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
