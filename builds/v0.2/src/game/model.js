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
        new THREE.LatheGeometry(
          [[0.0, -0.07], [0.135, -0.065], [0.165, 0.0], [0.195, 0.1], [0.212, 0.19], [0.205, 0.25], [0.165, 0.3], [0.09, 0.335], [0.0, 0.345]].map(([r, y]) => new THREE.Vector2(r, y)),
          24
        )
      ),
    abs: () =>
      geo('absLathe', () =>
        new THREE.LatheGeometry(
          [[0.0, -0.05], [0.118, -0.045], [0.128, 0.03], [0.134, 0.13], [0.15, 0.22], [0.0, 0.25]].map(([r, y]) => new THREE.Vector2(r, y)),
          22
        )
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
      this.add(spine, G.abs(), o.abs !== undefined ? o.abs : top, { pos: [0, 0, 0], scale: [b.waistW / 0.13, b.absLen / 0.2, (b.waistD / 0.13) * 0.95] });
      this.chestMesh = this.add(chest, G.chest(), top, { pos: [0, 0, 0.004], scale: [b.chestW / 0.2, 1, (b.chestD / 0.2) * 1.02] });
      if (o.topStyle === 'bare' || o.pecs) {
        const pc = o.pecs || skin;
        for (const s of [1, -1]) this.add(chest, S, pc, { pos: [s * 0.075, 0.16, b.chestD * 0.62], scale: [0.075, 0.055, 0.045], outline: 0.4 });
      }
      this.add(neck, G.limb(b.neckR, b.neckLen + 0.05), skin, { pos: [0, b.neckLen + 0.04, 0], outline: 0.7 });
      // trapezius gives a heavier, more heroic neck line
      this.add(chest, S, o.topStyle === 'gi' && o.under !== undefined ? o.under : top, { pos: [0, b.chestTop - 0.035, -0.01], scale: [b.chestW * 0.55, 0.05, b.chestD * 0.62], outline: 0.5 });

      // gi specifics
      if (o.topStyle === 'gi') {
        if (o.under !== undefined) {
          // V-neck: undershirt diamond sunk into the sloped top of the chest, framed by the gi lapels
          const dz = b.chestD / 0.14;
          this.add(chest, G.box(), o.under, { pos: [0, 0.3, 0.118 * dz], rot: [-0.62, 0, Math.PI / 4], scale: [0.1, 0.1, 0.014], outline: 0.4 });
          for (const s of [1, -1]) this.add(chest, G.box(), top, { pos: [s * 0.042, 0.272, 0.136 * dz], rot: [-0.5, -s * 0.1, -s * 0.46], scale: [0.03, 0.15, 0.016], outline: 0.5 });
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
      if (o.emblem) {
        const tex = SL.Toon.emblemTexture(o.emblem.text, o.emblem.fg || '#111', o.emblem.bg || '#fff');
        const em = this.mat(0xffffff, { basic: true, map: tex });
        this.add(chest, G.circle(), em, { pos: [0.085, 0.17, b.chestD * 0.93 + 0.006], rot: [-0.18, 0.42, 0], scale: 0.036, outline: 0, shadow: false });
        this.add(chest, G.circle(), em, { pos: [0, 0.15, -b.chestD * 1.0 - 0.012], rot: [0.1, Math.PI, 0], scale: 0.07, outline: 0, shadow: false });
      }

      // armor
      if (o.armor) this._buildArmor(chest, spine, hips, o.armor);
      if (o.tail) this.add(spine, G.torus(1, 0.22), o.tail, { pos: [0, 0.045, -0.005], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.15, b.waistD * 1.25, 0.14], outline: 0.6 });
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
        this.add(sh, S, deltColor, { pos: [s * 0.01, -0.01, 0], scale: [b.delt * 1.05, b.delt, b.delt * 1.02] });
        this.add(sh, G.limb(b.upperArmR, b.upperArmLen), upperColor, {});
        // bicep bulge
        if (sleeves !== 'long') this.add(sh, S, upperColor, { pos: [0, -b.upperArmLen * 0.45, 0.012], scale: [b.upperArmR * 1.02, b.upperArmLen * 0.28, b.upperArmR * 1.12], outline: 0.4 });
        if (sleeves === 'short') this.add(sh, G.tube(b.upperArmR * 1.35, b.upperArmR * 1.22, b.upperArmLen * 0.42), sleeveColor, { pos: [0, 0.02, 0], outline: 0.8 });
        const foreColor = sleeves === 'long' ? sleeveColor : o.arms !== undefined ? o.arms : skin;
        this.add(el, G.limb(b.foreArmR, b.foreArmLen), foreColor, {});
        if (o.gloves !== undefined && o.gloves !== null) {
          this.add(el, G.tube(b.foreArmR * 1.22, b.foreArmR * 1.12, b.foreArmLen * 0.55), o.gloves, { pos: [0, -b.foreArmLen * 0.45, 0], outline: 0.8 });
        }
        if (o.wrist !== undefined && o.wrist !== null) {
          this.add(el, G.tube(b.foreArmR * 1.3, b.foreArmR * 1.24, 0.085), o.wrist, { pos: [0, -b.foreArmLen * 0.7, 0], outline: 0.8 });
        }
        const handColor = o.gloves !== undefined && o.gloves !== null ? o.gloves : skin;
        this._buildHand(hand, s, handColor, side);
      }

      // legs
      for (const s of [1, -1]) {
        const side = s > 0 ? 'L' : 'R';
        const th = J('thigh' + side, hips, s * b.hipX, -0.05, 0);
        const kn = J('knee' + side, th, 0, -b.thighLen, 0);
        const ft = J('foot' + side, kn, 0, -b.shinLen, 0);
        const pw = baggy ? 1.38 : 1;
        this.add(th, G.limb(b.thighR * pw, b.thighLen), pants, {});
        if (baggy) this.add(kn, G.tube(b.shinR * 1.55, b.shinR * 1.15, b.shinLen * 0.6), pants, { pos: [0, 0.03, 0] });
        else this.add(kn, G.limb(b.shinR, b.shinLen), o.legs !== undefined ? o.legs : pants, {});
        const boots = o.boots !== undefined ? o.boots : 0x333333;
        const bootTop = o.bootStyle === 'saiyan' ? 0.62 : 0.5;
        this.add(kn, G.tube(b.shinR * 1.32, b.shinR * 1.12, b.shinLen * bootTop + 0.03), boots, { pos: [0, -b.shinLen * (1 - bootTop), 0] });
        if (o.bootTrim !== undefined) this.add(kn, G.tube(b.shinR * 1.38, b.shinR * 1.36, 0.028), o.bootTrim, { pos: [0, -b.shinLen * (1 - bootTop) + 0.012, 0], outline: 0.6 });
        if (o.legBands !== undefined) this.add(kn, G.tube(b.shinR * 1.18, b.shinR * 1.16, 0.05), o.legBands, { pos: [0, -0.06, 0], outline: 0.6 });
        const fl = b.footLen;
        this.add(ft, S, boots, { pos: [0, -0.045, 0.04 * fl], scale: [0.068, 0.056, 0.13 * fl] });
        if (o.bootTip !== undefined) this.add(ft, S, o.bootTip, { pos: [0, -0.05, 0.12 * fl], scale: [0.06, 0.05, 0.056], outline: 0.7 });
      }

      this._buildHead(head);
      this.setExpression('neutral');
    }

    _buildHand(hand, s, color, side) {
      const b = this.b;
      const S = G.sphere();
      const F = b.fist;
      const fist = new THREE.Group();
      hand.add(fist);
      this.add(fist, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F * 1.05, F * 1.08] });
      for (let i = 0; i < 4; i++) {
        this.add(fist, G.sphereLo(), color, { pos: [(i - 1.5) * F * 0.42, -0.072, 0.03], scale: [F * 0.27, F * 0.24, F * 0.3], outline: 0.25, shadow: false });
      }
      this.add(fist, S, color, { pos: [-s * 0.035, -0.022, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });

      const open = new THREE.Group();
      hand.add(open);
      this.add(open, S, color, { pos: [0, -0.045, 0.004], scale: [F * 0.9, F * 1.02, F * 0.5] });
      for (let i = 0; i < 4; i++) {
        const fg = this.add(open, G.limb(0.0105, 0.058 - Math.abs(i - 1.5) * 0.006), color, { pos: [(i - 1.5) * F * 0.4, -0.085, 0.004], rot: [0.12, 0, (i - 1.5) * 0.09], outline: 0.3, shadow: false });
        fg.userData.finger = true;
      }
      this.add(open, G.limb(0.012, 0.05), color, { pos: [-s * F * 0.8, -0.03, 0.012], rot: [0.2, 0, -s * 0.85], outline: 0.3, shadow: false });

      const point = new THREE.Group();
      hand.add(point);
      this.add(point, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F, F * 1.05] });
      for (let i = 0; i < 2; i++) this.add(point, G.limb(0.0105, 0.06), color, { pos: [(i - 0.5) * F * 0.4 + s * F * 0.25, -0.085, 0.012], outline: 0.3, shadow: false });
      this.add(point, S, color, { pos: [-s * 0.035, -0.022, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });

      open.visible = false;
      point.visible = false;
      this.hands[side] = { fist, open, point, current: 'fist' };
    }

    /** Hand shapes: 'fist' | 'open' | 'point'. */
    setHands(l, r) {
      for (const [side, shape] of [['L', l], ['R', r]]) {
        const h = this.hands[side];
        if (!h || !shape || h.current === shape || !h[shape]) continue;
        h.fist.visible = shape === 'fist';
        h.open.visible = shape === 'open';
        h.point.visible = shape === 'point';
        h.current = shape;
      }
    }

    _buildCape(chest, color) {
      const b = this.b;
      const cape = new THREE.Group();
      cape.position.set(0, b.chestTop - 0.02, -b.chestD * 0.95);
      chest.add(cape);
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

    _buildArmor(chest, spine, hips, ar) {
      const b = this.b;
      const S = G.sphere();
      this.add(chest, G.chest(), ar.plate, { pos: [0, -0.005, 0.01], scale: [(b.chestW / 0.2) * 1.1, 0.96, (b.chestD / 0.2) * 1.18] });
      this.add(spine, G.abs(), ar.belly !== undefined ? ar.belly : ar.plate, { pos: [0, 0.01, 0.004], scale: [(b.waistW / 0.13) * 1.1, (b.absLen / 0.2) * 0.98, (b.waistD / 0.13) * 1.1] });
      if (ar.trim !== undefined) this.add(spine, G.torus(1, 0.12), ar.trim, { pos: [0, 0.2, 0.004], rot: [Math.PI / 2, 0, 0], scale: [b.chestW * 0.9, b.chestD * 1.02, 0.15], outline: 0.4 });
      const padStyle = ar.pads === undefined ? 'none' : ar.padStyle || 'up';
      if (padStyle !== 'none') {
        for (const s of [1, -1]) {
          const tilt = padStyle === 'up' ? 0.5 : padStyle === 'wide' ? 0.12 : -0.2;
          const w = padStyle === 'wide' ? 0.115 : 0.1;
          this.add(chest, S, ar.pads, { pos: [s * (b.chestW + 0.035), 0.265, -0.005], rot: [0, 0, s * tilt], scale: [w, 0.034, 0.1] });
        }
      }
      if (ar.hipGuards !== undefined) {
        for (const s of [1, -1]) this.add(hips, S, ar.hipGuards, { pos: [s * 0.115, -0.04, 0.02], rot: [0, s * 1.2, s * 0.12], scale: [0.07, 0.085, 0.02], outline: 0.7 });
        this.add(hips, S, ar.hipGuards, { pos: [0, -0.05, -0.11], rot: [-0.15, 0, 0], scale: [0.1, 0.085, 0.02], outline: 0.7 });
      }
    }

    _buildHead(head) {
      const b = this.b;
      const a = this.app;
      const f = a.face || {};
      const R = b.headR;
      const S = G.sphere();
      const skin = a.skin;
      const hc = new THREE.Group();
      hc.position.set(0, R * 0.95, 0);
      head.add(hc);
      this.headCenter = hc;
      this.skull = this.add(hc, S, skin, { scale: [R, R * 1.06, R * 1.02], skin: true });
      this.add(hc, S, skin, { pos: [0, -R * 0.42, R * 0.12], scale: [R * 0.66, R * 0.56, R * 0.7], outline: 0, skin: true });
      // cheekbones give the face a more angular anime shape
      for (const s of [1, -1]) this.add(hc, S, skin, { pos: [s * R * 0.52, -R * 0.2, R * 0.55], scale: [R * 0.3, R * 0.26, R * 0.3], outline: 0 });
      if (!f.noEars) for (const s of [1, -1]) this.add(hc, S, skin, { pos: [s * R * 0.98, -0.01, -0.005], scale: [0.02, 0.032, 0.022], outline: 0.5 });
      if (f.pointedEars) for (const s of [1, -1]) this._spike(hc, { a: [s, 0.05, -0.1], d: [s, 0.55, -0.35], l: 0.07, r: 0.022, depth: 0.98, flat: 0.4 }, skin, R);
      this.add(hc, G.cone(), skin, { pos: [0, -0.028, R * 0.97], rot: [Math.PI / 2, 0, 0], scale: [0.012, 0.03, 0.014], outline: 0 });

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
      for (const s of [1, -1]) {
        const eye = this.add(hc, S, eyeWhite, { pos: [s * eyeX, 0.004, R * 0.9], rot: [0, s * 0.38, 0], scale: [0.028 * ew, 0.02, 0.011], outline: 0, basic: true, shadow: false });
        const pup = this.add(hc, G.sphereLo(), this.face.pupilMat, { pos: [s * (eyeX - 0.005), 0.001, R * 0.99], scale: [0.0105, 0.0145, 0.005], outline: 0, basic: true, shadow: false });
        const hl = this.add(hc, G.sphereLo(), highlight, { pos: [s * (eyeX - 0.009) + 0.002, 0.007, R * 1.01], scale: [0.0034, 0.0034, 0.002], outline: 0, basic: true, shadow: false });
        const lash = this.add(hc, G.box(), lashMat, { pos: [s * eyeX, 0.02, R * 0.945], rot: [0, s * 0.38, s * 0.12], scale: [0.036 * ew, 0.0048, 0.009], outline: 0, basic: true, shadow: false });
        const brow = this.add(hc, G.box(), this.face.browMat, { pos: [s * eyeX, 0.036, R * 0.93], rot: [0, s * 0.35, 0], scale: [0.042, 0.0105 * (f.browThick || 1), 0.014], outline: 0, shadow: false });
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
        const sc = o.scouter;
        this.add(hc, G.box(), sc.body || 0xdedede, { pos: [R * 0.98, 0.0, 0], scale: [0.03, 0.065, 0.07], outline: 0.7 });
        this.add(hc, G.box(), sc.body || 0xdedede, { pos: [0.085, 0.035, 0.07], rot: [0, -0.9, 0], scale: [0.012, 0.012, 0.09], outline: 0.5 });
        this.add(hc, G.box(), this.mat(sc.lens || 0x33ff66, { basic: true, opacity: 0.55 }), { pos: [0.045, 0.006, R * 1.02 + 0.012], scale: [0.05, 0.036, 0.004], outline: 0, basic: true, shadow: false });
      }
      if (o.headband !== undefined) {
        this.add(hc, G.torus(R * 0.97, 0.013), o.headband, { pos: [0, 0.056, -0.006], rot: [Math.PI / 2 - 0.2, 0, 0], outline: 0.6 });
        for (const s of [1, -1]) this.add(hc, G.box(), o.headband, { pos: [s * 0.025, 0.0, -R * 1.02], rot: [0.35, 0, s * 0.25], scale: [0.022, 0.13, 0.008], outline: 0.5 });
      }
      if (o.turban !== undefined) {
        this.add(hc, S, o.turban, { pos: [0, R * 0.42, -R * 0.02], scale: [R * 1.1, R * 0.72, R * 1.12], outline: 0.9 });
        this.add(hc, S, o.turbanBand !== undefined ? o.turbanBand : 0x6a2a8a, { pos: [0, R * 0.18, 0], scale: [R * 1.06, R * 0.16, R * 1.08], outline: 0.5 });
      }
      if (o.cap !== undefined) {
        // round child's cap, optionally crowned with an ornament (Kid Gohan's Dragon Ball)
        this.add(hc, G.hemi(), o.cap, { pos: [0, R * 0.22, -R * 0.02], scale: [R * 1.12, R * 1.05, R * 1.14], outline: 0.8 });
        if (o.capBall !== undefined) {
          this.add(hc, S, o.capBall, { pos: [0, R * 1.3, 0], scale: R * 0.3, outline: 0.6 });
          if (o.capStars) for (let i = 0; i < o.capStars; i++) this.add(hc, S, 0xd0201a, { pos: [(i % 2 ? 1 : -1) * R * 0.08, R * 1.3 + ((i >> 1) % 2 ? 1 : -1) * R * 0.08, R * 0.29], scale: R * 0.045, outline: 0, shadow: false });
        }
      }
      if (a.headExtras) {
        for (const ex of a.headExtras) this._spike(hc, ex, ex.color !== undefined ? ex.color : skin, R);
      }
      if (a.hair) this.setHair(a.hair.style, a.hair.color);
    }

    _spike(parent, sp, color, R) {
      const dir = new THREE.Vector3(sp.d[0], sp.d[1], sp.d[2]).normalize();
      const anchor = new THREE.Vector3(sp.a[0], sp.a[1], sp.a[2]);
      if (anchor.lengthSq() > 0) anchor.normalize().multiplyScalar(R * (sp.depth || 0.82));
      const m = this.add(parent, G.cone(), color, { scale: [sp.r, sp.l, sp.r * (sp.flat || 0.7)], outline: sp.outline === undefined ? 0.8 : sp.outline });
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
          const m = this.add(g, G.hemi(), hairMat, { scale: [R * (cap.sx || 1.07), R * (cap.sy || 1.1), R * (cap.sz || 1.09)], outline: 0.9 });
          m.rotation.set(cap.tilt === undefined ? -0.5 : cap.tilt, 0, 0);
          m.position.set(0, cap.y || 0.004, cap.z || -0.006);
        }
        for (const sp of def.spikes || []) this._spike(g, sp, hairMat, R);
        if (def.mirror) {
          for (const sp of def.mirror) {
            this._spike(g, sp, hairMat, R);
            this._spike(g, { ...sp, a: [-sp.a[0], sp.a[1], sp.a[2]], d: [-sp.d[0], sp.d[1], sp.d[2]], twist: sp.twist ? -sp.twist : 0 }, hairMat, R);
          }
        }
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
      this.formScale = look.bulk || 1;
      this.chestMesh.scale.set((this.b.chestW / 0.2) * this.formScale, 1 + (this.formScale - 1) * 0.5, (this.b.chestD / 0.2) * 1.02 * this.formScale);
      if (look.tint !== undefined) {
        this.tintColor.set(look.tint);
        this.tintAmount = look.tintAmount || 0.3;
      } else this.tintAmount = 0;
      this._updateEmissive();
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
      this.face.eyes.forEach((ey) => (ey.scale.y = 0.02 * h));
      this.face.pupils.forEach((p) => (p.scale.y = 0.0145 * Math.min(1, h + 0.12)));
      this.face.lights.forEach((l) => (l.visible = h > 0.45));
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
      for (const c of this.cloth) {
        const cx = c.sx.step(U.clamp(mo.fwd * 0.03 * c.amount + mo.up * 0.02, -0.9, 1.1), dt);
        const cz = c.sz.step(U.clamp(-mo.side * 0.03 * c.amount, -0.8, 0.8), dt);
        c.node.rotation.set(c.cape ? cx * 0.8 : cx, 0, cz);
      }
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
      this.mats.clear();
    }
  }

  SL.Model = Model;
  SL.Spring = Spring;
  SL.EXPRESSIONS = EXPRESSIONS;
  SL.ModelBuilder = {
    build(def) {
      return new Model(def);
    },
    geoCache,
  };
})();
