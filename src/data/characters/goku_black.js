/*
 * GOKU BLACK (Dragon Ball Super, the Future Trunks arc) — Zamasu in Goku's body. FUTURE TIMELINE continuity: a Free
 * Battle fighter, never placed in the canon story order. Built 2026-10-15 from the owner's visual reference
 * (dbz visual reference.pdf p.233): Goku's body and hair, his own face — narrower eyes, a sneer — and his own
 * clothes: a grey gi top over a black turtleneck with long sleeves, a red sash, black baggy trousers, white boots,
 * and one green Potara earring in the left ear.
 *
 *   BASE: Goku's martial arts made cruel — knife-hands instead of fists, and a blade of ki out of the open hand.
 *   SUPER SAIYAN ROSE: the Super Saiyan shape in pink, grey eyes, a pink aura; the beam turns rose and the blade
 *     comes out in long sweeps (the Sickle of Sorrow).
 *
 * Level 1 functional prototype on the shared procedural rig (Goku's strike animations, his own stance and blade work).
 */
(function () {
  'use strict';
  const GK = SL.data.characters.goku;
  const SKIN = 0xf6c49a, GREY = 0x5c5c62, BLACK = 0x17171b, SASH = 0xc81e2a, WHITE = 0xf2f0ea, POTARA = 0xe2b440, ROSE = 0xf27ab8;

  const poses = {
    // upright, weight back, one hand loose and open in front of him, the other at his side: a god looking at a mortal
    gb_idle: (t) => {
      const b = Math.sin(t * 1.5);
      return {
        root: { y: b * 0.004 }, hips: [0, 6, 0], spine: [-4, 0, 0], chest: [-6 + b * 0.6, 6, 0], head: [-8, -8, 0],
        shoulderR: [-40, 0, -14], elbowR: [-70, 0, 0], handR: [0, 0, -20], shoulderL: [-4, 0, 12], elbowL: [-14, 0, 0],
        thighL: [-2, 6, 8], kneeL: [4, 0, 0], thighR: [4, -6, -8], kneeR: [6, 0, 0], hands: ['open', 'open'],
      };
    },
    // the hand study (Roadmap Three, the owner's Gemini research, BLK-S02): the stolen right hand raised before his face,
    // slowly closing into a fist and opening again, his head tipped to look at it — marvelling at a Saiyan body
    // the left hand up to the Potara in his left ear, the head tilted to it: setting the earring straight (BLK-S01)
    gb_earTouch: {
      root: { y: 0 }, hips: [0, 6, 0], spine: [-4, 0, 0], chest: [-6, 4, 0], head: [-6, -6, -14],
      shoulderL: [-70, -45, 60], elbowL: [-130, 0, 0], handL: [0, 20, 80], shoulderR: [-40, 0, -14], elbowR: [-70, 0, 0], handR: [0, 0, -20],
      thighL: [-2, 6, 8], kneeL: [4, 0, 0], thighR: [4, -6, -8], kneeR: [6, 0, 0], hands: ['open', 'open'],
    },
    gb_handStudy: (t) => {
      const shut = Math.sin(t * 2.2) > 0;
      return {
        root: { y: 0 }, hips: [0, 4, 0], spine: [-2, 4, 0], chest: [-2, 6, 0], head: [12, -14, 0],
        shoulderR: [-62, 10, -26], elbowR: [-118, 0, 0], handR: [-10, 0, -20], shoulderL: [-4, 0, 12], elbowL: [-14, 0, 0],
        thighL: [-2, 6, 8], kneeL: [4, 0, 0], thighR: [4, -6, -8], kneeR: [6, 0, 0], hands: ['open', shut ? 'fist' : 'open'],
      };
    },
    // the knife-hand: drawn back past the ear, then cut across
    gb_chopW: { root: { y: -0.02 }, hips: [0, 12, 0], spine: [0, 14, 0], chest: [-2, 22, 0], head: [-4, -18, 0], shoulderR: [-120, 0, -50], elbowR: [-90, 0, 0], shoulderL: [-40, 0, 26], elbowL: [-70, 0, 0], thighL: [-14, 8, 12], kneeL: [16, 0, 0], thighR: [8, -8, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    gb_chop: { root: { y: -0.04, rx: 6 }, hips: [0, -14, 0], spine: [6, -16, 0], chest: [6, -26, 0], head: [-2, 20, 0], shoulderR: [-76, 0, 20], elbowR: [-6, 0, 0], handR: [0, 0, 10], shoulderL: [-20, 0, 30], elbowL: [-60, 0, 0], thighL: [-18, 10, 12], kneeL: [22, 0, 0], thighR: [10, -10, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    // the blade: the hand drawn back low at the hip, blade trailing — then driven straight through
    gb_bladeW: { root: { y: -0.06 }, hips: [0, 18, 0], spine: [4, 20, 0], chest: [4, 26, 0], head: [-2, -24, 0], shoulderR: [10, 0, -24], elbowR: [-60, 0, 0], handR: [0, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-50, 0, 0], thighL: [-22, 10, 14], kneeL: [30, 0, 0], thighR: [12, -10, -14], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    gb_thrust: { root: { y: -0.08, rx: 10 }, hips: [0, -16, 0], spine: [10, -18, 0], chest: [10, -24, 0], head: [-4, 22, 0], shoulderR: [-88, 0, -4], elbowR: [-2, 0, 0], handR: [0, 0, 0], shoulderL: [-10, 0, 34], elbowL: [-40, 0, 0], thighL: [-36, 10, 12], kneeL: [44, 0, 0], thighR: [16, -10, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] },
    gb_sweepW: { root: { y: -0.02 }, hips: [0, -16, 0], spine: [-4, -18, 0], chest: [-6, -28, 0], head: [-6, 24, 0], shoulderR: [-150, 0, 20], elbowR: [-20, 0, 0], shoulderL: [-30, 0, 24], elbowL: [-70, 0, 0], thighL: [-12, 8, 12], kneeL: [16, 0, 0], thighR: [8, -8, -12], kneeR: [12, 0, 0], hands: ['open', 'open'] },
    gb_sweep: { root: { y: -0.1, rx: 12 }, hips: [0, 18, 0], spine: [12, 22, 0], chest: [12, 32, 0], head: [6, -24, 0], shoulderR: [-30, 0, -60], elbowR: [-4, 0, 0], shoulderL: [-14, 0, 36], elbowL: [-50, 0, 0], thighL: [-30, 10, 14], kneeL: [40, 0, 0], thighR: [14, -10, -14], kneeR: [16, 0, 0], hands: ['open', 'open'] },
    // the Divine Lasso's wind-up (the research's goku_black_rose_lasso_charge): the right hand pulled back across the
    // waist, palm open; the torso turned away from the target, the head still on it
    gb_lassoW: {
      hands: ['fist', 'open'],
      root: { y: -0.06 }, spine: [4, -26, 0], chest: [4, -20, 0], head: [-4, 40, 0],
      shoulderR: [-30, 0, 52], elbowR: [-70, 0, 0], handR: [0, 0, 20],
      shoulderL: [-8, 0, 20], elbowL: [-30, 0, 0],
      thighL: [-22, 10, 12], kneeL: [26, 0, 0], thighR: [12, -10, -12], kneeR: [16, 0, 0],
    },
    // its detonation: half turned away, the right hand up beside him closing into a fist; the head back over his shoulder
    gb_lassoClose: {
      hands: ['open', 'fist'],
      root: { y: -0.01 }, spine: [-2, 24, 0], chest: [-2, 18, 0], head: [-4, -38, 0],
      shoulderR: [-64, 0, -26], elbowR: [-82, 0, 0], shoulderL: [6, 0, 14], elbowL: [-16, 0, 0],
      thighL: [-6, 0, 8], kneeL: [6, 0, 0], thighR: [-2, 0, -8], kneeR: [4, 0, 0],
    },
    // THE DIVINE SCYTHE (CS-SCY-01; "The Divine Scythe" and the Free Battle technique): SCY-S01's draw — the right hand
    // pulled back into the chest, palm open, the elbow out, the shoulders turned with it
    gb_scytheDraw: (t) => {
      const s = Math.sin(t * 36) * 1.2;
      return {
        hands: ['fist', 'open'],
        root: { y: -0.05 }, spine: [2, -18, 0], chest: [4, -16 + s, 0], head: [-6, 26, 0],
        shoulderR: [-40, 0, 46], elbowR: [-128, 0, 0], handR: [0, 0, 30],
        shoulderL: [-6, 0, 16], elbowL: [-24, 0, 0],
        thighL: [-18, 10, 12], kneeL: [22, 0, 0], thighR: [10, -10, -12], kneeR: [14, 0, 0],
      };
    },
    // the scythe raised (the reference image): the right arm up and out with it, the left fist low at his side
    gb_scytheHold: (t) => ({
      hands: ['fist', 'fist'],
      root: { y: Math.sin(t * 1.4) * 0.004 }, spine: [-4, 8, 0], chest: [-6, 10, 0], head: [-6, -10, 0],
      shoulderR: [-138, 0, -36], elbowR: [-14, 0, 0], handR: [0, 0, -10],
      shoulderL: [-8, 0, 14], elbowL: [-20, 0, 0],
      thighL: [-8, 6, 12], kneeL: [10, 0, 0], thighR: [6, -6, -12], kneeR: [8, 0, 0],
    }),
    gb_rise: { root: { y: 0.02, rx: -6 }, spine: [-8, 6, 0], chest: [-12, 8, 0], head: [-30, -6, 0], shoulderR: [-170, 0, -8], elbowR: [-4, 0, 0], shoulderL: [-6, 0, 18], elbowL: [-24, 0, 0], thighL: [-6, 6, 12], kneeL: [10, 0, 0], thighR: [-30, -6, -10], kneeR: [50, 0, 0], hands: ['open', 'open'] },
  };

  // the blade of ki out of the open right hand (model 'kiBlade' prop: the rush specials grow it, setPropFill)
  const BLADE = { id: 'blackBlade', shape: 'kiBlade', joint: 'handR', pos: [0, -0.06, 0], rot: [Math.PI, 0, 0], length: 1.6, width: 0.06, color: 0xd040ff, core: 0xfbe8ff };
  // the Potara: one earring, in the left ear (a gold ring, a green bead)
  const EARRING = [
    { shape: 'ball', a: [0.98, -0.34, 0.05], d: [0, -1, 0], l: 0.012, r: 0.008, flat: 1, depth: 1.06, color: POTARA, outline: 0.4 },
    { shape: 'ball', a: [0.97, -0.46, 0.05], d: [0, -1, 0], l: 0.01, r: 0.009, flat: 1, depth: 1.07, color: 0x3ac84a, outline: 0.4 },
  ];

  SL.data.characters.goku_black = {
    id: 'goku_black',
    assetLevel: 1,
    name: 'Goku Black',
    fullName: 'Goku Black (Zamasu in Goku\'s body)',
    era: 'Future Timeline',
    playable: true, // Free Battle (unlocks.js); the Future Trunks arc is not in the story yet
    prototype: true,
    style: 'Ki Blade · Rosé',
    card: ['Future Timeline', 'Zamasu in Goku\'s body'],
    blurb: 'A Kai who stole Goku\'s body to finish what he calls justice. He fights like Goku — with a blade in his hand.',
    ratings: { power: 4, speed: 4, ki: 5, defense: 3 },
    stats: { hp: 16000, ki: 140, stamina: 120, speed: 1.14, power: 1.5, defense: 1.12, weight: 1, kiRegen: 3, chargeRate: 40, canonPower: 9 },
    appearance: {
      height: GK.appearance.height,
      skin: SKIN,
      build: Object.assign({}, GK.appearance.build),
      hair: { style: 'goku', color: 0x141418 },
      headExtras: EARRING,
      // (2026-10-15 defects batch: one shaped skull narrowing to a sharper chin, narrower slanted eyes, a heavier brow —
      // he wore Goku's soft face; the board's is sharper and colder)
      face: { pupil: 0x141414, eyeW: 0.96, eyeH: 0.7, eyeTilt: 0.26, browThick: 1.35, brow: 0x141418, jaw: 1.0, headShape: { taper: 0.2, drop: 0.16, fwd: 0.09, nape: 0.15 } },
      outfit: {
        topStyle: 'gi', top: GREY, under: BLACK, sleeves: 'long', sleeveColor: BLACK, collar: BLACK, collarStyle: 'turtle',
        belt: SASH, beltStyle: 'sash', pants: BLACK, pantsStyle: 'gi', boots: WHITE, bootStyle: 'gi',
      },
      props: [BLADE],
      portraitColor: '#5c5c62',
    },
    forms: [
      { id: 'base', name: 'Base', aura: { color: 0x9a6acc, core: 0xe8d8ff, particles: 0xb88aff }, mult: {} },
      {
        id: 'rose',
        name: 'Super Saiyan Rosé',
        short: 'SSJ ROSÉ',
        kiCost: 50,
        style: 'full',
        aura: { color: 0xff4aa8, core: 0xffd0ea, particles: 0xff8ac8, idle: 0.4, speed: 1.3, sharp: 0.3, sparks: 0xffc8e4 },
        mult: { damage: 1.8, speed: 1.12, defense: 1.4, kiRegen: 1.3, chargeRate: 1.2, guardStamina: 1.2 },
        look: { hair: { style: 'goku_ssj', color: ROSE }, pupil: 0x5a5a66, brow: ROSE, bulk: 1.04 },
        practiced: {
          length: 84,
          applyAt: 42,
          steps: [
            { at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.4, shot: 'face', sfx: 'kiUp' },
            { at: 22, aura: 0.7, quake: 0.12, dust: 3 },
            { at: 42, burst: true, small: true, pose: 'powerUp', speed: 12, expression: 'shout', flash: 0.25, crater: 2.4 },
            { at: 66, pose: 'gb_idle', expression: 'smirk' },
          ],
        },
        // the Sickle of Sorrow: the blade comes out in long sweeps
        specials: {
          ultimate: {
            id: 'gbSickle', name: 'Sickle of Sorrow', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true, prop: 'blackBlade',
            startup: 10, dashFrames: 18, speed: 70, recovery: 30,
            poses: { wind: 'gb_sweepW', dash: 'gb_bladeW' },
            hits: [
              { pose: 'gb_sweep', damage: 1300, frames: 9, sfx: 'swordSlash' },
              { pose: 'gb_sweepW', damage: 1300, frames: 9, sfx: 'swordSlash' },
              { pose: 'gb_sweep', damage: 1400, frames: 9, sfx: 'swordSlash' },
              { pose: 'gb_thrust', damage: 1600, frames: 10, sfx: 'swordSlash' },
              { pose: 'gb_rise', damage: 3000, frames: 20, sfx: 'swordSlash', knock: 'launch', knockSpeed: 30, impact: 5 },
            ],
          },
        },
        ai: { aggression: 0.8, defense: 0.55, ranged: 0.4, beam: 0.45, preferredRange: 2.6 },
      },
    ],
    poses: Object.assign({}, GK.poses, poses, { idle: poses.gb_idle }),
    moves: {
      light: [
        { id: 'gbJab', startup: 4, active: 2, recovery: 10, cancel: 6, damage: 420, reach: 1.15, radius: 0.75, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'g_jabW', strike: 'g_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'gbChop', startup: 5, active: 3, recovery: 11, cancel: 7, damage: 480, reach: 1.25, radius: 0.85, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'gb_chopW', strike: 'gb_chop' }, sfx: 'punchLight', hitPose: 'hitSideL' },
        { id: 'gbElbow', startup: 5, active: 3, recovery: 12, cancel: 8, damage: 520, reach: 1.0, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'g_elbowW', strike: 'g_elbow' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        { id: 'gbKick', startup: 7, active: 3, recovery: 15, cancel: 9, damage: 640, reach: 1.45, radius: 0.9, lunge: 12, hitstun: 28, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'g_sideKickW', strike: 'g_sideKick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'gbAxe', startup: 10, active: 4, recovery: 20, damage: 1200, reach: 1.3, radius: 1, lunge: 16, hitstun: 34, knock: 'smash', knockSpeed: 34, impact: 3, pose: { wind: 'g_axeKickW', strike: 'g_axeKick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        2: { id: 'gbUpper', startup: 9, active: 4, recovery: 20, damage: 1050, reach: 1.15, radius: 0.95, lunge: 12, hitstun: 32, knock: 'launch', knockSpeed: 20, impact: 3, pose: { wind: 'uppercutWind', strike: 'uppercut' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'gbKnee', startup: 4, active: 8, recovery: 14, damage: 900, reach: 1.2, radius: 0.95, lunge: 40, hitstun: 28, knock: 'heavy', knockSpeed: 24, impact: 2, pose: { wind: 'g_flyingKnee', strike: 'g_flyingKnee' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      throw: { id: 'gbToss', name: 'Mortal\'s Place', damage: 1300, knockSpeed: 28, poses: ['grab', 'gb_chopW', 'gb_chop'] },
    },
    specials: {
      // BLACK KAMEHAMEHA: Goku's wave in Zamasu's colour — dark violet, then rose in the Rosé form
      special1: {
        id: 'blackKame', name: 'Black Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
        chargeMin: 22, chargeMax: 100, tiers: [22, 55, 90], damage: [2000, 3600], radius: [0.55, 1.25], speed: 102, range: 160, sustain: 38,
        color: 0x6a2aa8, core: 0xe0c8ff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 22,
        sound: 'kame', callout: ['KAMEHAME', 'HA!'], chargeLight: 0x8a4ad8,
        formVariants: { rose: { name: 'Black Kamehameha (Rosé)', color: 0xe0308a, core: 0xffd8ec, damageMul: 1.08 } },
      },
      // ENERGY BLADE: the blade out of the open hand — through you, and up
      special2: {
        id: 'gbBlade', name: 'Energy Blade', type: 'rush', kiCost: 30, icon: 'rush', prop: 'blackBlade', cooldown: 90,
        startup: 8, dashFrames: 16, speed: 72, recovery: 20,
        poses: { wind: 'gb_bladeW', dash: 'gb_bladeW' },
        hits: [
          { pose: 'gb_thrust', damage: 1100, frames: 10, sfx: 'swordSlash' },
          { pose: 'gb_rise', damage: 1700, frames: 16, sfx: 'swordSlash', knock: 'launch', knockSpeed: 24, impact: 3 },
        ],
      },
      // DIVINE WRATH: in the base form, every blade he can make at once, then the wave point-blank
      ultimate: {
        id: 'gbWrath', name: 'Divine Wrath', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true, prop: 'blackBlade',
        startup: 10, dashFrames: 18, speed: 66, recovery: 30,
        poses: { wind: 'gb_bladeW', dash: 'gb_bladeW' },
        hits: [
          { pose: 'gb_thrust', damage: 1000, frames: 9, sfx: 'swordSlash' },
          { pose: 'gb_sweep', damage: 1000, frames: 9, sfx: 'swordSlash' },
          { pose: 'gb_chop', damage: 1100, frames: 9, sfx: 'punchHeavy' },
          { pose: 'g_kameFire', damage: 2600, frames: 20, sfx: 'kiBlastBig', knock: 'smash', knockSpeed: 40, impact: 5 },
        ],
      },
    },
    // THE DIVINE LASSO (Roadmap Three, the Goku Black arc research: DL-S01 to S04, and its section 5 "Ultimate / Command
    // Grab Super"; the owner's go-ahead 2026-10-18): Rosé only, Free Battle only, after "Zero Mortals" (the mission that
    // shows it). The crescent from the palm, the sweep, the needles that hold whoever they reach (no guard stops them; a
    // vanish or a dodge does), the closed fist, the blast that smashes him down. src/game/techniques.js 'divineLasso'.
    // Provisional numbers: 60 ki, 9 × 90 on the catch and 3,400 on the blast (≈4,200 — under his own Sickle of Sorrow,
    // 8,600 for 100 ki); the player's move only (the AI picks wheel rushes, not this)
    extras: [
      {
        id: 'divineLasso', name: 'Divine Lasso', type: 'divineLasso', kiCost: 60, icon: 'blast', cooldown: 420,
        forms: ['rose'], freeUnlock: ['ft_zero'], freeOnly: true,
        range: 18, windup: 36, flight: 12, holdFrames: 54, recovery: 28, missRecovery: 40,
        needleDamage: 90, damage: 3400, knockSpeed: 34, color: 0xc23cff,
        cine: { steps: [{ on: 'start', shot: 'low', dur: 0.7 }, { on: 'release', shot: 'wideCut', dur: 0.5 }, { on: 'connect', shot: 'victimFace', dur: 0.9, quake: 0.25 }, { on: 'finish', shot: 'impact', dur: 0.9, quake: 0.45 }] },
      },
      // THE DIVINE SCYTHE (Roadmap Three, the Goku Black arc research CS-SCY-01 / CLN-S01 and its section 6; the owner's
      // overnight brief 2026-10-19): Rosé only, Free Battle only, after "The Divine Scythe" (the mission that shows it).
      // The scythe out of the hand, the swing that cuts the air in front of him (an arc, not a shot), the tear it leaves,
      // and the smoke clones out of it — they hunt his target, come apart and re-form behind whoever strikes them, and go
      // back into smoke. src/game/techniques.js 'divineScythe'. Provisional numbers: 80 ki, 2,400 on the swing, two clones
      // for 8 s at 0.35 of his damage, 15 s cooldown; the player's move only (the AI picks wheel rushes, not this)
      {
        id: 'divineScythe', name: 'Divine Scythe', type: 'divineScythe', kiCost: 80, icon: 'ultimate', cooldown: 900,
        forms: ['rose'], freeUnlock: ['ft_scythe'], freeOnly: true,
        windup: 42, reach: 7.5, arc: 80, damage: 2400, knockSpeed: 30, clones: 2, cloneSeconds: 8, cloneDealt: 0.35, reform: 24, recovery: 30,
        color: 0xc23cff,
        // wide framings: the scythe is taller than he is (a low lens close to the palm showed nothing but the blade)
        cine: { steps: [{ on: 'start', shot: 'wideCut', dur: 0.8 }, { on: 'release', shot: 'impact', dur: 0.8, quake: 0.3 }] },
      },
    ],
    blast: { color: 0xa070ff, core: 0xf6eaff, damage: 220, speed: 62, radius: 0.3 },
    ai: { personality: 'martial', aggression: 0.74, defense: 0.6, ranged: 0.4, beam: 0.45, transformHp: 0.7, preferredRange: 2.8 },
    intro: { pose: 'gb_idle', expression: 'smirk' },
    victory: { poses: ['gb_idle'], expression: 'smirk' },
    defeat: { pose: 'defeatKneel', expression: 'grit' },
  };
})();
