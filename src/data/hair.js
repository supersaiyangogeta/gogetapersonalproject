/*
 * Hair silhouette library. Each spike: a = anchor direction on the skull,
 * d = spike direction, l = length, r = base radius, flat = depth squash,
 * depth = anchor radius factor (1.0 sits on the skull surface).
 * `mirror` spikes are duplicated on the other side.
 * Head-local space: +Y up, +Z face forward, +X character's left.
 */
(function () {
  'use strict';
  const H = SL.data.hair;

  H.goku = {
    cap: { tilt: -0.55 },
    spikes: [
      { a: [0.15, 1, 0.1], d: [0.25, 1, -0.15], l: 0.2, r: 0.07 },
      { a: [-0.25, 1, 0.05], d: [-0.45, 0.9, -0.1], l: 0.23, r: 0.075 },
      { a: [0.5, 0.85, 0], d: [0.85, 0.62, -0.1], l: 0.22, r: 0.07 },
      { a: [-0.6, 0.75, 0], d: [-0.92, 0.45, -0.05], l: 0.22, r: 0.07 },
      { a: [0.8, 0.45, -0.1], d: [1, 0.15, -0.2], l: 0.17, r: 0.06 },
      { a: [-0.85, 0.35, -0.1], d: [-1, 0.05, -0.25], l: 0.16, r: 0.06 },
      { a: [0.3, 0.6, -0.8], d: [0.4, 0.3, -1], l: 0.18, r: 0.07 },
      { a: [-0.3, 0.55, -0.8], d: [-0.45, 0.25, -1], l: 0.18, r: 0.07 },
      { a: [0, 0.2, -1], d: [0, -0.1, -1], l: 0.15, r: 0.07 },
      { a: [0.55, 0.1, -0.8], d: [0.7, -0.3, -0.7], l: 0.13, r: 0.055 },
      { a: [-0.55, 0.1, -0.8], d: [-0.7, -0.35, -0.7], l: 0.13, r: 0.055 },
      // bangs
      { a: [0.35, 0.7, 0.62], d: [0.25, -0.75, 0.6], l: 0.1, r: 0.038, depth: 1.0 },
      { a: [-0.05, 0.72, 0.69], d: [-0.15, -0.8, 0.55], l: 0.11, r: 0.04, depth: 1.0 },
      { a: [-0.4, 0.68, 0.6], d: [-0.45, -0.7, 0.55], l: 0.125, r: 0.044, depth: 1.0 },
      { a: [-0.7, 0.55, 0.45], d: [-0.8, -0.5, 0.35], l: 0.1, r: 0.04, depth: 0.95 },
      // V0.2 fill layer: denser crown and nape for a fuller silhouette
      { a: [0.05, 0.95, 0.3], d: [0.12, 1, 0.08], l: 0.16, r: 0.06 },
      { a: [-0.45, 0.85, 0.25], d: [-0.62, 0.8, 0.04], l: 0.17, r: 0.058 },
      { a: [0.42, 0.86, 0.22], d: [0.58, 0.84, 0.02], l: 0.16, r: 0.056 },
      { a: [0.3, -0.1, -0.9], d: [0.34, -0.55, -0.8], l: 0.12, r: 0.05 },
      { a: [-0.3, -0.12, -0.9], d: [-0.36, -0.55, -0.78], l: 0.12, r: 0.05 },
      { a: [0.95, 0.1, -0.2], d: [1, -0.25, -0.3], l: 0.11, r: 0.05 },
      { a: [-0.95, 0.12, -0.25], d: [-1, -0.22, -0.34], l: 0.11, r: 0.05 },
      { a: [0.7, 0.62, -0.5], d: [0.85, 0.45, -0.6], l: 0.15, r: 0.055 },
      { a: [-0.72, 0.6, -0.5], d: [-0.88, 0.4, -0.6], l: 0.15, r: 0.055 },
    ],
  };

  H.goku_ssj = {
    cap: { tilt: -0.5 },
    glow: 0x3a2800,
    spikes: [
      { a: [0, 1, 0], d: [0.05, 1, -0.25], l: 0.29, r: 0.078 },
      { a: [0, 0.6, -0.8], d: [0, 0.75, -0.8], l: 0.23, r: 0.08 },
      { a: [0, 0.1, -1], d: [0, 0.2, -1], l: 0.15, r: 0.07 },
      { a: [-0.1, 0.72, 0.69], d: [-0.2, -0.8, 0.5], l: 0.12, r: 0.035, depth: 1.0 },
      { a: [0, 0.9, 0.4], d: [0, 1, 0.12], l: 0.22, r: 0.062, depth: 0.95 },
    ],
    mirror: [
      { a: [0.35, 0.95, 0], d: [0.35, 1, -0.2], l: 0.27, r: 0.07 },
      { a: [0.65, 0.7, 0], d: [0.7, 0.85, -0.2], l: 0.24, r: 0.066 },
      { a: [0.85, 0.35, -0.1], d: [0.95, 0.52, -0.25], l: 0.19, r: 0.06 },
      { a: [0.45, 0.45, -0.75], d: [0.5, 0.62, -0.75], l: 0.2, r: 0.07 },
      { a: [0.3, 0.8, 0.5], d: [0.25, 1, 0.1], l: 0.18, r: 0.055, depth: 0.95 },
      { a: [0.6, 0.2, -0.7], d: [0.7, 0.35, -0.7], l: 0.14, r: 0.055 },
    ],
  };

  H.vegeta = {
    cap: { tilt: -0.28, sy: 1.08 },
    spikes: [
      { a: [0, 0.62, 0.78], d: [0, -1, 0.3], l: 0.065, r: 0.05, depth: 0.98, flat: 0.45 },
      { a: [0, 1, -0.1], d: [0, 1, -0.08], l: 0.33, r: 0.07 },
      { a: [0, 0.85, -0.5], d: [0, 1, -0.35], l: 0.28, r: 0.075 },
      { a: [0, 0.5, -0.85], d: [0, 0.8, -0.6], l: 0.2, r: 0.075 },
    ],
    mirror: [
      { a: [0.3, 0.95, -0.1], d: [0.18, 1, -0.1], l: 0.3, r: 0.068 },
      { a: [0.55, 0.8, -0.05], d: [0.33, 1, -0.1], l: 0.26, r: 0.066 },
      { a: [0.8, 0.55, -0.1], d: [0.52, 1, -0.12], l: 0.21, r: 0.062 },
      { a: [0.4, 0.75, -0.5], d: [0.25, 1, -0.3], l: 0.24, r: 0.07 },
      { a: [0.22, 0.9, 0.35], d: [0.1, 1, 0.08], l: 0.24, r: 0.06 },
    ],
  };

  const scaled = (src, k, spread) => ({
    cap: src.cap,
    spikes: src.spikes.map((s) => ({ ...s, l: s.l * k, d: [s.d[0] * spread, s.d[1], s.d[2]] })),
    mirror: src.mirror && src.mirror.map((s) => ({ ...s, l: s.l * k, d: [s.d[0] * spread, s.d[1], s.d[2]] })),
  });
  H.vegeta_ssj = scaled(H.vegeta, 1.12, 1.25);
  // Super Vegeta (Super Saiyan Grade 2, the Final Flash): stiffer and thicker than Super Saiyan, the spires
  // longer and flared further out, a near-white core burning in the hair itself
  H.vegeta_g2 = (() => {
    const v = scaled(H.vegeta, 1.24, 1.42);
    v.spikes = v.spikes.map((s) => ({ ...s, r: s.r * 1.14 }));
    v.mirror = v.mirror.map((s) => ({ ...s, r: s.r * 1.14 }));
    v.glow = 0x6a5a28;
    return v;
  })();
  // Super Saiyan 2: taller, flared wider, every spike thinner and harder at the root
  H.vegeta_ssj2 = (() => {
    const v = scaled(H.vegeta, 1.22, 1.4);
    v.spikes = v.spikes.map((s, i) => (i === 0 ? s : { ...s, r: s.r * 0.86 }));
    v.mirror = v.mirror.map((s) => ({ ...s, r: s.r * 0.86 }));
    v.glow = 0x4a3400;
    return v;
  })();

  // Majin Vegeta: the Super Saiyan 2 hair swept up off a high forehead, with a sharp widow's peak
  // that stops above the M (the plain style's hairline sits on the brows and would hide the mark)
  H.vegeta_majin = (() => {
    const v = { ...H.vegeta_ssj2, spikes: H.vegeta_ssj2.spikes.slice() };
    v.cap = { ...v.cap, tilt: -0.74 };
    v.spikes[0] = { ...v.spikes[0], a: [0, 0.74, 0.67], d: [0, -1, 0.4], l: 0.02, r: 0.022, depth: 1 };
    return v;
  })();

  // Goku, Super Saiyan 3 (the owner's reference, 2026-10-02): the crown, wide spikes sweeping out to
  // the sides, a mane of long gold spikes down to the back of the knees, and the big forelock hanging
  // over the forehead (the form also takes his eyebrows away and gives him a brow ridge: ssj3Brow)
  H.goku_ssj3 = {
    cap: { tilt: -0.5, sy: 1.06 },
    glow: 0x4a3400,
    // a mane this long hangs: when the head goes back each long lock swings back about its own root
    // instead of turning with the skull into the shoulders (Animator, hair gravity; the scalp stays put)
    gravity: 0.95,
    spikes: [
      { a: [0, 1, 0], d: [0.05, 1, -0.3], l: 0.3, r: 0.08 },
      { a: [0, 0.2, -1], d: [0, -1, -0.3], l: 1.28, r: 0.17 },
      { a: [0, -0.2, -1], d: [0, -1, -0.22], l: 1.4, r: 0.16 },
      { a: [0, 0.65, -0.75], d: [0, -0.85, -0.55], l: 0.98, r: 0.16 },
      { a: [0, 0.9, 0.4], d: [0, 1, 0.1], l: 0.2, r: 0.06, depth: 0.95 },
      // the forelock: from the top of the crown, down over the forehead to between the eyes
      { a: [0.1, 0.6, 0.8], d: [-0.25, -0.95, 0.22], l: 0.125, r: 0.042, depth: 1.0 },
    ],
    mirror: [
      { a: [0.35, 0.95, 0], d: [0.4, 1, -0.3], l: 0.27, r: 0.075 },
      { a: [0.7, 0.62, -0.1], d: [0.8, 0.35, -0.5], l: 0.36, r: 0.075 },
      // the wide sweep out to the sides, as wide as the shoulders
      { a: [0.85, 0.4, -0.2], d: [1, 0.05, -0.42], l: 0.6, r: 0.11 },
      { a: [0.6, 0.35, -0.72], d: [0.42, -1, -0.34], l: 1.12, r: 0.15 },
      { a: [0.9, 0.2, -0.35], d: [0.55, -1, -0.24], l: 0.88, r: 0.13 },
      { a: [0.35, -0.1, -0.95], d: [0.24, -1, -0.28], l: 1.3, r: 0.14 },
      { a: [0.85, -0.2, -0.45], d: [0.48, -1, -0.14], l: 0.98, r: 0.12 },
      { a: [0.7, 0.6, -0.4], d: [0.66, -0.8, -0.42], l: 0.78, r: 0.13 },
      { a: [0.5, 0.74, 0.5], d: [0.62, -0.45, 0.32], l: 0.13, r: 0.034, depth: 1.0 },
    ],
  };

  /**
   * THE GROWTH OF THE THIRD LEVEL (the owner, 2026-10-06: the hair did not grow out of his head, it jumped and
   * slid over his torso). Three in-between styles made from the finished mane: every long lock is the same lock
   * at 25 %, 50 % and 78 % of its length and a little thinner — real stages of growth out of the scalp, not the
   * final mesh scaled. The short crown spikes are already there from the start. ssj3Stage(k) names the style
   * for a growth 0..1 (null before the first stage: Super Saiyan 2's hair).
   */
  for (const [id, k] of [['goku_ssj3_g1', 0.25], ['goku_ssj3_g2', 0.5], ['goku_ssj3_g3', 0.78]]) {
    const grow = (sp) => (sp.l > 0.3 ? Object.assign({}, sp, { l: 0.3 + (sp.l - 0.3) * k, r: sp.r * (0.62 + 0.38 * k) }) : sp);
    H[id] = { cap: H.goku_ssj3.cap, glow: H.goku_ssj3.glow, gravity: 0.95 * (0.5 + 0.5 * k), spikes: H.goku_ssj3.spikes.map(grow), mirror: H.goku_ssj3.mirror.map(grow) };
  }
  SL.data.ssj3Stage = (k) => (k < 0.12 ? null : k < 0.4 ? 'goku_ssj3_g1' : k < 0.65 ? 'goku_ssj3_g2' : k < 0.9 ? 'goku_ssj3_g3' : 'goku_ssj3');

  /**
   * Super Saiyan 3's face: no eyebrows (the form's brow colour is the skin), and in their place a
   * heavy ridge — a skin-coloured bulge across the brow and a dark crease over each eye, slanting
   * down to the nose, the shadow the anime draws there.
   */
  SL.data.ssj3Brow = function (skin, crease = 0x6a3a2a) {
    const line = { shape: 'line', r: 0.006, flat: 0.25, depth: 1.006, color: crease };
    return [
      { shape: 'ball', a: [0, 0.24, 0.97], d: [1, 0, 0], l: 0.085, r: 0.02, flat: 0.6, depth: 0.985, color: skin, outline: 0 },
      Object.assign({ a: [-0.34, 0.3, 0.89], d: [0.62, -0.28, 0.2], l: 0.045 }, line),
      Object.assign({ a: [0.34, 0.3, 0.89], d: [-0.62, -0.28, 0.2], l: 0.045 }, line),
    ];
  };

  // Goku, Super Saiyan 2: the same crown, sharper and taller, and the single loose bang over
  // the forehead that tells the form apart from the first one at a glance
  H.goku_ssj2 = {
    cap: H.goku_ssj.cap,
    glow: 0x4a3400,
    spikes: H.goku_ssj.spikes
      .filter((s, i) => i !== 3)
      .map((s) => ({ ...s, l: s.l * 1.12, r: s.r * 0.84, d: [s.d[0], s.d[1] * 1.08, s.d[2]] }))
      .concat([{ a: [0.32, 0.76, 0.58], d: [0.3, -0.9, 0.4], l: 0.16, r: 0.027, depth: 1.0 }]),
    mirror: H.goku_ssj.mirror.map((s) => ({ ...s, l: s.l * 1.1, r: s.r * 0.84, d: [s.d[0] * 1.14, s.d[1] * 1.05, s.d[2]] })),
  };

  H.bardock = {
    cap: { tilt: -0.5 },
    spikes: H.goku.spikes.slice(0, 15).map((s, i) => {
      if (i >= 11) return { ...s, l: s.l * 1.35, r: s.r * 1.1, d: [s.d[0] * 1.2, s.d[1], s.d[2]] };
      return { ...s, l: s.l * 1.06, d: [s.d[0] * 1.15, s.d[1] * 0.92, s.d[2]] };
    }).concat(H.goku.spikes.slice(15).map((s) => ({ ...s, d: [s.d[0] * 1.2, s.d[1] * 0.85, s.d[2]] }))).concat([
      { a: [0.65, 0.5, 0.5], d: [0.85, -0.55, 0.3], l: 0.11, r: 0.04, depth: 0.95 },
      { a: [0.15, 0.7, 0.68], d: [0.1, -0.85, 0.5], l: 0.12, r: 0.036, depth: 1.0 },
    ]),
  };

  // Raditz: a spiky crown flowing into an enormous mane down to the thighs
  H.raditz = {
    cap: { tilt: -0.45, sy: 1.04 },
    spikes: [
      { a: [0, 1, 0.1], d: [0.05, 1, -0.3], l: 0.17, r: 0.07 },
      { a: [0, 0.7, 0.66], d: [0.1, -0.85, 0.5], l: 0.09, r: 0.04, depth: 1.0 },
      { a: [0, 0.2, -1], d: [0, -1, -0.3], l: 0.74, r: 0.15 },
      { a: [0, -0.2, -1], d: [0, -1, -0.2], l: 0.84, r: 0.14 },
      { a: [0, 0.6, -0.8], d: [0, -0.9, -0.5], l: 0.6, r: 0.14 },
    ],
    mirror: [
      { a: [0.4, 0.9, 0.1], d: [0.45, 1, -0.3], l: 0.16, r: 0.066 },
      { a: [0.75, 0.55, 0], d: [0.9, 0.6, -0.3], l: 0.15, r: 0.06 },
      { a: [0.35, 0.7, 0.6], d: [0.35, -0.8, 0.45], l: 0.085, r: 0.038, depth: 1.0 },
      { a: [0.6, 0.35, -0.72], d: [0.38, -1, -0.32], l: 0.7, r: 0.14 },
      { a: [0.9, 0.2, -0.35], d: [0.45, -1, -0.22], l: 0.56, r: 0.12 },
      { a: [0.35, -0.1, -0.95], d: [0.22, -1, -0.26], l: 0.8, r: 0.13 },
      { a: [0.85, -0.2, -0.45], d: [0.42, -1, -0.14], l: 0.64, r: 0.11 },
      { a: [0.7, 0.6, -0.4], d: [0.6, -0.8, -0.4], l: 0.5, r: 0.12 },
    ],
  };

  // Kid Gohan: soft, short spikes (mostly hidden under his cap)
  H.gohan_kid = {
    cap: { tilt: -0.4 },
    spikes: [
      { a: [0, 0.4, -0.9], d: [0, -0.5, -1], l: 0.12, r: 0.06 },
      { a: [-0.2, 0.62, 0.72], d: [-0.2, -0.9, 0.5], l: 0.09, r: 0.045, depth: 1.0 },
      { a: [0.2, 0.62, 0.72], d: [0.25, -0.9, 0.45], l: 0.08, r: 0.042, depth: 1.0 },
    ],
    mirror: [
      { a: [0.8, 0.3, -0.3], d: [1, -0.3, -0.5], l: 0.1, r: 0.05 },
      { a: [0.5, 0.2, -0.8], d: [0.6, -0.6, -0.8], l: 0.1, r: 0.05 },
    ],
  };

  // Yamcha (Saiyan Saga): short, messy spikes swept back from the brow
  H.yamcha = {
    cap: { tilt: -0.42, sy: 1.02 },
    spikes: [
      { a: [0, 0.95, 0.35], d: [0, 1, -0.6], l: 0.1, r: 0.055 },
      { a: [0, 0.5, -0.86], d: [0, -0.4, -1], l: 0.13, r: 0.06 },
      { a: [-0.1, 0.7, 0.66], d: [-0.15, -0.6, 0.8], l: 0.08, r: 0.04, depth: 1.0 },
    ],
    mirror: [
      { a: [0.45, 0.85, 0.2], d: [0.5, 0.9, -0.5], l: 0.1, r: 0.05 },
      { a: [0.8, 0.45, -0.25], d: [1, 0, -0.6], l: 0.1, r: 0.05 },
      { a: [0.55, 0.3, -0.78], d: [0.5, -0.5, -0.9], l: 0.12, r: 0.055 },
      { a: [0.3, 0.72, 0.62], d: [0.35, -0.7, 0.6], l: 0.07, r: 0.036, depth: 1.0 },
    ],
  };

  // Yajirobe: a thick, messy mane down to the neck
  H.yajirobe = {
    cap: { tilt: -0.5, sy: 1.1, sx: 1.08 },
    spikes: [
      { a: [0, 0.95, 0.3], d: [0, 1, 0.4], l: 0.1, r: 0.07 },
      { a: [0, 0.3, -0.95], d: [0, -1, -0.5], l: 0.26, r: 0.11 },
      { a: [0, 0.75, 0.66], d: [0, -0.7, 0.8], l: 0.09, r: 0.05, depth: 1.0 },
    ],
    mirror: [
      { a: [0.5, 0.8, 0.4], d: [0.5, 0.6, 0.6], l: 0.1, r: 0.06 },
      { a: [0.9, 0.25, -0.1], d: [0.8, -1, -0.2], l: 0.24, r: 0.1 },
      { a: [0.6, 0.1, -0.75], d: [0.5, -1, -0.5], l: 0.26, r: 0.1 },
      { a: [0.35, 0.72, 0.62], d: [0.4, -0.8, 0.6], l: 0.08, r: 0.045, depth: 1.0 },
    ],
  };

  // Frieza race head dome (drawn as a cap in the dome color)
  H.frieza_dome = { cap: { tilt: -0.15, sx: 1.04, sy: 1.12, sz: 1.06 }, spikes: [] };

  // Frieza Force soldier head variants
  H.soldier_crest = {
    cap: false,
    spikes: [
      { a: [0, 1, 0.3], d: [0, 1, -0.4], l: 0.12, r: 0.04, flat: 0.35 },
      { a: [0, 0.9, -0.3], d: [0, 0.6, -1], l: 0.14, r: 0.045, flat: 0.35 },
    ],
  };
  H.soldier_hair = {
    cap: { tilt: -0.35 },
    mirror: [{ a: [0.6, 0.7, -0.3], d: [0.8, 0.2, -0.8], l: 0.12, r: 0.05 }],
    spikes: [{ a: [0, 0.4, -0.9], d: [0, -0.8, -0.6], l: 0.18, r: 0.08 }],
  };

  // Zarbon: smooth, swept-back hair (the braid itself is a headExtra on his body)
  H.zarbon = {
    cap: { tilt: -0.3, sy: 1.04, sz: 1.06 },
    spikes: [
      { a: [0, 0.75, -0.6], d: [0, 0.1, -1], l: 0.16, r: 0.05, flat: 0.5 },
      { a: [0, 0.45, -0.85], d: [0, -0.3, -1], l: 0.14, r: 0.045, flat: 0.5 },
    ],
    mirror: [
      { a: [0.5, 0.7, -0.5], d: [0.5, 0.1, -1], l: 0.15, r: 0.042, flat: 0.45 },
      { a: [0.75, 0.3, -0.35], d: [0.9, -0.3, -0.6], l: 0.12, r: 0.036, flat: 0.45 },
    ],
  };
  // a long white mane swept straight back off the face
  H.jeice = {
    cap: { tilt: -0.26, sy: 1.02, sz: 1.08 },
    spikes: [
      { a: [0, 0.85, -0.35], d: [0, 0.25, -1], l: 0.24, r: 0.05, flat: 0.55 },
      { a: [0, 0.55, -0.8], d: [0, -0.35, -1], l: 0.3, r: 0.048, flat: 0.55 },
      { a: [0, 0.2, -0.95], d: [0, -0.8, -0.7], l: 0.26, r: 0.042, flat: 0.55 },
    ],
    mirror: [
      { a: [0.5, 0.75, -0.45], d: [0.45, 0.15, -1], l: 0.26, r: 0.045, flat: 0.5 },
      { a: [0.7, 0.35, -0.5], d: [0.7, -0.4, -0.9], l: 0.28, r: 0.04, flat: 0.5 },
      { a: [0.85, 0, -0.3], d: [0.8, -0.9, -0.4], l: 0.22, r: 0.036, flat: 0.5 },
    ],
  };

  // ...and the same hair dragged wild by the monstrous form
  H.zarbon_beast = {
    cap: { tilt: -0.22, sx: 1.08, sy: 1.08, sz: 1.1 },
    spikes: [
      { a: [0, 0.9, -0.3], d: [0, 0.8, -0.8], l: 0.2, r: 0.055 },
      { a: [0, 0.5, -0.9], d: [0, -0.2, -1], l: 0.22, r: 0.05 },
    ],
    mirror: [
      { a: [0.6, 0.8, -0.3], d: [0.8, 0.5, -0.7], l: 0.2, r: 0.05 },
      { a: [0.85, 0.35, -0.4], d: [1, -0.1, -0.5], l: 0.17, r: 0.044 },
      { a: [0.35, 0.95, 0.1], d: [0.4, 0.9, -0.3], l: 0.14, r: 0.038 },
    ],
  };
  // Future Trunks: a straight lavender bob that stops at the jaw, with a heavy fringe
  H.trunks = {
    cap: { tilt: -0.35, sx: 1.04, sy: 1.04, sz: 1.04 },
    spikes: [
      { a: [0, 0.9, 0.35], d: [0, 0.4, 0.7], l: 0.07, r: 0.055, flat: 0.7 },
      { a: [0, 0.45, -0.9], d: [0, -1, -0.45], l: 0.2, r: 0.075, flat: 0.55 },
      { a: [-0.05, 0.72, 0.68], d: [-0.1, -1, 0.35], l: 0.13, r: 0.05, depth: 1, flat: 0.6 },
    ],
    mirror: [
      { a: [0.5, 0.8, 0.3], d: [0.35, -0.2, 0.6], l: 0.1, r: 0.05, flat: 0.7 },
      { a: [0.9, 0.2, -0.15], d: [0.55, -1, -0.15], l: 0.22, r: 0.06, flat: 0.55 },
      { a: [0.6, 0.15, -0.75], d: [0.4, -1, -0.5], l: 0.21, r: 0.06, flat: 0.55 },
      { a: [0.35, 0.72, 0.6], d: [0.3, -1, 0.45], l: 0.12, r: 0.045, depth: 1, flat: 0.6 },
    ],
  };

  // ...and the same hair standing straight up when he turns it gold
  H.trunks_ssj = {
    cap: { tilt: -0.5, sx: 1.05, sy: 1.1, sz: 1.05 },
    spikes: [
      { a: [0, 1, 0.05], d: [0, 1, -0.15], l: 0.26, r: 0.075 },
      { a: [0, 0.55, -0.85], d: [0, 0.5, -1], l: 0.2, r: 0.065 },
      { a: [-0.1, 0.75, 0.62], d: [-0.2, 0.6, 0.7], l: 0.14, r: 0.05, depth: 1 },
    ],
    mirror: [
      { a: [0.4, 0.95, 0.05], d: [0.6, 0.95, -0.2], l: 0.24, r: 0.07 },
      { a: [0.8, 0.5, -0.1], d: [1, 0.55, -0.3], l: 0.21, r: 0.06 },
      { a: [0.55, 0.35, -0.75], d: [0.7, 0.35, -0.9], l: 0.18, r: 0.055 },
      { a: [0.3, 0.78, 0.58], d: [0.45, 0.6, 0.6], l: 0.13, r: 0.048, depth: 1 },
    ],
  };
  // Chi-Chi: hair drawn back tight into a bun, with two locks framing the face
  H.chichi = {
    cap: { tilt: -0.35, sx: 1.03, sy: 1.02, sz: 1.05 },
    spikes: [
      // the bun: two short thick shapes on the crown at the back, so it reads round
      { a: [0, 0.7, -0.72], d: [0, 0.55, -1], l: 0.1, r: 0.085, flat: 1 },
      { a: [0, 0.62, -0.78], d: [0, 0.3, -1], l: 0.08, r: 0.09, flat: 1 },
      // the locks at the temples
      { a: [0.78, 0.36, 0.42], d: [0.25, -1, 0.1], l: 0.16, r: 0.03, depth: 1 },
      { a: [-0.78, 0.36, 0.42], d: [-0.25, -1, 0.1], l: 0.16, r: 0.03, depth: 1 },
      // a parted fringe
      { a: [0.3, 0.8, 0.52], d: [0.7, -0.4, 0.5], l: 0.09, r: 0.036, depth: 1 },
      { a: [-0.3, 0.8, 0.52], d: [-0.7, -0.4, 0.5], l: 0.09, r: 0.036, depth: 1 },
    ],
  };

  // Gohan at eleven: his father's shape, smaller and tidier
  H.gohan_teen = {
    cap: { tilt: -0.5 },
    spikes: [
      { a: [0.15, 1, 0.1], d: [0.2, 1, -0.2], l: 0.17, r: 0.062 },
      { a: [-0.25, 1, 0.05], d: [-0.4, 0.95, -0.15], l: 0.19, r: 0.066 },
      { a: [0.5, 0.85, 0], d: [0.8, 0.65, -0.15], l: 0.18, r: 0.06 },
      { a: [-0.6, 0.75, 0], d: [-0.9, 0.5, -0.1], l: 0.18, r: 0.06 },
      { a: [0.3, 0.6, -0.8], d: [0.4, 0.35, -1], l: 0.15, r: 0.06 },
      { a: [-0.3, 0.55, -0.8], d: [-0.45, 0.3, -1], l: 0.15, r: 0.06 },
      { a: [0, 0.2, -1], d: [0, -0.05, -1], l: 0.13, r: 0.06 },
      { a: [-0.05, 0.72, 0.69], d: [-0.15, -0.75, 0.6], l: 0.1, r: 0.038, depth: 1 },
      { a: [0.35, 0.7, 0.62], d: [0.3, -0.7, 0.6], l: 0.09, r: 0.036, depth: 1 },
      { a: [-0.42, 0.68, 0.58], d: [-0.5, -0.65, 0.55], l: 0.1, r: 0.038, depth: 1 },
    ],
  };

  // Super Saiyan at eleven (owner, 2026-10-01: "his SSJ1 is like his base form but with SSJ colour and a
  // bit better"): the boy's own shape, gold, lifted a little and a little sharper — still the fringe
  // over the brow, nothing like the canopy of Super Saiyan 2
  H.gohan_teen_ssj = {
    cap: { tilt: -0.52, sy: 1.02 },
    glow: 0x3a2800,
    spikes: [
      { a: [0.15, 1, 0.1], d: [0.2, 1, -0.12], l: 0.2, r: 0.06 },
      { a: [-0.25, 1, 0.05], d: [-0.38, 1, -0.08], l: 0.22, r: 0.064 },
      { a: [0.5, 0.85, 0], d: [0.78, 0.78, -0.12], l: 0.2, r: 0.058 },
      { a: [-0.6, 0.75, 0], d: [-0.88, 0.62, -0.08], l: 0.2, r: 0.058 },
      { a: [0.3, 0.6, -0.8], d: [0.4, 0.5, -1], l: 0.17, r: 0.058 },
      { a: [-0.3, 0.55, -0.8], d: [-0.45, 0.45, -1], l: 0.17, r: 0.058 },
      { a: [0, 0.2, -1], d: [0, 0.08, -1], l: 0.14, r: 0.058 },
      { a: [0.05, 0.95, 0.32], d: [0.1, 1, 0.1], l: 0.15, r: 0.055 },
      // the fringe stays: three short points over the brow, lifted off the forehead a touch
      { a: [-0.05, 0.72, 0.69], d: [-0.15, -0.55, 0.72], l: 0.09, r: 0.036, depth: 1 },
      { a: [0.35, 0.7, 0.62], d: [0.3, -0.5, 0.72], l: 0.085, r: 0.034, depth: 1 },
      { a: [-0.42, 0.68, 0.58], d: [-0.5, -0.45, 0.66], l: 0.09, r: 0.036, depth: 1 },
    ],
  };

  // ...and the shape it takes when he stops holding anything back: Super Saiyan 2 — every strand
  // standing straight up in a rigid, spiky canopy, sharper and taller, and the single bang
  H.gohan_ssj2 = {
    cap: { tilt: -0.62, sy: 1.08 },
    glow: 0x4a3400,
    spikes: [
      { a: [0, 1, 0.12], d: [0, 1, -0.06], l: 0.38, r: 0.068 },
      { a: [0.3, 0.98, 0.05], d: [0.3, 1, -0.14], l: 0.35, r: 0.064 },
      { a: [-0.3, 0.98, 0.05], d: [-0.32, 1, -0.14], l: 0.35, r: 0.064 },
      { a: [0.15, 0.96, 0.32], d: [0.14, 1, 0.08], l: 0.3, r: 0.058 },
      { a: [-0.15, 0.96, 0.32], d: [-0.16, 1, 0.08], l: 0.3, r: 0.058 },
      { a: [0.62, 0.8, -0.05], d: [0.66, 1, -0.22], l: 0.31, r: 0.06 },
      { a: [-0.62, 0.8, -0.05], d: [-0.68, 1, -0.22], l: 0.31, r: 0.06 },
      { a: [0.85, 0.45, -0.15], d: [0.92, 0.82, -0.32], l: 0.25, r: 0.056 },
      { a: [-0.85, 0.45, -0.15], d: [-0.94, 0.82, -0.32], l: 0.25, r: 0.056 },
      { a: [0.35, 0.6, -0.78], d: [0.38, 0.86, -0.8], l: 0.27, r: 0.058 },
      { a: [-0.35, 0.6, -0.78], d: [-0.4, 0.86, -0.8], l: 0.27, r: 0.058 },
      { a: [0, 0.3, -0.98], d: [0, 0.7, -1], l: 0.22, r: 0.056 },
      { a: [0.6, 0.2, -0.75], d: [0.66, 0.6, -0.8], l: 0.18, r: 0.05 },
      { a: [-0.6, 0.2, -0.75], d: [-0.68, 0.6, -0.8], l: 0.18, r: 0.05 },
      // the one strand that falls over his forehead: the most recognisable line of the shape
      { a: [0.1, 0.8, 0.6], d: [0.12, -0.88, 0.46], l: 0.16, r: 0.03, depth: 1 },
    ],
  };

  /* ---- Buu saga (Age 774) ---- */

  // Gohan at seventeen (rebuilt 2026-09-25 from the owner's Buu Saga references): short and
  // spiky, the crown pushed up and to the sides, a few points at the back, and the one strand that
  // falls on his forehead — not his father's head of hair and not the boy's bowl
  H.gohan_adult = {
    cap: { tilt: -0.5, sx: 1.05, sy: 1.1, sz: 1.06 },
    spikes: [
      { a: [0.05, 1, 0.12], d: [0.15, 1, -0.2], l: 0.14, r: 0.058 },
      { a: [0, 0.55, -0.85], d: [0, 0.25, -1], l: 0.12, r: 0.06 },
      { a: [0, 0.18, -1], d: [0, -0.45, -1], l: 0.09, r: 0.055 },
      // the strand on the forehead
      { a: [0.08, 0.8, 0.58], d: [0.12, -0.88, 0.46], l: 0.11, r: 0.028, depth: 1 },
      { a: [-0.2, 0.84, 0.5], d: [-0.35, 0.3, 0.9], l: 0.07, r: 0.036, depth: 0.98 },
    ],
    mirror: [
      { a: [0.42, 0.92, 0.1], d: [0.52, 0.95, -0.25], l: 0.13, r: 0.054 },
      { a: [0.74, 0.6, 0], d: [0.95, 0.5, -0.2], l: 0.12, r: 0.05 },
      { a: [0.9, 0.25, -0.25], d: [1, 0, -0.4], l: 0.085, r: 0.046 },
      { a: [0.45, 0.55, -0.72], d: [0.55, 0.35, -0.9], l: 0.11, r: 0.052 },
      { a: [0.36, 0.78, 0.5], d: [0.6, 0.5, 0.55], l: 0.085, r: 0.04, depth: 0.98 },
    ],
  };
  // ...as a Super Saiyan: the same shape pulled straight up, two locks left over the forehead
  H.gohan_adult_ssj = {
    cap: { tilt: -0.45, sx: 1.06, sy: 1.12, sz: 1.06 },
    glow: 0x3a2800,
    spikes: [
      { a: [0, 1, 0.05], d: [0.05, 1, -0.2], l: 0.27, r: 0.072 },
      { a: [0, 0.6, -0.8], d: [0, 0.8, -0.7], l: 0.22, r: 0.07 },
      { a: [0, 0.15, -1], d: [0, 0.3, -1], l: 0.14, r: 0.062 },
      { a: [0.1, 0.8, 0.58], d: [0.2, -0.85, 0.45], l: 0.12, r: 0.03, depth: 1 },
      { a: [-0.16, 0.8, 0.56], d: [-0.25, -0.8, 0.45], l: 0.1, r: 0.028, depth: 1 },
    ],
    mirror: [
      { a: [0.38, 0.95, 0.05], d: [0.4, 1, -0.2], l: 0.25, r: 0.066 },
      { a: [0.68, 0.7, -0.05], d: [0.8, 0.85, -0.25], l: 0.22, r: 0.062 },
      { a: [0.88, 0.3, -0.2], d: [0.95, 0.5, -0.35], l: 0.16, r: 0.055 },
      { a: [0.45, 0.5, -0.75], d: [0.5, 0.65, -0.8], l: 0.19, r: 0.062 },
      { a: [0.3, 0.84, 0.46], d: [0.3, 1, 0.2], l: 0.16, r: 0.05, depth: 0.96 },
    ],
  };
  // ...Super Saiyan 2: sharper and taller, one strand only, the lightning form's silhouette
  H.gohan_adult_ssj2 = {
    cap: H.gohan_adult_ssj.cap,
    glow: 0x4a3400,
    spikes: H.gohan_adult_ssj.spikes
      .filter((x, i) => i !== 4)
      .map((x, i) => (i === 3 ? { ...x, a: [0.05, 0.82, 0.57], d: [0.1, -0.9, 0.42], l: 0.11, r: 0.026 } : { ...x, l: x.l * 1.1, r: x.r * 0.86 })),
    mirror: H.gohan_adult_ssj.mirror.map((x) => ({ ...x, l: x.l * 1.1, r: x.r * 0.85, d: [x.d[0] * 1.1, x.d[1] * 1.05, x.d[2]] })),
  };
  // Ultimate Gohan (the Old Kai's ritual): black again, the Super Saiyan 2 shape held down, the strand
  H.gohan_ultimate = {
    cap: H.gohan_adult_ssj.cap,
    spikes: H.gohan_adult_ssj2.spikes.map((x, i) => (i === 3 ? x : { ...x, l: x.l * 0.78 })),
    mirror: H.gohan_adult_ssj2.mirror.map((x) => ({ ...x, l: x.l * 0.78, d: [x.d[0] * 1.15, x.d[1] * 0.85, x.d[2]] })),
  };

  // VEGITO (the Potara, from the owner's reference sheet): Vegeta's hairline — the widow's peak and
  // the flame swept up off the forehead — shorter and raked back, with Goku's two front bangs
  // hanging over the forehead either side of the peak. Neither father's head of hair.
  const VEGITO_BANGS = [
    { a: [0.2, 0.7, 0.68], d: [0.24, -0.86, 0.46], l: 0.125, r: 0.034, depth: 1.0 },
    { a: [-0.16, 0.73, 0.66], d: [-0.22, -0.88, 0.44], l: 0.14, r: 0.037, depth: 1.0 },
  ];
  H.vegito = {
    cap: { tilt: -0.3, sy: 1.08, sx: 1.03 },
    spikes: H.vegeta.spikes
      .map((s, i) => (i === 0 ? s : { ...s, l: s.l * 0.86, d: [s.d[0], s.d[1] * 0.86, s.d[2] - 0.28] }))
      .concat(VEGITO_BANGS)
      .concat([{ a: [0, 0.2, -1], d: [0, -0.2, -1], l: 0.12, r: 0.066 }]),
    mirror: H.vegeta.mirror.map((s) => ({ ...s, l: s.l * 0.86, d: [s.d[0] * 1.12, s.d[1] * 0.86, s.d[2] - 0.26] })).concat([{ a: [0.7, 0.3, -0.5], d: [0.8, 0.2, -0.7], l: 0.14, r: 0.056 }]),
  };
  // ...Super Vegito: the flame stands straight up, gold, taller and wider — and the two bangs stay
  H.vegito_ssj = {
    cap: { tilt: -0.3, sy: 1.1, sx: 1.05 },
    glow: 0x4a3400,
    spikes: H.vegeta.spikes
      .map((s, i) => (i === 0 ? s : { ...s, l: s.l * 1.14, r: s.r * 0.94, d: [s.d[0] * 1.3, s.d[1], s.d[2] - 0.08] }))
      .concat(VEGITO_BANGS.map((s) => ({ ...s, l: s.l * 1.06 })))
      .concat([{ a: [0, 0.2, -1], d: [0, 0.2, -1], l: 0.14, r: 0.066 }]),
    mirror: H.vegeta.mirror.map((s) => ({ ...s, l: s.l * 1.14, r: s.r * 0.94, d: [s.d[0] * 1.38, s.d[1], s.d[2] - 0.06] })).concat([{ a: [0.7, 0.3, -0.5], d: [0.85, 0.5, -0.6], l: 0.17, r: 0.056 }]),
  };

  // GOGETA (the Fusion Dance, from the owner's reference sheet): NOT Vegito's head. Goku's splayed,
  // spiky mane — bigger, and standing straighter at the front — on Vegeta's widow's-peak hairline,
  // with ONE lock of hair hanging off the peak over his right brow (Vegito has two). The crown
  // stands up, the sides fan out over the ears, the back points down and out.
  const GOGETA_PEAK = { a: [0, 0.62, 0.78], d: [0, -1, 0.3], l: 0.062, r: 0.05, depth: 0.98, flat: 0.45 };
  const GOGETA_BANG = { a: [-0.1, 0.74, 0.66], d: [-0.2, -0.88, 0.42], l: 0.15, r: 0.036, depth: 1.0 };
  H.gogeta = {
    cap: { tilt: -0.42, sx: 1.04, sy: 1.08, sz: 1.04 },
    spikes: [
      GOGETA_PEAK,
      // the crown: tall, up and a little back
      { a: [0.12, 1, 0.12], d: [0.18, 1, -0.05], l: 0.27, r: 0.074 },
      { a: [-0.2, 1, 0.08], d: [-0.3, 1, -0.06], l: 0.29, r: 0.076 },
      // standing straight up off the peak (Vegeta's half of him)
      { a: [0.02, 0.9, 0.42], d: [0.05, 1, 0.12], l: 0.22, r: 0.064, depth: 0.96 },
      { a: [0.48, 0.86, 0.08], d: [0.75, 0.8, -0.08], l: 0.25, r: 0.07 },
      { a: [-0.55, 0.8, 0.05], d: [-0.82, 0.68, -0.06], l: 0.25, r: 0.07 },
      // the sides, fanned out over the ears (Goku's half)
      { a: [0.82, 0.45, -0.08], d: [1, 0.3, -0.2], l: 0.2, r: 0.062 },
      { a: [-0.86, 0.38, -0.08], d: [-1, 0.22, -0.22], l: 0.2, r: 0.062 },
      { a: [0.92, 0.12, -0.25], d: [1, -0.12, -0.35], l: 0.13, r: 0.052 },
      { a: [-0.94, 0.1, -0.28], d: [-1, -0.12, -0.38], l: 0.13, r: 0.052 },
      // the back
      { a: [0.3, 0.62, -0.78], d: [0.42, 0.45, -1], l: 0.21, r: 0.072 },
      { a: [-0.3, 0.58, -0.78], d: [-0.45, 0.4, -1], l: 0.21, r: 0.072 },
      { a: [0, 0.25, -1], d: [0, 0.0, -1], l: 0.17, r: 0.07 },
      { a: [0.55, 0.12, -0.8], d: [0.7, -0.25, -0.7], l: 0.14, r: 0.056 },
      { a: [-0.55, 0.12, -0.8], d: [-0.7, -0.3, -0.7], l: 0.14, r: 0.056 },
      { a: [0.72, 0.62, -0.5], d: [0.85, 0.55, -0.6], l: 0.17, r: 0.058 },
      { a: [-0.72, 0.6, -0.5], d: [-0.9, 0.5, -0.6], l: 0.17, r: 0.058 },
      // fill: a fuller crown and nape than either father's
      { a: [0.42, 0.9, 0.3], d: [0.5, 1, 0.05], l: 0.17, r: 0.058 },
      { a: [-0.42, 0.88, 0.3], d: [-0.55, 0.95, 0.04], l: 0.18, r: 0.058 },
      { a: [0.3, -0.1, -0.9], d: [0.34, -0.55, -0.8], l: 0.12, r: 0.05 },
      { a: [-0.3, -0.12, -0.9], d: [-0.36, -0.55, -0.78], l: 0.12, r: 0.05 },
      GOGETA_BANG,
    ],
  };
  // a bigger head of hair than either father's (owner's references): every spike but the peak and the lock
  H.gogeta.spikes = H.gogeta.spikes.map((s) => (s === GOGETA_PEAK || s === GOGETA_BANG ? s : { ...s, l: s.l * 1.14, r: s.r * 1.05 }));
  // ...Super Saiyan Gogeta: gold, every spike driven straight up and sharpened, taller than Goku's
  // gold and wider at the sides; the peak and the one lock stay
  H.gogeta_ssj = {
    cap: { tilt: -0.4, sx: 1.05, sy: 1.1, sz: 1.05 },
    glow: 0x3a2800,
    spikes: [
      GOGETA_PEAK,
      { a: [0, 1, 0], d: [0.05, 1, -0.18], l: 0.33, r: 0.074 },
      { a: [0, 0.6, -0.8], d: [0, 0.8, -0.75], l: 0.25, r: 0.078 },
      { a: [0, 0.1, -1], d: [0, 0.25, -1], l: 0.16, r: 0.068 },
      { a: [0, 0.9, 0.4], d: [0, 1, 0.1], l: 0.25, r: 0.06, depth: 0.95 },
      { ...GOGETA_BANG, l: 0.16, d: [-0.24, -0.86, 0.44] },
    ],
    mirror: [
      { a: [0.35, 0.95, 0], d: [0.32, 1, -0.16], l: 0.31, r: 0.068 },
      { a: [0.65, 0.72, 0], d: [0.66, 0.9, -0.18], l: 0.28, r: 0.064 },
      { a: [0.86, 0.36, -0.1], d: [0.95, 0.6, -0.22], l: 0.22, r: 0.058 },
      { a: [0.45, 0.45, -0.75], d: [0.5, 0.7, -0.75], l: 0.22, r: 0.068 },
      { a: [0.3, 0.8, 0.5], d: [0.22, 1, 0.12], l: 0.2, r: 0.054, depth: 0.95 },
      { a: [0.6, 0.2, -0.7], d: [0.7, 0.4, -0.7], l: 0.15, r: 0.054 },
      { a: [0.92, 0.05, -0.2], d: [1, 0.2, -0.3], l: 0.13, r: 0.05 },
    ],
  };

  // THE END OF Z (Age 784). Pan at four: a short, round black cut, three short locks over the brow,
  // the back cut to the nape (her bandana sits over it — outfit.headband)
  H.pan = {
    cap: { tilt: -0.3, sx: 1.06, sy: 1.08, sz: 1.08 },
    spikes: [
      { a: [0, 0.78, 0.6], d: [0, -1, 0.35], l: 0.09, r: 0.05, depth: 0.98, flat: 0.55 },
      { a: [0.28, 0.76, 0.56], d: [0.25, -1, 0.3], l: 0.085, r: 0.045, depth: 0.98, flat: 0.55 },
      { a: [-0.28, 0.76, 0.56], d: [-0.25, -1, 0.3], l: 0.085, r: 0.045, depth: 0.98, flat: 0.55 },
      { a: [0, 0.1, -0.98], d: [0, -0.8, -0.6], l: 0.1, r: 0.07, flat: 0.7 },
    ],
    mirror: [
      { a: [0.82, 0.25, 0.3], d: [0.35, -1, 0.1], l: 0.11, r: 0.05, depth: 0.98, flat: 0.7 },
      { a: [0.6, 0.0, -0.75], d: [0.7, -0.6, -0.5], l: 0.09, r: 0.05 },
    ],
  };
  // Goten at eighteen: his father's spikes cut shorter and messier, the fringe grown long over the brow
  H.goten_teen = {
    cap: { tilt: -0.5, sx: 1.02, sy: 1.02, sz: 1.02 },
    spikes: H.goku.spikes.map((s, i) => (i >= 11 && i <= 14 ? { ...s, l: s.l * 1.2 } : { ...s, l: s.l * 0.82 })),
  };
  // Trunks at nineteen: the lavender hair parted down the middle and falling to the jaw at the sides
  H.trunks_teen = {
    cap: { tilt: -0.35, sx: 1.04, sy: 1.04, sz: 1.04 },
    spikes: [
      { a: [0, 0.9, 0.35], d: [0, 0.4, 0.7], l: 0.06, r: 0.055, flat: 0.7 },
      { a: [0, 0.45, -0.9], d: [0, -1, -0.45], l: 0.17, r: 0.075, flat: 0.55 },
    ],
    mirror: [
      { a: [0.22, 0.78, 0.6], d: [0.36, -1, 0.3], l: 0.15, r: 0.045, depth: 1, flat: 0.6 },
      { a: [0.5, 0.8, 0.3], d: [0.35, -0.3, 0.6], l: 0.1, r: 0.05, flat: 0.7 },
      { a: [0.9, 0.2, -0.15], d: [0.5, -1, -0.12], l: 0.17, r: 0.06, flat: 0.55 },
      { a: [0.6, 0.15, -0.75], d: [0.4, -1, -0.5], l: 0.16, r: 0.06, flat: 0.55 },
    ],
  };

  // Goten: his father's silhouette on a seven-year-old's skull.
  H.goten = {
    cap: { tilt: -0.55, sx: 1.02, sy: 1.02, sz: 1.02 },
    spikes: [
      { a: [0.12, 1, 0.1], d: [0.2, 1, -0.2], l: 0.17, r: 0.06 },
      { a: [-0.22, 1, 0.05], d: [-0.4, 0.95, -0.15], l: 0.19, r: 0.064 },
      { a: [0, 0.25, -1], d: [0, -0.05, -1], l: 0.13, r: 0.058 },
      { a: [-0.05, 0.72, 0.68], d: [-0.15, -0.72, 0.6], l: 0.1, r: 0.036, depth: 1 },
    ],
    mirror: [
      { a: [0.52, 0.85, 0], d: [0.85, 0.6, -0.12], l: 0.2, r: 0.062 },
      { a: [0.82, 0.4, -0.12], d: [1, 0.1, -0.2], l: 0.16, r: 0.056 },
      { a: [0.3, 0.6, -0.8], d: [0.42, 0.3, -1], l: 0.16, r: 0.06 },
      { a: [0.34, 0.7, 0.6], d: [0.3, -0.7, 0.58], l: 0.09, r: 0.034, depth: 1 },
    ],
  };

  // Goten as a Super Saiyan: the same head, standing straight up.
  H.goten_ssj = {
    cap: { tilt: -0.2, sx: 1.04, sy: 1.1, sz: 1.04 },
    spikes: [
      { a: [0, 1, 0.05], d: [0, 1, 0.05], l: 0.3, r: 0.07 },
      { a: [0.2, 0.96, -0.1], d: [0.28, 1, -0.2], l: 0.26, r: 0.062 },
      { a: [-0.22, 0.95, -0.08], d: [-0.3, 1, -0.18], l: 0.26, r: 0.062 },
      { a: [0, 0.4, -0.9], d: [0.05, 0.75, -0.7], l: 0.2, r: 0.058 },
      { a: [-0.05, 0.74, 0.66], d: [-0.12, 0.2, 0.9], l: 0.12, r: 0.036, depth: 1 },
    ],
    mirror: [
      { a: [0.58, 0.8, 0], d: [0.7, 0.92, -0.1], l: 0.24, r: 0.06 },
      { a: [0.86, 0.4, -0.1], d: [0.86, 0.72, -0.2], l: 0.2, r: 0.054 },
      { a: [0.36, 0.72, 0.58], d: [0.42, 0.25, 0.8], l: 0.12, r: 0.036, depth: 1 },
    ],
  };

  // Kid Trunks: his mother's colour, cut in a straight fringe.
  H.trunks_kid = {
    cap: { tilt: -0.3, sx: 1.05, sy: 1.02, sz: 1.06 },
    spikes: [
      { a: [0, 0.92, 0.3], d: [0, 0.3, 0.75], l: 0.08, r: 0.055, flat: 0.75 },
      { a: [0, 0.4, -0.92], d: [0, -0.7, -0.7], l: 0.14, r: 0.062, flat: 0.6 },
      { a: [-0.05, 0.74, 0.66], d: [-0.08, -1, 0.35], l: 0.12, r: 0.05, depth: 1, flat: 0.6 },
    ],
    mirror: [
      { a: [0.5, 0.82, 0.28], d: [0.42, -0.3, 0.7], l: 0.1, r: 0.05, flat: 0.7 },
      { a: [0.88, 0.25, -0.15], d: [0.7, -0.85, -0.15], l: 0.14, r: 0.055, flat: 0.6 },
      { a: [0.36, 0.72, 0.6], d: [0.34, -1, 0.42], l: 0.11, r: 0.045, depth: 1, flat: 0.6 },
    ],
  };

  // Kid Trunks as a Super Saiyan: the fringe lifts and the back stands up.
  H.trunks_kid_ssj = {
    cap: { tilt: -0.1, sx: 1.05, sy: 1.08, sz: 1.05 },
    spikes: [
      { a: [0, 1, 0.1], d: [0, 1, 0.2], l: 0.24, r: 0.066 },
      { a: [0, 0.45, -0.9], d: [0, 0.6, -0.85], l: 0.2, r: 0.06 },
      { a: [-0.06, 0.76, 0.62], d: [-0.1, 0.45, 0.9], l: 0.13, r: 0.04, depth: 1 },
    ],
    mirror: [
      { a: [0.54, 0.84, 0.06], d: [0.62, 0.9, -0.05], l: 0.22, r: 0.06 },
      { a: [0.84, 0.36, -0.14], d: [0.8, 0.66, -0.24], l: 0.18, r: 0.054 },
      { a: [0.38, 0.74, 0.56], d: [0.44, 0.4, 0.82], l: 0.12, r: 0.038, depth: 1 },
    ],
  };

  // GOTENKS: Goten's spikes behind and up, Trunks' parted fringe in front — two boys' hair on one head
  H.gotenks = {
    cap: { tilt: -0.45, sx: 1.05, sy: 1.08, sz: 1.06 },
    spikes: [
      { a: [0.1, 1, 0.05], d: [0.15, 1, -0.1], l: 0.22, r: 0.065 },
      { a: [-0.2, 0.98, 0], d: [-0.3, 1, -0.12], l: 0.22, r: 0.064 },
      { a: [0, 0.3, -1], d: [0, 0.1, -1], l: 0.15, r: 0.06 },
      { a: [-0.05, 0.74, 0.66], d: [-0.3, -0.9, 0.45], l: 0.1, r: 0.04, depth: 1, flat: 0.6 },
    ],
    mirror: [
      { a: [0.52, 0.85, 0], d: [0.8, 0.75, -0.12], l: 0.22, r: 0.062 },
      { a: [0.84, 0.4, -0.12], d: [1, 0.25, -0.2], l: 0.17, r: 0.056 },
      { a: [0.32, 0.6, -0.78], d: [0.45, 0.45, -0.95], l: 0.17, r: 0.06 },
      { a: [0.36, 0.72, 0.58], d: [0.4, -0.95, 0.42], l: 0.11, r: 0.042, depth: 1, flat: 0.6 },
    ],
  };
  // Gotenks as a Super Saiyan: everything straight up and taller than either boy's
  H.gotenks_ssj = {
    cap: H.goten_ssj.cap,
    glow: 0x3a2800,
    spikes: H.goten_ssj.spikes.map((s) => ({ ...s, l: s.l * 1.16 })),
    mirror: H.goten_ssj.mirror.map((s) => ({ ...s, l: s.l * 1.16, d: [s.d[0] * 1.15, s.d[1], s.d[2]] })),
  };
  // and Super Saiyan 3: the same mane Goku grows, on a child's head
  H.gotenks_ssj3 = H.goku_ssj3;

  // Videl before the haircut (rebuilt 2026-09-25 from the owner's references): straight bangs to the
  // brows, a lock down each side of the face, and two long tails tied low behind the ears (the ties
  // are gold) that hang over the shoulders to the chest
  H.videl = {
    cap: { tilt: -0.28, sx: 1.05, sy: 1.1, sz: 1.06 },
    spikes: [
      // the bangs: straight, down to the brows
      { a: [0, 0.82, 0.56], d: [0, -1, 0.28], l: 0.095, r: 0.052, depth: 0.98, flat: 0.5 },
      { a: [0.24, 0.8, 0.54], d: [0.1, -1, 0.3], l: 0.09, r: 0.046, depth: 0.98, flat: 0.5 },
      { a: [-0.24, 0.8, 0.54], d: [-0.1, -1, 0.3], l: 0.09, r: 0.046, depth: 0.98, flat: 0.5 },
      // the back of the head, smooth to the nape
      { a: [0, 0.3, -0.95], d: [0, -1, -0.25], l: 0.09, r: 0.07, flat: 0.6 },
    ],
    mirror: [
      // a lock down each side of the face
      { a: [0.78, 0.38, 0.42], d: [0.14, -1, 0.16], l: 0.13, r: 0.034, depth: 0.98, flat: 0.55 },
      // the ties, gold, low behind the ears
      { a: [0.86, -0.12, -0.42], d: [0.4, -0.2, -0.3], l: 0.05, r: 0.028, shape: 'ball', depth: 1.06, color: 0xe0b83a },
      // the tails: full at the tie, tapering over the shoulder to the chest
      { a: [0.88, -0.2, -0.42], d: [0.22, -1, 0.18], l: 0.34, r: 0.056, depth: 1.06, flat: 0.78 },
      { a: [0.84, -0.1, -0.5], d: [0.35, -1, 0.05], l: 0.2, r: 0.06, depth: 1.02, flat: 0.8 },
    ],
  };
  // ...after the haircut Gohan suggested (flying lessons, the tournament): short, the ends flicking
  // out at the jaw and the nape, the bangs kept
  H.videl_short = {
    cap: { tilt: -0.28, sx: 1.07, sy: 1.12, sz: 1.08 },
    spikes: [
      { a: [0, 0.82, 0.56], d: [0, -1, 0.3], l: 0.1, r: 0.05, depth: 0.98, flat: 0.55 },
      { a: [0.26, 0.8, 0.52], d: [0.2, -1, 0.3], l: 0.095, r: 0.045, depth: 0.98, flat: 0.55 },
      { a: [-0.26, 0.8, 0.52], d: [-0.2, -1, 0.3], l: 0.095, r: 0.045, depth: 0.98, flat: 0.55 },
      { a: [0, 0.1, -0.98], d: [0, -0.9, -0.55], l: 0.12, r: 0.07, flat: 0.7 },
    ],
    mirror: [
      { a: [0.8, 0.3, 0.32], d: [0.3, -1, 0.1], l: 0.12, r: 0.046, depth: 0.98, flat: 0.7 },
      { a: [0.9, 0.0, -0.25], d: [0.75, -0.75, -0.2], l: 0.11, r: 0.05 },
      { a: [0.55, -0.05, -0.8], d: [0.5, -0.75, -0.65], l: 0.11, r: 0.052 },
      { a: [0.5, 0.85, 0.15], d: [0.75, 0.4, 0.2], l: 0.05, r: 0.05, flat: 0.6 },
    ],
  };
  // ...years later (Dragon Ball Super): a straight bob to the jaw, blunt bangs, a headband over it
  H.videl_bob = {
    cap: { tilt: -0.26, sx: 1.08, sy: 1.1, sz: 1.08 },
    spikes: [
      { a: [0, 0.8, 0.58], d: [0, -1, 0.2], l: 0.09, r: 0.06, depth: 0.99, flat: 0.45 },
      { a: [0.3, 0.78, 0.55], d: [0.05, -1, 0.22], l: 0.085, r: 0.05, depth: 0.99, flat: 0.45 },
      { a: [-0.3, 0.78, 0.55], d: [-0.05, -1, 0.22], l: 0.085, r: 0.05, depth: 0.99, flat: 0.45 },
      { a: [0, 0.2, -0.97], d: [0, -1, -0.2], l: 0.13, r: 0.08, flat: 0.7 },
    ],
    mirror: [
      { a: [0.84, 0.25, 0.2], d: [0.18, -1, 0.05], l: 0.15, r: 0.06, depth: 0.98, flat: 0.65 },
      { a: [0.7, 0.15, -0.65], d: [0.25, -1, -0.2], l: 0.14, r: 0.07, flat: 0.7 },
    ],
  };

  // hair kept flat under a helmet: only the skull cap, which sits inside the dome
  H.cropped = { cap: { tilt: -0.5, sx: 0.98, sy: 0.96, sz: 0.98 }, spikes: [] };

  /* ---- Buu saga, Milestone B ---- */

  // Supreme Kai: a white crest standing up from the crown, short at the sides.
  H.kai_mohawk = {
    cap: { tilt: -0.2, sx: 0.5, sy: 1.02, sz: 1.02, partial: true },
    spikes: [
      { a: [0, 1, 0.45], d: [0, 1, 0.55], l: 0.12, r: 0.05, flat: 0.45 },
      { a: [0, 1, 0.1], d: [0, 1, 0.1], l: 0.15, r: 0.056, flat: 0.45 },
      { a: [0, 0.92, -0.35], d: [0, 1, -0.35], l: 0.13, r: 0.052, flat: 0.45 },
      { a: [0, 0.6, -0.8], d: [0, 0.6, -0.9], l: 0.1, r: 0.048, flat: 0.45 },
    ],
  };

  // Uub (the End of Z): a short black mohawk from the forehead to the nape, the sides shaved to the
  // skin — blunt and a little forward at the front, nothing like the Kai's tall white crest
  H.uub = {
    cap: { tilt: -0.78, sx: 0.46, sy: 1.2, sz: 1.08, partial: true },
    spikes: [
      { a: [0, 0.86, 0.48], d: [0, 0.7, 0.7], l: 0.04, r: 0.05, flat: 0.55 },
      { a: [0, 1, 0.12], d: [0, 1, 0.12], l: 0.045, r: 0.055, flat: 0.55 },
      { a: [0, 0.94, -0.3], d: [0, 0.9, -0.4], l: 0.042, r: 0.052, flat: 0.55 },
      { a: [0, 0.62, -0.76], d: [0, 0.4, -0.9], l: 0.036, r: 0.048, flat: 0.55 },
    ],
  };

  // Kibito: long straight white hair to the shoulders, parted in the middle.
  H.kibito = {
    cap: { tilt: -0.4, sx: 1.05, sy: 1.02, sz: 1.06 },
    spikes: [
      { a: [0, 0.5, -0.88], d: [0, -1, -0.25], l: 0.26, r: 0.09, flat: 0.55 },
    ],
    mirror: [
      { a: [0.8, 0.35, -0.3], d: [0.25, -1, -0.1], l: 0.28, r: 0.07, flat: 0.55 },
      { a: [0.55, 0.62, 0.55], d: [0.5, -0.9, 0.3], l: 0.16, r: 0.05, depth: 1, flat: 0.6 },
    ],
  };

  // Dabura: white hair swept straight back from a widow's peak.
  H.dabura = {
    cap: { tilt: -0.5, sx: 1.02, sy: 1.0, sz: 1.04 },
    spikes: [
      { a: [0, 0.8, 0.5], d: [0, 0.35, -1], l: 0.14, r: 0.06, flat: 0.6 },
      { a: [0, 0.6, -0.78], d: [0, -0.3, -1], l: 0.12, r: 0.06, flat: 0.6 },
    ],
    mirror: [
      { a: [0.5, 0.75, 0.3], d: [0.35, 0.2, -1], l: 0.13, r: 0.055, flat: 0.6 },
      { a: [0.85, 0.3, -0.3], d: [0.6, -0.4, -0.8], l: 0.11, r: 0.05, flat: 0.6 },
    ],
  };

  // Mr. Satan: a big black afro.
  H.satan = {
    cap: { tilt: -0.3, sx: 1.18, sy: 1.14, sz: 1.2 },
    spikes: [
      { a: [0, 1, 0], d: [0, 1, 0], l: 0.08, r: 0.13, flat: 1 },
      { a: [0, 0.5, -0.86], d: [0, 0.3, -1], l: 0.08, r: 0.12, flat: 1 },
    ],
    mirror: [
      { a: [0.7, 0.7, 0], d: [0.8, 0.6, 0], l: 0.08, r: 0.12, flat: 1 },
      { a: [0.5, 0.8, 0.4], d: [0.5, 0.8, 0.3], l: 0.07, r: 0.1, flat: 1 },
      { a: [0.6, 0.6, -0.55], d: [0.6, 0.4, -0.7], l: 0.08, r: 0.11, flat: 1 },
    ],
  };

  // bald: nothing but the shape of the skull
  H.bald = { cap: { tilt: -0.5, sx: 0.001, sy: 0.001, sz: 0.001, partial: true }, spikes: [] };

  /**
   * The Majin mark: Babidi's "M", painted on the forehead as four flat strokes.
   * A look can carry it (`look.headExtras`), so a form or a story state can put it
   * on and take it off without touching the model. `extra` is any other head
   * extras the character already has (horns, antennae), kept alongside.
   */
  SL.data.majinMark = function (color = 0x141414, extra = []) {
    // on the forehead just above the brows: two uprights, and from their tops two strokes meeting
    // low in the middle (strokes lie along the skin, see ModelBuilder._spike)
    const s = { shape: 'bar', r: 0.013, flat: 0.25, depth: 1.006, color };
    return extra.concat([
      Object.assign({ a: [-0.2, 0.32, 0.93], d: [0, 1, 0], l: 0.034 }, s),
      Object.assign({ a: [0.2, 0.32, 0.93], d: [0, 1, 0], l: 0.034 }, s),
      Object.assign({ a: [-0.2, 0.59, 0.78], d: [0.2, -0.23, 0.15], l: 0.04 }, s),
      Object.assign({ a: [0.2, 0.59, 0.78], d: [-0.2, -0.23, 0.15], l: 0.04 }, s),
    ]);
  };

  /**
   * The Majin face (Vegeta under the mark): hard creases under the eyes, painted on like the mark
   * (shape 'line', so they are not counted as it). The furrow between the brows is the M's place.
   */
  SL.data.majinFace = function (color = 0x2a1a1a) {
    const s = { shape: 'line', r: 0.006, flat: 0.25, depth: 1.004, color };
    const out = [];
    for (const k of [1, -1]) {
      out.push(Object.assign({ a: [k * 0.3, -0.1, 0.95], d: [k * 1, 0.28, 0.08], l: 0.032 }, s));
    }
    return out;
  };

})();
