/*
 * THE OTHER BUUS (Buu Saga, Age 774).
 *
 *   evil_buu    what comes out of Good Buu when the rage gets too big for him: the evil in him,
 *               steamed out and condensed into a body of its own — tall, grey, starved-looking,
 *               black eyes with red in them, and nothing but cruelty. He moves like something
 *               hunting: low, loose, sudden. He swats a candy beam straight back at whoever sent it.
 *   kid_buu     what is left when everything Buu ever absorbed is pulled back out of him: the
 *               original. Small, wiry, pink, a short antenna whipped back, black eyes with red in
 *               them, white trousers and a black belt — and no mind at all, only appetite. He
 *               screams, giggles, flips, and destroys things because they are there. Readable,
 *               though: every one of his tricks is announced by a screech and a pink flash.
 *   super_buu   Evil Buu after he has eaten Good Buu: the fat one's power in the evil one's will.
 *               Tall, muscular, pink, a long antenna swept back, white trousers and a black-and-gold
 *               belt, bare to the waist. Calculating, aggressive, arrogant — and he still grows
 *               back whatever you take off him (the same majinBody mechanic Good Buu uses, with
 *               sharper numbers: less gut, faster wounds, one more reform).
 *
 * Both are Level 1 functional prototypes and story characters for now (Super Buu becomes a fight
 * at the Lookout and in the Time Chamber — later missions).
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const GREY = 0x8e8e9c, PINK = 0xf29ac0, WHITE = 0xf4f2ec, BELT = 0x1a1a22, GOLD = 0xe8c64a;

  const poses = {
    /* ---- Evil Buu ---- */
    // hunched and loose, the arms hanging long, the head pushed forward: something that hunts
    eb_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.08 + b * 0.012, rx: 14 }, spine: [16, 0, b * 2], chest: [10, 0, 0], head: [-26, b * 5, 0],
        shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -20], elbowR: [-30, 0, 0],
        thighL: [-24, 0, 16], kneeL: [40, 0, 0], thighR: [-10, 0, -16], kneeR: [34, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a thin, high laugh with the head thrown back
    eb_laugh: (t) => {
      const b = Math.sin(t * 16);
      return {
        root: { y: -0.04 + Math.abs(b) * 0.01 }, spine: [-6, 0, 0], chest: [-6, 0, 0], head: [-16 + b * 4, 0, 0],
        shoulderL: [-20, 0, 36], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -36], elbowR: [-60, 0, 0],
        thighL: [-12, 0, 14], kneeL: [16, 0, 0], thighR: [-12, 0, -14], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // forming out of the steam: curled up, then unfolding
    eb_form: {
      root: { y: -0.3, rx: 30 }, spine: [30, 0, 0], chest: [24, 0, 0], head: [20, 0, 0],
      shoulderL: [-60, 0, 20], elbowL: [-110, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-110, 0, 0],
      thighL: [-80, 0, 16], kneeL: [110, 0, 0], thighR: [-80, 0, -16], kneeR: [110, 0, 0],
      hands: ['fist', 'fist'],
    },
    // the swat that sends a beam straight back where it came from
    eb_reflectW: {
      root: { y: -0.06 }, spine: [4, -30, 0], chest: [4, -30, 0], head: [-10, 20, 0],
      shoulderR: [-60, 0, -70], elbowR: [-60, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-40, 0, 0],
      thighL: [-16, 0, 14], kneeL: [22, 0, 0], thighR: [10, 0, -14], kneeR: [18, 0, 0],
      hands: ['fist', 'open'],
    },
    eb_reflect: {
      root: { y: -0.06 }, spine: [6, 36, 0], chest: [6, 36, 0], head: [-10, -24, 0],
      shoulderR: [-100, 0, 30], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-40, 0, 0],
      thighL: [-18, 0, 14], kneeL: [22, 0, 0], thighR: [12, 0, -14], kneeR: [18, 0, 0],
      hands: ['fist', 'open'],
    },
    eb_clawW: { ...C.punchWindR, root: { y: -0.08, rx: 12 } },
    eb_claw: { ...C.punchR, root: { y: -0.08, rx: 14 }, hands: ['open', 'open'] },
    // eating: both hands at the mouth
    eb_eat: (t) => {
      const b = Math.sin(t * 12);
      return {
        root: { y: -0.04, rx: 8 }, spine: [8, 0, 0], chest: [4, 0, 0], head: [-4 + b * 6, 0, 0],
        shoulderL: [-70, 0, 20], elbowL: [-120, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-120, 0, 0],
        thighL: [-10, 0, 14], kneeL: [16, 0, 0], thighR: [-10, 0, -14], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the change: doubled over, shaking, swelling
    eb_mutate: (t) => {
      const s = Math.sin(t * 30) * 2;
      return {
        root: { y: -0.12, rx: 24 }, spine: [26, 0, s], chest: [20, 0, -s], head: [10, s, 0],
        shoulderL: [-40, 0, 40], elbowL: [-80, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-80, 0, 0],
        thighL: [-30, 0, 20], kneeL: [50, 0, 0], thighR: [-30, 0, -20], kneeR: [50, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    /* ---- Super Buu ---- */
    // arms folded, weight on one leg, chin up: he has already decided how this ends
    sb_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.02 + b * 0.006 }, hips: [0, -8, 4], spine: [-2, 4, 0], chest: [-4, 8, 0], head: [-10, -10, 0],
        shoulderL: [-14, -72, 6], elbowL: [-94, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-90, 0, 0],
        thighL: [-8, 4, 12], kneeL: [10, 0, 0], thighR: [-4, -6, -8], kneeR: [16, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // in a fight: wide, low, the hands open like claws
    sb_fight: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.1 + b * 0.012, rx: 8 }, hips: [0, -20, 0], spine: [8, 10, 0], chest: [6, 14, 0], head: [-16, -12, 0],
        shoulderL: [-60, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-80, 0, 0],
        thighL: [-30, 16, 18], kneeL: [44 + b * 3, 0, 0], thighR: [18, -12, -18], kneeR: [36 + b * 3, 0, 0],
        hands: ['open', 'open'],
      };
    },
    sb_roar: (t) => {
      const s = Math.sin(t * 24) * 2;
      return {
        root: { y: -0.04 }, spine: [-8, 0, s], chest: [-10, 0, 0], head: [-8, s, 0],
        shoulderL: [-30, 0, 70], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -70], elbowR: [-40, 0, 0],
        thighL: [-18, 0, 20], kneeL: [26, 0, 0], thighR: [-18, 0, -20], kneeR: [26, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    sb_jabW: { ...C.punchWindR, root: { y: -0.08 } },
    sb_jab: { ...C.punchR, root: { y: -0.1, rx: 8 } },
    sb_kickW: { ...C.kickWindR, root: { y: -0.08 } },
    sb_kick: { ...C.kickR, root: { y: 0.02 } },
    // sitting cross-legged on the floor of the Lookout, waiting, bored
    sb_sit: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: -0.62 + b * 0.004 }, spine: [10, 0, 0], chest: [4, 0, 0], head: [6, b * 6, 0],
        shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-70, 0, 0],
        thighL: [-86, 30, 40], kneeL: [120, 0, 0], thighR: [-86, -30, -40], kneeR: [120, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // a laugh with his whole chest: arms loose, head back
    sb_laugh: (t) => {
      const b = Math.sin(t * 12);
      return {
        root: { y: -0.02 + Math.abs(b) * 0.012 }, spine: [-8, 0, 0], chest: [-8, 0, 0], head: [-16 + b * 4, 0, 0],
        shoulderL: [-20, 0, 34], elbowL: [-50, 0, 0], shoulderR: [-20, 0, -34], elbowR: [-50, 0, 0],
        thighL: [-8, 0, 16], kneeL: [10, 0, 0], thighR: [-8, 0, -16], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    sb_blastW: { ...C.blastWind },
    sb_blast: { ...C.blastR },
    // one arm straight up to the sky, the hand open: every ki beam at once
    sb_skyW: {
      root: { y: -0.04 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-30, 0, 0],
      shoulderR: [-176, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 14], kneeL: [14, 0, 0], thighR: [-6, 0, -14], kneeR: [10, 0, 0],
      hands: ['fist', 'open'],
    },

    /* ---- Kid Buu ---- */
    // never still: hunched, bouncing on his toes, arms loose, the head cocked
    kb_idle: (t) => {
      const b = Math.sin(t * 5), c = Math.sin(t * 2.3);
      return {
        root: { y: -0.1 + Math.abs(b) * 0.03, rx: 16 }, spine: [14, 0, c * 4], chest: [10, c * 8, 0], head: [-24, c * 14, 10],
        shoulderL: [-6 + b * 8, 0, 26], elbowL: [-40, 0, 0], shoulderR: [-6 - b * 8, 0, -26], elbowR: [-40, 0, 0],
        thighL: [-30, 0, 18], kneeL: [52, 0, 0], footL: [-14, 0, 0], thighR: [-30, 0, -18], kneeR: [52, 0, 0], footR: [-14, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the tell before a trick: low, coiled, the grin wide
    kb_tell: (t) => ({
      root: { y: -0.22, rx: 24 }, spine: [22, 0, 0], chest: [14, 0, 0], head: [-36, Math.sin(t * 30) * 6, 0],
      shoulderL: [-30, 0, 50], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -50], elbowR: [-80, 0, 0],
      thighL: [-56, 0, 22], kneeL: [90, 0, 0], thighR: [-56, 0, -22], kneeR: [90, 0, 0],
      hands: ['open', 'open'],
    }),
    // the scream: head thrown back, arms flung out and down, the chest pushed at the sky
    kb_scream: (t) => {
      const s = Math.sin(t * 60) * 2;
      return {
        root: { y: -0.08, rx: -4 }, spine: [-6, 0, 0], chest: [-8 + s, 0, 0], neck: [-4, 0, 0], head: [-14, 0, 0],
        shoulderL: [10, 0, 60 + s], elbowL: [-20, 0, 0], shoulderR: [10, 0, -60 - s], elbowR: [-20, 0, 0],
        thighL: [-24, 0, 24], kneeL: [40, 0, 0], thighR: [-24, 0, -24], kneeR: [40, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // both arms straight up, the ball over his head (the Planet Burst)
    kb_burstUp: (t) => ({
      root: { y: Math.sin(t * 3) * 0.02 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-30, 0, 0],
      shoulderL: [-172, 0, 14], elbowL: [-8, 0, 0], shoulderR: [-172, 0, -14], elbowR: [-8, 0, 0],
      thighL: [-10, 0, 10], kneeL: [26, 0, 0], footL: [30, 0, 0], thighR: [-4, 0, -10], kneeR: [30, 0, 0], footR: [36, 0, 0],
      hands: ['open', 'open'],
    }),
    // a giggle that bends him in half
    kb_laugh: (t) => {
      const b = Math.sin(t * 18);
      return {
        root: { y: -0.06 + Math.abs(b) * 0.02, rx: 20 }, spine: [24 + b * 4, 0, 0], chest: [12, 0, 0], head: [-10 + b * 6, 0, 0],
        shoulderL: [-30, 0, 20], elbowL: [-100, 0, 0], shoulderR: [-60, 0, -30], elbowR: [-90, 0, 0],
        thighL: [-20, 0, 16], kneeL: [30, 0, 0], thighR: [-14, 0, -16], kneeR: [26, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a foot raised over somebody on the ground, and down
    kb_stompUp: {
      root: { y: 0.04 }, spine: [-6, 0, 0], chest: [-6, 0, 0], head: [16, 0, 0],
      shoulderL: [-20, 0, 40], elbowL: [-50, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-50, 0, 0],
      thighL: [-80, 0, 10], kneeL: [100, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['fist', 'fist'],
    },
    kb_stompDown: {
      root: { y: -0.06 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [24, 0, 0],
      shoulderL: [-10, 0, 30], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -30], elbowR: [-40, 0, 0],
      thighL: [-20, 0, 10], kneeL: [16, 0, 0], thighR: [10, 0, -10], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    kb_jabW: { ...C.punchWindR, root: { y: -0.12, rx: 16 } },
    kb_jab: { ...C.punchR, root: { y: -0.14, rx: 18 }, hands: ['open', 'fist'] },
    kb_kickW: { ...C.kickWindR, root: { y: -0.08 } },
    kb_kick: { ...C.kickR, root: { y: 0.02 } },
    // the mouth blast: head thrust forward, jaw open, arms back
    kb_mouthW: {
      root: { y: -0.12, rx: 10 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-20, 0, 0],
      shoulderL: [30, 0, 40], elbowL: [-30, 0, 0], shoulderR: [30, 0, -40], elbowR: [-30, 0, 0],
      thighL: [-30, 0, 16], kneeL: [44, 0, 0], thighR: [-10, 0, -16], kneeR: [30, 0, 0],
      hands: ['open', 'open'],
    },
    kb_mouth: {
      root: { y: -0.14, rx: 22 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [6, 0, 0],
      shoulderL: [40, 0, 40], elbowL: [-20, 0, 0], shoulderR: [40, 0, -40], elbowR: [-20, 0, 0],
      thighL: [-36, 0, 16], kneeL: [50, 0, 0], thighR: [-6, 0, -16], kneeR: [24, 0, 0],
      hands: ['open', 'open'],
    },
  };

  const move = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 5, active: 3, recovery: 12, cancel: 7, damage: dmg, reach: 1.25, radius: 0.8, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);
  // the antenna: out of the top of the forehead, over the crown, and down the back of the head
  const antenna = (color, k) => [
    { shape: 'ball', a: [0, 0.92, 0.4], d: [0, 0.3, -1], l: 0.13 * k, r: 0.034, flat: 1, color, depth: 1.0 },
    { shape: 'ball', a: [0, 0.62, -0.8], d: [0, -0.55, -0.85], l: 0.15 * k, r: 0.036, flat: 1, color, depth: 1.14 },
    { a: [0, 0.05, -1], d: [0, -1, -0.35], l: 0.22 * k, r: 0.03, color, depth: 1.42 },
  ];
  const vents = (color) => [
    { shape: 'ball', a: [0.62, 0.62, -0.46], d: [0.7, 0.5, -0.5], l: 0.02, r: 0.02, color, depth: 0.99, flat: 0.4, outline: 0 },
    { shape: 'ball', a: [-0.62, 0.62, -0.46], d: [-0.7, 0.5, -0.5], l: 0.02, r: 0.02, color, depth: 0.99, flat: 0.4, outline: 0 },
  ];

  SL.data.characters.evil_buu = {
    id: 'evil_buu',
    assetLevel: 1,
    name: 'Evil Buu',
    fullName: 'Evil Buu',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Pure Malice',
    blurb: 'Everything Good Buu promised not to be, given a body of its own.',
    ratings: { power: 4, speed: 5, ki: 4, defense: 3 },
    stats: { hp: 26000, ki: 150, stamina: 180, speed: 1.2, power: 1.3, defense: 1.0, weight: 0.9, kiRegen: 3, chargeRate: 32, canonPower: 2.6 },
    appearance: {
      height: 1.06,
      skin: GREY,
      build: {
        chestW: 0.19, chestD: 0.13, shoulderX: 0.2, waistW: 0.11, waistD: 0.09, pelvisW: 0.13,
        upperArmR: 0.044, foreArmR: 0.04, fist: 0.05, upperArmLen: 0.3, foreArmLen: 0.29,
        thighR: 0.07, shinR: 0.055, thighLen: 0.42, shinLen: 0.4, headR: 0.13, neckLen: 0.06,
      },
      hair: { style: 'bald', color: GREY },
      headExtras: antenna(GREY, 1).concat(vents(0x2a2a34)),
      face: { noEars: true, pupil: 0xd02030, sclera: 0x141418, eyeW: 0.8, browThick: 1.4, brow: 0x2a2a34 },
      outfit: {
        topStyle: 'bare', top: GREY, arms: GREY,
        pants: WHITE, pantsStyle: 'gi',
        belt: BELT, beltStyle: 'sash',
        boots: 0x1a1a22, bootStyle: 'gi',
      },
      portraitColor: '#8e8e9c',
    },
    vfx: { ghost: 0xb0b0c8 },
    audio: { strikePitch: 0.95, heavyPitch: 0.8 },
    forms: [{ id: 'base', name: 'Evil', aura: { color: 0x9a90b8, core: 0xe0d8f0, particles: 0xb0a8d0, idle: 0 }, mult: {} }],
    poses: Object.assign({ idle: poses.eb_idle }, poses),
    moves: {
      light: [move('ebClaw', 620, 'eb_clawW', 'eb_claw', { hitPose: 'hitSideR' }), move('ebRake', 660, 'eb_clawW', 'eb_claw', { hitPose: 'hitSideL' }), move('ebKick', 780, 'kickWindR', 'kickR', { reach: 1.45, knock: 'push', knockSpeed: 12, impact: 2 })],
      heavy: { 0: move('ebSmash', 1600, 'hammerWind', 'hammer', { startup: 12, active: 5, recovery: 22, reach: 1.4, radius: 1, knock: 'smash', knockSpeed: 28, impact: 3, hitstun: 34, hitPose: 'hitHeavy', sfx: 'punchHeavy' }) },
      dash: move('ebLunge', 980, 'eb_clawW', 'eb_claw', { startup: 6, active: 8, recovery: 18, lunge: 32, knock: 'heavy', knockSpeed: 22, impact: 2, hitstun: 26, sfx: 'punchHeavy' }),
    },
    specials: {
      special1: {
        id: 'ebBeam', name: 'Evil Ray', type: 'projectile', kiCost: 30, icon: 'beam', fromHead: true,
        startup: 18, recovery: 22, pose: { wind: 'eb_reflectW', release: 'eb_reflect' },
        projectile: { kind: 'ball', speed: 70, radius: 0.24, damage: 900, homing: 0.3, color: 0xb070ff, core: 0xffffff, explode: 1.2, knock: 'push', knockSpeed: 12, impact: 2, life: 1.6 },
      },
    },
    mechanic: null,
    ai: { personality: 'berserker', aggression: 0.85, defense: 0.3, ranged: 0.25, beam: 0, transformHp: 0, preferredRange: 1.8 },
    intro: { pose: 'eb_laugh', expression: 'grin' },
    victory: { poses: ['eb_laugh'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  SL.data.characters.super_buu = {
    id: 'super_buu',
    assetLevel: 1,
    name: 'Super Buu',
    fullName: 'Super Buu',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Calculating Predator',
    blurb: 'The fat one\'s power, the evil one\'s mind. He keeps his promises only when they are fights.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 4 },
    stats: { hp: 42000, ki: 200, stamina: 220, speed: 1.2, power: 1.55, defense: 1.2, weight: 1.2, kiRegen: 3.5, chargeRate: 36, canonPower: 4.2 },
    poise: { max: 170, armor: 1, regen: 24, regenDelay: 70, breakFrames: 60, vulnerable: 1.25, beamMul: 1.2, cost: { 1: 8, 2: 14, 3: 24, 4: 40 } },
    appearance: {
      height: 1.12,
      skin: PINK,
      build: {
        chestW: 0.29, chestD: 0.2, chestTop: 0.3, shoulderX: 0.29, delt: 0.095, waistW: 0.165, waistD: 0.13, pelvisW: 0.17,
        upperArmR: 0.078, foreArmR: 0.068, fist: 0.068, thighR: 0.105, shinR: 0.08, headR: 0.135, neckLen: 0.06, neckR: 0.075,
      },
      hair: { style: 'bald', color: PINK },
      headExtras: antenna(PINK, 1.2).concat(vents(0x6a2a4a)),
      face: { noEars: true, pupil: 0xc01830, sclera: 0x141418, eyeW: 0.82, browThick: 1.3, brow: 0x3a1a2a },
      outfit: {
        topStyle: 'bare', top: PINK, arms: PINK, pecs: PINK,
        pants: WHITE, pantsStyle: 'gi',
        belt: BELT, beltStyle: 'sash',
        wrist: GOLD,
        boots: 0x1a1a22, bootTip: GOLD, bootStyle: 'saiyan',
      },
      portraitColor: '#f29ac0',
    },
    vfx: { ghost: 0xffb0d0, trail: 0xffc0dc },
    audio: { strikePitch: 0.85, heavyPitch: 0.72 },
    forms: [{ id: 'base', name: 'Super', aura: { color: 0xff7ab8, core: 0xffe0f0, particles: 0xffa0d0, idle: 0, speed: 1.3, sharp: 0.3 }, mult: {} }],
    // (the majin body asks for 'bu_sit' while he is in pieces and 'bu_laugh' when he is whole again)
    poses: Object.assign({ idle: poses.sb_fight, bu_laugh: poses.sb_laugh, bu_sit: poses.sb_sit }, poses),
    moves: {
      light: [move('sbJab', 700, 'sb_jabW', 'sb_jab'), move('sbCross', 760, 'sb_jabW', 'sb_jab', { hitPose: 'hitSideR' }), move('sbKick', 900, 'sb_kickW', 'sb_kick', { reach: 1.5, knock: 'push', knockSpeed: 13, impact: 2 })],
      heavy: {
        0: move('sbHammer', 2000, 'hammerWind', 'hammer', { startup: 12, active: 5, recovery: 22, reach: 1.5, radius: 1.05, knock: 'smash', knockSpeed: 32, impact: 3, hitstun: 36, guardCrush: true, guardDamage: 50, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
        2: move('sbRise', 1500, 'uppercutWind', 'uppercut', { startup: 9, recovery: 18, knock: 'launch', knockSpeed: 22, impact: 3, hitstun: 32, sfx: 'punchHeavy' }),
      },
      dash: move('sbDash', 1300, 'sb_jabW', 'sb_jab', { startup: 5, active: 8, recovery: 18, lunge: 34, knock: 'heavy', knockSpeed: 26, impact: 3, hitstun: 28, sfx: 'punchHeavy' }),
    },
    specials: {
      special1: {
        id: 'sbBlast', name: 'Innocence Cannon', type: 'projectile', kiCost: 30, icon: 'beam',
        startup: 16, recovery: 22, pose: { wind: 'sb_blastW', release: 'sb_blast' },
        projectile: { kind: 'ball', speed: 80, radius: 0.36, damage: 1600, homing: 0.4, color: 0xff6ab4, core: 0xffffff, explode: 2.2, knock: 'heavy', knockSpeed: 22, impact: 3, life: 1.6 },
      },
      special2: {
        id: 'sbArm', name: 'Rubber Grasp', type: 'stretchGrab', kiCost: 20, icon: 'rush', cooldown: 110,
        reach: 16, extendFrames: 10, pullFrames: 13, damage: 800, hitstunAfter: 34, recovery: 20, armLength: 0.46,
        poses: { wind: 'sb_blastW', reach: 'sb_blast' },
      },
    },
    majin: {
      gut: 0.7, // no belly to sink into any more: most of a blow lands
      holeHeal: 0.6,
      holeSeconds: 1.8,
      breakAt: [0.4, 0],
      reformTo: 0.8,
      reformSeconds: 2.2,
      maxReforms: 3,
      candyEat: { reach: 1.7, damage: 0.2, heal: 0.08 },
    },
    mechanic: { type: 'majinBody', name: 'Majin Body', desc: 'Wounds close while you watch; blown apart, he puts himself back together — faster than the fat one ever did.' },
    ai: { personality: 'elite', aggression: 0.8, defense: 0.55, ranged: 0.35, beam: 0.25, transformHp: 0, preferredRange: 2.2 },
    intro: { pose: 'sb_idle', expression: 'grin' },
    victory: { poses: ['sb_idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  SL.data.characters.kid_buu = {
    id: 'kid_buu',
    assetLevel: 1,
    name: 'Kid Buu',
    fullName: 'Kid Buu (Majin Buu, the original)',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Pure Chaos',
    blurb: 'The original, with nothing absorbed to slow him down: no plan, no mercy, no limit — and a scream for every trick.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 3 },
    stats: { hp: 40000, ki: 220, stamina: 240, speed: 1.35, power: 1.5, defense: 1.0, weight: 0.9, kiRegen: 4, chargeRate: 40, canonPower: 4.6 },
    poise: { max: 140, armor: 1, regen: 26, regenDelay: 60, breakFrames: 55, vulnerable: 1.25, beamMul: 1.15, cost: { 1: 8, 2: 14, 3: 24, 4: 40 } },
    appearance: {
      height: 0.8,
      skin: PINK,
      build: {
        // a child's frame: a big round head on narrow, wiry shoulders
        chestW: 0.18, chestD: 0.14, chestTop: 0.27, shoulderX: 0.18, delt: 0.058, waistW: 0.13, waistD: 0.105, pelvisW: 0.145,
        upperArmR: 0.046, foreArmR: 0.041, fist: 0.05, thighR: 0.072, shinR: 0.056, headR: 0.155, neckLen: 0.045, neckR: 0.055,
      },
      hair: { style: 'bald', color: PINK },
      headExtras: antenna(PINK, 1.05).concat(vents(0x6a2a4a)),
      face: { noEars: true, pupil: 0xc01830, sclera: 0x141418, eyeW: 1.15, eyeX: 0.047, browThick: 1.5, brow: 0x3a1a2a },
      outfit: {
        topStyle: 'bare', top: PINK, arms: PINK, pecs: PINK,
        pants: WHITE, pantsStyle: 'gi',
        belt: BELT, beltStyle: 'sash',
        boots: 0x1a1a22, bootTip: GOLD, bootStyle: 'saiyan',
      },
      portraitColor: '#f29ac0',
    },
    vfx: { ghost: 0xffb0d0, trail: 0xffc0dc },
    audio: { strikePitch: 1.15, heavyPitch: 0.95 },
    forms: [{ id: 'base', name: 'Kid', aura: { color: 0xff6ab4, core: 0xffe0f0, particles: 0xff9ad0, idle: 0, speed: 1.5, sharp: 0.5 }, mult: {} }],
    poses: Object.assign({ idle: poses.kb_idle, bu_laugh: poses.kb_laugh, bu_sit: poses.sb_sit }, poses),
    moves: {
      light: [
        move('kbJab', 760, 'kb_jabW', 'kb_jab', { startup: 4 }),
        move('kbClaw', 820, 'kb_jabW', 'kb_jab', { hitPose: 'hitSideR', startup: 4 }),
        move('kbKick', 940, 'kb_kickW', 'kb_kick', { reach: 1.4, knock: 'push', knockSpeed: 14, impact: 2 }),
      ],
      heavy: {
        0: move('kbHammer', 2100, 'hammerWind', 'hammer', { startup: 11, active: 5, recovery: 20, reach: 1.4, radius: 1.05, knock: 'smash', knockSpeed: 34, impact: 3, hitstun: 36, guardCrush: true, guardDamage: 50, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
        2: move('kbRise', 1500, 'uppercutWind', 'uppercut', { startup: 8, recovery: 18, knock: 'launch', knockSpeed: 22, impact: 3, hitstun: 32, sfx: 'punchHeavy' }),
      },
      dash: move('kbDash', 1300, 'kb_jabW', 'kb_jab', { startup: 4, active: 8, recovery: 16, lunge: 36, knock: 'heavy', knockSpeed: 26, impact: 3, hitstun: 28, sfx: 'punchHeavy' }),
    },
    specials: {
      // spat from the mouth, not thrown from a hand
      special1: {
        id: 'kbMouth', name: 'Mouth Blast', type: 'projectile', kiCost: 26, icon: 'beam', fromHead: true,
        startup: 14, recovery: 18, pose: { wind: 'kb_mouthW', release: 'kb_mouth' },
        projectile: { kind: 'ball', speed: 84, radius: 0.34, damage: 1500, homing: 0.35, color: 0xff6ab4, core: 0xffffff, explode: 2, knock: 'heavy', knockSpeed: 22, impact: 3, life: 1.5 },
      },
      special2: {
        id: 'kbArm', name: 'Rubber Grasp', type: 'stretchGrab', kiCost: 18, icon: 'rush', cooldown: 100,
        reach: 15, extendFrames: 9, pullFrames: 12, damage: 900, hitstunAfter: 32, recovery: 18, armLength: 0.36,
        poses: { wind: 'kb_mouthW', reach: 'kb_jab' },
      },
      // a small sun over his head, thrown down
      ultimate: {
        id: 'kbPlanet', name: 'Planet Burst', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 40, recovery: 34, pose: { wind: 'kb_burstUp', release: 'kb_mouth' },
        projectile: { kind: 'ball', speed: 34, radius: 1.6, damage: 5200, homing: 0.3, color: 0xff7ac8, core: 0xffffff, explode: 7, knock: 'smash', knockSpeed: 30, impact: 4, life: 3 },
      },
    },
    boss: {
      phases: [
        { id: 'wild', label: 'WILD', hpAbove: 0.5, speed: 1.1, damage: 1, patience: 0.7, patterns: { melee: 1, blast: 0.5, arm: 0.4 } },
        { id: 'frenzy', label: 'FRENZY', hpAbove: 0, speed: 1.2, damage: 1.15, patience: 0.45, line: 'kid_buu_taunt', patterns: { melee: 1.2, blast: 0.7, arm: 0.5, burst: 0.25 } },
      ],
      patterns: {
        blast: { slot: 'special1', minDist: 3, maxDist: 22, cooldown: 260, ranged: true },
        arm: { slot: 'special2', minDist: 4, maxDist: 14, cooldown: 240 },
        burst: { slot: 'ultimate', minDist: 8, cooldown: 900, ranged: true },
      },
      techniques: {},
    },
    majin: {
      gut: 0.8, // nothing soft to sink into
      holeHeal: 0.7,
      holeSeconds: 1.4,
      breakAt: [0.4, 0],
      reformTo: 0.75,
      reformSeconds: 1.6,
      maxReforms: 3,
      candyEat: { reach: 1.7, damage: 0.2, heal: 0.08 },
    },
    mechanic: { type: 'majinBody', name: 'Majin Body', desc: 'He grows back faster than anything you have fought — and every trick he pulls, he screams first.' },
    ai: { personality: 'berserker', aggression: 0.92, defense: 0.2, ranged: 0.35, beam: 0, transformHp: 0, preferredRange: 1.6, hooks: 'kid_buu' },
    barks: { hurt: 'kid_buu_hurt', taunt: 'kid_buu_taunt' },
    intro: { pose: 'kb_scream', expression: 'shout' },
    victory: { poses: ['kb_laugh'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---- the hunters: two men with rifles who came to shoot a monster ---- */
  const thug = SL.data.characters.city_thug;
  const gunPoses = {
    // the rifle at the shoulder, cheek on the stock
    gm_aimW: {
      root: { y: -0.04 }, spine: [4, -24, 0], chest: [2, -30, 0], head: [6, 26, 0],
      shoulderR: [-70, 0, -40], elbowR: [-100, 0, 0], shoulderL: [-84, 0, -10], elbowL: [-20, 0, 0],
      thighL: [-16, 0, 12], kneeL: [18, 0, 0], thighR: [10, 0, -12], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
    gm_aim: {
      root: { y: -0.05, rx: -4 }, spine: [0, -24, 0], chest: [-2, -30, 0], head: [6, 26, 0],
      shoulderR: [-64, 0, -44], elbowR: [-104, 0, 0], shoulderL: [-80, 0, -10], elbowL: [-18, 0, 0],
      thighL: [-16, 0, 12], kneeL: [18, 0, 0], thighR: [10, 0, -12], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
    gm_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: b * 0.006 }, spine: [4, 0, 0], chest: [2, 0, 0], head: [-2, b * 4, 0],
        shoulderR: [-30, 0, -20], elbowR: [-80, 0, 0], shoulderL: [-50, 0, 10], elbowL: [-70, 0, 0],
        thighL: [-4, 0, 12], kneeL: [8, 0, 0], thighR: [-4, 0, -12], kneeR: [8, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // backing away from something he should never have shot at
    gm_flee: (t) => {
      const b = Math.sin(t * 9);
      return {
        root: { y: -0.08, rx: -14 }, spine: [-12, 0, 0], chest: [-8, 0, 0], head: [-6, b * 10, 0],
        shoulderR: [-40, 0, -40], elbowR: [-60, 0, 0], shoulderL: [-110, 0, 40], elbowL: [-40, 0, 0],
        thighL: [-30 + b * 14, 0, 12], kneeL: [40, 0, 0], thighR: [-10 - b * 14, 0, -12], kneeR: [30, 0, 0],
        hands: ['open', 'fist'],
      };
    },
  };
  const hunter = (id, name, blurb, look) => Object.assign({}, thug, {
    id,
    name,
    fullName: name,
    blurb,
    stats: Object.assign({}, thug.stats, { hp: 1600 }),
    appearance: look,
    poses: Object.assign({}, thug.poses, gunPoses, { idle: gunPoses.gm_idle }),
    specials: {
      special1: {
        id: 'gmShot', name: 'Rifle', type: 'projectile', kiCost: 6, icon: 'ball',
        startup: 22, recovery: 30, pose: { wind: 'gm_aimW', release: 'gm_aim' },
        projectile: { kind: 'ball', speed: 88, radius: 0.16, damage: 170, homing: 0, color: 0xfff0b0, core: 0xffffff, explode: 0.4, knock: 'flinch', knockSpeed: 5, impact: 1, life: 1.4 },
      },
    },
    intro: { pose: 'gm_idle', expression: 'angry' },
    victory: { poses: ['gm_idle'], expression: 'grin' },
  });
  const cap = (color) => [
    { shape: 'ball', a: [0, 1, 0.1], d: [0, 1, 0.1], l: 0.085, r: 0.15, flat: 1, depth: 0.6, color, outline: 0.6 },
    { shape: 'ball', a: [0, 0.4, 0.92], d: [0, 1, -0.3], l: 0.012, r: 0.12, flat: 0.8, depth: 0.98, color, outline: 0.5 },
  ];
  // rot: measured so the barrel runs along the aim of gm_aim (the left hand sits under it)
  const RIFLE = { id: 'rifle', shape: 'rifle', joint: 'handR', pos: [0, -0.02, 0.02], rot: [0.1, -0.121, -1.761], length: 0.5 };
  SL.data.characters.gunman = hunter('gunman', 'Hunter', 'Came out to the wastes with a rifle and a story about a monster.', {
    height: 1.0,
    skin: 0xe0b890,
    build: { chestW: 0.2, chestD: 0.15, shoulderX: 0.21, waistW: 0.16, upperArmR: 0.05, foreArmR: 0.044, fist: 0.05, thighR: 0.084, shinR: 0.066, headR: 0.14, neckLen: 0.06 },
    hair: { style: 'cropped', color: 0x3a2a1a },
    headExtras: cap(0x5a6a3a),
    face: { pupil: 0x1a1a1a, eyeW: 0.85, browThick: 1.3 },
    outfit: {
      topStyle: 'gi', top: 0x5a6a3a, sleeves: 'long', sleeveColor: 0x5a6a3a, wrist: 0x3a4424,
      belt: 0x3a2a1a, pants: 0x8a7a58, pantsStyle: 'gi', boots: 0x4a3222, bootStyle: 'gi',
    },
    props: [RIFLE],
    portraitColor: '#5a6a3a',
  });
  SL.data.characters.gunman_b = hunter('gunman_b', 'Hunter', 'The one with the beard, and the second rifle.', {
    height: 0.96,
    skin: 0xd8a47a,
    build: { chestW: 0.25, chestD: 0.19, shoulderX: 0.245, waistW: 0.22, waistD: 0.18, upperArmR: 0.064, foreArmR: 0.056, fist: 0.058, thighR: 0.1, shinR: 0.078, headR: 0.15, neckLen: 0.04 },
    hair: { style: 'cropped', color: 0x2a1a12 },
    headExtras: cap(0xb05a2a).concat([
      // the beard
      { shape: 'ball', a: [0, -0.62, 0.72], d: [0, -0.4, 1], l: 0.08, r: 0.1, flat: 0.8, depth: 0.96, color: 0x2a1a12, outline: 0.4 },
    ]),
    face: { pupil: 0x1a1a1a, eyeW: 0.8, browThick: 1.6 },
    outfit: {
      topStyle: 'gi', top: 0x7a4a2a, sleeves: 'short', sleeveColor: 0x7a4a2a, arms: 0xd8a47a, wrist: 0x4a2a18,
      belt: 0x2a1a12, pants: 0x4a5040, pantsStyle: 'gi', boots: 0x3a2a1a, bootStyle: 'gi',
    },
    props: [RIFLE],
    portraitColor: '#7a4a2a',
  });

  /* ---- Bee: the puppy Buu saves (a creature, not a fighter: SL.Creature) ---- */
  const U = SL.util, V3 = THREE.Vector3;
  const CREAM = 0xf0e4cc, TAN = 0x9a6436, INK = 0x16120e;
  function beeBuild(c) {
    const T = SL.Toon;
    const sphere = new THREE.SphereGeometry(1, 16, 12), cyl = new THREE.CylinderGeometry(1, 1, 1, 8), cone = new THREE.ConeGeometry(1, 1, 8);
    c.geos = [sphere, cyl, cone];
    const mats = {};
    const mat = (col) => mats[col] || (mats[col] = T.makeMat(col, { rim: { color: 0xfff4e0, strength: 0.25 } }));
    const part = (parent, geo, col, pos, scale, rot, outline = 1.4) => {
      const m = new THREE.Mesh(geo, mat(col));
      m.position.set(pos[0], pos[1], pos[2]);
      m.scale.set(scale[0], scale[1], scale[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = true;
      if (outline) T.addOutline(m, outline);
      parent.add(m);
      return m;
    };
    const root = new THREE.Group();
    const body = new THREE.Group();
    body.position.y = 0.25;
    root.add(body);
    part(body, sphere, CREAM, [0, 0, 0], [0.12, 0.11, 0.2]);
    part(body, sphere, TAN, [0.05, 0.05, -0.04], [0.07, 0.06, 0.09], null, 0);
    const head = new THREE.Group();
    head.position.set(0, 0.12, 0.19);
    body.add(head);
    part(head, sphere, CREAM, [0, 0, 0], [0.095, 0.09, 0.09]);
    part(head, sphere, CREAM, [0, -0.03, 0.08], [0.052, 0.045, 0.06]);
    part(head, sphere, INK, [0, -0.012, 0.138], [0.02, 0.016, 0.014], null, 0);
    c.ears = [];
    for (const sx of [1, -1]) {
      part(head, sphere, INK, [sx * 0.04, 0.02, 0.078], [0.014, 0.017, 0.01], null, 0);
      const ear = new THREE.Group();
      ear.position.set(sx * 0.07, 0.05, -0.005);
      head.add(ear);
      part(ear, sphere, TAN, [sx * 0.02, -0.045, 0], [0.032, 0.065, 0.02], [0, 0, sx * 0.3], 0.8);
      c.ears.push({ g: ear, side: sx });
    }
    c.head = head;
    c.legs = [];
    for (const [x, z] of [[0.07, 0.12], [-0.07, 0.12], [0.07, -0.12], [-0.07, -0.12]]) {
      const leg = new THREE.Group();
      leg.position.set(x, -0.04, z);
      body.add(leg);
      part(leg, cyl, CREAM, [0, -0.09, 0], [0.028, 0.18, 0.028], null, 1);
      part(leg, sphere, CREAM, [0, -0.18, 0.015], [0.034, 0.024, 0.042], null, 0.8);
      c.legs.push({ g: leg, front: z > 0, side: x > 0 ? 1 : -1 });
    }
    const tail = new THREE.Group();
    tail.position.set(0, 0.06, -0.19);
    body.add(tail);
    part(tail, cone, TAN, [0, 0.07, -0.02], [0.022, 0.15, 0.022], [-0.4, 0, 0], 0.8);
    c.tailG = tail;
    c.body = body;
    return root;
  }
  const CREATURES = (SL.data.creatures = SL.data.creatures || {});
  /**
   * Bee's states (setState): 'follow' { follow: fighter } trots after somebody; 'run' { to: V3 }
   * goes somewhere fast; 'stay'; 'wag' (happy: hops, tail going); 'hurt' (on his side, whimpering);
   * 'held' { by: fighter } carried against somebody's chest.
   */
  CREATURES.bee = {
    id: 'bee',
    name: 'Bee',
    build: beeBuild,
    scale: 1,
    radius: 0.2,
    height: 0.4,
    update(c) {
      const b = c.battle, st = b.stage, TICK = SL.TICK;
      let goal = null, speed = 0;
      c.vel.set(0, 0, 0);
      if (c.state === 'held' && c.sd.by) {
        const f = c.sd.by;
        const p = f.chest().addScaledVector(f.forward.clone().setY(0).normalize(), f.radius * 0.9 + 0.1);
        p.y -= 0.34;
        c.pos.copy(p);
        c.yaw = f.yaw + Math.PI / 2;
        c.tilt = 0;
        return;
      }
      if (c.state === 'follow' && c.sd.follow) {
        const f = c.sd.follow;
        const fwd = f.forward.clone().setY(0).normalize();
        const right = new V3(-fwd.z, 0, fwd.x);
        goal = f.pos.clone().addScaledVector(right, f.radius + 0.5).addScaledVector(fwd, -0.2);
        speed = 5;
      } else if (c.state === 'run' && c.sd.to) {
        goal = c.sd.to;
        speed = 7;
      }
      if (goal) {
        const to = goal.clone().sub(c.pos).setY(0);
        const d = to.length();
        if (d > 0.25) {
          c.vel.copy(to.multiplyScalar(Math.min(speed, d * 4) / d));
          c.pos.addScaledVector(c.vel, TICK);
          c.yaw = U.dampAngle(c.yaw, Math.atan2(c.vel.x, c.vel.z), 10, TICK);
        } else if (c.state === 'run') c.setState('stay', {});
      }
      if (st.hasGround) c.pos.y = st.heightAt(c.pos.x, c.pos.z);
      c.tilt = U.lerp(c.tilt, c.state === 'hurt' ? Math.PI / 2 * 0.92 : 0, 0.12);
    },
    render(c, dt) {
      const t = performance.now() / 1000;
      const hs = Math.hypot(c.vel.x, c.vel.z);
      c.phase += hs * dt * 9;
      const run = U.clamp01(hs / 4);
      for (const L of c.legs) {
        const s = Math.sin(c.phase + (L.front ? 0 : Math.PI) + (L.side > 0 ? 0 : Math.PI * 0.5));
        L.g.rotation.x = c.state === 'hurt' ? 0.5 : s * 0.7 * run;
      }
      const wag = c.state === 'wag' ? 26 : c.state === 'hurt' ? 1.5 : 9;
      c.tailG.rotation.y = Math.sin(t * wag) * (c.state === 'hurt' ? 0.1 : 0.6);
      c.tailG.rotation.x = c.state === 'hurt' ? 0.6 : 0;
      const hop = c.state === 'wag' ? Math.abs(Math.sin(t * 7)) * 0.07 : Math.abs(Math.sin(c.phase)) * 0.02 * run;
      c.body.position.y = 0.25 + hop;
      c.head.rotation.x = c.state === 'hurt' ? 0.2 : c.state === 'wag' ? -0.25 : Math.sin(t * 1.3) * 0.08;
      for (const e of c.ears) e.g.rotation.z = e.side * (c.state === 'wag' ? 0.3 + Math.sin(t * 14) * 0.2 : 0.05);
    },
  };
})();
