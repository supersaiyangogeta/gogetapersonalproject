/*
 * SCENES — Chapter 5: the laboratory in the mountain.
 *
 *   gero_at_the_door   he is already inside, and the door is already closing
 *   seventeen_wakes    capsule 17 opens, and the doctor loses his own project
 *   gero_ends          17 settles the argument
 *   the_pair_leaves    two of them walk out past the people who came to stop it
 *
 * Nothing in this sequence is a boss fight, and that is the point: the worst
 * thing that happens in this chapter is a switch being thrown.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.gero_at_the_door = {
    id: 'gero_at_the_door',
    cast: (m) => {
      const s = m.battle.story;
      return { trunks: s.trunks, krillin: s.krillin, gero: s.gero };
    },
    music: { song: 'battle', level: 4 },
    events: [
      {
        pose: [
          { who: 'gero', pose: 'a19_smug', face: 'smirk' },
          { who: 'trunks', pose: 'ft_ready', face: 'grit' },
        ],
        mood: { amount: 0.4, color: 0x24283a, seconds: 1.4 },
        cam: { from: { at: 'gero', off: [4, 2.2, 5.4] }, to: { at: 'gero', off: [3, 1.6, 3.8] }, look: { at: 'gero', off: [0, 0.9, 0] }, fov: 48, fov2: 40, ease: 'inOut' },
        say: { who: 'android_20', line: 'Too slow. You were always going to be too slow.', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'trunks', local: [0.9, 0.5, 2.6] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'Do not open them. Whatever you think they are — do not.', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['trunks', 'krillin', 'gero']) if (cast[k]) cast[k].setState('free');
      m.flags.atTheDoor = true;
    },
    clearMood: false,
  };

  S.seventeen_wakes = {
    id: 'seventeen_wakes',
    cast: (m) => {
      const s = m.battle.story;
      return { trunks: s.trunks, gero: s.gero, a17: s.a17, a18: s.a18 };
    },
    events: [
      // the switch, and then a very ordinary young man steps out
      {
        show: 'a17',
        screen: { flash: 0.5, color: '#bfe4ff' },
        sfx: { name: 'guardBreak', who: 'gero', vol: 0.8, pitch: 0.7 },
        vfx: { kind: 'ring', at: { at: 'a17' }, radius: 4, color: 0x8ad4ff, life: 0.6 },
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'calm' },
          { who: 'gero', pose: 'a19_smug', face: 'smirk' },
        ],
        cam: { from: { at: 'a17', off: [3.2, 1.8, 4.2] }, to: { at: 'a17', off: [2.4, 1.2, 3 ] }, look: { at: 'a17', off: [0, 0.9, 0] }, fov: 46, fov2: 38 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'a17', local: [0.9, 0.5, 2.6] }, look: { at: 'a17', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'android_17', line: 'Doctor. You look older than the last time.', duration: 3.2 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'gero', pose: 'a19_smug', face: 'angry' }],
        cam: { from: { at: 'gero', local: [1, 0.5, 2.6] }, look: { at: 'gero', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'android_20', line: 'Back in the capsule. Now. That is an order.', duration: 3.2 },
        hold: 3.4,
      },
      {
        show: 'a18',
        pose: [{ who: 'a18', pose: 'a17_bored', face: 'smirk' }],
        sfx: { name: 'guardBreak', who: 'a18', vol: 0.7, pitch: 0.9 },
        vfx: { kind: 'ring', at: { at: 'a18' }, radius: 3.4, color: 0xffb0d0, life: 0.6 },
        cam: { from: { at: 'a18', off: [2.8, 1.6, 3.6] }, look: { at: 'a18', off: [0, 0.9, 0] }, fov: 44 },
        say: { who: 'android_18', line: 'He opened mine as well. Thank you, seventeen.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['a17', 'a18']) {
        const f = cast[k];
        if (!f) continue;
        f.setHidden(false);
        f.untargetable = false;
        f.setState('free');
      }
      if (cast.gero) cast.gero.setState('free');
      m.flags.pairAwake = true;
    },
    clearMood: false,
  };

  S.gero_ends = {
    id: 'gero_ends',
    cast: (m) => {
      const s = m.battle.story;
      return { trunks: s.trunks, gero: s.gero, a17: s.a17, a18: s.a18 };
    },
    events: [
      {
        pose: [
          { who: 'gero', pose: 'a19_smug', face: 'shock' },
          { who: 'a17', pose: 'a17_jabW', face: 'calm' },
        ],
        mood: { amount: 0.5, color: 0x2a1a30, seconds: 1 },
        cam: { from: { at: 'gero', off: [2.4, 1.4, 3 ] }, to: { at: 'gero', off: [1.9, 1.1, 2.4] }, look: { at: 'gero', off: [0, 0.9, 0] }, fov: 42, fov2: 36 },
        say: { who: 'android_20', line: 'I built you. I can switch you off just as easily—', duration: 3.4 },
        hold: 3.6,
      },
      {
        hide: 'gero',
        pose: [{ who: 'a17', pose: 'a17_jab', face: 'calm', speed: 16 }],
        screen: { flash: 0.8, color: '#ffffff' },
        sfx: { name: 'punchHeavy', who: 'a17', vol: 1.2, pitch: 0.8 },
        slow: { scale: 0.3, seconds: 0.8 },
        shake: { at: { at: 'a17' }, amount: 0.8 },
        vfx: { kind: 'explosion', at: { at: 'gero' }, radius: 6, color: 0xffb070 },
        cam: { from: { at: 'a17', local: [1, 0.6, 2.6] }, to: { at: 'a17', local: [1.4, 1, 3.6] }, look: { at: 'a17', off: [0, 0.5, 0] }, fov: 36, fov2: 46 },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'a17', local: [0.9, 0.5, 2.4] }, look: { at: 'a17', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'android_17', line: 'You could have. You did not.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const d = cast.gero;
      if (d) {
        d.setHidden(true);
        d.untargetable = true;
        d.alive = false;
      }
      for (const k of ['a17', 'a18']) if (cast[k]) cast[k].setState('free');
      m.flags.geroDown = true;
    },
    clearMood: false,
  };

  S.the_pair_leaves = {
    id: 'the_pair_leaves',
    cast: (m) => {
      const s = m.battle.story;
      return { trunks: s.trunks, krillin: s.krillin, a17: s.a17, a18: s.a18 };
    },
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [
          { who: 'trunks', pose: 'ft_ready', face: 'grit' },
          { who: 'a17', pose: 'a17_bored', face: 'smirk' },
          { who: 'a18', pose: 'a17_bored', face: 'calm' },
        ],
        cam: { from: { at: 'a17', off: [4.4, 2.2, 5.6] }, to: { at: 'a17', off: [3.4, 1.7, 4.2] }, look: { at: 'a17', off: [0, 0.9, 0] }, fov: 48, fov2: 42 },
        say: { who: 'android_18', line: 'We are not here for you. Not today, anyway.', duration: 3.4 },
        hold: 3.6,
      },
      {
        hide: 'a17',
        sfx: { name: 'dash', who: 'a17', vol: 0.8, pitch: 1.1 },
        vfx: { kind: 'dust', at: { at: 'a17' }, radius: 3, count: 10 },
        cam: { from: { at: 'trunks', off: [3, 1.8, 4 ] }, look: { at: 'trunks', off: [0, 0.8, 0] }, fov: 44 },
        hold: 1.8,
      },
      {
        hide: 'a18',
        sfx: { name: 'dash', who: 'a18', vol: 0.8, pitch: 1.2 },
        vfx: { kind: 'dust', at: { at: 'a18' }, radius: 3, count: 10 },
        cam: { from: { at: 'trunks', local: [0.9, 0.5, 2.6] }, to: { at: 'trunks', local: [0.75, 0.48, 2.2] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 40, fov2: 34 },
        say: { who: 'future_trunks', line: 'They are not the ones from my time. They are worse — they are enjoying it.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['a17', 'a18']) {
        const f = cast[k];
        if (!f) continue;
        f.setHidden(true);
        f.untargetable = true;
      }
      if (cast.trunks) cast.trunks.setState('free');
      m.flags.pairGone = true;
    },
  };
})();
