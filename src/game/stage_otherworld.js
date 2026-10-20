/*
 * THE OTHER WORLD, AND WHAT JANEMBA DID TO IT (Movie: Fusion Reborn) — a stage builder added to SL.Stage
 * for stages.js `other_world` (def.otherworld). Same toolkit as every other stage: the wasteland height
 * grid (heightAt, craters and the camera's terrain checks all work), obstacles for anything solid, and the
 * stage's own seeded random stream.
 *
 *   THE CHECK-IN STATION   King Yemma's hall: a stone terrace, red pillars, white walls, a green tiled roof
 *                          in two tiers, the open court in front with his great desk under a canopy
 *   THE SPIRIT CLEANSING   on its own platform: a tower of pipes holding up a huge glass tank of the
 *   MACHINE                souls' cleaned-out evil, a gauge panel with warning lamps, the operator's booth
 *   THE CRYSTAL BARRIER    a faceted dome over the station (a solid obstacle while it stands)
 *   THE WARP               pastel ground, floating blocks, giant lollipops, jellybeans and gumdrops, and a
 *                          great floating spiked rock — all grown by setWarp(k), 0 = the Other World as it
 *                          was (yellow cloud ground, a gold sky), 1 = Janemba's playground
 *
 * API: setWarp(k), setTank(k) (the corruption rising in the tank, 0..1), burstTank(), setBarrier(k),
 *      barrierFlash(point), landmarks { station, court, desk, yemma, plant, tank, booth, field, spike, far }
 * Every piece can be seen from the field: the station stays the anchor of the place whatever the warp does.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const P = SL.Stage.prototype;

  /* ================================================================ heights and colours */
  P._owHeight = function (def, x, z, d, noise) {
    const O = def.otherworld;
    // a floor of cloud: soft lumps, flatter where the station and the plant stand
    let h = noise.fbm(x * 0.03, z * 0.03, 3) * 1.4 - 0.4;
    const flat = (cx, cz, r) => U.smooth(U.clamp01((Math.hypot(x - cx, z - cz) - r) / 10));
    h *= Math.min(flat(O.station[0], O.station[1], 22), flat(O.plant[0], O.plant[1], 12), flat(O.field[0], O.field[1], 16) * 0.6 + 0.4);
    // the far edge rises into great cloud banks
    if (d > 150) h += Math.pow((d - 150) / 50, 2) * 30 * (0.6 + noise(x * 0.02, z * 0.02) * 0.8);
    // the station's terrace and the plant's platform are walkable ground, not boxes to sink into
    if (Math.abs(x - O.station[0]) <= 17 && Math.abs(z - O.station[1]) <= 15) h = 1.6;
    if (Math.hypot(x - O.plant[0], z - O.plant[1]) <= 10) h = 1.4;
    return h;
  };
  P._owColor = function (def, x, z, h, c, noise) {
    const O = def.otherworld;
    const n = noise(x * 0.06, z * 0.06);
    c.set(O.cloud).lerp(new THREE.Color(O.cloud2), U.clamp01(n * 0.9));
    // the paved walk up to the station
    if (Math.abs(x - O.station[0]) < 4.5 && z > O.station[1] + 10 && z < O.station[1] + 60) c.set(O.path);
    // the warped colours, kept beside the normal ones (setWarp blends between them)
    if (!this._owWarp) this._owWarp = [];
    const pastel = O.pastel;
    const k = noise(x * 0.025 + 17, z * 0.025 - 9);
    const i = Math.floor(U.clamp01(k) * pastel.length * 0.999);
    const w = new THREE.Color(pastel[i]).lerp(new THREE.Color(pastel[(i + 1) % pastel.length]), (k * pastel.length) % 1 * 0.6);
    this._owWarp.push(w.r, w.g, w.b);
  };

  /* ================================================================ shared bits */
  P._owMesh = function (geo, color, opts = {}) {
    return this._gMesh(geo, color, opts);
  };

  /* ================================================================ the builder */
  P._buildCheckInWorld = function (O) {
    const T = SL.Toon, rng = this.rng;
    this.landmarks = this.landmarks || {};
    const gy = (x, z) => this.heightAt(x, z);

    /* ---------- THE CHECK-IN STATION ---------- */
    const [sx, sz] = O.station;
    const st = new THREE.Group();
    st.position.set(sx, 0, sz);
    this.scene.add(st);
    const M = (geo, color, o) => this._owMesh(geo, color, Object.assign({ parent: st }, o));
    // the terrace and its steps
    M(new THREE.BoxGeometry(34, 1.7, 30), O.stone, { pos: [0, 0.82, 0], outline: 1.6 });
    for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(12 - i * 0.6, 0.4, 1.2), O.stone2, { pos: [0, 0.2 + i * 0.4, 15.4 + (3 - i) * 1.2], outline: 0.8 });
    // the hall at the back: white walls, a dark doorway, the two-tier green roof with gold ridges
    M(new THREE.BoxGeometry(26, 13, 12), O.wall, { pos: [0, 8.1, -8], outline: 2 });
    M(new THREE.BoxGeometry(6, 8, 0.4), 0x1a0e12, { pos: [0, 5.6, -1.85], outline: 0 });
    M(new THREE.BoxGeometry(30, 1.2, 16), O.roof, { pos: [0, 15.2, -8], outline: 1.6 });
    const roof = M(new THREE.ConeGeometry(16, 6, 4, 1), O.roof, { pos: [0, 18.8, -8], rot: [0, Math.PI / 4, 0], scale: [1.35, 1, 0.75], outline: 1.8 });
    roof.castShadow = true;
    M(new THREE.BoxGeometry(22, 0.5, 0.5), O.gold, { pos: [0, 21.6, -8], outline: 0.8 });
    M(new THREE.BoxGeometry(30.4, 0.4, 0.4), O.gold, { pos: [0, 15.85, 0], outline: 0.6 });
    // the sign over the court
    const sign = new THREE.Mesh(this.track(new THREE.PlaneGeometry(7, 2.2)), this.track(new THREE.MeshBasicMaterial({ map: T.emblemTexture('閻魔庁', '#f2e6c8', '#8a1a1a'), transparent: true })));
    sign.position.set(0, 13.2, -1.6);
    st.add(sign);
    // the open court: a canopy on red pillars over King Yemma's great desk
    const pillars = [];
    for (const x of [-12, -6, 6, 12]) {
      for (const z of [-1, 9]) {
        pillars.push(M(new THREE.CylinderGeometry(0.75, 0.85, 13, 12), O.pillar, { pos: [x, 8.1, z], outline: 1.2 }));
      }
    }
    M(new THREE.BoxGeometry(28, 0.9, 13), O.roof, { pos: [0, 15, 4], outline: 1.4 });
    // the desk (Yemma sits behind it, facing the walk)
    M(new THREE.BoxGeometry(9, 3.2, 3), O.desk, { pos: [0, 3.2, 3.5], outline: 1.4 });
    M(new THREE.BoxGeometry(9.6, 0.35, 3.6), O.deskTop, { pos: [0, 4.95, 3.5], outline: 1 });
    // a pile of paperwork and a giant brush pot on the desk
    for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(1.2, 0.5, 0.9), 0xf2f0e6, { pos: [-3 + i * 0.1, 5.4 + i * 0.5, 3.4], rot: [0, i * 0.2, 0], outline: 0.5 });
    M(new THREE.CylinderGeometry(0.45, 0.45, 1.2, 12), 0x3a2a20, { pos: [3.2, 5.7, 3.2], outline: 0.6 });
    // what is solid: the hall, the terrace edge rises are walkable (the terrace is low), the desk
    this.obstacles.push({ shape: 'cyl', x: sx, z: sz - 8, y: 0, r: 13, h: 22, top: 22, hp: 1e9, maxHp: 1e9, alive: true, group: st, color: O.wall });
    this.obstacles.push({ shape: 'cyl', x: sx, z: sz + 3.5, y: 0, r: 4.2, h: 5.2, top: 5.2, hp: 1e9, maxHp: 1e9, alive: true, group: st, color: O.desk });
    this.occluders = this.occluders || [];
    for (const p of pillars) this.occluders.push({ shape: 'cyl', x: sx + p.position.x, z: sz + p.position.z, r: 0.85, bottom: 0, top: 14.6 });
    this.occluders.push({ shape: 'box', min: new V3(sx - 14, 14.5, sz - 3), max: new V3(sx + 14, 15.5, sz + 11) });
    this.landmarks.station = new V3(sx, 1.6, sz);
    this.landmarks.yemma = new V3(sx, 1.6, sz + 0.5);
    this.landmarks.desk = new V3(sx, 5, sz + 3.5);
    this.landmarks.court = new V3(sx, 1.6, sz + 10);
    this.landmarks.walk = new V3(sx, gy(sx, sz + 28), sz + 28);
    this.landmarks.roof = new V3(sx, 22, sz - 8);

    /* ---------- THE CRYSTAL BARRIER ---------- */
    const bR = O.barrierRadius || 21;
    const bc = new V3(sx, 2, sz - 1);
    const bGeo = this.track(new THREE.IcosahedronGeometry(bR, 1));
    const bMat = this.track(new THREE.MeshBasicMaterial({ color: O.barrier, transparent: true, opacity: 0.26, depthWrite: false, side: THREE.DoubleSide }));
    const barrier = new THREE.Mesh(bGeo, bMat);
    barrier.renderOrder = 6;
    const edges = new THREE.LineSegments(this.track(new THREE.EdgesGeometry(bGeo)), this.track(new THREE.LineBasicMaterial({ color: O.barrierEdge || 0xffd8ff, transparent: true, opacity: 0.85 })));
    barrier.add(edges);
    barrier.position.copy(bc);
    this.scene.add(barrier);
    const bObs = { shape: 'sphere', x: bc.x, y: bc.y, z: bc.z, r: bR * 0.98, hp: 1e9, maxHp: 1e9, alive: false, group: barrier, color: O.barrier };
    this.obstacles.push(bObs);
    this.barrier = { mesh: barrier, mat: bMat, edges, obs: bObs, center: bc.clone(), radius: bR, k: 0 };
    this.landmarks.barrier = bc.clone();
    this.landmarks.barrierFront = new V3(sx, gy(sx, sz + bR + 2), sz - 1 + bR + 2);
    this.setBarrier(O.barrierStart || 0);

    /* ---------- THE SPIRIT CLEANSING MACHINE ---------- */
    const [px, pz] = O.plant;
    const pl = new THREE.Group();
    pl.position.set(px, 0, pz);
    this.scene.add(pl);
    const N = (geo, color, o) => this._owMesh(geo, color, Object.assign({ parent: pl }, o));
    N(new THREE.CylinderGeometry(10, 10.6, 1.5, 28), O.metal2, { pos: [0, 0.72, 0], outline: 1.4 });
    // the tower of pipes
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      N(new THREE.CylinderGeometry(0.55, 0.55, 12, 10), O.metal, { pos: [Math.cos(a) * 3.2, 7, Math.sin(a) * 3.2], outline: 1 });
    }
    N(new THREE.CylinderGeometry(1.4, 1.8, 12, 14), O.metal2, { pos: [0, 7, 0], outline: 1.2 });
    N(new THREE.TorusGeometry(4.4, 0.35, 8, 28), O.metal, { pos: [0, 12.6, 0], rot: [Math.PI / 2, 0, 0], outline: 0.8 });
    // the tank: glass, the liquid inside it, bands
    const tankY = 18.5, tR = 6;
    const liquidMat = this.track(new THREE.MeshBasicMaterial({ color: O.clean, transparent: true, opacity: 0.85 }));
    const liquid = N(new THREE.SphereGeometry(tR * 0.94, 32, 22), liquidMat, { pos: [0, tankY, 0], basic: true, shadow: false });
    const glassMat = this.track(new THREE.MeshBasicMaterial({ color: 0xd8f4ff, transparent: true, opacity: 0.22, depthWrite: false }));
    const glass = N(new THREE.SphereGeometry(tR, 32, 22), glassMat, { pos: [0, tankY, 0], basic: true, shadow: false });
    T.addOutline(glass, 1.6);
    const bands = [];
    for (const y of [-2.8, 0, 2.8]) bands.push(N(new THREE.TorusGeometry(Math.sqrt(tR * tR - y * y) * 1.01, 0.22, 8, 36), O.metal, { pos: [0, tankY + y, 0], rot: [Math.PI / 2, 0, 0], outline: 0.6 }));
    const cap = N(new THREE.CylinderGeometry(1.6, 2.4, 1.6, 16), O.metal2, { pos: [0, tankY + tR + 0.4, 0], outline: 1 });
    const glow = this._gGlow(new V3(px, pl.position.y + tankY, pz), O.clean, tR * 4, 0.35);
    // the pipes down to the machinery and the gauge panel with its lamps, the booth in front
    for (const sxp of [1, -1]) {
      N(new THREE.BoxGeometry(3.4, 4, 3), O.metal2, { pos: [sxp * 6.6, 3.4, -2.4], outline: 1 });
      N(new THREE.CylinderGeometry(0.4, 0.4, 9, 8), O.metal, { pos: [sxp * 5.2, 9.6, -1.8], rot: [0, 0, sxp * 0.55], outline: 0.6 });
    }
    N(new THREE.BoxGeometry(4.4, 2.6, 0.6), O.metal, { pos: [0, 3.2, 6.6], outline: 1 });
    const lamps = [];
    for (let i = 0; i < 3; i++) {
      const lm = this.track(new THREE.MeshBasicMaterial({ color: 0x3aff6a }));
      lamps.push(lm);
      N(new THREE.SphereGeometry(0.28, 10, 8), lm, { pos: [-1.3 + i * 1.3, 3.9, 6.95], basic: true, shadow: false, outline: 0 });
    }
    // the gauge: a dial with a needle that climbs into the red
    const dial = N(new THREE.CircleGeometry(0.8, 20), 0xf2f0e6, { pos: [0, 2.7, 6.92], basic: true, outline: 0 });
    void dial;
    const needle = N(new THREE.BoxGeometry(0.06, 0.7, 0.04), 0x1a1a1a, { pos: [0, 2.7, 6.96], basic: true, outline: 0 });
    needle.geometry.translate(0, 0.3, 0);
    // the booth: a rail and a stool where the young ogre is meant to sit
    N(new THREE.BoxGeometry(5.5, 0.15, 0.15), O.metal, { pos: [0, 2.6, 9.4], outline: 0.5 });
    for (const x of [-2.7, 2.7]) N(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), O.metal, { pos: [x, 2, 9.4], outline: 0.4 });
    N(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 10), 0x8a3a2a, { pos: [-1.5, 1.9, 8.2], outline: 0.5 });
    this.obstacles.push({ shape: 'cyl', x: px, z: pz, y: 0, r: 4.6, h: tankY + tR, top: tankY + tR, hp: 1e9, maxHp: 1e9, alive: true, group: pl, color: O.metal });
    this.plant = { group: pl, liquid, liquidMat, glass, glassMat, bands, cap, glow, lamps, needle, tankY, tR, k: 0, burst: false };
    this.landmarks.plant = new V3(px, pl.position.y + 1.4, pz);
    this.landmarks.tank = new V3(px, pl.position.y + tankY, pz);
    this.landmarks.booth = new V3(px - 0.5, pl.position.y + 1.4, pz + 8.3);
    this.landmarks.gauge = new V3(px, pl.position.y + 3.2, pz + 6.95);

    /* ---------- THE WARP: Janemba's playground ---------- */
    const warp = new THREE.Group();
    warp.visible = false;
    this.scene.add(warp);
    const items = [];
    const pastel = O.pastel;
    const place = (obj, base, phase) => {
      obj.userData.base = base.clone();
      obj.userData.phase = phase;
      warp.add(obj);
      items.push(obj);
      return obj;
    };
    // floating blocks at every height
    for (let i = 0; i < 46; i++) {
      const a = rng() * Math.PI * 2, d = 26 + rng() * 120;
      const s = 1 + rng() * 3.4;
      const m = new THREE.Mesh(this.track(new THREE.BoxGeometry(s, s, s)), T.mat(pastel[i % pastel.length]));
      T.addOutline(m, 1.2);
      m.rotation.set(rng() * 3, rng() * 3, rng() * 3);
      m.userData.spin = new V3(rng() - 0.5, rng() - 0.5, 0).multiplyScalar(0.3);
      this.spinners.push(m);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      place(m, new V3(x, gy(x, z) + 4 + rng() * 34, z), rng());
    }
    // giant lollipops planted in the ground
    const swirl = T.canvasTexture(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#fff4fa';
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#ff5aa8';
      ctx.beginPath();
      for (let i = 0; i < 200; i++) {
        const t = i / 200, r = t * w * 0.48, ang = t * 18;
        const x = w / 2 + Math.cos(ang) * r, y = h / 2 + Math.sin(ang) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    });
    this.track(swirl);
    for (let i = 0; i < 14; i++) {
      const a = rng() * Math.PI * 2, d = 34 + rng() * 100;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - sx, z - sz) < 26 || Math.hypot(x - px, z - pz) < 16) continue;
      const g = new THREE.Group();
      const H = 7 + rng() * 9;
      const stick = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.3, 0.3, H, 8)), T.mat(0xf8f4ee));
      stick.position.y = H / 2;
      const disc = new THREE.Mesh(this.track(new THREE.CylinderGeometry(3.2, 3.2, 0.7, 28)), this.track(T.makeMat(0xffffff, { map: swirl })));
      disc.rotation.x = Math.PI / 2;
      disc.position.y = H + 2.4;
      T.addOutline(disc, 1.2);
      T.addOutline(stick, 0.8);
      g.add(stick, disc);
      g.rotation.y = rng() * Math.PI;
      g.rotation.z = (rng() - 0.5) * 0.4;
      place(g, new V3(x, gy(x, z) - 0.3, z), rng());
    }
    // jellybeans and gumdrops scattered on the ground
    for (let i = 0; i < 40; i++) {
      const a = rng() * Math.PI * 2, d = 22 + rng() * 120;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - sx, z - sz) < 24 || Math.hypot(x - px, z - pz) < 14) continue;
      const col = pastel[(i * 3) % pastel.length];
      let m;
      if (i % 2) {
        m = new THREE.Mesh(this.track(new THREE.CapsuleGeometry(0.9, 1.4, 6, 12)), T.mat(new THREE.Color(col).multiplyScalar(0.92).getHex()));
        m.rotation.set(Math.PI / 2, rng() * 3, rng() * 0.8);
      } else {
        m = new THREE.Mesh(this.track(new THREE.ConeGeometry(1.4, 2.2, 10)), T.mat(col));
        m.scale.y = 0.8;
      }
      T.addOutline(m, 1);
      place(m, new V3(x, gy(x, z) + 0.7, z), rng());
    }
    // THE FLOATING SPIKED ROCK (Goku and Vegeta hide behind it): a boulder bristling with spikes
    const [kx, kz, kh] = O.spike;
    const rock = new THREE.Group();
    const core = new THREE.Mesh(this.track(new THREE.DodecahedronGeometry(5, 0)), T.mat(O.spikeRock));
    T.addOutline(core, 2);
    rock.add(core);
    for (let i = 0; i < 16; i++) {
      const dir = new V3(Math.sin(i * 2.4) * Math.cos(i * 0.7), Math.cos(i * 1.3), Math.sin(i * 0.9) * Math.sin(i * 2.4)).normalize();
      const sp = new THREE.Mesh(this.track(new THREE.ConeGeometry(0.9, 4 + (i % 3), 6)), T.mat(O.spikeRock2));
      sp.position.copy(dir.clone().multiplyScalar(4.6));
      sp.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
      T.addOutline(sp, 1);
      rock.add(sp);
    }
    place(rock, new V3(kx, gy(kx, kz) + kh, kz), 0.3);
    const rockObs = { shape: 'sphere', x: kx, y: gy(kx, kz) + kh, z: kz, r: 5.4, hp: 1e9, maxHp: 1e9, alive: false, group: rock, color: O.spikeRock };
    this.obstacles.push(rockObs);
    this.landmarks.spike = new V3(kx, gy(kx, kz) + kh, kz);
    this.landmarks.spikeBehind = new V3(kx - 7, gy(kx - 7, kz - 4), kz - 4);
    this._warp = { group: warp, items, rockObs, k: 0 };

    // the sky's two faces, the fog's, the lights'
    this._owSky = {
      normal: { top: new THREE.Color(this.def.sky.top), horizon: new THREE.Color(this.def.sky.horizon), bottom: new THREE.Color(this.def.sky.bottom), fog: new THREE.Color(this.def.fog.color), sun: new THREE.Color(this.def.light.sun), hemi: new THREE.Color(this.def.light.sky) },
      warp: { top: new THREE.Color(O.warpSky.top), horizon: new THREE.Color(O.warpSky.horizon), bottom: new THREE.Color(O.warpSky.bottom), fog: new THREE.Color(O.warpSky.fog), sun: new THREE.Color(O.warpSky.sun), hemi: new THREE.Color(O.warpSky.hemi) },
    };
    this._owNormal = this.baseColors ? this.baseColors.slice() : null;
    this.landmarks.field = new V3(O.field[0], gy(O.field[0], O.field[1]), O.field[1]);
    this.landmarks.far = new V3(O.far[0], gy(O.far[0], O.far[1]), O.far[1]);
    this.landmarks.center = new V3(0, gy(0, 0), 0);

    // the warp breathes: blocks bob, lollipops sway, the barrier shimmers, the tank's lamps blink
    let tt = 0;
    this.ambient.push((dt) => {
      tt += dt;
      const W = this._warp;
      if (W.k > 0.001) {
        for (const o of W.items) {
          const ph = o.userData.phase;
          const grow = U.clamp01((W.k - ph * 0.4) / 0.6);
          o.visible = grow > 0.01;
          o.scale.setScalar(Math.max(0.001, grow));
          o.position.copy(o.userData.base);
          o.position.y += Math.sin(tt * 0.8 + ph * 6) * 0.6 * grow - (1 - grow) * 3;
        }
      }
      const B = this.barrier;
      if (B.k > 0.01) {
        B.mat.opacity = (0.2 + Math.sin(tt * 2.2) * 0.05) * B.k;
        B.edges.material.opacity = (0.65 + Math.sin(tt * 3.1) * 0.2) * B.k;
        B.mesh.rotation.y += dt * 0.05;
      }
      const Pl = this.plant;
      if (Pl && !Pl.burst) {
        const rate = 1 + Pl.k * 9;
        const on = Math.sin(tt * rate * 3) > 0;
        Pl.lamps.forEach((lm, i) => lm.color.set(Pl.k < 0.35 ? 0x3aff6a : Pl.k < 0.7 ? (on || i % 2 ? 0xffd23a : 0x6a5a1a) : on ? 0xff2a2a : 0x4a0a0a));
        Pl.needle.rotation.z = U.lerp(1.2, -1.3, Pl.k) + Math.sin(tt * 30) * Pl.k * 0.08;
        const shake = Pl.k > 0.55 ? (Pl.k - 0.55) * 0.5 : 0;
        Pl.liquid.position.x = Math.sin(tt * 40) * shake;
        Pl.glass.position.x = Math.sin(tt * 37) * shake * 0.6;
      }
    });
    this.setWarp(O.warp || 0);
  };

  /** 0 = the Other World as it was, 1 = Janemba's playground (colours, sky, the floating things). */
  P.setWarp = function (k) {
    if (!this._warp) return;
    k = U.clamp01(k);
    const W = this._warp;
    W.k = k;
    W.group.visible = k > 0.001;
    if (k <= 0.001) for (const o of W.items) o.visible = false;
    W.rockObs.alive = k > 0.6;
    // the ground
    if (this._owNormal && this._owWarp && this.terrainGeo) {
      const col = this.terrainGeo.attributes.color;
      const a = col.array, n0 = this._owNormal, w = this._owWarp;
      for (let i = 0; i < a.length; i++) a[i] = n0[i] + (w[i] - n0[i]) * k;
      col.needsUpdate = true;
    }
    // the sky, the fog, the light
    const S = this._owSky;
    if (S && this.sky) {
      const u = this.sky.material.uniforms;
      u.top.value.copy(S.normal.top).lerp(S.warp.top, k);
      u.horizon.value.copy(S.normal.horizon).lerp(S.warp.horizon, k);
      u.bottom.value.copy(S.normal.bottom).lerp(S.warp.bottom, k);
      if (this.battle.scene.fog) this.battle.scene.fog.color.copy(S.normal.fog).lerp(S.warp.fog, k);
      this.sun.color.copy(S.normal.sun).lerp(S.warp.sun, k);
      this.hemi.color.copy(S.normal.hemi).lerp(S.warp.hemi, k);
    }
  };

  /** The crystal over the Check-In Station: 0 gone, 1 sealed (solid from 0.5). */
  P.setBarrier = function (k) {
    const B = this.barrier;
    if (!B) return;
    B.k = U.clamp01(k);
    B.mesh.visible = B.k > 0.01;
    B.mesh.scale.setScalar(0.2 + 0.8 * U.easeOutCubic(B.k));
    B.mat.opacity = 0.26 * B.k;
    B.edges.material.opacity = 0.85 * B.k;
    B.obs.alive = B.k > 0.5;
  };

  /** A blow, a blast or a hand on the barrier: the crystal answers with light where it was touched. */
  P.barrierFlash = function (point, strong) {
    const B = this.barrier, b = this.battle;
    if (!B || B.k < 0.5) return;
    const n = point.clone().sub(B.center).normalize();
    const p = B.center.clone().addScaledVector(n, B.radius);
    b.vfx.ring(p, strong ? 4 : 2.2, 0xffc8ff, 0.4, n);
    b.vfx.flash(p, strong ? 3 : 1.6, 0xe8a8ff, 0.18, SL.Toon.tex.glow);
    b.vfx.sparks(p, 0xffd8ff, strong ? 18 : 8, 6, 0.08);
    B.mat.opacity = 0.5;
  };

  /** The corruption rising in the tank: 0 clean blue, 1 black and straining. */
  P.setTank = function (k) {
    const Pl = this.plant;
    if (!Pl || Pl.burst) return;
    Pl.k = U.clamp01(k);
    const O = this.def.otherworld;
    const c = new THREE.Color(O.clean);
    if (Pl.k < 0.5) c.lerp(new THREE.Color(O.dirty), Pl.k * 2);
    else c.set(O.dirty).lerp(new THREE.Color(O.evil), (Pl.k - 0.5) * 2);
    Pl.liquidMat.color.copy(c);
    Pl.glow.material.color.copy(c);
    Pl.glow.material.opacity = 0.35 + Pl.k * 0.3;
    Pl.liquid.scale.setScalar(1 + Math.max(0, Pl.k - 0.8) * 0.12);
  };

  /** The tank gives: glass everywhere, the evil loose. Returns the point it burst from. */
  P.burstTank = function () {
    const Pl = this.plant, b = this.battle;
    if (!Pl || Pl.burst) return null;
    Pl.burst = true;
    const at = this.landmarks.tank.clone();
    Pl.liquid.visible = Pl.glass.visible = false;
    for (const m of Pl.bands) m.visible = false;
    Pl.cap.visible = false;
    Pl.glow.material.opacity = 0;
    for (let i = 0; i < 26; i++) {
      const v = new V3(Math.sin(i * 2.4), 0.3 + (i % 5) * 0.25, Math.cos(i * 2.4)).normalize().multiplyScalar(10 + (i % 4) * 4);
      b.vfx.rock(at.clone().add(v.clone().multiplyScalar(0.3)), v, 0.3 + (i % 3) * 0.15, i % 3 ? 0xd8f4ff : 0xa8c8d8);
    }
    for (const L of Pl.lamps) L.color.set(0x220000);
    return at;
  };
})();
