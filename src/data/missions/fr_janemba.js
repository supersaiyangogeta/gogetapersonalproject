/*
 * MOVIE: FUSION REBORN (not canon) — mission 2 of 7: "Janemba"
 *
 *   PIKKON *  (play)          PIKKON at the crystal while Goku leads the child away into the jellybean
 *                             fields (the fight is a glow and a rumble over his shoulder). Test the barrier:
 *                             strike it, shoot it, put a heavy blow into it. It flashes, it rings — a blast
 *                             comes back out of a fold in the air — and a heavy cracks it for a moment before
 *                             it seals again. Force does nothing. He leaves it unsolved.
 *   DUEL *    (play)          GOKU (base, Super Saiyan allowed) against Fat Janemba: the DIMENSION DOOR is the
 *                             lesson — a giggle, palms out, a portal in front of him: hit into it and the blow
 *                             lands on your own back. Go round him or wait.
 *   ASCEND *  (hold Charge)   SUPER SAIYAN 3, played: the feet planted, the fists at the waist, the cloud
 *                             ground lifting, the wind, the blocks shaking in the sky, the roar — then the
 *                             form's own staged sequence, shot the film's way (ssj3Film, the owner's beat
 *                             sheet): the clenched teeth from under the jaw; the elbows back to the ribs and the
 *                             head at the sky — the scream, blue lightning, the jellybean world shaking and the
 *                             floating glass orbs shattering; the lens dropping over the brow as the eyebrows
 *                             go; the mane pouring down his back in slow motion; the silence; the burst; and a
 *                             full-body reveal (scene fr_ssj3_reveal).
 *   FIGHT *   (play)          SSJ3 Goku against Fat Janemba: doors, spheres, the punch through a portal, the
 *                             belly flop out of nowhere, a rubber body. "Only Majin Buu has pushed me this far."
 *   FINISH    (cues + beam)   the aerial combination on three cues — then point blank, the SUPER KAMEHAMEHA:
 *                             hold Special 1, let go. (After 14 s the story fires it for you.)
 *   EVOLVE    (scene)         the shell cracks: SUPER JANEMBA, the sword pulled out of his own head
 *   AFTER                     the title — the barrier between the worlds is gone
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;
  const C = SL.data.cinematics;

  const JB = {
    duelSeconds: 40, duelFloor: 0.62, // the base-form exchange ends at Goku's 62 % or after 40 s
    floor: 0.2, // Fat Janemba's health where the finish begins
    gokuDealt: 1.1, jbDealt: 0.5, // his damage in the story fight (the ease below takes it lower as Goku tires)
    kameAuto: 14, // seconds before the story fires the Kamehameha itself
    pikkonSeconds: 50,
  };
  const pk0 = (S) => S.pikkon;
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  /**
   * SUPER SAIYAN 3 AS THE FILM SHOOTS IT: the options for SL.data.cinematics.transform (changeShots,
   * onFrame) plus cleanup(). Sets out a ring of floating glass orbs behind him for the scream to shatter.
   * Frames are the form sequence's (goku.js ssj3: the scream at 70, the hair from 140, the silence at
   * 232, the burst at 262).
   */
  function ssj3Film(m, g) {
    const b = m.battle;
    const fw = () => g.forward.clone().setY(0).normalize();
    const sd = () => {
      const d = fw();
      return new V3(d.z, 0, -d.x);
    };
    const head = () => g.headPos();
    // the glass orbs, floating behind him where the scream's lens sees them: a pale body, a dark blue rim (it
    // reads against the bright candy sky) and a hard white highlight (it reads against anything dark)
    const orbs = [];
    for (let i = 0; i < 7; i++) {
      const a = g.yaw + Math.PI + (i - 3) * 0.3, r = 10 + (i % 3) * 3, rad = 1.3 + (i % 3) * 0.4;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 16), new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.3, depthWrite: false }));
      const rim = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.08, 24, 16), new THREE.MeshBasicMaterial({ color: 0x3a4a9a, transparent: true, opacity: 0.55, side: THREE.BackSide, depthWrite: false }));
      const shine = new THREE.Mesh(new THREE.SphereGeometry(rad * 0.16, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
      shine.position.set(-rad * 0.45, rad * 0.5, rad * 0.62);
      shine.scale.set(1, 0.7, 0.4);
      mesh.add(rim, shine);
      mesh.position.copy(g.pos).add(new V3(Math.sin(a) * r, 2.5 + ((i * 1.7) % 5), Math.cos(a) * r));
      mesh.lookAt(g.pos.clone().add(new V3(0, 1.5, 0)));
      mesh.userData.rad = rad;
      b.scene.add(mesh);
      orbs.push(mesh);
    }
    // each one goes with a ring and big shards in its own pale and dark blues, falling (no white flash)
    const shatter = (o) => {
      if (!o.visible) return;
      o.visible = false;
      const rad = o.userData.rad;
      SL.Dimension.cubes(b, o.position.clone(), { count: 34, spread: rad * 0.75, speed: 8, life: 54, size: 0.26, colors: [0xe8f8ff, 0x9ab8ff, 0x3a4a9a, 0xffffff], drift: 5 });
      b.vfx.ring(o.position.clone(), rad * 2.2, 0xa8c8ff, 0.3);
      b.sfx('warpShatter', null, { at: o.position, pitch: 1.3, vol: 0.7 });
    };
    // the jellybean world shaking: the warp's candy and blocks jitter in place
    const items = (b.stage._warp && b.stage._warp.items) || [];
    const base = items.map((o) => o.position.clone());
    const restoreItems = () => items.forEach((o, i) => o.position.copy(base[i]));
    const cleanup = () => {
      g.auraViewCap = null;
      for (const o of orbs) {
        b.scene.remove(o);
        o.traverse((x) => {
          if (x.geometry) x.geometry.dispose();
          if (x.material) x.material.dispose();
        });
      }
      orbs.length = 0;
      restoreItems();
    };
    m.onDispose(cleanup);
    // inside the scream's shot (70..140) and the silence's (232..262): the lenses that see the sky behind him
    const SHATTER = [82, 96, 110, 124, 136, 240];
    return {
      cleanup,
      changeShots: [
        // the clenched teeth, tight, from under the jaw
        { at: 0, free: true, shot: (t, out) => {
          const h = head();
          out.pos.copy(h).addScaledVector(fw(), 0.8).addScaledVector(sd(), 0.18).add(new V3(0, -0.3, 0));
          out.look.copy(h).add(new V3(0, 0.08, 0));
          out.fov = 40;
        } },
        // the scream: the elbows back, the head at the sky, the world shaking and shattering behind him
        { at: 70 / 262, free: true, shot: (t, out) => {
          const c = g.chest();
          out.pos.copy(c).addScaledVector(fw(), 2.3).addScaledVector(sd(), 0.9).add(new V3(0, -0.35, 0));
          out.look.copy(c).add(new V3(0, 0.35, 0));
          out.fov = 58;
        } },
        // over the brow, dropping a little: the ridges come up, the eyebrows go
        { at: 140 / 262, free: true, shot: (t, out) => {
          const h = head(), k = Math.min(1, t / 0.75);
          out.pos.copy(h).addScaledVector(fw(), 0.75).add(new V3(0, 0.75 - 0.15 * k, 0));
          out.look.copy(h).add(new V3(0, 0.28 - 0.2 * k, 0));
          out.fov = 34;
        } },
        // the mane pouring down his back, slowly
        { at: 185 / 262, aimFree: true, shot: (t, out) => {
          const h = head();
          out.pos.copy(h).addScaledVector(fw(), -1.7).addScaledVector(sd(), 1).add(new V3(0, -0.55, 0));
          out.look.copy(h).addScaledVector(fw(), -0.3).add(new V3(0, -0.25, 0));
          out.fov = 46;
        } },
        // the silence before it lands
        { at: 232 / 262, free: true, shot: (t, out) => {
          const h = head();
          out.pos.copy(h).addScaledVector(fw(), 1.2).add(new V3(0, -0.42, 0));
          out.look.copy(h).add(new V3(0, 0.05, 0));
          out.fov = 38;
        } },
      ],
      onFrame(fr, burstAt) {
        // the aura down to a glow while the lens is this close: the face and the hair have to read
        g.auraViewCap = fr < burstAt ? 0.3 : null;
        if (fr >= 70 && fr < 232) g.anim.play('g3_scream', 10);
        if (fr === 168) {
          const look = g.def.forms[K.formIndex(g, 'ssj3')].look;
          g.model.face.browMat.color.set(look.brow);
          if (g.model._setHeadExtras) g.model._setHeadExtras(look.headExtras);
          b.vfx.flash(head(), 0.5, 0xfff0b0, 0.12, SL.Toon.tex.glow);
        }
        if (fr === 185) b.slowmo(0.45, 1.3);
        if (fr >= 70 && fr < burstAt && fr % 4 === 0) {
          const p = g.chest().add(new V3(Math.sin(fr * 1.3) * 0.5, Math.cos(fr * 0.9) * 0.8, Math.sin(fr * 2.1) * 0.4));
          b.vfx.bolt(p, 0.8 + (fr % 3) * 0.3, fr % 8 ? 0x6ab8ff : 0xbfe4ff);
        }
        if (fr >= 70 && fr < burstAt) {
          const a = Math.min(1, (fr - 70) / 120) * 0.22;
          items.forEach((o, i) => o.position.set(base[i].x + Math.sin(fr * 1.9 + i) * a, base[i].y + Math.sin(fr * 2.7 + i * 1.3) * a, base[i].z + Math.cos(fr * 2.3 + i) * a));
        }
        for (const [i, at] of SHATTER.entries()) if (fr === at && orbs[i]) shatter(orbs[i]);
        if (fr === burstAt) {
          for (const o of orbs) shatter(o);
          restoreItems();
        }
      },
    };
  }

  function setup(battle) {
    const b = battle;
    FR.warped(b);
    const front = FR.lm(b, 'barrierFront');
    const field = FR.lm(b, 'field');
    const pikkon = b.spawn({ charId: 'pikkon', player: true, team: 0, pos: FR.at(b, front.x + 2, front.z + 1.5), startKi: 100 });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: FR.at(b, field.x - 3, field.z + 6), startKi: 100 });
    const janemba = b.spawn({ charId: 'janemba', team: 1, pos: FR.at(b, field.x, field.z - 6), startKi: 100 });
    const sj = b.spawn({ charId: 'super_janemba', team: 1, pos: FR.at(b, field.x + 30, field.z + 40), startKi: 100 });
    const yemma = b.spawn({ charId: 'king_yemma', team: 0, pos: FR.lm(b, 'yemma'), startKi: 0 });
    yemma.noCollide = true;
    K.watcher(yemma, 'ye_worry', 'shock');
    yemma.yaw = yemma.prevYaw = 0;
    K.watcher(sj, 'sj_idle', 'wicked');
    sj.setHidden(true);
    for (const f of [goku, janemba]) K.watcher(f, 'idle', 'calm');
    FR.halo(b, goku);
    FR.halo(b, pikkon);
    janemba.cannotDie = true;
    b.story = { pikkon, goku, janemba, sj, yemma };
  }

  /** Goku and the child squared up on the pastel field, Pikkon back at the crystal. */
  function stageFight(b) {
    const S = b.story, field = FR.lm(b, 'field');
    S.janemba.setHidden(false);
    S.goku.setHidden(false);
    S.janemba.noCollide = false;
    K.place(S.goku, FR.at(b, field.x, field.z + 7), Math.PI);
    K.place(S.janemba, FR.at(b, field.x, field.z - 5), 0);
    K.faceTo(S.goku, S.janemba.pos);
    K.faceTo(S.janemba, S.goku.pos);
    const front = FR.lm(b, 'barrierFront');
    K.place(S.pikkon, FR.at(b, front.x + 2, front.z + 1.5), Math.PI);
    K.faceTo(S.pikkon, b.stage.barrier.center);
    S.pikkon.controller = K.scripted();
    S.pikkon.setState('scripted', { pose: 'pk_study', expression: 'serious' });
  }

  /** Goku the player, Janemba his CPU self, one on one. */
  function arm(m) {
    const b = m.battle, S = b.story;
    b.switchPlayer(S.goku, { force: true });
    S.pikkon.isPlayer = false;
    S.pikkon.controller = K.scripted();
    S.pikkon.setState('scripted', { pose: 'pk_study', expression: 'serious' });
    S.pikkon.untargetable = true;
    S.pikkon.intangible = true;
    S.janemba.controller = cpu(b);
    S.janemba.untargetable = false;
    S.janemba.intangible = false;
    S.janemba.target = S.goku;
    S.goku.target = S.janemba;
    S.goku.untargetable = false;
    S.goku.intangible = false;
    for (const f of [S.goku, S.janemba]) f.setState('free');
  }

  /** The portal lesson, on screen while a door is open in front of him. */
  function doorTips(m) {
    const b = m.battle, S = b.story;
    const open = () => SL.Mechanics.dimensional.doorOpen(S.janemba);
    m.prompt('frDoor', 'dodge', 'PORTAL — go round him, or wait', { required: true, when: open, until: () => !open() && !!m.flags.doorSeen });
    const off = b.on('portalDoor', (e) => {
      if (e.fighter !== S.janemba) return;
      if (!m.flags.doorSeen) {
        m.flags.doorSeen = true;
        m.say('goku', 'Huh? A hole in the air...', 2);
      }
    });
    const offR = b.on('portalRedirect', (e) => {
      if (e.attacker !== b.player) return;
      m.flags.redirected = (m.flags.redirected || 0) + 1;
      if (m.flags.redirected === 1) m.say('goku', 'Ow! I just punched MYSELF?!', 2.2, { style: 'shout' });
      if (m.flags.redirected === 1) m.say('janemba', 'Janemba! Janemba!', 1.6);
    });
    m.onDispose(off);
    m.onDispose(offR);
    return () => {
      off();
      offR();
    };
  }

  const P = {};

  P.pikkon = {
    id: 'pikkon',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, B = b.stage.barrier;
      m.lock(true);
      m.clearObjectives();
      FR.warped(b);
      const field = FR.lm(b, 'field');
      // Goku has led the child out to the fields: the fight is a glow and a rumble in the distance
      S.goku.setHidden(true);
      S.janemba.setHidden(true);
      const front = FR.lm(b, 'barrierFront');
      K.place(S.pikkon, FR.at(b, front.x + 2, front.z + 2), Math.PI);
      K.faceTo(S.pikkon, B.center);
      b.switchPlayer(S.pikkon, { force: true });
      S.pikkon.setState('free');
      S.pikkon.target = null;
      const offFar = FR.distantFight(m, field.clone().add(new V3(18, 0, 40)));
      // a point on the crystal in front of him to aim at (an invisible lockable mark: shots go where he faces it)
      const toPk = pk0(S).pos.clone().sub(B.center).setY(0).normalize();
      const mark = b.stage.addProp({ kind: 'crystalFace', pos: B.center.clone().addScaledVector(toPk, B.radius - 0.4).setY(3), r: 1.4, hp: 1e9 });
      Object.assign(mark, { invulnerable: true, lockable: true, passable: true, static: true });
      S.pikkon.lockProp = mark;
      m.onDispose(() => (mark.alive = false));
      m.title(FR.CHAPTER, 'THE BARRIER', 'Pikkon · find a way in', 3);
      m.music('janemba_theme', 1);
      m.say('pikkon', 'Go, Goku — keep him busy. I\'ll find a way through this.', 2.8);
      m.objective('melee', 'Strike the barrier', { icon: 'fist' });
      m.objective('blast', 'Fire a ki blast at it', { icon: 'ball' });
      m.objective('heavy', 'Put a heavy blow into it', { icon: 'fist' });
      m.prompt('frPkBlast', 'blast', 'Ki blast', { always: true, when: () => !!m.flags.pkMelee && !m.flags.pkBlast, until: () => !!m.flags.pkBlast });
      m.prompt('frPkHeavy', 'heavy', 'Heavy blow', { always: true, when: () => !!m.flags.pkBlast && !m.flags.pkHeavy, until: () => !!m.flags.pkHeavy });
      let seen = null, t = 0;
      const pk = S.pikkon;
      const hook = () => {
        t += 1 / 60;
        if (b.inputLocked) return;
        // a blow on the crystal: light, a ring, nothing gives; a heavy one cracks it — for a moment
        if (pk.state === 'attack' && pk.sd !== seen && pk.stateFrame >= (pk.sd.startup || 0)) {
          if (pk.chest().distanceTo(B.center) - B.radius < 3.4) {
            seen = pk.sd;
            const heavy = pk.sd.kind !== 'light';
            b.stage.barrierFlash(pk.chest(), heavy);
            b.sfx(heavy ? 'rockBreak' : 'swordClang', pk, { pitch: heavy ? 0.7 : 0.5 });
            pk.vel.addScaledVector(B.center.clone().sub(pk.pos).normalize(), heavy ? -16 : -9);
            if (heavy) {
              const n = pk.chest().sub(B.center).normalize();
              const at = B.center.clone().addScaledVector(n, B.radius);
              for (let i = 0; i < 6; i++) {
                const d = new V3(Math.sin(i * 1.9), Math.cos(i * 2.7), Math.sin(i * 3.1)).normalize();
                b.vfx.slash(at, at.clone().addScaledVector(d, 2.6), 0xffe8ff, 0.9, 0.05);
              }
              b.after(40, () => b.stage.barrierFlash(at, false));
              if (!m.flags.pkHeavy) {
                m.flags.pkHeavy = true;
                m.complete('heavy');
                m.say('pikkon', 'It cracked... and it healed. Instantly.', 2.4);
              }
            } else if (!m.flags.pkMelee) {
              m.flags.pkMelee = true;
              m.complete('melee');
              m.say('pikkon', 'Like striking a mountain of glass.', 2.2);
            }
          }
        }
        // a blast into it: swallowed — and it comes back out of a fold in the air beside him
        for (const pr of b.projectiles.list) {
          if (!pr.alive || pr.owner !== pk) continue;
          if (pr.pos.distanceTo(B.center) > B.radius + 3) continue;
          b.projectiles._explode(pr, true);
          b.stage.barrierFlash(pr.pos.clone(), true);
          const side = new V3(pk.forward.z, 0, -pk.forward.x).multiplyScalar(2.2);
          const out = pk.chest().add(side);
          SL.Dimension.portal(b, out, side.clone().negate().normalize(), { radius: 0.6, life: 24, open: 4, vol: 0.6 });
          pk.takeHit(null, { type: 'ki', damage: 160, knock: 'flinch', hitstun: 16, impact: 1, dir: side.clone().negate().normalize(), point: pk.chest(), name: 'Folded blast' });
          if (!m.flags.pkBlast) {
            m.flags.pkBlast = true;
            m.complete('blast');
            m.say('pikkon', 'My own blast — out of thin air! Space is bent all around this thing.', 3);
          }
        }
      };
      m.tickHooks.push(hook);
      m.lock(false);
      b.aiLocked = true;
      yield () => (m.flags.pkMelee && m.flags.pkBlast && m.flags.pkHeavy) || t > JB.pikkonSeconds;
      K.unhook(m, hook);
      offFar();
      mark.alive = false;
      S.pikkon.lockProp = null;
      for (const id of ['melee', 'blast', 'heavy']) if (!m.flags['pk' + id[0].toUpperCase() + id.slice(1)]) m.failObjective(id);
      m.lock(true);
      K.clearCombat(b);
      pk.setState('scripted', { pose: 'pk_study', expression: 'serious' });
      SL.Cinema.shotOn(m, { pikkon: pk }, { subject: 'pikkon', focus: 'upper', angle: 'three' }, 4, { cut: true, blendIn: 0, hold: true });
      m.say('pikkon', 'Force does nothing. It isn\'t a wall... it\'s part of HIM. As long as that child is loose, it won\'t open.', 4.2);
      yield* m.cine(4.3);
      m.endShot();
    },
  };

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      stageFight(b);
      S.goku.lockedForms = Object.assign({}, S.goku.lockedForms, { ssj3: true });
      if (S.goku.formIndex !== 0) S.goku.applyForm(0);
      S.goku.hp = S.goku.hpMax;
      S.janemba.hp = S.janemba.hpMax;
      arm(m);
      const fight = m.storyFight({ floors: [{ f: S.goku, at: JB.duelFloor }], dealt: [{ f: S.janemba, mul: JB.jbDealt }] });
      doorTips(m);
      m.music('janemba_theme', 2);
      m.title(FR.CHAPTER, 'JANEMBA', 'Goku · base form', 2.6);
      m.objective('duel', 'Fight Janemba', { icon: 'fist' });
      m.objective('round', 'Hit him from behind while his portal is open', { icon: 'guard', optional: true });
      const offB = b.on('damage', (e) => {
        if (e.attacker !== S.goku || e.target !== S.janemba || !m.flags.doorSeen) return;
        if (SL.Mechanics.dimensional.doorOpen(S.janemba)) m.complete('round');
      });
      m.onDispose(offB);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => fight.floored(S.goku) || t > JB.duelSeconds;
      K.unhook(m, clock);
      offB();
      m.complete('duel');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      S.janemba.setState('scripted', { pose: 'jb_clap', expression: 'grin' });
      S.goku.setState('scripted', { pose: 'idle', expression: 'serious' });
      SL.Cinema.shotOn(m, { goku: S.goku }, { subject: 'goku', focus: 'upper', angle: 'three' }, 3.2, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Heh... you\'re no joke, are you? Okay. No more holding back.', 3.2);
      yield* m.cine(3.3);
      m.endShot();
    },
  };

  P.ascend = {
    id: 'ascend',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      if (!m.flags.staged) stageFight(b);
      m.flags.staged = true;
      S.janemba.controller = K.scripted();
      S.janemba.setState('scripted', { pose: 'jb_idle', expression: 'grin' });
      if (g.formIndex !== 0 && g.form.id !== 'ssj') g.applyForm(0);
      g.ki = g.kiMax;
      g.hp = Math.max(g.hp, g.hpMax * 0.7);
      // the feet planted, the fists drawn to the waist — the whole field in the frame
      g.setState('free');
      b.switchPlayer(g, { force: true });
      m.objective('ssj3', 'Super Saiyan 3: hold Charge', { icon: 'transform' });
      m.music('ssj3_theme', 1);
      const wide = (t, out) => {
        const c = g.chest();
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(c).addScaledVector(g.forward, 9 - t * 0.15).addScaledVector(side, 3.5).add(new V3(0, 0.4, 0));
        out.look.copy(c).add(new V3(0, -0.2, 0));
        out.fov = 50;
      };
      m.shot(wide, 999, { hold: true, cut: true, blendIn: 0, subject: g });
      const film = ssj3Film(m, g);
      yield* C.ascend(m, {
        transform: film,
        fighter: g,
        form: 'ssj3',
        witness: S.janemba,
        seconds: 4.5,
        label: 'Hold Charge — Super Saiyan 3',
        meter: 'SUPER SAIYAN 3',
        music: 3,
        dust: true,
        beats: [
          {
            // the cloud ground lifts round his feet; the wind
            at: 0.2,
            run(mm, f) {
              b.vfx.ring(f.pos.clone().add(new V3(0, 0.1, 0)), 8, 0xfff0b0, 0.7, new V3(0, 1, 0));
              b.vfx.dust(f.pos.clone(), 4, 18, 0xffd8f0);
              b.sfx('rumble', f, { vol: 0.8 });
            },
          },
          {
            // the floating blocks in the sky start to shake; Janemba stops giggling
            at: 0.45,
            run(mm, f) {
              for (const s of b.stage.spinners) if (s.userData.spin) s.userData.spin.multiplyScalar(4);
              S.janemba.setState('scripted', { pose: 'jb_door', expression: 'shock' });
              b.vfx.ring(f.chest(), 6, 0xffd23a, 0.5);
              mm.shot((t, out) => {
                const c = f.chest();
                out.pos.copy(c).addScaledVector(f.forward, 4.2).add(new V3(0, -1.4, 0));
                out.look.copy(c).add(new V3(0, 0.4, 0));
                out.fov = 56;
              }, 999, { hold: true, cut: true, blendIn: 0, subject: f });
            },
          },
          {
            // gold and blue lightning, the roar coming
            at: 0.75,
            run(mm, f) {
              for (let i = 0; i < 5; i++) b.vfx.bolt(f.chest().add(new V3(Math.sin(i * 2) * 0.8, Math.cos(i * 3) * 0.9, 0.3)), 1.4, i % 2 ? 0x9ad8ff : 0xfff0a0);
              b.cameraTraumaAt(f.chest(), 0.4);
              mm.shot(wide, 999, { hold: true, cut: true, blendIn: 0, subject: f });
            },
          },
        ],
        onReady() {
          for (const s of b.stage.spinners) if (s.userData.spin) s.userData.spin.multiplyScalar(0.25);
        },
      });
      film.cleanup();
      m.complete('ssj3');
      m.endShot();
      yield* SL.Cinema.play(m, 'fr_ssj3_reveal');
    },
  };

  P.fight = {
    id: 'fight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, jb = S.janemba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      if (!m.flags.staged) stageFight(b);
      m.flags.staged = true;
      if (g.form.id !== 'ssj3') K.toForm(g, 'ssj3');
      if (g.lockedForms) delete g.lockedForms.ssj3;
      if (g.storyLocks) delete g.storyLocks.ssj3;
      // the third level puts him back on his feet: full strength for the real fight
      g.ki = Math.max(g.ki, g.kiMax * 0.8);
      g.hp = g.hpMax;
      jb.hp = Math.max(jb.hp, jb.hpMax * 0.92);
      arm(m);
      const fight = m.storyFight({ floors: [{ f: jb, at: JB.floor }], dealt: [{ f: jb, mul: JB.jbDealt }, { f: g, mul: JB.gokuDealt }], ease: { foe: jb, hero: g, below: 0.55, min: 0.35 } });
      doorTips(m);
      m.music('janemba_theme', 3);
      m.objective('janemba', 'Defeat Fat Janemba', { icon: 'fist' });
      m.objective('clean', 'Never hit yourself through a portal', { icon: 'guard', optional: true });
      m.prompt('frSsj3Ki', 'charge', 'Super Saiyan 3 burns ki — charge to keep it', { always: true, when: () => g.form.id === 'ssj3' && g.ki < g.kiMax * 0.25 && g.state === 'free', until: () => g.ki > g.kiMax * 0.6 });
      const offR = b.on('portalRedirect', (e) => e.attacker === g && m.failObjective('clean'));
      m.onDispose(offR);
      // the lines of the film, said while it is being fought
      let talked = 0;
      const talk = () => {
        if (talked === 0 && jb.hpFrac < 0.6) {
          talked = 1;
          m.say('goku', 'You should be proud of yourself. Only Majin Buu has pushed me this far in battle before.', 4);
          b.after(250, () => m.say('janemba', 'Oooo... oooo. Janemba... Janemba... Janemba.', 3));
          b.after(450, () => m.say('goku', 'You act innocent, but you\'re deadly.', 2.6));
        }
      };
      m.tickHooks.push(talk);
      m.lock(false);
      b.aiLocked = false;
      yield () => fight.floored(jb) || m.state !== 'running';
      K.unhook(m, talk);
      offR();
      if (m.state !== 'running') return;
      m.complete('janemba');
      if (!m.objectives.find((o) => o.id === 'clean').failed) m.complete('clean');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /** One staged blow of the aerial combination. */
  function blow(m, opts) {
    const b = m.battle, S = b.story, g = S.goku, jb = S.janemba;
    const fwd = g.forward.clone().setY(0).normalize();
    g.setState('scripted', { pose: opts.pose, expression: 'shout', speed: 30 });
    jb.setState('scripted', { pose: opts.hurt || 'hitHeavy', expression: 'hurt', speed: 24 });
    const to = jb.pos.clone().addScaledVector(fwd, opts.push || 2).add(new V3(0, opts.lift || 0, 0));
    K.hover(b, jb, to, 0);
    jb.setPosition(to);
    jb.grounded = false;
    b.vfx.impact(jb.chest(), 4, 0xffe08a);
    b.vfx.ring(jb.chest(), 3.4, 0xffd23a, 0.4);
    b.sfx('punchHeavy', jb, { pitch: 0.75, vol: 1.1 });
    b.cameraTraumaAt(jb.chest(), 0.5);
    jb.anim.squash = 0.55;
    b.slowmo(0.35, 0.3);
  }

  P.finish = {
    id: 'finish',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, jb = S.janemba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (g.form.id !== 'ssj3') K.toForm(g, 'ssj3');
      g.ki = g.kiMax;
      g.controller = K.scripted();
      jb.controller = K.scripted();
      // the two of them in the air, Goku in front
      const field = FR.lm(b, 'field');
      K.hover(b, jb, FR.at(b, field.x, field.z - 4), 3);
      K.hover(b, g, FR.at(b, field.x, field.z - 1.2), 3);
      K.faceTo(g, jb.pos);
      K.faceTo(jb, g.pos);
      const close = (t, out) => {
        const c = g.chest().lerp(jb.chest(), 0.5);
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(c).addScaledVector(side, 6.5).add(new V3(0, 1.2, 0));
        out.look.copy(c);
        out.fov = 50;
      };
      m.shot(close, 999, { hold: true, cut: true, blendIn: 0 });
      m.objective('combo', 'The aerial combination', { icon: 'fist' });
      yield* m.cue('light', 'Strike', { auto: 4, slow: 0.4 });
      blow(m, { pose: 'g_jab', push: 1.6, lift: 0.4 });
      K.hover(b, g, g.pos.clone().addScaledVector(g.forward, 1.6), 0);
      g.setPosition(g.pos.clone().addScaledVector(g.forward, 1.6).add(new V3(0, 0.4, 0)));
      yield* m.cine(0.35);
      yield* m.cue('light', 'Strike', { auto: 4, slow: 0.4 });
      blow(m, { pose: 'g_kick', push: 1.8, lift: 2.6, hurt: 'tumble' });
      // a flicker: he is above and in front of him again before he has stopped spinning
      b.vfx.afterimage(g.pos, g.height, 0xfff0a0);
      g.setPosition(jb.pos.clone().addScaledVector(jb.forward, 3.6).add(new V3(0, 0.2, 0)));
      K.faceTo(g, jb.pos);
      b.sfx('vanish', g);
      yield* m.cine(0.35);
      yield* m.cue('heavy', 'Smash', { auto: 4, slow: 0.4 });
      blow(m, { pose: 'g_flyingKnee', push: 0.6, lift: 0.3, hurt: 'jb_compress' });
      m.complete('combo');
      yield* m.cine(0.4);
      // POINT BLANK: the Super Kamehameha, charged and fired by the player
      m.endShot();
      const at = jb.pos.clone().addScaledVector(jb.forward, 4.2);
      at.y = jb.pos.y + 0.2;
      g.setPosition(at);
      g.grounded = false;
      K.faceTo(g, jb.pos);
      jb.setState('scripted', { pose: 'jb_compress', expression: 'hurt' });
      jb.untargetable = false;
      jb.intangible = false;
      g.target = jb;
      g.setState('free');
      b.switchPlayer(g, { force: true });
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.s1;
      delete lim.s1Held;
      m.limits(lim);
      m.objective('kame', 'SUPER KAMEHAMEHA: hold Special 1, release to fire', { icon: 'beam' });
      m.prompt('frKame', 'special1', 'Super Kamehameha — hold, then release', { required: true, until: () => !!m.flags.kameHit });
      m.music('janemba_theme', 3);
      m.shot((t, out) => {
        const c = g.chest().lerp(jb.chest(), 0.35);
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(g.chest()).addScaledVector(g.forward, -2.6).addScaledVector(side, 1.8).add(new V3(0, 0.6, 0));
        out.look.copy(c);
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const offH = b.on('damage', (e) => {
        if (e.attacker === g && e.target === jb && e.type === 'beam') m.flags.kameHit = true;
      });
      m.onDispose(offH);
      b.inputLocked = false;
      b.aiLocked = true;
      let t = 0, auto = false;
      const clock = () => {
        t += 1 / 60;
        // nobody is stuck: after a while the story charges and fires it
        if (t > JB.kameAuto && !auto && g.state === 'free') {
          auto = true;
          let n = 0;
          g.controller = { update: () => Object.assign(SL.emptyIntent(), n++ < 2 ? { s1: true, s1Held: true } : { s1Held: n < 70 }) };
        }
      };
      m.tickHooks.push(clock);
      yield () => m.flags.kameHit || t > JB.kameAuto + 6;
      K.unhook(m, clock);
      offH();
      m.limits(null);
      m.complete('kame');
      m.qteParts.push(auto ? 0.4 : 1);
      // the beam has him: hold on it a moment, in slow motion
      b.slowmo(0.4, 1.2);
      yield* m.cine(1.4);
      m.lock(true);
      K.clearCombat(b);
      if (g.controller && !(g.controller instanceof SL.PlayerController)) b.switchPlayer(g, { force: true });
      m.endShot();
    },
  };

  P.evolve = {
    id: 'evolve',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const g = S.goku, jb = S.janemba, sj = S.sj;
      jb.setHidden(false);
      K.place(jb, FR.at(b, jb.pos.x, jb.pos.z), jb.yaw);
      K.place(g, FR.at(b, jb.pos.x + g.forward.x * -6, jb.pos.z + g.forward.z * -6), 0);
      K.faceTo(g, jb.pos);
      K.faceTo(jb, g.pos);
      g.setState('scripted', { pose: 'g2_stance', expression: 'angry' });
      jb.controller = K.scripted();
      sj.controller = K.scripted();
      yield* SL.Cinema.play(m, 'fr_evolve');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(FR.CHAPTER, 'THE WALLS BETWEEN THE WORLDS ARE DOWN', 'On Earth, the dead are walking · ' + m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'fr_janemba',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'Janemba',
    subtitle: 'The Other World · not canon',
    character: 'goku',
    stage: 'other_world',
    parTime: 480,
    lockForms: FR.LOCKS,
    qteLabel: 'The finish',
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Pikkon tests the crystal; Goku plays with a child who folds space — then stops playing. Super Saiyan 3, and a Kamehameha at point-blank range.',
    rewards: ['Pikkon (playable)', 'Goku: Super Saiyan 3 vs Janemba'],
    setup,
    phases: [P.pikkon, P.duel, P.ascend, P.fight, P.finish, P.evolve, P.after],
  };

  SL.data.frJanemba = { JB };
  SL.data.missions[def.id] = def;
})();
