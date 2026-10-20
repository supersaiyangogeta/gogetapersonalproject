/*
 * RESURRECTION OF F (Dragon Ball Super, Chapter 17) — Frieza's new officers. Story cast, Level 1 functional prototypes,
 * built from memory (no reference image reached the session — approximate shapes and colours).
 *
 *   TAGOMA   Frieza's strongest new soldier: tall and heavy, grey-violet skin, a short dark crest of hair, black-and-
 *            purple Frieza Force armour with broad shoulder guards. A fighter (he duels Gohan): the elite soldier's
 *            heavy brawling kit (frieza_force.js), hit harder and faster.
 *   SORBET   the commander who revived Frieza: short, round, blue-skinned, pointed ears, a scouter, the purple
 *            uniform. Never fights.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const elite = SL.data.characters.frieza_elite;

  const P = {
    // arms folded across the armour, chin up: a soldier who expects to win
    tg_idle: (t) => {
      const b = Math.sin(t * 1.5);
      return { root: { y: -0.02 + b * 0.004 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-4, 0, 0], shoulderL: [-50, -36, 20], elbowL: [-104, 0, 0], shoulderR: [-50, 36, -20], elbowR: [-104, 0, 0], thighL: [-6, 0, 12], kneeL: [6, 0, 0], thighR: [-6, 0, -12], kneeR: [6, 0, 0], hands: ['fist', 'fist'] };
    },
    // lying still, face down: playing dead
    tg_down: { root: { y: -0.78, rx: 86 }, spine: [4, 0, 0], chest: [2, 0, 0], head: [-14, 16, 0], shoulderL: [-10, 0, 40], elbowL: [-20, 0, 0], shoulderR: [-14, 0, -36], elbowR: [-24, 0, 0], thighL: [-4, 0, 8], kneeL: [10, 0, 0], thighR: [-2, 0, -6], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    // the sneak attack: up off the ground in one move, the boot driving up into the chest
    tg_sneak: { root: { y: 0.02, rz: -12 }, chest: [-6, 36, 0], head: [-6, -28, 0], shoulderL: [-20, 0, 50], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-30, 0, 0], thighR: [-110, 0, -20], kneeR: [6, 0, 0], footR: [20, 0, 0], thighL: [14, 0, 8], kneeL: [22, 0, 0], hands: ['fist', 'fist'] },
    // Sorbet: hands clasped behind his back, leaning a little forward
    sb_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return { root: { y: b * 0.003, rx: 6 }, spine: [6, 0, 0], chest: [2, 0, 0], head: [-6, 0, 0], shoulderL: [30, 0, 16], elbowL: [-50, 0, 0], shoulderR: [30, 0, -16], elbowR: [-50, 0, 0], thighL: [-2, 0, 8], kneeL: [3, 0, 0], thighR: [-2, 0, -8], kneeR: [3, 0, 0], hands: ['fist', 'fist'] };
    },
    // Sorbet bowing to his lord
    sb_bow: { root: { y: -0.02, rx: 30 }, spine: [24, 0, 0], chest: [12, 0, 0], head: [10, 0, 0], shoulderL: [-20, 0, 8], elbowL: [-20, 0, 0], shoulderR: [-20, 0, -8], elbowR: [-20, 0, 0], thighL: [-6, 0, 6], kneeL: [8, 0, 0], thighR: [-6, 0, -6], kneeR: [8, 0, 0], hands: ['open', 'open'] },
  };
  Object.assign(C, P);

  /* ======================================================================== TAGOMA */
  const TG_SKIN = 0x9a8ca8, TG_DARK = 0x221a2a, TG_ARMOR = 0x3a2a4a, TG_PLATE = 0x2a2230, TG_TRIM = 0x8a6ab0;
  const boost = (m, k) => Object.assign({}, m, { damage: Math.round(m.damage * k), startup: Math.max(4, m.startup - 2) });
  SL.data.characters.tagoma = Object.assign({}, elite, {
    id: 'tagoma', assetLevel: 1, name: 'Tagoma', fullName: 'Tagoma (Frieza Force)', era: 'Super',
    // Free Battle after "The Thousand Soldiers" (unlocks.js)
    playable: true, prototype: true, style: 'Elite · Dirty Fighter', ratings: { power: 4, speed: 3, ki: 2, defense: 4 },
    blurb: 'The strongest soldier in Frieza\'s new army, and he knows it.',
    stats: { hp: 20000, ki: 120, stamina: 140, speed: 1.05, power: 1.35, defense: 1.2, weight: 1.6, kiRegen: 3, chargeRate: 28, canonPower: 1.6 },
    appearance: {
      height: 1.26,
      skin: TG_SKIN,
      build: { chestW: 0.26, chestD: 0.18, shoulderX: 0.26, waistW: 0.17, waistD: 0.14, upperArmR: 0.072, foreArmR: 0.066, thighR: 0.102, shinR: 0.08, fist: 0.072, headR: 0.112 },
      hair: { style: 'soldier_hair', color: TG_DARK },
      face: { pupil: 0x1a1a1a, brow: TG_DARK, browThick: 1.6, jaw: 1.15, jawW: 1.05, eyeW: 0.9 },
      outfit: {
        topStyle: 'armor', top: TG_DARK, arms: TG_SKIN, pants: TG_DARK, pantsStyle: 'tight',
        gloves: 0xe8e4dc, boots: 0xe8e4dc, bootTip: TG_TRIM, bootStyle: 'saiyan',
        armor: { plate: TG_ARMOR, belly: TG_PLATE, pads: TG_ARMOR, padStyle: 'wide', trim: TG_TRIM },
      },
      portraitColor: '#3a2a4a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc89aff, core: 0xffffff, particles: 0xd8b8ff }, mult: {} }],
    poses: Object.assign({}, elite.poses || {}, P, { idle: P.tg_idle }),
    moves: {
      light: elite.moves.light.map((m) => boost(m, 1.6)),
      heavy: { 0: boost(elite.moves.heavy[0], 1.4), 3: boost(elite.moves.heavy[3], 1.4) },
      dash: boost(elite.moves.dash, 1.3),
    },
    // the cannon stays the elite soldier's; the feint and the beating are his own (Free Battle only: in "The Thousand
    // Soldiers" his sneak attack is the mission's scene)
    specials: Object.assign({}, elite.specials, {
      // PLAYING DEAD: he drops as if beaten — and comes up off the ground with the boot into your chest
      special2: {
        id: 'tgFeint', name: 'Playing Dead', type: 'rush', kiCost: 28, icon: 'rush', cooldown: 720, freeOnly: true,
        startup: 22, dashFrames: 12, speed: 58, recovery: 24,
        poses: { wind: 'tg_down' },
        hits: [{ pose: 'tg_sneak', damage: 1700, frames: 18, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 24, impact: 3 }],
      },
      // ELITE BEATING: the strongest soldier in the army, all fists, no science — and the hammer to finish
      ultimate: {
        id: 'tgBeating', name: 'Elite Beating', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true, freeOnly: true,
        startup: 10, dashFrames: 18, speed: 64, recovery: 30,
        poses: { wind: 'punchWindR' },
        hits: [
          { pose: 'punchR', damage: 700, frames: 7, sfx: 'punchHeavy' },
          { pose: 'punchL', damage: 700, frames: 7, sfx: 'punchHeavy' },
          { pose: 'punchR', damage: 760, frames: 7, sfx: 'punchHeavy' },
          { pose: 'uppercut', damage: 1000, frames: 12, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 18, impact: 3 },
          { pose: 'hammer', damage: 2400, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
    }),
    ai: { personality: 'elite', aggression: 0.8, defense: 0.6, ranged: 0.25, beam: 0, transformHp: 0, preferredRange: 2.2, hooks: 'tagoma' },
    intro: { pose: 'tg_idle', expression: 'smirk' },
    victory: { poses: ['tg_idle'], expression: 'smirk' },
    defeat: { pose: 'tg_down', expression: 'hurt' },
  });

  /* ======================================================================== SORBET */
  const SB_SKIN = 0x6a96d8, SB_SUIT = 0x4a2c6a;
  SL.data.characters.sorbet = {
    id: 'sorbet', assetLevel: 1, name: 'Sorbet', fullName: 'Sorbet (Frieza Force commander)', era: 'Super',
    playable: false, cinematicOnly: true,
    stats: { hp: 3000, ki: 60, stamina: 80, speed: 0.9, power: 0.4, defense: 0.5, weight: 0.8, kiRegen: 1, chargeRate: 20, canonPower: 0.1 },
    appearance: {
      height: 0.74, skin: SB_SKIN,
      build: { chestW: 0.2, chestD: 0.17, shoulderX: 0.18, waistW: 0.19, waistD: 0.18, pelvisW: 0.17, upperArmR: 0.046, foreArmR: 0.042, thighR: 0.08, shinR: 0.06, headR: 0.14 },
      hair: { style: 'bald', color: SB_SKIN },
      headExtras: [
        { a: [0.92, 0.25, 0], d: [1, 0.6, -0.2], l: 0.08, r: 0.03, color: SB_SKIN, depth: 0.95, outline: 0.4 },
        { a: [-0.92, 0.25, 0], d: [-1, 0.6, -0.2], l: 0.08, r: 0.03, color: SB_SKIN, depth: 0.95, outline: 0.4 },
      ],
      face: { pupil: 0x1a1a1a, brow: 0x3a5a9a, eyeW: 0.85, noEars: true, jaw: 1.1, jawW: 1.15, cheeks: 1.2 },
      outfit: {
        topStyle: 'armor', top: SB_SUIT, arms: SB_SUIT, sleeves: 'long', sleeveColor: SB_SUIT,
        armor: { plate: 0xe8e2cc, belly: SB_SUIT, pads: 0x8a6ab0, padStyle: 'strap', trim: 0x8a6ab0 },
        pants: SB_SUIT, pantsStyle: 'tight', gloves: 0xe8e4dc, boots: 0xe8e4dc, bootStyle: 'saiyan',
        scouter: { lens: 0x3aff6a, body: 0xb0b0b0 },
      },
      portraitColor: '#4a2c6a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: P.sb_idle }, P),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'sb_idle', expression: 'smirk' },
  };
})();
