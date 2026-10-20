/*
 * UNIVERSE SURVIVAL STORY CAST (Chapter 21, "The Tenth Warrior" — episodes 93–95: Frieza revived for a day at the
 * Fortuneteller Crone's palace, and Universe 9's assassins sent to kill him). Story characters, not playable.
 * LEVEL 1 STAND-INS — the episodes' designs are not modelled:
 *   fortuneteller_baba : the Crone — a tiny old woman in a tall pointed hat, sitting on her crystal ball. She does not
 *                        fight (Master Roshi's rig and kit underneath, never used in a fight)
 *   u9_assassin        : one of the squad Universe 9's gods send (the Frieza Force melee archetype in a dark suit
 *                        and visor)
 *   u9_gunner          : the same squad, blasters (the gunner archetype)
 *   u9_leader          : their doglike leader (the elite archetype with a dog's ears and muzzle), who carries a ball
 *                        of a god's destruction energy (the mission stages it)
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const quiet = { barks: {}, intro: { pose: 'taunt', expression: 'smirk' }, victory: { poses: ['taunt'], expression: 'smirk' } };

  /* -------------------------------------------------------------- THE FORTUNETELLER CRONE */
  const PURPLE = 0x5a2a6a, BALL = 0xd8e2ff, SKIN = 0xe8c8a8;
  const HEAD = 0.118;
  C.fortuneteller_baba = Object.assign({}, C.roshi, {
    id: 'fortuneteller_baba',
    assetLevel: 1,
    name: 'Fortuneteller Baba',
    fullName: 'Fortuneteller Baba (the Crone)',
    era: 'Universe Survival',
    playable: false,
    style: 'Fortuneteller',
    blurb: 'Roshi\'s older sister, who can bring the dead back for a day.',
    appearance: {
      height: 0.6, skin: SKIN,
      build: { chestW: 0.16, chestD: 0.13, shoulderX: 0.16, waistW: 0.14, upperArmR: 0.04, foreArmR: 0.036, fist: 0.04, thighR: 0.06, shinR: 0.048, headR: HEAD, neckLen: 0.04 },
      hair: { style: 'bald', color: 0xd8d8d0 },
      face: { pupil: 0x1a1a1a, eyeW: 0.7, brow: 0xd8d8d0, browThick: 1.2, nose: 1.3, jaw: 0.9 },
      props: [
        // the tall pointed hat and its brim
        { id: 'hat', shape: 'spike', joint: 'head', pos: [0, HEAD * 0.95, -0.01], rot: [-0.12, 0, 0], size: [HEAD * 1.05, 0.3, 1], color: PURPLE, outline: 0.6 },
        { id: 'brim', shape: 'ball', joint: 'head', pos: [0, HEAD * 0.82, 0], size: [HEAD * 1.9, 0.014, HEAD * 1.9], color: PURPLE, outline: 0.5 },
        // the crystal ball she sits on
        { id: 'crystal', shape: 'ball', joint: 'hips', pos: [0, -0.2, 0.02], size: [0.17, 0.17, 0.17], color: BALL, outline: 0.4 },
      ],
      outfit: {
        topStyle: 'shirt', top: PURPLE, sleeves: 'long', sleeveColor: PURPLE, arms: PURPLE,
        belt: 0xd8b04a, beltStyle: 'sash', pants: PURPLE, pantsStyle: 'gi', boots: 0x3a2a3a, bootStyle: 'shoe',
      },
      portraitColor: '#5a2a6a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xd8e2ff, core: 0xffffff, particles: 0xe8eeff, speed: 0.8 }, mult: {} }],
    poses: Object.assign({}, C.roshi.poses, {
      // sitting cross-legged on the ball, hands folded in her lap (hands are [left, right])
      bb_sit: (t) => ({
        root: { y: 0.12 + Math.sin(t * 1.6) * 0.012 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [4, 0, 0],
        shoulderL: [-20, 0, 18], elbowL: [-70, 0, 0], shoulderR: [-20, 0, -18], elbowR: [-70, 0, 0],
        thighL: [-82, 30, 22], kneeL: [120, 0, 0], thighR: [-82, -30, -22], kneeR: [120, 0, 0],
        hands: ['open', 'open'],
      }),
      // the revival: both hands raised over the ball
      bb_conjure: (t) => ({
        root: { y: 0.12 + Math.sin(t * 6) * 0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 0],
        shoulderL: [-130, 0, 30], elbowL: [-20, 0, 0], shoulderR: [-130, 0, -30], elbowR: [-20, 0, 0],
        thighL: [-82, 30, 22], kneeL: [120, 0, 0], thighR: [-82, -30, -22], kneeR: [120, 0, 0],
        hands: ['open', 'open'],
      }),
    }),
  });
  C.fortuneteller_baba.poses.idle = C.fortuneteller_baba.poses.bb_sit;

  /* -------------------------------------------------------------- UNIVERSE 9'S ASSASSINS */
  const skins = [0x8a7ab0, 0x7aa0a0, 0xa08a7a, 0x9a9a6a];
  // a dark bodysuit, a visor across the eyes
  const suit = (body, trim) => ({
    top: body, arms: body, pants: body, pantsStyle: 'tight', sleeves: 'long', sleeveColor: body,
    belt: trim, beltStyle: 'belt', buckle: 0xc0c0c8,
    gloves: 0x1a1a22, boots: 0x1a1a22, bootStyle: 'saiyan', bootTip: trim,
  });
  const visor = (color) => [{ shape: 'ball', a: [0, 0.1, 1], d: [1, 0, 0], l: 0.1, r: 0.035, color, flat: 0.5, outline: 0.4 }];

  C.u9_assassin = Object.assign({}, C.frieza_soldier, quiet, {
    id: 'u9_assassin',
    assetLevel: 1,
    name: 'Universe 9 Assassin',
    era: 'Universe Survival',
    style: 'Assassin',
    appearance: {
      height: 0.96,
      skin: skins[0],
      skinVariants: skins,
      build: { chestW: 0.19, upperArmR: 0.052 },
      hair: { style: 'skullcap', color: 0x2a2a34 },
      headExtras: visor(0xd04aff),
      face: { pupil: 0x111111, brow: 0x2a2a34 },
      outfit: suit(0x24222e, 0x6a3a8a),
      portraitColor: '#24222e',
    },
  });

  C.u9_gunner = Object.assign({}, C.frieza_gunner, quiet, {
    id: 'u9_gunner',
    assetLevel: 1,
    name: 'Universe 9 Gunner',
    era: 'Universe Survival',
    style: 'Assassin',
    blast: Object.assign({}, C.frieza_gunner.blast, { color: 0xd04aff, core: 0xf4e0ff }),
    appearance: {
      height: 0.93,
      skin: skins[1],
      skinVariants: skins,
      build: { chestW: 0.18, upperArmR: 0.05 },
      hair: { style: 'skullcap', color: 0x2a2a34 },
      headExtras: visor(0xff4a8a),
      face: { pupil: 0x111111, brow: 0x333333 },
      outfit: suit(0x2a2430, 0x8a3a5a),
      portraitColor: '#2a2430',
    },
  });

  C.u9_leader = Object.assign({}, C.frieza_elite, quiet, {
    id: 'u9_leader',
    assetLevel: 1,
    name: 'The Assassins\' Leader',
    fullName: 'The Assassins\' Leader (Universe 9, doglike)',
    era: 'Universe Survival',
    style: 'Assassin',
    // ponytail: provisional — the elite archetype's numbers
    appearance: {
      height: 1.08,
      skin: 0xb08a5a,
      build: { chestW: 0.23, shoulderX: 0.23, waistW: 0.18, waistD: 0.15, upperArmR: 0.064, foreArmR: 0.058, thighR: 0.094, shinR: 0.074, fist: 0.064, headR: 0.12 },
      hair: { style: 'bald', color: 0x7a5a34 },
      // a dog's ears and muzzle
      headExtras: [
        { a: [0.62, 0.62, -0.1], d: [0.5, 1, -0.2], l: 0.12, r: 0.045, color: 0x6a4a2a, flat: 0.4 },
        { a: [-0.62, 0.62, -0.1], d: [-0.5, 1, -0.2], l: 0.12, r: 0.045, color: 0x6a4a2a, flat: 0.4 },
        { shape: 'ball', a: [0, -0.25, 0.95], d: [0, -0.2, 1], l: 0.07, r: 0.06, color: 0xc8a070, flat: 0.8, outline: 0.5 },
        { shape: 'ball', a: [0, -0.05, 1.12], d: [0, 0, 1], l: 0.025, r: 0.025, color: 0x1a1a1a, outline: 0.3 },
      ],
      face: { pupil: 0x1a1a1a, sclera: 0xf0e8d0, brow: 0x5a3a1a, browThick: 1.3 },
      outfit: suit(0x1e1c26, 0xb0a040),
      portraitColor: '#1e1c26',
    },
    ai: Object.assign({}, C.frieza_elite.ai, { aggression: 0.65, defense: 0.5 }),
  });
})();
