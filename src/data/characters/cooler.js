/*
 * COOLER (movies: "Cooler's Revenge", "The Return of Cooler") — Frieza's elder brother. MOVIE continuity (era 'Movie'):
 * a Free Battle fighter, never placed in the canon chronology. Built 2026-10-14 from the owner's visual reference
 * (dbz visual reference.pdf p.66 and p.212) on the Frieza-race body, with his own colours, stance and kit:
 *
 *   FOURTH FORM (base): the species' smooth shape in HIS colours — white with deep violet domes on the head,
 *     shoulders, chest, forearms and shins; red eyes. Arms folded, contemptuous; the reference note asks for a
 *     "faster and more aggressive style than Frieza": quicker strings, a knee and a backhand of his own.
 *   FINAL FORM (the fifth, his own transformation): the body grows and the colours turn over — PURPLE muscle under
 *     WHITE plates (the crest, the shoulders, the chest, the forearms, the shins) set with blue gems, and a mask that
 *     closes over the mouth. He stops being elegant: claws, knees and both fists, armour on the heavy blows.
 *
 * Level 1 functional prototype on the shared procedural rig (Frieza's strike animations are reused where the body is
 * the same species; the stance, the knee, the backhand, the final form's brawling and the Supernova are his own).
 */
(function () {
  'use strict';
  const FZ = SL.data.characters.frieza;
  // ARMOR is one shade off the skin's white: the final form paints the skin purple and must not paint the plates
  const WHITE = 0xf4f2f8, ARMOR = 0xeeecf6, VIOLET = 0x4a2a8a, PURPLE = 0x6c3aae, GEM = 0x2a4ad8, RED = 0xd01818;
  // the shoulder domes: violet in the fourth form; in the final form they sink into the purple shoulder (the white guards
  // that rise behind the head take their place) — one shade off VIOLET so the swap can tell them apart
  const DOME = 0x4a2a8b;

  const poses = {
    // arms folded, chin up, floating a little: he has not decided you are worth the effort
    co_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return {
        root: { y: -0.01 + b * 0.008 }, hips: [0, -8, 0], spine: [-2, 0, 0], chest: [-6, 4, 0], head: [-10, -6, 0],
        shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0],
        thighL: [-4, 6, 10], kneeL: [6, 0, 0], thighR: [4, -6, -8], kneeR: [5, 0, 0], hands: ['fist', 'fist'],
      };
    },
    // the final form's stance: wide, low, arms open and heavy, fists closed
    co_finalIdle: (t) => {
      const b = Math.sin(t * 2.2);
      return {
        root: { y: -0.08 + b * 0.01 }, hips: [0, -10, 0], spine: [10, 0, 0], chest: [12 + b, -6, 0], head: [4, 6, 0],
        shoulderL: [-20, 0, 42], elbowL: [-70, 0, 0], shoulderR: [-18, 0, -40], elbowR: [-66, 0, 0],
        thighL: [-18, 12, 22], kneeL: [32, 0, 0], thighR: [14, -12, -22], kneeR: [26, 0, 0], hands: ['fist', 'fist'],
      };
    },
    co_backhandW: {
      root: { y: -0.02 }, hips: [0, 14, 0], spine: [0, 16, 0], chest: [0, 30, 0], head: [-6, -24, 0],
      shoulderR: [-60, 0, 44], elbowR: [-112, 0, 0], shoulderL: [-14, 0, 24], elbowL: [-60, 0, 0],
      thighL: [-12, 8, 12], kneeL: [16, 0, 0], thighR: [10, -8, -12], kneeR: [12, 0, 0], hands: ['open', 'open'],
    },
    co_backhand: {
      root: { y: -0.03, rx: 4 }, hips: [0, -16, 0], spine: [2, -20, 0], chest: [2, -34, 0], head: [-8, 26, 0],
      shoulderR: [-84, 0, -66], elbowR: [-10, 0, 0], handR: [0, 0, -20], shoulderL: [-20, 0, 30], elbowL: [-70, 0, 0],
      thighL: [-16, 10, 12], kneeL: [22, 0, 0], thighR: [12, -10, -12], kneeR: [14, 0, 0], hands: ['open', 'open'],
    },
    co_kneeW: {
      root: { y: 0.02, rx: -4 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-6, 0, 0],
      shoulderL: [-50, 0, 30], elbowL: [-80, 0, 0], shoulderR: [-50, 0, -30], elbowR: [-80, 0, 0],
      thighR: [-34, 0, -6], kneeR: [86, 0, 0], thighL: [6, 0, 8], kneeL: [10, 0, 0], hands: ['fist', 'fist'],
    },
    co_knee: {
      root: { y: 0.06, rx: 8 }, spine: [8, 0, 0], chest: [12, 0, 0], head: [6, 0, 0],
      shoulderL: [-10, 0, 40], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-60, 0, 0],
      thighR: [-104, 0, -6], kneeR: [104, 0, 0], footR: [20, 0, 0], thighL: [14, 0, 8], kneeL: [18, 0, 0], hands: ['fist', 'fist'],
    },
    // the final form's overhead claw
    co_clawW: {
      root: { y: -0.04, rx: -8 }, spine: [-8, -10, 0], chest: [-12, -16, 0], head: [-10, 14, 0],
      shoulderR: [-160, 0, -24], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-80, 0, 0],
      thighL: [-20, 12, 16], kneeL: [30, 0, 0], thighR: [14, -12, -16], kneeR: [24, 0, 0], hands: ['open', 'fist'],
    },
    co_claw: {
      root: { y: -0.12, rx: 16 }, spine: [16, 14, 0], chest: [20, 22, 0], head: [8, -16, 0],
      shoulderR: [-36, 0, -10], elbowR: [-20, 0, 0], handR: [30, 0, 0], shoulderL: [-24, 0, 34], elbowL: [-76, 0, 0],
      thighL: [-36, 12, 16], kneeL: [48, 0, 0], thighR: [22, -12, -16], kneeR: [20, 0, 0], hands: ['open', 'fist'],
    },
    // both fists overhead and down
    co_hammerW: {
      root: { y: 0.02, rx: -10 }, spine: [-12, 0, 0], chest: [-16, 0, 0], head: [-14, 0, 0],
      shoulderL: [-168, 0, 12], elbowL: [-34, 0, 0], shoulderR: [-168, 0, -12], elbowR: [-34, 0, 0],
      thighL: [-16, 0, 14], kneeL: [24, 0, 0], thighR: [-16, 0, -14], kneeR: [24, 0, 0], hands: ['fist', 'fist'],
    },
    co_hammer: {
      root: { y: -0.16, rx: 22 }, spine: [22, 0, 0], chest: [28, 0, 0], head: [10, 0, 0],
      shoulderL: [-56, 0, 10], elbowL: [-12, 0, 0], shoulderR: [-56, 0, -10], elbowR: [-12, 0, 0],
      thighL: [-40, 0, 16], kneeL: [56, 0, 0], thighR: [-36, 0, -16], kneeR: [52, 0, 0], hands: ['fist', 'fist'],
    },
    // the Supernova: one hand straight up, the sun on a fingertip; then thrown down
    co_novaW: (t) => {
      const s = Math.sin(t * 30) * 1.5;
      return {
        root: { y: 0 }, spine: [-6, 0, 0], chest: [-10 + s, 0, 0], head: [-26, 0, 0],
        shoulderR: [-176, 0, -8], elbowR: [-6, 0, 0], handR: [-20, 0, 0], shoulderL: [-14, 0, 26], elbowL: [-40, 0, 0],
        thighL: [-4, 0, 10], kneeL: [8, 0, 0], thighR: [-4, 0, -10], kneeR: [8, 0, 0], hands: ['fist', 'open'],
      };
    },
    co_nova: {
      root: { y: -0.04, rx: 10 }, spine: [8, 0, 0], chest: [12, 10, 0], head: [-4, -8, 0],
      shoulderR: [-104, 0, -12], elbowR: [-6, 0, 0], handR: [-10, 0, 0], shoulderL: [-14, 0, 30], elbowL: [-50, 0, 0],
      thighL: [-20, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'],
    },
  };

  // (2026-10-15 defects batch: flat-sided, six faces, as the board — they were round tubes)
  // the forearm and shin plates as real bands of plate (2026-10-15 visual pass: they were flat decals that read as spots):
  // violet in the fourth form; in the final form white, sized to its heavier limbs (look.muscle 1.3), with a blue gem on
  // each, a blade curving down off each forearm, the two great guards rising off the shoulders behind the head and a white
  // spike on the tail's tip (the board p.212)
  const FA = 0.046, SH = 0.06, M5 = 1.3;
  const plates = [];
  for (const [s, x] of [['L', 1], ['R', -1]]) {
    plates.push(
      { id: 'bracer4' + s, joint: 'elbow' + s, shape: 'cuff', pos: [0, -0.1, 0], radius: FA * 1.3, radiusBottom: FA * 1.2, length: 0.11, sides: 6, color: VIOLET, forms: ['base'] },
      { id: 'shin4' + s, joint: 'knee' + s, shape: 'cuff', pos: [0, -0.13, 0], radius: SH * 1.24, radiusBottom: SH * 1.14, length: 0.17, sides: 6, color: VIOLET, forms: ['base'] },
      { id: 'bracer5' + s, joint: 'elbow' + s, shape: 'cuff', pos: [0, -0.09, 0], radius: FA * M5 * 1.26, radiusBottom: FA * M5 * 1.16, length: 0.12, sides: 6, color: ARMOR, forms: ['final'] },
      { id: 'shin5' + s, joint: 'knee' + s, shape: 'cuff', pos: [0, -0.11, 0], radius: SH * M5 * 1.2, radiusBottom: SH * M5 * 1.1, length: 0.19, sides: 6, color: ARMOR, forms: ['final'] },
      { id: 'armGem' + s, joint: 'elbow' + s, shape: 'ball', pos: [x * FA * M5 * 1.24, -0.15, 0], size: [0.012, 0.026, 0.02], color: GEM, forms: ['final'], outline: 0.4 },
      { id: 'shinGem' + s, joint: 'knee' + s, shape: 'ball', pos: [0, -0.17, SH * M5 * 1.16], size: [0.024, 0.032, 0.012], color: GEM, forms: ['final'], outline: 0.4 },
      { id: 'blade' + s, joint: 'elbow' + s, shape: 'spike', pos: [x * FA * M5 * 1.2, -0.17, -0.01], rot: [0.2, 0, x * (Math.PI - 0.5)], size: [0.022, 0.13, 0.5], color: ARMOR, forms: ['final'] },
      { id: 'guard' + s, joint: 'chest', shape: 'arc', pos: [x * 0.12, 0.36, -0.08], rot: [0, s === 'L' ? 0 : Math.PI, -0.5], radius: 0.2, thick: 0.04, angle: 2.35, flat: 1.3, color: ARMOR, forms: ['final'] }
    );
  }
  plates.push({ id: 'tailTip', joint: 'tail7', shape: 'spike', pos: [0, -0.12, 0], rot: [Math.PI, 0, 0], size: [0.035, 0.14, 1], color: ARMOR, forms: ['final'] });

  const LIGHT = [
    { id: 'coJab', startup: 3, active: 2, recovery: 8, cancel: 5, damage: 760, reach: 1.35, radius: 0.78, lunge: 18, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
    { id: 'coBackhand', startup: 4, active: 3, recovery: 9, cancel: 6, damage: 840, reach: 1.4, radius: 0.85, lunge: 16, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'co_backhandW', strike: 'co_backhand' }, sfx: 'punchLight', hitPose: 'hitSideL' },
    { id: 'coKnee', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 1050, reach: 1.1, radius: 0.85, lunge: 20, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'co_kneeW', strike: 'co_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    { id: 'coTail', startup: 7, active: 4, recovery: 15, cancel: 9, damage: 1400, reach: 2.5, radius: 1.15, lunge: 14, hitstun: 26, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
  ];
  const FINAL_LIGHT = [
    { id: 'coClaw', startup: 6, active: 3, recovery: 12, cancel: 8, damage: 1250, reach: 1.5, radius: 1, lunge: 16, hitstun: 22, knock: 'flinch', impact: 2, pose: { wind: 'co_clawW', strike: 'co_claw' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    { id: 'coBackhand5', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 1150, reach: 1.45, radius: 0.95, lunge: 14, hitstun: 20, knock: 'flinch', impact: 2, pose: { wind: 'co_backhandW', strike: 'co_backhand' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
    { id: 'coKnee5', startup: 6, active: 3, recovery: 13, cancel: 8, damage: 1500, reach: 1.15, radius: 0.95, lunge: 18, hitstun: 26, knock: 'push', knockSpeed: 18, impact: 3, pose: { wind: 'co_kneeW', strike: 'co_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
  ];

  SL.data.characters.cooler = {
    id: 'cooler',
    assetLevel: 1,
    name: 'Cooler',
    fullName: 'Cooler (movie)',
    era: 'Movie',
    playable: true, // Free Battle once Frieza has fallen on Namek (unlocks.js); movie continuity, never in the story order
    prototype: true,
    style: 'Elder Brother · Movie',
    card: ['Movie', "Frieza's brother"],
    blurb: 'Frieza\'s elder brother, who thinks his little brother was soft. He has one more form than Frieza ever showed.',
    ratings: { power: 5, speed: 5, ki: 4, defense: 4 },
    stats: { hp: 30000, ki: 150, stamina: 170, speed: 1.28, power: 1.38, defense: 1.2, weight: 1.1, kiRegen: 4, chargeRate: 36, canonPower: 7 },
    poise: { max: 85, regen: 14, regenDelay: 110, armor: 2, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.1, breakFrames: 140, vulnerable: 1.2 },
    vfx: { ghost: 0xd8c8ff },
    appearance: {
      height: 0.8,
      skin: WHITE,
      build: { chestW: 0.19, chestD: 0.14, shoulderX: 0.195, waistW: 0.13, upperArmR: 0.05, foreArmR: 0.046, thighR: 0.078, shinR: 0.06, headR: 0.13 },
      hair: { style: 'frieza_shell', color: VIOLET },
      face: { pupil: RED, sclera: 0xffffff, brow: 0x2a1a3a, browThick: 0.7, noEars: true, eyeW: 1.05, eyeH: 0.82, eyeRim: 0x141014, eyeTilt: 0.2, mouthColor: 0x2a1030, mouthZ: 0.93, jaw: 1.08, jawW: 0.9, cheeks: 0.8 },
      // violet forearm and shin domes in the fourth form; white plates with blue gems in the final form
      props: plates,
      outfit: {
        topStyle: 'bare', top: WHITE, arms: WHITE, pants: WHITE, pantsStyle: 'tight', legs: WHITE,
        boots: WHITE, bootStyle: 'gi',
        // pecs: the plate is a shelf over the chest only (the ribs and belly below it are body)
        armor: { plate: VIOLET, belly: WHITE, pads: DOME, padStyle: 'down', pecs: true },
        longTail: { color: WHITE, segments: 8, length: 1.0, radius: 0.048, lift: 0.95, curl: 0.2 },
      },
      portraitColor: '#4a2a8a',
    },
    forms: [
      { id: 'base', name: 'Fourth Form', aura: { color: 0xb04aff, core: 0xf0d8ff, particles: 0xd0a0ff, speed: 1.5 }, mult: {} },
      {
        id: 'final',
        name: 'Final Form',
        short: 'FINAL FORM',
        kiCost: 50,
        style: 'full',
        aura: { color: 0xe03aff, core: 0xffe0ff, particles: 0xd890ff, speed: 1.9, idle: 0.3, sharp: 0.35 },
        // bigger and heavier: more damage and armour, a little less speed
        mult: { damage: 1.75, speed: 1.08, defense: 1.85, kiRegen: 1.3, chargeRate: 1.3, guardStamina: 1.2 },
        look: {
          scale: 1.28,
          bulk: 1.34,
          muscle: 1.3,
          // the colours turn over: purple skin, the violet domes become the white armour (look.swap)
          skin: PURPLE,
          swap: { [VIOLET]: ARMOR, [DOME]: PURPLE },
          pupil: RED,
          brow: 0x2a1a3a,
          headExtras: [
            // the crest: a tall white point and two swept horns, a blue gem in the forehead, the mask over the mouth
            { a: [0.22, 0.88, 0.3], d: [0.42, 1, -0.06], l: 0.3, r: 0.05, color: ARMOR, depth: 0.98, outline: 0.6 },
            { a: [-0.22, 0.88, 0.3], d: [-0.42, 1, -0.06], l: 0.3, r: 0.05, color: ARMOR, depth: 0.98, outline: 0.6 },
            { a: [0.68, 0.5, 0.3], d: [1, 0.22, 0.05], l: 0.2, r: 0.042, color: ARMOR, depth: 0.98, outline: 0.6 },
            { a: [-0.68, 0.5, 0.3], d: [-1, 0.22, 0.05], l: 0.2, r: 0.042, color: ARMOR, depth: 0.98, outline: 0.6 },
            { shape: 'ball', a: [0, 0.6, 0.82], d: [0, 0.2, 1], l: 0.012, r: 0.08, color: GEM, depth: 1.04, flat: 0.45, outline: 0.4 },
            { shape: 'ball', a: [0, -0.52, 0.86], d: [0, -0.1, 1], l: 0.02, r: 0.052, color: ARMOR, depth: 1.02, flat: 0.38, outline: 0.5 },
          ],
        },
        poses: { idle: poses.co_finalIdle },
        // the change: braced, the roar, the body growing — then the mask closes
        sequence: {
          length: 168,
          applyAt: 100,
          steps: [
            { at: 0, pose: 'fz_brace', speed: 6, expression: 'angry', aura: 0.4, shot: 'orbit', sfx: 'rumble', shake: 0.4 },
            { at: 46, pose: 'fz_roar', speed: 8, expression: 'shout', aura: 0.8, quake: 0.4, sfx: 'roar' },
            { at: 100, burst: true, sfx: 'transformBurst', flash: 0.4, crater: 4 },
            { at: 132, pose: 'co_finalIdle', speed: 4, expression: 'angry', shot: 'face' },
          ],
        },
        practiced: {
          length: 92,
          applyAt: 48,
          steps: [
            { at: 0, pose: 'fz_brace', speed: 9, expression: 'angry', aura: 0.3, shot: 'face', sfx: 'kiUp' },
            { at: 22, aura: 0.6, quake: 0.14, dust: 3 },
            { at: 48, burst: true, small: true, pose: 'fz_roar', speed: 12, expression: 'shout', flash: 0.25, crater: 2.5 },
            { at: 56, shot: 'pull' },
            { at: 76, pose: 'co_finalIdle', expression: 'angry' },
          ],
        },
        moves: {
          light: FINAL_LIGHT,
          heavy: {
            0: { id: 'coHammer', startup: 12, active: 5, recovery: 22, damage: 3000, reach: 1.6, radius: 1.3, lunge: 16, hitstun: 38, knock: 'smash', knockSpeed: 36, impact: 4, armor: true, guardCrush: true, guardDamage: 50, pose: { wind: 'co_hammerW', strike: 'co_hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            3: { id: 'coWhip5', startup: 11, active: 5, recovery: 22, damage: 2600, reach: 2.6, radius: 1.25, lunge: 14, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 4, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          },
          dash: { id: 'coCharge', startup: 6, active: 10, recovery: 18, damage: 1600, reach: 1.6, radius: 1.1, lunge: 44, hitstun: 30, knock: 'heavy', knockSpeed: 30, impact: 3, armor: true, pose: { wind: 'co_clawW', strike: 'co_claw' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        specials: {
          // DEATH FLASHER: a fan of red beams from both hands
          special1: {
            id: 'coFlasher', name: 'Death Flasher', type: 'projectile', kiCost: 36, icon: 'blast', cooldown: 150,
            startup: 16, recovery: 22, pose: { wind: 'fz_aimW', release: 'fz_aim' },
            projectile: { kind: 'blast', count: 5, spread: 0.7, speed: 88, radius: 0.3, damage: 900, homing: 0.08, color: 0xff3a5a, core: 0xffe8ee, explode: 2, knock: 'push', knockSpeed: 14, impact: 2, life: 2 },
          },
          // NOVA CRUSH: in through the guard, claw and knee, both fists down
          special2: {
            id: 'coCrush', name: 'Nova Crush', type: 'rush', kiCost: 40, icon: 'rush', cooldown: 150,
            startup: 10, dashFrames: 18, speed: 70, armor: true, recovery: 26,
            poses: { wind: 'co_clawW' },
            hits: [
              { pose: 'co_claw', damage: 1100, frames: 10, sfx: 'punchHeavy' },
              { pose: 'co_knee', damage: 1200, frames: 10, sfx: 'punchHeavy' },
              { pose: 'co_hammer', damage: 2400, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 },
            ],
          },
          // SUPERNOVA COOLER: the sun on his fingertip, bigger than the fourth form's
          ultimate: {
            id: 'coSupernova5', name: 'Supernova Cooler', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
            startup: 48, recovery: 44, pose: { wind: 'co_novaW', release: 'co_nova' },
            projectile: { kind: 'ball', speed: 34, radius: 2.8, damage: 6800, homing: 0.5, color: 0xffb020, core: 0xfff4d0, explode: 15, knock: 'smash', knockSpeed: 46, impact: 5, life: 4.5 },
          },
        },
        ai: { aggression: 0.9, defense: 0.5, ranged: 0.35, beam: 0.3, preferredRange: 2.2, rhythm: { burst: 5, rest: 30 } },
      },
    ],
    poses: Object.assign({}, FZ.poses, poses, { idle: poses.co_idle }),
    moves: {
      light: LIGHT,
      heavy: {
        0: { id: 'coSmash', startup: 9, active: 4, recovery: 18, damage: 2400, reach: 1.7, radius: 1, lunge: 26, hitstun: 34, knock: 'smash', knockSpeed: 36, impact: 4, pose: { wind: 'fz_kickW', strike: 'fz_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'coWhip', startup: 10, active: 5, recovery: 20, damage: 2600, reach: 2.6, radius: 1.25, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 4, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'coBlink', startup: 2, active: 6, recovery: 9, damage: 1200, reach: 1.5, radius: 0.9, lunge: 62, hitstun: 24, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'co_backhandW', strike: 'co_backhand' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'coToss', name: 'Tail Throw', damage: 1300, knockSpeed: 30, poses: ['grab', 'fz_tailW', 'fz_tail'] },
    },
    specials: {
      // DEATH BEAM: one finger, faster than his brother's
      special1: {
        id: 'coDeathBeam', name: 'Death Beam', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 110,
        startup: 14, aimLock: 7, recovery: 16, pose: { wind: 'fz_aimW', aim: 'fz_aim', release: 'fz_aim' },
        projectile: { kind: 'blast', speed: 88, radius: 0.28, damage: 1700, homing: 0.12, color: 0xb04aff, core: 0xf6e8ff, explode: 2, knock: 'heavy', knockSpeed: 22, impact: 3, life: 2.2, guardPierce: true },
      },
      // DEATH CHASER: gone, then beside you — the jab, the knee, the tail
      special2: {
        id: 'coChaser', name: 'Death Chaser', type: 'rush', kiCost: 34, icon: 'rush', cooldown: 120,
        startup: 6, dashFrames: 16, speed: 92, recovery: 22,
        poses: { wind: 'fz_jabW' },
        hits: [
          { pose: 'fz_jab', damage: 620, frames: 7, sfx: 'punchLight' },
          { pose: 'co_knee', damage: 760, frames: 9, sfx: 'punchHeavy' },
          { pose: 'fz_tail', damage: 1500, frames: 14, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 4 },
        ],
      },
      // SUPERNOVA: the sun on a fingertip, thrown down
      ultimate: {
        id: 'coSupernova', name: 'Supernova', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 54, recovery: 46, pose: { wind: 'co_novaW', release: 'co_nova' },
        projectile: { kind: 'ball', speed: 30, radius: 2.3, damage: 5600, homing: 0.5, color: 0xffc030, core: 0xfff4d0, explode: 13, knock: 'smash', knockSpeed: 44, impact: 5, life: 4.5 },
      },
    },
    blast: { color: 0xb04aff, core: 0xf6e8ff, damage: 230, speed: 60, radius: 0.32 },
    // aggressive and ranged by turns: he closes fast, punishes from mid range with the beam, never waits long
    ai: { personality: 'elite', aggression: 0.82, defense: 0.55, ranged: 0.5, beam: 0.35, transformHp: 0.5, preferredRange: 3.2, rhythm: { burst: 4, rest: 40 } },
    intro: { pose: 'co_idle', expression: 'smirk' },
    victory: { poses: ['co_idle'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };

  /* ======================================================================== METAL COOLER (movie: "The Return of Cooler") */
  // Cooler rebuilt by the Big Gete Star (visual reference p.67 / p.213–214): his final form's frame in polished metal —
  // a smooth helmet, red eyes, a closed mouth plate, round shoulder domes, wrist and knee rings, a segmented tail.
  // appearance.metal gives the metal its own shading (a reflected band and a hard highlight), not painted skin.
  // He does not tire and does not stop: Relentless Pursuit, self-repair (the regeneration mechanic) and armour.
  // the 2026-10-15 visual pass (the board p.213): teal-green plate over a dark purple-grey frame — the frame shows at the
  // face under the helmet's visor, the upper arms and the joints; the hands, feet, chest, belly and legs are plate
  const METAL = 0x46a898, METAL_DARK = 0x3e3456, METAL_JOINT = 0x5a4a8a;
  const mcPoses = {
    // upright and still — a machine waiting; only the eyes move
    mc_idle: {
      root: { y: -0.02 }, hips: [0, 0, 0], spine: [2, 0, 0], chest: [4, 0, 0], head: [2, 0, 0],
      shoulderL: [-8, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-8, 0, -20], elbowR: [-30, 0, 0],
      thighL: [-4, 4, 12], kneeL: [8, 0, 0], thighR: [-4, -4, -12], kneeR: [8, 0, 0], hands: ['fist', 'fist'],
    },
    mc_beamW: { root: { y: -0.04 }, spine: [-4, -10, 0], chest: [-6, -14, 0], head: [-4, 12, 0], shoulderR: [-70, 0, 36], elbowR: [-110, 0, 0], shoulderL: [-60, 0, 30], elbowL: [-110, 0, 0], thighL: [-16, 8, 14], kneeL: [22, 0, 0], thighR: [10, -8, -14], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    mc_beam: { root: { y: -0.06, rx: 6 }, spine: [4, 6, 0], chest: [6, 8, 0], head: [-4, -6, 0], shoulderR: [-90, 0, -8], elbowR: [-4, 0, 0], shoulderL: [-88, 0, 8], elbowL: [-4, 0, 0], thighL: [-22, 8, 14], kneeL: [30, 0, 0], thighR: [12, -8, -14], kneeR: [16, 0, 0], hands: ['open', 'open'] },
  };
  SL.data.characters.metal_cooler = {
    id: 'metal_cooler',
    assetLevel: 1,
    name: 'Metal Cooler',
    fullName: 'Metal Cooler (movie)',
    era: 'Movie',
    playable: true, // Free Battle (unlocks.js); movie continuity, never in the story order
    prototype: true,
    style: 'Machine · Relentless',
    card: ['Movie', 'The Big Gete Star'],
    blurb: 'Cooler, rebuilt in metal by a machine that learned from his death. It repairs itself, and it does not stop coming.',
    ratings: { power: 4, speed: 4, ki: 3, defense: 5 },
    stats: { hp: 34000, ki: 150, stamina: 220, speed: 1.24, power: 1.5, defense: 1.5, weight: 1.4, kiRegen: 4.4, chargeRate: 36, canonPower: 9 },
    poise: { max: 110, regen: 20, regenDelay: 80, armor: 2, cost: { 1: 5, 2: 9, 3: 14, 4: 24 }, beamMul: 1, breakFrames: 110, vulnerable: 1.15 },
    vfx: { ghost: 0xb8e8f0 },
    appearance: {
      height: 1.02,
      skin: METAL_DARK,
      metal: 0.85,
      // the plate and the jointed tail shine; the dark frame under them (face, upper arms, belly) does not (2026-10-15)
      metalOnly: [METAL, METAL_JOINT],
      build: { chestW: 0.215, chestD: 0.15, shoulderX: 0.21, waistW: 0.13, upperArmR: 0.062, foreArmR: 0.056, thighR: 0.088, shinR: 0.066, headR: 0.125 },
      hair: { style: 'frieza_shell', color: METAL },
      headExtras: [
        // the closed mouth plate, and the visor: the helmet's brim over the eyes, down to the temples
        { shape: 'ball', a: [0, -0.5, 0.86], d: [0, -0.1, 1], l: 0.02, r: 0.07, color: METAL, depth: 1.02, flat: 0.5, outline: 0.5 },
        // (2026-10-15: a thin band lying across the brow, flush with the helmet — a flat disc standing out read as a cap's bill)
        { shape: 'ball', a: [0, 0.3, 0.95], d: [0, 0.25, 1], l: 0.012, r: 0.1, color: METAL, depth: 0.97, flat: 0.28, outline: 0.6 },
      ],
      props: [
        // plate over the frame: cuffs on the forearms, caps on the knees
        { id: 'cuffL', joint: 'elbowL', shape: 'cuff', pos: [0, -0.04, 0], radius: 0.075, radiusBottom: 0.068, length: 0.17, color: METAL },
        { id: 'cuffR', joint: 'elbowR', shape: 'cuff', pos: [0, -0.04, 0], radius: 0.075, radiusBottom: 0.068, length: 0.17, color: METAL },
        { id: 'kneeCapL', joint: 'kneeL', shape: 'ball', pos: [0, 0, 0.07], size: [0.045, 0.045, 0.03], color: METAL },
        { id: 'kneeCapR', joint: 'kneeR', shape: 'ball', pos: [0, 0, 0.07], size: [0.045, 0.045, 0.03], color: METAL },
        // the board p.213: the belly is segmented — three pairs of plate over the dark frame, which shows between them
        // and down the sides
        ...[[0.15, 0.108], [0.1, 0.096], [0.05, 0.093]].flatMap(([y, z], i) => [1, -1].map((s) => (
          { id: 'abs' + i + (s > 0 ? 'L' : 'R'), joint: 'spine', shape: 'ball', pos: [s * 0.036, y, z], size: [0.031, 0.022, 0.014], color: METAL, outline: 0.4 }))),
      ],
      face: { pupil: 0xff2020, sclera: 0x1a1e28, brow: METAL_DARK, browThick: 0.5, noEars: true, eyeW: 1.0, eyeH: 0.7, eyeRim: 0x101018, eyeTilt: 0.24, mouthColor: METAL_DARK, mouthZ: 0.93, jaw: 1.06, jawW: 0.92 },
      outfit: {
        topStyle: 'bare', top: METAL, abs: METAL_DARK, arms: METAL_DARK, pants: METAL, pantsStyle: 'tight', legs: METAL, gloves: METAL,
        boots: METAL, bootStyle: 'gi', legBands: METAL_JOINT, shoulderPads: METAL,
        longTail: { color: METAL_JOINT, segments: 9, length: 1.05, radius: 0.05, lift: 0.9, curl: 0.25 },
      },
      portraitColor: '#4a5a72',
    },
    forms: [{ id: 'base', name: 'Metal Cooler', aura: { color: 0x8ad8ff, core: 0xeaf8ff, particles: 0xb8e8ff, speed: 1.6, sharp: 0.3 }, mult: {} }],
    poses: Object.assign({}, FZ.poses, poses, mcPoses, { idle: mcPoses.mc_idle }),
    moves: {
      light: [
        { id: 'mcJab', startup: 4, active: 2, recovery: 9, cancel: 6, damage: 900, reach: 1.35, radius: 0.8, lunge: 18, hitstun: 16, knock: 'flinch', impact: 1, pose: { wind: 'fz_jabW', strike: 'fz_jab' }, sfx: 'punchHeavy', hitPose: 'hitLight' },
        { id: 'mcBack', startup: 5, active: 3, recovery: 10, cancel: 7, damage: 980, reach: 1.4, radius: 0.85, lunge: 16, hitstun: 18, knock: 'flinch', impact: 2, pose: { wind: 'co_backhandW', strike: 'co_backhand' }, sfx: 'punchHeavy', hitPose: 'hitSideL' },
        { id: 'mcKnee', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 1150, reach: 1.1, radius: 0.85, lunge: 20, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'co_kneeW', strike: 'co_knee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'mcHammer', startup: 11, active: 5, recovery: 20, damage: 2600, reach: 1.6, radius: 1.2, lunge: 18, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 4, armor: true, guardCrush: true, guardDamage: 50, pose: { wind: 'co_hammerW', strike: 'co_hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        3: { id: 'mcTail', startup: 10, active: 5, recovery: 20, damage: 2400, reach: 2.6, radius: 1.25, lunge: 14, hitstun: 34, knock: 'smash', knockSpeed: 32, impact: 4, pose: { wind: 'fz_tailW', strike: 'fz_tail' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'mcCharge', startup: 4, active: 10, recovery: 14, damage: 1400, reach: 1.5, radius: 1, lunge: 60, hitstun: 26, knock: 'heavy', knockSpeed: 26, impact: 3, armor: true, pose: { wind: 'co_clawW', strike: 'co_claw' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'mcCrush', name: 'Crushing Grip', damage: 1500, knockSpeed: 28, poses: ['grab', 'co_hammerW', 'co_hammer'] },
    },
    specials: {
      // METAL DEATH BEAM: the finger, no tell in the face — there is no face
      special1: {
        id: 'mcBeam', name: 'Metal Death Beam', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 90,
        startup: 12, aimLock: 6, recovery: 14, pose: { wind: 'fz_aimW', aim: 'fz_aim', release: 'fz_aim' },
        projectile: { kind: 'blast', speed: 86, radius: 0.3, damage: 1800, homing: 0.12, color: 0x8ad8ff, core: 0xf0fbff, explode: 2, knock: 'heavy', knockSpeed: 22, impact: 3, life: 2.2, guardPierce: true },
      },
      // RELENTLESS PURSUIT: round and round you, striking from every side — the machine does not let go
      special2: {
        id: 'mcPursuit', name: 'Relentless Pursuit', type: 'speedOrbit', kiCost: 32, icon: 'rush', cooldown: 360,
        range: 30, frames: 150, radius: 4.4, interval: 18, damage: 560, speed: 34, recovery: 40, bounceStagger: 52,
        poses: { dash: 'co_clawW', strike: 'co_claw' },
      },
      // NOVA CANNON: both palms, a wave in the Big Gete Star's blue
      ultimate: {
        id: 'mcCannon', name: 'Nova Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 46, chargeMax: 46, damage: [5600, 5600], radius: [1.7, 1.7], speed: 100, range: 170, sustain: 48,
        color: 0x6ad0ff, core: 0xf0fbff, poses: { charge: 'mc_beamW', fire: 'mc_beam' }, recovery: 34,
      },
    },
    mechanic: { type: 'regeneration', name: 'Self-Repair', desc: 'After a few seconds without taking damage, the metal body repairs itself up to 60% health.', color: 0xc8f0ff },
    blast: { color: 0x8ad8ff, core: 0xf0fbff, damage: 240, speed: 62, radius: 0.32 },
    ai: { personality: 'aggressive', aggression: 0.9, defense: 0.35, ranged: 0.35, beam: 0.35, transformHp: 0, preferredRange: 2.2, rhythm: { burst: 6, rest: 20 } },
    intro: { pose: 'mc_idle', expression: 'neutral' },
    victory: { poses: ['mc_idle'], expression: 'neutral' },
    defeat: { pose: 'defeatKneel', expression: 'hurt' },
  };
})();
