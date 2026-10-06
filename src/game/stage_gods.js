/*
 * THE BATTLE OF GODS PLACES — stage builders added to SL.Stage for Chapter 16 (stages.js: beerus_world,
 * cruise_liner, crystal_cavern, stratosphere). Same toolkit as every other stage: the wasteland height grid
 * (heightAt, craters, the camera's terrain checks all work unchanged), obstacles for anything solid, props for
 * anything breakable, and the stage's own seeded random stream (never Math.random: a stage must be the same
 * every time it is built).
 *
 *   def.islet    Beerus' world: a small floating island of teal grass in a nebula, the inverted-pyramid temple
 *                on its stone pillar at the back, the god's bed under a canopy in front of it, a giant tree,
 *                floating rocks, a ringed planet and a sky full of gas clouds
 *   def.liner    the Princess Bulma, Bulma's cruise liner, on an ocean that goes to the horizon: a wooden deck
 *                (flat, y 0) inside the hull, the sea 7.5 m below it; the cabin block, the funnel, railings,
 *                party tables, the buffet, the pool, the bingo stage, bunting
 *   def.cavern   a crystal cavern under the sea floor: a bowl of dark rock under a dome, crystals in the walls
 *                and the roof, breakable crystal clusters on the floor (addCrystal: props that shatter)
 *   builder 'heights'  the stratosphere: no ground — the curve of the Earth far below, a cloud floor, stars that
 *                come out as the sky goes black (setAltitude 0..1)
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const P = SL.Stage.prototype;

  /* ================================================================ heights and colours */
  /** The liner's hull: half its width at a distance z along the keel (bow at +z). */
  function hullHalf(L, z) {
    if (z > L.length / 2 || z < -L.length / 2) return 0;
    if (z > L.bowAt) {
      const k = (z - L.bowAt) / (L.length / 2 - L.bowAt);
      return L.beam / 2 * Math.sqrt(Math.max(0, 1 - k * k)) * (1 - k * 0.25);
    }
    if (z < -L.length / 2 + 8) {
      const k = (z + L.length / 2 - 8) / 8;
      return L.beam / 2 * Math.sqrt(Math.max(0, 1 - k * k * 0.7));
    }
    return L.beam / 2;
  }
  P.hullHalf = function (z) {
    return this.def.liner ? hullHalf(this.def.liner, z) : 0;
  };
  /** Is a point on the deck of the liner? */
  P.onDeck = function (x, z) {
    return !!this.def.liner && Math.abs(x) < hullHalf(this.def.liner, z);
  };

  P._godsHeight = function (def, x, z, d, noise) {
    if (def.islet) {
      const I = def.islet, R = I.radius;
      const top = noise.fbm(x * 0.035, z * 0.035, 3) * (I.bumps || 0.8);
      if (d <= R) return top;
      if (d <= R + 5) return top - Math.pow(d - R, 2) * 1.2;
      return -I.drop;
    }
    if (def.liner) {
      const L = def.liner;
      const w = hullHalf(L, z);
      if (Math.abs(x) < w) return 0;
      // the sea floor under the water, far below the deck
      return -L.sea + noise.fbm(x * 0.02, z * 0.02, 2) * 0.6;
    }
    if (def.cavern) {
      const C = def.cavern, R = C.radius;
      const floor = noise.fbm(x * 0.05, z * 0.05, 3) * 1.4 + noise(x * 0.2, z * 0.2) * 0.25;
      if (d <= R) return floor;
      // the walls: rock rising out of the floor into the dome
      return floor + Math.pow((d - R) / 4, 1.6) * 6;
    }
    return 0;
  };

  P._godsColor = function (def, x, z, h, c, noise) {
    if (def.islet) {
      const I = def.islet, d = Math.hypot(x, z);
      const n = noise(x * 0.1, z * 0.1);
      c.set(I.grass).lerp(new THREE.Color(I.grass2), U.clamp01(n * 0.8 + 0.1));
      // the stone path from the bed to the temple and the paved court round the bed
      if (Math.abs(x) < 2.2 && z < -2 && z > -24) c.set(I.path).lerp(new THREE.Color(I.path2), (Math.floor(z / 1.6) % 2 === 0) ? 0 : 0.5);
      if (Math.hypot(x, z + 4) < 6) c.set(I.path).lerp(new THREE.Color(I.path2), (Math.floor(Math.atan2(z + 4, x) * 3) + Math.floor(Math.hypot(x, z + 4) / 1.5)) % 2 ? 0.5 : 0);
      if (d > I.radius) c.set(I.underside);
      return;
    }
    if (def.liner) {
      const L = def.liner;
      const w = hullHalf(L, z);
      if (Math.abs(x) < w) {
        // planks running bow to stern, a darker seam every board
        const board = Math.floor((x + 40) / 0.9);
        c.set(board % 2 ? L.deck : L.deck2);
        if (Math.abs(x) > w - 1.1) c.set(L.trim);
      } else c.set(L.seabed);
      return;
    }
    if (def.cavern) {
      const C = def.cavern, d = Math.hypot(x, z);
      const n = noise(x * 0.09, z * 0.09);
      c.set(C.floor).lerp(new THREE.Color(C.floor2), U.clamp01(n));
      if (d > C.radius) c.set(C.wall).lerp(new THREE.Color(C.floor2), U.clamp01(n * 0.5));
    }
  };

  /* ================================================================ shared bits */
  P._gMesh = function (geo, color, opts = {}) {
    const T = SL.Toon;
    const mat = color && color.isMaterial ? color : opts.basic ? this.track(new THREE.MeshBasicMaterial({ color, fog: opts.fog !== false, transparent: !!opts.opacity, opacity: opts.opacity === undefined ? 1 : opts.opacity, side: opts.side || THREE.FrontSide, depthWrite: opts.depthWrite !== false })) : T.mat(color);
    const m = new THREE.Mesh(this.track(geo), mat);
    if (opts.pos) m.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
    if (opts.rot) m.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
    if (opts.scale) typeof opts.scale === 'number' ? m.scale.setScalar(opts.scale) : m.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
    if (opts.outline) T.addOutline(m, opts.outline);
    m.castShadow = opts.shadow !== false && !opts.basic;
    m.receiveShadow = !opts.basic;
    (opts.parent || this.scene).add(m);
    return m;
  };
  P._gGlow = function (pos, color, size, opacity = 0.6, parent) {
    const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color, blending: THREE.AdditiveBlending, transparent: true, opacity, depthWrite: false, fog: false })));
    sp.position.copy(pos);
    sp.scale.setScalar(size);
    (parent || this.scene).add(sp);
    return sp;
  };
  P._gStars = function (n, radius, size, opacity = 0.9) {
    const rng = this.rng, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new V3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize().multiplyScalar(radius);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    }
    const geo = this.track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(geo, this.track(new THREE.PointsMaterial({ color: 0xffffff, size, sizeAttenuation: false, fog: false, transparent: true, opacity, depthWrite: false })));
    pts.renderOrder = -9;
    this.scene.add(pts);
    this.stars = pts;
    return pts;
  };
  /** A cluster of crystals (a group): long hexagonal points out of one root, pointing along `up`. */
  P._gCrystalCluster = function (colors, size, rng) {
    const g = new THREE.Group();
    const n = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) {
      const h = size * (0.8 + rng() * 1.4), r = size * (0.14 + rng() * 0.1);
      const col = colors[i % colors.length];
      const mat = this.track(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 }));
      const body = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r, r * 0.8, h, 6)), mat);
      body.position.y = h / 2;
      const tip = new THREE.Mesh(this.track(new THREE.ConeGeometry(r, r * 2.2, 6)), mat);
      tip.position.y = h + r * 1.1;
      const one = new THREE.Group();
      one.add(body, tip);
      SL.Toon.addOutline(body, 1.2);
      one.rotation.set((rng() - 0.5) * 0.9, rng() * Math.PI, (rng() - 0.5) * 0.9);
      g.add(one);
    }
    return g;
  };

  /* ================================================================ BEERUS' WORLD */
  P._buildIslet = function (I) {
    const T = SL.Toon, rng = this.rng, R = I.radius;
    this.landmarks = this.landmarks || {};
    // the underside: an upturned cone of rock the island sits on, hanging in the nebula
    const under = this._gMesh(new THREE.ConeGeometry(R + 4, 70, 18, 4), I.rock, { pos: [0, -36, 0], rot: [Math.PI, 0, 0], outline: 2 });
    const pa = under.geometry.attributes.position;
    for (let k = 0; k < pa.count; k++) {
      const j = 1 + (rng() - 0.5) * 0.18;
      pa.setX(k, pa.getX(k) * j);
      pa.setZ(k, pa.getZ(k) * j);
    }
    under.geometry.computeVertexNormals();
    const lip = this._gMesh(new THREE.CylinderGeometry(R + 4, R + 4.2, 2.4, 40), I.rock2, { pos: [0, -1.4, 0], outline: 1.6 });
    lip.receiveShadow = true;

    // THE TEMPLE: an upside-down pyramid of pale stone balanced on a pillar at the back of the island
    const TZ = I.templeZ;
    const temple = new THREE.Group();
    temple.position.set(0, 0, TZ);
    this.scene.add(temple);
    const pillarH = 9;
    this._gMesh(new THREE.CylinderGeometry(3.2, 4.4, pillarH, 12), I.stone2, { parent: temple, pos: [0, pillarH / 2, 0], outline: 1.6 });
    this._gMesh(new THREE.CylinderGeometry(5.6, 6.2, 1.2, 16), I.stone2, { parent: temple, pos: [0, 0.6, 0], outline: 1.4 });
    const pyrH = 20, pyrR = 15;
    const pyr = this._gMesh(new THREE.ConeGeometry(pyrR, pyrH, 4, 1), I.stone, { parent: temple, pos: [0, pillarH + pyrH / 2, 0], rot: [Math.PI, Math.PI / 4, 0], outline: 2.4 });
    pyr.castShadow = true;
    // gold bands round the broad top and a dark doorway on the top's front edge
    const topY = pillarH + pyrH;
    const side = pyrR * Math.SQRT1_2 * 2;
    for (const [x, z, ry] of [[0, side / 2, 0], [0, -side / 2, 0], [side / 2, 0, Math.PI / 2], [-side / 2, 0, Math.PI / 2]]) {
      this._gMesh(new THREE.BoxGeometry(side + 0.6, 0.9, 0.6), I.gold, { parent: temple, pos: [x, topY - 0.45, z], rot: [0, ry, 0], outline: 1 });
      this._gMesh(new THREE.BoxGeometry(side * 0.7, 0.5, 0.5), I.gold, { parent: temple, pos: [x * 0.66, topY - 7.5, z * 0.66], rot: [0, ry, 0], outline: 0.8 });
    }
    // a small stepped shrine on top, glowing inside
    this._gMesh(new THREE.BoxGeometry(9, 3.4, 9), I.stone2, { parent: temple, pos: [0, topY + 1.7, 0], outline: 1.4 });
    this._gMesh(new THREE.BoxGeometry(6, 2.4, 6), I.stone, { parent: temple, pos: [0, topY + 4.6, 0], outline: 1.2 });
    this._gMesh(new THREE.ConeGeometry(2.4, 3.4, 4), I.gold, { parent: temple, pos: [0, topY + 7.5, 0], rot: [0, Math.PI / 4, 0], outline: 1 });
    this._gMesh(new THREE.BoxGeometry(2.4, 2.6, 0.3), 0x1a0a2a, { parent: temple, pos: [0, topY + 1.4, 4.56], outline: 0 });
    this._gGlow(new V3(0, topY + 1.6, TZ + 4.8), 0xb88aff, 5, 0.55);
    this.obstacles.push({ shape: 'cyl', x: 0, z: TZ, y: 0, r: 4.6, h: pillarH, top: pillarH, hp: 1e9, maxHp: 1e9, alive: true, group: temple, color: I.stone2 });
    this.obstacles.push({ shape: 'cyl', x: 0, z: TZ, y: pillarH, r: pyrR * 0.8, h: pyrH + 9, top: topY + 9, hp: 1e9, maxHp: 1e9, alive: true, group: temple, color: I.stone });
    this.landmarks.temple = new V3(0, 0, TZ);
    this.landmarks.shrine = new V3(0, topY + 0.2, TZ + 5.6);

    // THE BED: a stone platform under a canopy of purple cloth on four gold posts, a fat pillow
    const BZ = I.bedZ;
    const bed = new THREE.Group();
    bed.position.set(0, 0, BZ);
    this.scene.add(bed);
    this._gMesh(new THREE.BoxGeometry(4.4, 0.7, 2.8), I.stone2, { parent: bed, pos: [0, 0.35, 0], outline: 1 });
    this._gMesh(new THREE.BoxGeometry(4.1, 0.32, 2.5), I.cloth, { parent: bed, pos: [0, 0.86, 0], outline: 0.8 });
    this._gMesh(new THREE.CapsuleGeometry(0.34, 1.4, 4, 10), I.cloth2, { parent: bed, pos: [-1.6, 1.15, 0], rot: [Math.PI / 2, 0, 0], outline: 0.6 });
    for (const [x, z] of [[2.1, 1.3], [-2.1, 1.3], [2.1, -1.3], [-2.1, -1.3]]) this._gMesh(new THREE.CylinderGeometry(0.1, 0.12, 4.2, 8), I.gold, { parent: bed, pos: [x, 2.1, z], outline: 0.6 });
    const canopy = this._gMesh(new THREE.BoxGeometry(4.6, 0.16, 3), I.cloth, { parent: bed, pos: [0, 4.2, 0], outline: 0.8 });
    canopy.castShadow = true;
    for (const z of [1.45, -1.45]) this._gMesh(new THREE.BoxGeometry(4.6, 1.1, 0.06), I.cloth2, { parent: bed, pos: [0, 3.6, z], outline: 0 });
    this.obstacles.push({ shape: 'cyl', x: 0, z: BZ, y: 0, r: 2, h: 0.9, top: 0.9, hp: 1e9, maxHp: 1e9, alive: true, group: bed, color: I.stone2 });
    this.landmarks.bed = new V3(0, 0.9, BZ);
    // what the story camera has to see round (Cinema.occluded): the posts, the canopy and its two curtains — the
    // posts never push anybody, they only keep a lens from parking behind them (the owner: Whis hidden by the bed)
    this.occluders = this.occluders || [];
    for (const [x, z] of [[2.1, 1.3], [-2.1, 1.3], [2.1, -1.3], [-2.1, -1.3]]) this.occluders.push({ shape: 'cyl', x, z: BZ + z, r: 0.2, bottom: 0, top: 4.3 });
    this.occluders.push({ shape: 'box', min: new V3(-2.3, 3.0, BZ - 1.55), max: new V3(2.3, 4.32, BZ + 1.55) });
    this.occluders.push({ shape: 'box', min: new V3(-2.25, 0, BZ - 1.45), max: new V3(2.25, 0.95, BZ + 1.45) });
    this.landmarks.bedFront = new V3(0, 0, BZ + 1.4);

    // stone lanterns along the path, each with a violet flame
    for (const z of [-8, -14, -20]) {
      for (const x of [3.6, -3.6]) {
        this._gMesh(new THREE.CylinderGeometry(0.3, 0.42, 1.6, 6), I.stone2, { pos: [x, 0.8, z], outline: 0.8 });
        this._gMesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), I.stone, { pos: [x, 1.9, z], outline: 0.8 });
        this._gGlow(new V3(x, 1.95, z), 0xc89aff, 1.6, 0.8);
      }
    }

    // THE TREE: a huge twisted trunk on the left with a canopy of pink-orange leaves
    const tree = new THREE.Group();
    tree.position.set(I.treeX, 0, I.treeZ);
    this.scene.add(tree);
    let tp = new V3(0, 0, 0);
    for (let i = 0; i < 6; i++) {
      const r0 = 2.2 - i * 0.28;
      const seg = this._gMesh(new THREE.CylinderGeometry(r0 - 0.26, r0, 4.6, 9), I.bark, { parent: tree, pos: [tp.x, tp.y + 2.3, tp.z], rot: [(rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.35], outline: 1.4 });
      seg.castShadow = true;
      tp = tp.clone().add(new V3((rng() - 0.5) * 1.4, 4.2, (rng() - 0.5) * 1.4));
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, rr = 4 + rng() * 4;
      this._gMesh(new THREE.IcosahedronGeometry(3.2 + rng() * 2.2, 1), i % 3 ? I.leaf : I.leaf2, { parent: tree, pos: [tp.x + Math.cos(a) * rr, tp.y + (rng() - 0.3) * 3, tp.z + Math.sin(a) * rr], outline: 1.4 });
    }
    this.obstacles.push({ shape: 'cyl', x: I.treeX, z: I.treeZ, y: 0, r: 2.4, h: 26, top: 26, hp: 1e9, maxHp: 1e9, alive: true, group: tree, color: I.bark });
    this.landmarks.tree = new V3(I.treeX, 0, I.treeZ);

    // floating rocks drifting round the island at every height
    for (let i = 0; i < 26; i++) {
      const a = rng() * Math.PI * 2, d = R + 10 + rng() * 90;
      const r = 1.2 + rng() * 4.5;
      const g = this.track(new THREE.DodecahedronGeometry(r, 0));
      const m = new THREE.Mesh(g, T.mat(i % 2 ? I.rock : I.rock2));
      T.addOutline(m, 1.6);
      m.position.set(Math.cos(a) * d, -30 + rng() * 70, Math.sin(a) * d);
      m.userData.spin = new V3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.25);
      this.scene.add(m);
      this.spinners.push(m);
      // a tuft of the island's grass on the bigger ones
      if (r > 3) this._gMesh(new THREE.CylinderGeometry(r * 0.7, r * 0.75, 0.6, 9), I.grass, { pos: [m.position.x, m.position.y + r * 0.62, m.position.z], outline: 1 });
    }

    // THE SKY: nebula clouds (big soft sprites in violet, teal and rose), stars, a ringed planet, a far sun
    this._gStars(1600, 900, 1.6, 0.85);
    for (let i = 0; i < 26; i++) {
      const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.smoke, color: I.nebula[i % I.nebula.length], blending: THREE.AdditiveBlending, transparent: true, opacity: 0.32 + rng() * 0.25, depthWrite: false, fog: false })));
      const a = rng() * Math.PI * 2, el = (rng() - 0.35) * 1.2;
      const d = 520 + rng() * 260;
      sp.position.set(Math.cos(a) * Math.cos(el) * d, Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d);
      sp.scale.set(260 + rng() * 380, 140 + rng() * 260, 1);
      sp.material.rotation = rng() * Math.PI;
      this.scene.add(sp);
    }
    const planet = new THREE.Group();
    this._gMesh(new THREE.SphereGeometry(46, 32, 20), I.planet, { parent: planet, outline: 0, shadow: false, basic: true, fog: false });
    const ring = this._gMesh(new THREE.TorusGeometry(76, 7, 2, 64), I.planetRing, { parent: planet, rot: [Math.PI / 2 - 0.35, 0.2, 0], scale: [1, 1, 0.08], basic: true, fog: false, opacity: 0.75, depthWrite: false });
    ring.renderOrder = 2;
    planet.position.set(-330, 210, -560);
    this.scene.add(planet);
    this._gGlow(new V3(420, 260, -380), 0xfff0d0, 130, 0.7);
    this.landmarks.center = new V3(0, 0, 0);
  };

  /* ================================================================ THE PRINCESS BULMA */
  P._buildLiner = function (L) {
    const T = SL.Toon, rng = this.rng;
    this.landmarks = this.landmarks || {};
    // the outline of the hull, sampled bow to stern on both sides
    const pts = [];
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const z = L.length / 2 - (i / n) * L.length;
      pts.push(new THREE.Vector2(hullHalf(L, z) + 0.15, z));
    }
    for (let i = n; i >= 0; i--) {
      const z = L.length / 2 - (i / n) * L.length;
      pts.push(new THREE.Vector2(-hullHalf(L, z) - 0.15, z));
    }
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, -p.y)));
    const band = (y0, y1, color) => {
      const geo = this.track(new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 4 }));
      geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, T.mat(color));
      m.position.y = y0;
      T.addOutline(m, 2);
      m.receiveShadow = true;
      this.scene.add(m);
      return m;
    };
    // the hull: a white upper band with the blue stripe, a dark lower band into the water
    band(-L.sea - 1, -L.waterline + 0.5, L.hullLow);
    band(-L.waterline + 0.5, -1.4, L.hull);
    band(-1.4, -0.8, L.stripe);
    band(-0.8, -0.02, L.hull);
    // portholes along both sides
    for (let z = -L.length / 2 + 10; z < L.length / 2 - 12; z += 3.2) {
      for (const s of [1, -1]) this._gMesh(new THREE.CircleGeometry(0.42, 12), 0x2a4a7a, { pos: [s * (hullHalf(L, z) + 0.18), -3, z], rot: [0, s * Math.PI / 2, 0], basic: true });
    }
    // the name on the bow
    const name = new THREE.Mesh(this.track(new THREE.PlaneGeometry(9, 1.4)), this.track(new THREE.MeshBasicMaterial({ map: T.emblemTexture('PRINCESS BULMA', '#1c3a7a', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false })));
    const nz = L.length / 2 - 10;
    for (const s of [1, -1]) {
      const m = name.clone();
      m.position.set(s * (hullHalf(L, nz) + 0.2), -2.4, nz);
      m.rotation.y = s * Math.PI / 2;
      this.scene.add(m);
    }
    // the railing: posts round the deck's edge and a rail along their tops
    const postGeo = this.track(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 5));
    const postMat = T.mat(L.rail);
    const count = pts.length;
    const posts = new THREE.InstancedMesh(postGeo, postMat, count);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const p = pts[i];
      m4.makeTranslation(p.x * 0.985, 0.55, p.y);
      posts.setMatrixAt(i, m4);
    }
    this.scene.add(posts);
    for (let i = 0; i < count - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < 0.01 || len > 6) continue;
      const rail = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.09, 0.09, len)), postMat);
      rail.position.set(((a.x + b.x) / 2) * 0.985, 1.1, (a.y + b.y) / 2);
      rail.rotation.y = Math.atan2(b.x - a.x, b.y - a.y);
      this.scene.add(rail);
    }

    // THE CABIN BLOCK at the stern: two decks, a bridge with windows, the funnel with the company mark
    const CZ = L.cabinZ;
    const cab = new THREE.Group();
    cab.position.set(0, 0, CZ);
    this.scene.add(cab);
    this._gMesh(new THREE.BoxGeometry(L.beam - 6, 4.2, 18), L.hull, { parent: cab, pos: [0, 2.1, 0], outline: 1.6 });
    this._gMesh(new THREE.BoxGeometry(L.beam - 10, 3.4, 13), L.hull, { parent: cab, pos: [0, 5.9, -1.5], outline: 1.4 });
    this._gMesh(new THREE.BoxGeometry(L.beam - 5.4, 0.3, 18.6), L.stripe, { parent: cab, pos: [0, 4.3, 0], outline: 0.8 });
    for (let x = -(L.beam - 8) / 2; x <= (L.beam - 8) / 2; x += 2) {
      this._gMesh(new THREE.BoxGeometry(1.3, 1.2, 0.1), 0x9ad0ff, { parent: cab, pos: [x, 2.6, 9.02], basic: true });
      this._gMesh(new THREE.BoxGeometry(1.3, 1.0, 0.1), 0x9ad0ff, { parent: cab, pos: [x * 0.8, 6.3, 5.02], basic: true });
    }
    // the doors onto the party deck
    this._gMesh(new THREE.BoxGeometry(3.2, 2.8, 0.15), 0x6a4a2a, { parent: cab, pos: [0, 1.4, 9.04], outline: 0.6 });
    const funnel = this._gMesh(new THREE.CylinderGeometry(1.9, 2.3, 6, 16), L.funnel, { parent: cab, pos: [0, 10.6, -4], rot: [-0.12, 0, 0], outline: 1.4 });
    funnel.castShadow = true;
    this._gMesh(new THREE.CylinderGeometry(1.95, 1.95, 0.9, 16), L.stripe, { parent: cab, pos: [0, 12.4, -4.2], rot: [-0.12, 0, 0], outline: 0.8 });
    const logo = new THREE.Mesh(this.track(new THREE.PlaneGeometry(2.2, 2.2)), this.track(new THREE.MeshBasicMaterial({ map: T.emblemTexture('CC', '#1c3a7a', '#ffffff'), transparent: true })));
    logo.position.set(0, 10.2, -1.75);
    cab.add(logo);
    this.obstacles.push({ shape: 'cyl', x: 0, z: CZ + 3.5, y: 0, r: (L.beam - 6) / 2, h: 4.4, top: 4.4, hp: 1e9, maxHp: 1e9, alive: true, group: cab, color: L.hull });
    this.obstacles.push({ shape: 'cyl', x: 0, z: CZ - 4.5, y: 0, r: (L.beam - 6) / 2, h: 7.8, top: 7.8, hp: 1e9, maxHp: 1e9, alive: true, group: cab, color: L.hull });
    this.landmarks.cabin = new V3(0, 0, CZ + 9.5);
    // masts with strings of party flags down to the bow and the stern
    const mastA = new V3(0, 0, L.length / 2 - 12), mastB = new V3(0, 0, CZ + 2);
    this._gMesh(new THREE.CylinderGeometry(0.16, 0.2, 11, 8), L.rail, { pos: [mastA.x, 5.5, mastA.z], outline: 0.8 });
    const flagCols = L.flags;
    const bunting = (a, b, sag) => {
      for (let i = 0; i <= 22; i++) {
        const k = i / 22;
        const p = a.clone().lerp(b, k);
        p.y -= Math.sin(k * Math.PI) * sag;
        const fl = new THREE.Mesh(this.track(new THREE.ConeGeometry(0.22, 0.5, 3)), T.mat(flagCols[i % flagCols.length]));
        fl.position.copy(p).add(new V3(0, -0.25, 0));
        fl.rotation.x = Math.PI;
        this.scene.add(fl);
      }
    };
    bunting(new V3(0, 10.8, mastA.z), new V3(-L.beam / 2 + 1, 1.3, L.length / 2 - 3), 1.2);
    bunting(new V3(0, 10.8, mastA.z), new V3(L.beam / 2 - 1, 1.3, L.length / 2 - 3), 1.2);
    bunting(new V3(0, 10.8, mastA.z), new V3(0, 8.6, mastB.z), 2.6);
    bunting(new V3(-L.beam / 2 + 1, 1.3, 2), new V3(0, 10.8, mastA.z), 1.4);
    bunting(new V3(L.beam / 2 - 1, 1.3, 2), new V3(0, 10.8, mastA.z), 1.4);
    this.obstacles.push({ shape: 'cyl', x: mastA.x, z: mastA.z, y: 0, r: 0.4, h: 11, top: 11, hp: 1e9, maxHp: 1e9, alive: true, group: null, color: L.rail });

    // THE PARTY: round tables with white cloths and food, the long buffet, the pool, the bingo stage
    this.tables = [];
    const food = [0xe8a040, 0xd84a3a, 0x6ab84a, 0xf2e2b0, 0xc87aa0, 0xf0c060];
    const addTable = (x, z) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      this._gMesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 18), L.cloth, { parent: g, pos: [0, 0.92, 0], outline: 0.8 });
      this._gMesh(new THREE.CylinderGeometry(1.12, 1.18, 0.5, 18, 1, true), L.cloth, { parent: g, pos: [0, 0.66, 0], outline: 0 });
      this._gMesh(new THREE.CylinderGeometry(0.1, 0.14, 0.9, 6), L.rail, { parent: g, pos: [0, 0.45, 0], outline: 0.4 });
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + rng();
        this._gMesh(new THREE.CylinderGeometry(0.2, 0.16, 0.06, 10), 0xffffff, { parent: g, pos: [Math.cos(a) * 0.6, 0.98, Math.sin(a) * 0.6], outline: 0.3 });
        this._gMesh(new THREE.SphereGeometry(0.11, 8, 6), food[(k + Math.floor(rng() * 6)) % food.length], { parent: g, pos: [Math.cos(a) * 0.6, 1.05, Math.sin(a) * 0.6], outline: 0.3 });
      }
      this.scene.add(g);
      this.obstacles.push({ shape: 'cyl', x, z, y: 0, r: 1.15, h: 1, top: 1, hp: 1e9, maxHp: 1e9, alive: true, group: g, color: L.cloth });
      this.tables.push(new V3(x, 1, z));
    };
    for (const [x, z] of L.tables) addTable(x, z);
    // the buffet: a long table down the port side
    const buf = new THREE.Group();
    buf.position.set(L.buffet[0], 0, L.buffet[1]);
    this.scene.add(buf);
    this._gMesh(new THREE.BoxGeometry(1.6, 0.9, 11), L.cloth, { parent: buf, pos: [0, 0.45, 0], outline: 1 });
    for (let k = 0; k < 9; k++) {
      this._gMesh(new THREE.CylinderGeometry(0.42, 0.34, 0.16, 12), 0xf0f0f0, { parent: buf, pos: [0, 0.98, -4.6 + k * 1.15], outline: 0.4 });
      this._gMesh(new THREE.SphereGeometry(0.3, 10, 8), food[k % food.length], { parent: buf, pos: [0, 1.12, -4.6 + k * 1.15], scale: [1, 0.55, 1], outline: 0.4 });
    }
    this.obstacles.push({ shape: 'cyl', x: L.buffet[0], z: L.buffet[1] - 3.2, y: 0, r: 0.9, h: 1, top: 1, hp: 1e9, maxHp: 1e9, alive: true, group: buf, color: L.cloth });
    this.obstacles.push({ shape: 'cyl', x: L.buffet[0], z: L.buffet[1] + 3.2, y: 0, r: 0.9, h: 1, top: 1, hp: 1e9, maxHp: 1e9, alive: true, group: buf, color: L.cloth });
    this.landmarks.buffet = new V3(L.buffet[0] + 1.4, 0, L.buffet[1]);
    // the pool: blue water in a tiled rim (a flat inset: walkable, splashy)
    const [px, pz, pw, pl] = L.pool;
    this._gMesh(new THREE.BoxGeometry(pw + 0.8, 0.14, pl + 0.8), 0xf2f2f2, { pos: [px, 0.04, pz], outline: 0.8 });
    const water = this._gMesh(new THREE.BoxGeometry(pw, 0.12, pl), 0x3ab0e8, { pos: [px, 0.07, pz], basic: true });
    water.renderOrder = 1;
    this.landmarks.pool = new V3(px, 0, pz);
    // the bingo stage: a little platform with a banner, a microphone stand
    const [sx, sz] = L.stage;
    const stg = new THREE.Group();
    stg.position.set(sx, 0, sz);
    this.scene.add(stg);
    this._gMesh(new THREE.BoxGeometry(6, 0.5, 3.2), 0x8a3a2a, { parent: stg, pos: [0, 0.25, 0], outline: 1 });
    const banner = new THREE.Mesh(this.track(new THREE.PlaneGeometry(6, 1.3)), this.track(new THREE.MeshBasicMaterial({ map: T.emblemTexture('BINGO!', '#c81a2a', '#fff2c0'), side: THREE.DoubleSide })));
    banner.position.set(0, 3.4, -1.4);
    stg.add(banner);
    for (const x of [-2.9, 2.9]) this._gMesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 6), L.rail, { parent: stg, pos: [x, 2, -1.4], outline: 0.4 });
    this._gMesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 5), 0x2a2a30, { parent: stg, pos: [0.8, 1.15, 0.6], outline: 0.3 });
    this.landmarks.stage = new V3(sx, 0.5, sz);
    // the boards are solid: someone placed on the stage stands on top of it
    for (const x of [-1.5, 1.5]) this.obstacles.push({ shape: 'cyl', x: sx + x, z: sz, y: 0, r: 1.5, h: 0.5, top: 0.5, hp: 1e9, maxHp: 1e9, alive: true, group: stg, color: 0x8a3a2a });
    // a birthday cake on its own table in front of the stage
    addTable(L.cake[0], L.cake[1]);
    for (let k = 0; k < 3; k++) this._gMesh(new THREE.CylinderGeometry(0.62 - k * 0.16, 0.62 - k * 0.16, 0.3, 18), k % 2 ? 0xf2a0c0 : 0xfff6ea, { pos: [L.cake[0], 1.12 + k * 0.3, L.cake[1]], outline: 0.5 });
    this.landmarks.cake = new V3(L.cake[0], 1, L.cake[1]);

    // THE SEA: a surface to the horizon, a lighter band where the light hits it
    const wg = this.track(new THREE.PlaneGeometry(3200, 3200, 1, 1));
    wg.rotateX(-Math.PI / 2);
    const wm = this.track(new THREE.MeshBasicMaterial({ color: L.water, transparent: true, opacity: 0.86, depthWrite: false }));
    const sea = new THREE.Mesh(wg, wm);
    sea.position.y = -L.waterline;
    sea.renderOrder = 1;
    this.scene.add(sea);
    this.water = sea;
    this.waterLevel = -L.waterline;
    // foam along the hull
    for (let i = 0; i < 40; i++) {
      const z = -L.length / 2 + (i / 40) * L.length, s = i % 2 ? 1 : -1;
      const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })));
      sp.position.set(s * (hullHalf(L, z) + 0.8), -L.waterline + 0.3, z);
      sp.scale.set(3, 0.8, 1);
      this.scene.add(sp);
    }
    // clouds high over the ocean
    for (let i = 0; i < 18; i++) {
      const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, fog: false })));
      const a = rng() * Math.PI * 2, d = 200 + rng() * 600;
      sp.position.set(Math.cos(a) * d, 90 + rng() * 140, Math.sin(a) * d);
      sp.scale.set(120 + rng() * 160, 40 + rng() * 40, 1);
      sp.userData.speed = 1 + rng() * 2;
      this.scene.add(sp);
      this.clouds.push(sp);
    }
    // a couple of islands on the horizon
    for (let i = 0; i < 5; i++) {
      const a = rng() * Math.PI * 2, d = 520 + rng() * 300;
      this._gMesh(new THREE.ConeGeometry(30 + rng() * 40, 30 + rng() * 40, 7), 0x5a8a5a, { pos: [Math.cos(a) * d, -L.waterline + 6, Math.sin(a) * d], shadow: false });
    }
    this.landmarks.center = new V3(0, 0, 0);
    this.landmarks.bow = new V3(0, 0, L.length / 2 - 6);
  };

  /* ================================================================ THE CRYSTAL CAVERN */
  P._buildCavern = function (C) {
    const T = SL.Toon, rng = this.rng, R = C.radius;
    this.landmarks = this.landmarks || {};
    // the dome over everything, rough on the inside
    const domeGeo = this.track(new THREE.SphereGeometry(R + 22, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2));
    const pa = domeGeo.attributes.position;
    for (let k = 0; k < pa.count; k++) {
      const j = 1 + (rng() - 0.5) * 0.12;
      pa.setXYZ(k, pa.getX(k) * j, pa.getY(k) * j, pa.getZ(k) * j);
    }
    domeGeo.computeVertexNormals();
    const dome = new THREE.Mesh(domeGeo, this.track(SL.Toon.makeMat(C.wall, { side: THREE.BackSide })));
    dome.scale.y = C.domeScale;
    dome.position.y = -2;
    this.scene.add(dome);
    // a hole in the roof far up where the sea comes in as a column of blue light
    this._gGlow(new V3(18, (R + 22) * C.domeScale - 6, -24), 0x3a8aff, 40, 0.5);
    // crystals in the walls and hanging from the roof (static dressing)
    const cols = C.crystals;
    for (let i = 0; i < 46; i++) {
      const a = rng() * Math.PI * 2, roof = i % 3 === 0;
      const cl = this._gCrystalCluster(cols, 1.4 + rng() * 2.6, rng);
      if (roof) {
        const rr = rng() * (R + 6);
        const yy = Math.sqrt(Math.max(0, (R + 22) ** 2 - rr * rr)) * C.domeScale - 3;
        cl.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr);
        cl.rotation.x = Math.PI;
      } else {
        const rr = R + 2 + rng() * 10;
        cl.position.set(Math.cos(a) * rr, this.heightAt(Math.cos(a) * rr, Math.sin(a) * rr) - 0.4, Math.sin(a) * rr);
        cl.rotation.set(Math.sin(a) * -0.5, 0, Math.cos(a) * 0.5);
      }
      this.scene.add(cl);
      if (i % 4 === 0) this._gGlow(cl.position.clone().add(new V3(0, roof ? -2 : 2, 0)), cols[i % cols.length], 9, 0.35);
    }
    // the breakable clusters on the floor
    this.crystals = [];
    for (let i = 0; i < C.breakable; i++) {
      const a = (i / C.breakable) * Math.PI * 2 + rng() * 0.3, rr = 14 + rng() * (R - 20);
      this.addCrystal(new V3(Math.cos(a) * rr, 0, Math.sin(a) * rr), { size: 1.6 + rng() * 1.6, colors: cols, rng });
    }
    // light: a few coloured lights so the crystals light the fight
    for (const [x, y, z, c] of C.lights) {
      const l = new THREE.PointLight(c, 0.9, 90, 2);
      l.position.set(x, y, z);
      this.scene.add(l);
    }
    this.landmarks.center = new V3(0, 0, 0);
  };

  /**
   * A breakable crystal cluster (a stage prop): it sits on the floor, blocks like a rock, shatters into
   * glittering shards when it is hit hard enough (punches, kicks, blasts, explosions all damage props).
   */
  P.addCrystal = function (pos, opts = {}) {
    const rng = opts.rng || this.rng;
    const size = opts.size || 2;
    const p = pos.clone();
    if (this.hasGround) p.y = this.heightAt(p.x, p.z) + size * 0.9;
    const pr = this.addProp({ kind: 'crystal', pos: p, r: size * 1.05, hp: opts.hp || 2600 * size, id: 'crystal' + this.props.length });
    const cl = this._gCrystalCluster(opts.colors || [0x8ae6ff, 0xc89aff, 0xe8f8ff], size, rng);
    cl.position.y = -size * 0.95;
    pr.group.add(cl);
    pr.glow = this._gGlow(new V3(0, size * 0.4, 0), (opts.colors || [0x8ae6ff])[0], size * 4, 0.4, pr.group);
    pr.static = true;
    pr.rocky = true;
    pr.lockable = false;
    pr.debrisColor = (opts.colors || [0x8ae6ff])[0];
    pr.explodeColor = 0xdff6ff;
    if (this.crystals) this.crystals.push(pr);
    return pr;
  };

  /* ================================================================ THE STRATOSPHERE */
  P._buildHeights = function () {
    const def = this.def, T = SL.Toon, rng = this.rng, H = def.heights;
    this.landmarks = { center: new V3(0, 0, 0) };
    // the Earth: its curve fills the bottom of the world
    const tex = T.canvasTexture(1024, 512, (g, w, h) => {
      const nz = U.makeNoise2D(778);
      const img = g.createImageData(w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const v = nz.fbm(x * 0.012, y * 0.024, 5), c = nz(x * 0.04 + 30, y * 0.08);
          const i = (y * w + x) * 4, land = v > 0.55, cloud = c > 0.62;
          img.data[i] = cloud ? 236 : land ? 80 + v * 60 : 22;
          img.data[i + 1] = cloud ? 242 : land ? 120 + v * 50 : 72 + v * 34;
          img.data[i + 2] = cloud ? 248 : land ? 60 : 158 + v * 60;
          img.data[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    });
    this.track(tex);
    const earth = new THREE.Mesh(this.track(new THREE.SphereGeometry(H.earthR, 72, 48)), this.track(new THREE.MeshBasicMaterial({ map: tex, fog: false })));
    earth.position.set(0, -H.earthR - H.earthTop, 0);
    earth.rotation.set(0.3, 0, 0.2);
    this.scene.add(earth);
    this.earth = earth;
    // the thin blue line of the atmosphere round its rim
    const atmo = new THREE.Mesh(
      this.track(new THREE.SphereGeometry(H.earthR * 1.025, 64, 40)),
      this.track(new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0x5ab4ff) }, uK: { value: 1 } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
        fragmentShader: 'uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5) * uK; gl_FragColor = vec4(uColor*f, f); }',
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }))
    );
    atmo.position.copy(earth.position);
    this.scene.add(atmo);
    this.atmo = atmo;
    // a floor of cloud between them and the Earth
    this.cloudFloor = [];
    for (let i = 0; i < 46; i++) {
      const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, fog: false })));
      const a = rng() * Math.PI * 2, d = rng() * 700;
      sp.position.set(Math.cos(a) * d, -H.cloudY - rng() * 12, Math.sin(a) * d);
      sp.scale.set(90 + rng() * 140, 22 + rng() * 18, 1);
      sp.userData.speed = 0.5 + rng();
      this.scene.add(sp);
      this.clouds.push(sp);
      this.cloudFloor.push(sp);
    }
    this._gStars(2200, 900, 1.5, 0);
    this.sunGlow = this._gGlow(new V3(500, 320, -300), 0xfff6e0, 180, 0.8);
    this.setAltitude(H.start === undefined ? 0.7 : H.start);
  };

  /**
   * How high: 0 just above the clouds (a blue sky), 1 the edge of space (black, the stars out, the Earth's
   * curve far below with the blue line on its rim). Driven every tick by the story's climb.
   */
  P.setAltitude = function (k) {
    k = U.clamp01(k);
    this.altitude = k;
    const H = this.def.heights;
    if (!H) return;
    const u = this.sky.material.uniforms;
    const lerpC = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), k);
    u.top.value.copy(lerpC(H.lowTop, H.highTop));
    u.horizon.value.copy(lerpC(H.lowHorizon, H.highHorizon));
    u.bottom.value.copy(lerpC(H.lowBottom, H.highBottom));
    if (this.stars) this.stars.material.opacity = Math.max(0, (k - 0.35) / 0.65) * 0.95;
    for (const c of this.cloudFloor || []) {
      c.position.y = -H.cloudY - k * H.cloudDrop;
      c.material.opacity = 0.85 - k * 0.45;
    }
    if (this.earth) {
      const y = -H.earthR - H.earthTop - k * H.earthDrop;
      this.earth.position.y = y;
      this.atmo.position.y = y;
    }
  };

  /** The whole stage out of the picture (the void inside Goku's head): on(false) brings it back. */
  P.setVoid = function (on) {
    this.root.visible = !on;
  };
})();
