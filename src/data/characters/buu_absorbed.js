/*
 * SUPER BUU, AFTER HE HAS EATEN SOMEBODY (Buu Saga, Age 774).
 *
 *   buutenks   Super Buu with Gotenks (and Piccolo) inside him: Gotenks' Metamoran vest over the
 *              pink body — dark teal, open, a gold collar, the gold padded shoulders — his cocky
 *              stance, his voice and his tricks (the ghosts, the missiles) on top of Buu's own
 *              body and regeneration. Bigger and stronger than Super Buu.
 *
 * Not recolours: the vest and pads are real layers on the built body; the pose set is his own
 * (Gotenks' swagger in Buu's frame). Level 1 functional prototype; story only.
 */
(function () {
  'use strict';
  const SB = SL.data.characters.super_buu, GK = SL.data.characters.gotenks;
  const PINK = 0xf29ac0;

  const poses = {
    // Gotenks' cockiness in Buu's body: chest out, one hand on the hip, chin up
    bt_idle: (t) => {
      const b = Math.sin(t * 2);
      return {
        root: { y: -0.02 + b * 0.008 }, hips: [0, -10, 6], spine: [-4, 6, 0], chest: [-8, 10, 0], head: [-14, -12, 4],
        shoulderL: [-20, 0, 58], elbowL: [-104, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-60, 0, 0],
        thighL: [-8, 6, 16], kneeL: [10, 0, 0], thighR: [4, -8, -12], kneeR: [14, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // the entrance pose, stolen: arms wide, one knee up
    bt_pose: (t) => {
      const b = Math.sin(t * 5);
      return {
        root: { y: 0.02 + Math.abs(b) * 0.01 }, spine: [-10, 0, 0], chest: [-10, 0, 0], head: [-16, 0, 0],
        shoulderL: [-110, 0, 70], elbowL: [-20, 0, 0], shoulderR: [-110, 0, -70], elbowR: [-20, 0, 0],
        thighL: [-70, 0, 12], kneeL: [90, 0, 0], thighR: [-4, 0, -12], kneeR: [6, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    bt_laugh: (t) => {
      const b = Math.sin(t * 14);
      return {
        root: { y: -0.02 + Math.abs(b) * 0.014 }, spine: [-12, 0, 0], chest: [-8, 0, 0], head: [-14 + b * 5, 0, 0],
        shoulderL: [-30, 0, 40], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-80, 0, 0],
        thighL: [-8, 0, 16], kneeL: [10, 0, 0], thighR: [-8, 0, -16], kneeR: [10, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  const outfit = Object.assign({}, SB.appearance.outfit, {
    // Gotenks' vest and pads over the pink body
    jacket: { color: 0x2f6f78, open: 1.7, collar: 0xe8b830 },
    shoulderPads: 0xe8b830,
    wrist: 0x2a3a6a,
  });

  SL.data.characters.buutenks = Object.assign({}, SB, {
    id: 'buutenks',
    // story bodies: Super Buu himself is the playable one (he is copied here, so this has to say so)
    playable: false,
    name: 'Super Buu',
    fullName: 'Super Buu (Gotenks absorbed)',
    style: 'Stolen Genius',
    blurb: 'He ate a fusion. Now he has its talent, its tricks and its mouth.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 5 },
    stats: Object.assign({}, SB.stats, { hp: 56000, power: 1.85, speed: 1.3, defense: 1.35, canonPower: 6 }),
    appearance: Object.assign({}, SB.appearance, {
      height: 1.14,
      build: Object.assign({}, SB.appearance.build, { chestW: 0.3, shoulderX: 0.3 }),
      outfit,
      portraitColor: '#2f6f78',
    }),
    vfx: { ghost: 0xffb0d0, trail: 0xffc0dc },
    forms: [{ id: 'base', name: 'Buutenks', aura: { color: 0xff7ab8, core: 0xffe0f0, particles: 0x7ad8e8, idle: 0, speed: 1.4, sharp: 0.35 }, mult: {} }],
    // Gotenks' ghost-spitting poses come with his ghosts
    poses: Object.assign({}, SB.poses, poses, { idle: poses.bt_idle, bu_laugh: poses.bt_laugh, gk_ghostW: GK.poses.gk_ghostW, gk_ghost: GK.poses.gk_ghost }),
    specials: Object.assign({}, SB.specials, {
      // Gotenks' own ultimate, out of Buu's mouth: the ghosts are pink now
      ultimate: Object.assign({}, GK.specials.ultimate, {
        id: 'btGhosts',
        name: 'Super Ghost Kamikaze Attack (Buu)',
        projectile: Object.assign({}, GK.specials.ultimate.projectile, { color: 0xffa8d8, core: 0xffffff }),
      }),
    }),
    majin: Object.assign({}, SB.majin, { maxReforms: 4 }),
    ai: { personality: 'elite', aggression: 0.85, defense: 0.6, ranged: 0.4, beam: 0.3, transformHp: 0, preferredRange: 2.4 },
    intro: { pose: 'bt_pose', expression: 'grin' },
    victory: { poses: ['bt_pose'], expression: 'grin' },
  });

  /* =====================================================================================
   * BUUCCOLO — Super Buu the moment Gotenks' thirty minutes run out INSIDE him. The two boys are
   * children again in his stomach, and what is left in charge of his shape is Piccolo: the
   * Gotenks vest is gone, Piccolo's purple gi and his white weighted cape (the big padded
   * shoulders) are on the pink body, the antenna has shrunk, and so has the swagger. He stands
   * like Piccolo — arms folded under the cape — but hunched, sweating, furious and embarrassed.
   * A real intermediate state (his own body, his own poses), not a recoloured Buutenks. Story only.
   * ===================================================================================== */
  const bcPoses = {
    // Piccolo's folded arms, Buu's head pushed forward, the shoulders up round the ears
    bc_idle: (t) => {
      const b = Math.sin(t * 2.4);
      return {
        root: { y: -0.05 + b * 0.006, rx: 6 }, spine: [8, 0, 0], chest: [4, 0, 0], head: [-4, b * 3, 0],
        shoulderL: [-10, -72, 10], elbowL: [-96, 0, 0], shoulderR: [-14, 72, -10], elbowR: [-92, 0, 0],
        thighL: [-6, 4, 14], kneeL: [12, 0, 0], thighR: [-2, -4, -12], kneeR: [12, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // caught out: fists clenched at his sides, shaking, the teeth showing
    bc_embarrassed: (t) => {
      const s = Math.sin(t * 34) * 1.8;
      return {
        root: { y: -0.06, rx: 8 }, spine: [10, 0, s], chest: [8, 0, -s], head: [4, s * 2, 0],
        shoulderL: [-6, 0, 22 + s], elbowL: [-30, 0, 0], shoulderR: [-6, 0, -22 - s], elbowR: [-30, 0, 0],
        thighL: [-10, 0, 14], kneeL: [16, 0, 0], thighR: [-10, 0, -14], kneeR: [16, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // perfectly still, one hand half raised with the fingers curling: steering the piece of him
    // creeping through the rocks
    bc_control: (t) => {
      const c = Math.sin(t * 3) * 6;
      return {
        root: { y: -0.03 }, spine: [2, -6, 0], chest: [0, -8, 0], head: [-8, 12, 4],
        shoulderR: [-50, 0, -30], elbowR: [-70 + c, 0, 0], shoulderL: [-10, -72, 10], elbowL: [-96, 0, 0],
        thighL: [-6, 4, 12], kneeL: [10, 0, 0], thighR: [-2, -4, -12], kneeR: [10, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    bc_hurt: { root: { y: -0.12, rx: 20 }, spine: [22, 0, 0], chest: [14, 0, 0], head: [6, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-80, 0, 0], shoulderR: [-40, 0, -30], elbowR: [-80, 0, 0], thighL: [-30, 0, 16], kneeL: [44, 0, 0], thighR: [-20, 0, -16], kneeR: [36, 0, 0], hands: ['fist', 'fist'] },
  };
  const scaleAntenna = (extras, k, tail) => extras.map((e, i) => (i < 3 ? Object.assign({}, e, { l: e.l * (i === 2 && tail ? tail : k) }) : e));

  SL.data.characters.buuccolo = Object.assign({}, SB, {
    id: 'buuccolo',
    // story bodies: Super Buu himself is the playable one (he is copied here, so this has to say so)
    playable: false,
    // Super Buu's two techniques without the ultimate he was given as a playable fighter (the story fight is unchanged)
    specials: { special1: SB.specials.special1, special2: SB.specials.special2 },
    name: 'Super Buu',
    fullName: 'Super Buu (Piccolo absorbed)',
    style: 'Borrowed Cape',
    blurb: 'The fusion wore off inside him. What is left wearing the body is Piccolo\'s — cape and all — and it is a great deal weaker.',
    ratings: { power: 4, speed: 4, ki: 4, defense: 4 },
    stats: Object.assign({}, SB.stats, { hp: 40000, power: 1.35, speed: 1.1, defense: 1.15, canonPower: 3.8 }),
    appearance: Object.assign({}, SB.appearance, {
      height: 1.1,
      headExtras: scaleAntenna(SB.appearance.headExtras, 0.62, 0.55),
      face: Object.assign({}, SB.appearance.face, { browThick: 1.45 }),
      outfit: Object.assign({}, SB.appearance.outfit, {
        // Piccolo's clothes on the pink body: the purple gi (no sleeves), the pale blue sash, the
        // white weighted cape with its padded shoulders, Piccolo's red wristbands
        topStyle: 'gi', top: 0x5b3a8e, under: PINK, sleeves: 'none', arms: PINK, neck: 1.1,
        belt: 0x7fc4e8, beltStyle: 'sash',
        wrist: 0xb3202a,
        cape: 0xf4f2ee,
        shoulderPads: 0xf4f2ee,
      }),
      portraitColor: '#5b3a8e',
    }),
    forms: [{ id: 'base', name: 'Buuccolo', aura: { color: 0xff7ab8, core: 0xffe0f0, particles: 0xd8ffc8, idle: 0, speed: 1.1, sharp: 0.2 }, mult: {} }],
    poses: Object.assign({}, SB.poses, bcPoses, { idle: bcPoses.bc_idle }),
    ai: { personality: 'elite', aggression: 0.6, defense: 0.7, ranged: 0.4, beam: 0.2, transformHp: 0, preferredRange: 3 },
    intro: { pose: 'bc_idle', expression: 'angry' },
    victory: { poses: ['bc_idle'], expression: 'grin' },
  });

  /* =====================================================================================
   * BUUHAN — Super Buu with Ultimate Gohan inside him: the strongest Buu there is.
   * Built from the owner's reference sheet: the pink body bigger and denser than ever, Gohan's
   * face in it (a longer, squarer jaw, a human chin), dark red eyes on black, the antenna running
   * down past the small of his back, Gohan's clothes over Buu's — the dark orange gi opened into a
   * vest over the navy undershirt, the navy wristbands — Buu's white trousers and black-and-gold
   * belt below. He stands like a man who has already won: arms folded, chin up, weight back. Dense
   * pink-white aura, dark lightning in it. His own poses: idle, fight, taunt, laugh, flight, guard,
   * charge, regeneration, the emergence, victory, defeat, intimidation, the dimension-tearing
   * scream, the candy beam (the antenna pointed like a gun), absorption (tearing flesh off his own
   * shoulder), and what is left of his dignity when a coffee candy is done with him.
   * Level 1 functional prototype; story boss.
   * ===================================================================================== */
  const bhPoses = {
    // arms folded high, chin up, weight on the back leg: he has already decided how this ends
    bh_idle: (t) => {
      const b = Math.sin(t * 1.5);
      return {
        root: { y: -0.02 + b * 0.006 }, hips: [0, -10, 4], spine: [-4, 6, 0], chest: [-8, 8, 0], head: [-14, -8, 3],
        shoulderL: [-20, -70, 8], elbowL: [-100, 0, 0], shoulderR: [-24, 70, -8], elbowR: [-96, 0, 0],
        thighL: [-8, 8, 16], kneeL: [10, 0, 0], thighR: [0, -8, -12], kneeR: [16, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // the fight: square, low, hands open and high like claws, the head pushed forward
    bh_fight: (t) => {
      const b = Math.sin(t * 2.8);
      return {
        root: { y: -0.1 + b * 0.012, rx: 8 }, hips: [0, -16, 0], spine: [8, 8, 0], chest: [6, 12, 0], head: [-12, -10, 0],
        shoulderL: [-70, 0, 36], elbowL: [-80, 0, 0], shoulderR: [-50, 0, -46], elbowR: [-90, 0, 0],
        thighL: [-30, 14, 20], kneeL: [44 + b * 3, 0, 0], thighR: [16, -12, -20], kneeR: [36 + b * 3, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // one finger crooked: come here
    bh_taunt: (t) => {
      const b = Math.sin(t * 6);
      return {
        root: { y: -0.02 }, hips: [0, -8, 4], spine: [-4, 6, 0], chest: [-8, 8, 0], head: [-16, -10, 6],
        shoulderR: [-80, 0, -10], elbowR: [-30 + b * 20, 0, 0], shoulderL: [-20, -70, 8], elbowL: [-100, 0, 0],
        thighL: [-8, 8, 16], kneeL: [10, 0, 0], thighR: [0, -8, -12], kneeR: [16, 0, 0],
        hands: ['fist', 'point'],
      };
    },
    // hands on the hips, the head back: that laugh
    bh_laugh: (t) => {
      const b = Math.sin(t * 13);
      return {
        root: { y: -0.02 + Math.abs(b) * 0.012 }, spine: [-10, 0, 0], chest: [-10, 0, 0], head: [-22 + b * 5, 0, 0],
        shoulderL: [-10, 0, 50], elbowL: [-100, 0, 0], shoulderR: [-10, 0, -50], elbowR: [-100, 0, 0],
        thighL: [-8, 0, 16], kneeL: [10, 0, 0], thighR: [-8, 0, -16], kneeR: [10, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // floating, arms folded, legs straight and together: he looks down on everything
    bh_flyIdle: (t) => {
      const s = Math.sin(t * 1.8);
      return {
        root: { y: 0.03 * s }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-10, 0, 0],
        shoulderL: [-20, -70, 8], elbowL: [-100, 0, 0], shoulderR: [-24, 70, -8], elbowR: [-96, 0, 0],
        thighL: [-6, 0, 4], kneeL: [10, 0, 0], footL: [40, 0, 0], thighR: [-6, 0, -4], kneeR: [10, 0, 0], footR: [40, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // an X of forearms
    bh_guard: { root: { y: -0.06 }, spine: [10, 0, 0], chest: [12, 0, 0], head: [14, 0, 0], shoulderL: [-86, 0, -30], elbowL: [-110, 0, 0], shoulderR: [-80, 0, 26], elbowR: [-116, 0, 0], thighL: [-24, 0, 12], kneeL: [34, 0, 0], thighR: [8, 0, -12], kneeR: [28, 0, 0], hands: ['fist', 'fist'] },
    // powering up: arms down and back, fists shaking, the back arched, the antenna up
    bh_charge: (t) => {
      const s = Math.sin(t * 36) * 2;
      return {
        root: { y: -0.12 }, spine: [-10, 0, 0], chest: [-16 + s, 0, 0], head: [-20, 0, 0],
        shoulderL: [26, 0, 30 + s], elbowL: [-20, 0, 0], shoulderR: [26, 0, -30 - s], elbowR: [-20, 0, 0],
        thighL: [-20, 0, 24], kneeL: [36, 0, 0], thighR: [-20, 0, -24], kneeR: [36, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // growing back: doubled over, the body shuddering
    bh_regen: (t) => {
      const s = Math.sin(t * 28) * 2.5;
      return {
        root: { y: -0.16, rx: 20 }, spine: [24, 0, s], chest: [18, 0, -s], head: [6, s, 0],
        shoulderL: [-30, 0, 40], elbowL: [-70, 0, 0], shoulderR: [-30, 0, -40], elbowR: [-70, 0, 0],
        thighL: [-30, 0, 20], kneeL: [50, 0, 0], thighR: [-30, 0, -20], kneeR: [50, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // out of the steam: curled up, then rising (the emergence)
    bh_emerge: (t) => {
      const k = Math.min(1, t / 1.6);
      return {
        root: { y: -0.3 + k * 0.28, rx: 30 - k * 36 }, spine: [30 - k * 38, 0, 0], chest: [24 - k * 34, 0, 0], head: [20 - k * 40, 0, 0],
        shoulderL: [-60 + k * 40, 0, 20 + k * 30], elbowL: [-110 + k * 90, 0, 0], shoulderR: [-60 + k * 40, 0, -20 - k * 30], elbowR: [-110 + k * 90, 0, 0],
        thighL: [-80 + k * 72, 0, 16], kneeL: [110 - k * 100, 0, 0], thighR: [-80 + k * 72, 0, -16], kneeR: [110 - k * 100, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    // leaning in, hands on the knees, staring down at somebody small
    bh_loom: { root: { y: -0.1, rx: 24 }, spine: [20, 0, 0], chest: [12, 0, 0], head: [-30, 0, 0], shoulderL: [-40, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-40, 0, -20], elbowR: [-40, 0, 0], thighL: [-30, 0, 20], kneeL: [40, 0, 0], thighR: [-30, 0, -20], kneeR: [40, 0, 0], hands: ['open', 'open'] },
    // the Vice Shout: arms flung wide, head back, mouth wide open
    bh_scream: (t) => {
      const s = Math.sin(t * 40) * 3;
      return {
        root: { y: -0.08, rx: -10 }, spine: [-14, 0, 0], chest: [-18 + s, 0, 0], neck: [-14, 0, 0], head: [-30, 0, 0],
        shoulderL: [-50, 0, 80 + s], elbowL: [-20, 0, 0], shoulderR: [-50, 0, -80 - s], elbowR: [-20, 0, 0],
        thighL: [-20, 0, 24], kneeL: [30, 0, 0], thighR: [-20, 0, -24], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // the candy beam: bent forward, the antenna aimed like a gun barrel
    bh_candyW: { root: { y: -0.06, rx: 22 }, spine: [22, 0, 0], chest: [14, 0, 0], head: [40, 0, 0], shoulderL: [-10, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-10, 0, -30], elbowR: [-30, 0, 0], thighL: [-24, 0, 16], kneeL: [30, 0, 0], thighR: [4, 0, -16], kneeR: [24, 0, 0], hands: ['fist', 'fist'] },
    bh_candy: { root: { y: -0.06, rx: 26 }, spine: [26, 0, 0], chest: [18, 0, 0], head: [50, 0, 0], shoulderL: [10, 0, 40], elbowL: [-20, 0, 0], shoulderR: [10, 0, -40], elbowR: [-20, 0, 0], thighL: [-30, 0, 16], kneeL: [34, 0, 0], thighR: [6, 0, -16], kneeR: [24, 0, 0], hands: ['open', 'open'] },
    // tearing a sheet of himself off his shoulder
    bh_tear: (t) => {
      const b = Math.sin(t * 10) * 4;
      return {
        root: { y: -0.04 }, spine: [6, 20, 0], chest: [4, 24, 0], head: [-6, -20, 0],
        shoulderL: [-70, 40, -20], elbowL: [-120 + b, 0, 0], shoulderR: [-20, 0, -40], elbowR: [-40, 0, 0],
        thighL: [-12, 0, 14], kneeL: [18, 0, 0], thighR: [-6, 0, -14], kneeR: [14, 0, 0],
        hands: ['fist', 'open'],
      };
    },
    // throwing the sheet: both arms flung forward
    bh_fling: { root: { y: -0.04, rx: 12 }, spine: [14, 0, 0], chest: [10, 0, 0], head: [-8, 0, 0], shoulderL: [-100, 0, 20], elbowL: [-10, 0, 0], shoulderR: [-100, 0, -20], elbowR: [-10, 0, 0], thighL: [-30, 0, 14], kneeL: [30, 0, 0], thighR: [12, 0, -14], kneeR: [18, 0, 0], hands: ['open', 'open'] },
    // swatting at a candy that will not hold still
    bh_swat: (t) => {
      const s = Math.sin(t * 16);
      return {
        root: { y: -0.06 }, spine: [6, s * 30, 0], chest: [4, s * 30, 0], head: [-10, -s * 30, 0],
        shoulderL: [-110 + s * 40, 0, 40], elbowL: [-40, 0, 0], shoulderR: [-110 - s * 40, 0, -40], elbowR: [-40, 0, 0],
        thighL: [-16, 0, 16], kneeL: [22, 0, 0], thighR: [-16, 0, -16], kneeR: [22, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // snapping the head left and right after somebody who is never there
    bh_search: (t) => {
      const s = Math.sign(Math.sin(t * 5)) * 38;
      return {
        root: { y: -0.08, rx: 6 }, hips: [0, s * 0.3, 0], spine: [6, s * 0.3, 0], chest: [4, s * 0.4, 0], head: [-10, s, 0],
        shoulderL: [-60, 0, 40], elbowL: [-80, 0, 0], shoulderR: [-60, 0, -40], elbowR: [-80, 0, 0],
        thighL: [-24, 10, 18], kneeL: [36, 0, 0], thighR: [10, -10, -18], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // both hands over his mouth: the teeth are gone
    bh_mouth: (t) => {
      const s = Math.sin(t * 20) * 2;
      return {
        root: { y: -0.1, rx: 14 }, spine: [16, 0, s], chest: [10, 0, 0], head: [12, 0, 0],
        shoulderL: [-100, -30, 10], elbowL: [-130, 0, 0], shoulderR: [-100, 30, -10], elbowR: [-130, 0, 0],
        thighL: [-20, 0, 16], kneeL: [30, 0, 0], thighR: [-20, 0, -16], kneeR: [30, 0, 0],
        hands: ['open', 'open'],
      };
    },
    // on his knees, panting
    bh_pant: (t) => {
      const b = Math.sin(t * 5);
      return {
        root: { y: -0.46 + b * 0.01, rx: 16 }, spine: [18 + b * 3, 0, 0], chest: [10, 0, 0], head: [-10, 0, 0],
        shoulderL: [-50, 0, 10], elbowL: [-20, 0, 0], shoulderR: [-50, 0, -10], elbowR: [-20, 0, 0],
        thighL: [-92, 0, 8], kneeL: [100, 0, 0], thighR: [-10, 0, -8], kneeR: [110, 0, 0],
        hands: ['open', 'open'],
      };
    },
    bh_victory: { root: { y: -0.02 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-20, 0, 0], shoulderL: [-20, -70, 8], elbowL: [-100, 0, 0], shoulderR: [-24, 70, -8], elbowR: [-96, 0, 0], thighL: [-8, 0, 16], kneeL: [8, 0, 0], thighR: [-8, 0, -16], kneeR: [8, 0, 0], hands: ['fist', 'fist'] },
    bh_blastW: { root: { y: -0.06 }, spine: [4, 20, 0], chest: [2, 24, 0], head: [-8, -20, 0], shoulderR: [-60, 0, -40], elbowR: [-100, 0, 0], shoulderL: [-40, 0, 30], elbowL: [-80, 0, 0], thighL: [-20, 10, 14], kneeL: [26, 0, 0], thighR: [10, -10, -14], kneeR: [20, 0, 0], hands: ['open', 'open'] },
    bh_blast: { root: { y: -0.06, rx: 6 }, spine: [8, -14, 0], chest: [6, -20, 0], head: [-6, 16, 0], shoulderR: [-90, 0, -4], elbowR: [-4, 0, 0], handR: [-60, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-80, 0, 0], thighL: [-30, 10, 14], kneeL: [32, 0, 0], thighR: [16, -10, -14], kneeR: [18, 0, 0], hands: ['open', 'open'] },
  };

  // Buutenks doubles over the same way when Gotenks' time runs out inside him
  SL.data.characters.buutenks.poses.bt_convulse = bhPoses.bh_regen;

  const NAVY = 0x16225a, ORANGE = 0xe86a1c;
  SL.data.characters.buuhan = Object.assign({}, SB, {
    id: 'buuhan',
    // story bodies: Super Buu himself is the playable one (he is copied here, so this has to say so)
    playable: false,
    name: 'Buuhan',
    fullName: 'Super Buu (Ultimate Gohan absorbed)',
    style: 'The Strongest Buu',
    blurb: 'He ate the strongest fighter on Earth and got his face, his clothes and his power. He wants you to know it.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 5 },
    stats: Object.assign({}, SB.stats, { hp: 80000, ki: 240, power: 2.3, speed: 1.4, defense: 1.6, canonPower: 8 }),
    poise: Object.assign({}, SB.poise, { max: 240 }),
    appearance: Object.assign({}, SB.appearance, {
      height: 1.18,
      build: Object.assign({}, SB.appearance.build, { chestW: 0.31, chestD: 0.21, shoulderX: 0.31, delt: 0.1, waistW: 0.17, upperArmR: 0.082, foreArmR: 0.072, fist: 0.07, thighR: 0.108, headR: 0.132, neckR: 0.08 }),
      // the antenna down past the small of his back
      headExtras: scaleAntenna(SB.appearance.headExtras, 1.25, 3.4),
      // Gohan's face in the pink: the long square jaw, the human chin, narrower eyes — Buu's red on black
      face: Object.assign({}, SB.appearance.face, { jaw: 1.48, jawW: 0.9, cheeks: 0.4, eyeW: 0.86, eyeH: 0.82, browThick: 1.5, pupil: 0xa0101e }),
      outfit: Object.assign({}, SB.appearance.outfit, {
        // Gohan's gi over Buu's body: the dark orange opened into a vest, the navy undershirt, the
        // navy wristbands; Buu's own white trousers, belt and boots
        topStyle: 'gi', top: NAVY, under: NAVY, sleeves: 'none', arms: PINK, pecs: undefined, neck: 1.2,
        jacket: { color: ORANGE, open: 1.5 },
        wrist: NAVY,
      }),
      portraitColor: '#e86a1c',
    }),
    vfx: { ghost: 0xffb8d8, trail: 0xffd0e4 },
    audio: { strikePitch: 0.8, heavyPitch: 0.66 },
    forms: [{ id: 'base', name: 'Buuhan', aura: { color: 0xff8ac4, core: 0xfff0f8, particles: 0xffffff, idle: 0.3, speed: 1.6, sharp: 0.55, sparks: 0x3a2a8a, lightning: true }, mult: {} }],
    poses: Object.assign({}, SB.poses, bhPoses, {
      idle: bhPoses.bh_fight, flyIdle: bhPoses.bh_flyIdle, guard: bhPoses.bh_guard, charge: bhPoses.bh_charge,
      bu_laugh: bhPoses.bh_laugh, bu_sit: bhPoses.bh_regen,
      gk_ghostW: GK.poses.gk_ghostW, gk_ghost: GK.poses.gk_ghost,
    }),
    moves: Object.assign({}, SB.moves, {
      light: SB.moves.light.map((x) => Object.assign({}, x, { damage: Math.round(x.damage * 1.3) })),
    }),
    specials: Object.assign({}, SB.specials, {
      special1: Object.assign({}, SB.specials.special1, { id: 'bhBlast', name: 'Majin Kamehameha', pose: { wind: 'bh_blastW', release: 'bh_blast' }, projectile: Object.assign({}, SB.specials.special1.projectile, { damage: 2200, color: 0xff5ab0 }) }),
      ultimate: Object.assign({}, GK.specials.ultimate, {
        id: 'bhGhosts', name: 'Super Ghost Kamikaze Attack (Buu)',
        projectile: Object.assign({}, GK.specials.ultimate.projectile, { count: 5, color: 0xffa8d8, core: 0xffffff }),
      }),
    }),
    majin: Object.assign({}, SB.majin, { maxReforms: Infinity, reformSeconds: 1.6 }),
    ai: { personality: 'elite', aggression: 0.9, defense: 0.6, ranged: 0.45, beam: 0.3, transformHp: 0, preferredRange: 2.4 },
    intro: { pose: 'bh_idle', expression: 'wicked' },
    victory: { poses: ['bh_victory'], expression: 'wicked' },
    defeat: { pose: 'bh_pant', expression: 'hurt' },
  });
})();
