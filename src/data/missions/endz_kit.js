/*
 * THE END OF Z KIT — what the last chapter of the Buu Saga shares (Chapter 15: Peace, Ten Years Later,
 * the 28th World Tournament). Same mission API as every chapter; nothing here is engine code.
 *
 *   instant(b, f) / kaiKai(b, list)   Goku's Instant Transmission, Kibito Kai's Kai Kai (flash + sound)
 *   exhausted(m, f)                   the player walks and nothing else: slow, no flight, no attacks, a
 *                                     trudge for a run and a stoop for an idle — "that was everything"
 *   ride(rider, carrier)              a rider on a carrier's back (Uub on Goku's), every tick, standing or flying
 *   hold(f, kind)                     a prop on a body: 'pole' (a yoke with two water jars), 'paper' (the
 *                                     tournament flyer), 'sweets' (a stack of cakes), 'bundle' (a baby in a
 *                                     cloth), 'sack' (a bundle on a stick over the shoulder)
 *   echo(m, f, seconds)               the pink ghost of Kid Buu over a body for a moment (Goku's memory)
 *   tiles(b, centre)                  pieces of the tournament ring lifting off it under the pressure
 *   shenron(b, base, facing)          the Earth's Eternal Dragon, rising from the balls into a dark sky
 *   dragonBalls(b, centre)            the seven balls on the Lookout floor
 *   stars(b) / ping(b, pos)           a night sky; a ki felt from very far away (a pulse on the horizon)
 *   streak(b)                         two people flying away, seen from very far: a spark and its trail
 *
 * Presentation randomness is a seeded stream of its own (never Math.random: it would shift the seeded fights).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const PZ = SL.data.poses;
  const glow = () => SL.Toon.tex.glow;

  /* ================================================================ poses shared by the chapter */
  // AFTER THE SPIRIT BOMB: sitting in the dirt where his legs gave out, knees up, forearms over them, head hanging
  PZ.pe_slumpSit = (t) => {
    const s = Math.sin(t * 1.9);
    return {
      root: { y: -0.8, rx: 4 }, spine: [16 + s * 2, 0, 0], chest: [12 + s * 3, 0, 0], neck: [10, 0, 0], head: [14, 0, 0],
      shoulderL: [-58, 0, 10], elbowL: [-34, 0, 0], shoulderR: [-58, 0, -10], elbowR: [-34, 0, 0],
      thighL: [-96, 0, 14], kneeL: [112, 0, 0], thighR: [-96, 0, -14], kneeR: [112, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // trying to get up — a hand on a knee, the other arm out, halfway there
  PZ.pe_tryStand = (t) => {
    const q = Math.sin(t * 30) * 2;
    return {
      root: { y: -0.36, rx: 26 }, spine: [22, 0, 0], chest: [14 + q, 0, 0], head: [-4, 0, 0],
      shoulderL: [-70, 0, 6], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -30], elbowR: [-10, 0, 0],
      thighL: [-96, 0, 10], kneeL: [100, 0, 0], thighR: [-40, 0, -10], kneeR: [110, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // THE TRUDGE: bent at the waist, arms hanging, the feet barely lifting (the exhausted player's run)
  PZ.pe_trudge = (t, ctx) => {
    const ph = t * 4.2;
    const s = Math.sin(ph), c = Math.cos(ph);
    return {
      root: { y: -0.1 + Math.abs(c) * 0.02, rx: 16 }, spine: [16, s * 4, 0], chest: [10, s * 5, 0], neck: [6, 0, 0], head: [-8, -s * 4, 0],
      shoulderL: [s * 10 + 4, 0, 10], elbowL: [-22, 0, 0], shoulderR: [-s * 10 + 4, 0, -10], elbowR: [-22, 0, 0],
      thighL: [-s * 22 - 10, 0, 4], kneeL: [26 + Math.max(0, s) * 26, 0, 0], footL: [6, 0, 0],
      thighR: [s * 22 - 10, 0, -4], kneeR: [26 + Math.max(0, -s) * 26, 0, 0], footR: [6, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the knee going: a stumble onto one knee, a hand down in the dirt
  PZ.pe_stumble = {
    root: { y: -0.48, rx: 30 }, spine: [24, 0, 0], chest: [14, 0, 0], head: [-8, 0, 0],
    shoulderL: [-70, 0, 10], elbowL: [-10, 0, 0], shoulderR: [-30, 0, -14], elbowR: [-40, 0, 0],
    thighL: [-30, 0, 8], kneeL: [118, 0, 0], thighR: [-90, 0, -6], kneeR: [96, 0, 0],
    hands: ['open', 'open'],
  };
  // Mr. Satan sitting back against the rock, legs out, getting his breath
  PZ.pe_satanSit = (t) => {
    const s = Math.sin(t * 3.4);
    return {
      root: { y: -0.8, rx: -14 }, spine: [-4, 0, 0], chest: [-6 + s * 3, 0, 0], head: [-10, 0, 0],
      shoulderL: [10, 0, 26], elbowL: [-14, 0, 0], shoulderR: [10, 0, -26], elbowR: [-14, 0, 0],
      thighL: [-76, 0, 12], kneeL: [16, 0, 0], thighR: [-70, 0, -16], kneeR: [30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // DENDE HEALING: down on his knees beside somebody lying on the ground, both palms out over them
  PZ.pe_heal = (t) => {
    const s = Math.sin(t * 2.5);
    return {
      root: { y: -0.44, rx: 22 }, spine: [16, 0, 0], chest: [10, 0, 0], neck: [10, 0, 0], head: [18, 0, 0],
      shoulderL: [-58 + s * 2, 0, 14], elbowL: [-14, 0, 0], shoulderR: [-58 - s * 2, 0, -14], elbowR: [-14, 0, 0],
      handL: [-30, 0, 0], handR: [-30, 0, 0],
      thighL: [-92, 0, 10], kneeL: [100, 0, 0], thighR: [-92, 0, -10], kneeR: [100, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // Vegeta coming up off his back: propped on both hands, chest heaving, head forward
  PZ.pe_sitUpGasp = (t) => {
    const s = Math.sin(t * 6);
    return {
      root: { y: -0.62, rx: -18 }, spine: [8 + s * 3, 0, 0], chest: [10 + s * 4, 0, 0], neck: [10, 0, 0], head: [6, 0, 0],
      shoulderL: [30, 0, 22], elbowL: [-6, 0, 0], shoulderR: [30, 0, -22], elbowR: [-6, 0, 0],
      thighL: [-80, 0, 10], kneeL: [26, 0, 0], thighR: [-74, 0, -14], kneeR: [40, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the arm out at the fat one, palm open, ki gathering in it; the other hand gripping the wrist
  PZ.pe_palmAim = (t) => {
    const q = Math.sin(t * 34) * 0.8;
    return {
      root: { y: -0.04 }, hips: [0, 16, 0], spine: [4, 10, 0], chest: [2, 16, 0], head: [-4, -18, 0],
      shoulderR: [-88 + q, 0, 4], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-72, 40, 10], elbowL: [-60, 0, 0],
      thighL: [-18, 10, 12], kneeL: [22, 0, 0], thighR: [12, -8, -12], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...the arm being lowered by somebody else's hand: the palm still open, the face turning away
  PZ.pe_armLowered = {
    root: { y: -0.02 }, hips: [0, 10, 0], spine: [2, 6, 0], chest: [0, 10, 0], head: [-2, 34, 0],
    shoulderR: [-36, 0, -6], elbowR: [-10, 0, 0], shoulderL: [-14, 0, 12], elbowL: [-30, 0, 0],
    thighL: [-8, 0, 10], kneeL: [10, 0, 0], thighR: [6, 0, -10], kneeR: [8, 0, 0],
    hands: ['open', 'fist'],
  };
  // Goku's left hand on that wrist, gently bringing it down
  PZ.pe_wristLower = (t) => ({
    root: { y: -0.02 }, spine: [6, 0, 0], chest: [4, -14, 0], head: [-4, 10, 0],
    shoulderL: [-50, 0, -10], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -10], elbowR: [-20, 0, 0],
    thighL: [-10, 0, 10], kneeL: [12, 0, 0], thighR: [6, 0, -10], kneeR: [8, 0, 0],
    hands: ['open', 'open'],
  });
  // Mr. Satan on his knees in front of Good Buu, facing the man with the raised palm, arms flung wide, sobbing
  PZ.pe_shieldBuu = (t) => {
    const s = Math.sin(t * 9);
    return {
      root: { y: -0.46, rx: 6 }, spine: [4, 0, 0], chest: [-4 + s * 3, 0, 0], neck: [-6, 0, 0], head: [-14, 0, 0],
      shoulderL: [-20, 0, 84], elbowL: [-10, 0, 0], shoulderR: [-20, 0, -84], elbowR: [-10, 0, 0],
      thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // sitting on a rock, hands on his knees, at ease for once
  PZ.pe_rockSit = (t) => {
    const s = Math.sin(t * 1.6);
    return {
      root: { y: -0.36, rx: -4 }, spine: [6, 0, 0], chest: [2 + s, 0, 0], head: [-8, 0, 0],
      shoulderL: [-40, 0, 14], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -14], elbowR: [-40, 0, 0],
      thighL: [-86, 0, 14], kneeL: [84, 0, 0], thighR: [-86, 0, -14], kneeR: [84, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...a hand up, to be pulled to his feet
  PZ.pe_reachUp = {
    root: { y: -0.36, rx: -8 }, spine: [2, 0, 0], chest: [-4, -10, 0], head: [-18, 12, 0],
    shoulderL: [-40, 0, 14], elbowL: [-40, 0, 0], shoulderR: [-130, 0, -16], elbowR: [-10, 0, 0],
    thighL: [-86, 0, 14], kneeL: [84, 0, 0], thighR: [-86, 0, -14], kneeR: [84, 0, 0],
    hands: ['open', 'open'],
  };
  // Vegeta hauling him up by that hand: one pull, the weight back
  PZ.pe_haul = {
    root: { y: -0.06, rx: -8 }, hips: [0, -10, 0], spine: [-4, -8, 0], chest: [-6, -12, 0], head: [6, 10, 0],
    shoulderR: [-60, 0, -6], elbowR: [-24, 0, 0], shoulderL: [-14, 0, 12], elbowL: [-40, 0, 0],
    thighL: [-26, 0, 10], kneeL: [30, 0, 0], thighR: [16, 0, -10], kneeR: [10, 0, 0],
    hands: ['fist', 'open'],
  };
  // CHI-CHI: up on her toes, arms round his neck
  PZ.pe_hugNeck = (t) => {
    const s = Math.sin(t * 7);
    return {
      root: { y: 0.04, rx: 6 }, spine: [-4, 0, 0], chest: [-6 + s * 2, 0, 0], head: [-12, 0, 14],
      shoulderL: [-140, 0, -8], elbowL: [-80, 0, 0], shoulderR: [-140, 0, 8], elbowR: [-80, 0, 0],
      thighL: [-6, 0, 4], kneeL: [10, 0, 0], footL: [36, 0, 0], thighR: [-6, 0, -4], kneeR: [10, 0, 0], footR: [36, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...and Goku, held: one arm round her back, the other hand scratching the back of his head
  PZ.pe_hugged = (t) => ({
    root: { y: 0 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [-8, -10, 0],
    shoulderL: [-60, 30, 30], elbowL: [-80, 0, 0], shoulderR: [-150, 0, -48], elbowR: [-124 + Math.sin(t * 9) * 8, 0, 0],
    thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
    hands: ['open', 'open'],
  });
  // BULMA: arms round his chest, her cheek against his shoulder
  PZ.pe_hugChest = (t) => ({
    root: { y: 0, rx: 8 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [6, 0, 18],
    shoulderL: [-84, 0, -18], elbowL: [-70, 0, 0], shoulderR: [-84, 0, 18], elbowR: [-70, 0, 0],
    thighL: [-6, 0, 4], kneeL: [8, 0, 0], thighR: [-6, 0, -4], kneeR: [8, 0, 0],
    hands: ['open', 'open'],
  });
  // ...and Vegeta, held: arms rigid at his sides, fists clenched, the face turned away (red)
  PZ.pe_stiff = (t) => ({
    root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-6, 46, 0],
    shoulderL: [-4, 0, 6], elbowL: [-6, 0, 0], shoulderR: [-4, 0, -6], elbowR: [-6, 0, 0],
    thighL: [-2, 0, 4], kneeL: [2, 0, 0], thighR: [-2, 0, -4], kneeR: [2, 0, 0],
    hands: ['fist', 'fist'],
  });
  // a grown-up's fist in the air
  PZ.pe_fistUp = (t) => {
    const b = Math.sin(t * 6);
    return {
      root: { y: 0.01 + Math.max(0, b) * 0.03 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-14, 0, 0],
      shoulderR: [-168, 0, -14], elbowR: [-12, 0, 0], shoulderL: [-30, 0, 16], elbowL: [-90, 0, 0],
      thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // Dende at the Lookout's edge watching the world below: eyes closed, hands folded
  PZ.pe_watchEarth = (t) => ({
    root: { y: 0 }, spine: [4, 0, 0], chest: [2, 0, 0], head: [10, 0, 0],
    shoulderL: [-30, 30, 4], elbowL: [-80, 0, 0], shoulderR: [-30, -30, -4], elbowR: [-80, 0, 0],
    thighL: [-2, 0, 4], kneeL: [2, 0, 0], thighR: [-2, 0, -4], kneeR: [2, 0, 0],
    hands: ['open', 'open'],
  });
  // Mr. Satan has an idea: one finger up
  PZ.pe_idea = (t) => ({
    root: { y: 0.01 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-12, 6, 0],
    shoulderR: [-150, 0, -12], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-90, 0, 0],
    thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0],
    hands: ['fist', 'point'],
  });
  // THE NIGHT AT THE EDGE: cross-legged on the Lookout floor, hands on his knees
  PZ.pe_sitEdge = (t) => {
    const s = Math.sin(t * 1.2);
    return {
      root: { y: -0.8 }, spine: [2, 0, 0], chest: [s, 0, 0], head: [-6, 0, 0],
      shoulderL: [-30, 0, 18], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -18], elbowR: [-40, 0, 0],
      thighL: [-80, 0, 60], kneeL: [130, 0, 0], thighR: [-80, 0, -60], kneeR: [130, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...the head turned to the south
  PZ.pe_sitTurn = (t) => ({
    root: { y: -0.8 }, spine: [2, 0, 0], chest: [0, 10, 0], head: [-10, 36, 0],
    shoulderL: [-30, 0, 18], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -18], elbowR: [-40, 0, 0],
    thighL: [-80, 0, 60], kneeL: [130, 0, 0], thighR: [-80, 0, -60], kneeR: [130, 0, 0],
    hands: ['open', 'open'],
  });
  // flat on his back, hands behind his head, looking at the stars
  PZ.pe_lieStars = (t) => ({
    root: { y: -0.78, rx: -88 }, spine: [0, 0, 0], chest: [0, 0, 0], head: [-10, 0, 0],
    shoulderL: [-170, 0, 50], elbowL: [-130, 0, 0], shoulderR: [-170, 0, -50], elbowR: [-130, 0, 0],
    thighL: [-30, 0, 6], kneeL: [56, 0, 0], thighR: [0, 0, -6], kneeR: [4, 0, 0],
    hands: ['open', 'open'],
  });
  // a mother sitting with a baby in her arms
  PZ.pe_cradle = (t) => {
    const s = Math.sin(t * 1.4);
    return {
      root: { y: -0.8, rx: 4 }, spine: [10, 0, 0], chest: [6, 0, 0], neck: [12, 0, 0], head: [22 + s * 2, 0, 0],
      shoulderL: [-50, 30, 10], elbowL: [-100, 0, 0], shoulderR: [-40, -20, -10], elbowR: [-100, 0, 0],
      thighL: [-80, 0, 50], kneeL: [130, 0, 0], thighR: [-80, 0, -50], kneeR: [130, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // GOKU, TEN YEARS ON — the fake villain: arms crossed high, chin up, leaning in over the kid
  PZ.ez_scowl = (t) => ({
    root: { y: 0, rx: 10 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [16, 0, 0],
    shoulderL: [-24, -72, 6], elbowL: [-96, 0, 0], shoulderR: [-28, 72, -6], elbowR: [-92, 0, 0],
    thighL: [-8, 0, 12], kneeL: [8, 0, 0], thighR: [4, 0, -12], kneeR: [6, 0, 0],
  });
  // blocking with the forearms, laughing (the clash)
  PZ.ez_forearms = (t) => {
    const s = Math.sin(t * 5);
    return {
      root: { y: -0.08 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-10, 0, 0],
      shoulderL: [-80, 30, 10], elbowL: [-110, 0, 0], shoulderR: [-80, -30, -10], elbowR: [-110, 0, 0],
      thighL: [-24, 0, 12], kneeL: [32 + s * 2, 0, 0], thighR: [14, 0, -12], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // THE FIST CLASH (the owner's reference): lunging forward, the right arm out straight to meet the boy's fist
  PZ.ez_fistClash = (t) => {
    const q = Math.sin(t * 40) * 1;
    return {
      root: { y: -0.22, rx: 16 }, hips: [0, 18, 0], spine: [8, 10, 0], chest: [6 + q, 16, 0], head: [-14, -12, 0],
      shoulderR: [-74, 0, -2], elbowR: [-4, 0, 0], shoulderL: [-6, 10, 30], elbowL: [-40, 0, 0],
      thighL: [-58, 0, 10], kneeL: [66, 0, 0], thighR: [30, 0, -10], kneeR: [24, 0, 0], footR: [20, 0, 0],
      hands: ['open', 'fist'],
    };
  };
  // the fist caught in his open hand, low, at the boy's height
  PZ.ez_catch = (t) => ({
    root: { y: -0.16, rx: 8 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [6, 0, 0],
    shoulderR: [-62, 0, -6], elbowR: [-14, 0, 0], shoulderL: [-14, 0, 14], elbowL: [-20, 0, 0],
    thighL: [-40, 0, 12], kneeL: [44, 0, 0], thighR: [10, 0, -12], kneeR: [30, 0, 0],
    hands: ['open', 'open'],
  });
  // down on one knee, a hand on the boy's shoulder
  PZ.ez_kneelHand = (t) => ({
    root: { y: -0.46, rx: 8 }, spine: [6, 0, 0], chest: [2, 0, 0], head: [-6, 0, 0],
    shoulderR: [-72, 0, -6], elbowR: [-18, 0, 0], shoulderL: [-30, 0, 10], elbowL: [-60, 0, 0],
    thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
    hands: ['open', 'open'],
  });
  // the two-finger salute from the forehead (the Buu farewell, standing)
  PZ.ez_salute = (t) => ({
    root: { y: 0 }, spine: [0, 0, 0], chest: [-2, -8, 0], head: [-6, 6, 4],
    shoulderR: [-118, 0, -38], elbowR: [-136, 0, 0], shoulderL: [-8, 0, 10], elbowL: [-20, 0, 0],
    thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
    hands: ['open', 'point'],
  });
  // a big wave to the stands, both arms
  PZ.ez_waveBoth = (t) => {
    const w = Math.sin(t * 8);
    return {
      root: { y: 0.01 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-14, 0, 0],
      shoulderL: [-166, 0, 24 + w * 14], elbowL: [-16, 0, 0], shoulderR: [-166, 0, -24 - w * 14], elbowR: [-16, 0, 0],
      thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // crouched for a rider, hands back to take his legs
  PZ.ez_crouchCarry = {
    root: { y: -0.34, rx: 22 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-26, 0, 0],
    shoulderL: [30, 0, 30], elbowL: [-50, 0, 0], shoulderR: [30, 0, -30], elbowR: [-50, 0, 0],
    thighL: [-70, 0, 10], kneeL: [100, 0, 0], thighR: [-70, 0, -10], kneeR: [100, 0, 0],
    hands: ['open', 'open'],
  };
  // standing with a rider: arms back under the boy's knees
  PZ.ez_carry = (t) => ({
    root: { y: -0.02, rx: 6 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-8, 0, 0],
    shoulderL: [26, 0, 26], elbowL: [-60, 0, 0], shoulderR: [26, 0, -26], elbowR: [-60, 0, 0],
    thighL: [-4, 0, 8], kneeL: [8, 0, 0], thighR: [-4, 0, -8], kneeR: [8, 0, 0],
    hands: ['open', 'open'],
  });
  // flying with him: leaning into it, one fist forward, the other arm back under him
  PZ.ez_carryFly = (t) => {
    const s = Math.sin(t * 9);
    return {
      root: { rx: 38 }, spine: [-2, 0, 0], chest: [-4, 0, 0], neck: [-14, 0, 0], head: [-24, 0, 0],
      shoulderR: [-160, 0, -10], elbowR: [-6, 0, 0], shoulderL: [26, 0, 26], elbowL: [-60, 0, 0],
      thighL: [6 + s * 3, 0, 4], kneeL: [22, 0, 0], footL: [50, 0, 0], thighR: [14 - s * 3, 0, -4], kneeR: [34, 0, 0], footR: [50, 0, 0],
      hands: ['open', 'fist'],
    };
  };
  // the kick off the stone floor: crouched deep, about to spring
  PZ.ez_launch = {
    root: { y: -0.4, rx: 20 }, spine: [14, 0, 0], chest: [8, 0, 0], head: [-34, 0, 0],
    shoulderR: [30, 0, -30], elbowR: [-50, 0, 0], shoulderL: [30, 0, 30], elbowL: [-50, 0, 0],
    thighL: [-84, 0, 12], kneeL: [116, 0, 0], thighR: [-84, 0, -12], kneeR: [116, 0, 0],
    hands: ['open', 'open'],
  };
  // a plain wave from the seats
  PZ.ez_wave = (t) => {
    const w = Math.sin(t * 9);
    return {
      root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-10, 0, 0],
      shoulderR: [-160, 0, -28 - w * 14], elbowR: [-18, 0, 0], shoulderL: [-10, 0, 12], elbowL: [-20, 0, 0],
      thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0],
      hands: ['fist', 'open'],
    };
  };
  // Chi-Chi shaking her fist from the stands
  PZ.ez_fistShake = (t) => {
    const s = Math.sin(t * 16);
    return {
      root: { y: 0.01 }, spine: [-4, 0, 0], chest: [-6, 0, s * 3], head: [-12, 0, 0],
      shoulderR: [-150, 0, -20], elbowR: [-60 + s * 20, 0, 0], shoulderL: [-30, 0, 26], elbowL: [-100, 0, 0],
      thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // training alone at dawn (Goku): a slow kata, flowing from one guard to the next
  PZ.ez_kata = (t) => {
    const s = Math.sin(t * 1.3), c = Math.cos(t * 1.3);
    return {
      root: { y: -0.16 + s * 0.04 }, hips: [0, s * 30, 0], spine: [4, s * 10, 0], chest: [2, s * 16, 0], head: [-4, -s * 22, 0],
      shoulderL: [-70 + c * 20, 0, 20 + s * 10], elbowL: [-60 - c * 30, 0, 0], shoulderR: [-60 - c * 20, 0, -20 + s * 10], elbowR: [-70 + c * 30, 0, 0],
      thighL: [-34, s * 10, 14], kneeL: [44, 0, 0], thighR: [20, s * 10, -14], kneeR: [30, 0, 0],
      hands: ['open', 'fist'],
    };
  };

  /* ================================================================ the kit */
  const EK = (SL.data.endzKit = {
    /** Goku's Instant Transmission arriving or leaving: a white flash, a pale ring, the sound. */
    instant(b, f) {
      b.vfx.flash(f.chest(), 2.4, 0xffffff, 0.26, glow());
      b.vfx.ring(f.chest(), 2.6, 0xcfe8ff, 0.32);
      b.sfx('teleport', f, {});
    },
    /** Kibito Kai's Kai Kai: a pale-violet flash round each of them. */
    kaiKai(b, list) {
      for (const f of list) {
        if (!f) continue;
        b.vfx.flash(f.chest(), 3, 0xe6d0ff, 0.32, glow());
        b.vfx.ring(f.pos.clone().add(new V3(0, 0.1, 0)), 2.6, 0xd8c0ff, 0.4, new V3(0, 1, 0));
      }
      b.sfx('teleport', null, { pitch: 0.8 });
    },

    /**
     * EXHAUSTED: the player can walk and nothing else. A third of his speed, no flight, no attacks, no
     * guard; the run is a trudge and the idle a stoop. Returns off() (restores everything).
     */
    exhausted(m, f) {
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.mx;
      delete lim.my;
      const prevLim = m.battle.playerLimits;
      m.limits(lim);
      const prev = { moveScale: f.moveScale, noFlight: f.noFlight, poses: f.anim.poses };
      f.moveScale = 0.32;
      f.noFlight = true;
      f.anim.poses = Object.assign({}, f.anim.poses, { run: PZ.pe_trudge, idle: PZ.exhausted });
      let done = false;
      const off = () => {
        if (done) return;
        done = true;
        f.moveScale = prev.moveScale;
        f.noFlight = prev.noFlight;
        f.anim.poses = prev.poses;
        m.limits(prevLim);
      };
      m.onDispose(off);
      return off;
    },

    /** A rider on the carrier's back (Uub on Goku's), standing or flying: call every tick while he rides. */
    ride(rider, carrier) {
      const j = carrier.model.joints.chest;
      carrier.model.root.updateMatrixWorld(true);
      const chest = j.getWorldPosition(new V3()).sub(carrier.object.position).add(carrier.pos);
      const q = j.getWorldQuaternion(new THREE.Quaternion());
      const back = new V3(0, 0, -1).applyQuaternion(q);
      const up = new V3(0, 1, 0).applyQuaternion(q);
      const s = carrier.model.root.scale.y;
      const hip = rider.model.b.hipY * rider.model.root.scale.y;
      // his hips a hand below the carrier's chest joint (measured: the head then just clears the shoulder)
      // ...and a little to the carrier's right, so the boy's face shows over that shoulder
      const right = new V3(1, 0, 0).applyQuaternion(q);
      const p = chest.addScaledVector(back, 0.24 * s).addScaledVector(up, 0.02 * s).addScaledVector(right, -0.12 * s);
      p.y -= hip;
      rider.setPosition(p);
      if (rider.prevPos) rider.prevPos.copy(p);
      rider.vel.set(0, 0, 0);
      rider.fallVel = 0;
      rider.grounded = false;
      rider.yaw = rider.prevYaw = carrier.yaw;
    },

    /**
     * A PROP ON A BODY, parented to a joint so it follows every pose. kind: 'pole' (a yoke across the
     * shoulders, a clay jar at each end), 'paper' (a flyer in the right hand), 'sweets' (a stack of cakes in
     * both hands), 'bundle' (a baby wrapped in cloth, in the arms), 'sack' (a cloth bundle on a stick over
     * the right shoulder). Returns { group, dispose }.
     */
    hold(f, kind) {
      const T = SL.Toon, J = f.model.joints;
      const g = new THREE.Group();
      const mats = [], geos = [];
      const mk = (geo, color, o = {}) => {
        const m = T.makeMat(color, {});
        mats.push(m);
        geos.push(geo);
        const mesh = new THREE.Mesh(geo, m);
        if (o.pos) mesh.position.set(o.pos[0], o.pos[1], o.pos[2]);
        if (o.rot) mesh.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
        if (o.scale) mesh.scale.set(o.scale[0], o.scale[1], o.scale[2]);
        if (o.outline !== 0) T.addOutline(mesh, o.outline || 0.8);
        g.add(mesh);
        return mesh;
      };
      let parent = J.chest;
      if (kind === 'pole') {
        // across the back of the neck, the jars hanging from each end
        parent = J.chest;
        g.position.set(0, 0.34, -0.06);
        mk(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 6), 0x7a5a32, { rot: [0, 0, Math.PI / 2] });
        for (const s of [1, -1]) {
          mk(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 4), 0x5a4a32, { pos: [s * 0.6, -0.16, 0], outline: 0 });
          mk(new THREE.SphereGeometry(0.13, 12, 10), 0xb0603a, { pos: [s * 0.6, -0.4, 0], scale: [1, 1.15, 1] });
          mk(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 10), 0x9a5232, { pos: [s * 0.6, -0.27, 0] });
        }
      } else if (kind === 'paper') {
        parent = J.handR;
        g.position.set(0, -0.08, 0.04);
        const tex = T.canvasTexture(128, 160, (c, w, h) => {
          c.fillStyle = '#f4ecd8';
          c.fillRect(0, 0, w, h);
          c.fillStyle = '#b8302a';
          c.fillRect(8, 10, w - 16, 26);
          c.fillStyle = '#1a1a1e';
          for (let i = 0; i < 6; i++) c.fillRect(14, 48 + i * 16, w - 28 - (i % 3) * 18, 6);
        });
        const m = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
        mats.push(m);
        const geo = new THREE.PlaneGeometry(0.2, 0.26);
        geos.push(geo);
        const sheet = new THREE.Mesh(geo, m);
        sheet.rotation.set(-0.3, Math.PI, 0);
        g.add(sheet);
        g.userData.tex = tex;
      } else if (kind === 'sweets') {
        parent = J.handL;
        g.position.set(-0.06, -0.06, 0.12);
        const cols = [0xf6e2c8, 0xf090b8, 0x8a4a2a, 0xf6e2c8];
        cols.forEach((c, i) => mk(new THREE.CylinderGeometry(0.1 - i * 0.012, 0.1 - i * 0.012, 0.06, 14), c, { pos: [0, i * 0.065, 0], outline: 0.6 }));
        mk(new THREE.SphereGeometry(0.03, 8, 6), 0xd8202a, { pos: [0, 0.26, 0], outline: 0 });
      } else if (kind === 'bundle') {
        parent = J.chest;
        g.position.set(0, 0.06, 0.2);
        mk(new THREE.SphereGeometry(0.13, 12, 10), 0xe8dcc4, { scale: [1.4, 0.85, 0.9], rot: [0, 0, 0.3] });
        mk(new THREE.SphereGeometry(0.06, 10, 8), 0x7a4a2e, { pos: [0.14, 0.05, 0.03] });
      } else if (kind === 'sack') {
        parent = J.handR;
        g.position.set(0, -0.04, 0);
        mk(new THREE.CylinderGeometry(0.014, 0.014, 0.9, 6), 0x7a5a32, { pos: [0, 0.32, -0.1], rot: [-0.9, 0, 0] });
        mk(new THREE.SphereGeometry(0.13, 10, 8), 0xc89a5a, { pos: [0, 0.6, -0.42], scale: [1, 0.9, 1] });
      }
      parent.add(g);
      return {
        group: g,
        dispose() {
          if (g.parent) g.parent.remove(g);
          for (const m of mats) m.dispose();
          for (const geo of geos) geo.dispose();
          if (g.userData.tex) g.userData.tex.dispose();
        },
      };
    },

    /**
     * KID BUU'S ECHO: for a moment the pink ghost of what he used to be stands where the boy stands — the
     * memory in Goku's eyes, the pressure in the awakening. A real Kid Buu body (hidden the rest of the
     * time), see-through and pink. Returns { done() }.
     */
    echo(m, f, kid, seconds = 0.45, opts = {}) {
      if (!kid) return { done: () => true };
      kid.setHidden(false);
      kid.untargetable = kid.intangible = true;
      kid.setPosition(f.pos.clone().add(new V3(0, opts.lift || 0, 0)));
      if (kid.prevPos) kid.prevPos.copy(kid.pos);
      kid.yaw = kid.prevYaw = f.yaw;
      kid.setState('scripted', { pose: opts.pose || 'kb_idle', expression: opts.face || 'grin' });
      if (kid.model.setSpirit) {
        kid.model.setSpirit(true);
        if (kid.model._spiritMat) {
          kid.model._spiritMat.color.set(0xff9ad0);
          kid.model._spiritMat.emissive.set(0x8a2a5a);
        }
        if (kid.model.setSpiritLevel) kid.model.setSpiritLevel(opts.opacity || 0.45);
      }
      const b = m.battle;
      b.vfx.flash(kid.chest(), 1.8, 0xff9ad0, 0.2, glow());
      let t = 0;
      let ended = false;
      const hook = () => {
        t += 1 / 60;
        if (t >= seconds) end();
      };
      const end = () => {
        if (ended) return;
        ended = true;
        const i = m.tickHooks.indexOf(hook);
        if (i >= 0) m.tickHooks.splice(i, 1);
        if (kid.model.setSpirit) kid.model.setSpirit(false);
        kid.setHidden(true);
      };
      m.tickHooks.push(hook);
      return { done: () => ended, end };
    },

    /** THE RING GIVES WAY: tiles of its paving lift into the air round `centre` and hang there. lift(k) / drop() / dispose(). */
    tiles(b, centre, n = 22) {
      const A = b.stage.arena, top = A ? A.y : 0;
      const g = new THREE.Group();
      const mat = SL.Toon.makeMat((b.stage.def.arena && b.stage.def.arena.trim) || 0xd8d2c4, {});
      const geo = new THREE.BoxGeometry(1.2, 0.18, 1.2);
      const r = U.mulberry32(28);
      const pieces = [];
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = 1.4 + r() * 6;
        const mesh = new THREE.Mesh(geo, mat);
        SL.Toon.addOutline(mesh, 1);
        const base = new V3(centre.x + Math.cos(a) * d, top + 0.1, centre.z + Math.sin(a) * d);
        if (A && !A.onRing(base.x, base.z)) continue;
        mesh.position.copy(base);
        mesh.rotation.y = r() * 3;
        g.add(mesh);
        pieces.push({ mesh, base, h: 0.6 + r() * 3.2, spin: new V3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(2), ph: r() * 6 });
      }
      b.scene.add(g);
      let k = 0, falling = false, fallT = 0;
      return {
        group: g,
        lift(v) {
          k = U.clamp01(v);
          const t = performance.now() / 1000;
          for (const p of pieces) {
            p.mesh.position.set(p.base.x, p.base.y + p.h * k + Math.sin(t * 2 + p.ph) * 0.12 * k, p.base.z);
            p.mesh.rotation.x = p.spin.x * k + Math.sin(t + p.ph) * 0.2 * k;
            p.mesh.rotation.z = p.spin.z * k;
          }
        },
        drop() {
          falling = true;
          fallT = 0;
        },
        tick() {
          if (!falling) return;
          fallT += 1 / 60;
          const kk = Math.max(0, 1 - fallT * fallT * 3);
          for (const p of pieces) {
            p.mesh.position.y = p.base.y + p.h * k * kk;
            p.mesh.rotation.x *= 0.96;
            p.mesh.rotation.z *= 0.96;
          }
          if (kk <= 0) falling = false;
        },
        dispose() {
          if (g.parent) b.scene.remove(g);
          geo.dispose();
          mat.dispose();
        },
      };
    },

    /**
     * SHENRON — the Earth's Eternal Dragon: a long green serpent coiling up out of the balls into the dark
     * sky, small clawed arms, a long head with branching horns and whiskers, red eyes. rise(k) draws him up
     * from the ground (the body grows along its own length, the head comes last); eyes(k); dispose(). pal recolours
     * him { body, belly, horn, dark } (Super Shenron is the same serpent in gold).
     */
    shenron(b, base, facing, pal) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const c = pal || {};
      const green = T.mat(c.body || 0x2f8a4a), belly = T.mat(c.belly || 0xc8c070), horn = T.mat(c.horn || 0xe8dcb8), dark = T.mat(c.dark || 0x1f5a32);
      const H = 52;
      const pts = [new V3(0, 0, 0), new V3(6, 8, -3), new V3(-7, 16, -6), new V3(5, 25, -9), new V3(-4, 33, -5), new V3(3, 41, 0), new V3(0, H - 4, 6)];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.TubeGeometry(curve, 120, 1.9, 12, false);
      const body = new THREE.Mesh(tube, green);
      T.addOutline(body, 1.4);
      g.add(body);
      const total = tube.index ? tube.index.count : tube.attributes.position.count;
      // the belly scales and the spines
      const extras = new THREE.Group();
      for (let i = 1; i < 18; i++) {
        const u = i / 18;
        const p = curve.getPoint(u), tg = curve.getTangent(u);
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.4, 5), dark);
        sp.position.copy(p).add(new V3(0, 0.3, -1.9));
        sp.rotation.x = -1.2;
        sp.userData.u = u;
        extras.add(sp);
        const sc = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), belly);
        sc.position.copy(p).addScaledVector(new V3(-tg.z, 0, tg.x).normalize(), 0).add(new V3(0, 0, 1.3));
        sc.scale.set(1, 0.5, 0.4);
        sc.userData.u = u;
        extras.add(sc);
      }
      // two small arms near the top
      for (const s of [1, -1]) {
        const p = curve.getPoint(0.86);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 4, 8), green);
        arm.position.copy(p).add(new V3(s * 2.4, -1.2, 1.4));
        arm.rotation.z = s * 0.9;
        arm.userData.u = 0.86;
        T.addOutline(arm, 1);
        extras.add(arm);
        for (let c = 0; c < 3; c++) {
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 5), horn);
          claw.position.copy(arm.position).add(new V3(s * 1.6 + (c - 1) * 0.3, -1.6, 0.6));
          claw.rotation.x = 2.6;
          claw.userData.u = 0.86;
          extras.add(claw);
        }
      }
      g.add(extras);
      // the head
      const head = new THREE.Group();
      head.position.copy(curve.getPoint(1)).add(new V3(0, 2.2, 2.4));
      const skull = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 10), green);
      skull.scale.set(1, 0.8, 1.2);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 4.4), green);
      snout.position.set(0, -0.6, 3.2);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 3.8), belly);
      jaw.position.set(0, -1.5, 2.8);
      const neck = new THREE.Mesh(new THREE.SphereGeometry(1.95, 12, 10), green);
      neck.position.set(0, -2.2, -2.4);
      head.add(skull, snout, jaw, neck);
      for (const o of [skull, snout]) T.addOutline(o, 1.2);
      for (const s of [1, -1]) {
        // branching horns
        const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 4, 7), horn);
        h1.position.set(s * 1.3, 2.4, -1.2);
        h1.rotation.set(-0.7, 0, -s * 0.35);
        const h2 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.8, 6), horn);
        h2.position.set(s * 1.9, 2.6, -0.4);
        h2.rotation.set(-0.2, 0, -s * 0.9);
        // whiskers
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 6, 5), horn);
        w.position.set(s * 2, -0.8, 4.6);
        w.rotation.set(1.1, 0, s * 1.1);
        head.add(h1, h2, w);
      }
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x5a0a0a, fog: false });
      const eyeGlows = [];
      for (const s of [1, -1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), eyeMat);
        e.position.set(s * 1.1, 0.5, 1.6);
        e.scale.set(1.3, 0.7, 0.6);
        const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xff2020, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false, fog: false }));
        gl.position.copy(e.position);
        gl.scale.setScalar(2.6);
        eyeGlows.push(gl);
        head.add(e, gl);
      }
      g.add(head);
      g.position.copy(base);
      if (facing) g.rotation.y = Math.atan2(facing.x - base.x, facing.z - base.z);
      b.scene.add(g);
      const api = {
        group: g,
        head,
        headPos: () => head.getWorldPosition(new V3()),
        rise(k) {
          k = U.clamp01(k);
          const n = Math.floor((total * Math.min(1, k * 1.05)) / 3) * 3;
          tube.setDrawRange(0, Math.max(3, n));
          for (const o of extras.children) o.visible = o.userData.u <= k;
          head.visible = k >= 0.97;
        },
        eyes(k) {
          eyeMat.color.setRGB(0.35 + 0.65 * k, 0.04, 0.04);
          for (const gl of eyeGlows) gl.material.opacity = k;
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
            if (o.isSprite) o.material.dispose();
          });
          eyeMat.dispose();
        },
      };
      api.rise(1);
      return api;
    },

    /** The seven Dragon Balls in a ring on the floor: glow(k) brightens them; scatter(k) throws them up and away. */
    dragonBalls(b, centre) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const balls = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const ball = new THREE.Group();
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), T.mat(0xffa21e));
        T.addOutline(s, 1);
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0xd8201a }));
        star.position.set(0, 0.05, 0.18);
        const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xffb040, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.4, depthWrite: false }));
        gl.scale.setScalar(1.2);
        ball.add(s, star, gl);
        const base = centre.clone().add(new V3(Math.cos(a) * 0.7, 0.2, Math.sin(a) * 0.7));
        ball.position.copy(base);
        g.add(ball);
        balls.push({ ball, gl, base, dir: new V3(Math.cos(a), 1.4, Math.sin(a)).normalize() });
      }
      b.scene.add(g);
      return {
        group: g,
        glow(k) {
          for (const x of balls) {
            x.gl.material.opacity = 0.3 + k * 0.7;
            x.gl.scale.setScalar(1.2 + k * 2.2);
          }
        },
        scatter(k) {
          for (const x of balls) x.ball.position.copy(x.base).addScaledVector(x.dir, k * k * 120);
          g.visible = k < 0.98;
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
            if (o.isSprite) o.material.dispose();
          });
        },
      };
    },

    /** A night sky: a dome of small stars far out (the Lookout at night). dispose(). */
    stars(b) {
      const n = 900, pos = new Float32Array(n * 3);
      const r = U.mulberry32(77);
      for (let i = 0; i < n; i++) {
        const y = r() * 0.95 + 0.05, a = r() * Math.PI * 2, rr = Math.sqrt(1 - y * y);
        pos[i * 3] = Math.cos(a) * rr * 600;
        pos[i * 3 + 1] = y * 600;
        pos[i * 3 + 2] = Math.sin(a) * rr * 600;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false });
      const pts = new THREE.Points(geo, mat);
      b.scene.add(pts);
      return {
        points: pts,
        dispose() {
          if (pts.parent) b.scene.remove(pts);
          geo.dispose();
          mat.dispose();
        },
      };
    },

    /** A KI FROM VERY FAR AWAY: a small glimmer on the horizon that breathes. pulse(t) every tick; dispose(). */
    ping(b, pos, color = 0xffb8e0) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      sp.position.copy(pos);
      sp.scale.setScalar(6);
      b.scene.add(sp);
      return {
        sprite: sp,
        pulse(t) {
          const k = 0.5 + 0.5 * Math.sin(t * 3.2);
          sp.material.opacity = 0.25 + k * 0.6;
          sp.scale.setScalar(5 + k * 5);
        },
        dispose() {
          if (sp.parent) b.scene.remove(sp);
          sp.material.dispose();
        },
      };
    },

    /** Two people flying away seen from far off: a spark and the trail it leaves. at(p) moves it; dispose(). */
    streak(b, color = 0xfff2c0) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
      sp.scale.setScalar(3.4);
      b.scene.add(sp);
      return {
        sprite: sp,
        at(p) {
          sp.position.copy(p);
          if (b.frame % 2 === 0) b.vfx.trail(p, 0xfff6d8, 0.9, 0.9);
        },
        dispose() {
          if (sp.parent) b.scene.remove(sp);
          sp.material.dispose();
        },
      };
    },
  });
})();
