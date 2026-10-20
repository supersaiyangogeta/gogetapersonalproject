/*
 * JIREN — the Pride Troopers' strongest, Universe 11. Free Battle character (not in the story:
 * his tournament is long after the Buu Saga). Level 1 functional prototype.
 *
 *   LOOK    grey skin, a big smooth cranium (a skin dome over the skull: headExtras), black eyes
 *           with no whites, no hair; the tallest, heaviest frame of the humanoid cast; the
 *           Pride Trooper suit — red torso, black sleeves and trousers, white gloves, red boots.
 *   ACTING  he barely moves. Arms folded, feet planted. The blows come out of the fold without a
 *           wind-up and the arms are folded again before you see them. He does not taunt; he
 *           looks at you. Few words.
 *
 * How he FIGHTS — pressure, counters, enormous power, controlled movement, escalating phases:
 *   mechanic   UNSHAKABLE (mechanics.js): while his FOCUS holds, light blows do not move him.
 *              Each one chips the focus; heavies knock chunks out of it. Empty, it BREAKS for four
 *              seconds and he can be combo'd like anyone. The answer is heavies, not mashing.
 *   lights     short, near-invisible jabs from the fold (startup 3), then the elbow and the
 *              hammer: few, heavy, impact-2 blows
 *   heavies    the POWER STRIKE (slow, guard-crushing, the biggest single blow in his kit), a
 *              knee that launches, a two-handed hammer down
 *   special 1  POWER IMPACT      a big, slow red sphere from one palm: easy to see, hard to stop
 *   special 2  GLARE             a kiai with the eyes: a wall of pressure that throws you off him
 *   ultimate   INFINITY RUSH     in, a storm of blows, the last one from the palm
 *   form       FULL POWER        the escalation: the arms come unfolded, the red aura, heavier,
 *                                faster, and the AI stops waiting
 * AI (controllers.js AIHooks.jiren): walks you down instead of circling, trades straight through
 * light pressure with a heavy, answers a charge or a beam wind-up with the Glare or a Power
 * Impact, backs off and guards when his focus is broken.
 *
 * Unlock: clear "The 28th World Tournament" (unlocks.js); Shenron's "warrior" wish can bring him early.
 */
