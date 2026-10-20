/*
 * JANEMBA (Movie: Fusion Reborn — not canon) — and the ogre he was.
 *
 *   saike_oni      SAIKE ONI, the young ogre who was supposed to be watching the Spirit Cleansing
 *                  Machine: big headphones, a cassette player on his belt, dancing. Story only.
 *   janemba        FAT JANEMBA: a huge round child made of a million souls' evil. Yellow, purple
 *                  vest-like markings over the chest, purple at the wrists and feet, two little
 *                  horns, a vacant, delighted face. He bounces, claps, giggles — and folds space:
 *                    DIMENSION DOOR (special 2)  the tell (a giggle, palms out), then a portal in
 *                       front of him: blows from the front come out on YOUR back. Go round, or wait.
 *                    JANEMBA SPHERES (special 1)  a handful of little energy balls, tossed
 *                    DIMENSION PUNCH (ultimate slot)  a fist into a portal by him, out of a portal
 *                       beside you — the exit opens first: move
 *                    portal hops (his heavies teleport through doors), a rubber body (heavy blows
 *                       squash him, he bounces off the ground) — `dimensional` mechanic
 *   super_janemba  SUPER JANEMBA: what was inside. Narrow, athletic, red, a dull-purple armoured
 *                  headpiece, chest and shoulders, big curved horns, yellow eyes, white wrist guards,
 *                  and a long jagged sword pulled out of the spike on his head. Controlled, fast,
 *                  precise — and he punishes the predictable: the same strike three times, or a
 *                  string held too long, and he comes apart into floating cubes and puts himself back
 *                  together behind you (PHANTOM SHIFT). Dimensional slashes, a sword through a portal.
 *
 * The rules live in the `dimensional` mechanic (mechanics.js), the techniques in techniques.js
 * (portalGuard, phantomShift, portalStrike), the pictures in SL.Dimension (dimension.js), the AI in
 * AIHooks.janemba / AIHooks.super_janemba (controllers.js). Built from the owner's written design
 * notes, not from a reference image — check the silhouettes against one. Level 1 functional prototypes.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  /* ======================================================================== SAIKE ONI */
  const OGRE = 0xe0784a, HAIR = 0x1a1414, TIGER = 0xf2b830;
  const so = {
    so_idle: (t) => {
      const b = Math.sin(t * 2);
      return { root: { y: b * 0.004 }, spine: [2, 0, 0], head: [-4, b * 4, 0], shoulderL: [-6, 0, 14], elbowL: [-20, 0, 0], shoulderR: [-6, 0, -14], elbowR: [-20, 0, 0], thighL: [-2, 0, 8], kneeL: [4, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0], hands: ['open', 'open'] };
    },
    // eyes shut, head bobbing to the music, hips going, one hand on the headphones
    so_dance: (t) => {
      const b = Math.sin(t * 9), c = Math.cos(t * 4.5);
      return {
        root: { y: 0.02 + Math.abs(b) * 0.05, rz: c * 6 }, hips: [0, c * 18, 0], spine: [-4, -c * 10, c * 6], chest: [-4, 0, 0], head: [-10 + b * 8, c * 14, -c * 8],
        shoulderL: [-150, 0, 40 + b * 10], elbowL: [-60, 0, 0], shoulderR: [-30 + b * 20, 0, -40], elbowR: [-70, 0, 0],
        thighL: [-16 - c * 20, 0, 12], kneeL: [24 + Math.max(0, c) * 36, 0, 0], thighR: [-16 + c * 20, 0, -12], kneeR: [24 + Math.max(0, -c) * 36, 0, 0],
        hands: ['open', 'point'],
      };
    },
    // the big move: both arms up, a spin of the hips
    so_dance2: (t) => {
      const b = Math.sin(t * 8);
      return {
        root: { y: 0.04 + Math.abs(b) * 0.06, ry: Math.sin(t * 2) * 40 }, hips: [0, b * 20, 0], spine: [-8, 0, b * 8], chest: [-6, 0, 0], head: [-16, 0, b * 10],
        shoulderL: [-170, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-20, 0, 0],
        thighL: [-20 - b * 20, 0, 14], kneeL: [30 + Math.max(0, b) * 40, 0, 0], thighR: [-20 + b * 20, 0, -14], kneeR: [30 + Math.max(0, -b) * 40, 0, 0],
        hands: ['point', 'point'],
      };
    },
    so_shock: { root: { y: -0.02, rx: -8 }, spine: [-10, 0, 0], chest: [-10, 0, 0], head: [-8, 0, 0], shoulderL: [-110, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-110, 0, -50], elbowR: [-60, 0, 0], thighL: [-14, 0, 16], kneeL: [22, 0, 0], thighR: [10, 0, -16], kneeR: [16, 0, 0], hands: ['open', 'open'] },
    so_cower: (t) => {
      const b = Math.sin(t * 20) * 2;
      return { root: { y: -0.22, rx: 20 }, spine: [24, 0, b], chest: [16, 0, 0], head: [20, 0, 0], shoulderL: [-120, 0, 30], elbowL: [-130, 0, 0], shoulderR: [-120, 0, -30], elbowR: [-130, 0, 0], thighL: [-80, 4, 12], kneeL: [100, 0, 0], thighR: [-80, -4, -12], kneeR: [100, 0, 0], hands: ['open', 'open'] };
    },
    // sat on the ground where the light put him, blinking
    so_sit: (t) => {
      const b = Math.sin(t * 1.6);
      return { root: { y: -0.5, rx: -6 }, spine: [-6, 0, 0], chest: [-4, 0, 0], head: [6, b * 18, 0], shoulderL: [20, 0, 30], elbowL: [-20, 0, 0], shoulderR: [20, 0, -30], elbowR: [-20, 0, 0], thighL: [-88, 0, 16], kneeL: [20, 0, 0], thighR: [-88, 0, -16], kneeR: [20, 0, 0], hands: ['open', 'open'] };
    },
    // still sat there, looking round — left, right, where IS he
    so_lookAround: (t) => Object.assign({}, so.so_sit(t), { chest: [-4, Math.sin(t * 3.2) * 10, 0], head: [4, Math.sin(t * 3.2) * 42, 0] }),
    // ...and looking UP at someone standing over him, leaning back on his hands
    so_lookUp: (t) => Object.assign({}, so.so_sit(t), { root: { y: -0.52, rx: -16 }, spine: [-12, 0, 0], chest: [-8, 0, 0], head: [-34, 0, 0], shoulderL: [40, 0, 26], elbowL: [-6, 0, 0], shoulderR: [40, 0, -26], elbowR: [-6, 0, 0] }),
    so_run: (t) => {
      const s = Math.sin(t * 16);
      return { root: { y: -0.04 + Math.abs(s) * 0.05, rx: 16 }, spine: [10, 0, 0], head: [-10, 0, 0], shoulderL: [-120 + s * 30, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-120 - s * 30, 0, -40], elbowR: [-40, 0, 0], thighL: [-s * 60 - 10, 0, 6], kneeL: [40 + Math.max(0, s) * 60, 0, 0], thighR: [s * 60 - 10, 0, -6], kneeR: [40 + Math.max(0, -s) * 60, 0, 0], hands: ['open', 'open'] };
    },
  };
  SL.data.characters.saike_oni = {
    id: 'saike_oni', assetLevel: 1, name: 'Saike Oni', fullName: 'Saike Oni (the young ogre at the Spirit Cleansing Machine)', era: 'Movie',
    playable: false, cinematicOnly: true, prototype: true, style: 'Should Be Working',
    blurb: 'His one job was to watch the tank. He had new music.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 900, ki: 20, stamina: 60, speed: 0.8, power: 0.2, defense: 0.5, weight: 0.8, kiRegen: 1, chargeRate: 8, canonPower: 0.001 },
    flight: false,
    appearance: {
      height: 0.86, skin: OGRE,
      build: { chestW: 0.21, chestD: 0.17, shoulderX: 0.2, waistW: 0.19, waistD: 0.17, upperArmR: 0.055, foreArmR: 0.05, fist: 0.055, thighR: 0.09, shinR: 0.07, headR: 0.16, neckLen: 0.03 },
      hair: { style: 'yajirobe', color: HAIR },
      headExtras: [
        // one short horn out of the curls
        { a: [0.1, 0.98, 0.25], d: [0.1, 1, 0.15], l: 0.08, r: 0.026, color: 0xf2e6c8, depth: 1.02 },
        // the big headphones and the band over the top
        { shape: 'ball', a: [1, 0.1, 0], d: [1, 0, 0], l: 0.04, r: 0.075, color: 0x2a2a34, depth: 1.02, flat: 0.7, outline: 0.6 },
        { shape: 'ball', a: [-1, 0.1, 0], d: [-1, 0, 0], l: 0.04, r: 0.075, color: 0x2a2a34, depth: 1.02, flat: 0.7, outline: 0.6 },
        { shape: 'ball', a: [1, 0.1, 0], d: [1, 0, 0], l: 0.02, r: 0.05, color: 0xe8402a, depth: 1.12, flat: 0.5, outline: 0 },
        { shape: 'ball', a: [-1, 0.1, 0], d: [-1, 0, 0], l: 0.02, r: 0.05, color: 0xe8402a, depth: 1.12, flat: 0.5, outline: 0 },
        { a: [0.98, 0.3, 0], d: [-0.3, 1, 0], l: 0.17, r: 0.016, color: 0x2a2a34, depth: 1.12, outline: 0.4 },
        { a: [-0.98, 0.3, 0], d: [0.3, 1, 0], l: 0.17, r: 0.016, color: 0x2a2a34, depth: 1.12, outline: 0.4 },
      ],
      face: { pupil: 0x1a1a1a, eyeW: 0.95, brow: HAIR },
      outfit: {
        topStyle: 'gi', top: 0xf2f0e8, sleeves: 'none', sleeveColor: 0xf2f0e8,
        belt: 0x3a2a20, pants: TIGER, pantsStyle: 'gi', boots: 0x5a3a24, bootStyle: 'gi',
      },
      portraitColor: '#e0784a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: so.so_idle, run: so.so_run }, so),
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'so_dance', expression: 'grin' },
  };

  /* ======================================================================== FAT JANEMBA */
  const YELLOW = 0xf2c63a, VIOLET = 0x6a2a8a, VIOLET2 = 0x8a3aa8, HORN = 0xf6e2b0;
  const jb = {
    // bouncing on the spot, arms out from a body too round to hang them against, head tilted: curious
    jb_idle: (t) => {
      const b = Math.sin(t * 3.6), c = Math.cos(t * 1.1);
      return {
        root: { y: 0.01 + Math.abs(b) * 0.045 },
        hips: [0, b * 5, 0], spine: [-4, 0, b * 3], chest: [-2, 0, 0], head: [-4, c * 16, 10 + c * 8],
        shoulderL: [-14, 0, 52 + b * 6], elbowL: [-34, 0, 0], shoulderR: [-14, 0, -52 - b * 6], elbowR: [-34, 0, 0],
        thighL: [-8, 0, 16], kneeL: [12, 0, 0], thighR: [-8, 0, -16], kneeR: [12, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // "Janemba!": both hands at the mouth, shoulders shaking with giggles
    jb_giggle: (t) => {
      const b = Math.sin(t * 22);
      return {
        root: { y: 0.01 + Math.abs(b) * 0.02 }, spine: [-6, 0, 0], chest: [-6 + b * 2, 0, 0], head: [-12, 0, b * 4],
        shoulderL: [-100, 0, 30], elbowL: [-120, 0, 0], shoulderR: [-100, 0, -30], elbowR: [-120, 0, 0],
        thighL: [-6, 0, 16], kneeL: [10, 0, 0], thighR: [-6, 0, -16], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // clapping, delighted with himself
    jb_clap: (t) => {
      const b = Math.sin(t * 12);
      return {
        root: { y: 0.02 + Math.abs(b) * 0.03 }, spine: [-6, 0, 0], chest: [-4, 0, 0], head: [-16, 0, b * 6],
        shoulderL: [-80, 0, 14 + b * 22], elbowL: [-40, 0, 0], shoulderR: [-80, 0, -14 - b * 22], elbowR: [-40, 0, 0],
        thighL: [-10, 0, 16], kneeL: [16, 0, 0], thighR: [-10, 0, -16], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // sat on top of something: legs straight out, swinging, hands on his knees
    jb_sit: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.36, rx: -4 }, spine: [-4, 0, 0], chest: [-4, 0, 0], head: [6, b * 12, b * 6],
        shoulderL: [-30, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-30, 0, 0],
        thighL: [-86 + b * 10, 0, 18], kneeL: [16, 0, 0], thighR: [-86 - b * 10, 0, -18], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the tell: leaning back, both palms coming up and out, a little hop
    jb_doorW: (t) => {
      const b = Math.sin(t * 16);
      return {
        root: { y: 0.03 + Math.abs(b) * 0.03, rx: -8 }, spine: [-10, 0, 0], chest: [-8, 0, 0], head: [-14, 0, b * 6],
        shoulderL: [-70, 0, 60], elbowL: [-50, 0, 0], shoulderR: [-70, 0, -60], elbowR: [-50, 0, 0],
        thighL: [-10, 0, 18], kneeL: [16, 0, 0], thighR: [-10, 0, -18], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the door open: palms out in front of him, belly forward, swaying
    jb_door: (t) => {
      const b = Math.sin(t * 5);
      return {
        root: { y: 0.01, rx: 6, rz: b * 4 }, spine: [6, 0, b * 3], chest: [4, 0, 0], head: [-8, b * 10, 0],
        shoulderL: [-86, 10, 24], elbowL: [-12, 0, 0], handL: [-60, 0, 0], shoulderR: [-86, -10, -24], elbowR: [-12, 0, 0], handR: [-60, 0, 0],
        thighL: [-14, 0, 18], kneeL: [16, 0, 0], thighR: [-6, 0, -18], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    jb_slapW: {
      root: { y: -0.01 }, spine: [0, 32, 0], chest: [0, 26, 0], head: [0, -24, 0],
      shoulderR: [-60, 0, -110], elbowR: [-30, 0, 0], shoulderL: [-20, 0, 46], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 16], kneeL: [16, 0, 0], thighR: [8, 0, -16], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    jb_slap: {
      root: { y: -0.02 }, spine: [4, -36, 0], chest: [4, -32, 0], head: [-4, 24, 0],
      shoulderR: [-92, 0, 22], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 46], elbowL: [-40, 0, 0],
      thighL: [-18, 0, 16], kneeL: [22, 0, 0], thighR: [10, 0, -16], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    jb_bumpW: {
      root: { y: -0.02, rx: -16 }, spine: [-20, 0, 0], chest: [-12, 0, 0], head: [10, 0, 0],
      shoulderL: [30, 0, 46], elbowL: [-20, 0, 0], shoulderR: [30, 0, -46], elbowR: [-20, 0, 0],
      thighL: [-6, 0, 16], kneeL: [18, 0, 0], thighR: [10, 0, -16], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    jb_bump: {
      root: { y: 0.03, rx: 18 }, spine: [18, 0, 0], chest: [4, 0, 0], head: [-16, 0, 0],
      shoulderL: [40, 0, 56], elbowL: [-10, 0, 0], shoulderR: [40, 0, -56], elbowR: [-10, 0, 0],
      thighL: [-34, 0, 16], kneeL: [30, 0, 0], thighR: [16, 0, -16], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    // the belly flop: from above, arms and legs spread like a starfish
    jb_flopW: { root: { y: 0.04, rx: -14 }, spine: [-12, 0, 0], chest: [-8, 0, 0], head: [-16, 0, 0], shoulderL: [-160, 0, 40], elbowL: [-20, 0, 0], shoulderR: [-160, 0, -40], elbowR: [-20, 0, 0], thighL: [-30, 0, 30], kneeL: [40, 0, 0], thighR: [-30, 0, -30], kneeR: [40, 0, 0], hands: ['open', 'open'] },
    jb_flop: { root: { y: -0.1, rx: 40 }, spine: [20, 0, 0], chest: [10, 0, 0], head: [-30, 0, 0], shoulderL: [-90, 0, 80], elbowL: [-10, 0, 0], shoulderR: [-90, 0, -80], elbowR: [-10, 0, 0], thighL: [10, 0, 34], kneeL: [10, 0, 0], thighR: [10, 0, -34], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    // the spheres: a little wind-up like a child throwing a ball, then a toss from both hands
    jb_throwW: { root: { y: -0.02, rx: -8 }, spine: [-12, 20, 0], chest: [-10, 16, 0], head: [-6, -14, 0], shoulderR: [-160, 0, -30], elbowR: [-60, 0, 0], shoulderL: [-120, 0, 40], elbowL: [-50, 0, 0], thighL: [-10, 0, 16], kneeL: [16, 0, 0], thighR: [6, 0, -16], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    jb_throw: { root: { y: -0.02, rx: 12 }, spine: [12, -16, 0], chest: [10, -12, 0], head: [-10, 10, 0], shoulderR: [-70, 0, -10], elbowR: [-10, 0, 0], shoulderL: [-70, 0, 20], elbowL: [-14, 0, 0], thighL: [-20, 0, 16], kneeL: [24, 0, 0], thighR: [10, 0, -16], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    // the Dimension Punch: the arm goes in up to the shoulder
    jb_punchW: { root: { y: -0.04 }, spine: [4, 30, 0], chest: [4, 34, 0], head: [-6, -26, 0], shoulderR: [-30, 0, -50], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 40], elbowL: [-60, 0, 0], thighL: [-16, 0, 16], kneeL: [20, 0, 0], thighR: [10, 0, -16], kneeR: [14, 0, 0], hands: ['fist', 'fist'] },
    jb_punch: { root: { y: -0.06, rx: 10 }, spine: [10, -26, 0], chest: [8, -30, 0], head: [-8, 22, 0], shoulderR: [-92, 0, -2], elbowR: [-2, 0, 0], shoulderL: [-30, 0, 46], elbowL: [-50, 0, 0], thighL: [-26, 0, 16], kneeL: [30, 0, 0], thighR: [14, 0, -16], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
    // "Oooooo!": arms up and wobbling over his head, delighted
    jb_ooo: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: 0.03 + Math.abs(b) * 0.05, rz: b * 5 }, spine: [-10, 0, b * 4], chest: [-8, 0, 0], head: [-20, b * 10, 0],
        shoulderL: [-160 + b * 16, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-160 - b * 16, 0, -40], elbowR: [-30, 0, 0],
        thighL: [-14 - b * 12, 0, 18], kneeL: [22, 0, 0], thighR: [-14 + b * 12, 0, -18], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the Kamehameha has him: squeezed, curled up, the shell straining
    jb_compress: (t) => {
      const s = Math.sin(t * 40) * 2;
      return {
        root: { y: -0.3, rx: 24 }, spine: [30, 0, s], chest: [24, 0, 0], head: [26, 0, 0],
        shoulderL: [-110, 0, 20], elbowL: [-140, 0, 0], shoulderR: [-110, 0, -20], elbowR: [-140, 0, 0],
        thighL: [-100, 0, 20], kneeL: [120, 0, 0], thighR: [-100, 0, -20], kneeR: [120, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // ...and the shell giving: arms flung out, head back, cracking
    jb_crack: (t) => {
      const s = Math.sin(t * 50) * 3;
      return {
        root: { y: -0.04, rx: -12 }, spine: [-16, 0, s], chest: [-18, 0, 0], head: [-34, 0, 0],
        shoulderL: [-90, 0, 80 + s], elbowL: [-6, 0, 0], shoulderR: [-90, 0, -80 - s], elbowR: [-6, 0, 0],
        thighL: [-20, 0, 26], kneeL: [20, 0, 0], thighR: [-20, 0, -26], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a tantrum: stamping, fists going
    jb_tantrum: (t) => {
      const b = Math.sin(t * 16);
      return {
        root: { y: Math.abs(b) * 0.04 }, spine: [8, 0, b * 6], chest: [6, 0, 0], head: [10, 0, -b * 8],
        shoulderL: [-40 + b * 50, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-40 - b * 50, 0, -30], elbowR: [-60, 0, 0],
        thighL: [-30 - b * 30, 0, 16], kneeL: [40 + Math.max(0, b) * 40, 0, 0], thighR: [-30 + b * 30, 0, -16], kneeR: [40 + Math.max(0, -b) * 40, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    jb_sulk: { root: { y: -0.4, rx: -4 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [24, 0, 0], shoulderL: [10, 0, 34], elbowL: [-20, 0, 0], shoulderR: [10, 0, -34], elbowR: [-20, 0, 0], thighL: [-86, 0, 20], kneeL: [20, 0, 0], thighR: [-86, 0, -20], kneeR: [20, 0, 0], hands: ['fist', 'fist'] },
    jb_float: (t) => {
      const b = Math.sin(t * 2.4);
      return { root: { y: 0.04 * b }, spine: [-4, 0, 0], head: [-6, b * 8, 6], shoulderL: [-20, 0, 60], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -60], elbowR: [-30, 0, 0], thighL: [-30, 0, 20], kneeL: [40, 0, 0], thighR: [-30, 0, -20], kneeR: [40, 0, 0], hands: ['open', 'open'] };
    },
  };
  SL.data.characters.janemba = {
    id: 'janemba', assetLevel: 1, name: 'Janemba', fullName: 'Janemba (Fusion Reborn)', era: 'Movie',
    playable: true, prototype: true, style: 'Reality Warper (Child)', // Free Battle after the movie's "Janemba" (unlocks.js)
    blurb: 'A million souls\' worth of evil with the mind of a toddler. He plays. Space bends while he does it.',
    ratings: { power: 4, speed: 3, ki: 4, defense: 4 },
    stats: { hp: 36000, ki: 160, stamina: 200, speed: 0.98, power: 1.3, defense: 1.1, weight: 0.9, kiRegen: 3, chargeRate: 30, canonPower: 6 },
    poise: { max: 170, armor: 1, regen: 24, regenDelay: 70, breakFrames: 70, vulnerable: 1.3, beamMul: 1.2, cost: { 1: 8, 2: 16, 3: 28, 4: 44 } },
    appearance: {
      height: 2.3,
      skin: YELLOW,
      build: {
        hipY: 0.66, pelvisW: 0.27, pelvisH: 0.13, pelvisD: 0.24,
        waistW: 0.38, waistD: 0.37, absLen: 0.24,
        chestW: 0.34, chestD: 0.3, chestTop: 0.22, shoulderX: 0.31, shoulderY: 0.17, delt: 0.11,
        upperArmLen: 0.22, upperArmR: 0.092, foreArmLen: 0.2, foreArmR: 0.084, fist: 0.084,
        hipX: 0.14, thighLen: 0.28, thighR: 0.13, shinLen: 0.26, shinR: 0.1,
        neckLen: 0.03, neckR: 0.1, headR: 0.142, footLen: 1.2,
      },
      hair: { style: 'bald', color: YELLOW },
      headExtras: [
        // two little horns
        { a: [0.5, 0.86, 0.1], d: [0.35, 1, 0], l: 0.095, r: 0.036, color: HORN, depth: 0.96 },
        { a: [-0.5, 0.86, 0.1], d: [-0.35, 1, 0], l: 0.095, r: 0.036, color: HORN, depth: 0.96 },
        // the round purple patches on his crown and cheeks (the markings of the vest, carried up)
        { shape: 'ball', a: [0, 1, -0.2], d: [0, 1, 0], l: 0.02, r: 0.06, color: VIOLET2, depth: 0.99, flat: 0.35, outline: 0 },
      ],
      face: { noEars: true, pupil: 0x140a1a, eyeW: 0.62, eyeH: 0.8, browThick: 0.7, brow: 0xc89a2a },
      outfit: {
        // the purple "vest": open down the middle so the yellow belly shows
        topStyle: 'bare', top: YELLOW, arms: YELLOW,
        jacket: { color: VIOLET, collar: VIOLET2, open: 1.55, short: true },
        belly: true,
        pants: YELLOW, pantsStyle: 'gi',
        // (the belt sits under the belly, round the top of the trousers — at the waist it stood out of his sides like a
        // hoop; 2026-10-15, as Majin Buu's)
        belt: VIOLET, beltStyle: 'sash', beltAt: -0.12, beltFit: 0.8,
        wrist: VIOLET, wristLen: 0.14,
        boots: VIOLET, bootStyle: 'gi',
      },
      portraitColor: '#f2c63a',
    },
    vfx: { ghost: 0xd24aff, trail: 0xff8ad8 },
    audio: { strikePitch: 0.82, heavyPitch: 0.7 },
    forms: [{ id: 'base', name: 'Janemba', aura: { color: 0xd24aff, core: 0xffd0f8, particles: 0xff8ad8, idle: 0, speed: 1.1 }, mult: {} }],
    poses: Object.assign({ idle: jb.jb_idle, flyIdle: jb.jb_float, flyForward: jb.jb_float }, jb),
    sequences: {
      intro: [{ pose: 'jb_giggle', dur: 0.8, speed: 8, expression: 'grin' }, { pose: 'jb_clap', dur: 0.9, speed: 9, expression: 'grin' }],
      victory: [[{ pose: 'jb_ooo', dur: 9, speed: 6, expression: 'grin' }]],
      defeat: [{ pose: 'jb_sulk', dur: 9, speed: 4, expression: 'hurt' }],
    },
    moves: {
      light: [
        { id: 'jbSlap', startup: 7, active: 4, recovery: 13, cancel: 8, damage: 520, reach: 1.35, radius: 1.0, lunge: 10, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'jb_slapW', strike: 'jb_slap' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'jbBump', startup: 9, active: 4, recovery: 15, cancel: 9, damage: 620, reach: 1.25, radius: 1.1, lunge: 12, hitstun: 24, knock: 'push', knockSpeed: 13, impact: 2, pose: { wind: 'jb_bumpW', strike: 'jb_bump' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        // the third hit comes late: a child's timing (the delay is the trick)
        { id: 'jbSlap2', startup: 15, active: 4, recovery: 16, cancel: 10, damage: 700, reach: 1.35, radius: 1.0, lunge: 12, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'jb_slapW', strike: 'jb_slap' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
      ],
      heavy: {
        // the belly flop — he hops through a door and comes down on you from above
        0: { id: 'jbFlop', startup: 18, active: 6, recovery: 30, damage: 1700, reach: 1.6, radius: 1.5, lunge: 14, hitstun: 36, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 45, teleport: { to: 'above', at: 6 }, pose: { wind: 'jb_flopW', strike: 'jb_flop' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'jbBehind', startup: 12, active: 4, recovery: 22, damage: 1100, reach: 1.3, radius: 1.1, lunge: 10, hitstun: 32, knock: 'heavy', knockSpeed: 22, impact: 3, teleport: { to: 'behind', at: 5 }, pose: { wind: 'jb_bumpW', strike: 'jb_bump' }, sfx: 'punchHeavy', hitPose: 'hitBack' },
      },
      dash: { id: 'jbRoll', startup: 8, active: 8, recovery: 18, damage: 900, reach: 1.3, radius: 1.2, lunge: 28, hitstun: 26, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'jb_bumpW', strike: 'jb_bump' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    specials: {
      special1: {
        id: 'jbSpheres', name: 'Janemba Spheres', type: 'projectile', kiCost: 24, icon: 'ball', cooldown: 150,
        startup: 22, recovery: 26, pose: { wind: 'jb_throwW', release: 'jb_throw' },
        projectile: { kind: 'ball', count: 5, spread: 0.7, speed: 24, radius: 0.34, damage: 520, homing: 0.55, color: 0xff6ad8, core: 0xffe8fa, explode: 1.4, knock: 'push', knockSpeed: 10, impact: 2, life: 3.4 },
      },
      special2: {
        id: 'jbDoor', name: 'Dimension Door', type: 'portalGuard', kiCost: 16, icon: 'guard', cooldown: 240,
        startup: 22, frames: 110, recovery: 14, poses: { tell: 'jb_doorW', hold: 'jb_door' },
      },
      ultimate: {
        id: 'jbPunch', name: 'Dimension Punch', type: 'portalStrike', kiCost: 40, icon: 'fist', cooldown: 220,
        windup: 34, reach: 1.5, radius: 1.25, damage: 2200, knockSpeed: 26, recovery: 26, color: 0xff6ad8, poses: { wind: 'jb_punchW', strike: 'jb_punch' },
      },
    },
    dimension: { portal: { redirectMul: 0.45, front: 0.2, max: 1 }, elastic: { squash: 0.5, bounce: 7 }, doors: true },
    mechanic: { type: 'dimensional', name: 'Dimensional Child', desc: 'A portal in front of him sends a blow back into your own back — go round him or wait. He bounces when he lands, and he hops through space to drop on you.' },
    boss: {
      phases: [
        // playing: lots of giggling, doors and spheres, the odd hop
        { id: 'play', label: 'PLAYING', hpAbove: 0.5, damage: 1, speed: 1, patience: 1.15, patterns: { melee: 1, door: 0.55, spheres: 0.45, punch: 0.3 } },
        // a tantrum: faster, closer, meaner
        { id: 'tantrum', label: 'TANTRUM', hpAbove: 0, damage: 1.12, speed: 1.1, patience: 0.8, patterns: { melee: 1.25, door: 0.6, spheres: 0.55, punch: 0.5 } },
      ],
      patterns: {
        door: { slot: 'special2', cooldown: 280, maxDist: 9 },
        spheres: { slot: 'special1', cooldown: 220, minDist: 4 },
        punch: { slot: 'ultimate', cooldown: 300, minDist: 2.5, maxDist: 18 },
      },
    },
    ai: { personality: 'boss', aggression: 0.7, defense: 0.45, ranged: 0.35, beam: 0, transformHp: 0, preferredRange: 3, hooks: 'janemba', patternBreath: 30 },
    barks: {},
    intro: { pose: 'jb_giggle', expression: 'grin' },
    victory: { poses: ['jb_ooo'], expression: 'grin' },
    defeat: { pose: 'jb_sulk', expression: 'hurt' },
  };

  /* ======================================================================== SUPER JANEMBA */
  // (2026-10-15 pass, the board p.69: the armour is a bright lilac-violet, not a dull plum)
  const RED = 0xc8282a, ARMOR = 0x8a58c8, ARMOR2 = 0x6a3aa8, WHITE = 0xf0eee6;
  const D = (SL.data.characters.dabura && SL.data.characters.dabura.poses) || {};
  const sj = {
    // controlled: side-on, the sword low and back, the free hand open, the head down and level
    sj_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.06 + b * 0.006, rx: 4 }, hips: [0, -26, 0], spine: [4, 12, 0], chest: [2, 16, 0], head: [6, -18, 0],
        shoulderR: [-10, 16, -26], elbowR: [-30, 0, 0], handR: [0, 0, 20], shoulderL: [-50, 0, 30], elbowL: [-70, 0, 0],
        thighL: [-24, 18, 14], kneeL: [30 + b * 2, 0, 0], thighR: [14, -16, -14], kneeR: [26 + b * 2, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    sj_float: (t) => {
      const s = Math.sin(t * 2);
      return { root: { y: 0.03 * s, rx: 6 }, spine: [6, 10, 0], chest: [4, 12, 0], head: [4, -10, 0], shoulderR: [-14, 16, -24], elbowR: [-24, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-60, 0, 0], thighL: [-30 + s * 3, 0, 8], kneeL: [56, 0, 0], footL: [30, 0, 0], thighR: [-6 - s * 3, 0, -6], kneeR: [24, 0, 0], footR: [40, 0, 0], hands: ['open', 'fist'] };
    },
    // the reveal: straightening up out of the shell, arms loose, the head coming up slowly
    sj_rise: (t) => {
      const b = Math.sin(t * 1.4);
      return { root: { y: -0.02 }, spine: [6, 0, 0], chest: [4 + b, 0, 0], neck: [6, 0, 0], head: [14, 0, 0], shoulderL: [-6, 0, 18], elbowL: [-20, 0, 0], shoulderR: [-6, 0, -18], elbowR: [-20, 0, 0], thighL: [-4, 0, 12], kneeL: [8, 0, 0], thighR: [-4, 0, -12], kneeR: [8, 0, 0], hands: ['open', 'open'] };
    },
    // pulling the blade out of the spike on his head
    sj_draw: {
      root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-8, -10, 0], head: [10, 10, 0],
      shoulderR: [-176, -20, -20], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-40, 0, 0],
      thighL: [-6, 4, 12], kneeL: [10, 0, 0], thighR: [4, -4, -12], kneeR: [10, 0, 0],
      hands: ['open', 'fist'],
    },
    // the sword brought down and out to the side: presenting it
    sj_present: {
      root: { y: -0.06 }, hips: [0, -14, 0], spine: [2, 10, 0], chest: [0, 12, 0], head: [8, -12, 0],
      shoulderR: [-40, 0, -70], elbowR: [-10, 0, 0], handR: [0, 0, 30], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0],
      thighL: [-20, 12, 14], kneeL: [26, 0, 0], thighR: [10, -12, -14], kneeR: [20, 0, 0],
      hands: ['open', 'fist'],
    },
    sj_slashW: Object.assign({}, D.db_slashW || C.punchWindR),
    sj_slash: Object.assign({}, D.db_slash || C.punchR),
    sj_thrustW: Object.assign({}, D.db_thrustW || C.punchWindR),
    sj_thrust: Object.assign({}, D.db_thrust || C.punchR),
    sj_overheadW: Object.assign({}, D.db_overheadW || C.hammerWind),
    sj_overhead: Object.assign({}, D.db_overhead || C.hammer),
    // the backhand: the blade comes back across the other way
    sj_backW: {
      root: { y: -0.06 }, hips: [0, 20, 0], spine: [4, -30, 0], chest: [2, -36, 0], head: [-4, 30, 0],
      shoulderR: [-80, 0, 40], elbowR: [-110, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0],
      thighL: [-20, 10, 14], kneeL: [26, 0, 0], thighR: [12, -10, -14], kneeR: [20, 0, 0],
      hands: ['open', 'fist'],
    },
    sj_back: {
      root: { y: -0.08, rx: 6 }, hips: [0, -26, 0], spine: [8, 30, 0], chest: [6, 40, 0], head: [-6, -30, 0],
      shoulderR: [-70, 0, -100], elbowR: [-6, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0],
      thighL: [-30, 10, 14], kneeL: [36, 0, 0], thighR: [16, -10, -14], kneeR: [16, 0, 0],
      hands: ['open', 'fist'],
    },
    // the dimensional slash: a wide flat cut that throws a crescent
    sj_waveW: { root: { y: -0.1 }, hips: [0, 30, 0], spine: [6, -40, 0], chest: [4, -44, 0], head: [-6, 36, 0], shoulderR: [-60, 0, 80], elbowR: [-40, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-70, 0, 0], thighL: [-30, 10, 16], kneeL: [40, 0, 0], thighR: [16, -10, -16], kneeR: [24, 0, 0], hands: ['open', 'fist'] },
    sj_wave: { root: { y: -0.12, rx: 8 }, hips: [0, -36, 0], spine: [8, 40, 0], chest: [6, 50, 0], head: [-6, -40, 0], shoulderR: [-90, 0, -90], elbowR: [-4, 0, 0], shoulderL: [-30, 0, 50], elbowL: [-50, 0, 0], thighL: [-40, 10, 16], kneeL: [44, 0, 0], thighR: [20, -10, -16], kneeR: [14, 0, 0], hands: ['open', 'fist'] },
    // the claw through a portal: the free arm driven forward into the hole
    sj_clawW: { root: { y: -0.06 }, spine: [6, 20, 0], chest: [4, 26, 0], head: [-4, -20, 0], shoulderL: [-40, 0, 70], elbowL: [-110, 0, 0], shoulderR: [-10, 16, -30], elbowR: [-30, 0, 0], thighL: [-20, 10, 14], kneeL: [26, 0, 0], thighR: [12, -10, -14], kneeR: [20, 0, 0], hands: ['open', 'fist'] },
    sj_claw: { root: { y: -0.08, rx: 10 }, spine: [10, -16, 0], chest: [8, -22, 0], head: [-8, 18, 0], shoulderL: [-92, 0, 4], elbowL: [-4, 0, 0], handL: [-50, 0, 0], shoulderR: [-10, 16, -30], elbowR: [-30, 0, 0], thighL: [-30, 10, 14], kneeL: [36, 0, 0], thighR: [16, -10, -14], kneeR: [14, 0, 0], hands: ['open', 'fist'] },
    // reassembled: arriving low, already turning to strike
    sj_phantom: { root: { y: -0.12, rx: 10 }, hips: [0, -20, 0], spine: [10, 16, 0], chest: [8, 20, 0], head: [-6, -16, 0], shoulderR: [-30, 0, -60], elbowR: [-40, 0, 0], shoulderL: [-50, 0, 40], elbowL: [-60, 0, 0], thighL: [-40, 10, 16], kneeL: [56, 0, 0], thighR: [10, -10, -16], kneeR: [40, 0, 0], hands: ['open', 'fist'] },
    // the sword caught between two fingers: he leans into it and it will not move
    sj_caught: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return { root: { y: -0.1, rx: 12 }, hips: [0, -10, 0], spine: [12, 10, 0], chest: [10, 12, 0], head: [-4, -8, s], shoulderR: [-92, 0, -20 + s], elbowR: [-20, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-60, 0, 0], thighL: [-40, 10, 16], kneeL: [50, 0, 0], thighR: [20, -10, -16], kneeR: [20, 0, 0], hands: ['open', 'fist'] };
    },
    // staggering, empty-handed after the blade broke
    sj_reel: (t) => {
      const b = Math.sin(t * 8);
      return { root: { y: -0.04, rx: -10 }, spine: [-14, 0, b * 4], chest: [-14, 0, 0], head: [-20, b * 10, 0], shoulderL: [-40, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -60], elbowR: [-40, 0, 0], thighL: [-14, 0, 16], kneeL: [20, 0, 0], thighR: [10, 0, -16], kneeR: [14, 0, 0], hands: ['open', 'open'] };
    },
    // the roar
    sj_roar: (t) => {
      const s = Math.sin(t * 40) * 2;
      return { root: { y: -0.14, rx: -6 }, spine: [-10, 0, 0], chest: [-16 + s, 0, 0], neck: [-8, 0, 0], head: [-18, 0, 0], shoulderL: [10, 0, 50 + s], elbowL: [-30, 0, 0], shoulderR: [10, 0, -50 - s], elbowR: [-30, 0, 0], thighL: [-30, 0, 26], kneeL: [50, 0, 0], thighR: [-30, 0, -26], kneeR: [50, 0, 0], hands: ['fist', 'fist'] };
    },
    // tumbling end over end through the air after the double palm, limbs flung out
    sj_tumble: (t) => {
      const s = Math.sin(t * 9);
      return { root: { y: 0.6, rx: (t * 620) % 360, rz: 18 }, spine: [-20, 0, s * 8], chest: [-16, 0, 0], head: [-24, s * 14, 0], shoulderL: [-120, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-60, 0, -80], elbowR: [-40, 0, 0], thighL: [-50, 0, 30], kneeL: [60, 0, 0], thighR: [10, 0, -20], kneeR: [30, 0, 0], hands: ['open', 'open'] };
    },
    // frozen where the dust hit him, trying to scream: arms flung out, chest open, the face to the front
    sj_scream: (t) => {
      const s = Math.sin(t * 34) * 1.5;
      return { root: { y: 0, rx: -6 }, spine: [-8, 0, s], chest: [-10, 0, 0], neck: [-2, 0, 0], head: [-6, 0, s], shoulderL: [-60, 0, 70], elbowL: [-14, 0, 0], shoulderR: [-60, 0, -70], elbowR: [-14, 0, 0], thighL: [-8, 0, 12], kneeL: [14, 0, 0], thighR: [-8, 0, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] };
    },
    // the purification takes him: arms out, head back, coming apart into light
    sj_purify: (t) => {
      const s = Math.sin(t * 30) * 2;
      return { root: { y: 0.02, rx: -14 }, spine: [-16, 0, s], chest: [-20, 0, 0], neck: [-10, 0, 0], head: [-26, 0, 0], shoulderL: [-70, 0, 80], elbowL: [-10, 0, 0], shoulderR: [-70, 0, -80], elbowR: [-10, 0, 0], thighL: [-10, 0, 14], kneeL: [16, 0, 0], thighR: [-10, 0, -14], kneeR: [16, 0, 0], hands: ['open', 'open'] };
    },
  };
  const smove = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 5, active: 4, recovery: 12, cancel: 7, damage: dmg, reach: 1.95, radius: 0.95, lunge: 13, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind, strike }, sfx: 'swordSlash', hitPose: 'hitSideL' }, extra);
  SL.data.characters.super_janemba = {
    id: 'super_janemba', assetLevel: 1, name: 'Super Janemba', fullName: 'Super Janemba (Fusion Reborn)', era: 'Movie',
    playable: true, prototype: true, style: 'Dimensional Swordsman', // a separate fighter (the owner's reference: the two forms are separate states); Free Battle after "The Ultimate Fusion"
    blurb: 'What the child was hiding: a demon of pure evil energy who cuts through space with a sword pulled out of his own head. He reads you, and he is never where you hit.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 5 },
    stats: { hp: 40000, ki: 180, stamina: 220, speed: 1.3, power: 1.75, defense: 1.4, weight: 1.05, kiRegen: 3.5, chargeRate: 40, canonPower: 9 },
    poise: { max: 140, armor: 1, regen: 30, regenDelay: 60, breakFrames: 60, vulnerable: 1.25, beamMul: 1.1, cost: { 1: 8, 2: 15, 3: 26, 4: 40 } },
    appearance: {
      height: 1.1,
      skin: RED,
      build: { chestW: 0.2, chestD: 0.14, shoulderX: 0.21, waistW: 0.11, waistD: 0.1, pelvisW: 0.12, upperArmR: 0.05, foreArmR: 0.046, fist: 0.05, thighR: 0.072, shinR: 0.056, headR: 0.118, neckLen: 0.06, neckR: 0.05, footLen: 1.08 },
      hair: { style: 'bald', color: ARMOR },
      headExtras: [
        // the dull-purple armoured headpiece over the crown, a ridge down the middle, the spike at the back
        { shape: 'ball', a: [0, 1, -0.15], d: [0, 1, 0], l: 0.13, r: 0.128, color: ARMOR, depth: 0.62, flat: 1.05, outline: 0.9 },
        { a: [0, 0.98, 0.35], d: [0, 0.5, 1], l: 0.09, r: 0.03, color: ARMOR2, depth: 1.0, outline: 0.7 },
        { a: [0, 0.8, -0.6], d: [0, 0.7, -0.7], l: 0.24, r: 0.035, color: ARMOR2, depth: 1.0, outline: 0.7 },
        // the two great horns of the helmet: out of the sides of the head and curving up and back in one sweep, violet
        // like the helmet (curved locks, `bend`; they were two straight bone-white segments each)
        { a: [0.9, 0.42, -0.05], d: [1, 0.75, -0.15], l: 0.36, r: 0.055, color: ARMOR, depth: 0.98, outline: 0.7, bend: 1.0, toward: [0, 1, -0.4] },
        { a: [-0.9, 0.42, -0.05], d: [-1, 0.75, -0.15], l: 0.36, r: 0.055, color: ARMOR, depth: 0.98, outline: 0.7, bend: 1.0, toward: [0, 1, -0.4] },
        // the pointed red ears under them
        { a: [0.95, 0.05, 0.1], d: [1, 0.35, -0.2], l: 0.07, r: 0.02, color: RED, depth: 0.98, flat: 0.4, outline: 0.5 },
        { a: [-0.95, 0.05, 0.1], d: [-1, 0.35, -0.2], l: 0.07, r: 0.02, color: RED, depth: 0.98, flat: 0.4, outline: 0.5 },
      ],
      // yellow eyes with small dark pupils, a heavy brow
      face: { noEars: true, sclera: 0xffd83a, pupil: 0x140a0a, eyeW: 0.95, eyeH: 0.82, browThick: 1.3, brow: 0x7a1414, jaw: 1.05 },
      outfit: {
        topStyle: 'bare', top: RED, arms: RED,
        // (the board: the violet armour over the chest and shoulders, white wraps round the upper arms and the
        // forearms, violet baggy trousers, white wraps round the shins, violet hooves, the long red tail with its white
        // segmented point — the trousers were red and tight, there was no tail and the horns were bone-white)
        armor: { plate: ARMOR, belly: RED, pads: ARMOR, padStyle: 'up', trim: ARMOR2 },
        armBands: WHITE, armBandAt: 0.55, armBandW: 0.09, armBandR: 1.12,
        wrist: WHITE, wristLen: 0.14,
        pants: ARMOR, pantsStyle: 'gi',
        belt: ARMOR2, beltStyle: 'belt',
        boots: WHITE, bootTop: 0.62, shoes: ARMOR, bootStyle: 'gi', bootTip: ARMOR2,
        longTail: { color: RED, segments: 10, length: 1.25, radius: 0.045, lift: 0.85, curl: 0.3, tip: WHITE },
      },
      props: [
        { id: 'sword', shape: 'dimSword', joint: 'handR', pos: [0, -0.05, 0.012], rot: [2.25, 0, 0], length: 1.35 },
      ],
      portraitColor: '#c8282a',
    },
    vfx: { ghost: 0xff5a8a, trail: 0xff3a5a },
    audio: { strikePitch: 0.92, heavyPitch: 0.8 },
    forms: [{ id: 'base', name: 'Super Janemba', look: { pupilScale: 0.55 }, aura: { color: 0xff3a6a, core: 0xffc0d0, particles: 0xd24aff, idle: 0, speed: 1.2, sharp: 0.3 }, mult: {} }],
    poses: Object.assign({ idle: sj.sj_idle, flyIdle: sj.sj_float }, sj),
    sequences: {
      intro: [{ pose: 'sj_rise', dur: 0.7, speed: 4, expression: 'calm' }, { pose: 'sj_present', dur: 0.9, speed: 8, expression: 'wicked' }],
      victory: [[{ pose: 'sj_present', dur: 9, speed: 4, expression: 'wicked' }]],
      defeat: [{ pose: 'sj_reel', dur: 9, speed: 4, expression: 'hurt' }],
    },
    moves: {
      light: [
        smove('sjSlash', 760, 'sj_slashW', 'sj_slash'),
        smove('sjBack', 800, 'sj_backW', 'sj_back', { hitPose: 'hitSideR' }),
        smove('sjThrust', 900, 'sj_thrustW', 'sj_thrust', { reach: 2.2, radius: 0.7, lunge: 15, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: smove('sjCleave', 2200, 'sj_overheadW', 'sj_overhead', { startup: 12, active: 5, recovery: 22, radius: 1.1, knock: 'smash', knockSpeed: 30, impact: 4, hitstun: 36, guardCrush: true, guardDamage: 55, hitPose: 'hitHeavy' }),
        // through a door: he is behind you as the blade lands
        1: smove('sjDoorCut', 1600, 'sj_backW', 'sj_back', { startup: 10, recovery: 20, knock: 'heavy', knockSpeed: 24, impact: 3, hitstun: 32, teleport: { to: 'behind', at: 4 }, hitPose: 'hitBack' }),
        2: smove('sjRising', 1500, 'sj_slashW', 'sj_slash', { startup: 9, recovery: 20, knock: 'launch', knockSpeed: 22, impact: 3, hitstun: 32, hitPose: 'hitBody' }),
      },
      dash: smove('sjLunge', 1500, 'sj_thrustW', 'sj_thrust', { startup: 6, active: 7, recovery: 18, reach: 2.3, radius: 0.85, lunge: 32, knock: 'heavy', knockSpeed: 24, impact: 3, hitstun: 28, hitPose: 'hitBody' }),
    },
    specials: {
      // the dimensional slash: a flat cut throws a crescent of red space
      special1: {
        id: 'sjWave', name: 'Dimension Slash', type: 'projectile', kiCost: 24, icon: 'rush', cooldown: 130,
        startup: 16, recovery: 22, pose: { wind: 'sj_waveW', release: 'sj_wave' },
        projectile: { kind: 'disc', speed: 74, radius: 0.55, damage: 1500, homing: 0.18, color: 0xff2a4a, core: 0xffd0d8, explode: 1.8, knock: 'heavy', knockSpeed: 22, impact: 3, life: 1.6 },
      },
      // PHANTOM SHIFT as an attack: come apart, arrive at your side
      special2: {
        id: 'sjPhantom', name: 'Phantom Shift', type: 'phantomShift', kiCost: 14, icon: 'teleport', cooldown: 160,
        frames: 24, appearAt: 18, dist: 1.9, recovery: 4, mode: 'side', pose: 'sj_phantom',
      },
      // the claw through a portal (Rakshasa's Claw): the exit opens beside you first
      ultimate: {
        id: 'sjClaw', name: 'Rakshasa\'s Claw', type: 'portalStrike', kiCost: 40, icon: 'fist', cooldown: 200,
        windup: 26, reach: 1.4, radius: 1.15, damage: 2600, knockSpeed: 30, recovery: 22, color: 0xff3a5a, poses: { wind: 'sj_clawW', strike: 'sj_claw' },
      },
    },
    dimension: { phantom: { repeat: 3, combo: 5, cooldown: 110, spec: { frames: 22, appearAt: 16, dist: 1.8, recovery: 3, pose: 'sj_phantom' } }, doors: true },
    mechanic: { type: 'dimensional', name: 'Phantom Shift', desc: 'He punishes the predictable: the same strike three times, or a string held too long, and he comes apart into cubes and is behind you. Vary your attacks; break the rhythm.' },
    boss: {
      phases: [
        { id: 'blade', label: 'THE BLADE', hpAbove: 0.45, damage: 1, speed: 1, patience: 0.95, patterns: { melee: 1.2, wave: 0.45, claw: 0.4, shift: 0.35 } },
        { id: 'demon', label: 'DEMON', hpAbove: 0, damage: 1.12, speed: 1.1, patience: 0.75, patterns: { melee: 1.3, wave: 0.55, claw: 0.55, shift: 0.45 } },
      ],
      patterns: {
        wave: { slot: 'special1', cooldown: 200, minDist: 4.5 },
        claw: { slot: 'ultimate', cooldown: 260, minDist: 3, maxDist: 20 },
        shift: { slot: 'special2', cooldown: 220, minDist: 2, maxDist: 16 },
      },
    },
    ai: { personality: 'boss', aggression: 0.85, defense: 0.7, ranged: 0.4, beam: 0, transformHp: 0, preferredRange: 2.2, hooks: 'super_janemba', patternBreath: 18 },
    barks: {},
    intro: { pose: 'sj_present', expression: 'wicked' },
    victory: { poses: ['sj_present'], expression: 'wicked' },
    defeat: { pose: 'sj_reel', expression: 'hurt' },
  };
})();
