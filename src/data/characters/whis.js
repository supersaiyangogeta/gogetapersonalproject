/*
 * WHIS — Beerus' attendant and martial-arts teacher (Battle of Gods, Chapter 16). Story character, not a
 * fighter: he never throws a punch in this chapter. Level 1 functional prototype, built from the owner's
 * Battle of Gods reference board (the look is the thing to check against it).
 *
 *   LOOK    very tall and slender, pale blue skin, white hair swept straight up into a tall crest, violet
 *           eyes, dark lips. A long maroon robe over a black cuirass with an orange-and-white diamond band,
 *           white cuffs; a teal ring floating round his neck (prop 'neckRing'); his staff in the right hand —
 *           silver, a gold collar, a clear blue orb at the top with a gold ring round it (prop 'staff').
 *   ACTING  polite, amused, unhurried. The staff stands beside him like a walking cane; he taps it, he
 *           raises it and the orb shows what it knows; he covers his mouth when he laughs; he eats.
 */
(function () {
  'use strict';

  const SKIN = 0x9ec8e8, HAIR = 0xf4f4f8, ROBE = 0x7a1a3a, DARK = 0x1a141c, ORANGE = 0xe8782a, CUFF = 0xf2f0ea;

  // the staff hand: the right forearm a little forward, the staff upright in the fist
  const STAFF = { shoulderR: [-14, 0, -10], elbowR: [-26, 0, 0], handR: [24, 0, 0] };

  const poses = {
    // standing very straight, the staff beside him, the left hand at his chest
    w_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return Object.assign({ root: { y: b * 0.004 }, spine: [-2, 0, 0], chest: [-3 + b * 0.5, 0, 0], head: [2, -6, 4], shoulderL: [-30, 0, 8], elbowL: [-104, 0, 0], thighL: [-2, 0, 4], kneeL: [3, 0, 0], thighR: [-2, 0, -4], kneeR: [3, 0, 0], hands: ['open', 'fist'] }, STAFF);
    },
    // a stroll: small steps, the staff swinging forward like a cane
    w_walk: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const s = Math.sin(t * 6 * sp);
      return {
        root: { y: Math.abs(s) * 0.01 }, spine: [-2, s * 2, 0], chest: [-2, s * 2, 0], head: [2, -s * 2, 0],
        shoulderL: [s * 10 - 6, 0, 6], elbowL: [-24, 0, 0], shoulderR: [-s * 12 - 16, 0, -10], elbowR: [-26, 0, 0], handR: [24, 0, 0],
        thighL: [-s * 18, 0, 3], kneeL: [6 + Math.max(0, s) * 16, 0, 0], thighR: [s * 18, 0, -3], kneeR: [6 + Math.max(0, -s) * 16, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // flying: perfectly upright, feet together, the staff held in front like a mast
    w_fly: (t) => {
      const s = Math.sin(t * 1.4);
      return Object.assign({ root: { y: 0.02 * s, rx: 4 }, spine: [0, 0, 0], chest: [-2, 0, 0], head: [2, 0, 0], shoulderL: [-20, 0, 10], elbowL: [-60, 0, 0], thighL: [-6, 0, 2], kneeL: [12, 0, 0], footL: [30, 0, 0], thighR: [-6, 0, -2], kneeR: [12, 0, 0], footR: [30, 0, 0], hands: ['open', 'fist'] }, STAFF);
    },
    w_flyForward: Object.assign({ root: { rx: 28 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-14, 0, 0], shoulderL: [-10, 0, 12], elbowL: [-40, 0, 0], thighL: [2, 0, 3], kneeL: [10, 0, 0], footL: [40, 0, 0], thighR: [2, 0, -3], kneeR: [10, 0, 0], footR: [40, 0, 0], hands: ['open', 'fist'] }, { shoulderR: [-60, 0, -8], elbowR: [-20, 0, 0], handR: [60, 0, 0] }),
    // the staff raised in front of him: the orb at eye height, showing what it knows
    w_staffShow: (t) => {
      const b = Math.sin(t * 2);
      return { root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, -10, 0], head: [-4, 12, 0], shoulderR: [-72, 0, -10], elbowR: [-26, 0, 0], handR: [60 + b * 2, 0, 0], shoulderL: [-38, 0, 14], elbowL: [-86, 0, 0], thighL: [-6, 4, 6], kneeL: [8, 0, 0], thighR: [4, -4, -6], kneeR: [6, 0, 0], hands: ['open', 'fist'] };
    },
    // the staff tapped on the ground once: a visit, a lesson, "time to go"
    w_staffTap: (t) => {
      const k = Math.min(1, t * 3);
      return { root: { y: -0.02 * k }, spine: [2, 0, 0], chest: [2, 0, 0], head: [4, -4, 0], shoulderR: [-30 + 24 * k, 0, -10], elbowR: [-30, 0, 0], handR: [24, 0, 0], shoulderL: [-30, 0, 8], elbowL: [-104, 0, 0], hands: ['open', 'fist'] };
    },
    // the polite laugh: the back of the left hand to his mouth, the head turned a little away
    w_laugh: (t) => {
      const b = Math.sin(t * 10) * 2;
      return Object.assign({ root: { y: 0 }, spine: [-2, 0, 0], chest: [-6 + b, 0, 0], head: [-6, 18, 6], shoulderL: [-64, 30, 14], elbowL: [-140, 0, 0], hands: ['open', 'fist'] }, STAFF);
    },
    // eating: a little fork of something to his mouth, the staff tucked under his arm
    w_eat: (t) => {
      const k = 0.5 + 0.5 * Math.sin(t * 3);
      return { root: { y: 0 }, spine: [-2, 0, 0], chest: [-2, 0, 0], head: [6 - k * 8, 0, 0], shoulderL: [-40 - k * 20, 10, 10], elbowL: [-120 - k * 20, 0, 0], shoulderR: [-10, 0, -12], elbowR: [-60, 0, 0], handR: [10, 0, 0], hands: ['point', 'fist'] };
    },
    // a hand raised, a finger up: "one moment"
    w_finger: (t) => Object.assign({ root: { y: 0 }, spine: [-2, 0, 0], chest: [-2, 8, 0], head: [2, -8, 0], shoulderL: [-110, 0, 20], elbowL: [-60, 0, 0], hands: ['point', 'fist'] }, STAFF),
    // pointing with the staff at something far off
    w_point: { root: { y: 0 }, spine: [-2, 0, 0], chest: [-2, -16, 0], head: [-2, 20, 0], shoulderR: [-88, 0, -14], elbowR: [-6, 0, 0], handR: [86, 0, 0], shoulderL: [-20, 0, 12], elbowL: [-50, 0, 0], thighL: [-6, 4, 6], kneeL: [6, 0, 0], thighR: [4, -4, -6], kneeR: [6, 0, 0], hands: ['open', 'fist'] },
    // a small bow
    w_bow: Object.assign({ root: { y: 0, rx: 14 }, spine: [14, 0, 0], chest: [8, 0, 0], head: [12, 0, 0], shoulderL: [-30, 0, 8], elbowL: [-104, 0, 0], hands: ['open', 'fist'] }, STAFF),
    // surprised: the free hand to his cheek
    w_shock: Object.assign({ root: { y: 0 }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-8, 0, 0], shoulderL: [-80, 30, 20], elbowL: [-140, 0, 0], hands: ['open', 'fist'] }, STAFF),
    // the chop: the edge of the hand down on the back of a god's neck (the last scene)
    w_chop: (t) => {
      const k = Math.min(1, t * 6);
      return Object.assign({ root: { y: -0.02 }, spine: [6, 0, 0], chest: [6, -10, 0], head: [6, 8, 0], shoulderL: [-150 + 90 * k, 0, 20], elbowL: [-20, 0, 0], hands: ['open', 'fist'] }, STAFF);
    },
    w_guard: Object.assign({ root: { y: 0 }, chest: [-2, 0, 0], shoulderL: [-70, 0, 10], elbowL: [-90, 0, 0], hands: ['open', 'fist'] }, STAFF),
  };

  SL.data.characters.whis = {
    id: 'whis',
    assetLevel: 1,
    name: 'Whis',
    fullName: 'Whis (attendant of the God of Destruction)',
    era: 'Super',
    playable: false,
    cinematicOnly: true,
    stats: { hp: 99999, ki: 999, stamina: 999, speed: 1.6, power: 3, defense: 3, weight: 1, kiRegen: 9, chargeRate: 60, canonPower: 20 },
    appearance: {
      height: 1.12,
      skin: SKIN,
      build: {
        chestW: 0.17, chestD: 0.11, chestTop: 0.28, shoulderX: 0.185, delt: 0.05, waistW: 0.105, waistD: 0.085, pelvisW: 0.12,
        upperArmR: 0.043, foreArmR: 0.038, fist: 0.046, thighR: 0.07, shinR: 0.052, neckR: 0.045, neckLen: 0.1, headR: 0.112, footLen: 1.0,
      },
      // the tall white crest of hair, swept straight up and a little back
      headExtras: [
        { shape: 'ball', a: [0, 0.8, 0.05], d: [0, 1, -0.12], l: 0.16, r: 0.105, flat: 0.92, depth: 0.82, color: HAIR, outline: 0.7 },
        { a: [0, 0.95, -0.05], d: [0, 1, -0.16], l: 0.34, r: 0.1, flat: 0.86, depth: 0.86, color: HAIR, outline: 0.7 },
        { a: [0.25, 0.9, 0], d: [0.06, 1, -0.2], l: 0.26, r: 0.07, flat: 0.8, depth: 0.88, color: HAIR, outline: 0.6 },
        { a: [-0.25, 0.9, 0], d: [-0.06, 1, -0.2], l: 0.26, r: 0.07, flat: 0.8, depth: 0.88, color: HAIR, outline: 0.6 },
        { shape: 'ball', a: [0, 0.4, -0.85], d: [0, 0.3, -1], l: 0.05, r: 0.1, flat: 1, depth: 0.86, color: HAIR, outline: 0.5 },
      ],
      face: { pupil: 0x6a3aa8, eyeW: 0.98, eyeH: 1.0, lashWing: true, brow: HAIR, browThick: 0.35, lips: 0x3a2048, jaw: 0.9, jawW: 0.9, nose: 0.6 },
      outfit: {
        topStyle: 'shirt', top: ROBE, abs: DARK, sleeves: 'long', sleeveColor: ROBE, arms: SKIN,
        collar: DARK, wrist: CUFF, wristLen: 0.1,
        belt: ORANGE, beltStyle: 'sash',
        apron: { color: ROBE, trim: ORANGE, len: 0.5, width: 0.2 },
        pants: DARK, pantsStyle: 'gi',
        boots: DARK, shoes: DARK, bootStyle: 'gi',
      },
      props: [
        { id: 'staff', shape: 'staff', joint: 'handR', pos: [0, -0.02, 0.02], rot: [0, 0, 0], length: 1.45, color: 0xd8dce6, trim: 0xe2b440, orb: 0x8ae6ff },
        { id: 'ring', shape: 'neckRing', joint: 'neck', pos: [0, 0.04, 0], radius: 0.15, thick: 0.1, color: 0x2ab0b8 },
      ],
      portraitColor: '#7a1a3a',
    },
    vfx: { ghost: 0xbfe6ff, trail: 0xdff2ff },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe9ff }, mult: {} }],
    poses: Object.assign({ idle: poses.w_idle, run: poses.w_walk, flyIdle: poses.w_fly, flyForward: poses.w_flyForward, flyUp: poses.w_fly, flyDown: poses.w_fly, guard: poses.w_guard, charge: poses.w_idle }, poses),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'w_idle', expression: 'calm' },
  };
})();
