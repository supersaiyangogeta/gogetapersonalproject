/*
 * MOVIE VILLAINS (roster continuation, 2026-10-15) — MOVIE continuity, Free Battle only, each from its own film and
 * never placed in the canon chronology. Looks from the owner's visual reference (dbz visual reference.pdf) where it
 * has a picture; "from memory" where it does not.
 *
 *   BOJACK       (p.216, "Bojack Unbound") the Galactic Pirates' captain: green skin and a huge red mane in his full
 *                power, lavender baggy trousers, a teal sash, yellow-green boots. Base → Full Power (the silhouette
 *                grows, the reach with it). Grand Smasher, Galactic Tyrant, Galactic Buster.
 *   ZANGYA       (p.217) teal skin, a mass of orange curls, a white vest over blue, a purple wrap, cream trousers, gold
 *                boots, black gloves. Faster and lighter than Bojack: kicks, a three-shot fan, a vanish.
 *   GARLIC JR.   (p.218, "Dead Zone") small, pale green-blue, bald (the skull's spots are not modelled), long pointed ears, a black robe with
 *                the crest, a white cape. Base → Super Garlic Jr. (the body swells). The Dead Zone grip.
 *   LORD SLUG    (p.211, "Lord Slug") a Namekian warlord — not Piccolo's model: a heavier, older face, dark armour
 *                with wide pads and a long cape. Base → Giant (he grows, the board's "size-changing phase"), with
 *                broad-range attacks.
 *
 * Level 1 prototypes on the shared rig.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const GK = C.goku, PC = C.piccolo;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 12, active: 4, recovery: 22, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const base = (aura) => ({ id: 'base', name: 'Base', aura: aura || { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} });
  const practiced = (idle) => ({ length: 84, applyAt: 44, steps: [{ at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.5, quake: 0.15, sfx: 'kiUp' }, { at: 44, burst: true, small: true, pose: 'powerUp', speed: 12, expression: 'shout', flash: 0.3, crater: 3 }, { at: 70, pose: idle, expression: 'smirk' }] });

  /* ============================================================== BOJACK */
  const BJ_SKIN = 0x4ab0b8, BJ_FULL = 0x7ab83a, BJ_HAIR = 0xd8401a;
  const bjPoses = {
    // a pirate captain at ease: one fist on the hip, chest out, head back
    bj_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: b * 0.004 }, hips: [0, 6, 0], spine: [-4, 0, 0], chest: [-8 + b * 0.6, 6, 0], head: [-10, -6, 0],
        shoulderL: [-10, 0, 40], elbowL: [-96, 0, 0], shoulderR: [-20, 0, -20], elbowR: [-40, 0, 0],
        thighL: [-4, 8, 12], kneeL: [6, 0, 0], thighR: [4, -8, -12], kneeR: [8, 0, 0], hands: ['fist', 'open'],
      };
    },
    // full power: crouched forward, hands open like claws
    bj_fullIdle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.08 + b * 0.01 }, spine: [14, 0, 0], chest: [12 + b, 0, 0], head: [-10, 0, 0],
        shoulderL: [-40, 0, 50], elbowL: [-50, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-70, 0, 0],
        thighL: [-24, 12, 22], kneeL: [36, 0, 0], thighR: [10, -12, -22], kneeR: [24, 0, 0], hands: ['open', 'fist'],
      };
    },
    // the Galactic Buster: both hands drawn back to one side, then thrown forward
    bj_busterW: { root: { y: -0.04 }, spine: [0, 30, 0], chest: [0, 36, 0], head: [-4, -30, 0], shoulderR: [-40, 0, 30], elbowR: [-80, 0, 0], shoulderL: [-50, 40, 40], elbowL: [-90, 0, 0], thighL: [-18, 10, 14], kneeL: [24, 0, 0], thighR: [10, -10, -14], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    bj_buster: { root: { y: -0.06, rx: 6 }, spine: [6, -10, 0], chest: [8, -14, 0], head: [-6, 10, 0], shoulderR: [-88, 0, -4], elbowR: [-4, 0, 0], shoulderL: [-86, 0, 4], elbowL: [-4, 0, 0], thighL: [-26, 10, 14], kneeL: [34, 0, 0], thighR: [12, -10, -14], kneeR: [16, 0, 0], hands: ['open', 'open'] },
  };
  C.bojack = {
    id: 'bojack', assetLevel: 1, name: 'Bojack', fullName: 'Bojack (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Pirate Captain · Full Power',
    card: ['Movie', 'Bojack Unbound'],
    blurb: 'The Galactic Pirates\' captain, sealed away by the Kais and freed when King Kai\'s planet was destroyed. He plays with his food.',
    ratings: { power: 5, speed: 3, ki: 4, defense: 4 },
    stats: { hp: 30000, ki: 150, stamina: 160, speed: 1.06, power: 1.35, defense: 1.25, weight: 1.3, kiRegen: 3.4, chargeRate: 38, canonPower: 7 },
    poise: { max: 70, regen: 14, regenDelay: 100, armor: 1, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.1, skin: BJ_SKIN,
      build: { chestW: 0.25, chestD: 0.16, shoulderX: 0.25, waistW: 0.15, upperArmR: 0.07, foreArmR: 0.062, fist: 0.068, thighR: 0.098, shinR: 0.072, headR: 0.122, neckR: 0.07 },
      hair: { style: 'broly', color: BJ_HAIR },
      face: { pupil: 0x141414, browThick: 1.4, brow: BJ_HAIR, jaw: 1.12, jawW: 1.06, pointedEars: true, mouthColor: 0x4a1a1a },
      outfit: {
        topStyle: 'bare', top: BJ_SKIN, arms: BJ_SKIN, wrist: 0xe0b030, wristLen: 0.1,
        belt: 0x2a7a8a, beltStyle: 'sash', hem: { color: 0x2a7a8a, len: 0.22, flare: 1.2 },
        pants: 0xd8d0e8, pantsStyle: 'harem', boots: 0xc8c83a, bootTip: 0x2a4ab8, bootStyle: 'saiyan',
      },
      props: [{ id: 'collar', shape: 'neckRing', joint: 'neck', pos: [0, 0.01, 0.004], radius: 0.094, thick: 0.2, color: 0xe0b030 }],
      portraitColor: '#2a7a8a',
    },
    forms: [
      base(),
      {
        id: 'full', name: 'Full Power', short: 'FULL POWER', kiCost: 50, style: 'full',
        aura: { color: 0x9aff4a, core: 0xf0ffd0, particles: 0xb8ff7a, idle: 0.4, speed: 1.4, sharp: 0.3 },
        mult: { damage: 1.6, speed: 1.06, defense: 1.5, kiRegen: 1.3, chargeRate: 1.2, guardStamina: 1.3 },
        look: { skin: BJ_FULL, scale: 1.12, bulk: 1.18, muscle: 1.24, hair: { style: 'broly_full', color: BJ_HAIR }, brow: BJ_HAIR },
        practiced: practiced('bj_fullIdle'),
        poses: { idle: bjPoses.bj_fullIdle },
        ai: { aggression: 0.9, defense: 0.4 },
      },
    ],
    poses: Object.assign({}, GK.poses, bjPoses, { idle: bjPoses.bj_idle }),
    moves: {
      light: [
        lt('bjJab', 'punchWindR', 'punchR', 640),
        lt('bjBack', 'g_elbowW', 'g_elbow', 700, { hitPose: 'hitSideL' }),
        lt('bjKnee', 'kickWindR', 'kickR', 780, { startup: 7, reach: 1.35, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('bjSmash', 'hammerWind', 'hammer', 1800, { knock: 'smash', knockSpeed: 36, impact: 4, armor: true }),
        2: hv('bjUpper', 'uppercutWind', 'uppercut', 1500, { startup: 10, knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('bjRam', 'punchWindR', 'punchR', 1200, { startup: 5, active: 10, recovery: 16, lunge: 36, hitstun: 28, hitPose: 'hitBody' }),
      throw: { id: 'bjToss', name: 'Pirate\'s Toss', damage: 1500, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // GRAND SMASHER: a wide wave of ki from one palm — it reaches farther than it looks
      special1: {
        id: 'bjSmasher', name: 'Grand Smasher', type: 'projectile', kiCost: 28, icon: 'ball',
        startup: 14, recovery: 20, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'heavy', speed: 58, radius: 1.1, damage: 2000, homing: 0.4, color: 0x9aff4a, core: 0xf0ffd0, explode: 6, knock: 'heavy', knockSpeed: 26, impact: 3, guardPierce: 0.4, life: 2.8 },
      },
      // GALACTIC TYRANT: in, a beating, and the boot to finish
      special2: {
        id: 'bjTyrant', name: 'Galactic Tyrant', type: 'rush', kiCost: 32, icon: 'rush',
        startup: 8, dashFrames: 22, speed: 60, armor: true, recovery: 22,
        poses: { wind: 'punchWindR' },
        hits: [
          { pose: 'punchR', damage: 600, frames: 9, sfx: 'punchHeavy' },
          { pose: 'g_elbow', damage: 640, frames: 9, sfx: 'punchHeavy' },
          { pose: 'uppercut', damage: 800, frames: 12, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 14, impact: 3 },
          { pose: 'hammer', damage: 1400, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 },
        ],
      },
      // GALACTIC BUSTER: both hands, one huge green ball
      ultimate: {
        id: 'bjBuster', name: 'Galactic Buster', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 44, recovery: 40, pose: { wind: 'bj_busterW', release: 'bj_buster' },
        projectile: { kind: 'ball', speed: 38, radius: 2.4, damage: 5400, homing: 0.5, color: 0x7aff3a, core: 0xf0ffd0, explode: 13, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.2 },
      },
    },
    blast: { color: 0x9aff4a, core: 0xf0ffd0, damage: 230, speed: 60, radius: 0.34 },
    ai: { personality: 'aggressive', aggression: 0.76, defense: 0.5, ranged: 0.4, beam: 0, transformHp: 0.6, preferredRange: 2.6 },
    intro: { pose: 'bj_idle', expression: 'smirk' },
    victory: { poses: ['bj_idle'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== ZANGYA */
  const ZG_SKIN = 0x46b8a8;
  const zgPoses = {
    // hands on her hips, weight on one leg, a sideways look
    zg_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: b * 0.006 }, hips: [0, -8, 6], spine: [-2, 0, -4], chest: [-2 + b, 6, 0], head: [-4, -12, 4],
        shoulderL: [-10, 0, 40], elbowL: [-96, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-96, 0, 0],
        thighL: [6, 10, 10], kneeL: [14, 0, 0], thighR: [-4, -4, -4], kneeR: [6, 0, 0], hands: ['fist', 'fist'],
      };
    },
  };
  // ZANGYA'S HAIR (2026-10-15, the board p.217): a cloud of curls in mixed sizes heaped high over the crown and spilling
  // down her back to the waist, heavier on her left; corkscrew ringlets at the sides of the face and at the ends of the
  // mane; curled locks swirling over the cloud. Positions are in head radii from the head's centre (+x her left, +z the
  // front); curled locks keep their true curve (`curl`). One shade darker in the cascade, so the masses read apart
  const ZG_HAIR = 0xff9a2a, ZG_HAIR_DEEP = 0xf08a22;
  const zgPuff = ([x, y, z, r, c]) => ({ shape: 'ball', a: [x, y, z], d: [x, y + 0.2, z], l: r * 0.9, r, flat: 1, color: c || ZG_HAIR, depth: Math.hypot(x, y, z), outline: 0.5 });
  const zgCurl = ([x, y, z, dx, dy, dz, l, r, bend, tx, ty, tz, c]) => ({ a: [x, y, z], d: [dx, dy, dz], l, r, bend, curl: true, toward: [tx, ty, tz], color: c || ZG_HAIR, depth: Math.hypot(x, y, z), outline: 0.5 });
  const ZG_HAIR_EXTRAS = [
    // the cloud over the crown: big soft masses, smaller ones at its edges
    [0, 1.42, -0.15, 0.18], [0.35, 1.36, -0.55, 0.13], [-0.32, 1.34, -0.5, 0.12], [0.48, 1.18, 0.12, 0.11], [-0.52, 1.12, 0.02, 0.12], [0.12, 1.08, 0.55, 0.075],
    [0, 0.98, -0.88, 0.14], [0.88, 0.78, -0.35, 0.115], [-0.92, 0.72, -0.3, 0.1], [0.98, 0.18, -0.45, 0.1], [-1.02, 0.12, -0.42, 0.09],
    // the mane down her back to the waist, heavier on her left, a shade deeper
    [0.25, -0.3, -1.3, 0.15], [-0.4, -0.45, -1.2, 0.115], [0.55, -1.2, -1.4, 0.16, ZG_HAIR_DEEP], [-0.25, -1.45, -1.4, 0.12, ZG_HAIR_DEEP],
    [0.7, -2.2, -1.35, 0.15], [0.1, -2.5, -1.45, 0.11, ZG_HAIR_DEEP], [0.62, -3.1, -1.3, 0.12, ZG_HAIR_DEEP], [0.2, -3.45, -1.35, 0.09],
  ].map(zgPuff).concat([
    // corkscrew ringlets hanging beside the face (two on her right, one on her left) and at the ends of the mane
    [-1.04, -0.1, 0.25, -0.15, -1, 0.1, 0.2, 0.042, 3.4, -1, 0, 0.3],
    [-0.98, -0.62, 0.02, -0.1, -1, 0, 0.17, 0.036, 3.8, -1, 0, -0.2],
    [1.04, -0.15, 0.08, 0.15, -1, 0, 0.19, 0.04, 3.5, 1, 0, 0.2],
    [0.78, -3.35, -1.15, 0.3, -1, 0, 0.18, 0.045, 3.5, 1, 0, 0, ZG_HAIR_DEEP],
    [0.12, -3.75, -1.2, -0.2, -1, 0, 0.15, 0.04, 3.7, -1, 0, 0],
    // curled locks swirling over the cloud
    [0.62, 1.22, 0.3, 1, 0.3, 0.2, 0.16, 0.045, 2.6, 0, -1, 0],
    [-0.7, 1.15, 0.22, -1, 0.3, 0.2, 0.15, 0.042, 2.6, 0, -1, 0],
    [1.0, 0.42, -0.1, 0.3, 1, 0, 0.14, 0.04, 3.0, 1, 0, 0],
  ].map(zgCurl))
    // the whole mass moves like hair (Model.tick): it sways, bounces on a jump or a landing, and keeps hanging when she
    // throws her head back
    .map((x) => Object.assign({}, x, { sway: true }));
  C.zangya = {
    id: 'zangya', assetLevel: 1, name: 'Zangya', fullName: 'Zangya (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Agile · Aerial',
    card: ['Movie', 'Bojack Unbound'],
    blurb: 'Bojack\'s lieutenant: fast, cruel and amused. She never lets you land.',
    ratings: { power: 3, speed: 5, ki: 3, defense: 2 },
    stats: { hp: 20000, ki: 130, stamina: 130, speed: 1.2, power: 1.15, defense: 0.95, weight: 0.85, kiRegen: 3.2, chargeRate: 38, canonPower: 5 },
    appearance: {
      height: 0.94, skin: ZG_SKIN,
      build: { chestW: 0.18, chestD: 0.12, shoulderX: 0.18, waistW: 0.11, waistD: 0.1, pelvisW: 0.14, upperArmR: 0.045, foreArmR: 0.04, fist: 0.044, thighR: 0.076, shinR: 0.056, headR: 0.122, neckR: 0.045 },
      // her own curls (ZG_HAIR_EXTRAS above; the 2026-10-15 Zangya pass — round puffs of one size over Jeice's strands)
      hair: { style: 'zangya', color: 0xff9a2a },
      headExtras: ZG_HAIR_EXTRAS,
      face: { pupil: 0x2a2a3a, eyeW: 1.06, eyeH: 0.96, lashWing: true, browThick: 0.8, brow: 0xd87a1a, jaw: 0.95, pointedEars: true, mouthColor: 0x2a5a4a },
      outfit: {
        topStyle: 'armor', top: 0x2a5ab8, arms: ZG_SKIN, gloves: 0x1a1a1e,
        armor: { plate: 0xf0eee6, belly: 0xe0b030, pads: 0xf0eee6, padStyle: 'strap', trim: 0xe0b030 },
        belt: 0x7a2aa8, beltStyle: 'sash', hem: { color: 0x7a2aa8, len: 0.3, flare: 1.3 },
        pants: 0xf0e4c8, pantsStyle: 'harem', boots: 0xe0b030, bootTip: 0x1a1a1e, bootStyle: 'saiyan',
      },
      portraitColor: '#7a2aa8',
    },
    forms: [base({ color: 0xffd0a0, core: 0xffffff, particles: 0xffe0c0 })],
    poses: Object.assign({}, GK.poses, zgPoses, { idle: zgPoses.zg_idle }),
    moves: {
      light: [
        lt('zgJab', 'g_jabW', 'g_jab', 480, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }),
        lt('zgKick', 'g_kickW', 'g_kick', 540, { startup: 5, reach: 1.35, recovery: 11, cancel: 7 }),
        lt('zgSpin', 'g_spinKickW', 'g_spinKick', 640, { startup: 7, reach: 1.45, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2 }),
      ],
      heavy: {
        0: hv('zgAxe', 'g_axeKickW', 'g_axeKick', 1300, { startup: 10, knock: 'smash', knockSpeed: 34 }),
        2: hv('zgRise', 'kickWindR', 'kickR', 1100, { startup: 9, knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('zgDive', 'g_flyingKnee', 'g_flyingKnee', 900, { startup: 3, active: 8, recovery: 12, lunge: 44, hitstun: 26, hitPose: 'hitBody' }),
      throw: { id: 'zgFlip', name: 'Pirate Flip', damage: 1100, knockSpeed: 30, poses: ['grab', 'kickWindR', 'kickR'] },
    },
    specials: {
      // PIRATE FAN: three shots fanned from one hand
      special1: {
        id: 'zgFan', name: 'Pirate Fan', type: 'projectile', kiCost: 20, icon: 'blast', cooldown: 70,
        startup: 10, recovery: 14, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'blast', count: 3, spread: 0.4, speed: 82, radius: 0.32, damage: 800, homing: 0.3, color: 0xffa04a, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 12, impact: 2, life: 2 },
      },
      // VANISH: gone, and above you
      special2: {
        id: 'zgVanish', name: 'Vanish', type: 'teleport', kiCost: 14, icon: 'teleport',
        startup: 4, recovery: 6, cooldown: 45, escapeKiCost: 24, followWindow: 34, followBonus: 1.3, pose: 'g_kickW',
        modes: { behind: true, above: true, away: true }, shimmer: true,
      },
      // STORM OF KICKS: round and round you in the air, kicking from every side
      ultimate: {
        id: 'zgStorm', name: 'Storm of Kicks', type: 'speedOrbit', kiCost: 100, icon: 'ultimate', ultimate: true, cooldown: 0,
        range: 30, frames: 170, radius: 4.2, interval: 14, damage: 640, speed: 40, recovery: 40, bounceStagger: 50,
        poses: { dash: 'g_flyingKnee', strike: 'g_spinKick' },
      },
    },
    blast: { color: 0xffa04a, core: 0xffffff, damage: 210, speed: 64, radius: 0.3 },
    ai: { personality: 'aggressive', aggression: 0.72, defense: 0.45, ranged: 0.45, beam: 0, transformHp: 0, preferredRange: 2.6 },
    intro: { pose: 'zg_idle', expression: 'smirk' },
    victory: { poses: ['zg_idle'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== GARLIC JR. */
  const GJ_SKIN = 0xa8d4c8, GJ_ROBE = 0x26262c;
  const ears = (s) => ({ a: [s * 0.92, 0.25, -0.05], d: [s * 1, 0.85, -0.15], l: 0.17, r: 0.045, color: GJ_SKIN, depth: 0.96, outline: 0.6 });
  const gjPoses = {
    // hunched, fingers spread in front of his chest, a grin: a sorcerer pleased with himself
    gj_idle: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: b * 0.004 }, spine: [10, 0, 0], chest: [6 + b, 0, 0], head: [-10, 0, 0],
        shoulderL: [-50, -20, 20], elbowL: [-100, 0, 0], shoulderR: [-50, 20, -20], elbowR: [-100, 0, 0],
        thighL: [-6, 4, 10], kneeL: [10, 0, 0], thighR: [-6, -4, -10], kneeR: [10, 0, 0], hands: ['open', 'open'],
      };
    },
    gj_zoneW: { root: { y: -0.02 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0], shoulderL: [-120, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-120, 0, -40], elbowR: [-30, 0, 0], thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [-6, 0, -12], kneeR: [8, 0, 0], hands: ['open', 'open'] },
    gj_zone: { root: { y: -0.04, rx: 6 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-4, 0, 0], shoulderL: [-90, 0, 14], elbowL: [-6, 0, 0], shoulderR: [-90, 0, -14], elbowR: [-6, 0, 0], thighL: [-16, 0, 12], kneeL: [20, 0, 0], thighR: [4, 0, -12], kneeR: [8, 0, 0], hands: ['open', 'open'] },
  };
  C.garlic_jr = {
    id: 'garlic_jr', assetLevel: 1, name: 'Garlic Jr.', fullName: 'Garlic Jr. (movie: Dead Zone)', era: 'Movie',
    playable: true, prototype: true, style: 'Sorcerer · Dead Zone',
    card: ['Movie', 'Dead Zone'],
    blurb: 'A small, immortal sorcerer who wants the world his father was denied. Anything he cannot beat, he throws into the Dead Zone.',
    ratings: { power: 3, speed: 3, ki: 4, defense: 3 },
    stats: { hp: 18000, ki: 150, stamina: 120, speed: 1.0, power: 1.05, defense: 1.0, weight: 0.8, kiRegen: 3.6, chargeRate: 38, canonPower: 2 },
    appearance: {
      height: 0.74, skin: GJ_SKIN,
      build: { chestW: 0.17, chestD: 0.12, shoulderX: 0.17, waistW: 0.13, upperArmR: 0.044, foreArmR: 0.04, thighR: 0.07, shinR: 0.054, headR: 0.15 },
      hair: { style: 'bald', color: GJ_SKIN },
      headExtras: [
        ears(1), ears(-1),
        // the dark spots on his bald skull (2026-10-15 visual pass)
        ...[[0.3, 0.86, 0.3], [-0.3, 0.86, 0.3], [0, 0.95, -0.15], [0.55, 0.62, -0.35], [-0.55, 0.62, -0.35]].map((a) => ({ shape: 'ball', a, d: a, l: 0.004, r: 0.04, color: 0x4a6a48, depth: 1.0, flat: 0.3, outline: 0 })),
      ],
      face: { pupil: 0x141414, sclera: 0xffffff, browThick: 1.2, brow: 0x5a7a5a, jaw: 1.0, cheeks: 1.1, mouthColor: 0x6a1a2a, eyeTilt: 0.2 },
      outfit: {
        topStyle: 'gi', top: GJ_ROBE, under: 0x1a6a8a, sleeves: 'long', sleeveColor: 0x1a6a8a, belt: GJ_ROBE,
        hem: { color: GJ_ROBE, len: 0.44, flare: 1.25 }, pants: GJ_ROBE, pantsStyle: 'gi', boots: 0x2a8aa8, bootStyle: 'shoe',
        cape: 0xf0eee6,
      },
      props: [{ id: 'crest', shape: 'box', joint: 'chest', pos: [0, 0.0, 0.13], size: [0.07, 0.09, 0.01], color: 0xb8102a }],
      portraitColor: '#26262c',
    },
    forms: [
      base({ color: 0xd8b0ff, core: 0xffffff, particles: 0xe0c8ff }),
      {
        // SUPER GARLIC JR.: the body swells into a muscled giant; the robe stays, the cape is the same
        id: 'super', name: 'Super Garlic Jr.', short: 'SUPER GARLIC', kiCost: 50, style: 'full',
        aura: { color: 0xb04aff, core: 0xf0d8ff, particles: 0xd090ff, idle: 0.4, speed: 1.4, sharp: 0.3 },
        mult: { damage: 1.75, speed: 1.02, defense: 1.6, kiRegen: 1.3, chargeRate: 1.2, guardStamina: 1.3 },
        look: { scale: 1.5, bulk: 1.4, muscle: 1.5 },
        practiced: practiced('gj_idle'),
        ai: { aggression: 0.8, defense: 0.45, ranged: 0.35 },
      },
    ],
    poses: Object.assign({}, PC.poses, gjPoses, { idle: gjPoses.gj_idle }),
    moves: {
      light: [
        lt('gjSlash', 'p_chopW', 'p_chop', 460, { startup: 5, recovery: 11, cancel: 7, hitPose: 'hitSideL' }),
        lt('gjSlash2', 'punchWindL', 'punchL', 480, { startup: 5, recovery: 11, cancel: 7 }),
        lt('gjKick', 'kickWindR', 'kickR', 560, { startup: 7, reach: 1.3, recovery: 14, hitstun: 24, knock: 'push', knockSpeed: 12, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('gjPalm', 'p_elbowW', 'p_elbow', 1200, { startup: 11, knock: 'heavy', knockSpeed: 28 }),
      },
      dash: hv('gjDart', 'p_chopW', 'p_chop', 800, { startup: 4, active: 8, recovery: 14, lunge: 36, hitstun: 24, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'gjToss', name: 'Sorcerer\'s Toss', damage: 1000, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // MAKYO BLAST: a dark violet shot from the palm
      special1: {
        id: 'gjBlast', name: 'Makyo Blast', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 70,
        startup: 12, recovery: 16, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 64, radius: 0.6, damage: 1500, homing: 0.6, color: 0xa04aff, core: 0xf0d8ff, explode: 3, knock: 'heavy', knockSpeed: 20, impact: 3, life: 2.6 },
      },
      // DEAD ZONE: both hands up — the void opens behind you and holds you, helpless, until it closes
      special2: {
        id: 'gjDeadZone', name: 'Dead Zone', type: 'telekinesis', kiCost: 34, icon: 'guard', cooldown: 420,
        range: 22, startup: 18, maxFrames: 170, bossFrames: 80, kiPerSecond: 14, releaseStagger: 40, recovery: 22,
        mashGain: 0.06, escapeDecay: 0.004, cpuEscape: 0.006, drain: { hpPerSecond: 0.03, kiPerSecond: 10 },
        poses: { focus: 'gj_zoneW', hold: 'gj_zone' },
      },
      // CHOUMAKOUHOU: a wave out of both palms, the colour of the Dead Zone
      ultimate: {
        id: 'gjWave', name: 'Makyo Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 44, chargeMax: 44, damage: [4600, 4600], radius: [1.4, 1.4], speed: 96, range: 150, sustain: 42,
        color: 0x8a3aff, core: 0xf0d8ff, poses: { charge: 'gj_zoneW', fire: 'gj_zone' }, recovery: 30,
      },
    },
    mechanic: { type: 'regeneration', name: 'Immortal', desc: 'He drank from the Dragon Balls: after a few seconds without being hit his body mends, up to 60% health.', color: 0xd090ff },
    blast: { color: 0xa04aff, core: 0xf0d8ff, damage: 210, speed: 60, radius: 0.32 },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.55, ranged: 0.55, beam: 0.35, transformHp: 0.6, preferredRange: 4.5 },
    intro: { pose: 'gj_idle', expression: 'wicked' },
    victory: { poses: ['gj_idle'], expression: 'wicked' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== LORD SLUG */
  const SL_SKIN = 0x5aa83a, SL_SUIT = 0x5a2a80, SL_ROBE = 0xd8a232, SL_SCARF = 0xe8742a;
  const slPoses = {
    // the warlord: arms folded over the armour, chin up
    sl_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return Object.assign({}, SL.data.poses.armsCrossed, { root: { y: b * 0.004 }, head: [-8, 0, 0], chest: [-4 + b * 0.5, 0, 0] });
    },
    // the giant: stooped, arms hanging, every step a quake
    sl_giantIdle: (t) => {
      const b = Math.sin(t * 1.1);
      return {
        root: { y: -0.06 + b * 0.008 }, spine: [16, 0, 0], chest: [10 + b, 0, 0], head: [-14, 0, 0],
        shoulderL: [-16, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-16, 0, -30], elbowR: [-30, 0, 0],
        thighL: [-14, 10, 18], kneeL: [24, 0, 0], thighR: [-14, -10, -18], kneeR: [24, 0, 0], hands: ['fist', 'fist'],
      };
    },
  };
  C.lord_slug = {
    id: 'lord_slug', assetLevel: 1, name: 'Lord Slug', fullName: 'Lord Slug (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Namekian Warlord · Giant',
    card: ['Movie', 'Lord Slug'],
    blurb: 'A Namekian conqueror who wished his youth back to rule another world. When he grows, he blots out the sky.',
    ratings: { power: 4, speed: 2, ki: 4, defense: 4 },
    stats: { hp: 28000, ki: 150, stamina: 150, speed: 0.98, power: 1.3, defense: 1.25, weight: 1.3, kiRegen: 3.2, chargeRate: 36, canonPower: 6 },
    poise: { max: 70, regen: 14, regenDelay: 100, armor: 1, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.08, skin: SL_SKIN,
      build: { chestW: 0.235, chestD: 0.155, shoulderX: 0.235, waistW: 0.15, upperArmR: 0.066, foreArmR: 0.058, thighR: 0.092, shinR: 0.07, headR: 0.124, neckR: 0.066 },
      // (2026-10-16, the board: a tall Namekian dome, the long thin feelers arching forward off the brow — King Piccolo's
      // construction, shorter — and the scars down his left cheek)
      headExtras: [1, -1].map((s) => ({ a: [s * 0.3, 0.93, 0.32], d: [s * 0.3, 0.85, 0.55], l: 0.2, r: 0.013, bend: 1.2, curl: true, toward: [s * 0.3, -0.6, 0.7], color: 0x4a8a2a, depth: 0.98, outline: 0.4 }))
        .concat([0, 1].map((i) => ({ shape: 'line', a: [0.42 + i * 0.1, 0.05 - i * 0.04, 0.9], d: [0.25, -1, 0.1], l: 0.05, r: 0.005, flat: 0.25, depth: 1.004, color: 0xb02a2a }))),
      face: { pupil: 0x141414, eyeW: 0.88, eyeH: 0.8, browThick: 1.6, brow: 0x3a6a2a, pointedEars: true, jaw: 1.14, jawW: 1.06, mouthColor: 0x4a1a2a, eyeTilt: 0.18, skull: [1, 1.16, 1.04], skullY: 0.06 },
      // (2026-10-16, the board p.211 — image p.210: he wore dark armour and a cape. Now as the board draws him: a
      // mustard robe open at the front over a purple suit, wide short sleeves, its skirt to the shins parted down the
      // front; the orange scarf gathered round his neck; the orange sash; a brown harness crossing over the chest with a
      // big blue gem in a gold setting where the straps meet; orange knee boots; the green arms with pink muscle patches)
      outfit: {
        topStyle: 'jacket', top: SL_SUIT, jacket: { color: SL_ROBE, open: 0.95 },
        sleeves: 'short', sleeveColor: SL_ROBE, sleeveBulk: 1.35, arms: SL_SKIN,
        collar: SL_SCARF, collarStyle: 'ruff',
        belt: SL_SCARF, beltStyle: 'sash',
        hem: { color: SL_ROBE, len: 0.62, flare: 1.32, open: 1.1 },
        pants: SL_SUIT, pantsStyle: 'gi', boots: SL_SCARF, bootStyle: 'saiyan',
      },
      // the harness: two brown straps over the chest from each shoulder to the other hip, the gem where they cross
      props: [1, -1].map((s) => ({ id: 'strap' + (s > 0 ? 'L' : 'R'), joint: 'chest', shape: 'strip', path: [[s * 0.13, 0.27, 0.17], [s * 0.065, 0.19, 0.19], [0, 0.12, 0.192], [-s * 0.065, 0.05, 0.178], [-s * 0.125, -0.02, 0.158]], width: 0.034, thick: 0.01, color: 0x6a4228, outline: 0.4, ride: true }))
        .concat([
          { id: 'gemSet', joint: 'chest', shape: 'ball', pos: [0, 0.12, 0.196], size: [0.05, 0.05, 0.016], color: 0xa0782a, outline: 0.5, ride: true },
          { id: 'gem', joint: 'chest', shape: 'ball', pos: [0, 0.12, 0.206], size: [0.034, 0.034, 0.014], color: 0x2a4ad0, outline: 0.3, ride: true },
          // the scarf bunched thick round the neck over the gathered collar
          { id: 'scarf', joint: 'neck', shape: 'neckRing', pos: [0, 0.006, 0.006], radius: 0.088, thick: 0.46, color: SL_SCARF, outline: 0.5 },
        ]),
      // the pink muscle patches down the arms (Piccolo Jr.'s construction)
      decals: ['L', 'R'].flatMap((sd) => {
        const k = sd === 'L' ? 1 : -1;
        return [
          { at: 'shoulder' + sd, t: 0.55, ang: 0.9 * k, size: [0.046, 0.1], color: 0xe8948c },
          { at: 'elbow' + sd, t: 0.45, ang: 0.6 * k, size: [0.04, 0.1], color: 0xe8948c },
        ];
      }),
      portraitColor: '#d8a232',
    },
    forms: [
      base({ color: 0xc8ffb0, core: 0xffffff, particles: 0xb8f0a0 }),
      {
        // GIANT: he grows — a Namekian's gift turned into a siege engine
        id: 'giant', name: 'Giant Form', short: 'GIANT', kiCost: 60, style: 'full',
        aura: { color: 0x9aff6a, core: 0xf0ffe0, particles: 0xb8ff9a, idle: 0.35, speed: 1.1, sharp: 0.25 },
        mult: { damage: 1.9, speed: 0.92, defense: 1.9, kiRegen: 1.2, chargeRate: 1.1, guardStamina: 1.5 },
        look: { scale: 1.9, bulk: 1.2, muscle: 1.2 },
        practiced: { length: 96, applyAt: 50, steps: [{ at: 0, pose: 'powerCrouch', speed: 8, expression: 'grit', aura: 0.5, quake: 0.3, sfx: 'rumble' }, { at: 50, burst: true, pose: 'powerUp', speed: 10, expression: 'shout', flash: 0.3, crater: 5, quake: 0.6 }, { at: 80, pose: 'sl_giantIdle', expression: 'angry' }] },
        poses: { idle: slPoses.sl_giantIdle },
        // the giant's reach: the ground itself
        specials: {
          special2: {
            id: 'slStomp', name: 'Giant Stomp', type: 'groundSlam', kiCost: 28, icon: 'down', cooldown: 200,
            crouch: 16, hang: 22, height: 5, maxRange: 20, radius: 9, clearHeight: 2.6, damage: 2400, knockSpeed: 22, recovery: 36,
            ringColor: 0x9aff6a, coreColor: 0xf0ffe0, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' },
          },
        },
        ai: { aggression: 0.75, defense: 0.5, ranged: 0.3, preferredRange: 3 },
      },
    ],
    poses: Object.assign({}, PC.poses, slPoses, { idle: slPoses.sl_idle }),
    moves: {
      light: [
        lt('slJab', 'punchWindR', 'punchR', 600),
        lt('slChop', 'p_chopW', 'p_chop', 660, { hitPose: 'hitSideL' }),
        lt('slElbow', 'p_elbowW', 'p_elbow', 740, { startup: 7, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('slSmash', 'hammerWind', 'hammer', 1700, { knock: 'smash', knockSpeed: 36, impact: 4, armor: true, guardCrush: true, guardDamage: 50 }),
        3: hv('slKick', 'p_stretchKickW', 'p_stretchKick', 1500, { reach: 2.2, radius: 1.1 }),
      },
      dash: hv('slCharge', 'p_elbowW', 'p_elbow', 1100, { startup: 6, active: 10, recovery: 18, lunge: 32, hitstun: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'slToss', name: 'Warlord\'s Throw', damage: 1500, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // DARKNESS EYE BEAM: two thin beams from the eyes, through a guard
      special1: {
        id: 'slEyes', name: 'Darkness Eye Beam', type: 'projectile', kiCost: 22, icon: 'blast', fromHead: true, cooldown: 80,
        startup: 12, recovery: 16, pose: { wind: 'p_demonHandW', release: 'p_demonHand' },
        projectile: { kind: 'blast', count: 2, spread: 0.08, speed: 86, radius: 0.24, damage: 900, homing: 0.15, color: 0xff3a5a, core: 0xffe0e8, explode: 1.6, knock: 'push', knockSpeed: 12, impact: 2, life: 2, guardPierce: true },
      },
      // STRETCHING SLAM: the Namekian arm thrown out across the field, and you dragged in
      special2: {
        id: 'slGrab', name: 'Stretching Grab', type: 'stretchGrab', kiCost: 26, icon: 'rush', cooldown: 160,
        reach: 14, extendFrames: 11, pullFrames: 13, damage: 1200, hitstunAfter: 32, recovery: 20, armLength: 0.5,
        poses: { wind: 'p_demonHandW', reach: 'p_demonHand' },
      },
      // DARKNESS FLASH: a wide wave from both hands that covers the field
      ultimate: {
        id: 'slFlash', name: 'Darkness Flash', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 46, chargeMax: 46, damage: [5000, 5000], radius: [2.2, 2.2], speed: 90, range: 160, sustain: 46,
        color: 0x4aff7a, core: 0xf0fff0, poses: { charge: 'p_sbcCharge', fire: 'p_sbcFire' }, recovery: 34,
      },
    },
    mechanic: { type: 'regeneration', name: 'Namekian Regeneration', desc: 'After a few seconds without taking damage, he regrows health up to 60%.' },
    blast: { color: 0x9aff6a, core: 0xf0fff0, damage: 220, speed: 58, radius: 0.34 },
    ai: { personality: 'adaptive', aggression: 0.6, defense: 0.55, ranged: 0.45, beam: 0.4, transformHp: 0.5, preferredRange: 3.4 },
    intro: { pose: 'sl_idle', expression: 'smirk' },
    victory: { poses: ['sl_idle'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
