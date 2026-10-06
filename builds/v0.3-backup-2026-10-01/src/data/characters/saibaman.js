/*
 * SAIBAMAN — Saiyan-grown plant soldiers (Saiyan Saga). ENEMY TYPE, not playable.
 * Identity: small, fast, hunched and cackling. They hunt in packs, surround
 * a target, spit acid, tunnel underground and — their signature — leap onto an
 * opponent's back and self-destruct unless shaken off in time.
 * Movement: they cannot fly; they run, jump and leap.
 * Mechanic PACK HUNTER: stronger with packmates nearby; when one falls the
 * rest go into a short frenzy.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const GREEN = 0x4e9634;
  const DARK = 0x2d5e1e;

  const poses = {
    // hunched, weight forward, claws loose, head bobbing
    idle: (t) => {
      const b = Math.sin(t * 5.5), s = Math.sin(t * 2.3);
      return {
        root: { y: -0.12 + b * 0.012, rx: 14 },
        hips: [0, -10, 0], spine: [26, 0, 0], chest: [18, s * 6, 0], neck: [-26, 0, 0], head: [-20, s * 14, s * 6],
        shoulderL: [-30, 0, 34], elbowL: [-64, 0, 0], shoulderR: [-26, 0, -34], elbowR: [-70, 0, 0],
        thighL: [-38, 16, 16], kneeL: [64 + b * 4, 0, 0], footL: [-18, 0, 0],
        thighR: [-26, -16, -16], kneeR: [58 + b * 4, 0, 0], footR: [-20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 15 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        root: { y: -0.1 + Math.abs(c) * 0.07, rx: 34 },
        spine: [18, s * 8, 0], chest: [8, s * 10, 0], neck: [-24, 0, 0], head: [-20, -s * 8, 0],
        shoulderL: [40 + s * 30, 0, 40], elbowL: [-40, 0, 0], shoulderR: [40 - s * 30, 0, -40], elbowR: [-40, 0, 0],
        thighL: [-s * 60 - 24, 0, 8], kneeL: [50 + Math.max(0, s) * 80, 0, 0], footL: [16, 0, 0],
        thighR: [s * 60 - 24, 0, -8], kneeR: [50 + Math.max(0, -s) * 80, 0, 0], footR: [16, 0, 0],
        hands: ['open', 'open'],
      };
    },
    sb_crouch: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        root: { y: -0.32 + s * 0.004, rx: 30 }, spine: [24, 0, 0], chest: [14, 0, 0], neck: [-34, 0, 0], head: [-26, 0, 0],
        shoulderL: [30, 0, 50], elbowL: [-30, 0, 0], shoulderR: [30, 0, -50], elbowR: [-30, 0, 0],
        thighL: [-86, 22, 18], kneeL: [130, 0, 0], footL: [-30, 0, 0], thighR: [-80, -22, -18], kneeR: [126, 0, 0], footR: [-30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    sb_leap: {
      root: { rx: 50 }, spine: [-10, 0, 0], chest: [-8, 0, 0], neck: [-30, 0, 0], head: [-30, 0, 0],
      shoulderL: [-160, 0, 40], elbowL: [-20, 0, 0], shoulderR: [-160, 0, -40], elbowR: [-20, 0, 0],
      thighL: [10, 0, 20], kneeL: [40, 0, 0], footL: [40, 0, 0], thighR: [20, 0, -20], kneeR: [50, 0, 0], footR: [40, 0, 0],
      hands: ['open', 'open'],
    },
    // wrapped around the victim's back, face pressed in, legs locked
    sb_cling: (t) => {
      const s = Math.sin(t * 30);
      return {
        root: { y: 0, rx: 28 + s * 3 }, spine: [16, 0, 0], chest: [14, 0, 0], neck: [-30, 0, 0], head: [-16, s * 8, 0],
        shoulderL: [-120, 0, -34], elbowL: [-96, 0, 0], shoulderR: [-120, 0, 34], elbowR: [-96, 0, 0],
        thighL: [-96, 40, 46], kneeL: [124, 0, 0], thighR: [-96, -40, -46], kneeR: [124, 0, 0],
        hands: ['open', 'open'],
      };
    },
    sb_dig: (t) => {
      const s = Math.sin(t * 36);
      return {
        root: { y: -0.36, rx: 60 }, spine: [30, 0, 0], chest: [20, 0, 0], neck: [-20, 0, 0], head: [-10, 0, 0],
        shoulderL: [-40 + s * 50, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-40 - s * 50, 0, -20], elbowR: [-40, 0, 0],
        thighL: [-90, 20, 14], kneeL: [120, 0, 0], thighR: [-90, -20, -14], kneeR: [120, 0, 0],
        hands: ['open', 'open'],
      };
    },
    sb_erupt: {
      root: { rx: -10 }, spine: [-12, 0, 0], chest: [-10, 0, 0], head: [-30, 0, 0],
      shoulderL: [-170, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-10, 0, 0],
      thighL: [0, 0, 10], kneeL: [10, 0, 0], footL: [40, 0, 0], thighR: [10, 0, -10], kneeR: [20, 0, 0], footR: [40, 0, 0],
      hands: ['open', 'open'],
    },
    sb_clawW: { ...C.punchWindR, root: { y: -0.1, rx: 20 }, hands: ['open', 'open'] },
    sb_claw: { ...C.punchR, root: { y: -0.12, rx: 26 }, shoulderR: [-80, 30, 10], hands: ['open', 'open'] },
    sb_clawLW: { ...C.punchWindL, root: { y: -0.1, rx: 20 }, hands: ['open', 'open'] },
    sb_clawL: { ...C.punchL, root: { y: -0.12, rx: 26 }, shoulderL: [-80, -30, -10], hands: ['open', 'open'] },
    sb_biteW: { root: { y: -0.2, rx: 30 }, spine: [20, 0, 0], neck: [-40, 0, 0], head: [-30, 0, 0], shoulderL: [20, 0, 50], shoulderR: [20, 0, -50], thighL: [-60, 10, 10], kneeL: [90, 0, 0], thighR: [-40, -10, -10], kneeR: [70, 0, 0], hands: ['open', 'open'] },
    sb_bite: { root: { y: -0.08, rx: 44 }, spine: [10, 0, 0], neck: [-10, 0, 0], head: [10, 0, 0], shoulderL: [-90, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-90, 0, -30], elbowR: [-30, 0, 0], thighL: [-20, 10, 10], kneeL: [30, 0, 0], thighR: [20, -10, -10], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    sb_spit: { root: { y: -0.1, rx: 10 }, spine: [-6, 0, 0], neck: [-20, 0, 0], head: [-26, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-60, 0, 0], thighL: [-30, 10, 14], kneeL: [50, 0, 0], thighR: [-10, -10, -14], kneeR: [40, 0, 0], hands: ['open', 'open'] },
    sb_cackle: (t) => {
      const s = Math.sin(t * 22);
      return { ...C.idle, root: { y: -0.1 + Math.abs(s) * 0.02, rx: 10 }, spine: [10, 0, 0], neck: [-10, 0, 0], head: [-30 + s * 8, 0, 0], shoulderL: [-40, 0, 40 + s * 8], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -40 - s * 8], elbowR: [-90, 0, 0], hands: ['open', 'open'] };
    },
  };

  SL.data.characters.saibaman = {
    id: 'saibaman',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Saibaman',
    era: 'Saiyan Saga',
    playable: false,
    enemyType: true,
    flight: false,
    style: 'Pack Hunter',
    blurb: 'Grown from seeds in the Earth. Individually weak, together deadly — and they do not care if they survive.',
    ratings: { power: 2, speed: 3, ki: 1, defense: 1 },
    stats: { hp: 3800, ki: 60, stamina: 70, speed: 1.08, power: 0.62, defense: 0.75, weight: 0.55, kiRegen: 3, chargeRate: 20, canonPower: 0.35 },
    appearance: {
      height: 0.78,
      skin: GREEN,
      build: { chestW: 0.17, chestD: 0.15, waistW: 0.11, waistD: 0.11, pelvisW: 0.13, shoulderX: 0.17, upperArmR: 0.04, foreArmR: 0.038, upperArmLen: 0.3, foreArmLen: 0.29, thighR: 0.06, shinR: 0.048, thighLen: 0.36, shinLen: 0.34, headR: 0.19, neckLen: 0.05 },
      headExtras: [
        // bulbous, brain-like cranium with darker veins
        { shape: 'ball', a: [0.35, 0.8, -0.1], d: [0.3, 1, 0], l: 0.1, r: 0.085, color: GREEN, depth: 0.72, flat: 1, outline: 0.6 },
        { shape: 'ball', a: [-0.35, 0.8, -0.1], d: [-0.3, 1, 0], l: 0.1, r: 0.085, color: GREEN, depth: 0.72, flat: 1, outline: 0.6 },
        { shape: 'ball', a: [0, 0.6, -0.7], d: [0, 0.6, -1], l: 0.1, r: 0.09, color: GREEN, depth: 0.72, flat: 1, outline: 0.6 },
        // raised ridges running back over the skull
        { shape: 'ball', a: [0, 1, 0.35], d: [0, 0.35, -1], l: 0.1, r: 0.022, color: DARK, depth: 0.97, flat: 0.6, outline: 0 },
        { shape: 'ball', a: [0.45, 0.85, 0.3], d: [0.2, 0.4, -1], l: 0.09, r: 0.018, color: DARK, depth: 0.97, flat: 0.6, outline: 0 },
        { shape: 'ball', a: [-0.45, 0.85, 0.3], d: [-0.2, 0.4, -1], l: 0.09, r: 0.018, color: DARK, depth: 0.97, flat: 0.6, outline: 0 },
      ],
      face: { noEars: true, sclera: 0xe0301c, pupil: 0x3a0000, brow: DARK, browThick: 1.6, eyeW: 1.35, eyeX: 0.05, lash: 0x10200a },
      outfit: { topStyle: 'bare', top: GREEN, pecs: DARK, pants: GREEN, pantsStyle: 'tight', boots: GREEN, bootStyle: 'gi', legs: GREEN },
      portraitColor: '#5fae3c',
    },
    vfx: { ghost: 0xc8ffa0 },
    audio: { strikePitch: 1.5, heavyPitch: 1.35 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc8ff8a, core: 0xffffff, particles: 0xa8ff6a }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'clawSwipe', startup: 6, active: 3, recovery: 12, cancel: 8, damage: 200, reach: 1.1, radius: 0.7, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'sb_clawW', strike: 'sb_claw' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'clawBackhand', startup: 6, active: 3, recovery: 13, cancel: 8, damage: 210, reach: 1.1, radius: 0.7, lunge: 10, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'sb_clawLW', strike: 'sb_clawL' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'bite', startup: 8, active: 4, recovery: 18, cancel: 12, damage: 300, reach: 1.0, radius: 0.75, lunge: 14, hitstun: 24, knock: 'push', knockSpeed: 6, impact: 1, pose: { wind: 'sb_biteW', strike: 'sb_bite' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'headbuttLunge', startup: 13, active: 5, recovery: 24, damage: 480, reach: 1.1, radius: 0.85, lunge: 22, hitstun: 30, knock: 'heavy', knockSpeed: 16, impact: 2, pose: { wind: 'sb_biteW', strike: 'sb_bite' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        2: { id: 'risingClaw', startup: 10, active: 5, recovery: 22, damage: 420, reach: 1.1, radius: 0.85, lunge: 12, hitstun: 32, knock: 'launch', knockSpeed: 15, impact: 2, pose: { wind: 'sb_crouch', strike: 'sb_erupt' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      },
      dash: { id: 'pounce', startup: 7, active: 9, recovery: 20, damage: 380, reach: 1.1, radius: 0.9, lunge: 28, hitstun: 26, knock: 'push', knockSpeed: 10, impact: 1, pose: { wind: 'sb_crouch', strike: 'sb_leap' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'saibaToss', name: 'Claw Toss', damage: 520, knockSpeed: 18, poses: ['grab', 'sb_clawW', 'sb_claw'] },
    },
    // acid spit replaces the ki blast
    blast: { color: 0xa8ff3a, core: 0xf0ffd0, damage: 140, speed: 46, radius: 0.3, sfxPitch: 1.6, pose: 'sb_spit', fromMouth: true, sfx: 'acidSpit' },
    specials: {
      special1: {
        id: 'burrow', name: 'Burrow Ambush', type: 'burrow', kiCost: 20, icon: 'down', cooldown: 240,
        digFrames: 16, maxFrames: 150, speed: 16, warnFrames: 18, riseSpeed: 11, radius: 1.5, damage: 560, knockSpeed: 16, recovery: 26,
        poses: { dig: 'sb_dig', erupt: 'sb_erupt' },
      },
      special2: {
        id: 'selfDestruct', name: 'Self-Destruct Latch', type: 'latch', kiCost: 30, icon: 'ultimate', cooldown: 300,
        range: 13, crouch: 16, leapSpeed: 22, grabDamage: 80, fuse: 150, blastDamage: 6000, blastRadius: 5,
        mashGain: 0.085, holdGain: 0.75, escapeDecay: 0.0035, cpuEscape: 0.0085,
        poses: { crouch: 'sb_crouch', leap: 'sb_leap', cling: 'sb_cling' },
      },
    },
    mechanic: { type: 'packHunter', name: 'Pack Hunter', desc: 'Stronger with packmates nearby. When one falls, the others frenzy.' },
    ai: { personality: 'berserker', aggression: 0.78, defense: 0.25, ranged: 0.45, beam: 0, transformHp: 0, preferredRange: 4, hooks: 'saibaman' },
    barks: {},
    intro: { pose: 'sb_cackle', expression: 'grin' },
    victory: { poses: ['sb_cackle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
