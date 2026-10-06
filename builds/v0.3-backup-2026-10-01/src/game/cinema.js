/*
 * CINEMA — a small, data-driven cutscene runner.
 *
 * A scene is data, not code: a list of events that the runner interprets against
 * the live battle. That means a scene can be written, read and reviewed as a
 * storyboard, and the same primitives (camera moves, poses, lines, VFX, music,
 * environment reactions, transformations) are reused by every cinematic instead
 * of each one hand-rolling its own camera maths.
 *
 *   SL.data.scenes.goku_namek_arrival = {
 *     id: 'goku_namek_arrival',
 *     cast: (m) => ({ goku: m.battle.story.goku, ... }),   // names used by events
 *     music: 'finale',
 *     events: [ { cam: {...}, hold: 2.4 }, { say: {...} }, ... ],
 *     end(ctx) { ... }        // the state the scene guarantees, skipped or not
 *   };
 *
 *   yield* SL.Cinema.play(mission, 'goku_namek_arrival');
 *
 * SKIP SAFETY. Every scene ends by running `end(ctx)`. A skip request stops the
 * event list immediately and then runs exactly the same `end`, so a skipped
 * scene and a watched scene leave the battle in the same state: same forms, same
 * positions, same story flags, same lighting, same music, control returned.
 *
 * EVENT REFERENCE (every field optional; one object can carry several)
 *   cam      camera move: { from, to, look, look2, fov, fov2, ease, shake, cut }
 *            positions are { at: 'name', off: [x,y,z] } or a plain [x,y,z]
 *   hold     seconds to stay on this event (the beat's length)
 *   pose     { who: 'goku', pose: 'idle', face: 'calm', speed: 8 }
 *   place    { who, at: 'name'|[x,y,z], off: [x,y,z], face: 'name' }
 *   move     { who, to, seconds }  a slow drift (walking into frame, rising)
 *   say      { who, line, jp, voice, duration, style }
 *   vfx      { kind: 'flash'|'ring'|'explosion'|'dust'|'rocks'|'stream'|'beamLine', ... }
 *   sfx      { name, who, pitch, vol } | music { song, level } | mood { amount, color, seconds }
 *   shake    trauma 0..1 at a fighter or point;  slow { scale, seconds }
 *   screen   { flash: 0..1, color }  fade { to: 'black'|'clear', seconds }
 *   title    { chapter, title, subtitle, duration }
 *   hide/show { who }        transform { who, form }        flag { name: value }
 *   torn     { who, on }  battle damage: the gi comes apart and stays apart
 *   damage   { who, level, burst }  clothing damage 0..3 (Fighter.setDamage): the outfit's own rips
 *   rage     { who, amount }  the red line across the face and the tears (amount 0 takes it off)
 *   crack    { at, radius, depth }  the ground answers: craters, or cracks on a tournament ring
 *   cue      { key, label, slow, auto, id }  the scene waits for the player to press one button
 *            (Mission.cue): hand it over, catch it, fire. ctx.cues[id || key] = { pressed, seconds }
 *   call     (ctx) => {}     an escape hatch for one-off staging
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const EASE = {
    linear: (t) => t,
    in: (t) => t * t,
    out: (t) => 1 - (1 - t) * (1 - t),
    inOut: (t) => U.easeInOutCubic(t),
    outCubic: (t) => U.easeOutCubic(t),
  };

  const Cinema = (SL.Cinema = {
    /** Resolve a scene position: a fighter name, a [x,y,z], or {at,off}. */
    point(ctx, p, out) {
      out = out || new V3();
      if (!p) return out.set(0, 0, 0);
      if (Array.isArray(p)) return out.set(p[0], p[1], p[2]);
      // { at: [x,y,z] } is a world point (documented for place/move; it used to resolve to the origin)
      const base = Array.isArray(p.at) ? new V3(p.at[0], p.at[1], p.at[2]) : p.at ? Cinema.actorPoint(ctx, p.at) : new V3();
      out.copy(base);
      if (p.off) out.add(new V3(p.off[0], p.off[1], p.off[2]));
      // offsets can also be given in the actor's own facing (forward/right/up)
      if (p.local && p.at && !Array.isArray(p.at)) {
        const [who, part] = String(p.at).split(':');
        const f = ctx.cast[who];
        const head = part === 'face' && f && f.model && f.model.joints && f.model.joints.head;
        if (head) {
          // 'name:face' + local: the offset is in the HEAD's own frame, so the camera stays in
          // front of the face when he kneels, bows or lies down
          const q = head.getWorldQuaternion(new THREE.Quaternion());
          out.copy(base).add(new V3(p.local[0] || 0, p.local[1] || 0, p.local[2] || 0).applyQuaternion(q));
        } else if (f && f.forward) {
          const fwd = f.forward.clone().setY(0).normalize();
          const right = new V3(fwd.z, 0, -fwd.x);
          out.copy(base)
            .addScaledVector(fwd, p.local[2] || 0)
            .addScaledVector(right, p.local[0] || 0);
          out.y += p.local[1] || 0;
        }
      }
      return out;
    },

    actorPoint(ctx, name) {
      // 'name:head' is the actor's head joint: a face can be framed whatever pose the body is
      // in (lying on his back, bent over somebody) — the chest point is only right standing up
      const [who, part] = String(name).split(':');
      const f = ctx.cast[who];
      if (!f) return new V3();
      if ((part === 'head' || part === 'face') && f.model && f.model.joints && f.model.joints.head && f.object) {
        f.model.root.updateMatrixWorld(true);
        return f.model.joints.head.getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
      }
      if (f.chest) return f.chest();
      if (f.position) return f.position.clone();
      return f.pos ? f.pos.clone() : new V3();
    },

    /**
     * A two-shot that is GUARANTEED to hold both of them (owner, human playtest round 3: a line
     * played over an empty field because the camera was framed by hand and both actors were
     * outside it). Square to the line between them, low, far enough back that the gap fits the
     * lens — so however far apart the story puts them, the frame still shows the confrontation.
     * a / b: fighters or points. Returns { pos, look, fov } for Mission.shot / camAt.
     */
    twoShot(a, b, opts = {}) {
      const A = a && a.isVector3 ? a.clone() : Cinema.pointOf(a);
      const B = b && b.isVector3 ? b.clone() : Cinema.pointOf(b);
      const fov = opts.fov === undefined ? 42 : opts.fov;
      const pad = opts.pad === undefined ? 2.2 : opts.pad;
      const aspect = opts.aspect || 1.6;
      const mid = A.clone().lerp(B, opts.bias === undefined ? 0.5 : opts.bias);
      const line = B.clone().sub(A);
      const gap = Math.max(1.5, line.length());
      let side = new V3(-line.z, 0, line.x);
      if (side.lengthSq() < 0.0001) side.set(1, 0, 0);
      side.normalize().multiplyScalar(opts.side === undefined ? 1 : opts.side);
      // half the horizontal field of view, from the vertical one
      const hHalf = Math.atan(Math.tan((fov * Math.PI) / 360) * aspect);
      const dist = Math.max(opts.minDist || 4, (gap / 2 + pad) / Math.tan(hHalf));
      const pos = mid.clone().addScaledVector(side, dist).add(new V3(0, opts.height === undefined ? 1.6 : opts.height, 0));
      if (opts.along) pos.addScaledVector(line.clone().normalize(), opts.along);
      return { pos, look: mid.clone().add(new V3(0, opts.lookUp === undefined ? 0.9 : opts.lookUp, 0)), fov, dist };
    },

    /**
     * A confrontation shot: `near` fills a corner of the frame from behind the shoulder and
     * `far` stands in the rest of it. Use this instead of a two-shot when the gap between them
     * would make both of them small (a two-shot of a 12 m gap is two dots).
     */
    overShoulder(near, far, opts = {}) {
      const A = Cinema.pointOf(near), B = Cinema.pointOf(far);
      const dir = B.clone().sub(A).setY(0);
      if (dir.lengthSq() < 0.0001) dir.set(0, 0, 1);
      dir.normalize();
      const side = new V3(-dir.z, 0, dir.x).multiplyScalar(opts.side === undefined ? 0.85 : opts.side);
      const back = opts.back === undefined ? 2.4 : opts.back;
      const pos = A.clone().addScaledVector(dir, -back).add(side).add(new V3(0, opts.height === undefined ? 0.55 : opts.height, 0));
      const look = B.clone().add(new V3(0, opts.lookUp === undefined ? 0.1 : opts.lookUp, 0));
      return { pos, look, fov: opts.fov === undefined ? 40 : opts.fov };
    },

    /** The framing point of a fighter, a prop or a plain vector. */
    pointOf(x) {
      if (!x) return new V3();
      if (x.isVector3) return x.clone();
      if (x.chest) return x.chest();
      if (x.pos) return x.pos.clone();
      if (x.position) return x.position.clone();
      return new V3();
    },

    /** Runs one scene. Yields like any mission phase. */
    *play(m, scene, opts = {}) {
      const b = m.battle;
      const def = typeof scene === 'string' ? SL.data.scenes[scene] : scene;
      if (!def) throw new Error('Cinema: unknown scene ' + scene);
      const ctx = {
        m,
        b,
        scene: def,
        cast: (def.cast && def.cast(m)) || {},
        opts,
        flags: m.flags,
        skipped: false,
      };
      b.emit('sceneStart', { id: def.id });
      m.lock(true);
      b.skipRequested = false;
      if (def.music) m.music(def.music.song || null, def.music.level);

      for (const ev of def.events || []) {
        if (b.skipRequested) {
          ctx.skipped = true;
          break;
        }
        if (ev.when && !ev.when(ctx)) continue;
        yield* Cinema.event(ctx, ev);
      }

      // the scene's guaranteed end state, watched or skipped
      Cinema.finish(ctx);
      b.emit('sceneEnd', { id: def.id, skipped: ctx.skipped });
      b.skipRequested = false;
      return ctx;
    },

    finish(ctx) {
      const { b, scene } = ctx;
      if (scene.clearMood !== false && b.stage.clearMood) b.stage.clearMood(0.6);
      ctx.m.endShot();
      if (scene.end) scene.end(ctx);
      if (scene.endMusic) ctx.m.music(scene.endMusic.song || null, scene.endMusic.level);
    },

    /** Applies one event, then holds for its beat. */
    *event(ctx, ev) {
      const { m, b } = ctx;
      if (ev.call) ev.call(ctx);
      if (ev.flag) for (const k of Object.keys(ev.flag)) m.flags[k] = ev.flag[k];
      if (ev.hide) Cinema.each(ctx, ev.hide, (f) => f.setHidden && f.setHidden(true));
      if (ev.show) Cinema.each(ctx, ev.show, (f) => f.setHidden && f.setHidden(false));
      if (ev.place) Cinema.place(ctx, ev.place);
      if (ev.pose) Cinema.pose(ctx, ev.pose);
      if (ev.transform) Cinema.transform(ctx, ev.transform);
      if (ev.torn) Cinema.each(ctx, ev.torn.who, (f) => f.setTorn && f.setTorn(ev.torn.on !== false));
      if (ev.damage) Cinema.each(ctx, ev.damage.who, (f) => f.setDamage && f.setDamage(ev.damage.level, { burst: !!ev.damage.burst }));
      if (ev.rage) Cinema.each(ctx, ev.rage.who, (f) => f.setRage && f.setRage(ev.rage.amount !== 0 && ev.rage.on !== false, ev.rage.amount === undefined ? 1 : ev.rage.amount));
      if (ev.crack && b.stage.crater) b.stage.crater(Cinema.point(ctx, ev.crack.at), ev.crack.radius || 3, ev.crack.depth === undefined ? 0.4 : ev.crack.depth, null);
      if (ev.mood) b.stage.setMood(ev.mood.amount, ev.mood.color === undefined ? 0x1a1424 : ev.mood.color, ev.mood.seconds === undefined ? 0.8 : ev.mood.seconds);
      if (ev.music) m.music(ev.music.song || null, ev.music.level);
      if (ev.sfx) b.sfx(ev.sfx.name, ev.sfx.who ? ctx.cast[ev.sfx.who] : null, { pitch: ev.sfx.pitch, vol: ev.sfx.vol, at: ev.sfx.at ? Cinema.point(ctx, ev.sfx.at) : undefined });
      if (ev.vfx) Cinema.vfx(ctx, ev.vfx);
      if (ev.screen && ev.screen.flash) SL.ScreenFX.flash(ev.screen.flash, ev.screen.color || '#ffffff');
      if (ev.shake) b.cameraTraumaAt(Cinema.point(ctx, ev.shake.at || ev.shake), ev.shake.amount === undefined ? 0.6 : ev.shake.amount);
      if (ev.slow) b.slowmo(ev.slow.scale === undefined ? 0.3 : ev.slow.scale, ev.slow.seconds === undefined ? 0.8 : ev.slow.seconds);
      if (ev.fade) m.fade(ev.fade.to || 'black', ev.fade.seconds === undefined ? 1 : ev.fade.seconds);
      if (ev.title) m.title(ev.title.chapter, ev.title.title, ev.title.subtitle, ev.title.duration || 3.4);
      // a cue waits on the player for as long as it takes: its shot holds until the next one cuts in
      if (ev.cam) Cinema.cam(ctx, ev.cam, ev.hold || (ev.cue ? 60 : 1));
      if (ev.say) Cinema.say(ctx, ev.say);
      // ev.tick(ctx, seconds): called every simulation tick while the event holds (a fade, a glow rising)
      let tickHook = null;
      if (ev.tick) {
        let n = 0;
        tickHook = () => ev.tick(ctx, ++n / 60);
        m.tickHooks.push(tickHook);
      }
      if (ev.move) yield* Cinema.move(ctx, ev.move);
      // cue: the scene waits on one button the player presses (Mission.cue); the result is kept
      if (ev.cue) (ctx.cues = ctx.cues || {})[ev.cue.id || ev.cue.key] = yield* m.cue(ev.cue.key, ev.cue.label, ev.cue);
      if (ev.hold) yield* m.cine(ev.hold);
      if (tickHook) {
        const i = m.tickHooks.indexOf(tickHook);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
    },

    each(ctx, who, fn) {
      const list = Array.isArray(who) ? who : [who];
      for (const name of list) {
        const f = ctx.cast[name];
        if (f) fn(f);
      }
    },

    place(ctx, p) {
      const f = ctx.cast[p.who];
      if (!f) return;
      const to = Cinema.point(ctx, p);
      if (p.ground !== false && ctx.b.stage.hasGround) to.y = ctx.b.stage.heightAt(to.x, to.z) + (p.lift || 0);
      if (f.setPosition) f.setPosition(to);
      else if (f.position) f.position.copy(to);
      if (f.vel) f.vel.set(0, 0, 0);
      if (p.face) {
        const at = Cinema.point(ctx, typeof p.face === 'string' ? { at: p.face } : p.face);
        if (f.yaw !== undefined) f.yaw = f.prevYaw = Math.atan2(at.x - f.pos.x, at.z - f.pos.z);
      }
      if (p.grounded !== undefined) f.grounded = p.grounded;
    },

    pose(ctx, p) {
      const list = Array.isArray(p) ? p : [p];
      for (const one of list) {
        const f = ctx.cast[one.who];
        if (!f || !f.setState) continue;
        // a mind in somebody else's body brings its habits: Ginyu strikes his pose in Goku's
        // body. Poses are joint angles, so the mind's own pose drives the borrowed rig.
        if (f.poses && !f.poses[one.pose] && !(SL.data.poses && SL.data.poses[one.pose]) && f.mind && f.mind.own && f.mind.own !== f) {
          const own = f.mind.own.poses || (f.mind.own.def && f.mind.own.def.poses);
          if (own && own[one.pose]) f.poses[one.pose] = own[one.pose];
        }
        f.setState('scripted', { pose: one.pose, expression: one.face, speed: one.speed, aura: one.aura });
        if (one.face && f.model && f.model.setExpression) f.model.setExpression(one.face);
      }
    },

    transform(ctx, t) {
      const f = ctx.cast[t.who];
      if (!f) return;
      if (t.form !== undefined && f.applyForm) f.applyForm(t.form);
    },

    say(ctx, s) {
      const who = ctx.cast[s.who];
      const speaker = s.who && who && who.def ? who.def.id : s.who;
      ctx.m.say(speaker, s.line, s.duration || 3, { jp: s.jp, voice: s.voice, style: s.style });
    },

    vfx(ctx, v) {
      const b = ctx.b;
      const at = Cinema.point(ctx, v.at);
      switch (v.kind) {
        case 'flash':
          b.vfx.flash(at, v.size || 4, v.color === undefined ? 0xffffff : v.color, v.life || 0.3, SL.Toon.tex.glow);
          break;
        case 'ring':
          b.vfx.ring(at, v.radius || 8, v.color === undefined ? 0xffffff : v.color, v.life || 0.6, v.flat === false ? undefined : new V3(0, 1, 0));
          break;
        case 'explosion':
          b.vfx.explosion(at, v.radius || 6, v.color === undefined ? 0xffc060 : v.color, { smoke: v.smoke !== false });
          break;
        case 'dust':
          b.vfx.dust(at, v.radius || 3, v.count || 14, v.color);
          break;
        case 'stream':
          b.vfx.streamInward(at, v.radius || 2.5, v.color === undefined ? 0xffffff : v.color, v.count || 6, v.size || 0.14, v.life || 0.45);
          break;
        case 'trail':
          b.vfx.trail(at, v.color === undefined ? 0xffffff : v.color, v.size || 0.5, v.life || 0.3);
          break;
        case 'bolt':
          b.vfx.bolt(at, v.length || 6, v.color === undefined ? 0xffffff : v.color);
          break;
        case 'rocks': {
          const n = v.count || 8;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + Math.random();
            const r = (v.radius || 4) * (0.4 + Math.random() * 0.8);
            const p = new V3(at.x + Math.cos(a) * r, at.y, at.z + Math.sin(a) * r);
            if (b.stage.hasGround) p.y = b.stage.heightAt(p.x, p.z);
            b.vfx.rock(p, new V3((Math.random() - 0.5) * 5, (v.lift || 8) * (0.6 + Math.random()), (Math.random() - 0.5) * 5), 0.18 + Math.random() * 0.3);
          }
          break;
        }
        case 'beamLine': {
          const to = Cinema.point(ctx, v.to);
          const steps = v.steps || 12;
          for (let i = 0; i <= steps; i++) b.vfx.trail(at.clone().lerp(to, i / steps), v.color === undefined ? 0xffffff : v.color, v.size || 0.5, v.life || 0.35);
          b.vfx.flash(to, v.size || 3, v.core === undefined ? 0xffffff : v.core, 0.3, SL.Toon.tex.glow);
          break;
        }
        default:
          break;
      }
    },

    /**
     * The halo of the dead over a fighter's head (Snake Way, the last stand). It follows
     * the head every tick and shows while the body does; returns the ring.
     */
    halo(b, f) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 28), new THREE.MeshBasicMaterial({ color: 0xfff2a0 }));
      ring.rotation.x = Math.PI / 2;
      b.scene.add(ring);
      const head = new V3();
      b.onTick(() => {
        if (b.disposed) return false;
        f.model.root.updateMatrixWorld(true);
        f.model.joints.head.getWorldPosition(head);
        head.sub(f.object.position).add(f.pos);
        // high enough to clear spiky hair
        ring.position.set(head.x, head.y + 0.8 * (f.scale || 1), head.z);
        // userData.off: the halo is taken away (a life given back) while the body stays
        ring.visible = f.model.root.visible && !ring.userData.off;
        return true;
      });
      return ring;
    },

    /**
     * A scene beam: a real engine beam from `owner` that ENDS ON `victim` — the head is pinned
     * to the victim's chest once it gets there (call pinBeam every tick while it should hold).
     * Staged attacks cannot miss and cannot knock the actor out of the shot: the victim should
     * be intangible for the length of the beat (the beam ignores intangible fighters).
     */
    beam(ctx, owner, victim, spec) {
      owner.target = victim;
      const beam = ctx.b.projectiles.spawnBeam(owner, spec, 1);
      ctx.beam = beam;
      ctx.beamVictim = victim;
      return beam;
    },
    pinBeam(ctx, sparks = 0xffe8b0) {
      const beam = ctx.beam, v = ctx.beamVictim;
      if (!beam || beam.done || !v) return false;
      const c = v.chest();
      if (beam.headOverride || beam.origin.distanceTo(c) <= beam.headDist) {
        beam.headOverride = c;
        if (ctx.b.frame % 2 === 0) ctx.b.vfx.sparks(c.clone().addScaledVector(v.forward, 0.3), sparks, 6, 12, 0.12);
        return true;
      }
      return false;
    },

    /** A camera beat. Interpolates position, look-at and field of view. */
    cam(ctx, c, seconds) {
      const m = ctx.m;
      const from = Cinema.point(ctx, c.from);
      const to = c.to ? Cinema.point(ctx, c.to) : null;
      const ease = EASE[c.ease || 'inOut'] || EASE.inOut;
      const fov1 = c.fov === undefined ? 44 : c.fov;
      const fov2 = c.fov2 === undefined ? fov1 : c.fov2;
      // look targets are resolved every frame so the camera tracks moving actors
      m.shot(
        (t, out) => {
          const k = ease(t);
          const look = Cinema.point(ctx, c.look);
          if (c.look2) look.lerp(Cinema.point(ctx, c.look2), k);
          const pos = to ? from.clone().lerp(to, k) : from.clone();
          if (c.orbit) {
            const centre = Cinema.point(ctx, c.orbit.at || c.look);
            const ang = (c.orbit.from || 0) + ((c.orbit.to === undefined ? Math.PI : c.orbit.to) - (c.orbit.from || 0)) * k;
            const r = U.lerp(c.orbit.radius || 5, c.orbit.radius2 === undefined ? c.orbit.radius || 5 : c.orbit.radius2, k);
            pos.set(centre.x + Math.sin(ang) * r, centre.y + U.lerp(c.orbit.y || 0.4, c.orbit.y2 === undefined ? c.orbit.y || 0.4 : c.orbit.y2, k), centre.z + Math.cos(ang) * r);
          }
          out.pos.copy(pos);
          out.look.copy(look);
          out.fov = U.lerp(fov1, fov2, k);
        },
        seconds,
        { cut: c.cut !== false, blendIn: c.blend === undefined ? 0 : c.blend }
      );
    },

    /** Slides an actor from where they are to a point over a few seconds. */
    *move(ctx, mv) {
      const f = ctx.cast[mv.who];
      if (!f) return;
      const to = Cinema.point(ctx, mv);
      if (mv.ground !== false && ctx.b.stage.hasGround) to.y = ctx.b.stage.heightAt(to.x, to.z) + (mv.lift || 0);
      const from = f.pos.clone();
      const seconds = mv.seconds || 1.2;
      const ease = EASE[mv.ease || 'inOut'] || EASE.inOut;
      let t = 0;
      const hook = () => {
        t = Math.min(1, t + 1 / 60 / seconds);
        const p = from.clone().lerp(to, ease(t));
        f.setPosition ? f.setPosition(p) : f.pos.copy(p);
        if (f.prevPos) f.prevPos.copy(f.pos);
        if (mv.face && f.yaw !== undefined) {
          const at = Cinema.point(ctx, typeof mv.face === 'string' ? { at: mv.face } : mv.face);
          f.yaw = f.prevYaw = Math.atan2(at.x - f.pos.x, at.z - f.pos.z);
        }
      };
      ctx.m.tickHooks.push(hook);
      yield* ctx.m.cine(seconds);
      const i = ctx.m.tickHooks.indexOf(hook);
      if (i >= 0) ctx.m.tickHooks.splice(i, 1);
      if (!mv.partial) hook();
    },
  });
})();
