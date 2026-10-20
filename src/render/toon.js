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
    // the slimed skin's drips run down over time (rim.slime): one clock shared by every slimed material, set by the
    // models that wear it (Model.tick)
    slimeTime: { value: 0 },

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
      if (opts.map) m.map = opts.map;
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
        uMetal: { value: rim.metal || 0 },
      };
      m.userData.rim = { color: u.uRimColor.value, strength: u.uRimStrength, min: u.uRimMin, base: u.uRimStrength.value };
      // rim.metal: polished metal — a darker reflected band across the mid-angles and a hard highlight from above
      const metal = rim.metal
        ? `float slSpec = pow(saturate(dot(normalize(normal), normalize(vec3(-0.35, 0.8, 0.5)))), 14.0);
             float slBand = smoothstep(0.25, 0.4, 1.0 - slRimF) * (1.0 - smoothstep(0.55, 0.7, 1.0 - slRimF));
             outgoingLight = outgoingLight * (1.0 - 0.45 * uMetal * slBand) + vec3(0.95, 0.98, 1.0) * slSpec * uMetal;`
        : '';
      // rim.fur (0..1): a pelt (the Super Saiyan 4 fur) — short zigzag ink strokes scattered over the surface the way the
      // anime draws fur, in cells laid round the mesh's own Y axis at real size (so a scaled sphere and a capsule carry
      // strokes of one size). Fades out with distance, so it never shimmers.
      // rim.ribs (metres): a segmented limb (Hirudegarn's) — ink rings round the mesh's Y axis every `ribs`, each segment
      // shaded darker toward its lower edge.
      // rim.stripes = { every (metres), color }: cloth striped across the mesh's own Y axis (Android 18's shirt) — every
      // other band drawn in `color`, lit the same way as the cloth under it
      // rim.vee = { color, at, slope } (metres at the fighter's own size, from the mesh's centre): a V of another colour on
      // the front of the mesh — every fragment in front (z > 0) above the line y = at + |x| · slope (the Pride Troopers'
      // suit: black down from the collar on the red chest, the red coming to a point on the black belly); on a pelt
      // (rim.fur) the fur strokes stop at the V (Super Saiyan 4 Gogeta's bare chest)
      // rim.slime = { w, h, k } (metres; k the drips' light, + lighter / - darker): a bio-liquid skin (Bio-Broly's) — drips
      // running down from random heights in columns round the mesh's Y axis, each narrowing to its point, and a hard wet highlight;
      // the drips crawl down, each column at its own slow speed (Toon.slimeTime)
      const local = !!(rim.fur || rim.ribs || rim.stripes || rim.vee || rim.slime);
      if (rim.slime) Object.assign(u, { uSlimeW: { value: rim.slime.w || 0.06 }, uSlimeH: { value: rim.slime.h || 0.16 }, uSlimeK: { value: rim.slime.k === undefined ? -0.36 : rim.slime.k }, uSlimeT: Toon.slimeTime });
      const slime = rim.slime
        ? `float slDr = length(vSlFur.xz);
             float slDn = max(5.0, floor(6.2832 * slDr / uSlimeW));
             float slDu = (atan(vSlFur.z, vSlFur.x) / 6.2832 + 0.5) * slDn;
             float slDc = floor(slDu);
             float slDx = fract(slDu);
             float slDy = -vSlFur.y / uSlimeH + fract(sin(slDc * 12.9898 + slDn) * 43758.5453) * 3.0 - uSlimeT * (0.12 + 0.18 * fract(sin(slDc * 4.17 + slDn) * 1531.7));
             float slDv = fract(slDy);
             float slDh = fract(sin(floor(slDy) * 78.233 + slDc * 37.719) * 43758.5453);
             float slDw = (0.16 + 0.26 * slDh) * (1.0 - slDv * 0.9);
             float slDa = max(fwidth(slDx), 0.01);
             float slDk = (1.0 - smoothstep(slDw - slDa * 1.5, slDw, abs(slDx - 0.5))) * step(0.3, slDh);
             float slDf = 1.0 - smoothstep(9.0, 20.0, length(vViewPosition));
             outgoingLight *= 1.0 + uSlimeK * slDk * slDf;
             float slWet = pow(saturate(dot(normalize(normal), normalize(vec3(-0.3, 0.75, 0.6)))), 22.0);
             outgoingLight += vec3(0.85, 0.95, 0.6) * slWet * 0.55;`
        : '';
      if (rim.vee) Object.assign(u, { uVeeAt: { value: rim.vee.at || 0 }, uVeeSlope: { value: rim.vee.slope || 1 }, uVeeColor: { value: new THREE.Color(rim.vee.color) } });
      const vee = rim.vee
        ? `float slVd = vSlFur.y - uVeeAt - abs(vSlFur.x) * uVeeSlope;
             float slVa = max(fwidth(slVd), 0.0005);
             float slVb = smoothstep(-slVa, slVa, slVd) * smoothstep(-0.004, 0.004, vSlFur.z);
             outgoingLight = mix(outgoingLight, outgoingLight / max(diffuseColor.rgb, vec3(0.03)) * uVeeColor, slVb);`
        : '';
      if (rim.stripes) Object.assign(u, { uStripeEvery: { value: rim.stripes.every || 0.05 }, uStripeColor: { value: new THREE.Color(rim.stripes.color) } });
      const stripes = rim.stripes
        ? `float slSv = fract(-vSlFur.y / uStripeEvery);
             float slSa = max(fwidth(-vSlFur.y / uStripeEvery), 0.01);
             float slSb = smoothstep(0.5 - slSa, 0.5 + slSa, slSv) * (1.0 - smoothstep(1.0 - slSa, 1.0, slSv));
             outgoingLight = mix(outgoingLight, outgoingLight / max(diffuseColor.rgb, vec3(0.03)) * uStripeColor, slSb);`
        : '';
      if (local) m.extensions = { derivatives: true }; // fwidth on a WebGL1 fallback
      if (rim.ribs) u.uRibs = { value: rim.ribs };
      const ribs = rim.ribs
        ? `float slRv = fract(-vSlFur.y / uRibs);
             float slRa = max(fwidth(-vSlFur.y / uRibs), 0.01);
             float slRk = 1.0 - smoothstep(0.05, 0.05 + slRa * 1.5, min(slRv, 1.0 - slRv));
             float slRf = 1.0 - smoothstep(9.0, 20.0, length(vViewPosition));
             outgoingLight *= 1.0 - (0.45 * slRk + 0.16 * smoothstep(0.35, 0.95, slRv)) * slRf;`
        : '';
      if (rim.fur) {
        Object.assign(u, { uFur: { value: rim.fur }, uFurW: { value: rim.furW || 0.075 }, uFurH: { value: rim.furH || 0.095 } });
      }
      const fur = rim.fur
        ? `float slFr = length(vSlFur.xz);
             float slFn = max(4.0, floor(6.2832 * slFr / uFurW));
             float slFu = (atan(vSlFur.z, vSlFur.x) / 6.2832 + 0.5) * slFn;
             float slFc = floor(slFu);
             float slFx = fract(slFu);
             float slFw = -vSlFur.y / uFurH + fract(sin(slFc * 12.9898 + slFn) * 43758.5453) * 0.7;
             float slFv = fract(slFw);
             float slH = fract(sin(slFc * 78.233 + floor(slFw) * 37.719) * 43758.5453);
             float slSx = (slFx - 0.14 - 0.12 * slH) / 0.62;
             float slYc = 0.22 + 0.42 * fract(slH * 7.13) + 0.2 * abs(fract(slSx * 2.0) - 0.5) * 2.0;
             float slAa = max(fwidth(slFv), 0.015);
             float slInk = (1.0 - smoothstep(0.045, 0.045 + slAa * 1.5, abs(slFv - slYc))) * step(0.0, slSx) * step(slSx, 1.0) * step(0.3, slH);
             float slFade = uFur * (1.0 - smoothstep(9.0, 20.0, length(vViewPosition)))${rim.vee ? ' * (1.0 - slVb)' : ''};
             outgoingLight *= 1.0 - 0.38 * slInk * slFade;`
        : '';
      m.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, u);
        if (local) {
          shader.vertexShader = 'varying vec3 vSlFur;\n' + shader.vertexShader.replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\nvSlFur = position * vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));'
          );
        }
        shader.fragmentShader =
          'uniform vec3 uRimColor;\nuniform float uRimStrength;\nuniform float uRimMin;\nuniform float uMetal;\n' +
          (local ? 'varying vec3 vSlFur;\n' : '') +
          (rim.fur ? 'uniform float uFur;\nuniform float uFurW;\nuniform float uFurH;\n' : '') +
          (rim.ribs ? 'uniform float uRibs;\n' : '') +
          (rim.stripes ? 'uniform float uStripeEvery;\nuniform vec3 uStripeColor;\n' : '') +
          (rim.vee ? 'uniform float uVeeAt;\nuniform float uVeeSlope;\nuniform vec3 uVeeColor;\n' : '') +
          (rim.slime ? 'uniform float uSlimeW;\nuniform float uSlimeH;\nuniform float uSlimeK;\nuniform float uSlimeT;\n' : '') +
          shader.fragmentShader.replace(
            '#include <output_fragment>',
            `float slRimF = 1.0 - saturate(dot(normalize(normal), normalize(vViewPosition)));
             float slRim = smoothstep(uRimMin, uRimMin + 0.09, slRimF) * uRimStrength;
             outgoingLight += uRimColor * slRim * (0.45 + 0.55 * diffuseColor.rgb);
             ${metal}
             ${vee}
             ${fur}
             ${ribs}
             ${stripes}
             ${slime}
             #include <output_fragment>`
          );
      };
      m.customProgramCacheKey = () => (rim.metal ? 'sl-rim-metal' : 'sl-rim') + (rim.fur ? '-fur' : '') + (rim.ribs ? '-ribs' : '') + (rim.stripes ? '-stripes' : '') + (rim.vee ? '-vee' : '') + (rim.slime ? '-slime' : '');
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
      // a kanji mark in a ring; '界\n王' stacks two marks; a longer word ('BADMAN') is a print
      // with no ring; '@whis' is the Whis mark (drawn: a prototype approximation of the symbol)
      const word = text.length > 2 && text[0] !== '@' && !text.includes('\n');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(64, 64, 60, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = fg;
      if (!word) g.stroke();
      g.fillStyle = fg;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const font = (px) => 'bold ' + px + 'px "Yu Gothic", "MS Gothic", "Meiryo", sans-serif';
      if (text === '@capsule') {
        // the Capsule Corporation mark (a prototype approximation): the ring, the name in two lines
        g.lineWidth = 7;
        g.beginPath();
        g.arc(64, 64, 48, 0, Math.PI * 2);
        g.stroke();
        g.font = 'bold 22px "Arial Black", Arial, sans-serif';
        g.fillText('CAPSULE', 64, 56);
        g.font = 'bold 20px "Arial Black", Arial, sans-serif';
        g.fillText('CORP.', 64, 80);
      } else if (text === '@whis') {
        g.lineWidth = 9;
        g.beginPath();
        g.arc(64, 64, 38, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.arc(64, 44, 11, 0, Math.PI * 2);
        g.fill();
        g.fillRect(59, 54, 10, 38);
      } else if (text.includes('\n')) {
        const [a, b] = text.split('\n');
        g.font = font(46);
        g.fillText(a, 64, 42);
        g.fillText(b, 64, 90);
      } else {
        g.font = font(word ? Math.min(40, Math.floor(210 / text.length)) : text.length > 1 ? 52 : 78);
        g.fillText(text, 64, word ? 66 : 70);
      }
      const t = new THREE.CanvasTexture(c);
      this.tex[key] = t;
      return t;
    },

    /**
     * A rip in cloth (clothing damage): a jagged hole showing `fill` (skin, an undershirt),
     * a dark torn edge, and a few frayed threads of the `cloth` colour hanging into it. The
     * shape comes from `seed`, never from Math.random (presentation must not touch the
     * gameplay random stream), so each rip on a costume keeps its own shape.
     */
    ripTexture(fill, cloth, seed = 1) {
      const key = 'rip|' + fill + '|' + cloth + '|' + seed;
      if (this.tex[key]) return this.tex[key];
      const rng = SL.util.mulberry32(seed * 7919 + 13);
      const hex = (c) => '#' + ('000000' + (c >>> 0).toString(16)).slice(-6);
      const t = this.canvasTexture(64, 64, (g) => {
        g.clearRect(0, 0, 64, 64);
        const pts = [];
        const n = 13;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const r = (i % 2 ? 17 : 27) + rng() * 6;
          pts.push([32 + Math.cos(a) * r, 32 + Math.sin(a) * r * 0.82]);
        }
        const path = () => {
          g.beginPath();
          pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
        };
        path();
        g.fillStyle = hex(fill);
        g.fill();
        g.lineWidth = 3.5;
        g.strokeStyle = 'rgba(30,18,16,0.95)';
        g.stroke();
        // frayed threads of the cloth hanging into the hole
        g.fillStyle = hex(cloth);
        for (let k = 0; k < 5; k++) {
          const [x, y] = pts[Math.floor(rng() * n)];
          const dx = (32 - x) * (0.25 + rng() * 0.2), dy = (32 - y) * (0.25 + rng() * 0.2);
          g.beginPath();
          g.moveTo(x - 2.5, y);
          g.lineTo(x + 2.5, y);
          g.lineTo(x + dx, y + dy);
          g.closePath();
          g.fill();
        }
      });
      this.tex[key] = t;
      return t;
    },

    /** Majin Buu's wound: a dark hole with a raw pink rim (no cloth: it is his body). */
    woundTexture() {
      const key = 'wound|buu';
      if (this.tex[key]) return this.tex[key];
      const rng = SL.util.mulberry32(4242);
      const t = this.canvasTexture(64, 64, (g) => {
        g.clearRect(0, 0, 64, 64);
        g.beginPath();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2, r = 25 + rng() * 5;
          const x = 32 + Math.cos(a) * r, y = 32 + Math.sin(a) * r * 0.85;
          if (i) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.closePath();
        g.fillStyle = '#e8709c';
        g.fill();
        g.beginPath();
        g.ellipse(32, 32, 17, 14, 0, 0, Math.PI * 2);
        g.fillStyle = '#3a0a24';
        g.fill();
        g.beginPath();
        g.ellipse(32, 32, 9, 7, 0, 0, Math.PI * 2);
        g.fillStyle = '#12020a';
        g.fill();
      });
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
