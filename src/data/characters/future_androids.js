/*
 * FUTURE ANDROIDS 17 AND 18 ("The History of Trunks") — FUTURE TIMELINE continuity, Free Battle only. From the owner's
 * visual reference (p.231–232): their own casual denim-and-vest designs, not the present pair recoloured —
 *
 *   FUTURE 17   black hair grown past the shoulders, the orange scarf, a dark shirt over white sleeves, a brown belt
 *               with a holster at the hip, blue jeans, dark boots.
 *   FUTURE 18   blonde hair grown to the shoulders and parted in the middle, a blue denim jacket over a black shirt,
 *               striped sleeves, blue jeans instead of the skirt, brown boots.
 *
 * Twenty years of hunting what was left of humanity made them crueller and faster to the kill: their kits are the
 * present pair's fighting styles (the shared animations) with their own techniques, and an AI that does not wait.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const A17 = C.android_17, A18 = C.android_18;
  if (!A17 || !A18) return;
  const lt = (id, wind, strike, damage, o) => Object.assign({ id, startup: 4, active: 2, recovery: 10, cancel: 6, damage, reach: 1.25, radius: 0.8, lunge: 14, hitstun: 18, knock: 'flinch', impact: 1, pose: { wind, strike }, sfx: 'punchLight', hitPose: 'hitLight' }, o);

  C.future_17 = Object.assign({}, A17, {
    id: 'future_17', name: 'Future 17', fullName: 'Android 17 (future timeline)', era: 'Future Timeline',
    playable: true, prototype: true, style: 'Hunter · Ruthless',
    card: ['Future Timeline', 'The History of Trunks'],
    blurb: 'In the future he never met Goku. For twenty years the cities were his hunting ground — and he made a game of it.',
    ratings: { power: 4, speed: 5, ki: 4, defense: 3 },
    appearance: Object.assign({}, A17.appearance, {
      hair: { style: 'kibito', color: 0x141418 },
      outfit: Object.assign({}, A17.appearance.outfit, { sleeves: 'long', sleeveColor: 0xeeeeea, top: 0x1e1e26, pants: 0x3a6ab0, pantsStyle: 'slacks', boots: 0x2a2a3a, belt: 0x6a3a1a }),
      props: [
        { id: 'scarf', shape: 'neckRing', joint: 'neck', pos: [0, 0.018, 0.008], radius: 0.082, thick: 0.46, color: 0xe8642a },
        { id: 'holster', shape: 'box', joint: 'hips', pos: [0.14, -0.04, 0.0], rot: [0, 0, 0.1], size: [0.04, 0.09, 0.05], color: 0x6a4a2a },
      ],
      portraitColor: '#e8642a',
    }),
    specials: {
      // PHOTON FLASH: a quick shot from two fingers, straight through a guard
      special1: {
        id: 'f17Flash', name: 'Photon Flash', type: 'projectile', kiCost: 20, icon: 'blast', cooldown: 60,
        startup: 8, recovery: 12, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'blast', speed: 88, radius: 0.32, damage: 1500, homing: 0.25, color: 0x8ad4ff, core: 0xffffff, explode: 2, knock: 'heavy', knockSpeed: 20, impact: 3, guardPierce: 0.5, life: 2 },
      },
      // HUNTER'S RUSH: he runs you down — jab, kick, and the boot into the ground
      special2: {
        id: 'f17Hunt', name: 'Hunter\'s Rush', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 5, dashFrames: 18, speed: 76, recovery: 20,
        poses: { wind: 'a17_jabW' },
        hits: [
          { pose: 'a17_jab', damage: 700, frames: 8, sfx: 'punchLight' },
          { pose: 'a17_kick', damage: 760, frames: 9, sfx: 'punchHeavy' },
          { pose: 'hammer', damage: 1500, frames: 16, sfx: 'punchHeavy', knock: 'smash', knockSpeed: 34, impact: 4 },
        ],
      },
      // SUPER ELECTRIC STRIKE: a crackling wave from one open hand
      ultimate: {
        id: 'f17Strike', name: 'Super Electric Strike', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [5000, 5000], radius: [1.3, 1.3], speed: 110, range: 160, sustain: 40,
        color: 0x6ac8ff, core: 0xf0faff, poses: { charge: 'a17_barrierW', fire: 'blastR' }, recovery: 28,
      },
    },
    ai: Object.assign({}, A17.ai, { personality: 'aggressive', aggression: 0.86, defense: 0.4, ranged: 0.4, beam: 0.35, preferredRange: 2.4 }),
    intro: { pose: 'a17_bored', expression: 'smirk' },
    victory: { poses: ['a17_bored'], expression: 'smirk' },
  });

  C.future_18 = Object.assign({}, A18, {
    id: 'future_18', name: 'Future 18', fullName: 'Android 18 (future timeline)', era: 'Future Timeline',
    playable: true, prototype: true, style: 'Hunter · Kicks',
    card: ['Future Timeline', 'The History of Trunks'],
    blurb: 'In the future she never married, never stopped. She fights bored, and she kicks harder than her brother hits.',
    ratings: { power: 4, speed: 5, ki: 3, defense: 3 },
    appearance: Object.assign({}, A18.appearance, {
      hair: { style: 'a17', color: 0xf0d878 },
      outfit: Object.assign({}, A18.appearance.outfit, { jacket: { color: 0x3a64b8, open: 0.5, collar: 0x30559a }, hem: undefined, pants: 0x3a64b0, pantsStyle: 'tight', boots: 0x8a4a22 }),
      portraitColor: '#3a64b8',
    }),
    moves: Object.assign({}, A18.moves, {
      light: [
        lt('f18Jab', 'a17_jabW', 'a17_jab', 600),
        lt('f18Kick', 'a17_kickW', 'a17_kick', 680, { startup: 5, reach: 1.4, recovery: 11, cancel: 7, sfx: 'punchHeavy', hitPose: 'hitBody' }),
        lt('f18High', 'kickWindR', 'kickR', 760, { startup: 6, reach: 1.45, recovery: 13, cancel: 8, hitstun: 24, knock: 'push', knockSpeed: 14, impact: 2, sfx: 'punchHeavy', hitPose: 'hitSideL' }),
      ],
    }),
    specials: {
      // POWER BLITZ: a bright ball from one palm, quick and hard
      special1: {
        id: 'f18Blitz', name: 'Power Blitz', type: 'projectile', kiCost: 22, icon: 'ball', cooldown: 70,
        startup: 10, recovery: 14, pose: { wind: 'blastWind', release: 'blastR' },
        projectile: { kind: 'ball', speed: 74, radius: 0.6, damage: 1600, homing: 0.6, color: 0xffd060, core: 0xffffff, explode: 3, knock: 'heavy', knockSpeed: 22, impact: 3, life: 2.4 },
      },
      // SADISTIC KICKS: in close, three kicks, the last one through you
      special2: {
        id: 'f18Kicks', name: 'Sadistic Kicks', type: 'rush', kiCost: 28, icon: 'rush',
        startup: 5, dashFrames: 18, speed: 76, recovery: 20,
        poses: { wind: 'a17_kickW' },
        hits: [
          { pose: 'a17_kick', damage: 680, frames: 8, sfx: 'punchHeavy' },
          { pose: 'kickR', damage: 720, frames: 9, sfx: 'punchHeavy' },
          { pose: 'a17_kick', damage: 1500, frames: 16, sfx: 'punchHeavy', knock: 'heavy', knockSpeed: 34, impact: 4 },
        ],
      },
      // DESTRUCTION WAVE: both palms, a golden wave
      ultimate: {
        id: 'f18Wave', name: 'Destruction Wave', type: 'beam', kiCost: 100, icon: 'ultimate', ultimate: true,
        chargeMin: 40, chargeMax: 40, damage: [4900, 4900], radius: [1.3, 1.3], speed: 108, range: 160, sustain: 40,
        color: 0xffc040, core: 0xfff8e0, poses: { charge: 'a17_barrierW', fire: 'a17_barrier' }, recovery: 28,
      },
    },
    ai: Object.assign({}, A18.ai, { aggression: 0.84, defense: 0.45, ranged: 0.35, beam: 0.35, preferredRange: 2.2 }),
    intro: { pose: 'a17_bored', expression: 'smirk' },
    victory: { poses: ['a17_bored'], expression: 'smirk' },
  });
})();
