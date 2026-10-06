/*
 * Procedural character model builder.
 * PROTOTYPE ASSETS: characters are assembled from primitives with cel shading,
 * rim light and ink outlines, driven by each character's `appearance` data.
 * The rig (joint names and hierarchy) matches a standard humanoid skeleton,
 * so a future skinned glTF model can drive the same animation and gameplay.
 *
 * V0.2 additions: rim-lit materials that pick up aura color, anime eyes with
 * lash lines, highlights and blinking, teeth for shouting, fist / open /
 * pointing hand shapes, and spring-driven secondary motion for hair and belts.
 *
 * Coordinate convention: character faces +Z, character's LEFT side is +X.
 */
(function () {
  'use strict';
  const U = SL.util;

  const geoCache = new Map();
  function geo(key, make) {
    let g = geoCache.get(key);
    if (!g) {
      g = make();
      geoCache.set(key, g);
    }
    return g;
  }
  const f3 = (n) => n.toFixed(3);
  const CHEST_PTS = [[0.0, -0.07], [0.135, -0.065], [0.165, 0.0], [0.195, 0.1], [0.212, 0.19], [0.205, 0.25], [0.165, 0.3], [0.09, 0.335], [0.0, 0.345]];
  const ABS_PTS = [[0.0, -0.05], [0.118, -0.045], [0.128, 0.03], [0.134, 0.13], [0.15, 0.22], [0.0, 0.25]];
  const G = {
    sphere: () => geo('sphere', () => new THREE.SphereGeometry(1, 22, 16)),
    sphereLo: () => geo('sphereLo', () => new THREE.SphereGeometry(1, 12, 8)),
    /** Capsule hanging down from its joint. */
    limb: (r, len) =>
      geo('limb' + f3(r) + '_' + f3(len), () => {
        const l = Math.max(0.01, len - r);
        const g = new THREE.CapsuleGeometry(r, l, 5, 14);
        g.translate(0, -len / 2, 0);
        return g;
      }),
    /** Tapered tube hanging down, top at y=0. */
    tube: (rt, rb, h, open = false) =>
      geo('tube' + f3(rt) + f3(rb) + f3(h) + open, () => {
        const g = new THREE.CylinderGeometry(rt, rb, h, 16, 1, open);
        g.translate(0, -h / 2, 0);
        return g;
      }),
    cone: () =>
      geo('cone', () => {
        const g = new THREE.ConeGeometry(1, 1, 7);
        g.translate(0, 0.5, 0);
        return g;
      }),
    box: () => geo('box', () => new THREE.BoxGeometry(1, 1, 1)),
    torus: (R, r) => geo('torus' + f3(R) + f3(r), () => new THREE.TorusGeometry(R, r, 8, 28)),
    circle: () => geo('circle', () => new THREE.CircleGeometry(1, 24)),
    hemi: () => geo('hemi', () => new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)),
    /** V-tapered upper torso (chest joint space), unit width 0.2. */
    chest: () =>
      geo('chestLathe', () =>
        new THREE.LatheGeometry(CHEST_PTS.map(([r, y]) => new THREE.Vector2(r, y)), 24)
      ),
    abs: () =>
      geo('absLathe', () =>
        new THREE.LatheGeometry(ABS_PTS.map(([r, y]) => new THREE.Vector2(r, y)), 22)
      ),
  };

  const BUILD = {
    hipY: 0.98,
    pelvisW: 0.15, pelvisH: 0.115, pelvisD: 0.12,
    waistW: 0.13, waistD: 0.105, absLen: 0.2,
    chestW: 0.2, chestH: 0.165, chestD: 0.135, chestTop: 0.28,
    shoulderX: 0.205, shoulderY: 0.225, delt: 0.074,
    upperArmLen: 0.27, upperArmR: 0.057, foreArmLen: 0.25, foreArmR: 0.051, fist: 0.058,
    hipX: 0.095, thighLen: 0.43, thighR: 0.084, shinLen: 0.41, shinR: 0.066,
    neckLen: 0.075, neckR: 0.056, headR: 0.118, footLen: 1,
  };

  // the smallest hair cap that still covers the skull (its x / y / z scale in head radii, with a
  // margin so the two surfaces never fight): see setHair
  const SKULL_COVER = [1.03, 1.09, 1.05];
  // the skull's own shape in head radii (an ellipsoid, see _buildHead); painted strokes lie on it
  const SKULL = [1, 1.06, 1.02];

  const EXPRESSIONS = {
    neutral: { brow: 0.18, browY: 0, mouthH: 1, mouthW: 1, eyeH: 1, lash: 0.12 },
    angry: { brow: 0.44, browY: -0.006, mouthH: 1, mouthW: 0.85, eyeH: 0.78, lash: 0.3 },
    shout: { brow: 0.52, browY: -0.004, mouthH: 5.5, mouthW: 1.08, eyeH: 0.72, lash: 0.34, teeth: true },
    grit: { brow: 0.46, browY: -0.006, mouthH: 2.6, mouthW: 1.1, eyeH: 0.7, lash: 0.3, teeth: true },
    hurt: { brow: -0.25, browY: 0.006, mouthH: 3, mouthW: 0.8, eyeH: 0.5, lash: -0.05, teeth: true },
    smirk: { brow: 0.25, browY: 0, mouthH: 1, mouthW: 1.1, eyeH: 0.85, mouthRot: 0.18, lash: 0.16 },
    grin: { brow: 0.02, browY: 0.004, mouthH: 2.4, mouthW: 1.25, eyeH: 0.55, lash: 0.0, teeth: true },
    calm: { brow: 0.05, browY: 0.003, mouthH: 1, mouthW: 0.9, eyeH: 0.9, lash: 0.08 },
    ko: { brow: -0.3, browY: 0.004, mouthH: 2, mouthW: 0.7, eyeH: 0.12, lash: -0.1 },
    // wide eyes, raised brows, lips parted: something just became clear
    shock: { brow: -0.2, browY: 0.008, mouthH: 1.8, mouthW: 0.8, eyeH: 1.15, lash: -0.1 },
    // sorry, not hurt: inner brows up, eyes lowered, a small mouth turned down at the corners
    sad: { brow: -0.34, browY: 0.007, mouthH: 0.75, mouthW: 0.8, eyeH: 0.55, mouthRot: -0.14, lash: -0.06 },
    // Majin (Vegeta under the mark): brows driven down hard, eyes narrowed, a sneer with the teeth showing
    majin: { brow: 0.58, browY: -0.009, mouthH: 2.1, mouthW: 1.18, eyeH: 0.6, mouthRot: 0.14, lash: 0.4, teeth: true },
    // a small, quiet smile (prototype: the rig has no smile shape; softened eyes and brows, a slight lift of the mouth)
    soft: { brow: -0.12, browY: 0.004, mouthH: 0.8, mouthW: 1.16, eyeH: 0.6, mouthRot: 0.1, lash: -0.02 },
    // Vegito: lids half down, brows level and low, the mouth pulled up at one corner — bored of you
    cocky: { brow: 0.34, browY: -0.003, mouthH: 1.1, mouthW: 1.15, eyeH: 0.66, mouthRot: 0.26, lash: 0.22 },
    // Buuhan: brows hard down, a wide grin with every tooth in it
    wicked: { brow: 0.54, browY: -0.008, mouthH: 2.3, mouthW: 1.32, eyeH: 0.6, mouthRot: 0.08, lash: 0.38, teeth: true },
    // stage fright (Uub at the tournament): inner brows pulled up hard, eyes wide, a small tight mouth turned down
    nervous: { brow: -0.4, browY: 0.009, mouthH: 0.6, mouthW: 0.72, eyeH: 1.08, mouthRot: -0.1, lash: -0.12 },
    // reading the fight: brows level and low, eyes narrowed to a line, the mouth shut
    focused: { brow: 0.3, browY: -0.004, mouthH: 0.8, mouthW: 0.86, eyeH: 0.62, lash: 0.26 },
    // no more playing: brows down, eyes level and hard, the mouth flat and a little down
    serious: { brow: 0.38, browY: -0.005, mouthH: 0.9, mouthW: 0.95, eyeH: 0.74, mouthRot: -0.05, lash: 0.3 },
    // spent: the brows slide up, the lids come down, the mouth hangs open for air
    exhausted: { brow: -0.18, browY: 0.004, mouthH: 2.4, mouthW: 0.82, eyeH: 0.46, lash: -0.04 },
    // eyes shut and calm, the face at rest (a fusion standing in the smoke before he looks up)
    closed: { brow: 0.1, browY: 0, mouthH: 0.8, mouthW: 0.9, eyeH: 0.06, lash: 0.12 },
    // made up his mind (Uub stepping up): brows down and together, eyes WIDE open, the jaw set
    determined: { brow: 0.4, browY: -0.004, mouthH: 0.9, mouthW: 0.82, eyeH: 1.04, mouthRot: -0.04, lash: 0.3 },
  };

  class Spring {
    constructor(stiff = 60, damp = 9) {
      this.x = 0;
      this.v = 0;
      this.stiff = stiff;
      this.damp = damp;
    }
    step(target, dt) {
      const a = (target - this.x) * this.stiff - this.v * this.damp;
      this.v += a * dt;
      this.x += this.v * dt;
      return this.x;
    }
  }

  class Model {
    constructor(def) {
      this.def = def;
      this.app = def.appearance;
      this.b = Object.assign({}, BUILD, this.app.build || {});
      this.root = new THREE.Group();
      this.root.name = 'model:' + def.id;
      this.pivot = new THREE.Group();
      this.root.add(this.pivot);
      this.joints = {};
      this.mats = new Map();
      this.outlines = [];
      this.hairGroups = {};
      this.face = {};
      this.hands = {};
      this.cloth = [];
      this.flashAmount = 0;
      this.tintColor = new THREE.Color(0, 0, 0);
      this.tintAmount = 0;
      this.formScale = 1;
      this.currentHair = null;
      this.hairSwayX = new Spring(70, 8);
      this.hairSwayZ = new Spring(70, 8);
      this.blinkTimer = 1 + Math.random() * 3;
      this.blinkT = 0;
      this.expr = EXPRESSIONS.neutral;
      this.rimColor = new THREE.Color(0xfff4e6);
      this.rimStrength = 0.28;
      this._build();
      this.baseScale = this.app.height || 1;
      this.root.scale.setScalar(this.baseScale);
      this.setOutlines(SL.Settings.data.graphics.outlines);
    }

    mat(color, opts = {}) {
      const key = color + (opts.basic ? 'b' : '') + (opts.opacity || '') + (opts.map ? opts.map.uuid : '');
      let m = this.mats.get(key);
      if (!m) {
        if (opts.basic) {
          m = new THREE.MeshBasicMaterial({ color, transparent: !!opts.opacity || !!opts.map, opacity: opts.opacity || 1, map: opts.map || null, depthWrite: !opts.opacity });
          m.userData.basic = true;
        } else {
          m = SL.Toon.makeMat(color, { rim: { color: this.rimColor.getHex(), strength: this.rimStrength } });
          m.userData.baseEmissive = new THREE.Color(0, 0, 0);
          if (color === this.app.skin) m.userData.skin = true;
        }
        this.mats.set(key, m);
      }
      return m;
    }

    add(parent, geometry, color, o = {}) {
      const mesh = new THREE.Mesh(geometry, color && color.isMaterial ? color : this.mat(color, o));
      if (o.pos) mesh.position.set(o.pos[0], o.pos[1], o.pos[2]);
      if (o.rot) mesh.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
      if (o.scale) {
        if (typeof o.scale === 'number') mesh.scale.setScalar(o.scale);
        else mesh.scale.set(o.scale[0], o.scale[1], o.scale[2]);
      }
      mesh.castShadow = o.shadow !== false;
      if (o.name) mesh.name = o.name;
      const ow = o.outline === undefined ? 1 : o.outline;
      if (ow && !o.basic) this.outlines.push(SL.Toon.addOutline(mesh, ow));
      parent.add(mesh);
      return mesh;
    }

    joint(name, parent, x, y, z) {
      const j = new THREE.Group();
      j.name = name;
      j.position.set(x, y, z);
      parent.add(j);
      this.joints[name] = j;
      return j;
    }

    _build() {
      const b = this.b;
      const a = this.app;
      const o = a.outfit || {};
      const skin = a.skin;
      const top = o.top !== undefined ? o.top : skin;
      const pants = o.pants !== undefined ? o.pants : top;
      const J = (n, p, x, y, z) => this.joint(n, p, x, y, z);
      const S = G.sphere();

      this.pivot.position.y = b.hipY;
      const hips = J('hips', this.pivot, 0, 0, 0);
      const spine = J('spine', hips, 0, 0.08, 0);
      const chest = J('chest', spine, 0, b.absLen, 0);
      const neck = J('neck', chest, 0, b.chestTop, 0);
      const head = J('head', neck, 0, b.neckLen, 0);

      // torso
      const baggy = o.pantsStyle === 'gi';
      this.add(hips, S, pants, { pos: [0, -0.02, 0], scale: [b.pelvisW * (baggy ? 1.08 : 1), b.pelvisH, b.pelvisD * (baggy ? 1.1 : 1)] });
      // the gi is tracked so a story state can tear it off (see setTorn); the belly band stays
      // on unless the outfit's `torn` look says otherwise
      this.gi = { torso: [], trim: [], sleeves: [], abs: null, trap: null };
      // a loose top (outfit.loose, e.g. 1.14): the shirt stands off the body — Videl's oversized T-shirt
      const loose = (this._loose = o.loose || 1);
      const absMesh = this.add(spine, G.abs(), o.abs !== undefined ? o.abs : top, { pos: [0, 0, 0], scale: [(b.waistW / 0.13) * loose, b.absLen / 0.2, (b.waistD / 0.13) * 0.95 * loose] });
      this.absMesh = absMesh;
      if (o.topStyle === 'gi') this.gi.abs = absMesh;
      this.chestMesh = this.add(chest, G.chest(), top, { pos: [0, 0, 0.004], scale: [(b.chestW / 0.2) * loose, 1, (b.chestD / 0.2) * 1.02 * loose] });
      // a round belly out in front of the waist (Majin Buu): outfit.belly = its colour, or true for skin
      if (o.belly) this.bellyMesh = this.add(spine, S, o.belly === true ? skin : o.belly, { pos: [0, 0.07, b.waistD * 0.28], scale: [b.waistW * 1.02, b.absLen * 0.78, b.waistD * 1.02] });
      if (o.topStyle === 'gi') this.gi.torso.push(this.chestMesh);
      // a woman's chest (build.bust, about 1): two soft forms on the front of the chest in the top's
      // colour, part of the top (they recolour and tear with it)
      if (b.bust) {
        const k = b.bust, sx = (b.chestW / 0.2) * loose, dz = (b.chestD / 0.2) * loose;
        this.bust = [];
        for (const s2 of [1, -1]) this.bust.push(this.add(chest, S, top, { pos: [s2 * 0.064 * sx, 0.17, 0.212 * dz * 0.86], scale: [0.05 * k * sx, 0.044 * k, 0.042 * k], outline: 0.5 }));
        if (o.topStyle === 'gi') this.gi.torso.push(...this.bust);
      }
      if (o.topStyle === 'bare' || o.pecs) {
        const pc = o.pecs || skin;
        for (const s of [1, -1]) this.add(chest, S, pc, { pos: [s * 0.075, 0.16, b.chestD * 0.62], scale: [0.075, 0.055, 0.045], outline: 0.4 });
      }
      this.add(neck, G.limb(b.neckR, b.neckLen + 0.05), skin, { pos: [0, b.neckLen + 0.04, 0], outline: 0.7 });
      // trapezius gives a heavier, more heroic neck line
      const trapMesh = this.add(chest, S, o.topStyle === 'gi' && o.under !== undefined ? o.under : top, { pos: [0, b.chestTop - 0.035, -0.01], scale: [b.chestW * 0.55, 0.05, b.chestD * 0.62], outline: 0.5 });
      // what a form's look.muscle thickens (Majin Vegeta's heavier arms and legs): see setForm
      const girth = (this.girth = []);
      const grow = (m, y) => (m && girth.push({ mesh: m, x: m.scale.x, y: m.scale.y, z: m.scale.z, gy: y || 0 }), m);
      grow(trapMesh, 0.6);
      if (o.topStyle === 'gi') {
        this.gi.torso.push(trapMesh);
        this.gi.trap = trapMesh;
      }

      // gi specifics
      if (o.topStyle === 'gi') {
        if (o.under !== undefined) {
          // V-neck: undershirt diamond sunk into the sloped top of the chest, framed by the gi lapels.
          // `neck` deepens and widens it (the Cell and Buu era gi cut lower than the Saiyan one)
          const dz = b.chestD / 0.14;
          // (t = 0 at the Saiyan cut, 1 at neck 1.35; tuned by eye so every piece stays on the chest surface)
          const t = ((o.neck || 1) - 1) / 0.35;
          this.gi.trim.push(this.add(chest, G.box(), o.under, { pos: [0, 0.3 - 0.015 * t, (0.118 + 0.01 * t) * dz], rot: [-0.62 + 0.12 * t, 0, Math.PI / 4], scale: [0.1 * (1 + 0.3 * t), 0.1 * (1 + 0.3 * t), 0.014], outline: 0.4 }));
          for (const s of [1, -1]) this.gi.trim.push(this.add(chest, G.box(), top, { pos: [s * (0.042 + 0.008 * t), 0.272 - 0.01 * t, (0.136 + 0.007 * t) * dz], rot: [-0.5 + 0.08 * t, -s * 0.1, -s * 0.46], scale: [0.03, 0.15 + 0.04 * t, 0.016], outline: 0.5 }));
        }
        if (o.belt !== undefined) {
          const belt = this.add(spine, G.torus(1, 0.2), o.belt, { pos: [0, -0.005, 0], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.02, b.waistD * 1.08, 0.13], outline: 0.6 });
          belt.castShadow = false;
          this.add(spine, G.box(), o.belt, { pos: [0.02, -0.02, b.waistD * 1.12], scale: [0.05, 0.04, 0.03], outline: 0.5 });
          const tails = new THREE.Group();
          tails.position.set(0.028, -0.035, b.waistD * 1.12);
          spine.add(tails);
          this.add(tails, G.box(), o.belt, { pos: [0.004, -0.055, 0], rot: [0, 0, -0.18], scale: [0.028, 0.11, 0.012], outline: 0.5 });
          this.add(tails, G.box(), o.belt, { pos: [0.026, -0.048, -0.004], rot: [0, 0, -0.42], scale: [0.024, 0.095, 0.012], outline: 0.5 });
          this.cloth.push({ node: tails, sx: new Spring(40, 5), sz: new Spring(40, 5), amount: 1.6 });
        }
      }
      // a plain belt on trousers (casual clothes); a gi's sash is the knotted one above
      if ((o.beltStyle === 'belt' || o.beltStyle === 'sash') && o.belt !== undefined) {
        // 'belt': a strap with a buckle on trousers; 'sash': a wide cloth band (over armor when there is some)
        const sash = o.beltStyle === 'sash', over = o.armor ? 1.14 : 1;
        this.add(spine, G.torus(1, sash ? 0.3 : 0.2), o.belt, { pos: [0, sash ? 0.0 : -0.02, 0], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.03 * over, b.waistD * 1.07 * over, sash ? 0.2 : 0.1], outline: 0.5, shadow: false });
        if (!sash) this.add(spine, G.box(), o.buckle !== undefined ? o.buckle : 0xc8b070, { pos: [0, -0.02, b.waistD * 1.06], scale: [0.034, 0.026, 0.012], outline: 0.4 });
        // a knot at one hip with two long tails hanging past the thigh (the Metamoran sash):
        // sashTails = { len (metres, default 0.34), side (1 his left, -1 his right) }
        if (sash && o.sashTails) {
          const st = o.sashTails, sd = st.side === undefined ? 1 : st.side, len = st.len || 0.34;
          // outside the trousers' bulge at the hip (a gi's seat is wider than the waist)
          const knotAt = [sd * Math.max(b.waistW * 0.95, b.pelvisW * (o.pantsStyle === 'gi' ? 1.02 : 0.9)), -0.015, b.waistD * 0.62];
          this.add(spine, S, o.belt, { pos: knotAt, scale: [0.046, 0.04, 0.04], outline: 0.5, shadow: false });
          const tails = new THREE.Group();
          tails.position.set(knotAt[0] + sd * 0.012, knotAt[1] - 0.02, knotAt[2]);
          spine.add(tails);
          this.add(tails, G.box(), o.belt, { pos: [sd * 0.014, -len * 0.5, 0.008], rot: [0.06, 0, sd * 0.1], scale: [0.084, len, 0.018], outline: 0.5 });
          this.add(tails, G.box(), o.belt, { pos: [sd * 0.046, -len * 0.42, -0.01], rot: [-0.04, 0.2 * sd, sd * 0.24], scale: [0.07, len * 0.84, 0.018], outline: 0.5 });
          this.cloth.push({ node: tails, sx: new Spring(28, 4), sz: new Spring(28, 4), amount: 2.2 });
        }
        // a buckle with a coloured centre (Future Trunks' red on white)
        if (!sash && o.buckleCore !== undefined) this.add(spine, G.box(), o.buckleCore, { pos: [0, -0.02, b.waistD * 1.06 + 0.007], scale: [0.02, 0.014, 0.006], outline: 0, shadow: false });
      }
      // a cloth panel hanging from the belt, in front (and behind with apron.back): Beerus' tabard.
      // apron = { color, trim, len (metres, default 0.3), width (default 0.11), back }
      if (o.apron) {
        const ap = o.apron, len = ap.len || 0.3, w = ap.width || 0.11;
        for (const side of ap.back ? [1, -1] : [1]) {
          const g = new THREE.Group();
          g.position.set(0, -0.03, side * b.waistD * (o.pantsStyle === 'gi' ? 1.3 : 1.1)); // outside a gi's baggy front
          spine.add(g);
          this.add(g, G.box(), ap.color, { pos: [0, -len / 2, side * 0.008], rot: [side * 0.06, 0, 0], scale: [w, len, 0.014], outline: 0.5 });
          if (ap.trim !== undefined) this.add(g, G.box(), ap.trim, { pos: [0, -len + 0.014, side * 0.011], rot: [side * 0.06, 0, 0], scale: [w * 1.04, 0.026, 0.016], outline: 0.4, shadow: false });
          this.cloth.push({ node: g, sx: new Spring(30, 4), sz: new Spring(30, 4), amount: 1.6 });
        }
      }
      if (o.emblem) {
        // a gi's marks: `front` on the left breast, `back` large between the shoulders (either
        // may be null); `text` is the older single mark used for both. Over armor they sit on the plate.
        const e = o.emblem;
        const front = e.front !== undefined ? e.front : e.text;
        const back = e.back !== undefined ? e.back : e.frontOnly ? null : e.text;
        const lift = o.armor ? 1.2 : 1;
        const em = (t) => this._emblemMat(t, e);
        this.emblems = [];
        if (front && e.center) this.emblems.push(this.add(chest, G.circle(), em(front), { pos: [0, 0.1, b.chestD * lift + 0.01], rot: [-0.1, 0, 0], scale: e.center, outline: 0, shadow: false, name: 'emblem:front' }));
        else if (front) this.emblems.push(this.add(chest, G.circle(), em(front), { pos: [0.085, 0.17, b.chestD * 0.93 * lift + 0.006], rot: [-0.18, 0.42, 0], scale: 0.036, outline: 0, shadow: false, name: 'emblem:front' }));
        if (back) this.emblems.push(this.add(chest, G.circle(), em(back), { pos: [0, 0.15, -b.chestD * lift - 0.012], rot: [0.1, Math.PI, 0], scale: 0.07, outline: 0, shadow: false, name: 'emblem:back' }));
        // a gi's marks are sewn on the gi: when the fight tears it off, they go with it
        if (o.topStyle === 'gi') this.gi.trim.push(...this.emblems);
      }

      // armor
      if (o.armor) this._buildArmor(chest, spine, hips, o.armor);
      if (o.jacket) this._buildJacket(chest, spine, o.jacket);
      // padded shoulders on a vest (the Metamoran vest's gold pads): on the chest, so they stay put
      // while the arms move under them
      if (o.shoulderPads !== undefined) for (const s of [1, -1]) this.add(chest, S, o.shoulderPads, { pos: [s * b.shoulderX * 1.02, b.shoulderY + 0.012, -0.004], scale: [b.delt * 1.4, b.delt * 0.82, b.delt * 1.32], outline: 0.7, name: 'pad' });
      if (o.paddedCollar) this._buildPaddedCollar(chest, o.paddedCollar);
      if (o.strap) this._buildStrap(chest, o.strap);
      if (o.collar !== undefined) this._buildCollar(chest, o);
      if (o.tail) this._buildTail(spine, hips, o);
      if (o.cape !== undefined) this._buildCape(chest, o.cape);

      // arms
      for (const s of [1, -1]) {
        const side = s > 0 ? 'L' : 'R';
        const sh = J('shoulder' + side, chest, s * b.shoulderX, b.shoulderY, -0.01);
        const el = J('elbow' + side, sh, 0, -b.upperArmLen, 0);
        const hand = J('hand' + side, el, 0, -b.foreArmLen, 0);
        const sleeves = o.sleeves || 'none';
        const sleeveColor = o.sleeveColor !== undefined ? o.sleeveColor : o.under !== undefined ? o.under : top;
        const upperColor = sleeves === 'long' ? sleeveColor : o.arms !== undefined ? o.arms : skin;
        const deltColor = sleeves === 'none' ? (o.arms !== undefined ? o.arms : skin) : sleeveColor;
        grow(this.add(sh, S, deltColor, { pos: [s * 0.01, -0.01, 0], scale: [b.delt * 1.05, b.delt, b.delt * 1.02] }), 0.6);
        // long sleeves can be loose cloth (sleeveBulk), wider than the arm inside them
        const bulk = sleeves === 'long' ? o.sleeveBulk || 1 : 1;
        const upperArm = grow(this.add(sh, G.limb(b.upperArmR * bulk, b.upperArmLen), upperColor, {}));
        if (sleeves === 'long') (this.sleeveMeshes = this.sleeveMeshes || []).push(upperArm);
        // bicep bulge
        if (sleeves !== 'long') grow(this.add(sh, S, upperColor, { pos: [0, -b.upperArmLen * 0.45, 0.012], scale: [b.upperArmR * 1.02, b.upperArmLen * 0.28, b.upperArmR * 1.12], outline: 0.4 }));
        if (sleeves === 'short') {
          const sl = this.add(sh, G.tube(b.upperArmR * 1.35, b.upperArmR * 1.22, b.upperArmLen * 0.42), sleeveColor, { pos: [0, 0.02, 0], outline: 0.8 });
          sl.userData.side = side;
          this.gi.sleeves.push(sl);
        }
        const foreColor = sleeves === 'long' ? sleeveColor : o.arms !== undefined ? o.arms : skin;
        const foreArm = grow(this.add(el, G.limb(b.foreArmR * (1 + (bulk - 1) * 0.8), b.foreArmLen), foreColor, {}));
        if (sleeves === 'long') this.sleeveMeshes.push(foreArm);
        if (o.gloves !== undefined && o.gloves !== null) {
          this.add(el, G.tube(b.foreArmR * 1.22, b.foreArmR * 1.12, b.foreArmLen * 0.55), o.gloves, { pos: [0, -b.foreArmLen * 0.45, 0], outline: 0.8 });
        }
        if (o.wrist !== undefined && o.wrist !== null) {
          // wristLen: a longer guard up the forearm (Bardock's), ending at the same place at the wrist
          const wl = o.wristLen || 0.085;
          this.add(el, G.tube(b.foreArmR * 1.3, b.foreArmR * 1.24, wl), o.wrist, { pos: [0, -b.foreArmLen * 0.7 - (0.085 - wl), 0], outline: 0.8 });
        }
        const handColor = o.gloves !== undefined && o.gloves !== null ? o.gloves : skin;
        // fingerless gloves (Videl's): the glove is the palm and the back of the hand, the fingers are bare
        this._buildHand(hand, s, handColor, side, o.fingerless ? skin : handColor);
      }
      if (o.emblem && o.emblem.sleeve) {
        // a patch on the outside of the left upper arm, over the sleeve
        const bulk = o.sleeves === 'long' ? o.sleeveBulk || 1 : 1;
        this.emblems = this.emblems || [];
        this.emblems.push(this.add(this.joints.shoulderL, G.circle(), this._emblemMat(o.emblem.sleeve, o.emblem), { pos: [b.upperArmR * bulk + 0.004, -b.upperArmLen * 0.32, 0.004], rot: [0, Math.PI / 2, 0], scale: 0.042, outline: 0, shadow: false, name: 'emblem:sleeve' }));
      }

      // legs
      for (const s of [1, -1]) {
        const side = s > 0 ? 'L' : 'R';
        const th = J('thigh' + side, hips, s * b.hipX, -0.05, 0);
        const kn = J('knee' + side, th, 0, -b.thighLen, 0);
        const ft = J('foot' + side, kn, 0, -b.shinLen, 0);
        const pw = baggy ? 1.38 : 1;
        grow(this.add(th, G.limb(b.thighR * pw, b.thighLen), pants, {}));
        if (baggy) this.add(kn, G.tube(b.shinR * 1.55, b.shinR * 1.15, b.shinLen * 0.6), pants, { pos: [0, 0.03, 0] });
        else this.add(kn, G.limb(b.shinR, b.shinLen), o.legs !== undefined ? o.legs : pants, {});
        const boots = o.boots !== undefined ? o.boots : 0x333333;
        const bootTop = o.bootStyle === 'saiyan' ? 0.62 : o.bootStyle === 'shoe' ? 0.16 : 0.5;
        this.add(kn, G.tube(b.shinR * 1.32, b.shinR * 1.12, b.shinLen * bootTop + 0.03), boots, { pos: [0, -b.shinLen * (1 - bootTop), 0] });
        if (o.bootTrim !== undefined) this.add(kn, G.tube(b.shinR * 1.38, b.shinR * 1.36, 0.028), o.bootTrim, { pos: [0, -b.shinLen * (1 - bootTop) + 0.012, 0], outline: 0.6 });
        // a sock showing over the top of the boot (Videl's)
        if (o.socks !== undefined) this.add(kn, G.tube(b.shinR * 1.2, b.shinR * 1.17, 0.07), o.socks, { pos: [0, -b.shinLen * (1 - bootTop) + 0.062, 0], outline: 0.6 });
        if (o.legBands !== undefined) this.add(kn, G.tube(b.shinR * 1.18, b.shinR * 1.16, 0.05), o.legBands, { pos: [0, -0.06, 0], outline: 0.6 });
        const fl = b.footLen;
        // outfit.shoes: the foot in its own colour under wraps or a boot shaft (Gogeta's black shoes under blue wraps)
        this.add(ft, S, o.shoes !== undefined ? o.shoes : boots, { pos: [0, -0.045, 0.04 * fl], scale: [0.068, 0.056, 0.13 * fl] });
        if (o.bootTip !== undefined) this.add(ft, S, o.bootTip, { pos: [0, -0.05, 0.12 * fl], scale: [0.06, 0.05, 0.056], outline: 0.7 });
        // a thick sole in its own colour (Future Trunks' brown treads under yellow boots)
        if (o.bootSole !== undefined) this.add(ft, S, o.bootSole, { pos: [0, -0.088, 0.04 * fl], scale: [0.07, 0.022, 0.134 * fl], outline: 0.6 });
      }

      // a long, living tail made of jointed segments (joints tail0..tailN for hit zones)
      if (o.longTail) this._buildLongTail(hips, o.longTail);
      // a long shirt worn out over the hips (Videl's oversized T-shirt): cloth hanging from the waist,
      // split front and back so each half lifts with the leg that goes that way (tick)
      if (o.hem) this._buildHem(hips, o.hem, top);

      // spots on the body (Cell's black spots), and wings folded down the back like the tails of a coat
      if (a.decals) this._buildDecals(a.decals);
      if (a.wings) this._buildWings(chest, a.wings);

      // props held in a hand or worn on the body (a katana, a scabbard): primitives on a joint
      this.props = {};
      for (const pr of a.props || []) if (!(o.noSword && (pr.id === 'sword' || pr.id === 'scabbard'))) this._buildProp(pr);

      this._buildHead(head);
      this.setExpression('neutral');
      // an outfit can arrive already worn: dirt, and cracks in the plate (a costume, not a story beat)
      if (o.worn) this.setWorn(true);
      if (o.armorDamage) this.damageArmor(o.armorDamage);
      // lost in a fight long ago (Future Gohan): the arm is gone below the shoulder
      if (a.missingArm && this.joints['elbow' + a.missingArm]) this.joints['elbow' + a.missingArm].scale.setScalar(0.001);
      // an alternate costume that is already torn (a battle-damaged outfit on the wardrobe)
      if (o.startDamage) {
        this.setDamage(o.startDamage);
        this.setWorn(true);
        if (o.startDamage >= (o.damage && o.damage.tearAt !== undefined ? o.damage.tearAt : 2)) this.setTorn(true);
      }
    }

    /**
     * A prop on a joint. Shapes: 'katana' (grip, guard, blade along the prop's +Y),
     * 'scabbard' (sheathed sword worn on the back). pos/rot place it in joint space.
     */
    _buildProp(pr) {
      const parent = this.joints[pr.joint];
      if (!parent) return;
      const g = new THREE.Group();
      g.name = 'prop:' + pr.id;
      if (pr.pos) g.position.set(pr.pos[0], pr.pos[1], pr.pos[2]);
      if (pr.rot) g.rotation.set(pr.rot[0], pr.rot[1], pr.rot[2]);
      if (pr.scale) g.scale.setScalar(pr.scale);
      parent.add(g);
      const L = pr.length || 0.78;
      if (pr.shape === 'katana') {
        this.add(g, G.tube(0.017, 0.017, 0.24), pr.grip || 0x2b1d18, { pos: [0, 0.07, 0], outline: 0.5 });
        this.add(g, G.tube(0.05, 0.05, 0.014), pr.guard || 0x8a7040, { pos: [0, 0.084, 0], outline: 0.5 });
        const blade = this.add(g, G.box(), pr.blade || 0xdfe6ee, { pos: [0, 0.084 + L / 2, 0], scale: [0.03, L, 0.009], outline: 0.5 });
        this.add(g, G.cone(), pr.blade || 0xdfe6ee, { pos: [0, 0.084 + L, 0], scale: [0.015, 0.05, 0.0045], outline: 0.5 });
        blade.userData.blade = true;
      } else if (pr.shape === 'scabbard') {
        this.add(g, G.tube(0.024, 0.02, L), pr.color || 0x3a2a20, { pos: [0, L / 2, 0], outline: 0.6 });
        this.add(g, G.tube(0.018, 0.018, 0.22), pr.grip || 0x2b1d18, { pos: [0, L / 2 + 0.24, 0], outline: 0.5 });
      } else if (pr.shape === 'broadsword') {
        // a straight, broad, single-edged sword: a long wrapped grip, a squared guard, a pommel
        this.add(g, G.tube(0.017, 0.017, 0.22), pr.grip || 0x2a2428, { pos: [0, 0.07, 0], outline: 0.5 });
        this.add(g, G.sphereLo(), pr.pommel || pr.guard || 0x8a7040, { pos: [0, -0.158, 0], scale: 0.024, outline: 0.4 });
        this.add(g, G.box(), pr.guard || 0x8a7040, { pos: [0, 0.084, 0], scale: [0.13, 0.024, 0.042], outline: 0.5 });
        const blade = this.add(g, G.box(), pr.blade || 0xdfe6ee, { pos: [0, 0.096 + L / 2, 0], scale: [0.05, L, 0.011], outline: 0.5 });
        this.add(g, G.cone(), pr.blade || 0xdfe6ee, { pos: [0, 0.096 + L, 0], scale: [0.025, 0.07, 0.0055], outline: 0.5 });
        blade.userData.blade = true;
        g.userData.tip = 0.096 + L + 0.06;
      } else if (pr.shape === 'sheath') {
        // worn on the back: the sheath, a metal throat and tip, and (while the sword is in it) the hilt
        this.add(g, G.tube(0.03, 0.026, L), pr.color || 0x3a2c28, { pos: [0, L / 2, 0], outline: 0.6 });
        this.add(g, G.tube(0.034, 0.034, 0.05), pr.trim || 0x8a7040, { pos: [0, L / 2, 0], outline: 0.5 });
        this.add(g, G.tube(0.03, 0.02, 0.06), pr.trim || 0x8a7040, { pos: [0, -L / 2 + 0.06, 0], outline: 0.5 });
        const hilt = new THREE.Group();
        hilt.position.set(0, L / 2, 0);
        g.add(hilt);
        this.add(hilt, G.box(), pr.guard || 0x8a7040, { pos: [0, 0.014, 0], scale: [0.13, 0.024, 0.042], outline: 0.5 });
        this.add(hilt, G.tube(0.017, 0.017, 0.22), pr.grip || 0x2a2428, { pos: [0, 0.246, 0], outline: 0.5 });
        this.add(hilt, G.sphereLo(), pr.guard || 0x8a7040, { pos: [0, 0.262, 0], scale: 0.024, outline: 0.4 });
        hilt.visible = false;
        g.userData.hilt = hilt;
      } else if (pr.shape === 'glasses') {
        // round dark lenses and a thin bridge (Master Roshi's, on somebody else's face)
        for (const sx of [1, -1]) this.add(g, G.sphereLo(), pr.color || 0x16161a, { pos: [sx * 0.046, 0, 0], scale: [0.036, 0.028, 0.01], outline: 0.4, shadow: false });
        this.add(g, G.box(), pr.frame || 0x6a4a2a, { pos: [0, 0.006, 0.002], scale: [0.03, 0.006, 0.006], outline: 0, shadow: false });
      } else if (pr.shape === 'bottle') {
        this.add(g, G.tube(0.016, 0.016, 0.07), pr.color || 0xe8f0f4, { pos: [0, 0.035, 0], outline: 0.4 });
        this.add(g, G.tube(0.011, 0.011, 0.018), pr.cap || 0xd83a30, { pos: [0, 0.052, 0], outline: 0.3 });
      } else if (pr.shape === 'drainer') {
        // Yamu's siphon: a grip, a glass canister that fills with the light it takes (setPropFill),
        // metal collars, and a long needle along the prop's +Y
        const metal = pr.metal || 0x8a8a94;
        this.add(g, G.tube(0.022, 0.022, 0.12), pr.grip || 0x3a3440, { pos: [0, 0.06, 0], outline: 0.5 });
        this.add(g, G.tube(0.054, 0.054, 0.02), metal, { pos: [0, 0.08, 0], outline: 0.5 });
        const glassMat = new THREE.MeshBasicMaterial({ color: pr.glass || 0xcfeeff, transparent: true, opacity: 0.5, depthWrite: false });
        this.add(g, G.tube(0.048, 0.048, 0.2), glassMat, { pos: [0, 0.28, 0], outline: 0.4, shadow: false });
        const fill = new THREE.Group();
        fill.position.set(0, 0.08, 0);
        g.add(fill);
        const fillMat = new THREE.MeshBasicMaterial({ color: pr.fillColor || 0xffe27a, transparent: true, opacity: 0.92 });
        this.add(fill, G.tube(0.04, 0.04, 0.2), fillMat, { rot: [Math.PI, 0, 0], outline: 0, shadow: false });
        fill.scale.y = 0.001;
        fill.visible = false;
        this.add(g, G.tube(0.054, 0.054, 0.02), metal, { pos: [0, 0.3, 0], outline: 0.5 });
        this.add(g, G.cone(), metal, { pos: [0, 0.3, 0], scale: [0.012, L, 0.012], outline: 0.4 });
        g.userData.tip = 0.3 + L;
        g.userData.fill = fill;
      } else if (pr.shape === 'rifle') {
        // a hunting rifle held at the grip: stock back along -Y, barrel forward along +Y
        this.add(g, G.box(), pr.wood || 0x6a4424, { pos: [0, -0.16, -0.012], scale: [0.036, 0.3, 0.07], outline: 0.5 });
        this.add(g, G.box(), pr.metal || 0x2a2a30, { pos: [0, 0.06, 0], scale: [0.032, 0.16, 0.05], outline: 0.5 });
        this.add(g, G.tube(0.011, 0.011, L), pr.metal || 0x2a2a30, { pos: [0, 0.14 + L / 2, 0.01], outline: 0.4 });
        this.add(g, G.box(), pr.wood || 0x6a4424, { pos: [0, 0.2, -0.004], scale: [0.03, 0.2, 0.036], outline: 0.4 });
        g.userData.tip = 0.14 + L;
      } else if (pr.shape === 'box') {
        // a box held in the hand: a present with a ribbon, or a bar of chocolate
        const sz = pr.size || [0.2, 0.14, 0.2];
        this.add(g, G.box(), pr.color || 0xd83a4a, { pos: [0, sz[1] / 2, 0], scale: sz, outline: 0.6 });
        if (pr.ribbon !== undefined) {
          this.add(g, G.box(), pr.ribbon, { pos: [0, sz[1] / 2, 0], scale: [sz[0] * 1.02, sz[1] * 1.02, sz[2] * 0.18], outline: 0 });
          this.add(g, G.box(), pr.ribbon, { pos: [0, sz[1] / 2, 0], scale: [sz[0] * 0.18, sz[1] * 1.02, sz[2] * 1.02], outline: 0 });
          this.add(g, G.sphereLo(), pr.ribbon, { pos: [0, sz[1] + 0.02, 0], scale: [0.05, 0.03, 0.05], outline: 0.4 });
        }
        if (pr.squares) for (let i = 1; i < pr.squares; i++) this.add(g, G.box(), pr.groove || 0x3a1c10, { pos: [0, sz[1] * 1.001, -sz[2] / 2 + (i / pr.squares) * sz[2]], scale: [sz[0] * 0.96, 0.006, 0.008], outline: 0 });
      } else if (pr.shape === 'potara') {
        // a Potara earring held between the fingers: a gold ring and the bead that hangs from it
        this.add(g, G.torus(1, 0.28), pr.ring || 0xf2c82a, { pos: [0, 0.02, 0], scale: [0.022, 0.022, 0.03], outline: 0.4, shadow: false });
        this.add(g, G.sphereLo(), pr.bead || 0xb8e04a, { pos: [0, -0.012, 0], scale: 0.017, outline: 0.4, shadow: false });
      } else if (pr.shape === 'kiBlade') {
        // a blade of ki out of an open hand (Vegito's Spirit Sword): a hot core inside a wide glow,
        // both additive, drawn along the prop's +Y. `setPropFill` grows it out of the palm.
        const glowMat = new THREE.MeshBasicMaterial({ color: pr.color || 0xffd84a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
        const coreMat = new THREE.MeshBasicMaterial({ color: pr.core || 0xfffbe0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
        const grow = new THREE.Group();
        g.add(grow);
        const W = pr.width || 0.09;
        this.add(grow, G.box(), glowMat, { pos: [0, L / 2, 0], scale: [W * 2.4, L, W * 0.9], outline: 0, shadow: false });
        this.add(grow, G.cone(), glowMat, { pos: [0, L + W * 2, 0], scale: [W * 1.2, W * 4, W * 0.45], outline: 0, shadow: false });
        this.add(grow, G.box(), coreMat, { pos: [0, L / 2, 0], scale: [W, L * 0.99, W * 0.35], outline: 0, shadow: false });
        this.add(grow, G.cone(), coreMat, { pos: [0, L + W * 1.2, 0], scale: [W * 0.5, W * 2.6, W * 0.18], outline: 0, shadow: false });
        g.userData.fill = grow;
        g.userData.tip = L + W * 4;
        grow.scale.y = 0.001;
        grow.visible = false;
      } else if (pr.shape === 'staff') {
        // WHIS' STAFF: a long silver shaft along the prop's +Y, a gold collar, and a clear blue orb at the
        // top with a thin ring floating round it. userData.orb is the orb (its world position is where the
        // staff's visions and light come from); userData.glow is its halo.
        this.add(g, G.tube(0.013, 0.016, L), pr.color || 0xd8dce6, { pos: [0, L * 0.72, 0], outline: 0.4 });
        this.add(g, G.tube(0.03, 0.022, 0.05), pr.trim || 0xe2b440, { pos: [0, L * 0.72 + 0.04, 0], outline: 0.4 });
        this.add(g, G.cone(), pr.trim || 0xe2b440, { pos: [0, -L * 0.28 - 0.06, 0], rot: [Math.PI, 0, 0], scale: [0.016, 0.06, 0.016], outline: 0.3 });
        const orbMat = new THREE.MeshBasicMaterial({ color: pr.orb || 0x8ae6ff, transparent: true, opacity: 0.82 });
        const orb = this.add(g, G.sphere(), orbMat, { pos: [0, L * 0.72 + 0.12, 0], scale: 0.07, outline: 0.4, shadow: false });
        this.add(g, G.torus(1, 0.06), pr.trim || 0xe2b440, { pos: [0, L * 0.72 + 0.12, 0], rot: [Math.PI / 2 - 0.3, 0, 0.2], scale: 0.105, outline: 0, shadow: false });
        const glowMat = new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: pr.orb || 0x8ae6ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.45, depthWrite: false });
        const glow = new THREE.Sprite(glowMat);
        glow.position.copy(orb.position);
        glow.scale.setScalar(0.34);
        g.add(glow);
        g.userData.orb = orb;
        g.userData.glow = glow;
        g.userData.tip = L * 0.72 + 0.12;
      } else if (pr.shape === 'hoop') {
        // a ring hanging in a vertical plane (an earring): radius, thick
        this.add(g, G.torus(1, pr.thick || 0.18), pr.color || 0xe2b440, { pos: [0, -(pr.radius || 0.02), 0], rot: [0, Math.PI / 2, 0], scale: pr.radius || 0.02, outline: 0.3, shadow: false });
      } else if (pr.shape === 'neckRing') {
        // a ring floating round the neck, not touching it (Whis' and the angels' halo-collar)
        this.add(g, G.torus(1, pr.thick || 0.11), pr.color || 0x2ab0b8, { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], scale: [pr.radius || 0.13, pr.radius || 0.13, (pr.radius || 0.13) * 0.9], outline: 0.5 });
      }
      this.props[pr.id] = g;
      return g;
    }

    /** Shows or hides a prop by id (the sword leaving his hand for somebody else's). */
    setPropVisible(id, on) {
      const g = this.props && this.props[id];
      if (g) g.visible = !!on;
    }

    /**
     * The sword in its sheath or in his hand: sheathed hides the blade in the hand and shows the
     * hilt over the shoulder; drawn does the opposite. Needs a 'sword' prop and a 'sheath' prop.
     */
    setSheathed(on) {
      this._sheathed = !!on;
      const sword = this.props && this.props.sword;
      if (sword) sword.visible = !on;
      for (const g of Object.values(this.props || {})) if (g.userData.hilt) g.userData.hilt.visible = !!on;
    }

    /** How full a prop's canister is, 0..1 (Yamu's siphon filling with Gohan's energy). */
    setPropFill(id, k) {
      const g = this.props && this.props[id];
      const fill = g && g.userData.fill;
      if (!fill) return;
      fill.scale.y = Math.max(0.001, Math.min(1, k));
      fill.visible = k > 0.01;
    }

    /** A prop added by a story after the body is built (a borrowed sword, a pair of sunglasses, a bottle). */
    addProp(pr) {
      if (this.props && this.props[pr.id]) this.removeProp(pr.id);
      return this._buildProp(pr);
    }

    removeProp(id) {
      const g = this.props && this.props[id];
      if (!g) return;
      if (g.parent) g.parent.remove(g);
      delete this.props[id];
    }

    /**
     * A strap across the chest (Future Trunks' sword strap): over the right shoulder, across the
     * chest to the left hip and round the back, as a ring tilted across the torso. st: { color,
     * tilt (radians, + leans the top toward his right), length, buckle, core }.
     */
    _buildStrap(chest, st) {
      const b = this.b;
      const g = new THREE.Group();
      g.name = 'strap';
      g.position.set(0, b.chestTop * 0.36, 0.0);
      chest.add(g);
      const a = st.tilt === undefined ? 0.62 : st.tilt;
      const ax = new THREE.Vector3(0, 0, 1), ay = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
      const az = new THREE.Vector3().crossVectors(ax, ay);
      const ring = this.add(g, G.torus(1, 0.075), st.color, { outline: 0.5, name: 'strap:band' });
      ring.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, ay, az));
      const sx = (b.chestD / 0.2) * 1.22 * 0.2, sy = st.length || 0.3;
      ring.scale.set(sx, sy, 0.16);
      this.strap = [ring];
      if (st.buckle !== undefined) {
        // a plate on the strap over the chest, a little toward his right shoulder
        const th = 0.5;
        const p = ax.clone().multiplyScalar(Math.cos(th) * sx * 1.06).addScaledVector(ay, Math.sin(th) * sy);
        const plate = this.add(g, G.box(), st.buckle, { pos: [p.x, p.y, p.z + 0.004], rot: [0, 0, a], scale: [0.046, 0.066, 0.012], outline: 0.4, name: 'strap:plate' });
        this.strap.push(plate);
        if (st.core !== undefined) this.strap.push(this.add(g, G.box(), st.core, { pos: [p.x, p.y, p.z + 0.011], rot: [0, 0, a], scale: [0.028, 0.042, 0.005], outline: 0, shadow: false, name: 'strap:core' }));
      }
    }

    _buildHand(hand, s, color, side, fingers = color) {
      const b = this.b;
      const S = G.sphere();
      const F = b.fist;
      const fist = new THREE.Group();
      hand.add(fist);
      this.add(fist, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F * 1.05, F * 1.08] });
      for (let i = 0; i < 4; i++) {
        this.add(fist, G.sphereLo(), fingers, { pos: [(i - 1.5) * F * 0.42, -0.072, 0.03], scale: [F * 0.27, F * 0.24, F * 0.3], outline: 0.25, shadow: false });
      }
      this.add(fist, S, fingers, { pos: [-s * 0.035, -0.022, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });

      const open = new THREE.Group();
      hand.add(open);
      this.add(open, S, color, { pos: [0, -0.045, 0.004], scale: [F * 0.9, F * 1.02, F * 0.5] });
      for (let i = 0; i < 4; i++) {
        const fg = this.add(open, G.limb(0.0105, 0.058 - Math.abs(i - 1.5) * 0.006), fingers, { pos: [(i - 1.5) * F * 0.4, -0.085, 0.004], rot: [0.12, 0, (i - 1.5) * 0.09], outline: 0.3, shadow: false });
        fg.userData.finger = true;
      }
      this.add(open, G.limb(0.012, 0.05), fingers, { pos: [-s * F * 0.8, -0.03, 0.012], rot: [0.2, 0, -s * 0.85], outline: 0.3, shadow: false });

      const point = new THREE.Group();
      hand.add(point);
      this.add(point, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F, F * 1.05] });
      for (let i = 0; i < 2; i++) this.add(point, G.limb(0.0105, 0.06), fingers, { pos: [(i - 0.5) * F * 0.4 + s * F * 0.25, -0.085, 0.012], outline: 0.3, shadow: false });
      this.add(point, S, fingers, { pos: [-s * 0.035, -0.022, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });

      // the thumbs-up: the fist, the thumb standing out of it along the back of the curled fingers
      // (+z in the hand's frame: straight up when the arm is held out in front)
      const thumb = new THREE.Group();
      hand.add(thumb);
      this.add(thumb, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F * 1.05, F * 1.08] });
      for (let i = 0; i < 4; i++) {
        this.add(thumb, G.sphereLo(), fingers, { pos: [(i - 1.5) * F * 0.42, -0.072, 0.03], scale: [F * 0.27, F * 0.24, F * 0.3], outline: 0.25, shadow: false });
      }
      this.add(thumb, G.limb(0.013, 0.05), fingers, { pos: [-s * F * 0.55, -0.03, 0.03], rot: [-Math.PI / 2, 0, 0], outline: 0.35, shadow: false });

      open.visible = false;
      point.visible = false;
      thumb.visible = false;
      this.hands[side] = { fist, open, point, thumb, current: 'fist' };
    }

    /** Hand shapes: 'fist' | 'open' | 'point' (two fingers out) | 'thumb' (thumbs-up). */
    setHands(l, r) {
      for (const [side, shape] of [['L', l], ['R', r]]) {
        const h = this.hands[side];
        if (!h || !shape || h.current === shape || !h[shape]) continue;
        for (const k of ['fist', 'open', 'point', 'thumb']) if (h[k]) h[k].visible = shape === k;
        h.current = shape;
      }
    }

    /** The long shirt's hem (outfit.hem = { color, len, flare }): two half skirts on the hips. */
    _buildHem(hips, hm, top) {
      const b = this.b;
      const col = hm.color !== undefined ? hm.color : top;
      const mat = SL.Toon.makeMat(col, { side: THREE.DoubleSide, rim: { color: this.rimColor.getHex(), strength: this.rimStrength } });
      mat.userData.baseEmissive = new THREE.Color(0, 0, 0);
      this.mats.set('hem', mat);
      const rt = Math.max(b.pelvisW * 1.12, b.waistW * (this._loose || 1) * 1.12), rb = rt * (hm.flare || 1.22), len = hm.len || 0.16;
      this.hem = [];
      for (const [front, a0] of [[true, 0], [false, Math.PI]]) {
        const piv = new THREE.Group();
        piv.position.set(0, 0.07, 0);
        hips.add(piv);
        // each half wraps ~15° past the side so no wedge opens there when the legs swing the halves apart;
        // the back half sits a hair outside the front one where they overlap
        const k = front ? 1 : 1.025, lap = 0.26;
        const g = geo('hem' + f3(rt) + f3(rb) + f3(len) + front, () => {
          const c = new THREE.CylinderGeometry(rt * k, rb * k, len, 16, 1, true, a0 - Math.PI / 2 - lap, Math.PI + 2 * lap);
          c.translate(0, -len / 2, 0);
          return c;
        });
        this.add(piv, g, mat, { scale: [1, 1, (b.pelvisD / b.pelvisW) * 1.08], outline: 0.6, name: front ? 'hem:front' : 'hem:back' });
        this.hem.push({ node: piv, front });
      }
    }

    _buildCape(chest, color) {
      const b = this.b;
      const cape = new THREE.Group();
      cape.position.set(0, b.chestTop - 0.02, -b.chestD * 0.95);
      chest.add(cape);
      this.capeNode = cape;
      const g = geo('capeShape', () => {
        const shape = new THREE.PlaneGeometry(0.5, 1.05, 4, 8);
        shape.translate(0, -0.52, 0);
        const p = shape.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const y = p.getY(i), x = p.getX(i);
          p.setX(i, x * (1 + -y * 0.5));
          p.setZ(i, -Math.abs(x) * 0.25 - y * 0.08);
        }
        shape.computeVertexNormals();
        return shape;
      });
      // a dedicated double-sided material (Material.clone() would drop the rim shader hook)
      const capeMat = SL.Toon.makeMat(color, { side: THREE.DoubleSide, rim: { color: this.rimColor.getHex(), strength: this.rimStrength } });
      capeMat.userData.baseEmissive = new THREE.Color(0, 0, 0);
      this.mats.set('cape', capeMat);
      this.add(cape, g, capeMat, { outline: 0.8 });
      this.cloth.push({ node: cape, sx: new Spring(24, 4), sz: new Spring(24, 4), amount: 1.1, cape: true });
    }

    _emblemMat(t, e) {
      const m = this.mat(0xffffff, { basic: true, map: SL.Toon.emblemTexture(t, e.fg || '#111', e.bg || '#fff') });
      m.userData.emblem = t;
      return m;
    }

    /** Jointed tail segments from the lower back (Great Apes, Frieza, a loose Saiyan tail). Returns the base joint. */
    _buildLongTail(hips, lt) {
      const b = this.b;
      const n = lt.segments || 8;
      const segLen = lt.length / n;
      const base = this.joint('tailBase', hips, 0, -0.02, -b.pelvisD * 0.85);
      // positive x tilts the tail back from the hips; the segments then curl upward
      base.rotation.x = lt.lift !== undefined ? lt.lift : 1.1;
      let parent = base;
      this.tailSegs = [];
      for (let i = 0; i < n; i++) {
        const seg = this.joint('tail' + i, parent, 0, i === 0 ? 0 : -segLen, 0);
        const r = lt.radius * (1 - (i / n) * 0.55);
        this.add(seg, G.limb(r, segLen * 1.08), lt.color, { outline: 0.7 });
        if (lt.fur) this.add(seg, G.sphere(), lt.color, { pos: [0, -segLen * 0.5, 0], scale: [r * 1.25, segLen * 0.55, r * 1.25], outline: 0.5 });
        const curl = (lt.curl || 0.12) * (i / n);
        seg.rotation.x = curl * 2.2; // its rest curl (tick() sways around it), so it never shows as a straight rod
        this.tailSegs.push({ node: seg, i, curl });
        parent = seg;
      }
      // lt.tip: a stinger on the end (Cell's absorbing tail) — a long cone and the open mouth of it
      if (lt.tip !== undefined) {
        const r = lt.radius * 0.6;
        this.add(parent, G.cone(), lt.color, { pos: [0, -segLen, 0], rot: [Math.PI, 0, 0], scale: [r * 1.9, segLen * 1.6, r * 1.9], outline: 0.7 });
        this.add(parent, G.sphere(), lt.tip, { pos: [0, -segLen * 2.55, 0], scale: [r * 0.9, r * 0.5, r * 0.9], outline: 0.4 });
      }
      this.longTailBase = base;
      return base;
    }

    /**
     * A Saiyan tail (outfit.tail = its colour, outfit.tailStyle):
     *   'wrapped' (default) leaves the lower back and wraps once round the waist, tapering to a
     *             rounded tip — how Vegeta, Nappa, Raditz and Bardock wear it in the story.
     *   'free'    hangs from the lower back and curls, on jointed segments that sway (the
     *             machinery the Great Ape and Frieza tails use).
     *   'band'    the old plain ring round the waist: only Cell's waist band, which is not a tail.
     * It used to be that ring for everybody — a band with no start and no end, which read as a
     * brown oval on the lower back rather than as a tail. model.beltTail is whatever was built,
     * so a technique can still hide it (Raditz's Tail Grapple).
     */
    _buildTail(spine, hips, o) {
      const b = this.b;
      const style = o.tailStyle || 'wrapped';
      this.tailStyle = style;
      if (style === 'band') {
        this.beltTail = this.add(spine, G.torus(1, 0.22), o.tail, { pos: [0, 0.045, -0.005], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.15, b.waistD * 1.25, 0.14], outline: 0.6 });
        return;
      }
      if (style === 'free') {
        this.beltTail = this._buildLongTail(hips, { color: o.tail, segments: 9, length: 0.74, radius: 0.03, lift: 0.28, curl: 0.46 });
        return;
      }
      // wrapped: round the waist, clear of the belly and of any armor over it
      const tr = 0.024;
      const rx = b.waistW * (o.armor ? 1.24 : 1.14) + tr, rz = b.waistD * (o.armor ? 1.3 : 1.18) + tr;
      const curve = (() => {
        // the root leaves the tailbone and sweeps up on a diagonal into the wrap; one turn and a bit
        // later the tapered end crosses back over it, higher up
        const pts = [new THREE.Vector3(-0.012, -0.125, -rz * 0.74), new THREE.Vector3(0.012, -0.1, -rz * 0.97), new THREE.Vector3(0.04, -0.07, -rz * 1.0)];
        const a0 = Math.PI - 0.34, turns = 1.12, n = 30;
        for (let i = 0; i <= n; i++) {
          const t = i / n, a = a0 + t * turns * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.sin(a) * rx, -0.045 + t * 0.058, Math.cos(a) * rz));
        }
        return new THREE.CatmullRomCurve3(pts);
      })();
      const T = 72, R = 8;
      const tube = geo('tailWrap' + f3(rx) + f3(rz), () => {
        const g = new THREE.TubeGeometry(curve, T, tr, R, false);
        // it tapers from the root to the tip
        const p = g.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
        for (let i = 0; i <= T; i++) {
          curve.getPointAt(i / T, c);
          const k = 1 - 0.52 * Math.pow(i / T, 1.5);
          for (let j = 0; j <= R; j++) {
            const idx = i * (R + 1) + j;
            v.fromBufferAttribute(p, idx).sub(c).multiplyScalar(k).add(c);
            p.setXYZ(idx, v.x, v.y, v.z);
          }
        }
        g.computeVertexNormals();
        return g;
      });
      const grp = new THREE.Group();
      grp.name = 'tail:wrapped';
      grp.userData.curve = curve;
      spine.add(grp);
      this.add(grp, tube, o.tail, { outline: 0.6, name: 'tail:tube' });
      const tip = curve.getPointAt(1);
      this.add(grp, G.sphere(), o.tail, { pos: [tip.x, tip.y, tip.z], scale: tr * 0.5, outline: 0.4, name: 'tail:tip' });
      this.beltTail = grp;
    }

    /**
     * THE METAMORAN COLLAR (Gogeta's vest): a thick quilted roll that starts at the top of each pec,
     * climbs over the shoulder — where it swells into the shoulder pad — and meets itself behind
     * the neck. Overlapping outlined puffs along that horseshoe, so it reads as padded cloth in
     * silhouette and not as paint. On the chest joint: the arms move under it.
     * pc = { color, size (1 = default), shoulder (the shoulder puff's size, default 1) }
     */
    _buildPaddedCollar(chest, pc) {
      const b = this.b, sx = b.chestW / 0.2, k = pc.size || 1, ks = pc.shoulder || 1;
      const col = pc.color !== undefined ? pc.color : pc;
      const parts = (this.paddedCollar = []);
      // the path, character's left side (mirrored): [x, y, z, radius] — from the top of the pec, over
      // the collarbone, swelling over the shoulder, round the back to the nape
      const path = [
        [0.065 * sx, b.chestTop - 0.1, b.chestD * 1.0, 0.042],
        [0.095 * sx, b.chestTop - 0.04, b.chestD * 0.9, 0.05],
        [0.15 * sx, b.chestTop + 0.0, b.chestD * 0.55, 0.058],
        [b.shoulderX * 0.95, b.shoulderY + 0.05, b.chestD * 0.15, 0.08 * ks],
        [b.shoulderX * 1.0, b.shoulderY + 0.035, -b.chestD * 0.3, 0.075 * ks],
        [b.shoulderX * 0.62, b.chestTop + 0.02, -b.chestD * 0.72, 0.058],
        [0.07 * sx, b.chestTop + 0.035, -b.chestD * 0.92, 0.05],
      ];
      const nape = [0, b.chestTop + 0.04, -b.chestD * 0.96, 0.05];
      const X = new THREE.Vector3(1, 0, 0);
      // each segment an ellipsoid laid ALONG the roll (long axis on the path's tangent), so the
      // segments butt into one quilted tube instead of a string of beads
      const puff = (p, s, prev, next) => {
        const t = new THREE.Vector3(s * (next[0] - prev[0]), next[1] - prev[1], next[2] - prev[2]);
        const len = t.length();
        const m = this.add(chest, G.sphere(), col, { pos: [s * p[0], p[1], p[2]], scale: [Math.max(p[3], len * 0.42) * k * 1.05, p[3] * k, p[3] * k * 1.04], outline: 0.6, name: 'collar:pad' });
        if (len > 1e-5) m.quaternion.setFromUnitVectors(X, t.divideScalar(len));
        parts.push(m);
      };
      const mid = (a, c) => a.map((v, j) => (j === 3 ? Math.min(v, c[3]) * 0.92 : (v + c[j]) * 0.5));
      for (const s of [1, -1]) {
        for (let i = 0; i < path.length; i++) {
          const prev = path[i - 1] || path[i], next = path[i + 1] || nape;
          puff(path[i], s, prev, next);
          // a segment between two, so the roll stays one piece in silhouette
          puff(mid(path[i], next), s, path[i], next);
        }
      }
      puff(nape, 1, [0.07 * sx, nape[1], nape[2]], [-0.07 * sx, nape[1], nape[2]]);
    }

    /** A collar at the base of the neck: 'ruff' (Yardrat's gathered one) or 'shirt' (a folded shirt collar). */
    _buildCollar(chest, o) {
      const b = this.b, sx = b.chestW / 0.2, sz = b.chestD / 0.14;
      const y = b.chestTop - 0.012;
      const parts = (this.collarParts = []);
      if (o.collarStyle === 'turtle') {
        // a high collar round the neck (Videl's Super-era top)
        parts.push(this.add(chest, G.tube(b.neckR * 1.5, b.neckR * 1.62, 0.08), o.collar, { pos: [0, b.chestTop + 0.07, -0.004], outline: 0.6 }));
        return;
      }
      if (o.collarStyle === 'usekh') {
        // THE USEKH (Beerus): a broad flat collar lying over the shoulders and the top of the chest and
        // back — concentric bands that slope down from the neck to the shoulder line, gold between bands
        // of colour (o.collarBands: [colour, ...] from the neck out; default gold / trim / gold / trim /
        // gold), a row of drop-shaped stones hanging off the outer edge (o.collarGems), a gold rim.
        const dz = (b.chestD / 0.2) * 1.06;
        const bands = o.collarBands || [o.collar, o.collarTrim !== undefined ? o.collarTrim : o.collar, o.collar, o.collarTrim !== undefined ? o.collarTrim : o.collar, o.collar];
        // it lies ON the top of the chest: the height at a radius comes from the chest's own profile (CHEST_PTS)
        const onChest = (r) => {
          for (let i = 0; i < CHEST_PTS.length - 1; i++) {
            const [ra, ya] = CHEST_PTS[i], [rb, yb] = CHEST_PTS[i + 1];
            if (r <= ra && r >= rb) return ya + ((yb - ya) * (ra - r)) / Math.max(1e-6, ra - rb);
          }
          return r > CHEST_PTS[0][0] ? CHEST_PTS[0][1] : CHEST_PTS[CHEST_PTS.length - 1][1];
        };
        const r0 = 0.07, r1 = o.collarReach || 0.2;
        const n = bands.length;
        for (let i = 0; i < n; i++) {
          const ra = r0 + ((r1 - r0) * i) / n, rb = r0 + ((r1 - r0) * (i + 1)) / n;
          // a gentle slope out from the neck (a broad flat collar, not a turtleneck): never inside the chest
          const y0 = onChest(r0) + 0.012;
          const ya = Math.max(onChest(ra) + 0.012, y0 - (ra - r0) * 0.36), yb = Math.max(onChest(rb) + 0.012, y0 - (rb - r0) * 0.36);
          // one sloped band: an open frustum from ra (top) down and out to rb
          const geo = new THREE.CylinderGeometry(ra, rb, Math.max(0.004, ya - yb), 44, 1, true);
          parts.push(this.add(chest, geo, bands[i], { pos: [0, (ya + yb) / 2, 0.004], scale: [sx * 1.04, 1, dz], outline: i === n - 1 ? 0.7 : 0 }));
        }
        // the stones on the rim: drops in the gem colour all the way round
        if (o.collarGems !== undefined) {
          const y = Math.max(onChest(r1) + 0.002, onChest(r0) + 0.002 - (r1 - r0) * 0.36);
          for (let i = 0; i < 20; i++) {
            const a2 = (i / 20) * Math.PI * 2;
            parts.push(this.add(chest, G.sphereLo(), o.collarGems, { pos: [Math.sin(a2) * r1 * sx * 1.04, y, Math.cos(a2) * r1 * dz + 0.004], scale: [0.008, 0.012, 0.007], outline: 0.2, shadow: false }));
          }
        }
        return;
      }
      if (o.collarStyle === 'ruff') {
        // a thick soft ring round the neck, lumpy so it reads as gathered cloth
        // (over a vest or armor it sits higher and wider, on top of the plate's neckline)
        const up = o.armor ? 0.03 : 0.012, wide = o.armor ? 1.2 : 1;
        parts.push(this.add(chest, G.torus(1, 0.45), o.collar, { pos: [0, y + up, -0.006], rot: [Math.PI / 2, 0, 0], scale: [0.08 * sx * wide, 0.074 * sz * wide, 0.1], outline: 0.8 }));
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          parts.push(this.add(chest, G.sphereLo(), o.collar, { pos: [Math.sin(a) * 0.104 * sx * wide, y + up + 0.016, Math.cos(a) * 0.097 * sz * wide - 0.006], scale: 0.042, outline: 0.35, shadow: false }));
        }
      } else {
        // a band standing round the neckline (where the chest narrows to the neck), and two points
        // lying flat on the slope of the chest, so the shirt reads as a shirt and not as paint
        const dz = (b.chestD / 0.2) * 1.02;
        parts.push(this.add(chest, G.torus(1, 0.16), o.collar, { pos: [0, b.chestTop + 0.042, 0.004], rot: [Math.PI / 2 - 0.12, 0, 0], scale: [0.118 * sx, 0.122 * dz, 0.16], outline: 0.6 }));
        for (const s2 of [1, -1]) parts.push(this.add(chest, G.box(), o.collar, { pos: [s2 * 0.042 * sx, b.chestTop + 0.006, 0.172 * dz], rot: [-0.95, s2 * 0.22, s2 * 0.5], scale: [0.05, 0.06, 0.01], outline: 0.6 }));
      }
    }

    /**
     * An open jacket over a shirt (outfit.jacket = { color, collar }): a shell over the chest and
     * the belly with the front left open, so the shirt (outfit.top) shows down the middle, and a
     * collar standing round the back of the neck. The sleeves are the outfit's long sleeves.
     */
    _buildJacket(chest, spine, jk) {
      const b = this.b;
      let mat = this.mats.get('jacket');
      if (!mat) {
        // drawn from both sides: the lining shows at the open front
        mat = SL.Toon.makeMat(jk.color, { side: THREE.DoubleSide, rim: { color: this.rimColor.getHex(), strength: this.rimStrength } });
        mat.userData.baseEmissive = new THREE.Color(0, 0, 0);
        this.mats.set('jacket', mat);
      }
      // half the opening at the front, in radians: wider over the chest, narrower at the waist, so the
      // two shells meet in one line
      const shell = (key, pts, seg, gap) => geo(key + f3(gap), () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, gap, Math.PI * 2 - gap * 2));
      const open = jk.open || 1;
      this.jacket = [
        this.add(chest, shell('jacketChest', CHEST_PTS, 24, 0.46 * open), mat, { pos: [0, -0.01, 0.002], scale: [(b.chestW / 0.2) * 1.1, 1.0, (b.chestD / 0.2) * 1.16], outline: 0.8, name: 'jacket:chest' }),
      ];
      // a short vest (Majin Buu's) stops at the chest
      if (!jk.short) this.jacket.push(this.add(spine, shell('jacketAbs', ABS_PTS, 22, 0.36 * open), mat, { pos: [0, -0.05, 0], scale: [(b.waistW / 0.13) * 1.16, (b.absLen / 0.2) * 1.2, (b.waistD / 0.13) * 1.16], outline: 0.8, name: 'jacket:belly' }));
      if (jk.collar !== undefined) {
        // a standing collar round the back and sides of the neck
        const cg = geo('jacketCollar', () => new THREE.TorusGeometry(1, 0.24, 6, 20, Math.PI * 1.45));
        // tilted so the back stands up behind the neck and the open front drops to the chest
        const c = this.add(chest, cg, jk.collar, { pos: [0, b.chestTop + 0.004, -0.012], rot: [Math.PI / 2 + 0.3, 0, Math.PI / 2 + Math.PI * 0.275], scale: [0.078 * (b.chestW / 0.2), 0.07 * (b.chestD / 0.14), 0.16], outline: 0.6, name: 'jacket:collar' });
        this.jacket.push(c);
      }
    }

    _buildArmor(chest, spine, hips, ar) {
      const b = this.b;
      const S = G.sphere();
      // every piece is kept by name, so a story can crack it and break it away (damageArmor)
      const A = (this.armorParts = { chest, spine, pads: [], hips: [], colors: ar, cracks: [] });
      A.plate = this.add(chest, G.chest(), ar.plate, { pos: [0, -0.005, 0.01], scale: [(b.chestW / 0.2) * 1.1, 0.96, (b.chestD / 0.2) * 1.18] });
      A.belly = this.add(spine, G.abs(), ar.belly !== undefined ? ar.belly : ar.plate, { pos: [0, 0.01, 0.004], scale: [(b.waistW / 0.13) * 1.1, (b.absLen / 0.2) * 0.98, (b.waistD / 0.13) * 1.1] });
      if (ar.trim !== undefined) A.trim = this.add(spine, G.torus(1, 0.12), ar.trim, { pos: [0, 0.2, 0.004], rot: [Math.PI / 2, 0, 0], scale: [b.chestW * 0.9, b.chestD * 1.02, 0.15], outline: 0.4 });
      const padStyle = ar.pads === undefined ? 'none' : ar.padStyle || 'up';
      if (padStyle === 'strap') {
        // no shoulder flaps: a band over each shoulder, front to back (later Frieza Force and Earth armor)
        // padScale widens them (Bardock's classic armor has broad green straps)
        const ps = ar.padScale || 1;
        for (const s of [1, -1]) A.pads.push(this.add(chest, G.box(), ar.pads, { pos: [s * b.chestW * 0.56, 0.283 - (ps - 1) * 0.012, 0], rot: [0, 0, s * 0.3], scale: [0.052 * ps, 0.024, b.chestD * (2.25 - (ps - 1) * 0.2)], outline: 0.5 }));
      } else if (padStyle !== 'none') {
        // 'flap': the big shoulder flaps of the later Saiyan armor (Super-era Bardock)
        const flap = padStyle === 'flap';
        for (const s of [1, -1]) {
          const tilt = padStyle === 'up' ? 0.5 : flap ? 0.42 : padStyle === 'wide' ? 0.12 : -0.2;
          const w = flap ? 0.135 : padStyle === 'wide' ? 0.115 : 0.1;
          A.pads.push(this.add(chest, S, ar.pads, { pos: [s * (b.chestW + (flap ? 0.05 : 0.035)), flap ? 0.258 : 0.265, -0.005], rot: [0, 0, s * tilt], scale: [w, flap ? 0.044 : 0.034, flap ? 0.128 : 0.1] }));
        }
      }
      if (ar.hipGuards !== undefined) {
        // flaps on the hips only; 'long': the tassets that hang to mid-thigh. There used to be a
        // third plate on the seat, which read as a blob stuck to the character's rear — gone.
        const long = ar.hipStyle === 'long';
        const hy = long ? -0.1 : -0.05, hs = long ? 0.15 : 0.092;
        for (const s of [1, -1]) A.hips.push(this.add(hips, S, ar.hipGuards, { pos: [s * 0.122, hy, 0.012], rot: [0, s * 1.25, s * 0.14], scale: [0.078, hs, 0.02], outline: 0.7 }));
      }
    }

    /**
     * Battle damage for armor, staged for a story (Bardock's last moments). Levels only go up:
     *   1  scuffed: dark fractures across the chest plate
     *   2  failing: the fractures glow with the heat of whatever is coming
     *   3  shoulder guards break away
     *   4  the chest plate and the rest go
     * Returns the pieces that came off at this call, as { pos, color, size }, so the scene can
     * throw them as debris (the meshes themselves are hidden, not simulated).
     */
    damageArmor(level) {
      const A = this.armorParts;
      if (!A) return [];
      const was = A.level || 0;
      if (level <= was) return [];
      A.level = level;
      const b = this.b;
      const out = [];
      const crack = (glow) => {
        // a fracture: a thin bar lying on the plate's front surface
        const sx = (b.chestW / 0.2) * 1.1, sz = (b.chestD / 0.2) * 1.18;
        const mat = glow ? this.mat(0xffa040, { basic: true }) : this.mat(0x0c0d10, { basic: true });
        const n = glow ? 5 : 4;
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1) - 0.5) * 0.14 * (b.chestW / 0.2) + (glow ? 0.012 : -0.006);
          const y = 0.1 + ((i * 37) % 11) / 11 * 0.13;
          const ux = x / sx;
          const zUnit = Math.sqrt(Math.max(0, 0.2 * 0.2 - ux * ux));
          const bar = this.add(A.chest, G.box(), mat, { pos: [x, y, zUnit * sz + 0.004], rot: [0, 0, ((i % 2 ? 1 : -1) * (0.5 + i * 0.22))], scale: [0.006, 0.07 + (i % 3) * 0.02, 0.004], outline: 0, shadow: false });
          A.cracks.push(bar);
        }
      };
      const shed = (mesh, size) => {
        if (!mesh || !mesh.visible) return;
        this.root.updateMatrixWorld(true);
        const pos = mesh.getWorldPosition(new THREE.Vector3());
        const color = mesh.material && mesh.material.color ? mesh.material.color.getHex() : 0x3f6b35;
        mesh.visible = false;
        out.push({ pos, color, size });
      };
      if (was < 1 && level >= 1) crack(false);
      if (was < 2 && level >= 2) crack(true);
      if (was < 3 && level >= 3) for (const p of A.pads) shed(p, 0.28);
      if (was < 4 && level >= 4) {
        for (const c of A.cracks) c.visible = false;
        shed(A.plate, 0.4);
        shed(A.belly, 0.3);
        shed(A.trim, 0.2);
        for (const h of A.hips) shed(h, 0.18);
      }
      return out;
    }

    /** Puts broken armor back (a new battle reuses nothing, but a scene restart can). */
    repairArmor() {
      const A = this.armorParts;
      if (!A || !A.level) return;
      for (const m of [A.plate, A.belly, A.trim, ...A.pads, ...A.hips]) if (m) m.visible = true;
      for (const c of A.cracks) if (c.parent) c.parent.remove(c);
      A.cracks = [];
      A.level = 0;
    }

    /**
     * DECALS: flat spots laid on the body. On a limb (at: shoulderL|elbowL|thighL|kneeL and R) a spot is
     * placed by t (0..1 down the limb) and ang (radians round it, 0 = front); anywhere else by pos.
     * size [w, h] in metres. (Cell's spots, a Junior's.)
     */
    _buildDecals(list) {
      const b = this.b, S = G.sphere();
      const dims = {
        shoulder: [b.upperArmLen, b.upperArmR], elbow: [b.foreArmLen, b.foreArmR],
        thigh: [b.thighLen, b.thighR], knee: [b.shinLen, b.shinR],
      };
      this.decalMeshes = [];
      for (const d of list) {
        const j = this.joints[d.at];
        if (!j) continue;
        const key = d.at.replace(/[LR]$/, '');
        const sz = d.size || [0.03, 0.03];
        let m;
        if (dims[key] && d.t !== undefined) {
          const [len, r] = dims[key];
          const ang = d.ang || 0, rr = r * (d.lift || 1.03);
          m = this.add(j, S, d.color, { pos: [Math.sin(ang) * rr, -d.t * len, Math.cos(ang) * rr], rot: [0, ang, d.tilt || 0], scale: [sz[0], sz[1], 0.006], outline: 0, shadow: false });
        } else {
          m = this.add(j, S, d.color, { pos: d.pos || [0, 0, 0], rot: d.rot || [0, 0, 0], scale: [sz[0], sz[1], sz[2] || 0.006], outline: 0, shadow: false });
        }
        this.decalMeshes.push(m);
      }
    }

    /** Wings folded down the back (Cell): two long flat points from the shoulder blades to the backs of the knees. */
    _buildWings(chest, w) {
      const b = this.b;
      this.wingMeshes = [];
      for (const s of [1, -1]) {
        const g = new THREE.Group();
        g.position.set(s * (w.x || 0.07), b.chestTop - (w.drop || 0.02), -b.chestD * (w.back || 0.95));
        g.rotation.set(-(w.tilt === undefined ? 0.16 : w.tilt), 0, s * (w.spread === undefined ? 0.16 : w.spread));
        chest.add(g);
        // a cone pointing down: wide at the shoulder blade, a sharp point low on the back of the leg
        const m = this.add(g, G.cone(), w.color, { pos: [0, 0, 0], rot: [Math.PI, 0, 0], scale: [w.width, w.len, w.width * (w.flat || 0.2)], outline: 1 });
        this.wingMeshes.push(m);
        if (w.edge !== undefined) this.add(g, G.cone(), w.edge, { pos: [s * w.width * 0.35, 0, -0.004], rot: [Math.PI, 0, 0], scale: [w.width * 0.25, w.len * 0.85, w.width * 0.1], outline: 0 });
      }
    }

    _buildHead(head) {
      const b = this.b;
      const a = this.app;
      const f = a.face || {};
      const R = b.headR;
      const S = G.sphere();
      // face.skin: a face in a different colour from the body (Cell's pale lilac face on a green body)
      const skin = f.skin !== undefined ? f.skin : a.skin;
      const hc = new THREE.Group();
      hc.position.set(0, R * 0.95, 0);
      head.add(hc);
      this.headCenter = hc;
      this.skull = this.add(hc, S, skin, { scale: [R * SKULL[0], R * SKULL[1], R * SKULL[2]], skin: true });
      // the jaw and cheeks carry the face's age and build (all opt-in, 1 = as before): face.jaw
      // lengthens the chin (an adult, a hard face), face.jawW narrows it, face.cheeks rounds (>1),
      // flattens (<1) or drops (0) the cheekbones
      const jaw = f.jaw || 1, jawW = f.jawW || 1;
      this.add(hc, S, skin, { pos: [0, -R * (0.42 + (jaw - 1) * 0.3), R * (0.12 + (jaw - 1) * 0.08)], scale: [R * 0.66 * jawW, R * 0.56 * jaw, R * 0.7], outline: 0, skin: true });
      // cheekbones give the face a more angular anime shape
      const ck = f.cheeks === undefined ? 1 : f.cheeks;
      if (ck > 0) for (const s of [1, -1]) this.add(hc, S, skin, { pos: [s * R * 0.52 * Math.min(1, jawW + 0.04), -R * 0.2, R * 0.55], scale: [R * 0.3 * ck, R * 0.26 * ck, R * 0.3 * ck], outline: 0 });
      if (!f.noEars) for (const s of [1, -1]) this.add(hc, S, skin, { pos: [s * R * 0.98, -0.01, -0.005], scale: [0.02, 0.032, 0.022], outline: 0.5 });
      if (f.pointedEars) for (const s of [1, -1]) this._spike(hc, { a: [s, 0.05, -0.1], d: [s, 0.55, -0.35], l: 0.07, r: 0.022, depth: 0.98, flat: 0.4 }, skin, R);
      const nz = f.nose || 1;
      this.add(hc, G.cone(), skin, { pos: [0, -0.028, R * 0.97], rot: [Math.PI / 2, 0, 0], scale: [0.012 * nz, 0.03 * nz, 0.014 * nz], outline: 0 });

      const eyeWhite = this.mat(f.sclera || 0xffffff, { basic: true });
      const lashMat = this.mat(f.lash !== undefined ? f.lash : 0x141014, { basic: true });
      const highlight = this.mat(0xffffff, { basic: true });
      this.face.eyes = [];
      this.face.pupils = [];
      this.face.lights = [];
      this.face.lashes = [];
      this.face.brows = [];
      const pupilColor = f.pupil !== undefined ? f.pupil : 0x1a1a22;
      this.face.pupilMat = new THREE.MeshBasicMaterial({ color: pupilColor });
      this.mats.set('pupil', this.face.pupilMat);
      const browColor = f.brow !== undefined ? f.brow : a.hair ? a.hair.color : 0x222222;
      this.face.browMat = SL.Toon.makeMat(browColor);
      this.face.browMat.userData.baseEmissive = new THREE.Color();
      this.mats.set('brow', this.face.browMat);
      const eyeX = f.eyeX || 0.043;
      const ew = f.eyeW || 1;
      // taller or narrower eyes (face.eyeH): the expressions scale from this, not from a constant
      this._eyeH = f.eyeH || 1;
      for (const s of [1, -1]) {
        const eye = this.add(hc, S, eyeWhite, { pos: [s * eyeX, 0.004, R * 0.9], rot: [0, s * 0.38, 0], scale: [0.028 * ew, 0.02, 0.011], outline: 0, basic: true, shadow: false });
        const pup = this.add(hc, G.sphereLo(), this.face.pupilMat, { pos: [s * (eyeX - 0.005), 0.001, R * 0.99], scale: [0.0105, 0.0145, 0.005], outline: 0, basic: true, shadow: false });
        const hl = this.add(hc, G.sphereLo(), highlight, { pos: [s * (eyeX - 0.009) + 0.002, 0.007, R * 1.01], scale: [0.0034, 0.0034, 0.002], outline: 0, basic: true, shadow: false });
        const lash = this.add(hc, G.box(), lashMat, { pos: [s * eyeX, 0.02, R * 0.945], rot: [0, s * 0.38, s * 0.12], scale: [0.036 * ew, 0.0048, 0.009], outline: 0, basic: true, shadow: false });
        const brow = this.add(hc, G.box(), this.face.browMat, { pos: [s * eyeX, 0.036, R * 0.93], rot: [0, s * 0.35, 0], scale: [0.042 * (f.browW || 1), 0.0105 * (f.browThick || 1), 0.014], outline: 0, shadow: false });
        // a flick at the outer corner of the lash line (face.lashWing): the lashes of a woman's eye
        if (f.lashWing) this.add(hc, G.box(), lashMat, { pos: [s * (eyeX + 0.019 * ew), 0.021, R * 0.925], rot: [0, s * 0.62, s * 0.62], scale: [0.013, 0.0042, 0.008], outline: 0, basic: true, shadow: false });
        this.face.eyes.push(eye);
        this.face.pupils.push(pup);
        this.face.lights.push(hl);
        this.face.lashes.push(lash);
        this.face.brows.push(brow);
      }
      this.face.mouth = this.add(hc, G.box(), 0x4a1616, { pos: [0, -0.062, R * 0.83], scale: [0.03, 0.005, 0.01], outline: 0, shadow: false });
      this.face.teeth = this.add(hc, G.box(), this.mat(0xf6f2ea, { basic: true }), { pos: [0, -0.058, R * 0.845], scale: [0.026, 0.0045, 0.006], outline: 0, basic: true, shadow: false });
      this.face.teeth.visible = false;
      if (f.scar) this.add(hc, G.box(), 0x9a4040, { pos: [0.068, -0.03, R * 0.82], rot: [0, 0.5, 0.35], scale: [0.004, 0.03, 0.006], outline: 0, shadow: false });

      const o = a.outfit || {};
      if (o.scouter) {
        // an accessory with its own pieces (the wardrobe equips and removes it; tests read them)
        const sc = o.scouter;
        this.scouter = [
          this.add(hc, G.box(), sc.body || 0xdedede, { pos: [R * 0.98, 0.0, 0], scale: [0.03, 0.065, 0.07], outline: 0.7 }),
          this.add(hc, G.box(), sc.body || 0xdedede, { pos: [0.085, 0.035, 0.07], rot: [0, -0.9, 0], scale: [0.012, 0.012, 0.09], outline: 0.5 }),
          this.add(hc, G.box(), this.mat(sc.lens || 0x33ff66, { basic: true, opacity: 0.55 }), { pos: [0.045, 0.006, R * 1.02 + 0.012], scale: [0.05, 0.036, 0.004], outline: 0, basic: true, shadow: false, name: 'scouter:lens' }),
        ];
      }
      if (o.headband !== undefined) {
        this.add(hc, G.torus(R * 0.97, 0.013), o.headband, { pos: [0, 0.056, -0.006], rot: [Math.PI / 2 - 0.2, 0, 0], outline: 0.6 });
        for (const s of [1, -1]) this.add(hc, G.box(), o.headband, { pos: [s * 0.025, 0.0, -R * 1.02], rot: [0.35, 0, s * 0.25], scale: [0.022, 0.13, 0.008], outline: 0.5 });
      }
      if (o.turban !== undefined) {
        this.add(hc, S, o.turban, { pos: [0, R * 0.42, -R * 0.02], scale: [R * 1.1, R * 0.72, R * 1.12], outline: 0.9 });
        this.add(hc, S, o.turbanBand !== undefined ? o.turbanBand : 0x6a2a8a, { pos: [0, R * 0.18, 0], scale: [R * 1.06, R * 0.16, R * 1.08], outline: 0.5 });
      }
      if (o.shades !== undefined) {
        // round black sunglasses (King Kai)
        for (const s of [1, -1]) this.add(hc, S, this.mat(o.shades, { basic: true }), { pos: [s * R * 0.36, R * 0.12, R * 0.9], scale: [R * 0.28, R * 0.24, R * 0.1], outline: 0.5, basic: true });
        this.add(hc, G.box(), o.shades, { pos: [0, R * 0.14, R * 0.98], scale: [R * 0.2, R * 0.05, R * 0.04], outline: 0 });
      }
      if (o.cap !== undefined) {
        // round child's cap, optionally crowned with an ornament (Kid Gohan's Dragon Ball)
        this.add(hc, G.hemi(), o.cap, { pos: [0, R * 0.22, -R * 0.02], scale: [R * 1.12, R * 1.05, R * 1.14], outline: 0.8 });
        if (o.capBall !== undefined) {
          this.add(hc, S, o.capBall, { pos: [0, R * 1.3, 0], scale: R * 0.3, outline: 0.6 });
          if (o.capStars) for (let i = 0; i < o.capStars; i++) this.add(hc, S, 0xd0201a, { pos: [(i % 2 ? 1 : -1) * R * 0.08, R * 1.3 + ((i >> 1) % 2 ? 1 : -1) * R * 0.08, R * 0.29], scale: R * 0.045, outline: 0, shadow: false });
        }
      }
      if (o.helmet !== undefined) {
        // a full helmet: dome over the skull, a jaw guard, and a visor across the eyes.
        // The face stays under it, so expressions still read where the visor is see-through.
        this.add(hc, G.hemi(), o.helmet, { pos: [0, R * 0.06, -R * 0.02], scale: [R * 1.16, R * 1.24, R * 1.18], outline: 1 });
        this.add(hc, G.box(), o.helmet, { pos: [0, -R * 0.52, R * 0.12], scale: [R * 1.1, R * 0.34, R * 1.5], outline: 0.8 });
        const visor = o.visor !== undefined ? o.visor : 0x2a2f3a;
        this.add(hc, G.box(), this.mat(visor, { basic: true, opacity: o.visorOpacity === undefined ? 0.62 : o.visorOpacity }), { pos: [0, R * 0.12, R * 0.92], scale: [R * 1.06, R * 0.42, R * 0.2], outline: 0.4, basic: true, shadow: false });
        if (o.helmetTrim !== undefined) this.add(hc, G.box(), o.helmetTrim, { pos: [0, R * 0.42, R * 0.86], scale: [R * 0.9, R * 0.12, R * 0.22], outline: 0.5 });
        if (o.antenna !== undefined) {
          for (const s of [1, -1]) this.add(hc, G.box(), o.antenna, { pos: [s * R * 0.62, R * 0.98, -R * 0.1], rot: [0, 0, s * 0.35], scale: [R * 0.07, R * 0.5, R * 0.07], outline: 0.6 });
        }
      }
      // horns, crests and antennae go in their own group: a form can swap the whole
      // set (see setForm / look.headExtras), which is what makes a transformation
      // change the silhouette rather than only the colours
      this.headExtraGroup = new THREE.Group();
      hc.add(this.headExtraGroup);
      this.headExtraR = R;
      this._setHeadExtras(a.headExtras);
      if (a.hair) this.setHair(a.hair.style, a.hair.color);
    }

    /** Rebuilds the head extras (horns and the like) from a list; null clears them. */
    _setHeadExtras(list) {
      const g = this.headExtraGroup;
      if (!g) return;
      // geometry and materials here come from the shared pools, so dropping the
      // children is all that is needed
      for (let i = g.children.length - 1; i >= 0; i--) g.remove(g.children[i]);
      this._headExtras = list || null;
      if (!list) return;
      const skin = this.app.skin;
      for (const ex of list) this._spike(g, ex, ex.color !== undefined ? ex.color : skin, this.headExtraR);
    }

    _spike(parent, sp, color, R) {
      const dir = new THREE.Vector3(sp.d[0], sp.d[1], sp.d[2]).normalize();
      const anchor = new THREE.Vector3(sp.a[0], sp.a[1], sp.a[2]);
      if (anchor.lengthSq() > 0) anchor.normalize().multiplyScalar(R * (sp.depth || 0.82));
      // 'ball' extras are ellipsoids (muzzles, cheeks, round ears); 'bar' extras are flat strokes
      // painted on the skin (the Majin mark); default extras are cones (horns, antennae, spikes)
      // 'line' is a painted stroke like 'bar' (a crease, a vein), kept apart so it is never taken for the mark
      const painted = sp.shape === 'bar' || sp.shape === 'line';
      const geo = sp.shape === 'ball' ? G.sphere() : painted ? G.box() : G.cone();
      const m = this.add(parent, geo, color, { scale: [sp.r, sp.l, sp.r * (sp.flat || 0.7)], outline: sp.outline === undefined ? (painted ? 0 : 0.8) : sp.outline, shadow: !painted });
      if (painted) {
        // a stroke starts on the skin where `a` points and runs along it toward `d`: centred on the
        // skull's surface (not a sphere inside it) and turned flat to it, so neither end sinks into the
        // head or lifts off it (the Majin M's diagonals used to vanish into the forehead)
        const onSkull = (v) => {
          const u = v.clone().normalize();
          return u.multiplyScalar((R * (sp.depth || 1.006)) / Math.hypot(u.x / SKULL[0], u.y / SKULL[1], u.z / SKULL[2]));
        };
        const normal = (p) => new THREE.Vector3(p.x / SKULL[0] ** 2, p.y / SKULL[1] ** 2, p.z / SKULL[2] ** 2).normalize();
        const start = onSkull(anchor);
        let n = normal(start);
        const along = dir.clone().addScaledVector(n, -dir.dot(n)).normalize();
        const mid = onSkull(start.clone().addScaledVector(along, sp.l / 2));
        n = normal(mid);
        const y = along.addScaledVector(n, -along.dot(n)).normalize();
        m.position.copy(mid);
        m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(y, n), y, n));
        return m;
      }
      m.position.copy(anchor);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      if (sp.twist) m.rotateY(sp.twist);
      return m;
    }

    /** Builds (once) and shows a hair style in a color. */
    setHair(style, color) {
      const key = style + '|' + color;
      if (this.currentHair === key) return;
      for (const k of Object.keys(this.hairGroups)) this.hairGroups[k].visible = false;
      let g = this.hairGroups[key];
      if (!g) {
        const def = SL.data.hair[style];
        if (!def) {
          SL.warn('missing hair style', style);
          return;
        }
        g = new THREE.Group();
        const R = this.b.headR;
        const hairMat = this.mat(color);
        if (def.glow) {
          hairMat.emissive = new THREE.Color(def.glow);
          hairMat.userData.baseEmissive = new THREE.Color(def.glow);
        }
        if (def.cap !== false) {
          const cap = def.cap || {};
          // the cap is the scalp: it may never be smaller than the skull under it (a sphere scaled
          // 1 / 1.06 / 1.02, see _buildHead) or the crown pushes through it as a bald patch — which
          // several styles did (Future Trunks and Bulma 1.04, Videl 1.02, adult Gohan 1.0). A style
          // that means to show scalp (a crest, a shaved head) says so with `partial`.
          const least = cap.partial ? [0, 0, 0] : SKULL_COVER;
          const m = this.add(g, G.hemi(), hairMat, { scale: [R * Math.max(least[0], cap.sx || 1.07), R * Math.max(least[1], cap.sy || 1.1), R * Math.max(least[2], cap.sz || 1.09)], outline: 0.9 });
          m.rotation.set(cap.tilt === undefined ? -0.5 : cap.tilt, 0, 0);
          m.position.set(0, cap.y || 0.004, cap.z || -0.006);
        }
        // a piece may have its own colour (a hair tie); everything else is the hair
        const matOf = (sp) => (sp.color !== undefined ? this.mat(sp.color) : hairMat);
        for (const sp of def.spikes || []) this._spike(g, sp, matOf(sp), R);
        if (def.mirror) {
          for (const sp of def.mirror) {
            this._spike(g, sp, matOf(sp), R);
            this._spike(g, { ...sp, a: [-sp.a[0], sp.a[1], sp.a[2]], d: [-sp.d[0], sp.d[1], sp.d[2]], twist: sp.twist ? -sp.twist : 0 }, matOf(sp), R);
          }
        }
        // hair gravity (style.gravity 0..1): how much a long mane resists turning with the head (Animator)
        g.userData.gravity = def.gravity || 0;
        this.headCenter.add(g);
        this.hairGroups[key] = g;
        this.setOutlines(this._outlinesOn !== false);
      }
      g.visible = true;
      this.currentHair = key;
    }

    currentHairGroup() {
      return this.currentHair ? this.hairGroups[this.currentHair] : null;
    }

    /** Applies visual changes of a form (hair, eyes, muscle, tint). */
    setForm(form) {
      const a = this.app;
      const look = (form && form.look) || {};
      const hair = look.hair || a.hair;
      if (hair) this.setHair(hair.style || a.hair.style, hair.color !== undefined ? hair.color : a.hair.color);
      const f = a.face || {};
      this.face.pupilMat.color.set(look.pupil !== undefined ? look.pupil : f.pupil !== undefined ? f.pupil : 0x1a1a22);
      const browColor = look.brow !== undefined ? look.brow : f.brow !== undefined ? f.brow : a.hair ? a.hair.color : 0x222222;
      this.face.browMat.color.set(browColor);
      // a form can carry its own horns and its own overall size: Frieza's forms grow
      // and then shrink again, and later characters (Cell, Buu) need the same
      const extras = look.headExtras !== undefined ? look.headExtras : a.headExtras;
      if (extras !== this._headExtras) this._setHeadExtras(extras);
      // look.longTail false: a form that keeps its tail out of sight (Perfect Cell)
      if (this.longTailBase) this.longTailBase.visible = look.longTail !== false;
      if ((look.pupilScale || 1) !== (this._pupilBase || 1)) {
        this._pupilBase = look.pupilScale || 1;
        if (this.face && this.face.pupils) this._applyEyes();
      }
      const scale = look.scale || 1;
      if (this.root && this._lookScale !== scale) {
        this._lookScale = scale;
        // baseScale is the character's own size; a form scales on top of it
        this.root.scale.setScalar(this.baseScale * scale);
      }
      this.formScale = look.bulk || 1;
      // look.muscle: a heavier build for a form (arms, legs, neck), not only a bigger chest
      const mus = look.muscle || 1;
      if (this.girth && this._muscle !== mus) {
        this._muscle = mus;
        for (const g of this.girth) g.mesh.scale.set(g.x * mus, g.y * (1 + (mus - 1) * g.gy), g.z * mus);
      }
      if (this._torn) {
        const was = this._torn;
        this._torn = null;
        this.setTorn(was);
      }
      const lz = this._loose || 1;
      this.chestMesh.scale.set((this.b.chestW / 0.2) * this.formScale * lz, 1 + (this.formScale - 1) * 0.5, (this.b.chestD / 0.2) * 1.02 * this.formScale * lz);
      if (look.tint !== undefined) {
        this.tintColor.set(look.tint);
        this.tintAmount = look.tintAmount || 0.3;
      } else this.tintAmount = 0;
      if (this._worn) this.setWorn(true);
      if (this._battered) this.setBattered(true);
      this._updateEmissive();
    }

    /**
     * Battered (what the Spirit Bomb left of Frieza): a dark, bruised cast over the whole
     * model that survives form changes. Level 1 prototype, like setTorn.
     */
    /** Battle-worn: dust and grime over the whole body, lighter than the torn gi's. Survives form changes. */
    setWorn(on) {
      this._worn = !!on;
      if (on) {
        this.tintColor.set(0x5a4a38);
        this.tintAmount = Math.max(this.tintAmount || 0, 0.1);
      } else if (this.tintAmount === 0.1) {
        this.tintAmount = 0;
      }
      this._updateEmissive();
    }

    setBattered(on) {
      this._battered = !!on;
      if (on) {
        this.tintColor.set(0x6a1c1c);
        this.tintAmount = Math.max(this.tintAmount || 0, 0.2);
      } else if (this.tintAmount === 0.2) {
        this.tintAmount = 0;
      }
      this._updateEmissive();
    }

    /**
     * Battle damage: the gi comes apart. The torso meshes lose their cloth colour
     * for skin, the trim (lapels, V-neck, sleeves) is gone, and a dirt tint goes
     * over the whole model. Level 1 prototype: the silhouette changes, the shading
     * changes, and a production .glb can replace it without touching this call.
     */
    setTorn(on) {
      if (!this.gi || this._torn === !!on) return;
      this._torn = !!on;
      const skin = this.app.skin;
      // what is left under the gi is the outfit's to say (outfit.torn: chest / trap / abs colours,
      // 'skin' for bare, and keepSleeve 'L' or 'R'); by default the chest is bare and the belly band stays
      const t = (this.app.outfit && this.app.outfit.torn) || {};
      const paint = (m, c) => {
        if (!m) return;
        if (!m.userData.dressed) m.userData.dressed = m.material;
        m.material = on ? this.mat(c === undefined || c === 'skin' ? skin : c) : m.userData.dressed;
      };
      for (const m of this.gi.torso) paint(m, m === this.gi.trap && t.trap !== undefined ? t.trap : t.chest);
      if (t.abs !== undefined) paint(this.gi.abs, t.abs);
      // a jacket outfit: the jacket comes off (torn.jacket 'off'), and the sleeves were the jacket's
      if (t.jacket === 'off' && this.jacket) {
        for (const m of this.jacket) m.visible = !on;
        for (const m of this.emblems || []) if (m.name === 'emblem:sleeve') m.visible = !on;
      }
      if (t.sleeves !== undefined && this.sleeveMeshes) for (const m of this.sleeveMeshes) paint(m, t.sleeves);
      for (const m of this.gi.trim.concat(this.gi.sleeves)) {
        if (!m) continue;
        const keep = on && t.keepSleeve && (t.keepSleeve === 'both' ? !!m.userData.side : m.userData.side === t.keepSleeve);
        m.visible = !on || keep;
        if (m.children) for (const c of m.children) c.visible = m.visible;
      }
      // dirt over everything, on top of whatever the form already tinted
      if (on) {
        this.tintColor.set(0x5a4a38);
        this.tintAmount = Math.max(this.tintAmount || 0, 0.16);
      } else if (this.tintAmount === 0.16) {
        this.tintAmount = 0;
      }
      this._updateEmissive();
    }

    /**
     * CLOTHING DAMAGE LEVELS (0 intact · 1 damaged · 2 heavily damaged · 3 torn), read from the
     * outfit's own `damage` data, so every outfit tears its own way:
     *   damage: { tearAt: 3, rips: [{ at, y | t, ang, w, h, fill, level, until, r }] }
     *   at    where the rip is: 'chest' / 'spine' (the belly) follow the torso's own profile;
     *         'thighL/R', 'kneeL/R' (shin), 'shoulderL/R' (upper arm), 'elbowL/R' (forearm)
     *         wrap the limb. y (torso, metres from the joint) or t (limb, 0..1 down it),
     *         ang (radians round the body, 0 = front, + = his left), w (radians wide), h (tall).
     *   fill  what shows through: 'skin', 'under' (the undershirt), or a colour
     *   level the first level it appears at; until: the last (a rip in the gi goes with the gi)
     * The gi itself comes off at `tearAt` (setTorn and the outfit's `torn` look), and dirt comes
     * with any damage (setWorn). Level 1 prototype pieces: a production .glb replaces them by
     * damage-level materials without touching the call.
     */
    setDamage(level) {
      const L = Math.max(0, Math.min(3, level | 0));
      this._damageLevel = L;
      const spec = this.app.outfit && this.app.outfit.damage;
      if (!spec || !spec.rips) return;
      if (!this._rips) this._rips = spec.rips.map((r) => this._buildRip(r)).filter(Boolean);
      for (const r of this._rips) r.mesh.visible = L >= r.spec.level && L <= (r.spec.until === undefined ? 3 : r.spec.until) && !this._stoneMats && !this._spiritMats;
    }

    _ripParent(at) {
      const b = this.b, o = this.app.outfit || {};
      const baggy = o.pantsStyle === 'gi';
      if (at === 'chest') return { node: this.chestMesh, pts: CHEST_PTS };
      if (at === 'spine') return { node: this.absMesh, pts: ABS_PTS };
      const side = at.slice(-1);
      const j = this.joints[at];
      if (!j) return null;
      if (at.startsWith('thigh')) return { node: j, r: b.thighR * (baggy ? 1.38 : 1), len: b.thighLen, side };
      if (at.startsWith('knee')) return { node: j, r: b.shinR * (baggy ? 1.36 : 1.02), len: b.shinLen * (baggy ? 0.6 : 1), side };
      if (at.startsWith('shoulder')) return { node: j, r: b.upperArmR * (o.sleeves === 'long' ? o.sleeveBulk || 1 : 1), len: b.upperArmLen, side };
      if (at.startsWith('elbow')) return { node: j, r: b.foreArmR * (o.gloves !== undefined && o.gloves !== null ? 1.2 : 1), len: b.foreArmLen, side };
      return null;
    }

    /** A patch that hugs the body where the cloth is gone (see setDamage); also Buu's wounds. */
    _buildRip(r, tex) {
      const P = this._ripParent(r.at);
      if (!P || !P.node) return null;
      const o = this.app.outfit || {};
      const fill = r.fill === 'under' ? (o.under !== undefined ? o.under : this.app.skin) : r.fill === undefined || r.fill === 'skin' ? this.app.skin : r.fill;
      const cloth = r.cloth !== undefined ? r.cloth : r.at === 'chest' || r.at === 'spine' ? (o.top !== undefined ? o.top : this.app.skin) : o.pants !== undefined ? o.pants : this.app.skin;
      const map = tex || SL.Toon.ripTexture(fill, cloth, r.seed || (r.at.length * 7 + Math.round((r.y || r.t || 0) * 100)));
      const key = 'rip:' + map.uuid;
      let mat = this.mats.get(key);
      if (!mat) {
        mat = SL.Toon.makeMat(0xffffff, { map, rim: { color: this.rimColor.getHex(), strength: this.rimStrength } });
        mat.alphaTest = 0.5;
        mat.userData.baseEmissive = new THREE.Color(0, 0, 0);
        mat.userData.skin = fill === this.app.skin;
        this.mats.set(key, mat);
      }
      const w = r.w || 0.6, h = r.h || 0.08, ang = r.ang || 0;
      let radius, y;
      if (P.pts) {
        // on the torso: the radius of its own lathe profile at that height, a hair outside it
        y = r.y || 0.15;
        const pts = P.pts;
        let rad = pts[0][0];
        for (let i = 1; i < pts.length; i++) {
          if (y <= pts[i][1]) {
            const [r0, y0] = pts[i - 1], [r1, y1] = pts[i];
            rad = r0 + ((r1 - r0) * (y - y0)) / Math.max(1e-6, y1 - y0);
            break;
          }
          rad = pts[i][0];
        }
        radius = rad * 1.03;
      } else {
        // limbs hang down from their joint: a band round the limb at t of its length (sides mirror)
        radius = P.r * 1.05;
        y = -(r.t === undefined ? 0.5 : r.t) * P.len;
      }
      const a = P.side === 'R' ? -ang : ang;
      const g = new THREE.CylinderGeometry(radius, radius, h, 10, 1, true, a - w / 2, w);
      const mesh = new THREE.Mesh(g, mat);
      mesh.position.y = y;
      mesh.userData.rip = true;
      mesh.renderOrder = 1;
      mesh.visible = false;
      P.node.add(mesh);
      return { mesh, spec: r };
    }

    /**
     * A wound that closes (Majin Buu): a hole in the body that shrinks away over `seconds`.
     * Returns { mesh, t, life } for the caller to advance with updateWounds(dt).
     */
    addWound(at, y, ang, size = 0.5, seconds = 2.2) {
      const tex = SL.Toon.woundTexture();
      const rip = this._buildRip({ at, y, t: y, ang, w: size, h: size * 0.22, fill: 0x3a0a24 }, tex);
      if (!rip) return null;
      rip.mesh.visible = !this._stoneMats && !this._spiritMats;
      const wd = { mesh: rip.mesh, t: 0, life: seconds, base: rip.mesh.scale.clone() };
      (this._wounds = this._wounds || []).push(wd);
      return wd;
    }

    updateWounds(dt) {
      if (!this._wounds || !this._wounds.length) return;
      for (let i = this._wounds.length - 1; i >= 0; i--) {
        const w = this._wounds[i];
        w.t += dt;
        const k = Math.max(0, 1 - w.t / w.life);
        // the skin pulls shut from the edges: narrower first, then gone
        w.mesh.scale.set(k, Math.max(0.05, k * k), k);
        if (w.t >= w.life) {
          if (w.mesh.parent) w.mesh.parent.remove(w.mesh);
          w.mesh.geometry.dispose();
          this._wounds.splice(i, 1);
        }
      }
    }

    get openWounds() {
      return this._wounds ? this._wounds.length : 0;
    }

    /**
     * Rage: the anime shorthand for a character breaking — the upper face falls
     * into shadow, a hard red line cuts across it just above the brows, and tears
     * run from the eyes and stay there. The eyes stay visible under the shadow.
     *
     * A cinematic state, not a form and not a face texture. It is built the
     * first time it is asked for from pieces that follow the curve of the skull
     * (a shell for the shadow, an arc for the line, streaks for the tears), lives
     * on the head group so it follows every pose and camera, and
     * `setRage(false)` takes it off again. `amount` stages it: the tears come
     * first (from 0.2) and the shadow gathers (from 0.45), so a scene can walk a
     * face from grief to fury. There is no red line on the face: the owner found
     * it drawn across Gohan's eyes (2026-10-01) — the red line belongs to the
     * screen (SL.ScreenFX.redLine), in the scene that needs it.
     * A production .glb can replace the pieces without touching the call.
     */
    /**
     * Stone (Dabura's spit): every shaded surface becomes the same grey rock —
     * skin, cloth and hair alike — while the outlines stay, so the silhouette
     * reads as a statue of the fighter. Materials are swapped, not tinted (a
     * tint only adds light and leaves an orange gi orange); the originals come
     * back exactly when the stone breaks.
     */
    setStone(on, kind) {
      if (!!on === !!this._stoneMats) return;
      if (on) {
        // Buu's candy is the same state in another material: pink sugar (or chocolate) instead of grey rock
        const candy = kind === 'candy', choc = kind === 'chocolate';
        const rock = this.mat(candy ? 0xf590c8 : choc ? 0x6a3a22 : 0x8e8a84);
        // a cape or a sash is drawn from both sides: its stone has to be too
        const key = candy ? '_candyDouble' : choc ? '_chocDouble' : '_rockDouble';
        const rock2 = this[key] || (this[key] = Object.assign(rock.clone(), { side: THREE.DoubleSide }));
        this._stoneMats = [];
        this.root.traverse((o) => {
          if (o.userData.rip) {
            this._stoneMats.push([o, o.material, o.visible]);
            o.visible = false;
            return;
          }
          const m = o.isMesh && o.material;
          // shaded surfaces and the flat-coloured face details; never outlines or anything see-through (auras)
          if (!m || Array.isArray(m) || m.transparent || (m.type !== 'MeshToonMaterial' && m.type !== 'MeshBasicMaterial')) return;
          this._stoneMats.push([o, m]);
          o.material = m.side === THREE.DoubleSide ? rock2 : rock;
        });
      } else {
        for (const [o, m, v] of this._stoneMats) {
          o.material = m;
          if (v !== undefined) o.visible = v;
        }
        this._stoneMats = null;
      }
    }

    /**
     * A spirit: the body is seen through (a pale, lit, translucent material), the ink
     * outlines go, and `spiritLevel` sets how present it is. Used for the dead appearing
     * to the living (Goku behind his son in the last stand). The originals come back.
     */
    setSpirit(on) {
      if (!!on === !!this._spiritMats) return;
      if (on) {
        const mat = this._spiritMat || (this._spiritMat = new THREE.MeshLambertMaterial({ color: 0xd8ecff, emissive: 0x4a6a9a, transparent: true, opacity: 0.5, depthWrite: false }));
        this._spiritMats = [];
        this.root.traverse((o) => {
          const m = o.isMesh && o.material;
          if (!m || Array.isArray(m)) return;
          if (o.userData.rip) {
            this._spiritMats.push([o, m, o.visible]);
            o.visible = false;
            return;
          }
          if (m.type === 'ShaderMaterial') {
            this._spiritMats.push([o, m, o.visible]);
            o.visible = false; // outlines
            return;
          }
          if (m.transparent && m !== mat) return; // auras and glows keep their own look
          this._spiritMats.push([o, m, o.visible]);
          o.material = mat;
        });
      } else {
        for (const [o, m, v] of this._spiritMats) {
          o.material = m;
          o.visible = v;
        }
        this._spiritMats = null;
      }
    }

    setSpiritLevel(v) {
      if (this._spiritMat) this._spiritMat.opacity = Math.max(0, Math.min(1, v));
    }

    setRage(on, amount = 1) {
      const want = !!on;
      if (!want && !this._rage) return;
      if (!this._rage) this._buildRage();
      const r = this._rage;
      r.group.visible = want;
      this._ragedAmount = want ? U.clamp01(amount) : 0;
      const a = this._ragedAmount;
      const shade = U.clamp01((a - 0.45) / 0.55);
      r.shadow.material.opacity = shade * 0.55;
      r.shadow.visible = shade > 0;
      for (const t of r.tears) {
        t.visible = want && a >= 0.2;
        t.scale.y = 0.55 + a * 0.45;
      }
      this._ragedOn = want;
    }

    _buildRage() {
      const R = this.b.headR;
      const hc = this.headCenter;
      const g = new THREE.Group();
      g.visible = false;
      // the shadow: a thin shell over the front of the skull from the eye line to the hairline
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a060e, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      this.mats.set('rageShadow', shadowMat);
      const shadowGeo = new THREE.SphereGeometry(R * 1.012, 18, 8, Math.PI / 2 - 1.15, 2.3, 0.92, 0.62);
      this.geos = this.geos || [];
      this.geos.push(shadowGeo);
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.renderOrder = 3;
      g.add(shadow);
      // tears: a thin streak from each eye down the cheek, ending in a drop
      const tearMat = new THREE.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.8, depthWrite: false });
      this.mats.set('rageTear', tearMat);
      const streakGeo = new THREE.CylinderGeometry(R * 0.02, R * 0.028, R * 0.24, 6);
      streakGeo.translate(0, -R * 0.12, 0);
      const dropGeo = new THREE.SphereGeometry(R * 0.038, 8, 6);
      dropGeo.translate(0, -R * 0.25, 0);
      this.geos.push(streakGeo, dropGeo);
      const tears = [];
      for (const s of [1, -1]) {
        const t = new THREE.Group();
        t.position.set(s * R * 0.4, -R * 0.08, R * 0.93);
        t.rotation.x = -0.32;
        t.rotation.z = s * 0.08;
        const streak = new THREE.Mesh(streakGeo, tearMat);
        const drop = new THREE.Mesh(dropGeo, tearMat);
        streak.renderOrder = 4;
        drop.renderOrder = 4;
        t.add(streak, drop);
        t.visible = false;
        g.add(t);
        tears.push(t);
      }
      hc.add(g);
      this._rage = { group: g, shadow, tears };
    }

    /**
     * A blush: two soft pink patches on the cheeks (Vegeta in Bulma's arms, pretending to be annoyed).
     * Built the first time it is asked for, on the head group, so it follows every pose.
     */
    setBlush(on) {
      if (!on && !this._blush) return;
      if (!this._blush) {
        const R = this.b.headR;
        const mat = new THREE.MeshBasicMaterial({ color: 0xff7a8a, transparent: true, opacity: 0.55, depthWrite: false });
        this.mats.set('blush', mat);
        const geo = new THREE.SphereGeometry(R * 0.16, 10, 6);
        this.geos = this.geos || [];
        this.geos.push(geo);
        const g = new THREE.Group();
        for (const s of [1, -1]) {
          const p = new THREE.Mesh(geo, mat);
          p.position.set(s * R * 0.52, -R * 0.22, R * 0.8);
          p.scale.set(1.3, 0.55, 0.35);
          p.renderOrder = 3;
          g.add(p);
        }
        this.headCenter.add(g);
        this._blush = g;
      }
      this._blush.visible = !!on;
    }

    setExpression(name) {
      const e = EXPRESSIONS[name] || EXPRESSIONS.neutral;
      if (this._expr === name) return;
      this._expr = name;
      this.expr = e;
      const R = this.b.headR;
      this.face.brows.forEach((br, i) => {
        const s = i === 0 ? 1 : -1;
        br.rotation.set(0, s * 0.35, s * e.brow);
        br.position.y = 0.036 + e.browY;
      });
      this.face.lashes.forEach((l, i) => {
        const s = i === 0 ? 1 : -1;
        l.rotation.set(0, s * 0.38, s * e.lash);
      });
      const m = this.face.mouth;
      m.scale.set(0.03 * e.mouthW, 0.005 * e.mouthH, 0.01);
      m.position.y = -0.062 - (e.mouthH - 1) * 0.0015;
      m.position.z = R * 0.83;
      m.rotation.z = e.mouthRot || 0;
      this.face.teeth.visible = !!e.teeth;
      this.face.teeth.position.y = m.position.y + 0.005 * e.mouthH * 0.35;
      this.face.teeth.scale.x = 0.026 * e.mouthW;
      this._applyEyes();
    }

    _applyEyes() {
      const e = this.expr;
      const blink = this.blinkT > 0 ? Math.max(0.08, Math.abs(Math.cos((this.blinkT / 0.14) * Math.PI))) : 1;
      const h = e.eyeH * blink;
      const eh = this._eyeH || 1;
      this.face.eyes.forEach((ey) => (ey.scale.y = 0.02 * h * eh));
      // a scene's shrink (setPupilScale) times the form's own size (look.pupilScale: Super Saiyan 3's points)
      const ps = (this._pupilS || 1) * (this._pupilBase || 1);
      this.face.pupils.forEach((p) => {
        p.scale.y = 0.0145 * Math.min(1, h + 0.12) * eh * ps;
        p.scale.x = 0.0105 * ps;
      });
      this.face.lights.forEach((l) => (l.visible = h > 0.45 && ps > 0.6));
    }

    /** Pupils shrunk to points (shock, the moment something breaks); 1 puts them back. */
    setPupilScale(s) {
      this._pupilS = s;
      this._applyEyes();
    }

    /**
     * Secondary motion, called once per simulation tick.
     * motion: { fwd, side, up } velocity in character space (m/s), turn rate (rad/s).
     */
    tick(dt, motion) {
      if (this.expr.eyeH > 0.3) {
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0 && this.blinkT <= 0) {
          this.blinkT = 0.14;
          this.blinkTimer = 2 + Math.random() * 3.5;
        }
      }
      if (this.blinkT > 0) {
        this.blinkT -= dt;
        this._applyEyes();
        if (this.blinkT <= 0) this._applyEyes();
      }
      const mo = motion || { fwd: 0, side: 0, up: 0, turn: 0 };
      const tx = U.clamp(-mo.fwd * 0.006 + mo.up * 0.004, -0.2, 0.16);
      const tz = U.clamp(mo.side * 0.006 + mo.turn * 0.03, -0.18, 0.18);
      const hx = this.hairSwayX.step(tx, dt);
      const hz = this.hairSwayZ.step(tz, dt);
      const hg = this.currentHairGroup();
      if (hg) hg.rotation.set(hx, 0, hz);
      if (this.tailSegs) {
        this.tailTime = (this.tailTime || 0) + dt;
        const tt = this.tailTime;
        for (const sg of this.tailSegs) {
          sg.node.rotation.x = sg.curl * 2.2 + Math.sin(tt * 1.4 + sg.i * 0.55) * 0.09 + U.clamp(mo.fwd * 0.004, -0.2, 0.2);
          sg.node.rotation.z = Math.sin(tt * 1.1 + sg.i * 0.7) * 0.16 + U.clamp(mo.turn * 0.02, -0.2, 0.2);
        }
      }
      if (this.hem) {
        // a leg forward lifts the front half of the hem, a leg back lifts the back half
        const a = this.joints.thighL.rotation.x, b2 = this.joints.thighR.rotation.x;
        const fwd = Math.max(0, -Math.min(a, b2)), back = Math.max(0, Math.max(a, b2));
        for (const h of this.hem) h.node.rotation.x = h.front ? -fwd * 0.82 : back * 0.82;
      }
      for (const c of this.cloth) {
        const cx = c.sx.step(U.clamp(mo.fwd * 0.03 * c.amount + mo.up * 0.02, -0.9, 1.1), dt);
        const cz = c.sz.step(U.clamp(-mo.side * 0.03 * c.amount, -0.8, 0.8), dt);
        c.node.rotation.set(c.cape ? cx * 0.8 : cx, 0, cz);
      }
    }

    /**
     * What a Spirit Bomb leaves of a tail: the segments past `keep` (0..1) are gone. The
     * stump stays and keeps moving. keep = 1 restores it.
     */
    cutTail(keep = 0.5) {
      if (!this.tailSegs) return;
      const n = this.tailSegs.length;
      const from = Math.max(1, Math.round(n * keep));
      for (const sg of this.tailSegs) {
        const gone = sg.i >= from;
        sg.node.scale.setScalar(gone ? 0.001 : 1);
      }
      this.tailCut = keep < 1;
    }

    /**
     * What a Death Saucer leaves of somebody who led it back over himself: everything below the
     * waist is gone. Cinematic only, and built the same way as cutTail — the joints are scaled
     * away, so a production .glb can replace it without touching the call. Nothing graphic is
     * added; the silhouette does the work.
     */
    setHalved(on) {
      const j = this.joints;
      if (!j) return;
      this._halved = !!on;
      for (const k of ['thighL', 'thighR']) if (j[k]) j[k].scale.setScalar(on ? 0.001 : 1);
    }

    /** Rim light follows aura: color and strength (0..1.2). */
    setRim(color, strength) {
      if (color !== undefined && color !== null) this.rimColor.set(color);
      this.rimStrength = strength;
      for (const m of this.mats.values()) {
        const r = m.userData.rim;
        if (!r) continue;
        r.color.copy(this.rimColor);
        r.strength.value = strength;
      }
    }

    setFlash(v) {
      if (Math.abs(v - this.flashAmount) < 0.01) return;
      this.flashAmount = v;
      this._updateEmissive();
    }

    _updateEmissive() {
      const fl = this.flashAmount;
      for (const m of this.mats.values()) {
        if (m.userData.basic || !m.emissive) continue;
        const base = m.userData.baseEmissive;
        m.emissive.setRGB(fl, fl, fl);
        if (base) m.emissive.r = Math.max(m.emissive.r, base.r), m.emissive.g = Math.max(m.emissive.g, base.g), m.emissive.b = Math.max(m.emissive.b, base.b);
        if (this.tintAmount > 0) m.emissive.lerp(this.tintColor, this.tintAmount * (m.userData.skin ? 1 : 0.6));
      }
    }

    setOutlines(on) {
      this._outlinesOn = on;
      for (const o of this.outlines) o.visible = on;
    }

    setVisible(v) {
      this.root.visible = v;
    }

    dispose() {
      if (this.root.parent) this.root.parent.remove(this.root);
      for (const m of this.mats.values()) m.dispose();
      if (this._rockDouble) this._rockDouble.dispose();
      if (this._spiritMat) this._spiritMat.dispose();
      this.mats.clear();
      // geometry built for this model alone (the rage pieces); shared geometry lives in the cache
      for (const geo of this.geos || []) geo.dispose();
      this.geos = [];
    }
  }

  SL.Model = Model;
  SL.Spring = Spring;
  SL.EXPRESSIONS = EXPRESSIONS;
  SL.ModelBuilder = {
    /** Procedural body, or an imported .glb body when def.model.type is 'glb'. */
    build(def) {
      if (def.model && def.model.type === 'glb') return new SL.GLBModel(def);
      return new Model(def);
    },
    geoCache,
  };
})();
