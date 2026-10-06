/*
 * GOKU (Saiyan Saga) — balanced, fluid, adaptive martial artist.
 * Identity: loose bouncing stance, fast strings, Instant Transmission
 * mobility, Kamehameha, Spirit Bomb. Forms: Kaioken → Super Saiyan.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const M = (p) => SL.Anim.mirror(p);

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
    g_flyingKnee: {
      root: { rx: 22 }, spine: [6, 0, 0], head: [-26, 0, 0],
      shoulderL: [30, 0, 22], elbowL: [-40, 0, 0], shoulderR: [30, 0, -22], elbowR: [-40, 0, 0],
      thighR: [-112, 0, -4], kneeR: [140, 0, 0], thighL: [22, 0, 6], kneeL: [60, 0, 0],
    },
    g_spiritRaise: (t) => {
      const s = Math.sin(t * 6) * 2;
      return {
        root: { y: -0.02 }, chest: [-12, 0, 0], neck: [-14, 0, 0], head: [-34, 0, 0],
        shoulderL: [-176 + s, 0, 14], elbowL: [-6, 0, 0], handL: [-20, 0, 0], shoulderR: [-176 - s, 0, -14], elbowR: [-6, 0, 0], handR: [-20, 0, 0],
        thighL: [-12, 0, 12], kneeL: [20, 0, 0], thighR: [8, 0, -12], kneeR: [16, 0, 0],
      };
    },
    g_spiritThrow: {
      root: { y: -0.08, rx: 14 }, spine: [16, 0, 0], chest: [20, 0, 0], head: [-18, 0, 0],
      shoulderL: [-100, 0, -8], elbowL: [-10, 0, 0], shoulderR: [-100, 0, 8], elbowR: [-10, 0, 0],
      thighL: [-40, 0, 12], kneeL: [50, 0, 0], thighR: [24, 0, -12], kneeR: [24, 0, 0],
    },
    g_intro: {
      chest: [-4, 0, 0], head: [-4, -10, 0],
      shoulderL: [-8, 0, 42], elbowL: [-100, 0, 0], handL: [0, 0, 40], shoulderR: [-8, 0, -42], elbowR: [-100, 0, 0], handR: [0, 0, -40],
      thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0],
    },
    g_victory: {
      chest: [-6, 0, 0], head: [-6, 0, 0],
      shoulderL: [-148, 0, 62], elbowL: [-150, 0, 0], shoulderR: [-148, 0, -62], elbowR: [-150, 0, 0],
      thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
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
    stats: { hp: 14000, ki: 100, stamina: 100, speed: 1.0, power: 1.0, defense: 1.0, weight: 1.0, kiRegen: 2.2, chargeRate: 34, canonPower: 1.0 },
    appearance: {
      height: 0.97,
      skin: 0xf6c49a,
      build: { chestW: 0.205, shoulderX: 0.21, upperArmR: 0.058 },
      hair: { style: 'goku', color: 0x16161c },
      face: { pupil: 0x111111, eyeW: 1.05 },
      outfit: {
        topStyle: 'gi', top: 0xf57b22, under: 0x1f3d9e, sleeves: 'short', sleeveColor: 0x1f3d9e,
        wrist: 0x1f3d9e, belt: 0x1f3d9e, pants: 0xf57b22, pantsStyle: 'gi',
        boots: 0x1d2f7a, bootTrim: 0xf1c64a, bootStyle: 'gi',
        emblem: { text: '王', fg: '#111111', bg: '#ffffff' },
      },
      portraitColor: '#f57b22',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe9ff }, mult: {} },
      {
        id: 'kaioken', name: 'Kaioken', short: 'KAIOKEN', kiCost: 25, style: 'burst',
        mult: { damage: 1.15, speed: 1.2, defense: 1, kiRegen: 1, staminaRegen: 1.25 },
        drain: { hpPerSec: 45, minHpFrac: 0.12 },
        aura: { color: 0xff2a1e, core: 0xffc0b0, particles: 0xff5040, idle: 0.55 },
        look: { tint: 0xff1a0a, tintAmount: 0.28 },
        line: 'goku_kaioken',
      },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 50, style: 'full',
        mult: { damage: 1.3, speed: 1.12, defense: 1.18, kiRegen: 2, chargeRate: 1.3 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.4, lightning: false },
        look: { hair: { style: 'goku_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.05 },
        line: 'goku_ssj',
        music: 3,
      },
    ],
    poses,
    moves: {
      light: [
        { id: 'jab', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 280, reach: 1.15, radius: 0.7, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_jabW', strike: 'g_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cross', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 300, reach: 1.2, radius: 0.7, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_crossW', strike: 'g_cross' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'elbow', startup: 6, active: 3, recovery: 13, cancel: 8, damage: 320, reach: 1.05, radius: 0.75, lunge: 10, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'g_elbowW', strike: 'g_elbow' }, sfx: 'punchLight', hitPose: 'hitBody' },
        { id: 'roundhouse', startup: 7, active: 4, recovery: 16, cancel: 10, damage: 380, reach: 1.35, radius: 0.8, lunge: 10, hitstun: 26, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'g_kickW', strike: 'g_kick' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'sideKick', startup: 13, active: 4, recovery: 22, damage: 760, reach: 1.45, radius: 0.85, lunge: 12, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, guardCrush: true, guardDamage: 38, pose: { wind: 'g_sideKickW', strike: 'g_sideKick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'uppercut', startup: 10, active: 4, recovery: 20, damage: 620, reach: 1.1, radius: 0.85, lunge: 10, hitstun: 34, knock: 'launch', knockSpeed: 17, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        4: { id: 'spinHeel', startup: 12, active: 5, recovery: 24, damage: 900, reach: 1.45, radius: 0.9, lunge: 11, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, pose: { wind: 'g_spinKickW', strike: 'g_spinKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'flyingKnee', startup: 6, active: 8, recovery: 18, damage: 700, reach: 1.2, radius: 0.9, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'spinThrow', name: 'Spinning Throw', damage: 1000, knockSpeed: 28, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'kamehameha', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 24, chargeMax: 100, damage: [1800, 3100], radius: [0.55, 1.15], speed: 95, range: 150, sustain: 38,
        color: 0x3fb2ff, core: 0xe8f8ff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 22,
      },
      special2: {
        id: 'instantTransmission', name: 'Instant Transmission', type: 'teleport', kiCost: 20, icon: 'teleport',
        startup: 9, recovery: 8, cooldown: 60, escapeKiCost: 35, followWindow: 26, followBonus: 1.25, pose: 'twoFingers',
      },
      ultimate: {
        id: 'spiritBomb', name: 'Spirit Bomb', type: 'spiritBomb', kiCost: 100, icon: 'bomb',
        chargeFrames: 120, radius: 3.4, speed: 24, homing: 1.4, damage: 4700, explode: 12, color: 0x74d6ff, core: 0xffffff,
        poses: { charge: 'g_spiritRaise', release: 'g_spiritThrow' }, recovery: 34,
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'Vanishing and perfect guards cost less and empower your next strikes.' },
    ai: { personality: 'adaptive', aggression: 0.62, defense: 0.6, ranged: 0.45, beam: 0.55, transformHp: 0.65, preferredRange: 3 },
    intro: { pose: 'g_intro', expression: 'smirk' },
    victory: { poses: ['g_victory', 'g_victoryFist'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
