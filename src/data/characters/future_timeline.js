/*
 * CHAPTER 5 SUPPORTING CAST (Age 764, and a future that has not happened yet)
 *
 *   bulma         Capsule Corporation's heiress, waiting with the others for Goku's pod. She
 *                 notices the logo on the stranger's jacket before anybody else does.
 *   future_gohan  Trunks' teacher in the ruined future: the orange gi, one arm, the scar. He is
 *                 only ever seen in Trunks' memory (`trunks_future`), never fought or played.
 *
 * Both are Level 1 functional prototypes and story only. The schema asks every character for a
 * minimal kit, so each has one, but no mission puts either of them in a fight. Future Gohan is
 * adult Gohan's body with the future's changes (the scar, the missing left arm: appearance.missingArm).
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ Bulma */

  const bulmaPoses = {
    bu_idle: (t) => {
      const b = Math.sin(t * 1.9);
      return {
        root: { y: -0.01 + b * 0.006 },
        hips: [0, -6, 0], spine: [2, 0, 0], chest: [2, 6, 0], head: [-3, -6, 0],
        shoulderL: [-6, 0, 14], elbowL: [-24, 0, 0], shoulderR: [-10, 0, -10], elbowR: [-60, 0, 0],
        thighL: [-4, 2, 6], kneeL: [6, 0, 0], thighR: [4, -4, -6], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // one hand on the hip, leaning in: something has caught her eye
    bu_curious: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.02, rx: 6 },
        hips: [0, 8, 0], spine: [8, 0, 0], chest: [8, -6, 0], neck: [6, 0, 0], head: [6 + b, 10, 0],
        shoulderL: [-10, 0, 40], elbowL: [-90, 0, 0], shoulderR: [-50, 0, -12], elbowR: [-40, 0, 0],
        thighL: [-4, 0, 6], kneeL: [8, 0, 0], thighR: [8, 0, -8], kneeR: [12, 0, 0],
        hands: ['fist', 'point'],
      };
    },
    bu_wave: (t) => {
      const b = Math.sin(t * 9);
      return {
        root: { y: -0.01 },
        chest: [-2, -4, 0], head: [-6, 4, 0],
        shoulderR: [-160, 0, -24 + b * 10], elbowR: [-30, 0, 0], shoulderL: [-8, 0, 12], elbowL: [-20, 0, 0],
        thighL: [-4, 0, 6], kneeL: [6, 0, 0], thighR: [4, 0, -6], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    bu_slapW: {
      root: { y: -0.02 }, chest: [2, -20, 0], head: [-2, 12, 0],
      shoulderR: [-40, 0, -70], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 8], kneeL: [14, 0, 0], thighR: [8, 0, -8], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    bu_slap: {
      root: { y: -0.03 }, chest: [4, 24, 0], head: [-2, -14, 0],
      shoulderR: [-86, 0, 20], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-40, 0, 0],
      thighL: [-16, 0, 8], kneeL: [18, 0, 0], thighR: [10, 0, -8], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.bulma = {
    id: 'bulma',
    assetLevel: 1,
    name: 'Bulma',
    fullName: 'Bulma (Age 764)',
    era: 'Android Saga',
    playable: false,
    prototype: true,
    style: 'Family',
    blurb: 'She built the Dragon Radar at sixteen, and she knows her own company’s logo when she sees it.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 5000, ki: 30, stamina: 70, speed: 0.9, power: 0.5, defense: 0.6, weight: 0.8, kiRegen: 1, chargeRate: 10, canonPower: 0.01 },
    appearance: {
      height: 0.9,
      skin: 0xf8d8ba,
      build: { chestW: 0.185, chestD: 0.14, shoulderX: 0.185, waistW: 0.145, upperArmR: 0.043, foreArmR: 0.038, fist: 0.044, thighR: 0.078, shinR: 0.058, headR: 0.142, neckLen: 0.056 },
      // her son's bob is hers, in her colour (approximate: no reference supplied for her look)
      hair: { style: 'trunks', color: 0x3aa8c0 },
      face: { pupil: 0x2a5a9a, eyeW: 1.08 },
      outfit: {
        topStyle: 'shirt', top: 0xd84a5a, sleeves: 'long', sleeveColor: 0xd84a5a,
        pants: 0x3a4a78, pantsStyle: 'slacks', belt: 0x2a2a2a, beltStyle: 'belt', buckle: 0xd8d0b0,
        boots: 0xe8e0d4, bootStyle: 'shoe',
      },
      portraitColor: '#3aa8c0',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: bulmaPoses.bu_idle }, bulmaPoses),
    moves: {
      light: [
        { id: 'buSlap', startup: 8, active: 3, recovery: 16, cancel: 12, damage: 60, reach: 0.9, radius: 0.6, lunge: 6, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'bu_slapW', strike: 'bu_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
      ],
      heavy: {},
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'adaptive', aggression: 0.1, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 4 },
    intro: { pose: 'bu_idle', expression: 'neutral' },
    victory: { poses: ['bu_wave'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'hurt' },
  };

  /* ------------------------------------------------------------------ Future Gohan */

  const AG = SL.data.characters.adult_gohan;
  const futurePoses = {
    // the teacher's stance: one arm, weight low, nothing wasted
    fg_stance: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.05 + b * 0.008 },
        hips: [0, -12, 0], spine: [6, 0, 0], chest: [6, 12, 0], head: [-6, -10, 0],
        shoulderR: [-50, 0, -18], elbowR: [-96, 0, 0], shoulderL: [-6, 0, 12], elbowL: [0, 0, 0],
        thighL: [-24, 8, 14], kneeL: [36, 0, 0], thighR: [14, -8, -14], kneeR: [26, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // his hand on the boy's shoulder
    fg_teach: {
      root: { y: -0.01 }, chest: [4, -8, 0], head: [10, 8, 0],
      shoulderR: [-78, 0, 12], elbowR: [-20, 0, 0], shoulderL: [-6, 0, 10], elbowL: [0, 0, 0],
      thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['fist', 'open'],
    },
    // face down in the rubble, in the rain
    fg_fallen: {
      root: { y: -0.84, rx: 88 }, spine: [0, 0, 0], chest: [0, 0, 0], head: [-10, 30, 0],
      shoulderR: [-170, 0, -30], elbowR: [-10, 0, 0], shoulderL: [-10, 0, 10], elbowL: [0, 0, 0],
      thighL: [0, 0, 8], kneeL: [10, 0, 0], thighR: [0, 0, -6], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.future_gohan = Object.assign({}, AG, {
    id: 'future_gohan',
    name: 'Gohan',
    fullName: 'Son Gohan (the future Trunks came from)',
    era: 'Future Timeline',
    playable: true, // Free Battle after "What He Came To Say" (unlocks.js): his own one-armed fighter, never the present Gohan
    blurb: 'Trunks’ teacher, and the last of the Z Fighters in a world the Androids took apart.',
    appearance: Object.assign({}, AG.appearance, {
      face: Object.assign({}, AG.appearance.face, { scar: true }),
      // lost to the Androids: the arm is gone below the shoulder
      missingArm: 'L',
      // his own clothes, not the Buu Saga Gohan's: the orange gi over a navy undershirt, worn
      outfit: {
        topStyle: 'gi', top: 0xe8721e, sleeves: 'short', sleeveColor: 0x2a4a9a, under: 0x2a4a9a,
        wrist: 0x2a4a9a, belt: 0x2a4a9a, pants: 0xe8721e, pantsStyle: 'gi', boots: 0x2a4a9a, bootStyle: 'gi', worn: true,
      },
      portraitColor: '#c86a2a',
    }),
    // he never reached the second level in that timeline, and the Elder Kai's release is the present Gohan's (the
    // owner's reference: no transformation a character never had) — base and Super Saiyan only
    forms: AG.forms.filter((f) => f.id === 'base' || f.id === 'ssj'),
    // the Ultimate form's wheel rushes stay adult Gohan's: this Gohan never reaches it
    extras: (AG.extras || []).filter((x) => !x.forms || x.forms.some((id) => id === 'base' || id === 'ssj')),
    poses: Object.assign({}, AG.poses, futurePoses),
    intro: { pose: 'fg_stance', expression: 'calm' },
  });
})();
