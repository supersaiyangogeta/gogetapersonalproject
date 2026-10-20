/*
 * FRIEZA'S MEN ON NAMEK (Namek Saga) — story enemies for Vegeta's Namek campaign.
 *
 *   CUI — ENEMY (playable in Free Battle after "A Prince on Namek"). Vegeta's old rival in Frieza's army: a purple,
 *     finned alien who fights from range. Quick volleys, a charged Cui Cannon,
 *     and a habit of backing off to shoot. Roughly Vegeta's equal on paper.
 *   DODORIA — BOSS (playable in Free Battle after "A Prince on Namek"). Frieza's pink, spiked bruiser. Not a health
 *     sponge: POISE (light hits don't move him), TELEGRAPHED BODY SLAM (red disc
 *     where he lands — get out or jump), SHOULDER RAM, a BEAR HUG throw, and the
 *     MOUTH ENERGY WAVE. Two phases: BULLY (enjoys himself) and CORNERED (roars,
 *     rams and slams more, fires the mouth wave). Built on the boss framework
 *     Nappa uses.
 *
 * Level 1 functional prototypes: procedural bodies, shared poses plus a few
 * signature ones.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const DODORIA_SKIN = 0xf09ab4;
  const DODORIA_SPIKE = 0xc85f8a;
  const ARMOR = { plate: 0xf2ecd8, belly: 0xf2ecd8, pads: 0x9a7a3a, padStyle: 'wide', hipGuards: 0x9a7a3a, trim: 0x9a7a3a };

  /* ------------------------------------------------------------------ DODORIA */
  const dodoriaPoses = {
    // a heavy, pleased-with-himself stance: belly forward, fists low
    idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.06 + b * 0.012 }, hips: [0, -6, 0], spine: [-6, 0, 0], chest: [-6, 4, 0], head: [-4, 4, 0],
        shoulderL: [-16, 0, 40], elbowL: [-50, 0, 0], shoulderR: [-12, 0, -38], elbowR: [-56, 0, 0],
        thighL: [-14, 20, 18], kneeL: [22 + b * 2, 0, 0], footL: [-4, 0, 0], thighR: [8, -20, -18], kneeR: [18 + b * 2, 0, 0], footR: [-4, 0, 0],
      };
    },
    dd_laugh: (t) => {
      const s = Math.sin(t * 14);
      return {
        root: { y: -0.04 + Math.abs(s) * 0.02 }, spine: [-10, 0, 0], chest: [-16 + s * 3, 0, 0], head: [-24 + s * 4, 0, 0],
        shoulderL: [-10, 0, 50], elbowL: [-100, 0, 0], shoulderR: [-10, 0, -50], elbowR: [-100, 0, 0],
        thighL: [-8, 16, 16], kneeL: [12, 0, 0], thighR: [4, -16, -16], kneeR: [10, 0, 0],
      };
    },
    dd_crouch: (t) => {
      const s = Math.sin(t * 36) * 1.5;
      return {
        root: { y: -0.3 + s * 0.004 }, spine: [20, 0, 0], chest: [16 + s, 0, 0], head: [-14, 0, 0],
        shoulderL: [-40, 0, 60], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -60], elbowR: [-90, 0, 0],
        thighL: [-76, 26, 24], kneeL: [104, 0, 0], thighR: [-70, -26, -24], kneeR: [100, 0, 0],
      };
    },
    // body slam in the air: arms spread, belly first
    dd_slamAir: {
      root: { y: 0.02, rx: 30 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-20, 0, 0],
      shoulderL: [-60, 0, 100], elbowL: [-20, 0, 0], shoulderR: [-60, 0, -100], elbowR: [-20, 0, 0],
      thighL: [-30, 20, 20], kneeL: [60, 0, 0], thighR: [-30, -20, -20], kneeR: [60, 0, 0],
      hands: ['open', 'open'],
    },
    dd_slamLand: {
      root: { y: -0.34, rx: 20 }, spine: [24, 0, 0], chest: [18, 0, 0], head: [-20, 0, 0],
      shoulderL: [-30, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -70], elbowR: [-30, 0, 0],
      thighL: [-80, 30, 26], kneeL: [110, 0, 0], thighR: [-76, -30, -26], kneeR: [106, 0, 0],
    },
    dd_mouthCharge: { root: { y: -0.08 }, spine: [12, 0, 0], chest: [10, 0, 0], neck: [-10, 0, 0], head: [-18, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-70, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-70, 0, 0], thighL: [-24, 16, 18], kneeL: [34, 0, 0], thighR: [12, -16, -18], kneeR: [24, 0, 0] },
    dd_mouthFire: { root: { y: -0.08 }, spine: [-6, 0, 0], chest: [-8, 0, 0], neck: [8, 0, 0], head: [10, 0, 0], shoulderL: [-10, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -60], elbowR: [-40, 0, 0], thighL: [-28, 16, 20], kneeL: [38, 0, 0], thighR: [14, -16, -20], kneeR: [26, 0, 0] },
    dd_roar: (t) => {
      const s = Math.sin(t * 30);
      return { root: { y: 0 }, spine: [-14, 0, 0], chest: [-20 + s, 0, 0], head: [-36, 0, 0], shoulderL: [-30, 0, 100], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -100], elbowR: [-40, 0, 0], thighL: [-16, 20, 22], kneeL: [26, 0, 0], thighR: [-12, -20, -22], kneeR: [22, 0, 0], hands: ['fist', 'fist'] };
    },
    // on his knees, hands up: the end of the fight
    dd_beg: (t) => {
      const s = Math.sin(t * 9);
      return {
        root: { y: -0.46 }, spine: [14, 0, 0], chest: [10, 0, 0], head: [-6 + s * 2, 0, 0],
        shoulderL: [-110, 0, 20], elbowL: [-90, 0, 0], shoulderR: [-110, 0, -20], elbowR: [-90, 0, 0],
        thighL: [-86, 10, 14], kneeL: [140, 0, 0], thighR: [-86, -10, -14], kneeR: [140, 0, 0],
        hands: ['open', 'open'],
      };
    },
    dd_hugW: { ...C.grab, shoulderL: [-70, 0, 60], shoulderR: [-70, 0, -60] },
  };

  const spike = (x, y, z, dx, dy, dz, l = 0.075, r = 0.03) => ({ a: [x, y, z], d: [dx, dy, dz], l, r, color: DODORIA_SPIKE, depth: 0.9, outline: 0.6 });

  SL.data.characters.dodoria = {
    id: 'dodoria',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Dodoria',
    fullName: 'Dodoria, Frieza\'s Enforcer',
    era: 'Namek Saga',
    playable: true, // Free Battle after "A Prince on Namek" (unlocks.js)
    poise: { max: 90, regen: 10, regenDelay: 110, armor: 2, cost: { 1: 5, 2: 9, 3: 16, 4: 28 }, beamMul: 1.4, beamArmor: true, breakFrames: 160, vulnerable: 1.35 },
    style: 'Bruiser',
    blurb: 'Frieza\'s pink enforcer: a wall of spikes and armor who loves a massacre and hates a fair fight.',
    ratings: { power: 4, speed: 2, ki: 3, defense: 4 },
    stats: { hp: 20000, ki: 100, stamina: 140, speed: 0.85, power: 1.05, defense: 1.1, weight: 1.8, kiRegen: 2, chargeRate: 26, canonPower: 1.2 },
    appearance: {
      height: 1.32,
      skin: DODORIA_SKIN,
      build: { chestW: 0.27, chestD: 0.2, shoulderX: 0.26, waistW: 0.24, waistD: 0.22, pelvisW: 0.2, upperArmR: 0.08, foreArmR: 0.07, fist: 0.072, delt: 0.1, thighR: 0.11, shinR: 0.082, neckR: 0.1, neckLen: 0.01, headR: 0.135 },
      hair: { style: 'frieza_dome', color: DODORIA_SKIN },
      headExtras: [
        spike(0, 0.95, 0.1, 0, 1, -0.2, 0.09),
        spike(0.45, 0.8, 0.1, 0.6, 0.8, -0.1),
        spike(-0.45, 0.8, 0.1, -0.6, 0.8, -0.1),
        spike(0.3, 0.6, -0.6, 0.4, 0.6, -0.8),
        spike(-0.3, 0.6, -0.6, -0.4, 0.6, -0.8),
        spike(0.85, 0.1, 0.3, 1, 0.1, 0.1, 0.06, 0.028),
        spike(-0.85, 0.1, 0.3, -1, 0.1, 0.1, 0.06, 0.028),
        // heavy lower lip
        { shape: 'ball', a: [0, -0.62, 0.9], d: [0, -0.2, 1], l: 0.03, r: 0.07, color: 0xd87aa0, depth: 0.95, flat: 0.5, outline: 0.3 },
      ],
      face: { noEars: true, pupil: 0x140a0a, eyeW: 0.8, browThick: 1.5, brow: DODORIA_SPIKE },
      outfit: {
        topStyle: 'armor', top: 0x2a2440, arms: DODORIA_SKIN, pants: 0x2a2440, pantsStyle: 'tight',
        boots: 0xf2eee2, bootTip: 0x6a4a8a, bootStyle: 'saiyan', wrist: 0x6a4a8a,
        armor: ARMOR,
        scouter: { lens: 0xff3a3a, body: 0xe2e2e2 },
      },
      portraitColor: '#f09ab4',
    },
    vfx: { ghost: 0xffc0d8 },
    audio: { strikePitch: 0.72, heavyPitch: 0.68 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffc0e0, core: 0xffffff, particles: 0xff9ad0 }, mult: {} }],
    poses: dodoriaPoses,
    moves: {
      light: [
        { id: 'backhand', startup: 8, active: 4, recovery: 18, cancel: 10, damage: 400, reach: 1.35, radius: 0.85, lunge: 8, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'hook', startup: 8, active: 4, recovery: 19, cancel: 11, damage: 440, reach: 1.35, radius: 0.85, lunge: 8, hitstun: 24, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'spikeHeadbutt', startup: 10, active: 4, recovery: 24, cancel: 13, damage: 540, reach: 1.2, radius: 0.9, lunge: 10, hitstun: 28, knock: 'heavy', knockSpeed: 18, impact: 2, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'bellyCrush', startup: 15, active: 5, recovery: 28, damage: 1050, reach: 1.25, radius: 1.25, lunge: 8, hitstun: 36, knock: 'smash', knockSpeed: 24, impact: 3, armor: true, guardCrush: true, guardDamage: 50, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'uppercut', startup: 13, active: 5, recovery: 26, damage: 900, reach: 1.25, radius: 1.0, lunge: 10, hitstun: 38, knock: 'launch', knockSpeed: 19, impact: 3, armor: true, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'shoulderRam', startup: 9, active: 12, recovery: 24, damage: 880, reach: 1.4, radius: 1.2, lunge: 30, hitstun: 32, knock: 'heavy', knockSpeed: 30, impact: 3, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      throw: { id: 'bearHug', name: 'Bear Hug', damage: 1400, knockSpeed: 28, poses: ['dd_hugW', 'grab', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'mouthWave', name: 'Mouth Energy Wave', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 26, chargeMax: 60, damage: [1900, 3000], radius: [0.6, 1.1], speed: 110, range: 150, sustain: 30,
        color: 0xff78c8, core: 0xffffff, poses: { charge: 'dd_mouthCharge', fire: 'dd_mouthFire' }, recovery: 30, fromHead: true,
      },
      special2: {
        id: 'pinkBarrage', name: 'Energy Barrage', type: 'projectile', kiCost: 25, icon: 'ball',
        startup: 18, recovery: 22, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 58, radius: 0.9, damage: 1800, homing: 1, color: 0xff90d0, core: 0xffffff, explode: 5, knock: 'heavy', knockSpeed: 22, impact: 3, life: 3 },
      },
      ultimate: {
        id: 'maxMouthWave', name: 'Full Power Mouth Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 60, chargeMax: 60, damage: [5200, 5200], radius: [1.6, 1.6], speed: 90, range: 170, sustain: 46,
        color: 0xff60c0, core: 0xffffff, poses: { charge: 'dd_mouthCharge', fire: 'dd_mouthFire' }, recovery: 44, fromHead: true,
      },
    },
    mechanic: { type: 'boss', name: 'Enforcer', desc: 'Poise shrugs off light hits until it breaks. Two phases: Bully and Cornered.' },
    boss: {
      phases: [
        { id: 'bully', label: 'BULLY', hpAbove: 0.5, speed: 0.95, damage: 0.9, patience: 1.2, patterns: { melee: 1, slam: 0.55, ram: 0.6, taunt: 0.6, barrage: 0.3 } },
        { id: 'cornered', label: 'CORNERED', hpAbove: 0, speed: 1.1, damage: 1.05, patience: 0.6, enter: 'roar', line: 'angry', patterns: { melee: 1, slam: 0.75, ram: 0.8, mouth: 0.5, barrage: 0.35 } },
      ],
      patterns: {
        slam: { technique: 'slam', minDist: 5, maxDist: 24, maxAltitude: 6, cooldown: 330 },
        ram: { inputs: [{ boostPressed: true, boost: true, my: 1 }, { boost: true, my: 1 }, { boost: true, my: 1 }, { light: true }], minDist: 6, maxDist: 26, cooldown: 280 },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 16, cooldown: 600 },
        mouth: { slot: 'special1', minDist: 10, hold: 40, cooldown: 480 },
        barrage: { slot: 'special2', minDist: 10, cooldown: 300 },
      },
      techniques: {
        slam: { type: 'groundSlam', crouch: 22, hang: 32, height: 6, maxRange: 18, radius: 7, clearHeight: 2.2, damage: 1700, knockSpeed: 18, recovery: 44, poses: { crouch: 'dd_crouch', air: 'dd_slamAir', land: 'dd_slamLand' } },
        roar: { type: 'bossRoar', frames: 60, blastAt: 18, radius: 12, knockSpeed: 18, damage: 0, poses: { roar: 'dd_roar' } },
        taunt: { type: 'bossTaunt', frames: 80, line: 'taunt', poses: { taunt: 'dd_laugh' } },
      },
    },
    ai: { personality: 'berserker', aggression: 0.7, defense: 0.3, ranged: 0.25, beam: 0.3, transformHp: 0, preferredRange: 4, hooks: 'boss' },
    barks: { taunt: 'dodoria_taunt', angry: 'dodoria_angry', hunt: 'dodoria_hunt' },
    intro: { pose: 'dd_laugh', expression: 'grin' },
    victory: { poses: ['dd_laugh'], expression: 'grin' },
    defeat: { pose: 'dd_beg', expression: 'hurt' },
  };

  /* --------------------------------------------------------------------- CUI */
  const CUI_SKIN = 0x9a6ac4;
  const fin = (x, y, z, dx, dy, dz, l = 0.08, r = 0.035) => ({ a: [x, y, z], d: [dx, dy, dz], l, r, color: 0xc28ae0, depth: 0.92, flat: 0.35, outline: 0.5 });

  SL.data.characters.cui = {
    id: 'cui',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Cui',
    fullName: 'Cui, Frieza\'s Elite',
    era: 'Namek Saga',
    playable: true, // Free Battle after "A Prince on Namek" (unlocks.js)
    style: 'Gunner',
    blurb: 'Vegeta\'s old rival in Frieza\'s army. Confident at range, nervous up close.',
    ratings: { power: 3, speed: 3, ki: 4, defense: 2 },
    stats: { hp: 12000, ki: 100, stamina: 100, speed: 1.02, power: 0.95, defense: 0.9, weight: 0.95, kiRegen: 4, chargeRate: 30, canonPower: 1 },
    appearance: {
      height: 0.94,
      skin: CUI_SKIN,
      build: { chestW: 0.2, shoulderX: 0.2, waistW: 0.13, upperArmR: 0.055, headR: 0.125 },
      hair: { style: 'frieza_dome', color: CUI_SKIN },
      headExtras: [
        // fin-like ridges swept back over the head and at the jaw
        fin(0, 0.9, 0.2, 0, 0.5, -1, 0.1),
        fin(0.55, 0.55, -0.2, 0.6, 0.3, -1),
        fin(-0.55, 0.55, -0.2, -0.6, 0.3, -1),
        fin(0.8, -0.3, 0.2, 1, -0.3, -0.4, 0.06, 0.03),
        fin(-0.8, -0.3, 0.2, -1, -0.3, -0.4, 0.06, 0.03),
      ],
      face: { noEars: true, pupil: 0x1a0a1a, eyeW: 1.05, browThick: 1.1, brow: 0x6a3a8a },
      outfit: {
        topStyle: 'armor', top: 0x2a2a3a, arms: CUI_SKIN, pants: 0x2a2a3a, pantsStyle: 'tight',
        gloves: 0xf2eee2, boots: 0xf2eee2, bootTip: 0x9a7a3a, bootStyle: 'saiyan',
        armor: Object.assign({}, ARMOR, { padStyle: 'up' }),
        scouter: { lens: 0x3a8aff, body: 0xe2e2e2 },
      },
      portraitColor: '#9a6ac4',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xd8b8ff, core: 0xffffff, particles: 0xc8a0ff }, mult: {} }],
    poses: {},
    moves: {
      light: [
        { id: 'jab', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 250, reach: 1.1, radius: 0.7, lunge: 9, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cross', startup: 5, active: 3, recovery: 13, cancel: 8, damage: 270, reach: 1.1, radius: 0.7, lunge: 9, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'kick', startup: 7, active: 4, recovery: 15, cancel: 9, damage: 320, reach: 1.3, radius: 0.8, lunge: 9, hitstun: 22, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'spinKick', startup: 11, active: 4, recovery: 22, damage: 680, reach: 1.3, radius: 0.9, lunge: 12, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'dashElbow', startup: 6, active: 9, recovery: 18, damage: 600, reach: 1.2, radius: 0.9, lunge: 28, hitstun: 28, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'toss', name: 'Toss', damage: 800, knockSpeed: 22, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'cuiBeam', name: 'Cui Beam', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 20, chargeMax: 70, damage: [1500, 2600], radius: [0.5, 1.0], speed: 105, range: 150, sustain: 30,
        color: 0xc080ff, core: 0xf8e8ff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 22,
      },
      special2: {
        id: 'volley', name: 'Energy Volley', type: 'projectile', kiCost: 20, icon: 'ball',
        startup: 12, recovery: 18, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 64, radius: 0.7, damage: 1300, homing: 1.4, color: 0xd8a0ff, core: 0xffffff, explode: 4, knock: 'push', knockSpeed: 12, impact: 2, life: 3 },
      },
      ultimate: {
        id: 'cuiCannon', name: 'Cui Cannon', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 30, recovery: 26, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 52, radius: 1.3, damage: 3600, homing: 1.6, color: 0xb070ff, core: 0xffffff, explode: 7, knock: 'heavy', knockSpeed: 26, impact: 3, life: 4 },
      },
    },
    mechanic: null,
    ai: { personality: 'gunner', aggression: 0.5, defense: 0.5, ranged: 0.75, beam: 0.5, transformHp: 0, preferredRange: 9 },
    barks: {},
    intro: { pose: 'laughPoint', expression: 'smirk' },
    victory: { poses: ['victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
