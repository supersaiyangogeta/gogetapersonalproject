/*
 * FUSION REBORN KIT — shared staging for the movie's missions (src/data/story.js `movies`). Built on the
 * Buu Saga kit (SL.data.buuKit: ground, place, faceTo, watcher, scripted...) and the engine's own pieces:
 * nothing here is a parallel engine.
 *
 *   FR.at(b, x, z) / FR.lm(b, name)     a point on the ground / a stage landmark (stage_otherworld.js)
 *   FR.halo(b, f)                       the dead wear halos (Goku, Vegeta, Pikkon, the escaped villains)
 *   FR.ramp(b, seconds, set)            a value 0..1 run over simulation time in the background
 *   FR.warp / FR.barrier                the Other World's warp and the crystal barrier, eased
 *   FR.clock(m, opts)                   THE STORY CLOCK: a ring on the HUD that empties over `seconds` of
 *                                       play while showing a longer story time (Veku's thirty minutes)
 *   FR.armour(m, opts)                  THE DICTATOR'S TANKS: real combat objects — they drive, turn their
 *                                       turrets, telegraph and fire shells you can dodge, can be knocked
 *                                       sliding by a heavy blow and pile into each other, smoke and burn
 *   FR.distantFight(m, at)              a fight happening somewhere else: flashes, rumbles, far booms
 *   FR.skyRift(b, at, radius)           a hole in the sky over Earth (the barrier between worlds gone)
 *   FR.wound(b, f, joint, opts)         a bleeding wound on a joint (Vegeta's shoulder): a dark red patch
 *                                       and drops falling from it; { remove() }
 *   FR.needles(b, from, to, opts)       Super Janemba's slashes raining dimensional glass needles on a spot
 *   FR.chip(b, f, i, opts)              a chip knocked out of the armour: a crack left on the plate and the
 *                                       moment of it (falling fragments, a ring, a crack of sound)
 * Film poses (SL.data.poses): g_drag (dragging someone by the arm), v_kneelShoulder (down on one knee,
 * clutching the right shoulder), g3_scream (Super Saiyan 3: elbows back to the ribs, head to the sky),
 * pk_pushUp (face down, pushing up on shaking arms).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const FR = (SL.data.frKit = {
    CHAPTER: 'MOVIE · FUSION REBORN',
    // Goku in this film: base, Super Saiyan, Super Saiyan 3 — no Kaio-ken, no god forms. The second level only
    // where the owner's beat sheet puts it (Super Janemba outclasses an SSJ2 Goku: fr_vegeta overrides this)
    LOCKS: { goku: ['kaioken', 'ssj2', 'god', 'godki'], vegeta: ['majin'], frieza: ['full'], adult_gohan: ['ultimate'] },
    at(b, x, z, lift = 0) {
      return K.ground(b, new V3(x, 0, z), lift);
    },
    lm(b, name) {
      const l = b.stage.landmarks && b.stage.landmarks[name];
      return l ? l.clone() : new V3();
    },
    halo(b, f) {
      if (f && !f.halo) f.halo = SL.Cinema.halo(b, f);
      return f && f.halo;
    },
    /** A bleeding wound on a joint: a dark red patch on it, and drops falling now and then. */
    wound(b, f, joint = 'shoulderR', opts = {}) {
      const j = f.model && f.model.joints && f.model.joints[joint];
      if (!j) return { remove() {} };
      const patch = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), SL.Toon.mat(opts.color || 0x8a0c14));
      patch.scale.set(0.05, 0.035, 0.03);
      patch.position.set(0, -0.04, 0.045);
      j.add(patch);
      let alive = true, n = 0;
      b.onTick(() => {
        if (!alive || b.disposed) return false;
        n++;
        if (n % 26 === 0 && !f.hidden && b.vfx.specks) {
          const p = patch.getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
          b.vfx.specks.emit(p.x, p.y, p.z, 0, -0.4, 0, 0.55, 0.03, 0.05, 1, 0.035, 0.7, { gravity: 9, fadeIn: 40 });
        }
        return true;
      });
      const h = {
        remove() {
          if (!alive) return;
          alive = false;
          if (patch.parent) patch.parent.remove(patch);
          patch.geometry.dispose();
        },
      };
      if (b.mission) b.mission.onDispose(h.remove);
      return h;
    },
    /**
     * NEEDLES: Super Janemba cuts the air and the cut rains dimensional glass needles down on a spot.
     * from: a point in the air (the cut), to: the ground point it rains on; opts: count, spread (m), color.
     */
    needles(b, from, to, opts = {}) {
      const n = opts.count || 10, spread = opts.spread || 3;
      for (let i = 0; i < n; i++) {
        const a = i * 2.39996, r = spread * Math.sqrt((i + 0.5) / n);
        const land = to.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
        land.y = b.stage.hasGround ? b.stage.heightAt(land.x, land.z) : land.y;
        const top = from.clone().add(new V3(Math.cos(a * 1.7) * 0.8, Math.sin(a) * 0.3, Math.sin(a * 1.3) * 0.8));
        b.vfx.slash(top, land, opts.color || 0xffd8f4, 0.16, 0.03);
        b.after(4 + (i % 4), () => {
          b.vfx.sparks(land, 0xffc8ec, 5, 4, 0.06);
          if (i % 3 === 0) SL.Dimension.cubes(b, land.clone().add(new V3(0, 0.1, 0)), { count: 4, spread: 0.05, speed: 3, life: 24, size: 0.05, colors: [0xffe0f8, 0xc89aff, 0xffffff] });
        });
      }
      b.after(5, () => b.sfx('warpShatter', null, { at: to, pitch: 1.6, vol: 0.5 }));
    },
    /**
     * A CHIP OUT OF THE ARMOUR, readable from the gameplay camera: the crack it leaves on the chest plate
     * (model.chipArmor: dark, a pale broken flake, no glow) and the moment it happens — plate fragments in
     * the armour's own dark and pale tones falling away (they read on a bright sky and on a dark one), a
     * violet ring, a crack of sound. i: which chip (0, 1, 2...); opts.big: a heavy blow. Returns the point.
     */
    chip(b, f, i, opts = {}) {
      const w = f.model.chipArmor ? f.model.chipArmor(i) : null;
      const p = w ? w.sub(f.object.position).add(f.pos) : f.chest().addScaledVector(f.forward, f.radius * 0.8);
      const big = !!opts.big;
      SL.Dimension.cubes(b, p, { count: big ? 16 : 9, spread: 0.06, speed: big ? 5 : 3.5, life: big ? 46 : 34, size: big ? 0.12 : 0.085, colors: [0x24182e, 0xe2d4f4, 0x5e4670, 0xb07ad8], drift: 7 });
      b.vfx.ring(p, big ? 0.75 : 0.45, 0xc89aff, big ? 0.3 : 0.2);
      b.vfx.sparks(p, 0xf0e0ff, big ? 10 : 6, 5, 0.07);
      b.sfx('warpShatter', f, { pitch: big ? 1.15 : 1.5, vol: big ? 0.8 : 0.5 });
      return p;
    },
    /** A scene's cast: everybody the mission put in b.story, by name. */
    cast(m) {
      const s = m.battle.story || {};
      const out = {};
      for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
      return out;
    },
    /** Runs set(k) for k 0..1 over `seconds` of simulation time (pauses with the game). */
    ramp(b, seconds, set, ease = U.easeInOutCubic) {
      const total = Math.max(1, Math.round(seconds * 60));
      let n = 0;
      b.onTick(() => {
        if (b.disposed) return false;
        n++;
        set(ease(Math.min(1, n / total)));
        return n < total;
      });
    },
    warp(b, to, seconds = 3) {
      const st = b.stage;
      if (!st.setWarp) return;
      const from = st._warp ? st._warp.k : 0;
      if (seconds <= 0) return st.setWarp(to);
      FR.ramp(b, seconds, (k) => b.stage === st && st.setWarp(U.lerp(from, to, k)));
    },
    barrier(b, to, seconds = 2) {
      const st = b.stage;
      if (!st.setBarrier) return;
      const from = st.barrier ? st.barrier.k : 0;
      if (seconds <= 0) return st.setBarrier(to);
      FR.ramp(b, seconds, (k) => b.stage === st && st.setBarrier(U.lerp(from, to, k)), U.easeOutCubic);
    },
    /** The warped Other World as the missions after the disaster find it. */
    warped(b) {
      if (b.stage.setWarp) b.stage.setWarp(1);
      if (b.stage.setBarrier) b.stage.setBarrier(1);
      if (b.stage.burstTank) b.stage.burstTank();
    },

    /**
     * THE STORY CLOCK. Counts `seconds` of play (only while the player has control) and shows the
     * story's time on the HUD ring: opts.storyMinutes (30) scaled onto those seconds. Returns
     * { left, frac, done, stop() }; opts.onTick(h) every frame.
     */
    clock(m, opts = {}) {
      const b = m.battle;
      const total = opts.seconds || 60;
      const storyS = (opts.storyMinutes || 30) * 60;
      const h = { left: total, frac: 1, done: false, stopped: false };
      const show = () => {
        const s = Math.ceil(storyS * h.frac);
        const mm = Math.floor(s / 60), ss = s % 60;
        b.emit('storyClock', { active: !h.stopped, frac: h.frac, text: mm + ':' + (ss < 10 ? '0' : '') + ss, label: opts.label || 'FUSION', color: opts.color || '#f08a24', urgent: h.frac < 0.15 });
      };
      const hook = () => {
        if (h.stopped) return;
        if (!b.inputLocked && !b.paused) h.left = Math.max(0, h.left - 1 / 60);
        h.frac = h.left / total;
        if (h.left <= 0) h.done = true;
        if (b.frame % 6 === 0 || h.done) show();
        if (opts.onTick) opts.onTick(h);
      };
      m.tickHooks.push(hook);
      h.stop = () => {
        h.stopped = true;
        K.unhook(m, hook);
        b.emit('storyClock', { active: false });
      };
      m.onDispose(() => b.emit('storyClock', { active: false }));
      show();
      return h;
    },

    /** Somewhere off in the warp, two people are fighting: flashes, rings and far booms at `at`. */
    distantFight(m, at, opts = {}) {
      const b = m.battle;
      let n = 0;
      const hook = () => {
        n++;
        if (n % (opts.every || 38) !== 0) return;
        const p = at.clone().add(new V3(Math.sin(n * 0.7) * 6, 4 + Math.abs(Math.sin(n * 0.31)) * 9, Math.cos(n * 0.5) * 6));
        const col = n % 76 ? 0xffd23a : 0xd24aff;
        b.vfx.flash(p, 5, col, 0.25, SL.Toon.tex.glow);
        b.vfx.ring(p, 4, col, 0.4);
        b.sfx(n % 3 ? 'punchHeavy' : 'explosionSmall', null, { at: p, vol: 0.5 });
        b.camera.addTrauma(0.04);
      };
      m.tickHooks.push(hook);
      return () => K.unhook(m, hook);
    },

    /** A tear in the sky over Earth: the dead come through it. */
    skyRift(b, at, radius = 14) {
      const p = SL.Dimension.portal(b, at, new V3(0, -1, 0.2).normalize(), { radius, open: 40, sfx: false });
      b.sfx('portalOpen', null, { at, vol: 1 });
      return p;
    },
  });

  /* ======================================================================== THE TANKS */
  const OLIVE = 0x5a6048, OLIVE2 = 0x40442f, TREAD = 0x2a2a28;
  function tankMesh(st) {
    const T = SL.Toon;
    const g = new THREE.Group();
    const add = (geo, color, pos, rot, outline = 1) => {
      const m = new THREE.Mesh(st.track(geo), T.mat(color));
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = true;
      if (outline) T.addOutline(m, outline);
      g.add(m);
      return m;
    };
    add(new THREE.BoxGeometry(3.2, 1.0, 5.2), OLIVE, [0, 0.1, 0], null, 1.4);
    add(new THREE.BoxGeometry(2.6, 0.5, 4.2), OLIVE2, [0, 0.75, -0.2], null, 1);
    for (const s of [1, -1]) {
      add(new THREE.BoxGeometry(0.8, 1.0, 5.6), TREAD, [s * 1.85, -0.3, 0], null, 1);
      for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.42, 0.42, 0.84, 12), 0x3a3a36, [s * 1.86, -0.4, -2.0 + i], [0, 0, Math.PI / 2], 0.6);
    }
    const turret = new THREE.Group();
    turret.position.set(0, 1.2, -0.2);
    g.add(turret);
    const tm = new THREE.Mesh(st.track(new THREE.CylinderGeometry(1.15, 1.3, 0.8, 14)), T.mat(OLIVE));
    T.addOutline(tm, 1.2);
    turret.add(tm);
    const hatch = new THREE.Mesh(st.track(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 10)), T.mat(OLIVE2));
    hatch.position.set(-0.3, 0.5, -0.3);
    turret.add(hatch);
    const barrel = new THREE.Mesh(st.track(new THREE.CylinderGeometry(0.16, 0.2, 3.2, 10)), T.mat(OLIVE2));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.1, 1.9);
    T.addOutline(barrel, 0.8);
    turret.add(barrel);
    const muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.1, 3.55);
    turret.add(muzzle);
    return { group: g, turret, muzzle };
  }

  /**
   * THE ARMOUR. opts: positions [[x, z, yaw]...], hp, reload (seconds), shell { damage, speed, radius },
   * targets() → the heroes they shoot at, knockAt (damage that knocks one sliding), command (index of the
   * Dictator's tank: he rides it). Returns { tanks, alive(), pileups, destroyed, stop() } and emits
   * 'tankDestroyed' { tank }, 'tankPileup' { a, b }, 'tankShot' { tank }.
   */
  FR.armour = function (m, opts = {}) {
    const b = m.battle;
    const st = b.stage;
    const A = { tanks: [], pileups: 0, destroyed: 0, shells: [], live: true };
    const reload = opts.reload || 4.6;
    (opts.positions || []).forEach(([x, z, yaw], i) => {
      const ground = st.hasGround ? st.heightAt(x, z) : 0;
      const pr = st.addProp({ kind: 'tank', pos: new V3(x, ground + 1.2, z), r: 2.5, hp: opts.hp || 2600, id: 'tank' + i });
      pr.static = true;
      pr.lockable = true;
      pr.rocky = false;
      pr.explodeColor = 0xff8a3a;
      pr.debrisColor = OLIVE;
      const mesh = tankMesh(st);
      mesh.group.position.y = -0.9;
      pr.group.add(mesh.group);
      const tk = { i, pr, mesh, yaw: yaw || 0, slide: new V3(), spin: 0, wait: (i * 0.73) % 1 * reload + 1.2, aim: null, tell: 0, way: i * 1.3, command: i === opts.command, wreck: null };
      pr.group.rotation.y = tk.yaw;
      pr.data.tank = tk;
      A.tanks.push(tk);
    });
    const heroes = () => (opts.targets ? opts.targets() : b.fighters.filter((f) => f.team === 0 && f.alive && !f.hidden));
    A.alive = () => A.tanks.filter((t) => t.pr.alive);

    // a heavy blow sends one sliding
    const offD = b.on('propDamaged', (e) => {
      const tk = e.prop && e.prop.data && e.prop.data.tank;
      if (!tk || !e.owner || !e.owner.pos) return;
      if (e.amount < (opts.knockAt || 260)) return;
      const dir = tk.pr.pos.clone().sub(e.owner.pos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
      dir.normalize();
      const sp = U.clamp(e.amount / 90, 8, 26);
      tk.slide.copy(dir.multiplyScalar(sp));
      tk.spin = (tk.i % 2 ? 1 : -1) * sp * 0.05;
      tk.lastHitBy = e.owner;
      b.sfx('punchHeavy', null, { at: tk.pr.pos, pitch: 0.6 });
    });
    const offX = b.on('propDestroyed', (e) => {
      const tk = e.prop && e.prop.data && e.prop.data.tank;
      if (!tk) return;
      A.destroyed++;
      // what is left: the hull, blackened, smoking — not a fireball that leaves nothing
      const w = tankMesh(st);
      w.group.traverse((o) => {
        if (o.isMesh) o.material = SL.Toon.mat(0x2a2622);
      });
      w.group.position.copy(tk.pr.pos).add(new V3(0, -0.9, 0));
      w.group.rotation.y = tk.yaw + 0.3;
      w.turret.rotation.set(0.3, 0.8, 0.2);
      w.turret.position.y += 0.5;
      st.scene.add(w.group);
      tk.wreck = w.group;
      b.emit('tankDestroyed', { tank: tk, by: e.owner });
    });

    const fire = (tk) => {
      const mz = tk.mesh.muzzle.getWorldPosition(new V3());
      const to = tk.aim.clone();
      const dir = to.sub(mz).normalize();
      const mesh = new THREE.Mesh(st.track(new THREE.SphereGeometry(0.22, 8, 6)), SL.Toon.mat(0x2a2a26));
      mesh.position.copy(mz);
      st.scene.add(mesh);
      A.shells.push({ mesh, pos: mz.clone(), vel: dir.multiplyScalar((opts.shell && opts.shell.speed) || 34), life: 2.4, tank: tk });
      b.vfx.flash(mz, 2.2, 0xffc060, 0.12);
      b.vfx.dust(mz, 0.8, 5, 0xb8b0a0);
      b.sfx('tankFire', null, { at: mz });
      b.emit('tankShot', { tank: tk });
    };
    const boom = (s, hitSomeone) => {
      st.scene.remove(s.mesh);
      b.vfx.explosion(s.pos, 1.4, 0xffa040, { life: 0.35 });
      b.sfx('explosionSmall', null, { at: s.pos });
      if (!hitSomeone && st.hasGround && s.pos.y - st.heightAt(s.pos.x, s.pos.z) < 1.2) st.crater(new V3(s.pos.x, st.heightAt(s.pos.x, s.pos.z), s.pos.z), 1.4, 0.25, null);
    };

    let t = 0;
    const hook = () => {
      if (!A.live) return;
      t += 1 / 60;
      const active = !b.inputLocked;
      // shells in flight
      for (let i = A.shells.length - 1; i >= 0; i--) {
        const s = A.shells[i];
        s.pos.addScaledVector(s.vel, 1 / 60);
        s.mesh.position.copy(s.pos);
        s.life -= 1 / 60;
        if (b.frame % 2 === 0) b.vfx.trail(s.pos, 0xd8d0c0, 0.25, 0.3);
        let hit = null;
        for (const f of heroes()) if (f.capsuleDistance(s.pos) < 0.5 + f.radius) hit = f;
        const ground = st.hasGround && s.pos.y <= st.heightAt(s.pos.x, s.pos.z) + 0.1;
        if (hit) hit.takeHit(null, { type: 'explosion', damage: (opts.shell && opts.shell.damage) || 420, knock: 'push', knockSpeed: 12, hitstun: 22, impact: 2, dir: s.vel.clone().normalize(), point: s.pos.clone(), name: 'Tank shell' });
        if (hit || ground || s.life <= 0) {
          boom(s, !!hit);
          A.shells.splice(i, 1);
        }
      }
      for (const tk of A.tanks) {
        const pr = tk.pr;
        if (!pr.alive) {
          if (tk.wreck && b.frame % 9 === tk.i % 9) b.vfx.smoke.emit(pr.pos.x, pr.pos.y + 0.6, pr.pos.z, U.rand(-0.3, 0.3), U.rand(1.5, 2.6), U.rand(-0.3, 0.3), 0.22, 0.2, 0.2, 0.6, 1.4, 2.2, { grow: 1.6, drag: 0.8 });
          continue;
        }
        // sliding after a heavy blow: it goes until it stops or hits another tank
        if (tk.slide.lengthSq() > 0.25) {
          pr.pos.addScaledVector(tk.slide, 1 / 60);
          tk.yaw += tk.spin / 60;
          tk.slide.multiplyScalar(0.965);
          st.clampPosition(pr.pos);
          if (st.hasGround) pr.pos.y = st.heightAt(pr.pos.x, pr.pos.z) + 1.2;
          if (b.frame % 3 === 0) b.vfx.dust(pr.pos.clone().setY(pr.pos.y - 1), 0.8, 2, 0x9a9488);
          for (const o of A.tanks) {
            if (o === tk || !o.pr.alive) continue;
            if (o.pr.pos.distanceTo(pr.pos) < 4.6) {
              A.pileups++;
              b.emit('tankPileup', { a: tk, b: o, by: tk.lastHitBy || null });
              b.cameraTraumaAt(pr.pos, 0.35);
              b.sfx('explosionBig', null, { at: pr.pos });
              o.slide.copy(tk.slide).multiplyScalar(0.7);
              o.spin = -tk.spin;
              st.damageProp(o.pr, 99999, tk.lastHitBy || null);
              st.damageProp(pr, 99999, tk.lastHitBy || null);
              break;
            }
          }
          pr.group.position.copy(pr.pos);
          pr.group.rotation.y = tk.yaw;
          continue;
        }
        tk.slide.set(0, 0, 0);
        if (!active) continue;
        // drive a slow circuit round the square (the command tank stays back)
        const R = tk.command ? 30 : 16 + (tk.i % 3) * 7;
        tk.way += (tk.command ? 0.02 : 0.05) / 60 * (tk.i % 2 ? 1 : -1) * 6;
        const goal = new V3(Math.cos(tk.way + tk.i) * R, pr.pos.y, Math.sin(tk.way + tk.i) * R);
        const d = goal.sub(pr.pos).setY(0);
        if (d.lengthSq() > 1) {
          d.normalize();
          const want = Math.atan2(d.x, d.z);
          let dy = want - tk.yaw;
          while (dy > Math.PI) dy -= Math.PI * 2;
          while (dy < -Math.PI) dy += Math.PI * 2;
          tk.yaw += U.clamp(dy, -0.02, 0.02);
          pr.pos.x += Math.sin(tk.yaw) * (opts.speed || 2.4) / 60;
          pr.pos.z += Math.cos(tk.yaw) * (opts.speed || 2.4) / 60;
        }
        pr.group.position.copy(pr.pos);
        pr.group.rotation.y = tk.yaw;
        // the turret follows the nearest hero; a shot is aimed (the barrel glints, a red line) and then fired
        const hs = heroes();
        const tgt = hs.sort((a, c) => a.pos.distanceTo(pr.pos) - c.pos.distanceTo(pr.pos))[0];
        if (!tgt) continue;
        const rel = tgt.chest().sub(pr.pos);
        const want = Math.atan2(rel.x, rel.z) - tk.yaw;
        tk.mesh.turret.rotation.y = U.lerp(tk.mesh.turret.rotation.y, want, 0.08);
        tk.wait -= 1 / 60;
        if (tk.tell > 0) {
          tk.tell -= 1 / 60;
          const mz = tk.mesh.muzzle.getWorldPosition(new V3());
          if (b.frame % 4 === 0) b.vfx.slash(mz, tk.aim.clone(), 0xff3a2a, 0.08, 0.04);
          if (tk.tell <= 0) fire(tk);
        } else if (tk.wait <= 0 && rel.length() < 70) {
          tk.aim = tgt.chest();
          tk.tell = opts.tell || 0.8;
          tk.wait = reload + (tk.i % 3) * 0.6;
          b.vfx.flash(tk.mesh.muzzle.getWorldPosition(new V3()), 1.2, 0xff5a3a, 0.2, SL.Toon.tex.glow);
          b.emit('telegraph', { pos: new V3(tk.aim.x, tgt.pos.y, tk.aim.z), radius: 1.6, frames: Math.round(tk.tell * 60) });
        }
      }
    };
    m.tickHooks.push(hook);
    A.stop = () => {
      A.live = false;
      K.unhook(m, hook);
      offD();
      offX();
      for (const s of A.shells) st.scene.remove(s.mesh);
      A.shells.length = 0;
    };
    m.onDispose(A.stop);
    return A;
  };

  /* ---------------- film poses ---------------- */
  const PO = SL.data.poses;
  // dragging someone by the arm: walking backward, leaning back, both hands low in front
  PO.g_drag = (t) => {
    const s = Math.sin(t * 7);
    return {
      root: { y: -0.08, rx: -16 }, spine: [-8, 0, 0], chest: [-6, 0, 0], head: [10, 0, 0],
      shoulderL: [-46, 0, 8], elbowL: [-24, 0, 0], shoulderR: [-46, 0, -8], elbowR: [-24, 0, 0],
      thighL: [-14 + s * 22, 0, 8], kneeL: [26 + Math.max(0, s) * 24, 0, 0], thighR: [-14 - s * 22, 0, -8], kneeR: [26 + Math.max(0, -s) * 24, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // down on one knee, the left hand clamped on the right shoulder, the right arm hanging; the head up
  PO.v_kneelShoulder = (t) => {
    const s = Math.sin(t * 2.6) * 1.2;
    return {
      root: { y: -0.46, rx: 8 }, spine: [10 + s, 0, 0], chest: [6, -10, 0], neck: [0, 0, 0], head: [-12, 8, 0],
      shoulderL: [-62, -46, -18], elbowL: [-118, 0, 0], shoulderR: [-8, 0, -8], elbowR: [-18, 0, 0],
      thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // SUPER SAIYAN 3, the scream: the elbows driven back against the ribs, the fists at the waist, the
  // head thrown back to the sky, the knees bent wide (the film's own beat, not the canon g3_ascend)
  PO.g3_scream = (t) => {
    const s = Math.sin(t * 90) * 2.5;
    return {
      hands: ['fist', 'fist'],
      root: { y: -0.14, rx: -4 },
      spine: [-12, 0, s * 0.4], chest: [-22 + s, 0, 0], neck: [-22, 0, 0], head: [-48, 0, 0],
      shoulderL: [34, 0, 12 + s], elbowL: [-104, 0, 0], shoulderR: [34, 0, -12 - s], elbowR: [-104, 0, 0],
      thighL: [-24, 0, 28], kneeL: [48, 0, 0], footL: [-16, 0, -18], thighR: [-24, 0, -28], kneeR: [48, 0, 0], footR: [-16, 0, 18],
    };
  };
  // face down, trying to push himself up on shaking arms (Pikkon after Super Janemba's counter)
  PO.pk_pushUp = (t) => {
    const s = Math.sin(t * 31) * 3;
    return {
      root: { y: -0.74, rx: 66 }, spine: [-12, 0, 0], chest: [-8, 0, 0], head: [-34, 0, 0],
      shoulderL: [-84 + s, 0, 16], elbowL: [-14 - s, 0, 0], shoulderR: [-84 - s, 0, -16], elbowR: [-14 + s, 0, 0],
      thighL: [10, 0, 10], kneeL: [14, 0, 0], thighR: [0, 0, -8], kneeR: [30, 0, 0],
      hands: ['open', 'open'],
    };
  };
})();
