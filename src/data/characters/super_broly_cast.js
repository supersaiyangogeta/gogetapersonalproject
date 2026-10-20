/*
 * MOVIE 2 · SUPER BROLY — the people round Broly. Story cast (not playable), Level 1 functional prototypes.
 *
 *   PARAGUS  Broly's father: a tall, lean old Saiyan in worn dark battle armour and a ragged cloak, a scar
 *            down through his left eye, a short dark beard; the REMOTE for Broly's collar in his right hand.
 *            Built from memory and the owner's written notes — approximate.
 *   CHEELAI  a Frieza Force deserter: small, light-green skin, a short white bob, big eyes, the purple Frieza
 *            Force suit with a white chest plate, white gloves and boots. The owner's collage shows her once
 *            (in the chair) — silhouette and colours follow it.
 *   LEMO     her partner: short, stocky, older, a big nose, a tired face, the old Frieza Force armour.
 *            No reference reached the session — built from memory, approximate.
 */
(function () {
  'use strict';

  /* ======================================================================== PARAGUS */
  const PG_SKIN = 0xe8b890, PG_HAIR = 0x1c1a1e, PG_ARMOR = 0x34343a, PG_TRIM = 0x4a4a52, PG_SUIT = 0x24222a, PG_CLOAK = 0x4a3a2c;
  const pg = {
    // upright, the remote held at his side, the head high: a man who has decided everything already
    pg_idle: (t) => {
      const b = Math.sin(t * 1.3);
      return {
        root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-4 + b * 0.6, 0, 0], head: [-4, 0, 0],
        shoulderL: [-4, 0, 9], elbowL: [-14, 0, 0], shoulderR: [-30, 0, -10], elbowR: [-70, 0, 0], handR: [-10, 0, 0],
        thighL: [-2, 0, 8], kneeL: [3, 0, 0], thighR: [-2, 0, -8], kneeR: [3, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the remote raised in front of him, the thumb on the button
    pg_remote: (t) => {
      const s = Math.sin(t * 3) * 1.2;
      return {
        root: { y: 0 }, spine: [2, 0, 0], chest: [0, -6, 0], head: [8, 6, 0],
        shoulderR: [-52 + s, 14, -12], elbowR: [-70, 0, 0], handR: [-30, 0, 0], shoulderL: [-6, 0, 12], elbowL: [-18, 0, 0],
        thighL: [-4, 4, 10], kneeL: [6, 0, 0], thighR: [2, -4, -8], kneeR: [4, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // pointing his son at the enemy
    pg_point: { root: { y: 0 }, spine: [4, -10, 0], chest: [2, -14, 0], head: [-4, 10, 0], shoulderL: [-88, -10, 4], elbowL: [-4, 0, 0], shoulderR: [-30, 0, -10], elbowR: [-70, 0, 0], thighL: [-14, 6, 10], kneeL: [12, 0, 0], thighR: [6, -6, -10], kneeR: [6, 0, 0], hands: ['point', 'fist'] },
    // shouting at him, leaning in, the free fist shaking
    pg_shout: (t) => {
      const s = Math.sin(t * 20) * 3;
      return { root: { y: -0.02, rx: 8 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-12, 0, 0], shoulderL: [-40 + s, 0, 26], elbowL: [-90, 0, 0], shoulderR: [-60, 0, -14], elbowR: [-60, 0, 0], thighL: [-18, 4, 10], kneeL: [16, 0, 0], thighR: [6, -4, -10], kneeR: [8, 0, 0], hands: ['fist', 'fist'] };
    },
    // a step back, the remote held up as if it could protect him
    pg_afraid: (t) => {
      const s = Math.sin(t * 24) * 1.5;
      return { root: { y: -0.04, rx: -8 }, spine: [-8, 0, 0], chest: [-8, 0, s], head: [6, 0, 0], shoulderR: [-100, 10, -20], elbowR: [-80, 0, 0], shoulderL: [-60, 0, 30], elbowL: [-60, 0, 0], thighL: [8, 0, 10], kneeL: [16, 0, 0], thighR: [-20, 0, -10], kneeR: [20, 0, 0], hands: ['open', 'fist'] };
    },
  };
  SL.data.characters.paragus = {
    id: 'paragus', assetLevel: 1, name: 'Paragus', fullName: 'Paragus (Broly\'s father)', era: 'Movie',
    playable: false, prototype: true, style: 'Saiyan Exile',
    blurb: 'He followed his son into exile and spent forty years turning him into a weapon for a revenge only he still wants.',
    stats: { hp: 9000, ki: 80, stamina: 100, speed: 0.9, power: 0.8, defense: 0.8, weight: 1, kiRegen: 1.5, chargeRate: 24, canonPower: 0.5 },
    appearance: {
      height: 1.04, skin: PG_SKIN,
      build: { chestW: 0.2, chestD: 0.13, shoulderX: 0.205, waistW: 0.13, upperArmR: 0.056, foreArmR: 0.048, thighR: 0.082, shinR: 0.062, headR: 0.118, neckLen: 0.07 },
      hair: { style: 'paragus', color: PG_HAIR },
      headExtras: [
        // a short dark beard along the jaw and a moustache
        { shape: 'ball', a: [0, -0.86, 0.5], d: [0, -1, 0.35], l: 0.03, r: 0.042, color: PG_HAIR, depth: 0.9, flat: 0.6, outline: 0.3 },
        { shape: 'ball', a: [0.18, -0.42, 0.9], d: [1, -0.4, 0.1], l: 0.035, r: 0.012, color: PG_HAIR, depth: 0.99, flat: 0.7, outline: 0.2 },
        { shape: 'ball', a: [-0.18, -0.42, 0.9], d: [-1, -0.4, 0.1], l: 0.035, r: 0.012, color: PG_HAIR, depth: 0.99, flat: 0.7, outline: 0.2 },
        // the old scar down through the left eye
        { shape: 'line', a: [0.4, 0.58, 0.72], d: [0.08, -1, 0.1], l: 0.085, r: 0.007, flat: 0.25, depth: 1.006, color: 0x9a4a40 },
      ],
      face: { pupil: 0x141414, eyeW: 0.9, eyeH: 0.82, browThick: 1.4, brow: PG_HAIR, jaw: 1.1, jawW: 0.96, cheeks: 0.5 },
      outfit: {
        topStyle: 'armor', top: PG_SUIT, arms: PG_SUIT, sleeves: 'long', sleeveColor: PG_SUIT,
        armor: { plate: PG_ARMOR, belly: PG_ARMOR, pads: PG_TRIM, padStyle: 'flap', hipGuards: PG_TRIM, hipStyle: 'long', trim: PG_TRIM },
        cape: PG_CLOAK,
        pants: PG_SUIT, pantsStyle: 'tight',
        gloves: 0xd8d4c8, boots: 0xd8d4c8, bootTip: PG_TRIM, bootStyle: 'saiyan',
      },
      props: [{ id: 'remote', shape: 'box', joint: 'handR', pos: [0, -0.02, 0.02], size: [0.05, 0.09, 0.022], color: 0x3a3e46 }],
      portraitColor: '#4a3a2c',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xe8e0d0 }, mult: {} }],
    poses: Object.assign({ idle: pg.pg_idle }, pg),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'pg_idle', expression: 'cold' },
  };

  /* ======================================================================== CHEELAI */
  const CH_SKIN = 0x9ad8a0, CH_HAIR = 0xf4f4f8, CH_SUIT = 0x4a2c6a, CH_PLATE = 0xf0eef4, CH_TRIM = 0x8a6ab8;
  const ch = {
    // weight on one hip, a hand on it: cocky, quick, never still for long
    ch_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: b * 0.004 }, hips: [0, -8, 6], spine: [-2, 6, -2], chest: [-4, 6, 0], head: [-2, -8, 6],
        shoulderL: [-14, 0, 50], elbowL: [-100, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-16, 0, 0],
        thighL: [-2, 4, 8], kneeL: [6, 0, 0], thighR: [4, -8, -12], kneeR: [14, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // watching something she cannot do anything about: both hands at her chest
    ch_watch: (t) => {
      const s = Math.sin(t * 6) * 1.2;
      return {
        root: { y: 0 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [-4, 0, s],
        shoulderL: [-50, -30, 20], elbowL: [-110, 0, 0], shoulderR: [-50, 30, -20], elbowR: [-110, 0, 0],
        thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // shocked: a step back, hands up
    ch_shock: { root: { y: -0.02, rx: -8 }, spine: [-8, 0, 0], chest: [-8, 0, 0], head: [-6, 0, 0], shoulderL: [-100, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-100, 0, -30], elbowR: [-60, 0, 0], thighL: [10, 0, 10], kneeL: [16, 0, 0], thighR: [-16, 0, -10], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    ch_point: { root: { y: 0 }, spine: [2, -10, 0], chest: [0, -14, 0], head: [-4, 10, 0], shoulderL: [-90, -10, 4], elbowL: [-4, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-30, 0, 0], thighL: [-10, 6, 10], kneeL: [10, 0, 0], thighR: [4, -6, -10], kneeR: [6, 0, 0], hands: ['point', 'open'] },
  };
  SL.data.characters.cheelai = {
    id: 'cheelai', assetLevel: 1, name: 'Cheelai', fullName: 'Cheelai (Frieza Force)', era: 'Movie',
    playable: false, prototype: true, style: 'Deserter',
    blurb: 'She stole a ride off a planet she had to leave in a hurry, and found the only person in Frieza\'s army who never wanted to hurt anybody.',
    stats: { hp: 3000, ki: 60, stamina: 100, speed: 1.1, power: 0.4, defense: 0.5, weight: 0.7, kiRegen: 1, chargeRate: 20, canonPower: 0.1 },
    flight: false,
    appearance: {
      height: 0.8, skin: CH_SKIN,
      build: { chestW: 0.16, chestD: 0.11, shoulderX: 0.165, waistW: 0.1, waistD: 0.09, pelvisW: 0.13, upperArmR: 0.04, foreArmR: 0.035, fist: 0.04, thighR: 0.068, shinR: 0.05, headR: 0.13, neckR: 0.04 },
      hair: { style: 'videl_bob', color: CH_HAIR },
      face: { pupil: 0xc0407a, eyeW: 1.12, eyeH: 1.15, lashWing: true, browThick: 0.8, brow: 0xd8d8e0, jaw: 0.94, cheeks: 1.1 },
      outfit: {
        topStyle: 'armor', top: CH_SUIT, arms: CH_SUIT, sleeves: 'long', sleeveColor: CH_SUIT,
        armor: { plate: CH_PLATE, belly: CH_SUIT, pads: CH_TRIM, padStyle: 'strap', trim: CH_TRIM },
        pants: CH_SUIT, pantsStyle: 'tight',
        gloves: 0xf4f4f8, boots: 0xf4f4f8, bootTip: CH_TRIM, bootStyle: 'saiyan',
      },
      portraitColor: '#4a2c6a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: ch.ch_idle }, ch),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'ch_idle', expression: 'smirk' },
  };

  /* ======================================================================== LEMO */
  const LE_SKIN = 0xc89a72, LE_SUIT = 0x2e3a2a, LE_PLATE = 0xd8d0b8, LE_TRIM = 0x6a7a4a;
  const le = {
    // hands behind his back, the weight back on his heels: he has seen everything and liked little of it
    le_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: b * 0.003 }, spine: [-4, 0, 0], chest: [-4 + b, 0, 0], head: [2, 0, 0],
        shoulderL: [24, 0, 16], elbowL: [-60, 0, 0], shoulderR: [24, 0, -16], elbowR: [-60, 0, 0],
        thighL: [-2, 0, 10], kneeL: [4, 0, 0], thighR: [-2, 0, -10], kneeR: [4, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    le_watch: (t) => {
      const s = Math.sin(t * 5) * 1;
      return { root: { y: -0.02, rx: 6 }, spine: [8, 0, 0], chest: [6, 0, s], head: [-8, 0, 0], shoulderL: [-40, 0, 26], elbowL: [-70, 0, 0], shoulderR: [-40, 0, -26], elbowR: [-70, 0, 0], thighL: [-12, 0, 12], kneeL: [14, 0, 0], thighR: [-12, 0, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] };
    },
  };
  SL.data.characters.lemo = {
    id: 'lemo', assetLevel: 1, name: 'Lemo', fullName: 'Lemo (Frieza Force)', era: 'Movie',
    playable: false, prototype: true, style: 'Old Soldier',
    blurb: 'A Frieza Force veteran who signed up for the pay and the pension, and keeps an eye on the girl who saved his ship.',
    stats: { hp: 3000, ki: 60, stamina: 100, speed: 0.8, power: 0.4, defense: 0.6, weight: 1.1, kiRegen: 1, chargeRate: 20, canonPower: 0.1 },
    flight: false,
    appearance: {
      height: 0.74, skin: LE_SKIN,
      build: { chestW: 0.2, chestD: 0.16, shoulderX: 0.19, waistW: 0.17, waistD: 0.16, pelvisW: 0.16, upperArmR: 0.05, foreArmR: 0.045, fist: 0.05, thighR: 0.08, shinR: 0.06, headR: 0.13 },
      hair: { style: 'cropped', color: 0x6a5a4a },
      headExtras: [
        // the big round nose
        { shape: 'ball', a: [0, -0.12, 1], d: [0, -0.2, 1], l: 0.05, r: 0.05, color: LE_SKIN, depth: 0.95, flat: 0.9, outline: 0.5 },
      ],
      face: { pupil: 0x141414, eyeW: 0.84, eyeH: 0.7, browThick: 1.6, brow: 0x6a5a4a, jaw: 1.04, cheeks: 1.2 },
      outfit: {
        topStyle: 'armor', top: LE_SUIT, arms: LE_SUIT, sleeves: 'long', sleeveColor: LE_SUIT,
        armor: { plate: LE_PLATE, belly: LE_PLATE, pads: LE_TRIM, padStyle: 'wide', trim: LE_TRIM },
        pants: LE_SUIT, pantsStyle: 'tight',
        gloves: 0xe8e4d8, boots: 0xe8e4d8, bootStyle: 'saiyan',
      },
      portraitColor: '#6a7a4a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: le.le_idle }, le),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'le_idle', expression: 'calm' },
  };

  /* ======================================================================== GINE (the prologue) */
  // Bardock's wife, Goku's mother: small, warm, a Saiyan who never liked fighting. Built from memory —
  // approximate: Goku's spikes short and soft, the white armour over a dark suit, red bands, the tail.
  const GI_SKIN = 0xe8b890, GI_SUIT = 0x1f2433, GI_PLATE = 0xeae6dc, GI_TRIM = 0x6a4a2a;
  const gi = {
    gine_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: b * 0.004 }, hips: [0, 4, 4], spine: [-2, 0, 0], chest: [-2 + b, 0, 0], head: [-2, -4, 4],
        shoulderL: [-30, -20, 14], elbowL: [-96, 0, 0], shoulderR: [-30, 20, -14], elbowR: [-96, 0, 0],
        thighL: [-2, 4, 6], kneeL: [5, 0, 0], thighR: [2, -4, -8], kneeR: [7, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a hand raised, waving the pod off; the other at her chest
    gine_wave: (t) => {
      const s = Math.sin(t * 7) * 14;
      return {
        root: { y: 0 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-14, 0, 0],
        shoulderR: [-160, 0, -16 + s], elbowR: [-20, 0, 0], shoulderL: [-40, -24, 16], elbowL: [-104, 0, 0],
        thighL: [-2, 0, 8], kneeL: [4, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // both hands over her mouth: crying, holding it in
    gine_cry: (t) => {
      const s = Math.sin(t * 9) * 1.5;
      return {
        root: { y: -0.02, rx: 6 }, spine: [8, 0, 0], chest: [6, 0, s * 0.4], head: [10, 0, 0],
        shoulderL: [-56, -34, 14], elbowL: [-128, 0, 0], shoulderR: [-56, 34, -14], elbowR: [-128, 0, 0],
        thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [-6, 0, -8], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // at the pod's console: leaning in, both hands on it
    gine_console: { root: { y: -0.04, rx: 18 }, spine: [14, 0, 0], chest: [10, 0, 0], head: [-18, 0, 0], shoulderL: [-70, 0, 12], elbowL: [-40, 0, 0], shoulderR: [-70, 0, -12], elbowR: [-40, 0, 0], thighL: [-14, 0, 8], kneeL: [14, 0, 0], thighR: [6, 0, -8], kneeR: [6, 0, 0], hands: ['open', 'open'] },
  };
  SL.data.characters.gine = {
    id: 'gine', assetLevel: 1, name: 'Gine', fullName: 'Gine (Kakarot\'s mother)', era: 'Movie',
    playable: false, prototype: true, style: 'Saiyan',
    blurb: 'Too kind for a Saiyan soldier, she ran a butcher\'s stall instead — and sent her son away so he would live.',
    stats: { hp: 4000, ki: 60, stamina: 100, speed: 1, power: 0.4, defense: 0.5, weight: 0.8, kiRegen: 1, chargeRate: 20, canonPower: 0.1 },
    appearance: {
      height: 0.86, skin: GI_SKIN,
      build: { chestW: 0.17, chestD: 0.115, shoulderX: 0.172, waistW: 0.105, waistD: 0.095, pelvisW: 0.135, upperArmR: 0.042, foreArmR: 0.036, fist: 0.042, thighR: 0.072, shinR: 0.054, headR: 0.124, neckR: 0.045 },
      hair: { style: 'gine', color: 0x141418 },
      face: { pupil: 0x141414, eyeW: 1.1, eyeH: 1.1, lashWing: true, browThick: 0.85, jaw: 0.94, cheeks: 1.1 },
      outfit: {
        topStyle: 'armor', top: GI_SUIT, arms: GI_SKIN,
        armor: { plate: GI_PLATE, belly: GI_TRIM, pads: GI_TRIM, padStyle: 'wide', trim: GI_TRIM },
        pants: GI_SUIT, pantsStyle: 'tight',
        wrist: 0xa01c1c, legBands: 0xa01c1c,
        boots: 0xeeebe0, bootTip: GI_TRIM, bootStyle: 'saiyan',
        tail: 0x5a321a,
      },
      portraitColor: '#6a4a2a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: gi.gine_idle }, gi),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'gine_idle', expression: 'soft' },
  };

  /* ======================================================================== KING VEGETA (the prologue) */
  // the Saiyans' king: his son's flame of hair, a full beard, the royal armour with its crest and a long cape.
  // Built from memory — approximate.
  const KV_SKIN = 0xe0ac84, KV_SUIT = 0x1a2a5a, KV_PLATE = 0xf0eee6, KV_TRIM = 0xc8a040, KV_CAPE = 0x7a1414;
  const kv = {
    kv_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: b * 0.003 }, spine: [-4, 0, 0], chest: [-6 + b * 0.5, 0, 0], head: [-6, 0, 0],
        shoulderL: [-20, -64, 10], elbowL: [-96, 0, 0], shoulderR: [-22, 64, -10], elbowR: [-92, 0, 0],
        thighL: [-2, 0, 10], kneeL: [3, 0, 0], thighR: [-2, 0, -10], kneeR: [3, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the order: an arm thrown out, the finger pointing the child away
    kv_order: { root: { y: 0 }, spine: [2, -12, 0], chest: [0, -16, 0], head: [-6, 12, 0], shoulderR: [-86, 0, -20], elbowR: [-4, 0, 0], shoulderL: [-14, 0, 20], elbowL: [-50, 0, 0], thighL: [-8, 6, 10], kneeL: [8, 0, 0], thighR: [6, -6, -10], kneeR: [6, 0, 0], hands: ['fist', 'point'] },
  };
  SL.data.characters.king_vegeta = {
    id: 'king_vegeta', assetLevel: 1, name: 'King Vegeta', fullName: 'King Vegeta', era: 'Movie',
    playable: false, prototype: true, style: 'Saiyan King',
    blurb: 'He sent a baby to a dead planet because a number on a scouter frightened him.',
    stats: { hp: 9000, ki: 80, stamina: 100, speed: 0.9, power: 0.9, defense: 0.9, weight: 1.1, kiRegen: 1.5, chargeRate: 24, canonPower: 0.6 },
    appearance: {
      height: 1.03, skin: KV_SKIN,
      build: { chestW: 0.215, chestD: 0.14, shoulderX: 0.215, waistW: 0.14, upperArmR: 0.06, foreArmR: 0.052, thighR: 0.086, shinR: 0.064, headR: 0.12, neckLen: 0.06 },
      hair: { style: 'king_vegeta', color: 0x141418 },
      headExtras: [
        { shape: 'ball', a: [0, -0.84, 0.48], d: [0, -1, 0.3], l: 0.05, r: 0.06, color: 0x141418, depth: 0.92, flat: 0.62, outline: 0.3 },
        { shape: 'ball', a: [0.6, -0.5, 0.55], d: [0.5, -1, 0.2], l: 0.05, r: 0.035, color: 0x141418, depth: 0.95, flat: 0.6, outline: 0.25 },
        { shape: 'ball', a: [-0.6, -0.5, 0.55], d: [-0.5, -1, 0.2], l: 0.05, r: 0.035, color: 0x141418, depth: 0.95, flat: 0.6, outline: 0.25 },
        { shape: 'ball', a: [0.18, -0.42, 0.9], d: [1, -0.4, 0.1], l: 0.04, r: 0.014, color: 0x141418, depth: 0.99, flat: 0.7, outline: 0.2 },
        { shape: 'ball', a: [-0.18, -0.42, 0.9], d: [-1, -0.4, 0.1], l: 0.04, r: 0.014, color: 0x141418, depth: 0.99, flat: 0.7, outline: 0.2 },
      ],
      face: { pupil: 0x141414, eyeW: 0.9, eyeH: 0.8, browThick: 1.5, brow: 0x141418, jaw: 1.08, jawW: 1.02 },
      outfit: {
        topStyle: 'armor', top: KV_SUIT, arms: KV_SUIT, sleeves: 'long', sleeveColor: KV_SUIT,
        armor: { plate: KV_PLATE, belly: KV_TRIM, pads: KV_PLATE, padStyle: 'wide', trim: KV_TRIM },
        cape: KV_CAPE,
        pants: KV_SUIT, pantsStyle: 'tight',
        gloves: 0xf0eee6, boots: 0xf0eee6, bootTip: KV_TRIM, bootStyle: 'saiyan',
        tail: 0x3a2214,
      },
      portraitColor: '#7a1414',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: kv.kv_idle }, kv),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'kv_idle', expression: 'cold' },
  };

  /* ======================================================================== VEKU, the second failure */
  // The second Fusion Dance (Super Broly): the same two Saiyans, both fingers right this time — and the timing
  // wrong. Tall, thin as a reed, stooped and wheezing in Veku's clothes. Derived from Veku (fusion_reborn_cast.js):
  // his clothes and face, a different body. Story only, never playable, never offered anywhere else.
  (() => {
    const vk = SL.data.characters.veku;
    if (!vk) return;
    const thin = {
      // stooped and wheezing, the arms hanging, knees knocking
      vk_thinIdle: (t) => {
        const b = Math.sin(t * 2.4);
        return {
          root: { y: -0.02 + b * 0.008, rx: 10 }, spine: [16, 0, 0], chest: [10 + b * 2, 0, 0], neck: [10, 0, 0], head: [-18, 0, b * 3],
          shoulderL: [6, 0, 6], elbowL: [-10, 0, 0], shoulderR: [6, 0, -6], elbowR: [-10, 0, 0],
          thighL: [-6, -6, 4], kneeL: [14, 0, 0], thighR: [-6, 6, -4], kneeR: [14, 0, 0],
          hands: ['open', 'open'],
        };
      },
      // the cough: doubled over, a hand at the mouth
      vk_thinCough: (t) => {
        const s = Math.abs(Math.sin(t * 14));
        return {
          root: { y: -0.06, rx: 22 + s * 8 }, spine: [24, 0, 0], chest: [14 + s * 6, 0, 0], head: [-6, 0, 0],
          shoulderR: [-70, 30, -10], elbowR: [-120, 0, 0], shoulderL: [10, 0, 10], elbowL: [-20, 0, 0],
          thighL: [-16, 0, 6], kneeL: [22, 0, 0], thighR: [-16, 0, -6], kneeR: [22, 0, 0],
          hands: ['open', 'fist'],
        };
      },
      // the wobble: trying to stand straight and failing, arms out for balance
      vk_thinWobble: (t) => {
        const s = Math.sin(t * 6);
        return {
          root: { y: -0.03, rz: s * 9, rx: 4 }, spine: [8, 0, -s * 6], chest: [4, 0, 0], head: [-10, 0, s * 8],
          shoulderL: [-10, 0, 70 + s * 10], elbowL: [-14, 0, 0], shoulderR: [-10, 0, -70 + s * 10], elbowR: [-14, 0, 0],
          thighL: [-8, 0, 6], kneeL: [18, 0, 0], thighR: [-8, 0, -6], kneeR: [18, 0, 0],
          hands: ['open', 'open'],
        };
      },
    };
    const def = JSON.parse(JSON.stringify(Object.assign({}, vk, { poses: undefined, moves: undefined, specials: undefined, forms: undefined })));
    SL.data.characters.veku_thin = Object.assign(def, {
      id: 'veku_thin', name: 'Veku', fullName: 'Veku (the second failed Fusion Dance: the timing wrong)',
      style: 'Failed Fusion',
      blurb: 'Both fingers right, the step half a beat late. Tall, thin, wheezing, and in no state to fight anybody.',
      stats: Object.assign({}, vk.stats, { speed: 0.55, power: 0.1 }),
      appearance: Object.assign({}, def.appearance, {
        height: 1.02, skin: 0xf0d2b8,
        build: {
          hipY: 0.98, chestW: 0.15, chestD: 0.09, chestTop: 0.24, shoulderX: 0.16, delt: 0.04, waistW: 0.085, waistD: 0.07, pelvisW: 0.11,
          upperArmLen: 0.3, upperArmR: 0.026, foreArmLen: 0.28, foreArmR: 0.022, fist: 0.035,
          thighLen: 0.42, thighR: 0.042, shinLen: 0.4, shinR: 0.032, neckLen: 0.1, neckR: 0.03, headR: 0.112, footLen: 0.95,
        },
        face: Object.assign({}, def.appearance.face, { cheeks: 0.3, eyeH: 0.7, jaw: 0.9 }),
      }),
      forms: [{ id: 'base', name: 'Veku', aura: { color: 0xffffff, core: 0xffffff, idle: 0 }, mult: {} }],
      poses: Object.assign({}, vk.poses, { idle: thin.vk_thinIdle, run: thin.vk_thinWobble, jump: thin.vk_thinWobble, fall: thin.vk_thinWobble }, thin),
      moves: { light: vk.moves.light.slice(0, 1), heavy: {} },
      specials: {},
      mechanic: undefined,
      blimp: undefined,
      intro: { pose: 'vk_thinIdle', expression: 'hurt' },
      victory: { poses: ['vk_thinIdle'], expression: 'hurt' },
      defeat: { pose: 'knockdown', expression: 'ko' },
    });
    SL.data.fusions = SL.data.fusions || {};
    SL.data.fusions.veku_thin = { parts: ['goku', 'vegeta'], method: 'dance', seconds: 0 };
  })();
})();
