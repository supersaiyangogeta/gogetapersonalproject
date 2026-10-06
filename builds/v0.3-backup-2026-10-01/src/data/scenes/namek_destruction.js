/*
 * SCENES — Namek starts to die, and the fight moves onto what is left of it.
 *
 *   namek_destruction   he shoots the planet, and the planet answers (namek_super_saiyan)
 *   namek_dying         the dying planet, seen properly: a separate place now (namek_end,
 *                       stage 'namek_ruin' — lava where the water was, a burning sky)
 *   frieza_full_power   one hundred percent: the body swells past what it was built for
 *
 * The destruction is not a line of text. The player watches him fire into the
 * ground, watches the crack travel out past the horizon, and then the sky
 * changes colour and stays changed for the rest of the chapter.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  S.namek_destruction = {
    id: 'namek_destruction',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza, gohan: s.gohan };
    },
    music: { song: 'finale', level: 5 },
    events: [
      {
        pose: [
          { who: 'frieza', pose: 'fz_aim', face: 'angry' },
          { who: 'goku', pose: 'idle', face: 'grit' },
        ],
        cam: { from: { at: 'frieza', local: [1.2, 0.5, 3] }, to: { at: 'frieza', local: [0.8, 0.4, 2.2] }, look: { at: 'frieza' }, fov: 42, fov2: 34 },
        say: { who: 'frieza', line: 'If I cannot have this planet, nobody will be standing on it.', duration: 3.6 },
        hold: 3.8,
      },
      // he fires into the ground, not at anybody
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          const b = ctx.b;
          if (!fz) return;
          const at = fz.pos.clone().addScaledVector(fz.forward, 6);
          if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
          const from = fz.handPos('R');
          for (let i = 0; i <= 14; i++) b.vfx.trail(from.clone().lerp(at, i / 14), 0xff3a6a, 0.6, 0.4);
          b.vfx.explosion(at, 12, 0xff8a6a, { smoke: true });
          b.vfx.ring(at.clone().add(new V3(0, 0.3, 0)), 26, 0xffb0a0, 1, new V3(0, 1, 0));
          b.cameraTraumaAt(at, 1);
          ctx.m.flags.coreShot = at.clone();
        },
        sfx: { name: 'explosionBig', vol: 1.4, pitch: 0.55 },
        screen: { flash: 0.7, color: '#ffd8cc' },
        slow: { scale: 0.4, seconds: 1 },
        cam: { from: { at: 'frieza', off: [8, 3.4, 10] }, to: { at: 'frieza', off: [12, 6, 14] }, look: { at: 'frieza', off: [0, 1, 0] }, fov: 52, fov2: 60, ease: 'out' },
        hold: 3.2,
      },
      // the crack runs away from it, out past everything
      {
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 20, radius: 14, lift: 14 },
        mood: { amount: 0.6, color: 0x4a1810, seconds: 2.4 },
        shake: { at: { at: 'goku' }, amount: 0.8 },
        sfx: { name: 'groundImpact', vol: 1.2, pitch: 0.5 },
        cam: { from: { at: 'goku', off: [0, 6, 12] }, to: { at: 'goku', off: [0, 14, 22] }, look: { at: 'goku', off: [0, 0, -40] }, fov: 58, fov2: 66, ease: 'out' },
        hold: 4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'goku', local: [0.8, 0.35, 2.4] }, look: { at: 'goku' }, fov: 36 },
        say: { who: 'goku', line: 'You have killed the whole planet. Everything still on it.', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'frieza', local: [1, 0.5, 2.6] }, look: { at: 'frieza' }, fov: 36 },
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        say: { who: 'frieza', line: 'It has about five minutes left. So do you.', duration: 3.4 },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const { m, b, cast } = ctx;
      if (b.stage.setMood) b.stage.setMood(0.5, 0x4a1810, 2);
      if (cast.goku) cast.goku.setState('free');
      if (cast.frieza) cast.frieza.setState('free');
      m.flags.planetDying = true;
    },
    clearMood: false, // the sky stays angry for the rest of the chapter
  };

  S.namek_dying = {
    id: 'namek_dying',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza };
    },
    music: { song: 'finale', level: 3 },
    events: [
      // wide and high: what the planet has become
      {
        call: (ctx) => {
          const b = ctx.b, g = ctx.cast.goku;
          for (let i = 0; i < 4; i++) {
            const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 40;
            const at = g.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
            if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
            b.vfx.explosion(at, 10, 0xff9a5a, { smoke: true });
          }
          b.sfx('rumble', null, { vol: 1 });
        },
        tick: (ctx) => {
          const b = ctx.b, g = ctx.cast.goku;
          if (b.frame % 45 === 0) {
            const a = Math.random() * Math.PI * 2, r = 25 + Math.random() * 50;
            const at = g.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
            if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
            b.vfx.explosion(at, 9, 0xff8a4a, { smoke: true });
          }
        },
        cam: { from: { at: 'goku', off: [-30, 22, 40] }, to: { at: 'goku', off: [-22, 16, 30] }, look: { at: 'goku', off: [0, 0, -10] }, fov: 58, fov2: 54, ease: 'inOut' },
        hold: 4.4,
      },
      // the two of them, small against it
      {
        cam: { from: { at: 'goku', off: [10, 3, 12] }, to: { at: 'goku', off: [8, 2.6, 9] }, look: { at: 'frieza', off: [0, 0.6, 0] }, fov: 46, fov2: 42 },
        pose: [
          { who: 'goku', pose: 'idle', face: 'angry' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        hold: 2.8,
      },
      {
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.2] }, look: { at: 'frieza:head' }, fov: 38 },
        say: { who: 'frieza', line: 'Five minutes, monkey. That is plenty of time.', duration: 3 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'goku:head', local: [0.4, -0.06, 1.1] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'Then we finish this before it goes.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, b, cast } = ctx;
      b.stage.setMood(0.3, 0x4a1810, 1);
      if (cast.goku) cast.goku.setState('free');
      if (cast.frieza) cast.frieza.setState('free');
      m.flags.ruinShown = true;
    },
    clearMood: false,
  };

  S.frieza_full_power = {
    id: 'frieza_full_power',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza };
    },
    events: [
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'frieza', local: [1.3, 0.4, 3] }, to: { at: 'frieza', local: [1, 0.3, 2.3] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 40, fov2: 36 },
        say: { who: 'frieza', line: 'You want to see everything? Then look. I have never needed this. Not once.', duration: 4 },
        hold: 4.2,
      },
      // the change: the engine's transformation sequence, with the planet answering it
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          const i = fz.def.forms.findIndex((f) => f.id === 'full');
          if (i > 0) fz.setState('transform', { form: fz.def.forms[i], index: i, boss: true });
        },
        tick: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          if (b.frame % 30 === 0) {
            const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 16;
            const at = fz.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
            if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
            b.vfx.explosion(at, 5, 0xff8a4a, { smoke: true });
          }
        },
        hold: 5.2,
      },
      {
        pose: [{ who: 'goku', pose: 'guard', face: 'grit' }],
        cam: { from: { at: 'goku:head', local: [0.42, -0.08, 1.15] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'His body... he is forcing it past what it can hold.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'frieza', local: [0.9, 0.2, 2.8] }, to: { at: 'frieza', local: [0.7, 0.1, 2.2] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 38, fov2: 34 },
        say: { who: 'frieza', line: 'One hundred percent. Enjoy it. It is the last thing you will ever see.', duration: 3.8 },
        hold: 4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const fz = cast.frieza;
      if (fz) {
        const i = fz.def.forms.findIndex((f) => f.id === 'full');
        if (i > 0 && fz.formIndex !== i) fz.applyForm(i);
        fz.setState('free');
      }
      if (cast.goku) cast.goku.setState('free');
      m.flags.fullPower = true;
    },
    clearMood: false,
  };
})();
