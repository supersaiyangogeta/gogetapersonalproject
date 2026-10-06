/*
 * RADITZ (Saiyan Saga) — Goku's older brother, a bullying elite-class brute.
 * Identity: long reach, heavy two-handed strikes, punishes anyone who is
 * already reeling. Story boss of Chapter 1; playable as a PROTOTYPE after
 * clearing "A Brother From Space".
 * Mechanic RUTHLESS: extra damage against reeling opponents; knockdowns feed ki.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // arrogant, upright stance with loose fists
    idle: (t) => {
      const b = Math.sin(t * 1.9);
      return {
        root: { y: -0.01 + b * 0.006 },
        hips: [0, 6, 0], spine: [-2, 0, 0], chest: [-4, -6, 0], head: [-10, 8, 0],
        shoulderL: [-8, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -18], elbowR: [-70, 0, 0],
        thighL: [-6, 4, 12], kneeL: [8 + b * 2, 0, 0], thighR: [6, -4, -12], kneeR: [6 + b * 2, 0, 0],
      };
    },
    flyIdle: (t) => ({
      root: { y: Math.sin(t * 1.8) * 0.03 }, chest: [-6, 0, 0], head: [-14, 0, 0],
      shoulderL: [-4, 0, 24], elbowL: [-16, 0, 0], shoulderR: [-4, 0, -24], elbowR: [-16, 0, 0],
      thighL: [-2, 0, 6], kneeL: [14, 0, 0], footL: [36, 0, 0], thighR: [-8, 0, -6], kneeR: [26, 0, 0], footR: [40, 0, 0],
    }),
    r_backhandW: {
      root: { y: -0.02 }, chest: [2, 40, 0], head: [-8, -30, 0],
      shoulderR: [-60, 0, 70], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-14, 10, 12], kneeL: [16, 0, 0], thighR: [8, -10, -12], kneeR: [12, 0, 0],
    },
    r_backhand: {
      root: { y: -0.04, rx: 4 }, chest: [4, -38, 0], head: [-10, 26, 0],
      shoulderR: [-88, 0, -40], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 26], elbowL: [-50, 0, 0],
      thighL: [-22, 10, 12], kneeL: [24, 0, 0], thighR: [12, -10, -12], kneeR: [12, 0, 0],
      hands: ['fist', 'open'],
    },
    r_elbowW: { ...C.punchWindL, chest: [0, -30, 0] },
    r_elbow: {
      root: { y: -0.06, rx: 10 }, chest: [10, 30, 0], head: [-14, -20, 0],
      shoulderL: [-90, 0, 50], elbowL: [-140, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-90, 0, 0],
      thighL: [-30, 8, 12], kneeL: [36, 0, 0], thighR: [14, -8, -12], kneeR: [16, 0, 0],
    },
    r_kickW: { ...C.kickWindR },
    r_kick: { ...C.kickR, chest: [-10, 10, 0] },
    r_doubleAxeW: { ...C.hammerWind, root: { y: 0.06, rx: -10 } },
    r_doubleAxe: { ...C.hammer },
    r_shoulderW: {
      root: { y: -0.12 }, spine: [16, -20, 0], chest: [10, -30, 0], head: [-16, 26, 0],
      shoulderL: [-50, 0, 10], elbowL: [-100, 0, 0], shoulderR: [-10, 0, -30], elbowR: [-80, 0, 0],
      thighL: [-40, 10, 12], kneeL: [56, 0, 0], thighR: [24, -10, -12], kneeR: [30, 0, 0],
    },
    r_shoulder: {
      root: { y: -0.08, rx: 24 }, spine: [16, 30, 0], chest: [8, 40, 0], head: [-26, -30, 0],
      shoulderL: [-70, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-10, 0, -20], elbowR: [-70, 0, 0],
      thighL: [-50, 10, 12], kneeL: [60, 0, 0], thighR: [30, -10, -12], kneeR: [20, 0, 0],
    },
    r_sundayCharge: (t) => {
      const s = Math.sin(t * 34) * 1.4;
      return {
        root: { y: -0.08 }, chest: [-6 + s, 0, 0], head: [-6, 0, 0],
        shoulderL: [-70, 0, 70], elbowL: [-20, 0, 0], shoulderR: [-70, 0, -70], elbowR: [-20, 0, 0],
        thighL: [-26, 0, 14], kneeL: [34, 0, 0], thighR: [14, 0, -14], kneeR: [26, 0, 0],
        hands: ['open', 'open'],
      };
    },
    r_sundayFire: {
      root: { y: -0.08, rx: 6 }, chest: [4, 0, 0], head: [-10, 0, 0],
      shoulderL: [-90, 0, 14], elbowL: [-2, 0, 0], handL: [-60, 0, 0], shoulderR: [-90, 0, -14], elbowR: [-2, 0, 0], handR: [-60, 0, 0],
      thighL: [-30, 0, 14], kneeL: [36, 0, 0], thighR: [18, 0, -14], kneeR: [24, 0, 0],
      hands: ['open', 'open'],
    },
    r_crushWind: {
      root: { y: -0.02 }, chest: [-10, 0, 0], head: [-20, 0, 0],
      shoulderL: [-170, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-30, 0, 0],
      thighL: [-10, 0, 12], kneeL: [10, 0, 0], thighR: [6, 0, -12], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    r_crushThrow: {
      root: { y: -0.08, rx: 14 }, chest: [16, 0, 0], head: [-18, 0, 0],
      shoulderL: [-100, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-100, 0, -20], elbowR: [-10, 0, 0],
      thighL: [-34, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    r_taunt: {
      root: { y: 0 }, chest: [-8, 14, 0], head: [-18, -12, 6],
      shoulderL: [-10, 0, 20], elbowL: [-120, 0, 0], handL: [0, 0, 40], shoulderR: [-60, 0, -40], elbowR: [-60, 0, 0],
      thighL: [-6, 0, 10], kneeL: [4, 0, 0], thighR: [4, 0, -10], kneeR: [4, 0, 0],
      hands: ['fist', 'open'],
    },
    r_laugh: { ...C.armsCrossed, chest: [-16, 0, 0], head: [-30, 0, 0] },
    // story (Chapter 1) poses
    r_tailPain: {
      hands: ['open', 'open'],
      root: { y: -0.28, rx: 10 }, spine: [18, 0, 0], chest: [22, 0, 0], head: [12, 0, 0],
      shoulderL: [-40, 0, 44], elbowL: [-60, 0, 0], shoulderR: [-40, 0, -44], elbowR: [-60, 0, 0],
      thighL: [-44, 0, 14], kneeL: [76, 0, 0], thighR: [-30, 0, -14], kneeR: [74, 0, 0],
    },
    r_beg: {
      hands: ['open', 'open'],
      root: { y: -0.46, rx: 6 }, chest: [10, 0, 0], head: [-10, 0, 0],
      shoulderL: [-70, 0, 20], elbowL: [-60, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-60, 0, 0],
      thighL: [-90, 0, 8], kneeL: [100, 0, 0], thighR: [10, 0, -8], kneeR: [120, 0, 0], footR: [40, 0, 0],
    },
    r_struggle: (t) => {
      const s = Math.sin(t * 18);
      return {
        hands: ['fist', 'fist'],
        root: { y: -0.02 + s * 0.01 }, spine: [-8, s * 4, 0], chest: [-14, s * 6, 0], head: [-22, -s * 8, 0],
        shoulderL: [-150, 0, 52], elbowL: [-84, 0, 0], shoulderR: [-150, 0, -52], elbowR: [-84, 0, 0],
        thighL: [-30 - s * 12, 0, 10], kneeL: [50, 0, 0], thighR: [10 + s * 12, 0, -10], kneeR: [24, 0, 0],
      };
    },
    r_stunned: {
      hands: ['open', 'fist'],
      root: { y: -0.12, rx: 8 }, spine: [16, 0, 0], chest: [22, 0, 0], head: [6, 0, 0],
      shoulderL: [-66, 0, 8], elbowL: [-124, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-40, 0, 0],
      thighL: [-30, 0, 12], kneeL: [40, 0, 0], thighR: [14, 0, -12], kneeR: [30, 0, 0],
    },
    r_stomp: {
      root: { y: 0.02 }, chest: [14, 0, 0], head: [24, 0, 0],
      shoulderL: [-10, 0, 24], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -24], elbowR: [-30, 0, 0],
      thighL: [2, 0, 10], kneeL: [6, 0, 0], thighR: [-64, 0, -6], kneeR: [70, 0, 0], footR: [10, 0, 0],
    },
    r_pierced: {
      hands: ['open', 'open'],
      root: { y: 0, rx: -16 }, spine: [-14, 0, 0], chest: [-26, 0, 0], head: [-34, 0, 0],
      shoulderL: [-120, 0, 60], elbowL: [-30, 0, 0], shoulderR: [-120, 0, -60], elbowR: [-30, 0, 0],
      thighL: [-14, 0, 10], kneeL: [20, 0, 0], thighR: [6, 0, -10], kneeR: [30, 0, 0],
    },
    r_victory: { ...C.armsCrossed, head: [-16, -20, 0] },
  };

  SL.data.characters.raditz = {
    id: 'raditz',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Raditz',
    fullName: 'Raditz, Elite Saiyan Warrior',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    style: 'Brute',
    blurb: "Goku's ruthless older brother. Long reach, crushing strikes, no mercy for the fallen.",
    ratings: { power: 4, speed: 3, ki: 3, defense: 3 },
    stats: { hp: 15500, ki: 100, stamina: 110, speed: 0.98, power: 1.08, defense: 1.0, weight: 1.2, kiRegen: 2.2, chargeRate: 30, canonPower: 1.2 },
    appearance: {
      height: 1.04,
      skin: 0xf0c49c,
      build: { chestW: 0.228, chestD: 0.145, shoulderX: 0.232, waistW: 0.14, upperArmR: 0.066, foreArmR: 0.058, fist: 0.064, thighR: 0.094, shinR: 0.07, headR: 0.118 },
      hair: { style: 'raditz', color: 0x141418 },
      face: { pupil: 0x0d0d0d, eyeW: 0.95, browThick: 1.35 },
      outfit: {
        topStyle: 'armor', top: 0x1e1a24, arms: 0xf0c49c, pants: 0x1e1a24, pantsStyle: 'tight', legs: 0xf0c49c,
        boots: 0xefe8d8, bootTip: 0x6a3a22, bootStyle: 'saiyan',
        wrist: 0xb3202a, legBands: 0xb3202a,
        armor: { plate: 0x2a2430, belly: 0x2a2430, pads: 0x6a4630, padStyle: 'wide', hipGuards: 0x6a4630, trim: 0x6a4630 },
        scouter: { lens: 0x3cff78, body: 0xe2e2e2 },
        tail: 0x4a2a18,
      },
      portraitColor: '#3a2448',
    },
    vfx: { ghost: 0xd8b0ff },
    audio: { strikePitch: 0.9, heavyPitch: 0.85 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc88cff, core: 0xffffff, particles: 0xb07aff }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'backhand', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 300, reach: 1.3, radius: 0.75, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'r_backhandW', strike: 'r_backhand' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'straight', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 320, reach: 1.3, radius: 0.72, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'elbow', startup: 6, active: 3, recovery: 14, cancel: 8, damage: 360, reach: 1.1, radius: 0.8, lunge: 10, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'r_elbowW', strike: 'r_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'highKick', startup: 7, active: 4, recovery: 17, cancel: 10, damage: 430, reach: 1.45, radius: 0.85, lunge: 10, hitstun: 26, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'r_kickW', strike: 'r_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'shoulderRam', startup: 12, active: 6, recovery: 22, damage: 800, reach: 1.25, radius: 0.95, lunge: 20, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 2, guardCrush: true, guardDamage: 42, pose: { wind: 'r_shoulderW', strike: 'r_shoulder' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'risingKick', startup: 9, active: 4, recovery: 20, damage: 660, reach: 1.3, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        4: { id: 'doubleAxe', startup: 13, active: 4, recovery: 26, damage: 1000, reach: 1.2, radius: 0.95, lunge: 10, hitstun: 38, knock: 'smash', knockSpeed: 36, impact: 3, pose: { wind: 'r_doubleAxeW', strike: 'r_doubleAxe' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'flyingRam', startup: 6, active: 10, recovery: 18, damage: 740, reach: 1.25, radius: 1.0, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'r_shoulder', strike: 'r_shoulder' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      // TAIL GRAPPLE (his unique grab): reaches 3.3 m instead of a hand's 1.9, holds the victim in the air, hands stay free
      throw: {
        id: 'tailGrapple', name: 'Tail Grapple', technique: 'tailGrapple', damage: 1100, knockSpeed: 30, poses: { lash: 'r_shoulderW', hold: 'r_taunt', miss: 'r_stunned', pain: 'r_tailPain' },
        reach: 3.3, lashFrames: 10, whiffRecovery: 30, grabDamage: 150, holdDistance: 2.0, lift: 0.7, maxHold: 110,
        squeezeEvery: 26, squeezeDamage: 110, looseFrames: 9, mashGain: 0.09, escapeDecay: 0.006, cpuEscape: 0.006, cpuCounter: 0.35,
        followUps: {
          slam: { pose: 'r_doubleAxe', hitAt: 18, damage: 950, knock: 'smash', knockSpeed: 30, hitstun: 40, recovery: 22 },
          hurl: { pose: 'r_backhand', hitAt: 14, damage: 780, knock: 'heavy', knockSpeed: 42, hitstun: 44, recovery: 18 },
        },
        counter: { stunFrames: 80, kiDrain: 25, damage: 300 },
      },
    },
    specials: {
      special1: {
        id: 'doubleSunday', name: 'Double Sunday', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 16, chargeMax: 70, damage: [1700, 3000], radius: [0.5, 1.05], speed: 110, range: 150, sustain: 30,
        color: 0xc050ff, core: 0xf6dcff, poses: { charge: 'r_sundayCharge', fire: 'r_sundayFire' }, recovery: 22,
        callout: ['DOUBLE', 'SUNDAY!'], chargeLight: 0xc050ff,
      },
      special2: {
        id: 'saturdayCrush', name: 'Saturday Crush', type: 'projectile', kiCost: 35, icon: 'ball',
        startup: 16, recovery: 22, pose: { wind: 'r_crushWind', release: 'r_crushThrow' },
        projectile: { kind: 'ball', speed: 54, radius: 1.15, damage: 2000, homing: 1.0, color: 0xd070ff, core: 0xffffff, explode: 7, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      ultimate: {
        id: 'shiningFriday', name: 'Shining Friday', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 60, chargeMax: 60, damage: [4700, 4700], radius: [1.7, 1.7], speed: 110, range: 170, sustain: 50,
        color: 0xb040ff, core: 0xffffff, poses: { charge: 'r_sundayCharge', fire: 'r_sundayFire' }, recovery: 34, cinematic: true,
      },
    },
    mechanic: { type: 'ruthless', name: 'Ruthless', desc: 'Deals extra damage to reeling opponents. Knocking someone down fuels his ki and arrogance. His throw is a long-reaching Tail Grapple — but a victim who grabs his tail back leaves him writhing.' },
    ai: { personality: 'aggressive', aggression: 0.75, defense: 0.45, ranged: 0.45, beam: 0.55, transformHp: 0, preferredRange: 3, hooks: 'raditz' },
    barks: { combo: 'raditz_combo', hurt: 'raditz_hurt', lowHp: 'raditz_lowHp', reactTransform: 'raditz_reactTransform', grab: 'raditz_grab', tailPain: 'raditz_tailPain' },
    sequences: {
      intro: [
        { pose: 'r_taunt', dur: 1.2, speed: 7, expression: 'smirk' },
        { pose: 'r_laugh', dur: 1.3, speed: 6, expression: 'grin' },
      ],
      victory: [[{ pose: 'r_laugh', dur: 1.2, speed: 6, expression: 'grin' }, { pose: 'r_victory', dur: 9, speed: 5, expression: 'smirk' }]],
      defeat: [{ pose: 'defeatKneel', dur: 9, speed: 6, expression: 'hurt' }],
    },
    intro: { pose: 'r_taunt', expression: 'smirk' },
    victory: { poses: ['r_victory'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
