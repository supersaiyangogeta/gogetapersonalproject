/*
 * SCENES — Chapter 6: the two absorptions.
 *
 *   cell_takes_17      the tail, and then there is one android left
 *   tien_holds_him     a man with no chance buying minutes with his own life
 *   cell_takes_18      Vegeta steps aside, and the sentence finishes itself
 *   perfect_arrives    the finished article, and how little it cares
 *
 * Both absorptions are staged the same way on purpose: a grab, a moment where
 * somebody could still stop it, and then a transformation that nobody wanted.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.cell_takes_17 = {
    id: 'cell_takes_17',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell, a17: s.a17, tien: s.tien };
    },
    music: { song: null, level: 0 },
    events: [
      {
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'shock' },
          { who: 'cell', pose: 'cl_tailW', face: 'smirk' },
          { who: 'piccolo', pose: 'knockdown', face: 'hurt' },
        ],
        mood: { amount: 0.45, color: 0x1e2a1e, seconds: 1.2 },
        cam: { from: { at: 'a17', off: [3.4, 1.8, 4.4] }, to: { at: 'a17', off: [2.4, 1.3, 3.2] }, look: { at: 'a17', off: [0, 0.9, 0] }, fov: 46, fov2: 38 },
        say: { who: 'android_17', line: 'Get that thing away from me—', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      // the grab: one frame, and then it is a formality
      {
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'shout', speed: 16 }],
        sfx: { name: 'punchHeavy', who: 'cell', vol: 1.1, pitch: 0.7 },
        screen: { flash: 0.5, color: '#a8e08a' },
        slow: { scale: 0.32, seconds: 0.9 },
        shake: { at: { at: 'a17' }, amount: 0.8 },
        vfx: { kind: 'stream', at: { at: 'cell' }, radius: 4, count: 16, color: 0xa8e08a, life: 0.7 },
        cam: { from: { at: 'cell', local: [0.9, 0.6, 2.6] }, to: { at: 'cell', local: [0.7, 0.5, 2 ] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 32 },
        hold: 2.8,
      },
      {
        hide: 'a17',
        vfx: { kind: 'dust', at: { at: 'a17' }, radius: 3, count: 10 },
        sfx: { name: 'kiUp', who: 'cell', vol: 1, pitch: 0.8 },
        cam: { from: { at: 'cell', off: [3, 1.6, 4 ] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 44 },
        say: { who: 'piccolo', line: 'No. No, no —', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const a = cast.a17;
      if (a) {
        a.setHidden(true);
        a.untargetable = true;
        a.alive = false;
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.seventeenTaken = true;
    },
    clearMood: false,
  };

  S.tien_holds_him = {
    id: 'tien_holds_him',
    cast: (m) => {
      const s = m.battle.story;
      return { tien: s.tien, cell: s.cell, piccolo: s.piccolo };
    },
    music: { song: 'finale', level: 4 },
    events: [
      {
        show: 'tien',
        pose: [{ who: 'tien', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'tien', off: [3, 1.6, 4 ] }, to: { at: 'tien', off: [2.2, 1.2, 3 ] }, look: { at: 'tien', off: [0, 0.9, 0] }, fov: 46, fov2: 38 },
        say: { who: 'tien', line: 'Go. I will hold him here as long as I can hold anything.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk' }],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, look: { at: 'cell', off: [0, 0.7, 0] }, fov: 42 },
        say: { who: 'cell', line: 'You cannot. But by all means.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const t = cast.tien;
      if (t) {
        t.setHidden(false);
        t.untargetable = false;
        t.setState('free');
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.tienStood = true;
    },
    clearMood: false,
  };

  S.cell_takes_18 = {
    id: 'cell_takes_18',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, cell: s.cell, a18: s.a18, trunks: s.trunks };
    },
    events: [
      {
        pose: [
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk' },
          { who: 'a18', pose: 'a17_bored', face: 'shock' },
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
        ],
        mood: { amount: 0.4, color: 0x2a2440, seconds: 1.4 },
        cam: { from: { at: 'vegeta', local: [1, 0.55, 2.8] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Let him have her. I want him finished. I want the real fight.', duration: 4.4 },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'trunks', local: [0.9, 0.55, 2.6] }, look: { at: 'trunks', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'Father, if he finishes, none of us can stop him. None of us.', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      {
        hide: 'a18',
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'shout', speed: 16 }],
        screen: { flash: 0.6, color: '#a8e08a' },
        sfx: { name: 'kiUp', who: 'cell', vol: 1.1, pitch: 0.7 },
        slow: { scale: 0.3, seconds: 1 },
        shake: { at: { at: 'cell' }, amount: 0.9 },
        vfx: { kind: 'stream', at: { at: 'cell' }, radius: 5, count: 20, color: 0xa8e08a, life: 0.8 },
        cam: { from: { at: 'cell', local: [1, 0.6, 3 ] }, to: { at: 'cell', local: [0.8, 0.55, 2.2] }, look: { at: 'cell', off: [0, 0.7, 0] }, fov: 42, fov2: 34 },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const a = cast.a18;
      if (a) {
        a.setHidden(true);
        a.untargetable = true;
        a.alive = false;
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.eighteenTaken = true;
    },
    clearMood: false,
  };

  S.perfect_arrives = {
    id: 'perfect_arrives',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, cell: s.cell, trunks: s.trunks };
    },
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk' }],
        mood: { amount: 0.3, color: 0x203828, seconds: 1.6 },
        cam: { from: { at: 'cell', off: [4.4, 2.4, 5.6] }, to: { at: 'cell', off: [3, 1.6, 3.8] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 48, fov2: 40, ease: 'inOut' },
        say: { who: 'cell', line: 'Perfect. That is the only word for it, so I will use it.', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk' }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.55, 2.6] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Good. Now show me what I waited for.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['vegeta', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.perfectShown = true;
    },
    clearMood: false,
  };
})();
