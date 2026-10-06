/*
 * UUB (the End of Z, Age 784) — a ten-year-old from a poor village in the far south, and the
 * good person Goku asked for when he said goodbye to Kid Buu.
 *
 * Nothing about him should look like Kid Buu: a dark-skinned, skinny boy with a short black
 * mohawk, a patched red sleeveless top, a white sash, white trousers and bare feet. He is
 * polite, shy, scared of crowds — and when something finally makes him angry, the pressure
 * that comes off him is the one thing that does remember where he came from.
 *
 *   identity    a young martial artist who has only ever trained alone: compact, honest,
 *               committed strikes, no technique names he learned from anybody. No ki blasts,
 *               no beams, no flight (the story has Goku teach him that; `flightUnlock`).
 *   potential   `hiddenPotential`: hurting him fills it, and when it breaks loose he hits like
 *               something much older than ten — the aura goes pale pink for those seconds.
 *   specials    Untamed Rush (a lunge and a flurry he never practised), Village Stomp (the
 *               ground breaks under a jump — the tournament ring's tiles), Awakened Fist (one
 *               straight punch with everything in it: the punch that met Goku's).
 *
 * Also here: the people of his village (his mother, the chief, the children).
 *
 * Level 1 functional prototype; playable after the story (src/data/unlocks.js).
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  /* ---------------- Uub's body language ---------------- */
  const P = SL.data.kidPoses('ub');
  // HIS STANCE: square-ish and low, both fists up in front of the face, elbows in — a boy who
  // learned from watching and from hitting rocks, not from a school
  P.ub_idle = (t) => {
    const b = Math.sin(t * 3);
    return {
      root: { y: -0.07 + b * 0.012 },
      hips: [0, -14, 0], spine: [8, 6, 0], chest: [6, 10, 0], head: [-2, -8, 0],
      shoulderL: [-64, 0, 14], elbowL: [-118, 0, 0], shoulderR: [-50, 0, -16], elbowR: [-124, 0, 0],
      thighL: [-26, 12, 12], kneeL: [36 + b * 3, 0, 0], footL: [-8, 0, 0], thighR: [16, -10, -12], kneeR: [30 + b * 3, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the straight punch, everything behind it: back heel up, the whole body turned into it
  P.ub_straightW = {
    root: { y: -0.1 }, hips: [0, -26, 0], spine: [6, -14, 0], chest: [4, -26, 0], head: [-6, 18, 0],
    shoulderR: [-30, 0, -22], elbowR: [-132, 0, 0], shoulderL: [-70, 0, 20], elbowL: [-60, 0, 0],
    thighL: [-36, 0, 12], kneeL: [44, 0, 0], thighR: [22, 0, -12], kneeR: [30, 0, 0],
    hands: ['fist', 'fist'],
  };
  P.ub_straight = {
    root: { y: -0.12, rx: 14 }, hips: [0, 22, 0], spine: [10, 16, 0], chest: [10, 26, 0], head: [-18, -22, 0],
    shoulderR: [-94, 0, 2], elbowR: [-2, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-120, 0, 0],
    thighL: [-50, 0, 12], kneeL: [52, 0, 0], thighR: [30, 0, -12], kneeR: [12, 0, 0], footR: [30, 0, 0],
    hands: ['fist', 'fist'],
  };
  // a rising knee, both hands pulling down
  P.ub_kneeW = {
    root: { y: -0.06 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
    shoulderL: [-90, 0, 24], elbowL: [-40, 0, 0], shoulderR: [-90, 0, -24], elbowR: [-40, 0, 0],
    thighL: [-10, 0, 10], kneeL: [20, 0, 0], thighR: [10, 0, -10], kneeR: [30, 0, 0],
    hands: ['open', 'open'],
  };
  P.ub_knee = {
    root: { y: 0.04, rx: -6 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-14, 0, 0],
    shoulderL: [-60, 0, 20], elbowL: [-70, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-70, 0, 0],
    thighR: [-112, 0, -6], kneeR: [110, 0, 0], thighL: [8, 0, 8], kneeL: [10, 0, 0],
    hands: ['fist', 'fist'],
  };
  // the stomp: crouched to spring, up, and both feet down
  P.ub_stompCrouch = {
    root: { y: -0.22, rx: 16 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [-18, 0, 0],
    shoulderL: [10, 0, 26], elbowL: [-50, 0, 0], shoulderR: [10, 0, -26], elbowR: [-50, 0, 0],
    thighL: [-74, 0, 14], kneeL: [100, 0, 0], thighR: [-74, 0, -14], kneeR: [100, 0, 0],
    hands: ['fist', 'fist'],
  };
  P.ub_stompAir = {
    root: { y: 0.04, rx: -4 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [10, 0, 0],
    shoulderL: [-150, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-30, 0, 0],
    thighL: [-60, 0, 10], kneeL: [90, 0, 0], thighR: [-60, 0, -10], kneeR: [90, 0, 0],
    hands: ['fist', 'fist'],
  };
  P.ub_stomp = {
    root: { y: -0.2, rx: 18 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [-20, 0, 0],
    shoulderL: [-10, 0, 40], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-20, 0, 0],
    thighL: [-60, 0, 22], kneeL: [80, 0, 0], thighR: [-60, 0, -22], kneeR: [80, 0, 0],
    hands: ['fist', 'fist'],
  };
  // the lunge into the flurry
  P.ub_rushW = {
    root: { y: -0.12, rx: 24 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-26, 0, 0],
    shoulderL: [20, 0, 20], elbowL: [-70, 0, 0], shoulderR: [24, 0, -20], elbowR: [-70, 0, 0],
    thighL: [-60, 0, 10], kneeL: [70, 0, 0], thighR: [30, 0, -10], kneeR: [40, 0, 0],
    hands: ['fist', 'fist'],
  };

  // --- the story ---
  // STAGE FRIGHT: shoulders up round his ears, hands clasped low in front of him, looking at his feet, shaking
  P.ub_nervous = (t) => {
    const q = Math.sin(t * 26) * 1.2;
    return {
      root: { y: -0.02 }, hips: [0, 0, 0], spine: [8, 0, 0], chest: [6 + q * 0.5, 0, 0], neck: [10, 0, 0], head: [24, q, 0],
      shoulderL: [-26, 18, 4], elbowL: [-48, 0, 0], shoulderR: [-26, -18, -4], elbowR: [-48, 0, 0],
      thighL: [-4, 6, 2], kneeL: [10 + q, 0, 0], thighR: [-4, -6, -2], kneeR: [10 - q, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // RUNNING: a village boy's run — bare feet, short quick steps, fists pumping, head down and determined
  P.ub_run = (t, ctx) => {
    const sp = ctx && ctx.runRate ? ctx.runRate : 1;
    const ph = t * 13 * sp;
    const s = Math.sin(ph), c = Math.cos(ph);
    return {
      root: { y: -0.05 + Math.abs(c) * 0.045, rx: 20 },
      spine: [10, s * 6, 0], chest: [6, s * 8, 0], head: [-16, -s * 6, 0],
      shoulderL: [s * 44 - 10, 0, 10], elbowL: [-96, 0, 0], shoulderR: [-s * 44 - 10, 0, -10], elbowR: [-96, 0, 0],
      thighL: [-s * 48 - 10, 0, 3], kneeL: [30 + Math.max(0, s) * 64, 0, 0], footL: [10, 0, 0],
      thighR: [s * 48 - 10, 0, -3], kneeR: [30 + Math.max(0, -s) * 64, 0, 0], footR: [10, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // THE GUARD: both forearms up in front of the face, peeking between them, knees bent — he braces
  // like somebody who has been hit by a rock he was carrying
  P.ub_guard = {
    root: { y: -0.1 }, spine: [10, 4, 0], chest: [10, 6, 0], head: [14, -4, 0],
    shoulderL: [-76, 0, 30], elbowL: [-134, 0, 0], shoulderR: [-78, 0, -28], elbowR: [-132, 0, 0],
    thighL: [-24, 8, 14], kneeL: [38, 0, 0], thighR: [12, -8, -14], kneeR: [32, 0, 0],
    hands: ['fist', 'fist'],
  };
  // CHARGING: feet planted wide, fists at his hips, teeth set — the pink pressure coming up through him
  P.ub_charge = (t) => {
    const q = Math.sin(t * 34) * 1.3;
    return {
      root: { y: -0.15, rx: 4 }, spine: [4, 0, 0], chest: [-8 + q, 0, 0], neck: [6, 0, 0], head: [8, 0, 0],
      shoulderL: [24, 0, 30 + q], elbowL: [-96, 0, 0], shoulderR: [24, 0, -30 - q], elbowR: [-96, 0, 0],
      thighL: [-32, 0, 26], kneeL: [56, 0, 0], footL: [-18, 0, -14], thighR: [-32, 0, -26], kneeR: [56, 0, 0], footR: [-18, 0, 14],
      hands: ['fist', 'fist'],
    };
  };
  // FLYING (once Goku has taught him): still not sure of it — arms out a little for balance, legs
  // together and stiff, looking down past his feet
  P.ub_flyIdle = (t) => {
    const s = Math.sin(t * 2.4);
    return {
      root: { y: 0.03 * s, rz: s * 3 }, spine: [6, 0, 0], chest: [2, 0, 0], head: [14, 0, 0],
      shoulderL: [-10, 0, 36 + s * 6], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -36 + s * 6], elbowR: [-20, 0, 0],
      thighL: [-12, 0, 4], kneeL: [22, 0, 0], footL: [40, 0, 0], thighR: [-8, 0, -4], kneeR: [18, 0, 0], footR: [40, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...and going somewhere: fists forward like he has seen Goku do it, a bit too stiff
  P.ub_flyForward = (t) => {
    const s = Math.sin(t * 9);
    return {
      root: { rx: 68 }, spine: [-2, 0, 0], chest: [-4, 0, 0], neck: [-24, 0, 0], head: [-34, 0, 0],
      shoulderL: [-150, 0, 10], elbowL: [-10, 0, 0], shoulderR: [-150, 0, -10], elbowR: [-10, 0, 0],
      thighL: [4 + s * 3, 0, 3], kneeL: [14, 0, 0], footL: [55, 0, 0], thighR: [-s * 3, 0, -3], kneeR: [18, 0, 0], footR: [55, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // won: a fist punched at the sky, and then — remembering himself — the bow
  P.ub_victory = (t) => {
    const b = Math.sin(t * 5);
    return {
      root: { y: 0.02 + Math.max(0, b) * 0.03 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-18, 0, 0],
      shoulderR: [-168, 0, -12], elbowR: [-8, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-100, 0, 0],
      thighL: [-6, 0, 12], kneeL: [10, 0, 0], thighR: [-6, 0, -12], kneeR: [10, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // lost: sitting on the ground, one hand rubbing the back of his head, embarrassed
  P.ub_defeat = (t) => {
    const s = Math.sin(t * 5);
    return {
      root: { y: -0.36, rx: -8 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [6, 8, 0],
      shoulderR: [-150, 0, -30], elbowR: [-120 + s * 8, 0, 0], shoulderL: [30, 0, 30], elbowL: [-10, 0, 0],
      thighL: [-84, 0, 16], kneeL: [44, 0, 0], thighR: [-84, 0, -16], kneeR: [44, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the bow of a boy who was taught manners: right fist into the left palm in front of his chest
  P.ub_bow = {
    root: { y: -0.02, rx: 22 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [10, 0, 0],
    shoulderL: [-62, -40, 18], elbowL: [-82, 0, 0], shoulderR: [-62, 40, -18], elbowR: [-82, 0, 0],
    thighL: [-22, 0, 4], kneeL: [4, 0, 0], thighR: [-22, 0, -4], kneeR: [4, 0, 0],
    hands: ['open', 'fist'],
  };
  // the deep one: "Please... teach me!"
  P.ub_bowDeep = {
    root: { y: -0.04, rx: 56 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [14, 0, 0],
    shoulderL: [-8, 0, 6], elbowL: [-6, 0, 0], shoulderR: [-8, 0, -6], elbowR: [-6, 0, 0],
    thighL: [-56, 0, 4], kneeL: [10, 0, 0], thighR: [-56, 0, -4], kneeR: [10, 0, 0],
    hands: ['fist', 'fist'],
  };
  // fists clenched at his sides, arms rigid, the head down — the anger arriving before he knows it
  P.ub_clench = (t) => {
    const q = Math.sin(t * 38) * 1.8;
    return {
      root: { y: -0.05 }, spine: [10, 0, 0], chest: [8 + q, 0, 0], neck: [6, 0, 0], head: [16, q, 0],
      shoulderL: [-6 + q, 0, 16], elbowL: [-10, 0, 0], shoulderR: [-6 - q, 0, -16], elbowR: [-10, 0, 0],
      thighL: [-10, 0, 12], kneeL: [18, 0, 0], thighR: [-10, 0, -12], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // THE AWAKENING: head thrown back, arms driven down and back, chest out, a scream
  P.ub_awaken = (t) => {
    const q = Math.sin(t * 44) * 2;
    return {
      root: { y: -0.1, rx: -8 }, spine: [-10, 0, 0], chest: [-16 + q, 0, 0], neck: [-8, 0, 0], head: [-26, 0, 0],
      shoulderL: [30, 0, 34 + q], elbowL: [-14, 0, 0], shoulderR: [30, 0, -34 - q], elbowR: [-14, 0, 0],
      thighL: [-30, 0, 18], kneeL: [44, 0, 0], thighR: [-30, 0, -18], kneeR: [44, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the fist out to meet another one: lunging, the right arm straight, the left fist at his chest
  P.ub_fistOut = (t) => {
    const q = Math.sin(t * 40) * 1.4;
    return {
      root: { y: -0.18, rx: 18 }, hips: [0, 16, 0], spine: [10, 12, 0], chest: [8 + q, 18, 0], head: [-22, -14, 0],
      shoulderR: [-88, 0, 4], elbowR: [-2, 0, 0], shoulderL: [-50, 30, 20], elbowL: [-130, 0, 0],
      thighL: [-62, 0, 14], kneeL: [70, 0, 0], thighR: [26, 0, -14], kneeR: [30, 0, 0], footR: [24, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // wiping his eyes with the back of a forearm
  P.ub_wipe = (t) => {
    const s = Math.sin(t * 6);
    return {
      root: { y: -0.02 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [12, 8, 0],
      shoulderR: [-96, 30, -10], elbowR: [-120 + s * 6, 0, 0], shoulderL: [-14, 0, 12], elbowL: [-20, 0, 0],
      thighL: [-4, 0, 8], kneeL: [8, 0, 0], thighR: [-4, 0, -8], kneeR: [8, 0, 0],
      hands: ['open', 'fist'],
    };
  };
  // looking up at somebody much taller, wide-eyed
  P.ub_lookUp = (t) => {
    const b = Math.sin(t * 2);
    return {
      root: { y: -0.01 + b * 0.004 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-6, 0, 0], head: [-22, 0, 0],
      shoulderL: [-10, 0, 10], elbowL: [-24, 0, 0], shoulderR: [-10, 0, -10], elbowR: [-24, 0, 0],
      thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the pole across his shoulders, a water jar hanging at each end (the prop is the mission's)
  P.ub_carry = (t) => {
    const s = Math.sin(t * 7);
    return {
      root: { y: -0.05 + Math.abs(s) * 0.02 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-6, 0, 0],
      shoulderL: [-150, 0, 70], elbowL: [-60, 0, 0], shoulderR: [-150, 0, -70], elbowR: [-60, 0, 0],
      thighL: [-s * 22 - 6, 0, 4], kneeL: [16 + Math.max(0, s) * 30, 0, 0], thighR: [s * 22 - 6, 0, -4], kneeR: [16 + Math.max(0, -s) * 30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // riding on Goku's back: arms round his neck, knees up at his hips
  P.ub_piggy = (t) => {
    const b = Math.sin(t * 3);
    return {
      root: { y: 0, rx: 10 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-12 + b * 3, 0, 0],
      shoulderL: [-110, 0, 4], elbowL: [-96, 0, 0], shoulderR: [-110, 0, -4], elbowR: [-96, 0, 0],
      thighL: [-74, 0, 32], kneeL: [86, 0, 0], thighR: [-74, 0, -32], kneeR: [86, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...and once he stops being scared of the height: one arm let go, waving back at the island
  P.ub_piggyWave = (t) => {
    const w = Math.sin(t * 9);
    return {
      root: { y: 0, rx: 6 }, spine: [4, 0, 0], chest: [2, -14, 0], head: [-14, 30, 0],
      shoulderL: [-110, 0, 4], elbowL: [-96, 0, 0], shoulderR: [-160, 0, -30 - w * 12], elbowR: [-20, 0, 0],
      thighL: [-74, 0, 32], kneeL: [86, 0, 0], thighR: [-74, 0, -32], kneeR: [86, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the same in flight: leaning forward with the man under him
  P.ub_piggyFly = (t) => Object.assign(P.ub_piggy(t), { root: { y: 0, rx: 44 } });
  P.ub_piggyFlyWave = (t) => Object.assign(P.ub_piggyWave(t), { root: { y: 0, rx: 40 } });
  // the boulder: down on one knee, pressing a hand to the cracked stone, embarrassed
  P.ub_sorry = (t) => {
    const s = Math.sin(t * 3);
    return {
      root: { y: -0.02 }, spine: [10, 0, 0], chest: [4, 0, 0], head: [6, s * 6, 0],
      shoulderR: [-150, 0, -10], elbowR: [-110, 0, 0], shoulderL: [-16, 0, 10], elbowL: [-20, 0, 0],
      thighL: [-4, 0, 8], kneeL: [8, 0, 0], thighR: [-4, 0, -8], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // a wave goodbye, one arm high
  P.ub_wave = (t) => {
    const w = Math.sin(t * 9);
    return {
      root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-10, 0, 0],
      shoulderR: [-168, 0, -24 - w * 14], elbowR: [-16, 0, 0], shoulderL: [-10, 0, 10], elbowL: [-20, 0, 0],
      thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0],
      hands: ['fist', 'open'],
    };
  };

  const UUB_BUILD = { chestW: 0.162, chestD: 0.112, shoulderX: 0.156, waistW: 0.122, upperArmR: 0.04, foreArmR: 0.035, fist: 0.044, thighR: 0.068, shinR: 0.052, headR: 0.13, neckLen: 0.042 };
  const SKIN = 0x7a4a2e;

  SL.data.characters.uub = {
    id: 'uub',
    assetLevel: 1,
    name: 'Uub',
    fullName: 'Uub (Age 10)',
    era: 'End of Z',
    playable: true,
    prototype: true,
    style: 'Raw Potential',
    blurb: 'A shy boy from a village in the south who entered the tournament for the prize money. Something enormous is asleep in him.',
    ratings: { power: 3, speed: 3, ki: 2, defense: 3 },
    stats: { hp: 10400, ki: 90, stamina: 116, speed: 1.12, power: 0.84, defense: 0.8, weight: 0.66, kiRegen: 2.2, chargeRate: 28, canonPower: 1.1 },
    appearance: {
      height: 0.74,
      skin: SKIN,
      build: UUB_BUILD,
      hair: { style: 'uub', color: 0x121214 },
      face: { pupil: 0x141414, eyeW: 1.12, brow: 0x141414 },
      // the patched red top (sleeveless, a darker red where it crosses over), the white sash with its
      // tails, white trousers, bare feet (the "boots" are his own skin, cut low)
      outfit: {
        topStyle: 'gi', top: 0x9e2a22, under: 0x6e1a16, sleeves: 'none', belt: 0xf0ece2,
        pants: 0xf0ece2, pantsStyle: 'gi', boots: SKIN, bootStyle: 'gi',
      },
      portraitColor: '#9e2a22',
    },
    vfx: { ghost: 0xffd8ee },
    audio: { strikePitch: 1.28, heavyPitch: 1.18 },
    flight: false,
    // Goku teaches him after the tournament: once the story is cleared he can fly
    flightUnlock: 'endz_tournament',
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xf4eaf2, core: 0xffffff, particles: 0xffd8ee }, mult: {} }],
    poses: Object.assign({ idle: P.ub_idle, run: P.ub_run, guard: P.ub_guard, charge: P.ub_charge, flyIdle: P.ub_flyIdle, flyForward: P.ub_flyForward }, P),
    moves: {
      light: [
        { id: 'ubJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 290, reach: 0.95, radius: 0.66, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'ub_jabW', strike: 'ub_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'ubCross', startup: 4, active: 3, recovery: 10, cancel: 5, damage: 320, reach: 1, radius: 0.66, lunge: 13, hitstun: 17, knock: 'flinch', impact: 1, pose: { wind: 'ub_straightW', strike: 'ub_straight' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'ubKick', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 420, reach: 1.2, radius: 0.76, lunge: 14, hitstun: 22, knock: 'push', knockSpeed: 11, impact: 1, pose: { wind: 'ub_kickW', strike: 'ub_kick' }, sfx: 'punchLight', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'ubStraight', name: 'Straight', startup: 10, active: 5, recovery: 20, damage: 1020, reach: 1.25, radius: 0.9, lunge: 17, hitstun: 32, knock: 'smash', knockSpeed: 27, impact: 3, pose: { wind: 'ub_straightW', strike: 'ub_straight' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'ubKnee', startup: 8, active: 4, recovery: 16, damage: 680, reach: 1.05, radius: 0.85, lunge: 12, hitstun: 28, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'ub_kneeW', strike: 'ub_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'ubDash', startup: 4, active: 7, recovery: 15, damage: 640, reach: 1.15, radius: 0.85, lunge: 34, hitstun: 26, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'ub_rushW', strike: 'ub_straight' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'ubToss', name: 'Village Throw', damage: 560, knockSpeed: 23, poses: ['grab', 'ub_spinW', 'ub_spin'] },
    },
    specials: {
      // nobody taught him this: in low, and then everything at once
      special1: {
        id: 'ubRush', name: 'Untamed Rush', type: 'rush', kiCost: 22, icon: 'rush',
        startup: 12, dashFrames: 18, speed: 32, recovery: 26,
        poses: { wind: 'ub_rushW' },
        hits: [
          { pose: 'ub_jab', damage: 260, frames: 7, sfx: 'punchLight' },
          { pose: 'ub_straight', damage: 300, frames: 7, sfx: 'punchLight' },
          { pose: 'ub_jab', damage: 300, frames: 8, sfx: 'punchLight' },
          { pose: 'ub_knee', damage: 360, frames: 10, sfx: 'punchHeavy' },
          { pose: 'ub_straight', damage: 720, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 26, impact: 3 },
        ],
      },
      // up, and both feet down: the ground answers (the tournament ring's tiles)
      special2: {
        id: 'ubStomp', name: 'Village Stomp', type: 'groundSlam', kiCost: 28, icon: 'ball',
        crouch: 16, hang: 18, height: 3, maxRange: 10, radius: 5.5, clearHeight: 2, damage: 1400, knockSpeed: 18, recovery: 34,
        color: 0xffd0ec, poses: { crouch: 'ub_stompCrouch', air: 'ub_stompAir', land: 'ub_stomp' },
      },
      // one straight punch with everything in it — the one that met Goku's fist
      ultimate: {
        id: 'ubAwakened', name: 'Awakened Fist', type: 'rush', kiCost: 90, icon: 'ultimate', ultimate: true,
        startup: 24, dashFrames: 22, speed: 40, recovery: 40, cinematic: true,
        poses: { wind: 'ub_straightW' },
        hits: [
          { pose: 'ub_jab', damage: 500, frames: 6, sfx: 'punchLight' },
          { pose: 'ub_straight', damage: 600, frames: 6, sfx: 'punchHeavy' },
          { pose: 'ub_knee', damage: 700, frames: 8, sfx: 'punchHeavy' },
          { pose: 'ub_straight', damage: 2600, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
    },
    mechanic: {
      type: 'hiddenPotential', name: 'Hidden Potential',
      desc: 'Hurting him fills it. When it breaks loose, a ten-year-old hits like something much older — for a few seconds, then he is spent.',
      // the one thing about him that remembers where he came from: the outburst's aura is pale pink
      aura: { color: 0xffd6ee, core: 0xffffff, particles: 0xff9ad0, speed: 1.8, sharp: 0.6, sparks: 0xffe6f4 },
    },
    ai: { personality: 'aggressive', aggression: 0.62, defense: 0.5, ranged: 0.05, beam: 0, transformHp: 0, preferredRange: 1.8 },
    // the shy boy into the fighter, every time: the bow, the breath, the stance
    sequences: {
      intro: [
        { pose: 'ub_nervous', dur: 0.6, speed: 3, expression: 'nervous' },
        { pose: 'ub_bow', dur: 0.8, speed: 5, expression: 'calm' },
        { pose: 'ub_idle', dur: 0.7, speed: 8, expression: 'determined' },
      ],
      victory: [
        [{ pose: 'ub_victory', dur: 1.2, speed: 6, expression: 'grin' }, { pose: 'ub_bow', dur: 9, speed: 4, expression: 'soft' }],
        [{ pose: 'ub_fistOut', dur: 1, speed: 6, expression: 'determined' }, { pose: 'ub_cheer', dur: 9, speed: 5, expression: 'grin' }],
      ],
      defeat: [{ pose: 'ub_defeat', dur: 9, speed: 4, expression: 'nervous' }],
    },
    intro: { pose: 'ub_bow', expression: 'calm' },
    victory: { poses: ['ub_bow', 'ub_cheer'], expression: 'soft' },
    defeat: { pose: 'ub_defeat', expression: 'nervous' },
  };

  /* ---------------- the village ---------------- */
  const V = {
    // his mother: hands folded in front of her, a little stooped from the fields
    vm_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.01 + b * 0.004 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-2, 0, 0],
        shoulderL: [-24, 16, 6], elbowL: [-60, 0, 0], shoulderR: [-24, -16, -6], elbowR: [-60, 0, 0],
        thighL: [-2, 0, 4], kneeL: [4, 0, 0], thighR: [-2, 0, -4], kneeR: [4, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // calling across the village, a hand to her mouth
    vm_call: (t) => ({
      root: { y: 0 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-12, 0, 0],
      shoulderR: [-120, 30, -20], elbowR: [-120, 0, 0], shoulderL: [-14, 0, 10], elbowL: [-20, 0, 0],
      thighL: [-2, 0, 4], kneeL: [4, 0, 0], thighR: [-2, 0, -4], kneeR: [4, 0, 0],
      hands: ['open', 'open'],
    }),
    // her hand on his head (he is much shorter: the arm goes out and down)
    vm_headPat: (t) => {
      const s = Math.sin(t * 3);
      return {
        root: { y: -0.02, rx: 8 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [16, 0, 0],
        shoulderR: [-56 + s * 3, 0, -6], elbowR: [-30, 0, 0], shoulderL: [-24, 16, 6], elbowL: [-60, 0, 0],
        thighL: [-4, 0, 4], kneeL: [6, 0, 0], thighR: [-4, 0, -4], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // worry: both hands at her chest
    vm_worry: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.01 }, spine: [8, 0, 0], chest: [8, 0, 0], head: [6 + b * 2, 0, 0],
        shoulderL: [-52, 30, 6], elbowL: [-110, 0, 0], shoulderR: [-52, -30, -6], elbowR: [-110, 0, 0],
        thighL: [-2, 0, 4], kneeL: [4, 0, 0], thighR: [-2, 0, -4], kneeR: [4, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the chief: an old man bent over, one hand behind his back, the other holding out a paper
    vc_idle: (t) => {
      const b = Math.sin(t * 1.5);
      return {
        root: { y: -0.06, rx: 16 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-18 + b, 0, 0],
        shoulderL: [20, -40, 30], elbowL: [-90, 0, 0], shoulderR: [-20, 0, -10], elbowR: [-40, 0, 0],
        thighL: [-12, 0, 6], kneeL: [20, 0, 0], thighR: [-6, 0, -6], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    vc_offer: (t) => ({
      root: { y: -0.06, rx: 16 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-20, 0, 0],
      shoulderL: [20, -40, 30], elbowL: [-90, 0, 0], shoulderR: [-70, 0, -8], elbowR: [-20, 0, 0],
      thighL: [-12, 0, 6], kneeL: [20, 0, 0], thighR: [-6, 0, -6], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    }),
    // the little ones running about, then jumping up and down
    vx_run: (t) => {
      const s = Math.sin(t * 13), c = Math.cos(t * 13);
      return {
        root: { y: -0.03 + Math.abs(c) * 0.05, rx: 12 }, spine: [6, s * 8, 0], chest: [4, s * 10, 0], head: [-14, -s * 8, 0],
        shoulderL: [s * 50 - 10, 0, 14], elbowL: [-80, 0, 0], shoulderR: [-s * 50 - 10, 0, -14], elbowR: [-80, 0, 0],
        thighL: [-s * 50 - 10, 0, 4], kneeL: [35 + Math.max(0, s) * 60, 0, 0], thighR: [s * 50 - 10, 0, -4], kneeR: [35 + Math.max(0, -s) * 60, 0, 0],
        hands: ['open', 'open'],
      };
    },
    vx_cheer: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: 0.02 + Math.max(0, b) * 0.07 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-16, 0, 0],
        shoulderL: [-170, 0, 26], elbowL: [-14, 0, 0], shoulderR: [-170, 0, -26], elbowR: [-14, 0, 0],
        thighL: [-10 - Math.max(0, b) * 20, 0, 12], kneeL: [14 + Math.max(0, b) * 30, 0, 0], thighR: [-10 - Math.max(0, b) * 20, 0, -12], kneeR: [14 + Math.max(0, b) * 30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    vx_idle: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.01 + b * 0.01 }, spine: [2, 0, 0], chest: [0, b * 6, 0], head: [-6, -b * 10, 0],
        shoulderL: [-10, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-30, 0, 0],
        thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  const npc = (id, name, fullName, appearance, idle, extra) =>
    Object.assign(
      {
        id,
        assetLevel: 1,
        name,
        fullName,
        era: 'End of Z',
        playable: false,
        prototype: true,
        style: 'Villager',
        blurb: 'Uub\'s village in the far south: dry fields, round huts, and not much to eat.',
        ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
        stats: { hp: 600, ki: 20, stamina: 60, speed: 0.8, power: 0.2, defense: 0.5, weight: 0.85, kiRegen: 1, chargeRate: 8, canonPower: 0.0005 },
        appearance,
        vfx: { ghost: 0xe8e0d8 },
        audio: { strikePitch: 1.05, heavyPitch: 1 },
        flight: false,
        forms: [{ id: 'base', name: 'Base', aura: { color: 0xe8e0d8, core: 0xffffff }, mult: {} }],
        poses: Object.assign({ idle: V[idle] }, V),
        moves: {
          light: [{ id: id + 'Push', startup: 10, active: 3, recovery: 18, cancel: 12, damage: 20, reach: 0.9, radius: 0.6, lunge: 4, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' }],
          heavy: { 0: { id: id + 'Shove', startup: 16, active: 3, recovery: 26, damage: 30, reach: 0.9, radius: 0.6, lunge: 4, hitstun: 12, knock: 'push', knockSpeed: 6, impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitBody' } },
        },
        specials: {},
        mechanic: null,
        ai: { personality: 'grunt', aggression: 0.02, defense: 0.9, ranged: 0, beam: 0, transformHp: 0, preferredRange: 14 },
        intro: { pose: idle, expression: 'calm' },
        victory: { poses: [idle], expression: 'calm' },
        defeat: { pose: 'knockdown', expression: 'ko' },
      },
      extra || {}
    );

  const ADULT = { chestW: 0.19, chestD: 0.14, shoulderX: 0.19, waistW: 0.16, upperArmR: 0.046, foreArmR: 0.04, fist: 0.044, thighR: 0.08, shinR: 0.062, headR: 0.14, neckLen: 0.05 };
  SL.data.characters.uub_mother = npc('uub_mother', 'Uub\'s Mother', 'Uub\'s Mother', {
    height: 0.94,
    skin: SKIN,
    build: Object.assign({}, ADULT, { bust: 0.9, waistW: 0.15 }),
    hair: { style: 'chichi', color: 0x161214 },
    face: { pupil: 0x141414, eyeW: 1.02 },
    outfit: { topStyle: 'gi', top: 0xc8a050, under: 0x9a6a2a, sleeves: 'short', sleeveColor: 0xc8a050, belt: 0x6a3a1e, pants: 0x9a6a2a, pantsStyle: 'gi', boots: SKIN, bootStyle: 'gi' },
    portraitColor: '#c8a050',
  }, 'vm_idle');
  SL.data.characters.village_chief = npc('village_chief', 'Village Chief', 'The Village Chief', {
    height: 0.9,
    skin: 0x6a3e24,
    build: Object.assign({}, ADULT, { chestW: 0.17, shoulderX: 0.175 }),
    hair: { style: 'bald', color: 0xd8d4cc },
    face: { pupil: 0x141414, eyeW: 0.9, brow: 0xe0dcd4 },
    outfit: { topStyle: 'gi', top: 0xe0d8c4, under: 0xb8ac94, sleeves: 'long', sleeveColor: 0xe0d8c4, belt: 0x7a4a2a, pants: 0xb8ac94, pantsStyle: 'gi', boots: 0x5a3a24, bootStyle: 'shoe' },
    portraitColor: '#e0d8c4',
  }, 'vc_idle');
  SL.data.characters.village_kid = npc('village_kid', 'Village Child', 'A Child of the Village', {
    height: 0.55,
    skin: SKIN,
    build: { chestW: 0.15, chestD: 0.11, shoulderX: 0.145, waistW: 0.12, upperArmR: 0.038, foreArmR: 0.033, fist: 0.04, thighR: 0.064, shinR: 0.05, headR: 0.14, neckLen: 0.036 },
    hair: { style: 'cropped', color: 0x141214 },
    face: { pupil: 0x141414, eyeW: 1.14 },
    outfit: { topStyle: 'gi', top: 0xd8b878, sleeves: 'none', belt: 0x8a5a2a, pants: 0x8a6a40, pantsStyle: 'gi', boots: SKIN, bootStyle: 'gi' },
    portraitColor: '#d8b878',
  }, 'vx_idle');
})();
