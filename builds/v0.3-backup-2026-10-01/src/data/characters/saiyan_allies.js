/*
 * Saiyan Saga allies built as LEVEL 1 FUNCTIONAL PROTOTYPES (procedural bodies,
 * gameplay first; to be replaced by production models through the .glb pipeline).
 *
 *   CHIAOTZU — PLAYABLE PROTOTYPE. A small psychic. Telekinesis freezes an
 *     opponent while he concentrates (allies get free hits; alone, the release
 *     leaves an opening), Dodon Ray, and a Self-Destruct latch. Mechanic
 *     PSYCHIC LINK: faster ki, and allies close by recover ki too.
 *   YAJIROBE — PLAYABLE PROTOTYPE. A reluctant samurai: katana reach, a Sneak
 *     Step behind the enemy, and Senzu Beans (two per battle) that heal him —
 *     or an ally in trouble. Mechanic SENZU BEAN: limited healing, and strikes
 *     from behind cut deeper.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  /* --------------------------------------------------------------- CHIAOTZU */
  const chiaotzuPoses = {
    idle: (t) => {
      const b = Math.sin(t * 3.6);
      return {
        root: { y: -0.03 + b * 0.01 }, hips: [0, -8, 0], spine: [4, 2, 0], chest: [4, 6, 0], head: [-2, 2, b * 2],
        shoulderL: [-48, 0, 18], elbowL: [-96, 0, 0], shoulderR: [-36, 0, -16], elbowR: [-104, 0, 0],
        thighL: [-18, 10, 10], kneeL: [26, 0, 0], footL: [-6, 0, 0], thighR: [10, -8, -10], kneeR: [22, 0, 0], footR: [-10, 0, 0],
      };
    },
    // two fingers raised to the brow, eyes on the target: the psychic tell
    c_focus: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        root: { y: -0.02 }, spine: [2, 0, 0], chest: [-4, 0, 0], head: [-6 + s * 0.3, 0, 0],
        shoulderR: [-150, 0, -30], elbowR: [-120, 0, 0], shoulderL: [-70, 0, 26], elbowL: [-60, 0, 0],
        thighL: [-10, 0, 8], kneeL: [16, 0, 0], thighR: [4, 0, -8], kneeR: [14, 0, 0],
        hands: ['open', 'point'],
      };
    },
    // both arms thrust forward, straining to hold the opponent still
    c_hold: (t) => {
      const s = Math.sin(t * 55) * 2;
      return {
        root: { y: -0.06 }, hips: [0, 0, 0], spine: [8, 0, 0], chest: [6 + s * 0.5, 0, 0], head: [-10, 0, s * 0.4],
        shoulderR: [-86, 0, -8], elbowR: [-14, 0, 0], shoulderL: [-86, 0, 8], elbowL: [-14, 0, 0],
        thighL: [-26, 0, 14], kneeL: [40, 0, 0], thighR: [18, 0, -14], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    c_crouch: C.powerCrouch,
    c_leap: { ...C.dash },
    c_cling: { ...C.grab, chest: [18, 0, 0], head: [-18, 0, 0], thighL: [-70, 0, 20], kneeL: [90, 0, 0], thighR: [-70, 0, -20], kneeR: [90, 0, 0] },
    c_victory: { ...C.victory, head: [-8, 0, 6] },
  };

  SL.data.characters.chiaotzu = {
    id: 'chiaotzu',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Chiaotzu',
    fullName: 'Chiaotzu, Crane School',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    style: 'Psychic',
    blurb: "Tien's closest friend. Frail in a brawl, but his mind can pin a warrior in place.",
    ratings: { power: 1, speed: 3, ki: 4, defense: 1 },
    stats: { hp: 9000, ki: 100, stamina: 100, speed: 1.04, power: 0.8, defense: 0.8, weight: 0.45, kiRegen: 2.5, chargeRate: 34, canonPower: 0.35 },
    appearance: {
      height: 0.6,
      skin: 0xf6f2ee,
      build: { chestW: 0.2, shoulderX: 0.2, waistW: 0.14, upperArmR: 0.05, foreArmR: 0.046, fist: 0.058, thighR: 0.08, shinR: 0.064, headR: 0.215, neckLen: 0.04, upperArmLen: 0.23, foreArmLen: 0.21, thighLen: 0.34, shinLen: 0.32 },
      headExtras: [
        // round red cheeks
        { shape: 'ball', a: [0.5, -0.22, 0.78], d: [0.4, 0, 1], l: 0.006, r: 0.036, color: 0xe8475a, depth: 0.98, flat: 1.4, outline: 0 },
        { shape: 'ball', a: [-0.5, -0.22, 0.78], d: [-0.4, 0, 1], l: 0.006, r: 0.036, color: 0xe8475a, depth: 0.98, flat: 1.4, outline: 0 },
      ],
      face: { pupil: 0x1a1a1a, eyeW: 1.05, brow: 0x9a9a9a },
      outfit: {
        topStyle: 'gi', top: 0x2f6a3a, sleeves: 'long', sleeveColor: 0x2f6a3a, wrist: 0xd8c8a0, belt: 0xb3202a,
        pants: 0xd8c8a0, pantsStyle: 'gi', boots: 0x1e1e1e, bootStyle: 'gi',
      },
      portraitColor: '#b36ad8',
    },
    vfx: { ghost: 0xf0d8ff },
    audio: { strikePitch: 1.45, heavyPitch: 1.3 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xf4e8ff, core: 0xffffff, particles: 0xe8d0ff }, mult: {} }],
    poses: chiaotzuPoses,
    moves: {
      light: [
        { id: 'palmTap', startup: 4, active: 3, recovery: 9, cancel: 6, damage: 200, reach: 0.95, radius: 0.6, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'palmTap2', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 210, reach: 0.95, radius: 0.6, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'headbutt', startup: 6, active: 4, recovery: 14, cancel: 9, damage: 300, reach: 1.0, radius: 0.75, lunge: 13, hitstun: 24, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'c_crouch', strike: 'c_leap' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        // a telekinetic shove: no contact needed, longer reach than his little arms
        0: { id: 'psychicShove', startup: 12, active: 5, recovery: 20, damage: 560, reach: 2.4, radius: 1.1, lunge: 4, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 2, pose: { wind: 'c_focus', strike: 'c_hold' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'psychicLift', startup: 10, active: 4, recovery: 20, damage: 480, reach: 2.2, radius: 1.0, lunge: 4, hitstun: 34, knock: 'launch', knockSpeed: 17, impact: 2, pose: { wind: 'c_focus', strike: 'c_hold' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'flyingHeadbutt', startup: 5, active: 9, recovery: 17, damage: 560, reach: 1.0, radius: 0.85, lunge: 30, hitstun: 28, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'c_leap', strike: 'c_leap' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'psychicToss', name: 'Psychic Toss', damage: 760, knockSpeed: 24, poses: ['grab', 'c_focus', 'c_hold'] },
    },
    specials: {
      special1: {
        id: 'dodonRay', name: 'Dodon Ray', type: 'beam', kiCost: 20, icon: 'beam',
        chargeMin: 8, chargeMax: 34, damage: [950, 1650], radius: [0.14, 0.26], speed: 190, range: 160, sustain: 12,
        color: 0xffe07a, core: 0xffffff, poses: { charge: 'twoFingers', fire: 'twoFingers' }, recovery: 16, oneHand: true,
      },
      special2: {
        id: 'telekinesis', name: 'Telekinesis', type: 'telekinesis', kiCost: 20, icon: 'teleport', cooldown: 240,
        range: 22, startup: 12, maxFrames: 150, bossFrames: 60, kiPerSecond: 16, releaseStagger: 24, recovery: 18,
        mashGain: 0.07, escapeDecay: 0.004, cpuEscape: 0.006,
        poses: { focus: 'c_focus', hold: 'c_hold' },
      },
      ultimate: {
        id: 'selfDestruct', name: 'Self-Destruct', type: 'latch', kiCost: 100, icon: 'ultimate', ultimate: true, cooldown: 600,
        range: 16, crouch: 20, leapSpeed: 24, grabDamage: 60, fuse: 120, blastDamage: 5200, blastRadius: 5.5,
        mashGain: 0.07, holdGain: 0.7, escapeDecay: 0.003, cpuEscape: 0.007,
        // in a normal battle he survives at the edge of collapse; the story sets survive: false
        survive: true,
        poses: { crouch: 'c_crouch', leap: 'c_leap', cling: 'c_cling' },
      },
    },
    mechanic: { type: 'psychicLink', name: 'Psychic Link', desc: 'Faster ki recovery. Allies within 30 m recover ki as well while he is alive.' },
    ai: { personality: 'adaptive', aggression: 0.45, defense: 0.55, ranged: 0.6, beam: 0.5, transformHp: 0, preferredRange: 8, hooks: 'chiaotzu' },
    barks: { grab: 'chiaotzu_hold' },
    intro: { pose: 'c_focus', expression: 'calm' },
    victory: { poses: ['c_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* --------------------------------------------------------------- YAJIROBE */
  // katana in the right hand; the blade runs along the prop's +Y, placed so it points forward from the fist
  const yajPoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: -0.05 + b * 0.012 }, hips: [0, -12, 0], spine: [4, 4, 0], chest: [2, 10, 0], head: [-2, -4, 0],
        shoulderR: [-38, 0, -22], elbowR: [-70, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0],
        thighL: [-20, 12, 12], kneeL: [28 + b * 2, 0, 0], footL: [-6, 0, 0], thighR: [12, -10, -12], kneeR: [24 + b * 2, 0, 0], footR: [-10, 0, 0],
      };
    },
    y_slashW: { root: { y: -0.06 }, chest: [0, 46, 0], head: [0, -30, 0], shoulderR: [-70, 0, -80], elbowR: [-60, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-80, 0, 0], thighL: [-24, 0, 12], kneeL: [34, 0, 0], thighR: [14, 0, -12], kneeR: [24, 0, 0] },
    y_slash: { root: { y: -0.1, rx: 6 }, chest: [4, -42, 0], head: [0, 30, 0], shoulderR: [-84, 0, 30], elbowR: [-8, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-70, 0, 0], thighL: [-40, 0, 12], kneeL: [46, 0, 0], thighR: [20, 0, -12], kneeR: [22, 0, 0] },
    y_backslashW: { root: { y: -0.06 }, chest: [0, -40, 0], head: [0, 26, 0], shoulderR: [-80, 0, 40], elbowR: [-90, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-80, 0, 0], thighL: [-20, 0, 12], kneeL: [30, 0, 0], thighR: [14, 0, -12], kneeR: [26, 0, 0] },
    y_backslash: { root: { y: -0.1, rx: 4 }, chest: [4, 44, 0], head: [0, -30, 0], shoulderR: [-80, 0, -70], elbowR: [-10, 0, 0], shoulderL: [-36, 0, 36], elbowL: [-60, 0, 0], thighL: [-30, 0, 12], kneeL: [40, 0, 0], thighR: [24, 0, -12], kneeR: [26, 0, 0] },
    y_thrustW: { root: { y: -0.08 }, chest: [0, 30, 0], shoulderR: [-30, 0, -20], elbowR: [-110, 0, 0], shoulderL: [-60, 0, 20], elbowL: [-60, 0, 0], thighL: [-30, 0, 10], kneeL: [44, 0, 0], thighR: [20, 0, -10], kneeR: [30, 0, 0] },
    y_thrust: { root: { y: -0.12, rx: 12 }, chest: [10, -10, 0], head: [-10, 6, 0], shoulderR: [-90, 0, -4], elbowR: [0, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-60, 0, 0], thighL: [-56, 0, 10], kneeL: [60, 0, 0], thighR: [30, 0, -10], kneeR: [16, 0, 0] },
    y_overheadW: { ...C.hammerWind, shoulderL: [-30, 0, 20], elbowL: [-70, 0, 0] },
    y_overhead: { ...C.hammer, shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0] },
    y_eat: { root: { y: -0.04 }, chest: [-6, 0, 0], head: [8, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-40, 0, 0], shoulderL: [-70, 30, 20], elbowL: [-140, 0, 0], thighL: [-10, 0, 10], kneeL: [14, 0, 0], thighR: [6, 0, -10], kneeR: [12, 0, 0], hands: ['point', 'fist'] },
    y_sneak: { root: { y: -0.3, rx: 20 }, spine: [20, 0, 0], chest: [16, 0, 0], head: [-26, 0, 0], shoulderR: [-10, 0, -30], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-60, 0, 0], thighL: [-70, 0, 10], kneeL: [100, 0, 0], thighR: [-20, 0, -10], kneeR: [90, 0, 0] },
    y_victory: { ...C.armsCrossed, head: [-12, 0, 0] },
  };

  SL.data.characters.yajirobe = {
    id: 'yajirobe',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Yajirobe',
    fullName: 'Yajirobe',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    style: 'Swordsman',
    blurb: 'A lazy, cowardly samurai with a sharp blade — and the only one carrying Senzu Beans.',
    ratings: { power: 3, speed: 2, ki: 1, defense: 3 },
    stats: { hp: 12000, ki: 100, stamina: 110, speed: 0.92, power: 1.0, defense: 1.08, weight: 1.3, kiRegen: 1.8, chargeRate: 26, canonPower: 0.45 },
    appearance: {
      height: 0.86,
      skin: 0xe8b88a,
      build: { chestW: 0.235, chestD: 0.17, shoulderX: 0.225, waistW: 0.19, waistD: 0.16, pelvisW: 0.18, pelvisD: 0.15, upperArmR: 0.066, foreArmR: 0.058, fist: 0.064, thighR: 0.1, shinR: 0.074, headR: 0.142, neckLen: 0.05 },
      hair: { style: 'yajirobe', color: 0x121214 },
      face: { pupil: 0x141414, eyeW: 0.8, browThick: 1.4, brow: 0x121214 },
      outfit: {
        topStyle: 'gi', top: 0xd8c49a, sleeves: 'long', sleeveColor: 0xd8c49a, wrist: 0x5a3a24, belt: 0x5a3a24,
        pants: 0x3a3a54, pantsStyle: 'gi', boots: 0x2a2420, bootStyle: 'gi',
      },
      props: [
        { id: 'katana', shape: 'katana', joint: 'handR', pos: [0, -0.045, 0.01], rot: [2.3, 0, 0], length: 0.8 },
      ],
      portraitColor: '#8a7040',
    },
    vfx: { ghost: 0xfff0d0 },
    audio: { strikePitch: 0.95, heavyPitch: 0.9 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xfff4e0, core: 0xffffff, particles: 0xfff0d0 }, mult: {} }],
    poses: yajPoses,
    moves: {
      light: [
        { id: 'slash', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 300, reach: 1.55, radius: 0.9, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'y_slashW', strike: 'y_slash' }, sfx: 'swing', hitPose: 'hitSideL' },
        { id: 'backslash', startup: 5, active: 4, recovery: 13, cancel: 7, damage: 320, reach: 1.55, radius: 0.9, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'y_backslashW', strike: 'y_backslash' }, sfx: 'swing', hitPose: 'hitSideR' },
        { id: 'thrust', startup: 7, active: 4, recovery: 16, cancel: 10, damage: 400, reach: 1.9, radius: 0.7, lunge: 12, hitstun: 24, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'y_thrustW', strike: 'y_thrust' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'overheadCut', startup: 14, active: 5, recovery: 24, damage: 920, reach: 1.7, radius: 1.0, lunge: 12, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, guardCrush: true, guardDamage: 46, pose: { wind: 'y_overheadW', strike: 'y_overhead' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'risingCut', startup: 10, active: 4, recovery: 22, damage: 660, reach: 1.6, radius: 0.95, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'dashCut', startup: 6, active: 9, recovery: 20, damage: 700, reach: 1.7, radius: 1.0, lunge: 28, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'y_thrustW', strike: 'y_thrust' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'bellyBump', name: 'Belly Bump', damage: 820, knockSpeed: 30, poses: ['grab', 'y_thrustW', 'y_thrust'] },
    },
    specials: {
      special1: {
        id: 'senzuBean', name: 'Senzu Bean', type: 'senzu', kiCost: 0, icon: 'guard', cooldown: 120,
        count: 2, eatAt: 26, recovery: 18, heal: 0.45, ki: 50, tossRange: 14, allyBelow: 0.4,
        poses: { eat: 'y_eat' },
      },
      special2: {
        id: 'sneakStep', name: 'Sneak Step', type: 'teleport', kiCost: 20, icon: 'teleport',
        startup: 10, recovery: 10, cooldown: 90, escapeKiCost: 40, followWindow: 34, followBonus: 1.3, pose: 'y_sneak',
        modes: { behind: true, away: true },
      },
      ultimate: {
        id: 'samuraiRush', name: 'Samurai Rush', type: 'rush', kiCost: 100, icon: 'rush', ultimate: true,
        startup: 10, dashFrames: 26, speed: 50, armor: true, recovery: 26,
        hits: [
          { pose: 'y_slash', damage: 700, frames: 12, sfx: 'punchHeavy' },
          { pose: 'y_backslash', damage: 800, frames: 12, sfx: 'punchHeavy' },
          { pose: 'y_thrust', damage: 900, frames: 12, sfx: 'punchHeavy' },
          { pose: 'y_overhead', damage: 2000, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 },
        ],
        poses: { wind: 'y_slashW', dash: 'y_thrustW' },
      },
    },
    mechanic: { type: 'senzuBean', name: 'Senzu Bean', desc: 'Two Senzu Beans per battle: each heals 45% health and restores ki — or he tosses one to an ally in trouble. Strikes from behind deal 40% more damage.' },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.6, ranged: 0.15, beam: 0, transformHp: 0, preferredRange: 4, hooks: 'yajirobe' },
    barks: { senzu: 'yajirobe_senzu' },
    intro: { pose: 'y_eat', expression: 'calm' },
    victory: { poses: ['y_victory'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
