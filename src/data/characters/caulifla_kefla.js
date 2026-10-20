/*
 * CAULIFLA and KEFLA — playable in Free Battle and Training (their story debut belongs to the Tournament of Power,
 * not built). Level 1 functional prototypes built from the owner's custom character sheet (front / side / back, base
 * and Super Saiyan portraits, colour swatches).
 *
 *   CAULIFLA  lean and athletic, narrow shoulders, a slim waist; a huge wild crown of black spikes radiating up and
 *             out, long side spikes past the shoulders, a big mass at the back, a few bangs; a confident smirk, dark
 *             brown eyes. Magenta strapless bandeau, bare midriff, very baggy purple harem trousers gathered at the
 *             ankle, dark grey wrist guards and dark slip-on shoes. SUPER SAIYAN: the same spikes, fuller and taller,
 *             pale gold; teal eyes.
 *             FIGHTS fast and close: quick four-hit strings, a darting dash, compact pink ki volleys, a mobile rush.
 *   KEFLA     visibly stronger: broader shoulders, defined arms and thighs, a wider stance; a larger, denser crown of
 *             black spikes swept upward with a heavy back mass; green Potara earrings on both ears. Burgundy sleeveless
 *             crop top, fitted burgundy leggings, gold wrist cuffs, white mid-calf boots with gold toe caps.
 *             SUPER SAIYAN: lime-green hair, taller and spikier; teal eyes.
 *             FIGHTS heavy and explosive: slower, harder strings, armoured rushes, green energy (a homing cannon,
 *             the Blaster Meteor scatter, the Gigantic Ray).
 * Kefla is selected directly; her fusion (with Kale) is later work and is not invented here.
 */
