/*
 * SCENES — Chapter 5, Age 767: the morning the Androids arrive.
 *
 *   androids_arrive   two strangers standing in the road, exactly on time
 *   goku_virus        the fight stops because his heart does
 *   vegeta_arrives    the one person nobody wanted to owe a favour
 *   gero_flees        the doctor decides he would rather be somewhere else
 *
 * The turn in this chapter is not a transformation, it is an illness: the
 * biggest moment is Goku putting a hand on his chest and going down in the
 * middle of a fight he was winning.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.androids_arrive = {
    id: 'androids_arrive',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, vegeta: s.vegeta, krillin: s.krillin, a19: s.a19, a20: s.a20 };
    },
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'a19', pose: 'a19_smug', face: 'smirk' },
          { who: 'a20', pose: 'a19_smug', face: 'calm' },
          { who: 'goku', pose: 'idle', face: 'grit' },
          { who: 'krillin', pose: 'idle', face: 'shock' },
        ],
        mood: { amount: 0.24, color: 0x2a3040, seconds: 1.4 },
        cam: { from: { at: 'a19', off: [7, 3.4, 9] }, to: { at: 'a19', off: [5, 2.2, 6.4] }, look: { at: 'a19', off: [0, 1, 0] }, fov: 50, fov2: 42, ease: 'inOut' },
        say: { who: 'krillin', line: 'Ten in the morning. He said ten in the morning and there they are.', duration: 4 },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'a20', local: [1.1, 0.5, 3 ] }, look: { at: 'a20', off: [0, 0.5, 0] }, fov: 42 },
        say: { who: 'android_20', line: 'Son Goku. Twenty-three years of work, and you have not changed a bit.', duration: 4.4 },
        hold: 4.6,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'goku', local: [0.9, 0.5, 2.6] }, to: { at: 'goku', local: [0.7, 0.45, 2.1] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 40, fov2: 34 },
        say: { who: 'goku', line: 'Then let us do this away from the city. Nobody else has to be here.', duration: 4 },
        hold: 4.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['goku', 'a19', 'a20']) if (cast[k]) cast[k].setState('free');
      m.flags.androidsArrived = true;
    },
    clearMood: false,
  };

  S.goku_virus = {
    id: 'goku_virus',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, a19: s.a19, vegeta: s.vegeta, krillin: s.krillin };
    },
    events: [
      // it starts as nothing: a stumble in the middle of an exchange
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'hurt', speed: 3 }],
        music: { song: null, level: 0 },
        sfx: { name: 'heartbeat', who: 'goku', vol: 0.9 },
        cam: { from: { at: 'goku', local: [0.7, 0.5, 2.4] }, to: { at: 'goku', local: [0.55, 0.46, 1.9] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 38, fov2: 32 },
        hold: 2.6,
      },
      {
        sfx: { name: 'heartbeat', who: 'goku', vol: 1.1 },
        shake: { at: { at: 'goku' }, amount: 0.3 },
        screen: { flash: 0.25, color: '#3a0a12' },
        cam: { from: { at: 'goku', local: [0.45, 0.45, 1.5] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 28 },
        say: { who: 'goku', line: 'My chest — not now, not now...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'knockdown', face: 'hurt' }],
        sfx: { name: 'groundImpact', who: 'goku', vol: 0.9 },
        vfx: { kind: 'dust', at: { at: 'goku' }, radius: 3, count: 12 },
        mood: { amount: 0.45, color: 0x3a1020, seconds: 1 },
        cam: { from: { at: 'goku', off: [2.6, 1.2, 3.2] }, to: { at: 'goku', off: [2, 0.8, 2.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 44, fov2: 38 },
        say: { who: 'krillin', line: 'Goku! The medicine — it is at home, he left it at home!', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'a19', pose: 'a19_smug', face: 'smirk' }],
        cam: { from: { at: 'a19', local: [1, 0.5, 2.6] }, look: { at: 'a19', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'android_19', line: 'How disappointing. I was enjoying the energy.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const g = cast.goku;
      if (g) {
        g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
        g.untargetable = true;
      }
      if (cast.a19) cast.a19.setState('free');
      m.flags.virusStruck = true;
    },
    clearMood: false,
  };

  S.vegeta_arrives = {
    id: 'vegeta_arrives',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, a19: s.a19, goku: s.goku, krillin: s.krillin };
    },
    music: { song: 'finale', level: 4 },
    events: [
      {
        show: 'vegeta',
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk' }],
        sfx: { name: 'dash', who: 'vegeta', vol: 0.9, pitch: 0.8 },
        vfx: { kind: 'dust', at: { at: 'vegeta' }, radius: 4, count: 14 },
        cam: { from: { at: 'vegeta', off: [3.4, 1.8, 4.6] }, to: { at: 'vegeta', off: [2.4, 1.2, 3.2] }, look: { at: 'vegeta', off: [0, 0.8, 0] }, fov: 46, fov2: 38 },
        say: { who: 'vegeta', line: 'Move, Kakarot. You are embarrassing both of us.', duration: 3.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'powerUp', face: 'shout', speed: 10 }],
        screen: { flash: 0.7, color: '#fff0c0' },
        sfx: { name: 'transformBurst', who: 'vegeta', vol: 1.1 },
        vfx: { kind: 'ring', at: { at: 'vegeta' }, radius: 9, color: 0xffd45a, life: 0.6 },
        shake: { at: { at: 'vegeta' }, amount: 0.8 },
        transform: { who: 'vegeta', form: 'ssj' },
        cam: { from: { at: 'vegeta', local: [0.7, 0.5, 2.4] }, to: { at: 'vegeta', local: [0.9, 0.9, 3.6] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 34, fov2: 46 },
        say: { who: 'vegeta', line: 'Yes. I can do it too. I have been able to for a while now.', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'a19', pose: 'a19_smug', face: 'shock' }],
        cam: { from: { at: 'a19', local: [1, 0.5, 2.6] }, look: { at: 'a19', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'android_19', line: 'That is... not in my data.', duration: 2.6 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const v = cast.vegeta;
      if (v) {
        v.setHidden(false);
        v.untargetable = false;
        const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
        if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
        v.setState('free');
      }
      if (cast.a19) cast.a19.setState('free');
      m.flags.vegetaArrived = true;
    },
    clearMood: false,
  };

  S.gero_flees = {
    id: 'gero_flees',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, a20: s.a20, goku: s.goku };
    },
    events: [
      {
        pose: [
          { who: 'a20', pose: 'a19_smug', face: 'shock' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk' },
        ],
        cam: { from: { at: 'a20', off: [2.6, 1.4, 3.4] }, to: { at: 'a20', off: [2, 1.1, 2.6] }, look: { at: 'a20', off: [0, 0.9, 0] }, fov: 44, fov2: 38 },
        say: { who: 'vegeta', line: 'Your turn, doctor. Or do you only build them.', duration: 3.4 },
        hold: 3.6,
      },
      {
        hide: 'a20',
        sfx: { name: 'dash', who: 'a20', vol: 0.8, pitch: 1.2 },
        vfx: { kind: 'dust', at: { at: 'a20' }, radius: 3.4, count: 12 },
        cam: { from: { at: 'vegeta', off: [3.4, 2, 4.4] }, to: { at: 'vegeta', off: [6, 3.4, 8] }, look: { at: 'vegeta', off: [0, 0.9, 0] }, fov: 46, fov2: 54 },
        say: { who: 'vegeta', line: 'Running. Of course he is running.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'knockdown', face: 'hurt' }],
        mood: { amount: 0.3, color: 0x2a3040, seconds: 1.4 },
        cam: { from: { at: 'goku', off: [2.4, 1.2, 3 ] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Take him home. And find whatever the boy gave him.', duration: 3.6 },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const d = cast.a20;
      if (d) {
        d.setHidden(true);
        d.untargetable = true;
      }
      if (cast.vegeta) cast.vegeta.setState('free');
      m.flags.geroFled = true;
    },
  };
})();