(function () {
  'use strict';

  const SKIN = 0x9a9aac, RED = 0xc8322e, BLACK = 0x18181e, WHITE = 0xf2f0ea;

  // THE FOLD: his arms crossed high on the chest, forearms level — the pose he lives in
  const FOLD = { shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0] };
  // feet planted a little wider than the shoulders, knees soft
  const PLANT = { thighL: [-2, 0, 11], kneeL: [4, 0, 0], thighR: [-2, 0, -11], kneeR: [4, 0, 0] };

  const poses = {
    /* ---------------- presence ---------------- */
    // standing, arms folded, nothing moving but the breath
    jr_idle: (t) => {
      const b = Math.sin(t * 1.1);
      return Object.assign({ root: { y: -0.01 + b * 0.003 }, spine: [-2, 0, 0], chest: [-4 + b * 0.6, 0, 0], neck: [0, 0, 0], head: [2, 0, 0], hands: ['fist', 'fist'] }, FOLD, PLANT);
    },
    // Full Power: the fold is gone; fists low at his sides, a little forward, ready
    jr_stance: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.06 + b * 0.006, rx: 4 }, hips: [0, -14, 0], spine: [4, 8, 0], chest: [2, 8, 0], head: [-4, -8, 0],
        shoulderL: [-34, 0, 18], elbowL: [-70, 0, 0], shoulderR: [-26, 0, -20], elbowR: [-60, 0, 0],
        thighL: [-18, 10, 12], kneeL: [22, 0, 0], thighR: [8, -10, -12], kneeR: [18, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the walk he closes distance with: upright, arms still folded
    jr_walk: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const s = Math.sin(t * 7 * sp);
      return Object.assign({
        root: { y: -0.02 + Math.abs(s) * 0.015, rx: 6 }, spine: [2, s * 3, 0], chest: [-2, s * 3, 0], head: [-4, -s * 2, 0],
        thighL: [-s * 30 - 4, 0, 4], kneeL: [10 + Math.max(0, s) * 30, 0, 0], thighR: [s * 30 - 4, 0, -4], kneeR: [10 + Math.max(0, -s) * 30, 0, 0],
        hands: ['fist', 'fist'],
      }, FOLD);
    },
    // a single raised forearm: he guards with one arm, the other still folded
    jr_guard: {
      root: { y: -0.04 }, spine: [4, 6, 0], chest: [4, 8, 0], head: [6, -4, 0],
      shoulderL: [-84, 0, 24], elbowL: [-120, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0],
      thighL: [-14, 8, 12], kneeL: [18, 0, 0], thighR: [6, -6, -12], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    // falling away on his back, the arms gone loose, the face turned up to the two who brought him down (the ToP's end)
    jr_fallAccept: {
      root: { y: 0.02, rx: -28 },
      spine: [-8, 0, 0], chest: [-6, 0, 0], neck: [-10, 0, 0], head: [-18, 0, 0],
      shoulderL: [-50, 0, 58], elbowL: [-24, 0, 0], shoulderR: [-46, 0, -62], elbowR: [-20, 0, 0],
      thighL: [-24, 0, 8], kneeL: [34, 0, 0], footL: [20, 0, 0], thighR: [-10, 0, -8], kneeR: [24, 0, 0], footR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    jr_flyIdle: (t) => {
      const s = Math.sin(t * 1.6);
      return Object.assign({ root: { y: 0.02 * s }, spine: [2, 0, 0], chest: [-2, 0, 0], head: [0, 0, 0], thighL: [-8, 0, 6], kneeL: [14, 0, 0], footL: [30, 0, 0], thighR: [-4, 0, -6], kneeR: [10, 0, 0], footR: [30, 0, 0], hands: ['fist', 'fist'] }, FOLD);
    },
    jr_flyForward: {
      root: { rx: 58 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-20, 0, 0], head: [-30, 0, 0],
      shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0],
      thighL: [2, 0, 4], kneeL: [12, 0, 0], footL: [50, 0, 0], thighR: [-2, 0, -4], kneeR: [18, 0, 0], footR: [50, 0, 0],
      hands: ['fist', 'fist'],
    },
    // gathering: fists at the hips, chest out, chin down — no shouting
    jr_charge: (t) => {
      const s = Math.sin(t * 30) * 1;
      return {
        root: { y: -0.1 }, spine: [-2, 0, 0], chest: [-10 + s, 0, 0], neck: [6, 0, 0], head: [10, 0, 0],
        shoulderL: [10, 0, 26 + s], elbowL: [-50, 0, 0], shoulderR: [10, 0, -26 - s], elbowR: [-50, 0, 0],
        thighL: [-20, 0, 18], kneeL: [32, 0, 0], thighR: [-20, 0, -18], kneeR: [32, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    /* ---------------- lights: out of the fold ---------------- */
    // the wind-up IS the fold (that is the point: nothing to read)
    jr_foldW: Object.assign({ root: { y: -0.02 }, hips: [0, -6, 0], spine: [2, 4, 0], chest: [0, 6, 0], head: [2, -4, 0], hands: ['fist', 'fist'] }, FOLD, PLANT),
    jr_jab: { root: { y: -0.03, rx: 4 }, hips: [0, 8, 0], spine: [4, -10, 0], chest: [2, -16, 0], head: [0, 12, 0], shoulderL: [-90, 0, 4], elbowL: [-2, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0], thighL: [-14, 4, 11], kneeL: [12, 0, 0], thighR: [4, -4, -11], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    jr_straight: { root: { y: -0.04, rx: 6 }, hips: [0, -16, 0], spine: [6, 16, 0], chest: [4, 24, 0], head: [-2, -20, 0], shoulderR: [-92, 0, -2], elbowR: [-2, 0, 0], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], thighL: [-18, 6, 11], kneeL: [16, 0, 0], thighR: [8, -6, -11], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    jr_elbowW: { root: { y: -0.04 }, hips: [0, 14, 0], spine: [2, -14, 0], chest: [0, -20, 0], head: [0, 14, 0], shoulderL: [-70, -30, 40], elbowL: [-150, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0], thighL: [-14, 6, 11], kneeL: [14, 0, 0], thighR: [4, -6, -11], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
    jr_elbow: { root: { y: -0.05, rx: 6, ry: -10 }, hips: [0, -20, 0], spine: [6, 18, 0], chest: [4, 28, 0], head: [-2, -24, 0], shoulderL: [-90, 40, 10], elbowL: [-150, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0], thighL: [-22, 8, 12], kneeL: [20, 0, 0], thighR: [10, -8, -12], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
    jr_hammerW: { root: { y: -0.02, rx: -6 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-6, 0, 0], shoulderR: [-170, 0, -10], elbowR: [-40, 0, 0], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], thighL: [-6, 0, 11], kneeL: [8, 0, 0], thighR: [-2, 0, -11], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
    jr_hammer: { root: { y: -0.1, rx: 14 }, spine: [14, 0, 0], chest: [12, 0, 0], head: [10, 0, 0], shoulderR: [-70, 0, -8], elbowR: [-10, 0, 0], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], thighL: [-26, 0, 12], kneeL: [32, 0, 0], thighR: [-6, 0, -12], kneeR: [18, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- heavies ---------------- */
    // THE POWER STRIKE: the one wind-up he has — the fold opens, the right fist goes all the way back
    jr_strikeW: (t) => {
      const s = Math.sin(t * 40) * 1.2;
      return { root: { y: -0.14 }, hips: [0, -38, 0], spine: [6, -26, 0], chest: [4 + s, -36, 0], head: [-6, 30, 0], shoulderR: [-4, 0, -54], elbowR: [-144, 0, 0], shoulderL: [-74, 0, 20], elbowL: [-40, 0, 0], thighL: [-40, 18, 18], kneeL: [52, 0, 0], thighR: [22, -14, -16], kneeR: [34, 0, 0], hands: ['fist', 'open'] };
    },
    jr_strike: { root: { y: -0.15, rx: 16 }, hips: [0, 32, 0], spine: [12, 32, 0], chest: [8, 42, 0], head: [-8, -32, 0], shoulderR: [-94, 0, -2], elbowR: [-2, 0, 0], shoulderL: [-14, 0, 44], elbowL: [-110, 0, 0], thighL: [-56, 10, 16], kneeL: [58, 0, 0], thighR: [28, -10, -12], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    jr_kneeW: { root: { y: -0.04 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [4, 0, 0], thighR: [-40, 0, -6], kneeR: [100, 0, 0], thighL: [-6, 0, 10], kneeL: [18, 0, 0], hands: ['fist', 'fist'], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0] },
    jr_knee: { root: { y: 0.04, rx: 10 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [8, 0, 0], thighR: [-118, 0, -6], kneeR: [136, 0, 0], thighL: [8, 0, 8], kneeL: [16, 0, 0], hands: ['fist', 'fist'], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0] },
    jr_doubleW: { root: { rx: -12 }, spine: [-12, 0, 0], chest: [-14, 0, 0], head: [-10, 0, 0], shoulderL: [-170, -20, 10], elbowL: [-30, 0, 0], shoulderR: [-170, 20, -10], elbowR: [-30, 0, 0], thighL: [-14, 0, 10], kneeL: [26, 0, 0], thighR: [-6, 0, -10], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    jr_double: { root: { y: -0.08, rx: 22 }, spine: [18, 0, 0], chest: [16, 0, 0], head: [16, 0, 0], shoulderL: [-60, -20, 8], elbowL: [-10, 0, 0], shoulderR: [-60, 20, -8], elbowR: [-10, 0, 0], thighL: [-30, 0, 10], kneeL: [44, 0, 0], thighR: [-10, 0, -10], kneeR: [30, 0, 0], hands: ['fist', 'fist'] },
    // the shoulder charge: he does not dash at you, he walks THROUGH you
    jr_shoulder: { root: { y: -0.06, rx: 18, ry: -24 }, hips: [0, -20, 0], spine: [10, -24, 0], chest: [8, -30, 0], head: [-10, 34, 0], shoulderL: [-20, -50, 10], elbowL: [-110, 0, 0], shoulderR: [-28, 62, -8], elbowR: [-100, 0, 0], thighL: [-40, 0, 10], kneeL: [44, 0, 0], thighR: [16, 0, -10], kneeR: [24, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- techniques ---------------- */
    // POWER IMPACT: the right palm drawn back to the hip, a red light in it...
    jr_impactW: (t) => {
      const s = Math.sin(t * 24) * 1.2;
      return { root: { y: -0.1 }, hips: [0, -26, 0], spine: [4, -18, 0], chest: [2 + s, -24, 0], head: [-4, 22, 0], shoulderR: [16, 0, -30], elbowR: [-90, 0, 0], handR: [30, 0, 0], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], thighL: [-30, 14, 14], kneeL: [38, 0, 0], thighR: [16, -12, -14], kneeR: [24, 0, 0], hands: ['fist', 'open'] };
    },
    // ...and pushed out at arm's length, the other arm still folded
    jr_impact: { root: { y: -0.12, rx: 8 }, hips: [0, 22, 0], spine: [8, 20, 0], chest: [6, 28, 0], head: [-6, -22, 0], shoulderR: [-88, 0, -4], elbowR: [-4, 0, 0], handR: [-70, 0, 0], shoulderL: [-26, -62, 8], elbowL: [-104, 0, 0], thighL: [-42, 10, 14], kneeL: [44, 0, 0], thighR: [22, -10, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'] },
    // GLARE: he leans in an inch and LOOKS — the force does the rest
    jr_glare: (t) => {
      const s = Math.sin(t * 50) * 0.8;
      return Object.assign({ root: { y: -0.04, rx: 6 }, spine: [6, 0, 0], chest: [6 + s, 0, 0], neck: [4, 0, 0], head: [-2, 0, 0], hands: ['fist', 'fist'] }, FOLD, { thighL: [-14, 0, 14], kneeL: [20, 0, 0], thighR: [-14, 0, -14], kneeR: [20, 0, 0] });
    },
    // INFINITY RUSH: low, then gone
    jr_rushW: { root: { y: -0.2, rx: 16 }, hips: [0, -16, 0], spine: [12, 12, 0], chest: [10, 16, 0], head: [-14, -12, 0], shoulderR: [10, 0, -30], elbowR: [-110, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-110, 0, 0], thighL: [-50, 12, 16], kneeL: [80, 0, 0], thighR: [6, -10, -16], kneeR: [50, 0, 0], hands: ['fist', 'fist'] },
    jr_rushDash: { root: { rx: 56 }, spine: [0, 0, 0], chest: [-4, 0, 0], neck: [-20, 0, 0], head: [-28, 0, 0], shoulderR: [-60, 0, -40], elbowR: [-90, 0, 0], shoulderL: [-60, 0, 40], elbowL: [-90, 0, 0], thighL: [6, 0, 4], kneeL: [20, 0, 0], footL: [50, 0, 0], thighR: [0, 0, -4], kneeR: [34, 0, 0], footR: [50, 0, 0], hands: ['fist', 'fist'] },
    /* ---------------- FULL POWER ---------------- */
    // the fold, held hard — the arms trembling
    jr_tfHold: (t) => {
      const s = Math.sin(t * 60) * 1.4;
      return Object.assign({ root: { y: -0.06 }, spine: [2, 0, 0], chest: [-2 + s, 0, 0], neck: [6, 0, 0], head: [12, 0, 0], hands: ['fist', 'fist'] }, FOLD, { thighL: [-18, 0, 16], kneeL: [26, 0, 0], thighR: [-18, 0, -16], kneeR: [26, 0, 0] });
    },
    // the arms come unfolded and out, the head comes up, and the red goes up with it
    jr_tfOpen: (t) => {
      const s = Math.sin(t * 50) * 2;
      return {
        root: { y: -0.16, rx: -4 }, spine: [-6, 0, 0], chest: [-14 + s, 0, 0], neck: [-6, 0, 0], head: [-12, 0, 0],
        shoulderL: [10, 0, 52 + s], elbowL: [-30, 0, 0], shoulderR: [10, 0, -52 - s], elbowR: [-30, 0, 0],
        thighL: [-32, 0, 26], kneeL: [52, 0, 0], footL: [-20, 0, -14], thighR: [-32, 0, -26], kneeR: [52, 0, 0], footR: [-20, 0, 14],
        hands: ['fist', 'fist'],
      };
    },
    /* ---------------- victory / defeat ---------------- */
    // his back already turned, arms folded: it is over
    jr_victoryAway: (t) => {
      const b = Math.sin(t * 1.1);
      return Object.assign({ root: { y: b * 0.003, ry: 160 }, spine: [-2, 0, 0], chest: [-4 + b * 0.5, 0, 0], head: [0, 0, 0], hands: ['fist', 'fist'] }, FOLD, PLANT);
    },
    // ...and a glance back over the shoulder
    jr_victoryLook: (t) => {
      const b = Math.sin(t * 1.1);
      return Object.assign({ root: { y: b * 0.003, ry: 160 }, spine: [-2, -10, 0], chest: [-4 + b * 0.5, -16, 0], neck: [0, -36, 0], head: [-2, -40, 0], hands: ['fist', 'fist'] }, FOLD, PLANT);
    },
    // facing you, the fold, the chin raised a degree
    jr_victory: (t) => {
      const b = Math.sin(t * 1.1);
      return Object.assign({ root: { y: b * 0.003 }, spine: [-3, 0, 0], chest: [-6 + b * 0.5, 0, 0], head: [-8, 0, 0], hands: ['fist', 'fist'] }, FOLD, PLANT);
    },
    // a fist held up in front of his face, looked at: strength is everything
    jr_fist: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({ root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-4, 0, 0], neck: [6, 0, 0], head: [10, 8, 0], shoulderR: [-60, 0, -30], elbowR: [-110, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-14, 0, 0], hands: ['fist', 'fist'] }, PLANT);
    },
    // he does not kneel: on his feet, bent over, one hand on his knee...
    jr_defeat: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.2 + b * 0.006, rx: 18 }, spine: [18, 0, 0], chest: [12 + b * 2, 0, 0], head: [6, 0, 0],
        shoulderR: [-30, 0, -6], elbowR: [-30, 0, 0], shoulderL: [-10, 0, 14], elbowL: [-24, 0, 0],
        thighL: [-34, 6, 12], kneeL: [44, 0, 0], thighR: [-10, -6, -12], kneeR: [30, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // ...and looking at his own fist, not understanding
    jr_defeatLook: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.12 + b * 0.004, rx: 8 }, spine: [8, 0, 0], chest: [4 + b, 0, 0], neck: [8, 0, 0], head: [14, 10, 0],
        shoulderR: [-58, 0, -26], elbowR: [-104, 0, 0], shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
        thighL: [-24, 6, 12], kneeL: [30, 0, 0], thighR: [-8, -6, -12], kneeR: [22, 0, 0],
        hands: ['open', 'fist'],
      };
    },
  };

  // light: almost no startup, short reach, heavy for a light; H: his heavies
  const mv = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 3, active: 3, recovery: 12, cancel: 6, damage: dmg, reach: 1.25, radius: 0.8, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);
  const H = (extra) => Object.assign({ startup: 12, active: 4, recovery: 20, reach: 1.35, radius: 1.0, lunge: 10, hitstun: 36, knock: 'heavy', knockSpeed: 34, impact: 3, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, extra);

  // FULL POWER: the arms stay folded while it builds, then they open and the red goes up
  const FULL_SEQUENCE = {
    length: 176,
    applyAt: 118,
    steps: [
      { at: 0, pose: 'jr_tfHold', speed: 6, expression: 'serious', aura: 0.3, auraColor: 0xff5a3a, mood: [0.35, 0x1a0606, 0.85], shot: 'orbit', music: 0, sfx: 'kiUp' },
      { at: 26, rocks: true, quake: 0.2, sfx: 'rumble' },
      { at: 58, aura: 0.6, quake: 0.3, sfx: 'ssjRise', expression: 'angry' },
      { at: 88, pose: 'jr_tfOpen', speed: 8, expression: 'shout', quake: 0.45, sfx: 'roar', song: 'jiren_theme', songLevel: 2 },
      { at: 118, burst: true, pose: 'jr_tfOpen', speed: 14, expression: 'shout', sfx: 'transformBurst', flash: 0.6, crater: 6, rocks: false, music: 3 },
      { at: 130, shot: 'pull' },
      { at: 148, pose: 'jr_stance', speed: 4, expression: 'serious', mood: [0.05, 0x140606, 1.4] },
    ],
  };

  SL.data.characters.jiren = {
    id: 'jiren',
    assetLevel: 1,
    name: 'Jiren',
    fullName: 'Jiren (Pride Troopers, Universe 11)',
    era: 'Super',
    playable: true,
    prototype: true,
    style: 'Power · Pressure',
    blurb: 'The strongest of the Pride Troopers. He folds his arms and lets you come to him — and your light blows simply do not move him.',
    bio: 'A warrior from Universe 11 who believes that strength is the only thing that never betrays you. He barely moves: his arms stay folded, his feet stay planted, and his blows come out of nowhere and are gone again. While his focus holds, light hits do not even make him flinch — break it with heavy blows and he can finally be hurt. Pushed far enough, he unfolds his arms and stops holding back.',
    card: ['Universe 11', 'Unshakable', 'Full Power'],
    ratings: { power: 5, speed: 4, ki: 4, defense: 5 },
    stats: { hp: 34000, ki: 150, stamina: 180, speed: 1.12, power: 1.72, defense: 1.4, weight: 1.35, kiRegen: 3.2, chargeRate: 40, canonPower: 9.6 },
    appearance: {
      height: 1.12,
      skin: SKIN,
      build: {
        chestW: 0.25, chestD: 0.16, chestTop: 0.3, shoulderX: 0.25, delt: 0.096, waistW: 0.15, waistD: 0.12, pelvisW: 0.152,
        upperArmR: 0.072, foreArmR: 0.064, fist: 0.068, thighR: 0.1, shinR: 0.076, neckR: 0.074, neckLen: 0.05, headR: 0.148, footLen: 1.08,
      },
      // the cranium: a smooth skin dome rising up and back over the skull
      headExtras: [
        { shape: 'ball', a: [0, 0.75, -0.55], d: [0, 0.8, -0.6], l: 0.15, r: 0.138, flat: 0.98, depth: 0.45, outline: 0.35 },
      ],
      face: { pupil: 0x1c1e26, sclera: 0x0c0c12, eyeW: 1.5, eyeH: 1.3, eyeX: 0.052, brow: 0x5e636c, browThick: 1.5, jaw: 1.1, jawW: 1.04, cheeks: 0.3, nose: 0.6 },
      outfit: {
        // the Pride Trooper suit: red sleeves (the stands' Pride Troopers, the owner's stills), white gloves and boots
        topStyle: 'shirt', top: RED, abs: BLACK, sleeves: 'long', sleeveColor: RED,
        // (2026-10-15 Pride Trooper pass, the board's Dyspo p.58: the suit is black down the middle from the collar and
        // the red comes to a point on the black belly — it was a plain red top over black)
        vee: { chest: { color: BLACK, at: 0.19, slope: 2.4 }, abs: { color: RED, at: 0.05, slope: 1.0 } },
        gloves: WHITE,
        pants: BLACK, pantsStyle: 'tight',
        boots: WHITE, bootStyle: 'saiyan', bootTip: null,
        // full power against Mastered Ultra Instinct, and the finale: the suit torn away to the waist — bare to a
        // ragged red band over the black trousers (the gloves and boots stay)
        damage: {
          tearAt: 2,
          rips: [
            { at: 'chest', y: 0.2, ang: 0.5, w: 0.4, h: 0.06, fill: 'skin', level: 1, until: 1 },
            { at: 'thighR', t: 0.4, ang: 0.3, w: 0.7, h: 0.08, fill: 'skin', level: 1 },
            ...[0, 1.57, 3.14, -1.57].map((a, i) => ({ at: 'spine', y: 0.06, ang: a + 0.3, w: 1.8, h: 0.08, fill: 'top', cloth: 'top', level: 2, seed: 120 + i })),
            { at: 'thighL', t: 0.55, ang: -0.3, w: 0.6, h: 0.08, fill: 'skin', level: 2 },
          ],
        },
        torn: { chest: 'skin', trap: 'skin', abs: 'skin', sleeves: 'skin' },
      },
      portraitColor: '#c8322e',
    },
    vfx: { ghost: 0xff9a80, trail: 0xffc0b0 },
    audio: { strikePitch: 0.82, heavyPitch: 0.7 },
    forms: [
      {
        id: 'base', name: 'Base',
        aura: { color: 0xff7a5a, core: 0xffe0d8, particles: 0xff9a80, speed: 0.9 },
        mult: {},
      },
      {
        id: 'full', name: 'Full Power', short: 'FULL POWER', kiCost: 60, style: 'full',
        mult: { damage: 1.4, speed: 1.18, defense: 1.3, kiRegen: 1.8, chargeRate: 1.3, accel: 1.3 },
        // red and dark: a deep core under the bright outer light, streaks when he moves — the skin is not tinted
        aura: { color: 0xff3a2a, core: 0xffb0a0, particles: 0xff6a4a, idle: 0.55, speed: 1.4, sharp: 0.45, sparks: 0xffa080, inner: { color: 0x7a0a10, core: 0xff3a2a, scale: 0.74, alpha: 0.9, sharp: 0.3 }, trail: 0xff3a2a },
        look: { bulk: 1.06, muscle: 1.1 },
        poses: { idle: poses.jr_stance, run: poses.jr_walk },
        intro: { pose: 'jr_stance', expression: 'serious' },
        victory: { poses: ['jr_fist'], expression: 'serious' },
        // the escalation: the waiting stops
        ai: { aggression: 0.95, defense: 0.7, rhythm: { burst: 5, rest: 26 } },
        ghost: 0xff6a4a,
        music: 3,
        sequence: FULL_SEQUENCE,
      },
    ],
    poses: Object.assign({ idle: poses.jr_idle, run: poses.jr_walk, flyIdle: poses.jr_flyIdle, flyForward: poses.jr_flyForward, guard: poses.jr_guard, charge: poses.jr_charge }, poses),
    moves: {
      light: [
        mv('jrJab', 720, 'jr_foldW', 'jr_jab'),
        mv('jrStraight', 820, 'jr_foldW', 'jr_straight', { startup: 4 }),
        mv('jrElbow', 980, 'jr_elbowW', 'jr_elbow', { startup: 4, knock: 'push', knockSpeed: 12, impact: 2, hitPose: 'hitBody', sfx: 'punchHeavy' }),
        mv('jrHammer', 1150, 'jr_hammerW', 'jr_hammer', { startup: 6, reach: 1.3, knock: 'push', knockSpeed: 16, impact: 2, hitstun: 26, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
      ],
      heavy: {
        // THE POWER STRIKE: the slowest blow he has and the hardest: crushes any guard
        0: Object.assign(mv('jrPowerStrike', 2600, 'jr_strikeW', 'jr_strike'), H({ startup: 16, recovery: 24, knockSpeed: 40, impact: 4, guardCrush: true, guardDamage: 60, hitstun: 40 })),
        1: Object.assign(mv('jrKnee', 1700, 'jr_kneeW', 'jr_knee'), H({ startup: 9, knock: 'launch', knockSpeed: 22, hitstun: 32, hitPose: 'hitBody' })),
        2: Object.assign(mv('jrDouble', 2000, 'jr_doubleW', 'jr_double'), H({ startup: 11, knock: 'smash', knockSpeed: 34, hitstun: 36 })),
        3: Object.assign(mv('jrPowerStrike2', 2400, 'jr_strikeW', 'jr_strike'), H({ startup: 13, knockSpeed: 42, impact: 4, guardCrush: true, guardDamage: 50 })),
      },
      airHeavy: {
        0: Object.assign(mv('jrAirDouble', 2000, 'jr_doubleW', 'jr_double'), H({ knock: 'smash', knockSpeed: 36 })),
        2: Object.assign(mv('jrAirKnee', 1600, 'jr_kneeW', 'jr_knee'), H({ startup: 9, knock: 'launch', knockSpeed: 20, hitPose: 'hitBody' })),
      },
      // he does not dash at you: the shoulder walks through you (armor on the way in)
      dash: Object.assign(mv('jrShoulder', 1600, 'jr_foldW', 'jr_shoulder'), { startup: 6, active: 8, recovery: 18, lunge: 30, knock: 'heavy', knockSpeed: 30, impact: 3, hitstun: 28, armor: true, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      chase: {
        smash: Object.assign(mv('jrChaseDouble', 1500, 'jr_doubleW', 'jr_double'), H({ startup: 6, active: 6, knock: 'smash', knockSpeed: 36, lunge: 16 })),
        strike: Object.assign(mv('jrChaseStrike', 1500, 'jr_strikeW', 'jr_strike'), H({ startup: 6, active: 6, lunge: 16 })),
      },
      throw: { id: 'jrThrow', name: 'Pride Slam', damage: 1700, knockSpeed: 32, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // a big, slow red sphere: easy to see coming, very hard to stop
      special1: {
        id: 'powerImpact', name: 'Power Impact', type: 'projectile', kiCost: 30, icon: 'ball',
        startup: 20, recovery: 24, pose: { wind: 'jr_impactW', release: 'jr_impact' },
        projectile: { speed: 30, radius: 0.95, damage: 2600, homing: 0.35, color: 0xff3a2a, core: 0xffe0d0, explode: 4.2, knock: 'heavy', knockSpeed: 30, impact: 4, life: 3.6 },
      },
      // the eyes: pressure that throws everyone near him off him (a defensive answer, not a nuke)
      special2: {
        id: 'jirenGlare', name: 'Glare', type: 'bossRoar', kiCost: 26, icon: 'guard',
        frames: 44, blastAt: 14, radius: 8, knockSpeed: 26, damage: 900, poses: { roar: 'jr_glare' },
      },
      ultimate: {
        id: 'infinityRush', name: 'Infinity Rush', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 12, dashFrames: 22, speed: 64, recovery: 30, cinematic: true,
        poses: { wind: 'jr_rushW', dash: 'jr_rushDash' },
        hits: [
          { pose: 'jr_jab', damage: 800, frames: 5, sfx: 'punchLight' },
          { pose: 'jr_straight', damage: 850, frames: 5, sfx: 'punchHeavy' },
          { pose: 'jr_elbow', damage: 900, frames: 6, sfx: 'punchHeavy' },
          { pose: 'jr_jab', damage: 800, frames: 4, sfx: 'punchLight' },
          { pose: 'jr_straight', damage: 850, frames: 4, sfx: 'punchHeavy' },
          { pose: 'jr_knee', damage: 1000, frames: 6, sfx: 'punchHeavy' },
          { pose: 'jr_hammer', damage: 1100, frames: 7, sfx: 'punchHeavy' },
          { pose: 'jr_impact', damage: 3200, frames: 24, ki: { color: 0xff3a2a, hand: 'R' }, explode: 2.2, knock: 'heavy', knockSpeed: 40, impact: 4 },
        ],
      },
    },
    mechanic: { type: 'unshakable', name: 'Unshakable', desc: 'While his FOCUS holds, light blows do not make him flinch — each one chips at it, heavy blows break off big pieces. Empty, it breaks for four seconds and he can be combo\'d like anyone. A Perfect Guard steadies it.' },
    ai: { personality: 'elite', aggression: 0.7, defense: 0.8, ranged: 0.3, beam: 0.15, transformHp: 0.5, preferredRange: 2.2, hooks: 'jiren', rhythm: { burst: 3, rest: 58 } },
    barks: { taunt: 'jiren_taunt', combo: 'jiren_combo', hurt: 'jiren_hurt', lowHp: 'jiren_lowHp', ultimate: 'jiren_ultimate' },
    sequences: {
      // he is already standing there; the eyes open
      intro: [
        { pose: 'jr_idle', dur: 0.8, speed: 3, expression: 'closed' },
        { pose: 'jr_idle', dur: 0.7, speed: 3, expression: 'calm' },
        { pose: 'jr_glare', dur: 0.5, speed: 6, expression: 'serious' },
        { pose: 'jr_idle', dur: 0.5, speed: 6, expression: 'serious' },
      ],
      victory: [
        [{ pose: 'jr_victoryAway', dur: 1.4, speed: 3, expression: 'calm' }, { pose: 'jr_victoryLook', dur: 9, speed: 1.6, expression: 'serious' }],
        [{ pose: 'jr_victory', dur: 1.0, speed: 4, expression: 'calm' }, { pose: 'jr_fist', dur: 9, speed: 3, expression: 'serious' }],
      ],
      defeat: [{ pose: 'jr_defeat', dur: 1.4, speed: 5, expression: 'exhausted' }, { pose: 'jr_defeatLook', dur: 9, speed: 3, expression: 'shock' }],
    },
    intro: { pose: 'jr_idle', expression: 'serious' },
    victory: { poses: ['jr_victory'], expression: 'calm' },
    defeat: { pose: 'jr_defeat', expression: 'exhausted' },
  };
  // FULL POWER is a change in how he fights, not a bigger health bar: the same economical blows come out sooner and
  // drive further, and the waiting stops (form.ai). In his base state he walks in and waits for you (def.ai rhythm).
  {
    const J = SL.data.characters.jiren, full = J.forms.find((f) => f.id === 'full');
    full.moves = {
      light: J.moves.light.map((m) => Object.assign({}, m, { startup: Math.max(3, m.startup - 2), recovery: Math.max(6, m.recovery - 3), lunge: (m.lunge || 0) * 1.25, knockSpeed: m.knockSpeed && m.knockSpeed * 1.2 })),
    };
  }
})();
