/*
 * GOGETA — Goku and Vegeta, fused by the Metamoran Fusion Dance. A character of his own: not a
 * recoloured Goku, not Vegito in other clothes.
 *
 * Built from the owner's reference sheet (Fusion Reborn, Super Broly, the ssj card art):
 *   HEAD    Goku's splayed, spiky mane — bigger, the front standing straighter — on Vegeta's
 *           widow's-peak hairline, with ONE lock hanging over the right brow (hair.js `gogeta`).
 *           Gold and sharper as a Super Saiyan (`gogeta_ssj`), teal eyes.
 *   BODY    the tallest, broadest Saiyan frame in the game after the giants: wide shoulders,
 *           thick forearms, a narrow waist — a V.
 *   CLOTHES the Metamoran outfit: an open dark vest over the bare chest with the thick quilted
 *           collar rolling over both shoulders (Model._buildPaddedCollar — real geometry, not
 *           paint), a blue sash knotted at the hip with long tails, white baggy trousers, black
 *           wristbands, black shoes under blue wraps. Two costumes (wardrobe.js): the Fusion
 *           Reborn colours (orange collar, navy sash) and the Super Broly ones (gold, teal).
 *   ACTING  confident without saying so: he stands loose, rolls a shoulder, smirks, raises one
 *           hand to say "wait", flicks two fingers off his brow. Calm when he is winning,
 *           explosive when he stops playing. Few lines.
 *
 * How he FIGHTS (not Goku's adaptability, not Vegeta's pride, not Vegito's open-handed
 * domination): explosive speed and overwhelming finishing power. Short hard dash bursts that
 * can be turned mid-flight (def.movement), a flash-step afterimage, quick strings that end in
 * kicks, a vanish-behind kick and a teleport axe kick in his heavies, and Fusion Tempo
 * (mechanics.js): pressure builds a rhythm that puts him IN THE ZONE.
 *   special 1  BLASTER METEOR    rush in, three blows, three point-blank palm shots, both palms
 *   special 2  SOUL PUNISHER     a sphere of shifting light, hold to grow it, purifying burst
 *   ultimate   BIG BANG KAMEHAMEHA  cupped at the hip like a Kamehameha, fired from one palm
 *                                   like a Big Bang Attack, the left hand clamped on the wrist
 *   wheel      STARDUST FALL     a flash step over the target and a rain of ki straight down
 *   wheel      INSTANT TRANSMISSION  behind, above, in front, away — with his own pose
 *
 * Forms: base → SUPER SAIYAN (a full transformation: the aura, the wind, the rising particles,
 * the hair flickering gold, the eyes, the lightning, the burst, the lens pulling back, the
 * scream — and his own theme coming in). FORM EXPANSION POINT: forms are read generically by
 * the HUD, the skill wheel, Free Battle, the wardrobe and the AI; Super Saiyan 4 (fur, red hair,
 * no vest) goes in as forms[2] once the builder can draw fur — nothing else needs rewriting.
 *
 * Unlock: not in the canon story. Defeat him in the What-If "The Ultimate Fusion"
 * (whatif_gogeta, opens after "Goodbye, Buu"). Level 1 functional prototype.
 */
