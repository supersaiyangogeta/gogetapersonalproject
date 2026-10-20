/*
 * ANDROIDS 13, 14 AND 15 (movie: "Super Android 13!") — MOVIE continuity, Free Battle only. Dr. Gero's computer
 * finished them after his death; they wear the Red Ribbon's colours like workmen.
 *
 *   ANDROID 13   from the owner's visual reference (p.214–215): long white hair under a trucker's cap with the Red
 *                Ribbon badge, an olive vest open over a bare chest, dark green baggy trousers, red-brown gloves,
 *                grey boots. A heavy hitter. SUPER 13 (p.215): he takes in the other two cores — blue skin, a flame of
 *                orange-red hair, grey plates over a body twice the size, the cap gone. The S.S. Deadly Bomber.
 *   ANDROID 14   built from memory (the board has no picture): the tallest — pale, long black hair, the same
 *                Red Ribbon working clothes. A silent brute that rams.
 *   ANDROID 15   built from memory: the shortest — purple skin, round black sunglasses, a black cap. Quick and
 *                ranged, he never stops shooting.
 *
 * All three run on Gero's reactor (the 'tireless' mechanic). Level 1 prototypes on the shared rig.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const A17 = C.android_17;
  const RR_RED = 0xd01a1a, VEST = 0x6a6a2a, TROUSERS = 0x2c5a2c, BOOTS = 0x6a7078, GLOVES = 0x8a3a1e, CAP = 0xc0a83a;
  const tireless = (desc) => ({ type: 'tireless', name: 'Infinite Energy', desc });

  // a trucker's cap: the crown is the engine's cap dome (outfit.cap); the brim and the Red Ribbon badge are
  // head-extras, so a form can take them off
  const cap = () => [
    { shape: 'ball', a: [0, 0.52, 0.86], d: [0, 0.3, 1], l: 0.01, r: 0.085, color: 0x2a4a2a, depth: 1.0, flat: 0.2, outline: 0.5 },
    { shape: 'ball', a: [0, 0.76, 0.62], d: [0, 0.4, 1], l: 0.01, r: 0.03, color: RR_RED, depth: 1.02, flat: 0.3, outline: 0.3 },
  ];

  const poses = {
    // hands in his pockets, weight on one leg, a grin: a trucker with time to kill
    a13_idle: (t) => {
      const b = Math.sin(t * 1.5);
      return {
        root: { y: b * 0.004 }, hips: [0, 8, 6], spine: [2, 0, -4], chest: [-2 + b * 0.6, -6, 0], head: [-6, 10, 6],
        shoulderL: [10, 0, 14], elbowL: [-30, 0, 0], shoulderR: [10, 0, -14], elbowR: [-30, 0, 0],
        thighL: [-2, 4, 4], kneeL: [4, 0, 0], thighR: [8, -10, -12], kneeR: [14, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // Super 13: arms out and down, fists clenched, roaring at nothing
    a13_superIdle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.08 + b * 0.01 }, spine: [10, 0, 0], chest: [10 + b, 0, 0], head: [-6, 0, 0],
        shoulderL: [-20, 0, 46], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -46], elbowR: [-40, 0, 0],
        thighL: [-20, 12, 22], kneeL: [32, 0, 0], thighR: [-20, -12, -22], kneeR: [32, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // the Deadly Bomber: a red sphere grown between both hands over his head, then thrown
    a13_bomberW: (t) => ({ root: { y: -0.02 }, spine: [-8, 0, 0], chest: [-12 + Math.sin(t * 28), 0, 0], head: [-20, 0, 0], shoulderL: [-170, 0, 26], elbowL: [-30, 0, 0], shoulderR: [-170, 0, -26], elbowR: [-30, 0, 0], thighL: [-6, 0, 14], kneeL: [10, 0, 0], thighR: [-6, 0, -14], kneeR: [10, 0, 0], hands: ['open', 'open'] }),
    a13_bomber: { root: { y: -0.08, rx: 14 }, spine: [14, 0, 0], chest: [18, 0, 0], head: [0, 0, 0], shoulderL: [-90, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-90, 0, -20], elbowR: [-10, 0, 0], thighL: [-30, 0, 14], kneeL: [40, 0, 0], thighR: [6, 0, -14], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    // the bear hug
    a13_hugW: { root: { y: -0.06, rx: 10 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [0, 0, 0], shoulderL: [-70, 0, 60], elbowL: [-50, 0, 0], shoulderR: [-70, 0, -60], elbowR: [-50, 0, 0], thighL: [-20, 0, 16], kneeL: [30, 0, 0], thighR: [-20, 0, -16], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    a13_hug: { root: { y: 0.02, rx: -14 }, spine: [-12, 0, 0], chest: [-14, 0, 0], head: [-10, 0, 0], shoulderL: [-80, -30, 30], elbowL: [-100, 0, 0], shoulderR: [-80, 30, -30], elbowR: [-100, 0, 0], thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [-6, 0, -12], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    // 14: arms hanging, still as a wall
    a14_idle: { root: { y: -0.02 }, spine: [4, 0, 0], chest: [4, 0, 0], head: [2, 0, 0], shoulderL: [-4, 0, 14], elbowL: [-10, 0, 0], shoulderR: [-4, 0, -14], elbowR: [-10, 0, 0], thighL: [-2, 4, 10], kneeL: [4, 0, 0], thighR: [-2, -4, -10], kneeR: [4, 0, 0], hands: ['fist', 'fist'] },
    // 15: hands on his hips, chin up, a smug little laugh
    a15_idle: (t) => {
      const b = Math.sin(t * 2.6);
      return {
        root: { y: b * 0.006 }, spine: [-6, 0, 0], chest: [-8 + b, 0, 0], head: [-12, 0, 0],
        shoulderL: [-10, 0, 40], elbowL: [-96, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-96, 0, 0],
        thighL: [-2, 6, 12], kneeL: [4, 0, 0], thighR: [-2, -6, -12], kneeR: [4, 0, 0], hands: ['fist', 'fist'],
      };
    },
  };
  const P = Object.assign({}, A17.poses, poses);
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 12, active: 4, recovery: 22, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const outfit = (o) => Object.assign({
    topStyle: 'bare', jacket: { color: VEST, open: 1.6 }, pants: TROUSERS, pantsStyle: 'harem',
    gloves: GLOVES, boots: BOOTS, bootTip: 0x3a3e46, bootStyle: 'saiyan',
  }, o);

  /* ============================================================== ANDROID 13 */
  const A13_SKIN = 0xf0c098;
  C.android_13 = {
    id: 'android_13', assetLevel: 1, name: 'Android 13', fullName: 'Android 13 (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Heavy Hitter · Super 13',
    card: ['Movie', 'Super Android 13!'],
    blurb: 'Gero\'s last order carried out by a machine: kill Goku. He fights like a dockhand — and he has two spare cores.',
    ratings: { power: 4, speed: 3, ki: 3, defense: 4 },
    stats: { hp: 20000, ki: 130, stamina: 140, speed: 1.02, power: 1.2, defense: 1.15, weight: 1.2, kiRegen: 3, chargeRate: 34, canonPower: 4 },
    appearance: {
      height: 1.04, skin: A13_SKIN,
      build: { chestW: 0.23, chestD: 0.15, shoulderX: 0.23, waistW: 0.14, upperArmR: 0.064, foreArmR: 0.056, thighR: 0.09, shinR: 0.066, headR: 0.122 },
      hair: { style: 'a17', color: 0xe8e8ee },
      headExtras: cap(),
      face: { pupil: 0x3a6ab8, browThick: 1.0, brow: 0xd8d8e0, jaw: 1.08, mouthColor: 0x8a3a3a },
      outfit: outfit({ cap: CAP }),
      // Super 13's grey plates (built to the form's bulk 1.4 and muscle 1.45): over the pecs, and the great domes on the
      // shoulders
      props: [
        { id: 'plateL', joint: 'chest', shape: 'ball', pos: [0.11, 0.18, 0.205], rot: [-0.25, 0.35, 0], size: [0.12, 0.085, 0.045], color: 0x9a9aa6, forms: ['super13'] },
        { id: 'plateR', joint: 'chest', shape: 'ball', pos: [-0.11, 0.18, 0.205], rot: [-0.25, -0.35, 0], size: [0.12, 0.085, 0.045], color: 0x9a9aa6, forms: ['super13'] },
        { id: 'domeL', joint: 'shoulderL', shape: 'ball', pos: [0.02, 0.02, 0], size: [0.16, 0.13, 0.155], color: 0x9a9aa6, forms: ['super13'] },
        { id: 'domeR', joint: 'shoulderR', shape: 'ball', pos: [-0.02, 0.02, 0], size: [0.16, 0.13, 0.155], color: 0x9a9aa6, forms: ['super13'] },
      ],
      portraitColor: '#6a6a2a',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} },
      {
        // the two spare cores taken in: blue skin, a flame of red hair, grey plates, the cap and vest gone
        id: 'super13', name: 'Super 13', short: 'SUPER 13', kiCost: 60, style: 'full',
        aura: { color: 0xff5a2a, core: 0xffd8b0, particles: 0xff8a4a, idle: 0.45, speed: 1.4, sharp: 0.35 },
        mult: { damage: 1.85, speed: 1.04, defense: 1.75, kiRegen: 1.3, chargeRate: 1.2, guardStamina: 1.4 },
        look: {
          scale: 1.26, bulk: 1.4, muscle: 1.45,
          skin: 0x2a5ad8, swap: { [VEST]: 0x9a9aa6, [CAP]: 0xff5a1a }, pupil: 0xffffff, pupilScale: 0.05, brow: 0x1a3a9a,
          hair: { style: 'goku_ssj', color: 0xff5a1a },
          // the cap is gone with the change (it came down over his eyes as orange); grey plates over the chest and the
          // great grey domes on the shoulders are his (props of this form, 2026-10-15 visual pass, the board p.215)
          headExtras: [], cap: false,
        },
        sequence: {
          length: 168,
          applyAt: 104,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 6, expression: 'grit', aura: 0.4, shot: 'orbit', sfx: 'rumble', shake: 0.4 },
            { at: 50, pose: 'powerUp', speed: 7, expression: 'shout', aura: 0.8, quake: 0.5, sfx: 'roar' },
            { at: 104, burst: true, sfx: 'transformBurst', flash: 0.45, crater: 5 },
            { at: 136, pose: 'a13_superIdle', speed: 6, expression: 'angry', shot: 'face' },
          ],
        },
        practiced: { length: 90, applyAt: 48, steps: [{ at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.6, quake: 0.2, sfx: 'kiUp' }, { at: 48, burst: true, pose: 'powerUp', speed: 12, expression: 'shout', flash: 0.35, crater: 3.5 }, { at: 76, pose: 'a13_superIdle', expression: 'angry' }] },
        poses: { idle: poses.a13_superIdle },
        ai: { aggression: 0.92, defense: 0.35, ranged: 0.3, beam: 0, preferredRange: 2 },
      },
    ],
    poses: Object.assign({}, P, { idle: poses.a13_idle }),
    moves: {
      light: [
        lt('a13Jab', 'punchWindR', 'punchR', 520),
        lt('a13Hook', 'punchWindL', 'punchL', 560, { hitPose: 'hitSideR' }),
        lt('a13Knee', 'a17_kickW', 'a17_kick', 640, { startup: 7, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('a13Hammer', 'hammerWind', 'hammer', 1400, { knock: 'smash', knockSpeed: 36, armor: true, guardCrush: true, guardDamage: 50 }),
        2: hv('a13Upper', 'uppercutWind', 'uppercut', 1200, { startup: 10, knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('a13Ram', 'punchWindR', 'punchR', 980, { startup: 5, active: 10, recovery: 18, lunge: 34, hitstun: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'a13Hug', name: 'Bear Hug', damage: 1500, knockSpeed: 20, poses: ['a13_hugW', 'a13_hug', 'hammer'] },
    },
    specials: {
      // ENERGY SHOT: one heavy red shot from the palm
      special1: {
        id: 'a13Shot', name: 'Energy Shot', type: 'projectile', kiCost: 24, icon: 'ball',
        startup: 12, recovery: 18, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 62, radius: 0.7, damage: 1700, homing: 0.6, color: 0xff3a3a, core: 0xffe0d0, explode: 4, knock: 'heavy', knockSpeed: 22, impact: 3, life: 2.6 },
      },
      // CRUSHER RUSH: in close — hook, knee, both fists down
      special2: {
        id: 'a13Rush', name: 'Crusher Rush', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 8, dashFrames: 22, speed: 54, armor: true, recovery: 22,
        poses: { wind: 'punchWindR' },
        hits: [
          { pose: 'punchL', damage: 560, frames: 10, sfx: 'punchHeavy' },
          { pose: 'a17_kick', damage: 600, frames: 10, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 1300, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 },
        ],
      },
      // S.S. DEADLY BOMBER: a red sphere grown over his head and thrown
      ultimate: {
        id: 'a13Bomber', name: 'S.S. Deadly Bomber', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 48, recovery: 42, pose: { wind: 'a13_bomberW', release: 'a13_bomber' },
        projectile: { kind: 'ball', speed: 32, radius: 2.4, damage: 5200, homing: 0.6, color: 0xff2a3a, core: 0xffd8d0, explode: 13, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.5 },
      },
    },
    mechanic: tireless('Gero\'s reactor: he does not tire and his ki refills. Waiting him out is not a plan.'),
    blast: { color: 0xff4a4a, core: 0xffe0d0, damage: 220, speed: 60, radius: 0.32 },
    ai: { personality: 'aggressive', aggression: 0.78, defense: 0.5, ranged: 0.3, beam: 0, transformHp: 0.55, preferredRange: 2.2 },
    intro: { pose: 'a13_idle', expression: 'grin' },
    victory: { poses: ['a13_idle'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== ANDROID 14 */
  const A14_SKIN = 0xf2eae6;
  C.android_14 = {
    id: 'android_14', assetLevel: 1, name: 'Android 14', fullName: 'Android 14 (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Silent Brute',
    card: ['Movie', 'Super Android 13!'],
    blurb: 'The biggest of the three and the quietest. He does not talk; he walks through things.',
    ratings: { power: 4, speed: 2, ki: 2, defense: 5 },
    stats: { hp: 22000, ki: 120, stamina: 160, speed: 0.94, power: 1.2, defense: 1.3, weight: 1.5, kiRegen: 2.6, chargeRate: 30, canonPower: 3.5 },
    poise: { max: 70, regen: 14, regenDelay: 100, armor: 1, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.2, skin: A14_SKIN,
      build: { chestW: 0.26, chestD: 0.17, shoulderX: 0.26, waistW: 0.17, upperArmR: 0.075, foreArmR: 0.066, thighR: 0.1, shinR: 0.076, headR: 0.12, neckR: 0.07 },
      hair: { style: 'a17', color: 0x141418 },
      face: { pupil: 0x6a1a1a, browThick: 1.5, brow: 0x141418, jaw: 1.18, jawW: 1.08, eyeH: 0.8 },
      outfit: outfit({ jacket: { color: 0x2a3a2a, open: 1.4 }, boots: 0x1e1e24 }),
      portraitColor: '#2a3a2a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }],
    poses: Object.assign({}, P, { idle: poses.a14_idle }),
    moves: {
      light: [
        lt('a14Swing', 'punchWindR', 'punchR', 600, { startup: 8, recovery: 15, cancel: 10 }),
        lt('a14Swing2', 'punchWindL', 'punchL', 620, { startup: 8, recovery: 15, cancel: 10, hitPose: 'hitSideR' }),
        lt('a14Kick', 'kickWindR', 'kickR', 720, { startup: 9, reach: 1.4, recovery: 17, hitstun: 28, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('a14Crush', 'hammerWind', 'hammer', 1600, { startup: 14, recovery: 26, knock: 'smash', knockSpeed: 38, impact: 4, armor: true, guardCrush: true, guardDamage: 60 }),
      },
      dash: hv('a14Ram', 'punchWindR', 'punchR', 1100, { startup: 7, active: 12, recovery: 20, lunge: 30, hitstun: 30, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'a14Lift', name: 'Lift and Drop', damage: 1600, knockSpeed: 18, poses: ['a13_hugW', 'a13_hug', 'hammer'] },
    },
    specials: {
      // HEAVY SHOT: slow, wide, it pushes through a guard
      special1: {
        id: 'a14Shot', name: 'Heavy Shot', type: 'projectile', kiCost: 26, icon: 'ball',
        startup: 18, recovery: 22, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'heavy', speed: 46, radius: 0.95, damage: 1900, homing: 0.5, color: 0xffa040, core: 0xfff0d0, explode: 5, knock: 'heavy', knockSpeed: 24, impact: 3, guardPierce: 0.5, life: 3 },
      },
      // WALKING WALL: he lowers his head and does not stop
      special2: {
        id: 'a14Wall', name: 'Walking Wall', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 10, dashFrames: 28, speed: 44, armor: true, recovery: 26,
        poses: { wind: 'a13_hugW' },
        hits: [
          { pose: 'punchR', damage: 700, frames: 12, sfx: 'punchHeavy' },
          { pose: 'punchL', damage: 700, frames: 12, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 1500, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 },
        ],
      },
      // DEMOLITION: the whole frame thrown into one beating
      ultimate: {
        id: 'a14Demolition', name: 'Demolition', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 12, dashFrames: 20, speed: 58, armor: true, recovery: 32,
        poses: { wind: 'a13_hugW' },
        hits: [
          { pose: 'a13_hug', damage: 900, frames: 14, sfx: 'punchHeavy' },
          { pose: 'uppercut', damage: 1100, frames: 12, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 14, impact: 3 },
          { pose: 'hammer', damage: 3200, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 44, impact: 5 },
        ],
      },
    },
    mechanic: tireless('The same reactor as 13: he never tires and his ki refills.'),
    ai: { personality: 'berserker', aggression: 0.7, defense: 0.55, ranged: 0.25, beam: 0, transformHp: 0, preferredRange: 1.8 },
    intro: { pose: 'a14_idle', expression: 'neutral' },
    victory: { poses: ['a14_idle'], expression: 'neutral' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== ANDROID 15 */
  const A15_SKIN = 0x8a6ac8;
  C.android_15 = {
    id: 'android_15', assetLevel: 1, name: 'Android 15', fullName: 'Android 15 (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Quick · Ranged',
    card: ['Movie', 'Super Android 13!'],
    blurb: 'The smallest of the three, behind sunglasses, laughing. He keeps his distance and keeps shooting.',
    ratings: { power: 2, speed: 4, ki: 4, defense: 2 },
    stats: { hp: 15000, ki: 150, stamina: 120, speed: 1.14, power: 1.0, defense: 0.9, weight: 0.8, kiRegen: 3.6, chargeRate: 38, canonPower: 3 },
    appearance: {
      height: 0.8, skin: A15_SKIN,
      build: { chestW: 0.2, chestD: 0.15, shoulderX: 0.2, waistW: 0.16, waistD: 0.14, upperArmR: 0.054, foreArmR: 0.048, thighR: 0.08, shinR: 0.06, headR: 0.13 },
      hair: { style: 'bald', color: A15_SKIN },
      headExtras: cap(),
      face: { pupil: 0x141414, browThick: 0.9, brow: 0x3a2a5a, jaw: 1.04, cheeks: 1.2, mouthColor: 0x3a1a4a },
      outfit: outfit({ cap: 0x1e1e24, shades: 0x101014, jacket: { color: 0x8a6a2a, open: 1.2 } }),
      portraitColor: '#8a6ac8',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }],
    poses: Object.assign({}, P, { idle: poses.a15_idle }),
    moves: {
      light: [
        lt('a15Jab', 'a17_jabW', 'a17_jab', 420, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }),
        lt('a15Jab2', 'punchWindL', 'punchL', 440, { startup: 5, recovery: 11, cancel: 7, sfx: 'punchLight' }),
        lt('a15Kick', 'a17_kickW', 'a17_kick', 520, { startup: 6, reach: 1.3, recovery: 13, hitstun: 24, knock: 'push', knockSpeed: 12, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('a15Butt', 'uppercutWind', 'uppercut', 1000, { startup: 9, knock: 'launch', knockSpeed: 20 }),
      },
      dash: hv('a15Dart', 'a17_jabW', 'a17_jab', 700, { startup: 3, active: 8, recovery: 12, lunge: 40, hitstun: 24, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'a15Toss', name: 'Toss', damage: 900, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // RAPID FIRE: three shots fanned from the palm, again and again
      special1: {
        id: 'a15Rapid', name: 'Rapid Fire', type: 'projectile', kiCost: 18, icon: 'blast', cooldown: 50,
        startup: 8, recovery: 12, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'blast', count: 3, spread: 0.35, speed: 84, radius: 0.3, damage: 600, homing: 0.35, color: 0xd07aff, core: 0xffffff, explode: 1.6, knock: 'push', knockSpeed: 10, impact: 1, life: 2 },
      },
      // SLIP AWAY: gone, and somewhere he can shoot from
      special2: {
        id: 'a15Slip', name: 'Slip Away', type: 'teleport', kiCost: 14, icon: 'teleport',
        startup: 5, recovery: 8, cooldown: 50, escapeKiCost: 26, followWindow: 30, followBonus: 1.2, pose: 'a17_jab',
        modes: { away: true, behind: true },
      },
      // ENDLESS BARRAGE: a ball thrown up that breaks into shots over everything
      ultimate: {
        id: 'a15Barrage', name: 'Endless Barrage', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 20, rise: 22, height: 9, count: 16, damage: 620, speed: 62, range: 60, recovery: 24,
        color: 0xd07aff, poses: { wind: 'a17_barrierW', fire: 'a17_barrier' },
      },
    },
    mechanic: tireless('The same reactor: he never tires and his ki refills — he can shoot all day.'),
    blast: { color: 0xd07aff, core: 0xffffff, damage: 210, speed: 64, radius: 0.3 },
    ai: { personality: 'gunner', aggression: 0.45, defense: 0.55, ranged: 0.75, beam: 0, transformHp: 0, preferredRange: 7 },
    intro: { pose: 'a15_idle', expression: 'grin' },
    victory: { poses: ['a15_idle'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
