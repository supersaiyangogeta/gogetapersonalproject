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
  /** One indexed geometry out of several (position, normal, uv): the collar's bars are one mesh, not forty. */
  function mergeGeos(list) {
    const out = new THREE.BufferGeometry();
    const names = ['position', 'normal', 'uv'];
    const arrs = {}, idx = [];
    for (const n of names) arrs[n] = [];
    let base = 0;
    for (const g of list) {
      for (const n of names) arrs[n].push(...g.attributes[n].array);
      const gi = g.index ? g.index.array : Array.from({ length: g.attributes.position.count }, (_, i) => i);
      for (const i of gi) idx.push(i + base);
      base += g.attributes.position.count;
      g.dispose();
    }
    out.setAttribute('position', new THREE.Float32BufferAttribute(arrs.position, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(arrs.normal, 3));
    out.setAttribute('uv', new THREE.Float32BufferAttribute(arrs.uv, 2));
    out.setIndex(idx);
    return out;
  }

  /**
   * A lathe (profile [[r, y], ...], y rising) whose vertices `push(v)` moves in place: one continuous surface with
   * shape where a plain lathe is round (a chest contour, thigh muscles). The seam is put at the back (phiStart π) and
   * the normals are averaged across it, so no crease shows down the front.
   */
  function shapedLathe(pts, segs, push) {
    const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segs, Math.PI);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      push(v);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    return weldNormals(g);
  }
  /** Normals from the moved surface, averaged where a seam doubles a vertex (no crease along it). */
  function weldNormals(g) {
    const p = g.attributes.position, v = new THREE.Vector3();
    g.computeVertexNormals();
    const n = g.attributes.normal, same = new Map();
    for (let i = 0; i < p.count; i++) {
      const k = Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
      (same.get(k) || same.set(k, []).get(k)).push(i);
    }
    for (const ids of same.values()) {
      if (ids.length < 2) continue;
      v.set(0, 0, 0);
      for (const i of ids) v.x += n.getX(i), v.y += n.getY(i), v.z += n.getZ(i);
      v.normalize();
      for (const i of ids) n.setXYZ(i, v.x, v.y, v.z);
    }
    return g;
  }
  /** A profile with each span split into `n` (a finer lathe keeps the same outline). */
  const finer = (pts, n) => pts.flatMap((q, i) => (i === 0 ? [q] : Array.from({ length: n }, (_, j) => { const t = (j + 1) / n, a = pts[i - 1]; return [a[0] + (q[0] - a[0]) * t, a[1] + (q[1] - a[1]) * t]; })));
  const smooth = (t) => t * t * (3 - 2 * t);

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
    /** A flat-sided band (n faces, one face to the front: the silhouette is the polygon), hanging from its top like G.tube. */
    prism: (rt, rb, h, n) =>
      geo('prism' + f3(rt) + f3(rb) + f3(h) + n, () => {
        const g = new THREE.CylinderGeometry(rt, rb, h, n, 1, false, Math.PI / n);
        g.translate(0, -h / 2, 0);
        return g;
      }),
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
    // a unit cylinder standing on its base (a hat's crown: Dr. Gero's)
    cyl: () =>
      geo('cylUp', () => {
        const g = new THREE.CylinderGeometry(1, 1, 1, 18);
        g.translate(0, 0.5, 0);
        return g;
      }),
    // a flat triangle facing +z, point down (a three-sided prism: an emblem cut from cloth or plate)
    tri: () =>
      geo('tri', () => {
        const g = new THREE.CylinderGeometry(1, 1, 1, 3);
        g.rotateX(Math.PI / 2);
        return g;
      }),
    torus: (R, r) => geo('torus' + f3(R) + f3(r), () => new THREE.TorusGeometry(R, r, 8, 28)),
    /**
     * A lock of hair: a tapered spike of unit length that curves through `bend` radians as it grows (up its +Y,
     * bending toward +Z), its root a little swollen — the hair styles' `bend` (Broly's manes). Scaled like a spike
     * ([r, l, r * flat]), so a flat lock reads as a strand, not a horn. With `th` (radius / length) the curve keeps its
     * true shape instead: the ring is th thick and the lock is scaled evenly by its length (a `curl` extra: an antenna
     * that hooks over, which the [r, l, r] scale would straighten).
     */
    lock: (bend, th) =>
      geo('lock' + f3(bend) + (th ? 'c' + f3(th) : ''), () => {
        const RINGS = th ? 14 : 9, SIDES = 7, pos = [], idx = [], b = Math.abs(bend) < 1e-3 ? 1e-3 : bend;
        const at = (t) => [0, Math.sin(b * t) / b, (1 - Math.cos(b * t)) / b];
        for (let i = 0; i <= RINGS; i++) {
          const t = i / RINGS, c = at(t), rr = i === RINGS ? 0 : (th || 1) * (1 - t) * (1 + 0.25 * Math.sin(Math.PI * Math.min(1, t * 2.5)));
          // the ring lies across the curve: its tangent is (0, cos bt, sin bt)
          const ty = Math.cos(b * t), tz = Math.sin(b * t);
          for (let k = 0; k <= SIDES; k++) {
            const a = (k / SIDES) * Math.PI * 2, x = Math.cos(a) * rr, n = Math.sin(a) * rr;
            pos.push(c[0] + x, c[1] - n * tz, c[2] + n * ty);
          }
        }
        for (let i = 0; i < RINGS; i++)
          for (let k = 0; k < SIDES; k++) {
            const p0 = i * (SIDES + 1) + k, p1 = p0 + SIDES + 1;
            idx.push(p0, p1, p0 + 1, p0 + 1, p1, p1 + 1);
          }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
        g.setIndex(idx);
        return weldNormals(g);
      }),
    /**
     * A ring of fur hanging down from its top (y = 0, radius r): n pointed tufts, their tips flared out to rt at -len and
     * the notches between them at a third of the way down — the ragged edge where a pelt ends (Super Saiyan 4's wrists).
     */
    fringe: (r, rt, len, n) =>
      geo('fringe' + f3(r) + f3(rt) + f3(len) + n, () => {
        const pos = [], idx = [], k = n * 2;
        for (let i = 0; i <= k; i++) {
          const a = (i / k) * Math.PI * 2, tip = i % 2 === 0;
          const rb = tip ? rt : (r + rt) * 0.5, yb = tip ? -len : -len * 0.32;
          pos.push(Math.sin(a) * r, 0, Math.cos(a) * r, Math.sin(a) * rb, yb, Math.cos(a) * rb);
          if (i < k) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 2, i * 2 + 1, i * 2 + 3);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
        g.setIndex(idx);
        return weldNormals(g);
      }),
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
    /**
     * build.bustShape (k, about 1): the chest itself carries the bust — the front pushed forward in two overlapping
     * soft lobes (fuller below the centre, a long slope above), so the top and chest stay one surface. Opt-in (Kefla).
     */
    chestBust: (k) =>
      geo('chestBust' + f3(k), () =>
        shapedLathe(finer(CHEST_PTS, 4), 40, (v) => {
          if (v.z <= 0) return;
          const fy = v.y - 0.165, sy = fy > 0 ? 0.062 : 0.036;
          const lobe = Math.exp(-(fy * fy) / (2 * sy * sy)) * Math.exp(-((Math.abs(v.x) - 0.066) ** 2) / (2 * 0.05 * 0.05));
          const front = Math.min(1, v.z / 0.12);
          v.z += k * 0.04 * lobe * front * front;
        })
      ),
    /**
     * face.headShape = { taper, drop, fwd, nape }: one skull surface with the face built in — the lower half narrowing
     * toward the chin (taper), the front of it drawn down (drop) and forward (fwd) into a chin, the back of it eased in
     * toward the neck (nape). Replaces the skull sphere and the separate jaw sphere, so cheeks, jaw and chin are one
     * surface with no seam. A unit sphere (the skull's own scale is applied by the mesh). Opt-in (Kefla).
     */
    // h.crown: the upper half narrowing toward the top as well, a skull that runs up into what grows out of it (Super
    // Buu's antenna); 0 keeps the round crown
    headShaped: (h) =>
      geo('headShaped' + [h.taper, h.drop, h.fwd, h.nape || 0, h.crown || 0].join('_'), () => {
        const g = new THREE.SphereGeometry(1, 30, 22);
        const p = g.attributes.position, v = new THREE.Vector3();
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i);
          const t = smooth(Math.min(1, Math.max(0, -v.y)));
          const front = Math.min(1, Math.max(0, (v.z + 0.2) / 1.2));
          if (h.crown) {
            const k = 1 - h.crown * smooth(Math.min(1, Math.max(0, v.y)));
            v.x *= k;
            v.z *= k;
          }
          v.x *= 1 - h.taper * t;
          v.y *= 1 + h.drop * t * front;
          v.z += h.fwd * t * t * front;
          if (v.z < 0) v.z *= 1 - (h.nape || 0) * t;
          p.setXYZ(i, v.x, v.y, v.z);
        }
        return weldNormals(g);
      }),
    /** A circular arc of tube (radius R, thickness r) through angle a, in the XY plane from +X anticlockwise. */
    arc: (R, r, a) => geo('arc' + f3(R) + f3(r) + f3(a), () => new THREE.TorusGeometry(R, r, 6, 18, a)),
    /**
     * A shell: a slice of the unit sphere `w` radians round (centred on +Z) from the top pole down through `t` radians —
     * pointed at the top, convex toward +Z, hollow toward the centre. `inside`: the same slice facing into the hollow
     * (its lining).
     */
    shell: (w, t, inside) =>
      geo('shell' + f3(w) + f3(t) + (inside ? 'in' : ''), () => {
        const g = new THREE.SphereGeometry(1, 18, 12, Math.PI / 2 - w / 2, w, 0, t);
        if (!inside) return g;
        const ix = g.index.array, n = g.attributes.normal;
        for (let i = 0; i < ix.length; i += 3) [ix[i], ix[i + 2]] = [ix[i + 2], ix[i]];
        for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
        return g;
      }),
    /**
     * build.thighShape = { top, mid, knee, quad, ham }: a thigh hanging from its joint, full near the hip (top × r),
     * easing through the middle (mid × r) and tapering to the knee (knee × shinR, passed in as rk), with the
     * quadriceps (front) and the two hamstring heads (back) raised out of the same surface. Opt-in (Kefla).
     */
    thighShaped: (r, rk, len, sh) =>
      geo('thighShaped' + f3(r) + f3(rk) + f3(len) + [sh.top, sh.mid, sh.quad, sh.ham].join('_'), () => {
        const keys = [[0, sh.top * 0.95 * r], [0.14, sh.top * r], [0.5, sh.mid * r], [1, rk]];
        const R = (t) => {
          let i = 1;
          while (i < keys.length - 1 && t > keys[i][0]) i++;
          const [t0, r0] = keys[i - 1], [t1, r1] = keys[i];
          return r0 + (r1 - r0) * smooth(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
        };
        const pts = [], capB = rk * 0.7, r0 = R(0), capT = r0 * 0.55;
        for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i / 5) * (Math.PI / 2); pts.push([rk * Math.cos(a), -len + capB * Math.sin(a)]); }
        for (let i = 19; i >= 1; i--) { const t = i / 20; pts.push([R(t), -t * len]); }
        for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); pts.push([r0 * Math.cos(a), capT * Math.sin(a)]); }
        const bump = (t, c, s) => Math.exp(-((t - c) ** 2) / (2 * s * s));
        return shapedLathe(pts, 28, (v) => {
          const th = Math.atan2(v.x, v.z), t = Math.min(1, Math.max(0, -v.y / len));
          const quad = sh.quad * Math.exp(-(th * th) / (2 * 0.8 * 0.8)) * bump(t, 0.42, 0.2);
          const dh = Math.abs(th) - (Math.PI - 0.42);
          const ham = sh.ham * Math.exp(-(dh * dh) / (2 * 0.4 * 0.4)) * bump(t, 0.32, 0.18);
          v.x *= 1 + quad + ham;
          v.z *= 1 + quad + ham;
        });
      }),
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
    // the forced grin (Vegeta's Bingo): eyes blown wide in terror over a huge toothy smile, brows up
    forced: { brow: -0.32, browY: 0.01, mouthH: 3.2, mouthW: 1.5, eyeH: 1.25, lash: -0.12, teeth: true },
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
    // stoic disgust (Gogeta looking down at Janemba): brows level and low, lids lowered to a hard line,
    // the mouth shut and pulled down a touch at one corner — no anger, no feeling at all
    cold: { brow: 0.22, browY: -0.003, mouthH: 0.7, mouthW: 0.84, eyeH: 0.58, mouthRot: -0.08, lash: 0.28 },
    // a warm, confident smile: the brows ease, the eyes soften, the mouth lifts (no teeth)
    warm: { brow: -0.06, browY: 0.003, mouthH: 1.3, mouthW: 1.24, eyeH: 0.68, mouthRot: 0.16, lash: 0.04 },
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
          // appearance.metal (0..1): a metal body (Metal Cooler) — a dark reflected band and a hard highlight, so the
          // metal never reads as painted skin (SL.Toon.addRim)
          // appearance.metalOnly: only those colours are metal (Metal Cooler's plate), the rest of the body keeps its own matte
          const metal = this.app.metalOnly && !this.app.metalOnly.includes(color) ? 0 : this.app.metal || 0;
          m = SL.Toon.makeMat(color, { rim: { color: this.rimColor.getHex(), strength: this.rimStrength, metal, fur: this._isFur(color) ? 1 : 0, ribs: this._ribs(color), stripes: this._stripes(color), slime: this._slime(color) } });
          m.userData.baseEmissive = new THREE.Color(0, 0, 0);
          if (color === this.app.skin) m.userData.skin = true;
        }
        this.mats.set(key, m);
      }
      return m;
    }

    /** outfit.fur = { color }: every part in that colour (default the arms') is a pelt — see SL.Toon.addRim, G.fringe. */
    _isFur(color) {
      const o = this.app.outfit || {};
      return !!o.fur && color === (o.fur.color !== undefined ? o.fur.color : o.arms);
    }

    /** outfit.ribs = { color, every }: every part in that colour is segmented (rings `every` world metres apart, at the fighter's own size): SL.Toon.addRim. */
    _ribs(color) {
      const r = (this.app.outfit || {}).ribs;
      return r && color === r.color ? r.every || 0.06 : 0;
    }

    /** outfit.slime = { color, w, h }: every part in `color` is slimed — drips and a wet shine (SL.Toon.addRim's rim.slime). */
    _slime(color) {
      const s = (this.app.outfit || {}).slime;
      return s && color === s.color ? { w: s.w, h: s.h, k: s.k } : null;
    }

    /** outfit.stripes = { color, with, every }: every part in `color` is striped with `with` (`every` metres a band pair). */
    _stripes(color) {
      const s = (this.app.outfit || {}).stripes;
      return s && color === s.color ? { color: s.with, every: s.every || 0.05 } : null;
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
      // 'harem' (Beerus): trousers wider still, ballooning over the shins and gathered at the ankle
      const harem = o.pantsStyle === 'harem';
      const baggy = o.pantsStyle === 'gi' || harem;
      this.add(hips, S, pants, { pos: [0, -0.02, 0], scale: [b.pelvisW * (harem ? 1.16 : baggy ? 1.08 : 1), b.pelvisH * (harem ? 1.08 : 1), b.pelvisD * (harem ? 1.18 : baggy ? 1.1 : 1)] });
      // build.seat (about 1): a fuller seat — two soft forms on the back of the pelvis in the trousers' colour
      // (Android 18). Opt-in: every other body is unchanged
      if (b.seat) for (const s of [1, -1]) this.add(hips, S, pants, { pos: [s * b.pelvisW * 0.4, -0.05, -b.pelvisD * 0.5], scale: [b.pelvisW * 0.5 * b.seat, b.pelvisH * 0.78 * b.seat, b.pelvisD * 0.56 * b.seat], outline: 0.4, name: 'seat' });
      // the gi is tracked so a story state can tear it off (see setTorn); the belly band stays
      // on unless the outfit's `torn` look says otherwise
      this.gi = { torso: [], trim: [], sleeves: [], abs: null, trap: null };
      // a gi always can; any other top only when its outfit's `torn` says what is under it (Vegeta's Super suit)
      const tearable = o.topStyle === 'gi' || !!(o.torn && o.torn.chest !== undefined);
      // a loose top (outfit.loose, e.g. 1.14): the shirt stands off the body — Videl's oversized T-shirt
      const loose = (this._loose = o.loose || 1);
      const absMesh = this.add(spine, G.abs(), o.abs !== undefined ? o.abs : top, { pos: [0, 0, 0], scale: [(b.waistW / 0.13) * loose, b.absLen / 0.2, (b.waistD / 0.13) * 0.95 * loose] });
      this.absMesh = absMesh;
      if (tearable) this.gi.abs = absMesh;
      // build.bustShape: the chest's own surface carries the bust (G.chestBust); the bust spheres below are skipped
      this.chestMesh = this.add(chest, b.bustShape ? G.chestBust(b.bustShape) : G.chest(), top, { pos: [0, 0, 0.004], scale: [(b.chestW / 0.2) * loose, 1, (b.chestD / 0.2) * 1.02 * loose] });
      // a round belly out in front of the waist (Majin Buu): outfit.belly = its colour, or true for skin
      if (o.belly) this.bellyMesh = this.add(spine, S, o.belly === true ? skin : o.belly, { pos: [0, 0.07, b.waistD * 0.28], scale: [b.waistW * 1.02, b.absLen * 0.78, b.waistD * 1.02] });
      if (tearable) this.gi.torso.push(this.chestMesh);
      // outfit.vee = { chest, abs }, each { color, at, slope }: a V painted on the front of that part (SL.Toon.addRim's
      // rim.vee) — the Pride Troopers' suit. Its own material, kept with the others so rim and flash still reach it
      if (o.vee) {
        for (const [k, mesh, c] of [['chest', this.chestMesh, top], ['abs', absMesh, o.abs !== undefined ? o.abs : top]]) {
          if (!o.vee[k]) continue;
          const key = c + 'vee' + k;
          let m = this.mats.get(key);
          if (!m) {
            // a pelt keeps its fur strokes round the painted V (Super Saiyan 4 Gogeta's bare chest inside his vest)
            m = SL.Toon.makeMat(c, { rim: { color: this.rimColor.getHex(), strength: this.rimStrength, vee: o.vee[k], fur: this._isFur(c) ? 1 : 0 } });
            m.userData.baseEmissive = new THREE.Color(0, 0, 0);
            this.mats.set(key, m);
          }
          mesh.material = m;
        }
      }
      // a woman's chest (build.bust, about 1): two soft forms on the front of the chest in the top's
      // colour, part of the top (they recolour and tear with it)
      if (b.bust && !b.bustShape) {
        const k = b.bust, sx = (b.chestW / 0.2) * loose, dz = (b.chestD / 0.2) * loose;
        this.bust = [];
        // outfit.bustSoft / outfit.bandeau: no separate outline round each form (they read as part of the top), and
        // under a bandeau they take its colour (Caulifla, Kefla). Default off: every other body is unchanged
        const soft = !!(o.bustSoft || o.bandeau);
        const bc = o.bandeau ? o.bandeau.color : top;
        for (const s2 of [1, -1]) this.bust.push(this.add(chest, S, bc, { pos: [s2 * 0.064 * sx, 0.17, 0.212 * dz * 0.86], scale: [0.05 * k * sx, 0.044 * k, 0.042 * k], outline: soft ? 0 : 0.5 }));
        if (tearable) this.gi.torso.push(...this.bust);
      }
      // outfit.bandeau = { color, top, h }: a strapless band wrapped round the chest with a straight horizontal neckline
      // (Caulifla); the rest of the chest, the shoulders and the midriff stay whatever `top` / `abs` say (skin). Off by default
      if (o.bandeau) {
        const B = o.bandeau, sx = (b.chestW / 0.2) * loose, dz = (b.chestD / 0.2) * 1.02 * loose;
        this.bandeauMesh = this.add(chest, G.tube(0.207, 0.214, B.h || 0.13), B.color, { pos: [0, B.top === undefined ? 0.255 : B.top, 0.004], scale: [sx * 1.04, 1, dz * 1.06], outline: 0.5 });
      }
      if (o.topStyle === 'bare' || o.pecs) {
        const pc = o.pecs || skin;
        // (kept: a form's bulk swells them with the chest — see setForm; they used to sink into a heavier form's chest)
        this.pecMeshes = [1, -1].map((s) => this.add(chest, S, pc, { pos: [s * 0.075, 0.16, b.chestD * 0.62], scale: [0.075, 0.055, 0.045], outline: 0.4 }));
      }
      this.add(neck, G.limb(b.neckR, b.neckLen + 0.05), skin, { pos: [0, b.neckLen + 0.04, 0], outline: 0.7 });
      // outfit.choker: a band hugging the bottom of the neck, just over the collar (Beerus' gold choker);
      // chokerAt is how far up the neck it sits (0 the base, 1 the head)
      if (o.choker !== undefined) this.add(neck, G.tube(b.neckR * 1.16, b.neckR * 1.16, o.chokerH || 0.02), o.choker, { pos: [0, b.neckLen * (o.chokerAt === undefined ? 0.32 : o.chokerAt), 0], outline: 0.5 });
      // trapezius gives a heavier, more heroic neck line
      const trapMesh = this.add(chest, S, o.topStyle === 'gi' && o.under !== undefined ? o.under : top, { pos: [0, b.chestTop - 0.035, -0.01], scale: [b.chestW * 0.55, 0.05, b.chestD * 0.62], outline: 0.5 });
      // what a form's look.muscle thickens (Majin Vegeta's heavier arms and legs): see setForm
      const girth = (this.girth = []);
      const grow = (m, y) => (m && girth.push({ mesh: m, x: m.scale.x, y: m.scale.y, z: m.scale.z, gy: y || 0 }), m);
      grow(trapMesh, 0.6);
      if (tearable) {
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
        // beltKnot: false — a gi worn with its own belt (beltStyle) and no knotted sash under it (Dabura's)
        if (o.belt !== undefined && o.beltKnot !== false) {
          // (2026-10-16, the owner's collage: Goku's obi is a broad flat band wound close round the waist, the knot a
          // little to his left with two tails to mid-thigh. It was a round tube standing a fifth of the waist off the
          // body — a hoop — with short stub tails)
          const belt = this.add(spine, G.torus(1, 0.085), o.belt, { pos: [0, -0.008, 0], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.06, b.waistD * 1.12, 0.42], outline: 0.6 });
          belt.castShadow = false;
          this.add(spine, G.box(), o.belt, { pos: [0.026, -0.016, b.waistD * 1.17], scale: [0.054, 0.05, 0.026], outline: 0.5 });
          const tails = new THREE.Group();
          tails.position.set(0.032, -0.03, b.waistD * 1.17);
          spine.add(tails);
          // leaning out over the gi trousers' fullness at the hips, so they hang in front of it
          this.add(tails, G.box(), o.belt, { pos: [0.006, -0.081, 0.028], rot: [-0.34, 0, -0.14], scale: [0.034, 0.17, 0.012], outline: 0.5 });
          this.add(tails, G.box(), o.belt, { pos: [0.032, -0.069, 0.02], rot: [-0.3, 0, -0.36], scale: [0.03, 0.145, 0.012], outline: 0.5 });
          this.cloth.push({ node: tails, sx: new Spring(40, 5), sz: new Spring(40, 5), amount: 1.6 });
        }
      }
      // a plain belt on trousers (casual clothes); a gi's sash is the knotted one above
      if ((o.beltStyle === 'belt' || o.beltStyle === 'sash') && o.belt !== undefined) {
        // 'belt': a strap with a buckle on trousers; 'sash': a wide cloth band (over armor when there is some)
        // beltAt / beltFit: a belt worn lower and tighter than the waist (Majin Buu's sits under the belly, round the top
        // of the trousers)
        const sash = o.beltStyle === 'sash', over = (o.armor ? 1.14 : 1) * (o.beltFit || 1), by = o.beltAt !== undefined ? o.beltAt : sash ? 0.0 : -0.02;
        // (2026-10-16: the same height as before, but lying closer on the body — the round tube stood a fifth to almost a
        // third of the waist off it, a hoop; the owner's collage shows Future Trunks' belt flat on his trousers)
        this.add(spine, G.torus(1, sash ? 0.15 : 0.11), o.belt, { pos: [0, by, 0], rot: [Math.PI / 2, 0, 0], scale: [b.waistW * 1.06 * over, b.waistD * 1.1 * over, sash ? 0.4 : 0.18], outline: 0.5, shadow: false });
        if (!sash) this.add(spine, G.box(), o.buckle !== undefined ? o.buckle : 0xc8b070, { pos: [0, by, b.waistD * 1.21 * over], scale: [0.034, 0.026, 0.012], outline: 0.4 });
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
        if (!sash && o.buckleCore !== undefined) this.add(spine, G.box(), o.buckleCore, { pos: [0, by, b.waistD * 1.21 * over + 0.007], scale: [0.02, 0.014, 0.006], outline: 0, shadow: false });
      }
      // a cloth panel hanging from the belt, in front (and behind with apron.back): Beerus' tabard.
      // apron = { color, trim, len (metres, default 0.3), width (default 0.11), back }
      if (o.apron) {
        const ap = o.apron, len = ap.len || 0.3, w = ap.width || 0.11;
        for (const side of ap.back ? [1, -1] : [1]) {
          const g = new THREE.Group();
          g.position.set(0, -0.03, side * b.waistD * (harem ? 1.46 : baggy ? 1.3 : 1.1)); // outside a gi's (or harem trousers') baggy front
          spine.add(g);
          if (ap.point) {
            // apron.point: the panel cut to a point at the bottom and edged all the way round in the trim colour
            // (Beerus' tabard); apron.motif: [colour, ...] diamonds down the middle, top to bottom
            const tip = ap.tip || w * 0.55, edge = ap.edge || 0.011;
            const panel = (ww, ll, tt, d) => {
              const sh2 = new THREE.Shape();
              sh2.moveTo(-ww / 2, 0);
              sh2.lineTo(ww / 2, 0);
              sh2.lineTo(ww / 2, -ll + tt);
              sh2.lineTo(0, -ll);
              sh2.lineTo(-ww / 2, -ll + tt);
              sh2.closePath();
              const geo2 = new THREE.ExtrudeGeometry(sh2, { depth: d, bevelEnabled: false, curveSegments: 1 });
              geo2.translate(0, 0, -d / 2);
              (this.geos = this.geos || []).push(geo2);
              return geo2;
            };
            // it hangs a little out from the body, the point furthest out (clear of the trousers' fullness): every
            // layer hangs from one tilted pivot, so the motif stays on the cloth whatever the flare
            const flare = ap.flare === undefined ? 0.1 : ap.flare;
            const fl = new THREE.Group();
            fl.rotation.set(-side * flare, side > 0 ? 0 : Math.PI, 0);
            g.add(fl);
            // an ink line all the way round (an extruded panel's own outline only shows from the side)
            const ink = 0.012;
            this.add(fl, panel(w + edge * 2 + ink, len + edge * 2.2 + ink * 1.2, tip + edge * 1.1 + ink * 0.6, 0.004), 0x0b0b12, { pos: [0, edge * 0.2 + ink * 0.5, 0.001], outline: 0, shadow: false });
            if (ap.trim !== undefined) this.add(fl, panel(w + edge * 2, len + edge * 2.2, tip + edge * 1.1, 0.012), ap.trim, { pos: [0, edge * 0.2, 0.006], outline: 0 });
            this.add(fl, panel(w, len, tip, 0.012), ap.color, { pos: [0, -edge * 0.2, 0.011], outline: 0, shadow: false });
            if (ap.motif && side > 0) {
              // motifSize (× width) and motifDrop (how far the last one is pulled toward the point, × tip)
              const n2 = ap.motif.length, top0 = len * 0.16, span = len - tip - top0, ms = ap.motifSize || 0.27, md = ap.motifDrop === undefined ? 0.35 : ap.motifDrop;
              ap.motif.forEach((c, i) => {
                const y = -(top0 + (span * (i + 0.5)) / n2 + (i === n2 - 1 ? tip * md : 0));
                this.add(fl, G.box(), c, { pos: [0, y, 0.0185], rot: [0, 0, Math.PI / 4], scale: [w * ms, w * ms, 0.004], outline: 0, shadow: false });
              });
            }
          } else {
            this.add(g, G.box(), ap.color, { pos: [0, -len / 2, side * 0.008], rot: [side * 0.06, 0, 0], scale: [w, len, 0.014], outline: 0.5 });
            if (ap.trim !== undefined) this.add(g, G.box(), ap.trim, { pos: [0, -len + 0.014, side * 0.011], rot: [side * 0.06, 0, 0], scale: [w * 1.04, 0.026, 0.016], outline: 0.4, shadow: false });
            // apron.edges: gold piping down both long sides
            if (ap.edges && ap.trim !== undefined) for (const e of [1, -1]) this.add(g, G.box(), ap.trim, { pos: [e * w * 0.5, -len / 2, side * 0.011], rot: [side * 0.06, 0, 0], scale: [0.012, len, 0.016], outline: 0, shadow: false });
          }
          // (a pointed tabard in front rides up off a thigh that comes forward through it: see tick)
          this.cloth.push({ node: g, sx: new Spring(30, 4), sz: new Spring(30, 4), amount: 1.6, apron: ap.point && side > 0 ? 1 : 0 });
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
      if (o.cape !== undefined) this._buildCape(chest, o.cape, o.capeOff, o.capeSize);

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
        const delt = grow(this.add(sh, S, deltColor, { pos: [s * 0.01, -0.01, 0], scale: [b.delt * 1.05, b.delt, b.delt * 1.02] }), 0.6);
        // (a long sleeve's shoulder cap is part of the sleeve: torn.sleeves repaints it too — it stayed suit-red on
        // Jiren's and Toppo's bare arms)
        if (sleeves === 'long') (this.sleeveMeshes = this.sleeveMeshes || []).push(delt);
        // long sleeves can be loose cloth (sleeveBulk), wider than the arm inside them
        const bulk = sleeves === 'long' ? o.sleeveBulk || 1 : 1;
        const upperArm = grow(this.add(sh, G.limb(b.upperArmR * bulk, b.upperArmLen), upperColor, {}));
        if (sleeves === 'long') (this.sleeveMeshes = this.sleeveMeshes || []).push(upperArm);
        // bicep bulge
        if (sleeves !== 'long') grow(this.add(sh, S, upperColor, { pos: [0, -b.upperArmLen * 0.45, 0.012], scale: [b.upperArmR * 1.02, b.upperArmLen * 0.28, b.upperArmR * 1.12], outline: 0.4 }));
        // outfit.armBands: a band round each upper arm under the shoulder (Beerus' gold armlets); armBandAt is
        // how far down the upper arm (0 the shoulder, 1 the elbow), armBandW its width
        // (bands, cuffs and gloves grow with a form's heavier arms — look.muscle — instead of sinking into them)
        if (o.armBands !== undefined) grow(this.add(sh, G.tube(b.upperArmR * (o.armBandR || 1.2), b.upperArmR * ((o.armBandR || 1.2) + 0.04), o.armBandW || 0.03), o.armBands, { pos: [0, -b.upperArmLen * (o.armBandAt === undefined ? 0.3 : o.armBandAt), 0.004], outline: 0.6 }));
        if (sleeves === 'short') {
          const sl = this.add(sh, G.tube(b.upperArmR * 1.35, b.upperArmR * 1.22, b.upperArmLen * 0.42), sleeveColor, { pos: [0, 0.02, 0], outline: 0.8 });
          sl.userData.side = side;
          this.gi.sleeves.push(sl);
        }
        const foreColor = sleeves === 'long' ? sleeveColor : o.arms !== undefined ? o.arms : skin;
        const foreArm = grow(this.add(el, G.limb(b.foreArmR * (1 + (bulk - 1) * 0.8), b.foreArmLen), foreColor, {}));
        if (sleeves === 'long') this.sleeveMeshes.push(foreArm);
        if (o.gloves !== undefined && o.gloves !== null) {
          // gloveLen: how far up the forearm the glove's cuff reaches (a fraction; default 0.55 — 18's short gloves 0.22)
          const gl = o.gloveLen || 0.55;
          (this.gloveCuffs = this.gloveCuffs || []).push(grow(this.add(el, G.tube(b.foreArmR * 1.22, b.foreArmR * 1.12, b.foreArmLen * gl), o.gloves, { pos: [0, -b.foreArmLen * (1 - gl), 0], outline: 0.8 })));
        }
        if (o.wrist !== undefined && o.wrist !== null) {
          // wristLen: a longer guard up the forearm (Bardock's), ending at the same place at the wrist
          const wl = o.wristLen || 0.085;
          // wristFlare: a bracer that widens toward the hand (Beerus' gold cuffs)
          const wf = o.wristFlare ? [1.22, 1.36] : [1.3, 1.24];
          const wy = -b.foreArmLen * 0.7 - (0.085 - wl);
          grow(this.add(el, G.tube(b.foreArmR * wf[0], b.foreArmR * wf[1], wl), o.wrist, { pos: [0, wy, 0], outline: 0.8 }));
          // wristTrim: a thin ring of another colour round each end of the band (the Buus' gold-edged black bands)
          if (o.wristTrim !== undefined) {
            for (const [y, k] of [[wy + 0.004, wf[0]], [wy - wl + 0.014, wf[1]]]) grow(this.add(el, G.tube(b.foreArmR * (k + 0.06), b.foreArmR * (k + 0.06), 0.018), o.wristTrim, { pos: [0, y, 0], outline: 0.5 }));
          }
        }
        // a pelt (outfit.fur): ragged layers of it down the arm — under the shoulder, above the elbow, and where it ends
        // over the wristband or the glove
        if (this._isFur(foreColor)) {
          const ur = b.upperArmR, fr = b.foreArmR, gl = o.gloves !== undefined && o.gloves !== null, wr = o.wrist !== undefined && o.wrist !== null;
          this.add(sh, G.fringe(ur * 1.06, ur * 1.32, 0.05, 9), foreColor, { pos: [0, -b.delt * 0.55, 0], outline: 0.5, name: 'fur:shoulder' });
          this.add(sh, G.fringe(ur * 1.0, ur * 1.24, 0.045, 9), foreColor, { pos: [0, -b.upperArmLen * 0.62, 0], outline: 0.5, name: 'fur:elbow' });
          this.add(el, G.fringe(fr * 1.04, fr * (gl ? 1.4 : wr ? 1.5 : 1.26), 0.07, 8), foreColor, { pos: [0, -b.foreArmLen * (gl ? 0.4 : wr ? 0.6 : 0.78), 0], outline: 0.5, name: 'fur:wrist' });
        }
        const handColor = o.gloves !== undefined && o.gloves !== null ? o.gloves : skin;
        // fingerless gloves (Videl's): the glove is the palm and the back of the hand, the fingers are bare
        this._buildHand(hand, s, handColor, side, o.fingerless ? skin : handColor);
        // gloved hands: every piece of them, for a torn suit that loses its gloves
        if (handColor !== skin) hand.traverse((n) => n.isMesh && !n.userData.isOutline && (this.gloveHands = this.gloveHands || []).push(n));
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
        // outfit.harem = { thigh, balloon, at, cuff }: the shape of harem trousers — the thigh's width, the balloon's
        // width over the lower leg (× shinR), where its middle is and where the cuff gathers it (fractions of the shin)
        const hm = harem && o.harem ? Object.assign({ thigh: 1.5, balloon: 2.2, at: 0.4, cuff: 0.9 }, o.harem) : null;
        const pw = hm ? hm.thigh : harem ? 1.5 : baggy ? 1.38 : 1;
        // build.thighShape: a shaped thigh (G.thighShaped) for fitted legs; trousers with fullness keep the capsule
        const tsh = b.thighShape && !baggy ? b.thighShape : null;
        // outfit.thighs: the thigh in its own colour — bare legs under a pair of shorts (the Ginyu Force's bodysuits stop
        // at the hip: the pelvis stays `pants`); default the trousers
        grow(this.add(th, tsh ? G.thighShaped(b.thighR, b.shinR * (tsh.knee || 1.1), b.thighLen, tsh) : G.limb(b.thighR * pw, b.thighLen), o.thighs !== undefined ? o.thighs : pants, {}));
        if (hm) {
          // one bell from the hip to the gather: the thigh flaring into a balloon over the knee and the shin, drawn
          // into a cuff with a rolled edge; below it bare leg (outfit.legs, or skin) down into the boot
          this.add(th, G.tube(b.thighR * pw, b.shinR * hm.balloon * 0.85, b.thighLen * 0.62), pants, { pos: [0, -b.thighLen * 0.4, 0.004] });
          this.add(kn, S, pants, { pos: [0, -b.shinLen * hm.at, 0.008], scale: [b.shinR * hm.balloon, b.shinLen * Math.max(0.12, hm.cuff - hm.at), b.shinR * hm.balloon * 0.95] });
          this.add(kn, G.tube(b.shinR * hm.balloon * 0.66, b.shinR * 1.25, b.shinLen * 0.14), pants, { pos: [0, -b.shinLen * (hm.cuff - 0.14), 0] });
          this.add(kn, G.torus(1, 0.32), pants, { pos: [0, -b.shinLen * hm.cuff, 0], rot: [Math.PI / 2, 0, 0], scale: [b.shinR * 1.32, b.shinR * 1.32, b.shinR * 1.1], outline: 0.5 });
          if (hm.cuff < 0.85) this.add(kn, G.limb(b.shinR, b.shinLen), o.legs !== undefined ? o.legs : skin, {});
        } else if (harem) {
          // the balloon: full over the knee and the shin, then drawn in to the ankle (the band is bootTrim)
          this.add(kn, S, pants, { pos: [0, -b.shinLen * 0.4, 0.008], scale: [b.shinR * 2.2, b.shinLen * 0.5, b.shinR * 2.1] });
          this.add(kn, G.tube(b.shinR * 1.9, b.shinR * 1.18, b.shinLen * 0.32), pants, { pos: [0, -b.shinLen * 0.58, 0] });
        } else if (baggy) {
          this.add(kn, G.tube(b.shinR * 1.55, b.shinR * 1.15, b.shinLen * 0.6), pants, { pos: [0, 0.03, 0] });
          // the trouser leg goes on down to a low shoe (2026-10-15 visual pass: with a shoe or an ankle boot under gi
          // trousers the ankles were missing and the feet floated — Roshi, Garlic Jr., Uub and others)
          const lowBoot = o.bootTop !== undefined ? o.bootTop < 0.45 : o.bootStyle === 'shoe';
          if (lowBoot) this.add(kn, G.limb(b.shinR * 1.02, b.shinLen), o.legs !== undefined ? o.legs : pants, {});
        }
        else {
          this.add(kn, G.limb(b.shinR, b.shinLen), o.legs !== undefined ? o.legs : pants, {});
          // outfit.crop: cropped trousers (capris) — the trouser leg goes this far down the shin (a fraction) and ends in a
          // rolled cuff; below it the leg is `legs` (Android 18's Buu Saga jeans)
          if (o.crop) {
            this.add(kn, G.tube(b.shinR * 1.1, b.shinR * 1.06, b.shinLen * o.crop + 0.03), pants, { pos: [0, 0.03, 0], outline: 0.6 });
            this.add(kn, G.torus(1, 0.22), pants, { pos: [0, -b.shinLen * o.crop + 0.012, 0], rot: [Math.PI / 2, 0, 0], scale: [b.shinR * 1.16, b.shinR * 1.16, b.shinR * 0.9], outline: 0.5, shadow: false });
          }
        }
        const boots = o.boots !== undefined ? o.boots : 0x333333;
        // outfit.bootTop overrides the style's height (a fraction of the shin: Beerus' ankle boots)
        const bootTop = o.bootTop !== undefined ? o.bootTop : o.bootStyle === 'saiyan' ? 0.62 : o.bootStyle === 'shoe' ? 0.16 : 0.5;
        this.add(kn, G.tube(b.shinR * 1.32, b.shinR * 1.12, b.shinLen * bootTop + 0.03), boots, { pos: [0, -b.shinLen * (1 - bootTop), 0] });
        // bootTrimAt: how far below the boot's rim its band sits (Beerus' gold band a little way down the shaft)
        if (o.bootTrim !== undefined) this.add(kn, G.tube(b.shinR * 1.38, b.shinR * 1.36, 0.028), o.bootTrim, { pos: [0, -b.shinLen * (1 - bootTop) + 0.012 - (o.bootTrimAt || 0), 0], outline: 0.6 });
        // a sock showing over the top of the boot (Videl's); socksH its height (default 0.07 m — 18's slouch socks taller)
        const sh2 = o.socksH || 0.07;
        if (o.socks !== undefined) this.add(kn, G.tube(b.shinR * 1.2, b.shinR * 1.17, sh2), o.socks, { pos: [0, -b.shinLen * (1 - bootTop) + sh2 - 0.008, 0], outline: 0.6 });
        if (o.legBands !== undefined) this.add(kn, G.tube(b.shinR * 1.18, b.shinR * 1.16, 0.05), o.legBands, { pos: [0, -0.06, 0], outline: 0.6 });
        const fl = b.footLen;
        // outfit.shoes: the foot in its own colour under wraps or a boot shaft (Gogeta's black shoes under blue wraps)
        this.add(ft, S, o.shoes !== undefined ? o.shoes : boots, { pos: [0, -0.045, 0.04 * fl], scale: [0.068, 0.056, 0.13 * fl] });
        if (o.bootTip !== undefined) {
          // bootPoint: the toe drawn out to a point, turned up a little at the end (Beerus' shoes)
          if (o.bootPoint) this.add(ft, G.cone(), o.bootTip, { pos: [0, -0.06, 0.12 * fl], rot: [Math.PI / 2 - 0.32, 0, 0], scale: [0.052, 0.13 * fl, 0.04], outline: 0.7 });
          else this.add(ft, S, o.bootTip, { pos: [0, -0.05, 0.12 * fl], scale: [0.06, 0.05, 0.056], outline: 0.7 });
        }
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
      // pr.cape: part of the cape (its padded shoulders, its collar) — it goes with the cape (Fighter, 'dropCape')
      if (pr.cape) g.userData.cape = true;
      // pr.forms: worn only in those forms (setForm shows and hides it — Cooler's final-form plates)
      if (pr.forms) {
        g.userData.forms = pr.forms;
        g.visible = false;
      }
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
      } else if (pr.shape === 'tri') {
        // a flat triangle, point down (the Grand Priest's chest mark); size [half-width, half-height, thickness]
        this.add(g, G.tri(), pr.color === undefined ? 0xe8801e : pr.color, { scale: pr.size || [0.04, 0.04, 0.01], outline: pr.outline === undefined ? 0.4 : pr.outline });
        // pr.mark 'majin': the Majin "M" inked on the plate (the Buus' belt plates) — two legs and the V between them, in the
        // plate's wide upper half, scaled with it
        if (pr.mark === 'majin') {
          const s = pr.size || [0.04, 0.04, 0.01], k = s[0] / 0.075, z = s[2] * 0.62, ink = pr.ink === undefined ? 0x141414 : pr.ink;
          for (const [x, y, w, h, r] of [[-0.024, 0.004, 0.0075, 0.03, 0], [0.024, 0.004, 0.0075, 0.03, 0], [-0.012, 0.009, 0.0065, 0.027, 0.93], [0.012, 0.009, 0.0065, 0.027, -0.93]]) {
            this.add(g, G.box(), ink, { pos: [x * k, y * k, z], rot: [0, 0, r], scale: [w * k, h * k, 0.004], outline: 0, shadow: false });
          }
        }
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
      } else if (pr.shape === 'dimSword') {
        // SUPER JANEMBA'S SWORD: condensed dimensional energy pulled out of the spike on his head — a
        // long jagged blade in zig-zag segments with barbs at every joint, a hot red core running its
        // length, a short wrapped grip. Drawn along +Y; `setPropFill` grows it out of the hand
        // (materialising), and fill 0 hides it (the blade shattered).
        const grip = pr.grip || 0x3a1a3a, blade = pr.blade || 0x9a0e2a, core = pr.core || 0xff4a6a;
        this.add(g, G.tube(0.02, 0.02, 0.2), grip, { pos: [0, 0.04, 0], outline: 0.5 });
        this.add(g, G.box(), pr.guard || 0x5a2a5a, { pos: [0, 0.15, 0], scale: [0.1, 0.03, 0.05], outline: 0.5 });
        const grow = new THREE.Group();
        grow.position.y = 0.16;
        g.add(grow);
        const N = 7, seg = L / N;
        for (let i = 0; i < N; i++) {
          const w = 0.075 - i * 0.004, s = i % 2 ? 1 : -1;
          this.add(grow, G.box(), blade, { pos: [s * 0.018, seg * (i + 0.5), 0], rot: [0, 0, s * 0.16], scale: [w, seg * 1.12, 0.018], outline: 0.5 });
          if (i > 0) this.add(grow, G.cone(), blade, { pos: [-s * 0.05, seg * i, 0], rot: [0, 0, s * 1.9], scale: [0.016, 0.06, 0.008], outline: 0.4 });
        }
        this.add(grow, G.cone(), blade, { pos: [0, L + 0.06, 0], scale: [0.03, 0.14, 0.009], outline: 0.5 });
        const coreMat = new THREE.MeshBasicMaterial({ color: core, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
        this.add(grow, G.box(), coreMat, { pos: [0, L / 2, 0], scale: [0.022, L * 0.96, 0.024], outline: 0, shadow: false });
        g.userData.fill = grow;
        g.userData.tip = 0.16 + L + 0.13;
        const k = pr.fill === undefined ? 1 : pr.fill;
        grow.scale.y = Math.max(0.001, k);
        grow.visible = k > 0.01;
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
      } else if (pr.shape === 'spike') {
        // a horn or spike standing out of the body along the prop's +Y (Omega Shenron's knees, a bracer's point);
        // size [base radius, length, depth squash]
        const sz = pr.size || [0.03, 0.1, 1];
        this.add(g, G.cone(), pr.color === undefined ? 0x1e1e24 : pr.color, { scale: [sz[0], sz[1], sz[0] * (sz[2] || 1)], outline: pr.outline === undefined ? 0.6 : pr.outline });
      } else if (pr.shape === 'claws') {
        // talons in a row across the prop's X, each pointing along +Y and hooked toward +Z (a monster's hand or foot):
        // count, length, radius, spread (metres between the outer two), hook (radians)
        const n = pr.count || 3, L = pr.length || 0.08, r = pr.radius || 0.014, sp = pr.spread || 0.06;
        for (let i = 0; i < n; i++) {
          const x = n > 1 ? -sp / 2 + (sp * i) / (n - 1) : 0;
          this.add(g, G.cone(), pr.color === undefined ? 0x2a2a2e : pr.color, { pos: [x, 0, 0], rot: [pr.hook === undefined ? 0.35 : pr.hook, 0, -x * 2.5], scale: [r, L, r], outline: 0.5 });
        }
      } else if (pr.shape === 'arc') {
        // a curved horn or blade: an arc of tube of radius `radius` through `angle` radians in the prop's XY plane,
        // from +X anticlockwise, `thick` thick (Cooler's shoulder guards and forearm blades)
        this.add(g, G.arc(1, (pr.thick || 0.025) / (pr.radius || 0.1), pr.angle || 1.6), pr.color === undefined ? 0xf0f0f0 : pr.color, { scale: [pr.radius || 0.1, pr.radius || 0.1, (pr.radius || 0.1) * (pr.flat || 1)], outline: pr.outline === undefined ? 0.6 : pr.outline });
      } else if (pr.shape === 'crescent') {
        // a flat crescent blade in the prop's XY plane, its back curve centred on +Y: `radius`, `angle` radians from tip to
        // tip, `width` (share of the radius) across its middle, tapering to the two points; `thick` metres deep (young
        // Chi-Chi's helmet blade)
        const R = pr.radius || 0.1, A = pr.angle || 2.4, w = pr.width || 0.3, d = (pr.thick || 0.01) / R;
        const cg = geo('crescent' + f3(A) + f3(w) + f3(d), () => {
          const sh = new THREE.Shape(), N = 18, a0 = Math.PI / 2 - A / 2;
          for (let i = 0; i <= N; i++) {
            const a = a0 + (A * i) / N;
            sh[i ? 'lineTo' : 'moveTo'](Math.cos(a), Math.sin(a));
          }
          for (let i = N - 1; i > 0; i--) {
            const a = a0 + (A * i) / N, r = 1 - w * Math.sin((Math.PI * i) / N);
            sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          const eg = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: d * 0.3, bevelSize: d * 0.3, bevelSegments: 1 });
          eg.translate(0, 0, -d / 2);
          eg.computeVertexNormals();
          return eg;
        });
        this.add(g, cg, pr.color === undefined ? 0xe0e4ec : pr.color, { scale: R, outline: pr.outline === undefined ? 0.5 : pr.outline });
      } else if (pr.shape === 'cuff') {
        // a band of plate round a limb, hanging from the prop's origin along -Y (a bracer, a shin guard): radius top and
        // bottom, length
        // pr.sides: a flat-sided plate band of that many faces (Cooler's bracers and shin guards) instead of a round one
        const cr = pr.radius || 0.06, cb = pr.radiusBottom || pr.radius || 0.06, cl = pr.length || 0.1;
        this.add(g, pr.sides ? G.prism(cr, cb, cl, pr.sides) : G.tube(cr, cb, cl), pr.color === undefined ? 0xf0f0f0 : pr.color, { outline: pr.outline === undefined ? 0.6 : pr.outline });
      } else if (pr.shape === 'shell') {
        // a hollow shell cupped round a joint (Baby Vegeta's shoulder guards): G.shell scaled by size [x, y, z], `spread`
        // radians round and `drop` radians down from its pointed top, its top leaning `lean` radians toward its convex side
        // before the prop's own rotation; `inner` lines the hollow in its own colour
        const sz = pr.size || [0.1, 0.2, 0.1], w = pr.spread || 2.4, t = pr.drop || 2, rot = [pr.lean || 0, 0, 0];
        this.add(g, G.shell(w, t), pr.color === undefined ? 0xe0b030 : pr.color, { rot, scale: sz, outline: pr.outline === undefined ? 0.6 : pr.outline });
        if (pr.inner !== undefined) this.add(g, G.shell(w, t, true), pr.inner, { rot, scale: sz.map((v) => v * 0.97), outline: 0 });
      } else if (pr.shape === 'barrier') {
        // a great ring of light standing behind the body (Fused Zamasu's barrier of light): an outer and an inner ring, a
        // beam up and down through them and one across, four-pointed sparkles where the vertical beam ends, a soft glow —
        // all unlit and additive, no ink. radius in metres; a story shows or hides it with setPropVisible(id, on)
        const R = pr.radius || 0.4, col = pr.color || 0xfff2fa;
        const lit = (opacity, c = col) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
        const o = { outline: 0, shadow: false };
        this.add(g, G.torus(1, 0.035), lit(0.9), Object.assign({ scale: R }, o));
        this.add(g, G.torus(1, 0.03), lit(0.7), Object.assign({ scale: R * 0.62 }, o));
        this.add(g, G.box(), lit(0.75), Object.assign({ scale: [R * 0.028, R * 3.6, 0.004] }, o));
        this.add(g, G.box(), lit(0.6), Object.assign({ scale: [R * 3.4, R * 0.022, 0.004] }, o));
        for (const y of [1.8, -1.8, 1, -1]) {
          const k = Math.abs(y) > 1.2 ? 1 : 0.6;
          this.add(g, G.box(), lit(0.95), Object.assign({ pos: [0, y * R, 0.002], rot: [0, 0, Math.PI / 4], scale: [R * 0.05 * k, R * 0.05 * k, 0.004] }, o));
          this.add(g, G.box(), lit(0.85), Object.assign({ pos: [0, y * R, 0.003], scale: [R * 0.02 * k, R * 0.34 * k, 0.004] }, o));
          this.add(g, G.box(), lit(0.85), Object.assign({ pos: [0, y * R, 0.003], scale: [R * 0.24 * k, R * 0.02 * k, 0.004] }, o));
        }
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: pr.glow || 0xffb8e0, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.35, depthWrite: false }));
        glow.scale.setScalar(R * 2.6);
        g.add(glow);
      } else if (pr.shape === 'strip') {
        // a strap laid along `path` (points in the joint's space, on the body's surface): a flat band `width` across
        // and `thick` deep from point to point, its face turned to +Z (Super 17's harness)
        const P = pr.path.map((p) => new THREE.Vector3(p[0], p[1], p[2])), X = new THREE.Vector3(1, 0, 0);
        for (let i = 1; i < P.length; i++) {
          const y = P[i].clone().sub(P[i - 1]), len = y.length();
          y.normalize();
          const z = new THREE.Vector3().crossVectors(X, y).normalize(), x = new THREE.Vector3().crossVectors(y, z);
          const m = this.add(g, G.box(), pr.color === undefined ? 0x6a4424 : pr.color, { pos: P[i].clone().add(P[i - 1]).multiplyScalar(0.5).toArray(), scale: [pr.width || 0.03, len * 1.06, pr.thick || 0.01], outline: pr.outline === undefined ? 0.4 : pr.outline });
          m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
        }
      } else if (pr.shape === 'ball') {
        // a rounded plate or swelling laid on the body (a monster's chest plates, the ridges of a belly); size [x, y, z]
        this.add(g, G.sphere(), pr.color === undefined ? 0x5a5a1a : pr.color, { scale: pr.size || [0.05, 0.05, 0.02], outline: pr.outline === undefined ? 0.5 : pr.outline });
      } else if (pr.shape === 'neckRing') {
        // a ring floating round the neck, not touching it (Whis' and the angels' halo-collar); pr.depth: front-to-back
        // radius as a share of the width (an oval band round the waist: Perfect Cell's)
        const nr = pr.radius || 0.13;
        this.add(g, G.torus(1, pr.thick || 0.11), pr.color || 0x2ab0b8, { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], scale: [nr, nr * (pr.depth || 1), nr * 0.9], outline: pr.outline === undefined ? 0.5 : pr.outline });
      }
      // pr.ride: the prop rides out on the body when a form swells it (the Z-movie Broly's gold pieces): on the torso it
      // follows the chest's bulk, on a limb its muscle (setForm); its own size stays
      if (pr.ride) g.userData.ride = { p0: g.position.clone(), limb: !['chest', 'spine', 'hips', 'neck', 'head'].includes(pr.joint) };
      this.props[pr.id] = g;
      return g;
    }

    /** Is it wearing this? 'scouter', or a prop id ('sword'): a sequence step can need it (Animator.playSequence). */
    wears(what) {
      if (what === 'scouter') return !!(this.scouter && this.scouter[0].visible);
      return !!(this.props && this.props[what]);
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
      // outfit.nails: dark nails on the fingertips, every hand shape (Kid Buu's, Dabura's, Omega Shenron's)
      const nails = (this.app.outfit || {}).nails;
      const knuckleNails = (grp) => {
        if (nails !== undefined) for (let i = 0; i < 4; i++) this.add(grp, G.sphereLo(), nails, { pos: [(i - 1.5) * F * 0.42, -0.072 - F * 0.17, 0.03 + F * 0.2], scale: [F * 0.13, F * 0.07, F * 0.09], outline: 0, shadow: false });
      };
      const tipNail = (fg, len) => {
        if (nails !== undefined) this.add(fg, G.sphereLo(), nails, { pos: [0, -len + 0.006, 0.007], scale: [0.0085, 0.011, 0.005], outline: 0, shadow: false });
      };
      const fist = new THREE.Group();
      hand.add(fist);
      this.add(fist, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F * 1.05, F * 1.08] });
      for (let i = 0; i < 4; i++) {
        this.add(fist, G.sphereLo(), fingers, { pos: [(i - 1.5) * F * 0.42, -0.072, 0.03], scale: [F * 0.27, F * 0.24, F * 0.3], outline: 0.25, shadow: false });
      }
      knuckleNails(fist);
      this.add(fist, S, fingers, { pos: [-s * 0.035, -0.022, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });

      const open = new THREE.Group();
      hand.add(open);
      this.add(open, S, color, { pos: [0, -0.045, 0.004], scale: [F * 0.9, F * 1.02, F * 0.5] });
      for (let i = 0; i < 4; i++) {
        const len = 0.058 - Math.abs(i - 1.5) * 0.006;
        const fg = this.add(open, G.limb(0.0105, len), fingers, { pos: [(i - 1.5) * F * 0.4, -0.085, 0.004], rot: [0.12, 0, (i - 1.5) * 0.09], outline: 0.3, shadow: false });
        fg.userData.finger = true;
        tipNail(fg, len);
      }
      this.add(open, G.limb(0.012, 0.05), fingers, { pos: [-s * F * 0.8, -0.03, 0.012], rot: [0.2, 0, -s * 0.85], outline: 0.3, shadow: false });

      const point = new THREE.Group();
      hand.add(point);
      this.add(point, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F, F * 1.05] });
      for (let i = 0; i < 2; i++) tipNail(this.add(point, G.limb(0.0105, 0.06), fingers, { pos: [(i - 0.5) * F * 0.4 + s * F * 0.25, -0.085, 0.012], outline: 0.3, shadow: false }), 0.06);
      this.add(point, S, fingers, { pos: [-s * 0.035, -0.022, 0.035], scale: [0.02, 0.03, 0.02], outline: 0.4 });

      // the thumbs-up: the fist, the thumb standing out of it along the back of the curled fingers
      // (+z in the hand's frame: straight up when the arm is held out in front)
      const thumb = new THREE.Group();
      hand.add(thumb);
      this.add(thumb, S, color, { pos: [0, -0.04, 0.008], scale: [F * 0.92, F * 1.05, F * 1.08] });
      for (let i = 0; i < 4; i++) {
        this.add(thumb, G.sphereLo(), fingers, { pos: [(i - 1.5) * F * 0.42, -0.072, 0.03], scale: [F * 0.27, F * 0.24, F * 0.3], outline: 0.25, shadow: false });
      }
      knuckleNails(thumb);
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
      const rt = Math.max(b.pelvisW * 1.12, b.waistW * (this._loose || 1) * 1.12), rb = rt * (hm.flare || 1.22), len = hm.len || 0.16, arc = hm.arc, trim = hm.trim;
      this.hem = [];
      for (const [front, a0] of [[true, 0], [false, Math.PI]]) {
        const piv = new THREE.Group();
        piv.position.set(0, 0.07, 0);
        hips.add(piv);
        // each half wraps ~15° past the side so no wedge opens there when the legs swing the halves apart;
        // the back half sits a hair outside the front one where they overlap
        // hm.arc (radians, each half): narrower panels leave the sides open (the Z films' Broly's red cloth, front and back)
        const k = front ? 1 : 1.025, lap = arc !== undefined ? (arc - Math.PI) / 2 : 0.26;
        // hm.open (radians): the front half parts down the middle, a coat's skirt open over the trousers (Fused Zamasu's)
        const op = front && hm.open ? hm.open / 2 : 0;
        const spans = op ? [[a0 + op, Math.PI / 2 + lap - op], [a0 - Math.PI / 2 - lap, Math.PI / 2 + lap - op]] : [[a0 - Math.PI / 2 - lap, Math.PI + 2 * lap]];
        for (const [t0, tl] of spans) {
          const g = geo('hem' + f3(rt) + f3(rb) + f3(len) + front + f3(t0) + f3(tl), () => {
            const c = new THREE.CylinderGeometry(rt * k, rb * k, len, 16, 1, true, t0, tl);
            c.translate(0, -len / 2, 0);
            return c;
          });
          const hmesh = this.add(piv, g, mat, { scale: [1, 1, (b.pelvisD / b.pelvisW) * 1.08], outline: 0.6, name: front ? 'hem:front' : 'hem:back' });
          // trim (outfit.hem.trim: a colour): a band along the bottom edge (Zamasu's gold-edged coat)
          if (trim !== undefined) {
            const tg = geo('hemTrim' + f3(rb) + f3(len) + front + f3(t0) + f3(tl), () => {
              const c = new THREE.CylinderGeometry(rb * k * 1.012, rb * k * 1.014, 0.032, 16, 1, true, t0, tl);
              c.translate(0, -len + 0.016, 0);
              return c;
            });
            if (!this._hemTrimMat) {
              this._hemTrimMat = SL.Toon.makeMat(trim, { side: THREE.DoubleSide, rim: { color: this.rimColor.getHex(), strength: this.rimStrength } });
              this._hemTrimMat.userData.baseEmissive = new THREE.Color(0, 0, 0);
              this.mats.set('hemTrim', this._hemTrimMat);
            }
            const tm = this.add(piv, tg, this._hemTrimMat, { scale: [1, 1, (b.pelvisD / b.pelvisW) * 1.08], outline: 0 });
            if (this.girth) this.girth.push({ mesh: tm, x: tm.scale.x, y: tm.scale.y, z: tm.scale.z, gy: 0 });
          }
          // (the cloth widens with a form's heavier thighs — look.muscle — instead of vanishing inside them)
          if (this.girth) this.girth.push({ mesh: hmesh, x: hmesh.scale.x, y: hmesh.scale.y, z: hmesh.scale.z, gy: 0 });
        }
        this.hem.push({ node: piv, front });
      }
    }

    // off (outfit.capeOff, metres): the cape stands that much further off the back, so a broad back and baggy trousers
    // stay behind it (Dabura's showed through); size (outfit.capeSize, [width, length] shares): a smaller body's cape
    _buildCape(chest, color, off = 0, size) {
      const b = this.b;
      const cape = new THREE.Group();
      cape.position.set(0, b.chestTop - 0.02, -b.chestD * 0.95 - off);
      if (size) cape.scale.set(size[0], size[1], 1);
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
      // lt.side: the whole tail swung out to one side (Beerus' sweeps out to his right, past his hand)
      base.rotation.z = lt.side || 0;
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
        // o.collarDrop (m): a real usekh drapes — the front hangs lower on the chest than the back sits on the
        // shoulders. Each vertex drops by how far forward and how far out it is, and is pushed back out of the
        // chest wherever the drop would bury it (the chest's own profile, CHEST_PTS, gives its radius at a height)
        const drop = o.collarDrop || 0;
        const chestR = (yy) => {
          for (let i = 0; i < CHEST_PTS.length - 1; i++) {
            const [ra, ya] = CHEST_PTS[i], [rb, yb] = CHEST_PTS[i + 1];
            if (yy >= ya && yy <= yb) return ra + ((rb - ra) * (yy - ya)) / Math.max(1e-6, yb - ya);
          }
          return yy > CHEST_PTS[CHEST_PTS.length - 1][1] ? 0 : CHEST_PTS[0][0];
        };
        // o.collarDropBack (0..1, × collarDrop): the back drapes too, a little, onto the shoulder blades; and where
        // the collar hangs (front and back) it hugs the body instead of standing off it. lift: a layer laid on top
        // (the bars) sits that much further out, so it never ties with the band under it
        const dropBack = o.collarDropBack || 0;
        const drape = (geo, cy, lift = 0) => {
          if (!drop) return geo;
          const pa = geo.attributes.position;
          for (let k = 0; k < pa.count; k++) {
            const x = pa.getX(k), z = pa.getZ(k), r = Math.hypot(x, z);
            if (r < 1e-5) continue;
            const f = z >= 0 ? z / r : dropBack * (-z / r), q = U.clamp01((r - r0) / Math.max(1e-6, r1 - r0));
            const dy = -drop * f * f * (0.35 + 0.65 * q);
            const y = pa.getY(k) + dy;
            const need = chestR(cy + y) + 0.01 + lift;
            const hug = dropBack ? q * ((z * z) / (r * r)) : 0;
            const k2 = r < need ? need / r : 1 + (Math.min(1, (need + 0.004) / r) - 1) * hug;
            pa.setXYZ(k, x * k2, y, z * k2);
          }
          pa.needsUpdate = true;
          geo.computeVertexNormals();
          return geo;
        };
        for (let i = 0; i < n; i++) {
          const ra = r0 + ((r1 - r0) * i) / n, rb = r0 + ((r1 - r0) * (i + 1)) / n;
          // a gentle slope out from the neck (a broad flat collar, not a turtleneck): never inside the chest
          const y0 = onChest(r0) + 0.012;
          const ya = Math.max(onChest(ra) + 0.012, y0 - (ra - r0) * 0.36), yb = Math.max(onChest(rb) + 0.012, y0 - (rb - r0) * 0.36);
          // one sloped band: an open frustum from ra (top) down and out to rb
          // (the seam of the band, where its normals do not quite meet, is put at the back, not under the jewel)
          // o.collarArc (radians): the front of it only — a chest piece rather than a collar (the Z films' Broly)
          const geo = drape(new THREE.CylinderGeometry(ra, rb, Math.max(0.004, ya - yb), 44, drop ? 4 : 1, true, o.collarArc ? -o.collarArc / 2 : Math.PI, o.collarArc || Math.PI * 2), (ya + yb) / 2);
          (this.geos = this.geos || []).push(geo);
          parts.push(this.add(chest, geo, bands[i], { pos: [0, (ya + yb) / 2, 0.004], scale: [sx * 1.04, 1, dz], outline: i === n - 1 ? 0.7 : 0 }));
          // o.collarStripes = { color, count, bands: [index, ...], width (of each stripe's share, 0..1) }: short
          // stripes across the chosen bands, all the way round (Beerus' teal bars on the black)
          const cs = o.collarStripes;
          if (cs && (cs.bands || [i]).includes(i)) {
            // phase: where the first bar sits (0.5 leaves the front centre clear for the jewel). One mesh per band.
            const cnt = cs.count || 18, wk = cs.width === undefined ? 0.32 : cs.width, ph = cs.phase || 0;
            const per = (Math.PI * 2) / cnt, secs = [];
            for (let k = 0; k < cnt; k++) secs.push(drape(new THREE.CylinderGeometry(ra * 1.003, rb * 1.003, Math.max(0.004, ya - yb), 3, drop ? 4 : 1, true, (k + ph) * per - (per * wk) / 2, per * wk), (ya + yb) / 2 + 0.0015, 0.002));
            const sg = mergeGeos(secs);
            this.geos.push(sg);
            parts.push(this.add(chest, sg, cs.color, { pos: [0, (ya + yb) / 2 + 0.0015, 0.004], scale: [sx * 1.04, 1, dz], outline: 0, shadow: false }));
          }
        }
        // o.collarJewel = { color, rim, size, band }: a diamond on the front of the collar, in a rim of its own
        if (o.collarJewel) {
          const cj = o.collarJewel, k2 = cj.band === undefined ? n * 0.55 : cj.band + 0.5;
          const r = r0 + ((r1 - r0) * k2) / n, sz2 = cj.size || 0.026;
          let yj = Math.max(onChest(r) + 0.012, onChest(r0) + 0.012 - (r - r0) * 0.36) + 0.004;
          // dropped with the front of the collar, and kept out of the chest like it
          yj -= drop * (0.35 + 0.65 * U.clamp01((r - r0) / Math.max(1e-6, r1 - r0)));
          const rj = Math.max(r, chestR(yj) + 0.014);
          const at = [0, yj, rj * dz + 0.004];
          // tilt: how far it lies back (0.95 suits a flat collar; a draped one hangs near upright on the chest)
          const tl = cj.tilt === undefined ? 0.95 : cj.tilt;
          if (cj.rim !== undefined) parts.push(this.add(chest, G.box(), cj.rim, { pos: at, rot: [-tl, 0, Math.PI / 4], scale: [sz2 * 1.45, sz2 * 1.45, 0.006], outline: 0.3, shadow: false }));
          parts.push(this.add(chest, G.box(), cj.color, { pos: [at[0], at[1] + 0.003 * Math.sin(tl), at[2] + 0.003 * Math.cos(tl)], rot: [-tl, 0, Math.PI / 4], scale: [sz2, sz2, 0.008], outline: cj.rim === undefined ? 0.3 : 0, shadow: false }));
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
      const fur = this._isFur(jk.color);
      if (!mat) {
        // drawn from both sides: the lining shows at the open front
        mat = SL.Toon.makeMat(jk.color, { side: THREE.DoubleSide, rim: { color: this.rimColor.getHex(), strength: this.rimStrength, fur: fur ? 1 : 0 } });
        mat.userData.baseEmissive = new THREE.Color(0, 0, 0);
        this.mats.set('jacket', mat);
      }
      // half the opening at the front, in radians: wider over the chest, narrower at the waist, so the
      // two shells meet in one line
      // a pelt's opening (outfit.fur: Super Saiyan 4) is ragged: every other row of the two front edges pulled into the
      // gap, so the edge is a line of tufts pointing at the bare chest
      const shell = (key, pts, seg, gap) =>
        geo(key + f3(gap) + (fur ? 'fur' : ''), () => {
          const fine = fur ? finer(pts, 3) : pts;
          const g = new THREE.LatheGeometry(fine.map(([r, y]) => new THREE.Vector2(r, y)), seg, gap, Math.PI * 2 - gap * 2);
          if (!fur) return g;
          const p = g.attributes.position, rows = fine.length;
          for (const [col, dir] of [[0, -1], [seg, 1]]) {
            for (let j = 1; j < rows - 1; j += 2) {
              const i = col * rows + j, r = fine[j][0];
              if (r < 0.04) continue;
              const phi = (dir < 0 ? gap : Math.PI * 2 - gap) + dir * Math.min(gap * 0.7, 0.032 / r);
              p.setXYZ(i, Math.sin(phi) * r, p.getY(i) - 0.012, Math.cos(phi) * r);
            }
          }
          return g;
        });
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
      // ar.pecs: the plate covers only the upper chest, a shelf over the pecs (Cooler's), the ribs below it bare
      // ar.wrap (radians): the plate runs only that far round the front, to the armpits — the back is the suit (Baby Vegeta's)
      // (a wrapped plate stands a little further off the chest, so the chest under its lower edge never shows through)
      const plateGeo = ar.wrap ? geo('chestWrap' + f3(ar.wrap), () => new THREE.LatheGeometry(CHEST_PTS.map(([r, y]) => new THREE.Vector2(r, y)), 24, -ar.wrap / 2, ar.wrap)) : G.chest();
      const wx = ar.wrap ? 1.05 : 1, wz = ar.wrap ? 1.07 : 1, wo = ar.wrap ? 0.004 : 0;
      A.plate = ar.pecs
        ? this.add(chest, plateGeo, ar.plate, { pos: [0, 0.14, 0.014 + wo], scale: [(b.chestW / 0.2) * 1.1 * wx, 0.56, (b.chestD / 0.2) * 1.12 * wz] })
        : this.add(chest, plateGeo, ar.plate, { pos: [0, -0.005, 0.01 + wo], scale: [(b.chestW / 0.2) * 1.1 * wx, 0.96, (b.chestD / 0.2) * 1.18 * wz] });
      A.belly = this.add(spine, G.abs(), ar.belly !== undefined ? ar.belly : ar.plate, { pos: [0, 0.01, 0.004], scale: [(b.waistW / 0.13) * 1.1, (b.absLen / 0.2) * 0.98, (b.waistD / 0.13) * 1.1] });
      // the trim edges the plate's lower rim (CHEST_PTS' [0.135, -0.065] at the plate's scale), on the chest so it moves and
      // swells with the plate (2026-10-16: it was a ring fixed on the spine a hand above that rim and wider than the body
      // there — a hoop floating round Vegeta's Whis armour, the Frieza Force's and the rest)
      if (ar.trim !== undefined && !ar.pecs) {
        const rimY = -0.005 - 0.065 * 0.96;
        A.trim = this.add(chest, G.torus(1, 0.1), ar.trim, { pos: [0, rimY + 0.004, 0.01 + wo], rot: [Math.PI / 2, 0, 0], scale: [0.135 * (b.chestW / 0.2) * 1.1 * wx, 0.135 * (b.chestD / 0.2) * 1.18 * wz, 0.22], outline: 0.4 });
      }
      const padStyle = ar.pads === undefined ? 'none' : ar.padStyle || 'up';
      if (padStyle === 'strap') {
        // no shoulder flaps: a band over each shoulder, front to back (later Frieza Force and Earth armor)
        // padScale widens them (Bardock's classic armor has broad green straps)
        const ps = ar.padScale || 1;
        for (const s of [1, -1]) A.pads.push(this.add(chest, G.box(), ar.pads, { pos: [s * b.chestW * 0.56, 0.283 - (ps - 1) * 0.012, 0], rot: [0, 0, s * 0.3], scale: [0.052 * ps, 0.024, b.chestD * (2.25 - (ps - 1) * 0.2)], outline: 0.5 }));
      } else if (padStyle === 'saga') {
        // 'saga': the Frieza Force's shoulder pads (the board p.12–18, the Ginyu Force): flat and pointed, wide where they
        // sit on the shoulder, reaching well out past it and lifting a little at the tip — a seven-sided cone laid on its
        // side (2026-10-16: they fell through to the generic small ellipsoid and read as nubs). padScale lengthens them
        const ps = ar.padScale || 1;
        for (const s of [1, -1]) A.pads.push(this.add(chest, G.cone(), ar.pads, { pos: [s * b.chestW * 0.55, b.shoulderY + 0.062, -0.004], rot: [-0.12, 0, -s * (Math.PI / 2 - 0.4)], scale: [0.06, (b.chestW * 0.68 + 0.1) * ps, 0.13], outline: 0.6 }));
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

    /**
     * One chip knocked out of the chest plate (blows the armour shrugs off: Pikkon on Super Janemba). The i-th
     * of a fixed set of spots on the plate's front gets a jagged dark crack with a pale broken flake beside it
     * — no glow — kept until repairArmor(). Returns the chip's point in world space (render space), or null
     * with no plate.
     */
    chipArmor(i) {
      const A = this.armorParts;
      if (!A || !A.plate || !A.plate.visible) return null;
      const b = this.b;
      const sx = (b.chestW / 0.2) * 1.1, sz = (b.chestD / 0.2) * 1.18;
      // [across the chest (unit width 0.2), up the plate, the crack's slant]
      const SPOT = [[0.06, 0.17, 0.5], [-0.07, 0.12, -0.6], [0.02, 0.06, 1.1], [-0.03, 0.22, 0.2], [0.09, 0.09, -0.9], [-0.1, 0.18, 0.8], [0, 0.13, -0.3], [0.05, 0.23, 1.3]];
      const [ux, y, a] = SPOT[i % SPOT.length];
      // the plate's radius at that height (its lathe profile, scaled as _buildArmor lays it on)
      const ly = (y + 0.005) / 0.96;
      let R = 0;
      for (let k = 1; k < CHEST_PTS.length; k++) {
        const [r0, y0] = CHEST_PTS[k - 1], [r1, y1] = CHEST_PTS[k];
        if (ly <= y1) {
          R = r0 + ((r1 - r0) * (ly - y0)) / (y1 - y0);
          break;
        }
      }
      const x = ux * (b.chestW / 0.2);
      const th = Math.asin(U.clamp(x / (R * sx), -0.95, 0.95));
      const g = new THREE.Group();
      g.position.set(x, y, R * sz * Math.cos(th) + 0.012);
      g.rotation.set(0, th * 0.8, a);
      A.chest.add(g);
      const dark = this.mat(0x0c0a12, { basic: true });
      // three jagged segments end to end, then the pale broken edge beside the first
      let px = -0.07, py = 0;
      for (const [len, turn] of [[0.06, 0], [0.055, 0.9], [0.045, -0.6]]) {
        const ex = px + Math.cos(turn) * len, ey = py + Math.sin(turn) * len;
        this.add(g, G.box(), dark, { pos: [(px + ex) / 2, (py + ey) / 2, 0], rot: [0, 0, turn], scale: [len, 0.017, 0.004], outline: 0, shadow: false });
        px = ex;
        py = ey;
      }
      this.add(g, G.box(), this.mat(0xd8c8ec, { basic: true }), { pos: [-0.04, 0.019, -0.001], rot: [0, 0, 0.35], scale: [0.04, 0.024, 0.004], outline: 0, shadow: false });
      A.cracks.push(g);
      this.root.updateMatrixWorld(true);
      return g.getWorldPosition(new THREE.Vector3());
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
        // d.glow: unlit, full colour whatever the light (the Tree of Might's power burning in Turles' veins)
        const basic = !!d.glow;
        if (dims[key] && d.t !== undefined) {
          const [len, r] = dims[key];
          const ang = d.ang || 0, rr = r * (d.lift || 1.03);
          m = this.add(j, S, d.color, { pos: [Math.sin(ang) * rr, -d.t * len, Math.cos(ang) * rr], rot: [0, ang, d.tilt || 0], scale: [sz[0], sz[1], 0.006], outline: 0, shadow: false, basic });
        } else {
          m = this.add(j, S, d.color, { pos: d.pos || [0, 0, 0], rot: d.rot || [0, 0, 0], scale: [sz[0], sz[1], sz[2] || 0.006], outline: 0, shadow: false, basic });
        }
        // d.hidden: drawn only when a state shows it (Broly's veins: the legendary mechanic, with the form)
        if (d.hidden) m.visible = false;
        // d.forms: drawn only in those forms (setForm shows and hides it)
        if (d.forms) {
          m.userData.forms = d.forms;
          m.visible = false;
        }
        if (d.vein) (this.veinDecals = this.veinDecals || []).push(m);
        this.decalMeshes.push(m);
      }
    }

    /** Wings folded down the back (Cell): two long flat points from the shoulder blades to the backs of the knees. */
    _buildWings(chest, w) {
      const b = this.b;
      this.wingMeshes = [];
      if (w.style === 'beetle') return this._buildBeetleWings(chest, w);
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

    /**
     * wings.style 'beetle' (Hirudegarn): two great wing cases spread out sideways from the tops of the shoulders — a
     * dark shell (w.edge) over a ribbed under-layer (w.under, ribs in w.rib) framed at the front by the body's own plate
     * colour (w.color) — and behind them two pairs of glassy membranes (w.membrane), fanned down and back.
     * len / width in metres; lift raises the outer ends.
     */
    _buildBeetleWings(chest, w) {
      const b = this.b, S = G.sphere(), len = w.len || 0.5, wd = w.width || 0.2;
      // the wings move (tick): kept with their resting angles
      this.beetle = { t: 0, open: new Spring(30, 8), cases: [], membranes: [] };
      for (const s of [1, -1]) {
        const g = new THREE.Group();
        g.position.set(s * b.shoulderX * 0.55, b.chestTop + 0.01, -b.chestD * 0.55);
        g.rotation.set(0.2, -s * 0.5, s * (w.lift === undefined ? 0.22 : w.lift));
        chest.add(g);
        this.beetle.cases.push({ node: g, s, rx: g.rotation.x, rz: g.rotation.z });
        const at = s * len * 0.92;
        this.wingMeshes.push(
          this.add(g, S, w.edge, { pos: [at, 0, 0], scale: [len, 0.05, wd], outline: 1 }),
          this.add(g, S, w.under, { pos: [at * 0.78, -0.022, 0.012], scale: [len * 0.72, 0.04, wd * 0.82], outline: 0.5 }),
          this.add(g, S, w.color, { pos: [at * 0.6, 0.026, wd * 0.3], scale: [len * 0.62, 0.034, wd * 0.62], outline: 0.5 })
        );
        // the ribs across the under-layer
        for (let i = 1; i <= 4; i++) this.add(g, G.box(), w.rib === undefined ? 0x3a3450 : w.rib, { pos: [at * (0.32 + i * 0.16), -0.05, 0], rot: [0, s * 0.1, 0], scale: [0.012, 0.012, wd * 1.3 * (1 - i * 0.12)], outline: 0, shadow: false });
        // the membranes: thin, pale and half-clear, drawn without an ink line
        if (w.membrane !== undefined) {
          for (const [k, yaw, drop] of [[1, 0.25, 0.5], [0.8, 0.6, 0.9]]) {
            const mg = new THREE.Group();
            mg.position.set(s * b.shoulderX * 0.4, b.chestTop - 0.06, -b.chestD * 0.8);
            mg.rotation.set(0.35, -s * yaw, s * drop);
            chest.add(mg);
            this.beetle.membranes.push({ node: mg, s, rz: mg.rotation.z });
            this.wingMeshes.push(this.add(mg, S, w.membrane, { basic: true, opacity: 0.3, pos: [s * len * 0.7 * k, 0, 0], scale: [len * 0.75 * k, 0.006, wd * 0.6 * k], outline: 0, shadow: false }));
          }
        }
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
      // build.headScale: the whole head (skull, face, extras, hair) smaller or larger round the neck, every face
      // value keeping its tuning (Beerus' head is smaller against his body than headR's face sizes allow)
      const hs = b.headScale || 1;
      hc.position.set(0, R * 0.95 * hs, 0);
      if (hs !== 1) hc.scale.setScalar(hs);
      head.add(hc);
      this.headCenter = hc;
      // face.skull: the skull's own proportions (Beerus' tall sphinx head) as multiples of the default ellipsoid
      const sk = f.skull || [1, 1, 1];
      // face.skullY lifts the cranium off the jaw (a long, pointed lower face under broad temples: Beerus)
      // face.headShape: one shaped skull with the jaw and chin in it (G.headShaped); the jaw sphere below is skipped
      this.skull = this.add(hc, f.headShape ? G.headShaped(f.headShape) : S, skin, { pos: [0, R * (f.skullY || 0), 0], scale: [R * SKULL[0] * sk[0], R * SKULL[1] * sk[1], R * SKULL[2] * sk[2]], skin: true });
      // the jaw and cheeks carry the face's age and build (all opt-in, 1 = as before): face.jaw
      // lengthens the chin (an adult, a hard face), face.jawW narrows it, face.cheeks rounds (>1),
      // flattens (<1) or drops (0) the cheekbones
      const jaw = f.jaw || 1, jawW = f.jawW || 1;
      if (!f.headShape) this.add(hc, S, skin, { pos: [0, -R * (0.42 + (jaw - 1) * 0.3), R * (0.12 + (jaw - 1) * 0.08)], scale: [R * 0.66 * jawW, R * 0.56 * jaw, R * 0.7], outline: f.jawLine || 0, skin: true });
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
      this.face.browMat.userData.baseEmissive = new THREE.Color(0, 0, 0);
      this.mats.set('brow', this.face.browMat);
      const eyeX = f.eyeX || 0.043;
      const ew = f.eyeW || 1;
      // taller or narrower eyes (face.eyeH): the expressions scale from this, not from a constant
      this._eyeH = f.eyeH || 1;
      // face.eyeTilt (radians): the whole eye slanted, inner corner low (a cat's eye, a scowl); face.browY moves the
      // brow line up or down onto the lid; face.eyeRim: the eye ringed in a colour (black) all the way round
      const tilt = (this._eyeTilt = f.eyeTilt || 0);
      this._browY = f.browY || 0;
      if (f.eyeRim !== undefined) this.face.rims = [];
      for (const s of [1, -1]) {
        const eye = this.add(hc, S, eyeWhite, { pos: [s * eyeX, 0.004, R * 0.9], rot: [0, s * 0.38, s * tilt], scale: [0.028 * ew, 0.02, 0.011], outline: 0, basic: true, shadow: false });
        if (f.eyeRim !== undefined) this.face.rims.push(this.add(hc, S, this.mat(f.eyeRim, { basic: true }), { pos: [s * eyeX, 0.004, R * 0.9 - 0.0015], rot: [0, s * 0.38, s * tilt], scale: [0.028 * ew * 1.12, 0.02 * 1.12, 0.011], outline: 0, basic: true, shadow: false }));
        const pup = this.add(hc, G.sphereLo(), this.face.pupilMat, { pos: [s * (eyeX - 0.005), 0.001, R * 0.99], rot: [0, 0, s * tilt], scale: [0.0105, 0.0145, 0.005], outline: 0, basic: true, shadow: false });
        const hl = this.add(hc, G.sphereLo(), highlight, { pos: [s * (eyeX - 0.009) + 0.002, 0.007, R * 1.01], scale: [0.0034, 0.0034, 0.002], outline: 0, basic: true, shadow: false });
        const lash = this.add(hc, G.box(), lashMat, { pos: [s * eyeX, 0.02, R * 0.945], rot: [0, s * 0.38, s * 0.12], scale: [0.036 * ew, 0.0048, 0.009], outline: 0, basic: true, shadow: false });
        const brow = this.add(hc, G.box(), this.face.browMat, { pos: [s * eyeX, 0.036 + this._browY, R * 0.93], rot: [0, s * 0.35, 0], scale: [0.042 * (f.browW || 1), 0.0105 * (f.browThick || 1), 0.014], outline: 0, shadow: false });
        // a flick at the outer corner of the lash line (face.lashWing): the lashes of a woman's eye
        if (f.lashWing) this.add(hc, G.box(), lashMat, { pos: [s * (eyeX + 0.019 * ew), 0.021, R * 0.925], rot: [0, s * 0.62, s * 0.62], scale: [0.013, 0.0042, 0.008], outline: 0, basic: true, shadow: false });
        // where the pupil and its highlight sit looking straight ahead (setGaze moves them from here)
        pup.userData.home = pup.position.clone();
        hl.userData.home = hl.position.clone();
        this.face.eyes.push(eye);
        this.face.pupils.push(pup);
        this.face.lights.push(hl);
        this.face.lashes.push(lash);
        this.face.brows.push(brow);
      }
      // face.mouthY / face.mouthZ: where the mouth sits (a muzzle or a deeper skull — Beerus — buried it in the head)
      this._mouthY = -0.062 + (f.mouthY || 0);
      this._mouthZ = R * (f.mouthZ || 0.83);
      this.face.mouth = this.add(hc, G.box(), f.mouthColor !== undefined ? f.mouthColor : 0x4a1616, { pos: [0, this._mouthY, this._mouthZ], scale: [0.03, 0.005, 0.01], outline: 0, shadow: false });
      this.face.teeth = this.add(hc, G.box(), this.mat(0xf6f2ea, { basic: true }), { pos: [0, this._mouthY + 0.004, this._mouthZ + R * 0.015], scale: [0.026, 0.0045, 0.006], outline: 0, basic: true, shadow: false });
      this.face.teeth.visible = false;
      // face.smileArc (true or { z }): a closed smiling mouth is drawn as a shallow upturned arc instead of the straight
      // line, so the smile lives in the mouth and follows the expression (setExpression); opt-in (Kefla, Caulifla)
      if (f.smileArc) {
        const A = 1.2, rho = 0.03 / (2 * Math.sin(A / 2));
        this._smile = { A, rho, z: (f.smileArc.z === undefined ? 0.0015 : f.smileArc.z) };
        this.face.smile = this.add(hc, G.arc(rho, 0.0024, A), f.mouthColor !== undefined ? f.mouthColor : 0x4a1616, { outline: 0, shadow: false });
        this.face.smile.visible = false;
      }
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
        // (kept, so a form can take it off: look.headband false — the Z-movie Broly's circlet breaking)
        this.headbandMeshes = [this.add(hc, G.torus(R * 0.97, 0.013), o.headband, { pos: [0, 0.056, -0.006], rot: [Math.PI / 2 - 0.2, 0, 0], outline: 0.6 })];
        for (const s of [1, -1]) this.headbandMeshes.push(this.add(hc, G.box(), o.headband, { pos: [s * 0.025, 0.0, -R * 1.02], rot: [0.35, 0, s * 0.25], scale: [0.022, 0.13, 0.008], outline: 0.5 }));
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
        // round child's cap, optionally crowned with an ornament (Kid Gohan's Dragon Ball); kept so a form can take it
        // off (look.cap false: Super 13's cap is gone with the change)
        // capTilt (radians, default 0.28): the cap sits tipped back on the head, its brim above the brows (2026-10-16, the
        // owner's collage: Kid Gohan's hat shows his fringe and eyes; level, the brim jutted past the face at brow height
        // and hid the eyes from the front)
        const capG = new THREE.Group();
        capG.rotation.x = -(o.capTilt !== undefined ? o.capTilt : 0.28);
        hc.add(capG);
        this.capMeshes = [this.add(capG, G.hemi(), o.cap, { pos: [0, R * 0.22, -R * 0.02], scale: [R * 1.12, R * 1.05, R * 1.14], outline: 0.8 })];
        if (o.capBall !== undefined) {
          this.add(capG, S, o.capBall, { pos: [0, R * 1.3, 0], scale: R * 0.3, outline: 0.6 });
          if (o.capStars) for (let i = 0; i < o.capStars; i++) this.add(capG, S, 0xd0201a, { pos: [(i % 2 ? 1 : -1) * R * 0.08, R * 1.3 + ((i >> 1) % 2 ? 1 : -1) * R * 0.08, R * 0.29], scale: R * 0.045, outline: 0, shadow: false });
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
      this.headSway = null;
      if (!list) return;
      const skin = this.app.skin;
      for (const ex of list) {
        // ex.sway: hair built as extras (Zangya's curls) — kept in one group that moves like hair (tick)
        if (ex.sway && !this.headSway) g.add((this.headSway = new THREE.Group()));
        this._spike(ex.sway ? this.headSway : g, ex, ex.color !== undefined ? ex.color : skin, this.headExtraR);
      }
    }

    _spike(parent, sp, color, R) {
      const dir = new THREE.Vector3(sp.d[0], sp.d[1], sp.d[2]).normalize();
      const anchor = new THREE.Vector3(sp.a[0], sp.a[1], sp.a[2]);
      if (anchor.lengthSq() > 0) anchor.normalize().multiplyScalar(R * (sp.depth || 0.82));
      // 'ball' extras are ellipsoids (muzzles, cheeks, round ears); 'bar' extras are flat strokes
      // painted on the skin (the Majin mark); default extras are cones (horns, antennae, spikes)
      // 'line' is a painted stroke like 'bar' (a crease, a vein), kept apart so it is never taken for the mark
      const painted = sp.shape === 'bar' || sp.shape === 'line';
      // 'cyl': a cylinder standing on the anchor (a hat's crown)
      // sp.bend (radians): a curved LOCK instead of a straight cone (G.lock), bending toward sp.toward (head space,
      // default down — a lock falls) — layered, separated strands rather than solid spikes (Broly's manes)
      // sp.curl (with bend): the lock keeps its true curve (G.lock's `th`), scaled evenly — Super Buu's and Kid Buu's antennae
      const curl = sp.bend && sp.curl;
      const geo = sp.shape === 'ball' ? G.sphere() : sp.shape === 'cyl' ? G.cyl() : painted ? G.box() : sp.bend ? G.lock(Math.round(sp.bend * 20) / 20, curl ? Math.round((sp.r / sp.l) * 100) / 100 : undefined) : G.cone();
      const m = this.add(parent, geo, color, { scale: curl ? [sp.l, sp.l, sp.l] : [sp.r, sp.l, sp.r * (sp.flat || 0.7)], outline: sp.outline === undefined ? (painted ? 0 : 0.8) : sp.outline, shadow: !painted });
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
      if (sp.bend) {
        // turn the lock about its own axis so that it bends toward `toward`
        const tw = new THREE.Vector3(...(sp.toward || [0, -1, 0]));
        const p = tw.addScaledVector(dir, -tw.dot(dir));
        if (p.lengthSq() > 1e-6) {
          p.normalize();
          const z = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
          m.rotateY(Math.atan2(dir.dot(new THREE.Vector3().crossVectors(z, p)), z.dot(p)));
        }
      }
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
        // the LONG LOCKS of a mane (longer than 0.3 m) are kept apart: hair gravity swings each of them about its own
        // root on the scalp, never the scalp itself (the owner, 2026-10-06: Super Saiyan 3's hair slid off the skull
        // and over his chest when he threw his head back — the whole hair group used to turn about the head's centre)
        const locks = [];
        const spike = (sp) => {
          const m = this._spike(g, sp, matOf(sp), R);
          if (m && sp.l > 0.3 && sp.shape === undefined) {
            m.userData.lockQ0 = m.quaternion.clone();
            locks.push(m);
          }
        };
        for (const sp of def.spikes || []) spike(sp);
        if (def.mirror) {
          for (const sp of def.mirror) {
            spike(sp);
            spike({ ...sp, a: [-sp.a[0], sp.a[1], sp.a[2]], d: [-sp.d[0], sp.d[1], sp.d[2]], twist: sp.twist ? -sp.twist : 0, toward: sp.toward ? [-sp.toward[0], sp.toward[1], sp.toward[2]] : undefined });
          }
        }
        // hair gravity (style.gravity 0..1): how much a long mane resists turning with the head (Animator)
        g.userData.gravity = def.gravity || 0;
        g.userData.locks = locks;
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
      // look.headband false / look.cap false: a form without the band round the head, or without the cap
      for (const m of this.headbandMeshes || []) m.visible = look.headband !== false;
      for (const m of this.capMeshes || []) m.visible = look.cap !== false;
      // look.collar false: a form without the outfit's collar (the Z films' Legendary Broly loses the gold chest piece);
      // touched only when a form asks, so nobody else's collar is ever shown or hidden here
      if (look.collar === false || this._collarOff) {
        this._collarOff = look.collar === false;
        for (const m of this.collarParts || []) m.visible = !this._collarOff;
      }
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
      // the neck rides the top of the chest as it swells (it stayed put, and a heavy form's chest rose over its own neck
      // and chin — the Z films' Legendary Broly)
      if (this.joints.neck) this.joints.neck.position.y = this.b.chestTop * (1 + (this.formScale - 1) * 0.5);
      // the collar and a bare chest's pecs lie on the chest and swell with it (the Z films' Broly's gold chest piece and
      // his Legendary chest, which read flat when the pecs stayed the base size inside it)
      // (2026-10-16: an open jacket or robe swells with it too — Lord Slug's Giant form swallowed the robe's top)
      for (const p of (this.collarParts || []).concat(this.pecMeshes || [], this.jacket || [])) {
        const u = p.userData.c0 || (p.userData.c0 = { s: p.scale.clone(), p: p.position.clone() });
        const fs = this.formScale, fy = 1 + (fs - 1) * 0.5;
        p.scale.set(u.s.x * fs, u.s.y * fy, u.s.z * fs);
        p.position.set(u.p.x * fs, u.p.y * fy, u.p.z * fs);
      }
      // the chest armour swells with the chest it sits on (a bulkier form used to bulge out round a plate that kept
      // the base size: Broly's Wrathful and Super Saiyan states)
      const A = this.armorParts;
      if (A) {
        for (const p of [A.plate, A.belly]) {
          if (!p) continue;
          const s0 = p.userData.s0 || (p.userData.s0 = p.scale.clone());
          p.scale.set(s0.x * this.formScale, s0.y * (1 + (this.formScale - 1) * 0.5), s0.z * this.formScale);
          // (a plate raised over the pecs rides up with the taller chest)
          const p0 = p.userData.p0 || (p.userData.p0 = p.position.clone());
          p.position.y = p0.y * (1 + (this.formScale - 1) * 0.5);
        }
        // the trim on the plate's rim widens with it (a torus lying flat: its x and y are the width and depth)
        if (A.trim) {
          const s0 = A.trim.userData.s0 || (A.trim.userData.s0 = A.trim.scale.clone());
          const p0 = A.trim.userData.p0 || (A.trim.userData.p0 = A.trim.position.clone());
          A.trim.scale.set(s0.x * this.formScale, s0.y * this.formScale, s0.z);
          A.trim.position.y = p0.y * (1 + (this.formScale - 1) * 0.5);
        }
        // ...and the shoulder pieces ride out on it
        for (const p of A.pads || []) {
          const s0 = p.userData.s0 || (p.userData.s0 = p.scale.clone());
          const p0 = p.userData.p0 || (p.userData.p0 = p.position.clone());
          p.position.set(p0.x * this.formScale, p0.y, p0.z * this.formScale);
          p.scale.set(s0.x * this.formScale, s0.y, s0.z * this.formScale);
        }
      }
      if (look.tint !== undefined) {
        this.tintColor.set(look.tint);
        this.tintAmount = look.tintAmount !== undefined ? look.tintAmount : 0.3; // (0 means no tint: Perfect Cell clears Imperfect's)
      } else this.tintAmount = 0;
      this._paint(look.paint, look.skin, look.swap);
      // decals that belong to some forms only (decal.forms: Frieza's forearm and shin plates once the armour is gone)
      for (const m of this.decalMeshes || []) if (m.userData.forms) m.visible = m.userData.forms.includes(form && form.id);
      for (const id in this.props || {}) {
        const g = this.props[id];
        if (g.userData.forms) g.visible = g.userData.forms.includes(form && form.id);
        const rd = g.userData.ride;
        if (rd) {
          const k = rd.limb ? look.muscle || 1 : this.formScale;
          g.position.set(rd.p0.x * k, rd.p0.y * (rd.limb ? 1 : 1 + (k - 1) * 0.5), rd.p0.z * k);
        }
      }
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
      const skin = this.app.skin, o = this.app.outfit || {};
      // what is left under the gi is the outfit's to say (outfit.torn: chest / trap / abs colours,
      // 'skin' for bare, 'under' / 'top' for the outfit's own, and keepSleeve 'L' or 'R'); by default the chest is
      // bare and the belly band stays. torn.strip = { at, ...the same keys }: a second stage from that damage level
      // on (the Tournament of Power gi: the orange top goes first, the undershirt later); gloves 'off': bare hands
      let t = o.torn || {};
      this._tornStage = !!(on && t.strip && (this._damageLevel || 0) >= (t.strip.at || 3));
      if (this._tornStage) t = Object.assign({}, t, t.strip);
      const col = (c) => (c === undefined || c === 'skin' ? skin : c === 'under' ? (o.under !== undefined ? o.under : skin) : c === 'top' ? (o.top !== undefined ? o.top : skin) : c);
      const paint = (m, c) => {
        if (!m) return;
        if (!m.userData.dressed) m.userData.dressed = m.material;
        m.material = on ? this.mat(col(c)) : m.userData.dressed;
      };
      for (const m of this.gi.torso) paint(m, m === this.gi.trap && t.trap !== undefined ? t.trap : t.chest);
      if (on && t.abs !== undefined) paint(this.gi.abs, t.abs);
      else if (this.gi.abs && this.gi.abs.userData.dressed) this.gi.abs.material = this.gi.abs.userData.dressed;
      for (const m of this.gloveHands || []) {
        if (t.gloves !== 'off' && !m.userData.dressed) continue;
        if (!m.userData.dressed) m.userData.dressed = m.material;
        m.material = on && t.gloves === 'off' ? this.mat(skin) : m.userData.dressed;
      }
      for (const m of this.gloveCuffs || []) m.visible = !(on && t.gloves === 'off');
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
      if (this._rips) this.setDamage(this._damageLevel || 0);
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
      const ts = this.app.outfit && this.app.outfit.torn && this.app.outfit.torn.strip;
      if (this._torn && ts && this._tornStage !== L >= (ts.at || 3)) {
        this._torn = null;
        this.setTorn(true);
      }
      const spec = this.app.outfit && this.app.outfit.damage;
      if (!spec || !spec.rips) return;
      if (!this._rips) this._rips = spec.rips.map((r) => this._buildRip(r)).filter(Boolean);
      // a rip in the gi top (one that ends before the tear) goes with the gi when a scene tears it directly
      const tearAt = spec.tearAt !== undefined ? spec.tearAt : 2;
      const inGi = (s) => this._torn && (s.at === 'chest' || s.at === 'spine') && s.until !== undefined && s.until < tearAt;
      for (const r of this._rips) r.mesh.visible = L >= r.spec.level && L <= (r.spec.until === undefined ? 3 : r.spec.until) && !inGi(r.spec) && !this._stoneMats && !this._spiritMats;
    }

    _ripParent(at) {
      const b = this.b, o = this.app.outfit || {};
      const harem = o.pantsStyle === 'harem';
      const baggy = o.pantsStyle === 'gi' || harem;
      if (at === 'chest') return { node: this.chestMesh, pts: CHEST_PTS };
      if (at === 'spine') return { node: this.absMesh, pts: ABS_PTS };
      const side = at.slice(-1);
      const j = this.joints[at];
      if (!j) return null;
      if (at.startsWith('thigh')) return { node: j, r: b.thighR * (harem ? 1.5 : baggy ? 1.38 : 1), len: b.thighLen, side };
      if (at.startsWith('knee')) return { node: j, r: b.shinR * (harem ? 2.1 : baggy ? 1.36 : 1.02), len: b.shinLen * (baggy ? 0.6 : 1), side };
      if (at.startsWith('shoulder')) return { node: j, r: b.upperArmR * (o.sleeves === 'long' ? o.sleeveBulk || 1 : 1), len: b.upperArmLen, side };
      if (at.startsWith('elbow')) return { node: j, r: b.foreArmR * (o.gloves !== undefined && o.gloves !== null ? 1.2 : 1), len: b.foreArmLen, side };
      return null;
    }

    /** A patch that hugs the body where the cloth is gone (see setDamage); also Buu's wounds. */
    _buildRip(r, tex) {
      const P = this._ripParent(r.at);
      if (!P || !P.node) return null;
      const o = this.app.outfit || {};
      const pick = (c) => (c === 'under' ? (o.under !== undefined ? o.under : this.app.skin) : c === 'top' ? (o.top !== undefined ? o.top : this.app.skin) : c === undefined || c === 'skin' ? this.app.skin : c);
      const fill = pick(r.fill);
      const cloth = r.cloth !== undefined ? pick(r.cloth) : r.at === 'chest' || r.at === 'spine' ? (o.top !== undefined ? o.top : this.app.skin) : o.pants !== undefined ? o.pants : this.app.skin;
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
        br.rotation.set(0, s * 0.35, s * (e.brow + (this._eyeTilt || 0)));
        br.position.y = 0.036 + e.browY + (this._browY || 0);
      });
      this.face.lashes.forEach((l, i) => {
        const s = i === 0 ? 1 : -1;
        l.rotation.set(0, s * 0.38, s * (e.lash + (this._eyeTilt || 0)));
      });
      const m = this.face.mouth;
      m.scale.set(0.03 * e.mouthW, 0.005 * e.mouthH, 0.01);
      m.position.y = (this._mouthY === undefined ? -0.062 : this._mouthY) - (e.mouthH - 1) * 0.0015;
      m.position.z = this._mouthZ === undefined ? R * 0.83 : this._mouthZ;
      m.rotation.z = e.mouthRot || 0;
      this.face.teeth.visible = !!e.teeth;
      const sm = this.face.smile;
      if (sm) {
        // a closed mouth turned up at a corner (smirk, warm, cocky, soft) is the arc; open mouths stay the box
        const rot = e.mouthRot || 0, on = !e.teeth && e.mouthH <= 1.4 && rot >= 0.08;
        sm.visible = on;
        m.visible = !on;
        if (on) {
          const S0 = this._smile, k = 0.7 + rot * 2.2;
          sm.scale.set(e.mouthW, k, 1);
          sm.rotation.set(0, 0, -Math.PI / 2 - S0.A / 2 + rot * 0.4);
          sm.position.set(0, m.position.y + S0.rho * k, m.position.z + S0.z);
        }
      }
      this.face.teeth.position.y = m.position.y + 0.005 * e.mouthH * 0.35;
      this.face.teeth.position.z = m.position.z + R * 0.015;
      this.face.teeth.scale.x = 0.026 * e.mouthW;
      this._applyEyes();
    }

    _applyEyes() {
      const e = this.expr;
      const blink = this.blinkT > 0 ? Math.max(0.08, Math.abs(Math.cos((this.blinkT / 0.14) * Math.PI))) : 1;
      const h = e.eyeH * blink;
      const eh = this._eyeH || 1;
      this.face.eyes.forEach((ey) => (ey.scale.y = 0.02 * h * eh));
      if (this.face.rims) this.face.rims.forEach((rm) => (rm.scale.y = 0.02 * h * eh * 1.12));
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
     * Where the eyes look, in the face's own frame: x across (-1..1, +1 toward the eye built at +x), y up (-1..1);
     * ±1 is as far as a pupil goes and stays on its white. 0, 0 is straight ahead, as built. A scene's look (S-FRZ-01).
     */
    setGaze(x = 0, y = 0) {
      if (!this.face || !this.face.pupils) return;
      for (const p of this.face.pupils.concat(this.face.lights)) {
        const h = p.userData.home;
        if (h) p.position.set(h.x + x * 0.012, h.y + y * 0.0035, h.z);
      }
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
      // a slimed skin's drips crawl down (Bio-Broly): one wall clock for every slimed material, so two slimed fighters never
      // run it twice as fast; it stands still while nothing ticks (a paused game)
      if ((this.app.outfit || {}).slime) SL.Toon.slimeTime.value = (performance.now() / 1000) % 1000;
      const mo = motion || { fwd: 0, side: 0, up: 0, turn: 0 };
      const tx = U.clamp(-mo.fwd * 0.006 + mo.up * 0.004, -0.2, 0.16);
      const tz = U.clamp(mo.side * 0.006 + mo.turn * 0.03, -0.18, 0.18);
      const hx = this.hairSwayX.step(tx, dt);
      const hz = this.hairSwayZ.step(tz, dt);
      const hg = this.currentHairGroup();
      if (hg) hg.rotation.set(hx, 0, hz);
      if (this.headSway) {
        // swaying head extras (Zangya's curls): they follow the hair's sway, bounce on a jump or a landing, breathe at
        // rest, and when the head tips back they counter-turn part of the way so the cascade keeps hanging down her back
        const H = this.headSway, ud = H.userData;
        ud.t = (ud.t || 0) + dt;
        ud.bob = ud.bob || new Spring(45, 4);
        const bob = ud.bob.step(U.clamp(-mo.up * 0.02, -0.18, 0.18), dt);
        this.joints.head.getWorldQuaternion((ud.q = ud.q || new THREE.Quaternion()));
        const up = (ud.v = ud.v || new THREE.Vector3()).set(0, 0, 1).applyQuaternion(ud.q).y;
        // (a dead zone: an idle chin held up does not move the mass off the shape it was built in)
        const back = Math.max(0, Math.asin(U.clamp(up, 0, 1)) - 0.15) * 0.6;
        H.rotation.set(hx + bob + back + Math.sin(ud.t * 1.6) * 0.015, 0, hz + Math.sin(ud.t * 1.1) * 0.012);
      }
      if (this.tailSegs) {
        this.tailTime = (this.tailTime || 0) + dt;
        const tt = this.tailTime;
        for (const sg of this.tailSegs) {
          sg.node.rotation.x = sg.curl * 2.2 + Math.sin(tt * 1.4 + sg.i * 0.55) * 0.09 + U.clamp(mo.fwd * 0.004, -0.2, 0.2);
          sg.node.rotation.z = Math.sin(tt * 1.1 + sg.i * 0.7) * 0.16 + U.clamp(mo.turn * 0.02, -0.2, 0.2);
        }
      }
      if (this.beetle) {
        // beetle wings (Hirudegarn): the membranes shiver at rest and buzz as he moves, the cases lift off his back with
        // his speed and settle again when he stops
        const W = this.beetle;
        W.t += dt;
        const go = W.open.step(U.clamp((Math.abs(mo.fwd) + Math.abs(mo.side) + Math.abs(mo.up)) / 24, 0, 1), dt);
        for (const c of W.cases) {
          c.node.rotation.x = c.rx - 0.18 * go;
          c.node.rotation.z = c.rz + c.s * (0.28 * go + 0.025 * Math.sin(W.t * 1.3));
        }
        W.membranes.forEach((m, i) => (m.node.rotation.z = m.rz + m.s * (0.05 * Math.sin(W.t * 2.2 + i) + go * (0.35 + 0.22 * Math.sin(W.t * 38 + i * 1.3)))));
      }
      if (this.hem) {
        // a leg forward lifts the front half of the hem, a leg back lifts the back half
        const a = this.joints.thighL.rotation.x, b2 = this.joints.thighR.rotation.x;
        const fwd = Math.max(0, -Math.min(a, b2)), back = Math.max(0, Math.max(a, b2));
        for (const h of this.hem) h.node.rotation.x = h.front ? -fwd * 0.82 : back * 0.82;
      }
      // model.wind (0..1, set by a scene: the energy wind of a technique being gathered): the cloth
      // streams back and flutters
      const w = this.wind || 0;
      if (w) this.windT = (this.windT || 0) + dt;
      for (const [i, c] of this.cloth.entries()) {
        const gx = w ? w * (0.5 + 0.22 * Math.sin(this.windT * 13 + i * 1.7)) : 0;
        const gz = w ? w * 0.28 * Math.sin(this.windT * 9 + i * 2.3) : 0;
        const cx = c.sx.step(U.clamp(mo.fwd * 0.03 * c.amount + mo.up * 0.02 + gx, -0.9, 1.1), dt);
        const cz = c.sz.step(U.clamp(-mo.side * 0.03 * c.amount + gz, -0.8, 0.8), dt);
        if (c.apron) {
          // the front tabard: a thigh swinging forward lifts it out of the way instead of passing through it
          const j = this.joints;
          const lift = Math.min(0.9, Math.max(0, (j.spine ? j.spine.rotation.x : 0) - Math.min(j.thighL.rotation.x, j.thighR.rotation.x)));
          c.node.rotation.set(Math.min(cx, 0.12) - lift, 0, cz);
        } else c.node.rotation.set(c.cape ? cx * 0.8 : cx, 0, cz);
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

    /** Rim light follows aura: color and strength (0..1.2). A cloaked body (setCloak) glints harder at its edge. */
    setRim(color, strength) {
      if (color !== undefined && color !== null) this.rimColor.set(color);
      this.rimStrength = strength;
      const s = strength * (1 + 2.6 * (this._cloak || 0));
      for (const m of this.mats.values()) {
        const r = m.userData.rim;
        if (!r) continue;
        r.color.copy(this.rimColor);
        r.strength.value = s;
      }
    }

    /**
     * Cloak, 0..1 (an invisible fighter — Mr. See-Through, Mechanics.invisible): the whole body fades to a glassy
     * shimmer. Every material of this model turns nearly clear (5 % at a full cloak), the rim light rises so the
     * silhouette's edge still glints (setRim), and the ink lines go past half. 0 gives the body back exactly as it was.
     * Only this model's own materials are touched (Model.mat makes them per model); the shadow stays, as a cue.
     */
    setCloak(a) {
      a = Math.max(0, Math.min(1, a));
      if (Math.abs((this._cloak || 0) - a) < 0.004) return;
      this._cloak = a;
      for (const m of this.mats.values()) {
        const u = m.userData;
        if (u.cloakOpacity === undefined) {
          u.cloakOpacity = m.opacity;
          u.cloakTransparent = m.transparent;
          u.cloakDepth = m.depthWrite;
        }
        const clear = a > 0.01;
        const tr = clear || u.cloakTransparent;
        if (m.transparent !== tr) {
          m.transparent = tr;
          m.needsUpdate = true;
        }
        // (depth stays written: only the front-most surface shows, so the parts inside do not pile up into an X-ray)
        m.opacity = u.cloakOpacity * (1 - 0.95 * a);
      }
      for (const o of this.outlines) o.visible = this._outlinesOn !== false && a < 0.5;
      this.setRim(null, this.rimStrength);
    }

    /**
     * look.paint { color, amount }: the white of the body painted over (Golden Frieza: everything white goes gold,
     * the coloured domes stay). An emissive tint cannot do it — white plus gold is still white. look.skin: the skin
     * itself in another colour (God of Destruction Toppo's darkened hide). The original colours come back when a form
     * without them is applied.
     */
    _paint(p, skin, swap) {
      for (const [key, m] of this.mats) {
        if (m.userData.basic || !m.color || key === 'pupil' || key === 'brow') continue;
        const u = m.userData;
        // look.swap { authoredHex: hex }: one authored colour becomes another in this form (Frieza's final form: the
        // armour's purple trousers are white skin); the paint below then works on the swapped colour
        const orig = u.unpainted || m.color;
        const sw = swap ? swap[orig.getHex()] : undefined;
        const c = sw !== undefined ? new THREE.Color(sw) : orig;
        let to = null, amount = 1;
        if (skin !== undefined && u.skin) to = skin;
        else if (p) {
          const hi = Math.max(c.r, c.g, c.b), lo = Math.min(c.r, c.g, c.b);
          if (hi - lo <= 0.12 && lo >= 0.6) {
            to = p.color;
            amount = p.amount === undefined ? 0.8 : p.amount;
          }
        }
        if (to !== null || sw !== undefined) {
          if (!u.unpainted) u.unpainted = m.color.clone();
          m.color.copy(c);
          if (to !== null) m.color.lerp(new THREE.Color(to), amount);
        } else if (u.unpainted) {
          m.color.copy(u.unpainted);
          u.unpainted = null;
        }
      }
    }

    /** A light cast over the whole body (a purification running through it); amount 0 takes it off. */
    setTint(color, amount) {
      this.tintColor.set(color);
      this.tintAmount = amount;
      this._updateEmissive();
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
      for (const o of this.outlines) o.visible = on && !((this._cloak || 0) >= 0.5);
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
