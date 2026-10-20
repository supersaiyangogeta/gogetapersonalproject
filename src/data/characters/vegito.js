/*
 * VEGITO (Buu Saga, Age 774) — Goku and Vegeta, fused by the Potara.
 *
 * Built from the owner's reference sheet as a character of his own, not two meshes stuck together
 * and not a recoloured Goku:
 *   HEAD    Vegeta's hairline (the widow's peak, the flame swept up off the forehead, shorter and
 *           raked back) with Goku's two front bangs hanging either side of the peak; Vegeta's
 *           narrower eyes and heavier brows on a squarer jaw; a Potara earring in EACH ear.
 *   BODY    between the two of them and bigger than either: Goku's height, Vegeta's density —
 *           broad shoulders, thick forearms, a narrow waist.
 *   CLOTHES Goku's gi turned inside out in colour: the gi dark navy, the undershirt and the sash
 *           orange, bare arms; Vegeta's white gloves and his white boots with the yellow tips.
 *   ACTING  Goku's playfulness plus Vegeta's arrogance: he rolls his shoulders, stretches his
 *           neck, flexes his gloves, fights with his hands open and low, taunts with two fingers,
 *           and floats with his arms folded while other people are trying to kill him. The
 *           expression he lives in is `cocky`. His lines are written for two voices at once
 *           (subtitle style 'dual').
 *
 * Forms: base → SUPER VEGITO (gold flame, the two bangs kept, teal eyes, a gold aura that crackles
 * blue). The story hands Super Vegito over in "Super Vegito" (formGivenBy) — its transformation is
 * the twenty-beat power-up of the brief (wide stance, fists to the hips, chest out, chin down, the
 * ground cracking and lifting, white-blue aura igniting gold, the kiai).
 *
 * Kit: open-handed strings that finish with kicks; Spirit Sword (special 1: a blade of ki out of
 * the open right hand, prop `spiritSword`); a speed-of-light step (special 2, not Instant
 * Transmission: no fingers to the forehead, he simply is somewhere else); Banshee Rapid Fire (extra:
 * five golden shots, one from each finger); Final Kamehameha (ultimate).
 *
 * The rest of the Potara cast lives here too: `gokule` (the fusion Goku imagines with Mr. Satan —
 * a joke body, story only) and the Potara data (SL.data.fusions.vegito).
 *
 * Level 1 functional prototypes. Vegito is playable (Free Battle after "Vegito").
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const SKIN = 0xf5c49e;
  const NAVY = 0x1e2a6a, ORANGE = 0xf2741c, WHITE = 0xf7f6f0, GOLD = 0xe8c64a;
  const POTARA = 0xf2c82a;

  // the arms folded across the chest (P.armsCrossed): Super Vegito's "I haven't needed my hands yet"
  const ARMS = { shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0] };

  const poses = {
    /* ---------------- presence ---------------- */
    // standing: weight on the back leg, hands loose and open, chin up, head tipped — at ease
    vg_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.02 + b * 0.006 }, hips: [0, -10, 3], spine: [-2, 6, 0], chest: [-5, 8, 0], neck: [0, 0, 0], head: [-6, -10, 5 + b * 1.5],
        shoulderL: [-8, 0, 14], elbowL: [-22, 0, 0], shoulderR: [-6, 0, -12], elbowR: [-18, 0, 0],
        thighL: [-6, 6, 12], kneeL: [8, 0, 0], thighR: [2, -8, -9], kneeR: [14, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // in a fight: side-on and low, the lead hand open and down, the rear hand open at the chest,
    // a small bounce — he is waiting for you to do something interesting
    vg_fight: (t) => {
      const b = Math.sin(t * 3.2);
      return {
        root: { y: -0.08 + b * 0.01, rx: 4 }, hips: [0, -26, 0], spine: [4, 12, 0], chest: [2, 14, 0], head: [-8, -18, 3],
        shoulderL: [-40, 0, 18], elbowL: [-40, 0, 0], shoulderR: [-36, 0, -30], elbowR: [-100, 0, 0],
        thighL: [-24, 18, 14], kneeL: [34 + b * 3, 0, 0], thighR: [14, -16, -14], kneeR: [30 + b * 3, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // floating, arms folded, legs hanging loose: the most disrespectful stance in the universe
    vg_floatArms: (t) => {
      const s = Math.sin(t * 1.6);
      return Object.assign({
        root: { y: 0.03 * s }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-8, -8, 6],
        thighL: [-16 + s * 2, 0, 6], kneeL: [26, 0, 0], footL: [40, 0, 0],
        thighR: [-4 - s * 2, 0, -6], kneeR: [14, 0, 0], footR: [44, 0, 0],
        hands: ['fist', 'fist'],
      }, ARMS);
    },
    // standing with the arms folded
    // looking down from above (the Future Trunks Saga entrance, the owner's recollection 2026-10-19): floating upright,
    // the arms folded, the chin down at whoever is below
    vg_overlook: (t) => Object.assign({}, poses.vg_floatArms(t), { neck: [8, 0, 0], head: [20, -4, 0] }),
    vg_armsStand: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({
        root: { y: b * 0.004 }, hips: [0, -6, 2], spine: [-2, 4, 0], chest: [-6, 4, 0], head: [-10, -8, 5],
        thighL: [-4, 4, 11], kneeL: [5, 0, 0], thighR: [2, -4, -10], kneeR: [6, 0, 0],
        hands: ['fist', 'fist'],
      }, ARMS);
    },
    // hovering at ease (the flying idle): one knee up, hands loose
    vg_flyIdle: (t) => {
      const s = Math.sin(t * 2);
      return {
        root: { y: 0.03 * s }, spine: [2, 0, 0], chest: [-2, 0, 0], head: [-6, -6, 4],
        shoulderL: [-12, 0, 22 + s * 2], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -20 - s * 2], elbowR: [-26, 0, 0],
        thighL: [-34 + s * 3, 0, 5], kneeL: [64, 0, 0], footL: [35, 0, 0],
        thighR: [-6 - s * 3, 0, -5], kneeR: [24, 0, 0], footR: [45, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // flying forward: a fist out in front, not both arms back like everybody else
    vg_flyForward: (t) => {
      const s = Math.sin(t * 9);
      return {
        root: { rx: 70 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-26, 0, 0], head: [-36, 0, 0],
        shoulderL: [20, 0, 14], elbowL: [-14, 0, 0], shoulderR: [-150, 0, -6], elbowR: [-6, 0, 0],
        thighL: [6 + s * 3, 0, 4], kneeL: [16, 0, 0], footL: [55, 0, 0],
        thighR: [2 - s * 3, 0, -4], kneeR: [28, 0, 0], footR: [55, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // an athlete's run, but loose in the shoulders
    vg_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 11 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.05 + Math.abs(c) * 0.05, rx: 18 },
        spine: [8, s * 8, 0], chest: [4, s * 10, 0], head: [-18, -s * 8, 0],
        shoulderL: [s * 40 - 8, 0, 14], elbowL: [-80, 0, 0], shoulderR: [-s * 40 - 8, 0, -14], elbowR: [-80, 0, 0],
        thighL: [-s * 50 - 10, 0, 3], kneeL: [35 + Math.max(0, s) * 62, 0, 0], footL: [10, 0, 0],
        thighR: [s * 50 - 10, 0, -3], kneeR: [35 + Math.max(0, -s) * 62, 0, 0], footR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a guard that is barely a guard: one forearm up, the other hand still open at the hip
    vg_guard: {
      root: { y: -0.04 }, spine: [6, 10, 0], chest: [6, 12, 0], head: [8, -10, 0],
      shoulderR: [-80, 0, 30], elbowR: [-124, 0, 0], shoulderL: [-20, 0, 18], elbowL: [-40, 0, 0],
      thighL: [-18, 10, 10], kneeL: [28, 0, 0], thighR: [8, -8, -10], kneeR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    /* ---------------- the power-up (Super Vegito, beats 3–7 of the brief) ---------------- */
    // feet wider than the shoulders, knees bent, both fists locked at the hips above the sash,
    // chest thrown out, chin lowered, staring up through the brows
    vg_power: (t) => {
      const s = Math.sin(t * 38) * 1.6;
      return {
        root: { y: -0.2, rx: -4 }, spine: [-8, 0, 0], chest: [-16 + s, 0, 0], neck: [6, 0, 0], head: [12, 0, 0],
        shoulderL: [34, 0, 24 + s], elbowL: [-104, 0, 0], shoulderR: [34, 0, -24 - s], elbowR: [-104, 0, 0],
        thighL: [-38, 0, 30], kneeL: [64, 0, 0], footL: [-24, 0, -18], thighR: [-38, 0, -30], kneeR: [64, 0, 0], footR: [-24, 0, 18],
        hands: ['fist', 'fist'],
      };
    },
    // the kiai: the same stance, the head thrown back, the roar
    vg_roar: (t) => {
      const s = Math.sin(t * 44) * 2;
      return {
        root: { y: -0.18, rx: -8 }, spine: [-14, 0, 0], chest: [-20 + s, 0, 0], neck: [-12, 0, 0], head: [-26, 0, 0],
        shoulderL: [30, 0, 30 + s], elbowL: [-96, 0, 0], shoulderR: [30, 0, -30 - s], elbowR: [-96, 0, 0],
        thighL: [-36, 0, 30], kneeL: [60, 0, 0], footL: [-24, 0, -18], thighR: [-36, 0, -30], kneeR: [60, 0, 0], footR: [-24, 0, 18],
        hands: ['fist', 'fist'],
      };
    },
    // dust clearing: he straightens up, relaxes the arms, and smirks
    vg_settle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.03 + b * 0.005 }, hips: [0, -8, 2], spine: [-4, 4, 0], chest: [-8, 6, 0], head: [-4, -10, 4],
        shoulderL: [-4, 0, 16], elbowL: [-20, 0, 0], shoulderR: [-4, 0, -16], elbowR: [-20, 0, 0],
        thighL: [-8, 8, 16], kneeL: [10, 0, 0], thighR: [0, -6, -14], kneeR: [12, 0, 0],
        hands: ['open', 'open'],
      };
    },
    /* ---------------- the introduction (base Vegito, the brief's reveal) ---------------- */
    // the light is gone and he is just standing there: head bowed so the hair hides the face, fists
    // hanging loose and shut, the chest rising — the camera comes up him from the boots (owner)
    vg_bowed: (t) => {
      const b = Math.sin(t * 1.5);
      return {
        root: { y: -0.03 + b * 0.004 }, spine: [6, 0, 0], chest: [8 + b * 1.2, 0, 0], neck: [18, 0, 0], head: [36, 0, 0],
        shoulderL: [-4, 0, 16], elbowL: [-24, 0, 0], shoulderR: [-4, 0, -16], elbowR: [-24, 0, 0],
        thighL: [-4, 0, 13], kneeL: [8, 0, 0], thighR: [-4, 0, -13], kneeR: [8, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // "ALRIGHT!" (yosha): the head snaps up into a wide, low stance, one fist pulled up by the face and
    // the other driven out in front, the grin all teeth — the owner's reference pose
    vg_yosha: (t) => {
      const s = Math.sin(t * 30) * 1.2;
      return {
        root: { y: -0.24, rx: 16 }, hips: [0, -16, 0], spine: [10, 12, 0], chest: [8 + s * 0.3, 14, 0], neck: [-8, 0, 0], head: [-16, -12, 0],
        shoulderL: [-40, 0, 62], elbowL: [-128, 0, 0], shoulderR: [-60, 0, -14], elbowR: [-46, 0, 0],
        thighL: [-50, 14, 30], kneeL: [74, 0, 0], footL: [-18, 0, 0], thighR: [18, -14, -30], kneeR: [44, 0, 0], footR: [-10, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // rolling the shoulders back, one then the other
    vg_shoulders: (t) => {
      const a = Math.sin(t * 5), c = Math.cos(t * 5);
      return {
        root: { y: -0.01 }, spine: [-2, 0, 0], chest: [-6 + c * 3, 0, 0], head: [-4, 0, 0],
        shoulderL: [a * 24 - 6, 0, 16 + c * 8], elbowL: [-24, 0, 0], shoulderR: [-a * 24 - 6, 0, -16 + c * 8], elbowR: [-24, 0, 0],
        thighL: [-4, 4, 11], kneeL: [5, 0, 0], thighR: [2, -4, -10], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the neck, side to side
    vg_neck: (t) => {
      const a = Math.sin(t * 3.4);
      return {
        root: { y: -0.01 }, spine: [-2, 0, 0], chest: [-4, 0, 0], neck: [0, 0, a * 16], head: [-4, a * 6, a * 22],
        shoulderL: [-4, 0, 14], elbowL: [-20, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-20, 0, 0],
        thighL: [-4, 4, 11], kneeL: [5, 0, 0], thighR: [2, -4, -10], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the gloves: both hands up in front of the chest, flexing — open, fist, open
    vg_gloves: (t) => {
      const shut = Math.sin(t * 6) > 0;
      return {
        root: { y: -0.01 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [16, 0, 0],
        shoulderL: [-58, -20, 10], elbowL: [-96, 0, 0], shoulderR: [-58, 20, -10], elbowR: [-96, 0, 0],
        thighL: [-4, 4, 11], kneeL: [5, 0, 0], thighR: [2, -4, -10], kneeR: [6, 0, 0],
        hands: shut ? ['fist', 'fist'] : ['open', 'open'],
      };
    },
    // two fingers of the lead hand curled: come on, then
    vg_taunt: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: -0.03 }, hips: [0, -14, 0], spine: [0, 8, 0], chest: [-4, 10, 0], head: [-8, -12, 6],
        shoulderL: [-74, 0, 8], elbowL: [-26 + b * 18, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-18, 0, 0],
        thighL: [-12, 10, 12], kneeL: [16, 0, 0], thighR: [6, -8, -12], kneeR: [14, 0, 0],
        hands: ['point', 'open'],
      };
    },
    // hand on the hip, head tipped, the smirk
    vg_smirk: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.02 + b * 0.004 }, hips: [0, -10, 6], spine: [-2, 8, 0], chest: [-6, 10, 0], head: [-10, -14, 8],
        shoulderL: [-8, 0, 12], elbowL: [-14, 0, 0], shoulderR: [-18, 0, -56], elbowR: [-100, 0, 0],
        thighL: [-8, 8, 16], kneeL: [10, 0, 0], thighR: [4, -8, -12], kneeR: [14, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // a finger at somebody
    vg_point: {
      root: { y: -0.02 }, hips: [0, -8, 0], spine: [-2, -8, 0], chest: [-6, -10, 0], head: [-6, 10, 4],
      shoulderR: [-88, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-18, 0, 0],
      thighL: [-6, 4, 12], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [8, 0, 0],
      hands: ['open', 'point'],
    },
    // dual-voiced introduction: one hand spread at his own chest
    vg_intro: {
      root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-10, -6, 4],
      shoulderR: [-60, 40, -20], elbowR: [-110, 0, 0], shoulderL: [-6, 0, 20], elbowL: [-20, 0, 0],
      thighL: [-6, 6, 14], kneeL: [8, 0, 0], thighR: [2, -6, -12], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    /* ---------------- the showcase (Super Vegito vs Buuhan) ---------------- */
    // a head slip: leaning out of the way with the arms still folded (A left, B right, C back)
    vg_slipA: Object.assign({ root: { y: -0.04, rz: -14 }, spine: [0, 0, -12], chest: [-2, 0, -10], head: [-4, 0, -18], thighL: [-6, 0, 18], kneeL: [12, 0, 0], thighR: [2, 0, -6], kneeR: [10, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_slipB: Object.assign({ root: { y: -0.04, rz: 14 }, spine: [0, 0, 12], chest: [-2, 0, 10], head: [-4, 0, 18], thighL: [2, 0, 6], kneeL: [10, 0, 0], thighR: [-6, 0, -18], kneeR: [12, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_slipC: Object.assign({ root: { y: -0.02, rx: -16 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-10, 0, 0], thighL: [-2, 0, 10], kneeL: [16, 0, 0], thighR: [8, 0, -10], kneeR: [18, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    // the kicks he uses instead of his hands
    vg_xSnapW: Object.assign({ root: { y: -0.02, rx: -8 }, chest: [-6, -8, 0], head: [6, 6, 0], thighR: [-86, 0, -4], kneeR: [116, 0, 0], thighL: [-8, 0, 8], kneeL: [22, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xSnap: Object.assign({ root: { y: 0.02, rx: -18 }, chest: [-12, -8, 0], head: [8, 6, 0], thighR: [-128, 0, -4], kneeR: [4, 0, 0], footR: [30, 0, 0], thighL: [10, 0, 6], kneeL: [14, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xRoundW: Object.assign({ root: { y: -0.02, ry: 30, rx: -6 }, hips: [0, 30, 0], chest: [-4, -30, 0], head: [4, 24, 0], thighR: [-60, 0, -40], kneeR: [110, 0, 0], thighL: [-6, 0, 8], kneeL: [22, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xRound: Object.assign({ root: { y: 0.02, ry: -40, rz: 16 }, hips: [0, -40, 0], chest: [-6, 30, 0], head: [6, 20, -10], thighR: [-86, 0, -76], kneeR: [8, 0, 0], footR: [30, 0, 0], thighL: [6, 0, 10], kneeL: [16, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xKneeW: Object.assign({ root: { y: -0.02, rx: -4 }, chest: [-4, 0, 0], head: [6, 0, 0], thighL: [-50, 0, 6], kneeL: [120, 0, 0], thighR: [-4, 0, -8], kneeR: [16, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xKnee: Object.assign({ root: { y: 0.03, rx: 10 }, chest: [4, 0, 0], head: [8, 0, 0], thighL: [-118, 0, 6], kneeL: [140, 0, 0], thighR: [10, 0, -8], kneeR: [20, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xAxeW: Object.assign({ root: { y: 0.04, rx: -14 }, spine: [-8, 0, 0], chest: [-12, 0, 0], head: [10, 0, 0], thighR: [-170, 0, -8], kneeR: [4, 0, 0], thighL: [8, 0, 6], kneeL: [16, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    vg_xAxe: Object.assign({ root: { y: -0.06, rx: 12 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [16, 0, 0], thighR: [-64, 0, -6], kneeR: [6, 0, 0], footR: [20, 0, 0], thighL: [4, 0, 6], kneeL: [34, 0, 0], hands: ['fist', 'fist'] }, ARMS),
    // the feint (ft_vegito, the owner's Spirit Sword trap): flat on his back in the rubble, one arm over his eyes, the chest
    // heaving as if he were spent — the right hand at his side, where the blade will come from
    vg_feint: (t) => {
      const b = Math.sin(t * 5.5);
      return {
        root: { y: -0.84 + b * 0.006, rx: -90 },
        spine: [b * 1.5, 0, 0], chest: [b * 3, 0, 0], head: [-4, 22, 0],
        shoulderL: [-150, 0, 34], elbowL: [-118, 0, 0], shoulderR: [-10, 0, -16], elbowR: [-14, 0, 0],
        thighL: [-4, 0, 6], kneeL: [22, 0, 0], thighR: [0, 0, -6], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // up on one knee, the right hand held up and forward, two fingers out, the blade running level-ish from the wrist through
    // whoever is on it; the head tilted, mocking
    vg_kneelRaise: {
      root: { y: -0.44, rx: 2 },
      spine: [-2, 6, 0], chest: [-6, 8, 0], head: [-12, -10, 10],
      shoulderR: [-114, 0, -6], elbowR: [-4, 0, 0], handR: [-4, 0, 0], shoulderL: [-26, 0, 14], elbowL: [-56, 0, 0],
      thighL: [-90, 4, 8], kneeL: [92, 0, 0], thighR: [14, 0, -8], kneeR: [112, 0, 0], footR: [38, 0, 0],
      hands: ['open', 'point'],
    },
    // Spirit Sword: the right hand out, flat, palm down — then the blade raised overhead with him on it
    vg_swordW: {
      root: { y: -0.04 }, hips: [0, -14, 0], spine: [2, 12, 0], chest: [0, 16, 0], head: [2, -12, 0],
      shoulderR: [-84, 0, -8], elbowR: [-4, 0, 0], handR: [0, 0, 0], shoulderL: [-8, 0, 16], elbowL: [-24, 0, 0],
      thighL: [-16, 10, 12], kneeL: [22, 0, 0], thighR: [8, -10, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    vg_swordDown: {
      root: { y: -0.08, rx: 10 }, hips: [0, -10, 0], spine: [10, 10, 0], chest: [8, 12, 0], head: [20, -10, 0],
      shoulderR: [-40, 0, -8], elbowR: [-2, 0, 0], shoulderL: [-8, 0, 20], elbowL: [-30, 0, 0],
      thighL: [-24, 10, 12], kneeL: [34, 0, 0], thighR: [10, -10, -12], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    vg_swordUp: {
      root: { y: -0.02 }, spine: [-6, 4, 0], chest: [-10, 6, 0], head: [-34, -6, 0],
      shoulderR: [-168, 0, -10], elbowR: [-4, 0, 0], shoulderL: [-6, 0, 16], elbowL: [-20, 0, 0],
      thighL: [-6, 6, 12], kneeL: [8, 0, 0], thighR: [2, -6, -10], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    // Banshee Rapid Fire: the right hand held out, all five fingers spread
    vg_fingers: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        root: { y: -0.03 }, hips: [0, -10, 0], spine: [0, 10, 0], chest: [-2, 12, 0], head: [-2, -10, 0],
        shoulderR: [-88 + s, 0, -2], elbowR: [-2, 0, 0], handR: [-60, 0, 0], shoulderL: [-6, 0, 16], elbowL: [-22, 0, 0],
        thighL: [-10, 8, 12], kneeL: [14, 0, 0], thighR: [6, -8, -12], kneeR: [12, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the right straight that shuts a mouth
    vg_jawW: { root: { y: -0.02, rx: 4 }, spine: [6, 24, 0], chest: [4, 30, 0], head: [-4, -20, 0], shoulderR: [-60, 0, -30], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-70, 0, 0], thighL: [-30, 0, 10], kneeL: [30, 0, 0], thighR: [16, 0, -10], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    vg_jaw: { root: { y: -0.02, rx: 10 }, spine: [10, -24, 0], chest: [8, -34, 0], head: [-6, 24, 0], shoulderR: [-94, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-90, 0, 0], thighL: [-40, 0, 10], kneeL: [40, 0, 0], thighR: [20, 0, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    // a tap on somebody's shoulder, bored
    vg_tap: { root: { y: 0 }, hips: [0, -8, 0], spine: [-2, -6, 0], chest: [-4, -8, 0], head: [-6, 10, 8], shoulderR: [-70, 0, -18], elbowR: [-30, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-18, 0, 0], thighL: [-6, 4, 12], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [8, 0, 0], hands: ['open', 'point'] },
    // the lowered aura and the open arms: "go on, absorb me"
    vg_invite: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: -0.01 + b * 0.004 }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-10, 0, b * 3],
        shoulderL: [-20, 0, 44], elbowL: [-16, 0, 0], shoulderR: [-20, 0, -44], elbowR: [-16, 0, 0],
        thighL: [-4, 0, 12], kneeL: [6, 0, 0], thighR: [-4, 0, -12], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the barrier: both fists in, elbows out, the body tight
    vg_barrier: (t) => {
      const s = Math.sin(t * 30) * 1.4;
      return {
        root: { y: -0.1 }, spine: [8, 0, 0], chest: [6 + s, 0, 0], head: [8, 0, 0],
        shoulderL: [-50, 0, 60 + s], elbowL: [-130, 0, 0], shoulderR: [-50, 0, -60 - s], elbowR: [-130, 0, 0],
        thighL: [-20, 0, 16], kneeL: [30, 0, 0], thighR: [-20, 0, -16], kneeR: [30, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    /* ---------------- strikes (base kit) ---------------- */
    vg_jabW: { root: { y: -0.06 }, hips: [0, -20, 0], spine: [4, 16, 0], chest: [2, 22, 0], head: [-6, -16, 0], shoulderL: [-70, 0, 20], elbowL: [-60, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-110, 0, 0], thighL: [-24, 14, 12], kneeL: [30, 0, 0], thighR: [12, -12, -12], kneeR: [26, 0, 0], hands: ['open', 'fist'] },
    vg_jab: { root: { y: -0.06, rx: 6 }, hips: [0, 10, 0], spine: [6, -14, 0], chest: [4, -22, 0], head: [-6, 16, 0], shoulderL: [-88, 0, 6], elbowL: [-4, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-110, 0, 0], thighL: [-30, 10, 12], kneeL: [34, 0, 0], thighR: [16, -10, -12], kneeR: [20, 0, 0], hands: ['open', 'fist'] },
    vg_palmW: { root: { y: -0.06 }, hips: [0, 20, 0], spine: [4, -18, 0], chest: [2, -24, 0], head: [-6, 18, 0], shoulderR: [-60, 0, -30], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], thighL: [-20, 10, 12], kneeL: [26, 0, 0], thighR: [10, -10, -12], kneeR: [22, 0, 0], hands: ['fist', 'open'] },
    vg_palm: { root: { y: -0.06, rx: 8 }, hips: [0, -14, 0], spine: [8, 20, 0], chest: [6, 28, 0], head: [-6, -22, 0], shoulderR: [-90, 0, -6], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-100, 0, 0], thighL: [-34, 10, 12], kneeL: [36, 0, 0], thighR: [18, -10, -12], kneeR: [18, 0, 0], hands: ['fist', 'open'] },
    vg_hookKickW: { root: { y: -0.02, ry: 20, rx: -6 }, hips: [0, 24, 0], chest: [-4, -20, 0], head: [4, 20, 0], shoulderL: [-50, 0, 30], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-90, 0, 0], thighR: [-60, 0, -40], kneeR: [110, 0, 0], thighL: [-6, 0, 8], kneeL: [22, 0, 0], hands: ['open', 'open'] },
    vg_hookKick: { root: { y: 0.02, ry: -36, rz: 14 }, hips: [0, -36, 0], chest: [-6, 24, 0], head: [6, 18, -8], shoulderL: [-30, 0, 60], elbowL: [-50, 0, 0], shoulderR: [-20, 0, -60], elbowR: [-50, 0, 0], thighR: [-88, 0, -70], kneeR: [8, 0, 0], footR: [30, 0, 0], thighL: [6, 0, 10], kneeL: [16, 0, 0], hands: ['open', 'open'] },
    vg_victory: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: b * 0.004 }, hips: [0, -8, 4], spine: [-2, 4, 0], chest: [-6, 6, 0], head: [-10, -12, 6],
        shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0],
        thighL: [-6, 6, 12], kneeL: [6, 0, 0], thighR: [2, -6, -10], kneeR: [8, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // defeat (it does not happen in the story; Free Battle is another matter): one knee, a grin anyway
    vg_defeat: { root: { y: -0.4, rx: 8 }, spine: [14, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0], shoulderL: [-20, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-80, 0, 0], thighL: [-90, 0, 8], kneeL: [90, 0, 0], thighR: [10, 0, -8], kneeR: [110, 0, 0], hands: ['open', 'fist'] },
    // FINAL KAMEHAMEHA (2026-10-17, the owner's roadmap): the arms crossed in front of the chest, wrists locked, the
    // blue-and-gold charge crackling between them, before the hands are thrown forward
    vg_finalCross: (t) => {
      const s = Math.sin(t * 34) * 1.4;
      return {
        root: { y: -0.12 }, spine: [6, 0, 0], chest: [8 + s * 0.3, 0, 0], neck: [4, 0, 0], head: [-6, 0, 0],
        shoulderL: [-70, 0, -40 + s], elbowL: [-70, 0, 0], handL: [0, 0, -20], shoulderR: [-70, 0, 40 - s], elbowR: [-70, 0, 0], handR: [0, 0, 20],
        thighL: [-30, 0, 24], kneeL: [44, 0, 0], thighR: [-30, 0, -24], kneeR: [44, 0, 0],
        hands: ['open', 'open'],
      };
    },
    vg_kameCharge: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return {
        root: { y: -0.12 }, hips: [0, -40, 0], spine: [4, 30, 0], chest: [2, 36, 0], head: [-6, -40, 0],
        shoulderL: [40, 0, 20 + s], elbowL: [-110, 0, 0], shoulderR: [30, 0, -10 - s], elbowR: [-120, 0, 0],
        thighL: [-30, 20, 20], kneeL: [44, 0, 0], thighR: [16, -20, -20], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    vg_kameFire: { root: { y: -0.1, rx: 6 }, hips: [0, -10, 0], spine: [8, 10, 0], chest: [6, 10, 0], head: [-6, -8, 0], shoulderL: [-86, -10, 6], elbowL: [-4, 0, 0], shoulderR: [-86, 10, -6], elbowR: [-4, 0, 0], handL: [-60, 0, 0], handR: [-60, 0, 0], thighL: [-34, 10, 18], kneeL: [40, 0, 0], thighR: [20, -10, -18], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    // the potara: fastening an earring on his own ear (Goku left, Vegeta right: the scene mirrors it)
    vg_earring: { root: { y: 0 }, spine: [0, 0, 0], chest: [-2, 0, 0], head: [2, 0, -18], shoulderR: [-70, 0, -60], elbowR: [-130, 0, 0], shoulderL: [-4, 0, 14], elbowL: [-18, 0, 0], thighL: [-4, 0, 10], kneeL: [4, 0, 0], thighR: [-4, 0, -10], kneeR: [4, 0, 0], hands: ['open', 'point'] },
  };

  const mv = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 4, active: 3, recovery: 10, cancel: 6, damage: dmg, reach: 1.2, radius: 0.76, lunge: 13, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);

  // the kicks he throws with his arms folded (the Super Vegito dominance sequence swaps these in:
  // Fighter.movesOverride — the arms never come down)
  const ARMS_CROSSED_MOVES = {
    light: [
      mv('vxSnap', 1500, 'vg_xSnapW', 'vg_xSnap', { reach: 1.5, hitPose: 'hitHeavy' }),
      mv('vxKnee', 1400, 'vg_xKneeW', 'vg_xKnee', { reach: 1.15, hitPose: 'hitBody' }),
      mv('vxRound', 1900, 'vg_xRoundW', 'vg_xRound', { startup: 5, reach: 1.55, knock: 'push', knockSpeed: 16, impact: 2, hitPose: 'hitSideR', sfx: 'punchHeavy' }),
    ],
    heavy: { 0: mv('vxAxe', 4200, 'vg_xAxeW', 'vg_xAxe', { startup: 10, active: 5, recovery: 18, reach: 1.5, radius: 1.05, knock: 'smash', knockSpeed: 40, impact: 3, hitstun: 40, hitPose: 'hitHeavy', sfx: 'punchHeavy' }) },
    dash: mv('vxFlyKnee', 3000, 'vg_xKneeW', 'vg_xKnee', { startup: 4, active: 8, recovery: 14, lunge: 36, knock: 'heavy', knockSpeed: 36, impact: 3, hitstun: 30, sfx: 'punchHeavy', hitPose: 'hitBody' }),
  };

  // the Potara: one earring in each ear (a gold ring, a green bead)
  const EARRINGS = [
    { shape: 'ball', a: [0.98, -0.34, 0.05], d: [0, -1, 0], l: 0.012, r: 0.008, flat: 1, depth: 1.06, color: POTARA, outline: 0.4 },
    { shape: 'ball', a: [-0.98, -0.34, 0.05], d: [0, -1, 0], l: 0.012, r: 0.008, flat: 1, depth: 1.06, color: POTARA, outline: 0.4 },
    { shape: 'ball', a: [0.97, -0.46, 0.05], d: [0, -1, 0], l: 0.01, r: 0.009, flat: 1, depth: 1.07, color: 0xb8e04a, outline: 0.4 },
    { shape: 'ball', a: [-0.97, -0.46, 0.05], d: [0, -1, 0], l: 0.01, r: 0.009, flat: 1, depth: 1.07, color: 0xb8e04a, outline: 0.4 },
  ];

  const SPIRIT_SWORD = { id: 'spiritSword', shape: 'kiBlade', joint: 'handR', pos: [0, -0.06, 0], rot: [Math.PI, 0, 0], length: 2.2, width: 0.07, color: 0xffd84a, core: 0xfffbe0 };

  SL.data.characters.vegito = {
    id: 'vegito',
    assetLevel: 1,
    name: 'Vegito',
    fullName: 'Vegito (Goku + Vegeta, Potara)',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Absolute Confidence',
    blurb: 'Goku\'s instincts, Vegeta\'s pride, and more power than either of them has ever felt. He fights with his hands open because closing them has not been necessary yet.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 5 },
    stats: { hp: 36000, ki: 160, stamina: 170, speed: 1.3, power: 1.9, defense: 1.5, weight: 1.05, kiRegen: 3.4, chargeRate: 44, canonPower: 9 },
    appearance: {
      height: 1.0,
      skin: SKIN,
      // Goku's frame with Vegeta's density: broad, thick forearms, a narrow waist
      build: {
        chestW: 0.228, chestD: 0.152, chestTop: 0.29, shoulderX: 0.232, delt: 0.088, waistW: 0.14, waistD: 0.11, pelvisW: 0.15,
        upperArmR: 0.066, foreArmR: 0.059, fist: 0.064, thighR: 0.094, shinR: 0.072, neckR: 0.066, neckLen: 0.06, headR: 0.125, footLen: 1.06,
      },
      hair: { style: 'vegito', color: 0x131318 },
      headExtras: EARRINGS,
      face: { pupil: 0x121218, eyeW: 0.96, eyeH: 0.92, browThick: 1.3, jaw: 1.08, jawW: 1.02, cheeks: 0.7 },
      outfit: {
        // Goku's gi in reverse: the gi dark navy, the undershirt orange, bare arms; Vegeta's gloves and boots
        topStyle: 'gi', top: NAVY, under: ORANGE, sleeves: 'none', arms: SKIN, neck: 1.3,
        belt: ORANGE, beltStyle: 'sash',
        pants: NAVY, pantsStyle: 'gi',
        gloves: WHITE,
        boots: WHITE, bootTip: GOLD, bootStyle: 'saiyan',
      },
      props: [SPIRIT_SWORD],
      portraitColor: '#1e2a6a',
    },
    vfx: { ghost: 0xd8ecff, trail: 0xe8f4ff },
    audio: { strikePitch: 1.02, heavyPitch: 0.9 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xe4f0ff, core: 0xffffff, particles: 0xd4e6ff, speed: 1.2 }, mult: {} },
      {
        // SUPER VEGITO: gold, the two bangs kept, teal eyes, a gold flame crackling with blue lightning.
        // The biggest transformation in the game: the power-up of the brief, beat by beat.
        id: 'ssj', name: 'Super Vegito', short: 'SUPER VEGITO', kiCost: 40, style: 'full',
        freeUnlock: 'buu_supervegito',
        // powerscaling (the records PDF, 2026-10-17, evidence in STATUS): was damage 1.9 / speed 1.35 / defense 1.6 —
        // effective x3.6 damage, x2.4 defense, the strongest non-Blue form in the game; Super Vegito beat SSJ4 Gogeta in
        // 40 of 40 CPU duels. Brought to Fusion Reborn Gogeta's Super Saiyan tier
        mult: { damage: 1.55, speed: 1.28, defense: 1.3, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.7 },
        aura: { color: 0xffd23a, core: 0xfff6c0, particles: 0xffe680, idle: 0.55, speed: 1.6, sharp: 0.5, sparks: 0x8ac8ff, lightning: true },
        look: { hair: { style: 'vegito_ssj', color: 0xffd83e }, pupil: 0x14b8a6, brow: 0xe8b830, bulk: 1.07, muscle: 1.08 },
        poses: { idle: poses.vg_fight, flyIdle: poses.vg_floatArms },
        intro: { pose: 'vg_smirk', expression: 'cocky' },
        victory: { poses: ['vg_victory'], expression: 'cocky' },
        ghost: 0xfff0a0,
        music: 6,
        sequence: {
          length: 260,
          applyAt: 176,
          steps: [
            // 3–7: the stance, the fists to the hips, the chest out, the chin down
            { at: 0, pose: 'vg_power', speed: 6, expression: 'angry', aura: 0.2, auraColor: 0xdff0ff, mood: [0.35, 0x0c1024, 0.9], shot: 'orbit', music: 0, sfx: 'kiUp' },
            // 8–9: the ground gives first — cracks, then stones rising off it
            { at: 30, crack: true, quake: 0.15, rocks: true, sfx: 'rumble' },
            // 10: white-blue
            { at: 60, aura: 0.6, auraColor: 0xbfe0ff, sfx: 'ssjRise', mood: [0.62, 0x060a18, 0.6], lightning: true, quake: 0.25 },
            // 11–12: it catches gold; the lightning thickens
            { at: 110, aura: 0.9, sfx: 'lightning', skyBolt: true, quake: 0.35 },
            { at: 140, pose: 'vg_roar', speed: 8, expression: 'shout', hairFlicker: true, skyBolt: true, quake: 0.45 },
            // 13–16: the hair snaps up (the bangs stay), the eyes go teal, the kiai
            { at: 176, burst: true, pose: 'vg_roar', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.25, 0x2a2410, 0.3], flash: 1, crater: 7, hairFlicker: false, rocks: false },
            // 17–19: the dust clears; he straightens; the smirk
            { at: 212, pose: 'vg_settle', speed: 4, expression: 'cocky', shot: 'face', lightning: true, mood: [0.05, 0x101020, 1.4] },
          ],
        },
      },
      {
        /*
         * VEGITO BLUE (2026-10-17, the owner's roadmap: God Slicer and the Blue Final Kamehameha). The Future Trunks Saga
         * appears in the story only in Chapter 19's "Vegito" (ft_vegito), where the Potara hands it over directly — no
         * other story fight offers it (storyLocked). In Free Battle it opens after "Vegito" (or, for saves from before the
         * chapter existed, after "The Final Battle", which comes later in canon). The look is Super Vegito's hair in Blue's colours with Blue's aura (no hair of its own yet).
         */
        id: 'blue', name: 'Super Saiyan Blue', short: 'VEGITO BLUE', kiCost: 80, style: 'full',
        storyLocked: true, freeUnlock: ['ft_vegito', 'top_finale'],
        mult: { damage: 2.2, speed: 1.4, defense: 1.75, kiRegen: 2.6, chargeRate: 1.6, guardStamina: 0.7 },
        aura: { color: 0x1a5ae8, core: 0xd8f6ff, particles: 0x8ad8ff, idle: 0.5, speed: 1.4, sharp: 0.28, sparks: 0xbfe8ff, flame: [0x1438b8, 0x1a5ae8, 0x3a9aff, 0x8ae8ff] },
        look: { hair: { style: 'vegito_ssj', color: 0x34c4ff }, pupil: 0x1a74e0, brow: 0x2aa0e8, bulk: 1.05, muscle: 1.06 },
        poses: { idle: poses.vg_fight, flyIdle: poses.vg_floatArms },
        intro: { pose: 'vg_smirk', expression: 'cocky' },
        victory: { poses: ['vg_victory'], expression: 'cocky' },
        ghost: 0x8ad8ff,
        // GOD SLICER'S PARRIES (the PDF: "a condensed, flashing blade along the edge of his hand for lightning-fast
        // parries"): a Perfect Guard, then Light — the hand-edge blade flashes out and cuts across him (behind him on
        // Heavy). The engine's counter strike (moveSet.counter), the edge shown only for the strike (mv.blade)
        moves: {
          counter: {
            light: { id: 'godSlicerParry', name: 'God Slicer Parry', startup: 2, active: 4, recovery: 14, damage: 820, reach: 1.3, radius: 0.95, lunge: 12, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 3, pose: { wind: 'vg_palmW', strike: 'vg_palm' }, sfx: 'swordSlash', hitPose: 'hitBody', blade: { prop: 'spiritSword', fill: 0.35 } },
            heavy: { id: 'godSlicerReverse', name: 'God Slicer Reverse', startup: 4, active: 4, recovery: 20, damage: 960, reach: 1.3, radius: 0.95, lunge: 10, hitstun: 40, knock: 'heavy', knockSpeed: 30, impact: 3, teleport: { to: 'behind', at: 2 }, pose: { wind: 'vg_palmW', strike: 'vg_swordUp' }, sfx: 'swordSlash', hitPose: 'hitBack', blade: { prop: 'spiritSword', fill: 0.35 } },
          },
        },
      },
    ],
    poses: Object.assign({ idle: poses.vg_fight, run: poses.vg_run, flyIdle: poses.vg_flyIdle, flyForward: poses.vg_flyForward, guard: poses.vg_guard, charge: poses.vg_power }, poses),
    moves: {
      light: [
        mv('vgJab', 700, 'vg_jabW', 'vg_jab'),
        mv('vgPalm', 760, 'vg_palmW', 'vg_palm', { hitPose: 'hitBody' }),
        mv('vgHookKick', 900, 'vg_hookKickW', 'vg_hookKick', { startup: 5, reach: 1.45, knock: 'push', knockSpeed: 13, impact: 2, hitPose: 'hitSideR', sfx: 'punchHeavy' }),
        mv('vgSnap', 980, 'vg_xSnapW', 'vg_xSnap', { startup: 5, reach: 1.45, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: mv('vgAxe', 2200, 'vg_xAxeW', 'vg_xAxe', { startup: 11, active: 5, recovery: 20, reach: 1.5, radius: 1.05, knock: 'smash', knockSpeed: 34, impact: 3, hitstun: 36, guardCrush: true, guardDamage: 50, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
        2: mv('vgRise', 1700, 'uppercutWind', 'uppercut', { startup: 8, recovery: 16, knock: 'launch', knockSpeed: 22, impact: 3, hitstun: 32, sfx: 'punchHeavy' }),
      },
      dash: mv('vgKnee', 1500, 'vg_xKneeW', 'vg_xKnee', { startup: 4, active: 8, recovery: 15, lunge: 34, knock: 'heavy', knockSpeed: 26, impact: 3, hitstun: 28, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      throw: { id: 'vgToss', name: 'Shoulder Toss', damage: 1400, knockSpeed: 28, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // a blade of ki out of the open right hand, through whatever is in front of it
      special1: {
        id: 'spiritSword', name: 'Spirit Sword', type: 'rush', kiCost: 34, icon: 'rush', prop: 'spiritSword',
        startup: 10, dashFrames: 18, speed: 62, recovery: 22,
        poses: { wind: 'vg_swordW', dash: 'vg_swordW' },
        hits: [
          { pose: 'vg_swordDown', damage: 1400, frames: 10, sfx: 'swordSlash' },
          { pose: 'vg_swordW', damage: 1400, frames: 10, sfx: 'swordSlash' },
          { pose: 'vg_swordUp', damage: 2600, frames: 18, sfx: 'swordSlash', knock: 'launch', knockSpeed: 28, impact: 4 },
        ],
        // outside the story (2026-10-17): alongside on the way in, both through the cuts, the impact as it throws him up
        cine: { steps: [{ on: 'release', shot: 'track', dur: 0.3 }, { on: 'connect', shot: 'wide', dur: 0.5 }, { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.3 }] },
      },
      // not Instant Transmission: no fingers, no concentration — he is just somewhere else
      special2: {
        id: 'vgFlash', name: 'Speed of Light', type: 'teleport', kiCost: 14, icon: 'teleport',
        startup: 3, recovery: 6, cooldown: 36, escapeKiCost: 24, followWindow: 34, followBonus: 1.3, pose: 'vg_armsStand',
        modes: { behind: true, front: true, away: true, above: true },
        fatigue: { window: 240, kiStep: 6, cooldownStep: 14, max: 3 },
        shimmer: true,
      },
      // two voices, one beam: Goku's stance, Vegeta's scale
      ultimate: {
        id: 'finalKame', name: 'Final Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 56, chargeMax: 56, damage: [11000, 11000], radius: [2.1, 2.1], speed: 118, range: 190, sustain: 54,
        color: 0x7ac8ff, core: 0xfffbe0, poses: { charge: 'vg_finalCross', fire: 'vg_kameFire' }, recovery: 40, cinematic: true,
        callout: ['FINAL', 'KAMEHAME', 'HA!'],
        // Vegito Blue's (the Future Trunks Saga's): deeper blue outside, gold inside, a wider wave
        formVariants: { blue: { name: 'Final Kamehameha (Blue)', color: 0x2a8cff, core: 0xfff2b0, radiusMul: 1.15, damageMul: 1.15 } },
        // outside the story (2026-10-17): round him with the arms crossed and blue and gold crackling, square in front as
        // it peaks, then wide from the side as it crosses — not Final Flash's, not Goku's
        cine: {
          steps: [
            { on: 'start', shot: 'orbit', dur: 0.8, flash: 1.4, flashColor: 0x7ac8ff },
            { on: 'start', at: 18, flash: 1.6, flashColor: 0xffe27a },
            { on: 'start', at: 34, flash: 1.8, flashColor: 0x7ac8ff },
            { on: 'start', at: 44, shot: 'front', dur: 0.3, flash: 2, flashColor: 0xffe27a },
            { on: 'release', shot: 'wide', dur: 1.4, quake: 0.4 },
          ],
        },
      },
    },
    extras: [
      // five golden shots, one from each finger, each one finding its own mark
      {
        id: 'banshee', name: 'Banshee Rapid Fire', type: 'projectile', kiCost: 30, icon: 'blast',
        startup: 12, recovery: 18, pose: { wind: 'vg_fingers', release: 'vg_fingers' },
        projectile: { kind: 'ball', count: 5, spread: 0.3, speed: 90, radius: 0.2, damage: 700, homing: 1.1, color: 0xffd84a, core: 0xffffff, explode: 1.2, knock: 'flinch', impact: 2, life: 1.6 },
      },
      // GOD SLICER (the PDF's, Vegito Blue): not the Spirit Sword — a short, condensed edge of divine ki along the hand
      // (the same blade prop held to a third of its length), fast stabs and cuts from both sides of him, a clean cross
      // cut to finish. Blue only; earned like the form. The PDF's parries are not built (a counter needs a trigger)
      {
        id: 'godSlicer', name: 'God Slicer', type: 'rush', kiCost: 50, icon: 'rush', prop: 'spiritSword', propMax: 0.35,
        forms: ['blue'], freeUnlock: ['ft_vegito', 'top_finale'], freeOnly: true, // the story's "Vegito" opens it (openExtras)
        startup: 8, dashFrames: 22, speed: 66, recovery: 26,
        poses: { wind: 'vg_palmW', dash: 'vg_palmW' },
        hits: [
          { pose: 'vg_palm', damage: 400, frames: 7, sfx: 'swordSlash', hitPose: 'hitBody', slashes: 1, slashColor: 0x7ad8ff },
          { pose: 'vg_swordDown', damage: 420, frames: 8, sfx: 'swordSlash', hitPose: 'hitBack', to: 'behind', slashes: 1, slashColor: 0x7ad8ff },
          { pose: 'vg_palm', damage: 420, frames: 7, sfx: 'swordSlash', hitPose: 'hitSideR', to: 'front', slashes: 1, slashColor: 0x7ad8ff },
          { pose: 'vg_swordUp', damage: 1700, frames: 22, sfx: 'swordSlash', knock: 'heavy', knockSpeed: 42, impact: 4, hitPose: 'hitHeavy', slashes: 3, slashColor: 0xbfefff },
        ],
        cine: { steps: [{ on: 'release', shot: 'track', dur: 0.3 }, { on: 'connect', shot: 'wide', dur: 0.5 }, { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.3 }] },
      },
      // THE LONG RUSHES (the owner, 2026-10-17: rushes longer than four seconds and more visual, added beside the existing
      // ones — plan 9.6; the owner's brief RUSH-VEG-01 / -02). Blue only, earned like God Slicer, Free Battle only.
      // Longer, not stronger: each one's total stays at or under his Spirit Sword rush (5,520), spread over more blows.
      // MULTI-IMAGE BLITZ: gone in a blue spark and at his left — a jab, then a palm to the jaw that launches him; above
      // him — both fists down, driving him back toward the ground (an impact frame); under him before he lands — a cascade
      // of twelve roundhouse, heel and snap kicks, each leaving a crescent of light in the air; the last one sends him away
      {
        id: 'multiImageBlitz', name: 'Multi-Image Blitz', type: 'rush', kiCost: 55, icon: 'rush',
        forms: ['blue'], freeUnlock: ['ft_vegito', 'top_finale'], freeOnly: true,
        startup: 8, dashFrames: 22, speed: 74, recovery: 30,
        poses: { wind: 'vg_armsStand', dash: 'vg_flyForward' },
        hits: [
          { pose: 'vg_jabW', move: true, to: 'left', frames: 10, cue: 'blitz' },
          { pose: 'vg_jab', damage: 300, frames: 12, sfx: 'punchLight', hitPose: 'hitSideR', ring: { color: 0xbfe8ff, size: 1 } },
          { pose: 'vg_palm', damage: 600, frames: 24, sfx: 'punchHeavy', hitPose: 'hitHeavy', lift: 3.6, ring: { color: 0x2a8cff, size: 1.6 }, cue: 'launch' },
          { pose: 'hammerWind', move: true, to: 'above', frames: 10, cue: 'spike' },
          { pose: 'hammer', damage: 1000, frames: 22, sfx: 'punchHeavy', hitPose: 'hitBack', lift: -2.4, ring: { color: 0xffffff, size: 2.2 }, impactFrame: 5 },
          { pose: 'vg_xRoundW', move: true, to: 'below', frames: 8, cue: 'cascade' },
          ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => ({
            pose: ['vg_xRound', 'vg_hookKick', 'vg_xSnap'][i % 3], damage: 170, frames: 10, sfx: i % 3 === 1 ? 'punchHeavy' : 'punchLight',
            hitPose: ['hitSideL', 'hitSideR', 'hitAirSpin'][i % 3], lift: 0.25, ring: { color: i % 2 ? 0xbfe8ff : 0x2a8cff, size: 1.3 },
          })),
          { pose: 'vg_xAxe', damage: 1400, frames: 30, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 40, impact: 4, hitPose: 'hitAirSpin', ring: { color: 0xffffff, size: 2.6 }, impactFrame: 6 },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.3 }, { on: 'blitz', shot: 'wide', dur: 0.5 }, { on: 'launch', shot: 'pairLow', dur: 0.6 },
            { on: 'spike', shot: 'pairHigh', dur: 0.8 }, { on: 'cascade', shot: 'pairLow', dur: 3.8 }, { on: 'finish', shot: 'wide', at: 1, dur: 1.3, quake: 0.35 },
          ],
        },
      },
      // SPIRIT SWORD DRAG: the blade drawn long into a sweeping whip of ki; the tip hooks him, one whole circle round
      // Vegito drags him through whatever stands there (pillars, rock, walls go to pieces), and the blade flings him off
      // across the sky — set up for the Final Kamehameha
      {
        id: 'spiritSwordDrag', name: 'Spirit Sword Drag', type: 'rush', kiCost: 55, icon: 'rush', prop: 'spiritSword',
        forms: ['blue'], freeUnlock: ['ft_vegito', 'top_finale'], freeOnly: true,
        startup: 10, dashFrames: 22, speed: 64, recovery: 30,
        poses: { wind: 'vg_swordW', dash: 'vg_swordW' },
        hits: [
          { pose: 'vg_palm', damage: 900, frames: 34, sfx: 'swordSlash', hitPose: 'hitBody', ring: { color: 0xffd84a, size: 1.4 }, cue: 'hook' },
          { pose: 'vg_swordW', damage: 1400, frames: 144, sfx: 'swordSlash', hitPose: 'tumble', swing: { radius: 4.8, turns: 1, scale: 2.2, lift: 0.4, color: 0xffe27a, smash: 3, whip: true }, cue: 'drag' },
          { pose: 'vg_swordUp', damage: 2600, frames: 34, sfx: 'swordSlash', knock: 'launch', knockSpeed: 46, impact: 4, hitPose: 'hitAirSpin', ring: { color: 0xffd84a, size: 2.6 }, giantCut: { length: 3.4, color: 0xffe27a }, impactFrame: 6 },
        ],
        cine: { steps: [{ on: 'release', shot: 'track', dur: 0.35 }, { on: 'hook', shot: 'pairLow', dur: 0.75 }, { on: 'drag', shot: 'swing', dur: 2.9 }, { on: 'finish', shot: 'impact', dur: 1, quake: 0.35 }, { on: 'finish', shot: 'wide', at: 14, dur: 1.2 }] },
      },
    ],
    mechanic: { type: 'saiyanInstinct', name: 'Two Saiyans, One Pride', desc: 'Goku\'s instinct and Vegeta\'s pride in one body: vanishing and perfect guards cost almost nothing and sharpen the next strike.' },
    ai: { personality: 'martial', aggression: 0.8, defense: 0.75, ranged: 0.35, beam: 0.4, transformHp: 0.7, preferredRange: 2.2 },
    barks: {},
    sequences: {
      intro: [
        { pose: 'vg_shoulders', dur: 1.0, speed: 7, expression: 'cocky' },
        { pose: 'vg_neck', dur: 0.9, speed: 6, expression: 'cocky' },
        { pose: 'vg_gloves', dur: 0.9, speed: 10, expression: 'smirk' },
        { pose: 'vg_taunt', dur: 1, speed: 8, expression: 'cocky' },
      ],
      victory: [[{ pose: 'vg_smirk', dur: 0.8, speed: 8, expression: 'cocky' }, { pose: 'vg_victory', dur: 9, speed: 6, expression: 'cocky' }]],
      defeat: [{ pose: 'vg_defeat', dur: 9, speed: 5, expression: 'grit' }],
    },
    intro: { pose: 'vg_taunt', expression: 'cocky' },
    victory: { poses: ['vg_victory'], expression: 'cocky' },
    defeat: { pose: 'vg_defeat', expression: 'grit' },
  };

  SL.data.vegitoMoves = { ARMS, ARMS_CROSSED_MOVES };
  SL.data.fusions = SL.data.fusions || {};
  // the Potara: no dance, no timer in the story (it is meant to be permanent — Buu's insides say otherwise)
  SL.data.fusions.vegito = { parts: ['goku', 'vegeta'], method: 'potara', seconds: 0 };

  /* ---------------- GOKULE: what Goku pictures when the only man left is Mr. Satan ---------------- */
  const GK = SL.data.characters.goku;
  SL.data.characters.gokule = Object.assign({}, GK, {
    id: 'gokule',
    name: 'Gokule',
    fullName: 'Gokule (imagined)',
    playable: false,
    assetLevel: 1,
    blurb: 'Goku\'s worst idea, never attempted.',
    stats: Object.assign({}, GK.stats, { hp: 6000, power: 0.6, speed: 0.8 }),
    appearance: Object.assign({}, GK.appearance, {
      build: Object.assign({}, GK.appearance.build, { chestW: 0.25, chestD: 0.19, waistW: 0.2, waistD: 0.17 }),
      hair: { style: 'satan_small', color: 0x16161c },
      headExtras: [
        // Mr. Satan's moustache under Goku's nose
        { shape: 'ball', a: [0.2, -0.36, 0.93], d: [1, -0.25, 0.1], l: 0.05, r: 0.02, flat: 0.7, depth: 1.02, color: 0x16161c, outline: 0.4 },
        { shape: 'ball', a: [-0.2, -0.36, 0.93], d: [-1, -0.25, 0.1], l: 0.05, r: 0.02, flat: 0.7, depth: 1.02, color: 0x16161c, outline: 0.4 },
      ],
      outfit: Object.assign({}, GK.appearance.outfit, { top: 0xf4f2ec, pants: 0xf4f2ec, under: 0xf2741c, sleeveColor: 0xf2741c, belt: 0x1a1a22, emblem: null }),
    }),
    forms: [GK.forms[0]],
    // a joke body: it never throws anything
    specials: {},
    extras: [],
  });
})();
