/*
 * THE SUPREME KAI and KIBITO (Buu Saga, Age 774) — the god above King Kai,
 * who entered a martial arts tournament under the name "Shin", and his attendant.
 *
 * The Supreme Kai is a story character in Milestone B: calm, formal, small, and
 * frightened of one thing, which he will not name until he has to. His identity
 * is carried by how he stands (hands behind his back, perfectly still), by the
 * one gesture he uses (an open palm raised to stop somebody), and by the fact
 * that Piccolo forfeits against him before a blow is thrown. He is given a
 * compact kit so the engine can stage him, and so the Kibito Kai / Potara arc
 * has something to build on; he is not playable yet.
 *
 * Kibito is his bodyguard: tall, pink, silent, and the one who heals Gohan and
 * carries everybody with Instant Movement. Story only.
 *
 * Level 1 functional prototypes; not playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // hands clasped behind the back, chin level: a god who does not fidget
    sk_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: b * 0.004 },
        hips: [0, 0, 0], spine: [-2, 0, 0], chest: [-3, 0, 0], head: [-2, 0, 0],
        shoulderL: [30, 0, 16], elbowL: [-70, 0, 0], shoulderR: [30, 0, -16], elbowR: [-70, 0, 0],
        thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // one palm up: stop
    sk_halt: {
      root: { y: 0 }, spine: [-2, 8, 0], chest: [-3, 10, 0], head: [-4, -6, 0],
      shoulderR: [-100, 0, -10], elbowR: [-40, 0, 0], shoulderL: [30, 0, 16], elbowL: [-70, 0, 0],
      thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['open', 'open'],
    },
    // the pointed finger at the thing he is afraid of
    sk_point: {
      root: { y: 0 }, spine: [2, -10, 0], chest: [2, -12, 0], head: [-4, 8, 0],
      shoulderR: [-88, 0, 4], elbowR: [-4, 0, 0], shoulderL: [30, 0, 16], elbowL: [-70, 0, 0],
      thighL: [-8, 0, 8], kneeL: [10, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['open', 'point'],
    },
    sk_palmW: { ...C.blastWind },
    sk_palm: { ...C.blastR },
    // Kibito: arms folded, looking down at everybody
    kb_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: b * 0.004 }, spine: [-2, 0, 0], chest: [-2, 0, 0], head: [4, 0, 0],
        // folded across the chest (the rig's folded-arms angles, as Videl's vd_arms)
        shoulderL: [-14, -72, 6], elbowL: [-94, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-90, 0, 0],
        thighL: [-2, 2, 8], kneeL: [4, 0, 0], thighR: [-2, -2, -8], kneeR: [4, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the hand up and open at somebody who can no longer move: telekinesis, held
    kb_freeze: (t) => {
      const s = Math.sin(t * 20) * 1.5;
      return {
        root: { y: -0.03 }, spine: [2, 0, 0], chest: [0, -12, 0], head: [-2, 8, 0],
        shoulderR: [-92 + s, 0, -6], elbowR: [-4, 0, 0], handR: [-68, 0, 0], shoulderL: [4, 0, 14], elbowL: [-10, 0, 0],
        thighL: [-12, 0, 10], kneeL: [12, 0, 0], thighR: [10, 0, -10], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // hands held out over somebody: the healing
    kb_heal: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.3, rx: 16 }, spine: [18, 0, 0], chest: [14, 0, 0], head: [20, 0, 0],
        shoulderL: [-70, 0, -8], elbowL: [-10 + b * 3, 0, 0], shoulderR: [-70, 0, 8], elbowR: [-10 + b * 3, 0, 0],
        thighL: [-70, 4, 10], kneeL: [100, 0, 0], thighR: [-20, -4, -10], kneeR: [60, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  const kaiMove = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 5, active: 3, recovery: 12, cancel: 7, damage: dmg, reach: 1.1, radius: 0.75, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);

  SL.data.characters.supreme_kai = {
    id: 'supreme_kai',
    assetLevel: 1,
    name: 'Supreme Kai',
    fullName: 'The Supreme Kai ("Shin")',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'God of Creation',
    blurb: 'He entered a martial arts tournament to find two men. He did not come for the prize money.',
    ratings: { power: 3, speed: 4, ki: 4, defense: 3 },
    stats: { hp: 20000, ki: 140, stamina: 140, speed: 1.1, power: 0.95, defense: 1, weight: 0.8, kiRegen: 2.6, chargeRate: 30, canonPower: 2.6 },
    appearance: {
      height: 0.84,
      skin: 0x9a86c8,
      build: { chestW: 0.19, chestD: 0.14, shoulderX: 0.19, waistW: 0.15, upperArmR: 0.05, foreArmR: 0.044, fist: 0.048, thighR: 0.08, shinR: 0.062, headR: 0.15, neckLen: 0.055 },
      hair: { style: 'kai_mohawk', color: 0xf2f0ea },
      // the Potara: one yellow earring on each ear
      headExtras: [
        { shape: 'ball', a: [0.98, -0.25, 0.05], d: [0, -1, 0], l: 0.022, r: 0.022, flat: 1, depth: 1.08, color: 0xf2c82a, outline: 0.5 },
        { shape: 'ball', a: [-0.98, -0.25, 0.05], d: [0, -1, 0], l: 0.022, r: 0.022, flat: 1, depth: 1.08, color: 0xf2c82a, outline: 0.5 },
      ],
      face: { pupil: 0x141414, eyeW: 0.95, pointedEars: true, brow: 0xf2f0ea },
      outfit: {
        topStyle: 'gi', top: 0x2a2f6a, sleeves: 'long', sleeveColor: 0x2a2f6a, under: 0xd84a2a, wrist: 0xe8e4dc,
        belt: 0xe8a020, pants: 0xe8e4dc, pantsStyle: 'gi', boots: 0x3a2a4a, bootStyle: 'gi',
      },
      portraitColor: '#2a2f6a',
    },
    vfx: { ghost: 0xe0d8ff },
    audio: { strikePitch: 1.12, heavyPitch: 1.04 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xf2f0ea, core: 0xffffff, particles: 0xe0d8ff }, mult: {} },
      // story state: one earring handed to Kibito for the Old Kai's demonstration
      { id: 'oneEar', name: 'Base', storyLocked: true, noCost: true, aura: { color: 0xf2f0ea, core: 0xffffff, particles: 0xe0d8ff }, mult: {}, look: { headExtras: [{ shape: 'ball', a: [0.98, -0.25, 0.05], d: [0, -1, 0], l: 0.022, r: 0.022, flat: 1, depth: 1.08, color: 0xf2c82a, outline: 0.5 }] } },
    ],
    poses: Object.assign({ idle: poses.sk_idle }, poses),
    moves: {
      light: [kaiMove('skStrike', 520, 'punchWindR', 'punchR'), kaiMove('skPalm', 560, 'sk_palmW', 'sk_palm', { hitPose: 'hitBody' })],
      heavy: { 0: kaiMove('skPush', 1400, 'sk_palmW', 'sk_palm', { startup: 10, recovery: 20, knock: 'push', knockSpeed: 18, impact: 2, hitstun: 26, sfx: 'punchHeavy' }) },
      dash: kaiMove('skDash', 900, 'punchWindR', 'punchR', { lunge: 26, knock: 'heavy', knockSpeed: 20, impact: 2, hitstun: 24, sfx: 'punchHeavy' }),
    },
    specials: {
      // a wall of force from an open hand: he pushes, he does not blast
      special1: {
        id: 'skForce', name: 'Kai Force', type: 'projectile', kiCost: 26, icon: 'ball',
        startup: 14, recovery: 22, pose: { wind: 'sk_palmW', release: 'sk_palm' },
        projectile: { kind: 'ball', speed: 64, radius: 0.9, damage: 1600, homing: 0.3, color: 0xe0d8ff, core: 0xffffff, explode: 3, knock: 'heavy', knockSpeed: 26, impact: 3, life: 2.2 },
      },
    },
    mechanic: null,
    ai: { personality: 'adaptive', aggression: 0.4, defense: 0.8, ranged: 0.5, beam: 0, transformHp: 0, preferredRange: 4 },
    intro: { pose: 'sk_idle', expression: 'calm' },
    victory: { poses: ['sk_idle'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  SL.data.characters.kibito = {
    id: 'kibito',
    assetLevel: 1,
    name: 'Kibito',
    fullName: 'Kibito, attendant to the Supreme Kai',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Attendant',
    blurb: 'Tall, silent, and entirely sure that nobody in this stadium deserves his master\'s attention.',
    ratings: { power: 3, speed: 3, ki: 3, defense: 3 },
    stats: { hp: 18000, ki: 120, stamina: 140, speed: 1, power: 0.9, defense: 1, weight: 1.1, kiRegen: 2.2, chargeRate: 26, canonPower: 2 },
    appearance: {
      height: 1.12,
      skin: 0xe89aa0,
      build: { chestW: 0.23, chestD: 0.165, shoulderX: 0.23, waistW: 0.18, upperArmR: 0.06, foreArmR: 0.052, fist: 0.056, thighR: 0.094, shinR: 0.072, headR: 0.145, neckLen: 0.06 },
      hair: { style: 'kibito', color: 0xf2f0ea },
      face: { pupil: 0x141414, eyeW: 0.92, pointedEars: true, brow: 0xf2f0ea },
      outfit: {
        topStyle: 'gi', top: 0xb82a2a, sleeves: 'long', sleeveColor: 0xb82a2a, under: 0x2a2a3a, wrist: 0xe8e4dc,
        belt: 0x2a2a3a, pants: 0x2a2a3a, pantsStyle: 'gi', boots: 0x2a2a30, bootStyle: 'gi',
      },
      portraitColor: '#b82a2a',
    },
    vfx: { ghost: 0xffd8e0 },
    audio: { strikePitch: 0.98, heavyPitch: 0.92 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: poses.kb_idle }, poses),
    moves: {
      light: [kaiMove('kbStrike', 480, 'punchWindR', 'punchR')],
      heavy: { 0: kaiMove('kbSlam', 1300, 'hammerWind', 'hammer', { startup: 12, recovery: 22, knock: 'smash', knockSpeed: 24, impact: 3, hitstun: 30, sfx: 'punchHeavy' }) },
      dash: kaiMove('kbDash', 800, 'punchWindR', 'punchR', { lunge: 24, knock: 'heavy', knockSpeed: 18, impact: 2, hitstun: 22 }),
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'adaptive', aggression: 0.3, defense: 0.8, ranged: 0.2, beam: 0, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'kb_idle', expression: 'calm' },
    victory: { poses: ['kb_idle'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /*
   * KIBITOSHIN — the Supreme Kai and Kibito after the Old Kai makes them try the Potara on
   * (the demonstration Goku needed): one Kai, between the two of them in every way — the Supreme
   * Kai's crest in Kibito's white, a skin between lavender and pink, Kibito's height half-way down,
   * the Supreme Kai's clothes in Kibito's red, and an earring in each ear. He is quite embarrassed
   * about it. Story only.
   */
  const K = SL.data.characters.supreme_kai;
  SL.data.characters.kibitoshin = Object.assign({}, K, {
    id: 'kibitoshin',
    name: 'Kibitoshin',
    fullName: 'Kibitoshin (Supreme Kai + Kibito, Potara)',
    style: 'Permanent Fusion',
    blurb: 'Two Kais, one pair of earrings, and no way back. He would prefer not to talk about it.',
    stats: Object.assign({}, K.stats, { hp: 26000, power: 1.2, canonPower: 3.2 }),
    appearance: Object.assign({}, K.appearance, {
      height: 0.98,
      skin: 0xc490c0,
      build: { chestW: 0.21, chestD: 0.15, shoulderX: 0.21, waistW: 0.16, upperArmR: 0.055, foreArmR: 0.048, fist: 0.052, thighR: 0.086, shinR: 0.066, headR: 0.145, neckLen: 0.058 },
      hair: { style: 'kai_mohawk', color: 0xf8f6f0 },
      face: { pupil: 0x141414, eyeW: 0.94, pointedEars: true, brow: 0xf8f6f0, browThick: 1.2 },
      outfit: Object.assign({}, K.appearance.outfit, { top: 0xb82a2a, sleeveColor: 0xb82a2a, under: 0x2a2a3a, belt: 0xe8a020 }),
      portraitColor: '#b82a2a',
    }),
    forms: [K.forms[0]],
    intro: { pose: 'sk_idle', expression: 'calm' },
  });
})();
