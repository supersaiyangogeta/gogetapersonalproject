/*
 * SCENES — Future Trunks' epilogue (mission cell_future, 2026-10-01, the owner's brief).
 *
 *   fu_arrive     the time machine in the ruins; smoke on the horizon
 *   fu_city       17 and 18 at play; the old man; the blast slapped into the sky; the gold
 *   fu_execute18  one arm, a kick into the sky, the Finish Buster point-blank: nothing left of her
 *   fu_seventeen  "You monster... what did you do to 18?!"
 *   fu_judgment   a knee to the stomach; "This is for Gohan..."; the volley; the crater
 *   fu_ambush     three years later: Capsule Corporation, the imperfect Cell, "I knew you'd come"
 *   fu_heatdome   Cell climbs to fire; thrown higher still; the Heat Dome Attack
 *   fu_over       "It's over, Gohan."
 *
 * Methodical, calm, swift: Trunks never gloats. Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.trunksKit;
  const VK = () => SL.data.vegitoKit;

  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const ground = (ctx, v, lift = 0) => K().ground(ctx.b, v, lift);
  const faceTo = (f, p) => K().faceTo(f, p);

  S.fu_arrive = {
    id: 'fu_arrive',
    cast,
    auraCap: 0.15,
    music: { song: 'vision', level: 1 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          st.machine = K().timeMachine(b, ground(ctx, new V3(3, 0, 34)));
          K().place(st.trunks, ground(ctx, new V3(0, 0, 31)), Math.PI);
          for (const f of [st.a17, st.a18, st.old]) f.setHidden(true);
          pt(ctx, 'tm', ground(ctx, new V3(3, 0, 34)));
        },
        mood: { amount: 0.2, color: 0x2a2a30, seconds: 1 },
        cam: { from: { at: 'tm', off: [-10, 4, -8] }, to: { at: 'tm', off: [-7, 2.4, -5] }, look: { at: 'tm', off: [0, 1, 0] }, fov: 46 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm', speed: 3 }],
        cam: { from: { at: 'trunks', local: [0.4, 0.3, 1.8] }, look: { at: 'trunks:head' }, fov: 34 },
        say: { who: 'future_trunks', line: 'I\'m home, Mother. And this time, I\'m ready.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        call: (ctx) => {
          const b = ctx.b, far = ground(ctx, new V3(-30, 0, -70));
          pt(ctx, 'far', far);
          b.vfx.explosion(far.clone().add(new V3(0, 6, 0)), 10, 0xffa060, { smoke: true });
          b.sfx('explosionBig', null, { at: far, vol: 0.6, pitch: 0.6 });
        },
        cam: { from: { at: 'trunks', local: [-0.6, 0.5, -2.2] }, look: { at: 'far', off: [0, 6, 0] }, fov: 44 },
        say: { who: 'future_trunks', line: 'Parsley City. They\'re at it again.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.machine && st.machine.group) st.machine.group.visible = false;
    },
  };

  S.fu_city = {
    id: 'fu_city',
    cast,
    auraCap: 0.15,
    music: { song: 'battle', level: 2 },
    events: [
      // the two of them, bored, picking off whoever is left
      {
        call: (ctx) => {
          const st = story(ctx), Kt = K();
          for (const f of [st.a17, st.a18, st.old]) f.setHidden(false);
          Kt.place(st.a17, ground(ctx, new V3(-3, 0, -8)));
          Kt.place(st.a18, ground(ctx, new V3(3, 0, -7)));
          Kt.place(st.old, ground(ctx, new V3(0.5, 0, 0)));
          Kt.place(st.trunks, ground(ctx, new V3(-14, 0, 12)));
          faceTo(st.a18, st.old.pos);
          faceTo(st.a17, st.old.pos);
          faceTo(st.old, st.a18.pos);
          pt(ctx, 'street', ground(ctx, new V3(0, 0, -3)));
        },
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'smirk', speed: 3 },
          { who: 'a18', pose: 'a17_barrierW', face: 'smirk', speed: 4 },
          { who: 'old', pose: 'cv_cower', face: 'shock', speed: 5 },
        ],
        cam: { from: { at: 'street', off: [8, 2.6, 10] }, look: { at: 'street', off: [0, 0.8, 0] }, fov: 46 },
        say: { who: 'android_18', line: 'This one\'s mine. Try not to be boring and run, old man.', duration: 3.2 },
        hold: 3.4,
      },
      // she fires — and somebody is standing in front of him, and slaps it into the sky
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          K().place(st.trunks, ground(ctx, st.old.pos.clone().addScaledVector(st.old.forward.clone().setY(0).normalize(), 1.1)));
          faceTo(st.trunks, st.a18.pos);
          b.vfx.flash(st.trunks.chest(), 1.4, 0xffffff, 0.15, SL.Toon.tex.glow);
          const from = st.a18.chest(), to = st.trunks.chest().addScaledVector(st.trunks.forward, 0.4);
          for (let s = 0; s <= 8; s++) b.vfx.trail(from.clone().lerp(to, s / 8), 0xffb0d0, 0.4, 0.3);
          b.sfx('kiBlast', st.a18, { pitch: 0.9 });
          ctx.up = to.clone();
        },
        pose: [
          { who: 'a18', pose: 'a17_barrier', face: 'smirk', speed: 16 },
          { who: 'trunks', pose: 'ft_palmUp', face: 'calm', speed: 30 },
        ],
        cam: { from: { at: 'trunks', local: [1.6, 0.2, 1.4] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 42 },
        tick: (ctx, t) => {
          if (t > 0.25 && !ctx.deflected) {
            ctx.deflected = true;
            const b = ctx.b;
            for (let s = 0; s <= 10; s++) b.vfx.trail(ctx.up.clone().add(new V3(0, s * 4, -s)), 0xffb0d0, 0.35, 0.4);
            b.vfx.sparks(ctx.up, 0xffffff, 12, 6, 0.08);
            b.sfx('block', story(ctx).trunks, { pitch: 0.7 });
          }
        },
        hold: 1.6,
      },
      {
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'grin', speed: 3 },
          { who: 'a18', pose: 'a17_bored', face: 'smirk', speed: 3 },
        ],
        cam: { from: { at: 'a17', local: [0.5, 0.3, 2] }, look: { at: 'a17:head' }, fov: 36 },
        say: { who: 'android_17', line: 'Well, well. The kid\'s back. Did you miss us so much you came home to die?', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_tfStill', face: 'calm', speed: 3 }],
        cam: { from: { at: 'trunks', local: [0.4, 0.3, 1.7] }, look: { at: 'trunks:head' }, fov: 34 },
        say: { who: 'future_trunks', line: 'Run, sir. Get as far away as you can.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // the gold, and the street breaking under his boots
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, t = st.trunks;
          st.old.setHidden(true);
          K().toForm(t, 'ssj');
          b.vfx.explosion(t.chest(), 2.6, 0xffe25a, { smoke: false });
          b.vfx.ring(ground(ctx, t.pos, 0.2), 8, 0xffe25a, 0.6, new V3(0, 1, 0));
          b.stage.crater(t.pos, 4, 0.5, null);
          b.sfx('transformBurst', t, { vol: 1.1 });
          b.cameraTraumaAt(t.pos, 0.8);
        },
        pose: [{ who: 'trunks', pose: 'ft_tfBurst', face: 'angry', speed: 10, aura: 0.9 }],
        screen: { flash: 0.4, color: '#fff4c0' },
        cam: { from: { at: 'trunks', local: [1.8, -0.3, 3.2] }, look: { at: 'trunks', off: [0, 0.6, 0] }, fov: 44 },
        hold: 2,
      },
      {
        pose: [{ who: 'a18', pose: 'a17_bored', face: 'angry', speed: 3 }],
        cam: { from: { at: 'a18', local: [0.4, 0.3, 1.8] }, look: { at: 'a18:head' }, fov: 34 },
        say: { who: 'android_18', line: 'Gold hair again? You were wearing that the last time we broke you.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.old.setHidden(true);
      K().toForm(st.trunks, 'ssj');
      ctx.m.flags.cityReached = true;
    },
  };

  S.fu_execute18 = {
    id: 'fu_execute18',
    cast,
    auraCap: 0.15,
    music: { song: 'intense', level: 6 },
    clearMood: false,
    events: [
      // her strike stops on one arm; his feet do not move
      {
        call: (ctx) => {
          const st = story(ctx), t = st.trunks, a = st.a18;
          K().place(a, ground(ctx, t.pos.clone().addScaledVector(t.forward.clone().setY(0).normalize(), 1.15)));
          faceTo(a, t.pos);
          faceTo(t, a.pos);
          ctx.b.sfx('block', t, { pitch: 0.6, vol: 1.2 });
          ctx.b.vfx.sparks(t.chest().addScaledVector(t.forward, 0.4), 0xffffff, 14, 6, 0.08);
        },
        pose: [
          { who: 'a18', pose: 'a17_jab', face: 'angry', speed: 30 },
          { who: 'trunks', pose: 'guard', face: 'calm', speed: 30 },
        ],
        slow: { scale: 0.3, seconds: 0.8 },
        cam: { from: { at: 'trunks', local: [2, 0.3, 0.8] }, look: { at: 'trunks', local: [0, 0.4, 0.6] }, fov: 40 },
        hold: 1.2,
      },
      // a kick that sends her up into the sky
      {
        call: (ctx) => {
          const st = story(ctx), a = st.a18;
          ctx.k0 = a.pos.clone();
          ctx.k1 = a.pos.clone().add(new V3(0, 16, 0));
          a.grounded = false;
          a.setState('scripted', { pose: 'tumble', expression: 'shock' });
          ctx.b.sfx('punchHeavy', a, { pitch: 0.5, vol: 1.3 });
          ctx.b.vfx.ring(a.chest(), 2, 0xffffff, 0.3);
        },
        pose: [{ who: 'trunks', pose: 'ft_upcut', face: 'angry', speed: 30 }],
        cam: { from: { at: 'trunks', off: [5, 1, 5] }, look: { at: 'a18' }, fov: 50 },
        tick: (ctx, t) => {
          const a = story(ctx).a18, k = U.easeOutCubic(Math.min(1, t / 0.8));
          a.setPosition(ctx.k0.clone().lerp(ctx.k1, k));
          a.prevPos.copy(a.pos);
        },
        hold: 0.9,
      },
      // FINISH BUSTER — point-blank, and nothing is left of her
      {
        call: (ctx) => {
          const st = story(ctx), t = st.trunks, a = st.a18, b = ctx.b;
          K().place(t, ground(ctx, t.pos));
          faceTo(t, a.pos);
          pt(ctx, 'sky', a.chest());
        },
        pose: [{ who: 'trunks', pose: 'ft_busterCharge', face: 'shout', speed: 10 }],
        cam: { from: { at: 'trunks', local: [-1.2, -0.4, -1.4] }, look: { at: 'a18' }, fov: 46 },
        say: { who: 'future_trunks', line: 'FINISH BUSTER!', duration: 1.6, style: 'shout' },
        hold: 1,
      },
      {
        call: (ctx) => {
          const st = story(ctx), t = st.trunks, a = st.a18, b = ctx.b;
          const from = t.chest().add(new V3(0, 0.8, 0));
          for (let s = 0; s <= 14; s++) b.vfx.trail(from.clone().lerp(a.chest(), s / 14), 0xffe25a, 1.1, 0.5);
          b.vfx.explosion(a.chest(), 5, 0xffe25a, { smoke: true });
          b.vfx.flash(a.chest(), 4, 0xffffff, 0.3, SL.Toon.tex.glow);
          b.sfx('explosionHuge', a, { vol: 1.3 });
          b.cameraTraumaAt(a.chest(), 0.8);
          const bits = K().dice(b, a.chest(), [0xf0d070, 0x2a2a2a, 0x3a5aa0], { count: 26, height: 1.4, width: 0.5, seed: 18 });
          bits.vaporize();
          bits.dispose();
          a.setHidden(true);
          a._gone = true;
        },
        pose: [{ who: 'trunks', pose: 'ft_busterFire', face: 'shout', speed: 20 }],
        screen: { flash: 0.6, color: '#fff4c0' },
        slow: { scale: 0.3, seconds: 1 },
        cam: { from: { at: 'sky', off: [8, -4, 10] }, look: { at: 'sky' }, fov: 54 },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.a18.setHidden(true);
      st.a18._gone = true;
      st.a18.untargetable = true;
      K().place(st.trunks, ground(ctx, st.trunks.pos));
      ctx.m.flags.eighteenGone = true;
    },
  };

  S.fu_seventeen = {
    id: 'fu_seventeen',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    events: [
      {
        pose: [{ who: 'a17', pose: 'a17_idle', face: 'shock', speed: 2 }],
        cam: { from: { at: 'a17:face', local: [0.1, 0.16, 0.85] }, look: { at: 'a17:head', off: [0, 0.15, 0] }, fov: 32 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'a17', pose: 'a17_idle', face: 'shout', speed: 6 }],
        cam: { from: { at: 'a17', local: [0.5, 0.2, 1.8] }, look: { at: 'a17:head' }, fov: 34 },
        say: { who: 'android_17', line: 'You monster... What did you do to 18?! I\'ll kill you! I\'ll tear you apart!', duration: 3.8, style: 'shout' },
        hold: 4,
      },
    ],
    end() {},
  };

  S.fu_judgment = {
    id: 'fu_judgment',
    cast,
    auraCap: 0.15,
    music: { song: 'final_clash', level: 5 },
    clearMood: false,
    events: [
      // a knee, and he is on his hands and knees, coughing
      {
        call: (ctx) => {
          const st = story(ctx), t = st.trunks, a = st.a17;
          K().place(a, ground(ctx, t.pos.clone().addScaledVector(t.forward.clone().setY(0).normalize(), 1)));
          faceTo(a, t.pos);
          ctx.b.sfx('punchHeavy', a, { pitch: 0.4, vol: 1.4 });
          ctx.b.vfx.ring(a.chest(), 2, 0xffffff, 0.3);
        },
        pose: [
          { who: 'trunks', pose: 'ft_riseW', face: 'angry', speed: 30 },
          { who: 'a17', pose: 'hitBody', face: 'shock', speed: 30 },
        ],
        slow: { scale: 0.3, seconds: 0.8 },
        cam: { from: { at: 'trunks', local: [2, 0.2, 0.6] }, look: { at: 'a17', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1,
      },
      {
        pose: [{ who: 'a17', pose: 'getup', face: 'hurt', speed: 4 }],
        cam: { from: { at: 'a17', local: [0.6, -0.2, 1.6] }, look: { at: 'a17', off: [0, -0.2, 0] }, fov: 40 },
        hold: 1.6,
      },
      // he flips up and hangs over him: cold, final
      {
        call: (ctx) => {
          const st = story(ctx), t = st.trunks;
          K().float(t, st.a17.pos.clone().add(new V3(0, 6, 1)));
          faceTo(t, st.a17.pos);
          pt(ctx, 'above', t.pos);
        },
        pose: [{ who: 'trunks', pose: 'ft_airHero', face: 'angry', speed: 4 }],
        cam: { from: { at: 'a17', off: [1.4, 0.6, 1.6] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 46 },
        say: { who: 'future_trunks', line: 'This is for Gohan... and for everyone else you killed!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      // a volley straight down into him, and into the city round him
      {
        cam: { from: { at: 'above', off: [14, 4, 18] }, look: { at: 'a17' }, fov: 54 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (t < 2.4 && b.frame % 3 === 0) {
            st.trunks.setState('scripted', { pose: (b.frame / 3) % 2 ? 'blastR' : 'blastL', expression: 'shout', speed: 40 });
            const to = st.a17.pos.clone().add(new V3(Math.sin(b.frame * 1.7) * 3, 0.4, Math.cos(b.frame * 1.3) * 3));
            const from = st.trunks.chest();
            for (let s = 0; s <= 5; s++) b.vfx.trail(from.clone().lerp(to, s / 5), 0xffe25a, 0.35, 0.2);
            b.vfx.explosion(to, 2.4, 0xffd890, { smoke: true });
            if (b.frame % 9 === 0) b.stage.crater(to, 2.4, 0.5, null);
            b.sfx('kiBlast', st.trunks, { vol: 0.6 });
            b.camera.addTrauma(0.06);
          }
          if (t > 0.6 && !st.a17.hidden) {
            st.a17.setHidden(true);
            st.a17._gone = true;
          }
        },
        hold: 3,
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.stage.crater(st.a17.pos, 9, 1.4, null);
          b.vfx.explosion(st.a17.pos.clone().add(new V3(0, 2, 0)), 9, 0xffc070, { smoke: true });
          b.sfx('explosionHuge', null, { at: st.a17.pos, vol: 1.2 });
          pt(ctx, 'crater', st.a17.pos);
        },
        screen: { flash: 0.5, color: '#fff0c8' },
        cam: { from: { at: 'crater', off: [18, 14, 20] }, look: { at: 'crater' }, fov: 54 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.a17.setHidden(true);
      st.a17._gone = true;
      st.a17.untargetable = true;
      ctx.m.flags.seventeenGone = true;
    },
  };

  S.fu_ambush = {
    id: 'fu_ambush',
    cast,
    auraCap: 0.15,
    music: { song: 'vision', level: 2 },
    events: [
      {
        title: { chapter: 'THREE YEARS LATER', title: 'CAPSULE CORPORATION', subtitle: 'the time machine, one last time', duration: 3.4 },
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, Kt = K();
          Kt.toForm(st.trunks, 'base');
          Kt.place(st.trunks, ground(ctx, new V3(2, 0, 30)), 0);
          if (st.machine && st.machine.group) {
            st.machine.group.visible = true;
            st.machine.group.position.copy(ground(ctx, new V3(3, 0, 34)));
          }
          st.cell.setHidden(false);
          Kt.toForm(st.cell, 'base');
          Kt.place(st.cell, ground(ctx, new V3(-6, 0, 22)));
          faceTo(st.cell, st.trunks.pos);
          faceTo(st.trunks, st.machine && st.machine.group ? st.machine.group.position : new V3(3, 0, 34));
          pt(ctx, 'tm', ground(ctx, new V3(3, 0, 33)));
        },
        pose: [
          { who: 'trunks', pose: 'ft_capsule', face: 'calm', speed: 3 },
          { who: 'cell', pose: 'cl_hunch', face: 'smirk', speed: 3 },
        ],
        cam: { from: { at: 'tm', off: [-4, 1.6, 4] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 44 },
        hold: 3.6,
      },
      // behind him, something creeping: the tail, the beak, the mottled shell
      {
        cam: { from: { at: 'cell', local: [0.4, 0.2, 1.8] }, look: { at: 'cell:head' }, fov: 34 },
        sfx: { name: 'burrow', who: 'cell', vol: 0.6, pitch: 0.6 },
        say: { who: 'cell', line: '(That machine... with it, I can go back to when 17 and 18 still exist.)', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        call: (ctx) => faceTo(story(ctx).trunks, story(ctx).cell.pos),
        pose: [{ who: 'trunks', pose: 'ft_lookBack', face: 'calm', speed: 4 }],
        cam: { from: { at: 'trunks', local: [0.4, 0.3, 1.6] }, look: { at: 'trunks:head' }, fov: 34 },
        say: { who: 'future_trunks', line: 'I knew you\'d come, Cell. I\'ve been waiting for you. Not here, though.', duration: 3.6 },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.machine && st.machine.group) st.machine.group.visible = false;
      ctx.m.flags.ambush = true;
    },
  };

  S.fu_heatdome = {
    id: 'fu_heatdome',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 7 },
    clearMood: false,
    events: [
      // up into the air, desperate, cupping a Kamehameha
      {
        call: (ctx) => {
          const st = story(ctx);
          K().float(st.cell, st.cell.pos.clone().add(new V3(0, 7, 0)));
          faceTo(st.cell, st.trunks.pos);
        },
        pose: [{ who: 'cell', pose: 'cl_kameW', face: 'shout', speed: 8 }],
        cam: { from: { at: 'cell', local: [1.4, -0.6, 3] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'cell', line: 'If I can\'t have your machine, I\'ll blow this whole planet apart!', duration: 3, style: 'shout' },
        hold: 3,
      },
      // he is there first: a grip, and a throw that puts Cell hundreds of feet higher
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          VK().vanishTo(b, st.trunks, st.cell.pos.clone().add(new V3(0, -0.4, 1)), { face: st.cell.pos });
          st.trunks.grounded = false;
          ctx.c0 = st.cell.pos.clone();
          ctx.c1 = st.cell.pos.clone().add(new V3(0, 40, 0));
          st.cell.setState('scripted', { pose: 'tumble', expression: 'shock' });
          b.sfx('punchHeavy', st.cell, { pitch: 0.4, vol: 1.4 });
        },
        pose: [{ who: 'trunks', pose: 'throwRelease', face: 'shout', speed: 20 }],
        cam: { from: { at: 'trunks', off: [6, -2, 8] }, look: { at: 'cell' }, fov: 54 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, k = U.easeOutCubic(Math.min(1, t / 1));
          c.setPosition(ctx.c0.clone().lerp(ctx.c1, k));
          c.prevPos.copy(c.pos);
        },
        hold: 1.1,
      },
      // the Heat Dome Attack: both palms up, a pillar of fire that eats him whole
      {
        call: (ctx) => {
          const st = story(ctx);
          K().place(st.trunks, ground(ctx, st.trunks.pos));
          faceTo(st.trunks, st.cell.pos);
          pt(ctx, 'tr', st.trunks.pos);
        },
        pose: [{ who: 'trunks', pose: 'ft_domeCharge', face: 'shout', speed: 8, aura: 0.9 }],
        cam: { from: { at: 'tr', off: [3, 0.6, 3.6] }, look: { at: 'trunks', off: [0, 1.2, 0] }, fov: 44 },
        tick: (ctx) => {
          const b = ctx.b, t = story(ctx).trunks;
          if (b.frame % 3 === 0) b.vfx.streamInward(t.chest().add(new V3(0, 0.8, 0)), 2.6, 0xffd45a, 2, 0.14, 0.4);
        },
        say: { who: 'future_trunks', line: 'HEAT DOME ATTACK!', duration: 2, style: 'shout' },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          VK().pillar(ctx.m, ground(ctx, st.trunks.pos), { height: 260, radius: 4.2, seconds: 3.6 });
          b.vfx.explosion(st.cell.chest(), 7, 0xffa040, { smoke: true });
          b.sfx('beamFire', st.trunks, { vol: 1.4, pitch: 0.7 });
          b.sfx('explosionHuge', st.cell, { vol: 1.3 });
          pt(ctx, 'cellAt', st.cell.chest());
          const bits = K().dice(b, st.cell.chest(), [0x6a9a4a, 0x2a2a2a, 0xe0a050], { count: 30, height: 2, width: 0.8, seed: 19 });
          bits.vaporize();
          bits.dispose();
          st.cell.setHidden(true);
          st.cell._gone = true;
        },
        pose: [{ who: 'trunks', pose: 'ft_domeFire', face: 'shout', speed: 20, aura: 1 }],
        screen: { flash: 0.7, color: '#ffe0a0' },
        cam: { from: { at: 'cellAt', off: [16, -14, 20] }, look: { at: 'cellAt' }, fov: 56 },
        tick: (ctx, t) => {
          if (t < 1.6 && ctx.b.frame % 4 === 0) ctx.b.vfx.explosion(ctx.cast.cellAt.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 2, Math.cos(ctx.b.frame) * 2, 0)), 4, 0xffb050, { smoke: false });
        },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.cell.setHidden(true);
      st.cell._gone = true;
      st.cell.untargetable = true;
      K().place(st.trunks, ground(ctx, st.trunks.pos));
      ctx.m.flags.futureCellGone = true;
    },
  };

  S.fu_over = {
    id: 'fu_over',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          K().toForm(st.trunks, 'base');
          pt(ctx, 'sky', st.trunks.pos.clone().add(new V3(0, 30, -20)));
        },
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'soft', speed: 2, aura: 0 }],
        cam: { from: { at: 'trunks', local: [0.8, -0.4, 2.4] }, look: { at: 'sky' }, fov: 46 },
        hold: 3,
      },
      {
        cam: { from: { at: 'trunks:face', local: [0.15, 0.16, 0.9] }, look: { at: 'trunks:head', off: [0, 0.15, 0] }, fov: 34 },
        say: { who: 'future_trunks', line: 'It\'s over, Gohan. Mother... it\'s finally over.', duration: 3.6, style: 'quiet' },
        hold: 4,
      },
    ],
    end(ctx) {
      ctx.m.flags.futureSaved = true;
    },
  };
})();
