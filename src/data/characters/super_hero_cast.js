/*
 * DRAGON BALL SUPER: SUPER HERO — story cast (the owner's moveset roadmap #63, 2026-10-17). Level 1 functional
 * prototypes: shapes and colours, not production art.
 *
 *   CELL MAX   the Red Ribbon Army's last weapon, woken before he was finished: a giant built on Cell's body — the
 *              crown swept back into two points, crimson all over, purple on the belly and the crown, staring
 *              yellow eyes. Not playable: a GIANT BOSS on the Great Ape's machinery (great_ape.js — its body plan,
 *              poses, stomp / sweep / grab / roar, hit zones and boss phases), so nothing new in the engine. His
 *              head is the weak point (x1.6), as the film has it.
 */
(function () {
  'use strict';
  const GA = SL.data.characters.great_ape_vegeta;
  const RED = 0xc8283a, RED_DARK = 0x8a1a2a, PURPLE = 0x5a2a7a, CROWN_DARK = 0x2a1030, BELLY = 0x7a3a8a;

  // the head: Cell's crown, in his colours — a purple plate between two dark points sweeping back
  const crown = [
    { a: [0, 0.92, 0.36], d: [0, 1, -0.55], l: 0.2, r: 0.075, color: PURPLE, flat: 0.22, depth: 0.94 },
    { a: [0.38, 0.86, 0.3], d: [0.3, 1, -0.7], l: 0.3, r: 0.085, color: CROWN_DARK, flat: 0.22, depth: 0.95 },
    { a: [-0.38, 0.86, 0.3], d: [-0.3, 1, -0.7], l: 0.3, r: 0.085, color: CROWN_DARK, flat: 0.22, depth: 0.95 },
    { a: [0.45, 0.55, -0.6], d: [0.3, 0.2, -1], l: 0.18, r: 0.07, color: CROWN_DARK, flat: 0.3, depth: 0.95 },
    { a: [-0.45, 0.55, -0.6], d: [-0.3, 0.2, -1], l: 0.18, r: 0.07, color: CROWN_DARK, flat: 0.3, depth: 0.95 },
    { shape: 'ball', a: [0, 0.45, -0.8], d: [0, 0.3, -1], l: 0.13, r: 0.135, color: CROWN_DARK, flat: 0.55, depth: 0.82 },
    { shape: 'line', a: [0.3, -0.02, 0.94], d: [0.12, -1, 0.15], l: 0.09, r: 0.014, color: CROWN_DARK },
    { shape: 'line', a: [-0.3, -0.02, 0.94], d: [-0.12, -1, 0.15], l: 0.09, r: 0.014, color: CROWN_DARK },
  ];

  const boss = Object.assign({}, GA.boss, {
    phases: [
      { id: 'rampage', label: 'RAMPAGE', hpAbove: 0.5, speed: 1, damage: 0.85, patience: 0.8, patterns: { melee: 0.8, stomp: 0.9, sweep: 0.8, grab: 0.5, beam: 0.45, roar: 0.25 } },
      { id: 'berserk', label: 'BERSERK', hpAbove: 0, speed: 1.15, damage: 1, patience: 0.5, enter: 'roar', patterns: { melee: 0.9, stomp: 1, sweep: 0.9, grab: 0.7, beam: 0.6, blast: 0.5 } },
    ],
  });

  SL.data.characters.cell_max = {
    id: 'cell_max',
    assetLevel: 1,
    name: 'Cell Max',
    fullName: 'Cell Max (Red Ribbon Army)',
    era: 'Super Hero',
    playable: false,
    boss: true,
    giant: true,
    flight: false,
    style: 'Giant',
    blurb: 'The Red Ribbon Army\'s last weapon, woken before he was finished: a giant with Cell\'s body and nothing behind the eyes but the urge to destroy.',
    ratings: { power: 5, speed: 2, ki: 4, defense: 5 },
    stats: { hp: 48000, ki: 120, stamina: 320, speed: 0.6, power: 1.45, defense: 1.4, weight: 10, kiRegen: 3, chargeRate: 26, canonPower: 12 },
    poise: Object.assign({}, GA.poise, { max: 240 }),
    appearance: {
      height: 7.2,
      skin: RED,
      build: Object.assign({}, GA.appearance.build, { headR: 0.15, footLen: 1.2 }),
      hair: null,
      headExtras: crown,
      face: { noEars: true, sclera: 0xffe24a, pupil: 0x2a0008, brow: CROWN_DARK, browThick: 1.6, eyeW: 1.2, lash: CROWN_DARK },
      outfit: {
        topStyle: 'bare', top: RED, pecs: RED, abs: BELLY, arms: RED,
        pants: RED, pantsStyle: 'tight', legs: RED_DARK,
        boots: CROWN_DARK, bootStyle: 'shoe',
      },
      portraitColor: '#c8283a',
    },
    // his head is the weak point (the film's); no tail to break
    hitZones: GA.hitZones.filter((z) => z.id !== 'tail').map((z) => (z.id === 'head' ? Object.assign({}, z, { damageMul: 1.6 }) : z)),
    vfx: { ghost: 0xff7a8a },
    audio: GA.audio,
    forms: [{ id: 'base', name: 'Cell Max', aura: { color: 0xff3a4a, core: 0xffd8d8, particles: 0xff7a8a }, mult: {} }],
    poses: GA.poses,
    moves: GA.moves,
    specials: {
      special1: Object.assign({}, GA.specials.special1, { id: 'cmBeam', name: 'Max Beam', color: 0xff3a5a, core: 0xfff0f0 }),
      special2: Object.assign({}, GA.specials.special2, { id: 'cmBlast', name: 'Max Blast', projectile: Object.assign({}, GA.specials.special2.projectile, { color: 0xff5a6a }) }),
    },
    mechanic: { type: 'boss', name: 'Giant', desc: 'Huge poise and hit zones; the head is his weak point.' },
    boss,
    ai: GA.ai,
    barks: {},
    intro: { pose: 'ga_roar', expression: 'shout' },
    victory: { poses: ['ga_chestBeat'], expression: 'shout' },
    defeat: { pose: 'ga_winded', expression: 'hurt' },
  };
})();
