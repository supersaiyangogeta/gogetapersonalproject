/*
 * CHAPTER 6 — CELL SAGA: THE CELL GAMES, PART THREE (rebuilt 2026-10-01)
 * Mission "The Difference in Power" (canon, played as Super Saiyan 2 Gohan).
 *
 * The owner's brief, kill by kill — each Cell Junior Gohan finishes is EXECUTED on camera, in order:
 *   1  the speed blitz      a blur, an open-hand chop across the neck: the head comes off and bursts
 *   2  the vertical slice   one lunges from above: an upward kick cuts it in half at the middle
 *   3+4 the double strike   two at once from left and right: an elbow through one face, a fist through
 *                           the other chest
 *   5  the counter          (they fire everything they have; he walks through it) one snatched by the
 *                           ankle and slammed into the ground until it bursts
 *   6  the flash            a short-range ki flash, point-blank
 *   7  the execution        the last one screams and flies for its father; he is already above it, and
 *                           one strike turns it to dust before it reaches the ground
 * Between the kills it is played: they swarm him and their blows do NOTHING (storyNoSell — a power gap
 * you can feel), and whoever he beats down is the next one executed.
 *
 *   OPEN      (scene)       seven of them round him on the ring
 *   RAMPAGE * (play + six executions)
 *   CATCH     (scene)       Cell's full-power punch stopped in one hand an inch from his nose; the gut
 *                           punch; Cell's back bulges, his eyes go white, he folds and vomits Android 18;
 *                           the perfect form melts back into the semi-perfect one
 *   TOYED *   (play)        semi-perfect Cell, desperate: nothing he throws registers
 *   SWELL     (scene)       "If I lose, everybody loses": he begins to inflate
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const UP = new V3(0, 1, 0);
  const CK = SL.data.cellKit;

  const RAMP = { dealt: 2.2, juniorHp: 0.6, toyedTo: 0.32 };
  const ORDER = ['chop', 'slice', 'double', 'slam', 'flash', 'dust'];

  function setup(battle) {
    const b = battle;
    const S = CK.cast(b, { player: 'gohan' });
    CK.spectate(b, S, ['gohan', 'a16']);
    CK.gone(S.a16);
    CK.lieRock(b);
    CK.toForm(S.gohan, 'ssj2');
    S.gohan.lockedForms = {};
    S.gohan.setRage(true, 1);
    S.satan.setState('scripted', { pose: 'ms_hide', expression: 'shock' });
  }

  /** The friends the Juniors beat lie where they fell; Goku stands; everybody watches. */
  function restore(m) {
    const b = m.battle, S = b.story;
    CK.spectate(b, S, ['gohan', 'a16']);
    CK.crew(b);
    S.satan.setState('scripted', { pose: 'ms_hide', expression: 'shock' });
    for (const name of m.flags.down || ['piccolo', 'trunks', 'krillin', 'tien', 'yamcha']) {
      const f = S[name];
      if (f && !f._gone) CK.watch(f, CK.ground(b, CK.SPOTS[name]), 'knockdown', 'ko');
    }
  }

  const unhook = (m, h) => CK.removeHook(m, h);
  const hold = (m, s) => m.cine(s);

  /** A shot that holds until the next one (a function of t, out). */
  function shot(m, fn, seconds = 60) {
    m.shot(fn, seconds, { cut: true, blendIn: 0 });
  }
  const cam = (out, pos, look, fov) => {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  };

  /* ------------------------------------------------------------ the executions */
  const X = {};

  /** 1 — a blur, a chop across the neck, the head off. */
  X.chop = function* (m, gh, j) {
    const b = m.battle;
    const side = new V3(-j.forward.z, 0, j.forward.x);
    const at = j.pos.clone().addScaledVector(j.forward.clone().setY(0).normalize(), 0.95).addScaledVector(side, 0.2);
    SL.data.vegitoKit.vanishTo(b, gh, CK.ground(b, at), { face: j.pos });
    CK.faceTo(j, gh.pos);
    j.setState('scripted', { pose: 'cj_slashW', expression: 'shock' });
    gh.setState('scripted', { pose: 'chopW', expression: 'angry', aura: 0.1 });
    shot(m, (t, out) => {
      const c = j.chest(), d = gh.pos.clone().sub(j.pos).setY(0).normalize();
      const sd = new V3(-d.z, 0, d.x);
      cam(out, c.clone().addScaledVector(sd, 2.2).addScaledVector(d, 0.4).add(new V3(0, 0.3, 0)), c.clone().lerp(gh.chest(), 0.4), 38);
    });
    b.slowmo(0.3, 0.4);
    yield* hold(m, 0.35);
    gh.setState('scripted', { pose: 'chop', expression: 'angry', speed: 30, aura: 0.1 });
    b.sfx('swordSlash', gh, { pitch: 1.4 });
    yield* hold(m, 0.12);
    j.model.root.updateMatrixWorld(true);
    const neck = j.model.joints.head.getWorldPosition(new V3());
    const cut = CK.split(b, j, { joint: 'head', at: neck.clone().add(new V3(0, -0.02, 0)), normal: UP, centerA: neck.clone().add(new V3(0, j.model.b.headR, 0)), centerB: j.chest() });
    cut.a.vel.copy(gh.dirTo(j).setY(0).multiplyScalar(3).add(new V3(0, 7, 0)));
    cut.a.spin.set(9, 4, 2);
    b.vfx.sparks(neck, 0x6a9aff, 16, 6, 0.08);
    b.slowmo(0.25, 0.7);
    let t = 0, burst = false;
    const hook = () => {
      t += 1 / 60;
      CK.animatePieces(b, cut, { gravity: 14 });
      if (t > 0.5 && !burst) {
        burst = true;
        CK.burst(b, cut.a.pivot.position, 'junior', 1);
        cut.hide(cut.a);
        cut.b.frozen = false;
      }
      if (t > 1.1 && cut.b.alive) {
        CK.burst(b, cut.b.pivot.position, 'junior', 0.9);
        cut.hide(cut.b);
      }
    };
    cut.b.frozen = true;
    m.tickHooks.push(hook);
    shot(m, (tt, out) => {
      const c = neck;
      cam(out, c.clone().add(new V3(2.8, 0.6, 2.8)), c.clone().add(new V3(0, 0.6, 0)), 44);
    });
    yield* hold(m, 1.5);
    unhook(m, hook);
    cut.dispose();
  };

  /** 2 — from above; an upward kick; in two at the middle. */
  X.slice = function* (m, gh, j) {
    const b = m.battle;
    const fwd = gh.forward.clone().setY(0).normalize();
    const top = gh.pos.clone().addScaledVector(fwd, 1.1).add(new V3(0, 2.6, 0));
    j.setPosition(top);
    j.grounded = false;
    CK.faceTo(j, gh.pos);
    j.setState('scripted', { pose: 'cj_dive', expression: 'shout' });
    gh.setState('scripted', { pose: 'tg2_stance', expression: 'angry', aura: 0.1 });
    shot(m, (t, out) => {
      const c = gh.chest(), sd = new V3(-fwd.z, 0, fwd.x);
      cam(out, c.clone().addScaledVector(sd, 3).addScaledVector(fwd, 0.4).add(new V3(0, -0.4, 0)), c.clone().addScaledVector(fwd, 0.8).add(new V3(0, 1.2, 0)), 46);
    });
    b.sfx('saibaScreech', j, { pitch: 1.5 });
    let t = 0;
    const dive = () => {
      t += 1 / 60;
      const k = Math.min(1, t / 0.45);
      j.setPosition(top.clone().lerp(gh.chest().addScaledVector(fwd, 0.7).add(new V3(0, 0.6, 0)), k));
      j.prevPos.copy(j.pos);
    };
    m.tickHooks.push(dive);
    yield* hold(m, 0.4);
    unhook(m, dive);
    gh.setState('scripted', { pose: 'tg_kick', expression: 'shout', speed: 30, aura: 0.1 });
    b.sfx('swordSlash', gh, { pitch: 1.1 });
    b.slowmo(0.22, 0.8);
    const mid = j.chest().add(new V3(0, -0.05, 0));
    const cut = CK.split(b, j, { at: mid, normal: new V3(fwd.x * 0.3, 1, fwd.z * 0.3).normalize(), centerA: mid.clone().add(new V3(0, 0.3, 0)), centerB: mid.clone().add(new V3(0, -0.3, 0)) });
    const sd = new V3(-fwd.z, 0, fwd.x);
    cut.a.vel.copy(sd).multiplyScalar(4).add(new V3(0, 6, 0)).addScaledVector(fwd, 2);
    cut.b.vel.copy(sd).multiplyScalar(-4).add(new V3(0, 2, 0)).addScaledVector(fwd, 2);
    cut.a.spin.set(5, 0, 6);
    cut.b.spin.set(-4, 0, -5);
    b.vfx.ring(mid, 2.4, 0xfff3c0, 0.3, fwd);
    b.vfx.sparks(mid, 0x6a9aff, 20, 8, 0.1);
    let t2 = 0;
    const fall = () => {
      t2 += 1 / 60;
      CK.animatePieces(b, cut, { gravity: 16 });
      if (t2 > 0.9 && cut.a.alive) {
        for (const p of [cut.a, cut.b]) CK.burst(b, p.pivot.position, 'junior', 0.8);
        cut.hide(cut.a);
        cut.hide(cut.b);
      }
    };
    m.tickHooks.push(fall);
    yield* hold(m, 1.4);
    unhook(m, fall);
    cut.dispose();
  };

  /** 3 + 4 — two at once from left and right: an elbow through a face, a fist through a chest. */
  X.double = function* (m, gh, j, k) {
    const b = m.battle;
    const fwd = gh.forward.clone().setY(0).normalize();
    const right = new V3(fwd.z, 0, -fwd.x);
    const L = CK.ground(b, gh.pos.clone().addScaledVector(right, -1.25)), R = CK.ground(b, gh.pos.clone().addScaledVector(right, 1.25));
    const jl = j, jr = k;
    SL.data.vegitoKit.vanishTo(b, jl, L, { face: gh.pos });
    SL.data.vegitoKit.vanishTo(b, jr, R, { face: gh.pos });
    for (const x of [jl, jr]) x.setState('scripted', { pose: 'cj_slashW', expression: 'shout' });
    gh.setState('scripted', { pose: 'tg2_glance', expression: 'angry', aura: 0.1 });
    shot(m, (t, out) => {
      const c = gh.chest();
      cam(out, c.clone().addScaledVector(fwd, 3.4).add(new V3(0, 0.25, 0)), c.clone(), 46);
    });
    b.sfx('saibaScreech', jl, { pitch: 1.4 });
    yield* hold(m, 0.5);
    for (const x of [jl, jr]) x.setState('scripted', { pose: 'cj_slash', expression: 'shout', speed: 20 });
    yield* hold(m, 0.1);
    // he faces between them: the left elbow and the right fist go out at the same moment
    gh.setState('scripted', { pose: 'doubleStrike', expression: 'shout', speed: 30, aura: 0.1 });
    b.slowmo(0.2, 1);
    b.sfx('punchHeavy', gh, { pitch: 0.5, vol: 1.4 });
    const hl = SL.Cinema.actorPoint({ cast: { x: jl } }, 'x:head'), cr = jr.chest();
    b.vfx.ring(hl, 1.6, 0xfff3c0, 0.3, right);
    b.vfx.ring(cr, 1.6, 0xfff3c0, 0.3, right);
    b.vfx.sparks(hl, 0x6a9aff, 16, 8, 0.1);
    b.vfx.sparks(cr, 0x6a9aff, 16, 8, 0.1);
    b.cameraTraumaAt(gh.pos, 0.6);
    yield* hold(m, 0.8);
    CK.burst(b, hl, 'junior', 1);
    CK.burst(b, cr, 'junior', 1);
    for (const x of [jl, jr]) x.setHidden(true);
    yield* hold(m, 0.8);
  };

  /** 5 — they fire everything; he walks through it; one by the ankle, into the ground, until it bursts. */
  X.slam = function* (m, gh, j, others) {
    const b = m.battle;
    const fwd = gh.forward.clone().setY(0).normalize();
    // the survivors fire: the blasts break over him and he walks out of the smoke
    const shooters = others.filter((o) => !o._gone && o !== j).slice(0, 2);
    shooters.forEach((o, i) => {
      CK.faceTo(o, gh.pos);
      o.setState('scripted', { pose: 'cj_fire', expression: 'shout' });
    });
    CK.faceTo(j, gh.pos);
    j.setState('scripted', { pose: 'cj_fire', expression: 'shout' });
    shot(m, (t, out) => {
      const c = gh.chest(), sd = new V3(-fwd.z, 0, fwd.x);
      cam(out, c.clone().addScaledVector(fwd, 4.2).addScaledVector(sd, 1.2).add(new V3(0, 0.2, 0)), c.clone(), 44);
    });
    for (let i = 0; i < 5; i++) {
      const from = (shooters[i % Math.max(1, shooters.length)] || j).chest();
      for (let s = 0; s <= 8; s++) b.vfx.trail(from.clone().lerp(gh.chest(), s / 8), 0x8ab0ff, 0.3, 0.25);
      b.vfx.explosion(gh.chest(), 0.9, 0x6a8aff, { smoke: true });
      b.sfx('kiBlast', gh, { pitch: 0.9 + i * 0.05 });
      yield* hold(m, 0.22);
    }
    gh.setState('scripted', { pose: 'tg2_stance', expression: 'angry', aura: 0.1 });
    yield* hold(m, 0.6);
    // the walk out of the smoke, unhurt, to the one in front
    const start = gh.pos.clone(), to = CK.ground(b, j.pos.clone().addScaledVector(gh.dirTo(j).setY(0).normalize(), -0.9));
    gh.setState('scripted', { pose: 'run', expression: 'angry', speed: 4, aura: 0.1 });
    let t = 0;
    const walk = () => {
      t += 1 / 60;
      const k = Math.min(1, t / 1);
      gh.setPosition(start.clone().lerp(to, k));
      gh.prevPos.copy(gh.pos);
    };
    m.tickHooks.push(walk);
    yield* hold(m, 1);
    unhook(m, walk);
    // by the ankle, up over his head, and down — three times
    const over = gh.pos.clone().add(new V3(0, 2.6, 0)), down = CK.ground(b, gh.pos.clone().addScaledVector(gh.dirTo(j).setY(0).normalize(), 1.4));
    shot(m, (tt, out) => {
      const c = gh.chest(), sd = new V3(-fwd.z, 0, fwd.x);
      cam(out, c.clone().addScaledVector(sd, 3.6).add(new V3(0, 0.6, 0)), c.clone().add(new V3(0, 0.4, 0)), 48);
    });
    for (let i = 0; i < 3; i++) {
      gh.setState('scripted', { pose: 'slamUp', expression: 'angry', speed: 20, aura: 0.1 });
      j.setPosition(over);
      j.setState('scripted', { pose: 'tumble', expression: 'shout' });
      yield* hold(m, 0.28);
      gh.setState('scripted', { pose: 'slamDown', expression: 'shout', speed: 30, aura: 0.1 });
      j.setPosition(down);
      b.stage.crater(down, 1.4 + i * 0.5, 0.3 + i * 0.1, null);
      b.vfx.dust(down, 1.2, 10);
      b.sfx('groundImpact', j, { vol: 1.2, pitch: 0.8 });
      b.cameraTraumaAt(down, 0.5);
      yield* hold(m, 0.32);
    }
    CK.burst(b, j.chest(), 'junior', 0.8);
    j.setHidden(true);
    b.slowmo(0.3, 0.5);
    yield* hold(m, 0.9);
  };

  /** 6 — a point-blank ki flash. */
  X.flash = function* (m, gh, j) {
    const b = m.battle;
    const at = CK.ground(b, gh.pos.clone().addScaledVector(gh.forward.clone().setY(0).normalize(), 1.1));
    SL.data.vegitoKit.vanishTo(b, j, at, { face: gh.pos });
    j.setState('scripted', { pose: 'cj_scream', expression: 'shock' });
    gh.setState('scripted', { pose: 'palmFlash', expression: 'angry', speed: 20, aura: 0.1 });
    shot(m, (t, out) => {
      const c = gh.chest(), f = gh.forward.clone().setY(0).normalize(), sd = new V3(-f.z, 0, f.x);
      cam(out, c.clone().addScaledVector(sd, -1.8).addScaledVector(f, -0.8).add(new V3(0, 0.25, 0)), j.chest(), 40);
    });
    yield* hold(m, 0.6);
    b.vfx.flash(j.chest(), 1.4, 0xfff8e0, 0.2, SL.Toon.tex.glow);
    b.vfx.explosion(j.chest(), 1.2, 0xffe890, { smoke: true });
    b.sfx('kiBlastBig', gh, { vol: 1.3 });
    SL.ScreenFX.flash(0.15, '#fff4d8');
    CK.burst(b, j.chest(), 'junior', 1);
    j.setHidden(true);
    b.slowmo(0.3, 0.5);
    yield* hold(m, 1.1);
  };

  /** 7 — the last one runs for its father; he is above it; dust before it hits the ground. */
  X.dust = function* (m, gh, j) {
    const b = m.battle, c = b.story.cell;
    CK.faceTo(j, gh.pos);
    j.setState('scripted', { pose: 'cj_scream', expression: 'shock' });
    shot(m, (t, out) => {
      const h = SL.Cinema.actorPoint({ cast: { x: j } }, 'x:head');
      cam(out, h.clone().addScaledVector(j.forward.clone().setY(0).normalize(), 0.9).add(new V3(0.2, 0, 0)), h, 36);
    });
    b.sfx('saibaScreech', j, { pitch: 1.8, vol: 1.2 });
    yield* hold(m, 1);
    // it flies for Cell
    const from = j.pos.clone(), to = c.pos.clone().lerp(j.pos, 0.45).add(new V3(0, 5, 0));
    j.grounded = false;
    CK.faceTo(j, to);
    j.setState('scripted', { pose: 'cj_flee', expression: 'shock' });
    let t = 0;
    const flee = () => {
      t += 1 / 60;
      const k = Math.min(1, t / 1.2);
      j.setPosition(from.clone().lerp(to, k * (2 - k)));
      j.prevPos.copy(j.pos);
      if (b.frame % 3 === 0) b.vfx.trail(j.chest(), 0x6a9aff, 0.25, 0.25);
    };
    m.tickHooks.push(flee);
    shot(m, (tt, out) => cam(out, from.clone().add(new V3(3, 1.4, 4)), j.chest(), 50));
    yield* hold(m, 0.75);
    // he is already above it
    SL.data.vegitoKit.vanishTo(b, gh, j.pos.clone().add(new V3(0, 1.9, 0)), { face: j.pos.clone().add(new V3(0, 1.9, 0)).addScaledVector(j.forward, 1) });
    gh.grounded = false;
    gh.setState('scripted', { pose: 'tg_axeW', expression: 'angry', speed: 20, aura: 0.1 });
    unhook(m, flee);
    const pin = j.pos.clone();
    shot(m, (tt, out) => cam(out, pin.clone().add(new V3(4.2, 0.2, 4.2)), pin.clone().add(new V3(0, 0.9, 0)), 46));
    yield* hold(m, 0.35);
    gh.setState('scripted', { pose: 'tg_axe', expression: 'shout', speed: 30, aura: 0.1 });
    b.sfx('punchHeavy', gh, { pitch: 0.4, vol: 1.5 });
    b.slowmo(0.25, 0.8);
    // pulverised: a cloud of blue dust and fragments, falling apart before it reaches the ground
    CK.burst(b, j.chest(), 'dust', 1.4);
    const bits = SL.data.trunksKit.dice(b, j.chest(), [0x3a5ad0, 0x2a3a8a, 0x6a8ae8], { count: 34, height: 0.8, width: 0.6, seed: 7 });
    for (const p of bits.pieces) p.v.set(p.mesh.position.x * 8, -6 + p.mesh.position.y * 4, p.mesh.position.z * 8);
    j.setHidden(true);
    let t3 = 0;
    const settle = () => {
      t3 += 1 / 60;
      bits.tick(1 / 60);
      // the fragments shrink to nothing on the way down (no flash per piece: that whited the frame out)
      if (t3 > 0.5) for (const p of bits.pieces) p.mesh.scale.multiplyScalar(0.94);
    };
    m.tickHooks.push(settle);
    yield* hold(m, 1.6);
    unhook(m, settle);
    bits.dispose();
    CK.placeAir(gh, pin.clone().add(new V3(0, 1.4, 0)));
  };

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      restore(m);
      const b = m.battle, S = b.story, gh = S.gohan;
      const juniors = CK.ensureJuniors(m);
      CK.place(gh, CK.onRing(b, 0, 3), Math.PI);
      juniors.forEach((j, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.3;
        j.setHidden(false);
        CK.place(j, CK.onRing(b, Math.cos(a) * 6.5, 3 + Math.sin(a) * 6.5));
        CK.faceTo(j, gh.pos);
        j.setState('scripted', { pose: 'cj_crouch', expression: 'grin' });
      });
      CK.watch(S.cell, CK.onRing(b, 0, -13), 'cl_calm', 'smirk', gh.pos);
      yield* SL.Cinema.play(m, 'rp_open');
    },
  };

  /** Played between the executions: the swarm, and nothing they do lands. */
  P.rampage = {
    id: 'rampage',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      CK.prep(m);
      restore(m);
      b.rules.pressure = { melee: 2, ranged: 1, gap: 70, grace: 120 };
      CK.takeControl(b, gh);
      gh.lockedForms = {};
      CK.toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.85));
      gh.ki = gh.kiMax;
      gh.damageDealtMul = RAMP.dealt;
      const juniors = CK.ensureJuniors(m);
      // THE POWER GAP: their claws and their blasts land on him and do nothing at all
      m.powerGap(gh, { from: juniors, mul: 0, beams: true });
      CK.place(gh, CK.onRing(b, 0, 3), Math.PI);
      CK.watch(c, CK.onRing(b, 0, -13), 'cl_calm', 'shock', gh.pos);
      const live = () => juniors.filter((j) => !j._gone);
      for (const j of live()) {
        j.setHidden(false);
        j.untargetable = false;
        j.cannotDie = true; // never killed by the fight itself: the finish is an execution, on camera
        j.hp = Math.round(j.hpMax * RAMP.juniorHp);
        j.controller = new SL.AIController(b, { difficulty: 'hard' });
        j.target = gh;
        j.setState('free');
      }
      gh.target = live()[0] || null;
      const st = (S.rampage = S.rampage || { kills: 0, queue: [], log: [] });
      const offs = [
        b.on('damage', (e) => {
          const j = e.target;
          if (e.attacker !== gh || !juniors.includes(j) || j._gone || j._queued) return;
          if (j.hp <= Math.max(2, j.hpMax * 0.02)) {
            j._queued = true;
            st.queue.push(j);
          }
        }),
      ];
      const fight = () => {
        CK.goFight(m, ['finale', 6]);
        for (const j of live()) {
          j.controller = new SL.AIController(b, { difficulty: 'hard' });
          j.target = gh;
          if (j.state === 'scripted') j.setState('free');
        }
        gh.setState('free');
        gh.grounded = gh.pos.y - b.stage.heightAt(gh.pos.x, gh.pos.z) < 0.3;
      };
      fight();
      m.objective('seven', 'Seven of them', { icon: 'fist', target: 7 });
      m.progress('seven', st.kills);
      while (live().length) {
        yield () => st.queue.length > 0 || !live().length;
        if (!st.queue.length) break;
        const j = st.queue.shift();
        if (j._gone) continue;
        // everything stops for the execution
        m.lock(true);
        CK.clearCombat(b);
        for (const o of b.fighters) if (o !== gh) o.controller = CK.scripted();
        const kind = ORDER[Math.min(ORDER.length - 1, st.log.length)];
        const partner = kind === 'double' ? live().filter((o) => o !== j && !o._queued).sort((a, d) => a.distTo(gh) - d.distTo(gh))[0] : null;
        const kindNow = kind === 'double' && !partner ? 'flash' : kind;
        if (kindNow === 'double') yield* X.double(m, gh, j, partner);
        else if (kindNow === 'slam') yield* X.slam(m, gh, j, juniors);
        else yield* X[kindNow](m, gh, j);
        for (const x of kindNow === 'double' ? [j, partner] : [j]) {
          CK.gone(x);
          x.alive = false;
          st.kills++;
        }
        st.log.push(kindNow);
        m.progress('seven', st.kills);
        b.emit('juniorExecuted', { kind: kindNow, kills: st.kills });
        m.endShot();
        if (live().length) {
          // the next one hesitates: none of them want to be next
          for (const o of live()) o.freeze = 30;
          fight();
        }
      }
      offs.forEach((off) => off());
      b.rules.pressure = null;
      gh.storyNoSell = null;
      m.complete('seven');
      m.flags.executions = st.log.slice();
      m.lock(true);
      yield* SL.Cinema.play(m, 'rp_after');
    },
  };

  P.catch = {
    id: 'catch',
    run: function* (m) {
      CK.prep(m);
      for (const f of m.battle.fighters) if (f !== m.battle.player) f.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'rp_catch');
    },
  };

  /** Semi-perfect again, and falling apart: nothing he does registers. */
  P.toyed = {
    id: 'toyed',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      CK.prep(m);
      restore(m);
      for (const j of S.juniors || []) CK.gone(j);
      if (!S.a18._down) {
        CK.watch(S.a18, CK.onRing(b, -5, -9), 'knockdown', 'ko');
        S.a18._down = true;
      }
      CK.takeControl(b, gh);
      CK.toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.8));
      gh.damageDealtMul = 1.4;
      // a power gap you can feel: whatever he throws, the boy does not even move
      m.powerGap(gh, { from: [c], mul: 0.06 });
      CK.place(gh, CK.onRing(b, 0, 6), Math.PI);
      CK.toForm(c, 'semi_perfect');
      c.setHidden(false);
      c.untargetable = false;
      CK.place(c, CK.onRing(b, 0, -6), 0);
      c.hp = Math.min(c.hp > 0 ? c.hp : c.hpMax, Math.round(c.hpMax * 0.65));
      c.noRegen = true;
      c.infiniteHp = false;
      c.damageDealtMul = 0.6;
      CK.cellBrain(b, c, { aggression: 1, defense: 0.2, ranged: 0.5, beam: 0.5, preferredRange: 3, hooks: 'boss' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      CK.goFight(m, ['finale', 6]);
      m.objective('finish', 'He is falling apart', { icon: 'fist', target: 100 });
      const start = c.hp;
      let noSells = 0;
      const offN = b.on('noSell', (e) => {
        if (e.fighter !== gh) return;
        noSells++;
        if (noSells === 3) m.say('cell', 'Why— why won\'t you FALL?!', 2, { style: 'shout' });
      });
      const hook = () => {
        const need = start - c.hpMax * RAMP.toyedTo;
        m.progress('finish', Math.min(100, Math.floor(U.clamp01(need <= 0 ? 1 : (start - c.hp) / need) * 100)));
      };
      m.tickHooks.push(hook);
      yield () => c.hpFrac <= RAMP.toyedTo;
      CK.removeHook(m, hook);
      offN();
      gh.storyNoSell = null;
      m.complete('finish');
      m.flags.noSells = noSells;
      yield 0.4;
    },
  };

  P.swell = {
    id: 'swell',
    run: function* (m) {
      CK.prep(m);
      for (const f of m.battle.fighters) if (f !== m.battle.player) f.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'rp_swell');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'THE DIFFERENCE IN POWER', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'cell_rampage',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'The Difference in Power',
    subtitle: 'Earth · Age 767 · Super Saiyan 2',
    character: 'teen_gohan',
    stage: 'cellarena',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Seven of them, and none of them can touch him. Then their father tries.',
    rewards: ['Character: Gohan (age 11)'],
    setup,
    phases: [P.open, P.rampage, P.catch, P.toyed, P.swell],
  };
  SL.data.missions[def.id] = def;
  SL.data.cellRampage = { RAMP, ORDER, X };
})();
