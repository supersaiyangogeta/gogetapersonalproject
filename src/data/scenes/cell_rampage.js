/*
 * SCENES — the Cell Games, part three (mission cell_rampage, 2026-10-01).
 *
 *   rp_open    seven of them in a ring round him; he looks at each one
 *   rp_after   dust and silence where the seven were; Cell, for once, not smiling
 *   rp_catch   the full-power punch stopped in one open hand an inch from his nose; the gut punch —
 *              the back bulges, the eyes go white; on his knees, Cell brings Android 18 back up and the
 *              perfect form melts away
 *   rp_swell   "If I lose, everybody loses": he starts to swell
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const CK = () => SL.data.cellKit;

  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    (s.juniors || []).forEach((j, i) => (out['j' + i] = j));
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const ring = (ctx, x, z) => CK().onRing(ctx.b, x, z);
  const faceTo = (f, p) => CK().faceTo(f, p);

  S.rp_open = {
    id: 'rp_open',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 5 },
    events: [
      {
        pose: [{ who: 'gohan', pose: 'tg2_glance', face: 'angry', speed: 3 }],
        cam: { orbit: { at: { at: 'gohan', off: [0, 0.6, 0] }, from: 0, to: 2.4, radius: 7, radius2: 5, y: 1.4, y2: 0.6 }, look: { at: 'gohan', off: [0, 0.5, 0] }, fov: 46 },
        sfx: { name: 'saibaScreech', vol: 0.7, pitch: 1.4 },
        hold: 4,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'wicked', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.4, 0.3, 1.8] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'What are you waiting for, children? Tear him apart!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'gohan:face', local: [0.1, 0.16, 0.7] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        say: { who: 'teen_gohan', line: '...Come on, then.', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
    ],
    end() {},
  };

  S.rp_after = {
    id: 'rp_after',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), g = st.gohan;
          g.setHidden(false);
          if (g.pos.y - ctx.b.stage.heightAt(g.pos.x, g.pos.z) > 0.4) CK().place(g, CK().ground(ctx.b, g.pos));
          pt(ctx, 'here', g.pos);
        },
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 2 }],
        cam: { orbit: { at: { at: 'gohan', off: [0, 0.5, 0] }, from: 3.6, to: 5.2, radius: 5, radius2: 3.6, y: 0.4, y2: 0.3 }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 42 },
        tick: (ctx) => {
          if (ctx.b.frame % 10 === 0) ctx.b.vfx.dust(ctx.cast.here.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 3, 0.2, Math.cos(ctx.b.frame) * 3)), 1.2, 2);
        },
        hold: 4,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'shock', speed: 2 }],
        cam: { from: { at: 'cell', local: [0.4, 0.25, 1.7] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'All seven... in under a minute...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        call: (ctx) => faceTo(story(ctx).gohan, story(ctx).cell.pos),
        cam: { from: { at: 'gohan:face', local: [0.1, 0.16, 0.7] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        say: { who: 'teen_gohan', line: 'Your turn.', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
    ],
    end(ctx) {
      ctx.m.flags.juniorsDestroyed = true;
    },
  };

  S.rp_catch = {
    id: 'rp_catch',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 6 },
    clearMood: false,
    events: [
      // they face each other on the stone
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          K.place(st.gohan, ring(ctx, 0, 3), Math.PI);
          K.place(st.cell, ring(ctx, 0, -5), 0);
          faceTo(st.gohan, st.cell.pos);
          faceTo(st.cell, st.gohan.pos);
          st.cell.setHidden(false);
        },
        pose: [
          { who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 2 },
          { who: 'cell', pose: 'cl_punchW', face: 'shout', speed: 6, aura: 0.8 },
        ],
        cam: { from: { at: 'cell', local: [1.2, 0.3, -2.4] }, look: { at: 'gohan', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'cell', line: 'ENOUGH! You think you can make a fool of ME?!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
      // everything he has, in one right straight
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.c0 = st.cell.pos.clone();
          ctx.c1 = st.gohan.pos.clone().addScaledVector(st.gohan.forward.clone().setY(0).normalize(), 1.15);
          ctx.c1.y = st.cell.pos.y;
          ctx.b.sfx('dash', st.cell, { pitch: 0.7, vol: 1.2 });
        },
        cam: { from: { at: 'gohan', local: [1.8, 0.2, 0.6] }, look: { at: 'gohan', local: [0, 0.4, 1] }, fov: 42 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, k = Math.min(1, t / 0.3);
          c.setPosition(ctx.c0.clone().lerp(ctx.c1, k));
          c.prevPos.copy(c.pos);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(c.chest(), 0xbaff9a, 0.4, 0.2);
        },
        hold: 0.32,
      },
      // caught: an open hand, an inch from his nose. Nothing else on him moves.
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const hand = SL.Cinema.actorPoint(ctx, 'gohan:head').addScaledVector(st.gohan.forward.clone().setY(0).normalize(), 0.45);
          b.vfx.ring(hand, 3, 0xfff3c0, 0.4, st.gohan.forward.clone().setY(0).normalize());
          b.vfx.sparks(hand, 0xfff3c0, 18, 8, 0.08);
          b.sfx('punchHeavy', st.gohan, { pitch: 0.45, vol: 1.5 });
          b.stage.crater(st.gohan.pos, 2.4, 0.25, null);
          b.cameraTraumaAt(hand, 0.7);
          pt(ctx, 'hand', hand);
        },
        pose: [
          { who: 'cell', pose: 'cl_punch', face: 'shout', speed: 40 },
          { who: 'gohan', pose: 'tg2_catch', face: 'angry', speed: 40 },
        ],
        slow: { scale: 0.2, seconds: 1.4 },
        cam: { from: { at: 'hand', off: [1.1, 0.15, 0.7] }, look: { at: 'hand', off: [0, -0.05, 0] }, fov: 40 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_punch', face: 'shock', speed: 4 }],
        cam: { from: { at: 'cell:face', local: [0.2, 0.14, 0.9] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 34 },
        say: { who: 'cell', line: 'Wh—', duration: 0.8, style: 'quiet' },
        hold: 1,
      },
      // the gut punch: his back bulges outward and his eyes go white
      {
        pose: [{ who: 'gohan', pose: 'tg2_gutW', face: 'angry', speed: 20 }],
        cam: { from: { at: 'gohan', local: [2.2, 0.1, 1.2] }, look: { at: 'cell', off: [0, 0, 0] }, fov: 40 },
        hold: 0.25,
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.cell;
          const back = c.chest().addScaledVector(c.forward.clone().setY(0).normalize(), -0.55);
          b.vfx.ring(back, 2.4, 0xbaff9a, 0.35, c.forward.clone().setY(0).normalize());
          b.vfx.sparks(back, 0xbaff9a, 24, 10, 0.1);
          b.sfx('punchHeavy', c, { pitch: 0.35, vol: 1.6 });
          b.cameraTraumaAt(c.chest(), 1);
          if (c.model.setPupilScale) c.model.setPupilScale(0);
          // the bulge: a moment where the back of him pushes out
          ctx.base = c.model.root.scale.x;
        },
        pose: [
          { who: 'gohan', pose: 'tg2_gut', face: 'shout', speed: 40 },
          { who: 'cell', pose: 'cl_gutted', face: 'shock', speed: 20 },
        ],
        screen: { flash: 0.35, color: '#ffffff' },
        slow: { scale: 0.2, seconds: 1.2 },
        cam: { from: { at: 'cell', local: [-2.4, 0.3, -1.4] }, look: { at: 'cell', off: [0, 0.1, 0] }, fov: 40 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, s = ctx.base, k = Math.sin(Math.min(1, t / 0.6) * Math.PI);
          c.model.root.scale.set(s * (1 + k * 0.06), s, s * (1 + k * 0.16));
        },
        hold: 1.6,
      },
      // on his knees, retching
      {
        call: (ctx) => {
          const c = story(ctx).cell;
          c.model.root.scale.setScalar(ctx.base);
        },
        pose: [{ who: 'cell', pose: 'cl_kneelRetch', face: 'shock', speed: 6 }],
        sfx: { name: 'stretch', who: 'cell', pitch: 0.5, vol: 1.2 },
        cam: { from: { at: 'cell', local: [1.4, 0.2, 1.8] }, look: { at: 'cell', off: [0, -0.2, 0] }, fov: 40 },
        hold: 1.8,
      },
      // and Android 18 comes back out of him, onto the stone
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.cell, a = st.a18;
          const mouth = SL.Cinema.actorPoint(ctx, 'cell:head').addScaledVector(c.forward.clone().setY(0).normalize(), 0.3);
          ctx.m0 = mouth.clone();
          ctx.m1 = CK().ground(b, mouth.clone().addScaledVector(c.forward.clone().setY(0).normalize(), 2.2).add(new V3(1.6, 0, 0)));
          // the boy steps back out of the way
          CK().place(st.gohan, CK().ground(b, st.gohan.pos.clone().addScaledVector(c.forward.clone().setY(0).normalize(), 1.6)));
          a.setHidden(false);
          a.setPosition(mouth);
          a.grounded = false;
          faceTo(a, ctx.m1);
          a.setState('scripted', { pose: 'tumble', expression: 'ko' });
          b.vfx.explosion(mouth, 1.4, 0x8ad87a, { smoke: true });
          b.sfx('stretch', c, { pitch: 0.4, vol: 1.4 });
        },
        cam: { from: { at: 'cell', local: [2.2, -0.2, 2.6] }, look: { at: 'cell', off: [0, -0.3, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const a = story(ctx).a18, k = Math.min(1, t / 0.7);
          const p = ctx.m0.clone().lerp(ctx.m1, k);
          p.y += Math.sin(k * Math.PI) * 0.6;
          a.setPosition(p);
          a.prevPos.copy(p);
        },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          CK().watch(st.a18, ctx.m1, 'knockdown', 'ko', st.cell.pos);
          st.a18._down = true;
          b.vfx.dust(ctx.m1, 1, 6);
        },
        cam: { from: { at: 'a18', off: [1.6, 0.6, 1.6] }, look: { at: 'a18', off: [0, -0.4, 0] }, fov: 42 },
        say: { who: 'krillin', line: 'Eighteen!', duration: 1.6, style: 'shout' },
        hold: 1.8,
      },
      // the perfect form melts back into the one before it
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.cell;
          CK().toForm(c, 'semi_perfect');
          if (c.model.setPupilScale) c.model.setPupilScale(1);
          b.vfx.explosion(c.chest(), 2.4, 0x8ad87a, { smoke: true });
          b.vfx.dust(c.pos, 2, 12, 0x8ad87a);
          b.sfx('regrow', c, { pitch: 0.5, vol: 1.3 });
        },
        pose: [{ who: 'cell', pose: 'cl_kneelRetch', face: 'shock', speed: 3 }],
        screen: { flash: 0.3, color: '#d0ffc0' },
        cam: { from: { at: 'cell', local: [1.6, 0.7, 3.8] }, look: { at: 'cell', off: [0, 0, 0] }, fov: 42 },
        say: { who: 'cell', line: 'No... NO! My perfect body!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 3 }],
        cam: { from: { at: 'gohan:face', local: [0.1, 0.16, 0.7] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        say: { who: 'teen_gohan', line: 'Get up. I\'m not finished with you.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx), c = st.cell;
      CK().toForm(c, 'semi_perfect');
      if (c.model.setPupilScale) c.model.setPupilScale(1);
      CK().swell(ctx.m, c, 1, 0);
      if (!st.a18._down) {
        CK().watch(st.a18, ring(ctx, -2, -1), 'knockdown', 'ko');
        st.a18._down = true;
      }
      ctx.m.flags.spat = true;
    },
  };

  S.rp_swell = {
    id: 'rp_swell',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          K.place(st.cell, ring(ctx, 0, -5), 0);
          K.place(st.gohan, ring(ctx, 0, 4), Math.PI);
          faceTo(st.cell, st.gohan.pos);
          faceTo(st.gohan, st.cell.pos);
        },
        pose: [{ who: 'cell', pose: 'cl_hunch', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.5, 0.2, 2.2] }, look: { at: 'cell:head' }, fov: 36 },
        say: { who: 'cell', line: 'You think you\'ve won? You haven\'t won anything...', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        call: (ctx) => CK().swell(ctx.m, story(ctx).cell, 1.3, 2.6),
        pose: [{ who: 'cell', pose: 'cl_bloat', face: 'wicked', speed: 4 }],
        sfx: { name: 'stretch', who: 'cell', pitch: 0.4, vol: 1.3 },
        shake: { at: 'cell', amount: 0.4 },
        cam: { from: { at: 'cell', local: [1.2, 0.5, 4] }, to: { at: 'cell', local: [1.6, 0.8, 5.4] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 44 },
        say: { who: 'cell', line: 'If I can\'t win... then NOBODY WINS!', duration: 3, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'shock', speed: 2 }],
        cam: { from: { at: 'gohan:face', local: [0.1, 0.16, 0.7] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        hold: 2,
      },
    ],
    end(ctx) {
      CK().swell(ctx.m, story(ctx).cell, 1.3, 0);
      ctx.m.flags.swelling = true;
    },
  };
})();
