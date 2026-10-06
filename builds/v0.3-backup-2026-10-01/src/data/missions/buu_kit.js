/*
 * BUU SAGA KIT — staging helpers shared by the Majin chapter's missions (Chapter 10), and
 * one generic cinematic: `SL.data.cinematics.ascend`, a transformation the player has to
 * push through by holding Charge (the first Super Saiyan 2 of Goku's life is an EVENT, not
 * a menu entry), after which the form's own staged sequence plays exactly like every other
 * transformation in the game (SL.data.cinematics.transform).
 *
 * Nothing here is Buu-specific engine code: it is the same mission API every chapter uses.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const K = (SL.data.buuKit = {
    camAt(out, pos, look, fov) {
      out.pos.copy(pos);
      out.look.copy(look);
      out.fov = fov;
    },
    ground(b, v, lift = 0) {
      const p = v.clone();
      p.y = b.stage.hasGround ? b.stage.heightAt(p.x, p.z) + lift : p.y + lift;
      return p;
    },
    place(f, pos, yaw) {
      f.setPosition(pos);
      if (yaw !== undefined) f.yaw = yaw;
      f.prevYaw = f.yaw;
      f.vel.set(0, 0, 0);
      f.fallVel = 0;
      f.grounded = true;
    },
    /** In the air at a height above the ground (no gravity while flying). */
    hover(b, f, pos, height) {
      const p = pos.clone();
      p.y = (b.stage.hasGround ? b.stage.heightAt(p.x, p.z) : 0) + height;
      f.setPosition(p);
      f.vel.set(0, 0, 0);
      f.fallVel = 0;
      f.grounded = false;
    },
    faceTo(f, pos) {
      f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
    },
    clearCombat(b) {
      if (b.clash.active) b.clash._abort();
      for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
      for (const bm of b.projectiles.beams) bm.dispose();
    },
    scripted: () => ({ update: () => SL.emptyIntent() }),
    formIndex(f, id) {
      return f.def.forms.findIndex((x) => x.id === id);
    },
    /** Put a fighter in a form without the event (checkpoints, restaging). */
    toForm(f, id) {
      const i = K.formIndex(f, id);
      if (i < 0) return;
      if (f.lockedForms) delete f.lockedForms[id];
      if (f.formIndex !== i) f.applyForm(i);
    },
    /** Remove a mission tick hook. */
    unhook(m, fn) {
      const i = m.tickHooks.indexOf(fn);
      if (i >= 0) m.tickHooks.splice(i, 1);
    },
    /** A statue: a fighter who is stone and out of the fight (Piccolo and Krillin after Dabura's spit). */
    statue(f) {
      f.controller = K.scripted();
      f.untargetable = true;
      f.intangible = true;
      f.setState('scripted', { pose: 'guard', expression: 'shock' });
      if (f.model.setStone) f.model.setStone(true);
    },
    /** A watcher: present, posed, and never part of the fight. */
    watcher(f, pose = 'idle', face = 'calm') {
      f.controller = K.scripted();
      f.untargetable = true;
      f.intangible = true;
      f.setState('scripted', { pose, expression: face });
    },
    /**
     * Babidi's teleport: the pink light takes the listed fighters, the world is swapped for
     * another stage (Battle.changeStage), and they arrive where `spots` says. One call, used by
     * every jump in the chapter, so each arrival looks like the same magic.
     */
    *teleport(m, stageId, spots, opts = {}) {
      const b = m.battle;
      for (const [f] of spots) {
        b.vfx.flash(f.chest(), 3, 0xff6ab4, 0.4, SL.Toon.tex.glow);
        b.vfx.ring(f.chest(), 3, 0xff6ab4, 0.4);
      }
      b.sfx('teleport', null, { pitch: 0.7 });
      SL.ScreenFX.flash(0.6, '#ffb0d8');
      m.fade('black', 0.35);
      yield* m.cine(0.4);
      K.clearCombat(b);
      b.changeStage(stageId);
      m.endShot();
      for (const [f, pos, yaw] of spots) {
        K.place(f, K.ground(b, pos), yaw);
        f.setState('scripted', { pose: 'idle', expression: f.expression || 'calm' });
      }
      if (opts.face) for (const [f, other] of opts.face) K.faceTo(f, other.pos);
      m.fade('clear', 0.5);
      for (const [f] of spots) {
        b.vfx.flash(f.chest(), 3, 0xff6ab4, 0.35, SL.Toon.tex.glow);
        b.vfx.ring(f.pos.clone().add(new V3(0, 0.1, 0)), 3.5, 0xff6ab4, 0.4, new V3(0, 1, 0));
      }
      b.emit('teleported', { stage: stageId });
    },
  });

  /**
   * THE BALL Buu was sealed in (Level 1 prop): a heavy riveted sphere with a band, a hatch-lid on
   * top, and seams that glow as the stolen energy fills it. `charge(k)` 0..1 brightens the seams
   * and makes it tremble; `crack()` splits the lid with light; `open()` blows the lid away and
   * leaves the empty shell. Owned by the mission (removed on dispose).
   */
  K.buuBall = function (b, pos, R = 4.2) {
    const T = SL.Toon;
    const g = new THREE.Group();
    const shellMat = T.makeMat(0xb8a27e, {});
    const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 20, 0, Math.PI * 2, Math.PI * 0.16, Math.PI * 0.84), shellMat);
    shell.material.side = THREE.DoubleSide;
    T.addOutline(shell, 2.2);
    g.add(shell);
    const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.01, R * 0.06, 8, 40), T.makeMat(0x6a5a44, {}));
    band.rotation.x = Math.PI / 2;
    g.add(band);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(R, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.17), T.makeMat(0x9a8866, {}));
    T.addOutline(lid, 2);
    g.add(lid);
    // the seams: bright lines round and over the shell that the stolen energy fills
    const seamMat = new THREE.MeshBasicMaterial({ color: 0xff6ab4, transparent: true, opacity: 0.15, depthWrite: false });
    const seams = [];
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(new THREE.TorusGeometry(R * 1.005, R * 0.018, 6, 48), seamMat);
      s.rotation.y = (i / 4) * Math.PI;
      g.add(s);
      seams.push(s);
    }
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xff6ab4, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    glow.scale.setScalar(R * 5);
    g.add(glow);
    const base = pos.clone();
    base.y = (b.stage.hasGround ? b.stage.heightAt(base.x, base.z) : base.y) + R * 0.72;
    g.position.copy(base);
    b.scene.add(g);
    const ball = { group: g, pos: base, R, level: 0, opened: false, lid };
    ball.charge = (k) => {
      ball.level = U.clamp01(k);
      seamMat.opacity = 0.15 + ball.level * 0.8;
      glow.material.opacity = ball.level * 0.55;
      const shake = ball.level > 0.6 ? (ball.level - 0.6) * 0.25 : 0;
      g.position.set(base.x + (shake ? Math.sin(b.frame * 1.7) * shake : 0), base.y, base.z + (shake ? Math.cos(b.frame * 2.3) * shake : 0));
    };
    ball.crack = () => {
      seamMat.color.set(0xffd0ec);
      glow.material.color.set(0xffd0ec);
      lid.position.y = R * 0.06;
      lid.rotation.z = 0.08;
    };
    ball.open = () => {
      // it bursts: the shell is gone in pieces, and whatever was inside is standing in the open
      ball.opened = true;
      g.visible = false;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        b.vfx.rock(base.clone().add(new V3(Math.cos(a) * R * 0.8, R * 0.3, Math.sin(a) * R * 0.8)), new V3(Math.cos(a) * 9, 10 + (i % 3) * 5, Math.sin(a) * 9), R * 0.22, i % 2 ? 0xb8a27e : 0x9a8866);
      }
    };
    ball.dispose = () => {
      b.scene.remove(g);
      shell.geometry.dispose();
      band.geometry.dispose();
      lid.geometry.dispose();
      for (const s of seams) s.geometry.dispose();
      seamMat.dispose();
      glow.material.dispose();
    };
    if (b.mission) b.mission.onDispose(ball.dispose);
    return ball;
  };

  /** Energy leaving a body for a point (the siphon into the ball): call every tick while it runs. */
  K.siphonTick = function (b, from, to, color = 0xff7ac8) {
    if (b.frame % 3 !== 0) return;
    const k = (b.frame % 45) / 45;
    b.vfx.trail(from.clone().lerp(to, k), color, 0.55, 0.35);
    b.vfx.trail(from.clone().lerp(to, (k + 0.5) % 1), color, 0.45, 0.3);
  };

  /**
   * ASCEND: the player pushes a transformation through by holding Charge.
   *   opts: fighter, form (id), witness, seconds (holding needed, default 4.5), label,
   *         beats: [{ at: 0..1, run(m, f) }] staged as the power rises, line, witnessLine,
   *         music (intensity for the reveal), onReady(m) (called at full, before the event),
   *         dust (false: rubble only, no ground dust — for paved stages)
   * Holding raises it, letting go lets it sink back (it never fails: the story is going to
   * happen, the player decides how long it takes). At full, the form's own sequence plays
   * through SL.data.cinematics.transform, and the form is taught (Mission.teach 'form:<id>').
   * Returns the seconds it took.
   */
  const C = (SL.data.cinematics = SL.data.cinematics || {});
  C.ascend = function* (m, opts) {
    const b = m.battle, f = opts.fighter;
    const idx = K.formIndex(f, opts.form);
    const need = opts.seconds || 4.5;
    // only Charge answers here; everything else waits
    const lim = Object.assign({}, SL.Mission.ALL_OFF);
    delete lim.charge;
    m.limits(lim);
    if (f.lockedForms) f.lockedForms[opts.form] = true; // the wheel must not jump the event
    b.inputLocked = false;
    b.aiLocked = true;
    if (b.player !== f) b.switchPlayer(f, { force: true });
    f.setState('free');
    let power = 0, t = 0;
    const beats = (opts.beats || []).slice().sort((a, c) => a.at - c.at);
    let next = 0;
    m.prompt('ascend_' + opts.form, 'charge', opts.label || 'Hold to go further', { required: true, until: () => power >= 1, always: true });
    const hook = () => {
      t += 1 / 60;
      const holding = !!(f.intent && f.intent.charge);
      power = U.clamp01(power + (holding ? 1 / (need * 60) : -0.35 / 60));
      if (holding && b.frame % 3 === 0) {
        b.vfx.streamInward(f.chest(), 2.5 + power * 3, (f.def.forms[idx].aura || {}).color || 0xffe25a, 2, 0.16, 0.4);
        b.camera.addTrauma(0.02 + power * 0.05);
      }
      if (power > 0.5 && b.frame % 5 === 0) b.vfx.bolt(f.chest().add(new V3(U.rand(-0.7, 0.7), U.rand(-0.9, 0.9), U.rand(-0.7, 0.7))), U.rand(0.6, 1.3));
      if (power > 0.3 && b.frame % 9 === 0 && b.stage.hasGround) {
        const p = f.pos.clone().add(new V3(U.rand(-4, 4), 0.1, U.rand(-4, 4)));
        b.vfx.rock(p, new V3(0, U.rand(2, 6) * power, 0), U.rand(0.1, 0.3), b.stage.rockColor);
      }
      while (next < beats.length && power >= beats[next].at) beats[next++].run(m, f);
      // the meter reads (1 - progress) as its fill
      b.emit('struggle', { active: true, progress: 1 - power, rate: 0, label: opts.meter || 'POWER' });
    };
    m.tickHooks.push(hook);
    // gameplay, not film: a cutscene skip never jumps it
    b.skipRequested = false;
    yield () => power >= 1;
    K.unhook(m, hook);
    b.emit('struggle', { active: false });
    while (next < beats.length) beats[next++].run(m, f); // skipped: land on the same state
    m.limits(null);
    if (opts.onReady) opts.onReady(m);
    if (f.lockedForms) delete f.lockedForms[opts.form];
    yield* C.transform(m, { fighter: f, formIndex: idx, witness: opts.witness, line: opts.line, witnessLine: opts.witnessLine, music: opts.music, dust: opts.dust });
    m.teach(f, 'form:' + opts.form);
    m.flags['ascended_' + opts.form] = Math.round(t * 10) / 10;
    return t;
  };
})();
