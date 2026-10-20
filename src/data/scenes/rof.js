/*
 * SCENES — CHAPTER 17 · RESURRECTION OF F ("The Thousand Soldiers"). Data for SL.Cinema (src/game/cinema.js).
 *
 *   rof_arrival  the plain outside the city, a clear sky; the army drops out of it in ranks and lands; Frieza floats
 *                down between Sorbet and Tagoma; the four who came to meet him; "Where is Son Goku?"; hold the line
 *   rof_after    Piccolo down; Gohan's cry; a column of light out of the sky behind Frieza — Goku and Vegeta are back
 *
 * Dialogue: original lines in the characters' voices. Positions: rof_invasion.js SPOT / rank().
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const cast = (m) => SL.data.brolyKit.cast(m);
  const K = () => SL.data.buuKit;

  S.rof_arrival = {
    id: 'rof_arrival',
    cast,
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      // high and wide over the plain: the sky first
      {
        call: (ctx) => {
          const b = ctx.b, S = b.story;
          // the army and its officers start high in the sky; they come down together
          ctx.flags.drop = [S.frieza, S.sorbet, S.tagoma, ...S.army].map((f) => ({ f, to: f.pos.clone(), from: f.pos.clone().add(new V3(0, 28, 0)) }));
          for (const d of ctx.flags.drop) d.f.setPosition(d.from.clone());
        },
        cam: { from: [26, 8, -30], to: [22, 10, -26], look: [0, 18, 16], fov: 56, raw: true },
        title: { chapter: 'CHAPTER 17 · RESURRECTION OF F', title: 'THE THOUSAND SOLDIERS', subtitle: 'Earth · a plain outside the city · Age 779', duration: 4.2 },
        tick: (ctx, s) => {
          const k = Math.min(1, s / 4.2);
          const e = 1 - Math.pow(1 - k, 2);
          for (const d of ctx.flags.drop || []) d.f.setPosition(d.from.clone().lerp(d.to, e));
          if (Math.abs(k - 1) < 0.02 && !ctx.flags.landed) {
            ctx.flags.landed = true;
            for (const d of ctx.flags.drop) if (d.f.tags && d.f.tags.mission) ctx.b.vfx.dust(d.to.clone(), 0.8, 3);
            ctx.b.cameraTraumaAt(new V3(0, 0, 14), 0.4);
          }
        },
        sfx: { name: 'rumble', vol: 0.6 },
        hold: 4.4,
      },
      // the ranks, from the ground in front of them
      {
        call: (ctx) => {
          for (const d of ctx.flags.drop || []) d.f.setPosition(d.to.clone());
        },
        cam: { from: [-14, 1.4, 4], to: [-10, 1.6, 6], look: [4, 1.8, 16], fov: 50, raw: true },
        say: { who: 'krillin', line: 'That\'s... that\'s an army. He really brought an army.', duration: 3 },
        hold: 3.1,
      },
      // Frieza, between his officers
      {
        pose: [{ who: 'frieza', pose: 'fz_watch', face: 'smirk' }, { who: 'sorbet', pose: 'sb_idle', face: 'smirk' }],
        cam: { subject: 'frieza', focus: 'upper', angle: 'low' },
        say: { who: 'frieza', line: 'Hello again, Earth. Did you miss me? I have been dead, you see — and I have had a great deal of time to think about Son Goku.', duration: 5 },
        hold: 5.1,
      },
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'serious' }, { who: 'piccolo', pose: 'armsCrossed', face: 'serious' }],
        cam: { subject: 'gohan', with: 'piccolo', focus: 'full', angle: 'three' },
        say: { who: 'piccolo', line: 'Goku isn\'t here.', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'frieza', focus: 'closeup', angle: 'three' },
        say: { who: 'frieza', line: 'Then you will do until he arrives. Soldiers — kill them all.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'sorbet', pose: 'sb_bow', face: 'smirk' }, { who: 'tagoma', pose: 'tg_idle', face: 'grin' }],
        cam: { subject: 'tagoma', with: 'sorbet', focus: 'full', angle: 'low' },
        say: { who: 'sorbet', line: 'At once, Lord Frieza! All units — attack!', duration: 2.6, style: 'shout' },
        hold: 2.7,
      },
      // the four of them: hold the line
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'determined' }, { who: 'tien', pose: 'idle', face: 'determined' }],
        cam: { subject: 'krillin', with: 'tien', focus: 'full', angle: 'three' },
        say: { who: 'tien', line: 'We don\'t have to win. We just have to last until Goku and Vegeta get back.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'gohan', focus: 'upper', angle: 'front' },
        say: { who: 'gohan', line: 'Then let\'s hold the line.', duration: 2.2 },
        hold: 2.3,
      },
    ],
    end(ctx) {
      for (const d of ctx.flags.drop || []) d.f.setPosition(d.to.clone());
      ctx.m.flags.arrived = true;
    },
  };

  S.rof_after = {
    id: 'rof_after',
    cast,
    music: { song: null, level: 0 },
    auraCap: 0,
    events: [
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'sad', speed: 6 }],
        call: (ctx) => {
          const g = ctx.cast.gohan, pc = ctx.cast.piccolo;
          K().place(g, K().ground(ctx.b, pc.pos.clone().add(new V3(0.9, 0, -0.6))), 0);
          K().faceTo(g, pc.pos);
        },
        cam: { subject: 'gohan', with: 'piccolo', focus: 'full', angle: 'three' },
        say: { who: 'gohan', line: 'Mister Piccolo... no — MISTER PICCOLO!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
      {
        cam: { subject: 'frieza', focus: 'upper', angle: 'three' },
        say: { who: 'frieza', line: 'Don\'t worry. You will join him in a moment.', duration: 2.6 },
        hold: 2.7,
      },
      // a column of light comes down out of the sky behind him
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          const at = fz.pos.clone().add(new V3(-9, 0, -4));
          at.y = b.stage.heightAt(at.x, at.z);
          ctx.flags.light = at;
          for (let i = 0; i < 6; i++) b.after(i * 8, () => b.vfx.ring(at.clone().add(new V3(0, 0.3 + i * 2.5, 0)), 3 + i * 0.4, 0xbfe8ff, 0.8, new V3(0, 1, 0)));
          b.vfx.flash(at.clone().add(new V3(0, 2, 0)), 6, 0xdff4ff, 1.2, SL.Toon.tex.glow);
          // the column itself: a tall pillar of white-blue light from the sky to the ground, fading out
          const col = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 70, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xe0f4ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
          col.position.copy(at).add(new V3(0, 35, 0));
          b.scene.add(col);
          const gone = () => {
            if (col.parent) col.parent.remove(col);
            col.geometry.dispose();
            col.material.dispose();
          };
          let life = 0;
          b.onTick(() => {
            if (b.disposed || !col.parent) return false;
            life++;
            col.material.opacity = Math.max(0, 0.75 - Math.max(0, life - 110) / 60);
            col.scale.x = col.scale.z = 1 + Math.sin(life * 0.3) * 0.06;
            if (col.material.opacity <= 0) {
              gone();
              return false;
            }
            return true;
          });
          ctx.m.onDispose(gone);
          SL.ScreenFX.flash(0.3, '#e8f6ff');
          b.sfx('teleport', null, { at, pitch: 0.7 });
          ctx.m.shot((t, out) => {
            out.pos.copy(at).add(new V3(10, 2.5, -10));
            out.look.copy(at).add(new V3(0, 4 + t * 2, 0));
            out.fov = 52;
          }, 3.2, { cut: true, blendIn: 0 });
        },
        pose: [{ who: 'frieza', pose: 'fz_watch', face: 'shock' }],
        hold: 3.2,
      },
      {
        cam: { subject: 'frieza', focus: 'closeup', angle: 'front' },
        say: { who: 'frieza', line: '...So. There you are.', duration: 2.4 },
        hold: 2.5,
      },
      {
        cam: { subject: 'gohan', focus: 'closeup', angle: 'three' },
        say: { who: 'gohan', line: 'Dad...!', duration: 1.8 },
        hold: 1.9,
      },
    ],
    end(ctx) {
      ctx.m.flags.after = true;
    },
  };
})();
