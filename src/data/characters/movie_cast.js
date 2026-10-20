/*
 * MORE MOVIE FIGHTERS (roster continuation, 2026-10-15) — MOVIE continuity, Free Battle only.
 *
 *   DR. WHEELO   ("The World's Strongest", visual reference p.219) a brain in a glass dome set in the chest of a huge
 *                bio-mechanical body: dark teal plates, lavender joints, long claws, a tail. Machinery, not martial
 *                arts: missiles, a crushing claw, the Power Ball.
 *   TAPION       ("Wrath of the Dragon", p.225–226) red-orange spiked hair, pointed ears, a gold brow plate, a dark
 *                green bodysuit under a long gold-orange coat, a teal scarf, brown gloves, gold boots, the sword on
 *                his back and the ocarina at his belt. Sword-based: Future Trunks' cuts are the closest school; the
 *                Hero's Flute stills an enemy where it stands.
 *   HIRUDEGARN   (p.226) the monster of Konats: an olive carapace over purple-grey segmented limbs, a red crest with
 *                two black horns, a long black segmented tail, the wing cases and glassy wings. A GIANT (2026-10-15
 *                visual pass): 3.3 times a man's scale, so the giant camera frames him; hit on body parts like the Great
 *                Ape; a slow turn; Hell's Stomp, the Tail Sweep and the Crushing Grip are the Great Ape's telegraphed
 *                giant techniques (the danger drawn on the ground first), and his CPU runs them as boss patterns.
 *
 * Level 1 prototypes on the shared rig.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const FT = C.future_trunks;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 12, active: 4, recovery: 22, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const base = (aura) => ({ id: 'base', name: 'Base', aura: aura || { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} });

  /* ============================================================== DR. WHEELO */
  const WH_BODY = 0x22404a, WH_JOINT = 0xa098c8, WH_GLASS = 0x9ae0d8, WH_BRAIN = 0xe88aa8;
  const whPoses = {
    // claws raised and open, the body leaning back to show the dome
    wh_idle: (t) => {
      const b = Math.sin(t * 1.3);
      return {
        root: { y: -0.04 + b * 0.008 }, spine: [-6, 0, 0], chest: [-8 + b, 0, 0], head: [-6, 0, 0],
        shoulderL: [-60, 0, 70], elbowL: [-70, 0, 0], shoulderR: [-60, 0, -70], elbowR: [-70, 0, 0],
        thighL: [-16, 12, 22], kneeL: [26, 0, 0], thighR: [-16, -12, -22], kneeR: [26, 0, 0], hands: ['open', 'open'],
      };
    },
    wh_clawW: { root: { y: -0.02, rx: -6 }, spine: [-8, -10, 0], chest: [-10, -14, 0], head: [-6, 10, 0], shoulderR: [-150, 0, -40], elbowR: [-40, 0, 0], shoulderL: [-60, 0, 60], elbowL: [-70, 0, 0], thighL: [-18, 12, 20], kneeL: [28, 0, 0], thighR: [-10, -12, -20], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    wh_claw: { root: { y: -0.1, rx: 14 }, spine: [14, 12, 0], chest: [16, 18, 0], head: [6, -12, 0], shoulderR: [-50, 0, -10], elbowR: [-14, 0, 0], shoulderL: [-50, 0, 50], elbowL: [-60, 0, 0], thighL: [-30, 12, 20], kneeL: [40, 0, 0], thighR: [10, -12, -20], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    // the Power Ball: both claws over the dome, the ball growing from the chest
    wh_ballW: (t) => ({ root: { y: -0.02 }, spine: [-10, 0, 0], chest: [-14 + Math.sin(t * 26), 0, 0], head: [-12, 0, 0], shoulderL: [-100, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-100, 0, -30], elbowR: [-60, 0, 0], thighL: [-14, 10, 20], kneeL: [22, 0, 0], thighR: [-14, -10, -20], kneeR: [22, 0, 0], hands: ['open', 'open'] }),
    wh_ball: { root: { y: -0.06, rx: 8 }, spine: [8, 0, 0], chest: [10, 0, 0], head: [-4, 0, 0], shoulderL: [-90, 0, 14], elbowL: [-8, 0, 0], shoulderR: [-90, 0, -14], elbowR: [-8, 0, 0], thighL: [-24, 10, 20], kneeL: [32, 0, 0], thighR: [4, -10, -20], kneeR: [14, 0, 0], hands: ['open', 'open'] },
  };
  const joints = ['elbowL', 'elbowR', 'kneeL', 'kneeR'].map((at) => ({ at, t: 0.06, ang: 0, lift: 1.1, size: [0.06, 0.05], color: WH_JOINT }));
  C.dr_wheelo = {
    id: 'dr_wheelo', assetLevel: 1, name: 'Dr. Wheelo', fullName: 'Dr. Wheelo (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Bio-Machine · Projectiles',
    card: ['Movie', 'The World\'s Strongest'],
    blurb: 'A scientist who survived as a brain in a jar and built himself a body. He wants a stronger one — yours.',
    ratings: { power: 4, speed: 2, ki: 5, defense: 4 },
    stats: { hp: 26000, ki: 170, stamina: 160, speed: 0.92, power: 1.2, defense: 1.3, weight: 1.6, kiRegen: 4, chargeRate: 38, canonPower: 3 },
    poise: { max: 90, regen: 14, regenDelay: 100, armor: 2, cost: { 1: 5, 2: 9, 3: 15, 4: 24 }, beamMul: 1.1, breakFrames: 120, vulnerable: 1.2 },
    appearance: {
      height: 1.46, skin: WH_BODY, metal: 0.4,
      build: { chestW: 0.27, chestD: 0.19, shoulderX: 0.28, waistW: 0.13, waistD: 0.12, upperArmR: 0.06, foreArmR: 0.07, fist: 0.09, thighR: 0.07, shinR: 0.07, headR: 0.1, neckR: 0.06 },
      hair: { style: 'bald', color: WH_BODY },
      headExtras: [
        { a: [0.3, 0.8, -0.2], d: [0.3, 1, -0.2], l: 0.14, r: 0.025, color: WH_BODY, depth: 0.96, outline: 0.5 },
        { a: [-0.3, 0.8, -0.2], d: [-0.3, 1, -0.2], l: 0.14, r: 0.025, color: WH_BODY, depth: 0.96, outline: 0.5 },
        { a: [0, 0.9, -0.3], d: [0, 1, -0.4], l: 0.16, r: 0.025, color: WH_JOINT, depth: 0.96, outline: 0.5 },
      ],
      face: { pupil: 0xff2a2a, sclera: 0x101418, brow: WH_BODY, browThick: 0.5, eyeW: 0.8, eyeH: 0.5, noEars: true, mouthColor: 0x101418 },
      decals: joints.concat([
        // the glass dome in the chest, and the brain inside it
        { at: 'chest', pos: [0, 0.06, 0.14], rot: [0, 0, 0], size: [0.11, 0.1, 0.07], color: WH_GLASS },
        { at: 'chest', pos: [0, 0.06, 0.16], rot: [0, 0, 0], size: [0.075, 0.065, 0.05], color: WH_BRAIN },
      ]),
      // the bio-machine's long claws (2026-10-15 visual pass: the shared hands read as a man's)
      props: ['L', 'R'].map((s) => ({ id: 'claw' + s, joint: 'hand' + s, shape: 'claws', pos: [0, -0.09, 0.01], rot: [Math.PI, 0, 0], count: 3, length: 0.14, radius: 0.02, spread: 0.07, hook: -0.6, color: WH_JOINT })),
      outfit: { topStyle: 'bare', top: WH_BODY, arms: WH_BODY, pants: WH_BODY, pantsStyle: 'tight', legs: WH_BODY, boots: WH_JOINT, bootStyle: 'gi', shoulderPads: WH_BODY, longTail: { color: WH_JOINT, segments: 9, length: 1.1, radius: 0.045, lift: 0.6, curl: 0.4 } },
      portraitColor: '#22404a',
    },
    forms: [base({ color: 0xff6a8a, core: 0xffe0e8, particles: 0xff9ab0 })],
    poses: Object.assign({}, whPoses, { idle: whPoses.wh_idle }),
    moves: {
      light: [
        lt('whSwipe', 'wh_clawW', 'wh_claw', 700, { startup: 9, reach: 1.6, radius: 1.1, recovery: 16, cancel: 10, hitPose: 'hitSideL' }),
        lt('whSwipe2', 'punchWindL', 'punchL', 720, { startup: 9, reach: 1.5, radius: 1, recovery: 16, cancel: 10, hitPose: 'hitSideR' }),
        lt('whStab', 'punchWindR', 'punchR', 820, { startup: 10, reach: 1.7, radius: 1, recovery: 18, hitstun: 28, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' }),
      ],
      heavy: {
        0: hv('whCrush', 'wh_clawW', 'wh_claw', 1700, { startup: 15, recovery: 26, reach: 1.7, radius: 1.3, knock: 'smash', knockSpeed: 36, impact: 4, armor: true, guardCrush: true, guardDamage: 55 }),
      },
      dash: hv('whLunge', 'wh_clawW', 'wh_claw', 1100, { startup: 8, active: 10, recovery: 20, lunge: 28, hitstun: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'whGrip', name: 'Specimen Grip', damage: 1600, knockSpeed: 22, poses: ['grab', 'wh_clawW', 'wh_claw'] },
    },
    specials: {
      // BIO-MISSILES: four shots out of the body, curving in
      special1: {
        id: 'whMissiles', name: 'Bio-Missiles', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 70,
        startup: 14, recovery: 18, pose: { wind: 'wh_ballW', release: 'wh_ball' },
        projectile: { kind: 'blast', count: 4, spread: 0.7, speed: 64, radius: 0.34, damage: 700, homing: 0.9, color: 0xff6a8a, core: 0xffe0e8, explode: 2.2, knock: 'push', knockSpeed: 12, impact: 2, life: 2.8 },
      },
      // CLAW CRUSH: the claws close on you, twice, and then the body comes down on you
      special2: {
        id: 'whClaw', name: 'Claw Crush', type: 'rush', kiCost: 30, icon: 'rush',
        startup: 10, dashFrames: 22, speed: 50, armor: true, recovery: 24,
        poses: { wind: 'wh_clawW' },
        hits: [
          { pose: 'wh_claw', damage: 800, frames: 12, sfx: 'punchHeavy' },
          { pose: 'wh_clawW', damage: 800, frames: 12, sfx: 'punchHeavy' },
          { pose: 'wh_claw', damage: 1600, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 },
        ],
      },
      // POWER BALL: the ball grows out of the dome until it fills the field
      ultimate: {
        id: 'whPowerBall', name: 'Power Ball', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 50, recovery: 44, pose: { wind: 'wh_ballW', release: 'wh_ball' },
        projectile: { kind: 'ball', speed: 28, radius: 2.8, damage: 5400, homing: 0.5, color: 0xff5a7a, core: 0xffe0e8, explode: 14, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.8 },
      },
    },
    blast: { color: 0xff6a8a, core: 0xffe0e8, damage: 230, speed: 56, radius: 0.36 },
    ai: { personality: 'gunner', aggression: 0.45, defense: 0.55, ranged: 0.75, beam: 0, transformHp: 0, preferredRange: 7 },
    intro: { pose: 'wh_idle', expression: 'wicked' },
    victory: { poses: ['wh_idle'], expression: 'wicked' },
    defeat: { pose: 'knockdown', expression: 'hurt' },
  };

  /* ============================================================== TAPION */
  const TP_SKIN = 0xf0c8a0, TP_SUIT = 0x3a4a22, TP_COAT = 0xd89a2a, TP_SCARF = 0x1a6a6a, TP_GOLD = 0xe0b030;
  const tpPoses = {
    // the hand on the sword's grip over his shoulder, the other at his side: wary, tired, ready
    tp_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return {
        root: { y: b * 0.004 }, spine: [2, 0, 0], chest: [0 + b * 0.5, -6, 0], head: [2, 8, 0],
        shoulderR: [-150, 0, -30], elbowR: [-100, 0, 0], shoulderL: [-8, 0, 16], elbowL: [-20, 0, 0],
        thighL: [-4, 6, 10], kneeL: [6, 0, 0], thighR: [4, -6, -10], kneeR: [8, 0, 0], hands: ['fist', 'open'],
      };
    },
    // the ocarina at his lips
    tp_flute: (t) => ({ root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [6 + Math.sin(t * 3) * 2, 0, 0], shoulderL: [-60, -30, 14], elbowL: [-130, 0, 0], shoulderR: [-60, 30, -14], elbowR: [-130, 0, 0], thighL: [-2, 0, 8], kneeL: [4, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0], hands: ['open', 'open'] }),
  };
  C.tapion = {
    id: 'tapion', assetLevel: 1, name: 'Tapion', fullName: 'Tapion (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Swordsman · Ocarina',
    card: ['Movie', 'Wrath of the Dragon'],
    blurb: 'The last hero of Konats, who carried half of a monster sealed inside himself for a thousand years. His ocarina holds it still.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 17000, ki: 130, stamina: 120, speed: 1.1, power: 1.12, defense: 1.0, weight: 0.95, kiRegen: 3, chargeRate: 36, canonPower: 3 },
    appearance: {
      height: 1.0, skin: TP_SKIN,
      build: { chestW: 0.2, chestD: 0.13, shoulderX: 0.2, waistW: 0.125, upperArmR: 0.052, foreArmR: 0.046, thighR: 0.08, shinR: 0.06, headR: 0.12 },
      hair: { style: 'goku_ssj', color: 0xe8501a },
      headExtras: [{ shape: 'ball', a: [0, 0.45, 0.9], d: [0, 0.3, 1], l: 0.01, r: 0.06, color: TP_GOLD, depth: 1.02, flat: 0.3, outline: 0.4 }],
      face: { pupil: 0x2a3a6a, browThick: 1.0, brow: 0xc84a1a, pointedEars: true, jaw: 1.0, eyeTilt: 0.1 },
      outfit: {
        topStyle: 'gi', top: TP_COAT, under: TP_SUIT, sleeves: 'long', sleeveColor: TP_SUIT, collar: TP_SCARF, collarStyle: 'turtle',
        belt: 0x5a3a1a, hem: { color: TP_COAT, len: 0.5, flare: 1.35 }, pants: TP_SUIT, pantsStyle: 'tight',
        gloves: 0x6a4a2a, boots: TP_GOLD, bootTip: 0x8a5a1a, bootStyle: 'saiyan', cape: TP_SCARF,
      },
      props: [
        { id: 'sword', shape: 'broadsword', joint: 'handR', pos: [0, -0.05, 0.012], rot: [2.25, 0, 0], length: 0.9, blade: 0xe6eaf0, guard: 0xb8b8c8, grip: 0x5a3a2a, pommel: 0xb8b8c8 },
        { id: 'scabbard', shape: 'sheath', joint: 'chest', pos: [0.02, 0.1, -0.215], rot: [0.16, 0, 0.62], length: 0.94, color: 0xb8201a, trim: 0x8a6a3a, grip: 0x5a3a2a, guard: 0xb8b8c8 },
        // the ocarina hung at his belt over the coat: a clay egg with its mouthpiece and finger holes (it was a small box,
        // under the coat)
        { id: 'ocarina', shape: 'ball', joint: 'hips', pos: [0.1, -0.045, 0.15], rot: [0, 0.3, 0.3], size: [0.034, 0.024, 0.022], color: 0x8a6a4a },
        { id: 'ocarinaMouth', shape: 'spike', joint: 'hips', pos: [0.128, -0.035, 0.144], rot: [0, 0.3, -1.25], size: [0.01, 0.026, 0.8], color: 0x8a6a4a, outline: 0.4 },
        { id: 'ocarinaHoleA', shape: 'ball', joint: 'hips', pos: [0.092, -0.041, 0.171], size: [0.005, 0.005, 0.002], color: 0x2a1a10, outline: 0 },
        { id: 'ocarinaHoleB', shape: 'ball', joint: 'hips', pos: [0.108, -0.049, 0.168], size: [0.005, 0.005, 0.002], color: 0x2a1a10, outline: 0 },
      ],
      portraitColor: '#d89a2a',
    },
    forms: [base({ color: 0xffe0a0, core: 0xffffff, particles: 0xfff0c0 })],
    poses: Object.assign({}, FT.poses, tpPoses, { idle: tpPoses.tp_idle }),
    moves: {
      light: [
        lt('tpCut', 'ft_cutW', 'ft_cut', 520, { startup: 5, reach: 1.6, radius: 0.95, recovery: 11, cancel: 7, sfx: 'swordSlash', hitPose: 'hitSideL' }),
        lt('tpReturn', 'ft_returnW', 'ft_return', 540, { startup: 5, reach: 1.6, radius: 0.95, recovery: 11, cancel: 7, sfx: 'swordSlash', hitPose: 'hitSideR' }),
        lt('tpUpcut', 'ft_upcutW', 'ft_upcut', 640, { startup: 7, reach: 1.6, radius: 0.95, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, sfx: 'swordSlash' }),
      ],
      heavy: {
        0: hv('tpDrop', 'ft_dropW', 'ft_drop', 1400, { reach: 1.7, knock: 'smash', knockSpeed: 34, sfx: 'swordSlash' }),
        2: hv('tpRise', 'ft_riseW', 'ft_rise', 1200, { startup: 10, reach: 1.6, knock: 'launch', knockSpeed: 22, sfx: 'swordSlash' }),
      },
      dash: hv('tpLunge', 'ft_lungeW', 'ft_lunge', 900, { startup: 4, active: 8, recovery: 14, reach: 1.7, lunge: 40, hitstun: 26, sfx: 'swordSlash', hitPose: 'hitBody' }),
      throw: { id: 'tpPommel', name: 'Pommel Strike', damage: 1100, knockSpeed: 28, poses: ['grab', 'ft_cutW', 'ft_cut'] },
    },
    specials: {
      // HERO'S FLUTE: the ocarina's melody — whatever hears it stands still while it plays
      special1: {
        id: 'tpFlute', name: 'Hero\'s Flute', type: 'timeFreeze', kiCost: 34, icon: 'clock', cooldown: 480,
        range: 24, startup: 14, holdFrames: 90, kiPerSecond: 24, recovery: 40, poses: { hold: 'tp_flute' },
      },
      // BRAVE SWORD ATTACK: the blade, again and again, and the drop
      special2: {
        id: 'tpBlade', name: 'Brave Sword Attack', type: 'rush', kiCost: 34, icon: 'rush',
        startup: 8, dashFrames: 20, speed: 58, recovery: 24,
        poses: { wind: 'ft_cutW', dash: 'dash' },
        hits: [
          { pose: 'ft_cut', damage: 600, frames: 9, sfx: 'swordSlash' },
          { pose: 'ft_return', damage: 620, frames: 9, sfx: 'swordSlash' },
          { pose: 'ft_spin', damage: 680, frames: 11, sfx: 'swordSlash' },
          { pose: 'ft_drop', damage: 1500, frames: 20, sfx: 'swordSlash', knock: 'smash', knockSpeed: 36, impact: 4 },
        ],
      },
      // BRAVE CANNON: the hero's wave from both hands
      ultimate: {
        id: 'tpCannon', name: 'Brave Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 44, chargeMax: 44, damage: [4600, 4600], radius: [1.4, 1.4], speed: 100, range: 160, sustain: 42,
        color: 0xffd060, core: 0xfff8e0, poses: { charge: 'ft_busterCharge', fire: 'ft_busterFire' }, recovery: 30,
      },
    },
    mechanic: { type: 'swordsman', name: 'Sword Guard', desc: 'A guard timed on a ki blast knocks it back with the flat of the blade.' },
    ai: { personality: 'martial', aggression: 0.62, defense: 0.6, ranged: 0.3, beam: 0.35, transformHp: 0, preferredRange: 2.2 },
    intro: { pose: 'tp_flute', expression: 'calm' },
    victory: { poses: ['tp_idle'], expression: 'calm' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ============================================================== HIRUDEGARN */
  const HG_SHELL = 0x8c8a2e, HG_SKIN = 0x9a9a3c, HG_DARK = 0x5a5a1e, HG_LIMB = 0x7a7aa8, HG_BLACK = 0x1e1e24, HG_RED = 0xc82a2a;
  const hgPoses = {
    // hunched forward, claws spread low, the head thrust out
    hg_idle: (t) => {
      const b = Math.sin(t * 1.1);
      return {
        root: { y: -0.1 + b * 0.012 }, spine: [22, 0, 0], chest: [14 + b * 2, 0, 0], neck: [14, 0, 0], head: [-30, 0, 0],
        shoulderL: [-30, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -50], elbowR: [-60, 0, 0],
        thighL: [-30, 14, 26], kneeL: [44, 0, 0], thighR: [-30, -14, -26], kneeR: [44, 0, 0], hands: ['open', 'open'],
      };
    },
    hg_breathW: { root: { y: -0.08 }, spine: [-6, 0, 0], chest: [-12, 0, 0], neck: [-10, 0, 0], head: [-34, 0, 0], shoulderL: [-30, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -60], elbowR: [-40, 0, 0], thighL: [-24, 12, 24], kneeL: [36, 0, 0], thighR: [-24, -12, -24], kneeR: [36, 0, 0], hands: ['open', 'open'] },
    hg_breath: { root: { y: -0.12, rx: 10 }, spine: [16, 0, 0], chest: [14, 0, 0], neck: [10, 0, 0], head: [-6, 0, 0], shoulderL: [-50, 0, 50], elbowL: [-50, 0, 0], shoulderR: [-50, 0, -50], elbowR: [-50, 0, 0], thighL: [-34, 12, 24], kneeL: [48, 0, 0], thighR: [-20, -12, -24], kneeR: [34, 0, 0], hands: ['open', 'open'] },
    // the giant's techniques (2026-10-15): one foot raised high and brought down; the body wrung round to throw the tail;
    // a claw reaching out, closing, throwing
    hg_stompW: { root: { y: -0.02 }, spine: [-8, 0, 0], chest: [-10, 0, 0], neck: [4, 0, 0], head: [-14, 0, 0], shoulderL: [-20, 0, 80], elbowL: [-50, 0, 0], shoulderR: [-20, 0, -80], elbowR: [-50, 0, 0], thighL: [-12, 10, 16], kneeL: [22, 0, 0], thighR: [-88, -10, -20], kneeR: [86, 0, 0], hands: ['open', 'open'] },
    hg_stomp: { root: { y: -0.2 }, spine: [26, 0, 0], chest: [16, 0, 0], neck: [10, 0, 0], head: [-26, 0, 0], shoulderL: [-40, 0, 46], elbowL: [-70, 0, 0], shoulderR: [-40, 0, -46], elbowR: [-70, 0, 0], thighL: [-44, 16, 26], kneeL: [70, 0, 0], thighR: [-26, -16, -26], kneeR: [32, 0, 0], hands: ['open', 'open'] },
    hg_sweepW: { root: { y: -0.12, ry: -30 }, spine: [16, -24, 0], chest: [10, -30, 0], neck: [6, 20, 0], head: [-24, 26, 0], shoulderL: [-50, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -70], elbowR: [-20, 0, 0], thighL: [-30, 14, 26], kneeL: [46, 0, 0], thighR: [-26, -14, -26], kneeR: [40, 0, 0], hands: ['open', 'open'] },
    hg_sweep: { root: { y: -0.14, ry: 50 }, spine: [18, 30, 0], chest: [12, 36, 0], neck: [6, -26, 0], head: [-24, -30, 0], shoulderL: [-20, 0, 70], elbowL: [-20, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-30, 0, 0], thighL: [-26, 14, 26], kneeL: [40, 0, 0], thighR: [-34, -14, -26], kneeR: [50, 0, 0], hands: ['open', 'open'] },
    hg_reach: { root: { y: -0.12 }, spine: [24, 0, 0], chest: [14, 0, 0], neck: [6, 0, 0], head: [-20, 0, 0], shoulderL: [-30, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-88, 0, -8], elbowR: [-8, 0, 0], thighL: [-36, 14, 26], kneeL: [52, 0, 0], thighR: [-24, -14, -26], kneeR: [34, 0, 0], hands: ['open', 'open'] },
    hg_hold: { root: { y: -0.08 }, spine: [6, 0, 0], chest: [-4, 0, 0], neck: [0, 0, 0], head: [-10, 0, 0], shoulderL: [-30, 0, 60], elbowL: [-50, 0, 0], shoulderR: [-70, 0, -24], elbowR: [-80, 0, 0], thighL: [-26, 14, 26], kneeL: [40, 0, 0], thighR: [-26, -14, -26], kneeR: [40, 0, 0], hands: ['open', 'fist'] },
    hg_throw: { root: { y: -0.14 }, spine: [30, 0, 0], chest: [18, 0, 0], neck: [8, 0, 0], head: [-26, 0, 0], shoulderL: [-30, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-6, 0, 0], thighL: [-40, 14, 26], kneeL: [56, 0, 0], thighR: [-20, -14, -26], kneeR: [30, 0, 0], hands: ['open', 'open'] },
    hg_winded: { root: { y: -0.22 }, spine: [36, 0, 0], chest: [20, 0, 0], neck: [10, 0, 0], head: [-10, 0, 0], shoulderL: [-14, 0, 24], elbowL: [-20, 0, 0], shoulderR: [-14, 0, -24], elbowR: [-20, 0, 0], thighL: [-40, 14, 26], kneeL: [64, 0, 0], thighR: [-40, -14, -26], kneeR: [64, 0, 0], hands: ['open', 'open'] },
  };
  // the giant's techniques, shared by his buttons and by his CPU patterns (the Great Ape machinery in SL.Techniques)
  const HG_T = {
    // HELL'S STOMP: a red disc on the ground where you stand, then the foot
    stomp: { type: 'giantStomp', windup: 26, reach: 14, radius: 5, clearHeight: 2.4, damage: 2300, knockSpeed: 22, recovery: 30, poses: { wind: 'hg_stompW', strike: 'hg_stomp' } },
    // TAIL SWEEP: the body wrung round and the tail across the whole front: jump or fly over it
    sweep: { type: 'giantSweep', windup: 22, range: 11, half: 1.0, height: 3.2, damage: 1900, knockSpeed: 30, recovery: 28, poses: { wind: 'hg_sweepW', strike: 'hg_sweep' } },
    // CRUSHING GRIP: the claw closes round you; struggle out before it squeezes
    grab: { type: 'giantGrab', reach: 7, windup: 26, grabRadius: 2.4, grabHeight: 4.5, grabDamage: 300, holdFrames: 170, crushEvery: 34, crushDamage: 600, throwDamage: 1700, mashGain: 0.08, holdGain: 0.7, escapeDecay: 0.004, cpuEscape: 0.006, escapeStagger: 60, missRecovery: 36, recovery: 36, poses: { reach: 'hg_reach', hold: 'hg_hold', throw: 'hg_throw', miss: 'hg_winded' } },
  };
  C.hirudegarn = {
    id: 'hirudegarn', assetLevel: 1, name: 'Hirudegarn', fullName: 'Hirudegarn (movie)', era: 'Movie',
    playable: true, prototype: true, style: 'Monster · Giant',
    card: ['Movie', 'Wrath of the Dragon'],
    blurb: 'The phantom monster that ate Konats — two halves sealed in two brothers, joined again. It does not think; it destroys.',
    ratings: { power: 5, speed: 1, ki: 3, defense: 5 },
    stats: { hp: 48000, ki: 140, stamina: 240, speed: 0.85, power: 1.45, defense: 1.5, weight: 4, kiRegen: 2.6, chargeRate: 30, canonPower: 9 },
    poise: { max: 180, regen: 16, regenDelay: 110, armor: 3, cost: { 1: 4, 2: 8, 3: 14, 4: 24 }, beamMul: 1.2, breakFrames: 150, vulnerable: 1.3 },
    // a giant (2026-10-15 visual pass): the giant camera frames him (height over 2), he is hit on body parts like the Great
    // Ape, and he turns slowly: something quick can get behind him
    turnSpeed: 2.2,
    landing: { dust: 3, crack: 2, quake: 0.3 },
    // he fights on the ground, like the Great Ape: every giant technique is a ground technique, and a giant hovering over
    // a man-sized fighter hides both from the camera (his flame and the storm answer anyone who flies)
    flight: false,
    appearance: {
      height: 3.3, skin: HG_SKIN,
      build: { chestW: 0.3, chestD: 0.22, shoulderX: 0.31, waistW: 0.17, waistD: 0.15, upperArmR: 0.075, foreArmR: 0.07, fist: 0.09, thighR: 0.1, shinR: 0.085, headR: 0.1, neckR: 0.08, neckLen: 0.06, footLen: 1.25 },
      hair: { style: 'skullcap', color: HG_RED },
      headExtras: [
        // the two black horns out of the red crest, and the fangs of the open mouth
        { a: [0.36, 0.92, -0.1], d: [0.3, 1, -0.4], l: 0.26, r: 0.034, color: HG_BLACK, depth: 0.98, outline: 0.6 },
        { a: [-0.36, 0.92, -0.1], d: [-0.3, 1, -0.4], l: 0.26, r: 0.034, color: HG_BLACK, depth: 0.98, outline: 0.6 },
        { a: [0.3, -0.42, 0.86], d: [0, -1, 0.2], l: 0.045, r: 0.012, color: 0xf2ecd8, depth: 1.0, outline: 0.3 },
        { a: [-0.3, -0.42, 0.86], d: [0, -1, 0.2], l: 0.045, r: 0.012, color: 0xf2ecd8, depth: 1.0, outline: 0.3 },
      ],
      face: { pupil: 0xffd040, sclera: 0x2a2a1a, browThick: 1.8, brow: HG_DARK, noEars: true, jaw: 1.25, jawW: 1.15, mouthColor: 0x6a1020 },
      outfit: {
        topStyle: 'armor', top: HG_SHELL, arms: HG_LIMB, pants: HG_LIMB, pantsStyle: 'tight', legs: HG_SKIN, boots: HG_SHELL, bootStyle: 'saiyan', bootTip: HG_SKIN,
        armor: { plate: HG_SHELL, belly: HG_SKIN, pads: HG_SHELL, padStyle: 'wide', padScale: 1.6, trim: HG_DARK },
        wrist: HG_SKIN, wristLen: 0.16, legBands: HG_DARK,
        // the purple-grey limbs are segmented like an insect's (the board)
        ribs: { color: HG_LIMB, every: 0.2 },
        longTail: { color: HG_BLACK, segments: 12, length: 1.4, radius: 0.06, lift: 0.5, curl: 0.35 },
      },
      // the wing cases out of the shoulders and the glassy wings under them (the board shows both)
      wings: { style: 'beetle', len: 0.5, width: 0.2, color: HG_SHELL, edge: HG_BLACK, under: 0x7a6a9a, rib: 0x3a3050, membrane: 0xf4ecd0, lift: 0.18 },
      props: [
        // the two dark plates of the chest and the ridges down the belly
        { id: 'pecL', joint: 'chest', shape: 'ball', pos: [0.105, 0.17, 0.262], rot: [-0.25, 0.35, 0], size: [0.1, 0.075, 0.03], color: HG_DARK },
        { id: 'pecR', joint: 'chest', shape: 'ball', pos: [-0.105, 0.17, 0.262], rot: [-0.25, -0.35, 0], size: [0.1, 0.075, 0.03], color: HG_DARK },
        { id: 'rib1', joint: 'spine', shape: 'ball', pos: [0, 0.17, 0.195], size: [0.11, 0.012, 0.022], color: HG_DARK, outline: 0 },
        { id: 'rib2', joint: 'spine', shape: 'ball', pos: [0, 0.12, 0.186], size: [0.11, 0.012, 0.022], color: HG_DARK, outline: 0 },
        { id: 'rib3', joint: 'spine', shape: 'ball', pos: [0, 0.07, 0.178], size: [0.1, 0.012, 0.022], color: HG_DARK, outline: 0 },
        { id: 'rib4', joint: 'spine', shape: 'ball', pos: [0, 0.02, 0.17], size: [0.09, 0.012, 0.022], color: HG_DARK, outline: 0 },
        // talons on the hands and the feet, black spurs out of the elbows
        { id: 'clawL', joint: 'handL', shape: 'claws', pos: [0, -0.085, 0.012], rot: [Math.PI, 0, 0], count: 4, length: 0.13, radius: 0.02, spread: 0.08, hook: -0.5 },
        { id: 'clawR', joint: 'handR', shape: 'claws', pos: [0, -0.085, 0.012], rot: [Math.PI, 0, 0], count: 4, length: 0.13, radius: 0.02, spread: 0.08, hook: -0.5 },
        { id: 'toeL', joint: 'footL', shape: 'claws', pos: [0, -0.07, 0.2], rot: [Math.PI / 2, 0, 0], count: 3, length: 0.11, radius: 0.024, spread: 0.09, hook: 0.6 },
        { id: 'toeR', joint: 'footR', shape: 'claws', pos: [0, -0.07, 0.2], rot: [Math.PI / 2, 0, 0], count: 3, length: 0.11, radius: 0.024, spread: 0.09, hook: 0.6 },
        { id: 'spurL', joint: 'elbowL', shape: 'spike', pos: [0, 0.01, -0.06], rot: [-2.1, 0, 0], size: [0.03, 0.12, 0.6], color: HG_BLACK },
        { id: 'spurR', joint: 'elbowR', shape: 'spike', pos: [0, 0.01, -0.06], rot: [-2.1, 0, 0], size: [0.03, 0.12, 0.6], color: HG_BLACK },
      ],
      portraitColor: '#b8b03a',
    },
    hitZones: [
      { id: 'head', joint: 'head', offset: [0, 0.06, 0.03], r: 0.13, damageMul: 1.3 },
      { id: 'chest', joint: 'chest', offset: [0, 0.15, 0.02], r: 0.26, damageMul: 1 },
      { id: 'belly', joint: 'spine', offset: [0, 0.1, 0.03], r: 0.2, damageMul: 1.1 },
      // the wing cases are the hardest part of him
      { id: 'shell', joint: 'chest', offset: [0, 0.24, -0.24], r: 0.24, damageMul: 0.6 },
      { id: 'armL', joint: 'elbowL', offset: [0, -0.1, 0], r: 0.1, damageMul: 0.75 },
      { id: 'armR', joint: 'elbowR', offset: [0, -0.1, 0], r: 0.1, damageMul: 0.75 },
      { id: 'handL', joint: 'handL', offset: [0, -0.05, 0], r: 0.1, damageMul: 0.6 },
      { id: 'handR', joint: 'handR', offset: [0, -0.05, 0], r: 0.1, damageMul: 0.6 },
      { id: 'legL', joint: 'kneeL', offset: [0, -0.1, 0], r: 0.12, damageMul: 0.85 },
      { id: 'legR', joint: 'kneeR', offset: [0, -0.1, 0], r: 0.12, damageMul: 0.85 },
      { id: 'tail', joint: 'tail4', offset: [0, -0.05, 0], r: 0.09, damageMul: 1.15 },
    ],
    audio: { strikePitch: 0.6, heavyPitch: 0.55 },
    forms: [base({ color: 0xff8a2a, core: 0xffe0b0, particles: 0xffa04a })],
    poses: Object.assign({}, hgPoses, { idle: hgPoses.hg_idle }),
    moves: {
      // reach and radius are in his own size (x 3.3): about three and a half metres of claw
      light: [
        lt('hgSwipe', 'punchWindR', 'punchR', 900, { startup: 11, reach: 1.1, radius: 0.75, recovery: 18, cancel: 12, hitPose: 'hitSideL' }),
        lt('hgSwipe2', 'punchWindL', 'punchL', 920, { startup: 11, reach: 1.1, radius: 0.75, recovery: 18, cancel: 12, hitPose: 'hitSideR' }),
        lt('hgKick', 'kickWindR', 'kickR', 1100, { startup: 13, reach: 1, radius: 0.8, recovery: 20, hitstun: 30, knock: 'heavy', knockSpeed: 20, impact: 3 }),
      ],
      heavy: {
        0: hv('hgCrush', 'hammerWind', 'hammer', 2400, { startup: 18, recovery: 30, reach: 1.15, radius: 0.9, knock: 'smash', knockSpeed: 40, impact: 5, armor: true, guardCrush: true, guardDamage: 70 }),
      },
      dash: hv('hgCharge', 'hg_breathW', 'hg_breath', 1500, { startup: 10, active: 12, recovery: 24, reach: 1.05, radius: 0.85, lunge: 26, hitstun: 30, armor: true, hitPose: 'hitBody' }),
      throw: Object.assign({ technique: 'giantGrab', id: 'hgGrip', name: 'Crushing Grip' }, HG_T.grab),
    },
    specials: {
      // HELL'S FLAME: fire out of the mouth, a wide wave across the ground
      special1: {
        id: 'hgFlame', name: 'Hell\'s Flame', type: 'beam', kiCost: 30, icon: 'beam', fromHead: true,
        chargeMin: 28, chargeMax: 60, damage: [2200, 3400], radius: [1, 1.7], speed: 80, range: 120, sustain: 36,
        color: 0xff7a1a, core: 0xfff0a0, poses: { charge: 'hg_breathW', fire: 'hg_breath' }, recovery: 30,
      },
      // HELL'S STOMP: the red disc, then the foot
      special2: Object.assign({ id: 'hgStomp', name: 'Hell\'s Stomp', kiCost: 24, cooldown: 150, icon: 'down' }, HG_T.stomp),
      // HELL'S STORM: fire thrown into the sky, falling over everything in reach
      ultimate: {
        id: 'hgStorm', name: 'Hell\'s Storm', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 26, rise: 30, height: 14, count: 20, damage: 700, speed: 56, range: 70, recovery: 30,
        color: 0xff7a1a, poses: { wind: 'hg_breathW', throw: 'hg_breath' },
      },
    },
    // the skill wheel: the tail across the front, and the charge of claws
    extras: [
      Object.assign({ id: 'hgTail', name: 'Tail Sweep', kiCost: 0, cooldown: 100, icon: 'rush' }, HG_T.sweep),
      {
        id: 'hgClaw', name: 'Hell\'s Claw', type: 'rush', kiCost: 30, icon: 'rush', cooldown: 160,
        startup: 12, dashFrames: 24, speed: 46, armor: true, recovery: 28,
        poses: { wind: 'hg_breathW' },
        hits: [
          { pose: 'punchR', damage: 1000, frames: 14, sfx: 'punchHeavy' },
          { pose: 'punchL', damage: 1000, frames: 14, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 2000, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 },
        ],
      },
    ],
    mechanic: { type: 'boss', name: 'Phantom Monster', desc: 'A giant: hit on body parts (the wing cases shrug blows off, the head and belly do not), slow to turn, and every big move draws its danger on the ground first.' },
    boss: {
      phases: [
        { id: 'rampage', label: 'RAMPAGE', hpAbove: 0.5, speed: 1, damage: 1, patience: 0.8, patterns: { melee: 0.85, stomp: 0.8, sweep: 0.7, grab: 0.45, flame: 0.4 } },
        { id: 'wrath', label: 'WRATH', hpAbove: 0, speed: 1.12, damage: 1.08, patience: 0.5, patterns: { melee: 0.9, stomp: 1, sweep: 0.85, grab: 0.6, flame: 0.55, storm: 0.6 } },
      ],
      patterns: {
        stomp: { technique: 'stomp', maxDist: 16, maxAltitude: 2.2, cooldown: 260 },
        sweep: { technique: 'sweep', maxDist: 10, maxAltitude: 3, cooldown: 300 },
        grab: { technique: 'grab', maxDist: 7, maxAltitude: 4, cooldown: 480 },
        flame: { slot: 'special1', minDist: 7, hold: 50, cooldown: 420, ranged: true },
        storm: { slot: 'ultimate', minDist: 5, cooldown: 900 },
      },
      techniques: HG_T,
    },
    blast: { color: 0xff7a1a, core: 0xfff0a0, damage: 260, speed: 50, radius: 0.42 },
    ai: { personality: 'berserker', aggression: 0.75, defense: 0.2, ranged: 0.3, beam: 0.4, transformHp: 0, preferredRange: 4, hooks: 'boss' },
    intro: { pose: 'hg_breath', expression: 'shout' },
    victory: { poses: ['hg_breath'], expression: 'shout' },
    defeat: { pose: 'knockdown', expression: 'hurt' },
  };
})();
