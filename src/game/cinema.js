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
 *            or a SEMANTIC shot: { subject, focus: face|closeup|upper|medium|full|wide, angle: front|three|
 *            side|back|low|high|ots, side, dist, fov, height, aim, room, with (two-shot), over (ots),
 *            focus2 / dist2 / fov2 (the framing moves to that over the shot: a transformation) } — see FRAMING.
 *            Every story shot gets the safety pass (lens out of ground/rock, subject seen, face in frame);
 *            raw: true opts out. Anchors: 'name' (chest), 'name:head', 'name:face', 'name:body', 'name:feet'
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
        const f = Cinema.actor(ctx, who) || ctx.cast[who];
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
      const f = Cinema.actor(ctx, who) || ctx.cast[who];
      if (!f) return new V3();
      if (part === 'face' && f.model && f.model.joints) return Cinema.body(f).face;
      if (part === 'body' && f.model && f.model.joints) return Cinema.body(f).centre;
      if (part === 'feet') return f.pos ? f.pos.clone() : new V3();
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
      ctx.actors = Cinema.guardCast(ctx.cast, def.id);
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
      // the shot lasts as long as the event: its hold, else its move or its staging transition (a shot that
      // ended after a second used to hand a walking actor back to the gameplay camera mid-walk), else a cue
      if (ev.cam) {
        let len = ev.hold || 0;
        if (!len && ev.move) len = (ev.move.seconds || 1.2) + 0.2;
        if (!len && ev.space) for (const s of Array.isArray(ev.space) ? ev.space : [ev.space]) len = Math.max(len, (s.seconds || 1) + 0.2);
        Cinema.cam(ctx, ev.cam, len || (ev.cue ? 60 : 1), ev);
      }
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
      // SPEAKER-AWARE (the owner, 2026-10-06: Bulma talking sideways, Vegeta bowing at nobody): say.to names
      // the listener (an actor or a point) — the speaker turns to them over a quarter of a second
      if (s.to && who && who.pos && who.yaw !== undefined) Cinema.turnTo(ctx, who, s.to);
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

    /** Turn a body to face an actor or a point over a number of ticks (the yaw only: the pose keeps the rest). */
    turnTo(ctx, f, to, frames = 14) {
      const p = typeof to === 'string' ? Cinema.point(ctx, { at: to }) : to.isVector3 ? to : Cinema.point(ctx, to);
      const goal = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
      let d = goal - f.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      if (Math.abs(d) < 0.02) return;
      const y0 = f.yaw;
      let n = 0;
      const hook = () => {
        n++;
        const k = U.easeInOutCubic ? U.easeInOutCubic(Math.min(1, n / frames)) : Math.min(1, n / frames);
        f.yaw = f.prevYaw = y0 + d * k;
        if (n >= frames) {
          const i = ctx.m.tickHooks.indexOf(hook);
          if (i >= 0) ctx.m.tickHooks.splice(i, 1);
        }
      };
      ctx.m.tickHooks.push(hook);
    },

    /** A camera beat. Interpolates position, look-at and field of view. */
    cam(ctx, c, seconds, ev) {
      const m = ctx.m;
      const semantic = !!(c.subject && !c.from);
      const subj = Cinema.subjectOf(ctx, c, ev);
      const st = {};
      const from = semantic ? new V3() : Cinema.point(ctx, c.from);
      const to = !semantic && c.to ? Cinema.point(ctx, c.to) : null;
      const ease = EASE[c.ease || 'inOut'] || EASE.inOut;
      const fov1 = c.fov === undefined ? 44 : c.fov;
      const fov2 = c.fov2 === undefined ? fov1 : c.fov2;
      // look targets are resolved every frame so the camera tracks moving actors
      m.shot(
        (t, out) => {
          if (semantic) {
            Cinema.frameShot(ctx, c, out);
            // focus2: the framing moves over the shot (a transformation: the whole body, then in to the face)
            if (c.focus2) {
              const o2 = { pos: new V3(), look: new V3(), fov: out.fov };
              Cinema.frameShot(ctx, Object.assign({}, c, { focus: c.focus2, dist: c.dist2, fov: c.fov2 }), o2);
              const k = ease(t);
              out.pos.lerp(o2.pos, k);
              out.look.lerp(o2.look, k);
              out.fov = U.lerp(out.fov, o2.fov, k);
            }
            if (subj) Cinema.safe(ctx, out, subj, st);
            return;
          }
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
          if (subj) Cinema.safe(ctx, out, subj, st);
        },
        seconds,
        // held until the next shot cuts in or the scene ends (Cinema.finish): an event with no camera of its own
        // never hands the scene back to the gameplay camera in the middle of it
        { cut: c.cut !== false, blendIn: c.blend === undefined ? 0 : c.blend, hold: true }
      );
    },


    /* ================================================================ FRAMING
     * Every story camera knows WHO it is about and WHAT of them must be on screen (the owner, 2026-10-03:
     * a mountain where Goku should be, Dende's and Mr. Satan's shoes while they talked, Goku's chest with
     * his face above the frame).
     *
     *   Cinema.body(f)      the feet, hips, chest, head, face, top and pose bounds of a fighter, measured
     *                       from the posed model this frame — standing, flying, crouched, sitting or lying
     *                       all come out right — never the world origin
     *   semantic shots      cam: { subject: 'goku', focus, angle, side, dist, fov, height, with, over }
     *                       focus: 'face' | 'closeup' | 'upper' | 'medium' | 'full' | 'wide'
     *                       angle: 'front' | 'three' (a three-quarter, the default) | 'side' | 'back' |
     *                              'low' | 'high' | 'ots' (over: the actor whose shoulder we are behind)
     *                       with: a second actor — a two-shot of both. The lens is placed from the body
     *                       every frame, so it follows the subject when he walks, flies, falls or rises.
     *   the safety pass     on EVERY story shot, hand-placed ones included: the lens kept out of the
     *                       ground and out of rock; when ground or rock stands between the lens and the
     *                       subject the lens moves (up, then round him) until it sees him; the subject's
     *                       key point is kept in the frame — the FACE first when he is talking or the
     *                       shot is close, the body otherwise — the aim sliding toward it and the lens
     *                       backing off when it is too close to fit. The subject is `cam.subject`, else
     *                       the speaker of the event's line when the camera is on him (or near him), else
     *                       the actor the camera looks at. `raw: true` opts a shot out (the Earth from
     *                       space, the inside of the Spirit Bomb, a deliberate abstract frame).
     */
    /** An actor by name ('goku' or 'goku:head'), never a pseudo-point that borrowed its name. */
    actor(ctx, name) {
      if (!name || typeof name !== 'string') return null;
      const who = name.split(':')[0];
      const f = (ctx.actors && ctx.actors[who]) || ctx.cast[who];
      return f && f.model && f.pos ? f : null;
    },

    /** The actors of a scene are protected: a point given an actor's name is kept beside it, not over it. */
    guardCast(cast, sceneId) {
      const actors = {};
      for (const k of Object.keys(cast)) {
        const v = cast[k];
        if (!v || !v.model || !v.pos) continue;
        actors[k] = v;
        let warned = false;
        Object.defineProperty(cast, k, {
          configurable: true,
          enumerable: true,
          get: () => actors[k],
          set: (nv) => {
            if (nv && nv.model && nv.pos) actors[k] = nv;
            else if (!warned) {
              warned = true;
              console.warn('[SL] scene ' + sceneId + ": a point named '" + k + "' would hide the actor — the actor is kept");
            }
          },
        });
      }
      return actors;
    },

    /** The posed body of a fighter, this frame. */
    body(f) {
      const j = f.model && f.model.joints;
      const pts = [];
      const at = (name) => {
        if (!j || !j[name] || !f.object) return null;
        return j[name].getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
      };
      if (f.model && f.model.root) f.model.root.updateMatrixWorld(true);
      const head = at('head') || f.pos.clone().add(new V3(0, (f.height || 1.7) * 0.86, 0));
      const chest = at('chest') || f.pos.clone().lerp(head, 0.72);
      const hips = at('hips') || f.pos.clone().lerp(head, 0.5);
      for (const n of ['footL', 'footR', 'handL', 'handR', 'kneeL', 'kneeR']) {
        const p = at(n);
        if (p) pts.push(p);
      }
      const s = f.model && f.model.root ? f.model.root.scale.y : 1;
      const headR = ((f.model && f.model.b && f.model.b.headR) || 0.12) * s;
      // the head joint sits at the base of the skull: the face is a head-radius above it, the crown two
      const up = head.clone().sub(chest);
      if (up.lengthSq() < 1e-6) up.set(0, 1, 0);
      up.normalize();
      const face = head.clone().addScaledVector(up, headR * 0.9);
      const top = head.clone().addScaledVector(up, headR * 2.1);
      pts.push(head, chest, hips, top, f.pos.clone());
      const min = pts[0].clone(), max = pts[0].clone();
      for (const p of pts) {
        min.min(p);
        max.max(p);
      }
      const centre = min.clone().add(max).multiplyScalar(0.5);
      const size = Math.max(0.5, max.clone().sub(min).length());
      const tall = top.y - Math.min(min.y, f.pos.y);
      // lying down (on his back, face down, knocked out): the head is no higher than a knee
      const lying = tall < 0.55 * (f.height || 1.7) && Math.abs(up.y) < 0.6;
      // where the face is pointing (thrown back at the sky, bowed at the ground): the head joint's forward
      let faceDir = null;
      if (j && j.head) {
        faceDir = new V3(0, 0, 1).applyQuaternion(j.head.getWorldQuaternion(new THREE.Quaternion()));
        if (faceDir.lengthSq() < 1e-6) faceDir = null;
        else faceDir.normalize();
      }
      return { feet: f.pos.clone(), hips, chest, head, face, top, centre, min, max, size, tall, headR, up, scale: s, lying, faceDir };
    },

    /** A semantic shot: the lens placed from the subject's body this frame. Writes out.pos/look/fov. */
    frameShot(ctx, c, out) {
      const f = Cinema.actor(ctx, c.subject);
      if (!f) return false;
      const B = Cinema.body(f);
      const k = Math.max(0.5, B.headR / 0.12); // a big head (a giant, a child) scales the close framings
      const focus = c.focus || 'medium';
      const FOV = { face: 28, closeup: 32, upper: 36, medium: 40, full: 44, wide: 54 };
      const fov = c.fov || FOV[focus] || 40;
      let key, half;
      switch (focus) {
        case 'face':
          key = B.face.clone();
          half = 0.2 * k;
          break;
        case 'closeup':
          key = B.face.clone().lerp(B.head, 0.6);
          half = 0.32 * k;
          break;
        case 'upper':
          key = B.chest.clone().lerp(B.face, 0.6);
          half = 0.5 * k;
          break;
        case 'full':
          key = B.centre.clone();
          half = B.size * 0.55 + 0.25;
          break;
        case 'wide':
          key = B.centre.clone();
          half = B.size * 0.55 + (c.room || 5);
          break;
        default:
          key = B.chest.clone().lerp(B.face, 0.4);
          half = 0.8 * k;
      }
      if (c.aim) key.add(new V3(c.aim[0], c.aim[1], c.aim[2]));
      const tanV = Math.tan((fov * Math.PI) / 360);
      let dist = c.dist || half / tanV;
      // the subject's facing, flattened
      const fwd = f.forward ? f.forward.clone().setY(0) : new V3(0, 0, 1);
      if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1);
      fwd.normalize();
      const side = c.side === undefined ? 1 : c.side;
      const angle = c.angle || 'three';
      if (c.with) {
        const g = Cinema.actor(ctx, c.with);
        if (g) {
          const G = Cinema.body(g);
          const a = focus === 'full' ? B.centre : B.chest.clone().lerp(B.face, 0.5);
          const bb = focus === 'full' ? G.centre : G.chest.clone().lerp(G.face, 0.5);
          const mk = (sd) => Cinema.twoShot(a, bb, { fov, side: sd, height: c.height === undefined ? 0.15 : c.height, lookUp: 0, pad: c.pad === undefined ? 1.2 : c.pad, minDist: 2.5 });
          let ts;
          if (c.side === undefined) {
            // no side given: the one their faces are on (a two-shot of two backs shows nobody), the subject first
            const flat = (x) => {
              const v = x.forward ? x.forward.clone().setY(0) : new V3(0, 0, 1);
              return v.lengthSq() < 1e-6 ? v.set(0, 0, 1) : v.normalize();
            };
            const score = (t) => {
              const d = t.pos.clone().sub(t.look).setY(0).normalize();
              return d.dot(flat(f)) + 0.6 * d.dot(flat(g));
            };
            const t1 = mk(1), t2 = mk(-1);
            ts = score(t1) >= score(t2) ? t1 : t2;
          } else ts = mk(side);
          out.pos.copy(ts.pos);
          out.look.copy(ts.look);
          out.fov = fov;
          return true;
        }
      }
      if (angle === 'ots' && c.over) {
        const o = Cinema.actor(ctx, c.over);
        if (o) {
          const O = Cinema.body(o);
          // over a shoulder that is lying in the dirt: from above it, not from inside the ground
          const base = O.head.clone();
          if (O.head.y - O.feet.y < 0.6) base.y += 0.9 * O.scale;
          const dir = key.clone().sub(base).setY(0);
          if (dir.lengthSq() < 1e-6) dir.copy(fwd).negate();
          dir.normalize();
          const right = new V3(-dir.z, 0, dir.x);
          out.pos.copy(base).addScaledVector(dir, -1.05 * O.scale).addScaledVector(right, 0.55 * side * O.scale).add(new V3(0, 0.16 * O.scale, 0));
          out.look.copy(key);
          out.fov = c.fov || 36;
          return true;
        }
      }
      // a face on the ground: from above his chest, looking along the body at it, so it reads upright
      if (B.lying && ['face', 'closeup', 'upper', 'medium'].includes(focus) && angle !== 'ots') {
        const along = B.up.clone().setY(0);
        if (along.lengthSq() < 1e-6) along.copy(fwd);
        along.normalize();
        const side2 = new V3(-along.z, 0, along.x).multiplyScalar(0.25 * side);
        out.pos.copy(key).addScaledVector(along, -0.38 * dist).addScaledVector(side2, dist).add(new V3(0, 0.9 * dist, 0));
        out.look.copy(key);
        out.fov = fov;
        return true;
      }
      const yawOff = { front: 12, three: 34, side: 80, back: 180, low: 22, high: 26 }[angle];
      const a = ((yawOff === undefined ? 34 : yawOff) * side * Math.PI) / 180;
      const dir = new V3(fwd.x * Math.cos(a) - fwd.z * Math.sin(a), 0, fwd.x * Math.sin(a) + fwd.z * Math.cos(a));
      let lift = c.height !== undefined ? c.height : angle === 'low' ? -0.42 * dist : angle === 'high' ? 0.5 * dist : 0.06 * dist;
      // a LOW angle looks up from no lower than the hips: below them the frame opens on a crotch, not a face
      if (angle === 'low' && c.height === undefined) lift = Math.max(lift, B.hips.y + 0.05 * (B.size || 1) - key.y);
      // a close face shot rises or drops with the face: thrown back at the sky, the lens comes over the top of it
      if (B.faceDir && (focus === 'face' || focus === 'closeup') && c.height === undefined && angle !== 'low' && angle !== 'high' && angle !== 'back') {
        const py = U.clamp(B.faceDir.y, -0.6, 0.85);
        if (Math.abs(py) > 0.15) lift = py * dist * 1.1;
      }
      out.pos.copy(key).addScaledVector(dir, dist).add(new V3(0, lift, 0));
      out.look.copy(key);
      out.fov = fov;
      return true;
    },

    /**
     * A code-made shot (missions, not scenes) framed the same way: cast { name: fighter }, spec a semantic
     * cam ({ subject, focus, angle, ... }) or a function (t, elapsed) returning one (a shot that changes
     * subject as it goes). Seconds, opts as Mission.shot.
     */
    shotOn(m, cast, spec, seconds, opts = {}) {
      const ctx = { b: m.battle, m, cast: Object.assign({}, cast), actors: Object.assign({}, cast) };
      const states = new Map();
      m.shot(
        (t, out, el) => {
          const c = typeof spec === 'function' ? spec(t, el) : spec;
          if (!Cinema.frameShot(ctx, c, out)) return;
          if (!states.has(c)) states.set(c, {});
          const subj = Cinema.subjectOf(ctx, c, null);
          if (subj) Cinema.safe(ctx, out, subj, states.get(c));
        },
        seconds,
        opts
      );
    },

    /** Who a shot is about, and what of him matters (see FRAMING). */
    subjectOf(ctx, c, ev) {
      if (c.raw || c.safe === false) return null;
      if (c.subject) {
        const f = Cinema.actor(ctx, c.subject);
        const focus = c.focus || 'medium';
        return f ? { f, face: ['face', 'closeup', 'upper', 'medium'].includes(focus) || !!(ev && ev.say), skip: [Cinema.actor(ctx, c.with), Cinema.actor(ctx, c.over)].filter(Boolean) } : null;
      }
      const lookName = c.look && typeof c.look.at === 'string' ? c.look.at : null;
      const lookActor = lookName ? Cinema.actor(ctx, lookName) : null;
      let speaker = null;
      if (ev && ev.say && ev.say.who && ev.say.style !== 'voice') {
        speaker = Cinema.actor(ctx, ev.say.who);
        if (!speaker) for (const k of Object.keys(ctx.actors || {})) if (ctx.actors[k].def && ctx.actors[k].def.id === ev.say.who) speaker = ctx.actors[k];
      }
      // a look aimed well off the actor (a crane up from the boots, a shot past him at the sky) is deliberate:
      // the safety keeps him unblocked, but does not pull the aim back onto him
      const off = c.look && c.look.off;
      const aimFree = c.frame === false || !!(lookActor && off && Math.hypot(off[0] || 0, off[1] || 0, off[2] || 0) > 0.6) || /:feet$/.test(lookName || '');
      if (speaker && lookActor === speaker) return { f: speaker, face: true, aimFree };
      if (lookActor) return { f: lookActor, face: /:(head|face)$/.test(lookName) || !!speaker, aimFree };
      if (speaker) return { f: speaker, face: true, near: 3.5 };
      return null;
    },

    /**
     * Ground and rock between two points? (terrain heights and rock pillars, sampled) — and, when `subj` is given,
     * other people: a body (or a fist) between the lens and the subject, or the lens inside somebody, is in the way.
     */
    blocked(b, p, q, clearEnd = 0.6, subj) {
      const st = b.stage;
      const d = q.clone().sub(p);
      const len = d.length();
      if (len < 0.5) return false;
      const n = Math.min(24, Math.ceil(len / 1.2));
      for (let i = 1; i < n; i++) {
        const s = i / n;
        if (len * (1 - s) < clearEnd) break;
        const x = p.x + d.x * s, y = p.y + d.y * s, z = p.z + d.z * s;
        if (st.hasGround && st.heightAt(x, z) > y + 0.12) return true;
        for (const o of st.obstacles) {
          if (!o.alive || o.shape !== 'cyl' || y > o.top) continue;
          const dx = x - o.x, dz = z - o.z;
          if (dx * dx + dz * dz < o.r * o.r * 0.85) return true;
        }
        if (subj && Cinema.personAt(b, x, y, z, subj)) return true;
      }
      return !!(subj && Cinema.personAt(b, p.x, p.y, p.z, subj));
    },

    /** Is somebody (not the subject, not the people meant to be in his shot) standing at this point? */
    personAt(b, x, y, z, subj) {
      for (const o of b.fighters) {
        if (o === subj.f || o.hidden || !o.model || (subj.skip && subj.skip.includes(o))) continue;
        const s = o.model.root ? o.model.root.scale.y : 1;
        const r = 0.46 * s + 0.1; // the body and the arms it may be holding out
        const dx = x - o.pos.x, dz = z - o.pos.z;
        if (dx * dx + dz * dz > r * r) continue;
        if (y > o.pos.y - 0.1 && y < o.pos.y + 1.85 * s) return true;
      }
      return false;
    },

    /** Where a world point lands in a lens: { x, y } in -1..1 (and z, the depth). */
    project(pos, look, fov, aspect, p) {
      const fw = look.clone().sub(pos);
      if (fw.lengthSq() < 1e-9) fw.set(0, 0, 1);
      fw.normalize();
      let right = new V3().crossVectors(fw, new V3(0, 1, 0));
      if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
      right.normalize();
      const up = new V3().crossVectors(right, fw);
      const v = p.clone().sub(pos);
      const z = v.dot(fw);
      const tv = Math.tan((fov * Math.PI) / 360);
      return { x: v.dot(right) / (Math.max(0.05, z) * tv * aspect), y: v.dot(up) / (Math.max(0.05, z) * tv), z };
    },

    /** THE SAFETY PASS (see FRAMING): the lens out of the ground, out of rock, seeing the subject, the face in. */
    safe(ctx, out, subj, st) {
      const b = ctx.b, f = subj.f;
      if (!f || f.hidden) return;
      const stage = b.stage;
      const B = Cinema.body(f);
      // a speaker the camera only looks NEAR (a point beside him) counts only when he is that near
      if (subj.near && B.chest.distanceTo(out.look) > subj.near) return;
      // 1. out of the ground and out of rock
      if (stage.hasGround) {
        const gy = stage.heightAt(out.pos.x, out.pos.z);
        if (out.pos.y < gy + 0.35) out.pos.y = gy + 0.35;
      }
      if (stage.pushCameraOut) stage.pushCameraOut(out.look, out.pos);
      // 2. something between the lens and him: move the lens (up, then round him), keep the move for the shot
      const key = subj.face ? B.face : B.chest;
      // re-checked from the shot's own lens every quarter second: a moving shot that has come clear of
      // the rock drops the move; one still blocked gets a fresh one
      st.n = (st.n || 0) + 1;
      if (st.n === 1 || st.n % 15 === 0) st.fix = null;
      if (st.fix) out.pos.add(st.fix);
      else if ((st.n === 1 || st.n % 15 === 0) && Cinema.blocked(b, out.pos, key, 0.6, subj)) {
        const base = out.pos.clone();
        const rel = base.clone().sub(key);
        const dist = rel.length();
        const tries = [];
        for (const h of [1.2, 2.6, 4.5, 7]) tries.push(base.clone().add(new V3(0, h, 0)));
        // a face shot may swing round him, but never so far that it ends up behind his head
        const swings = subj.face ? [25, -25, 50, -50, 75, -75] : [25, -25, 50, -50, 80, -80, 120, -120];
        for (const deg of swings) {
          const a = (deg * Math.PI) / 180;
          const r = new V3(rel.x * Math.cos(a) - rel.z * Math.sin(a), rel.y, rel.x * Math.sin(a) + rel.z * Math.cos(a));
          tries.push(key.clone().add(r));
          tries.push(key.clone().add(r).add(new V3(0, 1.5, 0)));
        }
        let found = null;
        for (const p of tries) {
          if (stage.hasGround && p.y < stage.heightAt(p.x, p.z) + 0.35) continue;
          if (!Cinema.blocked(b, p, key, 0.6, subj)) {
            found = p;
            break;
          }
        }
        // nothing clear round him: come in along the line until nothing is in the way
        if (!found) {
          const u = rel.normalize();
          for (let dd = dist; dd > 0.8; dd *= 0.75) {
            const p = key.clone().addScaledVector(u, dd);
            if (stage.hasGround && p.y < stage.heightAt(p.x, p.z) + 0.35) p.y = stage.heightAt(p.x, p.z) + 0.35;
            found = p;
            if (!Cinema.blocked(b, p, key, 0.6, subj)) break;
          }
        }
        st.fix = found.clone().sub(base);
        out.pos.copy(found);
      }
      // 3. the subject in the frame: the face first when it matters; the aim slides only as far as needed
      if (subj.aimFree) return;
      const aspect = (b.camera && b.camera.camera && b.camera.camera.aspect) || 1.7;
      const fov = out.fov || 44;
      const inside = (p, mx, my) => {
        const q = Cinema.project(out.pos, out.look, fov, aspect, p);
        return q.z > 0.2 && Math.abs(q.x) <= mx && Math.abs(q.y) <= my;
      };
      const aimAt = (p, mx, my) => {
        if (inside(p, mx, my)) return true;
        const look0 = out.look.clone();
        // keep the look at the same distance from the lens, swing it toward p just enough
        const toward = p.clone().sub(out.pos).normalize().multiplyScalar(look0.distanceTo(out.pos));
        const target = out.pos.clone().add(toward);
        let lo = 0, hi = 1;
        for (let i = 0; i < 8; i++) {
          const mid = (lo + hi) / 2;
          out.look.copy(look0).lerp(target, mid);
          if (inside(p, mx, my)) hi = mid;
          else lo = mid;
        }
        out.look.copy(look0).lerp(target, hi);
        return inside(p, mx, my);
      };
      if (subj.face) {
        aimAt(B.face, 0.82, 0.72);
        // too close to fit the whole head: back off along the view
        for (let i = 0; i < 4 && !inside(B.top, 0.92, 0.94); i++) {
          const back = out.pos.clone().sub(out.look).normalize();
          out.pos.addScaledVector(back, 0.25 * Math.max(1, B.scale));
          aimAt(B.face, 0.82, 0.72);
        }
      } else {
        aimAt(B.chest, 0.8, 0.75);
        // a close body shot keeps the face in as well
        if (out.pos.distanceTo(B.chest) < 4.5 * Math.max(1, B.scale) && !inside(B.face, 0.88, 0.85)) {
          const look0 = out.look.clone();
          aimAt(B.face, 0.85, 0.8);
          if (!inside(B.chest, 0.95, 0.95)) out.look.copy(look0);
        }
      }
      if (stage.hasGround) {
        const gy = stage.heightAt(out.pos.x, out.pos.z);
        if (out.pos.y < gy + 0.35) out.pos.y = gy + 0.35;
      }
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

    /** The ground under a point: the terrain, or a platform the point is standing on (y given). */
    groundY(b, x, z, y) {
      const st = b.stage;
      if (!st.hasGround) return 0;
      // without a height, ground means the terrain — never the top of a rock or house the point overlaps
      if (y === undefined) return st.heightAt(x, z);
      return st.supportHeight ? st.supportHeight(x, z, y) : st.heightAt(x, z);
    },

    /** A point near p with nothing solid within r (rock pillars, houses): for staging a scene in the open. */
    clearSpot(b, p, r = 3) {
      const st = b.stage;
      const free = (x, z) => {
        for (const o of st.obstacles) {
          if (!o.alive) continue;
          if (Math.hypot(x - o.x, z - o.z) < (o.r || 1) + r) return false;
        }
        return true;
      };
      if (free(p.x, p.z)) return p.clone();
      for (let ring = 1; ring <= 12; ring++) {
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const x = p.x + Math.cos(a) * ring * 2.5, z = p.z + Math.sin(a) * ring * 2.5;
          if (free(x, z)) return new V3(x, p.y, z);
        }
      }
      return p.clone();
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
        if (b.stage.hasGround && to.y < gh + 1.5) to.y = gh + 1.5; // a blow in the air keeps it in the air
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
        // (a stage with no ground at all — space — has nothing to cut through)
        if ((b.stage.hasGround && q.y < gh) || mode === 'slide') q.y = gh;
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
