/*
 * SCENES — Chapter 6: the thing from the laboratory.
 *
 *   cell_sighting   an empty town, and clothes with nobody in them
 *   cell_names_it   he explains what he is, because he enjoys explaining
 *   cell_escapes    the oldest trick in the book, and he is gone
 *
 * The horror beat of the chapter is deliberately quiet: no roar, no transformation,
 * just a street where everybody was a minute ago.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.cell_sighting = {
    id: 'cell_sighting',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell };
    },
    music: { song: null, level: 0 },
    events: [
      // the place first, and the silence
      {
        pose: [{ who: 'piccolo', pose: 'idle', face: 'grit' }],
        mood: { amount: 0.42, color: 0x2a3040, seconds: 1.8 },
        cam: { from: { at: 'piccolo', off: [7, 4, 9] }, to: { at: 'piccolo', off: [4.6, 2.4, 6 ] }, look: { at: 'piccolo', off: [0, 1, 0] }, fov: 52, fov2: 44, ease: 'inOut' },
        say: { who: 'piccolo', line: 'Nobody. Not a body, not a mark — everyone who lived here is simply not here.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      {
        show: 'cell',
        pose: [{ who: 'cell', pose: 'cl_hunch', face: 'smirk' }],
        sfx: { name: 'burrow', who: 'cell', vol: 0.8, pitch: 0.7 },
        vfx: { kind: 'dust', at: { at: 'cell' }, radius: 4, count: 14 },
        cam: { from: { at: 'cell', off: [5, 2.6, 6.4] }, to: { at: 'cell', off: [3.4, 1.8, 4.4] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 48, fov2: 40 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'cell', local: [1.1, 0.6, 3 ] }, to: { at: 'cell', local: [0.85, 0.52, 2.3] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 44, fov2: 36 },
        say: { who: 'cell', line: 'They are not gone. They are in here, with the rest of the town.', duration: 4.4 },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const c = cast.cell;
      if (c) {
        c.setHidden(false);
        c.untargetable = false;
        c.setState('free');
      }
      if (cast.piccolo) cast.piccolo.setState('free');
      m.flags.sighted = true;
    },
    clearMood: false,
  };

  S.cell_names_it = {
    id: 'cell_names_it',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell };
    },
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
          { who: 'piccolo', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'cell', line: 'Gero recorded all of you. Goku, Vegeta, Piccolo — you are all in this body somewhere.', duration: 5 },
        hold: 5.2,
      },
      {
        cam: { from: { at: 'piccolo', local: [0.9, 0.55, 2.6] }, look: { at: 'piccolo', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'piccolo', line: 'And you are eating people to finish yourself. Charming.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_hunch', face: 'angry' }],
        cam: { from: { at: 'cell', local: [0.8, 0.5, 2.4] }, to: { at: 'cell', local: [0.7, 0.48, 2 ] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 34 },
        say: { who: 'cell', line: 'I need two of them. Seventeen and eighteen. Everything else is an appetiser.', duration: 4.6 },
        hold: 4.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['piccolo', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.named = true;
    },
    clearMood: false,
  };

  S.cell_escapes = {
    id: 'cell_escapes',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell };
    },
    events: [
      {
        pose: [
          { who: 'cell', pose: 'cl_kameW', face: 'smirk', speed: 8 },
          { who: 'piccolo', pose: 'guard', face: 'grit' },
        ],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.6] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'cell', line: 'You are stronger than the recording said. I will come back for you last.', duration: 4 },
        hold: 4.2,
      },
      // solar flare: the whole screen goes, and so does he
      {
        screen: { flash: 1, color: '#ffffff' },
        sfx: { name: 'kiBlastBig', who: 'cell', vol: 1.2, pitch: 1.3 },
        slow: { scale: 0.4, seconds: 0.8 },
        hide: 'cell',
        cam: { from: { at: 'piccolo', local: [0.8, 0.5, 2.4] }, look: { at: 'piccolo', off: [0, 0.6, 0] }, fov: 38 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'piccolo', pose: 'idle', face: 'angry' }],
        mood: { amount: 0.36, color: 0x2a3040, seconds: 1.4 },
        cam: { from: { at: 'piccolo', off: [3.4, 2, 4.4] }, to: { at: 'piccolo', off: [6, 3.4, 8] }, look: { at: 'piccolo', off: [0, 0.9, 0] }, fov: 44, fov2: 52 },
        say: { who: 'piccolo', line: 'He is going after the androids. Which means he is going to be worse than this.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const c = cast.cell;
      if (c) {
        c.setHidden(true);
        c.untargetable = true;
      }
      if (cast.piccolo) cast.piccolo.setState('free');
      m.flags.cellEscaped = true;
    },
  };
})();
