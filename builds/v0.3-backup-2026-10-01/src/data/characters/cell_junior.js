/*
 * CELL JUNIOR (Cell Games, Age 767) — seven of Cell's own cells, spat out and
 * told to hurt people in front of a child who will not fight properly.
 *
 * Designed as a *crowd*, not as a boss. One of them is not much: low health,
 * light damage, a short rush and a flick of ki. Six of them is the problem, and
 * the problem is pressure rather than power — which is exactly the pressure the
 * story needs, because none of it is aimed at the player until it works.
 *
 * Its mechanic is `packHunter`: it fights harder with its siblings around it and
 * loses its nerve alone, so thinning the swarm is the counterplay and the squad
 * AI (`AIHooks.cell_junior` in `src/game/controllers.js`) never lets the whole set commit at once.
 *
 * Level 1 functional prototype, story only.
 */
(function () {
  'use strict';

  const poses = {
    cj_idle: (t) => {
      const b = Math.sin(t * 3.4);
      return {
        root: { y: -0.02 + b * 0.014 },
        hips: [0, -4, 0], spine: [6, 0, 0], chest: [6, 6, 0], head: [-10, -4, 0],
        shoulderL: [-22, 0, 30], elbowL: [-78, 0, 0], shoulderR: [-22, 0, -30], elbowR: [-78, 0, 0],
        thighL: [-16, 4, 14], kneeL: [26 + b, 0, 0], thighR: [12, -4, -14], kneeR: [24 + b, 0, 0],
        hands: ['fist', 'fist'],
      };
    },
    cj_crouch: {
      root: { y: -0.16, rx: 22 },
      hips: [0, -6, 0], spine: [16, 0, 0], chest: [14, 10, 0], head: [-24, -8, 0],
      shoulderL: [-30, 0, 34], elbowL: [-96, 0, 0], shoulderR: [-30, 0, -34], elbowR: [-96, 0, 0],
      thighL: [-40, 4, 16], kneeL: [58, 0, 0], thighR: [30, -4, -16], kneeR: [52, 0, 0],
      hands: ['open', 'open'],
    },
    cj_slashW: {
      root: { y: -0.06 }, chest: [4, 36, 0], head: [-8, -24, 0],
      shoulderR: [-44, 0, -44], elbowR: [-88, 0, 0], shoulderL: [-20, 0, 28], elbowL: [-64, 0, 0],
      thighL: [-20, 0, 12], kneeL: [30, 0, 0], thighR: [14, 0, -12], kneeR: [22, 0, 0],
      hands: ['open', 'open'],
    },
    cj_slash: {
      root: { y: -0.08, rx: 12 }, chest: [10, -36, 0], head: [-10, 26, 0],
      shoulderR: [-96, 0, 24], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 32], elbowL: [-52, 0, 0],
      thighL: [-32, 0, 12], kneeL: [42, 0, 0], thighR: [20, 0, -12], kneeR: [18, 0, 0],
      hands: ['open', 'open'],
    },
    // the purge: its fist stopped in Gohan's hand, leaning back from it, trying to pull free
    cj_caught: {
      root: { y: -0.06, rx: -10 }, spine: [-8, 0, 0], chest: [-6, -30, 0], head: [-6, 24, 0],
      shoulderR: [-92, 0, 10], elbowR: [-6, 0, 0], shoulderL: [-30, 0, 40], elbowL: [-90, 0, 0],
      thighL: [-34, 0, 14], kneeL: [40, 0, 0], thighR: [26, 0, -14], kneeR: [24, 0, 0],
      hands: ['open', 'fist'],
    },
    cj_laugh: (t) => {
      const b = Math.sin(t * 8);
      return {
        root: { y: -0.02 + Math.abs(b) * 0.02, rx: -8 },
        spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-20 + b * 3, 0, 0],
        shoulderL: [-40, 0, 40], elbowL: [-100, 0, 0], shoulderR: [-40, 0, -40], elbowR: [-100, 0, 0],
        thighL: [-14, 0, 12], kneeL: [22, 0, 0], thighR: [10, 0, -12], kneeR: [20, 0, 0],
        hands: ['open', 'open'],
      };
    },
  };

  SL.data.characters.cell_junior = {
    id: 'cell_junior',
    name: 'Cell Junior',
    shortName: 'Cell Jr.',
    assetLevel: 1,
    storyOnly: true,
    tier: 'minion',
    stats: { hp: 9000, ki: 70, stamina: 80 },
    // small, light and quick: half a Cell in every dimension that matters
    scale: 0.66,
    build: { height: 1.2 },
    appearance: {
      skin: 0xbfe6d8,
      hair: null,
      face: { pupil: 0x101018, sclera: 0xff6a6a, brow: 0x2a4a3a, noEars: true },
      outfit: { topStyle: 'bare', top: 0x2a4a3a, pants: 0x2a4a3a, belt: 0x1a2a22 },
      // the same two head crests their father has, in miniature
      headExtras: [
        { a: [0.55, 0.85, 0.2], d: [0.6, 1, -0.1], l: 0.09, r: 0.026, color: 0x1a3a2a, depth: 0.96 },
        { a: [-0.55, 0.85, 0.2], d: [-0.6, 1, -0.1], l: 0.09, r: 0.026, color: 0x1a3a2a, depth: 0.96 },
      ],
    },
    aura: { color: 0x8ae0c0, core: 0xd8fff0, particles: 0xa8ff6a, idle: 0.2, speed: 1.4 },
    forms: [{ id: 'base', name: 'Base', aura: { color: 0x8ae0c0, core: 0xd8fff0, particles: 0xa8ff6a }, mult: {} }],
    poses: Object.assign({ idle: poses.cj_idle }, poses),
    moves: {
      light: [
        { id: 'cjJab', startup: 3, active: 2, recovery: 10, cancel: 5, damage: 520, reach: 1.15, radius: 0.7, lunge: 18, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'cj_slashW', strike: 'cj_slash' }, sfx: 'punchLight', hitPose: 'hitLight' },
        { id: 'cjRake', startup: 3, active: 2, recovery: 11, cancel: 5, damage: 560, reach: 1.15, radius: 0.7, lunge: 18, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'cj_slashW', strike: 'cj_slash' }, sfx: 'punchLight', hitPose: 'hitSideR' },
        { id: 'cjKick', startup: 5, active: 3, recovery: 14, cancel: 8, damage: 820, reach: 1.35, radius: 0.8, lunge: 16, hitstun: 20, knock: 'push', knockSpeed: 14, impact: 2, pose: { wind: 'kickWindR', strike: 'kickR' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
      ],
      heavy: {
        0: { id: 'cjSmash', startup: 11, active: 4, recovery: 22, damage: 1400, reach: 1.4, radius: 0.85, lunge: 20, hitstun: 30, knock: 'heavy', knockSpeed: 22, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' },
      },
      dash: { id: 'cjDart', startup: 3, active: 6, recovery: 14, damage: 900, reach: 1.3, radius: 0.8, lunge: 46, hitstun: 22, knock: 'push', knockSpeed: 16, impact: 2, pose: { wind: 'cj_crouch', strike: 'cj_slash' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
    },
    specials: {
      special1: {
        id: 'cjBlast', name: 'Junior Blast', type: 'projectile', kiCost: 14, icon: 'ball', cooldown: 90,
        startup: 8, recovery: 18, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'blast', speed: 62, radius: 0.42, damage: 900, homing: 0.25, color: 0xa8ff6a, core: 0xd8fff0, explode: 2.2, knock: 'push', knockSpeed: 14, impact: 2, life: 2 },
      },
    },
    mechanic: { type: 'packHunter', name: 'Pack', desc: 'Braver with its brothers beside it, and careful on its own. Thin the swarm and the pressure comes off.' },
    ai: { personality: 'aggressive', aggression: 0.9, defense: 0.25, ranged: 0.3, beam: 0, preferredRange: 2.2, hooks: 'cell_junior' },
    intro: { pose: 'cj_crouch', expression: 'grin' },
    victory: { poses: ['cj_laugh'], expression: 'grin' },
    defeat: { pose: 'knockdown', expression: 'ko' },
  };
})();
