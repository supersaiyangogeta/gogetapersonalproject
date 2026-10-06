/*
 * FRIEZA FORCE — enemy archetypes for story battles (not playable).
 *   soldier : melee grunt, rushes in, weak guard.
 *   gunner  : ranged grunt, keeps distance, fires blaster volleys.
 *   elite   : heavy bruiser, charges, guards, hits hard.
 * FRIEZA (first form) is a cinematic character in this build.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const soldierPoses = {
    idle: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.05 + b * 0.01 }, hips: [0, -10, 0], spine: [6, 0, 0], chest: [6, 6, 0], head: [-8, 0, 0],
        shoulderL: [-40, 0, 20], elbowL: [-90, 0, 0], shoulderR: [-30, 0, -22], elbowR: [-96, 0, 0],
        thighL: [-18, 10, 12], kneeL: [28, 0, 0], thighR: [12, -8, -12], kneeR: [22, 0, 0],
      };
    },
    gunIdle: (t) => ({
      ...C.blastR,
      root: { y: -0.03 + Math.sin(t * 3) * 0.01 },
      shoulderR: [-70, 0, 10], elbowR: [-20, 0, 0],
    }),
    elbowSmash: C.hammer,
    taunt: {
      chest: [-8, 0, 0], head: [-16, 0, 0],
      shoulderR: [-160, 0, -20], elbowR: [-30, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-100, 0, 0], handL: [0, 0, 30],
      thighL: [-8, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
    },
  };

  const armor = (pads, plate = 0xf1ecd8) => ({ plate, belly: plate, pads, padStyle: 'saga', hipGuards: pads, trim: pads });

  const soldierBase = {
    playable: false,
    era: 'Frieza Force',
    style: 'Soldier',
    ratings: { power: 1, speed: 2, ki: 1, defense: 1 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: soldierPoses,
    moves: {
      light: [
        { id: 'punch', startup: 7, active: 3, recovery: 14, cancel: 10, damage: 220, reach: 1.1, radius: 0.7, lunge: 8, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'punch2', startup: 7, active: 3, recovery: 16, cancel: 11, damage: 240, reach: 1.1, radius: 0.7, lunge: 8, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'kick', startup: 9, active: 4, recovery: 20, cancel: 14, damage: 300, reach: 1.3, radius: 0.8, lunge: 8, hitstun: 22, knock: 'push', knockSpeed: 6, impact: 1, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'smash', startup: 16, active: 4, recovery: 26, damage: 520, reach: 1.2, radius: 0.85, lunge: 10, hitstun: 30, knock: 'heavy', knockSpeed: 18, impact: 2, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'tackle', startup: 8, active: 8, recovery: 22, damage: 400, reach: 1.1, radius: 0.9, lunge: 24, hitstun: 24, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    specials: {},
    blast: { color: 0xff4fa0, core: 0xffe0f0, damage: 120, speed: 58, radius: 0.28, sfxPitch: 1.3 },
    mechanic: null,
    barks: { reactTransform: 'frieza_soldier_reactTransform' },
    intro: { pose: 'taunt', expression: 'smirk' },
    victory: { poses: ['taunt'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  const skins = [0x7fbf6a, 0xd98ab0, 0x8aa4d9, 0xc9b27a, 0xa07ad0];

  SL.data.characters.frieza_soldier = {
    ...soldierBase,
    id: 'frieza_soldier',
    name: 'Frieza Soldier',
    stats: { hp: 1500, ki: 60, stamina: 60, speed: 0.9, power: 0.8, defense: 0.8, weight: 0.8, kiRegen: 2, chargeRate: 20, canonPower: 0.1 },
    appearance: {
      height: 0.95,
      skin: skins[0],
      skinVariants: skins,
      build: { chestW: 0.19, upperArmR: 0.052 },
      hair: { style: 'soldier_hair', color: 0x2a1d1a },
      face: { pupil: 0x111111, brow: 0x2a1d1a },
      outfit: {
        topStyle: 'armor', top: 0x2b2340, arms: 0x2b2340, pants: 0x2b2340, pantsStyle: 'tight', sleeves: 'long', sleeveColor: 0x2b2340,
        gloves: 0xefeee6, boots: 0xefeee6, bootTip: 0x7a4f25, bootStyle: 'saiyan',
        armor: armor(0x7a4f25), scouter: { lens: 0xff3a3a, body: 0xd0d0d0 },
      },
      portraitColor: '#7a4f25',
    },
    ai: { personality: 'grunt', aggression: 0.6, defense: 0.2, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 2 },
  };

  SL.data.characters.frieza_gunner = {
    ...soldierBase,
    id: 'frieza_gunner',
    name: 'Frieza Gunner',
    stats: { hp: 1200, ki: 80, stamina: 50, speed: 0.95, power: 0.75, defense: 0.75, weight: 0.8, kiRegen: 6, chargeRate: 20, canonPower: 0.1 },
    appearance: {
      height: 0.92,
      skin: skins[1],
      skinVariants: skins,
      build: { chestW: 0.18, upperArmR: 0.05 },
      hair: { style: 'soldier_crest', color: 0x5a3a7a },
      face: { pupil: 0x111111, brow: 0x333333 },
      outfit: {
        topStyle: 'armor', top: 0x1f2a3a, arms: 0x1f2a3a, pants: 0x1f2a3a, pantsStyle: 'tight', sleeves: 'long', sleeveColor: 0x1f2a3a,
        gloves: 0xefeee6, boots: 0xefeee6, bootTip: 0x3a6a8a, bootStyle: 'saiyan',
        armor: armor(0x3a6a8a), scouter: { lens: 0xff3a3a, body: 0xd0d0d0 },
      },
      portraitColor: '#3a6a8a',
    },
    ai: { personality: 'gunner', aggression: 0.35, defense: 0.25, ranged: 0.9, beam: 0, transformHp: 0, preferredRange: 16 },
  };

  SL.data.characters.frieza_elite = {
    ...soldierBase,
    id: 'frieza_elite',
    name: 'Elite Soldier',
    style: 'Elite',
    ratings: { power: 3, speed: 2, ki: 2, defense: 3 },
    stats: { hp: 3400, ki: 100, stamina: 100, speed: 0.92, power: 1.05, defense: 1.05, weight: 1.6, kiRegen: 3, chargeRate: 26, canonPower: 0.4 },
    appearance: {
      height: 1.22,
      skin: 0xc8866a,
      build: { chestW: 0.25, shoulderX: 0.245, waistW: 0.17, waistD: 0.14, upperArmR: 0.07, foreArmR: 0.064, thighR: 0.1, shinR: 0.078, fist: 0.07, headR: 0.112 },
      hair: { style: 'soldier_crest', color: 0x6a2a2a },
      headExtras: [
        { a: [0.75, 0.55, 0], d: [0.7, 1, -0.2], l: 0.11, r: 0.03, color: 0x3a2a2a },
        { a: [-0.75, 0.55, 0], d: [-0.7, 1, -0.2], l: 0.11, r: 0.03, color: 0x3a2a2a },
      ],
      face: { pupil: 0xffd200, sclera: 0x222222, brow: 0x3a2a2a, browThick: 1.5 },
      outfit: {
        topStyle: 'armor', top: 0x301c1c, arms: 0xc8866a, pants: 0x301c1c, pantsStyle: 'tight',
        gloves: 0x2a2a2a, boots: 0x2a2a2a, bootTip: 0x8a1f1f, bootStyle: 'saiyan',
        armor: armor(0x8a1f1f, 0xe8e2cc), scouter: { lens: 0xff3a3a, body: 0xb0b0b0 },
      },
      portraitColor: '#8a1f1f',
    },
    moves: {
      light: [
        { id: 'hammerFist', startup: 8, active: 4, recovery: 16, cancel: 12, damage: 420, reach: 1.35, radius: 0.85, lunge: 9, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'backhand', startup: 8, active: 4, recovery: 18, cancel: 13, damage: 450, reach: 1.35, radius: 0.85, lunge: 9, hitstun: 24, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'stomp', startup: 10, active: 4, recovery: 22, cancel: 16, damage: 520, reach: 1.45, radius: 0.95, lunge: 9, hitstun: 30, knock: 'push', knockSpeed: 9, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'crusher', startup: 18, active: 5, recovery: 26, damage: 1000, reach: 1.45, radius: 1.0, lunge: 12, hitstun: 36, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 50, armor: true, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'uppercut', startup: 12, active: 4, recovery: 22, damage: 800, reach: 1.3, radius: 0.95, lunge: 10, hitstun: 34, knock: 'launch', knockSpeed: 16, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      },
      dash: { id: 'charge', startup: 10, active: 12, recovery: 24, damage: 800, reach: 1.3, radius: 1.1, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    specials: {
      special1: {
        id: 'eliteCannon', name: 'Crusher Cannon', type: 'projectile', kiCost: 35, icon: 'ball',
        startup: 18, recovery: 24, pose: { wind: 'blastWind', release: 'blastCharged' },
        projectile: { kind: 'ball', speed: 42, radius: 0.9, damage: 1300, homing: 0.9, color: 0xff5a3a, core: 0xffe0c0, explode: 6, knock: 'heavy', knockSpeed: 22, impact: 3, life: 3 },
      },
    },
    blast: { color: 0xff7040, core: 0xfff0d0, damage: 220, speed: 58, radius: 0.34 },
    ai: { personality: 'elite', aggression: 0.7, defense: 0.55, ranged: 0.35, beam: 0, transformHp: 0, preferredRange: 2.5 },
  };

  // Frieza, First Form — cinematic character (seated in hover pod)
  SL.data.characters.frieza = {
    id: 'frieza',
    name: 'Frieza',
    playable: false,
    cinematicOnly: true,
    era: 'Planet Vegeta',
    stats: { hp: 99999, ki: 100, stamina: 100, speed: 1, power: 1, defense: 1, weight: 1, kiRegen: 0, chargeRate: 0, canonPower: 50 },
    appearance: {
      height: 0.72,
      skin: 0xf2ece6,
      build: { chestW: 0.17, shoulderX: 0.18, waistW: 0.12, upperArmR: 0.045, foreArmR: 0.042, thighR: 0.07, shinR: 0.055, headR: 0.13 },
      hair: { style: 'frieza_dome', color: 0x8a3fb8 },
      headExtras: [
        { a: [0.9, 0.35, 0], d: [0.9, 0.9, -0.1], l: 0.12, r: 0.034, color: 0x2b2b35, depth: 0.95 },
        { a: [-0.9, 0.35, 0], d: [-0.9, 0.9, -0.1], l: 0.12, r: 0.034, color: 0x2b2b35, depth: 0.95 },
      ],
      face: { pupil: 0x6a0a1a, sclera: 0xffffff, brow: 0xf2ece6, noEars: true, eyeW: 1.1 },
      outfit: {
        topStyle: 'armor', top: 0xf2ece6, arms: 0xf2ece6, pants: 0x8a3fb8, pantsStyle: 'tight', legs: 0xf2ece6,
        boots: 0xf2ece6, bootStyle: 'gi',
        armor: { plate: 0x8a3fb8, belly: 0xf2ece6, pads: 0x8a3fb8, padStyle: 'down' },
      },
      portraitColor: '#8a3fb8',
    },
    forms: [{ id: 'base', name: 'First Form', aura: { color: 0xff3a6a, core: 0xffc0d0 }, mult: {} }],
    poses: {
      idle: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-60, 0, 0], head: [-4, 0, 0] },
      raiseFinger: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], shoulderR: [-178, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0], head: [-12, 0, 0] },
      laugh: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], chest: [-14, 0, 0], head: [-26, 0, 0], shoulderL: [-50, 0, -10], elbowL: [-120, 0, 0], shoulderR: [-178, 0, -6], elbowR: [-4, 0, 0] },
    },
    moves: { light: [], heavy: {} },
    specials: {},
    ai: { personality: 'boss' },
  };
})();
