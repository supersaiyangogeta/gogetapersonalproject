/*
 * SCENES — Gohan against the second form.
 *
 *   frieza_second_taunt   he explains, pleasantly, what he is going to do
 *   gohan_rage            a four-year-old stops being frightened
 *   gohan_spent           what is left of him afterwards, and Krillin dragging him out
 *
 * The rage is staged rather than announced: stillness, shaking, the head coming
 * up, and then he is already moving. The state it turns on (`rage`) is a real
 * fighter state with its own numbers, aura and behaviour — see the mission.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  S.frieza_second_taunt = {
    id: 'frieza_second_taunt',
    cast: (m) => {
      const s = m.battle.story;
      return { gohan: s.gohan, krillin: s.krillin, frieza: s.frieza, piccolo: s.piccolo };
    },
    music: { song: 'battle', level: 2 },
    events: [
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'smirk' },
          { who: 'gohan', pose: 'idle', face: 'hurt' },
          { who: 'krillin', pose: 'idle', face: 'hurt' },
          { who: 'piccolo', pose: 'knockdown', face: 'ko' },
        ],
        mood: { amount: 0.3, color: 0x2a2440, seconds: 1.6 },
        cam: { from: { at: 'frieza', local: [1.4, 0.8, 4.4] }, to: { at: 'frieza', local: [1, 0.5, 2.8] }, look: { at: 'frieza' }, fov: 46, fov2: 38 },
        say: { who: 'frieza', line: 'The Namekian first, I think. Then the bald one. Then the brat.', duration: 4 },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'piccolo', off: [2.2, 1, 2.6] }, look: { at: 'piccolo' }, fov: 42 },
        say: { who: 'krillin', line: 'Piccolo — get up. Please get up.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { from: { at: 'gohan', local: [0.7, 0.55, 2.4] }, to: { at: 'gohan', local: [0.45, 0.5, 1.8] }, look: { at: 'gohan', off: [0, 0.32, 0] }, fov: 38, fov2: 30 },
        pose: [{ who: 'gohan', pose: 'idle', face: 'angry', speed: 2 }],
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['gohan', 'frieza', 'krillin']) if (cast[k]) cast[k].setState('free');
      m.flags.tauntGiven = true;
    },
  };

  S.gohan_rage = {
    id: 'gohan_rage',
    cast: (m) => {
      const s = m.battle.story;
      return { gohan: s.gohan, frieza: s.frieza, krillin: s.krillin };
    },
    music: { song: null, level: 0 },
    events: [
      // stillness first
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'angry', speed: 1 }],
        cam: { from: { at: 'gohan', local: [0.5, 0.5, 2.1] }, look: { at: 'gohan', off: [0, 0.34, 0] }, fov: 32 },
        hold: 2.6,
      },
      // shaking: small, fast camera trauma and a held close-up
      {
        shake: { at: { at: 'gohan' }, amount: 0.3 },
        sfx: { name: 'kiCharge', who: 'gohan', vol: 0.5, pitch: 1.3 },
        vfx: { kind: 'stream', at: { at: 'gohan' }, radius: 2, count: 8, color: 0xf4f0ff, life: 0.5 },
        cam: { from: { at: 'gohan', local: [0.4, 0.46, 1.7] }, to: { at: 'gohan', local: [0.3, 0.42, 1.35] }, look: { at: 'gohan', off: [0, 0.33, 0] }, fov: 30, fov2: 26 },
        hold: 2.8,
      },
      // the head comes up
      {
        music: { song: 'battle', level: 5 },
        pose: [{ who: 'gohan', pose: 'kg_masenkoW', face: 'shout', speed: 14 }],
        screen: { flash: 0.5, color: '#f0eaff' },
        sfx: { name: 'explosionBig', who: 'gohan', vol: 0.9, pitch: 1.3 },
        vfx: { kind: 'ring', at: { at: 'gohan' }, radius: 9, color: 0xe8e0ff, life: 0.7 },
        shake: { at: { at: 'gohan' }, amount: 0.9 },
        cam: { from: { at: 'gohan', local: [0.6, 0.2, 2.2] }, to: { at: 'gohan', local: [0.35, 0.5, 3.4] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 30, fov2: 44 },
        say: { who: 'gohan', line: 'Leave them ALONE!', duration: 2.2, style: 'shout' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'frieza', local: [1, 0.5, 2.6] }, look: { at: 'frieza' }, fov: 38 },
        say: { who: 'frieza', line: 'From the child? Really?', duration: 2.2 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const g = cast.gohan;
      if (g) {
        g.setState('free');
        g.ki = Math.max(g.ki, 70);
        g.target = cast.frieza;
      }
      if (cast.frieza) {
        cast.frieza.setState('free');
        cast.frieza.target = g;
      }
      // the scene is what turns the rage on, so skipping it lands in the same state
      const mech = SL.Mechanics.hiddenPotential;
      if (g && mech && mech.unleash) mech.unleash(g);
      m.flags.gohanRaged = true;
      m.flags.unleashed = !!(g && g.mech && g.mech.unleashed);
    },
  };

  S.gohan_spent = {
    id: 'gohan_spent',
    cast: (m) => {
      const s = m.battle.story;
      return { gohan: s.gohan, krillin: s.krillin, frieza: s.frieza, piccolo: s.piccolo };
    },
    events: [
      {
        pose: [
          { who: 'gohan', pose: 'knockdown', face: 'hurt' },
          { who: 'frieza', pose: 'idle', face: 'angry' },
        ],
        mood: { amount: 0.35, color: 0x2a2440, seconds: 1.2 },
        cam: { from: { at: 'gohan', off: [2.4, 1.2, 3] }, to: { at: 'gohan', off: [1.8, 0.7, 2.2] }, look: { at: 'gohan' }, fov: 44, fov2: 36 },
        say: { who: 'frieza', line: 'A mere child did that to me...? Unforgivable.', duration: 3.6 },
        hold: 3.8,
      },
      {
        move: { who: 'krillin', at: 'gohan', off: [1.4, 0, 1.2], face: 'gohan', seconds: 1.4 },
        pose: [{ who: 'krillin', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'gohan', off: [2, 0.8, 2.4] }, look: { at: 'gohan' }, fov: 40 },
        say: { who: 'krillin', line: 'I have got him. Gohan, stay down, I have got you.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const g = cast.gohan;
      if (g) {
        g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
        g.untargetable = true;
      }
      m.flags.gohanSpent = true;
    },
  };
})();
