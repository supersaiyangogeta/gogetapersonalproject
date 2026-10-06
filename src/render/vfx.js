/*
 * Visual effects: pooled GPU particles, flashes, shockwaves, explosion
 * spheres, debris, lightning, auras, beam visuals and screen overlays.
 * Everything is pooled so big fights do not allocate every frame.
 */
(function () {
  'use strict';
  const U = SL.util;

  const NOISE_GLSL = `
    float h31(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float vnoise(vec3 x){
      vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
      return mix(mix(mix(h31(i+vec3(0,0,0)),h31(i+vec3(1,0,0)),f.x), mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x), mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y), f.z);
    }`;

  /* ---------------- GPU particle system ---------------- */
  class Particles {
    constructor(scene, capacity, texture, additive) {
      this.cap = capacity;
      this.pos = new Float32Array(capacity * 3);
      this.col = new Float32Array(capacity * 4);
      this.size = new Float32Array(capacity);
      this.vel = new Float32Array(capacity * 3);
      this.life = new Float32Array(capacity);
      this.maxLife = new Float32Array(capacity);
      this.baseSize = new Float32Array(capacity);
      this.grow = new Float32Array(capacity);
      this.drag = new Float32Array(capacity);
      this.grav = new Float32Array(capacity);
      this.baseAlpha = new Float32Array(capacity);
      this.free = [];
      for (let i = capacity - 1; i >= 0; i--) this.free.push(i);
      this.alive = new Set();
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
      this.uniforms = { map: { value: texture }, uScale: { value: 600 } };
      const mat = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: `
          attribute float size; attribute vec4 color; varying vec4 vColor; uniform float uScale;
          void main(){ vColor = color; vec4 mv = modelViewMatrix * vec4(position,1.0);
            gl_PointSize = size * uScale / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: additive
          ? `uniform sampler2D map; varying vec4 vColor;
             void main(){ vec4 t = texture2D(map, gl_PointCoord); float a = t.a * vColor.a; if (a < 0.003) discard; gl_FragColor = vec4(vColor.rgb * a, a); }`
          : `uniform sampler2D map; varying vec4 vColor;
             void main(){ vec4 t = texture2D(map, gl_PointCoord); float a = t.a * vColor.a; if (a < 0.01) discard; gl_FragColor = vec4(vColor.rgb, a); }`,
        transparent: true,
        depthWrite: false,
        blending: additive ? THREE.CustomBlending : THREE.NormalBlending,
      });
      if (additive) {
        mat.blendSrc = THREE.OneFactor;
        mat.blendDst = THREE.OneFactor;
      }
      this.points = new THREE.Points(geo, mat);
      this.points.frustumCulled = false;
      this.points.renderOrder = additive ? 10 : 9;
      scene.add(this.points);
    }

    emit(x, y, z, vx, vy, vz, r, g, b, a, size, life, opts) {
      if (!this.free.length) return;
      const i = this.free.pop();
      this.alive.add(i);
      const i3 = i * 3, i4 = i * 4;
      this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
      this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
      this.col[i4] = r; this.col[i4 + 1] = g; this.col[i4 + 2] = b; this.col[i4 + 3] = a;
      this.baseAlpha[i] = a;
      this.baseSize[i] = size;
      this.size[i] = size;
      this.life[i] = life;
      this.maxLife[i] = life;
      this.grow[i] = opts ? opts.grow || 0 : 0;
      this.drag[i] = opts ? opts.drag || 0 : 0;
      this.grav[i] = opts ? opts.gravity || 0 : 0;
    }

    update(dt) {
      for (const i of this.alive) {
        this.life[i] -= dt;
        const i3 = i * 3;
        if (this.life[i] <= 0) {
          this.size[i] = 0;
          this.col[i * 4 + 3] = 0;
          this.alive.delete(i);
          this.free.push(i);
          continue;
        }
        const d = Math.exp(-this.drag[i] * dt);
        this.vel[i3] *= d;
        this.vel[i3 + 1] = this.vel[i3 + 1] * d - this.grav[i] * dt;
        this.vel[i3 + 2] *= d;
        this.pos[i3] += this.vel[i3] * dt;
        this.pos[i3 + 1] += this.vel[i3 + 1] * dt;
        this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
        const t = 1 - this.life[i] / this.maxLife[i];
        this.size[i] = this.baseSize[i] * (1 + this.grow[i] * t);
        const fadeIn = Math.min(1, t * 8);
        this.col[i * 4 + 3] = this.baseAlpha[i] * fadeIn * (1 - t * t);
      }
      const g = this.points.geometry;
      g.attributes.position.needsUpdate = true;
      g.attributes.color.needsUpdate = true;
      g.attributes.size.needsUpdate = true;
    }

    clear() {
      for (const i of this.alive) {
        this.size[i] = 0;
        this.life[i] = 0;
        this.free.push(i);
      }
      this.alive.clear();
    }

    dispose() {
      this.points.geometry.dispose();
      this.points.material.dispose();
      if (this.points.parent) this.points.parent.remove(this.points);
    }
  }

  /* ---------------- aura ---------------- */
  const AURA_PROFILE = [
    [0.0, -0.15], [0.42, 0.0], [0.62, 0.45], [0.66, 0.95], [0.6, 1.45], [0.46, 1.9], [0.3, 2.3], [0.14, 2.65], [0.0, 2.95],
  ];
  let auraGeo = null;
  function getAuraGeo() {
    if (!auraGeo) auraGeo = new THREE.LatheGeometry(AURA_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 28);
    return auraGeo;
  }

  function makeAuraMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffffff) },
        uCore: { value: new THREE.Color(0xffffff) },
        uIntensity: { value: 0 },
        uSpeed: { value: 1 },
        uSharp: { value: 0 },
        uView: { value: 1 },
      },
      vertexShader: `
        ${NOISE_GLSL}
        uniform float uTime; uniform float uIntensity; uniform float uSpeed;
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){
          vec3 p = position;
          float n = vnoise(vec3(p.x*3.0, p.y*2.2 - uTime*5.0*uSpeed, p.z*3.0));
          float up = smoothstep(0.2, 2.9, p.y);
          p.xz *= 1.0 + (n - 0.5) * 0.35 * uIntensity + up * 0.08 * sin(uTime*9.0 + p.y*4.0);
          p.y += up * n * 0.55 * uIntensity;
          vP = p;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        ${NOISE_GLSL}
        uniform float uTime; uniform vec3 uColor; uniform vec3 uCore; uniform float uIntensity; uniform float uSpeed; uniform float uSharp; uniform float uView;
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){
          float fres = 1.0 - abs(dot(normalize(vN), normalize(vV)));
          float streak = vnoise(vec3(vP.x*5.0, vP.y*2.5 - uTime*7.0*uSpeed, vP.z*5.0));
          float streak2 = vnoise(vec3(vP.x*11.0 + 3.0, vP.y*5.0 - uTime*11.0*uSpeed, vP.z*11.0));
          float flame = smoothstep(mix(0.35, 0.62, uSharp), mix(0.95, 0.72, uSharp), streak*0.65 + streak2*0.45);
          float vfade = smoothstep(-0.15, 0.35, vP.y) * (1.0 - smoothstep(1.6, 2.95, vP.y));
          // flame streaks fade toward the silhouette centre so the fighter stays readable inside the aura
          float a = (pow(fres, 1.4) * 0.72 + flame * 0.58 * (0.42 + 0.58 * fres)) * vfade * uIntensity * uView;
          vec3 col = mix(uColor, uCore, flame * 0.55 + pow(1.0 - fres, 3.0) * 0.2);
          gl_FragColor = vec4(col * a, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      side: THREE.DoubleSide,
    });
  }

  class Aura {
    constructor(vfx, fighter) {
      this.vfx = vfx;
      this.f = fighter;
      this.group = new THREE.Group();
      this.mat = makeAuraMaterial();
      this.mesh = new THREE.Mesh(getAuraGeo(), this.mat);
      this.mesh.renderOrder = 11;
      this.group.add(this.mesh);
      this.intensity = 0;
      this.target = 0;
      this.color = new THREE.Color(0xffffff);
      this.core = new THREE.Color(0xffffff);
      this.lightning = false;
      this.boltTimer = 0;
      this.emitAcc = 0;
      this.emitMul = 1; // the battle's charge mixing thins secondary auras' particles (the glow stays)
      this.view = 1; // the battle thins the player's own aura under the gameplay camera (see Battle.update)
      this.viewMul = 1;
      this.group.visible = false;
      fighter.object.add(this.group);
    }

    setStyle(style) {
      this.color.set(style.color);
      this.core.set(style.core || 0xffffff);
      this.lightning = !!style.lightning;
      this.particleColor = new THREE.Color(style.particles || style.color);
      this.mat.uniforms.uSpeed.value = style.speed || 1;
      this.mat.uniforms.uSharp.value = style.sharp || 0;
      this.steam = style.steam || null;
      this.sparkColor = style.sparks || null;
      // GOD KI (Super Saiyan God): a flame of several colours instead of one — tongues that lick up
      // off the body in orange, magenta and gold, and the glow itself breathing like a fire
      this.flame = style.flame ? style.flame.map((c) => new THREE.Color(c)) : null;
    }

    update(dt) {
      this.intensity = U.damp(this.intensity, this.target, this.target > this.intensity ? 10 : 4, dt);
      // a hidden fighter (a fusion's parts, a man turned into a candy) has no aura to show either
      const on = this.intensity > 0.02 && !this.f.hidden;
      this.group.visible = on;
      if (!on) return;
      const s = this.f.scale || 1;
      const pulse = 1 + Math.sin(this.vfx.time * 14) * 0.03 * this.intensity;
      this.group.scale.set(s * pulse * (0.85 + this.intensity * 0.3), s * (0.8 + this.intensity * 0.3), s * pulse * (0.85 + this.intensity * 0.3));
      this.group.position.y = -0.05;
      this.mat.uniforms.uTime.value = this.vfx.time;
      this.mat.uniforms.uIntensity.value = this.intensity;
      this.viewMul = U.damp(this.viewMul, this.view, 6, dt);
      this.mat.uniforms.uView.value = this.viewMul;
      this.mat.uniforms.uColor.value.copy(this.color);
      this.mat.uniforms.uCore.value.copy(this.core);

      const p = this.f.pos;
      const scale = this.vfx.pScale;
      this.emitAcc += dt * 60 * this.intensity * scale * this.emitMul;
      const pc = this.particleColor || this.color;
      if (this.flame) {
        // the fire flickers: the shell's strength and the core colour jump about
        this.mat.uniforms.uIntensity.value = this.intensity * (0.82 + Math.random() * 0.3);
        this.mat.uniforms.uCore.value.copy(this.flame[(Math.random() * this.flame.length) | 0]).lerp(this.core, 0.5);
      }
      while (this.flame && this.emitAcc > 1) {
        this.emitAcc -= 1.6;
        const fc = this.flame[(Math.random() * this.flame.length) | 0];
        const a = Math.random() * Math.PI * 2;
        const r = U.rand(0.15, 0.5) * s;
        const tongue = Math.random() < 0.25;
        this.vfx.add.emit(
          p.x + Math.cos(a) * r, p.y + U.rand(0, tongue ? 0.6 : 1.5) * s, p.z + Math.sin(a) * r,
          Math.cos(a) * 0.25, U.rand(tongue ? 7 : 4, tongue ? 12 : 8), Math.sin(a) * 0.25,
          fc.r, fc.g, fc.b, 0.85, U.rand(tongue ? 0.22 : 0.1, tongue ? 0.38 : 0.22) * s, U.rand(0.3, tongue ? 0.75 : 0.5), { drag: 1.4 }
        );
      }
      while (this.emitAcc > 1) {
        this.emitAcc -= 1;
        const a = Math.random() * Math.PI * 2;
        const r = U.rand(0.25, 0.6) * s;
        this.vfx.add.emit(
          p.x + Math.cos(a) * r, p.y + U.rand(0, 1.6) * s, p.z + Math.sin(a) * r,
          Math.cos(a) * 0.4, U.rand(3, 7), Math.sin(a) * 0.4,
          pc.r, pc.g, pc.b, 0.8, U.rand(0.08, 0.2) * s, U.rand(0.3, 0.6), { drag: 1 }
        );
      }
      if (this.steam && Math.random() < dt * 22 * this.intensity * scale * this.emitMul) {
        const sc = new THREE.Color(this.steam);
        const a = Math.random() * Math.PI * 2;
        this.vfx.smoke.emit(p.x + Math.cos(a) * 0.25 * s, p.y + U.rand(0.5, 1.6) * s, p.z + Math.sin(a) * 0.25 * s, Math.cos(a) * 0.6, U.rand(1.5, 3), Math.sin(a) * 0.6, sc.r, sc.g, sc.b, 0.35, 0.35 * s, U.rand(0.5, 0.9), { grow: 1.4, drag: 1 });
      }
      if (this.sparkColor && Math.random() < dt * 6 * this.intensity) {
        this.vfx.sparks(new THREE.Vector3(p.x + U.rand(-0.4, 0.4) * s, p.y + U.rand(0.3, 1.8) * s, p.z + U.rand(-0.4, 0.4) * s), this.sparkColor, 4, 5, 0.08 * s);
      }
      if (this.lightning && this.vfx.level !== 'low') {
        this.boltTimer -= dt;
        if (this.boltTimer <= 0) {
          this.boltTimer = U.rand(0.08, 0.35) / Math.max(0.3, this.intensity);
          this.vfx.bolt(
            new THREE.Vector3(p.x + U.rand(-0.5, 0.5) * s, p.y + U.rand(0.2, 1.9) * s, p.z + U.rand(-0.5, 0.5) * s),
            U.rand(0.5, 1.1) * s,
            0xe8f6ff
          );
          if (Math.random() < 0.3 && this.f.isPlayer) SL.Audio.play('lightning', { vol: 0.7 });
        }
      }
    }

    dispose() {
      if (this.group.parent) this.group.parent.remove(this.group);
      this.mat.dispose();
    }
  }

  /* ---------------- beam visual ---------------- */
  let beamGeo = null, beamHeadGeo = null;
  function makeBeamMaterial(core) {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uCore: { value: new THREE.Color(0xffffff) }, uLen: { value: 1 }, uAlpha: { value: 1 } },
      vertexShader: `
        uniform float uTime; uniform float uLen;
        varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying float vZ;
        void main(){
          vUv = uv; vZ = position.z;
          vec3 p = position;
          float wob = 1.0 + sin(position.z * uLen * 0.9 - uTime * 30.0) * 0.06;
          p.xy *= wob;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColor; uniform vec3 uCore; uniform float uLen; uniform float uAlpha;
        varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying float vZ;
        void main(){
          float facing = abs(dot(normalize(vN), normalize(vV)));
          float bands = 0.5 + 0.5 * sin(vZ * uLen * 1.3 - uTime * 42.0);
          ${core ? 'float a = smoothstep(0.05, 0.6, facing) * 0.9; vec3 col = uCore;' : 'float a = (pow(facing, 1.1) * (0.55 + bands * 0.2) + pow(1.0 - facing, 3.0) * 0.3) * 0.85; vec3 col = mix(uColor, uCore, pow(facing, 5.0) * 0.3) * 1.25;'}
          float endFade = smoothstep(0.0, 0.02, vZ);
          a *= uAlpha * endFade;
          gl_FragColor = vec4(col * a, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      // the outer shell is premultiplied 'over' so beams keep their colour on bright skies and sand;
      // the white core stays additive
      blendDst: core ? THREE.OneFactor : THREE.OneMinusSrcAlphaFactor,
      side: THREE.FrontSide,
    });
  }

  let ringGeo = null;
  class BeamVisual {
    constructor(vfx, color, coreColor, style = {}) {
      if (!beamGeo) {
        beamGeo = new THREE.CylinderGeometry(1, 1, 1, 20, 12, true);
        beamGeo.rotateX(Math.PI / 2);
        beamGeo.translate(0, 0, 0.5);
        beamHeadGeo = new THREE.SphereGeometry(1, 24, 16);
      }
      this.vfx = vfx;
      this.group = new THREE.Group();
      this.outerMat = makeBeamMaterial(false);
      this.coreMat = makeBeamMaterial(true);
      this.outerMat.uniforms.uColor.value.set(color);
      this.outerMat.uniforms.uCore.value.set(coreColor || 0xffffff);
      this.coreMat.uniforms.uCore.value.set(0xffffff);
      this.outer = new THREE.Mesh(beamGeo, this.outerMat);
      this.core = new THREE.Mesh(beamGeo, this.coreMat);
      this.outer.frustumCulled = this.core.frustumCulled = false;
      this.group.add(this.outer, this.core);
      this.headMat = makeBeamMaterial(false);
      this.headMat.uniforms.uColor.value.set(color);
      this.headMat.uniforms.uLen.value = 0.1;
      this.head = new THREE.Mesh(beamHeadGeo, this.headMat);
      this.headCore = new THREE.Mesh(beamHeadGeo, this.coreMat);
      this.flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.flare, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      this.muzzle = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: coreColor || 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      this.flare.renderOrder = this.muzzle.renderOrder = 12;
      vfx.scene.add(this.group, this.head, this.headCore, this.flare, this.muzzle);
      this.color = new THREE.Color(color);
      this._q = new THREE.Quaternion();
      this._z = new THREE.Vector3(0, 0, 1);
      // spiraling energy rings that travel down the beam (signature beams)
      this.rings = [];
      if (style.rings && vfx.level !== 'low') {
        if (!ringGeo) ringGeo = new THREE.TorusGeometry(1, 0.07, 6, 28);
        this.ringMat = new THREE.MeshBasicMaterial({ color: style.ringColor || coreColor || 0xffffff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        for (let i = 0; i < style.rings; i++) {
          const r = new THREE.Mesh(ringGeo, this.ringMat);
          r.frustumCulled = false;
          r.renderOrder = 12;
          this.group.add(r);
          this.rings.push(r);
        }
      }
      this.ringSpeed = style.ringSpeed || 1.4;
    }

    update(origin, head, radius, alpha, t) {
      const dir = new THREE.Vector3().subVectors(head, origin);
      const len = Math.max(0.01, dir.length());
      dir.divideScalar(len);
      this.group.position.copy(origin);
      this._q.setFromUnitVectors(this._z, dir);
      this.group.quaternion.copy(this._q);
      const flick = 1 + Math.sin(t * 50) * 0.05;
      this.outer.scale.set(radius * flick, radius * flick, len);
      this.core.scale.set(radius * 0.34, radius * 0.34, len);
      for (const m of [this.outerMat, this.coreMat, this.headMat]) {
        m.uniforms.uTime.value = t;
        m.uniforms.uLen.value = len;
        m.uniforms.uAlpha.value = alpha;
      }
      this.headMat.uniforms.uLen.value = 2;
      this.head.position.copy(head);
      this.head.scale.setScalar(radius * 1.55 * flick);
      this.headCore.position.copy(head);
      this.headCore.scale.setScalar(radius * 0.95);
      this.flare.position.copy(head);
      this.flare.scale.setScalar(radius * 6 * (0.9 + Math.random() * 0.2));
      this.flare.material.opacity = alpha * 0.7;
      this.muzzle.position.copy(origin);
      this.muzzle.scale.setScalar(radius * 3.4 * flick);
      this.muzzle.material.opacity = alpha * 0.8;
      const n = this.rings.length;
      for (let i = 0; i < n; i++) {
        const ph = (t * this.ringSpeed + i / n) % 1;
        const ring = this.rings[i];
        ring.position.set(0, 0, len * ph);
        const s = radius * (1.25 + Math.sin(ph * Math.PI) * 0.35);
        ring.scale.set(s, s, s);
        ring.rotation.set(Math.sin(t * 3 + i) * 0.25, Math.cos(t * 2.4 + i) * 0.25, ph * 6);
      }
      if (this.ringMat) this.ringMat.opacity = 0.55 * alpha;
    }

    dispose() {
      if (this.ringMat) this.ringMat.dispose();
      this.vfx.scene.remove(this.group, this.head, this.headCore, this.flare, this.muzzle);
      this.outerMat.dispose();
      this.coreMat.dispose();
      this.headMat.dispose();
      this.flare.material.dispose();
      this.muzzle.material.dispose();
    }
  }

  // scratch space for the slash billboards
  const _sa = new THREE.Vector3(), _sv = new THREE.Vector3(), _sy = new THREE.Vector3(), _sm = new THREE.Matrix4();

  /* ---------------- main VFX manager ---------------- */
  class VFX {
    constructor(scene) {
      this.scene = scene;
      this.time = 0;
      this.level = SL.Render.effectsLevel();
      this.pScale = SL.Render.particleScale();
      const cap = Math.round(3200 * Math.max(0.5, this.pScale));
      this.add = new Particles(scene, cap, SL.Toon.tex.glow, true);
      this.smoke = new Particles(scene, Math.round(900 * Math.max(0.5, this.pScale)), SL.Toon.tex.smoke, false);
      this.flashes = [];
      this.rings = [];
      this.balls = [];
      this.debris = [];
      this.bolts = [];
      this.lights = [];
      this.auras = [];
      this.ghosts = [];
      this.slashes = [];
      this.stage = null;
      for (let i = 0; i < 3; i++) {
        const l = new THREE.PointLight(0xffffff, 0, 40, 2);
        l.userData.life = 0;
        scene.add(l);
        this.lights.push(l);
      }
      this._sphereGeo = new THREE.SphereGeometry(1, 24, 16);
      this._ringGeo = new THREE.PlaneGeometry(1, 1);
      this._debrisGeo = [new THREE.DodecahedronGeometry(1, 0), new THREE.IcosahedronGeometry(1, 0), new THREE.BoxGeometry(1.4, 0.8, 1)];
      this._boltMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    }

    setStage(stage) {
      this.stage = stage;
    }

    /* ----- primitives ----- */
    flash(pos, size, color = 0xffffff, life = 0.18, tex) {
      let s = this.flashes.find((f) => !f.visible);
      if (!s) {
        if (this.flashes.length > 60) return;
        s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.flare, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        s.renderOrder = 13;
        this.scene.add(s);
        this.flashes.push(s);
      }
      s.material.map = tex || SL.Toon.tex.flare;
      s.material.color.set(color);
      s.material.rotation = Math.random() * Math.PI;
      s.position.copy(pos);
      s.userData = { life, max: life, size };
      s.scale.setScalar(size);
      s.visible = true;
    }

    ring(pos, radius, color = 0xffffff, life = 0.45, flatNormal) {
      let m = this.rings.find((r) => !r.visible);
      if (!m) {
        if (this.rings.length > 30) return;
        m = new THREE.Mesh(this._ringGeo, new THREE.MeshBasicMaterial({ map: SL.Toon.tex.ring, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
        m.renderOrder = 12;
        this.scene.add(m);
        this.rings.push(m);
      }
      m.material.color.set(color);
      m.position.copy(pos);
      m.userData = { life, max: life, radius, billboard: !flatNormal };
      if (flatNormal) {
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), flatNormal);
      }
      m.scale.setScalar(0.1);
      m.visible = true;
    }

    ball(pos, radius, color, life = 0.6) {
      let m = this.balls.find((b) => !b.visible);
      if (!m) {
        if (this.balls.length > 16) return;
        const mat = new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color() }, uAlpha: { value: 1 }, uTime: { value: 0 } },
          vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
            void main(){ vP = position; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
          fragmentShader: `${NOISE_GLSL} uniform vec3 uColor; uniform float uAlpha; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
            void main(){ float f = abs(dot(normalize(vN), normalize(vV)));
              float n = vnoise(vP*3.0 + uTime*4.0);
              float a = (0.35 + pow(1.0-f, 2.0)*0.8 + n*0.35) * uAlpha;
              vec3 col = mix(uColor, vec3(1.0), pow(f, 4.0)*0.7 + n*0.2);
              gl_FragColor = vec4(col*a, a); }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.CustomBlending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneFactor,
        });
        m = new THREE.Mesh(this._sphereGeo, mat);
        m.renderOrder = 11;
        this.scene.add(m);
        this.balls.push(m);
      }
      m.material.uniforms.uColor.value.set(color);
      m.position.copy(pos);
      m.userData = { life, max: life, radius };
      m.scale.setScalar(radius * 0.2);
      m.visible = true;
      return m;
    }

    /**
     * A SWORD CUT: a thin blade of light from a to b, turned to face the camera round its own
     * length, fading as it goes (finishers, deflections, the arc behind a live swing). width in m.
     */
    slash(a, b, color = 0xffffff, life = 0.2, width = 0.06) {
      let m = this.slashes.find((x) => !x.visible);
      if (!m) {
        if (this.slashes.length > 48) return null;
        m = new THREE.Mesh(this._ringGeo, new THREE.MeshBasicMaterial({ map: SL.Toon.tex.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
        m.renderOrder = 13;
        m.frustumCulled = false;
        this.scene.add(m);
        this.slashes.push(m);
      }
      m.material.color.set(color);
      m.position.copy(a).lerp(b, 0.5);
      m.userData = { life, max: life, a: a.clone(), b: b.clone(), width, len: Math.max(0.05, a.distanceTo(b)) };
      m.scale.set(0.001, 0.001, 1);
      m.visible = true;
      return m;
    }

    light(pos, color, intensity, dist, life = 0.25) {
      let l = this.lights.find((x) => x.userData.life <= 0) || this.lights.reduce((a, b) => (a.userData.life < b.userData.life ? a : b));
      l.position.copy(pos);
      l.color.set(color);
      l.distance = dist;
      l.userData = { life, max: life, intensity };
      l.intensity = intensity;
    }

    bolt(start, length, color = 0xffffff) {
      let line = this.bolts.find((b) => !b.visible);
      if (!line) {
        if (this.bolts.length > 24) return;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 8), 3));
        line = new THREE.Line(geo, this._boltMat);
        line.frustumCulled = false;
        line.renderOrder = 14;
        this.scene.add(line);
        this.bolts.push(line);
      }
      const arr = line.geometry.attributes.position.array;
      let x = start.x, y = start.y, z = start.z;
      const dx = U.rand(-1, 1), dy = U.rand(-1, 1), dz = U.rand(-1, 1);
      const seg = length / 7;
      for (let i = 0; i < 8; i++) {
        arr[i * 3] = x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = z;
        x += (dx + U.rand(-1.2, 1.2)) * seg;
        y += (dy + U.rand(-1.2, 1.2)) * seg;
        z += (dz + U.rand(-1.2, 1.2)) * seg;
      }
      line.geometry.attributes.position.needsUpdate = true;
      line.userData = { life: 0.09 };
      line.visible = true;
    }

    rock(pos, vel, size, color = 0x8a6a4a) {
      let m = this.debris.find((d) => !d.visible);
      if (!m) {
        if (this.debris.length > Math.round(70 * this.pScale) + 10) return;
        m = new THREE.Mesh(U.pick(this._debrisGeo), SL.Toon.mat(color));
        m.castShadow = false;
        this.scene.add(m);
        this.debris.push(m);
      }
      m.material = SL.Toon.mat(color);
      m.position.copy(pos);
      m.scale.setScalar(size);
      m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      m.userData = { vel: vel.clone(), spin: new THREE.Vector3(U.rand(-8, 8), U.rand(-8, 8), U.rand(-8, 8)), life: U.rand(1.6, 2.6), size, gravity: this.stage && this.stage.def.type === 'space' ? 0 : 22 };
      m.visible = true;
    }

    /* ----- composite effects ----- */
    impact(pos, level, color = 0xffffff) {
      const lv = U.clamp(level, 1, 5);
      const n = Math.round([0, 8, 16, 26, 40, 60][lv] * this.pScale);
      const c = new THREE.Color(color);
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(4, 10) * (0.7 + lv * 0.35));
        this.add.emit(pos.x, pos.y, pos.z, v.x, v.y, v.z, c.r, c.g, c.b, 1, U.rand(0.05, 0.14) * (0.8 + lv * 0.2), U.rand(0.15, 0.35), { drag: 5 });
      }
      this.flash(pos, 0.9 + lv * 0.7, color, 0.08 + lv * 0.03);
      if (lv >= 2) this.ring(pos, 1 + lv * 0.9, color, 0.22 + lv * 0.05);
      if (lv >= 3) this.light(pos, color, 2 + lv, 12 + lv * 6, 0.2);
    }

    explosion(pos, radius, color = 0xffc060, opts = {}) {
      this.ball(pos, radius, color, opts.life || 0.55 + radius * 0.03);
      this.flash(pos, radius * 3.2, color, 0.3);
      this.flash(pos, radius * 1.6, 0xffffff, 0.15, SL.Toon.tex.glow);
      this.ring(pos, radius * 2.4, color, 0.5);
      this.light(pos, color, 1.6 + radius * 0.35, 14 + radius * 5, 0.4);
      const c = new THREE.Color(color);
      const n = Math.round((20 + radius * 10) * this.pScale);
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(6, 16) * (0.6 + radius * 0.25));
        this.add.emit(pos.x, pos.y, pos.z, v.x, v.y, v.z, c.r, c.g, c.b, 1, U.rand(0.1, 0.3) * (1 + radius * 0.1), U.rand(0.3, 0.7), { drag: 3 });
      }
      if (opts.smoke !== false) {
        const sn = Math.round((6 + radius * 3) * this.pScale);
        for (let i = 0; i < sn; i++) {
          const v = new THREE.Vector3(U.rand(-1, 1), U.rand(-0.2, 1), U.rand(-1, 1)).multiplyScalar(U.rand(1, 4) * (0.5 + radius * 0.2));
          const g = U.rand(0.25, 0.4);
          this.smoke.emit(pos.x + v.x * 0.3, pos.y + v.y * 0.3, pos.z + v.z * 0.3, v.x, v.y, v.z, g, g * 0.95, g * 0.9, 0.55, radius * U.rand(0.8, 1.6), U.rand(1.2, 2.2), { grow: 1.6, drag: 1.2 });
        }
      }
    }

    dust(pos, radius, count = 14, color = 0xb89a78) {
      const c = new THREE.Color(color);
      const n = Math.round(count * this.pScale);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = U.rand(3, 9) * (0.5 + radius * 0.15);
        this.smoke.emit(pos.x, pos.y + 0.2, pos.z, Math.cos(a) * sp, U.rand(0.5, 2.5), Math.sin(a) * sp, c.r, c.g, c.b, 0.6, radius * U.rand(0.5, 1), U.rand(0.8, 1.5), { grow: 1.8, drag: 2.5 });
      }
    }

    debrisBurst(pos, count, color, speed = 10, size = 0.25) {
      const n = Math.round(count * Math.max(0.4, this.pScale));
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3(U.rand(-1, 1), U.rand(0.3, 1.4), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(0.4, 1) * speed);
        this.rock(pos, v, size * U.rand(0.5, 1.4), color);
      }
    }

    trail(pos, color, size = 0.2, life = 0.25) {
      const c = new THREE.Color(color);
      this.add.emit(pos.x, pos.y, pos.z, 0, 0, 0, c.r, c.g, c.b, 0.8, size, life, {});
    }

    afterimage(pos, height, color = 0xbfe6ff) {
      const c = new THREE.Color(color);
      const n = Math.round(26 * this.pScale);
      for (let i = 0; i < n; i++) {
        const y = pos.y + Math.random() * height;
        this.add.emit(pos.x + U.rand(-0.3, 0.3), y, pos.z + U.rand(-0.3, 0.3), U.rand(-2, 2), U.rand(-1, 1), U.rand(-2, 2), c.r, c.g, c.b, 0.9, U.rand(0.1, 0.25), U.rand(0.15, 0.3), { drag: 4 });
      }
      this.flash(new THREE.Vector3(pos.x, pos.y + height * 0.5, pos.z), height * 1.1, color, 0.12, SL.Toon.tex.glow);
    }

    createAura(fighter) {
      const a = new Aura(this, fighter);
      this.auras.push(a);
      return a;
    }

    /**
     * Afterimage: a frozen, glowing copy of the model in its current pose.
     * Used for vanishes, Instant Transmission and high-speed strikes.
     */
    ghost(model, color = 0xbfe6ff, life = 0.32, opacity = 0.5) {
      if (this.level === 'low' && this.ghosts.length >= 2) return;
      if (this.ghosts.length >= 7) this._removeGhost(this.ghosts[0]);
      model.root.updateMatrixWorld(true);
      // skinned imported bodies bake their pose (a live clone would keep following the skeleton)
      const clone = model.ghostClone ? model.ghostClone() : model.root.clone(true);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      clone.traverse((o) => {
        if (o.isMesh) {
          if (o.userData.isOutline) o.visible = false;
          else o.material = mat;
          o.castShadow = false;
        }
      });
      const holder = new THREE.Group();
      model.root.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
      clone.position.set(0, 0, 0);
      clone.quaternion.identity();
      clone.scale.set(1, 1, 1);
      holder.add(clone);
      holder.renderOrder = 9;
      this.scene.add(holder);
      this.ghosts.push({ holder, mat, life, max: life, opacity, base: holder.scale.x });
    }

    _removeGhost(g) {
      this.scene.remove(g.holder);
      g.mat.dispose();
      g.holder.traverse((o) => o.userData.disposeGeometry && o.geometry.dispose());
      const i = this.ghosts.indexOf(g);
      if (i >= 0) this.ghosts.splice(i, 1);
    }

    /** Ki gathering: particles streaming into a point from a shell around it. */
    streamInward(center, radius, color, count = 4, size = 0.18, time = 0.45) {
      const c = new THREE.Color(color);
      const n = Math.max(1, Math.round(count * this.pScale));
      for (let i = 0; i < n; i++) {
        const dir = new THREE.Vector3(U.rand(-1, 1), U.rand(-0.6, 1), U.rand(-1, 1)).normalize();
        const start = center.clone().addScaledVector(dir, radius * U.rand(0.7, 1.1));
        const v = center.clone().sub(start).divideScalar(time);
        this.add.emit(start.x, start.y, start.z, v.x, v.y, v.z, c.r, c.g, c.b, 0.9, size * U.rand(0.6, 1.2), time, {});
      }
    }

    /** Short burst of bright sparks (tier-ups, impacts). */
    sparks(pos, color, count = 14, speed = 10, size = 0.12) {
      const c = new THREE.Color(color);
      const n = Math.round(count * this.pScale);
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(0.4, 1) * speed);
        this.add.emit(pos.x, pos.y, pos.z, v.x, v.y, v.z, c.r, c.g, c.b, 1, size * U.rand(0.6, 1.4), U.rand(0.18, 0.4), { drag: 4 });
      }
    }

    /** Sky lightning strike from above down to a point. */
    skyBolt(target, height = 30, color = 0xeaf6ff) {
      const segs = 7;
      for (let s = 0; s < segs; s++) {
        const t0 = s / segs;
        const p = new THREE.Vector3(target.x + U.rand(-2, 2) * (1 - t0), target.y + height * (1 - t0), target.z + U.rand(-2, 2) * (1 - t0));
        this.bolt(p, height / segs * 1.5, color);
      }
      this.flash(target, 6, color, 0.12, SL.Toon.tex.glow);
      this.light(target, color, 5, 40, 0.15);
    }

    createBeam(color, core, style) {
      return new BeamVisual(this, color, core, style);
    }

    update(dt, camera) {
      this.time += dt;
      const h = window.innerHeight * SL.Render.renderer.getPixelRatio();
      const scale = h / (2 * Math.tan((camera.fov * Math.PI) / 360));
      this.add.uniforms.uScale.value = scale;
      this.smoke.uniforms.uScale.value = scale;
      this.add.update(dt);
      this.smoke.update(dt);

      for (const s of this.flashes) {
        if (!s.visible) continue;
        const d = s.userData;
        d.life -= dt;
        if (d.life <= 0) { s.visible = false; continue; }
        const t = 1 - d.life / d.max;
        s.scale.setScalar(d.size * (0.6 + t * 0.6));
        s.material.opacity = 1 - t;
      }
      for (const r of this.rings) {
        if (!r.visible) continue;
        const d = r.userData;
        d.life -= dt;
        if (d.life <= 0) { r.visible = false; continue; }
        const t = 1 - d.life / d.max;
        r.scale.setScalar(d.radius * 2 * U.easeOutCubic(t) + 0.1);
        r.material.opacity = 1 - t;
        if (d.billboard) r.quaternion.copy(camera.quaternion);
      }
      for (const b of this.balls) {
        if (!b.visible) continue;
        const d = b.userData;
        d.life -= dt;
        if (d.life <= 0) { b.visible = false; continue; }
        const t = 1 - d.life / d.max;
        b.scale.setScalar(d.radius * (0.25 + U.easeOutCubic(t) * 0.95));
        b.material.uniforms.uAlpha.value = 1 - t * t;
        b.material.uniforms.uTime.value = this.time;
      }
      for (const l of this.lights) {
        const d = l.userData;
        if (d.life <= 0) { l.intensity = 0; continue; }
        d.life -= dt;
        l.intensity = Math.max(0, d.intensity * (d.life / d.max));
      }
      for (const b of this.bolts) {
        if (!b.visible) continue;
        b.userData.life -= dt;
        if (b.userData.life <= 0) b.visible = false;
      }
      for (const m of this.debris) {
        if (!m.visible) continue;
        const d = m.userData;
        d.life -= dt;
        if (d.life <= 0) { m.visible = false; continue; }
        d.vel.y -= d.gravity * dt;
        m.position.addScaledVector(d.vel, dt);
        m.rotation.x += d.spin.x * dt;
        m.rotation.y += d.spin.y * dt;
        if (this.stage && d.gravity > 0) {
          const gh = this.stage.heightAt(m.position.x, m.position.z);
          if (m.position.y < gh + d.size * 0.5) {
            m.position.y = gh + d.size * 0.5;
            d.vel.y = Math.abs(d.vel.y) * 0.3;
            d.vel.x *= 0.6;
            d.vel.z *= 0.6;
            d.spin.multiplyScalar(0.6);
          }
        }
        if (d.life < 0.4) m.scale.setScalar(d.size * (d.life / 0.4));
      }
      for (const s of this.slashes) {
        if (!s.visible) continue;
        const d = s.userData;
        d.life -= dt;
        if (d.life <= 0) {
          s.visible = false;
          continue;
        }
        const t = 1 - d.life / d.max;
        const ax = _sa.copy(d.b).sub(d.a).normalize();
        const view = _sv.copy(camera.position).sub(s.position);
        view.addScaledVector(ax, -view.dot(ax));
        if (view.lengthSq() < 1e-6) view.set(0, 1, 0);
        view.normalize();
        const ny = _sy.crossVectors(view, ax).normalize();
        _sm.makeBasis(ax, ny, view);
        s.quaternion.setFromRotationMatrix(_sm);
        s.scale.set(d.len * (0.92 + t * 0.16), d.width * 2.6 * (1 - t * 0.7), 1);
        s.material.opacity = (1 - t) * (1 - t);
      }
      for (const a of this.auras) a.update(dt);
      for (const g of this.ghosts.slice()) {
        g.life -= dt;
        if (g.life <= 0) {
          this._removeGhost(g);
          continue;
        }
        const t = 1 - g.life / g.max;
        g.mat.opacity = g.opacity * (1 - t) * (1 - t);
        g.holder.scale.setScalar(g.base * (1 + t * 0.06));
      }
    }

    dispose() {
      for (const g of this.ghosts.slice()) this._removeGhost(g);
      this.add.dispose();
      this.smoke.dispose();
      for (const a of this.auras) a.dispose();
      const all = [...this.flashes, ...this.rings, ...this.balls, ...this.bolts, ...this.debris, ...this.lights, ...this.slashes];
      for (const o of all) {
        if (o.parent) o.parent.remove(o);
        if (o.material && o.material !== this._boltMat && !SL.Toon.matCache.has(o.material)) {
          if (o.material.dispose && !this._isSharedMat(o.material)) o.material.dispose();
        }
        if (o.geometry && o.geometry.dispose && this.bolts.includes(o)) o.geometry.dispose();
      }
      this._sphereGeo.dispose();
      this._ringGeo.dispose();
      for (const g of this._debrisGeo) g.dispose();
      this._boltMat.dispose();
    }

    _isSharedMat(m) {
      for (const v of SL.Toon.matCache.values()) if (v === m) return true;
      return false;
    }
  }

  /* ---------------- screen overlays ---------------- */
  const ScreenFX = (SL.ScreenFX = {
    flashEl: null,
    vignetteEl: null,
    lines: null,
    ctx: null,
    flashValue: 0,
    speed: 0,
    speedTarget: 0,
    init() {
      this.flashEl = document.getElementById('flash');
      this.vignetteEl = document.getElementById('vignette');
      this.visionEl = document.getElementById('vision');
      this.lines = document.getElementById('speedlines');
      this.ctx = this.lines.getContext('2d');
      const resize = () => {
        this.lines.width = Math.round(window.innerWidth * 0.5);
        this.lines.height = Math.round(window.innerHeight * 0.5);
      };
      resize();
      window.addEventListener('resize', resize);
    },
    flash(amount, color = '#ffffff') {
      if (SL.Settings.data.accessibility.flashReduction) amount *= 0.25;
      this.flashValue = Math.max(this.flashValue, U.clamp01(amount));
      this.flashEl.style.background = color;
    },
    vignette(amount, color = 'rgba(160,0,0,0.9)') {
      this.vignetteEl.style.opacity = U.clamp01(amount);
      this.vignetteEl.style.setProperty('--vig', color);
    },
    /** Dream look for story visions: blurred, paler, softer frame with glowing edges. 0 turns it off. */
    vision(amount) {
      const a = U.clamp01(amount);
      if (this.visionEl) this.visionEl.style.opacity = a.toFixed(3);
      const c = SL.Render && SL.Render.canvas;
      if (c) c.style.filter = a > 0.01 ? 'blur(' + (a * 1.6).toFixed(2) + 'px) saturate(' + (1 - a * 0.55).toFixed(2) + ') brightness(' + (1 + a * 0.18).toFixed(2) + ') contrast(' + (1 - a * 0.12).toFixed(2) + ')' : '';
    },
    setSpeed(v) {
      this.speedTarget = SL.Settings.data.accessibility.speedLines ? U.clamp01(v) : 0;
    },
    /**
     * THE RED LINE (owner, 2026-10-01: Gohan's breaking point is not a red line drawn over his eyes):
     * the picture goes black except a band round his eyes, one crimson line is drawn across the whole
     * screen through his head, and it snaps in two like glass. Driven every frame by the scene:
     * s = { dark: 0..1, line: 0..1 (drawn left to right), snap: 0..1 (the break), y: 0..1 (screen height
     * of the line), band: 0..1 (height of the clear band) } — or null to take it away.
     */
    redLine(s) {
      let cv = this.redEl;
      if (!s) {
        if (cv) cv.style.opacity = 0;
        return;
      }
      if (!cv) {
        cv = this.redEl = document.createElement('canvas');
        cv.id = 'redline';
        cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;';
        (this.flashEl && this.flashEl.parentNode ? this.flashEl.parentNode : document.body).appendChild(cv);
      }
      cv.style.opacity = 1;
      const w = (cv.width = Math.round(window.innerWidth * 0.75)), h = (cv.height = Math.round(window.innerHeight * 0.75));
      const g = cv.getContext('2d');
      g.clearRect(0, 0, w, h);
      const y = (s.y === undefined ? 0.46 : s.y) * h;
      const band = (s.band === undefined ? 0.2 : s.band) * h;
      const dark = U.clamp01(s.dark || 0);
      if (dark > 0) {
        // black above and below a soft clear band round the eyes
        const grad = g.createLinearGradient(0, 0, 0, h);
        const a = (v) => 'rgba(0,0,0,' + (v * dark).toFixed(3) + ')';
        const top = Math.max(0, (y - band / 2) / h), bot = Math.min(1, (y + band / 2) / h);
        grad.addColorStop(0, a(1));
        grad.addColorStop(Math.max(0, top - 0.06), a(1));
        grad.addColorStop(top, a(0.25));
        grad.addColorStop((top + bot) / 2, a(0));
        grad.addColorStop(bot, a(0.25));
        grad.addColorStop(Math.min(1, bot + 0.06), a(1));
        grad.addColorStop(1, a(1));
        g.fillStyle = grad;
        g.fillRect(0, 0, w, h);
      }
      const line = U.clamp01(s.line || 0), snap = U.clamp01(s.snap || 0);
      if (line <= 0) return;
      const lw = Math.max(3, h * 0.012);
      g.lineCap = 'butt';
      g.shadowColor = 'rgba(255,40,60,0.9)';
      g.shadowBlur = h * 0.02;
      g.strokeStyle = '#e8102a';
      g.lineWidth = lw;
      if (snap <= 0) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w * line, y);
        g.stroke();
        return;
      }
      // the break: two halves recoiling from a gap in the middle, tilting, shards flying off it
      const gap = w * 0.02 + snap * w * 0.22, tilt = snap * 0.12, fall = snap * h * 0.04;
      for (const side of [-1, 1]) {
        g.save();
        g.translate(w / 2 + side * gap, y + fall);
        g.rotate(side * tilt);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(side * w, 0);
        g.stroke();
        g.restore();
      }
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,' + Math.round(60 + 140 * (1 - snap)) + ',' + Math.round(70 + 150 * (1 - snap)) + ',' + (1 - snap * 0.8).toFixed(3) + ')';
      for (let i = 0; i < 18; i++) {
        // fixed shard pattern (no Math.random in presentation)
        const ang = i * 2.39996 + 0.4, sp = 0.3 + ((i * 37) % 11) / 11;
        const r = snap * w * 0.18 * sp;
        const sx = w / 2 + Math.cos(ang) * r, sy = y + Math.sin(ang) * r * 0.55 + snap * snap * h * 0.1;
        const sz = lw * (1.6 - sp * 0.8);
        g.beginPath();
        g.moveTo(sx, sy - sz);
        g.lineTo(sx + sz * 0.8, sy + sz * 0.4);
        g.lineTo(sx - sz * 0.6, sy + sz * 0.7);
        g.fill();
      }
    },
    reset() {
      this.flashValue = 0;
      this.speedTarget = 0;
      this.speed = 0;
      this.vignette(0);
      this.vision(0);
      this.redLine(null);
      this.flashEl.style.opacity = 0;
      this.ctx.clearRect(0, 0, this.lines.width, this.lines.height);
    },
    update(dt) {
      this.flashValue = Math.max(0, this.flashValue - dt * 3.2);
      this.flashEl.style.opacity = this.flashValue.toFixed(3);
      this.speed = U.damp(this.speed, this.speedTarget, 8, dt);
      const g = this.ctx, w = this.lines.width, h = this.lines.height;
      g.clearRect(0, 0, w, h);
      if (this.speed < 0.02) return;
      const n = Math.round(46 * this.speed);
      g.strokeStyle = 'rgba(255,255,255,' + (0.35 * this.speed).toFixed(3) + ')';
      const cx = w / 2, cy = h / 2, maxR = Math.hypot(cx, cy);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const r0 = maxR * U.rand(0.45, 0.8);
        const r1 = r0 + maxR * U.rand(0.15, 0.4);
        g.lineWidth = U.rand(0.5, 2.2);
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.stroke();
      }
    },
  });

  SL.VFX = VFX;
  SL.Aura = Aura;
  SL.NOISE_GLSL = NOISE_GLSL;
})();
