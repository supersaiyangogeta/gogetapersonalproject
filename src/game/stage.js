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
      // everything the stage builds hangs under one root, so a mission can swap the whole world
      // for another in the middle of a battle (Babidi's teleports: Battle.changeStage)
      const real = battle.scene;
      this.root = new THREE.Group();
      this.root.name = 'stage:' + def.id;
      real.add(this.root);
      const root = this.root;
      this.scene = {
        add: (...o) => root.add(...o),
        remove: (...o) => root.remove(...o),
        get fog() {
          return real.fog;
        },
        set fog(v) {
          real.fog = v;
        },
      };
      this.hasGround = def.type === 'ground';
      this.arenaRadius = def.arenaRadius;
      this.ceiling = def.ceiling;
      this.floor = def.floor !== undefined ? def.floor : -1e9;
      this.obstacles = [];
      this.props = [];
      this.clouds = [];
      this.spinners = [];
      // ambience a mission can hang on the stage (a dying planet venting smoke, ash falling):
      // each entry is called (dt, stage) every frame and goes with the stage when it is disposed
      this.ambient = [];
      this.rockColor = def.rock ? def.rock.bands[0] : 0x8a6a4a;
      this.disposables = [];
      this._normalsDirty = false;
      this.rng = U.mulberry32(def.seed || 1);
      this._buildSky();
      this._buildLights();
      if (def.builder === 'wasteland') this._buildWasteland();
      else if (def.builder === 'orbit') this._buildOrbit();
      else if (def.builder === 'snakeway') this._buildSnakeWay();
      else if (def.builder === 'arena') this._buildArena();
      else if (def.builder === 'room') this._buildRoom();
      else if (def.builder === 'city') this._buildCity();
      else if (def.builder === 'heights') this._buildHeights();
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
        let h;
        if (def.chamber) {
          // the Room of Spirit and Time: a floor with no end and no slope
          h = 0;
        } else if (def.islet || def.liner || def.cavern) {
          // the Battle of Gods places (stage_gods.js): Beerus' floating world, the cruise liner on the
          // ocean, the crystal cavern under the sea floor
          h = this._godsHeight(def, x, z, d, noise);
        } else if (def.lookout) {
          // Kami's Lookout: flat out to the rim, then nothing but a long drop into the clouds
          const R = def.lookout.radius;
          h = d <= R ? 0 : d <= R + 1.2 ? -2.5 * (d - R) : -def.lookout.drop;
        } else if (def.planet) {
          // a tiny world: gentle grass bumps on a sphere that falls away past the horizon
          const R = def.planet.radius;
          h = noise.fbm(x * 0.04, z * 0.04, 2) * 0.8 - (d * d) / (2 * R);
          if (d > R * 0.9) h -= Math.pow((d - R * 0.9) / 10, 2) * 8;
        } else {
          h = noise.fbm(x * 0.011, z * 0.011, 4) * 10 - 4;
          h += noise.fbm(x * 0.05 + 40, z * 0.05, 2) * 1.2;
          h *= 0.3 + 0.7 * U.smooth(U.clamp01((d - 25) / 110));
          if (d > 185) h += Math.pow((d - 185) / 70, 2) * 55 * (0.55 + noise(x * 0.018, z * 0.018) * 0.9);
        }
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
        if (def.chamber) {
          // white, with the faintest large-scale shading so the eye has something to hold on to
          const px = pos.getX(i), pz = pos.getZ(i);
          c.set(def.chamber.floor).lerp(new THREE.Color(def.chamber.shade), U.clamp01(noise(px * 0.01, pz * 0.01) * 0.5 + 0.25));
        }
        if (def.islet || def.liner || def.cavern) this._godsColor(def, pos.getX(i), pos.getZ(i), this.heights[i], c, noise);
        if (def.lookout) {
          // flagstones in rings round the middle, a darker band inside the rim
          const L = def.lookout, px = pos.getX(i), pz = pos.getZ(i), dd = Math.hypot(px, pz);
          const ring = Math.floor(dd / 3), sector = Math.floor(((Math.atan2(pz, px) + Math.PI) / (Math.PI * 2)) * (8 + ring * 4));
          c.set(dd > L.radius + 0.5 ? L.cloud : dd > L.radius - 1.4 ? L.rim : (ring + sector) % 2 ? L.tileA : L.tileB);
        }
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
        const near = def.rock.near === undefined ? 30 : def.rock.near, far = def.rock.far === undefined ? 170 : def.rock.far;
        const dist = near + rng() * (far - near);
        const x = Math.cos(a) * dist, z = Math.sin(a) * dist;
        if (Math.abs(x) < (def.rock.clearX === undefined ? 18 : def.rock.clearX) && Math.abs(z) < (def.rock.clearZ === undefined ? 40 : def.rock.clearZ)) continue;
        if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + 16)) continue;
        const r = 3 + rng() * 5;
        const h = 14 + rng() * 30;
        placed.push({ x, z, r, h });
      }
      for (const p of placed) this._addSpire(p.x, p.z, p.r, p.h, bands, rng);

      if (def.lookout) {
        this._buildLookout(def.lookout);
        return;
      }
      if (def.chamber) {
        this._buildChamber(def.chamber);
        return;
      }
      if (def.islet) return this._buildIslet(def.islet);
      if (def.liner) return this._buildLiner(def.liner);
      if (def.cavern) return this._buildCavern(def.cavern);

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
      this.boulders = boulders;

      if (def.babidiShip) this._buildBabidiShip(def.babidiShip);

      // water (rivers and lakes fill the low ground; visual only)
      if (def.water) {
        const wg = this.track(new THREE.PlaneGeometry(S, S, 1, 1));
        wg.rotateX(-Math.PI / 2);
        const wm = this.track(new THREE.MeshBasicMaterial({ color: def.water.color, transparent: true, opacity: def.water.opacity || 0.78, depthWrite: false }));
        const water = new THREE.Mesh(wg, wm);
        water.position.y = def.water.level;
        water.renderOrder = 1;
        this.scene.add(water);
        this.water = water;
      }

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

      if (def.village) this._buildVillage(def.village);

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

    /**
     * UUB'S VILLAGE (the End of Z): round mud huts with thatched cones in a ring round a beaten-earth
     * square, a stone well in the middle, a few rows of a dry field, fences, drying racks, palms. The
     * huts are solid (obstacles: nobody walks through a wall, and the story cameras see them as rock).
     * Deterministic — it draws no random numbers, so the rest of the stage is the same with or without it.
     * Landmarks: square, well, road (the way out, +z), field, training (the open ground east).
     */
    _buildVillage(V) {
      const T = SL.Toon;
      const mud = T.mat(V.mud || 0xb08458), mudDark = T.mat(V.mudDark || 0x8a6440), straw = T.mat(V.straw || 0xc8a050), strawDark = T.mat(V.strawDark || 0xa07a3a);
      const wood = T.mat(V.wood || 0x6a4a2a), stone = T.mat(V.stone || 0x9a9284), door = T.mat(0x2a1c14), leaf = T.mat(V.palm || 0x4f8a34), crop = T.mat(V.crop || 0x8aa040);
      const huts = V.huts || [];
      const at = (x, z) => new V3(x, this.heightAt(x, z), z);
      const g = new THREE.Group();
      const add = (geo, mat, x, y, z, o = {}) => {
        const m = new THREE.Mesh(this.track(geo), mat);
        m.position.set(x, y, z);
        if (o.rx) m.rotation.x = o.rx;
        if (o.ry) m.rotation.y = o.ry;
        if (o.rz) m.rotation.z = o.rz;
        if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]);
        m.castShadow = o.shadow !== false;
        m.receiveShadow = true;
        if (o.outline !== 0) T.addOutline(m, o.outline || 1.4);
        g.add(m);
        return m;
      };
      for (const [x, z, r] of huts) {
        const p = at(x, z);
        const wallH = 2.1 + r * 0.12;
        const hut = new THREE.Group();
        const parts = [];
        const wall = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r, r * 1.04, wallH, 14)), mud);
        wall.position.y = wallH / 2;
        const band = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r * 1.045, r * 1.06, 0.35, 14)), mudDark);
        band.position.y = 0.18;
        // the thatch: a wide cone over a darker eave, a little knot of straw at the top
        const roof = new THREE.Mesh(this.track(new THREE.ConeGeometry(r * 1.32, r * 1.05 + 1.2, 14)), straw);
        roof.position.y = wallH + (r * 1.05 + 1.2) / 2 - 0.15;
        const eave = new THREE.Mesh(this.track(new THREE.ConeGeometry(r * 1.4, 0.6, 14, 1, true)), strawDark);
        eave.position.y = wallH + 0.1;
        const knot = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.12, 0.22, 0.5, 6)), strawDark);
        knot.position.y = wallH + r * 1.05 + 1.2 - 0.1;
        // the doorway faces the square
        const yaw = Math.atan2(-x, -z);
        const doorway = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.9, 1.5, 0.2)), door);
        doorway.position.set(Math.sin(yaw) * (r - 0.02), 0.75, Math.cos(yaw) * (r - 0.02));
        doorway.rotation.y = yaw;
        for (const m of [wall, band, roof, eave, knot, doorway]) {
          m.castShadow = true;
          m.receiveShadow = true;
          hut.add(m);
          parts.push(m);
        }
        T.addOutline(wall, 1.6);
        T.addOutline(roof, 1.6);
        hut.position.copy(p);
        this.scene.add(hut);
        const top = p.y + wallH + r * 1.05 + 1.2;
        this.obstacles.push({ shape: 'cyl', x, z, y: p.y, r: r * 1.05, h: top - p.y, top, hp: 2600 * r, maxHp: 2600 * r, alive: true, group: hut, segs: parts, color: V.mud || 0xb08458 });
      }
      // the well in the middle of the square: a stone ring, two posts and a beam, a bucket
      const W = V.well || [3, -2];
      const wp = at(W[0], W[1]);
      add(new THREE.CylinderGeometry(0.85, 0.95, 0.9, 14), stone, wp.x, wp.y + 0.45, wp.z, { outline: 1.4 });
      add(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 12), door, wp.x, wp.y + 0.88, wp.z, { outline: 0 });
      for (const s of [1, -1]) add(new THREE.BoxGeometry(0.14, 1.7, 0.14), wood, wp.x + s * 0.8, wp.y + 1.3, wp.z, { outline: 1 });
      add(new THREE.BoxGeometry(1.8, 0.14, 0.14), wood, wp.x, wp.y + 2.1, wp.z, { outline: 1 });
      add(new THREE.CylinderGeometry(0.18, 0.14, 0.26, 8), wood, wp.x + 0.2, wp.y + 1.5, wp.z, { outline: 0.8 });
      this.obstacles.push({ shape: 'cyl', x: wp.x, z: wp.z, y: wp.y, r: 0.95, h: 2.2, top: wp.y + 2.2, hp: 1e9, maxHp: 1e9, alive: true, group: g, segs: [], color: 0x9a9284, fixture: true });
      // the field: rows of something green that is not growing well
      const F = V.field || [-34, 4, 14, 18];
      for (let i = 0; i < F[3] / 1.6; i++) {
        const z = F[1] - F[3] / 2 + i * 1.6;
        const x = F[0];
        const rp = at(x, z);
        add(new THREE.BoxGeometry(F[2], 0.35, 0.5), mudDark, x, rp.y + 0.1, z, { outline: 0, shadow: false });
        for (let k = 0; k < F[2] / 1.2; k++) {
          const cx = x - F[2] / 2 + 0.6 + k * 1.2;
          const cp = at(cx, z);
          add(new THREE.ConeGeometry(0.22, 0.5, 5), crop, cx, cp.y + 0.45, z, { outline: 0, shadow: false });
        }
      }
      // fences of sticks along the field and between some huts
      for (const [x0, z0, x1, z1] of V.fences || []) {
        const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.4));
        for (let k = 0; k <= n; k++) {
          const x = x0 + ((x1 - x0) * k) / n, z = z0 + ((z1 - z0) * k) / n;
          add(new THREE.CylinderGeometry(0.06, 0.07, 1.1, 5), wood, x, this.heightAt(x, z) + 0.55, z, { outline: 0.8 });
        }
        const len = Math.hypot(x1 - x0, z1 - z0);
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        const yaw = Math.atan2(x1 - x0, z1 - z0);
        for (const hh of [0.45, 0.85]) add(new THREE.BoxGeometry(0.05, 0.06, len), wood, mx, this.heightAt(mx, mz) + hh, mz, { ry: yaw, outline: 0.6 });
      }
      // drying racks hung with cloth
      for (const [x, z, yaw] of V.racks || []) {
        const rp = at(x, z);
        for (const s of [1, -1]) add(new THREE.BoxGeometry(0.1, 1.8, 0.1), wood, x + Math.cos(yaw) * s * 1.2, rp.y + 0.9, z - Math.sin(yaw) * s * 1.2, { outline: 0.8 });
        add(new THREE.BoxGeometry(2.6, 0.08, 0.08), wood, x, rp.y + 1.75, z, { ry: yaw, outline: 0.6 });
        const cloth = add(new THREE.BoxGeometry(1.6, 1, 0.03), T.mat(0xd86a3a), x, rp.y + 1.25, z, { ry: yaw, outline: 0.5 });
        cloth.castShadow = false;
      }
      // palms over the huts: a leaning trunk and a crown of fronds
      for (const [x, z, h, lean] of V.palms || []) {
        const rp = at(x, z);
        const palm = new THREE.Group();
        const trunk = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.16, 0.26, h, 7)), wood);
        trunk.position.y = h / 2;
        palm.add(trunk);
        T.addOutline(trunk, 1);
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          const fr = new THREE.Mesh(this.track(new THREE.ConeGeometry(0.45, 3.2, 4)), leaf);
          fr.position.set(Math.sin(a) * 1.3, h - 0.2, Math.cos(a) * 1.3);
          fr.rotation.set(Math.cos(a) * 1.9, 0, -Math.sin(a) * 1.9);
          fr.scale.set(1, 1, 0.25);
          palm.add(fr);
        }
        palm.rotation.z = lean || 0;
        palm.position.copy(rp);
        palm.traverse((o) => {
          if (o.isMesh) o.castShadow = true;
        });
        this.scene.add(palm);
      }
      this.scene.add(g);
      this.village = g;
      this.landmarks = this.landmarks || {};
      this.landmarks.square = at(0, 0);
      this.landmarks.well = wp.clone();
      this.landmarks.road = at(0, V.road || 40);
      this.landmarks.field = at(F[0], F[1]);
      this.landmarks.training = at(V.training ? V.training[0] : 36, V.training ? V.training[1] : -6);
    }

    /**
     * Kami's Lookout: the rim, the great bowl underneath, the palace at the back of the platform (a
     * domed hall and four little domed towers — solid obstacles), palms round it, and a sea of cloud
     * below the edge. Landmarks: palace, center, edge.
     */
    _buildLookout(L) {
      const T = SL.Toon, R = L.radius, rng = this.rng;
      const rim = new THREE.Mesh(this.track(new THREE.TorusGeometry(R, 0.32, 8, 96)), T.mat(L.rim));
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.06;
      T.addOutline(rim, 1.2);
      this.scene.add(rim);
      const bowl = new THREE.Mesh(this.track(new THREE.SphereGeometry(R + 0.4, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), T.mat(L.under));
      bowl.scale.y = 0.42;
      bowl.position.y = -0.05;
      T.addOutline(bowl, 2);
      this.scene.add(bowl);
      // the palace
      const P = new THREE.Group();
      const add = (geo, color, x, y, z, outline = 1.4) => {
        const m = new THREE.Mesh(this.track(geo), T.mat(color));
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        if (outline) T.addOutline(m, outline);
        P.add(m);
        return m;
      };
      add(new THREE.CylinderGeometry(7, 7.4, 6, 28), L.palace, 0, 3, 0);
      add(new THREE.TorusGeometry(7.05, 0.28, 6, 40), L.trim, 0, 6, 0, 0).rotation.x = Math.PI / 2;
      add(new THREE.SphereGeometry(7.1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), L.roof, 0, 6, 0);
      add(new THREE.SphereGeometry(0.9, 12, 8), L.trim, 0, 13.3, 0, 0.8);
      const towers = [];
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const x = Math.cos(a) * 9.4, z = Math.sin(a) * 9.4;
        towers.push([x, z]);
        add(new THREE.CylinderGeometry(1.5, 1.6, 7.5, 14), L.palace, x, 3.75, z);
        add(new THREE.SphereGeometry(1.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), L.roof, x, 7.5, z);
        add(new THREE.SphereGeometry(0.34, 8, 6), L.trim, x, 9.2, z, 0.6);
      }
      // the doorway, facing the middle of the platform
      add(new THREE.BoxGeometry(2.6, 3.6, 0.5), 0x3a3028, 0, 1.8, 7.1, 1);
      const pz = -(R - 12);
      P.position.set(0, 0, pz);
      this.scene.add(P);
      this.obstacles.push({ shape: 'cyl', x: 0, z: pz, y: 0, r: 7.6, h: 13, top: 13, hp: 1e9, maxHp: 1e9, alive: true, group: P, color: L.palace });
      for (const [x, z] of towers) this.obstacles.push({ shape: 'cyl', x, z: pz + z, y: 0, r: 1.7, h: 8, top: 8, hp: 1e9, maxHp: 1e9, alive: true, group: P, color: L.palace });
      // palms along the back of the platform, either side of the palace
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.36 + (rng() - 0.5) * 0.1, d = R - 4.5 - rng() * 3;
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        if (Math.hypot(x, z - pz) < 12.5) continue;
        const palm = new THREE.Group();
        const trunk = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.22, 0.34, 6.5, 7)), T.mat(0x9a7a4a));
        trunk.position.y = 3.2;
        trunk.rotation.z = 0.12;
        T.addOutline(trunk, 1);
        palm.add(trunk);
        for (let k = 0; k < 6; k++) {
          const leaf = new THREE.Mesh(this.track(new THREE.ConeGeometry(0.5, 3.4, 4)), T.mat(0x4a9a3a));
          const la = (k / 6) * Math.PI * 2;
          leaf.position.set(Math.cos(la) * 1.3, 6.4, Math.sin(la) * 1.3);
          leaf.rotation.set(0, -la, -Math.PI / 2 - 0.45);
          palm.add(leaf);
        }
        palm.position.set(x, 0, z);
        this.scene.add(palm);
      }
      // the sea of cloud under the edge
      const sea = new THREE.Mesh(this.track(new THREE.PlaneGeometry(2400, 2400)), this.track(new THREE.MeshBasicMaterial({ color: L.cloud })));
      sea.rotation.x = -Math.PI / 2;
      sea.position.y = -L.drop + 3;
      this.scene.add(sea);
      for (let i = 0; i < 70; i++) {
        const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.smoke, color: i % 3 ? L.cloud : 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })));
        const a = rng() * Math.PI * 2, d = R + 8 + rng() * 260;
        sp.position.set(Math.cos(a) * d, -L.drop + 4 + rng() * 5, Math.sin(a) * d);
        sp.scale.set(30 + rng() * 50, 9 + rng() * 7, 1);
        sp.userData.speed = 0.4 + rng() * 0.8;
        this.scene.add(sp);
        this.clouds.push(sp);
      }
      for (let i = 0; i < 12; i++) {
        const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, fog: false })));
        const a = rng() * Math.PI * 2, d = 260 + rng() * 480;
        sp.position.set(Math.cos(a) * d, 60 + rng() * 80, Math.sin(a) * d);
        sp.scale.set(140 + rng() * 160, 50 + rng() * 40, 1);
        sp.userData.speed = 1 + rng() * 2;
        this.scene.add(sp);
        this.clouds.push(sp);
      }
      this.landmarks = this.landmarks || {};
      this.landmarks.palace = new V3(0, 0, pz);
      this.landmarks.center = new V3(0, 0, 0);
      this.landmarks.edge = new V3(0, 0, R);
    }

    /**
     * THE ROOM OF SPIRIT AND TIME (def.chamber): a floor of white that does not end, a white sky,
     * a haze that hides any horizon, and one building — the entrance, on a raised white platform,
     * with the great hourglass beside it and the only door out. Far away, a pale wall of light the
     * eye can only just find: the edge of the dimension. `destroyChamberDoor()` leaves rubble where
     * the way out was.
     */
    _buildChamber(C) {
      const T = SL.Toon;
      const G = new THREE.Group();
      const add = (geo, color, x, y, z, outline = 1.4, parent = G) => {
        const m = new THREE.Mesh(this.track(geo), T.mat(color));
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        if (outline) T.addOutline(m, outline);
        parent.add(m);
        return m;
      };
      // the platform: three white steps up to a round terrace
      for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(11.1 - i * 1.1, 11.5 - i * 1.1, 0.5, 48), i % 2 ? C.stepB : C.stepA, 0, 0.25 + i * 0.5, 0, 1);
      // the building: a long white hall with a gold band, two round towers at the front
      add(new THREE.BoxGeometry(13, 7, 8), C.building, 0, 1.5 + 3.5, -2.5);
      add(new THREE.BoxGeometry(13.4, 0.5, 8.4), C.trim, 0, 1.5 + 7, -2.5, 0.8);
      add(new THREE.BoxGeometry(12.4, 1.4, 7.4), C.roof, 0, 1.5 + 7.95, -2.5, 1);
      for (const sx of [1, -1]) {
        add(new THREE.CylinderGeometry(1.7, 1.8, 9.4, 18), C.building, sx * 7.2, 1.5 + 4.7, 1.2);
        add(new THREE.SphereGeometry(1.75, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), C.roof, sx * 7.2, 1.5 + 9.4, 1.2);
        add(new THREE.TorusGeometry(1.78, 0.14, 6, 24), C.trim, sx * 7.2, 1.5 + 8.2, 1.2, 0).rotation.x = Math.PI / 2;
      }
      // the doorway: an arch in the front wall, the door in it (the only way out)
      const door = new THREE.Group();
      add(new THREE.BoxGeometry(3.2, 4, 0.4), C.dark, 0, 2, 0, 1, door);
      add(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 20, 1, false, 0, Math.PI), C.dark, 0, 4, 0, 1, door).rotation.set(Math.PI / 2, 0, Math.PI / 2);
      add(new THREE.BoxGeometry(3.8, 0.4, 0.5), C.trim, 0, 0.2, 0.05, 0.6, door);
      door.position.set(0, 1.5, 1.55);
      G.add(door);
      // the great hourglass on the terrace
      const glass = new THREE.Group();
      add(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 20), C.trim, 0, 0.15, 0, 0.8, glass);
      add(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 20), C.trim, 0, 5.55, 0, 0.8, glass);
      const bulbMat = this.track(new THREE.MeshBasicMaterial({ color: C.glass, transparent: true, opacity: 0.45, depthWrite: false }));
      for (const [y, flip] of [[1.6, 0], [4.1, 1]]) {
        const bulb = new THREE.Mesh(this.track(new THREE.ConeGeometry(1.25, 2.6, 18, 1, true)), bulbMat);
        bulb.position.y = y;
        if (flip) bulb.rotation.x = Math.PI;
        glass.add(bulb);
      }
      add(new THREE.ConeGeometry(0.9, 1, 16), C.sand, 0, 0.8, 0, 0.5, glass);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        add(new THREE.CylinderGeometry(0.12, 0.12, 5.4, 6), C.trim, Math.cos(a) * 1.55, 2.85, Math.sin(a) * 1.55, 0.5, glass);
      }
      glass.position.set(-4.6, 1.5, 6);
      G.add(glass);
      // what is left of the door when it is destroyed
      const rubble = new THREE.Group();
      for (let i = 0; i < 9; i++) add(new THREE.DodecahedronGeometry(0.5 + (i % 3) * 0.25, 0), i % 2 ? C.building : C.stepB, (i - 4) * 0.45, 0.4 + (i % 3) * 0.35, 1.9 + (i % 2) * 0.4, 0.8, rubble).rotation.set(i, i * 2, i * 3);
      rubble.position.set(0, 1.5, 0);
      rubble.visible = false;
      G.add(rubble);
      const at = C.at || [0, 0, -26];
      G.position.set(at[0], 0, at[2]);
      this.scene.add(G);
      this.chamber = { group: G, door, rubble, glass };
      // the whole terrace is solid (the steps are not ground the fighters stand on)
      this.obstacles.push({ shape: 'cyl', x: at[0], z: at[2], y: 0, r: 11.2, h: 10, top: 10, hp: 1e9, maxHp: 1e9, alive: true, group: null, segs: [], color: C.building });
      // the edge of the dimension: a pale wall of light, very far away, that the haze nearly hides
      const edgeMat = this.track(new THREE.MeshBasicMaterial({ color: C.edge, transparent: true, opacity: 0.35, side: THREE.BackSide, depthWrite: false, fog: false }));
      const edge = new THREE.Mesh(this.track(new THREE.CylinderGeometry(560, 560, 260, 64, 1, true)), edgeMat);
      edge.position.y = 60;
      this.scene.add(edge);
      // motes drifting in the still air
      for (let i = 0; i < 40; i++) {
        const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })));
        const a = this.rng() * Math.PI * 2, d = 10 + this.rng() * 120;
        sp.position.set(Math.cos(a) * d, 1 + this.rng() * 18, Math.sin(a) * d);
        sp.scale.setScalar(0.3 + this.rng() * 0.6);
        sp.userData.speed = 0.1 + this.rng() * 0.3;
        this.scene.add(sp);
        this.clouds.push(sp);
      }
      this.landmarks = this.landmarks || {};
      this.landmarks.door = new V3(at[0], 0, at[2] + 1.55);
      this.landmarks.center = new V3(0, 0, 0);
    }

    /** The only way out of the Room of Spirit and Time, blown to pieces (Piccolo's decision). */
    destroyChamberDoor() {
      const C = this.chamber;
      if (!C || !C.door.visible) return;
      C.door.visible = false;
      C.rubble.visible = true;
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

    /* ---------------- interior ---------------- */
    /**
     * A small room for a quiet scene (the Son house bedroom). Flat floor, four
     * walls, a ceiling, a window throwing afternoon light, a bed and a stool.
     * Nothing here is destructible and there is no terrain to dent: `crater`
     * does nothing because there is no terrain mesh.
     */
    _buildRoom() {
      const def = this.def, A = def.room, T = SL.Toon;
      // the ground query needs a height grid: one flat cell is enough
      this.size = Math.max(A.w, A.d) * 2;
      this.seg = 2;
      this.step = this.size / this.seg;
      this.heights = new Float32Array((this.seg + 1) * (this.seg + 1));
      this.terrainGeo = null;
      const g = new THREE.Group();
      const hw = A.w / 2, hd = A.d / 2;
      // floor boards
      const boards = T.canvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#8a6446';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#6a4a32';
        ctx.lineWidth = 3;
        for (let i = 1; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(0, (i * h) / 8);
          ctx.lineTo(w, (i * h) / 8);
          ctx.stroke();
        }
      });
      const floor = new THREE.Mesh(this.track(new THREE.PlaneGeometry(A.w, A.d)), this.track(T.makeMat(0xffffff, { map: boards })));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      g.add(floor);
      const ceil = new THREE.Mesh(this.track(new THREE.PlaneGeometry(A.w, A.d)), T.mat(A.ceiling));
      ceil.rotation.x = Math.PI / 2;
      ceil.position.y = A.h;
      g.add(ceil);
      // walls, with a window cut into the one behind the bed (two panels around a lit pane)
      const wallMat = T.mat(A.wall);
      const wall = (w, h, x, y, z, ry) => {
        const m = new THREE.Mesh(this.track(new THREE.PlaneGeometry(w, h)), wallMat);
        m.position.set(x, y, z);
        m.rotation.y = ry;
        g.add(m);
        return m;
      };
      wall(A.w, A.h, 0, A.h / 2, hd, Math.PI); // front (behind the camera)
      wall(A.d, A.h, hw, A.h / 2, 0, -Math.PI / 2);
      wall(A.d, A.h, -hw, A.h / 2, 0, Math.PI / 2);
      // back wall around the window
      const winW = 2.2, winH = 1.3, winY = 1.7;
      wall((A.w - winW) / 2, A.h, -(winW / 2 + (A.w - winW) / 4), A.h / 2, -hd, 0);
      wall((A.w - winW) / 2, A.h, winW / 2 + (A.w - winW) / 4, A.h / 2, -hd, 0);
      wall(winW, winY - winH / 2, 0, (winY - winH / 2) / 2, -hd, 0);
      wall(winW, A.h - (winY + winH / 2), 0, (A.h + winY + winH / 2) / 2, -hd, 0);
      const pane = new THREE.Mesh(this.track(new THREE.PlaneGeometry(winW, winH)), this.track(new THREE.MeshBasicMaterial({ color: A.windowLight })));
      pane.position.set(0, winY, -hd - 0.02);
      g.add(pane);
      const frameMat = T.mat(A.trim);
      for (const [w, h, x, y] of [[winW + 0.16, 0.08, 0, winY + winH / 2], [winW + 0.16, 0.08, 0, winY - winH / 2], [0.08, winH, winW / 2, winY], [0.08, winH, -winW / 2, winY], [0.06, winH, 0, winY]]) {
        const b = new THREE.Mesh(this.track(new THREE.BoxGeometry(w, h, 0.08)), frameMat);
        b.position.set(x, y, -hd + 0.02);
        g.add(b);
      }
      // skirting board
      for (const [w, x, z, ry] of [[A.w, 0, -hd + 0.03, 0], [A.w, 0, hd - 0.03, 0], [A.d, hw - 0.03, 0, Math.PI / 2], [A.d, -hw + 0.03, 0, Math.PI / 2]]) {
        const sk = new THREE.Mesh(this.track(new THREE.BoxGeometry(w, 0.14, 0.05)), frameMat);
        sk.position.set(x, 0.07, z);
        sk.rotation.y = ry;
        g.add(sk);
      }
      // the bed, head against the back wall under the window
      const bed = new THREE.Group();
      const bedW = 1.5, bedL = 2.3, bedH = 0.55;
      const frame = new THREE.Mesh(this.track(new THREE.BoxGeometry(bedW + 0.12, bedH, bedL + 0.1)), T.mat(A.bedFrame));
      frame.position.y = bedH / 2;
      T.addOutline(frame, 1.5);
      bed.add(frame);
      const head = new THREE.Mesh(this.track(new THREE.BoxGeometry(bedW + 0.16, 1.05, 0.1)), T.mat(A.bedFrame));
      head.position.set(0, 0.52, -bedL / 2 - 0.05);
      T.addOutline(head, 1.5);
      bed.add(head);
      const sheet = new THREE.Mesh(this.track(new THREE.BoxGeometry(bedW, 0.16, bedL)), T.mat(A.sheet));
      sheet.position.y = bedH + 0.08;
      bed.add(sheet);
      const blanket = new THREE.Mesh(this.track(new THREE.BoxGeometry(bedW + 0.04, 0.12, bedL * 0.62)), T.mat(A.blanket));
      blanket.position.set(0, bedH + 0.2, bedL * 0.18);
      T.addOutline(blanket, 1);
      bed.add(blanket);
      const pillow = new THREE.Mesh(this.track(new THREE.BoxGeometry(bedW * 0.7, 0.14, 0.42)), T.mat(A.pillow));
      pillow.position.set(0, bedH + 0.22, -bedL / 2 + 0.3);
      bed.add(pillow);
      bed.position.set(0, 0, -hd + bedL / 2 + 0.12);
      g.add(bed);
      // a stool at the bedside, and a small table with a basin and a cloth
      const stool = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.22, 0.24, 0.46, 12)), T.mat(A.trim));
      stool.position.set(1.25, 0.23, bed.position.z + 0.1);
      T.addOutline(stool, 1);
      g.add(stool);
      const table = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.6, 0.7, 0.5)), T.mat(A.bedFrame));
      table.position.set(-1.35, 0.35, bed.position.z - 0.7);
      T.addOutline(table, 1);
      g.add(table);
      const basin = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.2, 0.14, 0.1, 14)), T.mat(0xc8d8e0));
      basin.position.set(-1.35, 0.75, bed.position.z - 0.7);
      g.add(basin);
      // the light through the window, falling across the bed
      const beam = new THREE.PointLight(A.windowLight, 0.9, 9, 1.6);
      beam.position.set(0, 2.2, -hd + 0.8);
      g.add(beam);
      this.scene.add(g);
      this.roomGroup = g;
      this.scene.fog = null;
      this.landmarks = this.landmarks || {};
      // where things are, for the scene that uses the room
      this.landmarks.bed = new V3(0, bedH + 0.26, bed.position.z + 0.1);
      this.landmarks.pillow = new V3(0, bedH + 0.3, bed.position.z - bedL / 2 + 0.3);
      this.landmarks.stool = stool.position.clone().setY(0.46);
      this.landmarks.window = pane.position.clone();
      this.landmarks.door = new V3(hw - 1.2, 0, hd - 0.6);
    }

    /* ---------------- city ---------------- */
    /**
     * A city built for the Buu era: flat streets on a grid, blocks of buildings
     * with roofs and windows, a plaza in the middle with room to fight, and a
     * school on one side. The ground is flat (`heights` all zero) so flight,
     * landings and rooftop work behave predictably, and the buildings are real
     * obstacles: they block movement, they take damage and they come down.
     *
     * Everything repeating is instanced (bodies and roofs; the windows are one
     * texture multiplied by each wall colour),
     * because the Buu saga will eventually knock a lot of it over.
     */
    _buildCity() {
      const def = this.def, C = def.city, T = SL.Toon, rng = this.rng;
      const S = (this.size = def.size);
      const N = (this.seg = 24);
      this.step = S / N;
      const count = (N + 1) * (N + 1);
      this.heights = new Float32Array(count); // flat: the street is the floor
      const geo = this.track(new THREE.PlaneGeometry(S, S, N, N));
      geo.rotateX(-Math.PI / 2);
      // streets and pavement painted into the ground texture rather than modelled
      const tex = T.canvasTexture(512, 512, (ctx, w, h) => {
        ctx.fillStyle = C.pavement;
        ctx.fillRect(0, 0, w, h);
        const cell = w / 8;
        ctx.fillStyle = C.road;
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(i * cell - cell * 0.16, 0, cell * 0.32, h);
          ctx.fillRect(0, i * cell - cell * 0.16, w, cell * 0.32);
        }
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 16]);
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cell, 0);
          ctx.lineTo(i * cell, h);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * cell);
          ctx.lineTo(w, i * cell);
          ctx.stroke();
        }
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(S / (C.block * 8), S / (C.block * 8));
      const ground = new THREE.Mesh(geo, this.track(T.makeMat(0xffffff, { map: tex })));
      ground.receiveShadow = true;
      this.scene.add(ground);
      this.terrain = ground;
      this.terrainGeo = geo;
      this.baseColors = null;

      // the blocks: one building per block, skipped near the plaza so there is
      // somewhere to land and fight
      const plazaR = C.plazaRadius;
      const half = Math.floor(C.blocks / 2);
      const bodyGeo = this.track(new THREE.BoxGeometry(1, 1, 1));
      const roofGeo = this.track(new THREE.BoxGeometry(1, 1, 1));
      const spots = [];
      for (let gx = -half; gx <= half; gx++) {
        for (let gz = -half; gz <= half; gz++) {
          const x = gx * C.block + (rng() - 0.5) * 3;
          const z = gz * C.block + (rng() - 0.5) * 3;
          if (Math.hypot(x, z) < plazaR) continue;
          if (Math.abs(x) > S * 0.45 || Math.abs(z) > S * 0.45) continue;
          const w = C.block * (0.42 + rng() * 0.22);
          const d = C.block * (0.42 + rng() * 0.22);
          const h = C.minHeight + rng() * (C.maxHeight - C.minHeight);
          spots.push({ x, z, w, d, h, tint: C.walls[Math.floor(rng() * C.walls.length)] });
        }
      }
      // C.ruin (0..1): that share of the city is broken off near the ground (the future's ruins)
      if (C.ruin) for (const p of spots) if (rng() < C.ruin) p.h = Math.max(3, p.h * (0.1 + rng() * 0.3));
      // one instanced mesh per wall colour (a toon material carries one colour;
      // per-instance colour would need a shader change we do not need here)
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3();
      const byTint = new Map();
      for (const p of spots) {
        if (!byTint.has(p.tint)) byTint.set(p.tint, []);
        byTint.get(p.tint).push(p);
      }
      this.cityMeshes = [];
      // windows: a grid painted once and multiplied by each wall colour
      const windows = T.canvasTexture(128, 256, (ctx, w, h) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        const cols = 5, rows = 12, mx = w / cols, my = h / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = (r * 7 + c * 3) % 5 === 0 ? '#9fb0c0' : '#4a5664';
            ctx.fillRect(c * mx + mx * 0.2, r * my + my * 0.22, mx * 0.6, my * 0.56);
          }
        }
      });
      this.track(windows);
      for (const [tint, list] of byTint) {
        const bodies = new THREE.InstancedMesh(bodyGeo, this.track(T.makeMat(tint, { map: windows })), list.length);
        list.forEach((p, i) => {
          m4.compose(new V3(p.x, p.h / 2, p.z), q, sc.set(p.w, p.h, p.d));
          bodies.setMatrixAt(i, m4);
          p.mesh = bodies;
          p.index = i;
        });
        bodies.castShadow = true;
        bodies.receiveShadow = true;
        this.scene.add(bodies);
        this.cityMeshes.push(bodies);
      }
      const roofs = new THREE.InstancedMesh(roofGeo, T.mat(C.roof), spots.length);
      spots.forEach((p, i) => {
        m4.compose(new V3(p.x, p.h + 0.35, p.z), q, sc.set(p.w * 1.06, 0.7, p.d * 1.06));
        roofs.setMatrixAt(i, m4);
        // a building is a real obstacle: rounded to a cylinder for collision, as
        // the rock spires are, and destructible with the same machinery
        const r = Math.min(p.w, p.d) * 0.5;
        this.obstacles.push({ shape: 'cyl', x: p.x, z: p.z, y: 0, r, h: p.h, top: p.h, hp: 900 * r, maxHp: 900 * r, alive: true, group: null, segs: [], color: p.tint, building: { mesh: p.mesh, index: p.index, roofs, roofIndex: i } });
      });
      roofs.castShadow = true;
      this.scene.add(roofs);
      this.cityRoofs = roofs;
      this.cityBuildings = spots;

      // the school: a wider, lower building with a clock over the doors
      const schoolPos = new V3(C.block * 1.5, 0, -C.block * 1.6);
      const school = new THREE.Group();
      const sw = C.block * 1.5, sd = C.block * 0.8, sh = 16;
      const body = new THREE.Mesh(this.track(new THREE.BoxGeometry(sw, sh, sd)), T.mat(C.school));
      body.position.y = sh / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      T.addOutline(body, 1.4);
      school.add(body);
      const tower = new THREE.Mesh(this.track(new THREE.BoxGeometry(sw * 0.22, sh * 0.55, sd * 0.5)), T.mat(C.school));
      tower.position.set(0, sh + sh * 0.27, sd * 0.28);
      T.addOutline(tower, 1.2);
      school.add(tower);
      const clock = new THREE.Mesh(this.track(new THREE.CircleGeometry(2.1, 18)), this.track(new THREE.MeshBasicMaterial({ color: C.clock })));
      clock.position.set(0, sh + sh * 0.3, sd * 0.53 + 0.05);
      school.add(clock);
      const steps = new THREE.Mesh(this.track(new THREE.BoxGeometry(sw * 0.3, 0.6, 3)), T.mat(C.roof));
      steps.position.set(0, 0.3, sd / 2 + 1.4);
      school.add(steps);
      school.position.copy(schoolPos);
      this.scene.add(school);
      this.schoolGroup = school;
      this.obstacles.push({ shape: 'cyl', x: schoolPos.x, z: schoolPos.z, y: 0, r: Math.min(sw, sd) * 0.5, h: sh, top: sh, hp: 22000, maxHp: 22000, alive: true, group: school, segs: [], color: C.school });
      if (C.ruin || C.noSchool) {
        // no school stands in the ruins (nor in a small town: C.noSchool)
        school.visible = false;
        this.obstacles[this.obstacles.length - 1].alive = false;
      }

      this.landmarks = this.landmarks || {};
      this.landmarks.plaza = new V3(0, 0, 0);
      this.landmarks.school = schoolPos.clone();
      this.landmarks.schoolSteps = schoolPos.clone().add(new V3(0, 0, sd / 2 + 3));
      this.landmarks.schoolRoof = schoolPos.clone().setY(sh);
      // a tall building near the plaza, for rooftop work
      let best = null;
      for (const p of spots) {
        const d = Math.hypot(p.x, p.z);
        if (d > plazaR + C.block * 2.2) continue;
        if (!best || p.h > best.h) best = p;
      }
      if (best) this.landmarks.rooftop = new V3(best.x, best.h + 0.7, best.z);
      this.isCity = true;
    }

    /* ---------------- tournament arena ---------------- */
    /**
     * A raised stone ring on a rocky flat, built for one fight rather than for
     * roaming: the Cell Games. The platform is not part of the terrain mesh —
     * `heightAt` lifts it analytically so its edge stays sharp at any mesh
     * resolution, and `crater` turns impacts on it into cracks instead of dents.
     */
    _buildArena() {
      const def = this.def;
      const A = def.arena;
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
        // flat where the fighting happens, broken ground beyond it, cliffs at the rim
        let h = noise.fbm(x * 0.016, z * 0.016, 4) * 7 - 2;
        h += noise.fbm(x * 0.06 + 20, z * 0.06, 2) * 1.1;
        h *= U.smooth(U.clamp01((d - A.half - 6) / 46));
        // a stadium yard is paved flat right out to its wall
        if (A.stadium && Math.max(Math.abs(x), Math.abs(z)) < A.stadium.yard + A.stadium.tiers * 3.2 + 6) h = 0;
        if (d > 150) h += Math.pow((d - 150) / 52, 2) * 60 * (0.6 + noise(x * 0.02, z * 0.02) * 0.8);
        // a flat-topped ridge with steep sides (the Cell Games: where the Z Fighters watch from)
        if (A.ridge) {
          const rd = Math.hypot(x - A.ridge.x, z - A.ridge.z);
          const k = U.smooth(U.clamp01((A.ridge.r + 5 - rd) / 5));
          h = Math.max(h, A.ridge.h * k + noise(x * 0.3, z * 0.3) * 0.15 * k);
        }
        this.heights[i] = h;
        pos.setY(i, h);
      }
      geo.computeVertexNormals();
      const nrm = geo.attributes.normal;
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const slope = 1 - nrm.getY(i);
        const n = noise(pos.getX(i) * 0.09, pos.getZ(i) * 0.09);
        c.copy(sand).lerp(dirt, U.clamp01(n * 0.9 + slope * 1.6));
        if (slope > 0.22 || this.heights[i] > 18) c.lerp(rock, U.clamp01((slope - 0.18) * 3 + (this.heights[i] - 18) * 0.04));
        // the dirt road out of the arena
        if (A.road) {
          const rx = pos.getX(i), rz = pos.getZ(i);
          const [x0, z0] = A.road.from, [x1, z1] = A.road.to;
          const vx = x1 - x0, vz = z1 - z0, L2 = vx * vx + vz * vz;
          const t = U.clamp01(((rx - x0) * vx + (rz - z0) * vz) / L2);
          const dd = Math.hypot(rx - (x0 + vx * t), rz - (z0 + vz * t));
          if (dd < A.road.width) c.lerp(new THREE.Color(A.road.color), U.clamp01((A.road.width - dd) / 1.5) * 0.85);
        }
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      this.baseColors = colors.slice();
      this.terrain = new THREE.Mesh(geo, this.track(SL.Toon.makeMat(0xffffff, { vertexColors: true })));
      this.terrain.receiveShadow = true;
      this.scene.add(this.terrain);
      this.terrainGeo = geo;

      this._buildRing(A);
      this._buildArenaSurrounds(A);
    }

    /** The platform: paved top, stone skirt, raised trim, corner posts and one flight of steps. */
    _buildRing(A) {
      const T = SL.Toon;
      const half = A.half, hgt = A.height;
      const g = new THREE.Group();
      // paving, drawn once and reused: tiles with mortar lines and a painted boundary
      const tiles = Math.max(2, Math.round((half * 2) / A.tile));
      const tex = T.canvasTexture(512, 512, (ctx, w, h) => {
        ctx.fillStyle = A.topCss;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = A.lineCss;
        ctx.lineWidth = 4;
        const s = w / tiles;
        for (let i = 1; i < tiles; i++) {
          ctx.beginPath();
          ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h);
          ctx.moveTo(0, i * s); ctx.lineTo(w, i * s);
          ctx.stroke();
        }
        ctx.strokeStyle = A.trimCss;
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, w - 20, h - 20);
      });
      const top = new THREE.Mesh(this.track(new THREE.PlaneGeometry(half * 2, half * 2)), this.track(T.makeMat(0xffffff, { map: tex })));
      top.rotation.x = -Math.PI / 2;
      top.position.y = hgt + 0.02;
      top.receiveShadow = true;
      g.add(top);
      // the block underneath, so the ring reads as raised from every angle
      const body = new THREE.Mesh(this.track(new THREE.BoxGeometry(half * 2, hgt, half * 2)), T.mat(A.side));
      body.position.y = hgt / 2;
      body.castShadow = true;
      T.addOutline(body, 2);
      g.add(body);
      // trim along the top edge: the readable boundary
      const trimGeo = this.track(new THREE.BoxGeometry(half * 2 + A.rim * 2, A.rim * 0.7, A.rim));
      for (let i = 0; i < 4; i++) {
        const bar = new THREE.Mesh(trimGeo, T.mat(A.trim));
        bar.position.y = hgt + A.rim * 0.35;
        const d = half + A.rim * 0.5;
        if (i === 0) bar.position.z = -d;
        else if (i === 1) bar.position.z = d;
        else { bar.position.x = i === 2 ? -d : d; bar.rotation.y = Math.PI / 2; }
        g.add(bar);
      }
      // corner posts
      const postGeo = this.track(new THREE.BoxGeometry(A.rim * 1.6, A.rim * 2.2, A.rim * 1.6));
      if (!A.noPosts) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(postGeo, T.mat(A.post));
        post.position.set(sx * (half + A.rim * 0.5), hgt + A.rim * 1.1, sz * (half + A.rim * 0.5));
        T.addOutline(post, 2);
        g.add(post);
      }
      // steps up the near side, so the platform has a way on that is not flight
      const steps = A.noSteps ? 0 : 4;
      for (let i = 0; i < steps; i++) {
        const sh = hgt / steps;
        const st = new THREE.Mesh(this.track(new THREE.BoxGeometry(7, sh, 1.5)), T.mat(A.side));
        st.position.set(0, sh * (i + 0.5), half + 1.5 + (steps - 1 - i) * 1.5);
        g.add(st);
      }
      // the Cell Games obelisks: a round pedestal, a ring, and a long white needle off each corner
      if (A.obelisks) {
        const O = A.obelisks;
        const ped = this.track(new THREE.CylinderGeometry(O.base, O.base * 1.15, 1.4, 14));
        const collar = this.track(new THREE.TorusGeometry(O.base * 0.78, O.radius * 0.32, 8, 18));
        const bulb = this.track(new THREE.SphereGeometry(O.radius * 1.25, 14, 10));
        const needle = this.track(new THREE.ConeGeometry(O.radius, O.height, 12));
        this.obelisks = [];
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
          const x = sx * (half + O.off), z = sz * (half + O.off);
          const y = this.heightAt(x, z);
          const ob = new THREE.Group();
          const p = new THREE.Mesh(ped, T.mat(O.ring));
          p.position.y = 0.7;
          const c = new THREE.Mesh(collar, T.mat(O.color));
          c.rotation.x = Math.PI / 2;
          c.position.y = 1.55;
          const bb = new THREE.Mesh(bulb, T.mat(O.color));
          bb.position.y = 2.1;
          bb.scale.y = 1.4;
          const nd = new THREE.Mesh(needle, T.mat(O.color));
          nd.position.y = 2.2 + O.height / 2;
          for (const mm of [p, c, bb, nd]) {
            mm.castShadow = true;
            T.addOutline(mm, 1.6);
            ob.add(mm);
          }
          ob.position.set(x, y, z);
          this.scene.add(ob);
          this.obelisks.push(ob);
          // solid: nobody walks or flies through an obelisk
          this.obstacles.push({ shape: 'cyl', x, z, y, r: O.base, h: O.height + 2.2, top: y + O.height + 2.2, hp: 1e9, maxHp: 1e9, alive: true, group: ob, segs: [], color: O.color, fixture: true });
        }
      }
      this.scene.add(g);
      this.ringGroup = g;
      // cracks are drawn onto a plane just above the paving
      this.ringCrackGroup = new THREE.Group();
      this.ringCrackGroup.position.y = hgt + 0.06;
      this.scene.add(this.ringCrackGroup);
      this.ringCracks = [];
      this.ringDamage = 0;
      this.arena = {
        half, y: hgt, rim: A.rim,
        onRing: (x, z) => Math.abs(x) <= half && Math.abs(z) <= half,
      };
      this._crackTex = T.canvasTexture(128, 128, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = A.crackCss;
        ctx.lineJoin = 'round';
        const rng = U.mulberry32(11);
        for (let b = 0; b < 5; b++) {
          ctx.lineWidth = 5 - b * 0.7;
          ctx.beginPath();
          let x = w / 2, y = h / 2;
          ctx.moveTo(x, y);
          let a = (b / 5) * Math.PI * 2 + rng();
          for (let k = 0; k < 6; k++) {
            a += (rng() - 0.5) * 1.1;
            x += Math.cos(a) * (w / 16);
            y += Math.sin(a) * (h / 16);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      });
    }

    /** What surrounds the ring: broken ground, boulders, a cliff wall and the people who came to watch. */
    _buildArenaSurrounds(A) {
      if (A.stadium) return this._buildStadium(A);
      const def = this.def, rng = this.rng, T = SL.Toon;
      const bands = def.rock.bands;
      // boulders on the flat, kept clear of the platform and its approach
      const boulderGeo = this.track(new THREE.DodecahedronGeometry(1, 0));
      const boulders = new THREE.InstancedMesh(boulderGeo, T.mat(def.terrain.rock), 70);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3();
      for (let i = 0; i < 70; i++) {
        const a = rng() * Math.PI * 2, d = A.half + 12 + rng() * 120;
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        const s = 0.4 + rng() * 2.2;
        sc.set(s, s * (0.6 + rng() * 0.6), s);
        q.setFromEuler(new THREE.Euler(rng() * 3, rng() * 6, rng() * 3));
        m4.compose(new V3(x, this.heightAt(x, z) + s * 0.3, z), q, sc);
        boulders.setMatrixAt(i, m4);
      }
      boulders.castShadow = true;
      this.scene.add(boulders);
      this.track(boulders.geometry);

      // destructible spires, far enough out that the fight is never fought among them
      for (let i = 0; i < (def.rock.count || 0); i++) {
        const a = (i / def.rock.count) * Math.PI * 2 + rng() * 0.5;
        const d = 62 + rng() * 60;
        this._addSpire(Math.cos(a) * d, Math.sin(a) * d, 3 + rng() * 3, 12 + rng() * 22, bands, rng);
      }

      // the Cell Games horizon: flat-topped mesas, tan and red, near and far
      this.mesas = [];
      if (A.mesas) {
        const M = A.mesas;
        for (let i = 0; i < M.count; i++) {
          const a = (i / M.count) * Math.PI * 2 + rng() * 0.2;
          const d = M.near + rng() * (M.far - M.near);
          const r = 16 + rng() * 30, h = 18 + rng() * 34;
          const geo = this.track(new THREE.CylinderGeometry(r * 0.82, r, h, 9));
          const mesh = new THREE.Mesh(geo, T.mat(M.color[i % M.color.length]));
          mesh.position.set(Math.cos(a) * d, h / 2 - 3, Math.sin(a) * d);
          this.mesas.push({ x: mesh.position.x, z: mesh.position.z, r, h: h - 3 });
          mesh.rotation.y = rng() * 6;
          T.addOutline(mesh, 2.4);
          this.scene.add(mesh);
          // a band of darker strata a third of the way down
          const band = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r * 0.9, r * 0.93, h * 0.12, 9)), T.mat(0x8a5a36));
          band.position.set(mesh.position.x, h * 0.32 - 3, mesh.position.z);
          band.rotation.y = mesh.rotation.y;
          this.scene.add(band);
        }
      }
      // the cliff wall that closes the horizon
      for (let i = 0; i < (A.mesas ? 0 : 30); i++) {
        const a = (i / 30) * Math.PI * 2 + rng() * 0.15;
        const d = 210 + rng() * 150;
        const r = 24 + rng() * 40, h = 50 + rng() * 90;
        const g = this.track(new THREE.CylinderGeometry(r * 0.45, r, h, 7));
        const mesh = new THREE.Mesh(g, T.mat(bands[i % bands.length]));
        mesh.position.set(Math.cos(a) * d, h / 2 - 12, Math.sin(a) * d);
        mesh.rotation.y = rng() * 6;
        this.scene.add(mesh);
      }

      // the broadcast: a camera crew and a scatter of onlookers at the ring's edge.
      // They are scenery, not fighters — nothing targets them and they take no part.
      const crowd = new THREE.Group();
      const bodyGeo = this.track(new THREE.CapsuleGeometry(0.28, 0.72, 4, 8));
      const headGeo = this.track(new THREE.SphereGeometry(0.24, 10, 8));
      const shirts = [0xd85a4a, 0x4a7ad8, 0xe0c84a, 0x58a85a, 0xc8c8d0, 0x9a5ad8];
      const mk = (x, z, yaw, tint) => {
        const person = new THREE.Group();
        const b = new THREE.Mesh(bodyGeo, T.mat(tint));
        b.position.y = 0.72;
        const hd = new THREE.Mesh(headGeo, T.mat(0xe8c49a));
        hd.position.y = 1.42;
        person.add(b, hd);
        person.position.set(x, this.heightAt(x, z), z);
        person.rotation.y = yaw;
        crowd.add(person);
        return person;
      };
      const ringSide = A.half + 7;
      for (let i = 0; i < (A.noCrowd ? 0 : 22); i++) {
        const a = rng() * Math.PI * 2;
        const d = ringSide + rng() * 16;
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        mk(x, z, Math.atan2(-x, -z), shirts[Math.floor(rng() * shirts.length)]);
      }
      // the man with the microphone, and the camera on its tripod beside him (the Cell Games: the crew are
      // real characters the mission places; the stage only builds their van and the camera)
      const announcer = A.crew ? { position: new V3(A.crew.x - 1.5, 0, A.crew.z - 2) } : mk(A.half + 5.5, 6, -Math.PI / 2 - 0.3, 0x2a2a38);
      const tripod = new THREE.Group();
      const leg = this.track(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 5));
      for (let i = 0; i < 3; i++) {
        const l = new THREE.Mesh(leg, T.mat(0x3a3a44));
        l.position.y = 0.75;
        l.rotation.z = Math.cos((i / 3) * Math.PI * 2) * 0.22;
        l.rotation.x = Math.sin((i / 3) * Math.PI * 2) * 0.22;
        tripod.add(l);
      }
      const cam = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.5, 0.42, 0.9)), T.mat(0x1e1e26));
      cam.position.y = 1.62;
      tripod.add(cam);
      tripod.position.set(A.half + 6.5, this.heightAt(A.half + 6.5, 8.5), 8.5);
      tripod.rotation.y = -Math.PI / 2;
      if (A.crew) {
        tripod.position.set(A.crew.x - 2.4, this.heightAt(A.crew.x - 2.4, A.crew.z - 3.4), A.crew.z - 3.4);
        tripod.rotation.y = Math.atan2(-tripod.position.x, -tripod.position.z) + Math.PI;
        // the TV van: a box body, a cab, a dish on the roof and the station's stripe down the side
        const van = new THREE.Group();
        const body = new THREE.Mesh(this.track(new THREE.BoxGeometry(2.4, 2.3, 5.2)), T.mat(0xece8e0));
        body.position.y = 1.55;
        const cab = new THREE.Mesh(this.track(new THREE.BoxGeometry(2.3, 1.5, 1.6)), T.mat(0xdcd8d0));
        cab.position.set(0, 1.15, 3.2);
        const glass = new THREE.Mesh(this.track(new THREE.BoxGeometry(2.1, 0.7, 0.1)), T.mat(0x3a4a5a));
        glass.position.set(0, 1.55, 4.02);
        const stripe = new THREE.Mesh(this.track(new THREE.BoxGeometry(2.46, 0.36, 5.0)), T.mat(0xd8402a));
        stripe.position.y = 1.2;
        const dish = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.7, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.4)), T.mat(0xf4f4f4));
        dish.position.set(0, 3.0, -1.2);
        dish.rotation.x = -0.9;
        for (const w of [[-1.1, 1.6], [1.1, 1.6], [-1.1, -1.6], [1.1, -1.6], [-1.1, 3.2], [1.1, 3.2]]) {
          const wh = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12)), T.mat(0x222226));
          wh.rotation.z = Math.PI / 2;
          wh.position.set(w[0], 0.42, w[1]);
          van.add(wh);
        }
        for (const mm of [body, cab, glass, stripe, dish]) {
          T.addOutline(mm, 1.4);
          van.add(mm);
        }
        van.position.set(A.crew.x, this.heightAt(A.crew.x, A.crew.z), A.crew.z);
        van.rotation.y = A.crew.yaw;
        crowd.add(van);
        this.obstacles.push({ shape: 'cyl', x: A.crew.x, z: A.crew.z, y: van.position.y, r: 2.6, h: 3, top: van.position.y + 3, hp: 1e9, maxHp: 1e9, alive: true, group: van, segs: [], color: 0xece8e0, fixture: true });
      }
      crowd.add(tripod);
      this.scene.add(crowd);
      this.crowdGroup = crowd;
      this.landmarks = this.landmarks || {};
      this.landmarks.announcer = announcer.position.clone();
    }

    /**
     * The World Tournament grounds: a paved yard around a low ring, a wall with
     * tiered stands on three sides full of people, the temple hall behind the
     * fourth, and the announcer at the ring's edge. The crowd is instanced (one
     * mesh for bodies, one for heads) and `cheer(amount)` makes it jump.
     */
    _buildStadium(A) {
      const def = this.def, rng = this.rng, T = SL.Toon, St = A.stadium;
      const yard = St.yard;
      // the yard paving, flat to the wall
      const paving = new THREE.Mesh(this.track(new THREE.PlaneGeometry(yard * 2, yard * 2)), T.mat(St.yardColor));
      paving.rotation.x = -Math.PI / 2;
      paving.position.y = 0.02;
      paving.receiveShadow = true;
      this.scene.add(paving);
      // the wall and the stands on three sides; the hall on the fourth (-z)
      const wallMat = T.mat(St.wall), standMat = T.mat(St.stand);
      const people = [];
      const sides = [[0, 1], [1, 0], [-1, 0]];
      for (const [sx, sz] of sides) {
        for (let tier = 0; tier < St.tiers; tier++) {
          const d = yard + 2 + tier * 3.2, h = 1.6 + tier * 1.6;
          const len = (d + 3) * 2;
          const step = new THREE.Mesh(this.track(new THREE.BoxGeometry(sx ? 3.2 : len, h, sx ? len : 3.2)), tier === 0 ? wallMat : standMat);
          step.position.set(sx * d, h / 2, sz * d);
          step.receiveShadow = true;
          if (tier === 0) T.addOutline(step, 1.2);
          this.scene.add(step);
          // a row of spectators on each tier
          for (let k = -len / 2 + 1.2; k < len / 2 - 1.2; k += 1.25) {
            if (rng() < 0.12) continue;
            people.push({ x: sx ? sx * d : k + (rng() - 0.5) * 0.3, z: sz ? sz * d : k + (rng() - 0.5) * 0.3, y: h, yaw: Math.atan2(-sx, -sz) });
          }
        }
      }
      // the hall behind the ring
      const hall = this._buildHall(yard, St);
      hall.position.set(0, 0, -(yard + 6));
      this.scene.add(hall);
      // the crowd, instanced
      const bodyGeo = this.track(new THREE.CapsuleGeometry(0.3, 0.6, 3, 6));
      const headGeo = this.track(new THREE.SphereGeometry(0.24, 8, 6));
      const shirts = [0xd85a4a, 0x4a7ad8, 0xe0c84a, 0x58a85a, 0xc8c8d0, 0x9a5ad8, 0xe8905a];
      const byShirt = shirts.map(() => []);
      people.forEach((p, i) => byShirt[i % shirts.length].push(p));
      this.crowd = { meshes: [], heads: null, people, cheer: 0, t: 0 };
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new V3(1, 1, 1);
      byShirt.forEach((list, si) => {
        if (!list.length) return;
        const mesh = new THREE.InstancedMesh(bodyGeo, T.mat(shirts[si]), list.length);
        list.forEach((p, i) => {
          p.mesh = mesh;
          p.index = i;
          p.phase = rng() * 6.28;
          m4.compose(new V3(p.x, p.y + 0.6, p.z), q, one);
          mesh.setMatrixAt(i, m4);
        });
        this.scene.add(mesh);
        this.crowd.meshes.push(mesh);
      });
      const heads = new THREE.InstancedMesh(headGeo, T.mat(0xe8c49a), people.length);
      people.forEach((p, i) => {
        p.head = i;
        m4.compose(new V3(p.x, p.y + 1.25, p.z), q, one);
        heads.setMatrixAt(i, m4);
      });
      this.scene.add(heads);
      this.crowd.heads = heads;
      // the announcer, in his suit and sunglasses, at the ring's edge
      const ann = new THREE.Group();
      const ab = new THREE.Mesh(bodyGeo, T.mat(0x2a2a38));
      ab.position.y = 0.72;
      const ah = new THREE.Mesh(headGeo, T.mat(0xe8c49a));
      ah.position.y = 1.4;
      const hair = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.26, 8, 6, 0, Math.PI * 2, 0, 1.4)), T.mat(0xe8d070));
      hair.position.y = 1.46;
      const shades = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.34, 0.08, 0.06)), T.mat(0x101014));
      shades.position.set(0, 1.44, 0.22);
      const mic = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.03, 0.02, 0.3, 6)), T.mat(0x2a2a2a));
      mic.position.set(0.2, 1.2, 0.2);
      mic.rotation.x = -0.6;
      ann.add(ab, ah, hair, shades, mic);
      ann.position.set(A.half + 2.2, 0, A.half * 0.4);
      ann.rotation.y = -Math.PI / 2;
      this.scene.add(ann);
      this.announcerFigure = ann;
      this.landmarks = this.landmarks || {};
      this.landmarks.announcer = ann.position.clone();
      this.landmarks.hall = hall.position.clone();
      this.landmarks.stands = new V3(0, 3, yard + 4);
      this.landmarks.gate = new V3(0, 0, -(yard + 0.5));
      this.crowdGroup = null;
    }

    /**
     * THE TENKAICHI BUDOKAI HALL (the owner's reference, 2026-10-03): white walls on a red base, a thatched hip
     * roof (two layers of straw, horns on the ridge), the long name board — 天下一武道会 — over red doors
     * with the 武 mark, two guardian heads on red plinths either side, the striped arches of Papaya
     * Island behind, round trees over the side walls. Faces +z (the ring). No random numbers.
     */
    _buildHall(yard, St) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const hw = yard * 0.9;
      const add = (geo, mat, x, y, z, o = {}) => {
        const m = new THREE.Mesh(this.track(geo), mat && mat.isMaterial ? mat : T.mat(mat));
        m.position.set(x, y, z);
        if (o.rx) m.rotation.x = o.rx;
        if (o.ry) m.rotation.y = o.ry;
        if (o.rz) m.rotation.z = o.rz;
        if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]);
        m.castShadow = o.shadow !== false;
        m.receiveShadow = true;
        if (o.outline !== 0) T.addOutline(m, o.outline || 1.4);
        g.add(m);
        return m;
      };
      const white = St.hallWall || 0xf2ece0, red = St.hallBase || 0xc4482a, thatch = St.thatch || 0xb08a4e, thatchDark = St.thatchDark || 0x8a6a38;
      // the walls and the red base
      add(new THREE.BoxGeometry(hw, 7, 10), white, 0, 3.5, 0);
      add(new THREE.BoxGeometry(hw + 0.12, 1.5, 10.12), red, 0, 0.75, 0, { outline: 1 });
      // the hip roof: a wide flattened pyramid of straw over a darker eave
      const eave = add(new THREE.CylinderGeometry(hw * 0.1, hw * 0.74, 1.1, 4), thatchDark, 0, 7.4, 0, { ry: Math.PI / 4, s: [1, 1, 0.62] });
      eave.castShadow = true;
      add(new THREE.CylinderGeometry(hw * 0.08, hw * 0.66, 6.2, 4), thatch, 0, 10.6, 0, { ry: Math.PI / 4, s: [1, 1, 0.58] });
      // the ridge and its horns
      add(new THREE.BoxGeometry(hw * 0.2, 0.7, 1.2), thatchDark, 0, 13.6, 0, { outline: 1 });
      for (const s of [1, -1]) {
        const horn = add(new THREE.ConeGeometry(0.42, 2.6, 8), 0xf2e8d4, s * hw * 0.11, 14.6, 0, { rz: -s * 0.7, outline: 1 });
        horn.castShadow = true;
      }
      // the name board over the doors
      const board = this.track(T.canvasTexture(1024, 192, (ctx, w, h) => {
        ctx.fillStyle = '#f6f0e2';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#b8302a';
        ctx.lineWidth = 22;
        ctx.strokeRect(11, 11, w - 22, h - 22);
        ctx.fillStyle = '#16161a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 128px "Yu Gothic", "MS Gothic", "Meiryo", sans-serif';
        if (ctx.fillText) ctx.fillText('天下一武道会', w / 2, h / 2 + 6);
      }));
      const sign = new THREE.Mesh(this.track(new THREE.PlaneGeometry(10.5, 2)), this.track(T.makeMat(0xffffff, { map: board })));
      sign.position.set(0, 6.2, 5.14);
      g.add(sign);
      add(new THREE.BoxGeometry(11.1, 2.5, 0.25), red, 0, 6.2, 4.96, { outline: 1 });
      // the doors: a red pair under a white arch, the round mark on them
      add(new THREE.BoxGeometry(4.6, 4.4, 0.4), 0xf6f0e2, 0, 2.2, 5.05, { outline: 1 });
      add(new THREE.BoxGeometry(3.4, 3.6, 0.3), 0xb02a22, 0, 1.8, 5.2, { outline: 1 });
      const mark = new THREE.Mesh(this.track(new THREE.CircleGeometry(0.85, 28)), this.track(new THREE.MeshBasicMaterial({ map: T.emblemTexture('武', '#c01818', '#f6f0e2') })));
      mark.position.set(0, 2.2, 5.37);
      g.add(mark);
      // the guardian heads: horned, fanged, wide-eyed, on red plinths either side of the doors
      for (const s of [1, -1]) {
        const x = s * 6.2;
        add(new THREE.BoxGeometry(2.6, 1.8, 2.4), red, x, 0.9, 6.2, { outline: 1.2 });
        add(new THREE.BoxGeometry(2.8, 0.25, 2.6), 0xf6f0e2, x, 1.9, 6.2, { outline: 0.8 });
        const hy = 3.2;
        add(new THREE.SphereGeometry(1.25, 16, 12), 0xd8783a, x, hy, 6.3, { s: [1.1, 0.95, 0.9] });
        add(new THREE.TorusGeometry(1.25, 0.32, 8, 20), 0xf2e8d4, x, hy, 6.1, { outline: 1 });
        for (const e of [1, -1]) {
          add(new THREE.SphereGeometry(0.3, 10, 8), 0xffffff, x + e * 0.45, hy + 0.3, 7.3, { outline: 0.6 });
          add(new THREE.SphereGeometry(0.13, 8, 6), 0x16161a, x + e * 0.45, hy + 0.3, 7.56, { outline: 0 });
          add(new THREE.ConeGeometry(0.22, 1.5, 8), 0xf2e8d4, x + e * 0.85, hy + 1.3, 6.3, { rz: -e * 0.5, outline: 0.8 });
          add(new THREE.ConeGeometry(0.1, 0.32, 6), 0xffffff, x + e * 0.3, hy - 0.62, 7.25, { rx: Math.PI, outline: 0 });
        }
        add(new THREE.BoxGeometry(1.2, 0.18, 0.2), 0x6a1a14, x, hy - 0.5, 7.3, { outline: 0 });
        // the low wall from the plinth out along the yard's back edge
        add(new THREE.BoxGeometry(hw * 0.5 - 6, 2.6, 0.9), white, s * (hw * 0.25 + 4.6), 1.3, 6.6, { outline: 1 });
        add(new THREE.BoxGeometry(hw * 0.5 - 6, 0.9, 0.95), red, s * (hw * 0.25 + 4.6), 0.45, 6.6, { outline: 0 });
      }
      // trees showing over the walls either side of the hall
      for (const [x, z, r] of [[-hw * 0.55, 1, 3.2], [-hw * 0.7, -3, 2.6], [hw * 0.56, 0, 3.4], [hw * 0.72, -4, 2.8], [-hw * 0.4, -6, 2.4], [hw * 0.38, -7, 2.6]]) {
        add(new THREE.CylinderGeometry(0.3, 0.42, 4, 7), 0x6a4a2a, x, 2, z, { outline: 1 });
        add(new THREE.SphereGeometry(r, 12, 10), 0x3f8a3a, x, 4 + r * 0.7, z, { s: [1, 0.85, 1] });
      }
      // the striped arches of the island behind it all
      const bands = [0xe0583a, 0xf0b83a, 0xf2ece0, 0x4a9ad8];
      for (const s of [1, -1]) {
        bands.forEach((c, i) => {
          const arch = new THREE.Mesh(this.track(new THREE.TorusGeometry(11 - i * 0.9, 0.46, 8, 30, Math.PI)), T.mat(c));
          arch.position.set(s * hw * 0.62, 0, -16 - s * 3);
          arch.rotation.y = s * 0.5;
          arch.castShadow = true;
          g.add(arch);
        });
      }
      return g;
    }

    /**
     * Babidi's ship: a pale egg of a spacecraft half sunk into a crater, ringed
     * with round ports, a hatch facing the approach. It is a real obstacle, and its
     * landmarks (`ship`, `hatch`) are where the story stands people.
     */
    _buildBabidiShip(opts) {
      const T = SL.Toon;
      const at = new V3(opts.at[0], 0, opts.at[2]);
      at.y = this.heightAt(at.x, at.z);
      const R0 = opts.radius || 24;
      const g = new THREE.Group();
      const hull = new THREE.Mesh(this.track(new THREE.SphereGeometry(R0, 36, 24)), T.mat(0xd8cfb8));
      hull.scale.y = 0.62;
      hull.position.y = R0 * 0.18;
      T.addOutline(hull, 3);
      g.add(hull);
      const band = new THREE.Mesh(this.track(new THREE.TorusGeometry(R0 * 0.98, R0 * 0.05, 8, 48)), T.mat(0x8a7a5a));
      band.rotation.x = Math.PI / 2;
      band.position.y = R0 * 0.2;
      g.add(band);
      const port = this.track(new THREE.CircleGeometry(R0 * 0.07, 14));
      const portMat = this.track(new THREE.MeshBasicMaterial({ color: 0x9aff6a }));
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const p = new THREE.Mesh(port, portMat);
        p.position.set(Math.sin(a) * R0 * 0.97, R0 * 0.36, Math.cos(a) * R0 * 0.97);
        p.rotation.y = a;
        g.add(p);
      }
      const hatch = new THREE.Mesh(this.track(new THREE.BoxGeometry(R0 * 0.22, R0 * 0.28, R0 * 0.08)), T.mat(0x5a4a3a));
      hatch.position.set(0, R0 * 0.14, R0 * 0.99);
      T.addOutline(hatch, 1.5);
      g.add(hatch);
      g.position.copy(at);
      this.scene.add(g);
      this.obstacles.push({ shape: 'sphere', x: at.x, y: at.y + R0 * 0.18, z: at.z, r: R0 * 0.8, hp: 1e9, maxHp: 1e9, alive: true, group: g, color: 0xd8cfb8 });
      this.landmarks = this.landmarks || {};
      this.landmarks.ship = at.clone();
      this.landmarks.hatch = at.clone().add(new V3(0, 0, R0 + 4));
      this.landmarks.hatch.y = this.heightAt(this.landmarks.hatch.x, this.landmarks.hatch.z);
    }

    /** The crowd on its feet: `amount` 0..1, fading on its own. */
    cheer(amount = 1) {
      if (this.crowd) this.crowd.cheer = Math.max(this.crowd.cheer, amount);
      if (this.battle && amount > 0.3) this.battle.sfx('rumble', null, { vol: 0.25 + amount * 0.3, pitch: 1.8 });
    }

    /**
     * The crowd recoiling from something it should not have seen (a neck turned all the way
     * round, a child going gold): everybody rises, leans back from the ring and goes still, and
     * a sharp intake of breath runs round the stands. `amount` 0..1, fading over a few seconds.
     */
    gasp(amount = 1) {
      if (!this.crowd) return;
      this.crowd.gasp = Math.max(this.crowd.gasp || 0, amount);
      if (this.battle) this.battle.sfx('crowdGasp', null, { vol: 0.4 + amount * 0.6 });
    }

    _updateCrowd(dt) {
      const C = this.crowd;
      if (!C || (C.cheer <= 0.01 && !(C.panic > 0.01) && !(C.gasp > 0.01) && !C.leaning)) return;
      C.t += dt;
      C.cheer = Math.max(0, C.cheer - dt * 0.35);
      // panic (a blast in the stands): a frantic, uneven scramble that dies down over a minute
      if (C.panic) C.panic = Math.max(0, C.panic - dt / 60);
      if (C.gasp) C.gasp = Math.max(0, C.gasp - dt / 4);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new V3(1, 1, 1);
      const touched = new Set();
      const lean = C.gasp || 0;
      C.leaning = lean > 0.01;
      for (const p of C.people) {
        if (p.gone) continue;
        const hop = Math.max(0, Math.sin(C.t * 9 + p.phase)) * 0.35 * C.cheer * (1 - lean) + (C.panic ? Math.abs(Math.sin(C.t * 17 + p.phase * 3)) * 0.22 * C.panic : 0) + lean * 0.14;
        // a gasp: up off the seat and back from the ring (away along the facing)
        const bx = -Math.sin(p.yaw) * lean * 0.22, bz = -Math.cos(p.yaw) * lean * 0.22;
        if (lean) q.setFromAxisAngle(new V3(Math.cos(p.yaw), 0, -Math.sin(p.yaw)), -lean * 0.32);
        else q.set(0, 0, 0, 1);
        m4.compose(new V3(p.x + bx * 0.5, p.y + 0.6 + hop, p.z + bz * 0.5), q, one);
        p.mesh.setMatrixAt(p.index, m4);
        m4.compose(new V3(p.x + bx, p.y + 1.25 + hop, p.z + bz), q, one);
        C.heads.setMatrixAt(p.head, m4);
        touched.add(p.mesh);
      }
      for (const m of touched) m.instanceMatrix.needsUpdate = true;
      C.heads.instanceMatrix.needsUpdate = true;
    }

    /**
     * Impact on the paving. The platform is stone the fight is standing on, so it
     * cracks and chips rather than denting like soil, and the damage is cumulative
     * and visible: by the end of the Cell Games the ring is a ruin.
     */
    ringCrack(pos, radius, depth) {
      const A = this.arena;
      const scale = U.clamp(radius * 1.3, 1.4, 9);
      if (this.ringCracks.length < 64) {
        const mat = this.track(new THREE.MeshBasicMaterial({ map: this._crackTex, transparent: true, opacity: U.clamp(0.25 + depth * 0.4, 0.2, 0.65), depthWrite: false }));
        const q = new THREE.Mesh(this.track(new THREE.PlaneGeometry(scale, scale)), mat);
        q.rotation.x = -Math.PI / 2;
        q.rotation.z = this.rng() * Math.PI * 2;
        q.position.set(U.clamp(pos.x, -A.half, A.half), 0, U.clamp(pos.z, -A.half, A.half));
        this.ringCrackGroup.add(q);
        this.ringCracks.push(q);
      }
      this.ringDamage = U.clamp01(this.ringDamage + radius * 0.012 + depth * 0.02);
      const at = new V3(pos.x, A.y, pos.z);
      this.battle.vfx.dust(at, Math.min(5, 0.8 + radius * 0.35), 6 + radius * 2, this.def.arena.dust);
      if (radius > 2.5) this.battle.vfx.debrisBurst(at, Math.min(16, radius * 2), this.def.arena.debris, 7 + radius, 0.18 + radius * 0.02);
      this.battle.emit('ringDamaged', { pos: at, radius, damage: this.ringDamage });
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

    /* ---------------- snake way ---------------- */
    /**
     * Snake Way: a narrow serpent road winding over a sea of clouds. The road is
     * sampled every half metre along a smooth curve; there is walkable ground only
     * on the road, anything else drops into the clouds. Heights come straight from
     * the samples (roadInfo), so the edges are exactly where the road mesh ends.
     * Gaps are short breaks where the body sinks into the clouds.
     */
    _buildSnakeWay() {
      const def = this.def, R = def.route;
      this.abyss = -60;
      const curve = new THREE.CatmullRomCurve3(R.points.map(([x, z]) => new V3(x, 0, z)), false, 'centripetal');
      const L = curve.getLength();
      const n = Math.ceil(L / 0.5);
      const pts = curve.getSpacedPoints(n);
      const step = L / n;
      const road = (this.road = {
        length: L, step, count: n + 1, cell: 3, hash: new Map(),
        x: new Float32Array(n + 1), z: new Float32Array(n + 1), y: new Float32Array(n + 1), hw: new Float32Array(n + 1),
        tx: new Float32Array(n + 1), tz: new Float32Array(n + 1), gap: new Uint8Array(n + 1),
        gaps: R.gaps.map(([f, len]) => ({ from: f * L - len / 2, to: f * L + len / 2 })),
        markers: [],
      });
      const hill = (t) => {
        let y = 0;
        for (const [a, b, h] of R.hills || []) if (t > a && t < b) y += h * Math.sin((Math.PI * (t - a)) / (b - a));
        return y;
      };
      const width = (t) => {
        let w = R.width;
        for (const [a, b, ww] of R.narrow || []) if (t >= a && t <= b) w = ww;
        return w;
      };
      for (let i = 0; i <= n; i++) {
        const s = i * step, t = s / L;
        const p = pts[i], a = pts[Math.max(0, i - 1)], c = pts[Math.min(n, i + 1)];
        const dx = c.x - a.x, dz = c.z - a.z, dl = Math.hypot(dx, dz) || 1;
        road.x[i] = p.x;
        road.z[i] = p.z;
        road.tx[i] = dx / dl;
        road.tz[i] = dz / dl;
        road.y[i] = hill(t);
        // the tail tapers over the last stretch
        road.hw[i] = (width(t) / 2) * (s > L - 14 ? U.lerp(0.62, 1, (L - s) / 14) : 1);
        road.gap[i] = road.gaps.some((gp) => s > gp.from && s < gp.to) ? 1 : 0;
        const key = this._roadKey(Math.floor(p.x / road.cell), Math.floor(p.z / road.cell));
        const list = road.hash.get(key);
        if (list) list.push(i);
        else road.hash.set(key, [i]);
      }
      for (let k = 1; k < R.markers; k++) {
        const s = (L * k) / R.markers;
        road.markers.push({ s, index: Math.round(s / step) });
      }
      this._buildRoadMesh();
      this._buildCloudSea();
      this._buildOtherWorld();
    }

    _roadKey(ix, iz) {
      return (ix + 5000) * 10000 + (iz + 5000);
    }

    /**
     * The road sample nearest to (x, z): its index, distance along the road (s),
     * sideways distance, the road height there, whether that spot is a gap, and
     * whether (x, z) is on walkable road.
     */
    roadInfo(x, z) {
      const r = this.road, c = r.cell;
      const cx = Math.floor(x / c), cz = Math.floor(z / c);
      let best = -1, bd = 1e9;
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        for (let iz = cz - 1; iz <= cz + 1; iz++) {
          const list = r.hash.get(this._roadKey(ix, iz));
          if (!list) continue;
          for (const i of list) {
            const d = (r.x[i] - x) * (r.x[i] - x) + (r.z[i] - z) * (r.z[i] - z);
            if (d < bd) {
              bd = d;
              best = i;
            }
          }
        }
      }
      if (best < 0) return { i: -1, s: 0, lateral: 1e9, y: this.abyss, gap: false, onRoad: false };
      const lateral = Math.sqrt(bd);
      return { i: best, s: best * r.step, lateral, y: r.y[best], gap: !!r.gap[best], onRoad: lateral <= r.hw[best] && !r.gap[best] };
    }

    /** Walkable height under (x, z) on Snake Way. Someone already below the road surface finds no floor there. */
    roadSupport(x, z, y) {
      const q = this.roadInfo(x, z);
      if (!q.onRoad) return this.abyss;
      if (y !== undefined && y < q.y - 1.2) return this.abyss;
      return q.y;
    }

    _buildRoadMesh() {
      const r = this.road, col = this.def.road;
      // cross-section: [fraction of the half width, height offset]; the first five points are the walkable top
      const prof = [[-1, 0], [-0.5, 0.06], [0, 0.09], [0.5, 0.06], [1, 0], [1.1, -0.55], [0.92, -1.45], [0.46, -2.05], [0, -2.25], [-0.46, -2.05], [-0.92, -1.45], [-1.1, -0.55]];
      const P = prof.length;
      const top = new THREE.Color(col.top), band = new THREE.Color(col.band), belly = new THREE.Color(col.belly), tmp = new THREE.Color();
      const mat = this.track(SL.Toon.makeMat(0xffffff, { vertexColors: true }));
      const group = new THREE.Group();
      const flush = (run) => {
        if (run.length < 2) return;
        const pos = new Float32Array(run.length * P * 3), cols = new Float32Array(run.length * P * 3), idx = [];
        run.forEach((i, k) => {
          // right-hand side of the direction of travel (fighters face +Z with their left at +X)
          const rx = -r.tz[i], rz = r.tx[i];
          const s = i * r.step;
          for (let j = 0; j < P; j++) {
            const [lf, dy] = prof[j];
            const o = (k * P + j) * 3;
            pos[o] = r.x[i] + rx * lf * r.hw[i];
            pos[o + 1] = r.y[i] + dy;
            pos[o + 2] = r.z[i] + rz * lf * r.hw[i];
            // scales: chevron bands along the back, darker belly
            tmp.copy(j < 5 ? (Math.floor(s / 2.2 + Math.abs(lf) * 0.8) % 2 ? band : top) : belly);
            cols[o] = tmp.r;
            cols[o + 1] = tmp.g;
            cols[o + 2] = tmp.b;
          }
          if (k > 0) {
            for (let j = 0; j < P; j++) {
              const a = (k - 1) * P + j, b = (k - 1) * P + ((j + 1) % P), c = k * P + j, d = k * P + ((j + 1) % P);
              idx.push(a, b, c, b, d, c);
            }
          }
        });
        const geo = this.track(new THREE.BufferGeometry());
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;
        SL.Toon.addOutline(mesh, 2);
        group.add(mesh);
      };
      let run = [];
      for (let i = 0; i < r.count; i++) {
        if (r.gap[i]) {
          flush(run);
          run = [];
        } else run.push(i);
      }
      flush(run);
      this.scene.add(group);
      this.roadMesh = group;
    }

    _buildCloudSea() {
      const col = this.def.road.cloud, rng = this.rng, r = this.road;
      const g = this.track(new THREE.PlaneGeometry(2400, 2400, 1, 1));
      g.rotateX(-Math.PI / 2);
      this.cloudSea = new THREE.Mesh(g, this.track(new THREE.MeshBasicMaterial({ color: col })));
      this.cloudSea.position.y = -16;
      this.scene.add(this.cloudSea);
      // puffs drifting below the road (kept low so they never hide the road surface)
      for (let i = 0; i < 110; i++) {
        const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: SL.Toon.tex.smoke, color: i % 3 ? col : 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })));
        const k = Math.floor(rng() * r.count);
        const off = (rng() - 0.5) * 140;
        sp.position.set(r.x[k] - r.tz[k] * off, -15 + rng() * 4, r.z[k] + r.tx[k] * off);
        sp.scale.set(24 + rng() * 40, 8 + rng() * 6, 1);
        sp.userData.speed = 0.4 + rng() * 0.8;
        this.scene.add(sp);
        this.clouds.push(sp);
      }
      for (let i = 0; i < 14; i++) {
        const sp = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: SL.Toon.tex.smoke, color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, fog: false })));
        const a = rng() * Math.PI * 2, d = 260 + rng() * 480;
        sp.position.set(Math.cos(a) * d, 140 + rng() * 90, Math.sin(a) * d);
        sp.scale.set(140 + rng() * 160, 50 + rng() * 40, 1);
        sp.userData.speed = 1 + rng() * 2;
        this.scene.add(sp);
        this.clouds.push(sp);
      }
    }

    /** King Yemma's check-in station, the serpent's head at the start and King Kai's little planet above the end. */
    _buildOtherWorld() {
      const r = this.road, T = SL.Toon;
      this.landmarks = {};
      const box = (w, h, d, color, y, z = 0) => {
        const m = new THREE.Mesh(this.track(new THREE.BoxGeometry(w, h, d)), T.mat(color));
        m.position.set(0, y, z);
        T.addOutline(m, 2.5);
        return m;
      };
      const yaw0 = Math.atan2(r.tx[0], r.tz[0]);
      const station = new THREE.Group();
      const platform = new THREE.Mesh(this.track(new THREE.CylinderGeometry(30, 34, 6, 20)), T.mat(this.def.road.cloud));
      platform.position.y = -6;
      station.add(platform, box(28, 14, 18, 0xc8402a, 4), box(29, 1.4, 19, 0xf2c84a, 9.5), box(32, 2.5, 22, 0x4a3a7a, 12.5), box(8, 9, 0.6, 0x2a1a14, 1.5, 9.1));
      station.position.set(r.x[0] - r.tx[0] * 36, -3, r.z[0] - r.tz[0] * 36);
      station.rotation.y = yaw0;
      this.scene.add(station);
      this.landmarks.palace = new V3(station.position.x, 6, station.position.z);

      // the serpent's head, looking back toward the station
      const head = new THREE.Group();
      const skin = T.mat(this.def.road.top);
      const skull = new THREE.Mesh(this.track(new THREE.SphereGeometry(1, 20, 14)), skin);
      skull.scale.set(3.4, 2.4, 4.6);
      T.addOutline(skull, 2);
      const snout = new THREE.Mesh(this.track(new THREE.SphereGeometry(1, 16, 12)), skin);
      snout.scale.set(2.6, 1.6, 2.4);
      snout.position.z = -3.6;
      T.addOutline(snout, 2);
      head.add(skull, snout);
      for (const sx of [-1, 1]) {
        const eye = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.75, 12, 10)), T.mat(0xffffff));
        eye.position.set(sx * 2.1, 1.3, -1.8);
        const pupil = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.36, 10, 8)), T.mat(0x1a1410));
        pupil.position.set(sx * 2.35, 1.4, -2.35);
        head.add(eye, pupil);
      }
      head.position.set(r.x[0] - r.tx[0] * 3.4, r.y[0] - 0.9, r.z[0] - r.tz[0] * 3.4);
      head.rotation.y = yaw0;
      this.scene.add(head);

      // King Kai's planet, hanging in the sky past the tail
      const e = r.count - 1;
      const kp = new THREE.Group();
      const ball = new THREE.Mesh(this.track(new THREE.SphereGeometry(16, 28, 20)), T.mat(0x5aa032));
      T.addOutline(ball, 3);
      const dome = new THREE.Mesh(this.track(new THREE.SphereGeometry(2.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)), T.mat(0xf4efe0));
      dome.position.y = 15.6;
      const trunk = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.4, 0.6, 4, 8)), T.mat(0x6a4a2a));
      trunk.position.set(6, 17, 2);
      const crown = new THREE.Mesh(this.track(new THREE.IcosahedronGeometry(2.4, 1)), T.mat(0x3f8a2e));
      crown.position.set(6, 20, 2);
      const glow = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xfff2b0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
      glow.scale.setScalar(70);
      kp.add(glow, ball, dome, trunk, crown);
      kp.position.set(r.x[e] + r.tx[e] * 40, 62, r.z[e] + r.tz[e] * 40);
      this.scene.add(kp);
      this.landmarks.kingKai = kp.position.clone();
    }

    /* ---------------- queries ---------------- */
    heightAt(x, z) {
      if (!this.hasGround) return -1e9;
      // the tournament platform is not in the mesh: its edge stays sharp here
      if (this.arena && this.arena.onRing(x, z)) return this.arena.y;
      if (this.road) return this.roadSupport(x, z);
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

    /**
     * Highest walkable surface under a point: terrain or the flat top of a rock spire.
     * Lets fighters stand, run and jump across spire tops (Chapter 2 platforming).
     */
    supportHeight(x, z, y) {
      let h = this.road ? this.roadSupport(x, z, y) : this.heightAt(x, z);
      for (const o of this.obstacles) {
        if (!o.alive || o.shape !== 'cyl' || o.top <= h) continue;
        if (y < o.top - 1.0) continue;
        if (Math.hypot(x - o.x, z - o.z) < o.r * 0.92) h = o.top;
      }
      return h;
    }

    /** Adds a rock spire at runtime (missions use this for set pieces). */
    addSpire(x, z, r, h) {
      const bands = (this.def.rock && this.def.rock.bands) || [0x8a7a6a];
      this._addSpire(x, z, r, h, bands, this.rng);
      return this.obstacles[this.obstacles.length - 1];
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
      // a blast that reaches the roof of a cavern bursts on the rock
      if (this.dome && this.domeOut(p, 0) > 0) return { type: 'ground' };
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
        // passable: a scripted prop somebody sits inside (the Time Machine's pilot)
        if (!pr.alive || pr.passable) continue;
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
      // under a roof of rock (the crystal cavern): the roof is the ceiling, low at the walls, high in the middle
      if (this.dome) this.keepInDome(p, 2.5, vel);
      if (p.y < this.floor) {
        p.y = this.floor;
        if (vel && vel.y < 0) vel.y = 0;
      }
      if (this.hasGround) {
        // on Snake Way someone who fell below the road is not pushed back up through it
        const gh = this.road ? this.roadSupport(p.x, p.z, p.y) : this.heightAt(p.x, p.z);
        if (p.y < gh) p.y = gh;
      }
      return p;
    }

    pushCameraOut(from, cam) {
      // never put the camera inside a giant creature's body
      for (const c of this.battle.creatures || []) {
        if (!c.alive) continue;
        const cy = c.pos.y + c.def.height * c.scale * 0.5;
        const r = c.radius * 1.9;
        const dx = cam.x - c.pos.x, dy = cam.y - cy, dz = cam.z - c.pos.z;
        const d = Math.hypot(dx, dy, dz);
        if (d < r && d > 0.001) {
          cam.x = c.pos.x + (dx / d) * r;
          cam.y = Math.max(cam.y, cy + (dy / d) * r);
          cam.z = c.pos.z + (dz / d) * r;
        }
      }
      for (const pr of this.props) {
        if (!pr.alive || pr.passable) continue;
        const d = pr.pos.distanceTo(cam);
        const minD = pr.r * 1.2 + 0.8;
        if (d < minD && d > 0.001) {
          const k = minD / d;
          cam.x = pr.pos.x + (cam.x - pr.pos.x) * k;
          cam.y = pr.pos.y + (cam.y - pr.pos.y) * k;
          cam.z = pr.pos.z + (cam.z - pr.pos.z) * k;
        }
      }
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
      // inside a cavern the lens stays under its roof: never up in the rock looking down through it
      if (this.dome) this.keepInDome(cam, 1.4);
    }

    /* ---------------- destruction ---------------- */
    crater(pos, radius, depth, fighter) {
      // Snake Way has no terrain mesh to dent
      if (!this.hasGround || !this.terrainGeo) return;
      if (this.arena && this.arena.onRing(pos.x, pos.z)) return this.ringCrack(pos, radius, depth);
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
          // a painted ground (the city streets) carries no vertex colours to scorch
          if (col && d < 1.15) {
            const k = U.clamp01((1.15 - d) * 0.8);
            col.setXYZ(i, U.lerp(col.getX(i), scorch.r, k), U.lerp(col.getY(i), scorch.g, k), U.lerp(col.getZ(i), scorch.b, k));
          }
        }
      }
      posAttr.needsUpdate = true;
      if (col) col.needsUpdate = true;
      this._normalsDirty = true;
      this.battle.emit('crater', { pos: pos.clone(), radius });
    }

    explode(pos, radius, damage, stageHit, owner) {
      if (this.hasGround) {
        const gh = this.heightAt(pos.x, pos.z);
        if (pos.y - gh < radius * 0.7) {
          const ground = new V3(pos.x, gh, pos.z);
          this.crater(ground, Math.min(14, radius * 0.55), Math.min(3, 0.15 + radius * 0.1), null);
          // on a paved ring or a stadium's yard the dust and the chips are stone, not the landscape's grass
          const Ad = this.def.arena, St = Ad && Ad.stadium;
          const paved = !!(Ad && this.arena && (this.arena.onRing(pos.x, pos.z) || (St && Math.max(Math.abs(pos.x), Math.abs(pos.z)) < St.yard)));
          this.battle.vfx.dust(ground, Math.min(6, radius * 0.4), 10 + radius * 2, paved ? Ad.dust || this.def.terrain.sand : this.def.terrain.sand);
          if (radius > 3) this.battle.vfx.debrisBurst(ground, Math.min(20, radius * 2), paved ? Ad.debris || this.def.terrain.dirt : this.def.terrain.dirt, 8 + radius, 0.2 + radius * 0.02);
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

    destroyPillar(o, opts = {}) {
      o.alive = false;
      // a quiet collapse (a ruin being dressed): the rock comes down, nothing shakes or sounds
      if (opts.quiet && o.shape === 'cyl' && o.segs && o.segs.length) {
        for (let i = 1; i < o.segs.length; i++) o.segs[i].visible = false;
        o.segs[0].scale.y = 0.45;
        o.segs[0].position.y *= 0.45;
        this.battle.emit('obstacleDestroyed', { obstacle: o, quiet: true });
        return;
      }
      const vfx = this.battle.vfx;
      // an instanced building: collapse the instance into rubble height instead of
      // hiding a group, and take its roof with it
      if (o.building) {
        const b = o.building, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3(), p = new V3();
        b.mesh.getMatrixAt(b.index, m4);
        m4.decompose(p, q, sc);
        const rubble = Math.max(1.4, sc.y * 0.12);
        m4.compose(new V3(p.x, rubble / 2, p.z), q, sc.set(sc.x * 1.08, rubble, sc.z * 1.08));
        b.mesh.setMatrixAt(b.index, m4);
        b.mesh.instanceMatrix.needsUpdate = true;
        if (b.roofs) {
          b.roofs.getMatrixAt(b.roofIndex, m4);
          m4.decompose(p, q, sc);
          m4.compose(new V3(p.x, rubble + 0.2, p.z), q, sc.set(sc.x, 0.3, sc.z));
          b.roofs.setMatrixAt(b.roofIndex, m4);
          b.roofs.instanceMatrix.needsUpdate = true;
        }
        const c = new V3(o.x, o.h * 0.4, o.z);
        for (let k = 0; k < 5; k++) vfx.debrisBurst(new V3(o.x + U.rand(-o.r, o.r), U.rand(0.3, 1) * o.h, o.z + U.rand(-o.r, o.r)), 7, o.color, 12, 0.5 + o.r * 0.1);
        vfx.dust(new V3(o.x, 1, o.z), o.r * 1.4, 18, o.color);
        vfx.explosion(c, o.r * 0.9, 0xd8a370, { life: 0.45 });
        this.battle.sfx('rockBreak', null, { at: c, vol: 1.3 });
        this.battle.cameraTraumaAt(c, 0.5);
        this.battle.emit('buildingDown', { x: o.x, z: o.z, height: o.h });
        return;
      }
      if (o.shape === 'cyl' && (!o.segs || !o.segs.length)) {
        // a solid block (the school): hide it whole
        if (o.group) o.group.visible = false;
        const c = new V3(o.x, o.h * 0.4, o.z);
        vfx.explosion(c, o.r, 0xd8a370, { life: 0.5 });
        vfx.dust(new V3(o.x, 1, o.z), o.r * 1.6, 20, o.color);
        this.battle.sfx('rockBreak', null, { at: c, vol: 1.3 });
        this.battle.cameraTraumaAt(c, 0.5);
        this.battle.emit('buildingDown', { x: o.x, z: o.z, height: o.h });
        return;
      }
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

    /** Clears the decorative boulders within r of a point (a story needs the ground clear for its staging). */
    clearBoulders(center, r) {
      const B = this.boulders;
      if (!B) return 0;
      const m4 = new THREE.Matrix4(), p = new V3(), q = new THREE.Quaternion(), sc = new V3();
      let n = 0;
      for (let i = 0; i < B.count; i++) {
        B.getMatrixAt(i, m4);
        m4.decompose(p, q, sc);
        if (sc.x < 0.01 || Math.hypot(p.x - center.x, p.z - center.z) > r) continue;
        m4.compose(p, q, sc.set(0.0001, 0.0001, 0.0001));
        B.setMatrixAt(i, m4);
        n++;
      }
      if (n) B.instanceMatrix.needsUpdate = true;
      return n;
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
      if (pr.kind === 'dragonball') {
        // a Namekian Dragon Ball (Level 1 prop): an orange glass sphere with a warm glow
        pr.lockable = false;
        pr.invulnerable = true;
        const ball = new THREE.Mesh(this.track(new THREE.SphereGeometry(pr.r, 18, 14)), SL.Toon.mat(0xffa21e));
        SL.Toon.addOutline(ball, 1);
        g.add(ball);
        const star = new THREE.Mesh(this.track(new THREE.SphereGeometry(pr.r * 0.18, 8, 6)), this.track(new THREE.MeshBasicMaterial({ color: 0xd8201a })));
        star.position.set(0, pr.r * 0.2, pr.r * 0.86);
        g.add(star);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xffb040, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        this.track(glow.material);
        glow.scale.setScalar(pr.r * 5);
        g.add(glow);
        pr.glow = glow;
      }
      if (pr.kind === 'ccship') {
        // Goku's ship from Earth (Level 1 prototype prop): a white sphere with an orange band,
        // a row of portholes, four landing legs and an engine glow underneath
        pr.lockable = false;
        pr.invulnerable = true;
        const r = pr.r;
        const hull = new THREE.Mesh(this.track(new THREE.SphereGeometry(r, 28, 18)), SL.Toon.mat(0xf2f0ea));
        SL.Toon.addOutline(hull, 2);
        g.add(hull);
        const band = new THREE.Mesh(this.track(new THREE.TorusGeometry(r * 1.005, r * 0.09, 8, 36)), SL.Toon.mat(0xf08a2a));
        band.rotation.x = Math.PI / 2;
        g.add(band);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const win = new THREE.Mesh(this.track(new THREE.SphereGeometry(r * 0.1, 10, 8)), this.track(new THREE.MeshBasicMaterial({ color: 0x9fd8ff })));
          win.position.set(Math.sin(a) * r * 0.9, r * 0.38, Math.cos(a) * r * 0.9);
          g.add(win);
        }
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const leg = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r * 0.05, r * 0.07, r * 0.9, 8)), SL.Toon.mat(0x6a6a78));
          leg.position.set(Math.sin(a) * r * 0.72, -r * 0.82, Math.cos(a) * r * 0.72);
          leg.rotation.z = Math.sin(a) * 0.35;
          leg.rotation.x = -Math.cos(a) * 0.35;
          g.add(leg);
        }
        const engine = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x8ad4ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        this.track(engine.material);
        engine.scale.setScalar(r * 2.6);
        engine.position.y = -r * 1.05;
        g.add(engine);
        pr.glow = engine;
      }
      if (pr.kind === 'friezaShip') {
        // the Cold family's ship, landed (Level 1 prototype prop): the mothership's hull on its legs,
        // scaled to stand over an army. pos is the ground under it; the group sits on its legs.
        pr.lockable = false;
        pr.invulnerable = true;
        pr.static = true;
        const k = pr.r / 42;
        const ship = this._buildShip();
        ship.scale.setScalar(k);
        ship.traverse((o) => {
          if (o.isPointLight) o.intensity = 0.3;
        });
        ship.position.y = 53 * k;
        g.add(ship);
        pr.data.height = 53 * k;
      }
      if (pr.kind === 'timeMachine') {
        // Future Trunks' Time Machine (Level 1 prototype prop): a cream capsule with a glass canopy,
        // HOPE!! and the Capsule Corp mark on its sides, four landing legs, two thrusters at the
        // back. data.open(k) swings the canopy up; data.stand is how high the body stands on its
        // legs; data.seat is where a pilot's feet go (from the group's origin)
        pr.lockable = false;
        pr.invulnerable = true;
        pr.static = true;
        const r = pr.r;
        const T = SL.Toon;
        const hull = new THREE.Mesh(this.track(new THREE.SphereGeometry(r, 28, 18)), T.mat(0xefe6c8));
        hull.scale.set(1, 0.7, 1.22);
        T.addOutline(hull, 2);
        g.add(hull);
        const band = new THREE.Mesh(this.track(new THREE.TorusGeometry(r * 1.0, r * 0.07, 8, 36)), T.mat(0xd8a43a));
        band.rotation.x = Math.PI / 2;
        band.scale.set(1, 1.22, 1);
        band.position.y = -r * 0.12;
        g.add(band);
        // the canopy hinges at the back
        const hinge = new THREE.Group();
        hinge.position.set(0, r * 0.42, -r * 0.62);
        g.add(hinge);
        const glass = new THREE.Mesh(this.track(new THREE.SphereGeometry(r * 0.74, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.5)), this.track(new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.42, depthWrite: false })));
        glass.position.set(0, 0, r * 0.62);
        glass.scale.set(1, 0.8, 1.15);
        hinge.add(glass);
        const frame = new THREE.Mesh(this.track(new THREE.TorusGeometry(r * 0.74, r * 0.045, 6, 30)), T.mat(0x6a6a74));
        frame.rotation.x = Math.PI / 2;
        frame.position.set(0, 0, r * 0.62);
        frame.scale.set(1, 1.15, 1);
        hinge.add(frame);
        const seat = new THREE.Mesh(this.track(new THREE.BoxGeometry(r * 0.6, r * 0.5, r * 0.4)), T.mat(0x3a3a44));
        seat.position.set(0, r * 0.28, -r * 0.35);
        g.add(seat);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const leg = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r * 0.06, r * 0.08, r * 1.1, 8)), T.mat(0x7a7a84));
          leg.position.set(Math.sin(a) * r * 0.8, -r * 0.78, Math.cos(a) * r * 0.9);
          leg.rotation.z = Math.sin(a) * 0.4;
          leg.rotation.x = -Math.cos(a) * 0.4;
          T.addOutline(leg, 1);
          g.add(leg);
          const pad = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r * 0.2, r * 0.22, r * 0.06, 12)), T.mat(0x5a5a64));
          pad.position.set(Math.sin(a) * r * 1.02, -r * 1.3, Math.cos(a) * r * 1.14);
          g.add(pad);
        }
        for (const sx of [1, -1]) {
          const jet = new THREE.Mesh(this.track(new THREE.CylinderGeometry(r * 0.18, r * 0.24, r * 0.5, 12)), T.mat(0x8a8a94));
          jet.rotation.x = Math.PI / 2;
          jet.position.set(sx * r * 0.45, -r * 0.05, -r * 1.25);
          T.addOutline(jet, 1);
          g.add(jet);
        }
        // HOPE!! down one side, the company mark on the other
        const print = (text, x, rot) => {
          const m = new THREE.Mesh(this.track(new THREE.PlaneGeometry(r * 0.95, r * 0.95)), this.track(new THREE.MeshBasicMaterial({ map: T.emblemTexture(text, '#1c1c24', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false })));
          m.position.set(x, r * 0.02, r * 0.1);
          m.rotation.y = rot;
          g.add(m);
        };
        print('HOPE!!', r * 1.005, Math.PI / 2);
        print('@capsule', -r * 1.005, -Math.PI / 2);
        pr.data.stand = r * 1.33;
        pr.data.seat = -r * 0.1;
        pr.data.open = (k) => (hinge.rotation.x = -1.9 * Math.max(0, Math.min(1, k)));
      }
      g.position.copy(pr.pos);
      this.scene.add(g);
      pr.group = g;
      this.props.push(pr);
      return pr;
    }

    damageProp(pr, amount, owner) {
      if (!pr.alive || pr.invulnerable) return;
      // some props only give way to a specific power (e.g. boulders that need Kaioken)
      if (pr.requireForm && !(owner && owner.form && owner.form.id === pr.requireForm)) {
        if (amount > 100) {
          this.battle.vfx.sparks(pr.pos.clone().add(new V3(0, pr.r * 0.3, 0)), 0xd8d0c0, 8, 6, 0.08);
          this.battle.emit("propResisted", { prop: pr, owner });
        }
        return;
      }
      pr.hp -= amount;
      pr.flash = 1;
      this.battle.emit('propDamaged', { prop: pr, amount, owner });
      if (pr.hp <= 0) {
        pr.alive = false;
        pr.group.visible = false;
        if (pr.rocky) {
          // shattered stone: chunks and dust instead of a fireball
          const vfx = this.battle.vfx;
          for (let k = 0; k < 14; k++) {
            const v = new V3(U.rand(-1, 1), U.rand(0.2, 1.2), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(6, 15));
            vfx.rock(pr.pos, v, U.rand(0.25, 0.6) * pr.r * 0.45, pr.debrisColor || 0x8a8478);
          }
          vfx.dust(pr.pos.clone().setY(pr.pos.y - pr.r * 0.5), pr.r * 1.4, 14, this.def.terrain.sand);
          vfx.explosion(pr.pos, pr.r * 0.9, pr.explodeColor || 0xd8c8a0, { life: 0.3 });
        } else {
          this.battle.vfx.explosion(pr.pos, pr.r * 2.2, pr.explodeColor || 0xff8040);
          this.battle.vfx.debrisBurst(pr.pos, 12, pr.debrisColor || 0xe9e6de, 12, 0.3);
        }
        this.battle.sfx('explosionBig', null, { at: pr.pos });
        this.battle.cameraTraumaAt(pr.pos, 0.45);
        this.battle.emit('propDestroyed', { prop: pr, owner });
      }
    }

    update(dt, focus) {
      if (this.crowd) this._updateCrowd(dt);
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
        if (!pr.static) pr.group.rotation.y += dt * 0.4;
        if (pr.glow) pr.glow.material.opacity = 0.6 + Math.sin(performance.now() * 0.006) * 0.3;
        if (pr.flash > 0) {
          pr.flash -= dt * 5;
          pr.group.scale.setScalar(1 + Math.max(0, pr.flash) * 0.08);
        }
      }
      for (const fn of this.ambient) fn(dt, this);
      if (this.ship) this.ship.rotation.y += dt * 0.02;
      if (focus && this.sun) {
        this.sun.target.position.copy(focus);
        this.sun.position.copy(focus).addScaledVector(this.sunDir, 140);
      }
      if (this.stars && focus) this.stars.position.copy(focus);
      this.sky.position.copy(focus || new V3());
    }

    /**
     * DEVASTATION: the field after the kind of fight that ends a landscape. Not a filter — the
     * terrain is cratered with the stage's own tool, the rock spires around the centre come down,
     * broken slabs lie where they stood, the ground is scorched, and vents keep smoking and
     * flaring (a `stage.ambient` hook). Seeded, so it is the same ruin every time, and it never
     * touches the gameplay random stream. Returns the dressing group.
     *   opts: radius (reach, 60), craters (8), slabs (14), vents (6), scorch 0..1 (0.35),
     *         fires (true), spires (true: bring down the spires inside the radius), seed
     */
    devastate(center, opts = {}) {
      if (!this.hasGround) return null;
      const R = opts.radius || 60;
      const rng = U.mulberry32(opts.seed || 90210);
      const rand = (n) => (rng() - 0.5) * n;
      const at = (r0, r1) => {
        const a = rng() * Math.PI * 2, r = r0 + rng() * (r1 - r0);
        const p = new V3(center.x + Math.cos(a) * r, 0, center.z + Math.sin(a) * r);
        p.y = this.heightAt(p.x, p.z);
        return p;
      };
      if (this.terrainGeo) for (let i = 0; i < (opts.craters === undefined ? 8 : opts.craters); i++) this.crater(at(6, R * 0.8), 4 + rng() * 7, 0.7 + rng() * 1.1, null);
      // the whole field scorched toward the stage's burn colour
      const col = this.terrainGeo && this.terrainGeo.attributes.color;
      if (col) {
        const scorch = new THREE.Color(this.def.terrain.scorch), pos = this.terrainGeo.attributes.position;
        const k0 = opts.scorch === undefined ? 0.35 : opts.scorch;
        for (let i = 0; i < col.count; i++) {
          const d = Math.hypot(pos.getX(i) - center.x, pos.getZ(i) - center.z);
          const k = k0 * U.clamp01(1.2 - d / (R * 1.6));
          if (k <= 0) continue;
          col.setXYZ(i, U.lerp(col.getX(i), scorch.r, k), U.lerp(col.getY(i), scorch.g, k), U.lerp(col.getZ(i), scorch.b, k));
        }
        col.needsUpdate = true;
      }
      if (opts.spires !== false) for (const o of this.obstacles) if (o.alive && o.segs && Math.hypot(o.x - center.x, o.z - center.z) < R) this.destroyPillar(o, { quiet: true });
      const group = new THREE.Group();
      group.name = 'devastation';
      const bands = (this.def.rock && this.def.rock.bands) || [0x6a5040];
      for (let i = 0; i < (opts.slabs === undefined ? 14 : opts.slabs); i++) {
        const p = at(8, R);
        const w = 1.4 + rng() * 3.4, h = 2 + rng() * 6;
        const slab = new THREE.Mesh(this.track(new THREE.BoxGeometry(w, h, w * 0.7)), SL.Toon.mat(bands[i % bands.length]));
        SL.Toon.addOutline(slab, 1.2);
        slab.position.copy(p).add(new V3(0, h * 0.3, 0));
        slab.rotation.set(rand(1.1), rng() * Math.PI, rand(1.1));
        slab.castShadow = true;
        group.add(slab);
      }
      this.scene.add(group);
      const vents = [];
      for (let i = 0; i < (opts.vents === undefined ? 6 : opts.vents); i++) vents.push(at(12, R * 1.1));
      let n = 0;
      const fires = opts.fires !== false;
      const ambience = () => {
        n++;
        if (!vents.length) return;
        if (n % 24 === 0) this.battle.vfx.dust(vents[(n / 24) % vents.length | 0].clone().add(new V3(0, 1.5, 0)), 4.5, 5, 0x3a3230);
        if (fires && n % 170 === 0) this.battle.vfx.explosion(vents[(n / 170) % vents.length | 0].clone().add(new V3(0, 1.2, 0)), 5, 0xff8a3a, { smoke: true, life: 0.6 });
      };
      this.ambient.push(ambience);
      this.devastated = { center: center.clone(), radius: R, group, ambience };
      if (opts.mood !== false) this.setMood(opts.moodAmount || 0.28, opts.moodColor || 0x3a1a10, 2);
      this.battle.emit('devastated', { center: center.clone(), radius: R });
      return group;
    }

    /**
     * A section of the stands hit (Majin Vegeta's blast into the crowd): every spectator within
     * `radius` of the point is gone, the seats are scorched and smoking, and the rest of the crowd
     * panics. Returns how many were in the blast.
     */
    blastStands(point, radius = 8) {
      const C = this.crowd;
      if (!C) return 0;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), zero = new V3(0, 0, 0);
      let lost = 0;
      const touched = new Set();
      for (const p of C.people) {
        if (p.gone || Math.hypot(p.x - point.x, p.z - point.z) > radius) continue;
        p.gone = true;
        lost++;
        m4.compose(new V3(p.x, p.y, p.z), q, zero);
        p.mesh.setMatrixAt(p.index, m4);
        C.heads.setMatrixAt(p.head, m4);
        touched.add(p.mesh);
      }
      for (const m of touched) m.instanceMatrix.needsUpdate = true;
      C.heads.instanceMatrix.needsUpdate = true;
      // a black scar across the seats
      const scar = new THREE.Mesh(this.track(new THREE.SphereGeometry(1, 12, 8)), SL.Toon.mat(0x1a1410));
      scar.scale.set(radius * 0.9, radius * 0.35, radius * 0.9);
      scar.position.set(point.x, point.y - radius * 0.1, point.z);
      this.scene.add(scar);
      const smoke = point.clone();
      let n = 0;
      this.ambient.push(() => {
        n++;
        if (n % 20 === 0 && n < 60 * 90) this.battle.vfx.dust(smoke.clone().add(new V3(0, 1, 0)), radius * 0.5, 4, 0x2a2420);
      });
      C.panic = 1;
      this.battle.emit('standsHit', { point: point.clone(), radius, lost });
      return lost;
    }

    dispose() {
      this.scene.fog = null;
      for (const d of this.disposables) if (d && d.dispose) d.dispose();
      this.disposables = [];
      if (this.root && this.root.parent) this.root.parent.remove(this.root);
    }
  }

  SL.Stage = Stage;
})();
