/*
 * SCENES — Chapter 5, "The Stranger" (Age 764, the coastal flats). Rebuilt 2026-09-24.
 *
 *   cold_arrival       the ship comes down, the army deploys, Frieza and his father walk out; the ridge feels it
 *   time_machine       the air tears; a machine lands on the rocks; a boy climbs out and pockets it
 *   trunks_confront    he walks up to the army and tells Frieza to leave; the order is given
 *   army_barrage       everything they have, into one spot — and he is not in it; the first of them fall
 *   army_end           the sword goes back in its sheath; behind him, what is left of an army
 *   trunks_reveal      a Death Beam that misses by an inch; "Goku is not the only one"
 *   trunks_no_limit    after the change: there is no ceiling, and Frieza does not believe it
 *   frieza_supernova   the planet thrown at him, caught in two hands, blown up for nothing   (cue: Catch)
 *   frieza_finish      the decoy, the leap, the vanish, the cut, the pieces, the palm          (cues)
 *   cold_sword         the offer, the sword, the catch, the blast, the begging, Finish Buster  (cues)
 *   trunks_waits       he powers down; the Z Fighters come down to him; he knows when Goku lands
 *
 * Show, don't tell: the stranger is never named in this mission. Nobody explains the gap in
 * power; it is played. Cues (`cue:`) are single buttons the story waits on (Mission.cue).
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.trunksKit;
  const A = () => SL.data.trunksArrival;
  const st = (ctx) => ctx.m.battle.story;

  const castAll = (m) => {
    const s = m.battle.story;
    const c = { trunks: s.trunks, frieza: s.frieza, cold: s.cold, vegeta: s.vegeta, piccolo: s.piccolo, krillin: s.krillin, gohan: s.gohan };
    s.soldiers.forEach((x, i) => (c['s' + i] = x));
    return c;
  };
  /** The first soldier still standing (the one the camera talks to). */
  const lead = (s) => s.soldiers.find((x) => x.alive && !x.hidden) || s.soldiers[0];

  /** Slides fighters from where they are to where they are going over `seconds` (a crowd move). */
  function crowd(ctx, list, to, seconds, pose) {
    const from = list.map((f) => f.pos.clone());
    ctx.crowd = { list, from, to, n: 0, frames: Math.round(seconds * 60), pose };
    for (const f of list) if (pose) K().pose(f, pose, 'neutral', 10);
  }
  function crowdTick(ctx) {
    const c = ctx.crowd;
    if (!c || c.n >= c.frames) return;
    c.n++;
    const k = U.easeInOutCubic(c.n / c.frames);
    const b = ctx.m.battle;
    c.list.forEach((f, i) => {
      const p = c.from[i].clone().lerp(c.to[i], k);
      p.y = b.stage.heightAt(p.x, p.z);
      f.setPosition(p);
      f.prevPos.copy(f.pos);
      const d = c.to[i].clone().sub(c.from[i]);
      if (d.lengthSq() > 0.01 && k < 0.95) f.yaw = f.prevYaw = Math.atan2(d.x, d.z);
    });
  }
  function crowdEnd(ctx) {
    const c = ctx.crowd;
    if (!c) return;
    c.list.forEach((f, i) => {
      const p = c.to[i].clone();
      p.y = ctx.m.battle.stage.heightAt(p.x, p.z);
      K().place(f, p);
    });
    ctx.crowd = null;
  }

  /* ================================================================ cold_arrival */

  S.cold_arrival = {
    id: 'cold_arrival',
    cast: castAll,
    music: { song: 'frieza_theme', level: 1 },
    events: [
      // the sky first: something enormous is coming down
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          const g = s.ship.group;
          ctx.shipRest = s.ship.pos.clone();
          g.position.copy(ctx.shipRest).add(new V3(0, 120, 0));
          for (const x of s.soldiers) x.setHidden(true);
          s.frieza.setHidden(true);
          s.cold.setHidden(true);
          ctx.shipN = 0;
          b.sfx('rumble', null, { vol: 0.9 });
        },
        mood: { amount: 0.3, color: 0x2a3244, seconds: 2 },
        cam: { from: { at: [-6, 1.2, 8] }, to: { at: [-5, 1.0, 6] }, look: { at: [0, 30, -40] }, look2: { at: [0, 18, -46] }, fov: 58, fov2: 54, ease: 'inOut' },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.shipN++;
          const k = U.easeOutCubic(Math.min(1, ctx.shipN / 300));
          s.ship.group.position.y = ctx.shipRest.y + 120 * (1 - k);
          if (ctx.shipN % 20 === 0) ctx.m.battle.cameraTraumaAt(ctx.shipRest, 0.08);
        },
        hold: 5,
      },
      // it lands: the ground answers
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          s.ship.group.position.copy(ctx.shipRest);
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            b.vfx.dust(ctx.shipRest.clone().add(new V3(Math.cos(a) * 14, 0.5, Math.sin(a) * 14)), 7, 14);
          }
        },
        sfx: { name: 'explosionBig', vol: 0.9, pitch: 0.4 },
        shake: { at: { at: [0, 0, -50] }, amount: 0.7 },
        cam: { from: { at: [14, 2, -6] }, to: { at: [12, 1.6, -8] }, look: { at: [0, 8, -50] }, fov: 50 },
        hold: 1.8,
      },
      // the army comes out from under it and spreads into a perimeter
      {
        call: (ctx) => {
          const s = st(ctx);
          s.soldiers.forEach((x, i) => {
            x.setHidden(false);
            const a = (i / s.soldiers.length) * Math.PI * 2;
            K().place(x, s.ship.pos.clone().add(new V3(Math.cos(a) * 6, 0, Math.sin(a) * 4 + 8)));
          });
          crowd(ctx, s.soldiers, s.soldiers.map((x, i) => A().rankSpot(i)), 3.2, 'run');
        },
        tick: (ctx) => crowdTick(ctx),
        cam: { from: { at: [-18, 2.2, -14] }, to: { at: [-15, 2, -18] }, look: { at: [0, 1.2, -30] }, look2: { at: [0, 1, -20] }, fov: 48 },
        hold: 3.3,
      },
      {
        call: (ctx) => {
          crowdEnd(ctx);
          const s = st(ctx);
          s.soldiers.forEach((x, i) => {
            K().faceTo(x, A().TRUNKS_AT);
            K().pose(x, i % 4 === 3 ? 'gunIdle' : 'idle', 'neutral');
          });
        },
        sfx: { name: 'scouter', who: 's1', vol: 0.8 },
        cam: { from: { at: 's1', local: [0.9, 0.5, 2.2] }, look: { at: 's1', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'frieza_soldier', line: 'Perimeter set. Scouters read nothing over ten anywhere on this continent, sir.', duration: 3.4 },
        hold: 3.5,
      },
      // and then the two of them walk out, and the soldiers are suddenly very small
      {
        call: (ctx) => {
          const s = st(ctx);
          s.frieza.setHidden(false);
          s.cold.setHidden(false);
          K().place(s.frieza, s.ship.pos.clone().add(new V3(1.5, 0, 14)));
          K().place(s.cold, s.ship.pos.clone().add(new V3(-3.5, 0, 12)));
          crowd(ctx, [s.frieza, s.cold], [A().FRIEZA_AT.clone(), A().COLD_AT.clone()], 3.4, null);
          K().pose(s.frieza, 'mf_walk', 'smirk');
          K().pose(s.cold, 'kc_walk', 'calm');
        },
        tick: (ctx) => crowdTick(ctx),
        cam: { from: { at: [2.5, 0.5, -20] }, look: { at: 'cold', off: [0, 1.4, 0] }, fov: 50 },
        hold: 3.5,
      },
      {
        call: (ctx) => {
          crowdEnd(ctx);
          const s = st(ctx);
          K().faceTo(s.frieza, A().TRUNKS_AT);
          K().faceTo(s.cold, A().TRUNKS_AT);
          K().pose(s.frieza, 'idle', 'smirk');
          K().pose(s.cold, 'kc_amused', 'calm');
        },
        cam: { from: { at: 'frieza', local: [1.2, 0.4, 2.8] }, to: { at: 'frieza', local: [0.9, 0.35, 2.2] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 42, fov2: 36 },
        say: { who: 'mecha_frieza', line: 'Then we wait. When his ship comes down, I want him to step out and find his friends already dead.', duration: 4.4 },
        hold: 4.5,
      },
      {
        cam: { from: { at: 'cold', local: [1.6, 0.2, 3.2] }, look: { at: 'cold', off: [0, 0.6, 0] }, fov: 44 },
        say: { who: 'king_cold', line: 'You were beaten by a monkey, my son. Do try not to enjoy this too much.', duration: 3.8 },
        hold: 3.9,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_fist', face: 'angry' }],
        cam: { from: { at: 'frieza:face', local: [0.2, 0, 1.1] }, look: { at: 'frieza:face' }, fov: 36 },
        say: { who: 'mecha_frieza', line: 'He took my body from me, father. I will take his planet from him.', duration: 3.6, style: 'quiet' },
        hold: 3.7,
      },
      // far away, on a ridge, the people who know exactly what that ki is
      {
        call: (ctx) => {
          const s = st(ctx);
          for (const f of s.ridge) {
            f.setHidden(false);
            K().faceTo(f, A().FRIEZA_AT);
          }
          K().pose(s.vegeta, 'armsCrossed', 'angry');
          K().pose(s.piccolo, 'armsCrossed', 'grit');
          K().pose(s.krillin, 'idle', 'shock');
          K().pose(s.gohan, 'idle', 'shock');
        },
        cam: { from: { at: 'vegeta', local: [-1.4, 0.7, -2.6] }, look: { at: 'frieza', off: [0, 2, 0] }, fov: 46 },
        say: { who: 'vegeta', line: 'Frieza. He survived.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'krillin', local: [0.6, 0.35, 1.9] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'krillin', line: 'And there’s another one with him — even bigger. Goku isn’t even here...', duration: 3.4 },
        hold: 3.5,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      crowdEnd(ctx);
      if (ctx.shipRest) s.ship.group.position.copy(ctx.shipRest);
      s.soldiers.forEach((x, i) => {
        x.setHidden(false);
        K().place(x, K().ground(ctx.m.battle, A().rankSpot(i)));
        K().faceTo(x, A().TRUNKS_AT);
        K().pose(x, i % 4 === 3 ? 'gunIdle' : 'idle', 'neutral');
      });
      for (const [f, at] of [[s.frieza, A().FRIEZA_AT], [s.cold, A().COLD_AT]]) {
        f.setHidden(false);
        K().place(f, K().ground(ctx.m.battle, at));
        K().faceTo(f, A().TRUNKS_AT);
      }
      K().pose(s.frieza, 'idle', 'smirk');
      K().pose(s.cold, 'kc_amused', 'calm');
      for (const f of s.ridge) f.setHidden(true);
      ctx.m.flags.landed = true;
    },
  };

  /* ================================================================ time_machine */

  S.time_machine = {
    id: 'time_machine',
    cast: castAll,
    music: { song: 'battle', level: 2 },
    events: [
      // the air tears above the rocks
      {
        call: (ctx) => {
          const b = ctx.m.battle;
          ctx.warp = K().ground(b, A().MACHINE_AT).add(new V3(0, 26, 0));
          ctx.warpN = 0;
          b.sfx('timeWarp', null, { vol: 1, at: ctx.warp });
          st(ctx).soldiers.forEach((x) => K().faceTo(x, ctx.warp));
          K().faceTo(st(ctx).frieza, ctx.warp);
        },
        mood: { amount: 0.36, color: 0x20304a, seconds: 1 },
        tick: (ctx) => {
          const b = ctx.m.battle;
          ctx.warpN++;
          const n = ctx.warpN;
          if (n % 6 === 0) b.vfx.bolt(ctx.warp.clone().add(new V3(((n * 37) % 7) - 3.5, ((n * 13) % 5) - 2.5, ((n * 29) % 7) - 3.5)), 3 + (n % 4), 0xcfe8ff);
          if (n % 14 === 0) b.vfx.ring(ctx.warp, 3 + (n / 14) * 0.9, 0xbfd8ff, 0.5);
          if (n % 10 === 0) b.vfx.flash(ctx.warp, 2 + n * 0.03, 0xdff2ff, 0.2, SL.Toon.tex.glow);
        },
        cam: { from: { at: 's0', local: [-0.6, 0.4, -1.8] }, look: { at: [9, 16, 12] }, fov: 50 },
        hold: 2.4,
      },
      // and something falls out of it
      {
        call: (ctx) => {
          const b = ctx.m.battle, s = st(ctx);
          s.machine = K().timeMachine(b, ctx.warp);
          s.machine.group.position.copy(ctx.warp);
          // its front (and its pilot) face the army
          s.machine.group.rotation.y = Math.atan2(A().FRIEZA_AT.x - ctx.warp.x, A().FRIEZA_AT.z - ctx.warp.z);
          ctx.rest = K().ground(b, A().MACHINE_AT).add(new V3(0, s.machine.data.stand || 1.35, 0));
          ctx.dropN = 0;
          SL.ScreenFX.flash(0.5, '#dff2ff');
          b.vfx.ring(ctx.warp, 9, 0xdff2ff, 0.6);
          b.vfx.explosion(ctx.warp, 2.5, 0xcfe8ff, { smoke: false });
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.dropN++;
          const k = U.easeOutCubic(Math.min(1, ctx.dropN / 170));
          s.machine.group.position.copy(ctx.warp.clone().lerp(ctx.rest, k));
          s.machine.pos.copy(s.machine.group.position);
          if (ctx.dropN % 4 === 0 && k < 0.95) b.vfx.trail(s.machine.group.position.clone().add(new V3(0, 1.4, 0)), 0xcfe8ff, 0.6, 0.4);
        },
        cam: { from: { at: [-4, 2.4, 0] }, look: { at: [9, 10, 14] }, look2: { at: [9, 2, 16] }, fov: 50, fov2: 44 },
        hold: 2.9,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          s.machine.group.position.copy(ctx.rest);
          s.machine.pos.copy(ctx.rest);
          b.vfx.dust(ctx.rest.clone().setY(ctx.rest.y - 1.4), 2.6, 8);
          b.cameraTraumaAt(ctx.rest, 0.35);
          s.soldiers.forEach((x, i) => K().pose(x, i % 2 ? 'gunIdle' : 'idle', 'shock'));
        },
        sfx: { name: 'groundImpact', vol: 0.9 },
        cam: { from: { at: [-3, 2.2, 5] }, look: { at: [9, 1.2, 16] }, fov: 42 },
        hold: 1.4,
      },
      {
        cam: { from: { at: 's11', local: [0.8, 0.45, 2] }, look: { at: 's11', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'frieza_soldier', line: 'Scouter reads almost nothing in it. Some kind of pod — Earth-made?', duration: 3 },
        hold: 3.1,
      },
      // the canopy opens, and the first thing you see is a sword hilt over a shoulder
      {
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          ctx.openN = 0;
          t.setHidden(false);
          K().sheathe(t, true);
          K().place(t, s.machine.group.position.clone().add(new V3(0, (s.machine.data.seat || 0.2), 0)));
          t.grounded = false;
          K().faceTo(t, A().FRIEZA_AT);
          K().pose(t, 'ft_calm', 'calm');
          ctx.m.battle.sfx('capsulePop', null, { vol: 0.5, pitch: 1.4, at: s.machine.pos });
        },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.openN++;
          if (s.machine.data.open) s.machine.data.open(Math.min(1, ctx.openN / 50));
        },
        cam: { from: { at: 'trunks', local: [0.5, -0.2, 3.2] }, to: { at: 'trunks', local: [0.4, -0.1, 2.5] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 42, fov2: 36 },
        hold: 2.6,
      },
      {
        // from the side: the open canopy swings up behind him and would fill an over-the-shoulder shot
        cam: { from: { at: 'trunks', local: [-1.7, 0.6, -0.5] }, look: { at: 'frieza', off: [0, 0.5, 0] }, fov: 44 },
        hold: 2.2,
      },
      // he jumps down, and the machine goes into his pocket
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm' }],
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          const fw = new V3(Math.sin(t.yaw), 0, Math.cos(t.yaw));
          ctx.jumpTo = K().ground(ctx.m.battle, s.machine.pos.clone().addScaledVector(fw, 2.6));
          K().place(t, ctx.jumpTo, t.yaw);
          ctx.m.battle.vfx.dust(ctx.jumpTo, 1.4, 8);
        },
        cam: { from: { at: 'trunks', local: [2.2, 0.6, 3.4] }, look: { at: 'trunks', off: [0, 0.1, 0] }, fov: 46 },
        hold: 1,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_capsule', face: 'calm', speed: 10 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          b.vfx.dust(s.machine.pos.clone(), 2.6, 16, 0xf2f2ee);
          b.vfx.flash(s.machine.pos.clone(), 2, 0xffffff, 0.15, SL.Toon.tex.glow);
          K().propGone(b, s.machine);
          ctx.m.flags.capsuled = true;
        },
        sfx: { name: 'capsulePop', vol: 1 },
        cam: { from: { at: 'trunks', local: [1.8, 0.4, 2.8] }, look: { at: 'trunks', off: [0.8, 0, -0.6] }, fov: 44 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        cam: { from: { at: 'frieza', local: [1, 0.35, 2.4] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 40 },
        say: { who: 'mecha_frieza', line: 'And who is this? An Earthling, in a toy.', duration: 2.8 },
        hold: 2.9,
      },
      {
        cam: { from: { at: 'cold', local: [1.4, 0.2, 3] }, look: { at: 'cold', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'king_cold', line: 'A child. Carrying a sword, of all things.', duration: 2.8 },
        hold: 2.9,
      },
      // the ridge does not know him either
      {
        call: (ctx) => {
          for (const f of st(ctx).ridge) f.setHidden(false);
        },
        pose: [{ who: 'krillin', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'krillin', local: [0.7, 0.4, 2] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'krillin', line: 'Who is that kid? He just walked right up to them!', duration: 2.8 },
        hold: 2.9,
      },
      {
        cam: { from: { at: 'piccolo', local: [0.8, 0.45, 2.3] }, look: { at: 'piccolo', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'piccolo', line: 'I can barely sense him. Either he is nothing — or he is hiding all of it.', duration: 3.4, style: 'quiet' },
        hold: 3.5,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.m.battle, t = s.trunks;
      if (s.machine) K().propGone(b, s.machine);
      t.setHidden(false);
      t.untargetable = false;
      K().sheathe(t, true);
      if (t.pos.distanceTo(K().ground(b, A().MACHINE_AT)) > 6 || !t.grounded) K().place(t, K().ground(b, A().MACHINE_AT.clone().add(new V3(-1.5, 0, -2.6))));
      K().faceTo(t, s.frieza.pos);
      K().pose(t, 'ft_calm', 'calm');
      s.soldiers.forEach((x) => K().faceTo(x, t.pos));
      for (const f of s.ridge) f.setHidden(true);
      ctx.m.flags.machineLanded = true;
      ctx.m.flags.capsuled = true;
    },
  };

  /* ================================================================ trunks_confront */

  S.trunks_confront = {
    id: 'trunks_confront',
    cast: castAll,
    music: { song: 'battle', level: 2 },
    events: [
      // he walks up to an army, and nothing about him hurries
      {
        pose: [{ who: 'trunks', pose: 'ft_walk', face: 'calm', speed: 8 }],
        call: (ctx) => {
          const s = st(ctx);
          s.soldiers.forEach((x, i) => {
            K().pose(x, i % 3 ? 'gunIdle' : 'idle', 'angry');
            K().faceTo(x, s.trunks.pos);
          });
          K().faceTo(s.frieza, A().TRUNKS_AT);
          K().faceTo(s.cold, A().TRUNKS_AT);
          K().pose(s.frieza, 'idle', 'smirk');
        },
        move: { who: 'trunks', at: [A().TRUNKS_AT.x, 0, A().TRUNKS_AT.z], seconds: 4.2, face: 'frieza', ease: 'linear' },
        cam: { from: { at: 'trunks', local: [2.2, 0.2, 3.6] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 46 },
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_handNear', face: 'calm' }],
        cam: { from: { at: 'trunks', local: [0.9, 0.4, 2.2] }, look: { at: 'trunks:face' }, fov: 38 },
        say: { who: 'future_trunks', line: 'You are Frieza. And you must be his father.', duration: 3, style: 'quiet' },
        hold: 3.1,
      },
      {
        cam: { from: { at: 'frieza', local: [0.9, 0.35, 2.3] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 40 },
        say: { who: 'mecha_frieza', line: 'A flea that knows my name. Should I be flattered, or should I have you squashed?', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { from: { at: 'trunks:face', local: [0.15, 0, 0.95] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'Leave Earth. Now. This is the only chance I am giving you.', duration: 3.4, style: 'quiet' },
        hold: 3.5,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_boast', face: 'smirk', speed: 6 }],
        cam: { from: { at: 'frieza', local: [1.4, -0.2, 2.8] }, look: { at: 'frieza', off: [0, 0.35, 0] }, fov: 44 },
        say: { who: 'mecha_frieza', line: 'Look at me, boy. They rebuilt me stronger than I have ever been. Nothing on this rock can so much as scratch me.', duration: 4.6 },
        hold: 4.7,
      },
      {
        cam: { from: { at: 'trunks', local: [-0.7, 0.5, -1.8] }, look: { at: 'frieza', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'future_trunks', line: 'Goku will not get here in time to fight you. You will have to settle for me.', duration: 3.8, style: 'quiet' },
        hold: 3.9,
      },
      // the order, and the army closes round him
      {
        pose: [{ who: 'frieza', pose: 'mf_order', face: 'smirk', speed: 8 }],
        cam: { from: { at: 'frieza', local: [0.8, 0.3, 2] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 38 },
        say: { who: 'mecha_frieza', line: 'Men. Kill him — and leave nothing I would have to look at.', duration: 3.4 },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          const n = s.soldiers.length;
          crowd(ctx, s.soldiers, s.soldiers.map((x, i) => A().ringSpot(t.pos, i, n, 7 + (i % 3) * 2.2)), 2.6, 'run');
          K().pose(t, 'ft_calm', 'calm');
        },
        tick: (ctx) => crowdTick(ctx),
        cam: { from: { at: 'trunks', off: [0, 16, 14] }, to: { at: 'trunks', off: [8, 12, 12] }, look: { at: 'trunks', off: [0, 0, 0] }, fov: 48 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const s = st(ctx), t = s.trunks, b = ctx.m.battle;
      crowdEnd(ctx);
      K().place(t, K().ground(b, A().TRUNKS_AT));
      K().faceTo(t, s.frieza.pos);
      K().pose(t, 'ft_calm', 'calm');
      const n = s.soldiers.length;
      s.soldiers.forEach((x, i) => {
        K().place(x, K().ground(b, A().ringSpot(t.pos, i, n, 7 + (i % 3) * 2.2)));
        K().faceTo(x, t.pos);
        K().pose(x, i % 4 === 3 ? 'gunIdle' : 'idle', 'angry');
      });
      ctx.m.flags.warned = true;
    },
  };

  /* ================================================================ army_barrage */

  S.army_barrage = {
    id: 'army_barrage',
    cast: castAll,
    music: { song: 'battle', level: 4 },
    events: [
      {
        call: (ctx) => st(ctx).soldiers.forEach((x) => K().pose(x, 'gunIdle', 'angry')),
        cam: { from: { at: 'trunks', local: [0.3, -0.35, 1.6] }, look: { at: 'trunks:face' }, fov: 44 },
        hold: 1.1,
      },
      // everything they have, into one spot
      {
        call: (ctx) => (ctx.volleyN = 0),
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          ctx.volleyN++;
          const n = ctx.volleyN;
          const shooter = s.soldiers[(n * 7) % s.soldiers.length];
          const at = t.chest().add(new V3(((n * 13) % 5) * 0.3 - 0.6, ((n * 7) % 3) * 0.3 - 0.3, ((n * 11) % 5) * 0.3 - 0.6));
          if (n % 3 === 0 && shooter.alive) {
            const from = shooter.chest().addScaledVector(shooter.forward, 0.6);
            for (let i = 0; i <= 8; i++) b.vfx.trail(from.clone().lerp(at, i / 8), shooter.def.blast ? shooter.def.blast.color : 0xff4fa0, 0.28, 0.2);
            b.sfx('kiBlast', shooter, { vol: 0.5 });
          }
          if (n % 6 === 0) b.vfx.explosion(at, 1.6 + (n % 12) * 0.08, 0xff9fd0, { smoke: true });
          if (n === 48) t.setHidden(true);
          if (n % 10 === 0) b.cameraTraumaAt(t.pos, 0.25);
        },
        cam: { from: { at: 'trunks', off: [-12, 3.2, 10] }, look: { at: 'trunks', off: [0, 0.6, 0] }, fov: 50 },
        hold: 2.4,
      },
      {
        call: (ctx) => st(ctx).trunks.setHidden(true),
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        cam: { from: { at: 'frieza', local: [0.9, 0.3, 2.2] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 40 },
        say: { who: 'mecha_frieza', line: 'Sweep up whatever is left. Then find me that monkey.', duration: 2.8 },
        hold: 2.4,
      },
      // the smoke clears on nothing
      {
        call: (ctx) => {
          const s = st(ctx);
          s.soldiers.forEach((x) => K().pose(x, 'idle', 'shock'));
        },
        cam: { from: { at: 'trunks', off: [5, 2.2, 6] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 46 },
        say: { who: 'frieza_soldier', line: 'He’s... not there. Where did he—', duration: 1.8 },
        hold: 1.9,
      },
      // he is among them, and the sword is already out
      {
        call: (ctx) => {
          const s = st(ctx), t = s.trunks, b = ctx.m.battle;
          const blitz = s.soldiers.slice(0, A().BLITZ);
          const mid = blitz.reduce((a, x) => a.add(x.pos), new V3()).multiplyScalar(1 / blitz.length);
          const at = K().ground(b, mid.clone().lerp(t.pos, 0.35));
          b.vfx.afterimage(at, 1.8, 0xd8c8ff);
          K().place(t, at);
          t.setHidden(false);
          K().faceTo(t, blitz[0].pos);
          K().sheathe(t, false);
          K().pose(t, 'ft_drawOut', 'grit', 18);
          b.sfx('swordDraw', t, { vol: 1.1 });
          ctx.blitz = blitz;
        },
        slow: { scale: 0.3, seconds: 0.5 },
        cam: { from: { at: 'trunks', local: [1.3, 0.1, 2.2] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 42 },
        hold: 0.7,
      },
      {
        call: (ctx) => {
          const s = st(ctx), t = s.trunks, b = ctx.m.battle;
          K().pose(t, 'ft_spin', 'grit', 16);
          ctx.blitz.forEach((x) => {
            if (!x.alive) return;
            x.cannotDie = false;
            x.untargetable = false;
            const dir = x.pos.clone().sub(t.pos).setY(0).normalize();
            x.takeHit(t, { type: 'melee', damage: 999999, knock: 'heavy', knockSpeed: 12, hitstun: 30, impact: 2, dir, point: x.chest(), sfx: 'swordSlash' });
            if (!x.alive && s.army) K().finisher(ctx.m, s.army, x, { type: 'melee' });
          });
          ctx.armyN = 0;
        },
        tick: (ctx) => {
          const s = st(ctx);
          if (s.army) K().armyTick(ctx.m, s.army);
        },
        cam: { from: { at: 'trunks', off: [4.6, 1.4, 5.2] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 48 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_finish', face: 'calm', speed: 10 }],
        call: (ctx) => {
          const s = st(ctx);
          s.soldiers.forEach((x) => {
            if (x.alive) K().pose(x, 'idle', 'shock');
          });
        },
        tick: (ctx) => {
          const s = st(ctx);
          if (s.army) K().armyTick(ctx.m, s.army);
        },
        cam: { from: { at: 'trunks', local: [-1.2, 0.4, -2.2] }, look: { at: 's8', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'frieza_soldier', line: 'What — what just happened?!', duration: 1.8 },
        hold: 1.9,
      },
    ],
    end(ctx) {
      const s = st(ctx), t = s.trunks;
      // however it ended, the blitz happened: the first of them are down
      for (const x of s.soldiers.slice(0, A().BLITZ)) {
        if (x.alive) {
          x.alive = false;
          x.setHidden(true);
        }
        x.untargetable = true;
      }
      if (s.army) {
        for (const p of s.army.pending.splice(0)) K().release(ctx.m, s.army, p);
      }
      t.setHidden(false);
      K().sheathe(t, false);
      ctx.m.flags.blitzDone = true;
    },
  };

  /* ================================================================ army_end */

  S.army_end = {
    id: 'army_end',
    cast: castAll,
    music: { song: 'battle', level: 2 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_finish', face: 'calm', speed: 6 }],
        cam: { from: { at: 'trunks', local: [1.6, 0.1, 3.6] }, to: { at: 'trunks', local: [1.2, 0.15, 2.6] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 44, fov2: 38 },
        hold: 1.3,
      },
      // a flick of the blade, and it goes home with a click
      {
        pose: [{ who: 'trunks', pose: 'ft_sheathe', face: 'calm', speed: 10 }],
        call: (ctx) => {
          const t = st(ctx).trunks;
          ctx.m.battle.sfx('swing', t, { vol: 0.6, pitch: 1.6 });
          ctx.sheatheAt = 36;
          ctx.sheN = 0;
        },
        tick: (ctx) => {
          ctx.sheN++;
          if (ctx.sheN === ctx.sheatheAt) {
            const t = st(ctx).trunks;
            K().sheathe(t, true);
            ctx.m.battle.sfx('swordSheathe', t, { vol: 1.2 });
          }
        },
        cam: { from: { at: 'trunks', local: [-0.9, 0.55, -1.2] }, look: { at: 'trunks', off: [-0.2, 0.55, 0] }, fov: 40 },
        hold: 1.1,
      },
      // behind him, what is left of an army goes up
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm', speed: 6 }],
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          K().sheathe(t, true);
          ctx.bodies = s.soldiers.filter((x) => !x.alive && !x.hidden).sort((a, c) => a.pos.distanceTo(t.pos) - c.pos.distanceTo(t.pos));
          ctx.boomN = 0;
        },
        tick: (ctx) => {
          const b = ctx.m.battle;
          ctx.boomN++;
          if (ctx.boomN % 5 !== 0) return;
          const x = ctx.bodies.shift();
          if (!x) return;
          b.vfx.explosion(x.chest(), 1.8, 0xffb070, { smoke: ctx.boomN % 20 === 0 });
          b.sfx('explosionSmall', x, { vol: 0.9 });
          b.cameraTraumaAt(x.pos, 0.12);
          x.setHidden(true);
        },
        cam: { from: { at: 'trunks', local: [0.2, 0.2, 3.4] }, to: { at: 'trunks', local: [0.1, 0.25, 2.6] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 46, fov2: 40 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_recoil', face: 'shock', speed: 6 }],
        cam: { from: { at: 'frieza:face', local: [0.2, 0, 1.2] }, look: { at: 'frieza:face' }, fov: 36 },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'cold', local: [1.3, 0.3, 2.8] }, look: { at: 'cold', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'king_cold', line: 'Those were your best men, Frieza. Every one of them. In the time it takes to blink.', duration: 3.8, style: 'quiet' },
        hold: 3.9,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      for (const x of s.soldiers) {
        x.setHidden(true);
        x.untargetable = true;
        x.alive = false;
      }
      K().sheathe(s.trunks, true);
      ctx.m.flags.armyGone = true;
    },
  };

  /* ================================================================ trunks_reveal */

  S.trunks_reveal = {
    id: 'trunks_reveal',
    cast: castAll,
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [{ who: 'frieza', pose: 'mf_fist', face: 'angry' }],
        cam: { from: { at: 'frieza', local: [0.9, 0.3, 2.1] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 38 },
        say: { who: 'mecha_frieza', line: 'Who are you? WHAT are you?', duration: 2.6, style: 'shout' },
        hold: 2.7,
      },
      // one Death Beam, and it misses by the width of a hair
      {
        pose: [{ who: 'frieza', pose: 'fz_aim', face: 'angry', speed: 20 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          const from = s.frieza.chest().addScaledVector(s.frieza.forward, 0.6).add(new V3(0, 0.1, 0));
          const side = new V3(-t.forward.z, 0, t.forward.x);
          const past = t.chest().add(new V3(0, 0.38, 0)).addScaledVector(side, 0.28);
          const far = past.clone().add(past.clone().sub(from).normalize().multiplyScalar(30));
          for (let i = 0; i <= 18; i++) b.vfx.trail(from.clone().lerp(far, i / 18), 0xff3a6a, 0.22, 0.35);
          b.vfx.flash(from, 1.4, 0xff3a6a, 0.2, SL.Toon.tex.glow);
          b.sfx('kiBlast', s.frieza, { vol: 1.1, pitch: 1.3 });
          K().pose(t, 'ft_slip', 'calm', 22);
        },
        cam: { from: { at: 'frieza', local: [-0.6, 0.45, -1.4] }, look: { at: 'trunks', off: [0, 0.5, 0] }, fov: 40 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm', speed: 6 }],
        cam: { from: { at: 'trunks:face', local: [0.1, -0.02, 1] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'Goku is not the only Super Saiyan.', duration: 3, style: 'quiet' },
        hold: 3.1,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_roar', face: 'angry', speed: 8 }],
        cam: { from: { at: 'frieza', local: [1, 0.2, 2.3] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'mecha_frieza', line: 'Liar! Super Saiyans are a fairy tale — that monkey was a fluke, one freak out of a dead race!', duration: 4.2, style: 'shout' },
        hold: 4.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_tfStill', face: 'calm', speed: 6 }],
        cam: { from: { at: 'trunks', local: [1.8, 0.1, 3.4] }, look: { at: 'trunks', off: [0, 0.2, 0] }, fov: 44 },
        say: { who: 'future_trunks', line: 'Then watch carefully.', duration: 2.2, style: 'quiet' },
        hold: 2.3,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      K().pose(s.frieza, 'idle', 'angry');
      ctx.m.flags.named = true;
    },
    clearMood: false,
  };

  S.trunks_no_limit = {
    id: 'trunks_no_limit',
    cast: castAll,
    music: { song: 'super_saiyan', level: 4 },
    events: [
      {
        pose: [{ who: 'trunks', pose: 'ft_tfFinal', face: 'angry' }],
        cam: { from: { at: 'trunks', local: [0.8, 0.3, 2.4] }, look: { at: 'trunks', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'future_trunks', line: 'You were rebuilt. It will not matter. A Super Saiyan does not stop where you think he does.', duration: 4.4, style: 'quiet' },
        hold: 4.5,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_boast', face: 'grit', speed: 5 }],
        cam: { from: { at: 'frieza', local: [0.9, 0.25, 2] }, look: { at: 'frieza', off: [0, 0.25, 0] }, fov: 38 },
        say: { who: 'mecha_frieza', line: '...A trick. This body was built to beat that monkey. It will beat you.', duration: 3.6 },
        hold: 3.7,
      },
    ],
    end(ctx) {
      ctx.m.flags.noLimit = true;
    },
  };

  /* ================================================================ frieza_supernova */

  S.frieza_supernova = {
    id: 'frieza_supernova',
    cast: castAll,
    music: { song: 'intense', level: 5 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, fz = s.frieza, t = s.trunks;
          K().clearCombat(b);
          fz.controller = K().scripted();
          const up = fz.pos.clone().sub(t.pos).setY(0).normalize().multiplyScalar(Math.max(6, Math.min(12, fz.pos.distanceTo(t.pos))));
          K().float(fz, t.pos.clone().add(up).add(new V3(0, 11, 0)));
          K().faceTo(fz, t.pos);
          K().faceTo(t, fz.pos);
          K().pose(fz, 'mf_raise1', 'angry', 8);
          K().pose(t, 'ft_ready', 'calm');
          ctx.orb = K().orb(b, fz.chest().add(new V3(0, 1.2, 0)), 0.3);
          ctx.orbN = 0;
          b.sfx('kiCharge', fz, { vol: 1 });
        },
        mood: { amount: 0.5, color: 0x3a1410, seconds: 1.2 },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.orbN++;
          const k = Math.min(1, ctx.orbN / 150);
          ctx.orb.set(0.3 + k * 3.2);
          ctx.orb.pos.copy(s.frieza.chest().add(new V3(0, 1 + ctx.orb.radius, 0)));
          ctx.orb.pulse();
        },
        cam: { from: { at: 'trunks', local: [-0.8, 0.1, -2.4] }, look: { at: 'frieza', off: [0, 2, 0] }, fov: 52 },
        say: { who: 'mecha_frieza', line: 'If I cannot kill you, I will take this whole planet with you!', duration: 3.2, style: 'shout' },
        hold: 2.6,
      },
      // he puts the sword away to catch it
      {
        call: (ctx) => {
          const t = st(ctx).trunks;
          K().sheathe(t, true);
          ctx.m.battle.sfx('swordSheathe', t, { vol: 1 });
        },
        tick: (ctx) => ctx.orb.pulse(),
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm' }],
        cam: { from: { at: 'trunks:face', local: [0.15, -0.05, 1] }, look: { at: 'trunks:face' }, fov: 34 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_ball', face: 'angry', speed: 12 }],
        call: (ctx) => {
          const t = st(ctx).trunks;
          ctx.throwFrom = ctx.orb.pos.clone();
          ctx.throwTo = t.chest().add(new V3(0, 1.1 + ctx.orb.radius, 0));
          ctx.thN = 0;
        },
        tick: (ctx) => {
          ctx.thN++;
          const k = U.easeInCubic(Math.min(1, ctx.thN / 75));
          ctx.orb.pos.copy(ctx.throwFrom.clone().lerp(ctx.throwTo, k));
          ctx.orb.pulse();
        },
        cam: { from: { at: 'trunks', off: [11, 2.5, 8] }, look: { at: 'trunks', off: [0, 5.5, 0] }, fov: 58 },
        hold: 1.3,
      },
      // the player catches it
      {
        tick: (ctx) => {
          ctx.orb.pos.copy(ctx.throwTo);
          ctx.orb.pulse();
        },
        cam: { from: { at: 'trunks', local: [1.6, -0.1, 2.8] }, look: { at: 'trunks', off: [0, 1.6, 0] }, fov: 48 },
        cue: { key: 'guard', label: 'Catch it', slow: 0.3, auto: 6 },
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_catchBall', face: 'calm', speed: 14 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          b.stage.crater(t.pos, 3.2, 0.5, null);
          b.vfx.dust(t.pos.clone(), 3.4, 18);
          b.vfx.sparks(ctx.throwTo, 0xffc070, 30, 14, 0.14);
          b.cameraTraumaAt(t.pos, 0.6);
          b.sfx('groundImpact', t, { vol: 1.1 });
          ctx.m.flags.supernovaCaught = true;
        },
        tick: (ctx) => {
          const t = st(ctx).trunks;
          ctx.orb.pos.copy(t.chest().add(new V3(0, 0.95 + ctx.orb.radius * 0.95, 0)));
          ctx.orb.pulse();
        },
        cam: { from: { at: 'trunks', local: [1.2, -0.5, 2.6] }, look: { at: 'trunks', off: [0, 1.2, 0] }, fov: 52 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_recoil', face: 'shock' }],
        tick: (ctx) => ctx.orb.pulse(),
        cam: { from: { at: 'frieza:face', local: [0.2, 0, 1.2] }, look: { at: 'frieza:face' }, fov: 36 },
        say: { who: 'mecha_frieza', line: 'He is holding it. He is HOLDING it—', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_aim', face: 'angry', speed: 16 }],
        tick: (ctx) => ctx.orb.pulse(),
        cam: { from: { at: 'frieza', local: [0.9, 0.3, 2] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'mecha_frieza', line: 'Then burn with it!', duration: 1.6, style: 'shout' },
        hold: 1.2,
      },
      // it goes off in his hands
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          const at = ctx.orb.pos.clone();
          ctx.orb.dispose();
          ctx.orb = null;
          b.vfx.explosion(at, 9, 0xff8a3a, { smoke: true });
          b.vfx.explosion(t.chest(), 5, 0xffd070, { smoke: true });
          SL.ScreenFX.flash(0.7, '#ffd0a0');
          b.cameraTraumaAt(at, 1);
          t.setHidden(true);
        },
        sfx: { name: 'explosionHuge', vol: 1.2 },
        cam: { from: { at: 'trunks', off: [16, 6, 14] }, look: { at: 'trunks', off: [0, 2, 0] }, fov: 54 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_laugh', face: 'smirk', speed: 6 }],
        cam: { from: { at: 'frieza', local: [1, 0.3, 2.4] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'mecha_frieza', line: 'Ha... ha ha ha! Nobody walks away from that. Nobody!', duration: 2.6 },
        hold: 2.6,
      },
      // the smoke goes, and he is standing in a crater without a mark on him
      {
        call: (ctx) => {
          const t = st(ctx).trunks;
          t.setHidden(false);
          K().pose(t, 'ft_calm', 'calm');
          ctx.m.battle.vfx.dust(t.pos.clone(), 4, 14, 0x9a9a92);
        },
        music: { song: 'finale', level: 2 },
        cam: { from: { at: 'trunks', local: [0.4, 0.2, 4.6] }, to: { at: 'trunks', local: [0.3, 0.3, 3.2] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 44, fov2: 38 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'frieza', pose: 'mf_recoil', face: 'hurt', speed: 6 }],
        cam: { from: { at: 'frieza:face', local: [-0.2, 0.02, 1.1] }, look: { at: 'frieza:face' }, fov: 34 },
        hold: 1.9,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.m.battle;
      if (ctx.orb) ctx.orb.dispose();
      ctx.orb = null;
      s.trunks.setHidden(false);
      // Frieza comes back down in front of him
      if (!s.frieza.grounded) K().place(s.frieza, K().ground(b, s.trunks.pos.clone().add(s.frieza.pos.clone().sub(s.trunks.pos).setY(0).normalize().multiplyScalar(10))));
      K().faceTo(s.frieza, s.trunks.pos);
      K().faceTo(s.trunks, s.frieza.pos);
      ctx.m.flags.supernovaCaught = true;
      ctx.m.flags.supernovaSurvived = true;
    },
  };

  /* ================================================================ frieza_finish */

  const FRIEZA_COLORS = [0xf2ece6, 0xc6ccd6, 0x8a3fb8, 0x6a6f7a, 0xe8ecf2];

  /*
   * THE AIR CUT (owner's fix, 2026-09-25): the blade has to go THROUGH him. Before the Cut cue
   * Trunks is put above Frieza, in line with him; during the cut he drops past him and every tick
   * he is slid so the middle of his actual blade (the sword prop, measured in the world) sits on
   * Frieza's vertical axis — whatever the pose is doing, the steel crosses the body from above the
   * head to below the feet. The tests measure the same geometry (bladeSegment).
   */
  const CUT_FRAMES = 18;
  const bladeSegment = (t) => K().bladeSegment(t);
  const pinBlade = (t, axis) => {
    const seg = bladeSegment(t);
    if (!seg) return;
    const mid = seg[0].clone().lerp(seg[1], 0.5);
    const d = new V3(axis.x - mid.x, 0, axis.z - mid.z);
    if (d.length() > 1.5) d.setLength(1.5);
    t.setPosition(t.pos.clone().add(d));
  };
  // which way the ship is from a point (flat): the ship prop's 17 m sphere pushes any camera on
  // that side out of the shot, so the finish frames itself from the other side
  const shipward = (ctx, p) => {
    const sh = st(ctx).ship;
    return sh && sh.alive ? sh.pos.clone().sub(p).setY(0).normalize() : new V3(0, 0, -1);
  };
  const palmOf = (t) => {
    t.object.updateMatrixWorld(true);
    return t.model.joints.handL.getWorldPosition(new V3());
  };

  S.frieza_finish = {
    id: 'frieza_finish',
    cast: castAll,
    music: { song: 'final_clash', level: 5 },
    events: [
      // the hand signs: fast, precise, the fingers spread
      {
        pose: [
          { who: 'trunks', pose: 'ft_burnW', face: 'grit', speed: 14 },
          { who: 'frieza', pose: 'mf_recoil', face: 'shock' },
        ],
        call: (ctx) => {
          K().sheathe(st(ctx).trunks, true);
          ctx.m.battle.sfx('kiCharge', st(ctx).trunks, { vol: 0.8 });
        },
        cam: { from: { at: 'trunks', local: [0.6, 0.3, 2] }, look: { at: 'trunks', off: [0, 0.35, 0] }, fov: 40 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_burnDiamond', face: 'angry', speed: 16 }],
        cam: { from: { at: 'trunks', local: [0.32, 0.42, 0.28] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 46 },
        hold: 0.7,
      },
      // the Burning Attack — and Frieza jumps clear of it
      {
        pose: [{ who: 'trunks', pose: 'ft_burn', face: 'shout', speed: 18 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks, fz = s.frieza;
          ctx.ball = K().orb(b, t.chest().addScaledVector(t.forward, 0.8), 0.9, 0xffd45a, 0xfff6d0);
          ctx.ballFrom = ctx.ball.pos.clone();
          ctx.ballTo = fz.chest().add(fz.chest().sub(t.chest()).setY(0).normalize().multiplyScalar(30));
          ctx.fzFrom = fz.pos.clone();
          ctx.fzTo = fz.pos.clone().add(new V3(0, 6, 0));
          ctx.bN = 0;
          b.sfx('kiBlastBig', t, { vol: 1.2 });
          fz.grounded = false;
          K().pose(fz, 'mf_leap', 'smirk', 16);
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.bN++;
          const k = Math.min(1, ctx.bN / 50);
          if (ctx.ball) {
            ctx.ball.pos.copy(ctx.ballFrom.clone().lerp(ctx.ballTo, k));
            ctx.ball.pulse();
            if (ctx.bN % 2 === 0) b.vfx.trail(ctx.ball.pos.clone(), 0xffd45a, 0.8, 0.3);
            if (k >= 1) {
              b.vfx.explosion(ctx.ball.pos.clone(), 5, 0xffd45a, { smoke: true });
              b.sfx('explosionBig', null, { at: ctx.ball.pos.clone(), vol: 0.8 });
              ctx.ball.dispose();
              ctx.ball = null;
            }
          }
          const j = U.easeOutCubic(Math.min(1, ctx.bN / 26));
          s.frieza.setPosition(ctx.fzFrom.clone().lerp(ctx.fzTo, j));
          s.frieza.prevPos.copy(s.frieza.pos);
        },
        cam: { from: { at: 'trunks', off: [6, 1.2, 7] }, look: { at: 'frieza', off: [0, 0, 0] }, fov: 50 },
        hold: 1.1,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (ctx.ball) {
            ctx.ball.dispose();
            ctx.ball = null;
          }
          K().float(s.frieza, ctx.fzTo, s.frieza.yaw);
        },
        pose: [{ who: 'frieza', pose: 'mf_leap', face: 'smirk' }],
        cam: { from: { at: 'frieza', local: [1.1, -0.5, 2.6] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 44 },
        say: { who: 'mecha_frieza', line: 'Ha! Too slow — you missed me!', duration: 1.8 },
        hold: 1.6,
      },
      // the player vanishes
      {
        cam: { from: { at: 'frieza', off: [4, -2, 5] }, look: { at: 'frieza', off: [0, 0, 0] }, fov: 46 },
        cue: { key: 'dodge', label: 'Vanish', slow: 0.35, auto: 6 },
      },
      // he is above him — in line with him, the sword up — and the world goes quiet
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks, fz = s.frieza;
          b.vfx.afterimage(t.pos, 1.8, 0xffe27a);
          b.sfx('vanish', t, { vol: 1.2 });
          K().sheathe(t, false);
          // the line of the cut: Frieza's own vertical axis; Trunks comes down on it from his front,
          // facing him, so the cut plane is Trunks' facing
          const ff = new V3(Math.sin(fz.yaw), 0, Math.cos(fz.yaw));
          ctx.axis = fz.pos.clone();
          ctx.fzH = fz.height;
          ctx.cutYaw = Math.atan2(-ff.x, -ff.z);
          ctx.cutSide = new V3(Math.cos(ctx.cutYaw), 0, -Math.sin(ctx.cutYaw));
          if (ctx.cutSide.dot(shipward(ctx, ctx.axis)) > 0) ctx.cutSide.negate();
          K().float(t, fz.pos.clone().addScaledVector(ff, 0.55).setY(fz.pos.y + fz.height + 0.45), ctx.cutYaw);
          K().pose(t, 'ft_dropW', 'angry', 30);
          K().pose(fz, 'mf_leap', 'shock');
          fz.model.setExpression('shock');
          // camera marks: the cut line (half way up him) and a point square to the cut plane
          ctx.cast.cutline = { chest: () => ctx.axis.clone().setY(ctx.axis.y + ctx.fzH * 0.45) };
          ctx.cast.cutside = { chest: () => ctx.cast.cutline.chest().addScaledVector(ctx.cutSide, 5.4).add(new V3(0, 0.35, 0)) };
        },
        music: { song: null, level: 0 },
        slow: { scale: 0.2, seconds: 1.2 },
        cam: { from: { at: 'frieza', off: [2.2, -1.6, 3.2] }, look: { at: 'trunks', off: [0, 0.2, 0] }, look2: { at: 'trunks', off: [0, 0.6, 0] }, fov: 46, fov2: 40 },
        hold: 1.2,
      },
      // the cue, with both of them already where the cut needs them
      {
        cam: { from: { at: 'cutside' }, look: { at: 'cutline', off: [0, 0.5, 0] }, fov: 52 },
        cue: { key: 'heavy', label: 'Cut', slow: 0.25, auto: 6 },
      },
      // one vertical cut: the blade goes in at the crown and out below the feet
      {
        pose: [{ who: 'trunks', pose: 'ft_drop', face: 'shout', speed: 40 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.cutN = 0;
          ctx.cutFrom = s.trunks.pos.y;
          ctx.cutTo = ctx.axis.y - 1.7;
          ctx.tipPrev = null;
          b.sfx('swordSlash', s.frieza, { vol: 1.5, pitch: 0.7 });
          ctx.m.flags.friezaCut = true;
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks, fz = s.frieza;
          if (ctx.cutN >= CUT_FRAMES) {
            ctx.cutT = (ctx.cutT || 0) + 1;
            if (ctx.cut) ctx.cut.set(Math.min(0.3, ctx.cutT * 0.006), 0, Math.min(0.08, ctx.cutT * 0.002));
            return;
          }
          ctx.cutN++;
          const k = ctx.cutN / CUT_FRAMES;
          t.setPosition(new V3(t.pos.x, U.lerp(ctx.cutFrom, ctx.cutTo, k), t.pos.z));
          t.prevPos.copy(t.pos);
          pinBlade(t, ctx.axis);
          t.prevPos.copy(t.pos);
          const seg = bladeSegment(t);
          // the edge leaves its line in the air as it goes down through him
          if (seg && ctx.tipPrev && b.vfx.slash) b.vfx.slash(ctx.tipPrev, seg[1], 0xffffff, 0.9, 0.08);
          if (seg) ctx.tipPrev = seg[1].clone();
          if (ctx.cutN === CUT_FRAMES) {
            // out below his feet: he comes apart along the line it drew
            const top = ctx.axis.clone().setY(ctx.axis.y + ctx.fzH * 1.05);
            const bottom = ctx.axis.clone().setY(ctx.axis.y - 0.1);
            if (b.vfx.slash) b.vfx.slash(top, bottom, 0xffffff, 0.8, 0.09);
            b.vfx.flash(fz.chest(), 2, 0xffffff, 0.12, SL.Toon.tex.glow);
            ctx.cut = K().cutInTwo(b, fz, ctx.cutSide);
            ctx.cutT = 0;
            b.cameraTraumaAt(fz.chest(), 0.25);
          }
        },
        // square to the cut: the whole of him, and the blade going through him top to bottom
        cam: { from: { at: 'cutside' }, look: { at: 'cutline' }, fov: 50 },
        hold: 1.3,
      },
      // the halves part; he comes straight back up into the gap (still in the air)
      {
        pose: [{ who: 'trunks', pose: 'ft_drawOut', face: 'angry', speed: 16 }],
        call: (ctx) => {
          const s = st(ctx), t = s.trunks;
          const ff = new V3(Math.sin(ctx.cutYaw), 0, Math.cos(ctx.cutYaw));
          ctx.riseN = 0;
          ctx.riseFrom = t.pos.clone();
          ctx.riseTo = ctx.axis.clone().addScaledVector(ff, -1.7).setY(ctx.axis.y - 0.15);
        },
        tick: (ctx) => {
          const s = st(ctx), t = s.trunks;
          ctx.riseN++;
          ctx.cutT = (ctx.cutT || 0) + 1;
          if (ctx.cut) ctx.cut.set(Math.min(0.34, ctx.cutT * 0.006), 0, Math.min(0.08, ctx.cutT * 0.002));
          t.setPosition(ctx.riseFrom.clone().lerp(ctx.riseTo, U.easeOutCubic(Math.min(1, ctx.riseN / 22))));
          t.prevPos.copy(t.pos);
        },
        // from behind him: the halves part left and right, and Trunks comes up in the gap
        cam: { from: { at: 'frieza', local: [0.5, 0.6, -3.4] }, look: { at: 'cutline' }, fov: 46 },
        hold: 1,
      },
      // and then dozens more, faster than the eye, in the air
      {
        pose: [{ who: 'trunks', pose: 'ft_dice', face: 'angry', speed: 30 }],
        call: (ctx) => {
          ctx.diceN = 0;
          ctx.rng = U.mulberry32(767);
        },
        tick: (ctx) => {
          const b = ctx.m.battle, s = st(ctx);
          ctx.diceN++;
          ctx.cutT = (ctx.cutT || 0) + 1;
          if (ctx.cut) ctx.cut.set(0.34 + ctx.diceN * 0.002, 0, 0.08);
          if (ctx.diceN % 3 === 0 && b.vfx.slash) {
            const c = ctx.cut ? ctx.cut.c0 : ctx.cast.cutline.chest();
            const r = ctx.rng;
            const a = new V3(c.x + (r() - 0.5) * 2, c.y + (r() - 0.5) * 2.4, c.z + (r() - 0.5) * 2);
            const z = new V3(c.x + (r() - 0.5) * 2, c.y + (r() - 0.5) * 2.4, c.z + (r() - 0.5) * 2);
            b.vfx.slash(a, z, 0xf4fbff, 0.22, 0.04);
            if (ctx.diceN % 9 === 0) b.sfx('swing', s.trunks, { vol: 0.5, pitch: 1.8 });
          }
        },
        cam: { from: { at: 'trunks', local: [-1.3, 0.6, -2.2] }, look: { at: 'cutline' }, fov: 46 },
        hold: 1.5,
      },
      // what is left of him hangs in the air in front of him. He stops. The sword goes back and
      // low; the empty hand comes up at the pieces; time slows; the ki gathers in that palm
      {
        pose: [{ who: 'trunks', pose: 'ft_airPalm', face: 'angry', speed: 14 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          const c = ctx.cut ? ctx.cut.c0.clone() : ctx.cast.cutline.chest();
          if (ctx.cut) ctx.cut.dispose();
          ctx.cut = null;
          ctx.dice = K().dice(b, c, FRIEZA_COLORS, { count: 44, height: 1.3, width: 0.7, seed: 764, name: 'frieza:pieces' });
          ctx.cast.dice = { chest: () => ctx.dice.group.position.clone() };
          // square to the pieces, an arm and a half away, his chest level with them, still in the air —
          // turned so his empty left hand is on the open side (away from the ship) where the camera is
          const sw = shipward(ctx, c);
          const to = new V3(sw.z, 0, -sw.x);
          K().float(t, c.clone().addScaledVector(to, -2.1).setY(c.y - t.height * 0.55), Math.atan2(to.x, to.z));
          ctx.away = sw.clone().negate();
          ctx.palmTo = to;
          ctx.cast.palmcam = { chest: () => t.chest().addScaledVector(ctx.palmTo, -1.5).addScaledVector(ctx.away, 1.1).add(new V3(0, 0.45, 0)) };
          ctx.cast.palmcam2 = { chest: () => t.chest().addScaledVector(ctx.palmTo, -1.3).addScaledVector(ctx.away, 0.62).add(new V3(0, 0.3, 0)) };
          ctx.chargeN = 0;
          b.sfx('kiCharge', t, { vol: 0.9 });
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          if (ctx.dice) ctx.dice.tick(1 / 180);
          ctx.chargeN++;
          const palm = palmOf(t);
          const to = ctx.dice ? ctx.dice.group.position.clone().sub(palm).normalize() : new V3(0, 0, 1);
          const at = palm.clone().addScaledVector(to, 0.1);
          if (!ctx.orb && ctx.chargeN > 8) ctx.orb = K().orb(b, at, 0.04, 0xffc83a, 0xfff6d0);
          if (ctx.orb) {
            ctx.orb.pos.copy(at);
            ctx.orb.set(Math.min(0.26, 0.04 + ctx.chargeN * 0.004));
            ctx.orb.pulse();
          }
          // his ki runs down the arm into the hand
          if (ctx.chargeN % 3 === 0) {
            const r = ctx.rng || Math.random;
            const from = palm.clone().add(new V3((r() - 0.5) * 1.4, (r() - 0.5) * 1.2, (r() - 0.5) * 1.4));
            for (let i = 0; i <= 4; i++) b.vfx.trail(from.clone().lerp(palm, i / 4), 0xffd65a, 0.16, 0.25);
          }
        },
        slow: { scale: 0.3, seconds: 2 },
        // over his left shoulder, pushing in on the empty hand and what it points at
        cam: { from: { at: 'palmcam' }, to: { at: 'palmcam2' }, look: { at: 'dice' }, fov: 46, fov2: 36 },
        hold: 2,
      },
      // the blast, from that palm, point blank, in the air: the pieces are gone
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          const from = palmOf(t);
          const at = ctx.dice ? ctx.dice.group.position.clone() : from.clone().addScaledVector(t.forward, 2);
          if (ctx.orb) {
            ctx.orb.dispose();
            ctx.orb = null;
          }
          for (let i = 0; i <= 18; i++) b.vfx.trail(from.clone().lerp(at, i / 18), 0xffd23a, 0.55 + (i / 18) * 0.5, 0.4);
          b.vfx.explosion(at, 3.4, 0xffc83a, { smoke: true });
          b.vfx.ring(at, 4.5, 0xffe6a0, 0.5);
          SL.ScreenFX.flash(0.35, '#fff0c0');
          if (ctx.dice) ctx.dice.vaporize();
          b.sfx('kiBlastBig', t, { vol: 1.3 });
          b.cameraTraumaAt(at, 0.55);
          s.frieza.setHidden(true);
          ctx.m.flags.friezaDestroyed = true;
          b.emit('trunksFinalBlast', { fighter: t, from, to: at, hand: 'handL', grounded: !!t.grounded });
          ctx.cast.blastmid = { chest: () => t.chest().lerp(at, 0.5) };
          ctx.cast.blastcam = { chest: () => ctx.cast.blastmid.chest().addScaledVector(ctx.away || new V3(1, 0, 0), 8.5).add(new V3(0, 0.6, 0)) };
        },
        // side on, wide, from the open side: him at one end in the air, the blast at the other
        cam: { from: { at: 'blastcam' }, look: { at: 'blastmid' }, fov: 46 },
        hold: 1.6,
      },
      // he hangs there a moment longer
      {
        pose: [{ who: 'trunks', pose: 'ft_airHero', face: 'calm', speed: 6 }],
        call: (ctx) => {
          const t = st(ctx).trunks, away = ctx.away || new V3(1, 0, 0), to = ctx.palmTo || t.forward.clone();
          ctx.cast.herocam = { chest: () => t.chest().addScaledVector(away, 2.2).addScaledVector(to, 1.2).add(new V3(0, -1.3, 0)) };
          ctx.cast.herocam2 = { chest: () => t.chest().addScaledVector(away, 1.8).addScaledVector(to, 1).add(new V3(0, -1.05, 0)) };
        },
        // from below, on the open side: him against the sky
        cam: { from: { at: 'herocam' }, to: { at: 'herocam2' }, look: { at: 'trunks', off: [0, 0.35, 0] }, fov: 42, fov2: 38 },
        hold: 1.9,
      },
      {
        pose: [{ who: 'cold', pose: 'kc_shock', face: 'shock' }],
        cam: { from: { at: 'cold:face', local: [0.2, 0, 1.4] }, look: { at: 'cold:face' }, fov: 36 },
        say: { who: 'king_cold', line: '...Frieza?', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (ctx.ball) ctx.ball.dispose();
      if (ctx.cut) ctx.cut.dispose();
      if (ctx.dice) ctx.dice.dispose();
      if (ctx.orb) ctx.orb.dispose();
      ctx.ball = ctx.cut = ctx.dice = ctx.orb = null;
      const fz = s.frieza;
      fz.setHidden(true);
      fz.untargetable = true;
      fz.alive = false;
      const t = s.trunks;
      t.setHidden(false);
      if (!t.grounded) K().place(t, K().ground(ctx.m.battle, t.pos));
      K().sheathe(t, true);
      // the same story state watched or skipped
      ctx.m.flags.friezaCut = true;
      ctx.m.flags.friezaDestroyed = true;
    },
  };

  /* ================================================================ cold_sword */

  S.cold_sword = {
    id: 'cold_sword',
    cast: castAll,
    music: { song: 'battle', level: 2 },
    events: [
      {
        pose: [
          { who: 'cold', pose: 'kc_offer', face: 'smirk' },
          { who: 'trunks', pose: 'ft_calm', face: 'calm' },
        ],
        cam: { from: { at: 'cold', local: [1.6, 0.1, 3.6] }, look: { at: 'cold', off: [0, 0.7, 0] }, fov: 42 },
        say: { who: 'king_cold', line: 'Remarkable. My son was careless — you are not. Join me, boy. His place is empty: planets, armies, all of it yours.', duration: 5 },
        hold: 5.1,
      },
      {
        cam: { from: { at: 'trunks:face', local: [0.1, 0, 1] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'No.', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'cold', pose: 'kc_walk', face: 'smirk', speed: 6 }],
        // he comes close enough to take it
        call: (ctx) => {
          const s = st(ctx);
          const toT = s.trunks.pos.clone().sub(s.cold.pos).setY(0).normalize();
          ctx.coldTo = K().ground(ctx.m.battle, s.trunks.pos.clone().addScaledVector(toT, -2.3));
          ctx.coldFrom = s.cold.pos.clone();
          ctx.cwN = 0;
        },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.cwN++;
          const k = U.easeInOutCubic(Math.min(1, ctx.cwN / 120));
          s.cold.setPosition(ctx.coldFrom.clone().lerp(ctx.coldTo, k));
          s.cold.prevPos.copy(s.cold.pos);
          K().faceTo(s.cold, s.trunks.pos);
          if (ctx.cwN === 121) K().pose(s.cold, 'kc_reach', 'smirk');
        },
        cam: { from: { at: 'trunks', local: [-0.8, 0.6, -1.8] }, look: { at: 'cold', off: [0, 0.9, 0] }, fov: 42 },
        say: { who: 'king_cold', line: 'Then humour an old man. That sword of yours — may I see it? I have never seen a blade cut like that.', duration: 4.4 },
        hold: 4.5,
      },
      // the player hands it over
      {
        pose: [{ who: 'trunks', pose: 'ft_draw', face: 'calm', speed: 8 }],
        call: (ctx) => {
          K().sheathe(st(ctx).trunks, false);
          ctx.m.battle.sfx('swordDraw', st(ctx).trunks, { vol: 0.9 });
        },
        cam: { from: { at: 'trunks', local: [1.2, 0.4, 2.4] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 42 },
        cue: { key: 'light', label: 'Hand it over', auto: 8 },
      },
      {
        pose: [
          { who: 'trunks', pose: 'ft_offer', face: 'calm', speed: 8 },
          { who: 'cold', pose: 'kc_hold', face: 'smirk', speed: 6 },
        ],
        call: (ctx) => {
          const s = st(ctx);
          K().handSword(s.trunks, s.cold);
          s.trunks.sheathed = false;
          ctx.m.flags.swordGiven = true;
        },
        cam: { from: { at: 'cold', local: [1.2, 0.5, 2.8] }, look: { at: 'cold', off: [0, 0.8, 0] }, fov: 42 },
        say: { who: 'king_cold', line: 'Ah. With a blade like this, anyone could have cut my son down.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [
          { who: 'cold', pose: 'kc_swordW', face: 'angry', speed: 10 },
          { who: 'trunks', pose: 'ft_calm', face: 'calm' },
        ],
        cam: { from: { at: 'trunks', off: [5, 1.6, 4] }, look: { at: 'cold', off: [0, 1.4, 0] }, fov: 46 },
        say: { who: 'king_cold', line: 'Anyone!', duration: 1.2, style: 'shout' },
        hold: 0.8,
      },
      // the blade comes down — the player catches it
      {
        pose: [{ who: 'cold', pose: 'kc_sword', face: 'angry', speed: 14 }],
        cam: { from: { at: 'trunks', off: [3.4, 1.2, 3.2] }, look: { at: 'trunks', off: [0, 0.8, 0] }, fov: 44 },
        cue: { key: 'guard', label: 'Catch', slow: 0.2, auto: 5 },
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_catchBlade', face: 'calm', speed: 30 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          const hand = t.model.joints.handL.getWorldPosition(new V3());
          b.vfx.sparks(hand, 0xfff3c0, 24, 10, 0.1);
          b.vfx.flash(hand, 1.2, 0xffffff, 0.1, SL.Toon.tex.glow);
          b.sfx('swordClang', t, { vol: 1.3 });
          b.cameraTraumaAt(hand, 0.3);
          ctx.m.flags.bladeCaught = true;
        },
        // the blade has to be IN his hand: slide Cold so the point on his blade at the height of
        // Trunks' hand sits in it (the poses are still blending, so this follows them every tick)
        tick: (ctx) => {
          const s = st(ctx), kc = s.cold;
          const g = kc.model.props && kc.model.props.borrowedSword;
          if (!g) return;
          // fresh matrices: headless runs never render, and a stale matrix would push him every tick
          kc.object.updateMatrixWorld(true);
          s.trunks.object.updateMatrixWorld(true);
          const hand = s.trunks.model.joints.handL.getWorldPosition(new V3());
          const top = (g.userData.tip || 0.9) - 0.06;
          let best = null, bestDy = Infinity;
          for (let u = 0.25; u <= 0.95; u += 0.05) {
            const p = g.localToWorld(new V3(0, 0.096 + u * (top - 0.096), 0));
            const dy = Math.abs(p.y - hand.y);
            if (dy < bestDy) (bestDy = dy), (best = p);
          }
          const d = hand.sub(best).setY(0);
          if (d.length() > 1.2) d.setLength(1.2);
          kc.setPosition(kc.pos.clone().add(d));
          kc.prevPos.copy(kc.pos);
        },
        music: { song: null, level: 0 },
        cam: { from: { at: 'trunks', local: [0.9, 1.1, 1.3] }, look: { at: 'trunks', off: [0, 0.95, 0] }, fov: 40 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'cold', pose: 'kc_sword', face: 'shock' }],
        cam: { from: { at: 'cold:face', local: [0.2, 0, 1.3] }, look: { at: 'cold:face' }, fov: 36 },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'trunks:face', local: [-0.15, 0, 1] }, look: { at: 'trunks:face' }, fov: 34 },
        say: { who: 'future_trunks', line: 'It was never the sword.', duration: 2.2, style: 'quiet' },
        hold: 2.3,
      },
      // the player fires, point blank
      {
        pose: [{ who: 'trunks', pose: 'ft_palm', face: 'angry', speed: 16 }],
        call: (ctx) => {
          const s = st(ctx);
          K().swordBack(s.trunks, s.cold);
          s.trunks.model.setPropVisible && s.trunks.model.setPropVisible('sword', false);
        },
        cam: { from: { at: 'trunks', local: [1.4, 0.4, 1.6] }, look: { at: 'cold', off: [0, 0.6, 0] }, fov: 42 },
        cue: { key: 'blast', label: 'Fire', auto: 6 },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks, kc = s.cold;
          const from = t.chest().addScaledVector(t.forward, 0.6);
          const through = kc.chest().add(kc.chest().sub(from).setY(0).normalize().multiplyScalar(6));
          for (let i = 0; i <= 16; i++) b.vfx.trail(from.clone().lerp(through, i / 16), 0xffe27a, 0.55, 0.3);
          b.vfx.explosion(kc.chest().addScaledVector(kc.forward, -0.8), 2.6, 0xffe27a, { smoke: true });
          SL.ScreenFX.flash(0.35, '#fff0c0');
          b.sfx('kiBlastBig', t, { vol: 1.3 });
          // thrown back into the side of his own ship
          const ship = s.ship && s.ship.alive ? s.ship.pos : null;
          const dir = ship ? ship.clone().sub(kc.pos).setY(0).normalize() : kc.forward.clone().negate();
          ctx.kcFrom = kc.pos.clone();
          const dist = ship ? Math.max(6, kc.pos.distanceTo(ship) - 19) : 14;
          ctx.kcTo = K().ground(b, kc.pos.clone().addScaledVector(dir, dist)).add(new V3(0, 2.4, 0));
          ctx.kcN = 0;
          K().pose(kc, 'hitHeavy', 'hurt', 20);
          kc.grounded = false;
          ctx.m.flags.coldPierced = true;
        },
        tick: (ctx) => {
          const kc = st(ctx).cold;
          ctx.kcN++;
          const k = U.easeOutCubic(Math.min(1, ctx.kcN / 40));
          kc.setPosition(ctx.kcFrom.clone().lerp(ctx.kcTo, k));
          kc.prevPos.copy(kc.pos);
          if (ctx.kcN === 40) {
            ctx.m.battle.vfx.dust(kc.pos.clone(), 3, 14);
            ctx.m.battle.cameraTraumaAt(kc.pos, 0.5);
            ctx.m.battle.sfx('groundImpact', kc, { vol: 1 });
          }
        },
        cam: { from: { at: 'trunks', off: [7, 2, 5] }, look: { at: 'cold', off: [0, 0.6, 0] }, fov: 50 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'cold', pose: 'kc_pinned', face: 'hurt' }],
        call: (ctx) => {
          const kc = st(ctx).cold;
          if (ctx.kcTo) K().float(kc, ctx.kcTo);
        },
        cam: { from: { at: 'cold', local: [0.9, 0.7, 2.4] }, look: { at: 'cold', off: [0, 0.9, 0] }, fov: 38 },
        say: { who: 'king_cold', line: 'Wait — wait! Anything you want! Planets — a hundred planets, a thousand, the whole empire!', duration: 3.8, style: 'shout' },
        hold: 3.9,
      },
      // he rises, gathers it overhead, and the player throws it
      {
        pose: [{ who: 'trunks', pose: 'ft_busterCharge', face: 'angry', speed: 10 }],
        call: (ctx) => {
          const s = st(ctx), t = s.trunks, b = ctx.m.battle;
          K().float(t, t.pos.clone().add(new V3(0, 3, 0)));
          K().faceTo(t, s.cold.pos);
          ctx.buster = K().orb(b, t.chest().add(new V3(0, 1.3, 0)), 0.4, 0xffd23a, 0xfff8d0);
          ctx.busN = 0;
          b.sfx('kiCharge', t, { vol: 1 });
        },
        tick: (ctx) => {
          const t = st(ctx).trunks;
          ctx.busN++;
          if (ctx.buster) {
            ctx.buster.set(0.4 + Math.min(1, ctx.busN / 60) * 1.1);
            ctx.buster.pos.copy(t.chest().add(new V3(0, 1.1 + ctx.buster.radius, 0)));
            ctx.buster.pulse();
          }
        },
        cam: { from: { at: 'trunks', local: [1.8, -0.8, 3.2] }, look: { at: 'trunks', off: [0, 1.2, 0] }, fov: 48 },
        cue: { key: 'ult', label: 'Finish Buster', auto: 8 },
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_busterFire', face: 'shout', speed: 16 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.busFrom = ctx.buster ? ctx.buster.pos.clone() : s.trunks.chest();
          ctx.busTo = s.cold.chest();
          ctx.busN = 0;
          b.sfx('kiBlastBig', s.trunks, { vol: 1.4, pitch: 0.8 });
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.m.battle;
          ctx.busN++;
          const k = Math.min(1, ctx.busN / 30);
          if (ctx.buster) {
            ctx.buster.pos.copy(ctx.busFrom.clone().lerp(ctx.busTo, k));
            ctx.buster.pulse();
            if (ctx.busN % 2 === 0) b.vfx.trail(ctx.buster.pos.clone(), 0xffd23a, 1, 0.3);
          }
          if (ctx.busN === 30) {
            if (ctx.buster) ctx.buster.dispose();
            ctx.buster = null;
            b.vfx.explosion(ctx.busTo, 10, 0xffd23a, { smoke: true });
            SL.ScreenFX.flash(0.7, '#fff4c0');
            b.cameraTraumaAt(ctx.busTo, 1);
            b.sfx('explosionHuge', null, { at: ctx.busTo, vol: 1.3 });
            s.cold.setHidden(true);
            ctx.m.flags.coldDestroyed = true;
          }
          // the ship goes with him, one blast after another
          if (ctx.busN > 34 && ctx.busN % 8 === 0 && s.ship && s.ship.alive && ctx.busN < 34 + 8 * 6) {
            const a = (ctx.busN / 8) * 1.7;
            b.vfx.explosion(s.ship.pos.clone().add(new V3(Math.cos(a) * 12, 8 + (ctx.busN % 3) * 5, Math.sin(a) * 12)), 7, 0xff9a4a, { smoke: true });
            b.sfx('explosionBig', null, { at: s.ship.pos.clone(), vol: 1 });
          }
          if (ctx.busN === 34 + 8 * 6 && s.ship && s.ship.alive) {
            b.vfx.explosion(s.ship.pos.clone().add(new V3(0, 12, 0)), 22, 0xffa050, { smoke: true });
            b.cameraTraumaAt(s.ship.pos, 0.9);
            K().propGone(b, s.ship);
            ctx.m.flags.shipDestroyed = true;
          }
        },
        cam: { from: { at: 'trunks', off: [-10, 4, 12] }, look: { at: 'cold', off: [0, 4, 0] }, fov: 56 },
        hold: 1.7,
      },
      {
        music: { song: 'farewell', level: 1 },
        cam: { from: { at: 'trunks', off: [-16, 5, 18] }, to: { at: 'trunks', off: [-18, 7, 22] }, look: { at: 'trunks', off: [0, 4, -26] }, fov: 58 },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.m.battle;
      if (ctx.buster) ctx.buster.dispose();
      ctx.buster = null;
      K().swordBack(s.trunks, s.cold);
      K().sheathe(s.trunks, true);
      s.cold.setHidden(true);
      s.cold.untargetable = true;
      s.cold.alive = false;
      if (s.ship && s.ship.alive) {
        b.vfx.explosion(s.ship.pos.clone().add(new V3(0, 12, 0)), 22, 0xffa050, { smoke: true });
        K().propGone(b, s.ship);
      }
      if (!s.trunks.grounded) K().place(s.trunks, K().ground(b, s.trunks.pos));
      ctx.m.flags.swordGiven = true;
      ctx.m.flags.bladeCaught = true;
      ctx.m.flags.coldPierced = true;
      ctx.m.flags.coldDestroyed = true;
      ctx.m.flags.shipDestroyed = true;
    },
  };

  /* ================================================================ trunks_waits */

  S.trunks_waits = {
    id: 'trunks_waits',
    cast: castAll,
    music: { song: 'farewell', level: 2 },
    events: [
      // the gold goes out of his hair
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          K().toForm(t, 'base');
          b.vfx.ring(t.pos.clone().add(new V3(0, 0.3, 0)), 3, 0xfff3c0, 0.5, new V3(0, 1, 0));
          K().pose(t, 'ft_calm', 'calm');
        },
        mood: { amount: 0.25, color: 0x3a3444, seconds: 1.4 },
        cam: { from: { at: 'trunks', local: [1.2, 0.3, 3.2] }, to: { at: 'trunks', local: [1, 0.3, 2.6] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 42 },
        hold: 2.4,
      },
      // the Z Fighters come down out of the sky to him
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.m.battle, t = s.trunks;
          ctx.land = [];
          s.ridge.forEach((f, i) => {
            f.setHidden(false);
            const at = K().ground(b, t.pos.clone().add(new V3(-8 + i * 2.6, 0, -10 + (i % 2) * 1.5)));
            K().float(f, at.clone().add(new V3(0, 9 + i, 0)));
            K().faceTo(f, t.pos);
            K().pose(f, 'flyIdle', f === s.vegeta ? 'angry' : 'neutral');
            ctx.land.push({ f, from: f.pos.clone(), to: at });
          });
          ctx.landN = 0;
        },
        tick: (ctx) => {
          ctx.landN++;
          const k = U.easeOutCubic(Math.min(1, ctx.landN / 140));
          for (const L of ctx.land) {
            L.f.setPosition(L.from.clone().lerp(L.to, k));
            L.f.prevPos.copy(L.f.pos);
          }
        },
        cam: { from: { at: 'trunks', local: [-1.2, 0.5, -2.4] }, look: { at: 'trunks', off: [-4, 3, -10] }, fov: 50 },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          for (const L of ctx.land || []) {
            K().place(L.f, L.to);
            K().faceTo(L.f, s.trunks.pos);
          }
          K().pose(s.vegeta, 'armsCrossed', 'angry');
          K().pose(s.piccolo, 'armsCrossed', 'neutral');
          K().pose(s.krillin, 'idle', 'shock');
          K().pose(s.gohan, 'idle', 'neutral');
          K().faceTo(s.trunks, s.vegeta.pos);
        },
        cam: { from: { at: 'vegeta', local: [0.9, 0.3, 2.4] }, look: { at: 'vegeta', off: [0, 0.35, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'You. Who are you? A Super Saiyan — how? There are no other Saiyans left alive.', duration: 4 },
        hold: 4.1,
      },
      // he looks at Vegeta a moment too long, and then away
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'soft' }],
        cam: { from: { at: 'trunks:face', local: [0.2, 0, 1.05] }, look: { at: 'trunks:face' }, fov: 34 },
        hold: 1.9,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.trunks, s.krillin.pos);
        },
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm' }],
        cam: { from: { at: 'trunks', local: [0.9, 0.4, 2.4] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'I cannot tell you that. I am going to meet Son Goku. He lands about three hours from now, not far north of here.', duration: 4.6, style: 'quiet' },
        hold: 4.7,
      },
      {
        cam: { from: { at: 'krillin', local: [0.7, 0.35, 1.9] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'Goku? He’s alive? Hey — how could you possibly know that?', duration: 3 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_walk', face: 'calm', speed: 7 }],
        move: { who: 'trunks', at: 'trunks', off: [0, 0, -6], seconds: 2.6, ease: 'linear' },
        cam: { from: { at: 'gohan', local: [0.6, 0.2, 1.8] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 44 },
        say: { who: 'future_trunks', line: 'Come with me, if you want to see him.', duration: 2.6, style: 'quiet' },
      },
    ],
    end(ctx) {
      const s = st(ctx), t = s.trunks;
      K().toForm(t, 'base');
      K().sheathe(t, true);
      for (const f of s.ridge) f.setHidden(false);
      ctx.m.flags.invited = true;
    },
  };
})();
