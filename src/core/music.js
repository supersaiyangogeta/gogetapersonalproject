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

  /*
   * THE WIDER SOUNDTRACK (2026-10-03). Every song above is kept exactly as it was; these are new, original
   * tracks that fit beside them. They use the same sequencer, plus voices the first six never needed
   * (brass, strings, flute, piano, a plain saw), an optional counter-melody that enters at intensity 3
   * (counter / counterType / counterLevel) and an optional sub bass (bassType: 'sub').
   *   story      peaceful · mystery · journey · aftermath
   *   battle     clash (standard) · desperate · boss · climax (final) · ascend (transformation) · overwhelm
   *   character  goku_theme · vegeta_theme · frieza_theme · cell_theme · buu_theme · kid_buu · vegito_theme
   *   emotion    bittersweet (Goodbye, Buu) · pride (Vegeta's pride and sacrifice)
   * Battle intensity is the engine's own: 0 calm, 1 drums, 2 the melody, 3 power chords and the counter.
   */
  const MAJ7 = [0, 4, 7, 11], MIN7 = [0, 3, 7, 10], DOM7 = [0, 4, 7, 10], SUS4 = [0, 5, 7], DIM = [0, 3, 6], AUG = [0, 4, 8];
  const R16 = '. . . . . . . . . . . . . . .';
  const hold = (n) => n + ' ' + R16; // one long note for the bar
  Object.assign(SONGS, {
    // a peaceful world: a flute over an arpeggio, a kick that only breathes
    peaceful: {
      bpm: 96,
      chords: [[41, MAJ7], [38, MIN7], [34, MAJ], [36, SUS4]],
      bass: [0, null, null, null, null, null, 7, null, 12, null, null, null, 7, null, null, null],
      arp: true,
      lead: [
        'A5 . . . C6 . . . A5 . G5 . F5 . . .',
        'D5 . . . F5 . . . A5 . . . G5 . . .',
        'F5 . . . D5 . . . Bb4 . . . D5 . F5 .',
        'G5 . . . . . . . E5 . . . C5 . . .',
      ],
      drums: { kick: 'x.......x.......', snare: '................', hat: '..x...x...x...x.' },
      leadType: 'flute',
    },
    // something is wrong here: a flat second under the minor, a bell, almost no drums
    mystery: {
      bpm: 84,
      chords: [[45, MIN], [46, MAJ], [45, MIN], [40, SUS4]],
      bass: [0, null, null, null, 0, null, null, null, 0, null, null, null, 0, null, null, null],
      bassType: 'sub',
      lead: [
        'E5 . . . . . . . F5 . . . E5 . . .',
        'D5 . . . . . . . . . . . Bb4 . . .',
        'C5 . . . E5 . . . A5 . . . G#5 . . .',
        'B4 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x...............', snare: '................', hat: '......x.......x.', tom: '..........x.....' },
      leadType: 'bell',
    },
    // the road: strings over a steady eight, a choir under the climb
    journey: {
      bpm: 104,
      chords: [[38, MAJ], [45, MAJ], [47, MIN], [43, MAJ], [38, MAJ], [42, MIN], [43, MAJ], [45, SUS4]],
      bass: [0, null, null, null, 7, null, null, null, 12, null, null, null, 7, null, null, null],
      lead: [
        'F#5 . . . . . A5 . D6 . . . C#6 . . .',
        'E5 . . . . . . . A5 . . . . . . .',
        'B5 . . . A5 . . . F#5 . . . D5 . . .',
        'G5 . . . . . F#5 . E5 . . . . . . .',
        'F#5 . . . A5 . . . D6 . . . E6 . . .',
        'F#6 . . . . . E6 . C#6 . . . . . . .',
        'D6 . . . B5 . . . G5 . . . B5 . . .',
        'A5 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('A4'), hold('C#5'), hold('D5'), hold('B4'), hold('A4'), hold('A4'), hold('B4'), hold('C#5')],
      counterType: 'choir',
      drums: { kick: 'x.......x.x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '..............x.' },
      leadType: 'strings',
    },
    // after it: a piano, minor sevenths, nothing hurrying
    aftermath: {
      bpm: 64,
      chords: [[40, MIN7], [36, MAJ7], [43, MAJ], [38, SUS4]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      arp: true,
      lead: [
        'B4 . . . E5 . . . G5 . . . F#5 . E5 .',
        'D5 . . . . . . . C5 . . . B4 . . .',
        'B4 . . . D5 . . . G5 . . . A5 . B5 .',
        'A5 . . . . . . . F#5 . . . . . . .',
      ],
      drums: { kick: '................', snare: '................', hat: '................' },
      leadType: 'piano',
    },
    // a standard fight: brass, a driving bass, the snare on two and four
    clash: {
      bpm: 154,
      chords: [[43, MIN], [39, MAJ], [41, MAJ], [38, MAJ]],
      bass: [0, null, 0, 0, null, 0, 12, null, 0, null, 0, 0, null, 0, 10, null],
      lead: [
        'G5 . . . D5 . G5 . A5 . Bb5 . A5 . G5 .',
        'Bb5 . . . . . G5 . Eb5 . . . . . . .',
        'F5 . . . C5 . F5 . A5 . C6 . Bb5 . A5 .',
        'F#5 . . . A5 . . . D5 . . . . . . .',
      ],
      drums: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x...x...x.x.xxxx' },
      power: true,
      leadType: 'brass',
    },
    // losing: strings that will not stop climbing, brass holding the line under them
    desperate: {
      bpm: 142,
      chords: [[36, MIN], [32, MAJ], [34, MAJ], [31, DOM7]],
      bass: [0, 0, null, 0, 0, null, 0, null, 0, 0, null, 0, 0, null, 7, null],
      lead: [
        'C5 . Eb5 . G5 . . . F5 . Eb5 . D5 . . .',
        'Eb5 . . . C5 . . . Ab4 . . . . . . .',
        'D5 . F5 . Bb5 . . . Ab5 . G5 . F5 . . .',
        'G5 . . . B4 . . . D5 . F5 . . . . .',
      ],
      counter: ['G4 . . . . . . . G4 . . . . . . .', 'Ab4 . . . . . . . Eb4 . . . . . . .', 'F4 . . . . . . . Bb4 . . . . . . .', 'B4 . . . . . . . D5 . . . . . . .'],
      counterType: 'brass',
      drums: { kick: 'x..x..x...x..x..', snare: '....x.......x...', hat: 'xxx.xxx.xxx.xxx.', tom: 'x.........x.....', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'strings',
    },
    // a boss: phrygian, a choir on top, brass hammering the flat second
    boss: {
      bpm: 138,
      chords: [[40, MIN], [41, MAJ], [40, MIN], [38, MAJ], [40, MIN], [41, MAJ], [43, MAJ], [41, MAJ]],
      bass: [0, null, 0, null, 1, null, 0, null, 0, null, 0, null, 1, null, 3, null],
      lead: [
        'E5 . . . . . F5 . E5 . . . B4 . . .',
        'C5 . . . . . . . A4 . . . . . . .',
        'E5 . . . . . F5 . G5 . . . F5 . E5 .',
        'D5 . . . . . . . F#5 . . . . . . .',
        'B5 . . . . . C6 . B5 . . . G5 . . .',
        'A5 . . . . . . . F5 . . . . . . .',
        'G5 . . . A5 . . . B5 . . . D6 . . .',
        'C6 . . . . . . . . . . . . . . .',
      ],
      counter: ['E4 . . . E4 . . . E4 . . . E4 . F4 .', 'F4 . . . . . . . C4 . . . . . . .', 'E4 . . . E4 . . . E4 . . . E4 . F4 .', 'D4 . . . . . . . F#4 . . . . . . .'],
      counterType: 'brass',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: 'x.x.......x.x...', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'choir',
    },
    // the last fight: everything at once, brass on the tune, the choir under it
    climax: {
      bpm: 164,
      chords: [[45, MIN], [41, MAJ], [36, MAJ], [43, MAJ], [45, MIN], [41, MAJ], [43, MAJ], [40, MAJ]],
      bass: [0, null, 0, 12, 0, null, 0, 12, 0, null, 0, 12, 0, null, 7, 12],
      lead: [
        'A5 . . . E5 . A5 . C6 . . . B5 . A5 .',
        'F5 . . . . . A5 . C6 . . . A5 . . .',
        'G5 . . . E5 . G5 . C6 . . . E6 . . .',
        'D6 . . . . . B5 . G5 . . . . . . .',
        'A5 . C6 . E6 . . . D6 . C6 . B5 . . .',
        'C6 . . . A5 . . . F5 . . . A5 . . .',
        'B5 . . . D6 . . . G6 . . . F6 . E6 .',
        'E6 . . . . . . . G#5 . . . . . . .',
      ],
      counter: ['C5 . . . . . . . E5 . . . . . . .', 'C5 . . . . . . . F5 . . . . . . .', 'E5 . . . . . . . G5 . . . . . . .', 'D5 . . . . . . . B4 . . . . . . .'],
      counterType: 'choir',
      drums: { kick: 'x.x...x.x.x...x.', snare: '....x.......x...', hat: 'x.xxx.xxx.xxx.xx', tom: 'x...x...x...xxxx', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // a transformation: an arpeggio that keeps climbing a key at a time, the toms rolling in
    ascend: {
      bpm: 120,
      chords: [[38, MIN], [41, MAJ], [43, MAJ], [45, MAJ]],
      bass: [0, null, 0, null, 0, null, 0, null, 0, 0, 0, 0, 0, 0, 0, 0],
      arp: true,
      lead: [
        'D5 . F5 . A5 . D6 . A5 . F5 . A5 . D6 .',
        'F5 . A5 . C6 . F6 . C6 . A5 . C6 . F6 .',
        'G5 . B5 . D6 . G6 . D6 . B5 . D6 . G6 .',
        'A5 . C#6 . E6 . A6 . . . . . . . . .',
      ],
      drums: { kick: 'x...x...x...x...', snare: '................', hat: '..x...x...x...x.', tom: '............xxxx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // something far stronger than you: slow, low brass, a diminished choir, a heartbeat kick
    overwhelm: {
      bpm: 96,
      chords: [[35, MIN], [36, MAJ], [33, DIM], [35, SUS4]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, 1, null, null, 0, null],
      bassType: 'sub',
      lead: [
        'B4 . . . . . . . C5 . . . B4 . . .',
        'E5 . . . . . . . . . . . D5 . . .',
        'C5 . . . . . Eb5 . . . . . D5 . . .',
        'F#4 . . . . . . . . . . . . . . .',
      ],
      counter: ['D5 . . . . . . . E5 . . . . . . .', hold('G5'), hold('Eb5'), hold('E5')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x..x....', snare: '........x.......', hat: '................', tom: 'x...........x...' },
      power: true,
      leadType: 'brass',
    },
    // Goku: open, heroic, mixolydian; brass on the tune, the choir answering
    goku_theme: {
      bpm: 140,
      chords: [[43, MAJ], [41, MAJ], [36, MAJ], [43, MAJ], [40, MIN], [36, MAJ], [38, MAJ], [38, SUS4]],
      bass: [0, null, 0, null, 7, null, 0, null, 0, null, 0, null, 7, null, 12, null],
      lead: [
        'G5 . . . D5 . G5 . B5 . . . A5 . G5 .',
        'F5 . . . . . A5 . C6 . . . . . . .',
        'E5 . . . G5 . C6 . E6 . . . D6 . C6 .',
        'B5 . . . . . . . D5 . . . . . . .',
        'B5 . . . G5 . E5 . G5 . B5 . E6 . . .',
        'E6 . . . . . D6 . C6 . . . G5 . . .',
        'F#5 . . . A5 . . . D6 . . . C6 . A5 .',
        'G5 . . . . . . . . . . . . . . .',
      ],
      counter: ['B4 . . . . . . . D5 . . . . . . .', 'C5 . . . . . . . A4 . . . . . . .', 'C5 . . . . . . . G4 . . . . . . .', 'D5 . . . . . . . B4 . . . . . . .'],
      counterType: 'choir',
      drums: { kick: 'x...x.x.x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // Vegeta: proud, F minor that lifts to its own major chords; brass with strings held under it
    vegeta_theme: {
      bpm: 136,
      chords: [[41, MIN], [37, MAJ], [39, MAJ], [36, MAJ]],
      bass: [0, null, 0, null, 0, 0, null, 0, 0, null, 0, null, 0, 0, 7, null],
      lead: [
        'F5 . . . C5 . F5 . Ab5 . . . G5 . F5 .',
        'Db6 . . . . . C6 . Ab5 . . . . . . .',
        'Bb5 . . . G5 . Eb5 . G5 . Bb5 . Eb6 . . .',
        'E6 . . . . . . . C6 . . . . . . .',
      ],
      counter: [hold('C5'), hold('F5'), hold('G5'), 'G5 . . . . . . . E5 . . . . . . .'],
      counterType: 'strings',
      drums: { kick: 'x...x.x.x...x.x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // Frieza: cold; a bell over an augmented chord, a choir like a draught, the Neapolitan at the end
    frieza_theme: {
      bpm: 108,
      chords: [[37, MIN], [36, AUG], [37, MIN], [38, MAJ]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 1, null, null, 0, null],
      bassType: 'sub',
      lead: [
        'G#5 . . . . . A5 . G#5 . . . E5 . . .',
        'G5 . . . . . . . E5 . . . C5 . . .',
        'C#6 . . . B5 . . . G#5 . . . E5 . . .',
        'F#5 . . . . . . . D5 . . . . . . .',
      ],
      counter: [hold('E4'), hold('E4'), hold('E4'), hold('F#4')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.........x.....', snare: '........x.......', hat: '..x...x...x...x.', tom: '..............x.' },
      leadType: 'bell',
    },
    // Cell: controlled, an ostinato that never changes while everything over it gets worse
    cell_theme: {
      bpm: 118,
      chords: [[45, MIN], [45, MIN], [46, MAJ], [44, DIM]],
      bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 1, null, 12, null],
      arp: true,
      lead: [
        'A4 . . . . . . . C5 . . . B4 . . .',
        'A4 . . . E5 . . . . . . . D5 . . .',
        'D5 . . . F5 . . . Bb5 . . . A5 . . .',
        'G#5 . . . . . . . F5 . . . D5 . . .',
      ],
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '.x.x.x.x.x.x.x.x', tom: '.........x......' },
      power: true,
      leadType: 'saw',
    },
    // Majin Buu: a bouncing bass, a bell that sounds like a toy, and the flat second that says it is not one
    buu_theme: {
      bpm: 128,
      chords: [[38, MIN], [37, MAJ], [38, MIN], [33, DOM7]],
      bass: [0, null, 7, null, 12, null, 7, null, 0, null, 7, null, 12, null, 11, null],
      lead: [
        'D5 . F5 . A5 . F5 . D5 . . . C#5 . D5 .',
        'F5 . . . E5 . . . Db5 . . . . . . .',
        'A5 . G5 . F5 . E5 . F5 . G5 . A5 . . .',
        'G5 . . . E5 . . . C#5 . . . A4 . . .',
      ],
      drums: { kick: 'x...x...x...x...', snare: '..x...x...x...x.', hat: 'x.x.x.x.x.x.x.x.', tom: '..............x.' },
      leadType: 'bell',
    },
    // Kid Buu: no plan — tritones, kicks in the wrong places, a square lead that will not sit still
    kid_buu: {
      bpm: 168,
      chords: [[40, MIN], [46, MAJ], [40, MIN], [46, DIM]],
      bass: [0, 0, null, 6, null, 0, 12, null, 0, null, 6, 6, null, 12, null, 1],
      lead: [
        'E5 . G5 B5 . A#5 . . E6 . . D6 . A#5 . .',
        'F5 . D5 . F5 . A#5 . D6 . C#6 . . . . .',
        'B5 . A#5 . G5 . E5 . . . G5 . A#5 B5 . .',
        'C#6 . . . E5 . . . A#4 . . . E5 . . .',
      ],
      drums: { kick: 'x..x.x...x..x.x.', snare: '...x...x....x..x', hat: 'xx.xx.xx.xx.xx.x', tom: 'x.....x.....x...', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'lead',
    },
    // Vegito: cocky, swinging, major with a flat seventh, brass that knows it has already won
    vegito_theme: {
      bpm: 150,
      chords: [[45, MAJ], [43, MAJ], [38, MAJ], [45, MAJ], [45, MAJ], [43, MAJ], [40, DOM7], [45, MAJ]],
      bass: [0, null, null, 0, null, 0, null, null, 7, null, null, 7, null, 10, null, 12],
      lead: [
        'A5 . . C#6 . E6 . . D6 . C#6 . A5 . . .',
        'B5 . . . G5 . . . A5 . B5 . D6 . . .',
        'F#5 . . A5 . D6 . . C#6 . A5 . F#5 . . .',
        'E5 . . . . . A5 . C#6 . . . E6 . . .',
        'A6 . . . G6 . E6 . C#6 . . . E6 . . .',
        'D6 . . . B5 . G5 . B5 . D6 . G6 . . .',
        'G#5 . . B5 . D6 . . E6 . . . D6 . B5 .',
        'A5 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.x.xxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // Gogeta: energetic, heroic, sure of itself — E major with a swaggering flat seven (D), brass
    // over strings, a kick that drives on the off-beats. Explosive at intensity 3 (power chords and
    // the string counter), only drums and bass at 1, so it can breathe under an intro.
    gogeta_theme: {
      bpm: 166,
      chords: [[40, MAJ], [38, MAJ], [45, MAJ], [40, MAJ], [37, MIN], [45, MAJ], [47, DOM7], [40, MAJ]],
      bass: [0, null, 0, null, 7, null, 0, 12, null, 0, null, 7, null, 10, 12, null],
      lead: [
        'E5 . B5 . E6 . . D#6 E6 . F#6 . G#6 . . .',
        'F#6 . . E6 D6 . . . A5 . D6 . F#6 . . .',
        'E6 . . C#6 . A5 . . B5 . C#6 . E6 . . .',
        'G#5 . . . . . B5 . E6 . . . . . . .',
        'E6 . G#6 . . F#6 E6 . C#6 . . . E6 . . .',
        'A6 . . G#6 F#6 . E6 . C#6 . . . E6 . F#6 .',
        'F#6 . . . D#6 . . . B5 . . . F#6 . A6 .',
        'G#6 . . . . . . . E6 . . . . . . .',
      ],
      counter: [hold('B4'), hold('A4'), hold('C#5'), hold('B4'), hold('G#4'), hold('C#5'), hold('D#5'), hold('E5')],
      counterType: 'strings',
      drums: { kick: 'x...x..x..x.x...', snare: '....x.......x..x', hat: 'x.xxx.xxx.xxx.xx', tom: '..............xx', fill: 'x.x.xxx.x.xxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // Goodbye, Buu: bittersweet — major, with the minor four that makes it hurt; strings and a choir
    bittersweet: {
      bpm: 80,
      chords: [[36, MAJ], [40, MIN], [41, MAJ], [41, MIN], [36, MAJ], [45, MIN], [38, MIN7], [43, SUS4]],
      bass: [0, null, null, null, null, null, null, null, 7, null, null, null, null, null, null, null],
      arp: true,
      lead: [
        'E5 . . . . . G5 . C6 . . . . . B5 .',
        'B5 . . . . . . . G5 . . . . . . .',
        'A5 . . . . . C6 . F6 . . . E6 . . .',
        'Ab5 . . . . . . . . . . . . . . .',
        'G5 . . . . . E5 . C5 . . . E5 . G5 .',
        'C6 . . . . . . . A5 . . . . . . .',
        'F5 . . . . . A5 . C6 . . . . . B5 .',
        'D6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('C5'), hold('D5'), hold('C5'), hold('C5'), hold('E5'), hold('E5'), hold('F5'), hold('G5')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '................', hat: '................', tom: '..............x.' },
      leadType: 'strings',
    },
    // pride: Bb minor rising through its own flat chords to a major dominant; strings and choir, heavy
    pride: {
      bpm: 70,
      chords: [[34, MIN], [42, MAJ], [44, MAJ], [41, MAJ]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, null, 7, null, null, null],
      lead: [
        'F5 . . . . . . . Db6 . . . C6 . Bb5 .',
        'Bb5 . . . . . . . Gb5 . . . . . . .',
        'Ab5 . . . C6 . . . Eb6 . . . Db6 . C6 .',
        'C6 . . . . . . . A5 . . . . . . .',
      ],
      counter: [hold('Db5'), hold('Db5'), hold('Eb5'), hold('F5')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '........x.......', hat: '................', tom: 'x...........x.x.' },
      power: true,
      leadType: 'strings',
    },
    /*
     * THE END OF Z (2026-10-03): three more, each its own feeling — not the Goodbye, Buu one again.
     *   uub_theme      a boy from the south: a flute over hand drums, earnest, a little unsure of itself
     *   tenkaichi      the World Tournament on a sunny day: brass and a marching snare, a crowd's music
     *   next_journey   the ending — hope, not goodbye: strings rising in G major, a choir on top, the
     *                  power chords only when the two of them are in the sky (intensity 3)
     */
    uub_theme: {
      bpm: 112,
      chords: [[38, MAJ], [47, MIN], [43, MAJ], [45, SUS4], [38, MAJ], [47, MIN7], [40, MIN7], [45, MAJ]],
      bass: [0, null, null, 0, null, null, 7, null, 0, null, null, 0, null, 7, null, null],
      arp: true,
      lead: [
        'F#5 . A5 . B5 . A5 . F#5 . . . E5 . D5 .',
        'F#5 . . . . . . . D5 . E5 . F#5 . . .',
        'B5 . . . A5 . B5 . D6 . . . B5 . A5 .',
        'A5 . . . . . . . E5 . . . . . . .',
        'F#5 . A5 . B5 . A5 . D6 . . . B5 . A5 .',
        'B5 . . . A5 . F#5 . E5 . . . D5 . . .',
        'E5 . F#5 . G5 . . . B5 . . . A5 . . .',
        'A5 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('A4'), hold('F#4'), hold('B4'), hold('A4'), hold('A4'), hold('F#4'), hold('G4'), hold('E4')],
      counterType: 'strings',
      counterLevel: 2,
      drums: { kick: 'x..x..x...x..x..', snare: '................', hat: '..x...x...x...x.', tom: 'x.....x.x.....x.' },
      leadType: 'flute',
    },
    tenkaichi: {
      bpm: 138,
      chords: [[36, MAJ], [41, MAJ], [43, MAJ], [36, MAJ], [45, MIN], [41, MAJ], [38, MIN7], [43, DOM7]],
      bass: [0, null, 7, null, 12, null, 7, null, 0, null, 7, null, 12, null, 7, null],
      lead: [
        'C5 . . E5 G5 . . . C6 . . . G5 . . .',
        'A5 . . . F5 . A5 . C6 . . . . . . .',
        'B5 . . . D6 . . . G5 . . . B5 . . .',
        'C6 . . . . . . . G5 . E5 . C5 . . .',
        'A5 . . . C6 . . . E6 . . . D6 . C6 .',
        'C6 . . . A5 . . . F5 . . . A5 . . .',
        'D6 . . . C6 . . . A5 . . . F5 . . .',
        'G5 . . . B5 . . . D6 . . . F6 . . .',
      ],
      counter: [hold('E5'), hold('F5'), hold('D5'), hold('E5'), hold('E5'), hold('F5'), hold('F5'), hold('F5')],
      counterType: 'choir',
      drums: { kick: 'x.......x.......', snare: '....x..x....x.xx', hat: 'x.x.x.x.x.x.x.x.', fill: 'xxxxx.x.x.xxxxxx' },
      leadType: 'brass',
    },
    next_journey: {
      bpm: 96,
      chords: [[43, MAJ], [38, MAJ], [40, MIN], [36, MAJ], [43, MAJ], [38, MAJ], [36, MAJ7], [38, SUS4]],
      bass: [0, null, null, null, 7, null, null, null, 12, null, null, null, 7, null, null, null],
      arp: true,
      lead: [
        'B5 . . . . . D6 . G6 . . . F#6 . . .',
        'F#6 . . . . . E6 . D6 . . . A5 . . .',
        'G5 . . . A5 . B5 . E6 . . . D6 . B5 .',
        'C6 . . . . . . . E6 . . . G6 . . .',
        'G6 . . . F#6 . E6 . D6 . . . B5 . . .',
        'A5 . . . . . F#5 . D6 . . . E6 . F#6 .',
        'G6 . . . . . E6 . C6 . . . B5 . . .',
        'A5 . . . . . . . D6 . . . . . . .',
      ],
      counter: [hold('D5'), hold('D5'), hold('E5'), hold('E5'), hold('D5'), hold('A4'), hold('G4'), hold('A4')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.', tom: '..............x.' },
      power: true,
      leadType: 'strings',
    },
  });
  /*
   * THE SOUNDTRACK, THIRD WAVE (2026-10-03, later). Every song above is kept as it was. Original tracks for
   * the rest of the owner's list — each with its own key, tempo and lead instrument:
   *   story      adventure (childhood) · reunion · ominous (discovery) · hopeful (the future) ·
   *              victory_theme · defeat_theme
   *   battle     light_battle · martial · intense · comeback · final_clash
   *   character  gohan_theme · piccolo_theme · jiren_theme · beerus_theme
   *   special    super_saiyan · ssj3_theme · ssj_god · ssj_blue · ultra_instinct · fusion_theme ·
   *              dragon_hunt (gathering the Dragon Balls) · shenron · whatif_theme
   */
  Object.assign(SONGS, {
    // a boy and a world to explore: G major, a flute skipping over a plucked arpeggio
    adventure: {
      bpm: 128,
      chords: [[43, MAJ], [40, MIN], [36, MAJ], [38, MAJ]],
      bass: [0, null, null, 7, null, null, 0, null, 7, null, null, 0, null, null, 7, null],
      arp: true,
      lead: [
        'G5 . A5 B5 . D6 . B5 A5 . G5 . A5 . B5 .',
        'E5 . G5 . B5 . . A5 G5 . E5 . G5 . . .',
        'C6 . B5 A5 . G5 . E5 G5 . A5 . . . . .',
        'D6 . C6 B5 . A5 . F#5 A5 . . . D5 . . .',
      ],
      drums: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
      leadType: 'flute',
    },
    // somebody you thought you had lost: F major, strings over a slow arpeggio, a choir under the second half
    reunion: {
      bpm: 72,
      chords: [[41, MAJ7], [45, MIN], [46, MAJ], [48, SUS4], [41, MAJ], [38, MIN7], [46, MAJ], [48, MAJ]],
      bass: [0, null, null, null, null, null, null, null, 7, null, null, null, null, null, null, null],
      arp: true,
      lead: [
        'A5 . . . . . C6 . F6 . . . E6 . . .',
        'E6 . . . . . . . C6 . . . . . . .',
        'D6 . . . . . F6 . D6 . . . Bb5 . . .',
        'C6 . . . . . . . . . . . . . . .',
        'A5 . . . . . C6 . F6 . . . G6 . A6 .',
        'F6 . . . . . . . D6 . . . . . . .',
        'D6 . . . F6 . . . Bb6 . . . A6 . . .',
        'G6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('F5'), hold('E5'), hold('D5'), hold('E5'), hold('C5'), hold('A4'), hold('Bb4'), hold('C5')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '................', hat: '....x.......x...' },
      leadType: 'strings',
    },
    // something that should not be here: D minor and a diminished chord a tritone away, a bell, a sub
    ominous: {
      bpm: 76,
      chords: [[38, MIN], [44, DIM], [38, MIN], [39, MAJ]],
      bass: [0, null, null, null, null, null, 0, null, null, null, 6, null, null, null, null, null],
      bassType: 'sub',
      lead: [
        'D5 . . . . . . . A4 . . . . . G#4 .',
        'G#4 . . . . . . . . . . . D5 . . .',
        'F5 . . . E5 . . . D5 . . . A4 . . .',
        'Bb4 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x...............', snare: '................', hat: '........x.......', tom: '............x...' },
      leadType: 'bell',
    },
    // the next generation: C major, a piano climbing, strings holding it up
    hopeful: {
      bpm: 92,
      chords: [[36, MAJ], [43, MAJ], [45, MIN], [41, MAJ], [36, MAJ], [43, SUS4], [41, MAJ7], [43, MAJ]],
      bass: [0, null, null, null, 7, null, null, null, 12, null, null, null, 7, null, null, null],
      arp: true,
      lead: [
        'E5 . . G5 . . C6 . . . B5 . G5 . . .',
        'D5 . . G5 . . B5 . . . A5 . G5 . . .',
        'C5 . . E5 . . A5 . . . G5 . E5 . . .',
        'F5 . . . A5 . . . C6 . . . . . . .',
        'E5 . . G5 . . C6 . . . D6 . E6 . . .',
        'D6 . . . C6 . . . G5 . . . . . . .',
        'A5 . . C6 . . E6 . . . D6 . C6 . . .',
        'D6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('G4'), hold('B4'), hold('C5'), hold('A4'), hold('G4'), hold('G4'), hold('A4'), hold('B4')],
      counterType: 'strings',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
      leadType: 'piano',
    },
    // it is won: a Bb major fanfare, brass, the drums marching
    victory_theme: {
      bpm: 132,
      chords: [[46, MAJ], [41, MAJ], [43, MIN], [39, MAJ], [46, MAJ], [41, MAJ], [39, MAJ], [41, MAJ]],
      bass: [0, null, 0, null, 7, null, null, null, 0, null, 0, null, 7, null, 12, null],
      lead: [
        'Bb5 . . F5 . . Bb5 . D6 . . . F6 . . .',
        'F6 . . . Eb6 . D6 . C6 . . . A5 . . .',
        'G5 . . Bb5 . . D6 . G6 . . . F6 . D6 .',
        'Eb6 . . . . . . . . . . . . . . .',
        'Bb5 . . F5 . . Bb5 . D6 . . . F6 . . .',
        'A6 . . . G6 . F6 . C6 . . . F6 . . .',
        'G6 . . . F6 . Eb6 . Bb5 . . . G6 . . .',
        'F6 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // it is lost: A minor, a piano alone, falling
    defeat_theme: {
      bpm: 66,
      chords: [[45, MIN], [41, MAJ], [43, MAJ], [40, MIN]],
      bass: [0, null, null, null, null, null, null, null, 7, null, null, null, null, null, null, null],
      bassType: 'sub',
      arp: true,
      lead: [
        'E5 . . . D5 . C5 . B4 . . . A4 . . .',
        'A4 . . . C5 . . . F5 . . . E5 . . .',
        'D5 . . . . . B4 . G4 . . . B4 . . .',
        'E5 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: 'x...............', snare: '................', hat: '................' },
      leadType: 'piano',
    },
    // a light fight (sparring, small fry): E minor, a bouncing saw, nothing at stake yet
    light_battle: {
      bpm: 138,
      chords: [[40, MIN], [36, MAJ], [43, MAJ], [38, MAJ]],
      bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 7, null, 10, null],
      lead: [
        'E5 . G5 . B5 . G5 . A5 . . . G5 . E5 .',
        'C6 . . . B5 . A5 . G5 . . . E5 . . .',
        'D5 . G5 . B5 . D6 . C6 . B5 . A5 . G5 .',
        'F#5 . . . A5 . . . D6 . . . . . . .',
      ],
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'xxxxxxxxxxxxxxxx' },
      leadType: 'saw',
    },
    // the martial arts: D minor pentatonic, a flute over taiko toms, strings holding the fifth
    martial: {
      bpm: 120,
      chords: [[38, MIN], [38, MIN], [36, MAJ], [33, MIN]],
      bass: [0, null, null, 0, null, null, 7, null, 0, null, null, 0, null, null, 5, null],
      lead: [
        'D6 . . C6 A5 . . . G5 . A5 . C6 . . .',
        'D6 . F6 . D6 . C6 . A5 . . . . . . .',
        'C6 . . A5 G5 . . . E5 . G5 . A5 . . .',
        'A5 . . . G5 . E5 . D5 . . . . . . .',
      ],
      counter: [hold('A4'), hold('F4'), hold('G4'), hold('E4')],
      counterType: 'strings',
      drums: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: '..x...x...x...x.', tom: 'x..x....x..x..x.', fill: 'x.x.x.x.x.xxxxxx' },
      power: true,
      leadType: 'flute',
    },
    // everything at once: C# minor at 168, the saw screaming, sixteenth hats
    intense: {
      bpm: 168,
      chords: [[37, MIN], [45, MAJ], [47, MAJ], [44, MAJ]],
      bass: [0, null, 12, 0, null, 12, 0, null, 0, null, 12, 0, null, 7, 12, null],
      lead: [
        'C#6 . . E6 . . G#6 . F#6 . E6 . D#6 . E6 .',
        'C#6 . . . A5 . . . E6 . . . C#6 . . .',
        'B5 . . D#6 . . F#6 . E6 . D#6 . C#6 . B5 .',
        'C6 . . . D#6 . . . G#6 . . . . . . .',
      ],
      drums: { kick: 'x.x...x.x.x...x.', snare: '....x.......x..x', hat: 'xxxxxxxxxxxxxxxx', fill: 'x.xxx.xxx.xxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // back on his feet: D major, brass climbing an octave, strings under it — the comeback
    comeback: {
      bpm: 152,
      chords: [[38, MAJ], [45, MAJ], [47, MIN], [43, MAJ], [38, MAJ], [45, MAJ], [43, MAJ], [45, SUS4]],
      bass: [0, null, null, 0, null, null, 7, null, 0, null, null, 0, null, 7, null, 12],
      lead: [
        'D5 . . F#5 . . A5 . D6 . . . C#6 . . .',
        'E6 . . . C#6 . A5 . E5 . . . A5 . . .',
        'F#6 . . . E6 . D6 . B5 . . . D6 . . .',
        'G5 . . . B5 . . . D6 . . . G6 . . .',
        'F#6 . . . . . A6 . F#6 . . . D6 . . .',
        'E6 . . . . . C#6 . A5 . . . E6 . . .',
        'D6 . . . B5 . G5 . B5 . D6 . G6 . . .',
        'A6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('A4'), hold('A4'), hold('B4'), hold('B4'), hold('D5'), hold('C#5'), hold('B4'), hold('D5')],
      counterType: 'strings',
      drums: { kick: 'x...x..x..x.x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.xxx.x.xxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // the last exchange: E minor in half time, brass over a choir, the toms like a heartbeat
    final_clash: {
      bpm: 84,
      chords: [[40, MIN], [36, MAJ], [38, MAJ], [35, MAJ]],
      bass: [0, null, null, null, null, null, null, 0, 0, null, null, null, 7, null, null, null],
      bassType: 'sub',
      lead: [
        'B5 . . . . . . . E6 . . . D6 . . .',
        'C6 . . . . . . . G5 . . . . . . .',
        'A5 . . . D6 . . . F#6 . . . E6 . D6 .',
        'D#6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('G4'), hold('G4'), hold('A4'), hold('F#4')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.x.....', snare: '........x.......', hat: '..x...x...x...x.', tom: 'x.....x.....x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // Gohan: gentle, until it is not — A minor, strings that turn to the E major of his anger
    gohan_theme: {
      bpm: 140,
      chords: [[45, MIN], [41, MAJ], [36, MAJ], [43, MAJ], [45, MIN], [41, MAJ], [40, MAJ], [40, MAJ]],
      bass: [0, null, null, 0, null, null, 7, null, 0, null, null, 0, null, null, 7, null],
      lead: [
        'E5 . . A5 . . C6 . B5 . A5 . E5 . . .',
        'F5 . . A5 . . C6 . F6 . . . E6 . . .',
        'E6 . . . D6 . C6 . G5 . . . C6 . . .',
        'D6 . . . B5 . G5 . B5 . . . D6 . . .',
        'E6 . . . . . A6 . G6 . . . E6 . . .',
        'F6 . . . E6 . C6 . A5 . . . F6 . . .',
        'G#6 . . . . . E6 . B5 . . . G#5 . . .',
        'E6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('C5'), hold('C5'), hold('E5'), hold('D5'), hold('C5'), hold('A4'), hold('B4'), hold('G#4')],
      counterType: 'choir',
      drums: { kick: 'x...x..x..x.x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'strings',
    },
    // Piccolo: stoic and low, G minor, brass in its bottom register, a march he never hurries
    piccolo_theme: {
      bpm: 118,
      chords: [[43, MIN], [39, MAJ], [41, MAJ], [38, MAJ]],
      bass: [0, null, null, null, 0, null, null, 7, 0, null, null, null, 0, null, 5, null],
      lead: [
        'G4 . . . Bb4 . . D5 . . . C5 . Bb4 . .',
        'G4 . . . . . . . Eb5 . . . D5 . . .',
        'F5 . . . . . Eb5 . D5 . . . C5 . . .',
        'D5 . . . F#5 . . . A5 . . . . . . .',
      ],
      drums: { kick: 'x.......x..x....', snare: '....x.......x...', hat: '..x...x...x...x.', tom: '..............x.' },
      power: true,
      leadType: 'brass',
    },
    // Jiren: pressure. C minor and the Neapolitan-flavoured Ab, a choir in the floor, nothing hurried
    jiren_theme: {
      bpm: 100,
      chords: [[36, MIN], [44, MAJ], [41, MIN], [43, MAJ]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, null, 0, null],
      bassType: 'sub',
      lead: [
        'C5 . . . . . G5 . . . . . Eb5 . . .',
        'Ab5 . . . . . . . G5 . . . . . . .',
        'F5 . . . . . Ab5 . C6 . . . Bb5 . . .',
        'B5 . . . . . . . D6 . . . . . . .',
      ],
      counter: [hold('Eb4'), hold('Eb4'), hold('C4'), hold('D4')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: '..x...x...x...x.', tom: 'x...x...x...x...' },
      power: true,
      leadType: 'saw',
    },
    // Beerus: bored, and the most dangerous thing in the room — a swung bell line in D dorian
    beerus_theme: {
      bpm: 92,
      chords: [[38, MIN7], [43, MAJ], [38, MIN7], [45, MIN]],
      bass: [0, null, null, 7, null, null, 10, null, 0, null, null, 7, null, null, 5, null],
      lead: [
        'D5 . F5 . A5 . . . C6 . A5 . G5 . . .',
        'B5 . . . A5 . G5 . D5 . . . . . . .',
        'F5 . A5 . C6 . . . E6 . D6 . C6 . . .',
        'A5 . . . . . G5 . E5 . . . . . . .',
      ],
      drums: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x..x..x.x..x..x.', tom: '........x.....x.' },
      leadType: 'bell',
    },
    // SUPER SAIYAN: Bb minor bursting into F major, the saw over a choir — the gold
    super_saiyan: {
      bpm: 148,
      chords: [[34, MIN], [42, MAJ], [44, MAJ], [41, MAJ], [34, MIN], [42, MAJ], [37, MAJ], [41, MAJ]],
      bass: [0, null, null, 0, null, null, 7, null, 0, null, null, 0, null, 7, null, 12],
      lead: [
        'F5 . . . Bb5 . . . Db6 . C6 . Bb5 . . .',
        'Db6 . . . Bb5 . . . Gb5 . . . Bb5 . . .',
        'C6 . . . Eb6 . . . Ab6 . . . Gb6 . F6 .',
        'F6 . . . . . . . A5 . . . C6 . . .',
        'F6 . . . Eb6 . Db6 . Bb5 . . . F6 . . .',
        'Gb6 . . . F6 . Eb6 . Db6 . . . Bb5 . . .',
        'Ab6 . . . F6 . Db6 . Ab5 . . . F6 . . .',
        'A6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('Db5'), hold('Db5'), hold('Eb5'), hold('C5'), hold('Db5'), hold('Bb4'), hold('Ab4'), hold('A4')],
      counterType: 'choir',
      drums: { kick: 'x...x..x..x.x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // SUPER SAIYAN 3: primal and slow, F# minor, a choir lead held over a sub and taiko
    ssj3_theme: {
      bpm: 96,
      chords: [[42, MIN], [42, MIN], [38, MAJ], [40, MAJ]],
      bass: [0, null, null, null, null, null, 0, null, null, null, 0, null, null, null, null, null],
      bassType: 'sub',
      lead: [
        'F#5 . . . . . . . . . . . A5 . . .',
        'C#6 . . . . . . . . . . . B5 . A5 .',
        'D6 . . . . . . . F#6 . . . E6 . . .',
        'E6 . . . . . . . G#5 . . . . . . .',
      ],
      counter: [hold('C#5'), hold('E5'), hold('D5'), hold('B4')],
      counterType: 'strings',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '........x.......', hat: '..x...x...x...x.', tom: 'x..x..x.....x.x.' },
      power: true,
      leadType: 'choir',
    },
    // SUPER SAIYAN GOD: warm and weightless, Eb major sevenths, a choir over bells
    ssj_god: {
      bpm: 84,
      chords: [[39, MAJ7], [44, MAJ7], [46, MAJ], [36, MIN7]],
      bass: [0, null, null, null, null, null, 7, null, null, null, null, null, 12, null, null, null],
      arp: true,
      lead: [
        'G5 . . . Bb5 . . . Eb6 . . . D6 . . .',
        'C6 . . . . . . . Ab5 . . . . . . .',
        'Bb5 . . . D6 . . . F6 . . . Eb6 . D6 .',
        'Eb6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('Eb5'), hold('Eb5'), hold('F5'), hold('G5')],
      counterType: 'strings',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
      leadType: 'choir',
    },
    // SUPER SAIYAN BLUE: cool, exact, sure — B minor, a saw with a bell answering
    ssj_blue: {
      bpm: 130,
      chords: [[47, MIN], [43, MAJ], [38, MAJ], [45, MAJ]],
      bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 7, null, 12, null],
      lead: [
        'F#5 . . B5 . . D6 . . . C#6 . B5 . . .',
        'D6 . . . . . B5 . G5 . . . . . . .',
        'A5 . . D6 . . F#6 . . . E6 . D6 . . .',
        'C#6 . . . E6 . . . A5 . . . . . . .',
      ],
      counter: [hold('D5'), hold('B4'), hold('A4'), hold('C#5')],
      counterType: 'bell',
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // ULTRA INSTINCT: stillness at speed — A minor, a piano over an arpeggio and a choir, a pulse of toms
    ultra_instinct: {
      bpm: 116,
      chords: [[45, MIN], [41, MAJ7], [38, MIN7], [40, SUS4]],
      bass: [0, null, null, null, null, null, 0, null, null, null, 7, null, null, null, null, null],
      bassType: 'sub',
      arp: true,
      lead: [
        'A5 . . E6 . . A5 . . . G5 . E5 . . .',
        'F5 . . C6 . . A5 . . . E6 . . . . .',
        'D6 . . . C6 . . . A5 . . . F5 . . .',
        'E5 . . . . . . . B5 . . . . . . .',
      ],
      counter: [hold('C5'), hold('E5'), hold('F5'), hold('E5')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x...x...', snare: '................', hat: 'x.x.x.x.x.x.x.x.', tom: '..x.....x.....x.' },
      leadType: 'piano',
    },
    // FUSION: the dance — F major with a dominant seventh, a flute, a swing in the bass
    fusion_theme: {
      bpm: 124,
      chords: [[41, MAJ], [38, MIN], [46, MAJ], [48, DOM7]],
      bass: [0, null, 12, null, 7, null, 12, null, 0, null, 12, null, 7, null, 10, null],
      lead: [
        'F5 . A5 . C6 . . . A5 . C6 . F6 . . .',
        'D6 . . . F6 . D6 . A5 . . . . . . .',
        'Bb5 . D6 . F6 . . . D6 . Bb5 . G5 . . .',
        'C6 . . . E6 . . . G6 . . . E6 . . .',
      ],
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.' },
      leadType: 'flute',
    },
    // gathering the Dragon Balls: A minor adventure, a bell like the radar's blip over an arpeggio
    dragon_hunt: {
      bpm: 132,
      chords: [[45, MIN], [43, MAJ], [41, MAJ], [40, MAJ]],
      bass: [0, null, null, 7, null, null, 0, null, 0, null, null, 7, null, null, 12, null],
      arp: true,
      lead: [
        'E5 . A5 . . . C6 . B5 . . . A5 . G5 .',
        'D5 . G5 . . . B5 . A5 . . . G5 . . .',
        'F5 . A5 . C6 . F6 . E6 . . . C6 . . .',
        'B5 . . . G#5 . . . E5 . . . . . . .',
      ],
      drums: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
      leadType: 'bell',
    },
    // the Eternal Dragon: dark sky, then majesty — D minor to Bb and F, brass over a low choir
    shenron: {
      bpm: 70,
      chords: [[38, MIN], [46, MAJ], [41, MAJ], [45, MAJ]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, null, 7, null, null, null],
      bassType: 'sub',
      lead: [
        'D5 . . . . . A5 . . . . . D6 . . .',
        'D6 . . . . . . . F5 . . . . . . .',
        'A5 . . . C6 . . . F6 . . . E6 . . .',
        'C#6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('F4'), hold('F4'), hold('A4'), hold('A4')],
      counterType: 'choir',
      counterLevel: 1,
      drums: { kick: 'x...............', snare: '................', hat: '................', tom: '........x.....x.' },
      power: true,
      leadType: 'brass',
    },
    // WHAT IF...?: the timeline bent — C Lydian, a raised fourth and an augmented chord, a bell
    whatif_theme: {
      bpm: 100,
      chords: [[36, MAJ], [38, MAJ], [36, MAJ], [40, AUG]],
      bass: [0, null, null, null, 7, null, null, null, 0, null, null, null, 4, null, null, null],
      bassType: 'sub',
      arp: true,
      lead: [
        'E5 . . G5 . . B5 . . . A5 . F#5 . . .',
        'D5 . . F#5 . . A5 . . . . . . . . .',
        'G5 . . . B5 . . . E6 . . . D6 . . .',
        'C6 . . . G#5 . . . E5 . . . . . . .',
      ],
      drums: { kick: 'x.......x.......', snare: '................', hat: '..x...x...x...x.' },
      leadType: 'bell',
    },
  });

  /** Characters with a theme of their own: a Free Battle against one of them plays it. */
  const THEMES = {
    goku: 'goku_theme', vegeta: 'vegeta_theme', frieza: 'frieza_theme', mecha_frieza: 'frieza_theme', cell: 'cell_theme',
    majin_buu: 'buu_theme', super_buu: 'buu_theme', evil_buu: 'buu_theme', kid_buu: 'kid_buu', vegito: 'vegito_theme', gogeta: 'gogeta_theme', uub: 'uub_theme',
    piccolo: 'piccolo_theme', kid_gohan: 'gohan_theme', teen_gohan: 'gohan_theme', adult_gohan: 'gohan_theme', great_saiyaman: 'gohan_theme',
    gotenks: 'fusion_theme', pan: 'adventure', jiren: 'jiren_theme', beerus: 'beerus_theme',
  };
  for (const s of Object.values(SONGS)) {
    s.leadParsed = s.lead.map(parseBar);
    if (s.counter) s.counterParsed = s.counter.map(parseBar);
  }

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
      // a name that is a stinger, not a song (Namek's 'dawn'), plays the stinger over whatever is on;
      // an unknown name used to swap the music for silence
      if (!SONGS[id]) {
        if (STINGERS[id]) this.stinger(id);
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
      if (b !== null && b !== undefined) this._bass(out, t, root + b, stepDur * (lvl >= 1 ? 1.8 : 3), song.bassType);

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
      if (song.counterParsed && lvl >= (song.counterLevel || 3)) {
        const cb = song.counterParsed[bar % song.counterParsed.length];
        const cn = cb[step];
        if (cn !== null && cn !== undefined) {
          let len = 1;
          while (step + len < 16 && cb[step + len] === null) len++;
          this._lead(out, t, cn, stepDur * Math.min(len, 16), song.counterType || 'choir', 0.75);
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
    _bass(out, t, midi, dur, type) {
      const ctx = this.A.ctx;
      const o = ctx.createOscillator();
      o.type = type === 'sub' ? 'sine' : 'sawtooth';
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
      if (type === 'brass') {
        // two saws and a square an octave down, a filter that opens on the attack like a breath into a horn
        for (const [mul, det, wave] of [[1, -7, 'sawtooth'], [1, 7, 'sawtooth'], [0.5, 0, 'square']]) {
          const o = ctx.createOscillator();
          o.type = wave;
          o.frequency.value = freq * mul;
          o.detune.value = det;
          oscs.push(o);
        }
        f.frequency.setValueAtTime(700, t);
        f.frequency.linearRampToValueAtTime(3000, t + 0.06);
        f.frequency.exponentialRampToValueAtTime(1500, t + Math.max(0.2, dur));
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.06 * vol, t + 0.04);
        g.gain.setValueAtTime(0.055 * vol, t + dur * 0.85);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.12);
      } else if (type === 'strings') {
        // a section: four detuned saws, a slow bow
        for (const det of [-11, -4, 4, 11]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = freq;
          o.detune.value = det;
          oscs.push(o);
        }
        f.frequency.value = 2100;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.042 * vol, t + 0.14);
        g.gain.setValueAtTime(0.042 * vol, t + dur * 0.9);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.35);
      } else if (type === 'flute') {
        // a sine with a little vibrato and a soft breath on the front
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        const vib = ctx.createOscillator();
        vib.frequency.value = 5;
        const vg = ctx.createGain();
        vg.gain.value = 5;
        vib.connect(vg);
        vg.connect(o.detune);
        vib.start(t);
        vib.stop(t + dur + 0.4);
        const o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.value = freq * 2;
        oscs.push(o, o2);
        f.frequency.value = 3200;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.1 * vol, t + 0.05);
        g.gain.setValueAtTime(0.09 * vol, t + dur * 0.85);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.15);
      } else if (type === 'piano') {
        // a struck string: triangle and its octave, a fast fall and a long tail
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = freq;
        const o2 = ctx.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = freq * 2;
        oscs.push(o, o2);
        f.frequency.value = 3600;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.15 * vol, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.05 * vol, t + 0.25);
        g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.6, dur * 1.6));
      } else if (type === 'saw') {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = freq;
        oscs.push(o);
        f.frequency.value = 1900;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.065 * vol, t + 0.01);
        g.gain.setValueAtTime(0.06 * vol, t + dur * 0.8);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.1);
      } else if (type === 'bell' || type === 'pluck') {
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
  Music.THEMES = THEMES;
  Music.SONG_IDS = Object.keys(SONGS);
  /**
   * A transformation's own music (Free Battle and Training only — a story mission owns its score): the
   * first time the player reaches one of these forms, the track turns into it (Battle, 'transformBurst').
   * A character's own song (Gogeta's step.song) and an opponent's theme win over it.
   */
  Music.FORM_THEMES = { ssj: 'super_saiyan', ssj2: 'super_saiyan', ssj3: 'ssj3_theme', ssj_god: 'ssj_god', god: 'ssj_god', blue: 'ssj_blue', ssb: 'ssj_blue', ui: 'ultra_instinct', ultra_instinct: 'ultra_instinct' };
  Music.noteToMidi = noteToMidi;
})();
