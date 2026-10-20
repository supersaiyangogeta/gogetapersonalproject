/*
 * UNIVERSE 6 ROUNDS KIT — staging shared by the five early tournament rounds (u6_botamo, u6_frost_goku,
 * u6_frost_piccolo, u6_frost_vegeta, u6_magetta). Built on the Cabba match's arena positions (SL.data.u6Cabba.SPOT),
 * SL.Tournament.match (ring-out / knockout, the announcer) and the buuKit staging helpers. Nothing here is a new
 * system: it spawns the same cast every round, puts two of them on the ring and hands the match to the tournament.
 *
 *   UK.setup(b, a, c)        spawn the whole cast (the benches, the gods, Jaco); a = the player's fighter id, c = the
 *                            opponent's; returns b.story (keys: the character ids)
 *   UK.ring(m, opts)         both fighters on the ring, facing, visible, targetable (opts.place: put them on their marks)
 *   UK.bout(m, opts)         one stretch of tournament rules: ring-out and KO are real. A rules loss for the player is a
 *                            mission failure (retry from the checkpoint); a `during` result with pause hands it back
 *   UK.staged(m)             { wait(s), cue(key, label, opts) } — skip-safe staging (a skip never presses a cue)
 *   UK.edgeDist(f)           metres from f to the nearest edge of the ring
 *   UK.ringOutTo(m, f, dir)  a body thrown out of the ring along dir (arc, landing, dust) — returns a generator
 *   UK.timeSkip(m, opts)     HIT'S TIME SKIP for one fight (u6_hit, u6_goku_hit): the evasion, the tell and the vital
 *                            strike, the read; opts.breakFree lets a press inside the stopped time counter it.
 *                            UK.tint / UK.stopWorld / UK.onRing are its helpers
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const BENCH = {
    goku: [20, 6.5], piccolo: [20.5, 10], vegeta: [19.5, 3],
    beerus: [31, -1.6], whis: [31.4, 1.8], champa: [-31, 1.6], vados: [-31.4, -1.8],
    cabba: [-19.5, 2.5], frost: [-19.5, -1], hit: [-20, -4.5], botamo: [-21, -8.5], magetta: [-21.5, -13],
    jaco: [17, -11],
  };
  const POSE = {
    goku: ['g_handsHips', 'grin'], piccolo: ['armsCrossed', 'serious'], vegeta: ['armsCrossed', 'serious'],
    beerus: ['bs_idle', 'calm'], whis: ['w_idle', 'calm'], champa: ['ch6_idle', 'smirk'], vados: ['w_idle', 'calm'],
    cabba: ['cb_idle', 'determined'], frost: ['fr_polite', 'calm'], hit: ['ht_pockets', 'cold'], botamo: ['bo_idle', 'calm'],
    magetta: ['mg_idle', 'cold'], jaco: ['idle', 'serious'],
  };
  const RING = { a: [0, 6], c: [0, -6] };
  const at = (b, p) => K.ground(b, new V3(p[0], 0, p[1]));

  /* ======================================================================== HIT'S TIME SKIP */
  // (u6_hit: Vegeta vs Hit; u6_goku_hit: Goku vs Hit) — every other fighter's `freeze` (the per-fighter hitstop: no
  // movement, no animation, no input) holds while Hit moves, and the picture turns a deep-purple negative (a canvas
  // filter, the way SL.ScreenFX.vision dims the picture). The evasion is the existing god-evasion (storyEvade mode
  // 'god', kind 'vanish' -> Fighter._vanishCounter); every blow he lands is a real Fighter.takeHit.
  const VIOLET = 0xb070ff;
  // defaults (a mission passes its own in opts.tu): seconds unless named frames; jab / vital are raw blow damage
  const SKIP_TU = {
    skipJab: 520, strikeEvery: 5.2, firstStrike: 2.6, tell: 1.0, readWindow: 0.45, vital: 4800,
    openFrames: 150, openMul: 2.6,
    // the frames of one skip: Hit reappears, swings, and time comes back (a longer skip: a later resume)
    appear: 5, swing: 11, resume: 14,
    // breakFree (u6_goku_hit, Kaioken): a press inside the stopped time breaks it; the counter's raw damage
    breakFrom: 3, counter: 1600,
  };

  /** The picture while time is stopped: a deep-purple negative (0 = normal). */
  function tint(k) {
    const c = SL.Render && SL.Render.canvas;
    if (!c) return;
    c.style.filter = k > 0.01
      ? 'invert(' + (0.88 * k).toFixed(3) + ') hue-rotate(' + Math.round(200 * k) + 'deg) saturate(' + (1 + 0.6 * k).toFixed(2) + ') contrast(' + (1 + 0.15 * k).toFixed(2) + ')'
      : '';
  }

  /** Everyone but Hit stops (frames), or starts again (0). */
  function stopWorld(S, frames) {
    for (const f of Object.values(S)) {
      if (f === S.hit) continue;
      f.freeze = frames ? Math.max(f.freeze, frames) : 0;
    }
  }

  /** A point on the ring, kept a metre inside the edge. */
  function onRing(b, p) {
    const A = b.stage.arena, lim = A ? A.half - 1 : 99;
    return K.ground(b, new V3(U.clamp(p.x, -lim, lim), 0, U.clamp(p.z, -lim, lim)));
  }

  /**
   * Hit's skip for one fight. opts: { gap (frames between evasions), strike (his own vital strikes on a timer) }.
   * Returns { off(), st } — off() restores everything (the evasion, the frozen world, the picture, his damage).
   */
  function timeSkip(m, opts) {
    const b = m.battle, S = b.story, v = S[b.u6.a], h = S.hit;
    const TU = Object.assign({}, SKIP_TU, opts.tu || {});
    const L = opts.lines || {};
    const st = {
      phase: null, f0: 0, t: 0, next: TU.firstStrike, tintK: 0, dodgeAt: -999, dodgeFrom: null,
      evadeAt: -1, ready: true, strikes: 0, reads: 0, evades: 0, openUntil: 0,
      baseTaken: h.damageTakenMul, said: {}, strike: !!opts.strike,
    };
    b.u6Hit = st; // bots read the tell (tools/mission_brains.js)
    // his own Time-Skip technique stays out of a fight that runs this skip, unless the phase asks for both
    const prevLock = h.lockedSlots;
    if (!opts.allowSpecial) h.lockedSlots = Object.assign({}, prevLock, { special1: true });
    const se = (h.storyEvade = {
      mode: 'god', gap: opts.gap, from: [v],
      // the evasion: he is behind you (Fighter._vanishCounter) — and the world stops while he gets there
      pick: () => {
        st.evadeAt = b.frame;
        st.evades++;
        stopWorld(S, 60);
        st.tintK = 1;
        SL.ScreenFX.flash(0.18, '#3a0a6a');
        b.sfx('timeWarp', h, { vol: 0.8, pitch: 1.3 });
        return 'vanish';
      },
    });
    // a line the mission supplies for a beat (L[key] = [who, line, seconds, opts]), said once
    const line = (key) => {
      const l = L[key];
      if (!l || st.said[key]) return;
      st.said[key] = true;
      m.say(l[0], l[1], l[2] || 2.4, l[3]);
    };
    const head = () => (h.headPos ? h.headPos() : h.chest());
    const eyes = (size, life) => b.vfx.flash(head().addScaledVector(h.forward, 0.14), size, VIOLET, life, SL.Toon.tex.glow);
    const blow = (dmg, knock, pose) => {
      const p = v.chest();
      v.takeHit(h, {
        type: 'melee', damage: dmg, knock, knockSpeed: knock === 'crumple' ? 0 : 6, hitstun: knock === 'crumple' ? 50 : 22,
        impact: knock === 'crumple' ? 3 : 2, dir: h.dirTo(v), point: p, pose, sfx: knock === 'crumple' ? 'punchHeavy' : 'punchLight', name: 'Time Skip',
      });
      b.vfx.ring(p.clone(), knock === 'crumple' ? 2.2 : 1.2, VIOLET, 0.3);
    };

    const A = b.stage.arena, lim = A ? A.half - 0.8 : 99;
    const hook = () => {
      if (b.inputLocked) return;
      // he never leaves the ring (his ring-out is not the story's): the edge stops him like a wall
      if (Math.abs(h.pos.x) > lim || Math.abs(h.pos.z) > lim) {
        h.setPosition(new V3(U.clamp(h.pos.x, -lim, lim), Math.max(h.pos.y, A ? A.y : h.pos.y), U.clamp(h.pos.z, -lim, lim)));
        h.vel.x = h.vel.z = 0;
      }
      // the picture comes back fast once time moves
      if (st.tintK > 0 && (!st.phase || st.phase === 'read') && st.evadeAt < 0) st.tintK = Math.max(0, st.tintK - 0.12);
      tint(st.tintK);

      // EVASION: he reappeared behind Vegeta (Fighter.vanish puts him there on its frame 5); the jab lands as time
      // starts again, and he holds it a moment so it reads
      if (st.evadeAt >= 0) {
        const e = b.frame - st.evadeAt;
        if (e === TU.appear + 2) {
          // the vanish lands him behind Vegeta wherever that is; he never leaves the ring to do it
          K.place(h, onRing(b, h.pos), h.yaw);
          h.grounded = true;
          K.faceTo(h, v.pos);
          h.setState('scripted', { pose: 'ht_jabW', expression: 'cold', speed: 40 });
        }
        if (e === 10) {
          stopWorld(S, 0);
          st.tintK = 0;
          h.setState('scripted', { pose: 'ht_jab', expression: 'cold', speed: 60 });
          if (h.pos.distanceTo(v.pos) < 2.6 && v.alive) blow(TU.skipJab, 'push', 'hitBack');
          // the evasion's lines are fight 1's (in fight 2 the tell owns them)
          if (!st.strike && st.evades === 1) line('evade1');
          else if (!st.strike && st.evades === 3) line('evade3');
        }
        if (e >= 24) {
          st.evadeAt = -1;
          if (h.state === 'scripted') h.setState('free');
        }
        return;
      }
      if (st.phase && st.phase !== 'broke') h.invuln = 2; // mid-skip (and in the tell): nothing touches him

      // READY: the glint in his eyes; the ring at his feet the moment it comes back
      const ready = b.frame - (se.last || -9999) > se.gap && !st.phase;
      if (ready && !st.ready) {
        b.vfx.ring(h.pos.clone().add(new V3(0, 0.08, 0)), 2.2, VIOLET, 0.5, new V3(0, 1, 0));
        b.sfx('kiUp', h, { pitch: 1.7, vol: 0.35 });
      }
      st.ready = ready;
      if (ready && b.frame % 45 === 0) eyes(0.35, 0.18);
      // a blow that lands while it recharges: it isn't free (said once)
      if (!ready && h.state === 'hitstun' && !st.said.landed) line('landed');

      // the OPEN window after a read
      if (st.openUntil && b.frame >= st.openUntil) {
        st.openUntil = 0;
        h.damageTakenMul = st.baseTaken;
      }

      // Vegeta's dodge: when, and from where (the read)
      if (v.state === 'dodge' && v.stateFrame <= 1) {
        st.dodgeAt = b.frame;
        st.dodgeFrom = v.pos.clone();
      }

      if (!st.strike) return;
      // VITAL STRIKES on his own timing
      if (!st.phase) {
        if (st.openUntil || !v.alive) return;
        st.t += 1 / 60;
        // he waits for a calm moment — and with opts.insist, not for ever: a second late, he breaks off his own swing
        const calm = ['free', 'guard', 'recover', 'dash'].includes(h.state) || (opts.insist && h.state === 'attack' && st.t >= st.next + 1);
        if (st.t < st.next || !calm || h.pos.distanceTo(v.pos) > 9) return;
        // THE TELL
        st.phase = 'tell';
        st.f0 = b.frame;
        h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 12 });
        h.vel.set(0, 0, 0);
        b.sfx('heartbeat', h, { vol: 0.9 });
        b.emit('telegraph', { pos: v.pos.clone(), radius: 1.6, frames: TU.tell * 60 });
        if (!st.strikes) line('tell1');
        return;
      }
      const e = b.frame - st.f0;
      if (st.phase === 'tell') {
        K.faceTo(h, v.pos);
        if (e % 4 === 0) eyes(0.5 + e / (TU.tell * 60), 0.12);
        if (e % 12 === 0) {
          const k = e / (TU.tell * 60);
          b.vfx.ring(v.pos.clone().add(new V3(0, 0.08, 0)), 3.2 - k * 2.2, VIOLET, 0.22, new V3(0, 1, 0));
        }
        if (e === Math.round(TU.tell * 30)) b.sfx('heartbeat', h, { vol: 1, pitch: 1.2 });
        if (e < TU.tell * 60) return;
        const read = (v.state === 'vanish' || b.frame - st.dodgeAt <= TU.readWindow * 60) && st.dodgeFrom;
        st.phase = read ? 'read' : 'skip';
        st.f0 = b.frame;
        b.sfx('timeWarp', h, { vol: 1 });
        b.vfx.afterimage(h.pos, h.height, VIOLET);
        h.setHidden(true);
        if (read) {
          st.tintK = 0.55;
        } else {
          stopWorld(S, 999);
          st.tintK = 1;
          SL.ScreenFX.flash(0.22, '#3a0a6a');
        }
        return;
      }
      if (st.phase === 'skip') {
        // BREAKING THE STOPPED TIME (opts.breakFree: Goku in Kaioken): a press while Hit stands at his back and the red
        // tears through the violet — he moves inside Hit's time, and Hit eats the counter instead
        if (opts.breakFree && e >= TU.breakFrom && e > TU.appear && e < TU.resume && v.alive && v.intent && (v.intent.heavy || v.intent.light)) {
          stopWorld(S, 0);
          st.tintK = 0;
          st.breaks = (st.breaks || 0) + 1;
          st.phase = 'broke';
          st.f0 = b.frame;
          h.invuln = 0;
          K.faceTo(v, h.pos);
          v.setState('scripted', { pose: opts.breakFree.pose || 'punchR', expression: 'shout', speed: 50, aura: 1 });
          h.setState('free');
          h.takeHit(v, {
            type: 'melee', damage: TU.counter, knock: 'heavy', knockSpeed: 18, hitstun: 36, impact: 3, dir: v.dirTo(h),
            point: h.chest(), pose: 'hitHeavy', sfx: 'punchHeavy', name: opts.breakFree.name || 'Counter',
          });
          const c = h.chest();
          b.vfx.impact(c, 3, opts.breakFree.color || 0xff4a3a);
          b.vfx.ring(c, 3, opts.breakFree.color || 0xff4a3a, 0.35);
          SL.ScreenFX.flash(0.25, '#ff5a40');
          b.sfx('kaiokenBoom', v, { vol: 1.1 });
          b.cameraTraumaAt(c, 0.6);
          b.slowmo(0.3, 0.3);
          line(st.breaks === 1 ? 'break1' : 'break2');
          return;
        }
        if (e === TU.appear) {
          // point-blank at his back, off one shoulder: "at another angle"
          const back = v.forward.clone().setY(0).normalize().negate();
          const side = new V3(-back.z, 0, back.x).multiplyScalar(st.strikes % 2 ? 1 : -1);
          K.place(h, onRing(b, v.pos.clone().addScaledVector(back.multiplyScalar(0.8).add(side.multiplyScalar(0.6)).normalize(), 1.05)), h.yaw);
          K.faceTo(h, v.pos);
          h.setHidden(false);
          h.setState('scripted', { pose: 'ht_vitalW', expression: 'cold', speed: 40 });
          b.vfx.afterimage(h.pos, h.height, VIOLET);
        }
        if (e === TU.swing) h.setState('scripted', { pose: 'ht_vital', expression: 'cold', speed: 50 });
        if (e === TU.resume) {
          stopWorld(S, 0);
          st.tintK = 0;
          st.strikes++;
          if (v.alive) {
            blow(TU.vital, 'crumple', 'hitBody');
            b.vfx.impact(v.chest(), 3, 0xe8d8ff);
            b.cameraTraumaAt(v.chest(), 0.6);
            b.slowmo(0.35, 0.3);
            b.sfx('punchHeavy', v, { pitch: 0.7, vol: 1.3 });
          }
          if (st.strikes === 1) line('strike1');
        }
        // he does not follow it up: back into the pockets while Vegeta folds
        if (e === TU.resume + 16) h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 8 });
        if (e >= TU.resume + 48) {
          h.setState('free');
          st.phase = null;
          st.t = 0;
          st.next = TU.strikeEvery * U.rand(0.85, 1.15);
        }
        return;
      }
      if (st.phase === 'broke') {
        if (e === 14 && v.state === 'scripted') v.setState('free');
        if (e >= 40) {
          st.phase = null;
          st.t = 0;
          st.next = TU.strikeEvery * U.rand(0.9, 1.15);
        }
        return;
      }
      if (st.phase === 'read') {
        if (e === TU.appear) {
          // he arrives where Vegeta was: the afterimage takes the strike
          const at = st.dodgeFrom.clone();
          b.vfx.afterimage(at, v.height, 0x8ad8ff);
          const back = v.forward.clone().setY(0).normalize().negate();
          K.place(h, onRing(b, at.clone().addScaledVector(back, 1.05)), h.yaw);
          h.yaw = h.prevYaw = Math.atan2(at.x - h.pos.x, at.z - h.pos.z);
          h.setHidden(false);
          h.setState('scripted', { pose: 'ht_vital', expression: 'shock', speed: 50 });
          b.sfx('swing', h, { pitch: 0.8 });
        }
        if (e === TU.appear + 8) {
          // Vegeta is behind HIM now
          b.vfx.afterimage(v.pos, v.height, 0x8ad8ff);
          K.place(v, onRing(b, h.pos.clone().addScaledVector(h.forward, -1.5)), v.yaw);
          K.faceTo(v, h.pos);
          v.setState('free');
          b.vfx.afterimage(v.pos, v.height, 0x8ad8ff);
          b.sfx('vanish', v);
          // OPEN: staggered, his guard down, no skip until it passes
          h.setState('free');
          h._stagger(Math.round(TU.openFrames * 0.45));
          h.damageTakenMul = st.baseTaken * TU.openMul;
          st.openUntil = b.frame + TU.openFrames;
          se.last = b.frame + TU.openFrames;
          b.vfx.ring(h.chest(), 2.4, 0xffe27a, 0.4);
          SL.ScreenFX.flash(0.15, '#fff2c0');
          st.reads++;
          if (st.reads === 1) line('read1');
          else if (st.reads === 2) line('read2');
          st.phase = null;
          st.t = 0;
          st.next = TU.strikeEvery * U.rand(0.95, 1.2);
        }
      }
    };
    m.tickHooks.push(hook);
    let done = false;
    const off = () => {
      if (done) return;
      done = true;
      K.unhook(m, hook);
      stopWorld(S, 0);
      tint(0);
      h.storyEvade = null;
      h.invuln = 0;
      h.setHidden(false);
      h.damageTakenMul = st.baseTaken;
      h.lockedSlots = prevLock;
      if (b.u6Hit === st) b.u6Hit = null;
    };
    m.onDispose(off);
    return { off, st };
  }

  const UK = (SL.data.u6Kit = {
    BENCH, RING, at, VIOLET, SKIP_TU, tint, stopWorld, onRing, timeSkip,
    setup(b, a, c) {
      const S = {};
      for (const id of Object.keys(BENCH)) {
        const team = ['champa', 'vados', 'cabba', 'frost', 'hit', 'botamo', 'magetta'].includes(id) ? 1 : 0;
        S[id] = b.spawn({ charId: id, team, player: id === a, pos: at(b, BENCH[id]), startKi: id === a || id === c ? 60 : 0 });
      }
      S[a]._playerController = S[a].controller;
      for (const id of Object.keys(S)) {
        K.watcher(S[id], POSE[id][0], POSE[id][1]);
        K.faceTo(S[id], new V3(0, 0, 0));
        S[id].cannotDie = true;
      }
      b.story = S;
      b.u6 = { a, c };
      return S;
    },
    /** The bench back where it belongs (everybody but the two on the ring). */
    bench(m) {
      const b = m.battle, S = b.story, { a, c } = b.u6;
      for (const id of Object.keys(BENCH)) {
        if (id === a || id === c || S[id].ringedOut) continue;
        S[id].setHidden(false);
        K.place(S[id], at(b, BENCH[id]), 0);
        K.watcher(S[id], POSE[id][0], POSE[id][1]);
        K.faceTo(S[id], new V3(0, 0, 0));
      }
    },
    ring(m, opts = {}) {
      const b = m.battle, S = b.story, A = S[b.u6.a], C = S[b.u6.c];
      UK.bench(m);
      for (const f of [A, C]) {
        f.setHidden(false);
        f.untargetable = f.intangible = false;
        f.ringedOut = false;
      }
      if (opts.place) {
        K.place(A, at(b, RING.a), Math.PI);
        K.place(C, at(b, RING.c), 0);
      }
      K.faceTo(A, C.pos);
      K.faceTo(C, A.pos);
      return { A, C };
    },
    /** The player drives the round's own fighter. */
    control(m) {
      const b = m.battle, f = b.story[b.u6.a];
      b.setParty([f], {});
      f.controller = f._playerController || (f._playerController = new SL.PlayerController(b));
      b.switchPlayer(f, { force: true, quiet: true });
      return f;
    },
    *bout(m, opts = {}) {
      const b = m.battle, S = b.story, A = S[b.u6.a], C = S[b.u6.c];
      UK.control(m);
      A.cannotDie = true;
      C.cannotDie = true;
      const ai = Object.assign({}, C.def.ai, (C.form && C.form.ai) || {}, opts.ai || {});
      const r = yield* SL.Tournament.match(m, {
        a: A, b: C, player: A, intro: false, begin: opts.begin !== false, fresh: false, keepPlaces: !!opts.keepPlaces,
        ringOut: opts.ringOut || [A], ai, difficulty: SL.Settings.data.gameplay.difficulty,
        during: opts.during,
      });
      if (r.pause) return r;
      if (r.loser === A) m.fail(r.how === 'ringout' ? 'ringout' : 'defeated');
      return r;
    },
    staged(m) {
      const b = m.battle, skip = { on: false };
      return {
        skip,
        *wait(s) {
          if (skip.on) return;
          yield* m.cine(s);
          if (b.skipRequested) skip.on = true;
        },
        // a skipped scene never presses a cue: the cue always waits for the button (or its auto seconds)
        *cue(key, label, opts) {
          b.skipRequested = false;
          const r = yield* m.cue(key, label, opts || {});
          if (!r.pressed) b.skipRequested = false;
          return r;
        },
      };
    },
    edgeDist(f) {
      const A = f.battle.stage.arena;
      return A ? A.half - Math.max(Math.abs(f.pos.x), Math.abs(f.pos.z)) : 99;
    },
    /** f flies out of the ring along dir and lands on the ground beyond the edge. */
    *ringOutTo(m, f, dir, opts = {}) {
      const b = m.battle, A = b.stage.arena;
      const d = dir.clone().setY(0).normalize();
      const from = f.pos.clone();
      // far enough along d to be well past the edge
      let k = 0;
      const p = from.clone();
      while (Math.max(Math.abs(p.x), Math.abs(p.z)) < A.half + 3.5 && k < 60) {
        p.addScaledVector(d, 1);
        k++;
      }
      p.y = b.stage.heightAt(p.x, p.z);
      f.setState('scripted', { pose: opts.pose || 'tumble', expression: 'hurt', speed: 14 });
      const t0 = performance.now(), ms = opts.ms || 900, h = opts.height === undefined ? 3 : opts.height;
      yield () => {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const q = from.clone().lerp(p, t);
        q.y = U.lerp(from.y, p.y, t) + Math.sin(t * Math.PI) * h;
        f.setPosition(q);
        f.vel.set(0, 0, 0);
        return t >= 1;
      };
      f.setPosition(p);
      f.grounded = true;
      f.ringedOut = true;
      f.setState('scripted', { pose: opts.land || 'knockdown', expression: 'hurt' });
      b.vfx.dust(p.clone(), 1.4, 10);
      b.cameraTraumaAt(p, 0.5);
      b.sfx('groundImpact', f, { vol: 0.9 });
    },
    /** A closing title naming the next mission (never a hard-coded "(in development)" line). */
    *close(m, chapter, title) {
      m.fade('black', 1.1);
      yield* m.cine(1.3);
      m.title(chapter, title, m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  });
})();
