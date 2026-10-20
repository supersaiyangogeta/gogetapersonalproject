/*
 * UNIVERSE 6 (Dragon Ball Super, Chapter 18) — the team Champa brought. Level 1 functional prototypes, built from the
 * owner's Super Saga reference collage and documentation/SUPER_SAGA_VISUAL_REFERENCE.md §1 (approximate: shapes and
 * colours, not production art).
 *
 *   CABBA     playable (after "The Pride of Sadala"). A slender young Saiyan of Planet Sadala in the Sadala Defense
 *             Force uniform: a blue tunic, silver-grey breastplate and shoulder guards, dark trousers, black boots;
 *             short spiky black hair. Strict military posture. Base and SUPER SAIYAN (the gold he finds against
 *             Vegeta: story-given by u6_cabba, Free Battle after it). Fights clean and straight — the drills of a
 *             soldier: jab, cross, knee, roundhouse; a rising knee; an axe kick; a rush of punches.
 *   FROST     the Frieza race of Universe 6: smooth white body, blue domes and plates, the short horns of the
 *             first form, a long tail. Polite. (Story cast in this chapter.)
 *   HIT       a tall grey-violet assassin: a high-collared dark purple longcoat, the hands in the pockets, a ridged
 *             skull, shadowed yellow eyes. (Story cast; fights Vegeta in u6_hit — jabs from the pockets, the
 *             vital strike; the time-skip itself is the mission's.)
 *   BOTAMO    a huge rubbery yellow bear in a red vest. (Story cast.)
 *   MAGETTA   a towering grey metal fighter, a smokestack on his dome that belches steam. (Story cast.)
 *   CHAMPA    the God of Destruction of Universe 6: Beerus' twin brother, round in the belly, red trousers.
 *   VADOS     his attendant: Whis' sister — pale blue skin, white hair in a high ponytail, the staff.
 * Champa and Vados are built on Beerus' and Whis' own definitions (the twin universes' mirror), recoloured and
 * reshaped; nothing in Beerus or Whis changes.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ======================================================================== CABBA */
  const CB_SKIN = 0xf2c8a2, CB_HAIR = 0x141418, CB_TUNIC = 0x2a4aa8, CB_PLATE = 0xc4c8d4, CB_TRIM = 0x6a7490, CB_PANTS = 0x2c2a44, CB_BOOT = 0x26262e;
  const cb = {
    // at attention: heels together, fists at his sides, the chin up — a soldier on parade
    cb_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-4 + b * 0.5, 0, 0], head: [-3, 0, 0],
        shoulderL: [-4, 0, 7], elbowL: [-10, 0, 0], shoulderR: [-4, 0, -7], elbowR: [-10, 0, 0],
        thighL: [-2, 0, 4], kneeL: [2, 0, 0], thighR: [-2, 0, -4], kneeR: [2, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the Defense Force guard: side-on, the lead fist high, the rear fist at the chin, weight on the balls of the feet
    cb_stance: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.05 + b * 0.008 },
        hips: [0, -16, 0], spine: [6, -6, 0], chest: [6, -10, 0], head: [-6, 18, 0],
        shoulderL: [-74, -10, 18], elbowL: [-96, 0, 0], shoulderR: [-50, 10, -14], elbowR: [-124, 0, 0],
        thighL: [-24, 10, 12], kneeL: [28 + b * 2, 0, 0], thighR: [12, -10, -12], kneeR: [22 + b * 2, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the salute: the right fist across the chest, the back straight
    cb_salute: { root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-4, 0, 0], shoulderR: [-60, 40, -10], elbowR: [-128, 0, 0], shoulderL: [-4, 0, 7], elbowL: [-10, 0, 0], thighL: [-2, 0, 4], kneeL: [2, 0, 0], thighR: [-2, 0, -4], kneeR: [2, 0, 0], hands: ['fist', 'fist'] },
    // a small bow from the waist (to a senior officer — to Vegeta)
    cb_bow: { root: { y: -0.01, rx: 22 }, spine: [18, 0, 0], chest: [10, 0, 0], head: [10, 0, 0], shoulderL: [-6, 0, 7], elbowL: [-10, 0, 0], shoulderR: [-6, 0, -7], elbowR: [-10, 0, 0], thighL: [-4, 0, 4], kneeL: [4, 0, 0], thighR: [-4, 0, -4], kneeR: [4, 0, 0], hands: ['fist', 'fist'] },
    // beaten down: on one knee, a hand on the ring, the shoulders heaving
    cb_kneel: (t) => {
      const s = Math.sin(t * 7);
      return {
        root: { y: -0.42 + s * 0.006, rx: 14 }, spine: [16 + s * 2, 0, 0], chest: [10 + s * 2, 0, 0], head: [-8, 0, 0],
        shoulderL: [-40, 0, 14], elbowL: [-10, 0, 0], handL: [-60, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-70, 0, 0],
        thighL: [-86, 0, 10], kneeL: [92, 0, 0], thighR: [10, 0, -10], kneeR: [100, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // the threat lands: the head comes up, the eyes wide, the whole body locked
    cb_horror: (t) => {
      const s = Math.sin(t * 30) * 1.4;
      return {
        root: { y: -0.4, rx: 2 }, spine: [2, 0, s * 0.4], chest: [-4, 0, 0], head: [-14, 0, s * 0.5],
        shoulderL: [-30, 0, 18], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -18], elbowR: [-60, 0, 0],
        thighL: [-86, 0, 10], kneeL: [92, 0, 0], thighR: [10, 0, -10], kneeR: [100, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // rising, the fists clenched at his hips, shaking with it
    cb_rise: (t) => {
      const s = Math.sin(t * 34) * 1.8;
      return {
        root: { y: -0.12 + s * 0.004, rx: 6 }, spine: [6, 0, 0], chest: [8 + s * 0.4, 0, 0], neck: [4, 0, 0], head: [6, 0, 0],
        shoulderL: [-20, 0, 42], elbowL: [-78, 0, 0], shoulderR: [-20, 0, -42], elbowR: [-78, 0, 0],
        thighL: [-30, 0, 18], kneeL: [44, 0, 0], thighR: [16, 0, -18], kneeR: [34, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the scream: head back, arms flung down and out, every muscle locked
    cb_scream: (t) => {
      const s = Math.sin(t * 46) * 2.4;
      return {
        root: { y: -0.04 + s * 0.006, rx: -14 }, spine: [-12, 0, 0], chest: [-18 + s * 0.5, 0, 0], neck: [-16, 0, 0], head: [-30, 0, 0],
        shoulderL: [-4, 0, 66], elbowL: [-24, 0, 0], shoulderR: [-4, 0, -66], elbowR: [-24, 0, 0],
        thighL: [-24, 0, 24], kneeL: [38, 0, 0], thighR: [14, 0, -24], kneeR: [28, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the flurry, two frames he alternates between: left straight, right straight, both driven from the hips
    cb_flurryL: { root: { y: -0.08, rx: 10 }, hips: [0, 14, 0], spine: [8, 10, 0], chest: [8, 18, 0], head: [-10, -18, 0], shoulderL: [-90, 0, 4], elbowL: [-4, 0, 0], shoulderR: [-50, 10, -16], elbowR: [-120, 0, 0], thighL: [-34, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0], hands: ['fist', 'fist'] },
    cb_flurryR: { root: { y: -0.08, rx: 10 }, hips: [0, -14, 0], spine: [8, -10, 0], chest: [8, -18, 0], head: [-10, 18, 0], shoulderR: [-90, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-50, -10, 16], elbowL: [-120, 0, 0], thighL: [-34, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0], hands: ['fist', 'fist'] },
    // folded over a blow to the stomach, the breath gone
    cb_fold: { root: { y: -0.1, rx: 34 }, spine: [26, 0, 0], chest: [20, 0, 0], neck: [10, 0, 0], head: [8, 0, 0], shoulderL: [-50, 20, 10], elbowL: [-90, 0, 0], shoulderR: [-50, -20, -10], elbowR: [-90, 0, 0], thighL: [-20, 0, 8], kneeL: [30, 0, 0], thighR: [-6, 0, -8], kneeR: [26, 0, 0], hands: ['open', 'open'] },
    // out cold, draped over an arm: bent at the waist, the arms and head hanging
    cb_limp: { root: { y: 0, rx: 70 }, spine: [24, 0, 0], chest: [20, 0, 0], neck: [20, 0, 0], head: [30, 0, 0], shoulderL: [-80, 0, 6], elbowL: [-10, 0, 0], shoulderR: [-76, 0, -6], elbowR: [-14, 0, 0], thighL: [-10, 0, 4], kneeL: [26, 0, 0], thighR: [-6, 0, -4], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    // laid on his back, out cold
    cb_out: { root: { y: -0.72, rx: -88 }, spine: [-4, 0, 0], chest: [-2, 0, 0], head: [-10, 16, 0], shoulderL: [10, 0, 30], elbowL: [-10, 0, 0], shoulderR: [8, 0, -26], elbowR: [-14, 0, 0], thighL: [-4, 0, 8], kneeL: [8, 0, 0], thighR: [-2, 0, -6], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the moves: a soldier's straight lines
    cb_jabW: { root: { y: -0.05 }, chest: [4, -18, 0], head: [-6, 12, 0], shoulderR: [-34, 0, -16], elbowR: [-120, 0, 0], shoulderL: [-70, 0, 16], elbowL: [-96, 0, 0], thighL: [-24, 0, 12], kneeL: [32, 0, 0], thighR: [14, 0, -12], kneeR: [22, 0, 0], hands: ['fist', 'fist'] },
    cb_jab: { root: { y: -0.07, rx: 8 }, chest: [8, 22, 0], head: [-12, -14, 0], shoulderR: [-92, 0, 0], elbowR: [-4, 0, 0], shoulderL: [-60, 0, 18], elbowL: [-104, 0, 0], thighL: [-32, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0], hands: ['fist', 'fist'] },
    cb_kneeW: { root: { y: -0.04 }, hips: [0, 10, 0], chest: [6, 10, 0], head: [-8, -8, 0], shoulderL: [-70, 0, 20], elbowL: [-100, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-110, 0, 0], thighR: [-30, 0, -8], kneeR: [60, 0, 0], thighL: [6, 0, 8], kneeL: [16, 0, 0], hands: ['fist', 'fist'] },
    cb_knee: { root: { y: 0.04, rx: -6 }, spine: [-6, 0, 0], chest: [-4, 0, 0], head: [6, 0, 0], shoulderL: [-110, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-100, 0, -30], elbowR: [-70, 0, 0], thighR: [-104, 0, -6], kneeR: [110, 0, 0], thighL: [10, 0, 8], kneeL: [10, 0, 0], hands: ['fist', 'fist'] },
    cb_kickW: Object.assign({}, C.kickWindR, { root: { y: -0.08 } }),
    cb_kick: {
      root: { y: 0.02, rz: -10 }, chest: [-4, 40, 0], head: [-6, -30, 0],
      shoulderL: [-18, 0, 54], elbowL: [-34, 0, 0], shoulderR: [-18, 0, -54], elbowR: [-34, 0, 0],
      thighR: [-88, 0, -26], kneeR: [10, 0, 0], footR: [28, 0, 0], thighL: [12, 0, 8], kneeL: [18, 0, 0],
    },
    cb_axeW: { root: { y: 0.06, rx: -10 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-4, 0, 0], shoulderL: [-60, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-60, 0, -30], elbowR: [-60, 0, 0], thighR: [-130, 0, -6], kneeR: [10, 0, 0], thighL: [6, 0, 8], kneeL: [12, 0, 0], hands: ['fist', 'fist'] },
    cb_axe: { root: { y: -0.06, rx: 16 }, spine: [12, 0, 0], chest: [14, 0, 0], head: [-6, 0, 0], shoulderL: [-30, 0, 36], elbowL: [-50, 0, 0], shoulderR: [-30, 0, -36], elbowR: [-50, 0, 0], thighR: [-40, 0, -6], kneeR: [30, 0, 0], thighL: [14, 0, 8], kneeL: [26, 0, 0], hands: ['fist', 'fist'] },
    cb_waveW: (t) => {
      const s = Math.sin(t * 30) * 1.2;
      return {
        root: { y: -0.08 }, spine: [-4, 0, 0], chest: [-8 + s * 0.3, -30, 0], head: [-6, 24, 0],
        shoulderR: [-30, 0, -40], elbowR: [-110, 0, 0], handR: [-30, 0, 0], shoulderL: [-70, 0, 30], elbowL: [-90, 0, 0],
        thighL: [-28, 0, 14], kneeL: [40, 0, 0], thighR: [16, 0, -14], kneeR: [28, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    cb_waveFire: {
      root: { y: -0.1, rx: 8 }, spine: [6, 0, 0], chest: [10, 14, 0], head: [-10, -8, 0],
      shoulderR: [-96, 0, -4], elbowR: [-6, 0, 0], handR: [-60, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0],
      thighL: [-38, 0, 14], kneeL: [50, 0, 0], thighR: [24, 0, -14], kneeR: [20, 0, 0],
      hands: ['fist', 'open'],
    },
    // the gold sets in: chin down, the fists low and ready, steam coming off him
    cb_gold: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.05 + b * 0.006 }, hips: [0, -12, 0], spine: [8, 4, 0], chest: [10, 8, 0], neck: [6, 0, 0], head: [10, -8, 0],
        shoulderL: [-20, 0, 26], elbowL: [-50, 0, 0], shoulderR: [-16, 0, -24], elbowR: [-46, 0, 0],
        thighL: [-20, 8, 14], kneeL: [30 + b, 0, 0], thighR: [16, -8, -14], kneeR: [26 + b, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
  };
  Object.assign(C, cb); // scenes and other characters may use them (Vegeta catching him, the ring-out)

  const LIGHT = [
    { id: 'cbJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 400, reach: 1.15, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'cb_jabW', strike: 'cb_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
    { id: 'cbCross', startup: 4, active: 3, recovery: 11, cancel: 6, damage: 430, reach: 1.15, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'cb_flurryL', strike: 'cb_flurryR' }, sfx: 'punchLight', hitPose: 'hitSideR' },
    { id: 'cbKnee', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 480, reach: 0.95, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'cb_kneeW', strike: 'cb_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    { id: 'cbRound', startup: 6, active: 4, recovery: 14, cancel: 8, damage: 600, reach: 1.45, radius: 0.85, lunge: 13, hitstun: 24, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'cb_kickW', strike: 'cb_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
  ];
  const HEAVY = {
    0: { id: 'cbAxe', startup: 12, active: 5, recovery: 22, damage: 1400, reach: 1.35, radius: 1, lunge: 14, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 42, pose: { wind: 'cb_axeW', strike: 'cb_axe' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
    2: { id: 'cbRise', startup: 9, active: 4, recovery: 19, damage: 950, reach: 1.0, radius: 0.88, lunge: 12, hitstun: 32, knock: 'launch', knockSpeed: 19, impact: 2, pose: { wind: 'cb_kneeW', strike: 'cb_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    3: { id: 'cbDrill', startup: 6, active: 22, recovery: 20, damage: 150, reach: 1.05, radius: 0.85, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, multi: [0, 5, 10, 15], finish: { knock: 'heavy', knockSpeed: 26, impact: 3, damage: 520 }, pose: { wind: 'cb_flurryL', strike: 'cb_flurryR' }, sfx: 'punchLight', hitPose: 'hitBody' },
  };

  SL.data.characters.cabba = {
    id: 'cabba', assetLevel: 1, name: 'Cabba', fullName: 'Cabba (Sadala Defense Force)', era: 'Super',
    playable: true, prototype: true, style: 'Soldier of Sadala',
    blurb: 'A young soldier of Planet Sadala, polite to a fault and loyal to his people. He came to the tournament to learn what a Super Saiyan is.',
    bio: 'Universe 6 kept its Saiyans: on Planet Sadala they never became raiders, and Cabba grew up in its Defense Force. He fights the way he was drilled — straight, clean, by the book — and he came to the tournament hoping Prince Vegeta would show him the one thing no Saiyan of his world can do.',
    card: ['Universe 6', 'Saiyan Pride'],
    ratings: { power: 3, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 13000, ki: 120, stamina: 130, speed: 1.08, power: 1.05, defense: 0.95, weight: 0.9, kiRegen: 2.6, chargeRate: 32, canonPower: 1.4 },
    appearance: {
      height: 0.92,
      skin: CB_SKIN,
      build: { chestW: 0.2, chestD: 0.145, shoulderX: 0.205, waistW: 0.14, upperArmR: 0.052, foreArmR: 0.046, fist: 0.05, thighR: 0.082, shinR: 0.062, headR: 0.14, neckLen: 0.06 },
      hair: { style: 'gohan_teen', color: CB_HAIR },
      face: { pupil: 0x101010, eyeW: 1.02, brow: CB_HAIR },
      outfit: {
        topStyle: 'armor', top: CB_TUNIC, arms: CB_TUNIC, sleeves: 'short', sleeveColor: CB_TUNIC,
        armor: { plate: CB_PLATE, belly: CB_TUNIC, pads: CB_PLATE, padStyle: 'strap', trim: CB_TRIM },
        wrist: 0x2a2a34, wristLen: 0.1,
        pants: CB_PANTS, pantsStyle: 'tight',
        // (2026-10-16, the board p.52: the magenta waist cloth hanging in panels over the hips, and pink-violet boots with
        // pale toes — he had neither)
        hem: { color: 0xc0609e, len: 0.24, flare: 1.32, arc: 2.2 },
        gloves: null, boots: 0x8a4a8e, bootTip: 0xdcd6e8, bootStyle: 'saiyan',
      },
      portraitColor: '#2a4aa8',
    },
    vfx: { ghost: 0xd8e4ff },
    audio: { strikePitch: 1.12, heavyPitch: 1.05 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xf0f4ff, core: 0xffffff, particles: 0xe0e8ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 45, style: 'full',
        // the story hands it over in "The Pride of Sadala" (story.js formGivenBy); Free Battle after it
        freeUnlock: 'u6_cabba',
        mult: { damage: 1.4, speed: 1.15, defense: 1.2, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.8 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.16, speed: 1.15, sharp: 0.2 },
        look: { hair: { style: 'gohan_teen_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.03 },
        poses: { idle: cb.cb_gold },
        ghost: 0xffe27a,
        music: 3,
        // the drill, faster and more sure of itself — still by the book (the ToP refinement brief §32: disciplined,
        // straightforward, less improvised than Caulifla): the strings come out a frame sooner and he presses in,
        // measured rests between them
        moves: {
          light: LIGHT.map((m) => Object.assign({}, m, { startup: Math.max(3, m.startup - 1), recovery: Math.max(6, m.recovery - 1) })),
        },
        ai: { personality: 'martial', aggression: 0.72, defense: 0.62, ranged: 0.35, beam: 0.4, preferredRange: 2.6, rhythm: { burst: 3, rest: 38 } },
        // every time after the story's first (Fighter transform): a short, clean change — the fists, the dust, gold
        practiced: {
          length: 96,
          applyAt: 48,
          steps: [
            { at: 0, pose: 'cb_rise', speed: 10, expression: 'grit', aura: 0.25, shot: 'face', sfx: 'kiUp' },
            { at: 16, aura: 0.5, quake: 0.08, dust: 2.4 },
            { at: 30, aura: 0.85, quake: 0.12, sfx: 'ssjRise', dust: 3.6, expression: 'shout' },
            { at: 48, burst: true, small: true, pose: 'powerUp', speed: 16, expression: 'shout', flash: 0.22, crater: 2.2 },
            { at: 56, shot: 'pull' },
            { at: 70, pose: 'cb_gold', speed: 6, expression: 'determined' },
          ],
        },
        sequence: {
          length: 130,
          applyAt: 80,
          steps: [
            { at: 0, pose: 'cb_rise', speed: 9, expression: 'grit', aura: 0.35, auraColor: 0xffffff, mood: [0.3, 0x141026, 0.8], shot: 'orbit', music: 0, sfx: 'kiUp', rocks: false },
            { at: 40, pose: 'cb_scream', speed: 7, expression: 'shout', aura: 0.9, sfx: 'ssjRise', mood: [0.62, 0x0a0a12, 0.6], hairFlicker: true, lightning: true },
            { at: 80, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.22, 0x2a2410, 0.3], flash: 0.8, crater: 4, hairFlicker: false, lightning: false, rocks: false },
            { at: 100, pose: 'cb_gold', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.3] },
          ],
        },
      },
    ],
    poses: Object.assign({ idle: cb.cb_stance }, cb),
    moves: {
      light: LIGHT,
      heavy: HEAVY,
      dash: { id: 'cbDash', startup: 5, active: 8, recovery: 17, damage: 900, reach: 1.4, radius: 0.95, lunge: 32, hitstun: 28, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'cb_jabW', strike: 'cb_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'cbToss', name: 'Shoulder Throw', damage: 850, knockSpeed: 24, poses: ['grab', 'cb_kneeW', 'cb_axe'] },
    },
    specials: {
      special1: {
        id: 'cbWave', name: 'Energy Wave', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 16, chargeMax: 70, tiers: [16, 44], damage: [1800, 3400], radius: [0.6, 1.1], speed: 104, range: 150, sustain: 30,
        color: 0x8ad8ff, core: 0xffffff, poses: { charge: 'cb_waveW', fire: 'cb_waveFire' }, recovery: 24,
      },
      special2: {
        id: 'cbRush', name: 'Defense Force Rush', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 5, dashFrames: 16, speed: 54, recovery: 18,
        poses: { wind: 'cb_jabW' },
        hits: [
          { pose: 'cb_flurryL', damage: 520, frames: 6, sfx: 'punchLight' },
          { pose: 'cb_flurryR', damage: 560, frames: 6, sfx: 'punchLight' },
          { pose: 'cb_knee', damage: 700, frames: 8, sfx: 'punchHeavy' },
          { pose: 'cb_axe', damage: 1500, frames: 14, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 4 },
        ],
      },
      ultimate: {
        id: 'cbPride', name: 'Pride of Sadala', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [6800, 6800], radius: [1.8, 1.8], speed: 110, range: 170, sustain: 48,
        color: 0xffd84a, core: 0xffffff, poses: { charge: 'cb_waveW', fire: 'cb_waveFire' }, recovery: 40, cinematic: true,
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Pride', desc: 'A soldier\'s Saiyan instinct: vanishing and Perfect Guards sharpen his next strikes.' },
    ai: { personality: 'adaptive', aggression: 0.6, defense: 0.6, ranged: 0.4, beam: 0.4, transformHp: 0.5, preferredRange: 3 },
    intro: { pose: 'cb_salute', expression: 'determined' },
    victory: { poses: ['cb_salute'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ======================================================================== the watchers' poses */
  const W = {
    // standing still with the hands buried in the coat pockets: Hit
    // almost motionless — and now and then a foot shifts, the head tilts a little, a shoulder settles
    ht_pockets: (t) => {
      const b = Math.sin(t * 1.1);
      const tilt = Math.pow(Math.max(0, Math.sin(t * 0.43)), 10), shift = Math.pow(Math.max(0, Math.sin(t * 0.29 + 2)), 12), set = Math.pow(Math.max(0, Math.sin(t * 0.37 + 4)), 14);
      return { root: { y: b * 0.002, rz: shift * 2 }, spine: [-2, 0, -shift * 2], chest: [-2, 0, 0], head: [6, tilt * 12, -tilt * 5], shoulderL: [-6, 10, 14 + set * 4], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-6, -10, -14 - set * 4], elbowR: [-34, 0, 0], handR: [-10, 0, 0], thighL: [-2 - shift * 6, 0, 6 + shift * 4], kneeL: [3 + shift * 6, 0, 0], thighR: [-2, 0, -6], kneeR: [3, 0, 0], hands: ['fist', 'fist'] };
    },
    // the step forward, still in the pockets, the head a little down
    ht_step: { root: { y: 0 }, spine: [2, 0, 0], chest: [2, 0, 0], head: [10, 0, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], thighL: [-20, 0, 6], kneeL: [10, 0, 0], thighR: [10, 0, -6], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
    // HIT'S STRIKES (u6_hit): one hand leaves a pocket for the blow and goes back; the other never comes out.
    // the right fist drawn to the chest, the shoulder turned back
    ht_jabW: { root: { y: -0.03 }, spine: [2, 10, 0], chest: [2, 18, 0], head: [6, -12, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-30, 0, -22], elbowR: [-112, 0, 0], thighL: [-16, 0, 8], kneeL: [16, 0, 0], thighR: [8, 0, -8], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
    // the straight jab, the arm dead level, nothing else moving
    ht_jab: { root: { y: -0.04 }, hips: [0, 8, 0], spine: [4, 10, 0], chest: [4, 20, 0], head: [-2, -16, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-88, 0, 6], elbowR: [-4, 0, 0], thighL: [-24, 0, 8], kneeL: [30, 0, 0], thighR: [14, 0, -8], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    ht_jab2W: { root: { y: -0.03 }, spine: [2, -10, 0], chest: [2, -18, 0], head: [6, 12, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], shoulderL: [-30, 0, 22], elbowL: [-112, 0, 0], thighR: [-16, 0, -8], kneeR: [16, 0, 0], thighL: [8, 0, 8], kneeL: [10, 0, 0], hands: ['fist', 'fist'] },
    ht_jab2: { root: { y: -0.04 }, hips: [0, -8, 0], spine: [4, -10, 0], chest: [4, -20, 0], head: [-2, 16, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], shoulderL: [-88, 0, -6], elbowL: [-4, 0, 0], thighR: [-24, 0, -8], kneeR: [30, 0, 0], thighL: [14, 0, 8], kneeL: [14, 0, 0], hands: ['fist', 'fist'] },
    // a front kick with both hands still in the pockets
    ht_kickW: { root: { y: -0.02, rx: -4 }, chest: [-4, 0, 0], head: [6, 0, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], thighR: [-62, 0, -6], kneeR: [92, 0, 0], thighL: [-6, 0, 6], kneeL: [18, 0, 0], hands: ['fist', 'fist'] },
    ht_kick: { root: { y: 0, rx: -12 }, chest: [-8, 0, 0], head: [10, 0, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], thighR: [-94, 0, -4], kneeR: [4, 0, 0], footR: [30, 0, 0], thighL: [8, 0, 6], kneeL: [14, 0, 0], hands: ['fist', 'fist'] },
    // THE VITAL STRIKE: coiled low, the fist at the hip...
    ht_vitalW: { root: { y: -0.12 }, spine: [8, -18, 0], chest: [8, -26, 0], head: [-8, 22, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-14, 0, -24], elbowR: [-124, 0, 0], thighL: [-34, 6, 12], kneeL: [50, 0, 0], thighR: [18, -6, -12], kneeR: [34, 0, 0], hands: ['fist', 'fist'] },
    // ...and driven in under the ribs, point-blank, the body turned behind it
    ht_vital: { root: { y: -0.16, rx: 10 }, hips: [0, 14, 0], spine: [12, 14, 0], chest: [12, 26, 0], head: [-16, -20, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-72, 0, 10], elbowR: [-4, 0, 0], thighL: [-46, 6, 12], kneeL: [62, 0, 0], thighR: [24, -6, -12], kneeR: [26, 0, 0], hands: ['fist', 'fist'] },
    // sliding back on his heels, upright, the hands never leaving the pockets
    ht_slide: { root: { y: -0.02, rx: -6 }, spine: [-6, 0, 0], chest: [-4, 0, 0], head: [6, 0, 0], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], thighL: [-6, 0, 8], kneeL: [10, 0, 0], thighR: [16, 0, -8], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    // the head tipped a hand's width out of a punch's line, nothing else moved
    ht_lean: { root: { y: -0.02, rz: -4 }, spine: [0, 0, -6], chest: [0, 0, -8], head: [4, 14, -14], shoulderL: [-6, 10, 14], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [-6, -10, -14], elbowR: [-34, 0, 0], handR: [-10, 0, 0], thighL: [-4, 0, 10], kneeL: [8, 0, 0], thighR: [-2, 0, -4], kneeR: [4, 0, 0], hands: ['fist', 'fist'] },
    // Frost's courtly manners: one hand at his chest, the other behind his back
    fr_polite: (t) => {
      const b = Math.sin(t * 1.4);
      return { root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-3, 0, 0], head: [-2, -6, 4], shoulderR: [-40, 20, -10], elbowR: [-110, 0, 0], shoulderL: [20, 0, 16], elbowL: [-80, 0, 0], thighL: [-2, 0, 5], kneeL: [3, 0, 0], thighR: [-2, 0, -5], kneeR: [3, 0, 0], hands: ['open', 'open'] };
    },
    fr_bow: { root: { y: 0, rx: 18 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [8, 0, 0], shoulderR: [-40, 20, -10], elbowR: [-110, 0, 0], shoulderL: [20, 0, 16], elbowL: [-80, 0, 0], thighL: [-2, 0, 5], kneeL: [3, 0, 0], thighR: [-2, 0, -5], kneeR: [3, 0, 0], hands: ['open', 'open'] },
    // Botamo: a big contented sway, the paws hanging
    bo_idle: (t) => {
      const s = Math.sin(t * 1.3);
      return { root: { y: s * 0.006, rz: s * 3 }, spine: [-4, 0, s * 2], chest: [-6, 0, 0], head: [-4, 0, -s * 4], shoulderL: [-10, 0, 26], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -26], elbowR: [-20, 0, 0], thighL: [-2, 0, 12], kneeL: [4, 0, 0], thighR: [-2, 0, -12], kneeR: [4, 0, 0], hands: ['open', 'open'] };
    },
    // Magetta: planted wide, the fists at his sides, heavy
    mg_idle: (t) => {
      const s = Math.sin(t * 0.9);
      return { root: { y: -0.04 + s * 0.004 }, spine: [4, 0, 0], chest: [4, 0, 0], head: [6, 0, 0], shoulderL: [-14, 0, 22], elbowL: [-30, 0, 0], shoulderR: [-14, 0, -22], elbowR: [-30, 0, 0], thighL: [-12, 0, 16], kneeL: [16, 0, 0], thighR: [-12, 0, -16], kneeR: [16, 0, 0], hands: ['fist', 'fist'] };
    },
    // Champa: the hands behind his back like his brother, the belly forward, impatient
    ch6_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return { root: { y: b * 0.003 }, spine: [-8, 0, 0], chest: [-8, 0, 0], head: [2, 0, b * 2], shoulderL: [30, 0, 18], elbowL: [-60, 0, 0], shoulderR: [30, 0, -18], elbowR: [-60, 0, 0], thighL: [-2, 0, 8], kneeL: [3, 0, 0], thighR: [-2, 0, -8], kneeR: [3, 0, 0], hands: ['fist', 'fist'] };
    },
    // Champa shaking a fist at the ring
    ch6_shout: (t) => {
      const s = Math.sin(t * 22) * 6;
      return { root: { y: -0.02, rx: 6 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-10, 0, 0], shoulderR: [-140 + s, 0, -20], elbowR: [-50, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0], thighL: [-14, 0, 10], kneeL: [14, 0, 0], thighR: [6, 0, -10], kneeR: [8, 0, 0], hands: ['fist', 'fist'] };
    },
    // Jaco pointing hard at something (the needle)
    jc_point: { root: { y: 0 }, spine: [2, -10, 0], chest: [0, -14, 0], head: [-4, 10, 0], shoulderL: [-90, -10, 4], elbowL: [-4, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-30, 0, 0], thighL: [-10, 6, 10], kneeL: [10, 0, 0], thighR: [4, -6, -10], kneeR: [6, 0, 0], hands: ['point', 'open'] },

    /* FROST FIGHTS LIKE A GENTLEMAN (ToP refinement brief §33: deceptive, controlled, sudden — not Frieza's moves): the
       left hand stays behind his back in the first form; the right does everything, open-handed. */
    // the guard: upright, the chin up, the right hand loose and low in front, the left behind his back
    fr_stance: (t) => {
      const b = Math.sin(t * 1.3);
      return { root: { y: -0.01 + b * 0.003 }, spine: [-2, 4, 0], chest: [-3, 8, 0], head: [-5, -8, 2], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-30, 8, -14], elbowR: [-62, 0, 0], thighL: [-6, 4, 7], kneeL: [9, 0, 0], thighR: [5, -4, -8], kneeR: [7, 0, 0], hands: ['open', 'open'] };
    },
    // the delayed opener: a polite little lean back... and the palm comes from nowhere
    fr_palmW: { root: { y: -0.02, rx: -4 }, spine: [-4, -10, 0], chest: [-4, -16, 0], head: [-6, 12, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-46, 0, -34], elbowR: [-122, 0, 0], thighL: [-4, 6, 8], kneeL: [10, 0, 0], thighR: [8, -6, -8], kneeR: [8, 0, 0], hands: ['open', 'open'] },
    fr_palm: { root: { y: -0.04, rx: 6 }, spine: [4, 12, 0], chest: [4, 20, 0], head: [-4, -14, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-88, 0, 4], elbowR: [-6, 0, 0], thighL: [-22, 6, 8], kneeL: [26, 0, 0], thighR: [12, -6, -8], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the backhand: the hand drawn across the chest, then snapped out to the side
    fr_backW: { root: { y: -0.02 }, spine: [2, 16, 0], chest: [2, 26, 0], head: [-4, -18, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-72, 0, 38], elbowR: [-112, 0, 0], thighL: [-10, 6, 8], kneeL: [14, 0, 0], thighR: [6, -6, -8], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    fr_back: { root: { y: -0.03, rz: -4 }, spine: [4, -14, 0], chest: [4, -24, 0], head: [-6, 18, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-84, 0, -46], elbowR: [-10, 0, 0], thighL: [-16, 6, 8], kneeL: [20, 0, 0], thighR: [10, -6, -8], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    // a short, tidy knee, the hands never leaving their places
    fr_kneeW: { root: { y: -0.02 }, chest: [2, 0, 0], head: [-2, 0, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-40, 8, -14], elbowR: [-70, 0, 0], thighL: [-36, 0, 8], kneeL: [74, 0, 0], thighR: [4, 0, -8], kneeR: [16, 0, 0], hands: ['open', 'open'] },
    fr_knee: { root: { y: 0.03, rx: -2 }, spine: [8, 0, 0], chest: [10, 0, 0], head: [-8, 0, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-50, 8, -18], elbowR: [-80, 0, 0], thighL: [-98, 0, 4], kneeL: [116, 0, 0], footL: [26, 0, 0], thighR: [6, 0, -6], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the spinning heel, the tail swinging round with it
    fr_spinW: { root: { y: -0.08 }, hips: [0, -50, 0], spine: [4, -18, 0], chest: [6, -26, 0], head: [0, 60, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-90, 0, 0], thighL: [-24, 0, 10], kneeL: [44, 0, 0], thighR: [0, 0, -10], kneeR: [44, 0, 0], hands: ['open', 'open'] },
    fr_spin: { root: { y: 0.02, rz: -22 }, hips: [0, 84, 0], spine: [-4, 26, 0], chest: [-6, 36, 0], head: [10, -84, 0], shoulderL: [-16, 0, 56], elbowL: [-36, 0, 0], shoulderR: [-12, 0, -56], elbowR: [-36, 0, 0], thighL: [-80, 0, 54], kneeL: [6, 0, 0], footL: [28, 0, 0], thighR: [4, 0, -6], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    // THE NEEDLE: a flick of the wrist at the chest (the hidden needle in his forearm)...
    fr_needleW: { root: { y: -0.01 }, spine: [0, 8, 0], chest: [0, 14, 0], head: [-4, -10, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-56, 0, 24], elbowR: [-128, 0, 0], thighL: [-6, 4, 7], kneeL: [9, 0, 0], thighR: [5, -4, -8], kneeR: [7, 0, 0], hands: ['open', 'point'] },
    // ...snapped out low, two fingers leading, almost nothing else moves
    fr_needle: { root: { y: -0.02 }, spine: [2, -4, 0], chest: [2, -8, 0], head: [-4, 6, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-70, 0, -8], elbowR: [-14, 0, 0], thighL: [-8, 4, 7], kneeL: [10, 0, 0], thighR: [6, -4, -8], kneeR: [8, 0, 0], hands: ['open', 'point'] },
    // FINAL FORM: both hands now, a low, coiled guard — the manners are gone
    fr_finalStance: (t) => {
      const b = Math.sin(t * 2.4);
      return { root: { y: -0.05 + b * 0.004 }, spine: [6, 8, 0], chest: [6, 12, 0], head: [-10, -10, 0], shoulderL: [-50, 0, 22], elbowL: [-86, 0, 0], shoulderR: [-40, 0, -18], elbowR: [-96, 0, 0], thighL: [-16, 6, 12], kneeL: [24, 0, 0], thighR: [8, -6, -12], kneeR: [18, 0, 0], hands: ['open', 'open'] };
    },
    fr_jab2W: { root: { y: -0.04 }, spine: [4, -8, 0], chest: [4, -14, 0], head: [-8, 10, 0], shoulderL: [-40, 0, 30], elbowL: [-118, 0, 0], shoulderR: [-40, 0, -18], elbowR: [-100, 0, 0], thighL: [-16, 6, 12], kneeL: [24, 0, 0], thighR: [8, -6, -12], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    fr_jab2: { root: { y: -0.05, rx: 6 }, spine: [6, -12, 0], chest: [6, -22, 0], head: [-10, 16, 0], shoulderL: [-90, 0, -4], elbowL: [-6, 0, 0], shoulderR: [-44, 0, -18], elbowR: [-100, 0, 0], thighL: [-26, 6, 12], kneeL: [32, 0, 0], thighR: [12, -6, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] },

    /* MAGETTA'S WEIGHT (ToP refinement brief §34): everything he does starts from the ground and takes his whole body. */
    // the walk: a lumbering sway from one foot to the other, the arms barely swinging
    mg_walk: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 5.2 * sp, s = Math.sin(ph), c = Math.cos(ph);
      return { root: { y: -0.05 + Math.abs(c) * 0.03, rx: 6, rz: s * 4 }, spine: [6, s * 4, -s * 3], chest: [6, s * 5, 0], head: [-4, -s * 4, s * 2], shoulderL: [s * 18 - 12, 0, 24], elbowL: [-34, 0, 0], shoulderR: [-s * 18 - 12, 0, -24], elbowR: [-34, 0, 0], thighL: [-s * 30 - 8, 0, 14], kneeL: [22 + Math.max(0, s) * 40, 0, 0], thighR: [s * 30 - 8, 0, -14], kneeR: [22 + Math.max(0, -s) * 40, 0, 0], hands: ['fist', 'fist'] };
    },
    // the haymaker: the whole torso wound back, the arm out wide...
    mg_swingW: { root: { y: -0.06 }, spine: [4, -16, 0], chest: [6, -28, 0], head: [-6, 20, 0], shoulderR: [-40, 0, -70], elbowR: [-60, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-70, 0, 0], thighL: [-16, 0, 16], kneeL: [24, 0, 0], thighR: [8, 0, -18], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    // ...and swung through across his body, the weight carried onto the front foot
    mg_swing: { root: { y: -0.1, rx: 8 }, spine: [10, 20, 0], chest: [12, 34, 0], head: [-12, -26, 0], shoulderR: [-84, 0, 26], elbowR: [-20, 0, 0], shoulderL: [-30, 0, 34], elbowL: [-80, 0, 0], thighL: [-30, 0, 16], kneeL: [36, 0, 0], thighR: [14, 0, -18], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
    // the shove: both hands drawn in, then driven out flat — what walks you off the edge
    mg_shoveW: { root: { y: -0.04, rx: -6 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [4, 0, 0], shoulderL: [-40, 0, 10], elbowL: [-120, 0, 0], shoulderR: [-40, 0, -10], elbowR: [-120, 0, 0], thighL: [-10, 0, 14], kneeL: [18, 0, 0], thighR: [-4, 0, -14], kneeR: [16, 0, 0], hands: ['open', 'open'] },
    mg_shove: { root: { y: -0.1, rx: 16 }, spine: [16, 0, 0], chest: [14, 0, 0], head: [-14, 0, 0], shoulderL: [-92, 0, -6], elbowL: [-8, 0, 0], shoulderR: [-92, 0, 6], elbowR: [-8, 0, 0], thighL: [-38, 0, 12], kneeL: [44, 0, 0], thighR: [22, 0, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the hammer: both fists up over the dome, then down into the stone
    mg_hammerW: { root: { y: 0.02, rx: -10 }, spine: [-10, 0, 0], chest: [-10, 0, 0], head: [-8, 0, 0], shoulderL: [-165, 0, -6], elbowL: [-50, 0, 0], shoulderR: [-165, 0, 6], elbowR: [-50, 0, 0], thighL: [-8, 0, 14], kneeL: [10, 0, 0], thighR: [-8, 0, -14], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
    mg_hammer: { root: { y: -0.18, rx: 22 }, spine: [22, 0, 0], chest: [18, 0, 0], head: [-20, 0, 0], shoulderL: [-70, 0, -8], elbowL: [-20, 0, 0], shoulderR: [-70, 0, 8], elbowR: [-20, 0, 0], thighL: [-40, 0, 18], kneeL: [60, 0, 0], thighR: [-40, 0, -18], kneeR: [60, 0, 0], hands: ['fist', 'fist'] },
    // the body press: down into a crouch, up with the arms thrown high, and the landing is the hammer
    mg_crouch: { root: { y: -0.22, rx: 14 }, spine: [14, 0, 0], chest: [10, 0, 0], head: [-10, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-60, 0, 0], thighL: [-60, 0, 20], kneeL: [90, 0, 0], thighR: [-60, 0, -20], kneeR: [90, 0, 0], hands: ['fist', 'fist'] },
    mg_air: { root: { y: 0, rx: -8 }, chest: [-6, 0, 0], head: [-6, 0, 0], shoulderL: [-150, 0, 30], elbowL: [-40, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-40, 0, 0], thighL: [-50, 0, 14], kneeL: [70, 0, 0], thighR: [-30, 0, -14], kneeR: [60, 0, 0], hands: ['fist', 'fist'] },
  };
  // Magetta's left haymaker: the right one mirrored
  {
    const mir = (p) => {
      const o = {};
      for (const [k, v] of Object.entries(p)) {
        const key = /L$/.test(k) ? k.slice(0, -1) + 'R' : /R$/.test(k) ? k.slice(0, -1) + 'L' : k;
        if (Array.isArray(v) && k !== 'hands') o[key] = [v[0], -v[1], -v[2]];
        else if (k === 'root') o[key] = Object.assign({}, v, { ry: -(v.ry || 0), rz: -(v.rz || 0) });
        else if (k === 'hands') o[key] = [v[1], v[0]];
        else o[key] = v;
      }
      return o;
    };
    W.mg_swingLW = mir(W.mg_swingW);
    W.mg_swingL = mir(W.mg_swing);
  }
  Object.assign(C, W);

  const story = (id, def) => Object.assign({
    id, assetLevel: 1, era: 'Super', playable: false, cinematicOnly: true,
    stats: { hp: 20000, ki: 120, stamina: 120, speed: 1.1, power: 1.2, defense: 1.1, weight: 1, kiRegen: 3, chargeRate: 30, canonPower: 2 },
    moves: { light: [], heavy: {} },
    specials: {},
  }, def);

  /* ======================================================================== FROST (Frieza's appearance, recoloured) */
  {
    const fa = clone(SL.data.characters.frieza.appearance);
    const WHITE = 0xf0f4fa, BLUE = 0x3a5ad0;
    fa.skin = WHITE;
    fa.hair.color = BLUE;
    fa.face.pupil = 0x8a0a1a;
    // dark brow ridges like Frieza's (white ones stood out of the shell's front edge)
    fa.face.brow = 0x4a5070;
    // the Universe 6 combat storyboard (row 2): white body, blue domes and shoulder plates, dark grey legs; the reference
    // sheet (ToP refinement brief): the chest is white with one blue gem, the hands blue, a blue gem at each knee
    Object.assign(fa.outfit, { top: WHITE, arms: WHITE, pants: 0x4a4c58, legs: 0x4a4c58, boots: WHITE, gloves: 0x5a6ae0 });
    // (his chest keeps the full white plate his gem sits on, not Frieza's pec dome)
    Object.assign(fa.outfit.armor, { plate: WHITE, belly: WHITE, pads: BLUE, pecs: false });
    // (not Frieza's own final-form plates: Frost's colours are his own)
    fa.props = (fa.props || []).filter((p) => !p.forms);
    fa.decals = (fa.decals || []).filter((d) => !d.forms).concat([
      { at: 'chest', pos: [0, 0.16, 0.2], size: [0.034, 0.05], color: BLUE },
      { at: 'kneeL', t: 0.06, ang: 0, size: [0.035, 0.035], color: BLUE },
      { at: 'kneeR', t: 0.06, ang: 0, size: [0.035, 0.035], color: BLUE },
    ]);
    fa.outfit.longTail.color = WHITE;
    fa.portraitColor = '#3a5ad0';
    // FIGHTS (the Universe 6 rounds): Frieza's own kit in the first form, and Frieza's final form (its moves and
    // specials) in Frost's palette. No boss phases: the missions own his change.
    const FZ = SL.data.characters.frieza;
    const fin = FZ.forms.find((x) => x.id === 'final');
    // HIS OWN KIT (ToP refinement brief §33 — "avoid a recoloured Frieza with identical animations and AI"): open-handed
    // strikes with the left hand behind his back, an opener that waits before it lands, a spinning heel; the hidden
    // needle; Frieza-race ki (the death beam) kept for range. The final form drops the manners: both hands, sooner.
    const FR_LIGHT = [
      { id: 'frPalm', startup: 11, active: 3, recovery: 10, cancel: 7, damage: 420, reach: 1.15, radius: 0.72, lunge: 13, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'fr_palmW', strike: 'fr_palm' }, sfx: 'punchLight', hitPose: 'hitLight' },
      { id: 'frBack', startup: 5, active: 3, recovery: 10, cancel: 6, damage: 380, reach: 1.1, radius: 0.72, lunge: 10, hitstun: 19, knock: 'flinch', impact: 1, pose: { wind: 'fr_backW', strike: 'fr_back' }, sfx: 'punchLight', hitPose: 'hitSideR' },
      { id: 'frKnee', startup: 6, active: 3, recovery: 12, cancel: 8, damage: 460, reach: 0.95, radius: 0.78, lunge: 11, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'fr_kneeW', strike: 'fr_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    ];
    const FR_HEAVY = {
      0: { id: 'frSpin', startup: 10, active: 4, recovery: 20, damage: 1150, reach: 1.4, radius: 0.95, lunge: 13, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'fr_spinW', strike: 'fr_spin' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
    };
    const NEEDLE = {
      id: 'frNeedle', name: 'Hidden Needle', type: 'projectile', kiCost: 14, icon: 'blast', cooldown: 300,
      startup: 9, recovery: 14, pose: { wind: 'fr_needleW', release: 'fr_needle' },
      projectile: { kind: 'blast', speed: 120, radius: 0.1, damage: 520, homing: 0.04, color: 0xd8e6ff, core: 0xffffff, explode: 0.3, knock: 'crumple', impact: 2, life: 1.2 },
    };
    SL.data.characters.frost = story('frost', {
      name: 'Frost', fullName: 'Frost (Universe 6)', cinematicOnly: false,
      // Free Battle after "One Punch for a Cheat" (unlocks.js); the final form opens with it (fighter.js lockedForms)
      playable: true, style: 'Gentleman · Hidden Needle', ratings: { power: 4, speed: 4, ki: 4, defense: 4 },
      blurb: 'Universe 6\'s hero of the galaxy, with perfect manners — and a needle in his forearm.',
      stats: Object.assign({}, FZ.stats, { hp: 24000, canonPower: 4 }),
      appearance: fa,
      vfx: { ghost: 0xb8d0ff },
      forms: [
        { id: 'base', name: 'First Form', aura: { color: 0x8ab0ff, core: 0xffffff, particles: 0xc0d4ff }, mult: {} },
        Object.assign({}, fin, { id: 'final', name: 'Final Form', line: null, storyLocked: true, freeUnlock: 'u6_frost_goku', kiCost: 35,
          aura: { color: 0x6a9aff, core: 0xffffff, particles: 0xb8d0ff, speed: 1.8 },
          poses: Object.assign({}, fin.poses || {}, { idle: W.fr_finalStance }),
          // both hands, the opener no longer waits; the needle still in the forearm
          moves: Object.assign({}, fin.moves, {
            light: [Object.assign({}, FR_LIGHT[0], { id: 'frJab2', startup: 4, recovery: 9, damage: 400, pose: { wind: 'fr_jab2W', strike: 'fr_jab2' } })].concat(FR_LIGHT.map((m) => Object.assign({}, m, { startup: Math.max(3, m.startup - 3), recovery: Math.max(7, m.recovery - 1) }))),
            heavy: Object.assign({}, fin.moves && fin.moves.heavy, FR_HEAVY),
          }),
          specials: Object.assign({}, fin.specials, { special2: NEEDLE }),
          // the patience ends: longer bursts, shorter rests
          ai: { aggression: 0.86, defense: 0.55, ranged: 0.4, rhythm: { burst: 6, rest: 34 } } }),
      ],
      poses: Object.assign({}, FZ.poses, W, { idle: W.fr_stance }),
      moves: Object.assign({}, FZ.moves, { light: FR_LIGHT, heavy: FR_HEAVY }),
      specials: Object.assign({}, FZ.specials, { special2: NEEDLE }),
      blast: Object.assign({}, FZ.blast, { color: 0x8ab0ff, core: 0xe8f0ff }),
      // patient and polite — then suddenly not (long rests, a burst of three); the needle when you commit (AIHooks.frost)
      ai: { personality: 'elite', aggression: 0.6, defense: 0.66, ranged: 0.4, beam: 0.35, transformHp: 0, preferredRange: 3.4, hooks: 'frost', rhythm: { burst: 3, rest: 70 } },
      whiffRecovery: 14,
      intro: { pose: 'fr_polite', expression: 'calm' },
      victory: { poses: ['fr_bow'], expression: 'smirk' },
      defeat: { pose: 'defeatKneel', expression: 'hurt' },
    });
  }

  /* ======================================================================== HIT */
  {
    const SKIN = 0x9a78c0, COAT = 0x3e2a52, DARK = 0x241a30, GOLD = 0xe8c030, TEAL = 0x3a5870, LILAC = 0xa890c8;
    SL.data.characters.hit = story('hit', {
      name: 'Hit', fullName: 'Hit (the legendary assassin)',
      // Free Battle after "The Unfinished Match" or "The Contract" (unlocks.js); his story skips stay the missions'
      playable: true, style: 'Assassin · Time-Skip', ratings: { power: 4, speed: 5, ki: 3, defense: 5 },
      blurb: 'The best assassin in Universe 6. Hands in his pockets until the moment you are already hit.',
      stats: { hp: 30000, ki: 150, stamina: 150, speed: 1.3, power: 1.5, defense: 1.3, weight: 1, kiRegen: 3, chargeRate: 34, canonPower: 6 },
      appearance: {
        height: 1.14, skin: SKIN,
        build: { chestW: 0.215, chestD: 0.15, shoulderX: 0.225, waistW: 0.14, upperArmR: 0.056, foreArmR: 0.05, fist: 0.052, thighR: 0.084, shinR: 0.062, headR: 0.13, neckLen: 0.08 },
        hair: { style: 'bald', color: SKIN },
        // (the taller skull of the 2026-10-15 defects batch: the ridges sit further out on it)
        // the ridged skull: a crest down the middle and a long low ridge either side of it, running from the brow back over
        // the crown (2026-10-15 visual pass: the side ridges were two round bumps over the brow that read as ears)
        headExtras: [
          { shape: 'ball', a: [0, 0.8, 0.2], d: [0, 1, -0.3], l: 0.12, r: 0.05, color: SKIN, depth: 1.12, flat: 0.6, outline: 0.4 },
          { shape: 'ball', a: [0.28, 0.9, 0.12], d: [0.1, -0.1, -1], l: 0.09, r: 0.034, color: SKIN, depth: 1.1, flat: 0.55, outline: 0.3 },
          { shape: 'ball', a: [-0.28, 0.9, 0.12], d: [-0.1, -0.1, -1], l: 0.09, r: 0.034, color: SKIN, depth: 1.1, flat: 0.55, outline: 0.3 },
        ],
        // (2026-10-15 defects batch: a taller skull, raised over the crown — it was a sphere)
        face: { pupil: 0x3a0a10, sclera: 0xe8c84a, eyeW: 0.86, eyeH: 0.7, brow: 0x5a5470, browThick: 1.4, jaw: 1.08, jawW: 0.94, noEars: true, skull: [0.94, 1.14, 1.03], skullY: 0.05 },
        outfit: {
          topStyle: 'shirt', top: COAT, sleeves: 'long', sleeveColor: TEAL, arms: TEAL,
          collar: COAT, collarStyle: 'turtle',
          jacket: { color: COAT, open: 0.08, collar: DARK },
          gloves: COAT,
          belt: GOLD, beltStyle: 'sash',
          apron: { color: COAT, trim: LILAC, len: 0.48, width: 0.2 },
          cape: COAT,
          pants: TEAL, pantsStyle: 'tight',
          boots: DARK, bootStyle: 'saiyan',
        },
        portraitColor: '#4a2a6a',
      },
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xa06aff, core: 0xe0d0ff, particles: 0xb88aff }, mult: {} }],
      poses: Object.assign({ idle: W.ht_pockets }, W),
      // FIGHTS (u6_hit): an economy of motion — short straight jabs out of the pockets, a front kick, and the
      // vital strike under the ribs. His time-skip belongs to the mission (u6_hit.js), not to this kit.
      cinematicOnly: false,
      vfx: { ghost: 0xb88aff },
      moves: {
        light: [
          { id: 'htJab', startup: 5, active: 3, recovery: 14, cancel: 13, damage: 520, reach: 1.25, radius: 0.7, lunge: 10, hitstun: 12, knock: 'flinch', impact: 1, pose: { wind: 'ht_jabW', strike: 'ht_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
          { id: 'htJab2', startup: 5, active: 3, recovery: 14, cancel: 13, damage: 540, reach: 1.25, radius: 0.7, lunge: 10, hitstun: 12, knock: 'flinch', impact: 1, pose: { wind: 'ht_jab2W', strike: 'ht_jab2' }, sfx: 'punchLight', hitPose: 'hitSideR' },
          { id: 'htKick', startup: 7, active: 4, recovery: 16, cancel: 14, damage: 680, reach: 1.4, radius: 0.85, lunge: 12, hitstun: 16, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'ht_kickW', strike: 'ht_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        ],
        heavy: {
          0: { id: 'htPierce', startup: 11, active: 4, recovery: 22, damage: 1300, reach: 1.3, radius: 0.85, lunge: 16, hitstun: 40, knock: 'crumple', impact: 3, guardCrush: true, guardDamage: 40, pose: { wind: 'ht_vitalW', strike: 'ht_vital' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        },
        dash: { id: 'htGlide', startup: 6, active: 8, recovery: 16, damage: 800, reach: 1.3, radius: 0.9, lunge: 30, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'ht_slide', strike: 'ht_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      // THE TIME-SKIP as his own technique (src/game/techniques.js: timeSkip): the story fights that run their own
      // skip (u6Kit.timeSkip) lock this slot unless a phase allows it
      specials: {
        special1: {
          id: 'timeSkip', name: 'Time-Skip', type: 'timeSkip', kiCost: 26, icon: 'teleport', cooldown: 150,
          prepFrames: 10, gapFrames: 9, damage: 1500, knock: 'crumple', hitstun: 32, recovery: 22, reach: 1.7, color: 0xb070ff,
          poses: { prep: 'ht_lean', strike: 'ht_vital', recover: 'ht_pockets' },
        },
        // TIME CAGE: one palm out, and the target is held in a pocket of stopped time while his ki pays for it
        special2: {
          id: 'timeCage', name: 'Time Cage', type: 'godBind', kiCost: 30, icon: 'guard', cooldown: 540, freeOnly: true,
          range: 10, startup: 14, holdFrames: 96, kiPerSecond: 12, recovery: 18, color: 0xb070ff,
          poses: { hold: 'ht_jab' },
        },
        // FLASH FIST CRUSH: no wind-up you can read — a blur of short straight blows from the pockets, the last one
        // under the ribs
        ultimate: {
          id: 'flashFist', name: 'Flash Fist Crush', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true, freeOnly: true,
          startup: 6, dashFrames: 16, speed: 70, recovery: 26,
          poses: { wind: 'ht_lean' },
          hits: [
            { pose: 'ht_jab', damage: 650, frames: 5, sfx: 'punchLight' },
            { pose: 'ht_jab2', damage: 650, frames: 5, sfx: 'punchLight' },
            { pose: 'ht_jab', damage: 650, frames: 5, sfx: 'punchLight' },
            { pose: 'ht_jab2', damage: 650, frames: 5, sfx: 'punchLight' },
            { pose: 'ht_kick', damage: 900, frames: 8, sfx: 'punchHeavy' },
            { pose: 'ht_vital', damage: 2600, frames: 18, sfx: 'punchHeavy', knock: 'crumple', impact: 4 },
          ],
        },
      },
      // he reads you: patient, guarded, and the skip comes when you commit (SL.AIHooks.hit)
      ai: { personality: 'elite', aggression: 0.45, defense: 0.75, ranged: 0, beam: 0, transformHp: 0, preferredRange: 2.2, hooks: 'hit', rhythm: { burst: 3, rest: 44 } },
      intro: { pose: 'ht_pockets', expression: 'cold' },
      victory: { poses: ['ht_pockets'], expression: 'cold' },
      defeat: { pose: 'defeatKneel', expression: 'hurt' },
    });
  }

  /* ======================================================================== BOTAMO */
  {
    const SKIN = 0xf2c43a, VEST = 0xd02e2a;
    SL.data.characters.botamo = story('botamo', {
      name: 'Botamo', fullName: 'Botamo (Universe 6)',
      appearance: {
        height: 1.45, skin: SKIN,
        build: { chestW: 0.3, chestD: 0.26, shoulderX: 0.28, waistW: 0.3, waistD: 0.27, pelvisW: 0.28, upperArmR: 0.088, foreArmR: 0.082, fist: 0.078, thighR: 0.13, shinR: 0.11, headR: 0.17, neckLen: 0.02 },
        hair: { style: 'bald', color: SKIN },
        // round bear ears on top of the head
        headExtras: [
          { shape: 'ball', a: [0.62, 0.7, 0], d: [0.5, 1, 0], l: 0.05, r: 0.06, color: SKIN, depth: 0.95, flat: 0.55, outline: 0.5 },
          { shape: 'ball', a: [-0.62, 0.7, 0], d: [-0.5, 1, 0], l: 0.05, r: 0.06, color: SKIN, depth: 0.95, flat: 0.55, outline: 0.5 },
        ],
        face: { pupil: 0x101010, eyeW: 0.62, eyeH: 0.7, brow: 0xc8962a, browThick: 0.6, jaw: 1.1, jawW: 1.2, cheeks: 1.4, noEars: true },
        outfit: {
          // (2026-10-16, the board p.50: the red shirt ends at his hips — yellow legs into big red shoes; his legs were red)
          topStyle: 'shirt', top: VEST, sleeves: 'none', sleeveColor: VEST, arms: SKIN,
          pants: SKIN, pantsStyle: 'gi', legs: SKIN,
          boots: 0xd8281e, bootStyle: 'gi',
        },
        portraitColor: '#d02e2a',
      },
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xfff0b0, core: 0xffffff, particles: 0xffe890 }, mult: {} }],
      poses: Object.assign({ idle: W.bo_idle }, W),
      cinematicOnly: false,
      stats: { hp: 30000, ki: 80, stamina: 200, speed: 0.8, power: 1.1, defense: 1.6, weight: 2.6, kiRegen: 2, chargeRate: 20, canonPower: 2 },
      // slow, heavy body work: belly shoves that push you back toward the edge of the ring
      moves: {
        light: [
          { id: 'boSlap', startup: 9, active: 4, recovery: 16, cancel: 10, damage: 420, reach: 1.5, radius: 0.95, lunge: 8, hitstun: 20, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { id: 'boSwat', startup: 10, active: 4, recovery: 16, cancel: 11, damage: 460, reach: 1.5, radius: 0.95, lunge: 8, hitstun: 20, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { id: 'boBelly', startup: 12, active: 5, recovery: 20, cancel: 13, damage: 600, reach: 1.6, radius: 1.1, lunge: 14, hitstun: 24, knock: 'push', knockSpeed: 22, impact: 2, pose: { wind: 'stagger', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        ],
        heavy: {
          0: { id: 'boPress', startup: 16, active: 5, recovery: 28, damage: 1100, reach: 1.6, radius: 1.2, lunge: 12, hitstun: 34, knock: 'heavy', knockSpeed: 28, impact: 3, armor: true, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        dash: { id: 'boCharge', startup: 12, active: 12, recovery: 26, damage: 800, reach: 1.6, radius: 1.2, lunge: 26, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 3, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      ai: { personality: 'grunt', aggression: 0.75, defense: 0.1, ranged: 0, beam: 0, transformHp: 0, preferredRange: 1.8 },
      intro: { pose: 'bo_idle', expression: 'calm' },
      victory: { poses: ['bo_idle'], expression: 'grin' },
      defeat: { pose: 'knockdown', expression: 'ko' },
    });
  }

  /* ======================================================================== MAGETTA */
  {
    // the U6 combat storyboard (row 5): dark gunmetal, a huge round head, two yellow eyes, the smokestack
    const METAL = 0x5c5e6c, DARK = 0x3a3c48, GLOW = 0xffd84a;
    SL.data.characters.magetta = story('magetta', {
      name: 'Magetta', fullName: 'Auta Magetta (Universe 6)',
      // Free Battle after "Iron and Magma" (unlocks.js)
      playable: true, style: 'Iron Body · Magma', ratings: { power: 5, speed: 1, ki: 2, defense: 5 },
      blurb: 'A walking furnace of iron. He does not dodge and he does not hurry; he pushes, and the ground shakes when he lands.',
      appearance: {
        height: 1.8, skin: METAL,
        build: { chestW: 0.32, chestD: 0.26, shoulderX: 0.33, waistW: 0.22, waistD: 0.2, pelvisW: 0.23, upperArmR: 0.09, foreArmR: 0.1, fist: 0.1, thighR: 0.12, shinR: 0.11, headR: 0.2, neckLen: 0.01 },
        hair: { style: 'bald', color: METAL },
        // the dome: a smokestack on top, two glowing round eyes, rivets
        headExtras: [
          // (2026-10-16, the board p.51: the smokestack a pipe with a rim, not a spike)
          { shape: 'cyl', a: [0, 0.92, -0.1], d: [0, 1, -0.12], l: 0.12, r: 0.032, flat: 1, color: DARK, depth: 0.96, outline: 0.5 },
          { shape: 'cyl', a: [0, 0.92, -0.1], d: [0, 1, -0.12], l: 0.02, r: 0.042, flat: 1, color: DARK, depth: 0.96 + 0.11 / 0.2, outline: 0.4 },
          { shape: 'ball', a: [0.36, 0.1, 0.92], d: [0, 0, 1], l: 0.01, r: 0.045, color: GLOW, depth: 0.99, flat: 0.5, outline: 0.4 },
          { shape: 'ball', a: [-0.36, 0.1, 0.92], d: [0, 0, 1], l: 0.01, r: 0.045, color: GLOW, depth: 0.99, flat: 0.5, outline: 0.4 },
        ],
        // a machine's face: only the two glowing eyes — the human pupils, brows, nose and mouth (a face drawn on the dome
        // under them) take the metal's colour and vanish into it (the board p.51)
        face: { pupil: METAL, sclera: METAL, lash: METAL, eyeW: 0.5, eyeH: 0.5, brow: METAL, browThick: 0.5, nose: 0.001, mouthColor: METAL, jaw: 1.2, jawW: 1.2, cheeks: 0, noEars: true },
        outfit: {
          topStyle: 'armor', top: METAL, arms: METAL, sleeves: 'long', sleeveColor: METAL,
          armor: { plate: DARK, belly: METAL, pads: DARK, padStyle: 'up', trim: 0x3a3c48 },
          pants: METAL, pantsStyle: 'tight',
          boots: DARK, bootStyle: 'saiyan',
        },
        portraitColor: '#5a5c6a',
      },
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xffa040, core: 0xffffff, particles: 0xffc080 }, mult: {} }],
      poses: Object.assign({ idle: W.mg_idle, run: W.mg_walk }, W),
      cinematicOnly: false,
      stats: { hp: 32000, ki: 120, stamina: 200, speed: 0.75, power: 1.5, defense: 1.7, weight: 3, kiRegen: 3, chargeRate: 24, canonPower: 3 },
      // WEIGHT (ToP refinement brief §34) — not just a health bar: every step lands (footfall: a thud, dust, a tremor);
      // light blows do not stop him (poise, and armour on every swing) until enough of them break it; the swings are
      // slow and whole-body, the hammer comes down into the stone, the shove walks you off the edge. His lava spit and
      // steam are the mission's (u6_magetta.js); his own special is the body press, telegraphed where it will land
      footfall: { every: 0.6, vol: 0.55, pitch: 0.45, dust: 1.1, trauma: 0.05 },
      poise: { max: 110, regen: 14, regenDelay: 110, armor: 2, cost: { 1: 5, 2: 9, 3: 15, 4: 24 }, beamMul: 1, breakFrames: 150, vulnerable: 1.2 },
      moves: {
        light: [
          { id: 'mgHaymaker', startup: 14, active: 5, recovery: 20, cancel: 14, damage: 760, reach: 1.9, radius: 1.2, lunge: 6, hitstun: 24, knock: 'push', knockSpeed: 16, impact: 2, armor: true, pose: { wind: 'mg_swingW', strike: 'mg_swing' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { id: 'mgShove', startup: 16, active: 6, recovery: 24, cancel: 16, damage: 620, reach: 1.8, radius: 1.3, lunge: 9, hitstun: 26, knock: 'push', knockSpeed: 30, impact: 3, armor: true, guardDamage: 34, pose: { wind: 'mg_shoveW', strike: 'mg_shove' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { id: 'mgHaymakerL', startup: 14, active: 5, recovery: 20, cancel: 14, damage: 760, reach: 1.9, radius: 1.2, lunge: 6, hitstun: 24, knock: 'push', knockSpeed: 16, impact: 2, armor: true, pose: { wind: 'mg_swingLW', strike: 'mg_swingL' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
        ],
        heavy: {
          0: { id: 'mgHammer', startup: 22, active: 5, recovery: 32, damage: 1600, reach: 1.6, radius: 1.6, lunge: 8, hitstun: 36, knock: 'smash', knockSpeed: 30, impact: 4, armor: true, guardCrush: true, guardDamage: 50, quake: { r: 2.6, trauma: 0.5, color: 0xffb060 }, pose: { wind: 'mg_hammerW', strike: 'mg_hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        dash: { id: 'mgShoulder', startup: 12, active: 12, recovery: 28, damage: 1200, reach: 1.6, radius: 1.4, lunge: 26, hitstun: 30, knock: 'heavy', knockSpeed: 32, impact: 3, armor: true, pose: { wind: 'mg_shoveW', strike: 'mg_shove' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      specials: {
        special1: {
          id: 'mgPress', name: 'Iron Body Press', type: 'groundSlam', kiCost: 30, icon: 'ball', cooldown: 480,
          crouch: 24, hang: 34, height: 5, maxRange: 14, radius: 4.5, clearHeight: 1.8, damage: 1800, knockSpeed: 22, recovery: 40,
          ringColor: 0xffa040, coreColor: 0xffd84a, dustColor: 'stage', poses: { crouch: 'mg_crouch', air: 'mg_air', land: 'mg_hammer' },
        },
        // MAGMA SPIT: molten metal from the furnace of his head — slow, heavy, it bursts where it lands (Free Battle only)
        special2: {
          id: 'mgSpit', name: 'Magma Spit', type: 'projectile', kiCost: 22, icon: 'ball', cooldown: 150, fromHead: true, freeOnly: true,
          startup: 20, recovery: 26, pose: { wind: 'mg_shoveW', release: 'mg_shove' },
          projectile: { kind: 'ball', speed: 26, radius: 0.55, damage: 1400, homing: 0.25, color: 0xff6a1a, core: 0xffd060, explode: 2.8, knock: 'heavy', knockSpeed: 18, impact: 3, life: 2.8 },
        },
        // MOLTEN GROUND: he drives both fists into the stone and the magma comes up in columns round you (Free Battle only)
        ultimate: {
          id: 'mgMolten', name: 'Molten Ground', type: 'eruption', kiCost: 100, icon: 'ultimate', ultimate: true, freeOnly: true,
          count: 6, interval: 12, delay: 30, lead: 0.5, radius: 3.2, columnHeight: 8, damage: 1300, knockSpeed: 22, recovery: 40,
          color: 0xff6a1a, poses: { cast: 'mg_hammer' },
        },
      },
      ai: { personality: 'grunt', aggression: 0.55, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 2.4, hooks: 'magetta', rhythm: { burst: 2, rest: 50 } },
      intro: { pose: 'mg_idle', expression: 'cold' },
      victory: { poses: ['mg_idle'], expression: 'cold' },
      defeat: { pose: 'knockdown', expression: 'ko' },
    });
  }

  /* ======================================================================== JACO (Galactic Patrol; he spots the needle) */
  {
    const SKIN = 0xb8a8d8, SUIT = 0x3a2a5a, WHITE = 0xf2f0f6;
    SL.data.characters.jaco = story('jaco', {
      name: 'Jaco', fullName: 'Jaco (Galactic Patrol)',
      appearance: {
        height: 0.66, skin: SKIN,
        build: { chestW: 0.17, chestD: 0.14, shoulderX: 0.16, waistW: 0.15, waistD: 0.13, upperArmR: 0.04, foreArmR: 0.036, fist: 0.04, thighR: 0.065, shinR: 0.05, headR: 0.18, neckLen: 0.0 },
        hair: { style: 'bald', color: WHITE },
        headExtras: [{ shape: 'ball', a: [0, 0.55, -0.2], d: [0, 1, -0.2], l: 0.02, r: 0.17, color: WHITE, depth: 0.55, flat: 0.95, outline: 0.6 }],
        face: { pupil: 0x101010, sclera: 0xffd84a, eyeW: 1.3, eyeH: 1.3, brow: SKIN, browThick: 0.4, noEars: true, jaw: 1.1 },
        outfit: {
          topStyle: 'shirt', top: SUIT, sleeves: 'long', sleeveColor: SUIT, arms: SUIT, collar: WHITE,
          belt: WHITE, pants: SUIT, pantsStyle: 'tight', gloves: WHITE, boots: WHITE, bootStyle: 'saiyan',
        },
        portraitColor: '#3a2a5a',
      },
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
      poses: Object.assign({}, W),
      intro: { pose: 'idle', expression: 'calm' },
    });
  }

  /* ======================================================================== CHAMPA (Beerus' twin) */
  {
    const B = SL.data.characters.beerus;
    const a = clone(B.appearance);
    // rounder: the same god's body with a big belly
    Object.assign(a.build, { chestW: 0.215, chestD: 0.17, waistW: 0.2, waistD: 0.2, pelvisW: 0.15, upperArmR: 0.05, foreArmR: 0.046, thighR: 0.086 });
    a.skin = 0x947694;
    Object.assign(a.outfit, { top: 0x947694, arms: 0x947694, pecs: 0x947694, legs: 0x947694, pants: 0xc8364a, belt: 0x2a1a3a });
    a.portraitColor = '#c8364a';
    SL.data.characters.champa = story('champa', {
      name: 'Champa', fullName: 'Champa (God of Destruction, Universe 6)',
      stats: Object.assign({}, B.stats),
      appearance: a,
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xc89aff, core: 0xffffff, particles: 0xd8b0ff }, mult: {} }],
      poses: Object.assign({}, B.poses, W, { idle: W.ch6_idle }),
      intro: { pose: 'ch6_idle', expression: 'smirk' },
    });
  }

  /* ======================================================================== VADOS (Whis' sister) */
  {
    const Wh = SL.data.characters.whis;
    const a = clone(Wh.appearance);
    const HAIR = 0xf2f4fa;
    a.skin = 0x8ad0e8;
    Object.assign(a.outfit, { arms: 0x8ad0e8, top: 0x4a1a4a, sleeveColor: 0x4a1a4a });
    a.outfit.apron = Object.assign({}, a.outfit.apron, { color: 0x4a1a4a, trim: 0x2ab0b8 });
    // the white hair drawn up into a high ponytail that falls down the back
    a.headExtras = [
      { shape: 'ball', a: [0, 0.75, 0], d: [0, 1, -0.1], l: 0.08, r: 0.12, flat: 0.9, depth: 0.82, color: HAIR, outline: 0.6 },
      { a: [0, 0.9, -0.3], d: [0, 0.7, -1], l: 0.12, r: 0.06, flat: 0.8, depth: 0.9, color: HAIR, outline: 0.5 },
      { a: [0, 0.4, -0.95], d: [0, -1, -0.2], l: 0.3, r: 0.07, flat: 0.8, depth: 0.95, color: HAIR, outline: 0.5 },
    ];
    a.face = Object.assign({}, a.face, { pupil: 0x6a3aa8, lips: 0x5a2a6a, jaw: 0.86, eyeW: 1.05, lashWing: true });
    a.portraitColor = '#4a1a4a';
    SL.data.characters.vados = story('vados', {
      name: 'Vados', fullName: 'Vados (attendant of the God of Destruction, Universe 6)',
      stats: Object.assign({}, Wh.stats),
      appearance: a,
      vfx: Wh.vfx,
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe9ff }, mult: {} }],
      poses: Object.assign({}, Wh.poses),
      intro: { pose: 'w_idle', expression: 'calm' },
    });
  }
})();
