/*
 * THE GLACIER (Movie 2 · Dragon Ball Super: Broly) — a stage builder added to SL.Stage for stages.js
 * `broly_glacier` (def.glacier). The owner's description: a blinding, stark-white Arctic snowfield ringed by
 * towering icy fjord walls and dark freezing water; Frieza's round ship landed on the ice. Same toolkit as
 * every other stage: the wasteland height grid (heightAt, craters, the camera's terrain checks), destructible
 * ice spires as obstacles (def.rock, in ice colours: they shatter into ice), fixtures for anything solid, and
 * the stage's own seeded random stream (never Math.random).
 *
 *   THE FIELD      a wide snowfield with soft drifts; a crater opens on blue ice under the snow (terrain.scorch)
 *   THE CHANNEL    a band of black sea along the north shore, ice floes on it
 *   THE WALLS      ice cliffs rising all round past the field, banded white, pale blue and deep blue
 *   FRIEZA'S SHIP  the round ship on six legs, a ring of blue windows, the ramp down to the ice
 *   SNOW           a light fall of flakes round the camera (stage.ambient)
 *
 * API: iceCrack(pos, radius) — dark cracks racing out over the snow from an impact (a bounded pool: the oldest
 *      are recycled, the field never fills up); landmarks { center, ship, ramp, ledge, shore, cliff, east, west }.
 *      setMelt(k) 0..1 — THE LAVA WASTELAND: Super Saiyan Broly's eruption melts the glacier down to the rock. The
 *      same ground (the craters and the fight stay where they are) recoloured toward black basalt with glowing
 *      rivers of lava, the channel a sea of lava, the ice spires burnt black, the sky and the light gone red, the
 *      snow replaced by rising embers. `broly_lava` is this stage melted from the start (def.melt).
 *
 * Also here, the film's other places (same wasteland grid underneath):
 *   VAMPA (def.vampa)            bone-white thorn stalks, a giant beast's ribcage, Broly's cave in a rock mound,
 *                                acid lakes, drifting grit — landmarks { cave, ribs, crash, ridge, lake }
 *   PLANET VEGETA (def.saiyanCity) the Saiyans' city: domed houses with ring windows, spires, the palace on its
 *                                rise, the launch pad with the pods — landmarks { pad, palace, gate, overlook },
 *                                stage.saiyanPods (the pod meshes on the pad, for the launch)
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const P = SL.Stage.prototype;

  /** The channel of sea along the north shore: 0 outside, 1 in the middle of it. */
  function channel(G, x, z) {
    const c = G.channel;
    if (!c) return 0;
    const dz = Math.abs(z - c.z) / c.half;
    if (dz >= 1) return 0;
    return U.smooth(U.clamp01((1 - dz) * 2.2));
  }

  P._glHeight = function (def, x, z, d, noise) {
    const G = def.glacier;
    // soft drifts over the whole field
    let h = noise.fbm(x * 0.018, z * 0.018, 3) * 1.3 + noise(x * 0.07 + 11, z * 0.07) * 0.25;
    h *= 0.35 + 0.65 * U.smooth(U.clamp01((d - G.field * 0.4) / G.field));
    // the ice walls: rising past the field, steep and uneven
    const wall = G.wall || 150;
    if (d > wall) h += Math.min(G.wallMax || 70, Math.pow((d - wall) / 46, 2) * 24 * (0.55 + noise(x * 0.016, z * 0.016) * 0.9));
    // the channel cuts through everything north of the shore
    const k = channel(G, x, z);
    if (k > 0) h = U.lerp(h, G.channel.floor, k);
    return h;
  };

  P._glColor = function (def, x, z, h, c, noise, slope) {
    const G = def.glacier;
    const n = noise(x * 0.05, z * 0.05);
    c.set(G.snow).lerp(new THREE.Color(G.shade), U.clamp01(n * 0.7));
    // the faces of the walls and the drifts' steep sides are ice, the highest bands deep blue
    if (slope > 0.18) c.lerp(new THREE.Color(G.ice), U.clamp01((slope - 0.18) * 3));
    if (h > 22 && slope > 0.3) c.lerp(new THREE.Color(G.deep), U.clamp01((h - 22) / 50) * 0.45);
    // the shore and the channel floor: wet and dark under the water
    const k = channel(G, x, z);
    if (k > 0) c.lerp(new THREE.Color(G.seabed), U.clamp01(k * 1.4));
  };

  P._glMesh = function (geo, color, opts) {
    return this._gMesh(geo, color, opts || {});
  };

  /* ================================================================ the builder */
  P._buildGlacier = function (G) {
    const T = SL.Toon, rng = this.rng;
    this.landmarks = this.landmarks || {};
    const L = this.landmarks;
    const gy = (x, z) => this.heightAt(x, z);
    const at = (x, z, lift = 0) => new V3(x, gy(x, z) + lift, z);
    L.center = at(0, 0);
    L.east = at(46, 6);
    L.west = at(-46, 10);
    L.shore = at(0, G.channel.z + G.channel.half + 4);
    L.cliff = at(0, -(G.wall + 30));

    /* ---------- THE SEA ---------- */
    // only over the channel: a crater on the field deeper than the sea level must show blue ice, not the sea
    const S = this.size;
    const wg = this.track(new THREE.PlaneGeometry(S, G.channel.half * 2.4, 1, 1));
    wg.rotateX(-Math.PI / 2);
    const wm = this.track(new THREE.MeshBasicMaterial({ color: G.water, transparent: true, opacity: 0.92, depthWrite: false }));
    const water = new THREE.Mesh(wg, wm);
    water.position.set(0, G.channel.level, G.channel.z);
    water.renderOrder = 1;
    this.scene.add(water);
    this.water = water;
    // ice floes drifting on it: flat, white on top, blue at the sides
    // what melts (setMelt): the floes go, the far ice turns to rock
    this._glMeltList = [];
    this._glFloes = [];
    for (let i = 0; i < 26; i++) {
      const x = (rng() - 0.5) * 300, z = G.channel.z + (rng() - 0.5) * G.channel.half * 1.4;
      if (channel(G, x, z) < 0.7) continue;
      const r = 2 + rng() * 6;
      const floe = this._glMesh(new THREE.CylinderGeometry(r, r * 1.06, 0.6, 7), G.snow, { pos: [x, G.channel.level + 0.18, z], rot: [0, rng() * 3, 0], scale: [1, 1, 0.5 + rng() * 0.6], outline: 1.2 });
      floe.receiveShadow = true;
      this._glFloes.push(floe);
    }

    /* ---------- FRIEZA'S SHIP ---------- */
    const [sx, sz] = G.ship;
    const sg = new THREE.Group();
    const base = gy(sx, sz);
    sg.position.set(sx, base, sz);
    this.scene.add(sg);
    const R = G.shipR || 13;
    const M = (geo, color, o) => this._glMesh(geo, color, Object.assign({ parent: sg }, o));
    const legH = R * 0.42;
    // the hull: a flattened sphere, a darker band round its middle, the dome on top
    M(new THREE.SphereGeometry(R, 40, 24), G.hull, { pos: [0, legH + R * 0.5, 0], scale: [1, 0.5, 1], outline: 2.2 });
    M(new THREE.CylinderGeometry(R * 1.015, R * 1.015, R * 0.08, 48, 1, true), G.hullBand, { pos: [0, legH + R * 0.5, 0], outline: 0 });
    M(new THREE.SphereGeometry(R * 0.38, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), G.hull, { pos: [0, legH + R * 0.96, 0], scale: [1, 0.7, 1], outline: 1.4 });
    // the ring of round blue windows on the upper half
    const winMat = this.track(new THREE.MeshBasicMaterial({ color: G.window }));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const w = new THREE.Mesh(this.track(new THREE.CircleGeometry(R * 0.085, 18)), winMat);
      const rr = R * 0.93;
      w.position.set(Math.sin(a) * rr, legH + R * 0.66, Math.cos(a) * rr);
      w.lookAt(new V3(Math.sin(a) * rr * 2, legH + R * 0.66 + R * 0.25, Math.cos(a) * rr * 2));
      sg.add(w);
    }
    // six legs, splayed, with round feet in the snow
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.26;
      const top = new V3(Math.sin(a) * R * 0.62, legH + R * 0.3, Math.cos(a) * R * 0.62);
      const foot = new V3(Math.sin(a) * R * 0.95, 0.2, Math.cos(a) * R * 0.95);
      const len = top.distanceTo(foot);
      const leg = M(new THREE.CylinderGeometry(0.42, 0.55, len, 10), G.hullBand, { outline: 1 });
      leg.position.copy(top).lerp(foot, 0.5);
      leg.quaternion.setFromUnitVectors(new V3(0, 1, 0), top.clone().sub(foot).normalize());
      M(new THREE.CylinderGeometry(1.1, 1.3, 0.4, 14), G.hull, { pos: [foot.x, 0.2, foot.z], outline: 0.8 });
    }
    // the ramp: from the hatch in the hull's underside down to the ice, facing the field
    const toField = Math.atan2(-sx, -sz);
    const ramp = new THREE.Group();
    ramp.position.set(Math.sin(toField) * R * 0.45, 0, Math.cos(toField) * R * 0.45);
    ramp.rotation.y = toField;
    sg.add(ramp);
    const rampLen = R * 0.8;
    this._glMesh(new THREE.BoxGeometry(4.2, 0.35, rampLen), G.hullBand, { parent: ramp, pos: [0, legH * 0.5, rampLen / 2], rot: [Math.atan2(legH, rampLen) * 0.98, 0, 0], outline: 1 });
    this._gGlow(new V3(sx + Math.sin(toField) * R * 0.45, base + legH + 0.4, sz + Math.cos(toField) * R * 0.45), 0xcfe8ff, 6, 0.35);
    this.obstacles.push({ shape: 'cyl', x: sx, z: sz, y: base, r: R * 0.96, h: legH + R, top: base + legH + R, hp: 1e9, maxHp: 1e9, alive: true, group: sg, segs: [], color: G.hull, fixture: true });
    L.ship = new V3(sx, base, sz);
    L.ramp = at(sx + Math.sin(toField) * (R * 0.45 + rampLen + 2), sz + Math.cos(toField) * (R * 0.45 + rampLen + 2));
    // a raised shelf of ice off to the side, where the watchers stand
    const [lx, lz] = G.ledge;
    L.ledge = at(lx, lz);

    /* ---------- THE SKYLINE: ice mountains past the walls ---------- */
    const bands = [G.snow, G.shade, G.ice, G.deep];
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + rng() * 0.15;
      const d = 300 + rng() * 200;
      const r = 26 + rng() * 40, h = 60 + rng() * 110;
      const m = this._glMesh(new THREE.ConeGeometry(r, h, 6 + Math.floor(rng() * 3)), bands[i % bands.length], { pos: [Math.cos(a) * d, h / 2 + 4, Math.sin(a) * d], rot: [0, rng() * 3, 0], outline: 0, shadow: false });
      m.receiveShadow = false;
      this._glMeltList.push({ mesh: m, to: [0x1a1210, 0x2a1a14, 0x3a2018, 0x24140e][i % 4] });
    }
    // low clouds over the far walls
    for (let i = 0; i < 12; i++) {
      const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: SL.Toon.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false, fog: false })));
      const a = rng() * Math.PI * 2, d = 260 + rng() * 420;
      sp.position.set(Math.cos(a) * d, 110 + rng() * 90, Math.sin(a) * d);
      sp.scale.set(160 + rng() * 140, 50 + rng() * 40, 1);
      sp.userData.speed = 1 + rng() * 1.5;
      this.scene.add(sp);
      this.clouds.push(sp);
    }

    /* ---------- SNOW: a light fall round whoever is looking ---------- */
    // ...and once it has melted, embers rising off the lava instead (the melt sets this._melt)
    const snow = G.snowfall === undefined ? 1 : G.snowfall;
    let acc = 0, accE = 0;
    this.ambient.push((dt, st) => {
      const b = st.battle, vfx = b && b.vfx;
      if (!vfx || !vfx.specks || !b.camera || !b.camera.camera) return;
      const melt = st._melt || 0;
      const c = b.camera.camera.position;
      acc += dt * 40 * snow * U.clamp01(1 - melt * 2) * (vfx.pScale || 1);
      while (acc > 1) {
        acc -= 1;
        const x = c.x + (rng() - 0.5) * 50, z = c.z + (rng() - 0.5) * 50, y = c.y + 4 + rng() * 14;
        vfx.specks.emit(x, y, z, (rng() - 0.5) * 0.6, -1.2 - rng() * 0.8, (rng() - 0.5) * 0.6, 0.96, 0.98, 1, 0.9, 0.035 + rng() * 0.04, 6, { fadeIn: 30 });
      }
      accE += dt * 26 * U.clamp01(melt * 2 - 0.6) * (vfx.pScale || 1);
      while (accE > 1) {
        accE -= 1;
        const x = c.x + (rng() - 0.5) * 46, z = c.z + (rng() - 0.5) * 46;
        const y = (st.hasGround ? st.heightAt(x, z) : c.y - 6) + rng() * 4;
        vfx.specks.emit(x, y, z, (rng() - 0.5) * 0.8, 1.4 + rng() * 1.6, (rng() - 0.5) * 0.8, 1, 0.42 + rng() * 0.3, 0.08, 1, 0.03 + rng() * 0.035, 3.5, { fadeIn: 20 });
      }
    });
    this._glCracks = [];
    if (this.def.melt) this.setMelt(this.def.melt);
  };

  /* ================================================================ THE LAVA WASTELAND */
  const LAVA = {
    rock: 0x1c1310, rock2: 0x34241c, crust: 0x5a1e10, glow: 0xff6a18, river: 0xffa030, sea: 0xff5214,
    sky: { top: 0x140404, horizon: 0xb8401a, bottom: 0x4a1006 },
    fog: { color: 0x5a160a, near: 90, far: 560 },
    light: { sun: 0xffa060, sunIntensity: 0.62, sky: 0xff8a50, ground: 0x3a0c06, hemi: 0.5 },
    spire: [0x1e1410, 0x2c1c16, 0x181010, 0x3a2418],
  };

  /** The melted colour of every terrain vertex: basalt, crust, glowing rivers in the low ground, the sea of lava. */
  P._glLavaColors = function () {
    const G = this.def.glacier, geo = this.terrainGeo;
    const pos = geo.attributes.position, nrm = geo.attributes.normal;
    const out = new Float32Array(pos.count * 3);
    const noise = U.makeNoise2D((this.def.seed || 1) + 77);
    const c = new THREE.Color(), rock = new THREE.Color(LAVA.rock), rock2 = new THREE.Color(LAVA.rock2), crust = new THREE.Color(LAVA.crust);
    const glow = new THREE.Color(LAVA.glow), river = new THREE.Color(LAVA.river), sea = new THREE.Color(LAVA.sea);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = this.heights[i];
      const slope = 1 - nrm.getY(i);
      c.copy(rock).lerp(rock2, U.clamp01(noise(x * 0.06, z * 0.06)));
      // the cooled crust going red where it is thin
      c.lerp(crust, U.clamp01((noise(x * 0.025 + 9, z * 0.025) - 0.5) * 2.2) * 0.6);
      // rivers: thin glowing lines winding through it, wider down in the hollows
      const lineW = 0.02 + U.clamp01(-h / 6) * 0.05;
      const line = 1 - U.clamp01(Math.abs(noise(x * 0.018 + 3, z * 0.018 - 5) - 0.5) / lineW);
      if (line > 0 && slope < 0.3) c.lerp(river, line * 0.95);
      // the hollows fill with it
      if (h < -1.2) c.lerp(glow, U.clamp01((-1.2 - h) / 2.5) * 0.85);
      // the walls stay black rock
      if (slope > 0.3) c.lerp(rock, U.clamp01((slope - 0.3) * 2));
      const k = channel(G, x, z);
      if (k > 0) c.lerp(sea, U.clamp01(k * 1.5));
      out[i * 3] = c.r;
      out[i * 3 + 1] = c.g;
      out[i * 3 + 2] = c.b;
    }
    return out;
  };

  /**
   * THE MELT, 0..1: the glacier going to the lava wasteland (Super Saiyan Broly's eruption). Everything is a lerp
   * from what the stage was built with, so it can be run over a few seconds by a mission (or set once: broly_lava).
   */
  P.setMelt = function (k) {
    const G = this.def.glacier;
    if (!G || !this.terrainGeo) return;
    k = U.clamp01(k);
    const col = this.terrainGeo.attributes.color;
    if (!this._glFrom) {
      const sky = this.sky.material.uniforms;
      this._glFrom = {
        cols: col.array.slice(),
        lava: this._glLavaColors(),
        sky: { top: sky.top.value.clone(), horizon: sky.horizon.value.clone(), bottom: sky.bottom.value.clone() },
        fog: this.scene.fog ? { color: this.scene.fog.color.clone(), near: this.scene.fog.near, far: this.scene.fog.far } : null,
        hemiSky: this.hemi.color.clone(), hemiGround: this.hemi.groundColor.clone(), sun: this.sun.color.clone(),
        base: Object.assign({}, this.baseLight),
        water: this.water ? { color: this.water.material.color.clone(), opacity: this.water.material.opacity } : null,
        def: this.def,
      };
    }
    const F = this._glFrom;
    const a = col.array, A = F.cols, L = F.lava;
    for (let i = 0; i < a.length; i++) a[i] = A[i] + (L[i] - A[i]) * k;
    col.needsUpdate = true;
    const lerpC = (from, to) => from.clone().lerp(new THREE.Color(to), k);
    const sky = this.sky.material.uniforms;
    sky.top.value.copy(lerpC(F.sky.top, LAVA.sky.top));
    sky.horizon.value.copy(lerpC(F.sky.horizon, LAVA.sky.horizon));
    sky.bottom.value.copy(lerpC(F.sky.bottom, LAVA.sky.bottom));
    if (this.scene.fog && F.fog) {
      this.scene.fog.color.copy(lerpC(F.fog.color, LAVA.fog.color));
      this.scene.fog.near = U.lerp(F.fog.near, LAVA.fog.near, k);
      this.scene.fog.far = Math.min(U.lerp(F.fog.far, LAVA.fog.far, k), SL.Render.farDistance ? SL.Render.farDistance() : 9999);
    }
    this.hemi.color.copy(lerpC(F.hemiSky, LAVA.light.sky));
    this.hemi.groundColor.copy(lerpC(F.hemiGround, LAVA.light.ground));
    this.sun.color.copy(lerpC(F.sun, LAVA.light.sun));
    this.baseLight.sun = U.lerp(F.base.sun, LAVA.light.sunIntensity, k);
    this.baseLight.hemi = U.lerp(F.base.hemi, LAVA.light.hemi, k);
    // (the mood only rewrites the light while it is changing: set it here too)
    this.hemi.intensity = this.baseLight.hemi * (1 - this.mood.amt * 0.65);
    this.sun.intensity = this.baseLight.sun * (1 - this.mood.amt * 0.8);
    if (this.water && F.water) {
      this.water.material.color.copy(lerpC(F.water.color, LAVA.sea));
      this.water.material.opacity = U.lerp(F.water.opacity, 1, k);
    }
    for (const f of this._glFloes || []) f.visible = k < 0.35;
    // the far ice and the spires: burnt black past the middle of it (swapped, never recoloured: shared materials)
    const black = k >= 0.5;
    if (black !== !!this._glBlack) {
      this._glBlack = black;
      for (const e of this._glMeltList || []) {
        if (!e.from) e.from = e.mesh.material;
        e.mesh.material = black ? SL.Toon.mat(e.to) : e.from;
      }
      for (const o of this.obstacles) {
        if (o.fixture || !o.segs) continue;
        o.segs.forEach((s, i) => {
          if (!s.userData.iceMat) s.userData.iceMat = s.material;
          s.material = black ? SL.Toon.mat(LAVA.spire[i % LAVA.spire.length]) : s.userData.iceMat;
        });
        o.color = black ? LAVA.spire[0] : F.def.rock.bands[0];
      }
      this.rockColor = black ? LAVA.spire[1] : F.def.rock.bands[0];
    }
    for (const cl of this.clouds) if (cl.material && cl.material.color) cl.material.color.setRGB(U.lerp(1, 0.34, k), U.lerp(1, 0.16, k), U.lerp(1, 0.12, k));
    // this stage's own copy of its colours: dust, craters and debris come out of rock and ash now
    const ash = new THREE.Color(F.def.terrain.sand).lerp(new THREE.Color(0x4a3a34), k).getHex();
    const scorch = new THREE.Color(F.def.terrain.scorch).lerp(new THREE.Color(0x120a08), k).getHex();
    this.def = Object.assign({}, F.def, { dust: ash, terrain: Object.assign({}, F.def.terrain, { sand: ash, dirt: new THREE.Color(F.def.terrain.dirt).lerp(new THREE.Color(0x2a1a14), k).getHex(), scorch }) });
    this._melt = k;
  };

  /** A spout of lava thrown up out of the ground (the melt, and the fight on the lava). */
  P.lavaGeyser = function (pos, height = 8) {
    const b = this.battle;
    if (!b || !b.vfx) return;
    const g = pos.clone();
    if (this.hasGround) g.y = this.heightAt(g.x, g.z);
    for (let i = 0; i < 10; i++) {
      const v = new V3((this.rng() - 0.5) * 3, height * (0.7 + this.rng() * 0.6), (this.rng() - 0.5) * 3);
      b.vfx.rock(g.clone().add(new V3(0, 0.3, 0)), v, 0.2 + this.rng() * 0.35, i % 2 ? LAVA.glow : LAVA.river);
    }
    b.vfx.flash(g.clone().add(new V3(0, 1, 0)), 3, LAVA.glow, 0.3, SL.Toon.tex.glow);
    b.vfx.smoke.emit(g.x, g.y + 1, g.z, 0, 2.5, 0, 0.25, 0.12, 0.08, 0.7, 2, 3, { grow: 2, drag: 0.6 });
  };

  /* ================================================================ VAMPA */
  P._buildVampa = function (V) {
    const rng = this.rng;
    this.landmarks = this.landmarks || {};
    const L = this.landmarks;
    const gy = (x, z) => this.heightAt(x, z);
    const at = (x, z) => new V3(x, gy(x, z), z);
    const BONE = 0xe6dcc0, BONE2 = 0xcabf9a, THORN = 0xb8b48a;
    L.center = at(0, 0);
    L.cave = at(V.cave[0], V.cave[1]);
    L.ribs = at(V.ribs[0], V.ribs[1]);
    L.crash = at(V.crash[0], V.crash[1]);
    L.ridge = at(V.ridge[0], V.ridge[1]);
    L.lake = at(V.lake[0], V.lake[1]);
    // THORN STALKS: bone-white spikes standing in clumps, leaning out of the grit
    for (let i = 0; i < (V.stalks || 40); i++) {
      const a = rng() * Math.PI * 2, d = 18 + rng() * 150;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - V.cave[0], z - V.cave[1]) < 16 || Math.hypot(x, z) < 14) continue;
      const n = 3 + Math.floor(rng() * 4);
      for (let k = 0; k < n; k++) {
        const h = 3 + rng() * 9, r = 0.25 + rng() * 0.45;
        const m = this._gMesh(new THREE.ConeGeometry(r, h, 5), k % 2 ? BONE : THORN, { pos: [x + (rng() - 0.5) * 3, gy(x, z) + h / 2 - 0.3, z + (rng() - 0.5) * 3], rot: [(rng() - 0.5) * 0.5, 0, (rng() - 0.5) * 0.5], outline: 0.8 });
        m.receiveShadow = false;
      }
    }
    // THE RIBS: a beast that died here long ago — eight arched bones along a buried spine
    const rx = V.ribs[0], rz = V.ribs[1];
    for (let i = 0; i < 8; i++) {
      const s = 1 - Math.abs(i - 3.5) / 5;
      const R = 5 + s * 6;
      const arc = this._gMesh(new THREE.TorusGeometry(R, 0.35 + s * 0.2, 6, 18, Math.PI * 0.9), i % 2 ? BONE : BONE2, { pos: [rx + i * 3.2 - 11, gy(rx, rz) - 1, rz], rot: [0, Math.PI / 2, 0.05 * Math.PI], outline: 1 });
      arc.receiveShadow = false;
    }
    this._gMesh(new THREE.CylinderGeometry(0.6, 0.8, 30, 8), BONE2, { pos: [rx, gy(rx, rz) + 0.2, rz], rot: [0, 0, Math.PI / 2], outline: 1 });
    // BROLY'S CAVE: a mound of rock with a dark mouth turned to the open ground
    const cx = V.cave[0], cz = V.cave[1];
    const toC = Math.atan2(-cx, -cz);
    const mound = new THREE.Group();
    mound.position.set(cx, gy(cx, cz) - 2, cz);
    mound.rotation.y = toC;
    this.scene.add(mound);
    this._gMesh(new THREE.DodecahedronGeometry(14, 1), 0x5a4a30, { parent: mound, pos: [0, 6, -6], scale: [1.3, 0.75, 1], outline: 2 });
    this._gMesh(new THREE.DodecahedronGeometry(9, 1), 0x4a3e28, { parent: mound, pos: [8, 9, -12], scale: [1, 1.1, 1], outline: 1.6 });
    const mouth = this._gMesh(new THREE.CircleGeometry(4.2, 20, 0, Math.PI), 0x0c0a06, { parent: mound, pos: [0, 2, 7.8], outline: 0 });
    mouth.material = this.track(new THREE.MeshBasicMaterial({ color: 0x0c0a06 }));
    this.obstacles.push({ shape: 'cyl', x: cx - Math.sin(toC) * 4, z: cz - Math.cos(toC) * 4, y: gy(cx, cz) - 2, r: 13, h: 18, top: gy(cx, cz) + 16, hp: 1e9, maxHp: 1e9, alive: true, group: mound, segs: [], color: 0x5a4a30, fixture: true });
    L.caveMouth = at(cx + Math.sin(toC) * 11, cz + Math.cos(toC) * 11);
    // grit on the wind, low over the ground
    let acc = 0;
    this.ambient.push((dt, st) => {
      const b = st.battle, vfx = b && b.vfx;
      if (!vfx || !vfx.specks || !b.camera || !b.camera.camera) return;
      acc += dt * 14 * (vfx.pScale || 1);
      const c = b.camera.camera.position;
      while (acc > 1) {
        acc -= 1;
        const x = c.x - 20 + (rng() - 0.5) * 10, z = c.z + (rng() - 0.5) * 40, y = c.y - 2 + rng() * 8;
        vfx.specks.emit(x, y, z, 6 + rng() * 4, (rng() - 0.5) * 0.4, (rng() - 0.5) * 1.2, 0.78, 0.74, 0.5, 0.8, 0.03 + rng() * 0.03, 5, { fadeIn: 20 });
      }
    });
  };

  /* ================================================================ PLANET VEGETA */
  P._buildSaiyanCity = function (C) {
    const rng = this.rng;
    this.landmarks = this.landmarks || {};
    const L = this.landmarks;
    const gy = (x, z) => this.heightAt(x, z);
    const at = (x, z) => new V3(x, gy(x, z), z);
    const WALL = [0xe0cfb0, 0xd2bc98, 0xc8ae88], ROOF = 0x8a4a34, BAND = 0x6a3a2a, WIN = 0x1a0e0a;
    const dome = (x, z, r, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, gy(x, z) - 0.4, z);
      this.scene.add(g);
      const wall = WALL[Math.floor(rng() * WALL.length)];
      this._gMesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), wall, { parent: g, scale: [1, opts.flat || 0.82, 1], outline: 1.6 });
      this._gMesh(new THREE.CylinderGeometry(r * 1.01, r * 1.04, r * 0.12, 28, 1, true), BAND, { parent: g, pos: [0, r * 0.2, 0], outline: 0 });
      // a ring of round windows
      const wm = this.track(new THREE.MeshBasicMaterial({ color: WIN }));
      const n = Math.max(5, Math.round(r * 1.6));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const w = new THREE.Mesh(this.track(new THREE.CircleGeometry(r * 0.07, 12)), wm);
        const rr = r * 0.92, yy = r * 0.42;
        w.position.set(Math.sin(a) * rr, yy, Math.cos(a) * rr);
        w.lookAt(new V3(Math.sin(a) * rr * 2, yy + r * 0.2, Math.cos(a) * rr * 2));
        g.add(w);
      }
      // a cap, and on some a spire
      this._gMesh(new THREE.SphereGeometry(r * 0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), ROOF, { parent: g, pos: [0, r * (opts.flat || 0.82) - r * 0.04, 0], outline: 0.8 });
      if (opts.spire || rng() < 0.3) this._gMesh(new THREE.ConeGeometry(r * 0.08, r * 1.4, 6), ROOF, { parent: g, pos: [0, r * 1.4, 0], outline: 0.6 });
      this.obstacles.push({ shape: 'cyl', x, z, y: gy(x, z) - 0.4, r: r * 0.92, h: r * 0.8, top: gy(x, z) + r * 0.8, hp: 1e9, maxHp: 1e9, alive: true, group: g, segs: [], color: wall, fixture: true });
      return g;
    };
    const [px, pz] = C.pad, [qx, qz] = C.palace;
    L.pad = at(px, pz);
    L.palace = at(qx, qz);
    L.gate = at(C.gate[0], C.gate[1]);
    L.overlook = at(C.overlook[0], C.overlook[1]);
    L.center = at(0, 0);
    // THE CITY: domes round the open square, thickest toward the palace, none on the square or the pad
    const placed = [];
    for (let tries = 0; placed.length < (C.domes || 30) && tries < 600; tries++) {
      const a = rng() * Math.PI * 2, d = 36 + rng() * 110;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - px, z - pz) < 18 || Math.hypot(x - qx, z - qz) < 34) continue;
      const r = 4 + rng() * 6 + (d > 90 ? rng() * 4 : 0);
      if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + r + 3)) continue;
      placed.push({ x, z, r });
      dome(x, z, r);
    }
    // THE PALACE: a great dome on a raised plinth, four spires round it
    const pg = new THREE.Group();
    pg.position.set(qx, gy(qx, qz) - 0.5, qz);
    this.scene.add(pg);
    this._gMesh(new THREE.CylinderGeometry(30, 34, 5, 32), 0xb89a78, { parent: pg, pos: [0, 2, 0], outline: 1.8 });
    this._gMesh(new THREE.SphereGeometry(22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0xe8d8b8, { parent: pg, pos: [0, 4.5, 0], scale: [1, 0.9, 1], outline: 2 });
    this._gMesh(new THREE.CylinderGeometry(22.3, 22.6, 2, 40, 1, true), 0xa82a1e, { parent: pg, pos: [0, 9, 0], outline: 0 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      this._gMesh(new THREE.CylinderGeometry(1.4, 2, 34, 8), 0xd8c4a0, { parent: pg, pos: [Math.cos(a) * 27, 19, Math.sin(a) * 27], outline: 1.2 });
      this._gMesh(new THREE.ConeGeometry(2.6, 8, 8), 0xa82a1e, { parent: pg, pos: [Math.cos(a) * 27, 40, Math.sin(a) * 27], outline: 1 });
    }
    this.obstacles.push({ shape: 'cyl', x: qx, z: qz, y: gy(qx, qz) - 0.5, r: 31, h: 26, top: gy(qx, qz) + 26, hp: 1e9, maxHp: 1e9, alive: true, group: pg, segs: [], color: 0xe8d8b8, fixture: true });
    // THE LAUNCH PAD: a raised disc, a ring of cradles, the round white pods on them (stage.saiyanPods)
    const pad = new THREE.Group();
    pad.position.set(px, gy(px, pz), pz);
    this.scene.add(pad);
    this._gMesh(new THREE.CylinderGeometry(10, 10.6, 0.3, 32), 0x7a6a5a, { parent: pad, pos: [0, 0.08, 0], outline: 1.4 });
    this._gMesh(new THREE.TorusGeometry(9.2, 0.18, 6, 40), 0xd8b030, { parent: pad, pos: [0, 0.25, 0], rot: [Math.PI / 2, 0, 0], outline: 0 });
    this.saiyanPods = [];
    const podN = C.pods || 6;
    for (let i = 0; i < podN; i++) {
      const a = (i / podN) * Math.PI * 2;
      const cradle = this._gMesh(new THREE.CylinderGeometry(1.2, 1.5, 0.5, 14), 0x5a4a3a, { parent: pad, pos: [Math.cos(a) * 6.5, 0.45, Math.sin(a) * 6.5], outline: 0.8 });
      cradle.receiveShadow = true;
      const pod = new THREE.Group();
      pod.position.set(px + Math.cos(a) * 6.5, gy(px, pz) + 1.6, pz + Math.sin(a) * 6.5);
      const shell = this._gMesh(new THREE.SphereGeometry(0.95, 18, 12), 0xf0ece4, { parent: pod, outline: 1.2 });
      shell.castShadow = true;
      const win = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45)), this.track(new THREE.MeshBasicMaterial({ color: 0xd8344a })));
      win.position.set(0, 0.25, 0.58);
      win.rotation.x = Math.PI * 0.5;
      pod.add(win);
      pod.rotation.y = -a + Math.PI / 2;
      this.scene.add(pod);
      this.saiyanPods.push(pod);
    }
    // dust devils of red grit drifting over the square
    let acc = 0;
    this.ambient.push((dt, st) => {
      const b = st.battle, vfx = b && b.vfx;
      if (!vfx || !vfx.specks || !b.camera || !b.camera.camera) return;
      acc += dt * 10 * (vfx.pScale || 1);
      const c = b.camera.camera.position;
      while (acc > 1) {
        acc -= 1;
        const x = c.x - 18 + (rng() - 0.5) * 10, z = c.z + (rng() - 0.5) * 36, y = c.y - 2 + rng() * 6;
        vfx.specks.emit(x, y, z, 5 + rng() * 3, (rng() - 0.5) * 0.3, (rng() - 0.5) * 1, 0.82, 0.48, 0.32, 0.8, 0.03 + rng() * 0.03, 5, { fadeIn: 20 });
      }
    });
  };

  /**
   * ICE CRACKS: dark lines racing out over the snow from an impact — five to nine rays of jagged segments
   * laid on the ground. A bounded pool (the oldest is recycled): the field never fills up.
   */
  P.iceCrack = function (pos, radius = 4) {
    if (!this.def.glacier || !this.hasGround) return null;
    const rng = this.rng;
    if (!this._glCrackGeo) {
      this._glCrackGeo = this.track(new THREE.PlaneGeometry(1, 1));
      this._glCrackGeo.rotateX(-Math.PI / 2);
      this._glCrackMat = this.track(new THREE.MeshBasicMaterial({ color: this.def.glacier.crack || 0x2a4a6a, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    }
    const g = new THREE.Group();
    const rays = 4 + Math.floor(rng() * 3);
    for (let r = 0; r < rays; r++) {
      let a = (r / rays) * Math.PI * 2 + rng() * 0.6;
      let x = pos.x, z = pos.z;
      const len = radius * (0.5 + rng() * 0.45);
      const segs = 4 + Math.floor(rng() * 3);
      for (let s = 0; s < segs; s++) {
        const l = (len / segs) * (0.75 + rng() * 0.5);
        a += (rng() - 0.5) * 0.8;
        const nx = x + Math.cos(a) * l, nz = z + Math.sin(a) * l;
        const w = Math.max(0.035, 0.12 * (1 - s / segs) * Math.min(1.4, radius / 4));
        const mx = (x + nx) / 2, mz = (z + nz) / 2;
        const m = new THREE.Mesh(this._glCrackGeo, this._glCrackMat);
        m.position.set(mx, this.heightAt(mx, mz) + 0.05, mz);
        m.rotation.y = -a;
        m.scale.set(l * 1.05, 1, w);
        m.renderOrder = 2;
        g.add(m);
        x = nx;
        z = nz;
      }
    }
    this.scene.add(g);
    this._glCracks.push(g);
    while (this._glCracks.length > (this.def.glacier.maxCracks || 16)) {
      const old = this._glCracks.shift();
      this.scene.remove(old);
    }
    return g;
  };
})();
