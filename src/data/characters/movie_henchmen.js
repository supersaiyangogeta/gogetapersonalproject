/*
 * MOVIE HENCHMEN AND OVA VILLAINS (roster continuation, 2026-10-15) — the board's "more movie additions" (p.227),
 * each labelled with its own continuity and none placed in the canon story order. The board names them without
 * pictures: every look here is BUILT FROM MEMORY and approximate.
 *
 *   COOLER'S ARMORED SQUADRON ("Cooler's Revenge"): SALZA (the leader, a blade of energy from the hand), DORE (the
 *     green brute), NEIZ (small, three antennae, the electric Bind Wave).
 *   BOJACK'S GALACTIC PIRATES ("Bojack Unbound"): BIDO (the big one), BUJIN (small, the Psycho Thread that binds),
 *     KOGU (the swordsman).
 *   HATCHIYACK (the OVA "Plan to Eradicate the Saiyans"): the Tuffle machine of revenge — an OVA, not a film.
 *   KING GURUMES ("Curse of the Blood Rubies", the first Dragon Ball film): the giant king who ate the rubies.
 *   LUCIFER ("Sleeping Princess in Devil's Castle"): the vampire lord of the castle.
 *   DR. KOCHIN ("The Dead Zone" / "The World's Strongest"): Wheelo's scientist — a support-role model, not a fighter.
 *
 * Level 1 prototypes; their strikes come from three shared schools (a brawler, a quick martial artist, a swordsman)
 * with techniques of their own.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const GK = C.goku, FT = C.future_trunks, GB = C.goku_black;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 12, active: 4, recovery: 22, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const base = (aura) => [{ id: 'base', name: 'Base', aura: aura || { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }];
  const end = (idle, expr) => ({ intro: { pose: idle, expression: expr || 'smirk' }, victory: { poses: [idle], expression: expr || 'smirk' }, defeat: { pose: 'defeatKneel', expression: 'hurt' } });
  // the three schools of strikes (p = id prefix, s = damage scale)
  const SCHOOL = {
    brawler: (p, s) => ({
      light: [lt(p + 'Jab', 'punchWindR', 'punchR', 520 * s), lt(p + 'Hook', 'punchWindL', 'punchL', 560 * s, { hitPose: 'hitSideR' }), lt(p + 'Knee', 'kickWindR', 'kickR', 660 * s, { startup: 8, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv(p + 'Smash', 'hammerWind', 'hammer', 1400 * s, { knock: 'smash', knockSpeed: 34, impact: 4, armor: true }) },
      dash: hv(p + 'Ram', 'punchWindR', 'punchR', 950 * s, { startup: 6, active: 10, recovery: 18, lunge: 32, hitstun: 28, hitPose: 'hitBody' }),
      throw: { id: p + 'Toss', name: 'Toss', damage: 1300 * s, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    }),
    swift: (p, s) => ({
      light: [lt(p + 'Jab', 'g_jabW', 'g_jab', 440 * s, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }), lt(p + 'Kick', 'g_kickW', 'g_kick', 500 * s, { startup: 5, reach: 1.35 }), lt(p + 'Spin', 'g_spinKickW', 'g_spinKick', 600 * s, { startup: 7, reach: 1.45, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2 })],
      heavy: { 0: hv(p + 'Axe', 'g_axeKickW', 'g_axeKick', 1150 * s, { knock: 'smash', knockSpeed: 32 }) },
      dash: hv(p + 'Dive', 'g_flyingKnee', 'g_flyingKnee', 800 * s, { startup: 3, active: 8, recovery: 12, lunge: 44, hitstun: 26, hitPose: 'hitBody' }),
      throw: { id: p + 'Flip', name: 'Flip', damage: 1100 * s, knockSpeed: 30, poses: ['grab', 'kickWindR', 'kickR'] },
    }),
    sword: (p, s) => ({
      light: [lt(p + 'Cut', 'ft_cutW', 'ft_cut', 560 * s, { startup: 5, reach: 1.6, radius: 0.95, recovery: 11, cancel: 7, sfx: 'swordSlash', hitPose: 'hitSideL' }), lt(p + 'Return', 'ft_returnW', 'ft_return', 580 * s, { startup: 5, reach: 1.6, radius: 0.95, recovery: 11, cancel: 7, sfx: 'swordSlash', hitPose: 'hitSideR' }), lt(p + 'Upcut', 'ft_upcutW', 'ft_upcut', 680 * s, { startup: 7, reach: 1.6, radius: 0.95, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, sfx: 'swordSlash' })],
      heavy: { 0: hv(p + 'Drop', 'ft_dropW', 'ft_drop', 1450 * s, { reach: 1.7, knock: 'smash', knockSpeed: 34, sfx: 'swordSlash' }) },
      dash: hv(p + 'Lunge', 'ft_lungeW', 'ft_lunge', 950 * s, { startup: 4, active: 8, recovery: 14, reach: 1.7, lunge: 40, hitstun: 26, sfx: 'swordSlash', hitPose: 'hitBody' }),
      throw: { id: p + 'Pommel', name: 'Pommel Strike', damage: 1150 * s, knockSpeed: 28, poses: ['grab', 'ft_cutW', 'ft_cut'] },
    }),
  };
  const POSES = Object.assign({}, GK.poses, FT.poses, GB.poses);
  const shot = (id, name, o) => Object.assign({ id, name, type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 70, startup: 12, recovery: 16, pose: { wind: 'blastWind', release: 'blastR' } }, o);
  const wave = (id, name, color, dmg, o) => Object.assign({ id, name, type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true, chargeMin: 44, chargeMax: 44, damage: [dmg, dmg], radius: [1.4, 1.4], speed: 100, range: 160, sustain: 42, color, core: 0xffffff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 30 }, o);
  const rush = (id, name, hits, o) => Object.assign({ id, name, type: 'rush', kiCost: 30, icon: 'rush', startup: 8, dashFrames: 20, speed: 62, recovery: 24, poses: { wind: hits[0].pose }, hits }, o);
  const bind = (id, name, o) => Object.assign({ id, name, type: 'telekinesis', kiCost: 24, icon: 'teleport', cooldown: 320, range: 18, startup: 12, maxFrames: 130, bossFrames: 55, kiPerSecond: 16, releaseStagger: 28, recovery: 18, mashGain: 0.07, escapeDecay: 0.004, cpuEscape: 0.006, poses: { focus: 'blastWind', hold: 'blastR' } }, o);
  const fighter = (id, o) => Object.assign({ id, assetLevel: 1, era: 'Movie', playable: true, prototype: true, poses: POSES }, o);

  /* ============================================================== COOLER'S ARMORED SQUADRON */
  const SQ = { plate: 0xf0eef6, pads: 0x6a3aa8, suit: 0x1e1e2a };
  const squadOutfit = (o) => Object.assign({
    topStyle: 'armor', top: SQ.suit, pants: SQ.suit, pantsStyle: 'tight', boots: SQ.plate, bootTip: SQ.pads, bootStyle: 'saiyan',
    armor: { plate: SQ.plate, belly: SQ.plate, pads: SQ.pads, padStyle: 'wide', trim: SQ.pads },
    scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
  }, o);
  const SALZA_BLADE = { id: 'salzaBlade', shape: 'kiBlade', joint: 'handR', pos: [0, -0.06, 0], rot: [Math.PI, 0, 0], length: 1.5, width: 0.06, color: 0x9ae0ff, core: 0xf0fbff };
  C.salza = fighter('salza', {
    name: 'Salza', fullName: 'Salza (Cooler\'s Armored Squadron)', style: 'Squadron Leader · Energy Blade',
    card: ['Movie', 'Cooler\'s Armored Squadron'],
    blurb: 'The leader of Cooler\'s Armored Squadron, elegant and cold. A blade of energy comes out of his hand. Built from memory.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 17000, ki: 130, stamina: 130, speed: 1.12, power: 1.15, defense: 1.0, weight: 0.95, kiRegen: 3, chargeRate: 36, canonPower: 2 },
    appearance: {
      height: 0.98, skin: 0xa8c4e8,
      build: { chestW: 0.19, chestD: 0.125, shoulderX: 0.19, waistW: 0.12, upperArmR: 0.048, foreArmR: 0.043, thighR: 0.078, shinR: 0.058, headR: 0.118 },
      hair: { style: 'jeice', color: 0xe8ecf4 },
      face: { pupil: 0x2a3a6a, eyeTilt: 0.16, browThick: 0.8, brow: 0xd8dce8, pointedEars: true, jaw: 0.96 },
      outfit: squadOutfit({ arms: 0xa8c4e8 }),
      props: [SALZA_BLADE],
      portraitColor: '#a8c4e8',
    },
    forms: base({ color: 0xc8e8ff, core: 0xffffff, particles: 0xd8f0ff }),
    moves: SCHOOL.swift('sz', 1.1),
    specials: {
      special1: rush('szBlade', 'Salza Blade', [{ pose: 'gb_thrust', damage: 1000, frames: 10, sfx: 'swordSlash' }, { pose: 'gb_sweep', damage: 1000, frames: 10, sfx: 'swordSlash' }, { pose: 'gb_rise', damage: 1500, frames: 16, sfx: 'swordSlash', knock: 'launch', knockSpeed: 24, impact: 3 }], { prop: 'salzaBlade', poses: { wind: 'gb_bladeW', dash: 'gb_bladeW' }, cooldown: 90 }),
      special2: shot('szShot', 'Squadron Shot', { projectile: { kind: 'blast', count: 3, spread: 0.3, speed: 84, radius: 0.3, damage: 650, homing: 0.3, color: 0x9ae0ff, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 12, impact: 2, life: 2 } }),
      ultimate: wave('szCannon', 'Salza Cannon', 0x9ae0ff, 4400),
    },
    ai: { personality: 'martial', aggression: 0.66, defense: 0.55, ranged: 0.4, beam: 0.35, transformHp: 0, preferredRange: 2.6 },
    ...end('armsCrossed', 'smirk'),
  });
  C.dore = fighter('dore', {
    name: 'Dore', fullName: 'Dore (Cooler\'s Armored Squadron)', style: 'Squadron · Brute',
    card: ['Movie', 'Cooler\'s Armored Squadron'],
    blurb: 'The squadron\'s big green brawler: no subtlety, a lot of weight. Built from memory.',
    ratings: { power: 4, speed: 2, ki: 2, defense: 4 },
    stats: { hp: 19000, ki: 110, stamina: 150, speed: 0.94, power: 1.2, defense: 1.15, weight: 1.4, kiRegen: 2.2, chargeRate: 30, canonPower: 1.8 },
    appearance: {
      height: 1.14, skin: 0x5aa84a,
      build: { chestW: 0.26, chestD: 0.18, shoulderX: 0.26, waistW: 0.17, upperArmR: 0.074, foreArmR: 0.066, fist: 0.074, thighR: 0.1, shinR: 0.076, headR: 0.12, neckR: 0.08, neckLen: 0.03 },
      hair: { style: 'bald', color: 0x5aa84a },
      headExtras: [1, -1].map((s) => ({ shape: 'ball', a: [s * 0.4, 0.7, 0.2], d: [0, 1, 0], l: 0.01, r: 0.04, color: 0x4a8a3a, depth: 0.98, flat: 0.5, outline: 0.4 })),
      face: { pupil: 0x141414, browThick: 1.6, brow: 0x2a5a2a, jaw: 1.2, jawW: 1.1, mouthColor: 0x2a4a2a },
      outfit: squadOutfit({ arms: 0x5aa84a }),
      portraitColor: '#5aa84a',
    },
    forms: base(),
    moves: SCHOOL.brawler('dr2', 1.15),
    specials: {
      special1: shot('dr2Blast', 'Dore Blast', { icon: 'ball', projectile: { kind: 'ball', speed: 52, radius: 0.9, damage: 1800, homing: 0.5, color: 0x9aff6a, core: 0xf0ffe0, explode: 5, knock: 'heavy', knockSpeed: 24, impact: 3, life: 2.8 } }),
      special2: rush('dr2Crush', 'Dore Crusher', [{ pose: 'punchR', damage: 700, frames: 11, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 700, frames: 11, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1600, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 }], { armor: true }),
      ultimate: { id: 'dr2Ball', name: 'Dore Cannon', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true, startup: 40, recovery: 40, pose: { wind: 'throwWind', release: 'throwRelease' }, projectile: { kind: 'ball', speed: 36, radius: 2.1, damage: 4600, homing: 0.5, color: 0x9aff6a, core: 0xf0ffe0, explode: 11, knock: 'smash', knockSpeed: 40, impact: 5, life: 4 } },
    },
    ai: { personality: 'berserker', aggression: 0.75, defense: 0.45, ranged: 0.25, beam: 0, transformHp: 0, preferredRange: 1.9 },
    ...end('armsCrossed', 'grin'),
  });
  C.neiz = fighter('neiz', {
    name: 'Neiz', fullName: 'Neiz (Cooler\'s Armored Squadron)', style: 'Squadron · Bind Wave',
    card: ['Movie', 'Cooler\'s Armored Squadron'],
    blurb: 'The squadron\'s small one, with three antennae and a current of electricity that holds you where you are. Built from memory.',
    ratings: { power: 2, speed: 4, ki: 4, defense: 2 },
    stats: { hp: 14000, ki: 140, stamina: 120, speed: 1.12, power: 1.0, defense: 0.9, weight: 0.8, kiRegen: 3.4, chargeRate: 38, canonPower: 1.6 },
    appearance: {
      height: 0.8, skin: 0xe8a040,
      build: { chestW: 0.18, chestD: 0.13, shoulderX: 0.17, waistW: 0.14, upperArmR: 0.044, foreArmR: 0.04, thighR: 0.07, shinR: 0.054, headR: 0.13 },
      hair: { style: 'bald', color: 0xe8a040 },
      headExtras: [-0.3, 0, 0.3].map((x) => ({ a: [x, 0.9, 0.1], d: [x, 1, -0.2], l: 0.1, r: 0.012, color: 0xc8802a, depth: 0.98, outline: 0.4 })),
      face: { pupil: 0x141414, browThick: 1.0, brow: 0xa8602a, pointedEars: true, jaw: 0.98, eyeTilt: 0.14 },
      outfit: squadOutfit({ arms: 0xe8a040 }),
      portraitColor: '#e8a040',
    },
    forms: base({ color: 0xfff08a, core: 0xffffff, particles: 0xfff8c0 }),
    moves: SCHOOL.swift('nz', 0.95),
    specials: {
      special1: bind('nzBind', 'Neiz Bind Wave', { drain: { hpPerSecond: 0.04, kiPerSecond: 8 } }),
      special2: shot('nzShot', 'Neiz Shot', { projectile: { kind: 'blast', speed: 88, radius: 0.32, damage: 1200, homing: 0.4, color: 0xfff08a, core: 0xffffff, explode: 2, knock: 'heavy', knockSpeed: 18, impact: 3, life: 2 } }),
      ultimate: { id: 'nzStorm', name: 'Lightning Storm', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true, windup: 22, rise: 22, height: 9, count: 14, damage: 640, speed: 64, range: 60, recovery: 24, color: 0xfff08a, poses: { wind: 'blastWind', throw: 'blastR' } },
    },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.55, ranged: 0.6, beam: 0, transformHp: 0, preferredRange: 4 },
    ...end('armsCrossed', 'smirk'),
  });

  /* ============================================================== BOJACK'S GALACTIC PIRATES */
  const pirateOutfit = (o) => Object.assign({ topStyle: 'bare', belt: 0x2a7a8a, beltStyle: 'sash', pants: 0xd8d0e8, pantsStyle: 'harem', wrist: 0xe0b030, wristLen: 0.08, boots: 0xc8c83a, bootTip: 0x2a4ab8, bootStyle: 'saiyan' }, o);
  C.bido = fighter('bido', {
    name: 'Bido', fullName: 'Bido (Galactic Pirates)', style: 'Pirate · Brute',
    card: ['Movie', 'Bojack Unbound'],
    blurb: 'The biggest of Bojack\'s pirates: he holds you down while the others work. Built from memory.',
    ratings: { power: 4, speed: 2, ki: 2, defense: 4 },
    stats: { hp: 20000, ki: 120, stamina: 150, speed: 0.96, power: 1.22, defense: 1.18, weight: 1.4, kiRegen: 2.4, chargeRate: 32, canonPower: 4 },
    appearance: {
      height: 1.16, skin: 0x6ab86a,
      build: { chestW: 0.26, chestD: 0.18, shoulderX: 0.26, waistW: 0.16, upperArmR: 0.074, foreArmR: 0.066, fist: 0.074, thighR: 0.1, shinR: 0.076, headR: 0.12, neckR: 0.08 },
      hair: { style: 'broly', color: 0xd84a1a },
      face: { pupil: 0x141414, browThick: 1.5, brow: 0xd84a1a, pointedEars: true, jaw: 1.16, jawW: 1.08 },
      outfit: pirateOutfit({ top: 0x6ab86a, arms: 0x6ab86a }),
      portraitColor: '#6ab86a',
    },
    forms: base({ color: 0x9aff4a, core: 0xf0ffd0, particles: 0xb8ff7a }),
    moves: SCHOOL.brawler('bd', 1.2),
    specials: {
      special1: shot('bdVolley', 'Pirate Volley', { projectile: { kind: 'blast', count: 3, spread: 0.35, speed: 76, radius: 0.36, damage: 800, homing: 0.4, color: 0x9aff4a, core: 0xffffff, explode: 2.4, knock: 'push', knockSpeed: 14, impact: 2, life: 2.2 } }),
      special2: rush('bdCrush', 'Pirate Crush', [{ pose: 'punchR', damage: 800, frames: 11, sfx: 'punchHeavy' }, { pose: 'uppercut', damage: 900, frames: 12, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 14, impact: 3 }, { pose: 'hammer', damage: 1700, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 }], { armor: true }),
      ultimate: wave('bdWave', 'Galactic Wave', 0x7aff3a, 4800),
    },
    ai: { personality: 'berserker', aggression: 0.74, defense: 0.5, ranged: 0.3, beam: 0.3, transformHp: 0, preferredRange: 2 },
    ...end('armsCrossed', 'grin'),
  });
  C.bujin = fighter('bujin', {
    name: 'Bujin', fullName: 'Bujin (Galactic Pirates)', style: 'Pirate · Psycho Thread',
    card: ['Movie', 'Bojack Unbound'],
    blurb: 'The smallest pirate, and the one to fear: his Psycho Thread wraps you in light and drains you. Built from memory.',
    ratings: { power: 2, speed: 4, ki: 4, defense: 2 },
    stats: { hp: 15000, ki: 150, stamina: 120, speed: 1.14, power: 1.02, defense: 0.92, weight: 0.8, kiRegen: 3.6, chargeRate: 38, canonPower: 3.5 },
    appearance: {
      height: 0.82, skin: 0xe8885a,
      build: { chestW: 0.17, chestD: 0.12, shoulderX: 0.17, waistW: 0.12, upperArmR: 0.044, foreArmR: 0.04, thighR: 0.07, shinR: 0.054, headR: 0.128 },
      hair: { style: 'a17', color: 0xf0f0f4 },
      face: { pupil: 0x141414, browThick: 0.9, brow: 0xd8d8e0, pointedEars: true, jaw: 0.95, eyeTilt: 0.18 },
      outfit: pirateOutfit({ top: 0xe8885a, arms: 0xe8885a, pants: 0x6a3aa8 }),
      portraitColor: '#e8885a',
    },
    forms: base({ color: 0xffc8a0, core: 0xffffff, particles: 0xffd8c0 }),
    moves: SCHOOL.swift('bj2', 0.95),
    specials: {
      special1: bind('bj2Thread', 'Psycho Thread', { drain: { hpPerSecond: 0.05, kiPerSecond: 12 } }),
      special2: { id: 'bj2Step', name: 'Pirate\'s Step', type: 'teleport', kiCost: 14, icon: 'teleport', startup: 4, recovery: 6, cooldown: 45, escapeKiCost: 24, followWindow: 32, followBonus: 1.3, pose: 'g_kickW', modes: { behind: true, away: true } },
      ultimate: { id: 'bj2Rain', name: 'Psycho Rain', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true, windup: 22, rise: 22, height: 9, count: 14, damage: 660, speed: 64, range: 60, recovery: 24, color: 0xffa070, poses: { wind: 'blastWind', throw: 'blastR' } },
    },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.55, ranged: 0.6, beam: 0, transformHp: 0, preferredRange: 4.2 },
    ...end('armsCrossed', 'wicked'),
  });
  C.kogu = fighter('kogu', {
    name: 'Kogu', fullName: 'Kogu (Galactic Pirates)', style: 'Pirate · Swordsman',
    card: ['Movie', 'Bojack Unbound'],
    blurb: 'Bojack\'s swordsman: tall, quick, and better with the blade than anyone he has met — until Trunks. Built from memory.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 17000, ki: 130, stamina: 130, speed: 1.1, power: 1.15, defense: 1.02, weight: 1, kiRegen: 3, chargeRate: 34, canonPower: 3.8 },
    appearance: {
      height: 1.08, skin: 0x4ab0c8,
      build: { chestW: 0.21, chestD: 0.14, shoulderX: 0.21, waistW: 0.13, upperArmR: 0.055, foreArmR: 0.048, thighR: 0.084, shinR: 0.064, headR: 0.118 },
      hair: { style: 'jeice', color: 0x8a3ab8 },
      face: { pupil: 0x141414, browThick: 1.1, brow: 0x6a2a8a, pointedEars: true, jaw: 1.02, eyeTilt: 0.16 },
      outfit: pirateOutfit({ top: 0x4ab0c8, arms: 0x4ab0c8, pants: 0x2a3a6a }),
      props: [
        { id: 'sword', shape: 'broadsword', joint: 'handR', pos: [0, -0.05, 0.012], rot: [2.25, 0, 0], length: 0.94, blade: 0xe6eaf0, guard: 0xe0b030, grip: 0x3a2a1a, pommel: 0xe0b030 },
        { id: 'scabbard', shape: 'sheath', joint: 'chest', pos: [0.02, 0.1, -0.215], rot: [0.16, 0, 0.62], length: 0.98, color: 0x2a2a3a, trim: 0xe0b030, grip: 0x3a2a1a, guard: 0xe0b030 },
      ],
      portraitColor: '#4ab0c8',
    },
    forms: base({ color: 0xa8e8ff, core: 0xffffff, particles: 0xc8f0ff }),
    moves: SCHOOL.sword('kg', 1.1),
    specials: {
      special1: shot('kgWave', 'Sword Wave', { icon: 'ball', pose: { wind: 'ft_cutW', release: 'ft_cut' }, projectile: { kind: 'disc', speed: 70, radius: 0.7, damage: 1600, homing: 0.4, color: 0xc8e8ff, core: 0xffffff, explode: 1.6, knock: 'heavy', knockSpeed: 20, impact: 3, guardPierce: 0.5, life: 2.2 } }),
      special2: rush('kgSlash', 'Pirate\'s Edge', [{ pose: 'ft_cut', damage: 700, frames: 9, sfx: 'swordSlash' }, { pose: 'ft_return', damage: 720, frames: 9, sfx: 'swordSlash' }, { pose: 'ft_drop', damage: 1500, frames: 18, sfx: 'swordSlash', knock: 'smash', knockSpeed: 34, impact: 4 }], { poses: { wind: 'ft_cutW', dash: 'dash' } }),
      ultimate: rush('kgStorm', 'Blade Storm', [{ pose: 'ft_cut', damage: 800, frames: 8, sfx: 'swordSlash' }, { pose: 'ft_return', damage: 800, frames: 8, sfx: 'swordSlash' }, { pose: 'ft_spin', damage: 900, frames: 10, sfx: 'swordSlash' }, { pose: 'ft_rise', damage: 1000, frames: 10, sfx: 'swordSlash', knock: 'launch', knockSpeed: 14, impact: 3 }, { pose: 'ft_drop', damage: 2400, frames: 20, sfx: 'swordSlash', knock: 'smash', knockSpeed: 42, impact: 5 }], { kiCost: 100, icon: 'ultimate', ultimate: true, poses: { wind: 'ft_cutW', dash: 'dash' }, recovery: 30 }),
    },
    mechanic: { type: 'swordsman', name: 'Sword Guard', desc: 'A guard timed on a ki blast knocks it back with the flat of the blade.' },
    ai: { personality: 'martial', aggression: 0.66, defense: 0.6, ranged: 0.35, beam: 0, transformHp: 0, preferredRange: 2.4 },
    ...end('armsCrossed', 'smirk'),
  });

  /* ============================================================== HATCHIYACK (OVA) */
  C.hatchiyack = fighter('hatchiyack', {
    name: 'Hatchiyack', fullName: 'Hatchiyack (OVA: Plan to Eradicate the Saiyans)', style: 'Tuffle Machine · Revenge',
    card: ['OVA', 'Plan to Eradicate the Saiyans'],
    blurb: 'A Tuffle machine built to turn the hatred of the dead into power — and to aim it at the Saiyans. An OVA villain, not a film\'s. Built from memory.',
    ratings: { power: 5, speed: 2, ki: 4, defense: 5 },
    stats: { hp: 30000, ki: 160, stamina: 200, speed: 0.98, power: 1.4, defense: 1.45, weight: 1.6, kiRegen: 3.6, chargeRate: 38, canonPower: 7 },
    poise: { max: 100, regen: 16, regenDelay: 100, armor: 2, cost: { 1: 5, 2: 9, 3: 14, 4: 24 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.36, skin: 0x5a7a5a, metal: 0.5,
      build: { chestW: 0.27, chestD: 0.19, shoulderX: 0.28, waistW: 0.17, upperArmR: 0.075, foreArmR: 0.07, fist: 0.08, thighR: 0.1, shinR: 0.08, headR: 0.118, neckR: 0.08 },
      hair: { style: 'skullcap', color: 0x3a4a3a },
      face: { pupil: 0xff2020, sclera: 0x1a1e1a, browThick: 1.4, brow: 0x3a4a3a, noEars: true, jaw: 1.18, jawW: 1.1, mouthColor: 0x1a1e1a },
      outfit: { topStyle: 'armor', top: 0x3a4a3a, arms: 0x5a7a5a, pants: 0x3a4a3a, pantsStyle: 'tight', boots: 0x5a7a5a, bootStyle: 'saiyan', armor: { plate: 0x6a8a6a, belly: 0x3a4a3a, pads: 0x6a8a6a, padStyle: 'up', padScale: 1.4, trim: 0xc82a2a } },
      portraitColor: '#5a7a5a',
    },
    forms: base({ color: 0xff4a4a, core: 0xffd8d8, particles: 0xff7a7a }),
    moves: SCHOOL.brawler('hy', 1.35),
    specials: {
      special1: shot('hyShot', 'Revenge Shot', { icon: 'ball', projectile: { kind: 'ball', speed: 58, radius: 1, damage: 2200, homing: 0.6, color: 0xff4a4a, core: 0xffd8d8, explode: 5, knock: 'heavy', knockSpeed: 24, impact: 3, life: 2.8 } }),
      special2: rush('hyCrush', 'Tuffle Crush', [{ pose: 'punchR', damage: 900, frames: 11, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 900, frames: 11, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2000, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 }], { armor: true }),
      ultimate: { id: 'hyRevenge', name: 'Revenge Cannon', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true, startup: 46, recovery: 44, pose: { wind: 'throwWind', release: 'throwRelease' }, projectile: { kind: 'ball', speed: 32, radius: 2.6, damage: 5600, homing: 0.5, color: 0xff3a3a, core: 0xffe0e0, explode: 14, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.5 } },
    },
    mechanic: { type: 'tireless', name: 'Machine Body', desc: 'A Tuffle machine: it does not tire and its ki refills.' },
    ai: { personality: 'berserker', aggression: 0.72, defense: 0.5, ranged: 0.4, beam: 0, transformHp: 0, preferredRange: 2.4 },
    ...end('armsCrossed', 'neutral'),
  });

  /* ============================================================== KING GURUMES (Dragon Ball film) */
  C.king_gurumes = fighter('king_gurumes', {
    name: 'King Gurumes', fullName: 'King Gurumes (Curse of the Blood Rubies)', era: 'Dragon Ball', style: 'Ruby Giant · Brute',
    card: ['Dragon Ball film', 'Curse of the Blood Rubies'],
    blurb: 'A king who ate the Blood Rubies and became a monster that is never full. The first Dragon Ball film. Built from memory.',
    ratings: { power: 4, speed: 1, ki: 2, defense: 4 },
    stats: { hp: 22000, ki: 110, stamina: 170, speed: 0.86, power: 1.15, defense: 1.2, weight: 1.8, kiRegen: 2, chargeRate: 28, canonPower: 0.3 },
    poise: { max: 80, regen: 14, regenDelay: 100, armor: 2, cost: { 1: 5, 2: 9, 3: 14, 4: 24 }, beamMul: 1.2, breakFrames: 120, vulnerable: 1.25 },
    appearance: {
      height: 1.5, skin: 0x8a9a4a,
      build: { chestW: 0.29, chestD: 0.22, shoulderX: 0.29, waistW: 0.27, waistD: 0.25, pelvisW: 0.22, upperArmR: 0.08, foreArmR: 0.074, fist: 0.084, thighR: 0.11, shinR: 0.086, headR: 0.13, neckR: 0.09, neckLen: 0.02 },
      hair: { style: 'bald', color: 0x8a9a4a },
      headExtras: [-0.35, 0, 0.35].map((x) => ({ a: [x, 0.92, 0.2], d: [x * 0.6, 1, 0], l: 0.07, r: 0.03, color: 0xe0b030, depth: 0.98, outline: 0.5 })),
      face: { pupil: 0xd02a2a, sclera: 0xfff0a0, browThick: 1.6, brow: 0x5a6a2a, jaw: 1.22, jawW: 1.12, mouthColor: 0x5a1a1a },
      outfit: { topStyle: 'bare', top: 0x8a9a4a, arms: 0x8a9a4a, belt: 0xc82a2a, beltStyle: 'sash', cape: 0xa8102a, pants: 0x5a2a6a, pantsStyle: 'harem', boots: 0x3a2a1a, bootStyle: 'saiyan' },
      portraitColor: '#a8102a',
    },
    forms: base({ color: 0xff6a8a, core: 0xffe0e8, particles: 0xff9ab0 }),
    moves: SCHOOL.brawler('gu', 1.1),
    specials: {
      special1: { id: 'guBreath', name: 'Ruby Breath', type: 'beam', kiCost: 28, icon: 'beam', fromHead: true, chargeMin: 26, chargeMax: 60, damage: [1800, 2800], radius: [0.8, 1.3], speed: 84, range: 120, sustain: 34, color: 0xff3a5a, core: 0xffe0e8, poses: { charge: 'powerCrouch', fire: 'powerUp' }, recovery: 30 },
      special2: { id: 'guStomp', name: 'Royal Stomp', type: 'groundSlam', kiCost: 26, icon: 'down', cooldown: 220, crouch: 20, hang: 22, height: 4, maxRange: 14, radius: 8, clearHeight: 2.2, damage: 2000, knockSpeed: 20, recovery: 36, ringColor: 0xff6a8a, coreColor: 0xffe0e8, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' } },
      ultimate: rush('guFeast', 'Endless Hunger', [{ pose: 'punchR', damage: 900, frames: 12, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 900, frames: 12, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2600, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 }], { kiCost: 100, icon: 'ultimate', ultimate: true, armor: true, recovery: 32 }),
    },
    ai: { personality: 'berserker', aggression: 0.7, defense: 0.4, ranged: 0.3, beam: 0.3, transformHp: 0, preferredRange: 2.2 },
    ...end('armsCrossed', 'grin'),
  });

  /* ============================================================== LUCIFER (Dragon Ball film) */
  C.lucifer = fighter('lucifer', {
    name: 'Lucifer', fullName: 'Lucifer (Sleeping Princess in Devil\'s Castle)', era: 'Dragon Ball', style: 'Vampire Lord · Shadows',
    card: ['Dragon Ball film', 'Sleeping Princess in Devil\'s Castle'],
    blurb: 'The vampire lord of the Devil\'s Castle, who wants the Sleeping Princess to blot out the sun. Built from memory.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 14000, ki: 130, stamina: 120, speed: 1.1, power: 0.98, defense: 0.92, weight: 0.9, kiRegen: 3, chargeRate: 34, canonPower: 0.2 },
    appearance: {
      height: 1.02, skin: 0xb8c0d8,
      build: { chestW: 0.19, chestD: 0.125, shoulderX: 0.19, waistW: 0.12, upperArmR: 0.046, foreArmR: 0.042, thighR: 0.078, shinR: 0.058, headR: 0.118 },
      hair: { style: 'zarbon', color: 0x141418 },
      face: { pupil: 0xd02a2a, eyeTilt: 0.22, browThick: 1.0, brow: 0x141418, pointedEars: true, jaw: 0.98, mouthColor: 0x6a1a2a },
      outfit: { topStyle: 'shirt', top: 0xf0f0ea, sleeves: 'long', sleeveColor: 0x1e1e24, arms: 0x1e1e24, jacket: { color: 0x1e1e24, open: 1.0, collar: 0x8a1a2a }, pants: 0x1e1e24, pantsStyle: 'slacks', boots: 0x141418, bootStyle: 'shoe', cape: 0x141418 },
      portraitColor: '#8a1a2a',
    },
    forms: base({ color: 0x8a3aff, core: 0xe0c8ff, particles: 0xa86aff }),
    moves: SCHOOL.swift('lu', 1.0),
    specials: {
      special1: shot('luLaser', 'Devil\'s Laser', { pose: { wind: 'g_finger', release: 'g_finger' }, projectile: { kind: 'blast', speed: 90, radius: 0.26, damage: 1300, homing: 0.15, color: 0xff3a5a, core: 0xffe0e8, explode: 1.8, knock: 'heavy', knockSpeed: 18, impact: 3, life: 2, guardPierce: true } }),
      special2: { id: 'luBats', name: 'Into the Dark', type: 'teleport', kiCost: 14, icon: 'teleport', startup: 4, recovery: 6, cooldown: 45, escapeKiCost: 24, followWindow: 34, followBonus: 1.3, pose: 'g_kickW', modes: { behind: true, above: true }, shimmer: true },
      ultimate: wave('luWave', 'Moonless Night', 0x8a3aff, 3800, { radius: [1.3, 1.3] }),
    },
    ai: { personality: 'adaptive', aggression: 0.56, defense: 0.5, ranged: 0.5, beam: 0.35, transformHp: 0, preferredRange: 3.4 },
    ...end('armsCrossed', 'wicked'),
  });

  /* ============================================================== DR. KOCHIN (support role) */
  C.dr_kochin = {
    id: 'dr_kochin', assetLevel: 1, name: 'Dr. Kochin', fullName: 'Dr. Kochin (Dr. Wheelo\'s scientist)', era: 'Movie',
    playable: false, support: true, prototype: true,
    blurb: 'Dr. Wheelo\'s loyal scientist, who kept his master\'s brain alive for fifty years. A support-role model. Built from memory.',
    stats: { hp: 6000, ki: 60, stamina: 100, speed: 1, power: 0.3, defense: 0.5, weight: 0.8, kiRegen: 1, chargeRate: 20, canonPower: 0.05 },
    appearance: {
      height: 0.8, skin: 0xe8c0a0,
      build: { chestW: 0.17, chestD: 0.13, shoulderX: 0.16, waistW: 0.15, upperArmR: 0.04, foreArmR: 0.036, thighR: 0.062, shinR: 0.048, headR: 0.13 },
      hair: { style: 'bald', color: 0xd8d8d0 },
      face: { pupil: 0x141414, browThick: 1.2, brow: 0xd8d8d0, jaw: 1.0 },
      outfit: { topStyle: 'shirt', top: 0x3a3a3a, sleeves: 'long', sleeveColor: 0xf0f0ea, arms: 0xf0f0ea, jacket: { color: 0xf0f0ea, open: 0.6 }, hem: { color: 0xf0f0ea, len: 0.4, flare: 1.2 }, pants: 0x3a3a3a, pantsStyle: 'slacks', boots: 0x1e1e24, bootStyle: 'shoe' },
      props: [{ id: 'glasses', shape: 'glasses', joint: 'head', pos: [0, 0.1375, 0.126], color: 0x2a2a3a }],
      portraitColor: '#f0f0ea',
    },
    forms: base(),
    poses: { idle: (t) => ({ root: { y: 0 }, spine: [16, 0, 0], chest: [4, 0, 0], head: [-14, 0, 0], shoulderL: [-20, -20, 14], elbowL: [-90, 0, 0], shoulderR: [-20, 20, -14], elbowR: [-90, 0, 0], thighL: [-2, 2, 8], kneeL: [6, 0, 0], thighR: [-2, -2, -8], kneeR: [6, 0, 0], hands: ['open', 'open'] }) },
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'idle', expression: 'wicked' },
  };
})();
