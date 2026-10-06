/*
 * BABIDI AND HIS PEOPLE (Buu Saga, Age 774).
 *
 *   babidi     the wizard, Bibidi's son. Not a fighter, and the game does not
 *              pretend he is: he is a voice, a crystal ball, a spell that changes
 *              the floor you are standing on, and a mark on the foreheads of the
 *              people he owns. Story/system character.
 *   dabura     King of the Demon Realm, under the mark. A real combatant with his
 *              own grammar: a sword with more reach than anybody's fist, a breath
 *              of fire at mid range, a demon spear from far away, and spit that
 *              turns what it touches to stone. He keeps you at the sword's length.
 *   spopovich  a tournament fighter Babidi has hollowed out: slow, huge, and he
 *              grows back anything you do to him (the same bio-regeneration Cell
 *              has, powered by magic instead of cells). He is the lesson that the
 *              marked are not normal opponents.
 *   yamu       Spopovich's handler; small, bald, and carrying the device that
 *              drains a Saiyan's energy. Story only.
 *   pui_pui    the first warrior in Babidi's ship: a professional who is simply
 *              outclassed. A short fight with a fair kit.
 *   yakon      the second: a monster from a planet without light, who eats it.
 *              Every ki attack feeds him — and past a point he cannot hold it.
 *
 * Every marked character wears Babidi's "M" (SL.data.majinMark), a head decoration
 * a look can put on or take off — the same piece the Majin state will use later.
 *
 * Level 1 functional prototypes; not playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const mark = SL.data.majinMark;

  const poses = {
    /* ---- Dabura ---- */
    // sword low across the body, cape back: patient, and certain
    db_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.02 + b * 0.006 },
        hips: [0, -10, 0], spine: [2, 0, 0], chest: [0, 10, 0], head: [-2, -10, 0],
        shoulderR: [-40, 0, -18], elbowR: [-50, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-30, 0, 0],
        thighL: [-12, 6, 10], kneeL: [16, 0, 0], thighR: [8, -6, -12], kneeR: [14, 0, 0],
        hands: ['open', 'fist'],
      };
    },
    db_slashW: {
      root: { y: -0.04 }, spine: [-4, -34, 0], chest: [-6, -40, 0], head: [-4, 28, 0],
      shoulderR: [-110, 0, -80], elbowR: [-40, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0],
      thighL: [-18, 0, 12], kneeL: [26, 0, 0], thighR: [12, 0, -12], kneeR: [20, 0, 0],
      hands: ['open', 'fist'],
    },
    db_slash: {
      root: { y: -0.06, rx: 8 }, spine: [8, 38, 0], chest: [10, 44, 0], head: [-8, -30, 0],
      shoulderR: [-90, 0, 40], elbowR: [-10, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0],
      thighL: [-28, 0, 12], kneeL: [36, 0, 0], thighR: [16, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'fist'],
    },
    db_thrustW: {
      root: { y: -0.05 }, spine: [0, -20, 0], chest: [0, -24, 0], head: [-6, 18, 0],
      shoulderR: [-40, 0, -30], elbowR: [-110, 0, 0], shoulderL: [-50, 0, 24], elbowL: [-60, 0, 0],
      thighL: [-26, 0, 12], kneeL: [34, 0, 0], thighR: [14, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'fist'],
    },
    db_thrust: {
      root: { y: -0.08, rx: 12 }, spine: [10, 16, 0], chest: [12, 20, 0], head: [-12, -14, 0],
      shoulderR: [-92, 0, 0], elbowR: [0, 0, 0], shoulderL: [-20, 0, 40], elbowL: [-20, 0, 0],
      thighL: [-44, 0, 12], kneeL: [52, 0, 0], thighR: [26, 0, -12], kneeR: [10, 0, 0],
      hands: ['open', 'fist'],
    },
    db_overheadW: {
      root: { y: 0.04 }, spine: [-14, 0, 0], chest: [-18, 0, 0], head: [-16, 0, 0],
      shoulderR: [-178, 0, -14], elbowR: [-24, 0, 0], shoulderL: [-170, 0, 14], elbowL: [-24, 0, 0],
      thighL: [-20, 0, 12], kneeL: [30, 0, 0], thighR: [12, 0, -12], kneeR: [24, 0, 0],
      hands: ['fist', 'fist'],
    },
    db_overhead: {
      root: { y: -0.16, rx: 26 }, spine: [18, 0, 0], chest: [22, 0, 0], head: [-6, 0, 0],
      shoulderR: [-60, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-62, 0, 6], elbowL: [-6, 0, 0],
      thighL: [-30, 0, 12], kneeL: [40, 0, 0], thighR: [18, 0, -12], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    },
    // leaning in, mouth open: the spit, and the breath
    db_spitW: {
      root: { y: -0.02 }, spine: [-10, 0, 0], chest: [-14, 0, 0], neck: [-10, 0, 0], head: [-18, 0, 0],
      shoulderR: [-30, 0, -24], elbowR: [-40, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-40, 0, 0],
      thighL: [-10, 0, 10], kneeL: [14, 0, 0], thighR: [6, 0, -10], kneeR: [10, 0, 0],
      hands: ['open', 'fist'],
    },
    db_spit: {
      root: { y: -0.04, rx: 10 }, spine: [10, 0, 0], chest: [14, 0, 0], neck: [12, 0, 0], head: [16, 0, 0],
      shoulderR: [-20, 0, -30], elbowR: [-30, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-30, 0, 0],
      thighL: [-18, 0, 10], kneeL: [22, 0, 0], thighR: [10, 0, -10], kneeR: [14, 0, 0],
      hands: ['open', 'fist'],
    },
    db_spearW: {
      root: { y: -0.02 }, spine: [-6, -30, 0], chest: [-8, -36, 0], head: [-4, 26, 0],
      shoulderL: [-160, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-40, 0, 0],
      thighL: [-16, 0, 12], kneeL: [22, 0, 0], thighR: [10, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'fist'],
    },
    db_spear: {
      root: { y: -0.05, rx: 10 }, spine: [8, 30, 0], chest: [10, 36, 0], head: [-10, -26, 0],
      shoulderL: [-100, 0, -10], elbowL: [-4, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-40, 0, 0],
      thighL: [-28, 0, 12], kneeL: [36, 0, 0], thighR: [16, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'fist'],
    },
    /* ---- Babidi ---- */
    bb_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.04 + b * 0.006, rx: 12 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [-40, 0, 0], // hunched, but looking up at whoever he is talking to
        shoulderL: [-50, 0, -20], elbowL: [-110, 0, 0], shoulderR: [-50, 0, 20], elbowR: [-110, 0, 0],
        thighL: [-10, 0, 10], kneeL: [22, 0, 0], thighR: [-10, 0, -10], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // both hands up, fingers spread: the spell
    bb_cast: (t) => {
      const b = Math.sin(t * 9);
      return {
        root: { y: -0.02 + b * 0.008 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0],
        shoulderL: [-150, 0, 34 + b * 4], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -34 - b * 4], elbowR: [-30, 0, 0],
        thighL: [-8, 0, 12], kneeL: [14, 0, 0], thighR: [-8, 0, -12], kneeR: [14, 0, 0],
        hands: ['open', 'open'],
      };
    },
    bb_cackle: (t) => {
      const b = Math.sin(t * 12);
      return {
        root: { y: -0.03 + Math.abs(b) * 0.01, rx: 6 }, spine: [-12, 0, 0], chest: [-8, 0, 0], head: [-22 + b * 4, 0, 0],
        shoulderL: [-40, 0, 40], elbowL: [-100, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-100, 0, 0],
        thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [-6, 0, -10], kneeR: [10, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    /* ---- the brutes ---- */
    sp_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: -0.04 + b * 0.008, rx: 6 }, hips: [0, -4, 0], spine: [8, 0, 0], chest: [6, 4, 0], head: [-10, -4, 0],
        shoulderL: [-30, 0, 30], elbowL: [-50, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-50, 0, 0],
        thighL: [-12, 4, 16], kneeL: [18, 0, 0], thighR: [-6, -4, -16], kneeR: [14, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the head bent all the way back and straightening itself: what regeneration looks like on him
    sp_regrow: (t) => {
      const k = Math.min(1, t / 1.6);
      return {
        root: { y: -0.04 }, spine: [6, 0, 0], chest: [4, 0, 0], neck: [-60 * (1 - k), 0, 0], head: [-50 * (1 - k), 0, 0],
        shoulderL: [-20, 0, 24], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -24], elbowR: [-30, 0, 0],
        thighL: [-10, 0, 14], kneeL: [14, 0, 0], thighR: [-6, 0, -14], kneeR: [12, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the kick has turned his head all the way round: he just stands there, arms hanging
    sp_neckBack: {
      root: { y: -0.04 }, spine: [4, 0, 0], chest: [2, 0, 0], neck: [0, 90, 8], head: [10, 90, 0],
      shoulderL: [6, 0, 12], elbowL: [-8, 0, 0], shoulderR: [6, 0, -12], elbowR: [-8, 0, 0],
      thighL: [-4, 0, 10], kneeL: [8, 0, 0], thighR: [-4, 0, -10], kneeR: [8, 0, 0],
      hands: ['open', 'open'],
    },
    // both hands take hold of the head, and at 0.8 s turn it back where it belongs, in one movement
    sp_twistBack: (t) => {
      const k = t < 0.8 ? 0 : Math.min(1, (t - 0.8) / 0.1);
      return {
        root: { y: -0.04 }, spine: [4, 0, 0], chest: [2, 0, 0], neck: [0, 90 * (1 - k), 8 * (1 - k)], head: [10 * (1 - k), 90 * (1 - k), 0],
        shoulderL: [-148, 0, 38], elbowL: [-104, 0, 0], shoulderR: [-148, 0, -38], elbowR: [-104, 0, 0],
        thighL: [-6, 0, 12], kneeL: [10, 0, 0], thighR: [-6, 0, -12], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // kneeling on a beaten opponent, one hand pressing her into the ring
    sp_pin: (t) => {
      const s = Math.sin(t * 3);
      return {
        root: { y: -0.45, rx: 24 }, spine: [22, 0, 0], chest: [16, 0, 0], head: [22, 0, 0],
        shoulderR: [-60 + s * 4, 0, -10], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-40, 0, 0],
        thighL: [-80, 0, 10], kneeL: [100, 0, 0], thighR: [10, 0, -12], kneeR: [110, 0, 0], footR: [-30, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // a full nelson from behind: arms under the other man's arms, hands locked behind his neck
    sp_nelson: (t) => {
      const s = Math.sin(t * 7);
      return {
        root: { y: -0.06 }, spine: [8, 0, 0], chest: [10, 0, s * 1.5], head: [4, 0, 0],
        shoulderL: [-112, 0, 18], elbowL: [-96, 0, 0], shoulderR: [-112, 0, -18], elbowR: [-96, 0, 0],
        thighL: [-18, 0, 16], kneeL: [26, 0, 0], thighR: [12, 0, -16], kneeR: [20, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    /* ---- Yamu ---- */
    // the siphon held up, needle forward
    ym_ready: {
      root: { y: -0.05 }, hips: [0, -10, 0], spine: [4, 0, 0], chest: [4, 10, 0], head: [-4, -8, 0],
      shoulderR: [-70, 0, -8], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 24], elbowL: [-50, 0, 0],
      thighL: [-18, 0, 12], kneeL: [22, 0, 0], thighR: [12, 0, -12], kneeR: [14, 0, 0],
      hands: ['fist', 'fist'],
    },
    // and driven in, up into the chest of a taller man
    ym_plunge: {
      root: { y: -0.05, rx: 8 }, spine: [6, 0, 0], chest: [4, 20, 0], head: [-14, -14, 0],
      shoulderR: [-106, 0, 6], elbowR: [-8, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-60, 0, 0],
      thighL: [-26, 0, 12], kneeL: [34, 0, 0], thighR: [18, 0, -12], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    },
    // pointing across the ring: that is enough
    ym_point: {
      root: { y: -0.02 }, spine: [2, -8, 0], chest: [2, -12, 0], head: [-6, 10, 0],
      shoulderR: [-92, 0, 2], elbowR: [-4, 0, 0], shoulderL: [-10, 0, 18], elbowL: [-40, 0, 0],
      thighL: [-8, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
      hands: ['fist', 'point'],
    },
  };

  const move = (id, dmg, wind, strike, extra = {}) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 8, damage: dmg, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, extra);
  const BOSS_POISE = { max: 90, regen: 12, regenDelay: 110, armor: 1, cost: { 1: 7, 2: 11, 3: 17, 4: 26 }, beamMul: 1, breakFrames: 140, vulnerable: 1.25 };

  /* ---------------- Dabura ---------------- */
  SL.data.characters.dabura = {
    id: 'dabura',
    assetLevel: 1,
    name: 'Dabura',
    fullName: 'Dabura, King of the Demon Realm',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Demon Swordsman',
    blurb: 'A king in his own world, a servant in Babidi\'s. He fights with a sword because he can, and spits because it works.',
    ratings: { power: 5, speed: 4, ki: 4, defense: 4 },
    stats: { hp: 32000, ki: 160, stamina: 160, speed: 1.08, power: 1.3, defense: 1.2, weight: 1.15, kiRegen: 3, chargeRate: 32, canonPower: 4 },
    poise: Object.assign({}, BOSS_POISE, { max: 110, armor: 2 }),
    appearance: {
      height: 1.1,
      skin: 0xc0382e,
      build: { chestW: 0.25, chestD: 0.18, shoulderX: 0.25, waistW: 0.19, upperArmR: 0.066, foreArmR: 0.058, fist: 0.06, thighR: 0.1, shinR: 0.078, headR: 0.148, neckLen: 0.058 },
      hair: { style: 'dabura', color: 0xf2f0ea },
      // two horns off the brow, and Babidi's mark between them
      headExtras: mark(0x141414, [
        { a: [0.45, 0.72, 0.5], d: [0.2, 1, 0.25], l: 0.09, r: 0.024, color: 0xf0e6d0, depth: 0.96 },
        { a: [-0.45, 0.72, 0.5], d: [-0.2, 1, 0.25], l: 0.09, r: 0.024, color: 0xf0e6d0, depth: 0.96 },
      ]),
      face: { pupil: 0x141414, sclera: 0xffe8a0, eyeW: 0.92, pointedEars: true, brow: 0xf2f0ea },
      outfit: {
        topStyle: 'gi', top: 0x24242a, sleeves: 'none', arms: 0xc0382e, under: 0x8a8a94, wrist: 0x8a8a94,
        belt: 0x8a8a94, pants: 0xe8e4dc, pantsStyle: 'gi', boots: 0x24242a, bootStyle: 'gi',
        cape: 0xe8e4dc,
      },
      props: [
        { id: 'sword', shape: 'katana', joint: 'handR', pos: [0, -0.05, 0.012], rot: [2.25, 0, 0], length: 1.05, blade: 0xd8dce4, guard: 0x3a3a44, grip: 0x5a1a1a },
      ],
      portraitColor: '#c0382e',
    },
    vfx: { ghost: 0xff8a6a },
    audio: { strikePitch: 0.9, heavyPitch: 0.8 },
    forms: [{ id: 'base', name: 'Demon King', aura: { color: 0xff5a3a, core: 0xffd0a0, particles: 0xff7a4a, speed: 1.1 }, mult: {} }],
    poses: Object.assign({ idle: poses.db_idle }, poses),
    moves: {
      // the sword's reach is the point: every string starts further out than a fist can
      light: [
        move('dbSlash', 880, 'db_slashW', 'db_slash', { reach: 2.05, radius: 0.95, lunge: 10, hitPose: 'hitSideL', sfx: 'punchHeavy' }),
        move('dbBackslash', 920, 'db_slashW', 'db_slash', { reach: 2.05, radius: 0.95, lunge: 10, hitPose: 'hitSideR', sfx: 'punchHeavy' }),
        move('dbThrust', 1100, 'db_thrustW', 'db_thrust', { reach: 2.35, radius: 0.7, lunge: 14, knock: 'push', knockSpeed: 14, impact: 2, hitstun: 24, hitPose: 'hitBody', sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: move('dbCleave', 2600, 'db_overheadW', 'db_overhead', { startup: 14, active: 5, recovery: 24, reach: 2.2, radius: 1.1, lunge: 14, knock: 'smash', knockSpeed: 30, impact: 4, hitstun: 36, guardCrush: true, guardDamage: 60, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
        2: move('dbRising', 1800, 'db_slashW', 'db_slash', { startup: 10, active: 4, recovery: 20, reach: 2, radius: 1, knock: 'launch', knockSpeed: 22, impact: 3, hitstun: 32, hitPose: 'hitBody', sfx: 'punchHeavy' }),
      },
      dash: move('dbLunge', 1700, 'db_thrustW', 'db_thrust', { startup: 8, active: 7, recovery: 20, reach: 2.4, radius: 0.85, lunge: 30, knock: 'heavy', knockSpeed: 24, impact: 3, hitstun: 28, hitPose: 'hitBody', sfx: 'punchHeavy' }),
      // a parried hand meets the flat of the sword
      counter: {
        light: move('dbRiposte', 1500, 'db_thrustW', 'db_thrust', { startup: 3, active: 4, recovery: 16, reach: 2.2, knock: 'heavy', knockSpeed: 24, impact: 3, hitstun: 36, hitPose: 'hitBody', sfx: 'punchHeavy' }),
      },
    },
    specials: {
      // fire from the mouth: short, wide, and what he answers anybody standing just outside the sword with
      special1: {
        id: 'dbFlame', name: 'Evil Flame', type: 'beam', kiCost: 28, icon: 'beam', cooldown: 200,
        chargeMin: 16, chargeMax: 30, tiers: [16], damage: [1800, 2600], radius: [1.4, 1.9], speed: 60, range: 24, sustain: 36,
        color: 0xff6a2a, core: 0xffd08a, poses: { charge: 'db_spitW', fire: 'db_spit' }, recovery: 24,
      },
      // the spit: slow and telegraphed, and it turns you to stone — struggle to break out
      special2: {
        id: 'dbSpit', name: 'Stone Spit', type: 'projectile', kiCost: 18, icon: 'ball', cooldown: 360,
        startup: 20, recovery: 24, pose: { wind: 'db_spitW', release: 'db_spit' },
        projectile: { kind: 'ball', speed: 34, radius: 0.34, damage: 200, homing: 0.25, color: 0xd8d0b8, core: 0xffffff, explode: 0.6, knock: 'flinch', knockSpeed: 2, impact: 1, life: 2.4, stone: { frames: 150, mash: 9 } },
      },
      // the Demon Spear: from far away, fast, straight, and through a guard
      ultimate: {
        id: 'dbSpear', name: 'Demon Spear', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 26, recovery: 30, pose: { wind: 'db_spearW', release: 'db_spear' },
        projectile: { kind: 'disc', speed: 96, radius: 0.5, damage: 4600, homing: 0.15, color: 0xff3a2a, core: 0xffe0c0, explode: 3, knock: 'heavy', knockSpeed: 30, impact: 4, guardPierce: true, life: 1.8 },
      },
    },
    boss: {
      phases: [
        // the duelist: he wants the sword to do it, and keeps you at its length
        { id: 'duelist', label: 'DUELIST', hpAbove: 0.6, speed: 1, damage: 1, patience: 0.9, patterns: { melee: 1, flame: 0.35, spit: 0.25 } },
        // the demon: when the sword is not enough, everything else comes out
        { id: 'demon', label: 'DEMON KING', hpAbove: 0, speed: 1.08, damage: 1.12, patience: 0.5, patterns: { melee: 0.9, flame: 0.6, spit: 0.5, spear: 0.4 } },
      ],
      patterns: {
        flame: { slot: 'special1', minDist: 2.6, maxDist: 16, cooldown: 260 },
        spit: { slot: 'special2', minDist: 3, maxDist: 18, cooldown: 420 },
        spear: { slot: 'ultimate', minDist: 10, cooldown: 900 },
      },
      techniques: {},
    },
    mechanic: { type: 'boss', name: 'Demon King', desc: 'The sword keeps you at its length, the fire answers anybody just outside it, and the spit turns you to stone — struggle out.' },
    ai: { personality: 'elite', aggression: 0.72, defense: 0.72, ranged: 0.45, beam: 0.35, transformHp: 0, preferredRange: 2.4, hooks: 'boss' },
    intro: { pose: 'db_idle', expression: 'smirk' },
    victory: { poses: ['db_idle'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ---------------- Babidi ---------------- */
  SL.data.characters.babidi = {
    id: 'babidi',
    assetLevel: 1,
    name: 'Babidi',
    fullName: 'Babidi, the wizard',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Wizard',
    blurb: 'He does not fight. He owns people who do.',
    ratings: { power: 1, speed: 1, ki: 4, defense: 1 },
    stats: { hp: 4000, ki: 200, stamina: 60, speed: 0.8, power: 0.2, defense: 0.5, weight: 0.6, kiRegen: 4, chargeRate: 20, canonPower: 0.2 },
    appearance: {
      height: 0.62,
      skin: 0xc8bc6a,
      build: { chestW: 0.16, chestD: 0.13, shoulderX: 0.15, waistW: 0.15, upperArmR: 0.036, foreArmR: 0.032, fist: 0.04, thighR: 0.06, shinR: 0.046, headR: 0.2, neckLen: 0.03 },
      hair: { style: 'bald', color: 0xc8bc6a },
      face: { pupil: 0x141414, sclera: 0xfff4c0, eyeW: 1.15, pointedEars: true, brow: 0x6a6030 },
      outfit: {
        topStyle: 'gi', top: 0x2a2440, sleeves: 'long', sleeveColor: 0x2a2440, under: 0x8a2a2a, wrist: 0x8a8a94,
        belt: 0xc8a030, pants: 0x2a2440, pantsStyle: 'gi', boots: 0x5a3a2a, bootStyle: 'gi',
        cape: 0x1a1628,
      },
      portraitColor: '#2a2440',
    },
    vfx: { ghost: 0xd8ff9a },
    audio: { strikePitch: 1.3, heavyPitch: 1.2 },
    flight: false,
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x9aff6a, core: 0xe8ffd0 }, mult: {} }],
    poses: Object.assign({ idle: poses.bb_idle }, poses),
    moves: {
      light: [move('bbPoke', 40, 'bb_idle', 'bb_cast', { startup: 10, recovery: 18, reach: 0.8, lunge: 4 })],
      heavy: { 0: move('bbShove', 60, 'bb_idle', 'bb_cast', { startup: 14, recovery: 22, reach: 0.8, lunge: 4 }) },
      dash: move('bbScuttle', 40, 'bb_idle', 'bb_cast', { startup: 12, recovery: 20, reach: 0.8, lunge: 8 }),
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.05, defense: 0.9, ranged: 0, beam: 0, transformHp: 0, preferredRange: 14 },
    intro: { pose: 'bb_cackle', expression: 'grin' },
    victory: { poses: ['bb_cackle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---------------- Spopovich ---------------- */
  SL.data.characters.spopovich = {
    id: 'spopovich',
    assetLevel: 1,
    name: 'Spopovich',
    fullName: 'Spopovich',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Hollowed Brute',
    blurb: 'He lost to Mr. Satan once. Now he does not feel anything, and he does not stay hurt.',
    ratings: { power: 3, speed: 2, ki: 2, defense: 4 },
    stats: { hp: 16000, ki: 60, stamina: 160, speed: 0.9, power: 0.9, defense: 1.1, weight: 1.4, kiRegen: 1, chargeRate: 12, canonPower: 0.4 },
    poise: Object.assign({}, BOSS_POISE, { max: 140, armor: 2 }),
    appearance: {
      height: 1.2,
      // pale, and the veins stand out on his scalp: what the magic has done to him (reference text)
      skin: 0xdcb49a,
      build: { chestW: 0.29, chestD: 0.21, shoulderX: 0.29, waistW: 0.23, upperArmR: 0.078, foreArmR: 0.066, fist: 0.07, thighR: 0.112, shinR: 0.086, headR: 0.14, neckLen: 0.05 },
      hair: { style: 'bald', color: 0xdcb49a },
      headExtras: mark(0x141414, [
        { shape: 'line', r: 0.007, flat: 0.25, depth: 1.004, color: 0x8a4a5a, a: [0.78, 0.42, 0.34], d: [0.05, 1, -0.4], l: 0.05 },
        { shape: 'line', r: 0.007, flat: 0.25, depth: 1.004, color: 0x8a4a5a, a: [-0.78, 0.42, 0.34], d: [-0.05, 1, -0.4], l: 0.05 },
        { shape: 'line', r: 0.006, flat: 0.25, depth: 1.004, color: 0x8a4a5a, a: [0.36, 0.86, 0.3], d: [0.2, 0.2, -1], l: 0.06 },
        { shape: 'line', r: 0.006, flat: 0.25, depth: 1.004, color: 0x8a4a5a, a: [-0.36, 0.86, 0.3], d: [-0.2, 0.2, -1], l: 0.06 },
      ]),
      // dull, flat eyes: a grey white and a small dark centre
      face: { pupil: 0x141414, sclera: 0xd6d2c4, eyeW: 0.8, browThick: 1.4 },
      outfit: {
        topStyle: 'gi', top: 0x3a5a3a, sleeves: 'none', arms: 0xd8a47a, wrist: 0x2a2a30,
        belt: 0x2a2a30, pants: 0xc0b89a, pantsStyle: 'gi', boots: 0x2a2a30, bootStyle: 'gi',
      },
      portraitColor: '#3a5a3a',
    },
    vfx: { ghost: 0xd0ffd0 },
    audio: { strikePitch: 0.8, heavyPitch: 0.72 },
    forms: [{ id: 'base', name: 'Marked', aura: { color: 0x9aff6a, core: 0xe8ffd0 }, mult: {} }],
    poses: Object.assign({ idle: poses.sp_idle }, poses),
    moves: {
      light: [
        move('spHook', 520, 'punchWindR', 'punchR', { startup: 9, recovery: 16, reach: 1.35, radius: 0.95, hitstun: 22 }),
        move('spHammer', 640, 'hammerWind', 'hammer', { startup: 11, recovery: 18, reach: 1.35, radius: 1, hitstun: 24, hitPose: 'hitBody', sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: move('spStomp', 1500, 'hammerWind', 'hammer', { startup: 18, active: 5, recovery: 26, reach: 1.5, radius: 1.2, knock: 'smash', knockSpeed: 24, impact: 3, hitstun: 34, hitPose: 'hitHeavy', sfx: 'punchHeavy' }),
      },
      dash: move('spCharge', 900, 'punchWindR', 'punchR', { startup: 12, active: 7, recovery: 22, lunge: 22, knock: 'push', knockSpeed: 18, impact: 2, hitstun: 22, sfx: 'punchHeavy' }),
      throw: { id: 'spCrush', name: 'Bear Crush', damage: 1100, knockSpeed: 16, poses: ['grab', 'hammerWind', 'hammer'] },
    },
    specials: {},
    boss: {
      phases: [{ id: 'hollow', label: 'MARKED', hpAbove: 0, speed: 1, damage: 1, patience: 1.2, patterns: { melee: 1 } }],
      patterns: {},
      techniques: {},
    },
    // Babidi's magic, not cells: whatever you do to him grows back if you give him a moment
    regen: { perSecond: 0.06, maxFrac: 1, idleFrames: 80 },
    mechanic: { type: 'bioRegen', name: 'Babidi\'s Magic', desc: 'He grows back. Anything you do to him is undone if you give him a moment to stand there.' },
    ai: { personality: 'berserker', aggression: 0.7, defense: 0.2, ranged: 0, beam: 0, transformHp: 0, preferredRange: 1.6, hooks: 'boss' },
    intro: { pose: 'sp_idle', expression: 'grin' },
    victory: { poses: ['sp_idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---------------- Yamu ---------------- */
  SL.data.characters.yamu = {
    id: 'yamu',
    assetLevel: 1,
    name: 'Yamu',
    fullName: 'Yamu',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Handler',
    blurb: 'He carries the jar. The jar is what Babidi actually wants.',
    ratings: { power: 2, speed: 3, ki: 2, defense: 2 },
    stats: { hp: 9000, ki: 80, stamina: 120, speed: 1, power: 0.6, defense: 0.8, weight: 0.8, kiRegen: 1.4, chargeRate: 14, canonPower: 0.3 },
    appearance: {
      height: 0.82,
      skin: 0xd8b08a,
      build: { chestW: 0.2, chestD: 0.15, shoulderX: 0.2, waistW: 0.17, upperArmR: 0.054, foreArmR: 0.046, fist: 0.05, thighR: 0.086, shinR: 0.066, headR: 0.14, neckLen: 0.045 },
      hair: { style: 'bald', color: 0xd8b08a },
      headExtras: mark(0x141414),
      face: { pupil: 0x141414, eyeW: 0.9 },
      outfit: {
        topStyle: 'gi', top: 0x6a3a8a, sleeves: 'long', sleeveColor: 0x6a3a8a, wrist: 0xe8e4dc,
        belt: 0x2a2a30, pants: 0x6a3a8a, pantsStyle: 'gi', boots: 0x2a2a30, bootStyle: 'gi',
      },
      portraitColor: '#6a3a8a',
    },
    vfx: { ghost: 0xe0d0ff },
    audio: { strikePitch: 1.1, heavyPitch: 1 },
    forms: [{ id: 'base', name: 'Marked', aura: { color: 0x9aff6a, core: 0xe8ffd0 }, mult: {} }],
    poses: Object.assign({ idle: C.idle }, poses),
    moves: {
      light: [move('ymJab', 300, 'punchWindR', 'punchR')],
      heavy: { 0: move('ymKick', 700, 'kickWindR', 'kickR', { startup: 12, recovery: 20, knock: 'push', knockSpeed: 12, impact: 2 }) },
      dash: move('ymDash', 420, 'punchWindR', 'punchR', { lunge: 20 }),
    },
    specials: {},
    mechanic: null,
    ai: { personality: 'grunt', aggression: 0.4, defense: 0.4, ranged: 0, beam: 0, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'idle', expression: 'grin' },
    victory: { poses: ['idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---------------- Pui Pui ---------------- */
  SL.data.characters.pui_pui = {
    id: 'pui_pui',
    assetLevel: 1,
    name: 'Pui Pui',
    fullName: 'Pui Pui of Planet Zoon',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Professional',
    blurb: 'A capable warrior from a heavy planet, fighting the one opponent in the universe he should not have drawn.',
    ratings: { power: 2, speed: 3, ki: 2, defense: 2 },
    stats: { hp: 11000, ki: 90, stamina: 130, speed: 1.02, power: 0.75, defense: 0.85, weight: 0.95, kiRegen: 1.8, chargeRate: 18, canonPower: 0.5 },
    appearance: {
      height: 0.94,
      skin: 0xe8d8a8,
      build: { chestW: 0.22, chestD: 0.16, shoulderX: 0.22, waistW: 0.17, upperArmR: 0.058, foreArmR: 0.05, fist: 0.054, thighR: 0.09, shinR: 0.07, headR: 0.14, neckLen: 0.05 },
      hair: { style: 'cropped', color: 0x6a4a8a },
      face: { pupil: 0x141414, eyeW: 0.9 },
      outfit: {
        topStyle: 'gi', top: 0xe8e4dc, sleeves: 'long', sleeveColor: 0x6a4a8a, wrist: 0x6a4a8a,
        belt: 0x6a4a8a, pants: 0xe8e4dc, pantsStyle: 'gi', boots: 0x6a4a8a, bootStyle: 'gi',
        helmet: 0x6a4a8a, visor: 0x6a4a8a, visorOpacity: 0, helmetTrim: 0xe8e4dc,
      },
      portraitColor: '#6a4a8a',
    },
    vfx: { ghost: 0xe8d8ff },
    audio: { strikePitch: 1.05, heavyPitch: 0.98 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xc8a8ff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: C.idle }, poses),
    moves: {
      light: [move('ppJab', 420, 'punchWindR', 'punchR'), move('ppKick', 520, 'kickWindR', 'kickR', { knock: 'push', knockSpeed: 10 })],
      heavy: { 0: move('ppHammer', 1200, 'hammerWind', 'hammer', { startup: 12, recovery: 20, knock: 'smash', knockSpeed: 22, impact: 3, hitstun: 30, sfx: 'punchHeavy' }) },
      dash: move('ppDash', 800, 'punchWindR', 'punchR', { lunge: 26, knock: 'heavy', knockSpeed: 18, impact: 2 }),
    },
    specials: {
      special1: {
        id: 'ppBlast', name: 'Zoon Blast', type: 'projectile', kiCost: 20, icon: 'ball',
        startup: 14, recovery: 20, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 70, radius: 0.5, damage: 1200, homing: 0.4, color: 0xc8a8ff, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 16, impact: 2, life: 2.2 },
      },
    },
    mechanic: null,
    ai: { personality: 'elite', aggression: 0.65, defense: 0.55, ranged: 0.4, beam: 0, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'idle', expression: 'smirk' },
    victory: { poses: ['idle'], expression: 'smirk' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---------------- Yakon ---------------- */
  SL.data.characters.yakon = {
    id: 'yakon',
    assetLevel: 1,
    name: 'Yakon',
    fullName: 'Yakon of Planet Mt. Keket',
    era: 'Buu Saga',
    playable: false,
    prototype: true,
    style: 'Light Eater',
    blurb: 'From a planet with no light, and hungry for it. Feed him and he grows; feed him too much and he cannot hold it.',
    ratings: { power: 3, speed: 3, ki: 5, defense: 3 },
    stats: { hp: 20000, ki: 120, stamina: 150, speed: 1.02, power: 1.05, defense: 1.05, weight: 1.3, kiRegen: 2, chargeRate: 20, canonPower: 1.2 },
    poise: Object.assign({}, BOSS_POISE),
    appearance: {
      height: 1.18,
      skin: 0x2a3a2a,
      build: { chestW: 0.27, chestD: 0.2, shoulderX: 0.28, waistW: 0.21, upperArmR: 0.074, foreArmR: 0.064, fist: 0.07, thighR: 0.108, shinR: 0.084, headR: 0.15, neckLen: 0.05 },
      hair: { style: 'bald', color: 0x2a3a2a },
      headExtras: mark(0xe8e0c8, [
        { a: [0.5, 0.8, -0.2], d: [0.4, 1, -0.3], l: 0.08, r: 0.03, color: 0xd8d8a0, depth: 0.96 },
        { a: [-0.5, 0.8, -0.2], d: [-0.4, 1, -0.3], l: 0.08, r: 0.03, color: 0xd8d8a0, depth: 0.96 },
      ]),
      face: { pupil: 0xffe27a, sclera: 0x101010, eyeW: 0.95, brow: 0x1a2a1a },
      outfit: {
        topStyle: 'gi', top: 0x6a2a2a, sleeves: 'none', arms: 0x2a3a2a, wrist: 0xd8d8a0,
        belt: 0xd8d8a0, pants: 0x6a2a2a, pantsStyle: 'gi', boots: 0x1a1a1a, bootStyle: 'gi',
      },
      portraitColor: '#2a3a2a',
    },
    vfx: { ghost: 0xffe27a },
    audio: { strikePitch: 0.82, heavyPitch: 0.75 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffe27a, core: 0xfff6d0 }, mult: {} }],
    poses: Object.assign({ idle: poses.sp_idle }, poses),
    moves: {
      light: [move('ykClaw', 700, 'punchWindR', 'punchR', { reach: 1.4, radius: 0.95 }), move('ykRake', 760, 'punchWindL', 'punchL', { reach: 1.4, radius: 0.95, hitPose: 'hitSideL' })],
      heavy: { 0: move('ykMaul', 1900, 'hammerWind', 'hammer', { startup: 14, active: 5, recovery: 24, reach: 1.5, radius: 1.1, knock: 'smash', knockSpeed: 26, impact: 3, hitstun: 32, sfx: 'punchHeavy', hitPose: 'hitHeavy' }) },
      dash: move('ykPounce', 1200, 'punchWindR', 'punchR', { lunge: 26, knock: 'heavy', knockSpeed: 20, impact: 2 }),
    },
    specials: {},
    boss: {
      phases: [
        { id: 'hungry', label: 'HUNGRY', hpAbove: 0.5, speed: 1, damage: 1, patience: 0.9, patterns: { melee: 1 } },
        { id: 'glutted', label: 'GLUTTED', hpAbove: 0, speed: 1.06, damage: 1.12, patience: 0.5, patterns: { melee: 1 } },
      ],
      patterns: {},
      techniques: {},
    },
    // he eats ki, and past a point he cannot hold it: the fight is won by feeding him
    absorb: { heal: 0.7, kiSteal: 6, cap: 1.6, burstAt: 1.1 },
    mechanic: { type: 'absorber', name: 'Light Eater', desc: 'Ki attacks feed him instead of hurting him. Past a point he cannot hold what he has eaten.' },
    ai: { personality: 'berserker', aggression: 0.75, defense: 0.35, ranged: 0, beam: 0, transformHp: 0, preferredRange: 1.8, hooks: 'boss' },
    intro: { pose: 'sp_idle', expression: 'grin' },
    victory: { poses: ['sp_idle'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
