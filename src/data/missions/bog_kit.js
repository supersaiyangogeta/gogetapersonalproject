/*
 * THE BATTLE OF GODS KIT — what Chapter 16 shares (Age 778: Beerus wakes, King Kai's planet, Bulma's birthday on
 * the Princess Bulma, the Super Saiyan God ritual, the fight over the ocean, in the crystal cavern and at the edge
 * of space, the Sphere of Destruction). Same mission API as every chapter; nothing here is engine code.
 *
 *   SPACE — every stretch of this chapter names where bodies are (the owner: never let the engine guess):
 *     GROUND  Beerus' world, King Kai's planet, the deck of the liner (keepOnDeck: nobody walks off it)
 *     AIR     over the ocean (keepAbove: nobody sinks into the sea), the cavern's upper half
 *     SPACE   the stratosphere and the zero-g aftermath (a 'space' stage: no ground at all)
 *
 *   godDodge(f)                 Beerus' evasion: a lean, a small step with his hands still behind his back, a palm,
 *                               or he is behind you (Fighter storyEvade mode 'god')
 *   brawl(m, hero, foe, opts)   hand the player a real fight (controllers, targets, music, unlock)
 *   kkHouse(b)                  King Kai's house, car and tree on the little planet; smash() — Goku goes through it
 *   vision(b, pos, kind)        what Whis' staff shows: a bubble of light with a picture in it (namek / ssj /
 *                               kingkai / earth); kind(k) swaps it, fade(k), dispose()
 *   travel(b, f)                the pillar of light Whis and Beerus travel in (arrivals and departures)
 *   pudding(b, pos)             the tray of pudding cups; lick(i), dispose()
 *   ritual(b, centre)           the ring of light on the deck and the pillar into the sky; set(k), colour(c)
 *   skyTo(b, to, k) / skyBack   the sky turning (the ritual's storm, the climb into black)
 *   sphere(b, pos)              the Sphere of Destruction: set(r), pulse(), veins(k) (God Ki spreading through it),
 *                               crack(k), burst(k), inside(on), dispose()
 *   splash(b, pos, size)        the sea answering a blow (a column of spray and a ring)
 *   voidOn(m, keep) / voidOff   everything gone but the listed fighters: black
 *   blueLine(b, from, to, k)    the line of light that crosses the void
 *
 * Presentation randomness comes from a seeded stream of its own (never Math.random: it would shift seeded fights).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const PZ = SL.data.poses;
  const glow = () => SL.Toon.tex.glow;
  const rng = U.mulberry32(778);

  /* ================================================================ poses */
  // Beerus' hands, clasped behind his back (the same as his own idle)
  const BACK = { shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [46, 86, 4], elbowR: [-68, 0, 0] };
  const BACK_L = { shoulderL: [46, -86, -4], elbowL: [-68, 0, 0] };

  // ASLEEP: on his back on the stone bed, arms loose at his sides, one knee up, slow breathing
  PZ.bg_sleep = (t) => {
    const b = Math.sin(t * 1.1);
    return {
      root: { y: -0.82, rx: -90 }, spine: [0, 0, 0], chest: [b * 2, 0, 0], head: [-4, 18, 0],
      shoulderL: [-8, 0, 12], elbowL: [-14, 0, 0], shoulderR: [-8, 0, -12], elbowR: [-14, 0, 0],
      thighL: [-40, 0, 6], kneeL: [70, 0, 0], thighR: [0, 0, -4], kneeR: [6, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // sitting up on the bed, both arms stretched over his head
  PZ.bg_sitStretch = (t) => {
    const b = Math.sin(t * 1.8);
    return {
      root: { y: -0.56, rx: -4 }, spine: [-8, 0, 0], chest: [-12 + b * 2, 0, 0], head: [-16, 0, 0],
      shoulderL: [-170, -10, 16], elbowL: [-30, 0, 0], shoulderR: [-170, 10, -16], elbowR: [-30, 0, 0],
      thighL: [-84, 0, 8], kneeL: [16, 0, 0], thighR: [-84, 0, -8], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // sitting up, the back of a hand to the yawn
  PZ.bg_sitYawn = (t) => ({
    root: { y: -0.56, rx: -4 }, spine: [-2, 0, 0], chest: [-6, 0, 0], neck: [-6, 0, 0], head: [-16, 0, 0],
    shoulderR: [-118, 24, -6], elbowR: [-148, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-20, 0, 0],
    thighL: [-84, 0, 8], kneeL: [16, 0, 0], thighR: [-84, 0, -8], kneeR: [16, 0, 0],
    hands: ['open', 'open'],
  });
  // THE GOD'S EVASIONS (Fighter storyEvade mode 'god'): a sway of the whole body, the hands never leave his back
  PZ.bg_sway = (t) => Object.assign({ root: { y: -0.02, rz: 14, rx: -6 }, spine: [-4, 0, 10], chest: [-6, 0, 10], head: [-6, 12, 12], thighL: [-2, 0, 14], kneeL: [10, 0, 0], thighR: [4, 0, -4], kneeR: [6, 0, 0], hands: ['open', 'open'] }, BACK);
  PZ.bg_sidestep = (t) => Object.assign({ root: { y: -0.06, rz: -6 }, hips: [0, 14, 0], spine: [2, -6, -6], chest: [0, -8, -4], head: [-4, 18, 0], thighL: [-14, 10, 24], kneeL: [22, 0, 0], thighR: [6, -6, -6], kneeR: [14, 0, 0], hands: ['open', 'open'] }, BACK);
  // one palm turns the fist away, the other hand stays behind his back
  PZ.bg_parry = Object.assign({ root: { y: -0.03 }, spine: [2, 10, 0], chest: [0, 14, 0], head: [2, -8, 0], shoulderR: [-76, 34, -34], elbowR: [-56, 0, 0], handR: [-30, 40, 0], thighL: [-8, 6, 10], kneeL: [12, 0, 0], thighR: [4, -6, -10], kneeR: [10, 0, 0], hands: ['open', 'open'] }, BACK_L);
  // THE FINGER: one index finger out in front of him, the fist stopped on its tip; bored
  PZ.bg_finger = Object.assign({ root: { y: -0.01 }, hips: [0, -6, 4], spine: [2, 6, 0], chest: [-2, 8, 0], head: [2, -6, 8], shoulderR: [-82, 0, -6], elbowR: [-12, 0, 0], handR: [-10, 0, 0], thighL: [-2, 2, 8], kneeL: [5, 0, 0], thighR: [0, -4, -9], kneeR: [9, 0, 0], hands: ['open', 'point'] }, BACK_L);
  PZ.bg_finger2 = PZ.bg_finger;
  // a hand out, gripping a wrist
  PZ.bg_grip = Object.assign({ root: { y: -0.02 }, spine: [2, 10, 0], chest: [0, 14, 0], head: [0, -10, 0], shoulderR: [-96, 0, -12], elbowR: [-24, 0, 0], thighL: [-8, 6, 10], kneeL: [12, 0, 0], thighR: [4, -6, -10], kneeR: [10, 0, 0], hands: ['open', 'fist'] }, BACK_L);
  // asking nicely (the pudding): leaning in, both hands together in front of his chest
  PZ.bg_ask = (t) => ({
    root: { y: -0.02, rx: 10 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-6, 0, 10 + Math.sin(t * 2) * 2],
    shoulderL: [-46, 26, 24], elbowL: [-96, 0, 0], shoulderR: [-46, -26, -24], elbowR: [-96, 0, 0],
    thighL: [-4, 0, 6], kneeL: [8, 0, 0], thighR: [-4, 0, -6], kneeR: [8, 0, 0],
    hands: ['open', 'open'],
  });
  // FURY: hunched, fists low at his sides, everything shaking
  PZ.bg_fury = (t) => {
    const q = Math.sin(t * 42) * 2.2;
    return {
      root: { y: -0.12, rx: 8 }, spine: [10, 0, 0], chest: [14 + q, 0, 0], neck: [-4, 0, 0], head: [-10, 0, q],
      shoulderL: [-12, 0, 30], elbowL: [-56, 0, 0], shoulderR: [-12, 0, -30], elbowR: [-56, 0, 0],
      thighL: [-22, 0, 14], kneeL: [30, 0, 0], thighR: [-22, 0, -14], kneeR: [30, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // eating with chopsticks
  PZ.bg_eat = (t) => {
    const k = 0.5 + 0.5 * Math.sin(t * 3.4);
    return Object.assign({ root: { y: 0 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [8 - k * 10, 0, 0], shoulderR: [-60 - k * 10, 30, -10], elbowR: [-120 - k * 14, 0, 0], hands: ['open', 'point'] }, BACK_L);
  };
  // standing, asleep (or pretending): the head drooping onto his chest, a little sway
  PZ.bg_doze = (t) => {
    const s = Math.sin(t * 0.9);
    return Object.assign({ root: { y: -0.02, rz: s * 2 }, spine: [6, 0, 0], chest: [6 + s, 0, 0], neck: [12, 0, 0], head: [30, 0, 12 + s * 4], thighL: [-2, 2, 8], kneeL: [6, 0, 0], thighR: [0, -4, -9], kneeR: [8, 0, 0], hands: ['open', 'open'] }, BACK);
  };
  // pointing a finger down at the ground (at the Earth)
  PZ.bg_pointDown = Object.assign({ root: { y: 0 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [16, 0, 0], shoulderR: [-38, 0, -8], elbowR: [-4, 0, 0], handR: [-20, 0, 0], hands: ['open', 'point'] }, BACK_L);
  // reaching down and catching a hand (zero gravity)
  PZ.bg_catch = Object.assign({ root: { y: 0, rx: 18 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [24, 0, 0], shoulderR: [-22, 0, -8], elbowR: [-6, 0, 0], thighL: [-10, 0, 6], kneeL: [20, 0, 0], footL: [30, 0, 0], thighR: [-2, 0, -6], kneeR: [12, 0, 0], footR: [30, 0, 0], hands: ['open', 'fist'] }, BACK_L);
  // pinching a pair of chopsticks out in front of him
  PZ.bg_chopsticks = Object.assign({ root: { y: -0.02 }, spine: [2, 10, 0], chest: [0, 14, 0], head: [2, -8, 0], shoulderR: [-88, 0, -10], elbowR: [-8, 0, 0], handR: [-30, 0, 0], thighL: [-8, 6, 10], kneeL: [12, 0, 0], thighR: [4, -6, -10], kneeR: [10, 0, 0], hands: ['open', 'point'] }, BACK_L);

  // Beerus' head tilted to one side: curious, amused, about to be entertained
  PZ.bg_tilt = (t2) => Object.assign({ root: { y: -0.01 }, hips: [0, -6, 4], spine: [2, 4, 0], chest: [-2, 4, 0], neck: [2, 0, 6], head: [0, -10, 18], thighL: [-2, 2, 8], kneeL: [5, 0, 0], thighR: [0, -4, -9], kneeR: [9, 0, 0], hands: ['open', 'open'] }, BACK);
  // Goku peeking round a door frame: leaning sideways, one hand on the frame, grinning
  PZ.bg_peek = { root: { y: -0.12, rz: -14 }, spine: [6, 0, -10], chest: [4, 0, -8], head: [2, 0, -10], shoulderR: [-120, 0, -40], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 10], elbowL: [-30, 0, 0], thighL: [-30, 0, 8], kneeL: [40, 0, 0], thighR: [-10, 0, -12], kneeR: [30, 0, 0], hands: ['open', 'open'] };
  PZ.bg_ssj3Roar = (t) => {
    const q = Math.sin(t * 60) * 2;
    return {
      hands: ['fist', 'fist'],
      root: { y: -0.14, rx: -6 }, spine: [-12, 0, q * 0.3], chest: [-18 + q, 0, 0], neck: [-12, 0, 0], head: [-22, 0, 0],
      shoulderL: [18, 0, 40 + q], elbowL: [-64, 0, 0], shoulderR: [18, 0, -40 - q], elbowR: [-64, 0, 0],
      thighL: [-24, 0, 28], kneeL: [46, 0, 0], footL: [-14, 0, -18], thighR: [-24, 0, -28], kneeR: [46, 0, 0], footR: [-14, 0, 18],
    };
  };
  // GOKU — the awkward bow, a hand scratching the back of his head
  PZ.bg_bowScratch = {
    root: { y: -0.02, rx: 16 }, spine: [14, 0, 0], chest: [8, 0, 0], head: [6, 0, 0],
    shoulderR: [-150, 0, -38], elbowR: [-122, 0, 0], shoulderL: [-6, 0, 10], elbowL: [-10, 0, 0],
    thighL: [-4, 0, 6], kneeL: [6, 0, 0], thighR: [-4, 0, -6], kneeR: [6, 0, 0],
    hands: ['open', 'open'],
  };
  // the fist, stopped: arm out, the whole body still leaning into a punch that went nowhere
  PZ.bg_stoppedPunch = (t) => {
    const q = Math.sin(t * 36) * 1.2;
    return {
      root: { y: -0.12, rx: 12 }, hips: [0, 20, 0], spine: [10, -14, 0], chest: [10 + q, -18, 0], head: [-10, 8, 0],
      shoulderR: [-92, 0, -4], elbowR: [-6, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-110, 0, 0],
      thighL: [-44, 0, 10], kneeL: [44, 0, 0], thighR: [22, 0, -10], kneeR: [12, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // UNDER THE SPHERE: both arms straight up, palms flat on it, legs bent under him
  PZ.bg_holdUp = (t) => {
    const q = Math.sin(t * 34) * 2.4;
    return {
      root: { y: 0, rx: -4 }, spine: [-4, 0, 0], chest: [-8 + q, 0, 0], neck: [-8, 0, 0], head: [-30, 0, 0],
      shoulderL: [-166 + q, 0, 24], elbowL: [-18, 0, 0], shoulderR: [-166 - q, 0, -24], elbowR: [-18, 0, 0],
      thighL: [-36, 0, 10], kneeL: [64, 0, 0], footL: [30, 0, 0], thighR: [-20, 0, -10], kneeR: [52, 0, 0], footR: [30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...and losing it: the elbows giving, the head falling back, the knees coming up
  PZ.bg_holdFail = (t) => {
    const q = Math.sin(t * 26) * 3;
    return {
      root: { y: 0, rx: -14 }, spine: [-10, 0, 0], chest: [-12 + q, 0, 0], neck: [-14, 0, 0], head: [-42, 0, q],
      shoulderL: [-150 + q, 0, 30], elbowL: [-78, 0, 0], shoulderR: [-150 - q, 0, -30], elbowR: [-82, 0, 0],
      thighL: [-52, 0, 12], kneeL: [90, 0, 0], footL: [30, 0, 0], thighR: [-40, 0, -12], kneeR: [84, 0, 0], footR: [30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // THE VOID: limp, turning slowly over backwards in the dark
  PZ.bg_tumble = (t) => ({
    root: { y: 0, rx: -40 - t * 22, rz: Math.sin(t * 0.7) * 14 }, spine: [-6, 0, 0], chest: [-4, 0, 0], head: [-18, 0, 10],
    shoulderL: [-30, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-50, 0, -60], elbowR: [-20, 0, 0],
    thighL: [-20, 0, 14], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [-6, 0, -10], kneeR: [24, 0, 0], footR: [30, 0, 0],
    hands: ['open', 'open'],
  });
  // the fists pulled to his waist: the grounded charging pose, even with nothing under him
  PZ.bg_fistsWaist = (t) => {
    const q = Math.sin(t * 30) * 1.4;
    return {
      root: { y: -0.18 }, spine: [6, 0, 0], chest: [8 + q, 0, 0], neck: [2, 0, 0], head: [-2, 0, 0],
      shoulderL: [22, 0, 22], elbowL: [-104, 0, 0], shoulderR: [22, 0, -22], elbowR: [-104, 0, 0],
      thighL: [-30, 0, 24], kneeL: [52, 0, 0], footL: [10, 0, 0], thighR: [-30, 0, -24], kneeR: [52, 0, 0], footR: [10, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // THE ROAR: the same, head thrown back, the whole chest open to the sky
  PZ.bg_roar = (t) => {
    const q = Math.sin(t * 44) * 2;
    return {
      root: { y: -0.16, rx: -10 }, spine: [-10, 0, 0], chest: [-18 + q, 0, 0], neck: [-22, 0, 0], head: [-44, 0, q],
      shoulderL: [26, 0, 30], elbowL: [-96, 0, 0], shoulderR: [26, 0, -30], elbowR: [-96, 0, 0],
      thighL: [-30, 0, 26], kneeL: [52, 0, 0], footL: [10, 0, 0], thighR: [-30, 0, -26], kneeR: [52, 0, 0], footR: [10, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // up into it: both arms driving straight up, the body a spear
  PZ.bg_surge = {
    root: { y: 0, rx: -6 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-34, 0, 0],
    shoulderL: [-172, 0, 12], elbowL: [-4, 0, 0], shoulderR: [-172, 0, -12], elbowR: [-4, 0, 0],
    thighL: [4, 0, 4], kneeL: [16, 0, 0], footL: [40, 0, 0], thighR: [10, 0, -4], kneeR: [24, 0, 0], footR: [40, 0, 0],
    hands: ['open', 'open'],
  };
  // AFTER: floating in zero gravity, emptied out, the chest heaving
  PZ.bg_float = (t) => {
    const b = Math.sin(t * 2.6);
    return {
      root: { y: 0.03 * Math.sin(t * 0.8), rx: -16, rz: 6 }, spine: [-4, 0, 0], chest: [-6 + b * 3, 0, 0], neck: [4, 0, 0], head: [6, 8, 10],
      shoulderL: [-24, 0, 46], elbowL: [-34, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-40, 0, 0],
      thighL: [-18, 0, 12], kneeL: [34, 0, 0], footL: [30, 0, 0], thighR: [-6, 0, -10], kneeR: [22, 0, 0], footR: [30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...the quiet laugh: the shoulders shaking, the head back a little
  PZ.bg_floatLaugh = (t) => {
    const q = Math.sin(t * 15) * 2;
    return Object.assign(PZ.bg_float(t), { chest: [-8 + q, 0, 0], head: [-8, 4, 6], neck: [-4, 0, 0] });
  };
  // ...and gone: the head lolled over, everything hanging
  PZ.bg_floatOut = (t) => Object.assign(PZ.bg_float(t * 0.3), { head: [20, 10, 34], neck: [10, 0, 10], chest: [-4, 0, 0] });
  // hanging by one wrist from somebody's grip: the right arm straight up, the rest of him limp
  PZ.bg_hangWrist = (t) => ({
    root: { y: 0, rz: Math.sin(t * 0.6) * 3 }, spine: [4, 0, 0], chest: [2, 0, 0], neck: [10, 0, 0], head: [26, 6, 22],
    shoulderR: [-172, 0, -8], elbowR: [-4, 0, 0], shoulderL: [-8, 0, 16], elbowL: [-24, 0, 0],
    thighL: [-8, 0, 6], kneeL: [26, 0, 0], footL: [40, 0, 0], thighR: [-2, 0, -6], kneeR: [16, 0, 0], footR: [40, 0, 0],
    hands: ['open', 'fist'],
  });

  // VEGETA — the host: a stiff, deep bow
  PZ.bg_hostBow = { root: { y: -0.02, rx: 30 }, spine: [24, 0, 0], chest: [10, 0, 0], head: [8, 0, 0], shoulderL: [-4, 0, 8], elbowL: [-6, 0, 0], shoulderR: [-4, 0, -8], elbowR: [-6, 0, 0], thighL: [-2, 0, 4], kneeL: [4, 0, 0], thighR: [-2, 0, -4], kneeR: [4, 0, 0], hands: ['open', 'open'] };
  // ...rubbing his hands, a painful smile
  PZ.bg_rub = (t) => {
    const s = Math.sin(t * 9) * 6;
    return { root: { y: -0.02, rx: 8 }, spine: [8, 0, 0], chest: [4, 0, 0], head: [-6, 0, 6], shoulderL: [-46, 24 + s, 18], elbowL: [-100, 0, 0], shoulderR: [-46, -24 - s, -18], elbowR: [-100, 0, 0], thighL: [-4, 0, 6], kneeL: [8, 0, 0], thighR: [-4, 0, -6], kneeR: [8, 0, 0], hands: ['open', 'open'] };
  };
  // ...BINGO: the microphone to his mouth, the other fist punching the air on the beat
  PZ.bg_bingo = (t) => {
    const k = Math.abs(Math.sin(t * 4.2));
    return {
      root: { y: -0.04 + k * 0.05 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-8, 0, 0],
      shoulderR: [-70, 30, -12], elbowR: [-122, 0, 0], shoulderL: [-120 - k * 50, 0, 22], elbowL: [-40 + k * 30, 0, 0],
      thighL: [-12, 0, 10], kneeL: [16 + k * 10, 0, 0], thighR: [-2, 0, -10], kneeR: [10, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the silence before it: fists clenched at his sides, the head down, trembling
  PZ.bg_tremble = (t) => {
    const q = Math.sin(t * 48) * 1.6;
    return {
      root: { y: -0.04 }, spine: [4, 0, 0], chest: [6 + q, 0, 0], neck: [6, 0, 0], head: [10, 0, q],
      shoulderL: [-6, 0, 18], elbowL: [-24, 0, 0], shoulderR: [-6, 0, -18], elbowR: [-24, 0, 0],
      thighL: [-8, 0, 10], kneeL: [12, 0, 0], thighR: [-8, 0, -10], kneeR: [12, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // THAT'S MY BULMA: arms flung out, fists, the scream at the sky
  PZ.bg_rageRoar = (t) => {
    const q = Math.sin(t * 50) * 2.4;
    return {
      root: { y: -0.14, rx: -6 }, spine: [-8, 0, 0], chest: [-14 + q, 0, 0], neck: [-16, 0, 0], head: [-32, 0, q],
      shoulderL: [-38, 0, 64], elbowL: [-34, 0, 0], shoulderR: [-38, 0, -64], elbowR: [-34, 0, 0],
      thighL: [-30, 0, 22], kneeL: [44, 0, 0], thighR: [-30, 0, -22], kneeR: [44, 0, 0],
      hands: ['fist', 'fist'],
    };
  };

  // KING KAI — hands on his head, running in circles
  PZ.bg_kkPanic = (t) => {
    const s = Math.sin(t * 14);
    return { root: { y: Math.abs(s) * 0.03 }, spine: [6, s * 8, 0], chest: [4, 0, 0], head: [-6, s * 14, 0], shoulderL: [-150, 0, 30], elbowL: [-130, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-130, 0, 0], thighL: [-s * 30, 0, 4], kneeL: [20 + Math.max(0, s) * 30, 0, 0], thighR: [s * 30, 0, -4], kneeR: [20 + Math.max(0, -s) * 30, 0, 0], hands: ['open', 'open'] };
  };
  // ...bowing to the ground
  PZ.bg_kkBow = { root: { y: -0.3, rx: 50 }, spine: [30, 0, 0], chest: [10, 0, 0], head: [10, 0, 0], shoulderL: [-90, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-90, 0, -20], elbowR: [-20, 0, 0], thighL: [-70, 0, 8], kneeL: [110, 0, 0], thighR: [-70, 0, -8], kneeR: [110, 0, 0], hands: ['open', 'open'] };
  // ...shoving somebody along with both hands
  PZ.bg_kkShove = { root: { y: -0.06, rx: 22 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-14, 0, 0], shoulderL: [-90, 0, 14], elbowL: [-20, 0, 0], shoulderR: [-90, 0, -14], elbowR: [-20, 0, 0], thighL: [-40, 0, 6], kneeL: [40, 0, 0], thighR: [20, 0, -6], kneeR: [10, 0, 0], hands: ['open', 'open'] };

  // BULMA — hands on her hips
  PZ.bg_hips = { root: { y: 0 }, hips: [0, -6, 4], spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-4, 0, 6], shoulderL: [-14, 30, 40], elbowL: [-100, 0, 0], shoulderR: [-14, -30, -40], elbowR: [-100, 0, 0], thighL: [-2, 4, 8], kneeL: [4, 0, 0], thighR: [0, -4, -6], kneeR: [6, 0, 0], hands: ['fist', 'fist'] };
  // ...the slap, swung across
  PZ.bg_slapW = { root: { y: 0 }, hips: [0, 14, 0], spine: [2, -14, 0], chest: [0, -20, 0], head: [0, 10, 0], shoulderR: [-50, 0, -70], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 14], elbowL: [-20, 0, 0], hands: ['open', 'open'] };
  PZ.bg_slap = { root: { y: -0.02, rx: 4 }, hips: [0, -16, 0], spine: [4, 18, 0], chest: [2, 26, 0], head: [-2, -16, 0], shoulderR: [-88, 0, 14], elbowR: [-8, 0, 0], shoulderL: [-10, 0, 14], elbowL: [-20, 0, 0], hands: ['open', 'open'] };

  // BUU — the tray hugged to his belly, licking the cups one after the other
  PZ.bg_lick = (t) => {
    const k = Math.abs(Math.sin(t * 5));
    return { root: { y: -0.04 }, spine: [10, 0, 0], chest: [14, 0, 0], neck: [10, 0, 0], head: [22 + k * 12, Math.sin(t * 2.5) * 16, 0], shoulderL: [-40, 0, 20], elbowL: [-80, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-80, 0, 0], thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [-6, 0, -12], kneeR: [8, 0, 0], hands: ['open', 'open'] };
  };
  PZ.bg_hug = { root: { y: -0.03 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0], shoulderL: [-46, 0, 16], elbowL: [-90, 0, 0], shoulderR: [-46, 0, -16], elbowR: [-90, 0, 0], thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [-6, 0, -12], kneeR: [8, 0, 0], hands: ['open', 'open'] };

  // THE RITUAL: hands joined round the circle, arms out low to either side, eyes closed
  PZ.bg_ring = (t) => {
    const b = Math.sin(t * 2);
    return { root: { y: b * 0.004 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [10, 0, 0], shoulderL: [-14, 0, 52], elbowL: [-8, 0, 0], shoulderR: [-14, 0, -52], elbowR: [-8, 0, 0], thighL: [-2, 0, 8], kneeL: [4, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0], hands: ['open', 'open'] };
  };
  // VIDEL: a hand on her belly, the other at her chest, a shy little smile
  PZ.bg_belly = { root: { y: 0 }, spine: [2, 0, 0], chest: [0, -6, 0], head: [12, 10, 6], shoulderL: [-24, 34, 14], elbowL: [-80, 0, 0], shoulderR: [-40, -20, -10], elbowR: [-118, 0, 0], thighL: [-4, 0, 6], kneeL: [8, 0, 0], thighR: [2, 0, -6], kneeR: [4, 0, 0], hands: ['open', 'open'] };
  // CHI-CHI: running at the lens, both arms reaching for him
  PZ.bg_reachRun = (t) => {
    const s = Math.sin(t * 11);
    return {
      root: { y: -0.04 + Math.abs(s) * 0.05, rx: 14 }, spine: [8, s * 4, 0], chest: [4, 0, 0], head: [-14, 0, 0],
      shoulderL: [-86 + s * 6, 0, 14], elbowL: [-18, 0, 0], shoulderR: [-86 - s * 6, 0, -14], elbowR: [-18, 0, 0],
      thighL: [-s * 40 - 10, 0, 4], kneeL: [20 + Math.max(0, s) * 60, 0, 0], thighR: [s * 40 - 10, 0, -4], kneeR: [20 + Math.max(0, -s) * 60, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // somebody watching the sky, a hand shading the eyes
  PZ.bg_lookUp = { root: { y: 0 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-30, 0, 0], shoulderR: [-130, 30, -30], elbowR: [-120, 0, 0], shoulderL: [-6, 0, 12], elbowL: [-10, 0, 0], thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0], hands: ['open', 'open'] };
  // a cheer with both fists up
  PZ.bg_cheer = (t) => {
    const k = Math.abs(Math.sin(t * 5));
    return { root: { y: k * 0.04 }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-14, 0, 0], shoulderL: [-160, 0, 24], elbowL: [-20, 0, 0], shoulderR: [-160, 0, -24], elbowR: [-20, 0, 0], thighL: [-4, 0, 8], kneeL: [6 + k * 10, 0, 0], thighR: [-4, 0, -8], kneeR: [6 + k * 10, 0, 0], hands: ['fist', 'fist'] };
  };


  /* ---------------------------------------------------------------- Vegeta's BINGO (the owner's beat list) */
  // the mic: right hand at the mouth (every move keeps it there)
  const MIC = { shoulderR: [-68, 34, -14], elbowR: [-124, 0, 0] };
  // carrying a tray in both hands, out in front of the chest
  PZ.bg_trayIdle = (t) => ({ root: { y: Math.sin(t * 2) * 0.004 }, spine: [2, 0, 0], chest: [-2, 0, 0], head: [6, 0, 0], shoulderL: [-50, 0, 14], elbowL: [-78, 0, 0], shoulderR: [-50, 0, -14], elbowR: [-78, 0, 0], thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0], hands: ['open', 'open'] });
  PZ.bg_trayWalk = (t, ctx) => {
    const sp = ctx && ctx.runRate ? ctx.runRate : 1;
    const s = Math.sin(t * 7 * sp);
    return { root: { y: -0.02 + Math.abs(s) * 0.015 }, spine: [4, 0, 0], chest: [0, 0, 0], head: [6, -s * 2, 0], shoulderL: [-50, 0, 14], elbowL: [-78, 0, 0], shoulderR: [-50, 0, -14], elbowR: [-78, 0, 0], thighL: [-s * 24 - 4, 0, 4], kneeL: [10 + Math.max(0, s) * 26, 0, 0], thighR: [s * 24 - 4, 0, -4], kneeR: [10 + Math.max(0, -s) * 26, 0, 0], hands: ['open', 'open'] };
  };
  // THE CLAPPING HOP: a wide awkward squat, hopping, the free hand slapping the microphone
  const hop = (side) => (t) => {
    const k = Math.abs(Math.sin(t * 7));
    const clap = Math.sin(t * 14) > 0;
    return Object.assign({
      root: { y: -0.26 + k * 0.12, rz: side * 8 }, spine: [6, 0, side * 4], chest: [2, side * 6, 0], head: [-4, -side * 6, 0],
      shoulderL: [-62, clap ? -44 : -20, 10], elbowL: [clap ? -112 : -80, 0, 0],
      thighL: [-34, 0, 34], kneeL: [64, 0, 0], footL: [-10, 0, -14], thighR: [-34, 0, -34], kneeR: [64, 0, 0], footR: [-10, 0, 14],
      hands: ['open', 'fist'],
    }, MIC);
  };
  PZ.bg_hopL = hop(1);
  PZ.bg_hopR = hop(-1);
  // THE RIGID SPIN: elbows locked straight out to the sides, legs stiff — a wind-up toy (the body turns by yaw)
  PZ.bg_rigidSpin = (t) => ({
    root: { y: -0.02 + Math.abs(Math.sin(t * 16)) * 0.03 }, spine: [0, 0, 0], chest: [-4, 0, 0], head: [-6, 0, 0],
    shoulderL: [-6, 0, 86], elbowL: [0, 0, 0], shoulderR: [-6, 0, -86], elbowR: [0, 0, 0],
    thighL: [-2, 0, 8], kneeL: [0, 0, 0], thighR: [-2, 0, -8], kneeR: [0, 0, 0],
    hands: ['open', 'fist'],
  });
  // THE SQUATTING KICK: deep in a squat, one boot kicked straight out, then the other (a Kazatsky), the mic at his mouth
  const kick = (side) => (t) => {
    const q = Math.sin(t * 30) * 1.2;
    const L = side > 0;
    return Object.assign({
      root: { y: -0.55 + Math.abs(Math.sin(t * 7)) * 0.04 }, spine: [10, 0, 0], chest: [4 + q, 0, 0], head: [-10, 0, 0],
      shoulderL: [-30, 0, 70], elbowL: [-20, 0, 0],
      thighL: L ? [-84, 0, 10] : [-104, 0, 16], kneeL: L ? [4, 0, 0] : [140, 0, 0], footL: L ? [30, 0, 0] : [-20, 0, 0],
      thighR: L ? [-104, 0, -16] : [-84, 0, -10], kneeR: L ? [140, 0, 0] : [4, 0, 0], footR: L ? [-20, 0, 0] : [30, 0, 0],
      hands: ['open', 'fist'],
    }, MIC);
  };
  PZ.bg_kickL = kick(1);
  PZ.bg_kickR = kick(-1);
  // THE PANIC GLANCE: mid-hop, the head snapped round to see if the god is still angry
  PZ.bg_glance = (t) => Object.assign(PZ.bg_hopL(t), { head: [-2, 52, 0], neck: [0, 18, 0] });
  // THE FINAL POSE: frozen, the free arm thrown at the sky, chest out, panting
  PZ.bg_finalPose = (t) => {
    const b2 = Math.sin(t * 9) * 2;
    return Object.assign({
      root: { y: -0.08 }, spine: [-6, 0, 0], chest: [-14 + b2, 0, 0], head: [-14, 0, 0],
      shoulderL: [-172, 0, 18], elbowL: [-4, 0, 0],
      thighL: [-14, 0, 22], kneeL: [16, 0, 0], thighR: [10, 0, -24], kneeR: [8, 0, 0],
      hands: ['point', 'fist'],
    }, MIC);
  };
  // ...and the arm coming down, shaking: humiliated, relieved
  PZ.bg_slump = (t) => Object.assign({ root: { y: -0.06 }, spine: [10, 0, 0], chest: [8 + Math.sin(t * 20) * 1.5, 0, 0], head: [16, 0, 0], shoulderL: [-6, 0, 10], elbowL: [-10, 0, 0], thighL: [-4, 0, 8], kneeL: [8, 0, 0], thighR: [-4, 0, -8], kneeR: [8, 0, 0], hands: ['open', 'fist'] }, MIC);
  // landing hard on the stage: a deep crouch, one hand on the boards
  PZ.bg_landHard = { root: { y: -0.48, rx: 10 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [-14, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-20, 0, -30], elbowR: [-40, 0, 0], thighL: [-96, 0, 14], kneeL: [120, 0, 0], thighR: [-40, 0, -18], kneeR: [110, 0, 0], hands: ['open', 'fist'] };
  // shoving the performers out of the way with both arms
  PZ.bg_shove = { root: { y: -0.06, ry: 20 }, spine: [6, 24, 0], chest: [4, 18, 0], head: [-6, -26, 0], shoulderL: [-80, 0, 50], elbowL: [-10, 0, 0], shoulderR: [-80, 0, -10], elbowR: [-20, 0, 0], thighL: [-30, 0, 12], kneeL: [30, 0, 0], thighR: [16, 0, -12], kneeR: [10, 0, 0], hands: ['open', 'open'] };
  // panicking: hunched, hands half up, the eyes on the god
  PZ.bg_panic = (t) => ({ root: { y: -0.08 + Math.sin(t * 30) * 0.004 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [2, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-90, 0, 0], thighL: [-14, 0, 10], kneeL: [20, 0, 0], thighR: [-14, 0, -10], kneeR: [20, 0, 0], hands: ['open', 'open'] });
  // jaws on the floor: arms hanging, the head pushed forward
  PZ.bg_jawDrop = (t) => ({ root: { y: 0 }, spine: [6, 0, 0], chest: [4, 0, 0], neck: [12, 0, 0], head: [8, 0, 0], shoulderL: [-4, 0, 10], elbowL: [-6, 0, 0], shoulderR: [-4, 0, -10], elbowR: [-6, 0, 0], thighL: [-2, 0, 6], kneeL: [4, 0, 0], thighR: [-2, 0, -6], kneeR: [4, 0, 0], hands: ['open', 'open'] });
  // a water gun levelled with both hands
  PZ.bg_aim = (t) => ({ root: { y: -0.06 }, spine: [4, 10, 0], chest: [2, 12, 0], head: [-2, -12, 0], shoulderR: [-86, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-74, 0, 30], elbowL: [-36, 0, 0], thighL: [-20, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [14, 0, 0], hands: ['fist', 'fist'] });
  // the god, wet and still: rigid, the eye twitching (the expression does the twitch)
  PZ.bg_freeze = (t) => Object.assign({ root: { y: 0 }, spine: [0, 0, 0], chest: [-2 + Math.sin(t * 40) * 0.6, 0, 0], head: [-4, 0, Math.sin(t * 50) * 1.2], thighL: [-2, 2, 8], kneeL: [5, 0, 0], thighR: [0, -4, -9], kneeR: [9, 0, 0], hands: ['open', 'open'] }, BACK);

  /* ================================================================ the kit */
  const K = (SL.data.bogKit = {
    scripted: () => ({ update: () => SL.emptyIntent(), scripted: true }),
    faceTo(f, p) {
      f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
    },
    unhook(m, fn) {
      const i = m.tickHooks.indexOf(fn);
      if (i >= 0) m.tickHooks.splice(i, 1);
    },
    clearCombat(b) {
      if (b.clash.active) b.clash._abort();
      for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
      for (const bm of b.projectiles.beams) bm.dispose();
    },
    toForm(f, id) {
      const i = f.def.forms.findIndex((x) => x.id === id);
      if (i < 0) return;
      if (f.lockedForms) delete f.lockedForms[id];
      if (f.storyLocks) delete f.storyLocks[id];
      if (f.formIndex !== i) f.applyForm(i);
    },
    /** A watcher: present, posed, never part of the fight. */
    watch(f, pose = 'idle', face = 'calm') {
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
      f.setState('scripted', { pose, expression: face });
    },
    /** GROUND: feet on the terrain (or the deck) at x, z. */
    ground(m, f, x, z, face, pose, expr) {
      f.setHidden(false);
      return m.space(f, 'ground', { pos: new V3(x, 0, z), face, pose, expr });
    },
    /** AIR: at world height y over x, z (the height is measured from whatever is under it: the sea floor, the deck). */
    air(m, f, x, y, z, face, pose, expr) {
      f.setHidden(false);
      const b = m.battle;
      if (!b.stage.hasGround) {
        // SPACE: no ground to measure from — the body is exactly where it is put, and stays there
        SL.Staging._put(f, new V3(x, y, z));
        f.grounded = false;
        f.storySpace = 'air';
        f.storyMode = 'air';
        if (face) K.faceTo(f, face);
        if (pose || f.state === 'scripted') f.setState('scripted', { pose: pose || 'flyIdle', expression: expr });
        return SL.Staging._done;
      }
      const gy = SL.Staging.groundY(b, x, z);
      return m.space(f, 'air', { pos: new V3(x, 0, z), height: Math.max(1.5, y - gy), face, pose, expr });
    },
    hide(list) {
      for (const f of list) if (f) {
        f.setHidden(true);
        f.untargetable = f.intangible = true;
        if (f.controller && !f.controller.castStub) f.controller = K.scripted();
      }
    },

    /** BEERUS' EVASION: the god does not get hit (storyEvade mode 'god'). from: who it applies to. */
    godDodge(f, opts = {}) {
      f.storyEvade = Object.assign({ mode: 'god', kinds: ['sway', 'step', 'sway', 'parry', 'step', 'sway', 'vanish'], swayPose: 'bg_sway', stepPose: 'bg_sidestep', parryPose: 'bg_parry', whiff: 12, count: 0 }, opts);
      return f.storyEvade;
    },

    /**
     * THE GOD AT PLAY (Beerus while he toys with them): he stands his ground with his hands behind his back and
     * turns to face you; godDodge slips whatever you throw; a blow left hanging gets a one-handed answer; crowd
     * him and you get flicked off; keep your distance and he yawns. opts: counter (frames between answers),
     * heavy (share of answers that are the flick/heel), reach, approach (he strolls in past this distance),
     * flick (God's Flicks per second at range), any (answer whichever enemy is closest, not only his target).
     */
    godBrain(b, f, opts = {}) {
      let cd = 40, yawn = 0, idle = 0, n = 0;
      return {
        godBrain: true,
        update() {
          const it = SL.emptyIntent();
          n++;
          if (yawn > 0) {
            if (--yawn === 0 && f.state === 'scripted') f.setState('free');
            return it;
          }
          if (opts.any && n % 10 === 0) {
            let best = null, bd = 3.2;
            for (const e of b.enemiesOf(f)) {
              if (e.hidden || e.untargetable || !e.alive) continue;
              const d = e.distTo(f);
              if (d < bd) {
                bd = d;
                best = e;
              }
            }
            if (best) f.target = best;
          }
          const t = f.target;
          if (!t || !t.alive || f.state === 'scripted') return it;
          if (f.state === 'free' && n % 2 === 0) f.faceTarget(10);
          const d = f.distTo(t);
          cd--;
          const sd = t.sd || {};
          const hanging = t.state === 'attack' && sd.move && t.stateFrame > (sd.startup || 0) + (sd.move.active || 0);
          const open = hanging || t.state === 'recover' || t.state === 'stagger' || t.state === 'land';
          if (d < (opts.reach || 2.4) && cd <= 0 && (open || n % 120 === 0)) {
            cd = opts.counter || 45;
            if (rng() < (opts.heavy === undefined ? 0.25 : opts.heavy)) it.heavy = true;
            else it.light = true;
            idle = 0;
            return it;
          }
          if (d > (opts.approach || 10)) {
            it.my = 0.45;
            idle = 0;
          } else if (d > 4.5) {
            idle++;
            if (idle > 200 && f.state === 'free') {
              idle = 0;
              yawn = 60;
              f.setState('scripted', { pose: 'bs_yawn', expression: 'closed', speed: 5 });
              return it;
            }
            if (opts.flick && rng() < opts.flick / 60 && f.ki > 25) it.s2 = true;
          } else idle = 0;
          return it;
        },
      };
    },

    /** Hand the player a real fight: hero (player) against foe (CPU, hard), both free, the music up. */
    brawl(m, hero, foe, opts = {}) {
      const b = m.battle;
      const prev = b.player;
      if (b.player !== hero) b.switchPlayer(hero, { force: true });
      // the one who was played before is out of this fight (switchPlayer would hand him an ally's brain)
      if (prev && prev !== hero && prev !== foe && !(opts.keep || []).includes(prev)) {
        prev.controller = K.scripted();
        if (prev.state !== 'scripted') prev.setState('scripted', { pose: 'idle', expression: prev.expression || 'shock' });
      }
      if (b.player === hero && hero.controller && (hero.controller.scripted || hero.controller.castStub)) hero.controller = hero._playerController || (hero._playerController = new SL.PlayerController(b));
      hero.untargetable = hero.intangible = false;
      hero.setHidden(false);
      foe.setHidden(false);
      foe.untargetable = foe.intangible = false;
      foe.controller = new SL.AIController(b, { difficulty: opts.difficulty || 'hard' });
      if (opts.profile) foe.controller.profileOverride = opts.profile;
      hero.target = foe;
      foe.target = hero;
      hero.setState('free');
      foe.setState('free');
      m.lock(false);
      b.aiLocked = false;
      if (opts.song !== false) m.music(opts.song || 'beerus_theme', opts.music === undefined ? 5 : opts.music);
    },
    /** An ally fighting beside the player (CPU), aimed at the foe. */
    ally(m, f, foe, opts = {}) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
      f.controller = new SL.AIController(m.battle, { difficulty: opts.difficulty || 'hard' });
      f.target = foe;
      f.setState('free');
    },

    /** GROUND, the liner: nobody who is standing walks off the deck into the sea. */
    keepOnDeck(m, list) {
      const b = m.battle;
      const hook = () => {
        const st = b.stage;
        if (!st.onDeck) return;
        for (const f of list) {
          if (!f || f.hidden || !f.alive) continue;
          // (a 1.5 m margin: the grid cells along the rail slope down toward the sea)
          if (f.pos.y > 1.5 || Math.abs(f.pos.x) < st.hullHalf(f.pos.z) - 1.5) continue;
          // back onto the planks, toward the middle of the ship
          const half = Math.max(0.5, st.hullHalf(f.pos.z) - 2);
          f.pos.x = U.clamp(f.pos.x, -half, half);
          f.pos.z = U.clamp(f.pos.z, -st.def.liner.length / 2 + 4, st.def.liner.length / 2 - 4);
          if (f.pos.y < 0) f.pos.y = 0;
          f.prevPos.copy(f.pos);
          f.vel.x *= -0.2;
          f.vel.z *= -0.2;
        }
      };
      m.tickHooks.push(hook);
      return hook;
    },
    /** AIR over the sea: nobody sinks into it — a body knocked down to the water skips off it in spray. */
    keepAbove(m, list, margin = 1.6) {
      const b = m.battle;
      const hook = () => {
        const lvl = b.stage.waterLevel;
        if (lvl === undefined) return;
        for (const f of list) {
          if (!f || f.hidden || !f.alive) continue;
          if (f.pos.y < lvl + margin) {
            const hard = f.vel.y < -8;
            f.pos.y = lvl + margin;
            f.prevPos.y = f.pos.y;
            if (f.vel.y < 0) f.vel.y = hard ? Math.min(6, -f.vel.y * 0.3) : 0;
            f.grounded = false;
            if (hard || b.frame % 10 === 0) K.splash(b, new V3(f.pos.x, lvl, f.pos.z), hard ? 2.2 : 0.8);
          }
        }
      };
      m.tickHooks.push(hook);
      return hook;
    },
    /** The sea answering: a column of spray where `pos` meets the water, and a ring on it. */
    splash(b, pos, size = 1.5) {
      const lvl = b.stage.waterLevel !== undefined ? b.stage.waterLevel : pos.y;
      const p = new V3(pos.x, lvl + 0.1, pos.z);
      b.vfx.ring(p, size * 3, 0xe8f6ff, 0.6, new V3(0, 1, 0));
      b.vfx.dust(p, size * 1.2, Math.round(8 + size * 6), 0xf4fbff);
      for (let i = 0; i < 6 + size * 4; i++) {
        const v = new V3((rng() - 0.5) * 4 * size, (6 + rng() * 10) * Math.sqrt(size), (rng() - 0.5) * 4 * size);
        b.vfx.rock(p, v, 0.12 + rng() * 0.18 * size, 0xdff2ff);
      }
      b.vfx.trail(p.clone().add(new V3(0, size * 1.5, 0)), 0xffffff, size * 1.4, 0.4);
    },
    /** Every heavy blow or explosion near the sea throws it up (call once per phase; returns off()). */
    seaReacts(m) {
      const b = m.battle;
      const offs = [
        b.on('crater', (e) => {
          const lvl = b.stage.waterLevel;
          const p = e && (e.pos || e.at);
          if (lvl === undefined || !p) return;
          K.splash(b, p, 3);
        }),
        b.on('damage', (e) => {
          const lvl = b.stage.waterLevel;
          const t = e && e.target;
          if (lvl === undefined || !t || !(e.amount > 900)) return;
          if (t.pos.y - lvl < 9) K.splash(b, t.pos, 1.6);
        }),
      ];
      const off = () => offs.forEach((o) => o());
      m.onDispose(off);
      return off;
    },

    /**
     * KING KAI'S HOUSE on the little planet: the white dome with its red band, the door, the spire; the red car;
     * the tree. Solid (an obstacle). smash(dir) — somebody went through it: the door blown in, a hole out the
     * back, rubble and dust. at is where it stands.
     */
    kkHouse(b, at) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const add = (geo, mat, x, y, z, outline) => {
        const mm = new THREE.Mesh(geo, mat && mat.isMaterial ? mat : T.mat(mat));
        mm.position.set(x, y, z);
        if (outline) T.addOutline(mm, outline);
        mm.castShadow = true;
        g.add(mm);
        return mm;
      };
      add(new THREE.SphereGeometry(4.2, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0xf4efe0, 0, 0, 0, 1.8);
      add(new THREE.CylinderGeometry(4.25, 4.25, 0.6, 28, 1, true), T.mat(0xd8402a, { side: THREE.DoubleSide }), 0, 0.3, 0);
      const door = add(new THREE.BoxGeometry(1.3, 2, 0.3), 0x6a4a2a, 0, 1, 4.05, 0.6);
      add(new THREE.ConeGeometry(0.35, 1.6, 8), 0xd8402a, 0, 4.9, 0, 0.6);
      // the windows
      for (const a of [0.7, -0.7, 2.2, -2.2]) add(new THREE.CircleGeometry(0.42, 12), 0x3a5a8a, Math.sin(a) * 3.7, 2.1, Math.cos(a) * 3.7, 0).lookAt(Math.sin(a) * 9, 2.1, Math.cos(a) * 9);
      // the car
      const car = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 3.2), T.mat(0xd8302a));
      body.position.y = 0.7;
      T.addOutline(body, 1.2);
      car.add(body);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.4), T.mat(0x9ad0ff));
      cab.position.set(0, 1.3, -0.2);
      car.add(cab);
      for (const [x, z] of [[0.9, 1.1], [-0.9, 1.1], [0.9, -1.1], [-0.9, -1.1]]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 12), T.mat(0x222222));
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.38, z);
        car.add(w);
      }
      car.position.set(7.5, 0, 2.5);
      car.rotation.y = 0.6;
      g.add(car);
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 4, 8), T.mat(0x6a4a2a));
      trunk.position.y = 2;
      tree.add(trunk);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), T.mat(0x3f8a2e));
      crown.position.y = 5;
      T.addOutline(crown, 1.5);
      tree.add(crown);
      tree.position.set(-8, 0, 3.5);
      g.add(tree);
      const st = b.stage;
      const base = at.clone();
      base.y = st.hasGround ? st.heightAt(base.x, base.z) - 0.15 : base.y;
      g.position.copy(base);
      const Rr = st.def.planet ? st.def.planet.radius : 1e6;
      g.quaternion.setFromUnitVectors(new V3(0, 1, 0), new V3(base.x / Rr, 1, base.z / Rr).normalize());
      b.scene.add(g);
      const obs = { shape: 'cyl', x: base.x, z: base.z, y: base.y, r: 4.3, h: 5, top: base.y + 4.4, hp: 1e9, maxHp: 1e9, alive: true, group: g, color: 0xf4efe0 };
      st.obstacles.push(obs);
      const holes = [];
      const api = {
        group: g,
        pos: base.clone(),
        door: () => g.localToWorld(new V3(0, 0, 5.4)),
        back: () => g.localToWorld(new V3(0, 0, -6)),
        /** Somebody went in the front and out the back. */
        smash() {
          door.visible = false;
          for (const z of [4.1, -4.1]) {
            const h = new THREE.Mesh(new THREE.CircleGeometry(1.25, 10), new THREE.MeshBasicMaterial({ color: 0x1a1410, side: THREE.DoubleSide }));
            h.position.set(0, 1.35, z * 1.005);
            g.add(h);
            holes.push(h);
          }
          const back = api.back();
          for (let i = 0; i < 18; i++) b.vfx.rock(back.clone().add(new V3(0, 1.4, 0)), new V3((rng() - 0.5) * 8, 3 + rng() * 6, (rng() - 0.5) * 8).addScaledVector(back.clone().sub(base).setY(0).normalize(), 6), 0.15 + rng() * 0.3, 0xf4efe0);
          b.vfx.dust(back, 3, 18, 0xe8e0c8);
          b.cameraTraumaAt(back, 0.6);
          b.sfx('rockBreak', null, { at: back, vol: 1.2 });
        },
        tree,
        car,
        /** A shockwave goes past: the house rattles, the tree bends away from it, the car rocks (k 0..1, every tick). */
        shake(k, from) {
          const away = from ? base.clone().sub(from).setY(0).normalize() : new V3(1, 0, 0);
          g.position.copy(base).add(new V3((rng() - 0.5) * 0.12 * k, 0, (rng() - 0.5) * 0.12 * k));
          tree.rotation.set(away.z * 0.5 * k, 0, -away.x * 0.5 * k);
          car.rotation.z = Math.sin(k * 20) * 0.08 * k;
        },
        dispose() {
          if (g.parent) g.parent.remove(g);
          obs.alive = false;
          const i = st.obstacles.indexOf(obs);
          if (i >= 0) st.obstacles.splice(i, 1);
        },
      };
      return api;
    },

    /**
     * WHAT THE STAFF KNOWS: a bubble of light over the orb with a picture inside it (painted on a canvas, always
     * facing the lens). kinds: 'namek' (Frieza, a dying green world), 'ssj' (a golden Saiyan in his aura),
     * 'kingkai' (a little green planet, a white dome), 'earth' (a blue planet), 'oracle' (a fish in a bowl).
     */
    vision(b, pos, kind) {
      const paint = {
        namek: (g, w, h) => {
          const sky = g.createLinearGradient(0, 0, 0, h);
          sky.addColorStop(0, '#2a6a3a');
          sky.addColorStop(1, '#b8f0a0');
          g.fillStyle = sky;
          g.fillRect(0, 0, w, h);
          g.fillStyle = '#ff6a2a';
          g.beginPath();
          g.arc(w * 0.72, h * 0.32, w * 0.16, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#3a8a5a';
          g.beginPath();
          g.moveTo(0, h);
          g.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.8);
          g.quadraticCurveTo(w * 0.85, h * 0.62, w, h * 0.78);
          g.lineTo(w, h);
          g.fill();
          // Frieza: a small pale figure with a tail, falling
          g.fillStyle = '#f2eef8';
          g.beginPath();
          g.ellipse(w * 0.42, h * 0.45, w * 0.05, h * 0.09, 0.5, 0, Math.PI * 2);
          g.fill();
          g.beginPath();
          g.arc(w * 0.4, h * 0.34, w * 0.035, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#7a2a9a';
          g.beginPath();
          g.arc(w * 0.4, h * 0.33, w * 0.02, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = '#f2eef8';
          g.lineWidth = w * 0.02;
          g.beginPath();
          g.moveTo(w * 0.46, h * 0.52);
          g.quadraticCurveTo(w * 0.56, h * 0.62, w * 0.5, h * 0.7);
          g.stroke();
        },
        ssj: (g, w, h) => {
          g.fillStyle = '#140c04';
          g.fillRect(0, 0, w, h);
          const a = g.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.48);
          a.addColorStop(0, '#fff6c0');
          a.addColorStop(0.45, '#ffc81e');
          a.addColorStop(1, 'rgba(255,160,0,0)');
          g.fillStyle = a;
          g.fillRect(0, 0, w, h);
          // the silhouette: shoulders, a head, spiked golden hair
          g.fillStyle = '#ff8a2a';
          g.beginPath();
          g.moveTo(w * 0.24, h);
          g.lineTo(w * 0.3, h * 0.72);
          g.lineTo(w * 0.7, h * 0.72);
          g.lineTo(w * 0.76, h);
          g.fill();
          g.fillStyle = '#f6c49a';
          g.beginPath();
          g.arc(w / 2, h * 0.6, w * 0.1, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#ffe24a';
          g.beginPath();
          const spikes = [[0.3, 0.52], [0.34, 0.3], [0.42, 0.44], [0.5, 0.2], [0.58, 0.44], [0.66, 0.3], [0.7, 0.52]];
          g.moveTo(w * 0.36, h * 0.6);
          for (const [x, y] of spikes) g.lineTo(w * x, h * y);
          g.lineTo(w * 0.64, h * 0.6);
          g.fill();
          g.fillStyle = '#18b89a';
          g.fillRect(w * 0.45, h * 0.6, w * 0.03, h * 0.02);
          g.fillRect(w * 0.52, h * 0.6, w * 0.03, h * 0.02);
        },
        kingkai: (g, w, h) => {
          const sky = g.createLinearGradient(0, 0, 0, h);
          sky.addColorStop(0, '#e89a3a');
          sky.addColorStop(1, '#ffe6a0');
          g.fillStyle = sky;
          g.fillRect(0, 0, w, h);
          g.fillStyle = '#5aa032';
          g.beginPath();
          g.arc(w / 2, h * 1.05, w * 0.42, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#f4efe0';
          g.beginPath();
          g.arc(w * 0.46, h * 0.66, w * 0.1, Math.PI, 0);
          g.fill();
          g.fillStyle = '#d8402a';
          g.fillRect(w * 0.36, h * 0.655, w * 0.2, h * 0.02);
          g.fillRect(w * 0.6, h * 0.62, w * 0.08, h * 0.04);
          g.fillStyle = '#3f8a2e';
          g.beginPath();
          g.arc(w * 0.28, h * 0.58, w * 0.06, 0, Math.PI * 2);
          g.fill();
          // a small orange figure (Goku, training)
          g.fillStyle = '#f57b22';
          g.fillRect(w * 0.7, h * 0.58, w * 0.025, h * 0.06);
          g.fillStyle = '#16161c';
          g.beginPath();
          g.arc(w * 0.712, h * 0.565, w * 0.018, 0, Math.PI * 2);
          g.fill();
        },
        earth: (g, w, h) => {
          g.fillStyle = '#020208';
          g.fillRect(0, 0, w, h);
          g.fillStyle = '#2a6ac8';
          g.beginPath();
          g.arc(w / 2, h / 2, w * 0.34, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#4a9a4a';
          for (const [x, y, r] of [[0.42, 0.42, 0.1], [0.58, 0.55, 0.08], [0.46, 0.62, 0.06]]) {
            g.beginPath();
            g.arc(w * x, h * y, w * r, 0, Math.PI * 2);
            g.fill();
          }
        },
      };
      const T = SL.Toon;
      const tex = {};
      const texOf = (k) => tex[k] || (tex[k] = T.canvasTexture(256, 256, (g, w, h) => {
        (paint[k] || paint.earth)(g, w, h);
        // the round frame of the bubble
        g.globalCompositeOperation = 'destination-in';
        const m = g.createRadialGradient(w / 2, h / 2, w * 0.36, w / 2, h / 2, w * 0.5);
        m.addColorStop(0, 'rgba(0,0,0,1)');
        m.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = m;
        g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
      }));
      const pic = new THREE.Sprite(new THREE.SpriteMaterial({ map: texOf(kind), transparent: true, opacity: 0, depthWrite: false, fog: false }));
      pic.scale.setScalar(1.6);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0x9ae8ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      halo.scale.setScalar(2.6);
      const g = new THREE.Group();
      g.add(halo, pic);
      g.position.copy(pos);
      b.scene.add(g);
      let k = 0;
      return {
        group: g,
        kind(next) {
          pic.material.map = texOf(next);
          pic.material.needsUpdate = true;
          b.vfx.flash(g.position, 1.6, 0xbff4ff, 0.25, glow());
        },
        fade(v) {
          k = U.clamp01(v);
          pic.material.opacity = k;
          halo.material.opacity = k * 0.55;
          const s = 0.4 + k * 0.6;
          pic.scale.setScalar(1.6 * s);
          halo.scale.setScalar(2.6 * s);
        },
        at(p) {
          g.position.copy(p);
        },
        dispose() {
          if (g.parent) b.scene.remove(g);
          pic.material.dispose();
          halo.material.dispose();
          for (const t of Object.values(tex)) t.dispose();
        },
      };
    },

    /** THE ANGELS' WAY OF TRAVEL: a pillar of pale light round whoever is in it. k 0..1 brightness; dispose(). */
    travel(b, at, height = 60) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xcff4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, height, 20, 1, true), mat);
      col.position.copy(at).add(new V3(0, height / 2 - 1, 0));
      b.scene.add(col);
      return {
        mesh: col,
        set(k) {
          mat.opacity = U.clamp01(k) * 0.55;
          col.scale.set(0.6 + k * 0.4, 1, 0.6 + k * 0.4);
        },
        at(p) {
          col.position.copy(p).add(new V3(0, height / 2 - 1, 0));
        },
        dispose() {
          if (col.parent) b.scene.remove(col);
          col.geometry.dispose();
          mat.dispose();
        },
      };
    },

    /** THE PUDDING: a silver tray of cups — custard with a dark caramel top. lick(i) leaves it wet and shining. */
    pudding(b, pos) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.05, 20), T.mat(0xd8dce4));
      T.addOutline(tray, 0.6);
      g.add(tray);
      const cups = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const cup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 12), T.mat(0xf6d070));
        body.position.y = 0.1;
        T.addOutline(body, 0.4);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.035, 12), T.mat(0x7a3a12));
        top.position.y = 0.18;
        const shine = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false }));
        shine.position.set(0, 0.22, 0);
        shine.scale.setScalar(0.18);
        cup.add(body, top, shine);
        cup.position.set(Math.cos(a) * (i % 2 ? 0.42 : 0.26), 0.02, Math.sin(a) * (i % 2 ? 0.42 : 0.26));
        g.add(cup);
        cups.push({ cup, top, shine, licked: false });
      }
      g.position.copy(pos);
      b.scene.add(g);
      return {
        group: g,
        cups,
        count: cups.length,
        lick(i) {
          const c = cups[i];
          if (!c || c.licked) return;
          c.licked = true;
          c.top.material = T.mat(0xa8582a);
          c.shine.material.opacity = 0.9;
          b.vfx.sparks(g.localToWorld(c.cup.position.clone().add(new V3(0, 0.22, 0))), 0xffffff, 3, 1.5, 0.04);
        },
        on(f, joint = 'chest', off = [0, 0.05, 0.32]) {
          const j = f.model.joints[joint];
          if (!j) return;
          j.add(g);
          g.position.set(off[0], off[1], off[2]);
          g.rotation.set(0, 0, 0);
          g.scale.setScalar(1 / (f.model.root.scale.y || 1));
        },
        put(p) {
          b.scene.add(g);
          g.position.copy(p);
          g.scale.setScalar(1);
        },
        dispose() {
          if (g.parent) g.parent.remove(g);
          g.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
            if (o.isSprite) o.material.dispose();
          });
        },
      };
    },

    /** THE RITUAL: a ring of light on the deck round the six, and the pillar it sends into the sky. set(k), colour(c). */
    ritual(b, centre, radius = 3.4) {
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x8ae8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius - 0.3, radius + 0.3, 48), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(centre).add(new V3(0, 0.06, 0));
      const pillarMat = new THREE.MeshBasicMaterial({ color: 0x8ae8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius * 1.1, 220, 24, 1, true), pillarMat);
      pillar.position.copy(centre).add(new V3(0, 110, 0));
      const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xdff8ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false }));
      core.position.copy(centre).add(new V3(0, 1.2, 0));
      core.scale.setScalar(radius * 3);
      b.scene.add(ring, pillar, core);
      let k = 0, n = 0;
      return {
        set(v) {
          k = U.clamp01(v);
          ringMat.opacity = Math.min(1, k * 1.6) * 0.85;
          pillarMat.opacity = Math.max(0, k - 0.25) * 0.5;
          core.material.opacity = k * 0.7;
          pillar.scale.set(0.6 + k * 0.4, 1, 0.6 + k * 0.4);
        },
        get k() {
          return k;
        },
        colour(c) {
          ringMat.color.set(c);
          pillarMat.color.set(c);
          core.material.color.set(c);
        },
        /** cyan streams going up the pillar (call every tick) */
        stream() {
          if (++n % 3 || k < 0.05) return;
          const a = rng() * Math.PI * 2, r = radius * (0.4 + rng() * 0.6);
          const p = centre.clone().add(new V3(Math.cos(a) * r, 0.3 + rng() * 2, Math.sin(a) * r));
          for (let i = 0; i < 4; i++) b.vfx.trail(p.clone().add(new V3(0, i * (4 + k * 8), 0)), ringMat.color.getHex(), 0.3 + k * 0.4, 0.5);
        },
        dispose() {
          for (const o of [ring, pillar, core]) {
            if (o.parent) b.scene.remove(o);
            if (o.geometry) o.geometry.dispose();
            o.material.dispose();
          }
        },
      };
    },

    /** THE SKY TURNING: from the stage's own sky toward { top, horizon, bottom } by k (0 = its own). */
    skyTo(b, to, k) {
      const st = b.stage, s = st.def.sky, u = st.sky && st.sky.material.uniforms;
      if (!u) return;
      k = U.clamp01(k);
      u.top.value.set(s.top).lerp(new THREE.Color(to.top), k);
      u.horizon.value.set(s.horizon).lerp(new THREE.Color(to.horizon), k);
      u.bottom.value.set(s.bottom).lerp(new THREE.Color(to.bottom), k);
      if (to.fog !== undefined && b.scene.fog && st.def.fog) b.scene.fog.color.set(st.def.fog.color).lerp(new THREE.Color(to.fog), k);
    },
    skyBack(b) {
      const st = b.stage, s = st.def.sky, u = st.sky && st.sky.material.uniforms;
      if (!u) return;
      u.top.value.set(s.top);
      u.horizon.value.set(s.horizon);
      u.bottom.value.set(s.bottom);
      if (b.scene.fog && st.def.fog) b.scene.fog.color.set(st.def.fog.color);
    },
    SKY: {
      storm: { top: 0x3a2a3a, horizon: 0xc8a050, bottom: 0x5a4a3a, fog: 0x8a7a5a },
      divine: { top: 0x4a0a1e, horizon: 0xff4a5a, bottom: 0x7a1a2a, fog: 0xb83a4a },
      high: { top: 0x061238, horizon: 0x4a90d8, bottom: 0x8ac8f0, fog: 0x7ab0e0 },
    },

    /**
     * THE SPHERE OF DESTRUCTION: a sun of orange and red fire on the end of a god's finger, big enough to end a
     * planet. Lights everything round it (a point light), pulses, and comes apart from inside when God Ki gets
     * into it: veins(k) — crimson lines spreading over it; crack(k) — the light breaking through them; burst(k)
     * — it blows outward and is gone.
     */
    sphere(b, pos) {
      const add = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), add(0xff5a14, 0.55));
      const mid = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 26), add(0xff9a2a, 0.5));
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.72, 36, 24), new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false }));
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.98, 36, 24), new THREE.MeshBasicMaterial({ color: 0xff4a10, side: THREE.BackSide, transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
      inner.visible = false;
      const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xff7a2a, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
      corona.scale.setScalar(3.6);
      const corona2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffd080, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
      corona2.scale.setScalar(2.2);
      // the veins of God Ki: thin crimson arcs over the surface, hidden until the end
      const veinMat = add(0xff2a6a, 0);
      const veins = new THREE.Group();
      for (let i = 0; i < 26; i++) {
        const v = new THREE.Mesh(new THREE.TorusGeometry(1.004, 0.012 + rng() * 0.012, 4, 24, 0.6 + rng() * 1.4), veinMat);
        v.rotation.set(rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2);
        veins.add(v);
      }
      // the heat: rings of shimmer wheeling round it
      const heat = [];
      for (let i = 0; i < 3; i++) {
        const h = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.32 + i * 0.1, 48), add(0xffb060, 0.12));
        h.rotation.set(rng() * 3, rng() * 3, 0);
        heat.push(h);
        g.add(h);
      }
      const light = new THREE.PointLight(0xff7a2a, 2.2, 600, 1.4);
      g.add(shell, mid, core, inner, veins, corona, corona2, light);
      g.position.copy(pos);
      b.scene.add(g);
      let r = 1, n = 0;
      g.scale.setScalar(r);
      const api = {
        group: g,
        pos: g.position,
        light,
        get radius() {
          return r;
        },
        set(v) {
          r = Math.max(0.05, v);
          g.scale.setScalar(r);
          light.distance = 120 + r * 14;
        },
        pulse() {
          n++;
          shell.material.opacity = 0.48 + Math.sin(n * 0.25) * 0.08;
          mid.rotation.y += 0.01;
          core.rotation.y -= 0.016;
          corona.material.opacity = 0.75 + Math.sin(n * 0.17) * 0.12;
          for (let i = 0; i < heat.length; i++) {
            heat[i].rotation.z += 0.004 * (i + 1);
            heat[i].rotation.x += 0.002;
          }
          light.intensity = 2 + Math.sin(n * 0.3) * 0.3;
          if (n % 4 === 0 && b.vfx) {
            const d = new V3(Math.sin(n * 1.7), Math.cos(n * 0.9), Math.sin(n * 2.3)).normalize();
            b.vfx.sparks(g.position.clone().addScaledVector(d, r * 0.98), 0xffc070, 4, 3, 0.1 + r * 0.004);
          }
        },
        veins(k) {
          veinMat.opacity = U.clamp01(k) * 0.95;
          veins.rotation.y += 0.01;
        },
        crack(k) {
          k = U.clamp01(k);
          veinMat.color.setRGB(1, 0.16 + k * 0.7, 0.4 + k * 0.5);
          core.material.color.setRGB(1, 0.88 - k * 0.3, 0.63 - k * 0.3);
          g.scale.setScalar(r * (1 + Math.sin(n * 1.7) * 0.012 * k));
        },
        burst(k) {
          k = U.clamp01(k);
          g.scale.setScalar(r * (1 + k * 1.6));
          for (const o of [shell, mid, inner]) o.material.opacity = (1 - k) * 0.6;
          core.visible = k < 0.4;
          corona.material.opacity = 1 - k;
          corona2.material.opacity = 1 - k;
          veinMat.opacity = 1 - k;
          light.intensity = 2.4 * (1 - k);
        },
        inside(on) {
          inner.visible = !!on;
          core.visible = !on;
          mid.visible = !on;
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
          });
          for (const o of [shell, mid, core, inner, ...heat]) o.material.dispose();
          veinMat.dispose();
          corona.material.dispose();
          corona2.material.dispose();
        },
      };
      return api;
    },

    /** THE VOID: the world and everybody gone except `keep` (fighters): a black picture, no sky, no fog. */
    voidOn(m, keep = []) {
      const b = m.battle;
      if (b._void) return;
      b._void = { bg: b.scene.background, fog: b.scene.fog, hidden: new Map() };
      b.stage.setVoid(true);
      b.scene.background = new THREE.Color(0x000000);
      b.scene.fog = null;
      // the stage took its lights with it: a cold, faint light so a body in the dark is still a body
      b._void.light = new THREE.HemisphereLight(0x9ab0ff, 0x0a0a18, 0.75);
      b._void.key = new THREE.DirectionalLight(0xdfe8ff, 0.5);
      b._void.key.position.set(-3, 6, 4);
      b.scene.add(b._void.light, b._void.key);
      for (const f of b.fighters) {
        b._void.hidden.set(f, f.hidden);
        if (!keep.includes(f)) f.setHidden(true);
      }
      m.onDispose(() => K.voidOff(m));
    },
    voidOff(m, restore = true) {
      const b = m.battle;
      const v = b._void;
      if (!v) return;
      b._void = null;
      if (b.stage.setVoid) b.stage.setVoid(false);
      b.scene.background = v.bg;
      b.scene.fog = v.fog;
      b.scene.remove(v.light, v.key);
      if (restore) for (const [f, h] of v.hidden) f.setHidden(h);
    },
    /** The line of light across the void, drawn from `from` toward `to` as far as k. */
    blueLine(b, from, to, k) {
      const head = from.clone().lerp(to, U.clamp01(k));
      for (let i = 0; i < 6; i++) b.vfx.trail(from.clone().lerp(head, 1 - i * 0.03 * (1 - k * 0.5)), i ? 0x6ac8ff : 0xe8f8ff, i ? 0.35 : 0.6, 0.6);
      return head;
    },

    /**
     * A PARTY THAT LIVES: every guest on a little routine — walk somewhere, do something there (eat, laugh, talk,
     * lean on the rail), walk on. routines: [{ f, steps: [{ to: [x, z], speed, pose }, { pose, expr, face: V3,
     * seconds, say: [who, line] }], loop }]. Only touches bodies in the 'scripted' state (anyone the player or an
     * AI drives is left alone). Returns { stop(), pause(f, on) }. GROUND only.
     */
    life(m, routines) {
      const b = m.battle;
      const R = routines.filter((r) => r && r.f).map((r) => ({ f: r.f, steps: r.steps, i: 0, t: 0, moving: false, loop: r.loop !== false, paused: false }));
      const next = (r) => {
        r.t = 0;
        r.moving = false;
        if (r.i < r.steps.length - 1) r.i++;
        else if (r.loop) r.i = 0;
        else r.done = true;
      };
      const hook = () => {
        for (const r of R) {
          const f = r.f;
          if (r.paused || r.done || f.hidden || f.state !== 'scripted') continue;
          const s = r.steps[r.i];
          if (!s) continue;
          if (s.to) {
            const to = new V3(s.to[0], 0, s.to[1]);
            const d = to.clone().sub(f.pos).setY(0);
            const dist = d.length();
            const spd = (s.speed || 1.6) / 60;
            if (dist <= spd + 0.03) {
              f.setPosition(new V3(to.x, SL.Staging.groundY(b, to.x, to.z), to.z));
              f.prevPos.copy(f.pos);
              next(r);
              continue;
            }
            d.normalize();
            const p = f.pos.clone().addScaledVector(d, spd);
            p.y = SL.Staging.groundY(b, p.x, p.z);
            f.setPosition(p);
            f.prevPos.copy(f.pos);
            f.grounded = true;
            f.yaw = f.prevYaw = Math.atan2(d.x, d.z);
            if (!r.moving) {
              r.moving = true;
              f.setState('scripted', { pose: s.pose || 'ez_walk', expression: s.expr || f.expression || 'calm', speed: s.anim || 8 });
            }
          } else {
            if (r.t === 0) {
              f.setState('scripted', { pose: s.pose || 'idle', expression: s.expr || 'calm', speed: s.anim || 6 });
              if (s.face) K.faceTo(f, s.face.isVector3 ? s.face : s.face.pos);
              if (s.say) m.say(s.say[0], s.say[1], s.say[2] || 2.6, { style: s.say[3] });
            }
            r.t += 1 / 60;
            if (r.t >= (s.seconds || 3)) next(r);
          }
        }
      };
      m.tickHooks.push(hook);
      return {
        stop() {
          K.unhook(m, hook);
        },
        pause(f, on = true) {
          for (const r of R) if (r.f === f) r.paused = on;
        },
        hook,
      };
    },


    /**
     * A TRANSFORMATION AS A FILM (the owner, 2026-10-06: "not button → aura → model changes"). Gameplay hands over to
     * a shot list built around the fighter, the form lands at the burst, the camera gives it back. Shots (A–I):
     * wide with the watcher in frame → feet (the ground answering) → torso (the aura rising) → hands (the fists) →
     * face (the head going back) → hair (growing out of the scalp, in stages, for Super Saiyan 3) → wide (the burst)
     * → the watcher's reaction → the launch. opts: watcher, kind ('ssj' | 'ssj2' | 'ssj3'), lineBefore, watcherLine,
     * launch (true: he flies at the watcher at the end), music.
     */
    *transformCine(m, f, formId, o = {}) {
      const b = m.battle, w = o.watcher;
      const kind = o.kind || formId;
      const fm = f.def.forms.find((x) => x.id === formId) || {};
      const col = (fm.aura && fm.aura.color) || 0xffd23a;
      const hairCol = (fm.look && fm.look.hair && fm.look.hair.color) || 0xffd23a;
      m.lock(true);
      K.clearCombat(b);
      f.setState('scripted', { pose: 'idle', expression: 'determined', speed: 8 });
      f.vel.set(0, 0, 0);
      if (w) {
        w.setState('scripted', { pose: 'bs_idle', expression: 'calm' });
        K.faceTo(w, f.pos);
        K.faceTo(f, w.pos);
      }
      const cast = { f, w };
      const big = kind === 'ssj3';
      let t = 0, fx = 0;
      // what the world does while it builds: rocks lifting, dust round the feet, lightning, the ground cracking
      const fxHook = () => {
        t += 1 / 60;
        fx = Math.min(1, fx + 1 / 60 / (big ? 7 : 4.5));
        if (b.frame % 4 === 0 && b.stage.hasGround) {
          const a = rng() * Math.PI * 2, r = 1.5 + rng() * (2 + fx * 4);
          const p = f.pos.clone().add(new V3(Math.cos(a) * r, 0.05, Math.sin(a) * r));
          p.y = b.stage.heightAt(p.x, p.z);
          b.vfx.rock(p, new V3(0, 2 + fx * 7 * rng(), 0), 0.08 + rng() * 0.22, b.stage.rockColor);
        }
        if (b.frame % 6 === 0) b.vfx.dust(f.pos, 1 + fx * 2.5, 3, (b.stage.def.terrain && b.stage.def.terrain.sand) || 0xc8b890);
        if ((kind !== 'ssj' || fx > 0.6) && b.frame % (big ? 4 : 7) === 0) b.vfx.bolt(f.chest().add(new V3((rng() - 0.5) * 1.6, (rng() - 0.5) * 1.8, (rng() - 0.5) * 1.6)), 0.6 + rng() * 0.8);
        b.camera.addTrauma(0.012 + fx * (big ? 0.05 : 0.03));
      };
      m.tickHooks.push(fxHook);
      b.stage.setMood(big ? 0.7 : 0.45, big ? 0x08080f : 0x141428, 1.4);
      if (o.music !== undefined) m.music(null, o.music);
      const shot = (spec, s) => SL.Cinema.shotOn(m, cast, spec, s + 0.5);
      const manual = (fn, s) => m.shot(fn, s + 0.5, { cut: true, blendIn: 0, subject: f });
      const fwd = () => f.forward.clone().setY(0).normalize();
      const side = () => {
        const v = fwd();
        return new V3(v.z, 0, -v.x);
      };
      // A — WIDE: the two of them, the watcher calm
      if (o.lineBefore) m.say('goku', o.lineBefore, 2.6);
      shot(w ? { subject: 'f', with: 'w', focus: 'full' } : { subject: 'f', focus: 'wide', angle: 'three', room: 3 }, 2);
      f.setState('scripted', { pose: 'g_ssjClench', expression: 'grit', speed: 6, aura: 0.25 });
      b.sfx('heartbeat', f);
      yield* m.cine(big ? 2 : 1.4);
      // B — FEET: the ground starts to answer
      manual((tt, out) => {
        const p = f.pos;
        out.pos.copy(p).addScaledVector(fwd(), 1.5).addScaledVector(side(), 0.7).add(new V3(0, 0.22, 0));
        out.look.copy(p).add(new V3(0, 0.3, 0));
        out.fov = 50;
      }, 1.4);
      if (b.stage.crater && b.stage.hasGround) b.stage.crater(f.pos, 1.6, 0.06, null);
      b.sfx('rumble', f, { vol: 0.8 });
      yield* m.cine(big ? 1.5 : 1.1);
      // C — TORSO: the aura climbs him
      shot({ subject: 'f', focus: 'upper', angle: 'three', side: -1 }, 1.6);
      f.setState('scripted', { pose: 'g_ssjClench', expression: 'grit', speed: 6, aura: 0.6 });
      b.sfx('kiCharge', f, { vol: 0.9 });
      yield* m.cine(big ? 1.6 : 1.2);
      // D — HANDS: the fists close
      manual((tt, out) => {
        const h = f.handPos('R');
        // from in front and off to the side, a metre out: the fist and the forearm, the chest soft behind them
        out.pos.copy(h).addScaledVector(fwd(), 0.95).addScaledVector(side(), -0.75).add(new V3(0, 0.22, 0));
        out.look.copy(h);
        out.fov = 30;
      }, 1.1);
      b.sfx('block', f, { pitch: 0.5, vol: 0.6 });
      yield* m.cine(1.05);
      // E — FACE: the head goes back, the roar
      f.setState('scripted', { pose: big ? 'bg_ssj3Roar' : 'g_ssjRage', expression: 'shout', speed: 7, aura: 0.85 });
      shot({ subject: 'f', focus: 'closeup', angle: 'front' }, 1.4);
      b.sfx('roar', f, { vol: 1, pitch: big ? 0.8 : 1 });
      b.sfx('ssjRise', f, { vol: 1 });
      yield* m.cine(big ? 1.4 : 1.1);
      // F — HAIR: the camera over his head as the hair comes out of the scalp
      manual((tt, out) => {
        const h = f.headPos();
        out.pos.copy(h).addScaledVector(fwd(), -0.9).addScaledVector(side(), 0.85).add(new V3(0, 0.75, 0));
        out.look.copy(h).add(new V3(0, 0.05, 0)).addScaledVector(fwd(), -0.25);
        out.fov = 44;
      }, big ? 2.6 : 1.2);
      if (big) {
        const stages = ['goku_ssj3_g1', 'goku_ssj3_g2', 'goku_ssj3_g3'];
        for (let i = 0; i < stages.length; i++) {
          f.model.setHair(stages[i], hairCol);
          b.vfx.flash(f.headPos(), 1.2, 0xfff2b0, 0.15, glow());
          b.sfx('kiUp', f, { vol: 0.6, pitch: 0.8 + i * 0.15 });
          yield* m.cine(0.8);
        }
      } else {
        // the hair goes gold in flashes before it stays
        for (let i = 0; i < 4; i++) {
          f.model.setForm(i % 2 ? f.form : fm);
          yield* m.cine(0.16);
        }
      }
      // G — WIDE: the burst
      K.toForm(f, formId);
      f.setState('scripted', { pose: 'powerUp', expression: 'shout', speed: 16, aura: 1 });
      shot({ subject: 'f', focus: 'wide', angle: 'three', room: big ? 7 : 5 }, 1.6);
      SL.ScreenFX.flash(0.35, '#' + new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.5).getHexString());
      b.vfx.ring(f.pos.clone().add(new V3(0, 0.25, 0)), big ? 22 : 14, col, 0.9, new V3(0, 1, 0));
      b.vfx.ring(f.chest(), big ? 7 : 5, 0xffffff, 0.5);
      b.vfx.explosion(f.chest(), 0.9, col, { smoke: false });
      if (b.stage.crater && b.stage.hasGround) b.stage.crater(f.pos, big ? 6 : 4, big ? 0.6 : 0.3, null);
      b.vfx.dust(f.pos, big ? 8 : 5, 30);
      b.cameraTraumaAt(f.pos, 1);
      b.sfx('transformBurst', f, { vol: 1.3 });
      K.unhook(m, fxHook);
      b.stage.setMood(0.2, 0x141428, 1.2);
      yield* m.cine(big ? 1.6 : 1.2);
      f.setState('scripted', { pose: kind === 'ssj' ? 'g_ssjReveal' : 'g2_stance', expression: 'determined', speed: 6 });
      // H — the watcher, unimpressed (or a little impressed)
      if (w) {
        shot({ subject: 'w', focus: 'closeup', angle: 'three' }, o.watcherLine ? 2.6 : 1.4);
        w.setState('scripted', { pose: o.watcherPose || 'bg_tilt', expression: o.watcherFace || 'smirk', speed: 6 });
        if (o.watcherLine) m.say(o.watcherWho || 'beerus', o.watcherLine, 2.6);
        yield* m.cine(o.watcherLine ? 2.6 : 1.4);
      }
      // I — the launch at him: the player takes it from here
      if (o.launch && w) {
        const to = w.pos.clone().addScaledVector(f.pos.clone().sub(w.pos).setY(0).normalize(), 1.6);
        f.setState('scripted', { pose: 'dash', expression: 'shout', speed: 14, aura: 1 });
        shot({ subject: 'f', focus: 'full', angle: 'back' }, 0.7);
        const h = m.space(f, 'flight', { to, seconds: 0.45, pose: 'dash', endPose: 'dash' });
        yield () => h.done();
        b.sfx('dash', f);
      }
      b.stage.clearMood(1);
      m.endShot();
    },

    /** A god's blow meeting the world: a ring along the ground, grass and grit thrown outward, dust. */
    shockwave(b, at, opts = {}) {
      const r = opts.radius || 18;
      const p = at.clone();
      if (b.stage.hasGround) p.y = b.stage.heightAt(p.x, p.z) + 0.15;
      b.vfx.ring(p, r, opts.color || 0xffffff, 0.8, new V3(0, 1, 0));
      b.vfx.ring(p, r * 0.6, opts.color2 || 0xfff2c0, 0.55, new V3(0, 1, 0));
      const grass = opts.grass || (b.stage.def.terrain && b.stage.def.terrain.sand) || 0x6ab83a;
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + rng() * 0.2;
        const d = new V3(Math.cos(a), 0, Math.sin(a));
        const q = p.clone().addScaledVector(d, 0.6 + rng() * 2);
        b.vfx.rock(q, d.clone().multiplyScalar(10 + rng() * 14).add(new V3(0, 3 + rng() * 5, 0)), 0.06 + rng() * 0.1, i % 3 ? grass : 0xd8c8a0);
      }
      b.vfx.dust(p, r * 0.4, 30);
      b.cameraTraumaAt(p, opts.shake === undefined ? 0.9 : opts.shake);
    },


    /**
     * A WORLD MARKER the player cannot miss (the owner: "WHAT FOOD? WHERE IS IT? WHERE DO I TAKE IT?"): a glowing
     * diamond bobbing over the target with a column of light under it, drawn through everything; a label that
     * floats over it on screen; and, when it is off screen, the label pinned to the screen edge with an arrow
     * pointing the way. opts: at() → V3 (the target's feet), label, color (hex number), height (above the target).
     * Returns { show(on), label(text), dispose() }.
     */
    marker(m, opts) {
      const b = m.battle;
      const col = opts.color === undefined ? 0xffd24a : opts.color;
      const css = '#' + new THREE.Color(col).getHexString();
      const g = new THREE.Group();
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), new THREE.MeshBasicMaterial({ color: col, depthTest: false, transparent: true, opacity: 0.95 }));
      gem.scale.set(0.8, 1.3, 0.8);
      gem.renderOrder = 999;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 1, 10, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      g.add(gem, beam, ring);
      b.scene.add(g);
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;z-index:30;pointer-events:none;transform:translate(-50%,-100%);font:800 16px/1.1 system-ui,sans-serif;letter-spacing:.08em;color:#fff;text-shadow:0 0 4px #000,0 0 2px #000;white-space:nowrap;text-align:center;';
      const arrow = document.createElement('div'), text = document.createElement('div');
      arrow.style.cssText = 'font-size:26px;color:' + css + ';display:none';
      arrow.textContent = '➤';
      text.style.cssText = 'background:rgba(0,0,0,.45);border:2px solid ' + css + ';border-radius:12px;padding:3px 9px';
      el.appendChild(arrow);
      el.appendChild(text);
      document.body.appendChild(el);
      text.textContent = opts.label || '';
      let on = true, n = 0;
      const v = new V3();
      const hook = () => {
        n++;
        const at = opts.at();
        const h = opts.height === undefined ? 2.7 : opts.height;
        g.visible = on;
        el.style.display = on && !b.inputLocked ? 'block' : 'none';
        if (!on) return;
        g.position.copy(at);
        gem.position.set(0, h + Math.sin(n * 0.09) * 0.18, 0);
        gem.rotation.y += 0.04;
        // the farther away, the bigger: readable across the whole deck
        const far = Math.max(1, b.camera.camera.position.distanceTo(at) / 8);
        gem.scale.set(0.8 * far, 1.3 * far, 0.8 * far);
        beam.scale.set(1, h, 1);
        beam.position.set(0, h / 2, 0);
        ring.position.set(0, 0.06, 0);
        ring.scale.setScalar(1 + Math.sin(n * 0.12) * 0.12);
        // on screen: the label over the gem; off screen: pinned to the edge, the arrow pointing at it
        const cam = b.camera.camera;
        const canvas = SL.Render.canvas;
        const rect = canvas && canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
        v.copy(at).add(new V3(0, h + 0.6, 0)).project(cam);
        const behind = v.z > 1;
        let x = v.x, y = v.y;
        if (!isFinite(x) || !isFinite(y)) return;
        if (behind) {
          x = -x;
          y = -y;
        }
        const off = behind || Math.abs(x) > 0.92 || Math.abs(y) > 0.88;
        if (off) {
          const k = 0.9 / Math.max(Math.abs(x), Math.abs(y) / 0.95, 1e-3);
          x *= k;
          y = Math.max(-0.75, Math.min(0.4, y * k)); // clear of the HUD in the top corners
          arrow.style.display = 'block';
          arrow.style.transform = 'rotate(' + (-Math.atan2(y, x) * 180) / Math.PI + 'deg)';
        } else arrow.style.display = 'none';
        el.style.left = rect.left + ((x + 1) / 2) * rect.width + 'px';
        el.style.top = rect.top + ((1 - y) / 2) * rect.height + 'px';
      };
      m.tickHooks.push(hook);
      const api = {
        show(v2) {
          on = !!v2;
          if (!on) {
            g.visible = false;
            el.style.display = 'none';
          }
        },
        label(t2) {
          text.textContent = t2;
        },
        dispose() {
          K.unhook(m, hook);
          if (g.parent) b.scene.remove(g);
          for (const o of [gem, beam, ring]) {
            o.geometry.dispose();
            o.material.dispose();
          }
          if (el.parentNode) el.parentNode.removeChild(el);
        },
      };
      m.onDispose(api.dispose);
      return api;
    },

    /** Glowing footsteps along the deck from `from` to `to` (call every so often): the way to go. */
    path(b, from, to, color = 0xffd24a) {
      const d = to.clone().sub(from).setY(0);
      const L = d.length();
      if (L < 2) return;
      d.normalize();
      const n = Math.min(10, Math.floor(L / 1.6));
      for (let i = 1; i <= n; i++) {
        const p = from.clone().addScaledVector(d, (i / (n + 1)) * L);
        p.y = (b.stage.hasGround ? SL.Staging.groundY(b, p.x, p.z) : p.y) + 0.12;
        b.vfx.trail(p, color, 0.28, 0.7);
      }
    },

    /** A TRAY OF FOOD (a silver tray, a pile of dishes). put(p) on a table; carry(f) in someone's two hands. */
    tray(b, pos) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 20), T.mat(0xdfe3ea));
      T.addOutline(plate, 0.5);
      g.add(plate);
      const food = [0xe8a040, 0xd84a3a, 0x6ab84a, 0xf2e2b0, 0xc87aa0];
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.075 + (i % 2) * 0.02, 10, 8), T.mat(food[i]));
        m.position.set(Math.cos(a) * 0.17, 0.07, Math.sin(a) * 0.17);
        m.scale.y = 0.7;
        g.add(m);
      }
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), T.mat(0xf0c060));
      top.position.set(0, 0.12, 0);
      g.add(top);
      g.position.copy(pos);
      b.scene.add(g);
      let carrier = null;
      return {
        group: g,
        get carrier() {
          return carrier;
        },
        put(p) {
          carrier = null;
          b.scene.add(g);
          g.position.copy(p);
          g.rotation.set(0, 0, 0);
          g.scale.setScalar(1);
        },
        carry(f) {
          carrier = f;
          const j = f.model.joints.chest;
          j.add(g);
          const s = 1 / (f.model.root.scale.y || 1);
          g.scale.setScalar(s);
          g.position.set(0, 0.06, 0.36);
          g.rotation.set(0, 0, 0);
        },
        dispose() {
          if (g.parent) g.parent.remove(g);
          g.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
          });
        },
      };
    },

    /** Big anime sweat drops on someone's forehead and cheeks (on false takes them off). */
    sweat(f, on) {
      const mdl = f.model;
      if (!mdl || !mdl.headCenter) return;
      if (!mdl.__bgSweat) {
        const g = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.9 });
        const R = mdl.b.headR;
        for (const [x, y, z, s] of [[0.78, 0.5, 0.5, 1.2], [-0.82, 0.3, 0.45, 1], [0.6, -0.1, 0.75, 0.8]]) {
          const d = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat);
          d.position.set(x * R, y * R, z * R);
          d.scale.set(0.022 * s, 0.034 * s, 0.014 * s);
          g.add(d);
        }
        mdl.headCenter.add(g);
        mdl.__bgSweat = g;
      }
      mdl.__bgSweat.visible = !!on;
    },
    /** Red cheeks: embarrassment (on false takes them off). */
    blush(f, on) {
      const mdl = f.model;
      if (!mdl || !mdl.headCenter) return;
      if (!mdl.__bgBlush) {
        const g = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xff5a6a, transparent: true, opacity: 0.55, depthWrite: false });
        const R = mdl.b.headR;
        for (const s of [1, -1]) {
          const d = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat);
          d.position.set(s * 0.5 * R, -0.22 * R, 0.86 * R);
          d.scale.set(0.028, 0.014, 0.008);
          g.add(d);
        }
        mdl.headCenter.add(g);
        mdl.__bgBlush = g;
      }
      mdl.__bgBlush.visible = !!on;
    },
    /** A stream of water from a water gun (call every tick while it fires): from → to, a spray where it lands. */
    squirt(b, from, to, hit) {
      for (let i = 0; i < 5; i++) b.vfx.trail(from.clone().lerp(to, (i + (b.frame % 5) * 0.2) / 5), 0xbfe8ff, 0.09, 0.18);
      if (hit && b.frame % 3 === 0) b.vfx.sparks(to, 0xdff6ff, 4, 3, 0.05);
    },

    /** A pseudo-point a scene can aim at. */
    pt(ctx, name, v) {
      ctx.cast[name] = { pos: v.clone() };
      return ctx.cast[name];
    },
    /** Everybody in the mission's story table (the scenes' cast). */
    cast(m) {
      const s = m.battle.story || {};
      const out = {};
      for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
      return out;
    },
    /** A phase that is one scene. */
    scene(id, sceneId, opts = {}) {
      return {
        id,
        checkpoint: !!opts.checkpoint,
        run: function* (m) {
          m.lock(true);
          m.clearObjectives();
          if (opts.title) m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
          if (opts.before) opts.before(m);
          yield* SL.Cinema.play(m, sceneId);
        },
      };
    },
    /** The mission's closing card. */
    after(title) {
      return {
        id: 'after',
        run: function* (m) {
          m.lock(true);
          m.clearObjectives();
          m.fade('black', 1.2);
          yield* m.cine(1.4);
          m.endShot();
          m.title(m.def.chapter, title || m.def.title.toUpperCase(), m.nextLine(), 4.4);
          yield* m.cine(4.6);
        },
      };
    },
    /**
     * A HOLD-CHARGE METER the story drives (the ritual): holding raises it, letting go lets it sink; `cap` is as
     * far as it can go (the five-Saiyan ritual dies at 0.7 whatever the player does). beats: [{ at, run(m) }],
     * tick(m, k) every frame. Returns { k, seconds }.
     */
    *hold(m, opts) {
      const b = m.battle, f = opts.fighter;
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.charge;
      m.limits(lim);
      b.inputLocked = false;
      b.aiLocked = true;
      if (b.player !== f) b.switchPlayer(f, { force: true });
      const cap = opts.cap === undefined ? 1 : opts.cap;
      const need = opts.seconds || 4;
      let k = opts.start || 0, t = 0, held = 0, next = 0;
      const beats = (opts.beats || []).slice().sort((a, c) => a.at - c.at);
      m.prompt('hold_' + (opts.id || 'meter'), 'charge', opts.label || 'Hold to pour it in', { required: true, until: () => k >= cap - 0.001, always: true });
      const hook = () => {
        t += 1 / 60;
        const holding = !!(f.intent && f.intent.charge) || (b.skipRequested && false);
        if (holding) held += 1 / 60;
        k = U.clamp(k + (holding ? 1 / (need * 60) : -0.25 / 60), 0, cap);
        while (next < beats.length && k >= beats[next].at) beats[next++].run(m);
        if (opts.tick) opts.tick(m, k, holding);
        b.emit('struggle', { active: true, progress: 1 - k, rate: 0, label: opts.meter || 'POWER', action: 'charge' });
      };
      m.tickHooks.push(hook);
      b.skipRequested = false;
      // a bot or a player who stops holding still gets there: after `auto` seconds the meter fills by itself
      const auto = opts.auto === undefined ? 14 : opts.auto;
      yield () => k >= cap - 0.001 || t > auto;
      while (next < beats.length && beats[next].at <= cap) beats[next++].run(m);
      K.unhook(m, hook);
      b.emit('struggle', { active: false });
      const id = 'hold_' + (opts.id || 'meter');
      if (m.prompts.has(id)) {
        m.prompts.delete(id);
        b.emit('prompt', { id, show: false });
      }
      m.limits(null);
      b.inputLocked = true;
      return { k, seconds: t, held };
    },
  });
})();
