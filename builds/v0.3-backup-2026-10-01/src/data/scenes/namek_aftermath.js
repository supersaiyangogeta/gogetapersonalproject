/*
 * SCENES — what is left of Namek, and what Goku does with the last of it.
 *
 *   namek_wishes      the sky answers, and the field around him empties
 *   namek_ship_dead   Frieza's ship is intact and completely useless
 *   namek_gone        the planet goes, and nobody watching knows what happened
 *
 * The chapter's last note is deliberately quiet: no transformation, no boss, no
 * objective marker. A man alone on a planet that is running out of ground.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  /** Porunga grants the wishes, and everyone who can leave, leaves. */
  S.namek_wishes = {
    id: 'namek_wishes',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, dende: s.dende, elder: s.elder };
    },
    music: { song: 'farewell', level: 3 },
    events: [
      // the light comes from the sky rather than from anybody's hands
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'hurt' },
          { who: 'dende', pose: 'idle', face: 'shock' },
          { who: 'elder', pose: 'idle', face: 'calm' },
        ],
        mood: { amount: 0.45, color: 0xd0b840, seconds: 1.6 },
        screen: { flash: 0.35, color: '#f6e9a8' },
        vfx: { kind: 'stream', at: { at: 'goku' }, radius: 16, count: 26, color: 0xf6e9a8, life: 1.2 },
        cam: { from: { at: 'goku', off: [7, 5, 11] }, to: { at: 'goku', off: [5.4, 3.4, 8.4] }, look: { at: 'goku', off: [0, 2.6, 0] }, fov: 52, fov2: 46, ease: 'inOut' },
        say: { who: 'dende', line: 'Porunga has heard it. Everyone Frieza killed is alive again.', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'goku', local: [1.2, 0.5, 3.2] }, to: { at: 'goku', local: [0.9, 0.42, 2.4] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 42, fov2: 34 },
        say: { who: 'goku', line: 'Krillin. He is alive?', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'dende', off: [2.6, 1.4, 3.2] }, look: { at: 'dende', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'dende', line: 'He is on Earth. The second wish took everyone there. Everyone still here.', duration: 4 },
        hold: 4.2,
      },
      // the field empties: one at a time, without ceremony
      {
        vfx: { kind: 'ring', at: { at: 'elder' }, radius: 3, color: 0xf6e9a8, life: 0.6 },
        sfx: { name: 'teleport', who: 'elder', vol: 0.7 },
        hide: 'elder',
        cam: { from: { at: 'elder', off: [3, 1.6, 4] }, look: { at: 'elder', off: [0, 1, 0] }, fov: 44 },
        hold: 1.8,
      },
      {
        vfx: { kind: 'ring', at: { at: 'dende' }, radius: 3, color: 0xf6e9a8, life: 0.6 },
        sfx: { name: 'teleport', who: 'dende', vol: 0.7 },
        say: { who: 'dende', line: 'Goku — thank you. Thank you for all of it.', duration: 2.8, style: 'quiet' },
        cam: { from: { at: 'dende', off: [2.2, 1.2, 2.8] }, to: { at: 'dende', off: [2, 1.1, 2.4] }, look: { at: 'dende', off: [0, 0.6, 0] }, fov: 40, fov2: 36 },
        hold: 3,
      },
      {
        hide: 'dende',
        vfx: { kind: 'dust', at: { at: 'dende' }, radius: 2, count: 8 },
        cam: { from: { at: 'goku', off: [4, 2.2, 6] }, to: { at: 'goku', off: [6.5, 3.6, 10] }, look: { at: 'goku', off: [0, 1, 0] }, fov: 44, fov2: 54, ease: 'inOut' },
        hold: 3.2,
      },
      // and then it is only him, and the noise underneath
      {
        music: { song: null, level: 0 },
        shake: { at: { at: 'goku' }, amount: 0.35 },
        sfx: { name: 'explosionBig', vol: 0.8, pitch: 0.45 },
        cam: { from: { at: 'goku', local: [0.9, 0.55, 3 ] }, to: { at: 'goku', local: [0.7, 0.5, 2.3] }, look: { at: 'goku', off: [0, 0.38, 0] }, fov: 40, fov2: 33 },
        say: { who: 'goku', line: 'Then it is just me and the clock.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['dende', 'elder']) {
        const f = cast[k];
        if (!f) continue;
        f.setHidden(true);
        f.untargetable = true;
        f.alive = false;
      }
      if (cast.goku) {
        cast.goku.setState('free');
        cast.goku.target = null;
      }
      m.flags.wishesMade = true;
    },
    clearMood: false,
  };

  /** He reaches Frieza's ship. It is in one piece, and it does nothing. */
  S.namek_ship_dead = {
    id: 'namek_ship_dead',
    cast: (m) => ({ goku: m.battle.story.goku }),
    events: [
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'goku', local: [1.6, 1, 4.4] }, to: { at: 'goku', local: [1.2, 0.8, 3.2] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 46, fov2: 40 },
        say: { who: 'goku', line: 'Okay. Frieza came here in something. It has to still fly.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        sfx: { name: 'guardBreak', who: 'goku', vol: 0.6, pitch: 1.3 },
        vfx: { kind: 'bolt', at: { at: 'goku', off: [0, 1.2, 2.4] }, length: 3, color: 0x9ad8ff },
        screen: { flash: 0.2, color: '#9ad8ff' },
        cam: { from: { at: 'goku', local: [0.8, 0.6, 2.6] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'goku', line: 'Nothing. The whole board is dead.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        shake: { at: { at: 'goku' }, amount: 0.7 },
        sfx: { name: 'explosionBig', vol: 1, pitch: 0.4 },
        vfx: { kind: 'rocks', at: { at: 'goku' }, radius: 14, count: 12 },
        mood: { amount: 0.6, color: 0x5a1c10, seconds: 1 },
        cam: { from: { at: 'goku', off: [5, 3, 7] }, to: { at: 'goku', off: [8, 5.5, 11] }, look: { at: 'goku', off: [0, 1, 0] }, fov: 48, fov2: 58 },
        say: { who: 'goku', line: 'The Ginyu pods. They landed north of here.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      if (cast.goku) cast.goku.setState('free');
      m.flags.shipDead = true;
    },
    clearMood: false,
  };

  /** The pod lifts, the planet does not, and nobody sees which happened first. */
  S.namek_gone = {
    id: 'namek_gone',
    cast: (m) => ({ goku: m.battle.story.goku }),
    events: [
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'goku', local: [1.4, 0.9, 3.8] }, to: { at: 'goku', local: [1, 0.7, 2.8] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 44, fov2: 38 },
        say: { who: 'goku', line: 'Come on. One working button. That is all I need.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // he gets in, and the surface lets go
      {
        hide: 'goku',
        sfx: { name: 'dash', vol: 0.8, pitch: 0.7 },
        vfx: { kind: 'dust', at: { at: 'goku' }, radius: 4, count: 16 },
        cam: { from: { at: 'goku', off: [6, 3, 8] }, to: { at: 'goku', off: [11, 8, 15] }, look: { at: 'goku', off: [0, 1.5, 0] }, fov: 50, fov2: 62, ease: 'inOut' },
        hold: 2.6,
      },
      {
        screen: { flash: 1, color: '#ffffff' },
        sfx: { name: 'explosionBig', vol: 1.4, pitch: 0.3 },
        shake: { at: { at: 'goku' }, amount: 1 },
        slow: { scale: 0.35, seconds: 1.4 },
        vfx: { kind: 'explosion', at: { at: 'goku', off: [0, 4, -30] }, radius: 40, color: 0xffd8a0 },
        cam: { from: { at: 'goku', off: [14, 10, 20] }, to: { at: 'goku', off: [26, 18, 34] }, look: { at: 'goku', off: [0, 2, 0] }, fov: 62, fov2: 70 },
        hold: 3,
      },
      {
        fade: { to: 'black', seconds: 1.6 },
        music: { song: null, level: 0 },
        hold: 2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      if (cast.goku) {
        cast.goku.setHidden(true);
        cast.goku.untargetable = true;
        cast.goku.setState('scripted', { pose: 'idle', expression: 'calm' });
      }
      m.flags.namekGone = true;
    },
  };
})();
