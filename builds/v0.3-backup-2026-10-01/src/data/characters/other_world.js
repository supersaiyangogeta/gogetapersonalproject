/*
 * Other World cast for Chapter 2 ("Ten Times Gravity").
 * KING KAI — cutscene character (teacher). BUBBLES — King Kai's monkey,
 * a fleeing target in the gravity training. Neither is playable.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  SL.data.characters.king_kai = {
    id: 'king_kai',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'King Kai',
    playable: false,
    cinematicOnly: true,
    era: 'Saiyan Saga',
    stats: { hp: 99999, ki: 100, stamina: 100, speed: 1, power: 1, defense: 1, weight: 1.5, kiRegen: 1, chargeRate: 20, canonPower: 5 },
    appearance: {
      height: 0.66,
      skin: 0x3a6ad0,
      build: { chestW: 0.25, chestD: 0.2, waistW: 0.24, waistD: 0.22, pelvisW: 0.2, shoulderX: 0.24, upperArmR: 0.06, foreArmR: 0.056, thighR: 0.1, shinR: 0.08, headR: 0.15, upperArmLen: 0.22, foreArmLen: 0.2, thighLen: 0.3, shinLen: 0.28 },
      headExtras: [
        { a: [0.4, 0.9, 0.1], d: [0.55, 1, -0.2], l: 0.18, r: 0.012, color: 0x1a1a22, depth: 0.95, outline: 0.4 },
        { a: [-0.4, 0.9, 0.1], d: [-0.55, 1, -0.2], l: 0.18, r: 0.012, color: 0x1a1a22, depth: 0.95, outline: 0.4 },
      ],
      face: { pupil: 0x101010, brow: 0x3a6ad0 },
      outfit: {
        topStyle: 'gi', top: 0x22222e, sleeves: 'long', sleeveColor: 0x22222e, belt: 0xe8c84a,
        pants: 0x22222e, pantsStyle: 'gi', boots: 0x5a3a22, bootStyle: 'gi',
        shades: 0x0a0a10,
        emblem: { text: '界', fg: '#111111', bg: '#f4f0e0', center: 0.08, frontOnly: true },
      },
      portraitColor: '#3a6ad0',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: {
      idle: (t) => ({ ...C.armsCrossed, root: { y: Math.sin(t * 2) * 0.004 }, head: [-6, Math.sin(t * 0.7) * 8, 0] }),
      kk_point: {
        root: { y: 0 }, chest: [-4, 10, 0], head: [-6, -10, 0],
        shoulderR: [-100, 0, -10], elbowR: [-6, 0, 0], shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0],
        hands: ['fist', 'point'],
      },
      kk_laugh: { ...C.armsCrossed, chest: [-14, 0, 0], head: [-24, 0, 0] },
      kk_antennae: { root: { y: 0 }, chest: [-6, 0, 0], head: [-18, 0, 0], shoulderL: [-160, 0, 30], elbowL: [-120, 0, 0], shoulderR: [-160, 0, -30], elbowR: [-120, 0, 0], hands: ['point', 'point'] },
    },
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'idle', expression: 'smirk' },
  };

  SL.data.characters.bubbles = {
    id: 'bubbles',
    assetLevel: 1, // functional prototype (see SL.ASSET_LEVELS)
    name: 'Bubbles',
    playable: false,
    cinematicOnly: true,
    era: 'Saiyan Saga',
    stats: { hp: 99999, ki: 100, stamina: 999, speed: 1.2, power: 0.1, defense: 1, weight: 0.6, kiRegen: 1, chargeRate: 10, canonPower: 0.1 },
    appearance: {
      height: 0.62,
      skin: 0x7a4a2a,
      build: { chestW: 0.21, chestD: 0.17, waistW: 0.18, shoulderX: 0.2, upperArmR: 0.05, foreArmR: 0.046, upperArmLen: 0.3, foreArmLen: 0.28, thighR: 0.07, shinR: 0.055, thighLen: 0.3, shinLen: 0.28, headR: 0.15 },
      headExtras: [
        // round monkey ears
        { shape: 'ball', a: [1, 0.25, 0], d: [1, 0, 0], l: 0.035, r: 0.075, color: 0xd8a070, depth: 0.98, flat: 1, outline: 0.5 },
        { shape: 'ball', a: [-1, 0.25, 0], d: [-1, 0, 0], l: 0.035, r: 0.075, color: 0xd8a070, depth: 0.98, flat: 1, outline: 0.5 },
        // pale face mask and a protruding muzzle
        { shape: 'ball', a: [0, 0.1, 1], d: [0, 0, 1], l: 0.022, r: 0.115, color: 0xe0b080, depth: 0.8, flat: 1.05, outline: 0 },
        { shape: 'ball', a: [0, -0.45, 1], d: [0, 0.2, 1], l: 0.07, r: 0.09, color: 0xe0b080, depth: 0.86, flat: 0.8, outline: 0.5 },
      ],
      face: { pupil: 0x101010, noEars: true, brow: 0x5a3a1a, eyeW: 1.1 },
      outfit: { topStyle: 'bare', top: 0x7a4a2a, pants: 0x7a4a2a, pantsStyle: 'tight', boots: 0x7a4a2a, bootStyle: 'gi' },
      portraitColor: '#7a4a2a',
    },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    poses: {
      idle: (t) => {
        const s = Math.sin(t * 6);
        return { root: { y: -0.08 + Math.abs(s) * 0.03, rx: 16 }, spine: [10, 0, 0], head: [-18, s * 10, 0], shoulderL: [-30, 0, 30 + s * 10], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -30 - s * 10], elbowR: [-40, 0, 0], thighL: [-30, 20, 20], kneeL: [60, 0, 0], thighR: [-30, -20, -20], kneeR: [60, 0, 0] };
      },
      run: (t) => {
        const s = Math.sin(t * 16);
        return { root: { y: -0.05 + Math.abs(s) * 0.05, rx: 30 }, spine: [16, 0, 0], head: [-30, 0, 0], shoulderL: [s * 70 - 20, 0, 16], elbowL: [-20, 0, 0], shoulderR: [-s * 70 - 20, 0, -16], elbowR: [-20, 0, 0], thighL: [-s * 60 - 20, 0, 6], kneeL: [50, 0, 0], thighR: [s * 60 - 20, 0, -6], kneeR: [50, 0, 0] };
      },
      jump: C.jump,
      fall: C.jump,
    },
    moves: { light: [], heavy: {} },
    specials: {},
    intro: { pose: 'idle', expression: 'grin' },
  };
})();
