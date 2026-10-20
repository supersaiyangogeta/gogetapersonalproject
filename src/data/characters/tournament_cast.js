/*
 * THE 25TH WORLD TOURNAMENT — people who are there for the tournament itself.
 *
 *   mr_satan   the World Champion, the man who "beat Cell". A real martial artist
 *              by human standards and a showman first: big wind-ups, a flex after
 *              every exchange, a Dynamite Kick he announces before he throws it.
 *              Non-playable in Milestone B (he fights in the junior exhibition);
 *              his story weight arrives with Good Buu and the Spirit Bomb.
 *   idasa      the junior-division boy who draws Trunks in the first round. Big
 *              for his age, and entirely ordinary.
 *   ikose      the junior-division boy who draws Goten.
 *
 * All three are ordinary humans, and deliberately so: the tournament is where
 * the game shows the distance between the World Champion and a seven-year-old.
 *
 * Level 1 functional prototypes; not playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // chest out, fists on hips: the champion is here
    ms_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.01 + b * 0.006 },
        hips: [0, 0, 0], spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-10, 0, 0],
        shoulderL: [-24, 0, 62], elbowL: [-100, 0, 0], shoulderR: [-24, 0, -62], elbowR: [-100, 0, 0],
        thighL: [-4, 4, 16], kneeL: [8, 0, 0], thighR: [-4, -4, -16], kneeR: [8, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the victory sign and the grin
    ms_peace: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: 0.01 + Math.max(0, b) * 0.02 },
        spine: [-8, 10, 0], chest: [-10, 14, 0], head: [-12, -10, 0],
        shoulderR: [-172, 0, -18], elbowR: [-8, 0, 0], shoulderL: [-30, 0, 60], elbowL: [-100, 0, 0],
        thighL: [-8, 0, 14], kneeL: [10, 0, 0], thighR: [4, 0, -12], kneeR: [8, 0, 0],
        hands: ['open', 'point'],
      };
    },
    // the flex: both arms up, biceps to the crowd
    ms_flex: {
      root: { y: -0.02 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-12, 0, 0],
      shoulderL: [-90, 0, 80], elbowL: [-120, 0, 0], shoulderR: [-90, 0, -80], elbowR: [-120, 0, 0],
      thighL: [-10, 4, 18], kneeL: [16, 0, 0], thighR: [-10, -4, -18], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    },
    // his wind-up takes long enough to announce
    ms_punchW: {
      root: { y: -0.04 }, spine: [-4, -30, 0], chest: [-6, -36, 0], head: [-6, 26, 0],
      shoulderR: [-30, 0, -40], elbowR: [-120, 0, 0], shoulderL: [-70, 0, 24], elbowL: [-60, 0, 0],
      thighL: [-24, 0, 14], kneeL: [30, 0, 0], thighR: [14, 0, -14], kneeR: [22, 0, 0],
      hands: ['fist', 'fist'],
    },
    ms_punch: {
      root: { y: -0.07, rx: 10 }, spine: [8, 30, 0], chest: [10, 34, 0], head: [-12, -22, 0],
      shoulderR: [-96, 0, 2], elbowR: [-4, 0, 0], shoulderL: [-40, 0, 26], elbowL: [-100, 0, 0],
      thighL: [-32, 0, 14], kneeL: [40, 0, 0], thighR: [20, 0, -14], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    },
    ms_kickW: { ...C.kickWindR, root: { y: -0.06 } },
    ms_kick: {
      root: { y: 0.04, rz: -14 }, chest: [-6, 44, 0], head: [-6, -32, 0],
      shoulderL: [-14, 0, 60], elbowL: [-26, 0, 0], shoulderR: [-14, 0, -60], elbowR: [-26, 0, 0],
      thighR: [-104, 0, -24], kneeR: [4, 0, 0], footR: [34, 0, 0], thighL: [14, 0, 8], kneeL: [12, 0, 0],
      hands: ['fist', 'fist'],
    },
    // what he does when it goes wrong: hands up, backing away
    ms_panic: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: -0.04 + b * 0.01, rx: -8 }, spine: [-10, 0, 0], chest: [-6, 0, 0], head: [-14, b * 6, 0],
        shoulderL: [-150, 0, 30], elbowL: [-40, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-40, 0, 0],
        thighL: [10, 0, 12], kneeL: [22, 0, 0], thighR: [-20, 0, -12], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // behind a rock, as small as the champion gets, peeking over it
    ms_hide: (t) => {
      const b = Math.sin(t * 6);
      return {
        root: { y: -0.36 + b * 0.006, rx: 20 }, spine: [18, 0, 0], chest: [10, 0, 0], head: [-26, b * 8, 0],
        shoulderL: [-84, 0, 18], elbowL: [-100, 0, 0], shoulderR: [-84, 0, -18], elbowR: [-100, 0, 0],
        thighL: [-92, 0, 16], kneeL: [124, 0, 0], thighR: [-92, 0, -16], kneeR: [124, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the present, held out at arm's length by a man ready to run
    ms_gift: (t) => {
      const b = Math.sin(t * 9);
      return {
        root: { y: -0.04, rx: 8 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-6, 0, b * 3],
        shoulderL: [-72, 0, 10], elbowL: [-30, 0, 0], shoulderR: [-72, 0, -10], elbowR: [-30, 0, 0],
        thighL: [4, 0, 12], kneeL: [16, 0, 0], thighR: [16, 0, -12], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a hand behind his head and a laugh that is not a laugh
    ms_nervous: (t) => {
      const b = Math.sin(t * 8);
      return {
        root: { y: -0.01 + Math.abs(b) * 0.01 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-8, 0, 8 + b * 3],
        shoulderL: [-24, 0, 62], elbowL: [-100, 0, 0], shoulderR: [-150, 0, -50], elbowR: [-120, 0, 0],
        thighL: [-4, 4, 14], kneeL: [8, 0, 0], thighR: [-4, -4, -14], kneeR: [8, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // shaking out the hand he just punched a mattress of a stomach with
    ms_sore: (t) => {
      const w = Math.sin(t * 28) * 14;
      return {
        root: { y: -0.06, rx: 12 }, spine: [14, 0, 0], chest: [10, -16, 0], head: [16, 10, 0],
        shoulderR: [-40, 0, -24], elbowR: [-70 + w, 0, 0], shoulderL: [-50, 0, 16], elbowL: [-90, 0, 0],
        thighL: [-14, 0, 14], kneeL: [22, 0, 0], thighR: [-6, 0, -14], kneeR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // eating with a friend: one hand to the mouth, the other on his knee
    ms_eat: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: -0.46, rx: -4 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [2 + b * 5, 0, 0],
        shoulderR: [-76, 0, -10], elbowR: [-130, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0],
        thighL: [-84, 0, 30], kneeL: [70, 0, 0], thighR: [-84, 0, -30], kneeR: [70, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // the champion, angry for somebody else for once: pointing straight at them
    ms_point: (t) => {
      const b = Math.sin(t * 5);
      return {
        root: { y: -0.04, rx: 8 }, spine: [8, -10, 0], chest: [6, -14, 0], head: [-6, 12, 0],
        shoulderR: [-90 + b * 3, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-90, 0, 0],
        thighL: [-24, 0, 12], kneeL: [26, 0, 0], thighR: [14, 0, -12], kneeR: [10, 0, 0],
        hands: ['fist', 'point'],
      };
    },
    // kneeling on the ground with the dog in his arms, looking up at what his friend became
    ms_kneelHold: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.42 + b * 0.004, rx: 6 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [-18, 0, 0],
        shoulderL: [-44, 0, 8], elbowL: [-104, 0, 0], shoulderR: [-44, 0, -8], elbowR: [-104, 0, 0],
        thighL: [-86, 0, 12], kneeL: [118, 0, 0], thighR: [4, 0, -12], kneeR: [96, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // a junior-division child's guard: all elbows
    jk_idle: (t) => {
      const b = Math.sin(t * 3.4);
      return {
        root: { y: -0.02 + b * 0.012 },
        hips: [0, -6, 0], spine: [6, 0, 0], chest: [4, 6, 0], head: [-4, -6, 0],
        shoulderL: [-50, 0, 24], elbowL: [-100, 0, 0], shoulderR: [-48, 0, -24], elbowR: [-104, 0, 0],
        thighL: [-16, 6, 12], kneeL: [22 + b * 3, 0, 0], thighR: [10, -6, -12], kneeR: [18 + b * 3, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
  };

  SL.data.characters.mr_satan = {
    id: 'mr_satan',
    assetLevel: 1,
    name: 'Mr. Satan',
    fullName: 'Mr. Satan, World Champion',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Showman',
    blurb: 'The World Champion. The man who defeated Cell. Ask him — he will tell you.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 2 },
    stats: { hp: 5200, ki: 30, stamina: 120, speed: 0.92, power: 0.5, defense: 0.8, weight: 1.2, kiRegen: 0.6, chargeRate: 8, canonPower: 0.03 },
    appearance: {
      height: 1.06,
      skin: 0xd8a47a,
      build: { chestW: 0.26, chestD: 0.19, shoulderX: 0.26, waistW: 0.2, upperArmR: 0.07, foreArmR: 0.06, fist: 0.064, thighR: 0.104, shinR: 0.08, headR: 0.15, neckLen: 0.05 },
      hair: { style: 'satan', color: 0x141418 },
      // the moustache and the sideburns (2026-10-16, the owner's collage: the moustache is a thick bar under the nose,
      // each half running out and down — Gokule's construction; its halves stood on end as two black ovals over the eyes)
      headExtras: [
        { shape: 'ball', a: [0.2, -0.34, 0.93], d: [1, -0.28, 0.1], l: 0.05, r: 0.022, flat: 0.75, depth: 1.02, color: 0x141418, outline: 0.4 },
        { shape: 'ball', a: [-0.2, -0.34, 0.93], d: [-1, -0.28, 0.1], l: 0.05, r: 0.022, flat: 0.75, depth: 1.02, color: 0x141418, outline: 0.4 },
        { shape: 'ball', a: [0.92, -0.2, 0.3], d: [0, -1, 0], l: 0.05, r: 0.03, flat: 0.5, depth: 1.0, color: 0x141418, outline: 0.3 },
        { shape: 'ball', a: [-0.92, -0.2, 0.3], d: [0, -1, 0], l: 0.05, r: 0.03, flat: 0.5, depth: 1.0, color: 0x141418, outline: 0.3 },
      ],
      face: { pupil: 0x141414, eyeW: 0.95, browThick: 1.3 },
      outfit: {
        topStyle: 'gi', top: 0xf2f0ea, sleeves: 'none', arms: 0xd8a47a, wrist: 0xe0b83a,
        belt: 0xe0b83a, pants: 0xf2f0ea, pantsStyle: 'gi', boots: 0x2a2a30, bootStyle: 'gi',
        cape: 0xc82a2a,
      },
      portraitColor: '#c82a2a',
    },
    vfx: { ghost: 0xffe0c0 },
    audio: { strikePitch: 0.92, heavyPitch: 0.85 },
    flight: false, // he says he could if he wanted to
    forms: [{ id: 'base', name: 'Champion', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: poses.ms_idle }, poses),
    moves: {
      light: [
        { id: 'msJab', startup: 7, active: 3, recovery: 14, cancel: 9, damage: 160, reach: 1.2, radius: 0.72, lunge: 10, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'ms_punchW', strike: 'ms_punch' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'msChop', startup: 8, active: 3, recovery: 15, cancel: 10, damage: 180, reach: 1.2, radius: 0.74, lunge: 10, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'ms_punchW', strike: 'ms_punch' }, sfx: 'punchLight', hitPose: 'hitSideR' },
      ],
      heavy: {
        0: { id: 'msMegaton', startup: 18, active: 4, recovery: 26, damage: 420, reach: 1.3, radius: 0.9, lunge: 12, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'ms_punchW', strike: 'ms_punch' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'msCharge', startup: 12, active: 5, recovery: 22, damage: 260, reach: 1.3, radius: 0.85, lunge: 20, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'ms_punchW', strike: 'ms_punch' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
    },
    specials: {
      // announced, wound up, and thrown with everything he has — which is not much
      special1: {
        id: 'msDynamite', name: 'Dynamite Kick', type: 'rush', kiCost: 10, icon: 'rush',
        startup: 22, dashFrames: 16, speed: 30, recovery: 30,
        poses: { wind: 'ms_kickW' },
        hits: [{ pose: 'ms_kick', damage: 520, frames: 18, sfx: 'punchHeavy', knock: 'push', knockSpeed: 14, impact: 2 }],
      },
    },
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.55, defense: 0.35, ranged: 0, beam: 0, transformHp: 0, preferredRange: 2.2 },
    intro: { pose: 'ms_flex', expression: 'grin' },
    victory: { poses: ['ms_peace', 'ms_flex'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  const junior = (id, name, blurb, tint) => ({
    id,
    assetLevel: 1,
    name,
    fullName: name + ' (Junior Division)',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Junior Division',
    blurb,
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 1800, ki: 20, stamina: 80, speed: 0.9, power: 0.3, defense: 0.6, weight: 0.9, kiRegen: 0.5, chargeRate: 6, canonPower: 0.002 },
    appearance: {
      height: 0.72,
      skin: 0xe8c49a,
      build: { chestW: 0.19, chestD: 0.14, shoulderX: 0.19, waistW: 0.16, upperArmR: 0.052, foreArmR: 0.045, fist: 0.05, thighR: 0.085, shinR: 0.066, headR: 0.14, neckLen: 0.042 },
      hair: { style: 'cropped', color: 0x2a2018 },
      face: { pupil: 0x141414, eyeW: 1.05 },
      outfit: { topStyle: 'gi', top: tint, sleeves: 'short', sleeveColor: tint, wrist: 0xe8e4dc, belt: 0x2a2a30, pants: tint, pantsStyle: 'gi', boots: 0x3a3a40, bootStyle: 'gi' },
      portraitColor: '#' + tint.toString(16).padStart(6, '0'),
    },
    vfx: { ghost: 0xe0e0e0 },
    audio: { strikePitch: 1.25, heavyPitch: 1.15 },
    flight: false,
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: poses.jk_idle }, poses),
    moves: {
      light: [
        { id: id + 'Jab', startup: 7, active: 3, recovery: 14, cancel: 9, damage: 60, reach: 1, radius: 0.66, lunge: 8, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: id + 'Kick', startup: 14, active: 4, recovery: 22, damage: 140, reach: 1.2, radius: 0.8, lunge: 9, hitstun: 20, knock: 'push', knockSpeed: 8, impact: 1, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchLight', hitPose: 'hitBody' },
      },
      dash: { id: id + 'Rush', startup: 10, active: 4, recovery: 20, damage: 80, reach: 1.1, radius: 0.75, lunge: 14, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.5, defense: 0.3, ranged: 0, beam: 0, transformHp: 0, preferredRange: 2 },
    intro: { pose: 'jk_idle', expression: 'angry' },
    victory: { poses: ['jk_idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  });

  SL.data.characters.idasa = junior('idasa', 'Idasa', 'Twelve years old, twice Trunks\' size, and about to find out it does not matter.', 0x6a8a3a);
  SL.data.characters.ikose = junior('ikose', 'Ikose', 'Brave enough to enter. Not quite ready for who he drew.', 0x8a5a3a);
})();
