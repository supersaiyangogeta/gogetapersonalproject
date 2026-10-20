/*
 * CELL (Android Saga, Age 767) — Gero's last project, and the first opponent in
 * the game whose whole design is that he is *unfinished*.
 *
 * Three forms, built the way Frieza's four were: each one has its own moveset,
 * specials, multipliers, silhouette and aura, so a transformation replaces a kit
 * instead of scaling it.
 *
 *   imperfect     hunched, spotted, insect-limbed — a thief who runs from a real fight
 *   semi_perfect  bloated and overconfident, and slower for it
 *   perfect       the finished article: fast, clean and completely calm
 *
 * His mechanic is **regeneration** (`Mechanics.bioRegen`): leave him alone for a
 * few seconds and he knits himself back together, so a fight against him is a
 * fight against a clock. Keeping the pressure on is the only way to keep damage.
 *
 * Level 1 functional prototype, story only.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    cl_idle: (t) => {
      const b = Math.sin(t * 2.3);
      return {
        root: { y: -0.03 + b * 0.012 },
        hips: [0, -6, 0], spine: [4, 0, 0], chest: [4, 8, 0], head: [-6, -6, 0],
        shoulderL: [-26, 0, 26], elbowL: [-72, 0, 0], shoulderR: [-26, 0, -26], elbowR: [-72, 0, 0],
        thighL: [-14, 4, 12], kneeL: [20 + b, 0, 0], thighR: [10, -4, -12], kneeR: [18 + b, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    cl_hunch: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: -0.12 + b * 0.012, rx: 16 },
        hips: [0, -8, 0], spine: [14, 0, 0], chest: [16, 8, 0], head: [-22, -8, 0],
        shoulderL: [-34, 0, 34], elbowL: [-92, 0, 0], shoulderR: [-34, 0, -34], elbowR: [-92, 0, 0],
        thighL: [-26, 4, 14], kneeL: [40 + b, 0, 0], thighR: [16, -4, -14], kneeR: [34 + b, 0, 0],
        hands: ['open', 'open'],
      };
    },
    cl_clawW: {
      root: { y: -0.08 }, chest: [6, 34, 0], head: [-8, -22, 0],
      shoulderR: [-40, 0, -40], elbowR: [-96, 0, 0], shoulderL: [-24, 0, 26], elbowL: [-70, 0, 0],
      thighL: [-22, 0, 12], kneeL: [32, 0, 0], thighR: [14, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    cl_claw: {
      root: { y: -0.1, rx: 10 }, chest: [10, -34, 0], head: [-10, 24, 0],
      shoulderR: [-92, 0, 26], elbowR: [-6, 0, 0], shoulderL: [-22, 0, 34], elbowL: [-54, 0, 0],
      thighL: [-34, 0, 12], kneeL: [44, 0, 0], thighR: [22, 0, -12], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    cl_tailW: {
      root: { y: -0.1 }, spine: [-8, 0, 0], chest: [-10, -18, 0], head: [-12, 14, 0],
      shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-70, 0, 0],
      thighL: [-24, 0, 14], kneeL: [36, 0, 0], thighR: [16, 0, -14], kneeR: [26, 0, 0],
      hands: ['open', 'open'],
    },
    cl_tail: {
      root: { y: -0.14, rx: 20 }, spine: [12, 0, 0], chest: [16, 22, 0], head: [-4, -16, 0],
      shoulderL: [-40, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-40, 0, 0],
      thighL: [-40, 0, 14], kneeL: [52, 0, 0], thighR: [26, 0, -14], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    cl_kameW: (t) => {
      const s = Math.sin(t * 26) * 1.6;
      return {
        root: { y: -0.06 }, spine: [-6, 0, 0], chest: [-8 + s * 0.3, -30, 0], head: [-10, 22, 0],
        shoulderL: [-84, 0, 28], elbowL: [-104, 0, 0], shoulderR: [-84, 0, -28], elbowR: [-104, 0, 0],
        thighL: [-26, 0, 16], kneeL: [40, 0, 0], thighR: [16, 0, -16], kneeR: [28, 0, 0],
        hands: ['open', 'open'],
      };
    },
    cl_kame: {
      root: { y: -0.1, rx: 10 }, spine: [8, 0, 0], chest: [12, 0, 0], head: [-10, 0, 0],
      shoulderL: [-100, 0, 12], elbowL: [-10, 0, 0], handL: [-40, 0, 0],
      shoulderR: [-100, 0, -12], elbowR: [-10, 0, 0], handR: [-40, 0, 0],
      thighL: [-40, 0, 16], kneeL: [52, 0, 0], thighR: [24, 0, -16], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    cl_brace: (t) => {
      const s = Math.sin(t * 30) * 2;
      return {
        root: { y: -0.08 + s * 0.005, rx: 6 }, spine: [6, 0, 0], chest: [8 + s * 0.4, 0, 0], neck: [6, 0, 0], head: [8, 0, 0],
        shoulderL: [-20, 0, 50], elbowL: [-70, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-70, 0, 0],
        thighL: [-30, 0, 18], kneeL: [46, 0, 0], thighR: [18, 0, -18], kneeR: [34, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    cl_roar: (t) => {
      const s = Math.sin(t * 40) * 2.4;
      return {
        root: { y: -0.04 + s * 0.006, rx: -12 }, spine: [-12, 0, 0], chest: [-18 + s * 0.5, 0, 0], neck: [-18, 0, 0], head: [-30, 0, 0],
        shoulderL: [-4, 0, 66], elbowL: [-30, 0, 0], shoulderR: [-4, 0, -66], elbowR: [-30, 0, 0],
        thighL: [-24, 0, 22], kneeL: [38, 0, 0], thighR: [14, 0, -22], kneeR: [28, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    cl_calm: {
      root: { y: -0.01 }, chest: [-2, 8, 0], head: [-6, -6, 0],
      shoulderL: [-14, 0, 18], elbowL: [-44, 0, 0], shoulderR: [-14, 0, -18], elbowR: [-44, 0, 0],
      thighL: [-6, 0, 12], kneeL: [10, 0, 0], thighR: [4, 0, -12], kneeR: [8, 0, 0],
      hands: ['fist', 'fist'],
    },
  };

  const spots = (color) => [
    { a: [0.55, 0.85, 0.2], d: [0.6, 1, -0.1], l: 0.1, r: 0.03, color, depth: 0.96 },
    { a: [-0.55, 0.85, 0.2], d: [-0.6, 1, -0.1], l: 0.1, r: 0.03, color, depth: 0.96 },
  ];
  const BLACK = 0x16181a, GREEN = 0x5a9a44;
  // the head: a black crown sweeping back into two points with a green plate between them, black
  // markings running down from the eyes
  const crown = (center, horns, extra) =>
    [
      { a: [0, 0.92, 0.36], d: [0, 1, -0.55], l: 0.2, r: 0.075, color: center, flat: 0.22, depth: 0.94 },
      { a: [0.38, 0.86, 0.3], d: [0.3, 1, -0.7], l: 0.27, r: 0.085, color: horns, flat: 0.22, depth: 0.95 },
      { a: [-0.38, 0.86, 0.3], d: [-0.3, 1, -0.7], l: 0.27, r: 0.085, color: horns, flat: 0.22, depth: 0.95 },
      { a: [0.45, 0.55, -0.6], d: [0.3, 0.2, -1], l: 0.16, r: 0.07, color: horns, flat: 0.3, depth: 0.95 },
      { a: [-0.45, 0.55, -0.6], d: [-0.3, 0.2, -1], l: 0.16, r: 0.07, color: horns, flat: 0.3, depth: 0.95 },
      // the crown carries on over the back of the skull
      { shape: 'ball', a: [0, 0.45, -0.8], d: [0, 0.3, -1], l: 0.13, r: 0.135, color: horns, flat: 0.55, depth: 0.82 },
      { shape: 'line', a: [0.3, -0.02, 0.94], d: [0.12, -1, 0.15], l: 0.09, r: 0.014, color: BLACK },
      { shape: 'line', a: [-0.3, -0.02, 0.94], d: [-0.12, -1, 0.15], l: 0.09, r: 0.014, color: BLACK },
    ].concat(extra || []);
  const PERFECT_CROWN = crown(GREEN, BLACK);
  // Perfect Cell's plating (2026-10-15 visual pass, the board p.36): dark plates over the pecs and the shoulders, and the
  // belly turned from the cream of the earlier forms into green carapace (look.swap). Props for the 'perfect' form only;
  // Super Perfect Cell (super_perfect_cell.js) re-tags them for his single form.
  const CELL_ABS = 0xe2dccb, CELL_ABS_PERFECT = 0x5a9a45, CELL_PLATE = 0x34343f;
  const PERFECT_PLATES = [
    { id: 'pecL', joint: 'chest', shape: 'ball', pos: [0.085, 0.19, 0.172], rot: [-0.25, 0.35, 0], size: [0.1, 0.075, 0.04], color: CELL_PLATE, forms: ['perfect'] },
    { id: 'pecR', joint: 'chest', shape: 'ball', pos: [-0.085, 0.19, 0.172], rot: [-0.25, -0.35, 0], size: [0.1, 0.075, 0.04], color: CELL_PLATE, forms: ['perfect'] },
    { id: 'shoulderPlateL', joint: 'shoulderL', shape: 'ball', pos: [0.01, 0.0, 0], size: [0.082, 0.07, 0.082], color: CELL_PLATE, forms: ['perfect'] },
    { id: 'shoulderPlateR', joint: 'shoulderR', shape: 'ball', pos: [-0.01, 0.0, 0], size: [0.082, 0.07, 0.082], color: CELL_PLATE, forms: ['perfect'] },
    // the purple band round the waist (the board p.36), ribbed with two dark lines
    { id: 'waistBand', joint: 'spine', shape: 'neckRing', pos: [0, 0.02, 0.004], radius: 0.166, depth: 0.62, thick: 0.13, color: 0x5a2a6a, forms: ['perfect'] },
    { id: 'waistRibA', joint: 'spine', shape: 'neckRing', pos: [0, 0.03, 0.004], radius: 0.171, depth: 0.63, thick: 0.035, color: 0x2a1030, outline: 0, forms: ['perfect'] },
    { id: 'waistRibB', joint: 'spine', shape: 'neckRing', pos: [0, 0.01, 0.004], radius: 0.171, depth: 0.63, thick: 0.035, color: 0x2a1030, outline: 0, forms: ['perfect'] },
  ];
  // Imperfect: orange crest-wings on the head and a beak where the mouth should be
  const IMPERFECT_CROWN = crown(0xe08a2a, 0xe08a2a, [{ shape: 'ball', a: [0, -0.42, 0.9], d: [0, -0.2, 1], l: 0.06, r: 0.07, color: 0xd8862a, flat: 0.8, depth: 0.95 }]);
  // Semi-Perfect: the crown bigger and flatter, and the snout
  const SEMI_CROWN = crown(GREEN, BLACK, [{ shape: 'ball', a: [0, -0.18, 0.96], d: [0, 0, 1], l: 0.05, r: 0.05, color: 0xc8b4cc, flat: 0.8, depth: 0.97 }]);
  // black spots over the green: shoulders, arms, chest, thighs. z: the spots' own size; forms: drawn only in those forms;
  // shift: the same layout turned round the limbs and moved down them (a second layer of speckles)
  const spotsBody = (c, s, z = 1, forms, shift = 0) => {
    const out = [];
    const sz = (w, h) => [w * s * z, h * s * z];
    const dt = shift ? 0.12 : 0, dy = shift ? -0.045 : 0;
    for (const side of ['L', 'R']) {
      const k = side === 'L' ? 1 : -1;
      const a = (x) => (x + shift) * k;
      out.push(
        { at: 'shoulder' + side, t: 0.18 + dt, ang: a(0.5), size: sz(0.024, 0.03), color: c },
        { at: 'shoulder' + side, t: 0.45 + dt, ang: a(-0.9), size: sz(0.02, 0.026), color: c },
        { at: 'shoulder' + side, t: 0.7 + dt, ang: a(1.9), size: sz(0.022, 0.022), color: c },
        { at: 'elbow' + side, t: 0.25 + dt, ang: a(1.1), size: sz(0.018, 0.022), color: c },
        { at: 'elbow' + side, t: 0.55 + dt, ang: a(-1.5), size: sz(0.018, 0.02), color: c },
        { at: 'thigh' + side, t: 0.22 + dt, ang: a(0.4), size: sz(0.03, 0.036), color: c },
        { at: 'thigh' + side, t: 0.5 + dt, ang: a(-1.2), size: sz(0.028, 0.03), color: c },
        { at: 'thigh' + side, t: 0.42 + dt, ang: a(2.5), size: sz(0.03, 0.03), color: c },
        { at: 'thigh' + side, t: 0.75 + dt, ang: a(0.9), size: sz(0.024, 0.026), color: c },
        { at: 'chest', pos: [k * 0.075 * s, 0.215 + dy, 0.168 * s], rot: [-0.3, k * 0.35, 0], size: sz(0.024, 0.028), color: c },
        { at: 'chest', pos: [k * 0.15 * s, 0.13 + dy, 0.135 * s], rot: [-0.1, k * 0.8, 0], size: sz(0.022, 0.026), color: c },
        { at: 'chest', pos: [k * 0.2 * s, 0.24 + dy, 0.04], rot: [-0.6, k * 1.3, 0], size: sz(0.026, 0.024), color: c },
      );
    }
    return forms ? out.map((d) => Object.assign(d, { forms })) : out;
  };

  // Free Battle: the next shape on a button — hunched, the body swells, the burst (the story keeps its own long change)
  const CL_PRACTICED = {
    length: 96,
    applyAt: 50,
    steps: [
      { at: 0, pose: 'cl_brace', speed: 9, expression: 'grit', aura: 0.3, shot: 'face', sfx: 'kiUp' },
      { at: 22, aura: 0.6, quake: 0.14, dust: 3 },
      { at: 50, burst: true, small: true, pose: 'cl_roar', speed: 12, expression: 'shout', flash: 0.25, crater: 2.5 },
      { at: 58, shot: 'pull' },
      { at: 80, pose: 'cl_calm', expression: 'smirk' },
    ],
  };

  SL.data.characters.cell = {
    id: 'cell',
    assetLevel: 1,
    name: 'Cell',
    era: 'Android Saga',
    playable: true, // Free Battle once the Cell Games are over (unlocks.js); the story still owns his absorptions
    prototype: true,
    style: 'Bio-Android',
    blurb: 'Every fighter Gero ever recorded, in one body that is not finished yet.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 5 },
    stats: { hp: 38000, ki: 150, stamina: 180, speed: 1.1, power: 1.3, defense: 1.25, weight: 1.3, kiRegen: 4, chargeRate: 34, canonPower: 16 },
    poise: { max: 100, regen: 12, regenDelay: 120, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 25 }, beamMul: 1.05, breakFrames: 150, vulnerable: 1.2 },
    vfx: { ghost: 0xa8e08a },
    appearance: {
      height: 1.04,
      skin: GREEN,
      build: { chestW: 0.25, chestD: 0.175, shoulderX: 0.255, waistW: 0.17, upperArmR: 0.064, foreArmR: 0.056, fist: 0.062, thighR: 0.098, shinR: 0.074, headR: 0.142, neckLen: 0.06 },
      hair: null,
      headExtras: PERFECT_CROWN,
      face: { skin: 0xb898c4, pupil: 0x7a0e2a, sclera: 0xf6d8e4, brow: BLACK, noEars: true, eyeW: 1.08, lash: BLACK, nose: 0.6 },
      outfit: {
        topStyle: 'bare', top: GREEN, pecs: GREEN, abs: CELL_ABS, arms: GREEN,
        pants: GREEN, pantsStyle: 'tight', legs: BLACK,
        boots: BLACK, bootStyle: 'shoe',
        // the stinger tail he drinks people through (shown by the imperfect and semi-perfect forms)
        longTail: { color: GREEN, segments: 10, length: 1.8, radius: 0.055, lift: 1.2, curl: 0.15, tip: 0xd8a868 },
      },
      // each shape its own spots (2026-10-15, the board p.34–36; one set used to serve all three): Imperfect a dense
      // scatter of small speckles, Semi-Perfect big angular blotches, Perfect the medium spots
      decals: spotsBody(BLACK, 1, 0.5, ['base']).concat(spotsBody(BLACK, 1, 0.45, ['base'], 1.3), spotsBody(BLACK, 1, 1.45, ['semi_perfect']), spotsBody(BLACK, 1, 1, ['perfect'])),
      props: PERFECT_PLATES,
      wings: { color: BLACK, len: 0.82, width: 0.13, x: 0.07, tilt: 0.12, spread: 0.12, flat: 0.18 },
      portraitColor: '#6eb84e',
    },
    // THREE FORMS. Each one is a different fighter: its own kit, numbers, size
    // and silhouette, entered through the shared bossTransform cinematic.
    forms: [
      {
        id: 'base',
        name: 'Imperfect',
        aura: { color: 0x8ad46a, core: 0xe0ffd0, particles: 0xa8e08a, speed: 1.1 },
        mult: {},
        look: { scale: 1, bulk: 1, tint: 0x2a4a2a, tintAmount: 0.18, headExtras: IMPERFECT_CROWN },
      },
      {
        id: 'semi_perfect',
        name: 'Semi-Perfect',
        // the story's absorptions are boss transformations and cost nothing; a player buys the next shape
        kiCost: 40,
        storyBoss: true,
        practiced: CL_PRACTICED,
        style: 'full',
        line: 'cell_semi',
        aura: { color: 0x6ad4a8, core: 0xd0ffe8, particles: 0x8ae0c0, speed: 1.2 },
        // bigger, heavier, and pleased with himself — which costs him speed
        mult: { damage: 1.4, speed: 0.92, defense: 1.3, kiRegen: 1.1, chargeRate: 1.1, guardStamina: 0.9 },
        look: { scale: 1.16, bulk: 1.3, tint: 0xd8f0c8, tintAmount: 0.12, headExtras: SEMI_CROWN },
        sequence: { length: 200, applyAt: 130, steps: [{ at: 0, pose: 'cl_brace', shake: 0.4 }, { at: 50, pose: 'cl_brace', shake: 0.7 }, { at: 96, pose: 'cl_roar', shake: 1 }, { at: 126, pose: 'cl_roar', shake: 1, burst: true }, { at: 170, pose: 'cl_calm', shake: 0.2 }] },
        moves: {
          light: [
            { id: 'cl2Jab', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 1100, reach: 1.5, radius: 0.9, lunge: 14, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'cl2Swipe', startup: 6, active: 3, recovery: 14, cancel: 8, damage: 1250, reach: 1.6, radius: 0.95, lunge: 14, hitstun: 22, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
            { id: 'cl2Tail', startup: 9, active: 4, recovery: 18, cancel: 11, damage: 1700, reach: 2.4, radius: 1.15, lunge: 12, hitstun: 28, knock: 'heavy', knockSpeed: 24, impact: 3, pose: { wind: 'cl_tailW', strike: 'cl_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          ],
          heavy: {
            0: { id: 'cl2Slam', startup: 13, active: 5, recovery: 25, damage: 2900, reach: 1.7, radius: 1.1, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 4, guardCrush: true, guardDamage: 50, pose: { wind: 'cl_tailW', strike: 'cl_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          },
          dash: { id: 'cl2Charge', startup: 8, active: 8, recovery: 22, damage: 2000, reach: 1.7, radius: 1.05, lunge: 26, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        },
        specials: {
          special1: {
            id: 'cl2Kame', name: 'Kamehameha', type: 'beam', kiCost: 40, icon: 'beam',
            chargeMin: 26, chargeMax: 70, tiers: [26, 50], damage: [2600, 4200], radius: [0.9, 1.4], speed: 100, range: 150, sustain: 36,
            color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'cl_kameW', fire: 'cl_kame' }, recovery: 30,
            callout: ['KAME', 'HAME', 'HA!'],
          },
          special2: {
            id: 'cl2Quake', name: 'Gravity Slam', type: 'groundSlam', kiCost: 36, icon: 'ball', cooldown: 320,
            crouch: 20, hang: 24, height: 6, maxRange: 16, radius: 7, clearHeight: 2.2, damage: 2200, knockSpeed: 24, recovery: 40,
            color: 0x8ae0c0, poses: { crouch: 'cl_brace', air: 'cl_tailW', land: 'cl_tail' },
          },
          ultimate: {
            id: 'cl2Storm', name: 'Bio Storm', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
            windup: 24, rise: 11, height: 8, count: 10, damage: 1600, speed: 52, range: 24, recovery: 40,
            color: 0x8ae0c0, poses: { wind: 'cl_kameW', fire: 'cl_kame' },
          },
        },
      },
      {
        id: 'perfect',
        name: 'Perfect',
        kiCost: 45,
        storyBoss: true,
        practiced: CL_PRACTICED,
        style: 'full',
        line: 'cell_perfect',
        aura: { color: 0xa8ff6a, core: 0xffffff, particles: 0xd0ffa0, speed: 1.5 },
        // smaller than the bloated shape, and far above both of the others
        mult: { damage: 1.75, speed: 1.4, defense: 1.5, kiRegen: 1.4, chargeRate: 1.35, guardStamina: 1.1 },
        look: { scale: 1.04, bulk: 1.02, tint: 0xffffff, tintAmount: 0, headExtras: PERFECT_CROWN, longTail: false, swap: { [CELL_ABS]: CELL_ABS_PERFECT } },
        sequence: { length: 240, applyAt: 150, steps: [{ at: 0, pose: 'cl_brace', shake: 0.4 }, { at: 46, pose: 'cl_brace', shake: 0.7 }, { at: 92, pose: 'cl_roar', shake: 1 }, { at: 140, pose: 'cl_roar', shake: 1, burst: true }, { at: 190, pose: 'cl_calm', shake: 0.3 }, { at: 222, pose: 'cl_idle' }] },
        moves: {
          light: [
            { id: 'cl3Jab', startup: 3, active: 2, recovery: 9, cancel: 5, damage: 1300, reach: 1.45, radius: 0.85, lunge: 20, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'cl3Cross', startup: 3, active: 2, recovery: 10, cancel: 5, damage: 1380, reach: 1.45, radius: 0.85, lunge: 20, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'cl3Kick', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 1800, reach: 1.7, radius: 0.95, lunge: 20, hitstun: 22, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'cl3Tail', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 2200, reach: 2.5, radius: 1.15, lunge: 16, hitstun: 28, knock: 'heavy', knockSpeed: 28, impact: 3, pose: { wind: 'cl_tailW', strike: 'cl_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          ],
          heavy: {
            0: { id: 'cl3Smash', startup: 10, active: 4, recovery: 20, damage: 3400, reach: 1.75, radius: 1.05, lunge: 26, hitstun: 36, knock: 'smash', knockSpeed: 38, impact: 4, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            2: { id: 'cl3Rise', startup: 9, active: 4, recovery: 19, damage: 2400, reach: 1.6, radius: 1, lunge: 14, hitstun: 34, knock: 'launch', knockSpeed: 22, impact: 3, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
          dash: { id: 'cl3Blink', startup: 2, active: 6, recovery: 10, damage: 1900, reach: 1.6, radius: 0.95, lunge: 58, hitstun: 24, knock: 'push', knockSpeed: 20, impact: 2, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          // a Perfect Guard, then Heavy: the Perfect Counter (the extra below; Free Battle only, so the story's Cell fights
          // keep their old heavy)
          counter: { heavy: { special: 'perfectCounter' } },
        },
        specials: {
          special1: {
            id: 'cl3Kame', name: 'Perfect Kamehameha', type: 'beam', kiCost: 44, icon: 'beam',
            chargeMin: 22, chargeMax: 74, tiers: [22, 50], damage: [3400, 5200], radius: [1, 1.6], speed: 110, range: 165, sustain: 40,
            color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'cl_kameW', fire: 'cl_kame' }, recovery: 28,
            callout: ['KAME', 'HAME', 'HA!'],
          },
          special2: {
            id: 'cl3Volley', name: 'Perfect Barrage', type: 'scatter', kiCost: 42, icon: 'ball', cooldown: 280,
            windup: 18, rise: 9, height: 7, count: 12, damage: 1500, speed: 60, range: 26, recovery: 32,
            color: 0xd0ffa0, poses: { wind: 'cl_kameW', fire: 'cl_kame' },
          },
          ultimate: {
            id: 'cl3Solar', name: 'Solar Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
            chargeMin: 60, chargeMax: 60, damage: [7200, 7200], radius: [2, 2], speed: 115, range: 180, sustain: 50,
            color: 0xd0ffa0, core: 0xffffff, poses: { charge: 'cl_kameW', fire: 'cl_kame' }, recovery: 40, cinematic: true,
            // outside the story (the records PDF): centred on him, widening as it charges, then broad and side-on along
            // the beam (a clash takes over the camera as always; the PDF's low release shot would stand in the beam)
            cine: {
              steps: [
                { on: 'start', shot: 'front', dur: 0.5 },
                { on: 'start', at: 26, shot: 'pull', dur: 0.6 },
                { on: 'release', shot: 'wide', dur: 1.6, quake: 0.3 },
              ],
            },
          },
        },
      },
    ],
    poses: Object.assign({ idle: poses.cl_hunch }, poses),
    // PERFECT COUNTER (the records PDF's proposed original, labelled so: "a counter-based finisher that activates only
    // after a successful defensive read"): Perfect Cell only, answered from a Perfect Guard by Heavy (counterOnly — the
    // wheel shows it, locked, the rest of the time). The adaptation rush: the blows he took from the fighters he is
    // made of — a claw catch, a hook kick, Piccolo's two fingers point blank, Goku's Instant Transmission behind him
    // for a hammer, and a Kamehameha through him. The normal camera until it lands, a short cut on his face, tracked,
    // back at once. Free Battle after the Cell Games (cell_fatherson)
    extras: [
      {
        id: 'perfectCounter', name: 'Perfect Counter', type: 'rush', kiCost: 45, icon: 'rush',
        forms: ['perfect'], freeUnlock: 'cell_fatherson', freeOnly: true, counterOnly: 'Perfect Guard, then Heavy',
        startup: 3, dashFrames: 12, speed: 72, recovery: 30,
        poses: { wind: 'cl_calm', dash: 'cl_clawW' },
        hits: [
          { pose: 'cl_claw', damage: 420, frames: 8, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'kickR', damage: 460, frames: 9, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { pose: 'twoFingers', damage: 520, frames: 14, sfx: 'kiBlast', ki: { color: 0xd8ff6a, hand: 'R', pierce: 3 }, hitPose: 'hitHeavy' },
          { pose: 'hammer', damage: 600, frames: 12, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'cl_kame', damage: 1700, frames: 30, sfx: 'kiBlastBig', to: 'front', ki: { color: 0x8ad4ff, hand: 'both' }, beam: { length: 14, radius: 0.9, frames: 30, core: 0xffffff }, explode: 1.2, knock: 'heavy', knockSpeed: 42, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'start', shot: 'face', dur: 0.35, flash: 1.4, flashColor: 0xa8ff6a },
            { on: 'release', shot: 'track', dur: 0.3 },
            { on: 'connect', shot: 'wide', dur: 0.9 },
            { on: 'finish', shot: 'impact', dur: 0.6, quake: 0.3 },
          ],
        },
      },
    ],
    // the imperfect kit: long limbs, a tail, and a habit of leaving
    moves: {
      light: [
        { id: 'clJab', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 820, reach: 1.5, radius: 0.88, lunge: 14, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchLight', hitPose: 'hitBody' },
        { id: 'clRake', startup: 6, active: 3, recovery: 13, cancel: 8, damage: 900, reach: 1.55, radius: 0.92, lunge: 14, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'clTail', startup: 9, active: 4, recovery: 18, cancel: 11, damage: 1400, reach: 2.4, radius: 1.1, lunge: 12, hitstun: 28, knock: 'heavy', knockSpeed: 22, impact: 3, pose: { wind: 'cl_tailW', strike: 'cl_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'clSlam', startup: 13, active: 5, recovery: 25, damage: 2200, reach: 1.6, radius: 1.05, lunge: 16, hitstun: 34, knock: 'smash', knockSpeed: 28, impact: 3, pose: { wind: 'cl_tailW', strike: 'cl_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'clLunge', startup: 7, active: 8, recovery: 20, damage: 1500, reach: 1.6, radius: 1, lunge: 28, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'cl_clawW', strike: 'cl_claw' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'clDrain', name: 'Absorption', damage: 1600, knockSpeed: 18, poses: ['grab', 'cl_tailW', 'cl_tail'] },
    },
    specials: {
      special1: {
        id: 'clKame', name: 'Kamehameha', type: 'beam', kiCost: 38, icon: 'beam',
        chargeMin: 28, chargeMax: 70, tiers: [28, 52], damage: [2200, 3400], radius: [0.85, 1.3], speed: 96, range: 145, sustain: 34,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'cl_kameW', fire: 'cl_kame' }, recovery: 32,
        callout: ['KAME', 'HAME', 'HA!'],
      },
      special2: {
        id: 'clFlare', name: 'Solar Flare', type: 'solarFlare', kiCost: 20, icon: 'guard', cooldown: 420,
        startup: 14, recovery: 26, range: 14, stunFrames: 90,
        // the technique reads wind and flash (flare was never played: a missing-pose warning every use)
        poses: { wind: 'cl_kameW', flash: 'cl_kameW' },
      },
      ultimate: {
        id: 'clWave', name: 'Bio Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [4600, 4600], radius: [1.5, 1.5], speed: 100, range: 160, sustain: 42,
        color: 0xa8e08a, core: 0xffffff, poses: { charge: 'cl_kameW', fire: 'cl_kame' }, recovery: 38,
      },
    },
    boss: {
      phases: [
        // imperfect: he does not want a fight, he wants a meal and an exit
        { id: 'hunting', label: 'IMPERFECT', hpAbove: 0.5, speed: 1, damage: 1, patience: 0.8, patterns: { melee: 0.8, kame: 0.4, flare: 0.5 } },
        { id: 'cornered', label: 'CORNERED', hpAbove: 0, speed: 1.06, damage: 1.1, patience: 0.4, patterns: { melee: 0.9, kame: 0.6, flare: 0.8, wave: 0.3 } },
      ],
      patterns: {
        kame: { slot: 'special1', minDist: 7, cooldown: 260 },
        flare: { slot: 'special2', maxDist: 12, cooldown: 480 },
        wave: { slot: 'ultimate', minDist: 8, cooldown: 900 },
      },
      techniques: {
        toSemi: { type: 'bossTransform', frames: 200, form: 1 },
        toPerfect: { type: 'bossTransform', frames: 240, form: 2 },
      },
    },
    regen: { perSecond: 0.03, maxFrac: 1, idleFrames: 180 },
    mechanic: { type: 'bioRegen', name: 'Regeneration', desc: 'Leave him alone for a few seconds and he grows the damage back. Pressure is the only thing that sticks.' },
    ai: { personality: 'adaptive', aggression: 0.7, defense: 0.5, ranged: 0.45, beam: 0.4, transformHp: 0, preferredRange: 4, hooks: 'boss' },
    intro: { pose: 'cl_hunch', expression: 'smirk' },
    victory: { poses: ['cl_calm'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