(function () {
  'use strict';

  const SKIN = 0xf5c49e;
  const VEST = 0x24242c, COLLAR = 0xf08a24, SASH = 0x2c3c9a, WHITE = 0xf2f0ea, BAND = 0x16161a, WRAP = 0x2c5a9a;

  // his arms folded: higher and looser than Vegito's
  const ARMS = { shoulderL: [-20, -66, 10], elbowL: [-98, 0, 0], shoulderR: [-24, 66, -10], elbowR: [-92, 0, 0] };
  // one leg's weight, the other loose: the stand he lives in
  const STAND = { thighL: [-3, 4, 9], kneeL: [4, 0, 0], thighR: [1, -5, -10], kneeR: [9, 0, 0] };

  const poses = {
    /* ---------------- presence ---------------- */
    // relaxed, hands at his sides, loose fists, the head tipped a little: nothing here worries him
    gg_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return Object.assign({
        root: { y: -0.015 + b * 0.005 }, hips: [0, -6, 2], spine: [-1, 3, 0], chest: [-4 + b * 0.8, 4, 0], neck: [0, 0, 0], head: [-3, -6, 3],
        shoulderL: [-4, 0, 10], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-14, 0, 0],
        hands: ['fist', 'fist'],
      }, STAND);
    },
    // the fighting stance: side-on, lead fist at the chin, rear fist at the ribs, light on the
    // balls of his feet — a quick bounce, the quickest in the game
    gg_fight: (t) => {
      const b = Math.sin(t * 4.2);
      return {
        root: { y: -0.07 + b * 0.012, rx: 5 }, hips: [0, -30, 0], spine: [4, 14, 0], chest: [2, 16, 0], head: [-6, -20, 2],
        shoulderL: [-62, 0, 16], elbowL: [-96, 0, 0], shoulderR: [-28, 0, -26], elbowR: [-118, 0, 0],
        thighL: [-26, 20, 14], kneeL: [34 + b * 4, 0, 0], thighR: [14, -18, -14], kneeR: [30 + b * 4, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // Super Saiyan: lower and wider, both fists forward, looking up from under the brows
    gg_lowStance: (t) => {
      const b = Math.sin(t * 3.6);
      return {
        root: { y: -0.16 + b * 0.01, rx: 10 }, hips: [0, -24, 0], spine: [8, 12, 0], chest: [6, 14, 0], head: [-14, -16, 0],
        shoulderL: [-54, 0, 22], elbowL: [-104, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-112, 0, 0],
        thighL: [-44, 18, 22], kneeL: [62 + b * 3, 0, 0], thighR: [10, -16, -20], kneeR: [48 + b * 3, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // square, hands at the sides: a cinematic stand
    gg_ready: {
      root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-2, 0, 0],
      shoulderL: [-2, 0, 9], elbowL: [-10, 0, 0], shoulderR: [-2, 0, -9], elbowR: [-10, 0, 0],
      thighL: [-2, 0, 9], kneeL: [3, 0, 0], thighR: [-2, 0, -9], kneeR: [3, 0, 0],
      hands: ['fist', 'fist'],
    },
    // THE FUSION ARRIVAL: out of the light, head bowed, arms loose and a little out, breathing
    gg_arrival: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: -0.02 }, spine: [4, 0, 0], chest: [5 + b, 0, 0], neck: [10, 0, 0], head: [22, 0, 0],
        shoulderL: [-4, 0, 16], elbowL: [-18, 0, 0], shoulderR: [-4, 0, -16], elbowR: [-18, 0, 0],
        thighL: [-3, 0, 11], kneeL: [6, 0, 0], thighR: [-3, 0, -11], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ...the head comes up
    gg_rise: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: -0.01 }, spine: [0, 0, 0], chest: [-4 + b, 0, 0], neck: [0, 0, 0], head: [-6, 0, 0],
        shoulderL: [-4, 0, 14], elbowL: [-16, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-16, 0, 0],
        thighL: [-3, 0, 11], kneeL: [5, 0, 0], thighR: [-3, 0, -11], kneeR: [5, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the smirk: weight back, left hand on the hip, chin down, eyes up
    gg_smirk: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.02 + b * 0.004 }, hips: [0, -12, 5], spine: [-2, 8, 0], chest: [-6, 10, 0], head: [4, -16, 9],
        shoulderL: [-18, 0, 56], elbowL: [-100, 0, 0], shoulderR: [-6, 0, -10], elbowR: [-16, 0, 0],
        thighL: [-4, 6, 10], kneeL: [6, 0, 0], thighR: [6, -10, -14], kneeR: [16, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // a shoulder rolled back, then the other, the head going with it
    gg_shoulderRoll: (t) => {
      const a = Math.sin(t * 4.2), c = Math.cos(t * 4.2);
      return Object.assign({
        root: { y: -0.01 }, spine: [-2, 0, 0], chest: [-4 + c * 2, a * 4, 0], head: [-2, -a * 6, a * 4],
        shoulderL: [a * 30 - 8, 0, 12 + c * 10], elbowL: [-30, 0, 0], shoulderR: [-a * 30 - 8, 0, -12 - c * 10], elbowR: [-30, 0, 0],
        hands: ['fist', 'fist'],
      }, STAND);
    },
    // the neck stretched side to side, his right hand on the back of it
    gg_neck: (t) => {
      const a = Math.sin(t * 3);
      return Object.assign({
        root: { y: -0.01 }, spine: [-2, 0, 0], chest: [-4, 0, 0], neck: [4, 0, a * 12], head: [6, 0, a * 20],
        shoulderR: [-150, 0, -40], elbowR: [-120, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-16, 0, 0],
        hands: ['fist', 'open'],
      }, STAND);
    },
    // the wristband: the left hand pulls it straight on the right wrist while the right fist flexes
    gg_glove: (t) => {
      const shut = Math.sin(t * 5) > 0;
      return Object.assign({
        root: { y: -0.01 }, spine: [2, 0, 0], chest: [0, -6, 0], head: [18, -8, 0],
        shoulderR: [-60, 26, -8], elbowR: [-90, 0, 0], shoulderL: [-50, -34, 12], elbowL: [-104, 0, 0],
        hands: ['open', shut ? 'fist' : 'open'],
      }, STAND);
    },
    gg_armsCrossed: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({
        root: { y: b * 0.004 }, hips: [0, -4, 2], spine: [-2, 2, 0], chest: [-6, 2, 0], head: [-6, -10, 6],
        thighL: [-4, 4, 12], kneeL: [4, 0, 0], thighR: [2, -4, -11], kneeR: [6, 0, 0],
        hands: ['fist', 'fist'],
      }, ARMS);
    },
    // one hand up, open, toward the other man: "wait" — or "come on"
    gg_oneHand: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.02 }, hips: [0, -8, 0], spine: [0, 6, 0], chest: [-4, 8, 0], head: [-6, -8, 4 + b],
        shoulderR: [-80, 0, -10], elbowR: [-20, 0, 0], handR: [-70, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-16, 0, 0],
        thighL: [-6, 6, 12], kneeL: [8, 0, 0], thighR: [4, -6, -10], kneeR: [10, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // two fingers flicked off the brow
    gg_twoFinger: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.02 }, hips: [0, -10, 4], spine: [-2, 6, 0], chest: [-6, 8, 0], head: [-4, -10, 6],
        shoulderR: [-140 + b * 4, 0, -34], elbowR: [-150, 0, 0], handR: [10, 0, 0], shoulderL: [-6, 0, 12], elbowL: [-16, 0, 0],
        thighL: [-6, 6, 12], kneeL: [8, 0, 0], thighR: [4, -8, -12], kneeR: [12, 0, 0],
        hands: ['fist', 'point'],
      };
    },
    // Instant Transmission: the two fingers to the forehead, the other hand on the hip — not
    // Goku's concentration: he barely has to think about it
    gg_it: {
      root: { y: 0 }, hips: [0, -6, 2], chest: [0, 4, 0], head: [8, 0, 0],
      shoulderR: [-128, 0, 28], elbowR: [-148, 0, 0], handR: [0, 0, 0], shoulderL: [-18, 0, 56], elbowL: [-100, 0, 0],
      thighL: [-6, 4, 8], kneeL: [10, 0, 0], thighR: [4, -4, -8], kneeR: [10, 0, 0],
      hands: ['fist', 'point'],
    },
    /* ---------------- power ---------------- */
    // the power-up: feet wide, fists driven down and out at his sides, chest forward, head down
    gg_power: (t) => {
      const s = Math.sin(t * 36) * 1.4;
      return {
        root: { y: -0.18, rx: 4 }, spine: [4, 0, 0], chest: [-10 + s, 0, 0], neck: [8, 0, 0], head: [10, 0, 0],
        shoulderL: [8, 0, 34 + s], elbowL: [-28, 0, 0], shoulderR: [8, 0, -34 - s], elbowR: [-28, 0, 0],
        thighL: [-34, 0, 28], kneeL: [58, 0, 0], footL: [-20, 0, -16], thighR: [-34, 0, -28], kneeR: [58, 0, 0], footR: [-20, 0, 16],
        hands: ['fist', 'fist'],
      };
    },
    // the scream: the head thrown back, arms out and down, the chest open
    gg_scream: (t) => {
      const s = Math.sin(t * 44) * 2;
      return {
        root: { y: -0.16, rx: -4 }, spine: [-8, 0, 0], chest: [-14 + s, 0, 0], neck: [-8, 0, 0], head: [-16, 0, 0],
        shoulderL: [14, 0, 46 + s], elbowL: [-20, 0, 0], shoulderR: [14, 0, -46 - s], elbowR: [-20, 0, 0],
        thighL: [-30, 0, 28], kneeL: [54, 0, 0], footL: [-20, 0, -16], thighR: [-30, 0, -28], kneeR: [54, 0, 0], footR: [-20, 0, 16],
        hands: ['fist', 'fist'],
      };
    },
    // after the burst: he straightens, one fist brought up before his chest, the smirk
    gg_tfPose: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.04 + b * 0.004 }, hips: [0, -10, 0], spine: [-2, 8, 0], chest: [-8, 10, 0], head: [2, -12, 4],
        shoulderR: [-46, 20, -20], elbowR: [-118, 0, 0], shoulderL: [-6, 0, 18], elbowL: [-20, 0, 0],
        thighL: [-10, 8, 16], kneeL: [12, 0, 0], thighR: [4, -8, -14], kneeR: [14, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    /* ---------------- movement ---------------- */
    gg_flyIdle: (t) => {
      const s = Math.sin(t * 2.2);
      return {
        root: { y: 0.03 * s }, spine: [4, 0, 0], chest: [0, 0, 0], head: [-8, -4, 2],
        shoulderL: [-16, 0, 20 + s * 2], elbowL: [-40, 0, 0], shoulderR: [-14, 0, -18 - s * 2], elbowR: [-36, 0, 0],
        thighL: [-40 + s * 3, 0, 6], kneeL: [70, 0, 0], footL: [35, 0, 0], thighR: [-10 - s * 3, 0, -6], kneeR: [30, 0, 0], footR: [45, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // Super Saiyan: hovering ready, the lead fist up
    gg_flyIdleSsj: (t) => {
      const s = Math.sin(t * 2.6);
      return {
        root: { y: 0.025 * s, rx: 6 }, spine: [6, 10, 0], chest: [4, 12, 0], head: [-10, -12, 0],
        shoulderL: [-56, 0, 18], elbowL: [-96, 0, 0], shoulderR: [-30, 0, -24], elbowR: [-110, 0, 0],
        thighL: [-30 + s * 3, 10, 8], kneeL: [60, 0, 0], footL: [30, 0, 0], thighR: [-4 - s * 3, -8, -6], kneeR: [28, 0, 0], footR: [45, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // flying forward: streamlined, the arms tucked back, the head into it — built for speed
    gg_flyForward: (t) => {
      const s = Math.sin(t * 10);
      return {
        root: { rx: 74 }, spine: [-4, 0, 0], chest: [-8, 0, 0], neck: [-28, 0, 0], head: [-40, 0, 0],
        shoulderL: [36, 0, 18], elbowL: [-12, 0, 0], shoulderR: [36, 0, -18], elbowR: [-12, 0, 0],
        thighL: [4 + s * 3, 0, 3], kneeL: [12, 0, 0], footL: [55, 0, 0], thighR: [-s * 3, 0, -3], kneeR: [20, 0, 0], footR: [55, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    gg_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 12 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.06 + Math.abs(c) * 0.05, rx: 22 },
        spine: [10, s * 7, 0], chest: [6, s * 9, 0], head: [-20, -s * 7, 0],
        shoulderL: [s * 48 - 6, 0, 12], elbowL: [-90, 0, 0], shoulderR: [-s * 48 - 6, 0, -12], elbowR: [-90, 0, 0],
        thighL: [-s * 54 - 10, 0, 3], kneeL: [35 + Math.max(0, s) * 66, 0, 0], footL: [10, 0, 0],
        thighR: [s * 54 - 10, 0, -3], kneeR: [35 + Math.max(0, -s) * 66, 0, 0], footR: [10, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // both forearms up, fists by the face, leaning back from it — not worried
    gg_guard: {
      root: { y: -0.06 }, spine: [8, 6, 0], chest: [8, 8, 0], head: [10, -6, 0],
      shoulderL: [-70, 0, 36], elbowL: [-130, 0, 0], shoulderR: [-74, 0, -30], elbowR: [-126, 0, 0],
      thighL: [-20, 10, 12], kneeL: [30, 0, 0], thighR: [10, -8, -12], kneeR: [26, 0, 0],
      hands: ['fist', 'fist'],
    },
    // slipping a blow and driving the right fist in under it
    gg_counter: {
      root: { y: -0.1, rz: -10, rx: 8 }, hips: [0, 14, 0], spine: [8, -16, -8], chest: [6, -22, -6], head: [-6, 18, -10],
      shoulderR: [-84, 0, -4], elbowR: [-6, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-100, 0, 0],
      thighL: [-36, 10, 14], kneeL: [44, 0, 0], thighR: [18, -10, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    /* ---------------- the light string: jab, cross, knee, backfist, roundhouse ---------------- */
    gg_jabW: { root: { y: -0.07 }, hips: [0, -26, 0], spine: [4, 16, 0], chest: [2, 20, 0], head: [-6, -18, 0], shoulderL: [-58, 0, 20], elbowL: [-100, 0, 0], shoulderR: [-30, 0, -28], elbowR: [-118, 0, 0], thighL: [-26, 16, 12], kneeL: [32, 0, 0], thighR: [12, -14, -12], kneeR: [28, 0, 0], hands: ['fist', 'fist'] },
    gg_jab: { root: { y: -0.07, rx: 6 }, hips: [0, 6, 0], spine: [6, -10, 0], chest: [4, -18, 0], head: [-6, 14, 0], shoulderL: [-90, 0, 4], elbowL: [-4, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-116, 0, 0], thighL: [-32, 12, 12], kneeL: [36, 0, 0], thighR: [16, -12, -12], kneeR: [22, 0, 0], hands: ['fist', 'fist'] },
    gg_crossW: { root: { y: -0.07 }, hips: [0, 10, 0], spine: [4, -12, 0], chest: [2, -16, 0], head: [-6, 12, 0], shoulderL: [-70, 0, 14], elbowL: [-60, 0, 0], shoulderR: [-24, 0, -40], elbowR: [-124, 0, 0], thighL: [-30, 12, 12], kneeL: [34, 0, 0], thighR: [14, -12, -12], kneeR: [24, 0, 0], hands: ['fist', 'fist'] },
    gg_cross: { root: { y: -0.06, rx: 8 }, hips: [0, -24, 0], spine: [8, 22, 0], chest: [6, 32, 0], head: [-6, -26, 0], shoulderR: [-92, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-36, 0, 32], elbowL: [-104, 0, 0], thighL: [-36, 10, 12], kneeL: [40, 0, 0], thighR: [20, -10, -12], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
    gg_kneeW: { root: { y: -0.04 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [4, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-50, 0, -30], elbowR: [-90, 0, 0], thighR: [-40, 0, -6], kneeR: [100, 0, 0], thighL: [-6, 0, 8], kneeL: [18, 0, 0], hands: ['fist', 'fist'] },
    // the clinch knee: both hands come down on the head as the knee comes up
    gg_knee: { root: { y: 0.03, rx: 12 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [10, 0, 0], shoulderL: [-70, 0, 20], elbowL: [-80, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-80, 0, 0], thighR: [-112, 0, -6], kneeR: [140, 0, 0], thighL: [8, 0, 8], kneeL: [18, 0, 0], hands: ['open', 'open'] },
    gg_backfistW: { root: { y: -0.04, ry: -30 }, hips: [0, -30, 0], spine: [0, -20, 0], chest: [0, -30, 0], head: [0, 30, 0], shoulderR: [-60, 0, -10], elbowR: [-140, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-60, 0, 0], thighL: [-20, 10, 12], kneeL: [26, 0, 0], thighR: [12, -10, -12], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    gg_backfist: { root: { y: -0.04, ry: 20 }, hips: [0, 24, 0], spine: [4, 20, 0], chest: [2, 30, 0], head: [-4, -20, 0], shoulderR: [-80, 0, -60], elbowR: [-10, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-90, 0, 0], thighL: [-20, 10, 12], kneeL: [26, 0, 0], thighR: [12, -10, -12], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    gg_roundW: { root: { y: -0.02, ry: 24, rx: -6 }, hips: [0, 26, 0], chest: [-4, -22, 0], head: [4, 20, 0], shoulderL: [-50, 0, 34], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -44], elbowR: [-90, 0, 0], thighR: [-62, 0, -38], kneeR: [112, 0, 0], thighL: [-6, 0, 8], kneeL: [22, 0, 0], hands: ['fist', 'fist'] },
    gg_round: { root: { y: 0.03, ry: -38, rz: 14 }, hips: [0, -38, 0], chest: [-6, 26, 0], head: [6, 20, -8], shoulderL: [-34, 0, 62], elbowL: [-50, 0, 0], shoulderR: [-24, 0, -60], elbowR: [-50, 0, 0], thighR: [-90, 0, -74], kneeR: [6, 0, 0], footR: [30, 0, 0], thighL: [6, 0, 10], kneeL: [16, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- heavies ---------------- */
    // the heavy right: wound all the way back, then the whole body through it
    gg_heavyW: { root: { y: -0.1 }, hips: [0, -34, 0], spine: [6, -24, 0], chest: [4, -34, 0], head: [-6, 28, 0], shoulderR: [-10, 0, -50], elbowR: [-140, 0, 0], shoulderL: [-70, 0, 18], elbowL: [-50, 0, 0], thighL: [-34, 16, 16], kneeL: [44, 0, 0], thighR: [20, -14, -14], kneeR: [30, 0, 0], hands: ['fist', 'fist'] },
    gg_heavy: { root: { y: -0.12, rx: 14 }, hips: [0, 30, 0], spine: [12, 30, 0], chest: [8, 40, 0], head: [-8, -30, 0], shoulderR: [-94, 0, -2], elbowR: [-2, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-110, 0, 0], thighL: [-50, 10, 14], kneeL: [54, 0, 0], thighR: [26, -10, -12], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
    // the thrust kick: knee to the chest, then the heel straight through
    gg_thrustW: { root: { y: -0.02, rx: -10 }, spine: [-8, 0, 0], chest: [-8, 0, 0], head: [8, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -36], elbowR: [-100, 0, 0], thighR: [-90, 0, -4], kneeR: [120, 0, 0], thighL: [-4, 0, 8], kneeL: [20, 0, 0], hands: ['fist', 'fist'] },
    gg_thrust: { root: { y: 0.02, rx: -24 }, spine: [-14, 0, 0], chest: [-12, 0, 0], head: [16, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -50], elbowR: [-60, 0, 0], thighR: [-100, 0, -4], kneeR: [4, 0, 0], footR: [-30, 0, 0], thighL: [10, 0, 8], kneeL: [26, 0, 0], hands: ['fist', 'fist'] },
    // the launcher: down low, then up through the chin with a knee behind it
    gg_launchW: { root: { y: -0.22, rx: 14 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [-10, 0, 0], shoulderR: [20, 0, -20], elbowR: [-120, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-100, 0, 0], thighL: [-50, 0, 16], kneeL: [80, 0, 0], thighR: [-20, 0, -16], kneeR: [70, 0, 0], hands: ['fist', 'fist'] },
    gg_launch: { root: { y: 0.06, rx: -10 }, spine: [-10, 10, 0], chest: [-14, 16, 0], head: [-20, -10, 0], shoulderR: [-170, 0, -10], elbowR: [-20, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-80, 0, 0], thighL: [-10, 0, 12], kneeL: [16, 0, 0], thighR: [-60, 0, -8], kneeR: [90, 0, 0], hands: ['fist', 'fist'] },
    // the axe kick: the leg straight up over his head, then down
    gg_axeW: { root: { y: 0.04, rx: -16 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [8, 0, 0], thighR: [-172, 0, -8], kneeR: [6, 0, 0], thighL: [8, 0, 6], kneeL: [16, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-80, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-60, 0, 0], hands: ['fist', 'fist'] },
    gg_axe: { root: { y: -0.06, rx: 14 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [18, 0, 0], thighR: [-60, 0, -6], kneeR: [6, 0, 0], footR: [20, 0, 0], thighL: [4, 0, 6], kneeL: [36, 0, 0], shoulderL: [-10, 0, 40], elbowL: [-50, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-50, 0, 0], hands: ['fist', 'fist'] },
    // the dash strike: a flying elbow
    gg_dashStrike: { root: { y: 0, rx: 26 }, hips: [0, -20, 0], spine: [10, 20, 0], chest: [8, 30, 0], head: [-16, -20, 0], shoulderR: [-90, 0, -60], elbowR: [-150, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-90, 0, 0], thighL: [-50, 0, 10], kneeL: [70, 0, 0], thighR: [10, 0, -8], kneeR: [40, 0, 0], hands: ['fist', 'fist'] },
    // in the air: both fists clasped over the head, then brought down
    gg_airHammerW: { root: { rx: -14 }, spine: [-14, 0, 0], chest: [-16, 0, 0], head: [-14, 0, 0], shoulderL: [-170, -20, 10], elbowL: [-30, 0, 0], shoulderR: [-170, 20, -10], elbowR: [-30, 0, 0], thighL: [-20, 0, 8], kneeL: [50, 0, 0], thighR: [-10, 0, -8], kneeR: [40, 0, 0], hands: ['fist', 'fist'] },
    gg_airHammer: { root: { rx: 24 }, spine: [18, 0, 0], chest: [16, 0, 0], head: [20, 0, 0], shoulderL: [-60, -20, 8], elbowL: [-10, 0, 0], shoulderR: [-60, 20, -8], elbowR: [-10, 0, 0], thighL: [-40, 0, 8], kneeL: [70, 0, 0], thighR: [-20, 0, -8], kneeR: [60, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- Blaster Meteor ---------------- */
    // the coil before it: low, the aura flaring — the tell
    gg_meteorW: { root: { y: -0.2, rx: 18 }, hips: [0, -20, 0], spine: [14, 16, 0], chest: [12, 20, 0], head: [-16, -16, 0], shoulderR: [10, 0, -30], elbowR: [-110, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-110, 0, 0], thighL: [-56, 14, 18], kneeL: [86, 0, 0], thighR: [6, -12, -16], kneeR: [56, 0, 0], hands: ['fist', 'fist'] },
    gg_meteorDash: { root: { rx: 62 }, spine: [0, 0, 0], chest: [-4, 0, 0], neck: [-22, 0, 0], head: [-30, 0, 0], shoulderR: [-150, 0, -8], elbowR: [-6, 0, 0], shoulderL: [20, 0, 20], elbowL: [-20, 0, 0], thighL: [6, 0, 4], kneeL: [20, 0, 0], footL: [55, 0, 0], thighR: [0, 0, -4], kneeR: [36, 0, 0], footR: [55, 0, 0], hands: ['fist', 'fist'] },
    gg_palmR: { root: { y: -0.06, rx: 8 }, hips: [0, -16, 0], spine: [8, 20, 0], chest: [6, 28, 0], head: [-6, -20, 0], shoulderR: [-90, 0, -6], elbowR: [-4, 0, 0], handR: [-70, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-100, 0, 0], thighL: [-34, 10, 12], kneeL: [36, 0, 0], thighR: [18, -10, -12], kneeR: [18, 0, 0], hands: ['fist', 'open'] },
    gg_palmL: { root: { y: -0.06, rx: 8 }, hips: [0, 16, 0], spine: [8, -20, 0], chest: [6, -28, 0], head: [-6, 20, 0], shoulderL: [-90, 0, 6], elbowL: [-4, 0, 0], handL: [-70, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-100, 0, 0], thighL: [-34, 10, 12], kneeL: [36, 0, 0], thighR: [18, -10, -12], kneeR: [18, 0, 0], hands: ['open', 'fist'] },
    gg_palms: { root: { y: -0.1, rx: 10 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0], shoulderL: [-88, -14, 6], elbowL: [-4, 0, 0], handL: [-70, 0, 0], shoulderR: [-88, 14, -6], elbowR: [-4, 0, 0], handR: [-70, 0, 0], thighL: [-40, 10, 18], kneeL: [46, 0, 0], thighR: [20, -10, -18], kneeR: [22, 0, 0], hands: ['open', 'open'] },
    /* ---------------- Soul Punisher ---------------- */
    // the sphere held up in the right hand in front of him, palm up
    gg_soulW: (t) => {
      const s = Math.sin(t * 20) * 1.2;
      return {
        root: { y: -0.04 }, hips: [0, -14, 0], spine: [-2, 10, 0], chest: [-6, 14, 0], head: [-6, -10, 0],
        shoulderR: [-96 + s, 0, -22], elbowR: [-56, 0, 0], handR: [40, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0],
        thighL: [-14, 8, 12], kneeL: [18, 0, 0], thighR: [6, -8, -12], kneeR: [14, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    gg_soulThrow: { root: { y: -0.08, rx: 12 }, hips: [0, 24, 0], spine: [10, 20, 0], chest: [8, 30, 0], head: [-6, -22, 0], shoulderR: [-80, 0, -4], elbowR: [-6, 0, 0], handR: [-50, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-90, 0, 0], thighL: [-40, 10, 14], kneeL: [44, 0, 0], thighR: [22, -10, -12], kneeR: [14, 0, 0], hands: ['fist', 'open'] },
    /* ---------------- Stardust Fall ---------------- */
    gg_stardustW: { root: { rx: -10 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [8, 0, 0], shoulderL: [40, 0, 30], elbowL: [-20, 0, 0], shoulderR: [40, 0, -30], elbowR: [-20, 0, 0], thighL: [-30, 0, 8], kneeL: [60, 0, 0], thighR: [-10, 0, -8], kneeR: [40, 0, 0], hands: ['open', 'open'] },
    gg_stardust: { root: { rx: 20 }, spine: [10, 10, 0], chest: [8, 14, 0], head: [24, -8, 0], shoulderR: [-50, 0, -6], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-80, 0, 0], thighL: [-36, 0, 8], kneeL: [70, 0, 0], thighR: [-14, 0, -8], kneeR: [44, 0, 0], hands: ['fist', 'open'] },
    gg_stardustL: { root: { rx: 20 }, spine: [10, -10, 0], chest: [8, -14, 0], head: [24, 8, 0], shoulderL: [-50, 0, 6], elbowL: [-4, 0, 0], handL: [-60, 0, 0], shoulderR: [-20, 0, -30], elbowR: [-80, 0, 0], thighL: [-36, 0, 8], kneeL: [70, 0, 0], thighR: [-14, 0, -8], kneeR: [44, 0, 0], hands: ['open', 'fist'] },
    gg_stardustFin: { root: { rx: 22 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [26, 0, 0], shoulderL: [-56, -14, 6], elbowL: [-4, 0, 0], handL: [-60, 0, 0], shoulderR: [-56, 14, -6], elbowR: [-4, 0, 0], handR: [-60, 0, 0], thighL: [-40, 0, 8], kneeL: [74, 0, 0], thighR: [-14, 0, -8], kneeR: [48, 0, 0], hands: ['open', 'open'] },
    /* ---------------- Big Bang Kamehameha ---------------- */
    // cupped at the right hip like a Kamehameha...
    gg_bbkCharge: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return {
        root: { y: -0.14 }, hips: [0, -44, 0], spine: [4, 32, 0], chest: [2, 38, 0], head: [-8, -40, 0],
        shoulderL: [42, 0, 20 + s], elbowL: [-112, 0, 0], shoulderR: [32, 0, -10 - s], elbowR: [-122, 0, 0],
        thighL: [-34, 22, 22], kneeL: [48, 0, 0], thighR: [16, -20, -20], kneeR: [32, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ...fired from one palm like a Big Bang Attack, the left hand clamped on the right forearm
    gg_bbkFire: { root: { y: -0.12, rx: 8 }, hips: [0, -16, 0], spine: [8, 14, 0], chest: [6, 18, 0], head: [-6, -14, 0], shoulderR: [-90, 6, -4], elbowR: [-2, 0, 0], handR: [-72, 0, 0], shoulderL: [-76, -34, 14], elbowL: [-40, 0, 0], handL: [-30, 0, 0], thighL: [-38, 12, 20], kneeL: [44, 0, 0], thighR: [22, -12, -20], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    /* ---------------- after the fight ---------------- */
    gg_victory: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({
        root: { y: -0.01 + b * 0.004 }, hips: [0, -8, 4], spine: [-2, 4, 0], chest: [-6, 6, 0], head: [-4, -14, 7],
        shoulderL: [-4, 0, 11], elbowL: [-16, 0, 0], shoulderR: [-4, 0, -11], elbowR: [-16, 0, 0],
        hands: ['fist', 'fist'],
      }, STAND);
    },
    // THE ONE: he has his back to the man falling behind him, completely relaxed...
    gg_victoryAway: (t) => {
      const b = Math.sin(t * 1.3);
      return Object.assign({
        root: { y: b * 0.003, ry: 150 }, spine: [-2, 0, 0], chest: [-4 + b * 0.6, 0, 0], neck: [0, 0, 0], head: [-4, 0, 0],
        shoulderL: [-4, 0, 10], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-14, 0, 0],
        hands: ['fist', 'fist'],
      }, STAND);
    },
    // ...and slowly turns his head to look back over his shoulder
    gg_victoryLook: (t) => {
      const b = Math.sin(t * 1.3);
      return Object.assign({
        root: { y: b * 0.003, ry: 150 }, spine: [-2, -12, 0], chest: [-4 + b * 0.6, -18, 0], neck: [0, -40, 0], head: [-6, -46, -4],
        shoulderL: [-4, 0, 10], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-14, 0, 0],
        hands: ['fist', 'fist'],
      }, STAND);
    },
    // beaten (Free Battle only): down on one knee, a hand on it, head hanging...
    gg_defeat: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.42 + b * 0.006, rx: 10 }, spine: [16, 0, 0], chest: [10 + b * 2, 0, 0], head: [14, 0, 0],
        shoulderR: [-40, 0, -10], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0],
        thighL: [-90, 0, 8], kneeL: [92, 0, 0], thighR: [8, 0, -8], kneeR: [112, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // ...and the head comes up with a grin anyway
    gg_defeatLook: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.4 + b * 0.005, rx: 6 }, spine: [10, 0, 0], chest: [4 + b * 1.5, 0, 0], head: [-10, -6, 4],
        shoulderR: [-40, 0, -10], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0],
        thighL: [-90, 0, 8], kneeL: [92, 0, 0], thighR: [8, 0, -8], kneeR: [112, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  const mv = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 3, active: 3, recovery: 9, cancel: 5, damage: dmg, reach: 1.2, radius: 0.76, lunge: 15, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);
  const H = (extra) => Object.assign({ startup: 10, active: 4, recovery: 18, reach: 1.3, radius: 0.95, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 30, impact: 3, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, extra);

  // the Super Saiyan transformation (beat by beat: the brief's ten)
  const SSJ_SEQUENCE = {
    length: 232,
    applyAt: 160,
    steps: [
      // the aura appears, quietly; the world darkens a little; the lens circles him
      { at: 0, pose: 'gg_power', speed: 6, expression: 'focused', aura: 0.15, auraColor: 0xe8f2ff, mood: [0.3, 0x0c1024, 0.9], shot: 'orbit', music: 0, sfx: 'kiUp' },
      // the wind: dust and stones lifting
      { at: 24, rocks: true, quake: 0.12, sfx: 'rumble' },
      // the particles rise; the light catches gold
      { at: 50, aura: 0.5, auraColor: 0xfff0b0, expression: 'serious', sfx: 'ssjRise', quake: 0.2 },
      // the hair starts to flicker between black and gold; the lightning
      { at: 82, hairFlicker: true, lightning: true, sfx: 'lightning', quake: 0.28, mood: [0.55, 0x060a18, 0.6] },
      // the scream — and his theme comes in under it
      { at: 112, pose: 'gg_scream', speed: 8, expression: 'shout', skyBolt: true, quake: 0.42, song: 'gogeta_theme', songLevel: 2 },
      { at: 140, skyBolt: true, quake: 0.5, sfx: 'lightning' },
      // the burst: gold, the eyes teal, the crater
      { at: 160, burst: true, pose: 'gg_scream', speed: 14, expression: 'shout', sfx: 'transformBurst', mood: [0.2, 0x2a2410, 0.3], flash: 0.7, crater: 6, hairFlicker: false, rocks: false, music: 3 },
      // the lens pulls back from his face to all of him, and he straightens with a smirk
      { at: 176, shot: 'pull' },
      { at: 192, pose: 'gg_tfPose', speed: 4, expression: 'cocky', lightning: true, mood: [0.05, 0x101020, 1.4] },
    ],
  };

  SL.data.characters.gogeta = {
    id: 'gogeta',
    assetLevel: 1,
    name: 'Gogeta',
    fullName: 'Gogeta (Goku + Vegeta, Fusion Dance)',
    era: 'What If',
    playable: true,
    prototype: true,
    style: 'Fusion · Explosive Speed',
    blurb: 'Goku and Vegeta, in step. Faster than either, and he finishes what he starts. He knows exactly how strong he is — he just rarely bothers to say it.',
    bio: 'The Fusion Dance done perfectly by the two proudest Saiyans alive: Goku\'s speed and instinct, Vegeta\'s precision and nerve, in one body that will only exist for thirty minutes. Calm while he is winning, playful while he is curious, and explosive the moment he decides it is over. He fights in short bursts — a flash step, a string that ends in a kick, a vanish behind you — and closes with the Soul Punisher or the Big Bang Kamehameha. Unlike Vegito he is not here to toy with anyone: he is here to finish it.',
    card: ['Fusion', 'Super Saiyan available'],
    ratings: { power: 5, speed: 5, ki: 5, defense: 4 },
    stats: { hp: 34000, ki: 160, stamina: 170, speed: 1.38, power: 1.85, defense: 1.35, weight: 1.0, kiRegen: 3.6, chargeRate: 46, canonPower: 9.5 },
    appearance: {
      height: 1.02,
      skin: SKIN,
      // the widest Saiyan frame: shoulders, forearms, a narrow waist
      build: {
        chestW: 0.232, chestD: 0.15, chestTop: 0.29, shoulderX: 0.236, delt: 0.09, waistW: 0.138, waistD: 0.108, pelvisW: 0.148,
        upperArmR: 0.067, foreArmR: 0.058, fist: 0.064, thighR: 0.096, shinR: 0.072, neckR: 0.068, neckLen: 0.058, headR: 0.124, footLen: 1.06,
      },
      hair: { style: 'gogeta', color: 0x121216 },
      face: { pupil: 0x121218, eyeW: 0.98, eyeH: 0.9, browThick: 1.25, jaw: 1.06, jawW: 1.0, cheeks: 0.6 },
      outfit: {
        // the Metamoran outfit (Fusion Reborn colours): the open vest over the bare chest
        topStyle: 'bare', top: SKIN, arms: SKIN,
        jacket: { color: VEST, open: 1.45 },
        paddedCollar: { color: COLLAR, size: 1.12 },
        wrist: BAND, wristLen: 0.1,
        belt: SASH, beltStyle: 'sash', sashTails: { len: 0.36, side: 1 },
        pants: WHITE, pantsStyle: 'gi',
        boots: WRAP, shoes: BAND, bootStyle: 'gi',
      },
      portraitColor: '#f08a24',
    },
    vfx: { ghost: 0xffe9b0, trail: 0xfff4d8, dashGhost: true },
    // short hard bursts, turnable mid-flight, a flash step at the start of each
    movement: { dashFrames: 11, burst: true, redirect: 0.35, flash: true },
    audio: { strikePitch: 1.05, heavyPitch: 0.92 },
    forms: [
      {
        id: 'base', name: 'Base',
        // subtle: a pale shimmer, never in the way of the body
        aura: { color: 0xe8f2ff, core: 0xffffff, particles: 0xdfeeff, speed: 1.3 },
        mult: { accel: 1.25 },
      },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 50, style: 'full',
        mult: { damage: 1.6, speed: 1.22, defense: 1.4, kiRegen: 2.2, chargeRate: 1.4, guardStamina: 0.75, accel: 1.45 },
        aura: { color: 0xffd23a, core: 0xfff6c0, particles: 0xffe680, idle: 0.5, speed: 1.65, sharp: 0.45, sparks: 0xfff3a0, lightning: true },
        look: { hair: { style: 'gogeta_ssj', color: 0xffd640 }, pupil: 0x16b4a2, brow: 0xe8b830, bulk: 1.05, muscle: 1.05 },
        poses: { idle: poses.gg_lowStance, flyIdle: poses.gg_flyIdleSsj },
        intro: { pose: 'gg_tfPose', expression: 'cocky' },
        victory: { poses: ['gg_armsCrossed', 'gg_victory'], expression: 'cocky' },
        // serious in gold: the rests between his bursts get short
        ai: { aggression: 0.95, defense: 0.75, rhythm: { burst: 6, rest: 34 } },
        ghost: 0xfff0a0,
        music: 3,
        sequence: SSJ_SEQUENCE,
      },
      // FORM EXPANSION POINT — Super Saiyan 4 goes here (forms[2]).
    ],
    poses: Object.assign({ idle: poses.gg_fight, run: poses.gg_run, flyIdle: poses.gg_flyIdle, flyForward: poses.gg_flyForward, guard: poses.gg_guard, charge: poses.gg_power }, poses),
    moves: {
      light: [
        mv('ggJab', 640, 'gg_jabW', 'gg_jab'),
        mv('ggCross', 700, 'gg_crossW', 'gg_cross'),
        mv('ggKnee', 760, 'gg_kneeW', 'gg_knee', { reach: 1.0, hitPose: 'hitBody' }),
        mv('ggBackfist', 800, 'gg_backfistW', 'gg_backfist', { hitPose: 'hitSideL' }),
        mv('ggRound', 980, 'gg_roundW', 'gg_round', { startup: 4, reach: 1.45, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitSideR', sfx: 'punchHeavy' }),
      ],
      heavy: {
        // the heavy right, alone: breaks a guard
        0: Object.assign(mv('ggHeavy', 2000, 'gg_heavyW', 'gg_heavy'), H({ knockSpeed: 32, guardCrush: true, guardDamage: 45 })),
        // one blow, then he is behind you: the vanishing kick
        1: Object.assign(mv('ggVanishKick', 1700, 'gg_roundW', 'gg_round'), H({ startup: 9, teleport: { to: 'behind', at: 2, kiCost: 8 }, hitPose: 'hitSideR' })),
        // two blows, then up: the launcher
        2: Object.assign(mv('ggLaunch', 1500, 'gg_launchW', 'gg_launch'), H({ startup: 8, recovery: 16, knock: 'launch', knockSpeed: 22, hitstun: 32, hitPose: 'hitBody' })),
        // three, then from above: the axe kick
        3: Object.assign(mv('ggAxe', 1900, 'gg_axeW', 'gg_axe'), H({ startup: 10, active: 5, knock: 'smash', knockSpeed: 36, hitstun: 36, teleport: { to: 'above', at: 2, kiCost: 10 } })),
        // the whole string: the thrust kick through the middle
        4: Object.assign(mv('ggThrust', 2300, 'gg_thrustW', 'gg_thrust'), H({ startup: 9, reach: 1.55, knockSpeed: 38, hitstun: 36, guardCrush: true, guardDamage: 40 })),
      },
      airHeavy: {
        0: Object.assign(mv('ggAirHammer', 1900, 'gg_airHammerW', 'gg_airHammer'), H({ knock: 'smash', knockSpeed: 34 })),
        2: Object.assign(mv('ggAirKnee', 1500, 'gg_kneeW', 'gg_knee'), H({ startup: 8, knock: 'launch', knockSpeed: 20, hitPose: 'hitBody' })),
        4: Object.assign(mv('ggAirSpin', 2100, 'gg_roundW', 'gg_round'), H({ knockSpeed: 32, hitPose: 'hitAirSpin' })),
      },
      dash: Object.assign(mv('ggDashElbow', 1500, 'gg_meteorW', 'gg_dashStrike'), { startup: 4, active: 8, recovery: 14, lunge: 38, knock: 'heavy', knockSpeed: 28, impact: 3, hitstun: 28, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      chase: {
        smash: Object.assign(mv('ggChaseAxe', 1500, 'gg_axeW', 'gg_axe'), H({ startup: 5, active: 6, knock: 'smash', knockSpeed: 36, lunge: 16 })),
        strike: Object.assign(mv('ggChaseKick', 1400, 'gg_thrustW', 'gg_thrust'), H({ startup: 5, active: 6, lunge: 16 })),
      },
      throw: { id: 'ggToss', name: 'Fusion Toss', damage: 1500, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // in, three blows, three shots from the palms, both palms: a playable flurry, not a cutscene
      // (the dash can be dodged; the coil before it is the tell)
      special1: {
        id: 'blasterMeteor', name: 'Blaster Meteor', type: 'rush', kiCost: 32, icon: 'rush',
        startup: 9, dashFrames: 20, speed: 70, recovery: 24,
        poses: { wind: 'gg_meteorW', dash: 'gg_meteorDash' },
        hits: [
          { pose: 'gg_jab', damage: 650, frames: 6, sfx: 'punchLight' },
          { pose: 'gg_cross', damage: 700, frames: 6, sfx: 'punchHeavy' },
          { pose: 'gg_knee', damage: 760, frames: 7, sfx: 'punchHeavy' },
          { pose: 'gg_palmR', damage: 480, frames: 6, ki: { color: 0xffe27a, hand: 'R' } },
          { pose: 'gg_palmL', damage: 480, frames: 6, ki: { color: 0x8ad8ff, hand: 'L' } },
          { pose: 'gg_palmR', damage: 480, frames: 7, ki: { color: 0xffe27a, hand: 'R' } },
          { pose: 'gg_palms', damage: 1900, frames: 20, ki: { color: 0xfff4c0, hand: 'both' }, explode: 1.6, knock: 'heavy', knockSpeed: 36, impact: 4 },
        ],
      },
      // hold to grow it; let go to throw
      special2: {
        id: 'soulPunisher', name: 'Soul Punisher', type: 'projectile', kiCost: 30, icon: 'ball',
        startup: 18, recovery: 26, pose: { wind: 'gg_soulW', release: 'gg_soulThrow' }, releaseSfx: 'soulPunisher',
        holdCharge: { max: 70, damage: 1.9, radius: 1.6 },
        projectile: { kind: 'soul', speed: 46, radius: 0.62, damage: 2300, homing: 0.6, color: 0xdff2ff, core: 0xffffff, explode: 3.2, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3.2 },
      },
      ultimate: {
        id: 'bigBangKame', name: 'Big Bang Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [10500, 10500], radius: [2.0, 2.0], speed: 112, range: 190, sustain: 56,
        // Kamehameha blue around a Big Bang's gold-white core, gold rings running down it
        color: 0x6ab8ff, core: 0xfff2c0, style: { rings: 5, ringColor: 0xffd860, ringSpeed: 1.8 },
        poses: { charge: 'gg_bbkCharge', fire: 'gg_bbkFire' }, oneHand: true, recovery: 40, cinematic: true,
        sound: 'kame', chargeLight: 0xffe27a,
        callout: ['BIG BANG', 'KAMEHAME', 'HA!'],
        formVariants: {
          ssj: { name: 'Big Bang Kamehameha', radiusMul: 1.2, damageMul: 1.1, core: 0xffffff, ringColor: 0xfff0a0 },
        },
      },
    },
    extras: [
      {
        id: 'stardustFall', name: 'Stardust Fall', type: 'stardustFall', kiCost: 36, icon: 'ball',
        rise: 14, height: 6, shots: 14, interval: 3, damage: 380, finalDamage: 1500, speed: 72, recovery: 22,
        colors: [0x8ad8ff, 0xffe36a, 0xff9ad8, 0x9affc0, 0xffffff],
        poses: { wind: 'gg_stardustW', fire: 'gg_stardust', fireL: 'gg_stardustL', finish: 'gg_stardustFin' },
      },
      {
        id: 'gogetaIT', name: 'Instant Transmission', type: 'teleport', kiCost: 16, icon: 'teleport',
        startup: 5, recovery: 6, cooldown: 40, escapeKiCost: 30, followWindow: 34, followBonus: 1.3, pose: 'gg_it',
        modes: { behind: true, front: true, away: true, above: true },
        fatigue: { window: 240, kiStep: 7, cooldownStep: 16, max: 3 },
        shimmer: true,
      },
    ],
    mechanic: { type: 'fusionTempo', name: 'Fusion Tempo', desc: 'Keep the pressure on: clean hits, counters, vanishes and Perfect Guards build his tempo; getting hit breaks it. At full tempo he is IN THE ZONE for five seconds — faster, harder, and vanishing costs almost nothing.' },
    ai: { personality: 'martial', aggression: 0.85, defense: 0.72, ranged: 0.35, beam: 0.35, transformHp: 0.65, preferredRange: 2.4, hooks: 'gogeta', rhythm: { burst: 4, rest: 64 } },
    barks: { taunt: 'gogeta_taunt', combo: 'gogeta_combo', hurt: 'gogeta_hurt', lowHp: 'gogeta_lowHp', tempo: 'gogeta_tempo', ultimate: 'gogeta_ultimate' },
    sequences: {
      // calm: he looks up at the other man, a small smirk, the stance
      intro: [
        { pose: 'gg_arrival', dur: 0.55, speed: 4, expression: 'calm' },
        { pose: 'gg_rise', dur: 0.4, speed: 6, expression: 'focused' },
        { pose: 'gg_smirk', dur: 0.65, speed: 7, expression: 'smirk' },
        { pose: 'gg_fight', dur: 0.6, speed: 9, expression: 'focused' },
      ],
      victory: [
        // his back to the one who fell, then the head turning, the smirk
        [{ pose: 'gg_victoryAway', dur: 1.3, speed: 3, expression: 'calm' }, { pose: 'gg_victoryLook', dur: 9, speed: 1.6, expression: 'smirk' }],
        [{ pose: 'gg_shoulderRoll', dur: 0.9, speed: 7, expression: 'cocky' }, { pose: 'gg_victory', dur: 9, speed: 5, expression: 'smirk' }],
        [{ pose: 'gg_neck', dur: 0.9, speed: 7, expression: 'calm' }, { pose: 'gg_armsCrossed', dur: 9, speed: 5, expression: 'cocky' }],
        [{ pose: 'gg_glove', dur: 0.8, speed: 8, expression: 'focused' }, { pose: 'gg_twoFinger', dur: 9, speed: 5, expression: 'smirk' }],
      ],
      defeat: [{ pose: 'gg_defeat', dur: 1.4, speed: 5, expression: 'exhausted' }, { pose: 'gg_defeatLook', dur: 9, speed: 3, expression: 'smirk' }],
    },
    intro: { pose: 'gg_smirk', expression: 'smirk' },
    victory: { poses: ['gg_victory'], expression: 'smirk' },
    defeat: { pose: 'gg_defeat', expression: 'exhausted' },
  };

  SL.data.fusions = SL.data.fusions || {};
  // the Fusion Dance: thirty minutes in canon; a What-If keeps him for as long as the fight lasts
  SL.data.fusions.gogeta = { parts: ['goku', 'vegeta'], method: 'dance', seconds: 0 };
})();
