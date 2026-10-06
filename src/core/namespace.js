/*
 * Saiyan Legacy — core namespace, math helpers and event bus.
 * Every module attaches itself to the global `SL` object. Load order is
 * defined in index.html (classic scripts, so the game runs from file://).
 */
(function () {
  'use strict';

  const SL = (window.SL = window.SL || {});
  SL.VERSION = '0.3.0-dev';
  SL.BUILD = 'Version 0.3 (in development) — Saiyan Saga';
  SL.TICK = 1 / 60;
  SL.DEG = Math.PI / 180;
  SL.data = SL.data || {
    characters: {},
    stages: {},
    missions: {},
    poses: {},
    hair: {},
    dialogue: {},
    unlocks: [],
  };

  const U = (SL.util = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
  U.remap = (v, a, b, c, d) => U.lerp(c, d, U.clamp01(U.invLerp(a, b, v)));
  /** Frame-rate independent exponential smoothing. */
  U.damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
  U.smooth = (t) => t * t * (3 - 2 * t);
  U.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  U.easeInCubic = (t) => t * t * t;
  U.easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  U.easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  U.rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.sign = (v) => (v < 0 ? -1 : 1);

  U.wrapAngle = (a) => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };
  U.dampAngle = (a, b, rate, dt) => a + U.wrapAngle(b - a) * (1 - Math.exp(-rate * dt));

  /** FNV-1a 32-bit hash, used for save checksums and seeds. */
  U.hash = (str) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  };

  /** Small deterministic PRNG. */
  U.mulberry32 = (seed) => {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Smooth 2D value noise + fractal sum, for terrain and textures. */
  U.makeNoise2D = (seed = 1) => {
    const rng = U.mulberry32(seed);
    const size = 256;
    const perm = new Uint8Array(size * 2);
    const vals = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      perm[i] = i;
      vals[i] = rng();
    }
    for (let i = size - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = perm[i];
      perm[i] = perm[j];
      perm[j] = t;
    }
    for (let i = 0; i < size; i++) perm[size + i] = perm[i];
    const v = (x, y) => vals[perm[(perm[x & 255] + y) & 255]];
    const noise = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = U.smooth(xf), w = U.smooth(yf);
      const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
      return U.lerp(U.lerp(a, b, u), U.lerp(c, d, u), w);
    };
    noise.fbm = (x, y, oct = 4) => {
      let sum = 0, amp = 0.5, f = 1, norm = 0;
      for (let i = 0; i < oct; i++) {
        sum += noise(x * f, y * f) * amp;
        norm += amp;
        amp *= 0.5;
        f *= 2;
      }
      return sum / norm;
    };
    return noise;
  };

  U.deepClone = (o) => JSON.parse(JSON.stringify(o));

  /** Recursively fills missing keys of `target` from `defaults` (in place). */
  U.fillDefaults = (target, defaults) => {
    for (const k of Object.keys(defaults)) {
      const dv = defaults[k];
      if (target[k] === undefined || target[k] === null) {
        target[k] = U.deepClone(dv);
      } else if (dv && typeof dv === 'object' && !Array.isArray(dv) && typeof target[k] === 'object') {
        U.fillDefaults(target[k], dv);
      }
    }
    return target;
  };

  U.getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  U.setPath = (obj, path, value) => {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (o[keys[i]] == null) o[keys[i]] = {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
  };

  U.fmtInt = (n) => Math.round(n).toLocaleString('en-US');

  /** Tiny DOM builder: U.el('div', {class:'x', onclick}, [children]) */
  U.el = (tag, props, children) => {
    const e = document.createElement(tag);
    if (props) {
      for (const k of Object.keys(props)) {
        const v = props[k];
        if (v === undefined || v === null) continue;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.assign(e.dataset, v);
        else e.setAttribute(k, v);
      }
    }
    if (children) {
      for (const c of [].concat(children)) {
        if (c === null || c === undefined || c === false) continue;
        e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return e;
  };

  /* ---------------- event bus ---------------- */
  const listeners = new Map();
  SL.events = {
    on(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
      return () => this.off(name, fn);
    },
    off(name, fn) {
      const s = listeners.get(name);
      if (s) s.delete(fn);
    },
    emit(name, payload) {
      const s = listeners.get(name);
      if (!s) return;
      for (const fn of Array.from(s)) {
        try {
          fn(payload);
        } catch (err) {
          console.error('[SL] listener error for', name, err);
        }
      }
    },
  };

  SL.log = (...a) => console.log('%c[SL]', 'color:#ff8a00', ...a);
  SL.warn = (...a) => console.warn('[SL]', ...a);
})();
