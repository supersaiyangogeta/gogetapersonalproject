/*
 * SCENES — Chapter 7, the seven years after the Cell Games (Age 774).
 *
 *   years_morning     a city, a school, and a boy who is not a boy any more
 *   city_robbery      what Gohan can see from the air, and cannot answer as himself
 *   saiyaman_change   the helmet, the cape, the name, the poses
 *   saiyaman_arrives  the Great Saiyaman, landing like he rehearsed it
 *   saiyaman_videl    the person who was already doing this job, and her questions
 *   saiyaman_after    two people on a rooftop, one of them lying badly
 *   kids_spar_open    two children who fight like it is a game, because it is
 *   kids_after        dinner
 *
 * (Both children turning Super Saiyan is not a scene here: the mission plays it
 * through the shared transformation cinematic, so it is skip-safe the same way
 * every other transformation in the game is.)
 *
 * Dialogue is paraphrased English written for this project. No Japanese line is
 * claimed for any of it.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    return out;
  };

  /* ------------------------------------------------------------ the era */

  S.years_morning = {
    id: 'years_morning',
    cast,
    music: { song: 'hopeful', level: 2 },
    events: [
      // the city, from above: nothing in this shot has been in the game before
      {
        mood: { amount: 0, color: 0x101020, seconds: 0.6 },
        cam: { from: [120, 96, 150], to: [60, 48, 82], look: [0, 10, 0], fov: 56, fov2: 48, ease: 'inOut' },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'gohan', off: [6, 3, 9] }, to: { at: 'gohan', off: [4, 2.2, 6] }, look: { at: 'gohan', off: [0, 0.5, 0] }, fov: 48, fov2: 42 },
        say: { who: 'adult_gohan', line: 'Seven years. No Cell, no androids, no fighting — just school, and a mother who checks my homework.', duration: 5, style: 'quiet' },
        hold: 5.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_idle', face: 'soft', speed: 2 }],
        cam: { from: { at: 'gohan', local: [0.7, 0.45, 2.2] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 36 },
        say: { who: 'adult_gohan', line: 'Dad would have laughed at me. I am late for my first day.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
    ],
    end(ctx) {
      ctx.m.flags.yearsOpened = true;
    },
  };

  S.city_robbery = {
    id: 'city_robbery',
    cast,
    music: { song: 'light_battle', level: 3 },
    events: [
      {
        call: (ctx) => {
          const b = ctx.b;
          for (const t of b.story.thugs || []) t.setHidden(false);
          for (const c of b.story.civilians || []) c.setHidden(false);
        },
        mood: { amount: 0.12, color: 0x201828, seconds: 0.8 },
        cam: { from: [15, 9, 21], to: [11, 6.5, 16], look: [0, 1.4, -2], fov: 50, fov2: 46 },
        sfx: { name: 'explosionBig', vol: 0.7, pitch: 1.3 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'thug0', pose: 'th_aim', face: 'angry', speed: 6 }],
        cam: { from: { at: 'thug0', local: [1.6, 0.5, 3.2] }, look: { at: 'thug0', off: [0, 0.45, 0] }, fov: 44 },
        say: { who: 'city_thug', line: 'Nobody moves! On the ground, all of you!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_fight', face: 'angry', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.9, 0.5, 2.4] }, to: { at: 'gohan', local: [0.7, 0.48, 1.9] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 40, fov2: 34 },
        say: { who: 'adult_gohan', line: 'I can stop this in one second. And then the whole city knows a student did it.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
    ],
    end(ctx) {
      ctx.m.flags.robberySeen = true;
    },
    clearMood: false,
  };

  /** The change: Gohan goes behind the corner, and somebody ridiculous comes out. */
  S.saiyaman_change = {
    id: 'saiyaman_change',
    cast,
    music: { song: 'battle', level: 4 },
    events: [
      {
        pose: [{ who: 'gohan', pose: 'powerUp', face: 'grit', speed: 8 }],
        vfx: { kind: 'ring', at: { at: 'gohan' }, radius: 3.5, color: 0xffffff, life: 0.5 },
        sfx: { name: 'kiUp', who: 'gohan', vol: 0.9, pitch: 1.2 },
        screen: { flash: 0.5, color: '#ffffff' },
        cam: { from: { at: 'gohan', local: [1.2, 0.5, 3] }, look: { at: 'gohan', off: [0, 0.5, 0] }, fov: 44 },
        hold: 1.4,
      },
      // the swap: the student goes, the hero arrives
      {
        call: (ctx) => {
          const b = ctx.b, g = b.story.gohan, s = b.story.saiyaman;
          if (!g || !s) return;
          s.setHidden(false);
          s.untargetable = false;
          s.setPosition(g.pos.clone());
          s.yaw = s.prevYaw = g.yaw;
          s.setState('scripted', { pose: 'gs_land', expression: 'calm' });
          g.setHidden(true);
          g.untargetable = true;
        },
        screen: { flash: 0.7, color: '#dff2ff' },
        sfx: { name: 'transformBurst', vol: 0.9, pitch: 1.3 },
        vfx: { kind: 'dust', at: { at: 'saiyaman' }, radius: 3, count: 10 },
        cam: { from: { at: 'saiyaman', off: [3.4, 1.4, 4.6] }, to: { at: 'saiyaman', off: [2.6, 1.1, 3.6] }, look: { at: 'saiyaman', off: [0, 0.5, 0] }, fov: 46, fov2: 40 },
        hold: 2,
      },
      {
        pose: [{ who: 'saiyaman', pose: 'gs_pose1', face: 'calm', speed: 6 }],
        sfx: { name: 'uiMove', vol: 0.8, pitch: 1.4 },
        cam: { from: { at: 'saiyaman', local: [1.1, 0.35, 2.6] }, look: { at: 'saiyaman', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'great_saiyaman', line: 'The Great Saiyaman! Defender of this city, terror of evildoers!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'saiyaman', pose: 'gs_pose2', face: 'calm', speed: 7 }],
        cam: { from: { at: 'saiyaman', local: [-1.1, 0.3, 2.4] }, look: { at: 'saiyaman', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'great_saiyaman', line: 'Nobody will ever guess. This is a perfect disguise.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const b = ctx.b, g = b.story.gohan, s = b.story.saiyaman;
      if (g) {
        g.setHidden(true);
        g.untargetable = true;
      }
      if (s) {
        s.setHidden(false);
        s.untargetable = false;
        s.setState('free');
      }
      ctx.m.flags.becameSaiyaman = true;
    },
    clearMood: false,
  };

  /* ------------------------------------------------------------ the job */

  S.saiyaman_arrives = {
    id: 'saiyaman_arrives',
    cast,
    music: { song: 'battle', level: 5 },
    events: [
      {
        call: (ctx) => {
          const b = ctx.b;
          for (const t of b.story.thugs || []) if (t.alive) t.setHidden(false);
          for (const c of b.story.civilians || []) if (c.alive) c.setHidden(false);
        },
        pose: [{ who: 'saiyaman', pose: 'gs_land', face: 'calm', speed: 8 }],
        vfx: { kind: 'dust', at: { at: 'saiyaman' }, radius: 3.4, count: 12 },
        sfx: { name: 'dash', who: 'saiyaman', vol: 0.9 },
        shake: { at: { at: 'saiyaman' }, amount: 0.3 },
        cam: { from: { at: 'saiyaman', off: [4, 2.4, 5.4] }, to: { at: 'saiyaman', off: [3, 1.6, 4.2] }, look: { at: 'saiyaman', off: [0, 0.6, 0] }, fov: 48, fov2: 42 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'saiyaman', pose: 'gs_pose1', face: 'calm', speed: 6 }],
        cam: { from: { at: 'saiyaman', local: [1, 0.4, 2.4] }, look: { at: 'saiyaman', off: [0, 0.42, 0] }, fov: 40 },
        say: { who: 'great_saiyaman', line: 'Robbery? In broad daylight? Not while I am standing here!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'thug0', pose: 'th_idle', face: 'shock', speed: 5 }],
        cam: { from: { at: 'thug0', local: [1.4, 0.45, 2.8] }, look: { at: 'thug0', off: [0, 0.45, 0] }, fov: 42 },
        say: { who: 'city_thug', line: 'Is this guy for real?', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const s = ctx.b.story.saiyaman;
      if (s) s.setState('free');
      ctx.m.flags.saiyamanArrived = true;
    },
  };

  S.saiyaman_videl = {
    id: 'saiyaman_videl',
    cast,
    music: { song: 'battle', level: 3 },
    events: [
      {
        call: (ctx) => {
          const v = ctx.b.story.videl;
          if (!v) return;
          v.setHidden(false);
          v.untargetable = false;
        },
        pose: [{ who: 'videl', pose: 'vd_arms', face: 'angry', speed: 5 }],
        vfx: { kind: 'dust', at: { at: 'videl' }, radius: 2.4, count: 8 },
        cam: { from: { at: 'videl', local: [1.8, 0.7, 3.8] }, to: { at: 'videl', local: [1.3, 0.5, 2.9] }, look: { at: 'videl', off: [0, 0.4, 0] }, fov: 46, fov2: 40 },
        say: { who: 'videl', line: 'Hold it. This city has somebody who handles this, and it is me.', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'saiyaman', pose: 'gs_idle', face: 'calm', speed: 4 }],
        cam: { from: { at: 'saiyaman', local: [0.9, 0.4, 2.3] }, look: { at: 'saiyaman', off: [0, 0.42, 0] }, fov: 38 },
        say: { who: 'great_saiyaman', line: 'Then we are colleagues! Justice has room for two!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'videl', pose: 'vd_idle', face: 'angry', speed: 6 }],
        cam: { from: { at: 'videl', local: [0.8, 0.42, 2.1] }, to: { at: 'videl', local: [0.6, 0.4, 1.7] }, look: { at: 'videl', off: [0, 0.42, 0] }, fov: 36, fov2: 32 },
        say: { who: 'videl', line: 'Nobody moves that fast. Nobody flies. So show me what you are — properly.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const v = ctx.b.story.videl;
      if (v) {
        v.setHidden(false);
        v.untargetable = false;
        v.setState('free');
      }
      ctx.m.flags.videlMet = true;
    },
  };

  S.saiyaman_after = {
    id: 'saiyaman_after',
    cast,
    music: { song: 'farewell', level: 3 },
    events: [
      {
        pose: [
          { who: 'videl', pose: 'vd_arms', face: 'calm', speed: 3 },
          { who: 'saiyaman', pose: 'gs_idle', face: 'calm', speed: 3 },
        ],
        // on the roof, with the city underneath them: framed on the pair, wherever the roof is
        cam: { from: { at: 'videl', off: [5.5, 2.4, 5.5] }, to: { at: 'videl', off: [4.2, 1.8, 4.4] }, look: { at: 'videl', off: [-1.6, 0.1, 1.4] }, fov: 44, fov2: 40, ease: 'inOut' },
        say: { who: 'videl', line: 'You fight like somebody who has been in a real one. Not a tournament. A real one.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        cam: { from: { at: 'saiyaman', local: [0.7, 0.4, 2] }, look: { at: 'saiyaman', off: [0, 0.42, 0] }, fov: 36 },
        say: { who: 'great_saiyaman', line: '...I watch a lot of television.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'videl', pose: 'vd_idle', face: 'angry', speed: 5 }],
        cam: { from: { at: 'videl', local: [0.7, 0.4, 1.9] }, look: { at: 'videl', off: [0, 0.42, 0] }, fov: 34 },
        say: { who: 'videl', line: 'Sure. I will find out who you are. I always do.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.saiyamanDone = true;
    },
  };

  /* ------------------------------------------------------------ the children */

  S.kids_spar_open = {
    id: 'kids_spar_open',
    cast,
    music: { song: 'light_battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'goten', pose: 'gt_cheer', face: 'calm', speed: 5 },
          { who: 'trunks', pose: 'kt_smug', face: 'angry', speed: 4 },
        ],
        cam: { from: { at: 'goten', off: [6, 2.6, 3] }, to: { at: 'goten', off: [4.6, 2, 2.2] }, look: { at: 'goten', off: [0, 0, -4] }, fov: 48, fov2: 42, ease: 'inOut' },
        say: { who: 'kid_trunks', line: 'I am a whole year older than you, so I win automatically.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'goten', local: [0.7, 0.3, 1.8] }, look: { at: 'goten', off: [0, 0.3, 0] }, fov: 36 },
        say: { who: 'goten', line: 'That is not how it works! Mum says I am very strong!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      for (const k of ['goten', 'trunks']) {
        const f = ctx.b.story[k];
        if (f) f.setState('free');
      }
      ctx.m.flags.sparOpened = true;
    },
  };

  S.kids_after = {
    id: 'kids_after',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [
          { who: 'goten', pose: 'gt_cheer', face: 'calm', speed: 5 },
          { who: 'trunks', pose: 'kt_smug', face: 'angry', speed: 4 },
        ],
        cam: { from: { at: 'goten', off: [4.6, 2, 4] }, to: { at: 'goten', off: [3.8, 1.6, 3.2] }, look: { at: 'goten', off: [1.4, -0.1, -1.5] }, fov: 46, fov2: 42 },
        say: { who: 'kid_trunks', line: 'Fine. You are strong. For a little kid.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        call: (ctx) => {
          const c = ctx.b.story.chichi;
          if (!c) return;
          c.setHidden(false);
          c.setState('scripted', { pose: 'cc_worried', expression: 'angry' });
        },
        cam: { from: { at: 'chichi', local: [0.9, 0.4, 2.4] }, look: { at: 'chichi', off: [0, 0.42, 0] }, fov: 40 },
        say: { who: 'chichi', line: 'Goten! If you are out there fighting instead of studying, I will know!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'goten', pose: 'gt_cheer', face: 'shock', speed: 8 }],
        cam: { from: { at: 'goten', local: [0.6, 0.3, 1.7] }, look: { at: 'goten', off: [0, 0.3, 0] }, fov: 34 },
        say: { who: 'goten', line: 'We are only playing! ...Trunks, run.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.kidsDone = true;
    },
  };
})();
