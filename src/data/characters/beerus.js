/*
 * BEERUS — the God of Destruction of Universe 7. Free Battle character (not in the story: his
 * awakening is after the Buu Saga). Level 1 functional prototype, built from memory (no owner
 * reference sheet yet — the look is the first thing to check against one).
 *
 *   LOOK    lean and tall, lavender skin, a cat's head: two tall pointed ears (headExtras), big
 *           pale-gold eyes lined in black, no hair. The Egyptian-style god's clothes: a dark top
 *           under a broad gold collar (model collarStyle 'usekh'), gold bands at the wrists and
 *           ankles, a sash with an orange tabard hanging in front (model outfit.apron), black
 *           trousers, dark pointed shoes.
 *   ACTING  bored. He stands with his hands behind his back and fights with one hand while the
 *           other stays there; he yawns; he flicks people away with a finger. When something
 *           finally interests him, both hands come out.
 *
 * How he FIGHTS — god-level control, minimal effort, destruction:
 *   mechanic   GOD'S WHIM (mechanics.js `godsWhim`): he starts BORED (his blows at 90 %). Every
 *              hit you land on him makes him more INTERESTED; at full interest he is ROUSED for
 *              eight seconds — 140 % damage, faster — and then he gets bored again. Poking him
 *              is the worst thing you can do: burst him or leave him alone.
 *   lights     one-handed: palm slaps, a backhand, a knee, the finger
 *   heavies    the flick of two fingers that throws you across the field, a spinning heel,
 *              a chop from above
 *   special 1  SPHERE OF DESTRUCTION   one finger raised, an orange sun on it, thrown slowly
 *   special 2  GOD'S FLICK             a finger flick of ki: fast, short, sends you flying
 *   ultimate   HAKAI                   in, one palm; purple light that eats what it touches
 *
 * Unlock: clear "The 28th World Tournament" (unlocks.js).
 */
