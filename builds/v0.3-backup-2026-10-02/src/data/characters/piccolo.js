/*
 * PICCOLO (Saiyan Saga) — Namekian warrior, Goku's rival turned reluctant ally.
 * PLAYABLE PROTOTYPE from Version 0.3 (unlocked by clearing "Nappa Attacks").
 *
 * Identity — a tactician, not a brawler like Goku:
 *   REACH: his arms and legs stretch. Several strikes land from two or three
 *     metres away, and DEMON HAND grabs an opponent from across the field and
 *     yanks them into his strikes.
 *   TRAPS: LIGHT GRENADE flies out and hangs in the air as a glowing mine that
 *     detonates when an enemy comes close — lay it between you and a rushdown.
 *   SPECIAL BEAM CANNON: a long, committed two-finger charge; the spiralling
 *     drill beam pierces guard and poise.
 *   REGENERATION: after a few seconds untouched he visibly regrows health
 *     (up to 60%).
 * Intro: he drops his weighted cape with a thud. Victory: floating meditation.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // STORY (playtest round 2): his palm flat on Nail's chest for the fusion
    p_palmPress: (t) => {
      const s = Math.sin(t * 30) * 0.6;
      return {
        root: { y: -0.04 }, spine: [8, -6, 0], chest: [8, -10, 0], neck: [6, 0, 0], head: [8, 8, 0],
        shoulderR: [-84 + s, 0, 4], elbowR: [-14, 0, 0], handR: [-70, 0, 0], shoulderL: [-8, 0, 12], elbowL: [-24, 0, 0],
        thighL: [-16, 0, 10], kneeL: [20, 0, 0], thighR: [10, 0, -10], kneeR: [12, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // STORY (playtest round 2): shielding Gohan — arms thrown wide, braced into the blast
    p_shield: (t) => {
      const s = Math.sin(t * 38);
      return {
        root: { y: -0.1, rx: -8 + s * 0.8 }, spine: [-8, 0, 0], chest: [-12, 0, 0], neck: [6, 0, 0], head: [10, 0, 0],
        shoulderL: [-26, 0, 80 + s], elbowL: [-10, 0, 0], shoulderR: [-26, 0, -80 - s], elbowR: [-10, 0, 0],
        thighL: [-22, 0, 24], kneeL: [36, 0, 0], footL: [-12, 0, 0], thighR: [16, 0, -24], kneeR: [32, 0, 0], footR: [-14, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // still standing after it: smoking, arms dead at his sides, knees going
    p_standHurt: (t) => {
      const s = Math.sin(t * 2.6);
      return {
        root: { y: -0.12 + s * 0.008, rx: 7 }, spine: [14, 0, 0], chest: [10, 0, 0], neck: [10, 0, 0], head: [22, s * 3, 0],
        shoulderL: [-4, 0, 9], elbowL: [-12, 0, 0], shoulderR: [-2, 0, -8], elbowR: [-8, 0, 0],
        thighL: [-14, 0, 10], kneeL: [28, 0, 0], thighR: [8, 0, -10], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // down on one knee, head coming up: he has seen where the blast is going
    p_kneelLook: {
      root: { y: -0.46, rx: 10 }, spine: [18, 0, 0], chest: [8, 0, 0], neck: [-6, 0, 0], head: [-18, -10, 0],
      shoulderL: [-38, 0, 8], elbowL: [-50, 0, 0], shoulderR: [-10, 0, -16], elbowR: [-14, 0, 0],
      thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
      hands: ['fist', 'open'],
    },
    // on his back, head turned toward the boy for the last words
    p_lastWords: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.84 + b * 0.003, rx: -90 }, spine: [b, 0, 0], head: [-8, 34, 0],
        shoulderL: [-14, 0, 22], elbowL: [-20, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-12, 0, 0],
        thighL: [0, 0, 6], kneeL: [10, 0, 0], thighR: [-4, 0, -4], kneeR: [4, 0, 0],
        hands: ['open', 'open'],
      };
    },
    idle: (t) => {
      const b = Math.sin(t * 1.6);
      return { ...C.armsCrossed, root: { y: b * 0.004 }, head: [-4, 0, 0], thighL: [-4, 0, 12], kneeL: [6, 0, 0], thighR: [4, 0, -12], kneeR: [6, 0, 0] };
    },
    // combat stance: side-on, open hands, one forward
    p_stance: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.06 + b * 0.006 }, hips: [0, -26, 0], spine: [6, 10, 0], chest: [6, 18, 0], head: [-8, -20, 0],
        shoulderL: [-70, 0, 10], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -24], elbowR: [-100, 0, 0],
        thighL: [-24, 16, 12], kneeL: [30 + b * 2, 0, 0], thighR: [14, -12, -12], kneeR: [22 + b * 2, 0, 0],
        hands: ['open', 'open'],
      };
    },
    flyIdle: (t) => ({ ...C.armsCrossed, root: { y: Math.sin(t * 1.7) * 0.03 }, thighL: [-2, 0, 6], kneeL: [16, 0, 0], footL: [40, 0, 0], thighR: [-6, 0, -6], kneeR: [22, 0, 0], footR: [40, 0, 0] }),
    p_chopW: {
      root: { y: -0.03 }, chest: [2, 30, 0], head: [-6, -24, 0],
      shoulderR: [-150, 0, -30], elbowR: [-60, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-90, 0, 0],
      thighL: [-16, 10, 12], kneeL: [20, 0, 0], thighR: [8, -10, -12], kneeR: [12, 0, 0],
      hands: ['fist', 'open'],
    },
    p_chop: {
      root: { y: -0.06, rx: 10 }, chest: [10, -30, 0], head: [-12, 24, 0],
      shoulderR: [-70, 0, -10], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 26], elbowL: [-80, 0, 0],
      thighL: [-26, 10, 12], kneeL: [30, 0, 0], thighR: [14, -10, -12], kneeR: [14, 0, 0],
      hands: ['fist', 'open'],
    },
    // a straight arm thrown far forward (the arm itself stretches during the strike)
    p_reachW: { root: { y: -0.04 }, chest: [2, -26, 0], head: [-8, 20, 0], shoulderR: [-60, 0, -40], elbowR: [-100, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-80, 0, 0], thighL: [-18, 10, 12], kneeL: [24, 0, 0], thighR: [10, -10, -12], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
    p_reach: { root: { y: -0.08, rx: 12 }, chest: [10, 26, 0], head: [-14, -20, 0], shoulderR: [-92, 0, 2], elbowR: [-2, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-70, 0, 0], thighL: [-30, 10, 12], kneeL: [36, 0, 0], thighR: [16, -10, -12], kneeR: [12, 0, 0], hands: ['fist', 'fist'] },
    p_elbowW: { root: { y: -0.02 }, chest: [-4, -30, 0], head: [-6, 26, 0], shoulderR: [-100, 0, 60], elbowR: [-140, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-80, 0, 0], thighL: [-16, 10, 12], kneeL: [20, 0, 0], thighR: [8, -10, -12], kneeR: [12, 0, 0] },
    p_elbow: { root: { y: -0.1, rx: 14 }, chest: [16, 30, 0], head: [-16, -20, 0], shoulderR: [-86, 0, -40], elbowR: [-150, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-80, 0, 0], thighL: [-36, 10, 12], kneeL: [44, 0, 0], thighR: [18, -10, -12], kneeR: [16, 0, 0] },
    p_stretchKickW: { root: { y: 0.02 }, chest: [-6, 20, 0], shoulderL: [-40, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-70, 0, 0], thighR: [-60, 0, -10], kneeR: [100, 0, 0], thighL: [-6, 0, 10], kneeL: [16, 0, 0] },
    p_stretchKick: { root: { y: 0.04, rx: -10 }, spine: [-8, 0, 0], chest: [-10, 10, 0], head: [-6, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-40, 0, 0], thighR: [-96, 0, -6], kneeR: [4, 0, 0], footR: [30, 0, 0], thighL: [10, 0, 10], kneeL: [20, 0, 0] },
    p_demonHandW: { root: { y: -0.04 }, chest: [4, -20, 0], head: [-8, 16, 0], shoulderR: [-40, 0, -30], elbowR: [-120, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-70, 0, 0], thighL: [-20, 10, 12], kneeL: [26, 0, 0], thighR: [10, -10, -12], kneeR: [16, 0, 0], hands: ['fist', 'open'] },
    p_demonHand: { root: { y: -0.06, rx: 8 }, chest: [8, 24, 0], head: [-10, -18, 0], shoulderR: [-94, 0, 0], elbowR: [0, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-80, 0, 0], thighL: [-28, 10, 12], kneeL: [34, 0, 0], thighR: [14, -10, -12], kneeR: [14, 0, 0], hands: ['fist', 'open'] },
    p_grenadeW: { root: { y: -0.04 }, chest: [-4, -34, 0], head: [-10, 30, 0], shoulderR: [-30, 0, -70], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 70], elbowL: [-60, 0, 0], thighL: [-22, 10, 14], kneeL: [28, 0, 0], thighR: [12, -10, -14], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    p_grenade: { root: { y: -0.06, rx: 6 }, chest: [6, 10, 0], head: [-10, -6, 0], shoulderR: [-90, 12, -10], elbowR: [-6, 0, 0], shoulderL: [-90, -12, 10], elbowL: [-6, 0, 0], thighL: [-28, 10, 14], kneeL: [34, 0, 0], thighR: [14, -10, -14], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    p_sbcCharge: (t) => {
      const s = Math.sin(t * 40) * 1.2;
      return {
        root: { y: -0.04 }, chest: [-4 + s, 0, 0], head: [-6, 0, 0],
        shoulderR: [-140, 0, -40], elbowR: [-128, 0, 0], handR: [0, 0, 0],
        shoulderL: [-50, 0, 30], elbowL: [-110, 0, 0],
        thighL: [-20, 0, 14], kneeL: [26, 0, 0], thighR: [12, 0, -14], kneeR: [22, 0, 0],
        hands: ['fist', 'point'],
      };
    },
    p_sbcFire: {
      root: { y: -0.06, rx: 4 }, chest: [4, 14, 0], head: [-10, -10, 0],
      shoulderR: [-92, 0, 4], elbowR: [-2, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-100, 0, 0],
      thighL: [-28, 0, 14], kneeL: [34, 0, 0], thighR: [16, 0, -14], kneeR: [22, 0, 0],
      hands: ['fist', 'point'],
    },
    // cross-legged meditation, floating slightly (also his victory pose)
    p_meditate: (t) => ({
      root: { y: -0.46 + Math.sin(t * 1.4) * 0.02 }, spine: [-2, 0, 0], head: [-6, 0, 0],
      shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0],
      thighL: [-90, 40, 30], kneeL: [140, 0, 0], thighR: [-90, -40, -30], kneeR: [140, 0, 0],
    }),
    // pulls off the weighted cape and drops it
    p_capeOff: { root: { y: -0.02 }, chest: [-6, 20, 0], head: [-8, -14, 0], shoulderR: [-160, 0, -40], elbowR: [-90, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-40, 0, 0], thighL: [-8, 0, 12], kneeL: [6, 0, 0], thighR: [4, 0, -12], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
    // Explosive Demon Wave: palms drawn back to the hips, then both arms thrust out wide
    p_dwCharge: {
      hands: ['open', 'open'], root: { y: -0.12 }, spine: [4, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0],
      shoulderL: [20, 0, 22], elbowL: [-70, 0, 0], shoulderR: [20, 0, -22], elbowR: [-70, 0, 0],
      thighL: [-30, 0, 14], kneeL: [50, 0, 0], thighR: [20, 0, -14], kneeR: [36, 0, 0],
    },
    p_dwFire: {
      hands: ['open', 'open'], root: { y: -0.14, rx: -4 }, spine: [2, 0, 0], chest: [-2, 0, 0], head: [-4, 0, 0],
      shoulderL: [-84, 0, -2], elbowL: [-6, 0, 0], shoulderR: [-84, 0, 2], elbowR: [-6, 0, 0],
      thighL: [-40, 0, 14], kneeL: [52, 0, 0], thighR: [26, 0, -14], kneeR: [20, 0, 0],
    },
  };

  SL.data.characters.piccolo = {
    id: 'piccolo',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Piccolo',
    fullName: 'Piccolo, Namekian',
    era: 'Saiyan Saga',
    playable: true,
    prototype: true,
    storyAlly: true,
    style: 'Tactician',
    blurb: 'Long reach, patient traps and a beam that pierces anything. He never fights fair and never fights close unless he chooses to.',
    ratings: { power: 3, speed: 3, ki: 4, defense: 3 },
    stats: { hp: 12000, ki: 100, stamina: 100, speed: 1.0, power: 0.95, defense: 1.0, weight: 1.05, kiRegen: 2.4, chargeRate: 34, canonPower: 0.9 },
    appearance: {
      height: 1.02,
      skin: 0x6cb85a,
      build: { chestW: 0.205, shoulderX: 0.21, waistW: 0.13, upperArmR: 0.058, foreArmR: 0.052, thighR: 0.086, headR: 0.116 },
      headExtras: [
        { a: [0.35, 0.95, 0.35], d: [0.3, 1, 0.5], l: 0.09, r: 0.012, color: 0x6cb85a, depth: 0.98, outline: 0.4 },
        { a: [-0.35, 0.95, 0.35], d: [-0.3, 1, 0.5], l: 0.09, r: 0.012, color: 0x6cb85a, depth: 0.98, outline: 0.4 },
      ],
      face: { pupil: 0x101010, eyeW: 0.9, browThick: 1.2, brow: 0x3e7a34, pointedEars: true },
      outfit: {
        topStyle: 'gi', top: 0x5b3a8e, sleeves: 'none', arms: 0x6cb85a,
        wrist: 0xb3202a, belt: 0x7fc4e8, pants: 0x5b3a8e, pantsStyle: 'gi',
        boots: 0x6a3a1a, bootStyle: 'gi',
        turban: 0xf4f2ee, turbanBand: 0x5b3a8e,
        cape: 0xf4f2ee,
      },
      portraitColor: '#5b3a8e',
    },
    vfx: { ghost: 0xd8ffc8 },
    audio: { strikePitch: 0.95, heavyPitch: 0.85 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xeaffd8, core: 0xffffff, particles: 0xd8ffc0 }, mult: {} },
      {
        // "The Warrior": Nail gives himself to him. The story grants this once and
        // never takes it back, so there is nothing to spend and no way to buy it.
        id: 'nail',
        name: 'Fused',
        noCost: true,
        storyLocked: true, // only 'The Warrior' hands it over
        style: 'burst',
        line: 'piccolo_fuse',
        mult: { damage: 1.55, speed: 1.2, defense: 1.3, kiRegen: 1.4, chargeRate: 1.25 },
        look: { scale: 1.06, bulk: 1.12, tint: 0x9fe08a, tintAmount: 0.18 },
        aura: { color: 0x9fe08a, core: 0xffffff, particles: 0xd8ffc0, speed: 1.4 },
        sequence: { length: 180, applyAt: 112, steps: [{ at: 0, pose: 'p_meditate', shake: 0.2 }, { at: 60, pose: 'p_meditate', shake: 0.5 }, { at: 104, pose: 'p_grenadeW', shake: 1, burst: true }, { at: 150, pose: 'idle' }] },
      },
    ],
    poses,
    moves: {
      light: [
        { id: 'jab', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 260, reach: 1.2, radius: 0.7, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'chop', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 290, reach: 1.25, radius: 0.75, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'p_chopW', strike: 'p_chop' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'stretchPunch', startup: 7, active: 4, recovery: 15, cancel: 9, damage: 330, reach: 2.6, radius: 0.7, lunge: 4, hitstun: 22, knock: 'flinch', impact: 1, limb: { side: 'R', length: 2.4 }, pose: { wind: 'p_reachW', strike: 'p_reach' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'stretchKick', startup: 8, active: 5, recovery: 17, cancel: 10, damage: 380, reach: 2.9, radius: 0.8, lunge: 4, hitstun: 26, knock: 'push', knockSpeed: 8, impact: 2, limb: { side: 'legR', length: 2.2 }, pose: { wind: 'p_stretchKickW', strike: 'p_stretchKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'demonElbow', startup: 11, active: 4, recovery: 22, damage: 760, reach: 1.2, radius: 0.9, lunge: 14, hitstun: 32, knock: 'heavy', knockSpeed: 24, impact: 2, guardCrush: true, guardDamage: 45, pose: { wind: 'p_elbowW', strike: 'p_elbow' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'upperKick', startup: 9, active: 4, recovery: 20, damage: 620, reach: 1.2, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        4: { id: 'longReachSmash', startup: 12, active: 5, recovery: 24, damage: 880, reach: 3.2, radius: 0.95, lunge: 4, hitstun: 36, knock: 'smash', knockSpeed: 30, impact: 3, limb: { side: 'R', length: 2.8 }, pose: { wind: 'hammerWind', strike: 'p_reach' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      airHeavy: {
        0: { id: 'airDemonHammer', startup: 11, active: 4, recovery: 22, damage: 720, reach: 1.3, radius: 0.95, lunge: 13, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'airStretchKick', startup: 9, active: 5, recovery: 20, damage: 620, reach: 2.8, radius: 0.9, lunge: 6, hitstun: 34, knock: 'launch', knockSpeed: 16, impact: 2, limb: { side: 'legR', length: 2.2 }, pose: { wind: 'p_stretchKickW', strike: 'p_stretchKick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'dashKnee', startup: 6, active: 9, recovery: 18, damage: 680, reach: 1.2, radius: 0.9, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      throw: { id: 'demonToss', name: 'Demon Toss', damage: 950, knockSpeed: 28, poses: ['grab', 'p_chopW', 'p_chop'] },
    },
    specials: {
      special1: {
        id: 'demonHand', name: 'Demon Hand', type: 'stretchGrab', kiCost: 20, icon: 'rush', cooldown: 90,
        reach: 13, extendFrames: 10, pullFrames: 12, damage: 240, hitstunAfter: 30, recovery: 18, armLength: 0.47,
        poses: { wind: 'p_demonHandW', reach: 'p_demonHand' },
      },
      special2: {
        id: 'lightGrenade', name: 'Light Grenade', type: 'projectile', kiCost: 25, icon: 'ball',
        startup: 14, recovery: 18, pose: { wind: 'p_grenadeW', release: 'p_grenade' },
        projectile: { kind: 'ball', speed: 34, radius: 0.75, damage: 1500, color: 0xe8ff8a, core: 0xffffff, explode: 5, knock: 'heavy', knockSpeed: 22, impact: 3, life: 8, mine: { after: 14, trigger: 3.4, life: 330 } },
      },
      ultimate: {
        id: 'specialBeamCannon', name: 'Special Beam Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 120, chargeMax: 120, damage: [5600, 5600], radius: [0.45, 0.45], speed: 170, range: 190, sustain: 30,
        color: 0xfff0a0, core: 0xffffff, poses: { charge: 'p_sbcCharge', fire: 'p_sbcFire' }, recovery: 40, cinematic: true, oneHand: true, pierce: true,
        style: { rings: 7, ringColor: 0xffe860, ringSpeed: 2.2 },
        callout: ['SPECIAL BEAM', 'CANNON!'], chargeLight: 0xfff0a0,
      },
    },
    // techniques beyond the three buttons, chosen on the skill wheel
    extras: [
      {
        id: 'explosiveDemonWave', name: 'Explosive Demon Wave', type: 'beam', kiCost: 45, icon: 'beam',
        chargeMin: 30, chargeMax: 84, tiers: [30, 60], damage: [2300, 3800], radius: [1.0, 1.9], speed: 85, range: 130, sustain: 40,
        color: 0xfff07a, core: 0xffffff, poses: { charge: 'p_dwCharge', fire: 'p_dwFire' }, recovery: 30, chargeLight: 0xfff07a,
        style: { rings: 2, ringColor: 0xfff8c0, ringSpeed: 1.1 },
      },
    ],
    mechanic: { type: 'regeneration', name: 'Regeneration', desc: 'After a few seconds without taking damage, visibly regrows health up to 60%.' },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.7, ranged: 0.55, beam: 0.35, transformHp: 0, preferredRange: 6, hooks: 'piccolo' },
    barks: { combo: 'piccolo_combo', hurt: 'piccolo_hurt', lowHp: 'piccolo_lowHp', trap: 'piccolo_trap', grab: 'piccolo_grab' },
    sequences: {
      intro: [
        { pose: 'p_meditate', dur: 0.9, speed: 6, expression: 'calm' },
        { pose: 'p_capeOff', dur: 0.7, speed: 9, expression: 'angry', event: 'dropCape' },
        { pose: 'p_stance', dur: 1.2, speed: 7, expression: 'smirk' },
      ],
      victory: [[{ pose: 'armsCrossed', dur: 0.8, speed: 8, expression: 'smirk' }, { pose: 'p_meditate', dur: 9, speed: 4, expression: 'calm' }]],
      defeat: [{ pose: 'defeatKneel', dur: 9, speed: 6, expression: 'hurt' }],
    },
    intro: { pose: 'idle', expression: 'calm' },
    victory: { poses: ['p_meditate'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
