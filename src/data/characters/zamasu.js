/*
 * ZAMASU and FUSED ZAMASU (Dragon Ball Super, the Future Trunks arc) — FUTURE TIMELINE continuity, Free Battle only,
 * never placed in the canon story order.
 *
 *   ZAMASU (future, immortal)  from the owner's visual reference (p.234): green skin, a white crest of hair swept up
 *     and back, pointed ears, earrings, a dark grey Kai robe with wide square shoulders over a purple turtleneck and
 *     long purple sleeves, a pale blue sash, blue baggy trousers, white boots. A Kai who wished for an immortal body:
 *     a blade of light out of the open hand, the Holy Light, and a body that closes its own wounds.
 *   FUSED ZAMASU  the Potara fusion of Zamasu and Goku Black: built from memory (the board names him; its picture is
 *     Zamasu's) — Zamasu's face and clothes, white hair in Goku Black's spikes, a Potara earring in each ear, and the
 *     ring of light behind his head. His half-corrupted form spills purple over the right side of the body and grows.
 *     Blades of Judgment, Lightning of Absolution, Holy Wrath.
 *
 * Level 1 prototypes on the shared rig; the blade work reuses Goku Black's poses (the same Zamasu underneath).
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const GB = C.goku_black, GK = C.goku;
  const SKIN = 0x6ab86a, ROBE = 0x3a3e46, UNDER = 0x5a2e8e, SASH = 0x9ad4ea, TROUSERS = 0x2a5ab8, WHITE = 0xf2f0ea;
  const BLADE = { id: 'zamasuBlade', shape: 'kiBlade', joint: 'handR', pos: [0, -0.06, 0], rot: [Math.PI, 0, 0], length: 1.5, width: 0.06, color: 0xe8e0ff, core: 0xffffff };
  const earring = (color, both) => {
    const list = [{ shape: 'ball', a: [0.97, -0.42, 0.05], d: [0, -1, 0], l: 0.01, r: 0.011, flat: 1, depth: 1.07, color, outline: 0.4 }];
    if (both) list.push({ shape: 'ball', a: [-0.97, -0.42, 0.05], d: [0, -1, 0], l: 0.01, r: 0.011, flat: 1, depth: 1.07, color, outline: 0.4 });
    return list;
  };
  const poses = {
    // hands folded behind his back, chin raised: a god looking down
    zm_idle: (t) => {
      const b = Math.sin(t * 1.3);
      return {
        root: { y: b * 0.004 }, spine: [-4, 0, 0], chest: [-6 + b * 0.5, 0, 0], head: [-10, 0, 0],
        shoulderL: [24, 0, 18], elbowL: [-70, 0, 0], shoulderR: [24, 0, -18], elbowR: [-70, 0, 0],
        thighL: [-2, 4, 8], kneeL: [4, 0, 0], thighR: [-2, -4, -8], kneeR: [4, 0, 0], hands: ['open', 'open'],
      };
    },
    // the Holy Light: one open palm out
    zm_lightW: { root: { y: -0.02 }, spine: [0, 14, 0], chest: [-2, 18, 0], head: [-4, -14, 0], shoulderR: [-40, 0, -20], elbowR: [-90, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], thighL: [-12, 6, 10], kneeL: [14, 0, 0], thighR: [8, -6, -10], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    zm_light: { root: { y: -0.02, rx: 4 }, spine: [2, -8, 0], chest: [2, -12, 0], head: [-6, 10, 0], shoulderR: [-88, 0, -4], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-10, 0, 24], elbowL: [-30, 0, 0], thighL: [-16, 6, 10], kneeL: [20, 0, 0], thighR: [10, -6, -10], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // shaken, hurt: bent over, the right hand at the chest, breathing hard ("The Divine Scythe": out of the jar; "Vegito":
    // the mortal half hurt by the Galick Gun and the Kamehameha)
    zm_shaken: (t) => {
      const br = Math.sin(t * 6) * 3;
      return {
        hands: ['open', 'fist'],
        root: { y: -0.08, rx: 10 }, spine: [14 + br * 0.4, 0, 0], chest: [10 + br, 0, 0], head: [-14, 0, 0],
        shoulderL: [-10, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-36, 0, 30], elbowR: [-110, 0, 0], handR: [0, 0, 10],
        thighL: [-16, 0, 12], kneeL: [22, 0, 0], thighR: [6, 0, -12], kneeR: [16, 0, 0],
      };
    },
    // Fused: both arms raised to the sky (Holy Wrath, the blades)
    fz2_raise: (t) => ({ root: { y: 0.02 }, spine: [-8, 0, 0], chest: [-12 + Math.sin(t * 24), 0, 0], head: [-24, 0, 0], shoulderL: [-170, 0, 24], elbowL: [-10, 0, 0], shoulderR: [-170, 0, -24], elbowR: [-10, 0, 0], thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [-4, 0, -10], kneeR: [6, 0, 0], hands: ['open', 'open'] }),
    fz2_cast: { root: { y: -0.04, rx: 8 }, spine: [8, 0, 0], chest: [10, 0, 0], head: [-4, 0, 0], shoulderL: [-100, 0, 30], elbowL: [-6, 0, 0], shoulderR: [-100, 0, -30], elbowR: [-6, 0, 0], thighL: [-16, 0, 12], kneeL: [20, 0, 0], thighR: [4, 0, -12], kneeR: [8, 0, 0], hands: ['open', 'open'] },
    // both fists caught at once ("Vegito"'s assault, 2026-10-19; episode 65: "he blocks them easily"): upright, the arms
    // out to either side, an open palm stopping each blow, the head a little tilted — not even braced
    fz2_catchBoth: {
      root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-6, 0, 8],
      shoulderL: [-34, 0, 78], elbowL: [-18, 0, 0], handL: [0, 0, -20], shoulderR: [-34, 0, -78], elbowR: [-18, 0, 0], handR: [0, 0, 20],
      thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0], hands: ['open', 'open'],
    },
    // the immortal body knitting ("The Sword of Hope"'s mending, 2026-10-19): hunched, both arms drawn in over the
    // chest, the head down, the whole body heaving as the corruption closes the wounds
    fz2_mend: (t) => {
      const h = Math.sin(t * 9) * 4;
      return { root: { y: -0.1, rx: 12 }, spine: [16 + h, 0, 0], chest: [14 + h, 0, 0], head: [10, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-120, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-120, 0, 0], thighL: [-24, 0, 12], kneeL: [34, 0, 0], thighR: [-8, 0, -12], kneeR: [24, 0, 0], hands: ['fist', 'open'] };
    },
    // the Spirit Sword through him (ft_vegito's trap): the body jerked back on the blade, arms thrown out, the face kept
    // level so the shock reads (the shared `pierced` throws the head back out of sight)
    fz2_pierced: { root: { y: 0.02, rx: -10 }, spine: [-8, 0, 0], chest: [-14, 0, 0], neck: [6, 0, 0], head: [4, 0, 0], shoulderL: [-56, 0, 64], elbowL: [-24, 0, 0], shoulderR: [-56, 0, -64], elbowR: [-24, 0, 0], thighL: [-14, 0, 10], kneeL: [30, 0, 0], thighR: [6, 0, -10], kneeR: [34, 0, 0], footL: [30, 0, 0], footR: [30, 0, 0], hands: ['open', 'open'] },
  };
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 5, active: 3, recovery: 11, cancel: 7, damage, reach: 1.2, radius: 0.82, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 10, active: 4, recovery: 20, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'smash', knockSpeed: 32, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  // the 2026-10-15 visual pass (the board p.234): the sash's long pale-blue fall hangs down the front of the coat, and the
  // coat's shoulders are wide square plates edged in gold (they were round pads); the coat skirt keeps the gold hem edge
  const GOLD = 0xe0a22a;
  const outfit = () => ({
    topStyle: 'gi', top: ROBE, under: UNDER, sleeves: 'long', sleeveColor: UNDER, collar: UNDER, collarStyle: 'turtle',
    // (2026-10-15 defects batch: the coat's skirt edged in gold, as the board)
    belt: SASH, beltStyle: 'sash', hem: { color: ROBE, len: 0.48, flare: 1.3, trim: GOLD },
    apron: { color: SASH, len: 0.4, width: 0.13, point: true, tip: 0.012, flare: 0.2, edge: 0.004 },
    pants: TROUSERS, pantsStyle: 'harem', boots: WHITE, bootStyle: 'gi',
  });
  const robeProps = () => [
    { id: 'shoulderL', joint: 'chest', shape: 'box', pos: [0.2, 0.25, -0.005], rot: [0, 0, -0.08], size: [0.15, 0.028, 0.17], color: ROBE },
    { id: 'shoulderR', joint: 'chest', shape: 'box', pos: [-0.2, 0.25, -0.005], rot: [0, 0, 0.08], size: [0.15, 0.028, 0.17], color: ROBE },
    { id: 'shoulderTrimL', joint: 'chest', shape: 'box', pos: [0.205, 0.243, -0.005], rot: [0, 0, -0.08], size: [0.158, 0.012, 0.178], color: GOLD, outline: 0 },
    { id: 'shoulderTrimR', joint: 'chest', shape: 'box', pos: [-0.205, 0.243, -0.005], rot: [0, 0, 0.08], size: [0.158, 0.012, 0.178], color: GOLD, outline: 0 },
  ];

  /* ============================================================== ZAMASU */
  C.zamasu = {
    id: 'zamasu', assetLevel: 1, name: 'Zamasu', fullName: 'Zamasu (future, immortal)', era: 'Future Timeline',
    playable: true, prototype: true, style: 'Immortal Kai · Blade',
    card: ['Future Timeline', 'The Kai who judged mortals'],
    blurb: 'A Supreme Kai apprentice who decided the gods had failed and mortals had to go. He wished for a body that cannot die.',
    ratings: { power: 3, speed: 3, ki: 4, defense: 4 },
    stats: { hp: 16000, ki: 140, stamina: 120, speed: 1.06, power: 1.3, defense: 1.1, weight: 0.95, kiRegen: 3, chargeRate: 38, canonPower: 7 },
    appearance: {
      height: 0.98, skin: SKIN,
      build: { chestW: 0.195, chestD: 0.13, shoulderX: 0.195, waistW: 0.125, upperArmR: 0.05, foreArmR: 0.045, thighR: 0.08, shinR: 0.06, headR: 0.12 },
      hair: { style: 'zamasu', color: 0xf2f2f4 },
      headExtras: earring(0xe8601a, true),
      face: { pupil: 0x5a5a66, eyeW: 0.94, eyeH: 0.82, eyeTilt: 0.14, browThick: 0.9, brow: 0xe8e8ec, pointedEars: true, jaw: 0.98 },
      outfit: outfit(),
      props: [BLADE].concat(robeProps()),
      portraitColor: '#5a2e8e',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xd8c8ff, core: 0xffffff, particles: 0xe8e0ff }, mult: {} }],
    poses: Object.assign({}, GK.poses, GB.poses, poses, { idle: poses.zm_idle }),
    moves: {
      light: [
        lt('zmChop', 'gb_chopW', 'gb_chop', 420, { hitPose: 'hitSideL' }),
        lt('zmJab', 'g_jabW', 'g_jab', 400, { startup: 4, recovery: 10, cancel: 6 }),
        lt('zmKick', 'g_sideKickW', 'g_sideKick', 560, { startup: 7, reach: 1.4, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('zmAxe', 'g_axeKickW', 'g_axeKick', 1100),
        2: hv('zmUpper', 'uppercutWind', 'uppercut', 1000, { knock: 'launch', knockSpeed: 20 }),
      },
      dash: hv('zmThrust', 'gb_bladeW', 'gb_thrust', 800, { startup: 4, active: 8, recovery: 14, lunge: 38, hitstun: 26, knock: 'heavy', knockSpeed: 22, hitPose: 'hitBody' }),
      throw: { id: 'zmJudge', name: 'Judgement', damage: 1200, knockSpeed: 28, poses: ['grab', 'gb_chopW', 'gb_chop'] },
    },
    specials: {
      // HOLY LIGHT: a white shot from the open palm that pushes through a guard
      special1: {
        id: 'zmLight', name: 'Holy Light', type: 'projectile', kiCost: 24, icon: 'blast', cooldown: 80,
        startup: 12, recovery: 16, pose: { wind: 'zm_lightW', release: 'zm_light' },
        projectile: { kind: 'blast', speed: 80, radius: 0.4, damage: 1500, homing: 0.3, color: 0xe8e0ff, core: 0xffffff, explode: 2.4, knock: 'heavy', knockSpeed: 20, impact: 3, guardPierce: 0.5, life: 2.4 },
      },
      // DIVINE BLADE: the blade of light out of the open hand — through you, and up
      special2: {
        id: 'zmBlade', name: 'Divine Blade', type: 'rush', kiCost: 30, icon: 'rush', prop: 'zamasuBlade', cooldown: 90,
        startup: 8, dashFrames: 16, speed: 68, recovery: 20,
        poses: { wind: 'gb_bladeW', dash: 'gb_bladeW' },
        hits: [
          { pose: 'gb_thrust', damage: 900, frames: 10, sfx: 'swordSlash' },
          { pose: 'gb_sweep', damage: 900, frames: 10, sfx: 'swordSlash' },
          { pose: 'gb_rise', damage: 1500, frames: 16, sfx: 'swordSlash', knock: 'launch', knockSpeed: 24, impact: 3 },
        ],
      },
      // GOD SPLITTING CUT: a wave of white from both hands
      ultimate: {
        id: 'zmWave', name: 'God Splitting Cut', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 44, chargeMax: 44, damage: [4700, 4700], radius: [1.4, 1.4], speed: 100, range: 160, sustain: 42,
        color: 0xd8c8ff, core: 0xffffff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 30,
      },
    },
    mechanic: { type: 'regeneration', name: 'Immortal Body', desc: 'He wished for immortality: after a few seconds without being hit, his wounds close, up to 60% health.', color: 0xe8e0ff },
    blast: { color: 0xe8e0ff, core: 0xffffff, damage: 210, speed: 62, radius: 0.3 },
    ai: { personality: 'martial', aggression: 0.62, defense: 0.6, ranged: 0.45, beam: 0.4, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'zm_idle', expression: 'smirk' },
    victory: { poses: ['zm_idle'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'grit' },
  };

  /* ============================================================== FUSED ZAMASU */
  const FZ_SKIN = 0x7ac87a, OOZE = 0xc83af0;
  // his own clothes (2026-10-15, the board p.236 — he wore Zamasu's Kai robe, built before the page was found): Goku Black's
  // dark high-collared gi under a grey coat lined in red, its skirt to the knee, the shoulders drawn out to points; a red
  // sash, black baggy trousers, white boots
  const FZ_GREY = 0x76767e, FZ_RED = 0xc81e2a, FZ_BLACK = 0x18181c;
  const fzOutfit = () => ({
    topStyle: 'gi', top: FZ_GREY, under: FZ_BLACK, sleeves: 'long', sleeveColor: FZ_BLACK, collar: FZ_BLACK, collarStyle: 'turtle',
    belt: FZ_RED, beltStyle: 'sash', hem: { color: FZ_GREY, len: 0.55, flare: 1.45, trim: FZ_RED, open: 0.9 },
    pants: FZ_BLACK, pantsStyle: 'harem', boots: WHITE, bootStyle: 'gi',
  });
  // HALF-CORRUPTED (the board p.236): his right arm swallowed by a swollen purple mass from the shoulder to a fist twice the
  // size of his head's half, bubbling in lumps of two shades, a white wrapping round the wrist; the right side of his face
  // under the same purple. Props and extras of that form only (they ride out on the arm as the form swells it)
  const FZ_GOO = 0x9a5ad8, FZ_GOO_LIGHT = 0xb888f0;
  const gooArm = [
    // the shoulder heaped up, bigger than his head
    ['shoulderR', [0, 0.02, -0.01], [0.155, 0.13, 0.15], FZ_GOO], ['shoulderR', [-0.09, 0.04, 0.05], [0.07, 0.065, 0.07], FZ_GOO_LIGHT],
    ['shoulderR', [0.06, 0.07, -0.06], [0.06, 0.055, 0.06], FZ_GOO_LIGHT],
    // the upper arm: uneven swellings pushed off to either side, small bubbles on them
    ['shoulderR', [-0.03, -0.09, 0.03], [0.135, 0.11, 0.13], FZ_GOO], ['shoulderR', [0.05, -0.17, -0.03], [0.125, 0.1, 0.12], FZ_GOO],
    ['shoulderR', [-0.1, -0.12, -0.02], [0.05, 0.05, 0.05], FZ_GOO_LIGHT], ['shoulderR', [0.06, -0.06, 0.09], [0.045, 0.045, 0.045], FZ_GOO_LIGHT],
    ['shoulderR', [-0.02, -0.24, 0.04], [0.11, 0.09, 0.11], FZ_GOO_LIGHT],
    // the forearm, thick to the wrist
    ['elbowR', [0.02, -0.03, -0.02], [0.115, 0.1, 0.115], FZ_GOO], ['elbowR', [-0.03, -0.11, 0.03], [0.12, 0.1, 0.115], FZ_GOO],
    ['elbowR', [0.08, -0.08, 0.02], [0.05, 0.05, 0.05], FZ_GOO_LIGHT], ['elbowR', [-0.06, -0.04, -0.06], [0.045, 0.045, 0.045], FZ_GOO_LIGHT],
    ['elbowR', [0.01, -0.17, 0], [0.105, 0.075, 0.105], FZ_GOO_LIGHT],
    // the fist, bigger than his head
    ['handR', [0, -0.08, 0.015], [0.13, 0.125, 0.13], FZ_GOO], ['handR', [0.07, -0.04, -0.05], [0.05, 0.05, 0.05], FZ_GOO_LIGHT],
  ].map(([joint, pos, size, color], i) => ({ id: 'goo' + i, joint, shape: 'ball', pos, size, color, ride: true, forms: ['corrupted'], outline: 0.5 }))
    .concat([-1.5, -0.5, 0.5, 1.5].map((k, i) => ({ id: 'gooKnuckle' + i, joint: 'handR', shape: 'ball', pos: [k * 0.045, -0.17, 0.07], size: [0.042, 0.04, 0.042], color: FZ_GOO_LIGHT, ride: true, forms: ['corrupted'], outline: 0.4 })))
    .concat([{ id: 'gooWrap', joint: 'elbowR', shape: 'cuff', pos: [0, -0.205, 0], radius: 0.1, radiusBottom: 0.096, length: 0.055, color: 0xf0eee6, ride: true, forms: ['corrupted'] }]);
  // ...and over the right half of his face: the brow and eye, the cheek, the jaw (the form's own head extras)
  const gooFace = [
    { shape: 'ball', a: [-0.72, 0.2, 0.6], d: [-0.5, 0.2, 0.8], l: 0.075, r: 0.09, flat: 0.5, depth: 0.86, color: FZ_GOO, outline: 0.4 },
    { shape: 'ball', a: [-0.55, -0.3, 0.75], d: [-0.4, -0.3, 0.8], l: 0.05, r: 0.06, flat: 0.5, depth: 0.88, color: FZ_GOO, outline: 0.4 },
    { shape: 'ball', a: [-0.55, -0.62, 0.5], d: [-0.4, -0.5, 0.6], l: 0.04, r: 0.05, flat: 0.5, depth: 0.88, color: FZ_GOO, outline: 0.4 },
    { shape: 'ball', a: [-0.85, -0.1, 0.35], d: [-1, 0, 0.3], l: 0.04, r: 0.045, flat: 0.7, depth: 0.95, color: FZ_GOO_LIGHT, outline: 0.3 },
  ];
  // the pointed shoulders: a grey wedge out over each shoulder, the red lining showing under its edge
  const fzShoulders = () => [1, -1].flatMap((s) => [
    { id: 'coatPoint' + s, joint: 'chest', shape: 'tri', pos: [s * 0.22, 0.262, -0.005], rot: [0, 0, s * (Math.PI / 2 + 0.12)], size: [0.05, 0.11, 0.17], color: FZ_GREY },
    { id: 'coatLining' + s, joint: 'chest', shape: 'tri', pos: [s * 0.222, 0.25, -0.005], rot: [0, 0, s * (Math.PI / 2 + 0.12)], size: [0.054, 0.114, 0.165], color: FZ_RED, outline: 0.3 },
  ]);
  const ooze = [['shoulderR', -0.5], ['elbowR', -1.0], ['elbowR', -0.2], ['thighR', -0.4], ['kneeR', -0.6]].map(([at, ang], i) => ({ at, t: 0.35 + (i % 2) * 0.25, ang, size: [0.05, 0.1], color: OOZE, forms: ['corrupted'] }));
  C.fused_zamasu = {
    id: 'fused_zamasu', assetLevel: 1, name: 'Fused Zamasu', fullName: 'Fused Zamasu (Zamasu + Goku Black, Potara)', era: 'Future Timeline',
    playable: true, prototype: true, style: 'Potara God · Judgment',
    card: ['Future Timeline', 'Zamasu and Goku Black, fused'],
    blurb: 'The immortal Zamasu and the body of Goku, fused by the Potara: a god who has decided to be the only thing left. The fusion is not stable.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 4 },
    stats: { hp: 34000, ki: 170, stamina: 170, speed: 1.2, power: 1.6, defense: 1.35, weight: 1.05, kiRegen: 4, chargeRate: 42, canonPower: 10 },
    poise: { max: 80, regen: 14, regenDelay: 100, armor: 1, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.02, skin: FZ_SKIN,
      build: Object.assign({}, GK.appearance.build),
      hair: { style: 'goku_ssj', color: 0xf2f2f6 },
      headExtras: earring(0x3ac84a, true),
      face: { pupil: 0x6a6a76, eyeW: 0.96, eyeH: 0.82, eyeTilt: 0.16, browThick: 1.0, brow: 0xe8e8ec, pointedEars: true, jaw: 1.0 },
      decals: ooze,
      outfit: fzOutfit(),
      // THE BARRIER OF LIGHT (2026-10-15, the owner's references): the great ring standing behind him — an outer and an inner
      // ring, a beam up through them and one across, sparkles at the ends — about half his height across, centred behind
      // his shoulders, from over his head to his waist. It was a small hoop over the head. Shown by default; a story switches it with
      // `fighter.model.setPropVisible('halo', on)` (the id stays 'halo')
      props: [{ id: 'halo', shape: 'barrier', joint: 'chest', pos: [0, 0.22, -0.34], radius: 0.56 }].concat(fzShoulders(), gooArm),
      portraitColor: '#7ac87a',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xff6ab8, core: 0xffe0f0, particles: 0xff9ad0, speed: 1.3, sharp: 0.25 }, mult: {} },
      {
        // HALF-CORRUPTED: the fusion failing — purple spilling over the right side, the body growing to hold it
        id: 'corrupted', name: 'Half-Corrupted', short: 'HALF-CORRUPTED', kiCost: 60, style: 'full',
        aura: { color: 0x8a3aff, core: 0xf0d8ff, particles: 0xa86aff, idle: 0.45, speed: 1.5, sharp: 0.35, sparks: 0xd8b0ff },
        mult: { damage: 1.5, speed: 1.02, defense: 1.5, kiRegen: 1.3, chargeRate: 1.2, guardStamina: 1.3 },
        look: { scale: 1.12, bulk: 1.16, muscle: 1.2, pupil: 0xd02a4a, headExtras: earring(0x3ac84a, true).concat(gooFace) },
        practiced: { length: 96, applyAt: 50, steps: [{ at: 0, pose: 'powerCrouch', speed: 8, expression: 'grit', aura: 0.6, quake: 0.25, sfx: 'rumble' }, { at: 50, burst: true, pose: 'fz2_raise', speed: 10, expression: 'shout', flash: 0.35, crater: 3.5 }, { at: 80, pose: 'zm_idle', expression: 'wicked' }] },
        ai: { aggression: 0.85, defense: 0.45 },
      },
    ],
    poses: Object.assign({}, GK.poses, GB.poses, poses, { idle: poses.zm_idle }),
    moves: {
      light: [
        lt('fzmChop', 'gb_chopW', 'gb_chop', 640, { hitPose: 'hitSideL' }),
        lt('fzmJab', 'g_jabW', 'g_jab', 600, { startup: 4, recovery: 10, cancel: 6 }),
        lt('fzmKick', 'g_sideKickW', 'g_sideKick', 780, { startup: 7, reach: 1.45, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('fzmAxe', 'g_axeKickW', 'g_axeKick', 1700),
        2: hv('fzmUpper', 'uppercutWind', 'uppercut', 1500, { knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('fzmThrust', 'gb_bladeW', 'gb_thrust', 1200, { startup: 4, active: 8, recovery: 14, lunge: 40, hitstun: 26, knock: 'heavy', knockSpeed: 24, hitPose: 'hitBody' }),
      throw: { id: 'fzmJudge', name: 'Final Judgement', damage: 1700, knockSpeed: 30, poses: ['grab', 'gb_chopW', 'gb_chop'] },
    },
    specials: {
      // BLADES OF JUDGMENT: blades of light thrown into the sky, falling on everything in reach
      special1: {
        id: 'fzmBlades', name: 'Blades of Judgment', type: 'scatter', kiCost: 34, icon: 'blast', cooldown: 150,
        windup: 18, rise: 20, height: 10, count: 12, damage: 620, speed: 70, range: 60, recovery: 22,
        color: 0xff7ac8, poses: { wind: 'fz2_raise', throw: 'fz2_cast' },
      },
      // LIGHTNING OF ABSOLUTION: purple lightning from both hands, five bolts fanned wide
      special2: {
        id: 'fzmLightning', name: 'Lightning of Absolution', type: 'projectile', kiCost: 30, icon: 'blast', cooldown: 100,
        startup: 14, recovery: 18, pose: { wind: 'zm_lightW', release: 'fz2_cast' },
        projectile: { kind: 'blast', count: 5, spread: 0.6, speed: 86, radius: 0.3, damage: 760, homing: 0.25, color: 0xa86aff, core: 0xf6eaff, explode: 2, knock: 'push', knockSpeed: 14, impact: 2, life: 2.2 },
      },
      // HOLY WRATH: a sun of judgment raised over his head and brought down
      ultimate: {
        id: 'fzmWrath', name: 'Holy Wrath', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 50, recovery: 44, pose: { wind: 'fz2_raise', release: 'fz2_cast' },
        projectile: { kind: 'ball', speed: 30, radius: 3, damage: 6200, homing: 0.5, color: 0xff6ab8, core: 0xfff0f8, explode: 15, knock: 'smash', knockSpeed: 46, impact: 5, life: 4.8 },
      },
    },
    mechanic: { type: 'regeneration', name: 'Immortal Body', desc: 'Zamasu\'s immortality survives the fusion: after a few seconds without being hit, the body mends, up to 60% health.', color: 0xffc8e8 },
    blast: { color: 0xff8ad0, core: 0xffffff, damage: 240, speed: 62, radius: 0.32 },
    ai: { personality: 'adaptive', aggression: 0.7, defense: 0.5, ranged: 0.55, beam: 0, transformHp: 0.5, preferredRange: 3.4 },
    intro: { pose: 'zm_idle', expression: 'smirk' },
    victory: { poses: ['fz2_raise'], expression: 'wicked' },
    defeat: { pose: 'defeatKneel', expression: 'grit' },
  };
})();
