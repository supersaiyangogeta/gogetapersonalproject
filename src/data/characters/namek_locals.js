/*
 * NAMEKIAN LOCALS — story-only villagers for the Namek Saga (they never fight).
 *   dende          : a Namekian child; Krillin and Gohan get him away from Dodoria.
 *   namekian_elder : a village elder who stands between Frieza's men and his people.
 *   namek_frog     : a frog. It matters once, and it matters a great deal.
 *   nail           : Guru's guardian; a real fighter, playable in "The Warrior".
 * Both are cinematic characters: no moves, no specials, driven entirely by missions.
 * PROTOTYPE bodies (Level 1) on the same procedural rig as everyone else.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const antennae = (color, back = 0.35) => [
    { a: [0.33, 0.95, back], d: [0.28, 1, 0.5], l: 0.075, r: 0.011, color, depth: 0.98, outline: 0.4 },
    { a: [-0.33, 0.95, back], d: [-0.28, 1, 0.5], l: 0.075, r: 0.011, color, depth: 0.98, outline: 0.4 },
  ];

  const localPoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.02 + b * 0.008 }, spine: [2, 0, 0], chest: [2, 0, 0], head: [-2, 0, 0],
        shoulderL: [-8, 0, 12], elbowL: [-26, 0, 0], shoulderR: [-8, 0, -12], elbowR: [-26, 0, 0],
        thighL: [-4, 0, 9], kneeL: [6, 0, 0], thighR: [4, 0, -9], kneeR: [5, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // arms up, shoulders pulled in: a child who has seen what these men do
    nk_scared: (t) => {
      const s = Math.sin(t * 9) * 1.6;
      return {
        root: { y: -0.08, rx: 10 }, spine: [10, 0, 0], chest: [12 + s, 0, 0], neck: [6, 0, 0], head: [10, 0, 0],
        shoulderL: [-96, 0, 26], elbowL: [-116, 0, 0], shoulderR: [-96, 0, -26], elbowR: [-116, 0, 0],
        thighL: [-16, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // held under an arm while the fighter flies: legs tucked, head turned back
    nk_carried: (t) => ({
      root: { y: -0.1, rx: 74 + Math.sin(t * 3) * 2 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-26, 24, 0],
      shoulderL: [-40, 0, 40], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-90, 0, 0],
      thighL: [-58, 0, 14], kneeL: [72, 0, 0], thighR: [-52, 0, -14], kneeR: [68, 0, 0],
      hands: ['open', 'open'],
    }),
    nk_point: {
      root: { y: -0.02 }, chest: [2, 12, 0], head: [-6, -8, 0],
      shoulderR: [-104, 0, -8], elbowR: [-10, 0, 0], shoulderL: [-10, 0, 16], elbowL: [-40, 0, 0],
      thighL: [-6, 0, 10], kneeL: [8, 0, 0], thighR: [4, 0, -10], kneeR: [6, 0, 0],
      hands: ['open', 'point'],
    },
    // an elder standing his ground: arms wide in front of his people
    nk_shield: {
      root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 0],
      shoulderL: [-14, 0, 68], elbowL: [-18, 0, 0], shoulderR: [-14, 0, -68], elbowR: [-18, 0, 0],
      thighL: [-8, 0, 12], kneeL: [10, 0, 0], thighR: [6, 0, -12], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    nk_kneel: C.defeatKneel,
    knockdown: C.knockdown,
  };

  const localBase = {
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    playable: false,
    cinematicOnly: true,
    era: 'Namek Saga',
    style: 'Namekian',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaffd8, core: 0xffffff }, mult: {} }],
    poses: localPoses,
    moves: { light: [], heavy: {} },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0, defense: 1, ranged: 0, beam: 0, transformHp: 0, preferredRange: 6 },
    intro: { pose: 'idle', expression: 'calm' },
    victory: { poses: ['idle'], expression: 'calm' },
    defeat: { pose: 'nk_kneel', expression: 'hurt' },
  };

  /* ======================================================================
   * NAMEKIAN FROG — a story prop with a body, which is the only thing about
   * it that matters: battle.swapBodies does not care what is on either end,
   * so the captain can end up in this one.
   * ====================================================================== */
  SL.data.characters.namek_frog = {
    id: 'namek_frog',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Namekian Frog',
    playable: false,
    cinematicOnly: true,
    era: 'Namek Saga',
    stats: { hp: 500, ki: 10, stamina: 100, speed: 0.55, power: 0.02, defense: 1, weight: 0.2, kiRegen: 0.5, chargeRate: 5, canonPower: 0.01 },
    appearance: {
      height: 0.34,
      skin: 0x6fbf5a,
      build: { chestW: 0.2, chestD: 0.2, waistW: 0.19, shoulderX: 0.16, upperArmR: 0.035, foreArmR: 0.032, upperArmLen: 0.2, foreArmLen: 0.2, thighR: 0.055, shinR: 0.045, thighLen: 0.22, shinLen: 0.22, neckR: 0.06, neckLen: 0.02, headR: 0.15 },
      headExtras: [
        // eyes on top, the way a frog has them
        { shape: 'ball', a: [0.55, 0.75, 0.25], d: [0.5, 1, 0.3], l: 0.03, r: 0.062, color: 0x8ad070, depth: 0.95, outline: 0.4 },
        { shape: 'ball', a: [-0.55, 0.75, 0.25], d: [-0.5, 1, 0.3], l: 0.03, r: 0.062, color: 0x8ad070, depth: 0.95, outline: 0.4 },
      ],
      face: { pupil: 0x101010, sclera: 0xf4f6e8, noEars: true, brow: 0x4a8a3a, eyeW: 1.2 },
      outfit: { topStyle: 'bare', top: 0x6fbf5a, pants: 0x6fbf5a, pantsStyle: 'tight', boots: 0x6fbf5a, bootStyle: 'gi' },
      portraitColor: '#6fbf5a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xbfe6a0 }, mult: {} }],
    poses: {
      idle: (t) => {
        const s = Math.sin(t * 2.2);
        return {
          root: { y: -0.12 + Math.abs(s) * 0.012, rx: 26 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [-30, s * 8, 0],
          shoulderL: [-48, 0, 34], elbowL: [-28, 0, 0], shoulderR: [-48, 0, -34], elbowR: [-28, 0, 0],
          thighL: [-64, 26, 26], kneeL: [104, 0, 0], footL: [26, 0, 0], thighR: [-64, -26, -26], kneeR: [104, 0, 0], footR: [26, 0, 0],
          hands: ['open', 'open'],
        };
      },
      // mid-hop, which is also how it arrives in the story
      frog_hop: (t) => ({
        root: { y: 0.05, rx: 12 }, spine: [8, 0, 0], head: [-20, 0, 0],
        shoulderL: [-70, 0, 30], elbowL: [-14, 0, 0], shoulderR: [-70, 0, -30], elbowR: [-14, 0, 0],
        thighL: [-20, 18, 18], kneeL: [26, 0, 0], footL: [30, 0, 0], thighR: [-20, -18, -18], kneeR: [26, 0, 0], footR: [30, 0, 0],
        hands: ['open', 'open'],
      }),
    },
    moves: {
      light: [{ id: 'frogNudge', startup: 8, active: 3, recovery: 16, cancel: 10, damage: 1, reach: 0.5, radius: 0.3, lunge: 2, hitstun: 8, knock: 'flinch', impact: 1, pose: { wind: 'idle', strike: 'frog_hop' }, sfx: 'punchLight', hitPose: 'hitLight' }],
      heavy: {},
      dash: { id: 'frogHop', startup: 8, active: 3, recovery: 18, damage: 1, reach: 0.5, radius: 0.3, lunge: 8, hitstun: 8, knock: 'flinch', impact: 1, pose: { wind: 'idle', strike: 'frog_hop' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {},
    blast: { color: 0xbfe6a0, core: 0xffffff, damage: 1, speed: 20, radius: 0.1 },
    ai: { personality: 'grunt', aggression: 0.05, defense: 0.9, ranged: 0, beam: 0, transformHp: 0, preferredRange: 8 },
    barks: {},
    intro: { pose: 'idle', expression: 'calm' },
    victory: { poses: ['frog_hop'], expression: 'calm' },
    defeat: { pose: 'idle', expression: 'hurt' },
  };

  /* ======================================================================
   * NAIL — Guru's bodyguard, and the only Namekian on the planet who can make
   * Frieza wait. Built as a real fighter rather than a cutscene body: he is the
   * playable character of "The Warrior", so he needs a kit of his own.
   *
   * His identity is endurance, not damage: Namekian regeneration (he heals while
   * he holds a guard), long reach, and a strike that trades health for a stagger.
   * He is meant to lose — the mission is about how long you can make it take.
   * ====================================================================== */
  const NAIL_SKIN = 0x74c25f;

  const nailPoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.01 + b * 0.012 }, hips: [0, 6, 0], spine: [2, 4, 0], chest: [2, 8, 0], head: [-4, -6, 0],
        shoulderL: [-14, 0, 22], elbowL: [-70, 0, 0], shoulderR: [-14, 0, -22], elbowR: [-70, 0, 0],
        thighL: [-6, 6, 9], kneeL: [10, 0, 0], thighR: [4, -6, -9], kneeR: [9, 0, 0],
        hands: ['open', 'open'],
      };
    },
    nl_punchW: { root: { y: -0.03 }, hips: [0, -16, 0], chest: [2, -20, 0], head: [-6, 18, 0], shoulderR: [-26, 0, -24], elbowR: [-94, 0, 0], shoulderL: [-14, 0, 22], elbowL: [-72, 0, 0], thighL: [-10, 8, 10], kneeL: [16, 0, 0], thighR: [8, -8, -10], kneeR: [12, 0, 0] },
    nl_punch: { root: { y: -0.03, rx: 5 }, hips: [0, 16, 0], chest: [6, 26, 0], head: [-10, -22, 0], shoulderR: [-90, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-12, 0, 26], elbowL: [-78, 0, 0], thighL: [-16, 8, 10], kneeL: [24, 0, 0], thighR: [12, -8, -10], kneeR: [10, 0, 0] },
    nl_chopW: { root: { y: -0.02, rx: -8 }, spine: [-8, 14, 0], chest: [-10, 20, 0], head: [-4, -16, 0], shoulderR: [-152, 0, -12], elbowR: [-18, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-70, 0, 0], thighL: [-12, 8, 10], kneeL: [18, 0, 0], thighR: [10, -8, -10], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    nl_chop: { root: { y: -0.05, rx: 14 }, spine: [14, -10, 0], chest: [18, -14, 0], head: [-18, 12, 0], shoulderR: [-54, 0, -10], elbowR: [-14, 0, 0], shoulderL: [-16, 0, 28], elbowL: [-74, 0, 0], thighL: [-20, 8, 10], kneeL: [28, 0, 0], thighR: [14, -8, -10], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    nl_kickW: { root: { y: 0.02, rx: -8 }, spine: [-8, -12, 0], chest: [-10, -18, 0], head: [-6, 18, 0], shoulderL: [-40, 0, 32], elbowL: [-58, 0, 0], shoulderR: [-36, 0, -30], elbowR: [-54, 0, 0], thighR: [-68, 0, -10], kneeR: [86, 0, 0], footR: [20, 0, 0], thighL: [6, 0, 10], kneeL: [12, 0, 0] },
    nl_kick: { root: { y: 0.05, rx: 9 }, spine: [8, 16, 0], chest: [10, 24, 0], head: [-12, -20, 0], shoulderL: [-20, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-34, 0, -34], elbowR: [-32, 0, 0], thighR: [-102, 0, -8], kneeR: [16, 0, 0], footR: [-12, 0, 0], thighL: [14, 0, 10], kneeL: [16, 0, 0] },
    // both hands out: the Namekian brace that costs health and buys a stagger
    nl_braceW: { root: { y: -0.05, rx: -6 }, hips: [0, 0, 0], spine: [-6, 0, 0], chest: [-10, 0, 0], head: [10, 0, 0], shoulderL: [-58, -18, 30], elbowL: [-74, 0, 0], shoulderR: [-58, 18, -30], elbowR: [-74, 0, 0], thighL: [-22, 10, 12], kneeL: [34, 0, 0], thighR: [-18, -10, -12], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    nl_brace: { root: { y: -0.02, rx: 10 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-14, 0, 0], shoulderL: [-96, -10, 14], elbowL: [-10, 0, 0], shoulderR: [-96, 10, -14], elbowR: [-10, 0, 0], thighL: [-18, 8, 10], kneeL: [26, 0, 0], thighR: [14, -8, -10], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the arm he loses, and the calm about it
    nl_armless: (t) => ({
      root: { y: -0.02, rx: 6 }, hips: [0, -8, 0], spine: [6, -6, 0], chest: [8, -10, 0], head: [-8, 10, 0],
      shoulderL: [-8, 0, 12], elbowL: [-20, 0, 0], shoulderR: [-26, 0, -18], elbowR: [-88, 0, 0],
      thighL: [-8, 6, 9], kneeL: [12, 0, 0], thighR: [6, -6, -9], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    }),
    nl_offer: { root: { y: 0, rx: -4 }, hips: [0, 10, 0], chest: [-4, 12, 0], head: [-6, -10, 0], shoulderR: [-88, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-12, 0, 20], elbowL: [-56, 0, 0], thighL: [-6, 6, 9], kneeL: [8, 0, 0], thighR: [4, -6, -9], kneeR: [6, 0, 0], hands: ['open', 'open'] },
    nl_defeat: C.knockdown,
  };

  SL.data.characters.nail = {
    id: 'nail',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Nail',
    fullName: 'Nail, Guardian of the Grand Elder',
    era: 'Namek Saga',
    playable: true, // Free Battle after "The Warrior" (unlocks.js); he is also the player in that mission
    prototype: true,
    storyAlly: true,
    style: 'Guardian',
    blurb: 'The strongest warrior his people ever produced, against something that does not care. He cannot win. He can take a very long time losing.',
    ratings: { power: 3, speed: 3, ki: 3, defense: 5 },
    stats: { hp: 22000, ki: 110, stamina: 170, speed: 1.05, power: 1, defense: 1.25, weight: 1.05, kiRegen: 3, chargeRate: 30, canonPower: 1.2 },
    poise: { max: 70, regen: 14, regenDelay: 90, armor: 1, cost: { 1: 7, 2: 11, 3: 17, 4: 26 }, beamMul: 1, breakFrames: 130, vulnerable: 1.2 },
    appearance: {
      height: 1.12,
      skin: NAIL_SKIN,
      build: { chestW: 0.215, shoulderX: 0.22, waistW: 0.14, waistD: 0.115, upperArmR: 0.062, foreArmR: 0.054, thighR: 0.09, shinR: 0.072, neckR: 0.078, headR: 0.118 },
      headExtras: [
        { a: [0.35, 0.95, 0.35], d: [0.3, 1, 0.5], l: 0.09, r: 0.012, color: NAIL_SKIN, depth: 0.98, outline: 0.4 },
        { a: [-0.35, 0.95, 0.35], d: [-0.3, 1, 0.5], l: 0.09, r: 0.012, color: NAIL_SKIN, depth: 0.98, outline: 0.4 },
      ],
      face: { pupil: 0x101010, eyeW: 0.92, brow: 0x3e7a34, browThick: 1.1, pointedEars: true },
      // (2026-10-16, the board p.19: he wore a white sleeveless gi top and a brown belt. Now as the board: the bare
      // Namekian torso with the pink muscle on the belly, the white shawl over the shoulders and round the neck (Piccolo
      // Jr.'s construction), the light-blue sash, baggy white trousers gathered at the ankle, brown shoes, the pink
      // muscle patches down the arms)
      outfit: {
        topStyle: 'bare', top: NAIL_SKIN, arms: NAIL_SKIN, abs: 0xd8907e,
        belt: 0x6a9ad8, beltStyle: 'sash', sashTails: { len: 0.22, side: 1 },
        pants: 0xf2efe6, pantsStyle: 'harem', boots: 0x6a4a2a, bootStyle: 'shoe',
      },
      props: [
        { id: 'shawlL', joint: 'chest', shape: 'ball', pos: [0.19, 0.275, -0.005], rot: [0, 0, -0.14], size: [0.12, 0.05, 0.13], color: 0xf2f2f0 },
        { id: 'shawlR', joint: 'chest', shape: 'ball', pos: [-0.19, 0.275, -0.005], rot: [0, 0, 0.14], size: [0.12, 0.05, 0.13], color: 0xf2f2f0 },
        { id: 'shawlNeck', joint: 'neck', shape: 'neckRing', pos: [0, 0.0, 0.0], radius: 0.098, thick: 0.4, color: 0xf2f2f0 },
      ],
      decals: ['L', 'R'].flatMap((sd) => {
        const k = sd === 'L' ? 1 : -1;
        return [
          { at: 'shoulder' + sd, t: 0.5, ang: 0.9 * k, size: [0.044, 0.1], color: 0xd8907e },
          { at: 'shoulder' + sd, t: 0.55, ang: 0.15 * k, size: [0.034, 0.08], color: 0xd8907e },
          { at: 'elbow' + sd, t: 0.45, ang: 0.6 * k, size: [0.04, 0.1], color: 0xd8907e },
        ];
      }),
      portraitColor: '#74c25f',
    },
    vfx: { ghost: 0xbfe6a0 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x9fe08a, core: 0xeaffd8, particles: 0xcfeebb, speed: 1 }, mult: {} }],
    poses: nailPoses,
    moves: {
      light: [
        { id: 'nlJab', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 380, reach: 1.35, radius: 0.78, lunge: 13, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'nl_punchW', strike: 'nl_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'nlCross', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 410, reach: 1.35, radius: 0.78, lunge: 13, hitstun: 19, knock: 'flinch', impact: 1, pose: { wind: 'nl_punchW', strike: 'nl_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'nlChop', startup: 8, active: 4, recovery: 18, cancel: 10, damage: 720, reach: 1.7, radius: 0.95, lunge: 12, hitstun: 26, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'nl_chopW', strike: 'nl_chop' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'nlSmash', startup: 13, active: 5, recovery: 24, damage: 1250, reach: 1.7, radius: 1, lunge: 16, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'nl_chopW', strike: 'nl_chop' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'nlLaunch', startup: 12, active: 4, recovery: 22, damage: 1100, reach: 1.6, radius: 0.95, lunge: 14, hitstun: 30, knock: 'launch', knockSpeed: 20, impact: 3, pose: { wind: 'nl_kickW', strike: 'nl_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'nlDash', startup: 5, active: 5, recovery: 15, damage: 620, reach: 1.45, radius: 0.88, lunge: 38, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'nl_punchW', strike: 'nl_punch' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'nlToss', name: 'Guardian Throw', damage: 780, knockSpeed: 24, poses: ['grab', 'nl_chopW', 'nl_chop'] },
    },
    specials: {
      special1: {
        id: 'namekWave', name: 'Namekian Wave', type: 'beam', kiCost: 34, icon: 'beam',
        chargeMin: 22, chargeMax: 60, recovery: 28,
        damage: [700, 1900], radius: [0.5, 0.95], speed: 95, range: 55, sustain: 40,
        color: 0x9fe08a, core: 0xeaffd8, poses: { charge: 'nl_braceW', fire: 'nl_brace' },
      },
      // the guardian move: he plants himself, takes the hit and gives it back
      special2: {
        id: 'guardianStand', name: 'Guardian Stand', type: 'rush', kiCost: 26, icon: 'rush',
        startup: 14, dashFrames: 18, speed: 62, armor: true, recovery: 28,
        poses: { wind: 'nl_braceW' },
        hits: [
          { pose: 'nl_brace', damage: 620, frames: 10, sfx: 'punchHeavy' },
          { pose: 'nl_chop', damage: 1250, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 26, impact: 3 },
        ],
      },
      ultimate: {
        id: 'namekBarrage', name: 'Guardian Barrage', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 22, rise: 24, height: 9, count: 10, damage: 780, speed: 60, range: 44, recovery: 24,
        color: 0x9fe08a, poses: { wind: 'nl_braceW', throw: 'nl_brace' },
      },
    },
    blast: { color: 0x9fe08a, core: 0xeaffd8, damage: 260, speed: 66, radius: 0.28, sfxPitch: 1 },
    // Namekian regeneration: holding a guard knits him back together
    mechanic: { type: 'regenerator', name: 'Namekian Regeneration', desc: 'He heals while he holds a guard. Nothing he does out-damages Frieza — the fight is about how long he can stand there.' },
    regen: { perSecond: 0.028, maxFrac: 0.85 },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.85, ranged: 0.4, beam: 0.5, transformHp: 0, preferredRange: 3.5 },
    barks: { taunt: 'nail_taunt', hurt: 'nail_hurt' },
    intro: { pose: 'nl_braceW', expression: 'calm' },
    victory: { poses: ['nl_offer'], expression: 'calm' },
    defeat: { pose: 'nl_defeat', expression: 'hurt' },
  };

  SL.data.characters.dende = {
    ...localBase,
    id: 'dende',
    name: 'Dende',
    fullName: 'Dende, Namekian child',
    blurb: 'A Namekian child from a village Frieza has already found.',
    stats: { hp: 2000, ki: 40, stamina: 60, speed: 0.9, power: 0.2, defense: 0.6, weight: 0.45, kiRegen: 2, chargeRate: 10, canonPower: 0.05 },
    appearance: {
      height: 0.52,
      skin: 0x74c064,
      build: { chestW: 0.175, shoulderX: 0.18, waistW: 0.125, upperArmR: 0.046, foreArmR: 0.042, fist: 0.055, thighR: 0.074, shinR: 0.06, headR: 0.15, neckLen: 0.05, upperArmLen: 0.22, foreArmLen: 0.2, thighLen: 0.34, shinLen: 0.32 },
      headExtras: antennae(0x74c064, 0.4),
      face: { pupil: 0x101010, eyeW: 1.2, brow: 0x3e7a34, pointedEars: true },
      outfit: {
        topStyle: 'gi', top: 0x4fb0c8, sleeves: 'long', sleeveColor: 0x4fb0c8, arms: 0x74c064,
        belt: 0xf0efe6, pants: 0x4fb0c8, pantsStyle: 'gi', boots: 0xf0efe6, bootStyle: 'gi',
      },
      portraitColor: '#4fb0c8',
    },
  };

  // the eldest Namekian: enormous, immobile, and the reason anyone on this planet still has a chance
  const guruPoses = {
    idle: (t) => {
      const b = Math.sin(t * 1.3);
      return {
        root: { y: -0.52 + b * 0.006 }, hips: [0, 0, 0], spine: [4, 0, 0], chest: [6 + b * 0.8, 0, 0], neck: [-2, 0, 0], head: [-6, 0, 0],
        shoulderL: [-16, 0, 42], elbowL: [-92, 0, 0], handL: [0, 0, 20],
        shoulderR: [-16, 0, -42], elbowR: [-92, 0, 0], handR: [0, 0, -20],
        thighL: [-96, 14, 18], kneeL: [92, 0, 0], footL: [16, 0, 0],
        thighR: [-96, -14, -18], kneeR: [92, 0, 0], footR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a hand laid on a head: the potential unlock
    gr_reach: {
      root: { y: -0.52 }, spine: [6, -8, 0], chest: [8, -14, 0], neck: [2, 0, 0], head: [4, -16, 0],
      shoulderR: [-116, 0, -26], elbowR: [-34, 0, 0], handR: [-30, 0, 0],
      shoulderL: [-14, 0, 40], elbowL: [-96, 0, 0],
      thighL: [-96, 14, 18], kneeL: [92, 0, 0], thighR: [-96, -14, -18], kneeR: [92, 0, 0],
      hands: ['open', 'open'],
    },
    gr_speak: (t) => {
      const b = Math.sin(t * 2.1);
      return {
        root: { y: -0.52 }, spine: [2, 0, 0], chest: [4, 0, 0], neck: [-4, 0, 0], head: [-10 + b * 1.5, 0, 0],
        shoulderL: [-18, 0, 44], elbowL: [-88, 0, 0], shoulderR: [-18, 0, -44], elbowR: [-88, 0, 0],
        thighL: [-96, 14, 18], kneeL: [92, 0, 0], thighR: [-96, -14, -18], kneeR: [92, 0, 0],
        hands: ['open', 'open'],
      };
    },
    nk_kneel: C.defeatKneel,
    knockdown: C.knockdown,
  };

  SL.data.characters.guru = {
    ...localBase,
    id: 'guru',
    name: 'Grand Elder Guru',
    fullName: 'Guru, Eldest Namekian',
    blurb: 'Ancient, enormous and nearly immobile. He created the Dragon Balls, and he can see what is sleeping inside someone.',
    stats: { hp: 9000, ki: 100, stamina: 60, speed: 0.2, power: 0.3, defense: 1, weight: 4, kiRegen: 4, chargeRate: 10, canonPower: 0.2 },
    poses: guruPoses,
    appearance: {
      height: 1.95,
      skin: 0x74b86a,
      build: {
        chestW: 0.42, chestD: 0.34, chestH: 0.26, shoulderX: 0.34, waistW: 0.38, waistD: 0.32, pelvisW: 0.34,
        upperArmR: 0.12, foreArmR: 0.1, fist: 0.09, delt: 0.14, thighR: 0.15, shinR: 0.11, neckR: 0.13, neckLen: 0.02, headR: 0.15,
      },
      headExtras: antennae(0x74b86a, 0.3),
      face: { pupil: 0x101010, eyeW: 0.85, browThick: 1.8, brow: 0x3e7a34, pointedEars: true },
      outfit: {
        topStyle: 'gi', top: 0xe8e2d0, sleeves: 'long', sleeveColor: 0xe8e2d0, arms: 0x74b86a,
        belt: 0x6a4a2a, pants: 0xe8e2d0, pantsStyle: 'gi', boots: 0xd8cfae, bootStyle: 'gi',
      },
      portraitColor: '#74b86a',
    },
    intro: { pose: 'gr_speak', expression: 'calm' },
    victory: { poses: ['idle'], expression: 'calm' },
    defeat: { pose: 'nk_kneel', expression: 'hurt' },
  };

  SL.data.characters.namekian_elder = {
    ...localBase,
    id: 'namekian_elder',
    name: 'Village Elder',
    fullName: 'Namekian Village Elder',
    blurb: 'An elder who stands in front of his village when the soldiers come.',
    stats: { hp: 4200, ki: 60, stamina: 70, speed: 0.85, power: 0.4, defense: 0.8, weight: 1.1, kiRegen: 2, chargeRate: 12, canonPower: 0.08 },
    appearance: {
      height: 1.04,
      skin: 0x6cb85a,
      build: { chestW: 0.215, shoulderX: 0.215, waistW: 0.15, upperArmR: 0.058, foreArmR: 0.052, thighR: 0.09, headR: 0.118 },
      headExtras: antennae(0x6cb85a),
      face: { pupil: 0x101010, eyeW: 0.95, browThick: 1.4, brow: 0x3e7a34, pointedEars: true },
      outfit: {
        topStyle: 'gi', top: 0xf0efe6, sleeves: 'long', sleeveColor: 0xf0efe6, arms: 0x6cb85a,
        belt: 0x4fb0c8, pants: 0xf0efe6, pantsStyle: 'gi', boots: 0xd8d4c4, bootStyle: 'gi',
        turban: 0xf0efe6, turbanBand: 0x4fb0c8,
      },
      portraitColor: '#6cb85a',
    },
  };
})();
