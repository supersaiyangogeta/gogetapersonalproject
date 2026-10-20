/*
 * FUSION REBORN CAST (Movie — not canon). Everybody the film needs that the game did not have yet.
 *
 *   pikkon        PIKKON, the Other World Tournament's champion from the West: green, tall, the white
 *                 weighted cape. PLAYABLE (unlocks after the movie's "Janemba"): fast kicks, the
 *                 Hurricane Kick, Light Grenade, Thunder Flash Attack.
 *   king_yemma    KING YEMMA at his desk in the Check-In Station: a giant, seated. Story only.
 *   veku          VEKU, the failed Fusion Dance (one finger bent): short, round, pale, wheezing, in a
 *                 Metamoran vest two sizes too small. Played in the movie's survival section: slow,
 *                 nearly harmless, and a `blimp` body — a dodge is a big unpredictable bounce, a fast
 *                 landing can trip him, one Panic Puff (sparingly).
 *   dictator      THE DICTATOR, back from the dead with an army of tanks: short, loud, a broom of a
 *                 moustache. Story only (a target at the end, never a fighter worth the name).
 *   dead_soldier  his infantry, out of the grave with rifles. Grunts.
 *   south_kai / west_kai / east_kai / grand_kai — the spectators (cinematic only, King Kai's frame).
 *
 * Built from memory and the owner's written notes: NO reference images reached this session for any
 * of them — check every design against references before calling it more than a Level 1 prototype.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const M = (p) => SL.Anim.mirror(p);

  /* ======================================================================== PIKKON */
  const GREEN = 0x5ea84e, GREEN2 = 0x3e7a34, CAPE = 0xf0eee6, SHIRT = 0x5a2a5a, PANTS = 0xf2f0e8;
  const pk = {
    pk_idle: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: -0.06 + b * 0.008 }, hips: [0, -24, 0], spine: [4, 12, 0], chest: [2, 14, 0], head: [-4, -16, 0],
        shoulderL: [-58, 0, 22], elbowL: [-92, 0, 0], shoulderR: [-36, 0, -26], elbowR: [-110, 0, 0],
        thighL: [-24, 18, 14], kneeL: [30 + b * 3, 0, 0], thighR: [14, -16, -14], kneeR: [26 + b * 3, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    // the cape on, arms folded under it: the champion waiting
    pk_folded: (t) => ({ ...C.armsCrossed, root: { y: Math.sin(t * 1.6) * 0.004 }, head: [-4, Math.sin(t * 0.6) * 6, 0] }),
    // studying the barrier: one hand flat on it, head on one side
    pk_study: (t) => {
      const b = Math.sin(t * 1.4);
      return { root: { y: -0.02 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [6, b * 10, 8], shoulderR: [-90, 0, -6], elbowR: [-10, 0, 0], handR: [-60, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-100, 0, 0], thighL: [-14, 0, 10], kneeL: [16, 0, 0], thighR: [6, 0, -10], kneeR: [10, 0, 0], hands: ['fist', 'open'] };
    },
    pk_point: { root: { y: 0 }, chest: [-4, 10, 0], head: [-6, -10, 0], shoulderR: [-100, 0, -10], elbowR: [-6, 0, 0], shoulderL: [-14, 0, 20], elbowL: [-40, 0, 0], thighL: [-6, 4, 10], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [8, 0, 0], hands: ['fist', 'point'] },
    pk_jabW: { ...C.punchWindL, hands: ['fist', 'fist'] },
    pk_jab: { ...C.punchL, hands: ['fist', 'fist'] },
    pk_elbowW: { root: { y: -0.06 }, hips: [0, 14, 0], spine: [4, -16, 0], chest: [2, -22, 0], head: [-6, 16, 0], shoulderR: [-60, 0, -30], elbowR: [-140, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-90, 0, 0], thighL: [-26, 10, 14], kneeL: [30, 0, 0], thighR: [14, -10, -14], kneeR: [22, 0, 0], hands: ['fist', 'fist'] },
    pk_elbow: { root: { y: -0.08, rx: 8 }, hips: [0, -20, 0], spine: [8, 24, 0], chest: [6, 32, 0], head: [-6, -24, 0], shoulderR: [-90, 0, -40], elbowR: [-140, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-90, 0, 0], thighL: [-34, 10, 14], kneeL: [40, 0, 0], thighR: [18, -10, -14], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
    pk_kickW: { ...C.kickWindR },
    pk_kick: { ...C.kickR },
    // HURRICANE KICK: spinning on one leg, the other out like a blade
    pk_spinW: { root: { y: -0.1, ry: -30 }, spine: [6, -20, 0], chest: [4, -24, 0], head: [-6, 20, 0], shoulderL: [-40, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -60], elbowR: [-40, 0, 0], thighR: [-50, 0, -30], kneeR: [90, 0, 0], thighL: [-14, 0, 10], kneeL: [30, 0, 0], hands: ['fist', 'fist'] },
    pk_spin: (t) => ({ root: { y: 0.04, ry: (t * 1400) % 360, rz: 10 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-8, 0, 0], shoulderL: [-20, 0, 80], elbowL: [-10, 0, 0], shoulderR: [-20, 0, -80], elbowR: [-10, 0, 0], thighR: [-90, 0, -50], kneeR: [4, 0, 0], thighL: [-6, 0, 8], kneeL: [10, 0, 0], hands: ['fist', 'fist'] }),
    pk_thunderW: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return { root: { y: -0.14 }, hips: [0, -30, 0], spine: [4, 26, 0], chest: [2, 30, 0], head: [-8, -30, 0], shoulderL: [30, 0, 30 + s], elbowL: [-110, 0, 0], shoulderR: [20, 0, -20 - s], elbowR: [-120, 0, 0], thighL: [-34, 20, 22], kneeL: [48, 0, 0], thighR: [16, -20, -20], kneeR: [32, 0, 0], hands: ['open', 'open'] };
    },
    pk_thunder: { root: { y: -0.12, rx: 8 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-6, 0, 0], shoulderL: [-88, -14, 6], elbowL: [-4, 0, 0], handL: [-70, 0, 0], shoulderR: [-88, 14, -6], elbowR: [-4, 0, 0], handR: [-70, 0, 0], thighL: [-40, 10, 18], kneeL: [46, 0, 0], thighR: [20, -10, -18], kneeR: [22, 0, 0], hands: ['open', 'open'] },
    // knocked flat by a child's backhand, and up again on an elbow
    pk_down: { root: { y: -0.78, rx: -84 }, spine: [-4, 0, 0], head: [20, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-60, 0, -30], elbowR: [-80, 0, 0], thighL: [-10, 0, 10], kneeL: [30, 0, 0], thighR: [-30, 0, -10], kneeR: [60, 0, 0], hands: ['open', 'fist'] },
  };
  SL.data.characters.pikkon = {
    id: 'pikkon', assetLevel: 1, name: 'Pikkon', fullName: 'Pikkon (West Galaxy, the Other World Tournament)', era: 'Movie',
    playable: true, prototype: true, style: 'Weighted Champion',
    blurb: 'The West Galaxy\'s champion, dead and still training. He fights in weighted clothes because otherwise it would not be fair — and he is the only one in the Other World Goku could not finish.',
    ratings: { power: 4, speed: 5, ki: 3, defense: 4 },
    stats: { hp: 16000, ki: 120, stamina: 150, speed: 1.24, power: 1.12, defense: 1.08, weight: 1.0, kiRegen: 3, chargeRate: 34, canonPower: 4 },
    appearance: {
      height: 1.08, skin: GREEN,
      build: { chestW: 0.205, chestD: 0.14, shoulderX: 0.21, waistW: 0.13, pelvisW: 0.14, upperArmR: 0.055, foreArmR: 0.05, fist: 0.055, thighR: 0.085, shinR: 0.064, headR: 0.13, neckLen: 0.06 },
      hair: { style: 'bald', color: GREEN },
      headExtras: [
        // the tall crest of his skull, sweeping back, and the ridges either side of it
        { shape: 'ball', a: [0, 1, -0.3], d: [0, 0.8, -0.6], l: 0.12, r: 0.1, color: GREEN, depth: 0.78, flat: 0.8, outline: 0.8 },
        { shape: 'line', a: [0.3, 0.9, 0.3], d: [0.2, -0.2, -1], l: 0.2, r: 0.012, color: GREEN2, depth: 1.01 },
        { shape: 'line', a: [-0.3, 0.9, 0.3], d: [-0.2, -0.2, -1], l: 0.2, r: 0.012, color: GREEN2, depth: 1.01 },
        // pointed ears
        { a: [0.96, 0.15, 0], d: [1, 0.5, -0.2], l: 0.08, r: 0.03, color: GREEN, depth: 0.98, outline: 0.6 },
        { a: [-0.96, 0.15, 0], d: [-1, 0.5, -0.2], l: 0.08, r: 0.03, color: GREEN, depth: 0.98, outline: 0.6 },
      ],
      face: { noEars: true, pupil: 0x1a1414, eyeW: 0.92, browThick: 1.2, brow: GREEN2 },
      outfit: {
        topStyle: 'gi', top: SHIRT, sleeves: 'none', sleeveColor: SHIRT, arms: GREEN,
        belt: 0x2a2a30, pants: PANTS, pantsStyle: 'gi', boots: 0x2a2a30, bootStyle: 'gi',
        wrist: 0x2a2a30, cape: CAPE,
        // (2026-10-16, the board p.227: the white hood wound round his head under its dark crown — he was bare-headed)
        turban: 0x3a1c16, turbanBand: 0xf2f0ea,
      },
      portraitColor: '#5ea84e',
    },
    vfx: { ghost: 0xd8ffd0, trail: 0xc8ffb8 },
    audio: { strikePitch: 1.02, heavyPitch: 0.94 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xe8fff0, core: 0xffffff, particles: 0xc8ffd8, speed: 1.2 }, mult: {} }],
    poses: Object.assign({ idle: pk.pk_idle }, pk),
    moves: {
      light: [
        { id: 'pkJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 420, reach: 1.1, radius: 0.7, lunge: 14, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'pk_jabW', strike: 'pk_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'pkElbow', startup: 3, active: 3, recovery: 10, cancel: 5, damage: 460, reach: 1.0, radius: 0.72, lunge: 13, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'pk_elbowW', strike: 'pk_elbow' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'pkKick', startup: 4, active: 4, recovery: 12, cancel: 7, damage: 600, reach: 1.35, radius: 0.8, lunge: 14, hitstun: 22, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'pk_kickW', strike: 'pk_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'pkSpinKick', startup: 10, active: 6, recovery: 18, damage: 1500, reach: 1.45, radius: 1.1, lunge: 16, hitstun: 32, knock: 'heavy', knockSpeed: 28, impact: 3, guardCrush: true, guardDamage: 40, pose: { wind: 'pk_spinW', strike: 'pk_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'pkLaunch', startup: 8, active: 4, recovery: 16, damage: 1000, reach: 1.2, radius: 0.9, lunge: 12, hitstun: 30, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'pkDashKick', startup: 4, active: 8, recovery: 14, damage: 1000, reach: 1.3, radius: 0.9, lunge: 34, hitstun: 26, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'pk_kickW', strike: 'pk_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'pkToss', name: 'Champion\'s Throw', damage: 900, knockSpeed: 24, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'pkGrenade', name: 'Light Grenade', type: 'projectile', kiCost: 26, icon: 'ball',
        startup: 18, recovery: 24, pose: { wind: 'pk_thunderW', release: 'pk_thunder' },
        projectile: { kind: 'ball', speed: 38, radius: 0.6, damage: 1300, color: 0xd8ffe0, core: 0xffffff, explode: 4, knock: 'heavy', knockSpeed: 22, impact: 3, life: 6, mine: { after: 16, trigger: 3, life: 280 } },
      },
      special2: {
        id: 'pkHurricane', name: 'Hurricane Kick', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 8, dashFrames: 18, speed: 62, recovery: 22,
        poses: { wind: 'pk_spinW', dash: 'pk_spin' },
        hits: [
          { pose: 'pk_spin', damage: 420, frames: 6, sfx: 'punchLight' },
          { pose: 'pk_spin', damage: 420, frames: 6, sfx: 'punchLight' },
          { pose: 'pk_spin', damage: 420, frames: 6, sfx: 'punchLight' },
          { pose: 'pk_kick', damage: 1400, frames: 18, knock: 'heavy', knockSpeed: 30, impact: 3, sfx: 'punchHeavy' },
        ],
      },
      ultimate: {
        id: 'pkThunder', name: 'Thunder Flash Attack', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [8200, 8200], radius: [1.6, 1.6], speed: 120, range: 170, sustain: 50,
        color: 0xb8ffd8, core: 0xffffff, poses: { charge: 'pk_thunderW', fire: 'pk_thunder' }, recovery: 40, cinematic: true,
        callout: ['THUNDER FLASH', 'ATTACK!'], chargeLight: 0xd8ffe8,
      },
    },
    mechanic: { type: 'battleHardened', name: 'Weighted Training', desc: 'Every exchange he survives sharpens him.' },
    ai: { personality: 'martial', aggression: 0.75, defense: 0.7, ranged: 0.3, beam: 0.3, transformHp: 0, preferredRange: 2.3 },
    barks: {},
    intro: { pose: 'pk_folded', expression: 'calm' },
    victory: { poses: ['pk_folded'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ======================================================================== KING YEMMA */
  const OGRE_RED = 0xd8503a, SUIT = 0x2a2e4a, BEARD = 0x1a1414;
  SL.data.characters.king_yemma = {
    id: 'king_yemma', assetLevel: 1, name: 'King Yemma', fullName: 'King Yemma (the Check-In Station)', era: 'Movie',
    playable: false, cinematicOnly: true, prototype: true, style: 'Judge of the Dead',
    stats: { hp: 99999, ki: 100, stamina: 100, speed: 0.5, power: 1, defense: 1, weight: 4, kiRegen: 1, chargeRate: 10, canonPower: 3 },
    flight: false,
    appearance: {
      height: 3.0, skin: OGRE_RED,
      build: { chestW: 0.26, chestD: 0.22, shoulderX: 0.26, waistW: 0.24, waistD: 0.22, pelvisW: 0.2, upperArmR: 0.07, foreArmR: 0.064, fist: 0.07, thighR: 0.1, shinR: 0.08, headR: 0.15, neckLen: 0.03 },
      hair: { style: 'cropped', color: BEARD },
      headExtras: [
        { a: [0.4, 0.86, 0.3], d: [0.2, 1, 0.1], l: 0.06, r: 0.026, color: 0xf2e6c8, depth: 1.0 },
        { a: [-0.4, 0.86, 0.3], d: [-0.2, 1, 0.1], l: 0.06, r: 0.026, color: 0xf2e6c8, depth: 1.0 },
        // the black beard round the jaw, and the judge's hat
        { shape: 'ball', a: [0, -0.7, 0.55], d: [0, -1, 0.3], l: 0.08, r: 0.14, color: BEARD, depth: 0.82, flat: 0.8, outline: 0.6 },
        { shape: 'ball', a: [0, 1, -0.05], d: [0, 1, 0], l: 0.08, r: 0.135, color: SUIT, depth: 0.82, flat: 1, outline: 0.8 },
      ],
      face: { pupil: 0x101010, eyeW: 1.0, browThick: 1.6, brow: BEARD },
      outfit: {
        topStyle: 'gi', top: SUIT, sleeves: 'long', sleeveColor: SUIT, belt: 0x1a1a22,
        pants: SUIT, pantsStyle: 'gi', boots: 0x1a1a22, bootStyle: 'gi',
        emblem: { text: '閻魔', fg: '#f2e6c8', bg: '#2a2e4a', center: 0.08, frontOnly: true },
      },
      portraitColor: '#d8503a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: {
      // sat at his desk: forearms on it, leaning forward
      idle: (t) => ({ root: { y: -0.46 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [4, Math.sin(t * 0.6) * 6, 0], shoulderL: [-60, 0, 20], elbowL: [-70, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-70, 0, 0], thighL: [-88, 0, 14], kneeL: [90, 0, 0], thighR: [-88, 0, -14], kneeR: [90, 0, 0], hands: ['open', 'open'] }),
      ye_worry: (t) => ({ root: { y: -0.46 }, spine: [14, 0, 0], chest: [10, 0, 0], head: [14, Math.sin(t * 3) * 8, 0], shoulderL: [-150, 0, 40], elbowL: [-120, 0, 0], shoulderR: [-150, 0, -40], elbowR: [-120, 0, 0], thighL: [-88, 0, 14], kneeL: [90, 0, 0], thighR: [-88, 0, -14], kneeR: [90, 0, 0], hands: ['open', 'open'] }),
      ye_bang: { root: { y: -0.44 }, spine: [16, 0, 0], chest: [12, 0, 0], head: [-6, 0, 0], shoulderR: [-70, 0, -10], elbowR: [-20, 0, 0], shoulderL: [-60, 0, 20], elbowL: [-70, 0, 0], thighL: [-88, 0, 14], kneeL: [90, 0, 0], thighR: [-88, 0, -14], kneeR: [90, 0, 0], hands: ['open', 'fist'] },
    },
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'idle', expression: 'serious' },
  };

  /* ======================================================================== VEKU */
  // Gogeta's outfit two sizes too small on a body that is mostly belly
  const VSKIN = 0xf8e8d8, VEST = 0x24242c, COLLAR = 0xf08a24, SASH = 0x2c3c9a, WHITE = 0xf2f0ea;
  const vk = {
    // wheezing: shoulders heaving, mouth open, rocking on his heels
    vk_idle: (t) => {
      const b = Math.sin(t * 6), c = Math.sin(t * 1.3);
      return {
        root: { y: -0.04 + Math.abs(b) * 0.012, rz: c * 3 }, spine: [8, 0, c * 2], chest: [4 + b * 3, 0, 0], head: [-14, c * 8, 0],
        shoulderL: [-10 + b * 6, 0, 46], elbowL: [-24, 0, 0], shoulderR: [-10 + b * 6, 0, -46], elbowR: [-24, 0, 0],
        thighL: [-6, 0, 22], kneeL: [14, 0, 0], thighR: [-6, 0, -22], kneeR: [14, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // running: a waddle, arms flapping, belly bouncing
    vk_run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const s = Math.sin(t * 9 * sp);
      return {
        root: { y: -0.03 + Math.abs(s) * 0.05, rz: s * 8, rx: 6 }, spine: [6, s * 10, 0], chest: [4, 0, 0], head: [-16, -s * 10, s * 6],
        shoulderL: [-60 + s * 40, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-60 - s * 40, 0, -70], elbowR: [-30, 0, 0],
        thighL: [-s * 34 - 6, 0, 18], kneeL: [16 + Math.max(0, s) * 40, 0, 0], thighR: [s * 34 - 6, 0, -18], kneeR: [16 + Math.max(0, -s) * 40, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the bounce: tucked into a ball, arms and legs in the air
    vk_bounce: (t) => {
      const s = Math.sin(t * 10);
      return { root: { y: 0.05, rx: 30 + s * 20 }, spine: [20, 0, 0], chest: [10, 0, 0], head: [-20, 0, 0], shoulderL: [-150, 0, 50], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -50], elbowR: [-30, 0, 0], thighL: [-90, 0, 30], kneeL: [60, 0, 0], thighR: [-90, 0, -30], kneeR: [60, 0, 0], hands: ['open', 'open'] };
    },
    // the stumble: arms windmilling, nearly over
    vk_stumble: (t) => {
      const s = Math.sin(t * 18);
      return { root: { y: -0.06, rx: 26, rz: s * 8 }, spine: [20, 0, 0], chest: [10, 0, 0], head: [-26, 0, s * 10], shoulderL: [-160 + s * 50, 0, 50], elbowL: [-20, 0, 0], shoulderR: [-160 - s * 50, 0, -50], elbowR: [-20, 0, 0], thighL: [-40, 0, 20], kneeL: [40, 0, 0], thighR: [10, 0, -20], kneeR: [20, 0, 0], hands: ['open', 'open'] };
    },
    // a punch with everything he has, which is not much
    vk_slapW: { root: { y: -0.04 }, spine: [0, 24, 0], chest: [0, 20, 0], head: [-10, -20, 0], shoulderR: [-60, 0, -90], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-30, 0, 0], thighL: [-8, 0, 22], kneeL: [12, 0, 0], thighR: [-4, 0, -22], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    vk_slap: { root: { y: -0.05 }, spine: [4, -24, 0], chest: [4, -22, 0], head: [-10, 16, 0], shoulderR: [-90, 0, 10], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-30, 0, 0], thighL: [-12, 0, 22], kneeL: [16, 0, 0], thighR: [-2, 0, -22], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    vk_bumpW: { root: { y: -0.03, rx: -14 }, spine: [-16, 0, 0], chest: [-8, 0, 0], head: [6, 0, 0], shoulderL: [30, 0, 50], elbowL: [-20, 0, 0], shoulderR: [30, 0, -50], elbowR: [-20, 0, 0], thighL: [-6, 0, 22], kneeL: [16, 0, 0], thighR: [10, 0, -22], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    vk_bump: { root: { y: 0.02, rx: 16 }, spine: [16, 0, 0], chest: [4, 0, 0], head: [-14, 0, 0], shoulderL: [40, 0, 60], elbowL: [-10, 0, 0], shoulderR: [40, 0, -60], elbowR: [-10, 0, 0], thighL: [-30, 0, 22], kneeL: [26, 0, 0], thighR: [16, 0, -22], kneeR: [8, 0, 0], hands: ['open', 'open'] },
    // the puff: bent over, both hands on his knees, a cloud behind him (kept as a joke, used once in a while)
    vk_puff: { root: { y: -0.08, rx: 24 }, spine: [24, 0, 0], chest: [10, 0, 0], head: [-30, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-20, 0, 0], shoulderR: [-50, 0, -30], elbowR: [-20, 0, 0], thighL: [-30, 0, 22], kneeL: [30, 0, 0], thighR: [-30, 0, -22], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    vk_flop: { root: { y: -0.5, rx: -70 }, spine: [-10, 0, 0], head: [20, 0, 0], shoulderL: [-20, 0, 70], elbowL: [-20, 0, 0], shoulderR: [-20, 0, -70], elbowR: [-20, 0, 0], thighL: [-30, 0, 30], kneeL: [30, 0, 0], thighR: [-30, 0, -30], kneeR: [30, 0, 0], hands: ['open', 'open'] },
  };
  SL.data.characters.veku = {
    id: 'veku', assetLevel: 1, name: 'Veku', fullName: 'Veku (Goku + Vegeta, a Fusion Dance with one bent finger)', era: 'Movie',
    playable: false, prototype: true, style: 'Failed Fusion',
    blurb: 'One finger out of place. He cannot fight. He can, with luck and a lot of bouncing, stay alive for thirty minutes.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 2 },
    stats: { hp: 12000, ki: 60, stamina: 120, speed: 0.62, power: 0.15, defense: 0.9, weight: 1.5, kiRegen: 1, chargeRate: 10, canonPower: 0.1 },
    flight: false,
    appearance: {
      height: 0.78, skin: VSKIN,
      build: {
        hipY: 0.6, pelvisW: 0.26, pelvisH: 0.12, pelvisD: 0.24,
        waistW: 0.34, waistD: 0.32, absLen: 0.2,
        chestW: 0.27, chestD: 0.24, chestTop: 0.2, shoulderX: 0.25, shoulderY: 0.15, delt: 0.08,
        upperArmLen: 0.2, upperArmR: 0.07, foreArmLen: 0.18, foreArmR: 0.06, fist: 0.06,
        hipX: 0.12, thighLen: 0.24, thighR: 0.11, shinLen: 0.2, shinR: 0.08,
        neckLen: 0.05, neckR: 0.09, headR: 0.16, footLen: 0.95,
      },
      hair: { style: 'gogeta', color: 0x121216 },
      face: { pupil: 0x1a1a22, eyeW: 0.78, eyeH: 0.9, browThick: 0.8, cheeks: 1.4 },
      outfit: {
        topStyle: 'bare', top: VSKIN, arms: VSKIN,
        jacket: { color: VEST, open: 1.9, short: true },
        paddedCollar: { color: COLLAR, size: 0.8 },
        belly: true,
        wrist: 0x16161a,
        belt: SASH, beltStyle: 'sash',
        pants: WHITE, pantsStyle: 'gi',
        boots: 0x2c5a9a, shoes: 0x16161a, bootStyle: 'gi',
      },
      portraitColor: '#f08a24',
    },
    vfx: { ghost: 0xf8f0e0 },
    audio: { strikePitch: 1.3, heavyPitch: 1.2 },
    forms: [{ id: 'base', name: 'Veku', aura: { color: 0xffffff, core: 0xffffff, idle: 0 }, mult: {} }],
    poses: Object.assign({ idle: vk.vk_idle, run: vk.vk_run, jump: vk.vk_bounce, fall: vk.vk_bounce }, vk),
    moves: {
      light: [
        { id: 'vkSlap', startup: 10, active: 3, recovery: 20, cancel: 12, damage: 40, reach: 0.9, radius: 0.7, lunge: 4, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'vk_slapW', strike: 'vk_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'vkSlap2', startup: 12, active: 3, recovery: 22, cancel: 14, damage: 40, reach: 0.9, radius: 0.7, lunge: 4, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'vk_slapW', strike: 'vk_slap' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'vkBump', startup: 14, active: 4, recovery: 26, damage: 60, reach: 0.9, radius: 0.85, lunge: 6, hitstun: 12, knock: 'push', knockSpeed: 8, impact: 1, pose: { wind: 'vk_bumpW', strike: 'vk_bump' }, sfx: 'punchLight', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'vkBelly', startup: 18, active: 5, recovery: 30, damage: 120, reach: 1.0, radius: 1.0, lunge: 10, hitstun: 16, knock: 'push', knockSpeed: 14, impact: 1, pose: { wind: 'vk_bumpW', strike: 'vk_bump' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'vkWaddle', startup: 14, active: 6, recovery: 26, damage: 60, reach: 0.9, radius: 0.85, lunge: 10, hitstun: 10, knock: 'flinch', impact: 1, pose: { wind: 'vk_bumpW', strike: 'vk_bump' }, sfx: 'punchLight', hitPose: 'hitLight' },
    },
    specials: {
      // the joke, used sparingly: a long cooldown, a little cloud, a shove — no damage
      special1: { id: 'vkPuff', name: 'Panic Puff', type: 'bossRoar', kiCost: 20, icon: 'guard', cooldown: 900, frames: 30, blastAt: 10, radius: 4.5, knockSpeed: 14, damage: 0, cloud: 0xd8e0b0, sfx: 'puff', poses: { roar: 'vk_puff' } },
    },
    blimp: { bounce: 9.5, push: 9, iframes: 22, cooldown: 26, trip: 0.16 },
    mechanic: { type: 'blimp', name: 'Blimp', desc: 'A dodge is a big, bouncing hop in a direction even he cannot predict — invulnerable while airborne. Land too fast and he may trip.' },
    ai: { personality: 'grunt', aggression: 0.05, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 9 },
    intro: { pose: 'vk_idle', expression: 'hurt' },
    victory: { poses: ['vk_idle'], expression: 'grin' },
    defeat: { pose: 'vk_flop', expression: 'ko' },
  };

  /* ======================================================================== THE DICTATOR + his army */
  const UNIFORM = 0x5a6048, UNIFORM2 = 0x40442f, CAP = 0x4a4e3a;
  const dt = {
    // hands clasped behind his back, chin up, rocking on his heels
    dt_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return { root: { y: b * 0.006 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-14, 0, 0], shoulderL: [20, 0, 20], elbowL: [-80, 0, 0], shoulderR: [20, 0, -20], elbowR: [-80, 0, 0], thighL: [-2, 0, 8], kneeL: [4, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0], hands: ['fist', 'fist'] };
    },
    // ordering: an arm straight out at the target, finger pointing
    dt_order: (t) => {
      const b = Math.sin(t * 6);
      return { root: { y: 0 }, spine: [-6, 0, 0], chest: [-8, 14, 0], head: [-12, -14, b * 3], shoulderR: [-96, 0, -6], elbowR: [-4, 0, 0], shoulderL: [10, 0, 20], elbowL: [-60, 0, 0], thighL: [-6, 4, 10], kneeL: [8, 0, 0], thighR: [4, -4, -10], kneeR: [8, 0, 0], hands: ['fist', 'point'] };
    },
    // shouting, shaking a fist at the sky
    dt_rant: (t) => {
      const b = Math.sin(t * 14);
      return { root: { y: Math.abs(b) * 0.01 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-20, 0, b * 4], shoulderR: [-150 + b * 14, 0, -20], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-60, 0, 0], thighL: [-6, 0, 10], kneeL: [8, 0, 0], thighR: [-6, 0, -10], kneeR: [8, 0, 0], hands: ['fist', 'fist'] };
    },
    dt_scared: (t) => {
      const b = Math.sin(t * 24) * 2;
      return { root: { y: -0.04, rx: -8 }, spine: [-10, 0, b], chest: [-10, 0, 0], head: [-6, 0, 0], shoulderL: [-110, 0, 40], elbowL: [-90, 0, 0], shoulderR: [-110, 0, -40], elbowR: [-90, 0, 0], thighL: [-10, 0, 14], kneeL: [16, 0, 0], thighR: [6, 0, -14], kneeR: [10, 0, 0], hands: ['open', 'open'] };
    },
    dt_run: (t) => {
      const s = Math.sin(t * 18);
      return { root: { y: -0.03 + Math.abs(s) * 0.05, rx: 14 }, spine: [10, 0, 0], head: [-14, 0, 0], shoulderL: [-140 + s * 30, 0, 50], elbowL: [-30, 0, 0], shoulderR: [-140 - s * 30, 0, -50], elbowR: [-30, 0, 0], thighL: [-s * 60 - 10, 0, 6], kneeL: [40 + Math.max(0, s) * 60, 0, 0], thighR: [s * 60 - 10, 0, -6], kneeR: [40 + Math.max(0, -s) * 60, 0, 0], hands: ['open', 'open'] };
    },
    sd_aimW: { ...C.blastWind, hands: ['fist', 'fist'] },
    sd_aim: { ...C.blastR, hands: ['fist', 'fist'] },
    sd_idle: (t) => {
      const b = Math.sin(t * 2);
      return { root: { y: b * 0.005 }, spine: [4, 10, 0], chest: [2, 12, 0], head: [-4, -10, 0], shoulderR: [-60, 20, -10], elbowR: [-60, 0, 0], shoulderL: [-50, -20, 20], elbowL: [-80, 0, 0], thighL: [-8, 6, 10], kneeL: [12, 0, 0], thighR: [4, -6, -10], kneeR: [10, 0, 0], hands: ['fist', 'fist'] };
    },
  };
  SL.data.characters.dictator = {
    id: 'dictator', assetLevel: 1, name: 'The Dictator', fullName: 'The Dictator (back from the dead)', era: 'Movie',
    playable: false, prototype: true, style: 'All Bark',
    blurb: 'Dead for decades, back for an afternoon, and certain the country belongs to him.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 2600, ki: 40, stamina: 60, speed: 0.75, power: 0.2, defense: 0.6, weight: 0.8, kiRegen: 1, chargeRate: 8, canonPower: 0.001 },
    flight: false,
    appearance: {
      height: 0.8, skin: 0xf0c8a0,
      build: { chestW: 0.19, chestD: 0.14, shoulderX: 0.19, waistW: 0.15, upperArmR: 0.048, foreArmR: 0.042, fist: 0.046, thighR: 0.08, shinR: 0.062, headR: 0.15, neckLen: 0.04 },
      hair: { style: 'cropped', color: 0x1a1612 },
      headExtras: [
        // the peaked cap: crown, band, the visor out front
        { shape: 'ball', a: [0, 1, 0.05], d: [0, 1, 0.1], l: 0.08, r: 0.16, color: CAP, depth: 0.8, flat: 1, outline: 0.8 },
        { shape: 'ball', a: [0, 0.55, 1], d: [0, -0.3, 1], l: 0.02, r: 0.1, color: 0x1a1a14, depth: 0.95, flat: 0.25, outline: 0.5 },
        // the broom of a moustache
        { shape: 'bar', a: [0, -0.32, 1], d: [1, 0, 0], l: 0.05, r: 0.028, color: 0x1a1612, depth: 1.02 },
      ],
      face: { pupil: 0x1a1a1a, eyeW: 0.9, browThick: 1.3, brow: 0x1a1612 },
      outfit: {
        topStyle: 'gi', top: UNIFORM, sleeves: 'long', sleeveColor: UNIFORM, wrist: UNIFORM2,
        belt: 0x2a2018, beltStyle: 'belt', buckle: 0xb8a060, pants: UNIFORM2, pantsStyle: 'gi', boots: 0x1a1612, bootStyle: 'gi',
      },
      portraitColor: '#5a6048',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: dt.dt_idle, run: dt.dt_run }, dt),
    moves: {
      light: [{ id: 'dtSlap', startup: 12, active: 3, recovery: 20, damage: 10, reach: 0.8, radius: 0.6, lunge: 4, hitstun: 8, knock: 'flinch', impact: 1, pose: { wind: 'dt_rant', strike: 'dt_order' }, sfx: 'punchLight', hitPose: 'hitLight' }],
      heavy: {},
    },
    specials: {},
    ai: { personality: 'grunt', aggression: 0.02, defense: 0.1, ranged: 0, beam: 0, transformHp: 0, preferredRange: 14 },
    intro: { pose: 'dt_rant', expression: 'shout' },
    victory: { poses: ['dt_rant'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
  SL.data.characters.dead_soldier = {
    id: 'dead_soldier', assetLevel: 1, name: 'Soldier', fullName: 'The Dictator\'s soldier (back from the dead)', era: 'Movie',
    playable: false, prototype: true, style: 'Rifleman',
    blurb: 'A rifle from another century against a boy who can fly.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 900, ki: 40, stamina: 60, speed: 0.85, power: 0.3, defense: 0.5, weight: 0.9, kiRegen: 1, chargeRate: 8, canonPower: 0.001 },
    flight: false,
    appearance: {
      height: 0.94, skin: 0xd8c0a0,
      build: { chestW: 0.2, chestD: 0.15, shoulderX: 0.2, waistW: 0.16, upperArmR: 0.052, foreArmR: 0.046, fist: 0.05, thighR: 0.086, shinR: 0.066, headR: 0.142, neckLen: 0.05 },
      hair: { style: 'cropped', color: 0x3a2a1e },
      face: { pupil: 0x1a1a1a, eyeW: 0.9 },
      outfit: {
        topStyle: 'gi', top: UNIFORM, sleeves: 'long', sleeveColor: UNIFORM, wrist: UNIFORM2,
        belt: 0x2a2018, beltStyle: 'belt', pants: UNIFORM2, pantsStyle: 'gi', boots: 0x1a1612, bootStyle: 'gi',
        helmet: 0x4e5440,
      },
      props: [{ id: 'rifle', shape: 'rifle', joint: 'handR', pos: [0, -0.04, 0.02], rot: [1.6, 0, 0], length: 0.5 }],
      portraitColor: '#5a6048',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xd8dcc8, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: dt.sd_idle }, dt),
    moves: {
      light: [{ id: 'sdButt', startup: 9, active: 3, recovery: 16, cancel: 10, damage: 80, reach: 1.0, radius: 0.65, lunge: 8, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'sd_aimW', strike: 'sd_aim' }, sfx: 'punchLight', hitPose: 'hitLight' }],
      heavy: {},
    },
    specials: {
      special1: {
        id: 'sdShot', name: 'Rifle', type: 'projectile', kiCost: 6, icon: 'ball',
        startup: 20, recovery: 28, pose: { wind: 'sd_aimW', release: 'sd_aim' },
        projectile: { kind: 'ball', speed: 90, radius: 0.14, damage: 90, homing: 0, color: 0xffe0a0, core: 0xffffff, explode: 0.4, knock: 'flinch', knockSpeed: 3, impact: 1, life: 1.6 },
      },
    },
    mechanic: null,
    ai: { personality: 'gunner', aggression: 0.3, defense: 0.15, ranged: 0.85, beam: 0, transformHp: 0, preferredRange: 9 },
    intro: { pose: 'sd_idle', expression: 'angry' },
    victory: { poses: ['sd_idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ======================================================================== THE KAIS (spectators) */
  const KK = SL.data.characters.king_kai;
  const kai = (id, name, app) => {
    SL.data.characters[id] = Object.assign({}, KK, {
      id, name, era: 'Movie', assetLevel: 1,
      appearance: Object.assign({}, KK.appearance, app, { outfit: Object.assign({}, KK.appearance.outfit, app.outfit || {}) }),
    });
  };
  kai('south_kai', 'South Kai', {
    skin: 0x9a5ab8, height: 0.86,
    build: Object.assign({}, KK.appearance.build, { chestW: 0.3, chestD: 0.22, shoulderX: 0.3, upperArmR: 0.08, foreArmR: 0.07, waistW: 0.22 }),
    headExtras: [{ a: [0, 0.95, 0.1], d: [0, 1, -0.2], l: 0.12, r: 0.05, color: 0xe8c040, depth: 0.9 }],
    face: { pupil: 0x101010, brow: 0x9a5ab8 },
    outfit: { top: 0xc83a2a, sleeveColor: 0xc83a2a, pants: 0xc83a2a, shades: undefined },
  });
  kai('west_kai', 'West Kai', {
    skin: 0x8a6ad8, height: 0.9,
    build: Object.assign({}, KK.appearance.build, { chestW: 0.18, chestD: 0.14, waistW: 0.14, waistD: 0.13, shoulderX: 0.18 }),
    headExtras: [{ shape: 'ball', a: [0, 1, -0.4], d: [0, 0.5, -1], l: 0.1, r: 0.09, color: 0xf2f0e8, depth: 0.8, flat: 1, outline: 0.6 }],
    face: { pupil: 0x101010, brow: 0x8a6ad8 },
    outfit: { top: 0x2a6ab8, sleeveColor: 0x2a6ab8, pants: 0x2a6ab8, shades: undefined },
    props: [{ id: 'glasses', shape: 'glasses', joint: 'head', pos: [0, 0.02, 0.135], rot: [0, 0, 0], color: 0x2a2a3a, frame: 0x8a8a94 }],
  });
  kai('east_kai', 'East Kai', {
    skin: 0xe8a0c8, height: 0.62,
    build: Object.assign({}, KK.appearance.build, { chestW: 0.17, chestD: 0.14, waistW: 0.13, waistD: 0.12, shoulderX: 0.17, upperArmR: 0.04, foreArmR: 0.036 }),
    hair: { style: 'videl_bob', color: 0xff8ab8 },
    headExtras: [],
    face: { pupil: 0x101010, brow: 0xd87aa8, eyeW: 1.1 },
    outfit: { top: 0xe8c84a, sleeveColor: 0xe8c84a, pants: 0xe8c84a, shades: undefined },
  });
  kai('grand_kai', 'Grand Kai', {
    skin: 0x6a8ad8, height: 0.9,
    headExtras: [
      { shape: 'ball', a: [0.7, 0.6, -0.2], d: [1, 0.3, 0], l: 0.08, r: 0.1, color: 0xf2f0f0, depth: 0.9, flat: 1, outline: 0.6 },
      { shape: 'ball', a: [-0.7, 0.6, -0.2], d: [-1, 0.3, 0], l: 0.08, r: 0.1, color: 0xf2f0f0, depth: 0.9, flat: 1, outline: 0.6 },
      { shape: 'ball', a: [0, -0.75, 0.5], d: [0, -1, 0.4], l: 0.1, r: 0.11, color: 0xf2f0f0, depth: 0.85, flat: 0.9, outline: 0.6 },
    ],
    face: { pupil: 0x101010, brow: 0xf2f0f0 },
    outfit: { top: 0xd8402a, sleeveColor: 0xd8402a, pants: 0x2a2a36, shades: 0x0a0a10, cape: 0xe8c84a },
  });

  /* ======================================================================== the fusion data */
  SL.data.fusions = SL.data.fusions || {};
  // the dance with Vegeta's finger bent: thirty minutes of this
  SL.data.fusions.veku = { parts: ['goku', 'vegeta'], method: 'dance', seconds: 0 };
  if (SL.data.fusions.gogeta) SL.data.fusions.gogeta.failures = { finger: 'veku' };
})();
