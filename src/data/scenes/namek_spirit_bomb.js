/*
 * SCENES — the Spirit Bomb, the quiet after it, and what was under the rock.
 *
 *   spirit_bomb_call        Namek has almost nothing left, so he asks further out: the
 *                           planets and stars around it. Piccolo steps in front of him.
 *   spirit_bomb_impact      the throw, the hit, and then nothing at all
 *   false_victory           silence, relief, people sitting down — long enough to believe it
 *   frieza_returns          a sound, a cliff, and a bloodied emperor with half a tail
 *   piccolo_takes_the_beam  the Death Beam is for Goku; Piccolo shoves him clear and takes it
 *                           through the chest. He is down, and alive.
 *
 * The charge between the first two scenes is played (namek_spirit_bomb.js, as Piccolo).
 * Every scene stages its own cast so a checkpoint start or a skip lands on the right state.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, frieza: s.frieza, krillin: s.krillin, gohan: s.gohan, piccolo: s.piccolo, cliff: s.cliff };
  };

  /*
   * THE CATCH (Roadmap Three: the owner's Gemini research, the Namek block, section 6 — a research draft, not checked
   * against the footage; it agrees with the story's order): the sphere he throws is drawn as the real thing, not a
   * streak. It comes down across the field; Frieza catches its underside with both hands and pushes back with all he
   * has; it drives him back over the ground and down into it, and only then goes off. The sphere is the engine's own
   * Spirit Bomb body (SL.SpiritBomb, as the prologue's Supernova), moved here frame by frame.
   */
  const SB_R = 6;
  const SB_FLY = 4.4; // seconds from leaving his hands to Frieza's
  /** Where the sphere sits on his hands: up and in front of him toward Goku, its surface at arm's length. */
  function onHands(g, fz) {
    const toward = g.pos.clone().sub(fz.pos).setY(0);
    if (toward.lengthSq() < 1e-4) toward.copy(fz.forward);
    const d = toward.normalize().multiplyScalar(0.85).add(new V3(0, 0.5, 0)).normalize();
    return fz.chest().addScaledVector(d, SB_R + 0.55);
  }
  function sphereUp(ctx) {
    const b = ctx.b, m = ctx.m, { goku: g, frieza: fz } = ctx.cast;
    if (!g || !fz || ctx.sb) return;
    const bomb = new SL.SpiritBomb(b, g, { radius: SB_R, color: 0x74d6ff, speed: 0, homing: 0, damage: 0, explode: 10 });
    bomb.radius = SB_R;
    // close to the lens the engine's white core and halo wash the frame out: softer on this one
    bomb.core.material.opacity = 0.22;
    bomb.glow.material.opacity = 0.3;
    bomb.pos.copy(g.pos).add(new V3(0, g.height + 1.2 + SB_R, 0));
    ctx.cast.sphere = { pos: bomb.pos };
    const st = (ctx.sb = { bomb, mode: 'hold', at: b.frame, from: bomb.pos.clone(), push: null, sink: null });
    st.hook = () => {
      const t = (b.frame - st.at) / 60;
      if (st.mode === 'hold' && t > 0.9) Object.assign(st, { mode: 'fly', at: b.frame, from: bomb.pos.clone() });
      if (st.mode === 'fly') {
        const k = Math.min(1, t / SB_FLY), e = k * k * (3 - 2 * k);
        bomb.pos.lerpVectors(st.from, onHands(g, fz), e).add(new V3(0, Math.sin(k * Math.PI) * 3, 0));
        if (k >= 1) st.mode = 'held';
      } else if (st.mode === 'held') {
        // pushed back over the ground, feet ploughing (st.push), then down into it (st.sink) — each one starts only
        // once the sphere is on his hands (the scene's beats may come a frame or two ahead of the flight)
        if (st.push && st.push.at == null) Object.assign(st.push, { at: b.frame, from: fz.pos.clone() });
        if (st.sink && st.sink.at == null && st.push) st.sink.at = b.frame;
        if (st.push) {
          const k = Math.min(1, (b.frame - st.push.at) / st.push.frames), e = 1 - (1 - k) * (1 - k);
          fz.pos.copy(st.push.from).addScaledVector(st.push.dir, e * st.push.dist);
          fz.pos.y = b.stage.heightAt(fz.pos.x, fz.pos.z) - (st.sink ? Math.min(1, (b.frame - st.sink.at) / st.sink.frames) * st.sink.depth : 0);
          fz.prevPos.copy(fz.pos);
          fz.vel.set(0, 0, 0);
          if (b.frame % 8 === 0) b.vfx.dust(fz.pos.clone(), 1, 3);
          if (b.frame % 14 === 0) b.vfx.debrisBurst(fz.pos.clone().add(new V3(0, 0.2, 0)), 5, 0x6a7a6a, 6, 0.18);
          if (b.frame % 3 === 0) b.cameraTraumaAt(fz.chest(), 0.12);
        }
        bomb.pos.copy(onHands(g, fz));
      }
      bomb.time += 1 / 60;
      bomb.mesh.material.uniforms.uTime.value = bomb.time;
      bomb.mesh.material.uniforms.uCharge.value = 1;
      bomb._render();
    };
    m.tickHooks.push(st.hook);
    m.onDispose(() => sphereGone(ctx));
  }
  function sphereGone(ctx) {
    const st = ctx.sb;
    if (!st) return;
    const i = ctx.m.tickHooks.indexOf(st.hook);
    if (i >= 0) ctx.m.tickHooks.splice(i, 1);
    st.bomb.dispose();
    ctx.sb = null;
  }

  /** Far-off lights answering him: a planet, a star, another star — high in the sky, far away. */
  function skyLights(ctx, n, spread) {
    const b = ctx.b, g = ctx.cast.goku;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const p = g.pos.clone().add(new V3(Math.cos(a) * spread, 60 + Math.random() * 40, Math.sin(a) * spread));
      b.vfx.flash(p, 5 + Math.random() * 4, i % 3 === 0 ? 0xfff0c0 : 0x9fe4ff, 1.2, SL.Toon.tex.glow);
      const to = g.pos.clone().add(new V3(0, 6, 0));
      for (let k = 1; k <= 6; k++) b.vfx.trail(p.clone().lerp(to, k / 7), 0x9fe4ff, 0.7, 0.9);
    }
  }

  S.spirit_bomb_call = {
    id: 'spirit_bomb_call',
    cast,
    music: { song: 'finale', level: 1 },
    events: [
      // he is in no state for this, which is the point
      {
        pose: [
          { who: 'goku', pose: 'g_defeatKnee', face: 'hurt', speed: 2 },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        mood: { amount: 0.45, color: 0x15254a, seconds: 2 },
        cam: { from: { at: 'goku', local: [1.4, 0.5, 3.2] }, to: { at: 'goku', local: [0.9, 0.3, 2.2] }, look: { at: 'goku' }, fov: 44, fov2: 36 },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'goku', local: [0.55, 0.35, 1.35] }, to: { at: 'goku', local: [0.45, 0.32, 1.1] }, look: { at: 'goku:head' }, fov: 38, fov2: 34 },
        say: { who: 'goku', line: 'There is one thing left. King Kai\'s technique. But Namek has almost nothing left to give...', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      // the hands go up, and he asks further than this planet
      {
        pose: [{ who: 'goku', pose: 'g_spiritRaise', face: 'grit' }],
        sfx: { name: 'kiCharge', who: 'goku', vol: 1 },
        vfx: { kind: 'stream', at: { at: 'goku', off: [0, 3, 0] }, radius: 6, count: 16, color: 0x74d6ff, life: 0.8 },
        cam: {
          from: { at: 'goku', off: [3.4, 1.2, 4.4] },
          to: { at: 'goku', off: [2.4, 3.6, 5.6] },
          look: { at: 'goku', off: [0, 2.4, 0] },
          fov: 46,
          fov2: 54,
          ease: 'inOut',
        },
        say: { who: 'goku', line: 'The planets around this one. The stars out there. Everything that is alive — lend me your energy.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      // the sky answers: lights far out past Namek, streaming in
      {
        call: (ctx) => skyLights(ctx, 7, 90),
        tick: (ctx, t) => {
          if (ctx.b.frame % 20 === 0) skyLights(ctx, 2, 70 + t * 10);
        },
        music: { level: 2 },
        cam: {
          from: { at: 'goku', off: [0, 5, 9] },
          to: { at: 'goku', off: [0, 9, 14] },
          look: { at: 'goku', off: [0, 30, -20] },
          fov: 60,
          fov2: 66,
          ease: 'out',
        },
        hold: 3.8,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'shock' }, { who: 'gohan', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'gohan:head', local: [-0.5, -0.15, 1] }, look: { at: 'gohan:head', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'kid_gohan', line: 'The sky... it is coming from the sky!', duration: 2.6 },
        hold: 2.6,
      },
      // Piccolo understands first, and puts himself in front of it
      {
        call: (ctx) => {
          const { piccolo, goku, frieza } = ctx.cast;
          const at = goku.pos.clone().lerp(frieza.pos, 0.35);
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          piccolo.setHidden(false);
          piccolo.setPosition(at);
          piccolo.yaw = piccolo.prevYaw = Math.atan2(frieza.pos.x - at.x, frieza.pos.z - at.z);
          ctx.b.vfx.dust(at, 2.6, 12);
          ctx.b.sfx('dash', piccolo, { vol: 1 });
        },
        show: 'piccolo',
        pose: [{ who: 'piccolo', pose: 'p_stance', face: 'grit' }],
        cam: { from: { at: 'piccolo:head', local: [0.55, -0.2, 1.3] }, to: { at: 'piccolo:head', local: [0.42, -0.16, 1.05] }, look: { at: 'piccolo:head' }, fov: 38, fov2: 34 },
        say: { who: 'piccolo', line: 'Goku. However long it takes — I will buy it.', duration: 3.2 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'frieza', local: [1.1, 0.6, 3] }, look: { at: 'frieza', off: [0, 0.8, 0] }, fov: 42 },
        say: { who: 'frieza', line: 'What is that monkey doing up there? Out of my way, Namekian!', duration: 3.2 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      if (c.piccolo) c.piccolo.setHidden(false);
      if (c.goku) c.goku.setState('free');
      if (c.frieza) c.frieza.setState('free');
      m.flags.bombCalled = true;
    },
  };

  S.spirit_bomb_impact = {
    id: 'spirit_bomb_impact',
    cast,
    events: [
      // the throw
      {
        call: sphereUp,
        pose: [{ who: 'goku', pose: 'g_spiritThrow', face: 'shout' }],
        sfx: { name: 'kiBlastBig', who: 'goku', vol: 1.3, pitch: 0.55 },
        // from behind him, far enough back for the whole of it over his head (it is drawn now, not a streak)
        cam: { from: { at: 'goku', local: [2.4, 0.6, -7.6] }, to: { at: 'goku', local: [2, 0.9, -6.6] }, look: { at: 'goku', off: [0, 3.6, 0] }, fov: 64, fov2: 60 },
        say: { who: 'goku', line: 'Piccolo — everyone — get clear!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'piccolo', pose: 'flyUp', face: 'grit' }],
        call: (ctx) => {
          const pc = ctx.cast.piccolo;
          if (!pc) return;
          const at = pc.pos.clone().add(new V3(-6, 0, 5));
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          ctx.b.vfx.afterimage(pc.pos.clone(), 1.9, 0x9ae07a);
          pc.setPosition(at);
        },
        cam: { from: { at: 'frieza', local: [-2, 0.6, 3.2] }, look: { at: 'frieza', off: [0, 1.5, 0] }, fov: 44 },
        say: { who: 'frieza', line: 'What — ?!', duration: 1.4 },
        hold: 1.4,
      },
      // the sphere crossing the field, seen from underneath: from beside Frieza, up at it coming down on him
      {
        cam: { from: { at: 'frieza', off: [7, 0.8, 7] }, to: { at: 'frieza', off: [6, 1.2, 5.5] }, look: { at: 'sphere' }, look2: { at: 'frieza', off: [0, 3, 2.5] }, fov: 56 },
        hold: 1.6,
      },
      // THE CATCH: both hands under it, leaning into it — and it keeps coming
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'shout', speed: 18 }],
        call: (ctx) => {
          const st = ctx.sb, { goku: g, frieza: fz } = ctx.cast;
          if (!st || !fz) return;
          const dir = fz.pos.clone().sub(g.pos).setY(0).normalize();
          st.push = { at: null, frames: 150, dir, dist: 3.2 };
          ctx.b.vfx.ring(fz.chest().addScaledVector(dir, -1), 6, 0xbfefff, 0.5, dir.clone());
          ctx.b.sfx('punchHeavy', fz, { vol: 1.3, pitch: 0.6 });
          ctx.b.sfx('beamFire', fz, { vol: 0.9, pitch: 0.5 });
          ctx.b.cameraTraumaAt(fz.chest(), 0.5);
        },
        cam: { from: { at: 'frieza', off: [4.4, 0.1, -1.2] }, to: { at: 'frieza', off: [4, 0, -1.5] }, look: { at: 'frieza:head', off: [0, 0.5, 1.2] }, fov: 62, fov2: 58 },
        say: { who: 'frieza', line: 'Nnngh — !!', duration: 1.2, style: 'shout' },
        hold: 1.3,
      },
      // pushed back over the plain, his feet ploughing it
      {
        // from behind him and to one side: his back to us, the sphere beyond him bearing down
        cam: { from: { at: 'frieza', off: [5.5, 1.4, -8.5] }, to: { at: 'frieza', off: [5, 1.6, -7.5] }, look: { at: 'frieza', off: [0, 2.2, 3] }, fov: 58 },
        hold: 1.2,
      },
      // and down into it
      {
        call: (ctx) => {
          const st = ctx.sb, fz = ctx.cast.frieza;
          if (!st || !fz) return;
          st.sink = { at: null, frames: 48, depth: 1.1 };
          if (ctx.b.stage.crater) ctx.b.stage.crater(fz.pos.clone(), 3.6, 0.9);
          ctx.b.vfx.debrisBurst(fz.pos.clone().add(new V3(0, 0.4, 0)), 18, 0x6a7a6a, 10, 0.3);
          ctx.b.sfx('groundImpact', fz, { vol: 1.3, pitch: 0.7 });
        },
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'hurt', speed: 10 }],
        cam: { from: { at: 'frieza', off: [7.5, 2.8, -9] }, look: { at: 'frieza', off: [0, 1.4, 2] }, fov: 56 },
        hold: 0.9,
      },
      // impact
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          const b = ctx.b;
          // caught and ground in (the flag the test reads), then it goes off
          if (ctx.sb) ctx.m.flags.bombCaught = !!(ctx.sb.sink && ctx.sb.sink.at != null);
          sphereGone(ctx);
          if (!fz) return;
          const at = fz.pos.clone();
          b.vfx.explosion(at.clone().add(new V3(0, 2, 0)), 18, 0xbfe6ff, { smoke: true });
          b.vfx.ring(at.clone().add(new V3(0, 0.4, 0)), 34, 0x9fe4ff, 1.2, new V3(0, 1, 0));
          b.vfx.ring(at.clone().add(new V3(0, 0.4, 0)), 22, 0xffffff, 0.9, new V3(0, 1, 0));
          b.cameraTraumaAt(at, 1);
          if (b.stage.crater) b.stage.crater(at, 7, 1.2);
        },
        vfx: { kind: 'rocks', at: { at: 'frieza' }, count: 20, radius: 9, lift: 16 },
        screen: { flash: 0.95, color: '#eaf8ff' },
        sfx: { name: 'explosionHuge', vol: 1.4, pitch: 0.7 },
        slow: { scale: 0.35, seconds: 1.2 },
        cam: { from: { at: 'frieza', off: [9, 4, 12] }, to: { at: 'frieza', off: [14, 7, 18] }, look: { at: 'frieza', off: [0, 2, 0] }, fov: 54, fov2: 62, ease: 'out' },
        hold: 3.2,
      },
      {
        hide: 'frieza',
        vfx: { kind: 'dust', at: { at: 'frieza' }, radius: 9, count: 30 },
        cam: { from: { at: 'frieza', off: [12, 5, 16] }, to: { at: 'frieza', off: [13, 5.5, 17.5] }, look: { at: 'frieza', off: [0, 1, 0] }, fov: 56 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      sphereGone(ctx);
      if (c.frieza) {
        m.flags.craterAt = c.frieza.pos.clone();
        c.frieza.setHidden(true);
        c.frieza.untargetable = true;
      }
      if (c.goku) c.goku.setState('scripted', { pose: 'g_defeatKnee', expression: 'hurt' });
      m.flags.bombThrown = true;
    },
  };

  S.false_victory = {
    id: 'false_victory',
    cast,
    music: { song: null, level: 0 },
    events: [
      // nothing. Wind over the crater, and nobody saying anything.
      {
        mood: { amount: 0.18, color: 0x30404c, seconds: 3 },
        vfx: { kind: 'dust', at: { at: 'goku', off: [0, 0, -14] }, radius: 10, count: 10 },
        cam: { from: { at: 'goku', off: [-9, 3.2, 12] }, to: { at: 'goku', off: [-7, 2.8, 10] }, look: { at: 'goku', off: [0, 0.5, -10] }, fov: 50, fov2: 46, ease: 'inOut' },
        hold: 4,
      },
      {
        pose: [{ who: 'goku', pose: 'g_defeatKnee', face: 'soft', speed: 1 }],
        cam: { from: { at: 'goku', local: [1.6, 0.4, 2.8] }, to: { at: 'goku', local: [1.2, 0.3, 2.2] }, look: { at: 'goku', off: [0, -0.1, 0] }, fov: 40, fov2: 36 },
        hold: 3,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'soft' }],
        cam: { from: { at: 'krillin:head', local: [0.5, -0.15, 1.05] }, look: { at: 'krillin:head' }, fov: 38 },
        say: { who: 'krillin', line: 'Is it... is it over? It is over. It is actually over!', duration: 3.4 },
        hold: 3.4,
      },
      // Gohan runs to his father; Piccolo lets himself sit down
      {
        call: (ctx) => {
          const { gohan, goku } = ctx.cast;
          ctx.runFrom = gohan.pos.clone();
          const to = goku.pos.clone().add(new V3(-1.4, 0, 0.8));
          to.y = ctx.b.stage.heightAt(to.x, to.z);
          ctx.runTo = to;
        },
        pose: [{ who: 'gohan', pose: 'run', face: 'grin' }],
        tick: (ctx, t) => {
          const k = U.clamp01(t / 1.6);
          const gh = ctx.cast.gohan;
          gh.setPosition(ctx.runFrom.clone().lerp(ctx.runTo, k));
          gh.yaw = gh.prevYaw = Math.atan2(ctx.runTo.x - ctx.runFrom.x, ctx.runTo.z - ctx.runFrom.z);
        },
        cam: { from: { at: 'goku', local: [3.4, 0.9, 4.2] }, look: { at: 'goku', off: [0, -0.2, 0] }, fov: 44 },
        say: { who: 'kid_gohan', line: 'Dad! You did it!', duration: 2, style: 'shout' },
        hold: 1.8,
      },
      {
        pose: [
          { who: 'gohan', pose: 'idle', face: 'grin' },
          { who: 'goku', pose: 'g_defeatKnee', face: 'grin', speed: 2 },
        ],
        cam: { from: { at: 'goku', local: [0.55, 0.35, 1.35] }, to: { at: 'goku', local: [0.45, 0.32, 1.1] }, look: { at: 'goku:head' }, fov: 38, fov2: 34 },
        say: { who: 'goku', line: 'Heh... yeah. I think... we actually did it.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'piccolo', pose: 'p_kneelLook', face: 'calm' }],
        cam: { from: { at: 'piccolo', local: [0.6, 0.7, 1.6] }, look: { at: 'piccolo:head' }, fov: 38 },
        say: { who: 'piccolo', line: 'Hmph. Not bad, Goku.', duration: 2.4, style: 'quiet' },
        hold: 3,
      },
      // everybody on one frame, breathing
      {
        call: (ctx) => {
          ctx.cast.group = { pos: ctx.cast.goku.pos.clone() };
        },
        cam: { from: { at: 'group', off: [6, 2.4, 8] }, to: { at: 'group', off: [7.5, 3, 10] }, look: { at: 'group', off: [0, 0.4, 0] }, fov: 46, fov2: 50, ease: 'inOut' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      ctx.m.flags.falseVictory = true;
    },
  };

  S.frieza_returns = {
    id: 'frieza_returns',
    cast,
    events: [
      // a sound. Just one, small, from somewhere up and behind them.
      {
        sfx: { name: 'rockBreak', vol: 0.7, pitch: 0.8 },
        pose: [{ who: 'goku', pose: 'g_defeatKnee', face: 'shock', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.5, 0.35, 1.2] }, look: { at: 'goku:head' }, fov: 36 },
        hold: 2,
      },
      // up on the cliff, against the sky
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza, cl = ctx.cast.cliff;
          fz.setHidden(false);
          fz.setPosition(cl.pos.clone());
          fz.grounded = true;
          fz.yaw = fz.prevYaw = Math.atan2(ctx.cast.goku.pos.x - cl.pos.x, ctx.cast.goku.pos.z - cl.pos.z);
          if (fz.model.cutTail) fz.model.cutTail(0.45);
          if (fz.model.setBattered) fz.model.setBattered(true);
          fz.setState('scripted', { pose: 'idle', expression: 'angry' });
        },
        show: 'frieza',
        mood: { amount: 0.45, color: 0x3a1020, seconds: 1.4 },
        cam: { from: { at: 'frieza', off: [-5, -3.5, 9] }, to: { at: 'frieza', off: [-4.2, -3, 7.6] }, look: { at: 'frieza', off: [0, 0.8, 0] }, fov: 44, fov2: 40, ease: 'inOut' },
        hold: 3.2,
      },
      // they see him before anyone says a word
      {
        pose: [
          { who: 'krillin', pose: 'idle', face: 'shock' },
          { who: 'gohan', pose: 'idle', face: 'shock' },
        ],
        cam: { from: { at: 'goku', local: [2.6, 0.6, 3.4] }, look: { at: 'frieza', off: [0, 0.5, 0] }, fov: 46 },
        say: { who: 'goku', line: 'Frieza...?! He is still alive...', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // closer: bloodied, breathing hard, half his tail gone
      {
        cam: { from: { at: 'frieza', local: [1.3, 0.1, 2.6] }, to: { at: 'frieza', local: [1, 0.05, 2] }, look: { at: 'frieza', off: [0, 0.1, 0] }, fov: 40, fov2: 36 },
        tick: (ctx) => {
          const fz = ctx.cast.frieza;
          if (ctx.b.frame % 14 === 0) ctx.b.vfx.dust(fz.pos.clone().add(new V3(0, 0.4, 0)), 0.8, 3, 0x6a6a6a);
        },
        hold: 2.6,
      },
      // quiet first: the eyes, closer and closer
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'cold' }],
        cam: { from: { at: 'frieza:head', local: [0.55, -0.1, 1.25] }, to: { at: 'frieza:head', local: [0.32, -0.05, 0.75] }, look: { at: 'frieza:head' }, fov: 36, fov2: 28 },
        say: { who: 'frieza', line: 'You nearly convinced me that I could lose.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // and then it breaks: rigid, the tail lashing behind him
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          ctx.b.vfx.ring(fz.pos.clone().add(new V3(0, 0.3, 0)), 5, 0xc060ff, 0.45, new V3(0, 1, 0));
          ctx.b.sfx('kiUp', fz, { vol: 0.9, pitch: 0.7 });
        },
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry', speed: 6 }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.1] }, to: { at: 'frieza:head', local: [0.38, -0.08, 0.88] }, look: { at: 'frieza:head' }, fov: 36, fov2: 32 },
        say: { who: 'frieza', line: 'You filthy monkey... LOOK at what you\'ve done to me!', duration: 4.2, style: 'shout' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const fz = c.frieza;
      if (fz) {
        fz.setHidden(false);
        if (c.cliff) fz.setPosition(c.cliff.pos.clone());
        if (fz.model.cutTail) fz.model.cutTail(0.45);
        if (fz.model.setBattered) fz.model.setBattered(true);
      }
      m.flags.friezaSurvived = true;
    },
  };

  S.piccolo_takes_the_beam = {
    id: 'piccolo_takes_the_beam',
    cast,
    events: [
      // the finger comes up, aimed at Goku
      {
        pose: [{ who: 'frieza', pose: 'fz_point', face: 'angry' }],
        cam: { from: { at: 'frieza', local: [-1.2, 0.2, 2.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 34 },
        tick: (ctx) => {
          const fz = ctx.cast.frieza;
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.flash(fz.handPos('R'), 0.6, 0xff4a8a, 0.15, SL.Toon.tex.glow);
        },
        say: { who: 'frieza', line: 'Die.', duration: 1.2 },
        hold: 1.4,
      },
      // Piccolo sees it first — and moves
      {
        call: (ctx) => {
          const { piccolo, goku } = ctx.cast;
          ctx.shoveFrom = piccolo.pos.clone();
          ctx.shoveTo = goku.pos.clone();
          ctx.gokuFrom = goku.pos.clone();
          const side = new V3(-(ctx.cast.frieza.pos.z - goku.pos.z), 0, ctx.cast.frieza.pos.x - goku.pos.x).normalize();
          const g2 = goku.pos.clone().addScaledVector(side, 3.2);
          g2.y = ctx.b.stage.heightAt(g2.x, g2.z);
          ctx.gokuTo = g2;
          ctx.b.sfx('dash', piccolo, { vol: 1.3 });
        },
        pose: [
          { who: 'piccolo', pose: 'dash', face: 'shout' },
          { who: 'goku', pose: 'idle', face: 'shock' },
        ],
        slow: { scale: 0.4, seconds: 1.2 },
        tick: (ctx, t) => {
          const k = U.clamp01(t / 0.5);
          const pc = ctx.cast.piccolo, g = ctx.cast.goku;
          pc.setPosition(ctx.shoveFrom.clone().lerp(ctx.shoveTo, k));
          if (k >= 0.8) g.setPosition(ctx.gokuFrom.clone().lerp(ctx.gokuTo, U.clamp01((k - 0.8) * 5)));
        },
        say: { who: 'piccolo', line: 'GOKU, MOVE!', duration: 1.2, style: 'shout' },
        cam: { from: { at: 'goku', local: [4, 0.6, 1.5] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 46 },
        hold: 0.9,
      },
      // the beam: a thin line from the cliff, through his chest
      {
        call: (ctx) => {
          const { piccolo, goku, frieza } = ctx.cast;
          const b = ctx.b;
          piccolo.setPosition(ctx.shoveTo);
          goku.setPosition(ctx.gokuTo);
          goku.setState('scripted', { pose: 'knockdown', expression: 'shock' });
          const from = frieza.handPos('R');
          const c = piccolo.chest();
          const past = c.clone().add(c.clone().sub(from).normalize().multiplyScalar(18));
          for (let i = 0; i <= 18; i++) b.vfx.trail(from.clone().lerp(past, i / 18), 0xff3a7a, 0.22, 0.5);
          b.vfx.flash(c, 2.4, 0xffd0e0, 0.3, SL.Toon.tex.glow);
          b.vfx.sparks(c, 0xff6a9a, 16, 12);
          b.sfx('beamFire', frieza, { vol: 1.1, pitch: 1.6 });
          b.cameraTraumaAt(c, 0.6);
        },
        pose: [{ who: 'piccolo', pose: 'pierced', face: 'hurt' }],
        screen: { flash: 0.3, color: '#ffd0e0' },
        cam: { from: { at: 'piccolo', local: [1.8, 0.5, 2.2] }, look: { at: 'piccolo', off: [0, 0.4, 0] }, fov: 38 },
        hold: 1.6,
      },
      {
        call: (ctx) => ctx.b.sfx('groundImpact', ctx.cast.piccolo, { vol: 0.8 }),
        pose: [{ who: 'piccolo', pose: 'lieBack', face: 'hurt', speed: 3 }],
        vfx: { kind: 'dust', at: { at: 'piccolo' }, radius: 2, count: 10 },
        cam: { from: { at: 'piccolo', off: [2.4, 2.2, 3] }, look: { at: 'piccolo', off: [0, 0.2, 0] }, fov: 42 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'goku', pose: 'g_defeatKnee', face: 'shock' }],
        cam: { from: { at: 'goku', local: [0.55, 0.35, 1.35] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'PICCOLO!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [-0.7, 0.9, 1.6] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'kid_gohan', line: 'MISTER PICCOLO!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // down, and still breathing
      {
        cam: { from: { at: 'piccolo', off: [1.3, 1.2, 1.3] }, look: { at: 'piccolo:head' }, fov: 38 },
        say: { who: 'piccolo', line: '...Idiot... do not... waste time on me...', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        cam: { from: { at: 'frieza', local: [1.2, 0.3, 2.6] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'frieza', line: 'I\'ll start with the Namekian. He\'s been a thorn in my side all day.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const pc = c.piccolo;
      if (pc) {
        // critically injured, NOT dead: he is lying there for the rest of the saga
        pc.hp = Math.max(1, Math.round(pc.hpMax * 0.03));
        pc.cannotDie = true;
        pc.untargetable = true;
        pc.alive = true;
        pc.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      }
      if (c.goku && ctx.gokuTo) c.goku.setPosition(ctx.gokuTo);
      m.flags.piccoloDown = true;
      m.flags.piccoloAlive = !!(pc && pc.alive);
    },
  };
})();
