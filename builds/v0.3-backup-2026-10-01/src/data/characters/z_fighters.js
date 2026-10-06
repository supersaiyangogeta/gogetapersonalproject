/*
 * Z FIGHTERS of the Saiyan Saga — Earth's defenders facing Nappa and Vegeta.
 *
 *   KRILLIN — PLAYABLE PROTOTYPE. Small, quick, crafty. Kamehameha, the
 *     guard-piercing Destructo Disc and the Scattering Bullet that rains shots
 *     on a whole pack. Mechanic SURVIVOR: fights best with his back to the wall.
 *   TIEN — PLAYABLE PROTOTYPE. Disciplined Crane-school fighter. Fast Dodon Ray,
 *     Solar Flare that blinds everyone looking at him, and the Tri-Beam that
 *     costs his own life force. Mechanic THIRD EYE: reads attacks (wider Perfect
 *     Guard window, Perfect Guards restore ki).
 *   YAMCHA — PLAYABLE PROTOTYPE (after "The Saibamen"). Fast wolf-style brawler:
 *     Wolf Fang Fist rush, Kamehameha, and the Spirit Ball with SPIRIT BALL
 *     CONTROL — keep Ultimate held after the throw to steer it (screen left/right,
 *     Fly Up/Down), burst through a target and bring it round for a second pass.
 *
 * Movesets reuse the shared martial-arts poses plus a few signature poses each;
 * they are prototypes, not Goku-quality showcases.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const TURTLE_GI = { topStyle: 'gi', top: 0xf57b22, under: 0x1f3d9e, sleeves: 'short', sleeveColor: 0x1f3d9e, wrist: 0x1f3d9e, belt: 0x1f3d9e, pants: 0xf57b22, pantsStyle: 'gi', boots: 0x1d2f7a, bootTrim: 0xf1c64a, bootStyle: 'gi' };

  /* ---------------------------------------------------------------- KRILLIN */
  const krillinPoses = {
    idle: (t) => {
      const b = Math.sin(t * 4.8);
      return {
        root: { y: -0.07 + b * 0.012 }, hips: [0, -14, 0], spine: [6, 4, 0], chest: [8, 12, 0], head: [-4, 4, 0],
        shoulderL: [-64, 0, 14], elbowL: [-108, 0, 0], shoulderR: [-40, 0, -14], elbowR: [-118, 0, 0],
        thighL: [-24, 14, 12], kneeL: [32 + b * 3, 0, 0], footL: [-8, 0, 0], thighR: [14, -10, -12], kneeR: [26 + b * 3, 0, 0], footR: [-12, 0, 0],
      };
    },
    // Destructo Disc: one arm straight up, spinning disc forming above the palm
    k_discCharge: (t) => {
      const s = Math.sin(t * 30) * 1.2;
      return {
        root: { y: -0.04 }, chest: [-4 + s, -10, 0], head: [-12, 6, 0],
        shoulderR: [-176, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-90, 0, 0],
        thighL: [-20, 0, 14], kneeL: [26, 0, 0], thighR: [12, 0, -14], kneeR: [20, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    k_discThrow: {
      root: { y: -0.08, rx: 8 }, chest: [14, 24, 0], head: [-10, -18, 0],
      shoulderR: [-60, 0, 20], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-60, 0, 0],
      thighL: [-34, 10, 12], kneeL: [40, 0, 0], thighR: [20, -10, -12], kneeR: [16, 0, 0],
      hands: ['fist', 'open'],
    },
    k_scatterW: (t) => ({
      root: { y: -0.06 }, chest: [-8, 0, 0], head: [-24, 0, 0],
      shoulderR: [-160, 0, -20], elbowR: [-40, 0, 0], shoulderL: [-150, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-24, 0, 16], kneeL: [30, 0, 0], thighR: [14, 0, -16], kneeR: [26, 0, 0],
      hands: ['open', 'open'],
    }),
    k_scatter: {
      root: { y: -0.02 }, chest: [-14, 0, 0], head: [-34, 0, 0],
      shoulderR: [-178, 0, -10], elbowR: [-4, 0, 0], shoulderL: [-178, 0, 10], elbowL: [-4, 0, 0],
      thighL: [-10, 0, 10], kneeL: [10, 0, 0], thighR: [6, 0, -10], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    k_victory: { ...C.victory, head: [-14, 0, 0], chest: [-6, 0, 0] },
    k_defeat: C.defeatKneel,
  };

  SL.data.characters.krillin = {
    id: 'krillin',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Krillin',
    fullName: 'Krillin, Turtle School',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    style: 'Trickster',
    blurb: "Earth's strongest human. Small, quick, and full of tricks — including a disc that cuts through anything.",
    ratings: { power: 2, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 10500, ki: 100, stamina: 110, speed: 1.12, power: 0.86, defense: 0.88, weight: 0.72, kiRegen: 2.3, chargeRate: 32, canonPower: 0.45 },
    appearance: {
      height: 0.8,
      skin: 0xf6c49a,
      build: { chestW: 0.2, chestD: 0.14, shoulderX: 0.205, upperArmR: 0.057, foreArmR: 0.051, thighR: 0.084, headR: 0.142 },
      headExtras: [0, 1, 2, 3, 4, 5].map((i) => ({ shape: 'ball', a: [(i % 2 ? 1 : -1) * (0.1 + ((i / 2) | 0) * 0.13), 0.78 - ((i / 2) | 0) * 0.04, 0.6], d: [0, 0.6, 1], l: 0.008, r: 0.012, color: 0x6a4a3a, depth: 0.99, flat: 1, outline: 0 })),
      face: { pupil: 0x1c1c26, eyeW: 1.12, brow: 0x3a2a20 },
      outfit: Object.assign({}, TURTLE_GI, { emblem: { text: '亀', fg: '#111111', bg: '#ffffff' } }),
      portraitColor: '#f57b22',
    },
    vfx: { ghost: 0xbfe6ff },
    audio: { strikePitch: 1.2, heavyPitch: 1.08 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xd8ecff }, mult: {} },
      // Guru draws out what was already in him: no new moves, but everything he has hits and moves harder.
      // Story missions before Namek lock this with lockedForms: { potential: true }.
      {
        id: 'potential', name: 'Unlocked Potential', short: 'POTENTIAL', kiCost: 30, style: 'burst',
        mult: { damage: 1.35, speed: 1.12, defense: 1.15, kiRegen: 1.4, chargeRate: 1.2 },
        aura: { color: 0xffe9a8, core: 0xffffff, particles: 0xfff0c0, idle: 0.24, speed: 1.2, sparks: 0xfff6d0 },
        look: { bulk: 1.05, tint: 0xffe0a0, tintAmount: 0.12 },
        line: 'krillin_potential',
        music: 2,
      },
    ],
    poses: krillinPoses,
    moves: {
      light: [
        { id: 'jab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 240, reach: 1.05, radius: 0.65, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cross', startup: 4, active: 3, recovery: 11, cancel: 6, damage: 260, reach: 1.05, radius: 0.65, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'snapKick', startup: 5, active: 4, recovery: 13, cancel: 8, damage: 300, reach: 1.2, radius: 0.75, lunge: 11, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'spinKick', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 340, reach: 1.3, radius: 0.8, lunge: 12, hitstun: 24, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'palmThrust', startup: 10, active: 4, recovery: 20, damage: 640, reach: 1.15, radius: 0.85, lunge: 16, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'risingKnee', startup: 8, active: 4, recovery: 20, damage: 560, reach: 1.0, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 17, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        3: { id: 'doubleAxe', startup: 11, active: 4, recovery: 24, damage: 780, reach: 1.1, radius: 0.9, lunge: 10, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'flyingKick', startup: 5, active: 9, recovery: 17, damage: 620, reach: 1.15, radius: 0.9, lunge: 30, hitstun: 28, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'turtleToss', name: 'Turtle Toss', damage: 820, knockSpeed: 22, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'kamehameha', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 22, chargeMax: 90, tiers: [22, 60], damage: [1500, 2700], radius: [0.5, 1.05], speed: 100, range: 150, sustain: 34,
        color: 0x3fb2ff, core: 0xe8f8ff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 22,
        sound: 'kame', callout: ['KAMEHAME', 'HA!'], chargeLight: 0x5ac8ff,
      },
      special2: {
        id: 'destructoDisc', name: 'Destructo Disc', type: 'projectile', kiCost: 40, icon: 'ball',
        startup: 30, recovery: 22, pose: { wind: 'k_discCharge', release: 'k_discThrow' },
        projectile: { kind: 'disc', speed: 58, radius: 0.75, damage: 3200, homing: 0.35, color: 0xfff27a, core: 0xffffff, explode: 1, knock: 'heavy', knockSpeed: 16, impact: 3, guardPierce: true, life: 2.6 },
      },
      ultimate: {
        id: 'scatteringBullet', name: 'Scattering Bullet', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 26, rise: 34, height: 12, count: 14, damage: 820, speed: 58, range: 70, recovery: 26,
        color: 0xffe25a, poses: { wind: 'k_scatterW', throw: 'k_scatter' },
      },
    },
    mechanic: { type: 'survivor', name: 'Survivor', desc: 'Below 40% health, dodges and vanishes cost half the stamina and ki recovers twice as fast.' },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.6, ranged: 0.5, beam: 0.5, transformHp: 0, preferredRange: 5 },
    barks: {},
    intro: { pose: 'idle', expression: 'angry' },
    victory: { poses: ['k_victory'], expression: 'grin' },
    defeat: { pose: 'k_defeat', expression: 'hurt' },
  };

  /* ------------------------------------------------------------------- TIEN */
  const tienPoses = {
    // crane stance: upright, one hand forward, fingers extended
    idle: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: -0.05 + b * 0.008 }, hips: [0, -20, 0], spine: [2, 8, 0], chest: [2, 12, 0], head: [-4, 6, 0],
        shoulderL: [-72, 0, 6], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-110, 0, 0],
        thighL: [-18, 14, 10], kneeL: [22, 0, 0], footL: [-4, 0, 0], thighR: [10, -10, -12], kneeR: [18, 0, 0], footR: [-8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    t_flareW: {
      root: { y: -0.04 }, chest: [-6, 0, 0], head: [-10, 0, 0],
      shoulderL: [-150, 0, -30], elbowL: [-120, 0, 0], shoulderR: [-150, 0, 30], elbowR: [-120, 0, 0],
      thighL: [-16, 0, 14], kneeL: [20, 0, 0], thighR: [10, 0, -14], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    // hands spread from the face: "Solar Flare!"
    t_flare: {
      root: { y: -0.02 }, chest: [-12, 0, 0], head: [-16, 0, 0],
      shoulderL: [-150, 0, 20], elbowL: [-70, 0, 0], shoulderR: [-150, 0, -20], elbowR: [-70, 0, 0],
      thighL: [-16, 0, 16], kneeL: [20, 0, 0], thighR: [10, 0, -16], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    // Tri-Beam: both hands forming a triangle in front of the chest
    t_triCharge: (t) => {
      const s = Math.sin(t * 36) * 1.4;
      return {
        root: { y: -0.08 }, chest: [4 + s, 0, 0], head: [-6, 0, 0],
        shoulderL: [-86, -30, 0], elbowL: [-50, 0, 0], handL: [0, 0, 40], shoulderR: [-86, 30, 0], elbowR: [-50, 0, 0], handR: [0, 0, -40],
        thighL: [-30, 0, 18], kneeL: [40, 0, 0], thighR: [16, 0, -18], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    t_triFire: {
      root: { y: -0.1, rx: 6 }, chest: [8, 0, 0], head: [-8, 0, 0],
      shoulderL: [-92, -22, 0], elbowL: [-20, 0, 0], handL: [0, 0, 30], shoulderR: [-92, 22, 0], elbowR: [-20, 0, 0], handR: [0, 0, -30],
      thighL: [-34, 0, 20], kneeL: [46, 0, 0], thighR: [18, 0, -20], kneeR: [30, 0, 0],
      hands: ['open', 'open'],
    },
    t_dodonCharge: { ...C.twoFingers },
    t_dodonFire: { ...C.twoFingers, shoulderR: [-92, 0, 4], elbowR: [-2, 0, 0] },
    t_victory: { ...C.armsCrossed, head: [-10, 0, 0] },
  };

  SL.data.characters.tien = {
    id: 'tien',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Tien',
    fullName: 'Tien Shinhan',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    style: 'Disciplined',
    blurb: 'A stern martial artist with a third eye that reads attacks — and a technique that burns his own life.',
    ratings: { power: 3, speed: 3, ki: 3, defense: 4 },
    stats: { hp: 12500, ki: 100, stamina: 105, speed: 0.98, power: 1.0, defense: 1.05, weight: 1.02, kiRegen: 2.1, chargeRate: 30, canonPower: 0.55 },
    appearance: {
      height: 1.04,
      skin: 0xf2c29a,
      build: { chestW: 0.225, chestD: 0.145, shoulderX: 0.228, waistW: 0.135, upperArmR: 0.064, foreArmR: 0.056, thighR: 0.09, headR: 0.118 },
      headExtras: [
        // the third eye (white with a dark iris)
        { shape: 'ball', a: [0, 0.5, 0.88], d: [0, 0.1, 1], l: 0.008, r: 0.022, color: 0xffffff, depth: 0.98, flat: 0.62, outline: 0.3 },
        { shape: 'ball', a: [0, 0.5, 0.9], d: [0, 0.1, 1], l: 0.006, r: 0.009, color: 0x141414, depth: 1.02, flat: 1.2, outline: 0 },
      ],
      face: { pupil: 0x141414, eyeW: 0.92, browThick: 1.3, brow: 0x2a2020 },
      outfit: {
        topStyle: 'gi', top: 0x2f6a3a, sleeves: 'none', arms: 0xf2c29a, belt: 0xb3202a,
        pants: 0xd8c8a0, pantsStyle: 'gi', boots: 0x222222, bootStyle: 'gi', wrist: 0x2f6a3a,
      },
      portraitColor: '#2f6a3a',
    },
    vfx: { ghost: 0xe0ffe0 },
    audio: { strikePitch: 1.0, heavyPitch: 0.95 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xf8fff0, core: 0xffffff, particles: 0xe8ffd8 }, mult: {} }],
    poses: tienPoses,
    moves: {
      light: [
        { id: 'palmStrike', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 280, reach: 1.2, radius: 0.7, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'knifeHand', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 300, reach: 1.2, radius: 0.72, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'craneKick', startup: 7, active: 4, recovery: 15, cancel: 9, damage: 380, reach: 1.4, radius: 0.8, lunge: 10, hitstun: 24, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'doublePalm', startup: 12, active: 5, recovery: 22, damage: 820, reach: 1.25, radius: 0.95, lunge: 14, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 2, guardCrush: true, guardDamage: 40, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'craneLift', startup: 9, active: 4, recovery: 20, damage: 640, reach: 1.2, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'elbowDive', startup: 6, active: 9, recovery: 18, damage: 700, reach: 1.2, radius: 0.9, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'craneThrow', name: 'Crane Throw', damage: 950, knockSpeed: 26, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'dodonRay', name: 'Dodon Ray', type: 'beam', kiCost: 22, icon: 'beam',
        chargeMin: 8, chargeMax: 36, damage: [1100, 1900], radius: [0.16, 0.3], speed: 190, range: 170, sustain: 14,
        color: 0xffe07a, core: 0xffffff, poses: { charge: 't_dodonCharge', fire: 't_dodonFire' }, recovery: 16, oneHand: true,
      },
      special2: {
        id: 'solarFlare', name: 'Solar Flare', type: 'solarFlare', kiCost: 35, icon: 'transform', cooldown: 600,
        startup: 16, recovery: 22, range: 32, stunFrames: 120,
        poses: { wind: 't_flareW', flash: 't_flare' },
      },
      ultimate: {
        id: 'triBeam', name: 'Tri-Beam', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true, hpCost: 0.12,
        chargeMin: 60, chargeMax: 60, damage: [5200, 5200], radius: [1.5, 1.5], speed: 95, range: 150, sustain: 44,
        color: 0xfff27a, core: 0xffffff, poses: { charge: 't_triCharge', fire: 't_triFire' }, recovery: 40, cinematic: true,
        style: { rings: 3, ringColor: 0xfff8c0, ringSpeed: 1 },
      },
    },
    mechanic: { type: 'thirdEye', name: 'Third Eye', desc: 'A wider Perfect Guard window; every Perfect Guard restores extra ki.' },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.75, ranged: 0.45, beam: 0.45, transformHp: 0, preferredRange: 5 },
    barks: {},
    intro: { pose: 'idle', expression: 'calm' },
    victory: { poses: ['t_victory'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ----------------------------------------------------------------- YAMCHA */
  SL.data.characters.yamcha = {
    id: 'yamcha',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Yamcha',
    era: 'Saiyan Saga',
    playable: true,
    style: 'Brawler',
    blurb: 'Former desert bandit turned Turtle School fighter. Brave, fast, and sometimes too eager.',
    ratings: { power: 2, speed: 3, ki: 2, defense: 2 },
    stats: { hp: 10000, ki: 100, stamina: 100, speed: 1.05, power: 0.9, defense: 0.85, weight: 0.9, kiRegen: 2, chargeRate: 30, canonPower: 0.4 },
    appearance: {
      height: 0.96,
      skin: 0xf0c098,
      build: { chestW: 0.212, chestD: 0.14, shoulderX: 0.215, upperArmR: 0.06, foreArmR: 0.053, thighR: 0.087, headR: 0.12 },
      hair: { style: 'yamcha', color: 0x121216 },
      face: { pupil: 0x16161c, eyeW: 1.0, scar: true },
      outfit: Object.assign({}, TURTLE_GI, { emblem: { text: '亀', fg: '#111111', bg: '#ffffff' } }),
      portraitColor: '#f57b22',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xd8ecff }, mult: {} }],
    poses: {
      y_wolfW: { ...C.punchWindR, hands: ['open', 'open'] },
      y_wolf: { ...C.punchR, hands: ['open', 'open'] },
      y_victory: { ...C.victory },
      // steering the Spirit Ball: two fingers raised, following it with his eyes
      y_steer: {
        root: { y: -0.04 }, spine: [2, 0, 0], chest: [-4, 0, 0], head: [-8, 0, 0],
        shoulderL: [-40, 0, 20], elbowL: [-90, 0, 0], shoulderR: [-150, 0, -24], elbowR: [-30, 0, 0],
        thighL: [-20, 10, 14], kneeL: [30, 0, 0], thighR: [10, -8, -14], kneeR: [20, 0, 0],
        hands: ['fist', 'point'],
      },
    },
    moves: {
      light: [
        { id: 'jab', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 250, reach: 1.1, radius: 0.7, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cross', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 270, reach: 1.1, radius: 0.7, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'kick', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 330, reach: 1.3, radius: 0.8, lunge: 10, hitstun: 22, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'wolfClaw', startup: 11, active: 4, recovery: 22, damage: 700, reach: 1.2, radius: 0.9, lunge: 14, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'y_wolfW', strike: 'y_wolf' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'risingKick', startup: 9, active: 4, recovery: 20, damage: 580, reach: 1.2, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 17, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'dashKnee', startup: 6, active: 9, recovery: 18, damage: 620, reach: 1.2, radius: 0.9, lunge: 30, hitstun: 28, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'banditToss', name: 'Bandit Toss', damage: 800, knockSpeed: 22, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'kamehameha', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 22, chargeMax: 80, damage: [1400, 2500], radius: [0.5, 1.0], speed: 100, range: 150, sustain: 30,
        color: 0x3fb2ff, core: 0xe8f8ff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 22, sound: 'kame',
      },
      special2: {
        id: 'wolfFangFist', name: 'Wolf Fang Fist', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 8, dashFrames: 26, speed: 46, armor: true, recovery: 20,
        hits: [
          { pose: 'y_wolf', damage: 300, frames: 8, sfx: 'punchLight' },
          { pose: 'y_wolfW', damage: 300, frames: 8, sfx: 'punchLight' },
          { pose: 'y_wolf', damage: 320, frames: 8, sfx: 'punchLight' },
          { pose: 'kickR', damage: 700, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 28, impact: 3 },
        ],
        poses: { wind: 'y_wolfW', dash: 'dash' },
      },
      ultimate: {
        id: 'spiritBall', name: 'Spirit Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 30, recovery: 24, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: {
          kind: 'ball', speed: 50, radius: 0.9, damage: 3600, homing: 1.2, color: 0xfff0a0, core: 0xffffff, explode: 5, knock: 'heavy', knockSpeed: 26, impact: 3, life: 6,
          // Spirit Ball Control: 3 s of steering at 2.6 rad/s, one burst-through and return; a CPU's ball steers itself for 1.5 s
          steer: { frames: 180, turn: 2.6, rebound: 1, cpuFrames: 90, pose: 'y_steer' },
        },
      },
    },
    mechanic: null,
    ai: { personality: 'aggressive', aggression: 0.7, defense: 0.4, ranged: 0.35, beam: 0.35, transformHp: 0, preferredRange: 4 },
    barks: {},
    intro: { pose: 'idle', expression: 'smirk' },
    victory: { poses: ['y_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
