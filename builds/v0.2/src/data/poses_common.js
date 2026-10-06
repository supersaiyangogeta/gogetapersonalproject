/*
 * Shared pose library (degrees). Characters override any of these with
 * their own identity poses; shared poses cover generic reactions.
 * Conventions: shoulder x -90 = arm forward; L arm z +90 = out to the left,
 * R arm z -90 = out to the right; elbow x < 0 bends; thigh x < 0 = leg
 * forward; knee x > 0 bends; chest x > 0 leans forward, y > 0 twists left.
 */
(function () {
  'use strict';
  const P = SL.data.poses;
  const M = (p) => SL.Anim.mirror(p);

  P.tpose = {};

  P.idle = {
    root: { y: -0.04 },
    hips: [0, -12, 0], spine: [4, 4, 0], chest: [6, 10, 0], head: [-4, 0, 0],
    shoulderL: [-42, 0, 14], elbowL: [-105, 0, 0], shoulderR: [-28, 0, -16], elbowR: [-112, 0, 0],
    thighL: [-22, 10, 9], kneeL: [30, 0, 0], footL: [-8, 0, 0],
    thighR: [14, -8, -9], kneeR: [22, 0, 0], footR: [-12, 0, 0],
  };

  P.flyIdle = (t) => {
    const s = Math.sin(t * 2.2);
    return {
      root: { y: 0.03 * s },
      spine: [4, 0, 0], chest: [2, 0, 0], head: [-2, 0, 0],
      shoulderL: [-18, 0, 18 + s * 2], elbowL: [-45, 0, 0], shoulderR: [-18, 0, -18 - s * 2], elbowR: [-45, 0, 0],
      thighL: [-38 + s * 3, 0, 5], kneeL: [72, 0, 0], footL: [35, 0, 0],
      thighR: [-10 - s * 3, 0, -5], kneeR: [38, 0, 0], footR: [45, 0, 0],
    };
  };

  P.flyForward = (t) => {
    const s = Math.sin(t * 9);
    return {
      root: { rx: 68 },
      spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-25, 0, 0], head: [-38, 0, 0],
      shoulderL: [22, 0, 12], elbowL: [-18, 0, 0], shoulderR: [22, 0, -12], elbowR: [-18, 0, 0],
      thighL: [6 + s * 3, 0, 4], kneeL: [18, 0, 0], footL: [55, 0, 0],
      thighR: [2 - s * 3, 0, -4], kneeR: [28, 0, 0], footR: [55, 0, 0],
    };
  };

  P.dash = {
    root: { rx: 78 },
    spine: [-6, 0, 0], chest: [-6, 0, 0], neck: [-30, 0, 0], head: [-40, 0, 0],
    shoulderL: [38, 0, 8], elbowL: [-8, 0, 0], shoulderR: [38, 0, -8], elbowR: [-8, 0, 0],
    thighL: [8, 0, 3], kneeL: [10, 0, 0], footL: [60, 0, 0], thighR: [4, 0, -3], kneeR: [16, 0, 0], footR: [60, 0, 0],
  };

  P.flyBack = {
    root: { rx: -18 },
    spine: [10, 0, 0], chest: [8, 0, 0], head: [12, 0, 0],
    shoulderL: [-30, 0, 35], elbowL: [-50, 0, 0], shoulderR: [-30, 0, -35], elbowR: [-50, 0, 0],
    thighL: [-55, 0, 6], kneeL: [80, 0, 0], footL: [30, 0, 0], thighR: [-35, 0, -6], kneeR: [60, 0, 0], footR: [30, 0, 0],
  };

  P.flyUp = {
    root: { rx: -4 },
    spine: [-4, 0, 0], head: [-18, 0, 0],
    shoulderL: [22, 0, 14], elbowL: [-12, 0, 0], shoulderR: [22, 0, -14], elbowR: [-12, 0, 0],
    thighL: [-4, 0, 3], kneeL: [8, 0, 0], footL: [60, 0, 0], thighR: [2, 0, -3], kneeR: [14, 0, 0], footR: [60, 0, 0],
  };

  P.flyDown = {
    root: { rx: 24 },
    spine: [8, 0, 0], head: [10, 0, 0],
    shoulderL: [-50, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-50, 0, -40], elbowR: [-40, 0, 0],
    thighL: [-40, 0, 8], kneeL: [70, 0, 0], footL: [20, 0, 0], thighR: [-20, 0, -8], kneeR: [50, 0, 0], footR: [20, 0, 0],
  };

  P.strafeL = {
    root: { rz: -24, rx: 10 },
    chest: [0, -8, 0], head: [0, 8, 0],
    shoulderL: [-10, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-70, 0, 0],
    thighL: [-20, 0, 18], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [-5, 0, 6], kneeR: [25, 0, 0], footR: [40, 0, 0],
  };
  P.strafeR = M(P.strafeL);

  P.run = (t, ctx) => {
    const sp = ctx && ctx.runRate ? ctx.runRate : 1;
    const ph = t * 11 * sp;
    const s = Math.sin(ph), c = Math.cos(ph);
    return {
      root: { y: -0.05 + Math.abs(c) * 0.05, rx: 14 },
      spine: [6, s * 8, 0], chest: [4, s * 10, 0], head: [-16, -s * 10, 0],
      shoulderL: [s * 45 - 10, 0, 12], elbowL: [-85, 0, 0], shoulderR: [-s * 45 - 10, 0, -12], elbowR: [-85, 0, 0],
      thighL: [-s * 48 - 10, 0, 3], kneeL: [35 + Math.max(0, s) * 60, 0, 0], footL: [10, 0, 0],
      thighR: [s * 48 - 10, 0, -3], kneeR: [35 + Math.max(0, -s) * 60, 0, 0], footR: [10, 0, 0],
    };
  };

  P.jump = {
    root: { y: 0.05 },
    spine: [8, 0, 0], head: [-10, 0, 0],
    shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-60, 0, 0],
    thighL: [-70, 0, 6], kneeL: [110, 0, 0], footL: [30, 0, 0], thighR: [-45, 0, -6], kneeR: [90, 0, 0], footR: [30, 0, 0],
  };

  P.land = {
    root: { y: -0.2, rx: 8 },
    spine: [14, 0, 0], chest: [8, 0, 0], head: [-14, 0, 0],
    shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-60, 0, 0],
    thighL: [-60, 0, 12], kneeL: [95, 0, 0], footL: [-30, 0, 0], thighR: [-45, 0, -12], kneeR: [85, 0, 0], footR: [-40, 0, 0],
  };

  P.guard = {
    root: { y: -0.05 },
    spine: [8, 0, 0], chest: [10, 0, 0], head: [12, 0, 0],
    shoulderL: [-78, 0, -34], elbowL: [-118, 0, 0], shoulderR: [-72, 0, 30], elbowR: [-122, 0, 0],
    thighL: [-25, 0, 10], kneeL: [38, 0, 0], footL: [-10, 0, 0], thighR: [8, 0, -10], kneeR: [30, 0, 0], footR: [-15, 0, 0],
  };
  P.guardHit = { ...P.guard, root: { y: -0.08, rx: -8 }, chest: [2, 0, 0], head: [4, 0, 0] };

  P.charge = (t) => {
    const s = Math.sin(t * 30) * 1.5;
    return {
      root: { y: -0.12 },
      spine: [-6, 0, 0], chest: [-10 + s, 0, 0], neck: [-8, 0, 0], head: [-18, 0, 0],
      shoulderL: [12, 0, 32 + s], elbowL: [-62, 0, 0], handL: [0, 0, 0],
      shoulderR: [12, 0, -32 - s], elbowR: [-62, 0, 0],
      thighL: [-12, 0, 22], kneeL: [32, 0, 0], footL: [-8, 0, -12], thighR: [-12, 0, -22], kneeR: [32, 0, 0], footR: [-8, 0, 12],
    };
  };

  P.blastR = {
    hands: ['fist', 'open'],
    root: { y: -0.03 },
    spine: [0, 14, 0], chest: [0, 26, 0], head: [0, -24, 0],
    shoulderR: [-88, 0, 6], elbowR: [-4, 0, 0], handR: [-40, 0, 0],
    shoulderL: [-40, 0, 20], elbowL: [-100, 0, 0],
    thighL: [-22, 0, 10], kneeL: [30, 0, 0], thighR: [14, 0, -10], kneeR: [22, 0, 0],
  };
  P.blastL = M(P.blastR);
  P.blastWind = {
    root: { y: -0.06 },
    spine: [0, -12, 0], chest: [4, -24, 0], head: [0, 22, 0],
    shoulderR: [-30, 0, -30], elbowR: [-110, 0, 0], handR: [-30, 0, 0],
    shoulderL: [-50, 0, 10], elbowL: [-95, 0, 0],
    thighL: [-22, 0, 10], kneeL: [34, 0, 0], thighR: [14, 0, -10], kneeR: [26, 0, 0],
  };
  P.blastCharged = {
    hands: ['open', 'open'],
    root: { y: -0.05 },
    spine: [0, 6, 0], chest: [2, 10, 0],
    shoulderR: [-90, 0, 12], elbowR: [-2, 0, 0], handR: [-50, 0, 0],
    shoulderL: [-86, 0, -12], elbowL: [-2, 0, 0], handL: [-50, 0, 0],
    thighL: [-25, 0, 12], kneeL: [34, 0, 0], thighR: [16, 0, -12], kneeR: [26, 0, 0],
  };

  P.hitLight = {
    root: { y: -0.03, rx: -6 },
    spine: [-10, 0, 0], chest: [-16, 0, 0], head: [-26, 0, 0],
    shoulderL: [-30, 0, 34], elbowL: [-55, 0, 0], shoulderR: [-26, 0, -38], elbowR: [-50, 0, 0],
    thighL: [-20, 0, 10], kneeL: [35, 0, 0], thighR: [10, 0, -10], kneeR: [25, 0, 0],
  };
  P.hitBody = {
    root: { y: -0.08, rx: 10 },
    spine: [22, 0, 0], chest: [20, 0, 0], head: [14, 0, 0],
    shoulderL: [-40, 0, -8], elbowL: [-100, 0, 0], shoulderR: [-40, 0, 8], elbowR: [-100, 0, 0],
    thighL: [-35, 0, 8], kneeL: [55, 0, 0], thighR: [-5, 0, -8], kneeR: [45, 0, 0],
  };
  // directional reactions: struck from the character's left / right side, or from behind
  P.hitSideL = {
    root: { y: -0.04, rz: -14 },
    spine: [0, -10, -10], chest: [-4, -18, -12], head: [-8, -30, -14],
    shoulderL: [-20, 0, 50], elbowL: [-50, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-80, 0, 0],
    thighL: [-10, 0, 16], kneeL: [30, 0, 0], thighR: [8, 0, -6], kneeR: [22, 0, 0],
  };
  P.hitSideR = SL.Anim.mirror(P.hitSideL);
  P.hitBack = {
    root: { y: -0.06, rx: 16 },
    spine: [18, 0, 0], chest: [16, 0, 0], neck: [-10, 0, 0], head: [-26, 0, 0],
    shoulderL: [30, 0, 30], elbowL: [-30, 0, 0], shoulderR: [30, 0, -30], elbowR: [-30, 0, 0],
    thighL: [-30, 0, 8], kneeL: [40, 0, 0], thighR: [14, 0, -8], kneeR: [30, 0, 0],
  };
  P.hitAirSpin = (t) => ({
    root: { rz: t * 900, rx: -20 },
    spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-24, 0, 0],
    shoulderL: [-120, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-120, 0, -60], elbowR: [-40, 0, 0],
    thighL: [-40, 0, 20], kneeL: [60, 0, 0], thighR: [-10, 0, -20], kneeR: [40, 0, 0],
  });

  P.hitHeavy = {
    root: { rx: -38 },
    spine: [-14, 0, 0], chest: [-18, 0, 0], head: [-30, 0, 0],
    shoulderL: [-140, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-135, 0, -45], elbowR: [-35, 0, 0],
    thighL: [-55, 0, 12], kneeL: [65, 0, 0], thighR: [-25, 0, -12], kneeR: [40, 0, 0],
  };
  P.tumble = (t) => ({
    root: { rx: -120 - t * 720 },
    spine: [20, 0, 0], chest: [20, 0, 0], head: [20, 0, 0],
    shoulderL: [-60, 0, 20], elbowL: [-90, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-90, 0, 0],
    thighL: [-80, 0, 8], kneeL: [110, 0, 0], thighR: [-70, 0, -8], kneeR: [100, 0, 0],
  });
  P.launched = {
    root: { rx: -55 },
    spine: [-16, 0, 0], chest: [-20, 0, 0], head: [-35, 0, 0],
    shoulderL: [-160, 0, 30], elbowL: [-20, 0, 0], shoulderR: [-155, 0, -32], elbowR: [-20, 0, 0],
    thighL: [10, 0, 8], kneeL: [40, 0, 0], thighR: [-10, 0, -8], kneeR: [30, 0, 0],
  };
  P.smashed = {
    root: { rx: 60 },
    spine: [20, 0, 0], chest: [10, 0, 0], head: [30, 0, 0],
    shoulderL: [-170, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-10, 0, 0],
    thighL: [20, 0, 10], kneeL: [20, 0, 0], thighR: [30, 0, -10], kneeR: [30, 0, 0],
  };
  P.recover = {
    root: { y: 0.02 },
    spine: [18, 0, 0], chest: [10, 0, 0], head: [-10, 0, 0],
    shoulderL: [-20, 0, 50], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-40, 0, 0],
    thighL: [-70, 0, 10], kneeL: [100, 0, 0], footL: [20, 0, 0], thighR: [-50, 0, -10], kneeR: [90, 0, 0], footR: [20, 0, 0],
  };
  P.knockdown = {
    root: { y: -0.84, rx: -90 },
    spine: [-4, 0, 0], head: [-10, 20, 0],
    shoulderL: [-20, 0, 60], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -70], elbowR: [-20, 0, 0],
    thighL: [-20, 0, 14], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [0, 0, -10], kneeR: [8, 0, 0], footR: [30, 0, 0],
  };
  P.knockdownFace = {
    root: { y: -0.84, rx: 90 },
    head: [-40, 30, 0],
    shoulderL: [-160, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-20, 0, 0],
    thighL: [10, 0, 10], kneeL: [10, 0, 0], thighR: [0, 0, -8], kneeR: [30, 0, 0],
  };
  P.getup = {
    root: { y: -0.42, rx: 12 },
    spine: [18, 0, 0], chest: [8, 0, 0], head: [-18, 0, 0],
    shoulderL: [-60, 0, 20], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -30], elbowR: [-40, 0, 0],
    thighL: [-95, 0, 6], kneeL: [95, 0, 0], footL: [0, 0, 0], thighR: [15, 0, -6], kneeR: [120, 0, 0], footR: [40, 0, 0],
  };
  P.stagger = (t) => ({
    root: { y: -0.08, rx: -10 + Math.sin(t * 12) * 3, rz: Math.sin(t * 6) * 6 },
    spine: [-10, 0, 0], chest: [-18, 0, 0], head: [-20, Math.sin(t * 5) * 15, 0],
    shoulderL: [-30, 0, 70], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -70], elbowR: [-40, 0, 0],
    thighL: [-25, 0, 14], kneeL: [40, 0, 0], thighR: [5, 0, -14], kneeR: [35, 0, 0],
  });
  P.exhausted = (t) => {
    const s = Math.sin(t * 5);
    return {
      root: { y: -0.1 + s * 0.012, rx: 12 },
      spine: [20 + s * 3, 0, 0], chest: [10, 0, 0], head: [-12, 0, 0],
      shoulderL: [-10, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -14], elbowR: [-30, 0, 0],
      thighL: [-40, 0, 10], kneeL: [60, 0, 0], thighR: [-10, 0, -10], kneeR: [50, 0, 0],
    };
  };

  P.powerUp = (t) => {
    const s = Math.sin(t * 40) * 2;
    return {
      root: { y: -0.1 },
      spine: [-6, 0, 0], chest: [-12 + s, 0, 0], neck: [-6, 0, 0], head: [-12, 0, 0],
      shoulderL: [16, 0, 26 + s], elbowL: [-48, 0, 0], shoulderR: [16, 0, -26 - s], elbowR: [-48, 0, 0],
      thighL: [-6, 0, 24], kneeL: [30, 0, 0], footL: [-10, 0, -14], thighR: [-6, 0, -24], kneeR: [30, 0, 0], footR: [-10, 0, 14],
    };
  };
  P.powerCrouch = (t) => {
    const s = Math.sin(t * 50) * 2.5;
    return {
      root: { y: -0.2, rx: 10 },
      spine: [22, 0, 0], chest: [20 + s, 0, 0], head: [8, 0, 0],
      shoulderL: [-25, 0, 28 + s], elbowL: [-135, 0, 0], shoulderR: [-25, 0, -28 - s], elbowR: [-135, 0, 0],
      thighL: [-40, 0, 20], kneeL: [70, 0, 0], footL: [-30, 0, 0], thighR: [-40, 0, -20], kneeR: [70, 0, 0], footR: [-30, 0, 0],
    };
  };

  P.beamChargeSide = (t) => {
    const s = Math.sin(t * 34) * 1.2;
    return {
      hands: ['open', 'open'],
      root: { y: -0.12 },
      hips: [0, -20, 0], spine: [4, -18, 0], chest: [6, -34 + s, 0], head: [0, 56, 0],
      shoulderR: [30, 0, -8], elbowR: [-95, 0, 0], handR: [0, 0, 20],
      shoulderL: [-18, 0, -58], elbowL: [-100, 0, 0], handL: [0, 0, -20],
      thighL: [-30, 20, 12], kneeL: [40, 0, 0], footL: [-10, 0, 0], thighR: [18, 20, -14], kneeR: [34, 0, 0], footR: [-14, 0, 0],
    };
  };
  P.beamFire = (t) => {
    const s = Math.sin(t * 45) * 1.5;
    return {
      hands: ['open', 'open'],
      root: { y: -0.1, rx: -4 },
      spine: [2, 0, 0], chest: [0, 0, 0], head: [2, 0, 0],
      shoulderL: [-86 + s, 0, -9], elbowL: [-4, 0, 0], handL: [-60, 0, -10],
      shoulderR: [-86 - s, 0, 9], elbowR: [-4, 0, 0], handR: [-60, 0, 10],
      thighL: [-32, 0, 12], kneeL: [42, 0, 0], footL: [-10, 0, 0], thighR: [20, 0, -12], kneeR: [30, 0, 0], footR: [-14, 0, 0],
    };
  };
  P.beamPush = (t) => {
    const s = Math.sin(t * 60) * 3;
    return {
      ...P.beamFire(t),
      root: { y: -0.16, rx: 12 },
      spine: [10 + s, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
      thighL: [-45, 0, 14], kneeL: [60, 0, 0], thighR: [30, 0, -14], kneeR: [30, 0, 0],
    };
  };

  P.throwWind = {
    root: { y: -0.06 },
    spine: [-6, -16, 0], chest: [-8, -30, 0], head: [0, 26, 0],
    shoulderR: [-165, 0, -28], elbowR: [-70, 0, 0],
    shoulderL: [-70, 0, -10], elbowL: [-40, 0, 0],
    thighL: [-28, 0, 10], kneeL: [30, 0, 0], thighR: [16, 0, -10], kneeR: [34, 0, 0],
  };
  P.throwRelease = {
    hands: ['fist', 'open'],
    root: { y: -0.1, rx: 10 },
    spine: [14, 16, 0], chest: [18, 32, 0], head: [-8, -28, 0],
    shoulderR: [-72, 0, 14], elbowR: [-10, 0, 0], handR: [-30, 0, 0],
    shoulderL: [10, 0, 30], elbowL: [-40, 0, 0],
    thighL: [-40, 0, 10], kneeL: [45, 0, 0], thighR: [25, 0, -10], kneeR: [30, 0, 0],
  };
  P.twoFingers = {
    hands: ['fist', 'point'],
    root: { y: 0 },
    chest: [0, 6, 0], head: [6, 0, 0],
    shoulderR: [-128, 0, 28], elbowR: [-148, 0, 0], handR: [0, 0, 0],
    shoulderL: [-10, 0, 12], elbowL: [-30, 0, 0],
    thighL: [-8, 0, 6], kneeL: [12, 0, 0], thighR: [4, 0, -6], kneeR: [10, 0, 0],
  };

  // generic melee for simple fighters (soldiers)
  P.punchWindR = { ...P.idle, chest: [4, -28, 0], shoulderR: [-10, 0, -30], elbowR: [-130, 0, 0], root: { y: -0.06 } };
  P.punchR = {
    root: { y: -0.05, rx: 6 },
    hips: [0, 10, 0], spine: [6, 12, 0], chest: [6, 26, 0], head: [-6, -18, 0],
    shoulderR: [-86, 0, 8], elbowR: [-6, 0, 0], shoulderL: [-35, 0, 20], elbowL: [-110, 0, 0],
    thighL: [-35, 0, 10], kneeL: [40, 0, 0], thighR: [20, 0, -10], kneeR: [20, 0, 0],
  };
  P.punchWindL = M(P.punchWindR);
  P.punchL = M(P.punchR);
  P.kickWindR = {
    root: { y: -0.02, rx: -6 },
    chest: [-4, -10, 0], shoulderL: [-40, 0, 30], elbowL: [-90, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-90, 0, 0],
    thighR: [-80, 0, -10], kneeR: [110, 0, 0], thighL: [-10, 0, 6], kneeL: [25, 0, 0],
  };
  P.kickR = {
    root: { y: 0, rx: -14 },
    chest: [-10, -10, 0], head: [10, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -50], elbowR: [-60, 0, 0],
    thighR: [-95, 0, -6], kneeR: [5, 0, 0], footR: [30, 0, 0], thighL: [8, 0, 6], kneeL: [15, 0, 0],
  };
  P.hammerWind = {
    root: { y: 0.05, rx: -12 },
    spine: [-10, 0, 0], chest: [-16, 0, 0], head: [10, 0, 0],
    shoulderL: [-175, 0, -10], elbowL: [-40, 0, 0], shoulderR: [-175, 0, 10], elbowR: [-40, 0, 0],
    thighL: [-30, 0, 8], kneeL: [60, 0, 0], thighR: [-10, 0, -8], kneeR: [50, 0, 0],
  };
  P.hammer = {
    root: { y: -0.08, rx: 26 },
    spine: [24, 0, 0], chest: [20, 0, 0], head: [10, 0, 0],
    shoulderL: [-60, 0, -14], elbowL: [-10, 0, 0], shoulderR: [-60, 0, 14], elbowR: [-10, 0, 0],
    thighL: [-50, 0, 8], kneeL: [70, 0, 0], thighR: [10, 0, -8], kneeR: [40, 0, 0],
  };
  P.uppercutWind = { ...P.idle, root: { y: -0.2 }, chest: [20, -20, 0], shoulderR: [10, 0, -20], elbowR: [-120, 0, 0], thighL: [-40, 0, 10], kneeL: [70, 0, 0], thighR: [10, 0, -10], kneeR: [60, 0, 0] };
  P.uppercut = {
    root: { y: 0.08, rx: -10 },
    spine: [-10, 16, 0], chest: [-14, 26, 0], head: [-20, -10, 0],
    shoulderR: [-170, 0, 6], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-100, 0, 0],
    thighL: [-10, 0, 8], kneeL: [15, 0, 0], thighR: [20, 0, -8], kneeR: [30, 0, 0], footR: [40, 0, 0],
  };
  P.grab = {
    hands: ['open', 'open'],
    root: { y: -0.05, rx: 8 },
    chest: [10, 0, 0],
    shoulderL: [-95, 0, -6], elbowL: [-30, 0, 0], shoulderR: [-95, 0, 6], elbowR: [-30, 0, 0],
    thighL: [-35, 0, 10], kneeL: [40, 0, 0], thighR: [15, 0, -10], kneeR: [25, 0, 0],
  };

  P.victory = {
    chest: [-4, 0, 0], head: [-8, 0, 0],
    shoulderR: [-168, 0, -8], elbowR: [-12, 0, 0], shoulderL: [-5, 0, 12], elbowL: [-20, 0, 0],
    thighL: [-6, 0, 6], kneeL: [8, 0, 0], thighR: [4, 0, -6], kneeR: [6, 0, 0],
  };
  P.defeatKneel = {
    root: { y: -0.46, rx: 14 },
    spine: [24, 0, 0], chest: [14, 0, 0], neck: [20, 0, 0], head: [22, 0, 0],
    shoulderL: [-38, 0, 8], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -10], elbowR: [-10, 0, 0],
    thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
  };
  P.armsCrossed = {
    chest: [-4, 0, 0], head: [-6, 0, 0],
    // V0.2: upper arms hang, twist inward, forearms fold across the chest
    shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0],
    thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0],
  };
  P.stand = {
    shoulderL: [-4, 0, 8], elbowL: [-12, 0, 0], shoulderR: [-4, 0, -8], elbowR: [-12, 0, 0],
    thighL: [-2, 0, 4], kneeL: [3, 0, 0], thighR: [0, 0, -4], kneeR: [3, 0, 0],
  };
})();
