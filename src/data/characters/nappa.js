/*
 * NAPPA (Saiyan Saga) — Vegeta's hulking, sadistic partner.
 * ENEMY / BOSS (not playable). Identity: huge, slow to start, devastating once
 * he gets going; laughs off light hits (poise), wrecks the terrain.
 * BOSS DESIGN (not balanced by a huge health bar):
 *   POISE — light and medium hits don't make him flinch; every hit wears his
 *     poise down, and when it breaks he staggers for almost three seconds and
 *     takes extra damage. Poise recovers if you let him breathe.
 *   TELEGRAPHS — every big attack shows where it lands: a red disc under his
 *     Ground Slam landing spot, yellow discs under Break Cannon eruptions, an
 *     orange dome that fills while Bomber DX charges. Each leaves him open.
 *   PHASES — TOYING (walks, slams, gloats over a downed opponent), ANGRY (roars,
 *     flies, rams, Break Cannon volleys, Mouth Blast), RAMPAGE (Bomber DX on
 *     entry, everything faster). The terrain gets wrecked as he goes.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const poses = {
    // STORY (playtest round 2): flat on his back, reaching up for the prince's hand
    n_reachUp: (t) => {
      const s = Math.sin(t * 7) * 2;
      return {
        root: { y: -0.84, rx: -90 }, spine: [-2, 0, 0], head: [-18, -6, 0],
        shoulderL: [-8, 0, 14], elbowL: [-16, 0, 0], shoulderR: [-150 + s, 0, -12], elbowR: [-18, 0, 0],
        thighL: [0, 0, 6], kneeL: [12, 0, 0], thighR: [-6, 0, -6], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // wide, arrogant stance: chest out, fists loose, weight back
    idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.04 + b * 0.01 }, hips: [0, -8, 0], spine: [-4, 0, 0], chest: [-8, 6, 0], head: [-8, 4, 0],
        shoulderL: [-14, 0, 34], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -32], elbowR: [-46, 0, 0],
        thighL: [-10, 18, 16], kneeL: [16 + b * 2, 0, 0], footL: [0, 0, 0], thighR: [6, -18, -16], kneeR: [12 + b * 2, 0, 0], footR: [0, 0, 0],
      };
    },
    n_laugh: (t) => {
      const s = Math.sin(t * 16);
      return {
        root: { y: -0.02 + Math.abs(s) * 0.015 }, spine: [-8, 0, 0], chest: [-14 + s * 3, 0, 0], head: [-26 + s * 4, 0, 0],
        shoulderL: [-20, 0, 40], elbowL: [-90, 0, 0], handL: [0, 0, 20], shoulderR: [-20, 0, -40], elbowR: [-90, 0, 0], handR: [0, 0, -20],
        thighL: [-6, 14, 14], kneeL: [10, 0, 0], thighR: [4, -14, -14], kneeR: [8, 0, 0],
      };
    },
    // Break Cannon: two fingers raised — the ground below erupts
    n_twoFingers: {
      root: { y: -0.02 }, chest: [-10, 10, 0], head: [-14, -6, 0],
      shoulderR: [-170, 0, -10], elbowR: [-20, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-40, 0, 0],
      thighL: [-8, 14, 14], kneeL: [10, 0, 0], thighR: [4, -14, -14], kneeR: [8, 0, 0],
      hands: ['fist', 'point'],
    },
    n_crouchCharge: (t) => {
      const s = Math.sin(t * 40) * 1.5;
      return {
        root: { y: -0.28 + s * 0.004 }, spine: [18, 0, 0], chest: [16 + s, 0, 0], head: [-10, 0, 0],
        shoulderL: [-30, 0, 60], elbowL: [-100, 0, 0], shoulderR: [-30, 0, -60], elbowR: [-100, 0, 0],
        thighL: [-70, 26, 24], kneeL: [100, 0, 0], thighR: [-64, -26, -24], kneeR: [96, 0, 0],
      };
    },
    // Bomber DX: arms flung wide, back arched
    n_bomber: {
      root: { y: 0.02 }, spine: [-16, 0, 0], chest: [-20, 0, 0], head: [-30, 0, 0],
      shoulderL: [-20, 0, 110], elbowL: [-10, 0, 0], shoulderR: [-20, 0, -110], elbowR: [-10, 0, 0],
      thighL: [-10, 20, 24], kneeL: [14, 0, 0], thighR: [-6, -20, -24], kneeR: [12, 0, 0],
      hands: ['open', 'open'],
    },
    n_mouthCharge: { root: { y: -0.06 }, spine: [10, 0, 0], chest: [8, 0, 0], neck: [-10, 0, 0], head: [-20, 0, 0], shoulderL: [-10, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-60, 0, 0], thighL: [-20, 14, 16], kneeL: [30, 0, 0], thighR: [10, -14, -16], kneeR: [20, 0, 0] },
    n_mouthFire: { root: { y: -0.06 }, spine: [-4, 0, 0], chest: [-6, 0, 0], neck: [6, 0, 0], head: [8, 0, 0], shoulderL: [-10, 0, 50], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -50], elbowR: [-40, 0, 0], thighL: [-24, 14, 18], kneeL: [34, 0, 0], thighR: [12, -14, -18], kneeR: [22, 0, 0] },
    n_stompW: { ...C.hammerWind, root: { y: 0.04 }, thighR: [-80, 0, -10], kneeR: [60, 0, 0] },
    n_stomp: { ...C.hammer, root: { y: -0.08 }, thighR: [-10, 0, -14], kneeR: [20, 0, 0] },
    n_victory: { ...poses_laughStill() },
    // hands on knees, heaving: the opening after Bomber DX
    n_winded: (t) => {
      const s = Math.sin(t * 7);
      return {
        root: { y: -0.16 + s * 0.012 }, spine: [26, 0, 0], chest: [14 + s * 3, 0, 0], head: [-18, 0, 0],
        shoulderL: [-50, 0, 22], elbowL: [-30, 0, 0], shoulderR: [-50, 0, -22], elbowR: [-30, 0, 0],
        thighL: [-40, 12, 16], kneeL: [56, 0, 0], thighR: [-34, -12, -16], kneeR: [50, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };
  function poses_laughStill() {
    return { spine: [-8, 0, 0], chest: [-14, 0, 0], head: [-26, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-90, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-90, 0, 0] };
  }

  SL.data.characters.nappa = {
    id: 'nappa',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Nappa',
    fullName: 'Nappa, Saiyan Elite',
    era: 'Saiyan Saga',
    playable: false,
    boss: true,
    poise: { max: 100, regen: 11, regenDelay: 110, armor: 2, cost: { 1: 5, 2: 9, 3: 16, 4: 28 }, beamMul: 1.4, beamArmor: true, breakFrames: 170, vulnerable: 1.35 },
    style: 'Juggernaut',
    blurb: 'A mountain of muscle who treats battle as sport. Slow to start — then nothing is left standing.',
    ratings: { power: 5, speed: 2, ki: 3, defense: 4 },
    stats: { hp: 22000, ki: 100, stamina: 140, speed: 0.9, power: 1.0, defense: 1.15, weight: 1.7, kiRegen: 2, chargeRate: 28, canonPower: 1.1 },
    appearance: {
      height: 1.28,
      skin: 0xeeb88e,
      build: { chestW: 0.25, chestD: 0.16, shoulderX: 0.25, waistW: 0.155, waistD: 0.14, upperArmR: 0.075, foreArmR: 0.066, fist: 0.07, delt: 0.095, thighR: 0.1, shinR: 0.076, neckR: 0.075, headR: 0.128 },
      headExtras: [
        // bushy black moustache
        { shape: 'ball', a: [0.22, -0.46, 0.94], d: [1, -0.55, 0.15], l: 0.045, r: 0.013, color: 0x141414, depth: 0.99, flat: 0.7, outline: 0.2 },
        { shape: 'ball', a: [-0.22, -0.46, 0.94], d: [-1, -0.55, 0.15], l: 0.045, r: 0.013, color: 0x141414, depth: 0.99, flat: 0.7, outline: 0.2 },
      ],
      face: { pupil: 0x0d0d0d, eyeW: 0.9, browThick: 1.6, brow: 0x141414 },
      outfit: {
        topStyle: 'armor', top: 0x1f2d6e, arms: 0xeeb88e, pants: 0x1f2d6e, pantsStyle: 'tight',
        wrist: 0xb3202a, boots: 0xf2eee2, bootTip: 0xd2a84a, bootStyle: 'saiyan',
        armor: { plate: 0xf2ecd8, belly: 0xf2ecd8, pads: 0x5a3a24, padStyle: 'wide', hipGuards: 0x5a3a24, trim: 0x5a3a24 },
        scouter: { lens: 0xff3a3a, body: 0xe2e2e2 },
        tail: 0x5a3a1e,
      },
      portraitColor: '#5a3a24',
    },
    vfx: { ghost: 0xffe0b0 },
    audio: { strikePitch: 0.75, heavyPitch: 0.7 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xfff0c0, core: 0xffffff, particles: 0xffe0a0 }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'backhand', startup: 8, active: 4, recovery: 18, cancel: 10, damage: 420, reach: 1.4, radius: 0.85, lunge: 8, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'hook', startup: 8, active: 4, recovery: 19, cancel: 11, damage: 460, reach: 1.4, radius: 0.85, lunge: 8, hitstun: 24, knock: 'push', knockSpeed: 8, impact: 2, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'elbowDrop', startup: 10, active: 4, recovery: 24, cancel: 13, damage: 560, reach: 1.3, radius: 0.9, lunge: 8, hitstun: 26, knock: 'heavy', knockSpeed: 18, impact: 2, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'stomp', startup: 16, active: 5, recovery: 28, damage: 1100, reach: 1.2, radius: 1.3, lunge: 6, hitstun: 36, knock: 'smash', knockSpeed: 26, impact: 3, armor: true, guardCrush: true, guardDamage: 55, pose: { wind: 'n_stompW', strike: 'n_stomp' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'giantUppercut', startup: 13, active: 5, recovery: 26, damage: 980, reach: 1.3, radius: 1.0, lunge: 10, hitstun: 38, knock: 'launch', knockSpeed: 20, impact: 3, armor: true, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'shoulderRam', startup: 9, active: 12, recovery: 24, damage: 900, reach: 1.4, radius: 1.2, lunge: 30, hitstun: 32, knock: 'heavy', knockSpeed: 30, impact: 3, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      throw: { id: 'crush', name: 'Crush', damage: 1400, knockSpeed: 30, poses: ['grab', 'hammerWind', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'mouthBlast', name: 'Mouth Blast', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 26, chargeMax: 60, damage: [2000, 3200], radius: [0.6, 1.1], speed: 110, range: 150, sustain: 30,
        color: 0xffe07a, core: 0xffffff, poses: { charge: 'n_mouthCharge', fire: 'n_mouthFire' }, recovery: 30, fromHead: true,
      },
      special2: {
        id: 'giantStorm', name: 'Giant Storm', type: 'projectile', kiCost: 30, icon: 'ball',
        startup: 20, recovery: 24, pose: { wind: 'n_twoFingers', release: 'blastR' },
        projectile: { kind: 'ball', speed: 55, radius: 1.1, damage: 2600, homing: 1, color: 0xffd060, core: 0xffffff, explode: 7, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      ultimate: {
        id: 'breakCannon', name: 'Break Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 70, chargeMax: 70, damage: [6200, 6200], radius: [2.0, 2.0], speed: 80, range: 170, sustain: 50,
        color: 0xffc860, core: 0xffffff, poses: { charge: 'n_twoFingers', fire: 'n_mouthFire' }, recovery: 44, cinematic: true, oneHand: true,
      },
    },
    mechanic: { type: 'boss', name: 'Juggernaut', desc: 'Poise shrugs off light hits until it breaks. Three phases: Toying, Angry, Rampage.' },
    boss: {
      phases: [
        { id: 'toying', label: 'TOYING', hpAbove: 0.62, speed: 0.9, damage: 0.9, patience: 1.4, patterns: { melee: 1, slam: 0.55, storm: 0.25, taunt: 0.9 } },
        { id: 'angry', label: 'ANGRY', hpAbove: 0.3, speed: 1.05, damage: 1.1, enter: 'roar', line: 'angry', patterns: { melee: 1, slam: 0.45, eruption: 0.7, ram: 0.6, mouth: 0.35, taunt: 0.3 } },
        { id: 'rampage', label: 'RAMPAGE', hpAbove: 0, speed: 1.15, damage: 1.2, patience: 0.5, enter: 'bomber', line: 'rampage', patterns: { melee: 1.1, bomber: 0.5, eruption: 0.55, ram: 0.7, slam: 0.4 } },
      ],
      patterns: {
        slam: { technique: 'slam', minDist: 5, maxDist: 30, maxAltitude: 6, cooldown: 360 },
        eruption: { technique: 'eruption', minDist: 6, maxDist: 55, maxAltitude: 5, cooldown: 420 },
        bomber: { technique: 'bomber', maxDist: 14, cooldown: 900, punish: false },
        taunt: { technique: 'taunt', when: 'targetDown', maxDist: 16, cooldown: 600 },
        storm: { slot: 'special2', minDist: 10, cooldown: 300 },
        mouth: { slot: 'special1', minDist: 12, hold: 40, cooldown: 480 },
        ram: { inputs: [{ boostPressed: true, boost: true, my: 1 }, { boost: true, my: 1 }, { boost: true, my: 1 }, { light: true }], minDist: 7, maxDist: 28, cooldown: 300 },
      },
      techniques: {
        slam: { type: 'groundSlam', crouch: 22, hang: 36, height: 7, maxRange: 20, radius: 8, clearHeight: 2.2, damage: 1900, knockSpeed: 18, recovery: 42, poses: { crouch: 'n_crouchCharge', air: 'n_stompW', land: 'n_stomp' } },
        eruption: { type: 'eruption', count: 3, interval: 24, delay: 42, lead: 0.35, radius: 3.4, columnHeight: 7, damage: 1500, knockSpeed: 22, recovery: 34, poses: { cast: 'n_twoFingers' } },
        bomber: { type: 'bomberWave', charge: 60, radius: 14, damage: 4200, knockSpeed: 32, recovery: 84, poses: { charge: 'n_crouchCharge', release: 'n_bomber', winded: 'n_winded' } },
        roar: { type: 'bossRoar', frames: 64, blastAt: 18, radius: 13, knockSpeed: 20, damage: 0, poses: { roar: 'n_bomber' } },
        taunt: { type: 'bossTaunt', frames: 80, line: 'taunt', poses: { taunt: 'n_laugh' } },
      },
    },
    ai: { personality: 'berserker', aggression: 0.7, defense: 0.3, ranged: 0.2, beam: 0.3, transformHp: 0, preferredRange: 4, hooks: 'boss' },
    barks: { taunt: 'nappa_taunt', angry: 'nappa_angry', rampage: 'nappa_rampage', hurt: 'nappa_hurt' },
    intro: { pose: 'n_laugh', expression: 'grin' },
    victory: { poses: ['n_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
