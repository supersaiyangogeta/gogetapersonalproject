/*
 * SCENES — Chapter 11: Fusion, on Kami's Lookout.
 *
 *   fusion_lesson   Goku dances the Fusion Dance for two boys who cannot stop laughing, alone,
 *                   step by step, while Piccolo refuses to look
 *   fusion_goodbye  his day is up: a last word for Goten and Trunks, and the halo going up
 *   fusion_fat      the first fusion: a finger out of place, and a fat Gotenks who cannot run
 *   fusion_thin     a step out of time, and a Gotenks eighty years old
 *   fusion_birth    in time: GOTENKS, and he tells everybody so
 *   fusion_gold     Piccolo stops being impressed; "then look at THIS"
 *   fusion_timeup   mid-brag, the thirty minutes run out
 *
 * Dialogue is paraphrased English written for this project.
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
  // Goku dances alone: nobody is beside him, so the plain steps (partner on his left)
  const gokuStep = (pose, hold, line, extra = {}) => Object.assign({
    pose: [{ who: 'goku', pose, face: 'grin', speed: 16 }],
    cam: { from: { at: 'goku', local: [-1.2, 0.5, 4.4] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 44 },
    say: line ? { who: 'goku', line, duration: Math.max(0.8, hold), style: 'shout' } : undefined,
    hold,
  }, extra);

  S.fusion_lesson = {
    id: 'fusion_lesson',
    cast,
    music: { song: 'fusion_theme', level: 2 },
    events: [
      // above the clouds
      {
        cam: { from: [26, 14, 30], to: [16, 8, 20], look: [0, 1, 0], fov: 52, fov2: 46, ease: 'inOut' },
        pose: [
          { who: 'goku', pose: 'idle', face: 'grin', speed: 3 },
          { who: 'goten', pose: 'gt_idle', face: 'calm', speed: 3 },
          { who: 'trunks', pose: 'kt_idle', face: 'calm', speed: 3 },
          { who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 2 },
        ],
        say: { who: 'goku', line: 'All right, you two. This is Fusion. Two fighters become one — stronger than both of them put together.', duration: 4.6 },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'goku', local: [0.8, 0.35, 2.2] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'But the two of you have to move exactly the same. Arms, steps, fingers. Watch.', duration: 3.4 },
        hold: 3.6,
      },
      // the dance, all of it, by himself
      gokuStep('fd_out', 1, 'Arms out!'),
      gokuStep('fd_stepA', 0.55, 'One—'),
      gokuStep('fd_stepB', 0.55, 'two—'),
      gokuStep('fd_stepA', 0.55, 'three—'),
      gokuStep('fd_fu', 0.85, 'FUUU—'),
      gokuStep('fd_sion', 0.85, '—SION!'),
      gokuStep('fd_ha', 1.4, 'HA!', { sfx: { name: 'kiUp', who: 'goku', vol: 0.6, pitch: 1.4 } }),
      {
        pose: [
          { who: 'goten', pose: 'gt_cheer', face: 'grin', speed: 6 },
          { who: 'trunks', pose: 'kt_smug', face: 'grin', speed: 5 },
        ],
        // the two of them, side by side, from in front
        cam: { from: { at: 'trunks', local: [1.3, 0.25, 3.1] }, look: { at: 'trunks', local: [1.3, 0.05, 0] }, fov: 40 },
        say: { who: 'kid_trunks', line: 'We have to do THAT? That\'s so embarrassing...', duration: 3 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.35, 2.1] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: '...I am not doing that. Ever.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goku;
      if (g) g.setState('scripted', { pose: 'idle', expression: 'grin' });
      ctx.m.flags.lessonSeen = true;
    },
  };

  S.fusion_goodbye = {
    id: 'fusion_goodbye',
    cast,
    music: { song: 'farewell', level: 3 },
    events: [
      {
        pose: [{ who: 'goku', pose: 'g_lookMed', face: 'soft', speed: 3 }],
        cam: { from: { at: 'goku', local: [1, 0.4, 2.4] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'That\'s it. My day is up.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.goten, k = ctx.cast.goku;
          if (g && k) {
            const p = k.pos.clone().addScaledVector(k.forward, 1.1);
            p.y = ctx.b.stage.heightAt(p.x, p.z);
            g.setPosition(p);
            g.yaw = g.prevYaw = Math.atan2(k.pos.x - p.x, k.pos.z - p.z);
          }
        },
        pose: [
          { who: 'goten', pose: 'gt_idle', face: 'hurt', speed: 4 },
          { who: 'goku', pose: 'g_kneelOpen', face: 'soft', speed: 4 },
        ],
        // from the side: the boy and his father kneeling to his height, both faces
        cam: { from: { at: 'goten', local: [2.3, 0.35, 0.5] }, look: { at: 'goten', local: [0, 0.35, 0.55] }, fov: 40 },
        say: { who: 'goten', line: 'Already? But I only just met you...', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'goku', local: [-0.8, 0.1, 1.7] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'You\'re strong, Goten. Train hard. Trunks — look after him.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // up, and into the light
      {
        pose: [{ who: 'goku', pose: 'g_wave', face: 'grin', speed: 4 }],
        call: (ctx) => {
          const k = ctx.cast.goku;
          if (!k) return;
          ctx.upFrom = k.pos.clone();
          k.grounded = false;
        },
        tick: (ctx, s) => {
          const k = ctx.cast.goku;
          if (!k || !ctx.upFrom) return;
          k.setPosition(ctx.upFrom.clone().add(new V3(0, s * s * 3.2, 0)));
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.trail(k.chest(), 0xfff4c0, 0.8, 0.5);
        },
        vfx: { kind: 'flash', at: { at: 'goku' }, size: 5, color: 0xfff4c0, life: 0.6 },
        sfx: { name: 'visionIn', vol: 0.6 },
        cam: { from: { at: 'goten', local: [0.6, 0.1, -1.4] }, look: { at: 'goku', off: [0, 1.5, 0] }, fov: 50 },
        hold: 2.4,
      },
      {
        call: (ctx) => ctx.cast.goku && ctx.cast.goku.setHidden(true),
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.8, 0.4, 2.3] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'You heard him. Three paces apart. Both of you.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const k = ctx.cast.goku;
      if (k) k.setHidden(true);
      ctx.m.flags.gokuLeft = true;
    },
  };

  S.fusion_fat = {
    id: 'fusion_fat',
    cast,
    music: { song: 'fusion_theme', level: 1 },
    events: [
      {
        call: (ctx) => ctx.b.vfx.smoke && ctx.b.vfx.smoke.clear(),
        cam: { from: [0, 2.2, -1.2], look: [0, 0.6, 4.2], fov: 44 },
        hold: 1.4,
      },
      {
        cam: { from: [1.2, 1, 1.6], look: [0, 0.55, 4.2], fov: 38 },
        say: { who: 'gotenks', line: '...Hff. Hff. Why is everything... so heavy...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.35, 2] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: 'Goten. Your finger was bent. The whole thing depends on the fingers.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.fatSeen = true;
    },
  };

  S.fusion_thin = {
    id: 'fusion_thin',
    cast,
    music: { song: 'fusion_theme', level: 1 },
    events: [
      {
        cam: { from: [1.2, 1.1, 1.4], look: [0, 0.6, 4.2], fov: 38 },
        say: { who: 'gotenks', line: '...Eh? Somebody... fetch my cane...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.35, 2] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: 'Out of step. On the beat, or it will not hold. Again.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.thinSeen = (ctx.m.flags.thinSeen || 0) + 1;
    },
  };

  S.fusion_birth = {
    id: 'fusion_birth',
    cast,
    music: { song: 'fusion_theme', level: 4 },
    events: [
      {
        pose: [{ who: 'gotenks', pose: 'gk_intro', face: 'grin', speed: 8 }],
        cam: { from: { at: 'gotenks', local: [0.4, -0.3, 3.4] }, to: { at: 'gotenks', local: [0.3, -0.2, 2.4] }, look: { at: 'gotenks', off: [0, 0.2, 0] }, fov: 46, fov2: 40 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'gotenks', pose: 'gk_pose', face: 'grin', speed: 10 }],
        vfx: { kind: 'ring', at: { at: 'gotenks' }, radius: 4, color: 0xd8f4ff, life: 0.5 },
        cam: { from: { at: 'gotenks', local: [1.2, 0.2, 2.2] }, look: { at: 'gotenks:head' }, fov: 40 },
        say: { who: 'gotenks', line: 'The one you have been waiting for! The Grim Reaper of Justice — the great GOTENKS!', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.35, 2] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: '...Hm. The power is real, at least. Let\'s see if you can use it.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      ctx.m.flags.gotenksBorn = true;
    },
  };

  S.fusion_gold = {
    id: 'fusion_gold',
    cast,
    music: { song: 'super_saiyan', level: 4 },
    events: [
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 4 }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.35, 2] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: 'Stop playing around. Buu will not wait for you to finish showing off.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'gotenks', pose: 'gk_idle', face: 'grin', speed: 4 }],
        cam: { from: { at: 'gotenks', local: [0.7, 0.2, 1.9] }, look: { at: 'gotenks:head' }, fov: 36 },
        say: { who: 'gotenks', line: 'Playing? Oh, you want to see me TRY? Then watch THIS!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.goldAsked = true;
    },
  };

  S.fusion_timeup = {
    id: 'fusion_timeup',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        call: (ctx) => {
          const g = ctx.cast.gotenks, p = ctx.cast.piccolo, b = ctx.b;
          if (!g || !p) return;
          const toP = p.pos.clone().sub(g.pos).setY(0);
          if (toP.lengthSq() < 0.01) toP.set(0, 0, -1);
          toP.normalize();
          const at = p.pos.clone().addScaledVector(toP, -4.5);
          at.y = b.stage.heightAt(at.x, at.z);
          g.setPosition(at);
          g.grounded = true;
          g.yaw = g.prevYaw = Math.atan2(p.pos.x - at.x, p.pos.z - at.z);
          p.yaw = p.prevYaw = Math.atan2(at.x - p.pos.x, at.z - p.pos.z);
        },
        pose: [
          { who: 'gotenks', pose: 'gk_pose', face: 'grin', speed: 8 },
          { who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'gotenks', local: [1.3, 0.2, 2.6] }, look: { at: 'gotenks', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'gotenks', line: 'Ha! Did you see that? Nobody can beat the great Gotenks! Buu is going to be SO sorry that—', duration: 4, style: 'shout' },
        hold: 3.4,
      },
      // the thirty minutes run out, in the middle of the sentence
      {
        call: (ctx) => {
          const b = ctx.b, h = b.story.fusion;
          if (h && h.active) {
            const g = h.fused;
            SL.Fusion.defuse(b, h, { to: b.story.trunks });
            b.story.fusion = null;
            b.story.gotenks = null;
            for (const k of ['goten', 'trunks']) {
              const f = b.story[k];
              f.controller = SL.data.buuKit.scripted();
              f.untargetable = true;
              f.setState('scripted', { pose: k === 'goten' ? 'gt_sit' : 'knockdown', expression: 'shock' });
            }
            b.emit('fusionTimeUp', { fused: g });
          }
        },
        cam: { from: { at: 'goten', local: [1.4, 0.6, 2.4] }, look: { at: 'goten', off: [0.6, 0, 0] }, fov: 44 },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'goten', local: [0.5, 0.2, 1.4] }, look: { at: 'goten:head' }, fov: 36 },
        say: { who: 'goten', line: '...Huh? Where did I go?', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.35, 2] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: 'Thirty minutes. Less, when you waste them talking. Remember that when it counts.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
    ],
    end(ctx) {
      const b = ctx.b;
      if (b.story.fusion && b.story.fusion.active) {
        SL.Fusion.defuse(b, b.story.fusion, { to: b.story.trunks, silent: true });
        b.story.fusion = null;
        b.story.gotenks = null;
      }
      ctx.m.flags.fusionTimedOut = true;
    },
  };
})();
