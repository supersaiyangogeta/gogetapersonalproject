/*
 * SCENES — Chapter 5: the pair on the road.
 *
 *   pair_on_the_road    they are walking, not flying, and that is the insult
 *   eighteen_turns      she stops being polite about it
 *   seventeen_calls_it  the fight ends because they decide it does
 *
 * Nobody transforms into anything new here. The beat is that the strongest
 * people on the planet are a nuisance to somebody who is not even in a hurry.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.pair_on_the_road = {
    id: 'pair_on_the_road',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, trunks: s.trunks, a17: s.a17, a18: s.a18 };
    },
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'calm' },
          { who: 'a18', pose: 'a17_bored', face: 'calm' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'angry' },
        ],
        mood: { amount: 0.22, color: 0x2a3244, seconds: 1.4 },
        cam: { from: { at: 'a18', off: [6, 3, 8] }, to: { at: 'a18', off: [4.2, 2, 5.6] }, look: { at: 'a18', off: [0, 0.9, 0] }, fov: 50, fov2: 42, ease: 'inOut' },
        say: { who: 'android_18', line: 'We are walking because we are not in a hurry. You should try it.', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk' }],
        cam: { from: { at: 'vegeta', local: [1, 0.5, 2.8] }, to: { at: 'vegeta', local: [0.8, 0.46, 2.2] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 42, fov2: 36 },
        say: { who: 'vegeta', line: 'Then walk over here. I have been waiting three years for this.', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'a18', pose: 'a17_bored', face: 'smirk' }],
        cam: { from: { at: 'a18', local: [0.9, 0.5, 2.6] }, look: { at: 'a18', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'android_18', line: 'Fine. My brother can watch.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['vegeta', 'a17', 'a18']) if (cast[k]) cast[k].setState('free');
      m.flags.roadMet = true;
    },
    clearMood: false,
  };

  S.eighteen_turns = {
    id: 'eighteen_turns',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, trunks: s.trunks, a18: s.a18 };
    },
    events: [
      // he is winning, and then he is not, and nothing about her has changed
      {
        pose: [
          { who: 'vegeta', pose: 'idle', face: 'grit', speed: 4 },
          { who: 'a18', pose: 'a17_bored', face: 'calm' },
        ],
        cam: { from: { at: 'vegeta', local: [0.8, 0.5, 2.4] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Why are you not tired. Why are you not slowing down.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'a18', pose: 'a17_kickW', face: 'smirk', speed: 6 }],
        cam: { from: { at: 'a18', local: [0.9, 0.5, 2.6] }, look: { at: 'a18', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'android_18', line: 'Because I do not get tired. That is the entire idea.', duration: 3.6 },
        hold: 3.8,
      },
      // the arm
      {
        pose: [
          { who: 'a18', pose: 'a17_kick', face: 'calm', speed: 16 },
          { who: 'vegeta', pose: 'knockdown', face: 'hurt' },
        ],
        screen: { flash: 0.7, color: '#ffffff' },
        sfx: { name: 'punchHeavy', who: 'a18', vol: 1.3, pitch: 0.7 },
        slow: { scale: 0.28, seconds: 1 },
        shake: { at: { at: 'vegeta' }, amount: 1 },
        vfx: { kind: 'dust', at: { at: 'vegeta' }, radius: 4, count: 16 },
        mood: { amount: 0.5, color: 0x3a1020, seconds: 1 },
        cam: { from: { at: 'vegeta', off: [2.6, 1.4, 3.2] }, to: { at: 'vegeta', off: [2, 0.9, 2.4] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 42, fov2: 34 },
        hold: 3,
      },
      {
        cam: { from: { at: 'trunks', local: [0.9, 0.5, 2.6] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'future_trunks', line: 'Father—', duration: 1.8, style: 'shout' },
        hold: 2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const v = cast.vegeta;
      if (v) {
        v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
        v.untargetable = true;
      }
      if (cast.a18) cast.a18.setState('free');
      m.flags.armBroken = true;
    },
    clearMood: false,
  };

  S.seventeen_calls_it = {
    id: 'seventeen_calls_it',
    cast: (m) => {
      const s = m.battle.story;
      return { trunks: s.trunks, vegeta: s.vegeta, a17: s.a17, a18: s.a18 };
    },
    events: [
      {
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'calm' },
          { who: 'trunks', pose: 'ft_ready', face: 'grit' },
        ],
        cam: { from: { at: 'a17', off: [3.4, 1.8, 4.4] }, to: { at: 'a17', off: [2.6, 1.4, 3.4] }, look: { at: 'a17', off: [0, 0.9, 0] }, fov: 46, fov2: 40 },
        say: { who: 'android_17', line: 'That is enough. We came for Goku, and he is not here.', duration: 4 },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'trunks', local: [0.8, 0.5, 2.4] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'future_trunks', line: 'You are not even fighting us. You are running errands.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        hide: 'a17',
        sfx: { name: 'dash', who: 'a17', vol: 0.8, pitch: 1.1 },
        vfx: { kind: 'dust', at: { at: 'a17' }, radius: 3, count: 10 },
        cam: { from: { at: 'trunks', off: [3.2, 1.8, 4.2] }, look: { at: 'trunks', off: [0, 0.8, 0] }, fov: 44 },
        hold: 1.6,
      },
      {
        hide: 'a18',
        sfx: { name: 'dash', who: 'a18', vol: 0.8, pitch: 1.2 },
        vfx: { kind: 'dust', at: { at: 'a18' }, radius: 3, count: 10 },
        music: { song: 'farewell', level: 3 },
        mood: { amount: 0.24, color: 0x2a3244, seconds: 1.4 },
        cam: { from: { at: 'vegeta', off: [2.8, 1.4, 3.6] }, to: { at: 'vegeta', off: [5, 2.6, 6.4] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 44, fov2: 52 },
        say: { who: 'future_trunks', line: 'In my time they killed everyone. Here they are bored. That is worse.', duration: 4.6, style: 'quiet' },
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
      m.flags.calledOff = true;
    },
  };
})();
