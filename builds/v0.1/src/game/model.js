/*
 * Procedural character model builder.
 * PROTOTYPE ASSETS: characters are assembled from primitives with cel shading
 * and ink outlines, driven by each character's `appearance` data. The rig
 * (joint names and hierarchy) is the same one a future skinned glTF model
 * would map onto, so animation and gameplay code will not need to change.
 *
 * Coordinate convention: character faces +Z, character's LEFT side is +X.
 */
(function () {
  'use strict';

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
    neckLen: 0.075, neckR: 0.056, headR: 0.118,
  };

  const EXPRESSIONS = {
    neutral: { brow: 0.18, browY: 0, mouthH: 1, mouthW: 1, eyeH: 1 },
    angry: { brow: 0.42, browY: -0.006, mouthH: 1, mouthW: 0.85, eyeH: 0.8 },
    shout: { brow: 0.5, browY: -0.004, mouthH: 5, mouthW: 1.05, eyeH: 0.75 },
    hurt: { brow: -0.25, browY: 0.006, mouthH: 3, mouthW: 0.8, eyeH: 0.5 },
    smirk: { brow: 0.25, browY: 0, mouthH: 1, mouthW: 1.1, eyeH: 0.85, mouthRot: 0.18 },
    calm: { brow: 0.05, browY: 0.003, mouthH: 1, mouthW: 0.9, eyeH: 0.9 },
    ko: { brow: -0.3, browY: 0.004, mouthH: 2, mouthW: 0.7, eyeH: 0.12 },
  };

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
      this.flashAmount = 0;
      this.tintColor = new THREE.Color(0, 0, 0);
      this.tintAmount = 0;
      this.formScale = 1;
      this.currentHair = null;
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
          m = SL.Toon.makeMat(color);
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
      this.add(spine, G.abs(), o.abs !== undefined ? o.abs : top, { pos: [0, 0, 0], scale: [b.waistW / 0.13, b.absLen / 0.2, b.waistD / 0.13 * 0.95] });
      this.chestMesh = this.add(chest, G.chest(), top, { pos: [0, 0, 0.004], scale: [b.chestW / 0.2, 1, (b.chestD / 0.2) * 1.02] });
      if (o.topStyle === 'bare' || o.pecs) {
        const pc = o.pecs || skin;
        for (const s of [1, -1]) this.add(chest, S, pc, { pos: [s * 0.075, 0.16, b.chestD * 0.62], scale: [0.075, 0.055, 0.045], outline: 0.4 });
      }
      this.add(neck, G.limb(b.neckR, b.neckLen + 0.05), skin, { pos: [0, b.neckLen + 0.04, 0], outline: 0.7 });

      // gi specifics
      if (o.topStyle === 'gi') {
        if (o.under !== undefined) this.add(chest, S, o.under, { pos: [0, 0.225, b.chestD * 0.66], scale: [0.07, 0.06, 0.04], outline: 0.4 });
        if (o.belt !== undefined) {
          const belt = this.add(spine, G.torus(1, 0.2), o.belt, { pos: [0, -0.005, 0], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.02, b.waistD * 1.08, 0.13], outline: 0.6 });
          belt.castShadow = false;
          this.add(spine, G.box(), o.belt, { pos: [0.02, -0.02, b.waistD * 1.12], scale: [0.05, 0.04, 0.03], outline: 0.5 });
          this.add(spine, G.box(), o.belt, { pos: [0.035, -0.09, b.waistD * 1.08], rot: [0, 0, -0.2], scale: [0.03, 0.1, 0.015], outline: 0.5 });
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
        if (sleeves === 'short') this.add(sh, G.tube(b.upperArmR * 1.35, b.upperArmR * 1.22, b.upperArmLen * 0.42), sleeveColor, { pos: [0, 0.02, 0], outline: 0.8 });
        const foreColor = sleeves === 'long' ? sleeveColor : o.arms !== undefined ? o.arms : skin;
        this.add(el, G.limb(b.foreArmR, b.foreArmLen), foreColor, {});
        if (o.gloves !== undefined && o.gloves !== null) {
          this.add(el, G.tube(b.foreArmR * 1.22, b.foreArmR * 1.12, b.foreArmLen * 0.55), o.gloves, { pos: [0, -b.foreArmLen * 0.45, 0], outline: 0.8 });
        }
        if (o.wrist !== undefined && o.wrist !== null) {
          this.add(el, G.tube(b.foreArmR * 1.25, b.foreArmR * 1.2, 0.075), o.wrist, { pos: [0, -b.foreArmLen * 0.72, 0], outline: 0.8 });
        }
        const handColor = o.gloves !== undefined && o.gloves !== null ? o.gloves : skin;
        this.add(hand, S, handColor, { pos: [0, -0.04, 0.008], scale: [b.fist * 0.92, b.fist * 1.05, b.fist * 1.08] });
        this.add(hand, S, handColor, { pos: [-s * 0.035, -0.02, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });
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
        this.add(ft, S, boots, { pos: [0, -0.045, 0.04], scale: [0.066, 0.055, 0.125] });
        if (o.bootTip !== undefined) this.add(ft, S, o.bootTip, { pos: [0, -0.05, 0.115], scale: [0.058, 0.05, 0.055], outline: 0.7 });
      }

      this._buildHead(head);
      this.setExpression('neutral');
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
      if (!f.noEars) for (const s of [1, -1]) this.add(hc, S, skin, { pos: [s * R * 0.98, -0.01, -0.005], scale: [0.02, 0.032, 0.022], outline: 0.5 });
      this.add(hc, G.cone(), skin, { pos: [0, -0.028, R * 0.97], rot: [Math.PI / 2, 0, 0], scale: [0.012, 0.03, 0.014], outline: 0 });

      const eyeWhite = this.mat(f.sclera || 0xffffff, { basic: true });
      this.face.eyes = [];
      this.face.pupils = [];
      this.face.brows = [];
      const pupilColor = f.pupil !== undefined ? f.pupil : 0x111111;
      this.face.pupilMat = new THREE.MeshBasicMaterial({ color: pupilColor });
      this.mats.set('pupil', this.face.pupilMat);
      const browColor = f.brow !== undefined ? f.brow : a.hair ? a.hair.color : 0x222222;
      this.face.browMat = SL.Toon.makeMat(browColor);
      this.face.browMat.userData.baseEmissive = new THREE.Color();
      this.mats.set('brow', this.face.browMat);
      const eyeX = f.eyeX || 0.043;
      for (const s of [1, -1]) {
        const eye = this.add(hc, S, eyeWhite, { pos: [s * eyeX, 0.004, R * 0.9], rot: [0, s * 0.38, 0], scale: [0.026 * (f.eyeW || 1), 0.018, 0.01], outline: 0, basic: true, shadow: false });
        const pup = this.add(hc, G.sphereLo(), this.face.pupilMat, { pos: [s * (eyeX - 0.004), 0.002, R * 0.985], scale: [0.0085, 0.012, 0.004], outline: 0, basic: true, shadow: false });
        const brow = this.add(hc, G.box(), this.face.browMat, { pos: [s * eyeX, 0.034, R * 0.93], rot: [0, s * 0.35, 0], scale: [0.04, 0.0095 * (f.browThick || 1), 0.014], outline: 0, shadow: false });
        this.face.eyes.push(eye);
        this.face.pupils.push(pup);
        this.face.brows.push(brow);
      }
      this.face.mouth = this.add(hc, G.box(), 0x4a1616, { pos: [0, -0.062, R * 0.83], scale: [0.03, 0.005, 0.01], outline: 0, shadow: false });
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
      if (a.headExtras) {
        for (const ex of a.headExtras) this._spike(hc, ex, ex.color !== undefined ? ex.color : skin, R);
      }
      if (a.hair) this.setHair(a.hair.style, a.hair.color);
    }

    _spike(parent, sp, color, R) {
      const dir = new THREE.Vector3(sp.d[0], sp.d[1], sp.d[2]).normalize();
      const anchor = new THREE.Vector3(sp.a[0], sp.a[1], sp.a[2]);
      if (anchor.lengthSq() > 0) anchor.normalize().multiplyScalar(R * (sp.depth || 0.82));
      const m = this.add(parent, G.cone(), color, { scale: [sp.r, sp.l, sp.r * (sp.flat || 0.7)], outline: 0.8 });
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

    /** Applies visual changes of a form (hair, eyes, muscle, tint). */
    setForm(form) {
      const a = this.app;
      const look = (form && form.look) || {};
      const hair = look.hair || a.hair;
      if (hair) this.setHair(hair.style || a.hair.style, hair.color !== undefined ? hair.color : a.hair.color);
      const f = a.face || {};
      this.face.pupilMat.color.set(look.pupil !== undefined ? look.pupil : f.pupil !== undefined ? f.pupil : 0x111111);
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
      const R = this.b.headR;
      this.face.brows.forEach((br, i) => {
        const s = i === 0 ? 1 : -1;
        br.rotation.set(0, s * 0.35, s * e.brow);
        br.position.y = 0.034 + e.browY;
      });
      this.face.eyes.forEach((ey) => (ey.scale.y = 0.018 * e.eyeH));
      this.face.pupils.forEach((p) => (p.scale.y = 0.012 * Math.min(1, e.eyeH + 0.15)));
      const m = this.face.mouth;
      m.scale.set(0.03 * e.mouthW, 0.005 * e.mouthH, 0.01);
      m.position.y = -0.062 - (e.mouthH - 1) * 0.0015;
      m.position.z = R * 0.83;
      m.rotation.z = e.mouthRot || 0;
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
        m.emissive.setRGB(fl, fl, fl);
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
  SL.ModelBuilder = {
    build(def) {
      return new Model(def);
    },
    geoCache,
  };
})();
