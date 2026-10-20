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
      // the soundtrack PDF (p.97, Vegito's arrival): mechanical synthesizer arpeggios running under the lead
      arp: true,
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
    // SUPER SAIYAN 3: primal and slow, F# minor. Revised to the soundtrack PDF (p.93, the SSJ3 introduction theme): a
    // low droning sub that rumbles like the ground, a slow chugging down-tuned riff in the bass, a synth lead climbing
    // over it, rapid drum fills as the hair grows down his back; the choir stays underneath
    ssj3_theme: {
      bpm: 96,
      chords: [[42, MIN], [42, MIN], [38, MAJ], [40, MAJ]],
      bass: [0, 0, null, 0, 0, null, 0, null, 0, 0, null, 0, 0, null, 12, null],
      bassType: 'sub',
      lead: [
        'F#5 . . . . . . . . . . . A5 . . .',
        'C#6 . . . . . . . . . . . B5 . A5 .',
        'D6 . . . . . . . F#6 . . . E6 . . .',
        'E6 . . . . . . . G#5 . . . . . . .',
      ],
      counter: [hold('C#5'), hold('E5'), hold('D5'), hold('B4')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '........x.......', hat: '..x...x...x...x.', tom: 'x..x..x.....x.x.', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'saw',
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

  /* ---------------- MOVIE: FUSION REBORN (original arrangements; nothing from the film's score) ---------------- */
  Object.assign(SONGS, {
    // JANEMBA: a toy box that has gone wrong — C minor, a music-box bell skipping over a tritone, a bouncy
    // sub bass, a diminished chord where the tune should resolve. Light at intensity 1, menacing at 3.
    janemba_theme: {
      bpm: 132,
      chords: [[36, MIN], [36, MIN], [39, MAJ], [38, DIM], [41, MIN], [36, MIN], [43, DOM7], [36, MIN]],
      bass: [0, null, 12, null, 7, null, 12, null, 0, null, 12, null, 6, null, 7, null],
      bassType: 'sub',
      lead: [
        'C6 . Eb6 . G6 . F#6 . G6 . . . Eb6 . C6 .',
        'D6 . . C6 B5 . . . G5 . . . . . . .',
        'Eb6 . G6 . Bb6 . A6 . Bb6 . . . G6 . Eb6 .',
        'F6 . . Eb6 D6 . . . Ab5 . . . B5 . . .',
        'C6 . Ab5 . F5 . Ab5 . C6 . . . Db6 . C6 .',
        'G5 . . . Eb6 . . . D6 . C6 . . . . .',
        'B5 . D6 . F6 . . . G6 . F6 . D6 . B5 .',
        'C6 . . . . . G5 . C5 . . . . . . .',
      ],
      counter: [hold('G4'), hold('G4'), hold('Bb4'), hold('Ab4'), hold('Ab4'), hold('G4'), hold('F4'), hold('Eb4')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '..............xx' },
      leadType: 'bell',
    },
    // SUPER JANEMBA: no more games — D minor at speed, a saw lead in fourths over a driving eighth-note bass,
    // a choir held under it like a dimension tearing
    super_janemba: {
      bpm: 168,
      chords: [[38, MIN], [38, MIN], [34, MAJ], [36, MAJ], [38, MIN], [43, MIN], [33, DOM7], [38, MIN]],
      bass: [0, 0, 12, 0, 0, 12, 0, 10, 0, 0, 12, 0, 7, 0, 5, 3],
      lead: [
        'D5 . . A5 . . G5 . F5 . . E5 . . D5 .',
        'A5 . . . C6 . . . D6 . . . . . . .',
        'Bb5 . . F5 . . D6 . C6 . . A5 . . F5 .',
        'G5 . . . E5 . . . C6 . . . . . . .',
        'D6 . . F6 . . E6 . D6 . . C6 . . A5 .',
        'Bb5 . . . G5 . . . D6 . . . . . . .',
        'E5 . G5 . A5 . C#6 . E6 . . . C#6 . A5 .',
        'D6 . . . . . . . A5 . . . D5 . . .',
      ],
      counter: [hold('F4'), hold('F4'), hold('F4'), hold('E4'), hold('F4'), hold('Bb4'), hold('C#5'), hold('D5')],
      counterType: 'choir',
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', tom: '............xxxx', fill: 'x.x.x.xxx.x.xxxx' },
      power: true,
      leadType: 'saw',
    },
    // THE DICTATOR: a pompous little march that keeps tripping over itself — F major oom-pah, brass, a snare
    // roll, and a chromatic slide down whenever it gets too sure of itself
    dictator_march: {
      bpm: 116,
      chords: [[41, MAJ], [36, DOM7], [41, MAJ], [46, MAJ], [41, MAJ], [43, MIN7], [36, DOM7], [41, MAJ]],
      bass: [0, null, 7, null, 0, null, 7, null, 0, null, 7, null, 0, null, 7, null],
      lead: [
        'F5 . . A5 C6 . . . F6 . E6 . D6 . C6 .',
        'Bb5 . . . G5 . E5 . C5 . . . . . . .',
        'A5 . . C6 F6 . . . A6 . G6 . F6 . E6 .',
        'D6 . Db6 . C6 . B5 . Bb5 . . . . . . .',
        'F5 . F5 . A5 . F5 . C6 . A5 . F5 . . .',
        'G5 . . Bb5 D6 . . . F6 . . . . . . .',
        'E6 . . D6 C6 . Bb5 . G5 . . . C6 . . .',
        'F5 . . . C5 . . . F4 . . . . . . .',
      ],
      counter: [hold('C5'), hold('Bb4'), hold('C5'), hold('D5'), hold('C5'), hold('D5'), hold('E5'), hold('F5')],
      counterType: 'brass',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '..x.x.x...x.xxxx', hat: '................', tom: '..............x.' },
      leadType: 'brass',
    },
  });

  /* ---------------- MOVIE 2 · SUPER BROLY (original arrangements; nothing from the film's score) ---------------- */
  Object.assign(SONGS, {
    // BROLY: something enormous walking toward you — E Phrygian, a low drum on every beat like footsteps, the
    // choir holding a half-step that will not resolve, a brass call that climbs and is cut off. Grim at 1,
    // crushing at 3.
    broly_theme: {
      bpm: 118,
      chords: [[40, MIN], [41, MAJ], [40, MIN], [38, MAJ], [40, MIN], [41, MAJ], [43, MAJ], [40, MIN]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 1, null, null, 0, null],
      bassType: 'sub',
      lead: [
        'E5 . . . . . F5 . E5 . . . B4 . . .',
        'C5 . . . . . B4 . A4 . . . . . . .',
        'E5 . . . G5 . . . B5 . . . C6 . B5 .',
        'A5 . . . . . F#5 . D5 . . . . . . .',
        'E6 . . . . . F6 . E6 . . . B5 . . .',
        'C6 . . . D6 . C6 . A5 . . . . . . .',
        'B5 . . . D6 . . . G5 . . . B5 . . .',
        'E5 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('B3'), hold('C4'), hold('B3'), hold('A3'), hold('B3'), hold('C4'), hold('D4'), hold('E4')],
      counterType: 'choir',
      drums: { kick: 'x...x...x...x...', snare: '............x...', hat: '................', tom: 'x.....x.x.....x.' },
      power: true,
      leadType: 'brass',
    },
    // WRATH: the same footsteps, running — faster, the bass hammering on one note, a saw lead clawing upward
    // in the same half-steps, the drums never stopping
    broly_wrath: {
      bpm: 164,
      chords: [[40, MIN], [41, MAJ], [40, MIN], [41, MAJ], [43, MAJ], [41, MAJ], [38, MAJ], [40, MIN]],
      bass: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 12, 0, 1, 0, 0, 13],
      lead: [
        'E5 . F5 . E5 . B4 . E5 . F5 . G5 . F5 .',
        'E5 . . . . . . . F5 . E5 . C5 . . .',
        'B5 . C6 . B5 . F5 . B5 . C6 . D6 . C6 .',
        'B5 . . . . . . . C6 . B5 . G5 . . .',
        'G5 . A5 . B5 . D6 . G6 . . . F#6 . D6 .',
        'F6 . . . E6 . C6 . A5 . . . . . . .',
        'F#5 . A5 . D6 . F#6 . A6 . . . F#6 . D6 .',
        'E6 . . . . . . . E5 . . . . . . .',
      ],
      counter: [hold('E4'), hold('F4'), hold('E4'), hold('F4'), hold('G4'), hold('F4'), hold('F#4'), hold('E4')],
      counterType: 'choir',
      drums: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', tom: '............xxxx', fill: 'x.x.x.xxx.x.xxxx' },
      power: true,
      leadType: 'saw',
    },
    // THE GLACIER: wind over ice and two people waiting — a slow bell over open fifths, almost nothing else
    glacier: {
      bpm: 70,
      chords: [[38, MIN], [36, MAJ], [38, MIN], [33, MAJ]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      lead: [
        'A5 . . . . . . . E5 . . . . . . .',
        'G5 . . . . . . . . . . . E5 . . .',
        'F5 . . . . . . . A5 . . . D6 . . .',
        'C#6 . . . . . . . . . . . . . . .',
      ],
      drums: { kick: '................', snare: '................', hat: '................', tom: '................' },
      leadType: 'bell',
    },
    // PLANET VEGETA: a warrior people's last ordinary day — D minor, war drums under it all, a horn that
    // sounds proud and a little sad, a choir holding the root
    saiyan_home: {
      bpm: 96,
      chords: [[38, MIN], [34, MAJ], [36, MAJ], [33, MIN], [38, MIN], [34, MAJ], [31, MIN], [33, MAJ]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, 0, null, null, null, 0, null],
      bassType: 'sub',
      lead: [
        'D5 . . . F5 . A5 . . . G5 . F5 . . .',
        'F5 . . . . . E5 . D5 . . . . . . .',
        'C5 . . . E5 . G5 . . . A5 . G5 . . .',
        'E5 . . . . . . . C#5 . . . . . . .',
        'D5 . . . F5 . A5 . D6 . . . C6 . A5 .',
        'Bb5 . . . A5 . F5 . D5 . . . . . . .',
        'G5 . . . Bb5 . D6 . C6 . . . Bb5 . G5 .',
        'A5 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('A3'), hold('F3'), hold('G3'), hold('E3'), hold('A3'), hold('F3'), hold('D3'), hold('C#4')],
      counterType: 'choir',
      drums: { kick: 'x.....x...x.....', snare: '........x.......', hat: '................', tom: 'x..x..x.x..x..xx' },
      leadType: 'brass',
    },
    // VAMPA: wind over a dead world and a boy alone in it — slow, empty, a low choir and a bell that answers itself
    vampa: {
      bpm: 76,
      chords: [[40, MIN], [36, MAJ], [40, MIN], [35, MAJ]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null],
      lead: [
        'B5 . . . . . . . G5 . . . E5 . . .',
        'G5 . . . . . . . . . . . . . . .',
        'B5 . . . . . C6 . B5 . . . G5 . . .',
        'D#5 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('E3'), hold('C3'), hold('E3'), hold('B2')],
      counterType: 'choir',
      drums: { kick: 'x...............', snare: '................', hat: '................', tom: '........x.......' },
      leadType: 'bell',
    },
  });

  /*
   * SOUNDTRACK WAVE 4 — the song themes of the owner's "Tournament of power ui" document, PDF pages 90–98
   * (documentation/MUSIC_THEMES.md lists every entry, where it plays and what is still missing). No recordings of the
   * named songs are in the project and none are downloaded: each piece below is an ORIGINAL composition for this
   * sequencer, written to the document's description of the cue — its tempo, instruments, mood and how the drop
   * lands — so the right kind of music plays at the right moment. The real tracks can replace them later through the
   * same ids (play(song)) without touching any mission.
   */
  Object.assign(SONGS, {
    // p.90–91 "Ultimate Battle" (Ultra Instinct -Sign-): ~138 BPM, staccato brass doubled by a distorted guitar on a
    // rising-and-falling pentatonic run, slap bass, driving rock drums — the opponent outclassed. A minor.
    ui_awakening: {
      bpm: 138,
      chords: [[45, MIN], [43, MAJ], [41, MAJ], [40, MAJ], [45, MIN], [43, MAJ], [38, MIN], [40, SUS4]],
      bass: [0, null, 12, null, 0, 0, null, 12, 0, null, 12, null, 7, null, 12, null],
      lead: [
        'A5 . C6 . D6 . E6 . . . D6 . C6 . A5 .',
        'G5 . A5 . B5 . D6 . . . B5 . A5 . G5 .',
        'F5 . A5 . C6 . F6 . . . E6 . C6 . A5 .',
        'E5 . G#5 . B5 . E6 . G#6 . . . . . . .',
        'E6 . E6 . G6 . A6 . . . G6 . E6 . D6 .',
        'D6 . E6 . G6 . B6 . . . A6 . G6 . E6 .',
        'F6 . E6 . D6 . A5 . . . C6 . D6 . F6 .',
        'E6 . . . . . . . B5 . . . E6 . . .',
      ],
      counter: [hold('E5'), hold('D5'), hold('C5'), hold('B4'), hold('E5'), hold('D5'), hold('D5'), hold('E5')],
      counterType: 'strings',
      drums: { kick: 'x...x.x.x...x.x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // p.94–95 "Clash of the Gods" (Mastered Ultra Instinct): a low divine choir, then strings and kettle drums rising,
    // then the heavy brass-and-guitar hook and a sub-bass drop — a deity waking, not a mortal fighting. D minor.
    clash_of_gods: {
      bpm: 124,
      chords: [[38, MIN], [34, MAJ], [36, MAJ], [33, MAJ], [38, MIN], [34, MAJ], [31, MIN], [33, MAJ]],
      bass: [0, null, null, null, null, null, 0, null, 0, null, null, null, 12, null, 0, null],
      bassType: 'sub',
      lead: [
        'D6 . . D6 . F6 . A6 . . G6 . F6 . E6 .',
        'D6 . . . . . F6 . Bb5 . . . . . . .',
        'C6 . . E6 . G6 . C7 . . Bb6 . A6 . G6 .',
        'A6 . . . . . . . C#6 . E6 . A6 . . .',
        'F6 . E6 . D6 . . . A5 . D6 . F6 . A6 .',
        'Bb6 . A6 . F6 . . . D6 . . . F6 . . .',
        'G6 . F6 . D6 . Bb5 . G5 . . . Bb5 . D6 .',
        'C#6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('D3'), hold('D3'), hold('E3'), hold('C#3'), hold('D3'), hold('D3'), hold('Bb2'), hold('A2')],
      counterType: 'choir',
      counterLevel: 2,
      drums: { kick: 'x.......x.x.....', snare: '....x.......x...', hat: '..x...x...x...x.', tom: 'x.x.x.x...x.xxxx', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // p.91–92 "Genkai Toppa x Survivor" (the Tournament of Power): ~150 BPM, explosive staccato brass and guitars on an
    // ascending pentatonic intro, a slap-bass verse under heavy snare, a chorus of power chords and double kick. E minor.
    limit_survivor: {
      bpm: 150,
      chords: [[40, MIN], [43, MAJ], [45, MAJ], [47, MAJ], [40, MIN], [36, MAJ], [38, MAJ], [47, MAJ]],
      bass: [0, null, 12, 0, null, 12, 0, null, 0, null, 12, 0, null, 7, 12, null],
      lead: [
        'E5 . G5 . A5 . B5 . D6 . E6 . . . . .',
        'D6 . . . B5 . A5 . G5 . A5 . B5 . . .',
        'A5 . C#6 . E6 . . . F#6 . E6 . C#6 . A5 .',
        'B5 . . . . . D#6 . F#6 . . . B6 . . .',
        'E6 . . . D6 . B5 . E6 . . . G6 . E6 .',
        'C6 . . . E6 . G6 . . . E6 . C6 . . .',
        'D6 . F#6 . A6 . . . F#6 . D6 . A5 . . .',
        'B5 . . . . . . . D#6 . F#6 . B6 . . .',
      ],
      counter: [hold('B4'), hold('B4'), hold('C#5'), hold('D#5'), hold('B4'), hold('C5'), hold('D5'), hold('D#5')],
      counterType: 'strings',
      drums: { kick: 'x.x...x.x.x...x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // p.92 "HERO ~Song of Hope~" (Battle of Gods): bright, euphoric pop-punk at ~168 BPM — clean guitar, fast drums,
    // an anthemic "whoa" from a choir: the golden hair coming back by will alone in deep space. D major.
    song_of_hope: {
      bpm: 168,
      chords: [[38, MAJ], [45, MAJ], [47, MIN], [43, MAJ], [38, MAJ], [45, MAJ], [43, MAJ], [45, MAJ]],
      bass: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 7, null, 7, null],
      arp: true,
      lead: [
        'F#5 . . A5 . . D6 . . . C#6 . D6 . E6 .',
        'E6 . . . C#6 . . A5 . . . . . . . .',
        'D6 . . F#6 . . B6 . . . A6 . F#6 . D6 .',
        'G6 . . . F#6 . E6 . D6 . . . B5 . . .',
        'A5 . . D6 . . F#6 . . . E6 . F#6 . G6 .',
        'A6 . . . G6 . F#6 . E6 . . . C#6 . . .',
        'D6 . . . B5 . . . G6 . . . F#6 . E6 .',
        'E6 . . . . . . . A5 . C#6 . E6 . . .',
      ],
      counter: [hold('D4'), hold('C#4'), hold('D4'), hold('B3'), hold('D4'), hold('C#4'), hold('B3'), hold('C#4')],
      counterType: 'choir',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.xxxxxxxxxxxx' },
      power: true,
      leadType: 'lead',
    },
    // p.93 "Gohan's Anger": a lonely high flute over deep strings, slow arpeggios gathering volume and dissonance, then
    // at full intensity the timpani and the horns — a gentle boy snapping. A minor; the horns are the intensity-3 counter.
    gohan_anger: {
      bpm: 84,
      chords: [[45, MIN], [41, MAJ], [38, MIN], [40, MAJ], [45, MIN], [41, MAJ], [43, MAJ], [40, AUG]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null],
      arp: true,
      lead: [
        'E6 . . . . . . . D6 . C6 . B5 . . .',
        'C6 . . . . . . . A5 . . . . . . .',
        'F6 . . . E6 . D6 . A5 . . . D6 . . .',
        'G#5 . . . . . . . B5 . . . E6 . . .',
        'A6 . . . . . G6 . E6 . . . C6 . . .',
        'F6 . . . . . E6 . C6 . . . A5 . . .',
        'B5 . . . D6 . . . G6 . . . F6 . . .',
        'E6 . . . . . . . G#5 . . . . . . .',
      ],
      counter: [hold('A4'), hold('A4'), hold('F4'), hold('G#4'), hold('C5'), hold('C5'), hold('B4'), hold('G#4')],
      counterType: 'brass',
      drums: { kick: 'x...............', snare: '................', hat: '................', tom: 'x.......x...x.xx' },
      leadType: 'flute',
    },
    // p.93–94 "I Didn't Care Anymore" (Vegeta's Super Saiyan): a fast cascading sixteenth-note synth arpeggio cycling
    // in a minor key over industrial drums and a distorted synth bass — the frustration that finally breaks. B minor.
    vegeta_awakening: {
      bpm: 140,
      chords: [[47, MIN], [43, MAJ], [45, MAJ], [42, MIN], [47, MIN], [43, MAJ], [40, MIN], [42, MAJ]],
      bass: [0, 0, null, 0, 0, null, 0, null, 0, 0, null, 0, 12, null, 0, null],
      arp: true,
      arp16: true,
      lead: [
        'B5 . . . . . D6 . F#6 . . . E6 . D6 .',
        'D6 . . . B5 . . . G5 . . . . . . .',
        'C#6 . . . E6 . . . A6 . . . G6 . F#6 .',
        'F#6 . . . . . . . C#6 . . . . . . .',
        'B6 . . . A6 . F#6 . D6 . . . F#6 . . .',
        'G6 . . . F#6 . D6 . B5 . . . D6 . . .',
        'E6 . . . G6 . . . B6 . . . A6 . G6 .',
        'F#6 . . . . . . . A#5 . . . C#6 . . .',
      ],
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // p.94 "Unmei no Hi ~Tamashii vs Tamashii~" (Gohan's Super Saiyan 2): a fast strummed guitar and a gothic organ, one
    // hard snare when the line snaps, then rock drums and screaming brass as the golden lightning erupts. G minor.
    fateful_day: {
      bpm: 152,
      chords: [[43, MIN], [39, MAJ], [41, MAJ], [38, MAJ], [43, MIN], [39, MAJ], [36, MIN], [38, MAJ]],
      bass: [0, null, 0, 0, null, 0, 0, null, 0, null, 0, 0, null, 7, 12, null],
      arp: true,
      arp16: true,
      lead: [
        'G5 . . Bb5 . D6 . . F6 . . . D6 . . .',
        'Eb6 . . . D6 . Bb5 . G5 . . . . . . .',
        'F5 . . A5 . C6 . . F6 . . . E6 . C6 .',
        'D6 . . . . . . . F#5 . A5 . D6 . . .',
        'G6 . . . F6 . D6 . Bb5 . . . D6 . G6 .',
        'Bb6 . . . G6 . Eb6 . Bb5 . . . G5 . . .',
        'C6 . . Eb6 . G6 . . C7 . . . Bb6 . G6 .',
        'A6 . . . . . . . F#6 . . . D6 . . .',
      ],
      counter: [hold('D5'), hold('Eb5'), hold('F5'), hold('F#5'), hold('G5'), hold('G5'), hold('G5'), hold('F#5')],
      counterType: 'brass',
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'lead',
    },
    // p.95 the Ginyu Force theme: an over-the-top superhero-show intro at ~140 BPM — blaring funky brass, a disco
    // octave bass, big drum fills (the document's shouted chorus is left out: no voices here). B-flat major.
    ginyu_force: {
      bpm: 140,
      chords: [[46, MAJ], [43, MIN], [39, MAJ], [41, DOM7], [46, MAJ], [43, MIN], [44, MAJ], [41, DOM7]],
      bass: [0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 7, 19, 7, 19],
      lead: [
        'Bb5 . D6 . F6 . . Bb6 . . A6 . F6 . . .',
        'G6 . . . F6 . D6 . Bb5 . . . . . . .',
        'Eb6 . G6 . Bb6 . . Eb7 . . D7 . Bb6 . . .',
        'C7 . . . A6 . F6 . Eb6 . C6 . A5 . . .',
        'Bb5 . . Bb5 . D6 . F6 . . . D6 . F6 . .',
        'G6 . F6 . D6 . . . Bb5 . . . G5 . . .',
        'Ab5 . C6 . Eb6 . Ab6 . . . G6 . Eb6 . C6 .',
        'C6 . . . F6 . . . A6 . . . C7 . . .',
      ],
      counter: [hold('F5'), hold('D5'), hold('Eb5'), hold('Eb5'), hold('F5'), hold('D5'), hold('Eb5'), hold('Eb5')],
      counterType: 'strings',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', fill: 'x.x.x.xxxxxxxxxx', tom: '............x.xx' },
      power: true,
      leadType: 'brass',
    },
    // p.95–96 the soft acoustic Cha-La: a slow, peaceful arrangement on piano with a plucked guitar and gentle strings
    // — Nimbus, Mount Paozu, a rest between fights (no drums at all). C major.
    soft_chala: {
      bpm: 72,
      chords: [[48, MAJ], [45, MIN], [41, MAJ], [43, MAJ], [48, MAJ], [40, MIN], [41, MAJ], [43, SUS4]],
      bass: [0, null, null, null, null, null, null, null, 7, null, null, null, null, null, null, null],
      arp: true,
      lead: [
        'E5 . . . G5 . . . C6 . . . B5 . . .',
        'A5 . . . . . . . E5 . . . . . . .',
        'F5 . . . A5 . . . C6 . . . D6 . C6 .',
        'B5 . . . . . . . G5 . . . . . . .',
        'G5 . . . C6 . . . E6 . . . D6 . . .',
        'B5 . . . . . G5 . E5 . . . . . . .',
        'A5 . . . C6 . . . F6 . . . E6 . D6 .',
        'D6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('C4'), hold('C4'), hold('A3'), hold('B3'), hold('C4'), hold('B3'), hold('A3'), hold('G3')],
      counterType: 'strings',
      counterLevel: 1,
      drums: { kick: '................', snare: '................', hat: '................' },
      leadType: 'piano',
    },
    // p.96 "Looming Threat": high tremolo violins on sharp, dissonant minor notes — cold and menacing, for the villain
    // in the shadows before a catastrophe. No beat; the tremolo is the lead's repeated sixteenths.
    looming_threat: {
      bpm: 72,
      chords: [[40, DIM], [41, MIN], [40, DIM], [39, AUG]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      bassType: 'sub',
      lead: [
        'B5 C6 B5 C6 B5 C6 B5 C6 . . . . A#5 B5 A#5 B5',
        'C6 C#6 C6 C#6 C6 C#6 C6 C#6 . . . . . . . .',
        'F6 E6 F6 E6 F6 E6 F6 E6 . . . . D#6 E6 D#6 E6',
        'G5 G#5 G5 G#5 G5 G#5 G5 G#5 . . . . . . . .',
      ],
      counter: [hold('E3'), hold('F3'), hold('E3'), hold('D#3')],
      counterType: 'strings',
      counterLevel: 1,
      drums: { kick: '................', snare: '................', hat: '................', tom: 'x...............' },
      leadType: 'strings',
    },
    // p.96 the tragic death theme: deep crying cellos under a tragic piano and a faint choir — for the heroes' ultimate
    // sacrifices (Piccolo dying for Gohan; Trunks finding Gohan in the rain). D minor, no drums.
    tragic_sacrifice: {
      bpm: 64,
      chords: [[38, MIN], [34, MAJ], [41, MAJ], [33, MAJ], [38, MIN], [43, MIN], [33, SUS4], [33, MAJ]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      lead: [
        'A5 . . . . . . . F5 . . . D5 . . .',
        'F5 . . . . . . . . . . . . . . .',
        'C6 . . . . . A5 . F5 . . . A5 . . .',
        'E5 . . . . . . . C#5 . . . . . . .',
        'D6 . . . . . C6 . A5 . . . F5 . . .',
        'Bb5 . . . . . . . G5 . . . D5 . . .',
        'E5 . . . . . . . D5 . . . E5 . . .',
        'C#5 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('D3'), hold('D3'), hold('C3'), hold('C#3'), hold('D3'), hold('Bb2'), hold('A2'), hold('A2')],
      counterType: 'strings',
      counterLevel: 1,
      drums: { kick: '................', snare: '................', hat: '................' },
      leadType: 'piano',
    },
    // p.96–97 Goku's Super Saiyan awakening: rising, chaotic brass fanfares over heavy timpani rolls, an orchestral
    // explosion as the gold erupts (the document's first version; the second's synth-organ is in the pad). F minor rising.
    ssj_awakening: {
      bpm: 120,
      chords: [[41, MIN], [42, MAJ], [43, MAJ], [44, MAJ], [41, MIN], [37, MAJ], [39, MAJ], [36, MAJ]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 0, 12, null],
      lead: [
        'F5 . . Ab5 . . C6 . . . F6 . . . . .',
        'F#5 . . A#5 . . C#6 . . . F#6 . . . . .',
        'G5 . . B5 . . D6 . . . G6 . . . . .',
        'Ab5 . . C6 . . Eb6 . . . Ab6 . G6 . F6 .',
        'C6 . . . F6 . . . Ab6 . . . C7 . . .',
        'Db7 . . . C7 . Ab6 . F6 . . . Db6 . . .',
        'Eb6 . . G6 . . Bb6 . . . Eb7 . . . . .',
        'E6 . . . . . . . . . . . . . . .',
      ],
      counter: [hold('C5'), hold('C#5'), hold('D5'), hold('Eb5'), hold('F5'), hold('F5'), hold('G5'), hold('G5')],
      counterType: 'choir',
      drums: { kick: 'x.......x.......', snare: '....x.......x...', hat: '................', tom: 'x.xxx.xxx.xxxxxx', fill: 'xxxxxxxxxxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // p.97–98 "Blizzard" (the Super Broly end credits): emotional dance-rock at ~130 BPM — heavy synth bass, electronic
    // four-on-the-floor drums, guitar riffs: breaking out of the cold. F-sharp minor.
    blizzard_credits: {
      bpm: 130,
      chords: [[42, MIN], [38, MAJ], [45, MAJ], [40, MAJ], [42, MIN], [38, MAJ], [45, MAJ], [44, MAJ]],
      bass: [0, null, 12, null, 0, 12, null, 12, 0, null, 12, null, 0, 12, 7, 12],
      arp: true,
      arp16: true,
      lead: [
        'C#6 . . . A5 . . . F#5 . . . A5 . C#6 .',
        'D6 . . . . . C#6 . A5 . . . . . . .',
        'E6 . . . C#6 . . . A5 . . . E6 . F#6 .',
        'G#6 . . . . . E6 . B5 . . . . . . .',
        'A6 . . . G#6 . F#6 . C#6 . . . F#6 . . .',
        'F#6 . . . E6 . D6 . A5 . . . D6 . . .',
        'C#6 . . . E6 . A6 . . . G#6 . E6 . . .',
        'G#6 . . . . . . . C6 . . . D#6 . . .',
      ],
      counter: [hold('F#4'), hold('F#4'), hold('E4'), hold('E4'), hold('F#4'), hold('F#4'), hold('E4'), hold('D#4')],
      counterType: 'strings',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
  });

  /** Characters with a theme of their own: a Free Battle against one of them plays it. */
  /*
   * SOUNDTRACK WAVE 5 (2026-10-15, the visual-polish phase): original cues for the fighters the roster continuation added
   * who had no music of their own — written for this sequencer, no melody of any recording reproduced.
   */
  Object.assign(SONGS, {
    // ZAMASU — a god's justice (the soundtrack PDF's "Justice Orchestra" entry, BLOCKED until Zamasu existed): a hymn
    // in D harmonic minor sung by the choir, brass holding the floor, kettle-drum rolls — holy, and wrong. Zamasu, Fused
    // Zamasu and Goku Black.
    zamasu_theme: {
      bpm: 88,
      chords: [[38, MIN], [34, MAJ], [43, MIN], [45, MAJ], [38, MIN], [41, MAJ], [43, MIN], [45, DOM7]],
      bass: [0, null, null, null, 0, null, null, null, 0, null, null, null, 7, null, 0, null],
      lead: [
        'D5 . . . F5 . . . A5 . . . D6 . . .',
        'D6 . . . C6 . . . Bb5 . . . F5 . . .',
        'G5 . . . Bb5 . . . D6 . . . G6 . . .',
        'E6 . . . C#6 . . . A5 . . . . . . .',
        'A5 . . . D6 . . . F6 . . . A6 . . .',
        'A6 . . . G6 . . . F6 . . . C6 . . .',
        'Bb5 . . . D6 . . . G6 . F6 . E6 . D6 .',
        'C#6 . . . . . . . E6 . . . A5 . . .',
      ],
      counter: [hold('A4'), hold('F4'), hold('D5'), hold('C#5'), hold('A4'), hold('C5'), hold('Bb4'), hold('G4')],
      counterType: 'brass',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '................', hat: '................', tom: '............x.x.', fill: 'x...x...x.x.xxxx' },
      leadType: 'choir',
    },
    // SUPER SAIYAN 4 — the fourth level: primal and heroic, A minor climbing through F and G to E, a saw on the tune
    // with brass under it, the drums driving. The three SSJ4 fighters (GT's own continuity).
    ssj4_theme: {
      bpm: 150,
      chords: [[45, MIN], [41, MAJ], [43, MAJ], [40, MAJ], [45, MIN], [41, MAJ], [43, MAJ], [40, SUS4]],
      bass: [0, null, 0, 12, null, 0, null, 7, 0, null, 0, 12, null, 7, 10, null],
      lead: [
        'A5 . . C6 . . E6 . . . D6 . C6 . . .',
        'A5 . . F5 . . A5 . C6 . . . . . . .',
        'B5 . . D6 . . G6 . . . F6 . E6 . D6 .',
        'E6 . . . G#5 . . . B5 . . . E6 . . .',
        'A6 . . G6 . . E6 . . . D6 . E6 . . .',
        'F6 . . E6 . . C6 . . . A5 . C6 . . .',
        'D6 . . E6 . . G6 . . . A6 . B6 . . .',
        'E6 . . . . . . . B5 . . . E6 . . .',
      ],
      counter: [hold('E5'), hold('C5'), hold('D5'), hold('B4'), hold('E5'), hold('C5'), hold('D5'), hold('E5')],
      counterType: 'brass',
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '..............xx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // COOLER — the elder brother: colder and quicker than Frieza's draught, E Phrygian (the flat second, F, in the bass
    // and the tune), staccato brass over a bell that never warms. Cooler and Metal Cooler (movie continuity).
    cooler_theme: {
      bpm: 140,
      chords: [[40, MIN], [41, MAJ], [40, MIN], [35, MAJ], [40, MIN], [41, MAJ], [43, MAJ], [35, DOM7]],
      bass: [0, null, 0, null, 1, null, 0, null, 0, null, 0, null, 1, null, 12, null],
      lead: [
        'E5 . . . F5 . E5 . B4 . . . E5 . G5 .',
        'F5 . . . A5 . C6 . . . B5 . A5 . F5 .',
        'E5 . G5 . B5 . E6 . . . D6 . B5 . . .',
        'D#6 . . . B5 . . . F#5 . . . D#5 . . .',
        'E6 . . . F6 . E6 . B5 . . . G5 . E5 .',
        'F5 . A5 . C6 . F6 . . . E6 . C6 . . .',
        'D6 . . . B5 . G5 . D6 . . . G6 . . .',
        'F#6 . . . D#6 . . . B5 . . . . . . .',
      ],
      counter: [hold('B4'), hold('C5'), hold('B4'), hold('B4'), hold('G4'), hold('A4'), hold('B4'), hold('A4')],
      counterType: 'bell',
      drums: { kick: 'x...x...x...x.x.', snare: '....x.......x...', hat: 'x.xxx.xxx.xxx.xx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // THE PHANTOM MONSTER — Hirudegarn: enormous and slow, F# minor sinking to a diminished chord, a sub bass like
    // footsteps, the choir low; and between its phrases a flute that answers, the hope the monster cannot stand.
    phantom_monster: {
      bpm: 76,
      chords: [[42, MIN], [38, MAJ], [43, MAJ], [42, MIN], [42, MIN], [40, MAJ], [36, DIM], [37, SUS4]],
      bass: [0, null, null, null, null, null, null, null, 0, null, null, null, 6, null, null, null],
      bassType: 'sub',
      lead: [
        'F#4 . . . . . . . A4 . . . G4 . . .',
        'F#4 . . . . . . . D4 . . . . . . .',
        'G4 . . . . . . . B4 . . . C5 . . .',
        'C#5 . . . . . . . . . . . . . . .',
        'F#4 . . . A4 . . . C5 . . . B4 . . .',
        'E4 . . . . . . . G#4 . . . B4 . . .',
        'C5 . . . . . . . Eb5 . . . C5 . . .',
        'C#5 . . . . . . . . . . . F#4 . . .',
      ],
      counter: [
        '. . . . . . . . C#6 . . . A5 . . .',
        '. . . . . . . . F#5 . . . . . . .',
        '. . . . . . . . D6 . . . B5 . . .',
        R16 + ' .',
        '. . . . . . . . C#6 . E6 . F#6 . . .',
        '. . . . . . . . E6 . . . B5 . . .',
        R16 + ' .',
        '. . . . . . . . C#6 . . . F#5 . . .',
      ],
      counterType: 'flute',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '................', hat: '................', tom: 'x.......x...x.x.', fill: 'x...x...x.x.xxxx' },
      power: true,
      leadType: 'choir',
    },
  });

  /*
   * SOUNDTRACK WAVE 6 (2026-10-15, the Broly / Gogeta pass): original cues — Broly's two continuities kept apart in the
   * music as in the models, the Super film's Gogeta given his own entrance, Bio-Broly his horror.
   */
  Object.assign(SONGS, {
    // THE LEGENDARY SUPER SAIYAN (the Z films' Broly): D minor at 116, a brass line that climbs out of the low register
    // and will not resolve, a choir under it, the toms rolling into every second bar. At intensity 0-2 (the build-up his
    // transformation drives) it is pulse and drums; at 3 the whole thing lands — the reveal
    legendary_z: {
      bpm: 116,
      chords: [[38, MIN], [34, MAJ], [41, MAJ], [36, MAJ], [38, MIN], [43, MIN], [34, MAJ], [45, MAJ]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 7, 12, null],
      lead: [
        'D5 . . . . . A4 . D5 . F5 . A5 . . .',
        'Bb5 . . . A5 . . . G5 . . . F5 . . .',
        'C6 . . . A5 . . . F5 . . . C5 . . .',
        'E5 . . . G5 . . . C6 . . . E6 . . .',
        'D6 . . . . . C6 . A5 . . . F5 . . .',
        'G5 . . . Bb5 . . . D6 . . . G6 . . .',
        'F6 . . . D6 . . . Bb5 . . . F5 . . .',
        'E5 . . . A5 . . . C#6 . . . E6 . . .',
      ],
      counter: [hold('A4'), hold('F4'), hold('C5'), hold('G4'), hold('F4'), hold('Bb4'), hold('D5'), hold('C#5')],
      counterType: 'choir',
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '............xxxx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // WRATHFUL (the Super film's Broly, his first change): no tune to hold on to — a low choir chanting over toms that
    // pound like a heart under strain, brass stabbing the floor, G minor at 132
    broly_wrath: {
      bpm: 132,
      chords: [[43, MIN], [39, MAJ], [41, MAJ], [43, MIN], [43, MIN], [46, MAJ], [41, MAJ], [38, MAJ]],
      bass: [0, null, 0, null, null, 0, null, null, 0, null, 0, null, 12, null, 0, null],
      bassType: 'sub',
      lead: [
        'G4 . . . G4 . Bb4 . A4 . . . G4 . . .',
        'Eb5 . . . D5 . . . C5 . Bb4 . A4 . . .',
        'F4 . . . A4 . . . C5 . . . F5 . . .',
        'D5 . . . . . . . G4 . . . . . . .',
        'G4 . Bb4 . D5 . G5 . F5 . D5 . Bb4 . . .',
        'Bb4 . D5 . F5 . Bb5 . A5 . F5 . D5 . . .',
        'C5 . . . F5 . . . A5 . . . C6 . . .',
        'D5 . . . F#5 . . . A5 . . . D6 . . .',
      ],
      counter: [hold('D4'), hold('Eb4'), hold('F4'), hold('D4'), hold('D4'), hold('F4'), hold('F4'), hold('F#4')],
      counterType: 'brass',
      drums: { kick: 'x.x...x.x.x...x.', snare: '....x.......x..x', hat: '................', tom: 'x..x..x.x..x.xxx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'choir',
    },
    // GOGETA (the Super film's, Super Saiyan Blue): bright and quick — B major leaning Lydian (the raised fourth), a saw
    // lead skating over brass and a bass that never sits still, 172. Not Fusion Reborn's swagger (gogeta_theme) and not
    // GT's primal fourth level (ssj4_theme)
    gogeta_blue_theme: {
      bpm: 172,
      chords: [[47, MAJ], [45, MAJ], [40, MAJ], [42, MAJ], [47, MAJ], [44, MIN], [40, MAJ], [42, DOM7]],
      bass: [0, null, 0, 12, null, 0, 12, null, 0, null, 0, 12, null, 7, 12, null],
      lead: [
        'B5 . D#6 . F#6 . . F6 F#6 . G#6 . A#6 . . .',
        'A6 . . G#6 F#6 . . . E6 . C#6 . E6 . . .',
        'G#6 . . E6 . B5 . . G#5 . B5 . E6 . . .',
        'F#6 . . . A#5 . . . C#6 . E6 . F#6 . . .',
        'D#6 . F#6 . B6 . . A#6 B6 . . . F#6 . . .',
        'G#6 . . . B6 . G#6 . E6 . . . D#6 . . .',
        'E6 . G#6 . B6 . . . G#6 . E6 . B5 . . .',
        'C#6 . . . E6 . . . A#6 . . . F#6 . . .',
      ],
      counter: [hold('D#5'), hold('C#5'), hold('B4'), hold('A#4'), hold('D#5'), hold('B4'), hold('G#4'), hold('A#4')],
      counterType: 'brass',
      drums: { kick: 'x...x..x..x.x...', snare: '....x.......x..x', hat: 'x.xxx.xxx.xxx.xx', tom: '..............xx', fill: 'x.x.xxx.x.xxxxxx' },
      power: true,
      leadType: 'saw',
    },
    // BIO-BROLY (the bio-liquid clone): something grown, not born — C minor slipping a semitone at a time, a bell line that
    // sounds wrong, a choir held under it, a sub bass that sinks, the drums only where a step lands (92)
    bio_terror: {
      bpm: 92,
      chords: [[36, MIN], [37, MAJ], [36, MIN], [42, DIM], [36, MIN], [44, MAJ], [43, MAJ], [42, DIM]],
      bass: [0, null, null, null, 1, null, null, null, 0, null, null, null, 6, null, null, null],
      bassType: 'sub',
      lead: [
        'C5 . . Db5 . . C5 . G4 . . . Ab4 . G4 .',
        'Db5 . . . F5 . . . Ab5 . . . G5 . . .',
        'C5 . Eb5 . G5 . . . F#5 . . . G5 . . .',
        'F#5 . . . A5 . . . C6 . . . . . . .',
        'C6 . . B5 . . C6 . G5 . . . Eb5 . . .',
        'Ab5 . . . C6 . . . Eb6 . . . D6 . . .',
        'B5 . . . D6 . . . G5 . . . B4 . . .',
        'C5 . . . . . . . F#4 . . . . . . .',
      ],
      counter: [hold('G4'), hold('Ab4'), hold('G4'), hold('A4'), hold('G4'), hold('C5'), hold('B4'), hold('A4')],
      counterType: 'choir',
      drums: { kick: 'x.......x..x....', snare: '........x.......', hat: '................', tom: '....x.......x...' },
      power: true,
      leadType: 'bell',
    },
  });

  /*
   * SOUNDTRACK WAVE 7 (2026-10-15): GT's two remaining villains without music of their own.
   */
  Object.assign(SONGS, {
    // BABY (the Tuffle parasite in Vegeta's body): revenge with a machine's patience — F# minor at 126, a cold square-lead
    // arpeggio that never changes over a sub that does, the brass entering only to gloat
    baby_revenge: {
      bpm: 126,
      chords: [[42, MIN], [38, MAJ], [40, MAJ], [37, MAJ], [42, MIN], [45, MAJ], [40, MAJ], [37, DOM7]],
      bass: [0, null, 0, null, 0, null, 12, null, 0, null, 0, null, 7, null, 12, null],
      bassType: 'sub',
      arp: true,
      lead: [
        'F#5 . A5 . C#6 . F#6 . C#6 . A5 . C#6 . F#6 .',
        'D5 . F#5 . A5 . D6 . A5 . F#5 . A5 . D6 .',
        'E5 . G#5 . B5 . E6 . B5 . G#5 . B5 . E6 .',
        'C#5 . F5 . G#5 . C#6 . . . . . . . . .',
        'F#5 . A5 . C#6 . F#6 . A6 . F#6 . C#6 . A5 .',
        'A5 . C#6 . E6 . A6 . E6 . C#6 . A5 . E5 .',
        'E5 . G#5 . B5 . E6 . G#6 . E6 . B5 . G#5 .',
        'C#6 . . . G#5 . . . F5 . . . C#5 . . .',
      ],
      counter: [hold('C#5'), hold('A4'), hold('B4'), hold('G#4'), hold('C#5'), hold('E5'), hold('B4'), hold('B4')],
      counterType: 'brass',
      counterLevel: 2,
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'bell',
    },
    // SUPER 17 (two Androids 17 joined in Hell's factory): industrial and relentless — E minor at 150, a saw riff hammering
    // one note, the snare on every beat, a choir like a furnace door under it
    hell_fighter: {
      bpm: 150,
      chords: [[40, MIN], [40, MIN], [36, MAJ], [38, MAJ], [40, MIN], [43, MAJ], [36, MAJ], [35, MAJ]],
      bass: [0, 0, null, 0, 0, null, 0, null, 0, 0, null, 0, 12, null, 0, null],
      lead: [
        'E5 . E5 . E5 . G5 . E5 . D5 . E5 . . .',
        'E5 . E5 . B5 . A5 . G5 . F#5 . E5 . . .',
        'C6 . . . B5 . . . G5 . . . E5 . . .',
        'D6 . . . C6 . . . A5 . . . F#5 . . .',
        'E6 . E6 . E6 . G6 . E6 . D6 . B5 . . .',
        'D6 . . . B5 . . . G5 . . . D5 . . .',
        'C6 . . . G5 . . . E5 . . . C5 . . .',
        'D#5 . . . F#5 . . . B5 . . . D#6 . . .',
      ],
      counter: [hold('B4'), hold('G4'), hold('G4'), hold('A4'), hold('B4'), hold('D5'), hold('E5'), hold('D#5')],
      counterType: 'choir',
      drums: { kick: 'x.x.x.x.x.x.x.x.', snare: '..x...x...x...x.', hat: 'xxxxxxxxxxxxxxxx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
  });

  /*
   * SOUNDTRACK WAVE 8 (2026-10-15): the Demon King of the original series and the Demon Realm's king, both without music
   * of their own until now.
   */
  Object.assign(SONGS, {
    // KING PICCOLO (and Piccolo Jr., his reincarnation): an old-fashioned villain's march — A minor with the raised
    // seventh, 108, brass stepping down over a slow choir, toms like a procession
    demon_king: {
      bpm: 108,
      chords: [[45, MIN], [41, MAJ], [40, MAJ], [45, MIN], [38, MIN], [41, MAJ], [40, DOM7], [40, DOM7]],
      bass: [0, null, null, 0, null, null, 7, null, 0, null, null, 0, null, 7, 12, null],
      lead: [
        'A4 . . . C5 . . . E5 . . . D5 . C5 .',
        'F5 . . . E5 . D5 . C5 . . . A4 . . .',
        'G#4 . . . B4 . . . E5 . . . G#5 . . .',
        'A5 . . . . . E5 . C5 . . . A4 . . .',
        'D5 . . . F5 . . . A5 . . . G5 . F5 .',
        'E5 . . . F5 . . . A5 . . . C6 . . .',
        'B5 . . . G#5 . . . E5 . . . D5 . . .',
        'E5 . . . G#5 . . . B5 . . . E6 . . .',
      ],
      counter: [hold('E4'), hold('C4'), hold('B3'), hold('E4'), hold('F4'), hold('A4'), hold('G#4'), hold('B4')],
      counterType: 'choir',
      drums: { kick: 'x...x...x...x.x.', snare: '....x.......x...', hat: '..x...x...x...x.', tom: 'x..x..x.........', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'brass',
    },
    // DABURA (the Demon Realm's king): E Phrygian at 138 — the flat second leaning on everything, a saw line cutting like
    // his sword, a choir chanting under it
    dabura_theme: {
      bpm: 138,
      chords: [[40, MIN], [41, MAJ], [40, MIN], [38, MIN], [40, MIN], [41, MAJ], [43, MAJ], [41, MAJ]],
      bass: [0, 0, null, 0, null, 0, 7, null, 0, 0, null, 0, null, 12, 7, null],
      lead: [
        'E5 . F5 . E5 . . . B4 . . . E5 . . .',
        'F5 . . . A5 . . . C6 . B5 . A5 . . .',
        'G5 . F5 . E5 . . . D5 . E5 . F5 . . .',
        'D5 . . . F5 . . . A5 . . . D6 . . .',
        'E6 . . . D6 . C6 . B5 . . . E5 . . .',
        'F5 . A5 . C6 . F6 . E6 . . . C6 . . .',
        'D6 . . . B5 . . . G5 . . . D5 . . .',
        'C6 . . . A5 . . . F5 . . . E5 . . .',
      ],
      counter: [hold('B4'), hold('C5'), hold('B4'), hold('A4'), hold('G4'), hold('A4'), hold('B4'), hold('A4')],
      counterType: 'choir',
      drums: { kick: 'x.x...x.x.x...x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '..........x.x.xx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'saw',
    },
  });

  /*
   * SOUNDTRACK WAVE 9 (2026-10-15, the Pride Trooper pass): Toppo's God of Destruction had been playing Goku's Super
   * Saiyan God theme (the generic 'god' form key), Dyspo shared the tournament's theme.
   */
  Object.assign(SONGS, {
    // TOPPO, GOD OF DESTRUCTION: justice thrown away — D minor at 96 leaning on the tritone (A-flat major under D), a
    // slow choir over pounding toms and a sinking sub bass, brass holding the dissonance
    toppo_destroyer: {
      bpm: 96,
      chords: [[38, MIN], [34, MAJ], [44, MAJ], [37, MAJ], [38, MIN], [43, MIN], [44, MAJ], [45, DOM7]],
      bass: [0, null, null, null, 0, null, null, null, 0, null, 0, null, null, null, 12, null],
      bassType: 'sub',
      lead: [
        'D5 . . . . . . . F5 . . . E5 . . .',
        'D5 . . . . . . . Bb4 . . . A4 . . .',
        'Ab4 . . . C5 . . . Eb5 . . . D5 . . .',
        'C#5 . . . . . . . F5 . . . G#5 . . .',
        'A5 . . . . . . . F5 . . . D5 . . .',
        'G5 . . . Bb5 . . . D6 . . . . . . .',
        'C6 . . . Ab5 . . . Eb5 . . . C5 . . .',
        'C#5 . . . E5 . . . G5 . . . A5 . . .',
      ],
      counter: [hold('A4'), hold('F4'), hold('Eb4'), hold('F4'), hold('A4'), hold('D5'), hold('Eb5'), hold('E5')],
      counterType: 'brass',
      drums: { kick: 'x.......x.x.....', snare: '....x.......x...', hat: '................', tom: 'x..x....x..x..xx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
      leadType: 'choir',
    },
    // DYSPO (the fastest Pride Trooper): E minor at 184, a saw line running arpeggios faster than the beat, hats on every
    // step, strings holding still under it
    dyspo_theme: {
      bpm: 184,
      chords: [[40, MIN], [36, MAJ], [38, MAJ], [35, MAJ], [40, MIN], [43, MAJ], [38, MAJ], [35, DOM7]],
      bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, 7, 12, null],
      lead: [
        'E5 G5 B5 E6 . . B5 . G5 B5 E6 G6 . . E6 .',
        'C6 . G5 . E5 . G5 . C6 . E6 . . . C6 .',
        'D6 F#6 . D6 A5 . F#5 . A5 D6 . . F#6 . . .',
        'B5 . D#6 . F#6 . B6 . A6 . F#6 . D#6 . B5 .',
        'E6 . B5 . G5 . E5 . G5 B5 E6 . . . B5 .',
        'G5 B5 D6 G6 . . D6 . B5 . G5 . D6 . . .',
        'F#5 A5 D6 F#6 . . A5 . D6 . F#6 . A6 . . .',
        'B5 . A5 . F#5 . D#5 . F#5 . A5 . B5 . . .',
      ],
      counter: [hold('B4'), hold('G4'), hold('A4'), hold('B4'), hold('B4'), hold('D5'), hold('A4'), hold('A4')],
      counterType: 'strings',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', fill: 'x.x.xxx.x.xxxxxx' },
      power: true,
      leadType: 'saw',
    },
  });

  /*
   * THE TWO GOGETAS (2026-10-15, the owner's brief): original scores, one per continuity, never swapped for each other.
   */
  Object.assign(SONGS, {
    // FUSION REBORN'S GOGETA (the Z film): cold, controlled, already finished with you. F minor at 84. It opens on
    // silence and an arrival motif of its own — a heavy hit, eight steps of nothing, two quick hits; then a heavy hit
    // and a whole bar of silence — low brass stabbing over sub-bass booms and timpani, a hi-hat ticking like a clock.
    // The orchestra arrives around that rhythm: dark low strings under it (intensity 1), a restrained high string motif
    // that keeps reaching up and stopping (2), low brass holding against it and timpani rolls into the turn (3)
    gogeta_z_arrival: {
      bpm: 84,
      chords: [[41, MIN], [41, MIN], [37, MAJ], [36, MAJ], [41, MIN], [34, MIN], [37, MAJ], [36, DOM7]],
      bass: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      bassType: 'sub',
      padLevel: 1,
      hits: [
        'X.......x.x.....',
        'X...............',
        'X.......x.x.....',
        'X.......X.......',
        'X.......x.x.....',
        'X...............',
        'X.......x.x...x.',
        'X...x...X...X...',
      ],
      lead: [
        'C6 . . . . . . . . . . . Ab5 . . .',
        'G5 . . . . . . . . . . . . . . .',
        'F5 . . . . . . . Ab5 . . . . . . .',
        'G5 . . . . . . . E5 . . . . . . .',
        'C6 . . . . . Db6 . C6 . . . . . . .',
        'Bb5 . . . . . . . Db6 . . . F6 . . .',
        'Ab5 . . . . . . . F5 . . . . . . .',
        'E5 . . . G5 . . . Bb5 . . . C6 . . .',
      ],
      leadType: 'strings',
      counter: [hold('C4'), hold('Ab3'), hold('Ab3'), hold('G3'), hold('C4'), hold('Db4'), hold('F3'), hold('E3')],
      counterType: 'brass',
      drums: { kick: 'x...............', snare: '............x...', hat: '....x.......x...', tom: '............x.xx', fill: 'x...x...x.x.xxxx' },
      power: false,
    },
    // THE SUPER FILM'S GOGETA (against Broly): fast, bright, icy and explosive — F# minor at 190, built in stages the
    // battle drives: the entry is only a held chord and a glittering sixteenth-note synth arpeggio (intensity 0); the
    // rock kit and a driving octave bass kick in (1); the saw-lead hook arrives with tom rolls into every bar (2); at the
    // peak (3: transformations, ultimates, the end of a fight) a rapid string ostinato, distorted power chords and
    // orchestral hits at the turnaround, then it falls back to the battle loop on its own
    gogeta_super_rush: {
      bpm: 190,
      chords: [[42, MIN], [38, MAJ], [45, MAJ], [40, MAJ], [42, MIN], [38, MAJ], [47, MIN], [37, DOM7]],
      bass: [0, null, 0, 12, 0, null, 0, 12, 0, null, 0, 12, 0, 7, 12, 7],
      bassLevel: 1,
      arp: true,
      arp16: true,
      lead: [
        'F#5 . A5 C#6 . . B5 A5 . F#5 . . C#6 . . .',
        'D6 . . C#6 . . A5 . F#5 . A5 . D6 . . .',
        'E6 . C#6 . A5 . C#6 E6 . . F#6 . E6 . . .',
        'G#6 . . . F#6 . E6 . B5 . . . G#5 . . .',
        'F#5 . A5 C#6 . . B5 A5 . F#5 . . E6 . . .',
        'F#6 . . E6 . . D6 . A5 . D6 . F#6 . . .',
        'B5 . D6 F#6 . . E6 D6 . B5 . . F#6 . . .',
        'G#6 . . F6 . . B5 . G#5 . F5 . C#6 . . .',
      ],
      leadType: 'saw',
      counter: [
        'C#5 . F#5 . C#5 . F#5 . A5 . F#5 . C#5 . F#5 .',
        'D5 . F#5 . D5 . F#5 . A5 . F#5 . D5 . F#5 .',
        'C#5 . E5 . C#5 . E5 . A5 . E5 . C#5 . E5 .',
        'B4 . E5 . B4 . E5 . G#5 . E5 . B4 . E5 .',
        'C#5 . F#5 . C#5 . F#5 . A5 . F#5 . C#5 . F#5 .',
        'D5 . F#5 . D5 . F#5 . A5 . F#5 . D5 . F#5 .',
        'B4 . D5 . B4 . D5 . F#5 . D5 . B4 . D5 .',
        'B4 . C#5 . F5 . G#5 . B5 . G#5 . F5 . C#5 .',
      ],
      counterType: 'strings',
      counterLevel: 3,
      hits: ['................', '................', '................', '................', '................', '................', '................', 'X.......X...X.X.'],
      hitLevel: 3,
      drums: { kick: 'x...x.x.x...x.x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '.............xxx', fill: 'x.x.xxxxx.xxxxxx' },
      power: true,
    },
  });

  /*
   * SOUNDTRACK WAVE 10 (2026-10-15, the continuation session): original pieces for the groups of playable fighters that
   * still had no music of their own (a Free Battle with or against one of them plays it — THEMES below).
   */
  Object.assign(SONGS, {
    // THE RED RIBBON ARMY: a parade-ground march that takes itself far too seriously — Bb major at 124, brass in front,
    // a piccolo-like flute over it, the snare rolling into every bar, a minor turn where the army's menace shows
    red_ribbon_march: {
      bpm: 124,
      chords: [[46, MAJ], [41, MAJ], [43, MIN], [38, MAJ], [39, MAJ], [46, MAJ], [36, DOM7], [41, DOM7]],
      bass: [0, null, null, null, 7, null, null, null, 0, null, null, null, 7, null, 7, null],
      lead: [
        'Bb4 . . D5 F5 . . . Bb5 . . . F5 . D5 .',
        'C5 . . . F5 . . . A5 . C6 . A5 . F5 .',
        'G5 . . . Bb5 . . . D6 . . . Bb5 . G5 .',
        'F#5 . . . A5 . . . D6 . . . . . . .',
        'Eb5 . G5 . Bb5 . . . Eb6 . . . D6 . C6 .',
        'Bb5 . . . F5 . . . D5 . F5 . Bb5 . . .',
        'C6 . . . Bb5 . . . G5 . . . E5 . . .',
        'F5 . . . A5 . . . C6 . . . Eb6 . . .',
      ],
      leadType: 'brass',
      counter: [hold('D6'), hold('C6'), hold('Bb5'), hold('A5'), hold('G5'), hold('F5'), hold('E5'), hold('A5')],
      counterType: 'flute',
      drums: { kick: 'x.......x.......', snare: 'x..x..x.x..x.xxx', hat: '................', tom: '................', fill: 'xxxxxxxxx.x.xxxx' },
      power: false,
    },
    // BOJACK'S SPACE PIRATES: a swagger — A minor at 136, a saw riff that struts up the chord and back, brass holding
    // the floor, a rock kit
    bojack_pirates: {
      bpm: 136,
      chords: [[45, MIN], [41, MAJ], [43, MAJ], [40, MAJ], [45, MIN], [36, MAJ], [38, MAJ], [40, DOM7]],
      bass: [0, null, 0, null, 12, null, 0, 7, 0, null, 0, null, 12, null, 10, 7],
      lead: [
        'A5 . . C6 . . E6 . D6 . C6 . A5 . . .',
        'F5 . . A5 . . C6 . A5 . F5 . C6 . . .',
        'G5 . . B5 . . D6 . B5 . G5 . D6 . . .',
        'G#5 . . . B5 . . . E6 . D6 . B5 . G#5 .',
        'A5 . . C6 . . E6 . A6 . G6 . E6 . . .',
        'G6 . . E6 . . C6 . E6 . G6 . C7 . . .',
        'F#6 . . . D6 . . . A5 . . . F#5 . . .',
        'E5 . G#5 . B5 . D6 . E6 . . . . . . .',
      ],
      leadType: 'saw',
      counter: [hold('E4'), hold('F4'), hold('D4'), hold('E4'), hold('E4'), hold('E4'), hold('D4'), hold('D4')],
      counterType: 'brass',
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '............x.xx', fill: 'x.x.x.x.x.xxxxxx' },
      power: true,
    },
    // THE ANDROIDS: machines that do not get tired — C# minor at 144, a glittering sixteenth-note arpeggio, a bell that
    // plays the chord and nothing warmer, eighth notes in the bass like a motor, strings holding still
    android_menace: {
      bpm: 144,
      chords: [[37, MIN], [45, MAJ], [47, MAJ], [44, MAJ], [37, MIN], [40, MAJ], [42, MIN], [44, DOM7]],
      bass: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 7, null],
      arp: true,
      arp16: true,
      lead: [
        'C#6 . . . G#5 . . . E5 . . . G#5 . C#6 .',
        'C#6 . . . E6 . . . A5 . . . . . . .',
        'D#6 . . . F#6 . . . B5 . . . D#6 . . .',
        'C6 . . . . . . . G#5 . . . . . . .',
        'E6 . . . C#6 . . . G#5 . . . C#6 . E6 .',
        'G#6 . . . E6 . . . B5 . . . E6 . . .',
        'A6 . . . F#6 . . . C#6 . . . A5 . . .',
        'G#5 . C6 . D#6 . F#6 . G#6 . . . . . . .',
      ],
      leadType: 'bell',
      counter: [hold('G#4'), hold('A4'), hold('F#4'), hold('G#4'), hold('G#4'), hold('B4'), hold('A4'), hold('G#4')],
      counterType: 'strings',
      counterLevel: 2,
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', tom: '................', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
    },
    // TAPION, THE HERO OF KONATS: a lonely song on a wooden flute — D Dorian at 88 (the raised sixth on the G chord is
    // the hope in it), strings under it, the drums only a march far off until the fight finds it
    hero_flute: {
      bpm: 88,
      chords: [[38, MIN], [36, MAJ], [34, MAJ], [36, MAJ], [38, MIN], [41, MAJ], [43, MAJ], [45, SUS4]],
      bass: [0, null, null, null, null, null, 7, null, 0, null, null, null, 12, null, null, null],
      lead: [
        'D5 . . . F5 . . . A5 . . . G5 . F5 .',
        'E5 . . . . . . . C5 . . . E5 . G5 .',
        'F5 . . . D5 . . . Bb4 . . . D5 . . .',
        'E5 . . . . . . . . . . . . . . .',
        'A5 . . . C6 . . . D6 . . . C6 . A5 .',
        'C6 . . . A5 . . . F5 . . . A5 . . .',
        'B5 . . . . . . . G5 . . . D5 . . .',
        'E5 . . . D5 . . . . . . . . . . .',
      ],
      leadType: 'flute',
      counter: [hold('A4'), hold('G4'), hold('F4'), hold('G4'), hold('F4'), hold('F4'), hold('D4'), hold('E4')],
      counterType: 'strings',
      counterLevel: 2,
      drums: { kick: 'x.......x.......', snare: '................', hat: '..x...x...x...x.', tom: '..........x...x.', fill: 'x...x...x.x.xxxx' },
      power: false,
    },
    // THE FILMS' CONQUERORS (Turles, Lord Slug, Garlic Jr., Dr. Wheelo, Hatchiyack): somebody arriving from space to own
    // the planet — Bb minor at 120, brass stepping up the chord like a herald, a choir under it, toms like a landing
    movie_conqueror: {
      bpm: 120,
      chords: [[46, MIN], [42, MAJ], [44, MAJ], [41, MAJ], [46, MIN], [37, MAJ], [39, MIN], [41, DOM7]],
      bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 7, null, null],
      lead: [
        'Bb4 . . . Db5 . . . F5 . . . Bb5 . . .',
        'Bb5 . . . Gb5 . . . Db5 . . . Gb5 . . .',
        'C6 . . . Ab5 . . . Eb5 . . . Ab5 . C6 .',
        'A5 . . . . . . . F5 . . . C5 . . .',
        'F5 . . F5 Bb5 . . . Db6 . . . C6 . Bb5 .',
        'Ab5 . . . F5 . . . Db5 . . . F5 . Ab5 .',
        'Gb5 . . . Bb5 . . . Eb6 . . . Db6 . . .',
        'C6 . . . A5 . . . Eb5 . . . F5 . . .',
      ],
      leadType: 'brass',
      counter: [hold('F4'), hold('Db4'), hold('Eb4'), hold('C4'), hold('F4'), hold('F4'), hold('Gb4'), hold('A4')],
      counterType: 'choir',
      drums: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: '..x...x...x...x.', tom: '..........x.x.xx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
    },
    // FORTUNETELLER BABA'S PALACE (her five fighters, and Lucifer's castle): a haunted fairground — E minor at 112, a bell
    // slipping up by a semitone into every phrase, a low choir, the bass walking down a tritone
    baba_palace: {
      bpm: 112,
      chords: [[40, MIN], [36, MAJ], [45, MIN], [47, DOM7], [40, MIN], [43, MAJ], [41, MAJ], [47, DOM7]],
      bass: [0, null, 7, null, 0, null, 7, null, 0, null, 7, null, 0, null, 6, null],
      lead: [
        'E5 . G5 . B5 . . . A#5 . B5 . . . . .',
        'C6 . . . G5 . . . E5 . . . G5 . . .',
        'A5 . C6 . E6 . . . D#6 . E6 . . . . .',
        'D#6 . . . F#6 . . . A5 . . . B5 . . .',
        'G5 . F#5 . E5 . . . B4 . . . E5 . . .',
        'D5 . . . G5 . . . B5 . . . D6 . . .',
        'C6 . . . A5 . . . F5 . . . A5 . . .',
        'B5 . . . A5 . . . F#5 . . . D#5 . . .',
      ],
      leadType: 'bell',
      counter: [hold('B3'), hold('C4'), hold('C4'), hold('B3'), hold('B3'), hold('B3'), hold('A3'), hold('A3')],
      counterType: 'choir',
      drums: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.', tom: '................', fill: 'x...x...x.x.xxxx' },
      power: false,
    },
  });

  /*
   * SOUNDTRACK WAVE 11 (2026-10-16): original pieces for the last playable fighters without music of their own — the
   * future's two survivors, Hit, Earth's warriors, the two boys, Universe 6's fighters (THEMES below).
   */
  Object.assign(SONGS, {
    // THE LAST HOPE (Future Trunks, Future Gohan): E minor at 138 — a lone sword-edged saw line climbing out of the
    // ruins, strings holding under it, a driving kit; the turn to B7 at the end is the refusal to give up
    last_hope: {
      bpm: 138,
      chords: [[40, MIN], [36, MAJ], [43, MAJ], [38, MAJ], [40, MIN], [36, MAJ], [45, MIN], [47, DOM7]],
      bass: [0, null, 0, null, 0, null, 0, 7, 0, null, 0, null, 12, null, 7, null],
      lead: [
        'E5 . . . G5 . B5 . . . A5 . G5 . F#5 .',
        'E5 . . . . . G5 . C6 . . . B5 . G5 .',
        'D5 . . . G5 . B5 . D6 . . . B5 . A5 .',
        'A5 . . . F#5 . . . D5 . . . . . . .',
        'E6 . . . D6 . B5 . G5 . . . B5 . E6 .',
        'G6 . . . E6 . . . C6 . . . E6 . G6 .',
        'A6 . . . E6 . . . C6 . . . A5 . . .',
        'B5 . D#6 . F#6 . A6 . B6 . . . . . . .',
      ],
      leadType: 'saw',
      counter: [hold('E4'), hold('E4'), hold('D4'), hold('D4'), hold('G4'), hold('G4'), hold('A4'), hold('B4')],
      counterType: 'strings',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '..............xx', fill: 'x.x.x.x.xxxxxxxx' },
      power: true,
    },
    // THE ASSASSIN (Hit): D minor at 100 — a cold bell placing a few notes and waiting, low brass under it, the hi-hat
    // ticking like a clock; at the end of every fourth bar the music stops dead on one orchestral hit — the time-skip
    hit_assassin: {
      bpm: 100,
      chords: [[38, MIN], [46, MAJ], [43, MIN], [45, DOM7], [38, MIN], [39, MAJ], [43, MIN], [45, DOM7]],
      bass: [0, null, null, null, 7, null, null, null, 0, null, null, null, 5, null, 7, null],
      hits: ['................', '................', '................', 'X...............', '................', '................', '................', 'X.....x.X.......'],
      lead: [
        'D6 . . . . . F6 . . . A6 . . . . .',
        'Bb5 . . . . . D6 . . . F6 . . . . .',
        'G5 . . . Bb5 . . . D6 . . . . . . .',
        'C#6 . . . . . . . . . . . E6 . . .',
        'D6 . . . A5 . . . F5 . . . A5 . D6 .',
        'Eb6 . . . . . G6 . . . Bb6 . . . . .',
        'D6 . . . Bb5 . . . G5 . . . . . . .',
        'A5 . C#6 . E6 . G6 . A6 . . . . . . .',
      ],
      leadType: 'bell',
      counter: [hold('A3'), hold('Bb3'), hold('Bb3'), hold('A3'), hold('A3'), hold('Bb3'), hold('G3'), hold('A3')],
      counterType: 'brass',
      drums: { kick: 'x.......x.......', snare: '............x...', hat: 'x.x.x.x.x.x.x.x.', tom: '................', fill: 'x...x...x...xxxx' },
      power: false,
    },
    // EARTH'S DEFENDERS (Krillin, Tien, Yamcha, Chiaotzu, Yajirobe): D major at 152 — the friends who keep turning up for
    // a fight above their weight: bright brass over a rock kit, strings answering, a bass that will not sit still
    earth_defenders: {
      bpm: 152,
      chords: [[38, MAJ], [45, MAJ], [47, MIN], [43, MAJ], [38, MAJ], [45, MAJ], [43, MAJ], [45, DOM7]],
      bass: [0, null, 0, 7, 0, null, 0, 7, 0, null, 0, 7, 12, null, 7, null],
      lead: [
        'D5 . F#5 . A5 . . . D6 . . . A5 . F#5 .',
        'E5 . A5 . C#6 . . . E6 . . . C#6 . A5 .',
        'F#5 . . . B5 . D6 . F#6 . . . D6 . B5 .',
        'G5 . . . B5 . . . D6 . . . . . . .',
        'A5 . . . F#5 . A5 . D6 . . . F#6 . . .',
        'E6 . . . C#6 . . . A5 . C#6 . E6 . . .',
        'D6 . . . B5 . . . G5 . . . B5 . D6 .',
        'C#6 . . . E6 . . . A6 . . . . . . .',
      ],
      leadType: 'brass',
      counter: [hold('A4'), hold('A4'), hold('B4'), hold('B4'), hold('A4'), hold('A4'), hold('G4'), hold('G4')],
      counterType: 'strings',
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '............xxxx', fill: 'x.x.x.x.x.x.xxxx' },
      power: true,
    },
    // LITTLE SAIYANS (Goten, Kid Trunks): C major at 144 — two boys who think a fight is a game: a xylophone-like bell
    // bouncing through the chords, a piano underneath, a light kit
    little_saiyans: {
      bpm: 144,
      chords: [[36, MAJ], [41, MAJ], [43, MAJ], [36, MAJ], [45, MIN], [41, MAJ], [43, MAJ], [43, DOM7]],
      bass: [0, null, 7, null, 0, null, 7, null, 0, null, 7, null, 0, null, 7, null],
      lead: [
        'C6 . E6 . G6 . E6 . C6 . . . G5 . . .',
        'A5 . C6 . F6 . C6 . A5 . . . F5 . . .',
        'B5 . D6 . G6 . D6 . B5 . G5 . D6 . . .',
        'C6 . . . G5 . . . E5 . G5 . C6 . . .',
        'A5 . . . C6 . E6 . A6 . . . E6 . C6 .',
        'F6 . . . C6 . . . A5 . C6 . F6 . . .',
        'G6 . F6 . E6 . D6 . B5 . . . D6 . . .',
        'G6 . . . F6 . . . D6 . B5 . G5 . . .',
      ],
      leadType: 'bell',
      counter: [hold('E4'), hold('F4'), hold('D4'), hold('E4'), hold('E4'), hold('F4'), hold('D4'), hold('F4')],
      counterType: 'piano',
      drums: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.', tom: '................', fill: 'x.x.x.x.x.x.xxxx' },
      power: false,
    },
    // UNIVERSE 6 (Cabba, Magetta): G minor at 132 — Champa's tournament on the nameless planet: a brass fanfare that
    // means business, a choir behind it, toms rolling into the turn
    u6_arena: {
      bpm: 132,
      chords: [[43, MIN], [39, MAJ], [41, MAJ], [38, MAJ], [43, MIN], [36, MIN], [38, MAJ], [38, DOM7]],
      bass: [0, null, 0, null, 7, null, 0, null, 0, null, 0, null, 7, null, 12, null],
      lead: [
        'G5 . . . Bb5 . D6 . . . G6 . . . D6 .',
        'Eb6 . . . Bb5 . G5 . . . Bb5 . Eb6 . . .',
        'F6 . . . C6 . A5 . . . C6 . F6 . . .',
        'F#6 . . . D6 . . . A5 . . . . . . .',
        'G6 . . . D6 . . . Bb5 . . . D6 . G6 .',
        'G6 . . . Eb6 . . . C6 . . . Eb6 . . .',
        'D6 . . . F#6 . . . A6 . . . F#6 . D6 .',
        'C6 . . . A5 . . . F#5 . A5 . D6 . . .',
      ],
      leadType: 'brass',
      counter: [hold('D4'), hold('Eb4'), hold('C4'), hold('D4'), hold('D4'), hold('Eb4'), hold('D4'), hold('C4')],
      counterType: 'choir',
      drums: { kick: 'x..x....x..x....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', tom: '..........x.x.xx', fill: 'x.x.x.x.x.x.xxxx' },
      power: true,
    },
  });

  const THEMES = {
    broly: 'broly_theme',
    goku: 'goku_theme', vegeta: 'vegeta_theme', frieza: 'frieza_theme', mecha_frieza: 'frieza_theme', cell: 'cell_theme',
    majin_buu: 'buu_theme', super_buu: 'buu_theme', evil_buu: 'buu_theme', kid_buu: 'kid_buu', vegito: 'vegito_theme', gogeta: 'gogeta_z_arrival', uub: 'uub_theme',
    piccolo: 'piccolo_theme', kid_gohan: 'gohan_theme', teen_gohan: 'gohan_theme', adult_gohan: 'gohan_theme', great_saiyaman: 'gohan_theme',
    gotenks: 'fusion_theme', pan: 'adventure', jiren: 'jiren_theme', beerus: 'beerus_theme',
    janemba: 'janemba_theme', super_janemba: 'super_janemba', pikkon: 'battle',
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
    // the soundtrack's PDF (p.90–97), original stingers: the drop when Ultra Instinct makes a full blow miss (staccato
    // brass, rising and falling); the five-second eyecatch bumper (bells); the fanfare as the fusion dance's fingers meet
    ui_drop: { bpm: 168, type: 'brass', notes: [['A5', 0, 1], ['C6', 1, 1], ['D6', 2, 1], ['E6', 3, 1], ['D6', 4, 1], ['E6', 5, 1], ['A6', 6, 4]], chord: [57, 64, 69, 72] },
    eyecatch: { bpm: 132, type: 'bell', notes: [['C6', 0, 1], ['E6', 1, 1], ['G6', 2, 1], ['C7', 3, 1], ['B6', 4, 1], ['G6', 5, 1], ['E6', 6, 1], ['G6', 7, 5]], chord: [60, 64, 67, 72] },
    fusion_fanfare: { bpm: 150, type: 'brass', notes: [['F5', 0, 1], ['A5', 1, 1], ['C6', 2, 1], ['F6', 3, 2], ['E6', 5, 1], ['F6', 6, 5]], chord: [53, 57, 60, 65] },
    // (2026-10-15) the three Gogetas' finishers, one per continuity, landing over the battle music as the ultimate starts:
    // Fusion Reborn's in the arrival's F minor — low brass, spaced, unhurried; the Super film's in its F# minor — a quick
    // saw run to the top; GT's Super Saiyan 4 (E minor, low and heavy brass)
    gogeta_finisher: { bpm: 84, type: 'brass', notes: [['F4', 0, 1], ['F4', 1, 1], ['C5', 4, 2], ['Ab4', 6, 1], ['F5', 8, 6]], chord: [41, 48, 53, 56] },
    gogeta_blue_finisher: { bpm: 190, type: 'saw', notes: [['F#5', 0, 1], ['A5', 1, 1], ['C#6', 2, 1], ['E6', 3, 1], ['F#6', 4, 1], ['A6', 5, 1], ['C#7', 6, 5]], chord: [42, 49, 54, 57] },
    gogeta_gt_finisher: { bpm: 132, type: 'brass', notes: [['E4', 0, 2], ['B4', 2, 1], ['E5', 3, 1], ['G5', 4, 1], ['F#5', 5, 1], ['B5', 6, 5]], chord: [40, 47, 52, 55] },
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
      const ctx = this.A.ctx;
      const gain = this.A.musicIn.gain;
      if (this.songId === id && this.timer) {
        // the same song asked for while a stop or a switch is still pending (a Free Battle retried from the pause menu:
        // the launch's stop used to silence the fight): keep it playing and bring it back up
        if (this._switchTimer) {
          clearTimeout(this._switchTimer);
          this._switchTimer = null;
          gain.cancelScheduledValues(ctx.currentTime);
          gain.setTargetAtTime(1, ctx.currentTime, 0.3);
        }
        return;
      }
      const start = () => {
        this._switchTimer = null;
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
      // a new song cancels a stop still fading out (a battle launched while nothing was playing: the launch's stop used to
      // clear the new song half a second after it started)
      clearTimeout(this._switchTimer);
      if (this.timer && this.song) {
        gain.setTargetAtTime(0, ctx.currentTime, 0.25);
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
        this._switchTimer = null;
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
      // st.type: the instrument (brass for a fanfare, bell for the eyecatch); the old stingers are the plain lead
      for (const [n, s, len] of st.notes) this._lead(out, t0 + s * stepDur, noteToMidi(n), len * stepDur, st.type || 'lead', 1.4);
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

      // song.padLevel / bassLevel / leadLevel: the intensity each layer comes in at (defaults 0 / 0 / 2) — a theme can
      // open on silence and let its orchestra arrive (Fusion Reborn's Gogeta)
      if (step === 0 && lvl >= (song.padLevel || 0)) this._pad(out, t, quality.map((iv) => root + 24 + iv), barDur * 1.02, lvl >= 2 ? 0.8 : 1);
      const b = song.bass[step];
      if (b !== null && b !== undefined && lvl >= (song.bassLevel || 0)) this._bass(out, t, root + b, stepDur * (lvl >= 1 ? 1.8 : 3), song.bassType);
      // song.hits = [bar pattern, ...] (16 steps each, cycled bar by bar; 'x' a hit, 'X' a heavier one), from song.hitLevel
      // (default 0): an orchestral impact — a low brass stab on the chord, a sub-bass boom under it, a timpani stroke
      if (song.hits && lvl >= (song.hitLevel || 0)) {
        const h = song.hits[bar % song.hits.length][step];
        if (h === 'x' || h === 'X') this._hit(out, t, root, quality, h === 'X', stepDur);
      }

      // song.arp16: the arpeggio on every sixteenth, cascading (Vegeta's awakening, a strummed guitar) — eighths otherwise
      if (song.arp && (song.arp16 || step % 2 === 0)) {
        const tones = quality.map((iv) => root + 36 + iv).concat([root + 48]);
        const idx = [0, 1, 2, 3, 2, 1, 0, 1][(song.arp16 ? step : step / 2) % 8];
        this._lead(out, t, tones[idx], stepDur * (song.arp16 ? 0.9 : 1.6), 'pluck', song.arp16 ? 0.45 : 0.55);
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
      if (lvl >= (song.leadLevel === undefined ? 2 : song.leadLevel)) {
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

    /** An orchestral impact (song.hits): a low brass stab on the chord, a sub-bass boom under it, a timpani stroke. */
    _hit(out, t, root, quality, heavy, stepDur) {
      const len = stepDur * (heavy ? 3 : 1.6);
      for (const iv of quality.concat(heavy ? [12] : [])) this._lead(out, t, root + 12 + iv, len, 'brass', heavy ? 0.85 : 0.6);
      const dur = heavy ? 1.1 : 0.6;
      const o = this.A._osc(out, t, dur, 'sine', mtof(root), mtof(root) * 0.7);
      o.gain.setValueAtTime(heavy ? 0.6 : 0.38, t);
      o.gain.exponentialRampToValueAtTime(0.001, t + dur);
      this._tom(out, t, root + 7);
      if (heavy) this._kick(out, t);
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
  Music.FORM_THEMES = {
    ssj: 'super_saiyan', ssj2: 'super_saiyan', ssj3: 'ssj3_theme', ssj_god: 'ssj_god', god: 'ssj_god', blue: 'ssj_blue', ssb: 'ssj_blue', ui: 'ultra_instinct', ultra_instinct: 'ultra_instinct',
    // the soundtrack PDF (p.90–97): Goku's Ultra Instinct forms are 'uiSign' and 'mui' (the 'ui' key above never
    // matched them); a character's own key ('charId:formId') wins over the form's (Battle._formTheme)
    uiSign: 'ui_awakening', mui: 'clash_of_gods',
    'goku:ssj': 'ssj_awakening', 'vegeta:ssj': 'vegeta_awakening', 'teen_gohan:ssj2': 'fateful_day',
  };
  /** Character themes from the soundtrack PDF, added beside THEMES (a Free Battle against one of them plays it). */
  Object.assign(THEMES, {
    ginyu: 'ginyu_force', recoome: 'ginyu_force', burter: 'ginyu_force', jeice: 'ginyu_force', guldo: 'ginyu_force',
    toppo: 'limit_survivor', kale: 'limit_survivor', caulifla: 'limit_survivor', kefla: 'limit_survivor', dyspo: 'limit_survivor',
    // wave 5 (2026-10-15): the roster continuation's fighters who had none (a Free Battle against one plays it)
    zamasu: 'zamasu_theme', fused_zamasu: 'zamasu_theme', goku_black: 'zamasu_theme',
    goku_ssj4: 'ssj4_theme', vegeta_ssj4: 'ssj4_theme', gogeta_ssj4: 'ssj4_theme',
    cooler: 'cooler_theme', metal_cooler: 'cooler_theme',
    hirudegarn: 'phantom_monster', omega_shenron: 'overwhelm',
    // wave 6: the Z films' Broly is not the Super film's (broly_theme), Bio-Broly is neither, the Super film's Gogeta is not
    // Fusion Reborn's (gogeta_theme) or GT's (ssj4_theme)
    // (the Super film's Gogeta: his own high-speed score since the owner's two-Gogetas brief; gogeta_blue_theme stays in the library)
    broly_z: 'legendary_z', bio_broly: 'bio_terror', gogeta_blue: 'gogeta_super_rush',
    // wave 7: GT's villains
    baby_vegeta: 'baby_revenge', super_17: 'hell_fighter',
    // wave 8: the two demon kings (Piccolo Jr. inherits his father's)
    king_piccolo: 'demon_king', piccolo_jr: 'demon_king', dabura: 'dabura_theme',
    // wave 9: Dyspo's own (Toppo keeps the tournament's until he becomes a god — FORM_THEMES)
    dyspo: 'dyspo_theme',
    // wave 10 (new pieces): the Red Ribbon Army, Bojack's pirates, the androids, Tapion, the films' conquerors, Baba's
    // fighters (and Lucifer's castle)
    general_blue: 'red_ribbon_march', colonel_silver: 'red_ribbon_march', metallitron: 'red_ribbon_march',
    ninja_murasaki: 'red_ribbon_march', staff_officer_black: 'red_ribbon_march', android_8: 'red_ribbon_march',
    bojack: 'bojack_pirates', zangya: 'bojack_pirates', bido: 'bojack_pirates', bujin: 'bojack_pirates', kogu: 'bojack_pirates',
    android_13: 'android_menace', android_14: 'android_menace', android_15: 'android_menace', android_16: 'android_menace',
    android_17: 'android_menace', android_18: 'android_menace', android_19: 'android_menace', android_20: 'android_menace',
    future_17: 'android_menace', future_18: 'android_menace',
    tapion: 'hero_flute',
    turles: 'movie_conqueror', lord_slug: 'movie_conqueror', garlic_jr: 'movie_conqueror', dr_wheelo: 'movie_conqueror', hatchiyack: 'movie_conqueror',
    devilman: 'baba_palace', fangs: 'baba_palace', bandages: 'baba_palace', see_through: 'baba_palace', grandpa_gohan: 'baba_palace', lucifer: 'baba_palace',
    // wave 10 (existing pieces, routed to the fighters they were written around): Super Perfect Cell is Cell; the Demon
    // King's sons; Cooler's Armored Squadron; Frieza's family and his soldiers; Planet Vegeta's Saiyans; the World
    // Tournament's fighters; the martial schools; the original series' adventure
    super_perfect_cell: 'cell_theme',
    tambourine: 'demon_king', cymbal: 'demon_king', drum: 'demon_king',
    salza: 'cooler_theme', dore: 'cooler_theme', neiz: 'cooler_theme',
    king_cold: 'frieza_theme', frost: 'frieza_theme', zarbon: 'frieza_theme', dodoria: 'frieza_theme', cui: 'frieza_theme', tagoma: 'frieza_theme',
    bardock: 'saiyan_home', tora: 'saiyan_home', fasha: 'saiyan_home', shugesh: 'saiyan_home', king_vegeta: 'saiyan_home', gine: 'saiyan_home',
    raditz: 'saiyan_home', nappa: 'saiyan_home',
    nam: 'tenkaichi', giran: 'tenkaichi', king_chappa: 'tenkaichi',
    master_shen: 'martial', mercenary_tao: 'martial', bora: 'martial',
    young_chichi: 'adventure', launch: 'adventure',
    // wave 11 (2026-10-16, new pieces): the last fighters without music — the future's survivors, Hit, Earth's warriors,
    // the two boys, Universe 6; and existing pieces routed: Videl (the World Tournament she fights in), Roshi (the martial
    // schools), Tarble (Planet Vegeta), Nail (the Namekian warrior's — Piccolo's), King Gurumes (the films' conquerors)
    future_trunks: 'last_hope', future_gohan: 'last_hope',
    hit: 'hit_assassin',
    krillin: 'earth_defenders', tien: 'earth_defenders', yamcha: 'earth_defenders', chiaotzu: 'earth_defenders', yajirobe: 'earth_defenders',
    goten: 'little_saiyans', kid_trunks: 'little_saiyans',
    cabba: 'u6_arena', magetta: 'u6_arena',
    videl: 'tenkaichi', roshi: 'martial', tarble: 'saiyan_home', nail: 'piccolo_theme', king_gurumes: 'movie_conqueror',
  });
  // the Brolys' transformations keep their own music (a generic 'ssj' would have swapped in Goku's Super Saiyan theme): the
  // Super film's Wrathful state its drums; his Super Saiyan and Full Power stay on his theme; the Z film's two forms on his
  // (the Legendary change brings it in itself, at the burst — its sequence's `song`)
  Object.assign(Music.FORM_THEMES, {
    'broly:wrath': 'broly_wrath', 'broly:ssj': 'broly_theme', 'broly:full': 'broly_theme',
    'broly_z:ssj': 'legendary_z', 'broly_z:lssj': 'legendary_z',
    // wave 9: Toppo's God of Destruction is not Goku's Super Saiyan God ('god'); the fusions keep their own themes when
    // they go Super Saiyan (the generic 'ssj' swapped in Goku's)
    'toppo:god': 'toppo_destroyer', 'gogeta:ssj': 'gogeta_z_arrival', 'gogeta:blue': 'gogeta_super_rush', 'vegito:ssj': 'vegito_theme',
    // wave 11 (2026-10-16): the fighters with a theme of their own keep it when they go Super Saiyan — the burst pushes it to
    // its peak (Battle.musicBoost) instead of the generic 'ssj' swapping in Goku's piece
    'future_trunks:ssj': 'last_hope', 'future_gohan:ssj': 'last_hope', 'goten:ssj': 'little_saiyans', 'kid_trunks:ssj': 'little_saiyans', 'cabba:ssj': 'u6_arena',
  });
  Music.noteToMidi = noteToMidi;
})();
