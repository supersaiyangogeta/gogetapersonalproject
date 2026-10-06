/*
 * GREAT APE (Oozaru) — a Saiyan transformed by moonlight (or a Power Ball).
 * GIANT BOSSES (not playable): Great Ape Vegeta (Chapter 3) and Great Ape Gohan
 * (Chapter 2, the full-moon night) — the second is derived from the first below.
 *
 * Not a scaled-up Vegeta: its own body plan (hunched, long arms, short legs,
 * muzzle, a long living tail), giant camera framing, slow heavy movement, and
 * giant-only attacks that all draw their danger on the ground first:
 *   STOMP (red disc under the target), SWEEP (red slice in front — jump or fly
 *   over), GRAB (orange disc; caught heroes are crushed until they break free),
 *   MOUTH BEAM, and a ROAR that freezes anyone standing near it.
 * HIT ZONES: head, chest, belly, arms, legs and the TAIL. The tail is the weak
 * point (x1.6 damage) and can be broken — which ends the transformation.
 * POISE: huge, so light hits never stagger it; breaking it opens a long window.
 * Future giants reuse the same pieces: hitZones, giant techniques, boss phases.
 */
(function () {
  'use strict';

  const FUR = 0x6b4124;
  const FUR_DARK = 0x4a2a16;
  const MUZZLE = 0xc89a6a;

  const hunch = { root: { y: -0.1, rx: 18 }, spine: [18, 0, 0], chest: [10, 0, 0], neck: [-26, 0, 0], head: [-18, 0, 0] };

  const poses = {
    idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        ...hunch, root: { y: -0.1 + b * 0.01, rx: 18 }, chest: [10 + b * 2, 0, 0],
        shoulderL: [-28, 0, 38], elbowL: [-36, 0, 0], shoulderR: [-28, 0, -38], elbowR: [-36, 0, 0],
        thighL: [-34, 18, 20], kneeL: [52, 0, 0], footL: [-14, 0, 0], thighR: [-30, -18, -20], kneeR: [48, 0, 0], footR: [-14, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    run: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const ph = t * 5 * sp;
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        ...hunch, root: { y: -0.1 + Math.abs(c) * 0.04, rx: 24, rz: s * 4 }, chest: [12, s * 10, 0],
        shoulderL: [-30 + s * 40, 0, 34], elbowL: [-40, 0, 0], shoulderR: [-30 - s * 40, 0, -34], elbowR: [-40, 0, 0],
        thighL: [-s * 40 - 30, 0, 14], kneeL: [50 + Math.max(0, s) * 40, 0, 0], thighR: [s * 40 - 30, 0, -14], kneeR: [50 + Math.max(0, -s) * 40, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    ga_stompW: { ...hunch, root: { y: 0.04, rx: 8 }, spine: [4, 0, 0], shoulderL: [-60, 0, 60], elbowL: [-30, 0, 0], shoulderR: [-60, 0, -60], elbowR: [-30, 0, 0], thighL: [-6, 10, 14], kneeL: [14, 0, 0], thighR: [-110, 0, -16], kneeR: [96, 0, 0], footR: [20, 0, 0] },
    ga_stomp: { ...hunch, root: { y: -0.22, rx: 28 }, shoulderL: [-10, 0, 50], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -50], elbowR: [-20, 0, 0], thighL: [-50, 14, 18], kneeL: [80, 0, 0], thighR: [-20, -10, -18], kneeR: [30, 0, 0] },
    ga_sweepW: { ...hunch, chest: [8, 50, 0], head: [-18, -30, 0], shoulderR: [-40, 0, -110], elbowR: [-10, 0, 0], shoulderL: [-40, 0, 40], elbowL: [-60, 0, 0], thighL: [-34, 18, 20], kneeL: [52, 0, 0], thighR: [-30, -18, -20], kneeR: [48, 0, 0], hands: ['fist', 'open'] },
    ga_sweep: { ...hunch, root: { y: -0.14, rx: 22 }, chest: [14, -60, 0], head: [-18, 36, 0], shoulderR: [-90, 0, 50], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 50], elbowL: [-40, 0, 0], thighL: [-40, 18, 20], kneeL: [60, 0, 0], thighR: [-24, -18, -20], kneeR: [40, 0, 0], hands: ['fist', 'open'] },
    ga_reach: { ...hunch, root: { y: -0.16, rx: 30 }, chest: [14, -20, 0], shoulderR: [-100, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-50, 0, 0], thighL: [-46, 18, 20], kneeL: [64, 0, 0], thighR: [-20, -18, -20], kneeR: [36, 0, 0], hands: ['fist', 'open'] },
    ga_hold: (t) => {
      const s = Math.sin(t * 8);
      return { ...hunch, root: { y: -0.08, rx: 12 }, chest: [4, -10, 0], head: [-10 + s * 3, 0, 0], shoulderR: [-72, 0, -18], elbowR: [-70, 0, 0], shoulderL: [-40, 0, 50], elbowL: [-80, 0, 0], thighL: [-34, 18, 20], kneeL: [52, 0, 0], thighR: [-30, -18, -20], kneeR: [48, 0, 0], hands: ['fist', 'fist'] };
    },
    ga_throw: { ...hunch, root: { y: -0.2, rx: 30 }, chest: [30, 10, 0], shoulderR: [-20, 0, -20], elbowR: [-10, 0, 0], shoulderL: [-10, 0, 40], elbowL: [-30, 0, 0], thighL: [-50, 18, 20], kneeL: [70, 0, 0], thighR: [-20, -18, -20], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    ga_roar: (t) => {
      const s = Math.sin(t * 30);
      return { root: { y: 0.02, rx: 0 }, spine: [-12, 0, 0], chest: [-20 + s, 0, 0], neck: [-10, 0, 0], head: [-40, 0, 0], shoulderL: [-40, 0, 110], elbowL: [-20, 0, 0], shoulderR: [-40, 0, -110], elbowR: [-20, 0, 0], thighL: [-20, 18, 22], kneeL: [30, 0, 0], thighR: [-16, -18, -22], kneeR: [26, 0, 0], hands: ['open', 'open'] };
    },
    ga_beamCharge: (t) => {
      const s = Math.sin(t * 36);
      return { ...hunch, root: { y: -0.12, rx: 22 }, neck: [-30, 0, 0], head: [-16 + s, 0, 0], shoulderL: [-20, 0, 70], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -70], elbowR: [-40, 0, 0], thighL: [-40, 18, 22], kneeL: [60, 0, 0], thighR: [-36, -18, -22], kneeR: [56, 0, 0], hands: ['open', 'open'] };
    },
    ga_beamFire: { ...hunch, root: { y: -0.1, rx: 16 }, neck: [-20, 0, 0], head: [-4, 0, 0], shoulderL: [-10, 0, 80], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -80], elbowR: [-20, 0, 0], thighL: [-40, 18, 22], kneeL: [60, 0, 0], thighR: [-36, -18, -22], kneeR: [56, 0, 0], hands: ['open', 'open'] },
    ga_chestBeat: (t) => {
      const s = Math.sin(t * 14);
      return { root: { y: -0.02, rx: 4 }, spine: [-6, 0, 0], chest: [-12, 0, 0], head: [-30, 0, 0], shoulderL: [-100 + s * 20, 0, 20], elbowL: [-120, 0, 0], shoulderR: [-100 - s * 20, 0, -20], elbowR: [-120, 0, 0], thighL: [-20, 18, 22], kneeL: [30, 0, 0], thighR: [-16, -18, -22], kneeR: [26, 0, 0], hands: ['fist', 'fist'] };
    },
    ga_swatW: { ...hunch, chest: [6, 30, 0], shoulderR: [-120, 0, -60], elbowR: [-40, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-40, 0, 0], thighL: [-34, 18, 20], kneeL: [52, 0, 0], thighR: [-30, -18, -20], kneeR: [48, 0, 0], hands: ['fist', 'open'] },
    ga_swat: { ...hunch, root: { y: -0.12, rx: 24 }, chest: [12, -34, 0], shoulderR: [-70, 0, 30], elbowR: [-10, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-40, 0, 0], thighL: [-40, 18, 20], kneeL: [58, 0, 0], thighR: [-26, -18, -20], kneeR: [42, 0, 0], hands: ['fist', 'open'] },
    ga_smashW: { ...hunch, root: { y: 0.02, rx: 4 }, spine: [-8, 0, 0], chest: [-14, 0, 0], shoulderL: [-170, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-170, 0, -20], elbowR: [-40, 0, 0], thighL: [-20, 18, 20], kneeL: [30, 0, 0], thighR: [-20, -18, -20], kneeR: [30, 0, 0] },
    ga_smash: { ...hunch, root: { y: -0.24, rx: 36 }, spine: [30, 0, 0], chest: [20, 0, 0], shoulderL: [-80, 0, 10], elbowL: [-10, 0, 0], shoulderR: [-80, 0, -10], elbowR: [-10, 0, 0], thighL: [-60, 18, 20], kneeL: [90, 0, 0], thighR: [-56, -18, -20], kneeR: [86, 0, 0] },
    ga_winded: (t) => {
      const s = Math.sin(t * 5);
      return { ...hunch, root: { y: -0.2 + s * 0.01, rx: 30 }, spine: [28, 0, 0], head: [-10, 0, 0], shoulderL: [-50, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-50, 0, -20], elbowR: [-20, 0, 0], thighL: [-50, 18, 20], kneeL: [70, 0, 0], thighR: [-46, -18, -20], kneeR: [66, 0, 0], hands: ['open', 'open'] };
    },
  };

  SL.data.characters.great_ape_vegeta = {
    id: 'great_ape_vegeta',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Great Ape Vegeta',
    era: 'Saiyan Saga',
    playable: false,
    boss: true,
    giant: true,
    flight: false,
    style: 'Giant',
    blurb: 'Vegeta under the light of his own Power Ball: a mountain of fur and fury.',
    ratings: { power: 5, speed: 1, ki: 4, defense: 5 },
    stats: { hp: 48000, ki: 100, stamina: 300, speed: 0.55, power: 1.25, defense: 1.3, weight: 9, kiRegen: 3, chargeRate: 24, canonPower: 2 },
    poise: { max: 220, regen: 14, regenDelay: 120, armor: 3, cost: { 1: 5, 2: 9, 3: 16, 4: 28 }, beamMul: 1.5, beamArmor: true, breakFrames: 210, vulnerable: 1.4 },
    appearance: {
      height: 6.2,
      skin: FUR,
      build: {
        hipY: 0.74, chestW: 0.3, chestD: 0.21, chestTop: 0.3, shoulderX: 0.31, shoulderY: 0.24, delt: 0.12, waistW: 0.22, waistD: 0.19, pelvisW: 0.21, pelvisD: 0.17,
        upperArmLen: 0.36, upperArmR: 0.088, foreArmLen: 0.34, foreArmR: 0.082, fist: 0.1,
        hipX: 0.12, thighLen: 0.33, thighR: 0.12, shinLen: 0.3, shinR: 0.1, neckLen: 0.02, neckR: 0.11, headR: 0.17, footLen: 1.4,
      },
      headExtras: [
        // muzzle, brow ridge, round ears, shaggy crown
        { shape: 'ball', a: [0, -0.55, 1], d: [0, -0.1, 1], l: 0.07, r: 0.12, color: MUZZLE, depth: 0.74, flat: 0.75, outline: 0.6 },
        { shape: 'ball', a: [0, 0.42, 1], d: [0, 0.3, 1], l: 0.018, r: 0.13, color: FUR_DARK, depth: 0.9, flat: 0.3, outline: 0.3 },
        { shape: 'ball', a: [1, 0.3, -0.1], d: [1, 0, 0], l: 0.03, r: 0.07, color: MUZZLE, depth: 0.97, flat: 1, outline: 0.5 },
        { shape: 'ball', a: [-1, 0.3, -0.1], d: [-1, 0, 0], l: 0.03, r: 0.07, color: MUZZLE, depth: 0.97, flat: 1, outline: 0.5 },
        { a: [0, 1, 0.1], d: [0, 1, -0.5], l: 0.1, r: 0.05, color: FUR_DARK, depth: 0.9, outline: 0.6 },
        { a: [0.4, 0.9, 0], d: [0.5, 1, -0.4], l: 0.09, r: 0.045, color: FUR_DARK, depth: 0.9, outline: 0.6 },
        { a: [-0.4, 0.9, 0], d: [-0.5, 1, -0.4], l: 0.09, r: 0.045, color: FUR_DARK, depth: 0.9, outline: 0.6 },
        { a: [0, 0.7, -0.7], d: [0, 0.4, -1], l: 0.1, r: 0.05, color: FUR_DARK, depth: 0.9, outline: 0.6 },
      ],
      face: { noEars: true, sclera: 0xe02a14, pupil: 0x3a0000, brow: FUR_DARK, browThick: 2.2, eyeW: 1.3, eyeX: 0.06, lash: 0x1a0a04 },
      outfit: {
        topStyle: 'armor', top: FUR, arms: FUR, pants: FUR, pantsStyle: 'tight', boots: FUR_DARK, bootStyle: 'gi', legs: FUR,
        armor: { plate: 0xf2ecd8, belly: 0xf2ecd8, pads: 0xd2a84a, padStyle: 'wide', hipGuards: 0xd2a84a, trim: 0xd2a84a },
        longTail: { color: FUR, segments: 8, length: 1.15, radius: 0.07, fur: true, lift: 0.8, curl: 0.22 },
      },
      portraitColor: '#6b4124',
    },
    hitZones: [
      { id: 'head', joint: 'head', offset: [0, 0.14, 0.04], r: 0.17, damageMul: 1.25 },
      { id: 'chest', joint: 'chest', offset: [0, 0.16, 0.02], r: 0.26, damageMul: 1 },
      { id: 'belly', joint: 'spine', offset: [0, 0.1, 0.02], r: 0.22, damageMul: 1 },
      { id: 'armL', joint: 'elbowL', offset: [0, -0.1, 0], r: 0.11, damageMul: 0.7 },
      { id: 'armR', joint: 'elbowR', offset: [0, -0.1, 0], r: 0.11, damageMul: 0.7 },
      { id: 'handL', joint: 'handL', offset: [0, -0.05, 0], r: 0.11, damageMul: 0.6 },
      { id: 'handR', joint: 'handR', offset: [0, -0.05, 0], r: 0.11, damageMul: 0.6 },
      { id: 'legL', joint: 'kneeL', offset: [0, -0.05, 0], r: 0.14, damageMul: 0.85 },
      { id: 'legR', joint: 'kneeR', offset: [0, -0.05, 0], r: 0.14, damageMul: 0.85 },
      { id: 'tail', joint: 'tail3', offset: [0, -0.05, 0], r: 0.1, damageMul: 1.6, hp: 5200, hidesWhenBroken: true },
      { id: 'tail', joint: 'tail6', offset: [0, -0.05, 0], r: 0.09, damageMul: 1.6, hp: 5200, hidesWhenBroken: true },
    ],
    vfx: { ghost: 0xffb070 },
    audio: { strikePitch: 0.5, heavyPitch: 0.45 },
    forms: [{ id: 'base', name: 'Great Ape', aura: { color: 0xffd090, core: 0xffffff, particles: 0xffc070 }, mult: {} }],
    poses,
    moves: {
      light: [
        { id: 'swat', startup: 14, active: 5, recovery: 26, cancel: 18, damage: 900, reach: 0.9, radius: 0.35, lunge: 3, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 3, pose: { wind: 'ga_swatW', strike: 'ga_swat' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        { id: 'backswat', startup: 14, active: 5, recovery: 28, cancel: 18, damage: 950, reach: 0.9, radius: 0.35, lunge: 3, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 3, pose: { wind: 'ga_sweep', strike: 'ga_sweepW' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'doubleSmash', startup: 22, active: 6, recovery: 36, damage: 1600, reach: 0.8, radius: 0.45, lunge: 3, hitstun: 44, knock: 'smash', knockSpeed: 32, impact: 4, pose: { wind: 'ga_smashW', strike: 'ga_smash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'bodyCheck', startup: 14, active: 10, recovery: 30, damage: 1400, reach: 0.8, radius: 0.45, lunge: 14, hitstun: 36, knock: 'heavy', knockSpeed: 30, impact: 4, pose: { wind: 'ga_reach', strike: 'ga_smash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      throw: { id: 'crush', name: 'Crush', damage: 1800, knockSpeed: 30, poses: ['ga_reach', 'ga_hold', 'ga_throw'] },
    },
    specials: {
      special1: {
        id: 'mouthBeam', name: 'Mouth Beam', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 40, chargeMax: 60, damage: [2600, 3600], radius: [1.4, 2.2], speed: 90, range: 200, sustain: 40,
        color: 0xc070ff, core: 0xffffff, poses: { charge: 'ga_beamCharge', fire: 'ga_beamFire' }, recovery: 40, fromHead: true,
      },
      special2: {
        id: 'mouthBlast', name: 'Mouth Blast', type: 'projectile', kiCost: 20, icon: 'ball',
        startup: 26, recovery: 30, pose: { wind: 'ga_beamCharge', release: 'ga_beamFire' },
        projectile: { kind: 'ball', speed: 60, radius: 1.6, damage: 2200, homing: 0.8, color: 0xd090ff, core: 0xffffff, explode: 8, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
    },
    mechanic: { type: 'boss', name: 'Giant', desc: 'Huge poise, hit zones, and a tail that is its weak point.' },
    boss: {
      phases: [
        { id: 'rampage', label: 'RAMPAGE', hpAbove: 0.5, speed: 1, damage: 0.8, patience: 0.8, patterns: { melee: 0.8, stomp: 0.9, sweep: 0.7, grab: 0.6, beam: 0.35, roar: 0.25, beat: 0.2 } },
        { id: 'berserk', label: 'BERSERK', hpAbove: 0, speed: 1.2, damage: 0.95, patience: 0.5, enter: 'roar', patterns: { melee: 0.9, stomp: 1, sweep: 0.8, grab: 0.8, beam: 0.5, blast: 0.4 } },
      ],
      patterns: {
        stomp: { technique: 'stomp', maxDist: 26, cooldown: 240 },
        sweep: { technique: 'sweep', maxDist: 20, cooldown: 300 },
        grab: { technique: 'grab', maxDist: 13, cooldown: 480 },
        beam: { slot: 'special1', minDist: 16, hold: 50, cooldown: 540 },
        blast: { slot: 'special2', minDist: 14, cooldown: 360 },
        roar: { technique: 'roar', maxDist: 22, cooldown: 900 },
        beat: { technique: 'beat', minDist: 12, cooldown: 900 },
      },
      techniques: {
        stomp: { type: 'giantStomp', windup: 40, reach: 16, radius: 6, clearHeight: 2.6, damage: 2200, knockSpeed: 22, recovery: 44, poses: { wind: 'ga_stompW', strike: 'ga_stomp' } },
        sweep: { type: 'giantSweep', windup: 38, range: 18, half: 0.9, height: 4.5, damage: 2000, knockSpeed: 30, recovery: 40, poses: { wind: 'ga_sweepW', strike: 'ga_sweep' } },
        grab: { type: 'giantGrab', reach: 13, windup: 34, grabRadius: 3.2, grabHeight: 7, grabDamage: 300, holdFrames: 200, crushEvery: 36, crushDamage: 650, throwDamage: 1800, mashGain: 0.075, holdGain: 0.7, escapeDecay: 0.004, cpuEscape: 0.006, escapeStagger: 70, missRecovery: 40, recovery: 40, poses: { reach: 'ga_reach', hold: 'ga_hold', throw: 'ga_throw', miss: 'ga_winded' } },
        roar: { type: 'bossRoar', frames: 90, blastAt: 24, radius: 24, knockSpeed: 16, damage: 0, stunFrames: 80, stunHeight: 4, poses: { roar: 'ga_roar' } },
        beat: { type: 'bossTaunt', frames: 100, poses: { taunt: 'ga_chestBeat' } },
      },
    },
    ai: { personality: 'berserker', aggression: 0.7, defense: 0, ranged: 0.1, beam: 0.2, transformHp: 0, preferredRange: 6, hooks: 'boss' },
    barks: {},
    intro: { pose: 'ga_roar', expression: 'shout' },
    victory: { poses: ['ga_chestBeat'], expression: 'shout' },
    defeat: { pose: 'ga_winded', expression: 'hurt' },
  };

  /*
   * GREAT APE GOHAN — a child's rampage under the full moon. Same giant body
   * plan, hit zones and techniques; smaller, no armor (fur and the torn purple
   * gi), weaker and wilder: one phase, no beam, quicker to lash out.
   */
  const V = SL.data.characters.great_ape_vegeta;
  const GOHAN_FUR = 0x5a3a24;
  SL.data.characters.great_ape_gohan = Object.assign({}, V, {
    id: 'great_ape_gohan',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Great Ape Gohan',
    blurb: 'Four-year-old Gohan, transformed by the full moon. He has no idea what he is doing.',
    stats: Object.assign({}, V.stats, { hp: 30000, power: 0.95, defense: 1.1, speed: 0.6 }),
    poise: Object.assign({}, V.poise, { max: 160 }),
    appearance: Object.assign({}, V.appearance, {
      height: 5.0,
      skin: GOHAN_FUR,
      headExtras: V.appearance.headExtras.map((e) => Object.assign({}, e, { color: e.color === 0x4a2a16 ? 0x3e2414 : e.color })),
      outfit: {
        topStyle: 'gi', top: GOHAN_FUR, sleeves: 'none', arms: GOHAN_FUR, pants: 0x9a3a8e, pantsStyle: 'gi', legs: GOHAN_FUR, boots: 0x3e2414, bootStyle: 'gi', belt: 0xe6c24a,
        longTail: Object.assign({}, V.appearance.outfit.longTail, { color: GOHAN_FUR, length: 1.05 }),
      },
      portraitColor: '#9a3a8e',
    }),
    hitZones: V.hitZones.map((z) => Object.assign({}, z, z.id === 'tail' ? { hp: 3600 } : {})),
    specials: { special2: V.specials.special2 },
    boss: Object.assign({}, V.boss, {
      phases: [{ id: 'rampage', label: 'RAMPAGE', hpAbove: 0, speed: 0.9, damage: 0.55, patience: 0.9, patterns: { melee: 0.9, stomp: 0.9, sweep: 0.6, grab: 0.5, blast: 0.3, roar: 0.3, beat: 0.25 } }],
      patterns: Object.assign({}, V.boss.patterns),
    }),
  });
  delete SL.data.characters.great_ape_gohan.boss.patterns.beam;

  /*
   * GREAT APE GOHAN (PLAYED) — "The Saiyan Prince": Gohan's tail has grown back,
   * he sees Vegeta's Power Ball and the player takes the rampage. Same body, hit
   * zones and giant techniques as the boss, mapped onto buttons:
   *   Light swats · Heavy smashes · dash body-checks · Guard + Heavy grabs and
   *   crushes · Special 1 stomps · Special 2 mouth blast · Ultimate roars ·
   *   the skill wheel holds the arm sweep.
   * The techniques telegraph on the ground exactly as they do for the boss (the
   * enemy can read them too); from a button they cost ki and have cooldowns.
   * Story only (playable: false): not in character select.
   */
  const G = SL.data.characters.great_ape_gohan;
  const T = V.boss.techniques;
  const played = Object.assign({}, G, {
    id: 'great_ape_gohan_player',
    blurb: 'Gohan under the Power Ball, and this time you are the monster. Keep the little Saiyan away from your tail.',
    stats: Object.assign({}, G.stats, { hp: 30000, power: 1, defense: 1.1, speed: 0.75, kiRegen: 6 }),
    // turns toward its target at most 1.3 radians (about 75 degrees) a second: a flying Vegeta can get behind it
    turnSpeed: 1.3,
    poise: Object.assign({}, G.poise, { breakFrames: 120 }),
    hitZones: V.hitZones.map((z) => Object.assign({}, z, z.id === 'tail' ? { hp: 4200 } : {})),
    moves: Object.assign({}, V.moves, {
      throw: Object.assign({ technique: 'giantGrab', id: 'crush', name: 'Crush' }, T.grab, { windup: 22, holdFrames: 150, crushEvery: 30, crushDamage: 700, missRecovery: 34 }),
    }),
    specials: {
      special1: Object.assign({ id: 'stomp', name: 'Stomp', kiCost: 0, cooldown: 110, icon: 'fist' }, T.stomp, { windup: 24, recovery: 30 }),
      special2: V.specials.special2,
      ultimate: Object.assign({ id: 'roar', name: 'Roar', kiCost: 50, cooldown: 480, icon: 'ultimate', ultimate: true }, T.roar),
    },
    extras: [Object.assign({ id: 'sweep', name: 'Arm Sweep', kiCost: 0, cooldown: 90, icon: 'rush' }, T.sweep, { windup: 22, recovery: 28 })],
    ai: { personality: 'berserker', aggression: 0.8, defense: 0, ranged: 0.2, beam: 0, transformHp: 0, preferredRange: 6 },
  });
  delete played.boss;
  delete played.mechanic;
  SL.data.characters.great_ape_gohan_player = played;
})();
