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
 *   cam      camera move: { from, to, look, look2, fov, fov2, ease, shake, cut, follow (track the from anchor) }
 *            positions are { at: 'name', off: [x,y,z] } or a plain [x,y,z]
 *   hold     seconds to stay on this event (the beat's length)
 *   pose     { who: 'goku', pose: 'idle', face: 'calm', speed: 8 }
 *   place    { who, at: 'name'|[x,y,z], off: [x,y,z], face: 'name' }
 *   move     { who, to, seconds }  a slow drift (walking into frame, rising)
 *   space    { who, mode, at, off, local, height, to, seconds, face (a point), pose, expr, endPose, dir, distance }
 *            SL.Staging: ground | air | flight | landing | groundImpact | airImpact | free
 *   roles    { active, support, background, hidden, rest, clear }  who is in the shot (Staging.cast)
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
      // a bare actor name is shorthand for { at: name } (crack / shake / vfx / sfx points)
      if (typeof p === 'string') p = { at: p };
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
      if (ev.roles) Cinema.roles(ctx, ev.roles);
      const spaceH = ev.space ? Cinema.spaceStart(ctx, ev.space) : null;
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
      if (spaceH && spaceH.length) {
        yield () => b.skipRequested || spaceH.every((h) => h.done());
        for (const h of spaceH) h.finish();
      }
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
      if (p.mode && f.setPosition) {
        Staging.set(ctx.m, f, p.mode, { pos: Cinema.point(ctx, p), height: p.height, face: p.face ? Cinema.point(ctx, typeof p.face === 'string' ? { at: p.face } : p.face) : null });
        return;
      }
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
        // scene.auraCap: a scene shot in close-up keeps every aura low unless a beat asks for it
        f.setState('scripted', { pose: one.pose, expression: one.face, speed: one.speed, aura: one.aura !== undefined ? one.aura : ctx.scene && ctx.scene.auraCap !== undefined ? Math.min(ctx.scene.auraCap, (f.form && f.form.aura && f.form.aura.idle) || 0) : undefined });
        if (one.face && f.model && f.model.setExpression) f.model.setExpression(one.face);
      }
    },

    transform(ctx, t) {
      const f = ctx.cast[t.who];
      if (!f) return;
      // a form by index or by id ('ssj'): an id used to reach applyForm as a string and leave the fighter formless
      const idx = typeof t.form === 'string' ? f.def.forms.findIndex((x) => x.id === t.form) : t.form;
      if (idx !== undefined && idx >= 0 && f.applyForm) f.applyForm(idx);
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
          // c.follow: a tracking shot — the lens moves with its anchor (behind a man walking)
          const pos = c.follow ? Cinema.point(ctx, c.from) : to ? from.clone().lerp(to, k) : from.clone();
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

    /** Event `space`: one or more SL.Staging moves, started together; returns their handles (a transition holds the event until it lands). */
    spaceStart(ctx, sp) {
      const list = Array.isArray(sp) ? sp : [sp];
      const handles = [];
      for (const s of list) {
        const f = ctx.cast[s.who];
        if (!f || !f.setPosition) continue;
        const opts = Object.assign({}, s);
        if (s.at || s.off) opts.pos = Cinema.point(ctx, { at: s.at || s.who, off: s.off, local: s.local });
        if (s.to) opts.to = Cinema.point(ctx, typeof s.to === 'string' ? { at: s.to } : s.to);
        if (s.face) opts.face = Cinema.point(ctx, typeof s.face === 'string' ? { at: s.face } : s.face);
        if (s.dir) opts.dir = new V3(s.dir[0], s.dir[1], s.dir[2]);
        handles.push(Staging.set(ctx.m, f, s.mode, opts));
      }
      return handles;
    },

    /** Event `roles`: Staging.cast with the scene's actor names. */
    roles(ctx, r) {
      const names = (list) => (list || []).map((n) => (typeof n === 'string' ? ctx.cast[n] : Object.assign({}, n, { f: ctx.cast[n.who] }))).filter((x) => x && (x.f || x.setHidden));
      Staging.cast(ctx.b, { active: names(r.active), support: names(r.support), background: names(r.background), hidden: names(r.hidden) }, r);
    },
  });

  /*
   * STAGING — where the story puts a body in space, said out loud (the owner, 2026-10-02: fighters who
   * should fight in the air were standing on the field, others who should stand were floating; old
   * characters stayed in the shot because they had been spawned earlier). Every story placement
   * names its MODE, and nothing is pressed to the ground unless the mode says ground.
   *
   *   ground        on the terrain: feet on the support height, grounded, no drift; the AI keeps to
   *                 the ground (f.storySpace)
   *   air           above the terrain at `height` (default 3 m, or the height it already has):
   *                 airborne, never snapped to the terrain, a flight pose while scripted; the AI
   *                 stays up (f.storyAltitude)
   *   flight        flies from where it is to `to` over `seconds`, airborne the whole way
   *   landing       comes down from the air onto the terrain over `seconds`: a landing crouch and
   *                 dust at the contact, then ground mode
   *   groundImpact  driven down onto the terrain: it really reaches the ground (the contact is at the
   *                 terrain height, never above it), a crater, rocks, dust and a shake there; ends
   *                 in ground mode, down
   *   airImpact     struck in the air: thrown along `dir` and kept airborne (a hit never drops it to
   *                 the ground), a flash where the blow landed
   *   slide         knocked back along the ground by `distance`: the feet stay on the terrain, dust behind
   *   free          the story lets go: no space preference
   *
   * Staging.set(m, f, mode, opts) returns { done(), finish() }: transitions run on the mission tick
   * (scene event `space` holds until they land). Staging.cast(b, roles, opts) — who is in the shot.
   */
  const Staging = (SL.Staging = {
    MODES: ['ground', 'air', 'flight', 'landing', 'groundImpact', 'airImpact', 'slide', 'free'],

    groundY(b, x, z, y) {
      const st = b.stage;
      if (!st.hasGround) return 0;
      return st.supportHeight ? st.supportHeight(x, z, y === undefined ? 1e6 : y) : st.heightAt(x, z);
    },

    _put(f, p) {
      f.setPosition(p);
      if (f.prevPos) f.prevPos.copy(f.pos);
      f.vel.set(0, 0, 0);
      f.fallVel = 0;
    },

    _face(f, at) {
      if (at && f.yaw !== undefined) f.yaw = f.prevYaw = Math.atan2(at.x - f.pos.x, at.z - f.pos.z);
    },

    /** A pose for a scripted body (a body the AI or the player drives keeps its own animation). */
    _pose(f, opts, fallback) {
      const pose = opts.pose || fallback;
      if (!pose) return;
      if (opts.pose || f.state === 'scripted') f.setState('scripted', { pose, expression: opts.expr || undefined, speed: opts.speed });
    },

    _done: { done: () => true, finish() {} },

    /**
     * A story placement that knows where it is (every mission's place() helper and the kits route here):
     * a point on the terrain, or within 0.6 m of it, stands the fighter ON it; a point higher than that is
     * an air placement — airborne and held there. It never marks a body 'grounded' a metre up (bodies
     * used to stand on nothing) and never presses an air placement down to the field.
     */
    place(f, pos, yaw) {
      f.setPosition(pos);
      if (yaw !== undefined) f.yaw = yaw;
      f.prevYaw = f.yaw;
      f.vel.set(0, 0, 0);
      f.fallVel = 0;
      // a stage with no ground (open space) keeps the old meaning: the body is where it was put
      const gh = f.battle.stage.hasGround ? Staging.groundY(f.battle, pos.x, pos.z, pos.y + 0.6) : pos.y;
      if (pos.y - gh < 0.6) {
        f.pos.y = gh;
        f.grounded = true;
      } else f.grounded = false;
      if (f.prevPos) f.prevPos.copy(f.pos);
    },

    set(m, f, mode, opts = {}) {
      const b = m.battle;
      const S = Staging;
      const p = (opts.pos || f.pos).clone();
      const face = opts.face && opts.face.isVector3 ? opts.face : null;
      f.storyMode = mode;
      switch (mode) {
        case 'ground': {
          p.y = S.groundY(b, p.x, p.z);
          S._put(f, p);
          f.grounded = true;
          f.storySpace = 'ground';
          S._face(f, face);
          S._pose(f, opts);
          return S._done;
        }
        case 'air': {
          const gh = S.groundY(b, p.x, p.z);
          const height = opts.height !== undefined ? opts.height : opts.pos ? 3 : Math.max(2.5, f.pos.y - gh);
          p.y = gh + height;
          S._put(f, p);
          f.grounded = false;
          f.storySpace = 'air';
          f.storyAltitude = Math.max(1.5, height * 0.8);
          S._face(f, face);
          S._pose(f, opts, 'flyIdle');
          return S._done;
        }
        case 'free':
          f.storySpace = null;
          f.storyMode = null;
          return S._done;
        default:
          return S._transition(m, f, mode, opts, p, face);
      }
    },

    _transition(m, f, mode, opts, p, face) {
      const b = m.battle, S = Staging;
      const from = f.pos.clone();
      let to;
      let seconds = opts.seconds;
      if (mode === 'flight') {
        to = (opts.to || p).clone();
        if (opts.height !== undefined) to.y = S.groundY(b, to.x, to.z) + opts.height;
        seconds = seconds || 1.2;
        S._pose(f, opts, 'flyForward');
      } else if (mode === 'landing') {
        to = (opts.to || p).clone();
        to.y = S.groundY(b, to.x, to.z);
        seconds = seconds || 0.7;
        S._pose(f, opts.pose ? opts : { pose: f.state === 'scripted' ? 'flyDown' : null });
      } else if (mode === 'groundImpact') {
        to = (opts.to || p).clone();
        to.y = S.groundY(b, to.x, to.z);
        seconds = seconds || 0.28;
      } else if (mode === 'slide') {
        const dir = (opts.dir || f.forward.clone().negate()).clone().setY(0).normalize();
        to = from.clone().addScaledVector(dir, opts.distance || 2);
        to.y = S.groundY(b, to.x, to.z);
        seconds = seconds || 0.3;
        if (opts.pose) S._pose(f, opts);
      } else if (mode === 'airImpact') {
        const dir = (opts.dir || f.forward.clone().negate()).clone().normalize();
        to = from.clone().addScaledVector(dir, opts.distance || 6);
        const gh = S.groundY(b, to.x, to.z);
        if (to.y < gh + 1.5) to.y = gh + 1.5; // a blow in the air keeps it in the air
        seconds = seconds || 0.35;
        b.vfx.flash(f.chest(), 2.2, opts.color === undefined ? 0xffffff : opts.color, 0.2, SL.Toon.tex.glow);
        b.cameraTraumaAt(f.pos, opts.shake === undefined ? 0.35 : opts.shake);
      } else {
        console.warn('[SL] Staging: unknown mode ' + mode);
        return S._done;
      }
      b.stage.clampPosition(to);
      f.grounded = false;
      const ease = mode === 'groundImpact' ? (t) => t * t * t : mode === 'airImpact' || mode === 'slide' ? EASE.out : EASE.inOut;
      let t = 0, ended = false;
      const land = () => {
        if (ended) return;
        ended = true;
        const i = m.tickHooks.indexOf(hook);
        if (i >= 0) m.tickHooks.splice(i, 1);
        S._put(f, to);
        if (mode === 'flight' || mode === 'airImpact') {
          f.grounded = false;
          f.storySpace = 'air';
          f.storyAltitude = Math.max(1.5, (to.y - S.groundY(b, to.x, to.z)) * 0.8);
          S._face(f, face);
          if (mode === 'flight' && f.state === 'scripted') f.setState('scripted', { pose: opts.endPose || 'flyIdle' });
          return;
        }
        // landing and impacts end with the feet (or the back) on the terrain
        f.grounded = true;
        f.storySpace = 'ground';
        S._face(f, face);
        if (mode === 'slide') {
          if (opts.endPose) f.setState('scripted', { pose: opts.endPose, expression: opts.expr || undefined });
          return;
        }
        if (mode === 'landing') {
          b.vfx.dust(to, 1.2, 10);
          b.sfx('jump', f, { vol: 0.8 });
          if (f.state === 'scripted' || opts.endPose) f.setState('scripted', { pose: opts.endPose || 'idle', expression: opts.expr || undefined });
          return;
        }
        // GROUND IMPACT: the contact point is the terrain, so the crater, the rocks and the camera
        // shake happen where the body is (a camera following it stays above the rim: CameraRig)
        const r = opts.radius || 3;
        if (b.stage.crater) b.stage.crater(to, r, opts.depth === undefined ? 0.7 : opts.depth, null);
        // the crater just lowered the ground under it: the body goes down into it, not left floating
        to.y = S.groundY(b, to.x, to.z);
        S._put(f, to);
        b.vfx.dust(to, r, 18);
        b.vfx.debrisBurst(to.clone().add(new V3(0, 0.3, 0)), 14, (b.stage.def.terrain && b.stage.def.terrain.dirt) || 0x8a7a6a, 10, 0.25);
        b.vfx.ring(to.clone().add(new V3(0, 0.1, 0)), r * 2.2, 0xffffff, 0.45, new V3(0, 1, 0));
        b.cameraTraumaAt(to, opts.shake === undefined ? 0.75 : opts.shake);
        b.sfx(opts.sfx || 'groundImpact', null, { at: to, vol: 1.2 });
        if (f.state === 'scripted' || opts.endPose) f.setState('scripted', { pose: opts.endPose || 'knockdownFace', expression: opts.expr || 'hurt' });
        else f.setState('knockdown', { frames: opts.downFrames || 50 });
      };
      const hook = () => {
        t = Math.min(1, t + 1 / 60 / seconds);
        const q = from.clone().lerp(to, ease(t));
        // a flight or a fall never cuts through the ground on the way
        const gh = S.groundY(b, q.x, q.z);
        if (q.y < gh || mode === 'slide') q.y = gh;
        if (mode === 'slide' && b.frame % 3 === 0) b.vfx.dust(q, 0.5, 2);
        f.setPosition(q);
        if (f.prevPos) f.prevPos.copy(f.pos);
        f.vel.set(0, 0, 0);
        if (mode === 'flight' && to.distanceToSquared(from) > 0.01 && f.yaw !== undefined) {
          const d = to.clone().sub(from);
          if (Math.abs(d.x) + Math.abs(d.z) > 0.2) f.yaw = Math.atan2(d.x, d.z);
        }
        if (t >= 1) land();
      };
      m.tickHooks.push(hook);
      return { done: () => ended, finish: land };
    },

    /**
     * WHO IS IN THE SHOT. Staging.cast(b, roles, opts) gives every listed fighter a role for this
     * stretch of story (entries are fighters, or { f, pose, face, at } with `at` a point):
     *   active      fighting: visible, targetable, solid (the mission hands out controllers; one the
     *               cast took away is given back)
     *   support     in the scene, not in the fight: visible, posed, untouchable, at least
     *               opts.supportClear (10 m) from the fight
     *   background  their story location: visible, untouchable, at least opts.clear (34 m) from the
     *               fight, facing it
     *   hidden      not here: hidden, untouchable, scripted
     * opts.rest decides the fighters nobody listed: 'keep' (default), 'hidden' or 'background'.
     * The fight's centre is opts.centre or the middle of the active fighters. The player's own
     * fighter is never hidden. f.storyRole records the role.
     */
    cast(b, roles, opts = {}) {
      const S = Staging;
      const entry = (x) => (x && x.f ? x : { f: x });
      const lists = {};
      for (const k of ['active', 'support', 'background', 'hidden']) lists[k] = (roles[k] || []).filter(Boolean).map(entry).filter((e) => e.f);
      const listed = new Set();
      for (const k of Object.keys(lists)) for (const e of lists[k]) listed.add(e.f);
      if (opts.rest && opts.rest !== 'keep') {
        for (const f of b.fighters) if (!listed.has(f) && f !== b.player && !f.hidden) lists[opts.rest === 'background' ? 'background' : 'hidden'].push({ f });
      }
      const centre = opts.centre ? opts.centre.clone() : new V3();
      if (!opts.centre) {
        const act = lists.active.map((e) => e.f);
        if (act.length) for (const f of act) centre.addScaledVector(f.pos, 1 / act.length);
      }
      const stub = () => ({ update: () => SL.emptyIntent(), castStub: true });
      const benched = (f) => {
        if (f.controller && !f.controller.castStub) f._castCtl = f.controller;
        if (f !== b.player) f.controller = stub();
        f.untargetable = f.intangible = true;
        for (const o of b.fighters) if (o.target === f) o.target = null;
      };
      const away = (f, min) => {
        const d = f.pos.clone().sub(centre).setY(0);
        if (d.length() >= min) return;
        if (d.lengthSq() < 0.25) d.set(0, 0, 1);
        const p = centre.clone().addScaledVector(d.normalize(), min);
        b.stage.clampPosition(p);
        p.y = S.groundY(b, p.x, p.z);
        S._put(f, p);
        f.grounded = true;
      };
      for (const e of lists.active) {
        const f = e.f;
        f.setHidden(false);
        f.untargetable = f.intangible = false;
        if (f.controller && f.controller.castStub && f._castCtl) f.controller = f._castCtl;
        f.storyRole = 'active';
      }
      for (const [k, min] of [['support', opts.supportClear || 10], ['background', opts.clear || 34]]) {
        for (const e of lists[k]) {
          const f = e.f;
          if (f === b.player) continue;
          f.setHidden(false);
          benched(f);
          if (e.at) {
            const p = e.at.clone();
            p.y = S.groundY(b, p.x, p.z);
            S._put(f, p);
            f.grounded = true;
          } else if (lists.active.length || opts.centre) away(f, min);
          S._face(f, centre);
          if (e.pose || f.state !== 'scripted') f.setState('scripted', { pose: e.pose || 'idle', expression: e.face || 'shock' });
          f.storyRole = k;
        }
      }
      for (const e of lists.hidden) {
        const f = e.f;
        if (f === b.player) continue;
        benched(f);
        f.setHidden(true);
        if (f.aura) f.aura.target = 0;
        f.storyRole = 'hidden';
      }
      return { centre };
    },
  });
})();
