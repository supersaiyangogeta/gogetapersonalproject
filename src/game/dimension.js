/*
 * DIMENSION — the reality-warping toolkit (Fusion Reborn: Janemba). Presentation pieces any
 * mechanic, technique or mission can use; none of them knows about Janemba:
 *
 *   SL.Dimension.portal(b, pos, normal, opts)   a swirling hole in the air, facing `normal`:
 *                                               { pos, normal, alive, close(), set(k) }
 *   SL.Dimension.cubes(b, center, opts)         a burst of glassy cubes flying out of a point
 *                                               (a body coming apart, a sword shattering)
 *   SL.Dimension.converge(b, center, opts)      cubes flying IN to a point (a body reassembling)
 *   SL.Dimension.shatter(b, f, opts)            cubes out of a fighter's whole height (Phantom Shift)
 *   SL.Dimension.reassemble(b, f, pos, opts)    ...and back together somewhere else
 *   SL.Dimension.stardust(b, f, opts)           PURIFICATION: prismatic light spreading through a
 *                                               body and leaving it as glittering dust, not fire.
 *                                               opts.leak: light out of the eyes and mouth; opts.apart
 *                                               [from, to]: the body breaks up limb by limb into dust.
 *                                               Returns { k } (0..1, read by the mission)
 *   SL.Dimension.glitter(b, p, n, opts)         a puff of prismatic specks (the Breaker's dust)
 *   SL.Dimension.prismOrb(b, opts)              THE STARDUST BREAKER'S ORB: a translucent sphere of
 *                                               every colour with a star at its heart: { set(pos, r), close() }
 *   SL.Dimension.cosmos(b, center, opts)        deep space behind a finishing move (the far sky and
 *                                               ground go dark, the near world stays): { set(k), close() }
 *
 * Everything runs on simulation ticks (battle.onTick), so it pauses with the game and a scene, and
 * draws its randomness from its own seeded stream (never Math.random: seeded fights must not move).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const Z = new V3(0, 0, 1);

  const COL = { rim: 0xd24aff, inner: 0xff7ad8, core: 0x14061f, spark: 0xffb8f0 };
  const PRISM = [0xff6a8a, 0xffb84a, 0xfff06a, 0x7aff9a, 0x6ad8ff, 0x9a7aff, 0xff8af2, 0xffffff];

  let swirlTex = null;
  function swirl() {
    if (swirlTex) return swirlTex;
    swirlTex = SL.Toon.canvasTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(10,0,20,1)');
      g.addColorStop(0.55, 'rgba(60,10,90,0.95)');
      g.addColorStop(0.85, 'rgba(200,80,255,0.7)');
      g.addColorStop(1, 'rgba(255,140,240,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,170,250,0.55)';
      ctx.lineWidth = 2;
      for (let a = 0; a < 4; a++) {
        ctx.beginPath();
        for (let i = 0; i < 60; i++) {
          const t = i / 60, r = t * w * 0.46, ang = a * (Math.PI / 2) + t * 5.5;
          const x = w / 2 + Math.cos(ang) * r, y = h / 2 + Math.sin(ang) * r;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
    });
    return swirlTex;
  }

  /** The per-battle runner: one tick hook for every live effect. */
  function runner(b) {
    if (b._dim && !b._dim.dead) return b._dim;
    const R = (b._dim = { items: [], rng: U.mulberry32(9137 + (b.frame || 0)), dead: false, geo: new THREE.BoxGeometry(1, 1, 1) });
    b.onTick(() => {
      if (b.disposed) {
        R.dead = true;
        for (const it of R.items) if (it.dispose) it.dispose();
        R.items.length = 0;
        return false;
      }
      for (let i = R.items.length - 1; i >= 0; i--) {
        const it = R.items[i];
        if (it.update(1 / 60) === false) {
          if (it.dispose) it.dispose();
          R.items.splice(i, 1);
        }
      }
      return true;
    });
    return R;
  }

  const D = (SL.Dimension = {
    COLORS: COL,
    PRISM,

    /**
     * A portal: a dark swirling disc in two counter-turning rims, opening over `open` frames and
     * staying until close() (or opts.life frames). opts: radius, color, inner, life, open, sfx
     */
    portal(b, pos, normal, opts = {}) {
      const R = runner(b);
      const r = opts.radius || 0.9;
      const g = new THREE.Group();
      const add = (geo, color, op, blend) => {
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: blend ? THREE.AdditiveBlending : THREE.NormalBlending, map: blend === 'map' ? swirl() : null }));
        m.renderOrder = 12;
        g.add(m);
        return m;
      };
      const core = add(new THREE.CircleGeometry(r, 32), 0xffffff, 0.95, 'map');
      core.material.blending = THREE.NormalBlending;
      const rim = add(new THREE.TorusGeometry(r, r * 0.07, 6, 40), opts.color || COL.rim, 0.95, true);
      const inner = add(new THREE.TorusGeometry(r * 0.72, r * 0.045, 6, 36), opts.inner || COL.inner, 0.8, true);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: opts.color || COL.rim, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.setScalar(r * 3.4);
      g.add(glow);
      const n = (normal && normal.lengthSq() > 0.0001 ? normal.clone() : Z.clone()).normalize();
      g.quaternion.setFromUnitVectors(Z, n);
      g.position.copy(pos);
      g.scale.setScalar(0.01);
      b.scene.add(g);
      const openF = opts.open || 9;
      let t = 0, closing = -1;
      const h = { pos: pos.clone(), normal: n, alive: true, group: g, k: 0 };
      h.close = () => {
        if (closing < 0 && h.alive) closing = 0;
      };
      h.set = (p, nn) => {
        h.pos.copy(p);
        g.position.copy(p);
        if (nn) {
          h.normal.copy(nn).normalize();
          g.quaternion.setFromUnitVectors(Z, h.normal);
        }
      };
      if (opts.sfx !== false) b.sfx('portalOpen', null, { at: pos, vol: opts.vol || 0.8 });
      R.items.push({
        update() {
          t++;
          let k = Math.min(1, t / openF);
          if (opts.life && t >= opts.life && closing < 0) closing = 0;
          if (closing >= 0) {
            closing++;
            k = Math.max(0, 1 - closing / 8);
          }
          h.k = k;
          g.scale.setScalar(Math.max(0.01, U.easeOutCubic ? U.easeOutCubic(k) : k));
          rim.rotation.z += 0.09;
          inner.rotation.z -= 0.14;
          core.rotation.z -= 0.05;
          if (t % 5 === 0 && k > 0.5) b.vfx.sparks(h.pos, COL.spark, 2, 3, 0.06);
          if (closing >= 8) {
            h.alive = false;
            return false;
          }
          return true;
        },
        dispose() {
          b.scene.remove(g);
          for (const m of [core, rim, inner]) {
            m.geometry.dispose();
            m.material.dispose();
          }
          glow.material.dispose();
        },
      });
      return h;
    },

    /**
     * Glassy cubes: opts { count, size, colors, speed, life, spread (start radius), height (a
     * vertical column to spawn over), drift (gravity, default none — they hang in the warp) }.
     */
    cubes(b, center, opts = {}) {
      const R = runner(b), rnd = R.rng;
      const n = opts.count || 24;
      const colors = opts.colors || [0xff6ab4, 0xc44aff, 0x6a3aff, 0xffd0f0];
      const list = [];
      for (let i = 0; i < n; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.9, depthWrite: false });
        const m = new THREE.Mesh(R.geo, mat);
        const s = (opts.size || 0.18) * (0.55 + rnd() * 0.9);
        m.scale.setScalar(s);
        const p = center.clone().add(new V3((rnd() - 0.5) * 2 * (opts.spread || 0.4), (opts.height ? rnd() * opts.height : (rnd() - 0.5) * 2 * (opts.spread || 0.4)), (rnd() - 0.5) * 2 * (opts.spread || 0.4)));
        m.position.copy(p);
        m.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
        const dir = p.clone().sub(center).add(new V3(rnd() - 0.5, rnd() * 0.6, rnd() - 0.5)).normalize();
        m.renderOrder = 11;
        b.scene.add(m);
        list.push({ m, v: dir.multiplyScalar((opts.speed || 6) * (0.5 + rnd())), spin: new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.4), s });
      }
      const life = opts.life || 40;
      let t = 0;
      R.items.push({
        update() {
          t++;
          for (const c of list) {
            c.m.position.addScaledVector(c.v, 1 / 60);
            c.v.multiplyScalar(0.95);
            if (opts.drift) c.v.y -= opts.drift / 60;
            c.m.rotation.x += c.spin.x;
            c.m.rotation.y += c.spin.y;
            c.m.material.opacity = 0.9 * Math.max(0, 1 - Math.max(0, t - life * 0.5) / (life * 0.5));
          }
          return t < life;
        },
        dispose() {
          for (const c of list) {
            b.scene.remove(c.m);
            c.m.material.dispose();
          }
        },
      });
    },

    /** Cubes gathering from all round into `center` over `frames` (a body putting itself back). */
    converge(b, center, opts = {}) {
      const R = runner(b), rnd = R.rng;
      const n = opts.count || 22;
      const colors = opts.colors || [0xff6ab4, 0xc44aff, 0x6a3aff, 0xffd0f0];
      const frames = opts.frames || 14;
      const list = [];
      for (let i = 0; i < n; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.9, depthWrite: false });
        const m = new THREE.Mesh(R.geo, mat);
        m.scale.setScalar((opts.size || 0.17) * (0.55 + rnd() * 0.9));
        const to = center.clone().add(new V3((rnd() - 0.5) * 0.6, (opts.height ? rnd() * opts.height : (rnd() - 0.5) * 0.6), (rnd() - 0.5) * 0.6));
        const from = to.clone().add(new V3(rnd() - 0.5, rnd() - 0.3, rnd() - 0.5).normalize().multiplyScalar((opts.radius || 3) * (0.6 + rnd() * 0.6)));
        m.position.copy(from);
        m.renderOrder = 11;
        b.scene.add(m);
        list.push({ m, from, to });
      }
      let t = 0;
      R.items.push({
        update() {
          t++;
          const k = Math.min(1, t / frames);
          const e = k * k;
          for (const c of list) {
            c.m.position.lerpVectors(c.from, c.to, e);
            c.m.rotation.x += 0.2;
            c.m.rotation.z += 0.15;
            c.m.material.opacity = 0.95 * (1 - Math.max(0, k - 0.85) / 0.15);
          }
          return t < frames + 2;
        },
        dispose() {
          for (const c of list) {
            b.scene.remove(c.m);
            c.m.material.dispose();
          }
        },
      });
    },

    /** A fighter comes apart into floating cubes (opts.hide: the body is gone with them). */
    shatter(b, f, opts = {}) {
      D.cubes(b, f.pos.clone(), Object.assign({ count: 26, height: f.height, spread: f.radius * 0.9, speed: 5, life: 34, size: 0.16 * (f.scale || 1) }, opts));
      b.vfx.flash(f.chest(), 1.6 * (f.scale || 1), COL.inner, 0.18, SL.Toon.tex.glow);
      b.sfx('warpShatter', f, { vol: opts.vol || 0.9 });
      if (opts.hide) f.setHidden(true);
    },

    /** ...and puts itself back at `pos` (the body appears when the cubes arrive: opts.show). */
    reassemble(b, f, pos, opts = {}) {
      const frames = opts.frames || 14;
      D.converge(b, pos.clone(), Object.assign({ count: 24, height: f.height, radius: 3 * (f.scale || 1), frames, size: 0.15 * (f.scale || 1) }, opts));
      if (opts.show) b.after(frames, () => f.setHidden(false));
      b.after(Math.max(1, frames - 3), () => b.sfx('warpShatter', f, { pitch: 1.4, vol: 0.6 }));
    },

    /**
     * PURIFICATION (the Stardust Breaker): the light spreads through the body over `frames`, then
     * the body leaves as glittering prismatic dust drifting up — no explosion, no white frame. The
     * body is hidden at opts.hideAt (0..1). Returns { k } — the mission reads it to time the rest.
     */
    stardust(b, f, opts = {}) {
      const R = runner(b);
      const frames = opts.frames || 150;
      const hideAt = opts.hideAt === undefined ? 0.62 : opts.hideAt;
      const st = { k: 0, done: false };
      let t = 0, hidden = false;
      b.sfx('prismHum', f, { vol: 0.9 });
      // opts.leak: the light bleeding out of his eyes and his mouth (glows on the head joint)
      const head = f.model && f.model.joints && f.model.joints.head;
      const leak = [];
      if (opts.leak && head) {
        const hr = (f.model.b && f.model.b.headR) || 0.12;
        for (const [x, y, s] of [[-0.34, 0.12, 1], [0.34, 0.12, 1], [0, -0.4, 1.3]]) {
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.flare, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
          sp.position.set(x * hr, y * hr, hr * 1.08);
          sp.renderOrder = 16;
          head.add(sp);
          leak.push({ sp, s: s * hr });
        }
      }
      const dropLeak = () => {
        for (const l of leak) {
          if (l.sp.parent) l.sp.parent.remove(l.sp);
          l.sp.material.dispose();
        }
        leak.length = 0;
      };
      // opts.apart [from, to] (0..1): the body comes apart limb by limb, each piece leaving as dust
      const ORDER = ['handL', 'handR', 'footL', 'footR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'shoulderL', 'shoulderR', 'thighL', 'thighR', 'head', 'chest', 'spine', 'hips'];
      const pieces = opts.apart && f.model && f.model.joints ? ORDER.filter((n) => f.model.joints[n]) : [];
      let gone = 0;
      const restore = () => {
        for (const n of pieces) f.model.joints[n].visible = true;
      };
      R.items.push({
        update() {
          t++;
          const k = (st.k = Math.min(1, t / frames));
          const h = f.height, base = f.pos;
          if (leak.length) {
            // stronger as it goes; it flickers through the colours
            const a = Math.min(1, k / 0.25) * (hidden ? 0 : 1);
            leak.forEach((l, i) => {
              l.sp.material.opacity = a * (0.75 + 0.25 * Math.sin(t * 0.7 + i));
              l.sp.material.color.setHex(PRISM[(Math.floor(t / 5) + i) % PRISM.length]);
              l.sp.material.rotation += 0.05;
              l.sp.scale.setScalar(l.s * (3.4 + 5.5 * k));
            });
            if (t % 3 === 0 && !hidden) {
              const hp = head.getWorldPosition(new V3());
              D.glitter(b, hp, 3, { speed: 1.6, life: 0.6, solid: true });
            }
          }
          if (pieces.length && !hidden && k >= opts.apart[0]) {
            const want = Math.floor(U.clamp01((k - opts.apart[0]) / Math.max(0.01, opts.apart[1] - opts.apart[0])) * pieces.length);
            while (gone < want && gone < pieces.length) {
              const j = f.model.joints[pieces[gone++]];
              const p = j.getWorldPosition(new V3());
              j.visible = false;
              D.glitter(b, p, 26, { speed: 1.4, life: 2.6, rise: 1.6, size: 0.15, solid: true });
              if (gone % 3 === 0) b.sfx('warpShatter', f, { pitch: 1.8 + (gone % 4) * 0.1, vol: 0.35 });
            }
          }
          // the light runs through him: sparks rising from inside, the body flashing in the colours
          if (!hidden) {
            if (t % 2 === 0) {
              const c = PRISM[t % PRISM.length];
              const p = base.clone().add(new V3(Math.sin(t * 1.7) * f.radius * 0.8, h * ((t * 0.137) % 1), Math.cos(t * 2.3) * f.radius * 0.8));
              b.vfx.sparks(p, c, 3 + Math.round(k * 6), 2 + k * 4, 0.1 + k * 0.08);
            }
            if (t % 4 === 0 && f.model && f.model.setTint) f.model.setTint(PRISM[Math.floor(t / 4) % PRISM.length], (0.15 + k * 0.5) * (opts.tint || 1));
            if (t % 9 === 0) b.vfx.ring(f.chest(), f.radius * (1 + k * 2), PRISM[(t / 9) % PRISM.length | 0], 0.35);
          }
          if (!hidden && k >= hideAt) {
            hidden = true;
            if (f.model && f.model.setTint) f.model.setTint(0xffffff, 0);
            f.setHidden(true);
            dropLeak();
            restore(); // the pieces come back for whoever shows the body again (it is hidden as a whole now)
            b.sfx('soulBurst', f, { vol: 0.7 });
            // the body leaves as dust: a column of prismatic glitter that drifts up and away
            for (let i = 0; i < 6; i++) b.vfx.sparks(base.clone().add(new V3(0, h * (i / 6), 0)), PRISM[i % PRISM.length], 22, 5, 0.2);
          }
          if (hidden && t % 2 === 0) {
            const up = (k - hideAt) / Math.max(0.01, 1 - hideAt);
            for (let i = 0; i < 5; i++) {
              const c = new THREE.Color(PRISM[(t + i) % PRISM.length]);
              const a = t * 0.7 + i * 1.3;
              b.vfx.add.emit(base.x + Math.cos(a) * f.radius * (0.4 + up), base.y + h * (0.2 + up * 1.5) + i * 0.25, base.z + Math.sin(a) * f.radius * (0.4 + up), Math.cos(a) * 0.6, 1.4 + up, Math.sin(a) * 0.6, c.r, c.g, c.b, 0.95 * (1 - up * 0.5), 0.16 + (i % 2) * 0.1, 1.8, { drag: 0.5 });
            }
          }
          if (k >= 1) {
            st.done = true;
            return false;
          }
          return true;
        },
        dispose() {
          dropLeak();
          restore();
        },
      });
      return st;
    },

    /**
     * GLITTER: n prismatic specks thrown out of p — the Stardust Breaker's dust. opts: speed (m/s),
     * life (s), rise (an upward drift, m/s), size (m), solid (also coloured specks drawn 'over', not
     * added, so the dust keeps its colours on a bright sky). Deterministic (no Math.random).
     */
    glitter(b, p, n, opts = {}) {
      const sp = opts.speed === undefined ? 1.5 : opts.speed, life = opts.life || 1.2, rise = opts.rise || 0, size = opts.size || 0.1;
      for (let i = 0; i < n; i++) {
        const c = new THREE.Color(PRISM[(b.frame + i) % PRISM.length]);
        const a = b.frame * 0.37 + i * 2.39996, e = Math.sin(i * 1.7 + b.frame * 0.3) * 0.9;
        const r = sp * (0.35 + ((i * 7) % 10) / 15);
        const vx = Math.cos(a) * Math.cos(e) * r, vy = Math.sin(e) * r + rise, vz = Math.sin(a) * Math.cos(e) * r;
        // spread a little round p, so specks born together do not pile into one white point
        const j = size * 1.6;
        const x = p.x + Math.cos(a * 1.3) * j, y = p.y + Math.sin(e * 2.1) * j, z = p.z + Math.sin(a * 0.7) * j;
        const s = size * (0.6 + (i % 3) * 0.3), l = life * (0.7 + (i % 4) * 0.12);
        // the twinkle (added light) on every other speck; with opts.solid every speck also has its colour
        // drawn over the background, so the dust stays coloured on a bright sky
        if (!opts.solid || i % 2 === 0) b.vfx.add.emit(x, y, z, vx, vy, vz, c.r, c.g, c.b, 1, opts.solid ? s * 0.7 : s, l, { drag: 1.1, fadeIn: 30 });
        if (opts.solid && b.vfx.specks) b.vfx.specks.emit(x, y, z, vx * 0.9, vy, vz * 0.9, c.r, c.g, c.b, 1, s * 0.75, l * 0.9, { drag: 1.1, fadeIn: 40 });
      }
    },

    /**
     * THE PRISM ORB (the Stardust Breaker): a cyan heart with a galaxy swirl and a white star in it,
     * translucent bands of violet, magenta, pink and gold toward the rim, two thin orbiting rings,
     * twinkling star sparkles and a ring-shaped halo that frames it without washing it out. The body
     * is premultiplied 'over', not additive, so it keeps its colours on a bright sky. It goes where
     * it is told: set(pos, radius) every tick. close() fades it out (opts.fade frames, default 8);
     * inside(a) draws it through a body it has gone into, dimmed to a.
     */
    prismOrb(b, opts = {}) {
      const R = runner(b), rnd = R.rng;
      const g = new THREE.Group();
      const uni = { uTime: { value: 0 }, uAlpha: { value: 1 } };
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(1, 40, 28),
        new THREE.ShaderMaterial({
          uniforms: uni,
          vertexShader: `
            varying vec3 vN; varying vec3 vV;
            void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
          fragmentShader: `
            uniform float uTime; uniform float uAlpha;
            varying vec3 vN; varying vec3 vV;
            void main(){
              vec3 n = normalize(vN);
              float d = abs(dot(n, normalize(vV)));
              float r = sqrt(max(0.0, 1.0 - d * d));          // 0 at the heart, 1 at the rim, as seen
              float ang = atan(n.y, n.x);
              // the heart: deep blue with a pale cyan galaxy arm turning in it
              float arm = 0.5 + 0.5 * sin(ang * 2.0 + r * 9.0 - uTime * 2.4);
              vec3 heart = mix(vec3(0.12, 0.3, 0.95), vec3(0.45, 0.95, 1.0), smoothstep(0.45, 0.95, arm) * (1.0 - r * 0.8));
              // the bands toward the rim, wobbling round it
              float x = r + 0.014 * sin(ang * 5.0 + uTime * 3.0) + 0.008 * sin(ang * 9.0 - uTime * 4.3);
              vec3 c = heart;
              c = mix(c, vec3(0.62, 0.3, 1.0), smoothstep(0.5, 0.6, x));
              c = mix(c, vec3(1.0, 0.32, 0.86), smoothstep(0.64, 0.73, x));
              c = mix(c, vec3(1.0, 0.55, 0.62), smoothstep(0.76, 0.83, x));
              c = mix(c, vec3(1.0, 0.86, 0.32), smoothstep(0.85, 0.91, x));
              c = mix(c, vec3(1.0, 0.45, 0.6), smoothstep(0.94, 0.995, x));
              // fine concentric lines inside each band, drifting outward
              c *= 0.86 + 0.14 * sin(x * 46.0 - uTime * 5.0);
              // the bright heart
              c += vec3(0.75, 0.95, 1.0) * pow(1.0 - r, 7.0) * 0.9;
              float a = mix(0.82, 0.97, smoothstep(0.5, 0.95, r)) * uAlpha;
              gl_FragColor = vec4(c * a, a);
            }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.CustomBlending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
        })
      );
      body.renderOrder = 14;
      g.add(body);
      const sprite = (tex, color, scale, op, order) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
        s.scale.setScalar(scale);
        s.renderOrder = order;
        g.add(s);
        return s;
      };
      // the halo frames it (a ring texture: nothing laid over the heart)
      const halo = sprite(SL.Toon.tex.ring, 0xff7ad0, 3.3, 0.75, 13);
      const halo2 = sprite(SL.Toon.tex.ring, 0xffd060, 2.55, 0.5, 13);
      // the star at the heart
      const star = sprite(SL.Toon.tex.flare, 0xffffff, 1.5, 0.95, 16);
      // two thin orbit rings, nearly level, precessing (normal blending: they keep their colour)
      const rings = [];
      for (const [color, tilt, roll] of [[0xffc83a, 0.42, 0.2], [0xff5ad2, -0.5, -0.35]]) {
        const pivot = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.014, 6, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false }));
        ring.rotation.set(Math.PI / 2 + tilt, 0, roll);
        ring.renderOrder = 15;
        pivot.add(ring);
        g.add(pivot);
        rings.push(ring);
      }
      // the twinkles: star points round it, each on its own slow beat
      const tw = [];
      for (let i = 0; i < 10; i++) {
        const dir = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(1.05 + rnd() * 0.85);
        const s = sprite(SL.Toon.tex.flare, [0xffffff, 0xcff6ff, 0xfff2b0, 0xffd0f4][i % 4], 0.5, 1, 16);
        s.position.copy(dir);
        tw.push({ s, ph: rnd() * 6.28, w: 2 + rnd() * 3, size: 0.45 + rnd() * 0.5 });
      }
      g.visible = false;
      b.scene.add(g);
      const fadeF = opts.fade || 8;
      let t = 0, closing = -1;
      const h = { group: g, pos: new V3(), r: 0, alive: true, alpha: 1 };
      /** Inside a body (the light running through him): drawn through it, dimmed to `a`. */
      h.inside = (a) => {
        h.alpha = a;
        g.traverse((o) => {
          if (o.material) o.material.depthTest = false;
        });
      };
      h.set = (p, r) => {
        h.pos.copy(p);
        h.r = r;
        g.position.copy(p);
        g.scale.setScalar(Math.max(0.001, r));
        g.visible = r > 0.002;
      };
      h.close = () => {
        if (closing < 0) closing = 0;
      };
      R.items.push({
        update() {
          t++;
          let a = h.alpha;
          if (closing >= 0) a *= Math.max(0, 1 - ++closing / fadeF);
          uni.uTime.value = t / 60;
          uni.uAlpha.value = a;
          rings[0].parent.rotation.y += 0.03;
          rings[1].parent.rotation.y -= 0.045;
          star.material.rotation += 0.02;
          star.scale.setScalar(1.35 + Math.sin(t * 0.21) * 0.2);
          halo.material.opacity = (0.65 + Math.sin(t * 0.13) * 0.1) * a;
          halo2.material.opacity = 0.5 * a;
          for (const r of rings) r.material.opacity = 0.7 * a;
          for (const k of tw) {
            const s = Math.max(0, Math.sin(t / 60 * k.w + k.ph));
            k.s.scale.setScalar(k.size * (0.2 + s));
            k.s.material.opacity = a * s;
            k.s.material.rotation += 0.03;
          }
          star.material.opacity = 0.95 * a;
          if (closing >= fadeF) {
            h.alive = false;
            return false;
          }
          return true;
        },
        dispose() {
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) o.material.dispose();
          });
        },
      });
      return h;
    },

    /**
     * DEEP SPACE behind a finishing move: a dark violet nebula with crimson streaks and a field of
     * stars on a sphere of opts.radius (default 42) round `center`. The near world (the fighters, the
     * ground under them, anything inside the sphere) stays in front of it; the sky and the far ground
     * go dark. Fades in over opts.in frames; set(k) to hold a level, close() fades it out (opts.out).
     */
    cosmos(b, center, opts = {}) {
      const R = runner(b), rnd = R.rng;
      const rad = opts.radius || 42;
      const g = new THREE.Group();
      const uni = { uAlpha: { value: 0 }, uTime: { value: 0 } };
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(rad, 40, 24),
        new THREE.ShaderMaterial({
          uniforms: uni,
          vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            uniform float uAlpha; uniform float uTime; varying vec3 vD;
            float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
            float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
              return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
                         mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
            void main(){
              vec3 d = normalize(vD);
              float neb = vn(d * 2.6 + vec3(0.0, uTime * 0.03, 0.0)) * 0.65 + vn(d * 6.5) * 0.35;
              vec3 c = mix(vec3(0.015, 0.005, 0.04), vec3(0.14, 0.03, 0.17), smoothstep(0.38, 0.8, neb));
              c = mix(c, vec3(0.3, 0.04, 0.1), smoothstep(0.72, 0.92, neb) * 0.7);
              gl_FragColor = vec4(c, uAlpha);
            }`,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        })
      );
      shell.renderOrder = -5;
      g.add(shell);
      // the stars: points on the inside of the sphere (sized in metres, so they stay pin-sharp)
      const n = opts.stars || 520;
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const d = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(rad * 0.97);
        pos.set([d.x, d.y, d.z], i * 3);
        const c = new THREE.Color([0xffffff, 0xd8ecff, 0xfff0d0, 0xffd0f0][i % 4]).multiplyScalar(0.5 + rnd() * 0.5);
        col.set([c.r, c.g, c.b], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const stars = new THREE.Points(geo, new THREE.PointsMaterial({ size: rad * 0.0075, map: SL.Toon.tex.soft, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      stars.renderOrder = -4;
      g.add(stars);
      g.position.copy(center);
      b.scene.add(g);
      const inF = opts.in || 30, outF = opts.out || 45;
      let t = 0, level = 1, cur = 0, closing = false;
      const h = { group: g, alive: true };
      h.kind = 'cosmos';
      h.set = (k) => (level = k);
      h.close = (frames) => {
        closing = true;
        if (frames) h.outF = frames;
      };
      R.items.push({
        update() {
          t++;
          const goal = closing ? 0 : level;
          const step = 1 / (closing ? h.outF || outF : inF);
          cur = goal > cur ? Math.min(goal, cur + step) : Math.max(goal, cur - step);
          uni.uAlpha.value = cur;
          uni.uTime.value = t / 60;
          // once it is (nearly) opaque it also hides the far see-through things drawn after it
          shell.material.depthWrite = cur > 0.9;
          stars.material.opacity = cur;
          g.visible = cur > 0.001;
          if (closing && cur <= 0) {
            h.alive = false;
            return false;
          }
          return true;
        },
        dispose() {
          b.scene.remove(g);
          shell.geometry.dispose();
          shell.material.dispose();
          geo.dispose();
          stars.material.dispose();
        },
      });
      return h;
    },

    /**
     * THE DIMENSION BREAK (Super Broly): a space with no ground, made of light — a kaleidoscope folded six ways in
     * deep magenta, violet, cyan and emerald, aurora bands sliding through it, thin facets of white light, and IN
     * it (for depth, not painted on the shell) slow-turning crystals and long beams of light at many distances.
     * Kept a little dark so the fighters in front of it read. opts: radius (70), crystals (26), pillars (14),
     * in/out frames. Hides nothing by itself: a mission hides the stage while it is open (hideWorld/showWorld).
     * Returns { group, set(k), close(frames), pulse(color) }.
     */
    kaleido(b, center, opts = {}) {
      const R = runner(b), rnd = R.rng;
      const rad = opts.radius || 70;
      const g = new THREE.Group();
      const uni = { uAlpha: { value: 0 }, uTime: { value: 0 }, uPulse: { value: 0 }, uPulseCol: { value: new THREE.Color(0xffffff) } };
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(rad, 48, 28),
        new THREE.ShaderMaterial({
          uniforms: uni,
          vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            uniform float uAlpha; uniform float uTime; uniform float uPulse; uniform vec3 uPulseCol; varying vec3 vD;
            float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
            float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
              return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
                         mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
            void main(){
              vec3 d = normalize(vD);
              float seg = 6.2831853 / 6.0;
              float a = atan(d.z, d.x) + uTime * 0.04;
              float fa = abs(mod(a, seg) - seg * 0.5);
              float r = length(d.xz);
              vec3 p = vec3(cos(fa) * r, d.y, sin(fa) * r);
              float n1 = vn(p * 3.0 + vec3(0.0, uTime * 0.12, 0.0));
              float n2 = vn(p * 7.0 - vec3(uTime * 0.08));
              float n3 = vn(p * 4.0 + vec3(11.0, -uTime * 0.05, 3.0));
              vec3 mag = vec3(0.86, 0.12, 0.62), pur = vec3(0.4, 0.1, 0.86), cya = vec3(0.12, 0.78, 0.96), emr = vec3(0.12, 0.86, 0.46);
              vec3 c = mix(pur * 0.4, mag * 0.62, smoothstep(0.3, 0.78, n1));
              c = mix(c, cya * 0.7, smoothstep(0.55, 0.92, n2) * 0.75);
              c = mix(c, emr * 0.62, smoothstep(0.62, 0.96, n3) * 0.6);
              float band = sin(d.y * 9.0 + n1 * 6.0 + uTime * 0.5);
              c += (cya * 0.22 + mag * 0.2) * smoothstep(0.86, 1.0, band);
              float facet = abs(fract(fa / seg * 4.0 + d.y * 1.6 + uTime * 0.02) - 0.5);
              c += vec3(0.85, 0.8, 1.0) * smoothstep(0.022, 0.0, facet) * 0.32;
              c *= 0.6;
              c = mix(c, uPulseCol, uPulse * 0.45);
              gl_FragColor = vec4(c, uAlpha);
            }`,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          fog: false,
        })
      );
      shell.renderOrder = -5;
      g.add(shell);
      // the depth: crystals and beams of light at many distances, turning slowly (additive, never opaque)
      const bits = [];
      const crystalGeo = new THREE.OctahedronGeometry(1, 0);
      const pillarGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
      const mats = [];
      const add = (geo, color, opacity) => {
        const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
        mats.push([m, opacity]);
        const mesh = new THREE.Mesh(geo, m);
        g.add(mesh);
        return mesh;
      };
      for (let i = 0; i < (opts.crystals || 26); i++) {
        const dir = new V3(rnd() - 0.5, (rnd() - 0.5) * 1.2, rnd() - 0.5).normalize();
        const m = add(crystalGeo, PRISM[i % PRISM.length], 0.22 + rnd() * 0.2);
        m.position.copy(dir.multiplyScalar(16 + rnd() * (rad * 0.7)));
        const s = 0.8 + rnd() * 3.2;
        m.scale.set(s, s * (1.4 + rnd()), s);
        bits.push({ m, spin: new V3((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.02), bob: rnd() * 6 });
      }
      for (let i = 0; i < (opts.pillars || 14); i++) {
        const a = (i / (opts.pillars || 14)) * Math.PI * 2 + rnd() * 0.3;
        const d = 24 + rnd() * (rad * 0.6);
        const m = add(pillarGeo, [0x8ad8ff, 0xff7ad8, 0xb88aff, 0x7affb8][i % 4], 0.16 + rnd() * 0.12);
        m.position.set(Math.cos(a) * d, (rnd() - 0.5) * 20, Math.sin(a) * d);
        m.scale.set(0.25 + rnd() * 0.5, rad * (0.8 + rnd() * 0.7), 0.25 + rnd() * 0.5);
        m.rotation.set((rnd() - 0.5) * 0.7, 0, (rnd() - 0.5) * 0.7);
        bits.push({ m, spin: new V3(0, 0.002 + rnd() * 0.004, 0), bob: rnd() * 6, pillar: true });
      }
      g.position.copy(center);
      b.scene.add(g);
      const inF = opts.in || 24, outF = opts.out || 30;
      let t = 0, level = 1, cur = 0, closing = false, pulse = 0;
      const h = { group: g, alive: true, kind: 'kaleido' };
      h.set = (k) => (level = k);
      h.close = (frames) => {
        closing = true;
        if (frames) h.outF = frames;
      };
      h.pulse = (color) => {
        pulse = 1;
        uni.uPulseCol.value.set(color || 0xffffff);
      };
      R.items.push({
        update() {
          t++;
          const goal = closing ? 0 : level;
          const step = 1 / (closing ? h.outF || outF : inF);
          cur = goal > cur ? Math.min(goal, cur + step) : Math.max(goal, cur - step);
          pulse = Math.max(0, pulse - 1 / 18);
          uni.uAlpha.value = cur;
          uni.uTime.value = t / 60;
          uni.uPulse.value = pulse;
          shell.material.depthWrite = cur > 0.9;
          for (const [m, o] of mats) m.opacity = o * cur;
          for (const bt of bits) {
            bt.m.rotation.x += bt.spin.x;
            bt.m.rotation.y += bt.spin.y;
            bt.m.rotation.z += bt.spin.z;
            if (!bt.pillar) bt.m.position.y += Math.sin(t / 60 + bt.bob) * 0.01;
          }
          g.visible = cur > 0.001;
          if (closing && cur <= 0) {
            h.alive = false;
            return false;
          }
          return true;
        },
        dispose() {
          b.scene.remove(g);
          shell.geometry.dispose();
          shell.material.dispose();
          crystalGeo.dispose();
          pillarGeo.dispose();
          for (const [m] of mats) m.dispose();
        },
      });
      return h;
    },

    /**
     * REALITY BREAKING LIKE GLASS at a point: bright crack lines racing out from it through the air, then (opts.burst,
     * or a later call to h.burst()) the pane shatters — flat shards of pale prismatic light flying out and turning,
     * a flash, a ring, the sound of a giant mirror breaking. opts: radius (12), cracks (14), shards (60), facing (the
     * lens: shards are thrown across it). Returns { burst() }.
     */
    glassBreak(b, pos, opts = {}) {
      const R = runner(b), rnd = R.rng;
      const rad = opts.radius || 12;
      const n = opts.cracks || 14;
      for (let i = 0; i < n; i++) {
        const dir = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
        let p = pos.clone();
        const steps = 3 + Math.floor(rnd() * 3);
        for (let s = 0; s < steps; s++) {
          dir.add(new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.5)).normalize();
          const q = p.clone().addScaledVector(dir, (rad / steps) * (0.6 + rnd() * 0.8));
          b.vfx.slash(p, q, i % 3 ? 0xeaf6ff : 0xffd8f8, 0.06 + (1 - s / steps) * 0.06, 0.02);
          p = q;
        }
      }
      b.vfx.flash(pos, 3, 0xffffff, 0.25, SL.Toon.tex.glow);
      b.sfx('warpShatter', null, { at: pos, pitch: 0.7, vol: 1 });
      const h = {
        burst() {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.6, 0, -0.5, -0.4, 0, 0.55, -0.3, 0]), 3));
          const shards = [];
          for (let i = 0; i < (opts.shards || 60); i++) {
            const m = new THREE.MeshBasicMaterial({ color: PRISM[i % PRISM.length], transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
            const mesh = new THREE.Mesh(geo, m);
            const dir = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
            mesh.position.copy(pos).addScaledVector(dir, rnd() * rad * 0.5);
            const s = 0.4 + rnd() * 1.6;
            mesh.scale.set(s, s * (0.6 + rnd()), s);
            mesh.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
            b.scene.add(mesh);
            shards.push({ mesh, m, vel: dir.multiplyScalar(10 + rnd() * 26), spin: new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.3) });
          }
          let life = 0;
          const L = opts.life || 70;
          R.items.push({
            update() {
              life++;
              for (const s of shards) {
                s.mesh.position.addScaledVector(s.vel, 1 / 60);
                s.vel.multiplyScalar(0.985);
                s.mesh.rotation.x += s.spin.x;
                s.mesh.rotation.y += s.spin.y;
                s.m.opacity = 0.85 * (1 - life / L);
              }
              return life < L;
            },
            dispose() {
              for (const s of shards) {
                b.scene.remove(s.mesh);
                s.m.dispose();
              }
              geo.dispose();
            },
          });
          b.vfx.flash(pos, rad * 0.8, 0xf0e8ff, 0.4, SL.Toon.tex.glow);
          b.vfx.ring(pos, rad * 2, 0xe8d8ff, 0.6);
          b.vfx.ring(pos, rad * 1.4, 0x8ad8ff, 0.5, new V3(0.3, 1, 0.2).normalize());
          b.sfx('warpShatter', null, { at: pos, pitch: 0.5, vol: 1.3 });
          b.sfx('explosionBig', null, { at: pos, pitch: 1.3, vol: 0.6 });
        },
      };
      if (opts.burst) h.burst();
      return h;
    },

    /** The world out of sight (the stage's own scenery: never its lights) — the Dimension Break; showWorld() undoes it. */
    hideWorld(b) {
      const st = b.stage;
      if (!st || !st.root || st._dimHidden) return;
      st._dimHidden = [];
      for (const o of st.root.children) {
        if (o.isLight || !o.visible) continue;
        o.visible = false;
        st._dimHidden.push(o);
      }
      st._dimFog = b.scene.fog || (st.scene && st.scene.fog) || null;
      if (st._dimFog) {
        st._dimFogFar = st._dimFog.far;
        st._dimFogNear = st._dimFog.near;
        st._dimFog.near = 4000;
        st._dimFog.far = 5000;
      }
    },
    showWorld(b) {
      const st = b.stage;
      if (!st || !st._dimHidden) return;
      for (const o of st._dimHidden) o.visible = true;
      st._dimHidden = null;
      if (st._dimFog) {
        st._dimFog.near = st._dimFogNear;
        st._dimFog.far = st._dimFogFar;
        st._dimFog = null;
      }
    },
  });
})();
