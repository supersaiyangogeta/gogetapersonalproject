/*
 * GOTEN and KID TRUNKS (Buu Saga, Age 774) — the two children who can turn Super
 * Saiyan before they can spell it.
 *
 * They are not small copies of their fathers. Both are quick, light and short of
 * reach, both are playing rather than fighting, and the point of them is that
 * nothing about the way they fight suggests they should be able to do this.
 *
 *   Goten       his father's shapes, none of his father's discipline. Wide,
 *               happy swings, a Kamehameha he treats like a party trick, and the
 *               `saiyanInstinct` adaptation Goku has — he copies what hits him.
 *   Kid Trunks  his mother's confidence and his father's habits: sharper,
 *               meaner, a burst of blasts instead of a beam, and `pride` —
 *               he hits harder the more he is losing.
 *
 * Forms: base → Super Saiyan (both). The fusion that makes Gotenks arrives with
 * the fusion system in a later milestone.
 *
 * Level 1 functional prototypes; playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  /* ---------------- shared child body language ---------------- */
  const kidPoses = (prefix) => ({
    [prefix + '_idle']: (t) => {
      const b = Math.sin(t * 3.2);
      return {
        root: { y: -0.02 + b * 0.016 },
        hips: [0, -8, 0], spine: [5, 0, 0], chest: [4, 8, 0], head: [-6, -8, 0],
        shoulderL: [-40, 0, 18], elbowL: [-88, 0, 0], shoulderR: [-38, 0, -18], elbowR: [-92, 0, 0],
        thighL: [-14, 6, 12], kneeL: [22 + b * 3, 0, 0], thighR: [10, -6, -12], kneeR: [18 + b * 3, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    [prefix + '_jabW']: {
      root: { y: -0.04 }, chest: [4, -24, 0], head: [-6, 16, 0],
      shoulderR: [-34, 0, -18], elbowR: [-124, 0, 0], shoulderL: [-56, 0, 18], elbowL: [-98, 0, 0],
      thighL: [-20, 0, 12], kneeL: [30, 0, 0], thighR: [14, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    [prefix + '_jab']: {
      root: { y: -0.06, rx: 10 }, chest: [10, 28, 0], head: [-14, -18, 0],
      shoulderR: [-98, 0, 4], elbowR: [-2, 0, 0], shoulderL: [-44, 0, 20], elbowL: [-114, 0, 0],
      thighL: [-30, 0, 12], kneeL: [40, 0, 0], thighR: [20, 0, -12], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    [prefix + '_kickW']: { ...C.kickWindR, root: { y: -0.07 } },
    [prefix + '_kick']: {
      root: { y: 0.03, rz: -16 }, chest: [-6, 44, 0], head: [-6, -34, 0],
      shoulderL: [-14, 0, 60], elbowL: [-26, 0, 0], shoulderR: [-14, 0, -60], elbowR: [-26, 0, 0],
      thighR: [-100, 0, -24], kneeR: [4, 0, 0], footR: [34, 0, 0], thighL: [14, 0, 8], kneeL: [12, 0, 0],
      hands: ['fist', 'fist'],
    },
    [prefix + '_spinW']: {
      root: { y: -0.03 }, spine: [-4, -30, 0], chest: [-6, -34, 0], head: [-4, 26, 0],
      shoulderL: [-40, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-60, 0, 0],
      thighL: [-16, 0, 14], kneeL: [24, 0, 0], thighR: [10, 0, -14], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    },
    [prefix + '_spin']: {
      root: { y: -0.05, rz: 12 }, spine: [6, 40, 0], chest: [8, 44, 0], head: [-8, -30, 0],
      shoulderR: [-70, 0, -70], elbowR: [-20, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0],
      thighL: [-26, 0, 14], kneeL: [34, 0, 0], thighR: [16, 0, -14], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    },
    // arms up, delighted with himself
    [prefix + '_cheer']: (t) => {
      const b = Math.sin(t * 4.5);
      return {
        root: { y: 0.02 + Math.max(0, b) * 0.05 },
        hips: [0, 0, 0], spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-16, 0, 0],
        shoulderL: [-172, 0, 24], elbowL: [-14, 0, 0], shoulderR: [-172, 0, -24], elbowR: [-14, 0, 0],
        thighL: [-10, 0, 12], kneeL: [14, 0, 0], thighR: [-10, 0, -12], kneeR: [14, 0, 0],
        hands: ['open', 'open'],
      };
    },
  });

  // shared with Gotenks (src/data/characters/gotenks.js): the same child-sized strikes under another name
  SL.data.kidPoses = kidPoses;

  const KID_BUILD = { chestW: 0.155, chestD: 0.115, shoulderX: 0.15, waistW: 0.125, upperArmR: 0.042, foreArmR: 0.036, fist: 0.042, thighR: 0.07, shinR: 0.055, headR: 0.135, neckLen: 0.038 };

  /* ---------------- GOTEN ---------------- */
  const gt = kidPoses('gt');
  gt.gt_kameCharge = { ...C.beamChargeSide };
  gt.gt_kameFire = { ...C.beamFire };
  // THE TURTLE SCHOOL STANCE, the way he has seen his brother do it: side-on and wide, the open
  // lead hand out in front, the back fist at the hip — and a grin that ruins the effect
  gt.gt_idle = (t) => {
    const b = Math.sin(t * 2.8);
    return {
      root: { y: -0.08 + b * 0.012 },
      hips: [0, -30, 0], spine: [6, 8, 0], chest: [4, 16, 0], head: [-6, -14, 0],
      shoulderL: [-76, 0, 12], elbowL: [-34, 0, 0], handL: [-10, 0, 0], shoulderR: [6, 0, -22], elbowR: [-104, 0, 0],
      thighL: [-32, 16, 16], kneeL: [40 + b * 3, 0, 0], footL: [-8, 0, 0], thighR: [18, -14, -16], kneeR: [32 + b * 3, 0, 0],
      hands: ['open', 'fist'],
    };
  };
  // running in, head down, fist out: a seven-year-old's idea of a finishing move
  gt.gt_rush = {
    root: { y: -0.05, rx: 24 }, spine: [8, 0, 0], chest: [8, 18, 0], head: [-28, -12, 0],
    shoulderR: [-100, 0, -4], elbowR: [-6, 0, 0], shoulderL: [34, 0, 24], elbowL: [-60, 0, 0],
    thighL: [-54, 0, 8], kneeL: [64, 0, 0], thighR: [34, 0, -8], kneeR: [44, 0, 0],
    hands: ['fist', 'fist'],
  };
  // in a sleeper hold: both hands pulling at the arm, the head forced back, the legs kicking
  gt.gt_choked = (t) => {
    const s = Math.sin(t * 14);
    return {
      root: { y: 0.01 }, spine: [-8, 0, 0], chest: [-10, 0, s * 3], head: [-24, s * 6, 0],
      shoulderL: [-124, 0, 26], elbowL: [-116, 0, 0], shoulderR: [-124, 0, -26], elbowR: [-116, 0, 0],
      thighL: [-22 + s * 18, 0, 8], kneeL: [40 + s * 22, 0, 0], thighR: [-22 - s * 18, 0, -8], kneeR: [40 - s * 22, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // behind his mother, peeking round her at a man he has only seen in a photograph
  gt.gt_shy = (t) => {
    const b = Math.sin(t * 1.6);
    return {
      // both hands holding her skirt in front of him at his waist, leaning out round her to look
      root: { y: -0.05, rz: 14 + b * 2 }, spine: [10, 0, 8], chest: [8, -12, 8], head: [2, -18, 16],
      shoulderL: [-40, 0, -2], elbowL: [-58, 0, 0], shoulderR: [-36, 0, 2], elbowR: [-62, 0, 0],
      thighL: [-4, 0, 6], kneeL: [12, 0, 0], thighR: [-2, 0, -6], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the jump into his father's arms
  gt.gt_leap = {
    root: { y: 0, rx: -8 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-14, 0, 0],
    shoulderL: [-150, 0, 30], elbowL: [-14, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-14, 0, 0],
    thighL: [-60, 0, 10], kneeL: [90, 0, 0], thighR: [-40, 0, -10], kneeR: [100, 0, 0],
    hands: ['open', 'open'],
  };
  // held: arms round his father's neck, legs dangling
  gt.gt_hug = (t) => {
    const b = Math.sin(t * 2);
    return {
      root: { y: 0 }, spine: [-4, 0, 0], chest: [-4, 0, 0], head: [-6, 0, 10 + b * 3],
      shoulderL: [-132, 0, 22], elbowL: [-84, 0, 0], shoulderR: [-132, 0, -22], elbowR: [-84, 0, 0],
      thighL: [-30, 0, 12], kneeL: [50 + b * 6, 0, 0], thighR: [-26, 0, -12], kneeR: [44 - b * 6, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // sitting on the grass where he landed, still arguing
  gt.gt_sit = {
    root: { y: -0.32, rx: -10 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-8, 0, 0],
    shoulderL: [30, 0, 30], elbowL: [-10, 0, 0], shoulderR: [30, 0, -30], elbowR: [-10, 0, 0],
    thighL: [-88, 0, 16], kneeL: [40, 0, 0], thighR: [-88, 0, -16], kneeR: [40, 0, 0],
    hands: ['open', 'open'],
  };

  SL.data.characters.goten = {
    id: 'goten',
    assetLevel: 1,
    name: 'Goten',
    fullName: 'Son Goten (Age 7)',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Cheerful Prodigy',
    blurb: 'He has never met his father, and he turned Super Saiyan because it looked fun.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 9000, ki: 90, stamina: 110, speed: 1.18, power: 0.72, defense: 0.7, weight: 0.6, kiRegen: 2.4, chargeRate: 30, canonPower: 0.9 },
    appearance: {
      height: 0.62,
      skin: 0xf6cda6,
      build: KID_BUILD,
      hair: { style: 'goten', color: 0x141418 },
      face: { pupil: 0x101010, eyeW: 1.12 },
      outfit: {
        topStyle: 'gi', top: 0x3f7fd0, sleeves: 'short', sleeveColor: 0x3f7fd0, under: 0xe8e4dc,
        wrist: 0xe8e4dc, belt: 0xe6c24a, pants: 0x3f7fd0, pantsStyle: 'gi', boots: 0xe8e4dc, bootStyle: 'gi',
      },
      portraitColor: '#3f7fd0',
    },
    vfx: { ghost: 0xcfe8ff },
    audio: { strikePitch: 1.35, heavyPitch: 1.25 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe8ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 40, style: 'full',
        mult: { damage: 1.6, speed: 1.16, defense: 1.25, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.85 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42, speed: 1.3, sharp: 0.25, sparks: 0xfff3a0 },
        look: { hair: { style: 'goten_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.03 },
        ghost: 0xffe27a,
        music: 3,
        sequence: {
          length: 80,
          applyAt: 44,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.4, auraColor: 0xffffff, mood: [0.2, 0x141026, 0.6], shot: 'orbit', music: 0, sfx: 'kiUp' },
            { at: 44, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.15, 0x2a2410, 0.3], flash: 0.7, crater: 2.5 },
            { at: 62, pose: 'gt_cheer', speed: 6, expression: 'calm', shot: 'face', mood: [0, 0x000000, 1] },
          ],
        },
      },
    ],
    poses: Object.assign({ idle: gt.gt_idle }, gt),
    moves: {
      light: [
        { id: 'gtJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 260, reach: 0.95, radius: 0.65, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'gt_jabW', strike: 'gt_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gtCross', startup: 3, active: 3, recovery: 10, cancel: 5, damage: 280, reach: 0.95, radius: 0.65, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'gt_jabW', strike: 'gt_jab' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'gtKick', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 400, reach: 1.2, radius: 0.75, lunge: 14, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'gt_kickW', strike: 'gt_kick' }, sfx: 'punchLight', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gtSpin', startup: 9, active: 5, recovery: 19, damage: 900, reach: 1.25, radius: 0.9, lunge: 16, hitstun: 30, knock: 'smash', knockSpeed: 26, impact: 2, pose: { wind: 'gt_spinW', strike: 'gt_spin' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'gtPop', startup: 8, active: 4, recovery: 16, damage: 620, reach: 1.1, radius: 0.85, lunge: 12, hitstun: 28, knock: 'launch', knockSpeed: 19, impact: 2, pose: { wind: 'gt_jabW', strike: 'gt_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'gtDash', startup: 4, active: 7, recovery: 15, damage: 620, reach: 1.15, radius: 0.85, lunge: 34, hitstun: 26, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'gt_jabW', strike: 'gt_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'gtToss', name: 'Little Toss', damage: 520, knockSpeed: 22, poses: ['grab', 'gt_spinW', 'gt_spin'] },
    },
    specials: {
      special1: {
        id: 'gtKame', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 18, chargeMax: 64, tiers: [18, 44], damage: [1500, 2600], radius: [0.6, 1], speed: 100, range: 140, sustain: 30,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'gt_kameCharge', fire: 'gt_kameFire' }, recovery: 24,
        callout: ['KAME', 'HAME', 'HA!'],
      },
      // he throws it the way a child throws a ball, and it still takes a wall down
      special2: {
        id: 'gtVolley', name: 'Playful Volley', type: 'projectile', kiCost: 16, icon: 'ball',
        startup: 12, recovery: 16, pose: { wind: 'gt_jabW', release: 'gt_jab' },
        projectile: { kind: 'ball', speed: 74, radius: 0.5, damage: 700, homing: 0.6, color: 0x8ad4ff, core: 0xffffff, explode: 1.6, knock: 'push', knockSpeed: 14, impact: 1, life: 2.2 },
      },
      ultimate: {
        id: 'gtSuperKame', name: 'Super Kamehameha', type: 'beam', kiCost: 90, icon: 'ultimate', ultimate: true, // kiCost is a full bar: 100 was more than this fighter can hold, so the button did nothing
        chargeMin: 40, chargeMax: 40, damage: [4200, 4200], radius: [1.4, 1.4], speed: 108, range: 160, sustain: 42,
        color: 0x8ad4ff, core: 0xffffff, poses: { charge: 'gt_kameCharge', fire: 'gt_kameFire' }, recovery: 38, cinematic: true,
        callout: ['KAME', 'HAME', 'HAAA!'],
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'He copies what hits him. Blocking, vanishing and taking punishment sharpen his next few strikes.' },
    ai: { personality: 'aggressive', aggression: 0.75, defense: 0.35, ranged: 0.4, beam: 0.35, transformHp: 0.6, preferredRange: 2.2 },
    intro: { pose: 'gt_cheer', expression: 'calm' },
    victory: { poses: ['gt_cheer'], expression: 'calm' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---------------- KID TRUNKS ---------------- */
  const kt = kidPoses('kt');
  kt.kt_blastW = { ...C.blastWind };
  kt.kt_blast = { ...C.blastR };
  // HIS OWN STANCE, not Goten's: the other lead, weight back, chin up, the rear fist loose — a
  // boy who has sparred with a Saiyan prince every day of his life and thinks that is normal
  kt.kt_idle = (t) => {
    const b = Math.sin(t * 3.4);
    return {
      root: { y: -0.05 + b * 0.012 },
      hips: [0, 24, 0], spine: [2, -8, 0], chest: [-2, -14, 0], head: [-12, 12, 0],
      shoulderL: [-60, 0, 22], elbowL: [-122, 0, 0], shoulderR: [-26, 0, -30], elbowR: [-74, 0, 0],
      thighL: [12, 12, 12], kneeL: [26 + b * 3, 0, 0], thighR: [-24, -14, -12], kneeR: [30 + b * 3, 0, 0], footR: [-6, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the sleeper hold: the right forearm across Goten's throat from behind, chin down over his shoulder
  kt.kt_sleeper = (t) => {
    const s = Math.sin(t * 10);
    return {
      root: { y: -0.02 }, spine: [10, 0, 0], chest: [12, 0, s * 2], head: [8, 0, 0],
      shoulderR: [-96, 0, 34], elbowR: [-112, 0, 0], shoulderL: [-70, 0, -10], elbowL: [-100, 0, 0],
      thighL: [-16, 0, 14], kneeL: [26, 0, 0], thighR: [14, 0, -14], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the other hand coming out from behind his back
  kt.kt_twoHands = {
    root: { y: -0.08 }, hips: [0, -10, 0], spine: [6, -10, 0], chest: [6, -20, 0], head: [-6, 14, 0],
    shoulderL: [-70, 0, 34], elbowL: [-30, 0, 0], shoulderR: [-40, 0, -24], elbowR: [-110, 0, 0],
    thighL: [-28, 0, 14], kneeL: [40, 0, 0], thighR: [18, 0, -14], kneeR: [30, 0, 0],
    hands: ['open', 'fist'],
  };
  kt.kt_smug = (t) => {
    const b = Math.sin(t * 2);
    return {
      root: { y: -0.01 + b * 0.006 },
      hips: [0, 0, 0], spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-10, 0, 0],
      shoulderL: [-26, 0, 66], elbowL: [-96, 0, 0], shoulderR: [-26, 0, -66], elbowR: [-96, 0, 0],
      thighL: [-6, 2, 14], kneeL: [10, 0, 0], thighR: [-6, -2, -14], kneeR: [10, 0, 0],
      hands: ['fist', 'fist'],
    };
  };

  SL.data.characters.kid_trunks = {
    id: 'kid_trunks',
    assetLevel: 1,
    name: 'Trunks (Kid)',
    fullName: 'Trunks Briefs (Age 8)',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Spoiled Prince',
    blurb: 'Vegeta\'s son, Bulma\'s money, and the firm belief that he is the strongest child alive.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 9600, ki: 95, stamina: 112, speed: 1.16, power: 0.78, defense: 0.74, weight: 0.62, kiRegen: 2.3, chargeRate: 30, canonPower: 0.95 },
    appearance: {
      height: 0.64,
      skin: 0xf6cda6,
      build: KID_BUILD,
      hair: { style: 'trunks_kid', color: 0xb98ad4 },
      face: { pupil: 0x2a4a9a, eyeW: 1.1, brow: 0x9a6ec0 },
      outfit: {
        topStyle: 'gi', top: 0x2f3a58, sleeves: 'short', sleeveColor: 0x2f3a58, under: 0xe8e4dc,
        wrist: 0xe8e4dc, belt: 0xd8c23a, pants: 0xd8c23a, pantsStyle: 'gi', boots: 0x9a3a3a, bootStyle: 'gi',
      },
      portraitColor: '#2f3a58',
    },
    vfx: { ghost: 0xe8d0ff },
    audio: { strikePitch: 1.32, heavyPitch: 1.2 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xe8d0ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 40, style: 'full',
        mult: { damage: 1.62, speed: 1.15, defense: 1.26, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.85 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.42, speed: 1.3, sharp: 0.28, sparks: 0xfff3a0 },
        look: { hair: { style: 'trunks_kid_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.03 },
        poses: { idle: kt.kt_smug },
        ghost: 0xffe27a,
        music: 3,
        sequence: {
          length: 80,
          applyAt: 44,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.4, auraColor: 0xffffff, mood: [0.2, 0x141026, 0.6], shot: 'orbit', music: 0, sfx: 'kiUp' },
            { at: 44, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.15, 0x2a2410, 0.3], flash: 0.7, crater: 2.5 },
            { at: 62, pose: 'kt_smug', speed: 6, expression: 'angry', shot: 'face', mood: [0, 0x000000, 1] },
          ],
        },
      },
    ],
    poses: Object.assign({ idle: kt.kt_idle }, kt),
    moves: {
      light: [
        { id: 'ktJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 280, reach: 0.95, radius: 0.65, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'kt_jabW', strike: 'kt_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'ktHook', startup: 3, active: 3, recovery: 10, cancel: 5, damage: 300, reach: 0.95, radius: 0.65, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'kt_spinW', strike: 'kt_spin' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'ktKick', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 420, reach: 1.2, radius: 0.75, lunge: 14, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'kt_kickW', strike: 'kt_kick' }, sfx: 'punchLight', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'ktSmash', startup: 10, active: 5, recovery: 20, damage: 980, reach: 1.25, radius: 0.9, lunge: 16, hitstun: 32, knock: 'smash', knockSpeed: 28, impact: 3, guardCrush: true, guardDamage: 36, pose: { wind: 'kt_spinW', strike: 'kt_spin' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'ktRise', startup: 8, active: 4, recovery: 16, damage: 660, reach: 1.1, radius: 0.85, lunge: 12, hitstun: 28, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'kt_jabW', strike: 'kt_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'ktDash', startup: 4, active: 7, recovery: 15, damage: 660, reach: 1.15, radius: 0.85, lunge: 34, hitstun: 26, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'kt_jabW', strike: 'kt_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'ktToss', name: 'Prince\'s Throw', damage: 560, knockSpeed: 24, poses: ['grab', 'kt_spinW', 'kt_spin'] },
    },
    specials: {
      special1: {
        id: 'ktBuster', name: 'Buster Cannon', type: 'beam', kiCost: 34, icon: 'beam',
        chargeMin: 20, chargeMax: 66, tiers: [20, 46], damage: [1700, 2900], radius: [0.65, 1.05], speed: 104, range: 145, sustain: 30,
        color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'kt_blastW', fire: 'kt_blast' }, recovery: 26,
        callout: ['BUSTER', 'CANNON!'],
      },
      // up, and then down on everything underneath him at once
      special2: {
        id: 'ktBurst', name: 'Burning Volley', type: 'scatter', kiCost: 26, icon: 'blast',
        windup: 20, rise: 26, height: 9, count: 9, damage: 420, speed: 56, range: 52, recovery: 24,
        color: 0xffd060, poses: { wind: 'kt_blastW', fire: 'kt_blast' },
      },
      ultimate: {
        id: 'ktFinish', name: 'Finish Buster', type: 'beam', kiCost: 95, icon: 'ultimate', ultimate: true, // kiCost is a full bar: 100 was more than this fighter can hold, so the button did nothing
        chargeMin: 42, chargeMax: 42, damage: [4400, 4400], radius: [1.5, 1.5], speed: 104, range: 160, sustain: 44,
        color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'kt_blastW', fire: 'kt_blast' }, recovery: 40, cinematic: true,
        callout: ['FINISH', 'BUSTER!'],
      },
    },
    mechanic: { type: 'pride', name: 'Pride', desc: 'Being beaten only annoys him: the further his health falls, the harder he hits.' },
    ai: { personality: 'aggressive', aggression: 0.82, defense: 0.4, ranged: 0.5, beam: 0.45, transformHp: 0.65, preferredRange: 2.6 },
    intro: { pose: 'kt_smug', expression: 'angry' },
    victory: { poses: ['kt_smug'], expression: 'angry' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
