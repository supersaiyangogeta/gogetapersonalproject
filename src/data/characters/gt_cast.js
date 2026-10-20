/*
 * DRAGON BALL GT (roster continuation, 2026-10-15) — its OWN continuity (era 'GT'), Free Battle only, never placed in
 * the canon story order. From the owner's visual reference (dbz visual reference.pdf p.77–86):
 *
 *   SUPER SAIYAN 4 GOKU    (p.77) long wild black-red hair, crimson fur over the shoulders, arms and back with the
 *                          chest bare, gold eyes in red rims, a blue sash, yellow-orange trousers, the tail. Not a
 *                          golden-haired recolour. Dragon Fist, the 10x Kamehameha.
 *   SUPER SAIYAN 4 VEGETA  (p.79) an upright flame of dark hair, red fur, blue trousers with a belt, pale gloves and
 *                          boots, the tail. Big Bang Attack, Final Shine Attack.
 *   SUPER SAIYAN 4 GOGETA  (p.80) a crimson mane, red-brown fur under the fusion vest, the blue sash, white trousers,
 *                          the tail. Big Bang Kamehameha, the 100x Big Bang Kamehameha.
 *   BABY VEGETA            (p.81) Vegeta's body taken over: silver hair swept up, red marks over the eyes, a navy
 *                          suit with a white chest plate, huge gold-and-red shoulder pads, gold gloves and boots.
 *   SUPER 17               (p.82) long black hair, the orange scarf, a navy top under orange straps, yellow forearm
 *                          bands, silver gloves with red gems, torn blue jeans, navy boots with gold tips.
 *   OMEGA SHENRON          (p.84) white, a blue under-layer on the belly, throat and groin, seven blue gems on the
 *                          chest, two long horns swept back (blue beneath), black spikes out of the shoulders, the back,
 *                          the knees and the base of the neck, black talons, red eyes. Negative Energy Ball.
 *
 * The SSJ4 fur (outfit.fur, 2026-10-15 visual pass): the arms, the open pelt over the bare chest and the tail carry
 * layered tufts in the shader (SL.Toon.addRim), ragged fringes under the shoulders, above the elbows and at the wrists,
 * and a ragged opening at the chest (Model._buildJacket).
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const GK = C.goku, VG = C.vegeta, GG = C.gogeta, A17 = C.android_17;
  // (2026-10-15 defects batch: the fur a magenta-leaning crimson, as the board's p.77 / p.79 — it was a plain crimson)
  const FUR = 0xc42858, FUR_DARK = 0x8a1e1e, SKIN = 0xf6c49a;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 4, active: 2, recovery: 10, cancel: 6, damage, reach: 1.2, radius: 0.8, lunge: 14, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 10, active: 4, recovery: 20, damage, reach: 1.3, radius: 1, lunge: 16, hitstun: 34, knock: 'smash', knockSpeed: 34, impact: 4, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const ssj4Face = (o) => Object.assign({ pupil: 0xe8c030, eyeRim: 0xd02020, browThick: 1.2, brow: 0x1a1414 }, o);
  // side: the tail swung out past one hip, so it never hangs straight down between the legs (the board shows it to the side)
  const tail = (color, side) => ({ color, segments: 9, length: 0.82, radius: 0.034, lift: 0.55, curl: 0.5, side });
  const aura4 = { color: 0xff3a5a, core: 0xffe0e8, particles: 0xff7a8a, idle: 0.45, speed: 1.4, sharp: 0.3, sparks: 0xffd0d8 };

  /* ============================================================== SUPER SAIYAN 4 GOKU */
  // his own entrance and win (2026-10-15; he borrowed base Goku's Super Saiyan reveal and his arms-up cheer)
  const g4Poses = {
    // feet wide, fists hanging clenched, chin down and the eyes up from under the brow, a slow breath through the chest
    g4_intro: (t) => {
      const b = Math.sin(t * 1.8);
      return {
        root: { y: -0.03 }, hips: [0, -10, 0], spine: [4, 4, 0], chest: [4 + b * 0.8, 6, 0], head: [12, -4, 0],
        shoulderL: [-6, 0, 26], elbowL: [-24, 0, 0], shoulderR: [-6, 0, -26], elbowR: [-24, 0, 0],
        thighL: [-6, 8, 16], kneeL: [12, 0, 0], thighR: [4, -8, -16], kneeR: [12, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // one fist thrown straight up, the chest lifted and the grin (base Goku's win raises both arms)
    g4_victory: (t) => ({
      root: { y: Math.sin(t * 2) * 0.004 }, hips: [0, 12, 0], spine: [-4, 4, 0], chest: [-8, 8, 0], head: [-10, -12, 4],
      shoulderR: [-168, 0, -12], elbowR: [-24, 0, 0], shoulderL: [-8, 0, 16], elbowL: [-30, 0, 0],
      thighL: [-4, 6, 12], kneeL: [4, 0, 0], thighR: [4, -6, -12], kneeR: [4, 0, 0], hands: ['fist', 'fist'],
    }),
    // ULTIMATE DRAGON FIST's last blow, and the pose he finishes in: driven up through him, the fist high, the body
    // stretched after it
    g4_dragonFinish: {
      root: { y: -0.04, rx: -6 }, hips: [0, 18, 0], spine: [-6, 14, 0], chest: [-10, 30, 0], head: [-18, -26, 0],
      shoulderR: [-150, 0, 4], elbowR: [-4, 0, 0], shoulderL: [-14, 0, 34], elbowL: [-120, 0, 0],
      thighL: [-50, 10, 12], kneeL: [52, 0, 0], thighR: [30, -6, -10], kneeR: [6, 0, 0], hands: ['fist', 'fist'],
    },
  };
  C.goku_ssj4 = {
    id: 'goku_ssj4', assetLevel: 1, name: 'Goku (SSJ4)', fullName: 'Goku — Super Saiyan 4 (GT)', era: 'GT',
    playable: true, prototype: true, style: 'Super Saiyan 4 · Primal',
    card: ['GT', 'Super Saiyan 4'],
    blurb: 'The Golden Great Ape brought under control: a Saiyan\'s oldest power in a man\'s body. GT\'s own continuity.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 4 },
    stats: { hp: 30000, ki: 160, stamina: 170, speed: 1.3, power: 1.9, defense: 1.4, weight: 1.05, kiRegen: 3.6, chargeRate: 44, canonPower: 9 },
    appearance: {
      height: GK.appearance.height, skin: SKIN,
      build: Object.assign({}, GK.appearance.build, { chestW: 0.225, shoulderX: 0.228, upperArmR: 0.066, foreArmR: 0.058 }),
      hair: { style: 'broly', color: 0x2a1418 },
      face: ssj4Face({ eyeW: 1.04, eyeH: 0.9 }),
      outfit: {
        topStyle: 'bare', top: SKIN, arms: FUR, jacket: { color: FUR, open: 1.3 }, fur: { color: FUR },
        wrist: 0x3a5ab8, wristLen: 0.09, belt: 0x3a3aa8, beltStyle: 'sash',
        pants: 0xf0b030, pantsStyle: 'gi', legBands: 0xd8d0e8, boots: 0x4a2a2a, bootStyle: 'gi',
        longTail: tail(FUR, 0.45),
      },
      portraitColor: '#c8203e',
    },
    forms: [{ id: 'base', name: 'Super Saiyan 4', aura: aura4, mult: {} }],
    poses: Object.assign({}, GK.poses, g4Poses),
    moves: {
      light: [
        lt('g4Jab', 'g_jabW', 'g_jab', 760),
        lt('g4Cross', 'g_crossW', 'g_cross', 820, { sfx: 'punchHeavy' }),
        lt('g4Kick', 'g_kickW', 'g_kick', 900, { startup: 5, reach: 1.4, recovery: 12, cancel: 7, sfx: 'punchHeavy', hitPose: 'hitBody' }),
        lt('g4Spin', 'g_spinKickW', 'g_spinKick', 1100, { startup: 7, reach: 1.45, recovery: 15, cancel: 9, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: hv('g4Axe', 'g_axeKickW', 'g_axeKick', 2400),
        2: hv('g4Upper', 'uppercutWind', 'uppercut', 2100, { knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('g4Knee', 'g_flyingKnee', 'g_flyingKnee', 1500, { startup: 4, active: 8, recovery: 14, lunge: 40, hitstun: 26, knock: 'heavy', knockSpeed: 24, hitPose: 'hitBody' }),
      throw: { id: 'g4Toss', name: 'Ape\'s Toss', damage: 2000, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // KAMEHAMEHA: the crimson wave of the fourth level
      special1: {
        id: 'g4Kame', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 22, chargeMax: 96, tiers: [22, 55, 90], damage: [2600, 4400], radius: [0.6, 1.3], speed: 104, range: 160, sustain: 38,
        color: 0xff3a5a, core: 0xffe8ee, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 22, sound: 'kame', callout: ['KAMEHAME', 'HA!'],
      },
      // DRAGON FIST: through you, everything behind one fist
      special2: {
        id: 'g4Dragon', name: 'Dragon Fist', type: 'rush', kiCost: 36, icon: 'rush', cooldown: 150,
        startup: 10, dashFrames: 22, speed: 70, armor: true, recovery: 26,
        poses: { wind: 'g_crossW' },
        hits: [
          { pose: 'g_cross', damage: 1100, frames: 10, sfx: 'punchHeavy' },
          { pose: 'g_elbow', damage: 1100, frames: 10, sfx: 'punchHeavy' },
          { pose: 'uppercut', damage: 3200, frames: 22, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 30, impact: 5 },
        ],
        dragon: { color: 0xffc83a, core: 0xfff4c8, size: 0.8 },
      },
      // 10X KAMEHAMEHA: the whole of the fourth level in one wave
      ultimate: {
        id: 'g4Kame10', name: '10x Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 56, chargeMax: 56, damage: [7600, 7600], radius: [2, 2], speed: 112, range: 180, sustain: 50,
        color: 0xff2a4a, core: 0xfff0f4, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 38, cinematic: true, sound: 'kame', callout: ['10X', 'KAMEHAMEHA!'],
      },
    },
    // ULTIMATE DRAGON FIST, on the skill wheel: its own move, not the Dragon Fist with more damage — a longer
    // approach, two blows before the last one, which drives him upward, and a dragon half again the size
    extras: [
      {
        id: 'g4UltDragon', name: 'Ultimate Dragon Fist', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 22, dashFrames: 30, speed: 76, recovery: 40,
        poses: { wind: 'g_dragonFistW', dash: 'g_dragonFistDash' },
        hits: [
          { pose: 'g_cross', damage: 1800, frames: 12, sfx: 'punchHeavy' },
          { pose: 'g_elbow', damage: 1800, frames: 12, sfx: 'punchHeavy' },
          { pose: 'g4_dragonFinish', damage: 7400, frames: 34, sfx: 'punchHeavy', knock: 'launch', knockSpeed: 36, impact: 5 },
        ],
        dragon: { color: 0xffa020, core: 0xfff0c0, size: 1.6 },
        // close on his upper body, beside him as he launches, both of them as the blows land, then wide round the
        // dragon as it climbs
        cine: {
          steps: [
            { on: 'start', shot: 'face', dur: 0.45 },
            { on: 'release', shot: 'track', dur: 0.8 },
            { on: 'connect', shot: 'wide', dur: 0.8 },
            { on: 'finish', shot: 'impact', dur: 2, slow: [0.3, 0.35], quake: 0.6 },
          ],
        },
      },
    ],
    ai: { personality: 'martial', aggression: 0.78, defense: 0.6, ranged: 0.35, beam: 0.45, transformHp: 0, preferredRange: 2.6 },
    intro: { pose: 'g4_intro', expression: 'smirk' },
    victory: { poses: ['g4_victory'], expression: 'grin' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== SUPER SAIYAN 4 VEGETA */
  // his own entrance and win (2026-10-15; he borrowed Vegeta's folded arms for both)
  const v4Poses = {
    // upright and leaning back, chest out, chin raised, both fists held clenched a little off his sides: the prince
    // letting you look at the fourth level
    v4_intro: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.01 }, hips: [0, 16, 0], spine: [-4, 4, 0], chest: [-8 + b * 0.8, 10, 0], head: [-16, -18, 0],
        shoulderL: [-4, 0, 30], elbowL: [-28, 0, 0], shoulderR: [-4, 0, -30], elbowR: [-28, 0, 0],
        thighL: [-4, 8, 14], kneeL: [6, 0, 0], thighR: [4, -8, -14], kneeR: [6, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // a finger levelled at the one on the ground, the other fist on his hip side, chin up
    v4_victory: (t) => ({
      root: { y: Math.sin(t * 1.8) * 0.003 }, hips: [0, -10, 0], spine: [-2, -6, 0], chest: [-6, -10, 0], head: [-12, 14, 0],
      shoulderR: [-86, 0, -6], elbowR: [-6, 0, 0], shoulderL: [-6, 0, 22], elbowL: [-40, 0, 0],
      thighL: [-4, 6, 12], kneeL: [4, 0, 0], thighR: [4, -6, -12], kneeR: [4, 0, 0], hands: ['fist', 'point'],
    }),
  };
  C.vegeta_ssj4 = {
    id: 'vegeta_ssj4', assetLevel: 1, name: 'Vegeta (SSJ4)', fullName: 'Vegeta — Super Saiyan 4 (GT)', era: 'GT',
    playable: true, prototype: true, style: 'Super Saiyan 4 · Prince',
    card: ['GT', 'Super Saiyan 4'],
    blurb: 'Bulma\'s Blutz Wave machine gave him the fourth level — and he took it as his birthright. GT\'s own continuity.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 4 },
    stats: { hp: 30000, ki: 160, stamina: 170, speed: 1.32, power: 1.92, defense: 1.36, weight: 1, kiRegen: 3.4, chargeRate: 42, canonPower: 9 },
    appearance: {
      height: VG.appearance.height, skin: SKIN,
      build: Object.assign({}, VG.appearance.build, { upperArmR: 0.064, foreArmR: 0.056 }),
      hair: { style: 'vegeta_ssj4', color: 0x3a2420 },
      face: ssj4Face(Object.assign({}, VG.appearance.face, { pupil: 0x2a6ab8, eyeRim: 0xd02020 })),
      outfit: {
        // (2026-10-15: the pelt closes in to a narrower V than Goku's — it was the same wide opening)
        topStyle: 'bare', top: SKIN, arms: FUR, jacket: { color: FUR, open: 0.95 }, fur: { color: FUR },
        belt: 0x6a5ab8, beltStyle: 'belt', buckle: 0xe0b030,
        pants: 0x2a5ab8, pantsStyle: 'tight', gloves: 0xb4a4dc, boots: 0xb8b0d8, bootTip: 0xe0b030, bootStyle: 'saiyan',
        longTail: tail(FUR, 0.5),
      },
      portraitColor: '#2a5ab8',
    },
    forms: [{ id: 'base', name: 'Super Saiyan 4', aura: aura4, mult: {} }],
    poses: Object.assign({}, VG.poses, v4Poses),
    moves: {
      light: [
        lt('v4Jab', 'v_jabW', 'v_jab', 780),
        lt('v4Hook', 'v_hookW', 'v_hook', 840, { sfx: 'punchHeavy' }),
        lt('v4Knee', 'v_kneeW', 'v_knee', 920, { startup: 5, reach: 1.1, recovery: 12, cancel: 7, sfx: 'punchHeavy', hitPose: 'hitBody' }),
        lt('v4Elbow', 'v_elbowW', 'v_elbow', 1080, { startup: 6, recovery: 14, cancel: 8, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, sfx: 'punchHeavy' }),
      ],
      heavy: {
        0: hv('v4Gut', 'v_gutW', 'v_gut', 2300, { knock: 'heavy', knockSpeed: 30, hitPose: 'hitBody' }),
        2: hv('v4Rise', 'v_riseKneeW', 'v_riseKnee', 2100, { knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('v4Rush', 'v_rushW', 'v_rush', 1500, { startup: 4, active: 8, recovery: 14, lunge: 40, hitstun: 26, knock: 'heavy', knockSpeed: 24, hitPose: 'hitBody' }),
      throw: { id: 'v4Toss', name: 'Royal Toss', damage: 2000, knockSpeed: 30, poses: ['grab', 'v_hookW', 'v_hook'] },
    },
    specials: {
      // BIG BANG ATTACK: one palm, one heavy ball
      special1: {
        id: 'v4BigBang', name: 'Big Bang Attack', type: 'projectile', kiCost: 32, icon: 'ball',
        startup: 14, recovery: 20, pose: { wind: 'v_bigBangW', release: 'v_bigBang' },
        projectile: { kind: 'ball', speed: 60, radius: 1.2, damage: 3000, homing: 1.1, color: 0x9ad0ff, core: 0xffffff, explode: 7, knock: 'heavy', knockSpeed: 28, impact: 4, life: 3 },
      },
      // PRINCE'S ONSLAUGHT: knee, elbow, the double-handed hammer
      special2: {
        id: 'v4Rush2', name: 'Prince\'s Onslaught', type: 'rush', kiCost: 34, icon: 'rush',
        startup: 8, dashFrames: 20, speed: 70, recovery: 24,
        poses: { wind: 'v_rushW' },
        hits: [
          { pose: 'v_knee', damage: 1000, frames: 9, sfx: 'punchHeavy' },
          { pose: 'v_elbow', damage: 1000, frames: 9, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 2800, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 },
        ],
      },
      // FINAL SHINE ATTACK: the green wave of the fourth level
      ultimate: {
        id: 'v4FinalShine', name: 'Final Shine Attack', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 54, chargeMax: 54, damage: [7400, 7400], radius: [1.9, 1.9], speed: 110, range: 180, sustain: 48,
        color: 0x5aff7a, core: 0xf0fff4, poses: { charge: 'v_galickCharge', fire: 'v_galickFire' }, recovery: 36, cinematic: true,
      },
    },
    ai: { personality: 'aggressive', aggression: 0.8, defense: 0.55, ranged: 0.4, beam: 0.45, transformHp: 0, preferredRange: 2.6 },
    intro: { pose: 'v4_intro', expression: 'smirk' },
    victory: { poses: ['v4_victory'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== SUPER SAIYAN 4 GOGETA */
  C.gogeta_ssj4 = Object.assign({}, GG, {
    id: 'gogeta_ssj4', assetLevel: 1, name: 'Gogeta (SSJ4)', fullName: 'Gogeta — Super Saiyan 4 (GT)', era: 'GT',
    playable: true, prototype: true, style: 'Fusion · Super Saiyan 4',
    card: ['GT', 'Fusion Dance, the fourth level'],
    blurb: 'Two Super Saiyan 4s in one Fusion Dance: the strongest being GT ever shows. Not the Fusion Reborn Gogeta and not the Blue one.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 5 },
    // powerscaling (the records PDF, 2026-10-17): was power 2.2 / speed 1.42 / defense 1.5 — a single-form fighter tuned
    // like a base one, below Fusion Reborn's Super Saiyan Gogeta; GT's strongest fusion now sits just above Super Vegito
    stats: Object.assign({}, GG.stats, { hp: 36000, power: 3.0, speed: 1.66, defense: 2.0, canonPower: 10 }),
    appearance: Object.assign({}, GG.appearance, {
      skin: SKIN,
      hair: { style: 'gogeta_ssj4', color: 0xc8301e },
      face: ssj4Face(Object.assign({}, GG.appearance.face, { pupil: 0x2a6ab8, eyeRim: 0xd02020 })),
      // (2026-10-15 defects batch: the fusion vest dark teal, as the board's p.80 — it kept Fusion Reborn's black)
      // (2026-10-15: the torso is pelt under the vest with the chest and belly bare in a V — painted, `outfit.vee` — so the
      // flanks inside the open vest show fur, as the board; the whole torso used to be skin)
      outfit: Object.assign({}, GG.appearance.outfit, {
        arms: FUR_DARK, top: FUR_DARK, legBands: 0x3a5ab8, longTail: tail(FUR_DARK, -0.5), fur: { color: FUR_DARK }, wrist: 0x2a5a8a,
        vee: { chest: { color: SKIN, at: -0.06, slope: 0.8 }, abs: { color: SKIN, at: -0.2, slope: 1.5 } },
        jacket: Object.assign({}, GG.appearance.outfit.jacket, { color: 0x1e4650 }),
      }),
      portraitColor: '#d8301a',
    }),
    forms: [{ id: 'base', name: 'Super Saiyan 4', aura: aura4, mult: {} }],
    specials: {
      // BIG BANG KAMEHAMEHA: the two fathers' waves in one
      special1: {
        id: 'gg4BigBang', name: 'Big Bang Kamehameha', type: 'beam', kiCost: 34, icon: 'beam',
        chargeMin: 22, chargeMax: 96, tiers: [22, 55, 90], damage: [2800, 4800], radius: [0.7, 1.4], speed: 108, range: 165, sustain: 40,
        color: 0x5aa8ff, core: 0xf0f8ff, poses: { charge: 'gg_bbkCharge', fire: 'gg_bbkFire' }, recovery: 22,
      },
      // METEOR SMASH: blow after blow from every side
      special2: Object.assign({}, GG.specials.special1, { id: 'gg4Meteor', name: 'Meteor Smash' }),
      // 100X BIG BANG KAMEHAMEHA: the end of GT's strongest fight
      ultimate: {
        id: 'gg4Hundred', name: '100x Big Bang Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true, sting: 'gogeta_gt_finisher',
        chargeMin: 60, chargeMax: 60, damage: [8400, 8400], radius: [2.3, 2.3], speed: 116, range: 190, sustain: 54,
        color: 0x3a8aff, core: 0xf0f8ff, poses: { charge: 'gg_bbkCharge', fire: 'gg_bbkFire' }, recovery: 40, cinematic: true,
        // outside the story (2026-10-17): low as he cocks the hand back, crimson-pink pulses in the gathering (the owner's
        // PDF colours the build-up red; the wave itself keeps GT's blue-white), up at the hand, wide as it crosses
        cine: {
          steps: [
            { on: 'start', shot: 'low', dur: 0.6, flash: 1.4, flashColor: 0xff4a7a },
            { on: 'start', at: 20, flash: 1.8, flashColor: 0xff6a9a },
            { on: 'start', at: 36, shot: 'hand', dur: 0.4, flash: 2.2, flashColor: 0xff3a6a },
            { on: 'release', shot: 'wide', dur: 1.3, quake: 0.4 },
          ],
        },
      },
    },
    extras: (GG.extras || []).filter((x) => x.type === 'teleport').concat([
      // BIG BANG BLUFF (the PDF's comedic fake-out, GT against Omega Shenron; optional, never his serious ultimate): in
      // close, he holds him and gathers a Big Bang Kamehameha in his palms... which comes out as a puff of streamers,
      // a smirk, and then the real blow
      {
        id: 'bigBangBluff', name: 'Big Bang Bluff', type: 'rush', kiCost: 35, icon: 'rush', freeOnly: true,
        startup: 10, dashFrames: 26, speed: 56, recovery: 28,
        poses: { wind: 'gg_smirk', dash: 'gg_dashStrike' },
        hits: [
          { pose: 'gg_bbkCharge', frames: 40, aim: { color: 0xff4a7a, hand: 'R' } },
          { pose: 'gg_smirk', frames: 22, move: true, confetti: true },
          { pose: 'gg_heavy', damage: 2200, frames: 24, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 44, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.35 },
            { on: 'aim', shot: 'aim', dur: 0.7 },
            { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.35 },
          ],
        },
      },
      // PRIMAL COMBO (the PDF's "Street-Fighter Primal Combo"; a game rush): wild, unconventional — a backfist, a back
      // kick, two fingers flicked off his brow at him, a knee, then over him for an elbow dropped from above
      {
        id: 'primalCombo', name: 'Primal Combo', type: 'rush', kiCost: 45, icon: 'rush', freeOnly: true,
        startup: 10, dashFrames: 28, speed: 58, recovery: 28,
        poses: { wind: 'gg_neck', dash: 'gg_dashStrike' },
        hits: [
          { pose: 'gg_backfist', damage: 450, frames: 9, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { pose: 'gg_backKick', damage: 600, frames: 11, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { pose: 'gg_twoFinger', frames: 16, move: true },
          { pose: 'gg_knee', damage: 500, frames: 10, sfx: 'punchHeavy', hitPose: 'hitBody', lift: 1.5 },
          { pose: 'gg_airHammer', damage: 1600, frames: 24, sfx: 'punchHeavy', to: 'above', knock: 'smash', knockSpeed: 42, impact: 4, hitPose: 'hitHeavy' },
        ],
        cine: {
          steps: [
            { on: 'release', shot: 'track', dur: 0.35 },
            { on: 'connect', shot: 'wide', dur: 1 },
            { on: 'finish', shot: 'impact', dur: 0.8, quake: 0.35 },
          ],
        },
      },
    ]),
    intro: { pose: 'gg_smirk', expression: 'smirk' },
  });

  /* ============================================================== BABY VEGETA */
  const BV_NAVY = 0x1e2448, BV_GOLD = 0xe0b030, BV_RED = 0xc81e2a;
  C.baby_vegeta = {
    id: 'baby_vegeta', assetLevel: 1, name: 'Baby Vegeta', fullName: 'Baby Vegeta (GT)', era: 'GT',
    playable: true, prototype: true, style: 'Parasite · Revenge',
    card: ['GT', 'The Tuffle parasite'],
    blurb: 'The last Tuffle, a parasite in Vegeta\'s body, wearing the Saiyan prince like armour for a revenge older than either of them.',
    ratings: { power: 5, speed: 4, ki: 5, defense: 4 },
    stats: { hp: 30000, ki: 170, stamina: 170, speed: 1.28, power: 1.85, defense: 1.4, weight: 1.05, kiRegen: 3.8, chargeRate: 44, canonPower: 9 },
    appearance: {
      height: VG.appearance.height * 1.06, skin: 0xe8c0a0,
      build: Object.assign({}, VG.appearance.build, { chestW: 0.225, shoulderX: 0.228, upperArmR: 0.064, foreArmR: 0.058 }),
      hair: { style: 'baby_vegeta', color: 0xd0c8ec },
      // the red marks painted on the skin (the board p.81): a stripe up the forehead over each eye and a line down each
      // cheek under it (they were raised pills that read as horns from the side)
      headExtras: [1, -1].flatMap((s) => [
        { shape: 'line', a: [s * 0.3, 0.3, 0.92], d: [s * 0.12, 1, 0], l: 0.075, r: 0.016, flat: 0.25, depth: 1.004, color: BV_RED },
        { shape: 'line', a: [s * 0.33, 0.02, 0.94], d: [0, -1, 0.1], l: 0.04, r: 0.009, flat: 0.25, depth: 1.004, color: BV_RED },
      ]),
      face: Object.assign({}, VG.appearance.face, { pupil: 0x2a6ab8, eyeRim: BV_RED, brow: 0xd8d0f0 }),
      outfit: {
        topStyle: 'armor', top: BV_NAVY, arms: BV_NAVY, sleeves: 'long', sleeveColor: BV_NAVY, pants: BV_NAVY, pantsStyle: 'tight',
        // the white plate over the chest only (no red ring), and the great gold guards rising off the shoulders beside the
        // head, red inside (the 2026-10-15 visual pass)
        // (2026-10-15: the plate runs round the front to the armpits only, `wrap` — it went round the back as a white ring)
        armor: { plate: 0xf0eee6, belly: BV_NAVY, pecs: true, wrap: 3.6 },
        gloves: BV_GOLD, wrist: BV_RED, wristLen: 0.06, boots: BV_GOLD, bootTip: BV_RED, bootStyle: 'saiyan', legBands: BV_RED,
      },
      // the great gold guards (the board p.81): hollow shells cupped over each shoulder, rising to the ears, the red
      // lining open to the front and the neck (they were round balls)
      props: [1, -1].map((s) => ({
        id: s > 0 ? 'guardL' : 'guardR', joint: 'chest', shape: 'shell', pos: [s * 0.24, 0.24, -0.03], rot: [0, s * 2.0, 0],
        lean: -0.25, spread: 2.9, drop: 2.2, size: [0.15, 0.27, 0.15], color: BV_GOLD, inner: BV_RED,
      })),
      portraitColor: '#1e2448',
    },
    forms: [{ id: 'base', name: 'Super Baby', aura: { color: 0xff6a3a, core: 0xffe0c8, particles: 0xff9a6a, idle: 0.4, speed: 1.3, sharp: 0.3 }, mult: {} }],
    poses: Object.assign({}, VG.poses),
    moves: {
      light: [
        lt('bvJab', 'v_jabW', 'v_jab', 760),
        lt('bvBack', 'v_backhandW', 'v_backhand', 820, { sfx: 'punchHeavy', hitPose: 'hitSideL' }),
        lt('bvKnee', 'v_kneeW', 'v_knee', 940, { startup: 5, reach: 1.1, recovery: 12, cancel: 7, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('bvChop', 'v_chopW', 'v_chop', 2300),
        2: hv('bvRise', 'v_riseKneeW', 'v_riseKnee', 2000, { knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('bvDive', 'v_diveW', 'v_dive', 1400, { startup: 4, active: 8, recovery: 14, lunge: 40, hitstun: 26, knock: 'heavy', knockSpeed: 24, hitPose: 'hitBody' }),
      throw: { id: 'bvToss', name: 'Tuffle Toss', damage: 1900, knockSpeed: 30, poses: ['grab', 'v_hookW', 'v_hook'] },
    },
    specials: {
      // REVENGE CANNON: a red-orange shot from the open palm
      special1: {
        id: 'bvCannon', name: 'Revenge Cannon', type: 'projectile', kiCost: 26, icon: 'ball',
        startup: 12, recovery: 18, pose: { wind: 'v_bigBangW', release: 'v_bigBang' },
        projectile: { kind: 'ball', speed: 64, radius: 0.9, damage: 2600, homing: 0.8, color: 0xff6a3a, core: 0xfff0e0, explode: 5, knock: 'heavy', knockSpeed: 26, impact: 3, life: 2.8 },
      },
      // PARASITE ONSLAUGHT: in, the backhand, the knee, the chop
      special2: {
        id: 'bvRush', name: 'Parasite Onslaught', type: 'rush', kiCost: 32, icon: 'rush',
        startup: 8, dashFrames: 20, speed: 70, recovery: 24,
        poses: { wind: 'v_rushW' },
        hits: [
          { pose: 'v_backhand', damage: 950, frames: 9, sfx: 'punchHeavy' },
          { pose: 'v_knee', damage: 1000, frames: 9, sfx: 'punchHeavy' },
          { pose: 'v_chop', damage: 2600, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 },
        ],
      },
      // REVENGE DEATH BALL: a sun of the Tuffles' hatred raised overhead and thrown
      ultimate: {
        id: 'bvDeathBall', name: 'Revenge Death Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 52, recovery: 46, pose: { wind: 'v_throwUp', release: 'v_bigBang' },
        projectile: { kind: 'ball', speed: 28, radius: 3.2, damage: 7000, homing: 0.5, color: 0xff5a2a, core: 0xfff0d8, explode: 16, knock: 'smash', knockSpeed: 46, impact: 5, life: 4.8 },
      },
    },
    ai: { personality: 'aggressive', aggression: 0.76, defense: 0.55, ranged: 0.45, beam: 0, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'v_chinUp', expression: 'wicked' },
    victory: { poses: ['v_raggedLaugh'], expression: 'wicked' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== SUPER 17 */
  const S17_BROWN = 0x9a5426, S17_GOLD = 0xe0b030;
  if (A17) {
    C.super_17 = Object.assign({}, A17, {
      id: 'super_17', assetLevel: 1, name: 'Super 17', fullName: 'Super 17 (GT)', era: 'GT',
      playable: true, prototype: true, style: 'Android Fusion · Absorption',
      card: ['GT', 'Two Androids 17 in one'],
      blurb: 'Android 17 and Hell Fighter 17 merged by two mad scientists: taller, stronger, and able to swallow a ki blast whole.',
      ratings: { power: 5, speed: 4, ki: 4, defense: 5 },
      stats: Object.assign({}, A17.stats, { hp: 34000, power: 1.85, speed: 1.3, defense: 1.5, canonPower: 9 }),
      appearance: Object.assign({}, A17.appearance, {
        height: (A17.appearance.height || 1) * 1.12,
        // the 2026-10-15 visual pass: the long hair (it was 17's length), brown harness straps (no gold ring round the chest),
        // the orange scarf knotted at his left shoulder, a red gem in each silver palm
        hair: { style: 'super17', color: 0x141418 },
        outfit: {
          topStyle: 'armor', top: 0x2a3a7a, arms: 0x2a3a7a, sleeves: 'long', sleeveColor: 0x2a3a7a,
          armor: { plate: 0x2a3a7a, belly: 0x2a3a7a, pads: S17_BROWN, padStyle: 'strap', padScale: 1.3 },
          // a dark belt close round the jeans (it stood out round him as a gold hoop); the gold buckle is a prop
          wrist: S17_GOLD, wristLen: 0.12, gloves: 0xc8ccd8, belt: 0x1c2450, beltStyle: 'belt', beltFit: 0.9, buckle: 0x1c2450,
          pants: 0x3a64c8, pantsStyle: 'slacks', boots: 0x2a3a7a, bootTip: 0xe0b030, bootStyle: 'saiyan',
        },
        props: [
          // the bandana bunched thick round the throat (the board p.82), its knot and two tails at his left shoulder
          { id: 'scarf', shape: 'neckRing', joint: 'neck', pos: [0, 0.012, 0.01], radius: 0.088, thick: 0.75, color: 0xe8641a },
          { id: 'scarfKnot', shape: 'ball', joint: 'chest', pos: [0.1, 0.305, 0.07], size: [0.045, 0.04, 0.038], color: 0xe8641a },
          { id: 'scarfTail1', shape: 'tri', joint: 'chest', pos: [0.135, 0.34, 0.05], rot: [0, 0.4, 2.4], size: [0.045, 0.09, 0.01], color: 0xe8641a },
          { id: 'scarfTail2', shape: 'tri', joint: 'chest', pos: [0.16, 0.31, 0.03], rot: [0, 0.4, 1.9], size: [0.038, 0.08, 0.01], color: 0xe8641a },
          { id: 'palmGemL', shape: 'ball', joint: 'handL', pos: [-0.028, -0.05, 0.006], size: [0.012, 0.016, 0.01], color: 0xd81828, outline: 0.3 },
          { id: 'palmGemR', shape: 'ball', joint: 'handR', pos: [0.028, -0.05, 0.006], size: [0.012, 0.016, 0.01], color: 0xd81828, outline: 0.3 },
          // the board p.82: the brown harness straps run down the front from the shoulders to the belt, a gold band with
          // two screws on each over the pecs; a wide gold buckle with an X; his jeans torn on both thighs; a gold earring
          ...[1, -1].flatMap((s) => [
            { id: 'strap' + s, shape: 'strip', joint: 'chest', color: S17_BROWN, width: 0.032, thick: 0.01,
              path: [[s * 0.11, 0.325, 0.07], [s * 0.105, 0.3, 0.127], [s * 0.1, 0.27, 0.166], [s * 0.095, 0.24, 0.191], [s * 0.092, 0.2, 0.2], [s * 0.09, 0.15, 0.197], [s * 0.089, 0.1, 0.187], [s * 0.088, 0.05, 0.172], [s * 0.087, 0, 0.156], [s * 0.086, -0.05, 0.132], [s * 0.085, -0.08, 0.128]] },
            { id: 'strapLow' + s, shape: 'strip', joint: 'spine', color: S17_BROWN, width: 0.032, thick: 0.01,
              path: [[s * 0.085, 0.14, 0.135], [s * 0.083, 0.1, 0.117], [s * 0.081, 0.05, 0.114], [s * 0.08, 0, 0.125], [s * 0.08, -0.015, 0.14]] },
            { id: 'chestBand' + s, shape: 'strip', joint: 'chest', color: S17_GOLD, width: 0.044, thick: 0.016,
              path: [[s * 0.093, 0.225, 0.199], [s * 0.091, 0.17, 0.206], [s * 0.089, 0.115, 0.195]] },
            { id: 'screwA' + s, shape: 'ball', joint: 'chest', pos: [s * 0.092, 0.2, 0.211], size: [0.008, 0.008, 0.004], color: 0x6a6a74, outline: 0.3 },
            { id: 'screwB' + s, shape: 'ball', joint: 'chest', pos: [s * 0.09, 0.14, 0.208], size: [0.008, 0.008, 0.004], color: 0x6a6a74, outline: 0.3 },
          ]),
          { id: 'buckle', shape: 'box', joint: 'spine', pos: [0, -0.046, 0.134], size: [0.1, 0.052, 0.014], color: S17_GOLD },
          { id: 'buckleX1', shape: 'box', joint: 'spine', pos: [0, -0.02, 0.142], rot: [0, 0, 0.72], size: [0.008, 0.06, 0.004], color: 0xa07818 },
          { id: 'buckleX2', shape: 'box', joint: 'spine', pos: [0, -0.02, 0.142], rot: [0, 0, -0.72], size: [0.008, 0.06, 0.004], color: 0xa07818 },
          // a rip: a long gash across the thigh, frayed white threads round the skin showing through
          ...[['thighR', 0.01, -0.19, 0.15], ['thighL', -0.012, -0.29, -0.12]].flatMap(([j, x, y, r]) => [
            { id: 'rip' + j, shape: 'tri', joint: j, pos: [x, y, 0.095], rot: [0, 0, r + Math.PI / 2], size: [0.017, 0.052, 0.003], color: 0xd8e4f4, outline: 0.25 },
            { id: 'ripB' + j, shape: 'tri', joint: j, pos: [x, y, 0.095], rot: [0, 0, r - Math.PI / 2], size: [0.017, 0.052, 0.003], color: 0xd8e4f4, outline: 0.25 },
            { id: 'ripSkin' + j, shape: 'ball', joint: j, pos: [x, y, 0.097], rot: [0, 0, r], size: [0.04, 0.014, 0.003], color: A17.appearance.skin, outline: 0 },
          ]),
          { id: 'earring', shape: 'hoop', joint: 'head', pos: [0.132, -0.045, 0.01], radius: 0.011, color: S17_GOLD },
        ],
        portraitColor: '#e8641a',
      }),
      forms: [{ id: 'base', name: 'Super 17', aura: { color: 0x8ad4ff, core: 0xffffff, particles: 0xb8e8ff, idle: 0.3, speed: 1.3 }, mult: {} }],
      specials: {
        // PHOTON FLASH: the gem in the palm, a fast shot
        special1: {
          id: 's17Flash', name: 'Photon Flash', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 60,
          startup: 10, recovery: 14, pose: { wind: 'blastWind', release: 'blastR' },
          projectile: { kind: 'blast', speed: 86, radius: 0.4, damage: 2200, homing: 0.3, color: 0x8ad4ff, core: 0xffffff, explode: 2.6, knock: 'heavy', knockSpeed: 22, impact: 3, guardPierce: 0.5, life: 2.2 },
        },
        // HELL'S RUSH: the android's beating, both fists
        special2: {
          id: 's17Rush', name: 'Hell Fighter Rush', type: 'rush', kiCost: 32, icon: 'rush',
          startup: 8, dashFrames: 20, speed: 70, recovery: 24,
          poses: { wind: 'a17_jabW' },
          hits: [
            { pose: 'a17_jab', damage: 950, frames: 8, sfx: 'punchHeavy' },
            { pose: 'a17_kick', damage: 1000, frames: 9, sfx: 'punchHeavy' },
            { pose: 'hammer', damage: 2600, frames: 20, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 },
          ],
        },
        // SUPER ELECTRIC STRIKE: both hands, a wave of crackling light
        ultimate: {
          id: 's17Strike', name: 'Super Electric Strike', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
          chargeMin: 50, chargeMax: 50, damage: [7000, 7000], radius: [1.8, 1.8], speed: 110, range: 175, sustain: 46,
          color: 0x6ac8ff, core: 0xf0faff, poses: { charge: 'a17_barrierW', fire: 'a17_barrier' }, recovery: 34,
        },
      },
      ai: Object.assign({}, A17.ai, { personality: 'aggressive', aggression: 0.74, defense: 0.6, ranged: 0.4, beam: 0.4, preferredRange: 2.8 }),
      intro: { pose: 'a17_bored', expression: 'smirk' },
      victory: { poses: ['a17_bored'], expression: 'smirk' },
    });
  }

  /* ============================================================== OMEGA SHENRON */
  const OM_WHITE = 0xf0ece0, OM_BLUE = 0x2a3ab8, OM_BLACK = 0x1e1e24;
  const omPoses = {
    // upright, arms hanging heavy, chin down: a dragon that does not need to hurry
    om_idle: (t) => {
      const b = Math.sin(t * 1.1);
      return {
        root: { y: -0.02 + b * 0.006 }, spine: [6, 0, 0], chest: [4 + b, 0, 0], head: [4, 0, 0],
        shoulderL: [-8, 0, 22], elbowL: [-24, 0, 0], shoulderR: [-8, 0, -22], elbowR: [-24, 0, 0],
        thighL: [-6, 8, 14], kneeL: [10, 0, 0], thighR: [-6, -8, -14], kneeR: [10, 0, 0], hands: ['fist', 'fist'],
      };
    },
    om_ballW: (t) => ({ root: { y: 0.02 }, spine: [-10, 0, 0], chest: [-14 + Math.sin(t * 24), 0, 0], head: [-24, 0, 0], shoulderL: [-170, 0, 24], elbowL: [-10, 0, 0], shoulderR: [-170, 0, -24], elbowR: [-10, 0, 0], thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [-4, 0, -10], kneeR: [6, 0, 0], hands: ['open', 'open'] }),
    om_ball: { root: { y: -0.06, rx: 10 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [-4, 0, 0], shoulderL: [-96, 0, 24], elbowL: [-6, 0, 0], shoulderR: [-96, 0, -24], elbowR: [-6, 0, 0], thighL: [-20, 0, 12], kneeL: [26, 0, 0], thighR: [6, 0, -12], kneeR: [10, 0, 0], hands: ['open', 'open'] },
  };
  // the seven blue gems of the chest (the board p.84): two on the pecs, three across the middle, two low; on the chest's
  // own surface (the 2026-10-15 visual pass: they used to sit under it)
  const gems = [[0.06, 0.19, 0.2], [-0.06, 0.19, 0.2], [0.1, 0.11, 0.183], [0, 0.11, 0.186], [-0.1, 0.11, 0.183], [0.05, 0.04, 0.162], [-0.05, 0.04, 0.162]]
    .map(([x, y, z], i) => ({ id: 'gem' + i, joint: 'chest', shape: 'ball', pos: [x, y, z], size: [0.02, 0.02, 0.014], color: OM_BLUE, outline: 0.4 }));
  // the black spikes: one out of each shoulder, a fan of long ones off the back, one out of each knee, two at the base of
  // the neck; black talons on the feet and black nails on the hands (spike props point along their +Y)
  const omSpikes = [
    { id: 'shoulderL', joint: 'chest', pos: [0.3, 0.26, -0.03], rot: [-0.55, 0, -1.15], size: [0.05, 0.3, 1] },
    { id: 'shoulderR', joint: 'chest', pos: [-0.3, 0.26, -0.03], rot: [-0.55, 0, 1.15], size: [0.05, 0.3, 1] },
    { id: 'back0', joint: 'chest', pos: [0.1, 0.24, -0.15], rot: [-1.0, 0, -0.55], size: [0.05, 0.5, 1] },
    { id: 'back1', joint: 'chest', pos: [-0.1, 0.24, -0.15], rot: [-1.0, 0, 0.55], size: [0.05, 0.5, 1] },
    { id: 'back2', joint: 'chest', pos: [0.14, 0.12, -0.15], rot: [-1.35, 0, -1.0], size: [0.045, 0.46, 1] },
    { id: 'back3', joint: 'chest', pos: [-0.14, 0.12, -0.15], rot: [-1.35, 0, 1.0], size: [0.045, 0.46, 1] },
    { id: 'back4', joint: 'chest', pos: [0.12, 0.0, -0.13], rot: [-1.7, 0, -1.25], size: [0.04, 0.36, 1] },
    { id: 'back5', joint: 'chest', pos: [-0.12, 0.0, -0.13], rot: [-1.7, 0, 1.25], size: [0.04, 0.36, 1] },
    { id: 'kneeL', joint: 'kneeL', pos: [0.05, -0.02, 0.06], rot: [0.9, 0, -1.0], size: [0.034, 0.14, 1] },
    { id: 'kneeR', joint: 'kneeR', pos: [-0.05, -0.02, 0.06], rot: [0.9, 0, 1.0], size: [0.034, 0.14, 1] },
    { id: 'neckL', joint: 'chest', pos: [0.08, 0.29, 0.11], rot: [1.2, 0, -0.6], size: [0.022, 0.07, 1] },
    { id: 'neckR', joint: 'chest', pos: [-0.08, 0.29, 0.11], rot: [1.2, 0, 0.6], size: [0.022, 0.07, 1] },
  ].map((p) => Object.assign({ shape: 'spike', color: OM_BLACK }, p, { id: 'spike_' + p.id }));
  C.omega_shenron = {
    id: 'omega_shenron', assetLevel: 1, name: 'Omega Shenron', fullName: 'Omega Shenron (GT)', era: 'GT',
    playable: true, prototype: true, style: 'Shadow Dragon · Negative Energy',
    card: ['GT', 'The strongest Shadow Dragon'],
    blurb: 'Syn Shenron with all seven Dragon Balls swallowed: the negative energy of every wish ever made, in one body.',
    ratings: { power: 5, speed: 3, ki: 5, defense: 5 },
    stats: { hp: 42000, ki: 180, stamina: 200, speed: 1.12, power: 2.0, defense: 1.6, weight: 1.6, kiRegen: 4, chargeRate: 44, canonPower: 10 },
    poise: { max: 100, regen: 16, regenDelay: 100, armor: 2, cost: { 1: 5, 2: 9, 3: 14, 4: 24 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.24, skin: OM_WHITE,
      build: { chestW: 0.27, chestD: 0.18, shoulderX: 0.28, waistW: 0.17, waistD: 0.15, upperArmR: 0.08, foreArmR: 0.072, fist: 0.08, thighR: 0.108, shinR: 0.085, headR: 0.118, neckR: 0.08 },
      hair: { style: 'bald', color: OM_WHITE },
      headExtras: [
        // two long horns swept far back off the brow, blue on their undersides (the board: longer than the head is deep)
        { a: [0.35, 0.8, 0.2], d: [0.18, 0.14, -1], l: 0.5, r: 0.05, color: OM_WHITE, depth: 0.98, outline: 0.6 },
        { a: [-0.35, 0.8, 0.2], d: [-0.18, 0.14, -1], l: 0.5, r: 0.05, color: OM_WHITE, depth: 0.98, outline: 0.6 },
        { a: [0.35, 0.68, 0.16], d: [0.18, 0.08, -1], l: 0.44, r: 0.036, color: OM_BLUE, depth: 0.98, outline: 0.4 },
        { a: [-0.35, 0.68, 0.16], d: [-0.18, 0.08, -1], l: 0.44, r: 0.036, color: OM_BLUE, depth: 0.98, outline: 0.4 },
      ],
      face: { pupil: 0xd02020, sclera: 0xfff0f0, browThick: 1.6, brow: 0xb8b4a8, noEars: false, pointedEars: true, jaw: 1.16, jawW: 1.06, mouthColor: 0x2a2a6a },
      // the blue under-layer: the belly under a white point of the chest, the throat, the groin
      props: gems.concat(omSpikes, [
        { id: 'belly', joint: 'spine', shape: 'ball', pos: [0, 0.1, 0.1], size: [0.15, 0.12, 0.062], color: OM_BLUE, outline: 0.4 },
        { id: 'vee', joint: 'spine', shape: 'tri', pos: [0, 0.17, 0.165], rot: [-0.2, 0, 0], size: [0.11, 0.075, 0.02], color: OM_WHITE, outline: 0.5 },
        { id: 'throat', joint: 'neck', shape: 'ball', pos: [0, 0.04, 0.05], size: [0.05, 0.05, 0.03], color: OM_BLUE, outline: 0 },
        { id: 'groin', joint: 'hips', shape: 'ball', pos: [0, -0.05, 0.13], size: [0.075, 0.065, 0.03], color: OM_BLUE, outline: 0.4 },
        { id: 'clawL', joint: 'footL', shape: 'claws', pos: [0, -0.07, 0.16], rot: [Math.PI / 2, 0, 0], count: 3, length: 0.06, radius: 0.016, spread: 0.08, hook: 0.6, color: OM_BLACK },
        { id: 'clawR', joint: 'footR', shape: 'claws', pos: [0, -0.07, 0.16], rot: [Math.PI / 2, 0, 0], count: 3, length: 0.06, radius: 0.016, spread: 0.08, hook: 0.6, color: OM_BLACK },
      ]),
      outfit: {
        // (2026-10-15 defects batch, the board p.84: heavy legs, the cloth bunched at the ankles — it ballooned into blobs mid-shin)
        topStyle: 'bare', top: OM_WHITE, arms: OM_WHITE, pants: OM_WHITE, pantsStyle: 'harem', harem: { thigh: 1.12, balloon: 1.32, at: 0.5, cuff: 0.95 }, legs: OM_WHITE, boots: OM_WHITE, bootStyle: 'gi',
        wrist: OM_WHITE, wristLen: 0.04, nails: OM_BLACK, // black nails (the board p.84)
      },
      portraitColor: '#2a3ab8',
    },
    forms: [{ id: 'base', name: 'Omega Shenron', aura: { color: 0x3a4aff, core: 0xd8e0ff, particles: 0x6a7aff, idle: 0.4, speed: 1.2, sharp: 0.3 }, mult: {} }],
    poses: Object.assign({}, omPoses, { idle: omPoses.om_idle }),
    moves: {
      light: [
        lt('omJab', 'punchWindR', 'punchR', 900, { startup: 6, recovery: 13, cancel: 8, sfx: 'punchHeavy' }),
        lt('omHook', 'punchWindL', 'punchL', 960, { startup: 6, recovery: 13, cancel: 8, sfx: 'punchHeavy', hitPose: 'hitSideR' }),
        lt('omKick', 'kickWindR', 'kickR', 1100, { startup: 8, reach: 1.45, recovery: 16, cancel: 10, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, sfx: 'punchHeavy', hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('omHammer', 'hammerWind', 'hammer', 2600, { startup: 13, recovery: 24, armor: true, guardCrush: true, guardDamage: 55 }),
        2: hv('omUpper', 'uppercutWind', 'uppercut', 2200, { knock: 'launch', knockSpeed: 22 }),
      },
      dash: hv('omCharge', 'punchWindR', 'punchR', 1600, { startup: 6, active: 10, recovery: 18, lunge: 34, hitstun: 28, knock: 'heavy', knockSpeed: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'omToss', name: 'Dragon\'s Grip', damage: 2200, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // DRAGON THUNDER: lightning from both hands, three bolts fanned
      special1: {
        id: 'omThunder', name: 'Dragon Thunder', type: 'projectile', kiCost: 26, icon: 'blast', cooldown: 80,
        startup: 12, recovery: 16, pose: { wind: 'om_ballW', release: 'om_ball' },
        projectile: { kind: 'blast', count: 3, spread: 0.35, speed: 90, radius: 0.34, damage: 1300, homing: 0.3, color: 0x8a9aff, core: 0xffffff, explode: 2.2, knock: 'heavy', knockSpeed: 20, impact: 3, life: 2 },
      },
      // DRAGON CRUSH: the weight of seven wishes behind both fists
      special2: {
        id: 'omCrush', name: 'Dragon Crush', type: 'rush', kiCost: 32, icon: 'rush',
        startup: 10, dashFrames: 22, speed: 58, armor: true, recovery: 26,
        poses: { wind: 'hammerWind' },
        hits: [
          { pose: 'punchR', damage: 1100, frames: 11, sfx: 'punchHeavy' },
          { pose: 'punchL', damage: 1100, frames: 11, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 2800, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 42, impact: 5 },
        ],
      },
      // NEGATIVE ENERGY BALL: every wish's dark side in one sphere
      ultimate: {
        id: 'omMinus', name: 'Negative Energy Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 56, recovery: 48, pose: { wind: 'om_ballW', release: 'om_ball' },
        projectile: { kind: 'ball', speed: 26, radius: 3.4, damage: 7600, homing: 0.45, color: 0x2a3aff, core: 0xd8e0ff, explode: 17, knock: 'smash', knockSpeed: 46, impact: 5, life: 5 },
      },
    },
    blast: { color: 0x6a7aff, core: 0xffffff, damage: 260, speed: 58, radius: 0.36 },
    ai: { personality: 'adaptive', aggression: 0.66, defense: 0.55, ranged: 0.5, beam: 0, transformHp: 0, preferredRange: 3.2 },
    intro: { pose: 'om_idle', expression: 'smirk' },
    victory: { poses: ['om_idle'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== SUPER SAIYAN BLUE GOGETA (Super: Broly) */
  // the board asks for each Gogeta as its own entry: Fusion Reborn's Gogeta (a Movie fighter) keeps base / SSJ, his Blue
  // story-only; this is the Super: Broly film's Gogeta (era 'Movie'), Blue from the first frame, with the film's kit
  const GB_FORM = (GG.forms || []).find((f) => f.id === 'blue');
  if (GB_FORM) {
    const sf = (GG.extras || []).find((x) => x.type === 'stardustFall');
    C.gogeta_blue = Object.assign({}, GG, {
      id: 'gogeta_blue', assetLevel: 1, name: 'Gogeta (Blue)', fullName: 'Gogeta — Super Saiyan Blue (Dragon Ball Super: Broly)', era: 'Movie',
      playable: true, prototype: true, style: 'Fusion · Super Saiyan Blue',
      card: ['Movie', 'Dragon Ball Super: Broly'],
      blurb: 'The film\'s Gogeta: the Fusion Dance done right on the ice field against Broly, and Blue from the first second.',
      ratings: { power: 5, speed: 5, ki: 5, defense: 5 },
      stats: Object.assign({}, GG.stats, { power: 2.25, speed: 1.46, defense: 1.5, canonPower: 11 }),
      // (2026-10-16, the owner's collage — him against Broly: the film's own Metamoran clothes, not Fusion Reborn's: a
      // dark teal vest opened wider over the chest, a slimmer gold padded roll lying closer over the shoulders, the
      // teal sash and wraps; the white trousers kept)
      appearance: Object.assign({}, GG.appearance, {
        hair: GB_FORM.look.hair, face: Object.assign({}, GG.appearance.face, { pupil: GB_FORM.look.pupil, brow: GB_FORM.look.brow }), portraitColor: '#34c4ff',
        outfit: Object.assign({}, GG.appearance.outfit, {
          jacket: { color: 0x17363e, open: 1.6 },
          paddedCollar: { color: 0xf2c43a, size: 0.86, shoulder: 0.82 },
          wrist: 0x1c4a54, belt: 0x2a8a98, boots: 0x1f6070,
        }),
      }),
      forms: [Object.assign({}, GB_FORM, { id: 'base', name: 'Super Saiyan Blue', kiCost: undefined, storyLocked: undefined, storyOnly: undefined, freeUnlock: undefined, sequence: undefined, practiced: undefined, mult: {} })],
      specials: Object.assign({}, GG.specials, {
        // STARDUST FALL is his special here (an extra of the What-If Gogeta)
        special2: sf ? Object.assign({}, sf) : GG.specials.special2,
        // ULTIMATE KAMEHAMEHA: the film's finish
        ultimate: {
          id: 'ggbUltKame', name: 'Ultimate Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true, sting: 'gogeta_blue_finisher',
          chargeMin: 58, chargeMax: 58, damage: [8600, 8600], radius: [2.2, 2.2], speed: 118, range: 190, sustain: 52,
          color: 0x34c4ff, core: 0xf0fbff, poses: { charge: 'gg_bbkCharge', fire: 'gg_bbkFire' }, recovery: 40, cinematic: true,
          // outside the story (2026-10-17): round him as it gathers, up at the hands, wide as it crosses
          cine: { steps: [{ on: 'start', shot: 'orbit', dur: 0.6 }, { on: 'start', at: 34, shot: 'hand', dur: 0.4 }, { on: 'release', shot: 'wide', dur: 1.3, quake: 0.35 }] },
        },
      }),
      extras: (GG.extras || []).filter((x) => x.type === 'teleport').concat([
        // DIMENSIONAL SHATTER (the PDF's "Dimensional Shatter Combo", after the Broly film; a game rush): the beckoning
        // hand, gone in a streak, then knees, palm thrusts and roundhouses from every side while the world around them
        // turns strange — a controlled change of the stage's light and colour (purple, teal, crimson), not a white-out
        // and not a separate renderer — and back to the real field for the double palm that ends it. Earned for Free
        // Battle by clearing "The Ultimate Fusion" (bb_gogeta)
        {
          id: 'dimensionalShatter', name: 'Dimensional Shatter', type: 'rush', kiCost: 55, icon: 'rush',
          forms: ['base'], freeUnlock: 'bb_gogeta', freeOnly: true,
          startup: 14, dashFrames: 26, speed: 66, recovery: 30,
          poses: { wind: 'gg_oneHand', dash: 'gg_dashStrike' },
          hits: [
            { pose: 'gg_knee', damage: 500, frames: 9, sfx: 'punchHeavy', hitPose: 'hitBody' },
            { pose: 'gg_thrust', damage: 500, frames: 9, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
            { pose: 'gg_round', damage: 550, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideL', to: 'front', lift: 1.2 },
            { pose: 'gg_knee', damage: 500, frames: 9, sfx: 'punchHeavy', hitPose: 'hitBack', to: 'behind' },
            { pose: 'gg_round', damage: 550, frames: 10, sfx: 'punchHeavy', hitPose: 'hitSideR', to: 'front' },
            { pose: 'gg_palms', damage: 2100, frames: 24, sfx: 'kiBlastBig', ki: { color: 0x7ae8ff, hand: 'both' }, explode: 1.4, knock: 'heavy', knockSpeed: 46, impact: 4, hitPose: 'hitHeavy' },
          ],
          cine: {
            steps: [
              { on: 'start', shot: 'face', dur: 0.4 },
              { on: 'release', shot: 'track', dur: 0.35 },
              { on: 'connect', shot: 'wide', dur: 0.95, mood: [0.6, 0x3a1060, 0.15] },
              { on: 'connect', at: 18, mood: [0.6, 0x0a4a5a, 0.12] },
              { on: 'connect', at: 36, mood: [0.6, 0x5a0a2a, 0.12] },
              { on: 'finish', shot: 'impact', dur: 0.9, quake: 0.4, mood: [0, 0x000000, 0.2] },
            ],
          },
        },
      ]),
    });
  }
})();
