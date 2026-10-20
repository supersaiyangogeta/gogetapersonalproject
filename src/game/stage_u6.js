/*
 * THE NAMELESS PLANET (Dragon Ball Super, Chapter 18 · Universe 6) — dressing added to SL.Stage's tournament arena
 * builder for stages.js `u6_arena` (def.cosmos). The owner's reference (SUPER_SAGA_VISUAL_REFERENCE.md §1): a
 * colossal arena on a dead world in the neutral space between Universes 6 and 7, a star-filled void overhead and
 * the planet-sized Super Dragon Balls hanging silent in it. The ring, the cracks, ring-outs and heightAt are the
 * arena builder's own (stage.js _buildArena); this only adds what surrounds it.
 *
 *   THE VOID           a star field round the camera (follows it like the orbit stage's)
 *   THE SUPER BALLS    huge amber spheres, each with its red stars, a soft glow round it, hanging far out in space
 *   THE BOXES          two pavilions at the ring's sides: Universe 7's (blue awning) and Universe 6's (red): a low
 *                      dais, four posts, a canopy — where the gods and the teams watch from
 *
 * landmarks { u7Box, u6Box, u7Side, u6Side } (u7Side / u6Side: where each team stands at the ring's edge).
 * Seeded (the stage's own random stream); scenery only — nothing here is an obstacle a fight could catch on.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const P = SL.Stage.prototype;

  P._buildCosmos = function (C) {
    const T = SL.Toon, rng = this.rng, A = this.def.arena;
    // the void: stars all round, kept at a fixed distance from the camera (Stage.update moves this.stars)
    const n = C.stars || 2400;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // the upper sky only: the ground hides everything below the horizon anyway
      const v = new V3(rng() * 2 - 1, rng() * 0.9 + 0.05, rng() * 2 - 1).normalize().multiplyScalar(900);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    }
    const geo = this.track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const stars = new THREE.Points(geo, this.track(new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, fog: false })));
    stars.renderOrder = -9;
    this.scene.add(stars);
    this.stars = stars;

    // the Super Dragon Balls: amber spheres with red stars (one to seven), a glow, far out in the void
    const ballTex = (count) => T.canvasTexture(512, 256, (g, w, h) => {
      const grd = g.createRadialGradient(w * 0.35, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.6);
      grd.addColorStop(0, '#ffe2a0');
      grd.addColorStop(0.5, '#ffa62a');
      grd.addColorStop(1, '#c8641a');
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#d8281a';
      const star = (cx, cy, r) => {
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
          g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
      };
      // the stars on the side that faces the arena (u = 0.25 of the wrap)
      for (let i = 0; i < count; i++) {
        const a = (i / Math.max(1, count)) * Math.PI * 2;
        const rr = count > 1 ? 26 : 0;
        star(w * 0.25 + Math.cos(a) * rr, h * 0.5 + Math.sin(a) * rr * 0.8, 18);
      }
    });
    const sphere = this.track(new THREE.SphereGeometry(1, 32, 20));
    this.superBalls = [];
    for (const sb of C.balls || []) {
      const mat = this.track(new THREE.MeshBasicMaterial({ map: this.track(ballTex(sb.stars)), fog: false }));
      const ball = new THREE.Mesh(sphere, mat);
      ball.scale.setScalar(sb.r);
      ball.position.set(sb.at[0], sb.at[1], sb.at[2]);
      // the stars turned toward the ring
      ball.rotation.y = Math.atan2(-sb.at[0], -sb.at[2]) - Math.PI / 2;
      const glow = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xffb04a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.45, fog: false })));
      glow.scale.setScalar(sb.r * 3.4);
      glow.position.copy(ball.position);
      this.scene.add(ball, glow);
      this.superBalls.push(ball);
    }
    // they turn, very slowly
    this.ambient.push((dt) => {
      for (const b of this.superBalls) b.rotation.y += dt * 0.01;
    });

    // the two boxes, either side of the ring
    const box = (x, z, awning, trim) => {
      const g = new THREE.Group();
      const dais = new THREE.Mesh(this.track(new THREE.BoxGeometry(9, 0.14, 6)), T.mat(C.stone));
      // low enough to stand on from the ground (the gods are placed on the terrain under it)
      dais.position.y = 0.07;
      T.addOutline(dais, 1.6);
      g.add(dais);
      const post = this.track(new THREE.CylinderGeometry(0.18, 0.2, 4.4, 8));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const p = new THREE.Mesh(post, T.mat(trim));
        p.position.set(sx * 4.1, 2.7, sz * 2.6);
        T.addOutline(p, 1.2);
        g.add(p);
      }
      const roof = new THREE.Mesh(this.track(new THREE.BoxGeometry(9.8, 0.35, 6.8)), T.mat(awning));
      roof.position.y = 5;
      T.addOutline(roof, 1.6);
      g.add(roof);
      const band = new THREE.Mesh(this.track(new THREE.BoxGeometry(10, 0.5, 7)), T.mat(trim));
      band.position.y = 4.7;
      g.add(band);
      g.position.set(x, this.heightAt(x, z), z);
      g.rotation.y = Math.atan2(-x, -z);
      this.scene.add(g);
      return g;
    };
    const bx = A.half + C.boxOff;
    box(bx, 0, C.u7Awning, C.trim);
    box(-bx, 0, C.u6Awning, C.trim);
    const at = (x, z) => new V3(x, this.heightAt(x, z), z);
    this.landmarks = this.landmarks || {};
    this.landmarks.u7Box = at(bx, 0);
    this.landmarks.u6Box = at(-bx, 0);
    this.landmarks.u7Side = at(A.half + 4, A.half * 0.55);
    this.landmarks.u6Side = at(-(A.half + 4), -A.half * 0.55);
  };
})();
