/*
 * GOTENKS (Buu Saga, Age 774) — Goten and Trunks, fused by the Metamoran Fusion Dance.
 *
 * Not Goten, not Trunks, and not the two of them stuck together: a new child with a new body
 * (a little bigger than either, the Metamoran vest with the padded gold shoulders, white trousers,
 * a blue sash), a new hairline (Trunks' parted fringe over Goten's spikes), and a new personality —
 * cocky, theatrical, ridiculous, and genuinely enormous in power. He names his attacks while he
 * does them, poses in the middle of a fight, and spits out ghosts of himself that explode.
 *
 *   Kit: flashy kid strings; "Continuous Die Die Missile Attack" (special 1, he jumps and rains
 *   blasts); "Grim Reaper of Justice" (special 2 — a pose: hit him out of it, or he hits harder for
 *   a while, the Recoome rule on a playable fighter); "Super Ghost Kamikaze Attack" (ultimate —
 *   ghosts of himself spat from his mouth that home in slowly and explode on contact).
 *   Forms: base → Super Saiyan → Super Saiyan 3 (story-locked until the Time Chamber; the mane,
 *   no eyebrows, and it drinks ki). SL.data.fusions.gotenks: parts goten + kid_trunks, the dance.
 *
 * The two FAILED fusions are here too, as story-only bodies: `gotenks_fat` (the dance with a finger
 * out of place) and `gotenks_thin` (the dance out of step). They cannot fight; they are the joke.
 *
 * The FUSION DANCE poses (fd_*) are shared (SL.data.poses): whoever dances — the boys, or Goku
 * showing them — wears the same steps, mirrored for the dancer on the other side.
 *
 * Level 1 functional prototypes.
 */
