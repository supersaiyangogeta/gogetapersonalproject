/*
 * GINYU FORCE — Frieza's elite squad, built one member at a time as the story
 * reaches them (canon order: Guldo, Recoome, Burter, Jeice, Captain Ginyu).
 *
 * GULDO (first): the weakest fighter on the field and the most dangerous thing
 * in it for a few seconds. He cannot win a trade with anyone, so he does not
 * trade — he stops time while he holds his breath, pins people with telekinesis
 * and throws whatever the planet gives him. Every one of his techniques ends
 * with him gasping and wide open: his identity is "the window", not "the fight".
 * PROTOTYPE body (Level 1) on the shared procedural rig.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const GULDO_SKIN = 0x7fb86a;
  const GULDO_DARK = 0x4a7a3a;
  // the Ginyu Force's battle armour, from the owner's visual reference (p.12-18): the big ribbed shoulder pads, the
  // belly plate and the hip guards are BROWN for all five, edged in white; the chest is white (dark navy for the
  // captain and for Burter) over a black bodysuit. It used to be a different pad colour for each, on white
  const GF_BROWN = 0x8a4c20, GF_EDGE = 0xeceae4, GF_BLACK = 0x1c1c24, GF_NAVY = 0x23284a, GF_WHITE = 0xf2eee2;
  const gfArmor = (plate, hips) => Object.assign({ plate, belly: GF_BROWN, pads: GF_BROWN, padStyle: 'saga', trim: GF_EDGE }, hips ? { hipGuards: GF_BROWN } : {});
  const ARMOR = gfArmor(GF_WHITE, false);

  // the upper pair of eyes: two whites with dark pupils sitting above the normal ones
  const eye = (x, y, z, r, color) => ({ shape: 'ball', a: [x, y, z], d: [x, y, 1], l: 0.012, r, color, depth: 0.99, flat: 0.6, outline: 0.25 });

  const guldoPoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.8);
      return {
        root: { y: -0.12 + b * 0.012 }, hips: [0, -8, 0], spine: [6, 0, 0], chest: [8, 4, 0], head: [-6, 0, 0],
        shoulderL: [-18, 0, 44], elbowL: [-78, 0, 0], shoulderR: [-18, 0, -44], elbowR: [-78, 0, 0],
        thighL: [-16, 12, 22], kneeL: [30, 0, 0], thighR: [12, -12, -22], kneeR: [26, 0, 0],
        hands: ['open', 'open'],
      };
    },
    gd_slapW: {
      root: { y: -0.12 }, spine: [4, 20, 0], chest: [6, 30, 0], head: [-4, -24, 0],
      shoulderR: [-40, 0, -50], elbowR: [-92, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-70, 0, 0],
      thighL: [-14, 12, 22], kneeL: [28, 0, 0], thighR: [10, -12, -22], kneeR: [24, 0, 0],
    },
    gd_slap: {
      root: { y: -0.12, rx: 6 }, spine: [8, -18, 0], chest: [10, -30, 0], head: [-6, 26, 0],
      shoulderR: [-84, 0, -14], elbowR: [-24, 0, 0], shoulderL: [-14, 0, 34], elbowL: [-84, 0, 0],
      thighL: [-20, 12, 22], kneeL: [34, 0, 0], thighR: [14, -12, -22], kneeR: [22, 0, 0],
    },
    gd_kickW: {
      root: { y: -0.1, rx: -6 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-10, 0, 0],
      shoulderL: [-30, 0, 52], elbowL: [-64, 0, 0], shoulderR: [-30, 0, -52], elbowR: [-64, 0, 0],
      thighR: [-66, 0, -14], kneeR: [82, 0, 0], footR: [18, 0, 0], thighL: [8, 0, 14], kneeL: [14, 0, 0],
    },
    gd_kick: {
      root: { y: -0.06, rx: 8 }, spine: [8, 0, 0], chest: [10, 0, 0], head: [-8, 0, 0],
      shoulderL: [-24, 0, 48], elbowL: [-50, 0, 0], shoulderR: [-24, 0, -48], elbowR: [-50, 0, 0],
      thighR: [-102, 0, -10], kneeR: [20, 0, 0], footR: [-12, 0, 0], thighL: [14, 0, 14], kneeL: [18, 0, 0],
    },
    // hands to the temples: telekinesis
    gd_focus: (t) => {
      const s = Math.sin(t * 24) * 1.6;
      return {
        root: { y: -0.1, rx: -4 }, spine: [-4, 0, 0], chest: [-6 + s, 0, 0], neck: [-6, 0, 0], head: [-14, 0, 0],
        shoulderL: [-136, 0, 34], elbowL: [-118, 0, 0], handL: [-20, 0, 0],
        shoulderR: [-136, 0, -34], elbowR: [-118, 0, 0], handR: [-20, 0, 0],
        thighL: [-14, 12, 22], kneeL: [26, 0, 0], thighR: [10, -12, -22], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // cheeks full, body rigid: he is holding his breath and the world has stopped
    gd_hold: (t) => {
      const s = Math.sin(t * 40) * 1.2;
      return {
        root: { y: -0.08, rx: 2 }, spine: [2, 0, 0], chest: [6 + s, 0, 0], neck: [4, 0, 0], head: [-4, 0, 0],
        shoulderL: [-30, 0, 58], elbowL: [-104, 0, 0], shoulderR: [-30, 0, -58], elbowR: [-104, 0, 0],
        thighL: [-12, 14, 24], kneeL: [24, 0, 0], thighR: [8, -14, -24], kneeR: [20, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // out of air
    gd_gasp: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: -0.2, rx: 22 }, spine: [22 + b * 3, 0, 0], chest: [18, 0, 0], neck: [10, 0, 0], head: [16, 0, 0],
        shoulderL: [-40, 0, 20], elbowL: [-96, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-96, 0, 0],
        thighL: [-30, 12, 22], kneeL: [52, 0, 0], thighR: [-24, -12, -22], kneeR: [48, 0, 0],
        hands: ['open', 'open'],
      };
    },
    gd_throwW: {
      root: { y: -0.14, rx: -8 }, spine: [-8, -22, 0], chest: [-10, -32, 0], head: [-12, 28, 0],
      shoulderR: [-150, 0, -24], elbowR: [-40, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0],
      thighL: [-18, 12, 22], kneeL: [30, 0, 0], thighR: [12, -12, -22], kneeR: [26, 0, 0],
      hands: ['open', 'open'],
    },
    gd_throw: {
      root: { y: -0.16, rx: 16 }, spine: [16, 24, 0], chest: [18, 34, 0], head: [8, -26, 0],
      shoulderR: [-30, 0, -8], elbowR: [-12, 0, 0], shoulderL: [-26, 0, 36], elbowL: [-70, 0, 0],
      thighL: [-32, 12, 22], kneeL: [44, 0, 0], thighR: [20, -12, -22], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    gd_taunt: (t) => {
      const b = Math.sin(t * 3.4);
      return {
        root: { y: -0.1 }, chest: [-6, 0, 0], head: [-14 + b * 2, 0, 0],
        shoulderL: [-56, 0, 64], elbowL: [-110, 0, 0], shoulderR: [-56, 0, -64], elbowR: [-110, 0, 0],
        thighL: [-12, 12, 22], kneeL: [24, 0, 0], thighR: [8, -12, -22], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    gd_defeat: C.defeatKneel,
  };

  /* ======================================================================
   * CAPTAIN GINYU — the fight is about one move, and everybody in it knows
   * which one. His melee is competent rather than frightening and the Milky
   * Cannon is a solid beam, but the whole encounter is built around Body
   * Change: a long, unmissable telegraph and one decisive frame. Get out of
   * the way and he is open for a second and a half. Stand still and the fight
   * becomes something else entirely — see battle.swapBodies.
   * ====================================================================== */
  const GINYU_SKIN = 0x8f5fb0;
  const GINYU_HORN = 0x2a2a32; // black horns (visual reference p.12)

  const ginyuPoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.01 + b * 0.012 }, hips: [0, 8, 0], spine: [-2, 6, 0], chest: [-4, 12, 0], head: [-2, -10, 0],
        shoulderL: [-16, 0, 24], elbowL: [-76, 0, 0], shoulderR: [-16, 0, -24], elbowR: [-76, 0, 0],
        thighL: [-6, 8, 9], kneeL: [12, 0, 0], thighR: [4, -8, -9], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    gy_punchW: {
      root: { y: -0.03 }, hips: [0, -18, 0], spine: [2, -12, 0], chest: [2, -22, 0], head: [-6, 20, 0],
      shoulderR: [-26, 0, -26], elbowR: [-96, 0, 0], shoulderL: [-16, 0, 24], elbowL: [-74, 0, 0],
      thighL: [-10, 8, 10], kneeL: [16, 0, 0], thighR: [8, -8, -10], kneeR: [12, 0, 0],
    },
    gy_punch: {
      root: { y: -0.03, rx: 6 }, hips: [0, 18, 0], spine: [6, 18, 0], chest: [6, 30, 0], head: [-10, -24, 0],
      shoulderR: [-90, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-12, 0, 28], elbowL: [-82, 0, 0],
      thighL: [-18, 8, 10], kneeL: [26, 0, 0], thighR: [14, -8, -10], kneeR: [10, 0, 0],
    },
    gy_kickW: {
      root: { y: 0.02, rx: -8 }, spine: [-8, -12, 0], chest: [-10, -18, 0], head: [-8, 18, 0],
      shoulderL: [-40, 0, 34], elbowL: [-58, 0, 0], shoulderR: [-36, 0, -32], elbowR: [-54, 0, 0],
      thighR: [-70, 0, -10], kneeR: [88, 0, 0], footR: [20, 0, 0], thighL: [8, 0, 10], kneeL: [12, 0, 0],
    },
    gy_kick: {
      root: { y: 0.05, rx: 10 }, spine: [8, 18, 0], chest: [10, 26, 0], head: [-12, -22, 0],
      shoulderL: [-22, 0, 42], elbowL: [-42, 0, 0], shoulderR: [-36, 0, -36], elbowR: [-34, 0, 0],
      thighR: [-104, 0, -8], kneeR: [16, 0, 0], footR: [-12, 0, 0], thighL: [16, 0, 10], kneeL: [18, 0, 0],
    },
    gy_elbowW: {
      root: { y: -0.02, rx: 10 }, spine: [8, 24, 0], chest: [10, 32, 0], head: [-10, -26, 0],
      shoulderL: [-72, 0, 32], elbowL: [-120, 0, 0], shoulderR: [-24, 0, -22], elbowR: [-86, 0, 0],
      thighL: [-14, 10, 10], kneeL: [22, 0, 0], thighR: [12, -10, -10], kneeR: [16, 0, 0],
    },
    gy_elbow: {
      root: { y: -0.05, rx: 14 }, spine: [12, -24, 0], chest: [14, -34, 0], head: [-14, 30, 0],
      shoulderL: [-90, 0, -12], elbowL: [-94, 0, 0], shoulderR: [-16, 0, -28], elbowR: [-78, 0, 0],
      thighL: [-26, 10, 10], kneeL: [34, 0, 0], thighR: [18, -10, -10], kneeR: [14, 0, 0],
    },
    // both hands drawn back for the Milky Cannon
    gy_chargeW: (t) => ({
      root: { y: -0.05, rx: -4 }, hips: [0, -24, 0], spine: [-4, -20, 0], chest: [-6, -28, 0], head: [-4, 26, 0],
      shoulderL: [-54, 0, 22], elbowL: [-104, 0, 0], shoulderR: [-48, 0, -18], elbowR: [-108, 0, 0],
      thighL: [-20, 10, 12], kneeL: [30, 0, 0], thighR: [14, -10, -12], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    }),
    gy_fire: {
      root: { y: -0.02, rx: 8 }, hips: [0, 14, 0], spine: [8, 12, 0], chest: [10, 18, 0], head: [-12, -16, 0],
      shoulderL: [-92, 0, 12], elbowL: [-10, 0, 0], shoulderR: [-92, 0, -12], elbowR: [-10, 0, 0],
      thighL: [-24, 8, 10], kneeL: [32, 0, 0], thighR: [18, -8, -10], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    // the Body Change: arms out, chest open, and then the beam
    gy_changeW: {
      root: { y: -0.04, rx: -6 }, hips: [0, 0, 0], spine: [-6, 0, 0], chest: [-10, 0, 0], head: [8, 0, 0],
      shoulderL: [-30, -30, 26], elbowL: [-88, 0, 0], shoulderR: [-30, 30, -26], elbowR: [-88, 0, 0],
      thighL: [-14, 8, 12], kneeL: [22, 0, 0], thighR: [10, -8, -12], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    gy_open: {
      root: { y: 0.03, rx: -20 }, spine: [-18, 0, 0], chest: [-26, 0, 0], head: [26, 0, 0],
      shoulderL: [-58, -40, 40], elbowL: [-24, 0, 0], shoulderR: [-58, 40, -40], elbowR: [-24, 0, 0],
      thighL: [-10, 10, 14], kneeL: [14, 0, 0], thighR: [8, -10, -14], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    gy_beam: {
      root: { y: 0, rx: 6 }, spine: [8, 0, 0], chest: [12, 0, 0], head: [-14, 0, 0],
      shoulderL: [-86, -16, 18], elbowL: [-14, 0, 0], shoulderR: [-86, 16, -18], elbowR: [-14, 0, 0],
      thighL: [-18, 8, 10], kneeL: [26, 0, 0], thighR: [14, -8, -10], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    // the Ginyu Force pose, struck without a trace of embarrassment
    gy_pose: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: 0, rx: -4 }, hips: [0, -14, 0], chest: [-6 + b * 0.8, -16, 0], head: [-10, 18, 0],
        shoulderL: [-124, -10, 14], elbowL: [-24, 0, 0], shoulderR: [-18, 40, -18], elbowR: [-104, 0, 0],
        thighL: [-12, 10, 16], kneeL: [18, 0, 0], thighR: [8, -10, -16], kneeR: [12, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    gy_defeat: C.knockdown,
  };

  SL.data.characters.ginyu = {
    id: 'ginyu',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Captain Ginyu',
    fullName: 'Captain Ginyu, Ginyu Force',
    era: 'Namek Saga',
    playable: true, // Free Battle after "Nothing Like a Frog" (unlocks.js)
    style: 'Body Thief',
    blurb: 'A competent fighter and a far better thief. Everything he does is setup for one move, and the only defence against it is to not be standing there.',
    ratings: { power: 4, speed: 3, ki: 4, defense: 4 },
    stats: { hp: 24000, ki: 120, stamina: 150, speed: 1.08, power: 1.12, defense: 1.05, weight: 1.15, kiRegen: 3.2, chargeRate: 30, canonPower: 1.8 },
    poise: { max: 72, regen: 10, regenDelay: 110, armor: 1, cost: { 1: 7, 2: 11, 3: 17, 4: 26 }, beamMul: 1.1, breakFrames: 145, vulnerable: 1.25 },
    appearance: {
      height: 1.3,
      skin: GINYU_SKIN,
      build: { chestW: 0.235, chestD: 0.165, shoulderX: 0.225, waistW: 0.155, waistD: 0.125, upperArmR: 0.066, foreArmR: 0.055, thighR: 0.095, shinR: 0.075, neckR: 0.082, neckLen: 0.075, headR: 0.12 },
      hair: { style: 'frieza_dome', color: GINYU_SKIN },
      headExtras: [
        // the two horns
        { a: [0.45, 0.85, -0.1], d: [0.7, 1, 0.1], l: 0.15, r: 0.035, color: GINYU_HORN, depth: 0.96, outline: 0.4 },
        { a: [-0.45, 0.85, -0.1], d: [-0.7, 1, 0.1], l: 0.15, r: 0.035, color: GINYU_HORN, depth: 0.96, outline: 0.4 },
      ],
      face: { pupil: 0x1a1020, sclera: 0xf2ecf6, brow: 0x5a3a72, eyeW: 1.05, noEars: true },
      // the reference (p.12): the captain's dark navy chest, bare purple arms and legs below black shorts, dark
      // wristbands and shin guards, white boots with brown toes, the green scouter
      outfit: {
        topStyle: 'armor', top: GF_BLACK, arms: GINYU_SKIN, pants: GF_BLACK, pantsStyle: 'tight', thighs: GINYU_SKIN, legs: GF_NAVY,
        gloves: null, boots: GF_WHITE, bootTip: GF_BROWN, bootStyle: 'saiyan', bootTop: 0.32, wrist: GF_NAVY,
        armor: gfArmor(GF_NAVY, true),
        scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
      },
      portraitColor: '#8f5fb0',
    },
    vfx: { ghost: 0xd8b0ff },
    audio: { strikePitch: 1 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc9a0ff, core: 0xffffff, particles: 0xe6d0ff, speed: 1.2 }, mult: {} }],
    poses: ginyuPoses,
    moves: {
      light: [
        { id: 'gyJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 330, reach: 1.25, radius: 0.74, lunge: 13, hitstun: 17, knock: 'flinch', impact: 1, pose: { wind: 'gy_punchW', strike: 'gy_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gyHook', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 360, reach: 1.25, radius: 0.74, lunge: 13, hitstun: 19, knock: 'flinch', impact: 1, pose: { wind: 'gy_punchW', strike: 'gy_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gyElbow', startup: 6, active: 3, recovery: 13, cancel: 8, damage: 430, reach: 1.3, radius: 0.78, lunge: 12, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'gy_elbowW', strike: 'gy_elbow' }, sfx: 'punchLight', hitPose: 'hitBody' },
        { id: 'gyKick', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 560, reach: 1.45, radius: 0.86, lunge: 14, hitstun: 26, knock: 'push', knockSpeed: 15, impact: 2, pose: { wind: 'gy_kickW', strike: 'gy_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gySmash', startup: 12, active: 4, recovery: 24, damage: 940, reach: 1.4, radius: 0.92, lunge: 18, hitstun: 32, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'gy_elbowW', strike: 'gy_elbow' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'gyLaunch', startup: 13, active: 4, recovery: 26, damage: 1000, reach: 1.5, radius: 0.95, lunge: 16, hitstun: 36, knock: 'launch', knockSpeed: 20, impact: 3, pose: { wind: 'gy_kickW', strike: 'gy_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'gyDash', startup: 5, active: 5, recovery: 16, damage: 600, reach: 1.35, radius: 0.88, lunge: 36, hitstun: 24, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'gy_punchW', strike: 'gy_punch' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'gyToss', name: 'Captain Toss', damage: 840, knockSpeed: 26, poses: ['grab', 'gy_elbowW', 'gy_punch'] },
    },
    specials: {
      special1: {
        id: 'milkyCannon', name: 'Milky Cannon', type: 'beam', kiCost: 40, icon: 'beam',
        chargeMin: 26, chargeMax: 70, recovery: 30,
        damage: [900, 2400], radius: [0.55, 1.05], speed: 100, range: 60, sustain: 46,
        color: 0xc9a0ff, core: 0xffffff, poses: { charge: 'gy_chargeW', fire: 'gy_fire' },
      },
      special2: {
        id: 'ginyuStrike', name: 'Captain Strike', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 12, dashFrames: 24, speed: 74, armor: true, recovery: 26,
        poses: { wind: 'gy_punchW' },
        hits: [
          { pose: 'gy_punch', damage: 460, frames: 9, sfx: 'punchLight' },
          { pose: 'gy_elbow', damage: 520, frames: 10, sfx: 'punchLight' },
          { pose: 'gy_kick', damage: 980, frames: 14, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 28, impact: 3 },
        ],
      },
      ultimate: {
        id: 'ginyuVolley', name: 'Captain Volley', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 24, rise: 28, height: 11, count: 12, damage: 620, speed: 60, range: 50, recovery: 28,
        color: 0xc9a0ff, poses: { wind: 'gy_chargeW', throw: 'gy_fire' },
      },
    },
    blast: { color: 0xc9a0ff, core: 0xf4ecff, damage: 320, speed: 68, radius: 0.32, sfxPitch: 1 },
    mechanic: { type: 'boss', name: 'Body Change', desc: 'He would rather have your body than beat it. The beam is slow and loud — be somewhere else when it fires, or the fight changes sides.' },
    boss: {
      phases: [
        { id: 'captain', label: 'CAPTAIN', hpAbove: 0.55, speed: 1, damage: 1, patience: 1, patterns: { melee: 1, cannon: 0.45, strike: 0.5, pose: 0.35 } },
        // hurt enough, he stops fighting for the win and starts fighting for the body
        { id: 'covetous', label: 'COVETOUS', hpAbove: 0, speed: 1.05, damage: 1.05, patience: 0.7, line: 'angry', patterns: { melee: 0.8, cannon: 0.5, strike: 0.6, change: 1.1, volley: 0.3 } },
      ],
      patterns: {
        cannon: { slot: 'special1', minDist: 8, maxDist: 50, cooldown: 340 },
        strike: { slot: 'special2', minDist: 4, maxDist: 26, cooldown: 300 },
        volley: { slot: 'ultimate', minDist: 9, cooldown: 700 },
        // the move the whole fight is about: close enough to be sure, and rarely
        change: { technique: 'change', minDist: 2, maxDist: 16, cooldown: 900 },
        pose: { technique: 'pose', when: 'targetDown', maxDist: 24, cooldown: 600 },
      },
      techniques: {
        change: { type: 'bodyChange', range: 18, startup: 78, recovery: 40, failStagger: 96, penalty: 0.55, interceptRadius: 2.2, line: 'change', poses: { wind: 'gy_changeW', open: 'gy_open', fire: 'gy_beam' } },
        pose: { type: 'bossTaunt', frames: 70, line: 'taunt', poses: { taunt: 'gy_pose' } },
      },
    },
    ai: { personality: 'elite', aggression: 0.7, defense: 0.5, ranged: 0.45, beam: 0.6, transformHp: 0, preferredRange: 4, hooks: 'boss' },
    barks: { taunt: 'ginyu_taunt', angry: 'ginyu_angry', hurt: 'ginyu_hurt', intro: 'ginyu_intro', beaten: 'ginyu_beaten', change: 'ginyu_change', changed: 'ginyu_changed', missed: 'ginyu_missed' },
    intro: { pose: 'gy_pose', expression: 'smirk' },
    victory: { poses: ['gy_pose'], expression: 'grin' },
    defeat: { pose: 'gy_defeat', expression: 'ko' },
  };

  /* ======================================================================
   * BURTER — "the fastest in the universe", and the fight is built on that
   * claim rather than on a bigger speed stat. While he is genuinely moving,
   * most of a hit slides off him (def.boss.evade) and he leaves afterimages;
   * he is only properly hittable when he stops — his own recovery, a stagger,
   * or a guarded Blue Hurricane pass that bounces him off. Low health, low
   * poise, no armour: catch him once and it hurts.
   * ====================================================================== */
  const BURTER_SKIN = 0x4a86d8;
  const BURTER_DARK = 0x2a5490;

  const burterPoses = {
    idle: (t) => {
      const b = Math.sin(t * 3.4);
      return {
        root: { y: -0.02 + b * 0.014, rx: 4 }, hips: [0, -14, 0], spine: [4, -4, 0], chest: [4, -10, 0], head: [-8, 8, 0],
        shoulderL: [-26, 0, 22], elbowL: [-88, 0, 0], shoulderR: [-22, 0, -20], elbowR: [-84, 0, 0],
        thighL: [-12, 10, 10], kneeL: [20, 0, 0], thighR: [10, -10, -10], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // streamlined: arms back, body flat, everything pointed forward
    bt_dash: (t) => ({
      root: { y: 0.04, rx: 22 }, spine: [16, 0, 0], chest: [14, 0, 0], head: [-26, 0, 0],
      shoulderL: [26, 0, 16], elbowL: [-22, 0, 0], shoulderR: [26, 0, -16], elbowR: [-22, 0, 0],
      thighL: [-14, 0, 8], kneeL: [26, 0, 0], footL: [22, 0, 0], thighR: [-10, 0, -8], kneeR: [22, 0, 0], footR: [20, 0, 0],
      hands: ['fist', 'fist'],
    }),
    bt_crouch: {
      root: { y: -0.16, rx: 16 }, hips: [0, -10, 0], spine: [14, -8, 0], chest: [16, -14, 0], head: [-14, 12, 0],
      shoulderL: [-14, 0, 26], elbowL: [-104, 0, 0], shoulderR: [-10, 0, -24], elbowR: [-100, 0, 0],
      thighL: [-52, 12, 12], kneeL: [76, 0, 0], footL: [22, 0, 0], thighR: [-44, -12, -12], kneeR: [70, 0, 0], footR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    bt_strike: {
      root: { y: -0.02, rx: 10 }, hips: [0, 18, 0], spine: [8, 20, 0], chest: [8, 34, 0], head: [-12, -28, 0],
      shoulderR: [-94, 0, -4], elbowR: [-6, 0, 0], shoulderL: [-14, 0, 30], elbowL: [-92, 0, 0],
      thighL: [-22, 8, 10], kneeL: [30, 0, 0], thighR: [16, -8, -10], kneeR: [12, 0, 0],
      hands: ['fist', 'fist'],
    },
    bt_jabW: {
      root: { y: -0.04 }, hips: [0, -18, 0], spine: [2, -12, 0], chest: [2, -22, 0], head: [-6, 20, 0],
      shoulderR: [-30, 0, -26], elbowR: [-98, 0, 0], shoulderL: [-18, 0, 24], elbowL: [-78, 0, 0],
      thighL: [-12, 10, 10], kneeL: [18, 0, 0], thighR: [10, -10, -10], kneeR: [14, 0, 0],
    },
    bt_jab: {
      root: { y: -0.04, rx: 4 }, hips: [0, 14, 0], spine: [4, 14, 0], chest: [4, 26, 0], head: [-8, -22, 0],
      shoulderR: [-88, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-12, 0, 28], elbowL: [-84, 0, 0],
      thighL: [-18, 8, 10], kneeL: [24, 0, 0], thighR: [14, -8, -10], kneeR: [10, 0, 0],
    },
    bt_kickW: {
      root: { y: 0.02, rx: -6 }, spine: [-6, -10, 0], chest: [-8, -16, 0], head: [-10, 18, 0],
      shoulderL: [-40, 0, 36], elbowL: [-62, 0, 0], shoulderR: [-36, 0, -34], elbowR: [-58, 0, 0],
      thighR: [-72, 0, -10], kneeR: [92, 0, 0], footR: [22, 0, 0], thighL: [8, 0, 10], kneeL: [12, 0, 0],
    },
    bt_kick: {
      root: { y: 0.06, rx: 10 }, spine: [8, 16, 0], chest: [10, 24, 0], head: [-12, -20, 0],
      shoulderL: [-22, 0, 44], elbowL: [-44, 0, 0], shoulderR: [-38, 0, -38], elbowR: [-36, 0, 0],
      thighR: [-108, 0, -8], kneeR: [14, 0, 0], footR: [-14, 0, 0], thighL: [16, 0, 10], kneeL: [18, 0, 0],
    },
    bt_elbowW: {
      root: { y: -0.02, rx: 8 }, spine: [6, 22, 0], chest: [8, 30, 0], head: [-10, -24, 0],
      shoulderL: [-70, 0, 34], elbowL: [-118, 0, 0], shoulderR: [-26, 0, -22], elbowR: [-88, 0, 0],
      thighL: [-14, 10, 10], kneeL: [22, 0, 0], thighR: [12, -10, -10], kneeR: [16, 0, 0],
    },
    bt_elbow: {
      root: { y: -0.04, rx: 12 }, spine: [10, -22, 0], chest: [12, -32, 0], head: [-14, 28, 0],
      shoulderL: [-88, 0, -14], elbowL: [-96, 0, 0], shoulderR: [-16, 0, -28], elbowR: [-80, 0, 0],
      thighL: [-24, 10, 10], kneeL: [32, 0, 0], thighR: [18, -10, -10], kneeR: [14, 0, 0],
    },
    // arms folded, entirely pleased with himself (the rig folds arms with the
    // shoulder Y twist, as in C.armsCrossed — raising the shoulder X instead
    // just holds both arms out in front, which is what this pose used to do)
    bt_pose: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: 0 }, chest: [-6 + b * 0.8, 6, 0], head: [-12, -10, 0],
        shoulderL: [-14, -72, 6], elbowL: [-94, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-90, 0, 0],
        thighL: [-4, 8, 10], kneeL: [6, 0, 0], thighR: [4, -8, -10], kneeR: [5, 0, 0],
        hands: ['open', 'open'],
      };
    },
    bt_defeat: C.knockdown,
  };

  SL.data.characters.burter = {
    id: 'burter',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Burter',
    fullName: 'Burter, Ginyu Force',
    era: 'Namek Saga',
    playable: true, // Free Battle after "Two Against One" (unlocks.js)
    style: 'Speedster',
    blurb: 'The fastest in the universe, and he will tell you so. Hitting him is not an aiming problem — it is a timing problem.',
    ratings: { power: 3, speed: 5, ki: 3, defense: 2 },
    stats: { hp: 19000, ki: 100, stamina: 150, speed: 1.35, power: 0.95, defense: 0.85, weight: 0.85, kiRegen: 3, chargeRate: 30, canonPower: 1.4 },
    // thin poise on purpose: he is not supposed to tank anything, he is supposed to not be there
    poise: { max: 50, regen: 13, regenDelay: 95, armor: 1, cost: { 1: 8, 2: 13, 3: 20, 4: 30 }, beamMul: 1.2, breakFrames: 135, vulnerable: 1.35 },
    appearance: {
      height: 1.28,
      skin: BURTER_SKIN,
      build: { chestW: 0.2, chestD: 0.14, shoulderX: 0.205, waistW: 0.13, waistD: 0.11, upperArmR: 0.054, foreArmR: 0.048, thighR: 0.082, shinR: 0.066, neckR: 0.07, neckLen: 0.09, headR: 0.112 },
      hair: { style: 'frieza_dome', color: BURTER_SKIN },
      headExtras: [
        // the long crested head, and the gold ribbed crest from the brow over the top (visual reference p.15)
        { a: [0, 0.95, -0.2], d: [0, 1, -0.55], l: 0.16, r: 0.05, color: BURTER_SKIN, depth: 0.96, outline: 0.4 },
        { shape: 'ball', a: [0, 0.9, 0.3], d: [0, 1, -0.2], l: 0.13, r: 0.055, color: 0xd8a838, depth: 1, flat: 0.45, outline: 0.4 },
        { a: [0.5, 0.45, -0.55], d: [0.6, 0.4, -1], l: 0.1, r: 0.03, color: BURTER_DARK, depth: 0.96, outline: 0.4 },
        { a: [-0.5, 0.45, -0.55], d: [-0.6, 0.4, -1], l: 0.1, r: 0.03, color: BURTER_DARK, depth: 0.96, outline: 0.4 },
      ],
      // the reference (p.15): red eyes, the dark navy chest, black bodysuit legs, bare blue hands, dark wristbands
      face: { pupil: 0xe02424, sclera: 0x101820, brow: BURTER_DARK, eyeW: 1.1, noEars: true },
      outfit: {
        topStyle: 'armor', top: GF_BLACK, arms: BURTER_SKIN, pants: GF_BLACK, pantsStyle: 'tight',
        gloves: null, boots: GF_WHITE, bootTip: GF_BROWN, bootStyle: 'saiyan', wrist: GF_NAVY,
        armor: gfArmor(GF_NAVY, false),
        scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
      },
      portraitColor: '#4a86d8',
    },
    vfx: { ghost: 0x6fd0ff },
    audio: { strikePitch: 1.25, heavyPitch: 1.1 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x6fd0ff, core: 0xffffff, particles: 0x9fe4ff, speed: 1.6 }, mult: {} }],
    poses: burterPoses,
    moves: {
      // fast, light, and relentless: individually weak, dangerous as a stream
      light: [
        { id: 'btJab', startup: 3, active: 2, recovery: 8, cancel: 5, damage: 230, reach: 1.15, radius: 0.68, lunge: 14, hitstun: 15, knock: 'flinch', impact: 1, pose: { wind: 'bt_jabW', strike: 'bt_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'btCross', startup: 3, active: 2, recovery: 9, cancel: 5, damage: 245, reach: 1.15, radius: 0.68, lunge: 14, hitstun: 15, knock: 'flinch', impact: 1, pose: { wind: 'bt_jabW', strike: 'bt_strike' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'btElbow', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 280, reach: 1.2, radius: 0.72, lunge: 13, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'bt_elbowW', strike: 'bt_elbow' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'btKick', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 330, reach: 1.35, radius: 0.8, lunge: 15, hitstun: 22, knock: 'push', knockSpeed: 9, impact: 2, pose: { wind: 'bt_kickW', strike: 'bt_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'btDivingElbow', startup: 9, active: 4, recovery: 20, damage: 720, reach: 1.35, radius: 0.9, lunge: 22, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'bt_elbowW', strike: 'bt_elbow' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'btSpinKick', startup: 10, active: 4, recovery: 22, damage: 820, reach: 1.45, radius: 0.95, lunge: 18, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 3, pose: { wind: 'bt_kickW', strike: 'bt_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'btBlink', startup: 3, active: 7, recovery: 12, damage: 560, reach: 1.25, radius: 0.85, lunge: 46, hitstun: 24, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'bt_dash', strike: 'bt_strike' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'btSnap', name: 'Snap Toss', damage: 780, knockSpeed: 26, poses: ['grab', 'bt_crouch', 'bt_strike'] },
    },
    specials: {
      // the signature: he circles you and hits from a new angle each pass. Guard a pass to bounce him.
      special1: {
        id: 'blueHurricane', name: 'Blue Hurricane', type: 'speedOrbit', kiCost: 30, icon: 'rush', cooldown: 430,
        range: 30, frames: 150, radius: 4.6, interval: 22, damage: 520, speed: 30, recovery: 46, bounceStagger: 56,
        poses: { dash: 'bt_dash', strike: 'bt_strike' },
      },
      special2: {
        id: 'afterimageStrike', name: 'Afterimage Strike', type: 'rush', kiCost: 22, icon: 'rush',
        startup: 8, dashFrames: 20, speed: 78, armor: false, recovery: 22,
        poses: { wind: 'bt_crouch' },
        hits: [
          { pose: 'bt_strike', damage: 320, frames: 7, sfx: 'punchLight' },
          { pose: 'bt_jab', damage: 340, frames: 7, sfx: 'punchLight' },
          { pose: 'bt_elbow', damage: 380, frames: 8, sfx: 'punchLight' },
          { pose: 'bt_kick', damage: 640, frames: 12, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 24, impact: 3 },
        ],
      },
      ultimate: {
        id: 'machAttack', name: 'Mach Attack', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 16, dashFrames: 30, speed: 110, armor: true, recovery: 44,
        poses: { wind: 'bt_crouch' },
        hits: [{ pose: 'bt_strike', damage: 3600, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 }],
      },
    },
    blast: { color: 0x6fd0ff, core: 0xeafaff, damage: 240, speed: 74, radius: 0.28, sfxPitch: 1.3 },
    mechanic: { type: 'boss', name: 'Fastest in the Universe', desc: 'While he is moving, hits barely land. Stop him — recovery, stagger, or a guarded Hurricane pass — and he takes everything.' },
    boss: {
      // the identity, as data: motion is his armour
      // measured against his own movement: running is about 11 and a sprint or a
      // dodge is well past it, while standing, recovering and posing sit near zero
      evade: { minSpeed: 9, damageMul: 0.35 },
      phases: [
        { id: 'sprint', label: 'SPRINT', hpAbove: 0.5, speed: 1.1, damage: 0.95, patience: 0.7, patterns: { melee: 1, hurricane: 0.5, dart: 0.6, taunt: 0.3 } },
        { id: 'frantic', label: 'FRANTIC', hpAbove: 0, speed: 1.2, damage: 1.05, patience: 0.35, line: 'angry', patterns: { melee: 1, hurricane: 0.75, dart: 0.85, mach: 0.4 } },
      ],
      patterns: {
        hurricane: { slot: 'special1', minDist: 3, maxDist: 26, cooldown: 470, pressure: true },
        dart: { slot: 'special2', minDist: 4, maxDist: 32, cooldown: 270, pressure: true },
        mach: { slot: 'ultimate', minDist: 8, cooldown: 640 },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 20, cooldown: 560 },
      },
      techniques: {
        taunt: { type: 'bossTaunt', frames: 66, line: 'taunt', poses: { taunt: 'bt_pose' } },
      },
    },
    ai: { personality: 'adaptive', aggression: 0.85, defense: 0.35, ranged: 0.2, beam: 0.1, transformHp: 0, preferredRange: 2.5, hooks: 'boss', squad: { role: 'pressure' } },
    barks: { taunt: 'burter_taunt', angry: 'burter_angry', hurt: 'burter_hurt', intro: 'burter_intro', beaten: 'burter_beaten' },
    intro: { pose: 'bt_pose', expression: 'smirk' },
    victory: { poses: ['bt_pose'], expression: 'grin' },
    defeat: { pose: 'bt_defeat', expression: 'ko' },
  };

  /* ======================================================================
   * JEICE — the other half of the pair, and deliberately the opposite of
   * Burter. He does not want to be next to you: the Crusher Ball punishes
   * standing still, the Purple Comet volley punishes walking in a straight
   * line, and when you do get close he kicks off backwards and shoots on the
   * way out. Crowd him and keep crowding him and he runs out of answers.
   * ====================================================================== */
  const JEICE_SKIN = 0xd2493f;
  const JEICE_DARK = 0x8f2b25;
  const JEICE_KI = 0xff5a4a;

  const jeicePoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.9);
      return {
        root: { y: -0.01 + b * 0.012 }, hips: [0, 12, 0], spine: [2, 8, 0], chest: [2, 16, 0], head: [-4, -14, 0],
        shoulderL: [-18, 0, 26], elbowL: [-72, 0, 0], shoulderR: [-30, 0, -18], elbowR: [-96, 0, 0],
        thighL: [-8, -8, 8], kneeL: [14, 0, 0], thighR: [6, 8, -8], kneeR: [12, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // both palms out in front, holding the ball together
    jc_ballW: (t) => ({
      root: { y: -0.04, rx: -6 }, hips: [0, -6, 0], spine: [-8, -4, 0], chest: [-10, -6, 0], head: [10, 4, 0],
      shoulderL: [-66, 0, 16], elbowL: [-64, 0, 0], shoulderR: [-66, 0, -16], elbowR: [-64, 0, 0],
      thighL: [-16, 8, 12], kneeL: [26, 0, 0], thighR: [12, -8, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    }),
    jc_ball: {
      root: { y: -0.02, rx: 10 }, spine: [10, 0, 0], chest: [12, 0, 0], head: [-14, 0, 0],
      shoulderL: [-96, 0, 10], elbowL: [-12, 0, 0], shoulderR: [-96, 0, -10], elbowR: [-12, 0, 0],
      thighL: [-22, 6, 10], kneeL: [30, 0, 0], thighR: [16, -6, -10], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    // one arm up and out, firing fast
    jc_fireW: {
      root: { y: -0.02 }, hips: [0, -14, 0], spine: [0, -10, 0], chest: [0, -18, 0], head: [-6, 18, 0],
      shoulderR: [-52, 0, -30], elbowR: [-86, 0, 0], shoulderL: [-20, 0, 22], elbowL: [-70, 0, 0],
      thighL: [-10, 8, 10], kneeL: [16, 0, 0], thighR: [8, -8, -10], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    jc_fire: {
      root: { y: -0.02, rx: 4 }, hips: [0, 12, 0], spine: [2, 12, 0], chest: [2, 22, 0], head: [-8, -18, 0],
      shoulderR: [-100, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-14, 0, 26], elbowL: [-76, 0, 0],
      thighL: [-16, 6, 10], kneeL: [22, 0, 0], thighR: [12, -6, -10], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
    // kicking off backwards
    jc_backW: {
      root: { y: 0.04, rx: -18 }, spine: [-14, 0, 0], chest: [-16, 0, 0], head: [16, 0, 0],
      shoulderL: [-58, 0, 30], elbowL: [-56, 0, 0], shoulderR: [-58, 0, -30], elbowR: [-56, 0, 0],
      thighL: [-40, 6, 12], kneeL: [64, 0, 0], footL: [18, 0, 0], thighR: [-34, -6, -12], kneeR: [58, 0, 0], footR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    jc_punchW: {
      root: { y: -0.03 }, hips: [0, -16, 0], spine: [2, -12, 0], chest: [2, -20, 0], head: [-6, 18, 0],
      shoulderR: [-28, 0, -24], elbowR: [-92, 0, 0], shoulderL: [-16, 0, 22], elbowL: [-72, 0, 0],
      thighL: [-10, 8, 10], kneeL: [16, 0, 0], thighR: [8, -8, -10], kneeR: [12, 0, 0],
    },
    jc_punch: {
      root: { y: -0.03, rx: 6 }, hips: [0, 16, 0], spine: [6, 16, 0], chest: [6, 28, 0], head: [-10, -22, 0],
      shoulderR: [-86, 0, -8], elbowR: [-10, 0, 0], shoulderL: [-12, 0, 26], elbowL: [-80, 0, 0],
      thighL: [-18, 8, 10], kneeL: [26, 0, 0], thighR: [14, -8, -10], kneeR: [10, 0, 0],
    },
    jc_kickW: {
      root: { y: 0.02, rx: -8 }, spine: [-8, -12, 0], chest: [-10, -18, 0], head: [-8, 20, 0],
      shoulderL: [-42, 0, 34], elbowL: [-58, 0, 0], shoulderR: [-38, 0, -32], elbowR: [-54, 0, 0],
      thighR: [-66, 0, -10], kneeR: [86, 0, 0], footR: [20, 0, 0], thighL: [6, 0, 10], kneeL: [12, 0, 0],
    },
    jc_kick: {
      root: { y: 0.05, rx: 8 }, spine: [6, 18, 0], chest: [8, 26, 0], head: [-10, -22, 0],
      shoulderL: [-20, 0, 42], elbowL: [-40, 0, 0], shoulderR: [-34, 0, -36], elbowR: [-32, 0, 0],
      thighR: [-100, 0, -8], kneeR: [18, 0, 0], footR: [-12, 0, 0], thighL: [14, 0, 10], kneeL: [16, 0, 0],
    },
    // one hand on the hip, the other sweeping the hair back
    jc_pose: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: 0 }, hips: [0, 14, 0], chest: [-4 + b * 0.7, 16, 0], head: [-8, -16, 6],
        shoulderR: [-10, 46, -16], elbowR: [-102, 0, 0], shoulderL: [-92, -34, 16], elbowL: [-104, 0, 0],
        thighL: [-6, 8, 10], kneeL: [8, 0, 0], thighR: [4, -8, -10], kneeR: [6, 0, 0],
        hands: ['open', 'open'],
      };
    },
    jc_defeat: C.knockdown,
  };

  SL.data.characters.jeice = {
    id: 'jeice',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Jeice',
    fullName: 'Jeice, the Red Magma',
    era: 'Namek Saga',
    playable: true, // Free Battle after "Nothing Like a Frog" (unlocks.js)
    style: 'Zoner',
    blurb: 'Fights at the distance he picks. Every time you close it he buys it back with ki.',
    ratings: { power: 3, speed: 4, ki: 5, defense: 3 },
    stats: { hp: 20000, ki: 130, stamina: 130, speed: 1.14, power: 1, defense: 0.95, weight: 0.95, kiRegen: 4.2, chargeRate: 34, canonPower: 1.4 },
    poise: { max: 64, regen: 11, regenDelay: 105, armor: 1, cost: { 1: 8, 2: 12, 3: 18, 4: 28 }, beamMul: 1, breakFrames: 140, vulnerable: 1.25 },
    appearance: {
      height: 1.18,
      skin: JEICE_SKIN,
      build: { chestW: 0.225, chestD: 0.155, shoulderX: 0.215, waistW: 0.15, waistD: 0.12, upperArmR: 0.062, foreArmR: 0.052, thighR: 0.092, shinR: 0.072, neckR: 0.075, neckLen: 0.07, headR: 0.118 },
      hair: { style: 'jeice', color: 0xf4f1e8 },
      face: { pupil: 0x2a1410, sclera: 0xf6f2ea, brow: 0xf4f1e8, eyeW: 1.02 },
      // the reference (p.17): a black bodysuit with long sleeves and a high collar, RED tights, white gloves and boots,
      // the white chest with the brown plates
      outfit: {
        topStyle: 'armor', top: GF_BLACK, arms: GF_BLACK, collar: GF_BLACK, collarStyle: 'turtle', pants: GF_BLACK, pantsStyle: 'tight', thighs: 0xc8241c, legs: 0xc8241c,
        gloves: GF_WHITE, boots: GF_WHITE, bootStyle: 'saiyan',
        armor: gfArmor(GF_WHITE, false),
        scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
      },
      portraitColor: '#d2493f',
    },
    vfx: { ghost: 0xff8a7a },
    audio: { strikePitch: 1.1 },
    forms: [{ id: 'base', name: 'Base', aura: { color: JEICE_KI, core: 0xffe6e0, particles: 0xff9a8a, speed: 1.2 }, mult: {} }],
    poses: jeicePoses,
    moves: {
      // serviceable up close, and no more than that: his answer to pressure is the volley
      light: [
        { id: 'jcJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 300, reach: 1.2, radius: 0.72, lunge: 12, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'jc_punchW', strike: 'jc_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'jcHook', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 340, reach: 1.2, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'jc_punchW', strike: 'jc_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'jcRoundhouse', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 520, reach: 1.45, radius: 0.85, lunge: 14, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'jc_kickW', strike: 'jc_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'jcPalm', startup: 12, active: 4, recovery: 24, damage: 860, reach: 1.35, radius: 0.9, lunge: 16, hitstun: 30, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'jc_fireW', strike: 'jc_fire' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'jcLaunchKick', startup: 13, active: 4, recovery: 26, damage: 900, reach: 1.5, radius: 0.95, lunge: 14, hitstun: 34, knock: 'launch', knockSpeed: 20, impact: 3, pose: { wind: 'jc_kickW', strike: 'jc_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'jcDashPalm', startup: 5, active: 5, recovery: 16, damage: 540, reach: 1.3, radius: 0.85, lunge: 34, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'jc_fireW', strike: 'jc_fire' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'jcToss', name: 'Magma Toss', damage: 720, knockSpeed: 24, poses: ['grab', 'jc_ballW', 'jc_fire'] },
    },
    specials: {
      // the signature: a slow, heavy orb that punishes standing still
      special1: {
        id: 'crusherBall', name: 'Crusher Ball', type: 'projectile', kiCost: 34, icon: 'blast', cooldown: 190,
        startup: 22, recovery: 26, pose: { wind: 'jc_ballW', release: 'jc_ball' },
        projectile: { kind: 'ball', speed: 38, radius: 1.15, damage: 1500, homing: 0.35, color: JEICE_KI, core: 0xfff0ea, explode: 6, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3.4 },
      },
      // the space control: a falling curtain of bolts over the ground he does not want walked through
      special2: {
        id: 'purpleComet', name: 'Purple Comet Volley', type: 'scatter', kiCost: 40, icon: 'blast',
        windup: 20, rise: 24, height: 9, count: 9, damage: 420, speed: 62, range: 46, recovery: 22,
        color: 0xff6a8a, poses: { wind: 'jc_fireW', throw: 'jc_fire' },
      },
      ultimate: {
        id: 'crusherVolcano', name: 'Crusher Volcano', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 36, recovery: 42, pose: { wind: 'jc_ballW', release: 'jc_ball' },
        projectile: { kind: 'ball', speed: 34, radius: 2, damage: 3900, homing: 0.55, color: JEICE_KI, core: 0xfff4ee, explode: 10, knock: 'smash', knockSpeed: 36, impact: 4, life: 3.6 },
      },
    },
    blast: { color: JEICE_KI, core: 0xfff0ea, damage: 300, speed: 70, radius: 0.3, sfxPitch: 1.15 },
    mechanic: { type: 'boss', name: 'Red Magma', desc: 'He fights at his distance. Closing it is the whole fight — he buys it back with a volley, and only pays that price so many times.' },
    boss: {
      phases: [
        { id: 'spacing', label: 'SPACING', hpAbove: 0.45, speed: 1, damage: 1, patience: 1.3, patterns: { melee: 0.45, crusher: 0.8, volley: 0.5, kickoff: 0.9, taunt: 0.3 } },
        // cornered often enough, he stops retreating and starts throwing everything
        { id: 'cornered', label: 'CORNERED', hpAbove: 0, speed: 1.08, damage: 1.12, patience: 0.6, line: 'angry', patterns: { melee: 0.8, crusher: 1, volley: 0.8, kickoff: 0.5, volcano: 0.45 } },
      ],
      patterns: {
        crusher: { slot: 'special1', minDist: 7, maxDist: 44, cooldown: 230, ranged: true },
        volley: { slot: 'special2', minDist: 9, maxDist: 46, cooldown: 420, ranged: true },
        // the spacing move: only when someone is actually in his face
        kickoff: { technique: 'kickoff', maxDist: 6.5, cooldown: 260 },
        volcano: { slot: 'ultimate', minDist: 10, cooldown: 700, ranged: true },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 26, cooldown: 520 },
      },
      techniques: {
        kickoff: { type: 'retreatVolley', backDistance: 15, frames: 42, shots: 3, interval: 12, damage: 340, speed: 76, recovery: 16, poses: { wind: 'jc_backW', fire: 'jc_fire' } },
        taunt: { type: 'bossTaunt', frames: 60, line: 'taunt', poses: { taunt: 'jc_pose' } },
      },
    },
    ai: { personality: 'gunner', aggression: 0.5, defense: 0.55, ranged: 0.85, beam: 0.5, transformHp: 0, preferredRange: 13, hooks: 'boss', squad: { role: 'space', holdRange: 5.5, line: 'cover' } },
    barks: { taunt: 'jeice_taunt', angry: 'jeice_angry', hurt: 'jeice_hurt', intro: 'jeice_intro', beaten: 'jeice_beaten', cover: 'jeice_cover', alone: 'jeice_alone' },
    intro: { pose: 'jc_pose', expression: 'smirk' },
    victory: { poses: ['jc_pose'], expression: 'grin' },
    defeat: { pose: 'jc_defeat', expression: 'ko' },
  };

  /* ======================================================================
   * RECOOME — the opposite problem to Guldo. He is enormous, he enjoys this,
   * and he keeps stopping to pose. Every pose is a free opening; every pose you
   * fail to punish makes the next few seconds hurt much more. He is not a wall
   * like Dodoria — he is a showman who dares you to be patient.
   * ====================================================================== */
  const RECOOME_SKIN = 0xf0c8a0;
  const RECOOME_HAIR = 0xd8582a;

  const recoomePoses = {
    idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.04 + b * 0.012 }, hips: [0, -10, 0], spine: [4, 0, 0], chest: [6, 6, 0], head: [-6, 0, 0],
        shoulderL: [-20, 0, 40], elbowL: [-72, 0, 0], shoulderR: [-18, 0, -38], elbowR: [-70, 0, 0],
        thighL: [-12, 12, 18], kneeL: [22, 0, 0], thighR: [10, -12, -18], kneeR: [18, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the pose: both arms flexed, chin up, absolutely not guarding
    rc_pose: (t) => {
      const s = Math.sin(t * 5) * 2;
      return {
        root: { y: 0.02, rx: -6 }, spine: [-6, 0, 0], chest: [-10 + s, 0, 0], neck: [-8, 0, 0], head: [-22, 0, 0],
        shoulderL: [-150, 0, 46], elbowL: [-128, 0, 0], shoulderR: [-150, 0, -46], elbowR: [-128, 0, 0],
        thighL: [-8, 14, 26], kneeL: [16, 0, 0], thighR: [6, -14, -26], kneeR: [14, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    rc_jabW: {
      root: { y: -0.06 }, hips: [0, -22, 0], spine: [4, -16, 0], chest: [4, -26, 0], head: [-6, 24, 0],
      shoulderR: [-34, 0, -30], elbowR: [-100, 0, 0], shoulderL: [-22, 0, 28], elbowL: [-76, 0, 0],
      thighL: [-14, 12, 18], kneeL: [22, 0, 0], thighR: [12, -12, -18], kneeR: [18, 0, 0],
    },
    rc_jab: {
      root: { y: -0.06, rx: 6 }, hips: [0, 18, 0], spine: [8, 18, 0], chest: [8, 32, 0], head: [-10, -26, 0],
      shoulderR: [-90, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-16, 0, 32], elbowL: [-86, 0, 0],
      thighL: [-24, 10, 18], kneeL: [32, 0, 0], thighR: [18, -10, -18], kneeR: [14, 0, 0],
    },
    rc_lariatW: {
      root: { y: -0.08, rx: -4 }, spine: [-4, -30, 0], chest: [-6, -42, 0], head: [-10, 34, 0],
      shoulderR: [-16, 0, -84], elbowR: [-16, 0, 0], shoulderL: [-30, 0, 34], elbowL: [-80, 0, 0],
      thighL: [-18, 14, 20], kneeL: [28, 0, 0], thighR: [14, -14, -20], kneeR: [22, 0, 0],
    },
    rc_lariat: {
      root: { y: -0.1, rx: 10 }, spine: [10, 34, 0], chest: [12, 48, 0], head: [6, -36, 0],
      shoulderR: [-10, 0, -96], elbowR: [-8, 0, 0], shoulderL: [-24, 0, 30], elbowL: [-70, 0, 0],
      thighL: [-32, 12, 20], kneeL: [44, 0, 0], thighR: [22, -12, -20], kneeR: [18, 0, 0],
    },
    rc_kneeW: {
      root: { y: 0.04, rx: -8 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0],
      shoulderL: [-96, 0, 26], elbowL: [-70, 0, 0], shoulderR: [-96, 0, -26], elbowR: [-70, 0, 0],
      thighR: [-112, 0, -8], kneeR: [128, 0, 0], footR: [26, 0, 0], thighL: [6, 0, 12], kneeL: [12, 0, 0],
    },
    rc_knee: {
      root: { y: -0.02, rx: 14 }, spine: [14, 0, 0], chest: [16, 0, 0], head: [4, 0, 0],
      shoulderL: [-60, 0, 22], elbowL: [-58, 0, 0], shoulderR: [-60, 0, -22], elbowR: [-58, 0, 0],
      thighR: [-126, 0, -6], kneeR: [116, 0, 0], footR: [30, 0, 0], thighL: [14, 0, 12], kneeL: [16, 0, 0],
    },
    // the Recoome Kick: a long, telegraphed leg that covers half the field
    rc_kickW: {
      root: { y: 0.06, rx: -10 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-18, 0, 0],
      shoulderL: [-130, 0, 34], elbowL: [-46, 0, 0], shoulderR: [-130, 0, -34], elbowR: [-46, 0, 0],
      thighR: [-96, 0, -10], kneeR: [96, 0, 0], footR: [20, 0, 0], thighL: [-6, 0, 12], kneeL: [22, 0, 0],
    },
    rc_kick: {
      root: { y: 0.02, rx: 12 }, spine: [10, 0, 0], chest: [12, 0, 0], head: [-6, 0, 0],
      shoulderL: [-40, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-40, 0, 0],
      thighR: [-128, 0, -6], kneeR: [10, 0, 0], footR: [-18, 0, 0], thighL: [18, 0, 12], kneeL: [20, 0, 0],
    },
    rc_eraserCharge: (t) => {
      const s = Math.sin(t * 28) * 1.8;
      return {
        root: { y: -0.06, rx: -6 }, spine: [-6, 0, 0], chest: [-10 + s, 0, 0], neck: [-12, 0, 0], head: [-24, 0, 0],
        shoulderL: [-26, 0, 52], elbowL: [-64, 0, 0], shoulderR: [-26, 0, -52], elbowR: [-64, 0, 0],
        thighL: [-20, 14, 20], kneeL: [30, 0, 0], thighR: [16, -14, -20], kneeR: [24, 0, 0],
        hands: ['open', 'open'],
      };
    },
    rc_eraserFire: (t) => {
      const s = Math.sin(t * 44) * 2.4;
      return {
        root: { y: -0.06, rx: 4 }, spine: [6, 0, 0], chest: [8 + s, 0, 0], neck: [8, 0, 0], head: [10, 0, 0],
        shoulderL: [-14, 0, 62], elbowL: [-44, 0, 0], shoulderR: [-14, 0, -62], elbowR: [-44, 0, 0],
        thighL: [-28, 12, 20], kneeL: [40, 0, 0], thighR: [22, -12, -20], kneeR: [18, 0, 0],
        hands: ['open', 'open'],
      };
    },
    rc_boomW: {
      root: { y: 0.1, rx: -14 }, spine: [-14, 0, 0], chest: [-18, 0, 0], head: [-26, 0, 0],
      shoulderL: [-168, 0, 30], elbowL: [-20, 0, 0], shoulderR: [-168, 0, -30], elbowR: [-20, 0, 0],
      thighL: [-16, 12, 22], kneeL: [26, 0, 0], thighR: [-12, -12, -22], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    rc_boom: {
      root: { y: -0.22, rx: 26 }, spine: [26, 0, 0], chest: [28, 0, 0], head: [18, 0, 0],
      shoulderL: [-16, 0, 18], elbowL: [-24, 0, 0], shoulderR: [-16, 0, -18], elbowR: [-24, 0, 0],
      thighL: [-52, 14, 22], kneeL: [68, 0, 0], thighR: [-48, -14, -22], kneeR: [64, 0, 0],
      hands: ['fist', 'fist'],
    },
    rc_taunt: (t) => {
      const b = Math.sin(t * 3) * 3;
      return {
        root: { y: 0 }, chest: [-6, 12, 0], head: [-14 + b, -12, 0],
        shoulderR: [-160, 0, -24], elbowR: [-30, 0, 0], shoulderL: [-14, 0, 34], elbowL: [-60, 0, 0],
        thighL: [-8, 10, 20], kneeL: [14, 0, 0], thighR: [6, -10, -20], kneeR: [12, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    rc_defeat: C.knockdown,
  };

  SL.data.characters.recoome = {
    id: 'recoome',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Recoome',
    fullName: 'Recoome, Ginyu Force',
    era: 'Namek Saga',
    playable: true, // Free Battle after "Recoome's Show" (unlocks.js)
    style: 'Showman',
    blurb: 'Enormous, cheerful and completely unbothered by anything you hit him with — as long as you let him finish his pose.',
    ratings: { power: 4, speed: 2, ki: 3, defense: 5 },
    stats: { hp: 26000, ki: 90, stamina: 170, speed: 0.95, power: 1.15, defense: 1.18, weight: 1.9, kiRegen: 2, chargeRate: 24, canonPower: 1.6 },
    poise: { max: 80, regen: 9, regenDelay: 120, armor: 2, cost: { 1: 6, 2: 10, 3: 18, 4: 30 }, beamMul: 1.3, beamArmor: true, breakFrames: 150, vulnerable: 1.3 },
    appearance: {
      height: 1.42,
      skin: RECOOME_SKIN,
      build: { chestW: 0.26, chestD: 0.19, shoulderX: 0.26, waistW: 0.19, waistD: 0.16, upperArmR: 0.078, foreArmR: 0.068, fist: 0.07, delt: 0.095, thighR: 0.105, shinR: 0.08, neckR: 0.095, headR: 0.118 },
      // the reference (p.13): his own red-orange mop, black short sleeves and black shorts on bare, heavy limbs, white
      // gloves and boots, the white chest with brown plates and hip guards
      hair: { style: 'recoome', color: RECOOME_HAIR },
      face: { pupil: 0x2a1a10, eyeW: 0.95, brow: RECOOME_HAIR, browThick: 1.4 },
      outfit: {
        topStyle: 'armor', top: GF_BLACK, arms: RECOOME_SKIN, sleeves: 'short', sleeveColor: GF_BLACK, pants: GF_BLACK, pantsStyle: 'tight', thighs: RECOOME_SKIN, legs: RECOOME_SKIN,
        gloves: GF_WHITE, boots: GF_WHITE, bootStyle: 'saiyan',
        armor: gfArmor(GF_WHITE, true),
        scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
      },
      portraitColor: '#d8582a',
    },
    vfx: { ghost: 0xffd0a0 },
    audio: { strikePitch: 0.85, heavyPitch: 0.75 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffd0a0, core: 0xffffff, particles: 0xffb070 }, mult: {} }],
    poses: recoomePoses,
    moves: {
      light: [
        { id: 'rcJab', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 420, reach: 1.4, radius: 0.85, lunge: 9, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'rc_jabW', strike: 'rc_jab' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'rcElbow', startup: 7, active: 4, recovery: 17, cancel: 10, damage: 450, reach: 1.4, radius: 0.85, lunge: 9, hitstun: 24, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'rc_jabW', strike: 'rc_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'rcKnee', startup: 9, active: 4, recovery: 20, cancel: 12, damage: 560, reach: 1.3, radius: 0.9, lunge: 10, hitstun: 28, knock: 'heavy', knockSpeed: 18, impact: 2, pose: { wind: 'rc_kneeW', strike: 'rc_knee' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'rcLariat', startup: 16, active: 5, recovery: 28, damage: 1300, reach: 1.7, radius: 1.2, lunge: 14, hitstun: 38, knock: 'smash', knockSpeed: 30, impact: 3, armor: true, guardCrush: true, guardDamage: 55, pose: { wind: 'rc_lariatW', strike: 'rc_lariat' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'rcSlam', startup: 14, active: 5, recovery: 26, damage: 1100, reach: 1.45, radius: 1.1, lunge: 12, hitstun: 36, knock: 'launch', knockSpeed: 20, impact: 3, armor: true, pose: { wind: 'rc_boomW', strike: 'rc_boom' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'rcTackle', startup: 10, active: 12, recovery: 26, damage: 1000, reach: 1.5, radius: 1.2, lunge: 32, hitstun: 32, knock: 'heavy', knockSpeed: 28, impact: 3, armor: true, pose: { wind: 'rc_kneeW', strike: 'rc_knee' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      throw: { id: 'rcSuplex', name: 'Recoome Suplex', damage: 1500, knockSpeed: 30, poses: ['grab', 'rc_boomW', 'rc_boom'] },
    },
    specials: {
      special1: {
        id: 'recoomeKick', name: 'Recoome Kick', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 18, dashFrames: 26, speed: 50, armor: true, recovery: 32,
        poses: { wind: 'rc_kickW' },
        hits: [
          { pose: 'rc_kick', damage: 900, frames: 14, sfx: 'punchHeavy' },
          { pose: 'rc_knee', damage: 1600, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
      special2: {
        id: 'eraserGun', name: 'Recoome Eraser Gun', type: 'beam', kiCost: 34, icon: 'beam',
        chargeMin: 30, chargeMax: 66, damage: [2100, 3200], radius: [0.7, 1.2], speed: 105, range: 150, sustain: 32,
        color: 0xffb060, core: 0xfff0d0, poses: { charge: 'rc_eraserCharge', fire: 'rc_eraserFire' }, recovery: 34, fromHead: true,
        callout: ['RECOOME', 'ERASER GUN!'],
      },
      ultimate: {
        id: 'recoomeBoom', name: 'Recoome Boom', type: 'projectile', kiCost: 90, icon: 'ultimate', ultimate: true, // kiCost is a full bar: 100 was more than this fighter can hold, so the button did nothing
        startup: 34, recovery: 40, pose: { wind: 'rc_boomW', release: 'rc_boom' },
        projectile: { kind: 'ball', speed: 50, radius: 1.6, damage: 4200, homing: 0.6, color: 0xffa040, core: 0xfff0d0, explode: 9, knock: 'smash', knockSpeed: 34, impact: 4, life: 3 },
      },
    },
    blast: { color: 0xffb070, core: 0xfff0d0, damage: 300, speed: 56, radius: 0.36, sfxPitch: 0.9 },
    mechanic: { type: 'boss', name: 'Showtime', desc: 'He stops to pose. Interrupt it and he gains nothing; let him finish and he hits harder for a while.' },
    boss: {
      phases: [
        { id: 'showboat', label: 'SHOWBOAT', hpAbove: 0.45, speed: 0.95, damage: 0.95, patience: 1.2, patterns: { melee: 1, pose: 0.6, kick: 0.5, eraser: 0.3, taunt: 0.5 } },
        // he stops playing to the crowd once it stops being fun
        { id: 'serious', label: 'SERIOUS', hpAbove: 0, speed: 1.1, damage: 1.15, patience: 0.5, line: 'angry', patterns: { melee: 1, kick: 0.75, eraser: 0.55, boom: 0.4 } },
      ],
      patterns: {
        pose: { technique: 'pose', maxDist: 22, cooldown: 420 },
        kick: { slot: 'special1', minDist: 4, maxDist: 30, cooldown: 340 },
        eraser: { slot: 'special2', minDist: 10, hold: 40, cooldown: 460 },
        boom: { slot: 'ultimate', minDist: 8, cooldown: 620 },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 20, cooldown: 560 },
      },
      techniques: {
        // 1,400 absorbed damage during the pose denies it. His armour does not stop damage, only
        // the stagger, and chip hits land around 500 after mitigation — so this is one committed
        // heavy or three solid pokes, and idle plinking is not enough.
        pose: { type: 'bossPose', frames: 72, buffFrames: 300, damageBuff: 1.25, breakDamage: 1400, breakStagger: 46, line: 'taunt', poses: { pose: 'rc_pose' } },
        taunt: { type: 'bossTaunt', frames: 80, line: 'taunt', poses: { taunt: 'rc_taunt' } },
      },
    },
    ai: { personality: 'berserker', aggression: 0.8, defense: 0.3, ranged: 0.35, beam: 0.4, transformHp: 0, preferredRange: 3, hooks: 'boss' },
    barks: { taunt: 'recoome_taunt', angry: 'recoome_angry', hurt: 'recoome_hurt' },
    intro: { pose: 'rc_pose', expression: 'grin' },
    victory: { poses: ['rc_pose'], expression: 'grin' },
    defeat: { pose: 'rc_defeat', expression: 'ko' },
  };

  SL.data.characters.guldo = {
    id: 'guldo',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Guldo',
    fullName: 'Guldo, Ginyu Force',
    era: 'Namek Saga',
    playable: true, // Free Battle after "Five Seconds" (unlocks.js)
    style: 'Psychic',
    blurb: 'The weakest member of the Ginyu Force, and the only one who can beat you without touching you — for as long as he can hold his breath.',
    ratings: { power: 1, speed: 1, ki: 5, defense: 2 },
    stats: { hp: 9000, ki: 130, stamina: 80, speed: 0.8, power: 0.6, defense: 0.72, weight: 0.9, kiRegen: 5, chargeRate: 34, canonPower: 0.6 },
    appearance: {
      height: 0.74,
      skin: GULDO_SKIN,
      build: { chestW: 0.215, chestD: 0.17, shoulderX: 0.2, waistW: 0.185, waistD: 0.16, pelvisW: 0.17, upperArmR: 0.055, foreArmR: 0.05, fist: 0.055, thighR: 0.082, shinR: 0.062, neckR: 0.085, neckLen: 0.005, headR: 0.135 },
      hair: { style: 'frieza_dome', color: GULDO_SKIN },
      headExtras: [
        // the second pair of eyes: round and white on the SIDES of the head, where ears would be (visual reference
        // p.18; they sat on his forehead)
        { shape: 'ball', a: [0.97, 0.2, 0.05], d: [1, 0, 0.15], l: 0.02, r: 0.058, color: 0xffffff, depth: 1.04, flat: 0.55, outline: 0.35 },
        { shape: 'ball', a: [-0.97, 0.2, 0.05], d: [-1, 0, 0.15], l: 0.02, r: 0.058, color: 0xffffff, depth: 1.04, flat: 0.55, outline: 0.35 },
        { shape: 'ball', a: [0.97, 0.2, 0.22], d: [1, 0, 0.3], l: 0.012, r: 0.02, color: 0x101010, depth: 1.16, flat: 0.6, outline: 0 },
        { shape: 'ball', a: [-0.97, 0.2, 0.22], d: [-1, 0, 0.3], l: 0.012, r: 0.02, color: 0x101010, depth: 1.16, flat: 0.6, outline: 0 },
      ],
      // the small round pink mouth (reference p.18)
      face: { pupil: 0x101010, eyeW: 1.05, noEars: true, brow: GULDO_DARK, mouthColor: 0xd85a9a, mouthZ: 0.95 },
      // black long sleeves and baggy black trousers, white gloves and boots, the white chest with brown plates
      outfit: {
        topStyle: 'armor', top: GF_BLACK, arms: GF_BLACK, pants: GF_BLACK, pantsStyle: 'gi',
        gloves: GF_WHITE, boots: GF_WHITE, bootStyle: 'saiyan',
        armor: ARMOR, scouter: { lens: 0x3cff78, body: 0xd8d8d8 },
      },
      portraitColor: '#7fb86a',
    },
    vfx: { ghost: 0xc8e8b0 },
    audio: { strikePitch: 1.3, heavyPitch: 1.15 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc8e8b0, core: 0xffffff, particles: 0xb0e0a0 }, mult: {} }],
    poses: guldoPoses,
    moves: {
      light: [
        { id: 'gdSlap', startup: 6, active: 3, recovery: 14, cancel: 8, damage: 200, reach: 1, radius: 0.65, lunge: 7, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'gd_slapW', strike: 'gd_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gdBackhand', startup: 6, active: 3, recovery: 15, cancel: 9, damage: 215, reach: 1, radius: 0.65, lunge: 7, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'gd_slapW', strike: 'gd_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gdStubKick', startup: 8, active: 4, recovery: 18, cancel: 11, damage: 260, reach: 1.1, radius: 0.7, lunge: 8, hitstun: 20, knock: 'push', knockSpeed: 6, impact: 1, pose: { wind: 'gd_kickW', strike: 'gd_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gdFlail', startup: 14, active: 5, recovery: 26, damage: 420, reach: 1.05, radius: 0.8, lunge: 8, hitstun: 26, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'gd_slapW', strike: 'gd_slap' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'gdRoll', startup: 8, active: 8, recovery: 24, damage: 380, reach: 1.05, radius: 0.8, lunge: 20, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'gd_kickW', strike: 'gd_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'gdShove', name: 'Shove', damage: 420, knockSpeed: 16, poses: ['grab', 'gd_slapW', 'gd_slap'] },
    },
    specials: {
      // the identity: nobody else can act while he holds his breath — and then he is helpless
      special1: {
        id: 'timeFreeze', name: 'Time Freeze', type: 'timeFreeze', kiCost: 34, icon: 'teleport', cooldown: 460,
        range: 26, startup: 10, holdFrames: 96, kiPerSecond: 26, recovery: 46,
        poses: { hold: 'gd_hold' },
      },
      special2: {
        id: 'guldoGrip', name: 'Psychic Grip', type: 'telekinesis', kiCost: 22, icon: 'teleport', cooldown: 260,
        range: 20, startup: 12, maxFrames: 130, bossFrames: 55, kiPerSecond: 15, releaseStagger: 24, recovery: 20,
        mashGain: 0.07, escapeDecay: 0.004, cpuEscape: 0.006,
        poses: { focus: 'gd_focus', hold: 'gd_focus' },
      },
      ultimate: {
        id: 'boulderThrow', name: 'Boulder Throw', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 30, recovery: 34, pose: { wind: 'gd_throwW', release: 'gd_throw' },
        projectile: { kind: 'ball', speed: 42, radius: 1.8, damage: 3400, homing: 0.5, color: 0x8a7a5a, core: 0xc8b890, explode: 7, knock: 'smash', knockSpeed: 30, impact: 4, life: 3.2 },
      },
    },
    blast: { color: 0xbfe89a, core: 0xeaffd8, damage: 180, speed: 54, radius: 0.28, sfxPitch: 1.35 },
    mechanic: { type: 'boss', name: 'Stolen Seconds', desc: 'Two phases: smug, then panicking — the more it hurts, the more often he stops time.' },
    boss: {
      phases: [
        { id: 'smug', label: 'SMUG', hpAbove: 0.5, speed: 1, damage: 1, patience: 1.1, patterns: { melee: 0.6, freeze: 0.5, grip: 0.45, boulder: 0.35, taunt: 0.4 } },
        { id: 'panicking', label: 'PANICKING', hpAbove: 0, speed: 1.1, damage: 1, patience: 0.5, line: 'angry', patterns: { melee: 0.35, freeze: 0.95, grip: 0.65, boulder: 0.6 } },
      ],
      patterns: {
        freeze: { slot: 'special1', minDist: 2, maxDist: 24, cooldown: 480 },
        grip: { slot: 'special2', minDist: 4, maxDist: 20, cooldown: 300 },
        boulder: { slot: 'ultimate', minDist: 8, cooldown: 520 },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 18, cooldown: 600 },
      },
      techniques: {
        taunt: { type: 'bossTaunt', frames: 70, line: 'taunt', poses: { taunt: 'gd_taunt' } },
      },
    },
    ai: { personality: 'gunner', aggression: 0.35, defense: 0.6, ranged: 0.7, beam: 0.15, transformHp: 0, preferredRange: 12, hooks: 'boss' },
    barks: { taunt: 'guldo_taunt', angry: 'guldo_angry', hurt: 'guldo_hurt' },
    intro: { pose: 'gd_taunt', expression: 'smirk' },
    victory: { poses: ['gd_taunt'], expression: 'grin' },
    defeat: { pose: 'gd_defeat', expression: 'hurt' },
  };
})();
