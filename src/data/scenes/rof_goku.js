/* Resurrection of F · Goku's arrival, visible Sorbet ambush and Vegeta handoff.
 * Uses the existing Cinema / Staging runner. Each end() restores its skipped state.
 * Original dialogue; no new cinematic or projectile engine. */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const S = SL.data.scenes;
  const K = SL.data.buuKit, BK = SL.data.brolyKit;
  const cast = (m) => BK.cast(m);

  function ambushed(ctx) {
    const g = ctx.cast.goku, f = ctx.cast.frieza;
    K.toForm(g, 'base');
    g.hp = Math.max(1, g.hpMax * 0.12);
    g.cannotDie = true;
    K.watcher(g, 'knockdownFace', 'hurt');
    K.place(g, K.ground(ctx.b, new V3(0, 0, -6)), 0);
    K.place(f, K.ground(ctx.b, new V3(0, 0, 3)), 0);
    K.faceTo(f, g.pos);
    K.watcher(f, 'fz_watch', 'smirk');
    f.hp = f.hpMax * 0.08;
    ctx.m.flags.ambushed = true;
  }

  S.rof_goku_arrival = {
    id: 'rof_goku_arrival', cast, music: { song: 'battle', level: 1 }, auraCap: 0,
    events: [
      { call: (ctx) => {
        ctx.flags.landing = ['goku', 'vegeta', 'whis'].map((key) => ({ f: ctx.cast[key], to: ctx.cast[key].pos.clone() }));
        for (const d of ctx.flags.landing) {
          d.f.setPosition(d.to.clone().add(new V3(0, 10, 0)));
          ctx.b.vfx.ring(d.to.clone().add(new V3(0, 0.4, 0)), 3.2, 0xc7eeff, 1.4, new V3(0, 1, 0));
          ctx.b.vfx.flash(d.to.clone().add(new V3(0, 3, 0)), 1.5, 0xc7eeff, 0.65, SL.Toon.tex.glow);
        }
      }, cam: { from: [22, 7, -27], to: [18, 4, -22], look: [6, 3, -8], fov: 52 },
      tick: (ctx, seconds) => {
        const k = Math.min(1, seconds / 2.4);
        for (const d of ctx.flags.landing || []) d.f.setPosition(d.to.clone().add(new V3(0, 10 * (1 - k), 0)));
      }, sfx: { name: 'teleport' }, hold: 2.6,
      title: { chapter: 'CHAPTER 17 · RESURRECTION OF F', title: 'BLUE AND GOLD', subtitle: 'Goku and Vegeta return to Earth', duration: 3.5 } },
      { call: (ctx) => { for (const d of ctx.flags.landing || []) d.f.setPosition(d.to); },
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Sorry we kept you waiting. Gohan... Piccolo...', duration: 3 }, hold: 3.1 },
      { cam: { subject: 'gohan', with: 'piccolo', focus: 'full', angle: 'three' },
        say: { who: 'gohan', line: 'He took the blast for me. Dad, stop Frieza!', duration: 3.2 }, hold: 3.3 },
      { cam: { subject: 'frieza', focus: 'upper', angle: 'low' },
        say: { who: 'frieza', line: 'At last, Son Goku. I have worked very hard for this reunion.', duration: 3.4 }, hold: 3.5 },
      { cam: { subject: 'whis', focus: 'full', angle: 'three' },
        say: { who: 'whis', line: 'Remember your training. Confidence is useful; carelessness is not.', duration: 3.3 }, hold: 3.4 },
      { cam: { subject: 'vegeta', focus: 'upper', angle: 'three' }, pose: { who: 'vegeta', pose: 'armsCrossed', face: 'serious' },
        say: { who: 'vegeta', line: 'Do not waste my turn, Kakarot.', duration: 2.4 }, hold: 2.5 },
      { cam: { subject: 'goku', with: 'frieza', focus: 'wide', angle: 'side' },
        say: { who: 'goku', line: 'All right, Frieza. Let\'s see what you learned.', duration: 2.5 }, hold: 2.6 },
    ],
    end(ctx) { SL.data.rofGoku.tableau(ctx.b); ctx.m.flags.arrived = true; },
  };

  S.rof_goku_ambush = {
    id: 'rof_goku_ambush', cast, music: { song: null, level: 0 }, auraCap: 0,
    events: [
      { pose: [{ who: 'frieza', pose: 'exhausted', face: 'angry' }, { who: 'goku', pose: 'g_godCalm', face: 'calm' }],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side' },
        say: { who: 'goku', line: 'It\'s over. Take your soldiers and leave Earth.', duration: 3 }, hold: 3.1 },
      { transform: { who: 'goku', form: 'base' }, cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'frieza', line: 'You have always been so generous. Sorbet...', duration: 2.8 }, hold: 2.9 },
      { pose: { who: 'sorbet', pose: 'sb_idle', face: 'smirk' },
        call: (ctx) => {
          const sb = ctx.cast.sorbet;
          K.place(sb, K.ground(ctx.b, new V3(-4, 0, -12)), 0);
          K.faceTo(sb, ctx.cast.goku.pos);
          sb.setState('scripted', { pose: 'blastR', expression: 'smirk' });
        }, cam: { subject: 'sorbet', focus: 'upper', angle: 'three' }, hold: 1.1 },
      { cam: { subject: 'goku', with: 'sorbet', focus: 'full', angle: 'side' },
        call: (ctx) => {
          const sb = ctx.cast.sorbet, g = ctx.cast.goku;
          const muzzle = sb.handPos('R');
          BK.needle(ctx.b, muzzle, g.chest());
          ctx.b.sfx('kiShot', sb);
          ctx.b.vfx.sparks(g.chest(), 0xff92b2, 9, 3, 0.08);
          g.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
          ctx.b.cameraTraumaAt(g.chest(), 0.45);
        }, hold: 0.45 },
      { space: { who: 'goku', mode: 'groundImpact', to: [0, 0, -6], seconds: 0.55,
          radius: 1.4, depth: 0.25, endPose: 'knockdownFace', expr: 'hurt', shake: 0.3 },
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'My... guard...', duration: 1.8 }, hold: 1.9 },
      { call: ambushed, cam: { subject: 'frieza', with: 'goku', focus: 'full', angle: 'side' },
        say: { who: 'frieza', line: 'Strength is not everything, monkey. You should have remembered that.', duration: 3.4 }, hold: 3.5 },
    ],
    end: ambushed,
  };

  S.rof_goku_handoff = {
    id: 'rof_goku_handoff', cast, music: { song: 'battle', level: 2 }, auraCap: 0,
    events: [
      { call: ambushed, pose: { who: 'frieza', pose: 'fz_aim', face: 'smirk' },
        cam: { subject: 'frieza', with: 'goku', focus: 'full', angle: 'side' },
        say: { who: 'frieza', line: 'Now, where were we?', duration: 1.8 }, hold: 1.9 },
      { move: { who: 'vegeta', to: [0, 0, -2], seconds: 0.8, face: 'frieza' },
        pose: { who: 'vegeta', pose: 'guard', face: 'serious' },
        cam: { from: [7, 2, -9], to: [6, 1.8, -6], look: [0, 1.3, -2], fov: 50 },
        say: { who: 'vegeta', line: 'That is enough. Your fight is with me now.', duration: 2.8 }, hold: 2.9 },
      { cam: { subject: 'vegeta', with: 'frieza', focus: 'full', angle: 'side' },
        say: { who: 'frieza', line: 'Vegeta. Still waiting for scraps?', duration: 2.6 }, hold: 2.7 },
      { cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'You will find out how far I have come. Krillin — get Kakarot out of the way.', duration: 3.3 }, hold: 3.4 },
      { cam: { subject: 'goku', with: 'krillin', focus: 'full', angle: 'three' },
        place: { who: 'krillin', at: 'goku', off: [1.3, 0, -0.5], face: 'goku' },
        say: { who: 'krillin', line: 'Hang on, Goku. Let Vegeta handle this.', duration: 2.4 }, hold: 2.5 },
    ],
    end(ctx) {
      ambushed(ctx);
      const v = ctx.cast.vegeta;
      K.place(v, K.ground(ctx.b, new V3(0, 0, -2)), 0);
      K.faceTo(v, ctx.cast.frieza.pos);
      K.watcher(v, 'guard', 'serious');
      K.place(ctx.cast.krillin, K.ground(ctx.b, ctx.cast.goku.pos.clone().add(new V3(1.3, 0, -0.5))), 0);
      K.faceTo(ctx.cast.krillin, ctx.cast.goku.pos);
      ctx.m.flags.vegetaHandoff = true;
    },
  };
})();
