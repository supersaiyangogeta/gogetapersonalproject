/*
 * CHI-CHI (Android Saga, Age 767) — Goku's wife, Gohan's mother, and the person
 * in the story who is never surprised that the fight came home hurt.
 *
 * Story only. She does not fight in this build: she exists for the scene at
 * Goku's bedside while the heart virus has him (`goku_bed`, mission
 * `android_fever`), so her data carries body language rather than a moveset.
 * The schema still asks every character for a minimal kit, so she has one
 * (a slap and a shove), but no mission puts her in a fight.
 *
 * Level 1 functional prototype, story only.
 */
(function () {
  'use strict';

  const poses = {
    cc_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.01 + b * 0.006 },
        hips: [0, -4, 0], spine: [2, 0, 0], chest: [2, 4, 0], head: [-2, -4, 0],
        shoulderL: [-8, 0, 12], elbowL: [-20, 0, 0], shoulderR: [-8, 0, -12], elbowR: [-20, 0, 0],
        thighL: [-4, 2, 6], kneeL: [6, 0, 0], thighR: [4, -2, -6], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // hands clasped under the chin: the waiting
    cc_worried: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.02 + b * 0.004 },
        hips: [0, 0, 0], spine: [6, 0, 0], chest: [8, 0, 0], neck: [6, 0, 0], head: [12 + b * 1.5, 0, 0],
        shoulderL: [-58, 0, -14], elbowL: [-128, 0, 0], shoulderR: [-58, 0, 14], elbowR: [-128, 0, 0],
        thighL: [-4, 0, 6], kneeL: [8, 0, 0], thighR: [4, 0, -6], kneeR: [8, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // sitting on the stool at the bedside, leaning in, one hand reaching for his
    cc_bedside: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.46, rx: 10 },
        hips: [0, 0, 0], spine: [14, 0, 0], chest: [10, -10, 0], neck: [8, 0, 0], head: [14 + b * 1.2, 12, 0],
        shoulderL: [-40, 0, 10], elbowL: [-70, 0, 0], shoulderR: [-70, 0, -8], elbowR: [-30, 0, 0],
        thighL: [-88, 4, 8], kneeL: [92, 0, 0], thighR: [-88, -4, -8], kneeR: [92, 0, 0],
        hands: ['open', 'open'],
      };
    },
    cc_slapW: {
      root: { y: -0.02 }, chest: [2, -20, 0], head: [-2, 12, 0],
      shoulderR: [-40, 0, -70], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 8], kneeL: [14, 0, 0], thighR: [8, 0, -8], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    cc_slap: {
      root: { y: -0.03 }, chest: [4, 24, 0], head: [-2, -14, 0],
      shoulderR: [-86, 0, 20], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-40, 0, 0],
      thighL: [-16, 0, 8], kneeL: [18, 0, 0], thighR: [10, 0, -8], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.chichi = {
    id: 'chichi',
    assetLevel: 1,
    name: 'Chi-Chi',
    fullName: 'Chi-Chi',
    era: 'Android Saga',
    playable: false,
    prototype: true,
    style: 'Family',
    blurb: 'She married a man who keeps leaving to save the world, and she has opinions about it.',
    ratings: { power: 1, speed: 2, ki: 1, defense: 1 },
    stats: { hp: 6000, ki: 40, stamina: 80, speed: 0.95, power: 0.6, defense: 0.7, weight: 0.8, kiRegen: 1, chargeRate: 10, canonPower: 0.01 },
    // (2026-10-16, the owner's collage — her with Goku at home: a purple dress over a pink long-sleeved shirt and pink
    // trousers. She wore a plain purple gi, a man's build with a big head, and a ragged short cap; now a grown woman's
    // build — the one young Chi-Chi grows into at the 23rd World Tournament (wardrobe profile young_chichi) — and her
    // own hair: drawn back into a bun with a gold band, parted, with a lock by each cheek)
    appearance: {
      height: 0.9,
      skin: 0xf6d2b0,
      build: {
        chestW: 0.174, chestD: 0.124, chestTop: 0.27, shoulderX: 0.174, shoulderY: 0.22, delt: 0.055, waistW: 0.11, waistD: 0.09, absLen: 0.19,
        pelvisW: 0.15, pelvisH: 0.11, pelvisD: 0.12, hipX: 0.086, upperArmR: 0.04, foreArmR: 0.035, fist: 0.043, thighR: 0.076, shinR: 0.055,
        neckR: 0.042, neckLen: 0.068, headR: 0.124, footLen: 0.85, bustShape: 1,
      },
      hair: { style: 'chichi_bun', color: 0x121216 },
      // the bun high on the back of the head, and the gold band round its base
      headExtras: [
        { shape: 'ball', a: [0, 0.62, -0.78], d: [0, 0.62, -0.78], l: 0.082, r: 0.088, flat: 0.92, depth: 1.22, color: 0x121216 },
        { shape: 'cyl', a: [0, 0.62, -0.78], d: [0, 0.62, -0.78], l: 0.028, r: 0.088, flat: 1, depth: 1.0, color: 0xe0b030 },
      ],
      face: { pupil: 0x141414, eyeW: 1.08, eyeH: 1.1, lashWing: true, browThick: 0.75, jaw: 0.92, jawW: 0.9, cheeks: 0, nose: 0.7 },
      // the dress: purple, a standing collar, sleeveless over the pink shirt's long sleeves, gold cuffs and sash; the
      // skirt to the shins, open at the sides over the pink trousers
      outfit: {
        topStyle: 'shirt', top: 0x6a3c9c, collar: 0x6a3c9c, collarStyle: 'turtle',
        sleeves: 'long', sleeveColor: 0xf2a6c8, wrist: 0xe0b030,
        belt: 0xe0b030, beltStyle: 'sash',
        hem: { color: 0x6a3c9c, len: 0.66, flare: 1.18, arc: 2.2 },
        pants: 0xf2a6c8, pantsStyle: 'gi', boots: 0x3a2440, bootStyle: 'shoe',
      },
      portraitColor: '#6a3c9c',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: poses.cc_idle }, poses),
    moves: {
      light: [
        { id: 'ccSlap', startup: 6, active: 3, recovery: 14, cancel: 8, damage: 120, reach: 1, radius: 0.6, lunge: 6, hitstun: 12, knock: 'flinch', impact: 1, pose: { wind: 'cc_slapW', strike: 'cc_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'ccShove', startup: 10, active: 3, recovery: 20, damage: 200, reach: 1, radius: 0.7, lunge: 6, hitstun: 16, knock: 'push', knockSpeed: 8, impact: 1, pose: { wind: 'cc_slapW', strike: 'cc_slap' }, sfx: 'punchLight', hitPose: 'hitBody' },
      },
      dash: { id: 'ccRush', startup: 8, active: 4, recovery: 18, damage: 150, reach: 1, radius: 0.7, lunge: 12, hitstun: 12, knock: 'flinch', impact: 1, pose: { wind: 'cc_slapW', strike: 'cc_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.2, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'cc_worried', expression: 'hurt' },
    victory: { poses: ['cc_idle'], expression: 'calm' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
