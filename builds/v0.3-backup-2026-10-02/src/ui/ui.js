/*
 * UI framework: screen stack with keyboard / gamepad / mouse focus
 * navigation, reusable rows (choice, slider, toggle), icons, button glyphs,
 * generated character portraits, subtitles and toast notifications.
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;

  /* ---------------- icons ---------------- */
  const ICONS = {
    fist: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M7 4h3v6H7zM10.5 3h3v7h-3zM14 4h3v6h-3zM5 9h13a2 2 0 0 1 2 2v3a7 7 0 0 1-7 7h-2a6 6 0 0 1-6-6z"/></svg>',
    beam: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="6" cy="12" r="4" fill="#bff0ff"/><rect x="8" y="9.5" width="15" height="5" rx="2.5" fill="#37c8ff"/><rect x="8" y="11" width="15" height="2" fill="#fff"/></svg>',
    teleport: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="#bfe6ff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>',
    ball: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#7fc6ff"/><circle cx="10" cy="10" r="3.5" fill="#fff" opacity=".9"/></svg>',
    javelin: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 21 20 4" stroke="#8fe0ff" stroke-width="3.5" stroke-linecap="round"/><path d="M20 4l-6 1.5L18.5 10z" fill="#fff"/></svg>',
    rush: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M2 8h9M4 12h9M2 16h9" stroke="#ffd35a" stroke-width="2" stroke-linecap="round"/><path d="M13 5h4l5 7-5 7h-4l5-7z" fill="#ff8a1c"/></svg>',
    bomb: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="13" r="9" fill="#74d6ff"/><circle cx="9.5" cy="10" r="3.5" fill="#fff" opacity=".85"/><path d="M12 1v3M4 4l2 2M20 4l-2 2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
    ultimate: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 1l2.8 7.2L22 9l-5.6 4.8L18 21l-6-3.8L6 21l1.6-7.2L2 9l7.2-.8z" fill="#ffd84a" stroke="#ff8a1c" stroke-width="1"/></svg>',
    transform: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2c2 4 6 5 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 1 4 3 4-1-3 0-6 0-8z" fill="#ffcf2a" stroke="#ff8a1c" stroke-width="1.2"/></svg>',
    pod: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="9" fill="#e9e6de" stroke="#ff3048" stroke-width="2"/><circle cx="12" cy="11" r="4" fill="#ff3048"/></svg>',
    skull: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#ff8a7a" d="M12 2a9 9 0 0 0-9 9c0 3 1.5 5 3 6v3h3v-2h2v2h2v-2h2v2h3v-3c1.5-1 3-3 3-6a9 9 0 0 0-9-9zm-3.5 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" fill="none" stroke="#ffd84a" stroke-width="2"/><path d="M12 7v5l3 2" stroke="#ffd84a" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
    target: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="8" fill="none" stroke="#ff6a5a" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#ff6a5a"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="5" y="10" width="14" height="11" rx="2" fill="#aab"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#aab" stroke-width="2.4" fill="none"/></svg>',
    guard: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#9fdcff"/></svg>',
    fruit: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="14" r="7.5" fill="#e8402a"/><path d="M12 7c0-3 2-4 4-4-1 2-2 3-4 4z" fill="#5ab84a"/><circle cx="9.5" cy="11.5" r="2" fill="#fff" opacity=".6"/></svg>',
    run: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="15" cy="4" r="2.5" fill="#ffd35a"/><path d="M13 8l-4 4 3 2-2 7M13 8l3 4 4 1M9 12l-5 1" stroke="#ffd35a" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3v14M5 11l7 8 7-8" stroke="#bfe6ff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',
    fly: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21V9M6 14l6-7 6 7" stroke="#bfe6ff" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M4 22h16" stroke="#bfe6ff" stroke-width="1.6" opacity=".5"/></svg>',
    dodge: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="8" cy="12" r="4" fill="#bfe6ff" opacity=".35"/><circle cx="16" cy="12" r="4" fill="#bfe6ff"/><path d="M3 5l3 2M3 19l3-2" stroke="#bfe6ff" stroke-width="1.6"/></svg>',
    dino: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 15c2-6 8-8 13-7l4-3 1 4-2 2c1 3 0 6-3 8l-1 3h-2l1-3H9l-1 3H6l1-4c-2 0-3-1-4-3z" fill="#9ab84a"/><circle cx="18" cy="8" r="1" fill="#222"/></svg>',
    potential: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2l2.4 6 6.4-1.4-4.2 5 4.2 5-6.4-1.4L12 22l-2.4-6.8-6.4 1.4 4.2-5-4.2-5 6.4 1.4z" fill="#e8c8ff" stroke="#fff" stroke-width=".8"/></svg>',
    // wardrobe
    outfit: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 3l4 3 4-3 5 3-2 5-2-1v11H7V10l-2 1-2-5z" fill="#ff9a2a"/><path d="M9 3l3 5 3-5" fill="#2a4aa8"/><rect x="7" y="13" width="10" height="2" fill="#2a4aa8"/></svg>',
    emblem: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="9" fill="#fff" stroke="#222" stroke-width="1.6"/><path d="M8 9h8M12 7v10M8 13h8M9 17h6" stroke="#222" stroke-width="1.8"/></svg>',
    scouter: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="3" y="7" width="4" height="11" rx="1" fill="#ddd"/><path d="M7 9h8" stroke="#ddd" stroke-width="2"/><rect x="13" y="7" width="8" height="6" rx="1" fill="#ff4a4a" opacity=".85"/></svg>',
    tail: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 18c4 2 9 1 11-3s-1-7 2-9 4 1 3 3" stroke="#a0643a" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>',
    hair: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 16l2-8 3 4 1-9 3 7 3-6 1 8 3-3-1 8z" fill="#ffd33a"/></svg>',
    palette: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3a9 9 0 1 0 0 18c1.6 0 2-1.2 1.2-2.2-.8-1-.2-2.3 1.2-2.3H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z" fill="#e8dcc8"/><circle cx="7.5" cy="11" r="1.6" fill="#ff8a1c"/><circle cx="10" cy="7" r="1.6" fill="#2a6ae8"/><circle cx="15" cy="7" r="1.6" fill="#2fb3b0"/></svg>',
    view: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" fill="none" stroke="#bfe6ff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#bfe6ff"/></svg>',
    pose: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="4" r="2.4" fill="#ffd35a"/><path d="M5 9l7 2 7-2M12 11v5l-4 6M12 16l4 6" stroke="#ffd35a" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
    wear: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 4h14v16H5z" fill="#ff9a2a"/><path d="M9 4l3 6-3 4 3 6M15 4l-2 5 3 3-2 8" stroke="#1a0e08" stroke-width="1.8" fill="none"/></svg>',
  };
  SL.icon = (name) => ICONS[name] || ICONS.target;

  /* ---------------- button glyphs ---------------- */
  function padGlyph(label) {
    if (label.includes('+')) return label.split('+').map(padGlyph).join('<span style="margin:0 2px">+</span>');
    const cls = ['A', 'B', 'X', 'Y'].includes(label) ? 'kbd pad ' + label : 'kbd pad long';
    return '<span class="' + cls + '">' + label + '</span>';
  }
  SL.glyph = function (action, device) {
    const I = SL.Input;
    const dev = device || (I.lastDevice === 'gamepad' && I.gp.connected ? 'gamepad' : 'keyboard');
    const list = SL.Settings.data.controls[dev][action] || [];
    if (!list.length) return '<span class="kbd">—</span>';
    if (dev === 'gamepad') return padGlyph(I.padLabel(list[0]));
    return '<span class="kbd">' + I.keyLabel(list[0]) + '</span>';
  };
  SL.menuGlyph = function (kind) {
    const pad = SL.Input.lastDevice === 'gamepad' && SL.Input.gp.connected;
    if (kind === 'confirm') return pad ? padGlyph('A') : '<span class="kbd">Enter</span>';
    if (kind === 'back') return pad ? padGlyph('B') : '<span class="kbd">Esc</span>';
    if (kind === 'tabs') return pad ? padGlyph('LB') + ' ' + padGlyph('RB') : '<span class="kbd">Q</span> <span class="kbd">E</span>';
    if (kind === 'tabL') return pad ? padGlyph('LB') : '<span class="kbd">Q</span>';
    if (kind === 'tabR') return pad ? padGlyph('RB') : '<span class="kbd">E</span>';
    if (kind === 'adjust') return pad ? padGlyph('D-Left') + padGlyph('D-Right') : '<span class="kbd">←</span><span class="kbd">→</span>';
    return '';
  };

  /* ---------------- portraits ---------------- */
  const Portraits = (SL.Portraits = {
    cache: {},
    renderer: null,
    /** A head portrait; `sel` (a fighter's wardrobe selection) draws the look that fighter wears. */
    get(charId, formIndex = 0, sel) {
      const key = charId + ':' + formIndex + (sel ? ':' + JSON.stringify(sel) : '');
      if (this.cache[key]) return this.cache[key];
      try {
        this.cache[key] = this._render(charId, formIndex, sel && SL.Wardrobe ? { def: SL.Wardrobe.modelDef(SL.data.characters[charId], sel) } : {});
      } catch (e) {
        SL.warn('portrait failed', charId, e);
        this.cache[key] = '';
      }
      return this.cache[key];
    },
    /** A full-body thumbnail of a character in a wardrobe selection (Customization screen). */
    outfit(charId, sel) {
      const key = 'outfit:' + charId + ':' + JSON.stringify(sel);
      if (this.cache[key] !== undefined) return this.cache[key];
      try {
        this.cache[key] = this._render(charId, 0, { def: SL.Wardrobe.modelDef(SL.data.characters[charId], sel), body: true });
      } catch (e) {
        SL.warn('outfit thumbnail failed', charId, e);
        this.cache[key] = '';
      }
      return this.cache[key];
    },
    _render(charId, formIndex, o = {}) {
      const def = o.def || SL.data.characters[charId];
      if (!this.renderer) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer.setSize(256, 256);
        this.renderer.setPixelRatio(1);
        this.renderer.outputEncoding = THREE.LinearEncoding;
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x5a4a3a, 0.8));
        const key = new THREE.DirectionalLight(0xffffff, 0.8);
        key.position.set(1.5, 2, 3);
        this.scene.add(key);
        this.camera = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
      }
      const model = SL.ModelBuilder.build(def);
      model.setOutlines(true);
      if (def.forms && def.forms[formIndex]) model.setForm(def.forms[formIndex]);
      const poses = Object.assign({}, SL.data.poses, def.poses || {});
      const anim = new SL.Animator(model, poses);
      anim.play('stand', 10);
      anim.snap();
      anim.breathe = 0;
      anim.update(0);
      model.setExpression(def.intro && def.intro.expression ? def.intro.expression : 'neutral');
      this.scene.add(model.root);
      model.root.rotation.y = -0.35;
      model.root.updateMatrixWorld(true);
      const head = new THREE.Vector3();
      model.headCenter.getWorldPosition(head);
      const s = def.appearance.height || 1;
      if (o.body) {
        // the whole figure, feet to hair, turned a little so the outfit reads in depth
        model.root.rotation.y = -0.45;
        this.camera.position.set(0.9 * s, 1.0 * s, 4.1 * s);
        this.camera.lookAt(0, 0.93 * s, 0);
      } else {
        this.camera.position.set(head.x + 0.34 * s, head.y + 0.02 * s, head.z + 1.18 * s);
        this.camera.lookAt(head.x, head.y - 0.04 * s, head.z);
      }
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.render(this.scene, this.camera);
      const url = this.renderer.domElement.toDataURL('image/png');
      this.scene.remove(model.root);
      model.dispose();
      return url;
    },
    generateAll() {
      for (const c of Object.values(SL.data.characters)) {
        if (c.cinematicOnly) continue;
        (c.forms || [{}]).forEach((f, i) => this.get(c.id, i));
      }
    },
    release() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer = null;
      }
    },
  });

  /* ---------------- screens ---------------- */
  class Screen {
    constructor(cls) {
      this.el = el('div', { class: 'screen ' + (cls || '') });
      this.items = [];
      this.index = 0;
      this.modal = false;
      this.alive = true;
    }

    addItem(node, h = {}) {
      const item = { node, ...h };
      const idx = this.items.length;
      this.items.push(item);
      node.addEventListener('mouseenter', () => {
        if (!item.disabled) this.focus(this.items.indexOf(item));
      });
      node.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.classList && t.classList.contains('arrow')) {
          this.focus(this.items.indexOf(item), true);
          if (t.dataset.dir === 'l' && item.onLeft) item.onLeft();
          if (t.dataset.dir === 'r' && item.onRight) item.onRight();
          SL.Audio.play('uiMove');
          return;
        }
        if (item.disabled) {
          SL.Audio.play('uiError');
          return;
        }
        this.focus(this.items.indexOf(item), true);
        this._select(item);
      });
      if (idx === this.index) node.classList.add('focused');
      return item;
    }

    focus(i, silent) {
      if (i < 0 || i >= this.items.length) return;
      if (i !== this.index && !silent) SL.Audio.play('uiMove');
      const prev = this.items[this.index];
      if (prev) prev.node.classList.remove('focused');
      this.index = i;
      const it = this.items[i];
      it.node.classList.add('focused');
      if (it.node.scrollIntoView) it.node.scrollIntoView({ block: 'nearest' });
      if (it.onFocus) it.onFocus();
    }

    _select(item) {
      if (item.onSelect) {
        SL.Audio.play(item.sound || 'uiSelect');
        item.onSelect();
      } else if (item.onRight) {
        item.onRight();
        SL.Audio.play('uiMove');
      }
    }

    _move(delta) {
      const n = this.items.length;
      if (!n) return;
      const cur = this.items[this.index];
      if (cur && cur.grid) {
        const cands = this.items.filter((it) => it.grid && !it.disabled && it.grid.c === cur.grid.c && Math.sign(it.grid.r - cur.grid.r) === delta);
        if (cands.length) {
          cands.sort((a, b) => Math.abs(a.grid.r - cur.grid.r) - Math.abs(b.grid.r - cur.grid.r));
          this.focus(this.items.indexOf(cands[0]));
          return;
        }
      }
      let i = this.index;
      for (let k = 0; k < n; k++) {
        i = (i + delta + n) % n;
        const it = this.items[i];
        const sameGridRow = cur && cur.grid && it.grid && it.grid.r === cur.grid.r;
        if (!it.disabled && !it.skipNav && !sameGridRow) break;
      }
      this.focus(i);
    }

    handleNav(nav) {
      if (nav.up) this._move(-1);
      if (nav.down) this._move(1);
      const it = this.items[this.index];
      if (nav.left) {
        if (it && it.grid) {
          const c = this.items.find((x) => x.grid && x.grid.r === it.grid.r && x.grid.c === it.grid.c - 1);
          if (c) this.focus(this.items.indexOf(c));
        } else if (it && it.onLeft && !it.disabled) {
          it.onLeft();
          SL.Audio.play('uiMove');
        }
      }
      if (nav.right) {
        if (it && it.grid) {
          const c = this.items.find((x) => x.grid && x.grid.r === it.grid.r && x.grid.c === it.grid.c + 1);
          if (c) this.focus(this.items.indexOf(c));
        } else if (it && it.onRight && !it.disabled) {
          it.onRight();
          SL.Audio.play('uiMove');
        }
      }
      if (nav.confirm && it) {
        if (it.disabled) SL.Audio.play('uiError');
        else this._select(it);
      }
      if (nav.back && this.onBack) {
        SL.Audio.play('uiBack');
        this.onBack();
      }
      if (nav.tabL && this.onTab) this.onTab(-1);
      if (nav.tabR && this.onTab) this.onTab(1);
    }

    clearItems() {
      this.items = [];
      this.index = 0;
    }
  }
  SL.Screen = Screen;

  const UI = (SL.UI = {
    root: null,
    stack: [],

    init() {
      this.root = document.getElementById('screens');
      this.applyStyleSettings();
      SL.events.on('settings:changed', (e) => {
        if (e.path.startsWith('hud') || e.path.startsWith('accessibility') || e.path.endsWith('*')) this.applyStyleSettings();
      });
      SL.events.on('input:device', () => this.refreshGlyphs());
    },

    applyStyleSettings() {
      const s = SL.Settings.data;
      const r = document.documentElement.style;
      r.setProperty('--hud-scale', s.hud.scale);
      r.setProperty('--hud-opacity', s.hud.opacity);
      r.setProperty('--sub-size', { s: '17px', m: '22px', l: '28px', xl: '36px' }[s.accessibility.subtitleSize] || '22px');
      r.setProperty('--sub-bg', s.accessibility.subtitleBg);
      document.body.classList.toggle('high-contrast', !!s.accessibility.highContrast);
      document.body.classList.toggle('cb-protan', s.accessibility.colorblind === 'protan');
      document.body.classList.toggle('cb-tritan', s.accessibility.colorblind === 'tritan');
      document.getElementById('fps').hidden = !s.graphics.showFps;
    },

    refreshGlyphs() {
      for (const s of this.stack) if (s.refreshGlyphs) s.refreshGlyphs();
      if (SL.HUD && SL.HUD.refreshGlyphs) SL.HUD.refreshGlyphs();
    },

    top() {
      return this.stack[this.stack.length - 1] || null;
    },

    push(screen) {
      const prev = this.top();
      if (prev && !screen.modal) prev.el.style.display = 'none';
      this.stack.push(screen);
      this.root.appendChild(screen.el);
      requestAnimationFrame(() => requestAnimationFrame(() => screen.el.classList.add('show')));
      if (screen.onShow) screen.onShow();
      return screen;
    },

    pop() {
      const s = this.stack.pop();
      if (!s) return;
      s.alive = false;
      if (s.onHide) s.onHide();
      s.el.classList.remove('show');
      setTimeout(() => s.el.remove(), 260);
      const prev = this.top();
      if (prev) {
        prev.el.style.display = '';
        if (prev.onReturn) prev.onReturn();
      }
    },

    replace(screen) {
      const s = this.stack.pop();
      if (s) {
        s.alive = false;
        if (s.onHide) s.onHide();
        s.el.remove();
      }
      return this.push(screen);
    },

    clear() {
      while (this.stack.length) {
        const s = this.stack.pop();
        s.alive = false;
        if (s.onHide) s.onHide();
        s.el.remove();
      }
    },

    update(dt, nav) {
      const s = this.top();
      if (!s) return;
      if (nav) s.handleNav(nav);
      if (s.onUpdate) s.onUpdate(dt);
    },

    /* ---------- row widgets ---------- */
    choiceRow(screen, o) {
      const valEl = el('span', { class: 'choice' });
      const node = el('div', { class: 'row' }, [
        el('div', null, [el('div', { class: 'lbl', text: o.label }), o.desc ? el('div', { class: 'desc', text: o.desc }) : null]),
        el('div', { class: 'val' }, [el('span', { class: 'arrow', text: '◀', 'data-dir': 'l' }), valEl, el('span', { class: 'arrow', text: '▶', 'data-dir': 'r' })]),
      ]);
      const opts = () => (typeof o.options === 'function' ? o.options() : o.options);
      const render = () => {
        const cur = o.get();
        const found = opts().find((x) => x[0] === cur);
        valEl.textContent = found ? found[1] : String(cur);
        if (o.onRender) o.onRender(cur);
      };
      const step = (d) => {
        const list = opts().filter((x) => !x[2]);
        let i = list.findIndex((x) => x[0] === o.get());
        i = (i + d + list.length) % list.length;
        o.set(list[i][0]);
        render();
      };
      render();
      const item = screen.addItem(node, { onLeft: () => step(-1), onRight: () => step(1), onSelect: o.onSelect, onFocus: o.onFocus });
      item.render = render;
      item.sound = 'uiMove';
      return item;
    },

    sliderRow(screen, o) {
      const fill = el('i'), knob = el('b'), num = el('span', { class: 'num' });
      const bar = el('div', { class: 'slider' }, [fill, knob]);
      const node = el('div', { class: 'row' }, [
        el('div', null, [el('div', { class: 'lbl', text: o.label }), o.desc ? el('div', { class: 'desc', text: o.desc }) : null]),
        el('div', { class: 'val' }, [el('span', { class: 'arrow', text: '◀', 'data-dir': 'l' }), bar, el('span', { class: 'arrow', text: '▶', 'data-dir': 'r' }), num]),
      ]);
      const render = () => {
        const v = o.get();
        const t = U.clamp01((v - o.min) / (o.max - o.min));
        fill.style.width = t * 100 + '%';
        knob.style.left = t * 100 + '%';
        num.textContent = o.fmt ? o.fmt(v) : v;
      };
      const step = (d) => {
        const v = U.clamp(Math.round((o.get() + d * o.step) / o.step) * o.step, o.min, o.max);
        o.set(Number(v.toFixed(4)));
        render();
      };
      bar.addEventListener('mousedown', (e) => {
        const rect = bar.getBoundingClientRect();
        const apply = (ev) => {
          const t = U.clamp01((ev.clientX - rect.left) / rect.width);
          const v = Math.round((o.min + t * (o.max - o.min)) / o.step) * o.step;
          o.set(Number(U.clamp(v, o.min, o.max).toFixed(4)));
          render();
        };
        apply(e);
        const up = () => {
          window.removeEventListener('mousemove', apply);
          window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', apply);
        window.addEventListener('mouseup', up);
      });
      render();
      const item = screen.addItem(node, { onLeft: () => step(-1), onRight: () => step(1) });
      item.render = render;
      return item;
    },

    toggleRow(screen, o) {
      const tg = el('div', { class: 'toggle' });
      const node = el('div', { class: 'row' }, [
        el('div', null, [el('div', { class: 'lbl', text: o.label }), o.desc ? el('div', { class: 'desc', text: o.desc }) : null]),
        el('div', { class: 'val' }, [tg]),
      ]);
      const render = () => tg.classList.toggle('on', !!o.get());
      const flip = () => {
        o.set(!o.get());
        render();
      };
      render();
      const item = screen.addItem(node, { onLeft: flip, onRight: flip, onSelect: flip });
      item.sound = 'uiMove';
      item.render = render;
      return item;
    },

    actionRow(screen, label, onSelect, cls) {
      const node = el('div', { class: 'row action ' + (cls || ''), text: label });
      return screen.addItem(node, { onSelect });
    },

    menuButton(screen, label, cap, onSelect, opts = {}) {
      const node = el('button', { class: 'mbtn' + (opts.locked ? ' locked' : '') + (opts.isNew ? ' new' : '') }, [el('span', { text: label }), cap ? el('span', { class: 'cap', text: cap }) : null]);
      return screen.addItem(node, { onSelect, disabled: !!opts.locked });
    },

    footer(items) {
      const f = el('div', { class: 'footer-hints' });
      const render = () => {
        f.innerHTML = items.map(([kind, label]) => '<span>' + SL.menuGlyph(kind) + ' ' + label + '</span>').join('');
      };
      render();
      f.render = render;
      return f;
    },

    confirm(title, text, onYes, yesLabel = 'Yes', noLabel = 'Cancel') {
      const s = new Screen('modal');
      s.modal = true;
      const rows = el('div', { class: 'rows' });
      const panel = el('div', { class: 'panel' }, [el('h2', { text: title }), el('p', { class: 'hint', text: text }), rows]);
      s.el.appendChild(panel);
      const yes = UI.actionRow(s, yesLabel, () => {
        UI.pop();
        onYes();
      });
      const no = UI.actionRow(s, noLabel, () => UI.pop());
      rows.append(yes.node, no.node);
      s.focus(1, true);
      s.onBack = () => UI.pop();
      UI.push(s);
    },
  });

  /* ---------------- subtitles ---------------- */
  SL.Subtitles = {
    el: null,
    timer: null,
    show(speaker, line, duration = 3, opts = {}) {
      this.el = this.el || document.getElementById('subtitles');
      const s = SL.Settings.data.accessibility;
      const lang = (SL.Settings.data.audio && SL.Settings.data.audio.subtitleLanguage) || 'both';
      const jp = opts.jp && lang !== 'en' ? el('span', { class: 'jp', text: opts.jp }) : null;
      const body = lang === 'jp' && opts.jp ? null : line;
      const node = el('div', { class: 'subline' + (opts.style ? ' ' + opts.style : '') }, [s.speakerNames && speaker ? el('span', { class: 'who', text: speaker }) : null, jp, body]);
      this.el.innerHTML = '';
      this.el.appendChild(node);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        node.classList.add('out');
        setTimeout(() => node.remove(), 320);
      }, duration * 1000);
    },
    clear() {
      this.el = this.el || document.getElementById('subtitles');
      clearTimeout(this.timer);
      this.el.innerHTML = '';
    },
  };


  /* ---------------- notifications ---------------- */
  SL.Notify = {
    toast(title, sub, img, duration = 3.6) {
      const root = document.getElementById('notify');
      const node = el('div', { class: 'toast' }, [img ? el('img', { src: img, alt: '' }) : el('span', { class: 'db-icon', style: { fontSize: '34px' } }), el('div', null, [el('div', { class: 'ts', text: sub }), el('div', { class: 'tt', text: title })])]);
      root.appendChild(node);
      setTimeout(() => {
        node.classList.add('out');
        setTimeout(() => node.remove(), 420);
      }, duration * 1000);
    },
    unlocks(list) {
      list.forEach((u, i) => {
        if (!u.title) return;
        setTimeout(() => {
          SL.Audio.play('uiUnlock');
          const img = u.type === 'characters' ? SL.Portraits.get(u.target) : null;
          this.toast(u.title, 'NEW', img, 4);
        }, 400 + i * 900);
      });
    },
  };

  SL.events.on('save:written', () => {
    const ind = document.getElementById('save-indicator');
    if (!ind) return;
    ind.hidden = false;
    clearTimeout(ind._t);
    ind._t = setTimeout(() => (ind.hidden = true), 1400);
  });
})();
