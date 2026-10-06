/*
 * SCENES — the Cell Games, part two (mission cell_gohan, rebuilt 2026-10-01).
 *
 *   gh_enter         down from the ridge into the ring
 *   gh_ssj           the boy's own hair in gold, and a refusal
 *   gh_crush         the bear hug; 16's grip and the bomb that is not there; 16 blown apart on camera,
 *                    the head landing at Mr. Satan's feet
 *   gh_born          seven eggs from the tail; the Juniors hatch; "Play with them."
 *   gh_sixteen       the throw, the last words, the boot, the crunch — and the red line: black screen,
 *                    a crimson line through his head that snaps like glass, gold tears hanging in the
 *                    air, the roar, the pillar, Super Saiyan 2
 *   gh_ssj2_reveal   the canopy of gold, the one bang, the lightning; everybody who saw it
 *
 * Dialogue is paraphrased English written for this project, following the owner's brief.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const C = SL.data.poses;
  const CK = () => SL.data.cellKit;
  const VK = () => SL.data.vegitoKit;

  // the bear hug (Cell) and the boy crushed in it (Gohan); 16's grip from behind
  C.cl_hug = (t) => ({ root: { y: -0.04, rx: -6 }, spine: [-6, 0, 0], chest: [-10 + Math.sin(t * 20) * 2, 0, 0], head: [8, 0, 0], shoulderL: [-90, 30, 30], elbowL: [-100, 0, 0], shoulderR: [-90, -30, -30], elbowR: [-100, 0, 0], thighL: [-14, 0, 14], kneeL: [18, 0, 0], thighR: [6, 0, -14], kneeR: [14, 0, 0], hands: ['open', 'open'] });
  C.crushed = (t) => ({ root: { y: 0.2, rx: -12 }, spine: [-16, 0, 0], chest: [-20, 0, 0], head: [-34 + Math.sin(t * 24) * 4, 0, 0], shoulderL: [-30, 0, 60], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -60], elbowR: [-40, 0, 0], thighL: [-10, 0, 10], kneeL: [30, 0, 0], footL: [40, 0, 0], thighR: [6, 0, -10], kneeR: [40, 0, 0], footR: [40, 0, 0], hands: ['fist', 'fist'] });
  C.grabBehind = { root: { y: -0.02, rx: 10 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0], shoulderL: [-90, -40, 30], elbowL: [-110, 0, 0], shoulderR: [-90, 40, -30], elbowR: [-110, 0, 0], thighL: [-26, 0, 12], kneeL: [30, 0, 0], thighR: [10, 0, -12], kneeR: [20, 0, 0], hands: ['fist', 'fist'] };

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
  const fly = (ctx, key, f, to, seconds, t, arc = 2) => {
    if (!ctx[key]) ctx[key] = f.pos.clone();
    const k = U.easeInOutCubic(Math.min(1, t / seconds));
    const p = ctx[key].clone().lerp(to, k);
    p.y += Math.sin(k * Math.PI) * arc;
    f.setPosition(p);
    f.prevPos.copy(p);
    return k;
  };

  /** Android 16's head: the piece of his own model above the neck, kept in the story once it is off. */
  function headOff(ctx) {
    const b = ctx.b, st = story(ctx), a = st.a16;
    if (st.head16) return st.head16;
    a.setHidden(false);
    a.model.root.updateMatrixWorld(true);
    const neck = a.model.joints.head.getWorldPosition(new V3());
    const center = neck.clone().add(new V3(0, a.model.b.headR * 1.1, 0));
    st.head16Yaw = a.yaw;
    const cut = CK().split(b, a, { joint: 'head', at: neck.clone().add(new V3(0, -0.03, 0)), normal: new V3(0, 1, 0), centerA: center, centerB: a.chest() });
    cut.a.rest = a.model.b.headR * 0.95;
    st.head16 = cut;
    st.a16._gone = true;
    st.a16.untargetable = st.a16.intangible = true;
    return cut;
  }

  /* ============================================================================ ENTER */
  S.gh_enter = {
    id: 'gh_enter',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.4, 0.3, 1.8] }, look: { at: 'piccolo:head' }, fov: 34 },
        say: { who: 'piccolo', line: 'Goku, have you lost your mind? He\'s a child!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku', local: [-1.4, 0.5, 2.2] }, look: { at: 'goku', off: [0, -0.1, 0] }, fov: 40 },
        say: { who: 'goku', line: 'He\'s stronger than any of us, Piccolo. He just doesn\'t know it yet.', duration: 3.6 },
        hold: 3.8,
      },
      // the World Champion is back by his van, rubbing his back, telling everybody he slipped
      {
        pose: [{ who: 'satan', pose: 'ms_sore', face: 'hurt', speed: 4 }],
        cam: { from: { at: 'satan', local: [0.4, 0.3, 2] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'mr_satan', line: 'The ring was... slippery, that\'s all! I let him win that one! For the kid!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      // down off the ridge and onto the stone
      {
        call: (ctx) => {
          const st = story(ctx);
          st.gohan.grounded = false;
          st.gohan.setState('scripted', { pose: 'flyForward', expression: 'calm' });
          faceTo(st.gohan, ring(ctx, 0, 7));
          pt(ctx, 'mid', ring(ctx, 0, 5));
        },
        cam: { from: { at: 'mid', off: [6, 1.2, 4] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx);
          fly(ctx, '_g0', st.gohan, ring(ctx, 0, 7), 1.8, t, 3);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(st.gohan.chest(), 0xf4f0ff, 0.3, 0.25);
        },
        hold: 2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().place(st.gohan, ring(ctx, 0, 7), Math.PI);
          faceTo(st.gohan, st.cell.pos);
          faceTo(st.cell, st.gohan.pos);
          ctx.b.vfx.dust(st.gohan.pos, 1, 6, 0xd8d4e2);
        },
        pose: [
          { who: 'gohan', pose: 'tg_idle', face: 'calm', speed: 3 },
          { who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 3 },
        ],
        cam: { from: { at: 'gohan', local: [-0.8, 0.4, -2.2] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'cell', line: 'So — Goku\'s son. Let\'s see what your father sees in you.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      CK().place(st.gohan, ring(ctx, 0, 7), Math.PI);
      ctx.m.flags.gohanEntered = true;
    },
  };

  /* ============================================================================ SUPER SAIYAN */
  S.gh_ssj = {
    id: 'gh_ssj',
    cast,
    auraCap: 0.15,
    music: { song: 'battle', level: 4 },
    events: [
      // the gold settles: his own hair, the fringe still over his brow — gold, and a little sharper
      {
        pose: [{ who: 'gohan', pose: 'tg_cold', face: 'calm', speed: 3 }],
        cam: { from: { at: 'gohan:face', local: [0.15, 0.16, 0.85] }, to: { at: 'gohan:face', local: [0.1, 0.16, 0.7] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 34 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.4, 0.25, 1.8] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'There it is. Now show me the rest of it.', duration: 2.8 },
        hold: 3,
      },
      {
        cam: { from: { at: 'gohan', local: [0.4, 0.3, 1.6] }, look: { at: 'gohan:head' }, fov: 34 },
        say: { who: 'teen_gohan', line: 'I don\'t like fighting, Cell. But I won\'t let you hurt anybody.', duration: 3.4 },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      CK().toForm(st.gohan, 'ssj');
      ctx.m.flags.gohanSsj = true;
    },
  };

  /* ============================================================================ THE CRUSH, AND 16 */
  S.gh_crush = {
    id: 'gh_crush',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 4 },
    clearMood: false,
    events: [
      // in a blink he has the boy in his arms, and squeezes
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().place(st.cell, ring(ctx, 0, 0), 0);
          const front = st.cell.pos.clone().addScaledVector(st.cell.forward.clone().setY(0).normalize(), 0.62).add(new V3(0, 0.3, 0));
          st.gohan.setPosition(front);
          st.gohan.grounded = false;
          faceTo(st.gohan, st.cell.pos);
          VK().vanishTo(ctx.b, st.cell, st.cell.pos.clone(), { face: st.gohan.pos });
          ctx.b.sfx('punchHeavy', st.gohan, { pitch: 0.6 });
        },
        pose: [
          { who: 'cell', pose: 'cl_hug', face: 'wicked', speed: 6 },
          { who: 'gohan', pose: 'crushed', face: 'shout', speed: 8 },
        ],
        cam: { from: { at: 'cell', local: [1.6, 0.4, 1.6] }, look: { at: 'gohan', off: [0, 0.1, 0] }, fov: 38 },
        tick: (ctx) => {
          if (ctx.b.frame % 20 === 0) {
            ctx.b.sfx('boneCrack', story(ctx).gohan, { vol: 0.4, pitch: 1.3 });
            ctx.b.cameraTraumaAt(story(ctx).gohan.pos, 0.2);
          }
        },
        say: { who: 'cell', line: 'If your temper won\'t come out on its own, I\'ll squeeze it out of you.', duration: 3.4 },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'gohan:face', local: [0.2, 0.14, 0.9] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 34 },
        say: { who: 'teen_gohan', line: 'AAAAAHHH!', duration: 1.6, style: 'shout' },
        shake: { at: 'gohan', amount: 0.3 },
        hold: 1.8,
      },
      // 16 comes off the ridge and locks his arms round Cell from behind
      {
        call: (ctx) => {
          const st = story(ctx), a = st.a16;
          a.setHidden(false);
          a.grounded = false;
          a.setState('scripted', { pose: 'flyForward', expression: 'angry' });
          ctx.a0 = a.pos.clone();
          ctx.a1 = st.cell.pos.clone().addScaledVector(st.cell.forward.clone().setY(0).normalize(), -0.75);
          faceTo(a, st.cell.pos);
        },
        cam: { from: { at: 'cell', local: [-2.2, 1, -3] }, look: { at: 'a16', off: [0, 0.4, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const a = story(ctx).a16, k = U.easeInOutCubic(Math.min(1, t / 1.2));
          const p = ctx.a0.clone().lerp(ctx.a1, k);
          p.y += Math.sin(k * Math.PI) * 4;
          a.setPosition(p);
          a.prevPos.copy(p);
        },
        hold: 1.3,
      },
      {
        call: (ctx) => {
          const st = story(ctx), a = st.a16;
          CK().place(a, ground(ctx, ctx.a1));
          faceTo(a, st.cell.pos);
          ctx.b.sfx('punchHeavy', a, { pitch: 0.5 });
        },
        pose: [
          { who: 'a16', pose: 'grabBehind', face: 'angry', speed: 10 },
          { who: 'cell', pose: 'cl_hug', face: 'shock', speed: 6 },
        ],
        cam: { from: { at: 'a16', local: [2.4, 0.55, -0.3] }, look: { at: 'a16:head', off: [0, -0.1, 0] }, fov: 38 },
        say: { who: 'android_16', line: 'Cell. You and I will die together.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'a16', pose: 'grabBehind', face: 'calm', speed: 4 }],
        sfx: { name: 'fuseBeep', who: 'a16', vol: 0.8 },
        cam: { from: { at: 'a16', local: [1.5, 0.75, 0.35] }, look: { at: 'a16:head' }, fov: 32 },
        say: { who: 'android_16', line: 'Self-destruct. Now.', duration: 2, style: 'quiet' },
        hold: 2.6,
      },
      // nothing happens
      {
        cam: { from: { at: 'cell', local: [0.4, 0.4, 2.2] }, look: { at: 'cell:head' }, fov: 36 },
        music: { song: null, level: 0 },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'a16', local: [-1.5, 0.75, 0.35] }, look: { at: 'a16:head' }, fov: 32 },
        say: { who: 'android_16', line: '...It doesn\'t work?', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'krillin', local: [0.4, 0.3, 1.8] }, look: { at: 'krillin:head' }, fov: 36 },
        say: { who: 'krillin', line: 'Bulma took the bomb out when she rebuilt him! It\'s not there anymore!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      // Cell throws them both off; the boy hits the stone; Cell turns to the machine
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.vfx.ring(st.cell.chest(), 4, 0xbaff9a, 0.4);
          b.sfx('explosionSmall', st.cell, { pitch: 0.7 });
          CK().place(st.gohan, ring(ctx, 1.5, 5), Math.PI);
          st.gohan.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
          CK().place(st.a16, ring(ctx, -3.4, -2.4));
          faceTo(st.a16, st.cell.pos);
          faceTo(st.cell, st.a16.pos);
          st.a16.setState('scripted', { pose: 'idle', expression: 'calm' });
        },
        pose: [{ who: 'cell', pose: 'blastR', face: 'angry', speed: 10 }],
        cam: { from: { at: 'cell', local: [-1.2, 0.5, -2.2] }, look: { at: 'a16', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'cell', line: 'A useless machine, to the very end.', duration: 2.4 },
        hold: 2.4,
      },
      // the blast: his body comes apart, and the head goes spinning away across the ring
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, a = st.a16;
          const c = a.chest();
          const cut = headOff(ctx);
          // the body: gone in sparks, oil and pieces
          cut.hide(cut.b);
          CK().burst(b, c, 'android', 0.8);
          ctx.parts = SL.data.trunksKit.dice(b, c, [0x3a6a3a, 0x2a2a2e, 0xc8c0a8, 0x8a2a1c], { count: 30, height: 1.6, width: 0.8, seed: 16 });
          for (const p of ctx.parts.pieces) p.v.set((p.mesh.position.x) * 14, 4 + p.mesh.position.y * 5, p.mesh.position.z * 14);
          b.vfx.explosion(c, 1.6, 0xffd8a0, { smoke: true });
          b.sfx('explosionBig', a, { vol: 1.3 });
          b.cameraTraumaAt(c, 0.9);
          // the head flies off in an arc toward the van
          const landing = ground(ctx, CK().CREW.satan.clone().add(new V3(-1.4, 0, -1.2)));
          cut.a.vel.copy(landing.clone().sub(cut.a.pivot.position).setY(0).multiplyScalar(1 / 1.95)).add(new V3(0, 13, 0));
          cut.a.spin.set(6, 3, 2);
          pt(ctx, 'blast', c);
        },
        screen: { flash: 0.2, color: '#fff0d0' },
        slow: { scale: 0.35, seconds: 0.8 },
        cam: { from: { at: 'blast', off: [11, 3.4, 13] }, look: { at: 'blast', off: [2, 1, 0] }, fov: 50 },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.head16) CK().animatePieces(ctx.b, st.head16, { gravity: 16 });
          if (ctx.parts) {
            for (const p of ctx.parts.pieces) p.v.y -= 16 / 60;
            ctx.parts.tick(1 / 60);
          }
        },
        hold: 2.2,
      },
      // the head rolls to a stop at the World Champion's feet
      {
        call: (ctx) => pt(ctx, 'headAt', story(ctx).head16.a.pivot.position),
        pose: [{ who: 'satan', pose: 'ms_hide', face: 'shock', speed: 8 }],
        cam: { from: { at: 'satan', local: [1.2, -0.5, 2.6] }, look: { at: 'satan', off: [-0.4, -0.6, 0] }, fov: 44 },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.head16) CK().animatePieces(ctx.b, st.head16, { gravity: 16 });
          if (ctx.parts) {
            for (const p of ctx.parts.pieces) p.v.y -= 16 / 60;
            ctx.parts.tick(1 / 60);
          }
        },
        say: { who: 'mr_satan', line: 'EEEEK!', duration: 1.4, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (ctx.parts) ctx.parts.dispose();
      const cut = headOff(ctx);
      cut.hide(cut.b);
      // the head lies by the van, face up
      const landing = ground(ctx, CK().CREW.satan.clone().add(new V3(-1.4, 0, -1.2)), cut.a.rest);
      cut.a.pivot.position.copy(landing);
      cut.a.pivot.rotation.set(-0.3, 0.6, 0);
      cut.a.vel.set(0, 0, 0);
      cut.a.spin.set(0, 0, 0);
      cut.a.frozen = true;
      cut.update();
      CK().gone(st.a16);
      CK().place(st.gohan, ring(ctx, 1.5, 5), Math.PI);
      st.gohan.setState('scripted', { pose: 'tg_scared', expression: 'hurt' });
      ctx.m.flags.sixteenBroken = true;
    },
  };

  /* ============================================================================ THE JUNIORS */
  S.gh_born = {
    id: 'gh_born',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 3 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().place(st.cell, ring(ctx, 0, -4), 0);
          faceTo(st.cell, ring(ctx, 0, 6));
          CK().ensureJuniors(ctx.m);
          // the perfect form keeps its tail out of sight; it comes out now, arched up over his back
          const tb = st.cell.model.longTailBase;
          if (tb) {
            ctx.tailLift = tb.rotation.x;
            tb.visible = true;
            tb.rotation.x = 2.4;
          }
        },
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'wicked', speed: 4 }],
        cam: { from: { at: 'cell', local: [1.8, 0.4, -2.4] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'cell', line: 'Still holding back? Then let\'s raise the stakes.', duration: 2.8 },
        hold: 3,
      },
      // the tail arches over his shoulder, and seven eggs drop out of it onto the stone
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.eggs = [];
          pt(ctx, 'nest', ring(ctx, 0, -1.5));
        },
        cam: { from: { at: 'nest', off: [3.4, 1.2, 4] }, look: { at: 'nest', off: [0, 0.4, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          const n = Math.min(7, Math.floor(t / 0.35) + 1);
          while (ctx.eggs.length < n) {
            const i = ctx.eggs.length, a = (i / 7) * Math.PI * 2;
            const p = ring(ctx, Math.cos(a) * 2.2, -1.5 + Math.sin(a) * 2.2);
            ctx.eggs.push(CK().prop(b, 'egg', p));
            b.sfx('regrow', st.cell, { pitch: 1.5, vol: 0.5 });
            b.vfx.dust(p, 0.5, 3);
          }
        },
        sfx: { name: 'stretch', who: 'cell', pitch: 0.7 },
        hold: 2.8,
      },
      // they crack, and something small and blue stands up out of each one
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          st.juniors.forEach((j, i) => {
            const egg = ctx.eggs[i];
            const p = egg ? egg.group.position.clone() : ring(ctx, i - 3, -1.5);
            if (egg) egg.dispose();
            CK().place(j, p);
            faceTo(j, ring(ctx, 0, 8));
            j.setHidden(false);
            j.setState('scripted', { pose: 'cj_crouch', expression: 'grin' });
            b.vfx.sparks(p.clone().add(new V3(0, 0.4, 0)), 0x9ab4ff, 8, 4, 0.08);
          });
          b.sfx('rockBreak', null, { at: ring(ctx, 0, -1.5), pitch: 1.6, vol: 0.7 });
        },
        cam: { from: { at: 'nest', off: [-2.6, 0.7, 3.4] }, look: { at: 'nest', off: [0, 0.3, 0] }, fov: 40 },
        hold: 1.6,
      },
      {
        pose: [0, 1, 2, 3, 4, 5, 6].map((i) => ({ who: 'j' + i, pose: 'cj_laugh', face: 'grin', speed: 6 + i })),
        sfx: { name: 'saibaScreech', pitch: 1.5, vol: 0.8 },
        cam: { from: { at: 'nest', off: [0, 0.5, 4.6] }, to: { at: 'nest', off: [0, 0.8, 6] }, look: { at: 'nest', off: [0, 0.3, 0] }, fov: 44 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'wicked', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.5, 0.3, 1.9] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'My children. Go and play with Gohan\'s friends.', duration: 3 },
        hold: 3.2,
      },
      // up to the ridge, all seven at once
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          ctx.jmoves = st.juniors.map((j, i) => {
            const a = (i / 7) * Math.PI * 2;
            j.grounded = false;
            j.setState('scripted', { pose: 'flyForward', expression: 'grin' });
            return [j, ground(ctx, new V3(K.RIDGE.x + Math.cos(a) * 8, 0, K.RIDGE.z - 4 + Math.sin(a) * 5))];
          });
          pt(ctx, 'ridge', ground(ctx, new V3(K.RIDGE.x, 0, K.RIDGE.z - 10)));
        },
        cam: { from: { at: 'ridge', off: [10, 4, -6] }, look: { at: 'ridge', off: [0, 1, 4] }, fov: 50 },
        tick: (ctx, t) => {
          const k = U.easeInOutCubic(Math.min(1, t / 1.6));
          if (!ctx.j0) ctx.j0 = ctx.jmoves.map(([j]) => j.pos.clone());
          ctx.jmoves.forEach(([j, to], i) => {
            const p = ctx.j0[i].clone().lerp(to, k);
            p.y += Math.sin(k * Math.PI) * 6;
            j.setPosition(p);
            j.prevPos.copy(p);
            if (ctx.b.frame % 4 === 0) ctx.b.vfx.trail(j.chest(), 0x6a9aff, 0.25, 0.2);
          });
        },
        say: { who: 'krillin', line: 'They\'re coming for US!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const tb = story(ctx).cell.model.longTailBase;
      if (tb) {
        tb.visible = false;
        if (ctx.tailLift !== undefined) tb.rotation.x = ctx.tailLift;
      }
      for (const e of ctx.eggs || []) e.dispose();
      CK().ensureJuniors(ctx.m).forEach((j) => j.setHidden(false));
      ctx.m.flags.juniorsBorn = true;
    },
  };

  /* ============================================================================ 16, AND THE RED LINE */
  S.gh_sixteen = {
    id: 'gh_sixteen',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      // the fighting stops. By the van, Mr. Satan is looking down at something.
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          // the Juniors hold their friends down on the ridge; Gohan stands among them, beaten
          K.place(st.gohan, ground(ctx, new V3(-6, 0, 36)), 0);
          st.gohan.setState('scripted', { pose: 'tg_scared', expression: 'hurt' });
          st.juniors.forEach((j, i) => {
            if (j._gone) return;
            const a = (i / 7) * Math.PI * 2;
            K.place(j, ground(ctx, new V3(-6 + Math.cos(a) * 4.5, 0, 38 + Math.sin(a) * 3)));
            faceTo(j, st.gohan.pos);
            j.setState('scripted', { pose: 'cj_laugh', expression: 'grin' });
          });
          // Cell has come up to watch
          K.place(st.cell, ground(ctx, new V3(-1, 0, 33)));
          faceTo(st.cell, st.gohan.pos);
          st.cell.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
          const head = headOff(ctx);
          head.a.frozen = true;
          pt(ctx, 'head', head.a.pivot.position);
        },
        pose: [{ who: 'satan', pose: 'ms_nervous', face: 'shock', speed: 6 }],
        cam: { from: { at: 'head', off: [0.9, 0.35, 1.2] }, look: { at: 'head' }, fov: 40 },
        say: { who: 'android_16', line: 'You. Mr. Satan. Throw me to Gohan.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { from: { at: 'satan', local: [0.3, 0.3, 1.6] }, look: { at: 'satan:head' }, fov: 34 },
        say: { who: 'mr_satan', line: 'M-me?! You want ME to—', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      // he picks it up with both hands, shaking, and throws it as far as he has ever thrown anything
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.satan, st.gohan.pos);
          const h = st.head16.a;
          ctx.h0 = st.satan.chest().addScaledVector(st.satan.forward, 0.35);
          ctx.h1 = ground(ctx, st.gohan.pos.clone().add(new V3(0.6, 0, 1.4)), h.rest);
          h.pivot.position.copy(ctx.h0);
          st.head16.update();
        },
        pose: [{ who: 'satan', pose: 'toss', face: 'shout', speed: 10 }],
        cam: { from: { at: 'satan', local: [-1.2, 0.6, -2.4] }, look: { at: 'gohan', off: [0, 0, 0] }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx), h = st.head16.a, k = Math.min(1, Math.max(0, (t - 0.25) / 1.6));
          const p = ctx.h0.clone().lerp(ctx.h1, k);
          p.y += Math.sin(k * Math.PI) * 9;
          h.pivot.position.copy(p);
          h.pivot.rotation.x += 0.08;
          st.head16.update();
        },
        say: { who: 'mr_satan', line: 'HYAAAH!', duration: 1.4, style: 'shout' },
        hold: 2,
      },
      {
        call: (ctx) => {
          const st = story(ctx), h = st.head16.a;
          h.pivot.position.copy(ctx.h1);
          // face up at the boy: turn the piece from the way 16 was facing when it came off
          const toG = st.gohan.pos.clone().sub(ctx.h1);
          h.pivot.rotation.order = 'YXZ';
          h.pivot.rotation.set(-0.35, Math.atan2(toG.x, toG.z) - (st.head16Yaw || 0), 0);
          st.head16.update();
          ctx.b.vfx.dust(ctx.h1, 0.6, 5);
          pt(ctx, 'head', ctx.h1);
          // a lens in front of the face, low, with the boy behind it
          const d = toG.setY(0).normalize();
          pt(ctx, 'faceCam', ctx.h1.clone().addScaledVector(d, 0.75).add(new V3(0.18, 0.22, 0)));
          pt(ctx, 'faceCam2', ctx.h1.clone().addScaledVector(d, 0.6).add(new V3(0.14, 0.18, 0)));
        },
        cam: { from: { at: 'head', off: [0.5, 0.15, 0.9] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1.2,
      },
      // the last words, from a head lying in the dirt
      {
        cam: { from: { at: 'faceCam' }, to: { at: 'faceCam2' }, look: { at: 'head', off: [0, 0.05, 0] }, fov: 38 },
        say: { who: 'android_16', line: 'Gohan... it is no sin to fight for what is right. There are some you cannot reason with.', duration: 5 },
        hold: 5.2,
      },
      {
        cam: { from: { at: 'gohan:face', local: [0.15, 0.12, 0.8] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        say: { who: 'android_16', line: 'Let your anger go. Protect the nature... and the creatures that I loved.', duration: 4.6 },
        hold: 4.8,
      },
      // Cell walks over, and lifts his boot over it
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.c0 = st.cell.pos.clone();
          ctx.c1 = ground(ctx, ctx.cast.head.pos.clone().addScaledVector(st.gohan.forward.clone().setY(0).normalize(), -0.1).add(new V3(-0.5, 0, 0.2)));
          faceTo(st.cell, ctx.cast.head.pos);
          st.cell.setState('scripted', { pose: 'run', expression: 'smirk' });
        },
        cam: { from: { at: 'head', off: [-0.6, 0.2, 1] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, k = Math.min(1, t / 1.4);
          c.setPosition(ctx.c0.clone().lerp(ctx.c1, k));
          c.prevPos.copy(c.pos);
        },
        say: { who: 'cell', line: 'Noisy machine.', duration: 1.6, style: 'quiet' },
        hold: 1.5,
      },
      {
        call: (ctx) => faceTo(story(ctx).cell, ctx.cast.head.pos),
        pose: [{ who: 'cell', pose: 'cl_stompUp', face: 'wicked', speed: 8 }],
        cam: { from: { at: 'head', off: [0.4, 0.05, 0.6] }, look: { at: 'cell', off: [0, 0.2, 0] }, fov: 50 },
        hold: 1.1,
      },
      // CRUNCH
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, h = st.head16.a;
          const p = h.pivot.position.clone();
          h.pivot.scale.set(1.5, 0.22, 1.5);
          h.pivot.position.y = b.stage.heightAt(p.x, p.z) + 0.05;
          st.head16.update();
          b.vfx.sparks(p, 0xffe0a0, 30, 9, 0.08);
          b.vfx.debrisBurst(p, 16, 0x3a3a40, 7, 0.1);
          b.vfx.debrisBurst(p, 8, 0x8a2a1c, 5, 0.08);
          b.vfx.dust(p, 1, 8);
          b.sfx('boneCrack', null, { at: p, vol: 1.3, pitch: 0.6 });
          b.sfx('explosionSmall', null, { at: p, vol: 0.8, pitch: 1.6 });
          b.sfx('rockBreak', null, { at: p, vol: 0.9, pitch: 1.2 });
          b.cameraTraumaAt(p, 0.6);
        },
        pose: [{ who: 'cell', pose: 'cl_stompDown', face: 'wicked', speed: 30 }],
        slow: { scale: 0.3, seconds: 0.7 },
        cam: { from: { at: 'head', off: [0.5, 0.06, 0.6] }, look: { at: 'head', off: [0, 0.2, 0] }, fov: 50 },
        hold: 1.6,
      },
      // the pupils go to points
      {
        call: (ctx) => {
          const g = story(ctx).gohan;
          if (g.model.setPupilScale) g.model.setPupilScale(0.35);
        },
        pose: [{ who: 'gohan', pose: 'tg_cold', face: 'shock', speed: 1 }],
        sfx: { name: 'heartbeat', who: 'gohan', vol: 0.9 },
        cam: { from: { at: 'gohan:face', local: [0.0, 0.16, 0.62] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 30 },
        hold: 2,
      },
      // the screen goes black round his eyes; a crimson line is drawn across it, through his head
      {
        call: (ctx) => (ctx.rl = { dark: 0, line: 0, snap: 0, y: 0.5, band: 0.2 }),
        sfx: { name: 'tinnitus', vol: 0.6 },
        cam: { from: { at: 'gohan:face', local: [0, 0.16, 0.62] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 30 },
        tick: (ctx, t) => {
          ctx.rl.dark = Math.min(1, t / 0.5);
          ctx.rl.line = U.clamp01((t - 0.45) / 0.7);
          SL.ScreenFX.redLine(ctx.rl);
        },
        hold: 1.6,
      },
      // and it snaps in two like glass
      {
        call: (ctx) => {
          ctx.b.sfx('swordClang', null, { vol: 1.2, pitch: 1.8 });
          ctx.b.sfx('rockBreak', null, { vol: 0.8, pitch: 2 });
          SL.ScreenFX.flash(0.25, '#ff2840');
        },
        cam: { from: { at: 'gohan:face', local: [0, 0.16, 0.62] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 30 },
        tick: (ctx, t) => {
          ctx.rl.snap = U.easeOutCubic(Math.min(1, t / 0.7));
          SL.ScreenFX.redLine(ctx.rl);
        },
        hold: 1.1,
      },
      // gold tears lift off his face and hang in the air
      {
        call: (ctx) => {
          SL.ScreenFX.redLine(null);
          const g = story(ctx).gohan;
          ctx.tears = [];
          const h = SL.Cinema.actorPoint(ctx, 'gohan:head');
          for (const s of [-1, 1]) ctx.tears.push(h.clone().add(new V3(s * 0.06, 0.08, 0)).addScaledVector(g.forward, 0.12));
        },
        slow: { scale: 0.25, seconds: 1.4 },
        cam: { from: { at: 'gohan:face', local: [0.1, 0.20, 0.62] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 34 },
        tick: (ctx, t) => {
          if (ctx.b.frame % 3 === 0) for (const p of ctx.tears) ctx.b.vfx.trail(p.clone().add(new V3(0, t * 0.6, 0)), 0xffe25a, 0.06, 0.8);
        },
        hold: 1.8,
      },
      // the roar
      {
        call: (ctx) => {
          const g = story(ctx).gohan;
          if (g.model.setPupilScale) g.model.setPupilScale(1);
          g.setRage(true, 1);
        },
        pose: [{ who: 'gohan', pose: 'tg_ascend', face: 'shout', speed: 8, aura: 0.9 }],
        mood: { amount: 0.75, color: 0x07070f, seconds: 0.5 },
        sfx: { name: 'roar', who: 'gohan', vol: 1.2, pitch: 1.3 },
        shake: { at: 'gohan', amount: 0.9 },
        cam: { from: { at: 'gohan', local: [1.4, -0.4, 2.8] }, to: { at: 'gohan', local: [2.4, 0.2, 5] }, look: { at: 'gohan', off: [0, 0.5, 0] }, fov: 40, fov2: 50 },
        tick: (ctx) => {
          const b = ctx.b, g = story(ctx).gohan;
          if (b.frame % 5 === 0) b.vfx.bolt(g.chest().add(new V3(Math.sin(b.frame) * 0.8, Math.cos(b.frame * 1.3) * 0.9, 0.2)), 1.4, 0xbfe4ff);
          if (b.frame % 7 === 0) b.vfx.rock(g.pos.clone().add(new V3(Math.sin(b.frame * 0.7) * 4, 0.1, Math.cos(b.frame * 0.9) * 4)), new V3(0, 6, 0), 0.25, b.stage.rockColor);
          if (b.frame % 9 === 0) b.stage.crater(g.pos.clone().add(new V3(Math.sin(b.frame) * 2, 0, Math.cos(b.frame) * 2)), 1.6, 0.25, null);
        },
        say: { who: 'teen_gohan', line: 'AAAAAAAAAAAHHHHHHH!!', duration: 2.8, style: 'shout' },
        hold: 2.8,
      },
      // a column of gold and blue lightning into the sky, every cloud for miles gone
      {
        call: (ctx) => {
          const b = ctx.b, g = story(ctx).gohan;
          VK().pillar(ctx.m, ground(ctx, g.pos), { height: 240, radius: 3.4, seconds: 3.4 });
          for (let i = 0; i < 6; i++) b.vfx.bolt(g.chest().add(new V3(0, i * 2.4, 0)), 3, 0xbfe4ff);
          b.vfx.ring(ground(ctx, g.pos, 0.2), 14, 0xffe25a, 0.8, new V3(0, 1, 0));
          b.sfx('lightning', g, { vol: 1.2 });
          b.sfx('transformBurst', g, { vol: 1.2, pitch: 0.8 });
          pt(ctx, 'col', g.pos);
        },
        screen: { flash: 0.6, color: '#fff8d0' },
        cam: { from: { at: 'col', off: [16, 6, 22] }, look: { at: 'col', off: [0, 20, 0] }, fov: 58 },
        shake: { at: 'gohan', amount: 1 },
        hold: 2,
      },
      // Super Saiyan 2: the hair snaps up into a canopy with one strand over the brow
      {
        call: (ctx) => {
          const g = story(ctx).gohan;
          CK().toForm(g, 'ssj2');
          ctx.b.vfx.explosion(g.chest(), 3, 0xffe25a, { smoke: false });
          ctx.b.vfx.ring(g.chest(), 6, 0xffffff, 0.45);
          ctx.b.stage.crater(g.pos, 5, 0.6, null);
        },
        pose: [{ who: 'gohan', pose: 'powerUp', face: 'shout', speed: 18, aura: 1 }],
        mood: { amount: 0.2, color: 0x2a2410, seconds: 0.4 },
        cam: { from: { at: 'gohan', local: [0.8, 0.1, 2.4] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 40 },
        hold: 1.4,
      },
      // the eyes come up: a cold, murderous stare, straight at Cell
      {
        call: (ctx) => faceTo(story(ctx).gohan, story(ctx).cell.pos),
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 3 }],
        mood: { amount: 0.12, color: 0x101020, seconds: 1.4 },
        music: { song: 'finale', level: 6 },
        cam: { from: { at: 'gohan:face', local: [0.12, 0.16, 0.66] }, to: { at: 'gohan:face', local: [0.08, 0.16, 0.55] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        tick: (ctx) => {
          const b = ctx.b, g = story(ctx).gohan;
          if (b.frame % 9 === 0) b.vfx.bolt(g.chest().add(new V3(0.3, 0.6, 0.1)), 1, 0xbfe4ff);
        },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      SL.ScreenFX.redLine(null);
      const g = st.gohan;
      if (g.model.setPupilScale) g.model.setPupilScale(1);
      if (st.head16) {
        const h = st.head16.a;
        h.pivot.scale.set(1.5, 0.22, 1.5);
        st.head16.update();
      }
      g.lockedForms = {};
      CK().toForm(g, 'ssj2');
      g.setRage(true, 1);
      g.setState('scripted', { pose: 'tg2_stance', expression: 'angry' });
      b.stage.setMood(0.12, 0x101020, 1);
      ctx.m.flags.sixteenGone = true;
      ctx.m.flags.ascended = true;
    },
  };

  /* ============================================================================ THE REVEAL */
  S.gh_ssj2_reveal = {
    id: 'gh_ssj2_reveal',
    cast,
    auraCap: 0.15,
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 3 }],
        call: (ctx) => {
          const st = story(ctx);
          if (st.goku._gone) return;
          CK().place(st.goku, ground(ctx, CK().SPOTS.goku));
          faceTo(st.goku, st.gohan.pos);
        },
        cam: { from: { at: 'goku', local: [0.4, 0.3, 1.7] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'There it is. That\'s the power I saw in him.', duration: 3 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'knockdown', face: 'shock', speed: 2 }],
        cam: { from: { at: 'vegeta:head', local: [0.2, 0.1, 0.9] }, look: { at: 'vegeta:head' }, fov: 36 },
        say: { who: 'vegeta', line: 'Beyond a Super Saiyan... a child, ahead of me...', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'grin', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.4, 0.3, 1.8] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'Yes... YES! This is what I wanted to see!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 3 }],
        cam: { from: { at: 'gohan', local: [0.6, -0.1, 2.2] }, look: { at: 'gohan', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'teen_gohan', line: 'You won\'t be wanting it for long.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.revealed = true;
    },
  };
})();
