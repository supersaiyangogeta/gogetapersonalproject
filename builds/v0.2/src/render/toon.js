/*
 * Toon rendering helpers: cel-shading ramp, cached materials, ink outlines
 * (inverted hull), and generated textures for glows, smoke and emblems.
 */
(function () {
  'use strict';

  const Toon = (SL.Toon = {
    gradient3: null,
    matCache: new Map(),
    outlineCache: new Map(),
    tex: {},

    init() {
      this.gradient3 = makeGradient([138, 200, 255]);
      this.tex.glow = radialTexture(128, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.85)'], [0.6, 'rgba(255,255,255,0.22)'], [1, 'rgba(255,255,255,0)']]);
      this.tex.soft = radialTexture(64, [[0, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]);
      this.tex.smoke = smokeTexture(128);
      this.tex.flare = flareTexture(256);
      this.tex.ring = ringTexture(256);
    },

    /** Shared cel material. Use modelMat() for per-model instances that flash. */
    mat(color, opts = {}) {
      const key = color + '|' + (opts.emissive || 0) + '|' + (opts.transparent ? opts.opacity : 1) + '|' + (opts.side || 0);
      let m = this.matCache.get(key);
      if (!m) {
        m = this.makeMat(color, opts);
        this.matCache.set(key, m);
      }
      return m;
    },

    makeMat(color, opts = {}) {
      const m = new THREE.MeshToonMaterial({
        color,
        gradientMap: this.gradient3,
        emissive: opts.emissive || 0x000000,
        transparent: !!opts.transparent,
        opacity: opts.opacity === undefined ? 1 : opts.opacity,
        side: opts.side || THREE.FrontSide,
      });
      if (opts.vertexColors) m.vertexColors = true;
      if (opts.rim) this.addRim(m, opts.rim);
      return m;
    },

    /**
     * Anime-style rim light: a crisp bright edge on the silhouette. The rim
     * color follows the character's aura, so ki visibly lights the fighter.
     * uniforms live in m.userData.rim = { color, strength, min }.
     */
    addRim(m, rim = {}) {
      const u = {
        uRimColor: { value: new THREE.Color(rim.color !== undefined ? rim.color : 0xfff4e6) },
        uRimStrength: { value: rim.strength !== undefined ? rim.strength : 0.28 },
        uRimMin: { value: rim.min !== undefined ? rim.min : 0.72 },
      };
      m.userData.rim = { color: u.uRimColor.value, strength: u.uRimStrength, min: u.uRimMin, base: u.uRimStrength.value };
      m.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, u);
        shader.fragmentShader =
          'uniform vec3 uRimColor;\nuniform float uRimStrength;\nuniform float uRimMin;\n' +
          shader.fragmentShader.replace(
            '#include <output_fragment>',
            `float slRimF = 1.0 - saturate(dot(normalize(normal), normalize(vViewPosition)));
             float slRim = smoothstep(uRimMin, uRimMin + 0.09, slRimF) * uRimStrength;
             outgoingLight += uRimColor * slRim * (0.45 + 0.55 * diffuseColor.rgb);
             #include <output_fragment>`
          );
      };
      m.customProgramCacheKey = () => 'sl-rim';
      return m;
    },

    /** Ink outline material: expands along view-space normals, so line width stays readable. */
    outlineMat(color = 0x0b0b12, thickness = 1) {
      const key = color + '|' + thickness;
      let m = this.outlineCache.get(key);
      if (!m) {
        m = new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(color) }, uWidth: { value: thickness } },
          vertexShader: `
            uniform float uWidth;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vec3 n = normalize(normalMatrix * normal);
              float w = (0.0045 + 0.0016 * -mv.z) * uWidth;
              mv.xyz += n * w;
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            uniform vec3 uColor;
            void main() { gl_FragColor = vec4(uColor, 1.0); }`,
          side: THREE.BackSide,
        });
        this.outlineCache.set(key, m);
      }
      return m;
    },

    addOutline(mesh, thickness = 1, color) {
      const o = new THREE.Mesh(mesh.geometry, this.outlineMat(color, thickness));
      o.name = 'outline';
      o.userData.isOutline = true;
      mesh.add(o);
      return o;
    },

    /** Circular emblem with a kanji/symbol, e.g. the gi symbol. */
    emblemTexture(text, fg = '#111111', bg = '#ffffff') {
      const key = 'emblem|' + text + fg + bg;
      if (this.tex[key]) return this.tex[key];
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(64, 64, 60, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = fg;
      g.stroke();
      g.fillStyle = fg;
      g.font = 'bold 78px "Yu Gothic", "MS Gothic", "Meiryo", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text, 64, 70);
      const t = new THREE.CanvasTexture(c);
      this.tex[key] = t;
      return t;
    },

    canvasTexture(w, h, draw) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      return t;
    },

    /** Forces shader recompilation after shadow settings change. */
    refreshAll() {
      for (const m of this.matCache.values()) m.needsUpdate = true;
    },
  });

  function makeGradient(levels) {
    const data = new Uint8Array(levels.length * 4);
    levels.forEach((v, i) => {
      data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
      data[i * 4 + 3] = 255;
    });
    const t = new THREE.DataTexture(data, levels.length, 1, THREE.RGBAFormat);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }

  function radialTexture(size, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [o, col] of stops) grd.addColorStop(o, col);
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function smokeTexture(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    for (let i = 0; i < 26; i++) {
      const x = size / 2 + (Math.random() - 0.5) * size * 0.45;
      const y = size / 2 + (Math.random() - 0.5) * size * 0.45;
      const r = size * (0.12 + Math.random() * 0.2);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,0.35)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(c);
  }

  function flareTexture(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const h = size / 2;
    const grd = g.createRadialGradient(h, h, 0, h, h, h);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.12, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.18)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.random() * 0.2;
      const len = h * (i % 2 ? 0.55 : 0.95);
      const w = size * (i % 2 ? 0.012 : 0.02);
      g.save();
      g.translate(h, h);
      g.rotate(a);
      const lg = g.createLinearGradient(0, 0, len, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0.9)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg;
      g.beginPath();
      g.moveTo(0, -w);
      g.lineTo(len, 0);
      g.lineTo(0, w);
      g.fill();
      g.restore();
    }
    return new THREE.CanvasTexture(c);
  }

  function ringTexture(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const h = size / 2;
    const grd = g.createRadialGradient(h, h, h * 0.55, h, h, h);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.8, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }
})();
