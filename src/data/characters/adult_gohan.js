/*
 * GOHAN AT SEVENTEEN (Buu Saga, Age 774) — seven years after the Cell Games.
 *
 * Identity: the strongest fighter on Earth, out of practice and trying to be a
 * normal student. He is his father's son in technique (Masenko, Kamehameha) and
 * his mother's in manner — polite, careful, apologetic about hitting people —
 * and the fight only turns into the Cell Games version of him when something he
 * cares about is in front of him. Mechanically that is the same
 * `hiddenPotential` meter he has carried since he was five: damage and fallen
 * allies fill it, and it is what the story later opens all the way (the Old Kai
 * ritual, Milestone F).
 *
 * Against the eleven-year-old of Chapter 6 he is bigger, slower to start and
 * heavier on contact: longer reach, more weight behind a heavy, less of the
 * frantic speed. He is rusty, and the numbers say so — his base is close to
 * where the boy's Super Saiyan was.
 *
 * Forms: base → Super Saiyan → Super Saiyan 2. (Ultimate arrives with the Old
 * Kai in a later milestone; it is deliberately not a form yet. His Ultimate LOOK — the orange
 * gi and the held-down hair — is built already, as a wardrobe outfit and hairstyle.)
 *
 * CONSTRUCTION (rebuilt 2026-09-25 from the owner's reference sheet — not the boy scaled up and
 * not his father in orange): a grown man's proportions (a small head on a long neck, broad
 * shoulders over a narrow waist, long limbs), an adult face (a longer jaw, a leaner face, narrower
 * eyes, heavier brows), his own short spiky hair with the strand on the forehead, and adult Super
 * Saiyan and Super Saiyan 2 hair of his own. His clothes are wardrobe outfits (src/data/wardrobe.js,
 * profile adult_gohan): the Piccolo-style gi of the tournament (indigo, red sash and wristbands) is
 * the canon look of the Buu Saga, the school clothes are the first day's, the orange gi is
 * Ultimate Gohan's. Each tears its own way (clothing damage levels 0–3).
 *
 * MOVEMENT: a student at rest (hands open, weight back), Piccolo's stance when he fights (the open
 * lead hand), an athlete's run, a calm upright hover, a crossed-forearm block, a grounded power-up,
 * and the sheepish hand on the back of his head when it is over.
 *
 * Level 1 functional prototype; playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const SKIN = 0xf6cda6;
  // the tournament gi (Piccolo's cut): indigo, a V-neck to the skin, short sleeves, red sash and wristbands
  const INDIGO = 0x2c2a66, RED = 0xc8261e;
  const DAMAGE = {
    // the indigo tears to the skin across the chest and the back; the trousers at the thigh and the
    // knee; torn, the gi top is gone but for the right sleeve and the part under the sash
    tearAt: 3,
    rips: [
      { at: 'chest', y: 0.2, ang: 0.5, w: 0.42, h: 0.065, fill: 'skin', level: 1, until: 2 },
      { at: 'thighR', t: 0.5, ang: 0.25, w: 0.8, h: 0.09, fill: 'skin', level: 1 },
      { at: 'chest', y: 0.12, ang: -0.35, w: 0.5, h: 0.07, fill: 'skin', level: 2, until: 2 },
      { at: 'spine', y: 0.1, ang: -0.5, w: 0.55, h: 0.08, fill: 'skin', level: 2 },
      { at: 'kneeL', t: 0.35, ang: 0.3, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
      { at: 'thighL', t: 0.3, ang: -0.8, w: 0.9, h: 0.1, fill: 'skin', level: 3 },
      { at: 'kneeR', t: 0.5, ang: -0.4, w: 1.1, h: 0.1, fill: 'skin', level: 3 },
      { at: 'spine', y: 0.04, ang: 0.6, w: 0.5, h: 0.07, fill: 'skin', level: 3 },
    ],
  };
  const OUTFIT = {
    topStyle: 'gi', top: INDIGO, under: SKIN, sleeves: 'short', sleeveColor: INDIGO, neck: 1.25,
    wrist: RED, belt: RED, pants: INDIGO, pantsStyle: 'gi', boots: 0x4a3024, bootStyle: 'gi',
    damage: DAMAGE,
    torn: { chest: 'skin', trap: 'skin', keepSleeve: 'R' },
  };

  const poses = {
    // a student's stance: hands low and open, weight back, not looking for the fight
    ag_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.02 + b * 0.008 },
        hips: [0, -6, 0], spine: [2, 0, 0], chest: [0, 6, 0], neck: [2, 0, 0], head: [-2, -5, 0],
        shoulderL: [-24, 0, 12], elbowL: [-54, 0, 0], shoulderR: [-22, 0, -12], elbowR: [-58, 0, 0],
        thighL: [-10, 5, 10], kneeL: [14 + b * 2, 0, 0], thighR: [6, -5, -10], kneeR: [12 + b * 2, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // Piccolo's stance, remembered: low and wide, the open lead hand out, the rear fist at the hip
    ag_fight: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.08 + b * 0.008 },
        hips: [0, -22, 0], spine: [8, 0, 0], chest: [6, 16, 0], head: [-8, -14, 0],
        shoulderL: [-72, 0, 14], elbowL: [-46, 0, 0], handL: [-20, 0, 0], shoulderR: [-18, 0, -30], elbowR: [-112, 0, 0],
        thighL: [-30, 12, 16], kneeL: [40 + b * 2, 0, 0], footL: [-8, 0, 0], thighR: [16, -10, -16], kneeR: [34 + b * 2, 0, 0], footR: [-14, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // Super Saiyan 2: no stance at all — upright, the fists low, the eyes doing it
    ag_ssj2: (t) => {
      const b = Math.sin(t * 2.4), c = Math.sin(t * 31) * 0.6;
      return {
        root: { y: -0.03 + b * 0.005 },
        hips: [0, -8, 0], spine: [2, 0, 0], chest: [-2 + c * 0.3, 8, 0], neck: [4, 0, 0], head: [2, -8, 0],
        shoulderL: [-14, 0, 20 + c], elbowL: [-22, 0, 0], shoulderR: [-14, 0, -20 - c], elbowR: [-22, 0, 0],
        thighL: [-12, 6, 14], kneeL: [16, 0, 0], thighR: [6, -6, -14], kneeR: [14, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // an athlete's run: upright, efficient, the hands loose
    ag_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 11.5 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.03 + Math.abs(c) * 0.05, rx: 10 },
        spine: [4, s * 5, 0], chest: [4, s * 7, 0], head: [-10, -s * 5, 0],
        shoulderL: [s * 50 - 8, 0, 10], elbowL: [-78, 0, 0], shoulderR: [-s * 50 - 8, 0, -10], elbowR: [-78, 0, 0],
        thighL: [-s * 50 - 10, 0, 4], kneeL: [30 + Math.max(0, s) * 64, 0, 0], footL: [10, 0, 0],
        thighR: [s * 50 - 10, 0, -4], kneeR: [30 + Math.max(0, -s) * 64, 0, 0], footR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a calm hover, upright, the arms easy
    ag_flyIdle: (t) => {
      const s = Math.sin(t * 2);
      return {
        root: { y: s * 0.025 }, spine: [2, 0, 0], chest: [0, 4, 0], head: [-2, -2, 0],
        shoulderL: [-12, 0, 14 + s * 2], elbowL: [-30, 0, 0], shoulderR: [-12, 0, -14 - s * 2], elbowR: [-30, 0, 0],
        thighL: [-26 + s * 2, 0, 5], kneeL: [52, 0, 0], footL: [30, 0, 0], thighR: [-10 - s * 2, 0, -5], kneeR: [30, 0, 0], footR: [36, 0, 0],
        hands: ['open', 'open'],
      };
    },
    ag_flyForward: (t) => {
      const s = Math.sin(t * 4);
      return {
        root: { rx: 66 }, spine: [4, 0, 0], chest: [2, 0, 0], head: [-50, 0, 0],
        shoulderL: [22, 0, 16], elbowL: [-18, 0, 0], shoulderR: [22, 0, -16], elbowR: [-18, 0, 0],
        thighL: [2 + s * 2, 0, 3], kneeL: [12, 0, 0], footL: [36, 0, 0], thighR: [8 - s * 2, 0, -3], kneeR: [22, 0, 0], footR: [36, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the crossed forearms: what the Cell Games taught him about taking a blow
    ag_guard: {
      root: { y: -0.08 }, hips: [0, -10, 0], spine: [8, 0, 0], chest: [8, 6, 0], head: [8, -4, 0],
      shoulderL: [-96, 0, -18], elbowL: [-104, 0, 0], shoulderR: [-100, 0, 18], elbowR: [-100, 0, 0],
      thighL: [-22, 8, 14], kneeL: [34, 0, 0], thighR: [10, -8, -14], kneeR: [30, 0, 0],
      hands: ['fist', 'fist'],
    },
    // gathering it: the feet set wide, the fists pulled down and back, the chest up
    ag_charge: (t) => {
      const s = Math.sin(t * 26) * 1.2;
      return {
        root: { y: -0.14 + s * 0.003 }, spine: [2, 0, 0], chest: [-8 + s * 0.4, 0, 0], head: [-6, 0, 0],
        shoulderL: [18, 0, 30 + s], elbowL: [-40, 0, 0], shoulderR: [18, 0, -30 - s], elbowR: [-40, 0, 0],
        thighL: [-30, 0, 26], kneeL: [52, 0, 0], thighR: [-30, 0, -26], kneeR: [52, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    ag_jabW: {
      root: { y: -0.05 }, chest: [4, -20, 0], head: [-6, 14, 0],
      shoulderR: [-36, 0, -16], elbowR: [-122, 0, 0], shoulderL: [-56, 0, 16], elbowL: [-100, 0, 0],
      thighL: [-22, 0, 12], kneeL: [30, 0, 0], thighR: [14, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    ag_jab: {
      root: { y: -0.07, rx: 8 }, chest: [8, 24, 0], head: [-12, -16, 0],
      shoulderR: [-94, 0, 0], elbowR: [-4, 0, 0], shoulderL: [-48, 0, 18], elbowL: [-112, 0, 0],
      thighL: [-32, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    },
    ag_elbowW: {
      root: { y: -0.04 }, chest: [2, -26, 0], head: [-4, 18, 0],
      shoulderR: [-70, 0, -30], elbowR: [-140, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-96, 0, 0],
      thighL: [-20, 0, 12], kneeL: [28, 0, 0], thighR: [12, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'open'],
    },
    ag_elbow: {
      root: { y: -0.06, rx: 10 }, chest: [10, 30, 0], head: [-10, -20, 0],
      shoulderR: [-60, 0, -8], elbowR: [-120, 0, 0], shoulderL: [-44, 0, 20], elbowL: [-104, 0, 0],
      thighL: [-30, 0, 12], kneeL: [38, 0, 0], thighR: [18, 0, -12], kneeR: [18, 0, 0],
      hands: ['fist', 'open'],
    },
    ag_kickW: { ...C.kickWindR, root: { y: -0.08 } },
    ag_kick: {
      root: { y: 0.02, rz: -12 }, chest: [-4, 42, 0], head: [-6, -32, 0],
      shoulderL: [-16, 0, 56], elbowL: [-30, 0, 0], shoulderR: [-16, 0, -56], elbowR: [-30, 0, 0],
      thighR: [-92, 0, -26], kneeR: [8, 0, 0], footR: [30, 0, 0], thighL: [12, 0, 8], kneeL: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    ag_axeW: {
      root: { y: 0.05 }, spine: [-14, 0, 0], chest: [-18, 0, 0], head: [-18, 0, 0],
      shoulderR: [-178, 0, -10], elbowR: [-14, 0, 0], shoulderL: [-172, 0, 12], elbowL: [-20, 0, 0],
      thighL: [-20, 0, 12], kneeL: [30, 0, 0], thighR: [12, 0, -12], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    ag_axe: {
      root: { y: -0.15, rx: 28 }, spine: [18, 0, 0], chest: [24, 0, 0], head: [-6, 0, 0],
      shoulderR: [-40, 0, -8], elbowR: [-4, 0, 0], shoulderL: [-44, 0, 8], elbowL: [-8, 0, 0],
      thighL: [-28, 0, 12], kneeL: [38, 0, 0], thighR: [18, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    ag_riseW: { ...C.uppercutWind },
    ag_rise: { ...C.uppercut },
    ag_masenkoW: {
      root: { y: -0.06 }, spine: [-8, 0, 0], chest: [-10, 0, 0], neck: [-6, 0, 0], head: [-14, 0, 0],
      shoulderL: [-164, 0, 16], elbowL: [-12, 0, 0], shoulderR: [-166, 0, -16], elbowR: [-10, 0, 0],
      thighL: [-16, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    ag_kameCharge: { ...C.beamChargeSide },
    ag_kameFire: { ...C.beamFire },
    // what he does instead of celebrating: rubs the back of his head
    ag_sheepish: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.02 },
        hips: [0, -6, 0], spine: [6, 0, 0], chest: [4, 8, 0], head: [10, -10, 0],
        shoulderR: [-150, 0, -30], elbowR: [-60 + b * 6, 0, 0], shoulderL: [-12, 0, 16], elbowL: [-24, 0, 0],
        thighL: [-8, 0, 8], kneeL: [12, 0, 0], thighR: [6, 0, -8], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // explaining something, politely: one open hand out
    ag_talk: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.02 }, hips: [0, -4, 0], chest: [2, 6, 0], head: [-2, -4 + b * 3, 0],
        shoulderR: [-44 + b * 6, 0, -18], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 12], elbowL: [-20, 0, 0],
        thighL: [-6, 0, 10], kneeL: [8, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // beaten to one knee, a hand on the thigh, getting back up
    ag_defeat: {
      root: { y: -0.42, rx: 10 }, spine: [14, 0, 0], chest: [10, 0, 0], head: [-20, 0, 0],
      shoulderL: [-40, 0, 12], elbowL: [-50, 0, 0], shoulderR: [-10, 0, -18], elbowR: [-30, 0, 0],
      thighL: [-84, 0, 10], kneeL: [96, 0, 0], thighR: [10, 0, -12], kneeR: [100, 0, 0], footR: [-30, 0, 0],
      hands: ['open', 'fist'],
    },
    // STORY (the ambush): held where he stands by somebody else's will — rigid, shaking, jaw set
    ag_frozen: (t) => {
      const s = Math.sin(t * 38) * 1.2;
      return {
        root: { y: -0.06 }, spine: [-4, 0, s], chest: [-6, 0, 0], head: [-8, s, 0],
        shoulderL: [-22, 0, 34 + s], elbowL: [-52, 0, 0], shoulderR: [-22, 0, -34 - s], elbowR: [-52, 0, 0],
        thighL: [-12, 0, 14], kneeL: [22, 0, 0], thighR: [-12, 0, -14], kneeR: [22, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // pinned from behind with the arms hooked up, sagging as it is taken out of him
    ag_drained: (t) => {
      const s = Math.sin(t * 6);
      return {
        root: { y: -0.1 }, spine: [-8, 0, 0], chest: [-12, 0, 0], head: [16 + s * 2, 0, 0],
        shoulderL: [-100, 0, 40], elbowL: [-70, 0, 0], shoulderR: [-100, 0, -40], elbowR: [-70, 0, 0],
        thighL: [-8, 0, 14], kneeL: [26, 0, 0], thighR: [-8, 0, -14], kneeR: [26, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // both hands on the hilt of a sword in a rock, leaning back and heaving
    ag_pull: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return {
        root: { y: -0.16, rx: -14 }, spine: [-10, 0, s], chest: [-6, 0, 0], head: [-8, 0, 0],
        shoulderL: [-70, 0, 8], elbowL: [-30, 0, 0], shoulderR: [-70, 0, -8], elbowR: [-30, 0, 0],
        thighL: [-40, 0, 16], kneeL: [56, 0, 0], thighR: [10, 0, -16], kneeR: [30, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the Z Sword over his head, both hands, and down (heavy: he leans into it)
    ag_swordW: {
      root: { y: -0.06, rx: -6 }, spine: [-12, 10, 0], chest: [-10, 14, 0], head: [-6, -10, 0],
      shoulderL: [-170, 0, 16], elbowL: [-30, 0, 0], shoulderR: [-170, 0, -8], elbowR: [-40, 0, 0],
      thighL: [-18, 0, 14], kneeL: [22, 0, 0], thighR: [10, 0, -14], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    ag_sword: {
      root: { y: -0.16, rx: 22 }, spine: [22, -8, 0], chest: [16, -10, 0], head: [-10, 8, 0],
      shoulderL: [-60, 0, 10], elbowL: [-8, 0, 0], shoulderR: [-60, 0, -4], elbowR: [-12, 0, 0],
      thighL: [-40, 0, 16], kneeL: [52, 0, 0], thighR: [16, 0, -14], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    },
    // sitting cross-legged, hands on his knees, eyes closed
    ag_meditate: (t) => {
      const b = Math.sin(t * 0.9);
      return {
        root: { y: -0.56 + b * 0.004 }, spine: [2, 0, 0], chest: [-2 + b * 1.5, 0, 0], head: [6, 0, 0],
        shoulderL: [-24, 0, 18], elbowL: [-36, 0, 0], shoulderR: [-24, 0, -18], elbowR: [-36, 0, 0],
        thighL: [-86, 32, 38], kneeL: [126, 0, 0], thighR: [-86, -32, -38], kneeR: [126, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the Ultimate: relaxed, weight back, hands low and open — he does not need a guard
    ag_calm: (t) => {
      const b = Math.sin(t * 1.3);
      return {
        root: { y: -0.02 + b * 0.005 }, hips: [0, -8, 0], spine: [-2, 6, 0], chest: [-2, 6, 0], head: [-2, -8, 0],
        shoulderL: [-16, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-22, 0, -14], elbowR: [-40, 0, 0],
        thighL: [-10, 6, 12], kneeL: [14 + b * 2, 0, 0], thighR: [6, -6, -12], kneeR: [10 + b * 2, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    /* ---- ULTIMATE GOHAN: his own body language. Not Goku with black hair and not the Super Saiyan
       2 boy: no stance, no screaming, the hands low and open, the chin level, every movement the
       shortest one that works. (The form swaps these in: form.poses.) ---- */
    // walking in slowly: upright, arms hanging relaxed, chest slightly out
    ug_walk: (t) => {
      const s = Math.sin(t * 4.2);
      return {
        root: { y: -0.01 + Math.abs(Math.cos(t * 4.2)) * 0.012 }, spine: [-2, s * 3, 0], chest: [-6, s * 4, 0], head: [-2, -s * 2, 0],
        shoulderL: [s * 12 - 2, 0, 8], elbowL: [-14, 0, 0], shoulderR: [-s * 12 - 2, 0, -8], elbowR: [-14, 0, 0],
        thighL: [-s * 22 - 4, 0, 3], kneeL: [10 + Math.max(0, s) * 24, 0, 0], thighR: [s * 22 - 4, 0, -3], kneeR: [10 + Math.max(0, -s) * 24, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the run: long, level, economical — no arm pump to speak of
    ug_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 11 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.03 + Math.abs(c) * 0.04, rx: 16 },
        spine: [6, s * 4, 0], chest: [4, s * 5, 0], head: [-14, -s * 4, 0],
        shoulderL: [s * 34 - 6, 0, 10], elbowL: [-70, 0, 0], shoulderR: [-s * 34 - 6, 0, -10], elbowR: [-70, 0, 0],
        thighL: [-s * 54 - 10, 0, 4], kneeL: [30 + Math.max(0, s) * 60, 0, 0], footL: [10, 0, 0],
        thighR: [s * 54 - 10, 0, -4], kneeR: [30 + Math.max(0, -s) * 60, 0, 0], footR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // hovering: perfectly upright, feet together, hands open at his sides
    ug_flyIdle: (t) => {
      const s = Math.sin(t * 1.6);
      return {
        root: { y: 0.02 * s }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [0, 0, 0],
        shoulderL: [-4, 0, 12], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -12], elbowR: [-14, 0, 0],
        thighL: [-8, 0, 3], kneeL: [16, 0, 0], footL: [36, 0, 0], thighR: [-4, 0, -3], kneeR: [12, 0, 0], footR: [36, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // flying: arms back along the body, the head up — a line through the air
    ug_flyForward: (t) => {
      const s = Math.sin(t * 8);
      return {
        root: { rx: 74 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-28, 0, 0], head: [-40, 0, 0],
        shoulderL: [30, 0, 8], elbowL: [-6, 0, 0], shoulderR: [30, 0, -8], elbowR: [-6, 0, 0],
        thighL: [4 + s * 2, 0, 2], kneeL: [8, 0, 0], footL: [60, 0, 0], thighR: [2 - s * 2, 0, -2], kneeR: [14, 0, 0], footR: [60, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a guard he barely needs: one open palm up in front of the face
    ug_guard: { root: { y: -0.02 }, spine: [2, -8, 0], chest: [0, -10, 0], head: [2, 6, 0], shoulderL: [-74, 0, -20], elbowL: [-104, 0, 0], shoulderR: [-8, 0, -14], elbowR: [-24, 0, 0], thighL: [-8, 6, 12], kneeL: [12, 0, 0], thighR: [4, -6, -12], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    // powering up without a sound: fists low, arms slightly out, the body very still
    ug_charge: (t) => {
      const c = Math.sin(t * 26) * 0.6;
      return {
        root: { y: -0.04 }, spine: [0, 0, 0], chest: [-4 + c, 0, 0], head: [4, 0, 0],
        shoulderL: [-4, 0, 22 + c], elbowL: [-18, 0, 0], shoulderR: [-4, 0, -22 - c], elbowR: [-18, 0, 0],
        thighL: [-8, 0, 16], kneeL: [12, 0, 0], thighR: [-8, 0, -16], kneeR: [12, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the death glare: the chin lowered, the eyes up, nothing else moving
    ug_stare: { root: { y: -0.01 }, spine: [-2, 0, 0], chest: [-6, 0, 0], neck: [6, 0, 0], head: [12, 0, 0], shoulderL: [-4, 0, 10], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-14, 0, 0], thighL: [-6, 4, 12], kneeL: [8, 0, 0], thighR: [2, -4, -10], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    // one inch back from the waist: the fist goes past his nose
    ug_lean: { root: { y: -0.02, rx: -10 }, spine: [-12, 0, 0], chest: [-10, 0, 0], head: [-4, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-20, 0, 0], shoulderR: [-4, 0, -12], elbowR: [-20, 0, 0], thighL: [-8, 6, 12], kneeL: [14, 0, 0], thighR: [6, -6, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the left fist into the stomach, close range, no wind-up
    ug_gutW: { root: { y: -0.06 }, hips: [0, 14, 0], spine: [4, -10, 0], chest: [2, -14, 0], head: [0, 10, 0], shoulderL: [-20, 0, 20], elbowL: [-110, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-30, 0, 0], thighL: [-20, 8, 12], kneeL: [26, 0, 0], thighR: [10, -8, -12], kneeR: [18, 0, 0], hands: ['fist', 'open'] },
    ug_gut: { root: { y: -0.08, rx: 6 }, hips: [0, -18, 0], spine: [8, 16, 0], chest: [6, 22, 0], head: [2, -14, 0], shoulderL: [-84, 0, -4], elbowL: [-10, 0, 0], shoulderR: [-10, 0, -20], elbowR: [-40, 0, 0], thighL: [-32, 8, 12], kneeL: [36, 0, 0], thighR: [16, -8, -12], kneeR: [16, 0, 0], hands: ['fist', 'open'] },
    // the right elbow brought straight down onto the back of a neck
    ug_elbowW: { root: { y: 0.02, rx: -8 }, spine: [-8, 0, 0], chest: [-12, 0, 0], head: [10, 0, 0], shoulderR: [-160, 0, -20], elbowR: [-140, 0, 0], shoulderL: [-10, 0, 16], elbowL: [-24, 0, 0], thighL: [-10, 0, 12], kneeL: [14, 0, 0], thighR: [4, 0, -12], kneeR: [10, 0, 0], hands: ['open', 'fist'] },
    // ULTIMATE STRIKE (the wheel): the open palm driven up under his chin, launching him
    ug_palm: { root: { y: -0.04, rx: -4 }, hips: [0, 20, 0], spine: [-4, 14, 0], chest: [-6, 24, 0], head: [-10, -24, 0], shoulderR: [-120, 0, 4], elbowR: [-6, 0, 0], handR: [-70, 0, 0], shoulderL: [-14, 0, 28], elbowL: [-60, 0, 0], thighL: [-30, 8, 12], kneeL: [34, 0, 0], thighR: [20, -8, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'] },
    // MYSTIC COMBINATION (the wheel): both fists brought down from over his head
    ug_hammer: { root: { y: 0.08, rx: 24 }, spine: [20, 0, 0], chest: [20, 0, 0], neck: [10, 0, 0], head: [14, 0, 0], shoulderL: [-68, 0, -16], elbowL: [-10, 0, 0], shoulderR: [-68, 0, 16], elbowR: [-10, 0, 0], thighL: [-40, 0, 10], kneeL: [66, 0, 0], thighR: [-20, 0, -10], kneeR: [46, 0, 0], hands: ['fist', 'fist'] },
    ug_elbow: { root: { y: -0.1, rx: 20 }, spine: [22, 0, 0], chest: [16, 0, 0], head: [22, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-140, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], thighL: [-24, 0, 12], kneeL: [34, 0, 0], thighR: [10, 0, -12], kneeR: [24, 0, 0], hands: ['open', 'fist'] },
    // Masenko over the head: palms together above the brow, charging a gold ball
    ug_masenkoW: (t) => {
      const s = Math.sin(t * 30) * 1.2;
      return {
        root: { y: -0.06 }, spine: [-6, 0, 0], chest: [-10 + s, 0, 0], head: [-12, 0, 0],
        shoulderL: [-168, -10, -8], elbowL: [-36, 0, 0], shoulderR: [-168, 10, 8], elbowR: [-36, 0, 0],
        thighL: [-20, 8, 16], kneeL: [24, 0, 0], thighR: [6, -8, -16], kneeR: [18, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the Special Beam Cannon (Beast): Piccolo's two fingers to the brow, and the arm thrown straight out
    ub_sbcCharge: SL.data.characters.piccolo.poses.p_sbcCharge,
    ub_sbcFire: SL.data.characters.piccolo.poses.p_sbcFire,
    ug_masenko: { root: { y: -0.06, rx: 8 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-4, 0, 0], shoulderL: [-100, -8, 4], elbowL: [-4, 0, 0], shoulderR: [-100, 8, -4], elbowR: [-4, 0, 0], handL: [-50, 0, 0], handR: [-50, 0, 0], thighL: [-30, 8, 16], kneeL: [36, 0, 0], thighR: [16, -8, -16], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    // taking off: a bend of the knees, the arms down, and he is simply in the air
    ug_takeoff: { root: { y: -0.12 }, spine: [6, 0, 0], chest: [2, 0, 0], head: [-10, 0, 0], shoulderL: [10, 0, 14], elbowL: [-10, 0, 0], shoulderR: [10, 0, -14], elbowR: [-10, 0, 0], thighL: [-30, 0, 8], kneeL: [50, 0, 0], thighR: [-30, 0, -8], kneeR: [50, 0, 0], hands: ['open', 'open'] },
    // landing: one soft knee bend, and upright again
    ug_land: { root: { y: -0.16 }, spine: [8, 0, 0], chest: [4, 0, 0], head: [-4, 0, 0], shoulderL: [-10, 0, 24], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -24], elbowR: [-20, 0, 0], thighL: [-40, 0, 10], kneeL: [64, 0, 0], thighR: [-30, 0, -10], kneeR: [56, 0, 0], hands: ['open', 'open'] },
    // talking: one hand turned up in front of him, the other at his side
    ug_talk: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.01 }, spine: [-2, 4, 0], chest: [-4, 6, 0], head: [-2, -6 + b * 3, 0],
        shoulderR: [-44, 0, -16], elbowR: [-64 + b * 6, 0, 0], shoulderL: [-4, 0, 10], elbowL: [-14, 0, 0],
        thighL: [-6, 4, 12], kneeL: [8, 0, 0], thighR: [2, -4, -10], kneeR: [8, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // it is over: he turns half away, hands open, not even looking
    ug_victory: { root: { y: -0.01 }, hips: [0, 30, 0], spine: [-2, 10, 0], chest: [-6, 10, 0], head: [-4, -40, 0], shoulderL: [-4, 0, 10], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-14, 0, 0], thighL: [-6, 4, 12], kneeL: [8, 0, 0], thighR: [2, -4, -10], kneeR: [8, 0, 0], hands: ['open', 'open'] },
    // hit: he rolls with it instead of flailing (light) / the body folds round it (heavy)
    ug_hit: { root: { y: -0.04, rx: -10 }, spine: [-8, 10, 0], chest: [-10, 14, 0], head: [-14, -10, 0], shoulderL: [-30, 0, 30], elbowL: [-50, 0, 0], shoulderR: [-20, 0, -30], elbowR: [-40, 0, 0], thighL: [-10, 0, 12], kneeL: [16, 0, 0], thighR: [6, 0, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // catching a fist in one open hand without moving his feet
    ag_catch: {
      root: { y: -0.02 }, spine: [0, -10, 0], chest: [-2, -14, 0], head: [-4, 10, 0],
      shoulderR: [-80, 0, -10], elbowR: [-30, 0, 0], shoulderL: [-16, 0, 14], elbowL: [-30, 0, 0],
      thighL: [-10, 6, 12], kneeL: [14, 0, 0], thighR: [6, -6, -12], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
  };

  SL.data.characters.adult_gohan = {
    id: 'adult_gohan',
    assetLevel: 1,
    name: 'Gohan',
    fullName: 'Son Gohan (Age 17)',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Reluctant Scholar',
    blurb: 'The strongest fighter on Earth has homework, a school uniform and no interest in hitting anybody.',
    ratings: { power: 4, speed: 4, ki: 4, defense: 3 },
    stats: { hp: 24000, ki: 130, stamina: 140, speed: 1.05, power: 1.22, defense: 1.02, weight: 1, kiRegen: 2.8, chargeRate: 34, canonPower: 3.4 },
    appearance: {
      height: 1.03,
      skin: SKIN,
      // a grown man: a small head on a long neck, broad shoulders over a narrow waist, long limbs
      build: {
        chestW: 0.232, chestD: 0.158, chestTop: 0.29, shoulderX: 0.236, shoulderY: 0.232, delt: 0.082,
        waistW: 0.146, waistD: 0.112, absLen: 0.21, pelvisW: 0.152, pelvisD: 0.122,
        upperArmR: 0.063, foreArmR: 0.055, fist: 0.06, thighR: 0.092, shinR: 0.072,
        neckR: 0.062, neckLen: 0.08, headR: 0.122,
      },
      hair: { style: 'gohan_adult', color: 0x141418 },
      face: { pupil: 0x101010, eyeW: 0.95, eyeH: 0.9, jaw: 1.14, jawW: 0.95, cheeks: 0.6, browThick: 1.15, browW: 1.05 },
      outfit: OUTFIT,
      portraitColor: '#2c2a66',
    },
    vfx: { ghost: 0xffe0c0 },
    audio: { strikePitch: 1.02, heavyPitch: 0.95 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe8ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 45, style: 'full',
        mult: { damage: 1.35, speed: 1.12, defense: 1.2, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.82 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.44, speed: 1.25, sharp: 0.25, sparks: 0xfff3a0 },
        look: { hair: { style: 'gohan_adult_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.05, muscle: 1.03 },
        poses: { idle: poses.ag_fight },
        ghost: 0xffe27a,
        line: 'gohan_ssj',
        music: 3,
        sequence: {
          length: 110,
          applyAt: 66,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 8, expression: 'grit', aura: 0.35, auraColor: 0xffffff, mood: [0.28, 0x141026, 0.8], shot: 'orbit', music: 0, sfx: 'kiUp', rocks: true },
            { at: 30, pose: 'ag_charge', speed: 7, expression: 'shout', aura: 0.9, sfx: 'ssjRise', mood: [0.6, 0x0a0a12, 0.6], hairFlicker: true },
            { at: 66, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x2a2410, 0.3], flash: 0.8, crater: 4, hairFlicker: false, rocks: false },
            { at: 86, pose: 'ag_fight', speed: 5, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1.2] },
          ],
        },
      },
      {
        id: 'ssj2', name: 'Super Saiyan 2', short: 'SUPER SAIYAN 2', kiCost: 80, style: 'full',
        mult: { damage: 1.9, speed: 1.3, defense: 1.45, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.9 },
        aura: { color: 0xffe25a, core: 0xffffff, particles: 0xfff3a0, idle: 0.6, speed: 1.5, sharp: 0.45, sparks: 0xbfe4ff, lightning: true },
        look: { hair: { style: 'gohan_adult_ssj2', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.08, muscle: 1.06 },
        poses: { idle: poses.ag_ssj2 },
        ai: { personality: 'aggressive', aggression: 0.9, defense: 0.7, ranged: 0.35, beam: 0.45, preferredRange: 2.4 },
        intro: { pose: 'ag_ssj2', expression: 'angry' },
        victory: { poses: ['ag_ssj2'], expression: 'calm' },
        ghost: 0xfff0a0,
        line: 'gohan_ssj2',
        music: 6,
        sequence: {
          length: 150,
          applyAt: 96,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 7, expression: 'grit', aura: 0.4, auraColor: 0xffffff, mood: [0.4, 0x100c20, 1], shot: 'orbit', music: 0, sfx: 'kiUp', rocks: true },
            { at: 44, pose: 'ag_charge', speed: 9, expression: 'shout', aura: 1, sfx: 'ssjRise', mood: [0.72, 0x07070f, 0.6], hairFlicker: true, lightning: true, skyBolts: true },
            { at: 96, burst: true, pose: 'powerUp', speed: 18, expression: 'shout', sfx: 'transformBurst', mood: [0.28, 0x2a2410, 0.3], flash: 1, crater: 6, hairFlicker: false, rocks: false },
            { at: 120, pose: 'ag_ssj2', speed: 4, expression: 'angry', shot: 'face', lightning: true, mood: [0.1, 0x101020, 1.3] },
          ],
        },
      },
      {
        // THE ULTIMATE (the Old Kai's unlocking): not a Super Saiyan. The hair stays black and held
        // down, no gold, no lightning — a close, dense, white aura, a relaxed stance, and more power
        // than either Super Saiyan level. Given by "The Z Sword"; costs no ki to keep.
        id: 'ultimate', name: 'Ultimate', short: 'ULTIMATE', kiCost: 20, style: 'full',
        freeUnlock: 'buu_zsword',
        mult: { damage: 2.3, speed: 1.4, defense: 1.9, kiRegen: 2.6, chargeRate: 1.6, guardStamina: 0.8 },
        aura: { color: 0xf2f6ff, core: 0xffffff, particles: 0xe6eeff, idle: 0.12, speed: 0.75, sharp: 0 },
        look: { hair: { style: 'gohan_ultimate', color: 0x141418 }, bulk: 1.04, muscle: 1.05 },
        poses: { idle: poses.ag_calm, run: poses.ug_run, flyIdle: poses.ug_flyIdle, flyForward: poses.ug_flyForward, guard: poses.ug_guard, charge: poses.ug_charge, hitLight: poses.ug_hit, land: poses.ug_land, jump: poses.ug_takeoff },
        // short, exact strikes: the gut punch and the elbow come into the string, and Masenko is fired from over the head
        moves: {
          light: [
            { id: 'ugJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 700, reach: 1.25, radius: 0.78, lunge: 14, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'ag_jabW', strike: 'ag_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
            { id: 'ugGut', startup: 3, active: 3, recovery: 10, cancel: 5, damage: 900, reach: 1.1, radius: 0.8, lunge: 14, hitstun: 26, knock: 'flinch', impact: 2, pose: { wind: 'ug_gutW', strike: 'ug_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { id: 'ugElbow', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 1200, reach: 1.1, radius: 0.9, lunge: 12, hitstun: 30, knock: 'smash', knockSpeed: 24, impact: 3, pose: { wind: 'ug_elbowW', strike: 'ug_elbow' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          ],
          // his own heavies (the records PDF: Ultimate Gohan unlike base Gohan and Goku): no wind-up axe — a short
          // double hammer, and an open palm that lifts
          heavy: {
            0: { id: 'ugHammer', startup: 8, active: 4, recovery: 18, damage: 2500, reach: 1.4, radius: 1.05, lunge: 18, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 3, guardCrush: true, guardDamage: 50, pose: { wind: 'ug_elbowW', strike: 'ug_hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            2: { id: 'ugLiftPalm', startup: 7, active: 4, recovery: 16, damage: 1800, reach: 1.3, radius: 0.95, lunge: 14, hitstun: 32, knock: 'launch', knockSpeed: 22, impact: 3, pose: { wind: 'ug_gutW', strike: 'ug_palm' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
          // after a Perfect Guard he is simply not where the blow went: Light — behind him, a palm into the back;
          // Heavy — a gut punch that folds him
          counter: {
            light: { id: 'ugSlipPalm', startup: 2, active: 4, recovery: 12, damage: 1200, reach: 1.15, radius: 0.95, lunge: 10, hitstun: 36, knock: 'heavy', knockSpeed: 26, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'ug_stare', strike: 'ug_palm' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
            heavy: { id: 'ugGutCounter', startup: 3, active: 4, recovery: 16, damage: 1600, reach: 1.2, radius: 0.95, lunge: 12, hitstun: 54, knock: 'crumple', impact: 4, guardCrush: true, guardDamage: 70, pose: { wind: 'ug_gutW', strike: 'ug_gut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
        },
        specials: {
          special1: {
            id: 'ugMasenko', name: 'Masenko', type: 'beam', kiCost: 30, icon: 'beam',
            chargeMin: 14, chargeMax: 60, tiers: [14, 40], damage: [3400, 5600], radius: [0.9, 1.4], speed: 112, range: 160, sustain: 34,
            color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'ug_masenkoW', fire: 'ug_masenko' }, recovery: 20,
            callout: ['MASEN', 'KO!'], chargeLight: 0xffe25a,
          },
        },
        ai: { personality: 'martial', aggression: 0.75, defense: 0.85, ranged: 0.25, beam: 0.35, preferredRange: 2 },
        intro: { pose: 'ag_calm', expression: 'calm' },
        victory: { poses: ['ag_calm'], expression: 'calm' },
        ghost: 0xf0f4ff,
        music: 5,
        sequence: {
          length: 120,
          applyAt: 70,
          steps: [
            { at: 0, pose: 'ag_calm', speed: 3, expression: 'calm', aura: 0.2, auraColor: 0xffffff, mood: [0.15, 0x101018, 1], shot: 'face', music: 0 },
            { at: 30, pose: 'ag_calm', speed: 3, expression: 'calm', aura: 0.6, sfx: 'kiUp' },
            { at: 70, burst: true, pose: 'ag_calm', speed: 4, expression: 'calm', sfx: 'transformBurst', flash: 0.4, mood: [0, 0x000000, 0.8] },
            { at: 96, pose: 'ag_calm', speed: 3, expression: 'calm', shot: 'orbit' },
          ],
        },
      },
      {
        /*
         * GOHAN BEAST (Dragon Ball Super: Super Hero; the owner's moveset roadmap #63, 2026-10-17): the Super Saiyan 2
         * shape pushed past its limit — a towering silver-white mane, white brows, red eyes; a dense purple-and-crimson
         * core inside a violent blue-white flame, static crackling round him. Story-locked: the movie mission "Beast"
         * (sh_beast) hands it over; Free Battle opens it after that mission. Its Ultimate is Piccolo's technique, made
         * his own: two fingers to the brow, a spiral drill of green and yellow straight through.
         */
        id: 'beast', name: 'Beast', short: 'BEAST', kiCost: 30, style: 'full',
        storyLocked: true, freeUnlock: 'sh_beast',
        mult: { damage: 2.9, speed: 1.6, defense: 2.1, kiRegen: 2.8, chargeRate: 1.8, guardStamina: 0.9 },
        aura: { color: 0xdfe8ff, core: 0x9a2a6a, particles: 0xe8f0ff, idle: 0.55, speed: 1.7, sharp: 0.4, sparks: 0xf0f4ff, lightning: true, boltColor: 0xd8e4ff, flame: [0x5a1450, 0x9a2a6a, 0xbfd4ff, 0xf6f8ff] },
        look: { hair: { style: 'gohan_beast', color: 0xeef0f6 }, pupil: 0xd81e2a, brow: 0xf4f4f8, bulk: 1.06, muscle: 1.08 },
        poses: { idle: poses.ag_calm, run: poses.ug_run, flyIdle: poses.ug_flyIdle, flyForward: poses.ug_flyForward, guard: poses.ug_guard, charge: poses.ug_charge, hitLight: poses.ug_hit, land: poses.ug_land, jump: poses.ug_takeoff },
        specials: {
          ultimate: {
            id: 'beastCannon', name: 'Special Beam Cannon (Beast)', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
            chargeMin: 66, chargeMax: 66, damage: [10400, 10400], radius: [0.6, 0.6], speed: 190, range: 200, sustain: 34,
            color: 0xf0ff7a, core: 0xffffff, poses: { charge: 'ub_sbcCharge', fire: 'ub_sbcFire' }, recovery: 40, cinematic: true, oneHand: true, pierce: true,
            style: { rings: 9, ringColor: 0x9aff5a, ringSpeed: 2.8 },
            callout: ['SPECIAL BEAM', 'CANNON!'], chargeLight: 0xd8ff6a,
            // outside the story: his face as the fingers come up to the brow, then along the drill to the target
            cine: { steps: [{ on: 'start', shot: 'face', dur: 0.6, flash: 1.2, flashColor: 0xd8ff6a }, { on: 'release', shot: 'path', dur: 0.9 }] },
          },
        },
        ai: { personality: 'adaptive', aggression: 0.85, defense: 0.6, ranged: 0.3, beam: 0.45, preferredRange: 2.4 },
        intro: { pose: 'ag_calm', expression: 'angry' },
        victory: { poses: ['ag_calm'], expression: 'calm' },
        ghost: 0xe8eeff,
        music: 6,
        sequence: {
          length: 200,
          applyAt: 130,
          steps: [
            { at: 0, pose: 'ag_calm', speed: 4, expression: 'grit', aura: 0.3, auraColor: 0x9a2a6a, mood: [0.35, 0x140818, 0.8], shot: 'face', sfx: 'kiUp', music: 0 },
            { at: 40, pose: 'powerCrouch', speed: 6, expression: 'shout', aura: 0.6, quake: 0.35, rocks: true, sfx: 'rumble', lightning: true },
            { at: 90, pose: 'powerUp', speed: 8, expression: 'shout', aura: 0.9, hairFlicker: true, skyBolt: true, mood: [0.6, 0x0a0a18, 0.5] },
            { at: 130, burst: true, pose: 'powerUp', speed: 12, expression: 'shout', sfx: 'transformBurst', flash: 0.6, crater: 4, hairFlicker: false, rocks: false, mood: [0.15, 0x101020, 0.4] },
            { at: 168, pose: 'ag_calm', speed: 4, expression: 'angry', shot: 'orbit', mood: [0, 0x000000, 1.2] },
          ],
        },
      },
    ],
    poses: Object.assign({ idle: poses.ag_idle, run: poses.ag_run, flyIdle: poses.ag_flyIdle, flyForward: poses.ag_flyForward, guard: poses.ag_guard, charge: poses.ag_charge }, poses),
    moves: {
      light: [
        { id: 'agJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 620, reach: 1.25, radius: 0.78, lunge: 13, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'ag_jabW', strike: 'ag_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'agCross', startup: 4, active: 3, recovery: 11, cancel: 6, damage: 660, reach: 1.25, radius: 0.78, lunge: 13, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'ag_jabW', strike: 'ag_jab' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'agElbow', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 780, reach: 1.15, radius: 0.8, lunge: 14, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'ag_elbowW', strike: 'ag_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'agKick', startup: 6, active: 4, recovery: 14, cancel: 8, damage: 900, reach: 1.55, radius: 0.9, lunge: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'ag_kickW', strike: 'ag_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'agAxe', startup: 11, active: 5, recovery: 22, damage: 2100, reach: 1.5, radius: 1.05, lunge: 15, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 3, guardCrush: true, guardDamage: 48, pose: { wind: 'ag_axeW', strike: 'ag_axe' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'agRise', startup: 9, active: 4, recovery: 18, damage: 1500, reach: 1.35, radius: 0.95, lunge: 13, hitstun: 32, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'ag_riseW', strike: 'ag_rise' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'agDash', startup: 5, active: 7, recovery: 16, damage: 1400, reach: 1.45, radius: 0.95, lunge: 32, hitstun: 28, knock: 'heavy', knockSpeed: 25, impact: 3, pose: { wind: 'ag_jabW', strike: 'ag_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'agToss', name: 'Shoulder Throw', damage: 1200, knockSpeed: 26, poses: ['grab', 'ag_axeW', 'ag_axe'] },
      // Piccolo's student after a Perfect Guard (the records PDF: his own counters): Light — the blow caught and an
      // elbow back into him; Heavy — a rising knee that lifts him off his feet
      counter: {
        light: { id: 'agCatchElbow', startup: 2, active: 4, recovery: 14, damage: 900, reach: 1.15, radius: 0.9, lunge: 10, hitstun: 34, knock: 'heavy', knockSpeed: 22, impact: 3, pose: { wind: 'ag_catch', strike: 'ag_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        heavy: { id: 'agKneeCounter', startup: 4, active: 4, recovery: 18, damage: 1300, reach: 1.2, radius: 0.95, lunge: 12, hitstun: 38, knock: 'launch', knockSpeed: 22, impact: 3, pose: { wind: 'ag_riseW', strike: 'ag_rise' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
    },
    // on the skill wheel, the Ultimate form only: crisp, efficient Turtle School work rather than an angry Saiyan's
    extras: [
      // ULTIMATE STRIKE (the PDF's, after "I want to kill you" against Super Buu; a game-style rush): calm, then in
      // front of him — a stomach punch, a roundhouse, behind him for an elbow into the spine, a rising knee, a palm that
      // launches him, and a Super Kamehameha point blank. Earned for Free Battle by clearing "Ultimate Gohan" (buu_ultimate)
      {
        id: 'ultimateStrike', name: 'Ultimate Strike', type: 'rush', kiCost: 60, icon: 'beam',
        forms: ['ultimate'], freeUnlock: 'buu_ultimate', freeOnly: true,
        startup: 8, dashFrames: 26, speed: 60, recovery: 34,
        poses: { wind: 'ug_stare', dash: 'ug_flyForward' },
        hits: [
          { pose: 'ug_gut', damage: 650, frames: 10, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'ag_kick', damage: 500, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { pose: 'ug_elbow', damage: 550, frames: 10, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
          { pose: 'ag_rise', damage: 450, frames: 10, sfx: 'punchHeavy', hitPose: 'hitHeavy', to: 'front', lift: 1.5 },
          { pose: 'ug_palm', damage: 450, frames: 12, sfx: 'punchHeavy', hitPose: 'hitHeavy', lift: 1 },
          { pose: 'ag_kameFire', damage: 2100, frames: 34, sfx: 'kiBlastBig', ki: { color: 0xeaf4ff, hand: 'both' }, beam: { length: 16, radius: 1, frames: 36, core: 0xffffff }, explode: 1.3, knock: 'heavy', knockSpeed: 46, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'start', shot: 'face', dur: 0.4 },
            { on: 'release', shot: 'track', dur: 0.35 },
            { on: 'connect', shot: 'wide', dur: 1.1 },
            { on: 'finish', shot: 'wide', dur: 1, quake: 0.4 },
          ],
        },
      },
      // MYSTIC COMBINATION (the games' "Burst Rush"; the PDF's choreography): five quick blows, a rising kick that sends
      // him up, over him for a double hammer into the ground, then a white wave that bursts on him where he lies.
      // Earned for Free Battle by clearing "The Z Sword" (buu_zsword, where the form comes)
      {
        id: 'mysticCombination', name: 'Mystic Combination', type: 'rush', kiCost: 50, icon: 'rush',
        forms: ['ultimate'], freeUnlock: 'buu_zsword', freeOnly: true,
        startup: 8, dashFrames: 26, speed: 58, recovery: 64,
        poses: { wind: 'ug_stare', dash: 'ug_flyForward' },
        hits: [
          { pose: 'ag_jab', damage: 220, frames: 5, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'ag_elbow', damage: 240, frames: 5, sfx: 'punchLight', hitPose: 'hitSideR' },
          { pose: 'ag_jab', damage: 220, frames: 5, sfx: 'punchLight', hitPose: 'hitLight' },
          { pose: 'ag_kick', damage: 280, frames: 6, sfx: 'punchHeavy', hitPose: 'hitSideL' },
          { pose: 'ug_elbow', damage: 300, frames: 7, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'ag_rise', damage: 450, frames: 14, sfx: 'punchHeavy', hitPose: 'hitHeavy', lift: 3 },
          { pose: 'ug_hammer', damage: 1100, frames: 18, sfx: 'punchHeavy', to: 'above', knock: 'smash', knockSpeed: 44, impact: 4, hitPose: 'hitHeavy' },
        ],
        detonate: { at: 38, damage: 1400, radius: 1.8, color: 0xf4f8ff, pose: 'ug_masenko' },
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.35 },
            { on: 'connect', shot: 'wide', dur: 1.2 },
            { on: 'finish', shot: 'wide', dur: 0.7 },
            { on: 'finish', at: 38, shot: 'impact', dur: 0.8, quake: 0.3 },
          ],
        },
      },
    ],
    specials: {
      special1: {
        id: 'agMasenko', name: 'Masenko', type: 'beam', kiCost: 32, icon: 'beam',
        chargeMin: 16, chargeMax: 70, tiers: [16, 44], damage: [2600, 4600], radius: [0.7, 1.2], speed: 106, range: 155, sustain: 32,
        color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'ag_masenkoW', fire: 'ag_kameFire' }, recovery: 24,
        callout: ['MASEN', 'KO!'], chargeLight: 0xffe25a,
      },
      special2: {
        id: 'agKame', name: 'Kamehameha', type: 'beam', kiCost: 42, icon: 'beam',
        chargeMin: 22, chargeMax: 80, tiers: [22, 50], damage: [3200, 5400], radius: [0.85, 1.4], speed: 110, range: 165, sustain: 36,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'ag_kameCharge', fire: 'ag_kameFire' }, recovery: 28,
        callout: ['KAME', 'HAME', 'HA!'],
      },
      ultimate: {
        id: 'agSuperKame', name: 'Super Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 54, chargeMax: 54, damage: [9400, 9400], radius: [2, 2], speed: 116, range: 180, sustain: 52,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'ag_kameCharge', fire: 'ag_kameFire' }, recovery: 42, cinematic: true,
        callout: ['KA', 'ME', 'HA', 'ME', 'HA!'],
        // the follow-through the records PDF names: a second push into the beam while its head is still travelling —
        // wider and harder from there (a beam that has already struck only looks it: a beam hits once)
        push: { at: 8, radius: 1.25, damage: 1.1 },
        // outside the story: three-quarter on his stance, in on the hands, then side-on as it fires and again, shaking,
        // for the second push (side-on only once it fires: the charge / front shots stand in the beam's path)
        cine: {
          steps: [
            { on: 'start', shot: 'charge', dur: 0.5 },
            { on: 'start', at: 28, shot: 'hand', dur: 0.45 },
            { on: 'release', shot: 'wide', dur: 0.3, quake: 0.25 },
            { on: 'push', shot: 'wide', dur: 1.2, quake: 0.35 },
          ],
        },
      },
    },
    mechanic: { type: 'hiddenPotential', name: 'Hidden Potential', desc: 'Damage and fallen allies fill it. When it bursts he is briefly unleashed — the same thing the Old Kai will one day open all the way.' },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.66, ranged: 0.45, beam: 0.5, transformHp: 0.55, preferredRange: 3.2, hooks: 'adult_gohan' },
    barks: { combo: 'kid_gohan_combo', hurt: 'kid_gohan_hurt', lowHp: 'kid_gohan_lowHp' },
    intro: { pose: 'ag_fight', expression: 'calm' },
    victory: { poses: ['ag_sheepish'], expression: 'soft' },
    defeat: { pose: 'ag_defeat', expression: 'hurt' },
  };
})();
