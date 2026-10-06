/*
 * BARDOCK — brutal third-class Saiyan soldier.
 * Identity: short, heavy, hard-hitting strings; shoulder charges; efficient
 * ki use. Mechanic BATTLE-HARDENED: the more desperate the fight, the harder
 * he hits and the less he flinches. No transformations (canon).
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    idle: (t) => {
      const b = Math.sin(t * 3.2);
      return {
        root: { y: -0.1 + b * 0.01 },
        hips: [0, -14, 0], spine: [14, -4, 0], chest: [10, -8, 0], head: [-18, 8, 0],
        shoulderL: [-34, 0, 30], elbowL: [-96, 0, 0], shoulderR: [-22, 0, -34], elbowR: [-92, 0, 0],
        thighL: [-26, 16, 16], kneeL: [40 + b * 2, 0, 0], footL: [-10, 0, 0],
        thighR: [18, -12, -16], kneeR: [34 + b * 2, 0, 0], footR: [-14, 0, 0],
      };
    },
    b_hookW: {
      root: { y: -0.1, rx: -4 }, hips: [0, -24, 0], spine: [10, -16, 0], chest: [8, -34, 0], head: [-14, 32, 0],
      shoulderR: [4, 0, -62], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-100, 0, 0],
      thighL: [-26, 16, 16], kneeL: [44, 0, 0], thighR: [18, -12, -16], kneeR: [38, 0, 0],
    },
    b_hook: {
      root: { y: -0.12, rx: 12 }, hips: [0, 16, 0], spine: [12, 16, 0], chest: [12, 40, 0], head: [-18, -30, 0],
      shoulderR: [-84, 0, -12], elbowR: [-62, 0, 0], shoulderL: [-20, 0, 34], elbowL: [-100, 0, 0],
      thighL: [-40, 12, 16], kneeL: [54, 0, 0], thighR: [26, -8, -16], kneeR: [24, 0, 0],
    },
    b_bodyW: {
      root: { y: -0.12 }, spine: [10, 16, 0], chest: [10, 24, 0], head: [-16, -20, 0],
      shoulderL: [0, 0, 40], elbowL: [-110, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-100, 0, 0],
      thighL: [-30, 16, 16], kneeL: [48, 0, 0], thighR: [20, -12, -16], kneeR: [40, 0, 0],
    },
    b_body: {
      root: { y: -0.22, rx: 14 }, spine: [20, -18, 0], chest: [20, -32, 0], head: [-26, 30, 0],
      shoulderL: [-70, 0, -12], elbowL: [-22, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-110, 0, 0],
      thighL: [-54, 16, 16], kneeL: [78, 0, 0], thighR: [28, -12, -16], kneeR: [36, 0, 0],
    },
    b_headbuttW: {
      root: { y: -0.05, rx: -10 }, spine: [-14, 0, 0], chest: [-20, 0, 0], head: [-30, 0, 0],
      shoulderL: [-76, 0, -14], elbowL: [-62, 0, 0], shoulderR: [-76, 0, 14], elbowR: [-62, 0, 0],
      thighL: [-20, 10, 14], kneeL: [34, 0, 0], thighR: [14, -10, -14], kneeR: [30, 0, 0],
    },
    b_headbutt: {
      root: { y: -0.1, rx: 16 }, spine: [24, 0, 0], chest: [26, 0, 0], neck: [10, 0, 0], head: [26, 0, 0],
      shoulderL: [-84, 0, -20], elbowL: [-70, 0, 0], shoulderR: [-84, 0, 20], elbowR: [-70, 0, 0],
      thighL: [-40, 10, 14], kneeL: [50, 0, 0], thighR: [22, -10, -14], kneeR: [26, 0, 0],
    },
    b_shoulderW: {
      root: { y: -0.16, rx: 6 }, spine: [20, -30, 0], chest: [16, -44, 0], head: [-20, 40, 0],
      shoulderL: [-10, 0, 14], elbowL: [-110, 0, 0], shoulderR: [0, 0, -40], elbowR: [-90, 0, 0],
      thighL: [-36, 16, 16], kneeL: [60, 0, 0], thighR: [24, -12, -16], kneeR: [50, 0, 0],
    },
    b_shoulder: {
      root: { y: -0.12, rx: 30 }, spine: [22, -40, 0], chest: [20, -48, 0], head: [-30, 44, 0],
      shoulderL: [-14, 0, 8], elbowL: [-112, 0, 0], shoulderR: [20, 0, -30], elbowR: [-80, 0, 0],
      thighL: [-56, 16, 14], kneeL: [60, 0, 0], thighR: [40, -12, -14], kneeR: [20, 0, 0],
    },
    b_kneeLift: {
      root: { y: 0.06, rx: 2 }, spine: [12, 0, 0], chest: [16, 0, 0], head: [-10, 0, 0],
      shoulderL: [-92, 0, -10], elbowL: [-84, 0, 0], shoulderR: [-92, 0, 10], elbowR: [-84, 0, 0],
      thighR: [-116, 0, -6], kneeR: [136, 0, 0], footR: [30, 0, 0], thighL: [8, 0, 6], kneeL: [16, 0, 0],
    },
    b_cannonCharge: (t) => {
      const s = Math.sin(t * 38) * 1.5;
      return {
        root: { y: -0.14 }, hips: [0, -28, 0], spine: [6, -20, 0], chest: [8, -40 + s, 0], head: [-6, 56, 0],
        shoulderR: [16, 0, -38], elbowR: [-118, 0, 0], handR: [-30, 0, 0],
        shoulderL: [-80, 0, 16], elbowL: [-20, 0, 0], handL: [-50, 0, 0],
        thighL: [-36, 28, 16], kneeL: [48, 0, 0], thighR: [20, 28, -16], kneeR: [38, 0, 0],
      };
    },
    b_cannonFire: (t) => {
      const s = Math.sin(t * 50) * 2;
      return {
        root: { y: -0.14, rx: 12 }, hips: [0, 10, 0], spine: [12, 14, 0], chest: [14, 34, 0], head: [-18, -28, 0],
        shoulderR: [-92 + s, 0, 2], elbowR: [-2, 0, 0], handR: [-76, 0, 0],
        shoulderL: [0, 0, 36], elbowL: [-60, 0, 0],
        thighL: [-48, 12, 16], kneeL: [62, 0, 0], thighR: [30, -8, -16], kneeR: [22, 0, 0],
      };
    },
    b_intro: {
      root: { y: -0.02 }, chest: [2, 0, 0], head: [-6, 0, 0],
      shoulderL: [-64, 0, -26], elbowL: [-116, 0, 0], shoulderR: [-60, 0, 30], elbowR: [-100, 0, 0], handR: [-40, 0, 0],
      thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [4, 0, -12], kneeR: [6, 0, 0],
    },
    b_victory: {
      root: { y: 0 }, chest: [-2, 20, 0], head: [-8, 36, 0],
      shoulderL: [-4, 0, 12], elbowL: [-24, 0, 0], shoulderR: [-100, 0, -14], elbowR: [-70, 0, 0],
      thighL: [-6, 0, 10], kneeL: [6, 0, 0], thighR: [4, 0, -10], kneeR: [4, 0, 0],
    },
    b_rage: C.powerUp,
    // V0.2 identity: soldier's crouched, ready flight and a headband tug before battle
    flyIdle: (t) => ({
      root: { y: Math.sin(t * 2.2) * 0.03, rx: 8 }, spine: [8, 0, 0], chest: [8, -6, 0], head: [-16, 6, 0],
      shoulderL: [-40, 0, 24], elbowL: [-86, 0, 0], shoulderR: [-30, 0, -26], elbowR: [-96, 0, 0],
      thighL: [-30, 0, 8], kneeL: [56, 0, 0], footL: [30, 0, 0], thighR: [-6, 0, -8], kneeR: [70, 0, 0], footR: [40, 0, 0],
    }),
    b_headband: {
      root: { y: 0 }, chest: [-4, 0, 0], head: [-10, 0, 0],
      shoulderL: [-150, 0, 50], elbowL: [-120, 0, 0], shoulderR: [-150, 0, -50], elbowR: [-120, 0, 0],
      thighL: [-4, 0, 12], kneeL: [4, 0, 0], thighR: [4, 0, -12], kneeR: [4, 0, 0],
      hands: ['open', 'open'],
    },
    b_fistCrack: {
      root: { y: -0.04 }, chest: [6, 0, 0], head: [-10, 0, 0],
      shoulderL: [-70, 0, -14], elbowL: [-100, 0, 0], shoulderR: [-68, 0, 16], elbowR: [-96, 0, 0],
      thighL: [-14, 0, 14], kneeL: [16, 0, 0], thighR: [8, 0, -14], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
  };

  SL.data.characters.bardock = {
    id: 'bardock',
    name: 'Bardock',
    fullName: 'Bardock',
    era: 'Planet Vegeta',
    playable: true,
    style: 'Brawler',
    blurb: 'Battle-scarred soldier. The worse it gets, the harder he hits.',
    ratings: { power: 4, speed: 3, ki: 3, defense: 4 },
    stats: { hp: 14700, ki: 100, stamina: 110, speed: 0.95, power: 1.1, defense: 1.05, weight: 1.15, kiRegen: 2.6, chargeRate: 36, canonPower: 0.7 },
    appearance: {
      height: 0.97,
      skin: 0xdca57c,
      build: { chestW: 0.215, shoulderX: 0.215, waistW: 0.135, upperArmR: 0.061, foreArmR: 0.054, thighR: 0.088 },
      hair: { style: 'bardock', color: 0x141418 },
      face: { pupil: 0x0d0d0d, scar: true, browThick: 1.3 },
      outfit: {
        topStyle: 'armor', top: 0x1d2027, arms: 0xdca57c, pants: 0x1d2027, pantsStyle: 'tight',
        wrist: 0xa01c1c, legBands: 0xa01c1c,
        boots: 0xeeebe0, bootTip: 0x3f6b35, bootStyle: 'saiyan',
        armor: { plate: 0x22262b, belly: 0x3f6b35, pads: 0x3f6b35, padStyle: 'wide', hipGuards: 0x3f6b35, trim: 0x3f6b35 },
        scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
        headband: 0xc01818,
        tail: 0x5a321a,
      },
      portraitColor: '#3f6b35',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'hook', startup: 6, active: 3, recovery: 13, cancel: 9, damage: 380, reach: 1.15, radius: 0.75, lunge: 9, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'b_hookW', strike: 'b_hook' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'bodyBlow', startup: 6, active: 3, recovery: 13, cancel: 9, damage: 400, reach: 1.1, radius: 0.8, lunge: 9, hitstun: 24, knock: 'flinch', impact: 1, pose: { wind: 'b_bodyW', strike: 'b_body' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'headbutt', startup: 7, active: 3, recovery: 16, cancel: 10, damage: 460, reach: 0.95, radius: 0.8, lunge: 11, hitstun: 30, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'b_headbuttW', strike: 'b_headbutt' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'shoulderCharge', startup: 12, active: 6, recovery: 22, damage: 820, reach: 1.2, radius: 0.95, lunge: 20, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 2, guardCrush: true, guardDamage: 45, armor: true, pose: { wind: 'b_shoulderW', strike: 'b_shoulder' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'kneeLift', startup: 9, active: 4, recovery: 20, damage: 700, reach: 1.0, radius: 0.85, lunge: 10, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'b_headbuttW', strike: 'b_kneeLift' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        3: { id: 'hammerSmash', startup: 12, active: 4, recovery: 24, damage: 1000, reach: 1.15, radius: 0.95, lunge: 10, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'ramming', startup: 6, active: 10, recovery: 18, damage: 760, reach: 1.2, radius: 1.0, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 2, armor: true, pose: { wind: 'b_shoulder', strike: 'b_shoulder' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'skullCrusher', name: 'Skull Crusher', damage: 1150, knockSpeed: 24, poses: ['grab', 'b_headbuttW', 'b_headbutt'] },
    },
    specials: {
      special1: {
        id: 'riotJavelin', name: 'Riot Javelin', type: 'projectile', kiCost: 25, icon: 'javelin',
        startup: 12, recovery: 18, pose: { wind: 'throwWind', release: 'throwRelease' },
        projectile: { kind: 'javelin', speed: 88, radius: 0.55, damage: 1700, homing: 0.8, color: 0x8fe0ff, core: 0xffffff, explode: 5, knock: 'heavy', knockSpeed: 22, impact: 3, guardPierce: 0.5, life: 2.2 },
      },
      special2: {
        id: 'saiyanAssault', name: 'Saiyan Assault', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 8, dashFrames: 26, speed: 48, armor: true, recovery: 20,
        hits: [
          { pose: 'b_hook', damage: 420, frames: 12, sfx: 'punchHeavy' },
          { pose: 'b_kneeLift', damage: 460, frames: 12, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 900, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 3 },
        ],
        poses: { wind: 'b_shoulderW', dash: 'b_shoulder' },
      },
      ultimate: {
        id: 'finalSpiritCannon', name: 'Final Spirit Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [4900, 4900], radius: [1.7, 1.7], speed: 90, range: 170, sustain: 50,
        color: 0x5fd0ff, core: 0xffffff, poses: { charge: 'b_cannonCharge', fire: 'b_cannonFire' }, recovery: 34, cinematic: true, oneHand: true,
      },
    },
    mechanic: { type: 'battleHardened', name: 'Battle-Hardened', desc: 'Damage and stagger resistance rise as health falls. Below 30% he enters a rage.' },
    ai: { personality: 'berserker', aggression: 0.78, defense: 0.4, ranged: 0.35, beam: 0.4, transformHp: 0, preferredRange: 2 },
    barks: { combo: 'bardock_combo', hurt: 'bardock_hurt', lowHp: 'bardock_lowHp', reactTransform: 'bardock_reactTransform' },
    sequences: {
      intro: [
        { pose: 'b_headband', dur: 0.8, speed: 8, expression: 'calm' },
        { pose: 'b_fistCrack', dur: 0.7, speed: 10, expression: 'angry' },
        { pose: 'b_intro', dur: 1.2, speed: 7, expression: 'smirk' },
      ],
      victory: [[{ pose: 'b_headband', dur: 0.8, speed: 7, expression: 'calm' }, { pose: 'b_victory', dur: 9, speed: 5, expression: 'calm' }]],
      defeat: [{ pose: 'defeatKneel', dur: 9, speed: 6, expression: 'grit' }],
    },
    intro: { pose: 'b_intro', expression: 'angry' },
    victory: { poses: ['b_victory'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
