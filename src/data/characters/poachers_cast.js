/*
 * THE SPACE POACHERS (Chapter 21 · Universe Survival, "The Park Ranger" — episode 87's alien poachers who come for
 * the animals on Android 17's island). Story enemies, not playable. LEVEL 1 STAND-INS: the episode's designs are not
 * modelled — these are the Frieza Force archetypes (src/data/characters/frieza_force.js: their rig, moves and AI) in
 * grubby work suits with goggles and caps instead of armour and scouters, so they read as a crew of thieves, not an
 * army. The boss is the elite archetype in a long coat. Numbers are the archetypes' own.
 *   poacher         : melee grunt
 *   poacher_gunner  : keeps his distance, blaster volleys
 *   poacher_boss    : the heavy who runs the ship (the boss 17 takes on)
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const skins = [0x9ab07a, 0xb08a6a, 0x7a9ab0, 0xc0a07a, 0x8a7ab0];
  // a work suit, a tool belt, goggles pushed up on a cap
  const suit = (body, trim) => ({
    top: body, arms: body, pants: body, pantsStyle: 'tight', sleeves: 'long', sleeveColor: body,
    belt: 0x4a3a28, beltStyle: 'belt', buckle: 0xb8a070,
    gloves: 0x3a3a3a, boots: 0x2e2a26, bootStyle: 'saiyan', bootTip: trim,
  });
  const goggles = (lens) => [
    { a: [0.55, 0.62, 0.55], d: [0, 0, 1], l: 0.05, r: 0.035, color: lens },
    { a: [-0.55, 0.62, 0.55], d: [0, 0, 1], l: 0.05, r: 0.035, color: lens },
  ];
  const quiet = { barks: {}, intro: { pose: 'taunt', expression: 'smirk' }, victory: { poses: ['taunt'], expression: 'smirk' } };

  C.poacher = Object.assign({}, C.frieza_soldier, quiet, {
    id: 'poacher',
    assetLevel: 1,
    name: 'Space Poacher',
    era: 'Universe Survival',
    style: 'Poacher',
    appearance: {
      height: 0.94,
      skin: skins[0],
      skinVariants: skins,
      build: { chestW: 0.19, upperArmR: 0.052 },
      hair: { style: 'skullcap', color: 0x5a5244 },
      headExtras: goggles(0x6ad8a0),
      face: { pupil: 0x111111, brow: 0x2a1d1a },
      outfit: suit(0x6a5a3a, 0x9a7a3a),
      portraitColor: '#6a5a3a',
    },
  });

  C.poacher_gunner = Object.assign({}, C.frieza_gunner, quiet, {
    id: 'poacher_gunner',
    assetLevel: 1,
    name: 'Poacher Gunner',
    era: 'Universe Survival',
    style: 'Poacher',
    // the capture-gun bolts: green, like the ship's beam
    blast: Object.assign({}, C.frieza_gunner.blast, { color: 0x5aff8a, core: 0xe0ffe8 }),
    appearance: {
      height: 0.92,
      skin: skins[2],
      skinVariants: skins,
      build: { chestW: 0.18, upperArmR: 0.05 },
      hair: { style: 'skullcap', color: 0x3a4a52 },
      headExtras: goggles(0xffd04a),
      face: { pupil: 0x111111, brow: 0x333333 },
      outfit: suit(0x3a4a3a, 0x5a8a4a),
      portraitColor: '#3a4a3a',
    },
  });

  C.poacher_boss = Object.assign({}, C.frieza_elite, quiet, {
    id: 'poacher_boss',
    assetLevel: 1,
    name: 'Poacher Boss',
    fullName: 'The Poacher Boss (the ship\'s captain)',
    era: 'Universe Survival',
    style: 'Poacher',
    // ponytail: provisional — the elite archetype's body; a little more health so 17's fight has room (the owner judges)
    stats: Object.assign({}, C.frieza_elite.stats, { hp: 5200 }),
    // the archetype's cannon under the ship's own name (same numbers)
    specials: Object.assign({}, C.frieza_elite.specials, {
      special1: Object.assign({}, C.frieza_elite.specials.special1, {
        id: 'poacherCannon', name: 'Net Cannon',
        projectile: Object.assign({}, C.frieza_elite.specials.special1.projectile, { color: 0x5aff8a, core: 0xe0ffe8 }),
      }),
    }),
    appearance: {
      height: 1.18,
      skin: 0x8a9a6a,
      build: { chestW: 0.26, shoulderX: 0.25, waistW: 0.2, waistD: 0.17, upperArmR: 0.07, foreArmR: 0.064, thighR: 0.1, shinR: 0.078, fist: 0.07, headR: 0.118 },
      hair: { style: 'bald', color: 0x3a3a2a },
      headExtras: [
        { a: [0.6, 0.7, 0.1], d: [0.4, 1, -0.3], l: 0.09, r: 0.028, color: 0x4a4a3a },
        { a: [-0.6, 0.7, 0.1], d: [-0.4, 1, -0.3], l: 0.09, r: 0.028, color: 0x4a4a3a },
      ],
      face: { pupil: 0xffb02a, sclera: 0x2a2a1a, brow: 0x3a3a2a, browThick: 1.4 },
      outfit: Object.assign(suit(0x5a2a2a, 0xc0a040), { topStyle: 'gi', top: 0x5a2a2a, belt: 0xc0a040, buckle: 0xffe08a }),
      portraitColor: '#5a2a2a',
    },
    ai: Object.assign({}, C.frieza_elite.ai, { aggression: 0.7, defense: 0.45 }),
  });
})();
