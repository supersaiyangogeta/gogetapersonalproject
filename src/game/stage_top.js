/*
 * THE TOURNAMENT OF POWER ARENA (Dragon Ball Super) — stages.js `top_arena` (the purple void) and `top_green` (the
 * green void of the Universe 6 Saiyans' fights), builder 'top'. From the owner's reference (Tournament of power
 * ui.docx and the stills): a huge pale stone platform hanging in an endless multicoloured void, broken by the fighting
 * into rubble and raised slabs; nothing under it but the drop; the gods' stands floating to one side; the Grand
 * Priest's spinning-top dais; Zeno's box above them all.
 *
 *   THE PLATFORM   SL.Stage's own tournament ring (_buildRing: tiles, cracks, ring-outs, heightAt), a thick stone
 *                  skirt and a rocky underside, so it reads as an island floating in nothing
 *   THE VOID       no ground at all: heightAt is the platform or a drop far below. Off the edge you fall, and the
 *                  tournament's ring-out rule (Battle._ringOutCheck) calls it the moment you sink below the top
 *   THE DRESSING   broken pillars and outcrops at the platform's edges (scenery: nothing a fight catches on), slabs of
 *                  rock floating in the void, nebula glows and stars round the camera
 *   THE STANDS     tiered stone bleachers floating off one side (landmarks.stand(row, k): a seat), the Grand Priest's
 *                  spinning dais beside the platform (landmarks.priest), Zeno's box high above (landmarks.zeno)
 * Seeded (the stage's own random stream); scenery only.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const P = SL.Stage.prototype;

  P._buildTop = function () {
    const def = this.def, A = def.arena, T = SL.Toon, rng = this.rng;
    const C = def.top || {};
    // the void: a coarse grid far below (heightAt off the platform), no terrain mesh
    const S = (this.size = def.size);
    const N = (this.seg = 8);
    this.step = S / N;
    this.heights = new Float32Array((N + 1) * (N + 1)).fill(C.drop || -400);
    this.terrainGeo = null;
    this.terrain = null;
    this.floor = C.drop || -400;

    // THE PLATFORM: the ring (paving, cracks, ring-outs) and what holds it up
    this._buildRing(A);
    const hgt = A.height, half = A.half;
    const skirt = new THREE.Mesh(this.track(new THREE.BoxGeometry(half * 2 + 1.2, 5, half * 2 + 1.2)), T.mat(A.side));
    skirt.position.y = -2.4;
    T.addOutline(skirt, 2);
    this.scene.add(skirt);
    // the rocky underside: a broken inverted mountain
    const under = new THREE.Group();
    const rockGeo = this.track(new THREE.DodecahedronGeometry(1, 0));
    const uMat = T.mat(C.under || 0x5a5048);
    for (let i = 0; i < 26; i++) {
      const a = rng() * Math.PI * 2, d = rng() * half * 0.9;
      const s = 8 + rng() * 16;
      const m = new THREE.Mesh(rockGeo, uMat);
      m.position.set(Math.cos(a) * d, -6 - rng() * 22 - (1 - d / half) * 18, Math.sin(a) * d);
      m.scale.set(s, s * (0.8 + rng() * 0.8), s);
      m.rotation.set(rng() * 3, rng() * 6, rng() * 3);
      // its top stays under the stone skirt (bottom at -4.9): a big boulder placed high used to break up through the
      // paving — in the green void a flat dark triangle in the middle of the platform (2026-10-15 arena cleanup)
      m.position.y = Math.min(m.position.y, -5.2 - Math.max(m.scale.x, m.scale.y));
      under.add(m);
    }
    this.scene.add(under);

    // broken pillars and outcrops at the edges of the platform (scenery: the middle stays open)
    const pillarGeo = this.track(new THREE.CylinderGeometry(1, 1.15, 1, 8));
    const pMat = T.mat(C.pillar || 0xb8b0a0), pDark = T.mat(C.pillarDark || 0x8a8274);
    // the rim dressing stands where ring-out fights happen and the camera hangs out over the drop: each piece has its
    // own material so it can fade out of the way (see the occlusion hook at the end)
    const occluders = [];
    const own = (mat) => {
      const c = mat.clone();
      this.disposables.push(c);
      return c;
    };
    for (let i = 0; i < (C.pillars || 14); i++) {
      const side = i % 4, t = (rng() - 0.5) * 1.6;
      const e = half - 2 - rng() * 4;
      const x = side < 2 ? (side ? e : -e) : t * half, z = side < 2 ? t * half : side === 2 ? e : -e;
      const r = 1 + rng() * 1.3, h = 4 + rng() * 14;
      const col = new THREE.Mesh(pillarGeo, own(rng() < 0.5 ? pMat : pDark));
      occluders.push(col);
      col.position.set(x, hgt + h / 2 - 0.2, z);
      col.scale.set(r, h, r);
      col.rotation.set((rng() - 0.5) * 0.25, rng() * 6, (rng() - 0.5) * 0.25);
      T.addOutline(col, 1.6);
      this.scene.add(col);
      // a broken drum lying beside some of them
      if (rng() < 0.5) {
        const drum = new THREE.Mesh(pillarGeo, own(pDark));
        occluders.push(drum);
        drum.position.set(x + (rng() - 0.5) * 5, hgt + r * 0.8, z + (rng() - 0.5) * 5);
        drum.scale.set(r * 0.9, 2 + rng() * 3, r * 0.9);
        drum.rotation.set(Math.PI / 2, rng() * 6, 0);
        T.addOutline(drum, 1.4);
        this.scene.add(drum);
      }
    }
    for (let i = 0; i < (C.outcrops || 10); i++) {
      const a = rng() * Math.PI * 2;
      const e = half - 3 - rng() * 3;
      const x = U.clamp(Math.cos(a) * half * 1.4, -e, e), z = U.clamp(Math.sin(a) * half * 1.4, -e, e);
      const s = 2.5 + rng() * 4;
      const m = new THREE.Mesh(rockGeo, own(T.mat(C.outcrop || 0x9a9284)));
      occluders.push(m);
      m.position.set(x, hgt + s * 0.4, z);
      m.scale.set(s, s * (1 + rng() * 1.2), s);
      m.rotation.set(rng() * 0.5, rng() * 6, rng() * 0.5);
      T.addOutline(m, 2);
      this.scene.add(m);
    }

    // THE VOID: stars, nebula glows, and slabs of rock drifting in it
    const n = C.stars || 2600;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new V3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize().multiplyScalar(900);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    }
    const sgeo = this.track(new THREE.BufferGeometry());
    sgeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const stars = new THREE.Points(sgeo, this.track(new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })));
    stars.renderOrder = -9;
    this.scene.add(stars);
    this.stars = stars;
    this.nebula = new THREE.Group();
    for (const nb of C.nebula || []) {
      const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.glow, color: nb.color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: nb.opacity || 0.35, fog: false })));
      sp.scale.setScalar(nb.size);
      sp.position.set(nb.at[0], nb.at[1], nb.at[2]);
      sp.renderOrder = -8;
      this.nebula.add(sp);
    }
    this.scene.add(this.nebula);
    const drift = [];
    const fMat = T.mat(C.floating || 0x6a6058), fMat2 = T.mat(C.floating2 || 0x4a5a48);
    for (let i = 0; i < (C.floatingRocks || 46); i++) {
      const a = rng() * Math.PI * 2, d = half + 22 + rng() * 240;
      const s = 1 + rng() * (d > 140 ? 14 : 5);
      const m = new THREE.Mesh(rockGeo, rng() < 0.7 ? fMat : fMat2);
      m.position.set(Math.cos(a) * d, hgt - 30 + rng() * 120, Math.sin(a) * d);
      m.scale.set(s, s * (0.6 + rng() * 0.8), s);
      m.rotation.set(rng() * 3, rng() * 6, rng() * 3);
      if (s > 3) T.addOutline(m, 2);
      m.userData.bob = { y: m.position.y, ph: rng() * 6, sp: 0.2 + rng() * 0.4, rot: (rng() - 0.5) * 0.1 };
      this.scene.add(m);
      drift.push(m);
    }
    this.ambient.push((dt) => {
      const t = performance.now() / 1000;
      for (const m of drift) {
        const b = m.userData.bob;
        m.position.y = b.y + Math.sin(t * b.sp + b.ph) * 1.2;
        m.rotation.y += b.rot * dt;
      }
    });

    // THE STANDS: tiered stone bleachers floating off the platform's north side, facing it
    const st = C.stands || {};
    const rows = st.rows || 4, width = st.width || 44;
    const sz = -(half + (st.off || 12)), sy = hgt + (st.lift || 3);
    const stands = new THREE.Group();
    const tierA = T.mat(st.a || 0x5a6a3a), tierB = T.mat(st.b || 0xc8c060), wall = T.mat(st.wall || 0x3e4a34);
    for (let r = 0; r < rows; r++) {
      const tier = new THREE.Mesh(this.track(new THREE.BoxGeometry(width - r * 2, 1.1, 1.6)), r % 2 ? tierB : tierA);
      tier.position.set(0, r * 1.1 + 0.55, -r * 1.6);
      T.addOutline(tier, 1.2);
      stands.add(tier);
    }
    const back = new THREE.Mesh(this.track(new THREE.BoxGeometry(width + 2, rows * 1.1 + 3, 1)), wall);
    back.position.set(0, (rows * 1.1 + 3) / 2 - 1, -rows * 1.6 - 0.2);
    T.addOutline(back, 1.4);
    stands.add(back);
    const base = new THREE.Mesh(this.track(new THREE.BoxGeometry(width + 2, 3, rows * 1.6 + 1.4)), wall);
    base.position.set(0, -1.5, -rows * 0.8 + 0.4);
    T.addOutline(base, 1.4);
    stands.add(base);
    stands.position.set(0, sy, sz);
    this.scene.add(stands);

    // the Grand Priest's dais: a spinning top hanging beside the platform
    const pr = C.priest || {};
    const px = half + (pr.off || 7), py = hgt + (pr.lift || 2);
    const dais = new THREE.Group();
    const top = new THREE.Mesh(this.track(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 20)), T.mat(0xd8dce6));
    T.addOutline(top, 1.4);
    dais.add(top);
    const bowl = new THREE.Mesh(this.track(new THREE.ConeGeometry(2.4, 2.6, 20)), T.mat(0x6a9a5a));
    bowl.rotation.x = Math.PI;
    bowl.position.y = -1.55;
    T.addOutline(bowl, 1.4);
    dais.add(bowl);
    const ring = new THREE.Mesh(this.track(new THREE.TorusGeometry(2.45, 0.12, 6, 24)), T.mat(0xe0b040));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.4;
    dais.add(ring);
    for (let i = 0; i < 4; i++) {
      const spike = new THREE.Mesh(this.track(new THREE.ConeGeometry(0.35, 1.6, 6)), T.mat(0xe0b040));
      const a = (i / 4) * Math.PI * 2;
      spike.position.set(Math.cos(a) * 2.9, -0.35, Math.sin(a) * 2.9);
      spike.rotation.set(0, 0, -Math.PI / 2);
      spike.rotation.y = -a;
      dais.add(spike);
    }
    dais.position.set(px, py, 0);
    this.scene.add(dais);
    this.ambient.push((dt) => {
      dais.rotation.y += dt * 0.6;
      dais.position.y = py + Math.sin(performance.now() / 900) * 0.15;
    });

    // Zeno's box: a high balcony behind the stands, two gold chairs
    const zb = new THREE.Group();
    const floor = new THREE.Mesh(this.track(new THREE.BoxGeometry(8, 0.6, 5)), T.mat(0xd8d4e8));
    T.addOutline(floor, 1.4);
    zb.add(floor);
    const stem = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.8, 1.6, 10, 10)), T.mat(0xb8b4c8));
    stem.position.y = -5.2;
    zb.add(stem);
    for (const sx of [-1.4, 1.4]) {
      const chair = new THREE.Mesh(this.track(new THREE.BoxGeometry(1.4, 2.6, 1)), T.mat(0xe8c040));
      chair.position.set(sx, 1.5, -1.6);
      T.addOutline(chair, 1.2);
      zb.add(chair);
    }
    const zy = sy + rows * 1.1 + 9, zz = sz - rows * 1.6 - 4;
    zb.position.set(0, zy, zz);
    this.scene.add(zb);

    // landmarks
    const L = (this.landmarks = this.landmarks || {});
    L.center = new V3(0, hgt, 0);
    L.priest = new V3(px, py + 0.25, 0);
    L.zeno = (k) => new V3(k ? 1.4 : -1.4, zy + 0.3, zz - 0.6);
    // a seat in the stands: row 0 (front) .. rows-1, k -1..1 across the width
    L.stand = (row, k) => new V3(k * (width - row * 2) * 0.5, sy + row * 1.1 + 1.1, sz - row * 1.6);
    L.standFacing = new V3(0, hgt, 0);

    // THE EDGE, READ BEFORE IT HAPPENS: when the player's fighter comes within a few metres of the drop, the rim
    // nearest them glows red — a strip on the paving along the lip — brighter the closer they are. Off while a scene
    // has the controls, and on stages without ring-outs. (A curtain rising off the lip was tried: with the camera out
    // over the drop it stood between the lens and the fight.)
    // normal blending: added light washes out to white on the pale paving; a red wash reads
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const strip = new THREE.Mesh(this.track(new THREE.PlaneGeometry(1, 1)), edgeMat);
    strip.rotation.x = -Math.PI / 2;
    strip.renderOrder = 9;
    this.scene.add(strip);
    this.disposables.push(edgeMat);
    let glow = 0;
    this.ambient.push((dt) => {
      const b = this.battle, p = b && b.player;
      let target = 0;
      if (p && !p.hidden && this.def.ringOut && !b.inputLocked) {
        const ax = Math.abs(p.pos.x), az = Math.abs(p.pos.z);
        const d = half - Math.max(ax, az);
        target = Math.pow(U.clamp01(1 - d / 8), 0.7);
        const onX = ax > az, s = Math.sign(onX ? p.pos.x : p.pos.z) || 1;
        if (onX) {
          strip.position.set(s * (half - 0.7), hgt + 0.05, U.clamp(p.pos.z, -half + 5, half - 5));
          strip.scale.set(1.4, 10, 1);
        } else {
          strip.position.set(U.clamp(p.pos.x, -half + 5, half - 5), hgt + 0.05, s * (half - 0.7));
          strip.scale.set(10, 1.4, 1);
        }
      }
      glow = U.damp(glow, target, 8, dt);
      const pulse = 0.85 + Math.sin(performance.now() / 160) * 0.15;
      edgeMat.opacity = glow * 0.62 * pulse;
      strip.visible = glow > 0.01;
    });

    // CAMERA OCCLUSION: a pillar or outcrop standing between the camera and the player's fighter (seen from above:
    // near the line between them) fades to a ghost and loses its outline; it comes back when the line is clear
    this.ambient.push((dt) => {
      const b = this.battle, p = b && b.player, cam = b && b.camera && b.camera.camera;
      if (!p || !cam) return;
      const ax = cam.position.x, az = cam.position.z, sx = p.pos.x - ax, sz = p.pos.z - az;
      const len2 = sx * sx + sz * sz || 1;
      for (const o of occluders) {
        const t = U.clamp01(((o.position.x - ax) * sx + (o.position.z - az) * sz) / len2);
        const dx = ax + sx * t - o.position.x, dz = az + sz * t - o.position.z;
        const r = Math.max(o.scale.x, o.scale.z) * 1.25 + 0.8;
        const block = t < 0.96 && dx * dx + dz * dz < r * r;
        const mat = o.material;
        const op = U.damp(mat.opacity, block ? 0.18 : 1, 10, dt);
        if (Math.abs(op - mat.opacity) < 1e-4 && !block && mat.opacity === 1) continue;
        mat.transparent = op < 0.99;
        mat.opacity = op > 0.99 ? 1 : op;
        mat.depthWrite = op > 0.9;
        for (const ch of o.children) ch.visible = op > 0.9;
      }
    });
  };
})();
