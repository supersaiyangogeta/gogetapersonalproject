/*
 * Audio: Web Audio synthesized sound effects (no audio files needed).
 * PROTOTYPE AUDIO — every sound is generated in code. Final sound design
 * (recorded impacts, voice acting) can replace entries in SFX one by one.
 */
(function () {
  'use strict';
  const U = SL.util;

  const Audio = (SL.Audio = {
    ctx: null,
    master: null,
    buses: {},
    noiseBuf: null,
    reverb: null,
    voices: 0,
    MAX_VOICES: 40,
    muted: false,

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = (this.ctx = new Ctx());
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 10;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      this.master = ctx.createGain();
      // dream filter (story visions): muffles everything; open at 20 kHz otherwise
      this.dreamFilter = ctx.createBiquadFilter();
      this.dreamFilter.type = 'lowpass';
      this.dreamFilter.frequency.value = 20000;
      this.master.connect(this.dreamFilter);
      this.dreamFilter.connect(comp);
      comp.connect(ctx.destination);
      for (const b of ['music', 'sfx', 'ui']) {
        const g = ctx.createGain();
        g.connect(this.master);
        this.buses[b] = g;
      }
      // music low-pass used to "duck" music while paused
      this.musicFilter = ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.value = 20000;
      this.musicIn = ctx.createGain();
      this.musicIn.connect(this.musicFilter);
      this.musicFilter.connect(this.buses.music);

      const len = ctx.sampleRate * 2;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      // generated impulse response for a cheap, big "space" reverb
      const irLen = ctx.sampleRate * 2.2;
      const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const ch = ir.getChannelData(c);
        for (let i = 0; i < irLen; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.6);
      }
      this.reverb = ctx.createConvolver();
      this.reverb.buffer = ir;
      this.reverbSend = ctx.createGain();
      this.reverbSend.gain.value = 0.35;
      this.reverbSend.connect(this.reverb);
      this.reverb.connect(this.buses.sfx);

      this.applyVolumes();
      SL.events.on('settings:changed', (e) => {
        if (e.path.startsWith('audio')) this.applyVolumes();
      });
      window.addEventListener('blur', () => {
        if (SL.Settings.data.audio.muteOnBlur) this.setMuted(true);
      });
      window.addEventListener('focus', () => this.setMuted(false));
      if (SL.Music) SL.Music.attach(this);
    },

    applyVolumes() {
      if (!this.ctx) return;
      const a = SL.Settings.data.audio;
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(this.muted ? 0 : a.master, t, 0.05);
      this.buses.music.gain.setTargetAtTime(a.music, t, 0.05);
      this.buses.sfx.gain.setTargetAtTime(a.sfx, t, 0.05);
      this.buses.ui.gain.setTargetAtTime(a.ui, t, 0.05);
    },

    setMuted(m) {
      this.muted = m;
      this.applyVolumes();
    },

    duckMusic(on) {
      if (!this.ctx) return;
      this.musicFilter.frequency.setTargetAtTime(on ? 700 : 20000, this.ctx.currentTime, 0.12);
    },

    /** Muffles the whole mix for dream visions: 0 = normal, 1 = heavily muffled. */
    setDream(amount) {
      if (!this.ctx || !this.dreamFilter) return;
      const a = U.clamp01(amount);
      this.dreamFilter.frequency.setTargetAtTime(a > 0 ? U.lerp(20000, 1100, a) : 20000, this.ctx.currentTime, 0.25);
    },

    /* ---------- building blocks ---------- */
    _out(bus, vol, pan, reverb) {
      const ctx = this.ctx;
      const g = ctx.createGain();
      g.gain.value = vol;
      let node = g;
      if (pan && ctx.createStereoPanner) {
        const p = ctx.createStereoPanner();
        p.pan.value = U.clamp(pan, -1, 1);
        g.connect(p);
        node = p;
      }
      node.connect(this.buses[bus] || this.buses.sfx);
      if (reverb && this.reverbSend) {
        const s = ctx.createGain();
        s.gain.value = reverb;
        g.connect(s);
        s.connect(this.reverbSend);
      }
      return g;
    },

    _noise(dest, t, dur, filterType, f0, f1, q = 1) {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.setValueAtTime(f0, t);
      if (f1 !== undefined && f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      f.Q.value = q;
      const g = ctx.createGain();
      src.connect(f);
      f.connect(g);
      g.connect(dest);
      src.start(t, Math.random() * 1.5);
      src.stop(t + dur + 0.05);
      return g;
    },

    _osc(dest, t, dur, type, f0, f1) {
      const ctx = this.ctx;
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      if (f1 !== undefined && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + dur);
      const g = ctx.createGain();
      o.connect(g);
      g.connect(dest);
      o.start(t);
      o.stop(t + dur + 0.05);
      return g;
    },

    _env(g, t, attack, peak, decay, curve = 'exp') {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
      else g.gain.linearRampToValueAtTime(0, t + attack + decay);
    },

    /** Plays a one-shot sound effect. opts: {vol, pan, pitch} */
    play(name, opts = {}) {
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (this.voices >= this.MAX_VOICES) return;
      const fn = SFX[name];
      if (!fn) return;
      this.voices++;
      const dur = fn(this, this.ctx.currentTime, opts) || 0.5;
      setTimeout(() => this.voices--, dur * 1000 + 100);
    },

    /**
     * Starts a looping sound; returns a handle {set(value), stop(fade)}.
     * LIFECYCLE: every loop is registered in `live` until its handle is stopped, whether or
     * not a sound device exists (headless runs keep the same bookkeeping with a silent
     * voice), so "is anything still humming" is a question the game — and the tests — can
     * ask. A loop that nobody stops is a bug: `stopLoops` is the safety net that battles,
     * mission ends and teardown pull. opts.ui marks menu loops that battle cleanup leaves be.
     */
    loop(name, opts = {}) {
      const fn = LOOPS[name];
      if (!fn) return NULL_HANDLE;
      let voice = NULL_HANDLE;
      if (this.ctx) {
        try {
          voice = fn(this, opts);
        } catch (e) {
          SL.warn('loop failed', name, e);
        }
      }
      const live = this.live;
      const h = {
        name,
        ui: !!opts.ui,
        tag: opts.tag || null,
        level: 0,
        stopped: false,
        set(v) {
          if (h.stopped) return;
          h.level = v;
          voice.set(Audio.loopsMuted && !h.ui ? 0 : v);
        },
        stop(fade) {
          if (h.stopped) return;
          h.stopped = true;
          live.delete(h);
          voice.stop(fade);
        },
      };
      live.add(h);
      return h;
    },

    /** Loops still playing (optionally filtered). */
    liveLoops(pred) {
      return [...this.live].filter((h) => !pred || pred(h));
    },

    /** Stops every live loop (or those matching pred) with a fade. Returns how many. */
    stopLoops(fade = 0.3, pred) {
      const list = this.liveLoops(pred);
      for (const h of list) h.stop(fade);
      return list.length;
    },

    /** Silences game loops without ending them (pause menu); resuming restores their level. */
    muteLoops(on) {
      this.loopsMuted = !!on;
      for (const h of this.live) if (!h.ui) h.set(h.level);
    },
  });

  Audio.live = new Set();
  Audio.loopsMuted = false;
  const NULL_HANDLE = { set() {}, stop() {}, stopped: true };

  /* ---------------- one-shot effects ---------------- */
  const SFX = {
    uiMove(A, t) {
      const out = A._out('ui', 0.18);
      A._env(A._osc(out, t, 0.05, 'sine', 900, 1150), t, 0.003, 1, 0.05);
      return 0.1;
    },
    uiSelect(A, t) {
      const out = A._out('ui', 0.22);
      A._env(A._osc(out, t, 0.08, 'triangle', 660, 660), t, 0.003, 1, 0.08);
      A._env(A._osc(out, t + 0.06, 0.14, 'triangle', 990, 1320), t + 0.06, 0.003, 1, 0.14);
      return 0.25;
    },
    uiBack(A, t) {
      const out = A._out('ui', 0.2);
      A._env(A._osc(out, t, 0.1, 'triangle', 520, 330), t, 0.003, 1, 0.1);
      return 0.15;
    },
    uiError(A, t) {
      const out = A._out('ui', 0.12);
      A._env(A._osc(out, t, 0.18, 'square', 140, 120), t, 0.005, 1, 0.18);
      return 0.2;
    },
    uiUnlock(A, t) {
      const out = A._out('ui', 0.25, 0, 0.3);
      [523, 659, 784, 1047].forEach((f, i) => A._env(A._osc(out, t + i * 0.07, 0.5, 'triangle', f, f), t + i * 0.07, 0.005, 0.8, 0.5));
      return 0.9;
    },
    swing(A, t, o) {
      const out = A._out('sfx', 0.16 * (o.vol || 1), o.pan);
      A._env(A._noise(out, t, 0.12, 'bandpass', 500 * (o.pitch || 1), 2200 * (o.pitch || 1), 1.2), t, 0.02, 1, 0.1);
      return 0.2;
    },
    punchLight(A, t, o) {
      const p = (o.pitch || 1) * U.rand(0.9, 1.12);
      const out = A._out('sfx', 0.55 * (o.vol || 1), o.pan);
      A._env(A._noise(out, t, 0.07, 'bandpass', 1400 * p, 700 * p, 0.8), t, 0.001, 0.9, 0.07);
      A._env(A._osc(out, t, 0.09, 'sine', 170 * p, 60), t, 0.001, 1, 0.09);
      return 0.15;
    },
    punchHeavy(A, t, o) {
      const p = (o.pitch || 1) * U.rand(0.9, 1.1);
      const out = A._out('sfx', 0.75 * (o.vol || 1), o.pan, 0.15);
      A._env(A._noise(out, t, 0.2, 'lowpass', 2600 * p, 400, 0.7), t, 0.001, 1, 0.2);
      A._env(A._osc(out, t, 0.25, 'sine', 120 * p, 38), t, 0.001, 1.1, 0.25);
      A._env(A._osc(out, t, 0.05, 'square', 300 * p, 90), t, 0.001, 0.25, 0.05);
      return 0.35;
    },
    block(A, t, o) {
      const out = A._out('sfx', 0.4 * (o.vol || 1), o.pan);
      A._env(A._noise(out, t, 0.08, 'highpass', 2500, 1800, 0.6), t, 0.001, 0.8, 0.08);
      A._env(A._osc(out, t, 0.1, 'triangle', 380, 300), t, 0.001, 0.5, 0.1);
      return 0.15;
    },
    perfectGuard(A, t, o) {
      const out = A._out('sfx', 0.45, o.pan, 0.4);
      A._env(A._osc(out, t, 0.5, 'sine', 1320, 1320), t, 0.002, 0.6, 0.5);
      A._env(A._osc(out, t, 0.4, 'sine', 1980, 1990), t, 0.002, 0.35, 0.4);
      A._env(A._noise(out, t, 0.06, 'highpass', 4000, 4000), t, 0.001, 0.4, 0.06);
      return 0.6;
    },
    dodge(A, t, o) {
      const out = A._out('sfx', 0.3, o.pan);
      A._env(A._noise(out, t, 0.18, 'bandpass', 2200, 400, 1.5), t, 0.01, 1, 0.16);
      return 0.25;
    },
    vanish(A, t, o) {
      const out = A._out('sfx', 0.4, o.pan, 0.2);
      A._env(A._osc(out, t, 0.09, 'sine', 2400, 180), t, 0.001, 0.8, 0.09);
      A._env(A._noise(out, t, 0.06, 'highpass', 5000, 3000), t, 0.001, 0.6, 0.06);
      return 0.2;
    },
    teleport(A, t, o) {
      const out = A._out('sfx', 0.35, o.pan, 0.3);
      A._env(A._osc(out, t, 0.16, 'sine', 300, 1800), t, 0.005, 0.7, 0.16);
      A._env(A._osc(out, t + 0.04, 0.2, 'triangle', 1200, 2600), t + 0.04, 0.005, 0.3, 0.2);
      return 0.3;
    },
    dash(A, t, o) {
      const out = A._out('sfx', 0.35 * (o.vol || 1), o.pan);
      A._env(A._noise(out, t, 0.3, 'bandpass', 600, 2400, 0.9), t, 0.02, 1, 0.26);
      A._env(A._osc(out, t, 0.2, 'sine', 90, 50), t, 0.005, 0.6, 0.2);
      return 0.35;
    },
    jump(A, t, o) {
      const out = A._out('sfx', 0.22, o.pan);
      A._env(A._noise(out, t, 0.2, 'bandpass', 400, 1500, 0.8), t, 0.01, 1, 0.18);
      return 0.25;
    },
    kiBlast(A, t, o) {
      const p = (o.pitch || 1) * U.rand(0.92, 1.08);
      const out = A._out('sfx', 0.32 * (o.vol || 1), o.pan);
      A._env(A._osc(out, t, 0.14, 'sawtooth', 1100 * p, 260 * p), t, 0.001, 0.35, 0.14);
      A._env(A._noise(out, t, 0.1, 'bandpass', 3000 * p, 1200, 1), t, 0.001, 0.5, 0.1);
      return 0.2;
    },
    kiBlastBig(A, t, o) {
      const out = A._out('sfx', 0.5 * (o.vol || 1), o.pan, 0.25);
      A._env(A._osc(out, t, 0.45, 'sawtooth', 500, 90), t, 0.005, 0.4, 0.45);
      A._env(A._noise(out, t, 0.4, 'lowpass', 3000, 300, 0.8), t, 0.005, 0.8, 0.4);
      return 0.5;
    },
    // the moment a beam leaves the hands: a bright crack, a rushing wall of noise, a low thump
    // (the engine has always asked for this cue; it did not exist, so every beam launched silent)
    beamFire(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.55 * (o.vol || 1), o.pan, 0.3);
      A._env(A._noise(out, t, 0.08, 'highpass', 3000 * p, 1800 * p, 0.7), t, 0.001, 0.7, 0.08);
      A._env(A._noise(out, t, 0.7, 'bandpass', 900 * p, 2600 * p, 0.6), t, 0.02, 0.9, 0.7);
      A._env(A._osc(out, t, 0.5, 'sawtooth', 160 * p, 60), t, 0.004, 0.5, 0.5);
      A._env(A._osc(out, t, 0.35, 'sine', 90, 40), t, 0.002, 0.9, 0.35);
      return 0.75;
    },
    explosionSmall(A, t, o) {
      const out = A._out('sfx', 0.5 * (o.vol || 1), o.pan, 0.25);
      A._env(A._noise(out, t, 0.4, 'lowpass', 3500, 250, 0.7), t, 0.002, 1, 0.4);
      A._env(A._osc(out, t, 0.3, 'sine', 110, 40), t, 0.002, 0.8, 0.3);
      return 0.5;
    },
    explosionBig(A, t, o) {
      const out = A._out('sfx', 0.85 * (o.vol || 1), o.pan, 0.55);
      A._env(A._noise(out, t, 1.8, 'lowpass', 4000, 90, 0.6), t, 0.004, 1, 1.8);
      A._env(A._osc(out, t, 1.2, 'sine', 80, 24), t, 0.004, 1.2, 1.2);
      A._env(A._noise(out, t + 0.1, 1.2, 'bandpass', 800, 150, 0.5), t + 0.1, 0.05, 0.6, 1.1);
      return 2;
    },
    explosionHuge(A, t, o) {
      const out = A._out('sfx', 1 * (o.vol || 1), 0, 0.7);
      A._env(A._noise(out, t, 4, 'lowpass', 5000, 60, 0.5), t, 0.01, 1, 4);
      A._env(A._osc(out, t, 3, 'sine', 60, 18), t, 0.01, 1.3, 3);
      A._env(A._osc(out, t, 2, 'sawtooth', 45, 20), t, 0.01, 0.3, 2);
      return 4.2;
    },
    groundImpact(A, t, o) {
      const out = A._out('sfx', 0.75 * (o.vol || 1), o.pan, 0.3);
      A._env(A._osc(out, t, 0.4, 'sine', 70, 28), t, 0.002, 1.2, 0.4);
      A._env(A._noise(out, t, 0.6, 'lowpass', 1400, 150, 0.6), t, 0.002, 0.9, 0.6);
      for (let i = 0; i < 5; i++) {
        const tt = t + 0.05 + Math.random() * 0.35;
        A._env(A._noise(out, tt, 0.05, 'bandpass', U.rand(900, 2600), U.rand(500, 900), 2), tt, 0.001, 0.35, 0.05);
      }
      return 0.7;
    },
    rockBreak(A, t, o) {
      const out = A._out('sfx', 0.6 * (o.vol || 1), o.pan, 0.25);
      A._env(A._noise(out, t, 0.5, 'lowpass', 2000, 200, 0.5), t, 0.002, 0.8, 0.5);
      for (let i = 0; i < 9; i++) {
        const tt = t + Math.random() * 0.6;
        A._env(A._noise(out, tt, 0.06, 'bandpass', U.rand(700, 3200), U.rand(400, 900), 3), tt, 0.001, 0.5, 0.06);
      }
      return 0.8;
    },
    transformBurst(A, t, o) {
      const out = A._out('sfx', 0.8, 0, 0.6);
      A._env(A._noise(out, t, 1.6, 'lowpass', 6000, 200, 0.4), t, 0.003, 1, 1.6);
      A._env(A._osc(out, t, 1.3, 'sine', 90, 30), t, 0.003, 1, 1.3);
      [220, 277, 330, 440].forEach((f) => A._env(A._osc(out, t, 1.4, 'sawtooth', f, f * 1.01), t, 0.01, 0.07, 1.4));
      return 1.8;
    },
    lightning(A, t, o) {
      const out = A._out('sfx', 0.18 * (o.vol || 1), o.pan);
      for (let i = 0; i < 3; i++) {
        const tt = t + i * 0.03 + Math.random() * 0.02;
        A._env(A._noise(out, tt, 0.03, 'highpass', 3500, 2500), tt, 0.001, 0.8, 0.03);
      }
      return 0.15;
    },
    // a long swelling hum: ki being gathered rather than spent. Cutscenes have
    // asked for this by name since the Namek climax; it had no sound until now.
    kiCharge(A, t, o) {
      const out = A._out('sfx', 0.22, o.pan, 0.25);
      const p = o.pitch || 1;
      A._env(A._osc(out, t, 1.1, 'sine', 90 * p, 260 * p), t, 0.25, 0.7, 1.1);
      A._env(A._osc(out, t, 1.1, 'triangle', 180 * p, 520 * p), t, 0.3, 0.35, 1.1);
      A._env(A._noise(out, t, 1.1, 'bandpass', 400 * p, 1600 * p, 1.2), t, 0.35, 0.28, 1.1);
      return 1.2;
    },
    kiUp(A, t, o) {
      const out = A._out('sfx', 0.25, o.pan);
      A._env(A._osc(out, t, 0.25, 'triangle', 300, 900), t, 0.01, 0.6, 0.24);
      return 0.3;
    },
    guardBreak(A, t, o) {
      const out = A._out('sfx', 0.6, o.pan, 0.3);
      A._env(A._noise(out, t, 0.35, 'highpass', 1200, 500, 0.5), t, 0.001, 1, 0.35);
      A._env(A._osc(out, t, 0.3, 'square', 200, 60), t, 0.001, 0.4, 0.3);
      return 0.4;
    },
    gong(A, t) {
      const out = A._out('sfx', 0.5, 0, 0.6);
      [110, 164.8, 220, 331].forEach((f, i) => A._env(A._osc(out, t, 2.2, 'sine', f, f * 0.995), t, 0.005, 0.5 / (i + 1), 2.2));
      A._env(A._noise(out, t, 0.2, 'lowpass', 1200, 200), t, 0.002, 0.4, 0.2);
      return 2.3;
    },
    ko(A, t) {
      const out = A._out('sfx', 0.9, 0, 0.7);
      A._env(A._osc(out, t, 1.6, 'sine', 55, 22), t, 0.005, 1.3, 1.6);
      A._env(A._noise(out, t, 1.2, 'lowpass', 3000, 80, 0.5), t, 0.005, 0.9, 1.2);
      return 1.8;
    },
    mash(A, t) {
      const out = A._out('ui', 0.12);
      A._env(A._osc(out, t, 0.03, 'square', 700 + Math.random() * 200, 500), t, 0.001, 0.5, 0.03);
      return 0.06;
    },
    heartbeat(A, t) {
      const out = A._out('sfx', 0.35);
      A._env(A._osc(out, t, 0.12, 'sine', 70, 45), t, 0.005, 1, 0.12);
      A._env(A._osc(out, t + 0.18, 0.12, 'sine', 62, 40), t + 0.18, 0.005, 0.7, 0.12);
      return 0.4;
    },
    // beam charge tier step: bright rising chime + air burst
    tierUp(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.32 * (o.vol || 1), o.pan, 0.35);
      A._env(A._osc(out, t, 0.35, 'triangle', 520 * p, 1040 * p), t, 0.004, 0.6, 0.35);
      A._env(A._osc(out, t + 0.03, 0.3, 'sine', 1560 * p, 1570 * p), t + 0.03, 0.004, 0.35, 0.3);
      A._env(A._noise(out, t, 0.25, 'bandpass', 1800, 5200, 1.2), t, 0.01, 0.5, 0.22);
      return 0.45;
    },
    // Instant Transmission reappearance: short phase-in "pop"
    itPop(A, t, o) {
      const out = A._out('sfx', 0.4, o.pan, 0.35);
      A._env(A._osc(out, t, 0.12, 'sine', 1900, 420), t, 0.001, 0.8, 0.12);
      A._env(A._osc(out, t, 0.2, 'triangle', 2800, 2790), t, 0.002, 0.25, 0.2);
      A._env(A._noise(out, t, 0.08, 'highpass', 6000, 3500), t, 0.001, 0.45, 0.08);
      return 0.3;
    },
    // Super Saiyan build-up: rising roar with detuned growl and crackle
    ssjRise(A, t, o) {
      const out = A._out('sfx', 0.7, 0, 0.5);
      A._env(A._noise(out, t, 1.1, 'bandpass', 250, 2400, 0.8), t, 0.6, 0.9, 0.5, 'lin');
      A._env(A._osc(out, t, 1.1, 'sawtooth', 55, 130), t, 0.5, 0.25, 0.6, 'lin');
      A._env(A._osc(out, t, 1.1, 'sawtooth', 56.5, 133), t, 0.5, 0.25, 0.6, 'lin');
      for (let i = 0; i < 8; i++) {
        const tt = t + 0.2 + Math.random() * 0.9;
        A._env(A._noise(out, tt, 0.03, 'highpass', 4000, 3000), tt, 0.001, 0.5, 0.03);
      }
      return 1.2;
    },
    // Kaioken level up: deep boom with red-hot hiss
    kaiokenBoom(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.65, o.pan, 0.4);
      A._env(A._osc(out, t, 0.5, 'sine', 95 * p, 32), t, 0.003, 1.1, 0.5);
      A._env(A._noise(out, t, 0.7, 'lowpass', 5000, 300, 0.6), t, 0.003, 0.8, 0.7);
      A._env(A._noise(out, t + 0.05, 0.5, 'bandpass', 3000, 1200, 2), t + 0.05, 0.05, 0.3, 0.45);
      return 0.8;
    },
    // dinosaur / beast roar: pitch-bent growl with a rough noise layer
    roar(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.9 * (o.vol || 1), o.pan, 0.6);
      A._env(A._osc(out, t, 1.5, 'sawtooth', 120 * p, 70 * p), t, 0.08, 0.45, 1.4);
      A._env(A._osc(out, t, 1.5, 'sawtooth', 123 * p, 66 * p), t, 0.08, 0.35, 1.4);
      A._env(A._noise(out, t, 1.5, 'bandpass', 700 * p, 260 * p, 1.4), t, 0.05, 0.9, 1.4);
      A._env(A._osc(out, t, 1.2, 'sine', 55 * p, 38), t, 0.05, 0.8, 1.2);
      return 1.6;
    },
    // small collectible chime
    pickup(A, t, o) {
      const out = A._out('sfx', 0.35, o.pan, 0.3);
      [880, 1175, 1568].forEach((f, i) => A._env(A._osc(out, t + i * 0.05, 0.25, 'triangle', f, f), t + i * 0.05, 0.004, 0.6, 0.25));
      return 0.4;
    },
    // hungry stomach
    growl(A, t, o) {
      const out = A._out('sfx', 0.4, o.pan);
      A._env(A._osc(out, t, 0.7, 'sawtooth', 70, 45), t, 0.1, 0.4, 0.6, 'lin');
      A._env(A._noise(out, t, 0.7, 'lowpass', 300, 120, 2), t, 0.1, 0.5, 0.6, 'lin');
      return 0.8;
    },
    // new technique learned: soft rising shimmer
    learn(A, t, o) {
      const out = A._out('ui', 0.3, 0, 0.4);
      [523, 784, 1047, 1568].forEach((f, i) => A._env(A._osc(out, t + i * 0.08, 0.6, 'sine', f, f * 1.005), t + i * 0.08, 0.01, 0.5, 0.6));
      A._env(A._noise(out, t, 0.5, 'highpass', 5000, 8000), t, 0.2, 0.15, 0.3);
      return 1;
    },
    // Saibaman screech / cackle: warbling high voice
    saibaScreech(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.32 * (o.vol || 1), o.pan, 0.2);
      for (let i = 0; i < 4; i++) {
        const tt = t + i * 0.07;
        A._env(A._osc(out, tt, 0.08, 'sawtooth', (900 + i * 90) * p, (700 + i * 60) * p), tt, 0.004, 0.6, 0.07);
      }
      A._env(A._noise(out, t, 0.3, 'bandpass', 2600 * p, 1800 * p, 3), t, 0.01, 0.35, 0.28);
      return 0.4;
    },
    // self-destruct fuse: short rising beep
    fuseBeep(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.28, o.pan);
      A._env(A._osc(out, t, 0.06, 'square', 1300 * p, 1500 * p), t, 0.001, 0.5, 0.06);
      return 0.1;
    },
    // digging / tunnelling rumble
    burrow(A, t, o) {
      const out = A._out('sfx', 0.45 * (o.vol || 1), o.pan, 0.2);
      A._env(A._noise(out, t, 0.5, 'lowpass', 500, 200, 1), t, 0.03, 0.9, 0.45);
      A._env(A._osc(out, t, 0.4, 'sine', 55, 40), t, 0.03, 0.6, 0.4);
      return 0.55;
    },
    acidSpit(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.3, o.pan);
      A._env(A._noise(out, t, 0.14, 'bandpass', 1400 * p, 3000 * p, 2), t, 0.002, 0.8, 0.13);
      A._env(A._osc(out, t, 0.1, 'triangle', 500 * p, 260 * p), t, 0.002, 0.4, 0.1);
      return 0.2;
    },
    // planet-scale energy: a long, low rumble. o.dur seconds
    rumble(A, t, o) {
      const d = o.dur || 3;
      const out = A._out('sfx', 0.7 * (o.vol || 1), 0, 0.5);
      const n = A._noise(out, t, d, 'lowpass', 220, 90, 0.8);
      n.gain.setValueAtTime(0.0001, t);
      n.gain.linearRampToValueAtTime(1, t + d * 0.3);
      n.gain.linearRampToValueAtTime(0.0001, t + d);
      const s = A._osc(out, t, d, 'sine', 38, 30);
      s.gain.setValueAtTime(0.0001, t);
      s.gain.linearRampToValueAtTime(0.9, t + d * 0.3);
      s.gain.linearRampToValueAtTime(0.0001, t + d);
      return d + 0.1;
    },
    // ears ringing after a blast
    tinnitus(A, t, o) {
      const out = A._out('sfx', 0.08 * (o.vol || 1), 0, 0.2);
      A._env(A._osc(out, t, 3.2, 'sine', 3900, 3850), t, 0.05, 1, 3.2, 'lin');
      return 3.4;
    },
    // into a vision: a reversed swell that opens into a soft shimmer
    visionIn(A, t, o) {
      const out = A._out('sfx', 0.4 * (o.vol || 1), 0, 0.8);
      const sw = A._noise(out, t, 0.95, 'bandpass', 600, 5200, 0.9);
      sw.gain.setValueAtTime(0.0001, t);
      sw.gain.exponentialRampToValueAtTime(0.7, t + 0.85);
      sw.gain.linearRampToValueAtTime(0.0001, t + 0.95);
      [1046, 1318, 1568, 2093].forEach((f, i) => A._env(A._osc(out, t + 0.8 + i * 0.06, 1.4, 'sine', f, f * 1.004), t + 0.8 + i * 0.06, 0.02, 0.25, 1.4));
      return 2.4;
    },
    // cloth giving way: a dry, fast rip (clothing damage)
    clothTear(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.32 * (o.vol || 1), o.pan);
      for (let i = 0; i < 5; i++) {
        const tt = t + i * 0.022;
        A._env(A._noise(out, tt, 0.035, 'bandpass', 2600 * p, 4200 * p, 2.4), tt, 0.001, 0.9, 0.034);
      }
      A._env(A._noise(out, t, 0.16, 'highpass', 1800 * p, 900 * p, 0.8), t, 0.002, 0.5, 0.16);
      return 0.2;
    },
    // Buu's candy ray landing: a sugary glassy pop
    candyPop(A, t, o) {
      const out = A._out('sfx', 0.3 * (o.vol || 1), o.pan, 0.3);
      A._env(A._osc(out, t, 0.18, 'sine', 1400, 2600), t, 0.002, 0.7, 0.18);
      A._env(A._osc(out, t + 0.05, 0.22, 'triangle', 2100, 3300), t + 0.05, 0.002, 0.45, 0.22);
      A._env(A._noise(out, t, 0.08, 'highpass', 5000, 3000, 1), t, 0.001, 0.5, 0.08);
      return 0.35;
    },
    // something organic pulling itself back together (Majin Buu reforming)
    regrow(A, t, o) {
      const d = o.dur || 0.9;
      const out = A._out('sfx', 0.35 * (o.vol || 1), o.pan, 0.2);
      A._env(A._noise(out, t, d, 'lowpass', 300, 1400, 3), t, 0.05, 0.9, d);
      A._env(A._osc(out, t, d, 'sine', 90, 220), t, 0.08, 0.5, d);
      return d + 0.1;
    },
    // rubber stretching (Buu's arm), a rising boing
    stretch(A, t, o) {
      const out = A._out('sfx', 0.28 * (o.vol || 1), o.pan);
      A._env(A._osc(out, t, 0.32, 'sine', 180, 520), t, 0.004, 0.7, 0.32);
      A._env(A._osc(out, t, 0.32, 'triangle', 90, 260), t, 0.004, 0.35, 0.32);
      return 0.35;
    },
    // Babidi's magic: a warbling, rising chord
    magic(A, t, o) {
      const out = A._out('sfx', 0.26 * (o.vol || 1), 0, 0.6);
      [330, 415, 494, 622].forEach((f, i) => A._env(A._osc(out, t + i * 0.05, 1.1, 'triangle', f, f * 1.5), t + i * 0.05, 0.05, 0.4, 1.1));
      A._env(A._noise(out, t, 1.1, 'bandpass', 1200, 3400, 1.5), t, 0.2, 0.25, 1.1);
      return 1.3;
    },
    scouter(A, t) {
      const out = A._out('sfx', 0.18);
      for (let i = 0; i < 4; i++) A._env(A._osc(out, t + i * 0.06, 0.04, 'square', 2200 + i * 150, 2200 + i * 150), t + i * 0.06, 0.001, 0.5, 0.04);
      return 0.3;
    },
    // FUTURE TRUNKS' SWORD. A blade leaving its sheath: a rising metallic scrape and a ring
    swordDraw(A, t, o) {
      const out = A._out('sfx', 0.34 * (o.vol || 1), o.pan, 0.3);
      A._env(A._noise(out, t, 0.28, 'bandpass', 2600, 6200, 3), t, 0.02, 0.7, 0.28);
      A._env(A._osc(out, t + 0.22, 0.7, 'sine', 2480, 2470), t + 0.22, 0.002, 0.35, 0.7);
      A._env(A._osc(out, t + 0.22, 0.6, 'sine', 3710, 3700), t + 0.22, 0.002, 0.18, 0.6);
      return 0.95;
    },
    // ...and going home: a short slide and the click of the guard against the throat
    swordSheathe(A, t, o) {
      const out = A._out('sfx', 0.36 * (o.vol || 1), o.pan, 0.25);
      A._env(A._noise(out, t, 0.18, 'bandpass', 5200, 2200, 3), t, 0.01, 0.5, 0.18);
      A._env(A._noise(out, t + 0.18, 0.03, 'highpass', 5200, 5200, 1), t + 0.18, 0.001, 1, 0.03);
      A._env(A._osc(out, t + 0.18, 0.12, 'square', 1800, 1500), t + 0.18, 0.001, 0.4, 0.1);
      return 0.35;
    },
    // a cut: a thin, very fast whistle with a bright edge (quieter than a punch, sharper)
    swordSlash(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.42 * (o.vol || 1), o.pan, 0.15);
      A._env(A._noise(out, t, 0.14, 'bandpass', 1800 * p, 7200 * p, 4), t, 0.004, 0.9, 0.13);
      A._env(A._osc(out, t + 0.03, 0.2, 'sine', 3100 * p, 2600 * p), t + 0.03, 0.001, 0.22, 0.2);
      A._env(A._osc(out, t, 0.12, 'sine', 140 * p, 60), t, 0.001, 0.5, 0.12);
      return 0.3;
    },
    // steel stopped by something harder than steel (a finger, a bare hand): a hard ring
    swordClang(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.45 * (o.vol || 1), o.pan, 0.45);
      A._env(A._noise(out, t, 0.05, 'highpass', 4500, 3000, 1), t, 0.001, 1, 0.05);
      [1760, 2640, 3960].forEach((f, i) => A._env(A._osc(out, t, 0.9 - i * 0.2, 'sine', f * p, f * p * 0.998), t, 0.001, 0.4 / (i + 1), 0.9 - i * 0.2));
      return 1;
    },
    // the air torn open by a machine arriving from another time: a falling whoosh over a low hum
    timeWarp(A, t, o) {
      const out = A._out('sfx', 0.5 * (o.vol || 1), 0, 0.7);
      A._env(A._noise(out, t, 2.4, 'bandpass', 6000, 300, 1.4), t, 0.4, 0.8, 2);
      A._env(A._osc(out, t, 2.4, 'sine', 120, 45), t, 0.3, 0.7, 2.1);
      A._env(A._osc(out, t, 2.2, 'triangle', 880, 110), t, 0.2, 0.2, 2);
      return 2.6;
    },
    // a whole stadium drawing breath at once: a rising hiss of air with a murmur under it
    crowdGasp(A, t, o) {
      const out = A._out('sfx', 0.34 * (o.vol || 1), 0, 0.6);
      const n = A._noise(out, t, 1.4, 'bandpass', 900, 1700, 0.9);
      n.gain.setValueAtTime(0.0001, t);
      n.gain.linearRampToValueAtTime(1, t + 0.18);
      n.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      A._env(A._noise(out, t + 0.1, 1.2, 'lowpass', 420, 260, 1), t + 0.1, 0.2, 0.5, 1.1);
      return 1.6;
    },
    // something in a body giving way where it should not (a neck): a dry snap and a grind
    boneCrack(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.55 * (o.vol || 1), o.pan, 0.2);
      A._env(A._noise(out, t, 0.04, 'highpass', 2800 * p, 1800 * p, 1.2), t, 0.001, 1, 0.04);
      A._env(A._osc(out, t, 0.06, 'square', 220 * p, 90 * p), t, 0.001, 0.4, 0.06);
      for (let i = 1; i < 4; i++) A._env(A._noise(out, t + i * 0.035, 0.03, 'bandpass', 1500 * p, 900 * p, 3), t + i * 0.035, 0.001, 0.6 / i, 0.03);
      return 0.25;
    },
    // energy pulled out of a body into a machine: a thin whine that climbs with o.pitch over a hum
    drain(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.26 * (o.vol || 1), o.pan, 0.4);
      A._env(A._osc(out, t, 0.7, 'sawtooth', 320 * p, 520 * p), t, 0.06, 0.35, 0.64);
      A._env(A._osc(out, t, 0.7, 'sine', 70, 64), t, 0.05, 0.7, 0.65);
      A._env(A._noise(out, t, 0.7, 'bandpass', 2400 * p, 4200 * p, 4), t, 0.1, 0.25, 0.6);
      return 0.8;
    },
    // a capsule opening or closing: a soft pop and a puff
    capsulePop(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.4 * (o.vol || 1), o.pan, 0.3);
      A._env(A._osc(out, t, 0.14, 'sine', 420 * p, 180 * p), t, 0.002, 0.8, 0.14);
      A._env(A._noise(out, t, 0.5, 'lowpass', 1600 * p, 300, 0.7), t, 0.01, 0.7, 0.5);
      return 0.6;
    },
    // a rifle: a hard crack, a thump under it, and the echo off the rocks
    gunshot(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.6 * (o.vol || 1), o.pan, 0.5);
      A._env(A._noise(out, t, 0.08, 'highpass', 1800 * p, 900 * p, 0.8), t, 0.001, 1, 0.08);
      A._env(A._osc(out, t, 0.12, 'sine', 140 * p, 50), t, 0.001, 0.9, 0.12);
      A._env(A._noise(out, t + 0.16, 0.5, 'bandpass', 700 * p, 400, 1.2), t + 0.16, 0.01, 0.25, 0.5);
      return 0.7;
    },
    // a small dog: a yip (o.pitch low and slow makes it a whimper)
    bark(A, t, o) {
      const p = o.pitch || 1;
      const out = A._out('sfx', 0.3 * (o.vol || 1), o.pan, 0.2);
      A._env(A._osc(out, t, 0.12 / p, 'triangle', 900 * p, 1300 * p), t, 0.005, 0.8, 0.11 / p);
      A._env(A._noise(out, t, 0.08 / p, 'bandpass', 1600 * p, 1200 * p, 2), t, 0.005, 0.35, 0.07 / p);
      return 0.2 / p;
    },
    // steam forced out of the holes in a Majin's head: a rising hiss with a whistle in it
    steam(A, t, o) {
      const d = o.dur || 1.2, p = o.pitch || 1;
      const out = A._out('sfx', 0.32 * (o.vol || 1), o.pan, 0.4);
      A._env(A._noise(out, t, d, 'highpass', 2200 * p, 3400 * p, 0.7), t, 0.08, 0.9, d - 0.08);
      A._env(A._osc(out, t, d, 'sine', 1800 * p, 2600 * p), t, 0.2, 0.12, d - 0.2);
      return d;
    },
  };

  /* ---------------- loops ---------------- */
  function makeNoiseSrc(A) {
    const src = A.ctx.createBufferSource();
    src.buffer = A.noiseBuf;
    src.loop = true;
    src.start(0, Math.random() * 1.5);
    return src;
  }

  const LOOPS = {
    // ki charge / aura roar. set(v): intensity 0..1
    aura(A, o) {
      const ctx = A.ctx;
      const out = A._out('sfx', 0, o.pan, 0.15);
      const src = makeNoiseSrc(A);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 500;
      bp.Q.value = 0.7;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 7;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 180;
      lfo.connect(lfoG);
      lfoG.connect(bp.frequency);
      lfo.start();
      src.connect(bp);
      bp.connect(out);
      const rum = ctx.createOscillator();
      rum.type = 'sawtooth';
      rum.frequency.value = 48;
      const rumF = ctx.createBiquadFilter();
      rumF.type = 'lowpass';
      rumF.frequency.value = 160;
      const rumG = ctx.createGain();
      rumG.gain.value = 0.5;
      rum.connect(rumF);
      rumF.connect(rumG);
      rumG.connect(out);
      rum.start();
      let stopped = false;
      return {
        set(v) {
          if (stopped) return;
          const t = ctx.currentTime;
          out.gain.setTargetAtTime(U.clamp01(v) * 0.5 * (o.vol || 1), t, 0.08);
          bp.frequency.setTargetAtTime(400 + v * 900, t, 0.1);
        },
        stop(fade = 0.25) {
          if (stopped) return;
          stopped = true;
          const t = ctx.currentTime;
          out.gain.setTargetAtTime(0, t, fade / 3);
          setTimeout(() => {
            try { src.stop(); lfo.stop(); rum.stop(); out.disconnect(); } catch (e) { /* already stopped */ }
          }, fade * 1000 + 200);
        },
      };
    },

    // rising beam charge. set(v): charge 0..1
    beamCharge(A, o) {
      const ctx = A.ctx;
      const out = A._out('sfx', 0.0001, o.pan, 0.2);
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 110;
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.value = 111.5;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 300;
      lp.Q.value = 6;
      osc.connect(lp);
      osc2.connect(lp);
      const src = makeNoiseSrc(A);
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 2500;
      const ng = ctx.createGain();
      ng.gain.value = 0.3;
      src.connect(hp);
      hp.connect(ng);
      ng.connect(out);
      lp.connect(out);
      osc.start();
      osc2.start();
      // 'kame' timbre: a singing, vibrato shimmer that climbs with the charge
      let sh = null, vib = null;
      if (o.timbre === 'kame') {
        sh = ctx.createOscillator();
        sh.type = 'sine';
        sh.frequency.value = 440;
        vib = ctx.createOscillator();
        vib.frequency.value = 6;
        const vg = ctx.createGain();
        vg.gain.value = 9;
        vib.connect(vg);
        vg.connect(sh.frequency);
        const sg = ctx.createGain();
        sg.gain.value = 0.18;
        sh.connect(sg);
        sg.connect(out);
        sh.start();
        vib.start();
      }
      // 'galick' timbre: a low, growling saw with a stuttering tremolo (menacing, not singing)
      let gr = null, trem = null;
      if (o.timbre === 'galick') {
        gr = ctx.createOscillator();
        gr.type = 'sawtooth';
        gr.frequency.value = 70;
        const gg = ctx.createGain();
        gg.gain.value = 0.1;
        trem = ctx.createOscillator();
        trem.type = 'square';
        trem.frequency.value = 14;
        const tg = ctx.createGain();
        tg.gain.value = 0.06;
        trem.connect(tg);
        tg.connect(gg.gain);
        gr.connect(gg);
        gg.connect(out);
        gr.start();
        trem.start();
      }
      out.gain.setTargetAtTime(0.28 * (o.vol || 1), ctx.currentTime, 0.1);
      let stopped = false;
      return {
        set(v) {
          if (stopped) return;
          const t = ctx.currentTime;
          if (sh) {
            sh.frequency.setTargetAtTime(440 + v * 440, t, 0.08);
            vib.frequency.setTargetAtTime(6 + v * 8, t, 0.1);
          }
          if (gr) {
            gr.frequency.setTargetAtTime(70 + v * 90, t, 0.08);
            trem.frequency.setTargetAtTime(14 + v * 14, t, 0.1);
          }
          lp.frequency.setTargetAtTime(300 + v * 2600, t, 0.05);
          osc.frequency.setTargetAtTime(110 + v * 110, t, 0.05);
          osc2.frequency.setTargetAtTime(111.5 + v * 113, t, 0.05);
          hp.frequency.setTargetAtTime(2000 + v * 3000, t, 0.05);
        },
        stop(fade = 0.1) {
          if (stopped) return;
          stopped = true;
          out.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
          setTimeout(() => {
            try { osc.stop(); osc2.stop(); src.stop(); if (sh) { sh.stop(); vib.stop(); } out.disconnect(); } catch (e) { /* noop */ }
          }, fade * 1000 + 200);
        },
      };
    },

    // sustained beam roar. set(v): power 0..1.5
    beam(A, o) {
      const ctx = A.ctx;
      const out = A._out('sfx', 0.0001, o.pan, 0.35);
      const src = makeNoiseSrc(A);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1400;
      src.connect(lp);
      lp.connect(out);
      const s1 = ctx.createOscillator();
      s1.type = 'sawtooth';
      s1.frequency.value = 62;
      const s2 = ctx.createOscillator();
      s2.type = 'sawtooth';
      s2.frequency.value = 64.5;
      const sf = ctx.createBiquadFilter();
      sf.type = 'lowpass';
      sf.frequency.value = 400;
      const sg = ctx.createGain();
      sg.gain.value = 0.35;
      s1.connect(sf);
      s2.connect(sf);
      sf.connect(sg);
      sg.connect(out);
      s1.start();
      s2.start();
      const trem = ctx.createOscillator();
      trem.frequency.value = 13;
      const tg = ctx.createGain();
      tg.gain.value = 0.12;
      trem.connect(tg);
      tg.connect(out.gain);
      trem.start();
      out.gain.setTargetAtTime(0.55 * (o.vol || 1), ctx.currentTime, 0.04);
      let stopped = false;
      return {
        set(v) {
          if (stopped) return;
          lp.frequency.setTargetAtTime(900 + v * 1600, ctx.currentTime, 0.05);
        },
        stop(fade = 0.35) {
          if (stopped) return;
          stopped = true;
          out.gain.cancelScheduledValues(ctx.currentTime);
          out.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
          setTimeout(() => {
            try { src.stop(); s1.stop(); s2.stop(); trem.stop(); out.disconnect(); } catch (e) { /* noop */ }
          }, fade * 1000 + 300);
        },
      };
    },

    // wind while flying fast. set(v): speed 0..1
    wind(A, o) {
      const ctx = A.ctx;
      const out = A._out('sfx', 0.0001, 0);
      const src = makeNoiseSrc(A);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 600;
      bp.Q.value = 0.5;
      src.connect(bp);
      bp.connect(out);
      let stopped = false;
      return {
        set(v) {
          if (stopped) return;
          const t = ctx.currentTime;
          out.gain.setTargetAtTime(U.clamp01(v) * 0.22, t, 0.15);
          bp.frequency.setTargetAtTime(500 + v * 1400, t, 0.15);
        },
        stop() {
          if (stopped) return;
          stopped = true;
          out.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
          setTimeout(() => { try { src.stop(); out.disconnect(); } catch (e) { /* noop */ } }, 500);
        },
      };
    },
  };

  Audio.SFX = SFX;
  Audio.LOOPS = LOOPS;
})();
