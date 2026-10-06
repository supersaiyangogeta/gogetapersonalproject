/*
 * SCENES — the Cell Games, part one (mission cell_games, rebuilt 2026-10-01).
 *
 *   cg_open       the valley from the air; the ring and its four needles; Cell alone in the middle with
 *                 his eyes shut; the van, the reporter and the World Champion; the Z Fighters landing
 *                 on the ridge; "Goku. You came."
 *   cg_satan      the champion first: the Dynamite Kick lands and does nothing; one finger, and he is a
 *                 dot heading for a mesa — then a puff of dust on its face
 *   cg_rise       the fight leaves the ground: dead stops in mid-air, a blow, gone, somewhere else
 *   cg_kame_a     the climb, "KA... ME...", Cell daring him from the ring, Piccolo on the ridge
 *   cg_kame_b     "HA!" — two fingers — the sky is empty — in front of Cell's jaw — point-blank
 *   cg_regrow     the legs standing on their own; the rest grows back
 *   cg_forfeit    "I give up"; the Senzu Bean; the ridge, the rock, the hands behind the head
 *
 * Every death and wound here is on camera (owner: nothing cut away to a face and an offscreen bang).
 * Dialogue is paraphrased English written for this project, following the owner's frame-by-frame brief.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const CK = () => SL.data.cellKit;
  const VK = () => SL.data.vegitoKit;

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
  const ground = (ctx, v, lift = 0) => CK().ground(ctx.b, v, lift);
  const faceTo = (f, p) => CK().faceTo(f, p);
  /** Eases several actors from where they are to points over `seconds` (a tick body). */
  function glide(ctx, key, moves, seconds, t) {
    if (!ctx[key]) ctx[key] = moves.map(([f, to, pose]) => ({ f, from: f.pos.clone(), to: to.clone(), pose }));
    const k = U.easeInOutCubic(Math.min(1, t / seconds));
    for (const it of ctx[key]) {
      it.f.setPosition(it.from.clone().lerp(it.to, k));
      it.f.prevPos.copy(it.f.pos);
      if (k >= 1 && it.pose && !it.done) {
        it.done = true;
        it.f.grounded = true;
        it.f.setState('scripted', { pose: it.pose, expression: 'calm' });
        ctx.b.vfx.dust(it.f.pos, 1, 6, ctx.b.stage.dustColor);
      }
    }
  }

  /* ============================================================================ THE OPENING */
  S.cg_open = {
    id: 'cg_open',
    cast,
    auraCap: 0.15,
    music: { song: 'vision', level: 1 },
    events: [
      // the valley from the air: grass, mesas, a road, and in the middle of it all a square of stone
      {
        call: (ctx) => {
          const st = story(ctx);
          // the Z Fighters are still on their way
          for (const k of ['goku', 'gohan', 'piccolo', 'vegeta', 'trunks', 'krillin', 'tien', 'yamcha', 'a16']) st[k].setHidden(true);
          pt(ctx, 'mid', ring(ctx, 0, 0));
        },
        cam: { from: { at: 'mid', off: [70, 46, 120] }, to: { at: 'mid', off: [34, 20, 56] }, look: { at: 'mid', off: [0, 2, 0] }, fov: 50, fov2: 44, ease: 'inOut' },
        hold: 5.2,
      },
      // the ring itself: sixteen by sixteen slabs of a single rock, a needle at each corner, and him
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'calm', speed: 2 }],
        cam: { from: { at: 'mid', off: [-14, 1.0, -15] }, to: { at: 'mid', off: [-9, 1.2, -9] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 46, fov2: 40 },
        hold: 3.4,
      },
      {
        cam: { orbit: { at: { at: 'cell', off: [0, 0.4, 0] }, from: -0.7, to: 0.5, radius: 3.4, radius2: 2.6, y: 0.5, y2: 0.6 }, look: { at: 'cell:head' }, fov: 34 },
        hold: 3.2,
      },
      // the only other people here: a TV van, a camera, a reporter, and the World Champion
      {
        music: { song: 'battle', level: 2 },
        pose: [{ who: 'jimmy', pose: 'jf_report', face: 'grin', speed: 4 }],
        cam: { from: { at: 'jimmy', local: [0.3, 0.35, 2.2] }, look: { at: 'jimmy:head' }, fov: 36 },
        say: { who: 'jimmy', line: 'Ladies and gentlemen, this is it — the Cell Games! Live, from the ring the monster carved himself!', duration: 4.6, style: 'shout' },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'jimmy', local: [-1.6, 0.6, 3.4] }, look: { at: 'satan', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'jimmy', line: 'And standing between that thing and the end of the world... the World Martial Arts Champion himself!', duration: 4.2 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_champ', face: 'grin', speed: 6 }],
        cam: { from: { at: 'satan', local: [0.4, 0.2, 2.2] }, to: { at: 'satan', local: [0.3, 0.1, 1.8] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'mr_satan', line: 'Relax, everybody at home! Mr. Satan is here! That bug won\'t last ten seconds!', duration: 3.8, style: 'shout' },
        hold: 4,
      },
      // Cell opens his eyes and looks at the sky: they are coming
      {
        pose: [{ who: 'cell', pose: 'cl_lookUp', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.4, 0.15, 1.3] }, look: { at: 'cell:head' }, fov: 32 },
        say: { who: 'cell', line: 'At last.', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      // nine streaks of light coming down onto the ridge
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          pt(ctx, 'ridge', ground(ctx, new V3(K.RIDGE.x, 0, K.RIDGE.z - 9)));
          ctx.arrive = [];
          const names = ['piccolo', 'vegeta', 'trunks', 'krillin', 'tien', 'yamcha', 'a16', 'goku', 'gohan'];
          names.forEach((k, i) => {
            const f = st[k];
            const to = ground(ctx, K.SPOTS[k]);
            const from = to.clone().add(new V3(-30 + i * 4, 30 + (i % 3) * 4, 40 + (i % 2) * 6));
            f.setHidden(false);
            f.setPosition(from);
            f.grounded = false;
            faceTo(f, to);
            f.setState('scripted', { pose: 'flyForward', expression: 'calm' });
            ctx.arrive.push([f, to, k === 'vegeta' || k === 'piccolo' || k === 'tien' || k === 'a16' ? 'armsCrossed' : 'idle']);
          });
        },
        music: { song: 'finale', level: 2 },
        cam: { from: { at: 'ridge', off: [24, 4, -16] }, look: { at: 'ridge', off: [-6, 12, 14] }, look2: { at: 'ridge', off: [0, 1, 4] }, fov: 54 },
        tick: (ctx, t) => {
          glide(ctx, '_arr', ctx.arrive, 3.4, t);
          if (ctx.b.frame % 3 === 0) for (const [f] of ctx.arrive) if (!f.grounded) ctx.b.vfx.trail(f.chest(), f.form && f.form.aura ? f.form.aura.color : 0xffffff, 0.3, 0.25);
        },
        hold: 3.8,
      },
      // they face the ring from the high ground
      {
        call: (ctx) => {
          for (const [f] of ctx.arrive) faceTo(f, ring(ctx, 0, 0));
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'grin', speed: 3, aura: 0 },
          { who: 'gohan', pose: 'tg_scared', face: 'hurt', speed: 3 },
        ],
        cam: { from: { at: 'goku', local: [-1.5, 0.6, 3.6] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'goku', line: 'So that\'s the ring. Not bad at all.', duration: 2.6 },
        hold: 2.8,
      },
      // across the valley, Cell to Goku
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.5, 0.2, 2.2] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'Goku. You came. I was beginning to wonder whether you had lost your nerve.', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 3, aura: 0 }],
        cam: { from: { at: 'goku', local: [0.3, 0.3, 1.6] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: 'Not a chance. I\'ve been looking forward to this.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx), K = CK();
      K.spectate(ctx.b, st, []);
      K.crew(ctx.b);
      K.watch(st.gohan, ground(ctx, K.SPOTS.gohan), 'tg_scared', 'hurt');
      K.place(st.cell, ring(ctx, 0, 0), 0);
      st.cell.setHidden(false);
      st.cell.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
      ctx.m.flags.arrived = true;
    },
  };

  /* ============================================================================ MR. SATAN */
  S.cg_satan = {
    id: 'cg_satan',
    cast,
    auraCap: 0.15,
    music: { song: 'battle', level: 3 },
    events: [
      {
        call: (ctx) => faceTo(story(ctx).satan, ring(ctx, 0, 0)),
        pose: [{ who: 'satan', pose: 'ms_point', face: 'grin', speed: 6 }],
        cam: { from: { at: 'satan', local: [0.6, 0.3, 2.4] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'mr_satan', line: 'Hold it! The champ goes first! Watch closely, kid — this is how a professional does it!', duration: 3.8, style: 'shout' },
        hold: 3.8,
      },
      // he runs at the ring, up onto the stone, and leaps
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.run0 = st.satan.pos.clone();
          ctx.run1 = ring(ctx, 3.2, 0.6);
          st.satan.setState('scripted', { pose: 'run', expression: 'shout' });
          faceTo(st.satan, ctx.run1);
          pt(ctx, 'mid', ring(ctx, 3, 0));
        },
        cam: { from: { at: 'mid', off: [4, 1.4, 8] }, look: { at: 'satan', off: [0, 0.3, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), k = Math.min(1, t / 2.4);
          const p = ctx.run0.clone().lerp(ctx.run1, k);
          p.y = ctx.b.stage.heightAt(p.x, p.z);
          st.satan.setPosition(p);
          st.satan.prevPos.copy(p);
          faceTo(st.satan, ctx.run1);
        },
        say: { who: 'mr_satan', line: 'DYNAMITE...', duration: 1.6, style: 'shout' },
        hold: 2.5,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.kick0 = st.satan.pos.clone();
          ctx.kick1 = st.cell.chest().addScaledVector(st.cell.forward, 0.55).add(new V3(0, -0.85, 0));
          st.satan.grounded = false;
          faceTo(st.satan, st.cell.pos);
        },
        pose: [{ who: 'satan', pose: 'ms_dynamite', face: 'shout', speed: 18 }],
        cam: { from: { at: 'cell', local: [2.6, 0.2, 2.4] }, look: { at: 'cell', off: [0, 0.2, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const st = story(ctx), k = Math.min(1, t / 0.55);
          const p = ctx.kick0.clone().lerp(ctx.kick1, k);
          p.y += Math.sin(k * Math.PI) * 1.4;
          st.satan.setPosition(p);
          st.satan.prevPos.copy(p);
        },
        say: { who: 'mr_satan', line: '...KICK!!', duration: 1, style: 'shout' },
        hold: 0.6,
      },
      // it lands — and nothing. Cell does not move. Not a hair.
      {
        call: (ctx) => {
          const st = story(ctx);
          const c = st.cell.chest();
          ctx.b.vfx.dust(c, 0.4, 3);
          ctx.b.sfx('block', st.cell, { pitch: 0.5, vol: 0.8 });
        },
        slow: { scale: 0.2, seconds: 1.2 },
        cam: { from: { at: 'cell', local: [1.9, 0.35, 1.1] }, look: { at: 'cell', off: [0, 0.5, 0] }, fov: 34 },
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'calm', speed: 2 }],
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.satan.setPosition(ground(ctx, st.cell.pos.clone().addScaledVector(st.cell.forward, 0.9)));
          st.satan.grounded = true;
          faceTo(st.satan, st.cell.pos);
        },
        pose: [{ who: 'satan', pose: 'ms_nervous', face: 'shock', speed: 6 }],
        cam: { from: { at: 'satan', local: [1.5, 0.35, 0.7] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'mr_satan', line: '...Huh?', duration: 1.4, style: 'quiet' },
        hold: 1.6,
      },
      // one finger
      {
        pose: [{ who: 'cell', pose: 'cl_flick', face: 'smirk', speed: 12 }],
        cam: { from: { at: 'cell', local: [-1.2, 0.3, 1.4] }, look: { at: 'satan', off: [0, 0.3, 0] }, fov: 38 },
        say: { who: 'cell', line: 'Out of the way.', duration: 1.4, style: 'quiet' },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          // out over the valley toward the nearest mesa in that direction
          const dir = st.cell.forward.clone().setY(0).normalize();
          const ms = (b.stage.mesas || []).slice().sort((a, c) => {
            const da = new V3(a.x, 0, a.z).normalize().dot(dir), dc = new V3(c.x, 0, c.z).normalize().dot(dir);
            return dc - da;
          })[0];
          const target = ms ? new V3(ms.x, 0, ms.z).multiplyScalar(1 - (ms.r * 0.8) / Math.hypot(ms.x, ms.z)) : dir.clone().multiplyScalar(180);
          target.y = (ms ? ms.h : 20) * 0.55;
          ctx.fly0 = st.satan.chest();
          ctx.fly1 = target;
          pt(ctx, 'mesa', target);
          pt(ctx, 'puffFrom', ring(ctx, 0, 0).add(new V3(0, 2.4, 0)).addScaledVector(dir, -4));
          b.sfx('punchLight', st.satan, { pitch: 1.6 });
          b.vfx.sparks(st.satan.chest(), 0xffffff, 10, 6, 0.08);
          st.satan.setState('scripted', { pose: 'tumble', expression: 'shout' });
        },
        cam: { from: { at: 'cell', local: [-1.6, 1.2, -3.2] }, look: { at: 'satan' }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), k = Math.min(1, t / 1.8);
          const p = ctx.fly0.clone().lerp(ctx.fly1, k);
          p.y += Math.sin(k * Math.PI) * 18;
          // only as far as the arena lets a fighter go: past that he is a speck and the dust says the rest
          if (k < 0.75) {
            st.satan.setPosition(p);
            st.satan.prevPos.copy(p);
          } else if (!ctx.gone) {
            ctx.gone = true;
            st.satan.setHidden(true);
          }
        },
        say: { who: 'mr_satan', line: 'WAAAAAHHHH—!', duration: 1.8, style: 'shout' },
        hold: 1.9,
      },
      // a long way off: a small puff of dust on the face of a mesa
      {
        call: (ctx) => {
          ctx.b.vfx.explosion(ctx.cast.mesa.pos, 4, 0xe8d0a0, { smoke: true });
          ctx.b.vfx.dust(ctx.cast.mesa.pos, 6, 16, 0xc8a070);
          ctx.b.sfx('groundImpact', null, { at: ctx.cast.mesa.pos, vol: 0.5, pitch: 0.7 });
        },
        // a long lens from the ring, aimed at the puff
        cam: { from: { at: 'puffFrom' }, look: { at: 'mesa' }, fov: 12 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'jimmy', pose: 'jf_report', face: 'shock', speed: 6 }],
        cam: { from: { at: 'jimmy', local: [0.3, 0.35, 2] }, look: { at: 'jimmy:head' }, fov: 36 },
        say: { who: 'jimmy', line: 'M-Mr. Satan has been... he\'s gone! Folks, he must be... luring it into a trap!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      // Goku drops off the ridge into the ring
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.setState('scripted', { pose: 'flyForward', expression: 'calm' });
          ctx.g0 = st.goku.pos.clone();
          ctx.g1 = ring(ctx, 0, 7);
          st.goku.grounded = false;
          faceTo(st.goku, ctx.g1);
        },
        cam: { from: { at: 'cell', local: [1.4, 0.6, -2.6] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx), k = U.easeInOutCubic(Math.min(1, t / 1.4));
          const p = ctx.g0.clone().lerp(ctx.g1, k);
          p.y += Math.sin(k * Math.PI) * 3;
          st.goku.setPosition(p);
          st.goku.prevPos.copy(p);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(st.goku.chest(), 0xffe25a, 0.35, 0.25);
        },
        hold: 1.5,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().place(st.goku, ring(ctx, 0, 7), Math.PI);
          faceTo(st.goku, st.cell.pos);
          faceTo(st.cell, st.goku.pos);
          ctx.b.vfx.dust(st.goku.pos, 1.4, 8, 0xd8d4e2);
        },
        pose: [
          { who: 'goku', pose: 'g_introPalm', face: 'calm', speed: 5, aura: 0.15 },
          { who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 3 },
        ],
        cam: { from: { at: 'goku', local: [-0.9, 0.5, -2.4] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'goku', line: 'My turn. Let\'s see what you\'ve got, Cell.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx), K = CK();
      st.satan.setHidden(true);
      K.place(st.goku, ring(ctx, 0, 7), Math.PI);
      st.goku.setHidden(false);
      ctx.m.flags.satanFlicked = true;
    },
  };

  /* ============================================================================ INTO THE AIR */
  // a blow, a dead stop, gone, somewhere else: Goku and Cell trading in the sky
  const AIR = [
    { g: [2.4, 9, 2], c: [-2.4, 9.4, -1], pose: ['g_jab', 'cl_claw'], cam: [6, 1.4, 6] },
    { g: [-6, 13, -4], c: [-3.6, 12, -2.6], pose: ['g_kick', 'guard'], cam: [-4, 1.2, 7] },
    { g: [5, 16, -8], c: [6.6, 16.6, -6], pose: ['g_elbow', 'cl_tail'], cam: [7, 2, -2] },
    { g: [0, 12, 5], c: [0, 13.2, 2.8], pose: ['g_axeKick', 'cl_brace'], cam: [5, -1, 4] },
  ];
  S.cg_rise = {
    id: 'cg_rise',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 5 },
    events: [
      // both of them leave the ring at once: one step, and they are hanging in the air, perfectly still
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.r0 = [st.goku.pos.clone(), st.cell.pos.clone()];
          ctx.r1 = [ring(ctx, 0, 5).add(new V3(0, 9, 0)), ring(ctx, 0, -5).add(new V3(0, 9, 0))];
          for (const f of [st.goku, st.cell]) {
            f.grounded = false;
            ctx.b.vfx.ring(ground(ctx, f.pos, 0.2), 3, 0xffffff, 0.4, new V3(0, 1, 0));
            ctx.b.vfx.dust(f.pos, 2, 10, 0xd8d4e2);
          }
          ctx.b.sfx('dash', st.goku, { pitch: 0.8 });
          pt(ctx, 'mid', ring(ctx, 0, 0).add(new V3(0, 9, 0)));
        },
        pose: [
          { who: 'goku', pose: 'flyIdle', face: 'angry', speed: 4 },
          { who: 'cell', pose: 'flyIdle', face: 'smirk', speed: 4 },
        ],
        cam: { from: { at: 'mid', off: [0, -7, 16] }, to: { at: 'mid', off: [0, -2, 13] }, look: { at: 'mid' }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), k = U.easeOutCubic(Math.min(1, t / 0.5));
          [st.goku, st.cell].forEach((f, i) => {
            f.setPosition(ctx.r0[i].clone().lerp(ctx.r1[i], k));
            f.prevPos.copy(f.pos);
          });
          faceTo(st.goku, st.cell.pos);
          faceTo(st.cell, st.goku.pos);
          // gravitational stillness: the dust under them flattens in rings even though nothing touches it
          if (t > 0.5 && ctx.b.frame % 24 === 0) for (const f of [st.goku, st.cell]) ctx.b.vfx.ring(ground(ctx, f.pos, 0.15), 2.6, 0xeef4ff, 0.5, new V3(0, 1, 0));
        },
        hold: 2.4,
      },
      ...AIR.map((a, i) => ({
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const gp = ring(ctx, a.g[0], a.g[2]).add(new V3(0, a.g[1], 0)), cp = ring(ctx, a.c[0], a.c[2]).add(new V3(0, a.c[1], 0));
          // instant direction changes: they are simply somewhere else, leaving afterimages behind
          VK().vanishTo(b, st.goku, gp, { face: cp });
          VK().vanishTo(b, st.cell, cp, { face: gp });
          const hit = gp.clone().lerp(cp, 0.5);
          pt(ctx, 'hit', hit);
          b.vfx.ring(hit, 3.4, 0xffffff, 0.35, st.goku.pos.clone().sub(st.cell.pos).normalize());
          b.vfx.flash(hit, 1.2, 0xffffff, 0.12, SL.Toon.tex.glow);
          b.sfx('punchHeavy', st.goku, { pitch: 0.7 + i * 0.08, vol: 1.2 });
          b.cameraTraumaAt(hit, 0.45);
          b.slowmo(0.35, 0.25);
          // the shockwave flattens the grass beneath them
          b.vfx.ring(ground(ctx, hit, 0.2), 6, 0xf4f8ff, 0.6, new V3(0, 1, 0));
        },
        pose: [
          { who: 'goku', pose: a.pose[0], face: 'shout', speed: 16 },
          { who: 'cell', pose: a.pose[1], face: 'angry', speed: 16 },
        ],
        cam: { from: { at: 'hit', off: a.cam }, look: { at: 'hit' }, fov: 46 },
        hold: 0.85,
      })),
      // both of them stop dead, a long way apart, staring
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const gp = ring(ctx, 0, 9).add(new V3(0, 12, 0)), cp = ring(ctx, 0, -9).add(new V3(0, 12, 0));
          VK().vanishTo(b, st.goku, gp, { face: cp });
          VK().vanishTo(b, st.cell, cp, { face: gp });
        },
        pose: [
          { who: 'goku', pose: 'flyIdle', face: 'grin', speed: 3 },
          { who: 'cell', pose: 'flyIdle', face: 'smirk', speed: 3 },
        ],
        cam: { from: { at: 'goku', local: [-1, 0.6, -2.6] }, look: { at: 'cell', off: [0, 0.2, 0] }, fov: 38 },
        say: { who: 'cell', line: 'Ha! Excellent! This is what I came for, Goku!', duration: 2.6 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx), K = CK();
      K.placeAir(st.goku, ring(ctx, 0, 6).add(new V3(0, 11, 0)), Math.PI);
      K.placeAir(st.cell, ring(ctx, 0, -6).add(new V3(0, 11, 0)), 0);
    },
  };

  /* ============================================================================ THE INSTANT TRANSMISSION KAMEHAMEHA */
  S.cg_kame_a = {
    id: 'cg_kame_a',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 5 },
    clearMood: false,
    events: [
      // 00:00 straight up into the sky, a golden line behind him
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.up0 = st.goku.pos.clone();
          ctx.up1 = ring(ctx, 0, 4).add(new V3(0, 46, 0));
          st.goku.grounded = false;
          st.goku.setState('scripted', { pose: 'flyUp', expression: 'angry' });
          ctx.b.vfx.ring(ground(ctx, st.goku.pos, 0.2), 3.4, 0xffe25a, 0.5, new V3(0, 1, 0));
          ctx.b.sfx('dash', st.goku, { pitch: 0.7, vol: 1.2 });
        },
        cam: { from: { at: 'goku', off: [2.4, 0.4, 4] }, look: { at: 'goku', off: [0, 2, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const st = story(ctx), k = U.easeInOutCubic(Math.min(1, t / 1.5));
          st.goku.setPosition(ctx.up0.clone().lerp(ctx.up1, k));
          st.goku.prevPos.copy(st.goku.pos);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(st.goku.chest(), 0xffe25a, 0.45, 0.9);
        },
        hold: 1.7,
      },
      // 00:03 he stops dead, facing straight down at Cell, and cups his hands at his hip
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.cell.pos);
          pt(ctx, 'sky', st.goku.chest());
        },
        pose: [{ who: 'goku', pose: 'kameDown', face: 'angry', speed: 6, aura: 0.12 }],
        cam: { from: { at: 'goku', local: [1.6, -1.4, 2.8] }, look: { at: 'goku', off: [0, -0.2, 0] }, fov: 40 },
        say: { who: 'goku', line: 'KA... ME...', duration: 2.4, style: 'shout' },
        sfx: { name: 'kiCharge', who: 'goku', vol: 0.9 },
        hold: 2.6,
      },
      // 00:06 on the stone below, Cell braces and smirks up at the sky
      {
        pose: [{ who: 'cell', pose: 'cl_lookUp', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.9, 0.1, 2.8] }, look: { at: 'cell:head', off: [0, -0.2, 0] }, fov: 40 },
        say: { who: 'cell', line: 'Foolish Goku! From up there, if you miss, your energy will shatter the Earth to dust!', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      // 00:09 the ridge panics
      {
        pose: [
          { who: 'piccolo', pose: 'p_reach', face: 'shout', speed: 6 },
          { who: 'krillin', pose: 'idle', face: 'shock', speed: 4 },
          { who: 'gohan', pose: 'tg_scared', face: 'shock', speed: 4 },
        ],
        cam: { from: { at: 'piccolo', local: [0.8, 0.4, 2.6] }, look: { at: 'piccolo:head' }, fov: 38 },
        say: { who: 'piccolo', line: 'Stop it, Goku! You\'re going to destroy the entire planet!', duration: 3.2, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.goku.setState('scripted', { pose: 'kameDown', expression: 'angry' });
      st.cell.setState('scripted', { pose: 'cl_lookUp', expression: 'smirk' });
    },
  };

  S.cg_kame_b = {
    id: 'cg_kame_b',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 7 },
    clearMood: false,
    events: [
      // 00:17 his eyes narrow — "HA!"
      {
        call: (ctx) => pt(ctx, 'sky', story(ctx).goku.chest()),
        pose: [{ who: 'goku', pose: 'kameDown', face: 'shout', speed: 8, aura: 0.1 }],
        cam: { from: { at: 'goku:face', local: [0, 0.14, 0.8] }, look: { at: 'goku:head', off: [0, 0.15, 0] }, fov: 30 },
        cue: { key: 'ult', label: 'HA!', auto: 6, slow: 0.25 },
      },
      // 00:18 FRAME FLASH: the beam starts — and two fingers are already at his forehead
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.vfx.flash(st.goku.chest().add(new V3(0, -0.6, 0)), 1.4, 0x8ad4ff, 0.15, SL.Toon.tex.glow);
          b.sfx('beamFire', st.goku, { pitch: 0.9, vol: 1.2 });
        },
        say: { who: 'goku', line: 'HAAA!', duration: 1, style: 'shout' },
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'shout', speed: 30, aura: 0 }],
        screen: { flash: 0.2, color: '#dff2ff' },
        cam: { from: { at: 'goku', local: [0.6, 0.15, 1.6] }, look: { at: 'goku:head' }, fov: 34 },
        slow: { scale: 0.25, seconds: 0.5 },
        hold: 0.55,
      },
      // 00:19 SHUN: the sky is empty
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.15, SL.Toon.tex.glow);
          b.sfx('teleport', st.goku, { pitch: 1.2 });
          st.goku.setHidden(true);
          if (st.kameOrb) {
            st.kameOrb.dispose();
            st.kameOrb = null;
          }
        },
        cam: { from: { at: 'sky', off: [4, -3, 7] }, look: { at: 'sky' }, fov: 46 },
        hold: 0.7,
      },
      // 00:20 in front of Cell at ground level, crouched low, hands an inch from his jaw
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.cell;
          const at = ground(ctx, c.pos.clone().addScaledVector(c.forward.clone().setY(0).normalize(), 1.05));
          st.goku.setHidden(false);
          CK().place(st.goku, at);
          faceTo(st.goku, c.pos);
          b.vfx.flash(st.goku.chest(), 1.6, 0xffffff, 0.15, SL.Toon.tex.glow);
          b.sfx('teleport', st.goku, { pitch: 1.4 });
        },
        pose: [
          { who: 'goku', pose: 'kameCrouch', face: 'shout', speed: 30, aura: 0 },
          { who: 'cell', pose: 'cl_lookUp', face: 'shock', speed: 20 },
        ],
        cam: { from: { at: 'cell', local: [2.6, 0.1, 0.55] }, look: { at: 'cell', local: [0, 0.1, 0.5] }, fov: 40 },
        slow: { scale: 0.2, seconds: 0.8 },
        say: { who: 'cell', line: 'WHAT—?!', duration: 1.2, style: 'shout' },
        hold: 1.1,
      },
      // 00:21 point-blank: it goes off into his chest
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.cell;
          const from = st.goku.chest().addScaledVector(st.goku.forward, 0.4);
          const dir = c.chest().sub(from).normalize();
          dir.y = Math.max(dir.y, 0.25);
          dir.normalize();
          const to = from.clone().addScaledVector(dir, 70);
          for (let i = 0; i <= 26; i++) b.vfx.trail(from.clone().lerp(to, i / 26), 0x4a94ff, 0.6 - i * 0.01, 0.8);
          b.vfx.explosion(c.chest(), 1.6, 0x4a94ff, { smoke: false });
          b.vfx.ring(c.chest(), 5, 0xbfe4ff, 0.5);
          b.sfx('explosionHuge', c, { vol: 1.3, pitch: 0.9 });
          b.cameraTraumaAt(c.chest(), 1);
          // the top half of him is simply gone: cut at the waist, the upper piece turned to green vapour
          const hips = c.pos.clone().add(new V3(0, c.height * 0.5, 0));
          const cut = CK().split(b, c, { at: hips, normal: new V3(0, 1, 0), centerA: hips.clone().add(new V3(0, 0.6, 0)), centerB: c.pos.clone().add(new V3(0, 0.45, 0)) });
          st.cellCut = cut;
          cut.hide(cut.a);
          for (let i = 0; i < 3; i++) CK().burst(b, hips.clone().add(new V3(0, 0.4 + i * 0.45, 0)), 'cell', 0.55);
          ctx.b.stage.crater(c.pos, 3.6, 0.5, null);
        },
        pose: [{ who: 'goku', pose: 'kameCrouchFire', face: 'shout', speed: 24, aura: 0.1 }],
        screen: { flash: 0.15, color: '#dff2ff' },
        cam: { from: { at: 'goku', local: [6.5, 1.4, 1.2] }, look: { at: 'goku', local: [0, 0.9, 1.4] }, fov: 42 },
        slow: { scale: 0.3, seconds: 1.2 },
        hold: 2.2,
      },
      // 00:28 the smoke clears: a pair of legs and a waist, standing upright on the broken stone
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'legs', st.cell.pos);
          ctx.b.vfx.dust(st.cell.pos, 1.6, 6, 0xd8d4e2);
        },
        pose: [{ who: 'goku', pose: 'exhausted', face: 'hurt', speed: 4, aura: 0 }],
        music: { song: null, level: 0 },
        cam: { from: { at: 'legs', off: [3.2, 0.6, 3] }, to: { at: 'legs', off: [2.4, 0.5, 2.2] }, look: { at: 'legs', off: [0, 0.5, 0] }, fov: 40 },
        tick: (ctx) => {
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.dust(story(ctx).cell.pos.clone().add(new V3(0, 0.9, 0)), 0.6, 2, 0x8ad87a);
        },
        hold: 3.2,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'grin', speed: 4 }],
        cam: { from: { at: 'krillin', local: [0.4, 0.3, 1.7] }, look: { at: 'krillin:head' }, fov: 34 },
        say: { who: 'krillin', line: 'He did it... Goku did it! There\'s nothing left of him!', duration: 3, style: 'shout' },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (st.kameOrb) {
        st.kameOrb.dispose();
        st.kameOrb = null;
      }
      st.goku.setHidden(false);
      CK().place(st.goku, ground(ctx, st.cell.pos.clone().addScaledVector(st.cell.forward.clone().setY(0).normalize(), 2.2)));
      faceTo(st.goku, st.cell.pos);
      // the legs stay standing: the regrowth scene owns them (a skip lands with them still there)
      if (!st.cellCut) {
        const c = st.cell, hips = c.pos.clone().add(new V3(0, c.height * 0.5, 0));
        st.cellCut = CK().split(b, c, { at: hips, normal: new V3(0, 1, 0), centerA: hips.clone().add(new V3(0, 0.6, 0)), centerB: c.pos.clone().add(new V3(0, 0.45, 0)) });
        st.cellCut.hide(st.cellCut.a);
      }
      ctx.m.flags.pointBlank = true;
    },
  };

  /* ============================================================================ THE REGROWTH */
  S.cg_regrow = {
    id: 'cg_regrow',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    events: [
      // the waist starts to bubble; something green pushes up out of it
      {
        call: (ctx) => pt(ctx, 'legs', story(ctx).cell.pos),
        sfx: { name: 'regrow', at: { at: 'legs' }, vol: 1, pitch: 0.7 },
        cam: { from: { at: 'legs', off: [1.8, 0.8, 1.8] }, look: { at: 'legs', off: [0, 0.9, 0] }, fov: 38 },
        tick: (ctx) => {
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.streamInward(story(ctx).cell.pos.clone().add(new V3(0, 1, 0)), 1.2, 0x8ad87a, 3, 0.12, 0.4);
        },
        hold: 2.2,
      },
      // and the rest of him grows back out of it, from the waist up
      {
        call: (ctx) => {
          const st = story(ctx), c = st.cell;
          if (st.cellCut) {
            st.cellCut.dispose();
            st.cellCut = null;
          }
          c.setHidden(false);
          ctx.base = c.model.root.scale.x;
          c.setState('scripted', { pose: 'cl_roar', expression: 'shout' });
        },
        cam: { from: { at: 'legs', off: [2.8, 1.2, 3.2] }, look: { at: 'legs', off: [0, 1.1, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, k = U.easeOutCubic(Math.min(1, t / 1.6));
          c.model.root.scale.set(ctx.base, ctx.base * (0.5 + 0.5 * k), ctx.base);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.sparks(c.chest(), 0xbaff9a, 4, 4, 0.08);
          if (t >= 1.6 && !ctx.grown) {
            ctx.grown = true;
            c.model.root.scale.setScalar(ctx.base);
          }
        },
        sfx: { name: 'regrow', who: 'cell', vol: 1.2, pitch: 0.9 },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const c = story(ctx).cell;
          c.model.root.scale.setScalar(ctx.base || c.model.root.scale.x);
          ctx.b.vfx.ring(c.chest(), 4, 0xbaff9a, 0.5);
        },
        pose: [{ who: 'cell', pose: 'cl_roar', face: 'shout', speed: 8, aura: 0.6 }],
        shake: { at: 'cell', amount: 0.5 },
        cam: { from: { at: 'cell', local: [0.5, 0.2, 2] }, look: { at: 'cell:head' }, fov: 36 },
        say: { who: 'cell', line: 'Did you forget, Goku? I have Piccolo\'s cells. As long as my core survives, I can regenerate anything!', duration: 4.6, style: 'shout' },
        hold: 4.8,
      },
      {
        pose: [{ who: 'goku', pose: 'exhausted', face: 'hurt', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.4, 0.3, 1.5] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: '(...So that\'s how it is.)', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx), c = st.cell;
      if (st.cellCut) {
        st.cellCut.dispose();
        st.cellCut = null;
      }
      c.setHidden(false);
      CK().swell(ctx.m, c, 1, 0);
      c.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
      ctx.m.flags.regrown = true;
    },
  };

  /* ============================================================================ THE FORFEIT */
  S.cg_forfeit = {
    id: 'cg_forfeit',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 2 },
    events: [
      // he drops his hands; the gold goes out of his hair
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.cell.pos);
          faceTo(st.cell, st.goku.pos);
        },
        pose: [{ who: 'goku', pose: 'handsDown', face: 'calm', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.6, 0.2, 2.6] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 40 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().toForm(st.goku, 'base');
          ctx.b.vfx.flash(st.goku.chest(), 1.4, 0xfff4b0, 0.2, SL.Toon.tex.glow);
          ctx.b.sfx('kiUp', st.goku, { pitch: 0.6, vol: 0.6 });
        },
        pose: [{ who: 'goku', pose: 'handsDown', face: 'calm', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.35, 0.3, 1.4] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: 'I give up. You win, Cell. I forfeit.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [
          { who: 'vegeta', pose: 'armsCrossed', face: 'shock', speed: 4 },
          { who: 'krillin', pose: 'idle', face: 'shock', speed: 4 },
        ],
        cam: { from: { at: 'krillin', local: [0.4, 0.4, 2.4] }, look: { at: 'krillin', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'He... gave up?! Goku, what are you DOING?!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'angry', speed: 4 }],
        cam: { from: { at: 'cell', local: [0.5, 0.25, 1.9] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'Giving up? Then who exactly do you intend to send in your place?', duration: 3.4 },
        hold: 3.6,
      },
      // a Senzu Bean, out of his belt — and he throws it to Cell
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const hand = st.goku.chest().addScaledVector(st.goku.forward, 0.3).add(new V3(0.2, 0.2, 0));
          st.senzu = CK().prop(b, 'senzu', hand, { scale: 1.6 });
          ctx.s0 = hand.clone();
          ctx.s1 = st.cell.chest().addScaledVector(st.cell.forward, 0.35).add(new V3(0, 0.1, 0));
        },
        pose: [{ who: 'goku', pose: 'senzuFlick', face: 'grin', speed: 10 }],
        cam: { from: { at: 'goku', local: [1.6, 0.3, 1.8] }, look: { at: 'cell', off: [0, 0.4, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), k = Math.min(1, Math.max(0, (t - 0.3) / 1));
          if (!st.senzu) return;
          const p = ctx.s0.clone().lerp(ctx.s1, k);
          p.y += Math.sin(k * Math.PI) * 2;
          st.senzu.group.position.copy(p);
          st.senzu.group.rotation.x += 0.2;
        },
        say: { who: 'goku', line: 'Here — catch!', duration: 1.4 },
        hold: 1.5,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.senzu) st.senzu.group.visible = false;
          ctx.b.vfx.flash(st.cell.chest(), 1.6, 0xbaff9a, 0.25, SL.Toon.tex.glow);
          ctx.b.sfx('learn', st.cell, { pitch: 0.7 });
        },
        pose: [{ who: 'cell', pose: 'cl_roar', face: 'grin', speed: 6, aura: 0.5 }],
        cam: { from: { at: 'cell', local: [0.4, 0.3, 1.6] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'A Senzu Bean...? My strength is back — all of it. You\'re either a fool, Goku, or...', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [0.4, 0.3, 1.6] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'Kakarot, have you lost your mind?! You just handed him the fight!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
      // back up to the ridge; he sits, stretches his legs out, and leans back against a rock
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          K.lieRock(ctx.b);
          ctx.f0 = st.goku.pos.clone();
          ctx.f1 = ground(ctx, K.LIE_AT);
          st.goku.grounded = false;
          st.goku.setState('scripted', { pose: 'flyForward', expression: 'calm' });
          faceTo(st.goku, ctx.f1);
          pt(ctx, 'lie', ctx.f1);
        },
        cam: { from: { at: 'lie', off: [-6, 2.2, -8] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), k = U.easeInOutCubic(Math.min(1, t / 1.8));
          const p = ctx.f0.clone().lerp(ctx.f1, k);
          p.y += Math.sin(k * Math.PI) * 4;
          st.goku.setPosition(p);
          st.goku.prevPos.copy(p);
        },
        hold: 2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().place(st.goku, ground(ctx, CK().LIE_AT));
          faceTo(st.goku, ring(ctx, 0, 0));
        },
        pose: [{ who: 'goku', pose: 'lieBackRock', face: 'calm', speed: 3 }],
        cam: { from: { at: 'goku', local: [-1.8, 0.6, 2.6] }, look: { at: 'goku', off: [0, -0.1, 0] }, fov: 42 },
        say: { who: 'krillin', line: 'He\'s... lying down? In the middle of the Cell Games?', duration: 2.8 },
        hold: 3,
      },
      // the head turns toward his son, and the smile does not move
      {
        pose: [{ who: 'gohan', pose: 'tg_scared', face: 'shock', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.7, 0.1, 2] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'It\'s your turn now, Gohan. Go show him what you can do.', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'gohan', local: [0.3, 0.3, 1.5] }, look: { at: 'gohan:head' }, fov: 32 },
        say: { who: 'teen_gohan', line: 'Me...? Dad, I— ...Okay.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx), K = CK();
      if (st.senzu) st.senzu.group.visible = false;
      K.toForm(st.goku, 'base');
      K.lieRock(ctx.b);
      K.watch(st.goku, ground(ctx, K.LIE_AT), 'lieBackRock', 'calm');
      ctx.m.flags.forfeit = true;
      ctx.m.flags.senzuToCell = true;
    },
  };
})();
