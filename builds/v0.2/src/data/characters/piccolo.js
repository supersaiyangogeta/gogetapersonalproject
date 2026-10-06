/*
 * PICCOLO (Saiyan Saga) — Goku's rival, forced into an uneasy alliance.
 * Story ALLY (CPU partner) in Chapter 1. Not playable in this build.
 * Identity: calm, precise, keeps distance; charges the Special Beam Cannon.
 * Mechanic REGENERATION: regains health after a few seconds untouched.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    idle: (t) => {
      const b = Math.sin(t * 1.6);
      return { ...C.armsCrossed, root: { y: b * 0.004 }, head: [-4, 0, 0], thighL: [-4, 0, 12], kneeL: [6, 0, 0], thighR: [4, 0, -12], kneeR: [6, 0, 0] };
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
  };

  SL.data.characters.piccolo = {
    id: 'piccolo',
    name: 'Piccolo',
    fullName: 'Piccolo, Demon King',
    era: 'Saiyan Saga',
    playable: false,
    storyAlly: true,
    style: 'Tactician',
    blurb: 'A Namekian warrior with a grudge — and the only technique that can pierce Raditz.',
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
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaffd8, core: 0xffffff, particles: 0xd8ffc0 }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'jab', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 270, reach: 1.2, radius: 0.7, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'chop', startup: 5, active: 3, recovery: 12, cancel: 7, damage: 300, reach: 1.2, radius: 0.75, lunge: 9, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'p_chopW', strike: 'p_chop' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'kick', startup: 6, active: 4, recovery: 15, cancel: 9, damage: 360, reach: 1.35, radius: 0.8, lunge: 10, hitstun: 24, knock: 'push', knockSpeed: 7, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'palmStrike', startup: 11, active: 4, recovery: 22, damage: 760, reach: 1.25, radius: 0.9, lunge: 14, hitstun: 32, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'p_chopW', strike: 'p_chop' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'upperKick', startup: 9, active: 4, recovery: 20, damage: 620, reach: 1.2, radius: 0.85, lunge: 11, hitstun: 34, knock: 'launch', knockSpeed: 18, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'dashKnee', startup: 6, active: 9, recovery: 18, damage: 680, reach: 1.2, radius: 0.9, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      throw: { id: 'demonToss', name: 'Demon Toss', damage: 950, knockSpeed: 28, poses: ['grab', 'p_chopW', 'p_chop'] },
    },
    specials: {
      special1: {
        id: 'demonWave', name: 'Explosive Demon Wave', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 18, chargeMax: 70, damage: [1500, 2700], radius: [0.55, 1.0], speed: 95, range: 140, sustain: 30,
        color: 0xf2ff9a, core: 0xffffff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 22,
      },
      special2: {
        id: 'evilBlast', name: 'Evil Blast', type: 'projectile', kiCost: 25, icon: 'ball',
        startup: 12, recovery: 18, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 62, radius: 0.8, damage: 1300, homing: 1.2, color: 0xe8ff8a, core: 0xffffff, explode: 4, knock: 'heavy', knockSpeed: 20, impact: 2, life: 3 },
      },
      ultimate: {
        id: 'specialBeamCannon', name: 'Special Beam Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 120, chargeMax: 120, damage: [5600, 5600], radius: [0.45, 0.45], speed: 170, range: 190, sustain: 30,
        color: 0xfff0a0, core: 0xffffff, poses: { charge: 'p_sbcCharge', fire: 'p_sbcFire' }, recovery: 40, cinematic: true, oneHand: true,
        style: { rings: 7, ringColor: 0xffe860, ringSpeed: 2.2 },
      },
    },
    mechanic: { type: 'regeneration', name: 'Regeneration', desc: 'After a few seconds without taking damage, slowly regenerates health up to 60%.' },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.6, ranged: 0.55, beam: 0.35, transformHp: 0, preferredRange: 6 },
    barks: { combo: 'piccolo_combo', hurt: 'piccolo_hurt', lowHp: 'piccolo_lowHp' },
    intro: { pose: 'idle', expression: 'calm' },
    victory: { poses: ['armsCrossed'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* Kid Gohan — cutscene character only (no combat moves). */
  SL.data.characters.kid_gohan = {
    id: 'kid_gohan',
    name: 'Gohan',
    playable: false,
    cinematicOnly: true,
    era: 'Saiyan Saga',
    stats: { hp: 3000, ki: 100, stamina: 100, speed: 1, power: 1, defense: 1, weight: 0.5, kiRegen: 1, chargeRate: 20, canonPower: 0.3 },
    appearance: {
      height: 0.56,
      skin: 0xf6cda6,
      build: { chestW: 0.19, shoulderX: 0.19, waistW: 0.13, upperArmR: 0.05, foreArmR: 0.046, fist: 0.06, thighR: 0.08, shinR: 0.064, headR: 0.17, neckLen: 0.05, upperArmLen: 0.24, foreArmLen: 0.22, thighLen: 0.37, shinLen: 0.34 },
      hair: { style: 'gohan_kid', color: 0x141418 },
      face: { pupil: 0x101010, eyeW: 1.2 },
      outfit: {
        topStyle: 'gi', top: 0x9a3a8e, sleeves: 'long', sleeveColor: 0x9a3a8e, wrist: 0xe6c24a,
        belt: 0xe6c24a, pants: 0x9a3a8e, pantsStyle: 'gi', boots: 0x3a2a24, bootStyle: 'gi',
        cap: 0xd8452a, capBall: 0xffa21a, capStars: 4,
        tail: 0x6a3a1a,
      },
      portraitColor: '#9a3a8e',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: {
      g_cry: { root: { y: -0.02 }, chest: [16, 0, 0], head: [10, 0, 0], shoulderL: [-100, 0, -10], elbowL: [-130, 0, 0], shoulderR: [-100, 0, 10], elbowR: [-130, 0, 0], thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [6, 0, -8], kneeR: [8, 0, 0] },
      g_headbutt: { root: { rx: 80 }, spine: [0, 0, 0], head: [-50, 0, 0], shoulderL: [30, 0, 30], elbowL: [-20, 0, 0], shoulderR: [30, 0, -30], elbowR: [-20, 0, 0], thighL: [10, 0, 4], kneeL: [30, 0, 0], thighR: [4, 0, -4], kneeR: [30, 0, 0] },
    },
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'idle', expression: 'hurt' },
  };
})();
