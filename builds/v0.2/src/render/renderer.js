/*
 * Renderer: WebGL setup, quality scaling and resize handling.
 */
(function () {
  'use strict';

  const SHADOW_SIZES = { off: 0, low: 1024, high: 2048, ultra: 4096 };
  const PARTICLE_SCALE = { low: 0.35, medium: 0.65, high: 1, ultra: 1.35 };
  const FAR = { near: 700, medium: 1400, far: 4000 };

  const Render = (SL.Render = {
    renderer: null,
    canvas: null,
    width: 1,
    height: 1,

    init(canvas) {
      this.canvas = canvas;
      this.create();
      window.addEventListener('resize', () => this.resize());
      SL.events.on('settings:changed', (e) => {
        if (!e.path.startsWith('graphics')) return;
        if (e.path === 'graphics.antialias' || e.path === 'graphics.preset' || e.path === 'graphics.*') {
          const want = SL.Settings.data.graphics.antialias;
          if (this._aa !== want) {
            this.rebuild();
            return;
          }
        }
        this.applyQuality();
      });
    },

    create() {
      const g = SL.Settings.data.graphics;
      this._aa = g.antialias;
      const r = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: g.antialias,
        powerPreference: 'high-performance',
        stencil: false,
      });
      r.outputEncoding = THREE.LinearEncoding; // hex colors display exactly as authored (anime palette)
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.setClearColor(0x05070f, 1);
      this.renderer = r;
      this.applyQuality();
    },

    /** WebGL anti-aliasing is fixed at context creation: swap in a fresh canvas. */
    rebuild() {
      const old = this.renderer;
      const fresh = this.canvas.cloneNode(false);
      this.canvas.parentNode.replaceChild(fresh, this.canvas);
      this.canvas = fresh;
      try {
        old.dispose();
        old.forceContextLoss();
      } catch (e) { /* ignore */ }
      this.create();
      SL.Toon.refreshAll();
      if (SL.Input) SL.Input.canvas = fresh;
      SL.events.emit('render:rebuilt', {});
    },

    applyQuality() {
      const g = SL.Settings.data.graphics;
      const r = this.renderer;
      const ratio = Math.min(window.devicePixelRatio || 1, g.pixelRatioCap) * g.resolutionScale;
      r.setPixelRatio(Math.max(0.35, ratio));
      const shadowsOn = g.shadows !== 'off';
      if (r.shadowMap.enabled !== shadowsOn) {
        r.shadowMap.enabled = shadowsOn;
        SL.Toon.refreshAll();
      }
      this.resize();
      SL.events.emit('render:quality', {});
    },

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setSize(this.width, this.height, false);
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      SL.events.emit('render:resize', { width: this.width, height: this.height });
    },

    shadowMapSize() {
      return SHADOW_SIZES[SL.Settings.data.graphics.shadows] || 0;
    },
    particleScale() {
      return PARTICLE_SCALE[SL.Settings.data.graphics.effects] || 1;
    },
    farDistance() {
      return FAR[SL.Settings.data.graphics.drawDistance] || 4000;
    },
    effectsLevel() {
      return SL.Settings.data.graphics.effects;
    },

    render(scene, camera) {
      this.renderer.render(scene, camera);
    },
  });
})();
