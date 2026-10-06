/*
 * SCENES — Chapter 6: the two absorptions.
 *
 *   piccolo_hellzone   Piccolo against 17, the Hellzone Grenade, and the shadow that lands between them
 *   cell_takes_17      the tail, and then there is one android left
 *   tien_holds_him     a man with no chance buying minutes with his own life
 *   cell_takes_18      Vegeta steps aside, and the sentence finishes itself
 *   perfect_arrives    the finished article, and how little it cares
 *   ff_dare / ff_fire  Vegeta, beaten, is offered one free shot: the Final Flash, what it takes off, what grows back
 *
 * Both absorptions are staged the same way on purpose: a grab, a moment where
 * somebody could still stop it, and then a transformation that nobody wanted.
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

  // 17 turning on the spot, looking at what hangs all round him
  C.a17_lookRound = (t) => ({
    root: { y: -0.02 }, chest: [-4, Math.sin(t * 1.8) * 30, 0], head: [-14, Math.sin(t * 1.8 + 0.6) * 40, 0],
    shoulderL: [-20, 0, 24], elbowL: [-30, 0, 0], shoulderR: [-20, 0, -24], elbowR: [-30, 0, 0],
    thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [4, 0, -10], kneeR: [8, 0, 0],
    hands: ['open', 'open'],
  });
  // Piccolo's arms going like pistons: a blast from each hand, over and over
  C.p_volley = (t) => {
    const a = Math.sin(t * 22), c = Math.cos(t * 22);
    return {
      root: { y: -0.04 }, chest: [-4, a * 14, 0], head: [-6, -a * 6, 0],
      shoulderR: [-80 - a * 20, 0, -30 + a * 40], elbowR: [-20 - Math.max(0, a) * 60, 0, 0],
      shoulderL: [-80 + c * 20, 0, 30 - c * 40], elbowL: [-20 - Math.max(0, -c) * 60, 0, 0],
      thighL: [-22, 10, 14], kneeL: [28, 0, 0], thighR: [12, -10, -14], kneeR: [20, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the fist that closes it
  C.p_hellzoneClose = {
    root: { y: -0.06, rx: 6 }, chest: [6, -20, 0], head: [-8, 14, 0],
    shoulderR: [-100, 0, -10], elbowR: [-30, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-60, 0, 0],
    thighL: [-28, 10, 14], kneeL: [34, 0, 0], thighR: [14, -10, -14], kneeR: [18, 0, 0],
    hands: ['open', 'fist'],
  };

  /**
   * Piccolo against Android 17 (2026-10-02, the owner's brief: the Hellzone Grenade, visual). The
   * two of them trading blows on the coast; Piccolo backs off and empties his hands — two dozen ki
   * blasts that do not hit anything, that stop in the air and hang round 17 like a cage. A fist
   * closes. All of them at once. And out of the smoke, 17 inside his barrier: not bad. Then the
   * shadow that has been eating towns lands between them.
   */
  S.piccolo_hellzone = {
    id: 'piccolo_hellzone',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, a17: s.a17, cell: s.cell };
    },
    music: { song: 'battle', level: 5 },
    events: [
      // mid-fight: a blow each, blocked; the ground shakes under them
      {
        call: (ctx) => {
          const st = ctx.b.story, b = ctx.b, F = ctx.opts.field;
          st.cell.setHidden(true);
          st.a17.setHidden(false);
          st.a17.setPosition(ground(b, F.clone().add(new V3(0, 0, -2))));
          st.piccolo.setPosition(ground(b, F.clone().add(new V3(0, 0, -0.6))));
          faceTo(st.a17, st.piccolo.pos);
          faceTo(st.piccolo, st.a17.pos);
          pt(ctx, 'mid', st.a17.pos.clone().lerp(st.piccolo.pos, 0.5));
        },
        pose: [
          { who: 'piccolo', pose: 'p_chop', face: 'shout', speed: 14 },
          { who: 'a17', pose: 'a17_jab', face: 'smirk', speed: 14 },
        ],
        sfx: { name: 'punchHeavy', vol: 1.1, pitch: 0.8 },
        vfx: { kind: 'ring', at: { at: 'mid', off: [0, 1.3, 0] }, radius: 1.8, color: 0xfff3c0 },
        shake: { at: { at: 'mid' }, amount: 0.5 },
        cam: { from: { at: 'mid', off: [4.2, 1.4, 1.2] }, to: { at: 'mid', off: [3.6, 1.3, 0.8] }, look: { at: 'mid', off: [0, 1.2, 0] }, fov: 44 },
        hold: 1.2,
      },
      {
        pose: [
          { who: 'piccolo', pose: 'p_elbow', face: 'shout', speed: 14 },
          { who: 'a17', pose: 'a17_kick', face: 'smirk', speed: 14 },
        ],
        sfx: { name: 'block', vol: 1.1, pitch: 0.7 },
        vfx: { kind: 'ring', at: { at: 'mid', off: [0, 1.1, 0] }, radius: 1.6, color: 0xfff3c0 },
        cam: { from: { at: 'mid', off: [-3.8, 1.1, -1.6] }, look: { at: 'mid', off: [0, 1.1, 0] }, fov: 42 },
        hold: 1,
      },
      {
        cam: { from: { at: 'a17:face', local: [0.18, 0.18, 0.9] }, look: { at: 'a17:head', off: [0, 0.15, 0] }, fov: 36 },
        pose: [{ who: 'a17', pose: 'a17_idle', face: 'smirk', speed: 6 }],
        say: { who: 'android_17', line: 'You are better than Gero\'s files said. It will not matter.', duration: 3.2 },
        hold: 3.4,
      },
      // Piccolo jumps back and empties his hands: the blasts fly out and STOP, all round 17
      {
        call: (ctx) => {
          const st = ctx.b.story, b = ctx.b, p = st.piccolo, a = st.a17;
          const back = p.pos.clone().sub(a.pos).setY(0).normalize();
          ctx.p0 = p.pos.clone();
          ctx.p1 = ground(b, a.pos.clone().addScaledVector(back, 9)).add(new V3(0, 2.4, 0));
          ctx.cage = [];
          ctx.fired = 0;
          ctx.centre = a.chest();
          pt(ctx, 'cage', ctx.centre);
          // both of them in it: the side of the line between the boy firing and the cage he is building
          const side = new V3(-back.z, 0, back.x);
          pt(ctx, 'volleyCam', ctx.centre.clone().lerp(ctx.p1, 0.5).addScaledVector(side, 12).add(new V3(0, 1.6, 0)));
          pt(ctx, 'volleyCam2', ctx.centre.clone().lerp(ctx.p1, 0.5).addScaledVector(side, 13.5).add(new V3(0, 2.4, 0)));
          pt(ctx, 'volleyLook', ctx.centre.clone().lerp(ctx.p1, 0.42));
        },
        pose: [{ who: 'piccolo', pose: 'p_volley', face: 'shout', speed: 10 }],
        cam: { from: { at: 'volleyCam' }, to: { at: 'volleyCam2' }, look: { at: 'volleyLook' }, fov: 50 },
        tick: (ctx, t) => {
          const st = ctx.b.story, b = ctx.b, p = st.piccolo, TK = SL.data.trunksKit;
          // the jump back into the air
          const k = U.easeOutCubic(Math.min(1, t / 0.5));
          p.setPosition(ctx.p0.clone().lerp(ctx.p1, k));
          p.prevPos.copy(p.pos);
          p.grounded = false;
          faceTo(p, st.a17.pos);
          // a blast every few frames, each to its own place on a sphere round 17
          const want = Math.min(24, Math.floor(Math.max(0, t - 0.4) / 0.075));
          while (ctx.fired < want) {
            const i = ctx.fired++;
            const lat = Math.acos(1 - (2 * (i + 0.5)) / 24) - Math.PI / 2, lon = i * 2.39996;
            const at = ctx.centre.clone().add(new V3(Math.cos(lat) * Math.cos(lon), Math.sin(lat) * 0.8 + 0.2, Math.cos(lat) * Math.sin(lon)).multiplyScalar(3.6));
            const hand = p.chest().add(new V3(0, 0.1, 0));
            const o = TK.orb(b, hand, 0.16, 0xd8ff7a, 0xffffff);
            ctx.cage.push({ o, from: hand, to: at, t0: t });
            b.sfx('kiBlast', p, { pitch: 1.2 + (i % 4) * 0.05, vol: 0.5 });
          }
          for (const c of ctx.cage) {
            const kk = U.clamp01((t - c.t0) / 0.35);
            const mid = c.from.clone().lerp(c.to, 0.5).add(new V3(0, 2.2, 0));
            const a1 = c.from.clone().lerp(mid, kk), a2 = mid.clone().lerp(c.to, kk);
            c.o.group.position.copy(a1.lerp(a2, kk));
            if (kk >= 1) c.o.group.position.y += Math.sin(t * 6 + c.t0 * 9) * 0.05;
            c.o.pulse();
          }
        },
        hold: 2.6,
      },
      // 17 looks round at them: they are everywhere
      {
        pose: [{ who: 'a17', pose: 'a17_lookRound', face: 'shock', speed: 1 }],
        cam: { from: { at: 'a17', local: [0.6, 0.55, 1.7] }, to: { at: 'a17', local: [0.5, 0.5, 1.4] }, look: { at: 'a17:head', off: [0, 0.05, 0] }, fov: 54 },
        tick: (ctx, t) => {
          for (const c of ctx.cage) {
            c.o.group.position.y = c.to.y + Math.sin(t * 6 + c.t0 * 9) * 0.05;
            c.o.pulse();
          }
        },
        hold: 1.8,
      },
      // the fist closes
      {
        pose: [{ who: 'piccolo', pose: 'p_hellzoneClose', face: 'shout', speed: 12 }],
        cam: { from: { at: 'piccolo:face', local: [0.3, 0.16, 0.95] }, look: { at: 'piccolo:head', off: [0, 0.12, 0] }, fov: 38 },
        say: { who: 'piccolo', line: 'HELLZONE GRENADE!', duration: 1.6, style: 'shout' },
        tick: (ctx) => {
          for (const c of ctx.cage) c.o.pulse();
        },
        hold: 1.5,
      },
      // all of them at once
      {
        cam: { from: { at: 'cage', off: [9, 3, 8] }, look: { at: 'cage' }, fov: 46 },
        tick: (ctx, t) => {
          const b = ctx.b;
          const k = U.easeInCubic(Math.min(1, t / 0.4));
          for (const c of ctx.cage) {
            if (!c.o) continue;
            c.o.group.position.copy(c.to.clone().lerp(ctx.centre, k));
            if (k >= 1) {
              c.o.dispose();
              c.o = null;
            }
          }
          if (k >= 1 && !ctx.boom) {
            ctx.boom = true;
            // a dome of small bursts rather than one white flash
            for (let i = 0; i < 9; i++) {
              const a = (i / 9) * Math.PI * 2;
              b.vfx.explosion(ctx.centre.clone().add(new V3(Math.cos(a) * 1.1, (i % 3) * 0.5 - 0.3, Math.sin(a) * 1.1)), 1.1, 0xd8ff7a, { smoke: true });
            }
            b.vfx.ring(ground(b, ctx.centre), 9, 0xe8ffc0, 0.6);
            b.vfx.dust(ground(b, ctx.centre), 4, 24);
            b.stage.crater(ground(b, ctx.centre), 5, 0.8, null);
            b.sfx('explosionBig', null, { at: ctx.centre, vol: 1.3 });
            b.cameraTraumaAt(ctx.centre, 0.9);
          }
        },
        hold: 1.8,
      },
      // out of the smoke: 17, inside a dome of green light, his scarf barely moving
      {
        call: (ctx) => {
          const st = ctx.b.story, b = ctx.b, a = st.a17;
          a.setState('scripted', { pose: 'a17_barrier', expression: 'smirk' });
          const dome = new THREE.Mesh(new THREE.SphereGeometry(1.5, 28, 18), new THREE.MeshBasicMaterial({ color: 0x8affc8, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }));
          dome.position.copy(a.chest());
          b.scene.add(dome);
          ctx.dome = dome;
          b.sfx('aura', a, { pitch: 1.6, vol: 0.6 });
        },
        cam: { from: { at: 'a17', local: [1.4, 0.5, 4.2] }, to: { at: 'a17', local: [1.1, 0.45, 3.4] }, look: { at: 'a17', off: [0, 0.2, 0] }, fov: 42 },
        tick: (ctx, t) => {
          if (ctx.dome) ctx.dome.material.opacity = 0.32 * (1 - U.clamp01((t - 1.6) / 0.6));
        },
        hold: 2.3,
      },
      {
        call: (ctx) => {
          if (ctx.dome) {
            ctx.b.scene.remove(ctx.dome);
            ctx.dome.geometry.dispose();
            ctx.dome.material.dispose();
            ctx.dome = null;
          }
        },
        pose: [{ who: 'a17', pose: 'a17_idle', face: 'smirk', speed: 6 }],
        cam: { from: { at: 'a17:face', local: [0.15, 0.18, 0.9] }, look: { at: 'a17:head', off: [0, 0.15, 0] }, fov: 36 },
        say: { who: 'android_17', line: 'Not bad. My turn.', duration: 2 },
        hold: 2.2,
      },
      // a shadow over both of them: something lands between them, and it is not interested in Piccolo
      {
        call: (ctx) => {
          const st = ctx.b.story, b = ctx.b, c = st.cell, p = st.piccolo;
          p.setPosition(ground(b, p.pos));
          p.grounded = true;
          ctx.c1 = ground(b, st.a17.pos.clone().lerp(p.pos, 0.45));
          c.setHidden(false);
          c.applyForm(0);
          c.setPosition(ctx.c1.clone().add(new V3(0, 9, 0)));
          faceTo(c, st.a17.pos);
          pt(ctx, 'drop', ctx.c1);
        },
        pose: [
          { who: 'cell', pose: 'cl_hunch', face: 'smirk' },
          { who: 'piccolo', pose: 'idle', face: 'shock' },
          { who: 'a17', pose: 'a17_idle', face: 'calm' },
        ],
        cam: { from: { at: 'drop', off: [-6, 1.2, 7.5] }, look: { at: 'drop', off: [0, 6, 0] }, look2: { at: 'drop', off: [0, 1.3, 0] }, ease: 'out', fov: 52 },
        tick: (ctx, t) => {
          const c = ctx.b.story.cell, k = U.easeInCubic(Math.min(1, t / 0.6));
          c.setPosition(ctx.c1.clone().add(new V3(0, 9 * (1 - k), 0)));
          c.prevPos.copy(c.pos);
          if (k >= 1 && !ctx.landed) {
            ctx.landed = true;
            c.grounded = true;
            ctx.b.vfx.dust(ctx.c1, 2.4, 16);
            ctx.b.stage.crater(ctx.c1, 2.4, 0.4, null);
            ctx.b.sfx('groundImpact', c, { vol: 1.2, pitch: 0.7 });
            ctx.b.cameraTraumaAt(ctx.c1, 0.6);
          }
        },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'cell:face', local: [0.2, 0.18, 1] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 38 },
        say: { who: 'cell', line: 'Seventeen. At last.', duration: 2.2 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const st = ctx.b.story, b = ctx.b;
      for (const c of ctx.cage || []) if (c.o) c.o.dispose();
      if (ctx.dome) {
        b.scene.remove(ctx.dome);
        ctx.dome.geometry.dispose();
        ctx.dome.material.dispose();
      }
      st.piccolo.grounded = true;
      st.piccolo.setPosition(ground(b, st.piccolo.pos));
      st.cell.setHidden(false);
      ctx.m.flags.hellzone = true;
    },
  };

  S.cell_takes_17 = {
    id: 'cell_takes_17',
    cast: (m) => {
      const s = m.battle.story;
      return { piccolo: s.piccolo, cell: s.cell, a17: s.a17, tien: s.tien };
    },
    music: { song: null, level: 0 },
    events: [
      {
        pose: [
          { who: 'a17', pose: 'a17_bored', face: 'shock' },
          { who: 'cell', pose: 'cl_tailW', face: 'smirk' },
          { who: 'piccolo', pose: 'knockdown', face: 'hurt' },
        ],
        mood: { amount: 0.45, color: 0x1e2a1e, seconds: 1.2 },
        cam: { from: { at: 'a17', off: [3.4, 1.8, 4.4] }, to: { at: 'a17', off: [2.4, 1.3, 3.2] }, look: { at: 'a17', off: [0, 0.9, 0] }, fov: 46, fov2: 38 },
        say: { who: 'android_17', line: 'Get that thing away from me—', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      // the grab: one frame, and then it is a formality
      {
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'shout', speed: 16 }],
        sfx: { name: 'punchHeavy', who: 'cell', vol: 1.1, pitch: 0.7 },
        screen: { flash: 0.5, color: '#a8e08a' },
        slow: { scale: 0.32, seconds: 0.9 },
        shake: { at: { at: 'a17' }, amount: 0.8 },
        vfx: { kind: 'stream', at: { at: 'cell' }, radius: 4, count: 16, color: 0xa8e08a, life: 0.7 },
        cam: { from: { at: 'cell', local: [0.9, 0.6, 2.6] }, to: { at: 'cell', local: [0.7, 0.5, 2 ] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 32 },
        hold: 2.8,
      },
      {
        hide: 'a17',
        vfx: { kind: 'dust', at: { at: 'a17' }, radius: 3, count: 10 },
        sfx: { name: 'kiUp', who: 'cell', vol: 1, pitch: 0.8 },
        cam: { from: { at: 'cell', off: [3, 1.6, 4 ] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 44 },
        say: { who: 'piccolo', line: 'No. No, no —', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const a = cast.a17;
      if (a) {
        a.setHidden(true);
        a.untargetable = true;
        a.alive = false;
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.seventeenTaken = true;
    },
    clearMood: false,
  };

  S.tien_holds_him = {
    id: 'tien_holds_him',
    cast: (m) => {
      const s = m.battle.story;
      return { tien: s.tien, cell: s.cell, piccolo: s.piccolo };
    },
    music: { song: 'finale', level: 4 },
    events: [
      {
        show: 'tien',
        pose: [{ who: 'tien', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'tien', off: [3, 1.6, 4 ] }, to: { at: 'tien', off: [2.2, 1.2, 3 ] }, look: { at: 'tien', off: [0, 0.9, 0] }, fov: 46, fov2: 38 },
        say: { who: 'tien', line: 'Go. I will hold him here as long as I can hold anything.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk' }],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, look: { at: 'cell', off: [0, 0.7, 0] }, fov: 42 },
        say: { who: 'cell', line: 'You cannot. But by all means.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const t = cast.tien;
      if (t) {
        t.setHidden(false);
        t.untargetable = false;
        t.setState('free');
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.tienStood = true;
    },
    clearMood: false,
  };

  S.cell_takes_18 = {
    id: 'cell_takes_18',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, cell: s.cell, a18: s.a18, trunks: s.trunks };
    },
    events: [
      {
        pose: [
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk' },
          { who: 'a18', pose: 'a17_bored', face: 'shock' },
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
        ],
        mood: { amount: 0.4, color: 0x2a2440, seconds: 1.4 },
        cam: { from: { at: 'vegeta', local: [1, 0.55, 2.8] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Let him have her. I want him finished. I want the real fight.', duration: 4.4 },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'trunks', local: [0.9, 0.55, 2.6] }, look: { at: 'trunks', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'future_trunks', line: 'Father, if he finishes, none of us can stop him. None of us.', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      {
        hide: 'a18',
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'shout', speed: 16 }],
        screen: { flash: 0.6, color: '#a8e08a' },
        sfx: { name: 'kiUp', who: 'cell', vol: 1.1, pitch: 0.7 },
        slow: { scale: 0.3, seconds: 1 },
        shake: { at: { at: 'cell' }, amount: 0.9 },
        vfx: { kind: 'stream', at: { at: 'cell' }, radius: 5, count: 20, color: 0xa8e08a, life: 0.8 },
        cam: { from: { at: 'cell', local: [1, 0.6, 3 ] }, to: { at: 'cell', local: [0.8, 0.55, 2.2] }, look: { at: 'cell', off: [0, 0.7, 0] }, fov: 42, fov2: 34 },
        hold: 3,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const a = cast.a18;
      if (a) {
        a.setHidden(true);
        a.untargetable = true;
        a.alive = false;
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.eighteenTaken = true;
    },
    clearMood: false,
  };

  S.perfect_arrives = {
    id: 'perfect_arrives',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, cell: s.cell, trunks: s.trunks };
    },
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk' }],
        mood: { amount: 0.3, color: 0x203828, seconds: 1.6 },
        cam: { from: { at: 'cell', off: [4.4, 2.4, 5.6] }, to: { at: 'cell', off: [3, 1.6, 3.8] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 48, fov2: 40, ease: 'inOut' },
        say: { who: 'cell', line: 'Perfect. That is the only word for it, so I will use it.', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk' }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.55, 2.6] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Good. Now show me what I waited for.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['vegeta', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.perfectShown = true;
    },
    clearMood: false,
  };
  /* ============================================================================ THE FINAL FLASH */
  // the Final Flash's beam, for the scene: it ends on Cell and does no damage of its own (the story does)
  const FINAL_FLASH = {
    id: 'finalFlashScene', name: 'Final Flash', type: 'beam', damage: [0, 0], radius: [1.15, 1.15], speed: 70, range: 80, sustain: 140,
    color: 0xffe14a, core: 0xffffff, style: { rings: 3, ringColor: 0xfff3a0, ringSpeed: 1.8 },
  };
  // on one knee after the beating, getting his breath back
  C.v_kneelPant = (t) => ({
    root: { y: -0.44, rx: 14 }, spine: [22, 0, 0], chest: [12 + Math.sin(t * 7) * 3, 0, 0], head: [6, 0, 0],
    shoulderL: [-30, 0, 12], elbowL: [-50, 0, 0], shoulderR: [-10, 0, -8], elbowR: [-14, 0, 0],
    thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
    hands: ['fist', 'fist'],
  });
  // both palms forward, one on the back of the other, arms locked: the beam leaves from here
  C.v_finalFlashFire = (t) => ({
    root: { y: -0.04 }, spine: [-4, 0, 0], chest: [-6 + Math.sin(t * 40) * 1.2, 0, 0], head: [-6, 0, 0],
    shoulderL: [-88, -14, 8], elbowL: [-4, 0, 0], handL: [0, 0, 70], shoulderR: [-88, 14, -8], elbowR: [-4, 0, 0], handR: [0, 0, -70],
    thighL: [-26, 0, 14], kneeL: [36, 0, 0], thighR: [18, 0, -14], kneeR: [30, 0, 0],
    hands: ['open', 'open'],
  });

  /** Vegeta, beaten, and Cell offering him one free shot. */
  S.ff_dare = {
    id: 'ff_dare',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, cell: s.cell, trunks: s.trunks };
    },
    music: { song: 'finale', level: 3 },
    events: [
      {
        pose: [
          { who: 'vegeta', pose: 'v_kneelPant', face: 'hurt', speed: 4 },
          { who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 4 },
        ],
        cam: { from: { at: 'vegeta', local: [1.4, 0.2, 2.2] }, to: { at: 'vegeta', local: [1.1, 0.15, 1.8] }, look: { at: 'vegeta:head', off: [0, 0.05, 0] }, fov: 40 },
        sfx: { name: 'heartbeat', vol: 0.6 },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'cell:face', local: [0.2, 0.18, 1.1] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 38 },
        say: { who: 'cell', line: 'Is that all? Then I will make it easy for you. Your strongest attack. I will stand right here and take it.', duration: 5 },
        hold: 5.2,
      },
      {
        cam: { from: { at: 'trunks', local: [0.4, 0.4, 1.7] }, look: { at: 'trunks:head', off: [0, 0.1, 0] }, fov: 36 },
        say: { who: 'future_trunks', line: 'Father, don\'t! He wants you to!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
      // the prince gets up, and goes up
      {
        call: (ctx) => {
          const st = ctx.b.story, v = st.vegeta, c = st.cell;
          const away = v.pos.clone().sub(c.pos).setY(0).normalize();
          ctx.v0 = v.pos.clone();
          ctx.v1 = v.pos.clone().addScaledVector(away, 7).add(new V3(0, 11, 0));
          v.grounded = false;
        },
        pose: [{ who: 'vegeta', pose: 'flyIdle', face: 'angry', speed: 6 }],
        cam: { from: { at: 'vegeta', local: [0.8, -0.6, 2.4] }, look: { at: 'vegeta', off: [0, 2.5, 0] }, fov: 50 },
        tick: (ctx, t) => {
          const v = ctx.b.story.vegeta, k = U.easeInOutCubic(Math.min(1, t / 1.6));
          v.setPosition(ctx.v0.clone().lerp(ctx.v1, k));
          v.prevPos.copy(v.pos);
          v.yaw = v.prevYaw = Math.atan2(ctx.b.story.cell.pos.x - v.pos.x, ctx.b.story.cell.pos.z - v.pos.z);
          if (ctx.b.frame % 8 === 0 && k < 0.3) ctx.b.vfx.dust(ground(ctx.b, ctx.v0), 1.2, 4);
        },
        say: { who: 'vegeta', line: 'You will regret that, Cell.', duration: 2.2, style: 'quiet' },
        hold: 2,
      },
    ],
    end(ctx) {
      const st = ctx.b.story, v = st.vegeta;
      if (ctx.v1) v.setPosition(ctx.v1);
      v.grounded = false;
      v.yaw = v.prevYaw = Math.atan2(st.cell.pos.x - v.pos.x, st.cell.pos.z - v.pos.z);
      ctx.m.flags.ffDared = true;
    },
  };

  /** "FINAL... FLASH!": the beam, the hit, what it leaves of him, what grows back, and one kick. */
  S.ff_fire = {
    id: 'ff_fire',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, cell: s.cell, trunks: s.trunks };
    },
    music: { song: 'finale', level: 6 },
    events: [
      // the hands come together; the two lights become one
      {
        call: (ctx) => {
          const st = ctx.b.story, v = st.vegeta;
          for (const o of st.ffOrbs || []) o.set(0.1);
        },
        pose: [{ who: 'vegeta', pose: 'v_finalFlashFire', face: 'shout', speed: 14 }],
        cam: { from: { at: 'vegeta', local: [1.9, 0.15, 1.5] }, look: { at: 'vegeta', off: [0, 0.25, 0] }, fov: 44 },
        tick: (ctx) => {
          const st = ctx.b.story, v = st.vegeta, o = st.ffOrbs || [];
          const front = v.chest().addScaledVector(v.forward, 0.75);
          o.forEach((x, i) => {
            x.group.position.lerp(front, 0.25);
            x.set(i ? 0.001 : 0.26);
            x.pulse();
          });
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.bolt(front.clone().add(new V3(U.rand(-0.8, 0.8), U.rand(-0.8, 0.8), U.rand(-0.8, 0.8))), 1, 0xfff3a0);
        },
        say: { who: 'vegeta', line: 'FINAL...', duration: 1.2, style: 'shout' },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const st = ctx.b.story;
          for (const o of st.ffOrbs || []) o.dispose();
          st.ffOrbs = null;
          st.cell.intangible = true;
          SL.Cinema.beam(ctx, st.vegeta, st.cell, FINAL_FLASH);
          ctx.b.sfx('beamFire', st.vegeta, { vol: 1.4, pitch: 0.8 });
          ctx.b.sfx('kiBlastBig', st.vegeta, { vol: 1.2, pitch: 0.7 });
          ctx.b.cameraTraumaAt(st.vegeta.chest(), 0.7);
        },
        // over his shoulder, down the length of it
        cam: { from: { at: 'vegeta', local: [0.9, 0.55, -2.4] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 46 },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xfff3a0),
        say: { who: 'vegeta', line: 'FLASH!', duration: 1.4, style: 'shout' },
        hold: 1.1,
      },
      // from the side: the whole beam, and the ground under it coming up
      {
        call: (ctx) => {
          const st = ctx.b.story, v = st.vegeta, c = st.cell;
          const mid = v.chest().lerp(c.chest(), 0.5);
          const axis = c.pos.clone().sub(v.pos).setY(0).normalize();
          pt(ctx, 'ffSide', mid.clone().add(new V3(-axis.z, 0, axis.x).multiplyScalar(17)).add(new V3(0, -1.5, 0)));
          pt(ctx, 'ffMid', mid);
          st.cell.setState('scripted', { pose: 'guard', expression: 'shout' });
        },
        cam: { from: { at: 'ffSide' }, look: { at: 'ffMid' }, fov: 52 },
        tick: (ctx, t) => {
          SL.Cinema.pinBeam(ctx, 0xfff3a0);
          const st = ctx.b.story, b = ctx.b;
          if (b.frame % 6 === 0) {
            const k = Math.random();
            const p = st.vegeta.chest().lerp(st.cell.chest(), k);
            const g = ground(b, p);
            b.vfx.dust(g, 1.2, 4);
            b.vfx.rock(g.clone().add(new V3(U.rand(-2, 2), 0.2, U.rand(-2, 2))), new V3(0, U.rand(5, 9), 0), U.rand(0.2, 0.45), b.stage.rockColor);
          }
        },
        hold: 1.4,
      },
      // on Cell, from the side, taking it on his crossed arms
      {
        cam: { from: { at: 'cell', local: [4.2, 0.9, -3.4] }, look: { at: 'cell:head', off: [0, -0.2, 0] }, fov: 42 },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xfff3a0),
        say: { who: 'cell', line: 'GRAAAAAH!', duration: 1.2, style: 'shout' },
        hold: 1.2,
      },
      // the hit: small fires, not one white sun — and the dust over all of it
      {
        call: (ctx) => {
          const st = ctx.b.story, b = ctx.b, c = st.cell;
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
          ctx.boomAt = c.chest();
          pt(ctx, 'ffHit', ctx.boomAt);
          c.model.joints.shoulderR.scale.setScalar(0.001);
          b.stage.crater(ground(b, c.pos), 6, 1, null);
          b.sfx('explosionBig', c, { vol: 1.4, pitch: 0.8 });
          b.cameraTraumaAt(ctx.boomAt, 1);
        },
        screen: { flash: 0.22, color: '#fff2c0' },
        cam: { from: { at: 'ffHit', off: [9, 3.5, 11] }, look: { at: 'ffHit' }, fov: 46 },
        tick: (ctx, t) => {
          const b = ctx.b;
          if (t < 0.6 && b.frame % 6 === 0) b.vfx.explosion(ctx.boomAt.clone().add(new V3(U.rand(-1, 1), U.rand(-0.6, 0.8), U.rand(-1, 1))), 1.3, 0xffe890, { smoke: true });
          if (b.frame % 10 === 0) b.vfx.dust(ground(b, ctx.boomAt), 3.5, 10);
        },
        hold: 2.2,
      },
      // the prince in the air, out of breath
      {
        pose: [{ who: 'vegeta', pose: 'flyIdle', face: 'smirk', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [0.5, 0.15, 1.9] }, look: { at: 'vegeta:head', off: [0, 0.1, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Hah... hah... Look at you now.', duration: 2.4, style: 'quiet' },
        hold: 2.4,
      },
      // the smoke goes: the right arm and the shoulder with it are simply gone
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'angry', speed: 3 }],
        cam: { from: { at: 'cell', local: [-1.3, 0.55, 2.8] }, to: { at: 'cell', local: [-1.1, 0.5, 2.4] }, look: { at: 'cell', off: [0, 0.55, 0] }, fov: 40 },
        tick: (ctx) => {
          const c = ctx.b.story.cell, b = ctx.b;
          if (b.frame % 5 === 0) {
            c.model.root.updateMatrixWorld(true);
            const s = c.model.joints.shoulderR.getWorldPosition(new V3());
            b.vfx.trail(s.add(new V3(U.rand(-0.1, 0.1), U.rand(0, 0.3), U.rand(-0.1, 0.1))), 0x6a6a6a, 0.25, 0.8);
          }
        },
        sfx: { name: 'steam', vol: 0.6 },
        hold: 2.4,
      },
      // and it grows back
      {
        call: (ctx) => ctx.b.sfx('regrow', ctx.b.story.cell, { vol: 1.1, pitch: 0.8 }),
        pose: [{ who: 'cell', pose: 'cl_brace', face: 'shout', speed: 6 }],
        cam: { from: { at: 'cell', local: [-1.7, 0.6, 2.3] }, look: { at: 'cell', off: [-0.2, 0.55, 0] }, fov: 40 },
        tick: (ctx, t) => {
          const c = ctx.b.story.cell, b = ctx.b, k = U.easeOutCubic(Math.min(1, t / 1.4));
          c.model.joints.shoulderR.scale.setScalar(Math.max(0.001, k));
          if (b.frame % 4 === 0) {
            c.model.root.updateMatrixWorld(true);
            b.vfx.sparks(c.model.joints.shoulderR.getWorldPosition(new V3()), 0x9ae07a, 6, 3, 0.08);
          }
        },
        hold: 1.8,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 4 }],
        cam: { from: { at: 'cell:face', local: [0.2, 0.18, 1.05] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 38 },
        say: { who: 'cell', line: 'Thank you, Vegeta. Had I still been imperfect, that would have killed me.', duration: 3.8 },
        hold: 4,
      },
      // gone from the ground, there in the air beside him: one kick
      {
        call: (ctx) => {
          const st = ctx.b.story, v = st.vegeta, c = st.cell;
          c.model.joints.shoulderR.scale.setScalar(1);
          const side = new V3(-v.forward.z, 0, v.forward.x);
          SL.data.vegitoKit.vanishTo(ctx.b, c, v.pos.clone().addScaledVector(side, 1.3), { face: v.pos });
          c.grounded = false;
          c.setState('scripted', { pose: 'kickR', expression: 'wicked', speed: 20 });
          v.setState('scripted', { pose: 'hitBody', expression: 'hurt' });
          ctx.b.sfx('punchHeavy', v, { vol: 1.5, pitch: 0.5 });
          ctx.b.vfx.ring(v.chest(), 2.2, 0xfff3c0, 0.3, side);
          ctx.b.cameraTraumaAt(v.chest(), 0.8);
          ctx.f0 = v.pos.clone();
          ctx.f1 = ground(ctx.b, v.pos.clone().addScaledVector(side, -9));
        },
        slow: { scale: 0.35, seconds: 0.5 },
        cam: { from: { at: 'vegeta', local: [-3.2, 0.6, 3.4] }, look: { at: 'vegeta', off: [0, 0, 0] }, fov: 48 },
        hold: 0.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'tumble', face: 'hurt', speed: 10 }],
        cam: { from: { at: 'ffHit', off: [-7, 3, 8] }, look: { at: 'vegeta' }, fov: 46 },
        tick: (ctx, t) => {
          const v = ctx.b.story.vegeta, k = U.easeInCubic(Math.min(1, t / 0.7));
          v.setPosition(ctx.f0.clone().lerp(ctx.f1, k));
          v.prevPos.copy(v.pos);
          if (k >= 1 && !ctx.down) {
            ctx.down = true;
            v.grounded = true;
            ctx.b.stage.crater(ctx.f1, 3, 0.7, null);
            ctx.b.vfx.dust(ctx.f1, 2.5, 14);
            ctx.b.sfx('groundImpact', v, { vol: 1.3, pitch: 0.7 });
            v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
          }
        },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const st = ctx.b.story, b = ctx.b, v = st.vegeta, c = st.cell;
      for (const o of st.ffOrbs || []) o.dispose();
      st.ffOrbs = null;
      if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
      c.model.joints.shoulderR.scale.setScalar(1);
      c.intangible = false;
      // where the kick put him, whether it was watched or skipped
      const side = new V3(-v.forward.z, 0, v.forward.x);
      if (!ctx.down) v.setPosition(ctx.f1 || ground(b, v.pos.clone().addScaledVector(side, -9)));
      v.setPosition(ground(b, v.pos));
      v.grounded = true;
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      c.setPosition(ground(b, c.pos));
      c.grounded = true;
      c.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
      ctx.m.flags.finalFlash = true;
    },
  };

})();
