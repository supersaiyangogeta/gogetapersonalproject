/*
 * THE COLD FAMILY ON EARTH (Android Saga, Age 764)
 *
 *   mecha_frieza  what was left of him after Namek, rebuilt in metal
 *   king_cold     his father, who has never had to fight anybody
 *
 * Mecha Frieza is deliberately NOT the Namek boss with new numbers. He is a
 * separate fighter: the same body language (he shares Frieza's pose library,
 * because it is the same person) with a mechanical arm, a shorter temper and a
 * kit built around one idea — he opens with everything, because the last time
 * he took his time it cost him his body.
 *
 * King Cold is the opposite problem: enormous reach, a borrowed sword, and no
 * idea what to do when something is faster than he is.
 *
 * Both are Level 1 functional prototypes and story-only.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const FZ = SL.data.characters.frieza;

  /* ------------------------------------------------------------ Mecha Frieza */

  const mechaPoses = Object.assign({}, FZ.poses, {
    // the mechanical arm leads everything he does now
    mf_sweepW: {
      root: { y: -0.05 }, chest: [0, 34, 0], head: [0, -18, 0],
      shoulderR: [-30, 0, -70], elbowR: [-70, 0, 0], shoulderL: [-20, 0, 26], elbowL: [-60, 0, 0],
      thighL: [-18, 0, 12], kneeL: [26, 0, 0], thighR: [12, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    mf_sweep: {
      root: { y: -0.08, rx: 6 }, chest: [4, -44, 0], head: [-4, 26, 0],
      shoulderR: [-88, 0, 44], elbowR: [-4, 0, 0], shoulderL: [-24, 0, 34], elbowL: [-50, 0, 0],
      thighL: [-32, 0, 12], kneeL: [40, 0, 0], thighR: [18, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    // CHAPTER 5 (the demonstration): the walk, the boast, the order, the Supernova, the fear
    mf_walk: (t) => {
      const ph = t * 4.6, s = Math.sin(ph);
      return {
        root: { y: -0.01 + Math.abs(Math.cos(ph)) * 0.015 }, chest: [-4, s * 3, 0], head: [-6, 0, 0],
        shoulderR: [-s * 10, 0, -12], elbowR: [-20, 0, 0], shoulderL: [s * 10, 0, 12], elbowL: [-20, 0, 0],
        thighL: [-s * 22 - 2, 0, 4], kneeL: [8 + Math.max(0, s) * 30, 0, 0], thighR: [s * 22 - 2, 0, -4], kneeR: [8 + Math.max(0, -s) * 30, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    mf_fist: {
      root: { y: -0.02 }, chest: [4, 0, 0], head: [8, 0, 0],
      shoulderR: [-60, 0, -10], elbowR: [-120, 0, 0], shoulderL: [-10, 0, 14], elbowL: [-30, 0, 0],
      thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['fist', 'fist'],
    },
    mf_boast: {
      root: { y: -0.01 }, chest: [-8, 10, 0], head: [-14, -6, 0],
      shoulderR: [-150, 0, -30], elbowR: [-70, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['fist', 'fist'],
    },
    mf_order: {
      root: { y: -0.01 }, chest: [-4, -14, 0], head: [-10, 10, 0],
      shoulderR: [-70, 0, -60], elbowR: [-10, 0, 0], shoulderL: [-8, 0, 12], elbowL: [-30, 0, 0],
      thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
      hands: ['fist', 'open'],
    },
    // one finger up, and the sun grows on it
    mf_raise1: {
      root: { y: 0 }, chest: [-12, 0, 0], head: [-18, 0, 0],
      shoulderR: [-178, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-50, 0, 0],
      thighL: [-20, 0, 10], kneeL: [30, 0, 0], thighR: [-6, 0, -10], kneeR: [20, 0, 0],
      hands: ['fist', 'point'],
    },
    mf_laugh: (t) => {
      const b = Math.sin(t * 18);
      return {
        root: { y: 0.01 + b * 0.006 }, chest: [-16 + b * 2, 0, 0], head: [-28, 0, 0],
        shoulderR: [-40, 0, -20], elbowR: [-100, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-100, 0, 0],
        thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [4, 0, -8], kneeR: [6, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the recoil: hands up, weight back, his face gone white
    mf_recoil: (t) => {
      const s = Math.sin(t * 34) * 1.2;
      return {
        root: { y: -0.05, rx: -8 }, spine: [-8, 0, 0], chest: [-10 + s, 0, 0], head: [4, 0, 0],
        shoulderR: [-70, 0, -30], elbowR: [-110, 0, 0], shoulderL: [-70, 0, 30], elbowL: [-110, 0, 0],
        thighL: [-24, 0, 12], kneeL: [36, 0, 0], thighR: [10, 0, -12], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // in the air over the blast, pointing down at it and laughing
    mf_leap: {
      root: { rx: -10 }, chest: [-10, 16, 0], head: [20, -10, 0],
      shoulderR: [-40, 0, -20], elbowR: [-6, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0],
      thighL: [-60, 0, 10], kneeL: [90, 0, 0], thighR: [-20, 0, -10], kneeR: [60, 0, 0],
      hands: ['fist', 'point'],
    },
    mf_vent: (t) => {
      const s = Math.sin(t * 30);
      return {
        root: { y: -0.04 + s * 0.004 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0],
        shoulderR: [-40, 0, -40], elbowR: [-60, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-60, 0, 0],
        thighL: [-16, 0, 14], kneeL: [24, 0, 0], thighR: [10, 0, -14], kneeR: [18, 0, 0],
        hands: ['open', 'open'],
      };
    },
  });

  SL.data.characters.mecha_frieza = {
    id: 'mecha_frieza',
    assetLevel: 1,
    name: 'Mecha Frieza',
    fullName: 'Frieza, rebuilt',
    era: 'Android Saga',
    playable: true, // Free Battle after "The Stranger" (unlocks.js)
    prototype: true,
    style: 'Cybernetic Emperor',
    blurb: 'Half of him is metal now, and none of the patience survived.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 5 },
    stats: { hp: 34000, ki: 150, stamina: 160, speed: 1.24, power: 1.5, defense: 1.35, weight: 1.2, kiRegen: 4, chargeRate: 36, canonPower: 12 },
    poise: { max: 95, regen: 12, regenDelay: 110, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 150, vulnerable: 1.2 },
    vfx: { ghost: 0xc8d4e4 },
    appearance: {
      height: 0.74,
      skin: 0xf2ece6,
      build: { chestW: 0.18, shoulderX: 0.19, waistW: 0.125, upperArmR: 0.05, foreArmR: 0.046, thighR: 0.075, shinR: 0.06, headR: 0.13 },
      hair: { style: 'frieza_shell', color: 0x8a3fb8 },
      // Frieza's own face (frieza_force.js: ringed, slanted eyes, dark brow ridges and lips) on the rebuilt body
      face: { pupil: 0x6a0a1a, sclera: 0xffffff, brow: 0x4a3a52, browThick: 0.6, noEars: true, eyeW: 1.1, eyeH: 0.85, eyeRim: 0x141014, eyeTilt: 0.14, mouthColor: 0x3a1636, mouthZ: 0.93, jaw: 1.06, jawW: 0.88, cheeks: 0.8 },
      outfit: {
        // the rebuilt half reads as plating over the same silhouette
        topStyle: 'armor', top: 0xc6ccd6, arms: 0xc6ccd6, pants: 0x6a6f7a, pantsStyle: 'tight', legs: 0xc6ccd6,
        boots: 0xc6ccd6, bootStyle: 'gi',
        armor: { plate: 0x8a8f9a, belly: 0xe8ecf2, pads: 0x6a6f7a, padStyle: 'down' },
      },
      portraitColor: '#9aa6b8',
    },
    forms: [
      {
        id: 'base',
        name: 'Mecha',
        aura: { color: 0xff3a6a, core: 0xffd0d8, particles: 0xc8d4e4, speed: 1.4 },
        mult: {},
      },
    ],
    poses: mechaPoses,
    moves: {
      light: [
        { id: 'mfJab', startup: 3, active: 2, recovery: 9, cancel: 5, damage: 820, reach: 1.4, radius: 0.8, lunge: 18, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'mfSweep', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 1150, reach: 1.7, radius: 0.95, lunge: 18, hitstun: 22, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'mf_sweepW', strike: 'mf_sweep' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'mfTail', startup: 7, active: 4, recovery: 16, cancel: 9, damage: 1500, reach: 2.5, radius: 1.15, lunge: 14, hitstun: 28, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'mfSmash', startup: 10, active: 4, recovery: 20, damage: 2700, reach: 1.7, radius: 1, lunge: 24, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 4, pose: { wind: 'mf_sweepW', strike: 'mf_sweep' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'mfWhip', startup: 11, active: 5, recovery: 22, damage: 2900, reach: 2.6, radius: 1.25, lunge: 16, hitstun: 38, knock: 'smash', knockSpeed: 32, impact: 4, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'mfBlink', startup: 2, active: 6, recovery: 10, damage: 1250, reach: 1.5, radius: 0.9, lunge: 58, hitstun: 24, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'mfToss', name: 'Discard', damage: 1600, knockSpeed: 30, poses: ['grab', 'mf_sweepW', 'mf_sweep'] },
    },
    specials: {
      special1: {
        id: 'mfDeathBeam', name: 'Death Beam', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 90,
        startup: 8, recovery: 13, pose: { wind: 'fz_aim', release: 'fz_aim' },
        projectile: { kind: 'blast', speed: 88, radius: 0.34, damage: 2500, homing: 0.3, color: 0xff3a6a, core: 0xffe0ea, explode: 2.4, knock: 'heavy', knockSpeed: 26, impact: 3, life: 2.6, guardPierce: true },
      },
      special2: {
        id: 'mfBarrage', name: 'Overload Barrage', type: 'scatter', kiCost: 42, icon: 'ball', cooldown: 260,
        windup: 20, rise: 10, height: 7, count: 9, damage: 900, speed: 48, range: 24, recovery: 34,
        color: 0xff6a8a, poses: { wind: 'mf_vent', fire: 'fz_aim' },
      },
      ultimate: {
        id: 'mfDeathBall', name: 'Death Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 58, recovery: 46, pose: { wind: 'fz_ballW', release: 'fz_ball' },
        projectile: { kind: 'ball', speed: 32, radius: 2.6, damage: 6400, homing: 0.5, color: 0xff8a3a, core: 0xfff0d0, explode: 14, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.5 },
      },
    },
    boss: {
      phases: [
        // he opens the way he always has, at range, because it has always worked
        { id: 'arrogant', label: 'ARROGANT', hpAbove: 0.55, speed: 1, damage: 1, patience: 0.8, patterns: { melee: 0.8, beam: 0.8, ball: 0.3 } },
        // and the moment it stops working he empties everything he has
        { id: 'furious', label: 'FURIOUS', hpAbove: 0, speed: 1.08, damage: 1.12, patience: 0.3, enter: 'vent', line: 'angry', patterns: { melee: 1, beam: 0.9, barrage: 0.8, ball: 0.5 } },
      ],
      patterns: {
        beam: { slot: 'special1', minDist: 5, cooldown: 150 },
        barrage: { slot: 'special2', minDist: 6, maxDist: 26, cooldown: 300 },
        ball: { slot: 'ultimate', minDist: 10, cooldown: 900 },
      },
      techniques: {
        vent: { type: 'bossTaunt', frames: 60, poses: { taunt: 'mf_vent' } },
      },
    },
    mechanic: { type: 'boss', name: 'Rebuilt', desc: 'Two phases: he opens bored, and when he is hurt he stops pacing himself and throws everything.' },
    ai: { personality: 'aggressive', aggression: 0.8, defense: 0.35, ranged: 0.75, beam: 0.6, transformHp: 0, preferredRange: 7, hooks: 'boss' },
    barks: { hurt: 'frieza_hurt' },
    intro: { pose: 'mf_boast', expression: 'smirk' },
    victory: { poses: ['fz_laugh'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* --------------------------------------------------------------- King Cold */

  const coldPoses = {
    kc_idle: (t) => {
      const b = Math.sin(t * 1.9);
      return {
        root: { y: -0.02 + b * 0.01 },
        hips: [0, -4, 0], spine: [-4, 0, 0], chest: [-6, 6, 0], head: [-8, -4, 0],
        shoulderR: [-16, 0, -18], elbowR: [-40, 0, 0], shoulderL: [-16, 0, 18], elbowL: [-40, 0, 0],
        thighL: [-10, 4, 10], kneeL: [14 + b, 0, 0], thighR: [6, -4, -10], kneeR: [12 + b, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    kc_backhandW: {
      root: { y: -0.03 }, chest: [-4, 40, 0], head: [-6, -24, 0],
      shoulderR: [-40, 0, -64], elbowR: [-40, 0, 0], shoulderL: [-14, 0, 20], elbowL: [-40, 0, 0],
      thighL: [-12, 0, 10], kneeL: [16, 0, 0], thighR: [8, 0, -10], kneeR: [12, 0, 0],
    },
    kc_backhand: {
      root: { y: -0.06, rx: 4 }, chest: [-2, -46, 0], head: [-6, 30, 0],
      shoulderR: [-76, 0, 50], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-34, 0, 0],
      thighL: [-22, 0, 10], kneeL: [26, 0, 0], thighR: [14, 0, -10], kneeR: [14, 0, 0],
    },
    kc_stompW: {
      root: { y: -0.1 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
      shoulderR: [-30, 0, -30], elbowR: [-50, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-50, 0, 0],
      thighR: [-70, 0, -10], kneeR: [90, 0, 0], thighL: [-6, 0, 10], kneeL: [12, 0, 0],
    },
    kc_stomp: {
      root: { y: -0.16, rx: 10 }, spine: [10, 0, 0], chest: [12, 0, 0], head: [-6, 0, 0],
      shoulderR: [-20, 0, -24], elbowR: [-30, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-30, 0, 0],
      thighR: [20, 0, -10], kneeR: [6, 0, 0], footR: [-20, 0, 0], thighL: [-20, 0, 10], kneeL: [30, 0, 0],
    },
    kc_blastW: {
      root: { y: -0.04 }, chest: [-6, -14, 0], head: [-6, 10, 0],
      shoulderR: [-88, 0, -14], elbowR: [-60, 0, 0], shoulderL: [-16, 0, 18], elbowL: [-40, 0, 0],
      thighL: [-10, 0, 10], kneeL: [14, 0, 0], thighR: [6, 0, -10], kneeR: [12, 0, 0],
      hands: ['fist', 'open'],
    },
    kc_blast: {
      root: { y: -0.06, rx: 8 }, chest: [6, 8, 0], head: [-8, -6, 0],
      shoulderR: [-96, 0, -6], elbowR: [-6, 0, 0], handR: [-30, 0, 0], shoulderL: [-14, 0, 20], elbowL: [-34, 0, 0],
      thighL: [-18, 0, 10], kneeL: [22, 0, 0], thighR: [12, 0, -10], kneeR: [12, 0, 0],
      hands: ['fist', 'open'],
    },
    kc_reach: {
      root: { y: -0.02 }, chest: [-4, -10, 0], head: [-6, 10, 0],
      shoulderR: [-92, 0, -10], elbowR: [-20, 0, 0], shoulderL: [-14, 0, 16], elbowL: [-34, 0, 0],
      thighL: [-8, 0, 10], kneeL: [12, 0, 0], thighR: [6, 0, -10], kneeR: [10, 0, 0],
      hands: ['fist', 'open'],
    },
    kc_walk: (t) => {
      const ph = t * 3.6, s = Math.sin(ph);
      return {
        root: { y: -0.01 + Math.abs(Math.cos(ph)) * 0.012 }, chest: [-6, s * 2, 0], head: [-8, 0, 0],
        shoulderR: [-s * 8, 0, -14], elbowR: [-30, 0, 0], shoulderL: [s * 8, 0, 14], elbowL: [-30, 0, 0],
        thighL: [-s * 18 - 2, 0, 6], kneeL: [6 + Math.max(0, s) * 26, 0, 0], thighR: [s * 18 - 2, 0, -6], kneeR: [6 + Math.max(0, -s) * 26, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // an open hand held out: an offer
    kc_offer: {
      root: { y: -0.01 }, chest: [-4, 10, 0], head: [-6, -8, 0],
      shoulderR: [-60, 0, -30], elbowR: [-30, 0, 0], handR: [0, 0, 20], shoulderL: [-10, 0, 16], elbowL: [-40, 0, 0],
      thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['fist', 'open'],
    },
    // turning the sword over in his hands, admiring it
    kc_hold: {
      root: { y: -0.01 }, chest: [4, 0, 0], head: [16, 0, 0],
      shoulderR: [-60, 0, -10], elbowR: [-70, 0, 0], shoulderL: [-50, 0, 10], elbowL: [-80, 0, 0],
      thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['open', 'fist'],
    },
    // two hands over his head, then down
    kc_swordW: {
      root: { y: -0.02, rx: -8 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-10, 0, 0],
      shoulderR: [-176, 0, -8], elbowR: [-40, 0, 0], shoulderL: [-170, 0, 10], elbowL: [-46, 0, 0],
      thighL: [-16, 0, 10], kneeL: [20, 0, 0], thighR: [8, 0, -10], kneeR: [14, 0, 0],
      hands: ['fist', 'fist'],
    },
    kc_sword: {
      root: { y: -0.08, rx: 14 }, spine: [10, 0, 0], chest: [16, 0, 0], head: [-6, 0, 0],
      shoulderR: [-100, 0, -6], elbowR: [-10, 0, 0], shoulderL: [-96, 0, 8], elbowL: [-14, 0, 0],
      thighL: [-34, 0, 12], kneeL: [40, 0, 0], thighR: [16, 0, -12], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    kc_shock: {
      root: { y: -0.03, rx: -6 }, chest: [-8, 0, 0], head: [4, 0, 0],
      shoulderR: [-30, 0, -24], elbowR: [-40, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-40, 0, 0],
      thighL: [-14, 0, 10], kneeL: [18, 0, 0], thighR: [8, 0, -10], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    // thrown against the side of his ship, arms out, begging
    kc_pinned: (t) => {
      const s = Math.sin(t * 6);
      return {
        root: { y: -0.06, rx: -14 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [14 + s * 3, 0, 0],
        shoulderR: [-60 + s * 6, 0, -50], elbowR: [-50, 0, 0], shoulderL: [-60 - s * 6, 0, 50], elbowL: [-50, 0, 0],
        thighL: [-30, 0, 16], kneeL: [40, 0, 0], thighR: [-20, 0, -16], kneeR: [34, 0, 0],
        hands: ['open', 'open'],
      };
    },
    kc_amused: {
      root: { y: -0.01 }, chest: [-8, 10, 0], head: [-12, -8, 0],
      shoulderR: [-10, 0, -16], elbowR: [-46, 0, 0], shoulderL: [-10, 0, 16], elbowL: [-46, 0, 0],
      thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['fist', 'fist'],
    },
  };

  const KC_SKIN = 0xb48ad8;
  SL.data.characters.king_cold = {
    id: 'king_cold',
    assetLevel: 1,
    name: 'King Cold',
    fullName: 'King Cold, Frieza’s father',
    era: 'Android Saga',
    playable: true, // Free Battle after "The Stranger" (unlocks.js)
    prototype: true,
    style: 'Emperor Emeritus',
    blurb: 'He has ruled for centuries and fought for almost none of them.',
    ratings: { power: 5, speed: 2, ki: 4, defense: 5 },
    stats: { hp: 32000, ki: 140, stamina: 170, speed: 0.92, power: 1.6, defense: 1.45, weight: 1.6, kiRegen: 3.4, chargeRate: 30, canonPower: 13 },
    poise: { max: 110, regen: 10, regenDelay: 130, armor: 3, cost: { 1: 5, 2: 9, 3: 14, 4: 24 }, beamMul: 1, breakFrames: 170, vulnerable: 1.25 },
    vfx: { ghost: 0xbfc8ff },
    // (2026-10-16, the board p.21: his colours were inverted — a white body under a purple dome. Now as the board draws
    // him: lavender-purple skin; the white crown dome with its blue gem and black horns; the armour's blue chest plate
    // with the orange-brown belly segment under it and black shorts; broad pads over a red cape; white bracers and shin
    // guards with pink ribbing (cuff props); bare purple feet and hands with black nails; the long tail, pink-ribbed)
    appearance: {
      height: 1.32,
      skin: KC_SKIN,
      build: { chestW: 0.3, chestD: 0.2, shoulderX: 0.3, waistW: 0.24, upperArmR: 0.088, foreArmR: 0.076, fist: 0.08, thighR: 0.13, shinR: 0.1, headR: 0.155, neckLen: 0.06 },
      hair: { style: 'frieza_shell', color: 0xeceaf2 },
      headExtras: [
        { a: [0.85, 0.3, 0], d: [1, 0.55, -0.2], l: 0.2, r: 0.045, color: 0x2b2b35, depth: 0.95 },
        { a: [-0.85, 0.3, 0], d: [-1, 0.55, -0.2], l: 0.2, r: 0.045, color: 0x2b2b35, depth: 0.95 },
        // the gem set in the front of the dome
        { shape: 'ball', a: [0, 0.58, 0.81], d: [0, 0.58, 0.81], l: 0.05, r: 0.052, flat: 0.55, depth: 1.12, color: 0x2a6ec8, outline: 0.5 },
      ],
      // his son's face (the visual pass): ringed eyes, dark brow ridges, dark lips — older and broader in the jaw
      face: { pupil: 0x6a0a1a, sclera: 0xffffff, brow: 0x5a3a7a, browThick: 0.8, noEars: true, eyeW: 1.05, eyeH: 0.85, eyeRim: 0x141014, eyeTilt: 0.1, mouthColor: 0x3a1636, mouthZ: 0.93, jaw: 1.1, jawW: 1.02 },
      outfit: {
        topStyle: 'armor', top: 0x18181e, arms: KC_SKIN, pants: 0x18181e, pantsStyle: 'tight', thighs: KC_SKIN, legs: KC_SKIN,
        boots: KC_SKIN, bootStyle: 'shoe', nails: 0x141414,
        armor: { plate: 0x2a48b0, belly: 0xb8702a, pads: 0x1e2a6a, padStyle: 'down', trim: 0xeceaf2 },
        // a single colour (the cape builder takes one): the red of the board p.21
        cape: 0xb01e26,
        longTail: { color: 0xe890a8, segments: 8, length: 1.1, radius: 0.055, lift: 0.9, curl: 0.2 },
      },
      props: [1, -1].flatMap((s) => {
        const sd = s > 0 ? 'L' : 'R';
        return [
          { id: 'bracer' + sd, joint: 'elbow' + sd, shape: 'cuff', pos: [0, -0.07, 0], radius: 0.098, radiusBottom: 0.09, length: 0.17, color: 0xeceaf2, outline: 0.5 },
          { id: 'bracerRib' + sd, joint: 'elbow' + sd, shape: 'cuff', pos: [0, -0.1, 0], radius: 0.1, radiusBottom: 0.094, length: 0.11, sides: 8, color: 0xe890a8, outline: 0.3 },
          { id: 'shin' + sd, joint: 'knee' + sd, shape: 'cuff', pos: [0, -0.08, 0], radius: 0.128, radiusBottom: 0.116, length: 0.3, color: 0xeceaf2, outline: 0.5 },
          { id: 'shinRib' + sd, joint: 'knee' + sd, shape: 'cuff', pos: [0, -0.12, 0], radius: 0.13, radiusBottom: 0.12, length: 0.2, sides: 8, color: 0xe890a8, outline: 0.3 },
        ];
      }),
      portraitColor: '#b48ad8',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x8a6aff, core: 0xe0d8ff, particles: 0xbfc8ff, speed: 1 }, mult: {} }],
    poses: coldPoses,
    moves: {
      light: [
        { id: 'kcBackhand', startup: 6, active: 4, recovery: 14, cancel: 8, damage: 1250, reach: 2.1, radius: 1.05, lunge: 12, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'kc_backhandW', strike: 'kc_backhand' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'kcSwat', startup: 7, active: 4, recovery: 15, cancel: 9, damage: 1350, reach: 2.1, radius: 1.05, lunge: 12, hitstun: 24, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'kc_backhandW', strike: 'kc_backhand' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
        { id: 'kcStomp', startup: 12, active: 5, recovery: 22, cancel: 14, damage: 1900, reach: 1.9, radius: 1.3, lunge: 10, hitstun: 30, knock: 'heavy', knockSpeed: 24, impact: 3, pose: { wind: 'kc_stompW', strike: 'kc_stomp' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'kcCrush', startup: 15, active: 5, recovery: 26, damage: 3200, reach: 2.2, radius: 1.3, lunge: 14, hitstun: 38, knock: 'smash', knockSpeed: 34, impact: 4, guardCrush: true, guardDamage: 52, pose: { wind: 'kc_stompW', strike: 'kc_stomp' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'kcUppercut', startup: 12, active: 4, recovery: 24, damage: 2400, reach: 2, radius: 1.15, lunge: 12, hitstun: 36, knock: 'launch', knockSpeed: 20, impact: 3, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'kcCharge', startup: 8, active: 8, recovery: 24, damage: 2200, reach: 2.1, radius: 1.2, lunge: 30, hitstun: 32, knock: 'heavy', knockSpeed: 28, impact: 3, pose: { wind: 'kc_stompW', strike: 'kc_stomp' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'kcGrip', name: 'Royal Grip', damage: 2000, knockSpeed: 28, poses: ['grab', 'kc_reach', 'kc_backhand'] },
    },
    specials: {
      special1: {
        id: 'coldBlast', name: 'Cold Blast', type: 'projectile', kiCost: 26, icon: 'ball', cooldown: 130,
        startup: 16, recovery: 22, pose: { wind: 'kc_blastW', release: 'kc_blast' },
        projectile: { kind: 'ball', speed: 62, radius: 1.1, damage: 2600, homing: 0.6, color: 0x8a6aff, core: 0xe0d8ff, explode: 6, knock: 'heavy', knockSpeed: 28, impact: 3, life: 3 },
      },
      special2: {
        id: 'coldSweep', name: 'Dismissal', type: 'scatter', kiCost: 40, icon: 'blast', cooldown: 300,
        windup: 26, rise: 12, height: 8, count: 6, damage: 1200, speed: 44, range: 22, recovery: 40,
        color: 0x8a6aff, poses: { wind: 'kc_blastW', fire: 'kc_blast' },
      },
      ultimate: {
        id: 'coldWave', name: 'Emperor’s Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [5200, 5200], radius: [1.7, 1.7], speed: 92, range: 150, sustain: 40,
        color: 0x8a6aff, core: 0xffffff, poses: { charge: 'kc_blastW', fire: 'kc_blast' }, recovery: 40,
      },
    },
    boss: {
      phases: [
        // he is not fighting: he is waiting for this to be over
        { id: 'amused', label: 'AMUSED', hpAbove: 0.5, speed: 0.95, damage: 1, patience: 1, patterns: { melee: 0.7, blast: 0.5 } },
        // and then somebody hurts him, which has not happened in centuries
        { id: 'offended', label: 'OFFENDED', hpAbove: 0, speed: 1.05, damage: 1.15, patience: 0.5, patterns: { melee: 1, blast: 0.7, sweep: 0.6, wave: 0.35 } },
      ],
      patterns: {
        blast: { slot: 'special1', minDist: 6, cooldown: 210 },
        sweep: { slot: 'special2', minDist: 5, maxDist: 24, cooldown: 360 },
        wave: { slot: 'ultimate', minDist: 8, cooldown: 900 },
      },
      techniques: {},
    },
    mechanic: { type: 'boss', name: 'Centuries of Deference', desc: 'Nobody has fought him in a very long time, and it shows: he is slow to take a threat seriously.' },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.6, ranged: 0.5, beam: 0.45, transformHp: 0, preferredRange: 5, hooks: 'boss' },
    intro: { pose: 'kc_amused', expression: 'smirk' },
    victory: { poses: ['kc_amused'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
