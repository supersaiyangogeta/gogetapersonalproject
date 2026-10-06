/*
 * SCENES — Chapter 5, "What He Came To Say" (Age 764, three hours after the Cold family).
 * Rebuilt 2026-09-24 (owner's Future Trunks arrival rebuild).
 *
 *   goku_waiting        friends on a rock, a stranger apart from them; Bulma sees the logo
 *   goku_lands          the pod comes down where he said; Goku climbs out in Yardrat clothes
 *   goku_yardrat        where he has been — and the player shows them Instant Transmission (cue)
 *   trunks_aside        "Could I speak to you alone?"; Piccolo's ears
 *   finger_test_open    both turn gold; the sword comes out
 *   finger_test_end     Trunks lowers the sword: exactly as strong as they said
 *   trunks_identity     Vegeta and Bulma's son
 *   trunks_future       his memory: the heart virus, the Androids, everyone, Gohan, a boy alone
 *   trunks_future_back  his face, back in the present
 *   trunks_medicine     the quiet beat: the bottle changes hands (cue)
 *   trunks_warning      the date, the time, the island — drawn in the sand with the sword tip
 *   trunks_departs      the capsule, the Time Machine, a look back, gone
 *   three_years         Piccolo heard everything; Vegeta leaves to train; the clock starts
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.trunksKit;
  const W = () => SL.data.trunksWarning;
  const st = (ctx) => ctx.m.battle.story;
  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, trunks: s.trunks, vegeta: s.vegeta, piccolo: s.piccolo, krillin: s.krillin, gohan: s.gohan, yamcha: s.yamcha, tien: s.tien, bulma: s.bulma, fgohan: s.fgohan, a17: s.a17, a18: s.a18 };
  };
  const ground = (ctx, v) => K().ground(ctx.m.battle, v);
  // the heart medicine: a small vial held upright in a fist, red cap up
  const MED = { id: 'medicine', shape: 'bottle', pos: [0, -0.07, -0.05], rot: [Math.PI, 0, 0], color: 0xdff0f4, cap: 0xd8342a, scale: 1.5 };

  /* ================================================================ goku_waiting */

  S.goku_waiting = {
    id: 'goku_waiting',
    cast,
    music: { song: 'farewell', level: 1 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), w = W().WAIT;
          K().place(s.trunks, ground(ctx, w.clone().add(new V3(6, 0, 3))));
          K().faceTo(s.trunks, W().LANDING);
          K().pose(s.trunks, 'ft_armsCrossed', 'calm');
          K().sheathe(s.trunks, true);
          s.crowd.forEach((f, i) => {
            K().place(f, ground(ctx, w.clone().add(new V3(-5 + (i % 4) * 2.2, 0, -1 + Math.floor(i / 4) * 2.4))));
            K().faceTo(f, i % 2 ? s.trunks.pos : W().LANDING);
          });
          K().place(s.vegeta, ground(ctx, w.clone().add(new V3(-9, 0, 4))));
          K().faceTo(s.vegeta, s.trunks.pos);
          K().pose(s.vegeta, 'armsCrossed', 'angry');
          K().pose(s.piccolo, 'armsCrossed', 'neutral');
          K().pose(s.krillin, 'idle', 'neutral');
          K().pose(s.gohan, 'idle', 'neutral');
          K().pose(s.yamcha, 'idle', 'neutral');
          K().pose(s.tien, 'armsCrossed', 'neutral');
          K().pose(s.bulma, 'bu_idle', 'neutral');
        },
        cam: { from: { at: 'trunks', off: [10, 3.2, 12] }, to: { at: 'trunks', off: [8, 2.4, 10] }, look: { at: 'krillin', off: [0, 0.4, 0] }, fov: 50, fov2: 46, ease: 'inOut' },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'krillin', local: [0.7, 0.35, 2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'Three hours, he said. He hasn’t said one other word since.', duration: 3.2 },
        hold: 3.3,
      },
      // Bulma notices what nobody else does
      {
        pose: [{ who: 'bulma', pose: 'bu_curious', face: 'grin' }],
        call: (ctx) => K().faceTo(st(ctx).bulma, st(ctx).trunks.pos),
        cam: { from: { at: 'bulma', local: [0.8, 0.3, 2.1] }, look: { at: 'bulma', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'bulma', line: 'Hey — that’s the Capsule Corporation logo on your jacket. Where did you get that?', duration: 3.6 },
        hold: 3.7,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'shock', speed: 8 }],
        call: (ctx) => K().faceTo(st(ctx).trunks, st(ctx).bulma.pos),
        cam: { from: { at: 'trunks:face', local: [0.15, 0, 1.05] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'I— it was a gift. From someone I know.', duration: 2.6, style: 'quiet' },
        hold: 2.7,
      },
      // and he looks at her a moment longer than a stranger would
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'soft' }],
        cam: { from: { at: 'trunks', local: [-0.6, 0.5, -1.4] }, look: { at: 'bulma', off: [0, 0.35, 0] }, fov: 40 },
        hold: 1.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { from: { at: 'vegeta', local: [0.8, 0.3, 2.2] }, look: { at: 'vegeta', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'A Super Saiyan who comes from nowhere and knows where Kakarot will land. I don’t like it.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm' }],
        call: (ctx) => K().faceTo(st(ctx).trunks, W().LANDING),
        cam: { from: { at: 'trunks', local: [0.9, 0.4, 2.3] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'He will be here in a moment.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.waited = true;
      ctx.m.flags.logoSeen = true;
    },
  };

  /* ================================================================ goku_lands */

  S.goku_lands = {
    id: 'goku_lands',
    cast,
    music: { song: 'battle', level: 1 },
    events: [
      // a light in the sky, coming down fast
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.podTo = ground(ctx, W().LANDING).add(new V3(0, 1.1, 0));
          ctx.podFrom = ctx.podTo.clone().add(new V3(-60, 120, -30));
          s.pod.group.visible = true;
          s.pod.group.position.copy(ctx.podFrom);
          ctx.podN = 0;
          for (const f of s.crowd) K().faceTo(f, ctx.podTo);
          K().pose(s.krillin, 'idle', 'shock');
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.podN++;
          const k = Math.min(1, ctx.podN / 120);
          s.pod.group.position.copy(ctx.podFrom.clone().lerp(ctx.podTo, k * k));
          if (ctx.podN % 2 === 0) b.vfx.trail(s.pod.group.position.clone(), 0xffe0b0, 1.4, 0.5);
        },
        cam: { from: { at: 'krillin', local: [0.3, -0.2, -1.4] }, look: { at: [20, 60, 30] }, look2: { at: [34, 4, 52] }, fov: 54, fov2: 46 },
        hold: 2,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          s.pod.group.position.copy(ctx.podTo);
          s.pod.pos.copy(ctx.podTo);
          b.stage.crater(ground(ctx, W().LANDING), 5, 1.2, null);
          ctx.m.flags.crater = true;
          b.vfx.dust(ctx.podTo.clone(), 7, 22);
          b.vfx.explosion(ctx.podTo.clone(), 3, 0xffd0a0, { smoke: true });
          b.cameraTraumaAt(ctx.podTo, 0.8);
        },
        sfx: { name: 'explosionBig', vol: 1, pitch: 0.6 },
        cam: { from: { at: [26, 3, 40] }, look: { at: [34, 1, 52] }, fov: 50 },
        hold: 1.8,
      },
      // everybody runs to the edge
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.run = s.crowd.map((f, i) => ({ f, from: f.pos.clone(), to: ground(ctx, W().LANDING.clone().add(new V3(-5 + i * 1.7, 0, -7 + (i % 2) * 1.4))) }));
          ctx.runN = 0;
          for (const r of ctx.run) K().pose(r.f, 'run', 'shock', 10);
        },
        tick: (ctx) => {
          ctx.runN++;
          const k = U.easeInOutCubic(Math.min(1, ctx.runN / 110));
          for (const r of ctx.run) {
            const p = r.from.clone().lerp(r.to, k);
            p.y = ctx.m.battle.stage.heightAt(p.x, p.z);
            r.f.setPosition(p);
            r.f.prevPos.copy(r.f.pos);
            K().faceTo(r.f, W().LANDING);
          }
        },
        cam: { from: { at: [32, 2.4, 42] }, look: { at: [28, 1, 44] }, fov: 50 },
        hold: 1.9,
      },
      // the hatch, and a man in strange clothes climbing out
      {
        call: (ctx) => {
          const s = st(ctx), g = s.goku;
          for (const r of ctx.run || []) {
            K().place(r.f, r.to);
            K().faceTo(r.f, W().LANDING);
            K().pose(r.f, 'idle', 'shock');
          }
          g.setHidden(false);
          K().place(g, ground(ctx, W().LANDING.clone().add(new V3(0, 0, -1.6))));
          K().faceTo(g, s.krillin.pos);
          K().pose(g, 'idle', 'grin');
          ctx.m.battle.sfx('capsulePop', g, { vol: 0.6, pitch: 0.8 });
        },
        cam: { from: { at: 'goku', local: [0.5, -0.2, 2.8] }, to: { at: 'goku', local: [0.4, 0, 2.1] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 42, fov2: 36 },
        say: { who: 'goku', line: 'Huh? Hey, everybody! How’d you all know I’d land right here?', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'gohan', pose: 'run', face: 'grin', speed: 12 }],
        move: { who: 'gohan', at: 'goku', off: [0.9, 0, -0.9], seconds: 0.9 },
        cam: { from: { at: 'goku', local: [2.2, 0.3, 3.2] }, look: { at: 'goku', off: [0, 0, 0] }, fov: 44 },
        say: { who: 'kid_gohan', line: 'Dad!', duration: 1.4, style: 'shout' },
      },
      {
        pose: [
          { who: 'gohan', pose: 'idle', face: 'grin' },
          { who: 'goku', pose: 'idle', face: 'grin' },
        ],
        cam: { from: { at: 'krillin', local: [0.6, 0.3, 2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'We didn’t. HE did. That kid knew where and when, right down to the minute.', duration: 3.6 },
        hold: 3.7,
      },
      {
        call: (ctx) => K().faceTo(st(ctx).goku, st(ctx).trunks.pos),
        cam: { from: { at: 'goku', local: [0.8, 0.35, 2.2] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'goku', line: 'I felt Frieza on the way in — and then I didn’t. Something bigger than him stopped him.', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { from: { at: 'krillin', local: [0.6, 0.3, 2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'Him! He turned Super Saiyan, Goku. He cut Frieza into pieces.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku:face', local: [0.15, 0, 1.1] }, look: { at: 'goku:face' }, fov: 34 },
        say: { who: 'goku', line: 'Another Super Saiyan? Really? Wow...', duration: 2.6 },
        hold: 2.7,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.m.battle;
      s.pod.group.visible = true;
      s.pod.group.position.copy(ground(ctx, W().LANDING).add(new V3(0, 1.1, 0)));
      s.pod.pos.copy(s.pod.group.position);
      if (!ctx.m.flags.crater) {
        b.stage.crater(ground(ctx, W().LANDING), 5, 1.2, null);
        ctx.m.flags.crater = true;
      }
      s.goku.setHidden(false);
      s.goku.untargetable = false;
      s.crowd.forEach((f, i) => {
        K().place(f, ground(ctx, W().LANDING.clone().add(new V3(-5 + i * 1.7, 0, -7 + (i % 2) * 1.4))));
        K().faceTo(f, W().LANDING);
      });
      K().place(s.gohan, ground(ctx, W().LANDING.clone().add(new V3(0.9, 0, -2.5))));
      K().place(s.goku, ground(ctx, W().LANDING.clone().add(new V3(0, 0, -1.6))));
      K().faceTo(s.goku, s.krillin.pos);
      if (s.trunks.pos.distanceTo(W().LANDING) > 14) {
        K().place(s.trunks, ground(ctx, W().LANDING.clone().add(new V3(6, 0, -8))));
      }
      K().faceTo(s.trunks, s.goku.pos);
      ctx.m.flags.gokuArrived = true;
    },
  };

  /* ================================================================ goku_yardrat */

  S.goku_yardrat = {
    id: 'goku_yardrat',
    cast,
    music: { song: 'peaceful', level: 2 },
    events: [
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku', local: [1, 0.35, 2.4] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'yamcha', line: 'Where have you BEEN? Namek blew up a year ago!', duration: 2.8 },
        hold: 2.9,
      },
      {
        cam: { from: { at: 'goku:face', local: [0.2, 0, 1.15] }, look: { at: 'goku:face' }, fov: 36 },
        say: { who: 'goku', line: 'I got off in one of the Ginyu Force’s pods just before it went. Came down on a planet called Yardrat.', duration: 4.2 },
        hold: 4.3,
      },
      {
        cam: { from: { at: 'goku', local: [0.8, 0.3, 2.2] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'goku', line: 'The people there patched me up, and they taught me something neat. Watch this.', duration: 3.6 },
        hold: 3.7,
      },
      // the player shows them
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'calm', speed: 10 }],
        cam: { from: { at: 'goku', local: [1.3, 0.4, 2.8] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 42 },
        cue: { key: 's2', label: 'Instant Transmission', auto: 8 },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, g = s.goku;
          b.vfx.afterimage(g.pos, 1.8, 0xdff2ff);
          b.vfx.ring(g.chest(), 3, 0xdff2ff, 0.4);
          b.sfx('itPop', g, { vol: 1 });
          ctx.gokuAt = g.pos.clone();
          g.setHidden(true);
          ctx.m.flags.itShown = true;
        },
        cam: { from: { at: 'krillin', local: [0.6, 0.35, 2.2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'He’s gone! Where’d he—', duration: 1.8, style: 'shout' },
        hold: 1.9,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'shock' }],
        cam: { from: { at: 'piccolo', local: [0.7, 0.4, 2.2] }, look: { at: 'piccolo', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'piccolo', line: 'His ki is on the other side of the world. Kame House. He did not fly there.', duration: 3.4, style: 'quiet' },
        hold: 3.5,
      },
      // and back, in somebody else's sunglasses
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, g = s.goku;
          g.setHidden(false);
          K().place(g, ctx.gokuAt || g.pos);
          b.vfx.ring(g.chest(), 3, 0xdff2ff, 0.4);
          b.sfx('itPop', g, { vol: 1 });
          if (g.model.addProp) g.model.addProp({ id: 'shades', shape: 'glasses', joint: 'head', pos: [0, (g.model.b.headR || 0.14) * 0.95 + 0.014, (g.model.b.headR || 0.14) * 0.97], rot: [0, 0, 0] });
          K().pose(g, 'idle', 'grin');
        },
        cam: { from: { at: 'goku:face', local: [0.15, 0, 1.2] }, look: { at: 'goku:face' }, fov: 36 },
        say: { who: 'goku', line: 'Ta-da! I just popped over to Master Roshi’s for a second. Look!', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'krillin', local: [0.6, 0.3, 2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'Those are Master Roshi’s sunglasses! Ha! He’s gonna be looking for those all week!', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { from: { at: 'vegeta', local: [0.8, 0.35, 2.4] }, look: { at: 'vegeta', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Tch. Parlour tricks.', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
    ],
    end(ctx) {
      const s = st(ctx), g = s.goku;
      g.setHidden(false);
      if (ctx.gokuAt) K().place(g, ctx.gokuAt);
      if (g.model.addProp && !(g.model.props && g.model.props.shades)) g.model.addProp({ id: 'shades', shape: 'glasses', joint: 'head', pos: [0, (g.model.b.headR || 0.14) * 0.95 + 0.014, (g.model.b.headR || 0.14) * 0.97], rot: [0, 0, 0] });
      ctx.m.flags.itShown = true;
      ctx.m.flags.shades = true;
    },
  };

  /* ================================================================ trunks_aside */

  S.trunks_aside = {
    id: 'trunks_aside',
    cast,
    music: { song: 'farewell', level: 1 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm' }],
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.trunks, s.goku.pos);
          if (s.goku.model.removeProp) s.goku.model.removeProp('shades');
        },
        cam: { from: { at: 'trunks', local: [0.9, 0.4, 2.3] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'Son Goku. Could I speak with you? Alone.', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'goku', local: [0.8, 0.3, 2.2] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Sure. Be right back, guys.', duration: 2, style: 'quiet' },
        hold: 2.1,
      },
      // the two of them walk off, far enough that nobody should hear
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.walk = [
            { f: s.goku, from: s.goku.pos.clone(), to: ground(ctx, W().ASIDE.clone().add(new V3(0, 0, 3))) },
            { f: s.trunks, from: s.trunks.pos.clone(), to: ground(ctx, W().ASIDE.clone().add(new V3(0, 0, -3))) },
          ];
          ctx.walkN = 0;
          K().pose(s.goku, 'ft_walk' in (s.goku.poses || {}) ? 'ft_walk' : 'run', 'calm', 5);
          K().pose(s.trunks, 'ft_walk', 'calm', 8);
        },
        tick: (ctx) => {
          ctx.walkN++;
          const k = U.easeInOutCubic(Math.min(1, ctx.walkN / 170));
          for (const w of ctx.walk) {
            const p = w.from.clone().lerp(w.to, k);
            p.y = ctx.m.battle.stage.heightAt(p.x, p.z);
            w.f.setPosition(p);
            w.f.prevPos.copy(w.f.pos);
            K().faceTo(w.f, w.to.clone().add(w.to.clone().sub(w.from)));
          }
        },
        cam: { from: { at: 'vegeta', local: [-0.6, 0.6, -1.6] }, look: { at: [52, 2, 78] }, fov: 44 },
        hold: 2.9,
      },
      // one of them is listening anyway
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'calm' }],
        cam: { from: { at: 'piccolo:face', local: [0.35, 0.02, 0.9] }, look: { at: 'piccolo:face' }, fov: 34 },
        hold: 2,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.goku.model.removeProp) s.goku.model.removeProp('shades');
      K().place(s.goku, ground(ctx, W().ASIDE.clone().add(new V3(0, 0, 3))));
      K().place(s.trunks, ground(ctx, W().ASIDE.clone().add(new V3(0, 0, -3))));
      K().faceTo(s.goku, s.trunks.pos);
      K().faceTo(s.trunks, s.goku.pos);
      K().pose(s.goku, 'idle', 'calm');
      K().pose(s.trunks, 'ft_calm', 'calm');
      ctx.m.flags.aside = true;
    },
  };

  /* ================================================================ the finger test */

  S.finger_test_open = {
    id: 'finger_test_open',
    cast,
    music: { song: 'battle', level: 2 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm' }],
        cam: { from: { at: 'trunks', local: [0.9, 0.4, 2.3] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'Before I say anything, I have to be sure. Would you turn Super Saiyan for me?', duration: 3.6, style: 'quiet' },
        hold: 3.7,
      },
      {
        pose: [{ who: 'goku', pose: 'powerUp', face: 'shout', speed: 16 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, g = s.goku;
          K().toForm(g, 'ssj');
          b.vfx.ring(g.pos.clone().add(new V3(0, 0.3, 0)), 7, 0xffe060, 0.5, new V3(0, 1, 0));
          b.vfx.explosion(g.chest(), 2.2, 0xffe060, { smoke: false });
          b.sfx('transformBurst', g, { vol: 0.8 });
          b.cameraTraumaAt(g.pos, 0.35);
        },
        cam: { from: { at: 'goku', local: [1.4, 0.2, 3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 44 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_tfBurst', face: 'shout', speed: 18 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          K().toForm(t, 'ssj');
          b.vfx.ring(t.pos.clone().add(new V3(0, 0.3, 0)), 7, 0xffc81e, 0.5, new V3(0, 1, 0));
          b.vfx.explosion(t.chest(), 2.2, 0xffc81e, { smoke: false });
          b.sfx('transformBurst', t, { vol: 0.8 });
        },
        cam: { from: { at: 'trunks', local: [1.2, 0.2, 2.8] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 44 },
        hold: 1.2,
      },
      // the sword comes out
      {
        pose: [{ who: 'trunks', pose: 'ft_draw', face: 'grit', speed: 12 }],
        call: (ctx) => {
          ctx.drawN = 0;
        },
        tick: (ctx) => {
          ctx.drawN++;
          if (ctx.drawN === 14) {
            const t = st(ctx).trunks;
            K().sheathe(t, false);
            K().pose(t, 'ft_drawOut', 'grit', 16);
            ctx.m.battle.sfx('swordDraw', t, { vol: 1 });
          }
        },
        cam: { from: { at: 'trunks', local: [-0.8, 0.6, 1.6] }, look: { at: 'trunks', off: [-0.1, 0.6, 0] }, fov: 42 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'trunks', local: [-0.7, 0.5, -1.6] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'future_trunks', line: 'I am not going to hold back. Please — don’t move.', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'g_finger', face: 'calm' }],
        cam: { from: { at: 'goku', local: [0.9, 0.35, 2.3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Okay. Go ahead.', duration: 1.8, style: 'quiet' },
        hold: 1.9,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      K().toForm(s.goku, 'ssj');
      K().toForm(s.trunks, 'ssj');
      K().sheathe(s.trunks, false);
      K().pose(s.goku, 'g_finger', 'calm');
      ctx.m.flags.testStarted = true;
    },
  };

  S.finger_test_end = {
    id: 'finger_test_end',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      // he lowers the sword
      {
        pose: [
          { who: 'trunks', pose: 'ft_ready', face: 'shock', speed: 6 },
          { who: 'goku', pose: 'g_finger', face: 'calm' },
        ],
        cam: { from: { at: 'trunks:face', local: [0.15, 0, 1.05] }, look: { at: 'trunks:face' }, fov: 34 },
        hold: 1.8,
      },
      {
        cam: { from: { at: 'goku:face', local: [-0.15, 0, 1.1] }, look: { at: 'goku:face' }, fov: 34 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_sheathe', face: 'calm', speed: 8 }],
        call: (ctx) => (ctx.sN = 0),
        tick: (ctx) => {
          ctx.sN++;
          if (ctx.sN === 30) {
            const t = st(ctx).trunks;
            K().sheathe(t, true);
            ctx.m.battle.sfx('swordSheathe', t, { vol: 1 });
          }
        },
        cam: { from: { at: 'trunks', local: [1, 0.4, 2.3] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'It’s true. Everything they told me about you is true.', duration: 3.2, style: 'quiet' },
        hold: 3.3,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          K().toForm(s.goku, 'base');
          K().toForm(s.trunks, 'base');
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku', local: [0.9, 0.35, 2.3] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'goku', line: 'You’re strong. And you were still holding back on that last one, weren’t you?', duration: 3.6 },
        hold: 3.7,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      K().toForm(s.goku, 'base');
      K().toForm(s.trunks, 'base');
      K().sheathe(s.trunks, true);
      ctx.m.flags.testPassed = true;
    },
  };

  /* ================================================================ trunks_identity */

  S.trunks_identity = {
    id: 'trunks_identity',
    cast,
    music: { song: 'mystery', level: 2 },
    events: [
      {
        pose: [
          { who: 'trunks', pose: 'ft_calm', face: 'calm' },
          { who: 'goku', pose: 'idle', face: 'calm' },
        ],
        mood: { amount: 0.22, color: 0x2a3450, seconds: 1.6 },
        cam: { from: { at: 'trunks', local: [1, 0.4, 2.6] }, to: { at: 'trunks', local: [0.8, 0.4, 2.1] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40, fov2: 36 },
        say: { who: 'future_trunks', line: 'Please keep this from the others. My name is Trunks. I haven’t been born yet.', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { from: { at: 'trunks:face', local: [0.15, 0, 1] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'I came here in a time machine, from twenty years in the future. I am Vegeta’s son.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'goku:face', local: [0.2, 0, 1.15] }, look: { at: 'goku:face' }, fov: 36 },
        say: { who: 'goku', line: 'Vegeta’s?!', duration: 1.6, style: 'shout' },
        hold: 1.7,
      },
      // and he looks back at the rock, where two people are standing a long way apart
      {
        call: (ctx) => {
          const s = st(ctx);
          K().pose(s.vegeta, 'armsCrossed', 'angry');
          K().pose(s.bulma, 'bu_idle', 'neutral');
        },
        cam: { from: { at: 'goku', local: [-0.5, 0.6, -1.4] }, look: { at: 'vegeta', off: [2, 0.6, 0] }, fov: 34 },
        hold: 1.8,
      },
      {
        cam: { from: { at: 'trunks', local: [0.8, 0.35, 2.2] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'future_trunks', line: 'And Bulma’s.', duration: 1.8, style: 'quiet' },
        hold: 1.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku', local: [0.8, 0.35, 2.2] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'goku', line: 'Vegeta and Bulma... Heh. Didn’t see that one coming.', duration: 3 },
        hold: 3.1,
      },
    ],
    end(ctx) {
      ctx.m.flags.identity = true;
    },
    clearMood: false,
  };

  /* ================================================================ trunks_future (the memory) */

  // where things stand in the ruined city (it has a plaza at its centre)
  const RUIN = { street: new V3(0, 0, 18), gohan: new V3(-2, 0, 4), boy: new V3(2, 0, 6), a17: new V3(-14, 16, -24), a18: new V3(-9, 18, -26) };

  S.trunks_future = {
    id: 'trunks_future',
    cast,
    music: { song: 'aftermath', level: 1 },
    events: [
      // in the present: where it starts
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'soft' }],
        cam: { from: { at: 'trunks:face', local: [0.2, 0, 1.1] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'In my time you never get to fight what’s coming. A heart virus. There is no cure for it yet.', duration: 4.6, style: 'quiet' },
        hold: 4.7,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'goku:face', local: [-0.15, 0, 1.1] }, look: { at: 'goku:face' }, fov: 34 },
        hold: 1.8,
      },
      // into his memory
      {
        fade: { to: 'black', seconds: 0.8 },
        hold: 0.9,
      },
      {
        call: (ctx) => {
          const b = ctx.m.battle, s = st(ctx);
          b.changeStage('future_ruins');
          SL.ScreenFX.vision(0.55);
          b.sfx('visionIn', null, { vol: 0.8 });
          // the living of the present are not in this world
          for (const f of [s.goku, s.vegeta, s.piccolo, s.krillin, s.gohan, s.yamcha, s.tien, s.bulma]) f.setHidden(true);
          b.stage.setMood(0.4, 0x202430, 1);
          if (b.stage.devastate) b.stage.devastate(new V3(0, 0, 0), { radius: 70, craters: 0, slabs: 18, vents: 7, scorch: 0.25, spires: false, mood: false, seed: 2024 });
          const t = s.trunks;
          K().place(t, ground(ctx, RUIN.street));
          K().faceTo(t, new V3(0, 0, -10));
          K().toForm(t, 'base');
          K().pose(t, 'ft_walk', 'soft', 5);
        },
        fade: { to: 'clear', seconds: 1.2 },
        music: { song: 'vision', level: 1 },
        cam: { from: { at: [10, 3, 30] }, to: { at: [6, 2.4, 26] }, look: { at: 'trunks', off: [0, 1, 0] }, fov: 52, fov2: 48 },
        say: { who: 'future_trunks', line: 'Half a year later, two Androids appeared. Seventeen and Eighteen. Dr. Gero built them.', duration: 4.6, style: 'quiet' },
        hold: 4.7,
      },
      // the two of them over a burning city
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          for (const [f, at] of [[s.a17, RUIN.a17], [s.a18, RUIN.a18]]) {
            f.setHidden(false);
            K().float(f, at.clone());
            K().faceTo(f, new V3(0, 0, 0));
            K().pose(f, 'flyIdle', 'calm');
          }
          ctx.fallN = 0;
          ctx.falls = b.stage.obstacles.filter((o) => o.alive && o.building).slice(0, 6);
        },
        tick: (ctx) => {
          const b = ctx.m.battle;
          ctx.fallN++;
          if (ctx.fallN % 40 === 10 && ctx.falls.length) {
            const o = ctx.falls.shift();
            b.stage.destroyPillar(o);
          }
          if (ctx.fallN % 24 === 0) b.vfx.explosion(new V3(-30 + (ctx.fallN % 60), 6, -40), 4, 0xff8a3a, { smoke: true });
        },
        cam: { from: { at: 'a18', off: [14, -8, 16] }, look: { at: 'a17', off: [0, -2, 0] }, fov: 50 },
        say: { who: 'future_trunks', line: 'They killed Vegeta. Piccolo. Krillin. All of them, one after another.', duration: 4.2, style: 'quiet' },
        hold: 4.3,
      },
      // the one who survived, and taught him
      {
        call: (ctx) => {
          const s = st(ctx);
          s.a17.setHidden(true);
          s.a18.setHidden(true);
          const fg = s.fgohan;
          fg.setHidden(false);
          K().place(fg, ground(ctx, RUIN.gohan));
          K().place(s.trunks, ground(ctx, RUIN.boy));
          K().faceTo(fg, s.trunks.pos);
          K().faceTo(s.trunks, fg.pos);
          K().pose(fg, 'fg_teach', 'soft');
          K().pose(s.trunks, 'ft_calm', 'soft');
        },
        cam: { from: { at: 'fgohan', local: [1.8, 0.2, 3.2] }, look: { at: 'fgohan', off: [0.8, 0.3, 0] }, fov: 42 },
        say: { who: 'future_trunks', line: 'Only Gohan lived. He lost his arm to them. He trained me anyway.', duration: 4.2, style: 'quiet' },
        hold: 4.3,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          K().toForm(s.fgohan, 'ssj');
          b.vfx.ring(s.fgohan.pos.clone().add(new V3(0, 0.3, 0)), 5, 0xffe060, 0.5, new V3(0, 1, 0));
          K().pose(s.fgohan, 'fg_stance', 'angry');
          K().faceTo(s.fgohan, RUIN.a17);
        },
        cam: { from: { at: 'fgohan', local: [0.9, 0.2, 2.4] }, look: { at: 'fgohan', off: [0, 0.4, 0] }, fov: 40 },
        hold: 2.4,
      },
      // and then the day he did not come back
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          K().toForm(s.fgohan, 'base');
          K().place(s.fgohan, ground(ctx, RUIN.gohan.clone().add(new V3(0, 0, -4))));
          K().pose(s.fgohan, 'fg_fallen', 'ko');
          K().place(s.trunks, ground(ctx, RUIN.gohan.clone().add(new V3(1.4, 0, -1.8))));
          K().faceTo(s.trunks, s.fgohan.pos);
          K().pose(s.trunks, 'ft_kneel', 'hurt');
          b.stage.setMood(0.62, 0x101420, 1.2);
        },
        music: { song: null, level: 0 },
        cam: { from: { at: 'trunks', off: [5, 3.6, 5] }, look: { at: 'fgohan', off: [0, 0, 0] }, fov: 48 },
        say: { who: 'future_trunks', line: 'Then they killed him too.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // the scream that turned him gold
      {
        pose: [{ who: 'trunks', pose: 'ft_scream', face: 'shout', speed: 10 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          ctx.flN = 0;
          b.sfx('ssjRise', t, { vol: 1 });
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          ctx.flN++;
          if (ctx.flN % 5 === 0) t.model.setForm(ctx.flN % 10 === 0 ? t.def.forms[1] : t.def.forms[0]);
          if (ctx.flN % 6 === 0) b.vfx.bolt(t.chest().add(new V3(((ctx.flN * 7) % 5) * 0.2 - 0.4, 0.3, 0)), 1.2, 0xfff3a0);
          if (ctx.flN === 90) {
            K().toForm(t, 'ssj');
            b.vfx.ring(t.pos.clone().add(new V3(0, 0.3, 0)), 8, 0xffc81e, 0.6, new V3(0, 1, 0));
            b.vfx.explosion(t.chest(), 3, 0xffc81e, { smoke: false });
            b.sfx('transformBurst', t, { vol: 0.9 });
          }
        },
        cam: { from: { at: 'trunks', local: [0.4, -0.3, 2.2] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 46 },
        hold: 2.6,
      },
      // alone
      {
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          s.fgohan.setHidden(true);
          K().toForm(t, 'base');
          K().place(t, ground(ctx, new V3(0, 0, 0)));
          K().pose(t, 'ft_calm', 'soft');
          K().faceTo(t, new V3(0, 0, -30));
          ctx.m.battle.stage.setMood(0.45, 0x202430, 1.4);
        },
        music: { song: 'vision', level: 1 },
        cam: { from: { at: 'trunks', off: [0, 14, 22] }, to: { at: 'trunks', off: [0, 20, 30] }, look: { at: 'trunks', off: [0, 0, 0] }, fov: 50, fov2: 54, ease: 'inOut' },
        say: { who: 'future_trunks', line: 'I’m all that’s left. Me and my mother. That’s the future you’re walking into.', duration: 4.6, style: 'quiet' },
        hold: 4.7,
      },
      {
        fade: { to: 'black', seconds: 0.9 },
        hold: 1,
      },
    ],
    end(ctx) {
      const b = ctx.m.battle, s = st(ctx);
      if (b.stage.def.id !== 'coast') b.changeStage('coast');
      SL.ScreenFX.vision(0);
      for (const f of [s.goku, s.vegeta, s.piccolo, s.krillin, s.gohan, s.yamcha, s.tien, s.bulma]) f.setHidden(false);
      for (const f of [s.fgohan, s.a17, s.a18]) f.setHidden(true);
      K().toForm(s.trunks, 'base');
      ctx.m.fade('clear', 0.8);
      ctx.m.flags.futureSeen = true;
    },
  };

  S.trunks_future_back = {
    id: 'trunks_future_back',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'soft' }],
        fade: { to: 'clear', seconds: 1 },
        cam: { from: { at: 'trunks:face', local: [0.2, -0.02, 1.2] }, to: { at: 'trunks:face', local: [0.15, -0.02, 0.95] }, look: { at: 'trunks:face' }, fov: 34 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'goku:face', local: [-0.2, 0, 1.15] }, look: { at: 'goku:face' }, fov: 34 },
        say: { who: 'goku', line: 'A heart virus. Huh. That’s a rotten way to go out.', duration: 3, style: 'quiet' },
        hold: 3.1,
      },
    ],
    end(ctx) {
      ctx.m.flags.futureTold = true;
    },
  };

  /* ================================================================ trunks_medicine */

  S.trunks_medicine = {
    id: 'trunks_medicine',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_giveMed', face: 'calm', speed: 6 }],
        call: (ctx) => {
          const t = st(ctx).trunks;
          if (t.model.addProp) t.model.addProp(Object.assign({ joint: 'handL' }, MED));
        },
        cam: { from: { at: 'trunks', local: [0.9, 0.3, 1.8] }, look: { at: 'trunks', off: [0, 0.1, 0.5] }, fov: 38 },
        say: { who: 'future_trunks', line: 'This is medicine for it. It doesn’t exist yet in your time.', duration: 3.2, style: 'quiet' },
        cue: { key: 'light', label: 'Hand it to him', auto: 10 },
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.trunks.model.removeProp) s.trunks.model.removeProp('medicine');
          const med = s.goku.model.addProp && s.goku.model.addProp(Object.assign({ joint: 'handR' }, MED));
          // the bottle is what the camera looks at: from Trunks' side, a little right, his face above it
          const medAt = () => (med ? med.getWorldPosition(new V3()) : s.goku.chest());
          ctx.cast.medcam = { chest: () => {
            const toT = s.trunks.pos.clone().sub(s.goku.pos).setY(0).normalize();
            return medAt().addScaledVector(toT, 0.7).addScaledVector(new V3(toT.z, 0, -toT.x), 0.25).add(new V3(0, 0.05, 0));
          } };
          ctx.cast.medlook = { chest: () => medAt().lerp(s.goku.model.joints.head.getWorldPosition(new V3()), 0.35) };
          K().pose(s.goku, 'g_lookMed', 'calm');
          K().pose(s.trunks, 'ft_calm', 'calm');
          ctx.m.flags.medicineGiven = true;
        },
        cam: { from: { at: 'medcam' }, look: { at: 'medlook' }, fov: 34 },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'trunks', local: [0.9, 0.35, 2.2] }, look: { at: 'trunks', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'future_trunks', line: 'When your heart starts to hurt, take it. Don’t wait.', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        cam: { from: { at: 'goku:face', local: [-0.15, 0, 1.05] }, look: { at: 'goku:face' }, fov: 34 },
        say: { who: 'goku', line: '...Thanks. I owe you one.', duration: 2.4, style: 'quiet' },
        hold: 2.5,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.trunks.model.removeProp) s.trunks.model.removeProp('medicine');
      if (s.goku.model.removeProp) s.goku.model.removeProp('medicine');
      K().pose(s.goku, 'idle', 'calm');
      ctx.m.flags.medicineGiven = true;
    },
  };

  /* ================================================================ trunks_warning */

  S.trunks_warning = {
    id: 'trunks_warning',
    cast,
    music: { song: 'ominous', level: 3 },
    events: [
      // he kneels and draws it into the ground with the tip of the sword
      {
        pose: [{ who: 'trunks', pose: 'ft_scratch', face: 'calm', speed: 6 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          K().sheathe(t, false);
          const fw = new V3(Math.sin(t.yaw), 0, Math.cos(t.yaw));
          const at = ground(ctx, t.pos.clone().addScaledVector(fw, 1.4));
          s.map = K().sandMap(b, at, t.yaw + Math.PI);
          ctx.mapN = 0;
        },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.mapN++;
          if (s.map) s.map.reveal(Math.min(1, ctx.mapN / 300));
          if (ctx.mapN % 20 === 0) ctx.m.battle.sfx('swing', s.trunks, { vol: 0.2, pitch: 2 });
        },
        cam: { from: { at: 'trunks', local: [0.8, 1.4, 2.8] }, look: { at: 'trunks', local: [0, -0.9, 1.4] }, fov: 44 },
        say: { who: 'future_trunks', line: 'Three years from now. May twelfth, Age 767. Ten in the morning.', duration: 3.8, style: 'quiet' },
        hold: 3.9,
      },
      {
        tick: (ctx) => {
          const s = st(ctx);
          ctx.mapN++;
          if (s.map) s.map.reveal(Math.min(1, ctx.mapN / 300));
        },
        title: { chapter: 'MAY 12 · AGE 767', title: '10:00 AM', subtitle: 'Nine miles south-west of South City', duration: 3.6 },
        cam: { from: { at: 'trunks', local: [0.1, 2.6, 1.8] }, look: { at: 'trunks', local: [0, -0.9, 1.6] }, fov: 40 },
        say: { who: 'future_trunks', line: 'Here. An island, nine miles south-west of South City.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.map) s.map.reveal(1);
        },
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'grit' }],
        cam: { from: { at: 'trunks:face', local: [0.15, 0, 1] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'Two Androids. Seventeen and Eighteen. Dr. Gero’s. They’re stronger than anything you have ever fought.', duration: 4.6, style: 'quiet' },
        hold: 4.7,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'goku', local: [0.9, 0.35, 2.2] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'goku', line: 'Stronger than anything, huh...', duration: 2.2, style: 'quiet' },
        hold: 2.3,
      },
      // and there it is: he cannot help it
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku:face', local: [0.2, 0, 1.1] }, look: { at: 'goku:face' }, fov: 34 },
        say: { who: 'goku', line: 'Three years to get ready for them. I’ll be there.', duration: 2.8 },
        hold: 2.9,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.map) s.map.reveal(1);
      K().sheathe(s.trunks, true);
      ctx.m.flags.warningGiven = true;
      ctx.m.flags.deadline = 'Age 767, May 12th';
      ctx.m.flags.place = 'nine miles south-west of South City';
    },
  };

  /* ================================================================ trunks_departs */

  S.trunks_departs = {
    id: 'trunks_departs',
    cast,
    music: { song: 'farewell', level: 3 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_bow', face: 'calm' }],
        cam: { from: { at: 'trunks', local: [0.9, 0.35, 2.4] }, look: { at: 'trunks', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'I have to go back. My mother is waiting, and the machine only has fuel for the return.', duration: 3.8, style: 'quiet' },
        hold: 3.9,
      },
      // the capsule, and the machine out of it
      {
        pose: [{ who: 'trunks', pose: 'ft_throwCapsule', face: 'calm', speed: 10 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          const fw = new V3(Math.sin(t.yaw + 1.2), 0, Math.cos(t.yaw + 1.2));
          const at = ground(ctx, t.pos.clone().addScaledVector(fw, 4.5));
          s.machine = K().timeMachine(b, at.clone().add(new V3(0, 1.35 * 1.33, 0)));
          s.machine.pos.copy(s.machine.group.position);
          b.vfx.dust(at, 2.8, 18, 0xf2f2ee);
          b.vfx.flash(s.machine.pos, 2.4, 0xffffff, 0.16, SL.Toon.tex.glow);
          b.sfx('capsulePop', t, { vol: 1 });
        },
        cam: { from: { at: 'trunks', off: [5, 2, 6] }, look: { at: 'trunks', off: [2, 0.6, 0] }, fov: 46 },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          K().place(t, s.machine.pos.clone().add(new V3(0, s.machine.data.seat || 0, 0)));
          t.grounded = false;
          K().faceTo(t, s.goku.pos);
          K().pose(t, 'ft_pilot', 'calm');
          ctx.shutN = 0;
          if (s.machine.data.open) s.machine.data.open(1);
        },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.shutN++;
          if (s.machine.data.open) s.machine.data.open(1 - Math.min(1, ctx.shutN / 60));
        },
        cam: { from: { at: 'trunks', local: [0.4, 0.2, 3.2] }, look: { at: 'trunks', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1.4,
      },
      // one look back
      {
        pose: [{ who: 'trunks', pose: 'ft_pilotLook', face: 'soft', speed: 6 }],
        cam: { from: { at: 'trunks:face', local: [0.3, 0.05, 1.3] }, look: { at: 'trunks:face' }, fov: 34 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'goku', pose: 'g_wave', face: 'grin' }],
        cam: { from: { at: 'goku', local: [0.9, 0.3, 2.4] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'goku', line: 'See you in three years, Trunks!', duration: 2.2 },
        hold: 2.3,
      },
      // the machine lifts, the air tears, and he is gone
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.liftFrom = s.machine.group.position.clone();
          ctx.liftN = 0;
          b.sfx('timeWarp', null, { vol: 1, at: ctx.liftFrom });
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.liftN++;
          const k = U.easeInCubic(Math.min(1, ctx.liftN / 150));
          const p = ctx.liftFrom.clone().add(new V3(0, 16 * k, 0));
          s.machine.group.position.copy(p);
          s.machine.pos.copy(p);
          s.trunks.setPosition(p.clone().add(new V3(0, s.machine.data.seat || 0, 0)));
          s.trunks.prevPos.copy(s.trunks.pos);
          if (ctx.liftN % 6 === 0) b.vfx.bolt(p.clone().add(new V3(((ctx.liftN * 13) % 5) - 2.5, 1, ((ctx.liftN * 7) % 5) - 2.5)), 2.4, 0xcfe8ff);
          if (ctx.liftN % 16 === 0) b.vfx.ring(p, 2 + ctx.liftN * 0.03, 0xbfd8ff, 0.5);
          if (ctx.liftN === 150) {
            SL.ScreenFX.flash(0.5, '#dff2ff');
            b.vfx.explosion(p, 3, 0xcfe8ff, { smoke: false });
            b.vfx.ring(p, 10, 0xdff2ff, 0.6);
            K().propGone(b, s.machine);
            s.trunks.setHidden(true);
            ctx.m.flags.trunksGone = true;
          }
        },
        cam: { from: { at: 'goku', local: [-0.8, 0.2, -1.8] }, look: { at: 'trunks', off: [0, 2, 0] }, look2: { at: 'trunks', off: [0, 8, 0] }, fov: 48, fov2: 52 },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'goku', off: [3, 1.6, 4.4] }, to: { at: 'goku', off: [5, 3, 7] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 42, fov2: 48 },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.m.battle;
      if (s.machine) K().propGone(b, s.machine);
      s.trunks.setHidden(true);
      s.trunks.untargetable = true;
      K().pose(s.goku, 'idle', 'calm');
      ctx.m.flags.trunksGone = true;
    },
  };

  /* ================================================================ three_years */

  S.three_years = {
    id: 'three_years',
    cast,
    music: { song: 'hopeful', level: 3 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx);
          K().place(s.goku, ground(ctx, W().LANDING.clone().add(new V3(3, 0, -4))));
          s.crowd.forEach((f) => K().faceTo(f, s.goku.pos));
          K().faceTo(s.goku, s.piccolo.pos);
          K().pose(s.piccolo, 'armsCrossed', 'grit');
        },
        cam: { from: { at: 'piccolo', local: [0.8, 0.4, 2.3] }, look: { at: 'piccolo', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'piccolo', line: 'I heard all of it. Androids — in three years. Everyone here dies unless we are ready for them.', duration: 4.4 },
        hold: 4.5,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'krillin', local: [0.6, 0.3, 2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'Androids? Stronger than THAT kid? You’ve got to be kidding me...', duration: 3.2 },
        hold: 3.3,
      },
      // the prince does not wait to be told
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { from: { at: 'vegeta', local: [0.8, 0.35, 2.2] }, look: { at: 'vegeta', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Then I’ll be the one who destroys them. And you, Kakarot — you’re next.', duration: 3.6 },
        hold: 3.7,
      },
      {
        pose: [{ who: 'vegeta', pose: 'flyUp', face: 'angry' }],
        call: (ctx) => {
          const v = st(ctx).vegeta;
          ctx.vFrom = v.pos.clone();
          ctx.vN = 0;
          v.grounded = false;
          ctx.m.battle.vfx.dust(v.pos.clone(), 2, 10);
        },
        tick: (ctx) => {
          const v = st(ctx).vegeta, b = ctx.m.battle;
          ctx.vN++;
          const p = ctx.vFrom.clone().add(new V3(0, ctx.vN * 0.5, ctx.vN * 0.2));
          v.setPosition(p);
          v.prevPos.copy(p);
          if (ctx.vN % 3 === 0) b.vfx.trail(v.chest(), 0xdff2ff, 0.5, 0.3);
        },
        cam: { from: { at: 'goku', local: [-0.6, 0.2, -1.6] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 46 },
        hold: 1.8,
      },
      {
        call: (ctx) => st(ctx).vegeta.setHidden(true),
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku', local: [0.9, 0.35, 2.3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Three years. Piccolo, Gohan — let’s train together. All of us.', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'grin' }],
        cam: { from: { at: 'goku', off: [8, 3.2, 10] }, to: { at: 'goku', off: [12, 6, 16] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 46, fov2: 52 },
        hold: 3,
      },
    ],
    end(ctx) {
      st(ctx).vegeta.setHidden(true);
      ctx.m.flags.trainingBegins = true;
    },
  };
})();
