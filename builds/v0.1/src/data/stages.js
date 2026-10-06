/*
 * Stage definitions. The builder named in `type` lives in src/game/stage.js.
 */
(function () {
  'use strict';
  const S = SL.data.stages;

  S.wasteland = {
    id: 'wasteland',
    name: 'Rocky Wasteland',
    subtitle: 'Earth',
    type: 'ground',
    builder: 'wasteland',
    music: 'battle',
    seed: 737,
    size: 560,
    segments: 140,
    arenaRadius: 175,
    ceiling: 140,
    sky: { top: 0x3f86d8, horizon: 0xbfdcf0, bottom: 0xe8d6b0, sunDir: [0.45, 0.62, 0.35] },
    fog: { color: 0xd4dcd8, near: 180, far: 900 },
    light: { sun: 0xfff0d8, sunIntensity: 0.72, sky: 0xbfdcff, ground: 0x7a5a40, hemi: 0.5 },
    terrain: { sand: 0xcfa878, dirt: 0xb08058, rock: 0x8a6446, scorch: 0x4a382c },
    rock: { bands: [0xc98a54, 0xb2703e, 0xd8a370, 0xa45f34], count: 22 },
    thumb: 'linear-gradient(180deg,#3f86d8 0%,#bfdcf0 55%,#d8a370 56%,#b2703e 100%)',
  };

  S.orbit = {
    id: 'orbit',
    name: 'Planet Vegeta Orbit',
    subtitle: 'Frieza’s blockade',
    type: 'space',
    builder: 'orbit',
    music: 'finale',
    seed: 1337,
    arenaRadius: 150,
    ceiling: 90,
    floor: -70,
    sky: { top: 0x05030c, horizon: 0x1a0610, bottom: 0x2a0a08 },
    fog: null,
    light: { sun: 0xffb08a, sunIntensity: 0.9, sky: 0x7a90ff, ground: 0xff5a2a, hemi: 0.55 },
    rock: { bands: [0x6a5a5a, 0x584848, 0x7a6464], count: 18 },
    thumb: 'radial-gradient(circle at 50% 120%,#ff5a2a 0%,#8a1a10 30%,#1a0610 60%,#05030c 100%)',
  };
})();
