/*
 * SCENE — "Fine. Have it your way."
 *
 * The turn that the whole saga has been walking toward, and it is built as a
 * performance rather than a caption:
 *
 *   1. Frieza, bored, says the thing he should not have said
 *   2. Goku goes completely still — no line, no aura, nothing
 *   3. the camera pushes in while he shakes: fists, shoulders, breathing
 *   4. the sound drops out under it
 *   5. Frieza keeps talking, because he has not understood yet
 *   6. Goku's head comes up and he screams
 *
 * The two spoken lines here are the ones the owner specified, kept exactly.
 * Everything else in the beat is staging: pose, camera, shake, silence.
 *
 * WHEN (owner, round 4): only on the destroyed Namek, with Frieza at 100% and Goku's gi
 * already torn — namek_end plays it after the 100% fight has torn the gi, never before.
 * The scene does not tear the gi itself; it requires it.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  S.frieza_krillin_line = {
    id: 'frieza_krillin_line',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza, gohan: s.gohan };
    },
    music: { song: 'finale', level: 2 },
    events: [
      // 1. he is bored, and he says it the way somebody discusses the weather
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'smirk' },
          { who: 'goku', pose: 'idle', face: 'hurt', speed: 2 },
        ],
        cam: { from: { at: 'frieza', local: [1.3, 0.6, 3.4] }, to: { at: 'frieza', local: [0.95, 0.45, 2.4] }, look: { at: 'frieza' }, fov: 44, fov2: 36, ease: 'inOut' },
        say: {
          who: 'frieza',
          line: "Fine. Have it your way. I'll just blast you into oblivion like I did that other Earthling.",
          duration: 5,
        },
        flag: { krillinMentionedByFrieza: true },
        hold: 5.2,
      },
      // 2. nothing. He does not answer, and he does not move.
      {
        music: { song: null, level: 0 },
        mood: { amount: 0.5, color: 0x241028, seconds: 1.4 },
        pose: [{ who: 'goku', pose: 'idle', face: 'angry', speed: 1 }],
        cam: { from: { at: 'goku', local: [0.9, 0.6, 3 ] }, to: { at: 'goku', local: [0.6, 0.5, 2.1] }, look: { at: 'goku', off: [0, 0.38, 0] }, fov: 40, fov2: 32, ease: 'inOut' },
        hold: 3.6,
      },
      // 3. the shaking: small, constant, and the camera keeps closing
      {
        shake: { at: { at: 'goku' }, amount: 0.22 },
        sfx: { name: 'kiCharge', who: 'goku', vol: 0.35, pitch: 0.6 },
        pose: [{ who: 'goku', pose: 'g_kaiokenFlex', face: 'angry', speed: 2 }],
        cam: { from: { at: 'goku', local: [0.45, 0.45, 1.8] }, to: { at: 'goku', local: [0.3, 0.42, 1.3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 30, fov2: 25 },
        hold: 3.4,
      },
      {
        shake: { at: { at: 'goku' }, amount: 0.3 },
        vfx: { kind: 'dust', at: { at: 'goku' }, radius: 2.4, count: 8 },
        cam: { from: { at: 'goku', local: [0.28, 0.42, 1.15] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 23 },
        hold: 3,
      },
      // 4. he is still talking. He genuinely has not understood.
      {
        cam: { from: { at: 'frieza', local: [1, 0.5, 2.6] }, look: { at: 'frieza' }, fov: 36 },
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        say: { who: 'frieza', line: 'He made a very small noise, if it helps. Barely anything at all.', duration: 3.6 },
        hold: 3.8,
      },
      // 5. the head comes up
      {
        music: { song: 'finale', level: 6 },
        pose: [{ who: 'goku', pose: 'g_kaiokenFlex', face: 'shout', speed: 16 }],
        screen: { flash: 0.55, color: '#ffe8e0' },
        sfx: { name: 'explosionBig', who: 'goku', vol: 1, pitch: 1.1 },
        vfx: { kind: 'ring', at: { at: 'goku' }, radius: 11, color: 0xffd0b0, life: 0.7 },
        shake: { at: { at: 'goku' }, amount: 1 },
        cam: { from: { at: 'goku', local: [0.5, 0.45, 1.6] }, to: { at: 'goku', local: [0.3, 0.7, 3.2] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 26, fov2: 42 },
        say: { who: 'goku', line: "DON'T YOU DARE TALK ABOUT KRILLIN!", duration: 3, style: 'shout' },
        hold: 3.2,
      },
      // 6. and Frieza finally looks at him properly
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'frieza', local: [0.9, 0.45, 2.4] }, to: { at: 'frieza', local: [0.65, 0.35, 1.8] }, look: { at: 'frieza' }, fov: 38, fov2: 30 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      m.flags.krillinMentionedByFrieza = true;
      m.flags.rageShown = true;
      if (cast.goku) {
        cast.goku.setState('free');
        cast.goku.ki = Math.max(cast.goku.ki, 60);
      }
      if (cast.frieza) cast.frieza.setState('free');
    },
    clearMood: false,
  };

  /** The line he says once the gold is up, before control returns. */
  S.goku_pays_for_that = {
    id: 'goku_pays_for_that',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza };
    },
    events: [
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry', speed: 3 }],
        cam: { from: { at: 'goku', local: [0.8, 0.62, 3 ] }, to: { at: 'goku', local: [0.5, 0.52, 2.1] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 40, fov2: 32 },
        say: { who: 'goku', line: "You monster, you'll pay for that!", duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'frieza', local: [1, 0.5, 2.6] }, look: { at: 'frieza' }, fov: 36 },
        say: { who: 'frieza', line: 'Then come and collect.', duration: 2.2 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      if (cast.goku) cast.goku.setState('free');
      if (cast.frieza) cast.frieza.setState('free');
      m.flags.payLine = true;
    },
  };
})();
