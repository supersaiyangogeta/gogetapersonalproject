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
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
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
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
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
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
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
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Frieza',
    playable: false,
    era: 'Namek Saga',
    style: 'Emperor',
    blurb: 'The first form, and he is bored. Nothing he does here is his best — which is the problem.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 4 },
    // first form only so far; the later forms are planned, not built (see STATUS.md)
    stats: { hp: 30000, ki: 140, stamina: 160, speed: 1.2, power: 1.3, defense: 1.2, weight: 1.1, kiRegen: 4, chargeRate: 34, canonPower: 6 },
    poise: { max: 90, regen: 12, regenDelay: 120, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 150, vulnerable: 1.2 },
    vfx: { ghost: 0xffb0c8 },
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
        // his tail: jointed and alive, and something the Spirit Bomb can take half of (model.cutTail)
        longTail: { color: 0xf2ece6, segments: 8, length: 0.95, radius: 0.045, lift: 0.95, curl: 0.18 },
      },
      portraitColor: '#8a3fb8',
    },
    // FOUR FORMS. Each one changes the silhouette (its own horns and overall size),
    // the numbers, the moveset and the specials — the engine reads form.moves and
    // form.specials, so a form genuinely replaces a kit rather than scaling it.
    // Transformations run through the bossTransform technique and the sequences below.
    forms: [
      {
        id: 'base',
        name: 'First Form',
        aura: { color: 0xff3a6a, core: 0xffc0d0, particles: 0xffb0c8, speed: 1.1 },
        mult: {},
      },
      {
        id: 'second',
        name: 'Second Form',
        noCost: true, // he enters it himself, through his boss phases
        style: 'full',
        line: 'frieza_transform2',
        aura: { color: 0xc23a6a, core: 0xffd0e0, particles: 0xff8ab0, speed: 1.2 },
        // heavier in every sense: more damage, more armour, less patience for moving
        mult: { damage: 1.45, speed: 0.88, defense: 1.35, kiRegen: 0.9, chargeRate: 1.1, guardStamina: 0.85 },
        look: {
          scale: 1.22,
          bulk: 1.35,
          tint: 0xd8c8f0,
          tintAmount: 0.2,
          // the long backswept horns
          headExtras: [
            { a: [0.75, 0.55, 0.1], d: [0.85, 0.75, -1], l: 0.46, r: 0.058, color: 0xe8e2d0, depth: 0.95, outline: 0.5 },
            { a: [-0.75, 0.55, 0.1], d: [-0.85, 0.75, -1], l: 0.46, r: 0.058, color: 0xe8e2d0, depth: 0.95, outline: 0.5 },
          ],
        },
        sequence: { length: 216, applyAt: 132, steps: [{ at: 0, pose: 'fz_brace', shake: 0.3 }, { at: 54, pose: 'fz_brace', shake: 0.6 }, { at: 108, pose: 'fz_roar', shake: 1, burst: true }, { at: 160, pose: 'fz_roar', shake: 0.5 }, { at: 190, pose: 'idle' }] },
        moves: {
          light: [
            { id: 'fz2Jab', startup: 7, active: 4, recovery: 15, cancel: 9, damage: 700, reach: 1.45, radius: 0.9, lunge: 12, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'fz2Tail', startup: 9, active: 5, recovery: 20, cancel: 12, damage: 980, reach: 2.6, radius: 1.2, lunge: 10, hitstun: 28, knock: 'push', knockSpeed: 22, impact: 3, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'fz2Horn', startup: 12, active: 5, recovery: 24, cancel: 14, damage: 1300, reach: 1.8, radius: 1.05, lunge: 20, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'fz_hornW', strike: 'fz_horn' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          ],
          heavy: {
            0: { id: 'fz2Impale', startup: 18, active: 6, recovery: 30, damage: 2400, reach: 2.2, radius: 1.2, lunge: 24, hitstun: 40, knock: 'smash', knockSpeed: 34, impact: 4, pose: { wind: 'fz_hornW', strike: 'fz_horn' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            2: { id: 'fz2Stomp', startup: 20, active: 6, recovery: 32, damage: 2200, reach: 2, radius: 1.4, lunge: 12, hitstun: 38, knock: 'smash', knockSpeed: 28, impact: 4, pose: { wind: 'fz_stompW', strike: 'fz_stomp' }, sfx: 'groundImpact', hitPose: 'hitHeavy' },
          },
          dash: { id: 'fz2Charge', startup: 7, active: 7, recovery: 22, damage: 1300, reach: 1.7, radius: 1.05, lunge: 44, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'fz_hornW', strike: 'fz_horn' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        specials: {
          special1: {
            id: 'deathBeam2', name: 'Death Beam', type: 'projectile', kiCost: 26, icon: 'blast', cooldown: 170,
            startup: 24, aimLock: 9, recovery: 22, pose: { wind: 'fz_aimW', aim: 'fz_aim', release: 'fz_aim' },
            projectile: { kind: 'blast', speed: 78, radius: 0.34, damage: 2200, homing: 0.08, color: 0xff3a6a, core: 0xffe0ea, explode: 2.6, knock: 'heavy', knockSpeed: 26, impact: 3, life: 2.6, guardPierce: true },
          },
          special2: {
            id: 'hornRush', name: 'Impaling Charge', type: 'rush', kiCost: 40, icon: 'rush',
            startup: 20, dashFrames: 26, speed: 80, armor: true, recovery: 34,
            poses: { wind: 'fz_hornW' },
            hits: [{ pose: 'fz_horn', damage: 2600, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 }],
          },
          ultimate: {
            id: 'deathStorm', name: 'Death Storm', type: 'eruption', kiCost: 100, icon: 'ultimate', ultimate: true,
            count: 8, interval: 9, delay: 26, lead: 0.55, radius: 3.4, columnHeight: 11, damage: 1200, knockSpeed: 26, recovery: 34,
            color: 0xff3a6a, poses: { wind: 'fz_stompW', slam: 'fz_stomp' },
          },
        },
      },
      {
        id: 'third',
        name: 'Third Form',
        noCost: true,
        style: 'full',
        line: 'frieza_transform3',
        aura: { color: 0xb46aff, core: 0xf0dcff, particles: 0xd8a0ff, speed: 1.5 },
        // the wrong shape moving too quickly: fast, brittle, relentless
        mult: { damage: 1.25, speed: 1.3, defense: 1.05, kiRegen: 1.2, chargeRate: 1.2, guardStamina: 0.8 },
        look: {
          scale: 1.12,
          bulk: 1.08,
          tint: 0xe8d8f8,
          tintAmount: 0.25,
          // the long backswept skull, in place of horns
          headExtras: [
            { a: [0, 0.7, -0.55], d: [0, 0.25, -1], l: 0.62, r: 0.075, color: 0xf2ece6, depth: 0.96, outline: 0.5, flat: 0.5 },
            { a: [0.5, 0.45, -0.6], d: [0.45, 0.1, -1], l: 0.34, r: 0.042, color: 0xf2ece6, depth: 0.96, outline: 0.5, flat: 0.5 },
            { a: [-0.5, 0.45, -0.6], d: [-0.45, 0.1, -1], l: 0.34, r: 0.042, color: 0xf2ece6, depth: 0.96, outline: 0.5, flat: 0.5 },
          ],
        },
        sequence: { length: 192, applyAt: 118, steps: [{ at: 0, pose: 'fz_brace', shake: 0.35 }, { at: 48, pose: 'fz_roar', shake: 0.8 }, { at: 100, pose: 'fz_roar', shake: 1, burst: true }, { at: 150, pose: 'fz_lungeW', shake: 0.4 }, { at: 176, pose: 'idle' }] },
        moves: {
          light: [
            { id: 'fz3Claw', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 620, reach: 1.4, radius: 0.8, lunge: 16, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'fz_lungeW', strike: 'fz_lunge' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'fz3Claw2', startup: 4, active: 3, recovery: 11, cancel: 6, damage: 660, reach: 1.4, radius: 0.8, lunge: 16, hitstun: 17, knock: 'flinch', impact: 1, pose: { wind: 'fz_lungeW', strike: 'fz_lunge' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'fz3Tail', startup: 6, active: 4, recovery: 14, cancel: 8, damage: 900, reach: 2.4, radius: 1.1, lunge: 14, hitstun: 24, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'fz3Snap', startup: 5, active: 3, recovery: 16, cancel: 9, damage: 1050, reach: 1.5, radius: 0.85, lunge: 18, hitstun: 26, knock: 'launch', knockSpeed: 18, impact: 3, pose: { wind: 'fz_lungeW', strike: 'fz_lunge' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          ],
          heavy: {
            0: { id: 'fz3Smash', startup: 11, active: 4, recovery: 22, damage: 1800, reach: 1.7, radius: 1, lunge: 22, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 4, pose: { wind: 'fz_lungeW', strike: 'fz_lunge' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            3: { id: 'fz3Launch', startup: 12, active: 4, recovery: 24, damage: 1700, reach: 1.9, radius: 1.05, lunge: 18, hitstun: 36, knock: 'launch', knockSpeed: 24, impact: 3, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
          dash: { id: 'fz3Dash', startup: 3, active: 6, recovery: 13, damage: 950, reach: 1.5, radius: 0.9, lunge: 52, hitstun: 22, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'fz_lungeW', strike: 'fz_lunge' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        },
        specials: {
          special1: {
            id: 'beamBarrage', name: 'Death Beam Barrage', type: 'scatter', kiCost: 42, icon: 'blast',
            windup: 16, rise: 20, height: 8, count: 12, damage: 900, speed: 70, range: 48, recovery: 20,
            color: 0xff3a6a, poses: { wind: 'fz_aim', throw: 'fz_aim' },
          },
          special2: {
            id: 'clawRush', name: 'Crawler Rush', type: 'rush', kiCost: 30, icon: 'rush',
            startup: 9, dashFrames: 22, speed: 92, armor: false, recovery: 24,
            poses: { wind: 'fz_lungeW' },
            hits: [
              { pose: 'fz_lunge', damage: 620, frames: 7, sfx: 'punchLight' },
              { pose: 'fz_lunge', damage: 660, frames: 7, sfx: 'punchLight' },
              { pose: 'fz_tail', damage: 720, frames: 8, sfx: 'punchLight' },
              { pose: 'fz_lunge', damage: 1500, frames: 13, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 4 },
            ],
          },
          ultimate: {
            id: 'deathWave3', name: 'Death Wave', type: 'bomberWave', kiCost: 100, icon: 'ultimate', ultimate: true,
            charge: 30, radius: 14, damage: 3200, knockSpeed: 34, recovery: 32,
            color: 0xff3a6a, poses: { charge: 'fz_waveW', fire: 'fz_wave' },
          },
        },
      },
      {
        id: 'final',
        name: 'Final Form',
        noCost: true,
        style: 'full',
        line: 'frieza_transform4',
        aura: { color: 0xff2a4a, core: 0xffffff, particles: 0xffc0c8, speed: 1.8 },
        // small, smooth and far above everything before it: speed and reach, not bulk
        mult: { damage: 1.7, speed: 1.45, defense: 1.5, kiRegen: 1.5, chargeRate: 1.4, guardStamina: 1.1 },
        look: {
          scale: 0.96,
          bulk: 0.92,
          tint: 0xffffff,
          tintAmount: 0.12,
          headExtras: [],
        },
        sequence: { length: 240, applyAt: 150, steps: [{ at: 0, pose: 'fz_brace', shake: 0.4 }, { at: 46, pose: 'fz_brace', shake: 0.7 }, { at: 92, pose: 'fz_roar', shake: 1 }, { at: 140, pose: 'fz_roar', shake: 1, burst: true }, { at: 196, pose: 'fz_ballW', shake: 0.3 }, { at: 222, pose: 'idle' }] },
        moves: {
          light: [
            { id: 'fz4Jab', startup: 3, active: 2, recovery: 9, cancel: 5, damage: 780, reach: 1.35, radius: 0.78, lunge: 18, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'fz4Cross', startup: 3, active: 2, recovery: 9, cancel: 5, damage: 820, reach: 1.35, radius: 0.78, lunge: 18, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'fz4Kick', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 1100, reach: 1.6, radius: 0.9, lunge: 18, hitstun: 22, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'fz_kickW', strike: 'fz_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'fz4Tail', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 1500, reach: 2.5, radius: 1.15, lunge: 14, hitstun: 28, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          ],
          heavy: {
            0: { id: 'fz4Smash', startup: 10, active: 4, recovery: 20, damage: 2600, reach: 1.7, radius: 1, lunge: 24, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 4, pose: { wind: 'fz_kickW', strike: 'fz_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            3: { id: 'fz4Whip', startup: 11, active: 5, recovery: 22, damage: 2800, reach: 2.6, radius: 1.25, lunge: 16, hitstun: 38, knock: 'smash', knockSpeed: 32, impact: 4, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          },
          dash: { id: 'fz4Blink', startup: 2, active: 6, recovery: 10, damage: 1200, reach: 1.5, radius: 0.9, lunge: 60, hitstun: 24, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        },
        specials: {
          special1: {
            id: 'deathSaucers', name: 'Death Saucers', type: 'deathSaucer', kiCost: 45, icon: 'blast', cooldown: 420,
                        // they turn at a limited rate (seekTurn, rad/s): stand still and they find you, move
            // sharply across their path and they sail past and have to come round again
            count: 2, startup: 24, interval: 16, recovery: 34, damage: 1800, speed: 34, radius: 0.7, life: 9, seek: 0.5, seekTurn: 2.3, seekDelay: 10, turnFrames: 170,
            color: 0xffe066, poses: { wind: 'fz_saucerW', throw: 'fz_saucer' },
          },
          special2: {
            id: 'deathBeam4', name: 'Death Beam', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 110,
            // the fastest finger of the four, and still a finger you can see coming
            startup: 20, aimLock: 8, recovery: 16, pose: { wind: 'fz_aimW', aim: 'fz_aim', release: 'fz_aim' },
            projectile: { kind: 'blast', speed: 88, radius: 0.34, damage: 2400, homing: 0.08, color: 0xff3a6a, core: 0xffe0ea, explode: 2.4, knock: 'heavy', knockSpeed: 26, impact: 3, life: 2.6, guardPierce: true },
          },
          ultimate: {
            id: 'deathBall', name: 'Death Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
            startup: 62, recovery: 48, pose: { wind: 'fz_ballW', release: 'fz_ball' },
            projectile: { kind: 'ball', speed: 30, radius: 2.6, damage: 6200, homing: 0.5, color: 0xff8a3a, core: 0xfff0d0, explode: 14, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.5 },
          },
        },
      },
    ],
    poses: {
      // standing stance: he never looks like he is working
      idle: (t) => {
        const b = Math.sin(t * 2);
        return {
          root: { y: -0.01 + b * 0.01 }, hips: [0, 6, 0], spine: [-2, 4, 0], chest: [-4, 8, 0], head: [-2, -8, 0],
          shoulderL: [-12, 0, 18], elbowL: [-64, 0, 0], shoulderR: [-12, 0, -18], elbowR: [-64, 0, 0],
          thighL: [-4, 6, 8], kneeL: [8, 0, 0], thighR: [2, -6, -8], kneeR: [7, 0, 0],
          hands: ['open', 'open'],
        };
      },
      // the pod poses from the prologue, unchanged in shape
      fz_pod: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-60, 0, 0], head: [-4, 0, 0] },
      fz_finger: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], shoulderR: [-178, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0], head: [-12, 0, 0] },
      fz_laugh: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], chest: [-14, 0, 0], head: [-26, 0, 0], shoulderL: [-50, 0, -10], elbowL: [-120, 0, 0], shoulderR: [-178, 0, -6], elbowR: [-4, 0, 0] },
      // first form kit
      fz_jabW: { root: { y: -0.02 }, hips: [0, -14, 0], chest: [0, -18, 0], head: [-4, 16, 0], shoulderR: [-22, 0, -22], elbowR: [-92, 0, 0], shoulderL: [-12, 0, 20], elbowL: [-66, 0, 0], thighL: [-8, 6, 8], kneeL: [12, 0, 0], thighR: [6, -6, -8], kneeR: [10, 0, 0] },
      fz_jab: { root: { y: -0.02, rx: 4 }, hips: [0, 14, 0], chest: [4, 24, 0], head: [-6, -20, 0], shoulderR: [-88, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-10, 0, 24], elbowL: [-72, 0, 0], thighL: [-14, 6, 8], kneeL: [20, 0, 0], thighR: [10, -6, -8], kneeR: [8, 0, 0] },
      // the tail, which is most of his melee
      fz_tailW: { root: { y: 0, rx: -6 }, hips: [0, -26, 0], spine: [-4, -20, 0], chest: [-6, -28, 0], head: [-6, 26, 0], shoulderL: [-28, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-24, 0, -28], elbowR: [-70, 0, 0], thighL: [-10, 10, 10], kneeL: [14, 0, 0], thighR: [8, -10, -10], kneeR: [12, 0, 0] },
      fz_tail: { root: { y: 0, rx: 8 }, hips: [0, 34, 0], spine: [6, 30, 0], chest: [8, 38, 0], head: [-10, -32, 0], shoulderL: [-20, 0, 40], elbowL: [-56, 0, 0], shoulderR: [-30, 0, -36], elbowR: [-52, 0, 0], thighL: [-18, 10, 10], kneeL: [22, 0, 0], thighR: [14, -10, -10], kneeR: [10, 0, 0] },
      fz_kickW: { root: { y: 0.02, rx: -8 }, spine: [-8, -10, 0], chest: [-10, -16, 0], head: [-6, 16, 0], shoulderL: [-36, 0, 32], elbowL: [-56, 0, 0], shoulderR: [-32, 0, -30], elbowR: [-52, 0, 0], thighR: [-66, 0, -10], kneeR: [84, 0, 0], footR: [18, 0, 0], thighL: [6, 0, 10], kneeL: [10, 0, 0] },
      fz_kick: { root: { y: 0.05, rx: 8 }, spine: [6, 16, 0], chest: [8, 22, 0], head: [-10, -18, 0], shoulderL: [-18, 0, 40], elbowL: [-38, 0, 0], shoulderR: [-32, 0, -34], elbowR: [-30, 0, 0], thighR: [-100, 0, -8], kneeR: [14, 0, 0], footR: [-12, 0, 0], thighL: [14, 0, 10], kneeL: [16, 0, 0] },
      // Death Beam: the finger goes up (the tell), then levels at you (the aim), then fires
      fz_aimW: { root: { y: 0 }, hips: [0, 8, 0], chest: [-4, 12, 0], head: [-8, -10, 0], shoulderR: [-150, 0, -10], elbowR: [-24, 0, 0], shoulderL: [-8, 0, 18], elbowL: [-56, 0, 0], thighL: [-4, 6, 8], kneeL: [6, 0, 0], thighR: [4, -6, -8], kneeR: [5, 0, 0], hands: ['open', 'point'] },
      fz_aim: { root: { y: 0 }, hips: [0, 10, 0], chest: [-2, 14, 0], head: [-6, -12, 0], shoulderR: [-92, 0, -4], elbowR: [-6, 0, 0], shoulderL: [-8, 0, 18], elbowL: [-56, 0, 0], thighL: [-4, 6, 8], kneeL: [6, 0, 0], thighR: [4, -6, -8], kneeR: [5, 0, 0], hands: ['open', 'point'] },
      // Death Wave: a slow sweep of the hand, and the ground opens
      fz_waveW: { root: { y: -0.03, rx: -6 }, hips: [0, -20, 0], spine: [-6, -16, 0], chest: [-8, -22, 0], head: [-4, 20, 0], shoulderR: [-56, 0, -34], elbowR: [-40, 0, 0], shoulderL: [-14, 0, 22], elbowL: [-60, 0, 0], thighL: [-12, 8, 10], kneeL: [18, 0, 0], thighR: [10, -8, -10], kneeR: [14, 0, 0], hands: ['open', 'open'] },
      fz_wave: { root: { y: -0.02, rx: 6 }, hips: [0, 26, 0], spine: [6, 22, 0], chest: [8, 30, 0], head: [-8, -26, 0], shoulderR: [-70, 0, 26], elbowR: [-16, 0, 0], shoulderL: [-12, 0, 26], elbowL: [-64, 0, 0], thighL: [-16, 8, 10], kneeL: [22, 0, 0], thighR: [12, -8, -10], kneeR: [10, 0, 0], hands: ['open', 'open'] },
      // second form: bigger, slower, horn-led
      fz_hornW: { root: { y: -0.04, rx: -14 }, hips: [0, -16, 0], spine: [-12, -12, 0], chest: [-16, -16, 0], head: [16, 14, 0], shoulderL: [-30, 0, 30], elbowL: [-74, 0, 0], shoulderR: [-26, 0, -28], elbowR: [-70, 0, 0], thighL: [-30, 10, 12], kneeL: [44, 0, 0], thighR: [-22, -10, -12], kneeR: [38, 0, 0] },
      fz_horn: { root: { y: 0.02, rx: 26 }, hips: [0, 10, 0], spine: [20, 8, 0], chest: [26, 10, 0], head: [-34, -8, 0], shoulderL: [10, 0, 26], elbowL: [-30, 0, 0], shoulderR: [12, 0, -26], elbowR: [-28, 0, 0], thighL: [-20, 8, 10], kneeL: [30, 0, 0], thighR: [-14, -8, -10], kneeR: [26, 0, 0], hands: ['fist', 'fist'] },
      fz_stompW: { root: { y: -0.06, rx: -8 }, spine: [-8, 0, 0], chest: [-12, 0, 0], head: [10, 0, 0], shoulderL: [-56, 0, 34], elbowL: [-60, 0, 0], shoulderR: [-56, 0, -34], elbowR: [-60, 0, 0], thighR: [-64, 0, -12], kneeR: [70, 0, 0], thighL: [-6, 0, 12], kneeL: [12, 0, 0] },
      fz_stomp: { root: { y: -0.12, rx: 12 }, spine: [12, 0, 0], chest: [16, 0, 0], head: [-16, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-30, 0, 0], thighR: [-16, 0, -10], kneeR: [16, 0, 0], footR: [24, 0, 0], thighL: [-8, 0, 10], kneeL: [14, 0, 0] },
      // third form: long skull, hunched, quick
      fz_lungeW: { root: { y: -0.08, rx: 24 }, hips: [0, -12, 0], spine: [18, -10, 0], chest: [22, -14, 0], head: [-26, 12, 0], shoulderL: [-40, 0, 36], elbowL: [-96, 0, 0], shoulderR: [-36, 0, -34], elbowR: [-92, 0, 0], thighL: [-46, 12, 14], kneeL: [72, 0, 0], thighR: [-38, -12, -14], kneeR: [66, 0, 0] },
      fz_lunge: { root: { y: -0.02, rx: 30 }, spine: [22, 16, 0], chest: [26, 22, 0], head: [-34, -18, 0], shoulderR: [-96, 0, -10], elbowR: [-14, 0, 0], shoulderL: [-30, 0, 34], elbowL: [-80, 0, 0], thighL: [-26, 10, 12], kneeL: [38, 0, 0], thighR: [16, -10, -12], kneeR: [16, 0, 0], hands: ['open', 'open'] },
      // final form: economical, upright, hands doing the work
      fz_saucerW: { root: { y: 0, rx: -4 }, hips: [0, -12, 0], chest: [-6, -14, 0], head: [-2, 14, 0], shoulderR: [-48, 0, -40], elbowR: [-72, 0, 0], shoulderL: [-16, 0, 20], elbowL: [-58, 0, 0], thighL: [-4, 6, 8], kneeL: [6, 0, 0], thighR: [4, -6, -8], kneeR: [5, 0, 0], hands: ['open', 'open'] },
      fz_saucer: { root: { y: 0, rx: 4 }, hips: [0, 18, 0], chest: [6, 22, 0], head: [-8, -18, 0], shoulderR: [-84, 0, 18], elbowR: [-18, 0, 0], shoulderL: [-14, 0, 24], elbowL: [-60, 0, 0], thighL: [-10, 6, 8], kneeL: [14, 0, 0], thighR: [8, -6, -8], kneeR: [6, 0, 0], hands: ['open', 'open'] },
      fz_ballW: (t) => ({ root: { y: 0.02, rx: -10 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-22, 0, 0], shoulderL: [-172, 0, 10], elbowL: [-10, 0, 0], shoulderR: [-172, 0, -10], elbowR: [-10, 0, 0], thighL: [-6, 6, 10], kneeL: [8, 0, 0], thighR: [4, -6, -10], kneeR: [6, 0, 0], hands: ['open', 'open'] }),
      fz_ball: { root: { y: 0, rx: 10 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-18, 0, 0], shoulderL: [-150, 0, 16], elbowL: [-18, 0, 0], shoulderR: [-150, 0, -16], elbowR: [-18, 0, 0], thighL: [-14, 6, 10], kneeL: [20, 0, 0], thighR: [10, -6, -10], kneeR: [10, 0, 0], hands: ['open', 'open'] },
      // the transformation itself: braced, then screaming, then still
      fz_brace: { root: { y: -0.06, rx: -10 }, hips: [0, 0, 0], spine: [-10, 0, 0], chest: [-16, 0, 0], head: [20, 0, 0], shoulderL: [-40, -20, 34], elbowL: [-110, 0, 0], shoulderR: [-40, 20, -34], elbowR: [-110, 0, 0], thighL: [-28, 10, 14], kneeL: [44, 0, 0], thighR: [-24, -10, -14], kneeR: [40, 0, 0], hands: ['fist', 'fist'] },
      fz_roar: { root: { y: 0.04, rx: -22 }, spine: [-18, 0, 0], chest: [-26, 0, 0], head: [34, 0, 0], shoulderL: [-70, -30, 50], elbowL: [-56, 0, 0], shoulderR: [-70, 30, -50], elbowR: [-56, 0, 0], thighL: [-16, 12, 18], kneeL: [26, 0, 0], thighR: [-12, -12, -18], kneeR: [22, 0, 0], hands: ['open', 'open'] },
      fz_defeat: C.knockdown,
      // standing poses for Bardock's vision (the future fight; prototype stand-in for his later forms)
      fz_block: { root: { y: -0.04 }, chest: [4, -10, 0], head: [-6, 0, 0], shoulderR: [-80, 0, 20], elbowR: [-120, 0, 0], shoulderL: [-60, 0, -10], elbowL: [-100, 0, 0], thighL: [-20, 0, 10], kneeL: [26, 0, 0], thighR: [10, 0, -10], kneeR: [18, 0, 0] },
      fz_point: { root: { y: 0 }, chest: [-4, 0, 0], head: [-10, 0, 0], shoulderR: [-90, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-40, 0, 0], thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [4, 0, -8], kneeR: [4, 0, 0], hands: ['fist', 'point'] },
    },
    moves: {
      // unhurried and very heavy: he is not trying, and it still hurts
      light: [
        { id: 'fzJab', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 420, reach: 1.2, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'fzCross', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 450, reach: 1.2, radius: 0.72, lunge: 12, hitstun: 19, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'fzTail', startup: 8, active: 4, recovery: 18, cancel: 10, damage: 780, reach: 2.1, radius: 1, lunge: 10, hitstun: 26, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'fzTailSmash', startup: 14, active: 5, recovery: 26, damage: 1400, reach: 2.3, radius: 1.15, lunge: 14, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 4, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'fzLaunch', startup: 13, active: 4, recovery: 24, damage: 1200, reach: 1.5, radius: 0.95, lunge: 14, hitstun: 32, knock: 'launch', knockSpeed: 22, impact: 3, pose: { wind: 'fz_kickW', strike: 'fz_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'fzDash', startup: 4, active: 5, recovery: 15, damage: 700, reach: 1.35, radius: 0.85, lunge: 40, hitstun: 24, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'fzToss', name: 'Tail Toss', damage: 900, knockSpeed: 28, poses: ['grab', 'fz_tailW', 'fz_tail'] },
    },
    specials: {
      // Death Beam: a single fingertip shot, fast and thin, and it goes through a guard. The
      // finger goes up, levels at you with a glint (aimLock: the aim is taken there), then fires:
      // guarding is no answer, moving after the glint is.
      special1: {
        id: 'deathBeam', name: 'Death Beam', type: 'projectile', kiCost: 24, icon: 'blast', cooldown: 150,
        startup: 22, aimLock: 9, recovery: 20, pose: { wind: 'fz_aimW', aim: 'fz_aim', release: 'fz_aim' },
        // speed is capped by the engine's per-frame collision step: much above ~90 a
        // thin blast can step straight past a fighter between frames and miss entirely
        projectile: { kind: 'blast', speed: 82, radius: 0.32, damage: 1700, homing: 0.08, color: 0xff3a6a, core: 0xffe0ea, explode: 2.2, knock: 'heavy', knockSpeed: 24, impact: 3, life: 2.6, guardPierce: true },
      },
      // Death Wave: he waves a hand and the ground opens in a line
      special2: {
        id: 'deathWave', name: 'Death Wave', type: 'bomberWave', kiCost: 45, icon: 'blast',
        charge: 34, radius: 11, damage: 1900, knockSpeed: 30, recovery: 34,
        color: 0xff3a6a, poses: { charge: 'fz_waveW', fire: 'fz_wave' },
      },
      ultimate: {
        id: 'deathBeamVolley', name: 'Death Beam Volley', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 22, rise: 26, height: 10, count: 14, damage: 700, speed: 96, range: 55, recovery: 26,
        color: 0xff3a6a, poses: { wind: 'fz_aim', throw: 'fz_aim' },
      },
    },
    blast: { color: 0xff3a6a, core: 0xffe0ea, damage: 380, speed: 82, radius: 0.26, sfxPitch: 1.1 },
    mechanic: { type: 'frieza', name: 'Cruelty', desc: 'He fights at whatever pace amuses him, and hits hardest at whoever is already hurt. The Death Beam goes through a guard, so blocking is not an answer to it — moving is.' },
    // he hits the wounded harder (Mechanics.frieza)
    cruelty: { below: 0.4, mul: 1.35 },
    // one fight, four bodies: each phase is a form, and entering a phase plays the
    // transformation that takes him into it. Missions can hold him at a phase with
    // fighter.bossPhaseCap, which is how the first-form story battle stays first form.
    boss: {
      phases: [
        { id: 'amused', label: 'FIRST FORM', hpAbove: 0.74, speed: 0.95, damage: 0.9, patience: 1.4, patterns: { melee: 0.8, beam: 0.55, wave: 0.35, taunt: 0.4 } },
        { id: 'annoyed', label: 'SECOND FORM', hpAbove: 0.5, speed: 1, damage: 1, patience: 0.9, line: 'angry', enter: 'toSecond', patterns: { melee: 1, beam: 0.5, charge: 0.7, storm: 0.3 } },
        { id: 'angry', label: 'THIRD FORM', hpAbove: 0.26, speed: 1.05, damage: 1.05, patience: 0.5, line: 'angry3', enter: 'toThird', patterns: { melee: 1.2, barrage: 0.6, rush: 0.8, wave3: 0.3 } },
        { id: 'dominating', label: 'FINAL FORM', hpAbove: 0, speed: 1.1, damage: 1.1, patience: 0.35, line: 'final', enter: 'toFinal', patterns: { melee: 1, saucers: 0.5, beam4: 0.9, ball: 0.25, taunt: 0.3 } },
      ],
      patterns: {
        // first form
        beam: { slot: 'special1', minDist: 5, maxDist: 55, cooldown: 190, punishCharge: true, finisher: true },
        wave: { slot: 'special2', minDist: 6, maxDist: 30, cooldown: 420 },
        volley: { slot: 'ultimate', minDist: 8, cooldown: 720, finisher: true },
        // second form
        charge: { slot: 'special2', minDist: 5, maxDist: 30, cooldown: 360 },
        storm: { slot: 'ultimate', minDist: 4, cooldown: 780, finisher: true },
        // third form
        barrage: { slot: 'special1', minDist: 7, maxDist: 46, cooldown: 300, punishCharge: true },
        rush: { slot: 'special2', minDist: 4, maxDist: 28, cooldown: 260 },
        wave3: { slot: 'ultimate', minDist: 6, cooldown: 760, finisher: true },
        // final form
        saucers: { slot: 'special1', minDist: 6, maxDist: 44, cooldown: 620 },
        beam4: { slot: 'special2', minDist: 4, maxDist: 55, cooldown: 150, punishCharge: true, finisher: true },
        ball: { slot: 'ultimate', minDist: 12, cooldown: 900, finisher: true },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 30, cooldown: 540 },
      },
      techniques: {
        taunt: { type: 'bossTaunt', frames: 64, line: 'taunt', poses: { taunt: 'fz_aim' } },
        toSecond: { type: 'bossTransform', frames: 216, form: 1 },
        toThird: { type: 'bossTransform', frames: 192, form: 2 },
        toFinal: { type: 'bossTransform', frames: 240, form: 3 },
      },
    },
    // RHYTHM: he fights in bursts and then stops to watch what you do about it (owner, round 3:
    // he read as constant input denial). Three aggressive decisions, then about a second of
    // circling, taunting or simply standing there — which is the player's turn.
    // FAIRNESS (owner's Frieza fairness pass): every dangerous action has a tell, a commitment
    // and a way out. approachBoost: he stops boosting 10 m out, so the last stretch of his
    // approach is seen. whiffBreath: a string that swings at air ends, and he takes a breath.
    // patternBreath: after a technique he watches what it did before the next exchange.
    // blastTell: his hand glows before a volley. leash: he never runs the fight from 24 m+.
    ai: { personality: 'elite', aggression: 0.6, defense: 0.55, ranged: 0.7, beam: 0.5, transformHp: 0, preferredRange: 7, hooks: 'frieza', rhythm: { burst: 3, rest: 75 }, approachBoost: 10, whiffBreath: 45, patternBreath: 36, blastTell: 14, leash: 24 },
    // a strike that finds nothing leaves him finishing the swing, and the first strike of a
    // string winds up a little longer than the rest (fighter.js attack state / _startAttack)
    whiffRecovery: 16,
    openerStartup: 7,
    barks: { taunt: 'frieza_taunt', angry: 'frieza_angry', hurt: 'frieza_hurt', angry3: 'frieza_angry3', final: 'frieza_final' },
    intro: { pose: 'fz_aim', expression: 'smirk' },
    victory: { poses: ['fz_aim'], expression: 'grin' },
    defeat: { pose: 'fz_defeat', expression: 'ko' },
  };

  /*
   * FULL POWER (100%). The final form with nothing held back: bigger, heavier, a larger and
   * angrier aura, and the numbers of somebody who has stopped playing. It shares the final
   * form's techniques (it is the same body pushed further) and is story-only: the dying-planet
   * mission hands it over (SL.data.formGivenBy), nothing before it can reach it, and the wheel
   * never offers it.
   */
  (() => {
    const fz = SL.data.characters.frieza;
    const fin = fz.forms.find((f) => f.id === 'final');
    fz.forms.push(
      Object.assign({}, fin, {
        id: 'full',
        name: 'Full Power',
        short: '100%',
        storyLocked: true,
        line: 'frieza_final',
        aura: { color: 0xff1a3a, core: 0xffe6ea, particles: 0xff8a9a, speed: 2.3, idle: 0.62, sharp: 0.4 },
        mult: Object.assign({}, fin.mult, { damage: 2.05, speed: 1.55, defense: 1.8 }),
        look: Object.assign({}, fin.look, { scale: 1.07, bulk: 1.34, tintAmount: 0.18 }),
        sequence: {
          length: 300,
          applyAt: 210,
          // the body swells past what it was built for: brace, roar, and the burst
          steps: [
            { at: 0, pose: 'fz_brace', speed: 6, expression: 'angry', aura: 0.4, mood: [0.4, 0x3a0810, 1], shot: 'orbit', sfx: 'rumble', rocks: true },
            { at: 60, quake: 0.3 },
            { at: 130, pose: 'fz_roar', speed: 6, expression: 'shout', aura: 0.9, sfx: 'roar', quake: 0.5, lightning: true },
            { at: 180, quake: 0.7, skyBolt: true },
            { at: 210, burst: true, sfx: 'transformBurst', flash: 0.7, crater: 6, mood: [0.3, 0x4a1010, 0.4], lightning: false, rocks: false },
            { at: 250, pose: 'fz_ballW', speed: 4, expression: 'smirk', shot: 'face' },
            { at: 290, pose: 'idle' },
          ],
        },
      })
    );
  })();
})();
