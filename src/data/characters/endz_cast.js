/*
 * THE END OF Z — the family at the 28th World Tournament (Age 784), ten years on.
 *
 *   pan          Gohan and Videl's daughter, four years old. Already flies, already hits like a
 *                Saiyan, and has her grandfather Satan's showmanship: she announces her kicks. She
 *                fights the exhibition before Uub's match (endz_tournament phase `pan`) and is
 *                PLAYABLE after it: kid strings, a Masenko from her father, a Grandpa Rush, and
 *                the Dynamite Kick — the one that works when SHE throws it.
 *   teen_goten   eighteen: his father's face and hair cut shorter, an easy grin, casual clothes.
 *   teen_trunks  nineteen: the lavender hair parted in the middle, his father's folded arms, the
 *                Capsule Corp heir's jacket. The two of them watch the tournament from the yard.
 *   rocco        an ordinary heavyweight who drew a four-year-old for the exhibition and thinks
 *                it is a joke. Story only.
 *
 * Outfits: the owner sent no reference for this cast, so the clothes are the builder's reading
 * (accuracy 'approximate' in spirit): Pan's orange bandana, red top and white trousers; Goten's
 * open blue shirt; Trunks' navy jacket with the Capsule Corp patch. Level 1 functional prototypes.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const SKIN = 0xf6cda6;
  const ARMS = { shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0] };
  const STAND = { thighL: [-3, 4, 9], kneeL: [4, 0, 0], thighR: [1, -5, -10], kneeR: [9, 0, 0] };

  /* ================================================================ PAN */
  const pn = Object.assign({}, SL.data.kidPoses('pn'), {
    // up on her toes with her fists up: tiny, and very serious about it
    pn_idle: (t) => {
      const b = Math.sin(t * 4);
      return {
        root: { y: -0.04 + b * 0.014 }, hips: [0, -18, 0], spine: [4, 8, 0], chest: [2, 12, 0], head: [-8, -10, 0],
        shoulderL: [-62, 0, 16], elbowL: [-104, 0, 0], shoulderR: [-34, 0, -24], elbowR: [-116, 0, 0],
        thighL: [-20, 12, 12], kneeL: [28 + b * 4, 0, 0], thighR: [12, -10, -12], kneeR: [22 + b * 4, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // hands on her hips, chin up: her grandfather's champion pose
    pn_proud: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: b * 0.006 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-14, 0, b * 2],
        shoulderL: [-20, 0, 58], elbowL: [-104, 0, 0], shoulderR: [-20, 0, -58], elbowR: [-104, 0, 0],
        thighL: [-4, 4, 14], kneeL: [6, 0, 0], thighR: [-4, -4, -14], kneeR: [6, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // arms folded, head turned away: "I'm NOT a baby"
    pn_pout: Object.assign({ root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-6, 26, 6], thighL: [-4, 4, 12], kneeL: [4, 0, 0], thighR: [2, -4, -11], kneeR: [6, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    pn_wave: (t) => {
      const s = Math.sin(t * 9);
      return {
        root: { y: Math.max(0, Math.sin(t * 4.5)) * 0.03 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 6],
        shoulderR: [-160, 0, -20 + s * 18], elbowR: [-20, 0, 0], shoulderL: [-6, 0, 10], elbowL: [-16, 0, 0],
        thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [-4, 0, -10], kneeR: [6, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // a flying kick: knees tucked in the air, then the leg out
    pn_flyKickW: { root: { y: 0.12, rx: -10 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-6, 0, 0], shoulderL: [30, 0, 30], elbowL: [-50, 0, 0], shoulderR: [30, 0, -30], elbowR: [-50, 0, 0], thighL: [-70, 0, 8], kneeL: [110, 0, 0], thighR: [-50, 0, -8], kneeR: [100, 0, 0], hands: ['fist', 'fist'] },
    pn_flyKick: { root: { y: 0.1, rx: -20 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [10, 0, 0], thighR: [-90, 0, -6], kneeR: [4, 0, 0], footR: [20, 0, 0], thighL: [-30, 0, 8], kneeL: [90, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-60, 0, 0], shoulderR: [20, 0, -30], elbowR: [-40, 0, 0], hands: ['fist', 'fist'] },
    // her father's Masenko: both hands over the brow, then thrown forward
    pn_masenkoW: { root: { y: -0.04 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-12, 0, 0], shoulderL: [-160, -20, 10], elbowL: [-60, 0, 0], shoulderR: [-160, 20, -10], elbowR: [-60, 0, 0], thighL: [-14, 0, 14], kneeL: [20, 0, 0], thighR: [8, 0, -14], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    pn_masenko: { root: { y: -0.06, rx: 8 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [-4, 0, 0], shoulderL: [-96, -14, 6], elbowL: [-6, 0, 0], handL: [-60, 0, 0], shoulderR: [-96, 14, -6], elbowR: [-6, 0, 0], handR: [-60, 0, 0], thighL: [-30, 0, 14], kneeL: [40, 0, 0], thighR: [16, 0, -14], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    // THE DYNAMITE KICK, announced like her grandfather: a fist to the sky, a knee up
    pn_dynamiteW: { root: { y: 0.02 }, spine: [-6, 0, 0], chest: [-8, 10, 0], head: [-12, -10, 0], shoulderR: [-170, 0, -14], elbowR: [-10, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-90, 0, 0], thighL: [-80, 0, 10], kneeL: [100, 0, 0], thighR: [-2, 0, -8], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
  });

  SL.data.characters.pan = {
    id: 'pan',
    assetLevel: 1,
    name: 'Pan',
    fullName: 'Son Pan (Age 4)',
    era: 'End of Z',
    playable: true,
    prototype: true,
    style: 'Quarter-Saiyan Prodigy',
    blurb: 'Four years old, already flying, and she announces her kicks like her grandfather. Unlike her grandfather, they work.',
    bio: 'Gohan and Videl\'s daughter: Mr. Satan\'s showmanship, Videl\'s temper and a Saiyan\'s punch in a body that barely reaches the ring\'s edge. At the 28th World Tournament she sends a heavyweight out of the ring in front of a crowd that laughed when she walked out.',
    card: ['End of Z', 'Quarter Saiyan'],
    ratings: { power: 2, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 7600, ki: 100, stamina: 110, speed: 1.16, power: 0.62, defense: 0.66, weight: 0.5, kiRegen: 2.4, chargeRate: 28, canonPower: 0.6 },
    appearance: {
      height: 0.5,
      skin: SKIN,
      // four years old: a big head on a small body
      build: { chestW: 0.13, chestD: 0.1, shoulderX: 0.125, waistW: 0.112, upperArmR: 0.034, foreArmR: 0.03, fist: 0.034, thighR: 0.06, shinR: 0.047, headR: 0.175, neckLen: 0.024 },
      hair: { style: 'pan', color: 0x141418 },
      face: { pupil: 0x141418, eyeW: 1.2, eyeH: 1.25, lashWing: true, jaw: 0.85, jawW: 0.92, cheeks: 0.2, nose: 0.6 },
      outfit: {
        topStyle: 'shirt', top: 0xc8322e, sleeves: 'short', sleeveColor: 0xc8322e,
        belt: 0xf08a24, beltStyle: 'sash',
        pants: 0xf0ece4, pantsStyle: 'gi',
        boots: 0xc8322e, bootStyle: 'shoe',
        headband: 0xf08a24,
      },
      portraitColor: '#c8322e',
    },
    vfx: { ghost: 0xffe0c8 },
    audio: { strikePitch: 1.45, heavyPitch: 1.35 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xfff0e0, core: 0xffffff, particles: 0xffe8d0 }, mult: {} }],
    poses: Object.assign({ idle: pn.pn_idle }, pn),
    moves: {
      light: [
        { id: 'pnJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 340, reach: 0.9, radius: 0.62, lunge: 12, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'pn_jabW', strike: 'pn_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'pnSpin', startup: 4, active: 3, recovery: 10, cancel: 5, damage: 360, reach: 0.95, radius: 0.64, lunge: 12, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'pn_spinW', strike: 'pn_spin' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'pnKick', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 480, reach: 1.1, radius: 0.72, lunge: 13, hitstun: 22, knock: 'push', knockSpeed: 11, impact: 2, pose: { wind: 'pn_kickW', strike: 'pn_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'pnFlyKick', startup: 10, active: 5, recovery: 18, damage: 1100, reach: 1.2, radius: 0.85, lunge: 18, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'pn_flyKickW', strike: 'pn_flyKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'pnRise', startup: 8, active: 4, recovery: 16, damage: 800, reach: 1, radius: 0.8, lunge: 12, hitstun: 28, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'pnDash', startup: 4, active: 7, recovery: 15, damage: 700, reach: 1.1, radius: 0.8, lunge: 32, hitstun: 24, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'pn_flyKickW', strike: 'pn_flyKick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'pnToss', name: 'Piggyback Toss', damage: 600, knockSpeed: 22, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'panMasenko', name: 'Masenko', type: 'beam', kiCost: 28, icon: 'beam',
        chargeMin: 18, chargeMax: 80, tiers: [18, 45, 75], damage: [1200, 2400], radius: [0.4, 0.9], speed: 96, range: 140, sustain: 34,
        color: 0xffe060, core: 0xfff8e0, poses: { charge: 'pn_masenkoW', fire: 'pn_masenko' }, recovery: 20,
        callout: ['MA', 'SEN', 'KO!'],
      },
      special2: {
        id: 'panRush', name: 'Grandpa Rush', type: 'rush', kiCost: 24, icon: 'rush',
        startup: 8, dashFrames: 16, speed: 54, recovery: 20,
        poses: { wind: 'pn_idle', dash: 'pn_flyKickW' },
        hits: [
          { pose: 'pn_jab', damage: 320, frames: 5, sfx: 'punchLight' },
          { pose: 'pn_spin', damage: 320, frames: 5, sfx: 'punchLight' },
          { pose: 'pn_kick', damage: 340, frames: 6, sfx: 'punchHeavy' },
          { pose: 'pn_flyKick', damage: 900, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 26, impact: 3 },
        ],
      },
      // the champion's own move, announced first — the announcement is the opening for the other side
      ultimate: {
        id: 'panDynamite', name: 'Dynamite Kick', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 30, dashFrames: 24, speed: 70, recovery: 30,
        poses: { wind: 'pn_dynamiteW', dash: 'pn_flyKickW' },
        hits: [{ pose: 'pn_flyKick', damage: 4200, frames: 24, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 44, impact: 4 }],
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Quarter Saiyan', desc: 'A Saiyan\'s instinct at a quarter strength and four times the enthusiasm: vanishing and Perfect Guards sharpen her next strikes.' },
    ai: { personality: 'aggressive', aggression: 0.8, defense: 0.35, ranged: 0.3, beam: 0.3, transformHp: 0, preferredRange: 2 },
    barks: { combo: 'pan_combo', hurt: 'pan_hurt' },
    sequences: {
      intro: [{ pose: 'pn_proud', dur: 1.1, speed: 6, expression: 'grin' }, { pose: 'pn_idle', dur: 1, speed: 8, expression: 'angry' }],
      victory: [[{ pose: 'pn_cheer', dur: 1.4, speed: 6, expression: 'grin' }, { pose: 'pn_proud', dur: 9, speed: 5, expression: 'grin' }], [{ pose: 'pn_wave', dur: 9, speed: 6, expression: 'grin' }]],
      defeat: [{ pose: 'pn_pout', dur: 9, speed: 4, expression: 'sad' }],
    },
    intro: { pose: 'pn_proud', expression: 'grin' },
    victory: { poses: ['pn_cheer', 'pn_proud'], expression: 'grin' },
    defeat: { pose: 'pn_pout', expression: 'sad' },
  };

  /* ================================================================ TEEN GOTEN / TEEN TRUNKS (story) */
  const ADULT_BUILD = { chestW: 0.2, chestD: 0.136, shoulderX: 0.204, delt: 0.072, waistW: 0.13, upperArmR: 0.056, foreArmR: 0.049, fist: 0.055, thighR: 0.084, shinR: 0.064, headR: 0.122, neckLen: 0.058 };
  const kit = (p) => ({
    light: [{ id: p + 'Jab', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 400, reach: 1.1, radius: 0.7, lunge: 12, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' }],
    heavy: { 0: { id: p + 'Kick', startup: 11, active: 4, recovery: 20, damage: 900, reach: 1.3, radius: 0.85, lunge: 12, hitstun: 26, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' } },
    dash: { id: p + 'Dash', startup: 5, active: 6, recovery: 16, damage: 600, reach: 1.1, radius: 0.8, lunge: 28, hitstun: 20, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
  });
  const story = (id, name, fullName, blurb, appearance, poses, idle) => ({
    id, assetLevel: 1, name, fullName, era: 'End of Z', playable: false, prototype: true, style: 'Story', blurb,
    ratings: { power: 3, speed: 3, ki: 3, defense: 3 },
    stats: { hp: 14000, ki: 100, stamina: 100, speed: 1.05, power: 1, defense: 1, weight: 0.95, kiRegen: 2, chargeRate: 30, canonPower: 1.2 },
    appearance,
    vfx: { ghost: 0xd8ecff },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xe8f0ff, core: 0xffffff, particles: 0xdfe8ff }, mult: {} }],
    poses: Object.assign({ idle }, poses),
    moves: kit(id),
    specials: {},
    mechanic: null,
    ai: { personality: 'martial', aggression: 0.6, defense: 0.5, ranged: 0.2, beam: 0, transformHp: 0, preferredRange: 2.4 },
    intro: { pose: 'idle', expression: 'grin' },
    victory: { poses: ['idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  });

  const tg = {
    // his father's habit: one hand behind his head, an easy grin
    tg_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return Object.assign({
        root: { y: b * 0.004 }, hips: [0, -6, 3], spine: [-2, 4, 0], chest: [-4, 6, 0], head: [-6, -8, 6 + b],
        shoulderR: [-150, 0, -30], elbowR: [-130, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-16, 0, 0],
        hands: ['fist', 'open'],
      }, STAND);
    },
    tg_wave: (t) => {
      const s = Math.sin(t * 8);
      return Object.assign({
        root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-8, 0, 4],
        shoulderR: [-160, 0, -24 + s * 16], elbowR: [-24, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-16, 0, 0],
        hands: ['fist', 'open'],
      }, STAND);
    },
    // laughing at something Trunks said
    tg_laugh: (t) => {
      const b = Math.sin(t * 12);
      return Object.assign({
        root: { y: Math.abs(b) * 0.01 }, spine: [8, 0, 0], chest: [6 + b * 2, 0, 0], head: [-10 + b * 3, 0, 0],
        shoulderL: [-30, 0, 20], elbowL: [-90, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-90, 0, 0],
        hands: ['open', 'open'],
      }, STAND);
    },
    // a fist out for a bump
    tg_bump: Object.assign({ root: { y: 0 }, spine: [2, -10, 0], chest: [2, -14, 0], head: [-4, 12, 0], shoulderR: [-84, 24, -8], elbowR: [-30, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-16, 0, 0], hands: ['fist', 'fist'] }, STAND),
    tg_cheer: (t) => {
      const b = Math.sin(t * 4.5);
      return { root: { y: Math.max(0, b) * 0.04 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-16, 0, 0], shoulderL: [-170, 0, 22], elbowL: [-14, 0, 0], shoulderR: [-170, 0, -22], elbowR: [-14, 0, 0], thighL: [-8, 0, 12], kneeL: [12, 0, 0], thighR: [-8, 0, -12], kneeR: [12, 0, 0], hands: ['fist', 'fist'] };
    },
  };
  SL.data.characters.teen_goten = story('teen_goten', 'Goten', 'Son Goten (Age 18)', 'Eighteen, easygoing, and very glad his father is the one doing the fighting today.', {
    height: 0.98, skin: SKIN, build: ADULT_BUILD,
    hair: { style: 'goten_teen', color: 0x141418 },
    face: { pupil: 0x101010, eyeW: 1.02 },
    outfit: {
      topStyle: 'shirt', top: 0xeeeeea, jacket: { color: 0x2f5a9e, open: 1.3 }, sleeves: 'long', sleeveColor: 0x2f5a9e, sleeveBulk: 1.1,
      pants: 0x3a3a44, pantsStyle: 'tight', belt: 0x5a3a28, beltStyle: 'belt', boots: 0x5a3a28, bootStyle: 'shoe',
    },
    portraitColor: '#2f5a9e',
  }, tg, tg.tg_idle);

  const tt = {
    // his father's arms, folded; his mother's tilt of the head
    tt_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({ root: { y: b * 0.004 }, hips: [0, -6, 2], spine: [-2, 4, 0], chest: [-6, 4, 0], head: [-6, -10, 6], thighL: [-4, 4, 11], kneeL: [5, 0, 0], thighR: [2, -4, -10], kneeR: [6, 0, 0], hands: ['fist', 'fist'] }, ARMS);
    },
    tt_point: Object.assign({ root: { y: 0 }, hips: [0, -8, 0], spine: [-2, -8, 0], chest: [-6, -10, 0], head: [-6, 10, 4], shoulderR: [-88, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-18, 0, 0], hands: ['open', 'point'] }, STAND),
    tt_bump: Object.assign({ root: { y: 0 }, spine: [2, 10, 0], chest: [2, 14, 0], head: [-4, -12, 0], shoulderL: [-84, -24, 8], elbowL: [-30, 0, 0], shoulderR: [-4, 0, -12], elbowR: [-16, 0, 0], hands: ['fist', 'fist'] }, STAND),
    // both palms up: what can you do
    tt_shrug: (t) => {
      const b = Math.sin(t * 2);
      return Object.assign({ root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-6, -6, 10 + b * 2], shoulderL: [-40, 0, 40], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-90, 0, 0], hands: ['open', 'open'] }, STAND);
    },
  };
  SL.data.characters.teen_trunks = story('teen_trunks', 'Trunks', 'Trunks (Age 19)', 'Nineteen, the heir to Capsule Corporation, and still the one who talks Goten into things.', {
    height: 1.0, skin: 0xf7d2ae, build: ADULT_BUILD,
    hair: { style: 'trunks_teen', color: 0xb98ad4 },
    face: { pupil: 0x3a6ab8, eyeW: 0.98, browThick: 1.1 },
    outfit: {
      topStyle: 'shirt', top: 0xf2f0ea, jacket: { color: 0x1f2a52, collar: 0x1f2a52, open: 1.2 }, sleeves: 'long', sleeveColor: 0x1f2a52, sleeveBulk: 1.12,
      pants: 0x56565e, pantsStyle: 'tight', belt: 0x1a1a1e, beltStyle: 'belt', boots: 0x4a3226, bootStyle: 'shoe',
      emblem: { front: null, back: null, sleeve: '@capsule', fg: '#262630', bg: '#f2f0ea' },
    },
    portraitColor: '#1f2a52',
  }, tt, tt.tt_idle);

  /* ================================================================ ROCCO (Pan's exhibition opponent) */
  const rc = {
    rc_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return { root: { y: -0.04 + b * 0.006 }, hips: [0, -10, 0], spine: [6, 6, 0], chest: [4, 8, 0], head: [-4, -6, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-30, 0, -36], elbowR: [-100, 0, 0], thighL: [-22, 10, 16], kneeL: [26, 0, 0], thighR: [10, -10, -16], kneeR: [20, 0, 0], hands: ['fist', 'fist'] };
    },
    // the double biceps for the crowd
    rc_flex: (t) => {
      const s = Math.sin(t * 6) * 3;
      return { root: { y: 0 }, spine: [-6, 0, 0], chest: [-10 + s, 0, 0], head: [-10, 0, 0], shoulderL: [-90, 0, 80], elbowL: [-110 - s, 0, 0], shoulderR: [-90, 0, -80], elbowR: [-110 - s, 0, 0], thighL: [-4, 0, 16], kneeL: [8, 0, 0], thighR: [-4, 0, -16], kneeR: [8, 0, 0], hands: ['fist', 'fist'] };
    },
    // laughing down at her, hands on his knees
    rc_laugh: (t) => {
      const b = Math.sin(t * 10);
      return { root: { y: -0.08 }, spine: [24, 0, 0], chest: [10 + b * 2, 0, 0], head: [-24 + b * 3, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-50, 0, -20], elbowR: [-20, 0, 0], thighL: [-30, 0, 14], kneeL: [40, 0, 0], thighR: [-30, 0, -14], kneeR: [40, 0, 0], hands: ['open', 'open'] };
    },
    rc_smashW: { ...C.hammerWind },
    rc_smash: { ...C.hammer },
  };
  SL.data.characters.rocco = {
    id: 'rocco', assetLevel: 1, name: 'Rocco', fullName: 'Rocco (heavyweight)', era: 'End of Z', playable: false, prototype: true,
    style: 'Heavyweight', blurb: 'Three hundred pounds of ordinary, about to be embarrassed by a four-year-old.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 9000, ki: 20, stamina: 120, speed: 0.78, power: 0.4, defense: 0.7, weight: 1.6, kiRegen: 0.5, chargeRate: 6, canonPower: 0.003 },
    flight: false,
    appearance: {
      height: 1.12, skin: 0xd9a77a,
      build: { chestW: 0.27, chestD: 0.2, shoulderX: 0.27, delt: 0.09, waistW: 0.22, waistD: 0.18, pelvisW: 0.2, upperArmR: 0.074, foreArmR: 0.064, fist: 0.066, thighR: 0.11, shinR: 0.082, headR: 0.13, neckR: 0.08, neckLen: 0.03 },
      hair: { style: 'cropped', color: 0x2a1a10 },
      face: { pupil: 0x141414, eyeW: 0.85, browThick: 1.5, jaw: 1.2, jawW: 1.15 },
      outfit: { topStyle: 'bare', top: 0xd9a77a, pants: 0x9a1e24, pantsStyle: 'tight', belt: 0xd8b040, beltStyle: 'belt', buckle: 0xf2d060, wrist: 0xd8b040, boots: 0x1a1a1e, bootStyle: 'gi' },
      portraitColor: '#9a1e24',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: rc.rc_idle }, rc),
    moves: {
      light: [{ id: 'rcJab', startup: 9, active: 3, recovery: 16, cancel: 10, damage: 120, reach: 1.2, radius: 0.8, lunge: 8, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' }],
      heavy: { 0: { id: 'rcSmash', startup: 18, active: 5, recovery: 26, damage: 260, reach: 1.3, radius: 0.95, lunge: 8, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'rc_smashW', strike: 'rc_smash' }, sfx: 'punchHeavy', hitPose: 'hitBody' } },
      dash: { id: 'rcCharge', startup: 12, active: 6, recovery: 24, damage: 160, reach: 1.2, radius: 0.9, lunge: 16, hitstun: 16, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.7, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 1.8 },
    intro: { pose: 'rc_flex', expression: 'grin' },
    victory: { poses: ['rc_flex'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
