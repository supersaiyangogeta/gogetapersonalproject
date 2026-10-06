/*
 * CELL GAMES KIT — shared staging for the rebuilt Cell Games chain (Chapter 6, owner's brief of
 * 2026-10-01: "revamp the whole Cell saga — the map, the camera, the deaths, Goku's sacrifice, Gohan's
 * transformation; everything cinematic").
 *
 *   spots     the arena as the reference has it: the 16x16 ring, the high ridge the Z Fighters watch
 *             from (Goku lies down up there after the forfeit), the World Champion's crew by their van
 *   cast      everybody spawned once per mission (CK.cast), and the world a checkpoint expects (CK.restore)
 *   deaths    shown, not cut away from: CK.split clones a body into two clipped pieces that move on
 *             their own (a head off, a body in halves); CK.burst for what is left (a Junior's blue
 *             liquid and smoke, an android's sparks and gears, Cell's green vapour)
 *   pieces    Cell Junior eggs, Android 16's head (a piece of his own model), the Senzu Bean, the rock
 *             Goku leans on, Gregory (King Kai's cricket), Cell swelling up like a balloon
 *   poses     the Cell Games' own acting, on any rig (SL.data.poses)
 *
 * SL.data.cellGames is the same object (the old mission's name for it).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const UP = new V3(0, 1, 0);
  const C = SL.data.poses;

  /* ================================================================ acting (any rig) */
  // sitting back against a rock, legs out, hands locked behind the head (Goku, after the forfeit)
  C.lieBackRock = (t) => {
    const b = Math.sin(t * 1.3);
    return {
      root: { y: -0.7, rx: -42 }, spine: [-4, 0, 0], chest: [-2 + b, 0, 0], neck: [10, 0, 0], head: [22, -14, 0],
      shoulderL: [-158, 0, 58], elbowL: [-138, 0, 0], shoulderR: [-158, 0, -58], elbowR: [-138, 0, 0],
      thighL: [-52, 0, 10], kneeL: [8, 0, 0], footL: [20, 0, 0], thighR: [-46, 0, -6], kneeR: [16, 0, 0], footR: [24, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // one palm flat on something in front of him
  C.palmOn = { root: { y: -0.02, rx: 6 }, spine: [4, 0, 0], chest: [4, -6, 0], head: [2, 4, 0], shoulderR: [-82, 0, -8], elbowR: [-12, 0, 0], handR: [-64, 0, 0], shoulderL: [-6, 0, 16], elbowL: [-24, 0, 0], thighL: [-14, 0, 10], kneeL: [16, 0, 0], thighR: [8, 0, -10], kneeR: [10, 0, 0], hands: ['fist', 'open'] };
  // ...and looking back over his shoulder at his son, the palm still there
  C.palmLookBack = { root: { y: -0.02, rx: 4 }, spine: [2, 20, 0], chest: [0, 30, 0], neck: [0, 20, 0], head: [-4, 46, 0], shoulderR: [-80, -20, -8], elbowR: [-14, 0, 0], handR: [-64, 0, 0], shoulderL: [-6, 0, 16], elbowL: [-24, 0, 0], thighL: [-14, 0, 10], kneeL: [16, 0, 0], thighR: [8, 0, -10], kneeR: [10, 0, 0], hands: ['fist', 'open'] };
  // scratching the back of his head, sheepish
  C.scratchHead = (t) => ({ root: { y: 0 }, chest: [-2, 0, 0], head: [-4, -8, 6], shoulderR: [-150, 0, -48], elbowR: [-124 + Math.sin(t * 9) * 8, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-20, 0, 0], thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0], hands: ['fist', 'open'] });
  // the senzu flick: thumb under the bean, up and across
  C.senzuFlick = { root: { y: 0 }, chest: [-4, -10, 0], head: [-6, 10, 0], shoulderR: [-120, 0, -20], elbowR: [-30, 0, 0], handR: [-30, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-20, 0, 0], thighL: [-6, 0, 9], kneeL: [6, 0, 0], thighR: [2, 0, -9], kneeR: [6, 0, 0], hands: ['fist', 'point'] };
  // powered down, hands at his sides, breathing through the mouth
  C.handsDown = (t) => {
    const b = Math.sin(t * 5);
    return { root: { y: -0.03 + b * 0.008 }, spine: [6, 0, 0], chest: [6 + b * 2, 0, 0], head: [4, 0, 0], shoulderL: [-2, 0, 10], elbowL: [-10, 0, 0], shoulderR: [-2, 0, -10], elbowR: [-10, 0, 0], thighL: [-6, 0, 9], kneeL: [10, 0, 0], thighR: [0, 0, -9], kneeR: [10, 0, 0], hands: ['open', 'open'] };
  };
  // on his knees, both fists driven into the dirt, head down
  C.kneelPound = (t) => {
    const s = Math.sin(t * 7);
    return { root: { y: -0.52, rx: 34 }, spine: [22, 0, 0], chest: [12, 0, 0], neck: [10, 0, 0], head: [12 + s * 3, 0, 0], shoulderL: [-56 + s * 6, 0, 18], elbowL: [-14, 0, 0], shoulderR: [-56 - s * 6, 0, -18], elbowR: [-14, 0, 0], thighL: [-96, 0, 10], kneeL: [104, 0, 0], thighR: [-96, 0, -10], kneeR: [104, 0, 0], hands: ['fist', 'fist'] };
  };
  // down on the right knee, the broken left arm held across the stomach
  C.cradleArm = (t) => {
    const b = Math.sin(t * 6);
    return { root: { y: -0.42, rx: 16 }, spine: [16, 0, 0], chest: [10 + b * 2, 10, 0], head: [-2, -6, 0], shoulderL: [-38, 30, 6], elbowL: [-104, 0, 0], shoulderR: [-56, 0, -10], elbowR: [-96, 0, 0], thighL: [-82, 0, 8], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [112, 0, 0], footR: [40, 0, 0], hands: ['open', 'fist'] };
  };
  // flung between a blast and somebody else, arms out
  C.shieldDive = { root: { y: 0.1, rx: 58 }, spine: [-10, 0, 0], chest: [-10, 0, 0], head: [-34, 0, 0], shoulderL: [-110, 0, 60], elbowL: [-10, 0, 0], shoulderR: [-110, 0, -60], elbowR: [-10, 0, 0], thighL: [6, 0, 8], kneeL: [26, 0, 0], thighR: [-8, 0, -8], kneeR: [40, 0, 0], hands: ['open', 'open'] };
  // an open-hand chop driven sideways (the first Junior)
  C.chopW = { root: { y: -0.06 }, hips: [0, 20, 0], spine: [2, 22, 0], chest: [2, 30, 0], head: [-4, -24, 0], shoulderR: [-60, 0, -80], elbowR: [-80, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-70, 0, 0], thighL: [-26, 0, 12], kneeL: [32, 0, 0], thighR: [16, 0, -12], kneeR: [24, 0, 0], hands: ['fist', 'open'] };
  C.chop = { root: { y: -0.08, rx: 6 }, hips: [0, -20, 0], spine: [4, -26, 0], chest: [4, -34, 0], head: [-6, 24, 0], shoulderR: [-88, 0, 26], elbowR: [-6, 0, 0], handR: [0, 0, 0], shoulderL: [-30, 0, 34], elbowL: [-80, 0, 0], thighL: [-34, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [20, 0, 0], hands: ['fist', 'open'] };
  // elbow out to one side, fist out to the other (the third and fourth together)
  C.doubleStrike = { root: { y: -0.12 }, hips: [0, 0, 0], spine: [6, 0, 0], chest: [6, 0, 0], head: [0, 0, 0], shoulderL: [-90, 0, 90], elbowL: [-150, 0, 0], shoulderR: [-10, 0, -96], elbowR: [-4, 0, 0], thighL: [-30, 0, 28], kneeL: [40, 0, 0], thighR: [-30, 0, -28], kneeR: [40, 0, 0], hands: ['fist', 'fist'] };
  // holding something by the ankle up over the head, about to bring it down
  C.slamUp = { root: { y: -0.02, rx: -10 }, spine: [-14, 0, 0], chest: [-16, 0, 0], head: [-20, 0, 0], shoulderR: [-176, 0, -12], elbowR: [-20, 0, 0], shoulderL: [-170, 0, 16], elbowL: [-24, 0, 0], thighL: [-20, 0, 14], kneeL: [26, 0, 0], thighR: [12, 0, -14], kneeR: [22, 0, 0], hands: ['fist', 'fist'] };
  C.slamDown = { root: { y: -0.22, rx: 34 }, spine: [22, 0, 0], chest: [20, 0, 0], head: [0, 0, 0], shoulderR: [-40, 0, -10], elbowR: [-6, 0, 0], shoulderL: [-44, 0, 10], elbowL: [-8, 0, 0], thighL: [-60, 0, 16], kneeL: [72, 0, 0], thighR: [30, 0, -16], kneeR: [26, 0, 0], hands: ['fist', 'fist'] };
  // one palm out at point-blank range (a ki flash)
  C.palmFlash = { root: { y: -0.06, rx: 6 }, spine: [6, -10, 0], chest: [6, -16, 0], head: [-6, 12, 0], shoulderR: [-92, 0, -4], elbowR: [-4, 0, 0], handR: [-66, 0, 0], shoulderL: [-16, 0, 26], elbowL: [-50, 0, 0], thighL: [-30, 0, 12], kneeL: [36, 0, 0], thighR: [16, 0, -12], kneeR: [24, 0, 0], hands: ['fist', 'open'] };
  // the Kamehameha charged in mid-air, pitched forward to face the ground below (the hands at the hip)
  C.kameDown = (t) => {
    const s = Math.sin(t * 32) * 1.2;
    return { root: { rx: 52 }, hips: [0, -24, 0], spine: [4, -14, 0], chest: [6 + s * 0.3, -26, 0], neck: [-16, 0, 0], head: [-20, 26, 0], shoulderR: [28, 0, -8], elbowR: [-96, 0, 0], handR: [0, 0, 20], shoulderL: [-16, 0, -56], elbowL: [-100, 0, 0], handL: [0, 0, -20], thighL: [-10, 0, 8], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [10, 0, -8], kneeR: [56, 0, 0], footR: [30, 0, 0], hands: ['open', 'open'] };
  };
  // crouched low under somebody's chin, both palms thrust up at the jaw — and the same as it goes off
  C.kameCrouch = { root: { y: -0.34, rx: 4 }, spine: [-4, 0, 0], chest: [-8, 0, 0], neck: [-10, 0, 0], head: [-16, 0, 0], shoulderL: [-126, 0, -10], elbowL: [-10, 0, 0], handL: [-50, 0, -10], shoulderR: [-126, 0, 10], elbowR: [-10, 0, 0], handR: [-50, 0, 10], thighL: [-74, 0, 18], kneeL: [104, 0, 0], footL: [-20, 0, 0], thighR: [-30, 0, -18], kneeR: [84, 0, 0], footR: [-30, 0, 0], hands: ['open', 'open'] };
  C.kameCrouchFire = (t) => {
    const s = Math.sin(t * 50) * 2;
    return Object.assign({}, C.kameCrouch, { root: { y: -0.32, rx: -6 + s * 0.3 }, chest: [-14 + s, 0, 0], shoulderL: [-122 + s, 0, -10], shoulderR: [-122 - s, 0, 10] });
  };
  // the Cell Juniors' own acting
  C.cj_flee = (t) => ({ root: { rx: 64 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-30, 0, 0], head: [-30, Math.sin(t * 20) * 10, 0], shoulderL: [40, 0, 30 + Math.sin(t * 24) * 20], elbowL: [-30, 0, 0], shoulderR: [40, 0, -30 - Math.sin(t * 24) * 20], elbowR: [-30, 0, 0], thighL: [8, 0, 6], kneeL: [40, 0, 0], thighR: [-6, 0, -6], kneeR: [50, 0, 0], hands: ['open', 'open'] });
  C.cj_fire = { root: { y: -0.08 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [-6, 0, 0], shoulderL: [-90, 0, 6], elbowL: [-6, 0, 0], handL: [-60, 0, 0], shoulderR: [-90, 0, -6], elbowR: [-6, 0, 0], handR: [-60, 0, 0], thighL: [-30, 0, 16], kneeL: [40, 0, 0], thighR: [20, 0, -16], kneeR: [30, 0, 0], hands: ['open', 'open'] };
  C.cj_dive = { root: { rx: 40, y: 0.1 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [-26, 0, 0], shoulderL: [-150, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -40], elbowR: [-30, 0, 0], thighL: [-40, 0, 10], kneeL: [80, 0, 0], thighR: [-20, 0, -10], kneeR: [60, 0, 0], hands: ['open', 'open'] };
  C.cj_scream = (t) => ({ root: { y: -0.04 + Math.sin(t * 30) * 0.01 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-26, 0, 0], shoulderL: [-30, 0, 70], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -70], elbowR: [-60, 0, 0], thighL: [-14, 0, 12], kneeL: [20, 0, 0], thighR: [6, 0, -12], kneeR: [16, 0, 0], hands: ['open', 'open'] });
  // Cell's own acting for the Games
  C.cl_lookUp = (t) => ({ root: { y: -0.02 }, spine: [-6, 0, 0], chest: [-10, 0, 0], neck: [-14, 0, 0], head: [-30, 0, 0], shoulderL: [-20, 0, 40 + Math.sin(t * 2) * 4], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -40 - Math.sin(t * 2) * 4], elbowR: [-30, 0, 0], thighL: [-14, 0, 16], kneeL: [16, 0, 0], thighR: [6, 0, -16], kneeR: [12, 0, 0], hands: ['open', 'open'] });
  C.cl_flick = { root: { y: 0 }, chest: [-4, 10, 0], head: [-6, -8, 0], shoulderR: [-86, 0, -6], elbowR: [-14, 0, 0], handR: [-20, 0, 0], shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0], hands: ['fist', 'point'] };
  C.cl_punchW = { root: { y: -0.08 }, hips: [0, 24, 0], spine: [4, 22, 0], chest: [2, 28, 0], head: [-6, -20, 0], shoulderR: [-40, 0, -40], elbowR: [-120, 0, 0], shoulderL: [-70, 0, 20], elbowL: [-60, 0, 0], thighL: [-30, 10, 12], kneeL: [36, 0, 0], thighR: [16, -10, -12], kneeR: [26, 0, 0], hands: ['fist', 'fist'] };
  C.cl_punch = { root: { y: -0.1, rx: 12 }, hips: [0, -14, 0], spine: [8, -20, 0], chest: [6, -28, 0], head: [-10, 20, 0], shoulderR: [-94, 0, -2], elbowR: [-4, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-100, 0, 0], thighL: [-40, 10, 12], kneeL: [44, 0, 0], thighR: [24, -10, -12], kneeR: [18, 0, 0], hands: ['fist', 'fist'] };
  C.cl_gutted = (t) => ({ root: { y: -0.2 + Math.sin(t * 22) * 0.01, rx: 40 }, spine: [30, 0, 0], chest: [24, 0, 0], neck: [-10, 0, 0], head: [-26, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-50, 0, -30], elbowR: [-90, 0, 0], thighL: [-40, 0, 12], kneeL: [60, 0, 0], thighR: [-30, 0, -12], kneeR: [60, 0, 0], hands: ['open', 'open'] });
  C.cl_kneelRetch = (t) => ({ root: { y: -0.5, rx: 30 + Math.sin(t * 9) * 6 }, spine: [24, 0, 0], chest: [16, 0, 0], neck: [-14, 0, 0], head: [-30, 0, 0], shoulderL: [-60, 0, 16], elbowL: [-20, 0, 0], shoulderR: [-60, 0, -16], elbowR: [-20, 0, 0], thighL: [-94, 0, 12], kneeL: [100, 0, 0], thighR: [-94, 0, -12], kneeR: [100, 0, 0], hands: ['open', 'open'] });
  C.cl_stompUp = { root: { y: 0.02, rx: -6 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [16, 0, 0], shoulderL: [-14, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-14, 0, -30], elbowR: [-30, 0, 0], thighR: [-96, 0, -4], kneeR: [100, 0, 0], footR: [20, 0, 0], thighL: [6, 0, 6], kneeL: [10, 0, 0], hands: ['fist', 'fist'] };
  C.cl_stompDown = { root: { y: -0.06, rx: 4 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [22, 0, 0], shoulderL: [-10, 0, 26], elbowL: [-24, 0, 0], shoulderR: [-10, 0, -26], elbowR: [-24, 0, 0], thighR: [-30, 0, -4], kneeR: [24, 0, 0], footR: [10, 0, 0], thighL: [8, 0, 6], kneeL: [16, 0, 0], hands: ['fist', 'fist'] };
  C.cl_snipe = { root: { y: 0 }, chest: [-2, 16, 0], head: [-4, -14, 0], shoulderR: [-92, 0, -4], elbowR: [-2, 0, 0], handR: [0, 0, 0], shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0], hands: ['fist', 'point'] };
  C.cl_swat = { root: { y: -0.04 }, chest: [0, -40, 0], head: [-4, 30, 0], shoulderR: [-60, 0, 60], elbowR: [-20, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], thighL: [-14, 0, 12], kneeL: [16, 0, 0], thighR: [6, 0, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'] };
  C.cl_bloat = (t) => {
    const s = Math.sin(t * 6);
    return { root: { y: 0.02 + s * 0.01 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-16, 0, 0], shoulderL: [-20, 0, 70 + s * 4], elbowL: [-20, 0, 0], shoulderR: [-20, 0, -70 - s * 4], elbowR: [-20, 0, 0], thighL: [-6, 0, 22], kneeL: [10, 0, 0], thighR: [-6, 0, -22], kneeR: [10, 0, 0], hands: ['open', 'open'] };
  };
  // the solar-system Kamehameha: deep crouch, hips turned, head thrown back with a grin, hands at the right hip
  C.cl_superKameCharge = (t) => {
    const s = Math.sin(t * 34) * 1.4;
    return { root: { y: -0.26 }, hips: [0, -40, 0], spine: [-6, -10, 0], chest: [-10 + s * 0.3, -30, 0], neck: [-10, 0, 0], head: [-26, 34, 0], shoulderR: [24, 0, -10], elbowR: [-96, 0, 0], handR: [0, 0, 20], shoulderL: [-20, 0, -54], elbowL: [-104, 0, 0], handL: [0, 0, -20], thighL: [-46, 24, 26], kneeL: [64, 0, 0], footL: [-16, 0, 0], thighR: [16, 24, -26], kneeR: [52, 0, 0], footR: [-16, 0, 0], hands: ['open', 'open'] };
  };
  // Mr. Satan
  C.ms_dynamite = { root: { y: 0.3, rx: -20 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-6, 0, 0], shoulderL: [-30, 0, 70], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -70], elbowR: [-40, 0, 0], thighR: [-100, 0, -4], kneeR: [4, 0, 0], footR: [40, 0, 0], thighL: [-20, 0, 6], kneeL: [100, 0, 0], hands: ['fist', 'fist'] };
  C.ms_champ = (t) => ({ root: { y: 0 }, chest: [-10, 0, 0], head: [-14, 0, 0], shoulderL: [-160, 0, 30], elbowL: [-10, 0, 0], shoulderR: [-150, 0, -40], elbowR: [-20 + Math.sin(t * 8) * 6, 0, 0], thighL: [-4, 0, 14], kneeL: [4, 0, 0], thighR: [2, 0, -14], kneeR: [4, 0, 0], hands: ['point', 'fist'] });
  C.ms_carry = (t) => ({ root: { y: -0.08 + Math.sin(t * 30) * 0.006 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [10, Math.sin(t * 18) * 6, 0], shoulderL: [-56, 0, 20], elbowL: [-70, 0, 0], shoulderR: [-56, 0, -20], elbowR: [-70, 0, 0], thighL: [-20, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [22, 0, 0], hands: ['open', 'open'] });
  // the reporter, microphone up
  C.jf_report = (t) => ({ root: { y: 0 }, chest: [-4, 10, 0], head: [-4, -6, 0], shoulderR: [-70, 30, -30], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 30 + Math.sin(t * 5) * 14], elbowL: [-40, 0, 0], thighL: [-4, 0, 10], kneeL: [4, 0, 0], thighR: [2, 0, -10], kneeR: [4, 0, 0], hands: ['open', 'fist'] });
  // looking up into the sky with a hand shading the eyes
  C.shadeEyes = { root: { y: 0 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-26, 0, 0], shoulderR: [-150, 0, -10], elbowR: [-110, 0, 0], shoulderL: [-6, 0, 12], elbowL: [-18, 0, 0], thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0], hands: ['fist', 'open'] };
  // the swaying, the knees going, the fall forward (Gohan at the very end)
  C.sway = (t) => ({ root: { y: -0.04, rz: Math.sin(t * 2.4) * 6, rx: 6 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [10, 0, Math.sin(t * 2.4) * 8], shoulderL: [-2, 0, 8], elbowL: [-10, 0, 0], shoulderR: [-2, 0, -8], elbowR: [-10, 0, 0], thighL: [-8, 0, 8], kneeL: [16, 0, 0], thighR: [-4, 0, -8], kneeR: [14, 0, 0], hands: ['open', 'open'] });

  /* ================================================================ the arena */
  const RIDGE = { x: -10, z: 44, r: 15, top: 7.5 };
  const SPOTS = {
    goku: new V3(-1.5, 0, 33.5),
    gohan: new V3(-3.8, 0, 33.2),
    piccolo: new V3(-6.6, 0, 33.8),
    krillin: new V3(-9, 0, 33.1),
    yamcha: new V3(-11.3, 0, 33.4),
    tien: new V3(-13.6, 0, 33.6),
    trunks: new V3(-16.3, 0, 33.4),
    vegeta: new V3(-19.6, 0, 35.2),
    a16: new V3(-22, 0, 37),
  };
  const LIE_AT = new V3(0.6, 0, 37.4); // where Goku sits back against a rock after the forfeit
  const CREW = { satan: new V3(23, 0, 8.4), jimmy: new V3(25.3, 0, 10.2), cam: new V3(24.6, 0, 12.6) };

  const scripted = () => ({ update: () => SL.emptyIntent() });

  const CK = (SL.data.cellKit = {
    RIDGE,
    SPOTS,
    SPOTS_RIDGE: SPOTS,
    LIE_AT,
    CREW,
    GOHAN_SPOT: SPOTS.gohan,
    scripted,

    ground(b, v, lift = 0) {
      const p = v.clone();
      p.y = b.stage.heightAt(p.x, p.z) + lift;
      return p;
    },
    /** A point on the paving (the ring top is lifted analytically by the stage). */
    onRing(b, x, z) {
      return new V3(x, b.stage.heightAt(x, z), z);
    },
    place(f, pos, yaw) {
      if (!f) return;
      SL.Staging.place(f, pos, yaw); // on the terrain (or the ring) when the point is on it, in the air above it
    },
    placeAir(f, pos, yaw) {
      if (!f) return;
      CK.place(f, pos, yaw);
      f.grounded = false;
    },
    faceTo(f, pos) {
      f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
    },
    /** A bystander: placed, posed, out of the fight. */
    watch(f, pos, pose, face, lookAt) {
      if (!f) return;
      f.setHidden(false);
      CK.place(f, pos);
      CK.faceTo(f, lookAt || new V3(0, pos.y, 0));
      // the player keeps the player's controller (a hold or a cue later in the scene needs it)
      if (!(f.battle && f.battle.player === f)) f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      const down = /knockdown/.test(pose || '');
      f.setState('scripted', { pose: pose || 'idle', expression: face || 'calm', aura: down ? 0 : undefined });
    },
    /** The Z Fighters on the ridge; names in `except` are left alone. */
    spectate(b, S, except = [], faces = {}) {
      const poses = { piccolo: 'armsCrossed', vegeta: 'armsCrossed', trunks: 'idle', krillin: 'idle', tien: 'armsCrossed', yamcha: 'idle', goku: 'idle', gohan: 'idle', a16: 'armsCrossed' };
      for (const name of Object.keys(poses)) {
        if (except.includes(name)) continue;
        const f = S[name];
        if (!f || !f.alive || f._gone) continue;
        CK.watch(f, CK.ground(b, SPOTS[name]), poses[name], faces[name] || 'calm');
      }
    },
    clearCombat(b) {
      if (b.clash.active) b.clash._abort();
      for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
      for (const bm of b.projectiles.beams) bm.dispose();
    },
    removeHook(m, hook) {
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
    },
    formIndex(f, id) {
      return f.def.forms.findIndex((x) => x.id === id);
    },
    toForm(f, id) {
      const i = CK.formIndex(f, id);
      if (i >= 0 && f.formIndex !== i) f.applyForm(i);
    },
    /** Hand the player a hero (always re-attach: scene phases give everybody a scripted brain). */
    takeControl(b, f) {
      const from = b.player;
      const watching = from && from !== f && from.untargetable;
      f.setHidden(false);
      f.untargetable = false;
      f.intangible = false;
      b.switchPlayer(f, { force: true });
      if (watching) from.controller = scripted();
      f.setState('free');
    },
    goFight(m, music) {
      const b = m.battle;
      m.lock(false);
      b.aiLocked = false;
      if (music) m.music(music[0], music[1]);
    },
    /** Every playable stretch starts clean: no leftover multipliers, armour, gaps or brains. */
    prep(m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      m.limits(null);
      CK.clearCombat(b);
      b.clash.maxSeconds = 7;
      for (const f of b.fighters) {
        f.damageDealtMul = 1;
        f.damageTakenMul = 1;
        f.specOverrides = null;
        f.storyArmor = 0;
        f.storyEvade = null;
        f.storyNoSell = null;
      }
      // the Father-Son Kamehameha does not exist until his father is a voice: before the last stand
      // the boy's ultimate slot is an ordinary full-power Kamehameha (cell_fatherson sets its own)
      const gh = b.story && b.story.gohan;
      if (gh && m.def.id !== 'cell_fatherson') gh.specOverrides = { ultimate: CK.FULL_KAME };
    },
    /** Teen Gohan's ultimate before the Father-Son Kamehameha is earned. */
    FULL_KAME: { id: 'tgFullKame', name: 'Full-Power Kamehameha', cinematic: false, chargeMin: 50, chargeMax: 50, damage: [6200, 6200], radius: [1.7, 1.7], sustain: 44, callout: ['KA', 'ME', 'HA', 'ME', 'HA!'] },
    cellBrain(b, c, profile, difficulty = 'hard') {
      c.controller = new SL.AIController(b, { difficulty, profile });
      return c.controller;
    },

    /* ------------------------------------------------------------ the cast */
    /**
     * Everybody the Games need, spawned once (hidden ones wait for their beat). opts.player names the
     * hero the mission starts with. Returns battle.story.
     */
    cast(b, opts = {}) {
      for (const o of b.stage.obstacles) {
        if (!o.alive || o.fixture) continue;
        if (Math.hypot(o.x, o.z) < 44 + o.r) {
          o.alive = false;
          if (o.group) o.group.visible = false;
          if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
        }
      }
      const S = (b.story = {});
      const player = opts.player || 'goku';
      const sp = (name, charId, pos, extra) => {
        const f = b.spawn(Object.assign({ charId, team: 0, pos: CK.ground(b, pos), startKi: 80, player: name === player }, extra || {}));
        S[name] = f;
        f.cannotDie = true;
        return f;
      };
      sp('goku', 'goku', SPOTS.goku, { startKi: 100 });
      sp('gohan', 'teen_gohan', SPOTS.gohan, { startKi: 90 });
      sp('piccolo', 'piccolo', SPOTS.piccolo);
      sp('vegeta', 'vegeta', SPOTS.vegeta);
      sp('trunks', 'future_trunks', SPOTS.trunks);
      sp('krillin', 'krillin', SPOTS.krillin);
      sp('tien', 'tien', SPOTS.tien);
      sp('yamcha', 'yamcha', SPOTS.yamcha);
      sp('a16', 'android_16', SPOTS.a16, { startKi: 60 });
      sp('a18', 'android_18', new V3(-14, 0, 6), { startKi: 60 });
      sp('satan', 'mr_satan', CREW.satan, { startKi: 10 });
      sp('jimmy', 'jimmy', CREW.jimmy, { startKi: 10 });
      sp('cam', 'tv_cameraman', CREW.cam, { startKi: 10 });
      S.cell = b.spawn({ charId: 'cell', team: 1, pos: CK.onRing(b, 0, -6), startKi: 150, tags: { boss: true, priority: true }, player: player === 'cell' });
      S.cell.cannotDie = true;
      CK.toForm(S.goku, 'ssj');
      CK.toForm(S.vegeta, 'ssj');
      CK.toForm(S.trunks, 'ssj');
      CK.toForm(S.cell, 'perfect');
      S.gohan.lockedForms = { ssj2: true };
      S.a18.setHidden(true);
      S.juniors = [];
      for (const f of b.fighters) {
        // the player keeps the player's controller (b.player is not assigned yet while a mission sets up)
        if (f === b.player || f === S[player] || f.isPlayer) continue;
        f.controller = scripted();
        if (f !== S.cell) f.untargetable = true;
      }
      // the crew are scenery with faces: never in a fight
      for (const k of ['satan', 'jimmy', 'cam']) S[k].intangible = true;
      CK.crew(b);
      return S;
    },
    /** Mr. Satan, the reporter and the cameraman at their van, all facing the ring. */
    crew(b) {
      const S = b.story;
      CK.watch(S.satan, CK.ground(b, CREW.satan), 'ms_champ', 'grin');
      CK.watch(S.jimmy, CK.ground(b, CREW.jimmy), 'jf_report', 'calm');
      CK.watch(S.cam, CK.ground(b, CREW.cam), 'idle', 'calm');
      for (const k of ['satan', 'jimmy', 'cam']) S[k].intangible = true;
    },
    /** Takes a fighter out of the story for good (dead, wished away, blown up). */
    gone(f) {
      if (!f) return;
      f.setHidden(true);
      f.untargetable = true;
      f.intangible = true;
      f._gone = true;
      f.controller = scripted();
    },

    /* ------------------------------------------------------------ visible deaths */
    /**
     * SPLIT: a body cut into two pieces that move on their own — a head off at the neck, a body in
     * half at the waist. Each piece is a clone of the model clipped by the cut plane; its clip plane
     * travels with it (so a piece can tumble). The fighter is hidden. opts: at (point on the cut),
     * normal (pointing into piece A), centerA / centerB (each piece's pivot). Returns
     * { a, b, pieces, update(), dispose() } — a piece is { pivot, vel, spin }; move pieces by their
     * pivot and call update() (CK.animatePieces does the physics).
     */
    split(b, f, opts) {
      if (SL.Render && SL.Render.renderer) SL.Render.renderer.localClippingEnabled = true;
      const src = f.model.root;
      src.updateMatrixWorld(true);
      const n = opts.normal.clone().normalize();
      const at = opts.at.clone();
      const pieces = [];
      for (const s of [1, -1]) {
        const clone = src.clone(true);
        const normal = n.clone().multiplyScalar(s);
        const center = ((s > 0 ? opts.centerA : opts.centerB) || at.clone().addScaledVector(normal, 0.3)).clone();
        const plane = new THREE.Plane(normal.clone(), -normal.dot(at));
        const local = new THREE.Plane(normal.clone(), -normal.dot(at.clone().sub(center)));
        const mats = [];
        // opts.joint: a clean separation by the skeleton instead of a plane (a head off at the neck):
        // piece A is everything under that joint, piece B everything else — no clipping at all
        const branch = opts.joint ? clone.getObjectByName(opts.joint) : null;
        const under = (o) => {
          for (let p = o; p; p = p.parent) if (p === branch) return true;
          return false;
        };
        clone.traverse((o) => {
          if (!o.isMesh) return;
          if (branch && (s > 0) !== under(o)) {
            o.visible = false;
            return;
          }
          if (o.userData.isOutline && !branch) {
            o.visible = false;
            return;
          }
          if (branch) return;
          const mat = o.material.clone();
          mat.side = THREE.DoubleSide;
          mat.clippingPlanes = [plane];
          o.material = mat;
          o.castShadow = false;
          mats.push(mat);
        });
        const pivot = new THREE.Group();
        pivot.position.copy(center);
        const holder = new THREE.Group();
        src.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
        holder.position.sub(center);
        clone.position.set(0, 0, 0);
        clone.quaternion.identity();
        clone.scale.set(1, 1, 1);
        holder.add(clone);
        pivot.add(holder);
        b.scene.add(pivot);
        pieces.push({ pivot, holder, plane, local, mats, vel: new V3(), spin: new V3(), alive: true });
      }
      f.setHidden(true);
      const cut = {
        a: pieces[0],
        b: pieces[1],
        pieces,
        update() {
          for (const p of pieces) {
            if (!p.alive) continue;
            p.pivot.updateMatrixWorld(true);
            p.plane.copy(p.local).applyMatrix4(p.pivot.matrixWorld);
          }
        },
        hide(p) {
          p.alive = false;
          p.pivot.visible = false;
        },
        dispose() {
          for (const p of pieces) {
            b.scene.remove(p.pivot);
            for (const mt of p.mats) mt.dispose();
          }
          pieces.length = 0;
        },
      };
      if (b.mission) b.mission.onDispose(() => cut.dispose());
      return cut;
    },
    /**
     * SEVER: pieces cut away at named joints (['elbowL', 'elbowR']) plus the rest of the body, each a clone
     * showing only its own part. Returns { pieces: [one per joint], base, all, update(), hide(p), dispose() }.
     * The fighter is hidden.
     */
    sever(b, f, joints, opts = {}) {
      const src = f.model.root;
      src.updateMatrixWorld(true);
      const make = (keep) => {
        const clone = src.clone(true);
        clone.visible = true;
        const branches = joints.map((n) => clone.getObjectByName(n)).filter(Boolean);
        const inBranch = (o) => {
          for (let p = o; p; p = p.parent) if (branches.includes(p)) return p.name;
          return null;
        };
        clone.traverse((o) => {
          if (!o.isMesh) return;
          const br = inBranch(o);
          o.visible = keep === null ? !br : br === keep;
        });
        let center;
        if (keep === null) center = f.chest();
        else {
          const j = f.model.joints[keep];
          center = j.getWorldPosition(new V3()).add(new V3(0, -0.1, 0));
        }
        const pivot = new THREE.Group();
        pivot.position.copy(center);
        const holder = new THREE.Group();
        src.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
        holder.position.sub(center);
        clone.position.set(0, 0, 0);
        clone.quaternion.identity();
        clone.scale.set(1, 1, 1);
        holder.add(clone);
        pivot.add(holder);
        b.scene.add(pivot);
        return { pivot, holder, vel: new V3(), spin: new V3(), alive: true, joint: keep, mats: [] };
      };
      const pieces = joints.map((j) => make(j));
      const base = make(null);
      f.setHidden(true);
      const all = pieces.concat([base]);
      const cut = {
        pieces: all,
        limbs: pieces,
        base,
        update() {},
        hide(p) {
          p.alive = false;
          p.pivot.visible = false;
        },
        dispose() {
          for (const p of all) b.scene.remove(p.pivot);
        },
      };
      if (b.mission) b.mission.onDispose(() => cut.dispose());
      return cut;
    },

    /** Simple physics for split pieces: velocity, gravity, spin, a bounce on the ground. Call every tick. */
    animatePieces(b, cut, opts = {}) {
      const g = opts.gravity === undefined ? 18 : opts.gravity;
      for (const p of cut.pieces) {
        if (!p.alive || p.frozen) continue;
        p.vel.y -= g / 60;
        p.pivot.position.addScaledVector(p.vel, 1 / 60);
        p.pivot.rotation.x += p.spin.x / 60;
        p.pivot.rotation.y += p.spin.y / 60;
        p.pivot.rotation.z += p.spin.z / 60;
        const gy = b.stage.hasGround ? b.stage.heightAt(p.pivot.position.x, p.pivot.position.z) + (p.rest || 0.15) : -1e9;
        if (p.pivot.position.y < gy) {
          p.pivot.position.y = gy;
          p.vel.multiplyScalar(0.35);
          p.vel.y = Math.abs(p.vel.y) * 0.2;
          p.spin.multiplyScalar(0.5);
          if (!p.landed) {
            p.landed = true;
            b.vfx.dust(p.pivot.position, 0.8, 5, opts.dust);
          }
        }
      }
      cut.update();
    },
    /**
     * What is left: 'junior' (blue liquid and smoke), 'android' (sparks, oil, gears), 'cell' (green
     * vapour), 'dust' (pulverised). Seeded pieces only (no Math.random in presentation).
     */
    burst(b, pos, kind, size = 1) {
      const n = b.frame;
      if (kind === 'junior') {
        b.vfx.explosion(pos, 0.8 * size, 0x2a4ad8, { smoke: true });
        b.vfx.sparks(pos, 0x6a9aff, 24, 10 * size, 0.12);
        b.vfx.dust(pos, 1.2 * size, 10, 0x4a6ad8);
        b.vfx.debrisBurst(pos, 10, 0x2a4ac8, 7 * size, 0.12);
        b.sfx('explosionSmall', null, { at: pos, pitch: 1.3, vol: 0.9 });
      } else if (kind === 'android') {
        b.vfx.explosion(pos, 2.2 * size, 0xffb070, { smoke: true });
        b.vfx.sparks(pos, 0xffe0a0, 40, 14 * size, 0.1);
        b.vfx.debrisBurst(pos, 16, 0x3a3a40, 9 * size, 0.16);
        b.vfx.debrisBurst(pos, 8, 0x1a1a1a, 5 * size, 0.1);
        b.sfx('explosionBig', null, { at: pos, pitch: 1.1 });
      } else if (kind === 'cell') {
        b.vfx.explosion(pos, 2.4 * size, 0x7ad86a, { smoke: true });
        b.vfx.dust(pos, 2 * size, 16, 0x5ab84a);
        b.vfx.sparks(pos, 0xbaff9a, 20, 9 * size, 0.12);
      } else if (kind === 'dust') {
        b.vfx.dust(pos, 1.6 * size, 22, 0x6a7ab8);
        b.vfx.debrisBurst(pos, 22, 0x3a5ad0, 6 * size, 0.06);
        b.vfx.sparks(pos, 0x9ab4ff, 16, 6, 0.06);
      }
      b.cameraTraumaAt(pos, 0.3 * size + (n % 2) * 0.01);
    },

    /* ------------------------------------------------------------ props */
    /** A small prop group at a point; returns { group, dispose }. kind: 'senzu' | 'rock' | 'egg' | 'head' */
    prop(b, kind, pos, opts = {}) {
      const T = SL.Toon, g = new THREE.Group(), geos = [];
      const add = (geo, color, p, s) => {
        geos.push(geo);
        const mesh = new THREE.Mesh(geo, T.mat(color));
        if (p) mesh.position.set(p[0], p[1], p[2]);
        if (s) mesh.scale.set(s[0], s[1], s[2]);
        T.addOutline(mesh, opts.outline || 1.2);
        g.add(mesh);
        return mesh;
      };
      if (kind === 'senzu') add(new THREE.SphereGeometry(0.07, 10, 8), 0x6ac83a, null, [1, 0.8, 1.3]);
      else if (kind === 'rock') {
        add(new THREE.DodecahedronGeometry(1, 0), opts.color || 0x9a7a52, [0, 0.5, 0], [1.4, 0.9, 1]);
      } else if (kind === 'egg') {
        add(new THREE.SphereGeometry(0.32, 14, 10), 0x6a9ad8, [0, 0.36, 0], [1, 1.3, 1]);
        add(new THREE.SphereGeometry(0.1, 8, 6), 0x2a3a8a, [0.12, 0.5, 0.22]);
        add(new THREE.SphereGeometry(0.08, 8, 6), 0x2a3a8a, [-0.16, 0.3, 0.2]);
      } else if (kind === 'clothes') {
        // what is left of somebody Cell drank: a shirt, trousers and shoes lying where he stood
        const shirt = opts.shirt || 0xc4d2dc, pants = opts.pants || 0x5a5a6a, shoes = opts.shoes || 0x3a2a22;
        add(new THREE.BoxGeometry(0.46, 0.05, 0.4), shirt, [0, 0.03, 0.12]).rotation.y = 0.15;
        add(new THREE.BoxGeometry(0.4, 0.04, 0.12), shirt, [0.02, 0.025, 0.3]).rotation.y = -0.3;
        add(new THREE.BoxGeometry(0.17, 0.045, 0.55), pants, [-0.1, 0.025, -0.3]).rotation.y = 0.12;
        add(new THREE.BoxGeometry(0.17, 0.045, 0.55), pants, [0.12, 0.025, -0.3]).rotation.y = -0.18;
        add(new THREE.BoxGeometry(0.1, 0.08, 0.2), shoes, [-0.2, 0.04, -0.62]).rotation.y = 0.5;
        add(new THREE.BoxGeometry(0.1, 0.08, 0.2), shoes, [0.24, 0.04, -0.6]).rotation.y = -0.3;
        if (opts.hat) add(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 10), opts.hat, [0.3, 0.04, 0.42]);
      } else if (kind === 'car') {
        // an empty car, its driver's door open
        const body = opts.color || 0x8a2a2a;
        add(new THREE.BoxGeometry(1.7, 0.6, 3.8), body, [0, 0.62, 0]);
        add(new THREE.BoxGeometry(1.5, 0.55, 1.9), body, [0, 1.18, -0.2]);
        add(new THREE.BoxGeometry(1.52, 0.4, 1.7), 0x2e3a46, [0, 1.2, -0.2]);
        for (const w of [[-0.82, 1.25], [0.82, 1.25], [-0.82, -1.25], [0.82, -1.25]]) add(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12), 0x1e1e22, [w[0], 0.34, w[1]]).rotation.z = Math.PI / 2;
        const door = add(new THREE.BoxGeometry(0.06, 0.62, 1.0), body, [-0.86, 0.85, 0.15]);
        door.geometry.translate(0, 0, 0.5);
        door.position.z = -0.35;
        door.rotation.y = -1.0;
      } else if (kind === 'gregory') {
        // King Kai's cricket: a small green body, a round head, two feelers and folded wings
        add(new THREE.SphereGeometry(0.14, 12, 10), 0x5aa83a, [0, 0.2, 0], [1, 0.85, 1.3]);
        add(new THREE.SphereGeometry(0.1, 12, 10), 0x6ac04a, [0, 0.3, 0.18]);
        add(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 4), 0x2a2a2a, [0.05, 0.44, 0.22]).rotation.z = -0.4;
        add(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 4), 0x2a2a2a, [-0.05, 0.44, 0.22]).rotation.z = 0.4;
        add(new THREE.SphereGeometry(0.1, 8, 6), 0xe8f0ff, [0.08, 0.27, -0.06], [0.4, 0.3, 1.2]);
        add(new THREE.SphereGeometry(0.1, 8, 6), 0xe8f0ff, [-0.08, 0.27, -0.06], [0.4, 0.3, 1.2]);
        add(new THREE.SphereGeometry(0.02, 6, 4), 0x101010, [0.04, 0.34, 0.27]);
        add(new THREE.SphereGeometry(0.02, 6, 4), 0x101010, [-0.04, 0.34, 0.27]);
      }
      g.position.copy(pos);
      if (opts.scale) g.scale.setScalar(opts.scale);
      b.scene.add(g);
      const pr = {
        group: g,
        pos: g.position,
        dispose() {
          b.scene.remove(g);
          for (const x of geos) x.dispose();
        },
      };
      if (b.mission) b.mission.onDispose(pr.dispose);
      return pr;
    },
    /** The rock on the ridge Goku leans back against (made once). */
    lieRock(b) {
      const S = b.story;
      if (!S.lieRock) S.lieRock = CK.prop(b, 'rock', CK.ground(b, LIE_AT.clone().add(new V3(0, -0.2, 1.3))), { color: 0x8a6a46 });
      return S.lieRock;
    },
    /** Cell inflating before the self-destruct (and back to normal when `to` is 1). */
    swell(m, f, to, seconds) {
      if (!f || !f.model) return;
      const base = f.model.baseScale * (f.form && f.form.look && f.form.look.scale ? f.form.look.scale : 1);
      if (!seconds) {
        f.model.root.scale.setScalar(base * to);
        return;
      }
      const from = f.model.root.scale.x;
      let t = 0;
      const hook = () => {
        t = Math.min(1, t + 1 / 60 / seconds);
        f.model.root.scale.setScalar(U.lerp(from, base * to, t));
        if (t >= 1) CK.removeHook(m, hook);
      };
      m.tickHooks.push(hook);
    },
    /** The returned Cell: the perfect form with golden lightning running over it. */
    superAura(f) {
      const a = f.form.aura || {};
      f.aura.setStyle(Object.assign({}, a, { color: 0xffe25a, sparks: 0xdff6ff, lightning: true, sharp: 0.55 }));
      f.aura.target = 0.55;
      f.superPerfect = true;
    },
    /** Seven Cell Juniors, created once and reused by every phase that needs them. */
    ensureJuniors(m) {
      const b = m.battle, S = b.story;
      if (S.juniors && S.juniors.length) return S.juniors;
      S.juniors = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const j = m.spawn({ charId: 'cell_junior', team: 1, pos: CK.onRing(b, Math.cos(a) * 4, -4 + Math.sin(a) * 4), warp: false, tag: 'junior', startKi: 70 });
        j.controller = scripted();
        j.setHidden(true);
        j.untargetable = true;
        S.juniors.push(j);
      }
      return S.juniors;
    },

    /**
     * Goku from beyond, at his son's back in the last stand: the Goku fighter shown as a spirit —
     * translucent, a halo, a soft aura — intangible, untargetable, no brain. level 0..1.
     */
    spirit(b, on, level = 0.5) {
      const S = b.story, g = S.goku;
      if (!g || !S.gohan) return null;
      if (on) {
        g.alive = true;
        g._gone = false;
        g.intangible = true;
        g.untargetable = true;
        g.cannotDie = true;
        g.benched = true;
        g.controller = scripted();
        g.setHidden(false);
        CK.toForm(g, 'base');
        g.model.setSpirit(true);
        g.model.setSpiritLevel(level);
        if (!S.halo) S.halo = SL.Cinema.halo(b, g);
        CK.spiritFollow(b);
        g.setState('scripted', { pose: 'g_kameFire', expression: 'calm', aura: 0.3 });
        S.spiritLevel = level;
        S.spiritOn = true;
      } else if (S.spiritOn) {
        g.model.setSpirit(false);
        g.setHidden(true);
        g.alive = false;
        S.spiritOn = false;
      }
      return g;
    },
    /** Keeps the spirit at his son's back: behind him, off his right shoulder, a hand on it. */
    spiritFollow(b) {
      const S = b.story, g = S.goku, gh = S.gohan;
      if (!S.spiritOn) return;
      const fwd = new V3(Math.sin(gh.yaw), 0, Math.cos(gh.yaw));
      const right = new V3(-fwd.z, 0, fwd.x);
      g.setPosition(gh.pos.clone().addScaledVector(fwd, -0.8).addScaledVector(right, 0.42).add(new V3(0, 0.12, 0)));
      g.grounded = false;
      g.vel.set(0, 0, 0);
      g.yaw = g.prevYaw = gh.yaw;
    },
  });
  // the old mission's name for the same kit
  SL.data.cellGames = CK;
})();
