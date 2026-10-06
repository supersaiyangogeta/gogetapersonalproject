/*
 * SCENES — Chapter 6: the thing from the laboratory.
 *
 *   cell_sighting   Gingertown: a street of clothes with nobody in them, and the last man in it
 *   cell_names_it   he explains what he is, because he enjoys explaining
 *   cell_escapes    the oldest trick in the book, and he is gone
 *
 * The horror beat of the chapter is deliberately quiet: no roar, no transformation,
 * just a street where everybody was a minute ago.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  const U = SL.util;
  const V3 = THREE.Vector3;
  const C = SL.data.poses;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));
  const ground = (b, v, lift = 0) => v.clone().setY(b.stage.heightAt(v.x, v.z) + lift);

  // Piccolo down on one knee by a pile of clothes, one hand reaching for the shirt
  C.pc_inspect = {
    root: { y: -0.46, rx: 16 },
    spine: [26, 0, 0], chest: [14, 0, 0], neck: [20, 0, 0], head: [30, 0, 0],
    shoulderL: [-30, 0, 10], elbowL: [-40, 0, 0], shoulderR: [-62, 0, -12], elbowR: [-24, 0, 0],
    thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
    hands: ['open', 'open'],
  };
  // the last man in town, looking back over his shoulder as he runs
  C.cv_flee = (t) => ({
    root: { y: -0.04, rx: 14 }, spine: [10, 0, 0], chest: [6, 34, 0], head: [-10, 50, 0],
    shoulderL: [-50, 0, 30], elbowL: [-70, 0, 0], shoulderR: [30, 0, -30], elbowR: [-60, 0, 0],
    thighL: [-40 + Math.sin(t * 9) * 10, 0, 6], kneeL: [50, 0, 0], thighR: [16, 0, -6], kneeR: [40, 0, 0],
    hands: ['open', 'open'],
  });
  // stung: arched back, arms out, rising onto his toes
  C.cv_stung = (t) => ({
    root: { y: 0.06, rx: -10 }, spine: [-20, 0, 0], chest: [-18, 0, 0], head: [-30 + Math.sin(t * 30) * 3, 0, 0],
    shoulderL: [-20, 0, 70], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -70], elbowR: [-30, 0, 0],
    thighL: [-6, 0, 6], kneeL: [10, 0, 0], footL: [40, 0, 0], thighR: [4, 0, -6], kneeR: [10, 0, 0], footR: [40, 0, 0],
    hands: ['open', 'open'],
  });

  /**
   * Gingertown (2026-10-02, the owner: show, don't tell). No narration: the street, the clothes, the
   * cars, Piccolo on one knee — and then the last man in town, and the tail.
   */
  S.cell_sighting = {
    id: 'cell_sighting',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell, man: s.man };
    },
    music: { song: null, level: 0 },
    events: [
      // the town first: a main street with nobody in it, cars in the road with their doors open, and wind
      {
        call: (ctx) => {
          const st = ctx.b.story;
          pt(ctx, 'street', ground(ctx.b, new V3(0, 0, 2)));
          pt(ctx, 'pile', ground(ctx.b, st.pile));
          st.piccolo.setHidden(true);
          st.cell.setHidden(true);
        },
        mood: { amount: 0.3, color: 0x2a3040, seconds: 1.8 },
        sfx: { name: 'wind', vol: 0.8 },
        cam: { from: { at: 'street', off: [3, 10, 30] }, to: { at: 'street', off: [2, 5, 20] }, look: { at: 'street', off: [0, 0.6, 0] }, fov: 50, ease: 'inOut' },
        hold: 4.2,
      },
      // at the kerb: a shirt, trousers and two shoes, laid out as if somebody had been standing in them
      {
        cam: { from: { at: 'pile', off: [0.9, 0.42, 1.4] }, to: { at: 'pile', off: [0.7, 0.34, 1.05] }, look: { at: 'pile', off: [0, 0.04, -0.1] }, fov: 40 },
        hold: 2.8,
      },
      // and behind it another, and another: the whole street is clothes
      {
        cam: { from: { at: 'street', off: [-2.5, 0.7, 9] }, to: { at: 'street', off: [-1.6, 0.6, 6] }, look: { at: 'street', off: [0, 0.2, -10] }, fov: 46 },
        hold: 3.2,
      },
      // Piccolo comes down into it
      {
        call: (ctx) => {
          const p = ctx.b.story.piccolo, pile = ctx.cast.pile.pos;
          ctx.land = ground(ctx.b, pile.clone().add(new V3(-0.75, 0, 0.45)));
          p.setHidden(false);
          p.setPosition(ctx.land.clone().add(new V3(0, 7, 0)));
          faceTo(p, pile);
          p.grounded = false;
        },
        pose: [{ who: 'piccolo', pose: 'flyIdle', face: 'grit' }],
        cam: { from: { at: 'pile', off: [1.6, 0.35, 2.6] }, look: { at: 'pile', off: [-0.8, 1.6, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const p = ctx.b.story.piccolo, k = U.easeOutCubic(Math.min(1, t / 1.4));
          p.setPosition(ctx.land.clone().add(new V3(0, 7 * (1 - k), 0)));
          p.prevPos.copy(p.pos);
          if (k >= 1 && !ctx.landed) {
            ctx.landed = true;
            p.grounded = true;
            p.setState('scripted', { pose: 'land', expression: 'grit' });
            ctx.b.vfx.dust(p.pos, 1.2, 8);
          }
        },
        sfx: { name: 'dash', who: 'piccolo', vol: 0.6, pitch: 0.8 },
        hold: 2,
      },
      // down on one knee by the shirt
      {
        pose: [{ who: 'piccolo', pose: 'pc_inspect', face: 'grit', speed: 5 }],
        cam: { from: { at: 'piccolo', local: [1.5, 0.7, 1.3] }, to: { at: 'piccolo', local: [1.25, 0.62, 1.1] }, look: { at: 'piccolo:head', off: [0, -0.25, 0.2] }, fov: 40 },
        say: { who: 'piccolo', line: '...Still warm.', duration: 2.4, style: 'quiet' },
        hold: 3,
      },
      // a voice down the street: the last man in Gingertown, running, looking back over his shoulder
      {
        call: (ctx) => {
          const st = ctx.b.story, at = ctx.opts.manAt;
          st.man.setHidden(false);
          st.man.setPosition(at);
          faceTo(st.man, at.clone().add(new V3(0, 0, 10)));
          pt(ctx, 'manAt', at);
          // he is between the camera and what is behind him
          st.cell.setHidden(false);
          st.cell.applyForm(0);
          st.cell.setPosition(ground(ctx.b, at.clone().add(new V3(0, 0, -1.4))));
          faceTo(st.cell, at.clone().add(new V3(0, 0, 10)));
          st.cell.setState('scripted', { pose: 'cl_hunch', expression: 'smirk' });
          ctx.tail = st.cell.model.longTailBase;
          ctx.tailLift = ctx.tail ? ctx.tail.rotation.x : 0;
        },
        pose: [
          { who: 'man', pose: 'cv_flee', face: 'shock', speed: 6 },
          { who: 'piccolo', pose: 'idle', face: 'angry', speed: 8 },
        ],
        sfx: { name: 'crowdGasp', vol: 0.9, pitch: 1.5 },
        cam: { from: { at: 'manAt', off: [2.6, 1.1, 5.4] }, to: { at: 'manAt', off: [2.2, 1, 4.6] }, look: { at: 'manAt', off: [0, 1, -0.8] }, fov: 44 },
        hold: 1.8,
      },
      // the tail comes up over its shoulder like a scorpion's, and goes into his back
      {
        cam: { from: { at: 'manAt', off: [4.2, 1.5, 0.4] }, look: { at: 'manAt', off: [0, 1.3, -0.8] }, fov: 48 },
        tick: (ctx, t) => {
          if (!ctx.tail) return;
          const k = U.easeInOutCubic(Math.min(1, t / 0.9));
          ctx.tail.rotation.x = U.lerp(ctx.tailLift, 3.45, k);
        },
        pose: [{ who: 'cell', pose: 'cl_tailW', face: 'smirk', speed: 6 }],
        sfx: { name: 'stretch', who: 'cell', pitch: 0.7 },
        hold: 1.1,
      },
      {
        call: (ctx) => {
          const st = ctx.b.story;
          st.man.setState('scripted', { pose: 'cv_stung', expression: 'shock' });
          ctx.b.sfx('drain', st.man, { vol: 1.1, pitch: 0.7 });
          ctx.manScale = st.man.model.root.scale.x;
        },
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'wicked', speed: 10 }],
        slow: { scale: 0.5, seconds: 0.6 },
        cam: { from: { at: 'manAt', off: [3.2, 1.2, 1.6] }, to: { at: 'manAt', off: [2.6, 1.1, 1.3] }, look: { at: 'manAt', off: [0, 1.1, -0.4] }, fov: 42 },
        // he drains into it: smaller and smaller inside his own clothes, the tail pulsing as it drinks
        tick: (ctx, t) => {
          const st = ctx.b.story, k = U.clamp01((t - 0.35) / 1.5);
          st.man.model.root.scale.setScalar(ctx.manScale * (1 - k * 0.94));
          if (ctx.b.frame % 6 === 0 && st.cell.model.tailSegs) {
            const segs = st.cell.model.tailSegs, i = segs.length - 1 - (Math.floor(t * 12) % segs.length);
            ctx.b.vfx.flash(segs[i].node.getWorldPosition(new V3()), 0.35, 0x9ae07a, 0.15, SL.Toon.tex.glow);
          }
        },
        hold: 2.2,
      },
      // and what falls is his clothes
      {
        call: (ctx) => {
          const st = ctx.b.story, b = ctx.b, at = ground(b, st.man.pos);
          st.man.setHidden(true);
          st.man.model.root.scale.setScalar(ctx.manScale);
          const pile = SL.data.cellKit.prop(b, 'clothes', at, { shirt: 0xc4d2dc, pants: 0x7a6a58 });
          pile.group.rotation.y = st.man.yaw;
          st.props.push(pile);
          b.vfx.dust(at, 0.6, 5);
          if (ctx.tail) ctx.tail.rotation.x = ctx.tailLift;
          pt(ctx, 'last', at);
        },
        pose: [{ who: 'cell', pose: 'cl_hunch', face: 'smirk', speed: 4 }],
        sfx: { name: 'clothTear', vol: 0.4, pitch: 0.6 },
        cam: { from: { at: 'last', off: [0.8, 0.45, 1.4] }, look: { at: 'last', off: [0, 0.05, 0] }, fov: 40 },
        hold: 2.2,
      },
      // it turns: across the street, the Namekian is already standing
      {
        call: (ctx) => {
          const st = ctx.b.story;
          faceTo(st.cell, st.piccolo.pos);
          faceTo(st.piccolo, st.cell.pos);
        },
        pose: [{ who: 'piccolo', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'piccolo', local: [-0.7, 0.45, -2.4] }, look: { at: 'cell', off: [0, 1.2, 0] }, fov: 34 },
        sfx: { name: 'heartbeat', vol: 0.6 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'cell:face', local: [0.2, 0.18, 1.1] }, to: { at: 'cell:face', local: [0.16, 0.16, 0.9] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 38 },
        say: { who: 'cell', line: 'Piccolo. You came all this way, and I am still hungry.', duration: 3.4 },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const st = ctx.b.story;
      if (st.man) st.man.setHidden(true);
      if (ctx.tail) ctx.tail.rotation.x = ctx.tailLift;
      const c = cast.cell;
      if (c) {
        c.setHidden(false);
        c.untargetable = false;
        c.setState('free');
      }
      if (cast.piccolo) {
        cast.piccolo.setHidden(false);
        cast.piccolo.setState('free');
      }
      m.flags.sighted = true;
    },
    clearMood: false,
  };

  S.cell_names_it = {
    id: 'cell_names_it',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell };
    },
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
          { who: 'piccolo', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'cell', line: 'Gero recorded all of you. Goku, Vegeta, Piccolo — you are all in this body somewhere.', duration: 5 },
        hold: 5.2,
      },
      {
        cam: { from: { at: 'piccolo', local: [0.9, 0.55, 2.6] }, look: { at: 'piccolo', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'piccolo', line: 'And you are eating people to finish yourself. Charming.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_hunch', face: 'angry' }],
        cam: { from: { at: 'cell', local: [0.8, 0.5, 2.4] }, to: { at: 'cell', local: [0.7, 0.48, 2 ] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 34 },
        say: { who: 'cell', line: 'I need two of them. Seventeen and eighteen. Everything else is an appetiser.', duration: 4.6 },
        hold: 4.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['piccolo', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.named = true;
    },
    clearMood: false,
  };

  S.cell_escapes = {
    id: 'cell_escapes',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell };
    },
    events: [
      {
        pose: [
          { who: 'cell', pose: 'cl_kameW', face: 'smirk', speed: 8 },
          { who: 'piccolo', pose: 'guard', face: 'grit' },
        ],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.6] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'cell', line: 'You are stronger than the recording said. I will come back for you last.', duration: 4 },
        hold: 4.2,
      },
      // solar flare: the whole screen goes, and so does he
      {
        screen: { flash: 1, color: '#ffffff' },
        sfx: { name: 'kiBlastBig', who: 'cell', vol: 1.2, pitch: 1.3 },
        slow: { scale: 0.4, seconds: 0.8 },
        hide: 'cell',
        cam: { from: { at: 'piccolo', local: [0.8, 0.5, 2.4] }, look: { at: 'piccolo', off: [0, 0.6, 0] }, fov: 38 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'piccolo', pose: 'idle', face: 'angry' }],
        mood: { amount: 0.36, color: 0x2a3040, seconds: 1.4 },
        cam: { from: { at: 'piccolo', off: [3.4, 2, 4.4] }, to: { at: 'piccolo', off: [6, 3.4, 8] }, look: { at: 'piccolo', off: [0, 0.9, 0] }, fov: 44, fov2: 52 },
        say: { who: 'piccolo', line: 'He is going after the androids. Which means he is going to be worse than this.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const c = cast.cell;
      if (c) {
        c.setHidden(true);
        c.untargetable = true;
      }
      if (cast.piccolo) cast.piccolo.setState('free');
      m.flags.cellEscaped = true;
    },
  };
})();