(function () {
  'use strict';
  const H = SL.data.hair;
  const C = SL.data.poses;

  /* ======================================================================== HAIR (hand-shaped from the sheet's three views) */
  // Each style is authored group by group — crown, upper sides, lower sides, back, front crown, bangs, side locks — so
  // the silhouette overlaps in depth instead of radiating as one starburst. No blanket length multipliers.
  // a spike and its mirror on the other side of the head
  const M = (a, d, l, r, o) => [Object.assign({ a, d, l, r }, o || {}), Object.assign({ a: [-a[0], a[1], a[2]], d: [-d[0], d[1], d[2]], l, r }, o || {})];
  const bang = (a, d, l, r) => ({ a, d, l, r, depth: 1.0 });
  // CAULIFLA: a tall, ragged crown pointing up and slightly back; the sides go UP-and-out (the sheet's front view),
  // only short ones lie flatter; a compact back mass; bangs frame the forehead and leave the eyes clear
  const cauli = (lift, len) => [
    // crown
    { a: [0, 1, 0.1], d: [0.05, 1, -0.15 - lift * 0.1], l: 0.27 * len, r: 0.075 },
    { a: [0.3, 0.95, 0.15], d: [0.35, 1 + lift, -0.05], l: 0.25 * len, r: 0.07 },
    { a: [-0.3, 0.95, 0.15], d: [-0.4, 1 + lift, -0.05], l: 0.25 * len, r: 0.07 },
    ...M([0.15, 0.9, -0.4], [0.15, 1 + lift, -0.55], 0.25 * len, 0.072),
    // upper sides: up and out at about 45 degrees
    ...M([0.6, 0.75, 0.05], [0.75, 0.8 + lift, -0.1], 0.22 * len, 0.066),
    ...M([0.62, 0.6, -0.42], [0.75, 0.62 + lift, -0.55], 0.21 * len, 0.064),
    // lower sides: short, a little out, framing the face without fanning wide
    ...M([0.86, 0.3, -0.2], [0.9, 0.25 + lift * 0.5, -0.4], 0.19, 0.06),
    // the back mass
    { a: [0, 0.45, -0.92], d: [0, 0.3 + lift * 0.4, -1], l: 0.22 * len, r: 0.078 },
    ...M([0.42, 0.28, -0.86], [0.5, 0.05 + lift * 0.3, -0.9], 0.19, 0.068),
    ...M([0.25, -0.1, -0.95], [0.28, -0.5, -0.8], 0.15, 0.06),
    { a: [0, -0.2, -1], d: [0, -0.6, -0.8], l: 0.14, r: 0.062 },
    // the swept-up front crown over the forehead
    { a: [0.1, 0.85, 0.5], d: [0.15, 1, 0.3], l: 0.2 * len, r: 0.062 },
    { a: [-0.25, 0.8, 0.5], d: [-0.35, 1, 0.25], l: 0.19 * len, r: 0.06 },
    // bangs: four short points over the brow, apart in the middle
    bang([0.16, 0.62, 0.76], [0.12, -0.85, 0.45], 0.085, 0.03),
    bang([-0.19, 0.62, 0.76], [-0.16, -0.85, 0.45], 0.09, 0.031),
    bang([0.46, 0.55, 0.68], [0.42, -0.8, 0.35], 0.095, 0.032),
    bang([-0.48, 0.52, 0.66], [-0.46, -0.8, 0.3], 0.095, 0.032),
    // side locks in front of the ears, down to the cheek
    ...M([0.82, 0.18, 0.45], [0.32, -1, 0.15], 0.12, 0.036, { depth: 1.0 }),
  ];
  // KEFLA: a bigger, heavier mane — a broad crown swept UP (the sheet's tall silhouette), wide upper sides, and long
  // strands falling down the back past the neck (the sheet's back view); fuller bangs, longer side locks
  const kef = (lift, len) => [
    { a: [0, 1, 0.05], d: [0, 1, -0.2], l: 0.3 * len, r: 0.085 },
    ...M([0.28, 0.95, 0.1], [0.32, 1 + lift, -0.1], 0.29 * len, 0.08),
    ...M([0.2, 0.88, -0.42], [0.25, 1 + lift, -0.6], 0.28 * len, 0.08),
    ...M([0.58, 0.72, 0], [0.7, 0.9 + lift, -0.15], 0.26 * len, 0.076),
    ...M([0.7, 0.5, -0.35], [0.85, 0.6 + lift, -0.5], 0.24 * len, 0.072),
    ...M([0.86, 0.22, -0.2], [0.92, 0.1 + lift * 0.4, -0.45], 0.24, 0.068),
    // long strands down the back
    { a: [0, 0.3, -1], d: [0, -0.35, -1], l: 0.28, r: 0.09 },
    ...M([0.4, 0.2, -0.9], [0.45, -0.45, -0.85], 0.27, 0.08),
    ...M([0.25, -0.15, -0.95], [0.22, -0.85, -0.5], 0.27, 0.07),
    { a: [0, -0.3, -0.95], d: [0, -0.9, -0.45], l: 0.25, r: 0.07 },
    // the front crown, swept up and back
    { a: [0.05, 0.85, 0.5], d: [0.05, 1, 0.3], l: 0.24 * len, r: 0.07 },
    ...M([0.36, 0.78, 0.45], [0.45, 1, 0.2], 0.21 * len, 0.064),
    // bangs: three fuller points
    // (set higher and shorter so the tips stop above the brows and frame the eyes instead of covering them)
    bang([0.0, 0.7, 0.72], [0, -0.75, 0.55], 0.075, 0.034),
    bang([0.36, 0.64, 0.68], [0.42, -0.75, 0.5], 0.08, 0.033),
    bang([-0.38, 0.64, 0.68], [-0.44, -0.75, 0.48], 0.08, 0.033),
    // longer side locks to the jaw, in front of the Potara earrings
    ...M([0.82, 0.12, 0.48], [0.3, -1, 0.2], 0.15, 0.04, { depth: 1.0 }),
  ];
  // Super Saiyan: the same groups standing taller and steeper (the portraits), the bangs and locks unchanged
  H.caulifla = { cap: { tilt: -0.5 }, spikes: cauli(0, 1.28) };
  H.caulifla_ssj = { cap: { tilt: -0.5 }, spikes: cauli(0.35, 1.4) };
  H.caulifla_ssj2 = { cap: { tilt: -0.5 }, spikes: cauli(0.55, 1.55) };
  H.kefla = { cap: { tilt: -0.5 }, spikes: kef(0, 1.34) };
  H.kefla_ssj = { cap: { tilt: -0.5 }, spikes: kef(0.45, 1.48) };
  H.kefla_ssj2 = { cap: { tilt: -0.5 }, spikes: kef(0.62, 1.62) };

  /* ======================================================================== POSES */
  const P = {
    // Caulifla: low, loose, one hand beckoning — "come on, then"
    cf_stance: (t) => {
      const b = Math.sin(t * 2.6);
      return { root: { y: -0.06 + b * 0.01 }, hips: [0, -14, 0], spine: [6, -6, 0], chest: [6, -10, 0], head: [-6, 14, 4], shoulderL: [-60, -10, 24], elbowL: [-100, 0, 0], shoulderR: [-30, 20, -30], elbowR: [-70, 0, 0], handR: [-20, 0, 0], thighL: [-24, 10, 14], kneeL: [32 + b * 2, 0, 0], thighR: [14, -10, -14], kneeR: [26 + b * 2, 0, 0], hands: ['fist', 'open'] };
    },
    cf_intro: { root: { y: 0 }, hips: [0, 10, 6], spine: [-2, 6, -2], chest: [-4, 8, 0], head: [-6, -10, 8], shoulderL: [-14, 0, 50], elbowL: [-100, 0, 0], shoulderR: [-120, 0, -20], elbowR: [-40, 0, 0], thighL: [-2, 4, 8], kneeL: [6, 0, 0], thighR: [4, -8, -12], kneeR: [14, 0, 0], hands: ['fist', 'point'] },
    cf_victory: { root: { y: 0 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-10, 8, 0], shoulderL: [-150, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-14, 0, -50], elbowR: [-100, 0, 0], thighL: [-2, 0, 10], kneeL: [4, 0, 0], thighR: [-2, 0, -10], kneeR: [4, 0, 0], hands: ['fist', 'fist'] },
    // Kefla: square, wide and heavy, the fists low and ready
    kf_stance: (t) => {
      const b = Math.sin(t * 1.8);
      return { root: { y: -0.1 + b * 0.008 }, hips: [0, -8, 0], spine: [8, -4, 0], chest: [8, -6, 0], head: [-8, 8, 0], shoulderL: [-40, -10, 30], elbowL: [-80, 0, 0], shoulderR: [-40, 10, -30], elbowR: [-80, 0, 0], thighL: [-30, 6, 20], kneeL: [38 + b, 0, 0], thighR: [-10, -6, -20], kneeR: [34 + b, 0, 0], hands: ['fist', 'fist'] };
    },
    kf_intro: { root: { y: 0 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-6, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-60, 0, 0], thighL: [-6, 0, 18], kneeL: [6, 0, 0], thighR: [-6, 0, -18], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
    kf_victory: { root: { y: 0 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0], shoulderL: [-160, 0, 30], elbowL: [-10, 0, 0], shoulderR: [-160, 0, -30], elbowR: [-10, 0, 0], thighL: [-6, 0, 16], kneeL: [6, 0, 0], thighR: [-6, 0, -16], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
  };
  Object.assign(C, P);

  const SKIN = 0xf2c8a0, BROWN = 0x3a2412, TEAL = 0x18b8b0;
  const potara = (s) => ({ shape: 'ball', a: [s * 0.98, -0.25, 0.05], d: [0, -1, 0], l: 0.02, r: 0.03, color: 0x2aa83a, depth: 1.03, flat: 1, outline: 0.4 });
  const ssjSequence = (rise, burstPose) => ({
    length: 120, applyAt: 76,
    steps: [
      { at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.35, auraColor: 0xffffff, shot: 'orbit', music: 0, sfx: 'kiUp' },
      { at: 36, pose: rise, speed: 8, expression: 'shout', aura: 0.9, sfx: 'ssjRise', hairFlicker: true, lightning: true },
      { at: 76, burst: true, pose: burstPose, speed: 16, expression: 'shout', sfx: 'transformBurst', flash: 0.7, crater: 3, hairFlicker: false, lightning: false },
      { at: 96, pose: rise, speed: 5, expression: 'smirk', shot: 'face' },
    ],
  });

  /* ======================================================================== CAULIFLA */
  SL.data.characters.caulifla = {
    id: 'caulifla', assetLevel: 1, name: 'Caulifla', fullName: 'Caulifla (Universe 6)', era: 'Super',
    playable: true, prototype: true, style: 'Rebel Prodigy',
    blurb: 'A Saiyan of Universe 6 who never asked anybody\'s permission — and learned Super Saiyan in a single afternoon.',
    card: ['Universe 6', 'Saiyan Instinct'],
    ratings: { power: 3, speed: 5, ki: 3, defense: 2 },
    stats: { hp: 16000, ki: 130, stamina: 150, speed: 1.2, power: 1.0, defense: 0.85, weight: 0.8, kiRegen: 3, chargeRate: 34, canonPower: 2 },
    appearance: {
      height: 0.9, skin: SKIN,
      build: {
        // slim and agile: narrow waist under a slight chest, hips a little wider than the waist, slender arms and
        // small shoulder joints. The fuller bust is the chest's own depth (chestD), one smooth shape under the bandeau;
        // bust 0.62 keeps the two bust spheres just inside it (measured: they show above 0.638). Fuller upper thighs
        // inside the trousers (thighR; harem.thigh lowered so the trousers keep their width)
        chestW: 0.17, chestD: 0.138, chestTop: 0.27, shoulderX: 0.172, shoulderY: 0.22, delt: 0.048,
        waistW: 0.098, waistD: 0.084, absLen: 0.2, pelvisW: 0.158, pelvisH: 0.11, pelvisD: 0.118, hipX: 0.088,
        upperArmR: 0.039, foreArmR: 0.034, fist: 0.043, thighR: 0.086, shinR: 0.055, neckR: 0.038, neckLen: 0.07, headR: 0.13, footLen: 0.86, bust: 0.62,
      },
      hair: { style: 'caulifla', color: 0x141418 },
      // the face, measured against the rendered skull: skullY lifts the cranium so the narrower jaw (jaw / jawW) forms
      // a tapered lower face and chin; mouthY / mouthZ put the mouth ~1 mm proud of the skin (at headR 0.13 the default
      // mouth sat 3.6 mm inside the skull); wide, low almond eyes under heavy brows; the smirk is the global expression
      face: { pupil: BROWN, eyeX: 0.049, eyeW: 1.38, eyeH: 0.64, eyeTilt: 0.17, lashWing: true, skull: [0.94, 0.96, 1], skullY: 0.05, jaw: 1.2, jawW: 0.72, cheeks: 0, nose: 0.8, browThick: 1.35, browW: 1.08, browY: -0.004, brow: 0x141418, mouthColor: 0x7a2836, mouthY: -0.006, mouthZ: 0.8, smileArc: { z: 0.003 } },
      outfit: {
        // the strapless magenta bandeau: the top over the chest only, bare shoulders and midriff
        topStyle: 'shirt', top: SKIN, sleeves: 'none', arms: SKIN, abs: SKIN,
        bandeau: { color: 0xc8306a, top: 0.262, h: 0.145 },
        wrist: 0x3a3a42, wristLen: 0.12,
        pants: 0x6a2a9a, pantsStyle: 'harem', harem: { thigh: 1.49, balloon: 1.75, at: 0.5, cuff: 0.9 }, legs: SKIN,
        boots: 0x3a3a42, shoes: 0x3a3a42, bootStyle: 'shoe', bootTop: 0.16,
      },
      portraitColor: '#c8306a',
    },
    vfx: { ghost: 0xffb0d8 },
    audio: { strikePitch: 1.25, heavyPitch: 1.15 },
    forms: [
      // restFace: her resting face in a fight — the mischievous smirk (fights and hurts still show through)
      { id: 'base', name: 'Base', aura: { color: 0xffd8ea, core: 0xffffff, particles: 0xffc0e0 }, mult: {}, restFace: 'smirk' },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 40, style: 'full',
        mult: { damage: 1.38, speed: 1.16, defense: 1.18, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.8 },
        aura: { color: 0xffd23a, core: 0xfff4b0, particles: 0xffe060, idle: 0.14, speed: 1.2, sharp: 0.2 },
        look: { hair: { style: 'caulifla_ssj', color: 0xf6dc6a }, pupil: TEAL, brow: 0xe8c040, bulk: 1.02 }, restFace: 'smirk',
        // gold: the strings come faster and she chases into the air
        ai: { personality: 'aggressive', aggression: 0.92, defense: 0.4, ranged: 0.25, beam: 0.3, preferredRange: 1.6, rhythm: { burst: 4, rest: 30 } },
        ghost: 0xffe27a, music: 3,
        sequence: ssjSequence('cf_victory', 'powerUp'),
      },
      {
        // SUPER SAIYAN 2 (the Tournament of Power: Goku shows it to her once, and she has it): the spikes taller and
        // sharper, blue lightning in a brighter gold aura. Story-given by top_saiyans.
        id: 'ssj2', name: 'Super Saiyan 2', short: 'SUPER SAIYAN 2', kiCost: 55, style: 'full',
        freeUnlock: ['top_saiyans'],
        mult: { damage: 1.72, speed: 1.3, defense: 1.34, kiRegen: 2.3, chargeRate: 1.45, guardStamina: 0.75 },
        aura: { color: 0xffe25a, core: 0xffffff, particles: 0xfff3a0, idle: 0.5, speed: 1.6, sharp: 0.5, sparks: 0xbfe4ff, lightning: true },
        look: { hair: { style: 'caulifla_ssj2', color: 0xfae070 }, pupil: TEAL, brow: 0xe8c040, bulk: 1.03 }, restFace: 'smirk',
        // the second level: she pushes harder and overcommits — a string that hits air leaves her open (whiffBreath)
        ai: { personality: 'berserker', aggression: 0.96, defense: 0.32, ranged: 0.3, beam: 0.35, preferredRange: 1.5, whiffBreath: 16, rhythm: { burst: 6, rest: 34 } },
        ghost: 0xffe27a, music: 4,
      },
    ],
    poses: Object.assign({ idle: P.cf_stance }, P),
    moves: {
      // fast and close: four quick strikes, short recoveries
      light: [
        { id: 'cfJab', startup: 3, active: 2, recovery: 8, cancel: 5, damage: 360, reach: 1.1, radius: 0.7, lunge: 14, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cfCross', startup: 3, active: 2, recovery: 8, cancel: 5, damage: 380, reach: 1.1, radius: 0.7, lunge: 14, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'cfKnee', startup: 4, active: 3, recovery: 9, cancel: 5, damage: 420, reach: 1.0, radius: 0.75, lunge: 14, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'cfSpin', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 560, reach: 1.4, radius: 0.85, lunge: 15, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'cfHeel', startup: 9, active: 4, recovery: 18, damage: 1200, reach: 1.35, radius: 0.95, lunge: 16, hitstun: 32, knock: 'smash', knockSpeed: 28, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'cfRise', startup: 8, active: 4, recovery: 16, damage: 900, reach: 1.2, radius: 0.9, lunge: 14, hitstun: 30, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'cfDart', startup: 3, active: 7, recovery: 12, damage: 800, reach: 1.3, radius: 0.9, lunge: 44, hitstun: 24, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'cfToss', name: 'Over the Shoulder', damage: 800, knockSpeed: 26, poses: ['grab', 'uppercutWind', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'crushCannon', name: 'Crush Cannon', type: 'projectile', kiCost: 20, icon: 'ball', cooldown: 70,
        startup: 8, recovery: 12, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 88, radius: 0.5, damage: 1100, homing: 0.4, color: 0xff5ab8, core: 0xffe0f0, explode: 2.6, knock: 'push', knockSpeed: 16, impact: 2, life: 2 },
      },
      special2: {
        id: 'rebelRush', name: 'Rebel Rush', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 4, dashFrames: 14, speed: 60, recovery: 16,
        poses: { wind: 'punchWindR' },
        hits: [
          { pose: 'punchL', damage: 480, frames: 5, sfx: 'punchLight' },
          { pose: 'punchR', damage: 500, frames: 5, sfx: 'punchLight' },
          { pose: 'kickR', damage: 620, frames: 7, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 1300, frames: 12, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 30, impact: 3 },
        ],
      },
      ultimate: {
        id: 'giganticBurst', name: 'Gigantic Burst', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [6200, 6200], radius: [1.6, 1.6], speed: 112, range: 160, sustain: 44,
        color: 0xff4ab0, core: 0xfff0f8, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 36, cinematic: true,
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'A born fighter: vanishing and Perfect Guards sharpen her next strikes.' },
    ai: { personality: 'aggressive', aggression: 0.88, defense: 0.45, ranged: 0.3, beam: 0.3, transformHp: 0.6, preferredRange: 1.8 },
    intro: { pose: 'cf_intro', expression: 'smirk' },
    victory: { poses: ['cf_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'angry' },
  };

  /* ======================================================================== KEFLA */
  SL.data.characters.kefla = {
    id: 'kefla', assetLevel: 1, name: 'Kefla', fullName: 'Kefla (Universe 6)', era: 'Super',
    playable: true, prototype: true, style: 'Potara Powerhouse',
    blurb: 'Two Saiyans of Universe 6 under one pair of Potara earrings — all of Caulifla\'s nerve and all of Kale\'s power.',
    card: ['Universe 6', 'Potara Fusion'],
    ratings: { power: 5, speed: 4, ki: 5, defense: 4 },
    stats: { hp: 24000, ki: 160, stamina: 170, speed: 1.12, power: 1.45, defense: 1.2, weight: 1.05, kiRegen: 4, chargeRate: 40, canonPower: 6 },
    appearance: {
      height: 0.95, skin: SKIN,
      build: {
        // athletic: broad defined shoulders, a fuller chest (chestD) tapering to a defined waist, wider hips and strong
        // thighs. Shaped surfaces (opt-in in model.js): bustShape — the crop top's own chest surface carries the bust,
        // one contour, so the chest keeps its depth and the bust spheres are not used; thighShape — full at the hip,
        // tapering to the knee, quadriceps and hamstrings raised out of the same leggings surface
        chestW: 0.198, chestD: 0.145, chestTop: 0.27, shoulderX: 0.208, shoulderY: 0.22, delt: 0.06,
        waistW: 0.104, waistD: 0.09, absLen: 0.2, pelvisW: 0.168, pelvisH: 0.112, pelvisD: 0.136, hipX: 0.094,
        upperArmR: 0.05, foreArmR: 0.043, fist: 0.048, thighR: 0.1, shinR: 0.063, neckR: 0.043, neckLen: 0.07, headR: 0.13, footLen: 0.9,
        bustShape: 1.4, thighShape: { top: 1.18, mid: 1.04, knee: 1.1, quad: 0.1, ham: 0.12 },
      },
      hair: { style: 'kefla', color: 0x141418 },
      headExtras: [potara(1), potara(-1)],
      // as Caulifla's (see there), harder: narrower eyes, a steeper slant, lower and heavier brows, a broader jaw
      // one shaped skull (face.headShape): cheeks, jaw and chin are a single surface tapering to the chin — no jaw sphere,
      // no seam; the mouth re-measured on it (mouthZ). face.smileArc: a closed smile is an upturned arc that follows the
      // expression (warm, smirk), and the open mouth stays the box (shout)
      face: { pupil: BROWN, eyeX: 0.05, eyeW: 1.34, eyeH: 0.6, eyeTilt: 0.21, lashWing: true, skull: [0.96, 1.0, 1], headShape: { taper: 0.3, drop: 0.14, fwd: 0.1, nape: 0.15 }, cheeks: 0, nose: 0.82, browThick: 1.5, browW: 1.12, browY: -0.006, brow: 0x141418, mouthColor: 0x6a2430, mouthY: -0.007, mouthZ: 0.88, smileArc: { z: 0.004 } },
      outfit: {
        // the sleeveless burgundy crop top, bare midriff, fitted leggings, gold cuffs, white boots with gold toes
        topStyle: 'shirt', top: 0x8a1a2a, sleeves: 'none', arms: SKIN, abs: SKIN, bustSoft: true,
        wrist: 0xe0b030, wristLen: 0.13, wristFlare: true,
        pants: 0x8a1a2a, pantsStyle: 'tight',
        boots: 0xf2f2f2, bootTip: 0xe0b030, bootStyle: 'saiyan',
      },
      portraitColor: '#8a1a2a',
    },
    vfx: { ghost: 0xb8ff8a },
    audio: { strikePitch: 1.1, heavyPitch: 0.95 },
    forms: [
      // restFace: a playful, confident smile at rest (the brows ease, the mouth lifts); fights still show through
      { id: 'base', name: 'Base', aura: { color: 0xd8ffd0, core: 0xffffff, particles: 0xc8ffc0 }, mult: {}, restFace: 'warm' },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 45, style: 'full',
        mult: { damage: 1.42, speed: 1.14, defense: 1.25, kiRegen: 2.2, chargeRate: 1.35, guardStamina: 0.8 },
        aura: { color: 0xa8ff4a, core: 0xf0ffd0, particles: 0xc8ff7a, idle: 0.2, speed: 1.3, sharp: 0.3, sparks: 0xd8ffa0 },
        look: { hair: { style: 'kefla_ssj', color: 0xb8f04a }, pupil: TEAL, brow: 0x98d03a, bulk: 1.04 }, restFace: 'warm',
        ai: { personality: 'aggressive', aggression: 0.88, defense: 0.5, ranged: 0.45, beam: 0.45, preferredRange: 2.2, rhythm: { burst: 4, rest: 28 } },
        ghost: 0xc8ff8a, music: 4,
        sequence: ssjSequence('kf_victory', 'powerUp'),
      },
      {
        // SUPER SAIYAN 2 (the Tournament of Power, against Goku): the mane taller and spikier still, green lightning
        // running through a brighter aura. Story-given by top_kefla.
        id: 'ssj2', name: 'Super Saiyan 2', short: 'SUPER SAIYAN 2', kiCost: 60, style: 'full',
        freeUnlock: ['top_kefla'],
        mult: { damage: 1.75, speed: 1.28, defense: 1.38, kiRegen: 2.4, chargeRate: 1.45, guardStamina: 0.75 },
        aura: { color: 0xc0ff4a, core: 0xf8ffe0, particles: 0xd8ff7a, idle: 0.55, speed: 1.6, sharp: 0.55, sparks: 0x9aff6a, lightning: true },
        look: { hair: { style: 'kefla_ssj2', color: 0xc8f86a }, pupil: TEAL, brow: 0xa8d84a, bulk: 1.06, muscle: 1.06 }, restFace: 'warm',
        // relentless: the shortest rests, more energy, the pursuit never lets up
        ai: { personality: 'aggressive', aggression: 0.95, defense: 0.45, ranged: 0.5, beam: 0.55, preferredRange: 2, rhythm: { burst: 6, rest: 22 } },
        ghost: 0xd8ff8a, music: 5,
      },
    ],
    poses: Object.assign({ idle: P.kf_stance }, P),
    moves: {
      // heavy and explosive: fewer, harder strikes; armoured rushes
      light: [
        { id: 'kfHook', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 560, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
        { id: 'kfHookL', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 580, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
        { id: 'kfKick', startup: 7, active: 4, recovery: 14, cancel: 8, damage: 820, reach: 1.5, radius: 0.95, lunge: 13, hitstun: 26, knock: 'push', knockSpeed: 20, impact: 3, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'kfSmash', startup: 12, active: 5, recovery: 22, damage: 1800, reach: 1.5, radius: 1.1, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 34, impact: 4, guardCrush: true, guardDamage: 55, armor: true, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'kfUpper', startup: 10, active: 4, recovery: 20, damage: 1300, reach: 1.3, radius: 1, lunge: 14, hitstun: 32, knock: 'launch', knockSpeed: 24, impact: 3, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'kfCharge', startup: 6, active: 10, recovery: 18, damage: 1200, reach: 1.4, radius: 1.05, lunge: 36, hitstun: 30, knock: 'heavy', knockSpeed: 28, impact: 3, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      throw: { id: 'kfSlam', name: 'Power Slam', damage: 1300, knockSpeed: 30, poses: ['grab', 'hammerWind', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'greenCannon', name: 'Green Cannon', type: 'projectile', kiCost: 28, icon: 'ball', cooldown: 110,
        startup: 14, recovery: 16, pose: { wind: 'blastWind', release: 'blastCharged' },
        projectile: { kind: 'ball', speed: 64, radius: 1, damage: 2000, homing: 0.75, color: 0x7aff3a, core: 0xe8ffd0, explode: 5, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      special2: {
        id: 'blasterMeteor', name: 'Blaster Meteor', type: 'scatter', kiCost: 45, icon: 'blast',
        windup: 20, rise: 24, height: 9, count: 12, damage: 650, speed: 90, range: 50, recovery: 24,
        color: 0x7aff3a, poses: { wind: 'powerUp', throw: 'blastR' },
      },
      ultimate: {
        id: 'giganticRay', name: 'Gigantic Ray', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [7800, 7800], radius: [2.2, 2.2], speed: 104, range: 170, sustain: 56,
        color: 0x6aff2a, core: 0xf0ffe0, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 44, cinematic: true,
      },
    },
    mechanic: null,
    ai: { personality: 'aggressive', aggression: 0.8, defense: 0.55, ranged: 0.45, beam: 0.45, transformHp: 0.7, preferredRange: 2.4 },
    intro: { pose: 'kf_intro', expression: 'smirk' },
    victory: { poses: ['kf_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'angry' },
  };
  // each form's own timing, not only bigger numbers: gold Caulifla's strings cancel sooner and her dash reaches
  // further; at the second level the recoveries shorten again. Kefla's second level presses on with quicker
  // recoveries and a longer charge.
  {
    const C = SL.data.characters.caulifla, K = SL.data.characters.kefla;
    const quick = (list, s, r, c) => list.map((m) => Object.assign({}, m, { startup: Math.max(2, m.startup - s), recovery: Math.max(5, m.recovery - r), cancel: m.cancel && Math.max(3, m.cancel - c) }));
    const form = (d, id) => d.forms.find((f) => f.id === id);
    const dash = (d, k) => Object.assign({}, d.moves.dash, { lunge: d.moves.dash.lunge * k });
    form(C, 'ssj').moves = { light: quick(C.moves.light, 0, 1, 1), dash: dash(C, 1.15) };
    form(C, 'ssj2').moves = { light: quick(C.moves.light, 1, 2, 2), dash: dash(C, 1.25) };
    form(K, 'ssj2').moves = { light: quick(K.moves.light, 1, 2, 2), dash: dash(K, 1.2) };
  }
})();
