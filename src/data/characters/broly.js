/*
 * BROLY (Movie 2 · Dragon Ball Super: Broly) — the evolving boss of the film, and a Free Battle fighter once
 * the film has shown him. Level 1 functional prototype, built from the owner's reference collages (the
 * official base / Full Power design sheet, the Wrathful leap at God Vegeta, the base charge with the green
 * aura) and the owner's written description; anything not in those is marked 'approximate' below.
 *
 *   BODY    the biggest Saiyan frame outside the giants: huge chest and shoulders, thick neck and arms, a
 *           tanned skin; he grows with every form (look.scale/bulk/muscle).
 *   HEAD    a wild black mane to the shoulder blades, heavy strands over the brow (hair.js `broly`). Quiet,
 *           a little wary when calm; the jaw set when he fights.
 *   CLOTHES the Frieza Force-style dark chest armour with green shoulder straps, the green cloth hanging
 *           from the waist (approximate: a ragged hem), purple trousers, white boots with a gold top, and
 *           Paragus' CONTROL COLLAR — a grey ring round the neck with a green lamp at the front.
 *
 * FORMS — one fighter, four behaviours (the owner's brief: "make Broly the campaign's evolving boss"):
 *   base   CONTROLLED   heavy, readable blows; grabs; he LEARNS (mechanic `legendary`: a strike he has seen
 *                       enough times is caught and answered; blasts he has seen enough are swatted away; his
 *                       adaptation climbs WATCHING → LEARNING → MATCHING (he copies your string) → SURPASSING)
 *   wrath  WRATHFUL     the base hair, glowing amber eyes, swollen muscle, veins, a jagged emerald aura:
 *                       reach, leaps that crash down, roars, relentless pursuit; light blows do not stop him
 *   ssj    SUPER SAIYAN golden-yellow hair, blank white eyes, bigger again: faster strings, the Eraser Blast
 *                       as a pressure tool — Milestone C
 *   full   FULL POWER   electric lime-green hair, the chest armour shattered, enormous, a green sphere of
 *                       power — Milestone C
 * The story hands the forms over (story.js formGivenBy: wrath in "Wrath", ssj/full in "The Legendary Super
 * Saiyan"); Free Battle has each once its film mission is cleared (freeUnlock). A form never comes from his
 * health: the mission (or the player in Free Battle) changes it, and the mechanic's phase follows the form.
 */
