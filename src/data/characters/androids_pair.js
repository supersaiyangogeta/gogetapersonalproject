/*
 * ANDROIDS 17 AND 18 (Android Saga, Age 767) — the pair Dr. Gero should not
 * have opened.
 *
 * Their identity is not absorption (that was 19 and 20) and it is not raw
 * power: it is that **they never run out**. An infinite energy reactor means no
 * pacing, no fatigue and no reason to respect a long fight — `Mechanics.tireless`
 * keeps their stamina full and their ki topped up, so the usual plan of
 * outlasting an opponent simply does not work on them.
 *
 * Android 16 exists here as a story body: he is in the third capsule, and Gero
 * never opens it.
 *
 * All three are Level 1 functional prototypes and story only.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const pairPoses = {
    a17_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.02 + b * 0.01 },
        hips: [0, -6, 0], spine: [2, 0, 0], chest: [2, 8, 0], head: [-4, -6, 0],
        shoulderL: [-14, 0, 16], elbowL: [-34, 0, 0], shoulderR: [-14, 0, -16], elbowR: [-34, 0, 0],
        thighL: [-10, 4, 10], kneeL: [14 + b, 0, 0], thighR: [8, -4, -10], kneeR: [12 + b, 0, 0],
        hands: ['open', 'open'],
      };
    },
    a17_jabW: {
      root: { y: -0.04 }, chest: [0, 22, 0], head: [-2, -14, 0],
      shoulderR: [-40, 0, -22], elbowR: [-100, 0, 0], shoulderL: [-24, 0, 20], elbowL: [-70, 0, 0],
      thighL: [-16, 0, 12], kneeL: [24, 0, 0], thighR: [10, 0, -12], kneeR: [18, 0, 0],
    },
    a17_jab: {
      root: { y: -0.06, rx: 6 }, chest: [4, -22, 0], head: [-6, 16, 0],
      shoulderR: [-96, 0, -4], elbowR: [-2, 0, 0], shoulderL: [-20, 0, 28], elbowL: [-56, 0, 0],
      thighL: [-28, 0, 12], kneeL: [34, 0, 0], thighR: [18, 0, -12], kneeR: [16, 0, 0],
    },
    a17_kickW: { ...C.kickWindR, root: { y: -0.07 } },
    a17_kick: {
      root: { y: 0.02, rz: -8 }, chest: [-4, 34, 0], head: [-4, -26, 0],
      shoulderL: [-16, 0, 50], elbowL: [-30, 0, 0], shoulderR: [-16, 0, -50], elbowR: [-30, 0, 0],
      thighR: [-84, 0, -24], kneeR: [12, 0, 0], footR: [28, 0, 0], thighL: [12, 0, 8], kneeL: [18, 0, 0],
    },
    a17_barrierW: (t) => {
      const s = Math.sin(t * 24);
      return {
        root: { y: -0.04 }, spine: [-4, 0, 0], chest: [-6 + s * 0.3, 0, 0], head: [-8, 0, 0],
        shoulderL: [-92, 0, 22], elbowL: [-40, 0, 0], shoulderR: [-92, 0, -22], elbowR: [-40, 0, 0],
        thighL: [-16, 0, 14], kneeL: [24, 0, 0], thighR: [10, 0, -14], kneeR: [18, 0, 0],
        hands: ['open', 'open'],
      };
    },
    a17_barrier: {
      root: { y: -0.06, rx: 8 }, spine: [4, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0],
      shoulderL: [-100, 0, 12], elbowL: [-8, 0, 0], handL: [-36, 0, 0],
      shoulderR: [-100, 0, -12], elbowR: [-8, 0, 0], handR: [-36, 0, 0],
      thighL: [-26, 0, 14], kneeL: [34, 0, 0], thighR: [18, 0, -14], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    a17_bored: {
      root: { y: -0.01 }, chest: [-4, 14, 0], head: [-10, -12, 0],
      shoulderL: [-12, 0, 18], elbowL: [-60, 0, 0], shoulderR: [-12, 0, -18], elbowR: [-60, 0, 0],
      thighL: [-6, 0, 12], kneeL: [10, 0, 0], thighR: [4, 0, -12], kneeR: [8, 0, 0],
      hands: ['fist', 'fist'],
    },
  };

  /* 18 IS NOT 17 (ToP refinement brief §26: quick counters, efficient punches and kicks, good recovery after a blocked
     blow, awareness of the edge — "she should not simply share Android 17's animations"): her own guard, a left-handed
     straight, a spinning back elbow, a high roundhouse with the other leg, an axe heel, a one-handed shot. */
  const P18 = {
    // unimpressed: the weight on one hip, the hands loose and low — she does not bother with a guard until she needs one
    a18_idle: (t) => {
      const b = Math.sin(t * 1.9);
      return { root: { y: -0.015 + b * 0.006, rz: 3 }, hips: [0, -8, 6], spine: [2, 4, -3], chest: [0, 10, 0], head: [-4, -10, 4], shoulderL: [-20, 0, 18], elbowL: [-50, 0, 0], shoulderR: [-30, 0, -14], elbowR: [-70, 0, 0], thighL: [-8, 4, 6], kneeL: [10, 0, 0], thighR: [6, -4, -10], kneeR: [6, 0, 0], hands: ['open', 'open'] };
    },
    a18_jabW: { root: { y: -0.03 }, chest: [0, -18, 0], head: [-2, 12, 0], shoulderL: [-44, 0, 20], elbowL: [-104, 0, 0], shoulderR: [-30, 0, -16], elbowR: [-80, 0, 0], thighL: [-14, 0, 10], kneeL: [20, 0, 0], thighR: [10, 0, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    a18_jab: { root: { y: -0.05, rx: 4 }, chest: [2, 20, 0], head: [-4, -14, 0], shoulderL: [-94, 0, 4], elbowL: [-2, 0, 0], shoulderR: [-30, 0, -22], elbowR: [-80, 0, 0], thighL: [-24, 0, 10], kneeL: [28, 0, 0], thighR: [16, 0, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    // the spinning back elbow: she turns away... and the elbow comes round
    a18_elbowW: { root: { y: -0.04 }, hips: [0, 30, 0], chest: [0, 36, 0], head: [0, -36, 0], shoulderR: [-60, 0, 40], elbowR: [-140, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-70, 0, 0], thighL: [-12, 0, 10], kneeL: [18, 0, 0], thighR: [8, 0, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    a18_elbow: { root: { y: -0.05, rx: 6 }, hips: [0, -24, 0], chest: [4, -40, 0], head: [-4, 30, 0], shoulderR: [-90, 0, -60], elbowR: [-140, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0], thighL: [-20, 0, 10], kneeL: [26, 0, 0], thighR: [14, 0, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    // the high roundhouse with the LEFT leg (17 side-kicks with the right)
    a18_kickW: { root: { y: -0.04 }, chest: [-4, 20, 0], head: [-4, -14, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-70, 0, 0], thighL: [-30, 0, 30], kneeL: [80, 0, 0], thighR: [6, 0, -8], kneeR: [18, 0, 0], hands: ['fist', 'fist'] },
    a18_kick: { root: { y: 0.02, rz: 10 }, chest: [-6, -30, 0], head: [-4, 24, 0], shoulderL: [-20, 0, 50], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-40, 0, 0], thighL: [-96, 0, 30], kneeL: [10, 0, 0], footL: [26, 0, 0], thighR: [10, 0, -8], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
    // the axe heel: the leg straight up... and down
    a18_heelW: { root: { y: 0, rx: -8 }, chest: [-10, 0, 0], head: [-6, 0, 0], shoulderL: [-30, 0, 46], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -46], elbowR: [-30, 0, 0], thighR: [-140, 0, -4], kneeR: [10, 0, 0], thighL: [4, 0, 6], kneeL: [12, 0, 0], hands: ['fist', 'fist'] },
    a18_heel: { root: { y: -0.08, rx: 14 }, chest: [16, 0, 0], head: [-14, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-50, 0, 0], shoulderR: [-50, 0, -30], elbowR: [-50, 0, 0], thighR: [-40, 0, -4], kneeR: [20, 0, 0], thighL: [14, 0, 6], kneeL: [26, 0, 0], hands: ['fist', 'fist'] },
    // one hand: the shot, the other hand still loose at her side
    a18_shotW: { root: { y: -0.02 }, chest: [0, -10, 0], head: [-4, 8, 0], shoulderR: [-60, 0, -20], elbowR: [-90, 0, 0], shoulderL: [-20, 0, 18], elbowL: [-50, 0, 0], thighL: [-10, 0, 8], kneeL: [14, 0, 0], thighR: [6, 0, -8], kneeR: [8, 0, 0], hands: ['open', 'open'] },
    a18_shot: { root: { y: -0.03 }, chest: [2, 16, 0], head: [-4, -12, 0], shoulderR: [-92, 0, 0], elbowR: [0, 0, 0], shoulderL: [-20, 0, 18], elbowL: [-50, 0, 0], thighL: [-14, 0, 8], kneeL: [18, 0, 0], thighR: [10, 0, -8], kneeR: [10, 0, 0], hands: ['open', 'open'] },
  };

  const common = {
    assetLevel: 1,
    era: 'Android Saga',
    playable: false,
    prototype: true,
    style: 'Infinite Energy',
    poses: Object.assign({ idle: pairPoses.a17_idle }, pairPoses),
  };

  SL.data.characters.android_17 = Object.assign({}, common, {
    id: 'android_17',
    playable: true, // the Android Saga's 17: Free Battle after "The Pair on the Road" (unlocks.js)
    name: 'Android 17',
    blurb: 'Bored, unhurried, and genuinely never tired.',
    ratings: { power: 4, speed: 5, ki: 5, defense: 4 },
    stats: { hp: 30000, ki: 140, stamina: 200, speed: 1.28, power: 1.35, defense: 1.3, weight: 1, kiRegen: 6, chargeRate: 40, canonPower: 14 },
    poise: { max: 90, regen: 16, regenDelay: 90, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 25 }, beamMul: 1, breakFrames: 140, vulnerable: 1.15 },
    vfx: { ghost: 0xbfe4ff },
    appearance: {
      height: 0.94,
      skin: 0xf2d4b4,
      // the visual pass (2026-10-14): the Android Saga's own clothes and hair — he wore Yamcha's short cut and a white
      // gi. Now: straight black hair to the shoulders, the orange scarf, a black T-shirt over white long sleeves, jeans
      // with a belt, green trainers; the head a little smaller (it read as a child's next to Goku)
      build: { chestW: 0.225, chestD: 0.16, shoulderX: 0.225, waistW: 0.18, upperArmR: 0.062, foreArmR: 0.054, fist: 0.058, thighR: 0.094, shinR: 0.074, headR: 0.13, neckLen: 0.06 },
      hair: { style: 'a17', color: 0x16161c },
      face: { pupil: 0x2a5a8a, sclera: 0xffffff, eyeW: 0.95, brow: 0x1a1a22 },
      outfit: {
        topStyle: 'shirt', top: 0x1e1e26, sleeves: 'short', sleeveColor: 0x1e1e26, arms: 0xeeeeea,
        belt: 0x6a4428, beltStyle: 'belt', buckle: 0xd8c890, pants: 0x3a5a9a, pantsStyle: 'slacks', boots: 0x3f6f48, bootStyle: 'shoe',
      },
      props: [{ id: 'scarf', shape: 'neckRing', joint: 'neck', pos: [0, 0.018, 0.008], radius: 0.082, thick: 0.46, color: 0xe86a2a }],
      portraitColor: '#5a8ad0',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x8ad4ff, core: 0xffffff, particles: 0xbfe4ff, speed: 1.2 }, mult: {} }],
    moves: {
      light: [
        { id: 'a17Jab', startup: 3, active: 2, recovery: 9, cancel: 5, damage: 720, reach: 1.3, radius: 0.78, lunge: 14, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'a17_jabW', strike: 'a17_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'a17Cross', startup: 3, active: 2, recovery: 10, cancel: 5, damage: 760, reach: 1.3, radius: 0.78, lunge: 14, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'a17_jabW', strike: 'a17_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'a17Kick', startup: 5, active: 3, recovery: 13, cancel: 7, damage: 1050, reach: 1.55, radius: 0.9, lunge: 15, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'a17_kickW', strike: 'a17_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'a17Smash', startup: 11, active: 4, recovery: 21, damage: 2200, reach: 1.6, radius: 1, lunge: 20, hitstun: 34, knock: 'smash', knockSpeed: 32, impact: 3, pose: { wind: 'a17_kickW', strike: 'a17_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'a17Rise', startup: 9, active: 4, recovery: 20, damage: 1500, reach: 1.45, radius: 0.95, lunge: 12, hitstun: 32, knock: 'launch', knockSpeed: 19, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'a17Blink', startup: 4, active: 7, recovery: 14, damage: 1300, reach: 1.5, radius: 0.95, lunge: 46, hitstun: 26, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'a17_jabW', strike: 'a17_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'a17Toss', name: 'Casual Toss', damage: 1400, knockSpeed: 26, poses: ['grab', 'a17_jabW', 'a17_kick'] },
    },
    specials: {
      special1: {
        id: 'a17Blast', name: 'Power Blitz', type: 'projectile', kiCost: 22, icon: 'ball', cooldown: 130,
        startup: 12, recovery: 16, pose: { wind: 'a17_barrierW', release: 'a17_barrier' },
        projectile: { kind: 'ball', speed: 78, radius: 0.9, damage: 2000, homing: 0.7, color: 0x8ad4ff, core: 0xffffff, explode: 5, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      special2: {
        id: 'a17Barrier', name: 'Energy Field', type: 'bomberWave', kiCost: 36, icon: 'guard', cooldown: 320,
        charge: 24, radius: 7.5, damage: 1800, knockSpeed: 26, recovery: 30,
        color: 0x8ad4ff, poses: { charge: 'a17_barrierW', release: 'a17_barrier' },
      },
      ultimate: {
        id: 'a17Storm', name: 'Endless Volley', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 22, rise: 10, height: 7, count: 12, damage: 1200, speed: 56, range: 26, recovery: 36,
        color: 0x8ad4ff, poses: { wind: 'a17_barrierW', fire: 'a17_barrier' },
      },
    },
    boss: {
      phases: [
        { id: 'bored', label: 'BORED', hpAbove: 0.5, speed: 1, damage: 1, patience: 1, patterns: { melee: 0.9, blast: 0.4 } },
        { id: 'interested', label: 'INTERESTED', hpAbove: 0, speed: 1.1, damage: 1.12, patience: 0.5, patterns: { melee: 1, blast: 0.7, field: 0.5, storm: 0.3 } },
      ],
      patterns: {
        blast: { slot: 'special1', minDist: 5, cooldown: 190 },
        field: { slot: 'special2', maxDist: 7, cooldown: 360 },
        storm: { slot: 'ultimate', minDist: 7, cooldown: 900 },
      },
      techniques: {},
    },
    mechanic: { type: 'tireless', name: 'Infinite Energy', desc: 'He does not tire and he does not run dry: stamina stays full and ki refills. Outlasting him is not a plan.' },
    ai: { personality: 'adaptive', aggression: 0.7, defense: 0.5, ranged: 0.35, beam: 0.25, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'a17_bored', expression: 'smirk' },
    victory: { poses: ['a17_bored'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  });

  SL.data.characters.android_18 = Object.assign({}, common, {
    id: 'android_18',
    playable: true, // Free Battle after "The Pair on the Road" (unlocks.js)
    name: 'Android 18',
    blurb: 'Unimpressed by everything, including the people trying to kill her.',
    ratings: { power: 4, speed: 5, ki: 5, defense: 4 },
    stats: { hp: 29000, ki: 140, stamina: 200, speed: 1.3, power: 1.32, defense: 1.3, weight: 0.95, kiRegen: 6, chargeRate: 40, canonPower: 14 },
    poise: { max: 88, regen: 16, regenDelay: 90, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 25 }, beamMul: 1, breakFrames: 140, vulnerable: 1.15 },
    vfx: { ghost: 0xffd8e8 },
    appearance: {
      height: 0.92,
      skin: 0xf4dcc0,
      // the visual pass (2026-10-14): her own build (she had 17's shoulders and arms) and the Android Saga's clothes —
      // the open denim waistcoat and denim skirt over a dark long-sleeved top, black leggings, brown boots, a belt
      // (2026-10-16, the owner's brief and reference: a fuller lower body — a narrower waist over wider hips, a fuller seat,
      // shaped thighs with the hamstrings raised, firmer calves. Future 18 inherits it)
      build: {
        chestW: 0.19, chestD: 0.14, shoulderX: 0.19, waistW: 0.122, waistD: 0.096, upperArmR: 0.047, foreArmR: 0.042, fist: 0.048,
        pelvisW: 0.168, pelvisH: 0.118, pelvisD: 0.134, hipX: 0.098, thighR: 0.096, shinR: 0.065, headR: 0.13, neckLen: 0.05, bust: 0.75,
        thighShape: { top: 1.14, mid: 1.04, knee: 1.08, quad: 0.08, ham: 0.16 }, seat: 1,
      },
      hair: { style: 'trunks', color: 0xf0d878 },
      face: { pupil: 0x2a5a8a, sclera: 0xffffff, eyeW: 1.04, brow: 0xe0c868, lashWing: true },
      outfit: {
        topStyle: 'shirt', top: 0x24242c, sleeves: 'long', sleeveColor: 0x24242c, arms: 0x24242c,
        // the black shirt is striped white across (2026-10-15 visual pass; it was plain black): Future 18 inherits it
        stripes: { color: 0x24242c, with: 0xe8e8ee, every: 0.055 },
        jacket: { color: 0x4a6aa8, open: 0.32, collar: 0x3f5f98 },
        hem: { color: 0x4a6aa8, len: 0.17, flare: 1.18 },
        belt: 0x6a4428, beltStyle: 'belt', buckle: 0xd8c890, pants: 0x1c1c22, pantsStyle: 'tight', boots: 0x6a4630, bootStyle: 'gi',
      },
      portraitColor: '#d0b060',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffb0d0, core: 0xffffff, particles: 0xffd8e8, speed: 1.2 }, mult: {} }],
    poses: Object.assign({}, common.poses, P18, { idle: P18.a18_idle }),
    // efficient and quick to recover: a blocked blow costs her less time than it costs 17 (shorter recoveries)
    moves: {
      light: [
        { id: 'a18Jab', startup: 3, active: 2, recovery: 8, cancel: 5, damage: 700, reach: 1.28, radius: 0.76, lunge: 14, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'a18_jabW', strike: 'a18_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'a18Elbow', startup: 4, active: 2, recovery: 9, cancel: 5, damage: 760, reach: 1.2, radius: 0.8, lunge: 13, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'a18_elbowW', strike: 'a18_elbow' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'a18Kick', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 1080, reach: 1.6, radius: 0.9, lunge: 16, hitstun: 22, knock: 'push', knockSpeed: 15, impact: 2, pose: { wind: 'a18_kickW', strike: 'a18_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'a18Snap', startup: 10, active: 4, recovery: 18, damage: 2100, reach: 1.65, radius: 1, lunge: 22, hitstun: 34, knock: 'smash', knockSpeed: 34, impact: 3, pose: { wind: 'a18_kickW', strike: 'a18_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'a18Axe', startup: 12, active: 4, recovery: 20, damage: 2300, reach: 1.5, radius: 1.05, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 30, impact: 4, pose: { wind: 'a18_heelW', strike: 'a18_heel' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'a18Blink', startup: 4, active: 7, recovery: 13, damage: 1280, reach: 1.5, radius: 0.95, lunge: 48, hitstun: 26, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'a18_jabW', strike: 'a18_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'a18Throw', name: 'Dismissive Throw', damage: 1500, knockSpeed: 28, poses: ['grab', 'a18_jabW', 'a18_kick'] },
    },
    specials: {
      special1: {
        id: 'a18Blast', name: 'Energy Shot', type: 'projectile', kiCost: 20, icon: 'ball', cooldown: 120,
        startup: 10, recovery: 14, pose: { wind: 'a18_shotW', release: 'a18_shot' },
        projectile: { kind: 'ball', speed: 82, radius: 0.8, damage: 1900, homing: 0.7, color: 0xffb0d0, core: 0xffffff, explode: 5, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      special2: {
        id: 'a18Rush', name: 'Deadly Dance', type: 'rush', kiCost: 34, icon: 'rush',
        startup: 8, dashFrames: 20, speed: 50, recovery: 24,
        poses: { wind: 'a18_jabW' },
        hits: [
          { pose: 'a18_jab', damage: 700, frames: 8, sfx: 'punchLight' },
          { pose: 'a18_elbow', damage: 800, frames: 9, sfx: 'punchLight' },
          { pose: 'a18_kick', damage: 1700, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
      ultimate: {
        id: 'a18Wave', name: 'Infinity Bullet', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 20, rise: 9, height: 7, count: 14, damage: 1100, speed: 60, range: 26, recovery: 34,
        color: 0xffb0d0, poses: { wind: 'a17_barrierW', fire: 'a17_barrier' },
      },
    },
    boss: {
      phases: [
        { id: 'unimpressed', label: 'UNIMPRESSED', hpAbove: 0.5, speed: 1, damage: 1, patience: 1, patterns: { melee: 0.9, shot: 0.4 } },
        { id: 'annoyed', label: 'ANNOYED', hpAbove: 0, speed: 1.12, damage: 1.14, patience: 0.5, patterns: { melee: 1, dance: 0.6, shot: 0.6, bullet: 0.3 } },
      ],
      patterns: {
        shot: { slot: 'special1', minDist: 5, cooldown: 180 },
        dance: { slot: 'special2', minDist: 3, maxDist: 20, cooldown: 340 },
        bullet: { slot: 'ultimate', minDist: 7, cooldown: 900 },
      },
      techniques: {},
    },
    mechanic: { type: 'tireless', name: 'Infinite Energy', desc: 'The same reactor as her brother: she never tires, and waiting her out is not a plan.' },
    // quick counters, the edge always in mind (AIHooks.android_18)
    ai: { personality: 'adaptive', aggression: 0.68, defense: 0.66, ranged: 0.35, beam: 0.25, transformHp: 0, preferredRange: 2.8, hooks: 'android_18', rhythm: { burst: 3, rest: 30 } },
    intro: { pose: 'a17_bored', expression: 'smirk' },
    victory: { poses: ['a17_bored'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  });

  /** Android 16: in this chapter he is a body in a capsule that nobody opens. */
  SL.data.characters.android_16 = Object.assign({}, common, {
    id: 'android_16',
    playable: true, // Free Battle after "Gohan's Turn" (unlocks.js); in the Android Saga he is a body in a capsule
    name: 'Android 16',
    blurb: 'The one Gero would not switch on.',
    ratings: { power: 5, speed: 2, ki: 3, defense: 5 },
    stats: { hp: 34000, ki: 100, stamina: 200, speed: 0.9, power: 1.5, defense: 1.5, weight: 1.8, kiRegen: 4, chargeRate: 24, canonPower: 15 },
    poise: { max: 120, regen: 10, regenDelay: 140, armor: 3, cost: { 1: 5, 2: 8, 3: 13, 4: 22 }, beamMul: 1, breakFrames: 180, vulnerable: 1.1 },
    vfx: { ghost: 0xc8ffd8 },
    appearance: {
      height: 1.1,
      skin: 0xf0d0b0,
      // the visual pass (2026-10-14): his own red crest, a smaller head on the big body, and a harder face — blue eyes
      // under heavy brows, a square jaw (it was a round, friendly face)
      build: { chestW: 0.3, chestD: 0.21, shoulderX: 0.3, waistW: 0.24, upperArmR: 0.092, foreArmR: 0.08, fist: 0.082, thighR: 0.13, shinR: 0.1, headR: 0.14, neckLen: 0.05 },
      hair: { style: 'a16', color: 0xd8502a },
      face: { pupil: 0x2a5a8a, sclera: 0xffffff, eyeW: 0.84, eyeH: 0.8, brow: 0xd8502a, browThick: 1.5, jaw: 1.18, jawW: 1.12, cheeks: 0.6 },
      outfit: {
        topStyle: 'armor', top: 0x2a6a4a, arms: 0x2a6a4a, pants: 0x2a2a33, pantsStyle: 'tight', legs: 0x2a6a4a,
        boots: 0x2a2a33, bootStyle: 'gi',
        armor: { plate: 0x3a8a5a, belly: 0xe8e4dc, pads: 0xe86a2a, padStyle: 'down' },
      },
      portraitColor: '#3a8a5a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x8affb0, core: 0xffffff, particles: 0xc8ffd8, speed: 0.9 }, mult: {} }],
    moves: {
      light: [
        { id: 'a16Jab', startup: 6, active: 3, recovery: 14, cancel: 8, damage: 900, reach: 1.5, radius: 0.95, lunge: 10, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'a16Hook', startup: 7, active: 3, recovery: 15, cancel: 9, damage: 980, reach: 1.5, radius: 0.95, lunge: 10, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'a16Kick', startup: 9, active: 4, recovery: 18, cancel: 11, damage: 1300, reach: 1.7, radius: 1.05, lunge: 10, hitstun: 26, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'a16Hammer', startup: 15, active: 5, recovery: 27, damage: 3000, reach: 1.7, radius: 1.2, lunge: 12, hitstun: 38, knock: 'smash', knockSpeed: 34, impact: 4, guardCrush: true, guardDamage: 54, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'a16Charge', startup: 9, active: 8, recovery: 24, damage: 2000, reach: 1.7, radius: 1.1, lunge: 26, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'a16Grip', name: 'Bear Grip', damage: 1800, knockSpeed: 24, poses: ['grab', 'punchWindR', 'punchR'] },
    },
    specials: {
      special1: {
        id: 'a16Blast', name: 'Rocket Punch', type: 'projectile', kiCost: 24, icon: 'ball', cooldown: 200,
        startup: 16, recovery: 24, pose: { wind: 'punchWindR', release: 'punchR' },
        projectile: { kind: 'ball', speed: 64, radius: 1, damage: 2600, homing: 0.5, color: 0x8affb0, core: 0xffffff, explode: 6, knock: 'smash', knockSpeed: 32, impact: 4, life: 3 },
      },
      special2: {
        id: 'a16Field', name: 'Hell Flash Charge', type: 'bomberWave', kiCost: 40, icon: 'guard', cooldown: 360,
        charge: 30, radius: 8, damage: 2400, knockSpeed: 30, recovery: 36,
        color: 0x8affb0, poses: { charge: 'a17_barrierW', release: 'a17_barrier' },
      },
      ultimate: {
        id: 'a16Flash', name: 'Hell Flash', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 44, chargeMax: 44, damage: [5000, 5000], radius: [1.8, 1.8], speed: 95, range: 160, sustain: 44,
        color: 0x8affb0, core: 0xffffff, poses: { charge: 'a17_barrierW', fire: 'a17_barrier' }, recovery: 40,
      },
    },
    mechanic: { type: 'tireless', name: 'Infinite Energy', desc: 'Built on the same reactor, and never switched on in this chapter.' },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.7, ranged: 0.4, beam: 0.4, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'stand', expression: 'calm' }, // no guard: he does not need one
    victory: { poses: ['lookAround'], expression: 'calm' }, // already looking past the fight
    defeat: { pose: 'knockdown', expression: 'ko' },
  });
})();
