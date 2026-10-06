/*
 * DR. GERO'S FIRST PAIR (Android Saga, Age 767)
 *
 *   android_19  the pale one: slow, heavy, and built around his palms
 *   android_20  Dr. Gero himself, thinner and far more careful
 *
 * Their identity is a rule rather than a stat line: **ki does not work on
 * them**. Every beam, blast and ki projectile that touches them is absorbed —
 * it heals them and takes the ki the attacker spent (`Mechanics.absorber`).
 * The counterplay is your hands: strikes and throws land normally.
 *
 * Both are Level 1 functional prototypes and story only.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const palmPoses = {
    a19_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.02 + b * 0.01 },
        hips: [0, -4, 0], spine: [-2, 0, 0], chest: [-2, 6, 0], head: [-4, -4, 0],
        shoulderL: [-22, 0, 24], elbowL: [-64, 0, 0], shoulderR: [-22, 0, -24], elbowR: [-64, 0, 0],
        thighL: [-10, 4, 12], kneeL: [16 + b, 0, 0], thighR: [8, -4, -12], kneeR: [14 + b, 0, 0],
        hands: ['open', 'open'],
      };
    },
    a19_palmW: {
      root: { y: -0.05 }, chest: [-4, 26, 0], head: [-4, -16, 0],
      shoulderR: [-34, 0, -30], elbowR: [-96, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-60, 0, 0],
      thighL: [-18, 0, 12], kneeL: [26, 0, 0], thighR: [12, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    a19_palm: {
      root: { y: -0.08, rx: 8 }, chest: [6, -20, 0], head: [-8, 14, 0],
      shoulderR: [-96, 0, -8], elbowR: [-4, 0, 0], handR: [-40, 0, 0], shoulderL: [-18, 0, 30], elbowL: [-50, 0, 0],
      thighL: [-32, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    a19_grabW: {
      root: { y: -0.06 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 0],
      shoulderL: [-96, 0, 18], elbowL: [-30, 0, 0], shoulderR: [-96, 0, -18], elbowR: [-30, 0, 0],
      thighL: [-20, 0, 14], kneeL: [30, 0, 0], thighR: [14, 0, -14], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    a19_drain: (t) => {
      const s = Math.sin(t * 22);
      return {
        root: { y: -0.05 + s * 0.004 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-6, 0, 0],
        shoulderL: [-104, 0, 14], elbowL: [-14, 0, 0], shoulderR: [-104, 0, -14], elbowR: [-14, 0, 0],
        thighL: [-24, 0, 14], kneeL: [34, 0, 0], thighR: [16, 0, -14], kneeR: [24, 0, 0],
        hands: ['open', 'open'],
      };
    },
    a19_eyeW: {
      root: { y: -0.03 }, chest: [-2, 0, 0], head: [6, 0, 0],
      shoulderL: [-14, 0, 18], elbowL: [-40, 0, 0], shoulderR: [-14, 0, -18], elbowR: [-40, 0, 0],
      thighL: [-8, 0, 12], kneeL: [12, 0, 0], thighR: [6, 0, -12], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    a19_eye: {
      root: { y: -0.04, rx: 6 }, chest: [4, 0, 0], head: [14, 0, 0],
      shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -20], elbowR: [-30, 0, 0],
      thighL: [-14, 0, 12], kneeL: [18, 0, 0], thighR: [10, 0, -12], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    a19_smug: {
      root: { y: -0.01 }, chest: [-6, 10, 0], head: [-10, -8, 0],
      shoulderL: [-16, 0, 22], elbowL: [-70, 0, 0], shoulderR: [-16, 0, -22], elbowR: [-70, 0, 0],
      thighL: [-6, 0, 12], kneeL: [10, 0, 0], thighR: [4, 0, -12], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.android_19 = {
    id: 'android_19',
    assetLevel: 1,
    name: 'Android 19',
    era: 'Android Saga',
    playable: false,
    prototype: true,
    style: 'Absorption',
    blurb: 'Pale, patient, and delighted every time somebody throws ki at him.',
    ratings: { power: 4, speed: 2, ki: 5, defense: 4 },
    stats: { hp: 26000, ki: 120, stamina: 150, speed: 0.94, power: 1.2, defense: 1.2, weight: 1.5, kiRegen: 3, chargeRate: 24, canonPower: 8 },
    poise: { max: 100, regen: 10, regenDelay: 130, armor: 2, cost: { 1: 5, 2: 9, 3: 15, 4: 24 }, beamMul: 1, breakFrames: 160, vulnerable: 1.2 },
    vfx: { ghost: 0xfff0c8 },
    appearance: {
      height: 0.86,
      skin: 0xf4efe6,
      build: { chestW: 0.29, chestD: 0.22, shoulderX: 0.27, waistW: 0.27, waistD: 0.23, upperArmR: 0.085, foreArmR: 0.075, fist: 0.075, thighR: 0.125, shinR: 0.095, headR: 0.15, neckLen: 0.04 },
      hair: { style: 'soldier_crest', color: 0xe86a2a },
      face: { pupil: 0x101010, sclera: 0xffffff, eyeW: 1.15, brow: 0xe86a2a },
      outfit: {
        topStyle: 'gi', top: 0x2a2a33, sleeves: 'long', sleeveColor: 0x2a2a33, wrist: 0xf4efe6,
        belt: 0xe8c840, pants: 0xe8a84a, pantsStyle: 'tight', boots: 0x2a2a33, bootStyle: 'gi',
      },
      portraitColor: '#e8a84a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffe27a, core: 0xfff6d0, particles: 0xffd45a, speed: 0.9 }, mult: {} }],
    poses: Object.assign({ idle: palmPoses.a19_idle }, palmPoses),
    moves: {
      light: [
        { id: 'a19Palm', startup: 6, active: 3, recovery: 13, cancel: 8, damage: 620, reach: 1.3, radius: 0.85, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'a19_palmW', strike: 'a19_palm' }, sfx: 'punchLight', hitPose: 'hitBody' },
        { id: 'a19Backhand', startup: 7, active: 3, recovery: 14, cancel: 9, damage: 680, reach: 1.35, radius: 0.9, lunge: 9, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'a19_palmW', strike: 'a19_palm' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'a19Shove', startup: 9, active: 4, recovery: 18, cancel: 11, damage: 900, reach: 1.4, radius: 1, lunge: 10, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'a19_grabW', strike: 'a19_palm' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'a19Slam', startup: 14, active: 5, recovery: 26, damage: 2000, reach: 1.5, radius: 1.1, lunge: 12, hitstun: 34, knock: 'smash', knockSpeed: 28, impact: 3, guardCrush: true, guardDamage: 48, pose: { wind: 'a19_grabW', strike: 'a19_palm' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'a19Lift', startup: 11, active: 4, recovery: 22, damage: 1400, reach: 1.4, radius: 1, lunge: 10, hitstun: 32, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'a19Charge', startup: 8, active: 8, recovery: 22, damage: 1300, reach: 1.5, radius: 1.05, lunge: 24, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 3, pose: { wind: 'a19_grabW', strike: 'a19_palm' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'a19Drain', name: 'Energy Drain', damage: 1500, knockSpeed: 18, poses: ['grab', 'a19_grabW', 'a19_drain'] },
    },
    specials: {
      // his eyes, because his palms are for taking rather than giving
      special1: {
        id: 'a19EyeBeam', name: 'Photon Flash', type: 'projectile', kiCost: 20, icon: 'blast', cooldown: 140,
        startup: 14, recovery: 20, pose: { wind: 'a19_eyeW', release: 'a19_eye' },
        projectile: { kind: 'blast', speed: 70, radius: 0.5, damage: 1500, homing: 0.4, color: 0xffd45a, core: 0xfff6d0, explode: 3, knock: 'heavy', knockSpeed: 22, impact: 2, life: 2.4 },
      },
      special2: {
        id: 'a19Grip', name: 'Absorption Grip', type: 'telekinesis', kiCost: 0, icon: 'guard', cooldown: 420,
        range: 3.2, startup: 16, maxFrames: 200, bossFrames: 150, kiPerSecond: 0, releaseStagger: 40, recovery: 30,
        mashGain: 0.05, escapeDecay: 0.006, cpuEscape: 0.5,
        drain: { hpPerSecond: 0.06, kiPerSecond: 18 },
        poses: { focus: 'a19_grabW', hold: 'a19_drain' },
      },
      ultimate: {
        id: 'a19Barrage', name: 'Eye Barrage', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 26, rise: 10, height: 6, count: 8, damage: 1300, speed: 52, range: 22, recovery: 40,
        color: 0xffd45a, poses: { wind: 'a19_eyeW', fire: 'a19_eye' },
      },
    },
    boss: {
      phases: [
        { id: 'patient', label: 'PATIENT', hpAbove: 0.5, speed: 1, damage: 1, patience: 1, patterns: { melee: 0.8, eye: 0.5, grip: 0.4 } },
        { id: 'greedy', label: 'GREEDY', hpAbove: 0, speed: 1.05, damage: 1.1, patience: 0.6, patterns: { melee: 1, grip: 0.7, eye: 0.6, barrage: 0.35 } },
      ],
      patterns: {
        eye: { slot: 'special1', minDist: 5, cooldown: 200 },
        grip: { slot: 'special2', maxDist: 3.4, cooldown: 460 },
        barrage: { slot: 'ultimate', minDist: 8, cooldown: 900 },
      },
      techniques: {},
    },
    absorb: { heal: 0.6, kiSteal: 14, cap: 1 },
    mechanic: { type: 'absorber', name: 'Energy Absorption', desc: 'Ki aimed at him is absorbed: it heals him and takes the ki you spent. Hands and throws still work.' },
    ai: { personality: 'adaptive', aggression: 0.6, defense: 0.5, ranged: 0.4, beam: 0.3, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'a19_smug', expression: 'smirk' },
    victory: { poses: ['a19_smug'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  SL.data.characters.android_20 = {
    id: 'android_20',
    assetLevel: 1,
    name: 'Dr. Gero',
    fullName: 'Android 20 (Dr. Gero)',
    era: 'Android Saga',
    playable: false,
    prototype: true,
    style: 'Absorption',
    blurb: 'He built all of them, and he would rather watch than fight.',
    ratings: { power: 3, speed: 3, ki: 5, defense: 3 },
    stats: { hp: 21000, ki: 130, stamina: 140, speed: 1.05, power: 1.05, defense: 1.05, weight: 1.1, kiRegen: 3.4, chargeRate: 28, canonPower: 8 },
    poise: { max: 70, regen: 12, regenDelay: 110, armor: 1, cost: { 1: 7, 2: 11, 3: 17, 4: 26 }, beamMul: 1, breakFrames: 140, vulnerable: 1.25 },
    vfx: { ghost: 0xe8e0ff },
    appearance: {
      height: 0.9,
      skin: 0xe8dcc8,
      build: { chestW: 0.225, chestD: 0.16, shoulderX: 0.225, waistW: 0.18, upperArmR: 0.062, foreArmR: 0.054, fist: 0.058, thighR: 0.092, shinR: 0.072, headR: 0.145, neckLen: 0.05 },
      hair: { style: 'soldier_hair', color: 0xe8e4dc },
      face: { pupil: 0x101010, sclera: 0xffffff, eyeW: 0.9, brow: 0xe8e4dc },
      outfit: {
        topStyle: 'gi', top: 0x3a3a46, sleeves: 'long', sleeveColor: 0x3a3a46, wrist: 0xd8d2c4,
        belt: 0x2a2a33, pants: 0x6a6a76, pantsStyle: 'tight', boots: 0x2a2a33, bootStyle: 'gi',
      },
      portraitColor: '#8a8496',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xbfa8ee, core: 0xffffff, particles: 0xe8e0ff, speed: 1.1 }, mult: {} }],
    poses: Object.assign({ idle: palmPoses.a19_idle }, palmPoses),
    moves: {
      light: [
        { id: 'a20Chop', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 520, reach: 1.3, radius: 0.8, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'a19_palmW', strike: 'a19_palm' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'a20Jab', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 540, reach: 1.3, radius: 0.8, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'a20Kick', startup: 7, active: 3, recovery: 15, cancel: 9, damage: 700, reach: 1.45, radius: 0.9, lunge: 11, hitstun: 24, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'a20Hammer', startup: 12, active: 4, recovery: 24, damage: 1500, reach: 1.5, radius: 1, lunge: 12, hitstun: 32, knock: 'smash', knockSpeed: 26, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'a20Lunge', startup: 6, active: 7, recovery: 20, damage: 1100, reach: 1.45, radius: 0.95, lunge: 26, hitstun: 28, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'a19_palmW', strike: 'a19_palm' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'a20Drain', name: 'Energy Drain', damage: 1200, knockSpeed: 16, poses: ['grab', 'a19_grabW', 'a19_drain'] },
    },
    specials: {
      special1: {
        id: 'a20EyeBeam', name: 'Photon Flash', type: 'projectile', kiCost: 18, icon: 'blast', cooldown: 120,
        startup: 12, recovery: 18, pose: { wind: 'a19_eyeW', release: 'a19_eye' },
        projectile: { kind: 'blast', speed: 74, radius: 0.45, damage: 1300, homing: 0.4, color: 0xbfa8ee, core: 0xffffff, explode: 3, knock: 'heavy', knockSpeed: 20, impact: 2, life: 2.4 },
      },
      special2: {
        id: 'a20Grip', name: 'Absorption Grip', type: 'telekinesis', kiCost: 0, icon: 'guard', cooldown: 420,
        range: 3.2, startup: 14, maxFrames: 180, bossFrames: 130, kiPerSecond: 0, releaseStagger: 36, recovery: 28,
        mashGain: 0.055, escapeDecay: 0.006, cpuEscape: 0.5,
        drain: { hpPerSecond: 0.05, kiPerSecond: 16 },
        poses: { focus: 'a19_grabW', hold: 'a19_drain' },
      },
      ultimate: {
        id: 'a20Wave', name: 'Photon Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 36, chargeMax: 36, damage: [3800, 3800], radius: [1.3, 1.3], speed: 95, range: 150, sustain: 36,
        color: 0xbfa8ee, core: 0xffffff, poses: { charge: 'a19_eyeW', fire: 'a19_eye' }, recovery: 34,
      },
    },
    boss: {
      phases: [
        { id: 'watching', label: 'WATCHING', hpAbove: 0.55, speed: 1, damage: 1, patience: 1, patterns: { melee: 0.6, eye: 0.6, grip: 0.3 } },
        { id: 'cornered', label: 'CORNERED', hpAbove: 0, speed: 1.1, damage: 1.1, patience: 0.4, patterns: { melee: 0.8, eye: 0.8, grip: 0.6, wave: 0.4 } },
      ],
      patterns: {
        eye: { slot: 'special1', minDist: 5, cooldown: 170 },
        grip: { slot: 'special2', maxDist: 3.4, cooldown: 460 },
        wave: { slot: 'ultimate', minDist: 8, cooldown: 900 },
      },
      techniques: {},
    },
    absorb: { heal: 0.55, kiSteal: 12, cap: 1 },
    mechanic: { type: 'absorber', name: 'Energy Absorption', desc: 'The same palms as 19, on somebody who would rather run than trade.' },
    ai: { personality: 'adaptive', aggression: 0.45, defense: 0.7, ranged: 0.6, beam: 0.5, transformHp: 0, preferredRange: 6 },
    intro: { pose: 'a19_smug', expression: 'smirk' },
    victory: { poses: ['a19_smug'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
