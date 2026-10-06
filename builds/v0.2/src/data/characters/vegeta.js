/*
 * VEGETA (Saiyan Saga) — aggressive, prideful pressure fighter.
 * Identity: compact precise strikes, relentless close range, counters.
 * Mechanic PRIDE: staying in close combat and landing counters builds power.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.03 + b * 0.008 },
        hips: [0, -8, 0], spine: [10, 2, 0], chest: [8, 6, 0], head: [-14, 0, 0],
        shoulderL: [-22, 0, 18], elbowL: [-82, 0, 0], handL: [0, 0, 10], shoulderR: [-26, 0, -18], elbowR: [-86, 0, 0], handR: [0, 0, -10],
        thighL: [-14, 8, 11], kneeL: [20 + b * 2, 0, 0], footL: [-6, 0, 0],
        thighR: [8, -6, -11], kneeR: [16 + b * 2, 0, 0], footR: [-8, 0, 0],
      };
    },
    v_jabW: {
      root: { y: -0.04 }, spine: [10, -4, 0], chest: [10, -10, 0], head: [-14, 8, 0],
      shoulderR: [-30, 0, -16], elbowR: [-128, 0, 0], shoulderL: [-40, 0, 12], elbowL: [-110, 0, 0],
      thighL: [-18, 8, 11], kneeL: [26, 0, 0], thighR: [10, -6, -11], kneeR: [20, 0, 0],
    },
    v_jab: {
      root: { y: -0.05, rx: 10 }, spine: [10, 8, 0], chest: [8, 20, 0], head: [-16, -14, 0],
      shoulderR: [-86, 0, 4], elbowR: [-6, 0, 0], shoulderL: [-34, 0, 12], elbowL: [-120, 0, 0],
      thighL: [-26, 8, 11], kneeL: [30, 0, 0], thighR: [14, -6, -11], kneeR: [16, 0, 0],
    },
    v_hookW: {
      root: { y: -0.05 }, spine: [8, 10, 0], chest: [8, 22, 0], head: [-12, -18, 0],
      shoulderL: [-40, 0, 50], elbowL: [-100, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-110, 0, 0],
      thighL: [-18, 8, 11], kneeL: [26, 0, 0], thighR: [10, -6, -11], kneeR: [20, 0, 0],
    },
    v_hook: {
      root: { y: -0.07, rx: 8 }, spine: [8, -12, 0], chest: [10, -32, 0], head: [-14, 26, 0],
      shoulderL: [-86, 0, -22], elbowL: [-78, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-118, 0, 0],
      thighL: [-28, 8, 11], kneeL: [34, 0, 0], thighR: [16, -6, -11], kneeR: [16, 0, 0],
    },
    v_kneeW: {
      root: { y: -0.02 }, chest: [4, 0, 0],
      shoulderL: [-70, 0, 6], elbowL: [-40, 0, 0], shoulderR: [-70, 0, -6], elbowR: [-40, 0, 0],
      thighL: [-40, 0, 8], kneeL: [80, 0, 0], thighR: [4, 0, -8], kneeR: [20, 0, 0],
    },
    v_knee: {
      root: { y: 0.03, rx: -2 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-10, 0, 0],
      shoulderL: [-62, 0, -18], elbowL: [-92, 0, 0], shoulderR: [-62, 0, 18], elbowR: [-92, 0, 0],
      thighL: [-104, 0, 4], kneeL: [122, 0, 0], footL: [30, 0, 0], thighR: [6, 0, -6], kneeR: [14, 0, 0],
    },
    v_elbowW: {
      root: { y: 0.02, rx: -6 }, chest: [-6, -18, 0], head: [-4, 14, 0],
      shoulderR: [-150, 0, 20], elbowR: [-130, 0, 0], shoulderL: [-40, 0, 14], elbowL: [-100, 0, 0],
      thighL: [-20, 8, 11], kneeL: [26, 0, 0], thighR: [10, -6, -11], kneeR: [22, 0, 0],
    },
    v_elbow: {
      root: { y: -0.1, rx: 14 }, spine: [16, 10, 0], chest: [18, 24, 0], head: [-18, -16, 0],
      shoulderR: [-96, 0, 36], elbowR: [-150, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-90, 0, 0],
      thighL: [-36, 8, 11], kneeL: [44, 0, 0], thighR: [18, -6, -11], kneeR: [20, 0, 0],
    },
    v_gutW: {
      root: { y: -0.08 }, spine: [6, -16, 0], chest: [6, -28, 0], head: [-10, 24, 0],
      shoulderR: [-10, 0, -20], elbowR: [-120, 0, 0], shoulderL: [-60, 0, 10], elbowL: [-90, 0, 0],
      thighL: [-30, 8, 12], kneeL: [44, 0, 0], thighR: [16, -6, -12], kneeR: [30, 0, 0],
    },
    v_gut: {
      root: { y: -0.2, rx: 16 }, spine: [20, 12, 0], chest: [22, 22, 0], head: [-24, -14, 0],
      shoulderR: [-80, 0, 8], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-100, 0, 0],
      thighL: [-54, 8, 12], kneeL: [76, 0, 0], thighR: [26, -6, -12], kneeR: [28, 0, 0],
    },
    v_riseKneeW: { ...C.uppercutWind, root: { y: -0.18 } },
    v_riseKnee: {
      root: { y: 0.12, rx: -16 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-20, 0, 0],
      shoulderL: [10, 0, 34], elbowL: [-50, 0, 0], shoulderR: [10, 0, -34], elbowR: [-50, 0, 0],
      thighR: [-122, 0, -4], kneeR: [128, 0, 0], footR: [30, 0, 0], thighL: [16, 0, 6], kneeL: [18, 0, 0], footL: [40, 0, 0],
    },
    v_dash: {
      root: { rx: 76 }, spine: [-6, 0, 0], neck: [-26, 0, 0], head: [-38, 0, 0],
      shoulderR: [-176, 0, -4], elbowR: [-2, 0, 0], shoulderL: [36, 0, 10], elbowL: [-10, 0, 0],
      thighL: [8, 0, 3], kneeL: [10, 0, 0], footL: [60, 0, 0], thighR: [4, 0, -3], kneeR: [18, 0, 0], footR: [60, 0, 0],
    },
    v_galickCharge: (t) => {
      const s = Math.sin(t * 36) * 1.2;
      return {
        root: { y: -0.1 },
        hips: [0, -30, 0], spine: [2, -20, 0], chest: [4, -40 + s, 0], head: [0, 70, 0],
        shoulderR: [-88, 0, -52], elbowR: [-8, 0, 0], handR: [-40, 0, 0],
        shoulderL: [-86, 0, -74], elbowL: [-14, 0, 0], handL: [-40, 0, 0],
        thighL: [-30, 30, 14], kneeL: [40, 0, 0], thighR: [18, 30, -14], kneeR: [32, 0, 0],
      };
    },
    v_bigBangW: {
      root: { y: -0.06 }, spine: [0, -18, 0], chest: [0, -34, 0], head: [0, 30, 0],
      shoulderR: [-20, 0, -40], elbowR: [-100, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-26, 10, 12], kneeL: [34, 0, 0], thighR: [16, -10, -12], kneeR: [28, 0, 0],
    },
    v_bigBang: {
      root: { y: -0.08, rx: 6 }, spine: [4, 12, 0], chest: [4, 26, 0], head: [-4, -24, 0],
      shoulderR: [-90, 0, 4], elbowR: [-2, 0, 0], handR: [-70, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-40, 0, 0],
      thighL: [-34, 10, 12], kneeL: [40, 0, 0], thighR: [22, -10, -12], kneeR: [22, 0, 0],
    },
    v_finalFlashCharge: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        root: { y: -0.04 }, spine: [-4, 0, 0], chest: [-10 + s, 0, 0], head: [-10, 0, 0],
        shoulderL: [-8, 0, 86], elbowL: [-8, 0, 0], handL: [0, 0, 60], shoulderR: [-8, 0, -86], elbowR: [-8, 0, 0], handR: [0, 0, -60],
        thighL: [-24, 0, 14], kneeL: [34, 0, 0], thighR: [16, 0, -14], kneeR: [28, 0, 0],
      };
    },
    // V0.2 identity: stiff, proud flight with clenched fists at the sides
    flyIdle: (t) => ({
      root: { y: Math.sin(t * 2) * 0.03 }, spine: [4, 0, 0], chest: [6, 0, 0], head: [-12, 0, 0],
      shoulderL: [-6, 0, 16], elbowL: [-28, 0, 0], handL: [0, 0, 8], shoulderR: [-6, 0, -16], elbowR: [-28, 0, 0], handR: [0, 0, -8],
      thighL: [-6, 0, 5], kneeL: [24, 0, 0], footL: [34, 0, 0], thighR: [-2, 0, -5], kneeR: [34, 0, 0], footR: [40, 0, 0],
    }),
    v_scouterTap: {
      root: { y: 0 }, chest: [-2, 8, 0], head: [-8, 14, 6],
      shoulderL: [-128, 0, 46], elbowL: [-128, 0, 0], handL: [0, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-30, 0, 0],
      thighL: [-4, 0, 10], kneeL: [4, 0, 0], thighR: [4, 0, -10], kneeR: [4, 0, 0],
      hands: ['point', 'fist'],
    },
    v_chinUp: { ...C.armsCrossed, head: [-18, -10, 0], chest: [-6, 6, 0] },
    v_turnAway: { ...C.armsCrossed, chest: [-4, 34, 0], hips: [0, 14, 0], head: [-14, -52, 0] },
    v_defeatPound: {
      root: { y: -0.5, rx: 18 }, spine: [22, 0, 0], chest: [18, 0, 0], head: [-6, 0, 0],
      shoulderL: [-40, 0, 16], elbowL: [-40, 0, 0], shoulderR: [-70, 0, -10], elbowR: [-20, 0, 0],
      thighL: [-90, 0, 8], kneeL: [100, 0, 0], thighR: [-10, 0, -8], kneeR: [120, 0, 0], footR: [40, 0, 0],
    },
    v_intro: C.armsCrossed,
    v_victory: C.armsCrossed,
    v_victoryPoint: {
      chest: [-6, 10, 0], head: [-10, -10, 0],
      shoulderR: [-92, 0, 6], elbowR: [-4, 0, 0], shoulderL: [-4, 0, 30], elbowL: [-110, 0, 0], handL: [0, 0, 30],
      thighL: [-6, 0, 10], kneeL: [4, 0, 0], thighR: [4, 0, -10], kneeR: [4, 0, 0],
    },
  };

  SL.data.characters.vegeta = {
    id: 'vegeta',
    name: 'Vegeta',
    fullName: 'Vegeta, Prince of the Saiyans',
    era: 'Saiyan Saga',
    playable: true,
    style: 'Rushdown',
    blurb: 'Prideful elite who overwhelms opponents up close.',
    ratings: { power: 4, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 14000, ki: 100, stamina: 100, speed: 1.05, power: 1.05, defense: 0.95, weight: 0.95, kiRegen: 2, chargeRate: 32, canonPower: 1.15 },
    appearance: {
      height: 0.9,
      skin: 0xf3c7a0,
      build: { chestW: 0.2, shoulderX: 0.2, waistW: 0.125, upperArmR: 0.056 },
      hair: { style: 'vegeta', color: 0x121217 },
      face: { pupil: 0x0d0d0d, eyeW: 0.95, browThick: 1.25 },
      outfit: {
        topStyle: 'armor', top: 0x223a8c, arms: 0xf3c7a0, pants: 0x223a8c, pantsStyle: 'tight',
        gloves: 0xf7f6f0, boots: 0xf7f6f0, bootTip: 0xd2a84a, bootStyle: 'saiyan',
        armor: { plate: 0xf5f2e6, belly: 0xf5f2e6, pads: 0xd2a84a, padStyle: 'up', hipGuards: 0xd2a84a, trim: 0xd2a84a },
        scouter: { lens: 0x3cff78, body: 0xe2e2e2 },
        tail: 0x6b3b1e,
      },
      portraitColor: '#2a47a8',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xe8e0ff, core: 0xffffff, particles: 0xd8d0ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 50, style: 'full',
        mult: { damage: 1.32, speed: 1.12, defense: 1.15, kiRegen: 2, chargeRate: 1.3 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42 },
        look: { hair: { style: 'vegeta_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.05 },
        line: 'vegeta_ssj',
        music: 3,
      },
    ],
    poses,
    moves: {
      light: [
        { id: 'jab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 260, reach: 1.1, radius: 0.7, lunge: 10, hitstun: 19, knock: 'flinch', impact: 1, pose: { wind: 'v_jabW', strike: 'v_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'hook', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 300, reach: 1.1, radius: 0.75, lunge: 10, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'v_hookW', strike: 'v_hook' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'knee', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 330, reach: 0.95, radius: 0.8, lunge: 11, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'v_kneeW', strike: 'v_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'elbowSmash', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 400, reach: 1.1, radius: 0.8, lunge: 11, hitstun: 26, knock: 'push', knockSpeed: 6, impact: 2, pose: { wind: 'v_elbowW', strike: 'v_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gutPunch', startup: 12, active: 4, recovery: 22, damage: 820, reach: 1.25, radius: 0.85, lunge: 13, hitstun: 44, knock: 'crumple', impact: 2, guardCrush: true, guardDamage: 42, pose: { wind: 'v_gutW', strike: 'v_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'risingKnee', startup: 9, active: 4, recovery: 20, damage: 640, reach: 1.0, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'v_riseKneeW', strike: 'v_riseKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        4: { id: 'axeHandle', startup: 12, active: 4, recovery: 24, damage: 920, reach: 1.15, radius: 0.9, lunge: 11, hitstun: 36, knock: 'smash', knockSpeed: 34, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'dashPunch', startup: 5, active: 9, recovery: 17, damage: 720, reach: 1.25, radius: 0.9, lunge: 32, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'v_dash', strike: 'v_dash' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      throw: { id: 'kneeThrow', name: 'Royal Hammer', damage: 1050, knockSpeed: 30, poses: ['grab', 'v_knee', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'galickGun', name: 'Galick Gun', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 20, chargeMax: 84, damage: [1900, 3200], radius: [0.55, 1.1], speed: 100, range: 140, sustain: 34,
        color: 0xb44dff, core: 0xf3dcff, poses: { charge: 'v_galickCharge', fire: 'beamFire' }, recovery: 22,
      },
      special2: {
        id: 'bigBang', name: 'Big Bang Attack', type: 'projectile', kiCost: 35, icon: 'ball',
        startup: 14, recovery: 22, pose: { wind: 'v_bigBangW', release: 'v_bigBang' },
        projectile: { kind: 'ball', speed: 58, radius: 1.1, damage: 2100, homing: 1.1, color: 0x7fc6ff, core: 0xffffff, explode: 7, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      ultimate: {
        id: 'finalFlash', name: 'Final Flash', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 70, chargeMax: 70, damage: [5000, 5000], radius: [1.9, 1.9], speed: 120, range: 180, sustain: 55,
        color: 0xffe14a, core: 0xffffff, poses: { charge: 'v_finalFlashCharge', fire: 'beamFire' }, recovery: 36, armor: false, cinematic: true,
      },
    },
    mechanic: { type: 'pride', name: 'Pride', desc: 'Close-range pressure and counters build Pride, boosting damage. Retreating too long loses it.' },
    ai: { personality: 'aggressive', aggression: 0.82, defense: 0.45, ranged: 0.3, beam: 0.5, transformHp: 0.55, preferredRange: 2 },
    barks: { combo: 'vegeta_combo', hurt: 'vegeta_hurt', lowHp: 'vegeta_lowHp', reactTransform: 'vegeta_reactTransform' },
    sequences: {
      intro: [
        { pose: 'v_scouterTap', dur: 0.75, speed: 9, expression: 'calm' },
        { pose: 'v_intro', dur: 0.6, speed: 8, expression: 'angry' },
        { pose: 'v_chinUp', dur: 1.2, speed: 6, expression: 'smirk' },
      ],
      victory: [
        [{ pose: 'v_victoryPoint', dur: 1.1, speed: 9, expression: 'smirk' }, { pose: 'v_turnAway', dur: 9, speed: 4, expression: 'smirk' }],
        [{ pose: 'v_chinUp', dur: 9, speed: 5, expression: 'smirk' }],
      ],
      defeat: [
        { pose: 'defeatKneel', dur: 0.7, speed: 8, expression: 'hurt' },
        { pose: 'v_defeatPound', dur: 9, speed: 7, expression: 'grit' },
      ],
    },
    intro: { pose: 'v_intro', expression: 'smirk' },
    victory: { poses: ['v_victory', 'v_victoryPoint'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'angry' },
  };
})();
