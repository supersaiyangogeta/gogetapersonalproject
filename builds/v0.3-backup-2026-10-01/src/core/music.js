/*
 * Music: a small step sequencer with synthesized instruments and dynamic
 * intensity layers (0 calm → 3 climax). All melodies are original.
 * PROTOTYPE MUSIC — a composed soundtrack can replace this module later
 * while keeping the same API: play(song), setIntensity(n), stinger(name).
 */
(function () {
  'use strict';
  const U = SL.util;

  const NOTE_BASE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function noteToMidi(n) {
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    if (!m) return null;
    return NOTE_BASE[m[1]] + (Number(m[2]) + 1) * 12;
  }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const parseBar = (s) => s.trim().split(/\s+/).map((tok) => (tok === '.' ? null : noteToMidi(tok)));

  const MAJ = [0, 4, 7], MIN = [0, 3, 7];

  const SONGS = {
    menu: {
      bpm: 92,
      chords: [[45, MIN], [41, MAJ], [48, MAJ], [43, MAJ]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, null, 7, null, null, null],
      arp: true,
      lead: [
        'E5 . . . . . . . A5 . . . G5 . . .',
        'F5 . . . . . . . C5 . . . . . . .',
        'E5 . . . G5 . . . C6 . . . B5 . . .',
        'D5 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x.......x.......', snare: '............x...', hat: '....x.......x...' },
      leadType: 'bell',
    },
    battle: {
      bpm: 152,
      chords: [[40, MIN], [36, MAJ], [38, MAJ], [35, MAJ], [45, MIN], [40, MIN], [36, MAJ], [38, MAJ]],
      bass: [0, null, 0, null, 12, null, 0, null, 0, null, 0, null, 12, null, 7, null],
      lead: [
        'E5 . . . B4 . E5 . G5 . . . F#5 . E5 .',
        'E5 . . . D5 . C5 . B4 . . . . . . .',
        'D5 . . . A4 . D5 . F#5 . . . E5 . D5 .',
        'D#5 . . . . . F#5 . B5 . . . . . . .',
        'A5 . . . G5 . E5 . C5 . . . E5 . A5 .',
        'G5 . . . F#5 . E5 . B4 . . . . . . .',
        'C5 . E5 . G5 . C6 . B5 . G5 . E5 . C5 .',
        'D5 . F#5 . A5 . D6 . . . . . B5 . . .',
      ],
      drums: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'lead',
    },
    finale: {
      bpm: 132,
      chords: [[38, MIN], [34, MAJ], [36, MAJ], [33, MAJ]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 12, null, null],
      lead: [
        'A5 . . . . . . . D6 . . . C6 . . .',
        'Bb5 . . . . . . . F5 . . . . . . .',
        'G5 . . . A5 . . . Bb5 . . . C6 . . .',
        'C#6 . . . . . . . A5 . . . . . . .',
      ],
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: '..x...x...x...x.', tom: 'x..x..x.........' },
      power: true,
      leadType: 'choir',
    },
    orbit: {
      bpm: 76,
      chords: [[38, MIN], [37, MAJ], [38, MIN], [34, MAJ]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      lead: [
        'D5 . . . . . . . . . . . F5 . . .',
        'E5 . . . . . . . . . . . . . . .',
        'A5 . . . . . . . G5 . . . F5 . . .',
        'F5 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x...............', snare: '................', hat: '................', tom: '........x.......' },
      leadType: 'choir',
    },
    // Bardock's vision: slow bell arpeggios, no drums
    vision: {
      bpm: 66,
      chords: [[50, MAJ], [45, MAJ], [47, MIN], [43, MAJ]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      arp: true,
      lead: [
        'F#5 . . . . . . . A5 . . . . . . .',
        'E5 . . . . . . . C#5 . . . . . . .',
        'D5 . . . F#5 . . . B5 . . . . . . .',
        'A5 . . . . . . . G5 . . . . . . .',
      ],
      drums: { kick: '................', snare: '................', hat: '................' },
      leadType: 'bell',
    },
    // Bardock's farewell: a hopeful choir that swells into the end of Planet Vegeta
    farewell: {
      bpm: 72,
      chords: [[43, MAJ], [38, MAJ], [40, MIN], [45, MAJ]],
      bass: [0, null, null, null, null, null, null, null, 7, null, null, null, null, null, null, null],
      lead: [
        'B5 . . . . . . . A5 . . . G5 . . .',
        'F#5 . . . . . . . D5 . . . . . . .',
        'E5 . . . G5 . . . B5 . . . A5 . . .',
        'A5 . . . . . . . C#6 . . . . . . .',
      ],
      drums: { kick: 'x.......x.......', snare: '................', hat: '................', tom: '........x.......' },
      power: true,
      leadType: 'choir',
    },
  };
  for (const s of Object.values(SONGS)) s.leadParsed = s.lead.map(parseBar);

  const STINGERS = {
    victory: { bpm: 150, notes: [['C5', 0, 1], ['E5', 1, 1], ['G5', 2, 1], ['C6', 3, 5]], chord: [60, 64, 67, 72] },
    defeat: { bpm: 90, notes: [['E5', 0, 2], ['D5', 2, 2], ['C5', 4, 2], ['B4', 6, 6]], chord: [47, 50, 54] },
    unlock: { bpm: 180, notes: [['G5', 0, 1], ['C6', 1, 1], ['E6', 2, 1], ['G6', 3, 4]], chord: [72, 76, 79] },
    dawn: { bpm: 80, notes: [['D5', 0, 2], ['F#5', 2, 2], ['A5', 4, 2], ['D6', 6, 8]], chord: [62, 66, 69, 74] },
  };

  const Music = (SL.Music = {
    A: null,
    song: null,
    songId: null,
    intensity: 1,
    targetIntensity: 1,
    step: 0,
    bar: 0,
    nextTime: 0,
    timer: null,
    distCurve: null,

    attach(audio) {
      this.A = audio;
      const n = 512, curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = ((Math.PI + 60) * x) / (Math.PI + 60 * Math.abs(x));
      }
      this.distCurve = curve;
      if (this._pending) {
        const p = this._pending;
        this._pending = null;
        this.play(p.id, p.opts);
      }
    },

    play(id, opts = {}) {
      if (!this.A || !this.A.ctx) {
        this._pending = { id, opts };
        return;
      }
      if (opts.intensity !== undefined) this.targetIntensity = opts.intensity;
      if (this.songId === id && this.timer) return;
      const ctx = this.A.ctx;
      const gain = this.A.musicIn.gain;
      const start = () => {
        this.song = SONGS[id];
        this.songId = id;
        this.step = 0;
        this.bar = 0;
        this.intensity = this.targetIntensity;
        this.nextTime = ctx.currentTime + 0.08;
        gain.cancelScheduledValues(ctx.currentTime);
        gain.setTargetAtTime(1, ctx.currentTime, 0.3);
        if (!this.timer) this.timer = setInterval(() => this._schedule(), 25);
      };
      if (this.timer && this.song) {
        gain.setTargetAtTime(0, ctx.currentTime, 0.25);
        clearTimeout(this._switchTimer);
        this._switchTimer = setTimeout(start, 700);
      } else start();
    },

    stop(fade = 0.8) {
      this._pending = null;
      if (!this.A || !this.A.ctx) return;
      const ctx = this.A.ctx;
      this.A.musicIn.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
      clearTimeout(this._switchTimer);
      this._switchTimer = setTimeout(() => {
        clearInterval(this.timer);
        this.timer = null;
        this.song = null;
        this.songId = null;
      }, fade * 1000 + 100);
    },

    /** Layers change on the next bar so transitions stay musical. */
    setIntensity(n) {
      this.targetIntensity = U.clamp(Math.round(n), 0, 3);
    },

    stinger(name) {
      if (!this.A || !this.A.ctx) return;
      const st = STINGERS[name];
      if (!st) return;
      const ctx = this.A.ctx;
      const t0 = ctx.currentTime + 0.05;
      const stepDur = 60 / st.bpm / 2;
      const out = ctx.createGain();
      out.gain.value = 0.5;
      out.connect(this.A.buses.music);
      for (const [n, s, len] of st.notes) this._lead(out, t0 + s * stepDur, noteToMidi(n), len * stepDur, 'lead', 1.4);
      const last = st.notes[st.notes.length - 1];
      this._pad(out, t0 + last[1] * stepDur, st.chord, last[2] * stepDur * 1.6, 1.2);
    },

    _schedule() {
      const A = this.A;
      if (!A || !this.song) return;
      const ctx = A.ctx;
      const song = this.song;
      const stepDur = 60 / song.bpm / 4;
      while (this.nextTime < ctx.currentTime + 0.12) {
        this._playStep(song, this.bar, this.step, this.nextTime, stepDur);
        this.nextTime += stepDur;
        this.step++;
        if (this.step >= 16) {
          this.step = 0;
          this.bar = (this.bar + 1) % song.chords.length;
          this.intensity = this.targetIntensity;
        }
      }
    },

    _playStep(song, bar, step, t, stepDur) {
      const A = this.A;
      const out = A.musicIn;
      const lvl = this.intensity;
      const [root, quality] = song.chords[bar % song.chords.length];
      const barDur = stepDur * 16;

      if (step === 0) this._pad(out, t, quality.map((iv) => root + 24 + iv), barDur * 1.02, lvl >= 2 ? 0.8 : 1);
      const b = song.bass[step];
      if (b !== null && b !== undefined) this._bass(out, t, root + b, stepDur * (lvl >= 1 ? 1.8 : 3));

      if (song.arp && step % 2 === 0) {
        const tones = quality.map((iv) => root + 36 + iv).concat([root + 48]);
        const idx = [0, 1, 2, 3, 2, 1, 0, 1][(step / 2) % 8];
        this._lead(out, t, tones[idx], stepDur * 1.6, 'pluck', 0.55);
      }

      if (lvl >= 1) {
        const d = song.drums;
        const isFillBar = bar % 4 === 3 && lvl >= 3 && d.fill;
        if (d.kick[step] === 'x') this._kick(out, t);
        if (d.snare[step] === 'x') this._snare(out, t);
        const hatPat = isFillBar ? d.fill : d.hat;
        if (hatPat[step] === 'x') this._hat(out, t, lvl >= 3 ? 0.14 : 0.1);
        if (lvl >= 3 && step % 2 === 1 && !song.arp) this._hat(out, t, 0.05);
        if (d.tom && d.tom[step] === 'x' && lvl >= 2) this._tom(out, t, root + 12);
      }
      if (lvl >= 2) {
        const note = song.leadParsed[bar % song.leadParsed.length][step];
        if (note !== null && note !== undefined) {
          let len = 1;
          const barNotes = song.leadParsed[bar % song.leadParsed.length];
          while (step + len < 16 && barNotes[step + len] === null) len++;
          this._lead(out, t, note, stepDur * Math.min(len, 8), song.leadType, 1);
        }
      }
      if (lvl >= 3 && song.power && (step === 0 || step === 8 || step === 11)) {
        this._power(out, t, root + 12, stepDur * (step === 11 ? 2.5 : 3));
      }
    },

    _kick(out, t) {
      const ctx = this.A.ctx;
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g);
      g.connect(out);
      o.start(t);
      o.stop(t + 0.25);
    },
    _snare(out, t) {
      const A = this.A;
      const g = A._noise(out, t, 0.16, 'bandpass', 1900, 1500, 0.8);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      const o = A._osc(out, t, 0.08, 'triangle', 220, 160);
      o.gain.setValueAtTime(0.3, t);
      o.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    },
    _hat(out, t, vol) {
      const g = this.A._noise(out, t, 0.04, 'highpass', 7500, 7500, 0.5);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    },
    _tom(out, t, midi) {
      const o = this.A._osc(out, t, 0.35, 'sine', mtof(midi), mtof(midi) * 0.55);
      o.gain.setValueAtTime(0.55, t);
      o.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    },
    _bass(out, t, midi, dur) {
      const ctx = this.A.ctx;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = mtof(midi);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(900, t);
      f.frequency.exponentialRampToValueAtTime(220, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(f);
      f.connect(g);
      g.connect(out);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    _lead(out, t, midi, dur, type, vol = 1) {
      const ctx = this.A.ctx;
      const freq = mtof(midi);
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      const oscs = [];
      if (type === 'bell' || type === 'pluck') {
        const o = ctx.createOscillator();
        o.type = type === 'bell' ? 'sine' : 'triangle';
        o.frequency.value = freq;
        oscs.push(o);
        if (type === 'bell') {
          const o2 = ctx.createOscillator();
          o2.type = 'sine';
          o2.frequency.value = freq * 2.01;
          oscs.push(o2);
        }
        f.frequency.value = 4000;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16 * vol, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(dur, 0.35));
      } else if (type === 'choir') {
        for (const det of [-6, 0, 7]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = freq;
          o.detune.value = det;
          oscs.push(o);
        }
        f.frequency.value = 1500;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.06 * vol, t + 0.18);
        g.gain.setValueAtTime(0.06 * vol, t + dur * 0.8);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.25);
      } else {
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = freq;
        const o2 = ctx.createOscillator();
        o2.type = 'sawtooth';
        o2.frequency.value = freq;
        o2.detune.value = 8;
        const vib = ctx.createOscillator();
        vib.frequency.value = 5.5;
        const vg = ctx.createGain();
        vg.gain.value = 6;
        vib.connect(vg);
        vg.connect(o.detune);
        vib.start(t);
        vib.stop(t + dur + 0.2);
        oscs.push(o, o2);
        f.frequency.value = 2600;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.075 * vol, t + 0.01);
        g.gain.setValueAtTime(0.07 * vol, t + dur * 0.85);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.08);
      }
      for (const o of oscs) {
        o.connect(f);
        o.start(t);
        o.stop(t + dur + 0.6);
      }
      f.connect(g);
      g.connect(out);
    },
    _pad(out, t, notes, dur, vol = 1) {
      const ctx = this.A.ctx;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 1100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.045 * vol, t + 0.25);
      g.gain.setValueAtTime(0.045 * vol, t + dur - 0.15);
      g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.2);
      for (const m of notes) {
        for (const det of [-9, 9]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = mtof(m);
          o.detune.value = det;
          o.connect(f);
          o.start(t);
          o.stop(t + dur + 0.3);
        }
      }
      f.connect(g);
      g.connect(out);
    },
    _power(out, t, midi, dur) {
      const ctx = this.A.ctx;
      const ws = ctx.createWaveShaper();
      ws.curve = this.distCurve;
      const pre = ctx.createGain();
      pre.gain.value = 0.6;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 2200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      for (const iv of [0, 7, 12]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = mtof(midi + iv);
        o.connect(pre);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
      pre.connect(ws);
      ws.connect(f);
      f.connect(g);
      g.connect(out);
    },
  });

  Music.SONGS = SONGS;
  Music.noteToMidi = noteToMidi;
})();
