/*
 * SCENES — Krillin, and what comes out of it.
 *
 *   krillin_taken      Frieza lifts Krillin off the ground with his mind, lets him plead,
 *                      and closes his hand. The explosion is in the sky and nothing graphic
 *                      is shown; the camera goes to Goku.
 *   goku_super_saiyan  the flagship: silence, the ground coming apart, the sky going dark,
 *                      lightning, the change, and a storm that stays. Frieza is afraid.
 *                      Goku sends Gohan away with Piccolo.
 *   goku_legend        after the first exchanges: the legend has a name, and Frieza says it
 *
 * The weather is built from what the engine already has (stage mood, sky bolts, crater,
 * dust, floating rock) and the engine's own transformation sequence runs the form change.
 * The storm mood is left on (clearMood: false); the fight phases keep it going.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, krillin: s.krillin, frieza: s.frieza, gohan: s.gohan, piccolo: s.piccolo };
  };
  /** Lightning somewhere around him, near or far. */
  function strike(b, around, near, far) {
    const a = Math.random() * Math.PI * 2, r = near + Math.random() * (far - near);
    const at = around.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
    if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
    b.vfx.skyBolt(at, 34, 0xeaf0ff);
    b.sfx('lightning', null, { at, vol: 0.7 });
  }
  SL.data.stormStrike = strike;
  /** Store a computed shot as a pair of pseudo-actors the cam events can address. */
  function shot(ctx, name, s) {
    ctx.cast[name] = { pos: s.pos };
    ctx.cast[name + 'At'] = { pos: s.look };
    return s;
  }

  S.krillin_taken = {
    id: 'krillin_taken',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      {
        pose: [
          { who: 'frieza', pose: 'fz_point', face: 'smirk' },
          { who: 'krillin', pose: 'guard', face: 'shock' },
        ],
        call: (ctx) => shot(ctx, 'pick', SL.Cinema.overShoulder(ctx.cast.frieza, ctx.cast.krillin, { fov: 36, back: 2.4, side: 1, height: 0.7, lookUp: -0.15 })),
        cam: { from: { at: 'pick' }, look: { at: 'pickAt' }, fov: 36 },
        say: { who: 'frieza', line: 'You. The little one who cut my tail on the plains.', duration: 3 },
        hold: 3.2,
      },
      // lifted: his feet leave the ground and he cannot do anything about it
      {
        call: (ctx) => {
          ctx.liftFrom = ctx.cast.krillin.pos.clone();
          ctx.b.sfx('kiCharge', ctx.cast.frieza, { vol: 0.8, pitch: 1.4 });
        },
        pose: [{ who: 'krillin', pose: 'hitAirSpin', face: 'shock', speed: 1 }],
        tick: (ctx, t) => {
          const k = ctx.cast.krillin;
          const p = ctx.liftFrom.clone();
          p.y += Math.min(7, t * 3.2);
          k.setPosition(p);
          k.grounded = false;
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.sparks(k.chest(), 0xff8ab0, 4, 6, 0.1);
        },
        cam: { from: { at: 'krillin', off: [3.4, -1.6, 5.4] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'krillin', line: 'Wh-what — I can\'t move! Let me go!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      {
        tick: (ctx) => {
          const k = ctx.cast.krillin;
          const p = ctx.liftFrom.clone();
          p.y += 7 + Math.sin(ctx.b.frame * 0.3) * 0.08;
          k.setPosition(p);
        },
        cam: { from: { at: 'krillin', local: [0.7, 0.8, 2] }, look: { at: 'krillin:head' }, fov: 38 },
        say: { who: 'krillin', line: 'Goku! GOKU, HELP ME!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'goku', local: [1.2, 0.2, 2.4] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'goku', line: 'KRILLIN! Frieza, stop — STOP!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      // the hand closes
      {
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'smirk', speed: 4 }],
        cam: { from: { at: 'frieza', local: [0.85, 0.6, 1.7] }, to: { at: 'frieza', local: [0.7, 0.55, 1.4] }, look: { at: 'frieza:head' }, fov: 36, fov2: 32 },
        say: { who: 'frieza', line: 'Watch closely.', duration: 1.4, style: 'quiet' },
        hold: 1.4,
      },
      // the sky, and the camera on Goku's face: nothing shown but the light
      {
        call: (ctx) => {
          const k = ctx.cast.krillin;
          const b = ctx.b;
          b.vfx.explosion(k.chest(), 5, 0xffd0e0, { smoke: true });
          b.vfx.ring(k.chest(), 9, 0xffe0ea, 0.6);
        },
        hide: 'krillin',
        music: { song: null, level: 0 },
        screen: { flash: 0.85, color: '#ffe8f0' },
        sfx: { name: 'explosionBig', vol: 1.1, pitch: 1.2 },
        shake: { at: { at: 'goku' }, amount: 0.8 },
        cam: { from: { at: 'goku:head', local: [0.45, -0.1, 1.2] }, to: { at: 'goku:head', local: [0.32, -0.08, 0.9] }, look: { at: 'goku:head' }, fov: 36, fov2: 30 },
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 12 }],
        hold: 3.2,
      },
      // the sky where he was
      {
        vfx: { kind: 'dust', at: { at: 'krillin' }, radius: 2, count: 8 },
        cam: { from: { at: 'goku', off: [3.6, 1.4, 5] }, to: { at: 'goku', off: [4.2, 2, 5.8] }, look: { at: 'krillin', off: [0, -1.5, 0] }, fov: 48, fov2: 52 },
        hold: 3,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [-0.7, 0.9, 1.6] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'kid_gohan', line: 'KRILLIN!', duration: 2.2, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const k = c.krillin;
      if (k) {
        k.hp = 0;
        k.alive = false;
        k.untargetable = true;
        k.setHidden(true);
      }
      if (c.goku) c.goku.setState('scripted', { pose: 'idle', expression: 'shock' });
      m.flags.krillinTaken = true;
    },
    clearMood: false,
  };

  S.goku_super_saiyan = {
    id: 'goku_super_saiyan',
    cast,
    music: { song: null, level: 0 },
    events: [
      // 1. stillness. No music, no wind. He has not moved since the flash.
      {
        call: (ctx) => ctx.cast.goku.model.setRage && ctx.cast.goku.model.setRage(true, 0.25),
        pose: [{ who: 'goku', pose: 'idle', face: 'hurt', speed: 1 }],
        mood: { amount: 0.5, color: 0x1a1426, seconds: 2 },
        cam: { from: { at: 'goku', local: [1.4, 0.4, 3.6] }, to: { at: 'goku', local: [0.9, 0.3, 2.4] }, look: { at: 'goku' }, fov: 42, fov2: 34, ease: 'inOut' },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'frieza', local: [1.1, 0.3, 2.6] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 38 },
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        say: { who: 'frieza', line: 'There. Now you have one less thing to protect. Doesn\'t that make it simpler?', duration: 4 },
        hold: 4.2,
      },
      // 2. the ground first: cracks, a tremor, pebbles lifting
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (ctx.b.stage.crater) ctx.b.stage.crater(g.pos, 3.2, 0.3);
          ctx.b.sfx('rumble', g, { vol: 0.8 });
        },
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 8, radius: 3.5, lift: 3 },
        shake: { at: { at: 'goku' }, amount: 0.25 },
        cam: { orbit: { at: 'goku', from: -0.5, to: 0.6, radius: 3.4, radius2: 2.9, y: -0.3, y2: -0.1 }, look: { at: 'goku', off: [0, -0.4, 0] }, from: { at: 'goku', off: [0, 0.3, 3.4] }, fov: 40 },
        hold: 2.6,
      },
      // 3. his face: the tears, the shadow coming down over it
      {
        call: (ctx) => ctx.cast.goku.model.setRage && ctx.cast.goku.model.setRage(true, 0.6),
        pose: [{ who: 'goku', pose: 'g_ssjClench', face: 'grit', speed: 2 }],
        cam: { from: { at: 'goku:head', local: [0.4, -0.08, 1.2] }, to: { at: 'goku:head', local: [0.28, -0.06, 0.85] }, look: { at: 'goku:head' }, fov: 36, fov2: 30 },
        say: { who: 'goku', line: 'He was not a soldier. He never did anything to you.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // 3b. before he goes: the last clear thing he says, and it is to his son
      {
        pose: [
          { who: 'goku', pose: 'g_ssjClench', face: 'grit', speed: 2 },
          { who: 'gohan', pose: 'idle', face: 'shock' },
        ],
        cam: { from: { at: 'goku', local: [-1.1, 0.5, 2.2] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'goku', line: 'Gohan. Take Piccolo and get off this planet with Bulma — before it is too late.', duration: 4.6 },
        hold: 4.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [-0.7, 0.9, 1.6] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'kid_gohan', line: 'Dad — what about you?!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      {
        call: (ctx) => ctx.cast.goku.model.setRage && ctx.cast.goku.model.setRage(true, 0.8),
        cam: { from: { at: 'goku:head', local: [0.34, -0.05, 1] }, to: { at: 'goku:head', local: [0.26, -0.04, 0.8] }, look: { at: 'goku:head' }, fov: 34, fov2: 30 },
        say: { who: 'goku', line: 'GO! Now — while I can still ask you nicely!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const { gohan, piccolo } = ctx.cast;
          const b = ctx.b;
          for (const fr of [gohan, piccolo]) {
            if (!fr) continue;
            b.vfx.trail(fr.chest(), 0xfff0c0, 0.6, 0.4);
            b.vfx.dust(fr.pos, 2, 8);
            fr.setHidden(true);
          }
          b.sfx('dash', gohan, { vol: 1 });
        },
        cam: { from: { at: 'goku', off: [4, 2, 6] }, look: { at: 'gohan', off: [0, 2, 0] }, fov: 48 },
        hold: 1.6,
      },
      // 4. the sky goes: dark, wind, lightning in the distance, stones rising all around
      {
        call: (ctx) => {
          ctx.b.stage.setMood(0.7, 0x0a0a14, 1.2);
          strike(ctx.b, ctx.cast.goku.pos, 30, 60);
        },
        tick: (ctx, t) => {
          const b = ctx.b, g = ctx.cast.goku;
          if (b.frame % 40 === 0) strike(b, g.pos, 18, 55);
          if (b.frame % 8 === 0) b.vfx.dust(g.pos.clone().add(new V3(U.rand(-8, 8), 0, U.rand(-8, 8))), 3, 4);
          b.camera.addTrauma(0.006 + t * 0.004);
        },
        sfx: { name: 'rumble', vol: 1 },
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 16, radius: 8, lift: 10 },
        // wide enough to read the sky going over, close enough that he is still a man in it
        cam: { from: { at: 'goku', off: [0, 5, 10] }, to: { at: 'goku', off: [0, 7.5, 14] }, look: { at: 'goku', off: [0, 2.6, 0] }, fov: 54, fov2: 60, ease: 'out' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'shock' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.15] }, look: { at: 'frieza:head' }, fov: 38 },
        tick: (ctx) => {
          if (ctx.b.frame % 50 === 0) strike(ctx.b, ctx.cast.frieza.pos, 16, 40);
        },
        pose: [{ who: 'frieza', pose: 'idle', face: 'angry' }],
        say: { who: 'frieza', line: 'What is this...? His power is still climbing. That is not possible — it should have a ceiling!', duration: 4.4 },
        hold: 3.2,
      },
      // 5. the scream, and the change — handed to the engine's transformation sequence
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (g.model.setRage) g.model.setRage(true, 1);
          const idx = g.def.forms.findIndex((f) => f.id === 'ssj');
          if (idx > 0) {
            ctx.m.teach(g, 'form:ssj');
            if (g.lockedForms) delete g.lockedForms.ssj;
            g.setState('transform', { form: g.def.forms[idx], index: idx, boss: true });
          }
        },
        // his line here is the form's own (goku_ssj), spoken by the engine as the change starts
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 18, radius: 7, lift: 16 },
        cam: { orbit: { at: 'goku', from: Math.PI, to: Math.PI * 2.4, radius: 4.6, radius2: 3, y: -0.2, y2: 0.9 }, look: { at: 'goku', off: [0, 0.4, 0] }, from: { at: 'goku', off: [0, 0.4, 4.6] }, fov: 44, fov2: 38 },
        tick: (ctx) => {
          if (ctx.b.frame % 18 === 0) strike(ctx.b, ctx.cast.goku.pos, 6, 22);
        },
        // the engine's burst lands at frame 100 of the sequence: the next beat meets it
        hold: 1.65,
      },
      // 6. the burst: gold
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          const b = ctx.b;
          if (g.model.setRage) g.model.setRage(false);
          b.vfx.ring(g.pos.clone().add(new V3(0, 0.5, 0)), 24, 0xffe066, 1, new V3(0, 1, 0));
          b.vfx.explosion(g.chest(), 9, 0xfff0a0, { smoke: false });
          b.vfx.skyBolt(g.pos.clone(), 40, 0xfff6c0);
        },
        screen: { flash: 1, color: '#fff8d0' },
        sfx: { name: 'explosionHuge', who: 'goku', vol: 1.3, pitch: 0.7 },
        shake: { at: { at: 'goku' }, amount: 1 },
        slow: { scale: 0.4, seconds: 1 },
        cam: { from: { at: 'goku', local: [0.6, 0.6, 3] }, to: { at: 'goku', local: [0.2, 1.4, 6.4] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 32, fov2: 50 },
        hold: 3,
      },
      // 7. the storm settles in and stays; he stands in the middle of it
      {
        call: (ctx) => ctx.b.stage.setMood(0.42, 0x1c1a2a, 1.6),
        tick: (ctx) => {
          if (ctx.b.frame % 70 === 0) strike(ctx.b, ctx.cast.goku.pos, 30, 70);
        },
        music: { song: 'finale', level: 4 },
        cam: { from: { at: 'goku', local: [1.3, 0.2, 3.4] }, to: { at: 'goku', local: [0.9, 0.15, 2.4] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 40, fov2: 34 },
        pose: [{ who: 'goku', pose: 'g_ssjReveal', face: 'angry', speed: 2 }],
        hold: 3.4,
      },
      {
        cam: { from: { at: 'goku:head', local: [0.35, -0.04, 1.05] }, to: { at: 'goku:head', local: [0.25, -0.03, 0.8] }, look: { at: 'goku:head' }, fov: 34, fov2: 30 },
        hold: 2.4,
      },
      // 8. Frieza, afraid for the first time in his life — a step back he does not choose
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          ctx.stepFrom = fz.pos.clone();
          ctx.stepTo = fz.pos.clone().addScaledVector(fz.forward, -1.2);
          ctx.stepTo.y = ctx.b.stage.heightAt(ctx.stepTo.x, ctx.stepTo.z);
        },
        tick: (ctx, t) => ctx.cast.frieza.setPosition(ctx.stepFrom.clone().lerp(ctx.stepTo, U.clamp01(t / 0.8))),
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'shock' }],
        cam: { from: { at: 'frieza', local: [1, 0.3, 2.4] }, to: { at: 'frieza', local: [0.7, 0.25, 1.8] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 38, fov2: 32 },
        say: { who: 'frieza', line: 'Golden hair... green eyes... No. That is a story. That is a children\'s story!', duration: 4 },
        hold: 4.2,
      },
      // and then the fear turns into something he can use: rage
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry', speed: 4 }],
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          b.vfx.ring(fz.pos.clone().add(new V3(0, 0.3, 0)), 8, 0xc060ff, 0.5, new V3(0, 1, 0));
          b.sfx('kiUp', fz, { vol: 1, pitch: 0.8 });
        },
        cam: { from: { at: 'frieza', local: [0.9, 0.45, 2.1] }, to: { at: 'frieza', local: [0.7, 0.4, 1.7] }, look: { at: 'frieza:head' }, fov: 38, fov2: 32 },
        say: { who: 'frieza', line: 'A LEGEND? I am the legend! I will put you back in the ground with the rest of them!', duration: 4.4, style: 'shout' },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const { m, cast: c, b } = ctx;
      const g = c.goku;
      if (g) {
        if (g.model.setRage) g.model.setRage(false);
        const idx = g.def.forms.findIndex((f) => f.id === 'ssj');
        if (idx > 0) {
          m.teach(g, 'form:ssj');
          if (g.lockedForms) delete g.lockedForms.ssj;
          if (g.formIndex !== idx) g.applyForm(idx);
        }
        g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.7));
        g.ki = Math.max(g.ki, 90);
        g.setState('free');
        g.target = c.frieza;
      }
      for (const f of [c.gohan, c.piccolo]) {
        if (!f) continue;
        f.setHidden(true);
        f.untargetable = true;
      }
      if (c.frieza) {
        c.frieza.setState('free');
        c.frieza.target = g;
      }
      // the storm stays for the rest of the fight
      b.stage.setMood(0.42, 0x1c1a2a, 0.4);
      m.flags.superSaiyan = true;
      m.flags.gohanSentAway = true;
    },
    clearMood: false,
  };

  S.goku_legend = {
    id: 'goku_legend',
    cast,
    events: [
      // he is still talking about the man he killed, and Goku says it out loud for the first time
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'smirk' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'frieza', local: [1.1, 0.4, 2.6] }, look: { at: 'frieza:head' }, fov: 38 },
        say: { who: 'frieza', line: 'All of this because of one bald little Earthling?', duration: 3.2 },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'goku:head', local: [0.4, -0.05, 1.15] }, to: { at: 'goku:head', local: [0.3, -0.04, 0.9] }, look: { at: 'goku:head' }, fov: 36, fov2: 31 },
        say: { who: 'goku', line: 'You\'re talking about Krillin, don\'t you?', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'goku', local: [0.9, 0.35, 2.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 38 },
        say: { who: 'goku', line: 'He came here for me. He had nothing you wanted.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'hurt' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'frieza', local: [1.2, 0.3, 2.8] }, to: { at: 'frieza', local: [0.9, 0.25, 2.1] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 40, fov2: 34 },
        say: { who: 'frieza', line: 'I cannot touch him. I cannot even see him move. What ARE you?!', duration: 3.6 },
        hold: 3.8,
      },
      {
        tick: (ctx) => {
          if (ctx.b.frame % 60 === 0) strike(ctx.b, ctx.cast.goku.pos, 25, 60);
        },
        cam: { from: { at: 'goku:head', local: [0.42, -0.06, 1.2] }, to: { at: 'goku:head', local: [0.3, -0.05, 0.9] }, look: { at: 'goku:head' }, fov: 36, fov2: 30 },
        say: { who: 'goku', line: 'You have been afraid of a legend your whole life, Frieza. You wiped out my people to stop it. It did not work.', duration: 5.2 },
        hold: 5.4,
      },
      {
        cam: { from: { at: 'goku', local: [0.9, 0.2, 2.6] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 36 },
        say: { who: 'goku', line: 'I am the Super Saiyan. And I am here for every one of them.', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.1] }, look: { at: 'frieza:head' }, fov: 36 },
        say: { who: 'frieza', line: 'I am the emperor of this universe! I will NOT lose to a monkey!', duration: 3.4, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      if (c.goku) c.goku.setState('free');
      if (c.frieza) c.frieza.setState('free');
      m.flags.legendNamed = true;
    },
    clearMood: false,
  };
})();
