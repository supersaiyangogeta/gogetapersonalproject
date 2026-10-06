/*
 * SATAN CITY LOCALS (Buu Saga, Age 774) — the people the Great Saiyaman is
 * actually up against, and the people he is up against them for.
 *
 *   city_thug   an armed robber. Ordinary strength, ordinary speed, a pistol he
 *               fires from range and a pipe he swings when cornered. He exists
 *               so a crime-fighting mission has something to fight that a
 *               Saiyan must not hit properly.
 *   civilian    a bystander: no attacks worth the name, runs, and the missions
 *               score keeping him alive rather than defeating him.
 *
 * Both are deliberately fragile. The gameplay point of the Saiyaman missions is
 * restraint and speed, not damage.
 *
 * Level 1 functional prototypes; not playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    th_idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.02 + b * 0.008 },
        hips: [0, -6, 0], spine: [6, 0, 0], chest: [4, 6, 0], head: [-4, -6, 0],
        shoulderL: [-24, 0, 14], elbowL: [-56, 0, 0], shoulderR: [-30, 0, -14], elbowR: [-70, 0, 0],
        thighL: [-10, 4, 10], kneeL: [14 + b * 2, 0, 0], thighR: [8, -4, -10], kneeR: [12 + b * 2, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    th_swingW: {
      root: { y: -0.02 }, spine: [-4, -26, 0], chest: [-6, -30, 0], head: [-4, 22, 0],
      shoulderR: [-140, 0, -34], elbowR: [-40, 0, 0], shoulderL: [-24, 0, 20], elbowL: [-60, 0, 0],
      thighL: [-12, 0, 10], kneeL: [18, 0, 0], thighR: [8, 0, -10], kneeR: [14, 0, 0],
      hands: ['fist', 'fist'],
    },
    th_swing: {
      root: { y: -0.05, rx: 10 }, spine: [10, 30, 0], chest: [14, 34, 0], head: [-6, -24, 0],
      shoulderR: [-40, 0, -12], elbowR: [-14, 0, 0], shoulderL: [-30, 0, 22], elbowL: [-70, 0, 0],
      thighL: [-22, 0, 10], kneeL: [30, 0, 0], thighR: [14, 0, -10], kneeR: [14, 0, 0],
      hands: ['fist', 'fist'],
    },
    th_aimW: { ...C.blastWind },
    th_aim: { ...C.blastR },
    // hands up, pipe on the ground
    th_surrender: {
      root: { y: -0.03 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [12, 0, 0],
      shoulderL: [-168, 0, 22], elbowL: [-18, 0, 0], shoulderR: [-168, 0, -22], elbowR: [-18, 0, 0],
      thighL: [-8, 0, 10], kneeL: [14, 0, 0], thighR: [-8, 0, -10], kneeR: [14, 0, 0],
      hands: ['open', 'open'],
    },
    cv_cower: (t) => {
      const b = Math.sin(t * 5.5);
      return {
        root: { y: -0.16 + b * 0.008, rx: 18 },
        hips: [0, 0, 0], spine: [22, 0, 0], chest: [18, 0, 0], head: [26, b * 6, 0],
        shoulderL: [-108, 0, 26], elbowL: [-130, 0, 0], shoulderR: [-108, 0, -26], elbowR: [-130, 0, 0],
        thighL: [-64, 4, 10], kneeL: [86, 0, 0], thighR: [-64, -4, -10], kneeR: [86, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  SL.data.characters.city_thug = {
    id: 'city_thug',
    assetLevel: 1,
    name: 'Robber',
    fullName: 'Satan City Robber',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Armed Robbery',
    blurb: 'Picked the wrong city, the wrong afternoon and the wrong high school student.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 1400, ki: 40, stamina: 70, speed: 0.86, power: 0.45, defense: 0.6, weight: 0.9, kiRegen: 1, chargeRate: 10, canonPower: 0.001 },
    appearance: {
      height: 0.95,
      skin: 0xe8c49a,
      build: { chestW: 0.215, chestD: 0.155, shoulderX: 0.215, waistW: 0.175, upperArmR: 0.056, foreArmR: 0.048, fist: 0.052, thighR: 0.09, shinR: 0.07, headR: 0.145, neckLen: 0.05 },
      hair: { style: 'yajirobe', color: 0x2a2018 },
      face: { pupil: 0x1a1a1a, eyeW: 0.95 },
      outfit: {
        topStyle: 'gi', top: 0x3a4250, sleeves: 'long', sleeveColor: 0x3a4250, wrist: 0x2a2f38,
        belt: 0x2a2018, pants: 0x2f3440, pantsStyle: 'gi', boots: 0x24262c, bootStyle: 'gi',
      },
      portraitColor: '#3a4250',
    },
    vfx: { ghost: 0xc0c4cc },
    audio: { strikePitch: 1, heavyPitch: 0.95 },
    flight: false,
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc8ccd4, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: poses.th_idle }, poses),
    moves: {
      light: [
        { id: 'thPunch', startup: 7, active: 3, recovery: 14, cancel: 9, damage: 90, reach: 1, radius: 0.65, lunge: 8, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'th_swingW', strike: 'th_swing' }, sfx: 'punchLight', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'thPipe', startup: 14, active: 4, recovery: 24, damage: 220, reach: 1.25, radius: 0.8, lunge: 9, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'th_swingW', strike: 'th_swing' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'thRush', startup: 10, active: 4, recovery: 20, damage: 140, reach: 1.1, radius: 0.75, lunge: 14, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'th_swingW', strike: 'th_swing' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {
      // a pistol, which against anybody in this cast is a noise
      special1: {
        id: 'thShot', name: 'Pistol', type: 'projectile', kiCost: 6, icon: 'ball',
        startup: 18, recovery: 26, pose: { wind: 'th_aimW', release: 'th_aim' },
        projectile: { kind: 'ball', speed: 92, radius: 0.16, damage: 120, homing: 0, color: 0xffe0a0, core: 0xffffff, explode: 0.4, knock: 'flinch', knockSpeed: 4, impact: 1, life: 1.6 },
      },
    },
    mechanic: null,
    ai: { personality: 'gunner', aggression: 0.35, defense: 0.2, ranged: 0.85, beam: 0, transformHp: 0, preferredRange: 8 },
    intro: { pose: 'th_idle', expression: 'angry' },
    victory: { poses: ['th_idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  SL.data.characters.civilian = {
    id: 'civilian',
    assetLevel: 1,
    name: 'Civilian',
    fullName: 'Satan City Civilian',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Bystander',
    blurb: 'Wants to be somewhere else, and is the reason the fight has rules.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 600, ki: 20, stamina: 60, speed: 0.8, power: 0.2, defense: 0.5, weight: 0.85, kiRegen: 1, chargeRate: 8, canonPower: 0.0005 },
    appearance: {
      height: 0.93,
      skin: 0xf0c49a,
      build: { chestW: 0.2, chestD: 0.145, shoulderX: 0.2, waistW: 0.16, upperArmR: 0.05, foreArmR: 0.044, fist: 0.048, thighR: 0.085, shinR: 0.066, headR: 0.142, neckLen: 0.05 },
      hair: { style: 'yamcha', color: 0x3a2a1e },
      face: { pupil: 0x1a1a1a, eyeW: 1 },
      outfit: {
        topStyle: 'gi', top: 0xc4d2dc, sleeves: 'short', sleeveColor: 0xc4d2dc, wrist: 0xc4d2dc,
        belt: 0x6a5a4a, pants: 0x7a6a58, pantsStyle: 'gi', boots: 0x4a3a2c, bootStyle: 'gi',
      },
      portraitColor: '#c4d2dc',
    },
    vfx: { ghost: 0xd8e0e8 },
    audio: { strikePitch: 1.05, heavyPitch: 1 },
    flight: false,
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xd8e0e8, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: poses.cv_cower }, poses),
    moves: {
      light: [
        { id: 'cvFlail', startup: 10, active: 3, recovery: 18, cancel: 12, damage: 20, reach: 0.9, radius: 0.6, lunge: 4, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'th_swingW', strike: 'th_swing' }, sfx: 'punchLight', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'cvShove', startup: 16, active: 3, recovery: 26, damage: 30, reach: 0.9, radius: 0.6, lunge: 4, hitstun: 12, knock: 'push', knockSpeed: 6, impact: 1, pose: { wind: 'th_swingW', strike: 'th_swing' }, sfx: 'punchLight', hitPose: 'hitBody' },
      },
      dash: { id: 'cvStumble', startup: 12, active: 3, recovery: 22, damage: 20, reach: 0.9, radius: 0.6, lunge: 8, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'th_swingW', strike: 'th_swing' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.02, defense: 0.9, ranged: 0, beam: 0, transformHp: 0, preferredRange: 14 },
    intro: { pose: 'cv_cower', expression: 'shock' },
    victory: { poses: ['cv_cower'], expression: 'shock' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
