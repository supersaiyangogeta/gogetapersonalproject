/*
 * Stage: sky, lighting, terrain, destructible obstacles and mission props.
 * Destruction affects gameplay: craters change terrain height, destroyed
 * rock spires stop blocking movement, beams and shots, props can be objectives.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  class Stage {
    constructor(battle, def) {
      this.battle = battle;
      this.def = def;
      this.scene = battle.scene;
      this.hasGround = def.type === 'ground';
      this.arenaRadius = def.arenaRadius;
      this.ceiling = def.ceiling;
      this.floor = def.floor !== undefined ? def.floor : -1e9;
      this.obstacles = [];
      this.props = [];
      this.clouds = [];
      this.spinners = [];
      this.rockColor = def.rock ? def.rock.bands[0] : 0x8a6a4a;
      this.disposables = [];
      this._normalsDirty = false;
      this.rng = U.mulberry32(def.seed || 1);
      this._buildSky();
      this._buildLights();
      if (def.builder === 'wasteland') this._buildWasteland();
      else if (def.builder === 'orbit') this._buildOrbit();
    }

    track(obj) {
      this.disposables.push(obj);
      return obj;
    }

    /* ---------------- sky & light ---------------- */
    _buildSky() {
      const s = this.def.sky;
      const mat = this.track(new THREE.ShaderMaterial({
        uniforms: {
          top: { value: new THREE.Color(s.top) },
          horizon: { value: new THREE.Color(s.horizon) },
          bottom: { value: new THREE.Color(s.bottom) },
          sunDir: { value: new V3(...(s.sunDir || [0.3, 0.6, 0.4])).normalize() },
          sunOn: { value: s.sunDir ? 1 : 0 },
          uMood: { value: new THREE.Color(0x101020) },
          uMoodAmt: { value: 0 },
        },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
        fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform float sunOn; uniform vec3 uMood; uniform float uMoodAmt; varying vec3 vDir;
          void main(){ float y = vDir.y; vec3 c = y > 0.0 ? mix(horizon, top, pow(clamp(y,0.0,1.0), 0.6)) : mix(horizon, bottom, pow(clamp(-y,0.0,1.0), 0.5));
            float sd = max(0.0, dot(normalize(vDir), sunDir));
            c += sunOn * (pow(sd, 400.0) * 1.2 + pow(sd, 12.0) * 0.18) * vec3(1.0, 0.95, 0.8) * (1.0 - uMoodAmt);
            c = mix(c, uMood * (0.6 + 0.4 * max(y, 0.0)), uMoodAmt);
            gl_FragColor = vec4(c, 1.0); }`,
        side: THREE.BackSide,
        depthWrite: false,
      }));
      const geo = this.track(new THREE.SphereGeometry(1000, 32, 16));
      this.sky = new THREE.Mesh(geo, mat);
      this.sky.frustumCulled = false;
      this.sky.renderOrder = -10;
      this.scene.add(this.sky);
      if (this.def.fog) {
        const far = Math.min(this.def.fog.far, SL.Render.farDistance());
        this.scene.fog = new THREE.Fog(this.def.fog.color, this.def.fog.near, far);
      }
    }

    _buildLights() {
      const l = this.def.light;
      this.hemi = new THREE.HemisphereLight(l.sky, l.ground, l.hemi);
      this.scene.add(this.hemi);
      this.sun = new THREE.DirectionalLight(l.sun, l.sunIntensity);
      const sd = this.def.sky.sunDir || [0.4, 0.7, 0.3];
      this.sunDir = new V3(...sd).normalize();
      this.sun.position.copy(this.sunDir).multiplyScalar(120);
      this.scene.add(this.sun);
      this.scene.add(this.sun.target);
      const size = SL.Render.shadowMapSize();
      if (size > 0) {
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.set(size, size);
        const c = this.sun.shadow.camera;
        c.left = c.bottom = -48;
        c.right = c.top = 48;
        c.near = 1;
        c.far = 320;
        this.sun.shadow.bias = -0.0008;
        this.sun.shadow.normalBias = 0.04;
      }
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.08));
      this.baseLight = { hemi: this.hemi.intensity, sun: this.sun.intensity };
      this.mood = { amt: 0, target: 0, rate: 2, color: new THREE.Color(0x101020) };
    }

    /**
     * Dramatic lighting shift (transformations, ultimates).
     * amount 0..1 darkens the world and tints the sky toward `color`.
     */
    setMood(amount, color = 0x0a0c1c, seconds = 0.6) {
      this.mood.target = U.clamp01(amount);
      this.mood.color.set(color);
      this.mood.rate = 3 / Math.max(0.05, seconds);
    }

    clearMood(seconds = 0.8) {
      this.setMood(0, this.mood.color.getHex(), seconds);
    }

    /* ---------------- wasteland ---------------- */
    _buildWasteland() {
      const def = this.def;
      const S = (this.size = def.size);
      const N = (this.seg = def.segments);
      this.step = S / N;
      const noise = U.makeNoise2D(def.seed);
      const geo = this.track(new THREE.PlaneGeometry(S, S, N, N));
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      const count = pos.count;
      this.heights = new Float32Array(count);
      const colors = new Float32Array(count * 3);
      const sand = new THREE.Color(def.terrain.sand), dirt = new THREE.Color(def.terrain.dirt), rock = new THREE.Color(def.terrain.rock);
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const d = Math.hypot(x, z);
        let h = noise.fbm(x * 0.011, z * 0.011, 4) * 10 - 4;
        h += noise.fbm(x * 0.05 + 40, z * 0.05, 2) * 1.2;
        h *= 0.3 + 0.7 * U.smooth(U.clamp01((d - 25) / 110));
        if (d > 185) h += Math.pow((d - 185) / 70, 2) * 55 * (0.55 + noise(x * 0.018, z * 0.018) * 0.9);
        this.heights[i] = h;
        pos.setY(i, h);
      }
      geo.computeVertexNormals();
      const nrm = geo.attributes.normal;
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const slope = 1 - nrm.getY(i);
        const n = noise(pos.getX(i) * 0.08, pos.getZ(i) * 0.08);
        c.copy(sand).lerp(dirt, U.clamp01(n * 0.9 + slope * 1.5));
        if (slope > 0.25 || this.heights[i] > 25) c.lerp(rock, U.clamp01((slope - 0.2) * 3 + (this.heights[i] - 25) * 0.03));
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      this.baseColors = colors.slice();
      const mat = this.track(SL.Toon.makeMat(0xffffff, { vertexColors: true }));
      this.terrain = new THREE.Mesh(geo, mat);
      this.terrain.receiveShadow = true;
      this.scene.add(this.terrain);
      this.terrainGeo = geo;

      // rock spires (destructible)
      const bands = def.rock.bands;
      const rng = this.rng;
      const placed = [];
      let tries = 0;
      while (placed.length < def.rock.count && tries++ < 500) {
        const a = rng() * Math.PI * 2;
        const dist = 30 + rng() * 140;
        const x = Math.cos(a) * dist, z = Math.sin(a) * dist;
        if (Math.abs(x) < 18 && Math.abs(z) < 40) continue;
        if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + 16)) continue;
        const r = 3 + rng() * 5;
        const h = 14 + rng() * 30;
        placed.push({ x, z, r, h });
      }
      for (const p of placed) this._addSpire(p.x, p.z, p.r, p.h, bands, rng);

      // decorative boulders
      const boulderGeo = this.track(new THREE.DodecahedronGeometry(1, 0));
      const boulders = new THREE.InstancedMesh(boulderGeo, SL.Toon.mat(def.terrain.rock), 90);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3();
      for (let i = 0; i < 90; i++) {
        const a = rng() * Math.PI * 2, d = 15 + rng() * 170;
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        const s = 0.3 + rng() * 1.6;
        q.setFromEuler(new THREE.Euler(rng() * 3, rng() * 3, rng() * 3));
        sc.set(s, s * (0.6 + rng() * 0.5), s);
        m4.compose(new V3(x, this.heightAt(x, z) + s * 0.3, z), q, sc);
        boulders.setMatrixAt(i, m4);
      }
      boulders.castShadow = true;
      boulders.receiveShadow = true;
      this.scene.add(boulders);

      // trees (grassland stages): instanced trunks + layered canopies, decorative only
      if (def.trees && def.trees.count) {
        const n = def.trees.count;
        const trunkGeo = this.track(new THREE.CylinderGeometry(0.22, 0.32, 1, 6));
        trunkGeo.translate(0, 0.5, 0);
        const leafGeo = this.track(new THREE.IcosahedronGeometry(1, 0));
        const trunks = new THREE.InstancedMesh(trunkGeo, SL.Toon.mat(def.trees.trunk), n);
        const leaves = new THREE.InstancedMesh(leafGeo, SL.Toon.mat(def.trees.leaf), n * 2);
        let li = 0;
        for (let i = 0; i < n; i++) {
          const a = rng() * Math.PI * 2, d = 45 + rng() * 150;
          const x = Math.cos(a) * d, z = Math.sin(a) * d;
          const y = this.heightAt(x, z);
          const s = 0.8 + rng() * 0.9;
          const th = 2.2 * s;
          m4.compose(new V3(x, y - 0.2, z), q.set(0, 0, 0, 1), sc.set(s, th, s));
          trunks.setMatrixAt(i, m4);
          for (let k = 0; k < 2; k++) {
            const ls = s * (k ? 1.2 : 1.7);
            q.setFromEuler(new THREE.Euler(rng(), rng() * 3, rng()));
            m4.compose(new V3(x + (rng() - 0.5) * s, y + th + ls * (k ? 1.3 : 0.6), z + (rng() - 0.5) * s), q, sc.set(ls, ls * 0.85, ls));
            leaves.setMatrixAt(li++, m4);
          }
        }
        trunks.castShadow = leaves.castShadow = true;
        this.scene.add(trunks, leaves);
      }

      // distant mesas beyond the playable area
      const mesaBands = def.mesas ? def.mesas.bands : bands;
      const mesaScale = def.mesas ? def.mesas.scale : 1;
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + rng() * 0.2;
        const d = 380 + rng() * 260;
        const r = (20 + rng() * 45) * (def.mesas ? 1.4 : 1), h = (40 + rng() * 90) * mesaScale;
        const g = this.track(new THREE.CylinderGeometry(r * (def.mesas ? 0.35 : 0.8), r, h, 7));
        const m = new THREE.Mesh(g, SL.Toon.mat(mesaBands[i % mesaBands.length]));
        m.position.set(Math.cos(a) * d, h / 2 + 20, Math.sin(a) * d);
        this.scene.add(m);
      }

      // clouds
      for (let i = 0; i < 16; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
        this.track(sp.material);
        const a = rng() * Math.PI * 2, d = 250 + rng() * 550;
        sp.position.set(Math.cos(a) * d, 150 + rng() * 120, Math.sin(a) * d);
        sp.scale.set(140 + rng() * 160, 60 + rng() * 50, 1);
        sp.userData.speed = 1.5 + rng() * 2;
        this.scene.add(sp);
        this.clouds.push(sp);
      }
    }

    _addSpire(x, z, r, h, bands, rng) {
      const group = new THREE.Group();
      const base = this.heightAt(x, z) - 2;
      const layers = 3 + Math.floor(rng() * 2);
      let y = 0;
      const segs = [];
      for (let i = 0; i < layers; i++) {
        const lh = (h + 2) / layers;
        const rb = r * (1.15 - i * 0.08), rt = r * (1.05 - i * 0.1);
        const g = this.track(new THREE.CylinderGeometry(rt, rb, lh, 9, 2));
        const pa = g.attributes.position;
        for (let k = 0; k < pa.count; k++) {
          const px = pa.getX(k), pz = pa.getZ(k);
          const j = 1 + (rng() - 0.5) * 0.22;
          pa.setX(k, px * j);
          pa.setZ(k, pz * j);
        }
        g.computeVertexNormals();
        const mesh = new THREE.Mesh(g, SL.Toon.mat(bands[(i + Math.floor(rng() * 4)) % bands.length]));
        mesh.position.y = y + lh / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        SL.Toon.addOutline(mesh, 2.2);
        group.add(mesh);
        segs.push(mesh);
        y += lh;
      }
      group.position.set(x, base, z);
      this.scene.add(group);
      this.obstacles.push({ shape: 'cyl', x, z, y: base, r, h: h + 2, top: base + h + 2, hp: 1400 * r, maxHp: 1400 * r, alive: true, group, segs, color: bands[0] });
    }

    /* ---------------- orbit ---------------- */
    _buildOrbit() {
      const def = this.def;
      const rng = this.rng;
      // stars
      const starGeo = this.track(new THREE.BufferGeometry());
      const n = 2600;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const v = new V3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize().multiplyScalar(900);
        arr[i * 3] = v.x;
        arr[i * 3 + 1] = v.y;
        arr[i * 3 + 2] = v.z;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const stars = new THREE.Points(starGeo, this.track(new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })));
      stars.renderOrder = -9;
      this.scene.add(stars);
      this.stars = stars;

      // Planet Vegeta
      const tex = SL.Toon.canvasTexture(1024, 512, (g, w, h) => {
        const nz = U.makeNoise2D(99);
        const img = g.createImageData(w, h);
        for (let yy = 0; yy < h; yy++) {
          for (let xx = 0; xx < w; xx++) {
            const v = nz.fbm(xx * 0.012, yy * 0.024, 5);
            const v2 = nz(xx * 0.06 + 10, yy * 0.12);
            const k = (yy * w + xx) * 4;
            const land = v > 0.52;
            img.data[k] = land ? 150 + v2 * 60 : 90 + v * 60;
            img.data[k + 1] = land ? 60 + v2 * 30 : 20 + v * 20;
            img.data[k + 2] = land ? 30 : 18;
            img.data[k + 3] = 255;
          }
        }
        g.putImageData(img, 0, 0);
      });
      this.track(tex);
      const planetGeo = this.track(new THREE.SphereGeometry(700, 64, 40));
      this.planet = new THREE.Mesh(planetGeo, this.track(new THREE.MeshLambertMaterial({ map: tex })));
      this.planet.position.set(0, -860, -260);
      this.scene.add(this.planet);
      const atmo = new THREE.Mesh(
        this.track(new THREE.SphereGeometry(740, 48, 32)),
        this.track(new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(0xff6a2a) } },
          vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
          fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(uColor*f, f); }`,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }))
      );
      atmo.position.copy(this.planet.position);
      this.scene.add(atmo);
      this.atmo = atmo;

      // Frieza's mothership
      this.ship = this._buildShip();
      this.ship.position.set(30, 38, -230);
      this.scene.add(this.ship);

      // asteroid debris (destructible)
      const bands = def.rock.bands;
      for (let i = 0; i < def.rock.count; i++) {
        const a = rng() * Math.PI * 2, d = 28 + rng() * 115;
        const x = Math.cos(a) * d, z = Math.sin(a) * d, y = -35 + rng() * 80;
        const r = 2 + rng() * 5;
        const g = this.track(new THREE.DodecahedronGeometry(r, 1));
        const pa = g.attributes.position;
        for (let k = 0; k < pa.count; k++) {
          const j = 1 + (rng() - 0.5) * 0.35;
          pa.setXYZ(k, pa.getX(k) * j, pa.getY(k) * j, pa.getZ(k) * j);
        }
        g.computeVertexNormals();
        const mesh = new THREE.Mesh(g, SL.Toon.mat(bands[i % bands.length]));
        SL.Toon.addOutline(mesh, 2);
        mesh.position.set(x, y, z);
        mesh.userData.spin = new V3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.4);
        this.scene.add(mesh);
        this.spinners.push(mesh);
        this.obstacles.push({ shape: 'sphere', x, y, z, r, hp: 1000 * r, maxHp: 1000 * r, alive: true, group: mesh, color: bands[0] });
      }
    }

    _buildShip() {
      const g = new THREE.Group();
      const hull = SL.Toon.mat(0xd8d2c4), dark = SL.Toon.mat(0x6c6a74), dome = SL.Toon.mat(0xa9b8d6);
      const body = new THREE.Mesh(this.track(new THREE.SphereGeometry(42, 40, 28)), hull);
      body.scale.y = 0.82;
      SL.Toon.addOutline(body, 4);
      g.add(body);
      const win = this.track(new THREE.MeshBasicMaterial({ color: 0xffe27a }));
      const band = new THREE.Mesh(this.track(new THREE.TorusGeometry(41.2, 1.6, 8, 64)), win);
      band.rotation.x = Math.PI / 2;
      band.position.y = 6;
      g.add(band);
      const band2 = new THREE.Mesh(this.track(new THREE.TorusGeometry(33, 1.1, 8, 64)), win);
      band2.rotation.x = Math.PI / 2;
      band2.position.y = 22;
      g.add(band2);
      const bottom = new THREE.Mesh(this.track(new THREE.CylinderGeometry(30, 18, 12, 32)), dark);
      bottom.position.y = -36;
      SL.Toon.addOutline(bottom, 4);
      g.add(bottom);
      const top = new THREE.Mesh(this.track(new THREE.SphereGeometry(12, 20, 14)), dome);
      top.position.y = 34;
      g.add(top);
      for (let i = 0; i < 6; i++) {
        const leg = new THREE.Mesh(this.track(new THREE.CylinderGeometry(1.5, 2.5, 30, 8)), dark);
        const a = (i / 6) * Math.PI * 2;
        leg.position.set(Math.cos(a) * 30, -40, Math.sin(a) * 30);
        leg.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
        g.add(leg);
      }
      const light = new THREE.PointLight(0xffd070, 1.2, 160, 2);
      light.position.set(0, -10, 50);
      g.add(light);
      return g;
    }

    /* ---------------- queries ---------------- */
    heightAt(x, z) {
      if (!this.hasGround) return -1e9;
      const S = this.size, N = this.seg, step = this.step;
      let gx = (x + S / 2) / step, gz = (z + S / 2) / step;
      gx = U.clamp(gx, 0, N - 0.001);
      gz = U.clamp(gz, 0, N - 0.001);
      const ix = Math.floor(gx), iz = Math.floor(gz);
      const fx = gx - ix, fz = gz - iz;
      const w = N + 1;
      const h = this.heights;
      const a = h[iz * w + ix], b = h[iz * w + ix + 1], c = h[(iz + 1) * w + ix], d = h[(iz + 1) * w + ix + 1];
      return U.lerp(U.lerp(a, b, fx), U.lerp(c, d, fx), fz);
    }

    collideSphere(p, r) {
      if (this.hasGround && p.y - r * 0.5 < this.heightAt(p.x, p.z)) return { type: 'ground' };
      for (const o of this.obstacles) {
        if (!o.alive) continue;
        if (o.shape === 'cyl') {
          if (p.y > o.top || p.y < o.y) continue;
          if (Math.hypot(p.x - o.x, p.z - o.z) < o.r + r) return { type: 'pillar', pillar: o };
        } else if (Math.hypot(p.x - o.x, p.y - o.y, p.z - o.z) < o.r + r) return { type: 'pillar', pillar: o };
      }
      for (const pr of this.props) {
        if (pr.alive && p.distanceTo(pr.pos) < pr.r + r) return { type: 'prop', prop: pr };
      }
      const hr = Math.hypot(p.x, p.z);
      if (hr > this.arenaRadius + 60 || p.y > this.ceiling + 60 || p.y < this.floor - 60) return { type: 'bounds' };
      return null;
    }

    resolveFighter(f) {
      let res = null;
      for (const o of this.obstacles) {
        if (!o.alive) continue;
        if (o.shape === 'cyl') {
          if (f.pos.y > o.top + 0.05) continue;
          const dx = f.pos.x - o.x, dz = f.pos.z - o.z;
          const d = Math.hypot(dx, dz);
          const minD = o.r + f.radius;
          if (d >= minD || d < 0.0001) continue;
          if (f.pos.y > o.top - 0.8 && f.vel.y <= 1) {
            f.pos.y = o.top + 0.03;
            if (f.vel.y < 0) f.vel.y = 0;
            continue;
          }
          const nx = dx / d, nz = dz / d;
          f.pos.x = o.x + nx * minD;
          f.pos.z = o.z + nz * minD;
          const vn = f.vel.x * nx + f.vel.z * nz;
          if (vn < 0) {
            f.vel.x -= vn * nx;
            f.vel.z -= vn * nz;
          }
          res = { pillar: o, speed: -vn, normal: new V3(nx, 0, nz) };
        } else {
          const cy = f.pos.y + f.height * 0.5;
          const dx = f.pos.x - o.x, dy = cy - o.y, dz = f.pos.z - o.z;
          const d = Math.hypot(dx, dy, dz);
          const minD = o.r + f.radius * 1.2;
          if (d >= minD || d < 0.0001) continue;
          const n = new V3(dx / d, dy / d, dz / d);
          f.pos.addScaledVector(n, minD - d);
          const vn = f.vel.dot(n);
          if (vn < 0) f.vel.addScaledVector(n, -vn);
          res = { pillar: o, speed: -vn, normal: n };
        }
      }
      for (const pr of this.props) {
        if (!pr.alive) continue;
        const c = new V3(f.pos.x, f.pos.y + f.height * 0.5, f.pos.z);
        const d = c.distanceTo(pr.pos);
        const minD = pr.r + f.radius;
        if (d < minD && d > 0.001) {
          const n = c.sub(pr.pos).divideScalar(d);
          f.pos.addScaledVector(n, minD - d);
          const vn = f.vel.dot(n);
          if (vn < 0) f.vel.addScaledVector(n, -vn);
        }
      }
      return res;
    }

    clampPosition(p, vel) {
      const hr = Math.hypot(p.x, p.z);
      if (hr > this.arenaRadius) {
        const k = this.arenaRadius / hr;
        const nx = p.x / hr, nz = p.z / hr;
        p.x *= k;
        p.z *= k;
        if (vel) {
          const vn = vel.x * nx + vel.z * nz;
          if (vn > 0) {
            vel.x -= vn * nx;
            vel.z -= vn * nz;
          }
        }
      }
      if (p.y > this.ceiling) {
        p.y = this.ceiling;
        if (vel && vel.y > 0) vel.y = 0;
      }
      if (p.y < this.floor) {
        p.y = this.floor;
        if (vel && vel.y < 0) vel.y = 0;
      }
      if (this.hasGround) {
        const gh = this.heightAt(p.x, p.z);
        if (p.y < gh) p.y = gh;
      }
      return p;
    }

    pushCameraOut(from, cam) {
      for (const o of this.obstacles) {
        if (!o.alive) continue;
        if (o.shape === 'cyl') {
          if (cam.y > o.top + 0.8) continue;
          const dx = cam.x - o.x, dz = cam.z - o.z;
          const d = Math.hypot(dx, dz);
          const minD = o.r + 0.9;
          if (d < minD && d > 0.001) {
            cam.x = o.x + (dx / d) * minD;
            cam.z = o.z + (dz / d) * minD;
          }
        } else {
          const d = Math.hypot(cam.x - o.x, cam.y - o.y, cam.z - o.z);
          const minD = o.r + 1;
          if (d < minD && d > 0.001) {
            const k = minD / d;
            cam.x = o.x + (cam.x - o.x) * k;
            cam.y = o.y + (cam.y - o.y) * k;
            cam.z = o.z + (cam.z - o.z) * k;
          }
        }
      }
    }

    /* ---------------- destruction ---------------- */
    crater(pos, radius, depth, fighter) {
      if (!this.hasGround) return;
      const S = this.size, N = this.seg, step = this.step, w = N + 1;
      const cx = (pos.x + S / 2) / step, cz = (pos.z + S / 2) / step;
      const rr = (radius * 1.4) / step;
      const posAttr = this.terrainGeo.attributes.position;
      const col = this.terrainGeo.attributes.color;
      const scorch = new THREE.Color(this.def.terrain.scorch);
      for (let iz = Math.max(0, Math.floor(cz - rr)); iz <= Math.min(N, Math.ceil(cz + rr)); iz++) {
        for (let ix = Math.max(0, Math.floor(cx - rr)); ix <= Math.min(N, Math.ceil(cx + rr)); ix++) {
          const wx = -S / 2 + ix * step, wz = -S / 2 + iz * step;
          const d = Math.hypot(wx - pos.x, wz - pos.z) / radius;
          if (d > 1.4) continue;
          const i = iz * w + ix;
          let dh = 0;
          if (d < 1) dh = -depth * Math.pow(1 - d * d, 1.5);
          else dh = depth * 0.3 * Math.sin(((d - 1) / 0.4) * Math.PI);
          this.heights[i] = Math.max(-30, this.heights[i] + dh);
          posAttr.setY(i, this.heights[i]);
          if (d < 1.15) {
            const k = U.clamp01((1.15 - d) * 0.8);
            col.setXYZ(i, U.lerp(col.getX(i), scorch.r, k), U.lerp(col.getY(i), scorch.g, k), U.lerp(col.getZ(i), scorch.b, k));
          }
        }
      }
      posAttr.needsUpdate = true;
      col.needsUpdate = true;
      this._normalsDirty = true;
      this.battle.emit('crater', { pos: pos.clone(), radius });
    }

    explode(pos, radius, damage, stageHit, owner) {
      if (this.hasGround) {
        const gh = this.heightAt(pos.x, pos.z);
        if (pos.y - gh < radius * 0.7) {
          const ground = new V3(pos.x, gh, pos.z);
          this.crater(ground, Math.min(14, radius * 0.55), Math.min(3, 0.15 + radius * 0.1), null);
          this.battle.vfx.dust(ground, Math.min(6, radius * 0.4), 10 + radius * 2, this.def.terrain.sand);
          if (radius > 3) this.battle.vfx.debrisBurst(ground, Math.min(20, radius * 2), this.def.terrain.dirt, 8 + radius, 0.2 + radius * 0.02);
        }
      }
      for (const o of this.obstacles) {
        if (!o.alive) continue;
        let d;
        if (o.shape === 'cyl') d = pos.y > o.top + radius ? 1e9 : Math.max(0, Math.hypot(pos.x - o.x, pos.z - o.z) - o.r);
        else d = Math.max(0, Math.hypot(pos.x - o.x, pos.y - o.y, pos.z - o.z) - o.r);
        if (d < radius) this.damagePillar(o, damage * (1 - (d / radius) * 0.7), pos);
      }
      for (const pr of this.props) {
        if (!pr.alive) continue;
        const d = Math.max(0, pos.distanceTo(pr.pos) - pr.r);
        if (d < radius) this.damageProp(pr, damage * (1 - (d / radius) * 0.6), owner);
      }
    }

    meleeProps(f, center, r, damage, impact) {
      for (const pr of this.props) {
        if (!pr.alive || pr.hitBy === f.sd) continue;
        if (center.distanceTo(pr.pos) < pr.r + r) {
          pr.hitBy = f.sd;
          this.damageProp(pr, damage, f);
          this.battle.vfx.impact(center, Math.max(1, impact), 0xffffff);
          this.battle.sfx(impact > 1 ? 'punchHeavy' : 'punchLight', f);
        }
      }
    }

    damagePillar(o, amount, point) {
      if (!o.alive) return;
      o.hp -= amount;
      if (point && amount > 200) this.battle.vfx.debrisBurst(point, 3, o.color, 6, 0.25);
      if (o.hp <= 0) this.destroyPillar(o);
    }

    destroyPillar(o) {
      o.alive = false;
      const vfx = this.battle.vfx;
      if (o.shape === 'cyl') {
        const c = new V3(o.x, o.y + o.h * 0.5, o.z);
        for (let i = 1; i < o.segs.length; i++) o.segs[i].visible = false;
        o.segs[0].scale.y = 0.45;
        o.segs[0].position.y *= 0.45;
        for (let k = 0; k < 4; k++) {
          const p = new V3(o.x + U.rand(-o.r, o.r), o.y + U.rand(0.3, 1) * o.h, o.z + U.rand(-o.r, o.r));
          vfx.debrisBurst(p, 6, o.color, 10, 0.5 + o.r * 0.12);
          vfx.dust(new V3(o.x, o.y + 2, o.z), o.r * 0.9, 10, this.def.terrain.sand);
        }
        vfx.explosion(c, o.r * 0.8, 0xd8a370, { life: 0.4 });
        this.battle.sfx('rockBreak', null, { at: c, vol: 1.2 });
        this.battle.cameraTraumaAt(c, 0.4);
      } else {
        const c = new V3(o.x, o.y, o.z);
        o.group.visible = false;
        for (let k = 0; k < 16; k++) {
          const v = new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(5, 16));
          vfx.rock(c, v, U.rand(0.3, 0.9) * o.r * 0.25, o.color);
        }
        vfx.explosion(c, o.r * 0.7, 0xffa060, { life: 0.4 });
        this.battle.sfx('rockBreak', null, { at: c, vol: 1.2 });
        this.battle.cameraTraumaAt(c, 0.35);
      }
      this.battle.emit('obstacleDestroyed', { obstacle: o });
    }

    /* ---------------- mission props ---------------- */
    addProp(opts) {
      const pr = { kind: opts.kind || 'pod', pos: opts.pos.clone(), r: opts.r || 1.6, hp: opts.hp || 1500, maxHp: opts.hp || 1500, alive: true, id: opts.id, data: opts.data || {} };
      const g = new THREE.Group();
      if (pr.kind === 'pod') {
        const shell = new THREE.Mesh(this.track(new THREE.SphereGeometry(pr.r, 24, 16)), SL.Toon.mat(0xe9e6de));
        SL.Toon.addOutline(shell, 2);
        g.add(shell);
        const window = new THREE.Mesh(this.track(new THREE.SphereGeometry(pr.r * 0.62, 16, 12)), this.track(new THREE.MeshBasicMaterial({ color: 0xff3048 })));
        window.position.set(0, pr.r * 0.25, pr.r * 0.5);
        window.scale.z = 0.5;
        g.add(window);
        const ring = new THREE.Mesh(this.track(new THREE.TorusGeometry(pr.r * 1.02, 0.12, 6, 24)), SL.Toon.mat(0x4a4a58));
        ring.rotation.x = Math.PI / 2;
        g.add(ring);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xff3048, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        this.track(glow.material);
        glow.scale.setScalar(pr.r * 3);
        g.add(glow);
        pr.glow = glow;
      }
      g.position.copy(pr.pos);
      this.scene.add(g);
      pr.group = g;
      this.props.push(pr);
      return pr;
    }

    damageProp(pr, amount, owner) {
      if (!pr.alive || pr.invulnerable) return;
      pr.hp -= amount;
      pr.flash = 1;
      this.battle.emit('propDamaged', { prop: pr, amount, owner });
      if (pr.hp <= 0) {
        pr.alive = false;
        pr.group.visible = false;
        this.battle.vfx.explosion(pr.pos, pr.r * 2.2, 0xff8040);
        this.battle.vfx.debrisBurst(pr.pos, 12, 0xe9e6de, 12, 0.3);
        this.battle.sfx('explosionBig', null, { at: pr.pos });
        this.battle.cameraTraumaAt(pr.pos, 0.45);
        this.battle.emit('propDestroyed', { prop: pr, owner });
      }
    }

    update(dt, focus) {
      const md = this.mood;
      if (Math.abs(md.amt - md.target) > 0.001) {
        md.amt = U.damp(md.amt, md.target, md.rate, dt);
        const k = 1 - md.amt * 0.65;
        this.hemi.intensity = this.baseLight.hemi * k;
        this.sun.intensity = this.baseLight.sun * (1 - md.amt * 0.8);
        this.sky.material.uniforms.uMood.value.copy(md.color);
        this.sky.material.uniforms.uMoodAmt.value = md.amt * 0.85;
      }
      if (this._normalsDirty) {
        this.terrainGeo.computeVertexNormals();
        this._normalsDirty = false;
      }
      for (const c of this.clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 800) c.position.x = -800;
      }
      for (const s of this.spinners) {
        if (!s.visible) continue;
        s.rotation.x += s.userData.spin.x * dt;
        s.rotation.y += s.userData.spin.y * dt;
      }
      for (const pr of this.props) {
        if (!pr.alive) continue;
        pr.group.rotation.y += dt * 0.4;
        if (pr.glow) pr.glow.material.opacity = 0.6 + Math.sin(performance.now() * 0.006) * 0.3;
        if (pr.flash > 0) {
          pr.flash -= dt * 5;
          pr.group.scale.setScalar(1 + Math.max(0, pr.flash) * 0.08);
        }
      }
      if (this.ship) this.ship.rotation.y += dt * 0.02;
      if (focus && this.sun) {
        this.sun.target.position.copy(focus);
        this.sun.position.copy(focus).addScaledVector(this.sunDir, 140);
      }
      if (this.stars && focus) this.stars.position.copy(focus);
      this.sky.position.copy(focus || new V3());
    }

    dispose() {
      this.scene.fog = null;
      for (const d of this.disposables) if (d && d.dispose) d.dispose();
      this.disposables = [];
    }
  }

  SL.Stage = Stage;
})();
