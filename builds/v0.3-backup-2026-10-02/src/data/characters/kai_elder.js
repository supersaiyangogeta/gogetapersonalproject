/*
 * THE OLD KAI (Buu Saga, Age 774): the Supreme Kai of fifteen generations ago, sealed in the Z Sword
 * by a Kai who feared him, and let out when Gohan breaks it. Tiny, ancient, lavender-skinned and
 * wrinkled, a white crest of hair and a long white beard, the Potara in his ears, a Kai's clothes
 * that have been out of fashion for seventy-five million years. Rude, vain, lazy, and the only
 * one who can draw out everything a fighter has.
 *
 * Level 1 functional prototype; story only (not a fighter).
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const SKIN = 0xb9a2cc, WHITE = 0xf2f0ea;
  // the long white beard, the big nose, the wrinkles painted on the brow
  const FACE = [
    { shape: 'ball', a: [0, -0.72, 0.62], d: [0, -1, 0.35], l: 0.12, r: 0.075, flat: 0.8, depth: 1.0, color: WHITE, outline: 0.5 },
    { shape: 'ball', a: [0, -0.1, 1], d: [0, -0.3, 1], l: 0.04, r: 0.032, flat: 1, depth: 1.02, color: SKIN, outline: 0.5 },
    { shape: 'line', a: [0, 0.34, 0.95], d: [1, 0, 0], l: 0.08, r: 0.006, depth: 1.004, color: 0x7a6488 },
    { shape: 'line', a: [0, 0.44, 0.9], d: [1, 0, 0], l: 0.07, r: 0.006, depth: 1.004, color: 0x7a6488 },
  ];
  // the Potara in his ears (he gives them to Goku: the form 'bare' is him without them)
  const EARRINGS = [
    { shape: 'ball', a: [0.98, -0.25, 0.05], d: [0, -1, 0], l: 0.024, r: 0.024, flat: 1, depth: 1.08, color: 0x3ab85a, outline: 0.5 },
    { shape: 'ball', a: [-0.98, -0.25, 0.05], d: [0, -1, 0], l: 0.024, r: 0.024, flat: 1, depth: 1.08, color: 0x3ab85a, outline: 0.5 },
  ];

  const poses = {
    // bent over, hands clasped behind his back
    ek_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: -0.05 + b * 0.004, rx: 16 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-22, b * 4, 0],
        shoulderL: [28, 0, 24], elbowL: [-70, 0, 0], shoulderR: [28, 0, -24], elbowR: [-70, 0, 0],
        thighL: [-6, 0, 12], kneeL: [16, 0, 0], thighR: [-6, 0, -12], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the ritual: arms up and swaying, a shuffle round the boy (two alternating shapes)
    ek_ritualA: (t) => {
      const b = Math.sin(t * 4);
      return {
        root: { y: -0.04 + Math.abs(b) * 0.02, rx: 6 }, spine: [6, b * 14, b * 6], chest: [4, b * 10, 0], head: [-10, -b * 12, 0],
        shoulderL: [-150, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-150, 0, -40], elbowR: [-40, 0, 0],
        thighL: [-24 - b * 10, 0, 14], kneeL: [30, 0, 0], thighR: [-6 + b * 10, 0, -14], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    ek_ritualB: (t) => {
      const b = Math.sin(t * 4);
      return {
        root: { y: -0.1 + Math.abs(b) * 0.02, rx: 12 }, spine: [12, -b * 16, -b * 6], chest: [8, -b * 12, 0], head: [-6, b * 12, 0],
        shoulderL: [-80, 0, 70], elbowL: [-20, 0, 0], shoulderR: [-80, 0, -70], elbowR: [-20, 0, 0],
        thighL: [-40, 0, 20], kneeL: [60, 0, 0], thighR: [-40, 0, -20], kneeR: [60, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // sitting on the grass, hands on his knees, nodding off
    ek_sit: (t) => {
      const b = Math.sin(t * 0.8);
      return {
        root: { y: -0.4 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [18 + b * 8, 0, b * 4],
        shoulderL: [-30, 0, 16], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -16], elbowR: [-40, 0, 0],
        thighL: [-84, 30, 36], kneeL: [124, 0, 0], thighR: [-84, -30, -36], kneeR: [124, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // one bony finger at somebody
    ek_point: {
      root: { y: -0.04, rx: 10 }, spine: [10, 0, 0], chest: [6, -8, 0], head: [-14, 8, 0],
      shoulderR: [-86, 0, -6], elbowR: [-4, 0, 0], shoulderL: [28, 0, 24], elbowL: [-70, 0, 0],
      thighL: [-6, 0, 12], kneeL: [16, 0, 0], thighR: [-6, 0, -12], kneeR: [16, 0, 0],
      hands: ['open', 'point'],
    },
    // both palms out over a sitting fighter: the unlocking
    ek_palms: (t) => {
      const b = Math.sin(t * 9) * 2;
      return {
        root: { y: -0.04, rx: 10 }, spine: [12, 0, 0], chest: [8, 0, 0], head: [8, 0, 0],
        shoulderL: [-72 + b, 0, 18], elbowL: [-14, 0, 0], shoulderR: [-72 - b, 0, -18], elbowR: [-14, 0, 0],
        thighL: [-14, 0, 14], kneeL: [22, 0, 0], thighR: [-14, 0, -14], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  SL.data.characters.elder_kai = {
    id: 'elder_kai',
    assetLevel: 1,
    name: 'Old Kai',
    fullName: 'The Old Kai (Supreme Kai of fifteen generations ago)',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Ancient',
    blurb: 'Sealed in a sword for seventy-five million years for being a nuisance. He would like some magazines.',
    ratings: { power: 1, speed: 1, ki: 5, defense: 1 },
    stats: { hp: 8000, ki: 200, stamina: 60, speed: 0.6, power: 0.3, defense: 0.6, weight: 0.6, kiRegen: 2, chargeRate: 10, canonPower: 0.5 },
    appearance: {
      height: 0.6,
      skin: SKIN,
      build: { chestW: 0.16, chestD: 0.12, shoulderX: 0.16, waistW: 0.14, upperArmR: 0.038, foreArmR: 0.034, fist: 0.04, thighR: 0.06, shinR: 0.048, headR: 0.16, neckLen: 0.03 },
      hair: { style: 'kai_mohawk', color: WHITE },
      headExtras: FACE.concat(EARRINGS),
      face: { pupil: 0x141414, eyeW: 0.7, pointedEars: true, brow: WHITE, browThick: 1.6 },
      outfit: {
        topStyle: 'gi', top: 0x6a90c8, sleeves: 'long', sleeveColor: 0x6a90c8, under: 0xe8e4dc, wrist: 0xe8e4dc,
        belt: 0xe0a830, beltStyle: 'sash', pants: 0xe8e4dc, pantsStyle: 'gi', boots: 0x5a3a4a, bootStyle: 'gi',
      },
      portraitColor: '#6a90c8',
    },
    vfx: { ghost: 0xe0d8ff },
    audio: { strikePitch: 1.2, heavyPitch: 1.1 },
    flight: false,
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xf2f0ea, core: 0xffffff, particles: 0xe0d8ff }, mult: {} },
      // story state: the earrings taken off and handed to Goku
      { id: 'bare', name: 'Base', storyLocked: true, noCost: true, aura: { color: 0xf2f0ea, core: 0xffffff, particles: 0xe0d8ff }, mult: {}, look: { headExtras: FACE } },
    ],
    poses: Object.assign({ idle: poses.ek_idle }, poses),
    moves: {
      light: [{ id: 'ekPoke', startup: 8, active: 3, recovery: 14, cancel: 9, damage: 60, reach: 0.9, radius: 0.6, lunge: 6, hitstun: 12, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' }],
      heavy: { 0: { id: 'ekCane', startup: 14, active: 3, recovery: 22, damage: 120, reach: 1, radius: 0.7, lunge: 6, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' } },
      dash: { id: 'ekShuffle', startup: 10, active: 3, recovery: 20, damage: 60, reach: 0.9, radius: 0.6, lunge: 8, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.1, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'ek_idle', expression: 'calm' },
    victory: { poses: ['ek_point'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
