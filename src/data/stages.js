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

  // Chapter 1: the open grassland where Raditz lands (Age 761)
  S.plains = {
    id: 'plains',
    name: 'Grassland Hills',
    subtitle: 'Earth · Age 761',
    type: 'ground',
    builder: 'wasteland',
    music: 'battle',
    seed: 761,
    size: 560,
    segments: 140,
    arenaRadius: 175,
    ceiling: 140,
    sky: { top: 0x3a8ae8, horizon: 0xcfe6f6, bottom: 0xa8c888, sunDir: [0.35, 0.7, 0.4] },
    fog: { color: 0xc8dcea, near: 200, far: 950 },
    light: { sun: 0xfff6e6, sunIntensity: 0.74, sky: 0xc6e0ff, ground: 0x4a6a34, hemi: 0.52 },
    terrain: { sand: 0x7cb04e, dirt: 0x5e9040, rock: 0x8a8478, scorch: 0x3a3228 },
    rock: { bands: [0x9a948a, 0x8a8478, 0xaaa498, 0x7a746a], count: 9 },
    mesas: { bands: [0x6c9a58, 0x5a8a4a, 0x7aa864], scale: 0.7 },
    trees: { count: 70, leaf: 0x3f7a34, trunk: 0x6a4a2a },
    thumb: 'linear-gradient(180deg,#3a8ae8 0%,#cfe6f6 55%,#7cb04e 56%,#5e9040 100%)',
  };

  // Chapter 2: the wilderness where Piccolo leaves Gohan to survive (Age 761)
  S.wilderness = {
    id: 'wilderness',
    name: 'Wilderness Canyon',
    subtitle: 'Earth · Age 761',
    type: 'ground',
    builder: 'wasteland',
    music: 'battle',
    seed: 1761,
    size: 560,
    segments: 140,
    arenaRadius: 175,
    ceiling: 140,
    sky: { top: 0x4a8ad8, horizon: 0xd8e4ea, bottom: 0xb8a878, sunDir: [0.5, 0.55, 0.3] },
    fog: { color: 0xcad6d8, near: 170, far: 900 },
    light: { sun: 0xfff0d8, sunIntensity: 0.76, sky: 0xc0d8ff, ground: 0x5a4a30, hemi: 0.5 },
    terrain: { sand: 0x8aa050, dirt: 0x9a7a4a, rock: 0x8a6a4e, scorch: 0x3a3024 },
    rock: { bands: [0xb07a4a, 0x9a6a3e, 0xc48a58, 0x8a5a36], count: 24 },
    water: { level: -3.2, color: 0x4a8ab8, opacity: 0.8 },
    trees: { count: 90, leaf: 0x3a6a2e, trunk: 0x5a3a22 },
    thumb: 'linear-gradient(180deg,#4a8ad8 0%,#d8e4ea 55%,#8aa050 56%,#9a6a3e 100%)',
  };

  // King Kai's tiny planet at the end of Snake Way (Other World). Ten times Earth's gravity.
  S.kingkai = {
    id: 'kingkai',
    name: "King Kai's Planet",
    subtitle: 'Other World',
    type: 'ground',
    builder: 'wasteland',
    music: 'battle',
    seed: 99,
    size: 240,
    segments: 120,
    arenaRadius: 52,
    ceiling: 60,
    planet: { radius: 62 },
    gravity: 2.4,
    sky: { top: 0xe89a3a, horizon: 0xffe6a0, bottom: 0xf4c46a, sunDir: [0.3, 0.8, 0.2] },
    fog: { color: 0xffd88a, near: 90, far: 420 },
    light: { sun: 0xfff2d0, sunIntensity: 0.8, sky: 0xffe0a0, ground: 0x6a8a3a, hemi: 0.55 },
    terrain: { sand: 0x6ab83a, dirt: 0x5aa032, rock: 0x7a9a4a, scorch: 0x3a4a24 },
    rock: { bands: [0xd8c8a0], count: 0 },
    mesas: { bands: [0xf4d890, 0xe8c070], scale: 0.4 },
    trees: { count: 0, leaf: 0x3f7a34, trunk: 0x6a4a2a },
    thumb: 'linear-gradient(180deg,#e89a3a 0%,#ffe6a0 55%,#6ab83a 56%,#5aa032 100%)',
  };

  // Snake Way (Other World): the serpent road from King Yemma's check-in station to King Kai's planet.
  // A narrow road over a sea of clouds for the story run; not a Free Battle arena (storyOnly).
  S.snakeway = {
    id: 'snakeway',
    name: 'Snake Way',
    subtitle: 'Other World',
    type: 'ground',
    builder: 'snakeway',
    storyOnly: true,
    music: 'battle',
    seed: 1100,
    arenaRadius: 250,
    ceiling: 90,
    sky: { top: 0xf0a43c, horizon: 0xffe8b0, bottom: 0xffd88a, sunDir: [0.2, 0.75, 0.5] },
    fog: { color: 0xffe2a8, near: 140, far: 560 },
    light: { sun: 0xfff4dc, sunIntensity: 0.8, sky: 0xffe6b0, ground: 0xd8a040, hemi: 0.6 },
    terrain: { sand: 0xe8c060, dirt: 0xb88a3a, rock: 0x9a7040, scorch: 0x5a4020 },
    rock: { bands: [0xd8a040], count: 0 },
    road: { top: 0xf2c84a, band: 0xd89a2a, belly: 0x8a5a2a, cloud: 0xfff0b8 },
    // the road: control points (x, z) of a smooth curve, then features by fraction of its length.
    // The distance is compressed to under a kilometre; the gaps are a gameplay liberty (the body sinks into the clouds).
    route: {
      points: [[0, -205], [26, -186], [34, -160], [12, -138], [-22, -121], [-30, -101], [-10, -86],
        [36, -80], [46, -70], [38, -59], [-36, -57], [-46, -47], [-38, -36], [36, -34], [46, -24], [38, -13], [-36, -11], [-46, -1], [-38, 9], [0, 14],
        [6, 42], [-4, 70], [4, 100], [0, 130], [-6, 160], [0, 192]],
      width: 5.4,
      narrow: [[0.3, 0.64, 4.2]],
      hills: [[0.68, 0.75, 3.5], [0.9, 0.93, 2.2]],
      gaps: [[0.79, 4], [0.875, 5.5], [0.955, 6.5]],
      markers: 6,
    },
    thumb: 'linear-gradient(180deg,#f0a43c 0%,#ffe8b0 55%,#fff0b8 56%,#f2c84a 100%)',
  };

  // Namek (Namek Saga): green sky, blue-green grass, round-crowned Ajisa trees, rock towers and wide lakes
  S.namek = {
    id: 'namek',
    name: 'Namek',
    subtitle: 'Planet Namek · Age 762',
    type: 'ground',
    builder: 'wasteland',
    music: 'battle',
    seed: 762,
    size: 560,
    segments: 140,
    arenaRadius: 175,
    ceiling: 140,
    sky: { top: 0x5ec48a, horizon: 0xd8f4c8, bottom: 0x9ad8a8, sunDir: [0.4, 0.65, 0.3] },
    fog: { color: 0xc8ecc4, near: 190, far: 950 },
    light: { sun: 0xfffbe8, sunIntensity: 0.76, sky: 0xd0ffe0, ground: 0x3a7a6a, hemi: 0.54 },
    terrain: { sand: 0x5cb08c, dirt: 0x4a9678, rock: 0x7a9a90, scorch: 0x2a3a34 },
    rock: { bands: [0x8aa89c, 0x7a9a8e, 0x9ab8aa, 0x6a8a7e], count: 20 },
    mesas: { bands: [0x7aa898, 0x6a9888, 0x8ab8a8], scale: 1.1 },
    water: { level: -2.6, color: 0x3aa8a0, opacity: 0.82 },
    trees: { count: 60, leaf: 0x4a8ad8, trunk: 0x8a8a6a },
    thumb: 'linear-gradient(180deg,#5ec48a 0%,#d8f4c8 55%,#5cb08c 56%,#3aa8a0 100%)',
  };

  // NAMEK, DYING (owner, human playtest round 4: "Do not keep using the normal peaceful Namek
  // battlefield"). The same ground after Frieza's shot into the core: the sky the colour of it,
  // the seas turned to something glowing, scorched rock, almost nothing left standing. The
  // eruptions are the missions' (they hurt); this is what the planet looks like while it goes.
  // Story only: it exists for the last five minutes.
  S.namek_ruin = Object.assign({}, S.namek, {
    id: 'namek_ruin',
    name: 'Namek (dying)',
    subtitle: 'Planet Namek · the last five minutes',
    storyOnly: true,
    sky: { top: 0x240812, horizon: 0xc2401a, bottom: 0x5a1a10, sunDir: [0.3, 0.42, 0.2] },
    fog: { color: 0x6a2414, near: 110, far: 600 },
    light: { sun: 0xffb088, sunIntensity: 0.98, sky: 0xffa070, ground: 0x4a1a10, hemi: 0.66 },
    terrain: { sand: 0x5a4636, dirt: 0x3a2a22, rock: 0x4a3a34, scorch: 0x1a1210 },
    rock: { bands: [0x5a4a42, 0x4a3a34, 0x6a5044, 0x3a2e2a], count: 28 },
    mesas: { bands: [0x5a4038, 0x4a3430, 0x6a4a40], scale: 1.1 },
    water: { level: -2.2, color: 0xff5a14, opacity: 0.95 },
    trees: { count: 7, leaf: 0x3a2a24, trunk: 0x241e1a },
    thumb: 'linear-gradient(180deg,#240812 0%,#c2401a 55%,#5a4636 56%,#ff5a14 100%)',
  });

  // KAMI'S LOOKOUT (Buu Saga, Age 774): a round white platform floating above the clouds, the
  // palace at the back of it, a few palms, and nothing under the edge but sky. Story only: the
  // Fusion Dance and Piccolo's training (buu_fusion). The ground is the wasteland builder's height
  // grid, flat inside the rim and dropping away past it into a cloud sea (Stage._buildLookout).
  S.lookout = {
    id: 'lookout',
    name: "Kami's Lookout",
    subtitle: 'Above the clouds · Age 774',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'battle',
    seed: 774,
    size: 240,
    segments: 200,
    arenaRadius: 72,
    ceiling: 70,
    lookout: { radius: 34, drop: 30, rim: 0xd8cfb8, under: 0xb8a888, tileA: 0xe0d9c6, tileB: 0xc9bfa6, cloud: 0xf4f6fa, palace: 0xf4f0e6, trim: 0xd8a830, roof: 0xf2eee4 },
    sky: { top: 0x2f7fe0, horizon: 0xd8ecfa, bottom: 0xf4f8ff, sunDir: [0.4, 0.75, 0.3] },
    fog: { color: 0xe4f0fa, near: 160, far: 700 },
    light: { sun: 0xfff6e8, sunIntensity: 0.8, sky: 0xd0e6ff, ground: 0xb8b0a0, hemi: 0.55 },
    terrain: { sand: 0xe8e2d4, dirt: 0xdcd4c2, rock: 0xc8bfa8, scorch: 0x6a6258 },
    rock: { bands: [0xd8cfb8, 0xc8bfa8, 0xe0d8c6, 0xb8ae98], count: 0 },
    thumb: 'linear-gradient(180deg,#2f7fe0 0%,#d8ecfa 55%,#eee8da 56%,#f4f6fa 100%)',
  };

  // the Sacred World of the Kai: green grass, huge grey-green rock towers, a sky that is always clear
  S.kai_world = {
    id: 'kai_world',
    name: 'The Sacred World of the Kai',
    subtitle: 'The Kais\' own world · Age 774',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'vision',
    seed: 7742,
    size: 520,
    segments: 130,
    arenaRadius: 160,
    ceiling: 130,
    sky: { top: 0x3a8ae0, horizon: 0xd8f0ff, bottom: 0xeaf6ff, sunDir: [0.4, 0.7, 0.3] },
    fog: { color: 0xd8ecf8, near: 160, far: 720 },
    light: { sun: 0xfff8e8, sunIntensity: 0.82, sky: 0xd0e8ff, ground: 0x4a7a3a, hemi: 0.52 },
    terrain: { sand: 0x7ab84a, dirt: 0x5e9a3a, rock: 0x8a8a6a, scorch: 0x3a3a2a },
    rock: { bands: [0x9a9a86, 0x8a8a76, 0xa8a894, 0x7a7a66], count: 22, near: 28, far: 150, clearX: 18, clearZ: 22 },
    mesas: { bands: [0x8a9a7a, 0x7a8a6a, 0x9aa88a], scale: 1 },
    thumb: 'linear-gradient(180deg,#3a8ae0 0%,#d8f0ff 55%,#7ab84a 56%,#5e9a3a 100%)',
  };

  // the Room of Spirit and Time (inside Kami's Lookout): a year inside is a day outside
  S.timechamber = {
    id: 'timechamber',
    name: 'The Room of Spirit and Time',
    subtitle: "Inside Kami's Lookout · a year in a day",
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'finale',
    seed: 7741,
    size: 700,
    segments: 70,
    arenaRadius: 220,
    ceiling: 140,
    chamber: { at: [0, 0, -26], floor: 0xe4e4ea, shade: 0xd2d2dc, building: 0xeae4d6, roof: 0xdcd4c4, trim: 0xc89a3a, dark: 0x2a2630, stepA: 0xdedad0, stepB: 0xcec9be, glass: 0xc8e0ff, sand: 0xe0c888, edge: 0xe0d8ff },
    sky: { top: 0xf4f4fc, horizon: 0xffffff, bottom: 0xffffff, sunDir: [0.3, 0.9, 0.2] },
    fog: { color: 0xf0f0f6, near: 90, far: 520 },
    light: { sun: 0xfffaf0, sunIntensity: 0.62, sky: 0xd8d8e8, ground: 0xb4b4c0, hemi: 0.45 },
    terrain: { sand: 0xf6f6f2, dirt: 0xeeeee8, rock: 0xe4e4e0, scorch: 0x9a9aa4 },
    rock: { bands: [0xeeeeea, 0xe4e4e0, 0xf2f2ee, 0xdadad6], count: 0 },
    thumb: 'linear-gradient(180deg,#f4f4fc 0%,#ffffff 55%,#f2f2ee 56%,#e6e6ee 100%)',
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
  // Chapter 5: the coastal flat outside the city where Frieza's ship lands (Age 764)
  S.coast = {
    id: 'coast',
    name: 'Coastal Flats',
    subtitle: 'Earth · Age 764',
    type: 'ground',
    builder: 'wasteland',
    music: 'battle',
    seed: 764,
    size: 560,
    segments: 140,
    arenaRadius: 175,
    ceiling: 140,
    sky: { top: 0x21538f, horizon: 0x9fc0d8, bottom: 0xa89e8c, sunDir: [0.3, 0.6, 0.45] },
    fog: { color: 0x9aa8b0, near: 150, far: 800 },
    light: { sun: 0xe8e0c8, sunIntensity: 0.6, sky: 0x9cbcdc, ground: 0x4a463c, hemi: 0.44 },
    terrain: { sand: 0x8e8776, dirt: 0x736c5e, rock: 0x585349, scorch: 0x2a2822 },
    rock: { bands: [0x6a6558, 0x585349, 0x7a7466, 0x4a463e], count: 16 },
    thumb: 'linear-gradient(180deg,#21538f 0%,#9fc0d8 55%,#8e8776 56%,#585349 100%)',
  };

  // Chapter 6: Gingertown, the first town Cell emptied. A small, low town under an overcast sky (the city
  // builder: low blocks and no school); the street is full of clothes with nobody in them — props the
  // mission lays (cell_first.js). Story only.
  S.gingertown = {
    id: 'gingertown',
    name: 'Gingertown',
    subtitle: 'Earth · Age 767',
    type: 'ground',
    builder: 'city',
    storyOnly: true,
    music: 'battle',
    seed: 767,
    size: 360,
    city: {
      block: 30,
      blocks: 7,
      plazaRadius: 26,
      minHeight: 5,
      maxHeight: 13,
      noSchool: true,
      walls: [0xb88e6a, 0x9aa48a, 0xb07a62, 0x8e9aa8, 0xa89270],
      roof: 0x6a4436,
      school: 0xb88e6a,
      clock: 0xf0ece0,
      pavement: '#8a8478',
      road: '#4a4a4e',
      line: '#c8c0a0',
    },
    terrain: { sand: 0x8a8478, dirt: 0x6a655c, rock: 0x5a5a5c, scorch: 0x2a2a2c },
    sky: { top: 0x5a6878, horizon: 0xb8bcc0, bottom: 0x8a8a88, sunDir: [0.25, 0.55, 0.3] },
    fog: { color: 0xa8acb0, near: 90, far: 420 },
    light: { sun: 0xe0dcd0, sunIntensity: 0.52, sky: 0xa8b4c4, ground: 0x4a4844, hemi: 0.5 },
    thumb: 'linear-gradient(180deg,#5a6878 0%,#b8bcc0 55%,#8a8478 56%,#4a4a4e 100%)',
  };

  // Chapter 5: the future Trunks comes from — a city the Androids broke, seen only in his memory
  // (`trunks_future`). Story only: the city builder with most of it snapped off near the ground.
  S.future_ruins = {
    id: 'future_ruins',
    name: 'The Future',
    subtitle: 'Earth · Age 784 · what is left',
    type: 'ground',
    builder: 'city',
    storyOnly: true,
    music: 'vision',
    seed: 784,
    size: 440,
    city: {
      block: 44,
      blocks: 7,
      plazaRadius: 30,
      minHeight: 10,
      maxHeight: 40,
      ruin: 0.7,
      walls: [0x6a655e, 0x5e6268, 0x70625a, 0x5a6258, 0x665a58],
      roof: 0x2e3034,
      school: 0x6a655e,
      clock: 0x9a9890,
      pavement: '#5c5a56',
      road: '#34353a',
      line: '#6a665a',
    },
    terrain: { sand: 0x5c5a56, dirt: 0x4a4844, rock: 0x3e3e40, scorch: 0x1e1e20 },
    sky: { top: 0x2a2e36, horizon: 0x6a6a6a, bottom: 0x4a4a4c, sunDir: [0.2, 0.4, 0.3] },
    fog: { color: 0x5a5c60, near: 60, far: 380 },
    light: { sun: 0xc8c8cc, sunIntensity: 0.42, sky: 0x8a90a0, ground: 0x3a3836, hemi: 0.46 },
    thumb: 'linear-gradient(180deg,#2a2e36 0%,#6a6a6a 55%,#5c5a56 56%,#34353a 100%)',
  };

  // Chapter 5: the Son family's house on Mount Paozu, inside — the bedroom where
  // Goku lies with the heart virus. A small room built for one scene, not a
  // battle arena (storyOnly): walls, a window with afternoon light, a bed, a stool.
  S.son_house = {
    id: 'son_house',
    name: 'The Son House',
    subtitle: 'Mount Paozu · Age 767',
    type: 'ground',
    builder: 'room',
    storyOnly: true,
    music: 'farewell',
    seed: 737,
    arenaRadius: 5.5,
    ceiling: 3,
    sky: { top: 0x7a9ec0, horizon: 0xd8c8b0, bottom: 0x6a5a48 },
    light: { sun: 0xffe2b8, sunIntensity: 0.55, sky: 0xe8d8c0, ground: 0x5a4636, hemi: 0.62 },
    terrain: { sand: 0x8a6a4a, dirt: 0x7a5a3e, rock: 0x6a5040, scorch: 0x3a2a20 },
    room: {
      w: 9, d: 8, h: 3.2,
      floor: 0x8a6446, wall: 0xd8c8a8, trim: 0x7a5238, ceiling: 0xe8dcc4,
      bedFrame: 0x6a4630, sheet: 0xeae4d8, blanket: 0x7a9a6a, pillow: 0xf4efe6,
      windowLight: 0xfff0c8,
    },
    thumb: 'linear-gradient(180deg,#d8c8a8 0%,#d8c8a8 60%,#8a6446 61%,#6a4630 100%)',
  };

  // Chapter 6: the ring Cell built and invited the planet to. Small, raised and
  // paved — a stage meant to be fought on rather than roamed, with the broken
  // flat and the cliff wall closing everything in around it.
  S.cellarena = {
    id: 'cellarena',
    name: 'The Cell Games Arena',
    subtitle: 'Earth · Age 767',
    type: 'ground',
    builder: 'arena',
    music: 'finale',
    seed: 767,
    size: 440,
    segments: 176,
    arenaRadius: 150,
    ceiling: 110,
    sky: { top: 0x2a72d8, horizon: 0xbfe0f4, bottom: 0x8aa868, sunDir: [0.4, 0.7, 0.36] },
    fog: { color: 0xb8d4e4, near: 180, far: 860 },
    light: { sun: 0xfff6e2, sunIntensity: 0.74, sky: 0xc4dcf4, ground: 0x4a6a3a, hemi: 0.5 },
    // the valley floor is grass with bare dirt where the ground breaks; tan rock where it rises
    terrain: { sand: 0x6aa04a, dirt: 0x8c7a52, rock: 0xb48a5e, scorch: 0x3a342c },
    rock: { bands: [0xc0905e, 0xb07e52, 0xcc9e6c, 0xa2724a], count: 0 },
    arena: {
      half: 17, height: 1.5, rim: 0.5, tile: 2.125, // 16 x 16 tiles
      side: 0x9a94a8, trim: 0xc4c0d0, post: 0xd0ccda,
      // mid-tones on purpose: the toon ramp turns a pale top to flat white in daylight
      topCss: '#b4b0c2', lineCss: '#8e889e', trimCss: '#d4d0de', crackCss: '#4a4458',
      dust: 0xd8d4e2, debris: 0xb8b2c6,
      noSteps: true, noPosts: true, noCrowd: true,
      // four needle obelisks, one off each corner
      obelisks: { height: 15, radius: 0.72, base: 1.25, color: 0xcfcbdc, ring: 0xaaa4ba, off: 2.4 },
      // the horizon: flat-topped tan mesas instead of a cliff wall
      mesas: { count: 26, color: [0xc0905e, 0xb07e52, 0xd0a070, 0xa8784c], near: 170, far: 330 },
      // a dirt road leading away from the ring, as in the reference
      road: { from: [0, -19], to: [0, -150], width: 5, color: 0xa08a60 },
      // the high ground the Z Fighters watch from (Goku lies down up there after the forfeit)
      ridge: { x: -10, z: 44, r: 15, h: 7.5, color: 0xa88458 },
      // the World Champion's crew: a TV van and one camera on a tripod, on the far side of the ring
      crew: { x: 27, z: 14, yaw: -Math.PI / 2 - 0.4 },
    },
    thumb: 'linear-gradient(180deg,#2a72d8 0%,#bfe0f4 55%,#6aa04a 56%,#b48a5e 100%)',
  };

  // Satan City, Age 774: where Gohan goes to school and where the Great Saiyaman
  // works. Flat streets, a plaza with room to fight, a school with a clock.
  S.satan_city = {
    id: 'satan_city',
    name: 'Satan City',
    subtitle: 'Earth · Age 774',
    type: 'ground',
    builder: 'city',
    music: 'battle',
    seed: 774,
    size: 520,
    city: {
      block: 46,
      blocks: 8,
      plazaRadius: 34,
      minHeight: 14,
      maxHeight: 46,
      // mid-tones on purpose: the toon ramp pushes pale walls to white in daylight
      walls: [0xb09a7e, 0x8a9bb0, 0xc08e6a, 0x92a492, 0xa87e74],
      roof: 0x4a4e56,
      school: 0xc9b48c,
      clock: 0xf7f3e2,
      pavement: '#8f8a80',
      road: '#46474c',
      line: '#d8d2b8',
    },
    // the street is the ground: these colours are what craters and debris use
    terrain: { sand: 0x8f8a80, dirt: 0x6d6860, rock: 0x5f5f62, scorch: 0x2a2a2c },
    sky: { top: 0x3a8ae8, horizon: 0xcfe6f6, bottom: 0x9fb4c4, sunDir: [0.35, 0.72, 0.28] },
    fog: { color: 0xc8dcea, near: 220, far: 720 },
    light: { sun: 0xfff4e0, sunIntensity: 0.76, sky: 0xc6e0ff, ground: 0x5a564e, hemi: 0.5 },
  };


  // The 25th World Martial Arts Tournament, Age 774: a low stone ring in a paved
  // yard, stands on three sides full of people, the hall behind, and an
  // announcer with a microphone. Built on the arena builder, with a stadium
  // instead of a wasteland round it. Ring-outs are real here (rules.ringOut).
  S.tournament = {
    id: 'tournament',
    name: 'World Tournament',
    ringOut: true, // Free Battle here is a tournament match: out of the ring is out
    subtitle: 'Papaya Island · Age 774',
    type: 'ground',
    builder: 'arena',
    music: 'battle',
    seed: 774,
    size: 400,
    segments: 120,
    arenaRadius: 140,
    ceiling: 90,
    sky: { top: 0x3a8ae8, horizon: 0xcfe6f6, bottom: 0xa8c0a0, sunDir: [0.4, 0.7, 0.35] },
    fog: { color: 0xc8dcea, near: 180, far: 700 },
    light: { sun: 0xfff4e0, sunIntensity: 0.76, sky: 0xc6e0ff, ground: 0x6a6450, hemi: 0.52 },
    terrain: { sand: 0x9aae70, dirt: 0x7c8e58, rock: 0x7e7364, scorch: 0x3a342c },
    rock: { bands: [0x9c8a70, 0x8a7a62, 0xae9c80, 0x7a6a54], count: 0 },
    arena: {
      half: 12, height: 1.1, rim: 0.6, tile: 3,
      side: 0x9a9488, trim: 0xe8e2d4, post: 0xc8c0ae,
      topCss: '#d8d2c4', lineCss: '#b8b0a0', trimCss: '#f2eee4', crackCss: '#6a6458',
      dust: 0xd8d2c4, debris: 0xb4a894,
      stadium: { yard: 30, tiers: 4, yardColor: 0xc8bfa8, wall: 0xb8a888, stand: 0x9a8a70, hall: 0xd8c8a8, roof: 0xb84a2a },
    },
    thumb: 'linear-gradient(180deg,#3a8ae8 0%,#cfe6f6 55%,#d8d2c4 56%,#9a9488 100%)',
  };

  // The badlands where Babidi's ship came down, Age 774: a dry canyon, and the ship
  // itself half buried in a crater at the far end (landmarks `ship`, `hatch`).
  S.babidi_crater = {
    id: 'babidi_crater',
    name: 'The Wizard\'s Crater',
    subtitle: 'Earth · Age 774',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'battle',
    seed: 7741,
    size: 520,
    segments: 130,
    arenaRadius: 170,
    ceiling: 130,
    sky: { top: 0x3a7ac8, horizon: 0xe0d6c0, bottom: 0xb89a70, sunDir: [0.4, 0.6, 0.35] },
    fog: { color: 0xd8cab0, near: 170, far: 820 },
    light: { sun: 0xfff0d8, sunIntensity: 0.78, sky: 0xc8d8f0, ground: 0x6a5238, hemi: 0.5 },
    terrain: { sand: 0xb89a6a, dirt: 0x9a7a52, rock: 0x8a6a4e, scorch: 0x3a3024 },
    rock: { bands: [0xb07a4a, 0x9a6a3e, 0xc48a58, 0x8a5a36], count: 22 },
    babidiShip: { at: [0, 0, -120], radius: 24 },
    thumb: 'linear-gradient(180deg,#3a7ac8 0%,#e0d6c0 55%,#b89a6a 56%,#8a6a4e 100%)',
  };

  // Uub's village, Age 784: the far south — dry golden grass, red earth, round mud huts with thatched
  // cones in a ring round a beaten square and a well, a poor field, palms. The open ground to the east
  // is where he trains alone. (Stage._buildVillage)
  S.south_village = {
    id: 'south_village',
    name: "Uub's Village",
    subtitle: 'The far south · Age 784',
    type: 'ground',
    builder: 'wasteland',
    music: 'uub_theme',
    seed: 7840,
    size: 520,
    segments: 130,
    arenaRadius: 160,
    ceiling: 130,
    sky: { top: 0x3a84d8, horizon: 0xf2e4c4, bottom: 0xc8b080, sunDir: [0.45, 0.62, 0.3] },
    fog: { color: 0xeadcc0, near: 180, far: 760 },
    light: { sun: 0xfff0d0, sunIntensity: 0.8, sky: 0xd8e4f0, ground: 0x7a5a34, hemi: 0.5 },
    terrain: { sand: 0xc4a464, dirt: 0xa47a46, rock: 0x8a6a4a, scorch: 0x3a2a1c },
    rock: { bands: [0xa07a52, 0x8a6a46, 0xb48c60, 0x7a5a3c], count: 8, near: 70, far: 160, clearX: 44, clearZ: 44 },
    mesas: { bands: [0x9a7a52, 0x8a6a46, 0xa88a60], scale: 0.8 },
    trees: { count: 48, leaf: 0x5a8a34, trunk: 0x6a4a2a },
    village: {
      huts: [[-14, -12, 2.6], [-4, -19, 2.8], [8, -17, 2.4], [17, -9, 2.6], [20, 4, 2.2], [-19, 2, 2.5], [-15, 14, 2.3], [14, 15, 2.4], [-26, -5, 2.0]],
      well: [3, -2],
      field: [-36, 4, 14, 18],
      fences: [[-43, -5.5, -29, -5.5], [-43, 13.5, -29, 13.5], [-43, -5.5, -43, 13.5], [23, -3, 28, -9]],
      racks: [[-8, 8, 0.4], [10, -7, -0.8]],
      palms: [[-11, -16, 7, 0.08], [12, -13, 6.5, -0.1], [23, -1, 7.5, 0.12], [-22, 8, 6, -0.06], [-6, 19, 7, 0.05], [18, 10, 6.8, -0.08], [30, -14, 8, 0.1], [-31, 11, 7, -0.1]],
      road: 40,
      training: [36, -6],
    },
    thumb: 'linear-gradient(180deg,#3a84d8 0%,#f2e4c4 55%,#c4a464 56%,#a47a46 100%)',
  };

  // Where Babidi sends the two of them to settle it, Age 774: a badlands of close rock towers
  // (the fight brings them down), a hard afternoon light, room to go up. The ruin it becomes is
  // Stage.devastate, not another stage: the same towers lie broken where they stood.
  S.majin_wastes = {
    id: 'majin_wastes',
    name: 'The Wastes',
    subtitle: 'Earth · Age 774 · where Babidi sent them',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'finale',
    seed: 7744,
    size: 520,
    segments: 130,
    arenaRadius: 160,
    ceiling: 130,
    sky: { top: 0x3a6ec0, horizon: 0xf0cc98, bottom: 0xc08a5a, sunDir: [0.55, 0.45, 0.25] },
    fog: { color: 0xe0c6a0, near: 150, far: 760 },
    light: { sun: 0xffe4c0, sunIntensity: 0.84, sky: 0xc8d4f0, ground: 0x7a4a2a, hemi: 0.5 },
    terrain: { sand: 0xb88458, dirt: 0x946440, rock: 0x7a5236, scorch: 0x2e2018 },
    rock: { bands: [0xb06a3a, 0x965a30, 0xc8804a, 0x7e4a28], count: 26, near: 26, far: 130, clearX: 20, clearZ: 26 },
    mesas: { bands: [0xa0603a, 0x8a5030, 0xb87044], scale: 1.1 },
    thumb: 'linear-gradient(180deg,#3a6ec0 0%,#f0cc98 55%,#b88458 56%,#7e4a28 100%)',
  };

  // The rocky canyon where Vegeta comes back from the dead, Age 774: a narrow floor between tall red
  // mesas and walls, close enough to hide behind (and for Buuhan to blow apart).
  S.rocky_canyon = {
    id: 'rocky_canyon',
    name: 'The Canyon',
    subtitle: 'Earth · Age 774 · where the Prince came back',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'finale',
    seed: 7747,
    size: 520,
    segments: 130,
    arenaRadius: 160,
    ceiling: 130,
    sky: { top: 0x2f68b8, horizon: 0xf2d2a0, bottom: 0xc8905a, sunDir: [0.35, 0.62, 0.3] },
    fog: { color: 0xe6caa0, near: 140, far: 700 },
    light: { sun: 0xffe6c4, sunIntensity: 0.84, sky: 0xc4d4f0, ground: 0x7a4428, hemi: 0.5 },
    terrain: { sand: 0xc08a5a, dirt: 0xa06a40, rock: 0x84502e, scorch: 0x2e1e16 },
    rock: { bands: [0xb86a36, 0xa0582c, 0xd07c44, 0x864426], count: 34, near: 18, far: 110, clearX: 16, clearZ: 22 },
    mesas: { bands: [0xb0643a, 0x965430, 0xc8784a], scale: 1.35 },
    thumb: 'linear-gradient(180deg,#2f68b8 0%,#f2d2a0 55%,#c08a5a 56%,#864426 100%)',
  };

  // Inside Majin Buu: pink, wet, breathing, and much bigger on the inside than it has any right to
  // be. The walls, the tubes and the pods are the mission's set (SL.data.vegitoKit.innards).
  S.buu_inside = {
    id: 'buu_inside',
    name: 'Inside Majin Buu',
    subtitle: 'Nowhere anybody should be',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'vision',
    seed: 7748,
    size: 260,
    segments: 90,
    arenaRadius: 60,
    ceiling: 30,
    sky: { top: 0x2a0816, horizon: 0x8a2848, bottom: 0x4a1024, sunDir: [0.2, 0.8, 0.3] },
    fog: { color: 0x5a1a30, near: 18, far: 110 },
    light: { sun: 0xffb0c8, sunIntensity: 0.62, sky: 0xd06a8a, ground: 0x3a0a1a, hemi: 0.5 },
    terrain: { sand: 0xd06a8a, dirt: 0xb8587a, rock: 0x9a3a60, scorch: 0x4a1024 },
    rock: { bands: [0xe07a9a, 0xc8608a, 0xf0a0bc, 0xb04a72], count: 0 },
    thumb: 'linear-gradient(180deg,#2a0816 0%,#8a2848 55%,#d06a8a 56%,#9a3a60 100%)',
  };

  // Babidi's ship, first floor: he turns the room into Planet Zoon — a red, heavy
  // world. (The floors are made by his magic; the game builds each one as a stage.)
  S.ship_zoon = {
    id: 'ship_zoon',
    name: 'Planet Zoon',
    subtitle: 'Babidi\'s ship · first floor',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'battle',
    seed: 7742,
    size: 300,
    segments: 90,
    arenaRadius: 90,
    ceiling: 70,
    gravity: 1.6,
    sky: { top: 0x6a2a1a, horizon: 0xd88a4a, bottom: 0x8a4a2a, sunDir: [0.3, 0.5, 0.4] },
    fog: { color: 0xc8784a, near: 90, far: 320 },
    light: { sun: 0xffc890, sunIntensity: 0.8, sky: 0xffb080, ground: 0x6a3a24, hemi: 0.55 },
    terrain: { sand: 0xb8683a, dirt: 0x9a522e, rock: 0x7a4028, scorch: 0x2a1810 },
    rock: { bands: [0x9a4a2a, 0x8a3e24, 0xb05a34, 0x7a3620], count: 10 },
    thumb: 'linear-gradient(180deg,#6a2a1a 0%,#d88a4a 55%,#b8683a 56%,#7a4028 100%)',
  };

  // Second floor: a planet with no light at all, which is where Yakon comes from.
  S.ship_dark = {
    id: 'ship_dark',
    name: 'The Dark Planet',
    subtitle: 'Babidi\'s ship · second floor',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'battle',
    seed: 7743,
    size: 300,
    segments: 90,
    arenaRadius: 90,
    ceiling: 70,
    sky: { top: 0x04040a, horizon: 0x12121e, bottom: 0x0a0a10 },
    fog: { color: 0x0c0c16, near: 40, far: 180 },
    light: { sun: 0x8a8aa8, sunIntensity: 0.22, sky: 0x3a3a5a, ground: 0x101018, hemi: 0.34 },
    terrain: { sand: 0x2a2a34, dirt: 0x22222a, rock: 0x34343e, scorch: 0x0a0a0e },
    rock: { bands: [0x34343e, 0x2a2a34, 0x3e3e4a, 0x26262e], count: 10 },
    thumb: 'linear-gradient(180deg,#04040a 0%,#12121e 55%,#2a2a34 56%,#34343e 100%)',
  };

  // Third floor: Dabura's own world, the Demon Realm — red sky, black stone.
  S.demon_realm = {
    id: 'demon_realm',
    name: 'The Demon Realm',
    subtitle: 'Babidi\'s ship · third floor',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'finale',
    seed: 7744,
    size: 340,
    segments: 100,
    arenaRadius: 110,
    ceiling: 90,
    sky: { top: 0x3a0a0a, horizon: 0xc83a1a, bottom: 0x2a0808, sunDir: [0.2, 0.4, 0.5] },
    fog: { color: 0x8a2412, near: 90, far: 360 },
    light: { sun: 0xff9a6a, sunIntensity: 0.72, sky: 0xff6a4a, ground: 0x2a0a08, hemi: 0.5 },
    terrain: { sand: 0x3a2224, dirt: 0x2a1618, rock: 0x4a2a2a, scorch: 0x100606 },
    rock: { bands: [0x3a1a1a, 0x2a1414, 0x4a2020, 0x221010], count: 14 },
    thumb: 'linear-gradient(180deg,#3a0a0a 0%,#c83a1a 55%,#3a2224 56%,#4a2a2a 100%)',
  };


  /* ---------------- CHAPTER 16: BATTLE OF GODS (Age 778) — builders in src/game/stage_gods.js ---------------- */

  // BEERUS' WORLD: a small floating island of teal grass in a nebula, the inverted-pyramid temple at the back,
  // the god's bed under its canopy in front of it. Space all round: violet, teal and rose gas, a ringed planet.
  S.beerus_world = {
    id: 'beerus_world',
    name: "Beerus' World",
    subtitle: 'The Realm of the God of Destruction',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'beerus_theme',
    seed: 7781,
    size: 260,
    segments: 130,
    arenaRadius: 90,
    ceiling: 80,
    islet: {
      radius: 40, drop: 320, bumps: 0.7, templeZ: -27, bedZ: -4, treeX: -24, treeZ: -6,
      grass: 0x3aa894, grass2: 0x2a8a80, path: 0xd8cbb0, path2: 0xc2b494, underside: 0x1a0c34,
      rock: 0x5e4e72, rock2: 0x6e5c84, stone: 0xe6dcc4, stone2: 0xcfc2a6, gold: 0xe2b440,
      cloth: 0x6a3a9a, cloth2: 0x8a5ab8, bark: 0x6a4a5a, leaf: 0xf28a6a, leaf2: 0xe86a9a,
      nebula: [0x8a3ad8, 0x2ab8c8, 0xd84a9a, 0x5a5ae8, 0x3ad8a8], planet: 0xd8a06a, planetRing: 0xf2d8b0,
    },
    sky: { top: 0x12062a, horizon: 0x3a2a7a, bottom: 0x1a0a30, sunDir: [0.55, 0.45, -0.4] },
    fog: { color: 0x2a1a4a, near: 220, far: 900 },
    light: { sun: 0xffe8f0, sunIntensity: 0.7, sky: 0xc8a8ff, ground: 0x2a5a5a, hemi: 0.58 },
    terrain: { sand: 0x3aa894, dirt: 0x2a8a80, rock: 0x5e4e72, scorch: 0x1a1428 },
    rock: { bands: [0x5e4e72, 0x6e5c84], count: 0 },
    thumb: 'linear-gradient(180deg,#12062a 0%,#3a2a7a 55%,#3aa894 56%,#2a8a80 100%)',
  };

  // THE PRINCESS BULMA: Bulma's cruise liner on a calm, endless ocean; her birthday party on the deck. The deck
  // is the ground (y 0); off its edge there is only the sea 7.5 m below. The ocean battle is fought over it.
  S.cruise_liner = {
    id: 'cruise_liner',
    name: 'The Princess Bulma',
    subtitle: "Bulma's birthday · Age 778",
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'peaceful',
    seed: 7782,
    // the sea floor past the grid is never seen (the water covers it): a 300 m grid at 1.5 m keeps the deck's edge
    // sharp without paying for a quarter of a million triangles of ocean floor
    size: 300,
    segments: 200,
    arenaRadius: 210,
    ceiling: 150,
    liner: {
      length: 92, beam: 28, bowAt: 16, cabinZ: -30, sea: 12, waterline: 7.5,
      tables: [[-7, 15], [7, 16], [-8, 25], [8, 26], [-7, 3], [7, 4]], buffet: [-11, 12], pool: [7, -6, 6, 9], stage: [-4, -13], cake: [2, -9],
      deck: 0xc89a62, deck2: 0xb88a54, trim: 0xe8e2d4, seabed: 0x0e3a5a, hull: 0xf4f2ee, hullLow: 0x1a2a4a, stripe: 0x2a5ac8,
      rail: 0xe8e8ec, funnel: 0xf4f2ee, cloth: 0xffffff, water: 0x1f78b4, flags: [0xe83a3a, 0xf2c83a, 0x3a9ae8, 0x4ac85a, 0xe86ab8],
    },
    sky: { top: 0x2a7ae8, horizon: 0xcfeaf8, bottom: 0x7ac8e8, sunDir: [0.4, 0.62, 0.3] },
    fog: { color: 0xc8e2f2, near: 260, far: 1400 },
    light: { sun: 0xfff6e2, sunIntensity: 0.78, sky: 0xcfe6ff, ground: 0x3a6a8a, hemi: 0.54 },
    terrain: { sand: 0xc89a62, dirt: 0xb88a54, rock: 0xa87a4a, scorch: 0x3a2a1a },
    rock: { bands: [0xb0a090], count: 0 },
    thumb: 'linear-gradient(180deg,#2a7ae8 0%,#cfeaf8 55%,#1f78b4 56%,#0e3a5a 100%)',
  };

  // THE CRYSTAL CAVERN: under the sea floor — dark rock under a dome, crystals in the walls and the roof that
  // light the fight, and clusters on the floor that shatter when the gods hit them.
  S.crystal_cavern = {
    id: 'crystal_cavern',
    name: 'The Crystal Cavern',
    subtitle: 'Under the sea floor',
    type: 'ground',
    builder: 'wasteland',
    storyOnly: true,
    music: 'ssj_god',
    seed: 7783,
    size: 260,
    segments: 130,
    arenaRadius: 62,
    ceiling: 40,
    cavern: {
      radius: 56, domeScale: 0.6, breakable: 16,
      floor: 0x2a2a44, floor2: 0x3a3456, wall: 0x22203a,
      crystals: [0x7ae6ff, 0xc88aff, 0xe8fbff, 0x5ac8ff],
      lights: [[0, 18, 0, 0x7ad8ff], [-30, 10, 20, 0xb87aff], [28, 12, -22, 0x6ae0ff]],
    },
    sky: { top: 0x04040c, horizon: 0x0a0a1a, bottom: 0x04040a },
    fog: { color: 0x0c1028, near: 30, far: 170 },
    light: { sun: 0xa8c8ff, sunIntensity: 0.45, sky: 0x7a8aff, ground: 0x2a2a44, hemi: 0.56 },
    terrain: { sand: 0x2a2a44, dirt: 0x3a3456, rock: 0x22203a, scorch: 0x0a0a12 },
    rock: { bands: [0x2a2840, 0x34304a], count: 0 },
    thumb: 'linear-gradient(180deg,#04040c 0%,#2a2a5a 55%,#7ae6ff 56%,#22203a 100%)',
  };

  // THE STRATOSPHERE: no ground — the curve of the Earth far below, a floor of cloud, the sky going black
  // (stage.setAltitude 0..1 as the fight climbs). The Sphere of Destruction is thrown from here.
  S.stratosphere = {
    id: 'stratosphere',
    name: 'The Edge of Space',
    subtitle: 'Above the Earth',
    type: 'space',
    builder: 'heights',
    storyOnly: true,
    music: 'ssj_god',
    seed: 7784,
    arenaRadius: 160,
    ceiling: 120,
    floor: -90,
    heights: {
      earthR: 2600, earthTop: 260, earthDrop: 340, cloudY: 150, cloudDrop: 120, start: 0.6,
      lowTop: 0x1a5ad8, lowHorizon: 0x9ad2ff, lowBottom: 0xeaf6ff,
      highTop: 0x000004, highHorizon: 0x081a48, highBottom: 0x1a5ab8,
    },
    sky: { top: 0x000004, horizon: 0x081a48, bottom: 0x1a5ab8, sunDir: [0.6, 0.4, -0.35] },
    fog: null,
    light: { sun: 0xfff6e8, sunIntensity: 0.95, sky: 0x9ac0ff, ground: 0x2a4a8a, hemi: 0.5 },
    rock: { bands: [0x6a6a7a], count: 0 },
    thumb: 'radial-gradient(circle at 50% 130%,#9ad2ff 0%,#1a5ab8 30%,#081a48 55%,#000004 100%)',
  };

})();
