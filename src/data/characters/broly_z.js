/*
 * BROLY (the Z movies) and BIO-BROLY — MOVIE continuity, Free Battle only, and NOT the Dragon Ball Super Broly
 * (broly.js): the board (dbz visual reference.pdf p.221–224) asks for separate designs and roster entries.
 *
 *   BROLY (Z)    the Legendary Super Saiyan of "Broly – The Legendary Super Saiyan": long black hair under a gold
 *                circlet, gold choker and chest piece with blue gems, gold arm bands and cuffs, a red waist cloth over
 *                white baggy trousers, gold shin guards with gems. Base → Super Saiyan (the circlet holding him) →
 *                Legendary Super Saiyan (green-gold, white eyes, the body swelling). A smiling brute: the lariat, the
 *                Blaster Shell, the Gigantic Meteor — and in the legendary form the Omega Blaster.
 *   BIO-BROLY    "Bio-Broly": a clone grown in bio-liquid — a swollen olive body running with slime, a few gold strands,
 *                red eyes, red openings in the chest. Slow, enormous, regrows (the regeneration mechanic).
 *
 * Level 1 prototypes: the Super Broly rig's brawling animations (br_*) are reused — both are the same kind of
 * fighter — with their own looks, specials and stats.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const BR = C.broly;
  const SKIN = 0xe8b088, GOLD = 0xe0b030, GEM = 0x2a5ae0, RED = 0xa8102a, WHITE = 0xeeeae2;
  const LSSJ = 0xb8e84a;

  const zbPoses = {
    // upright, arms loose at the sides, a little smile: the calm before it
    zb_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: b * 0.004 }, spine: [-2, 0, 0], chest: [-4 + b * 0.5, 0, 0], head: [-4, 0, 0],
        shoulderL: [-6, 0, 16], elbowL: [-16, 0, 0], shoulderR: [-6, 0, -16], elbowR: [-16, 0, 0],
        thighL: [-2, 4, 10], kneeL: [4, 0, 0], thighR: [-2, -4, -10], kneeR: [4, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // the lariat: one arm straight out at shoulder height, running through you
    zb_lariat: { root: { y: -0.04, rx: 10 }, spine: [10, -20, 0], chest: [8, -24, 0], head: [0, 20, 0], shoulderR: [-10, 0, -86], elbowR: [-4, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-70, 0, 0], thighL: [-30, 10, 12], kneeL: [40, 0, 0], thighR: [14, -10, -12], kneeR: [16, 0, 0], hands: ['fist', 'open'] },
    // the ball on one palm held out low, then pushed forward
    zb_shellW: { root: { y: -0.04 }, spine: [2, 14, 0], chest: [2, 20, 0], head: [-2, -16, 0], shoulderR: [-30, 0, -10], elbowR: [-80, 0, 0], handR: [-30, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-50, 0, 0], thighL: [-16, 8, 12], kneeL: [20, 0, 0], thighR: [10, -8, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'] },
    // SUPER SAIYAN (restrained): upright and still, chin up, the arms hanging a little off the body — the circlet holds
    zb_ssjIdle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: b * 0.004 }, spine: [-4, 0, 0], chest: [-8 + b * 0.6, 0, 0], neck: [-2, 0, 0], head: [-8, 0, 0],
        shoulderL: [-4, 0, 20], elbowL: [-14, 0, 0], shoulderR: [-4, 0, -20], elbowR: [-14, 0, 0],
        thighL: [-2, 4, 12], kneeL: [4, 0, 0], thighR: [-2, -4, -12], kneeR: [4, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // LEGENDARY: looming — the shoulders up round the neck, the chest pushed forward, the arms hanging wide and heavy with
    // the hands open, the head lowered over the grin; a slow, deep breath that moves the whole mass
    zb_lsIdle: (t) => {
      const b = Math.sin(t * 1.1);
      return {
        root: { y: -0.06 + b * 0.014, rx: 6 }, spine: [8, 0, 0], chest: [6 + b * 3, 0, 0], neck: [-4, 0, 0], head: [-16, 0, 0],
        shoulderL: [-18, 0, 40 + b * 3], elbowL: [-24, 0, 0], shoulderR: [-18, 0, -40 - b * 3], elbowR: [-24, 0, 0],
        thighL: [-14, 10, 22], kneeL: [22, 0, 0], thighR: [-10, -10, -22], kneeR: [18, 0, 0], hands: ['open', 'open'],
      };
    },
    // (Broly detail pass 2) the Legendary form moves like the film's: he floats upright with the arms out from his sides
    // and the chin up, looking down at you...
    zb_lsHover: (t) => {
      const s = Math.sin(t * 1.6);
      return {
        root: { y: 0.04 * s, rx: 2 }, spine: [-2, 0, 0], chest: [-3 + s * 2, 0, 0], neck: [0, 0, 0], head: [-2, 0, 0],
        shoulderL: [6, 0, 34 + s * 2], elbowL: [-14, 0, 0], shoulderR: [6, 0, -34 - s * 2], elbowR: [-14, 0, 0],
        thighL: [-6 + s * 2, 0, 6], kneeL: [10, 0, 0], footL: [36, 0, 0], thighR: [-4 - s * 2, 0, -6], kneeR: [8, 0, 0], footR: [36, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // ...and on the ground he does not run at you, he stalks: a slow heavy stride, the shoulders rolling, the arms held
    // out from the bulk of him
    zb_lsStride: (t, ctx) => {
      const sp = ctx && ctx.runRate ? ctx.runRate : 1;
      const c = Math.sin(t * 6 * sp);
      return {
        root: { y: -0.06 + Math.abs(c) * 0.03, rx: 6 }, spine: [6, c * 6, 0], chest: [-4, c * 8, 0], neck: [-4, 0, 0], head: [-12, -c * 6, 0],
        shoulderL: [-c * 16, 0, 28], elbowL: [-24, 0, 0], shoulderR: [c * 16, 0, -28], elbowR: [-24, 0, 0],
        thighL: [-c * 28 - 6, 0, 8], kneeL: [12 + Math.max(0, c) * 38, 0, 0], thighR: [c * 28 - 6, 0, -8], kneeR: [12 + Math.max(0, -c) * 38, 0, 0],
        hands: ['open', 'open'],
      };
    },
    zb_shell: { root: { y: -0.06, rx: 6 }, spine: [6, -10, 0], chest: [6, -14, 0], head: [-6, 12, 0], shoulderR: [-88, 0, -6], elbowR: [-6, 0, 0], handR: [-40, 0, 0], shoulderL: [-14, 0, 34], elbowL: [-50, 0, 0], thighL: [-24, 8, 12], kneeL: [32, 0, 0], thighR: [12, -8, -12], kneeR: [14, 0, 0], hands: ['fist', 'open'] },
  };

  C.broly_z = {
    id: 'broly_z',
    assetLevel: 1,
    name: 'Broly (Z)',
    fullName: 'Broly — the Legendary Super Saiyan (Z movies)',
    era: 'Movie',
    playable: true, // Free Battle (unlocks.js); never confused with the Super film's Broly
    prototype: true,
    style: 'Legendary · Brute',
    card: ['Movie', 'The Legendary Super Saiyan'],
    blurb: 'The Legendary Super Saiyan of the old films. The crown on his head was his father\'s leash; it does not hold.',
    ratings: { power: 5, speed: 2, ki: 4, defense: 5 },
    stats: { hp: 36000, ki: 160, stamina: 200, speed: 0.98, power: 1.35, defense: 1.3, weight: 1.6, kiRegen: 3, chargeRate: 40, canonPower: 9 },
    poise: { max: 90, regen: 14, regenDelay: 100, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 130, vulnerable: 1.2 },
    appearance: {
      height: 1.16,
      skin: SKIN,
      build: Object.assign({}, BR.appearance.build),
      // the 2026-10-15 Broly pass (the board p.220–222): his own hair (never the Super film's), a harder face, and every
      // accessory of the film as real geometry — the circlet's gem, gold hoops in the ears, the choker, the V-shaped chest
      // piece and its gem, gold bands and gem-set cuffs, the gold belt plate on the red cloth, gold shin guards with their
      // big oval gems over brown boots with pointed gold toes, the white trousers ballooning over the knee
      hair: { style: 'broly_z', color: 0x141418 },
      headExtras: [{ shape: 'ball', a: [0, 0.42, 0.96], d: [0, 0.2, 1], l: 0.012, r: 0.032, color: GEM, depth: 1.05, flat: 0.5, outline: 0.3 }],
      // (detail pass 2: one shaped skull with a longer, squarer jaw and the chin forward — the round head read young)
      face: { pupil: 0x141414, eyeW: 0.82, eyeH: 0.56, eyeTilt: 0.26, browThick: 1.9, brow: 0x141418, jaw: 1.18, jawW: 1.08, cheeks: 0.6, headShape: { taper: 0.16, drop: 0.26, fwd: 0.14, nape: 0.2 }, skull: [0.92, 1.05, 1] },
      outfit: {
        topStyle: 'bare', top: SKIN, arms: SKIN, headband: GOLD,
        armBands: GOLD, armBandAt: 0.42, armBandW: 0.03, armBandR: 1.22, wrist: GOLD, wristLen: 0.12,
        // the red cloth hangs wide over the front of both thighs to the knee (detail pass 2: the ballooning trousers had
        // pushed through a narrow skirt, leaving a strip); the gold V chest piece lies on the chest (a front-only usekh)
        belt: RED, beltStyle: 'sash', hem: { color: RED, len: 0.5, flare: 1.62, arc: 2.2 },
        collar: GOLD, collarStyle: 'usekh', collarBands: [SKIN, GOLD], collarReach: 0.21, collarDrop: 0.16, collarArc: 2.3,
        collarJewel: { color: GEM, size: 0.024, tilt: 0.35 },
        pants: WHITE, pantsStyle: 'harem', harem: { thigh: 1.22, balloon: 1.8, at: 0.16, cuff: 0.4 }, legs: WHITE,
        boots: GOLD, shoes: 0x9a5a2a, bootTip: GOLD, bootPoint: true, bootStyle: 'saiyan',
      },
      props: [
        { id: 'choker', shape: 'neckRing', joint: 'neck', pos: [0, 0.02, 0.004], radius: 0.1, thick: 0.22, color: GOLD },
        // the board p.220: in the Legendary form the chest piece is gone and the neck ring carries the gem — a thicker ring
        // lying on top of the swollen chest round the base of the neck (the choker itself sinks under the chest there)
        { id: 'chokerLs', shape: 'neckRing', joint: 'neck', pos: [0, 0.072, 0.005], radius: 0.088, thick: 0.3, color: GOLD, forms: ['lssj'] },
        { id: 'chokerGem', shape: 'ball', joint: 'neck', pos: [0, 0.072, 0.121], size: [0.022, 0.022, 0.012], color: GEM, outline: 0.3, forms: ['lssj'] },
        // the red sash bunched in rolls over the gold belt, the belt's wide plate and its big round gem in a gold setting
        { id: 'sashRoll0', ride: true, shape: 'ball', joint: 'spine', pos: [0, 0.038, 0.158], size: [0.05, 0.03, 0.03], color: RED, outline: 0.4 },
        { id: 'sashRoll1', ride: true, shape: 'ball', joint: 'spine', pos: [0.07, 0.034, 0.146], rot: [0, 0.4, 0.15], size: [0.046, 0.028, 0.03], color: RED, outline: 0.4 },
        { id: 'sashRoll2', ride: true, shape: 'ball', joint: 'spine', pos: [-0.07, 0.034, 0.146], rot: [0, -0.4, -0.15], size: [0.046, 0.028, 0.03], color: RED, outline: 0.4 },
        { id: 'sashRoll3', ride: true, shape: 'ball', joint: 'spine', pos: [0.125, 0.03, 0.11], rot: [0, 0.9, 0.1], size: [0.042, 0.026, 0.03], color: RED, outline: 0.4 },
        { id: 'sashRoll4', ride: true, shape: 'ball', joint: 'spine', pos: [-0.125, 0.03, 0.11], rot: [0, -0.9, -0.1], size: [0.042, 0.026, 0.03], color: RED, outline: 0.4 },
        { id: 'beltPlate', ride: true, shape: 'box', joint: 'spine', pos: [0, -0.02, 0.18], size: [0.15, 0.042, 0.012], color: GOLD },
        { id: 'beltSetting', ride: true, shape: 'ball', joint: 'spine', pos: [0, -0.02, 0.19], size: [0.032, 0.032, 0.012], color: GOLD, outline: 0.3 },
        { id: 'beltGem', ride: true, shape: 'ball', joint: 'spine', pos: [0, -0.02, 0.198], size: [0.024, 0.024, 0.012], color: GEM, outline: 0.3 },
        { id: 'cuffGemL', ride: true, shape: 'ball', joint: 'elbowL', pos: [0.088, -0.2, 0], size: [0.012, 0.026, 0.02], color: GEM, outline: 0.3 },
        { id: 'cuffGemR', ride: true, shape: 'ball', joint: 'elbowR', pos: [-0.088, -0.2, 0], size: [0.012, 0.026, 0.02], color: GEM, outline: 0.3 },
        { id: 'shinGemL', ride: true, shape: 'ball', joint: 'kneeL', pos: [0, -0.22, 0.112], size: [0.03, 0.048, 0.014], color: GEM, outline: 0.3 },
        { id: 'shinGemR', ride: true, shape: 'ball', joint: 'kneeR', pos: [0, -0.22, 0.112], size: [0.03, 0.048, 0.014], color: GEM, outline: 0.3 },
        { id: 'earringL', shape: 'hoop', joint: 'head', pos: [0.124, 0.085, 0.0], radius: 0.014, thick: 0.2, color: GOLD },
        { id: 'earringR', shape: 'hoop', joint: 'head', pos: [-0.124, 0.085, 0.0], radius: 0.014, thick: 0.2, color: GOLD },
        // the Legendary form's body: the trapezius swells up round the neck (anatomy, not only a bigger scale)
        { id: 'trapL', shape: 'ball', joint: 'chest', pos: [0.1, 0.3, -0.03], size: [0.11, 0.07, 0.09], color: SKIN, outline: 0.5, forms: ['lssj'] },
        { id: 'trapR', shape: 'ball', joint: 'chest', pos: [-0.1, 0.3, -0.03], size: [0.11, 0.07, 0.09], color: SKIN, outline: 0.5, forms: ['lssj'] },
      ],
      portraitColor: '#a8102a',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan (controlled)', short: 'SUPER SAIYAN', kiCost: 30, style: 'full',
        aura: { color: 0xffd23a, core: 0xfff4b8, particles: 0xffe070, idle: 0.35, speed: 1.2, sharp: 0.25 },
        mult: { damage: 1.4, speed: 1.06, defense: 1.25, kiRegen: 1.2, chargeRate: 1.15 },
        // restrained: his own stiff upright hair, blue-violet as the board's p.221 shows it, blue eyes — and upright
        look: { hair: { style: 'broly_z_ssj', color: 0x8a8ef0 }, pupil: 0x2a5ae0, brow: 0x6a6ad8, bulk: 1.08, muscle: 1.14, scale: 1.06 },
        poses: { idle: zbPoses.zb_ssjIdle },
        intro: { pose: 'zb_ssjIdle', expression: 'cold' },
        practiced: { length: 76, applyAt: 40, steps: [{ at: 0, pose: 'br_tfClench', speed: 9, expression: 'grit', aura: 0.5, sfx: 'kiUp' }, { at: 40, burst: true, small: true, pose: 'br_tfRoar', speed: 12, expression: 'shout', flash: 0.25, crater: 2.4 }, { at: 62, pose: 'zb_ssjIdle', expression: 'cold' }] },
        landing: { dust: 1.5 },
      },
      {
        id: 'lssj', name: 'Legendary Super Saiyan', short: 'LEGENDARY', kiCost: 60, style: 'full',
        aura: { color: 0x9aff3a, core: 0xf0ffd0, particles: 0xb8ff6a, idle: 0.5, speed: 1.5, sharp: 0.35, sparks: 0xd0ff9a },
        mult: { damage: 2.05, speed: 1.08, defense: 1.7, kiRegen: 1.4, chargeRate: 1.3, guardStamina: 1.4 },
        // the circlet does not hold the legendary form: it is gone, gem and all (2026-10-15 visual pass)
        look: { hair: { style: 'broly_lssj', color: LSSJ }, pupil: 0xffffff, pupilScale: 0.04, brow: 0x9ac83a, bulk: 1.22, muscle: 1.42, scale: 1.24, headband: false, headExtras: [], collar: false },
        // THE CHANGE (2026-10-15 Broly pass): the music drops to its pulse and the sky goes dark green while he clutches his
        // head, the ground cracks under him; it climbs as he rises roaring through lightning; at the burst the circlet
        // breaks off his head in gold shards, the Legendary theme lands at full strength, and the camera pulls back to show
        // the size of him before it settles on the grin
        sequence: {
          length: 184,
          applyAt: 104,
          steps: [
            { at: 0, pose: 'br_tfClutch', speed: 6, expression: 'grit', aura: 0.4, shot: 'orbit', sfx: 'rumble', shake: 0.4, music: 0, mood: [0.12, 0x0a1a04, 1.4] },
            { at: 28, crack: true, dust: 3, quake: 0.25 },
            { at: 50, pose: 'br_tfRise', speed: 7, expression: 'shout', aura: 0.8, quake: 0.5, sfx: 'roar', music: 1, lightning: true, skyBolt: true },
            { at: 80, quake: 0.4, skyBolt: true, music: 2 },
            { at: 104, burst: true, sfx: 'transformBurst', flash: 0.45, crater: 5, debris: { color: 0xe0b030, count: 12 }, song: 'legendary_z', songLevel: 3 },
            { at: 118, shot: 'pull' },
            { at: 140, pose: 'br_tfRoar', speed: 6, expression: 'shout', shot: 'face' },
            { at: 164, pose: 'zb_lsIdle', speed: 4, expression: 'wicked' },
          ],
        },
        // (no `practiced` short version: like the Super film's Broly, the Legendary change always plays in full — the
        // game's "short transformations" setting still cuts it to the quick burst)
        // he lands like a falling hill and turns his own weight
        landing: { dust: 2.6, crack: 1.6, quake: 0.25 },
        turnSpeed: 5,
        // his own looming stance (not the Super film's upright legendary idle)
        poses: { idle: zbPoses.zb_lsIdle, run: zbPoses.zb_lsStride, flyIdle: zbPoses.zb_lsHover },
        intro: { pose: 'zb_lsIdle', expression: 'wicked' },
        victory: { poses: ['zb_lsIdle'], expression: 'wicked' },
        // the legendary form's own finisher: the Omega Blaster, a sun of green ki
        specials: {
          ultimate: {
            id: 'zbOmega', name: 'Omega Blaster', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
            startup: 46, recovery: 44, pose: { wind: 'br_eraserW', release: 'br_eraser' },
            projectile: { kind: 'ball', speed: 30, radius: 3.4, damage: 6400, homing: 0.5, color: 0x6aff3a, core: 0xf0ffd0, explode: 16, knock: 'smash', knockSpeed: 46, impact: 5, life: 4.8 },
          },
        },
        ai: { aggression: 0.95, defense: 0.3, ranged: 0.35, beam: 0, preferredRange: 2 },
      },
    ],
    poses: Object.assign({}, BR.poses, zbPoses, { idle: zbPoses.zb_idle }),
    moves: {
      light: [
        { id: 'zbHay', startup: 7, active: 3, recovery: 14, cancel: 9, damage: 560, reach: 1.3, radius: 0.9, lunge: 12, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'br_hayW', strike: 'br_hay' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
        { id: 'zbHook', startup: 7, active: 3, recovery: 14, cancel: 9, damage: 600, reach: 1.25, radius: 0.9, lunge: 12, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'br_hookLW', strike: 'br_hookL' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
        { id: 'zbHead', startup: 9, active: 3, recovery: 17, cancel: 10, damage: 720, reach: 1.05, radius: 0.9, lunge: 12, hitstun: 30, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'br_headW', strike: 'br_head' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
      ],
      heavy: {
        0: { id: 'zbHammer', startup: 13, active: 5, recovery: 24, damage: 1600, reach: 1.4, radius: 1.15, lunge: 14, hitstun: 38, knock: 'smash', knockSpeed: 40, impact: 4, armor: true, guardCrush: true, guardDamage: 55, pose: { wind: 'br_hammerW', strike: 'br_hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'zbUpper', startup: 11, active: 4, recovery: 22, damage: 1300, reach: 1.25, radius: 1, lunge: 12, hitstun: 34, knock: 'launch', knockSpeed: 22, impact: 3, pose: { wind: 'br_upperW', strike: 'br_upper' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'zbTackle', startup: 7, active: 10, recovery: 20, damage: 1200, reach: 1.4, radius: 1.1, lunge: 34, hitstun: 30, knock: 'heavy', knockSpeed: 30, impact: 3, armor: true, pose: { wind: 'br_tackleW', strike: 'br_tackle' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'zbSlam', name: 'Ground Slam', damage: 1700, knockSpeed: 20, poses: ['grab', 'br_liftW', 'br_slam'] },
    },
    specials: {
      // BLASTER SHELL: a green ball held out on one palm and pushed
      special1: {
        id: 'zbShell', name: 'Blaster Shell', type: 'projectile', kiCost: 28, icon: 'ball',
        startup: 16, recovery: 22, pose: { wind: 'zb_shellW', release: 'zb_shell' },
        projectile: { kind: 'ball', speed: 50, radius: 1, damage: 2000, homing: 0.6, color: 0x6aff3a, core: 0xf0ffd0, explode: 6, knock: 'heavy', knockSpeed: 26, impact: 3, life: 3 },
      },
      // GIGANTIC LARIAT: the arm out, through you at a run — then the head down into you
      special2: {
        id: 'zbLariat', name: 'Gigantic Lariat', type: 'rush', kiCost: 30, icon: 'rush', cooldown: 120,
        startup: 8, dashFrames: 22, speed: 56, armor: true, recovery: 24,
        poses: { wind: 'br_tackleW', dash: 'zb_lariat' },
        hits: [
          { pose: 'zb_lariat', damage: 1100, frames: 12, sfx: 'punchHeavy' },
          { pose: 'br_head', damage: 900, frames: 12, sfx: 'punchHeavy' },
          { pose: 'br_hammer', damage: 1500, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 },
        ],
      },
      // GIGANTIC METEOR: the ball grows on his palm until it is bigger than he is
      ultimate: {
        id: 'zbMeteor', name: 'Gigantic Meteor', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 50, recovery: 46, pose: { wind: 'br_eraserW', release: 'br_eraser' },
        projectile: { kind: 'ball', speed: 30, radius: 2.8, damage: 5200, homing: 0.5, color: 0x7aff4a, core: 0xf0ffd0, explode: 14, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.5 },
      },
    },
    blast: { color: 0x7aff4a, core: 0xf0ffd0, damage: 240, speed: 56, radius: 0.36 },
    ai: { personality: 'berserker', aggression: 0.82, defense: 0.4, ranged: 0.35, beam: 0, transformHp: 0.7, preferredRange: 2.2 },
    intro: { pose: 'zb_idle', expression: 'smirk' },
    victory: { poses: ['br_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== BIO-BROLY */
  const BIO = 0x58681c, BIO_LIGHT = 0x9aac3a, BIO_RED = 0xd02a4a;
  const drips = [];
  for (const [at, ang] of [['shoulderL', 0.4], ['shoulderR', -0.4], ['elbowL', 1.0], ['elbowR', -1.0], ['thighL', 0.2], ['thighR', -0.2], ['kneeL', 0.6], ['kneeR', -0.6]]) {
    drips.push({ at, t: 0.4, ang, size: [0.012, 0.09], color: BIO_LIGHT, tilt: 0.1 });
    drips.push({ at, t: 0.62, ang: ang + 1.6, size: [0.01, 0.07], color: BIO_LIGHT, tilt: -0.15 });
  }
  const bbPoses = {
    // hunched forward under its own weight, the mouth open, the arms hanging wide
    bb_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: -0.08 + b * 0.012 }, spine: [18, 0, 0], chest: [12 + b * 2, 0, 0], neck: [10, 0, 0], head: [-26, 0, 0],
        shoulderL: [-14, 0, 34], elbowL: [-40, 0, 0], shoulderR: [-14, 0, -34], elbowR: [-40, 0, 0],
        thighL: [-16, 10, 18], kneeL: [28, 0, 0], thighR: [-16, -10, -18], kneeR: [28, 0, 0], hands: ['fist', 'fist'],
      };
    },
  };
  C.bio_broly = {
    id: 'bio_broly',
    assetLevel: 1,
    name: 'Bio-Broly',
    fullName: 'Bio-Broly (movie)',
    era: 'Movie',
    playable: true, // Free Battle (unlocks.js)
    prototype: true,
    style: 'Bio-Giant · Regrowth',
    landing: { dust: 2.4, crack: 1.4, quake: 0.18 },
    card: ['Movie', 'The bio-liquid clone'],
    blurb: 'A clone grown in bio-liquid that swallowed what it was grown in. Slow, huge — and it keeps growing back.',
    ratings: { power: 5, speed: 1, ki: 2, defense: 5 },
    stats: { hp: 42000, ki: 130, stamina: 220, speed: 0.82, power: 1.4, defense: 1.4, weight: 2, kiRegen: 2.4, chargeRate: 30, canonPower: 8 },
    poise: { max: 120, regen: 16, regenDelay: 100, armor: 2, cost: { 1: 4, 2: 8, 3: 14, 4: 22 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.34,
      skin: BIO,
      build: Object.assign({}, BR.appearance.build, { chestW: 0.29, chestD: 0.19, shoulderX: 0.29, waistW: 0.19, waistD: 0.16, upperArmR: 0.09, foreArmR: 0.08, fist: 0.085, thighR: 0.12, shinR: 0.095, neckR: 0.095 }),
      // what is left of his hair: a few gold strands at the sides and back of a bare, slimed skull
      hair: { style: 'bald', color: BIO },
      // what is left of his gold hair (the board p.223): a ragged fringe of strands out of the back of the slimed skull,
      // thrown out sideways and back and curling down at the ends — a mane, not horns (2026-10-15 Broly pass: curved locks;
      // the first version stood up like horns, the second hung straight down)
      headExtras: [
        ...[1, -1].flatMap((s) => [
          { a: [s * 0.8, 0.35, -0.45], d: [s * 1, 0.05, -0.55], l: 0.2, r: 0.03, color: 0xd8c040, depth: 0.98, flat: 0.45, outline: 0.4, bend: 0.7, toward: [0, -1, 0] },
          { a: [s * 0.6, 0.55, -0.6], d: [s * 0.85, 0.15, -0.6], l: 0.22, r: 0.03, color: 0xd8c040, depth: 0.98, flat: 0.45, outline: 0.4, bend: 0.6, toward: [0, -1, 0] },
          { a: [s * 0.88, 0.05, -0.38], d: [s * 1, -0.2, -0.45], l: 0.18, r: 0.026, color: 0xd8c040, depth: 0.98, flat: 0.45, outline: 0.4, bend: 0.7, toward: [0, -1, 0] },
          { a: [s * 0.3, 0.65, -0.72], d: [s * 0.55, 0.1, -0.85], l: 0.18, r: 0.026, color: 0xd8c040, depth: 0.98, flat: 0.45, outline: 0.4, bend: 0.6, toward: [0, -1, 0] },
        ]),
      ],
      face: { pupil: 0xff3a5a, sclera: 0xffb0c0, browThick: 1.6, brow: 0x4a5a14, jaw: 1.2, jawW: 1.1, mouthColor: 0x5a1a4a },
      decals: drips.concat([
        // the red openings in the chest
        { at: 'chest', pos: [0.06, 0.08, 0.2], rot: [0, 0.3, 0.4], size: [0.035, 0.055, 0.008], color: BIO_RED },
        { at: 'chest', pos: [-0.06, 0.08, 0.2], rot: [0, -0.3, -0.4], size: [0.035, 0.055, 0.008], color: BIO_RED },
      ]),
      // (Broly detail pass 2, the board p.223: the whole body is wet bio-liquid — dark drips over the olive and a hard wet
      // shine, `outfit.slime`; the silhouette swollen and uneven — trapezius heaped up round the neck, one shoulder bigger,
      // a hump on the back, slime hanging off the forearms and elbows)
      outfit: { topStyle: 'bare', top: BIO, arms: BIO, pants: BIO, pantsStyle: 'tight', legs: BIO, boots: BIO, bootStyle: 'gi', slime: { color: BIO, w: 0.13, h: 0.34, k: 0.5 } },
      props: [
        { id: 'trapL', shape: 'ball', joint: 'chest', pos: [0.11, 0.31, -0.03], rot: [0, 0, -0.3], size: [0.12, 0.08, 0.1], color: BIO, outline: 0.5 },
        { id: 'trapR', shape: 'ball', joint: 'chest', pos: [-0.1, 0.3, -0.03], rot: [0, 0, 0.3], size: [0.1, 0.07, 0.09], color: BIO, outline: 0.5 },
        { id: 'hump', shape: 'ball', joint: 'chest', pos: [0.03, 0.2, -0.15], size: [0.17, 0.13, 0.08], color: BIO, outline: 0.5 },
        { id: 'shoulderLump', shape: 'ball', joint: 'shoulderL', pos: [0.04, 0.02, -0.02], size: [0.11, 0.09, 0.1], color: BIO, outline: 0.5 },
        { id: 'dripElbowL', shape: 'ball', joint: 'elbowL', pos: [0, -0.04, -0.08], rot: [0.2, 0, 0], size: [0.022, 0.07, 0.02], color: BIO, outline: 0.4 },
        { id: 'dripElbowR', shape: 'ball', joint: 'elbowR', pos: [0, -0.04, -0.08], rot: [0.2, 0, 0], size: [0.02, 0.06, 0.018], color: BIO, outline: 0.4 },
        { id: 'dripForeL', shape: 'ball', joint: 'elbowL', pos: [0.02, -0.17, -0.07], size: [0.018, 0.06, 0.018], color: BIO, outline: 0.4 },
        { id: 'dripForeR', shape: 'ball', joint: 'elbowR', pos: [-0.02, -0.19, -0.07], size: [0.02, 0.07, 0.02], color: BIO, outline: 0.4 },
        { id: 'dripChin', shape: 'ball', joint: 'head', pos: [0, -0.12, 0.07], size: [0.02, 0.05, 0.02], color: BIO, outline: 0.4 },
      ],
      portraitColor: '#6a7a22',
    },
    forms: [{ id: 'base', name: 'Bio-Broly', aura: { color: 0xc8e04a, core: 0xf4ffc0, particles: 0xb0d040, speed: 1.1 }, mult: {} }],
    poses: Object.assign({}, BR.poses, bbPoses, { idle: bbPoses.bb_idle }),
    moves: {
      light: [
        { id: 'bbSwat', startup: 10, active: 4, recovery: 16, cancel: 11, damage: 720, reach: 1.5, radius: 1.1, lunge: 10, hitstun: 24, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'br_hayW', strike: 'br_hay' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
        { id: 'bbSwat2', startup: 10, active: 4, recovery: 16, cancel: 11, damage: 760, reach: 1.5, radius: 1.1, lunge: 10, hitstun: 24, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'br_hookLW', strike: 'br_hookL' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
        { id: 'bbClaw', startup: 12, active: 4, recovery: 18, cancel: 12, damage: 900, reach: 1.6, radius: 1.2, lunge: 10, hitstun: 30, knock: 'heavy', knockSpeed: 20, impact: 3, pose: { wind: 'br_clawW', strike: 'br_claw' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      ],
      heavy: {
        0: { id: 'bbCrush', startup: 16, active: 6, recovery: 28, damage: 2000, reach: 1.7, radius: 1.4, lunge: 12, hitstun: 40, knock: 'smash', knockSpeed: 40, impact: 5, armor: true, guardCrush: true, guardDamage: 60, pose: { wind: 'br_hammerW', strike: 'br_hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'bbLurch', startup: 10, active: 12, recovery: 24, damage: 1300, reach: 1.6, radius: 1.3, lunge: 26, hitstun: 30, knock: 'heavy', knockSpeed: 28, impact: 3, armor: true, pose: { wind: 'br_tackleW', strike: 'br_tackle' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'bbSmother', name: 'Bio Crush', damage: 1900, knockSpeed: 18, poses: ['grab', 'br_liftW', 'br_slam'] },
    },
    specials: {
      // BIO SPIT: a gout of the bio-liquid — heavy, slow, it bursts where it lands
      special1: {
        id: 'bbSpit', name: 'Bio Spit', type: 'projectile', kiCost: 24, icon: 'ball', fromHead: true,
        startup: 20, recovery: 24, pose: { wind: 'br_roarCharge', release: 'br_roarFire' },
        projectile: { kind: 'ball', speed: 30, radius: 0.8, damage: 1700, homing: 0.3, color: 0x9aac3a, core: 0xe8f0a0, explode: 4, knock: 'heavy', knockSpeed: 18, impact: 3, life: 3 },
      },
      // BIO SLAM: the whole weight of it, from the air
      special2: {
        id: 'bbSlam', name: 'Bio Slam', type: 'groundSlam', kiCost: 30, icon: 'down', cooldown: 240,
        crouch: 20, hang: 28, height: 7, maxRange: 18, radius: 7, clearHeight: 2.4, damage: 2400, knockSpeed: 20, recovery: 38,
        ringColor: 0xc8e04a, coreColor: 0xf4ffc0, dustColor: 'stage', poses: { crouch: 'br_slamCrouch', air: 'br_slamAir', land: 'br_slamLand' },
      },
      // GIGANTIC BIO BLAST: everything left of Broly in it, in one ball
      ultimate: {
        id: 'bbBlast', name: 'Gigantic Bio Blast', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 54, recovery: 48, pose: { wind: 'br_eraserW', release: 'br_eraser' },
        projectile: { kind: 'ball', speed: 26, radius: 3, damage: 5400, homing: 0.45, color: 0xb8d03a, core: 0xf4ffc0, explode: 14, knock: 'smash', knockSpeed: 42, impact: 5, life: 5 },
      },
    },
    mechanic: { type: 'regeneration', name: 'Bio-Regrowth', desc: 'After a few seconds without taking damage, the bio-liquid body grows back up to 60% health.', color: 0xc8e04a },
    blast: { color: 0xb8d03a, core: 0xf4ffc0, damage: 240, speed: 50, radius: 0.4 },
    ai: { personality: 'berserker', aggression: 0.8, defense: 0.25, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 2 },
    intro: { pose: 'br_tfRoar', expression: 'shout' },
    victory: { poses: ['br_tfRoar'], expression: 'shout' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
