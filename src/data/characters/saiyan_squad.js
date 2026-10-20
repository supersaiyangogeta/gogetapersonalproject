/*
 * THE SAIYANS (roster continuation, 2026-10-14) — fighters built on the Saiyan body from the owner's visual reference
 * (dbz visual reference.pdf: Tarble p.5, Fasha p.6, Tora p.7, Shugesh p.8, Turles p.71):
 *
 *   TORA     Bardock's partner: big, blue-plated, bare-legged. A shoulder-first brawler who throws people.
 *   FASHA    the squad's fastest: magenta suit, green plates, white gloves. Kicks, and three shots at once.
 *   SHUGESH  grey-skinned and bald with two blond tufts: slow, armoured, lands on you from above.
 *   TARBLE   Vegeta's small, gentle brother: weak, quick, slips away rather than trades.
 *   TURLES   (MOVIE: "The Tree of Might") a Saiyan with Goku's face, dark armour and a white cape. He eats the
 *            fruit of the Tree of Might: one fruit heals him, and its power is a form of its own.
 *
 * ...and the kits Gine and King Vegeta never had (super_broly_cast.js keeps their bodies and the prologue's poses):
 *   GINE         a butcher, not a soldier: a cleaver of a hand, and rations she throws to whoever needs them.
 *   KING VEGETA  the king: a royal blaster, a rush that does not stop for a reply, a cannon from both hands.
 *
 * The squad (Tora, Fasha, Shugesh) sits with Bardock under 'Planet Vegeta'. Turles is movie continuity and Tarble
 * comes from the OVA: both are Free Battle only and never placed in the canon chronology. Level 1 prototypes on the
 * shared procedural rig; Bardock's brawling animations are reused where the reference fighting style is the same.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const BD = C.bardock, GK = C.goku, VG = C.vegeta;

  // a light hit / a heavy hit, written short: everything not given is the Saiyan brawler's default
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.15, radius: 0.78, lunge: 10, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 11, active: 4, recovery: 22, damage, reach: 1.2, radius: 0.95, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 2, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const scouter = (lens) => ({ lens, body: 0xd8d8d8 });

  /* ============================================================== TORA */
  const TO_SKIN = 0xd49a6e, TO_BLUE = 0x3a6ec8, TO_SUIT = 0x16181e;
  const toPoses = {
    // shoulders rolled forward, fists low, a wide stance: a man who walks into punches
    to_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.05 + b * 0.008 }, hips: [0, -10, 0], spine: [8, 0, 0], chest: [6 + b, -6, 0], head: [2, 8, 0],
        shoulderL: [-30, 0, 30], elbowL: [-70, 0, 0], shoulderR: [-24, 0, -28], elbowR: [-62, 0, 0],
        thighL: [-16, 12, 18], kneeL: [26, 0, 0], thighR: [10, -12, -18], kneeR: [20, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // the bear hug: both arms round, lifting
    to_hugW: { root: { y: -0.06, rx: 10 }, spine: [12, 0, 0], chest: [10, 0, 0], head: [0, 0, 0], shoulderL: [-70, 0, 60], elbowL: [-50, 0, 0], shoulderR: [-70, 0, -60], elbowR: [-50, 0, 0], thighL: [-20, 0, 16], kneeL: [30, 0, 0], thighR: [-20, 0, -16], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    to_hug: { root: { y: 0.02, rx: -14 }, spine: [-12, 0, 0], chest: [-14, 0, 0], head: [-10, 0, 0], shoulderL: [-80, -30, 30], elbowL: [-100, 0, 0], shoulderR: [-80, 30, -30], elbowR: [-100, 0, 0], thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [-6, 0, -12], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
  };
  C.tora = {
    id: 'tora', assetLevel: 1, name: 'Tora', fullName: 'Tora (Bardock\'s squad)', era: 'Planet Vegeta',
    playable: true, prototype: true, style: 'Brawler · Grappler',
    card: ['Planet Vegeta', 'Bardock\'s squad'],
    blurb: 'Bardock\'s oldest partner. Big, blunt and loyal — he goes through the front of a fight shoulder first.',
    ratings: { power: 4, speed: 2, ki: 2, defense: 4 },
    stats: { hp: 15000, ki: 100, stamina: 120, speed: 0.92, power: 1.08, defense: 1.08, weight: 1.2, kiRegen: 2, chargeRate: 32, canonPower: 0.7 },
    appearance: {
      height: 1.04, skin: TO_SKIN,
      build: { chestW: 0.235, chestD: 0.15, shoulderX: 0.235, waistW: 0.145, upperArmR: 0.066, foreArmR: 0.058, thighR: 0.094, shinR: 0.068, headR: 0.122 },
      hair: { style: 'yamcha', color: 0x141418 },
      face: { pupil: 0x141414, browThick: 1.4, jaw: 1.1, jawW: 1.04 },
      outfit: {
        topStyle: 'armor', top: TO_SUIT, arms: TO_SKIN, pants: TO_SUIT, pantsStyle: 'tight', thighs: TO_SKIN, legs: TO_SKIN,
        wrist: TO_SUIT, boots: TO_SUIT, bootTip: TO_BLUE, bootStyle: 'saiyan',
        // (2026-10-16, the board p.7: the old armour's big pointed shoulder flaps and the long tassets, both ribbed blue —
        // the flaps were small ellipsoids hidden in the shoulders and the tassets short)
        armor: { plate: TO_SUIT, belly: TO_BLUE, pads: TO_BLUE, padStyle: 'saga', padScale: 1.15, hipGuards: TO_BLUE, hipStyle: 'long', trim: TO_BLUE },
        ribs: { color: TO_BLUE, every: 0.04 },
        scouter: scouter(0x3cff78),
        tail: 0x5a321a,
      },
      portraitColor: '#3a6ec8',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }],
    poses: Object.assign({}, BD.poses, toPoses, { idle: toPoses.to_idle }),
    moves: {
      light: [
        lt('toJab', 'punchWindR', 'punchR', 400, { sfx: 'punchHeavy' }),
        lt('toBody', 'b_bodyW', 'b_body', 430, { hitPose: 'hitBody' }),
        lt('toHead', 'b_headbuttW', 'b_headbutt', 520, { startup: 8, recovery: 17, hitstun: 30, knock: 'push', knockSpeed: 8, impact: 2 }),
      ],
      heavy: {
        0: hv('toShoulder', 'b_shoulderW', 'b_shoulder', 900, { startup: 12, active: 6, lunge: 22, guardCrush: true, guardDamage: 50, armor: true, hitPose: 'hitBody' }),
        3: hv('toHammer', 'hammerWind', 'hammer', 1050, { startup: 13, recovery: 24, knock: 'smash', knockSpeed: 36, impact: 3 }),
      },
      dash: hv('toRam', 'b_shoulder', 'b_shoulder', 820, { startup: 6, active: 10, recovery: 18, lunge: 32, armor: true, hitPose: 'hitBody' }),
      // the bear hug: lifted off the ground and crushed
      throw: { id: 'toHug', name: 'Bear Hug', damage: 1500, knockSpeed: 20, poses: ['to_hugW', 'to_hug', 'b_headbutt'] },
    },
    specials: {
      // TORA CANNON: one hand, one heavy shot that goes through a guard
      special1: {
        id: 'toCannon', name: 'Tora Cannon', type: 'projectile', kiCost: 26, icon: 'ball',
        startup: 14, recovery: 20, pose: { wind: 'throwWind', release: 'throwRelease' },
        projectile: { kind: 'heavy', speed: 66, radius: 0.7, damage: 1700, homing: 0.4, color: 0x9ad0ff, core: 0xffffff, explode: 4, knock: 'heavy', knockSpeed: 22, impact: 3, guardPierce: 0.4, life: 2.4 },
      },
      // SHOULDER CRUSH: he does not stop running — shoulder, knee, hammer
      special2: {
        id: 'toCrush', name: 'Shoulder Crush', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 9, dashFrames: 26, speed: 46, armor: true, recovery: 22,
        poses: { wind: 'b_shoulderW', dash: 'b_shoulder' },
        hits: [
          { pose: 'b_shoulder', damage: 520, frames: 12, sfx: 'punchHeavy' },
          { pose: 'b_kneeLift', damage: 480, frames: 12, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 1000, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 3 },
        ],
      },
      // FULL-POWER ENERGY BALL: everything he has, thrown overhand
      ultimate: {
        id: 'toFullPower', name: 'Full-Power Energy Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 40, recovery: 40, pose: { wind: 'throwWind', release: 'throwRelease' },
        projectile: { kind: 'ball', speed: 34, radius: 1.9, damage: 4600, homing: 0.6, color: 0x7ab8ff, core: 0xf0f8ff, explode: 10, knock: 'smash', knockSpeed: 40, impact: 5, life: 4 },
      },
    },
    ai: { personality: 'berserker', aggression: 0.75, defense: 0.5, ranged: 0.25, beam: 0, transformHp: 0, preferredRange: 1.8 },
    intro: { pose: 'b_fistCrack', expression: 'grin' },
    victory: { poses: ['to_idle'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== FASHA */
  const FA_SKIN = 0xe0aa80, FA_SUIT = 0xb02a6a, FA_GREEN = 0x1f4a3a, FA_GOLD = 0xe0b030;
  const faPoses = {
    // weight on one hip, a fist on it, the other hand loose: bored with you already
    fa_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: b * 0.006 }, hips: [0, 8, 6], spine: [-2, 0, -4], chest: [-2 + b, -4, 0], head: [-4, 10, 4],
        shoulderL: [-10, 0, 40], elbowL: [-96, 0, 0], shoulderR: [-36, 0, -14], elbowR: [-60, 0, 0],
        thighL: [-4, 4, 4], kneeL: [6, 0, 0], thighR: [6, -10, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'],
      };
    },
    fa_highW: { root: { y: 0.02, rx: -6 }, spine: [-8, -14, 0], chest: [-8, -18, 0], head: [-6, 18, 0], shoulderL: [-40, 0, 40], elbowL: [-80, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-60, 0, 0], thighR: [-60, 0, -20], kneeR: [100, 0, 0], thighL: [4, 0, 6], kneeL: [10, 0, 0], hands: ['fist', 'fist'] },
    fa_high: { root: { y: 0.06, rx: -18 }, spine: [-14, 18, 0], chest: [-14, 22, 0], head: [-10, -16, 0], shoulderL: [-30, 0, 60], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -70], elbowR: [-30, 0, 0], thighR: [-120, 0, -16], kneeR: [6, 0, 0], footR: [10, 0, 0], thighL: [10, 0, 6], kneeL: [12, 0, 0], hands: ['fist', 'fist'] },
    // three fingers' worth: both hands forward, splayed
    fa_volleyW: { root: { y: -0.02 }, spine: [-4, -10, 0], chest: [-6, -14, 0], head: [-4, 12, 0], shoulderR: [-60, 0, 40], elbowR: [-110, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-110, 0, 0], thighL: [-12, 6, 12], kneeL: [14, 0, 0], thighR: [8, -6, -12], kneeR: [10, 0, 0], hands: ['open', 'open'] },
    fa_volley: { root: { y: -0.02, rx: 4 }, spine: [2, 8, 0], chest: [4, 10, 0], head: [-6, -8, 0], shoulderR: [-90, 0, -12], elbowR: [-6, 0, 0], shoulderL: [-84, 0, 14], elbowL: [-8, 0, 0], thighL: [-16, 6, 12], kneeL: [20, 0, 0], thighR: [10, -6, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] },
  };
  C.fasha = {
    id: 'fasha', assetLevel: 1, name: 'Fasha', fullName: 'Fasha (Selypa, Bardock\'s squad)', era: 'Planet Vegeta',
    playable: true, prototype: true, style: 'Speed · Kicks',
    card: ['Planet Vegeta', 'Bardock\'s squad'],
    blurb: 'The squad\'s fastest and sharpest. She kicks before you have finished deciding to block.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 2 },
    stats: { hp: 12000, ki: 110, stamina: 110, speed: 1.12, power: 0.95, defense: 0.9, weight: 0.85, kiRegen: 2.4, chargeRate: 36, canonPower: 0.6 },
    appearance: {
      height: 0.92, skin: FA_SKIN,
      build: { chestW: 0.18, chestD: 0.12, shoulderX: 0.18, waistW: 0.11, waistD: 0.1, pelvisW: 0.14, upperArmR: 0.046, foreArmR: 0.04, fist: 0.044, thighR: 0.076, shinR: 0.056, headR: 0.122, neckR: 0.046 },
      hair: { style: 'videl_short', color: 0x2a1a14 },
      face: { pupil: 0x3a2a5a, eyeW: 1.08, eyeH: 1.04, lashWing: true, browThick: 0.85, jaw: 0.95 },
      outfit: {
        topStyle: 'armor', top: FA_SUIT, arms: FA_SKIN, pants: FA_SUIT, pantsStyle: 'tight', thighs: FA_SKIN, legs: FA_SKIN,
        legBands: FA_GREEN, gloves: 0xf0eee6, boots: 0xf0eee6, bootTip: FA_GOLD, bootStyle: 'saiyan',
        armor: { plate: FA_GREEN, belly: FA_GOLD, pads: FA_GREEN, padStyle: 'strap', trim: 0xf0eee6 },
        scouter: scouter(0x3cff78),
        tail: 0x5a321a,
      },
      props: [{ id: 'earring', shape: 'hoop', joint: 'head', pos: [0.118, -0.03, 0.01], radius: 0.012, color: FA_GOLD }],
      portraitColor: '#b02a6a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffeaf6, core: 0xffffff, particles: 0xffd8ee }, mult: {} }],
    poses: Object.assign({}, BD.poses, GK.poses, faPoses, { idle: faPoses.fa_idle }),
    moves: {
      light: [
        lt('faJab', 'g_jabW', 'g_jab', 360, { startup: 4, recovery: 10, cancel: 7 }),
        lt('faKick', 'g_kickW', 'g_kick', 400, { startup: 5, reach: 1.35, recovery: 11, cancel: 7 }),
        lt('faHigh', 'fa_highW', 'fa_high', 460, { startup: 6, reach: 1.4, hitstun: 26, knock: 'push', knockSpeed: 10, hitPose: 'hitSideL' }),
        lt('faSpin', 'g_spinKickW', 'g_spinKick', 520, { startup: 7, reach: 1.45, recovery: 15, hitstun: 28, knock: 'push', knockSpeed: 12, impact: 2, sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: hv('faAxe', 'g_axeKickW', 'g_axeKick', 880, { startup: 10, reach: 1.35, knock: 'smash', knockSpeed: 32, impact: 3 }),
        2: hv('faRising', 'kickWindR', 'kickR', 760, { startup: 9, reach: 1.3, knock: 'launch', knockSpeed: 20 }),
      },
      dash: hv('faDive', 'g_flyingKnee', 'g_flyingKnee', 700, { startup: 4, active: 8, recovery: 14, lunge: 40, hitstun: 28, hitPose: 'hitBody' }),
      throw: { id: 'faFlip', name: 'Flip Throw', damage: 1050, knockSpeed: 26, poses: ['grab', 'kickWindR', 'kickR'] },
    },
    specials: {
      // TRIPLE SHOT: three ki shots fanned from both hands
      special1: {
        id: 'faVolley', name: 'Triple Shot', type: 'projectile', kiCost: 24, icon: 'blast', cooldown: 90,
        startup: 12, recovery: 16, pose: { wind: 'fa_volleyW', release: 'fa_volley' },
        projectile: { kind: 'blast', count: 3, spread: 0.45, speed: 80, radius: 0.34, damage: 650, homing: 0.3, color: 0xff9ad0, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 12, impact: 2, life: 2.2 },
      },
      // KICK RUSH: in fast — knee, kick, spinning heel
      special2: {
        id: 'faKickRush', name: 'Kick Rush', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 6, dashFrames: 18, speed: 70, recovery: 18,
        poses: { wind: 'g_kickW' },
        hits: [
          { pose: 'g_kick', damage: 380, frames: 8, sfx: 'punchLight' },
          { pose: 'fa_high', damage: 420, frames: 9, sfx: 'punchHeavy' },
          { pose: 'g_spinKick', damage: 900, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 30, impact: 3 },
        ],
      },
      // FULL-FORCE RAIN: a ball thrown high that breaks into shots over everything in range
      ultimate: {
        id: 'faRain', name: 'Full-Force Rain', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 22, rise: 24, height: 10, count: 14, damage: 640, speed: 64, range: 60, recovery: 26,
        color: 0xff7ab8, poses: { wind: 'fa_volleyW', throw: 'fa_volley' },
      },
    },
    ai: { personality: 'aggressive', aggression: 0.72, defense: 0.45, ranged: 0.4, beam: 0, transformHp: 0, preferredRange: 2 },
    intro: { pose: 'fa_idle', expression: 'smirk' },
    victory: { poses: ['fa_idle'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== SHUGESH */
  const SH_SKIN = 0x9a9aa2, SH_NAVY = 0x1c2a52, SH_GOLD = 0xe0b030, SH_BLUE = 0x2a4a9a;
  const shPoses = {
    // hunched, arms hanging heavy, a slow sway: a wall that breathes
    sh_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: -0.06 + b * 0.008, rz: b * 1.5 }, hips: [0, 0, 0], spine: [12, 0, 0], chest: [10 + b, 0, 0], neck: [6, 0, 0], head: [-8, 0, 0],
        shoulderL: [-6, 0, 24], elbowL: [-34, 0, 0], shoulderR: [-6, 0, -24], elbowR: [-34, 0, 0],
        thighL: [-12, 8, 16], kneeL: [22, 0, 0], thighR: [-12, -8, -16], kneeR: [22, 0, 0], hands: ['fist', 'fist'],
      };
    },
    sh_crouch: { root: { y: -0.22, rx: 14 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [-14, 0, 0], shoulderL: [10, 0, 40], elbowL: [-30, 0, 0], shoulderR: [10, 0, -40], elbowR: [-30, 0, 0], thighL: [-70, 0, 18], kneeL: [100, 0, 0], thighR: [-70, 0, -18], kneeR: [100, 0, 0], hands: ['fist', 'fist'] },
    sh_air: { root: { y: 0, rx: -8 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-10, 0, 0], shoulderL: [-160, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-160, 0, -20], elbowR: [-20, 0, 0], thighL: [-40, 0, 10], kneeL: [60, 0, 0], thighR: [-40, 0, -10], kneeR: [60, 0, 0], hands: ['fist', 'fist'] },
  };
  C.shugesh = {
    id: 'shugesh', assetLevel: 1, name: 'Shugesh', fullName: 'Shugesh (Bardock\'s squad)', era: 'Planet Vegeta',
    playable: true, prototype: true, style: 'Heavy · Armoured',
    card: ['Planet Vegeta', 'Bardock\'s squad'],
    blurb: 'The squad\'s slowest and hardest to move. When he jumps, get out from under him.',
    ratings: { power: 4, speed: 1, ki: 2, defense: 5 },
    stats: { hp: 17000, ki: 100, stamina: 130, speed: 0.85, power: 1.05, defense: 1.15, weight: 1.3, kiRegen: 1.8, chargeRate: 30, canonPower: 0.6 },
    poise: { max: 50, regen: 12, regenDelay: 110, armor: 1, cost: { 1: 8, 2: 14, 3: 22, 4: 32 }, beamMul: 1.2, breakFrames: 120, vulnerable: 1.25 },
    appearance: {
      height: 1.02, skin: SH_SKIN,
      build: { chestW: 0.24, chestD: 0.165, shoulderX: 0.235, waistW: 0.17, waistD: 0.15, upperArmR: 0.066, foreArmR: 0.058, thighR: 0.1, shinR: 0.07, headR: 0.125, neckR: 0.07, neckLen: 0.04 },
      hair: { style: 'bald', color: SH_SKIN },
      headExtras: [
        // the blond hair above the ears, swept back in thin flames (2026-10-15 visual pass: two upright cones read as horns)
        ...[1, -1].flatMap((s) => [
          { a: [s * 0.8, 0.32, -0.05], d: [s * 0.55, 0.3, -0.8], l: 0.12, r: 0.03, color: 0xe8c040, depth: 0.98, flat: 0.5, outline: 0.4 },
          { a: [s * 0.84, 0.18, -0.2], d: [s * 0.6, 0.15, -0.8], l: 0.13, r: 0.028, color: 0xe8c040, depth: 0.98, flat: 0.5, outline: 0.4 },
          { a: [s * 0.74, 0.4, -0.3], d: [s * 0.4, 0.4, -0.85], l: 0.1, r: 0.026, color: 0xe8c040, depth: 0.98, flat: 0.5, outline: 0.4 },
        ]),
      ],
      face: { pupil: 0x141414, browThick: 1.3, brow: 0xe8c040, jaw: 1.14, jawW: 1.08, cheeks: 1.1, noseSize: 1.2 },
      outfit: {
        topStyle: 'armor', top: SH_NAVY, arms: SH_SKIN, pants: SH_BLUE, pantsStyle: 'harem',
        wrist: 0x24242a, wristLen: 0.15, boots: 0xe8e4d8, bootTip: SH_GOLD, bootStyle: 'saiyan',
        // (the board p.8: a blue belly panel under the navy plate, gold shoulder straps, a GREEN scouter lens)
        armor: { plate: SH_NAVY, belly: 0x3a5ab8, pads: SH_GOLD, padStyle: 'strap', trim: 0xe8e8ee },
        scouter: scouter(0x3ad86a),
        tail: 0x5a321a,
      },
      portraitColor: '#1c2a52',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }],
    poses: Object.assign({}, BD.poses, shPoses, { idle: shPoses.sh_idle }),
    moves: {
      light: [
        lt('shSwing', 'punchWindR', 'punchR', 440, { startup: 8, recovery: 15, cancel: 10, sfx: 'punchHeavy' }),
        lt('shBody', 'b_bodyW', 'b_body', 480, { startup: 8, recovery: 15, cancel: 10, hitPose: 'hitBody' }),
        lt('shHead', 'b_headbuttW', 'b_headbutt', 600, { startup: 10, recovery: 18, hitstun: 32, knock: 'push', knockSpeed: 10, impact: 2 }),
      ],
      heavy: {
        0: hv('shSlam', 'hammerWind', 'hammer', 1200, { startup: 15, recovery: 26, armor: true, knock: 'smash', knockSpeed: 38, impact: 4, guardCrush: true, guardDamage: 55 }),
        3: hv('shShoulder', 'b_shoulderW', 'b_shoulder', 1000, { startup: 13, active: 6, lunge: 20, armor: true, hitPose: 'hitBody' }),
      },
      dash: hv('shRam', 'b_shoulder', 'b_shoulder', 900, { startup: 8, active: 10, recovery: 20, lunge: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'shCrush', name: 'Body Press', damage: 1400, knockSpeed: 18, poses: ['grab', 'hammerWind', 'hammer'] },
    },
    specials: {
      // SHUGESH BLAST: a slow heavy ball from one hand
      special1: {
        id: 'shBlast', name: 'Heavy Blast', type: 'projectile', kiCost: 26, icon: 'ball',
        startup: 18, recovery: 22, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 44, radius: 0.9, damage: 1800, homing: 0.6, color: 0xffb04a, core: 0xfff0c0, explode: 5, knock: 'heavy', knockSpeed: 22, impact: 3, life: 3 },
      },
      // CRASH DOWN: up — and down on you, the ground cracking round him
      special2: {
        id: 'shCrash', name: 'Crash Down', type: 'groundSlam', kiCost: 30, icon: 'down', cooldown: 220,
        crouch: 18, hang: 26, height: 7, maxRange: 18, radius: 5.5, clearHeight: 2, damage: 2000, knockSpeed: 20, recovery: 34,
        ringColor: 0xffb04a, coreColor: 0xfff0c0, dustColor: 'stage', poses: { crouch: 'sh_crouch', air: 'sh_air', land: 'hammer' },
      },
      // BREAKER WAVE: a wave from both hands
      ultimate: {
        id: 'shWave', name: 'Breaker Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 50, chargeMax: 50, damage: [4600, 4600], radius: [1.6, 1.6], speed: 80, range: 150, sustain: 46,
        color: 0xffa040, core: 0xfff4d8, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 36,
      },
    },
    ai: { personality: 'berserker', aggression: 0.66, defense: 0.6, ranged: 0.3, beam: 0.3, transformHp: 0, preferredRange: 1.8 },
    intro: { pose: 'sh_idle', expression: 'grin' },
    victory: { poses: ['b_fistCrack'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== TARBLE */
  const TB_SKIN = 0xeec2a0, TB_BLUE = 0x1f3a8a, TB_PLATE = 0xf0eee6, TB_BROWN = 0x8a5a2a;
  const tbPoses = {
    // small, polite, hands held together in front: he would rather not
    tb_idle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: b * 0.005 }, spine: [2, 0, 0], chest: [0 + b, 0, 0], head: [4, 0, 0],
        shoulderL: [-24, -30, 10], elbowL: [-60, 0, 0], shoulderR: [-24, 30, -10], elbowR: [-60, 0, 0],
        thighL: [-2, 4, 6], kneeL: [6, 0, 0], thighR: [-2, -4, -6], kneeR: [6, 0, 0], hands: ['open', 'open'],
      };
    },
    tb_guard: { root: { y: -0.04 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [6, 0, 0], shoulderL: [-70, -20, 20], elbowL: [-120, 0, 0], shoulderR: [-70, 20, -20], elbowR: [-120, 0, 0], thighL: [-12, 0, 12], kneeL: [16, 0, 0], thighR: [-6, 0, -12], kneeR: [10, 0, 0], hands: ['fist', 'fist'] },
  };
  C.tarble = {
    id: 'tarble', assetLevel: 1, name: 'Tarble', fullName: 'Tarble (Vegeta\'s younger brother)', era: 'Movie',
    playable: true, prototype: true, style: 'Evasive · Weak',
    card: ['OVA', 'Vegeta\'s brother'],
    blurb: 'Vegeta\'s younger brother, sent away for being too gentle to fight. He is quick — he has had to be.',
    ratings: { power: 1, speed: 4, ki: 2, defense: 1 },
    stats: { hp: 9000, ki: 100, stamina: 110, speed: 1.12, power: 0.6, defense: 0.7, weight: 0.72, kiRegen: 2.4, chargeRate: 34, canonPower: 0.3 },
    appearance: {
      height: 0.78, skin: TB_SKIN,
      build: { chestW: 0.17, chestD: 0.115, shoulderX: 0.17, waistW: 0.115, upperArmR: 0.044, foreArmR: 0.038, thighR: 0.07, shinR: 0.052, headR: 0.13 },
      // his own softer hair (2026-10-15 visual pass: it was Vegeta's full flame)
      hair: { style: 'tarble', color: 0x141418 },
      face: { pupil: 0x141414, eyeW: 1.12, eyeH: 1.14, browThick: 0.9, jaw: 0.92, cheeks: 1.1 },
      outfit: {
        topStyle: 'armor', top: TB_BLUE, arms: TB_BLUE, sleeves: 'long', sleeveColor: TB_BLUE, pants: TB_BLUE, pantsStyle: 'tight',
        gloves: TB_PLATE, boots: TB_PLATE, bootTip: TB_BROWN, bootStyle: 'saiyan',
        armor: { plate: TB_PLATE, belly: TB_BROWN, pads: TB_BROWN, padStyle: 'up', trim: TB_BROWN, hipGuards: TB_BROWN },
        scouter: scouter(0x3cff78),
        tail: 0x4a2a14,
      },
      portraitColor: '#1f3a8a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }],
    poses: Object.assign({}, VG.poses, tbPoses, { idle: tbPoses.tb_idle }),
    moves: {
      light: [
        lt('tbJab', 'v_jabW', 'v_jab', 260, { startup: 4, recovery: 10, cancel: 6 }),
        lt('tbJab2', 'punchWindL', 'punchL', 280, { startup: 4, recovery: 10, cancel: 6 }),
        lt('tbKick', 'kickWindR', 'kickR', 340, { startup: 6, reach: 1.3, recovery: 13, cancel: 8, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('tbElbow', 'v_elbowW', 'v_elbow', 640, { startup: 9, recovery: 18, knock: 'heavy', knockSpeed: 22 }),
      },
      dash: hv('tbDash', 'v_dash', 'v_jab', 480, { startup: 3, active: 8, recovery: 12, lunge: 40, hitstun: 24, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'tbShove', name: 'Push Away', damage: 600, knockSpeed: 30, poses: ['grab', 'v_hookW', 'v_hook'] },
    },
    specials: {
      // PRINCE'S SHOT: a small, quick ki shot
      special1: {
        id: 'tbShot', name: 'Prince\'s Shot', type: 'projectile', kiCost: 16, icon: 'blast', cooldown: 60,
        startup: 8, recovery: 12, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'blast', speed: 92, radius: 0.32, damage: 900, homing: 0.4, color: 0x9ad0ff, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 12, impact: 2, life: 2 },
      },
      // SIDESTEP: gone before the blow lands (escape: out of a combo for more ki)
      special2: {
        id: 'tbStep', name: 'Sidestep', type: 'teleport', kiCost: 14, icon: 'teleport',
        startup: 6, recovery: 8, cooldown: 50, escapeKiCost: 28, followWindow: 30, followBonus: 1.2, pose: 'tb_guard',
        modes: { behind: true, away: true },
      },
      // ROYAL WAVE: his brother's blood after all — one wave from both hands
      ultimate: {
        id: 'tbWave', name: 'Royal Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [3400, 3400], radius: [1.1, 1.1], speed: 100, range: 150, sustain: 36,
        color: 0x8ab8ff, core: 0xf0f8ff, poses: { charge: 'v_galickCharge', fire: 'v_galickFire' }, recovery: 30,
      },
    },
    ai: { personality: 'adaptive', aggression: 0.4, defense: 0.7, ranged: 0.6, beam: 0.3, transformHp: 0, preferredRange: 5 },
    intro: { pose: 'tb_idle', expression: 'soft' },
    victory: { poses: ['tb_idle'], expression: 'soft' },
    defeat: { pose: 'defeatKneel', expression: 'sad' },
  };

  /* ============================================================== TURLES (movie) */
  const TU_SKIN = 0xa06c48, TU_ARMOR = 0x48409a, TU_SUIT = 0x1e1c30, TU_WHITE = 0xf0eee6;
  const tuPoses = {
    // weight back, chin up, a hand open at his side: Goku's face with none of Goku in it
    tu_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: b * 0.005 }, hips: [0, 10, 4], spine: [-4, 0, 0], chest: [-6 + b, 8, 0], head: [-10, -12, 0],
        shoulderL: [-10, 0, 22], elbowL: [-20, 0, 0], shoulderR: [-14, 0, -36], elbowR: [-90, 0, 0],
        thighL: [-4, 6, 10], kneeL: [5, 0, 0], thighR: [6, -8, -10], kneeR: [10, 0, 0], hands: ['open', 'fist'],
      };
    },
    // the fruit: up to his mouth
    tu_eat: { root: { y: 0 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-14, 0, 0], shoulderR: [-60, 30, -10], elbowR: [-136, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], thighL: [-4, 0, 10], kneeL: [4, 0, 0], thighR: [-4, 0, -10], kneeR: [4, 0, 0], hands: ['open', 'fist'] },
    // KILL DRIVER: the arm swept from the hip up and out, the ring leaving the palm
    tu_driverW: { root: { y: -0.04 }, spine: [6, 24, 0], chest: [6, 30, 0], head: [-4, -26, 0], shoulderR: [10, 0, 30], elbowR: [-40, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-70, 0, 0], thighL: [-18, 8, 14], kneeL: [22, 0, 0], thighR: [10, -8, -14], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    tu_driver: { root: { y: -0.02, rx: 4 }, spine: [0, -18, 0], chest: [0, -28, 0], head: [-8, 26, 0], shoulderR: [-100, 0, -30], elbowR: [-6, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-60, 0, 0], thighL: [-20, 8, 14], kneeL: [24, 0, 0], thighR: [12, -8, -14], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    // CALAMITY BLASTER: the ball raised overhead on one hand, then thrown down
    tu_ballW: (t) => ({ root: { y: 0 }, spine: [-6, 0, 0], chest: [-10 + Math.sin(t * 30), 0, 0], head: [-24, 0, 0], shoulderR: [-176, 0, -8], elbowR: [-8, 0, 0], shoulderL: [-14, 0, 26], elbowL: [-40, 0, 0], thighL: [-4, 0, 10], kneeL: [8, 0, 0], thighR: [-4, 0, -10], kneeR: [8, 0, 0], hands: ['fist', 'open'] }),
    tu_ball: { root: { y: -0.04, rx: 10 }, spine: [8, 0, 0], chest: [12, 10, 0], head: [-4, -8, 0], shoulderR: [-104, 0, -12], elbowR: [-6, 0, 0], shoulderL: [-14, 0, 30], elbowL: [-50, 0, 0], thighL: [-20, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'] },
  };
  const TU_LOOK = { pupil: 0x141414 };
  // the fruit's power burning through him: glowing red-violet veins down the bare arms and thighs, in that form only
  const TU_VEIN = 0xff3a7a;
  const TU_VEINS = ['L', 'R'].flatMap((s) => {
    const k = s === 'L' ? 1 : -1;
    return [
      { at: 'shoulder' + s, t: 0.4, ang: 0.5 * k, size: [0.009, 0.08], tilt: 0.25, color: TU_VEIN, glow: true, lift: 1.2, forms: ['fruit'] },
      { at: 'shoulder' + s, t: 0.72, ang: -0.3 * k, size: [0.006, 0.05], tilt: -0.4, color: TU_VEIN, glow: true, lift: 1.2, forms: ['fruit'] },
      { at: 'elbow' + s, t: 0.32, ang: 0.15, size: [0.009, 0.085], tilt: 0.15, color: TU_VEIN, glow: true, lift: 1.2, forms: ['fruit'] },
      { at: 'elbow' + s, t: 0.62, ang: 0.8 * k, size: [0.006, 0.05], tilt: -0.3, color: TU_VEIN, glow: true, lift: 1.2, forms: ['fruit'] },
      { at: 'thigh' + s, t: 0.5, ang: 0.3 * k, size: [0.01, 0.09], tilt: 0.2, color: TU_VEIN, glow: true, lift: 1.2, forms: ['fruit'] },
      { at: 'thigh' + s, t: 0.75, ang: -0.4 * k, size: [0.007, 0.05], tilt: -0.3, color: TU_VEIN, glow: true, lift: 1.2, forms: ['fruit'] },
    ];
  });
  C.turles = {
    id: 'turles', assetLevel: 1, name: 'Turles', fullName: 'Turles (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Saiyan Raider · Tree of Might',
    card: ['Movie', 'The Tree of Might'],
    blurb: 'A low-class Saiyan with Goku\'s face who plants a tree that drinks planets dry — and eats its fruit to get stronger.',
    ratings: { power: 4, speed: 3, ki: 4, defense: 3 },
    stats: { hp: 16000, ki: 120, stamina: 110, speed: 1.04, power: 1.1, defense: 1.0, weight: 1, kiRegen: 2.6, chargeRate: 36, canonPower: 1.2 },
    appearance: {
      height: 1, skin: TU_SKIN,
      hair: { style: 'goku', color: 0x141418 },
      face: { pupil: 0x141414, browThick: 1.2, brow: 0x141418, eyeTilt: 0.12, jaw: 1.02 },
      outfit: {
        // the 2026-10-15 visual pass (the board p.71): the old-style Saiyan armour in indigo, ribbed, with tall shoulder flaps,
        // long tassets and a white trim; bare arms and legs under it; white gauntlets; indigo boots with white tops
        topStyle: 'armor', top: TU_SUIT, arms: TU_SKIN, pants: TU_SUIT, pantsStyle: 'tight', thighs: TU_SKIN, legs: TU_SKIN,
        // (2026-10-16, the board p.209: no cape; the chest black with the blue ribbed panel running down its middle into
        // the belly; blue ribbed gauntlets with a white rim; black boots with white tops over blue ribbed foot guards)
        wrist: TU_ARMOR, wristLen: 0.14, wristTrim: TU_WHITE, boots: TU_SUIT, bootTrim: TU_WHITE, bootTip: TU_ARMOR, bootStyle: 'saiyan',
        armor: { plate: TU_SUIT, belly: TU_ARMOR, pads: TU_ARMOR, padStyle: 'up', hipGuards: TU_ARMOR, hipStyle: 'long', trim: TU_WHITE },
        ribs: { color: TU_ARMOR, every: 0.04 },
        scouter: scouter(0xff3a3a),
        tail: 0x5a321a,
      },
      decals: TU_VEINS,
      // the blue centre panel down the black chest (ribbed: it is in the armour's colour), rimmed white
      props: [
        { id: 'panelRim', joint: 'chest', shape: 'ball', pos: [0, 0.06, 0.15], rot: [-0.1, 0, 0], size: [0.105, 0.2, 0.034], color: TU_WHITE, outline: 0.4 },
        { id: 'panel', joint: 'chest', shape: 'ball', pos: [0, 0.06, 0.156], rot: [-0.1, 0, 0], size: [0.094, 0.19, 0.034], color: TU_ARMOR, outline: 0.3 },
      ],
      portraitColor: '#2c2a4c',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xc8b8ff, core: 0xffffff, particles: 0xd8ccff }, mult: {} },
      {
        // the power of the fruit: a dark red-violet aura, a body grown harder — it fades with the battle
        id: 'fruit', name: 'Tree of Might Power', short: 'FRUIT POWER', kiCost: 50, style: 'full',
        aura: { color: 0x9a2a6a, core: 0xff9ad0, particles: 0xd04a8a, speed: 1.6, idle: 0.25, sharp: 0.3 },
        mult: { damage: 1.32, speed: 1.08, defense: 1.25, kiRegen: 1.4, chargeRate: 1.2 },
        look: Object.assign({ muscle: 1.14, bulk: 1.06, tint: 0x9a2a6a, tintAmount: 0.12 }, TU_LOOK),
        practiced: {
          length: 84,
          applyAt: 44,
          steps: [
            { at: 0, pose: 'tu_eat', speed: 9, expression: 'smirk', shot: 'face', sfx: 'kiUp' },
            { at: 24, pose: 'powerCrouch', speed: 8, expression: 'grit', aura: 0.6, quake: 0.14, dust: 3 },
            { at: 44, burst: true, small: true, pose: 'powerUp', speed: 12, expression: 'shout', flash: 0.25, crater: 2.5 },
            { at: 70, pose: 'tu_idle', expression: 'wicked' },
          ],
        },
        // fed by the fruit, the rush comes in harder and the ball is bigger
        specials: {
          special2: {
            id: 'tuMeteor', name: 'Meteor Burst', type: 'rush', kiCost: 40, icon: 'rush', cooldown: 150,
            startup: 8, dashFrames: 20, speed: 64, armor: true, recovery: 24,
            poses: { wind: 'g_crossW' },
            hits: [
              { pose: 'g_cross', damage: 700, frames: 9, sfx: 'punchHeavy' },
              { pose: 'g_elbow', damage: 760, frames: 9, sfx: 'punchHeavy' },
              { pose: 'g_axeKick', damage: 1000, frames: 12, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 16, impact: 3 },
              { pose: 'tu_driver', damage: 1600, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 },
            ],
          },
        },
      },
    ],
    poses: Object.assign({}, GK.poses, tuPoses, { idle: tuPoses.tu_idle }),
    moves: {
      light: [
        lt('tuJab', 'g_jabW', 'g_jab', 340, { startup: 4, recovery: 11, cancel: 7 }),
        lt('tuCross', 'g_crossW', 'g_cross', 380, { startup: 5, recovery: 12, cancel: 8 }),
        lt('tuElbow', 'g_elbowW', 'g_elbow', 420, { startup: 6, reach: 1.0, hitPose: 'hitBody' }),
        lt('tuKick', 'g_sideKickW', 'g_sideKick', 520, { startup: 7, reach: 1.45, recovery: 15, hitstun: 28, knock: 'push', knockSpeed: 14, impact: 2, sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: hv('tuAxe', 'g_axeKickW', 'g_axeKick', 920, { startup: 11, reach: 1.3, knock: 'smash', knockSpeed: 34, impact: 3 }),
        2: hv('tuUpper', 'uppercutWind', 'uppercut', 820, { startup: 9, knock: 'launch', knockSpeed: 20 }),
      },
      dash: hv('tuKnee', 'g_flyingKnee', 'g_flyingKnee', 760, { startup: 4, active: 8, recovery: 14, lunge: 38, hitstun: 28, hitPose: 'hitBody' }),
      throw: { id: 'tuToss', name: 'Raider\'s Toss', damage: 1150, knockSpeed: 28, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // KILL DRIVER: a ring of ki thrown from the palm — it cuts through a guard
      special1: {
        id: 'tuDriver', name: 'Kill Driver', type: 'projectile', kiCost: 30, icon: 'ball',
        startup: 16, recovery: 20, pose: { wind: 'tu_driverW', release: 'tu_driver' },
        projectile: { kind: 'disc', speed: 62, radius: 0.85, damage: 2200, homing: 0.5, color: 0xd070ff, core: 0xfff0ff, explode: 2, knock: 'heavy', knockSpeed: 20, impact: 3, guardPierce: true, life: 2.6 },
      },
      // FRUIT OF THE TREE OF MIGHT: one fruit, eaten — health, ki and stamina back
      special2: {
        id: 'tuFruit', name: 'Fruit of the Tree of Might', type: 'senzu', kiCost: 0, icon: 'guard', cooldown: 240,
        count: 1, eatAt: 24, recovery: 20, heal: 0.4, ki: 100, tossRange: 0, allyBelow: 0,
        poses: { eat: 'tu_eat' },
      },
      // CALAMITY BLASTER: a dark ball raised over his head and thrown down
      ultimate: {
        id: 'tuCalamity', name: 'Calamity Blaster', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 44, recovery: 40, pose: { wind: 'tu_ballW', release: 'tu_ball' },
        projectile: { kind: 'ball', speed: 34, radius: 2.1, damage: 5000, homing: 0.55, color: 0xb04ad8, core: 0xffe0ff, explode: 12, knock: 'smash', knockSpeed: 42, impact: 5, life: 4.5 },
      },
    },
    blast: { color: 0xc070ff, core: 0xfff0ff, damage: 200, speed: 60, radius: 0.3 },
    ai: { personality: 'aggressive', aggression: 0.7, defense: 0.5, ranged: 0.45, beam: 0.2, transformHp: 0.6, preferredRange: 3 },
    intro: { pose: 'tu_eat', expression: 'smirk' },
    victory: { poses: ['tu_idle'], expression: 'wicked' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== GINE: a kit (prologue body in super_broly_cast.js) */
  const gine = C.gine;
  if (gine) {
    Object.assign(gine, {
      playable: true, // Free Battle after the prologue's Planet Vegeta chapter (unlocks.js); her story scenes are unchanged
      style: 'Support · Rations',
      card: ['Movie', 'Bardock\'s wife'],
      ratings: { power: 1, speed: 3, ki: 2, defense: 1 },
      stats: { hp: 9000, ki: 100, stamina: 110, speed: 1.02, power: 0.58, defense: 0.66, weight: 0.8, kiRegen: 2.2, chargeRate: 30, canonPower: 0.1 },
      moves: {
        light: [
          lt('giSlap', 'punchWindR', 'punchR', 240, { startup: 5, recovery: 11, cancel: 7 }),
          lt('giSlap2', 'punchWindL', 'punchL', 260, { startup: 5, recovery: 11, cancel: 7 }),
          lt('giChop', 'chopW', 'chop', 340, { startup: 7, recovery: 14, hitPose: 'hitSideL' }),
        ],
        heavy: {
          0: hv('giCleaver', 'chopW', 'chop', 720, { startup: 12, knock: 'heavy', knockSpeed: 22 }),
        },
        dash: hv('giShove', 'punchWindR', 'punchR', 420, { startup: 5, active: 8, recovery: 14, lunge: 30, knock: 'push', knockSpeed: 16, hitPose: 'hitBody' }),
        throw: { id: 'giToss', name: 'Out of My Kitchen', damage: 620, knockSpeed: 28, poses: ['grab', 'throwWind', 'throwRelease'] },
      },
      specials: {
        // KI BLAST: one honest shot
        special1: {
          id: 'giBlast', name: 'Ki Blast', type: 'projectile', kiCost: 16, icon: 'blast', cooldown: 60,
          startup: 10, recovery: 14, pose: { wind: 'blastWind', release: 'blastR' },
          projectile: { kind: 'blast', speed: 80, radius: 0.34, damage: 900, homing: 0.4, color: 0xffd8a0, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 12, impact: 2, life: 2 },
        },
        // SAIYAN RATIONS: she ran the meat stall — two portions, thrown to whoever is worst off (or eaten herself)
        special2: {
          id: 'giRations', name: 'Saiyan Rations', type: 'senzu', kiCost: 0, icon: 'guard', cooldown: 200,
          count: 2, eatAt: 22, recovery: 18, heal: 0.3, ki: 40, tossRange: 14, allyBelow: 0.5,
          poses: { eat: 'gine_wave' },
        },
        // FOR KAKAROT: everything she never wanted to use, all at once
        ultimate: {
          id: 'giFury', name: 'For Kakarot', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
          startup: 10, dashFrames: 20, speed: 60, recovery: 30,
          poses: { wind: 'chopW' },
          hits: [
            { pose: 'punchR', damage: 420, frames: 7, sfx: 'punchLight' },
            { pose: 'punchL', damage: 420, frames: 7, sfx: 'punchLight' },
            { pose: 'chop', damage: 600, frames: 9, sfx: 'punchHeavy' },
            { pose: 'hammer', damage: 2200, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
          ],
        },
      },
      ai: { personality: 'adaptive', aggression: 0.45, defense: 0.6, ranged: 0.5, beam: 0, transformHp: 0, preferredRange: 4 },
      victory: { poses: ['gine_wave'], expression: 'soft' },
      defeat: { pose: 'defeatKneel', expression: 'sad' },
    });
  }

  /* ============================================================== KING VEGETA: a kit (body in super_broly_cast.js) */
  const king = C.king_vegeta;
  if (king) {
    Object.assign(king, {
      playable: true, // Free Battle after the prologue's Planet Vegeta chapter (unlocks.js)
      style: 'Royal · Blaster',
      card: ['Movie', 'King of the Saiyans'],
      ratings: { power: 4, speed: 2, ki: 4, defense: 3 },
      stats: { hp: 15000, ki: 120, stamina: 100, speed: 0.95, power: 1.1, defense: 1.05, weight: 1.1, kiRegen: 2.6, chargeRate: 34, canonPower: 0.6 },
      poses: Object.assign({}, VG.poses, king.poses, { idle: king.poses.kv_idle }),
      moves: {
        light: [
          lt('kvJab', 'v_jabW', 'v_jab', 380, { startup: 5, recovery: 12, cancel: 8 }),
          lt('kvHook', 'v_hookW', 'v_hook', 420, { startup: 6 }),
          lt('kvBack', 'v_backhandW', 'v_backhand', 480, { startup: 7, reach: 1.25, hitstun: 26, knock: 'push', knockSpeed: 12, hitPose: 'hitSideL' }),
        ],
        heavy: {
          0: hv('kvKnee', 'v_kneeW', 'v_knee', 900, { startup: 11, hitPose: 'hitBody', knock: 'launch', knockSpeed: 18 }),
          3: hv('kvChop', 'v_chopW', 'v_chop', 1000, { startup: 12, knock: 'smash', knockSpeed: 34, impact: 3 }),
        },
        dash: hv('kvRush', 'v_rushW', 'v_rush', 760, { startup: 5, active: 8, recovery: 16, lunge: 34, hitstun: 28, hitPose: 'hitBody' }),
        throw: { id: 'kvThrow', name: 'Royal Decree', damage: 1150, knockSpeed: 28, poses: ['grab', 'v_hookW', 'v_hook'] },
      },
      specials: {
        // ROYAL BLASTER: a heavy ball from an open palm
        special1: {
          id: 'kvBlaster', name: 'Royal Blaster', type: 'projectile', kiCost: 30, icon: 'ball',
          startup: 14, recovery: 22, pose: { wind: 'v_bigBangW', release: 'v_bigBang' },
          projectile: { kind: 'ball', speed: 56, radius: 1, damage: 1900, homing: 1, color: 0xffd060, core: 0xffffff, explode: 6, knock: 'heavy', knockSpeed: 24, impact: 3, life: 3 },
        },
        // KING'S ORDER: he does not wait for an answer — knee, chop, the palm point-blank
        special2: {
          id: 'kvOrder', name: 'King\'s Order', type: 'rush', kiCost: 32, icon: 'rush',
          startup: 8, dashFrames: 22, speed: 56, recovery: 22,
          poses: { wind: 'v_rushW' },
          hits: [
            { pose: 'v_knee', damage: 480, frames: 10, sfx: 'punchHeavy' },
            { pose: 'v_chop', damage: 520, frames: 10, sfx: 'punchHeavy' },
            { pose: 'v_bigBang', damage: 1100, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 30, impact: 3 },
          ],
        },
        // IMPERIAL CANNON: the royal family's wave, from both hands
        ultimate: {
          id: 'kvCannon', name: 'Imperial Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
          chargeMin: 46, chargeMax: 46, damage: [4800, 4800], radius: [1.5, 1.5], speed: 96, range: 160, sustain: 44,
          color: 0xffc840, core: 0xfff8e0, poses: { charge: 'v_galickCharge', fire: 'v_galickFire' }, recovery: 32,
        },
      },
      ai: { personality: 'adaptive', aggression: 0.6, defense: 0.55, ranged: 0.5, beam: 0.35, transformHp: 0, preferredRange: 3.5 },
      victory: { poses: ['kv_idle'], expression: 'smirk' },
      defeat: { pose: 'defeatKneel', expression: 'hurt' },
    });
  }
})();
