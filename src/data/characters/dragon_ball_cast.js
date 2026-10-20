/*
 * THE ORIGINAL DRAGON BALL (roster continuation, 2026-10-15) — era 'Dragon Ball', its own picker group. The original
 * series has no chapters in the game yet: these are Free Battle fighters and support models, looks from the owner's
 * visual reference (dbz visual reference.pdf p.186–208) unless a note says "from memory".
 *
 * FIGHTERS
 *   KING PICCOLO      (p.205) the old demon king: wrinkled green Namekian, antennae, a sleeveless blue gi with the 魔
 *                     mark, a purple sash, a red cape. Base → Rejuvenated (the wish for his youth). Demon Eye Beam,
 *                     stretching arm, Explosive Demon Wave.
 *   PICCOLO JR.       (p.208) Piccolo's own early self: the turban and cape, the purple gi — younger, colder. Base →
 *                     Giant (the 23rd Tournament). Mouth Energy Wave, Super Explosive Wave.
 *   TAMBOURINE        (p.207) lean, spotted, winged: fast ambushes and evasion.
 *   CYMBAL            (from memory: the board only names him) the winged dive-bomber of the three.
 *   DRUM              (p.207) the fat one: close-range pressure and body weight.
 *   MERCENARY TAO     (p.200) the braid with the red bow, the moustache, the pink tunic with 殺, the purple trousers:
 *                     precise counters, a sudden step, the Dodon Ray.
 *   GENERAL BLUE      (p.201) blond, the Red Ribbon cap and khaki shirt, red tie, blue armband, blue jodhpurs, black
 *                     boots: telekinetic paralysis, then the beating.
 *   ANDROID 8         (p.199) the gentle giant: flat-top hair, stitched brow, a navy suit over a blue turtleneck.
 *   BORA              (p.198) tall, dark-skinned, long black hair, red war paint, a bone necklace: the guardian of
 *                     Korin's land — a thrown spear of ki, a charging fighter.
 *   GRANDPA GOHAN     (p.197) Goku's grandfather: the round black cap, the white moustache, the orange vest with yellow
 *                     rings. Base → Masked (the fox mask and halo from Fortuneteller Baba's palace). Jan Ken,
 *                     Kamehameha.
 *   YOUNG CHI-CHI     (p.194) the original-series helmet with its blade. The bikini armour of that design is NOT
 *                     reproduced: she wears a covered blue armour in its colours, the teal cape and pink boots.
 *   LAUNCH            (p.190–193) both looks in one fighter: the gentle blue-haired Launch, and — a sneeze, the
 *                     transform button — the blonde one with the guns. Green top, yellow shorts, red ribbon.
 * SUPPORT ROLES (models, not fighters — the board gives them story, training and side-content roles)
 *   KORIN, OX-KING, UPA, EMPEROR PILAF, SHU, MAI, PIANO, PUAR, OOLONG.
 *
 * Level 1 prototypes on the shared rig.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const PC = C.piccolo, GK = C.goku;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 6, active: 3, recovery: 13, cancel: 9, damage, reach: 1.2, radius: 0.8, lunge: 12, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitLight' }, o);
  const hv = (id, wind, strike, damage, o) => Object.assign({ id, startup: 12, active: 4, recovery: 22, damage, reach: 1.3, radius: 1, lunge: 14, hitstun: 34, knock: 'heavy', knockSpeed: 26, impact: 3, pose: { wind, strike }, sfx: 'punchHeavy', hitPose: 'hitHeavy' }, o);
  const base = (aura) => ({ id: 'base', name: 'Base', aura: aura || { color: 0xeaf6ff, core: 0xffffff, particles: 0xdff0ff }, mult: {} });
  const practiced = (idle) => ({ length: 84, applyAt: 44, steps: [{ at: 0, pose: 'powerCrouch', speed: 9, expression: 'grit', aura: 0.5, quake: 0.15, sfx: 'kiUp' }, { at: 44, burst: true, small: true, pose: 'powerUp', speed: 12, expression: 'shout', flash: 0.3, crater: 3 }, { at: 70, pose: idle, expression: 'smirk' }] });
  const end = (idle, expr) => ({ intro: { pose: idle, expression: expr || 'smirk' }, victory: { poses: [idle], expression: expr || 'smirk' }, defeat: { pose: 'defeatKneel', expression: 'hurt' } });
  const ANTENNAE = PC.appearance.headExtras;

  /* ============================================================== KING PICCOLO */
  const KP_SKIN = 0x5aa83a;
  const kpPoses = {
    // the old king: a little stooped, one hand behind his back, the other open — contempt
    kp_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: b * 0.004 }, spine: [8, 0, 0], chest: [4 + b * 0.5, 0, 0], head: [-6, 0, 0],
        shoulderL: [20, 0, 16], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-50, 0, 0],
        thighL: [-2, 4, 8], kneeL: [6, 0, 0], thighR: [-2, -4, -8], kneeR: [6, 0, 0], hands: ['fist', 'open'],
      };
    },
  };
  C.king_piccolo = {
    id: 'king_piccolo', assetLevel: 1, name: 'King Piccolo', fullName: 'King Piccolo (Demon King)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Demon King · Namekian',
    card: ['Dragon Ball', 'The Demon King'],
    blurb: 'The evil half of the old Guardian, sealed in a rice cooker for three hundred years — and out again, with a wish for his youth.',
    ratings: { power: 4, speed: 3, ki: 4, defense: 4 },
    stats: { hp: 18000, ki: 140, stamina: 130, speed: 1.0, power: 1.15, defense: 1.1, weight: 1.1, kiRegen: 3, chargeRate: 36, canonPower: 0.6 },
    appearance: {
      height: 1.1, skin: KP_SKIN,
      build: { chestW: 0.22, chestD: 0.15, shoulderX: 0.22, waistW: 0.145, upperArmR: 0.06, foreArmR: 0.054, thighR: 0.086, shinR: 0.066, headR: 0.122 },
      // (2026-10-15 visual pass, the board p.205: long thin feelers arching forward off the brow and drooping at the tips —
      // they were Piccolo's short straight antennae; the old skull ridged across the crown; tan muscle patches down the
      // arms; the 魔 large on the middle of the chest — it sat on the left breast and on the back, where the cape hid it)
      headExtras: [1, -1].map((s) => ({ a: [s * 0.35, 0.92, 0.36], d: [s * 0.35, 0.8, 0.6], l: 0.26, r: 0.014, bend: 1.4, curl: true, toward: [s * 0.4, -0.6, 0.6], color: 0x4a8a2a, depth: 0.98, outline: 0.4 }))
        .concat([[0.62, 0.36], [0.76, 0.3], [0.88, 0.2], [0.96, 0.02]].map(([y, z]) => ({ shape: 'line', a: [-0.42, y, z], d: [1, 0, -0.1], l: 0.11, r: 0.006, flat: 0.25, depth: 1.004, color: 0x2f5a22 }))),
      face: { pupil: 0x141414, sclera: 0xf0e8a0, eyeW: 0.92, eyeH: 0.86, browThick: 1.5, brow: 0x3a6a2a, pointedEars: true, jaw: 1.08, mouthColor: 0x6a2a7a, eyeTilt: 0.16 },
      decals: ['L', 'R'].flatMap((s) => {
        const k = s === 'L' ? 1 : -1;
        return [
          { at: 'shoulder' + s, t: 0.45, ang: 0.9 * k, size: [0.045, 0.1], color: 0xe0a860 },
          { at: 'shoulder' + s, t: 0.5, ang: 0.2 * k, size: [0.035, 0.08], color: 0xe0a860 },
          { at: 'elbow' + s, t: 0.45, ang: 0.6 * k, size: [0.04, 0.1], color: 0xe0a860 },
        ];
      }),
      outfit: {
        topStyle: 'gi', top: 0x2a3ab8, sleeves: 'none', arms: KP_SKIN, emblem: { front: '魔', back: null, center: 0.08, fg: '#111111', bg: '#f0e0b0' },
        belt: 0x7a3a9a, beltStyle: 'sash', pants: 0x2a3ab8, pantsStyle: 'gi', wrist: 0xc82a2a, wristLen: 0.04,
        boots: 0xa0502a, bootStyle: 'gi', cape: 0xd84a1a,
      },
      portraitColor: '#2a3ab8',
    },
    forms: [
      base({ color: 0xc8ffb0, core: 0xffffff, particles: 0xb8f0a0 }),
      {
        // REJUVENATED: the Dragon's wish gives him his youth back — straighter, broader, faster
        id: 'young', name: 'Rejuvenated', short: 'REJUVENATED', kiCost: 40, style: 'full',
        aura: { color: 0x9aff6a, core: 0xf0ffe0, particles: 0xb8ff9a, idle: 0.35, speed: 1.3, sharp: 0.25 },
        mult: { damage: 1.5, speed: 1.15, defense: 1.35, kiRegen: 1.3, chargeRate: 1.2 },
        look: { bulk: 1.12, muscle: 1.2, scale: 1.04 },
        practiced: practiced('kp_idle'),
      },
    ],
    poses: Object.assign({}, PC.poses, kpPoses, { idle: kpPoses.kp_idle }),
    moves: {
      light: [lt('kpJab', 'punchWindR', 'punchR', 460), lt('kpChop', 'p_chopW', 'p_chop', 500, { hitPose: 'hitSideL' }), lt('kpElbow', 'p_elbowW', 'p_elbow', 600, { startup: 7, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv('kpSmash', 'hammerWind', 'hammer', 1200, { knock: 'smash', knockSpeed: 34, impact: 4 }), 3: hv('kpKick', 'p_stretchKickW', 'p_stretchKick', 1100, { reach: 2.2 }) },
      dash: hv('kpCharge', 'p_elbowW', 'p_elbow', 820, { startup: 6, active: 10, recovery: 18, lunge: 32, hitstun: 28, hitPose: 'hitBody' }),
      throw: { id: 'kpToss', name: 'Demon\'s Toss', damage: 1200, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'kpEyes', name: 'Demon Eye Beam', type: 'projectile', kiCost: 22, icon: 'blast', fromHead: true, cooldown: 80,
        startup: 12, recovery: 16, pose: { wind: 'p_demonHandW', release: 'p_demonHand' },
        projectile: { kind: 'blast', count: 2, spread: 0.08, speed: 88, radius: 0.24, damage: 800, homing: 0.15, color: 0xff3a5a, core: 0xffe0e8, explode: 1.6, knock: 'push', knockSpeed: 12, impact: 2, life: 2, guardPierce: true },
      },
      special2: {
        id: 'kpArm', name: 'Stretching Arm', type: 'stretchGrab', kiCost: 24, icon: 'rush', cooldown: 140,
        reach: 13, extendFrames: 11, pullFrames: 13, damage: 900, hitstunAfter: 32, recovery: 20, armLength: 0.48,
        poses: { wind: 'p_demonHandW', reach: 'p_demonHand' },
      },
      ultimate: {
        id: 'kpWave', name: 'Explosive Demon Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 46, chargeMax: 46, damage: [4400, 4400], radius: [2.1, 2.1], speed: 90, range: 160, sustain: 46,
        color: 0xffe07a, core: 0xfff8e0, poses: { charge: 'p_dwCharge', fire: 'p_dwFire' }, recovery: 34,
      },
    },
    blast: { color: 0xffd07a, core: 0xffffff, damage: 200, speed: 58, radius: 0.32 },
    ai: { personality: 'adaptive', aggression: 0.6, defense: 0.55, ranged: 0.45, beam: 0.4, transformHp: 0.6, preferredRange: 3.2 },
    ...end('kp_idle', 'wicked'),
  };

  /* ============================================================== PICCOLO JR. */
  C.piccolo_jr = Object.assign({}, PC, {
    id: 'piccolo_jr', assetLevel: 1, name: 'Piccolo Jr.', fullName: 'Piccolo Jr. (the 23rd World Martial Arts Tournament)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Demon King\'s Son · Giant',
    card: ['Dragon Ball', 'The 23rd Tournament'],
    blurb: 'Born to avenge his father, three years old and full grown, at the Tournament to kill Goku in front of the world.',
    ratings: { power: 4, speed: 3, ki: 4, defense: 4 },
    stats: Object.assign({}, PC.stats, { canonPower: 0.7 }),
    // (2026-10-15 visual pass, the board p.208: the antennae hidden under the turban, the cape's wide padded shoulders and
    // its collar wrapped round the neck, the pink muscle patches down the arms — he wore Piccolo's look unchanged)
    appearance: Object.assign({}, PC.appearance, {
      face: Object.assign({}, PC.appearance.face, { eyeTilt: 0.2, eyeH: 0.8 }),
      headExtras: [],
      decals: (PC.appearance.decals || []).concat(['L', 'R'].flatMap((s) => {
        const k = s === 'L' ? 1 : -1;
        return [
          { at: 'shoulder' + s, t: 0.45, ang: 0.9 * k, size: [0.042, 0.095], color: 0xe8948c },
          { at: 'shoulder' + s, t: 0.5, ang: 0.2 * k, size: [0.032, 0.075], color: 0xe8948c },
          { at: 'elbow' + s, t: 0.45, ang: 0.6 * k, size: [0.038, 0.095], color: 0xe8948c },
        ];
      })),
      // (the cape's padded shoulders and collar now come with Piccolo's own look, PC.appearance.props)
      props: PC.appearance.props,
    }),
    forms: [
      Object.assign({}, PC.forms[0]),
      {
        // GIANT: he grows to the size of the arena — the Tournament's last trick
        id: 'giant', name: 'Giant Form', short: 'GIANT', kiCost: 50, style: 'full',
        aura: { color: 0xd8ffc0, core: 0xffffff, particles: 0xc8f0b0, idle: 0.3, speed: 1.1 },
        mult: { damage: 1.6, speed: 0.92, defense: 1.7, kiRegen: 1.1, chargeRate: 1.1, guardStamina: 1.4 },
        look: { scale: 1.85, bulk: 1.1 },
        practiced: practiced('p_stance'),
        specials: {
          special2: {
            id: 'pjStomp', name: 'Giant Stomp', type: 'groundSlam', kiCost: 26, icon: 'down', cooldown: 200,
            crouch: 16, hang: 22, height: 5, maxRange: 18, radius: 8, clearHeight: 2.4, damage: 2000, knockSpeed: 20, recovery: 34,
            ringColor: 0xd8ffc0, coreColor: 0xffffff, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' },
          },
        },
      },
    ],
    specials: {
      special1: {
        id: 'pjMouth', name: 'Mouth Energy Wave', type: 'beam', kiCost: 28, icon: 'beam', fromHead: true,
        chargeMin: 24, chargeMax: 60, damage: [1900, 3000], radius: [0.6, 1.1], speed: 108, range: 150, sustain: 30,
        color: 0xffe07a, core: 0xffffff, poses: { charge: 'p_dwCharge', fire: 'p_dwFire' }, recovery: 28,
      },
      special2: Object.assign({}, PC.specials.special1, { id: 'pjHand', name: 'Demon Hand' }),
      ultimate: {
        id: 'pjExplosion', name: 'Super Explosive Wave', type: 'bomberWave', kiCost: 100, icon: 'ultimate', ultimate: true,
        charge: 40, radius: 11, damage: 4200, knockSpeed: 34, recovery: 40, color: 0xffe07a,
        poses: { charge: 'powerCrouch', release: 'powerUp' },
      },
    },
    mechanic: PC.mechanic,
    ai: Object.assign({}, PC.ai, { aggression: 0.7, transformHp: 0.5 }),
    intro: { pose: 'p_stance', expression: 'wicked' },
    victory: { poses: ['p_stance'], expression: 'wicked' },
  });

  /* ============================================================== TAMBOURINE · CYMBAL · DRUM (King Piccolo's sons) */
  const spots = (color) => [['shoulderL', 0.6], ['shoulderR', -0.6], ['elbowL', 1.0], ['elbowR', -1.0], ['elbowL', -0.2], ['elbowR', 0.2]].map(([at, ang], i) => ({ at, t: 0.3 + (i % 3) * 0.2, ang, size: [0.018, 0.018], color }));
  // Drum's spots (the board p.207): a scatter over the upper arms, the forearms, the tops of the shoulders, the flanks
  // and the back — none on the front of the belly. Chest spots sit on the chest lathe's surface at his size (chestW 0.27,
  // chestD 0.21: x × 1.35, z × 1.07 of CHEST_PTS' radius) and face out from it
  const drumSpots = (color) => {
    const out = [];
    const R = { 0.27: 0.205, 0.2: 0.212, 0.1: 0.195 };
    for (const sd of ['L', 'R']) {
      const k = sd === 'L' ? 1 : -1;
      [[0.12, 0.4], [0.3, -0.8], [0.45, 1.6], [0.6, 0.2], [0.75, -1.9], [0.88, 2.6], [0.2, 2.2], [0.5, -2.6]].forEach(([t, ang], i) => out.push({ at: 'shoulder' + sd, t, ang: ang * k, size: [0.026 + (i % 3) * 0.008, 0.022 + (i % 2) * 0.01], color }));
      [[0.15, 0.9], [0.35, -0.5], [0.55, 1.8], [0.72, -1.6], [0.4, 2.8]].forEach(([t, ang], i) => out.push({ at: 'elbow' + sd, t, ang: ang * k, size: [0.024 + (i % 2) * 0.008, 0.02 + (i % 3) * 0.006], color }));
      [[0.27, 0.9], [0.27, 1.4], [0.27, 2.0], [0.27, 2.6], [0.2, 1.7], [0.2, 2.3], [0.1, 1.9], [0.1, 2.6]].forEach(([y, th], i) => {
        const r = R[y] * 1.02;
        out.push({ at: 'chest', pos: [k * Math.sin(th) * r * 1.35, y, Math.cos(th) * r * 1.07], rot: [0, k * th, 0], size: [0.032 + (i % 3) * 0.01, 0.026 + (i % 2) * 0.012], color });
      });
    }
    out.push({ at: 'chest', pos: [0, 0.2, -0.212 * 1.02 * 1.07], rot: [0, Math.PI, 0], size: [0.04, 0.03], color });
    return out;
  };
  // the demon brothers' wings (2026-10-16: they were two flat triangles standing straight out of the shoulders like
  // paper fins): the shared back wings (Model._buildWings, Cell's construction) — two blades off the shoulder blades,
  // fanned out and swept down the back, a darker edge along each. No board image of Tambourine or Cymbal: the shape is
  // the design notes' "winged demon", not a reference comparison
  const wings = (color, edge) => ({ color, edge, len: 0.52, width: 0.15, x: 0.08, tilt: 0.3, spread: 0.55, flat: 0.16 });
  const demonPoses = {
    tb_idle: (t) => {
      const b = Math.sin(t * 2);
      return Object.assign({}, SL.data.poses.armsCrossed, { root: { y: 0.02 + b * 0.01 }, head: [-6, 0, 0] });
    },
    dr_idle: (t) => {
      const b = Math.sin(t * 1.5);
      return {
        root: { y: -0.08 + b * 0.008 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-4, 0, 0],
        shoulderL: [-10, 0, 34], elbowL: [-50, 0, 0], shoulderR: [-10, 0, -34], elbowR: [-50, 0, 0],
        thighL: [-20, 14, 26], kneeL: [32, 0, 0], thighR: [-20, -14, -26], kneeR: [32, 0, 0], hands: ['fist', 'fist'],
      };
    },
  };
  const demonFace = (o) => Object.assign({ pupil: 0x141414, sclera: 0xffffff, browThick: 1.3, brow: 0x2a5a2a, pointedEars: true, jaw: 1.06, mouthColor: 0x2a4a2a, eyeTilt: 0.2 }, o);
  const crest = (color) => [{ a: [0, 0.95, 0.2], d: [0, 1, -0.3], l: 0.08, r: 0.03, color, depth: 0.98, outline: 0.5 }];

  C.tambourine = {
    id: 'tambourine', assetLevel: 1, name: 'Tambourine', fullName: 'Tambourine (King Piccolo\'s son)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Winged Demon · Ambush',
    card: ['Dragon Ball', 'King Piccolo\'s son'],
    blurb: 'The first of King Piccolo\'s children sent out to kill martial artists. He strikes from the air and is gone.',
    ratings: { power: 3, speed: 5, ki: 2, defense: 2 },
    stats: { hp: 13000, ki: 110, stamina: 120, speed: 1.18, power: 1.0, defense: 0.9, weight: 0.85, kiRegen: 2.4, chargeRate: 34, canonPower: 0.4 },
    appearance: {
      height: 1.0, skin: 0x3a8a3a,
      build: { chestW: 0.2, chestD: 0.13, shoulderX: 0.2, waistW: 0.12, upperArmR: 0.05, foreArmR: 0.046, thighR: 0.08, shinR: 0.06, headR: 0.12 },
      headExtras: crest(0x1e4a1e),
      face: demonFace(),
      decals: spots(0x1e5a1e),
      outfit: { topStyle: 'bare', top: 0x3a8a3a, arms: 0x3a8a3a, belt: 0xe8484a, beltStyle: 'sash', pants: 0x1e2a8a, pantsStyle: 'gi', legBands: 0xa8c8e8, boots: 0x2a5ad8, bootTip: 0xc82a2a, bootStyle: 'shoe' },
      wings: wings(0x8acc5a, 0x3a7a2a),
      portraitColor: '#3a8a3a',
    },
    forms: [base({ color: 0xc8ffb0, core: 0xffffff, particles: 0xb8f0a0 })],
    poses: Object.assign({}, GK.poses, demonPoses, { idle: demonPoses.tb_idle }),
    moves: {
      light: [lt('tbJab', 'g_jabW', 'g_jab', 420, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }), lt('tbKick', 'g_kickW', 'g_kick', 460, { startup: 5, reach: 1.35 }), lt('tbSpin', 'g_spinKickW', 'g_spinKick', 560, { startup: 7, reach: 1.45, recovery: 14, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2 })],
      heavy: { 0: hv('tbAxe', 'g_axeKickW', 'g_axeKick', 1000, { knock: 'smash', knockSpeed: 32 }) },
      dash: hv('tbDive', 'g_flyingKnee', 'g_flyingKnee', 760, { startup: 3, active: 8, recovery: 12, lunge: 46, hitstun: 26, hitPose: 'hitBody' }),
      throw: { id: 'tbToss', name: 'Demon Toss', damage: 1000, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'tbBlast', name: 'Demon Blast', type: 'projectile', kiCost: 20, icon: 'blast', cooldown: 60,
        startup: 10, recovery: 14, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'blast', speed: 84, radius: 0.36, damage: 1100, homing: 0.4, color: 0xd8ff8a, core: 0xffffff, explode: 2, knock: 'push', knockSpeed: 14, impact: 2, life: 2 },
      },
      special2: {
        id: 'tbAmbush', name: 'Ambush', type: 'teleport', kiCost: 14, icon: 'teleport',
        startup: 4, recovery: 6, cooldown: 45, escapeKiCost: 24, followWindow: 36, followBonus: 1.35, pose: 'g_kickW',
        modes: { behind: true, above: true }, shimmer: true,
      },
      ultimate: {
        id: 'tbFury', name: 'Winged Fury', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 8, dashFrames: 20, speed: 76, recovery: 28, poses: { wind: 'g_kickW' },
        hits: [
          { pose: 'g_kick', damage: 600, frames: 7, sfx: 'punchHeavy' }, { pose: 'g_spinKick', damage: 650, frames: 8, sfx: 'punchHeavy' },
          { pose: 'g_cross', damage: 700, frames: 8, sfx: 'punchHeavy' }, { pose: 'g_axeKick', damage: 2000, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 },
        ],
      },
    },
    ai: { personality: 'aggressive', aggression: 0.74, defense: 0.4, ranged: 0.35, beam: 0, transformHp: 0, preferredRange: 2.6 },
    ...end('tb_idle', 'smirk'),
  };

  C.cymbal = Object.assign({}, C.tambourine, {
    id: 'cymbal', name: 'Cymbal', fullName: 'Cymbal (King Piccolo\'s son)',
    style: 'Winged Demon · Dive Bomber',
    blurb: 'King Piccolo\'s winged son who went after the Dragon Balls — he comes down out of the sky on you. Built from memory.',
    ratings: { power: 3, speed: 4, ki: 2, defense: 3 },
    stats: Object.assign({}, C.tambourine.stats, { hp: 14000, speed: 1.1, power: 1.05, defense: 1.0 }),
    appearance: Object.assign({}, C.tambourine.appearance, {
      skin: 0x4a9a5a, decals: spots(0x2a6a3a), headExtras: crest(0x2a5a2a).concat([{ a: [0, 0.6, 0.6], d: [0, 0.5, 1], l: 0.05, r: 0.03, color: 0x2a5a2a, depth: 0.98, outline: 0.5 }]),
      outfit: Object.assign({}, C.tambourine.appearance.outfit, { top: 0x4a9a5a, arms: 0x4a9a5a, belt: 0x8a3ab8, pants: 0x3a3a3a }),
      wings: wings(0x6aaa4a, 0x2a6a2a), portraitColor: '#4a9a5a',
    }),
    specials: {
      special1: {
        id: 'cyFire', name: 'Demon Breath', type: 'projectile', kiCost: 22, icon: 'ball', fromHead: true, cooldown: 70,
        startup: 14, recovery: 18, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 56, radius: 0.7, damage: 1300, homing: 0.4, color: 0xff8a2a, core: 0xfff0c0, explode: 3, knock: 'heavy', knockSpeed: 18, impact: 3, life: 2.6 },
      },
      special2: {
        id: 'cyDive', name: 'Dive Bomb', type: 'groundSlam', kiCost: 28, icon: 'down', cooldown: 200,
        crouch: 14, hang: 24, height: 8, maxRange: 20, radius: 5, clearHeight: 2, damage: 1800, knockSpeed: 20, recovery: 30,
        ringColor: 0x9aff6a, coreColor: 0xf0ffe0, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' },
      },
      ultimate: Object.assign({}, C.tambourine.specials.ultimate, { id: 'cyFury', name: 'Sky Talons' }),
    },
  });

  C.drum = {
    id: 'drum', assetLevel: 1, name: 'Drum', fullName: 'Drum (King Piccolo\'s son)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Heavy Demon · Pressure',
    card: ['Dragon Ball', 'King Piccolo\'s son'],
    blurb: 'The heaviest of the demon king\'s sons: he walks straight into you and leans.',
    ratings: { power: 4, speed: 2, ki: 1, defense: 4 },
    stats: { hp: 17000, ki: 100, stamina: 140, speed: 0.9, power: 1.12, defense: 1.15, weight: 1.5, kiRegen: 1.8, chargeRate: 30, canonPower: 0.5 },
    poise: { max: 60, regen: 12, regenDelay: 100, armor: 1, cost: { 1: 7, 2: 12, 3: 18, 4: 28 }, beamMul: 1.2, breakFrames: 120, vulnerable: 1.25 },
    appearance: {
      height: 1.04, skin: 0x5aa83a,
      build: { chestW: 0.27, chestD: 0.21, shoulderX: 0.25, waistW: 0.24, waistD: 0.22, pelvisW: 0.2, upperArmR: 0.07, foreArmR: 0.064, fist: 0.072, thighR: 0.1, shinR: 0.074, headR: 0.12, neckR: 0.08, neckLen: 0.03 },
      headExtras: crest(0x2a5a2a),
      face: demonFace({ jaw: 1.16, jawW: 1.1, cheeks: 1.3, mouthColor: 0x4a6aa8 }),
      // (2026-10-16, the board p.207: dark spots all over the shoulders, the arms, the flanks and the back — the belly's
      // front clear; there were six dots on the arms)
      decals: drumSpots(0x2a6a2a),
      outfit: { topStyle: 'bare', top: 0x5aa83a, arms: 0x5aa83a, belt: 0xf08a2a, beltStyle: 'sash', hem: { color: 0xf08a2a, len: 0.16, flare: 1.2 }, pants: 0x1e2a8a, pantsStyle: 'harem', boots: 0x2a3ab8, bootStyle: 'shoe' },
      // the sash knotted in front with its two ends hanging, and the lavender wraps round the calves under the trousers'
      // balloon (the old leg bands sat inside it)
      props: [
        { id: 'knot', joint: 'spine', shape: 'ball', pos: [0, -0.01, 0.285], size: [0.06, 0.05, 0.04], color: 0xf08a2a, outline: 0.5 },
        // (a box grows up from its origin: turned over, the ends hang down from the knot)
        { id: 'endL', joint: 'spine', shape: 'box', pos: [0.02, -0.02, 0.29], rot: [Math.PI + 0.12, 0, -0.22], size: [0.05, 0.17, 0.014], color: 0xf08a2a, outline: 0.4 },
        { id: 'endR', joint: 'spine', shape: 'box', pos: [-0.022, -0.02, 0.29], rot: [Math.PI + 0.12, 0, 0.3], size: [0.045, 0.15, 0.014], color: 0xf08a2a, outline: 0.4 },
      ].concat(['L', 'R'].map((sd) => ({ id: 'wrap' + sd, joint: 'knee' + sd, shape: 'cuff', pos: [0, -0.17, 0], radius: 0.13, radiusBottom: 0.108, length: 0.21, color: 0xa070c8, outline: 0.5 }))),
      portraitColor: '#f08a2a',
    },
    forms: [base({ color: 0xc8ffb0, core: 0xffffff, particles: 0xb8f0a0 })],
    poses: Object.assign({}, demonPoses, { idle: demonPoses.dr_idle }),
    moves: {
      light: [lt('drSlap', 'punchWindR', 'punchR', 520, { startup: 8, recovery: 15, cancel: 10 }), lt('drSlap2', 'punchWindL', 'punchL', 540, { startup: 8, recovery: 15, cancel: 10 }), lt('drBelly', 'hammerWind', 'hammer', 680, { startup: 10, recovery: 17, hitstun: 28, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv('drCrush', 'hammerWind', 'hammer', 1400, { startup: 14, recovery: 26, armor: true, knock: 'smash', knockSpeed: 36, impact: 4, guardCrush: true, guardDamage: 55 }) },
      dash: hv('drRam', 'punchWindR', 'punchR', 980, { startup: 8, active: 10, recovery: 20, lunge: 28, hitstun: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'drSit', name: 'Sit On You', damage: 1500, knockSpeed: 16, poses: ['grab', 'hammerWind', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'drBelly', name: 'Belly Charge', type: 'rush', kiCost: 22, icon: 'rush', cooldown: 90,
        startup: 10, dashFrames: 22, speed: 52, armor: true, recovery: 22, poses: { wind: 'powerCrouch' },
        hits: [{ pose: 'hammer', damage: 1500, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 30, impact: 3 }],
      },
      special2: {
        id: 'drDrop', name: 'Body Drop', type: 'groundSlam', kiCost: 26, icon: 'down', cooldown: 200,
        crouch: 18, hang: 26, height: 6, maxRange: 16, radius: 6, clearHeight: 2, damage: 1900, knockSpeed: 20, recovery: 34,
        ringColor: 0x9aff6a, coreColor: 0xf0ffe0, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' },
      },
      ultimate: {
        id: 'drRampage', name: 'Demon Rampage', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 12, dashFrames: 22, speed: 56, armor: true, recovery: 32, poses: { wind: 'hammerWind' },
        hits: [
          { pose: 'punchR', damage: 800, frames: 11, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 800, frames: 11, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 2600, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 },
        ],
      },
    },
    ai: { personality: 'berserker', aggression: 0.72, defense: 0.45, ranged: 0.15, beam: 0, transformHp: 0, preferredRange: 1.8 },
    ...end('dr_idle', 'grin'),
  };

  /* ============================================================== MERCENARY TAO */
  const taoPoses = {
    // upright, one hand behind his back, two fingers of the other ready: an assassin's stillness
    tao_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return {
        root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-4, 6, 0], head: [-6, -6, 0],
        shoulderL: [24, 0, 16], elbowL: [-70, 0, 0], shoulderR: [-40, 0, -14], elbowR: [-70, 0, 0],
        thighL: [-4, 6, 10], kneeL: [6, 0, 0], thighR: [4, -6, -10], kneeR: [8, 0, 0], hands: ['fist', 'point'],
      };
    },
  };
  C.mercenary_tao = {
    id: 'mercenary_tao', assetLevel: 1, name: 'Mercenary Tao', fullName: 'Mercenary Tao (Taopaipai)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Assassin · Counters',
    card: ['Dragon Ball', 'The world\'s greatest assassin'],
    blurb: 'The Crane School\'s assassin for hire: cold, exact, and quicker to the counter than anyone you have met.',
    ratings: { power: 3, speed: 4, ki: 3, defense: 3 },
    stats: { hp: 14000, ki: 120, stamina: 120, speed: 1.12, power: 1.05, defense: 1.0, weight: 0.95, kiRegen: 2.6, chargeRate: 36, canonPower: 0.3 },
    appearance: {
      height: 1.08, skin: 0xf0c098,
      build: { chestW: 0.2, chestD: 0.13, shoulderX: 0.2, waistW: 0.125, upperArmR: 0.05, foreArmR: 0.045, thighR: 0.08, shinR: 0.06, headR: 0.118 },
      hair: { style: 'cropped', color: 0x141418 },
      headExtras: [
        // the long braid hanging down his back (2026-10-15, the board p.200: it was a short stub, its red bow a dot on the
        // back of the head — the bow is a prop now, tied at the braid's end), and the moustache
        { a: [0, 0.2, -0.95], d: [0, -1, -0.3], l: 0.38, r: 0.036, bend: 0.35, toward: [0, -1, 0], color: 0x141418, depth: 0.98, outline: 0.5 },
        { shape: 'ball', a: [0.25, -0.38, 0.92], d: [1, -0.6, 0], l: 0.06, r: 0.016, color: 0x141418, depth: 1.0, flat: 0.6, outline: 0.3 },
        { shape: 'ball', a: [-0.25, -0.38, 0.92], d: [-1, -0.6, 0], l: 0.06, r: 0.016, color: 0x141418, depth: 1.0, flat: 0.6, outline: 0.3 },
      ],
      face: { pupil: 0x141414, eyeW: 0.84, eyeH: 0.7, browThick: 1.3, brow: 0x141418, jaw: 1.08, eyeTilt: 0.12 },
      outfit: {
        // (the 殺 large in the middle of the chest, as the board — it was a small mark on the left breast; white cuffs)
        topStyle: 'gi', top: 0xf0a0c0, under: 0x3a2a6a, sleeves: 'long', sleeveColor: 0x3a2a6a, emblem: { text: '殺', center: 0.075, fg: '#c81e2a', bg: '#ffffff' },
        wrist: 0xf0f0f0, wristLen: 0.05,
        belt: 0xf0a0c0, hem: { color: 0xf0a0c0, len: 0.28, flare: 1.2 }, pants: 0x3a2a6a, pantsStyle: 'gi', legBands: 0xf0f0f0, boots: 0x1e1e24, bootStyle: 'shoe',
      },
      props: [
        { id: 'braidBowL', joint: 'head', shape: 'ball', pos: [0.028, -0.222, -0.24], size: [0.03, 0.022, 0.02], color: 0xd81e2a, outline: 0.4 },
        { id: 'braidBowR', joint: 'head', shape: 'ball', pos: [-0.028, -0.222, -0.24], size: [0.03, 0.022, 0.02], color: 0xd81e2a, outline: 0.4 },
        { id: 'braidTuft', joint: 'head', shape: 'spike', pos: [0, -0.235, -0.245], rot: [Math.PI, 0, 0], size: [0.022, 0.06, 1], color: 0x141418, outline: 0.4 },
      ],
      portraitColor: '#f0a0c0',
    },
    forms: [base()],
    poses: Object.assign({}, GK.poses, taoPoses, { idle: taoPoses.tao_idle }),
    moves: {
      light: [lt('taoJab', 'g_jabW', 'g_jab', 400, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }), lt('taoChop', 'chopW', 'chop', 460, { startup: 5, hitPose: 'hitSideL' }), lt('taoKick', 'g_sideKickW', 'g_sideKick', 540, { startup: 6, reach: 1.45, recovery: 13, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2 })],
      heavy: { 0: hv('taoPalm', 'g_palmW', 'g_palm', 1100, { startup: 9, knock: 'heavy', knockSpeed: 28 }), 2: hv('taoRise', 'uppercutWind', 'uppercut', 980, { knock: 'launch', knockSpeed: 20 }) },
      dash: hv('taoDart', 'g_jabW', 'g_jab', 700, { startup: 3, active: 8, recovery: 12, lunge: 42, hitstun: 24, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'taoToss', name: 'Assassin\'s Throw', damage: 1100, knockSpeed: 30, poses: ['grab', 'chopW', 'chop'] },
    },
    specials: {
      // DODON RAY: one finger — a thin beam, fast, through a guard
      special1: {
        id: 'taoDodon', name: 'Dodon Ray', type: 'projectile', kiCost: 22, icon: 'blast', cooldown: 70,
        startup: 12, aimLock: 6, recovery: 14, pose: { wind: 'g_finger', aim: 'g_finger', release: 'g_finger' },
        projectile: { kind: 'blast', speed: 92, radius: 0.24, damage: 1500, homing: 0.1, color: 0xffd040, core: 0xffffff, explode: 2, knock: 'heavy', knockSpeed: 20, impact: 3, life: 2, guardPierce: true },
      },
      // SUDDEN STEP: he is behind you before the blow lands
      special2: {
        id: 'taoStep', name: 'Sudden Step', type: 'teleport', kiCost: 14, icon: 'teleport',
        startup: 3, recovery: 6, cooldown: 40, escapeKiCost: 22, followWindow: 34, followBonus: 1.35, pose: 'g_jab',
        modes: { behind: true }, shimmer: true,
      },
      // SUPER DODON WAVE: everything in the Crane School's wave
      ultimate: {
        id: 'taoWave', name: 'Super Dodon Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [3800, 3800], radius: [1.2, 1.2], speed: 104, range: 150, sustain: 38,
        color: 0xffd040, core: 0xfff8e0, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 28,
      },
    },
    blast: { color: 0xffd040, core: 0xffffff, damage: 190, speed: 64, radius: 0.28 },
    ai: { personality: 'martial', aggression: 0.55, defense: 0.75, ranged: 0.45, beam: 0.3, transformHp: 0, preferredRange: 2.6 },
    ...end('tao_idle', 'smirk'),
  };

  /* ============================================================== GENERAL BLUE */
  const BLUE_KHAKI = 0x8a7a48, RR_RED = 0xd01a1a;
  const blPoses = {
    bl_idle: (t) => {
      const b = Math.sin(t * 1.4);
      return { root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-6, 0, 0], shoulderL: [-10, 0, 40], elbowL: [-96, 0, 0], shoulderR: [-10, 0, -40], elbowR: [-96, 0, 0], thighL: [-2, 4, 10], kneeL: [4, 0, 0], thighR: [-2, -4, -10], kneeR: [4, 0, 0], hands: ['fist', 'fist'] };
    },
    bl_glareW: { root: { y: 0 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-2, 0, 0], shoulderR: [-60, 0, -20], elbowR: [-80, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-60, 0, 0], thighL: [-6, 4, 10], kneeL: [8, 0, 0], thighR: [-2, -4, -10], kneeR: [6, 0, 0], hands: ['fist', 'open'] },
    bl_glare: { root: { y: -0.02 }, spine: [4, 0, 0], chest: [6, 0, 0], head: [8, 0, 0], shoulderR: [-86, 0, -6], elbowR: [-10, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-60, 0, 0], thighL: [-12, 4, 10], kneeL: [14, 0, 0], thighR: [4, -4, -10], kneeR: [6, 0, 0], hands: ['fist', 'open'] },
  };
  C.general_blue = {
    id: 'general_blue', assetLevel: 1, name: 'General Blue', fullName: 'General Blue (Red Ribbon Army)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Officer · Paralysis',
    card: ['Dragon Ball', 'Red Ribbon Army'],
    blurb: 'The Red Ribbon Army\'s most fastidious officer. One look from him and you cannot move — then he takes his time.',
    ratings: { power: 3, speed: 3, ki: 3, defense: 3 },
    stats: { hp: 13000, ki: 120, stamina: 120, speed: 1.05, power: 1.0, defense: 1.0, weight: 1, kiRegen: 2.6, chargeRate: 34, canonPower: 0.2 },
    appearance: {
      height: 1.04, skin: 0xf2c8a0,
      build: { chestW: 0.205, chestD: 0.135, shoulderX: 0.205, waistW: 0.13, upperArmR: 0.052, foreArmR: 0.046, thighR: 0.084, shinR: 0.062, headR: 0.118 },
      hair: { style: 'cropped', color: 0xf0d878 },
      // (2026-10-15 visual pass, the board p.201: a tall peaked officer's cap with its black peak and the RR badge — it was a
      // skull cap — the blond hair showing under it; a black cross strap over his right shoulder; the blue armband on his
      // left arm only)
      headExtras: [
        { shape: 'cyl', a: [0, 1, 0.1], d: [0, 1, 0.12], l: 0.14, r: 0.124, color: BLUE_KHAKI, depth: 0.55, flat: 1, outline: 0.6 },
        { shape: 'ball', a: [0, 0.6, 0.8], d: [0, 1, 0.25], l: 0.012, r: 0.105, color: 0x1e2448, depth: 1.03, flat: 0.6, outline: 0.5 },
        { shape: 'ball', a: [0, 0.61, 0.79], d: [0, 0.1, 1], l: 0.02, r: 0.028, color: RR_RED, depth: 1.42, flat: 0.35, outline: 0.3 },
      ],
      face: { pupil: 0x2a6ab8, browThick: 1.0, brow: 0xd8b860, jaw: 1.02, eyeTilt: 0.12 },
      outfit: {
        topStyle: 'shirt', top: BLUE_KHAKI, sleeves: 'long', sleeveColor: BLUE_KHAKI, arms: BLUE_KHAKI,
        belt: 0x2a2a2a, beltStyle: 'belt', buckle: 0xe0b030,
        pants: 0x2a4a8a, pantsStyle: 'harem', boots: 0x141418, bootStyle: 'saiyan',
      },
      props: [
        { id: 'tie', shape: 'tri', joint: 'chest', pos: [0, 0.08, 0.15], rot: [-0.1, 0, 0], size: [0.026, 0.1, 0.008], color: RR_RED },
        { id: 'crossStrap', shape: 'strip', joint: 'chest', color: 0x1a1a1e, width: 0.022, thick: 0.008,
          path: [[0.099, -0.03, 0.089], [0.068, 0.02, 0.118], [0.036, 0.07, 0.135], [0.005, 0.12, 0.146], [-0.026, 0.17, 0.151], [-0.057, 0.22, 0.148], [-0.089, 0.27, 0.125], [-0.115, 0.31, 0.062], [-0.125, 0.335, 0], [-0.12, 0.32, -0.045], [-0.078, 0.253, -0.13], [-0.037, 0.187, -0.144], [0.005, 0.12, -0.138], [0.047, 0.053, -0.122], [0.088, -0.013, -0.093]] },
        { id: 'armband', shape: 'cuff', joint: 'shoulderL', pos: [0, -0.1, 0], radius: 0.062, radiusBottom: 0.06, length: 0.06, color: 0x2a5ab8 },
      ],
      portraitColor: '#2a4a8a',
    },
    forms: [base()],
    poses: Object.assign({}, GK.poses, blPoses, { idle: blPoses.bl_idle }),
    moves: {
      light: [lt('blJab', 'punchWindR', 'punchR', 420, { startup: 5 }), lt('blKick', 'kickWindR', 'kickR', 480, { reach: 1.35 }), lt('blKnee', 'g_kickW', 'g_kick', 560, { startup: 7, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 12, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv('blSlam', 'hammerWind', 'hammer', 1100, { knock: 'smash', knockSpeed: 32 }) },
      dash: hv('blCharge', 'punchWindR', 'punchR', 720, { startup: 5, active: 8, recovery: 14, lunge: 36, hitstun: 24, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'blToss', name: 'Officer\'s Throw', damage: 1000, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // PARALYSIS: his eyes on you, and you cannot move until he looks away
      special1: {
        id: 'blParalysis', name: 'Paralysis', type: 'telekinesis', kiCost: 22, icon: 'teleport', cooldown: 300,
        range: 18, startup: 12, maxFrames: 140, bossFrames: 55, kiPerSecond: 16, releaseStagger: 30, recovery: 18,
        mashGain: 0.07, escapeDecay: 0.004, cpuEscape: 0.006, poses: { focus: 'bl_glareW', hold: 'bl_glare' },
      },
      // RED RIBBON DRILL: the beating of a man who was trained for it
      special2: {
        id: 'blDrill', name: 'Red Ribbon Drill', type: 'rush', kiCost: 26, icon: 'rush',
        startup: 8, dashFrames: 20, speed: 62, recovery: 22, poses: { wind: 'punchWindR' },
        hits: [{ pose: 'punchR', damage: 480, frames: 8, sfx: 'punchHeavy' }, { pose: 'kickR', damage: 520, frames: 9, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1200, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 }],
      },
      // GENERAL'S CANNON: a wave from both palms
      ultimate: {
        id: 'blCannon', name: 'General\'s Cannon', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [3400, 3400], radius: [1.1, 1.1], speed: 100, range: 150, sustain: 36,
        color: 0x6a9aff, core: 0xf0f8ff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 28,
      },
    },
    ai: { personality: 'adaptive', aggression: 0.55, defense: 0.6, ranged: 0.45, beam: 0.3, transformHp: 0, preferredRange: 3 },
    ...end('bl_idle', 'smirk'),
  };

  /* ============================================================== ANDROID 8 */
  const a8Poses = {
    a8_idle: (t) => {
      const b = Math.sin(t * 1.3);
      return { root: { y: b * 0.004 }, spine: [6, 0, 0], chest: [4, 0, 0], head: [6, 0, 0], shoulderL: [-14, 0, 20], elbowL: [-30, 0, 0], shoulderR: [-14, 0, -20], elbowR: [-30, 0, 0], thighL: [-4, 6, 12], kneeL: [8, 0, 0], thighR: [-4, -6, -12], kneeR: [8, 0, 0], hands: ['fist', 'fist'] };
    },
  };
  C.android_8 = {
    id: 'android_8', assetLevel: 1, name: 'Android 8', fullName: 'Android 8 ("Eighter")', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Gentle Giant · Grappler',
    card: ['Dragon Ball', 'Muscle Tower'],
    blurb: 'The Red Ribbon Army built him to fight and he never wanted to. Hurt his friends and he will, once.',
    ratings: { power: 4, speed: 1, ki: 1, defense: 5 },
    stats: { hp: 19000, ki: 100, stamina: 160, speed: 0.86, power: 1.12, defense: 1.25, weight: 1.6, kiRegen: 1.6, chargeRate: 28, canonPower: 0.3 },
    poise: { max: 70, regen: 14, regenDelay: 100, armor: 1, cost: { 1: 6, 2: 10, 3: 16, 4: 26 }, beamMul: 1.2, breakFrames: 120, vulnerable: 1.25 },
    appearance: {
      height: 1.3, skin: 0xe8b890,
      // (2026-10-15 visual pass, the board p.199: the head up out of the turtleneck on a thicker neck, the hair a tall flat
      // top, the stitched scar across the forehead — he had a round skull cap and a brown smudge, the head sunk in the collar)
      build: { chestW: 0.27, chestD: 0.19, shoulderX: 0.27, waistW: 0.2, waistD: 0.17, upperArmR: 0.075, foreArmR: 0.068, fist: 0.078, thighR: 0.1, shinR: 0.078, headR: 0.118, neckR: 0.08, neckLen: 0.06 },
      hair: { style: 'skullcap', color: 0x141418 },
      headExtras: [
        { shape: 'cyl', a: [0, 1, 0.05], d: [0, 1, 0], l: 0.07, r: 0.118, color: 0x141418, depth: 0.72, flat: 0.9, outline: 0.6 },
        { shape: 'line', a: [-0.3, 0.52, 0.84], d: [1, 0.05, 0], l: 0.075, r: 0.006, flat: 0.25, depth: 1.004, color: 0x6a3a2a },
      ].concat([-0.18, 0, 0.18].map((x) => ({ shape: 'line', a: [x, 0.58, 0.8], d: [0, -1, 0.2], l: 0.022, r: 0.005, flat: 0.25, depth: 1.004, color: 0x6a3a2a }))),
      face: { pupil: 0x141414, eyeW: 0.84, eyeH: 0.74, browThick: 1.6, brow: 0x141418, jaw: 1.18, jawW: 1.12 },
      outfit: {
        topStyle: 'shirt', top: 0x2a4ab8, sleeves: 'long', sleeveColor: 0x1e2a4a, arms: 0x1e2a4a, collar: 0x2a4ab8, collarStyle: 'turtle',
        jacket: { color: 0x1e2a4a, open: 0.9 }, pants: 0x1e2a4a, pantsStyle: 'slacks', boots: 0x141418, bootStyle: 'shoe',
      },
      portraitColor: '#1e2a4a',
    },
    forms: [base()],
    poses: Object.assign({}, a8Poses, { idle: a8Poses.a8_idle }),
    moves: {
      light: [lt('a8Push', 'punchWindR', 'punchR', 560, { startup: 9, recovery: 16, cancel: 11 }), lt('a8Push2', 'punchWindL', 'punchL', 580, { startup: 9, recovery: 16, cancel: 11 }), lt('a8Clap', 'hammerWind', 'hammer', 720, { startup: 11, recovery: 18, hitstun: 30, knock: 'push', knockSpeed: 16, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv('a8Slam', 'hammerWind', 'hammer', 1500, { startup: 15, recovery: 26, armor: true, knock: 'smash', knockSpeed: 36, impact: 4, guardCrush: true, guardDamage: 55 }) },
      dash: hv('a8Lumber', 'punchWindR', 'punchR', 1000, { startup: 8, active: 12, recovery: 22, lunge: 26, hitstun: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'a8Hug', name: 'Bear Hug', damage: 1700, knockSpeed: 18, poses: ['grab', 'hammerWind', 'hammer'] },
    },
    specials: {
      special1: {
        id: 'a8Shove', name: 'Eighter Shove', type: 'rush', kiCost: 20, icon: 'rush', cooldown: 90,
        startup: 10, dashFrames: 20, speed: 50, armor: true, recovery: 24, poses: { wind: 'punchWindR' },
        hits: [{ pose: 'punchR', damage: 1500, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 34, impact: 3 }],
      },
      special2: {
        id: 'a8Stomp', name: 'Ground Shake', type: 'groundSlam', kiCost: 26, icon: 'down', cooldown: 220,
        crouch: 20, hang: 22, height: 4, maxRange: 14, radius: 7, clearHeight: 2, damage: 1800, knockSpeed: 20, recovery: 36,
        ringColor: 0xd8e0ff, coreColor: 0xffffff, dustColor: 'stage', poses: { crouch: 'powerCrouch', air: 'jump', land: 'hammer' },
      },
      ultimate: {
        id: 'a8Fury', name: 'For My Friends', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 12, dashFrames: 22, speed: 54, armor: true, recovery: 32, poses: { wind: 'hammerWind' },
        hits: [{ pose: 'punchR', damage: 900, frames: 12, sfx: 'punchHeavy' }, { pose: 'punchL', damage: 900, frames: 12, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 2600, frames: 22, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 40, impact: 5 }],
      },
    },
    mechanic: { type: 'tireless', name: 'Android Body', desc: 'A machine: he does not tire and his ki refills.' },
    ai: { personality: 'berserker', aggression: 0.5, defense: 0.7, ranged: 0.1, beam: 0, transformHp: 0, preferredRange: 1.8 },
    ...end('a8_idle', 'calm'),
  };

  /* ============================================================== BORA */
  const BORA_SKIN = 0x8a5a3a;
  C.bora = {
    id: 'bora', assetLevel: 1, name: 'Bora', fullName: 'Bora (guardian of Korin\'s land)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Guardian · Spear',
    card: ['Dragon Ball', 'The Sacred Land of Korin'],
    blurb: 'The guardian of Korin Tower\'s sacred land: huge, proud, and strong enough to stop the Red Ribbon Army\'s tanks.',
    ratings: { power: 4, speed: 2, ki: 2, defense: 4 },
    stats: { hp: 16000, ki: 100, stamina: 140, speed: 0.96, power: 1.1, defense: 1.12, weight: 1.35, kiRegen: 2, chargeRate: 30, canonPower: 0.3 },
    appearance: {
      height: 1.24, skin: BORA_SKIN,
      build: { chestW: 0.26, chestD: 0.17, shoulderX: 0.26, waistW: 0.16, upperArmR: 0.074, foreArmR: 0.066, fist: 0.074, thighR: 0.1, shinR: 0.076, headR: 0.118, neckR: 0.075 },
      hair: { style: 'a17', color: 0x141418 },
      // (2026-10-15 visual pass, the board p.198: the war paint two painted stripes — across the bridge of the nose and on
      // his left cheek — they were two raised blobs as wide as the eyes; fangs hanging from the cord necklace; the X scar
      // on his right breast)
      headExtras: [
        { shape: 'line', a: [-0.12, 0.05, 0.98], d: [1, 0, 0], l: 0.05, r: 0.012, flat: 0.25, depth: 1.004, color: 0xd8401a },
        { shape: 'line', a: [0.32, -0.14, 0.92], d: [1, 0.12, 0], l: 0.05, r: 0.013, flat: 0.25, depth: 1.004, color: 0xd8401a },
      ],
      decals: [-0.7, 0.7].map((r) => ({ at: 'chest', pos: [-0.085, 0.13, 0.166], rot: [-0.1, -0.35, r], size: [0.006, 0.05], color: 0x6a3a1a })),
      face: { pupil: 0x141414, browThick: 1.5, brow: 0x141418, jaw: 1.12, jawW: 1.04 },
      outfit: { topStyle: 'bare', top: BORA_SKIN, arms: BORA_SKIN, belt: 0x8a6a3a, beltStyle: 'sash', pants: 0x6a4a2a, pantsStyle: 'gi', armBands: 0xf0e8d8, armBandAt: 0.2, boots: 0x6a4a2a, bootStyle: 'shoe' },
      // the cord lies on top of the chest round the base of the neck (on the neck joint it sank under the bare chest), the
      // fangs laid down the slope of the chest from it
      props: [{ id: 'necklace', shape: 'neckRing', joint: 'chest', pos: [0, 0.335, 0.01], radius: 0.105, thick: 0.16, color: 0xf0e8d8 }]
        .concat([-0.62, -0.31, 0, 0.31, 0.62].map((t, i) => ({ id: 'fang' + i, joint: 'chest', shape: 'spike', pos: [Math.sin(t) * 0.107, 0.33, 0.012 + Math.cos(t) * 0.107], rot: [Math.PI - 0.8, 0, -Math.sin(t) * 0.6], size: [0.011, i === 2 ? 0.05 : 0.04, 0.8], color: 0xf0e8d8, outline: 0.4 }))),
      portraitColor: '#8a5a3a',
    },
    forms: [base()],
    poses: Object.assign({}, GK.poses),
    moves: {
      light: [lt('boJab', 'punchWindR', 'punchR', 500), lt('boHook', 'punchWindL', 'punchL', 540), lt('boKick', 'kickWindR', 'kickR', 640, { startup: 8, reach: 1.45, recovery: 15, hitstun: 26, knock: 'push', knockSpeed: 14, impact: 2, hitPose: 'hitBody' })],
      heavy: { 0: hv('boSmash', 'hammerWind', 'hammer', 1300, { knock: 'smash', knockSpeed: 34, armor: true }) },
      dash: hv('boCharge', 'punchWindR', 'punchR', 900, { startup: 6, active: 10, recovery: 18, lunge: 32, hitstun: 28, armor: true, hitPose: 'hitBody' }),
      throw: { id: 'boToss', name: 'Guardian\'s Throw', damage: 1300, knockSpeed: 32, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // SPEAR THROW: a spear of ki, thrown hard and true
      special1: {
        id: 'boSpear', name: 'Spear Throw', type: 'projectile', kiCost: 24, icon: 'javelin',
        startup: 14, recovery: 18, pose: { wind: 'throwWind', release: 'throwRelease' },
        projectile: { kind: 'javelin', speed: 82, radius: 0.5, damage: 1600, homing: 0.6, color: 0xffd8a0, core: 0xffffff, explode: 4, knock: 'heavy', knockSpeed: 22, impact: 3, guardPierce: 0.5, life: 2.2 },
      },
      special2: {
        id: 'boRush', name: 'Guardian\'s Charge', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 8, dashFrames: 24, speed: 54, armor: true, recovery: 22, poses: { wind: 'punchWindR' },
        hits: [{ pose: 'punchR', damage: 520, frames: 10, sfx: 'punchHeavy' }, { pose: 'kickR', damage: 560, frames: 10, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1300, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 36, impact: 4 }],
      },
      ultimate: {
        id: 'boVolley', name: 'Rain of Spears', type: 'scatter', kiCost: 100, icon: 'ultimate', ultimate: true,
        windup: 22, rise: 24, height: 10, count: 12, damage: 700, speed: 60, range: 60, recovery: 26,
        color: 0xffd8a0, poses: { wind: 'throwWind', throw: 'throwRelease' },
      },
    },
    ai: { personality: 'berserker', aggression: 0.65, defense: 0.55, ranged: 0.35, beam: 0, transformHp: 0, preferredRange: 2.4 },
    ...end('armsCrossed', 'calm'),
  };

  /* ============================================================== GRANDPA GOHAN */
  const GG_VEST = 0xd8481e;
  const ggPoses = {
    gp_idle: (t) => {
      const b = Math.sin(t * 1.6);
      return { root: { y: -0.06 + b * 0.005 }, spine: [10, 0, 0], chest: [6, 8, 0], head: [-4, -8, 0], shoulderR: [-60, 0, -30], elbowR: [-90, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-60, 0, 0], thighL: [-20, 10, 18], kneeL: [30, 0, 0], thighR: [8, -10, -18], kneeR: [18, 0, 0], hands: ['fist', 'fist'] };
    },
  };
  const MASK = [
    // the fox-cat mask over the face, with its two pointed ears, and the halo of the dead
    { shape: 'ball', a: [0, 0, 1], d: [0, 0, 1], l: 0.02, r: 0.13, color: 0xf4eee0, depth: 0.9, flat: 0.5, outline: 0.5 },
    { a: [0.45, 0.75, 0.6], d: [0.3, 1, 0.2], l: 0.08, r: 0.035, color: 0xf4eee0, depth: 0.98, outline: 0.5 },
    { a: [-0.45, 0.75, 0.6], d: [-0.3, 1, 0.2], l: 0.08, r: 0.035, color: 0xf4eee0, depth: 0.98, outline: 0.5 },
    { shape: 'ball', a: [0.3, 0.1, 1.05], d: [0, 0, 1], l: 0.005, r: 0.03, color: 0xd8401a, depth: 1.06, flat: 0.3, outline: 0.3 },
    { shape: 'ball', a: [-0.3, 0.1, 1.05], d: [0, 0, 1], l: 0.005, r: 0.03, color: 0xd8401a, depth: 1.06, flat: 0.3, outline: 0.3 },
  ];
  const MOUSTACHE = [
    { shape: 'ball', a: [0.2, -0.36, 0.94], d: [1, -0.5, 0], l: 0.07, r: 0.022, color: 0xf0f0ea, depth: 1.0, flat: 0.6, outline: 0.3 },
    { shape: 'ball', a: [-0.2, -0.36, 0.94], d: [-1, -0.5, 0], l: 0.07, r: 0.022, color: 0xf0f0ea, depth: 1.0, flat: 0.6, outline: 0.3 },
  ];
  C.grandpa_gohan = {
    id: 'grandpa_gohan', assetLevel: 1, name: 'Grandpa Gohan', fullName: 'Grandpa Gohan (Son Gohan)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Old Master · Jan Ken',
    card: ['Dragon Ball', 'Goku\'s grandfather'],
    blurb: 'Master Roshi\'s student, the old man who found a baby in a pod and raised him. Goku learned Rock-Paper-Scissors from him.',
    ratings: { power: 2, speed: 3, ki: 3, defense: 3 },
    stats: { hp: 12000, ki: 120, stamina: 110, speed: 1.0, power: 0.92, defense: 0.95, weight: 0.85, kiRegen: 2.6, chargeRate: 34, canonPower: 0.2 },
    appearance: {
      height: 0.82, skin: 0xf4c8a0,
      build: { chestW: 0.2, chestD: 0.15, shoulderX: 0.19, waistW: 0.16, waistD: 0.14, upperArmR: 0.05, foreArmR: 0.046, thighR: 0.078, shinR: 0.058, headR: 0.13 },
      hair: { style: 'bald', color: 0xd8d8d0 },
      headExtras: MOUSTACHE,
      face: { pupil: 0x141414, eyeW: 0.8, eyeH: 0.6, browThick: 1.4, brow: 0xf0f0ea, jaw: 1.02, cheeks: 1.1 },
      outfit: {
        // (2026-10-15 visual pass, the board p.197: the vest a deeper red-orange with yellow rings on it, white frog
        // fastenings down the shirt — it was a plain bright orange)
        topStyle: 'gi', top: GG_VEST, under: 0xf0f0ea, sleeves: 'long', sleeveColor: 0x1e1e24, cap: 0x1e3a1e, capBall: 0xd8d8d0,
        belt: 0xf0f0ea, hem: { color: GG_VEST, len: 0.22, flare: 1.15 }, pants: 0x1e1e24, pantsStyle: 'gi', boots: 0x1e1e24, bootStyle: 'shoe',
      },
      decals: [[0.1, 0.205, 0.148, -0.2, 0.6], [0.145, 0.09, 0.104, 0, 0.95], [-0.1, 0.205, 0.148, -0.2, -0.6], [-0.145, 0.09, 0.104, 0, -0.95], [0.08, 0.18, -0.146, 0.1, Math.PI - 0.5], [-0.08, 0.18, -0.146, 0.1, Math.PI + 0.5]]
        .flatMap(([x, y, z, rx, ry]) => {
          const n = z > 0 ? 1 : -1;
          return [
            { at: 'chest', pos: [x, y, z + n * 0.003], rot: [rx, ry, 0], size: [0.024, 0.024], color: 0xf0c020 },
            { at: 'chest', pos: [x, y, z + n * 0.005], rot: [rx, ry, 0], size: [0.013, 0.013], color: GG_VEST },
          ];
        }),
      props: [[0.21, 0.182], [0.16, 0.184], [0.11, 0.178], [0.06, 0.166]].map(([y, z], i) => ({ id: 'frog' + i, joint: 'chest', shape: 'box', pos: [0, y - 0.006, z], size: [0.045, 0.012, 0.008], color: 0xf0f0ea, outline: 0.3 })),
      portraitColor: '#f0882a',
    },
    forms: [
      base({ color: 0xffe8c0, core: 0xffffff, particles: 0xfff0d8 }),
      {
        // MASKED: the fox mask and the halo — the old man fighting for Baba from the other world
        id: 'masked', name: 'Masked Fighter', short: 'MASKED', kiCost: 30, style: 'full',
        aura: { color: 0xfff0a0, core: 0xffffff, particles: 0xfff8c0, idle: 0.3, speed: 1.2 },
        mult: { damage: 1.3, speed: 1.1, defense: 1.2, kiRegen: 1.2, chargeRate: 1.1 },
        look: { headExtras: MOUSTACHE.concat(MASK) },
        practiced: practiced('gp_idle'),
      },
    ],
    poses: Object.assign({}, GK.poses, ggPoses, { idle: ggPoses.gp_idle }),
    moves: {
      light: [lt('gpJab', 'g_jabW', 'g_jab', 380, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }), lt('gpPalm', 'g_palmW', 'g_palm', 420, { startup: 5 }), lt('gpKick', 'g_lowKickW', 'g_lowKick', 480, { startup: 6, reach: 1.3, recovery: 13, hitstun: 24, knock: 'push', knockSpeed: 12, hitPose: 'hitBody' })],
      heavy: { 0: hv('gpPalmHeavy', 'g_palmW', 'g_palmBoth', 980, { startup: 10, knock: 'heavy', knockSpeed: 28 }) },
      dash: hv('gpDart', 'g_jabW', 'g_jab', 640, { startup: 4, active: 8, recovery: 14, lunge: 36, hitstun: 24, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'gpToss', name: 'Old Man\'s Throw', damage: 900, knockSpeed: 30, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      special1: {
        id: 'gpKame', name: 'Kamehameha', type: 'beam', kiCost: 28, icon: 'beam',
        chargeMin: 22, chargeMax: 80, tiers: [22, 60], damage: [1400, 2400], radius: [0.5, 0.95], speed: 98, range: 145, sustain: 32,
        color: 0x5ab8ff, core: 0xeaf6ff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 22, sound: 'kame', callout: ['KAMEHAME', 'HA!'],
      },
      // JAN KEN: rock, scissors, paper — the game he taught his grandson
      special2: {
        id: 'gpJanKen', name: 'Jan Ken', type: 'rush', kiCost: 26, icon: 'rush',
        startup: 8, dashFrames: 18, speed: 60, recovery: 22, poses: { wind: 'g_crossW' },
        hits: [
          { pose: 'g_cross', damage: 600, frames: 10, sfx: 'punchHeavy' },
          { pose: 'twoFingers', damage: 500, frames: 9, sfx: 'punchLight' },
          { pose: 'g_palm', damage: 1100, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 30, impact: 3 },
        ],
      },
      ultimate: {
        id: 'gpFullKame', name: 'Full Power Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 44, chargeMax: 44, damage: [3800, 3800], radius: [1.3, 1.3], speed: 104, range: 160, sustain: 40,
        color: 0x5ab8ff, core: 0xf0f8ff, poses: { charge: 'g_kameCharge', fire: 'g_kameFire' }, recovery: 30, sound: 'kame', callout: ['KAMEHAME', 'HA!'],
      },
    },
    ai: { personality: 'martial', aggression: 0.55, defense: 0.65, ranged: 0.4, beam: 0.4, transformHp: 0.5, preferredRange: 2.6 },
    ...end('gp_idle', 'calm'),
  };

  /* ============================================================== YOUNG CHI-CHI */
  // (2026-10-16, the owner's correction of the board p.194: its LEFT figure is the 23rd World Tournament Chi-Chi, its
  // RIGHT one the child. This body is the child, in the agreed covered version of the helmet armour: the pink helmet with
  // its silver rim, stone and curved silver blade; long straight hair and blunt bangs under it; a blue bodysuit under a
  // blue breastplate edged in silver; long pink gloves and knee boots banded in teal; the teal choker and cape. The
  // 23rd World Tournament dress is a wardrobe outfit with its own grown body — src/data/wardrobe.js, profile young_chichi)
  const CC_SKIN = 0xf6d0b0, CC_PINK = 0xf08ac8, CC_PLATE = 0x2a66c8, CC_SUIT = 0x1e4aa6, CC_TEAL = 0x2a9a9a, CC_SILVER = 0xb4bccb, CC_STONE = 0x5ac0d8;
  const ccBands = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? 'L' : 'R';
    // the glove runs on past the elbow and ends in a teal band; the boot's knee band and the silver strap at the ankle
    ccBands.push(
      { id: 'glove' + sd, joint: 'elbow' + sd, shape: 'cuff', pos: [0, 0.075, 0], radius: 0.039, radiusBottom: 0.035, length: 0.075, color: CC_PINK, outline: 0.5 },
      { id: 'gloveBand' + sd, joint: 'elbow' + sd, shape: 'cuff', pos: [0, 0.085, 0], radius: 0.042, length: 0.022, color: CC_TEAL, outline: 0.5 },
      { id: 'ankle' + sd, joint: 'knee' + sd, shape: 'cuff', pos: [0, -0.27, 0], radius: 0.066, radiusBottom: 0.064, length: 0.026, color: CC_PLATE, outline: 0.5 },
    );
  }
  C.young_chichi = {
    id: 'young_chichi', assetLevel: 1, name: 'Chi-Chi (young)', fullName: 'Chi-Chi (original series)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Ox Princess · Speed',
    card: ['Dragon Ball', 'The Ox-King\'s daughter'],
    blurb: 'The Ox-King\'s daughter, in the helmet with the blade on top — and quicker with a kick than anyone expects.',
    ratings: { power: 2, speed: 4, ki: 2, defense: 2 },
    stats: { hp: 11000, ki: 100, stamina: 120, speed: 1.12, power: 0.85, defense: 0.85, weight: 0.8, kiRegen: 2.2, chargeRate: 32, canonPower: 0.1 },
    appearance: {
      height: 0.84, skin: CC_SKIN,
      // a child's proportions: a larger head, shorter limbs and neck, narrow shoulders (Gotenks' way: the height stays,
      // since it is also the fighter's scale in play)
      build: {
        chestW: 0.15, chestD: 0.108, chestTop: 0.25, shoulderX: 0.15, shoulderY: 0.2, delt: 0.048, waistW: 0.106, waistD: 0.088, absLen: 0.17,
        pelvisW: 0.13, pelvisD: 0.104, hipX: 0.078, upperArmLen: 0.22, foreArmLen: 0.2, upperArmR: 0.035, foreArmR: 0.031, fist: 0.038,
        thighLen: 0.36, shinLen: 0.34, thighR: 0.064, shinR: 0.049, hipY: 0.84, neckR: 0.038, neckLen: 0.04, headR: 0.148, footLen: 0.85,
      },
      hair: { style: 'chichi_kid', color: 0x141418 },
      // the helmet: a pink dome tipped back off the brow, its silver rim, the stone at the front of the rim and the curved
      // blade standing on top from the brow to the back
      props: [
        { id: 'helmet', joint: 'head', shape: 'shell', pos: [0, 0.17, -0.008], rot: [-0.38, 0, 0], size: [0.162, 0.158, 0.168], spread: Math.PI * 2, drop: 1.6, color: CC_PINK, inner: 0x1a1a20, outline: 0.7 },
        { id: 'helmetRim', joint: 'head', shape: 'neckRing', pos: [0, 0.168, -0.009], rot: [-0.38, 0, 0], radius: 0.163, depth: 1.04, thick: 0.06, color: CC_SILVER, outline: 0.4 },
        { id: 'stone', joint: 'head', shape: 'ball', pos: [0, 0.231, 0.155], rot: [-0.38, 0, 0], size: [0.021, 0.021, 0.011], color: CC_SILVER, outline: 0.4 },
        { id: 'stoneCore', joint: 'head', shape: 'ball', pos: [0, 0.234, 0.163], rot: [-0.38, 0, 0], size: [0.012, 0.012, 0.006], color: CC_STONE, outline: 0 },
        { id: 'blade', joint: 'head', shape: 'crescent', pos: [0, 0.2, -0.02], rot: [0, Math.PI / 2, 0], radius: 0.21, angle: 2.3, width: 0.45, thick: 0.012, color: CC_SILVER, outline: 0.5 },
        { id: 'choker', joint: 'neck', shape: 'neckRing', pos: [0, 0.012, 0.004], radius: 0.046, thick: 0.3, color: CC_TEAL },
        // the breastplate's silver edging, laid on its surface: the neckline in a V, down the middle, and along the bottom
        ...[1, -1].map((s) => ({ id: 'edgeV' + (s > 0 ? 'L' : 'R'), joint: 'chest', shape: 'strip', path: [[s * 0.088, 0.256, 0.128], [s * 0.045, 0.207, 0.158], [0, 0.163, 0.163]], width: 0.012, thick: 0.006, color: CC_SILVER, outline: 0.3 })),
        { id: 'edgeMid', joint: 'chest', shape: 'strip', path: [[0, 0.163, 0.163], [0, 0.06, 0.146]], width: 0.01, thick: 0.006, color: CC_SILVER, outline: 0.3 },
        { id: 'edgeLow', joint: 'chest', shape: 'strip', path: [[-0.125, 0.06, 0.092], [-0.09, 0.06, 0.122], [-0.045, 0.06, 0.14], [0, 0.06, 0.145], [0.045, 0.06, 0.14], [0.09, 0.06, 0.122], [0.125, 0.06, 0.092]], width: 0.012, thick: 0.006, color: CC_SILVER, outline: 0.3 },
      ].concat(ccBands),
      face: { pupil: 0x141414, eyeW: 1.35, eyeH: 1.38, lashWing: true, browThick: 0.45, jaw: 0.88, jawW: 0.94, cheeks: 0.3, nose: 0.6 },
      outfit: {
        topStyle: 'armor', top: CC_SUIT, arms: CC_SKIN,
        armor: { plate: CC_PLATE, belly: CC_SUIT, wrap: 3.0 },
        gloves: CC_PINK, wrist: CC_PINK, wristLen: 0.2,
        // the silver line at the hips, where the original's armour ends
        belt: CC_SILVER, beltStyle: 'belt', beltAt: -0.06, beltFit: 0.96, buckle: CC_SILVER, buckleCore: CC_STONE,
        pants: CC_SUIT, pantsStyle: 'tight', boots: CC_PINK, bootStyle: 'saiyan', bootTop: 0.78, bootTrim: CC_TEAL, bootTrimAt: -0.004,
        cape: CC_TEAL, capeSize: [0.55, 0.8], capeOff: 0.06,
      },
      portraitColor: '#f08ac8',
    },
    forms: [base({ color: 0xffd8ec, core: 0xffffff, particles: 0xffe0f0 })],
    poses: Object.assign({}, GK.poses),
    moves: {
      light: [lt('ccJab', 'g_jabW', 'g_jab', 340, { startup: 4, recovery: 10, cancel: 6, sfx: 'punchLight' }), lt('ccKick', 'g_kickW', 'g_kick', 400, { startup: 5, reach: 1.35, recovery: 11, cancel: 7 }), lt('ccSpin', 'g_spinKickW', 'g_spinKick', 480, { startup: 6, reach: 1.4, recovery: 13, hitstun: 24, knock: 'push', knockSpeed: 12, impact: 2 })],
      heavy: { 0: hv('ccAxe', 'g_axeKickW', 'g_axeKick', 880, { knock: 'smash', knockSpeed: 30 }) },
      dash: hv('ccDive', 'g_flyingKnee', 'g_flyingKnee', 620, { startup: 3, active: 8, recovery: 12, lunge: 42, hitstun: 24, hitPose: 'hitBody' }),
      throw: { id: 'ccToss', name: 'Princess Throw', damage: 900, knockSpeed: 30, poses: ['grab', 'kickWindR', 'kickR'] },
    },
    specials: {
      // HELMET SLASHER: the blade on her helmet, thrown like a disc
      special1: {
        id: 'ccSlasher', name: 'Helmet Slasher', type: 'projectile', kiCost: 22, icon: 'ball', fromHead: true, cooldown: 80,
        startup: 12, recovery: 16, pose: { wind: 'throwWind', release: 'throwRelease' },
        projectile: { kind: 'disc', speed: 66, radius: 0.55, damage: 1300, homing: 0.4, color: 0xd8dce4, core: 0xffffff, explode: 1.5, knock: 'heavy', knockSpeed: 18, impact: 3, life: 2.4 },
      },
      special2: {
        id: 'ccCombo', name: 'Ox Princess Combo', type: 'rush', kiCost: 24, icon: 'rush',
        startup: 6, dashFrames: 18, speed: 70, recovery: 20, poses: { wind: 'g_kickW' },
        hits: [{ pose: 'g_kick', damage: 420, frames: 8, sfx: 'punchLight' }, { pose: 'g_spinKick', damage: 460, frames: 9, sfx: 'punchHeavy' }, { pose: 'g_axeKick', damage: 1000, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 3 }],
      },
      ultimate: {
        id: 'ccDynamite', name: 'Dynamite Kick', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 8, dashFrames: 22, speed: 78, recovery: 28, poses: { wind: 'g_kickW' },
        hits: [{ pose: 'g_kick', damage: 600, frames: 7, sfx: 'punchHeavy' }, { pose: 'g_spinKick', damage: 650, frames: 8, sfx: 'punchHeavy' }, { pose: 'g_flyingKnee', damage: 2400, frames: 18, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 38, impact: 4 }],
      },
    },
    ai: { personality: 'aggressive', aggression: 0.66, defense: 0.45, ranged: 0.3, beam: 0, transformHp: 0, preferredRange: 2.2 },
    ...end('stand', 'angry'),
  };

  /* ============================================================== LAUNCH */
  const LA_SKIN = 0xf6d0b0;
  C.launch = {
    id: 'launch', assetLevel: 1, name: 'Launch', fullName: 'Launch (both of her)', era: 'Dragon Ball',
    playable: true, prototype: true, style: 'Sneeze · Two Personalities',
    card: ['Dragon Ball', 'One sneeze apart'],
    blurb: 'Sweet, blue-haired Launch keeps house at the Kame House. One sneeze, and the blonde one is holding a gun.',
    ratings: { power: 2, speed: 3, ki: 2, defense: 2 },
    stats: { hp: 11000, ki: 100, stamina: 110, speed: 1.04, power: 0.8, defense: 0.85, weight: 0.8, kiRegen: 2.2, chargeRate: 30, canonPower: 0.1 },
    appearance: {
      height: 0.92, skin: LA_SKIN,
      build: { chestW: 0.175, chestD: 0.12, shoulderX: 0.175, waistW: 0.105, waistD: 0.095, pelvisW: 0.14, upperArmR: 0.043, foreArmR: 0.037, fist: 0.042, thighR: 0.074, shinR: 0.055, headR: 0.122, neckR: 0.045 },
      // (2026-10-15 visual pass, the board p.190: her own full wavy hair, `launch`, and the headband's big red bow)
      hair: { style: 'launch', color: 0x2a3ab8 },
      face: { pupil: 0x2a3ab8, eyeW: 1.12, eyeH: 1.12, lashWing: true, browThick: 0.8, brow: 0x2a3ab8, jaw: 0.94 },
      outfit: {
        topStyle: 'shirt', top: 0x6ac83a, sleeves: 'none', arms: LA_SKIN, headband: 0xd81e2a, gloves: 0x8a5a2a,
        belt: 0xe8641a, beltStyle: 'belt', pants: 0xf0d040, pantsStyle: 'tight', thighs: LA_SKIN, legs: 0x3ab83a, boots: 0xd81e2a, bootStyle: 'shoe',
      },
      // the headband tied in a big red bow on top, at her left
      props: [
        { id: 'bowKnot', joint: 'head', shape: 'ball', pos: [0.085, 0.235, 0.03], size: [0.022, 0.02, 0.02], color: 0xd81e2a, outline: 0.4 },
        { id: 'bowLoopA', joint: 'head', shape: 'tri', pos: [0.12, 0.26, 0.02], rot: [0, 0.3, 2.3], size: [0.035, 0.06, 0.012], color: 0xd81e2a, outline: 0.4 },
        { id: 'bowLoopB', joint: 'head', shape: 'tri', pos: [0.05, 0.27, 0.02], rot: [0, 0.3, -2.0], size: [0.03, 0.055, 0.012], color: 0xd81e2a, outline: 0.4 },
      ],
      portraitColor: '#2a3ab8',
    },
    forms: [
      { id: 'base', name: 'Blue Launch', aura: { color: 0xc8d8ff, core: 0xffffff, particles: 0xd8e4ff }, mult: {} },
      {
        // A SNEEZE: the blonde Launch — the guns come out
        id: 'blonde', name: 'Blonde Launch', short: 'ACHOO!', kiCost: 10, style: 'quick',
        aura: { color: 0xffe07a, core: 0xffffff, particles: 0xfff0a0, idle: 0.3, speed: 1.4, sharp: 0.3 },
        mult: { damage: 1.5, speed: 1.12, defense: 1.0, kiRegen: 1.3, chargeRate: 1.2 },
        look: { hair: { style: 'launch', color: 0xf8d860 }, pupil: 0x2a8a3a, brow: 0xe0b840 },
        specials: {
          // SUBMACHINE GUN: five shots fanned, again and again
          special1: {
            id: 'laSMG', name: 'Submachine Gun', type: 'projectile', kiCost: 14, icon: 'blast', cooldown: 40,
            startup: 6, recovery: 10, pose: { wind: 'blastWind', release: 'blastR' },
            projectile: { kind: 'blast', count: 5, spread: 0.3, speed: 110, radius: 0.16, damage: 300, homing: 0.05, color: 0xfff0a0, core: 0xffffff, explode: 0.6, knock: 'flinch', knockSpeed: 6, impact: 1, life: 1.2 },
          },
          // GRENADE: lobbed, and it goes off where it lands
          special2: {
            id: 'laGrenade', name: 'Grenade', type: 'projectile', kiCost: 20, icon: 'bomb', cooldown: 90,
            startup: 12, recovery: 16, pose: { wind: 'throwWind', release: 'throwRelease' },
            projectile: { kind: 'ball', speed: 40, radius: 0.35, damage: 1400, homing: 0.6, color: 0x5a6a3a, core: 0xffd060, explode: 5, knock: 'heavy', knockSpeed: 22, impact: 3, life: 2.4 },
          },
          // BAZOOKA: the big one, on her shoulder
          ultimate: {
            id: 'laBazooka', name: 'Bazooka', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true,
            startup: 30, recovery: 30, pose: { wind: 'throwWind', release: 'blastR' },
            projectile: { kind: 'heavy', speed: 60, radius: 1.2, damage: 3800, homing: 0.5, color: 0xff8a2a, core: 0xfff0c0, explode: 10, knock: 'smash', knockSpeed: 40, impact: 5, life: 3 },
          },
        },
      },
    ],
    poses: Object.assign({}, GK.poses),
    moves: {
      light: [lt('laSlap', 'punchWindR', 'punchR', 280, { startup: 5, recovery: 11, cancel: 7, sfx: 'punchLight' }), lt('laSlap2', 'punchWindL', 'punchL', 300, { startup: 5, recovery: 11, cancel: 7, sfx: 'punchLight' }), lt('laKick', 'kickWindR', 'kickR', 380, { startup: 6, reach: 1.3, recovery: 13 })],
      heavy: { 0: hv('laTray', 'chopW', 'chop', 760, { knock: 'heavy', knockSpeed: 24 }) },
      dash: hv('laDash', 'punchWindR', 'punchR', 480, { startup: 4, active: 8, recovery: 14, lunge: 32, hitstun: 22, knock: 'push', knockSpeed: 14, hitPose: 'hitBody' }),
      throw: { id: 'laToss', name: 'Out of the Kitchen', damage: 700, knockSpeed: 28, poses: ['grab', 'throwWind', 'throwRelease'] },
    },
    specials: {
      // PEPPER: a handful thrown in your face (and it makes her sneeze too, if she is not careful)
      special1: {
        id: 'laPepper', name: 'Pepper Throw', type: 'projectile', kiCost: 12, icon: 'ball', cooldown: 60,
        startup: 10, recovery: 14, pose: { wind: 'throwWind', release: 'throwRelease' },
        projectile: { kind: 'blast', count: 3, spread: 0.3, speed: 60, radius: 0.3, damage: 380, homing: 0.3, color: 0xc8a070, core: 0xf0e0c0, explode: 1.2, knock: 'flinch', knockSpeed: 6, impact: 1, life: 1.4 },
      },
      special2: {
        id: 'laRun', name: 'Run Away', type: 'teleport', kiCost: 10, icon: 'teleport',
        startup: 6, recovery: 8, cooldown: 50, escapeKiCost: 20, followWindow: 20, followBonus: 1.1, pose: 'g_kickW',
        modes: { away: true },
      },
      ultimate: {
        id: 'laFlurry', name: 'Flustered Flurry', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
        startup: 8, dashFrames: 18, speed: 60, recovery: 28, poses: { wind: 'punchWindR' },
        hits: [{ pose: 'punchR', damage: 500, frames: 7, sfx: 'punchLight' }, { pose: 'punchL', damage: 500, frames: 7, sfx: 'punchLight' }, { pose: 'chop', damage: 600, frames: 8, sfx: 'punchHeavy' }, { pose: 'hammer', damage: 1800, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 32, impact: 4 }],
      },
    },
    ai: { personality: 'adaptive', aggression: 0.5, defense: 0.55, ranged: 0.55, beam: 0, transformHp: 0.9, preferredRange: 4 },
    ...end('stand', 'soft'),
  };

  /* ============================================================== SUPPORT ROLES (models, not fighters) */
  // story, training and side-content roles (the board's own guidance); not offered in Free Battle
  const supportDef = (id, name, era, o) => Object.assign({
    id, assetLevel: 1, name, playable: false, support: true, prototype: true, era,
    stats: { hp: 6000, ki: 60, stamina: 100, speed: 1, power: 0.3, defense: 0.5, weight: 0.8, kiRegen: 1, chargeRate: 20, canonPower: 0.05 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff }, mult: {} }],
    moves: { light: [], heavy: {} },
    specials: {},
  }, o);
  const stand = (t) => ({ root: { y: Math.sin(t * 1.5) * 0.004 }, spine: [0, 0, 0], chest: [-2, 0, 0], head: [-2, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-20, 0, 0], shoulderR: [-6, 0, -14], elbowR: [-20, 0, 0], thighL: [-2, 2, 8], kneeL: [4, 0, 0], thighR: [-2, -2, -8], kneeR: [4, 0, 0], hands: ['open', 'open'] });
  const float = (t) => Object.assign(stand(t), { root: { y: 0.3 + Math.sin(t * 2) * 0.04 }, thighL: [-30, 0, 8], kneeL: [40, 0, 0], thighR: [-30, 0, -8], kneeR: [40, 0, 0] });
  const ears = (color, inner, a, l) => [1, -1].map((s) => ({ a: [s * a[0], a[1], a[2]], d: [s * 0.4, 1, 0], l, r: l * 0.45, color, depth: 0.98, outline: 0.5 })).concat(inner ? [1, -1].map((s) => ({ a: [s * a[0], a[1], a[2] + 0.06], d: [s * 0.4, 1, 0.1], l: l * 0.6, r: l * 0.25, color: inner, depth: 1.0, outline: 0 })) : []);

  C.korin = supportDef('korin', 'Korin', 'Dragon Ball', {
    fullName: 'Korin (the Sacred Land\'s cat)', blurb: 'The ancient cat at the top of Korin Tower who grows the Senzu Beans. A training role, not a frontline fighter.',
    appearance: {
      height: 0.6, skin: 0xf4f2ec,
      build: { chestW: 0.2, chestD: 0.17, shoulderX: 0.18, waistW: 0.19, waistD: 0.17, upperArmR: 0.05, foreArmR: 0.046, thighR: 0.07, shinR: 0.055, headR: 0.16, neckLen: 0.01 },
      hair: { style: 'bald', color: 0xf4f2ec },
      headExtras: ears(0xf4f2ec, 0xf0a0b0, [0.6, 0.8, 0.1], 0.1).concat([{ shape: 'ball', a: [0, -0.15, 1], d: [0, 0, 1], l: 0.005, r: 0.025, color: 0xf06a7a, depth: 1.03, flat: 0.6, outline: 0.3 }]),
      face: { pupil: 0x141414, eyeW: 0.7, eyeH: 0.3, noEars: true, brow: 0xd8d8d0 },
      outfit: { topStyle: 'bare', top: 0xf4f2ec, pants: 0xf4f2ec, pantsStyle: 'tight', boots: 0xf4f2ec, bootStyle: 'gi', longTail: { color: 0xf4f2ec, segments: 6, length: 0.5, radius: 0.025, lift: 0.5, curl: 0.4 } },
      props: [{ id: 'staff', shape: 'box', joint: 'handR', pos: [0, 0.1, 0.02], size: [0.025, 0.9, 0.025], color: 0x5a3a2a }],
      portraitColor: '#f4f2ec',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'calm' },
  });
  C.ox_king = supportDef('ox_king', 'Ox-King', 'Dragon Ball', {
    fullName: 'Ox-King (Gyū-Maō)', blurb: 'Chi-Chi\'s enormous father: once feared, now mostly worried. Story scenes and early-adventure roles.',
    appearance: {
      height: 1.5, skin: 0xe8b890,
      build: { chestW: 0.29, chestD: 0.22, shoulderX: 0.28, waistW: 0.26, waistD: 0.24, pelvisW: 0.22, upperArmR: 0.08, foreArmR: 0.072, fist: 0.08, thighR: 0.11, shinR: 0.085, headR: 0.13, neckR: 0.09, neckLen: 0.02 },
      hair: { style: 'skullcap', color: 0x1e1e24 },
      headExtras: [
        { a: [0.7, 0.6, 0.1], d: [0.7, 0.8, 0.2], l: 0.13, r: 0.04, color: 0xe0b030, depth: 0.98, outline: 0.6 },
        { a: [-0.7, 0.6, 0.1], d: [-0.7, 0.8, 0.2], l: 0.13, r: 0.04, color: 0xe0b030, depth: 0.98, outline: 0.6 },
        { shape: 'ball', a: [0, -0.6, 0.75], d: [0, -1, 0.3], l: 0.06, r: 0.1, color: 0x3a2214, depth: 0.95, flat: 0.7, outline: 0.4 },
      ],
      face: { pupil: 0x141414, browThick: 1.6, brow: 0x3a2214, jaw: 1.2, jawW: 1.1 },
      outfit: { topStyle: 'shirt', top: 0xf0f0ea, sleeves: 'short', sleeveColor: 0xf0f0ea, wrist: 0x1e1e24, wristLen: 0.08, pants: 0x6a6a3a, pantsStyle: 'harem', boots: 0x1e1e24, bootStyle: 'saiyan' },
      props: [{ id: 'glasses', shape: 'glasses', joint: 'head', pos: [0, 0.1375, 0.126], color: 0x1e1e24 }],
      portraitColor: '#6a6a3a',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'soft' },
  });
  C.upa = supportDef('upa', 'Upa', 'Dragon Ball', {
    fullName: 'Upa (Bora\'s son)', blurb: 'Bora\'s little son, who climbed down from Korin\'s land to fetch help. A story role.',
    appearance: {
      height: 0.56, skin: 0x9a6a4a,
      build: { chestW: 0.15, chestD: 0.11, shoulderX: 0.15, waistW: 0.12, upperArmR: 0.036, foreArmR: 0.032, thighR: 0.056, shinR: 0.044, headR: 0.15 },
      hair: { style: 'gohan_kid', color: 0x141418 },
      headExtras: [{ a: [0.2, 1, -0.1], d: [0.1, 1, -0.1], l: 0.12, r: 0.02, color: 0xf0e8d8, depth: 0.98, outline: 0.4 }],
      face: { pupil: 0x141414, eyeW: 1.1, eyeH: 1.1, jaw: 0.9, cheeks: 1.2 },
      outfit: { topStyle: 'bare', top: 0x9a6a4a, jacket: { color: 0xc8a878, open: 1.5, short: true }, pants: 0x2a4ab8, pantsStyle: 'tight', thighs: 0x9a6a4a, legs: 0x9a6a4a, boots: 0x8a6a4a, bootStyle: 'shoe' },
      portraitColor: '#2a4ab8',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'soft' },
  });
  C.pilaf = supportDef('pilaf', 'Emperor Pilaf', 'Dragon Ball', {
    fullName: 'Emperor Pilaf', blurb: 'A small blue would-be world conqueror forever one Dragon Ball short. Machines, traps and side missions.',
    appearance: {
      height: 0.62, skin: 0x6ac8d8,
      build: { chestW: 0.16, chestD: 0.13, shoulderX: 0.15, waistW: 0.15, upperArmR: 0.038, foreArmR: 0.034, thighR: 0.058, shinR: 0.046, headR: 0.15 },
      hair: { style: 'bald', color: 0x6ac8d8 },
      headExtras: ears(0x6ac8d8, null, [0.85, 0.2, 0], 0.09),
      face: { pupil: 0x141414, browThick: 1.3, brow: 0x2a6a7a, noEars: true, jaw: 1.05 },
      outfit: { topStyle: 'gi', top: 0x1e1e24, sleeves: 'long', sleeveColor: 0x3ac84a, emblem: { text: '飯', fg: '#c81e2a', bg: '#ffffff' }, cap: 0xc82a2a, capBall: 0xd81e2a, capStars: 1, hem: { color: 0x1e1e24, len: 0.24, flare: 1.2 }, pants: 0x2a4ab8, pantsStyle: 'harem', boots: 0xe0b030, bootStyle: 'shoe' },
      props: [{ id: 'ruff', shape: 'neckRing', joint: 'neck', pos: [0, -0.01, 0], radius: 0.1, thick: 0.4, color: 0xe8e8e8 }],
      portraitColor: '#6ac8d8',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'angry' },
  });
  C.shu = supportDef('shu', 'Shu', 'Dragon Ball', {
    fullName: 'Shu (Pilaf\'s ninja)', blurb: 'Pilaf\'s dog-faced ninja, with a sword he is not very good with.',
    appearance: {
      height: 0.72, skin: 0xf08a3a,
      build: { chestW: 0.16, chestD: 0.12, shoulderX: 0.16, waistW: 0.12, upperArmR: 0.04, foreArmR: 0.036, thighR: 0.062, shinR: 0.048, headR: 0.14 },
      hair: { style: 'skullcap', color: 0x6a3ab8 },
      headExtras: ears(0x6a3ab8, null, [0.55, 0.85, 0], 0.12).concat([{ shape: 'ball', a: [0, -0.3, 1], d: [0, 0, 1], l: 0.05, r: 0.07, color: 0xf0d8a0, depth: 0.9, flat: 0.8, outline: 0.4 }]),
      face: { pupil: 0x141414, browThick: 1.2, brow: 0x3a2a1a, noEars: true },
      outfit: { topStyle: 'gi', top: 0x6a3ab8, sleeves: 'long', sleeveColor: 0x6a3ab8, belt: 0xf0f0ea, pants: 0x6a3ab8, pantsStyle: 'tight', boots: 0x3a2a1a, bootStyle: 'shoe' },
      props: [{ id: 'sword', shape: 'katana', joint: 'chest', pos: [0.05, 0.08, -0.16], rot: [0.2, 0, 0.7], length: 0.5 }],
      portraitColor: '#6a3ab8',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'grin' },
  });
  C.mai = supportDef('mai', 'Mai', 'Dragon Ball', {
    fullName: 'Mai (Pilaf\'s agent)', blurb: 'Pilaf\'s cool-headed agent in a long teal coat, the only one of the three who can shoot straight.',
    appearance: {
      height: 0.92, skin: 0xf6d6b8,
      build: { chestW: 0.17, chestD: 0.115, shoulderX: 0.17, waistW: 0.105, waistD: 0.095, pelvisW: 0.135, upperArmR: 0.042, foreArmR: 0.036, thighR: 0.072, shinR: 0.054, headR: 0.12, neckR: 0.045 },
      hair: { style: 'a17', color: 0x4a2a6a },
      face: { pupil: 0x2a6ab8, eyeW: 1.0, eyeH: 0.94, lashWing: true, browThick: 0.8, brow: 0x4a2a6a },
      outfit: { topStyle: 'gi', top: 0x3a9aa8, sleeves: 'long', sleeveColor: 0x3a9aa8, belt: 0x8a4a22, beltStyle: 'belt', buckle: 0xc8c8c8, hem: { color: 0x3a9aa8, len: 0.42, flare: 1.25 }, pants: 0xf0e4c8, pantsStyle: 'tight', gloves: 0x3a2a3a, boots: 0x8a4a22, bootStyle: 'saiyan' },
      props: [{ id: 'rifle', shape: 'rifle', joint: 'handR', pos: [0, -0.04, 0.02] }],
      portraitColor: '#3a9aa8',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'smirk' },
  });
  C.piano = supportDef('piano', 'Piano', 'Dragon Ball', {
    fullName: 'Piano (King Piccolo\'s attendant)', blurb: 'King Piccolo\'s old, hunched servant and counsellor. Built from memory: a story role.',
    appearance: {
      height: 0.78, skin: 0x8ab89a,
      build: { chestW: 0.16, chestD: 0.13, shoulderX: 0.15, waistW: 0.13, upperArmR: 0.036, foreArmR: 0.032, thighR: 0.056, shinR: 0.044, headR: 0.13 },
      hair: { style: 'bald', color: 0x8ab89a },
      headExtras: [{ shape: 'ball', a: [0, -0.1, 1], d: [0, -0.3, 1], l: 0.12, r: 0.04, color: 0x7aa88a, depth: 0.95, flat: 0.8, outline: 0.4 }],
      face: { pupil: 0x141414, browThick: 1.4, brow: 0xd8d8d0, pointedEars: true },
      outfit: { topStyle: 'gi', top: 0x4a2a6a, sleeves: 'long', sleeveColor: 0x4a2a6a, hem: { color: 0x4a2a6a, len: 0.5, flare: 1.3 }, pants: 0x4a2a6a, pantsStyle: 'gi', boots: 0x3a2a1a, bootStyle: 'shoe' },
      portraitColor: '#4a2a6a',
    },
    poses: { idle: (t) => Object.assign(stand(t), { spine: [24, 0, 0], head: [-20, 0, 0] }) },
    intro: { pose: 'idle', expression: 'neutral' },
  });
  C.puar = supportDef('puar', 'Puar', 'Dragon Ball', {
    fullName: 'Puar', blurb: 'Yamcha\'s small blue shapeshifting companion — she floats everywhere. A support role.',
    appearance: {
      height: 0.42, skin: 0x6ab8f0,
      build: { chestW: 0.16, chestD: 0.15, shoulderX: 0.13, waistW: 0.16, waistD: 0.15, upperArmR: 0.03, foreArmR: 0.028, thighR: 0.045, shinR: 0.036, headR: 0.2, neckLen: 0.005 },
      hair: { style: 'bald', color: 0x6ab8f0 },
      headExtras: [1, -1].map((s) => ({ shape: 'ball', a: [s * 0.7, 0.7, 0], d: [s * 0.4, 1, 0], l: 0.02, r: 0.07, color: 0x6ab8f0, depth: 0.98, flat: 0.5, outline: 0.4 })),
      face: { pupil: 0x141414, eyeW: 1.3, eyeH: 1.3, noEars: true, brow: 0x3a7ab8 },
      outfit: { topStyle: 'bare', top: 0x6ab8f0, pants: 0x6ab8f0, pantsStyle: 'tight', boots: 0x6ab8f0, bootStyle: 'gi', longTail: { color: 0x6ab8f0, segments: 6, length: 0.4, radius: 0.02, lift: 0.4, curl: 0.5 } },
      portraitColor: '#6ab8f0',
    },
    poses: { idle: float },
    intro: { pose: 'idle', expression: 'soft' },
  });
  C.oolong = supportDef('oolong', 'Oolong', 'Dragon Ball', {
    fullName: 'Oolong', blurb: 'A shapeshifting pig with a good wish once — for a pair of panties. Built from memory: a support role.',
    appearance: {
      height: 0.6, skin: 0xf4b0b0,
      build: { chestW: 0.17, chestD: 0.15, shoulderX: 0.16, waistW: 0.17, waistD: 0.16, upperArmR: 0.04, foreArmR: 0.036, thighR: 0.06, shinR: 0.048, headR: 0.16, neckLen: 0.01 },
      hair: { style: 'bald', color: 0xf4b0b0 },
      headExtras: ears(0xf4b0b0, null, [0.65, 0.6, 0.1], 0.08).concat([{ shape: 'ball', a: [0, -0.2, 1], d: [0, 0, 1], l: 0.04, r: 0.06, color: 0xf09a9a, depth: 0.95, flat: 0.6, outline: 0.4 }]),
      face: { pupil: 0x141414, browThick: 1.0, brow: 0x8a4a4a, noEars: true },
      outfit: { topStyle: 'shirt', top: 0x3a7a3a, sleeves: 'short', sleeveColor: 0x3a7a3a, pants: 0x2a3a6a, pantsStyle: 'harem', boots: 0x3a2a1a, bootStyle: 'shoe' },
      portraitColor: '#f4b0b0',
    },
    poses: { idle: stand },
    intro: { pose: 'idle', expression: 'grin' },
  });
})();
