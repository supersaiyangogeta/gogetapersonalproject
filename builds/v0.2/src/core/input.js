/*
 * Input: keyboard, mouse and gamepad unified into named actions.
 * poll() is called once per simulation tick; presses that happen between
 * ticks are queued so fast taps are never lost.
 */
(function () {
  'use strict';
  const U = SL.util;

  const GP_LABELS = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'LS', 'RS', 'D-Up', 'D-Down', 'D-Left', 'D-Right', 'Home'];
  const GP_MODIFIER = 4;

  const KEY_LABELS = {
    Space: 'Space', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift', ControlLeft: 'L-Ctrl', ControlRight: 'R-Ctrl',
    AltLeft: 'L-Alt', AltRight: 'R-Alt', Tab: 'Tab', Escape: 'Esc', Backspace: 'Bksp', Enter: 'Enter',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', CapsLock: 'Caps',
    Mouse0: 'LMB', Mouse1: 'MMB', Mouse2: 'RMB', Mouse3: 'Mouse 4', Mouse4: 'Mouse 5',
    Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', BracketLeft: '[', BracketRight: ']',
    Backslash: '\\', Minus: '-', Equal: '=', Backquote: '`',
  };

  const MENU_KEYS = {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    confirm: ['Enter', 'Space', 'NumpadEnter'],
    back: ['Escape', 'Backspace'],
    tabL: ['KeyQ'],
    tabR: ['KeyE'],
  };
  const MENU_PAD = { up: 12, down: 13, left: 14, right: 15, confirm: 0, back: 1, tabL: 4, tabR: 5 };

  const Input = (SL.Input = {
    canvas: null,
    keysDown: new Set(),
    pressQueue: new Set(),
    releaseQueue: new Set(),
    gp: { connected: false, buttons: new Array(17).fill(false), prev: new Array(17).fill(false), axes: [0, 0, 0, 0], id: '' },
    actions: {},
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    mouseDX: 0,
    mouseDY: 0,
    lastDevice: 'keyboard',
    battleMode: false,
    capture: null,
    menu: { up: false, down: false, left: false, right: false, confirm: false, back: false, tabL: false, tabR: false, any: false },
    _menuRepeat: {},
    toggles: {},
    _modifierUsed: false,

    init(canvas) {
      this.canvas = canvas;
      window.addEventListener('keydown', (e) => this._onKeyDown(e), { capture: true });
      window.addEventListener('keyup', (e) => this._onKeyUp(e), { capture: true });
      window.addEventListener('mousedown', (e) => this._onMouseDown(e));
      window.addEventListener('mouseup', (e) => this._onMouseUp(e));
      window.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement) {
          this.mouseDX += e.movementX || 0;
          this.mouseDY += e.movementY || 0;
        }
      });
      window.addEventListener('contextmenu', (e) => e.preventDefault());
      window.addEventListener('blur', () => {
        this.keysDown.clear();
        SL.events.emit('input:blur');
      });
      window.addEventListener('gamepadconnected', (e) => {
        SL.log('Gamepad connected:', e.gamepad.id);
        SL.events.emit('input:gamepad', { connected: true, id: e.gamepad.id });
      });
      window.addEventListener('gamepaddisconnected', () => SL.events.emit('input:gamepad', { connected: false }));
      document.addEventListener('pointerlockchange', () => {
        SL.events.emit('input:pointerlock', { locked: !!document.pointerLockElement });
      });
      for (const a of Object.keys(SL.Settings.ACTION_LABELS)) this.actions[a] = { held: false, pressed: false, released: false, ticks: 0 };
    },

    /** Some virtual keyboards and automation tools send an empty `code`; derive one from `key`. */
    _code(e) {
      if (e.code) return e.code;
      const k = e.key || '';
      if (k.length === 1) {
        if (/[a-z]/i.test(k)) return 'Key' + k.toUpperCase();
        if (/[0-9]/.test(k)) return 'Digit' + k;
        if (k === ' ') return 'Space';
      }
      const map = { Shift: 'ShiftLeft', Control: 'ControlLeft', Alt: 'AltLeft', Esc: 'Escape', Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight' };
      return map[k] || k;
    },

    _onKeyDown(ev) {
      const e = { code: this._code(ev), repeat: ev.repeat, preventDefault: () => ev.preventDefault(), stopPropagation: () => ev.stopPropagation() };
      if (this.capture) {
        e.preventDefault();
        e.stopPropagation();
        if (e.code === 'Escape') this._finishCapture(null);
        else if (this.capture.device === 'keyboard') this._finishCapture(e.code);
        return;
      }
      this.lastDevice = 'keyboard';
      if (!e.repeat) {
        this.pressQueue.add(e.code);
        SL.events.emit('input:anykey', { code: e.code });
      }
      this.keysDown.add(e.code);
      const blockAlways = ['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'];
      if (blockAlways.includes(e.code)) e.preventDefault();
      if (this.battleMode && this._isBoundKey(e.code) && !['F5', 'F11', 'F12'].includes(e.code)) e.preventDefault();
    },

    _onKeyUp(ev) {
      const code = this._code(ev);
      this.keysDown.delete(code);
      this.releaseQueue.add(code);
    },

    _onMouseDown(e) {
      const code = 'Mouse' + e.button;
      if (this.capture) {
        e.preventDefault();
        if (this.capture.device === 'keyboard') this._finishCapture(code);
        return;
      }
      this.lastDevice = 'keyboard';
      if (this.battleMode) {
        this.keysDown.add(code);
        this.pressQueue.add(code);
        if (e.button === 1) e.preventDefault();
      }
      SL.events.emit('input:mousedown', { button: e.button, battle: this.battleMode });
    },

    _onMouseUp(e) {
      const code = 'Mouse' + e.button;
      this.keysDown.delete(code);
      this.releaseQueue.add(code);
    },

    _isBoundKey(code) {
      const kb = SL.Settings.data.controls.keyboard;
      for (const a in kb) if (kb[a].includes(code)) return true;
      return false;
    },

    /** Starts capturing the next input for rebinding. cb(code|null). */
    startCapture(device, cb) {
      this.capture = { device, cb, started: performance.now() };
      this.keysDown.clear();
    },

    _finishCapture(code) {
      const c = this.capture;
      this.capture = null;
      this.pressQueue.clear();
      if (c) c.cb(code);
    },

    setBattleMode(on) {
      this.battleMode = on;
      this.keysDown.clear();
      this.pressQueue.clear();
      this.toggles = {};
      if (!on) this.exitPointerLock();
    },

    requestPointerLock() {
      if (!SL.Settings.data.camera.mouseCamera || document.pointerLockElement || !this.canvas) return;
      try {
        const p = this.canvas.requestPointerLock();
        if (p && p.catch) p.catch(() => {});
      } catch (e) { /* not allowed right now */ }
    },

    exitPointerLock() {
      if (document.pointerLockElement) document.exitPointerLock();
    },

    _pollGamepad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      let pad = null;
      for (const p of pads) if (p && p.connected) { pad = p; break; }
      const g = this.gp;
      g.prev = g.buttons.slice();
      if (!pad) {
        g.connected = false;
        g.buttons.fill(false);
        g.axes = [0, 0, 0, 0];
        return;
      }
      g.connected = true;
      g.id = pad.id;
      g.pad = pad;
      for (let i = 0; i < 17; i++) {
        const b = pad.buttons[i];
        g.buttons[i] = !!b && (b.pressed || b.value > 0.5);
      }
      for (let i = 0; i < 4; i++) g.axes[i] = pad.axes[i] || 0;
      let active = g.buttons.some((b, i) => b && !g.prev[i]);
      if (Math.hypot(g.axes[0], g.axes[1]) > 0.5 || Math.hypot(g.axes[2], g.axes[3]) > 0.5) active = true;
      if (active) {
        if (this.lastDevice !== 'gamepad') SL.events.emit('input:device', 'gamepad');
        this.lastDevice = 'gamepad';
      }
    },

    /** Called once per simulation tick (and once per frame in menus). */
    poll() {
      if (this.capture && this.capture.device === 'gamepad') {
        this._pollGamepad();
        const g = this.gp;
        const t = performance.now() - this.capture.started;
        if (t > 250) {
          for (let i = 0; i < 17; i++) {
            if (g.buttons[i] && !g.prev[i]) {
              if (i === 9) { this._finishCapture(null); return; }
              const code = g.buttons[GP_MODIFIER] && i !== GP_MODIFIER ? GP_MODIFIER + '+' + i : String(i);
              // wait for a non-modifier press when LB is held so combos can be captured
              if (i === GP_MODIFIER) continue;
              this._finishCapture(code);
              return;
            }
          }
          if (g.buttons[GP_MODIFIER] === false && g.prev[GP_MODIFIER] === true) this._finishCapture(String(GP_MODIFIER));
        }
        return;
      }
      if (this.capture) return;

      this._pollGamepad();
      const s = SL.Settings.data.controls;
      const kb = s.keyboard, pad = s.gamepad;
      const g = this.gp;
      const modHeld = g.connected && g.buttons[GP_MODIFIER];
      const faceNewCombo = modHeld && g.buttons.some((b, i) => i !== GP_MODIFIER && b && !g.prev[i]);
      if (faceNewCombo) this._modifierUsed = true;
      if (!modHeld) this._modifierUsed = false;

      for (const name of Object.keys(this.actions)) {
        const st = this.actions[name];
        let held = false, pressed = false, released = false;
        const keys = kb[name] || [];
        for (const code of keys) {
          if (this.keysDown.has(code)) held = true;
          if (this.pressQueue.has(code)) pressed = true;
          if (this.releaseQueue.has(code)) released = true;
        }
        if (g.connected) {
          for (const b of pad[name] || []) {
            const r = this._padBinding(b, modHeld);
            if (r.held) held = true;
            if (r.pressed) pressed = true;
            if (r.released) released = true;
          }
        }
        if (pressed) held = true; // a tap shorter than one tick still counts as held once
        st.pressed = pressed;
        st.released = released && !held;
        st.held = held;
        st.ticks = held ? st.ticks + 1 : 0;
      }
      // charge on LB alone should not fire once a skill combo was used during this hold
      if (g.connected && modHeld && this._modifierUsed) {
        const c = this.actions.charge;
        const padOnly = !(kb.charge || []).some((code) => this.keysDown.has(code));
        if (padOnly) { c.held = false; c.ticks = 0; }
      }

      // accessibility toggles for guard / charge
      const acc = SL.Settings.data.accessibility;
      this._applyToggle('guard', acc.toggleGuard);
      this._applyToggle('charge', acc.toggleCharge);

      // movement
      let mx = 0, my = 0;
      if (this._anyDown(kb.moveR)) mx += 1;
      if (this._anyDown(kb.moveL)) mx -= 1;
      if (this._anyDown(kb.moveF)) my += 1;
      if (this._anyDown(kb.moveB)) my -= 1;
      const kl = Math.hypot(mx, my);
      if (kl > 1) { mx /= kl; my /= kl; }
      if (g.connected) {
        const dz = s.deadzone;
        const ax = g.axes[0], ay = -g.axes[1];
        const m = Math.hypot(ax, ay);
        if (m > dz && m > kl) {
          const scaled = Math.min(1, (m - dz) / (1 - dz));
          mx = (ax / m) * scaled;
          my = (ay / m) * scaled;
        }
      }
      this.move.x = mx;
      this.move.y = my;

      // look
      const cam = SL.Settings.data.camera;
      let lx = this.mouseDX * 0.0022 * cam.sensitivityX;
      let ly = this.mouseDY * 0.0022 * cam.sensitivityY;
      this.mouseDX = 0;
      this.mouseDY = 0;
      if (g.connected) {
        const dz = s.deadzone;
        const rx = g.axes[2], ry = g.axes[3];
        if (Math.hypot(rx, ry) > dz) {
          lx += rx * 0.045 * cam.sensitivityX;
          ly += ry * 0.035 * cam.sensitivityY;
        }
      }
      if (cam.invertY) ly = -ly;
      this.look.x = lx;
      this.look.y = ly;

      this.pressQueue.clear();
      this.releaseQueue.clear();
    },

    _applyToggle(name, enabled) {
      const st = this.actions[name];
      if (!enabled) { this.toggles[name] = false; return; }
      if (st.pressed) this.toggles[name] = !this.toggles[name];
      st.held = !!this.toggles[name];
      st.ticks = st.held ? st.ticks + 1 : 0;
    },

    clearToggles() {
      this.toggles = {};
    },

    _anyDown(list) {
      if (!list) return false;
      for (const c of list) if (this.keysDown.has(c)) return true;
      return false;
    },

    _padBinding(b, modHeld) {
      const g = this.gp;
      const str = String(b);
      if (str.includes('+')) {
        const [m, bt] = str.split('+').map(Number);
        const on = g.buttons[m] && g.buttons[bt];
        return { held: on, pressed: g.buttons[m] && g.buttons[bt] && !g.prev[bt], released: !on && g.prev[bt] && g.buttons[m] };
      }
      const i = Number(str);
      // face buttons are reserved for combos while the modifier is held
      if (modHeld && i !== GP_MODIFIER && [0, 1, 2, 3, 12, 13, 14, 15].includes(i)) return { held: false, pressed: false, released: false };
      return { held: g.buttons[i], pressed: g.buttons[i] && !g.prev[i], released: !g.buttons[i] && g.prev[i] };
    },

    /** Raw held check that works outside battle polling (menus). Ignores gamepad combos. */
    anyHeldRaw(a) {
      const s = SL.Settings.data.controls;
      if ((s.keyboard[a] || []).some((c) => this.keysDown.has(c))) return true;
      if (this.gp.connected) {
        for (const b of s.gamepad[a] || []) {
          const str = String(b);
          if (!str.includes('+') && this.gp.buttons[Number(str)]) return true;
        }
      }
      return false;
    },

    consume(a) {
      if (this.actions[a]) this.actions[a].pressed = false;
    },

    held(a) { return this.actions[a] ? this.actions[a].held : false; },
    pressed(a) { return this.actions[a] ? this.actions[a].pressed : false; },
    released(a) { return this.actions[a] ? this.actions[a].released : false; },
    ticks(a) { return this.actions[a] ? this.actions[a].ticks : 0; },

    /** Menu navigation with key-repeat. Call once per rendered frame while in menus. */
    pollMenu(dtMs) {
      if (this.capture) {
        for (const k of Object.keys(this.menu)) this.menu[k] = false;
        return this.menu;
      }
      this._pollGamepad();
      const g = this.gp;
      const now = performance.now();
      const res = this.menu;
      res.any = false;
      for (const dir of Object.keys(MENU_KEYS)) {
        let down = this._anyDown(MENU_KEYS[dir]);
        let edge = MENU_KEYS[dir].some((c) => this.pressQueue.has(c));
        if (g.connected) {
          const bi = MENU_PAD[dir];
          if (g.buttons[bi]) down = true;
          if (g.buttons[bi] && !g.prev[bi]) edge = true;
          const dz = 0.55;
          if (dir === 'up' && -g.axes[1] > dz) down = true;
          if (dir === 'down' && g.axes[1] > dz) down = true;
          if (dir === 'left' && g.axes[0] < -dz) down = true;
          if (dir === 'right' && g.axes[0] > dz) down = true;
        }
        const rep = this._menuRepeat[dir] || (this._menuRepeat[dir] = { down: false, next: 0 });
        let fire = false;
        const repeatable = ['up', 'down', 'left', 'right'].includes(dir);
        if (edge || (down && !rep.down)) {
          fire = true;
          rep.next = now + 380;
        } else if (down && repeatable && now >= rep.next) {
          fire = true;
          rep.next = now + 95;
        }
        rep.down = down;
        res[dir] = fire;
        if (fire) res.any = true;
      }
      if (g.connected && g.buttons.some((b, i) => b && !g.prev[i])) res.any = true;
      if (this.pressQueue.size > 0) res.any = true;
      this.pressQueue.clear();
      this.releaseQueue.clear();
      return res;
    },

    keyLabel(code) {
      if (!code) return '—';
      if (KEY_LABELS[code]) return KEY_LABELS[code];
      if (code.startsWith('Key')) return code.slice(3);
      if (code.startsWith('Digit')) return code.slice(5);
      if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
      return code;
    },

    padLabel(code) {
      if (code == null) return '—';
      const str = String(code);
      if (str.includes('+')) return str.split('+').map((n) => GP_LABELS[Number(n)] || n).join('+');
      return GP_LABELS[Number(str)] || str;
    },

    /** Label of the first binding for an action on the device the player last used. */
    bindingLabel(action, device) {
      const dev = device || (this.lastDevice === 'gamepad' && this.gp.connected ? 'gamepad' : 'keyboard');
      const list = SL.Settings.data.controls[dev][action] || [];
      if (!list.length) return '—';
      if (dev === 'gamepad') return this.padLabel(list[0]);
      // prefer a keyboard key over a mouse button for readability, unless mouse is first
      return this.keyLabel(list[0]);
    },

    rumble(strong = 0.5, weak = 0.5, ms = 120) {
      if (!SL.Settings.data.controls.vibration) return;
      const pad = this.gp.pad;
      const act = pad && pad.vibrationActuator;
      if (act && act.playEffect) {
        act.playEffect('dual-rumble', { duration: ms, strongMagnitude: U.clamp01(strong), weakMagnitude: U.clamp01(weak) }).catch(() => {});
      }
    },
  });

  Input.GP_LABELS = GP_LABELS;
})();
