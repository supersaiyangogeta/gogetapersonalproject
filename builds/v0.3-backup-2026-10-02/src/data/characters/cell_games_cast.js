/*
 * THE CELL GAMES' OTHER PEOPLE (2026-10-01): the TV reporter (Jimmy Firecracker) and his cameraman —
 * the only people besides the Z Fighters and the World Champion's party who came to the ring. They
 * broadcast the Games to a planet watching on television. Story-only, never fighters.
 * Level 1 functional prototypes.
 */
(function () {
  'use strict';
  const base = (o) =>
    Object.assign(
      {
        assetLevel: 1,
        era: 'Cell Saga',
        playable: false,
        prototype: true,
        storyOnly: true,
        style: 'Bystander',
        ratings: { power: 1, speed: 1, ki: 1, defense: 1 },
        stats: { hp: 600, ki: 20, stamina: 60, speed: 0.8, power: 0.2, defense: 0.5, weight: 0.85, kiRegen: 1, chargeRate: 8, canonPower: 0.0005 },
        vfx: { ghost: 0xd8e0e8 },
        audio: { strikePitch: 1.05, heavyPitch: 1 },
        flight: false,
        forms: [{ id: 'base', name: 'Base', aura: { color: 0xd8e0e8, core: 0xffffff }, mult: {} }],
        moves: { light: [], heavy: {} },
        specials: {},
        mechanic: null,
        ai: { personality: 'grunt', aggression: 0, defense: 0.9, ranged: 0, beam: 0, transformHp: 0, preferredRange: 14 },
        intro: { pose: 'idle', expression: 'calm' },
        victory: { poses: ['idle'], expression: 'calm' },
        defeat: { pose: 'knockdown', expression: 'ko' },
      },
      o
    );

  // the reporter: navy suit, white shirt, slicked-back hair, the microphone in his right hand
  SL.data.characters.jimmy = base({
    id: 'jimmy',
    name: 'Jimmy Firecracker',
    fullName: 'Jimmy Firecracker, TV reporter',
    blurb: 'Live from the Cell Games, for as long as the camera keeps working.',
    appearance: {
      height: 0.95,
      skin: 0xf0c49a,
      build: { chestW: 0.2, chestD: 0.145, shoulderX: 0.205, waistW: 0.16, upperArmR: 0.05, foreArmR: 0.044, fist: 0.048, thighR: 0.085, shinR: 0.066, headR: 0.142, neckLen: 0.05 },
      hair: { style: 'yamcha', color: 0x8a5a2a },
      face: { pupil: 0x1a1a1a, eyeW: 1 },
      outfit: {
        topStyle: 'jacket', top: 0xf2f0ea, jacket: { color: 0x2a3a6a, collar: 0x2a3a6a },
        sleeves: 'long', sleeveColor: 0x2a3a6a, wrist: 0xf2f0ea,
        pants: 0x2a3a6a, pantsStyle: 'slacks', belt: 0x1a1a1a, beltStyle: 'belt', buckle: 0xd8d0b0,
        boots: 0x2a1a12, bootStyle: 'shoe',
      },
      props: [{ id: 'mic', shape: 'bottle', joint: 'handR', pos: [0, 0.02, 0.03], rot: [-0.4, 0, 0], color: 0x2a2a30, cap: 0x101012, scale: 1.3 }],
      portraitColor: '#2a3a6a',
    },
    poses: { idle: SL.data.poses.stand },
  });

  // the cameraman: a cap, a work shirt, the camera on its tripod beside him (the stage builds the camera)
  SL.data.characters.tv_cameraman = base({
    id: 'tv_cameraman',
    name: 'Cameraman',
    fullName: 'TV cameraman',
    blurb: 'Points the camera where the light is, and hopes.',
    appearance: {
      height: 0.92,
      skin: 0xe8b88a,
      build: { chestW: 0.21, chestD: 0.155, shoulderX: 0.205, waistW: 0.175, upperArmR: 0.052, foreArmR: 0.046, fist: 0.048, thighR: 0.088, shinR: 0.068, headR: 0.142, neckLen: 0.05 },
      hair: { style: 'yamcha', color: 0x2a2018 },
      face: { pupil: 0x1a1a1a, eyeW: 1 },
      outfit: {
        topStyle: 'shirt', top: 0x8a7a5a, sleeves: 'short', sleeveColor: 0x8a7a5a,
        pants: 0x3a3a44, pantsStyle: 'slacks', belt: 0x2a2a2a, beltStyle: 'belt', buckle: 0xb0a890,
        boots: 0x3a2a1c, bootStyle: 'shoe',
      },
      portraitColor: '#8a7a5a',
    },
    poses: { idle: SL.data.poses.stand },
  });
})();
