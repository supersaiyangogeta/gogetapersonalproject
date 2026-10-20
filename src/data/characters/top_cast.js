/*
 * THE GODS ABOVE THE GODS (Dragon Ball Super: the end of the Universe 6 tournament and the Tournament of Power) —
 * story cast, Level 1 functional prototypes built from the owner's Tournament of Power reference (Tournament of
 * power ui.docx and the supplied stills): shapes and colours, not production art.
 *
 *   ZENO        the King of Everything (Zen-Oh): child-sized, an enormous egg-shaped pale blue head with two violet
 *               patches on its sides, two tiny round black eyes, a magenta robe with a yellow collar and front panel.
 *               He claps and throws both hands up every time something big happens.
 *   GRAND PRIEST the angels' father: small, pale blue, a swept white crest of hair, the angels' halo-collar, a deep
 *               blue robe with a red sash; he referees from a floating spinning-top dais (stage_top.js).
 *
 * Neither fights: cinematicOnly story characters.
 */
(function () {
  'use strict';
  const C = SL.data.poses;

  const P = {
    // ZENO: standing, arms hanging, a gentle side-to-side rock
    zn_idle: (t) => {
      const s = Math.sin(t * 1.8);
      return { root: { y: s * 0.004, rz: s * 2 }, spine: [-2, 0, 0], chest: [-2, 0, 0], head: [0, 0, -s * 3], shoulderL: [-6, 0, 18], elbowL: [-24, 0, 0], shoulderR: [-6, 0, -18], elbowR: [-24, 0, 0], thighL: [-2, 0, 5], kneeL: [3, 0, 0], thighR: [-2, 0, -5], kneeR: [3, 0, 0], hands: ['open', 'open'] };
    },
    // ZENO: both hands thrown up, bouncing ("so much fun!")
    zn_cheer: (t) => {
      const s = Math.abs(Math.sin(t * 7));
      return { root: { y: 0.03 + s * 0.05 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-10, 0, 0], shoulderL: [-160, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-160, 0, -20], elbowR: [-20, 0, 0], thighL: [-8, 0, 6], kneeL: [10, 0, 0], thighR: [-8, 0, -6], kneeR: [10, 0, 0], hands: ['open', 'open'] };
    },
    // ZENO: a little clap in front of the chest
    zn_clap: (t) => {
      const s = Math.sin(t * 14);
      return { root: { y: 0 }, spine: [-2, 0, 0], chest: [-2, 0, 0], head: [-4, 0, 0], shoulderL: [-70, 0, 10 + s * 12], elbowL: [-50, 0, 0], shoulderR: [-70, 0, -10 - s * 12], elbowR: [-50, 0, 0], thighL: [-2, 0, 5], kneeL: [3, 0, 0], thighR: [-2, 0, -5], kneeR: [3, 0, 0], hands: ['open', 'open'] };
    },
    // THE GRAND PRIEST: upright, hands folded behind the back
    gp_idle: (t) => {
      const b = Math.sin(t * 1.2);
      return { root: { y: b * 0.003 }, spine: [-2, 0, 0], chest: [-3, 0, 0], head: [2, 0, 0], shoulderL: [28, 0, 16], elbowL: [-64, 0, 0], shoulderR: [28, 0, -16], elbowR: [-64, 0, 0], thighL: [-1, 0, 4], kneeL: [2, 0, 0], thighR: [-1, 0, -4], kneeR: [2, 0, 0], hands: ['open', 'open'] };
    },
    // THE GRAND PRIEST: one hand raised, announcing
    gp_announce: { root: { y: 0 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-4, 0, 0], shoulderR: [-120, 0, -20], elbowR: [-30, 0, 0], shoulderL: [28, 0, 16], elbowL: [-64, 0, 0], thighL: [-1, 0, 4], kneeL: [2, 0, 0], thighR: [-1, 0, -4], kneeR: [2, 0, 0], hands: ['open', 'open'] },
  };
  Object.assign(C, P);

  const story = (id, def) => Object.assign({
    id, assetLevel: 1, era: 'Super', playable: false, cinematicOnly: true,
    stats: { hp: 20000, ki: 120, stamina: 120, speed: 1, power: 0.2, defense: 1, weight: 1, kiRegen: 3, chargeRate: 30, canonPower: 1 },
    moves: { light: [], heavy: {} },
    specials: {},
  }, def);

  /* ======================================================================== ZENO */
  {
    const SKIN = 0x7ab8e0, PATCH = 0x8a3ad0, PATCH2 = 0x5a1a9a, ROBE = 0xc8306e, GOLD = 0xf0c040, PANEL = 0x8a8a92;
    SL.data.characters.zeno = story('zeno', {
      name: 'Zeno', fullName: 'Zeno (the King of Everything)',
      appearance: {
        height: 0.62, skin: SKIN,
        // a child's body under a huge head: short legs and arms, a small round trunk
        build: {
          hipY: 0.5, thighLen: 0.22, shinLen: 0.2, absLen: 0.12, chestH: 0.13, chestTop: 0.2, shoulderY: 0.16,
          chestW: 0.16, chestD: 0.14, shoulderX: 0.15, waistW: 0.15, waistD: 0.13, pelvisW: 0.15, pelvisD: 0.13,
          upperArmLen: 0.16, foreArmLen: 0.15, upperArmR: 0.036, foreArmR: 0.032, fist: 0.038, thighR: 0.06, shinR: 0.05,
          headR: 0.26, neckLen: 0.01,
        },
        hair: { style: 'bald', color: SKIN },
        // the violet bands down both sides of the egg-shaped head (a lighter band, a darker edge)
        headExtras: [
          { shape: 'ball', a: [1, 0.08, 0], d: [1, 0, 0], l: 0.06, r: 0.22, color: PATCH, depth: 0.84, flat: 0.62, outline: 0.4 },
          { shape: 'ball', a: [-1, 0.08, 0], d: [-1, 0, 0], l: 0.06, r: 0.22, color: PATCH, depth: 0.84, flat: 0.62, outline: 0.4 },
          { shape: 'ball', a: [1, 0.08, 0], d: [1, 0, 0], l: 0.05, r: 0.19, color: PATCH2, depth: 0.9, flat: 0.4, outline: 0.3 },
          { shape: 'ball', a: [-1, 0.08, 0], d: [-1, 0, 0], l: 0.05, r: 0.19, color: PATCH2, depth: 0.9, flat: 0.4, outline: 0.3 },
        ],
        face: { pupil: 0x0a0a10, sclera: 0xffffff, eyeW: 1.25, eyeH: 1.3, brow: SKIN, browThick: 0.2, jaw: 0.9, jawW: 1.05, nose: 0.3, noEars: true },
        outfit: {
          topStyle: 'shirt', top: PANEL, sleeves: 'long', sleeveColor: GOLD, arms: GOLD,
          jacket: { color: ROBE, open: 0.9, collar: GOLD },
          collar: GOLD, collarStyle: 'turtle',
          apron: { color: ROBE, trim: GOLD, len: 0.36, width: 0.16 },
          belt: GOLD, beltStyle: 'sash',
          pants: ROBE, pantsStyle: 'gi',
          boots: 0x2a2440, bootStyle: 'gi',
        },
        portraitColor: '#c8306e',
      },
      flight: false,
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xffffff, core: 0xffffff, particles: 0xe0e8ff }, mult: {} }],
      poses: Object.assign({ idle: P.zn_idle }, P),
      intro: { pose: 'zn_idle', expression: 'calm' },
    });
  }

  /* ======================================================================== THE GRAND PRIEST */
  {
    const SKIN = 0xa8c4e8, HAIR = 0xf0f2f8, ROBE = 0x1e6a76, SASH = 0x175660;
    SL.data.characters.grandpriest = story('grandpriest', {
      name: 'Grand Priest', fullName: 'The Grand Priest',
      appearance: {
        height: 0.84, skin: SKIN,
        build: { chestW: 0.15, chestD: 0.11, shoulderX: 0.16, waistW: 0.11, upperArmR: 0.038, foreArmR: 0.034, fist: 0.04, thighR: 0.06, shinR: 0.048, headR: 0.13, neckLen: 0.06 },
        // the white hair swept straight back into a short crest
        headExtras: [
          { shape: 'ball', a: [0, 0.7, -0.15], d: [0, 0.8, -0.6], l: 0.14, r: 0.11, flat: 0.9, depth: 0.85, color: HAIR, outline: 0.6 },
          { a: [0, 0.85, -0.25], d: [0, 0.6, -1], l: 0.24, r: 0.08, flat: 0.85, depth: 0.88, color: HAIR, outline: 0.6 },
        ],
        hair: { style: 'bald', color: HAIR },
        face: { pupil: 0x4a3a8a, eyeW: 0.9, eyeH: 0.85, brow: HAIR, browThick: 0.9, jaw: 0.95, nose: 0.7 },
        outfit: {
          topStyle: 'shirt', top: ROBE, sleeves: 'long', sleeveColor: ROBE, arms: ROBE,
          collar: 0xd8b040, belt: SASH, beltStyle: 'sash',
          apron: { color: ROBE, trim: SASH, len: 0.5, width: 0.2 },
          pants: ROBE, pantsStyle: 'gi', boots: 0x101018, bootStyle: 'gi',
        },
        props: [
          // the halo: a ring standing upright behind the head, framing it from the front
          { id: 'halo', shape: 'neckRing', joint: 'head', pos: [0, 0.12, -0.11], rot: [-Math.PI / 2, 0, 0], radius: 0.21, thick: 0.05, color: 0x9ae4f0 },
          // the orange triangle on the chest, point down (the reference)
          { id: 'mark', shape: 'tri', joint: 'chest', pos: [0, 0.075, 0.108], rot: [-0.12, 0, 0], size: [0.042, 0.04, 0.012], color: 0xe8801e },
        ],
        portraitColor: '#1e6a76',
      },
      flight: true,
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xdff2ff, core: 0xffffff, particles: 0xcfe9ff }, mult: {} }],
      poses: Object.assign({ idle: P.gp_idle }, P),
      intro: { pose: 'gp_idle', expression: 'calm' },
    });
  }

  /* ======================================================================== KALE (Universe 6) */
  // Playable after "The Berserker" (top_saiyans). Timid in base: shoulders drawn in, the hands near the chest, the eyes
  // half hidden under a long fringe; black hair tied back in a thick ponytail. A red sleeveless dress over purple
  // shorts, a brown belt, yellow wristbands and boots. BERSERK (her Legendary Super Saiyan): the body swells far past
  // her size, the hair snaps up into a towering lime-green mane, the eyes go blank white — slow, armoured, overwhelming.
  {
    const H = SL.data.hair;
    // the hand-shaped groups: a messy crown, the long fringe over the left eye, the thick ponytail down the back
    H.kale = {
      cap: { tilt: -0.4, sx: 1.04, sy: 1.06, sz: 1.06 },
      spikes: [
        { a: [0.1, 0.98, 0.1], d: [0.2, 0.9, -0.35], l: 0.14, r: 0.06 },
        { a: [-0.2, 0.95, 0.05], d: [-0.3, 0.85, -0.4], l: 0.14, r: 0.06 },
        { a: [0, 0.75, -0.6], d: [0, 0.4, -1], l: 0.12, r: 0.07 },
        // the ponytail: tied high at the back, a thick lock down to the shoulder blades
        { shape: 'ball', a: [0, 0.45, -0.95], d: [0, 0, -1], l: 0.02, r: 0.035, depth: 1.02, color: 0x8a2a3a },
        { a: [0, 0.42, -1], d: [0, -0.9, -0.42], l: 0.36, r: 0.075 },
        // the long fringe falling over the left eye, and a shorter one on the right
        { a: [-0.32, 0.72, 0.62], d: [-0.12, -1, 0.42], l: 0.17, r: 0.05, depth: 1.0 },
        { a: [-0.05, 0.78, 0.62], d: [-0.2, -1, 0.45], l: 0.15, r: 0.046, depth: 1.0 },
        { a: [0.3, 0.74, 0.6], d: [0.3, -1, 0.4], l: 0.1, r: 0.04, depth: 1.0 },
      ],
      mirror: [
        { a: [0.62, 0.7, -0.1], d: [0.8, 0.5, -0.4], l: 0.12, r: 0.056 },
        { a: [0.85, 0.3, 0.3], d: [0.4, -1, 0.15], l: 0.13, r: 0.036, depth: 1.0 },
      ],
    };
    // CONTROLLED: the same green mane, closer to the head and less wild — the power held, not loose
    H.kale_ctrl = { cap: { tilt: -0.3, sx: 1.04, sy: 1.06, sz: 1.05 }, glow: 0x0e3a04, spikes: H.broly_ssj.spikes, mirror: H.broly_ssj.mirror };
    // BERSERK: a towering lime-green mane, flared up and back (Broly's Legendary cut, wilder)
    H.kale_berserk = (() => {
      const grow = (s) => ({ ...s, l: s.l * (s.depth === 1.0 ? 1 : 1.22), r: s.r * (s.depth === 1.0 ? 1 : 1.08) });
      return { cap: { tilt: -0.42, sx: 1.1, sy: 1.14, sz: 1.12 }, glow: 0x0e3a04, spikes: H.broly_ssj.spikes.map(grow), mirror: H.broly_ssj.mirror.map(grow) };
    })();

    const SKIN = 0xf0c8a0, RED = 0xb8283a, PURPLE = 0x4a2a6a, GOLD = 0xe8c040;
    const KP = {
      // timid: the shoulders drawn in, both hands up near the chest, the head a little down
      ka_shy: (t) => {
        const b = Math.sin(t * 2);
        return { root: { y: -0.02 + b * 0.004 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [10, -6, 0], shoulderL: [-30, 20, 10], elbowL: [-120, 0, 0], shoulderR: [-30, -20, -10], elbowR: [-120, 0, 0], thighL: [-4, 8, 4], kneeL: [10, 0, 0], thighR: [-4, -8, -4], kneeR: [10, 0, 0], hands: ['fist', 'fist'] };
      },
      // berserk: hunched huge, arms hanging wide, rocking with every breath
      ka_berserk: (t) => {
        const b = Math.sin(t * 1.6);
        return { root: { y: -0.08 + b * 0.012 }, spine: [16, 0, 0], chest: [12, 0, 0], head: [-10, 0, 0], shoulderL: [-20, 0, 36], elbowL: [-40, 0, 0], shoulderR: [-20, 0, -36], elbowR: [-40, 0, 0], thighL: [-20, 0, 18], kneeL: [26, 0, 0], thighR: [-20, 0, -18], kneeR: [26, 0, 0], hands: ['fist', 'fist'] };
      },
      // the roar: head back, arms flung wide and down
      ka_roar: (t) => {
        const s = Math.sin(t * 30) * 2;
        return { root: { y: -0.06, rx: -10 }, spine: [-10, 0, 0], chest: [-18, 0, 0], head: [-30 + s, 0, 0], shoulderL: [10, 0, 60], elbowL: [-30, 0, 0], shoulderR: [10, 0, -60], elbowR: [-30, 0, 0], thighL: [-22, 0, 20], kneeL: [28, 0, 0], thighR: [-22, 0, -20], kneeR: [28, 0, 0], hands: ['fist', 'fist'] };
      },
      // controlled: upright and set, guard up, the weight balanced — the shyness gone, the wildness too
      ka_ctrl: (t) => {
        const b = Math.sin(t * 2.2);
        return { root: { y: -0.04 + b * 0.005 }, spine: [4, 0, 0], chest: [2, 12, 0], head: [-4, -10, 0], shoulderL: [-50, 20, 22], elbowL: [-104, 0, 0], shoulderR: [-30, -10, -22], elbowR: [-112, 0, 0], thighL: [-20, 0, 10], kneeL: [24, 0, 0], thighR: [10, 0, -12], kneeR: [18, 0, 0] };
      },
      // the grab: one huge hand out in front, open
      ka_grab: { root: { y: -0.06 }, spine: [10, 0, 0], chest: [10, 20, 0], head: [-6, -10, 0], shoulderR: [-90, 0, -6], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 36], elbowL: [-50, 0, 0], thighL: [-30, 0, 16], kneeL: [36, 0, 0], thighR: [14, 0, -16], kneeR: [20, 0, 0], hands: ['fist', 'open'] },
    };
    Object.assign(C, KP);
    SL.data.characters.kale = {
      id: 'kale', assetLevel: 1, name: 'Kale', fullName: 'Kale (Universe 6)', era: 'Super',
      playable: true, prototype: true, style: 'Berserker',
      blurb: 'Caulifla\'s shy apprentice. Push her too far and something enormous and green answers instead.',
      card: ['Universe 6', 'Berserk'],
      ratings: { power: 4, speed: 3, ki: 4, defense: 4 },
      stats: { hp: 20000, ki: 130, stamina: 160, speed: 1.0, power: 1.15, defense: 1.05, weight: 0.9, kiRegen: 3, chargeRate: 34, canonPower: 3 },
      appearance: {
        height: 0.88, skin: SKIN,
        build: {
          chestW: 0.168, chestD: 0.13, chestTop: 0.27, shoulderX: 0.17, shoulderY: 0.22, delt: 0.046,
          waistW: 0.1, waistD: 0.085, pelvisW: 0.152, pelvisD: 0.116, hipX: 0.086,
          upperArmR: 0.04, foreArmR: 0.035, fist: 0.044, thighR: 0.082, shinR: 0.056, neckR: 0.038, neckLen: 0.07, headR: 0.128, footLen: 0.86,
        },
        hair: { style: 'kale', color: 0x141418 },
        face: { pupil: 0x2a1a10, eyeW: 1.25, eyeH: 0.9, lashWing: true, brow: 0x141418, browThick: 0.9, jaw: 1.1, jawW: 0.78, nose: 0.75, mouthColor: 0x7a2836 },
        outfit: {
          topStyle: 'shirt', top: RED, sleeves: 'none', arms: SKIN,
          hem: { color: RED, len: 0.17, flare: 1.18 },
          belt: 0x6a4026, beltStyle: 'belt', buckle: 0xd8d8e0,
          wrist: GOLD, wristLen: 0.1,
          // the purple shorts sit under the skirt: the legs are bare down to the boots
          pants: SKIN, pantsStyle: 'tight',
          boots: GOLD, bootStyle: 'saiyan',
        },
        portraitColor: '#b8283a',
      },
      vfx: { ghost: 0x9aff6a },
      audio: { strikePitch: 1.2, heavyPitch: 1.0 },
      forms: [
        { id: 'base', name: 'Base', aura: { color: 0xe0ffd8, core: 0xffffff, particles: 0xd0ffc0 }, mult: {} },
        {
          // BERSERK: Story-given by top_saiyans; Free Battle once that is cleared
          id: 'berserk', name: 'Berserk Super Saiyan', short: 'BERSERK', kiCost: 50, style: 'full',
          freeUnlock: ['top_saiyans'],
          mult: { damage: 2.2, speed: 1.05, defense: 2.0, kiRegen: 2.4, chargeRate: 1.5, guardStamina: 0.5 },
          aura: { color: 0x4aff3a, core: 0xe8ffd0, particles: 0x7aff5a, idle: 0.7, speed: 1.5, sharp: 0.6, sparks: 0xb8ff8a, lightning: true },
          look: { hair: { style: 'kale_berserk', color: 0x9ae84a }, pupil: 0xffffff, brow: 0x7ac83a, scale: 1.32, bulk: 1.55, muscle: 1.42 },
          poses: { idle: KP.ka_berserk },
          moves: {
            // she walks straight through blows: every heavy is armoured
            heavy: {
              0: { id: 'kaCrush', startup: 14, active: 5, recovery: 24, damage: 2400, reach: 1.8, radius: 1.3, lunge: 16, hitstun: 38, knock: 'smash', knockSpeed: 36, impact: 4, armor: true, guardCrush: true, guardDamage: 60, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            },
            dash: { id: 'kaRam', startup: 8, active: 12, recovery: 22, damage: 1600, reach: 1.7, radius: 1.3, lunge: 40, hitstun: 32, knock: 'heavy', knockSpeed: 32, impact: 3, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
          },
          // out of control: wide, heavy and committed — a swing at air leaves her open (whiffBreath), and she does
          // not stop to guard
          ai: { personality: 'berserker', aggression: 0.97, defense: 0.05, ranged: 0.35, beam: 0.3, preferredRange: 1.4, whiffBreath: 22, rhythm: { burst: 5, rest: 40 } },
          intro: { pose: 'ka_roar', expression: 'shout' },
          restFace: 'angry',
          ghost: 0x9aff6a, music: 5,
        },
        {
          // CONTROLLED (Caulifla talks her down, the Tournament of Power): green hair and the power, held. Smaller than
          // the berserk body, the eyes have their pupils back, cleaner footwork, guards and reads — its own profile and
          // its own strikes, not the berserk one turned down. Story-given by top_saiyans.
          id: 'controlled', name: 'Super Saiyan (Controlled)', short: 'CONTROLLED', kiCost: 50, style: 'full',
          freeUnlock: ['top_saiyans'],
          mult: { damage: 2.0, speed: 1.22, defense: 1.7, kiRegen: 2.2, chargeRate: 1.5, guardStamina: 0.75 },
          aura: { color: 0x5aff4a, core: 0xf0ffe0, particles: 0x8aff6a, idle: 0.45, speed: 1.3, sharp: 0.35, sparks: 0xc8ff9a, inner: { color: 0xd8ffc0, core: 0xffffff, scale: 0.72, alpha: 0.45 } },
          look: { hair: { style: 'kale_ctrl', color: 0x8ad83a }, pupil: 0x1a7a4a, brow: 0x6ab83a, scale: 1.08, bulk: 1.18, muscle: 1.16 },
          poses: { idle: KP.ka_ctrl },
          moves: {
            heavy: {
              0: { id: 'kaDrive', startup: 9, active: 4, recovery: 17, damage: 1900, reach: 1.5, radius: 1.05, lunge: 18, hitstun: 34, knock: 'smash', knockSpeed: 30, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
            },
            dash: { id: 'kaDart', startup: 5, active: 9, recovery: 14, damage: 1300, reach: 1.4, radius: 1, lunge: 42, hitstun: 28, knock: 'push', knockSpeed: 22, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          },
          ai: { personality: 'martial', aggression: 0.78, defense: 0.72, ranged: 0.4, beam: 0.4, preferredRange: 2, rhythm: { burst: 3, rest: 34 } },
          intro: { pose: 'ka_ctrl', expression: 'determined' },
          restFace: 'serious',
          ghost: 0x9aff6a, music: 5,
        },
      ],
      poses: Object.assign({ idle: KP.ka_shy }, KP),
      moves: {
        light: [
          { id: 'kaJab', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 440, reach: 1.15, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchLight', hitPose: 'hitLight' },
          { id: 'kaCross', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 460, reach: 1.15, radius: 0.72, lunge: 12, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitSideR' },
          { id: 'kaKick', startup: 6, active: 4, recovery: 13, cancel: 8, damage: 620, reach: 1.4, radius: 0.85, lunge: 12, hitstun: 22, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        ],
        heavy: {
          0: { id: 'kaSmash', startup: 11, active: 4, recovery: 20, damage: 1400, reach: 1.35, radius: 1, lunge: 14, hitstun: 32, knock: 'smash', knockSpeed: 30, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        dash: { id: 'kaRush', startup: 5, active: 8, recovery: 16, damage: 900, reach: 1.35, radius: 0.95, lunge: 34, hitstun: 26, knock: 'push', knockSpeed: 18, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        throw: { id: 'kaToss', name: 'Desperate Toss', damage: 1000, knockSpeed: 26, poses: ['grab', 'hammerWind', 'hammer'] },
      },
      specials: {
        special1: {
          id: 'kaleBall', name: 'Eraser Ball', type: 'projectile', kiCost: 24, icon: 'ball', cooldown: 90,
          startup: 12, recovery: 16, pose: { wind: 'blastWind', release: 'blastCharged' },
          projectile: { kind: 'ball', speed: 70, radius: 0.85, damage: 1700, homing: 0.6, color: 0x5aff3a, core: 0xe8ffd0, explode: 4, knock: 'heavy', knockSpeed: 24, impact: 3, life: 3 },
        },
        special2: {
          id: 'kaleRush', name: 'Frantic Rush', type: 'rush', kiCost: 30, icon: 'rush',
          startup: 6, dashFrames: 16, speed: 52, recovery: 18,
          poses: { wind: 'punchWindR' },
          hits: [
            { pose: 'punchR', damage: 520, frames: 6, sfx: 'punchLight' },
            { pose: 'punchL', damage: 540, frames: 6, sfx: 'punchLight' },
            { pose: 'hammer', damage: 1400, frames: 12, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 30, impact: 3 },
          ],
        },
        ultimate: {
          id: 'giganticMeteor', name: 'Gigantic Meteor', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true, cooldown: 300,
          startup: 26, recovery: 34, pose: { wind: 'powerUp', release: 'blastCharged' },
          projectile: { kind: 'ball', speed: 46, radius: 2.4, damage: 6400, homing: 0.35, color: 0x4aff2a, core: 0xf0ffe0, explode: 9, knock: 'heavy', knockSpeed: 34, impact: 4, life: 4 },
        },
      },
      mechanic: { type: 'saiyanInstinct', name: 'Saiyan Instinct', desc: 'Pressure wakes something in her: vanishing and Perfect Guards sharpen her next strikes.' },
      ai: { personality: 'adaptive', aggression: 0.55, defense: 0.6, ranged: 0.4, beam: 0.3, transformHp: 0.5, preferredRange: 2.4 },
      intro: { pose: 'ka_shy', expression: 'sad' },
      victory: { poses: ['ka_shy'], expression: 'warm' },
      defeat: { pose: 'defeatKneel', expression: 'sad' },
    };
  }

  /* ======================================================================== DYSPO (Universe 11) */
  // The Pride Troopers' fastest: tall, lean, long rabbit ears, lavender skin, yellow eyes, the Pride Trooper suit.
  // SPEED is the identity — on the balls of his feet, a low forward-leaning sprint, short bursts and sharp changes of
  // direction, strikes from changing angles (speedOrbit circles you: readable, never a stream of teleports).
  // Story cast with a full fight kit (not on the select screen).
  {
    // (2026-10-15 Pride Trooper pass, the board p.58: a stronger lilac; the ears far longer and wider, darker inside; a
    // muzzle; the suit's black V and red point; plain white boots)
    const SKIN = 0xc898dc, EAR_IN = 0x9a68b4, RED = 0xc8322e, BLACK = 0x18181e, WHITE = 0xf2f0ea;
    const DP = {
      dy_idle: (t) => {
        const b = Math.abs(Math.sin(t * 5));
        return { root: { y: -0.03 + b * 0.02 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [-6, 0, 0], shoulderL: [-40, 0, 24], elbowL: [-90, 0, 0], shoulderR: [-40, 0, -24], elbowR: [-90, 0, 0], thighL: [-18, 0, 10], kneeL: [26, 0, 0], thighR: [-8, 0, -10], kneeR: [18, 0, 0], hands: ['fist', 'fist'] };
      },
      // the sprint: low and leaning far forward, arms back
      dy_sprint: { root: { y: -0.12, rx: 34 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-30, 0, 0], shoulderL: [40, 0, 10], elbowL: [-20, 0, 0], shoulderR: [40, 0, -10], elbowR: [-20, 0, 0], thighL: [-60, 0, 6], kneeL: [80, 0, 0], thighR: [30, 0, -6], kneeR: [30, 0, 0] },
      dy_strike: { root: { y: -0.06, rx: 14 }, hips: [0, 14, 0], spine: [8, 14, 0], chest: [8, 28, 0], head: [-10, -20, 0], shoulderR: [-92, 0, 6], elbowR: [-2, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-100, 0, 0], thighL: [-46, 0, 10], kneeL: [52, 0, 0], thighR: [26, 0, -10], kneeR: [16, 0, 0], hands: ['fist', 'fist'] },
      dy_kick: { root: { y: 0.02, rx: -8 }, chest: [-6, -12, 0], head: [-6, 10, 0], shoulderL: [-40, 0, 40], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-80, 0, 0], thighR: [-100, 0, -6], kneeR: [4, 0, 0], thighL: [6, 0, 6], kneeL: [10, 0, 0] },
    };
    Object.assign(C, DP);
    SL.data.characters.dyspo = {
      id: 'dyspo', assetLevel: 1, name: 'Dyspo', fullName: 'Dyspo (Universe 11)', era: 'Super',
      playable: true, prototype: true, style: 'Speed', // Free Battle after "The Final Battle" (unlocks.js)
      blurb: 'The fastest of the Pride Troopers. You see where he is going — just not in time.',
      card: ['Universe 11', 'Pride Trooper'],
      ratings: { power: 3, speed: 5, ki: 3, defense: 2 },
      stats: { hp: 22000, ki: 130, stamina: 180, speed: 1.6, power: 1.2, defense: 0.95, weight: 0.85, kiRegen: 3, chargeRate: 34, canonPower: 6 },
      appearance: {
        height: 1.08, skin: SKIN,
        build: { chestW: 0.155, chestD: 0.12, shoulderX: 0.165, waistW: 0.1, upperArmR: 0.038, foreArmR: 0.034, fist: 0.042, thighR: 0.066, shinR: 0.05, headR: 0.13, neckLen: 0.08 },
        hair: { style: 'bald', color: SKIN },
        // the long rabbit ears, up, out and a little back — longer than the head is tall — darker inside; the muzzle
        headExtras: [
          { shape: 'ball', a: [0.42, 0.85, -0.1], d: [0.3, 1, -0.14], l: 0.44, r: 0.078, color: SKIN, depth: 3.9, flat: 0.5, outline: 0.5 },
          { shape: 'ball', a: [-0.42, 0.85, -0.1], d: [-0.3, 1, -0.14], l: 0.44, r: 0.078, color: SKIN, depth: 3.9, flat: 0.5, outline: 0.5 },
          { shape: 'ball', a: [0.42, 0.85, 0.14], d: [0.3, 1, -0.14], l: 0.36, r: 0.046, color: EAR_IN, depth: 3.5, flat: 0.35, outline: 0 },
          { shape: 'ball', a: [-0.42, 0.85, 0.14], d: [-0.3, 1, -0.14], l: 0.36, r: 0.046, color: EAR_IN, depth: 3.5, flat: 0.35, outline: 0 },
          { shape: 'ball', a: [0, -0.22, 1], d: [0, -0.15, 1], l: 0.045, r: 0.042, color: SKIN, depth: 0.88, flat: 0.62, outline: 0.3 },
        ],
        face: { pupil: 0x1a1a10, sclera: 0xe8d040, eyeW: 0.9, eyeH: 0.6, brow: 0x9a80b0, browThick: 1.1, jaw: 0.95, jawW: 0.86, nose: 0.6, noEars: true },
        outfit: {
          topStyle: 'shirt', top: RED, abs: BLACK, sleeves: 'long', sleeveColor: RED,
          collar: BLACK, collarStyle: 'turtle',
          vee: { chest: { color: BLACK, at: 0.18, slope: 2.6 }, abs: { color: RED, at: 0.045, slope: 1.2 } },
          gloves: WHITE, pants: BLACK, pantsStyle: 'tight',
          boots: WHITE, bootStyle: 'saiyan', bootTip: null,
        },
        portraitColor: '#c8322e',
      },
      vfx: { ghost: 0xe0c8ff, trail: 0xf0e0ff },
      audio: { strikePitch: 1.25, heavyPitch: 1.1 },
      forms: [{ id: 'base', name: 'Base', aura: { color: 0xf0e8ff, core: 0xffffff, particles: 0xe0d0ff, speed: 1.6, trail: 0xf0e0ff }, mult: {} }],
      poses: Object.assign({ idle: DP.dy_idle, run: DP.dy_sprint }, DP),
      cinematicOnly: false,
      moves: {
        // short, fast and from changing angles: little damage per blow, a lot of blows
        light: [
          { id: 'dyJab', startup: 3, active: 2, recovery: 7, cancel: 4, damage: 340, reach: 1.15, radius: 0.7, lunge: 20, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'punchWindR', strike: 'dy_strike' }, sfx: 'punchLight', hitPose: 'hitLight' },
          { id: 'dyJab2', startup: 3, active: 2, recovery: 7, cancel: 4, damage: 340, reach: 1.15, radius: 0.7, lunge: 20, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchLight', hitPose: 'hitSideR' },
          { id: 'dyKick', startup: 4, active: 3, recovery: 9, cancel: 5, damage: 460, reach: 1.4, radius: 0.8, lunge: 22, hitstun: 18, knock: 'push', knockSpeed: 12, impact: 2, pose: { wind: 'kickWindR', strike: 'dy_kick' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        ],
        heavy: {
          0: { id: 'dyHeel', startup: 7, active: 4, recovery: 16, damage: 1100, reach: 1.4, radius: 0.9, lunge: 26, hitstun: 28, knock: 'smash', knockSpeed: 26, impact: 3, pose: { wind: 'kickWindR', strike: 'dy_kick' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        dash: { id: 'dyMach', startup: 2, active: 9, recovery: 10, damage: 700, reach: 1.3, radius: 0.85, lunge: 62, hitstun: 22, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'dy_sprint', strike: 'dy_strike' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        throw: { id: 'dyToss', name: 'Pride Toss', damage: 800, knockSpeed: 26, poses: ['grab', 'dy_sprint', 'dy_kick'] },
      },
      specials: {
        special1: {
          id: 'lightSpeedMach', name: 'Light Speed Mach Attack', type: 'speedOrbit', kiCost: 30, icon: 'rush', cooldown: 380,
          range: 30, frames: 140, radius: 4.2, interval: 16, damage: 460, speed: 40, recovery: 40, bounceStagger: 50,
          poses: { dash: 'dy_sprint', strike: 'dy_strike' },
        },
        special2: {
          id: 'justiceDash', name: 'Justice Dash', type: 'rush', kiCost: 22, icon: 'rush',
          startup: 4, dashFrames: 14, speed: 84, recovery: 18,
          poses: { wind: 'dy_sprint' },
          hits: [
            { pose: 'dy_strike', damage: 420, frames: 5, sfx: 'punchLight' },
            { pose: 'punchL', damage: 420, frames: 5, sfx: 'punchLight' },
            { pose: 'dy_kick', damage: 1100, frames: 10, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 28, impact: 3 },
          ],
        },
        ultimate: {
          id: 'machBarrage', name: 'Mach Barrage', type: 'rush', kiCost: 100, icon: 'ultimate', ultimate: true,
          startup: 6, dashFrames: 18, speed: 96, recovery: 30,
          poses: { wind: 'dy_sprint' },
          hits: [
            { pose: 'dy_strike', damage: 700, frames: 4, sfx: 'punchLight' },
            { pose: 'punchL', damage: 700, frames: 4, sfx: 'punchLight' },
            { pose: 'dy_strike', damage: 700, frames: 4, sfx: 'punchLight' },
            { pose: 'dy_kick', damage: 2400, frames: 12, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
          ],
        },
      },
      ai: { personality: 'aggressive', aggression: 0.85, defense: 0.4, ranged: 0.2, beam: 0, transformHp: 0, preferredRange: 2, rhythm: { burst: 4, rest: 26 } },
      intro: { pose: 'dy_idle', expression: 'cocky' },
      victory: { poses: ['dy_idle'], expression: 'cocky' },
      defeat: { pose: 'defeatKneel', expression: 'hurt' },
    };
  }

  /* ======================================================================== TOPPO (Universe 11) */
  // The Pride Troopers' leader and Universe 11's God of Destruction candidate: huge and round, a broad white
  // moustache, the Pride Trooper suit. GOD OF DESTRUCTION mode (against Vegeta): the purple light of destruction
  // round him, the eyes burning violet, the suit's colours darkened — and Hakai: a slow violet sphere that erases.
  {
    const SKIN = 0xd8a878, RED = 0xc8322e, BLACK = 0x18181e, WHITE = 0xf2f0ea, STACHE = 0xf4f2ee;
    const TP = {
      tp_idle: (t) => {
        const b = Math.sin(t * 1.3);
        return { root: { y: b * 0.004 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [2, 0, 0], shoulderL: [-10, 0, 24], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -24], elbowR: [-30, 0, 0], thighL: [-4, 0, 12], kneeL: [6, 0, 0], thighR: [-4, 0, -12], kneeR: [6, 0, 0], hands: ['fist', 'fist'] };
      },
      // the Pride Troopers' salute: fist across the chest
      tp_justice: { root: { y: 0 }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-6, 0, 0], shoulderR: [-60, 40, -10], elbowR: [-120, 0, 0], shoulderL: [-10, 0, 24], elbowL: [-30, 0, 0], thighL: [-4, 0, 14], kneeL: [6, 0, 0], thighR: [-4, 0, -14], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
      // Hakai: one hand raised, the sphere forming over the palm
      tp_hakai: { root: { y: -0.04 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-14, 0, 0], shoulderR: [-170, 0, -10], elbowR: [-10, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0], thighL: [-14, 0, 16], kneeL: [16, 0, 0], thighR: [-6, 0, -16], kneeR: [10, 0, 0], hands: ['fist', 'open'] },
      tp_hakaiThrow: { root: { y: -0.08, rx: 8 }, spine: [8, 0, 0], chest: [12, 10, 0], head: [-10, -6, 0], shoulderR: [-100, 0, -6], elbowR: [-4, 0, 0], shoulderL: [-20, 0, 34], elbowL: [-50, 0, 0], thighL: [-30, 0, 16], kneeL: [34, 0, 0], thighR: [14, 0, -16], kneeR: [16, 0, 0], hands: ['fist', 'open'] },
    };
    Object.assign(C, TP);
    SL.data.characters.toppo = {
      id: 'toppo', assetLevel: 1, name: 'Toppo', fullName: 'Toppo (Universe 11)', era: 'Super',
      playable: true, prototype: true, style: 'God of Destruction Candidate',
      blurb: 'The leader of the Pride Troopers, who would rather be a hero — and who will become a god if that is what justice needs.',
      card: ['Universe 11', 'Pride Trooper'],
      ratings: { power: 5, speed: 2, ki: 4, defense: 5 },
      stats: { hp: 32000, ki: 150, stamina: 200, speed: 0.9, power: 1.55, defense: 1.6, weight: 2.2, kiRegen: 3, chargeRate: 34, canonPower: 7 },
      appearance: {
        height: 1.2, skin: SKIN,
        build: { chestW: 0.3, chestD: 0.26, shoulderX: 0.29, delt: 0.09, waistW: 0.28, waistD: 0.25, pelvisW: 0.26, pelvisD: 0.24, upperArmR: 0.085, foreArmR: 0.078, fist: 0.075, thighR: 0.12, shinR: 0.095, headR: 0.15, neckLen: 0.02 },
        hair: { style: 'bald', color: STACHE },
        // the broad white moustache and the heavy white brows; (2026-10-15 Pride Trooper pass, the board p.56) the short
        // white beard over the chin under it, and his pointed ears
        headExtras: [
          { shape: 'ball', a: [0.3, -0.38, 0.9], d: [1, -0.35, 0.1], l: 0.115, r: 0.042, color: STACHE, depth: 1.02, flat: 0.7, outline: 0.5 },
          { shape: 'ball', a: [-0.3, -0.38, 0.9], d: [-1, -0.35, 0.1], l: 0.115, r: 0.042, color: STACHE, depth: 1.02, flat: 0.7, outline: 0.5 },
          { shape: 'ball', a: [0, -0.72, 0.62], d: [0, -1, 0.35], l: 0.075, r: 0.075, color: STACHE, depth: 0.98, flat: 0.7, outline: 0.5 },
        ],
        face: { pupil: 0x2a2018, eyeW: 0.8, eyeH: 0.75, brow: STACHE, browThick: 2, jaw: 1.2, jawW: 1.2, cheeks: 1.2, nose: 1.1, pointedEars: true },
        outfit: {
          topStyle: 'shirt', top: RED, abs: BLACK, sleeves: 'long', sleeveColor: RED,
          vee: { chest: { color: BLACK, at: 0.21, slope: 2.0 }, abs: { color: RED, at: 0.06, slope: 0.7 } },
          gloves: WHITE, pants: BLACK, pantsStyle: 'tight',
          boots: WHITE, bootStyle: 'saiyan', bootTip: null,
          // throwing justice away for destruction bursts the uniform top: bare to a ragged band at the waist
          damage: { tearAt: 2, rips: [0, 1.57, 3.14, -1.57].map((a, i) => ({ at: 'spine', y: 0.07, ang: a + 0.2, w: 1.8, h: 0.08, fill: 'top', cloth: 'top', level: 2, seed: 140 + i })) },
          torn: { chest: 'skin', trap: 'skin', abs: 'skin', sleeves: 'skin' },
        },
        // God of Destruction: the red diamond marks down the bare sternum (the board p.56)
        props: [
          { id: 'godMark1', joint: 'chest', shape: 'box', pos: [0, 0.225, 0.29], rot: [-0.15, 0, 0.785], size: [0.032, 0.032, 0.01], color: 0xe0283a, forms: ['god'], ride: true },
          { id: 'godMark2', joint: 'chest', shape: 'box', pos: [0.042, 0.17, 0.284], rot: [0, 0.15, 0.785], size: [0.022, 0.022, 0.01], color: 0xe0283a, forms: ['god'], ride: true },
          { id: 'godMark3', joint: 'chest', shape: 'box', pos: [-0.042, 0.17, 0.284], rot: [0, -0.15, 0.785], size: [0.022, 0.022, 0.01], color: 0xe0283a, forms: ['god'], ride: true },
          { id: 'godMark4', joint: 'chest', shape: 'box', pos: [0, 0.11, 0.27], rot: [0.1, 0, 0.785], size: [0.026, 0.026, 0.01], color: 0xe0283a, forms: ['god'], ride: true },
        ],
        portraitColor: '#c8322e',
      },
      vfx: { ghost: 0xffb090 },
      audio: { strikePitch: 0.8, heavyPitch: 0.7 },
      forms: [
        { id: 'base', name: 'Base', aura: { color: 0xffd0a0, core: 0xffffff, particles: 0xffe0c0, speed: 0.9 }, mult: {} },
        {
          // GOD OF DESTRUCTION mode: story-given by top_toppo; Free Battle once that is cleared
          id: 'god', name: 'God of Destruction', short: 'DESTROYER', kiCost: 70, style: 'full',
          // the change bursts his uniform: bare to the ragged band at the waist (fighter.applyForm's form.wear)
          wear: 2,
          freeUnlock: ['top_toppo'],
          mult: { damage: 2.3, speed: 1.2, defense: 1.9, kiRegen: 2.5, chargeRate: 1.5, guardStamina: 0.6 },
          // destruction is not ki: a deep violet with magenta edges that will not hold still (sharp), a darker core
          aura: { color: 0x9a3aff, core: 0xff6ad8, particles: 0xc07aff, idle: 0.7, speed: 1.1, sharp: 0.8, sparks: 0xff7ae0, inner: { color: 0x3a0a6a, core: 0x8a2ad8, scale: 0.72, alpha: 0.95, sharp: 0.3, speed: 0.7 } },
          // the hide goes pale and rose, washed violet by the destruction around him (the board p.56 — it was a red-brown
          // stand-in until 2026-10-15), and the eyes burn violet; the aura's rim light adds the violet edges
          look: { pupil: 0xd070ff, skin: 0xd49ab8, tint: 0x7a2ad0, tintAmount: 0.2, bulk: 1.08, muscle: 1.12 },
          // pressure from range: destruction keeps you moving, then the heavy hands come in
          ai: { personality: 'elite', aggression: 0.72, defense: 0.65, ranged: 0.62, beam: 0.3, preferredRange: 3.2, rhythm: { burst: 3, rest: 40 } },
          intro: { pose: 'tp_hakai', expression: 'cold' },
          restFace: 'angry',
          ghost: 0xc07aff, music: 5,
        },
      ],
      poses: Object.assign({ idle: TP.tp_idle }, TP),
      moves: {
        light: [
          { id: 'tpPunch', startup: 7, active: 4, recovery: 14, cancel: 9, damage: 700, reach: 1.45, radius: 0.95, lunge: 10, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
          { id: 'tpPunchL', startup: 7, active: 4, recovery: 14, cancel: 9, damage: 720, reach: 1.45, radius: 0.95, lunge: 10, hitstun: 22, knock: 'push', knockSpeed: 10, impact: 2, pose: { wind: 'punchWindL', strike: 'punchL' }, sfx: 'punchHeavy', hitPose: 'hitSideR' },
          { id: 'tpBody', startup: 10, active: 5, recovery: 18, cancel: 11, damage: 900, reach: 1.5, radius: 1.1, lunge: 14, hitstun: 26, knock: 'heavy', knockSpeed: 18, impact: 3, armor: true, pose: { wind: 'stagger', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        ],
        heavy: {
          0: { id: 'justiceHammer', startup: 14, active: 5, recovery: 24, damage: 2000, reach: 1.6, radius: 1.2, lunge: 12, hitstun: 36, knock: 'smash', knockSpeed: 32, impact: 4, armor: true, guardCrush: true, guardDamage: 55, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        dash: { id: 'justiceTackle', startup: 10, active: 12, recovery: 24, damage: 1300, reach: 1.6, radius: 1.2, lunge: 30, hitstun: 30, knock: 'heavy', knockSpeed: 28, impact: 3, armor: true, pose: { wind: 'dash', strike: 'dash' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      specials: {
        special1: {
          id: 'justiceFlash', name: 'Justice Flash', type: 'scatter', kiCost: 34, icon: 'blast',
          windup: 18, rise: 8, height: 5, count: 9, damage: 800, speed: 84, range: 40, recovery: 22,
          color: 0xffd08a, poses: { wind: 'tp_justice', throw: 'blastR' },
        },
        special2: {
          id: 'justiceCrusher', name: 'Justice Crusher', type: 'rush', kiCost: 34, icon: 'rush',
          startup: 8, dashFrames: 18, speed: 44, recovery: 22,
          poses: { wind: 'tp_justice' },
          hits: [
            { pose: 'punchR', damage: 800, frames: 7, sfx: 'punchHeavy' },
            { pose: 'punchL', damage: 820, frames: 7, sfx: 'punchHeavy' },
            { pose: 'hammer', damage: 2200, frames: 14, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
          ],
        },
        ultimate: {
          id: 'hakai', name: 'Hakai', type: 'projectile', kiCost: 100, icon: 'ultimate', ultimate: true, cooldown: 360,
          startup: 30, recovery: 30, pose: { wind: 'tp_hakai', release: 'tp_hakaiThrow' },
          projectile: { kind: 'ball', speed: 30, radius: 1.6, damage: 7200, homing: 0.55, color: 0x9a3aff, core: 0x2a0a4a, explode: 6, knock: 'heavy', knockSpeed: 30, impact: 4, life: 5 },
        },
      },
      ai: { personality: 'elite', aggression: 0.6, defense: 0.7, ranged: 0.35, beam: 0.2, transformHp: 0.45, preferredRange: 2.4 },
      intro: { pose: 'tp_justice', expression: 'determined' },
      victory: { poses: ['tp_justice'], expression: 'determined' },
      defeat: { pose: 'defeatKneel', expression: 'hurt' },
    };
  }

  /* ======================================================================== ANDROID 17 (the Tournament of Power) */
  // The park ranger: Android 17's own body and kit (androids_pair.js), in the clothes he fights the tournament in — a
  // white T-shirt under an open green shirt, an orange scarf at the neck, jeans and a belt, brown boots; the hair long
  // to the shoulders. He is the one who wins it.
  {
    const A17 = SL.data.characters.android_17;
    const ap = JSON.parse(JSON.stringify(A17.appearance));
    ap.outfit = {
      topStyle: 'shirt', top: 0xeeeeea, sleeves: 'long', sleeveColor: 0x5a8a4a, arms: 0x5a8a4a,
      jacket: { color: 0x5a8a4a, open: 0.32, collar: 0x4a7a3a },
      belt: 0x6a4428, beltStyle: 'belt', buckle: 0xd8c890,
      pants: 0x3a5a9a, pantsStyle: 'slacks',
      boots: 0x5a3a24, bootStyle: 'shoe',
    };
    // (the scarf a little higher and fuller: at the old height the shirt's collar hid it)
    ap.props = [{ id: 'scarf', shape: 'neckRing', joint: 'neck', pos: [0, 0.018, 0.008], radius: 0.082, thick: 0.46, color: 0xe86a2a }];
    ap.portraitColor = '#5a8a4a';
    SL.data.characters.android_17_top = Object.assign({}, A17, {
      id: 'android_17_top', name: 'Android 17', fullName: 'Android 17 (the park ranger)', era: 'Super',
      // story cast: the playable Android 17 is the Android Saga's (androids_pair.js); this one is his Tournament self
      playable: false,
      blurb: 'A park ranger now, with a wife, three adopted children and a wildlife reserve — and still never tired.',
      appearance: ap,
      // the Tournament of Power's 17: the barrier is a defence now (a shell, src/game/techniques.js: barrier), not
      // the old field blast; he fights economically and makes openings rather than trading blows
      specials: Object.assign({}, A17.specials, {
        special2: {
          id: 'a17Shield', name: 'Barrier', type: 'barrier', kiCost: 26, icon: 'guard', cooldown: 210,
          radius: 1.7, holdFrames: 60, damage: 300, knockSpeed: 16, color: 0x8ad4ff,
          poses: { hold: 'a17_barrier' },
        },
      }),
      ai: Object.assign({}, A17.ai, { aggression: 0.62, defense: 0.8, ranged: 0.55, preferredRange: 3.4, hooks: 'android_17', rhythm: { burst: 3, rest: 36 } }),
    });
  }
  /* ======================================================================== MASTER ROSHI (Universe 7) */
  // ToP refinement brief §29: short, elderly, bald, the dark glasses (green frames in the stands' stills), the white
  // beard; a white vest and khaki trousers. His strength is timing, positioning and technique, not size: a low,
  // relaxed old master's guard, a deliberate palm, a back-fist off a drunken sway, a leg sweep at the ankles, the
  // Kamehameha he invented — and MAX POWER, the body swelling for a few seconds of the old strength.
  // Story cast with a full fight kit (not on the select screen); in the Universe 7 stands of the Tournament.
  {
    const SKIN = 0xf2c6a0, WHITE = 0xf4f2ee, VEST = 0xf0ece0, KHAKI = 0xd2bf94;
    const RS = {
      // the old master's guard: knees bent, a little hunched, one open hand forward and low, the other at the chest
      rs_idle: (t) => {
        const b = Math.sin(t * 1.6);
        return { root: { y: -0.07 + b * 0.004 }, hips: [0, -10, 0], spine: [10, 6, 0], chest: [8, 8, 0], head: [-12, -6, 0], shoulderL: [-56, 0, 10], elbowL: [-50, 0, 0], shoulderR: [-40, 0, -16], elbowR: [-100, 0, 0], thighL: [-20, 10, 12], kneeL: [30, 0, 0], thighR: [10, -8, -12], kneeR: [24, 0, 0], hands: ['open', 'open'] };
      },
      rs_palmW: { root: { y: -0.09 }, hips: [0, -12, 0], spine: [10, -10, 0], chest: [8, -16, 0], head: [-12, 12, 0], shoulderR: [-36, 0, -20], elbowR: [-118, 0, 0], shoulderL: [-60, 0, 12], elbowL: [-50, 0, 0], thighL: [-20, 10, 12], kneeL: [32, 0, 0], thighR: [10, -8, -12], kneeR: [26, 0, 0], hands: ['open', 'open'] },
      rs_palm: { root: { y: -0.11, rx: 8 }, hips: [0, 10, 0], spine: [12, 12, 0], chest: [10, 20, 0], head: [-14, -14, 0], shoulderR: [-88, 0, 0], elbowR: [-4, 0, 0], shoulderL: [-40, 0, 24], elbowL: [-90, 0, 0], thighL: [-30, 10, 12], kneeL: [42, 0, 0], thighR: [16, -8, -12], kneeR: [20, 0, 0], hands: ['open', 'open'] },
      // the drunken sway back... and the back-fist off it
      rs_swayW: { root: { y: -0.06, rx: -10, rz: 8 }, spine: [-8, 10, 6], chest: [-6, 14, 0], head: [-4, -10, 8], shoulderR: [-30, 0, -40], elbowR: [-60, 0, 0], shoulderL: [-50, 0, 30], elbowL: [-70, 0, 0], thighL: [-10, 10, 14], kneeL: [26, 0, 0], thighR: [14, -8, -14], kneeR: [20, 0, 0], hands: ['fist', 'open'] },
      rs_sway: { root: { y: -0.09, rx: 10, rz: -6 }, spine: [10, -14, -4], chest: [10, -24, 0], head: [-12, 18, -4], shoulderR: [-84, 0, -50], elbowR: [-20, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-80, 0, 0], thighL: [-30, 10, 14], kneeL: [38, 0, 0], thighR: [16, -8, -14], kneeR: [18, 0, 0], hands: ['fist', 'open'] },
      // the leg sweep: right down to the ground, the leg swept out across the ankles
      rs_sweepW: { root: { y: -0.2, rx: 10 }, hips: [0, -30, 0], spine: [16, -10, 0], chest: [10, -14, 0], head: [-16, 10, 0], shoulderL: [-50, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-60, 0, 0], thighL: [-60, 0, 20], kneeL: [100, 0, 0], thighR: [-30, 0, -40], kneeR: [60, 0, 0], hands: ['open', 'open'] },
      rs_sweep: { root: { y: -0.26, rx: 12 }, hips: [0, 50, 0], spine: [18, 20, 0], chest: [12, 24, 0], head: [-18, -30, 0], shoulderL: [-70, 0, 50], elbowL: [-20, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-40, 0, 0], thighL: [-70, 0, 20], kneeL: [110, 0, 0], thighR: [-10, 0, -78], kneeR: [4, 0, 0], footR: [20, 0, 0], hands: ['open', 'open'] },
      // MAX POWER: the body swollen, the chest out, the fists at his sides
      rs_max: (t) => {
        const b = Math.sin(t * 2);
        return { root: { y: -0.05 + b * 0.005 }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-6, 0, 0], shoulderL: [-20, 0, 34], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -34], elbowR: [-60, 0, 0], thighL: [-12, 0, 16], kneeL: [16, 0, 0], thighR: [-12, 0, -16], kneeR: [16, 0, 0], hands: ['fist', 'fist'] };
      },
      rs_flex: { root: { y: -0.06 }, chest: [-12, 0, 0], head: [-10, 0, 0], shoulderL: [-90, 0, 70], elbowL: [-120, 0, 0], shoulderR: [-90, 0, -70], elbowR: [-120, 0, 0], thighL: [-14, 0, 18], kneeL: [18, 0, 0], thighR: [-14, 0, -18], kneeR: [18, 0, 0], hands: ['fist', 'fist'] },
    };
    Object.assign(C, RS);
    const HEAD = 0.14;
    SL.data.characters.roshi = {
      id: 'roshi', assetLevel: 1, name: 'Master Roshi', fullName: 'Master Roshi (Muten Roshi, Universe 7)', era: 'Super',
      // Free Battle after the Tournament of Power's first match (unlocks.js): his own kit, built in the supporting cast pass
      playable: true, prototype: true, style: 'Old Master',
      blurb: 'The oldest fighter on the platform, and the one who taught half of Universe 7. He does not need to be fast — he needs to be right.',
      card: ['Universe 7', 'Turtle School'],
      ratings: { power: 2, speed: 3, ki: 4, defense: 5 },
      stats: { hp: 14000, ki: 130, stamina: 120, speed: 0.96, power: 0.95, defense: 1.2, weight: 0.85, kiRegen: 2.6, chargeRate: 34, canonPower: 1.2 },
      appearance: {
        height: 0.8, skin: SKIN,
        build: { chestW: 0.19, chestD: 0.14, shoulderX: 0.195, waistW: 0.14, upperArmR: 0.05, foreArmR: 0.044, fist: 0.048, thighR: 0.078, shinR: 0.058, headR: HEAD, neckLen: 0.05 },
        hair: { style: 'bald', color: WHITE },
        // the long white beard and the moustache
        headExtras: [
          { shape: 'ball', a: [0, -0.62, 0.72], d: [0, -1, 0.35], l: 0.16, r: 0.085, color: WHITE, depth: 0.98, flat: 0.55, outline: 0.5 },
          { shape: 'ball', a: [0.22, -0.3, 0.92], d: [1, -0.4, 0.1], l: 0.08, r: 0.04, color: WHITE, depth: 1.02, flat: 0.6, outline: 0.4 },
          { shape: 'ball', a: [-0.22, -0.3, 0.92], d: [-1, -0.4, 0.1], l: 0.08, r: 0.04, color: WHITE, depth: 1.02, flat: 0.6, outline: 0.4 },
        ],
        face: { pupil: 0x1a1a1a, eyeW: 0.8, brow: WHITE, browThick: 1.6, nose: 1.1, jaw: 0.95 },
        // the dark glasses with the green frames
        props: [{ id: 'glasses', shape: 'glasses', joint: 'head', pos: [0, HEAD * 0.95 + 0.014, HEAD * 0.97], rot: [0, 0, 0], color: 0x1a1a22, frame: 0x3aa04a }],
        outfit: {
          topStyle: 'shirt', top: VEST, sleeves: 'none', arms: SKIN, abs: VEST,
          belt: 0x7a5a3a, beltStyle: 'sash', pants: KHAKI, pantsStyle: 'gi', boots: 0x5a3a24, bootStyle: 'shoe',
        },
        portraitColor: '#3aa04a',
      },
      vfx: { ghost: 0xe8f4ff },
      audio: { strikePitch: 1.05, heavyPitch: 0.95 },
      forms: [
        { id: 'base', name: 'Base', aura: { color: 0xeaf4ff, core: 0xffffff, particles: 0xdcecff, speed: 0.9 }, mult: {} },
        {
          // MAX POWER: the old body swollen with the strength of his prime — heavier, slower to move, much harder to stop
          id: 'max', name: 'Max Power', short: 'MAX POWER', kiCost: 40, style: 'burst',
          mult: { damage: 1.45, speed: 0.94, defense: 1.3, kiRegen: 1.2, chargeRate: 1.3, guardStamina: 0.8 },
          aura: { color: 0xfff2c8, core: 0xffffff, particles: 0xfff6dc, idle: 0.3, speed: 1.1 },
          look: { bulk: 1.35, muscle: 1.5, scale: 1.12 },
          poses: { idle: RS.rs_max },
          activation: { pose: 'rs_flex' },
          ai: { aggression: 0.62, rhythm: { burst: 3, rest: 40 } },
        },
      ],
      poses: Object.assign({ idle: RS.rs_idle }, RS),
      cinematicOnly: false,
      moves: {
        // a beat slower than the young ones, every blow placed
        light: [
          { id: 'rsPalm', startup: 7, active: 3, recovery: 10, cancel: 6, damage: 360, reach: 1.0, radius: 0.7, lunge: 9, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'rs_palmW', strike: 'rs_palm' }, sfx: 'punchLight', hitPose: 'hitBody' },
          { id: 'rsBackfist', startup: 6, active: 3, recovery: 11, cancel: 6, damage: 380, reach: 1.05, radius: 0.72, lunge: 10, hitstun: 22, knock: 'flinch', impact: 1, pose: { wind: 'rs_swayW', strike: 'rs_sway' }, sfx: 'punchLight', hitPose: 'hitSideR' },
          { id: 'rsSweep', startup: 8, active: 4, recovery: 14, cancel: 9, damage: 420, reach: 1.2, radius: 0.9, lunge: 8, hitstun: 30, knock: 'heavy', knockSpeed: 10, impact: 2, pose: { wind: 'rs_sweepW', strike: 'rs_sweep' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        ],
        heavy: {
          0: { id: 'rsTurtlePalm', startup: 12, active: 5, recovery: 20, damage: 900, reach: 1.15, radius: 0.95, lunge: 12, hitstun: 34, knock: 'heavy', knockSpeed: 24, impact: 3, guardCrush: true, guardDamage: 45, pose: { wind: 'rs_palmW', strike: 'rs_palm' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
        },
        dash: { id: 'rsLunge', startup: 6, active: 8, recovery: 18, damage: 600, reach: 1.1, radius: 0.85, lunge: 26, hitstun: 24, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'rs_swayW', strike: 'rs_sway' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
        throw: { id: 'rsToss', name: 'Turtle Throw', damage: 700, knockSpeed: 22, poses: ['grab', 'throwWind', 'throwRelease'] },
      },
      specials: {
        special1: {
          id: 'rsKamehameha', name: 'Kamehameha', type: 'beam', kiCost: 30, icon: 'beam',
          chargeMin: 22, chargeMax: 90, tiers: [22, 60], damage: [1500, 2800], radius: [0.5, 1.05], speed: 100, range: 150, sustain: 34,
          color: 0x3fb2ff, core: 0xe8f8ff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 24,
          sound: 'kame', callout: ['KAMEHAME', 'HA!'], chargeLight: 0x5ac8ff,
        },
        special2: {
          // the old trick: in close, a grab — and everything he has goes through it
          id: 'thunderShock', name: 'Thunder Shock Surprise', type: 'rush', kiCost: 30, icon: 'rush', cooldown: 300,
          startup: 6, dashFrames: 12, speed: 40, recovery: 26,
          poses: { wind: 'rs_swayW' },
          hits: [
            { pose: 'rs_palm', damage: 500, frames: 8, sfx: 'punchLight' },
            { pose: 'grab', damage: 1500, frames: 24, sfx: 'punchHeavy', knock: 'crumple', impact: 3 },
          ],
        },
        ultimate: {
          id: 'rsMaxKame', name: 'Max Power Kamehameha', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
          chargeMin: 70, chargeMax: 70, damage: [5600, 5600], radius: [1.6, 1.6], speed: 96, range: 160, sustain: 46,
          color: 0x3fb2ff, core: 0xffffff, poses: { charge: 'beamChargeSide', fire: 'beamFire' }, recovery: 44, cinematic: true,
          sound: 'kame', callout: ['KAMEHAME', 'HA!'], chargeLight: 0x5ac8ff,
        },
      },
      // timing and positioning: long watchful rests, a short placed string, a guard that is always up
      ai: { personality: 'martial', aggression: 0.42, defense: 0.86, ranged: 0.4, beam: 0.4, transformHp: 0.5, preferredRange: 3.2, rhythm: { burst: 2, rest: 60 } },
      intro: { pose: 'rs_idle', expression: 'calm' },
      victory: { poses: ['rs_flex'], expression: 'grin' },
      defeat: { pose: 'defeatKneel', expression: 'hurt' },
    };
  }

  // GOD OF DESTRUCTION TOPPO strikes like something heavier than a hero (ToP refinement brief §38): every blow comes a
  // frame later and lands with armour behind it, and the hammer drives destruction into the stone (move.quake, violet)
  {
    const T = SL.data.characters.toppo, god = T.forms.find((f) => f.id === 'god');
    god.moves = {
      light: T.moves.light.map((m) => Object.assign({}, m, { startup: m.startup + 1, armor: true, knockSpeed: (m.knockSpeed || 10) + 4 })),
      heavy: Object.fromEntries(Object.entries(T.moves.heavy).map(([k, m]) => [k, Object.assign({}, m, { quake: { r: 3, trauma: 0.45, color: 0xb04aff } })])),
    };
  }
})();
