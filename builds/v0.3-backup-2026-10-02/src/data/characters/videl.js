/*
 * VIDEL (Buu Saga, Age 774) — Mr. Satan's daughter, and the only person in
 * Satan City who actually fights crime.
 *
 * Identity: a martial artist among people who throw planets. She has no ki
 * attacks and cannot fly when the story meets her; what she has is technique,
 * reading and nerve. Mechanically she is the game's first pure striker: fast,
 * cheap, short-ranged combinations, a real counter off a Perfect Guard, and
 * `battleHardened` — she gets tougher as the fight goes on instead of stronger.
 *
 * Flight is a story unlock: Gohan teaches her (`buu_flight`, Milestone B). Her
 * definition carries `flight: false` so nothing hands it to her early by accident;
 * the lesson lifts it and the mission teaches her through a flight controller.
 *
 * CONSTRUCTION (rebuilt 2026-09-25 from the owner's reference sheet — her own body, not a
 * fighter's body with another head): a small, athletic woman's build (narrow shoulders and
 * waist, hips wider than the waist, a bust, slim limbs, small hands), a face of her own (large
 * blue eyes with a lash flick, a small nose and chin, no cheekbones), and her hair in two long
 * tails tied low with gold ties (the short cut and the Super-era bob are wardrobe hair). Her
 * clothes are wardrobe outfits (src/data/wardrobe.js, profile videl): the oversized white
 * T-shirt worn out over black bike shorts, dark fingerless gloves, boots with purple socks; the
 * shirt's hem is two half-skirts that lift with her legs (Model._buildHem). appearance.outfit
 * below is that first look, for contexts without a wardrobe.
 *
 * MOVEMENT: side-on and light on her feet — a bouncing guard with the lead fist at her chin, a
 * sprinter's run, a high tight guard, kicks as her finish (the Eagle Kick is a flying kick), and,
 * once she can fly, a careful hover with her arms out for balance. She has no ki to charge: her
 * "charge" is a breath and a set of the feet.
 *
 * Level 1 functional prototype; playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const SKIN = 0xf9dcc4;
  // the first look: the oversized white T-shirt, bike shorts, fingerless gloves, green boots, purple socks
  const OUTFIT = {
    topStyle: 'shirt', top: 0xf6f4ef, sleeves: 'short', sleeveColor: 0xf6f4ef,
    loose: 1.14, hem: { len: 0.19, flare: 1.1 },
    pants: 0x17171c, pantsStyle: 'tight', legs: SKIN,
    gloves: 0x2c2420, fingerless: true,
    boots: 0x5e9e4a, bootStyle: 'gi', bootTrim: 0xe0b83a, socks: 0x7a4aa6,
  };

  const poses = {
    // side-on, up on the balls of her feet, the lead fist at her chin: a fighter who has never
    // needed a stance for cameras, bouncing
    vd_idle: (t) => {
      const b = Math.sin(t * 6.2), c = Math.abs(Math.sin(t * 3.1));
      return {
        root: { y: -0.05 + c * 0.018 },
        hips: [0, -24, 0], spine: [6, 4, 0], chest: [4, 14, 0], head: [-4, -14, 0],
        shoulderL: [-70, 0, 18], elbowL: [-118, 0, 0], handL: [10, 0, 0], shoulderR: [-42, 0, -26], elbowR: [-132, 0, 0],
        thighL: [-26, 14, 10], kneeL: [30 + b * 3, 0, 0], footL: [-10, 0, 0], thighR: [16, -10, -12], kneeR: [26 + b * 3, 0, 0], footR: [-20, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // out of a fight: weight on one leg, hands on her hips
    vd_ready: (t) => {
      const b = Math.sin(t * 1.7);
      return {
        root: { y: -0.02 + b * 0.004 }, hips: [0, 0, 6], spine: [0, 0, -4], chest: [-2, 4, 0], head: [-4, -6, 4],
        shoulderL: [6, 0, 48], elbowL: [-10, 0, -104], shoulderR: [6, 0, -48], elbowR: [-10, 0, 104],
        thighL: [-4, 0, 12], kneeL: [4, 0, 0], thighR: [-8, -6, -4], kneeR: [18, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // a sprinter: fists, the arms driving, the knees high
    vd_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 13 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.02 + Math.abs(c) * 0.05, rx: 12 },
        spine: [6, s * 6, 0], chest: [4, s * 9, 0], head: [-14, -s * 6, 0],
        shoulderL: [s * 62 - 14, 0, 12], elbowL: [-96, 0, 0], shoulderR: [-s * 62 - 14, 0, -12], elbowR: [-96, 0, 0],
        thighL: [-s * 58 - 14, 0, 4], kneeL: [34 + Math.max(0, s) * 74, 0, 0], footL: [12, 0, 0],
        thighR: [s * 58 - 14, 0, -4], kneeR: [34 + Math.max(0, -s) * 74, 0, 0], footR: [12, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // flying, the way she learned it: careful, the arms out for balance, the legs together
    vd_flyIdle: (t) => {
      const s = Math.sin(t * 2.4);
      return {
        root: { y: s * 0.03 }, spine: [2, 0, 0], chest: [0, 0, s * 2], head: [4, 0, 0],
        shoulderL: [-10, 0, 40 + s * 6], elbowL: [-24, 0, 0], shoulderR: [-10, 0, -40 + s * 6], elbowR: [-24, 0, 0],
        thighL: [-14, 0, 4], kneeL: [24, 0, 0], footL: [30, 0, 0], thighR: [-10, 0, -4], kneeR: [20, 0, 0], footR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    vd_flyForward: (t) => {
      const s = Math.sin(t * 5);
      return {
        root: { rx: 62 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-46, 0, 0],
        shoulderL: [-160, 0, 18], elbowL: [-10, 0, 0], shoulderR: [16, 0, -20], elbowR: [-30, 0, 0],
        thighL: [4 + s * 3, 0, 4], kneeL: [16, 0, 0], footL: [34, 0, 0], thighR: [10 - s * 3, 0, -4], kneeR: [30, 0, 0], footR: [34, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // high and tight: forearms up in front of the face, elbows in
    vd_guard: {
      root: { y: -0.08 }, hips: [0, -16, 0], spine: [10, 0, 0], chest: [10, 8, 0], head: [8, -6, 0],
      shoulderL: [-82, 0, 8], elbowL: [-142, 0, 0], shoulderR: [-78, 0, -8], elbowR: [-146, 0, 0],
      thighL: [-24, 10, 12], kneeL: [38, 0, 0], thighR: [12, -8, -12], kneeR: [34, 0, 0],
      hands: ['fist', 'fist'],
    },
    // no ki to gather: a breath, the fists at the hips, the feet set
    vd_charge: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.12 + b * 0.006 }, spine: [8, 0, 0], chest: [-4 + b, 0, 0], head: [2, 0, 0],
        shoulderL: [12, 0, 22], elbowL: [-96, 0, 0], shoulderR: [12, 0, -22], elbowR: [-96, 0, 0],
        thighL: [-28, 0, 24], kneeL: [46, 0, 0], thighR: [-28, 0, -24], kneeR: [46, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    vd_jabW: {
      root: { y: -0.05 }, hips: [0, -20, 0], chest: [4, -8, 0], head: [-4, 10, 0],
      shoulderR: [-40, 0, -18], elbowR: [-126, 0, 0], shoulderL: [-62, 0, 18], elbowL: [-110, 0, 0],
      thighL: [-24, 10, 12], kneeL: [32, 0, 0], thighR: [14, -8, -12], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_jab: {
      root: { y: -0.06, rx: 6 }, hips: [0, -10, 0], chest: [6, 30, 0], head: [-10, -18, 0],
      shoulderR: [-96, 0, 0], elbowR: [-4, 0, 0], shoulderL: [-54, 0, 18], elbowL: [-120, 0, 0],
      thighL: [-30, 0, 12], kneeL: [38, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0], footR: [-24, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_hookW: {
      root: { y: -0.04 }, spine: [-4, -26, 0], chest: [-6, -30, 0], head: [-4, 22, 0],
      shoulderR: [-60, 0, -52], elbowR: [-96, 0, 0], shoulderL: [-44, 0, 24], elbowL: [-112, 0, 0],
      thighL: [-18, 0, 12], kneeL: [28, 0, 0], thighR: [10, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_hook: {
      root: { y: -0.06, rz: 10 }, spine: [6, 34, 0], chest: [10, 38, 0], head: [-8, -26, 0],
      shoulderR: [-78, 0, -18], elbowR: [-50, 0, 0], shoulderL: [-40, 0, 26], elbowL: [-116, 0, 0],
      thighL: [-28, 0, 12], kneeL: [36, 0, 0], thighR: [16, 0, -12], kneeR: [20, 0, 0], footR: [-20, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_kneeW: {
      root: { y: -0.06 }, spine: [8, 0, 0], chest: [10, 0, 0], head: [-6, 0, 0],
      shoulderL: [-70, 0, 22], elbowL: [-120, 0, 0], shoulderR: [-70, 0, -22], elbowR: [-120, 0, 0],
      thighR: [-52, 0, -10], kneeR: [96, 0, 0], thighL: [-8, 0, 10], kneeL: [14, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_knee: {
      root: { y: 0.04, rx: -8 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-14, 0, 0],
      shoulderL: [-56, 0, 26], elbowL: [-110, 0, 0], shoulderR: [-56, 0, -26], elbowR: [-110, 0, 0],
      thighR: [-116, 0, -8], kneeR: [128, 0, 0], thighL: [10, 0, 10], kneeL: [12, 0, 0], footL: [-20, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_kickW: { ...C.kickWindR, root: { y: -0.08 } },
    // a high roundhouse: her signature, the arms flung out for the turn
    vd_kick: {
      root: { y: 0.02, rz: -16 }, chest: [-4, 46, 0], head: [-6, -34, 0],
      shoulderL: [-16, 0, 64], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -58], elbowR: [-40, 0, 0],
      thighR: [-100, 0, -34], kneeR: [6, 0, 0], footR: [34, 0, 0], thighL: [12, 0, 8], kneeL: [18, 0, 0], footL: [-24, 0, 0],
      hands: ['fist', 'fist'],
    },
    // THE EAGLE KICK: in the air, one leg driven out straight, the other tucked, the arms back
    vd_eagleW: {
      root: { y: 0.1, rx: -10 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-4, 0, 0],
      shoulderL: [30, 0, 40], elbowL: [-40, 0, 0], shoulderR: [30, 0, -40], elbowR: [-40, 0, 0],
      thighL: [-40, 0, 8], kneeL: [110, 0, 0], thighR: [-60, 0, -8], kneeR: [120, 0, 0],
      hands: ['fist', 'fist'],
    },
    vd_eagle: {
      root: { y: 0.16, rx: -26 }, spine: [-10, 0, 0], chest: [-10, 12, 0], head: [16, -8, 0],
      shoulderL: [40, 0, 50], elbowL: [-20, 0, 0], shoulderR: [36, 0, -54], elbowR: [-24, 0, 0],
      thighR: [-96, 0, -6], kneeR: [4, 0, 0], footR: [40, 0, 0], thighL: [-50, 0, 10], kneeL: [124, 0, 0], footL: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    // arms folded, unimpressed
    vd_arms: {
      root: { y: -0.02 }, hips: [0, -4, 4], spine: [2, 0, 0], chest: [2, 6, 0], head: [-6, -8, 0],
      shoulderL: [-14, -72, 6], elbowL: [-94, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-90, 0, 0],
      thighL: [-6, 2, 10], kneeL: [10, 0, 0], thighR: [-8, -6, -6], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    // pointing at somebody who owes her an explanation
    vd_point: {
      root: { y: -0.02 }, hips: [0, -6, 0], chest: [2, 12, 0], head: [-6, -10, 0],
      shoulderR: [-94, 0, -4], elbowR: [-4, 0, 0], shoulderL: [6, 0, 48], elbowL: [-10, 0, -104],
      thighL: [-10, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['fist', 'point'],
    },
    // talking: one hand on a hip, the other making the point
    vd_talk: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: -0.02 }, hips: [0, 0, 5], chest: [0, 6, 0], head: [-4, -6 + b * 3, 3],
        shoulderL: [6, 0, 48], elbowL: [-10, 0, -104], shoulderR: [-40 + b * 8, 0, -22], elbowR: [-74, 0, 0],
        thighL: [-4, 0, 12], kneeL: [4, 0, 0], thighR: [-8, -6, -4], kneeR: [16, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // she won: one fist up
    vd_victory: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.01 + Math.abs(b) * 0.01 }, hips: [0, 0, 4], chest: [-6, 8, 0], head: [-10, -6, 0],
        shoulderR: [-170, 0, -10], elbowR: [-24, 0, 0], shoulderL: [6, 0, 48], elbowL: [-10, 0, -104],
        thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [-6, -6, -6], kneeR: [16, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // running out: the guard still up but sagging, shoulders heaving, one hand open for balance
    vd_tired: (t) => {
      const b = Math.sin(t * 5.2);
      return {
        root: { y: -0.11 + b * 0.012 }, hips: [0, -16, 0], spine: [16 + b * 2, 0, 0], chest: [10 + b * 3, 8, 0], head: [-16, -6, 0],
        shoulderL: [-50, 0, 20], elbowL: [-100, 0, 0], shoulderR: [-28, 0, -24], elbowR: [-78, 0, 0],
        thighL: [-20, 10, 12], kneeL: [34, 0, 0], thighR: [12, -8, -12], kneeR: [30, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // beaten, down on one knee, a hand on the ground, still looking up
    vd_defeat: {
      root: { y: -0.4, rx: 14 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [-26, 0, 0],
      shoulderR: [-30, 0, -20], elbowR: [-10, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-60, 0, 0],
      thighL: [-80, 0, 10], kneeL: [100, 0, 0], thighR: [10, 0, -12], kneeR: [100, 0, 0], footR: [-30, 0, 0],
      hands: ['open', 'fist'],
    },
  };

  SL.data.characters.videl = {
    id: 'videl',
    assetLevel: 1,
    name: 'Videl',
    fullName: 'Videl Satan',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Martial Artist',
    blurb: 'The champion\'s daughter, doing the job the police call her for. No ki, no flight, no patience for mysteries.',
    ratings: { power: 2, speed: 3, ki: 1, defense: 2 },
    stats: { hp: 7200, ki: 60, stamina: 150, speed: 1.06, power: 0.62, defense: 0.85, weight: 0.78, kiRegen: 1.3, chargeRate: 16, canonPower: 0.05 },
    appearance: {
      height: 0.86,
      skin: SKIN,
      // her own build: a small athletic woman (narrow shoulders and waist, the hips wider than the
      // waist, a bust, slim arms and legs, small hands and feet, a small head)
      build: {
        chestW: 0.176, chestD: 0.126, chestTop: 0.27, shoulderX: 0.176, shoulderY: 0.22, delt: 0.056,
        waistW: 0.112, waistD: 0.092, absLen: 0.19, pelvisW: 0.148, pelvisH: 0.11, pelvisD: 0.12, hipX: 0.088,
        upperArmR: 0.041, foreArmR: 0.036, fist: 0.044, thighR: 0.077, shinR: 0.056,
        neckR: 0.042, neckLen: 0.07, headR: 0.124, footLen: 0.85, bust: 1,
      },
      hair: { style: 'videl', color: 0x14141c },
      face: { pupil: 0x2f6fb4, eyeW: 1.12, eyeH: 1.2, lashWing: true, jaw: 0.92, jawW: 0.9, cheeks: 0, nose: 0.7, browThick: 0.75, browW: 0.92 },
      outfit: OUTFIT,
      portraitColor: '#2f3a58',
    },
    vfx: { ghost: 0xd8e8ff },
    audio: { strikePitch: 1.18, heavyPitch: 1.08 },
    // she cannot fly until Gohan teaches her (); nothing in a fight hands it over
    flight: false,
    flightUnlock: 'buu_flight',
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xdfe8ff, core: 0xffffff, particles: 0xcfe0ff }, mult: {} }],
    poses: Object.assign({ idle: poses.vd_idle, run: poses.vd_run, flyIdle: poses.vd_flyIdle, flyForward: poses.vd_flyForward, guard: poses.vd_guard, charge: poses.vd_charge, powerUp: poses.vd_charge }, poses),
    moves: {
      light: [
        { id: 'vdJab', startup: 3, active: 3, recovery: 8, cancel: 5, damage: 210, reach: 1.05, radius: 0.68, lunge: 12, hitstun: 15, knock: 'flinch', impact: 1, pose: { wind: 'vd_jabW', strike: 'vd_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'vdCross', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 230, reach: 1.05, radius: 0.68, lunge: 12, hitstun: 15, knock: 'flinch', impact: 1, pose: { wind: 'vd_jabW', strike: 'vd_jab' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'vdHook', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 280, reach: 1.05, radius: 0.7, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'vd_hookW', strike: 'vd_hook' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'vdKick', startup: 6, active: 4, recovery: 13, cancel: 8, damage: 380, reach: 1.35, radius: 0.82, lunge: 13, hitstun: 24, knock: 'push', knockSpeed: 11, impact: 2, pose: { wind: 'vd_kickW', strike: 'vd_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'vdKnee', startup: 9, active: 4, recovery: 18, damage: 760, reach: 1.1, radius: 0.85, lunge: 15, hitstun: 34, knock: 'crumple', impact: 3, guardCrush: true, guardDamage: 40, pose: { wind: 'vd_kneeW', strike: 'vd_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'vdUpper', startup: 8, active: 4, recovery: 16, damage: 520, reach: 1.05, radius: 0.8, lunge: 11, hitstun: 30, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'vd_hookW', strike: 'vd_hook' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'vdRush', startup: 4, active: 6, recovery: 15, damage: 520, reach: 1.25, radius: 0.85, lunge: 30, hitstun: 26, knock: 'heavy', knockSpeed: 20, impact: 2, pose: { wind: 'vd_jabW', strike: 'vd_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      // a real counter: what she has instead of energy
      counter: {
        light: { id: 'vdPunish', startup: 2, active: 4, recovery: 12, damage: 520, reach: 1.05, radius: 0.85, lunge: 10, hitstun: 32, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'vd_hookW', strike: 'vd_hook' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
        heavy: { id: 'vdKneeCounter', startup: 4, active: 4, recovery: 16, damage: 820, reach: 1.1, radius: 0.85, lunge: 12, hitstun: 40, knock: 'crumple', impact: 3, guardCrush: true, guardDamage: 44, pose: { wind: 'vd_kneeW', strike: 'vd_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      throw: { id: 'vdThrow', name: 'Arm Throw', damage: 600, knockSpeed: 24, poses: ['grab', 'vd_hookW', 'vd_hook'] },
    },
    specials: {
      special1: {
        id: 'vdCombo', name: 'Eagle Combination', type: 'rush', kiCost: 22, icon: 'rush',
        startup: 4, dashFrames: 13, speed: 48, recovery: 20,
        poses: { wind: 'vd_jabW' },
        hits: [
          { pose: 'vd_jab', damage: 240, frames: 5, sfx: 'punchLight' },
          { pose: 'vd_hook', damage: 260, frames: 5, sfx: 'punchLight' },
          { pose: 'vd_knee', damage: 380, frames: 7, sfx: 'punchHeavy' },
          { pose: 'vd_kick', damage: 620, frames: 14, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 26, impact: 3 },
        ],
      },
      // close the distance and do not stop: her answer to anyone bigger than she is
      special2: {
        id: 'vdRapid', name: 'Rapid Fists', type: 'rush', kiCost: 18, icon: 'rush',
        startup: 3, dashFrames: 11, speed: 44, recovery: 18,
        poses: { wind: 'vd_jabW' },
        hits: [
          { pose: 'vd_jab', damage: 180, frames: 4, sfx: 'punchLight' },
          { pose: 'vd_jab', damage: 180, frames: 4, sfx: 'punchLight' },
          { pose: 'vd_hook', damage: 200, frames: 4, sfx: 'punchLight' },
          { pose: 'vd_hook', damage: 200, frames: 4, sfx: 'punchLight' },
          { pose: 'vd_knee', damage: 420, frames: 10, sfx: 'punchHeavy', knock: 'crumple', impact: 3 },
        ],
      },
      // the one she is known for, and the only thing in her kit that reads as a finisher: the
      // knee, the hook, and the flying kick
      ultimate: {
        id: 'vdEagle', name: 'Eagle Kick', type: 'rush', kiCost: 60, icon: 'ultimate', ultimate: true, // kiCost is a full bar: 100 was more than this fighter can hold, so the button did nothing
        startup: 8, dashFrames: 18, speed: 62, recovery: 30,
        poses: { wind: 'vd_eagleW' },
        hits: [
          { pose: 'vd_knee', damage: 620, frames: 8, sfx: 'punchHeavy' },
          { pose: 'vd_hook', damage: 640, frames: 8, sfx: 'punchHeavy' },
          { pose: 'vd_eagle', damage: 1900, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
    },
    mechanic: { type: 'battleHardened', name: 'Battle Hardened', desc: 'Every exchange teaches her something: the longer the fight runs, the less it costs her to keep going.' },
    ai: { personality: 'martial', aggression: 0.68, defense: 0.7, ranged: 0, beam: 0, transformHp: 0, preferredRange: 1.8 },
    intro: { pose: 'vd_point', expression: 'angry' },
    victory: { poses: ['vd_victory', 'vd_arms'], expression: 'grin' },
    defeat: { pose: 'vd_defeat', expression: 'hurt' },
  };
})();