(function () {
  'use strict';
  const SKIN = 0xe0a676;
  const ARMOR = 0x26262c, STRAP = 0x5e8a3a, CLOTH = 0x4c7a30, PANTS = 0x4a3068, BOOT = 0xeeeae0, GOLD = 0xd8b84a;
  const VEIN = 0xa65a3c;

  // the veins of the Wrathful state on the forehead and the temples (painted strokes on the skull)
  const HEAD_VEINS = [
    { shape: 'line', a: [0.5, 0.52, 0.66], d: [0.25, 1, -0.15], l: 0.05, r: 0.0075, flat: 0.25, depth: 1.004, color: VEIN },
    { shape: 'line', a: [-0.5, 0.52, 0.66], d: [-0.25, 1, -0.15], l: 0.05, r: 0.0075, flat: 0.25, depth: 1.004, color: VEIN },
    { shape: 'line', a: [0.16, 0.62, 0.76], d: [0.5, 1, 0], l: 0.035, r: 0.006, flat: 0.25, depth: 1.004, color: VEIN },
    { shape: 'line', a: [0.7, 0.2, 0.62], d: [0.1, 1, -0.2], l: 0.04, r: 0.006, flat: 0.25, depth: 1.004, color: VEIN },
    { shape: 'line', a: [-0.7, 0.2, 0.62], d: [-0.1, 1, -0.2], l: 0.04, r: 0.006, flat: 0.25, depth: 1.004, color: VEIN },
  ];
  // ...and down the arms (decals, hidden in the base form: the mechanic shows them with the form)
  const ARM_VEINS = [];
  for (const s of ['L', 'R']) {
    ARM_VEINS.push({ at: 'shoulder' + s, t: 0.45, ang: s === 'L' ? 0.5 : -0.5, size: [0.007, 0.07], color: VEIN, tilt: 0.25, hidden: true, vein: true });
    ARM_VEINS.push({ at: 'shoulder' + s, t: 0.7, ang: s === 'L' ? -0.3 : 0.3, size: [0.006, 0.05], color: VEIN, tilt: -0.4, hidden: true, vein: true });
    ARM_VEINS.push({ at: 'elbow' + s, t: 0.35, ang: 0.1, size: [0.007, 0.08], color: VEIN, tilt: 0.15, hidden: true, vein: true });
    ARM_VEINS.push({ at: 'elbow' + s, t: 0.65, ang: s === 'L' ? 0.8 : -0.8, size: [0.006, 0.05], color: VEIN, tilt: -0.3, hidden: true, vein: true });
  }

  const STAND = { thighL: [-6, 4, 12], kneeL: [10, 0, 0], thighR: [-4, -4, -12], kneeR: [10, 0, 0] };

  const poses = {
    /* ---------------- presence ---------------- */
    // calm: standing quietly, shoulders a little rounded, arms hanging, the head down a touch — shy, wary
    br_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({
        root: { y: -0.01 + b * 0.004 }, spine: [5, 0, 0], chest: [4 + b, 0, 0], neck: [6, 0, 0], head: [6, 0, 0],
        shoulderL: [-6, 0, 11], elbowL: [-16, 0, 0], shoulderR: [-6, 0, -11], elbowR: [-16, 0, 0],
        hands: ['open', 'open'],
      }, STAND);
    },
    // the fighting stance: wide and low like a wrestler, both hands forward and open, the head pushed forward
    br_fight: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.12 + b * 0.01, rx: 10 }, hips: [0, -8, 0], spine: [10, 6, 0], chest: [8 + b, 8, 0], neck: [-4, 0, 0], head: [-10, -8, 0],
        shoulderL: [-52, 0, 30], elbowL: [-62, 0, 0], shoulderR: [-40, 0, -34], elbowR: [-72, 0, 0],
        thighL: [-30, 10, 22], kneeL: [44, 0, 0], thighR: [8, -10, -22], kneeR: [38, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // WRATHFUL: hunched lower, the shoulders heaving with every breath, fists balled, the head thrust forward
    br_wrathIdle: (t) => {
      const s = Math.sin(t * 5);
      return {
        root: { y: -0.2 + s * 0.015, rx: 18 }, spine: [16 + s * 2, 0, 0], chest: [12 + s * 3, 0, 0], neck: [-12, 0, 0], head: [-18, 0, 0],
        shoulderL: [-30, 0, 40 + s * 2], elbowL: [-52, 0, 0], shoulderR: [-30, 0, -40 - s * 2], elbowR: [-52, 0, 0],
        thighL: [-36, 0, 26], kneeL: [58, 0, 0], thighR: [-6, 0, -26], kneeR: [48, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // LEGENDARY (Super Saiyan, Full Power): upright, the arms held off the body by the sheer mass, fists, the chest heaving
    br_lsIdle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.04 + b * 0.01, rx: 4 }, spine: [2, 0, 0], chest: [-4 + b * 2, 0, 0], head: [-6, 0, 0],
        shoulderL: [-10, 0, 26], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -26], elbowR: [-30, 0, 0],
        thighL: [-8, 0, 16], kneeL: [12, 0, 0], thighR: [-8, 0, -16], kneeR: [12, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the heavy run: leaning in, every step a stamp
    br_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 9 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.08 + Math.abs(c) * 0.06, rx: 26 }, spine: [14, s * 6, 0], chest: [8, s * 8, 0], head: [-24, -s * 6, 0],
        shoulderL: [s * 40 - 14, 0, 22], elbowL: [-70, 0, 0], shoulderR: [-s * 40 - 14, 0, -22], elbowR: [-70, 0, 0],
        thighL: [-s * 50 - 12, 0, 6], kneeL: [40 + Math.max(0, s) * 60, 0, 0], footL: [10, 0, 0],
        thighR: [s * 50 - 12, 0, -6], kneeR: [40 + Math.max(0, -s) * 60, 0, 0], footR: [10, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    br_flyIdle: (t) => {
      const s = Math.sin(t * 2);
      return {
        root: { y: 0.03 * s, rx: 8 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-10, 0, 0],
        shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-60, 0, 0],
        thighL: [-30 + s * 3, 0, 10], kneeL: [60, 0, 0], footL: [30, 0, 0], thighR: [-10 - s * 3, 0, -10], kneeR: [40, 0, 0], footR: [40, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // flying at you shoulder first: a battering ram, not a swimmer
    br_flyForward: (t) => {
      const s = Math.sin(t * 9);
      return {
        root: { rx: 66 }, spine: [0, 0, 0], chest: [-6, -14, 0], neck: [-24, 0, 0], head: [-34, 10, 0],
        shoulderL: [-30, 0, 40], elbowL: [-80, 0, 0], shoulderR: [30, 0, -22], elbowR: [-40, 0, 0],
        thighL: [4 + s * 3, 0, 6], kneeL: [20, 0, 0], footL: [50, 0, 0], thighR: [-s * 3, 0, -6], kneeR: [30, 0, 0], footR: [50, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the guard: both forearms crossed in front of the face
    br_guard: {
      root: { y: -0.1 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [10, 0, 0],
      shoulderL: [-80, -30, 40], elbowL: [-100, 0, 0], shoulderR: [-80, 30, -40], elbowR: [-100, 0, 0],
      thighL: [-24, 10, 18], kneeL: [34, 0, 0], thighR: [8, -10, -18], kneeR: [30, 0, 0],
      hands: ['fist', 'fist'],
    },
    // gathering power: feet wide, arms forced down and out, the chest thrown forward
    br_power: (t) => {
      const s = Math.sin(t * 34) * 1.6;
      return {
        root: { y: -0.2, rx: 6 }, spine: [6, 0, 0], chest: [-8 + s, 0, 0], neck: [6, 0, 0], head: [6, 0, 0],
        shoulderL: [10, 0, 38 + s], elbowL: [-30, 0, 0], shoulderR: [10, 0, -38 - s], elbowR: [-30, 0, 0],
        thighL: [-36, 0, 30], kneeL: [60, 0, 0], footL: [-20, 0, -16], thighR: [-36, 0, -30], kneeR: [60, 0, 0], footR: [-20, 0, 16],
        hands: ['fist', 'fist'],
      };
    },
    /* ---------------- the transformations ---------------- */
    // down on one knee, both hands clutching his head: something is coming up inside him
    br_tfClutch: (t) => {
      const s = Math.sin(t * 26) * 2;
      return {
        root: { y: -0.42 + s * 0.004, rx: 14 }, spine: [18, 0, s], chest: [14, 0, 0], neck: [16, 0, 0], head: [18, s * 2, 0],
        shoulderL: [-150, 0, 40], elbowL: [-110, 0, 0], shoulderR: [-150, 0, -40], elbowR: [-110, 0, 0],
        thighL: [-92, 0, 8], kneeL: [96, 0, 0], thighR: [10, 0, -10], kneeR: [116, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // rising: up from the knee, the arms hanging, the head still down
    br_tfRise: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.16 + b * 0.01, rx: 16 }, spine: [18, 0, 0], chest: [12, 0, 0], neck: [12, 0, 0], head: [14, 0, 0],
        shoulderL: [-14, 0, 22], elbowL: [-24, 0, 0], shoulderR: [-14, 0, -22], elbowR: [-24, 0, 0],
        thighL: [-30, 0, 16], kneeL: [44, 0, 0], thighR: [-8, 0, -16], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // every muscle locked: fists clenched at the hips, elbows out, shaking
    br_tfClench: (t) => {
      const s = Math.sin(t * 60) * 1.8;
      return {
        root: { y: -0.16 + s * 0.003 }, spine: [6, 0, s * 0.5], chest: [2 + s, 0, 0], neck: [4, 0, 0], head: [4, 0, s],
        shoulderL: [0, 0, 30 + s], elbowL: [-60, 0, 0], shoulderR: [0, 0, -30 - s], elbowR: [-60, 0, 0],
        thighL: [-26, 0, 22], kneeL: [40, 0, 0], thighR: [-26, 0, -22], kneeR: [40, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the roar: the head thrown back, the arms flung down and out, the chest open to the sky
    br_tfRoar: (t) => {
      const s = Math.sin(t * 44) * 2.2;
      return {
        root: { y: -0.16, rx: -6 }, spine: [-10, 0, 0], chest: [-18 + s, 0, 0], neck: [-14, 0, 0], head: [-26, 0, 0],
        shoulderL: [14, 0, 52 + s], elbowL: [-22, 0, 0], shoulderR: [14, 0, -52 - s], elbowR: [-22, 0, 0],
        thighL: [-32, 0, 30], kneeL: [56, 0, 0], footL: [-20, 0, -16], thighR: [-32, 0, -30], kneeR: [56, 0, 0], footR: [-20, 0, 16],
        hands: ['fist', 'fist'],
      };
    },
    // lying where he was thrown, on his back in the ice, one arm across the chest
    br_down: { root: { y: -0.86, rx: -84 }, spine: [-6, 0, 0], chest: [-4, 0, 6], head: [-10, 16, 0], shoulderL: [-10, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-60, 20, -10], elbowR: [-90, 0, 0], thighL: [-6, 0, 12], kneeL: [20, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0], hands: ['open', 'fist'] },
    /* ---------------- the base string: wide, heavy, readable ---------------- */
    br_hayW: { root: { y: -0.1 }, hips: [0, -20, 0], spine: [6, -24, 0], chest: [4, -32, 0], head: [-6, 26, 0], shoulderR: [-40, -40, -74], elbowR: [-92, 0, 0], shoulderL: [-44, 0, 30], elbowL: [-60, 0, 0], thighL: [-30, 12, 18], kneeL: [40, 0, 0], thighR: [12, -12, -16], kneeR: [32, 0, 0], hands: ['open', 'fist'] },
    br_hay: { root: { y: -0.12, rx: 10 }, hips: [0, 24, 0], spine: [8, 24, 0], chest: [6, 34, 0], head: [-6, -28, 0], shoulderR: [-86, 44, -18], elbowR: [-28, 0, 0], shoulderL: [-20, 0, 36], elbowL: [-72, 0, 0], thighL: [-38, 10, 18], kneeL: [44, 0, 0], thighR: [20, -10, -16], kneeR: [16, 0, 0], hands: ['open', 'fist'] },
    br_hookLW: { root: { y: -0.1 }, hips: [0, 20, 0], spine: [6, 24, 0], chest: [4, 32, 0], head: [-6, -26, 0], shoulderL: [-40, 40, 74], elbowL: [-92, 0, 0], shoulderR: [-44, 0, -30], elbowR: [-60, 0, 0], thighL: [-12, 12, 16], kneeL: [32, 0, 0], thighR: [-30, -12, -18], kneeR: [40, 0, 0], hands: ['fist', 'open'] },
    br_hookL: { root: { y: -0.12, rx: 10 }, hips: [0, -24, 0], spine: [8, -24, 0], chest: [6, -34, 0], head: [-6, 28, 0], shoulderL: [-86, -44, 18], elbowL: [-28, 0, 0], shoulderR: [-20, 0, -36], elbowR: [-72, 0, 0], thighL: [-20, 10, 16], kneeL: [16, 0, 0], thighR: [-38, -10, -18], kneeR: [44, 0, 0], hands: ['fist', 'open'] },
    // the backhand: the right arm brought all the way back across the body
    br_backW: { root: { y: -0.08 }, hips: [0, 26, 0], spine: [4, 26, 0], chest: [2, 36, 0], head: [-4, -30, 0], shoulderR: [-70, 60, 30], elbowR: [-110, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0], thighL: [-20, 10, 16], kneeL: [26, 0, 0], thighR: [12, -10, -16], kneeR: [22, 0, 0], hands: ['open', 'fist'] },
    br_back: { root: { y: -0.1, rx: 6 }, hips: [0, -28, 0], spine: [6, -30, 0], chest: [4, -40, 0], head: [-4, 32, 0], shoulderR: [-80, -20, -96], elbowR: [-10, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0], thighL: [-30, 10, 16], kneeL: [36, 0, 0], thighR: [16, -10, -16], kneeR: [16, 0, 0], hands: ['open', 'fist'] },
    // the headbutt: the head and chest thrown back, then the whole upper body driven down through it
    br_headW: { root: { y: -0.06, rx: -12 }, spine: [-14, 0, 0], chest: [-14, 0, 0], neck: [-14, 0, 0], head: [-20, 0, 0], shoulderL: [-50, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-50, 0, -50], elbowR: [-60, 0, 0], thighL: [-24, 0, 16], kneeL: [30, 0, 0], thighR: [10, 0, -16], kneeR: [24, 0, 0], hands: ['open', 'open'] },
    br_head: { root: { y: -0.12, rx: 24 }, spine: [22, 0, 0], chest: [18, 0, 0], neck: [12, 0, 0], head: [18, 0, 0], shoulderL: [-70, 0, 40], elbowL: [-50, 0, 0], shoulderR: [-70, 0, -40], elbowR: [-50, 0, 0], thighL: [-44, 0, 16], kneeL: [52, 0, 0], thighR: [20, 0, -16], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    /* ---------------- heavies ---------------- */
    // both fists locked together over the head, then brought down like a hammer
    br_hammerW: { root: { y: 0.02, rx: -14 }, spine: [-14, 0, 0], chest: [-16, 0, 0], head: [-10, 0, 0], shoulderL: [-172, -16, 8], elbowL: [-30, 0, 0], shoulderR: [-172, 16, -8], elbowR: [-30, 0, 0], thighL: [-20, 0, 16], kneeL: [20, 0, 0], thighR: [-6, 0, -16], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
    br_hammer: { root: { y: -0.22, rx: 26 }, spine: [24, 0, 0], chest: [18, 0, 0], head: [14, 0, 0], shoulderL: [-56, -16, 8], elbowL: [-8, 0, 0], shoulderR: [-56, 16, -8], elbowR: [-8, 0, 0], thighL: [-50, 0, 20], kneeL: [70, 0, 0], thighR: [10, 0, -20], kneeR: [40, 0, 0], hands: ['fist', 'fist'] },
    br_upperW: { root: { y: -0.26, rx: 16 }, spine: [14, -10, 0], chest: [10, -16, 0], head: [-10, 10, 0], shoulderR: [24, 0, -24], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 34], elbowL: [-90, 0, 0], thighL: [-54, 0, 18], kneeL: [84, 0, 0], thighR: [-18, 0, -18], kneeR: [70, 0, 0], hands: ['fist', 'fist'] },
    br_upper: { root: { y: 0.04, rx: -12 }, spine: [-12, 12, 0], chest: [-16, 18, 0], head: [-22, -12, 0], shoulderR: [-170, 0, -12], elbowR: [-24, 0, 0], shoulderL: [-20, 0, 34], elbowL: [-80, 0, 0], thighL: [-8, 0, 14], kneeL: [16, 0, 0], thighR: [-56, 0, -10], kneeR: [86, 0, 0], hands: ['fist', 'fist'] },
    // the shoulder tackle
    br_tackleW: { root: { y: -0.22, rx: 26 }, hips: [0, -30, 0], spine: [16, -24, 0], chest: [12, -30, 0], head: [-20, 30, 0], shoulderR: [-30, 0, -20], elbowR: [-90, 0, 0], shoulderL: [-60, 0, 40], elbowL: [-80, 0, 0], thighL: [-60, 10, 18], kneeL: [90, 0, 0], thighR: [10, -10, -18], kneeR: [60, 0, 0], hands: ['fist', 'fist'] },
    br_tackle: { root: { y: -0.12, rx: 40 }, hips: [0, -36, 0], spine: [12, -30, 0], chest: [6, -40, 0], neck: [-10, 0, 0], head: [-26, 34, 0], shoulderR: [-20, 0, -14], elbowR: [-100, 0, 0], shoulderL: [-50, 0, 40], elbowL: [-90, 0, 0], thighL: [-50, 0, 14], kneeL: [50, 0, 0], thighR: [30, 0, -14], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    // THE CATCH: the fist stopped dead in his open right hand, his body barely moving
    br_catch: { root: { y: -0.06 }, hips: [0, -14, 0], spine: [6, 12, 0], chest: [4, 16, 0], head: [-6, -12, 0], shoulderR: [-84, 0, -8], elbowR: [-14, 0, 0], handR: [-24, 0, 0], shoulderL: [-34, 0, 30], elbowL: [-70, 0, 0], thighL: [-26, 10, 16], kneeL: [30, 0, 0], thighR: [10, -10, -16], kneeR: [26, 0, 0], hands: ['fist', 'fist'] },
    // the grab and the lift: the target hoisted overhead...
    br_liftW: { root: { y: -0.04, rx: -10 }, spine: [-12, 0, 0], chest: [-14, 0, 0], head: [-16, 0, 0], shoulderL: [-170, 0, 16], elbowL: [-20, 0, 0], shoulderR: [-170, 0, -16], elbowR: [-20, 0, 0], thighL: [-20, 0, 18], kneeL: [26, 0, 0], thighR: [-6, 0, -18], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    // ...and slammed into the ground
    br_slam: { root: { y: -0.3, rx: 34 }, spine: [28, 0, 0], chest: [20, 0, 0], head: [16, 0, 0], shoulderL: [-50, 0, 16], elbowL: [-10, 0, 0], shoulderR: [-50, 0, -16], elbowR: [-10, 0, 0], thighL: [-60, 0, 22], kneeL: [90, 0, 0], thighR: [12, 0, -22], kneeR: [50, 0, 0], hands: ['open', 'open'] },
    // the gut punch, point blank, while he still holds the fist he caught
    br_gutW: { root: { y: -0.1 }, hips: [0, 14, 0], spine: [6, 18, 0], chest: [4, 24, 0], head: [-6, -20, 0], shoulderR: [-84, 0, -8], elbowR: [-14, 0, 0], shoulderL: [10, 0, 30], elbowL: [-110, 0, 0], thighL: [-26, 10, 16], kneeL: [32, 0, 0], thighR: [10, -10, -16], kneeR: [26, 0, 0], hands: ['fist', 'fist'] },
    br_gut: { root: { y: -0.14, rx: 12 }, hips: [0, -18, 0], spine: [10, -18, 0], chest: [8, -24, 0], head: [-8, 16, 0], shoulderR: [-60, 0, -20], elbowR: [-30, 0, 0], shoulderL: [-80, 0, 6], elbowL: [-6, 0, 0], thighL: [-36, 10, 16], kneeL: [44, 0, 0], thighR: [18, -10, -16], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- the Wrathful moves ---------------- */
    // the clawing swipe: the arm raked across from high outside
    br_clawW: { root: { y: -0.16, rx: 14 }, hips: [0, -26, 0], spine: [12, -28, 0], chest: [8, -36, 0], head: [-14, 26, 0], shoulderR: [-150, -30, -60], elbowR: [-40, 0, 0], shoulderL: [-50, 0, 40], elbowL: [-70, 0, 0], thighL: [-40, 12, 20], kneeL: [56, 0, 0], thighR: [14, -12, -20], kneeR: [40, 0, 0], hands: ['fist', 'open'] },
    br_claw: { root: { y: -0.2, rx: 22 }, hips: [0, 28, 0], spine: [18, 30, 0], chest: [12, 40, 0], head: [-14, -30, 0], shoulderR: [-60, 40, -10], elbowR: [-20, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0], thighL: [-50, 12, 20], kneeL: [64, 0, 0], thighR: [20, -12, -20], kneeR: [30, 0, 0], hands: ['fist', 'open'] },
    br_clawLW: { root: { y: -0.16, rx: 14 }, hips: [0, 26, 0], spine: [12, 28, 0], chest: [8, 36, 0], head: [-14, -26, 0], shoulderL: [-150, 30, 60], elbowL: [-40, 0, 0], shoulderR: [-50, 0, -40], elbowR: [-70, 0, 0], thighL: [-14, 12, 20], kneeL: [40, 0, 0], thighR: [-40, -12, -20], kneeR: [56, 0, 0], hands: ['open', 'fist'] },
    br_clawL: { root: { y: -0.2, rx: 22 }, hips: [0, -28, 0], spine: [18, -30, 0], chest: [12, -40, 0], head: [-14, 30, 0], shoulderL: [-60, -40, 10], elbowL: [-20, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-60, 0, 0], thighL: [-20, 12, 20], kneeL: [30, 0, 0], thighR: [-50, -12, -20], kneeR: [64, 0, 0], hands: ['open', 'fist'] },
    // the leap's three beats: down into a crouch, the body over the target, the crash
    br_slamCrouch: { root: { y: -0.36, rx: 24 }, spine: [20, 0, 0], chest: [14, 0, 0], head: [-20, 0, 0], shoulderL: [20, 0, 30], elbowL: [-40, 0, 0], shoulderR: [20, 0, -30], elbowR: [-40, 0, 0], thighL: [-70, 0, 24], kneeL: [110, 0, 0], thighR: [-70, 0, -24], kneeR: [110, 0, 0], hands: ['fist', 'fist'] },
    br_slamAir: { root: { y: 0.1, rx: -18 }, spine: [-16, 0, 0], chest: [-18, 0, 0], head: [10, 0, 0], shoulderL: [-170, -10, 14], elbowL: [-24, 0, 0], shoulderR: [-170, 10, -14], elbowR: [-24, 0, 0], thighL: [-40, 0, 14], kneeL: [70, 0, 0], thighR: [-20, 0, -14], kneeR: [60, 0, 0], hands: ['fist', 'fist'] },
    br_slamLand: { root: { y: -0.4, rx: 30 }, spine: [26, 0, 0], chest: [18, 0, 0], head: [-6, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-6, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-6, 0, 0], thighL: [-80, 0, 26], kneeL: [116, 0, 0], thighR: [-10, 0, -26], kneeR: [96, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- ki ---------------- */
    // the Eraser Blast: a green sphere gathered in the right palm, held back at the hip, then thrown
    br_eraserW: (t) => {
      const s = Math.sin(t * 22) * 1.4;
      return { root: { y: -0.1 }, hips: [0, -24, 0], spine: [4, -20, 0], chest: [2, -26, 0], head: [-6, 22, 0], shoulderR: [10 + s, -30, -40], elbowR: [-70, 0, 0], handR: [40, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-60, 0, 0], thighL: [-30, 12, 18], kneeL: [40, 0, 0], thighR: [12, -12, -18], kneeR: [30, 0, 0], hands: ['open', 'open'] };
    },
    br_eraser: { root: { y: -0.12, rx: 10 }, hips: [0, 24, 0], spine: [8, 26, 0], chest: [6, 34, 0], head: [-6, -26, 0], shoulderR: [-88, 10, -6], elbowR: [-6, 0, 0], handR: [-70, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-80, 0, 0], thighL: [-40, 12, 18], kneeL: [46, 0, 0], thighR: [20, -12, -18], kneeR: [16, 0, 0], hands: ['open', 'open'] },
    // the Gigantic Roar: both palms driven forward together, the mouth open on the scream
    br_roarCharge: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return { root: { y: -0.16 }, spine: [-4, 0, 0], chest: [-10 + s, 0, 0], head: [-10, 0, 0], shoulderL: [20, 0, 40 + s], elbowL: [-80, 0, 0], shoulderR: [20, 0, -40 - s], elbowR: [-80, 0, 0], thighL: [-36, 0, 26], kneeL: [54, 0, 0], thighR: [-6, 0, -26], kneeR: [44, 0, 0], hands: ['open', 'open'] };
    },
    br_roarFire: { root: { y: -0.16, rx: 10 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-6, 0, 0], shoulderL: [-88, -12, 8], elbowL: [-4, 0, 0], handL: [-70, 0, 0], shoulderR: [-88, 12, -8], elbowR: [-4, 0, 0], handR: [-70, 0, 0], thighL: [-40, 0, 26], kneeL: [50, 0, 0], thighR: [10, 0, -26], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    /* ---------------- after ---------------- */
    br_victory: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return Object.assign({ root: { y: -0.04 }, spine: [-6, 0, 0], chest: [-12 + s, 0, 0], neck: [-10, 0, 0], head: [-22, 0, 0], shoulderL: [6, 0, 40 + s], elbowL: [-40, 0, 0], shoulderR: [6, 0, -40 - s], elbowR: [-40, 0, 0], hands: ['fist', 'fist'] }, STAND);
    },
    br_defeat: (t) => {
      const b = Math.sin(t * 3);
      return { root: { y: -0.44 + b * 0.006, rx: 12 }, spine: [18, 0, 0], chest: [12 + b * 2, 0, 0], head: [16, 0, 0], shoulderR: [-30, 0, -10], elbowR: [-40, 0, 0], shoulderL: [-14, 0, 20], elbowL: [-30, 0, 0], thighL: [-90, 0, 8], kneeL: [92, 0, 0], thighR: [8, 0, -8], kneeR: [112, 0, 0], hands: ['open', 'open'] };
    },
  };

  const mv = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 8, active: 4, recovery: 16, cancel: 10, damage: dmg, reach: 1.4, radius: 0.9, lunge: 12, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, extra);
  const H = (extra) => Object.assign({ startup: 14, active: 5, recovery: 24, reach: 1.4, radius: 1.05, lunge: 12, hitstun: 36, knock: 'heavy', knockSpeed: 30, impact: 3, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, extra);

  // the base moveset (the WRATHFUL form replaces it below)
  const BASE_MOVES = {
    light: [
      mv('brHaymaker', 640, 'br_hayW', 'br_hay', { hitPose: 'hitSideR' }),
      mv('brHook', 660, 'br_hookLW', 'br_hookL', { hitPose: 'hitSideL' }),
      mv('brBackhand', 720, 'br_backW', 'br_back', { reach: 1.5, knock: 'push', knockSpeed: 10, hitPose: 'hitSideL' }),
      mv('brHeadbutt', 820, 'br_headW', 'br_head', { reach: 1.1, startup: 9, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' }),
    ],
    heavy: {
      // both fists brought down: breaks a guard
      0: Object.assign(mv('brHammer', 1700, 'br_hammerW', 'br_hammer'), H({ knock: 'smash', knockSpeed: 30, guardCrush: true, guardDamage: 50, armor: true })),
      2: Object.assign(mv('brUpper', 1500, 'br_upperW', 'br_upper'), H({ startup: 12, knock: 'launch', knockSpeed: 22, hitstun: 34, hitPose: 'hitBody' })),
      3: Object.assign(mv('brTackle', 1600, 'br_tackleW', 'br_tackle'), H({ startup: 12, lunge: 26, knockSpeed: 34, armor: true, hitPose: 'hitBody' })),
    },
    dash: Object.assign(mv('brRam', 1400, 'br_tackleW', 'br_tackle'), { startup: 7, active: 10, recovery: 20, lunge: 34, knock: 'heavy', knockSpeed: 30, impact: 3, hitstun: 30, armor: true, hitPose: 'hitBody' }),
    chase: {
      smash: Object.assign(mv('brChaseHammer', 1500, 'br_hammerW', 'br_hammer'), H({ startup: 6, knock: 'smash', knockSpeed: 36, lunge: 16 })),
      strike: Object.assign(mv('brChaseRam', 1400, 'br_tackleW', 'br_tackle'), H({ startup: 6, lunge: 18 })),
    },
    // after THE CATCH (a perfect guard by the legendary mechanic): the answer, while he still has your fist
    counter: {
      light: Object.assign(mv('brCatchGut', 1100, 'br_gutW', 'br_gut'), { startup: 4, recovery: 18, knock: 'crumple', impact: 3, hitstun: 40, hitPose: 'hitBody' }),
      heavy: Object.assign(mv('brCatchHead', 1500, 'br_headW', 'br_head'), { startup: 5, reach: 1.15, recovery: 22, knock: 'heavy', knockSpeed: 30, impact: 3, hitstun: 36, hitPose: 'hitHeavy' }),
    },
    throw: { id: 'brCrush', name: 'Crushing Slam', damage: 1800, knockSpeed: 30, poses: ['grab', 'br_liftW', 'br_slam'] },
  };

  // WRATHFUL: reach and fury — the clawing swipes go further, every heavy is armoured, the ram never stops
  const WRATH_MOVES = {
    light: [
      mv('brwClaw', 820, 'br_clawW', 'br_claw', { startup: 6, reach: 1.75, radius: 1.05, lunge: 16, recovery: 13, cancel: 8, hitPose: 'hitSideR' }),
      mv('brwClawL', 840, 'br_clawLW', 'br_clawL', { startup: 6, reach: 1.75, radius: 1.05, lunge: 16, recovery: 13, cancel: 8, hitPose: 'hitSideL' }),
      mv('brwHay', 900, 'br_hayW', 'br_hay', { startup: 6, reach: 1.6, lunge: 15, knock: 'push', knockSpeed: 12, hitPose: 'hitSideR' }),
      mv('brwHead', 1000, 'br_headW', 'br_head', { startup: 6, reach: 1.2, knock: 'heavy', knockSpeed: 22, impact: 3, hitPose: 'hitBody' }),
    ],
    heavy: {
      0: Object.assign(mv('brwHammer', 2300, 'br_hammerW', 'br_hammer'), H({ startup: 11, knock: 'smash', knockSpeed: 34, guardCrush: true, guardDamage: 60, armor: true, reach: 1.6, radius: 1.2 })),
      2: Object.assign(mv('brwUpper', 2000, 'br_upperW', 'br_upper'), H({ startup: 10, knock: 'launch', knockSpeed: 26, armor: true, hitPose: 'hitBody' })),
      3: Object.assign(mv('brwTackle', 2200, 'br_tackleW', 'br_tackle'), H({ startup: 9, lunge: 32, knockSpeed: 38, armor: true, hitPose: 'hitBody' })),
    },
    dash: Object.assign(mv('brwRam', 1900, 'br_tackleW', 'br_tackle'), { startup: 5, active: 12, recovery: 16, lunge: 42, reach: 1.6, radius: 1.2, knock: 'heavy', knockSpeed: 34, impact: 3, hitstun: 32, armor: true, hitPose: 'hitBody' }),
  };

  // Free Battle transformations (the film stages its own: bb_wrath's seven shots)
  const SEQ_WRATH = {
    length: 200,
    applyAt: 140,
    steps: [
      { at: 0, pose: 'br_tfClutch', speed: 6, expression: 'grit', aura: 0.2, auraColor: 0x2aff5a, mood: [0.45, 0x06140a, 0.9], shot: 'orbit', music: 0, sfx: 'heartbeat' },
      { at: 30, rocks: true, quake: 0.2, sfx: 'rumble' },
      { at: 60, pose: 'br_tfClench', speed: 8, expression: 'grit', aura: 0.5, quake: 0.3, sfx: 'growl' },
      { at: 100, pose: 'br_tfRoar', speed: 8, expression: 'shout', aura: 0.8, quake: 0.45, sfx: 'roar', skyBolt: true },
      { at: 140, burst: true, pose: 'br_tfRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.25, 0x0a2010, 0.3], flash: 0.3, crater: 7, rocks: false },
      { at: 164, pose: 'br_wrathIdle', speed: 5, expression: 'angry', shot: 'face', mood: [0.08, 0x081008, 1.4] },
    ],
  };
  const SEQ_SSJ = {
    length: 210,
    applyAt: 150,
    steps: [
      { at: 0, pose: 'br_tfClench', speed: 6, expression: 'grit', aura: 0.6, auraColor: 0x7aff4a, mood: [0.6, 0x0a1406, 0.9], shot: 'orbit', music: 0, sfx: 'heartbeat', lightning: true },
      { at: 40, rocks: true, quake: 0.35, sfx: 'rumble' },
      { at: 80, hairFlicker: true, sfx: 'ssjRise', quake: 0.45, skyBolt: true },
      { at: 116, pose: 'br_tfRoar', speed: 8, expression: 'shout', quake: 0.6, sfx: 'roar', skyBolts: true },
      { at: 150, burst: true, pose: 'br_tfRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.3, 0x1a2008, 0.3], flash: 0.3, crater: 9, hairFlicker: false, rocks: false },
      { at: 176, pose: 'br_lsIdle', speed: 4, expression: 'angry', shot: 'pull', mood: [0.08, 0x081008, 1.4] },
    ],
  };
  const SEQ_FULL = {
    length: 220,
    applyAt: 160,
    steps: [
      { at: 0, pose: 'br_power', speed: 6, expression: 'grit', aura: 0.8, auraColor: 0x6aff2a, mood: [0.7, 0x061006, 0.9], shot: 'orbit', music: 0, sfx: 'heartbeat', lightning: true, rocks: true },
      { at: 50, quake: 0.5, sfx: 'rumble', skyBolt: true },
      { at: 100, pose: 'br_tfRoar', speed: 8, expression: 'shout', quake: 0.7, sfx: 'roar', skyBolts: true },
      { at: 160, burst: true, pose: 'br_tfRoar', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.35, 0x142008, 0.3], flash: 0.3, crater: 11, rocks: false },
      { at: 186, pose: 'br_lsIdle', speed: 4, expression: 'angry', shot: 'pull', mood: [0.1, 0x081008, 1.4] },
    ],
  };

  SL.data.characters.broly = {
    id: 'broly',
    assetLevel: 1,
    name: 'Broly',
    fullName: 'Broly, the Legendary Super Saiyan',
    era: 'Movie',
    playable: true,
    prototype: true,
    style: 'Berserker · Learns As He Fights',
    blurb: 'A Saiyan raised alone on a dead planet. Gentle when he is calm — and every time you hit him, he learns how.',
    bio: 'Sent away from Planet Vegeta as a baby because his power frightened the king, Broly grew up on Vampa with nobody but his father, Paragus, who followed him into exile to make him a weapon. He knows almost nothing of people and almost everything of survival. In a fight he starts out clumsy and readable — and watches. Repeat yourself and he catches your fist. Anger takes him further than any Saiyan has gone, and he does not stop by himself.',
    card: ['Movie · Super Broly', 'Learns your attacks'],
    ratings: { power: 5, speed: 3, ki: 4, defense: 5 },
    stats: { hp: 42000, ki: 160, stamina: 200, speed: 1.0, power: 1.4, defense: 1.3, weight: 1.6, kiRegen: 3, chargeRate: 40, canonPower: 9.5 },
    // the first blow of a string is shown: he is enormous, not psychic
    openerStartup: 6,
    appearance: {
      height: 1.18,
      skin: SKIN,
      build: {
        chestW: 0.255, chestD: 0.165, shoulderX: 0.258, delt: 0.1, waistW: 0.152, waistD: 0.126, pelvisW: 0.156,
        upperArmR: 0.078, foreArmR: 0.066, fist: 0.071, thighR: 0.106, shinR: 0.08, neckR: 0.078, neckLen: 0.058, headR: 0.12, footLen: 1.08,
      },
      hair: { style: 'broly', color: 0x16141a },
      // (Broly detail pass 2: one shaped skull with a longer, heavier jaw — the round head and big eyes read as a boy's)
      face: { pupil: 0x141414, eyeW: 0.88, eyeH: 0.66, eyeTilt: 0.12, browThick: 1.6, jaw: 1.12, jawW: 1.06, cheeks: 0.7, headShape: { taper: 0.12, drop: 0.24, fwd: 0.12, nape: 0.2 }, skull: [0.95, 1.04, 1] },
      outfit: {
        topStyle: 'armor', top: SKIN, arms: SKIN,
        armor: { plate: ARMOR, belly: ARMOR, pads: STRAP, padStyle: 'strap', padScale: 1.2, trim: STRAP },
        belt: CLOTH, beltStyle: 'sash',
        // the green cloth hanging from the waist (approximate: a ragged hem in the cloth's green)
        hem: { color: CLOTH, len: 0.24, flare: 1.32 },
        pants: PANTS, pantsStyle: 'tight',
        boots: BOOT, bootTip: GOLD, bootStyle: 'saiyan',
      },
      props: [
        // Paragus' control collar: a grey ring round the neck, a green lamp at the front
        { id: 'collar', shape: 'neckRing', joint: 'neck', pos: [0, 0.02, 0.004], radius: 0.098, thick: 0.24, color: 0x8a9098 },
        { id: 'collarLamp', shape: 'box', joint: 'neck', pos: [0, 0.008, 0.102], size: [0.034, 0.026, 0.016], color: 0x4aff7a },
      ],
      decals: ARM_VEINS,
      portraitColor: '#4c7a30',
    },
    vfx: { ghost: 0xa8ffb8, trail: 0xc8ffd8 },
    audio: { strikePitch: 0.78, heavyPitch: 0.7 },
    forms: [
      {
        id: 'base', name: 'Base',
        aura: { color: 0xd8ffe0, core: 0xffffff, particles: 0xc8ffd0, speed: 1.1 },
        mult: {},
        legendary: { learnAt: 3, blastAt: 4, cooldown: 70, gain: 1 },
      },
      {
        // (heavy landings, 2026-10-15 Broly pass)
        landing: { dust: 1.8, crack: 1.1, quake: 0.14 },
        id: 'wrath', name: 'Wrathful', short: 'WRATHFUL', kiCost: 40, style: 'full', freeUnlock: 'bb_wrath',
        mult: { damage: 1.5, speed: 1.22, defense: 1.35, kiRegen: 2, chargeRate: 1.3, accel: 1.3, guardStamina: 0.8 },
        // jagged and emerald: a sharp, fast aura with green lightning in it
        aura: { color: 0x22e85a, core: 0xc8ffd8, particles: 0x5aff8a, idle: 0.55, speed: 1.9, sharp: 0.85, sparks: 0x9affb0, lightning: true, boltColor: 0x9affb8 },
        look: { pupil: 0xffb21a, pupilScale: 1.3, brow: 0x16141a, bulk: 1.12, muscle: 1.16, scale: 1.06, headExtras: HEAD_VEINS },
        poses: { idle: poses.br_wrathIdle, run: poses.br_run, guard: poses.br_guard, charge: poses.br_power },
        moves: WRATH_MOVES,
        legendary: { learnAt: 2, blastAt: 3, cooldown: 50, gain: 1.4, armor: 1, veins: true },
        ai: { aggression: 1, defense: 0.22, ranged: 0.15, rhythm: { burst: 6, rest: 26 }, approachBoost: 14, whiffBreath: 8, comboLen: 4 },
        intro: { pose: 'br_wrathIdle', expression: 'angry' },
        victory: { poses: ['br_victory'], expression: 'shout' },
        ghost: 0x6aff8a,
        music: 5,
        sequence: SEQ_WRATH,
      },
      {
        // (heavy landings, 2026-10-15 Broly pass)
        landing: { dust: 2.2, crack: 1.4, quake: 0.2 },
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 60, style: 'full', freeUnlock: 'bb_legend',
        mult: { damage: 2.1, speed: 1.38, defense: 1.6, kiRegen: 2.4, chargeRate: 1.5, accel: 1.4, guardStamina: 0.7 },
        aura: { color: 0xc8f03a, core: 0xfffde0, particles: 0xe8ff7a, idle: 0.6, speed: 1.8, sharp: 0.6, sparks: 0xd8ff9a, lightning: true, boltColor: 0xd8ffa0 },
        look: { hair: { style: 'broly_ssj', color: 0xf2e23a }, pupil: 0xffffff, pupilScale: 0.04, brow: 0xd8c430, bulk: 1.12, muscle: 1.24, scale: 1.14, headExtras: HEAD_VEINS },
        poses: { idle: poses.br_lsIdle, run: poses.br_run, guard: poses.br_guard, charge: poses.br_power },
        moves: WRATH_MOVES,
        legendary: { learnAt: 2, blastAt: 2, cooldown: 40, gain: 1.6, armor: 1, veins: true },
        ai: { aggression: 1, defense: 0.3, ranged: 0.35, rhythm: { burst: 7, rest: 22 }, approachBoost: 16, whiffBreath: 6, comboLen: 5 },
        intro: { pose: 'br_lsIdle', expression: 'angry' },
        victory: { poses: ['br_victory'], expression: 'shout' },
        ghost: 0xf0ff8a,
        music: 6,
        sequence: SEQ_SSJ,
      },
      {
        // (heavy landings, 2026-10-15 Broly pass)
        landing: { dust: 2.6, crack: 1.7, quake: 0.25 },
        id: 'full', name: 'Full Power', short: 'FULL POWER', kiCost: 80, style: 'full', freeUnlock: 'bb_gogeta',
        mult: { damage: 2.6, speed: 1.42, defense: 1.9, kiRegen: 2.8, chargeRate: 1.6, accel: 1.4, guardStamina: 0.62 },
        aura: { color: 0x5aff2a, core: 0xeaffd8, particles: 0x9aff6a, idle: 0.75, speed: 1.6, sharp: 0.45, sparks: 0xc8ff9a, lightning: true, boltColor: 0xb8ff8a },
        look: { hair: { style: 'broly_full', color: 0x6af02a }, pupil: 0xffffff, pupilScale: 0.04, brow: 0x5ac81e, bulk: 1.18, muscle: 1.38, scale: 1.28, headExtras: HEAD_VEINS },
        poses: { idle: poses.br_lsIdle, run: poses.br_run, guard: poses.br_guard, charge: poses.br_power },
        moves: WRATH_MOVES,
        legendary: { learnAt: 2, blastAt: 2, cooldown: 36, gain: 1.8, armor: 2, veins: true, shatterArmor: true },
        ai: { aggression: 1, defense: 0.32, ranged: 0.4, rhythm: { burst: 7, rest: 22 }, approachBoost: 18, whiffBreath: 6, comboLen: 5 },
        intro: { pose: 'br_lsIdle', expression: 'angry' },
        victory: { poses: ['br_victory'], expression: 'shout' },
        ghost: 0xb8ff8a,
        music: 6,
        sequence: SEQ_FULL,
      },
    ],
    poses: Object.assign({ idle: poses.br_fight, run: poses.br_run, flyIdle: poses.br_flyIdle, flyForward: poses.br_flyForward, guard: poses.br_guard, charge: poses.br_power }, poses),
    moves: BASE_MOVES,
    specials: {
      // in like a landslide: the ram, a knee, both fists down
      special1: {
        id: 'brGiganticCharge', name: 'Gigantic Charge', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 12, dashFrames: 20, speed: 62, recovery: 26,
        poses: { wind: 'br_tackleW', dash: 'br_flyForward' },
        hits: [
          { pose: 'br_tackle', damage: 900, frames: 8, sfx: 'punchHeavy' },
          { pose: 'br_hay', damage: 700, frames: 7, sfx: 'punchHeavy' },
          { pose: 'br_hammer', damage: 1600, frames: 18, knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
      // a green sphere from the right palm: hold to make it bigger
      special2: {
        id: 'brEraser', name: 'Eraser Blast', type: 'projectile', kiCost: 30, icon: 'ball',
        startup: 18, recovery: 26, pose: { wind: 'br_eraserW', release: 'br_eraser' },
        holdCharge: { max: 60, damage: 1.8, radius: 1.7 },
        projectile: { kind: 'ball', speed: 48, radius: 0.8, damage: 2400, homing: 0.55, color: 0x3aff5a, core: 0xe0ffe0, explode: 4, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      // the Gigantic Roar: everything, from both palms
      ultimate: {
        id: 'brGiganticRoar', name: 'Gigantic Roar', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [9800, 9800], radius: [2.1, 2.1], speed: 96, range: 180, sustain: 56,
        color: 0x2aff4a, core: 0xeaffe0, poses: { charge: 'br_roarCharge', fire: 'br_roarFire' }, recovery: 44, cinematic: true,
        sound: 'kame', chargeLight: 0x5aff6a,
        formVariants: {
          ssj: { color: 0x9aff3a, core: 0xffffe0 },
          full: { color: 0x7aff2a, core: 0xffffff, radiusMul: 1.25, damageMul: 1.15 },
        },
      },
    },
    // on the skill wheel: the leap that comes down like a meteor, and the roar that throws everybody off him
    extras: [
      {
        id: 'brLeap', name: 'Gigantic Leap', type: 'groundSlam', kiCost: 26, icon: 'ball', cooldown: 240,
        crouch: 16, hang: 30, height: 8, maxRange: 24, radius: 8, clearHeight: 2.4, damage: 2400, knockSpeed: 20, recovery: 34,
        ringColor: 0x3aff6a, coreColor: 0x9affb8, dustColor: 'stage',
        poses: { crouch: 'br_slamCrouch', air: 'br_slamAir', land: 'br_slamLand' },
      },
      {
        id: 'brRoar', name: 'Wrathful Roar', type: 'bossRoar', kiCost: 20, icon: 'guard', cooldown: 420,
        frames: 48, blastAt: 14, radius: 9, knockSpeed: 22, damage: 500, poses: { roar: 'br_tfRoar' },
      },
    ],
    mechanic: { type: 'legendary', name: 'Legendary Adaptation', desc: 'He learns as he fights. A strike he has seen enough times, he catches and answers; ki blasts he has seen enough, he swats away. His adaptation climbs — WATCHING, LEARNING, MATCHING (he copies your string), SURPASSING — and each stage makes him faster and harder. Vary your attacks.' },
    boss: {
      // the phase follows the FORM (the story changes it), never his health: hpAbove only satisfies the schema
      phases: [
        { id: 'controlled', form: 'base', label: 'CONTROLLED', hpAbove: 0.99, damage: 1, speed: 1, patience: 1.2, patterns: { melee: 1, charge: 0.32, eraser: 0.12 } },
        { id: 'wrath', form: 'wrath', label: 'WRATHFUL', hpAbove: 0.66, damage: 1, speed: 1, patience: 0.6, patterns: { melee: 1.3, slam: 0.75, roar: 0.28, charge: 0.5, eraser: 0.18 } },
        { id: 'legend', form: 'ssj', label: 'LEGENDARY', hpAbove: 0.33, damage: 1, speed: 1, patience: 0.5, patterns: { melee: 1.35, slam: 0.5, roar: 0.25, charge: 0.6, eraser: 0.45, giant: 0.18 } },
        { id: 'full', form: 'full', label: 'FULL POWER', hpAbove: 0, damage: 1, speed: 1, patience: 0.45, patterns: { melee: 1.4, slam: 0.6, roar: 0.3, charge: 0.6, eraser: 0.55, giant: 0.3 } },
      ],
      patterns: {
        charge: { slot: 'special1', minDist: 6, maxDist: 26, cooldown: 380 },
        eraser: { slot: 'special2', minDist: 9, maxDist: 50, cooldown: 520 },
        giant: { slot: 'ultimate', minDist: 12, maxDist: 70, cooldown: 900 },
        slam: { technique: 'slam', minDist: 3, maxDist: 26, maxAltitude: 7, cooldown: 300 },
        roar: { technique: 'roar', maxDist: 9, cooldown: 600, punish: false },
      },
      techniques: {
        slam: { type: 'groundSlam', crouch: 18, hang: 30, height: 8, maxRange: 24, radius: 8, clearHeight: 2.4, damage: 2200, knockSpeed: 20, recovery: 36, ringColor: 0x3aff6a, coreColor: 0x9affb8, dustColor: 'stage', poses: { crouch: 'br_slamCrouch', air: 'br_slamAir', land: 'br_slamLand' } },
        roar: { type: 'bossRoar', frames: 52, blastAt: 16, radius: 10, knockSpeed: 22, damage: 400, poses: { roar: 'br_tfRoar' } },
      },
    },
    ai: { personality: 'berserker', aggression: 0.75, defense: 0.38, ranged: 0.12, beam: 0.15, transformHp: 0, preferredRange: 2.6, hooks: 'broly', rhythm: { burst: 3, rest: 70 }, approachBoost: 8, whiffBreath: 18, patternBreath: 30 },
    barks: { taunt: 'broly_taunt', combo: 'broly_combo', hurt: 'broly_hurt', lowHp: 'broly_lowHp', ultimate: 'broly_ultimate' },
    sequences: {
      intro: [
        { pose: 'br_idle', dur: 0.6, speed: 3, expression: 'calm' },
        { pose: 'br_tfClench', dur: 0.5, speed: 8, expression: 'grit' },
        { pose: 'br_fight', dur: 0.6, speed: 9, expression: 'serious' },
      ],
      victory: [[{ pose: 'br_victory', dur: 9, speed: 4, expression: 'shout' }], [{ pose: 'br_idle', dur: 9, speed: 3, expression: 'calm' }]],
      defeat: [{ pose: 'br_defeat', dur: 9, speed: 3, expression: 'hurt' }],
    },
    intro: { pose: 'br_fight', expression: 'serious' },
    victory: { poses: ['br_victory'], expression: 'shout' },
    defeat: { pose: 'br_defeat', expression: 'hurt' },
  };
})();
