/*
 * SCENES — the Kaioken past what the body can take.
 *
 *   goku_kaioken10              x4 is not enough, so x10: short, loud, and a price on it
 *   frieza_fifty_percent        the emperor stops holding back — halfway — and it is plenty
 *   goku_kaioken20              the major one: a body that should not survive it, lit anyway
 *   frieza_deflects_kamehameha  the x20 Kamehameha, turned away with one hand; it hurt him,
 *                               and it did not matter
 *
 * The x20 Kamehameha itself is played (the push is a struggle in namek_kaioken20.js); these
 * scenes are the steps around it. Every scene stages its own cast, so a checkpoint start or
 * a skip lands on a correct state (end()).
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, frieza: s.frieza, krillin: s.krillin, gohan: s.gohan };
  };
  /** Put the Kaioken on at an exact level (the engine climbs one level per charge). */
  function kaioken(g, level) {
    if (g.formIndex !== 1) g.applyForm(1);
    g.formLevel = Math.min(level, g.form.levels.length - 1);
    g._applyFormLevel();
  }
  function burst(b, f, color, radius) {
    b.vfx.ring(f.pos.clone().add(new V3(0, 0.4, 0)), radius, color, 0.8, new V3(0, 1, 0));
    b.vfx.explosion(f.chest(), radius * 0.4, color, { smoke: false });
    b.vfx.dust(f.pos, radius * 0.35, 18);
    b.cameraTraumaAt(f.pos, 0.8);
  }

  S.goku_kaioken10 = {
    id: 'goku_kaioken10',
    cast,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'g_kaiokenFlex', face: 'grit' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        cam: { from: { at: 'goku:head', local: [0.5, -0.1, 1.3] }, to: { at: 'goku:head', local: [0.35, -0.08, 1] }, look: { at: 'goku:head' }, fov: 38, fov2: 34 },
        say: { who: 'goku', line: 'x4 is not going to do it. Then I will go past what King Kai said I could.', duration: 3.6, style: 'quiet' },
        hold: 3.6,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          kaioken(g, 3);
          burst(ctx.b, g, 0xff3a28, 14);
          ctx.b.sfx('kaiokenBoom', g, { vol: 1.3, pitch: 0.85 });
        },
        mood: { amount: 0.55, color: 0x3a0c10, seconds: 0.4 },
        screen: { flash: 0.5, color: '#ffd0c8' },
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 10, radius: 5, lift: 10 },
        cam: { from: { at: 'goku', local: [0.6, 0.3, 3.4] }, to: { at: 'goku', local: [0.3, 1, 5.6] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 38, fov2: 50 },
        say: { who: 'goku', line: 'Kaioken... times TEN!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'angry' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.2] }, look: { at: 'frieza:head' }, fov: 38 },
        say: { who: 'frieza', line: 'Ten? Your body is coming apart doing that. I can see it from here.', duration: 3.2 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const g = c.goku;
      if (g) {
        g.formCaps = { kaioken: 3 };
        kaioken(g, 3);
        g.setState('free');
      }
      if (c.frieza) c.frieza.setState('free');
      m.flags.kaioken10 = true;
    },
  };

  S.frieza_fifty_percent = {
    id: 'frieza_fifty_percent',
    cast,
    events: [
      // Goku has been landing. Frieza steps back, dusts himself off, and laughs
      {
        pose: [
          { who: 'goku', pose: 'guard', face: 'grit' },
          { who: 'frieza', pose: 'armsCrossed', face: 'smirk' },
        ],
        cam: { from: { at: 'frieza', local: [1.4, 0.6, 3.4] }, to: { at: 'frieza', local: [1, 0.5, 2.6] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 40, fov2: 36 },
        say: { who: 'frieza', line: 'Very good. Very, very good. You have earned something nobody else has seen.', duration: 3.8 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry' }],
        music: { level: 0 },
        vfx: { kind: 'stream', at: { at: 'frieza' }, radius: 3.2, color: 0xd070ff, count: 14, life: 0.7 },
        sfx: { name: 'kiCharge', who: 'frieza', vol: 1.2, pitch: 0.7 },
        cam: { orbit: { at: 'frieza', from: -0.6, to: 0.9, radius: 4.2, radius2: 3, y: 0.1, y2: 0.6 }, look: { at: 'frieza', off: [0, 0.3, 0] }, from: { at: 'frieza', off: [0, 0.4, 4] }, fov: 42, fov2: 46 },
        shake: { at: { at: 'frieza' }, amount: 0.5 },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          burst(ctx.b, fz, 0xc060ff, 16);
          ctx.b.vfx.flash(fz.chest(), 7, 0xf0d8ff, 0.4, SL.Toon.tex.glow);
          ctx.b.sfx('explosionBig', fz, { vol: 1.1, pitch: 0.8 });
        },
        pose: [{ who: 'frieza', pose: 'fz_roar', face: 'angry', speed: 3 }],
        music: { song: 'finale', level: 3 },
        mood: { amount: 0.5, color: 0x2a0a34, seconds: 0.6 },
        screen: { flash: 0.45, color: '#f0d8ff' },
        vfx: { kind: 'rocks', at: { at: 'frieza' }, count: 14, radius: 6, lift: 12 },
        cam: { from: { at: 'frieza', local: [0.4, 0.2, 3.2] }, to: { at: 'frieza', local: [0.2, 1.2, 6] }, look: { at: 'frieza', off: [0, 0.5, 0] }, fov: 36, fov2: 50 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        cam: { from: { at: 'frieza:head', local: [0.45, -0.08, 1.15] }, to: { at: 'frieza:head', local: [0.32, -0.06, 0.9] }, look: { at: 'frieza:head' }, fov: 36, fov2: 32 },
        say: { who: 'frieza', line: 'Fifty percent of my maximum. Halfway. Is that clear enough for a monkey?', duration: 3.8 },
        hold: 3.8,
      },
      // and he shows it: across the gap before the camera can follow
      {
        call: (ctx) => {
          const { goku, frieza } = ctx.cast;
          const b = ctx.b;
          b.vfx.afterimage(frieza.pos.clone(), 1.8, 0xd8b0ff);
          const at = goku.pos.clone().addScaledVector(goku.forward, 1.3);
          at.y = b.stage.heightAt(at.x, at.z);
          frieza.setPosition(at);
          frieza.yaw = frieza.prevYaw = Math.atan2(goku.pos.x - at.x, goku.pos.z - at.z);
          b.sfx('punchHeavy', goku, { vol: 1.4, pitch: 0.7 });
          b.vfx.impact(goku.chest(), 3, 0xffffff);
          b.cameraTraumaAt(goku.chest(), 0.9);
        },
        pose: [
          { who: 'frieza', pose: 'fz_jab', face: 'angry' },
          { who: 'goku', pose: 'hitHeavy', face: 'hurt' },
        ],
        slow: { scale: 0.35, seconds: 0.6 },
        cam: { from: { at: 'goku', local: [2.6, 0.4, 1.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 40 },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          const b = ctx.b;
          const at = g.pos.clone().addScaledVector(g.forward, -7);
          at.y = b.stage.heightAt(at.x, at.z);
          g.setPosition(at);
          b.vfx.dust(at, 3, 16);
          b.sfx('groundImpact', g, { vol: 1 });
          // the x10 does not survive it
          if (g.formIndex !== 0) g.applyForm(0);
        },
        pose: [{ who: 'goku', pose: 'knockdown', face: 'hurt' }],
        cam: { from: { at: 'goku', local: [2.4, 1, 3.4] }, to: { at: 'goku', local: [1.6, 0.6, 2.6] }, look: { at: 'goku' }, fov: 42, fov2: 38 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'krillin', local: [0.7, 0.9, 1.7] }, look: { at: 'krillin:head' }, fov: 38 },
        say: { who: 'krillin', line: 'Half... that was HALF?', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const g = c.goku, fz = c.frieza;
      if (g) {
        if (g.formIndex !== 0) g.applyForm(0);
        g.hp = Math.min(g.hp, Math.round(g.hpMax * 0.5));
      }
      if (fz) {
        fz.fiftyPercent = true;
        fz.damageDealtMul = 1.15;
      }
      m.flags.fiftyPercent = true;
    },
  };

  S.goku_kaioken20 = {
    id: 'goku_kaioken20',
    cast,
    events: [
      // on the ground, and quiet: he knows what the next thing costs
      {
        pose: [
          { who: 'goku', pose: 'knockdown', face: 'hurt' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        music: { level: 0 },
        mood: { amount: 0.45, color: 0x1a0c10, seconds: 1.2 },
        // he is lying down: a world-space camera, above and beside him (a head-frame camera would sit inside his chest)
        cam: { from: { at: 'goku', off: [1.9, 1.5, 1.9] }, to: { at: 'goku', off: [1.4, 1.1, 1.4] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 40, fov2: 36 },
        say: { who: 'goku', line: 'x10 was already tearing me apart...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'g_resolve', face: 'grit', speed: 2 }],
        cam: { from: { at: 'goku', local: [0.9, 0.3, 2.8] }, to: { at: 'goku', local: [0.5, 0.15, 1.9] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 40, fov2: 34 },
        say: { who: 'goku', line: 'My body might not take it. It is going to have to.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      // the build: steam, the ground lifting, the sky going red around him
      {
        pose: [{ who: 'goku', pose: 'g_kaiokenFlex', face: 'shout' }],
        sfx: { name: 'kiCharge', who: 'goku', vol: 1.3, pitch: 0.8 },
        vfx: { kind: 'stream', at: { at: 'goku' }, radius: 3.8, color: 0xff3a28, count: 18, life: 0.7 },
        mood: { amount: 0.7, color: 0x46080c, seconds: 1.4 },
        cam: { orbit: { at: 'goku', from: 0.3, to: Math.PI * 1.4, radius: 5, radius2: 3, y: 0, y2: 1 }, look: { at: 'goku', off: [0, 0.35, 0] }, from: { at: 'goku', off: [0, 0.4, 4] }, fov: 44, fov2: 52 },
        tick: (ctx, t) => {
          const b = ctx.b, g = ctx.cast.goku;
          if (b.frame % 10 === 0) b.vfx.sparks(g.chest(), 0xff5a40, 10, 10);
          if (b.frame % 24 === 0) b.vfx.bolt(g.chest().add(new V3(U.rand(-1, 1), U.rand(-0.5, 1), U.rand(-1, 1))), 2.6, 0xff9a8a);
          b.camera.addTrauma(0.012 + t * 0.006);
        },
        hold: 3.2,
      },
      {
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 16, radius: 7, lift: 14 },
        call: (ctx) => ctx.b.stage.crater && ctx.b.stage.crater(ctx.cast.goku.pos, 4.5, 0.6),
        shake: { at: { at: 'goku' }, amount: 0.9 },
        hold: 1,
      },
      // THE ACTIVATION
      {
        call: (ctx) => {
          const g = ctx.cast.goku, b = ctx.b;
          ctx.m.teach(g, 'form:kaioken');
          g.formCaps = { kaioken: 4 };
          kaioken(g, 4);
          burst(b, g, 0xff2010, 22);
          b.vfx.flash(g.chest(), 9, 0xffe0d8, 0.5, SL.Toon.tex.glow);
          b.vfx.skyBolt(g.pos.clone().add(new V3(3, 0, -2)), 36, 0xff8a70);
          b.sfx('explosionBig', g, { vol: 1.4, pitch: 0.7 });
          b.sfx('kaiokenBoom', g, { vol: 1.4, pitch: 0.7 });
        },
        music: { song: 'finale', level: 5 },
        screen: { flash: 0.7, color: '#ffc8c0' },
        slow: { scale: 0.5, seconds: 0.8 },
        cam: { from: { at: 'goku', local: [0.5, 0.2, 3] }, to: { at: 'goku', local: [0.3, 1.6, 7.5] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 36, fov2: 54 },
        say: { who: 'goku', line: 'KAIOKEN... TIMES TWENTY!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'shock' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.12, 1.2] }, to: { at: 'frieza:head', local: [0.4, -0.1, 0.95] }, look: { at: 'frieza:head' }, fov: 38, fov2: 34 },
        say: { who: 'frieza', line: 'Twenty?! He will kill himself before he touches me!', duration: 2.8 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [-0.7, 0.9, 1.6] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'gohan', line: 'Dad, stop — your body!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const g = c.goku;
      if (g) {
        m.teach(g, 'form:kaioken');
        g.formCaps = { kaioken: 4 };
        kaioken(g, 4);
        g.setState('free');
      }
      if (c.frieza) c.frieza.setState('free');
      m.flags.kaioken20 = true;
    },
  };

  S.frieza_deflects_kamehameha = {
    id: 'frieza_deflects_kamehameha',
    cast,
    events: [
      // the beam at his palm — one hand, and it is pushing him back
      {
        pose: [
          { who: 'frieza', pose: 'fz_aim', face: 'shout' },
          { who: 'goku', pose: 'g_kameFire', face: 'shout' },
        ],
        // side-on and back a little: the beam's head must not fill the frame
        cam: { from: { at: 'frieza', local: [4.2, 0.7, 0.8] }, look: { at: 'frieza', off: [0, 0.35, 0.6] }, fov: 44 },
        tick: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          if (b.frame % 2 === 0) b.vfx.sparks(fz.chest().addScaledVector(fz.forward, 0.9), 0x9ad8ff, 8, 14, 0.12);
          b.camera.addTrauma(0.02);
        },
        hold: 1.6,
      },
      // and he throws it into the sky
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          const beam = ctx.opts.beam;
          if (beam && !beam.done) {
            beam.headOverride = null;
            beam.dir.set(0.25, 1, -0.2).normalize();
            beam.stop();
          }
          // what the audience sees: the stream bent off his palm and up into the sky
          const palm = fz.chest().addScaledVector(fz.forward, 0.9);
          const up = new V3(0.25, 1, -0.2).normalize();
          for (let i = 0; i <= 24; i++) b.vfx.trail(palm.clone().addScaledVector(up, i * 1.8), 0x9ad8ff, 1.3 - i * 0.03, 0.9);
          b.vfx.ring(fz.chest().addScaledVector(fz.forward, 0.8), 6, 0x9ad8ff, 0.5);
          b.vfx.flash(fz.chest(), 6, 0xe8f8ff, 0.4, SL.Toon.tex.glow);
          b.sfx('guardBreak', fz, { vol: 1.4, pitch: 0.6 });
          b.cameraTraumaAt(fz.chest(), 0.9);
        },
        pose: [{ who: 'frieza', pose: 'fz_wave', face: 'shout', speed: 3 }],
        screen: { flash: 0.4, color: '#e8f8ff' },
        cam: { from: { at: 'frieza', local: [-3.4, 0.1, 4] }, to: { at: 'frieza', local: [-3.8, 0.5, 4.8] }, look: { at: 'frieza', off: [0, 3, 0] }, fov: 54, fov2: 58 },
        hold: 1.8,
      },
      // far off, the beam lands on the horizon
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          const far = fz.pos.clone().add(new V3(60, 0, -90));
          far.y = b.stage.heightAt(far.x, far.z);
          ctx.cast.far = { pos: far };
          b.vfx.explosion(far.clone().add(new V3(0, 3, 0)), 16, 0x9ad8ff, { smoke: true });
          b.vfx.skyBolt(far, 30, 0xc8ecff);
          b.sfx('explosionBig', null, { vol: 0.8, pitch: 0.6 });
        },
        cam: { from: { at: 'frieza', local: [0.6, 1.6, 4] }, look: { at: 'far', off: [0, 6, 0] }, fov: 34 },
        hold: 2.2,
      },
      // his hand is smoking
      {
        pose: [{ who: 'frieza', pose: 'fz_point', face: 'angry' }],
        cam: { from: { at: 'frieza:head', local: [0.55, -0.25, 1.1] }, to: { at: 'frieza:head', local: [0.42, -0.2, 0.9] }, look: { at: 'frieza:head', off: [0, -0.2, 0] }, fov: 36, fov2: 32 },
        tick: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          if (b.frame % 6 === 0) b.vfx.dust(fz.chest().addScaledVector(fz.forward, 0.6).add(new V3(0, 0.2, 0)), 0.4, 2, 0x8a8a8a);
        },
        say: { who: 'frieza', line: '...That hurt. That actually hurt.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        say: { who: 'frieza', line: 'And that was everything you had, was it not?', duration: 2.8 },
        hold: 2.8,
      },
      // the Kaioken goes out, and he goes down with it
      {
        call: (ctx) => {
          const g = ctx.cast.goku, b = ctx.b;
          if (g.formIndex !== 0) g.applyForm(0);
          g.strain = 90;
          b.vfx.flash(g.chest(), 3, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('kiUp', g, { pitch: 0.5 });
        },
        pose: [{ who: 'goku', pose: 'g_defeatKnee', face: 'hurt', speed: 2 }],
        music: { level: 1 },
        mood: { amount: 0.4, color: 0x14101a, seconds: 1.5 },
        cam: { from: { at: 'goku', local: [1.8, 0.6, 3] }, to: { at: 'goku', local: [1.2, 0.3, 2.2] }, look: { at: 'goku', off: [0, -0.2, 0] }, fov: 42, fov2: 36 },
        hold: 2.4,
      },
      {
        // kneeling, head down: low and in front, looking up into his face
        cam: { from: { at: 'goku', local: [0.55, 0.35, 1.35] }, to: { at: 'goku', local: [0.45, 0.32, 1.1] }, look: { at: 'goku:head' }, fov: 38, fov2: 34 },
        say: { who: 'goku', line: 'One hand. Twenty times, and he knocked it away with one hand.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const g = c.goku;
      if (ctx.opts.beam && !ctx.opts.beam.done) ctx.opts.beam.stop();
      if (g) {
        if (g.formIndex !== 0) g.applyForm(0);
        g.strain = Math.max(g.strain, 90);
        g.hp = Math.min(g.hp, Math.round(g.hpMax * 0.3));
        g.ki = Math.min(g.ki, 15);
      }
      m.flags.kamehamehaDeflected = true;
    },
  };
})();
