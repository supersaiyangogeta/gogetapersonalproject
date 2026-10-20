/*
 * KID GOHAN (Saiyan Saga) — Goku's four-year-old son, trained by Piccolo.
 * Identity: tiny, quick and desperate. Headbutts and small fast strikes,
 * Masenko, and a hidden power that erupts when he is pushed too far.
 * Playable in Chapter 2 (his training) and afterwards as a PROTOTYPE fighter.
 * Mechanic HIDDEN POTENTIAL: damage taken and fallen allies fill a meter; when
 * it bursts he is briefly unleashed (huge damage, super armor, Hidden Power
 * Blast becomes available), then drained for a few seconds.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // STORY (playtest round 2): on his knees beside Piccolo, hands on him
    kg_kneelBy: (t) => {
      const s = Math.sin(t * 9) * (0.6 + 0.4 * Math.sin(t * 0.7));
      return {
        root: { y: -0.36 + s * 0.006, rx: 24 }, spine: [22, 0, 0], chest: [16, 0, 0], neck: [8, 0, 0], head: [16 + s * 2, 0, 0],
        shoulderL: [-74, 0, 12], elbowL: [-26, 0, 0], shoulderR: [-74, 0, -12], elbowR: [-26, 0, 0],
        thighL: [-14, 0, 8], kneeL: [104, 0, 0], footL: [40, 0, 0], thighR: [-14, 0, -8], kneeR: [104, 0, 0], footR: [40, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // nervous, small, guard held too high — a child who has been taught to fight
    idle: (t) => {
      const b = Math.sin(t * 3.1);
      return {
        root: { y: -0.05 + b * 0.01 },
        hips: [0, -8, 0], spine: [8, 0, 0], chest: [8, 6, 0], head: [-6, 0, 0],
        shoulderL: [-58, 0, 12], elbowL: [-112, 0, 0], shoulderR: [-50, 0, -14], elbowR: [-118, 0, 0],
        thighL: [-24, 8, 12], kneeL: [36 + b * 3, 0, 0], footL: [-8, 0, 0],
        thighR: [12, -6, -12], kneeR: [30 + b * 3, 0, 0], footR: [-10, 0, 0],
      };
    },
    run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 14 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.03 + Math.abs(c) * 0.06, rx: 16 },
        spine: [8, s * 6, 0], chest: [6, s * 8, 0], head: [-20, -s * 6, 0],
        shoulderL: [s * 60 - 10, 0, 18], elbowL: [-70, 0, 0], shoulderR: [-s * 60 - 10, 0, -18], elbowR: [-70, 0, 0],
        thighL: [-s * 55 - 12, 0, 4], kneeL: [40 + Math.max(0, s) * 70, 0, 0], footL: [10, 0, 0],
        thighR: [s * 55 - 12, 0, -4], kneeR: [40 + Math.max(0, -s) * 70, 0, 0], footR: [10, 0, 0],
      };
    },
    flyIdle: (t) => ({
      root: { y: Math.sin(t * 2.6) * 0.03 }, chest: [4, 0, 0], head: [-4, 0, 0],
      shoulderL: [-40, 0, 20], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-90, 0, 0],
      thighL: [-50, 0, 8], kneeL: [90, 0, 0], footL: [30, 0, 0], thighR: [-30, 0, -8], kneeR: [80, 0, 0], footR: [30, 0, 0],
    }),
    kg_jabW: {
      root: { y: -0.06 }, chest: [6, -14, 0], head: [-8, 10, 0],
      shoulderR: [-30, 0, -14], elbowR: [-130, 0, 0], shoulderL: [-60, 0, 14], elbowL: [-110, 0, 0],
      thighL: [-26, 8, 12], kneeL: [40, 0, 0], thighR: [12, -6, -12], kneeR: [30, 0, 0],
    },
    kg_jab: {
      root: { y: -0.07, rx: 8 }, chest: [8, 18, 0], head: [-12, -12, 0],
      shoulderR: [-88, 0, 2], elbowR: [-8, 0, 0], shoulderL: [-50, 0, 16], elbowL: [-120, 0, 0],
      thighL: [-34, 8, 12], kneeL: [44, 0, 0], thighR: [16, -6, -12], kneeR: [24, 0, 0],
    },
    kg_flurry: (t) => {
      const s = Math.sin(t * 60);
      return {
        root: { y: -0.08, rx: 10 }, chest: [10, s * 20, 0], head: [-14, -s * 10, 0],
        shoulderR: [-80 - s * 14, 0, 4], elbowR: [-20 - Math.max(0, s) * 60, 0, 0],
        shoulderL: [-80 + s * 14, 0, -4], elbowL: [-20 - Math.max(0, -s) * 60, 0, 0],
        thighL: [-34, 8, 12], kneeL: [44, 0, 0], thighR: [16, -6, -12], kneeR: [26, 0, 0],
      };
    },
    kg_spinKickW: { ...C.kickWindR, root: { y: -0.1 }, chest: [4, -40, 0] },
    kg_spinKick: {
      root: { y: 0.04, rz: -10 }, chest: [-6, 50, 0], head: [-6, -40, 0],
      shoulderL: [-20, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -60], elbowR: [-40, 0, 0],
      thighR: [-86, 0, -30], kneeR: [10, 0, 0], footR: [30, 0, 0], thighL: [10, 0, 8], kneeL: [20, 0, 0],
    },
    kg_headbuttW: {
      root: { y: -0.16 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-26, 0, 0],
      shoulderL: [20, 0, 30], elbowL: [-40, 0, 0], shoulderR: [20, 0, -30], elbowR: [-40, 0, 0],
      thighL: [-60, 0, 12], kneeL: [100, 0, 0], thighR: [-30, 0, -12], kneeR: [90, 0, 0],
    },
    kg_headbutt: {
      root: { rx: 72, y: 0.1 }, spine: [4, 0, 0], neck: [10, 0, 0], head: [30, 0, 0],
      shoulderL: [40, 0, 24], elbowL: [-10, 0, 0], shoulderR: [40, 0, -24], elbowR: [-10, 0, 0],
      thighL: [10, 0, 4], kneeL: [20, 0, 0], footL: [50, 0, 0], thighR: [4, 0, -4], kneeR: [30, 0, 0], footR: [50, 0, 0],
    },
    kg_riseW: { ...C.uppercutWind },
    kg_rise: {
      root: { y: 0.16, rx: -24 }, spine: [-10, 0, 0], chest: [-16, 0, 0], neck: [-20, 0, 0], head: [-30, 0, 0],
      shoulderL: [30, 0, 24], elbowL: [-20, 0, 0], shoulderR: [30, 0, -24], elbowR: [-20, 0, 0],
      thighL: [-30, 0, 6], kneeL: [40, 0, 0], thighR: [20, 0, -6], kneeR: [20, 0, 0], footR: [40, 0, 0],
    },
    kg_masenkoCharge: (t) => {
      const s = Math.sin(t * 34) * 1.4;
      return {
        root: { y: -0.08 }, spine: [-6, 0, 0], chest: [-12 + s, 0, 0], head: [-12, 0, 0],
        shoulderL: [-168, 0, 12], elbowL: [-40, 0, 0], shoulderR: [-168, 0, -12], elbowR: [-40, 0, 0],
        thighL: [-30, 0, 16], kneeL: [44, 0, 0], thighR: [14, 0, -16], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    kg_masenkoFire: {
      root: { y: -0.1, rx: 8 }, spine: [6, 0, 0], chest: [10, 0, 0], head: [-14, 0, 0],
      shoulderL: [-100, 0, 8], elbowL: [-14, 0, 0], handL: [-50, 0, 0], shoulderR: [-100, 0, -8], elbowR: [-14, 0, 0], handR: [-50, 0, 0],
      thighL: [-36, 0, 16], kneeL: [48, 0, 0], thighR: [20, 0, -16], kneeR: [26, 0, 0],
      hands: ['open', 'open'],
    },
    kg_rageBlastW: (t) => {
      const s = Math.sin(t * 50) * 2;
      return {
        root: { y: -0.12 }, spine: [-14, 0, 0], chest: [-20 + s, 0, 0], neck: [-20, 0, 0], head: [-30, 0, 0],
        shoulderL: [-10, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -70], elbowR: [-30, 0, 0],
        thighL: [-30, 0, 20], kneeL: [44, 0, 0], thighR: [14, 0, -20], kneeR: [30, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    kg_rageBlast: {
      root: { y: -0.1, rx: 12 }, chest: [14, 0, 0], head: [-10, 0, 0],
      shoulderL: [-95, 0, 12], elbowL: [-6, 0, 0], shoulderR: [-95, 0, -12], elbowR: [-6, 0, 0],
      thighL: [-40, 0, 16], kneeL: [50, 0, 0], thighR: [24, 0, -16], kneeR: [24, 0, 0],
      hands: ['open', 'open'],
    },
    // story and presentation poses
    kg_cry: {
      root: { y: -0.3 }, spine: [24, 0, 0], chest: [20, 0, 0], head: [16, 0, 0],
      shoulderL: [-110, 0, -16], elbowL: [-140, 0, 0], shoulderR: [-110, 0, 16], elbowR: [-140, 0, 0],
      thighL: [-80, 0, 16], kneeL: [120, 0, 0], thighR: [-80, 0, -16], kneeR: [120, 0, 0],
      hands: ['fist', 'fist'],
    },
    kg_scared: {
      root: { y: -0.08, rx: -6 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [6, 0, 0],
      shoulderL: [-90, 0, -20], elbowL: [-120, 0, 0], shoulderR: [-90, 0, 20], elbowR: [-120, 0, 0],
      thighL: [-10, 0, 14], kneeL: [26, 0, 0], thighR: [16, 0, -14], kneeR: [30, 0, 0],
      hands: ['open', 'open'],
    },
    kg_lookHands: {
      root: { y: -0.04 }, chest: [16, 0, 0], head: [30, 0, 0],
      shoulderL: [-70, 0, -10], elbowL: [-60, 0, 0], shoulderR: [-70, 0, 10], elbowR: [-60, 0, 0],
      thighL: [-8, 0, 12], kneeL: [12, 0, 0], thighR: [8, 0, -12], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    kg_eat: {
      root: { y: -0.36 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [10, 0, 0],
      shoulderL: [-90, 0, -8], elbowL: [-130, 0, 0], shoulderR: [-80, 0, 8], elbowR: [-130, 0, 0],
      thighL: [-90, 30, 20], kneeL: [120, 0, 0], thighR: [-90, -30, -20], kneeR: [120, 0, 0],
      hands: ['fist', 'fist'],
    },
    // looking up at the moon, arms slack (The Saiyan Prince)
    kg_lookUp: {
      root: { y: -0.02, rx: -4 }, spine: [-10, 0, 0], chest: [-12, 0, 0], neck: [-14, 0, 0], head: [-34, 0, 0],
      shoulderL: [-6, 0, 14], elbowL: [-14, 0, 0], shoulderR: [-6, 0, -14], elbowR: [-14, 0, 0],
      thighL: [-4, 0, 10], kneeL: [8, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    // out cold on the ground after shrinking back from a Great Ape
    kg_sleep: {
      root: { y: -0.78, rx: -84 }, spine: [-4, 0, 0], head: [-6, 20, 0],
      shoulderL: [10, 0, 40], elbowL: [-20, 0, 0], shoulderR: [10, 0, -40], elbowR: [-20, 0, 0],
      thighL: [-6, 0, 12], kneeL: [14, 0, 0], thighR: [4, 0, -12], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    kg_meditate: {
      root: { y: -0.52 }, spine: [-2, 0, 0], head: [-4, 0, 0],
      shoulderL: [-20, 0, 18], elbowL: [-50, 0, 0], shoulderR: [-20, 0, -18], elbowR: [-50, 0, 0],
      thighL: [-90, 40, 30], kneeL: [140, 0, 0], thighR: [-90, -40, -30], kneeR: [140, 0, 0],
      hands: ['open', 'open'],
    },
    kg_ready: {
      root: { y: -0.1 }, spine: [10, 0, 0], chest: [12, 0, 0], head: [-10, 0, 0],
      shoulderL: [-70, 0, 20], elbowL: [-100, 0, 0], shoulderR: [-30, 0, -24], elbowR: [-110, 0, 0],
      thighL: [-36, 12, 18], kneeL: [56, 0, 0], thighR: [20, -10, -18], kneeR: [40, 0, 0],
    },
    kg_victory: {
      root: { y: 0.12 }, chest: [-8, 0, 0], head: [-14, 0, 0],
      shoulderL: [-170, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-10, 0, 0],
      thighL: [-40, 0, 10], kneeL: [70, 0, 0], thighR: [-10, 0, -10], kneeR: [30, 0, 0],
      hands: ['fist', 'fist'],
    },
    kg_relieved: {
      root: { y: -0.02 }, chest: [-4, 0, 0], head: [-8, 10, 0],
      shoulderL: [-20, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-120, 0, 0],
      thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [4, 0, -10], kneeR: [6, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.kid_gohan = {
    id: 'kid_gohan',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Kid Gohan',
    fullName: 'Gohan (age 5)',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    style: 'Hidden Power',
    blurb: "Goku's son. Small, quick and frightened — until something pushes him too far.",
    ratings: { power: 2, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 9500, ki: 100, stamina: 110, speed: 1.1, power: 0.85, defense: 0.82, weight: 0.5, kiRegen: 2.4, chargeRate: 30, canonPower: 0.5 },
    appearance: {
      height: 0.56,
      skin: 0xf6cda6,
      build: { chestW: 0.19, shoulderX: 0.19, waistW: 0.13, upperArmR: 0.05, foreArmR: 0.046, fist: 0.06, thighR: 0.08, shinR: 0.064, headR: 0.17, neckLen: 0.05, upperArmLen: 0.24, foreArmLen: 0.22, thighLen: 0.37, shinLen: 0.34 },
      hair: { style: 'gohan_kid', color: 0x141418 },
      face: { pupil: 0x101010, eyeW: 1.2 },
      outfit: {
        topStyle: 'gi', top: 0x9a3a8e, sleeves: 'long', sleeveColor: 0x9a3a8e, wrist: 0xe6c24a,
        belt: 0xe6c24a, pants: 0x9a3a8e, pantsStyle: 'gi', boots: 0x3a2a24, bootStyle: 'gi',
        // (2026-10-16: no hat with Piccolo's gi — the hat with the Dragon Ball goes with the Raditz-arc tunic, the
        // wardrobe outfit `kg_raditz` in src/data/wardrobe.js, which the Raditz mission dresses him in)
        tail: 0x6a3a1a,
        tailStyle: 'free', // his hangs loose and curls, the way a child wears it
      },
      portraitColor: '#9a3a8e',
    },
    vfx: { ghost: 0xffe0ff },
    audio: { strikePitch: 1.35, heavyPitch: 1.2 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xf4f0ff, core: 0xffffff, particles: 0xe8e0ff }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'kidJab', startup: 4, active: 3, recovery: 9, cancel: 6, damage: 210, reach: 0.95, radius: 0.6, lunge: 11, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'kg_jabW', strike: 'kg_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'kidFlurry', startup: 4, active: 12, recovery: 10, cancel: 14, damage: 95, reach: 0.95, radius: 0.65, lunge: 10, hitstun: 16, knock: 'flinch', impact: 1, multi: [0, 4, 8], finish: { knock: 'flinch', knockSpeed: 4, impact: 1, damage: 160 }, pose: { wind: 'kg_jabW', strike: 'kg_flurry' }, sfx: 'punchLight', hitPose: 'hitBody' },
        { id: 'kidSpinKick', startup: 6, active: 4, recovery: 14, cancel: 9, damage: 320, reach: 1.15, radius: 0.8, lunge: 11, hitstun: 24, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'kg_spinKickW', strike: 'kg_spinKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'headbutt', startup: 10, active: 6, recovery: 20, damage: 720, reach: 1.0, radius: 0.85, lunge: 22, hitstun: 32, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'kg_headbuttW', strike: 'kg_headbutt' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'risingHeadbutt', startup: 8, active: 5, recovery: 20, damage: 560, reach: 0.9, radius: 0.85, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 17, impact: 2, stretch: true, pose: { wind: 'kg_riseW', strike: 'kg_rise' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        3: { id: 'cannonball', startup: 11, active: 6, recovery: 24, damage: 820, reach: 1.0, radius: 0.95, lunge: 18, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 3, pose: { wind: 'kg_headbuttW', strike: 'kg_headbutt' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'flyingHeadbutt', startup: 5, active: 10, recovery: 18, damage: 680, reach: 1.0, radius: 0.9, lunge: 34, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'kg_headbutt', strike: 'kg_headbutt' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'kidToss', name: 'Desperate Toss', damage: 800, knockSpeed: 22, poses: ['grab', 'kg_headbuttW', 'kg_headbutt'] },
    },
    specials: {
      special1: {
        id: 'masenko', name: 'Masenko', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 20, chargeMax: 80, tiers: [20, 50], damage: [1400, 2700], radius: [0.5, 1.0], speed: 95, range: 140, sustain: 30,
        color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'kg_masenkoCharge', fire: 'kg_masenkoFire' }, recovery: 22,
        callout: ['MASEN', 'KO!'], chargeLight: 0xffe25a,
      },
      special2: {
        id: 'hiddenPowerBlast', name: 'Hidden Power Blast', type: 'projectile', kiCost: 20, icon: 'ball', requiresMech: 'unleashed',
        startup: 12, recovery: 18, pose: { wind: 'kg_rageBlastW', release: 'kg_rageBlast' },
        projectile: { kind: 'ball', speed: 70, radius: 1.3, damage: 2600, homing: 1.4, color: 0xf0d8ff, core: 0xffffff, explode: 6, knock: 'heavy', knockSpeed: 30, impact: 3, life: 3 },
      },
      ultimate: {
        id: 'fullPowerMasenko', name: 'Full Power Masenko', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 70, chargeMax: 70, damage: [4300, 4300], radius: [1.4, 1.4], speed: 110, range: 170, sustain: 45,
        color: 0xffe25a, core: 0xffffff, poses: { charge: 'kg_masenkoCharge', fire: 'kg_masenkoFire' }, recovery: 34, cinematic: true,
      },
    },
    mechanic: { type: 'hiddenPotential', name: 'Hidden Potential', desc: 'Taking hits and seeing allies fall fills his potential. When it bursts he is briefly unleashed, then drained.' },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.7, ranged: 0.5, beam: 0.45, transformHp: 0, preferredRange: 5, hooks: 'kid_gohan' },
    barks: { combo: 'kid_gohan_combo', hurt: 'kid_gohan_hurt', lowHp: 'kid_gohan_lowHp', reactTransform: 'kid_gohan_reactTransform' },
    sequences: {
      intro: [
        { pose: 'kg_scared', dur: 0.8, speed: 8, expression: 'hurt' },
        { pose: 'kg_ready', dur: 1.4, speed: 7, expression: 'angry' },
      ],
      victory: [[{ pose: 'kg_victory', dur: 0.8, speed: 10, expression: 'grin' }, { pose: 'kg_relieved', dur: 9, speed: 5, expression: 'calm' }]],
      defeat: [{ pose: 'kg_cry', dur: 9, speed: 6, expression: 'hurt' }],
    },
    intro: { pose: 'kg_ready', expression: 'angry' },
    victory: { poses: ['kg_victory'], expression: 'grin' },
    defeat: { pose: 'kg_cry', expression: 'hurt' },
  };

  // Age 764, home from Namek (the Future Trunks chapter): Piccolo's purple gi and red sash, no hat,
  // no tail. Story-only; the same body, poses and moves.
  const KG = SL.data.characters.kid_gohan;
  SL.data.characters.kid_gohan_764 = Object.assign({}, KG, {
    id: 'kid_gohan_764',
    name: 'Gohan',
    fullName: 'Gohan (age 9)',
    era: 'Android Saga',
    playable: false,
    appearance: Object.assign({}, KG.appearance, {
      height: 0.6,
      outfit: {
        topStyle: 'gi', top: 0x5b3a8e, sleeves: 'none', wrist: 0xb3202a,
        belt: 0xb3202a, pants: 0x5b3a8e, pantsStyle: 'gi', boots: 0x6a3a1a, bootStyle: 'gi',
      },
      portraitColor: '#5b3a8e',
    }),
  });
})();