(function () {
  'use strict';

  // REBUILT 2026-10-06 from the owner's Battle of Gods reference board: a sphinx cat, not a purple humanoid —
  // tall ears set high with gold hoops, narrow gold eyes lined in black like kohl, high cheekbones over a small
  // muzzle, a long thin neck, a lean body; the black top under a broad banded USEKH collar (gold, blue and teal
  // bands, orange stones on the rim); a white sash over the waist, a short blue cloth panel hanging from it; wide
  // navy trousers gathered at the ankle over gold bands; pointed shoes; and a long thin tail
  const SKIN = 0x9f84cc, DARK = 0x15131c, GOLD = 0xe8b83c, TRIM = 0x2a62c8, TEAL = 0x1fa0b8, GEM = 0xe8642a, PANTS = 0x1b2458, SASH = 0xf0ece2, PANEL = 0x1f4fa8, SHOE = 0x1c1a2a, INNER = 0xc89ac8;

  // THE WAIT: both hands clasped behind the small of his back
  const BACK = { shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [46, 86, 4], elbowR: [-68, 0, 0] };
  // only his left stays there while the right does the work
  const BACK_L = { shoulderL: [46, -86, -4], elbowL: [-68, 0, 0] };
  const SLOUCH = { thighL: [-2, 2, 8], kneeL: [5, 0, 0], thighR: [0, -4, -9], kneeR: [9, 0, 0] };

  const poses = {
    /* ---------------- presence ---------------- */
    // bored: weight on one hip, hands behind his back, the head tipped
    bs_idle: (t) => {
      const b = Math.sin(t * 1.0);
      return Object.assign({ root: { y: -0.01 + b * 0.003 }, hips: [0, -6, 4], spine: [2, 4, 0], chest: [-2 + b * 0.5, 4, 0], neck: [2, 0, 0], head: [2, -8, 8], hands: ['open', 'open'] }, BACK, SLOUCH);
    },
    // interested: the hands come out — loose, open, a little forward
    bs_stance: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.05 + b * 0.006, rx: 4 }, hips: [0, -16, 0], spine: [4, 10, 0], chest: [2, 12, 0], head: [-4, -10, 0],
        shoulderL: [-40, 0, 18], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -22], elbowR: [-56, 0, 0],
        thighL: [-16, 10, 12], kneeL: [22, 0, 0], thighR: [8, -10, -12], kneeR: [18, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the yawn: one hand to the mouth, the head back
    bs_yawn: (t) => {
      const b = Math.sin(t * 2);
      return Object.assign({ root: { y: -0.01 }, spine: [-4, 0, 0], chest: [-8 + b, 0, 0], neck: [-8, 0, 0], head: [-14, 0, 0], shoulderR: [-118, 24, -6], elbowR: [-148, 0, 0], hands: ['open', 'open'] }, BACK_L, SLOUCH);
    },
    bs_walk: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const s = Math.sin(t * 7 * sp);
      return Object.assign({
        root: { y: -0.02 + Math.abs(s) * 0.012, rx: 4 }, spine: [2, s * 3, 0], chest: [-2, s * 3, 0], head: [-2, -s * 2, 4],
        thighL: [-s * 26 - 4, 0, 4], kneeL: [10 + Math.max(0, s) * 26, 0, 0], thighR: [s * 26 - 4, 0, -4], kneeR: [10 + Math.max(0, -s) * 26, 0, 0],
        hands: ['open', 'open'],
      }, BACK);
    },
    // a single raised palm — he does not cover up, he catches
    bs_guard: Object.assign({ root: { y: -0.03 }, spine: [2, 6, 0], chest: [2, 8, 0], head: [2, -4, 0], shoulderR: [-80, 0, -10], elbowR: [-70, 0, 0], handR: [-40, 0, 0], thighL: [-10, 6, 10], kneeL: [14, 0, 0], thighR: [4, -6, -10], kneeR: [12, 0, 0], hands: ['open', 'open'] }, BACK_L),
    bs_flyIdle: (t) => {
      const s = Math.sin(t * 1.4);
      return Object.assign({ root: { y: 0.02 * s }, spine: [2, 0, 0], chest: [-2, 0, 0], head: [2, -6, 6], thighL: [-12, 0, 6], kneeL: [26, 0, 0], footL: [30, 0, 0], thighR: [-4, 0, -6], kneeR: [14, 0, 0], footR: [30, 0, 0], hands: ['open', 'open'] }, BACK);
    },
    bs_flyForward: Object.assign({ root: { rx: 52 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [-18, 0, 0], head: [-26, 0, 0], thighL: [2, 0, 4], kneeL: [12, 0, 0], footL: [50, 0, 0], thighR: [-2, 0, -4], kneeR: [18, 0, 0], footR: [50, 0, 0], hands: ['open', 'open'] }, BACK),
    bs_charge: (t) => {
      const s = Math.sin(t * 26);
      return { root: { y: -0.08 }, spine: [-2, 0, 0], chest: [-8 + s, 0, 0], neck: [4, 0, 0], head: [6, 0, 0], shoulderL: [6, 0, 30], elbowL: [-40, 0, 0], shoulderR: [6, 0, -30], elbowR: [-40, 0, 0], thighL: [-18, 0, 16], kneeL: [28, 0, 0], thighR: [-18, 0, -16], kneeR: [28, 0, 0], hands: ['open', 'open'] };
    },
    /* ---------------- one-handed lights ---------------- */
    bs_slapW: Object.assign({ root: { y: -0.03 }, hips: [0, 14, 0], spine: [2, -12, 0], chest: [0, -18, 0], head: [0, 12, 0], shoulderR: [-50, 0, -60], elbowR: [-60, 0, 0], thighL: [-14, 6, 11], kneeL: [14, 0, 0], thighR: [4, -6, -11], kneeR: [10, 0, 0], hands: ['open', 'open'] }, BACK_L),
    bs_slap: Object.assign({ root: { y: -0.04, rx: 4 }, hips: [0, -14, 0], spine: [4, 16, 0], chest: [2, 24, 0], head: [-2, -18, 0], shoulderR: [-86, 0, 10], elbowR: [-6, 0, 0], handR: [0, 0, -20], thighL: [-18, 6, 11], kneeL: [16, 0, 0], thighR: [8, -6, -11], kneeR: [8, 0, 0], hands: ['open', 'open'] }, BACK_L),
    bs_backhandW: Object.assign({ root: { y: -0.03 }, hips: [0, -16, 0], spine: [2, 16, 0], chest: [0, 22, 0], head: [0, -14, 0], shoulderR: [-70, 0, 20], elbowR: [-120, 0, 0], thighL: [-14, 6, 11], kneeL: [14, 0, 0], thighR: [4, -6, -11], kneeR: [10, 0, 0], hands: ['open', 'fist'] }, BACK_L),
    bs_backhand: Object.assign({ root: { y: -0.04, rx: 4, ry: 10 }, hips: [0, 18, 0], spine: [4, -16, 0], chest: [2, -26, 0], head: [-2, 18, 0], shoulderR: [-84, 0, -64], elbowR: [-8, 0, 0], thighL: [-18, 6, 11], kneeL: [16, 0, 0], thighR: [8, -6, -11], kneeR: [8, 0, 0], hands: ['open', 'fist'] }, BACK_L),
    bs_kneeW: Object.assign({ root: { y: -0.03 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [4, 0, 0], thighR: [-40, 0, -6], kneeR: [100, 0, 0], thighL: [-6, 0, 10], kneeL: [18, 0, 0], hands: ['open', 'open'] }, BACK),
    bs_knee: Object.assign({ root: { y: 0.04, rx: 10 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [8, 0, 0], thighR: [-116, 0, -6], kneeR: [136, 0, 0], thighL: [8, 0, 8], kneeL: [16, 0, 0], hands: ['open', 'open'] }, BACK),
    // the finger: index out, a poke that lands like a hammer
    bs_pokeW: Object.assign({ root: { y: -0.02 }, spine: [0, 6, 0], chest: [-2, 8, 0], head: [0, -6, 0], shoulderR: [-40, 0, -20], elbowR: [-100, 0, 0], hands: ['open', 'point'] }, BACK_L, SLOUCH),
    bs_poke: Object.assign({ root: { y: -0.03, rx: 4 }, hips: [0, -10, 0], spine: [4, 12, 0], chest: [2, 16, 0], head: [-2, -14, 0], shoulderR: [-92, 0, -2], elbowR: [-2, 0, 0], thighL: [-14, 4, 11], kneeL: [12, 0, 0], thighR: [6, -4, -11], kneeR: [8, 0, 0], hands: ['open', 'point'] }, BACK_L),
    /* ---------------- heavies ---------------- */
    // the flick: two fingers held at the thumb in front of the target's forehead...
    bs_flickW: Object.assign({ root: { y: -0.02 }, spine: [2, 8, 0], chest: [0, 10, 0], head: [2, -8, 0], shoulderR: [-82, 0, -6], elbowR: [-24, 0, 0], handR: [-20, 0, 0], hands: ['open', 'fist'] }, BACK_L, SLOUCH),
    // ...and let go
    bs_flick: Object.assign({ root: { y: -0.02 }, spine: [2, 8, 0], chest: [0, 10, 0], head: [2, -8, 0], shoulderR: [-86, 0, -6], elbowR: [-14, 0, 0], handR: [30, 0, 0], hands: ['open', 'point'] }, BACK_L, SLOUCH),
    bs_heelW: { root: { y: -0.02, ry: 24, rx: -6 }, hips: [0, 26, 0], chest: [-4, -22, 0], head: [4, 20, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-30, 0, -44], elbowR: [-60, 0, 0], thighR: [-62, 0, -38], kneeR: [112, 0, 0], thighL: [-6, 0, 8], kneeL: [22, 0, 0], hands: ['open', 'open'] },
    bs_heel: { root: { y: 0.03, ry: -38, rz: 14 }, hips: [0, -38, 0], chest: [-6, 26, 0], head: [6, 20, -8], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], shoulderR: [-24, 0, -60], elbowR: [-40, 0, 0], thighR: [-90, 0, -74], kneeR: [6, 0, 0], footR: [30, 0, 0], thighL: [6, 0, 10], kneeL: [16, 0, 0], hands: ['open', 'open'] },
    bs_chopW: Object.assign({ root: { y: -0.02, rx: -6 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-6, 0, 0], shoulderR: [-170, 0, -10], elbowR: [-20, 0, 0], thighL: [-6, 0, 11], kneeL: [8, 0, 0], thighR: [-2, 0, -11], kneeR: [6, 0, 0], hands: ['open', 'open'] }, BACK_L),
    bs_chop: Object.assign({ root: { y: -0.1, rx: 14 }, spine: [14, 0, 0], chest: [12, 0, 0], head: [10, 0, 0], shoulderR: [-70, 0, -8], elbowR: [-4, 0, 0], thighL: [-26, 0, 12], kneeL: [32, 0, 0], thighR: [-6, 0, -12], kneeR: [18, 0, 0], hands: ['open', 'open'] }, BACK_L),
    bs_launchW: { root: { y: -0.2, rx: 12 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0], shoulderR: [20, 0, -20], elbowR: [-110, 0, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], thighL: [-46, 0, 16], kneeL: [76, 0, 0], thighR: [-18, 0, -16], kneeR: [66, 0, 0], hands: ['open', 'open'] },
    bs_launch: { root: { y: 0.06, rx: -10 }, spine: [-10, 10, 0], chest: [-14, 16, 0], head: [-18, -10, 0], shoulderR: [-170, 0, -10], elbowR: [-10, 0, 0], shoulderL: [46, -86, -4], elbowL: [-68, 0, 0], thighL: [-10, 0, 12], kneeL: [16, 0, 0], thighR: [-56, 0, -8], kneeR: [86, 0, 0], hands: ['open', 'open'] },
    bs_dash: Object.assign({ root: { y: -0.02, rx: 20 }, hips: [0, -14, 0], spine: [8, 14, 0], chest: [6, 20, 0], head: [-10, -14, 0], shoulderR: [-92, 0, -4], elbowR: [-4, 0, 0], thighL: [-40, 0, 10], kneeL: [44, 0, 0], thighR: [14, 0, -10], kneeR: [26, 0, 0], hands: ['open', 'open'] }, BACK_L),
    /* ---------------- techniques ---------------- */
    // the sun on one finger
    bs_sphere: (t) => {
      const s = Math.sin(t * 6) * 1.5;
      return Object.assign({ root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-8 + s * 0.3, 0, 0], neck: [-6, 0, 0], head: [-10, 0, 0], shoulderR: [-176, 0, -6], elbowR: [-4, 0, 0], hands: ['open', 'point'] }, BACK_L, SLOUCH);
    },
    bs_sphereThrow: Object.assign({ root: { y: -0.06, rx: 10 }, spine: [10, 10, 0], chest: [8, 14, 0], head: [-4, -10, 0], shoulderR: [-100, 0, -8], elbowR: [-6, 0, 0], thighL: [-24, 6, 12], kneeL: [26, 0, 0], thighR: [10, -6, -12], kneeR: [12, 0, 0], hands: ['open', 'point'] }, BACK_L),
    // HAKAI: the palm, open and still
    bs_hakaiW: (t) => {
      const s = Math.sin(t * 30) * 0.8;
      return Object.assign({ root: { y: -0.04 }, hips: [0, -10, 0], spine: [2, 10, 0], chest: [0 + s, 14, 0], head: [-4, -10, 0], shoulderR: [-60, 20, -30], elbowR: [-60, 0, 0], handR: [-20, 0, 0], thighL: [-14, 6, 12], kneeL: [16, 0, 0], thighR: [6, -6, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] }, BACK_L);
    },
    bs_hakai: Object.assign({ root: { y: -0.06, rx: 6 }, hips: [0, 14, 0], spine: [6, 16, 0], chest: [4, 22, 0], head: [-4, -18, 0], shoulderR: [-90, 0, -4], elbowR: [-4, 0, 0], handR: [-70, 0, 0], thighL: [-30, 8, 12], kneeL: [34, 0, 0], thighR: [16, -8, -12], kneeR: [10, 0, 0], hands: ['open', 'open'] }, BACK_L),
    bs_rushDash: Object.assign({ root: { rx: 50 }, spine: [0, 0, 0], chest: [-4, 0, 0], neck: [-20, 0, 0], head: [-26, 0, 0], shoulderR: [-60, 0, -30], elbowR: [-40, 0, 0], thighL: [6, 0, 4], kneeL: [20, 0, 0], footL: [50, 0, 0], thighR: [0, 0, -4], kneeR: [34, 0, 0], footR: [50, 0, 0], hands: ['open', 'open'] }, BACK_L),
    /* ---------------- victory / defeat ---------------- */
    bs_victory: (t) => {
      const b = Math.sin(t * 1);
      return Object.assign({ root: { y: b * 0.003 }, hips: [0, -8, 4], spine: [0, 4, 0], chest: [-4 + b * 0.5, 4, 0], head: [-6, -12, 10], hands: ['open', 'open'] }, BACK, SLOUCH);
    },
    // ...and the yawn as he turns away: that was not worth waking up for
    bs_victoryAway: (t) => {
      const b = Math.sin(t * 2);
      return Object.assign({ root: { ry: 150 }, spine: [-4, 0, 0], chest: [-8 + b, 0, 0], neck: [-8, 0, 0], head: [-14, -20, 0], shoulderR: [-120, 30, -10], elbowR: [-120, 0, 0], hands: ['open', 'open'] }, BACK_L, SLOUCH);
    },
    // a thumbs-down... no: a stretch, both arms over his head
    bs_stretch: (t) => {
      const b = Math.sin(t * 1.4);
      return Object.assign({ root: { y: 0.01 }, spine: [-6, 0, 0], chest: [-12 + b, 0, 0], neck: [-6, 0, 0], head: [-10, 0, 0], shoulderL: [-170, -10, 14], elbowL: [-30, 0, 0], shoulderR: [-170, 10, -14], elbowR: [-30, 0, 0], hands: ['open', 'open'] }, SLOUCH);
    },
    // beaten (Free Battle only): sitting down where he fell, scratching an ear, annoyed
    bs_defeat: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.62, rx: -6 }, spine: [8, 0, 0], chest: [4 + b, 0, 0], head: [6, 10, 6],
        shoulderL: [-20, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-150, 20, -30], elbowR: [-120, 0, 0],
        thighL: [-86, 10, 20], kneeL: [100, 0, 0], thighR: [-86, -10, -20], kneeR: [100, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  const mv = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 3, active: 3, recovery: 10, cancel: 5, damage: dmg, reach: 1.25, radius: 0.78, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);
  const H = (extra) => Object.assign({ startup: 10, active: 4, recovery: 18, reach: 1.3, radius: 0.95, lunge: 12, hitstun: 34, knock: 'heavy', knockSpeed: 32, impact: 3, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, extra);

  SL.data.characters.beerus = {
    id: 'beerus',
    assetLevel: 1,
    name: 'Beerus',
    fullName: 'Beerus (God of Destruction, Universe 7)',
    era: 'Super',
    playable: true,
    prototype: true,
    style: 'God · Whim',
    blurb: 'The God of Destruction, and he would rather be asleep. Bored, he fights with one hand. Interest him, and both hands come out.',
    bio: 'The God of Destruction of Universe 7: the one who keeps the universe in balance by ending things. He sleeps for decades at a time and wakes up hungry and irritable. He fights with one hand behind his back because, most of the time, one hand is plenty — and every hit you land only makes him more interested. Make him take you seriously and you will regret it for eight long seconds.',
    card: ['God of Destruction', 'God\'s Whim'],
    ratings: { power: 5, speed: 5, ki: 5, defense: 4 },
    stats: { hp: 34000, ki: 170, stamina: 170, speed: 1.34, power: 1.9, defense: 1.45, weight: 0.95, kiRegen: 4, chargeRate: 44, canonPower: 9.8 },
    appearance: {
      height: 1.05,
      skin: SKIN,
      build: {
        chestW: 0.185, chestD: 0.12, chestTop: 0.27, shoulderX: 0.2, delt: 0.058, waistW: 0.112, waistD: 0.1, pelvisW: 0.122,
        upperArmR: 0.047, foreArmR: 0.043, fist: 0.052, thighR: 0.078, shinR: 0.058, neckR: 0.05, neckLen: 0.095, headR: 0.138, footLen: 1.12,
      },
      headExtras: [
        // THE EARS: tall, broad at the base, set high on the skull and leaning out — the silhouette
        { a: [0.52, 0.84, -0.1], d: [0.42, 1, -0.12], l: 0.27, r: 0.105, flat: 0.32, depth: 0.86 },
        { a: [-0.52, 0.84, -0.1], d: [-0.42, 1, -0.12], l: 0.27, r: 0.105, flat: 0.32, depth: 0.86 },
        // their pale insides
        { a: [0.52, 0.86, -0.02], d: [0.42, 1, -0.06], l: 0.21, r: 0.068, flat: 0.16, depth: 0.92, color: INNER, outline: 0 },
        { a: [-0.52, 0.86, -0.02], d: [-0.42, 1, -0.06], l: 0.21, r: 0.068, flat: 0.16, depth: 0.92, color: INNER, outline: 0 },
        // high cheekbones and a small cat's muzzle under the eyes
        { shape: 'ball', a: [0.44, -0.12, 0.88], d: [0.4, 0.2, 1], l: 0.03, r: 0.034, flat: 0.6, depth: 0.9, outline: 0 },
        { shape: 'ball', a: [-0.44, -0.12, 0.88], d: [-0.4, 0.2, 1], l: 0.03, r: 0.034, flat: 0.6, depth: 0.9, outline: 0 },
        { shape: 'ball', a: [0, -0.4, 1], d: [0, -0.1, 1], l: 0.032, r: 0.05, flat: 0.55, depth: 0.9, outline: 0.25 },
        // the kohl: a black wing from the outer corner of each eye, up and back
        { shape: 'line', a: [0.47, 0.04, 0.88], d: [1, 0.42, -0.25], l: 0.042, r: 0.007, depth: 1.012, color: 0x0c0a10 },
        { shape: 'line', a: [-0.47, 0.04, 0.88], d: [-1, 0.42, -0.25], l: 0.042, r: 0.007, depth: 1.012, color: 0x0c0a10 },
      ],
      face: { noEars: true, pupil: 0x0c0c0c, sclera: 0xf8e070, eyeW: 1.34, eyeH: 1.02, lashWing: true, lash: 0x0a080c, brow: 0x7a5aa6, browThick: 0.3, browW: 0.8, jaw: 0.94, jawW: 0.88, cheeks: 0.75, nose: 0.4 },
      outfit: {
        topStyle: 'shirt', top: DARK, abs: DARK, arms: SKIN,
        collar: GOLD, collarStyle: 'usekh', collarTrim: TRIM, collarBands: [GOLD, TRIM, GOLD, TEAL, GOLD], collarGems: GEM, collarReach: 0.236,
        wrist: GOLD, wristLen: 0.1,
        belt: GOLD, beltStyle: 'sash',
        apron: { color: PANEL, trim: GOLD, len: 0.3, width: 0.14 },
        pants: PANTS, pantsStyle: 'gi',
        // the trousers gathered at the ankle by a gold band, pointed dark shoes
        boots: PANTS, bootTrim: GOLD, shoes: SHOE, bootStyle: 'gi',
        // the tail: long and thin, out from under the sash, curling up at the end
        longTail: { length: 0.86, radius: 0.026, segments: 10, color: SKIN, lift: 0.55, curl: 0.3 },
      },
      props: [
        // gold hoops hanging from the base of each ear
        { id: 'hoopL', shape: 'hoop', joint: 'head', pos: [0.104, 0.172, -0.01], radius: 0.019, thick: 0.2, color: GOLD },
        { id: 'hoopR', shape: 'hoop', joint: 'head', pos: [-0.104, 0.172, -0.01], radius: 0.019, thick: 0.2, color: GOLD },
      ],
      portraitColor: '#9f84cc',
    },
    vfx: { ghost: 0xd8b0ff, trail: 0xe8d0ff },
    audio: { strikePitch: 1.0, heavyPitch: 0.86 },
    forms: [
      {
        id: 'base', name: 'Base',
        aura: { color: 0xc89aff, core: 0xf2e0ff, particles: 0xd8b8ff, speed: 0.9 },
        mult: {},
      },
    ],
    poses: Object.assign({ idle: poses.bs_idle, run: poses.bs_walk, flyIdle: poses.bs_flyIdle, flyForward: poses.bs_flyForward, guard: poses.bs_guard, charge: poses.bs_charge }, poses),
    moves: {
      light: [
        mv('bsSlap', 640, 'bs_slapW', 'bs_slap'),
        mv('bsBackhand', 720, 'bs_backhandW', 'bs_backhand', { hitPose: 'hitSideL' }),
        mv('bsKnee', 780, 'bs_kneeW', 'bs_knee', { reach: 1.0, hitPose: 'hitBody' }),
        mv('bsPoke', 900, 'bs_pokeW', 'bs_poke', { startup: 4, reach: 1.4, knock: 'push', knockSpeed: 16, impact: 2, hitPose: 'hitBody', sfx: 'punchHeavy' }),
      ],
      heavy: {
        // THE FLICK: two fingers on the forehead — and you are across the field
        0: Object.assign(mv('bsFlick', 1800, 'bs_flickW', 'bs_flick'), H({ startup: 12, reach: 1.15, knockSpeed: 46, hitstun: 38, guardCrush: true, guardDamage: 45 })),
        1: Object.assign(mv('bsHeel', 1700, 'bs_heelW', 'bs_heel'), H({ startup: 9, hitPose: 'hitSideR' })),
        2: Object.assign(mv('bsLaunch', 1500, 'bs_launchW', 'bs_launch'), H({ startup: 8, recovery: 16, knock: 'launch', knockSpeed: 22, hitstun: 32, hitPose: 'hitBody' })),
        3: Object.assign(mv('bsChop', 2000, 'bs_chopW', 'bs_chop'), H({ startup: 10, knock: 'smash', knockSpeed: 36, hitstun: 36 })),
      },
      airHeavy: {
        0: Object.assign(mv('bsAirChop', 1800, 'bs_chopW', 'bs_chop'), H({ knock: 'smash', knockSpeed: 34 })),
        2: Object.assign(mv('bsAirHeel', 1600, 'bs_heelW', 'bs_heel'), H({ startup: 8, hitPose: 'hitAirSpin' })),
      },
      dash: Object.assign(mv('bsDash', 1400, 'bs_slapW', 'bs_dash'), { startup: 4, active: 7, recovery: 14, lunge: 34, knock: 'heavy', knockSpeed: 28, impact: 3, hitstun: 28, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      chase: {
        smash: Object.assign(mv('bsChaseChop', 1500, 'bs_chopW', 'bs_chop'), H({ startup: 5, active: 6, knock: 'smash', knockSpeed: 36, lunge: 16 })),
        strike: Object.assign(mv('bsChaseHeel', 1400, 'bs_heelW', 'bs_heel'), H({ startup: 5, active: 6, lunge: 16 })),
      },
      throw: { id: 'bsThrow', name: 'Divine Toss', damage: 1500, knockSpeed: 34, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // one finger up, an orange sun on it: slow, enormous, and it does not care what is in the way
      special1: {
        id: 'sphereDestruction', name: 'Sphere of Destruction', type: 'projectile', kiCost: 40, icon: 'ball',
        startup: 30, recovery: 22, pose: { wind: 'bs_sphere', release: 'bs_sphereThrow' },
        projectile: { speed: 22, radius: 1.35, damage: 3000, homing: 0.25, color: 0xff8a2a, core: 0xfff0b0, explode: 5.5, knock: 'heavy', knockSpeed: 30, impact: 4, life: 4.2 },
      },
      // a flick of ki off the fingertip: fast, short, and it sends you flying
      special2: {
        id: 'godsFlick', name: 'God\'s Flick', type: 'projectile', kiCost: 18, icon: 'ball',
        startup: 8, recovery: 14, pose: { wind: 'bs_flickW', release: 'bs_flick' },
        projectile: { speed: 90, radius: 0.22, damage: 1300, color: 0xd8b0ff, core: 0xffffff, life: 0.3, knock: 'heavy', knockSpeed: 44, impact: 3 },
      },
      // HAKAI: in, one palm, purple light that eats what it touches
      ultimate: {
        id: 'hakai', name: 'Hakai', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 16, dashFrames: 18, speed: 72, recovery: 30, cinematic: true,
        poses: { wind: 'bs_hakaiW', dash: 'bs_rushDash' },
        hits: [
          { pose: 'bs_slap', damage: 900, frames: 6, sfx: 'punchLight' },
          { pose: 'bs_backhand', damage: 950, frames: 7, sfx: 'punchHeavy' },
          { pose: 'bs_hakai', damage: 8200, frames: 34, ki: { color: 0x8a3adf, hand: 'R' }, explode: 2.4, knock: 'heavy', knockSpeed: 34, impact: 4 },
        ],
      },
    },
    mechanic: { type: 'godsWhim', name: 'God\'s Whim', desc: 'He starts BORED and hits at 90 %. Every blow you land on him makes him more interested; at full interest he is ROUSED for eight seconds — 140 % damage and faster — then bored again. Burst him down or leave him alone: poking only wakes him up.' },
    ai: { personality: 'martial', aggression: 0.75, defense: 0.6, ranged: 0.4, beam: 0.1, preferredRange: 2.4, hooks: 'beerus', rhythm: { burst: 4, rest: 44 } },
    barks: { taunt: 'beerus_taunt', combo: 'beerus_combo', hurt: 'beerus_hurt', lowHp: 'beerus_lowHp', ultimate: 'beerus_ultimate' },
    sequences: {
      intro: [
        { pose: 'bs_yawn', dur: 0.9, speed: 4, expression: 'closed' },
        { pose: 'bs_idle', dur: 0.8, speed: 4, expression: 'calm' },
        { pose: 'bs_idle', dur: 0.6, speed: 4, expression: 'smirk' },
      ],
      victory: [
        [{ pose: 'bs_victory', dur: 1.2, speed: 3, expression: 'calm' }, { pose: 'bs_victoryAway', dur: 9, speed: 3, expression: 'closed' }],
        [{ pose: 'bs_stretch', dur: 9, speed: 3, expression: 'smirk' }],
      ],
      defeat: [{ pose: 'bs_defeat', dur: 9, speed: 3, expression: 'angry' }],
    },
    intro: { pose: 'bs_idle', expression: 'calm' },
    victory: { poses: ['bs_victory'], expression: 'calm' },
    defeat: { pose: 'bs_defeat', expression: 'angry' },
  };
})();
