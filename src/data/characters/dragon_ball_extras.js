/*
 * MORE OF THE ORIGINAL DRAGON BALL (roster continuation, 2026-10-15) — the board's "other original-series additions"
 * (p.208), for the tournaments, the Red Ribbon Army and Fortuneteller Baba's palace. The board names them without
 * pictures: every look here is BUILT FROM MEMORY and approximate. Era 'Dragon Ball'.
 *
 * FIGHTERS  Master Shen (the Crane Hermit), Nam, Giran, King Chappa (the Eight-Arm fist), Spike the Devil Man,
 *           Fangs the Vampire and Bandages the Mummy (Baba's fighters), Colonel Silver, Major Metallitron, Ninja
 *           Murasaki, Staff Officer Black (with the Battle Jacket).
 * SUPPORT   Commander Red and General White (Red Ribbon commanders: story roles, not fighters).
 *           Mr. See-Through (Baba's invisible fighter, 2026-10-15): fights unseen on the new Invisible mechanic.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const GK = C.goku;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 12, active: 4, recovery: 22, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const base = (aura) => [{ id: 'base', name: 'Base', aura: aura || { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} }];
  const end = (idle, expr) => ({ intro: { pose: idle, expression: expr || 'smirk' }, victory: { poses: [idle], expression: expr || 'smirk' }, defeat: { pose: 'defeatKneel', expression: 'hurt' } });
  const SCHOOL = {
    brawler: (p, s) => ({
      light: [lt(p + 'Jab', 'punchWindR', 'punchR', 400 * s), lt(p + 'Hook', 'punchWindL', 'punchL', 430 * s, { hitPose: 'hitSideR' }), lt(p + 'Knee', 'kickWindR', 'kickR', 520 * s, { startup: 8, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv(p + 'Smash', 'hammerWind', 'hammer', 1100 * s, { knock: 'smash', knockSpeed: 34, impact: 4, armor: true }) },
      dash: hv(p + 'Ram', 'punchWindR', 'punchR', 760 * s, { startup: 6, active: 10, recovery: 18, lunge: 32, hitstun: 28, hitPose: 'hitBody' }),
      throw: { id: p + 'Toss', name: 'Toss', damage: 1000 * s, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    }),
    swift: (p, s) => ({
      light: [lt(p + 'Jab', 'g_jabW', 'g_jab', 360 * s, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }), lt(p + 'Kick', 'g_kickW', 'g_kick', 400 * s, { startup: 5, reach: 1.35 }), lt(p + 'Spin', 'g_spinKickW', 'g_spinKick', 480 * s, { startup: 7, reach: 1.45, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2 })],
      heavy: { 0: hv(p + 'Axe', 'g_axeKickW', 'g_axeKick', 920 * s, { knock: 'smash', knockSpeed: 32 }) },
      dash: hv(p + 'Dive', 'g_flyingKnee', 'g_flyingKnee', 640 * s, { startup: 3, active: 8, recovery: 12, lunge: 44, hitstun: 26, hitPose: 'hitBody' }),
      throw: { id: p + 'Flip', name: 'Flip', damage: 900 * s, knockSpeed: 30, poses: ['grab', 'kickWindR', 'kickR'] },
    }),
  };
  const shot = (id, name, proj, o) => Object.assign({ id, name, type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 70, startup: 12, recovery: 16, pose: { wind: 'blastWind', release: 'blastR' }, projectile: Object.assign({ kind: 'blast', speed: 82, radius: 0.34, damage: 1100, homing: 0.4, color: 0xffd8a0, core: 0xffffff, explode: 2, knock: 'heavy', knockSpeed: 18, impact: 3, life: 2.2 }, proj) }, o);
  const wave = (id, name, color, dmg, o) => Object.assign({ id, name, type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true, chargeMin: 42, chargeMax: 42, damage: [dmg, dmg], radius: [1.2, 1.2], speed: 100, range: 150, sustain: 38, color, core: 0xffffff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 28 }, o);
  const rush = (id, name, hits, o) => Object.assign({ id, name, type: 'rush', kiCost: 28, icon: 'rush', startup: 8, dashFrames: 20, speed: 62, recovery: 22, poses: { wind: hits[0].pose }, hits }, o);
  const ult = (o) => Object.assign({ kiCost: 100, icon: 'ultimate', ultimate: true, recovery: 30 }, o);
  const step = (id, name, o) => Object.assign({ id, name, type: 'teleport', kiCost: 14, icon: 'teleport', startup: 4, recovery: 6, cooldown: 45, escapeKiCost: 24, followWindow: 34, followBonus: 1.3, pose: 'g_kickW', modes: { behind: true, away: true } }, o);
  const stats = (o) => Object.assign({ hp: 13000, ki: 110, stamina: 120, speed: 1.02, power: 0.98, defense: 0.98, weight: 1, kiRegen: 2.4, chargeRate: 32, canonPower: 0.2 }, o);
  const fighter = (id, o) => Object.assign({ id, assetLevel: 1, era: 'Dragon Ball', playable: true, prototype: true, poses: Object.assign({}, GK.poses) }, o);
  const build = (o) => Object.assign({ chestW: 0.2, chestD: 0.135, shoulderX: 0.2, waistW: 0.13, upperArmR: 0.052, foreArmR: 0.046, thighR: 0.082, shinR: 0.062, headR: 0.12 }, o);
  const RR = 0xd01a1a;

  /* ============================================================== MASTER SHEN */
  C.master_shen = fighter('master_shen', {
    name: 'Master Shen', fullName: 'Master Shen (the Crane Hermit)', style: 'Crane School · Dodon Ray',
    card: ['Dragon Ball', 'The Crane Hermit'], blurb: 'Master Roshi\'s old rival, teacher of Tien, Chiaotzu and Tao: proud, petty, and still dangerous. Built from memory.',
    ratings: { power: 2, speed: 3, ki: 4, defense: 3 },
    stats: stats({ hp: 12000, ki: 130, canonPower: 0.2 }),
    appearance: {
      height: 0.84, skin: 0xf0c8a0, build: build({ chestW: 0.18, shoulderX: 0.17, upperArmR: 0.044, foreArmR: 0.04 }),
      hair: { style: 'bald', color: 0xe8e8e0 },
      headExtras: [
        // the crane hat: a round white crown with the bird's neck and red crest rising from it
        { shape: 'ball', a: [0, 0.75, 0], d: [0, 1, 0], l: 0.02, r: 0.13, color: 0xf0f0ea, depth: 0.95, flat: 0.6, outline: 0.5 },
        { a: [0, 0.95, 0.4], d: [0, 1, 0.5], l: 0.12, r: 0.02, color: 0xf0f0ea, depth: 1.0, outline: 0.4 },
        { shape: 'ball', a: [0, 1.25, 0.75], d: [0, 0.3, 1], l: 0.01, r: 0.025, color: 0xd81e2a, depth: 1.0, flat: 0.6, outline: 0.3 },
        { shape: 'ball', a: [0, -0.5, 0.85], d: [0, -1, 0.3], l: 0.06, r: 0.04, color: 0xe8e8e0, depth: 0.96, flat: 0.6, outline: 0.3 },
      ],
      face: { pupil: 0x141414, eyeW: 0.8, eyeH: 0.6, browThick: 1.3, brow: 0xe8e8e0, jaw: 1.0 },
      outfit: { topStyle: 'gi', top: 0xe88a2a, sleeves: 'long', sleeveColor: 0xe88a2a, emblem: { text: '鶴', fg: '#111111', bg: '#ffffff' }, belt: 0x1e1e24, hem: { color: 0xe88a2a, len: 0.4, flare: 1.2 }, pants: 0x1e1e24, pantsStyle: 'gi', boots: 0x1e1e24, bootStyle: 'shoe' },
      props: [{ id: 'glasses', shape: 'glasses', joint: 'head', pos: [0, 0.128, 0.116], color: 0x16161a }],
      portraitColor: '#e88a2a',
    },
    forms: base(),
    moves: SCHOOL.swift('sh', 0.95),
    specials: {
      special1: shot('shDodon', 'Dodon Ray', { speed: 92, radius: 0.24, damage: 1300, homing: 0.1, color: 0xffd040, guardPierce: true }, { pose: { wind: 'g_finger', release: 'g_finger' } }),
      special2: step('shStep', 'Crane Step'),
      ultimate: wave('shWave', 'Super Dodon Wave', 0xffd040, 3600),
    },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.6, ranged: 0.5, beam: 0.4, transformHp: 0, preferredRange: 3.4 },
    ...end('armsCrossed', 'smirk'),
  });

  /* ============================================================== NAM */
  C.nam = fighter('nam', {
    name: 'Nam', fullName: 'Nam (the 21st World Martial Arts Tournament)', style: 'Fighter · Cross Attack',
    card: ['Dragon Ball', 'The 21st Tournament'], blurb: 'He came to the Tournament to win water for his drought-stricken village. Built from memory.',
    ratings: { power: 3, speed: 3, ki: 1, defense: 3 },
    stats: stats({ hp: 12500, canonPower: 0.1 }),
    appearance: {
      height: 1.0, skin: 0xa86a3a, build: build(),
      hair: { style: 'bald', color: 0xa86a3a },
      headExtras: [{ shape: 'ball', a: [0, 0.6, 0], d: [0, 1, 0], l: 0.03, r: 0.14, color: 0xf0f0ea, depth: 0.95, flat: 0.55, outline: 0.5 }],
      face: { pupil: 0x141414, browThick: 1.3, brow: 0x141418, jaw: 1.06 },
      outfit: { topStyle: 'gi', top: 0xf0f0ea, sleeves: 'none', arms: 0xa86a3a, belt: 0x2a4ab8, beltStyle: 'sash', pants: 0xf0f0ea, pantsStyle: 'harem', boots: 0x8a5a2a, bootStyle: 'shoe' },
      portraitColor: '#a86a3a',
    },
    forms: base(),
    moves: SCHOOL.brawler('nm', 1.0),
    specials: {
      special1: { id: 'nmCross', name: 'Heavenly Cross Attack', type: 'groundSlam', kiCost: 24, icon: 'down', cooldown: 200, crouch: 14, hang: 30, height: 9, maxRange: 18, radius: 4.5, clearHeight: 2, damage: 1700, knockSpeed: 20, recovery: 30, ringColor: 0xffffff, coreColor: 0xffe8c0, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' } },
      special2: rush('nmRush', 'Village Fist', [{ pose: 'punchR', damage: 500, frames: 9, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 520, frames: 9, sfx: 'punchHeavy' }, { pose: 'uppercut', damage: 1100, frames: 16, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 22, impact: 3 }]),
      ultimate: rush('nmFury', 'For the Village', [{ pose: 'punchR', damage: 600, frames: 8, sfx: 'punchHeavy' }, { pose: 'kickR', damage: 650, frames: 9, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2200, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 }], ult({})),
    },
    ai: { personality: 'aggressive', aggression: 0.65, defense: 0.5, ranged: 0.1, beam: 0, transformHp: 0, preferredRange: 2 },
    ...end('armsCrossed', 'calm'),
  });

  /* ============================================================== GIRAN */
  C.giran = fighter('giran', {
    name: 'Giran', fullName: 'Giran (the 21st World Martial Arts Tournament)', style: 'Monster · Gum Bind',
    card: ['Dragon Ball', 'The 21st Tournament'], blurb: 'A winged green monster with a tail and a sticky trick in his mouth. Built from memory.',
    ratings: { power: 3, speed: 3, ki: 2, defense: 4 },
    stats: stats({ hp: 15000, power: 1.02, defense: 1.08, weight: 1.3, canonPower: 0.15 }),
    appearance: {
      height: 1.2, skin: 0x6aaa4a, build: build({ chestW: 0.25, chestD: 0.17, shoulderX: 0.25, waistW: 0.17, upperArmR: 0.07, foreArmR: 0.062, thighR: 0.096, shinR: 0.074 }),
      hair: { style: 'bald', color: 0x6aaa4a },
      headExtras: [{ a: [0, 0.95, -0.2], d: [0, 1, -0.6], l: 0.1, r: 0.04, color: 0x4a8a2a, depth: 0.98, outline: 0.5 }, { shape: 'ball', a: [0, -0.3, 1], d: [0, -0.2, 1], l: 0.06, r: 0.07, color: 0x7aba5a, depth: 0.92, flat: 0.8, outline: 0.4 }],
      face: { pupil: 0xd02a2a, sclera: 0xfff0a0, browThick: 1.4, brow: 0x3a6a2a, noEars: true, jaw: 1.14 },
      outfit: { topStyle: 'bare', top: 0x6aaa4a, arms: 0x6aaa4a, belt: 0x8a3a2a, beltStyle: 'belt', pants: 0x6aaa4a, pantsStyle: 'tight', legs: 0x6aaa4a, boots: 0x6aaa4a, bootStyle: 'gi', longTail: { color: 0x6aaa4a, segments: 8, length: 0.9, radius: 0.05, lift: 0.4, curl: 0.3 } },
      props: [
        { id: 'wingL', shape: 'tri', joint: 'chest', pos: [0.18, 0.14, -0.12], rot: [0.2, -0.5, 2.6], size: [0.18, 0.24, 0.01], color: 0x8acc5a },
        { id: 'wingR', shape: 'tri', joint: 'chest', pos: [-0.18, 0.14, -0.12], rot: [0.2, 0.5, -2.6], size: [0.18, 0.24, 0.01], color: 0x8acc5a },
      ],
      portraitColor: '#6aaa4a',
    },
    forms: base(),
    moves: SCHOOL.brawler('gr', 1.0),
    specials: {
      // MERRY-GO-ROUND GUM: a wad of gum from the mouth that sticks you where you stand
      special1: { id: 'grGum', name: 'Merry-Go-Round Gum', type: 'telekinesis', kiCost: 22, icon: 'teleport', cooldown: 320, range: 16, startup: 14, maxFrames: 120, bossFrames: 50, kiPerSecond: 14, releaseStagger: 26, recovery: 18, mashGain: 0.08, escapeDecay: 0.004, cpuEscape: 0.007, poses: { focus: 'blastWind', hold: 'blastR' } },
      special2: rush('grTail', 'Tail Whip Rush', [{ pose: 'punchR', damage: 520, frames: 10, sfx: 'punchHeavy' }, { pose: 'kickR', damage: 560, frames: 10, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1200, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 }]),
      ultimate: rush('grRage', 'Giran\'s Rage', [{ pose: 'punchR', damage: 700, frames: 10, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 700, frames: 10, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2300, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 }], ult({ armor: true })),
    },
    ai: { personality: 'berserker', aggression: 0.62, defense: 0.5, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 2.2 },
    ...end('armsCrossed', 'grin'),
  });

  /* ============================================================== KING CHAPPA */
  C.king_chappa = fighter('king_chappa', {
    name: 'King Chappa', fullName: 'King Chappa (the 22nd World Martial Arts Tournament)', style: 'Eight-Arm Fist',
    card: ['Dragon Ball', 'The 22nd Tournament'], blurb: 'A king of martial arts whose Eight-Arm technique looks like he has eight hands. Built from memory.',
    ratings: { power: 3, speed: 3, ki: 2, defense: 3 },
    stats: stats({ hp: 14000, power: 1.02, canonPower: 0.15 }),
    appearance: {
      height: 1.1, skin: 0xb07a4a, build: build({ chestW: 0.23, shoulderX: 0.23, upperArmR: 0.062, foreArmR: 0.055 }),
      hair: { style: 'bald', color: 0xb07a4a },
      headExtras: [{ shape: 'ball', a: [0, -0.55, 0.8], d: [0, -1, 0.3], l: 0.05, r: 0.06, color: 0x141418, depth: 0.94, flat: 0.7, outline: 0.4 }],
      face: { pupil: 0x141414, browThick: 1.5, brow: 0x141418, jaw: 1.1 },
      outfit: { topStyle: 'bare', top: 0xb07a4a, arms: 0xb07a4a, belt: 0xd81e2a, beltStyle: 'sash', pants: 0xf0d040, pantsStyle: 'harem', wrist: 0xe0b030, wristLen: 0.06, boots: 0x6a3a1a, bootStyle: 'shoe' },
      portraitColor: '#d81e2a',
    },
    forms: base(),
    moves: SCHOOL.brawler('kc', 1.0),
    specials: {
      special1: shot('kcShot', 'Palm Shot', { color: 0xffb060, damage: 1200 }),
      // EIGHT-ARM FIST: so fast you see eight hands
      special2: rush('kcEight', 'Eight-Arm Fist', [0, 1, 2, 3, 4, 5, 6].map((i) => ({ pose: i % 2 ? 'punchL' : 'punchR', damage: 220, frames: 5, sfx: 'punchLight' })).concat([{ pose: 'hammer', damage: 900, frames: 14, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 28, impact: 3 }]), { poses: { wind: 'punchWindR' } }),
      ultimate: rush('kcStorm', 'Eight-Arm Storm', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ pose: i % 2 ? 'punchL' : 'punchR', damage: 300, frames: 5, sfx: 'punchLight' })).concat([{ pose: 'uppercut', damage: 2000, frames: 18, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 28, impact: 4 }]), ult({ poses: { wind: 'punchWindR' } })),
    },
    ai: { personality: 'martial', aggression: 0.66, defense: 0.55, ranged: 0.2, beam: 0, transformHp: 0, preferredRange: 2 },
    ...end('armsCrossed', 'smirk'),
  });

  /* ============================================================== SPIKE THE DEVIL MAN */
  C.devilman = fighter('devilman', {
    name: 'Spike the Devil Man', fullName: 'Spike the Devil Man (Baba\'s fighter)', style: 'Devil · Devilmite Beam',
    card: ['Dragon Ball', 'Fortuneteller Baba\'s fighters'], blurb: 'His Devilmite Beam turns the evil in a heart against it — which is why it never worked on Goku. Built from memory.',
    ratings: { power: 2, speed: 3, ki: 4, defense: 2 },
    stats: stats({ hp: 12000, ki: 130, canonPower: 0.1 }),
    appearance: {
      height: 0.98, skin: 0x6a5ab8, build: build(),
      hair: { style: 'bald', color: 0x6a5ab8 },
      headExtras: [1, -1].map((s) => ({ a: [s * 0.4, 0.85, 0.1], d: [s * 0.5, 1, 0], l: 0.08, r: 0.025, color: 0xf0e8d8, depth: 0.98, outline: 0.4 })),
      face: { pupil: 0xffd040, sclera: 0x1a1a2a, browThick: 1.2, brow: 0x2a1a5a, pointedEars: true, jaw: 1.02, mouthColor: 0x2a1a3a },
      outfit: { topStyle: 'bare', top: 0x6a5ab8, arms: 0x6a5ab8, belt: 0x1e1e24, beltStyle: 'belt', pants: 0x1e1e24, pantsStyle: 'tight', boots: 0x1e1e24, bootStyle: 'shoe', cape: 0x8a1a2a, longTail: { color: 0x6a5ab8, segments: 7, length: 0.7, radius: 0.02, lift: 0.4, curl: 0.5 } },
      portraitColor: '#6a5ab8',
    },
    forms: base({ color: 0xb04aff, core: 0xf0d8ff, particles: 0xd090ff }),
    moves: SCHOOL.swift('dv', 0.95),
    specials: {
      special1: shot('dvBolt', 'Devil Bolt', { color: 0xd04aff, damage: 1100 }),
      special2: step('dvVanish', 'Devil\'s Vanish', { modes: { behind: true, above: true }, shimmer: true }),
      ultimate: wave('dvMite', 'Devilmite Beam', 0xd04aff, 3600, { poses: { charge: 'g_finger', fire: 'g_finger' } }),
    },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.5, ranged: 0.55, beam: 0.4, transformHp: 0, preferredRange: 3.6 },
    ...end('armsCrossed', 'wicked'),
  });

  /* ============================================================== FANGS THE VAMPIRE · BANDAGES THE MUMMY */
  C.fangs = fighter('fangs', {
    name: 'Fangs the Vampire', fullName: 'Fangs the Vampire (Baba\'s fighter)', style: 'Vampire · Drain',
    card: ['Dragon Ball', 'Fortuneteller Baba\'s fighters'], blurb: 'Baba\'s vampire: quick, and he bites. Built from memory.',
    ratings: { power: 2, speed: 4, ki: 2, defense: 2 },
    stats: stats({ hp: 11500, speed: 1.1, canonPower: 0.05 }),
    appearance: {
      height: 0.96, skin: 0xd8d0e8, build: build({ chestW: 0.18, shoulderX: 0.18 }),
      hair: { style: 'zarbon', color: 0x141418 },
      face: { pupil: 0xd02a2a, eyeTilt: 0.22, browThick: 1.0, brow: 0x141418, pointedEars: true, mouthColor: 0x8a1a2a },
      outfit: { topStyle: 'shirt', top: 0xf0f0ea, sleeves: 'long', sleeveColor: 0x1e1e24, arms: 0x1e1e24, jacket: { color: 0x1e1e24, open: 1 }, pants: 0x1e1e24, pantsStyle: 'slacks', boots: 0x141418, bootStyle: 'shoe', cape: 0x6a1a2a },
      portraitColor: '#6a1a2a',
    },
    forms: base({ color: 0xd02a4a, core: 0xffd8e0, particles: 0xe86a7a }),
    moves: SCHOOL.swift('fg', 0.9),
    specials: {
      special1: shot('fgBats', 'Bat Swarm', { count: 4, spread: 0.32, radius: 0.3, damage: 380, color: 0x3a1a2a, core: 0xd02a4a, homing: 0.7, knock: 'flinch' }),
      special2: step('fgMist', 'Mist Step', { shimmer: true }),
      ultimate: rush('fgBite', 'Vampire Bite', [{ pose: 'grab', damage: 600, frames: 12, sfx: 'punchLight' }, { pose: 'punchR', damage: 700, frames: 10, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1800, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 }], ult({})),
    },
    ai: { personality: 'aggressive', aggression: 0.66, defense: 0.45, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 2.4 },
    ...end('armsCrossed', 'wicked'),
  });
  C.bandages = fighter('bandages', {
    name: 'Bandages the Mummy', fullName: 'Bandages the Mummy (Baba\'s fighter)', style: 'Mummy · Crusher',
    card: ['Dragon Ball', 'Fortuneteller Baba\'s fighters'], blurb: 'Baba\'s mummy: wrapped head to foot, slow and immensely strong. Built from memory.',
    ratings: { power: 4, speed: 1, ki: 1, defense: 4 },
    stats: stats({ hp: 17000, speed: 0.86, power: 1.12, defense: 1.15, weight: 1.5, canonPower: 0.1 }),
    poise: { max: 60, regen: 12, regenDelay: 100, armor: 1, cost: { 1: 7, 2: 12, 3: 18, 4: 28 }, beamMul: 1.2, breakFrames: 120, vulnerable: 1.25 },
    appearance: {
      height: 1.28, skin: 0xe8dcc0, build: build({ chestW: 0.26, chestD: 0.18, shoulderX: 0.26, waistW: 0.17, upperArmR: 0.074, foreArmR: 0.066, fist: 0.074, thighR: 0.1, shinR: 0.078 }),
      hair: { style: 'skullcap', color: 0xe8dcc0 },
      face: { pupil: 0xffd040, sclera: 0x1a1a1a, browThick: 0.5, brow: 0xd8ccb0, noEars: true, mouthColor: 0x5a4a3a },
      outfit: { topStyle: 'bare', top: 0xe8dcc0, arms: 0xe8dcc0, pants: 0xe8dcc0, pantsStyle: 'tight', legs: 0xe8dcc0, boots: 0xe8dcc0, bootStyle: 'gi', armBands: 0xc8bca0, armBandAt: 0.5, legBands: 0xc8bca0, wrist: 0xc8bca0, wristLen: 0.1 },
      portraitColor: '#e8dcc0',
    },
    forms: base({ color: 0xe8dcc0, core: 0xffffff, particles: 0xf0e8d0 }),
    moves: SCHOOL.brawler('bg2', 1.2),
    specials: {
      special1: rush('bg2Grab', 'Mummy\'s Grip', [{ pose: 'grab', damage: 900, frames: 14, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1100, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 30, impact: 3 }], { armor: true }),
      special2: { id: 'bg2Stomp', name: 'Tomb Stomp', type: 'groundSlam', kiCost: 26, icon: 'down', cooldown: 220, crouch: 20, hang: 22, height: 4, maxRange: 14, radius: 6.5, clearHeight: 2, damage: 1800, knockSpeed: 20, recovery: 36, ringColor: 0xe8dcc0, coreColor: 0xffffff, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' } },
      ultimate: rush('bg2Crush', 'Ancient Crush', [{ pose: 'punchR', damage: 800, frames: 12, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 800, frames: 12, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2500, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 }], ult({ armor: true })),
    },
    ai: { personality: 'berserker', aggression: 0.6, defense: 0.5, ranged: 0.1, beam: 0, transformHp: 0, preferredRange: 1.8 },
    ...end('armsCrossed', 'neutral'),
  });

  /* ============================================================== RED RIBBON ARMY: SILVER · METALLITRON · MURASAKI · BLACK */
  const RRcap = [{ shape: 'ball', a: [0, 0.52, 0.86], d: [0, 0.3, 1], l: 0.01, r: 0.085, color: 0x1e2448, depth: 1.0, flat: 0.2, outline: 0.5 }, { shape: 'ball', a: [0, 0.76, 0.62], d: [0, 0.4, 1], l: 0.01, r: 0.03, color: RR, depth: 1.02, flat: 0.3, outline: 0.3 }];
  C.colonel_silver = fighter('colonel_silver', {
    name: 'Colonel Silver', fullName: 'Colonel Silver (Red Ribbon Army)', style: 'Officer · Brawler',
    card: ['Dragon Ball', 'Red Ribbon Army'], blurb: 'The first Red Ribbon officer Goku met — and the first he knocked flat. Built from memory.',
    ratings: { power: 3, speed: 2, ki: 1, defense: 3 },
    stats: stats({ hp: 13000, canonPower: 0.05 }),
    appearance: {
      height: 1.12, skin: 0xf0c8a0, build: build({ chestW: 0.23, shoulderX: 0.23 }),
      hair: { style: 'cropped', color: 0xc8c8cc }, headExtras: RRcap,
      face: { pupil: 0x141414, browThick: 1.3, brow: 0xa8a8ac, jaw: 1.1 },
      outfit: { topStyle: 'shirt', top: 0x6a7a4a, sleeves: 'long', sleeveColor: 0x6a7a4a, arms: 0x6a7a4a, cap: 0x6a7a4a, belt: 0x2a2a2a, beltStyle: 'belt', buckle: 0xe0b030, pants: 0x4a5a3a, pantsStyle: 'harem', boots: 0x141418, bootStyle: 'saiyan' },
      portraitColor: '#6a7a4a',
    },
    forms: base(),
    moves: SCHOOL.brawler('cs', 1.0),
    specials: {
      special1: shot('csShot', 'Officer\'s Shot', { color: 0xffe0a0 }),
      special2: rush('csRush', 'Drill Rush', [{ pose: 'punchR', damage: 480, frames: 9, sfx: 'punchHeavy' }, { pose: 'kickR', damage: 520, frames: 9, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1100, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 4 }]),
      ultimate: rush('csFury', 'Red Ribbon Fury', [{ pose: 'punchR', damage: 600, frames: 8, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 600, frames: 8, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2000, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 }], ult({})),
    },
    ai: { personality: 'aggressive', aggression: 0.6, defense: 0.5, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 2.2 },
    ...end('armsCrossed', 'smirk'),
  });
  C.metallitron = fighter('metallitron', {
    name: 'Major Metallitron', fullName: 'Major Metallitron (Muscle Tower)', style: 'Robot · Unbreakable',
    card: ['Dragon Ball', 'Muscle Tower'], blurb: 'Muscle Tower\'s metal giant, who keeps getting up because he is a machine. Built from memory.',
    ratings: { power: 4, speed: 1, ki: 1, defense: 5 },
    stats: stats({ hp: 18000, speed: 0.86, power: 1.1, defense: 1.25, weight: 1.6, canonPower: 0.1 }),
    poise: { max: 80, regen: 14, regenDelay: 100, armor: 2, cost: { 1: 5, 2: 9, 3: 14, 4: 24 }, beamMul: 1.2, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.4, skin: 0x8a8e98, metal: 0.6, build: build({ chestW: 0.28, chestD: 0.2, shoulderX: 0.28, waistW: 0.2, upperArmR: 0.08, foreArmR: 0.074, fist: 0.084, thighR: 0.11, shinR: 0.086, headR: 0.12, neckR: 0.09 }),
      hair: { style: 'skullcap', color: 0x6a6e78 },
      face: { pupil: 0xd02a2a, sclera: 0x1a1a1e, browThick: 1.6, brow: 0x5a5e68, noEars: true, jaw: 1.2, mouthColor: 0x2a2a2e },
      outfit: { topStyle: 'armor', top: 0x4a5a3a, arms: 0x8a8e98, pants: 0x4a5a3a, pantsStyle: 'tight', boots: 0x3a3a3e, bootStyle: 'saiyan', armor: { plate: 0x4a5a3a, belly: 0x4a5a3a, pads: 0x8a8e98, padStyle: 'up', trim: RR } },
      portraitColor: '#8a8e98',
    },
    forms: base(),
    moves: SCHOOL.brawler('mt', 1.15),
    specials: {
      special1: rush('mtCharge', 'Iron Charge', [{ pose: 'punchR', damage: 1300, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 30, impact: 3 }], { armor: true, poses: { wind: 'punchWindR' } }),
      special2: { id: 'mtStomp', name: 'Steel Stomp', type: 'groundSlam', kiCost: 26, icon: 'down', cooldown: 220, crouch: 20, hang: 22, height: 4, maxRange: 14, radius: 7, clearHeight: 2, damage: 1800, knockSpeed: 20, recovery: 36, ringColor: 0xd8e0ff, coreColor: 0xffffff, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' } },
      ultimate: rush('mtCrush', 'Muscle Tower Crush', [{ pose: 'punchR', damage: 850, frames: 12, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 850, frames: 12, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2500, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 }], ult({ armor: true })),
    },
    mechanic: { type: 'tireless', name: 'Machine Body', desc: 'A robot: he does not tire and his ki refills.' },
    ai: { personality: 'berserker', aggression: 0.6, defense: 0.55, ranged: 0.1, beam: 0, transformHp: 0, preferredRange: 1.8 },
    ...end('armsCrossed', 'neutral'),
  });
  C.ninja_murasaki = fighter('ninja_murasaki', {
    name: 'Ninja Murasaki', fullName: 'Ninja Murasaki (Muscle Tower)', style: 'Ninja · Tricks',
    card: ['Dragon Ball', 'Muscle Tower'], blurb: 'The Red Ribbon Army\'s ninja: throwing stars, smoke and a vanishing step. Built from memory.',
    ratings: { power: 2, speed: 4, ki: 2, defense: 2 },
    stats: stats({ hp: 11500, speed: 1.12, canonPower: 0.05 }),
    appearance: {
      height: 0.94, skin: 0xf0c8a0, build: build({ chestW: 0.18, shoulderX: 0.18 }),
      hair: { style: 'skullcap', color: 0x6a3ab8 },
      headExtras: [{ shape: 'ball', a: [0, -0.4, 0.92], d: [0, -0.1, 1], l: 0.01, r: 0.1, color: 0x6a3ab8, depth: 1.0, flat: 0.4, outline: 0.4 }],
      face: { pupil: 0x141414, browThick: 1.2, brow: 0x141418, eyeTilt: 0.16 },
      outfit: { topStyle: 'gi', top: 0x6a3ab8, sleeves: 'long', sleeveColor: 0x6a3ab8, belt: 0x1e1e24, pants: 0x6a3ab8, pantsStyle: 'tight', legBands: 0x1e1e24, boots: 0x1e1e24, bootStyle: 'shoe' },
      portraitColor: '#6a3ab8',
    },
    forms: base({ color: 0xb08aff, core: 0xffffff, particles: 0xc8a8ff }),
    moves: SCHOOL.swift('nj', 0.9),
    specials: {
      special1: shot('njStars', 'Throwing Stars', { kind: 'disc', count: 3, spread: 0.4, radius: 0.22, speed: 90, damage: 420, color: 0xc8ccd8, core: 0xffffff, homing: 0.3, knock: 'flinch' }, { pose: { wind: 'throwWind', release: 'throwRelease' } }),
      special2: step('njSmoke', 'Smoke Step', { shimmer: true }),
      ultimate: rush('njShadow', 'Shadow Strike', [{ pose: 'g_jab', damage: 500, frames: 6, sfx: 'punchLight' }, { pose: 'g_kick', damage: 550, frames: 7, sfx: 'punchHeavy' }, { pose: 'g_spinKick', damage: 600, frames: 8, sfx: 'punchHeavy' }, { pose: 'g_axeKick', damage: 1800, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 }], ult({ speed: 78 })),
    },
    ai: { personality: 'aggressive', aggression: 0.6, defense: 0.5, ranged: 0.45, beam: 0, transformHp: 0, preferredRange: 3 },
    ...end('armsCrossed', 'smirk'),
  });
  C.staff_officer_black = fighter('staff_officer_black', {
    name: 'Staff Officer Black', fullName: 'Staff Officer Black (Red Ribbon Army)', style: 'Officer · Battle Jacket',
    card: ['Dragon Ball', 'Red Ribbon Army'], blurb: 'Commander Red\'s right hand, who took the army over — and climbed into the Battle Jacket. Built from memory.',
    ratings: { power: 3, speed: 2, ki: 2, defense: 3 },
    stats: stats({ hp: 13000, canonPower: 0.1 }),
    appearance: {
      height: 1.18, skin: 0x7a4a2a, build: build({ chestW: 0.23, shoulderX: 0.23 }),
      hair: { style: 'cropped', color: 0x141418 }, headExtras: RRcap,
      face: { pupil: 0x141414, browThick: 1.3, brow: 0x141418, jaw: 1.1 },
      outfit: { topStyle: 'shirt', top: 0x2a2a2e, sleeves: 'long', sleeveColor: 0x2a2a2e, arms: 0x2a2a2e, cap: 0x2a2a2e, belt: 0x141418, beltStyle: 'belt', buckle: 0xe0b030, pants: 0x2a2a2e, pantsStyle: 'harem', boots: 0x141418, bootStyle: 'saiyan' },
      portraitColor: '#2a2a2e',
    },
    forms: [
      base()[0],
      {
        // THE BATTLE JACKET: the Red Ribbon's last machine, with him inside it
        id: 'jacket', name: 'Battle Jacket', short: 'BATTLE JACKET', kiCost: 40, style: 'full',
        aura: { color: 0xff6a3a, core: 0xffe0c8, particles: 0xff9a6a, idle: 0.3, speed: 1.2 },
        mult: { damage: 1.7, speed: 0.92, defense: 1.9, kiRegen: 1.2, chargeRate: 1.1, guardStamina: 1.5 },
        look: { scale: 1.45, bulk: 1.4, muscle: 1.2, skin: 0x5a6a7a, swap: { [0x2a2a2e]: 0x4a5a6a } },
        practiced: { length: 84, applyAt: 44, steps: [{ at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.5, sfx: 'kiUp' }, { at: 44, burst: true, small: true, pose: 'powerUp', speed: 12, expression: 'shout', flash: 0.3, crater: 3 }, { at: 70, pose: 'armsCrossed', expression: 'smirk' }] },
        specials: {
          special1: shot('sbMissiles', 'Missile Barrage', { count: 4, spread: 0.6, speed: 70, radius: 0.3, damage: 700, homing: 0.8, color: 0xff8a3a, core: 0xfff0c0, explode: 2.6, knock: 'push' }, { pose: { wind: 'blastWind', release: 'blastR' } }),
        },
      },
    ],
    moves: SCHOOL.brawler('sb', 1.0),
    specials: {
      special1: shot('sbPistol', 'Officer\'s Pistol', { kind: 'blast', speed: 110, radius: 0.16, damage: 700, homing: 0.05, color: 0xfff0a0, knock: 'flinch', explode: 0.6 }, { cooldown: 40, startup: 8 }),
      special2: rush('sbRush', 'Red Ribbon Rush', [{ pose: 'punchR', damage: 520, frames: 9, sfx: 'punchHeavy' }, { pose: 'kickR', damage: 560, frames: 9, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1200, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 4 }]),
      ultimate: { id: 'sbCannon', name: 'Jacket Cannon', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true, startup: 36, recovery: 34, pose: { wind: 'throwWind', release: 'blastR' }, projectile: { kind: 'heavy', speed: 56, radius: 1.3, damage: 3800, homing: 0.5, color: 0xff8a3a, core: 0xfff0c0, explode: 10, knock: 'smash', knockSpeed: 40, impact: 5, life: 3 } },
    },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.55, ranged: 0.45, beam: 0, transformHp: 0.6, preferredRange: 3 },
    ...end('armsCrossed', 'smirk'),
  });

  /* ============================================================== MR. SEE-THROUGH */
  // Baba's invisible fighter (built from memory: the board names him without a picture). The body under the cloak is a
  // plain fighter in a sleeveless top and dark trousers — the rig shows it only when he is hit, attacks or is caught.
  // Mechanics.invisible makes the fight: a glassy shimmer with a shadow and footfalls, the wind-up of every attack shown,
  // a full flicker into view on a hit. Fast and fragile: he wins by not being where you look.
  C.see_through = fighter('see_through', {
    name: 'Mr. See-Through', fullName: 'Mr. See-Through (Fortuneteller Baba\'s fighter)', style: 'Invisible · Hit and Fade',
    card: ['Dragon Ball', 'Baba\'s invisible fighter'], blurb: 'Nobody has ever seen his face. Watch the shimmer, the shadow and the dust — and the moment he swings. Built from memory.',
    ratings: { power: 2, speed: 4, ki: 2, defense: 1 },
    stats: stats({ hp: 10500, ki: 110, speed: 1.12, power: 0.95, defense: 0.85, canonPower: 0.15 }),
    appearance: {
      height: 0.98, skin: 0xe8c8a8, build: build({ chestW: 0.19, shoulderX: 0.19, upperArmR: 0.048, foreArmR: 0.043 }),
      hair: { style: 'cropped', color: 0x3a2a24 },
      face: { pupil: 0x141414, browThick: 1.1, brow: 0x3a2a24, jaw: 1.0 },
      outfit: { topStyle: 'shirt', top: 0xf0eee6, pants: 0x3a3a46, pantsStyle: 'gi', belt: 0x6a4a2a, beltStyle: 'sash', wrist: 0x6a4a2a, boots: 0x2a2a30, bootStyle: 'gi' },
      portraitColor: '#bfe8ff',
    },
    forms: base({ color: 0xd8f0ff, core: 0xffffff, particles: 0xe8f8ff, idle: 0 }),
    moves: SCHOOL.swift('st', 1.05),
    specials: {
      // UNSEEN BARRAGE: blows from nowhere — the first one is the only warning
      special1: rush('stBarrage', 'Unseen Barrage', [
        { pose: 'g_jab', damage: 420, frames: 8, sfx: 'punchLight' },
        { pose: 'g_cross', damage: 440, frames: 8, sfx: 'punchLight' },
        { pose: 'g_kick', damage: 520, frames: 9, sfx: 'punchHeavy' },
        { pose: 'g_spinKick', damage: 900, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 26, impact: 3 },
      ], { kiCost: 26, cooldown: 90 }),
      // SLIP AWAY: gone again — behind you, or out of reach
      special2: step('stSlip', 'Slip Away'),
      // INVISIBLE ONSLAUGHT: from every side at once, and you never see where the next one comes from
      ultimate: rush('stOnslaught', 'Invisible Onslaught', [
        { pose: 'g_jab', damage: 520, frames: 7, sfx: 'punchLight' },
        { pose: 'g_kick', damage: 560, frames: 7, sfx: 'punchHeavy' },
        { pose: 'g_cross', damage: 560, frames: 7, sfx: 'punchLight' },
        { pose: 'g_spinKick', damage: 640, frames: 8, sfx: 'punchHeavy' },
        { pose: 'g_axeKick', damage: 2200, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
      ], ult({ startup: 10, dashFrames: 22, speed: 70 })),
    },
    mechanic: { type: 'invisible', name: 'Invisible', desc: 'You cannot see him — only his shimmer, his shadow and the dust at his feet. Every attack shows him for its wind-up, and a hit lights him up for a moment.' },
    ai: { personality: 'martial', aggression: 0.75, defense: 0.35, ranged: 0.1, beam: 0, transformHp: 0, preferredRange: 1.8 },
    ...end('armsCrossed', 'smirk'),
  });

  /* ============================================================== SUPPORT ROLES: COMMANDER RED · GENERAL WHITE */
  const support = (id, name, o) => Object.assign({
    id, assetLevel: 1, name, playable: false, support: true, prototype: true, era: 'Dragon Ball',
    stats: { hp: 6000, ki: 60, stamina: 100, speed: 1, power: 0.3, defense: 0.5, weight: 0.8, kiRegen: 1, chargeRate: 20, canonPower: 0.05 },
    forms: base(), moves: { light: [], heavy: {} }, specials: {},
    poses: { idle: (t) => Object.assign({}, SL.data.poses.armsCrossed, { root: { y: Math.sin(t * 1.4) * 0.003 } }) },
    intro: { pose: 'idle', expression: 'angry' },
  }, o);
  C.commander_red = support('commander_red', 'Commander Red', {
    fullName: 'Commander Red (Red Ribbon Army)', blurb: 'The Red Ribbon Army\'s commander, who wanted the Dragon Balls to be taller. A story role. Built from memory.',
    appearance: {
      height: 0.72, skin: 0xf0c8a0, build: build({ chestW: 0.16, shoulderX: 0.16, headR: 0.13 }),
      hair: { style: 'cropped', color: 0xd84a1a }, headExtras: [{ shape: 'ball', a: [0, 0.3, 1], d: [0, 0, 1], l: 0.005, r: 0.04, color: 0x141418, depth: 1.04, flat: 0.4, outline: 0.3 }],
      face: { pupil: 0x141414, browThick: 1.2, brow: 0xd84a1a, jaw: 1.0 },
      outfit: { topStyle: 'shirt', top: 0xc82a2a, sleeves: 'long', sleeveColor: 0xc82a2a, arms: 0xc82a2a, belt: 0x141418, beltStyle: 'belt', buckle: 0xe0b030, pants: 0x2a2a2e, pantsStyle: 'slacks', boots: 0x141418, bootStyle: 'saiyan' },
      portraitColor: '#c82a2a',
    },
  });
  C.general_white = support('general_white', 'General White', {
    fullName: 'General White (Muscle Tower)', blurb: 'The commander of Muscle Tower, who watched from the control room. A story role. Built from memory.',
    appearance: {
      height: 1.02, skin: 0xf0c8a0, build: build(),
      hair: { style: 'cropped', color: 0x6a5a4a }, headExtras: RRcap,
      face: { pupil: 0x141414, browThick: 1.2, brow: 0x6a5a4a, jaw: 1.04 },
      outfit: { topStyle: 'shirt', top: 0xf0f0ea, sleeves: 'long', sleeveColor: 0xf0f0ea, arms: 0xf0f0ea, cap: 0xf0f0ea, belt: 0x141418, beltStyle: 'belt', buckle: 0xe0b030, pants: 0xf0f0ea, pantsStyle: 'harem', boots: 0x141418, bootStyle: 'saiyan' },
      portraitColor: '#f0f0ea',
    },
  });
})();