(function () {
  'use strict';
  const C = SL.data.poses;
  const M = (p) => SL.Anim.mirror(p);

  /* ---------------- the Fusion Dance (for the dancer whose partner is on his LEFT) ---------------- */
  // three paces apart, both arms out to the side away from the partner, palms open
  C.fd_out = {
    root: { y: -0.02 }, spine: [0, 0, -4], chest: [0, 0, -4], head: [0, 0, 6],
    shoulderR: [0, 0, -84], elbowR: [-6, 0, 0], shoulderL: [0, 22, -84], elbowL: [-18, 0, 0],
    thighL: [-2, 0, 10], kneeL: [4, 0, 0], thighR: [-2, 0, -10], kneeR: [4, 0, 0],
    hands: ['open', 'open'],
  };
  // the side-steps toward the partner (A: the inside foot out; B: the feet together again)
  C.fd_stepA = {
    root: { y: -0.05, rz: 4 }, spine: [0, 0, -6], chest: [0, 0, -4], head: [0, 0, 8],
    shoulderR: [0, 0, -80], elbowR: [-8, 0, 0], shoulderL: [0, 22, -80], elbowL: [-20, 0, 0],
    thighL: [-8, 0, 34], kneeL: [18, 0, 0], thighR: [-4, 0, -6], kneeR: [10, 0, 0],
    hands: ['open', 'open'],
  };
  C.fd_stepB = {
    root: { y: -0.03 }, spine: [0, 0, -4], chest: [0, 0, -4], head: [0, 0, 6],
    shoulderR: [0, 0, -86], elbowR: [-6, 0, 0], shoulderL: [0, 22, -86], elbowL: [-18, 0, 0],
    thighL: [-4, 0, 6], kneeL: [8, 0, 0], thighR: [-4, 0, -4], kneeR: [8, 0, 0],
    hands: ['open', 'open'],
  };
  // "FUUU—": the arms swing up and over the head toward the partner, the outside knee lifts
  C.fd_fu = {
    root: { y: 0, rz: 6 }, spine: [-4, 0, 6], chest: [-6, 0, 8], head: [-8, 0, 4],
    shoulderR: [0, 0, -168], elbowR: [-14, 0, 0], shoulderL: [0, 0, 150], elbowL: [-14, 0, 0],
    thighR: [-58, 0, -12], kneeR: [84, 0, 0], thighL: [-4, 0, 8], kneeL: [8, 0, 0],
    hands: ['open', 'open'],
  };
  // "—SION": the sweep brings both arms down and out toward the partner, leaning in
  C.fd_sion = {
    root: { y: -0.06, rz: 10 }, spine: [4, 0, 10], chest: [2, 0, 10], head: [0, 0, -6],
    shoulderL: [0, 0, 84], elbowL: [-6, 0, 0], shoulderR: [0, -22, 84], elbowR: [-18, 0, 0],
    thighL: [-44, 0, 20], kneeL: [64, 0, 0], thighR: [-2, 0, -14], kneeR: [6, 0, 0],
    hands: ['open', 'open'],
  };
  // "HA!": bent toward the partner on the inside leg, the outside leg stretched away, both arms
  // out toward him — the index fingers meeting his
  C.fd_ha = {
    root: { y: -0.12, rz: 18 }, spine: [6, 0, 14], chest: [4, 0, 12], head: [-4, 0, -10],
    shoulderL: [-14, 0, 92], elbowL: [-2, 0, 0], shoulderR: [-10, -30, 96], elbowR: [-10, 0, 0],
    thighL: [-26, 0, 22], kneeL: [52, 0, 0], thighR: [0, 0, -32], kneeR: [2, 0, 0],
    hands: ['point', 'point'],
  };
  // the same steps for the dancer on the other side (his partner on his RIGHT)
  for (const k of ['fd_out', 'fd_stepA', 'fd_stepB', 'fd_fu', 'fd_sion', 'fd_ha']) C[k + 'R'] = M(C[k]);

  /* ---------------- Gotenks' own body language ---------------- */
  const kid = SL.data.kidPoses('gk');
  const poses = Object.assign({}, kid, {
    // cocky: side-on, weight back, one fist loose in front, the other hand on his hip, chin up
    gk_idle: (t) => {
      const b = Math.sin(t * 3);
      return {
        root: { y: -0.05 + b * 0.012 },
        hips: [0, -22, 6], spine: [2, 6, -4], chest: [-4, 14, -4], head: [-14, -12, 6],
        shoulderL: [-66, 0, 16], elbowL: [-104, 0, 0], shoulderR: [8, 0, -44], elbowR: [-10, 0, 104],
        thighL: [-24, 14, 14], kneeL: [28 + b * 3, 0, 0], thighR: [16, -12, -14], kneeR: [22 + b * 3, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // THE GRIM REAPER OF JUSTICE: one finger to the sky, a fist at the hip, a knee up — and he holds it
    gk_pose: (t) => {
      const b = Math.sin(t * 5);
      return {
        root: { y: 0.02 + Math.abs(b) * 0.01, rz: -6 }, spine: [-6, 0, 4], chest: [-10, 10, 4], head: [-18, -10, 0],
        shoulderR: [-172, 0, -18], elbowR: [-6, 0, 0], shoulderL: [8, 0, 44], elbowL: [-10, 0, -104],
        thighL: [-78, 0, 12], kneeL: [96, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0],
        hands: ['fist', 'point'],
      };
    },
    // cheeks puffed, hands cupped at the mouth: the ghosts coming
    gk_ghostW: {
      root: { y: -0.04, rx: -6 }, spine: [-8, 0, 0], chest: [-12, 0, 0], head: [-14, 0, 0],
      shoulderL: [-110, 0, -24], elbowL: [-120, 0, 0], shoulderR: [-110, 0, 24], elbowR: [-120, 0, 0],
      thighL: [-12, 0, 14], kneeL: [22, 0, 0], thighR: [8, 0, -14], kneeR: [16, 0, 0],
      hands: ['open', 'open'],
    },
    gk_ghost: {
      root: { y: -0.06, rx: 12 }, spine: [10, 0, 0], chest: [14, 0, 0], head: [6, 0, 0],
      shoulderL: [-60, 0, 40], elbowL: [-30, 0, 0], shoulderR: [-60, 0, -40], elbowR: [-30, 0, 0],
      thighL: [-24, 0, 14], kneeL: [30, 0, 0], thighR: [14, 0, -14], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    },
    gk_missileW: { ...C.blastWind },
    gk_missile: { ...C.blastR },
    // the entrance: both arms out, one leg kicked up — "Gotenks!"
    gk_intro: (t) => {
      const b = Math.sin(t * 4);
      return {
        root: { y: 0.01 + Math.max(0, b) * 0.02 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-16, 0, 0],
        shoulderL: [-20, 0, 120], elbowL: [-8, 0, 0], shoulderR: [-20, 0, -120], elbowR: [-8, 0, 0],
        thighR: [-70, 0, -18], kneeR: [30, 0, 0], thighL: [-2, 0, 8], kneeL: [6, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the fusion running out while he is showing off: arms still up, face falling
    gk_uhoh: {
      root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-4, 12, 0],
      shoulderR: [-150, 0, -20], elbowR: [-40, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-60, 0, 0],
      thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [-6, 0, -10], kneeR: [10, 0, 0],
      hands: ['open', 'open'],
    },
  });

  const BUILD = { chestW: 0.168, chestD: 0.122, shoulderX: 0.16, waistW: 0.132, upperArmR: 0.046, foreArmR: 0.039, fist: 0.045, thighR: 0.075, shinR: 0.058, headR: 0.138, neckLen: 0.04 };
  const OUTFIT = {
    // the Metamoran vest: open, dark teal, gold padded shoulders with a gold edge; bare arms
    topStyle: 'bare', top: 0xf6cda6,
    jacket: { color: 0x2f6f78, open: 1.25, collar: 0xe8b830 },
    shoulderPads: 0xe8b830,
    arms: 0xf6cda6, wrist: 0x1f2a4a,
    belt: 0x2a4aa0, beltStyle: 'sash',
    pants: 0xf2f0e8, pantsStyle: 'gi',
    boots: 0x1c1c22, bootStyle: 'gi',
  };

  SL.data.characters.gotenks = {
    id: 'gotenks',
    assetLevel: 1,
    name: 'Gotenks',
    fullName: 'Gotenks (Goten + Trunks, Fusion Dance)',
    era: 'Buu Saga',
    playable: true,
    prototype: true,
    style: 'Fusion Showoff',
    blurb: 'Two eight-year-olds danced a silly dance and became the most arrogant fighter on Earth. He is also, unfortunately, as strong as he says.',
    ratings: { power: 5, speed: 5, ki: 4, defense: 3 },
    stats: { hp: 15000, ki: 130, stamina: 130, speed: 1.22, power: 1.08, defense: 0.92, weight: 0.72, kiRegen: 3, chargeRate: 36, canonPower: 3.2 },
    appearance: {
      height: 0.68,
      skin: 0xf6cda6,
      build: BUILD,
      hair: { style: 'gotenks', color: 0x2a1c3c },
      face: { pupil: 0x1a2a5a, eyeW: 1.1, brow: 0x2a1c3c },
      outfit: OUTFIT,
      portraitColor: '#2f6f78',
    },
    vfx: { ghost: 0xd8f4ff },
    audio: { strikePitch: 1.28, heavyPitch: 1.18 },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xd8f4ff }, mult: {} },
      {
        id: 'ssj', name: 'Super Saiyan', short: 'SUPER SAIYAN', kiCost: 40, style: 'full',
        mult: { damage: 1.7, speed: 1.18, defense: 1.28, kiRegen: 2, chargeRate: 1.3, guardStamina: 0.85 },
        aura: { color: 0xffc81e, core: 0xfff4b0, particles: 0xffe060, idle: 0.45, speed: 1.35, sharp: 0.3, sparks: 0xfff3a0 },
        look: { hair: { style: 'gotenks_ssj', color: 0xffd33a }, pupil: 0x18b89a, brow: 0xe8b830, bulk: 1.03 },
        ghost: 0xffe27a,
        music: 4,
        sequence: {
          length: 90,
          applyAt: 50,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 9, expression: 'grin', aura: 0.4, auraColor: 0xffffff, mood: [0.2, 0x141026, 0.6], shot: 'orbit', music: 0, sfx: 'kiUp' },
            { at: 50, burst: true, pose: 'powerUp', speed: 16, expression: 'shout', sfx: 'transformBurst', mood: [0.15, 0x2a2410, 0.3], flash: 0.75, crater: 3 },
            { at: 68, pose: 'gk_pose', speed: 6, expression: 'grin', shot: 'face', mood: [0, 0x000000, 1] },
          ],
        },
      },
      {
        // SUPER SAIYAN 3: the mane, no eyebrows, the biggest power a child has ever had — and it
        // drinks his ki. Handed over by the Time Chamber (not built yet), so it stays locked in
        // the story and in Free Battle until then.
        id: 'ssj3', name: 'Super Saiyan 3', short: 'SUPER SAIYAN 3', kiCost: 100, style: 'full',
        freeUnlock: 'buu_timechamber',
        mult: { damage: 2.3, speed: 1.34, defense: 1.5, kiRegen: 0, chargeRate: 1.15, guardStamina: 0.8 },
        drain: { kiPerSec: 4.5 },
        aura: { color: 0xffd23a, core: 0xffffff, particles: 0xfff0a0, idle: 0.75, speed: 1.9, sharp: 0.7, sparks: 0xbfe4ff, lightning: true },
        look: { hair: { style: 'gotenks_ssj3', color: 0xffd23a }, pupil: 0x14b0a0, brow: 0xf6cda6, bulk: 1.06 },
        ghost: 0xfff0a0,
        music: 6,
      },
    ],
    poses: Object.assign({ idle: poses.gk_idle }, poses),
    moves: {
      light: [
        { id: 'gkJab', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 360, reach: 1.0, radius: 0.68, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'gk_jabW', strike: 'gk_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gkHook', startup: 3, active: 3, recovery: 10, cancel: 5, damage: 380, reach: 1.0, radius: 0.68, lunge: 13, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'gk_spinW', strike: 'gk_spin' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'gkKick', startup: 5, active: 4, recovery: 12, cancel: 7, damage: 520, reach: 1.25, radius: 0.78, lunge: 14, hitstun: 22, knock: 'push', knockSpeed: 11, impact: 2, pose: { wind: 'gk_kickW', strike: 'gk_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        // "Rolling Thunder Punch": a spinning windmill of fists
        0: { id: 'gkThunder', name: 'Rolling Thunder Punch', startup: 11, active: 6, recovery: 20, damage: 1300, reach: 1.3, radius: 0.95, lunge: 18, hitstun: 32, knock: 'smash', knockSpeed: 28, impact: 3, guardCrush: true, guardDamage: 40, pose: { wind: 'gk_spinW', strike: 'gk_spin' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'gkRise', startup: 8, active: 4, recovery: 16, damage: 820, reach: 1.1, radius: 0.85, lunge: 12, hitstun: 28, knock: 'launch', knockSpeed: 20, impact: 2, pose: { wind: 'gk_jabW', strike: 'gk_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      },
      dash: { id: 'gkDash', startup: 4, active: 7, recovery: 15, damage: 820, reach: 1.2, radius: 0.85, lunge: 34, hitstun: 26, knock: 'heavy', knockSpeed: 22, impact: 2, pose: { wind: 'gk_jabW', strike: 'gk_jab' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'gkToss', name: 'Justice Toss', damage: 700, knockSpeed: 24, poses: ['grab', 'gk_spinW', 'gk_spin'] },
    },
    specials: {
      // he jumps, and it rains
      special1: {
        id: 'gkMissile', name: 'Continuous Die Die Missile Attack', type: 'scatter', kiCost: 30, icon: 'blast',
        windup: 18, rise: 24, height: 9, count: 12, damage: 440, speed: 58, range: 56, recovery: 24,
        color: 0xffd060, poses: { wind: 'gk_missileW', fire: 'gk_missile' },
      },
      // the pose: interrupt it and it is wasted; let him finish and he hits harder for a while
      special2: {
        id: 'gkReaper', name: 'Grim Reaper of Justice', type: 'bossPose', kiCost: 12, icon: 'transform', cooldown: 300,
        frames: 54, breakDamage: 600, breakStagger: 46, damageBuff: 1.3, buffFrames: 420,
        poses: { pose: 'gk_pose' },
      },
      // ghosts of himself, spat out, slow, homing — and they explode on whatever they touch
      ultimate: {
        id: 'gkGhosts', name: 'Super Ghost Kamikaze Attack', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 30, recovery: 30, fromHead: true, pose: { wind: 'gk_ghostW', release: 'gk_ghost' },
        projectile: { kind: 'ghost', count: 4, spread: 0.55, speed: 18, radius: 0.58, damage: 1400, homing: 1.4, color: 0xd8f4ff, core: 0xffffff, explode: 3.2, knock: 'heavy', knockSpeed: 22, impact: 3, life: 6 },
      },
    },
    mechanic: { type: 'saiyanInstinct', name: 'Two Saiyans\' Instincts', desc: 'He copies what hits him, twice as fast as either boy alone: blocking, vanishing and taking punishment sharpen his next strikes.' },
    ai: { personality: 'aggressive', aggression: 0.85, defense: 0.35, ranged: 0.45, beam: 0.2, transformHp: 0.7, preferredRange: 2.2 },
    barks: {},
    intro: { pose: 'gk_intro', expression: 'grin' },
    victory: { poses: ['gk_pose'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };

  /* ---------------- the failed fusions (story only) ---------------- */
  const fatPoses = {
    // too heavy to stand up straight, wheezing
    gkf_idle: (t) => {
      const b = Math.sin(t * 7);
      return {
        root: { y: -0.06 + Math.abs(b) * 0.01 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
        shoulderL: [-10, 0, 40], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-20, 0, 0],
        thighL: [-6, 0, 22], kneeL: [14, 0, 0], thighR: [-6, 0, -22], kneeR: [14, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };
  SL.data.characters.gotenks_fat = {
    id: 'gotenks_fat', assetLevel: 1, name: 'Gotenks?', fullName: 'Gotenks (failed fusion: out of shape)', era: 'Buu Saga',
    playable: false, prototype: true, style: 'Failed Fusion', blurb: 'One finger out of place.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 4000, ki: 20, stamina: 30, speed: 0.5, power: 0.2, defense: 0.5, weight: 1.6, kiRegen: 0.5, chargeRate: 10, canonPower: 0.1 },
    flight: false,
    appearance: {
      height: 0.66, skin: 0xf6cda6,
      build: Object.assign({}, BUILD, { chestW: 0.25, chestD: 0.22, waistW: 0.3, waistD: 0.27, pelvisW: 0.27, pelvisD: 0.25, thighR: 0.11, shinR: 0.08, upperArmR: 0.066, foreArmR: 0.056, headR: 0.162, neckLen: 0.018 }),
      hair: { style: 'gotenks', color: 0x2a1c3c },
      face: { pupil: 0x1a2a5a, eyeW: 0.8, brow: 0x2a1c3c },
      outfit: Object.assign({}, OUTFIT, { belly: true }),
      portraitColor: '#2f6f78',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: fatPoses.gkf_idle }, fatPoses),
    moves: { light: [{ id: 'gkfSlap', startup: 12, active: 3, recovery: 24, damage: 20, reach: 0.8, radius: 0.6, lunge: 4, hitstun: 8, knock: 'flinch', impact: 1, pose: { wind: 'gkf_idle', strike: 'gkf_idle' }, sfx: 'punchLight', hitPose: 'hitLight' }], heavy: {}, dash: { id: 'gkfWaddle', startup: 14, active: 4, recovery: 24, damage: 20, reach: 0.8, radius: 0.6, lunge: 6, hitstun: 8, knock: 'flinch', impact: 1, pose: { wind: 'gkf_idle', strike: 'gkf_idle' }, sfx: 'punchLight', hitPose: 'hitLight' } },
    specials: {}, mechanic: null,
    ai: { personality: 'grunt', aggression: 0.05, defense: 0.1, ranged: 0, beam: 0, transformHp: 0, preferredRange: 8 },
    intro: { pose: 'gkf_idle', expression: 'hurt' }, victory: { poses: ['gkf_idle'], expression: 'hurt' }, defeat: { pose: 'knockdown', expression: 'ko' },
  };

  const thinPoses = {
    // bent double, shaking, older than his grandfather
    gkt_idle: (t) => {
      const s = Math.sin(t * 18) * 1.5;
      return {
        root: { y: -0.1, rx: 20 }, spine: [22, 0, s], chest: [18, 0, 0], head: [-26, 0, 0],
        shoulderL: [-40, 0, 12], elbowL: [-60, 0, 0], shoulderR: [-36, 0, -12], elbowR: [-66, 0, 0],
        thighL: [-18, 0, 8], kneeL: [34, 0, 0], thighR: [-14, 0, -8], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };
  SL.data.characters.gotenks_thin = {
    id: 'gotenks_thin', assetLevel: 1, name: 'Gotenks?', fullName: 'Gotenks (failed fusion: out of step)', era: 'Buu Saga',
    playable: false, prototype: true, style: 'Failed Fusion', blurb: 'A beat behind, and eighty years older for it.',
    ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
    stats: { hp: 3000, ki: 20, stamina: 20, speed: 0.4, power: 0.1, defense: 0.3, weight: 0.5, kiRegen: 0.3, chargeRate: 8, canonPower: 0.05 },
    flight: false,
    appearance: {
      height: 0.72, skin: 0xe8c8a8,
      build: Object.assign({}, BUILD, { chestW: 0.13, waistW: 0.1, upperArmR: 0.03, foreArmR: 0.026, thighR: 0.05, shinR: 0.04, headR: 0.13 }),
      hair: { style: 'gotenks', color: 0xd8d4d0 },
      face: { pupil: 0x1a2a5a, eyeW: 0.8, brow: 0xd8d4d0 },
      outfit: OUTFIT,
      portraitColor: '#2f6f78',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff }, mult: {} }],
    poses: Object.assign({ idle: thinPoses.gkt_idle }, thinPoses),
    moves: { light: [{ id: 'gktPoke', startup: 14, active: 3, recovery: 26, damage: 10, reach: 0.8, radius: 0.5, lunge: 3, hitstun: 6, knock: 'flinch', impact: 1, pose: { wind: 'gkt_idle', strike: 'gkt_idle' }, sfx: 'punchLight', hitPose: 'hitLight' }], heavy: {}, dash: { id: 'gktShuffle', startup: 16, active: 4, recovery: 28, damage: 10, reach: 0.8, radius: 0.5, lunge: 4, hitstun: 6, knock: 'flinch', impact: 1, pose: { wind: 'gkt_idle', strike: 'gkt_idle' }, sfx: 'punchLight', hitPose: 'hitLight' } },
    specials: {}, mechanic: null,
    ai: { personality: 'grunt', aggression: 0.02, defense: 0.1, ranged: 0, beam: 0, transformHp: 0, preferredRange: 8 },
    intro: { pose: 'gkt_idle', expression: 'hurt' }, victory: { poses: ['gkt_idle'], expression: 'hurt' }, defeat: { pose: 'knockdown', expression: 'ko' },
  };

  // what fuses into what, and how
  SL.data.fusions = SL.data.fusions || {};
  SL.data.fusions.gotenks = { parts: ['goten', 'kid_trunks'], method: 'dance', seconds: 0, failures: { finger: 'gotenks_fat', timing: 'gotenks_thin' } };
})();
