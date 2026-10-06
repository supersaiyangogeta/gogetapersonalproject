/*
 * THE GREAT SAIYAMAN (Buu Saga, Age 774) — what Gohan does with the strongest
 * body on Earth when his mother will not let him be seen fighting: a helmet, a
 * cape, a name he invented, and poses nobody asked for.
 *
 * He is a separate fighter rather than a costume on Gohan, and on purpose: he
 * fights like somebody performing rather than somebody fighting. Short, showy
 * combinations, a rush that ends in a pose, a flashy blast, and Masenko when
 * the joke has to stop. He hits like Gohan does, because he is Gohan — but the
 * rhythm, the stance, the intro, the victory and the CPU personality are the
 * character, and none of them are the quiet student's.
 *
 * Adaptation note: the engine can give a form its own poses, moves and AI, but
 * not its own costume, so the change of clothes is a change of fighter. The
 * story swaps them in a cinematic (`saiyaman_change`), which is also how the
 * secret identity reads on screen.
 *
 * Level 1 functional prototype; playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // hands on hips, chin up: waiting to be recognised
    gs_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.01 + b * 0.008 },
        hips: [0, 0, 0], spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-8, 0, 0],
        shoulderL: [-30, 0, 70], elbowL: [-92, 0, 0], shoulderR: [-30, 0, -70], elbowR: [-92, 0, 0],
        thighL: [-6, 2, 14], kneeL: [10, 0, 0], thighR: [-6, -2, -14], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the pose: one arm across, one arm up, a full stop in the middle of a fight
    gs_pose1: {
      root: { y: 0.02, rz: -6 }, spine: [-8, 10, 0], chest: [-10, 16, 0], head: [-10, -18, 0],
      shoulderR: [-176, 0, -20], elbowR: [-6, 0, 0], shoulderL: [-58, 0, 86], elbowL: [-104, 0, 0],
      thighL: [-14, 0, 18], kneeL: [16, 0, 0], thighR: [10, 0, -10], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    gs_pose2: {
      root: { y: 0.01, rz: 8 }, spine: [-6, -14, 0], chest: [-8, -18, 0], head: [-12, 20, 0],
      shoulderL: [-178, 0, 18], elbowL: [-8, 0, 0], shoulderR: [-56, 0, -88], elbowR: [-102, 0, 0],
      thighR: [-14, 0, -18], kneeR: [16, 0, 0], thighL: [10, 0, 10], kneeL: [12, 0, 0],
      hands: ['open', 'open'],
    },
    // arms crossed, cape out: the landing
    gs_land: {
      root: { y: -0.04, rx: 6 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
      shoulderL: [-92, 0, 26], elbowL: [-116, 0, 0], shoulderR: [-92, 0, -26], elbowR: [-116, 0, 0],
      thighL: [-40, 6, 14], kneeL: [56, 0, 0], thighR: [-40, -6, -14], kneeR: [56, 0, 0],
      hands: ['fist', 'fist'],
    },
    gs_jabW: {
      root: { y: -0.04 }, chest: [2, -22, 0], head: [-4, 16, 0],
      shoulderR: [-40, 0, -18], elbowR: [-118, 0, 0], shoulderL: [-52, 0, 18], elbowL: [-96, 0, 0],
      thighL: [-20, 0, 12], kneeL: [28, 0, 0], thighR: [12, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    gs_jab: {
      root: { y: -0.06, rx: 6 }, chest: [6, 26, 0], head: [-10, -18, 0],
      shoulderR: [-96, 0, 2], elbowR: [-4, 0, 0], shoulderL: [-46, 0, 20], elbowL: [-110, 0, 0],
      thighL: [-30, 0, 12], kneeL: [38, 0, 0], thighR: [18, 0, -12], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    },
    gs_chopW: {
      root: { y: -0.02 }, spine: [-6, -18, 0], chest: [-8, -22, 0], head: [-6, 18, 0],
      shoulderR: [-150, 0, -40], elbowR: [-30, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-70, 0, 0],
      thighL: [-16, 0, 12], kneeL: [22, 0, 0], thighR: [10, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    gs_chop: {
      root: { y: -0.07, rx: 14 }, spine: [12, 22, 0], chest: [16, 26, 0], head: [-8, -20, 0],
      shoulderR: [-30, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-36, 0, 22], elbowL: [-84, 0, 0],
      thighL: [-28, 0, 12], kneeL: [36, 0, 0], thighR: [16, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    gs_kickW: { ...C.kickWindR, root: { y: -0.07 } },
    gs_kick: {
      root: { y: 0.03, rz: -14 }, chest: [-4, 44, 0], head: [-4, -34, 0],
      shoulderL: [-14, 0, 58], elbowL: [-26, 0, 0], shoulderR: [-14, 0, -58], elbowR: [-26, 0, 0],
      thighR: [-96, 0, -24], kneeR: [6, 0, 0], footR: [32, 0, 0], thighL: [12, 0, 8], kneeL: [14, 0, 0],
      hands: ['open', 'open'],
    },
    gs_blastW: { ...C.blastWind },
    gs_blast: { ...C.blastR },
    gs_masenkoW: {
      root: { y: -0.05 }, spine: [-8, 0, 0], chest: [-10, 0, 0], neck: [-6, 0, 0], head: [-14, 0, 0],
      shoulderL: [-164, 0, 16], elbowL: [-12, 0, 0], shoulderR: [-166, 0, -16], elbowR: [-10, 0, 0],
      thighL: [-16, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    gs_fire: { ...C.beamFire },
  };

  SL.data.characters.great_saiyaman = {
    id: 'great_saiyaman',
    assetLevel: 1,
    name: 'Great Saiyaman',
    fullName: 'The Great Saiyaman',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Hero of Justice',
    blurb: 'Defender of Satan City. Absolutely not a high school student. Please stop asking.',
    ratings: { power: 4, speed: 4, ki: 4, defense: 3 },
    stats: { hp: 22000, ki: 130, stamina: 140, speed: 1.12, power: 1.16, defense: 0.98, weight: 0.95, kiRegen: 2.8, chargeRate: 34, canonPower: 3.2 },
    appearance: {
      height: 0.99,
      skin: 0xf6cda6,
      build: { chestW: 0.235, chestD: 0.168, shoulderX: 0.238, waistW: 0.175, upperArmR: 0.064, foreArmR: 0.055, fist: 0.058, thighR: 0.098, shinR: 0.076, headR: 0.152, neckLen: 0.055 },
      // the helmet covers it: only the skull cap, so nothing pokes through the dome
      hair: { style: 'cropped', color: 0x141418 },
      face: { pupil: 0x101010, eyeW: 1.02 },
      outfit: {
        topStyle: 'gi', top: 0x1f7a44, sleeves: 'long', sleeveColor: 0x1f7a44, under: 0x1a1a22,
        wrist: 0xe8e4dc, gloves: 0xe8e4dc, belt: 0xd8c23a, pants: 0x1f1f28, pantsStyle: 'gi',
        boots: 0xe8e4dc, bootStyle: 'gi',
        cape: 0xd02a2a,
        helmet: 0xe8e4dc, visor: 0xd8802a, visorOpacity: 0.6, helmetTrim: 0xd8c23a, antenna: 0xd8c23a,
      },
      portraitColor: '#1f7a44',
    },
    vfx: { ghost: 0xbfffd0 },
    audio: { strikePitch: 1.05, heavyPitch: 0.96 },
    forms: [{ id: 'base', name: 'Great Saiyaman', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe8ff }, mult: {} }],
    poses: Object.assign({ idle: poses.gs_idle }, poses),
    moves: {
      light: [
        { id: 'gsJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 560, reach: 1.25, radius: 0.78, lunge: 14, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'gs_jabW', strike: 'gs_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gsChop', startup: 5, active: 3, recovery: 11, cancel: 6, damage: 640, reach: 1.3, radius: 0.8, lunge: 14, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'gs_chopW', strike: 'gs_chop' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'gsKick', startup: 6, active: 4, recovery: 13, cancel: 8, damage: 840, reach: 1.55, radius: 0.9, lunge: 15, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'gs_kickW', strike: 'gs_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gsHammer', startup: 11, active: 5, recovery: 21, damage: 1900, reach: 1.45, radius: 1, lunge: 15, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, guardCrush: true, guardDamage: 44, pose: { wind: 'gs_chopW', strike: 'gs_chop' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'gsLaunch', startup: 9, active: 4, recovery: 18, damage: 1300, reach: 1.3, radius: 0.95, lunge: 13, hitstun: 32, knock: 'launch', knockSpeed: 21, impact: 2, pose: { wind: 'gs_jabW', strike: 'gs_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'gsDash', startup: 5, active: 7, recovery: 16, damage: 1200, reach: 1.45, radius: 0.95, lunge: 34, hitstun: 28, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'gs_jabW', strike: 'gs_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'gsToss', name: 'Justice Throw', damage: 1000, knockSpeed: 26, poses: ['grab', 'gs_chopW', 'gs_chop'] },
    },
    specials: {
      // the combination that ends in a pose instead of a finisher
      special1: {
        id: 'gsJustice', name: 'Justice Combination', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 5, dashFrames: 15, speed: 54, recovery: 22,
        poses: { wind: 'gs_chopW' },
        hits: [
          { pose: 'gs_jab', damage: 620, frames: 6, sfx: 'punchLight' },
          { pose: 'gs_chop', damage: 680, frames: 6, sfx: 'punchLight' },
          { pose: 'gs_kick', damage: 900, frames: 8, sfx: 'punchHeavy' },
          { pose: 'gs_pose1', damage: 1300, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 30, impact: 3 },
        ],
      },
      // thrown with a flourish, because everything he does is thrown with a flourish
      special2: {
        id: 'gsBlast', name: 'Saiyaman Blast', type: 'projectile', kiCost: 22, icon: 'ball',
        startup: 16, recovery: 20, pose: { wind: 'gs_blastW', release: 'gs_blast' },
        projectile: { kind: 'ball', speed: 76, radius: 0.72, damage: 1500, homing: 0.5, color: 0xffe25a, core: 0xfffbe0, explode: 2.4, knock: 'push', knockSpeed: 18, impact: 2, life: 2.6 },
      },
      ultimate: {
        id: 'gsMasenko', name: 'Masenko', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 44, chargeMax: 44, damage: [7600, 7600], radius: [1.7, 1.7], speed: 112, range: 175, sustain: 46,
        color: 0xffe25a, core: 0xfffbe0, poses: { charge: 'gs_masenkoW', fire: 'gs_fire' }, recovery: 40, cinematic: true,
        callout: ['MASEN', 'KO!'],
      },
    },
    mechanic: null,
    ai: { personality: 'martial', aggression: 0.72, defense: 0.5, ranged: 0.45, beam: 0.4, transformHp: 0, preferredRange: 2.8 },
    intro: { pose: 'gs_pose1', expression: 'calm' },
    victory: { poses: ['gs_pose1', 'gs_pose2', 'gs_idle'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
