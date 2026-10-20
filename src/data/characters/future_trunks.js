/*
 * FUTURE TRUNKS (Android Saga) — the stranger who lands on Earth in Age 764, takes Frieza's army
 * and Frieza apart, and tells Goku what is coming. Rebuilt 2026-09-24 from the owner's reference
 * sheet (the Capsule Corp jacket and the sword are the silhouette; see STATUS.md).
 *
 * LOOK (Level 1 functional prototype, procedural parts): lavender bowl cut parted in the middle;
 * a cropped blue-violet Capsule Corp jacket with long sleeves, a standing collar and the company
 * mark on the left sleeve, over a black tank top; charcoal baggy trousers; a yellow belt with a
 * red-and-white buckle; tall yellow boots with brown soles; a teal strap from the right shoulder
 * to the left hip holding the scabbard on his back, hilt over the right shoulder. Super Saiyan:
 * gold hair standing up, teal eyes.
 *
 * IDENTITY: not Goku with a sword. A swordsman who fights close and fast and wastes nothing —
 *   sword     a four-cut light string (diagonal, return, rising cut, spinning cut), a vertical
 *             two-handed cut, a rising launcher, a lunge that runs through, an aerial somersault
 *             cut, and a dash-through; sword-guard stance, deflections (SL.data.characters
 *             .future_trunks.swordDeflect: a guard timed on a ki blast knocks it back)
 *   ki        Burning Attack (the hand signs, then the diamond), Finish Buster (overhead, thrown),
 *             Masenko (his teacher's); Heat Dome is kept for later chapters (an extra, locked by
 *             the story until then)
 *   mobility  fast dash, vanish, afterimages (moveScale in story stretches)
 *   the sword is drawn and sheathed: Model.setSheathed hides the blade in his hand and shows the
 *             hilt over his shoulder (Fighter.sheathed); stories hand it to other people
 *             (King Cold) with Model.addProp.
 *
 * FUTURE-PROOFING: forms are [base, ssj]; Grade 2 / Ultra Super Saiyan and the Cell-Saga armor
 * go in later as forms and wardrobe outfits (the wardrobe profile lists them as planned). His
 * wardrobe (src/data/wardrobe.js, profile future_trunks) is the single source of his clothes;
 * appearance.outfit below is the same arrival look for contexts without a wardrobe.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  // THE ARRIVAL LOOK (owner's reference sheet): the same data is the wardrobe's ft_capsule
  const JACKET = 0x4d46b4, TANK = 0x1d1d24;
  // his own tears (clothing damage levels, Model.setDamage): the trousers and a sleeve first, then the
  // tank top under the jacket, the other sleeve and the knee; torn, the jacket is gone (torn.jacket)
  const DAMAGE = {
    tearAt: 3,
    rips: [
      { at: 'thighL', t: 0.45, ang: 0.3, w: 0.8, h: 0.09, fill: 'skin', level: 1 },
      { at: 'elbowR', t: 0.4, ang: 0.6, w: 1.1, h: 0.07, fill: 'skin', cloth: JACKET, level: 1, until: 2 },
      { at: 'chest', y: 0.12, ang: 0.15, w: 0.45, h: 0.07, fill: 'skin', cloth: TANK, level: 2 },
      { at: 'shoulderL', t: 0.5, ang: -0.4, w: 1.2, h: 0.08, fill: 'skin', cloth: JACKET, level: 2, until: 2 },
      { at: 'kneeR', t: 0.3, ang: -0.3, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
      { at: 'spine', y: 0.1, ang: -0.5, w: 0.6, h: 0.08, fill: 'skin', cloth: TANK, level: 2 },
      { at: 'chest', y: 0.2, ang: -0.4, w: 0.7, h: 0.1, fill: 'skin', cloth: TANK, level: 3 },
      { at: 'thighR', t: 0.3, ang: -0.6, w: 1.1, h: 0.11, fill: 'skin', level: 3 },
    ],
  };
  const OUTFIT = {
    topStyle: 'jacket', top: TANK,
    jacket: { color: JACKET, collar: JACKET, short: true },
    sleeves: 'long', sleeveColor: JACKET, sleeveBulk: 1.18, wrist: 0x3c3790,
    pants: 0x2d2d36, pantsStyle: 'gi',
    belt: 0xe0b52c, beltStyle: 'belt', buckle: 0xf2f0ea, buckleCore: 0xd8342a,
    boots: 0xe8b624, bootStyle: 'gi', bootSole: 0x7a3e2a,
    strap: { color: 0x3cb4c6, buckle: 0xf2f0ea, core: 0xd8342a, tilt: 0.62, length: 0.27 },
    emblem: { front: null, back: null, sleeve: '@capsule', fg: '#262630', bg: '#f2f0ea' },
    damage: DAMAGE,
    torn: { jacket: 'off', sleeves: 'skin' },
  };

  // his sword hand: the blade leaves the fist forward and up when the forearm is level
  const poses = {
    // SWORD STANCE: blade low and forward in the right hand, left hand open and ready, weight low
    idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.06 + b * 0.01 },
        hips: [0, -18, 0], spine: [6, -4, 0], chest: [6, 16, 0], head: [-6, -12, 0],
        shoulderR: [-26, 0, -20], elbowR: [-58, 0, 0], handR: [10, 0, 0],
        shoulderL: [-46, 0, 26], elbowL: [-86, 0, 0],
        thighL: [-26, 12, 14], kneeL: [36 + b * 2, 0, 0], footL: [-8, 0, 0],
        thighR: [16, -10, -12], kneeR: [26 + b * 2, 0, 0], footR: [-10, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // calm and still: the sword on his back, hands loose (story, sheathed)
    ft_calm: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.02 + b * 0.004 },
        hips: [0, -4, 0], chest: [0, 6, 0], head: [-2, -4, 0],
        shoulderR: [-10, 0, -10], elbowR: [-22, 0, 0], shoulderL: [-8, 0, 10], elbowL: [-18, 0, 0],
        thighL: [-6, 4, 8], kneeL: [10, 0, 0], thighR: [4, -4, -8], kneeR: [8, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // the right hand a little up, near the hilt over his shoulder: ready, not drawn
    ft_handNear: (t) => {
      const b = Math.sin(t * 1.8);
      // the right hand closed on the strap across his chest: ready, not drawn
      return {
        root: { y: -0.03 },
        hips: [0, -8, 0], chest: [2, 10, 0], head: [-4, -8, 0],
        shoulderR: [-34, 0, 18], elbowR: [-112 + b * 2, 0, 0], handR: [0, 0, 10],
        shoulderL: [-10, 0, 12], elbowL: [-20, 0, 0],
        thighL: [-12, 6, 10], kneeL: [16, 0, 0], thighR: [8, -6, -10], kneeR: [12, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // a deliberate walk, arms low, eyes forward (t drives the step)
    ft_walk: (t) => {
      const ph = t * 5.2;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.015 + Math.abs(c) * 0.02 },
        spine: [2, s * 3, 0], chest: [2, s * 4, 0], head: [-2, -s * 3, 0],
        shoulderR: [-s * 14 - 6, 0, -10], elbowR: [-20, 0, 0], shoulderL: [s * 14 - 6, 0, 10], elbowL: [-18, 0, 0],
        thighL: [-s * 24 - 4, 0, 4], kneeL: [10 + Math.max(0, s) * 34, 0, 0], footL: [4, 0, 0],
        thighR: [s * 24 - 4, 0, -4], kneeR: [10 + Math.max(0, -s) * 34, 0, 0], footR: [4, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 12 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.03 + Math.abs(c) * 0.05, rx: 18 },
        spine: [8, s * 5, 0], chest: [6, s * 7, 0], head: [-22, -s * 5, 0],
        // the sword trails low behind him
        shoulderR: [30, 0, -22], elbowR: [-24, 0, 0], handR: [30, 0, 0],
        shoulderL: [s * 55 - 10, 0, 16], elbowL: [-70, 0, 0],
        thighL: [-s * 52 - 10, 0, 4], kneeL: [38 + Math.max(0, s) * 66, 0, 0], footL: [10, 0, 0],
        thighR: [s * 52 - 10, 0, -4], kneeR: [38 + Math.max(0, -s) * 66, 0, 0], footR: [10, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    flyIdle: (t) => ({
      root: { y: Math.sin(t * 2.2) * 0.025 }, chest: [4, 10, 0], head: [-4, -8, 0],
      shoulderR: [-24, 0, -24], elbowR: [-56, 0, 0], shoulderL: [-34, 0, 22], elbowL: [-84, 0, 0],
      thighL: [-44, 0, 8], kneeL: [84, 0, 0], footL: [26, 0, 0], thighR: [-26, 0, -8], kneeR: [74, 0, 0], footR: [26, 0, 0],
      hands: ['open', 'fist'],
    }),
    // flying and dashing: the blade swept back along the body, low and flat
    flyForward: (t) => {
      const s = Math.sin(t * 9);
      return {
        root: { rx: 70 },
        spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-26, 0, 0], head: [-38, 0, 0],
        shoulderL: [22, 0, 14], elbowL: [-18, 0, 0], shoulderR: [30, 0, -18], elbowR: [-10, 0, 0], handR: [40, 0, 0],
        thighL: [6 + s * 3, 0, 4], kneeL: [18, 0, 0], footL: [55, 0, 0], thighR: [2 - s * 3, 0, -4], kneeR: [28, 0, 0], footR: [55, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    dash: {
      root: { rx: 72 },
      spine: [-6, 0, 0], chest: [-6, 14, 0], neck: [-28, 0, 0], head: [-38, -10, 0],
      shoulderL: [30, 0, 10], elbowL: [-10, 0, 0], shoulderR: [44, 0, -24], elbowR: [-6, 0, 0], handR: [40, 0, 0],
      thighL: [8, 0, 3], kneeL: [10, 0, 0], footL: [60, 0, 0], thighR: [4, 0, -3], kneeR: [16, 0, 0], footR: [60, 0, 0],
      hands: ['open', 'fist'],
    },
    // SWORD GUARD: blade upright in front of him, left palm braced behind the flat
    guard: {
      root: { y: -0.08 },
      hips: [0, -10, 0], spine: [6, 0, 0], chest: [8, 8, 0], head: [-2, -6, 0],
      shoulderR: [-58, 0, 16], elbowR: [-72, 0, 0], handR: [0, 0, -8],
      shoulderL: [-60, 0, -26], elbowL: [-84, 0, 0],
      thighL: [-30, 10, 14], kneeL: [44, 0, 0], footL: [-8, 0, 0], thighR: [18, -10, -14], kneeR: [30, 0, 0], footR: [-10, 0, 0],
      hands: ['open', 'fist'],
    },

    // DRAW: the hand goes over the shoulder to the hilt, then the blade comes round and down
    ft_draw: {
      root: { y: -0.03 }, hips: [0, -8, 0], chest: [-2, 14, 0], head: [-4, -12, 0],
      shoulderR: [-168, 0, -34], elbowR: [-118, 0, 0], handR: [0, 0, -30],
      shoulderL: [-24, 0, 18], elbowL: [-40, 0, 0],
      thighL: [-16, 8, 12], kneeL: [22, 0, 0], thighR: [10, -8, -12], kneeR: [16, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_drawOut: {
      root: { y: -0.08 }, hips: [0, -16, 0], spine: [6, 0, 0], chest: [6, -24, 0], head: [-6, 16, 0],
      shoulderR: [-70, 0, -70], elbowR: [-8, 0, 0], handR: [16, 0, 0],
      shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0],
      thighL: [-26, 10, 14], kneeL: [36, 0, 0], thighR: [16, -10, -14], kneeR: [26, 0, 0],
      hands: ['open', 'fist'],
    },
    // SHEATHE: blade up and back over the shoulder, then the hand drops (the clink is the sound)
    ft_sheathe: {
      root: { y: -0.02 }, chest: [-4, 16, 0], head: [-2, -12, 0],
      shoulderR: [-176, 0, -26], elbowR: [-96, 0, 0], handR: [-40, 0, 0],
      shoulderL: [-10, 0, 14], elbowL: [-24, 0, 0],
      thighL: [-6, 4, 8], kneeL: [10, 0, 0], thighR: [4, -4, -8], kneeR: [8, 0, 0],
      hands: ['open', 'fist'],
    },
    // FINISHING STANCE: after the cut, blade out low behind him, knees bent, his back to what he cut
    ft_finish: {
      root: { y: -0.2, rx: 8 }, hips: [0, 24, 0], spine: [10, 10, 0], chest: [8, 26, 0], head: [-2, -30, 0],
      shoulderR: [-10, 0, -78], elbowR: [-4, 0, 0], handR: [20, 0, 0],
      shoulderL: [-40, 0, 20], elbowL: [-80, 0, 0],
      thighL: [-60, 10, 16], kneeL: [80, 0, 0], footL: [-10, 0, 0], thighR: [12, -10, -20], kneeR: [50, 0, 0], footR: [-20, 0, 0],
      hands: ['open', 'fist'],
    },

    // LIGHT STRING: a diagonal cut, a return cut, a rising cut, then a spin that carries him through
    ft_cutW: {
      root: { y: -0.05 }, hips: [0, 14, 0], chest: [0, 42, 0], head: [0, -28, 0],
      shoulderR: [-150, 0, -40], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 26], elbowL: [-70, 0, 0],
      thighL: [-22, 0, 12], kneeL: [32, 0, 0], thighR: [14, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_cut: {
      root: { y: -0.1, rx: 8 }, hips: [0, -16, 0], chest: [8, -40, 0], head: [-4, 28, 0],
      shoulderR: [-40, 0, 30], elbowR: [-8, 0, 0], handR: [14, 0, 0], shoulderL: [-26, 0, 36], elbowL: [-60, 0, 0],
      thighL: [-40, 0, 12], kneeL: [46, 0, 0], thighR: [20, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_returnW: {
      root: { y: -0.06 }, chest: [0, -38, 0], head: [0, 26, 0],
      shoulderR: [-78, 0, 50], elbowR: [-60, 0, 0], shoulderL: [-26, 0, 26], elbowL: [-74, 0, 0],
      thighL: [-18, 0, 12], kneeL: [28, 0, 0], thighR: [12, 0, -12], kneeR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_return: {
      root: { y: -0.1, rx: 6 }, chest: [4, 44, 0], head: [-2, -30, 0],
      shoulderR: [-80, 0, -70], elbowR: [-6, 0, 0], handR: [0, 0, -20], shoulderL: [-32, 0, 30], elbowL: [-56, 0, 0],
      thighL: [-28, 0, 12], kneeL: [38, 0, 0], thighR: [22, 0, -12], kneeR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_upcutW: {
      root: { y: -0.14, rx: 10 }, chest: [10, 20, 0], head: [-10, -14, 0],
      shoulderR: [10, 0, -30], elbowR: [-30, 0, 0], handR: [30, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-70, 0, 0],
      thighL: [-44, 0, 12], kneeL: [70, 0, 0], thighR: [-10, 0, -12], kneeR: [50, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_upcut: {
      root: { y: 0.02, rx: -10 }, chest: [-12, -24, 0], head: [-16, 16, 0],
      shoulderR: [-170, 0, 10], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 34], elbowL: [-40, 0, 0],
      thighL: [-20, 0, 10], kneeL: [26, 0, 0], thighR: [14, 0, -10], kneeR: [16, 0, 0], footR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_spinW: {
      root: { y: -0.08, rz: 6 }, chest: [-4, -54, 0], head: [0, 32, 0],
      shoulderR: [-70, 0, 64], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-50, 0, 0],
      thighL: [-16, 0, 14], kneeL: [26, 0, 0], thighR: [10, 0, -14], kneeR: [22, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_spin: (t) => {
      const s = Math.sin(t * 26);
      return {
        root: { y: -0.06, rz: -8 }, chest: [-2, 64 + s * 8, 0], head: [-4, -42, 0],
        shoulderR: [-88, 0, -84], elbowR: [-4, 0, 0], shoulderL: [-14, 0, 64], elbowL: [-30, 0, 0],
        thighL: [-24, 0, 16], kneeL: [30, 0, 0], thighR: [16, 0, -16], kneeR: [26, 0, 0],
        hands: ['open', 'fist'],
      };
    },

    // HEAVIES: the two-handed vertical cut, the rising launcher, the lunge that runs through
    ft_dropW: {
      root: { y: -0.02 }, spine: [-12, 0, 0], chest: [-18, 0, 0], head: [-16, 0, 0],
      shoulderR: [-178, 0, -8], elbowR: [-40, 0, 0], handR: [-30, 0, 0], shoulderL: [-172, 0, 12], elbowL: [-46, 0, 0],
      thighL: [-18, 0, 12], kneeL: [28, 0, 0], thighR: [10, 0, -12], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    },
    ft_drop: {
      root: { y: -0.16, rx: 26 }, spine: [16, 0, 0], chest: [22, 0, 0], head: [-8, 0, 0],
      shoulderR: [-60, 0, -6], elbowR: [-6, 0, 0], handR: [20, 0, 0], shoulderL: [-62, 0, 8], elbowL: [-12, 0, 0],
      thighL: [-54, 0, 14], kneeL: [66, 0, 0], thighR: [24, 0, -14], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    ft_riseW: {
      root: { y: -0.16, rx: 12 }, spine: [10, 0, 0], chest: [12, -20, 0], head: [-14, 14, 0],
      shoulderR: [16, 0, -30], elbowR: [-40, 0, 0], handR: [30, 0, 0], shoulderL: [-24, 0, 24], elbowL: [-90, 0, 0],
      thighL: [-54, 0, 12], kneeL: [92, 0, 0], thighR: [-22, 0, -12], kneeR: [78, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_rise: {
      root: { y: 0.18, rx: -26 }, spine: [-12, 0, 0], chest: [-18, 20, 0], neck: [-18, 0, 0], head: [-26, -14, 0],
      shoulderR: [-176, 0, -12], elbowR: [-8, 0, 0], shoulderL: [-40, 0, 26], elbowL: [-40, 0, 0],
      thighL: [-26, 0, 8], kneeL: [36, 0, 0], thighR: [18, 0, -8], kneeR: [18, 0, 0], footR: [36, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_lungeW: {
      root: { y: -0.1 }, chest: [0, 30, 0], head: [-4, -18, 0],
      shoulderR: [-10, 0, -22], elbowR: [-120, 0, 0], handR: [-10, 0, 0], shoulderL: [-54, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-34, 0, 10], kneeL: [50, 0, 0], thighR: [20, 0, -10], kneeR: [30, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_lunge: {
      root: { y: -0.16, rx: 16 }, chest: [14, -14, 0], head: [-14, 8, 0],
      shoulderR: [-78, 0, -4], elbowR: [-4, 0, 0], handR: [-26, 0, 0], shoulderL: [-10, 0, 50], elbowL: [-40, 0, 0],
      thighL: [-66, 0, 10], kneeL: [66, 0, 0], thighR: [34, 0, -10], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
    // AERIAL: a somersault that brings the blade down over the top
    ft_airW: {
      root: { rx: -40 }, spine: [-14, 0, 0], chest: [-16, 0, 0], head: [-10, 0, 0],
      shoulderR: [-178, 0, -14], elbowR: [-30, 0, 0], shoulderL: [-150, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-70, 0, 10], kneeL: [110, 0, 0], thighR: [-60, 0, -10], kneeR: [100, 0, 0],
      hands: ['fist', 'fist'],
    },
    ft_air: {
      root: { rx: 60 }, spine: [18, 0, 0], chest: [22, 0, 0], head: [-20, 0, 0],
      shoulderR: [-40, 0, -8], elbowR: [-6, 0, 0], handR: [24, 0, 0], shoulderL: [-50, 0, 14], elbowL: [-16, 0, 0],
      thighL: [-80, 0, 10], kneeL: [100, 0, 0], thighR: [-40, 0, -10], kneeR: [60, 0, 0],
      hands: ['fist', 'fist'],
    },

    // BURNING ATTACK: the hand signs (fast, crossing, the fingers spread), the diamond, the thrust
    ft_burnW: (t) => {
      const k = t * 16;
      const a = Math.sin(k), b = Math.sin(k * 1.37 + 1), c = Math.cos(k * 0.9);
      return {
        root: { y: -0.08 }, hips: [0, -6, 0], chest: [-4 + a * 2, a * 10, 0], head: [-6, -a * 6, 0],
        shoulderL: [-90 + b * 40, a * 30, 30 + c * 30], elbowL: [-100 + a * 40, 0, 0], handL: [a * 30, 0, b * 30],
        shoulderR: [-90 - b * 40, -a * 30, -30 - c * 30], elbowR: [-100 - a * 40, 0, 0], handR: [-a * 30, 0, -b * 30],
        thighL: [-30, 10, 16], kneeL: [44, 0, 0], thighR: [16, -10, -16], kneeR: [30, 0, 0],
        hands: [a > 0 ? 'open' : 'point', b > 0 ? 'open' : 'point'],
      };
    },
    ft_burnDiamond: {
      root: { y: -0.1 }, spine: [4, 0, 0], chest: [6, 0, 0], head: [-6, 0, 0],
      shoulderL: [-84, 0, -20], elbowL: [-34, 0, 0], handL: [-50, 0, 0],
      shoulderR: [-84, 0, 20], elbowR: [-34, 0, 0], handR: [-50, 0, 0],
      thighL: [-36, 0, 14], kneeL: [50, 0, 0], thighR: [22, 0, -14], kneeR: [28, 0, 0],
      hands: ['open', 'open'],
    },
    ft_burn: {
      root: { y: -0.1, rx: 10 }, spine: [8, 0, 0], chest: [12, 0, 0], head: [-12, 0, 0],
      shoulderL: [-100, 0, -6], elbowL: [-6, 0, 0], handL: [-60, 0, 0],
      shoulderR: [-100, 0, 6], elbowR: [-6, 0, 0], handR: [-60, 0, 0],
      thighL: [-40, 0, 14], kneeL: [52, 0, 0], thighR: [24, 0, -14], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    // FINISH BUSTER: both hands high, the ball gathered overhead, then thrown down the line
    ft_busterCharge: (t) => {
      const s = Math.sin(t * 22) * 2;
      return {
        root: { y: -0.05 }, spine: [-8, 0, 0], chest: [-14 + s * 0.3, 0, 0], head: [-22, 0, 0],
        shoulderL: [-172, 0, 18], elbowL: [-24, 0, 0], shoulderR: [-172, 0, -18], elbowR: [-24, 0, 0],
        thighL: [-24, 0, 16], kneeL: [34, 0, 0], thighR: [14, 0, -16], kneeR: [26, 0, 0],
        hands: ['open', 'open'],
      };
    },
    ft_busterFire: {
      root: { y: -0.12, rx: 16 }, spine: [10, 0, 0], chest: [16, 0, 0], head: [-8, 0, 0],
      shoulderL: [-110, 0, 10], elbowL: [-10, 0, 0], handL: [-50, 0, 0], shoulderR: [-110, 0, -10], elbowR: [-10, 0, 0], handR: [-50, 0, 0],
      thighL: [-46, 0, 16], kneeL: [58, 0, 0], thighR: [26, 0, -16], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    // MASENKO: his teacher's — both palms stacked over the forehead, then pushed out
    ft_masenkoCharge: (t) => {
      const s = Math.sin(t * 24) * 1.5;
      return {
        root: { y: -0.06 }, chest: [-6, 0, 0], head: [-4, 0, 0],
        shoulderL: [-160, 0, -20 + s], elbowL: [-70, 0, 0], handL: [-30, 0, 0], shoulderR: [-160, 0, 20 - s], elbowR: [-70, 0, 0], handR: [-30, 0, 0],
        thighL: [-26, 0, 14], kneeL: [38, 0, 0], thighR: [16, 0, -14], kneeR: [26, 0, 0],
        hands: ['open', 'open'],
      };
    },
    ft_masenkoFire: (t) => Object.assign(C.beamFire(t), { hands: ['open', 'open'] }),
    // HEAT DOME (kept for later chapters): hands overhead, then it comes down
    ft_domeCharge: (t) => {
      const s = Math.sin(t * 20) * 2;
      return {
        root: { y: -0.04 }, spine: [-8, 0, 0], chest: [-14 + s * 0.3, 0, 0], head: [-22, 0, 0],
        shoulderL: [-178, 0, 22], elbowL: [-14, 0, 0], shoulderR: [-178, 0, -22], elbowR: [-14, 0, 0],
        thighL: [-22, 0, 14], kneeL: [32, 0, 0], thighR: [12, 0, -14], kneeR: [24, 0, 0],
        hands: ['open', 'open'],
      };
    },
    ft_domeFire: {
      root: { y: -0.12, rx: 16 }, spine: [10, 0, 0], chest: [16, 0, 0], head: [-6, 0, 0],
      shoulderL: [-120, 0, 16], elbowL: [-12, 0, 0], shoulderR: [-120, 0, -16], elbowR: [-12, 0, 0],
      thighL: [-46, 0, 16], kneeL: [58, 0, 0], thighR: [26, 0, -16], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    // one palm out, point blank
    ft_palm: {
      root: { y: -0.06, rx: 6 }, hips: [0, 12, 0], chest: [6, 18, 0], head: [-8, -14, 0],
      shoulderL: [-94, 0, 8], elbowL: [-4, 0, 0], handL: [-70, 0, 0], shoulderR: [-20, 0, -18], elbowR: [-40, 0, 0],
      thighL: [-34, 0, 14], kneeL: [42, 0, 0], thighR: [20, 0, -14], kneeR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    // THE AERIAL FINISH (Mecha Frieza): still in the air, the sword held back and low in the right
    // hand, the empty left hand out at what is left of him — then the blast from that palm
    ft_airPalm: (t) => {
      const s = Math.sin(t * 34) * 0.8;
      return {
        root: { y: Math.sin(t * 2.2) * 0.01, rx: 4 }, hips: [0, 10, 0], spine: [4, 6, 0], chest: [4, 14, 0], neck: [0, -6, 0], head: [-4, -12, 0],
        shoulderL: [-90, 0, 2 + s], elbowL: [-4, 0, 0], handL: [-72, 0, 0],
        shoulderR: [34, 0, -34], elbowR: [-22, 0, 0], handR: [26, 0, 0],
        thighL: [-40, 0, 10], kneeL: [76, 0, 0], footL: [24, 0, 0], thighR: [-18, 0, -8], kneeR: [60, 0, 0], footR: [26, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // after it: hanging in the air, the sword low at his side, the smoke going past
    ft_airHero: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: b * 0.012 }, chest: [-2, 6, 0], head: [-2, -4, 0],
        shoulderL: [-8, 0, 16], elbowL: [-18, 0, 0], shoulderR: [-4, 0, -22], elbowR: [-12, 0, 0], handR: [40, 0, 0],
        thighL: [-30, 0, 8], kneeL: [58, 0, 0], footL: [26, 0, 0], thighR: [-14, 0, -8], kneeR: [44, 0, 0], footR: [26, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // palm raised to the sky (the final blast at what hangs in the air)
    ft_palmUp: {
      root: { y: -0.04, rx: -8 }, chest: [-12, 10, 0], head: [-30, -6, 0],
      shoulderL: [-150, 0, 10], elbowL: [-6, 0, 0], handL: [-60, 0, 0], shoulderR: [-20, 0, -20], elbowR: [-40, 0, 0],
      thighL: [-20, 0, 14], kneeL: [30, 0, 0], thighR: [14, 0, -14], kneeR: [22, 0, 0],
      hands: ['open', 'fist'],
    },

    // SUPER SAIYAN (his own, rebuilt 2026-09-25 on the owner's note): no ritual, no hand signs (the
    // rapid hand movement is the Burning Attack's, and only the Burning Attack's), no scream at the
    // sky (Goku's) and no arms flung back with the head thrown up (Vegeta's). He stands still; the
    // fists close at his sides and the weight sinks into the ground; one breath; then it happens all
    // at once — head level, eyes on the man in front of him — and he is still again.
    ft_tfStill: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.02 + b * 0.003 }, spine: [2, 0, 0], chest: [0 + b * 0.4, 0, 0], neck: [2, 0, 0], head: [6, 0, 0],
        shoulderL: [-4, 0, 9], elbowL: [-12, 0, 0], shoulderR: [-4, 0, -9], elbowR: [-12, 0, 0],
        thighL: [-4, 0, 10], kneeL: [6, 0, 0], footL: [0, 0, -6], thighR: [-4, 0, -10], kneeR: [6, 0, 0], footR: [0, 0, 6],
        hands: ['open', 'open'],
      };
    },
    // the fists close at his sides and the weight goes down into the ground (a tremor, not a motion)
    ft_tfClench: (t) => {
      const s = Math.sin(t * 30) * 0.8;
      return {
        root: { y: -0.07 }, spine: [6, 0, 0], chest: [6 + s * 0.3, 0, 0], neck: [4, 0, 0], head: [10, 0, 0],
        shoulderL: [6, 0, 16 + s], elbowL: [-8, 0, 0], handL: [-10, 0, 0], shoulderR: [6, 0, -16 - s], elbowR: [-8, 0, 0], handR: [-10, 0, 0],
        thighL: [-16, 0, 16], kneeL: [26, 0, 0], footL: [-8, 0, -10], thighR: [-16, 0, -16], kneeR: [26, 0, 0], footR: [-8, 0, 10],
        hands: ['fist', 'fist'],
      };
    },
    // lower, harder: the ground gives under his feet, the eyes go into shadow
    ft_tfPress: (t) => {
      const s = Math.sin(t * 42) * 1.4;
      return {
        root: { y: -0.14, rx: 6 }, spine: [10, 0, 0], chest: [10 + s * 0.4, 0, 0], neck: [6, 0, 0], head: [14, 0, 0],
        shoulderL: [14, 0, 22 + s], elbowL: [-6, 0, 0], handL: [-14, 0, 0], shoulderR: [14, 0, -22 - s], elbowR: [-6, 0, 0], handR: [-14, 0, 0],
        thighL: [-26, 0, 22], kneeL: [42, 0, 0], footL: [-12, 0, -14], thighR: [-26, 0, -22], kneeR: [42, 0, 0], footR: [-12, 0, 14],
        hands: ['fist', 'fist'],
      };
    },
    // one breath in: the chest comes up, the head comes level
    ft_tfBrace: {
      root: { y: -0.1, rx: -2 }, spine: [-2, 0, 0], chest: [-8, 0, 0], neck: [0, 0, 0], head: [2, 0, 0],
      shoulderL: [16, 0, 26], elbowL: [-4, 0, 0], handL: [-12, 0, 0], shoulderR: [16, 0, -26], elbowR: [-4, 0, 0], handR: [-12, 0, 0],
      thighL: [-22, 0, 22], kneeL: [34, 0, 0], footL: [-10, 0, -14], thighR: [-22, 0, -22], kneeR: [34, 0, 0], footR: [-10, 0, 14],
      hands: ['fist', 'fist'],
    },
    // and all at once: fists driven down and out, chest forward, head level, eyes on the target
    ft_tfBurst: (t) => {
      const s = Math.sin(t * 50) * 1.6;
      return {
        root: { y: -0.06 + s * 0.003 }, spine: [-4, 0, 0], chest: [-10 + s * 0.4, 0, 0], neck: [-2, 0, 0], head: [-2, 0, 0],
        shoulderL: [10, 0, 36 + s], elbowL: [-6, 0, 0], handL: [-18, 0, 0], shoulderR: [10, 0, -36 - s], elbowR: [-6, 0, 0], handR: [-18, 0, 0],
        thighL: [-18, 0, 24], kneeL: [24, 0, 0], footL: [-6, 0, -14], thighR: [-18, 0, -24], kneeR: [24, 0, 0], footR: [-6, 0, 14],
        hands: ['fist', 'fist'],
      };
    },
    // still again: upright, the arms down, the aura doing the talking
    ft_tfFinal: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.03 + b * 0.004 }, spine: [2, 0, 0], chest: [-2, 0, 0], head: [-2, 0, 0],
        shoulderL: [-6, 0, 14], elbowL: [-12, 0, 0], shoulderR: [-6, 0, -14], elbowR: [-12, 0, 0],
        thighL: [-6, 0, 14], kneeL: [10, 0, 0], thighR: [4, 0, -14], kneeR: [8, 0, 0],
        hands: ['fist', 'fist'],
      };
    },

    // STORY
    ft_ready: {
      root: { y: -0.05 }, hips: [0, -14, 0], chest: [2, 16, 0], head: [-6, -12, 0],
      shoulderR: [-60, 0, -26], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-80, 0, 0],
      thighL: [-24, 10, 12], kneeL: [34, 0, 0], thighR: [14, -10, -12], kneeR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_point: {
      root: { y: -0.03 }, chest: [0, -16, 0], head: [-4, 14, 0],
      shoulderR: [-18, 0, -18], elbowR: [-30, 0, 0], shoulderL: [-96, 0, 8], elbowL: [-6, 0, 0],
      thighL: [-14, 0, 12], kneeL: [22, 0, 0], thighR: [8, 0, -12], kneeR: [18, 0, 0],
      hands: ['point', 'fist'],
    },
    ft_armsCrossed: (t) => ({ ...C.armsCrossed, root: { y: -0.01 + Math.sin(t * 1.6) * 0.004 }, head: [2, -8, 0] }),
    // Supernova held overhead in both open hands, not straining
    ft_catchBall: (t) => {
      const s = Math.sin(t * 30) * 0.8;
      return {
        root: { y: -0.1 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-26, 0, 0],
        shoulderL: [-168, 0, 26 + s], elbowL: [-30, 0, 0], handL: [-40, 0, 0], shoulderR: [-168, 0, -26 - s], elbowR: [-30, 0, 0], handR: [-40, 0, 0],
        thighL: [-24, 0, 20], kneeL: [40, 0, 0], thighR: [-10, 0, -20], kneeR: [34, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the blade caught in one bare hand, the other arm down
    ft_catchBlade: {
      root: { y: -0.03 }, chest: [-2, 10, 0], head: [-14, -6, 0],
      shoulderL: [-150, 0, -6], elbowL: [-30, 0, 0], handL: [-20, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-20, 0, 0],
      thighL: [-10, 0, 10], kneeL: [14, 0, 0], thighR: [6, 0, -10], kneeR: [10, 0, 0],
      hands: ['open', 'fist'],
    },
    // holding the sword out, flat, handle first
    ft_offer: {
      root: { y: -0.02 }, chest: [2, 8, 0], head: [-6, -4, 0],
      shoulderR: [-82, 20, -10], elbowR: [-40, 0, 0], handR: [0, -70, 0], shoulderL: [-10, 0, 12], elbowL: [-20, 0, 0],
      thighL: [-8, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_capsule: {
      root: { y: -0.02 }, chest: [4, -10, 0], head: [8, 8, 0],
      shoulderL: [-50, 0, 0], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -12], elbowR: [-20, 0, 0],
      thighL: [-6, 0, 10], kneeL: [8, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['point', 'fist'],
    },
    ft_throwCapsule: {
      root: { y: -0.04 }, chest: [6, -18, 0], head: [6, 12, 0],
      shoulderL: [-100, 0, 30], elbowL: [-10, 0, 0], handL: [-30, 0, 0], shoulderR: [-10, 0, -12], elbowR: [-20, 0, 0],
      thighL: [-20, 0, 10], kneeL: [24, 0, 0], thighR: [10, 0, -10], kneeR: [12, 0, 0],
      hands: ['open', 'fist'],
    },
    ft_lookBack: {
      root: { y: -0.02 }, hips: [0, 10, 0], spine: [0, 20, 0], chest: [0, 30, 0], head: [-2, 40, 0],
      shoulderL: [-8, 0, 10], elbowL: [-16, 0, 0], shoulderR: [-8, 0, -10], elbowR: [-16, 0, 0],
      thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['open', 'open'],
    },
    // in the Time Machine's pilot seat: knees up, hands on the controls, one look back over the rim
    ft_pilot: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], shoulderL: [-40, 0, 12], elbowL: [-60, 0, 0], shoulderR: [-40, 0, -12], elbowR: [-60, 0, 0], head: [4, 0, 0], hands: ['fist', 'fist'] },
    ft_pilotLook: { root: { y: -0.45 }, thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], chest: [0, 24, 0], head: [-2, 36, 0], shoulderL: [-40, 0, 12], elbowL: [-60, 0, 0], shoulderR: [-8, 0, -14], elbowR: [-20, 0, 0], hands: ['fist', 'open'] },
    ft_giveMed: {
      root: { y: -0.02 }, chest: [6, 4, 0], head: [8, 0, 0],
      shoulderL: [-70, 0, -6], elbowL: [-30, 0, 0], handL: [0, 0, -10], shoulderR: [-10, 0, -12], elbowR: [-20, 0, 0],
      thighL: [-8, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['fist', 'fist'],
    },
    ft_bow: {
      root: { y: -0.02 }, spine: [10, 0, 0], chest: [12, 0, 0], head: [22, 0, 0],
      shoulderL: [-4, 0, 8], elbowL: [-10, 0, 0], shoulderR: [-4, 0, -8], elbowR: [-10, 0, 0],
      thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['open', 'open'],
    },
    // drawing on the ground with the sword tip
    ft_scratch: (t) => {
      const s = Math.sin(t * 3.2);
      return {
        root: { y: -0.3, rx: 16 }, spine: [18, 0, 0], chest: [16, s * 10, 0], head: [30, -s * 6, 0],
        shoulderR: [-20 + s * 14, 0, -10 - s * 10], elbowR: [-30, 0, 0], handR: [60, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0],
        thighL: [-70, 0, 14], kneeL: [100, 0, 0], thighR: [-20, 0, -14], kneeR: [80, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // in the memory: on his knees in the rain, and then the scream that turned him gold
    // THE MAFUBA (2026-10-19: "The Divine Scythe" and the Free Battle technique)
    // CS-MAF-01's stance: feet planted wide, both arms straight out in front, palms open and forward; trembling with it
    ft_mafuba: ((t) => {
      const s = Math.sin(t * 38) * 1.4;
      return {
        hands: ['open', 'open'],
        root: { y: -0.14, rx: 6 }, spine: [6, 0, 0], chest: [6 + s * 0.4, 0, 0], head: [-6, 0, 0],
        shoulderL: [-86 + s, 0, 12], elbowL: [-8, 0, 0], handL: [-62, 0, 0],
        shoulderR: [-86 - s, 0, -12], elbowR: [-8, 0, 0], handR: [-62, 0, 0],
        thighL: [-30, 0, 24], kneeL: [44, 0, 0], footL: [-10, 0, -14], thighR: [-30, 0, -24], kneeR: [44, 0, 0], footR: [-10, 0, 14],
      };
    }),
    // the funnel guided down into the jar's neck: the same stance, the arms brought down at it
    ft_mafubaDown: ((t) => {
      const s = Math.sin(t * 40) * 1.2;
      return {
        hands: ['open', 'open'],
        root: { y: -0.2, rx: 14 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [8, 0, 0],
        shoulderL: [-46 + s, 0, 10], elbowL: [-6, 0, 0], handL: [-50, 0, 0],
        shoulderR: [-46 - s, 0, -10], elbowR: [-6, 0, 0], handR: [-50, 0, 0],
        thighL: [-34, 0, 24], kneeL: [52, 0, 0], footL: [-12, 0, -14], thighR: [-34, 0, -24], kneeR: [52, 0, 0], footR: [-12, 0, 14],
      };
    }),
    // down on one knee at the jar: the left hand on the lid
    ft_lid: {
      hands: ['open', 'fist'],
      root: { y: -0.46, rx: 10 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [16, 0, 0],
      shoulderL: [-58, 0, 6], elbowL: [-10, 0, 0], handL: [-40, 0, 0], shoulderR: [-10, 0, -16], elbowR: [-30, 0, 0],
      thighL: [-80, 0, 8], kneeL: [86, 0, 0], thighR: [10, 0, -8], kneeR: [100, 0, 0],
    },
    // the right hand at the jacket's inside pocket, the head bowed to it: looking for the talisman
    ft_search: {
      hands: ['open', 'open'],
      root: { y: -0.46, rx: 6 }, spine: [10, 0, 0], chest: [8, -10, 0], head: [24, 8, 0],
      shoulderL: [-50, 0, 6], elbowL: [-14, 0, 0], handL: [-40, 0, 0],
      shoulderR: [-30, 0, 34], elbowR: [-118, 0, 0], handR: [0, 0, 20],
      thighL: [-80, 0, 8], kneeL: [86, 0, 0], thighR: [10, 0, -8], kneeR: [100, 0, 0],
    },
    ft_kneel: (t) => {
      const b = Math.sin(t * 5) * 1.2;
      return {
        root: { y: -0.46, rx: 10 }, spine: [16, 0, 0], chest: [14 + b, 0, 0], head: [30, 0, 0],
        shoulderL: [-20, 0, 12], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -12], elbowR: [-30, 0, 0],
        thighL: [-86, 0, 12], kneeL: [100, 0, 0], thighR: [-86, 0, -12], kneeR: [100, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    ft_scream: (t) => {
      const s = Math.sin(t * 40) * 2;
      return {
        root: { y: -0.44, rx: -16 }, spine: [-14, 0, 0], chest: [-22 + s, 0, 0], neck: [-14, 0, 0], head: [-36, 0, 0],
        shoulderL: [20, 0, 50], elbowL: [-40, 0, 0], shoulderR: [20, 0, -50], elbowR: [-40, 0, 0],
        thighL: [-86, 0, 12], kneeL: [100, 0, 0], thighR: [-86, 0, -12], kneeR: [100, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // down on one knee after coming down out of the sky, blade out
    ft_landing: {
      root: { y: -0.38, rx: 12 }, spine: [14, 0, 0], chest: [10, 16, 0], head: [-10, -10, 0],
      shoulderR: [-30, 0, -60], elbowR: [-8, 0, 0], handR: [20, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-70, 10, 14], kneeL: [100, 0, 0], thighR: [10, -10, -20], kneeR: [100, 0, 0], footR: [-30, 0, 0],
      hands: ['open', 'fist'],
    },
    // the flurry: dozens of cuts in a moment (t drives it)
    ft_dice: (t) => {
      const k = t * 38;
      const a = Math.sin(k), b = Math.cos(k * 1.3);
      return {
        root: { y: 0 }, chest: [a * 10, b * 30, 0], head: [-10, -b * 10, 0],
        shoulderR: [-120 + a * 60, 0, -30 + b * 60], elbowR: [-30 + b * 20, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-70, 0, 0],
        thighL: [-50, 0, 10], kneeL: [80, 0, 0], thighR: [-20, 0, -10], kneeR: [60, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // a lean aside: the Death Beam goes past his ear
    ft_slip: {
      root: { y: -0.04, rz: 14 }, hips: [0, -10, 0], chest: [0, 10, -10], head: [-4, -10, 12],
      shoulderR: [-26, 0, -30], elbowR: [-50, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-16, 0, 20], kneeL: [26, 0, 0], thighR: [10, 0, -6], kneeR: [16, 0, 0],
      hands: ['open', 'fist'],
    },
  };

  SL.data.characters.future_trunks = {
    id: 'future_trunks',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Future Trunks',
    fullName: 'Trunks (Age 764, from twenty years ahead)',
    era: 'Android Saga',
    playable: true,
    prototype: true,
    style: 'Swordsman',
    blurb: 'A stranger with a sword, a Capsule Corp jacket and information nobody wants to hear.',
    ratings: { power: 4, speed: 5, ki: 3, defense: 3 },
    stats: { hp: 16000, ki: 110, stamina: 130, speed: 1.12, power: 1.05, defense: 0.95, weight: 1, kiRegen: 2.2, chargeRate: 30, canonPower: 0.9 },
    // a guard timed on a ki blast knocks it back with the flat of the blade (Fighter / Projectiles)
    swordDeflect: { window: 10 },
    appearance: {
      height: 0.95,
      skin: 0xf2c8a0,
      build: { chestW: 0.232, chestD: 0.16, shoulderX: 0.234, waistW: 0.176, upperArmR: 0.062, foreArmR: 0.053, fist: 0.06, thighR: 0.095, shinR: 0.074, headR: 0.142, neckLen: 0.058 },
      hair: { style: 'trunks', color: 0xb8a0e2 },
      face: { pupil: 0x2a5aa8, eyeW: 0.95, brow: 0xa48ac8 },
      // the arrival look (the wardrobe's `ft_capsule` is the same data; see src/data/wardrobe.js)
      outfit: OUTFIT,
      props: [
        // a straight, broad single-edged sword: squared guard, a long wrapped grip, a pommel
        { id: 'sword', shape: 'broadsword', joint: 'handR', pos: [0, -0.05, 0.012], rot: [2.25, 0, 0], length: 0.86, blade: 0xe6edf6, guard: 0x9a7a3e, grip: 0x2a2428, pommel: 0x9a7a3e },
        // the scabbard on his back along the strap: throat over the right shoulder, tip at the left hip
        { id: 'scabbard', shape: 'sheath', joint: 'chest', pos: [0.02, 0.1, -0.215], rot: [0.16, 0, 0.62], length: 0.9, color: 0x3a2c28, trim: 0x9a7a3e, grip: 0x2a2428, guard: 0x9a7a3e },
      ],
      portraitColor: '#5a4ec0',
    },
    vfx: { ghost: 0xd8c8ff, blade: 0xeaf4ff },
    audio: { strikePitch: 1.1, heavyPitch: 1.0 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xbfa8ee, core: 0xffffff, particles: 0xd8c8ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 50, style: 'full',
        mult: { damage: 1.36, speed: 1.2, defense: 1.22, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.76 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42, speed: 1.3, sharp: 0.28, sparks: 0xfff3a0 },
        look: { hair: { style: 'trunks_ssj', color: 0xffd33a }, pupil: 0x18b8a0, brow: 0xe8b830, bulk: 1.04 },
        ghost: 0xffe27a,
        line: 'trunks_ssj',
        reactLine: 'react_ssj',
        music: 3,
        // in a fight: short and controlled — the fists close, the weight sinks, one breath, and it
        // is done (no hand signs: those belong to the Burning Attack)
        sequence: {
          length: 128,
          applyAt: 84,
          steps: [
            { at: 0, pose: 'ft_tfClench', speed: 12, expression: 'grit', aura: 0.3, auraColor: 0xffffff, mood: [0.28, 0x141026, 0.8], shot: 'orbit', music: 0, sfx: 'kiUp', rocks: true },
            { at: 28, pose: 'ft_tfPress', speed: 10, expression: 'grit', aura: 0.6, sfx: 'ssjRise', mood: [0.6, 0x0a0a12, 0.5], hairFlicker: true, lightning: true },
            { at: 72, pose: 'ft_tfBrace', speed: 18, expression: 'angry', aura: 0.9 },
            { at: 84, burst: true, pose: 'ft_tfBurst', speed: 30, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x2a2410, 0.3], flash: 0.7, crater: 4, hairFlicker: false, lightning: false, rocks: false },
            { at: 100, pose: 'ft_tfFinal', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.2] },
          ],
        },
        // in the story (Chapter 5): the whole form, beat by beat (SL.data.trunksKit.transform shoots it)
        storySequence: {
          length: 344,
          applyAt: 244,
          steps: [
            { at: 0, pose: 'ft_tfStill', speed: 6, expression: 'calm', aura: 0.1, auraColor: 0xffffff, mood: [0.22, 0x141026, 1.2], music: 0, sfx: 'kiUp' },
            { at: 44, pose: 'ft_tfClench', speed: 5, expression: 'grit', aura: 0.3 },
            { at: 96, rocks: true, sfx: 'rumble', quake: 0.2 },
            { at: 120, pose: 'ft_tfPress', speed: 5, aura: 0.6, mood: [0.45, 0x100c1c, 0.8], lightning: true, crack: true },
            { at: 150, hairFlicker: true, sfx: 'ssjRise' },
            { at: 214, pose: 'ft_tfBrace', speed: 10, expression: 'angry', aura: 0.95, mood: [0.68, 0x07070f, 0.5], skyBolt: true },
            { at: 236, quake: 0.5 },
            { at: 244, burst: true, pose: 'ft_tfBurst', speed: 40, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x2a2410, 0.3], flash: 0.75, crater: 5, hairFlicker: false, lightning: false, rocks: false },
            { at: 284, pose: 'ft_tfFinal', speed: 4, expression: 'angry', mood: [0, 0x000000, 1.4] },
          ],
        },
      },
      {
        // SUPER SAIYAN RAGE (Dragon Ball Super, the Goku Black arc; roster continuation 2026-10-15): the Super Saiyan
        // shape pulled higher and paler, gold run through with blue, blue lightning in the aura. No button buys it inside
        // the story (storyBoss): Chapter 19's "The Sword of Hope" (ft_hope) stages it. Free Battle opens it after that
        // mission (or after "The Contract", for saves from before the chapter). The ultimate becomes the Sword of Hope.
        id: 'rage', name: 'Super Saiyan Rage', short: 'SSJ RAGE', kiCost: 70, style: 'full', storyBoss: true, freeUnlock: ['ft_hope', 'hit_contract'],
        mult: { damage: 2.5, speed: 1.35, defense: 1.7, kiRegen: 2.2, chargeRate: 1.45, guardStamina: 1 },
        // the aura in two layers (Roadmap Three, the Goku Black arc research: "an inner blazing golden Super Saiyan aura
        // wrapped inside an outer blue god-ki outline"): the blue shell outside, the gold flame inside it (the engine's
        // inner shell, as Blue under Kaioken). One pale-blue shell with a cream core read as all blue in the browser
        aura: {
          color: 0x3a9cff, core: 0xbfe6ff, particles: 0x9ad0ff, idle: 0.5, speed: 1.6, sharp: 0.35, sparks: 0xd8f0ff, lightning: true, boltColor: 0x6ac0ff,
          inner: { color: 0xffc21e, core: 0xfff0a8, scale: 0.74, alpha: 0.85, sharp: 0.45, speed: 1.9 },
        },
        look: { hair: { style: 'trunks_ssj', color: 0xf0f0d0 }, pupil: 0x1a8ab8, brow: 0xd8d8b0, bulk: 1.08, muscle: 1.1 },
        ghost: 0xc8e8ff,
        sequence: {
          length: 176,
          applyAt: 116,
          steps: [
            { at: 0, pose: 'ft_tfStill', speed: 8, expression: 'grit', aura: 0.2, auraColor: 0xffffff, mood: [0.3, 0x0a1020, 0.8], shot: 'orbit', sfx: 'kiUp' },
            { at: 30, pose: 'ft_tfClench', speed: 8, expression: 'grit', aura: 0.5, rocks: true, sfx: 'rumble', quake: 0.3 },
            { at: 64, pose: 'ft_tfPress', speed: 10, expression: 'shout', aura: 0.8, sfx: 'ssjRise', mood: [0.6, 0x060a14, 0.5], hairFlicker: true, lightning: true },
            { at: 104, pose: 'ft_tfBrace', speed: 16, expression: 'shout', aura: 1, skyBolt: true },
            { at: 116, burst: true, pose: 'ft_tfBurst', speed: 30, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x10202a, 0.3], flash: 0.8, crater: 5, hairFlicker: false, rocks: false },
            { at: 146, pose: 'ft_tfFinal', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.2] },
          ],
        },
        practiced: {
          length: 92,
          applyAt: 50,
          steps: [
            { at: 0, pose: 'ft_tfClench', speed: 10, expression: 'grit', aura: 0.5, quake: 0.2, sfx: 'kiUp', lightning: true },
            { at: 50, burst: true, pose: 'ft_tfBurst', speed: 14, expression: 'shout', flash: 0.4, crater: 3.5 },
            { at: 76, pose: 'ft_tfFinal', expression: 'angry' },
          ],
        },
        specials: {
          // SWORD OF HOPE: everyone's energy in the blade, and the blade through the enemy, again and again
          ultimate: {
            id: 'swordOfHope', name: 'Sword of Hope', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
            startup: 12, dashFrames: 22, speed: 64, armor: true, recovery: 32,
            poses: { wind: 'ft_riseW', dash: 'dash' },
            hits: [
              { pose: 'ft_cut', damage: 1200, frames: 9, sfx: 'swordSlash' },
              { pose: 'ft_return', damage: 1200, frames: 9, sfx: 'swordSlash' },
              { pose: 'ft_spin', damage: 1400, frames: 11, sfx: 'swordSlash' },
              { pose: 'ft_rise', damage: 1600, frames: 12, sfx: 'swordSlash', knock: 'launch', knockSpeed: 16, impact: 3, lift: 3 },
              // (2026-10-17, the owner's roadmap) he leaps over him and the sword comes down as a towering blade of
              // blue-and-gold light — an effect laid along the cut, not a modelled blade
              { pose: 'ft_drop', damage: 3600, frames: 22, sfx: 'swordSlash', knock: 'smash', knockSpeed: 44, impact: 5, to: 'above', giantCut: { length: 14, color: 0x7ac8ff } },
            ],
            // outside the story: his face as everyone's energy comes into the blade (gold pulses), alongside on the way in,
            // wide through the cuts, then the impact as the great blade comes down
            cine: {
              steps: [
                { on: 'start', shot: 'face', dur: 0.4, flash: 1.2, flashColor: 0xffe08a },
                { on: 'release', shot: 'track', dur: 0.35 },
                { on: 'connect', shot: 'wide', dur: 0.8 },
                { on: 'finish', shot: 'impact', dur: 1.2, slow: [0.45, 0.2], quake: 0.5 },
              ],
            },
          },
        },
      },
    ],
    poses,
    moves: {
      light: [
        { id: 'trunksCut', startup: 4, active: 3, recovery: 9, cancel: 6, damage: 290, reach: 1.6, radius: 0.9, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'ft_cutW', strike: 'ft_cut' }, sfx: 'swordSlash', hitPose: 'hitSideL' },
        { id: 'trunksReturn', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 300, reach: 1.6, radius: 0.9, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'ft_returnW', strike: 'ft_return' }, sfx: 'swordSlash', hitPose: 'hitSideR' },
        { id: 'trunksUpcut', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 320, reach: 1.55, radius: 0.9, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'ft_upcutW', strike: 'ft_upcut' }, sfx: 'swordSlash', hitPose: 'hitBody' },
        { id: 'trunksSpin', startup: 6, active: 8, recovery: 14, cancel: 10, damage: 190, reach: 1.75, radius: 1.1, lunge: 14, hitstun: 18, knock: 'flinch', impact: 1, multi: [0, 5], finish: { knock: 'push', knockSpeed: 9, impact: 2, damage: 320 }, pose: { wind: 'ft_spinW', strike: 'ft_spin' }, sfx: 'swordSlash', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'shiningDrop', startup: 12, active: 5, recovery: 22, damage: 980, reach: 1.8, radius: 1.05, lunge: 14, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 44, pose: { wind: 'ft_dropW', strike: 'ft_drop' }, sfx: 'swordSlash', hitPose: 'hitHeavy' },
        2: { id: 'risingBlade', startup: 9, active: 4, recovery: 20, damage: 700, reach: 1.7, radius: 0.95, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'ft_riseW', strike: 'ft_rise' }, sfx: 'swordSlash', hitPose: 'hitBody' },
        3: { id: 'runThrough', startup: 10, active: 5, recovery: 20, damage: 860, reach: 2.1, radius: 0.8, lunge: 26, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'ft_lungeW', strike: 'ft_lunge' }, sfx: 'swordSlash', hitPose: 'hitBody' },
      },
      // in the air: the somersault cut comes down over the top
      airHeavy: {
        0: { id: 'moonCut', startup: 10, active: 5, recovery: 20, damage: 900, reach: 1.8, radius: 1.05, lunge: 14, hitstun: 32, knock: 'smash', knockSpeed: 30, impact: 3, pose: { wind: 'ft_airW', strike: 'ft_air' }, sfx: 'swordSlash', hitPose: 'hitHeavy' },
      },
      dash: { id: 'dashCut', startup: 4, active: 9, recovery: 16, damage: 720, reach: 1.8, radius: 1.0, lunge: 36, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'ft_lungeW', strike: 'ft_lunge' }, sfx: 'swordSlash', hitPose: 'hitBody' },
      throw: { id: 'shoulderThrow', name: 'Shoulder Throw', damage: 840, knockSpeed: 26, poses: ['grab', 'ft_riseW', 'ft_drop'] },
    },
    specials: {
      // thrown, not charged: the hand signs are the tell, the diamond is the aim, and it tracks
      special1: {
        id: 'burningAttack', name: 'Burning Attack', type: 'projectile', kiCost: 28, icon: 'ball',
        startup: 30, recovery: 20, pose: { wind: 'ft_burnW', release: 'ft_burn' },
        projectile: { kind: 'ball', speed: 76, radius: 1.2, damage: 2400, homing: 1.6, color: 0xffd45a, core: 0xfff6d0, explode: 6, knock: 'heavy', knockSpeed: 28, impact: 3, life: 3.4 },
        // outside the story (2026-10-17): low in front and up at the hands as the signs are made, then behind his
        // shoulder along the shot to the burst
        cine: { steps: [{ on: 'start', shot: 'hand', dur: 0.5 }, { on: 'release', shot: 'path', dur: 0.9 }] },
      },
      // the sword answer to a boss standing still: four cuts, and the last one lands
      special2: {
        id: 'shiningSword', name: 'Shining Sword Attack', type: 'rush', kiCost: 40, icon: 'rush',
        startup: 10, dashFrames: 22, speed: 48, recovery: 26,
        hits: [
          { pose: 'ft_cut', damage: 620, frames: 9, sfx: 'swordSlash' },
          { pose: 'ft_return', damage: 640, frames: 9, sfx: 'swordSlash' },
          { pose: 'ft_spin', damage: 700, frames: 11, sfx: 'swordSlash' },
          { pose: 'ft_drop', damage: 1700, frames: 20, sfx: 'swordSlash', knock: 'smash', knockSpeed: 36, impact: 4 },
        ],
        poses: { wind: 'ft_cutW', dash: 'dash' },
      },
      // FINISH BUSTER: gathered overhead, then thrown down the line
      ultimate: {
        id: 'finishBuster', name: 'Finish Buster', type: 'projectile', kiCost: 90, icon: 'ultimate', ultimate: true,
        startup: 48, recovery: 30, pose: { wind: 'ft_busterCharge', release: 'ft_busterFire' },
        projectile: { kind: 'ball', speed: 62, radius: 1.9, damage: 5200, homing: 0.9, color: 0xffc83a, core: 0xfff0c0, explode: 7.5, knock: 'smash', knockSpeed: 40, impact: 4, life: 4 },
      },
    },
    // on the skill wheel: his teacher's Masenko, and the Heat Dome the story keeps for a later chapter
    extras: [
      {
        id: 'masenko', name: 'Masenko', type: 'beam', kiCost: 45, icon: 'beam',
        chargeMin: 30, chargeMax: 70, damage: [2200, 3200], radius: [0.9, 1.2], speed: 110, range: 140, sustain: 30,
        color: 0xffe25a, core: 0xfff8e0, poses: { charge: 'ft_masenkoCharge', fire: 'ft_masenkoFire' }, recovery: 26,
      },
      {
        id: 'heatDome', name: 'Heat Dome Attack', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 60, chargeMax: 60, damage: [4500, 4500], radius: [1.5, 1.5], speed: 105, range: 165, sustain: 42,
        color: 0xffd45a, core: 0xfff8e0, poses: { charge: 'ft_domeCharge', fire: 'ft_domeFire' }, recovery: 34, cinematic: true,
        callout: ['HEAT', 'DOME!'],
      },
      // THE MAFUBA (Roadmap Three, the Goku Black arc research CS-MAF-01 and its section 6; the owner's overnight brief
      // 2026-10-19): Free Battle only, after "The Divine Scythe" (the mission that shows it). The jar, the stance and the
      // green wind; the lasso out to the target in reach (no guard stops it; a dodge or vanish does); the quick-time part —
      // mash Light to drag him through the tornado into the jar faster; sealed — and with no talisman it bursts: he comes
      // out hurt, his ki and most of his stamina gone. src/game/techniques.js 'mafuba'. Provisional numbers: 80 ki, 3,600
      // on the burst, all his ki and 70 % of his stamina, 15 s cooldown; the player's move only
      {
        id: 'mafuba', name: 'Mafuba', type: 'mafuba', kiCost: 80, icon: 'ultimate', cooldown: 900,
        freeUnlock: ['ft_scythe'], freeOnly: true,
        range: 14, setFrames: 24, stanceFrames: 30, pullFrames: 150, pullPress: 0.035, sealFrames: 90,
        catchDamage: 300, damage: 3600, knockSpeed: 30, kiDrain: 1, staminaDrain: 0.7, recovery: 40, missRecovery: 40,
        cine: { steps: [{ on: 'start', shot: 'wideCut', dur: 0.8 }, { on: 'connect', shot: 'impact', dur: 1.2 }, { on: 'finish', shot: 'impact', dur: 0.9, quake: 0.4 }] },
      },
    ],
    mechanic: { type: 'swordsman', name: 'Sword Guard', desc: 'A guard timed on a ki blast knocks it back with the flat of the blade.' },
    ai: { personality: 'aggressive', aggression: 0.72, defense: 0.55, ranged: 0.35, beam: 0.3, transformHp: 0.55, preferredRange: 2.4 },
    barks: { combo: 'trunks_combo', hurt: 'trunks_hurt', lowHp: 'trunks_lowHp' },
    sequences: {
      intro: [
        // (the jacket without the sword: no reach for a hilt that is not there — steps `needs: 'sword'`)
        { pose: 'ft_calm', dur: 1, speed: 6, expression: 'calm', needs: '!sword' },
        { pose: 'ft_handNear', dur: 1, speed: 6, expression: 'calm', needs: 'sword' },
        { pose: 'ft_drawOut', dur: 0.6, speed: 12, expression: 'grit', needs: 'sword' },
        { pose: 'idle', dur: 1, speed: 8, expression: 'grit' },
      ],
      victory: [[{ pose: 'ft_finish', dur: 1, speed: 9, expression: 'angry' }, { pose: 'ft_sheathe', dur: 0.8, speed: 8, expression: 'calm', needs: 'sword' }, { pose: 'ft_calm', dur: 9, speed: 5, expression: 'calm' }]],
      defeat: [{ pose: 'defeatKneel', dur: 9, speed: 6, expression: 'hurt' }],
    },
    intro: { pose: 'idle', expression: 'grit' },
    victory: { poses: ['ft_finish'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
