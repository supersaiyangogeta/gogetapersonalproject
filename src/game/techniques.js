/*
 * Character techniques that need their own state machine (beyond beams,
 * projectiles, rushes, teleports and the Spirit Bomb built into Fighter).
 *
 * A technique is referenced from character data by `type` and registers its
 * states here, so new characters add behaviour without growing fighter.js:
 *   SL.Techniques[type] = { start(fighter, spec, slot, kiCost) -> bool, states, exits, gravityExempt }
 *
 * Current techniques
 *   latch  — leap onto the target's back and self-destruct unless shaken off (Saibaman)
 *   burrow — dig underground, tunnel under the target and erupt with a launcher (Saibaman)
 *   tailGrapple — lash the tail out, coil it around the target and choose a follow-up (Raditz)
 *   telekinesis — freeze a target in place while concentrating (Chiaotzu)
 *   senzu — eat a Senzu Bean, or toss one to an ally in trouble (Yajirobe)
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;
  const UP = new V3(0, 1, 0);

  const Techniques = (SL.Techniques = SL.Techniques || {});
  const Exits = (SL.TechniqueExits = SL.TechniqueExits || {});
  // armor level a technique state has against incoming hits (impact <= level does not interrupt)
  const Armor = (SL.TechniqueArmor = SL.TechniqueArmor || {});

  function register(type, def) {
    Techniques[type] = def;
    for (const name of Object.keys(def.states || {})) SL.FighterStates[name] = def.states[name];
    for (const name of Object.keys(def.exits || {})) Exits[name] = def.exits[name];
    for (const name of def.gravityExempt || []) SL.FighterGravityExempt.add(name);
    for (const name of Object.keys(def.armor || {})) Armor[name] = def.armor[name];
  }
  SL.registerTechnique = register;

  const UNGRABBABLE = ['held', 'knockdown', 'ko', 'vanish', 'teleport', 'transform', 'clash', 'spiritBomb', 'scripted'];
  const MASH_KEYS = ['light', 'heavy', 'blast', 'dodge', 's1', 's2', 'ult'];
  const HOLD_KEYS = ['guard', 's1Held', 'ultHeld', 'blastHeld'];

  /* ======================================================================
   * SPIRIT BALL CONTROL (Yamcha). After throwing the Spirit Ball he keeps the
   * button held and steers it with his fingers: left/right on screen curves it,
   * Fly Up / Fly Down lifts or drops it, forward speeds it up and back slows it.
   * Letting go, running out of control time or being hit ends it and the ball
   * flies on straight. A steered ball can burst through a target once and come
   * round for a second, weaker pass (Projectiles.update). A CPU Yamcha's ball
   * steers itself at the target for a moment instead (projectile.autoSteer).
   * ====================================================================== */
  register('spiritBallControl', {
    start: () => false,
    states: {
      spiritSteer(it) {
        const sd = this.sd, p = sd.ball, st = sd.spec.projectile.steer, b = this.battle;
        this.vel.multiplyScalar(0.8);
        if (this.grounded) this.vel.y = 0;
        this.anim.play(st.pose || 'blastR', 12);
        const held = sd.slot === 'special1' ? it.s1Held : sd.slot === 'special2' ? it.s2Held : it.ultHeld;
        if (!held || !p || !p.alive || this.stateFrame > st.frames) {
          if (p) p.steering = false;
          this.setState('free');
          return;
        }
        p.steering = true;
        // steer relative to the screen: the camera's right, and world up
        const cam = b.camera;
        const fx = cam.look.x - cam.pos.x, fz = cam.look.z - cam.pos.z;
        const fl = Math.hypot(fx, fz) || 1;
        const right = new V3(-fz / fl, 0, fx / fl);
        const dir = p.vel.clone().normalize();
        const k = st.turn * TICK;
        dir.addScaledVector(right, U.clamp(it.mx || 0, -1, 1) * k);
        if (it.up) dir.y += k;
        if (it.down) dir.y -= k;
        dir.normalize();
        p.vel.copy(dir).multiplyScalar(p.speed * (1 + 0.35 * U.clamp(it.my || 0, -1, 1)));
        // he watches his ball
        this.yaw = U.dampAngle(this.yaw, Math.atan2(p.pos.x - this.pos.x, p.pos.z - this.pos.z), 10, TICK);
      },
    },
    exits: {
      spiritSteer(f, sd) {
        if (sd.ball) sd.ball.steering = false;
      },
    },
  });

  /* ======================================================================
   * LATCH — the Saibaman's suicide grab.
   * crouch (readable tell) -> ballistic leap -> cling to the victim's back
   * -> fuse ticks down, flashing faster -> victim shakes it off (mash) or an
   * ally knocks it away -> otherwise it self-destructs at point blank.
   * ====================================================================== */
  function releaseVictim(f, sd) {
    const v = sd.victim;
    if (v && v.alive && v.state === 'held' && v.sd.by === f) {
      v.setState('free');
      v.invuln = Math.max(v.invuln, 12);
    }
    if (v && v === f.battle.player) f.battle.emit('struggle', { active: false });
  }

  function detonate(f, v, sp) {
    const b = f.battle;
    const c = f.chest();
    // let go without the escape invulnerability: the blast lands point blank
    if (v && v.alive && v.state === 'held' && v.sd.by === f) v.setState('free');
    if (v && v === b.player) b.emit('struggle', { active: false });
    b.vfx.explosion(c, sp.blastRadius * 0.7, 0xfff2b0, { smoke: true });
    b.vfx.ring(c, sp.blastRadius * 1.6, 0xd8ff9a, 0.5);
    b.vfx.ring(f.pos.clone().add(new V3(0, 0.2, 0)), sp.blastRadius * 2.2, 0xfff2b0, 0.7, UP);
    b.vfx.sparks(c, 0xffffff, 40, 18, 0.16);
    b.sfx('explosionBig', null, { at: c, vol: 1.3 });
    b.cameraTraumaAt(c, 0.9);
    if (b.involvesPlayer(v) || b.involvesPlayer(f)) SL.ScreenFX.flash(0.45, '#fff6d0');
    // the victim takes the whole blast; anyone else nearby is caught by the edge of it
    if (v && v.alive) {
      v.takeHit(f, { type: 'explosion', damage: sp.blastDamage, knock: 'heavy', knockSpeed: 20, hitstun: 70, impact: 4, dir: v.pos.clone().sub(f.pos).setY(0.6).normalize(), point: c.clone(), guardPierce: true });
    }
    for (const e of b.enemiesOf(f)) {
      if (e === v || !e.alive) continue;
      const d = e.capsuleDistance(c);
      if (d < sp.blastRadius) e.takeHit(f, { type: 'explosion', damage: sp.blastDamage * 0.3 * (1 - d / sp.blastRadius), knock: 'push', knockSpeed: 12, hitstun: 24, impact: 2, dir: e.chest().sub(c).normalize(), point: c.clone() });
    }
    b.stage.explode(c, sp.blastRadius * 0.6, 1800, null, f);
    if (sp.survive) {
      // spent to the last spark: thrown clear, collapsed, no ki, one breath of health left
      b.emit('selfDestruct', { fighter: f, victim: v, survived: true });
      f.hp = Math.min(f.hp, 1);
      f.ki = 0;
      f.invuln = 0;
      f.vel.set(0, 6, 0).addScaledVector(f.forward, -10);
      f.setState('knockdown', { frames: 150 });
      f.anim.play('knockdown', 20, { restart: true });
      return;
    }
    // nothing is left of the Saibaman
    f.mech.vaporized = true;
    f.cannotDie = false;
    f.infiniteHp = false;
    f.invuln = 0;
    if (f.alive) {
      f.hp = 0;
      f._ko(null, { dir: UP.clone() });
    }
    f.setHidden(true);
    f.vel.set(0, 0, 0);
    b.emit('selfDestruct', { fighter: f, victim: v });
  }

  register('latch', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || UNGRABBABLE.includes(t.state)) return false;
      if (f.distTo(t) > sp.range) return false;
      R.spendKi(f, cost);
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('latchCrouch', { spec: sp, victim: t });
      f.anim.play(sp.poses.crouch, 18);
      f.battle.sfx('saibaScreech', f);
      f.battle.emit('latchTell', { fighter: f, victim: t });
      return true;
    },
    gravityExempt: ['latchLeap', 'latchCling'],
    states: {
      latchCrouch(it) {
        const sd = this.sd, sp = sd.spec, t = sd.victim;
        this.vel.x *= 0.6;
        this.vel.z *= 0.6;
        this.faceTarget(20);
        // eyes flash as it coils: the tell a player learns to read
        this.flash = this.stateFrame % 6 < 3 ? 0.35 : 0;
        if (this.stateFrame < sp.crouch) return;
        if (!t || !t.alive || t.hidden || UNGRABBABLE.includes(t.state)) {
          this.setState('recover', { frames: 12 });
          return;
        }
        const g = 28 * (this.battle.stage.def.gravity || 1);
        const to = t.chest().sub(this.chest());
        const flat = Math.hypot(to.x, to.z);
        const T = U.clamp(flat / sp.leapSpeed, 0.22, 0.75);
        this.vel.set(to.x / T, (to.y + 0.5 * g * T * T) / T, to.z / T);
        this.grounded = false;
        this.setState('latchLeap', { spec: sp, victim: t, g });
        this.anim.play(sp.poses.leap, 30);
        this.battle.sfx('dash', this, { vol: 0.7, pitch: 1.5 });
      },
      latchLeap(it) {
        const sd = this.sd, sp = sd.spec, t = sd.victim, f = this.stateFrame;
        const b = this.battle;
        if (b.stage.hasGround) this.vel.y -= sd.g * TICK;
        this.faceTarget(30);
        if (f % 2 === 0) b.vfx.trail(this.chest(), 0xb8ff7a, 0.35, 0.25);
        if (t && t.alive && !t.hidden && t.invuln <= 0 && t.capsuleDistance(this.chest()) < t.radius + 0.5 * this.scale + 0.2) {
          if (UNGRABBABLE.includes(t.state)) {
            this.setState('recover', { frames: 16 });
            return;
          }
          const res = t.takeHit(this, { type: 'melee', damage: sp.grabDamage, knock: 'held', impact: 1, dir: this.dirTo(t), pose: 'hitBody', sfx: 'punchLight' });
          if (res === 'hit' && t.alive) {
            t.setState('held', { by: this, frames: 99999, latched: true });
            t.vel.set(0, 0, 0);
            this.setState('latchCling', { spec: sp, victim: t, fuse: sp.fuse, escape: 0, beep: 0 });
            this.anim.play(sp.poses.cling, 30);
            b.sfx('saibaScreech', this, { pitch: 1.3 });
            b.emit('latch', { fighter: this, victim: t });
          } else {
            // guarded, perfect-guarded or vanished: it bounces off
            this.vel.copy(this.dirTo(t)).multiplyScalar(-9).addScaledVector(UP, 6);
            this.setState('knockback', { frames: 26, knock: 'heavy', startFrames: 26 });
            this.anim.play('hitHeavy', 30, { restart: true });
            b.emit('latchBlocked', { fighter: this, victim: t, result: res });
          }
          return;
        }
        if ((f > 6 && this.grounded) || f > 55) this.setState('recover', { frames: 18 });
      },
      latchCling(it) {
        const sd = this.sd, sp = sd.spec, v = sd.victim;
        const b = this.battle;
        if (!v || !v.alive) {
          this.setState('knockback', { frames: 20, knock: 'heavy', startFrames: 20 });
          return;
        }
        // hits from someone else break a latch only if they knock the victim away
        if (v.state !== 'held') {
          if (['hitstun', 'free', 'guard'].includes(v.state)) v.setState('held', { by: this, frames: 99999, latched: true });
          else {
            this.vel.copy(v.forward).multiplyScalar(-8).addScaledVector(UP, 5);
            this.setState('knockback', { frames: 24, knock: 'heavy', startFrames: 24 });
            return;
          }
        }
        // wrapped around the victim's upper back, head over the shoulder
        const back = v.forward.multiplyScalar(-(v.radius * 0.85));
        this.pos.copy(v.pos).add(back);
        this.pos.y += v.height * 0.2;
        this.yaw = v.yaw;
        this.vel.set(0, 0, 0);
        this.grounded = false;
        v.vel.set(0, 0, 0);

        sd.fuse--;
        const period = Math.max(4, Math.round(sd.fuse / 7));
        sd.beep--;
        if (sd.beep <= 0) {
          sd.beep = period;
          this.flash = 0.9;
          b.sfx('fuseBeep', this, { pitch: 1 + (1 - sd.fuse / sp.fuse) * 0.8 });
        }

        // the victim fights to shake it off
        const isPlayer = v === b.player;
        if (isPlayer) {
          const vi = v.intent || {};
          if (SL.Settings.data.gameplay.beamClashInput === 'hold') {
            if (HOLD_KEYS.some((k) => vi[k])) sd.escape += sp.holdGain / 60;
          } else if (MASH_KEYS.some((k) => vi[k])) sd.escape += sp.mashGain * (SL.Settings.data.gameplay.qteAssist ? 1.35 : 1);
          sd.escape = Math.max(0, sd.escape - sp.escapeDecay);
          b.emit('struggle', { active: true, progress: 1 - U.clamp01(sd.escape), rate: 1, label: 'SHAKE IT OFF' });
        } else {
          // a CPU victim's composure is rolled once per latch: sometimes it keeps its head, sometimes it panics
          if (sd.cpuRate === undefined) {
            const ctl = v.controller;
            const skill = ctl && ctl.d ? ctl.d.escape : 0.2;
            // training dummies (idle/guard/...) never struggle
            sd.cpuRate = ctl && ctl.dummy && ctl.dummy !== 'cpu' ? 0 : sp.cpuEscape * (0.6 + skill * 2) * U.rand(0.5, 1.5);
          }
          sd.escape += sd.cpuRate;
        }
        if (sd.escape >= 1) {
          const victim = v;
          releaseVictim(this, sd);
          sd.victim = null;
          victim.invuln = 24;
          victim.anim.play('powerUp', 30, { restart: true });
          b.vfx.ring(victim.chest(), 3, 0xffffff, 0.3);
          this.vel.copy(victim.forward).multiplyScalar(-15).addScaledVector(UP, 7);
          this.setState('knockback', { frames: 44, knock: 'heavy', startFrames: 44 });
          this.anim.play('hitHeavy', 30, { restart: true });
          b.sfx('punchHeavy', victim);
          b.emit('latchEscape', { fighter: this, victim });
          return;
        }
        if (sd.fuse <= 0) detonate(this, v, sp);
      },
    },
    exits: {
      latchCling(f, sd) {
        releaseVictim(f, sd);
      },
    },
  });

  /* ======================================================================
   * BURROW — dig in, tunnel as a moving mound of dirt, a short cracking
   * warning under the target, then erupt with a launching strike.
   * ====================================================================== */
  function surface(f) {
    f.setHidden(false);
    f.untargetable = false;
    f.invuln = 0;
    f.mech.burrowed = false;
  }

  register('burrow', {
    start(f, sp, slot, cost) {
      const b = f.battle;
      const t = f.target;
      if (!b.stage.hasGround || !f.grounded || !t || !t.alive) return false;
      R.spendKi(f, cost);
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('burrow', { spec: sp, phase: 'dig', victim: t });
      f.anim.play(sp.poses.dig, 16);
      b.sfx('burrow', f);
      return true;
    },
    gravityExempt: ['burrow'],
    states: {
      burrow(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle, stage = b.stage;
        const sand = stage.def.terrain ? stage.def.terrain.sand : 0xb89a78;
        const dirt = stage.def.terrain ? stage.def.terrain.dirt : 0x8a6a4a;
        this.vel.set(0, 0, 0);
        if (sd.phase === 'dig') {
          if (f % 3 === 0) b.vfx.dust(this.pos, 0.9, 5, sand);
          this.anim.shake = 0.1;
          if (f >= sp.digFrames) {
            b.vfx.debrisBurst(this.pos.clone().add(new V3(0, 0.3, 0)), 10, dirt, 8, 0.2);
            this.setHidden(true);
            this.untargetable = true;
            this.invuln = 99999;
            this.mech.burrowed = true;
            sd.phase = 'tunnel';
            sd.start = f;
          }
          return;
        }
        const t = sd.victim && sd.victim.alive ? sd.victim : this.target;
        if (sd.phase === 'tunnel') {
          if (t && t.alive) {
            const dx = t.pos.x - this.pos.x, dz = t.pos.z - this.pos.z;
            const d = Math.hypot(dx, dz);
            const step = Math.min(d, sp.speed * this.mult().speed * TICK);
            if (d > 0.001) {
              this.pos.x += (dx / d) * step;
              this.pos.z += (dz / d) * step;
              this.yaw = Math.atan2(dx, dz);
            }
            if (d < 0.9) sd.phase = 'warn';
          }
          stage.clampPosition(this.pos);
          this.pos.y = stage.heightAt(this.pos.x, this.pos.z);
          this.grounded = true;
          // the moving mound is the only thing the player sees
          if (f % 4 === 0) b.vfx.dust(this.pos, 0.7, 3, sand);
          if (f % 9 === 0) b.vfx.rock(this.pos.clone().add(new V3(0, 0.2, 0)), new V3(U.rand(-2, 2), U.rand(3, 6), U.rand(-2, 2)), U.rand(0.08, 0.16), dirt);
          if (f % 24 === 0) b.sfx('burrow', this, { vol: 0.5 });
          if (f - sd.start > sp.maxFrames) sd.phase = 'warn';
          if (sd.phase === 'warn') {
            sd.warnStart = f;
            b.sfx('rockBreak', null, { at: this.pos, vol: 0.5 });
          }
          return;
        }
        if (sd.phase === 'warn') {
          // cracks and a dust fountain right under the target: dodge now
          if (f % 2 === 0) b.vfx.dust(this.pos, 1.4, 4, sand);
          b.cameraTraumaAt(this.pos, 0.05);
          if (f - sd.warnStart >= sp.warnFrames) {
            surface(this);
            this.pos.y = stage.heightAt(this.pos.x, this.pos.z);
            this.prevPos.copy(this.pos);
            this.grounded = false;
            this.vel.set(0, sp.riseSpeed, 0);
            this.fallVel = sp.riseSpeed;
            this.anim.play(sp.poses.erupt, 40, { restart: true });
            b.vfx.debrisBurst(this.pos.clone().add(new V3(0, 0.4, 0)), 16, dirt, 14, 0.28);
            b.vfx.dust(this.pos, 2.2, 12, sand);
            b.sfx('rockBreak', null, { at: this.pos, vol: 1 });
            b.cameraTraumaAt(this.pos, 0.3);
            for (const e of b.enemiesOf(this)) {
              if (!e.alive) continue;
              const flat = Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z);
              if (flat < sp.radius + e.radius && e.pos.y - this.pos.y < 3.2) {
                e.takeHit(this, { type: 'melee', damage: sp.damage, knock: 'launch', knockSpeed: sp.knockSpeed, hitstun: 40, impact: 3, dir: UP.clone(), point: e.pos.clone().add(new V3(0, 0.3, 0)), pose: 'hitBody', sfx: 'punchHeavy' });
              }
            }
            b.emit('burrowErupt', { fighter: this });
            this.setState('recover', { frames: sp.recovery, fall: true });
          }
        }
      },
    },
    exits: {
      burrow(f, sd) {
        if (f.mech.burrowed) {
          surface(f);
          f.pos.y = f.battle.stage.heightAt(f.pos.x, f.pos.z);
        }
      },
    },
  });

  /* ======================================================================
   * SCATTER — Krillin's Scattering Bullet: a ki ball thrown high overhead
   * bursts into a rain of homing shots spread over every enemy in range.
   * ====================================================================== */
  register('scatter', {
    start(f, sp, slot, cost) {
      if (!R.spendKi(f, cost)) return false;
      f.setState('scatter', { spec: sp, slot, phase: 'wind' });
      f.battle.ultimateChargeShot && f.isPlayer && f.battle.ultimateChargeShot(f, (sp.windup + sp.rise) / 60);
      f.anim.play(sp.poses.wind, 16);
      f.battle.sfx('beamCharge', f, { vol: 0.6 });
      return true;
    },
    // committed: light and medium hits do not break the throw
    armor: { scatter: () => 2 },
    states: {
      scatter(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.8);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(10);
        if (!sd.orb) sd.orb = b.projectiles.chargeOrb(sp.color);
        const hand = this.handPos('R');
        if (sd.phase === 'wind') {
          sd.orb.position.copy(hand).add(new V3(0, 0.3, 0));
          sd.orb.scale.setScalar(0.4 + (f / sp.windup) * 1.2);
          if (f % 3 === 0) b.vfx.streamInward(sd.orb.position, 1.5, sp.color, 2, 0.08, 0.3);
          if (f >= sp.windup) {
            sd.phase = 'rise';
            sd.from = sd.orb.position.clone();
            sd.riseStart = f;
            this.anim.play(sp.poses.throw || sp.poses.fire || sp.poses.wind, 40); // kits name the release "throw" or "fire"
            b.sfx('kiBlastBig', this, { pitch: 1.2 });
            b.emit('scatterThrow', { fighter: this });
          }
          return;
        }
        if (sd.phase === 'rise') {
          const k = (f - sd.riseStart) / sp.rise;
          sd.orb.position.copy(sd.from).add(new V3(0, U.easeOutCubic(k) * sp.height, 0));
          sd.orb.scale.setScalar(1.6 + k * 0.6);
          if (f % 2 === 0) b.vfx.trail(sd.orb.position, sp.color, 0.6, 0.3);
          if (k >= 1) {
            const c = sd.orb.position.clone();
            sd.orb.visible = false;
            sd.orb = null;
            b.vfx.flash(c, 6, sp.color, 0.3, SL.Toon.tex.glow);
            b.vfx.ring(c, 8, 0xffffff, 0.4);
            b.sfx('explosionSmall', null, { at: c, vol: 1 });
            const foes = b.enemiesOf(this).filter((e) => !e.untargetable && !e.hidden && e.pos.distanceTo(this.pos) < sp.range);
            for (let i = 0; i < sp.count; i++) {
              const t = foes.length ? foes[i % foes.length] : null;
              // an even fountain of shots (golden-angle spread) that then curve down onto the targets
              const ang = i * 2.39996;
              const spread = new V3(Math.cos(ang) * 0.7, 0.55 + (i % 3) * 0.15, Math.sin(ang) * 0.7).normalize();
              const pr = b.projectiles.spawnBlast(this, c, spread, { kind: 'blast', speed: sp.speed, radius: 0.34, damage: sp.damage, color: sp.color, core: 0xffffff, seek: 0.14, seekDelay: 8 + (i % 4) * 3, knock: 'push', knockSpeed: 8, hitstun: 20, impact: 2, explode: 1.8, life: 3 });
              pr.target = t;
            }
            b.emit('scatterBurst', { fighter: this, count: sp.count, targets: foes.length });
            sd.phase = 'recover';
            sd.recStart = f;
          }
          return;
        }
        if (f - sd.recStart >= sp.recovery) this.setState('free');
      },
    },
    exits: {
      scatter(f, sd) {
        if (sd.orb) {
          sd.orb.visible = false;
          sd.orb = null;
        }
      },
    },
  });

  /* ======================================================================
   * STARDUST FALL — Gogeta: a flash step up and over the target, then a
   * rain of ki driven straight down at him from both hands, a shot every few
   * frames in the colours of the fusion's light, and one heavy shot to
   * finish. Readable and dodgeable: the shots are aimed where he IS, with
   * only a little homing — keep moving under it and most of it hits the
   * ground. Committed (armor 2) while it rains.
   *   spec: rise, height, shots, interval, damage, finalDamage, speed, colors,
   *         recovery, poses { wind, fire, fireL, finish }
   * ====================================================================== */
  register('stardustFall', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive) return false;
      if (!R.spendKi(f, cost)) return false;
      f.setState('stardust', { spec: sp, slot, phase: 'rise', shot: 0 });
      f.anim.play(sp.poses.wind, 18);
      f.battle.vfx.afterimage(f.pos, f.height, f.ghostColor());
      f.battle.sfx('vanish', f, { pitch: 1.3 });
      return true;
    },
    armor: { stardust: () => 2 },
    gravityExempt: ['stardust'],
    states: {
      stardust(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        const t = this.target;
        this.grounded = false;
        if (!t || !t.alive) {
          this.setState('free');
          return;
        }
        // where he hangs: over the target, a little back toward where he came from
        const back = this.pos.clone().sub(t.pos).setY(0);
        if (back.lengthSq() < 0.01) back.set(0, 0, 1);
        back.normalize();
        const over = t.pos.clone().addScaledVector(back, 2.6).add(new V3(0, (sp.height || 6) * t.scale, 0));
        b.stage.clampPosition(over);
        if (sd.phase === 'rise') {
          const k = Math.min(1, f / (sp.rise || 14));
          this.pos.lerp(over, 0.18 + k * 0.3);
          this.vel.set(0, 0, 0);
          this.faceTarget(30);
          if (f % 3 === 0) b.vfx.trail(this.chest(), this.ghostColor(), 0.5, 0.25);
          if (f >= (sp.rise || 14)) {
            sd.phase = 'fire';
            sd.fireStart = f;
            b.emit('stardustFall', { fighter: this });
          }
          return;
        }
        // hanging there: he drifts with the target so the rain stays on him
        this.pos.lerp(over, 0.06);
        this.vel.set(0, 0, 0);
        this.faceTarget(40);
        const colors = sp.colors || [0x8ad8ff, 0xffe36a, 0xff9ad8, 0x9affc0, 0xffffff];
        if (sd.phase === 'fire') {
          const n = f - sd.fireStart;
          if (n % (sp.interval || 3) === 0 && sd.shot < (sp.shots || 14)) {
            const i = sd.shot++;
            const hand = i % 2 ? 'L' : 'R';
            this.anim.play(i % 2 ? sp.poses.fireL || sp.poses.fire : sp.poses.fire, 60, { restart: true });
            const origin = this.handPos(hand);
            // a fixed scatter round the target (golden angle): it covers where he could step to
            const ang = i * 2.39996, rad = 0.4 + (i % 4) * 0.45;
            const aim = t.chest().add(new V3(Math.cos(ang) * rad, 0, Math.sin(ang) * rad));
            const dir = aim.sub(origin).normalize();
            const col = colors[i % colors.length];
            const pr = b.projectiles.spawnBlast(this, origin, dir, { kind: 'blast', speed: sp.speed || 72, radius: 0.3, damage: sp.damage || 400, color: col, core: 0xffffff, homing: 0.35, knock: 'flinch', hitstun: 14, impact: 1, explode: 1.4, life: 2, name: sp.name });
            pr.target = t;
            b.vfx.flash(origin, 0.9, col, 0.08, SL.Toon.tex.glow);
            if (i % 2 === 0) b.sfx('kiBlast', this, { pitch: 1.1 + (i % 5) * 0.05, vol: 0.8 });
          }
          if (sd.shot >= (sp.shots || 14) && n % (sp.interval || 3) === (sp.interval || 3) - 1) {
            sd.phase = 'finish';
            sd.finishStart = f;
            this.anim.play(sp.poses.finish || sp.poses.fire, 16);
          }
          return;
        }
        if (sd.phase === 'finish') {
          const n = f - sd.finishStart;
          if (n < 12 && n % 3 === 0) b.vfx.streamInward(this.handPos('R').lerp(this.handPos('L'), 0.5), 1.4, 0xfff4c0, 2, 0.1, 0.25);
          if (n === 12) {
            const origin = this.handPos('R').lerp(this.handPos('L'), 0.5);
            const dir = t.chest().sub(origin).normalize();
            b.projectiles.spawnBlast(this, origin, dir, { kind: 'ball', speed: (sp.speed || 72) * 0.9, radius: 0.8, damage: sp.finalDamage || 1400, color: 0xfff0b0, core: 0xffffff, homing: 0.5, knock: 'smash', knockSpeed: 30, hitstun: 30, impact: 3, explode: 3.2, life: 2.2, name: sp.name });
            b.sfx('kiBlastBig', this, { pitch: 0.9 });
            b.cameraTraumaAt(this.chest(), 0.2);
            sd.phase = 'recover';
            sd.recStart = f;
          }
          return;
        }
        if (f - sd.recStart >= (sp.recovery || 22)) this.setState('free');
      },
    },
  });

  /* ======================================================================
   * STARDUST BREAKER — Gogeta's (Fusion Reborn) finisher outside the story
   * (the records PDF: "a short, controlled startup and a unique impact
   * effect", not another big beam). The palm up, the prism orb growing over
   * it (SL.Dimension.prismOrb — the same orb Fusion Reborn stages), the fist
   * closing round it, and its glittering dust thrown into him: a homing
   * burst of light that does the damage, glitter breaking over him where it
   * lands. Interrupted before the crush, the orb just fades.
   * ====================================================================== */
  register('stardustBreaker', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive) return false;
      if (!R.spendKi(f, cost)) return false;
      f.setState('breaker', { spec: sp, slot, phase: 'raise' });
      f.anim.play(sp.poses.raise, 9);
      f.battle.sfx('kiUp', f, { vol: 0.6, pitch: 1.4 });
      return true;
    },
    armor: { breaker: () => 2 },
    states: {
      breaker(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame, b = this.battle, t = this.target;
        this.vel.multiplyScalar(0.8);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(12);
        const raise = sp.raise || 44, maxR = sp.orbR || 0.55;
        const PR = SL.Dimension.PRISM;
        if (sd.phase === 'raise') {
          if (!sd.prism) sd.prism = SL.Dimension.prismOrb(b, { fade: 14 });
          const k = Math.min(1, f / raise), r = maxR * (0.12 + 0.88 * (1 - (1 - k) * (1 - k)));
          sd.prism.set(this.handPos('R').add(new V3(0, r + 0.12, 0)), r);
          if (f % 2 === 0) b.vfx.streamInward(sd.prism.pos, 1.4, PR[f % PR.length], 2, 0.08, 0.3);
          if (f % 30 === 0) b.sfx('prismHum', this, { vol: 0.3 + 0.4 * k });
          if (f >= raise) {
            sd.phase = 'crush';
            sd.at = f;
            this.anim.play(sp.poses.crush, 24);
          }
          return;
        }
        if (sd.phase === 'crush') {
          const n = f - sd.at, fist = this.handPos('R').add(new V3(0, 0.08, 0));
          if (n <= 8) sd.prism.set(sd.prism.pos.clone().lerp(fist, n / 8), maxR * (1 - 0.85 * (n / 8)));
          if (n === 8) {
            sd.prism.close();
            sd.prism = null;
            SL.Dimension.glitter(b, fist, 40, { speed: 2.4, life: 0.9, size: 0.09 });
            b.vfx.flash(fist, 0.9, 0xfff4ff, 0.14, SL.Toon.tex.glow);
            b.sfx('warpShatter', this, { pitch: 1.7, vol: 0.8 });
          }
          if (n === 16) {
            // the dust thrown into him: it finds him (homing), and the light does the work — a small violet burst, the
            // glitter carrying the impact (no white sphere over the frame)
            const dir = t && t.alive ? t.chest().sub(fist).normalize() : this.forward.clone();
            sd.dust = b.projectiles.spawnBlast(this, fist, dir, { kind: 'ball', speed: sp.speed || 64, radius: 0.55, damage: sp.damage || 5200, color: 0xb08aff, core: 0xe8f8ff, homing: 1.4, knock: 'heavy', knockSpeed: 30, hitstun: 50, impact: 3, explode: 1.1, life: 2.4, name: sp.name });
            if (sd.dust && t) sd.dust.target = t;
            b.sfx('prismHum', this, { vol: 0.9 });
            if (this.cine) this._cineEvent('release');
            sd.phase = 'recover';
            sd.at = f;
          }
          return;
        }
        // the dust in flight: glitter shed along it, and breaking over him when it lands
        const p = sd.dust;
        if (p && p.alive && f % 2 === 0) SL.Dimension.glitter(b, p.pos, 3, { speed: 0.6, life: 0.6, size: 0.07 });
        if (p && !p.alive && !sd.landed) {
          sd.landed = true;
          if (t && t.alive && p.pos.distanceTo(t.chest()) < 3) {
            SL.Dimension.glitter(b, t.chest(), 60, { speed: 3, life: 1.2, size: 0.1 });
            b.vfx.flash(t.chest(), 1.2, 0xd8c8ff, 0.18, SL.Toon.tex.glow);
          }
        }
        if (f - sd.at >= (sp.recovery || 30)) this.setState('free');
      },
    },
    exits: {
      breaker(f, sd) {
        // (sd.prism, not sd.orb: _exitState drops any sd.orb before this runs)
        if (sd.prism) sd.prism.close();
        sd.prism = null;
      },
    },
  });

  /* ======================================================================
   * SOLAR FLARE — Tien's blinding flash: every enemy in range that is
   * looking at him is blinded and helpless for a moment. Useless against
   * someone looking away.
   * ====================================================================== */
  register('solarFlare', {
    start(f, sp, slot, cost) {
      if (!R.spendKi(f, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('solarFlare', { spec: sp });
      f.anim.play(sp.poses.wind, 20);
      return true;
    },
    states: {
      solarFlare(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(12);
        if (f === sp.startup) {
          const head = this.chest().add(new V3(0, this.height * 0.35, 0));
          this.anim.play(sp.poses.flash, 40);
          b.vfx.flash(head, 14, 0xffffff, 0.45, SL.Toon.tex.glow);
          b.vfx.ring(head, 10, 0xfffbe0, 0.4);
          b.vfx.light(head, 0xffffff, 3, 40, 0.4);
          b.sfx('teleport', this, { pitch: 0.6 });
          let blinded = 0;
          for (const e of b.enemiesOf(this)) {
            if (e.hidden || !e.alive || e.pos.distanceTo(this.pos) > sp.range) continue;
            const toMe = this.chest().sub(e.chest()).normalize();
            const looking = e.forward.dot(new V3(toMe.x, 0, toMe.z).normalize()) > 0.2;
            if (!looking || ['transform', 'ko', 'vanish', 'teleport'].includes(e.state)) continue;
            if (e.poise && e.poise.broken <= 0) {
              // bosses shrug it off, but still lose their current attack
              e.setState('stagger', { frames: Math.round(sp.stunFrames * 0.35), blind: true });
            } else e.setState('stagger', { frames: sp.stunFrames, blind: true });
            e.vel.set(0, 0, 0);
            blinded++;
            if (e === b.player) SL.ScreenFX.flash(0.95, '#ffffff');
            b.emit('blinded', { fighter: e, by: this });
          }
          if (b.involvesPlayer(this) && this === b.player) SL.ScreenFX.flash(0.35, '#fffbe0');
          b.emit('solarFlare', { fighter: this, blinded });
        }
        if (f >= sp.startup + sp.recovery) this.setState('free');
      },
    },
  });

  /* ======================================================================
   * BOSS TECHNIQUES — readable, telegraphed attacks for big enemies (Nappa
   * first; reused by later bosses). Every one shows where it will land and
   * leaves a punish window afterwards.
   * ====================================================================== */

  /** A glowing warning disc on the ground that fills up until the hit lands. owner (optional): the event's fighter. */
  function telegraph(b, pos, radius, color, frames, owner) {
    const g = new THREE.Group();
    // normal blending: additive warnings vanish on bright sand; polygon offset keeps them above bumpy ground
    const mat = (opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
    const disc = new THREE.CircleGeometry(1, 40);
    const ringGeo = new THREE.RingGeometry(0.9, 1, 48);
    const fill = new THREE.Mesh(disc, mat(0.22));
    const inner = new THREE.Mesh(disc, mat(0.32));
    const edge = new THREE.Mesh(ringGeo, mat(0.9));
    for (const m of [fill, inner, edge]) {
      m.rotation.x = -Math.PI / 2;
      m.renderOrder = 11;
      g.add(m);
    }
    g.position.copy(pos);
    if (b.stage.hasGround) g.position.y = b.stage.heightAt(pos.x, pos.z) + 0.3;
    g.scale.setScalar(radius);
    inner.scale.setScalar(0.01);
    b.scene.add(g);
    let n = 0;
    const t = {
      pos: g.position.clone(),
      done: false,
      remove() {
        if (t.done) return;
        t.done = true;
        b.scene.remove(g);
        disc.dispose();
        ringGeo.dispose();
        for (const m of [fill, inner, edge]) m.material.dispose();
      },
    };
    b.onTick(() => {
      if (t.done || b.disposed) return false;
      n++;
      inner.scale.setScalar(Math.min(1, n / frames));
      edge.material.opacity = 0.65 + 0.3 * Math.sin(n * 0.45);
      if (n >= frames) {
        t.remove();
        return false;
      }
      return true;
    });
    b.emit('telegraph', { fighter: owner, pos: t.pos, radius, frames });
    return t;
  }
  SL.telegraph = telegraph;

  function removeDome(sd) {
    if (!sd.dome) return;
    sd.dome.parent && sd.dome.parent.remove(sd.dome);
    sd.dome.geometry.dispose();
    sd.dome.material.dispose();
    sd.dome = null;
  }

  function groundAt(b, v) {
    const p = v.clone();
    if (b.stage.hasGround) p.y = b.stage.heightAt(p.x, p.z);
    return p;
  }

  /* --- GROUND SLAM: crouch, leap at the target's position, crash down in a shockwave ring --- */
  register('groundSlam', {
    // from a button (a special slot) it pays its ki and starts its cooldown like every other technique (2026-10-15: it
    // did neither, so Magetta's press, Broly's leap, Zarbon's quake and the other slams were free and could be repeated
    // at once); a boss pattern ('boss') and a direct call (no slot) stay free
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || !f.battle.stage.hasGround) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.setState('bossSlam', { spec: sp, phase: 'crouch' });
      f.anim.play(sp.poses.crouch, 16);
      f.battle.sfx('kiUp', f, { pitch: 0.6 });
      return true;
    },
    gravityExempt: ['bossSlam'],
    armor: { bossSlam: (f) => (f.sd.phase === 'recover' ? 0 : 2) },
    states: {
      bossSlam(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        if (sd.phase === 'crouch') {
          this.vel.set(0, 0, 0);
          this.faceTarget(14);
          if (f % 5 === 0) b.vfx.dust(this.pos, 1.4, 4, b.stage.def.terrain ? b.stage.def.terrain.sand : undefined);
          if (f >= sp.crouch) {
            const t = this.target;
            const aim = t && t.alive ? t.pos.clone() : this.pos.clone().addScaledVector(this.forward, 8);
            const off = aim.clone().sub(this.pos).setY(0);
            if (off.length() > sp.maxRange) off.setLength(sp.maxRange);
            sd.land = groundAt(b, this.pos.clone().add(off));
            sd.mark = telegraph(b, sd.land, sp.radius, 0xff2a10, sp.hang);
            const T = sp.hang / 60;
            sd.g = (8 * sp.height) / (T * T);
            this.vel.set(off.x / T, (sd.g * T) / 2, off.z / T);
            this.grounded = false;
            sd.phase = 'air';
            sd.airStart = f;
            this.anim.play(sp.poses.air, 20);
            b.sfx('jump', this, { pitch: 0.6, vol: 1.3 });
            b.vfx.dust(this.pos, 2.4, 12);
          }
          return;
        }
        if (sd.phase === 'air') {
          this.vel.y -= sd.g * TICK;
          this.faceTarget(6);
          const gh = b.stage.heightAt(this.pos.x, this.pos.z);
          if ((f - sd.airStart > 6 && this.vel.y < 0 && this.pos.y <= gh + 0.2) || f - sd.airStart > sp.hang + 20) {
            this.pos.y = gh;
            this.vel.set(0, 0, 0);
            this.grounded = true;
            if (sd.mark) sd.mark.remove();
            const c = this.pos.clone();
            b.stage.crater(c, sp.radius * 0.45, 1.2, this);
            // sp.ringColor / sp.coreColor / sp.dustColor: a slam in its owner's colours (Broly's green on the snow,
            // where white rings and brown dust washed the frame out); the defaults are the old ones
            b.vfx.ring(c.clone().add(new V3(0, 0.3, 0)), sp.radius * 1.9, sp.ringColor === undefined ? 0xffe0b0 : sp.ringColor, 0.55, UP);
            b.vfx.ring(c.clone().add(new V3(0, 0.3, 0)), sp.radius * 1.2, sp.coreColor === undefined ? 0xffffff : sp.coreColor, 0.35, UP);
            b.vfx.dust(c, sp.radius * 0.8, 30, sp.dustColor === 'stage' ? b.stage.def.terrain && b.stage.def.terrain.sand : sp.dustColor);
            b.vfx.debrisBurst(c.clone().add(new V3(0, 0.5, 0)), 24, b.stage.rockColor || 0x8a6a4a, 14, 0.35);
            b.sfx('groundImpact', null, { at: c, vol: 1.5 });
            b.cameraTraumaAt(c, 0.8);
            for (const e of b.enemiesOf(this)) {
              if (!e.alive || e.hidden) continue;
              const flat = Math.hypot(e.pos.x - c.x, e.pos.z - c.z);
              const height = e.pos.y - b.stage.heightAt(e.pos.x, e.pos.z);
              // the shockwave runs along the ground: jump or fly over it
              if (flat < sp.radius + e.radius && height < sp.clearHeight) {
                const k = 1 - Math.min(1, flat / (sp.radius + e.radius)) * 0.5;
                e.takeHit(this, { type: 'explosion', damage: sp.damage * k, knock: 'launch', knockSpeed: sp.knockSpeed, hitstun: 40, impact: 3, dir: e.pos.clone().sub(c).setY(0.4).normalize(), point: e.pos.clone().add(new V3(0, 0.4, 0)) });
              }
            }
            b.stage.explode(c, sp.radius * 0.5, 1500, null, this);
            b.emit('bossSlam', { fighter: this, pos: c });
            this.anim.play(sp.poses.land, 30, { restart: true });
            sd.phase = 'recover';
            sd.recStart = f;
          }
          return;
        }
        this.vel.set(0, 0, 0);
        if (f - sd.recStart >= sp.recovery) this.setState('free');
      },
    },
    exits: {
      bossSlam(f, sd) {
        if (sd.mark) sd.mark.remove();
      },
    },
  });

  /*
   * --- EXPLOSIVE WAVE (Bomber DX): a long, glowing charge, then everything nearby is blown away ---
   * sp.look (optional, every field defaults to the boss version): a hero's burst shot close by the
   * gameplay camera — { telegraph: false (no warning marker or dome), color, ringColor, aura (flare
   * during the charge, 1), blast (fireball, 0.55 × reach), ring (ground ring, 2.2 × reach), light (4),
   * ground (crater and dust, 0.8 × reach), flash (screen flash, 0.55), grow (the aura and the shaking
   * swell through the charge), bolts (colour: lightning crackling round him), blastFlash (the burst's flash
   * sprites, 1) }. The reach and the damage
   * are the same whatever it looks like. sp.impact: the hit's impact level (4). sp.selfCost: the share
   * of his own maximum health the burst takes from him (never below 1 HP — Final Explosion).
   */
  register('bomberWave', {
    start(f, sp, slot, cost) {
      // pressed from a technique slot it costs its ki and starts its cooldown (it used to be free
      // and could be pressed again at once — found building the purge's Aura Burst, 2026-09-24)
      if (!payFromSlot(f, sp, slot, cost)) return false;
      const L = sp.look || {};
      f.setState('bossBomber', { spec: sp, phase: 'charge' });
      f.anim.play(sp.poses.charge, 14);
      f.aura.target = L.aura === undefined ? 1 : L.aura;
      f.battle.sfx('kaiokenBoom', f, { pitch: 0.55 });
      f.battle.emit('bomberCharge', { fighter: f });
      // a hero's burst is not a warning to anybody: no marker, no dome
      if (L.telegraph === false) return true;
      f.sd.mark = telegraph(f.battle, f.pos, sp.radius, 0xff3a14, sp.charge);
      // a swelling dome of heat shows exactly how far the blast will reach
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
      dome.position.copy(f.pos);
      if (f.battle.stage.hasGround) dome.position.y = f.battle.stage.heightAt(f.pos.x, f.pos.z);
      dome.scale.setScalar(sp.radius * 0.15);
      dome.renderOrder = 10;
      f.battle.scene.add(dome);
      f.sd.dome = dome;
      return true;
    },
    gravityExempt: ['bossBomber'],
    armor: { bossBomber: (f) => (f.sd.phase === 'charge' ? 3 : 0) },
    states: {
      bossBomber(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.set(0, 0, 0);
        if (sd.phase === 'charge') {
          if (sd.dome) {
            const k = Math.min(1, f / sp.charge);
            sd.dome.scale.setScalar(sp.radius * (0.15 + 0.85 * U.easeOutCubic(k)));
            sd.dome.material.opacity = 0.12 + 0.1 * Math.abs(Math.sin(f * 0.25)) + k * 0.08;
          }
          const L = sp.look || {};
          const g = Math.min(1, f / sp.charge);
          if (f % 4 === 0) b.vfx.streamInward(this.chest(), 4, L.color || 0xffc060, 2, 0.12, 0.35);
          if (f % 10 === 0) b.cameraTraumaAt(this.pos, 0.12);
          this.anim.shake = L.grow ? 0.03 + 0.12 * g : 0.08;
          // (the state's aura override: Fighter._post sets the aura from sd.aura every frame)
          if (L.grow) sd.aura = (L.aura === undefined ? 1 : L.aura) * (0.5 + g);
          if (L.bolts && f % 5 === 0) b.vfx.bolt(this.chest().add(new V3(U.rand(-0.5, 0.5), U.rand(-0.6, 0.6), U.rand(-0.5, 0.5)).multiplyScalar(this.scale)), (1 + g) * this.scale, L.bolts);
          if (f >= sp.charge) {
            const c = this.chest();
            if (sd.mark) sd.mark.remove();
            removeDome(sd);
            this.aura.target = 0;
            const k = (v, d) => (L[v] === undefined ? d : L[v]);
            b.vfx.explosion(c, sp.radius * k('blast', 0.55), L.color || 0xffb060, { smoke: true, flash: L.blastFlash });
            b.vfx.ring(this.pos.clone().add(new V3(0, 0.4, 0)), sp.radius * k('ring', 2.2), L.ringColor || 0xffe0a0, 0.7, UP);
            b.vfx.light(c, L.color || 0xffb060, k('light', 4), sp.radius * 4, 0.5);
            b.sfx('explosionHuge', null, { at: c });
            b.cameraTraumaAt(c, 1);
            const flash = k('flash', 0.55);
            if (flash && (b.involvesPlayer(this) || this.target === b.player)) SL.ScreenFX.flash(flash, '#ffe6b0');
            for (const e of b.enemiesOf(this)) {
              if (!e.alive || e.hidden) continue;
              const d = e.capsuleDistance(c);
              if (d < sp.radius) e.takeHit(this, { type: 'explosion', damage: sp.damage * (1 - (d / sp.radius) * 0.45), knock: 'heavy', knockSpeed: sp.knockSpeed, hitstun: 50, impact: sp.impact || 4, dir: e.chest().sub(c).setY(0.25).normalize(), point: e.chest(), technique: sp.id });
            }
            b.stage.explode(this.pos.clone(), sp.radius * k('ground', 0.8), 6000, null, this);
            if (sp.selfCost) this.hp = Math.max(1, this.hp - this.hpMax * sp.selfCost);
            if (L.grow) sd.aura = 0;
            if (this.cine) this._cineEvent('release');
            b.emit('bomberWave', { fighter: this });
            this.anim.play(sp.poses.release, 40, { restart: true });
            sd.phase = 'release';
            sd.relStart = f;
          }
          return;
        }
        if (sd.phase === 'release' && f - sd.relStart > 18) {
          // winded: the punish window
          sd.phase = 'winded';
          // a field with no winded pose of its own (17's, 16's) holds its release pose
          this.anim.play(sp.poses.winded || sp.poses.release, 10);
        }
        if (f - sd.relStart >= sp.recovery) this.setState('free');
      },
    },
    exits: {
      bossBomber(f, sd) {
        if (sd.mark) sd.mark.remove();
        removeDome(sd);
        f.aura.target = 0;
      },
    },
  });

  /* --- ERUPTION (Break Cannon): points two fingers up; the ground under each marked spot bursts --- */
  register('eruption', {
    // pays from a button like groundSlam (Magetta's Molten Ground and Frieza's Death Storm were free from their slots)
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || !f.battle.stage.hasGround) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.setState('bossEruption', { spec: sp, fired: 0, next: 0 });
      f.anim.play(sp.poses.cast, 16);
      return true;
    },
    states: {
      bossEruption(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(10);
        if (sd.fired < sp.count && f >= sd.next) {
          const t = this.target;
          if (t && t.alive) {
            // aim a little ahead of a moving target
            const lead = t.pos.clone().addScaledVector(t.vel.clone().setY(0), sp.lead);
            const spot = groundAt(b, lead);
            telegraph(b, spot, sp.radius, sp.markColor || 0xffc400, sp.delay, this);
            b.sfx('kiUp', this, { pitch: 1.5, vol: 0.6 });
            const owner = this;
            b.after(sp.delay, () => {
              if (b.disposed) return;
              const top = spot.clone().add(new V3(0, 1.5, 0));
              // sp.color / sp.flashColor / sp.skyBolt (optional, 2026-10-19: Fused Zamasu's judgment comes down as pink
              // lightning): the column in its owner's colours, a bolt out of the sky onto it; the defaults are the old ones
              for (let i = 0; i < 4; i++) b.vfx.ball(spot.clone().add(new V3(0, i * 1.6, 0)), sp.radius * (0.9 - i * 0.15), sp.color || 0xffd070, 0.45 + i * 0.05);
              b.vfx.flash(top, sp.radius * 3, sp.flashColor || 0xffe0a0, 0.25);
              if (sp.skyBolt) b.vfx.skyBolt(top, 26, sp.skyBolt);
              b.vfx.debrisBurst(spot.clone().add(new V3(0, 0.3, 0)), 14, b.stage.rockColor || 0x8a6a4a, 16, 0.3);
              b.sfx('explosionBig', null, { at: spot, vol: 0.9 });
              b.cameraTraumaAt(spot, 0.4);
              for (const e of b.enemiesOf(owner)) {
                if (!e.alive || e.hidden) continue;
                const flat = Math.hypot(e.pos.x - spot.x, e.pos.z - spot.z);
                if (flat < sp.radius + e.radius && e.pos.y - spot.y < sp.columnHeight) {
                  e.takeHit(owner, { type: 'explosion', damage: sp.damage, knock: 'launch', knockSpeed: sp.knockSpeed, hitstun: 40, impact: 3, dir: UP.clone(), point: e.pos.clone().add(new V3(0, 0.3, 0)) });
                }
              }
              b.stage.explode(spot, sp.radius * 0.6, 1400, null, owner);
              b.emit('eruption', { fighter: owner, pos: spot });
            });
          }
          sd.fired++;
          sd.next = f + sp.interval;
          if (sd.fired >= sp.count) sd.doneAt = f;
        }
        if (sd.doneAt !== undefined && f - sd.doneAt >= sp.recovery) this.setState('free');
      },
    },
  });

  /**
   * Boss and giant techniques started from a player's button (the playable Great
   * Ape) pay their ki and start their cooldown. The boss AI starts them with
   * slot 'boss' and paces them with pattern cooldowns instead; a throw passes no slot.
   */
  function payFromSlot(f, sp, slot, cost) {
    if (!slot || slot === 'boss') return true;
    if (cost && !R.spendKi(f, cost)) return false;
    f.cooldowns[slot] = sp.cooldown || 0;
    return true;
  }

  /* --- ROAR: phase-change shockwave that shoves everyone back (not damage) --- */
  register('bossRoar', {
    start(f, sp, slot, cost) {
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.setState('bossRoar', { spec: sp });
      f.anim.play(sp.poses.roar, 12);
      f.invuln = sp.frames;
      return true;
    },
    states: {
      bossRoar(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.6);
        if (this.grounded) this.vel.y = 0;
        this.anim.shake = 0.1;
        if (f === sp.blastAt) {
          const c = this.chest();
          // sp.cloud / sp.sfx: the same shove with another face (Veku's Panic Puff is a little cloud, not a roar)
          b.vfx.ring(c, sp.radius * 1.6, sp.cloud || 0xffffff, 0.5);
          b.vfx.ring(this.pos.clone().add(new V3(0, 0.3, 0)), sp.radius * 2, sp.cloud || 0xffd090, 0.6, UP);
          b.vfx.dust(this.pos, sp.radius * 0.6, 24, sp.cloud);
          b.sfx(sp.sfx || 'roar', this, { pitch: sp.sfx ? 1 : 0.7, vol: 1.2 });
          b.cameraTraumaAt(c, 0.7);
          for (const e of b.enemiesOf(this)) {
            const d = e.pos.distanceTo(this.pos);
            if (d < sp.radius && e.alive && !e.hidden) {
              const height = b.stage.hasGround ? e.pos.y - b.stage.heightAt(e.pos.x, e.pos.z) : 0;
              // a giant's roar freezes anyone standing near it; flying high keeps you clear
              if (sp.stunFrames && height < (sp.stunHeight || 3) && !['ko', 'held'].includes(e.state)) {
                e.setState('stagger', { frames: sp.stunFrames, roared: true });
                e.vel.set(0, 0, 0);
                b.emit('roarStun', { fighter: e, by: this });
              } else e.takeHit(this, { type: 'explosion', damage: sp.damage || 0, knock: 'push', knockSpeed: sp.knockSpeed, hitstun: 22, impact: 2, dir: e.chest().sub(c).setY(0.2).normalize() });
            }
          }
          b.emit('bossRoar', { fighter: this });
        }
        if (f >= sp.frames) this.setState('free');
      },
    },
  });

  /* --- TAUNT: the boss stops to gloat. A free opening for anyone paying attention. --- */
  register('bossTaunt', {
    start(f, sp) {
      f.setState('bossTaunt', { spec: sp });
      f.anim.play(sp.poses.taunt, 10);
      if (sp.line) f.battle.bark(f, sp.line, true);
      f.battle.emit('bossTaunt', { fighter: f });
      return true;
    },
    states: {
      bossTaunt(it) {
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(4);
        if (this.stateFrame >= this.sd.spec.frames) this.setState('free');
      },
    },
  });

  /* ======================================================================
   * SPEED ORBIT — Burter's Blue Hurricane. He circles the target faster than
   * the eye follows and strikes from a different angle every pass, so blocking
   * "towards him" is useless and mashing into the blur is worse. The counter is
   * timing, not aim: guard as a pass lands and he bounces off into a long
   * stagger. Ends in recovery, which is when he is actually hittable.
   * ====================================================================== */
  /**
   * RETREAT VOLLEY — a spacing move (Jeice). He kicks off backwards out of the
   * range he does not want to fight in and fires on the way out, so closing him
   * down costs something. He keeps no armour while doing it: walk through the
   * shots, or catch the landing, and he pays for it.
   */
  /**
   * BODY CHANGE — Captain Ginyu's whole character. He opens his chest, shouts,
   * and fires a beam of light; if it reaches you, the two of you trade places.
   *
   * It is a real move rather than a cutscene: a long, loud telegraph (the arms
   * go out, the chest lights up, the scene dims), then one decisive frame. The
   * counter is to not be there for that frame — dodging, vanishing or getting
   * out of range all beat it. Guarding does not: you cannot block a mind. Miss,
   * and he is left wide open for a long time.
   *
   * On a hit the swap itself is battle.swapBodies (see battle.js), so control,
   * sides, party seats, names and the AI profile all move together and nothing
   * is left pointing at the wrong body.
   */
  /**
   * Who the Body Change beam actually reaches: the intended target, unless
   * somebody else is standing in the path (within sp.interceptRadius of the
   * line and closer to the caster). Dodging bodies are already out of it.
   */
  function pickAlongBeam(f, intended, sp) {
    if (!intended) return null;
    const r = sp.interceptRadius || 0;
    if (r <= 0) return intended;
    const from = f.chest();
    const to = intended.chest();
    const dir = to.clone().sub(from);
    const len = dir.length();
    if (len < 0.01) return intended;
    dir.divideScalar(len);
    let best = intended, bestT = len;
    for (const o of f.battle.fighters) {
      if (o === f || o === intended || !o.alive || o.hidden || o.untargetable) continue;
      if (o.tags && o.tags.noBodyChange) continue;
      if (o.state === 'dodge' || o.state === 'vanish' || o.invuln > 0) continue;
      const rel = o.chest().sub(from);
      const along = rel.dot(dir);
      if (along <= 0.5 || along >= bestT) continue;
      const off = rel.addScaledVector(dir, -along).length();
      if (off > r + o.radius) continue;
      best = o;
      bestT = along;
    }
    return best;
  }

  /**
   * DEATH SAUCERS — Frieza's final form throws spinning discs that follow you
   * instead of flying past. They cannot be guarded away: the answer is to keep
   * moving and to put something (or someone) between you and them.
   *
   * The canon detail is also the counterplay: a saucer that has been chasing for
   * sp.turnFrames stops caring whose side it is on, so leading one back over its
   * owner is a real tactic. That moment is announced (deathSaucerLoose).
   */
  register('deathSaucer', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || t.untargetable) {
        f._denied && f._denied();
        return false;
      }
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('deathSaucer', { spec: sp, victim: t, thrown: 0 });
      f.anim.play(sp.poses.wind, 12);
      f.battle.sfx('beamCharge', f, { vol: 0.7, pitch: 1.3 });
      f.battle.emit('deathSaucer', { fighter: f, victim: t });
      return true;
    },
    states: {
      deathSaucer(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.8);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(16);
        if (fr < sp.startup) {
          if (fr % 3 === 0) b.vfx.streamInward(this.handPos('R'), 1.6, sp.color || 0xffe066, 2, 0.1, 0.3);
          return;
        }
        const every = Math.max(4, sp.interval || 10);
        if (fr === sp.startup || (fr > sp.startup && (fr - sp.startup) % every === 0)) {
          if (sd.thrown < sp.count) {
            sd.thrown++;
            this.anim.play(sp.poses.throw, 18, { restart: true });
            const t = sd.victim && sd.victim.alive ? sd.victim : this.aimTarget();
            const from = this.handPos(sd.thrown % 2 ? 'R' : 'L');
            const dir = (t ? t.chest().sub(from) : this.forward.clone()).normalize();
            const disc = b.projectiles.spawnBlast(this, from, dir, {
              kind: 'disc', speed: sp.speed, radius: sp.radius, damage: sp.damage,
              color: sp.color || 0xffe066, core: 0xffffff,
              seek: sp.seek, seekTurn: sp.seekTurn, seekDelay: sp.seekDelay || 4, knock: 'heavy', knockSpeed: 22, hitstun: 26, impact: 3,
              explode: 2.4, life: sp.life,
            });
            if (t) disc.target = t;
            disc.loose = false;
            // the leash: after this frame the disc stops taking sides (projectiles.js)
            if (sp.turnFrames) disc.turnAt = b.frame + sp.turnFrames;
            b.sfx('kiBlastBig', this, { pitch: 1.4 });
          }
        }
        if (sd.thrown >= sp.count && fr >= sp.startup + every * sp.count) {
          this.setState('recover', { frames: sp.recovery });
        }
      },
    },
  });

  // the captain's poses belong to the captain's body: whoever is driving a different body
  // (Ginyu inside Goku's) performs the same technique with that body's nearest equivalents
  const bodyPose = (f, name, fallback) => (f.poses && f.poses[name]) || (SL.data.poses && SL.data.poses[name]) ? name : fallback;

  register('bodyChange', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || t.untargetable || (t.tags && t.tags.noBodyChange) || f.distTo(t) > sp.range) {
        f._denied && f._denied();
        return false;
      }
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('bodyChange', { spec: sp, victim: t, fired: false });
      f.anim.play(bodyPose(f, sp.poses.wind, 'powerCrouch'), 10);
      f.battle.sfx('beamCharge', f, { vol: 1 });
      f.battle.emit('bodyChangeStart', { fighter: f, victim: t });
      return true;
    },
    // committed: once he has opened up, hitting him does not stop it. The counter
    // is the beam itself, not his health bar.
    armor: { bodyChange: () => 3 },
    states: {
      bodyChange(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        let t = sd.victim; // the beam can end up taking somebody else (see pickAlongBeam)
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        if (!sd.fired) this.faceTarget(14);
        // the telegraph: he opens up and the light builds in his chest
        if (fr < sp.startup) {
          if (fr % 3 === 0) b.vfx.streamInward(this.chest(), 2.6, 0xe6d0ff, 3, 0.1, 0.35);
          if (fr === Math.floor(sp.startup * 0.4)) {
            this.anim.play(bodyPose(this, sp.poses.open, 'powerUp'), 12);
            b.stage.setMood && b.stage.setMood(0.7, 0x2a1a3a, 0.12);
          }
          return;
        }
        if (fr === sp.startup) {
          sd.fired = true;
          this.anim.play(bodyPose(this, sp.poses.fire, 'blastR'), 20, { restart: true });
          b.sfx('beamFire', this, { pitch: 1.1 });
          SL.ScreenFX.flash(0.5, '#e8d8ff');
          const from = this.chest();
          // the beam takes whoever it reaches first: step into the path of one
          // aimed at somebody else and it takes you instead (which is the only
          // way anybody has ever got a body back from him)
          const victim = pickAlongBeam(this, t, sp);
          if (victim && victim !== t) {
            b.emit('bodyChangeIntercepted', { fighter: this, intended: t, victim });
            t = victim;
            sd.victim = victim;
          }
          const reached = t && t.alive && !t.hidden && !t.untargetable && this.distTo(t) <= sp.range;
          // the one frame that matters: being somewhere else beats it
          const evaded = !reached || t.state === 'dodge' || t.state === 'vanish' || t.invuln > 0;
          if (!evaded) {
            // the beam itself: a line of light drawn from his chest to theirs
            const to = t.chest();
            for (let i = 0; i <= 12; i++) b.vfx.trail(from.clone().lerp(to, i / 12), 0xe6d0ff, 0.5, 0.35);
            b.vfx.flash(to, 3.2, 0xf0e4ff, 0.3, SL.Toon.tex.glow);
          }
          if (evaded) {
            b.emit('bodyChangeMissed', { fighter: this, victim: t, reason: !reached ? 'range' : t.state });
            b.stage.clearMood && b.stage.clearMood(0.5);
            this.setState('stagger', { frames: sp.failStagger || 90 });
            return;
          }
          // a story can take the moment over (b.deferBodyChange): the swap then happens inside its
          // cinematic, staged and explained, never silently in the middle of a fight — the owner's
          // first Body Change landed mid-air and he could not tell what had happened (playtest round 2)
          if (b.deferBodyChange && b.deferBodyChange(this, t)) {
            b.stage.clearMood && b.stage.clearMood(0.5);
            b.emit('bodyChangeDeferred', { fighter: this, victim: t });
            this.setState('recover', { frames: 20 });
            return;
          }
          const ok = b.swapBodies(this, t, { penalty: sp.penalty || 1, penalize: t });
          b.stage.clearMood && b.stage.clearMood(0.5);
          if (!ok) {
            b.emit('bodyChangeMissed', { fighter: this, victim: t, reason: 'blocked' });
            this.setState('stagger', { frames: sp.failStagger || 90 });
            return;
          }
          b.emit('bodyChanged', { ginyuBody: this, stolenBody: t });
          // both of them need a moment to work out what just happened
          this.setState('recover', { frames: sp.recovery });
          t.setState('recover', { frames: sp.recovery });
          return;
        }
        if (fr >= sp.startup + 2) this.setState('recover', { frames: sp.recovery });
      },
    },
    exits: {
      bodyChange(f) {
        if (f.battle.stage.clearMood) f.battle.stage.clearMood(0.5);
      },
    },
  });

  register('retreatVolley', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden) {
        f._denied && f._denied();
        return false;
      }
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      const away = f.pos.clone().sub(t.pos).setY(0);
      if (away.lengthSq() < 0.01) away.set(Math.sin(f.yaw + Math.PI), 0, Math.cos(f.yaw + Math.PI));
      away.normalize();
      f.setState('retreatVolley', { spec: sp, victim: t, away, shots: 0 });
      f.anim.play(sp.poses.wind, 8);
      f.battle.sfx('dash', f, { pitch: 1.15 });
      f.battle.emit('retreatVolley', { fighter: f, victim: t });
      return true;
    },
    states: {
      retreatVolley(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        // slide backwards over the whole window, keeping him pointed at the target
        const perFrame = sp.backDistance / Math.max(1, sp.frames);
        this.vel.copy(sd.away).multiplyScalar(perFrame * 60);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(16);
        if (fr % 4 === 0) b.vfx.trail(this.pos.clone().setY(this.pos.y + this.height * 0.5), (this.def.vfx && this.def.vfx.ghost) || 0xff5a5a, 0.5, 0.25);
        const due = Math.floor(fr / Math.max(1, sp.interval));
        if (fr > 0 && due > sd.shots && sd.shots < sp.shots) {
          sd.shots++;
          const t = sd.victim && sd.victim.alive && !sd.victim.hidden ? sd.victim : this.aimTarget();
          this.anim.play(sp.poses.fire, 18, { restart: true });
          const from = this.handPos(sd.shots % 2 ? 'R' : 'L');
          const dir = (t ? t.chest().sub(from) : new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw))).normalize();
          const pr = b.projectiles.spawnBlast(this, from, dir, {
            kind: 'blast', speed: sp.speed, radius: 0.3, damage: sp.damage,
            color: (this.def.blast && this.def.blast.color) || 0xff5a5a, core: 0xffe6e6,
            seek: 0.12, seekDelay: 6, knock: 'push', knockSpeed: 9, hitstun: 18, impact: 2, explode: 1.6, life: 2.6,
          });
          if (t) pr.target = t;
          b.sfx('kiBlast', this, { pitch: 1.2 });
        }
        if (fr >= sp.frames) {
          b.emit('retreatVolleyEnd', { fighter: this, shots: sd.shots });
          this.setState('recover', { frames: sp.recovery });
        }
      },
    },
  });

  register('speedOrbit', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || t.untargetable || f.distTo(t) > sp.range) {
        f._denied && f._denied();
        return false;
      }
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      const ang = Math.atan2(f.pos.x - t.pos.x, f.pos.z - t.pos.z);
      f.setState('speedOrbit', { spec: sp, victim: t, ang, hits: 0, dir: Math.random() < 0.5 ? 1 : -1 });
      f.anim.play(sp.poses.dash, 10);
      f.battle.sfx('dash', f, { pitch: 1.35 });
      f.battle.emit('speedOrbit', { fighter: f, victim: t });
      return true;
    },
    states: {
      speedOrbit(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle, t = sd.victim;
        if (!t || !t.alive || t.hidden) {
          this.setState('recover', { frames: sp.recovery });
          return;
        }
        // orbit the target; the angle keeps moving so every pass comes from somewhere new
        sd.ang += (sd.dir * (sp.speed / Math.max(2, sp.radius))) / 60;
        const c = t.pos;
        this.pos.set(c.x + Math.sin(sd.ang) * sp.radius, c.y + Math.sin(fr * 0.09) * 0.7, c.z + Math.cos(sd.ang) * sp.radius);
        this.prevPos.copy(this.pos);
        this.vel.set(0, 0, 0);
        this.grounded = false;
        this.faceTarget(100);
        if (b.frame % 2 === 0) b.vfx.afterimage(this.pos, this.height, (this.def.vfx && this.def.vfx.ghost) || 0x6fd0ff);
        if (fr > 0 && fr % sp.interval === 0) {
          // guarding as a pass lands is the counter: he bounces off himself
          if (t.state === 'guard') {
            b.vfx.ring(t.chest(), 3, 0xbfe6ff, 0.4);
            b.sfx('perfectGuard', t);
            b.cameraTraumaAt(t.chest(), 0.3);
            b.emit('speedOrbitBlocked', { fighter: this, by: t, hits: sd.hits });
            this.setState('stagger', { frames: sp.bounceStagger || 54 });
            return;
          }
          this.anim.play(sp.poses.strike, 22, { restart: true });
          b.sfx('punchLight', this, { pitch: 1.25 });
          t.takeHit(this, {
            type: 'melee', damage: sp.damage, knock: 'flinch', hitstun: 14, impact: 2,
            dir: t.chest().sub(this.chest()).setY(0).normalize(),
          });
          sd.hits++;
        }
        if (fr >= sp.frames) {
          b.emit('speedOrbitEnd', { fighter: this, hits: sd.hits });
          this.setState('recover', { frames: sp.recovery });
        }
      },
    },
  });

  /* ======================================================================
   * POSE — Recoome's whole identity. He stops mid-fight to strike a pose,
   * which is a real opening: he does nothing, he does not guard, and anything
   * that lands interrupts it. But if you are greedy somewhere else and let him
   * finish, he comes out of it hitting noticeably harder for a while.
   * Patience punishes him; impatience pays him.
   * ====================================================================== */
  register('bossPose', {
    start(f, sp, slot, cost) {
      if (slot && cost) payFromSlot(f, sp, slot, cost);
      f.setState('bossPose', { spec: sp });
      f.anim.play(sp.poses.pose, 8);
      if (sp.line) f.battle.bark(f, sp.line, true);
      f.battle.emit('bossPose', { fighter: f, frames: sp.frames });
      return true;
    },
    states: {
      bossPose(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.6);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(3);
        if (fr === 1) sd.taken0 = this.stats.damageTaken || 0;
        // a committed punish denies the pose; poking at an armored boss does not.
        // counts damage absorbed, not health lost, so it still works for a boss with infiniteHp
        const taken = (this.stats.damageTaken || 0) - (sd.taken0 || 0);
        if (sp.breakDamage && taken >= sp.breakDamage) {
          b.vfx.sparks(this.chest(), 0xffffff, 18, 10, 0.12);
          b.sfx('guardBreak', this, { pitch: 0.9 });
          b.emit('bossPoseBroken', { fighter: this, taken });
          this.setState('stagger', { frames: sp.breakStagger || 44 });
          return;
        }
        if (fr % 12 === 0) b.vfx.sparks(this.chest(), 0xfff0a0, 5, 5, 0.08);
        if (fr >= sp.frames) {
          // nobody stopped him: the pose pays off
          const prev = this.damageDealtMul === undefined ? 1 : this.damageDealtMul;
          this.damageDealtMul = prev * sp.damageBuff;
          let left = sp.buffFrames;
          b.onTick(() => {
            if (--left > 0 && this.alive) return true;
            this.damageDealtMul = prev;
            return false;
          });
          b.vfx.ring(this.chest(), 4, 0xfff0a0, 0.5);
          b.sfx('kiUp', this, { pitch: 0.8 });
          b.emit('bossPoseDone', { fighter: this, mul: sp.damageBuff, frames: sp.buffFrames });
          this.setState('free');
        }
      },
    },
  });

  /* ======================================================================
   * TIME FREEZE — Guldo's whole identity. He is weaker than everyone he
   * fights, so he stops time instead: while he holds his breath nobody else
   * can act at all (no mashing out of it — that is the point), the world goes
   * grey, and the moment he runs out of air he is wide open. Short window,
   * long recovery, and any hit that lands first cancels it.
   * ====================================================================== */
  register('timeFreeze', {
    start(f, sp, slot, cost) {
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      const victims = f.battle.enemiesOf(f).filter((e) => e.alive && !e.hidden && !e.untargetable && f.distTo(e) <= sp.range);
      f.setState('timeFreeze', { spec: sp, slot, victims, frozen: false });
      f.anim.play(sp.poses.hold, 10);
      f.battle.sfx('scouter', f, { pitch: 0.6 });
      return true;
    },
    states: {
      timeFreeze(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.5);
        if (this.grounded) this.vel.y = 0;
        // holding his breath: he cannot move while time is stopped
        if (fr === sp.startup) {
          sd.frozen = true;
          b.stage.setMood(0.55, 0x2a2a3a, 0.15);
          SL.ScreenFX.flash(0.35, '#d8d8f0');
          b.sfx('itPop', this, { pitch: 0.5 });
          b.emit('timeFreeze', { fighter: this, victims: sd.victims.length, frames: sp.holdFrames });
          for (const v of sd.victims) {
            if (!v.alive) continue;
            v.setState('held', { by: this, frames: sp.holdFrames + sp.startup, psychic: true, frozen: true });
            v.vel.set(0, 0, 0);
          }
        }
        if (sd.frozen) {
          for (const v of sd.victims) {
            if (!v.alive || v.state !== 'held') continue;
            v.vel.set(0, 0, 0);
            if (fr % 8 === 0) b.vfx.bolt(v.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(-0.3, 0.5), U.rand(-0.4, 0.4))), U.rand(0.2, 0.4), 0xc8c8e8);
          }
          if (!this.infiniteKi) this.ki -= sp.kiPerSecond / 60;
          if (fr % 10 === 0) b.vfx.ring(this.chest(), 1.6, 0xc8c8e8, 0.3);
        }
        // out of air, out of ki, or simply done: everything starts moving again
        if (sd.frozen && (fr >= sp.startup + sp.holdFrames || this.ki <= 0)) {
          SL.Techniques.timeFreeze.release(this, sd);
          this.setState('stagger', { frames: sp.recovery });
        }
      },
    },
    /** Time restarts: everyone is released and Guldo is gasping. */
    release(f, sd) {
      if (!sd.frozen) return;
      sd.frozen = false;
      const b = f.battle;
      b.stage.clearMood(0.4);
      b.sfx('itPop', f, { pitch: 1.2 });
      for (const v of sd.victims || []) {
        if (v.alive && v.state === 'held' && v.sd.by === f) v.setState('free');
      }
      b.emit('timeUnfreeze', { fighter: f });
    },
    exits: {
      timeFreeze(f, sd) {
        SL.Techniques.timeFreeze.release(f, sd);
      },
    },
  });

  /* ======================================================================
   * GOD BIND (Super Broly) — divine restraint: both palms out, a crimson
   * ring closes round ONE enemy in front of the user and holds him where he
   * is (no mashing out of it) while the user's ki drains. It ends when the
   * hold runs out, the ki does, the user is hit — or when something stronger
   * than the bind breaks it: SL.Techniques.godBind.shatter(f) breaks the ring
   * like glass (a story beat calls it). Only in the forms listed in sp.forms (checked here as well as by
   * Fighter.extraLock: Broly's mission hands it over on the Special 2 button).
   * ====================================================================== */
  register('godBind', {
    lockedReason(f, sp) {
      return sp.forms && !sp.forms.includes(f.form.id) ? 'Needs divine ki' : null;
    },
    start(f, sp, slot, cost) {
      if (sp.forms && !sp.forms.includes(f.form.id)) return false;
      const foes = f.battle.enemiesOf(f).filter((e) => e.alive && !e.hidden && !e.untargetable && f.distTo(e) <= sp.range);
      const victim = f.target && foes.includes(f.target) ? f.target : foes.sort((a, c) => f.distTo(a) - f.distTo(c))[0];
      if (!victim || !payFromSlot(f, sp, slot, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('godBind', { spec: sp, slot, victim, bound: false, rings: null });
      f.anim.play(sp.poses.hold, 10);
      f.battle.sfx('kiCharge', f, { pitch: 1.5, vol: 0.8 });
      return true;
    },
    states: {
      godBind() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, v = sd.victim;
        const b = this.battle;
        this.vel.multiplyScalar(0.5);
        if (this.grounded) this.vel.y = 0;
        if (v && v.alive) this.yaw = Math.atan2(v.pos.x - this.pos.x, v.pos.z - this.pos.z);
        if (fr === sp.startup && v && v.alive) {
          sd.bound = true;
          v.setState('held', { by: this, frames: sp.holdFrames + 10, psychic: true, frozen: true });
          v.vel.set(0, 0, 0);
          // two crimson rings round him, crossing: they turn while he is held
          const R = Math.max(0.6, v.height * 0.42);
          const mat = new THREE.MeshBasicMaterial({ color: sp.color || 0xff2a48, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
          const geo = new THREE.TorusGeometry(R, 0.045, 6, 48);
          const g = new THREE.Group();
          const a = new THREE.Mesh(geo, mat), c = new THREE.Mesh(geo, mat);
          a.rotation.x = Math.PI / 2;
          c.rotation.y = Math.PI / 2;
          g.add(a, c);
          b.scene.add(g);
          sd.rings = { g, a, c, geo, mat, R };
          b.vfx.ring(v.chest(), R * 2.2, sp.color || 0xff2a48, 0.35);
          b.sfx('itPop', v, { pitch: 0.6 });
          b.emit('godBind', { fighter: this, victim: v, frames: sp.holdFrames });
        }
        if (sd.bound) {
          if (v && v.alive && v.state === 'held') v.vel.set(0, 0, 0);
          const r = sd.rings;
          if (r && v) {
            r.g.position.copy(v.chest());
            r.a.rotation.z += 0.05;
            r.c.rotation.x += 0.04;
            r.mat.opacity = 0.7 + Math.sin(fr * 0.3) * 0.15;
          }
          if (fr % 9 === 0 && v) b.vfx.bolt(v.chest().add(new V3(U.rand(-0.5, 0.5), U.rand(-0.4, 0.6), U.rand(-0.5, 0.5))), U.rand(0.3, 0.6), sp.color || 0xff6a7a);
          if (!this.infiniteKi) this.ki -= sp.kiPerSecond / 60;
        }
        if (sd.bound && (fr >= sp.startup + sp.holdFrames || this.ki <= 0 || !v || !v.alive || v.state !== 'held')) {
          SL.Techniques.godBind.release(this, sd);
          this.setState('stagger', { frames: sp.recovery });
        }
      },
    },
    /** The ring opens (opts.shatter: it breaks like glass — something stronger than the bind). */
    release(f, sd, opts = {}) {
      if (!sd || !sd.bound) return;
      sd.bound = false;
      const b = f.battle, v = sd.victim;
      const r = sd.rings;
      if (r) {
        if (opts.shatter && SL.Dimension) SL.Dimension.cubes(b, r.g.position.clone(), { count: 26, spread: r.R, speed: 7, life: 40, size: 0.09, colors: [0xff2a48, 0xff8a9a, 0xffe0e6, 0x8a0a1a], drift: 10 });
        b.scene.remove(r.g);
        r.geo.dispose();
        r.mat.dispose();
        sd.rings = null;
      }
      if (v && v.alive && v.state === 'held' && v.sd.by === f) v.setState('free');
      b.sfx(opts.shatter ? 'warpShatter' : 'itPop', v || f, { pitch: opts.shatter ? 0.8 : 1.2 });
      b.emit(opts.shatter ? 'godBindBroken' : 'godBindEnd', { fighter: f, victim: v });
    },
    /** Something stronger than the bind: the ring breaks like glass and the user reels. */
    shatter(f) {
      if (f.state !== 'godBind') return false;
      SL.Techniques.godBind.release(f, f.sd, { shatter: true });
      f.setState('stagger', { frames: 36 });
      return true;
    },
    exits: {
      godBind(f, sd) {
        SL.Techniques.godBind.release(f, sd);
      },
    },
  });

  /* ======================================================================
   * DIVINE LASSO (Goku Black in Super Saiyan Rosé — Roadmap Three, the Goku Black arc research: DL-S01 to S04 and its
   * section 5, "Ultimate / Command Grab Super"). He pulls the open right hand back across his waist and a crescent of
   * dark magenta grows out of the side of the palm; the sweep breaks it into needles that cross the gap; if they reach
   * the target they hold him where he is, in the air or on the ground (no guard stops them — a command grab; a vanish,
   * a dodge or a fighter that cannot be grabbed does); Black turns half away and closes his fist and they burst: a
   * blast that smashes him down. The needles touch him; nothing goes through (the owner's non-graphic rule).
   * The crescent and the needles are shared with "Zero Mortals" (ft_zero), which stages the same beats.
   * ====================================================================== */
  const LASSO_SPOTS = [[0.19, 0.36], [-0.19, 0.36], [0.08, 0.26], [-0.07, 0.22], [0, 0.12], [0.11, 0.04], [-0.1, 0.02], [0.2, 0.2], [-0.2, 0.16]];

  /**
   * THE CRESCENT (M_Lasso_Crescent_Blade): a curved blade of light grown from the side of the right palm, its edge
   * flickering. set(k) grows it 0..1; follow(f) puts it on f's right hand (call it every tick); edge(n) gives points
   * along its edge in world space (where the needles break off); dispose().
   */
  function lassoCrescent(scene, color = 0xc23cff) {
    const shape = new THREE.Shape();
    const N = 26, a0 = (-100 * Math.PI) / 180, a1 = (100 * Math.PI) / 180;
    const c = -0.42, r = Math.hypot(Math.cos(a1) - c, Math.sin(a1)), phi = Math.atan2(Math.sin(a1), Math.cos(a1) - c);
    for (let i = 0; i <= N; i++) {
      const a = a0 + ((a1 - a0) * i) / N;
      if (i === 0) shape.moveTo(Math.cos(a), Math.sin(a));
      else shape.lineTo(Math.cos(a), Math.sin(a));
    }
    for (let i = 0; i <= N; i++) {
      const a = phi - (2 * phi * i) / N;
      shape.lineTo(c + Math.cos(a) * r, Math.sin(a) * r);
    }
    const geo = new THREE.ShapeGeometry(shape, 2);
    geo.translate(-Math.cos(a0), -Math.sin(a0), 0); // the lower tip at the palm
    // the blade blended over what is behind it (additive washed it to white against a bright sky), its pale core added
    const mat = (col, opacity, blending) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity, blending, depthWrite: false, side: THREE.DoubleSide });
    const outer = new THREE.Mesh(geo, mat(color, 0.85, THREE.NormalBlending));
    const core = new THREE.Mesh(geo, mat(0xffd8ff, 0.3, THREE.AdditiveBlending));
    core.scale.set(0.9, 0.96, 1);
    core.position.z = 0.01;
    const g = new THREE.Group();
    g.add(outer, core);
    g.visible = false;
    scene.add(g);
    let k = 0, n = 0, gone = false;
    return {
      group: g,
      set(v) {
        k = U.clamp01(v);
      },
      follow(f) {
        if (gone) return;
        n++;
        g.visible = k > 0.01 && !f.hidden;
        g.position.copy(f.handPos('R'));
        // the blade's plane faces the way he faces; it rises from the palm and curls out past his right side
        g.rotation.set(0, f.yaw, 0.55);
        const jit = 1 + Math.sin(n * 2.3) * 0.03 + Math.sin(n * 5.1) * 0.02;
        g.scale.set(-1.9 * k * jit, 1.9 * k * jit, 1);
        outer.material.opacity = 0.7 + Math.sin(n * 1.7) * 0.15;
      },
      edge(count) {
        g.updateMatrixWorld(true);
        const out = [];
        for (let i = 0; i < count; i++) {
          const a = a0 + ((a1 - a0) * (i + 0.5)) / count;
          out.push(new V3(Math.cos(a) - Math.cos(a0), Math.sin(a) - Math.sin(a0), 0).applyMatrix4(g.matrixWorld));
        }
        return out;
      },
      dispose() {
        if (gone) return;
        gone = true;
        scene.remove(g);
        geo.dispose();
        outer.material.dispose();
        core.material.dispose();
      },
    };
  }

  /**
   * THE NEEDLES (PS_Energy_Needles): thin shafts of violet light from the blade's edge (`from`), each flying to a point
   * on the target's chest, shoulders or stomach and stopping there, the shaft standing out toward `toward` (where they
   * came from). fly(k) 0..1 of the way; place() keeps them on him (call it every tick while they are in him); flare(k)
   * brightens them before the burst; tips(); dispose().
   */
  function lassoNeedles(scene, from, target, toward) {
    const geo = new THREE.CylinderGeometry(0.022, 0.006, 1, 6);
    geo.translate(0, -0.5, 0); // the tip at the origin, the shaft along -y
    // blended over the background like the blade (additive turned them pale pink against a bright sky)
    const mat = new THREE.MeshBasicMaterial({ color: 0xc040f0, transparent: true, opacity: 0.92, depthWrite: false });
    const fwd = toward.clone().sub(target.pos).setY(0);
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1);
    fwd.normalize();
    const side = new V3(fwd.z, 0, -fwd.x);
    const list = LASSO_SPOTS.map(([x, y], i) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(1, 1.15 + (i % 3) * 0.12, 1);
      scene.add(mesh);
      const spread = new V3(U.rand(-0.25, 0.25), U.rand(-0.2, 0.3), U.rand(-0.25, 0.25));
      return { mesh, x, y, start: from[i % from.length].clone(), spread, k: 0 };
    });
    const down = new V3(0, -1, 0);
    let gone = false;
    const place = () => {
      if (gone) return;
      const c = target.chest();
      for (const nd of list) {
        const tip = c.clone().addScaledVector(fwd, 0.14).addScaledVector(side, nd.x).add(new V3(0, nd.y, 0));
        nd.mesh.position.copy(nd.k < 1 ? nd.start.clone().lerp(tip, nd.k) : tip);
        nd.mesh.quaternion.setFromUnitVectors(down, fwd.clone().add(nd.spread).normalize()); // the shaft stands out toward him
      }
    };
    return {
      list,
      place,
      /** 0..1 of the way from the blade to him, each a little after the last. */
      fly(k) {
        list.forEach((nd, i) => (nd.k = U.clamp01(k * 1.5 - i * 0.06)));
        place();
      },
      flare(k) {
        mat.opacity = 0.9 + k * 0.1;
        mat.color.setHex(k > 0.5 ? 0xffd0ff : 0xc040f0);
        for (const nd of list) nd.mesh.scale.x = nd.mesh.scale.z = 1 + k * 2.2;
      },
      tips: () => list.map((nd) => nd.mesh.position.clone()),
      dispose() {
        if (gone) return;
        gone = true;
        for (const nd of list) scene.remove(nd.mesh);
        geo.dispose();
        mat.dispose();
      },
    };
  }

  register('divineLasso', {
    crescent: lassoCrescent,
    needles: lassoNeedles,
    lockedReason(f, sp) {
      return sp.forms && !sp.forms.includes(f.form.id) ? 'Needs Super Saiyan Rosé' : null;
    },
    start(f, sp, slot, cost) {
      if (sp.forms && !sp.forms.includes(f.form.id)) return false;
      const foes = f.battle.enemiesOf(f).filter((e) => e.alive && !e.hidden && !e.untargetable && f.distTo(e) <= sp.range);
      const victim = f.target && foes.includes(f.target) ? f.target : foes.sort((a, c) => f.distTo(a) - f.distTo(c))[0];
      if (!victim || !payFromSlot(f, sp, slot, cost)) return false;
      f.setState('divineLasso', { spec: sp, slot, victim, phase: 'wind', blade: lassoCrescent(f.battle.scene, sp.color), needles: null, flyAt: 0, lockAt: 0 });
      f.anim.play('gb_lassoW', 10);
      f.battle.sfx('kiCharge', f, { pitch: 1.3, vol: 0.8 });
      f.battle.emit('divineLasso', { fighter: f, victim, stage: 'start' });
      return true;
    },
    states: {
      divineLasso() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, v = sd.victim, b = this.battle;
        this.vel.multiplyScalar(0.5);
        if (this.grounded) this.vel.y = 0;
        if (v && v.alive && sd.phase !== 'hold') this.yaw = Math.atan2(v.pos.x - this.pos.x, v.pos.z - this.pos.z);
        // DL-S01: the crescent grows out of the palm
        if (sd.phase === 'wind') {
          sd.blade.set(U.easeOutCubic(Math.min(1, fr / (sp.windup * 0.7))));
          sd.blade.follow(this);
          if (fr % 7 === 0) b.vfx.sparks(this.handPos('R'), 0xe0a0ff, 4, 3, 0.05);
          if (fr === sp.windup - 6) this.anim.play('gb_sweepW', 30);
          if (fr < sp.windup) return;
          // DL-S02: the sweep, and the blade breaks into needles that cross the gap
          this.anim.play('gb_sweep', 34);
          b.sfx('swordSlash', this, { vol: 1.1 });
          sd.needles = lassoNeedles(b.scene, sd.blade.edge(LASSO_SPOTS.length), v, this.pos.clone());
          sd.blade.dispose();
          sd.blade = null;
          sd.phase = 'fly';
          sd.flyAt = fr;
          if (this.cine) this._cineEvent('release');
          return;
        }
        if (sd.phase === 'fly') {
          const k = Math.min(1, (fr - sd.flyAt) / sp.flight);
          sd.needles.fly(k);
          if (k < 1) return;
          // they arrive: the target held where he is — or nothing to hold
          const reach = v && v.alive && !v.hidden && !v.untargetable && this.distTo(v) <= sp.range * 1.3 && !UNGRABBABLE.includes(v.state);
          const res = reach ? v.takeHit(this, { type: 'ki', damage: sp.needleDamage * LASSO_SPOTS.length, knock: 'held', impact: 1, dir: this.dirTo(v), point: v.chest(), pose: 'needled', sfx: 'kiBlast', guardPierce: true, technique: sp.id }) : 'miss';
          if (res !== 'hit' || !v.alive) {
            sd.needles.dispose();
            sd.needles = null;
            b.emit('divineLasso', { fighter: this, victim: v, stage: 'miss', result: res });
            this.setState('recoverSpecial', { frames: sp.missRecovery || 40 });
            return;
          }
          // DL-S03: held where he is, the needles in his chest and shoulders
          v.setState('held', { by: this, frames: sp.holdFrames + 20, frozen: true });
          v.vel.set(0, 0, 0);
          v.anim.play('needled', 40, { restart: true });
          v.sd.expression = 'shout';
          if (v.model.setExpression) v.model.setExpression('shout');
          for (const p of sd.needles.tips()) b.vfx.flash(p, 0.3, 0xe8b8ff, 0.16, SL.Toon.tex.glow);
          b.cameraTraumaAt(v.chest(), 0.3);
          sd.phase = 'hold';
          sd.lockAt = fr;
          b.emit('divineLasso', { fighter: this, victim: v, stage: 'lock' });
          if (this.cine) this._cineEvent('connect');
          return;
        }
        // the hold: Black turns half away and closes his fist; the needles flare; the burst
        const h = fr - sd.lockAt;
        if (!v || !v.alive || v.state !== 'held' || v.sd.by !== this) {
          this.setState('recoverSpecial', { frames: sp.recovery });
          return;
        }
        v.vel.set(0, 0, 0);
        sd.needles.place();
        if (h === Math.round(sp.holdFrames * 0.4)) {
          this.anim.play('gb_lassoClose', 14);
          if (this.model.setExpression) this.model.setExpression('smirk');
          b.sfx('kiUp', v, { pitch: 1.4 });
        }
        if (h > sp.holdFrames - 14) sd.needles.flare((h - (sp.holdFrames - 14)) / 14);
        if (h < sp.holdFrames) return;
        // DL-S04: the detonation — smashed down
        const at = v.chest();
        sd.needles.dispose();
        sd.needles = null;
        v.setState('free');
        b.vfx.explosion(at, 1.8, sp.color || 0xc23cff, { smoke: true });
        b.vfx.ring(at, 7, 0xe070ff, 0.5);
        b.sfx('explosionBig', v, { vol: 1.1 });
        const dir = this.dirTo(v).setY(0).normalize().add(new V3(0, -0.5, 0)).normalize();
        v.takeHit(this, { type: 'explosion', damage: sp.damage, knock: 'smash', knockSpeed: sp.knockSpeed, hitstun: 60, impact: 5, dir, point: at, guardPierce: true, technique: sp.id });
        b.emit('divineLasso', { fighter: this, victim: v, stage: 'detonate' });
        if (this.cine) this._cineEvent('finish');
        this.setState('recoverSpecial', { frames: sp.recovery });
      },
    },
    exits: {
      // interrupted, finished or the battle torn down: nothing of it is left, and whoever it held goes free
      divineLasso(f, sd) {
        if (sd.blade) sd.blade.dispose();
        if (sd.needles) sd.needles.dispose();
        sd.blade = sd.needles = null;
        const v = sd.victim;
        if (v && v.alive && v.state === 'held' && v.sd.by === f) v.setState('free');
      },
    },
  });

  /* ======================================================================
   * THE DIVINE SCYTHE (Rosé Black; the Goku Black arc research CS-SCY-01 / SCY-S01 / CLN-S01 and its section 6:
   * "a mid-match stance ... wide-range spatial slashes and ... AI smoke clones"). The blade, the tear it leaves in the
   * air and the smoke clones' rule are shared by the story ("The Divine Scythe", ft_scythe) and the Free Battle
   * technique below. 2026-10-19.
   * ====================================================================== */

  /**
   * THE BLADE (the reference image): a shaft of pink-white light going on from the right fist along the line of the
   * arm, and at its top the Divine Lasso's crescent made large, hanging back down beside it, bowed out to his right
   * with its edge toward him; crimson smoke and pink bolts round it (pass `b` to follow for those). set(k) 0..1;
   * follow(f, b) every tick; tip(); dispose(). { shaft, blade } are the meshes.
   */
  function scytheBlade(scene, color = 0xc23cff) {
    const blade = lassoCrescent(scene, color);
    const shaftGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 8);
    shaftGeo.translate(0, 0.5, 0);
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0xf2b4ff, transparent: true, opacity: 0.92, depthWrite: false });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.visible = false;
    scene.add(shaft);
    const Y = new V3(0, 1, 0), M4 = new THREE.Matrix4(), tip = new V3(), s = new V3();
    let k = 0, n = 0, gone = false;
    return {
      shaft,
      blade: blade.group,
      set(v) {
        k = U.clamp01(v);
      },
      follow(f, b) {
        if (gone) return;
        n++;
        blade.set(k);
        blade.follow(f); // its visibility and flicker; the placing is the scythe's
        const h = f.handPos('R');
        s.copy(h).sub(f.chest());
        if (s.lengthSq() < 1e-4) s.set(0, 1, 0);
        s.normalize();
        const L = 3.4 * k * (f.scale || 1);
        shaft.visible = k > 0.01 && !f.hidden;
        shaft.position.copy(h).addScaledVector(s, -0.3 * k);
        shaft.quaternion.setFromUnitVectors(Y, s);
        shaft.scale.set(1, Math.max(0.01, L + 0.3 * k), 1);
        tip.copy(h).addScaledVector(s, L);
        const fw = f.forward;
        const X = new V3(-fw.z, 0, fw.x);
        X.addScaledVector(s, -X.dot(s));
        if (X.lengthSq() < 1e-4) X.copy(fw);
        X.normalize();
        const by = s.clone().negate(), bz = new V3().crossVectors(X, by).normalize();
        M4.makeBasis(X, by, bz);
        blade.group.position.copy(tip);
        blade.group.quaternion.setFromRotationMatrix(M4);
        const jit = 1 + Math.sin(n * 2.3) * 0.03;
        blade.group.scale.set(1.8 * k * jit * (f.scale || 1), 1.8 * k * jit * (f.scale || 1), 1);
        if (b && k > 0.3 && !f.hidden && n % 4 === 0) {
          b.vfx.dust(h.clone().addScaledVector(s, L * Math.random()), 0.35, 1, 0x5a0a1e);
          if (n % 12 === 0) b.vfx.bolt(tip.clone().addScaledVector(by, Math.random() * 3), 0.9, 0xff6ad0);
        }
      },
      tip: () => tip.clone(),
      dispose() {
        if (gone) return;
        gone = true;
        blade.dispose();
        scene.remove(shaft);
        shaftGeo.dispose();
        shaftMat.dispose();
      },
    };
  }

  /**
   * THE TEAR (CS-SCY-01: "a floating, jagged red-and-black crack in space"; CLN-S01: "a giant red rift"; the reference
   * image: a long band, red at its heart, pink-magenta haze round it): a ragged lens of black edged in red with a magenta
   * haze, turned to the lens about the vertical. set(k) open 0..1 at size(w, h); moveTo(p); face(camPos) every tick;
   * spill(b, count) dark mist out of it; k; dispose(). { group } is the mesh group.
   */
  function spaceTear(scene, centre) {
    const noise = (i) => {
      const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
      return x - Math.floor(x);
    };
    const shape = new THREE.Shape();
    const N = 26, top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const x = -1 + (2 * i) / N, env = Math.pow(Math.max(0, 1 - x * x), 0.7);
      top.push([x, env * (0.35 + 0.65 * (i % 2 ? noise(i) : 0.25 + noise(i) * 0.4))]);
      bot.push([x, -env * (0.35 + 0.65 * (i % 2 ? 0.25 + noise(i + 40) * 0.4 : noise(i + 40)))]);
    }
    shape.moveTo(top[0][0], top[0][1]);
    for (const [x, y] of top) shape.lineTo(x, y);
    for (let i = bot.length - 1; i >= 0; i--) shape.lineTo(bot[i][0], bot[i][1]);
    const geo = new THREE.ShapeGeometry(shape);
    const mk = (color, opacity, blending) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const core = new THREE.Mesh(geo, mk(0x0c0206, 0.94, THREE.NormalBlending));
    const edge = new THREE.Mesh(geo, mk(0xff1e3c, 0.9, THREE.AdditiveBlending));
    const haze = new THREE.Mesh(geo, mk(0xff3aa8, 0.32, THREE.AdditiveBlending));
    edge.scale.set(1.04, 1.28, 1);
    edge.position.z = -0.02;
    haze.scale.set(1.12, 2.2, 1);
    haze.position.z = -0.04;
    core.renderOrder = 3;
    const g = new THREE.Group();
    g.add(haze, edge, core);
    g.position.copy(centre);
    g.visible = false;
    scene.add(g);
    let k = 0, W = 4, H = 0.9, n = 0, gone = false;
    const api = {
      group: g,
      get k() {
        return k;
      },
      set(v) {
        k = U.clamp01(v);
      },
      size(w, h) {
        W = w;
        H = h;
      },
      moveTo(p) {
        g.position.copy(p);
      },
      face(c) {
        if (gone) return;
        n++;
        g.visible = k > 0.01;
        if (!g.visible) return;
        g.rotation.set(0, Math.atan2(c.x - g.position.x, c.z - g.position.z), 0);
        const pulse = 1 + Math.sin(n * 0.21) * 0.04;
        g.scale.set(W * k, H * (0.25 + 0.75 * k) * pulse, 1);
        edge.material.opacity = 0.75 + Math.sin(n * 0.37) * 0.15;
      },
      /** dark, gas-like mist spilling out of it (CS-SCY-01) */
      spill(b, count = 3) {
        if (k < 0.05) return;
        const along = new V3(Math.cos(g.rotation.y), 0, -Math.sin(g.rotation.y));
        for (let i = 0; i < count; i++) b.vfx.dust(g.position.clone().addScaledVector(along, U.rand(-0.8, 0.8) * W * k).add(new V3(0, U.rand(-0.3, 0.1) * H, 0)), U.rand(0.8, 1.6), 2, 0x1e1424);
      },
      dispose() {
        if (gone) return;
        gone = true;
        scene.remove(g);
        geo.dispose();
        for (const o of [core, edge, haze]) o.material.dispose();
      },
    };
    return api;
  }

  const SMOKE = 0x1e1424, SILVER = 0xe4ecff;
  /** A clone's eyes: hollow silver light (CS-SCY-01) — the pupils gone; flash: a glint on the face. */
  function silverEyes(b, c, flash) {
    if (c.model && c.model.setPupilScale) c.model.setPupilScale(0.04);
    if (flash && SL.data.brolyKit && SL.data.brolyKit.facePoint) {
      const F = SL.data.brolyKit.facePoint(c);
      b.vfx.flash(F.center.clone().addScaledVector(F.fwd, F.R * 0.9), 0.35, SILVER, 0.25, SL.Toon.tex.glow);
    }
  }
  /** Dark mist where a clone forms or comes apart. */
  function cloneSmoke(b, f, big) {
    b.vfx.dust(f.chest(), big ? 1.6 : 1.1, big ? 18 : 12, SMOKE);
    const g = f.pos.clone();
    if (b.stage.hasGround) g.y = b.stage.heightAt(g.x, g.z);
    b.vfx.dust(g, 1, 8, SMOKE);
  }

  /**
   * THE SMOKE CLONES' RULE (CS-SCY-01: "whenever Goku or Vegeta punches a clone, it dissipates into dark smoke,
   * instantly reforming behind them to strike again"): a clone struck by a striker (opts.isStriker(attacker); default
   * anybody on another team) comes apart into dark smoke and violet sparks and, opts.reform frames later (24), stands
   * again 1.7 m behind whoever struck it, facing him, and strikes (a heavy, then its own controller again). Never while
   * it is someone's rush victim (held): it comes apart when the rush lets it go. opts.quiet: no effects (a skipped
   * scene). Emits 'swarmReform' { clone, by }. Returns { off(), dissolved, reformed }; off() stands anything still in
   * smoke back up where it came apart and gives every clone its own controller back.
   */
  function smokeSwarm(b, clones, opts = {}) {
    const reformAfter = opts.reform || 24;
    const isStriker = opts.isStriker || ((a, c) => a && a.team !== c.team);
    const quiet = opts.quiet || (() => false);
    const st = new Map(), out = { dissolved: 0, reformed: 0 };
    const ais = new Map(clones.map((c) => [c, c.controller]));
    const scripted = { update: () => SL.emptyIntent() };
    const offD = b.on('damage', (e) => {
      const c = e.target;
      if (!clones.includes(c) || st.has(c) || !isStriker(e.attacker, c)) return;
      st.set(c, { by: e.attacker, n: -1 });
    });
    const dissolve = (c) => {
      if (!quiet()) {
        cloneSmoke(b, c, true);
        b.vfx.sparks(c.chest(), 0xc070ff, 10, 6, 0.1); // the Rosé light going out of it
        b.sfx('vanish', c, { vol: 0.8, pitch: 0.7 });
      }
      c.setState('scripted', { pose: 'idle', expression: 'calm' });
      c.vel.set(0, 0, 0);
      c.untargetable = c.intangible = true;
      c.setHidden(true);
      c.controller = scripted;
      for (const f of b.fighters) if (f.target === c) f.target = null;
      out.dissolved++;
    };
    const reform = (c, by) => {
      const back = by.forward.clone().setY(0).normalize().negate();
      const p = by.pos.clone().addScaledVector(back, 1.7);
      if (by.grounded && b.stage.hasGround) p.y = b.stage.heightAt(p.x, p.z);
      c.setPosition(p);
      c.grounded = by.grounded;
      c.yaw = c.prevYaw = Math.atan2(by.pos.x - c.pos.x, by.pos.z - c.pos.z);
      c.hp = c.hpMax;
      c.setHidden(false);
      c.untargetable = c.intangible = false;
      c.setState('free');
      c.target = by;
      silverEyes(b, c, !quiet());
      if (!quiet()) {
        cloneSmoke(b, c, false);
        b.sfx('teleport', c, { vol: 0.7, pitch: 0.8 });
      }
      // and it strikes again: a heavy blow out of the smoke, then its own controller
      const ai = ais.get(c);
      let f = 0;
      c.controller = {
        update: () => {
          const it = SL.emptyIntent();
          if (++f === 2) it.heavy = true;
          if (f >= 10) c.controller = ai;
          return it;
        },
      };
      out.reformed++;
      b.emit('swarmReform', { clone: c, by });
    };
    let done = false;
    b.onTick(() => {
      if (done || b.disposed) return false;
      for (const [c, s] of st) {
        if (s.n < 0) {
          if (c.state === 'held') continue;
          dissolve(c);
          s.n = reformAfter;
        } else if (--s.n <= 0) {
          st.delete(c);
          reform(c, s.by);
        }
      }
      // the mist they are made of trails off them
      if (b.frame % 18 === 0 && !quiet()) for (const c of clones) if (!c.hidden) b.vfx.dust(c.chest().add(new V3(0, -0.4, 0)), 0.5, 1, SMOKE);
      return true;
    });
    out.off = () => {
      if (done) return;
      done = true;
      offD();
      for (const [c] of st) {
        c.setHidden(false);
        c.untargetable = c.intangible = false;
        c.hp = c.hpMax;
      }
      st.clear();
      for (const [c, ai] of ais) c.controller = ai;
    };
    return out;
  }

  /**
   * THE FREE BATTLE TECHNIQUE (Rosé only, after "The Divine Scythe"): the hand drawn into the chest and the scythe
   * grown out of it (no armour: a hit stops it); the horizontal swing that cuts the air in front of him — anything in
   * its arc is struck; the tear it leaves hanging there spills dark mist that becomes `clones` smoke clones of him (his
   * team, his AI, silver-eyed, dealing `cloneDealt` of his damage), which hunt his target for `cloneSeconds` and come
   * apart and re-form behind whoever strikes them; then they go back into smoke and the tear closes. They go the moment
   * he is out of it (knocked out, or anybody is: they never keep a finished fight going). The player's move only.
   */
  function scytheSummon(b, f, sp, tear) {
    const v = f.target;
    const rose = f.def.forms.findIndex((x) => x.id === 'rose');
    const clones = [];
    for (let i = 0; i < sp.clones; i++) {
      const side = i % 2 ? 1 : -1, fw = f.forward.clone().setY(0).normalize(), sd = new V3(fw.z, 0, -fw.x);
      const p = tear.group.position.clone().addScaledVector(sd, side * (1.6 + i)).add(new V3(0, -1.2, 0));
      if (b.stage.hasGround) p.y = Math.max(b.stage.heightAt(p.x, p.z), p.y - 2);
      const c = b.spawn({ charId: f.def.id, team: f.team, pos: p, form: rose > 0 ? rose : undefined, startKi: 0, cannotDie: true, difficulty: 'normal' });
      c.isClone = true;
      c.summonedBy = f;
      c.damageDealtMul = sp.cloneDealt;
      c.controller = new SL.AIController(b, { difficulty: 'normal', profile: Object.assign({}, c.def.ai, c.form.ai || {}, { aggression: 0.85, transformHp: 0 }) });
      c.target = v && v.alive ? v : null;
      silverEyes(b, c, true);
      cloneSmoke(b, c, true);
      clones.push(c);
    }
    const rule = smokeSwarm(b, clones, { reform: sp.reform });
    let life = Math.round(sp.cloneSeconds * 60), ended = false, removed = false;
    // a knockout anywhere ends them at once: they must never count for his team when the fight is decided
    const end = () => {
      if (ended) return;
      ended = true;
      rule.off();
      for (const c of clones) {
        c.alive = false;
        if (!c.hidden) cloneSmoke(b, c, true);
        c.setHidden(true);
      }
      // out of the fight on the next tick (from this tick handler: a b.after() added inside one is lost)
      b.emit('scytheClones', { fighter: f, stage: 'end' });
    };
    const offKO = b.on('ko', () => end());
    b.onTick(() => {
      if (b.disposed) return false;
      tear.face(b.camera.pos);
      if (!ended && b.frame % 3 === 0) tear.spill(b, 1);
      if (!ended && (--life <= 0 || !f.alive || f.hidden)) end();
      if (ended && !removed) {
        removed = true;
        for (const c of clones) if (b.fighters.includes(c)) b.remove(c);
      }
      if (ended) {
        tear.set(tear.k - 1 / 30);
        if (tear.k <= 0) {
          tear.dispose();
          offKO();
          return false;
        }
      }
      return true;
    });
    b.emit('scytheClones', { fighter: f, stage: 'start', clones });
    return clones;
  }

  register('divineScythe', {
    blade: scytheBlade,
    tear: spaceTear,
    swarm: smokeSwarm,
    silverEyes,
    smoke: cloneSmoke,
    lockedReason(f, sp) {
      return sp.forms && !sp.forms.includes(f.form.id) ? 'Needs Super Saiyan Rosé' : null;
    },
    start(f, sp, slot, cost) {
      if (sp.forms && !sp.forms.includes(f.form.id)) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.setState('divineScythe', { spec: sp, phase: 'wind', blade: scytheBlade(f.battle.scene, sp.color), tear: null });
      f.anim.play('gb_scytheDraw', 12);
      f.battle.sfx('kiCharge', f, { pitch: 0.9, vol: 0.9 });
      f.battle.emit('divineScythe', { fighter: f, stage: 'start' });
      return true;
    },
    states: {
      divineScythe() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, b = this.battle, t = this.target;
        this.vel.multiplyScalar(0.5);
        if (this.grounded) this.vel.y = 0;
        if (t && t.alive && sd.phase === 'wind') this.yaw = Math.atan2(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
        if (sd.blade) sd.blade.follow(this, b);
        if (sd.phase === 'wind') {
          sd.blade.set(U.easeOutCubic(Math.min(1, fr / (sp.windup * 0.6))));
          if (fr === Math.round(sp.windup * 0.4)) {
            this.anim.play('gb_scytheHold', 10);
            b.sfx('swordDraw', this, { vol: 1, pitch: 0.7 });
          }
          if (fr === sp.windup - 8) this.anim.play('gb_sweepW', 24);
          if (fr < sp.windup) return;
          // the swing: across the air in front of him — whatever is in the arc is cut
          this.anim.play('gb_sweep', 34);
          b.sfx('swordSlash', this, { vol: 1.3, pitch: 0.6 });
          b.sfx('swordClang', this, { vol: 0.8, pitch: 0.7 });
          const fw = this.forward.clone().setY(0).normalize(), S = this.scale || 1;
          const sd2 = new V3(fw.z, 0, -fw.x), c = this.chest().add(new V3(0, 0.6 * S, 0));
          b.vfx.slash(c.clone().addScaledVector(sd2, sp.reach * 0.7 * S).addScaledVector(fw, sp.reach * 0.5 * S), c.clone().addScaledVector(sd2, -sp.reach * 0.7 * S).addScaledVector(fw, sp.reach * 0.5 * S), 0xff7ad8, 0.35, 0.16 * S);
          b.cameraTraumaAt(c, 0.35);
          const cos = Math.cos(((sp.arc / 2) * Math.PI) / 180);
          for (const e of b.enemiesOf(this)) {
            if (!e.alive || e.hidden || e.untargetable) continue;
            const d = e.pos.clone().sub(this.pos);
            const dy = d.y;
            d.y = 0;
            const dist = d.length();
            if (dist > sp.reach * S + e.radius || Math.abs(dy) > 3 * S || (dist > 0.01 && d.normalize().dot(fw) < cos)) continue;
            e.takeHit(this, { type: 'melee', damage: sp.damage, knock: 'heavy', knockSpeed: sp.knockSpeed, hitstun: 40, impact: 4, dir: d.lengthSq() ? d : fw.clone(), point: e.chest(), sfx: 'swordSlash', technique: sp.id });
          }
          // the cut stays in the air: a floating crack where the blade went
          sd.tear = spaceTear(b.scene, this.pos.clone().addScaledVector(fw, 3 * S).add(new V3(0, 2.6 * S, 0)));
          sd.tear.size(5 * S, 0.9 * S);
          b.sfx('portalOpen', this, { vol: 1, pitch: 0.8 });
          sd.phase = 'tear';
          sd.tearAt = fr;
          if (this.cine) this._cineEvent('release');
          return;
        }
        if (sd.phase === 'tear') {
          const k = Math.min(1, (fr - sd.tearAt) / 24);
          sd.tear.set(k);
          sd.tear.face(b.camera.pos);
          if (fr % 3 === 0) sd.tear.spill(b, 3);
          if (sd.blade && fr - sd.tearAt > 8) {
            sd.blade.dispose();
            sd.blade = null;
          }
          if (k < 1) return;
          // the mist condenses into the clones
          const tear = sd.tear;
          sd.tear = null;
          scytheSummon(b, this, sp, tear);
          b.sfx('teleport', this, { vol: 0.9, pitch: 0.6 });
          if (this.cine) this._cineEvent('finish');
          this.setState('recoverSpecial', { frames: sp.recovery });
        }
      },
    },
    exits: {
      // interrupted before the clones: nothing of it is left
      divineScythe(f, sd) {
        if (sd.blade) sd.blade.dispose();
        if (sd.tear) sd.tear.dispose();
        sd.blade = sd.tear = null;
      },
    },
  });

  /* ======================================================================
   * THE MAFUBA (Future Trunks; the Goku Black arc research CS-MAF-01 / MAF-S01 and its section 6: "an interactive
   * quick-time event or ultimate counter move ... If executed successfully, it ... drains stamina, triggering a
   * high-damage sealing cutscene"). The jar and the vortex are shared by the story ("The Divine Scythe", ft_scythe) and
   * the Free Battle technique below. 2026-10-19.
   * ====================================================================== */
  const MF_GREEN = 0x5aff8a, MF_PALE = 0xd8ffe0, MF_CLAY = 0xa8603a, MF_CLAY_DARK = 0x7a4228;

  /**
   * THE JAR (CS-MAF-01): a small clay jar with a narrow neck and its lid. place(at, lidAside); mouth() the neck's
   * opening; lidOn(on); shake(k) a tremble; tick() every frame; burst(b, quiet) — gone in shards; dispose().
   * { group, lid } are the meshes.
   */
  function mafubaJar(scene) {
    const prof = [[0.001, 0], [0.12, 0], [0.17, 0.06], [0.2, 0.17], [0.18, 0.27], [0.12, 0.34], [0.075, 0.39], [0.075, 0.42], [0.096, 0.44], [0.084, 0.452], [0.062, 0.43]];
    const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 22);
    const lidGeo = new THREE.CylinderGeometry(0.1, 0.104, 0.03, 18);
    const knobGeo = new THREE.SphereGeometry(0.026, 10, 8);
    const g = new THREE.Group();
    const body = new THREE.Mesh(geo, SL.Toon.mat(MF_CLAY, { side: THREE.DoubleSide }));
    SL.Toon.addOutline(body, 1);
    const lid = new THREE.Group();
    const lidM = new THREE.Mesh(lidGeo, SL.Toon.mat(MF_CLAY_DARK));
    SL.Toon.addOutline(lidM, 1);
    const knob = new THREE.Mesh(knobGeo, SL.Toon.mat(MF_CLAY_DARK));
    knob.position.y = 0.03;
    lid.add(lidM, knob);
    g.add(body);
    scene.add(g, lid);
    g.visible = lid.visible = false;
    const home = new V3(), aside = new V3();
    let shaking = 0, gone = false, n = 0;
    return {
      group: g,
      lid,
      tick() {
        if (gone || !g.visible) return;
        n++;
        const s = shaking * 0.12;
        g.rotation.set(Math.sin(n * 1.9) * s, 0, Math.cos(n * 2.3) * s);
        g.position.copy(home).add(new V3(Math.sin(n * 3.1) * s * 0.06, 0, Math.cos(n * 2.7) * s * 0.06));
      },
      place(p, lidAt) {
        home.copy(p);
        aside.copy(lidAt);
        g.position.copy(p);
        lid.position.copy(lidAt);
        lid.rotation.set(0, 0, 0);
        g.visible = lid.visible = true;
      },
      mouth: () => home.clone().add(new V3(0, 0.45, 0)),
      lidOn(on) {
        lid.position.copy(on ? home.clone().add(new V3(0, 0.455, 0)) : aside);
      },
      shake(k) {
        shaking = k;
        if (lid.position.distanceTo(aside) > 0.01) lid.position.copy(home).add(new V3(Math.sin(n * 2.9) * k * 0.01, 0.455 + Math.abs(Math.sin(n * 1.7)) * k * 0.025, 0));
      },
      burst(b, quiet) {
        if (!g.visible) return;
        const c = home.clone().add(new V3(0, 0.22, 0));
        g.visible = lid.visible = false;
        if (quiet) return;
        for (let i = 0; i < 14; i++) b.vfx.rock(c, new V3(U.rand(-1, 1), U.rand(0.4, 1.4), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(4, 9)), U.rand(0.05, 0.11), i % 3 ? MF_CLAY : MF_CLAY_DARK);
      },
      dispose() {
        if (gone) return;
        gone = true;
        scene.remove(g, lid);
        geo.dispose();
        lidGeo.dispose();
        knobGeo.dispose();
      },
    };
  }

  /**
   * THE WIND (CS-MAF-01): open arcs of green light turning round an axis and flowing from its wide end to its narrow
   * one — a tornado from Trunks' hands out to the one it takes, later a funnel down into the jar's neck.
   * span(narrow, wide, rNarrow, rWide); set(k) how much of it there is; tick(b, quiet) every frame; k; dispose().
   * { group } is the mesh group.
   */
  function mafubaVortex(scene) {
    const g = new THREE.Group();
    const rings = [];
    const N = 14;
    for (let i = 0; i < N; i++) {
      const geo = new THREE.TorusGeometry(1, 0.05, 5, 32, Math.PI * (0.9 + (i % 3) * 0.3));
      const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 1 ? MF_PALE : MF_GREEN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const mesh = new THREE.Mesh(geo, mat);
      g.add(mesh);
      rings.push({ mesh, phase: i / N, spin: (i % 2 ? 1 : -1) * (0.16 + i * 0.015), roll: i * 0.9 });
    }
    scene.add(g);
    let k = 0, n = 0, rA = 0.3, rB = 2, gone = false;
    const A = new V3(), B = new V3(), Z = new V3(0, 0, 1), q = new THREE.Quaternion();
    return {
      group: g,
      span(narrow, wide, rn, rw) {
        A.copy(narrow);
        B.copy(wide);
        rA = rn;
        rB = rw;
      },
      set(v) {
        k = U.clamp01(v);
      },
      get k() {
        return k;
      },
      tick(b, quiet) {
        if (gone) return;
        n++;
        const axis = B.clone().sub(A);
        const L = axis.length();
        if (L < 1e-3) return;
        axis.normalize();
        q.setFromUnitVectors(Z, axis);
        for (const R of rings) {
          const t = 1 - ((R.phase + n * 0.014) % 1); // from the wide end in to the narrow one: drawn in
          R.mesh.position.copy(A).addScaledVector(axis, L * t);
          R.mesh.quaternion.copy(q);
          R.mesh.rotateZ(R.roll + n * R.spin);
          R.mesh.scale.setScalar(U.lerp(rA, rB, t));
          R.mesh.material.opacity = k * 0.8 * Math.sin(Math.max(0.05, t) * Math.PI);
        }
        if (b && k > 0.2 && n % 2 === 0 && !quiet) {
          const t = Math.random(), a = Math.random() * Math.PI * 2, r = U.lerp(rA, rB, t);
          const u = new V3(1, 0, 0).applyQuaternion(q), w = new V3(0, 1, 0).applyQuaternion(q);
          b.vfx.trail(A.clone().addScaledVector(axis, L * t).addScaledVector(u, Math.cos(a) * r).addScaledVector(w, Math.sin(a) * r), MF_GREEN, 0.3, 0.3);
        }
      },
      dispose() {
        if (gone) return;
        gone = true;
        scene.remove(g);
        for (const R of rings) {
          R.mesh.geometry.dispose();
          R.mesh.material.dispose();
        }
      },
    };
  }

  /** A body's model at k of its own size (the jar takes him in; 1 gives his size back). */
  function bodySize(f, k) {
    const md = f.model;
    if (!md || !md.root) return;
    md.root.scale.setScalar((md.baseScale || 1) * (f.form && f.form.look && f.form.look.scale ? f.form.look.scale : 1) * k);
  }

  /**
   * THE FREE BATTLE TECHNIQUE (Future Trunks, any form, after "The Divine Scythe"): the jar set down a pace in front
   * (no armour: a hit before the catch stops it, nothing left); the stance, the green wind round him; the lasso out to
   * the target in reach — a guard does not stop it, a dodge or vanish does, nobody is caught out of reach; then the
   * quick-time part: the one caught is dragged spinning through the tornado toward the jar, slowly on its own and
   * faster with every Light the player presses (the meter is the struggle HUD); the funnel into the neck; sealed, the
   * lid on, the jar shaking — and, as in the story, there is no talisman: it bursts in a green blast and he comes out
   * of it hurt, his ki and most of his stamina gone (the PDF's "drains stamina"; this game has no tag-swaps to lock).
   * The player's move only (the AI picks wheel rushes, not this).
   */
  register('mafuba', {
    jar: mafubaJar,
    vortex: mafubaVortex,
    start(f, sp, slot, cost) {
      const foes = f.battle.enemiesOf(f).filter((e) => e.alive && !e.hidden && !e.untargetable && f.distTo(e) <= sp.range);
      const victim = f.target && foes.includes(f.target) ? f.target : foes.sort((a, c) => f.distTo(a) - f.distTo(c))[0];
      if (!victim || !payFromSlot(f, sp, slot, cost)) return false;
      const b = f.battle, fw = f.forward.clone().setY(0).normalize();
      const jar = mafubaJar(b.scene);
      const at = f.pos.clone().addScaledVector(fw, 1.5 * (f.scale || 1));
      if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
      const aside = at.clone().addScaledVector(new V3(fw.z, 0, -fw.x), 0.45);
      jar.place(at, aside);
      f.setState('mafuba', { spec: sp, victim, phase: 'set', jar, vortex: null, pull: 0, prevLight: false, presses: 0, at: 0, from: null });
      f.anim.play('ft_lid', 12);
      b.sfx('block', f, { vol: 0.5, pitch: 1.4 });
      b.emit('mafuba', { fighter: f, victim, stage: 'start' });
      return true;
    },
    states: {
      mafuba() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, b = this.battle, v = sd.victim;
        this.vel.multiplyScalar(0.5);
        if (this.grounded) this.vel.y = 0;
        if (v && v.alive && (sd.phase === 'set' || sd.phase === 'stance')) this.yaw = Math.atan2(v.pos.x - this.pos.x, v.pos.z - this.pos.z);
        sd.jar.tick();
        if (sd.vortex) sd.vortex.tick(b);
        const hands = this.handPos('L').lerp(this.handPos('R'), 0.5);
        const fw = this.forward.clone().setY(0).normalize();
        if (sd.phase === 'set') {
          if (fr < sp.setFrames) return;
          this.anim.play('ft_mafuba', 16);
          sd.vortex = mafubaVortex(b.scene);
          sd.vortex.span(hands, hands.clone().addScaledVector(fw, 0.3), 0.2, 0.3);
          b.sfx('kiUp', this, { vol: 1 });
          b.sfx('steam', this, { vol: 0.6, pitch: 0.6 });
          sd.phase = 'stance';
          sd.at = fr;
          if (this.cine) this._cineEvent('release');
          return;
        }
        if (sd.phase === 'stance') {
          const k = (fr - sd.at) / sp.stanceFrames;
          sd.vortex.set(0.3 + 0.4 * k);
          if (fr % 5 === 0) b.vfx.ring(this.pos.clone().add(new V3(0, 0.25 + ((fr / 5) % 4) * 0.2, 0)), 2 + k, MF_GREEN, 0.4, new V3(0, 1, 0));
          if (k < 1) return;
          // the lasso out to him: nobody out of reach, no dodge or vanish caught; a guard does not stop it
          const reach = v && v.alive && !v.hidden && !v.untargetable && this.distTo(v) <= sp.range * 1.2 && !UNGRABBABLE.includes(v.state);
          const res = reach ? v.takeHit(this, { type: 'ki', damage: sp.catchDamage, knock: 'held', impact: 1, dir: this.dirTo(v), point: v.chest(), guardPierce: true, technique: sp.id }) : 'miss';
          if (res !== 'hit' || !v.alive) {
            b.emit('mafuba', { fighter: this, victim: v, stage: 'miss', result: res });
            this.setState('recoverSpecial', { frames: sp.missRecovery || 40 });
            return;
          }
          v.setState('held', { by: this, frames: 9999, frozen: true });
          v.vel.set(0, 0, 0);
          v.anim.play('vortexBound', 30, { restart: true });
          sd.from = v.pos.clone();
          sd.phase = 'pull';
          sd.at = fr;
          b.sfx('drain', v, { vol: 0.9, pitch: 0.7 });
          b.vfx.flash(v.chest(), 2.2, MF_GREEN, 0.25, SL.Toon.tex.glow);
          b.emit('mafuba', { fighter: this, victim: v, stage: 'lock' });
          if (this.cine) this._cineEvent('connect');
          return;
        }
        const held = v && v.alive && v.state === 'held' && v.sd.by === this;
        if (!held) {
          this.setState('recoverSpecial', { frames: sp.recovery });
          return;
        }
        v.vel.set(0, 0, 0);
        const above = sd.jar.mouth().add(new V3(0, 1.6, 0));
        if (sd.phase === 'pull') {
          // the quick-time part: Light presses (the player's) drive it faster; on its own it still gets there
          const down = !!(this.intent && this.intent.light);
          if (down && !sd.prevLight) {
            sd.presses++;
            sd.pull += sp.pullPress;
          }
          sd.prevLight = down;
          sd.pull = Math.min(1, sd.pull + 1 / sp.pullFrames);
          const k = U.easeInOutCubic(sd.pull), a = sd.pull * Math.PI * 5, side = new V3(fw.z, 0, -fw.x);
          v.setPosition(sd.from.clone().lerp(above, k).addScaledVector(side, Math.cos(a) * 0.8 * (1 - k)).add(new V3(0, Math.sin(a) * 0.5 * (1 - k), 0)));
          v.grounded = false;
          v.yaw = v.prevYaw = v.yaw + 0.35;
          sd.vortex.set(1);
          sd.vortex.span(hands, v.chest(), 0.4, U.lerp(3.2, 1.6, k));
          if (this.isPlayer) b.emit('struggle', { active: true, progress: 1 - sd.pull, rate: sd.presses, label: 'MAFUBA — mash Light!', action: 'light' });
          if (sd.pull < 1) return;
          if (this.isPlayer) b.emit('struggle', { active: false });
          this.anim.play('ft_mafubaDown', 16);
          sd.phase = 'funnel';
          sd.at = fr;
          return;
        }
        const mouth = sd.jar.mouth();
        if (sd.phase === 'funnel') {
          const k = U.easeInCubic(Math.min(1, (fr - sd.at) / 30));
          v.setPosition(above.clone().lerp(mouth, k));
          v.yaw = v.prevYaw = v.yaw + 0.5;
          bodySize(v, U.lerp(1, 0.04, k));
          sd.vortex.span(mouth, v.chest().add(new V3(0, 0.6 * (1 - k), 0)), 0.06, U.lerp(1.6, 0.2, k));
          if (fr % 2 === 0) b.vfx.trail(v.chest().lerp(mouth, Math.random()), MF_PALE, 0.25, 0.35);
          if (k < 1) return;
          // sealed: the lid on — and no talisman to hold it
          v.setHidden(true);
          bodySize(v, 1);
          sd.vortex.dispose();
          sd.vortex = null;
          sd.jar.lidOn(true);
          this.anim.play('ft_lid', 14);
          b.vfx.flash(mouth, 0.8, MF_GREEN, 0.3, SL.Toon.tex.glow);
          b.sfx('block', this, { vol: 0.7, pitch: 0.9 });
          b.emit('mafuba', { fighter: this, victim: v, stage: 'seal' });
          sd.phase = 'sealed';
          sd.at = fr;
          return;
        }
        // sealed: the jar shakes — then bursts in a blinding green blast, and he comes out of it hurt and drained
        const h = fr - sd.at;
        sd.jar.shake(Math.min(1, h / 40));
        if (h % 6 === 0) b.vfx.flash(mouth, 0.4 + h / 120, MF_GREEN, 0.15, SL.Toon.tex.glow);
        if (h === 1) b.sfx('rumble', this, { vol: 0.9, dur: 1.2 });
        if (h < sp.sealFrames) return;
        sd.jar.shake(0);
        sd.jar.burst(b);
        const at = mouth.clone().add(new V3(0, -0.15, 0));
        b.vfx.explosion(at, 2.2, MF_GREEN, { smoke: false });
        b.vfx.ring(at, 9, MF_PALE, 0.6, new V3(0, 1, 0));
        b.sfx('explosionBig', this, { vol: 1.1 });
        b.sfx('rockBreak', this, { vol: 0.8 });
        b.cameraTraumaAt(at, 0.6);
        v.setHidden(false);
        v.setPosition(at.clone().addScaledVector(fw, 0.8).add(new V3(0, 0.3, 0)));
        v.setState('free');
        v.ki = v.ki * (1 - sp.kiDrain);
        v.stamina = v.stamina * (1 - sp.staminaDrain);
        v.takeHit(this, { type: 'explosion', damage: sp.damage, knock: 'heavy', knockSpeed: sp.knockSpeed, hitstun: 50, impact: 4, dir: fw.clone().add(new V3(0, 0.6, 0)).normalize(), point: v.chest(), guardPierce: true, technique: sp.id });
        b.emit('mafuba', { fighter: this, victim: v, stage: 'burst' });
        if (this.cine) this._cineEvent('finish');
        this.setState('recoverSpecial', { frames: sp.recovery });
      },
    },
    exits: {
      // interrupted, finished or the battle torn down: nothing of it left, and whoever it held goes free at his own size
      mafuba(f, sd) {
        if (sd.vortex) sd.vortex.dispose();
        if (sd.jar) sd.jar.dispose();
        sd.vortex = sd.jar = null;
        const v = sd.victim;
        if (v) {
          bodySize(v, 1);
          if (v.hidden && v.alive) v.setHidden(false);
          if (v.alive && v.state === 'held' && v.sd.by === f) v.setState('free');
        }
        if (f.isPlayer && f.battle) f.battle.emit('struggle', { active: false });
      },
    },
  });

  /* --- TRANSFORM: a boss changes form mid-fight as a real transformation event.
   * It hands the fighter to the engine's own transform state, so the form's
   * `sequence` (poses, aura, mood, camera, burst) plays exactly as it does for
   * a player transformation, and control returns by itself when it ends. --- */
  register('bossTransform', {
    start(f, sp) {
      const idx = sp.form === undefined ? f.formIndex + 1 : sp.form;
      const form = f.def.forms[idx];
      // the form only applies at the burst, so "already transforming" has to be
      // checked by state as well — otherwise a second call restarts the sequence
      if (!form || f.state === 'transform' || f.formIndex >= idx || !f.alive) return false;
      f.setState('transform', { form, index: idx, boss: true });
      f.stats.transforms++;
      f.battle.emit('transformStart', { fighter: f, form, boss: true });
      return true;
    },
    states: {},
  });

  /* ======================================================================
   * GIANT TECHNIQUES — for enormous bosses (Great Ape first). Big, slow,
   * readable: every one draws its danger area on the ground before it lands.
   * ====================================================================== */

  /** A pie-slice warning on the ground (sweeps). yaw is the centre direction. */
  function telegraphSector(b, pos, yaw, radius, half, color, frames) {
    const g = new THREE.Group();
    const theta = Math.atan2(-Math.cos(yaw), Math.sin(yaw));
    const geo = new THREE.CircleGeometry(1, 32, theta - half, half * 2);
    const mk = (o) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
    const fill = new THREE.Mesh(geo, mk(0.22));
    const inner = new THREE.Mesh(geo, mk(0.3));
    for (const m of [fill, inner]) {
      m.rotation.x = -Math.PI / 2;
      m.renderOrder = 11;
      g.add(m);
    }
    g.position.copy(pos);
    if (b.stage.hasGround) g.position.y = b.stage.heightAt(pos.x, pos.z) + 0.3;
    g.scale.setScalar(radius);
    inner.scale.setScalar(0.01);
    b.scene.add(g);
    let n = 0;
    const t = {
      done: false,
      remove() {
        if (t.done) return;
        t.done = true;
        b.scene.remove(g);
        geo.dispose();
        fill.material.dispose();
        inner.material.dispose();
      },
    };
    b.onTick(() => {
      if (t.done || b.disposed) return false;
      n++;
      inner.scale.setScalar(Math.min(1, n / frames));
      if (n >= frames) {
        t.remove();
        return false;
      }
      return true;
    });
    b.emit('telegraph', { pos: g.position.clone(), radius, frames, sector: { yaw, half } });
    return t;
  }

  /* --- STOMP: lifts a foot over the target's spot and brings it down --- */
  register('giantStomp', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || !f.battle.stage.hasGround) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      const off = t.pos.clone().sub(f.pos).setY(0);
      if (off.length() > sp.reach) off.setLength(sp.reach);
      const spot = groundAt(f.battle, f.pos.clone().add(off));
      f.setState('giantStomp', { spec: sp, spot, mark: telegraph(f.battle, spot, sp.radius, 0xff2a10, sp.windup) });
      f.anim.play(sp.poses.wind, 8);
      f.battle.sfx('growl', f, { pitch: 0.5 });
      return true;
    },
    armor: { giantStomp: (f) => (f.stateFrame < f.sd.spec.windup ? 2 : 0) },
    states: {
      giantStomp(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.set(0, this.vel.y, 0);
        this.yaw = U.dampAngle(this.yaw, Math.atan2(sd.spot.x - this.pos.x, sd.spot.z - this.pos.z), 6, TICK);
        if (f === sp.windup) {
          this.anim.play(sp.poses.strike, 40, { restart: true });
          const c = sd.spot;
          b.stage.crater(c, sp.radius * 0.5, 1.4, this);
          b.vfx.ring(c.clone().add(new V3(0, 0.3, 0)), sp.radius * 2, 0xffe0b0, 0.55, UP);
          b.vfx.dust(c, sp.radius, 26, b.stage.def.terrain ? b.stage.def.terrain.sand : undefined);
          b.vfx.debrisBurst(c.clone().add(new V3(0, 0.5, 0)), 22, b.stage.rockColor || 0x8a6a4a, 14, 0.4);
          b.sfx('groundImpact', null, { at: c, vol: 1.8 });
          b.cameraTraumaAt(c, 0.9);
          for (const e of b.enemiesOf(this)) {
            if (!e.alive || e.hidden) continue;
            const flat = Math.hypot(e.pos.x - c.x, e.pos.z - c.z);
            const height = e.pos.y - b.stage.heightAt(e.pos.x, e.pos.z);
            if (flat < sp.radius + e.radius && height < sp.clearHeight) e.takeHit(this, { type: 'explosion', damage: sp.damage, knock: 'smash', knockSpeed: sp.knockSpeed, hitstun: 44, impact: 4, dir: e.pos.clone().sub(c).setY(-0.5).normalize(), point: e.pos.clone().add(new V3(0, 0.5, 0)) });
          }
          b.stage.explode(c, sp.radius * 0.6, 3000, null, this);
          b.emit('giantStomp', { fighter: this, pos: c });
        }
        if (f >= sp.windup + sp.recovery) this.setState('free');
      },
    },
    exits: {
      giantStomp(f, sd) {
        if (sd.mark) sd.mark.remove();
      },
    },
  });

  /* --- SWEEP: a huge arm swings across the front; jump or fly over it --- */
  register('giantSweep', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      const yaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
      f.yaw = yaw;
      f.setState('giantSweep', { spec: sp, yaw, mark: telegraphSector(f.battle, f.pos, yaw, sp.range, sp.half, 0xff2a10, sp.windup) });
      f.anim.play(sp.poses.wind, 10);
      return true;
    },
    armor: { giantSweep: (f) => (f.stateFrame < f.sd.spec.windup ? 2 : 0) },
    states: {
      giantSweep(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.set(0, this.vel.y, 0);
        this.yaw = sd.yaw;
        if (f === sp.windup) {
          this.anim.play(sp.poses.strike, 30, { restart: true });
          b.sfx('dash', this, { pitch: 0.4, vol: 1.6 });
          b.cameraTraumaAt(this.pos, 0.5);
          const fwd = new V3(Math.sin(sd.yaw), 0, Math.cos(sd.yaw));
          for (const e of b.enemiesOf(this)) {
            if (!e.alive || e.hidden) continue;
            const to = e.pos.clone().sub(this.pos).setY(0);
            const flat = to.length();
            const ang = Math.acos(U.clamp(to.normalize().dot(fwd), -1, 1));
            const height = e.pos.y - (b.stage.hasGround ? b.stage.heightAt(e.pos.x, e.pos.z) : 0);
            if (flat < sp.range && ang < sp.half && height < sp.height) {
              const side = new V3(-fwd.z, 0, fwd.x);
              e.takeHit(this, { type: 'melee', damage: sp.damage, knock: 'heavy', knockSpeed: sp.knockSpeed, hitstun: 40, impact: 4, dir: side.addScaledVector(fwd, 0.4).normalize(), point: e.chest() });
            }
          }
          b.vfx.dust(this.pos.clone().addScaledVector(fwd, sp.range * 0.6), sp.range * 0.5, 20);
          b.emit('giantSweep', { fighter: this });
        }
        if (f >= sp.windup + sp.recovery) this.setState('free');
      },
    },
    exits: {
      giantSweep(f, sd) {
        if (sd.mark) sd.mark.remove();
      },
    },
  });

  /* --- GRAB: reaches for the target; caught heroes are crushed until they break free or get thrown --- */
  const GRAB_MASH = ['light', 'heavy', 'blast', 'dodge', 's1', 's2', 'ult'];
  register('giantGrab', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || f.distTo(t) > sp.reach || UNGRABBABLE.includes(t.state)) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      const spot = groundAt(f.battle, t.pos);
      f.setState('giantGrab', { spec: sp, phase: 'reach', victim: t, spot, mark: telegraph(f.battle, spot, sp.grabRadius, 0xff8a00, sp.windup) });
      f.anim.play(sp.poses.reach, 10);
      f.battle.emit('giantGrabTell', { fighter: f, victim: t });
      return true;
    },
    armor: { giantGrab: (f) => (f.sd.phase === 'reach' ? 2 : 0) },
    states: {
      giantGrab(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        this.vel.set(0, this.vel.y, 0);
        const v = sd.victim;
        if (sd.phase === 'reach') {
          if (v && v.alive) this.faceTarget(8);
          if (f < sp.windup) return;
          // the hand closes on the marked spot: whoever is still standing in it is caught
          const inSpot = v && v.alive && Math.hypot(v.pos.x - sd.spot.x, v.pos.z - sd.spot.z) < sp.grabRadius + v.radius && v.pos.y - sd.spot.y < sp.grabHeight;
          if (sd.mark) sd.mark.remove();
          if (inSpot && v.invuln <= 0 && !UNGRABBABLE.includes(v.state) && v.state !== 'dodge') {
            v.takeHit(this, { type: 'melee', damage: sp.grabDamage, knock: 'held', impact: 2, pose: 'hitBody', sfx: 'punchHeavy' });
            if (v.alive) {
              v.setState('held', { by: this, frames: 99999, grabbed: true });
              sd.phase = 'hold';
              sd.holdStart = f;
              sd.escape = 0;
              this.anim.play(sp.poses.hold, 20);
              b.emit('giantGrab', { fighter: this, victim: v });
              return;
            }
          }
          sd.phase = 'miss';
          sd.missStart = f;
          this.anim.play(sp.poses.miss || sp.poses.reach, 20);
          return;
        }
        if (sd.phase === 'miss') {
          if (f - sd.missStart >= sp.missRecovery) this.setState('free');
          return;
        }
        if (sd.phase === 'hold') {
          if (!v || !v.alive || v.state !== 'held') {
            this.setState('free');
            return;
          }
          const hand = this.handPos('R');
          v.pos.copy(hand).add(new V3(0, -v.height * 0.45, 0));
          v.vel.set(0, 0, 0);
          v.yaw = this.yaw + Math.PI;
          const held = f - sd.holdStart;
          if (held > 0 && held % sp.crushEvery === 0) {
            v._applyDamage(Math.round(sp.crushDamage), this, { type: 'melee', impact: 2 }, v.chest());
            v.anim.play('hitBody', 40, { restart: true });
            b.sfx('punchHeavy', v, { pitch: 0.6 });
            b.cameraTraumaAt(hand, 0.2);
          }
          if (v === b.player) {
            const vi = v.intent || {};
            if (SL.Settings.data.gameplay.beamClashInput === 'hold') {
              if (vi.guard || vi.s1Held || vi.ultHeld || vi.blastHeld) sd.escape += sp.holdGain / 60;
            } else if (GRAB_MASH.some((k) => vi[k])) sd.escape += sp.mashGain * (SL.Settings.data.gameplay.qteAssist ? 1.35 : 1);
            sd.escape = Math.max(0, sd.escape - sp.escapeDecay);
            b.emit('struggle', { active: true, progress: 1 - U.clamp01(sd.escape), rate: 1, label: 'BREAK FREE' });
          } else {
            if (sd.cpuRate === undefined) {
              const ctl = v.controller;
              sd.cpuRate = ctl && ctl.dummy && ctl.dummy !== 'cpu' ? 0 : sp.cpuEscape * U.rand(0.5, 1.5);
            }
            sd.escape += sd.cpuRate;
          }
          if (sd.escape >= 1 || v.hp <= 1) {
            // pried open: the hand stings, a short opening
            const victim = v;
            sd.victim = null;
            if (victim === b.player) b.emit('struggle', { active: false });
            victim.setState('free');
            victim.invuln = 30;
            victim.vel.copy(this.forward).multiplyScalar(10).add(new V3(0, 8, 0));
            victim.grounded = false;
            b.vfx.ring(victim.chest(), 4, 0xffffff, 0.35);
            b.sfx('guardBreak', victim, { pitch: 0.8 });
            b.emit('grabEscape', { fighter: this, victim });
            this.setState('stagger', { frames: sp.escapeStagger });
            return;
          }
          if (held >= sp.holdFrames) {
            // thrown into the ground
            const victim = v;
            sd.victim = null;
            if (victim === b.player) b.emit('struggle', { active: false });
            victim.setState('free');
            this.anim.play(sp.poses.throw, 30, { restart: true });
            victim.takeHit(this, { type: 'throw', damage: sp.throwDamage, knock: 'smash', knockSpeed: 30, hitstun: 50, impact: 4, dir: this.forward.clone().setY(-0.8).normalize(), point: victim.chest() });
            b.emit('giantThrow', { fighter: this, victim });
            sd.phase = 'recover';
            sd.recStart = f;
          }
          return;
        }
        if (f - sd.recStart >= sp.recovery) this.setState('free');
      },
    },
    exits: {
      giantGrab(f, sd) {
        if (sd.mark) sd.mark.remove();
        const v = sd.victim;
        if (v && v.alive && v.state === 'held' && v.sd.by === f) {
          v.setState('free');
          v.invuln = Math.max(v.invuln, 20);
        }
        if (v && v === f.battle.player) f.battle.emit('struggle', { active: false });
      },
    },
  });

  /**
   * Grow a fighter into a giant form (Great Ape): swaps in the giant fighter at
   * the same spot and scales it up from human size over the given frames.
   * Returns the giant. The small fighter is hidden and made untargetable.
   */
  SL.growInto = function (b, from, charId, opts = {}) {
    const giant = b.spawn({ charId, team: from.team, pos: from.pos.clone(), yaw: from.yaw, tags: opts.tags, difficulty: opts.difficulty });
    from.setHidden(true);
    from.untargetable = true;
    const full = giant.model.baseScale;
    const startK = from.scale / giant.scale;
    const frames = opts.frames || 150;
    let n = 0;
    giant.model.root.scale.setScalar(full * startK);
    b.onTick(() => {
      if (b.disposed || !giant.alive) return false;
      n++;
      const k = U.easeInOutCubic(Math.min(1, n / frames));
      giant.model.root.scale.setScalar(full * (startK + (1 - startK) * k));
      if (n % 10 === 0) b.cameraTraumaAt(giant.pos, 0.15 + k * 0.3);
      if (n >= frames) {
        b.emit('grown', { fighter: giant });
        return false;
      }
      return true;
    });
    return giant;
  };

  /* ======================================================================
   * STRETCH GRAB (Piccolo's Demon Hand): the arm shoots out across the field;
   * a caught opponent is yanked in and left reeling in front of him.
   * Guarding or dodging beats it.
   * ====================================================================== */
  register('stretchGrab', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || f.distTo(t) > sp.reach || UNGRABBABLE.includes(t.state)) return false;
      R.spendKi(f, cost);
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('stretchGrab', { spec: sp, phase: 'extend', victim: t, len: 1 });
      f.anim.play(sp.poses.wind, 20);
      f.battle.sfx('dash', f, { pitch: 1.6, vol: 0.6 });
      return true;
    },
    states: {
      stretchGrab(it) {
        const sd = this.sd, sp = sd.spec, f = this.stateFrame;
        const b = this.battle;
        const v = sd.victim;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(30);
        const armWorld = sp.armLength * this.scale * 1.85;
        if (sd.phase === 'extend') {
          if (f === 3) this.anim.play(sp.poses.reach, 40);
          const want = v && v.alive ? Math.max(1, this.distTo(v) / armWorld) : 1;
          sd.len = 1 + (want - 1) * U.clamp01(f / sp.extendFrames);
          this.setLimbStretch('R', sd.len);
          if (f % 2 === 0) b.vfx.trail(this.handPos('R'), 0xb8ff9a, 0.25, 0.2);
          if (f >= sp.extendFrames) {
            if (v && v.alive && this.distTo(v) <= sp.reach + 1 && !UNGRABBABLE.includes(v.state)) {
              const res = v.takeHit(this, { type: 'melee', damage: sp.damage, knock: 'held', impact: 1, dir: this.dirTo(v), pose: 'hitBody', sfx: 'punchLight' });
              if (res === 'hit' && v.alive) {
                v.setState('held', { by: this, frames: 99999 });
                sd.phase = 'pull';
                sd.pullStart = f;
                sd.from = v.pos.clone();
                b.bark(this, 'grab');
                b.emit('demonHand', { fighter: this, victim: v });
                return;
              }
            }
            sd.phase = 'retract';
            sd.retStart = f;
          }
          return;
        }
        if (sd.phase === 'pull') {
          const k = U.clamp01((f - sd.pullStart) / sp.pullFrames);
          const dest = this.pos.clone().addScaledVector(this.forward, 1.4 * this.scale + v.radius);
          dest.y = this.pos.y;
          v.pos.lerpVectors(sd.from, dest, U.easeInOutCubic(k));
          v.vel.set(0, 0, 0);
          sd.len = 1 + (sd.len - 1) * (1 - k * 0.3);
          this.setLimbStretch('R', Math.max(1, 1 + (sd.len - 1) * (1 - k)));
          if (k >= 1) {
            v.setState('hitstun', { frames: sp.hitstunAfter });
            v.anim.play('hitBody', 30, { restart: true });
            this.setLimbStretch('R', 1);
            this.followFrames = 20;
            this.followBonus = 1.1;
            this.setState('free');
          }
          return;
        }
        const k = U.clamp01((f - sd.retStart) / 8);
        this.setLimbStretch('R', 1 + (sd.len - 1) * (1 - k));
        if (f - sd.retStart >= sp.recovery) this.setState('free');
      },
    },
    exits: {
      stretchGrab(f, sd) {
        f.setLimbStretch('R', 1);
        const v = sd.victim;
        if (v && v.alive && v.state === 'held' && v.sd.by === f) v.setState('hitstun', { frames: 10 });
      },
    },
  });

  /* ======================================================================
   * TAIL GRAPPLE — Raditz's throw. The tail uncoils from his waist and lashes
   * out further than a hand grab reaches. On a catch it coils around the
   * target's chest and lifts them; his hands stay free, so he picks the
   * follow-up: Light slams them into the ground, Heavy hurls them away,
   * Special 1 blasts them point blank. Every squeeze loosens the grip for a
   * moment (the tail flashes): the victim can grab the tail back — every
   * Saiyan's weak spot — or mash free. Hitting Raditz breaks the grip.
   * ====================================================================== */
  const TAIL_SEGS = 12;
  function tailRope(f) {
    const color = (f.def.appearance.outfit && f.def.appearance.outfit.tail) || 0x4a2a18;
    const group = new THREE.Group();
    const mat = SL.Toon.mat(color);
    const geo = new THREE.CylinderGeometry(1, 1, 1, 7);
    const segs = [];
    for (let i = 0; i < TAIL_SEGS; i++) {
      const m = new THREE.Mesh(geo, mat);
      SL.Toon.addOutline(m, 0.8);
      group.add(m);
      segs.push(m);
    }
    // two loops around the victim's torso
    const coil = new THREE.Group();
    const loopGeo = new THREE.TorusGeometry(1, 0.26, 6, 18);
    for (let i = 0; i < 2; i++) {
      const loop = new THREE.Mesh(loopGeo, mat);
      loop.rotation.x = Math.PI / 2 + (i ? 0.25 : -0.15);
      loop.position.y = i ? -0.45 : 0.15;
      SL.Toon.addOutline(loop, 0.7);
      coil.add(loop);
    }
    coil.visible = false;
    group.add(coil);
    f.battle.scene.add(group);
    const P = [new V3(), new V3(), new V3()];
    const tmp = new V3();
    return {
      group, coil,
      /** Lay the tail along a curve from Raditz's lower back to `end`. */
      update(end, thick = 0.034) {
        // from the base of the spine, behind the hips
        const hips = f.model && f.model.joints && f.model.joints.hips;
        if (hips) f.model.root.updateMatrixWorld(true);
        const s0 = hips ? hips.getWorldPosition(new V3()).sub(f.object.position).add(f.pos).addScaledVector(f.forward, -0.14 * f.scale) : f.pos.clone().addScaledVector(f.forward, -0.16 * f.scale).add(new V3(0, 0.92 * f.scale, 0));
        const ctrl = s0.clone().addScaledVector(f.forward, 0.2 * f.scale).add(new V3(0, 1.1 * f.scale, 0));
        const pt = (t, out) => {
          const a = 1 - t;
          return out.set(0, 0, 0).addScaledVector(s0, a * a).addScaledVector(ctrl, 2 * a * t).addScaledVector(end, t * t);
        };
        for (let i = 0; i < TAIL_SEGS; i++) {
          pt(i / TAIL_SEGS, P[0]);
          pt((i + 1) / TAIL_SEGS, P[1]);
          const d = tmp.copy(P[1]).sub(P[0]);
          const len = Math.max(0.001, d.length());
          const seg = segs[i];
          seg.position.copy(P[0]).addScaledVector(d, 0.5);
          const r = thick * (1.15 - (i / TAIL_SEGS) * 0.45);
          seg.scale.set(r, len * 1.08, r);
          seg.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
        }
      },
      dispose() {
        f.battle.scene.remove(group);
        geo.dispose();
        loopGeo.dispose();
      },
    };
  }

  function beltTail(f, visible) {
    if (f.model && f.model.beltTail) f.model.beltTail.visible = visible;
  }

  function freeTailVictim(f, sd, how) {
    const v = sd.victim;
    if (v && v.alive && v.state === 'held' && v.sd.by === f) {
      if (how === 'keep') v.sd.frames = v.stateFrame + (sd.keepFrames || 30);
      else {
        v.setState('hitstun', { frames: 14 });
        v.invuln = Math.max(v.invuln, how === 'escape' ? 18 : 8);
      }
    }
    if (v && v === f.battle.player) f.battle.emit('struggle', { active: false });
  }

  register('tailGrapple', {
    /** Called as Raditz's throw (moves.throw.technique). Always starts: a whiff is the punish. */
    start(f, th) {
      f.setState('tailGrapple', { th, phase: 'lash', victim: null });
      f.anim.play(th.poses.lash, 14);
      f.battle.sfx('swing', f, { pitch: 0.7, vol: 0.9 });
      beltTail(f, false);
      f.sd.rope = tailRope(f);
      f.battle.emit('tailLash', { fighter: f });
      return true;
    },
    states: {
      tailGrapple(it) {
        const sd = this.sd, th = sd.th, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        const reach = th.reach * this.scale;
        const rope = sd.rope;

        if (sd.phase === 'lash') {
          const t = this.target;
          if (fr <= 4 && t) this.faceTarget(25);
          const k = U.clamp01(fr / th.lashFrames);
          const tip = this.chest().addScaledVector(this.forward, 0.5 + reach * U.easeOutCubic(k));
          if (t && t.alive && fr <= th.lashFrames && t.chest().distanceTo(this.chest()) < 0.5 + reach * k + t.radius) tip.copy(t.chest());
          rope.update(tip);
          if (fr % 2 === 0) b.vfx.trail(tip, 0xc08a60, 0.2, 0.18);
          if (fr === th.lashFrames) {
            const ok = t && t.alive && !t.hidden && t.invuln <= 0 && this.distTo(t) <= reach + t.radius && !UNGRABBABLE.includes(t.state) && !['dodge', 'knockback'].includes(t.state);
            if (ok) {
              const res = t.takeHit(this, { type: 'throw', damage: th.grabDamage, knock: 'held', impact: 1, dir: this.dirTo(t), pose: 'hitBody', sfx: 'punchLight' });
              if (res === 'hit' && t.alive) {
                t.setState('held', { by: this, frames: 99999, tail: true });
                t.vel.set(0, 0, 0);
                Object.assign(sd, { phase: 'hold', victim: t, holdStart: fr, escape: 0, squeeze: 0, loose: 0, from: t.pos.clone() });
                this.anim.play(th.poses.hold, 18);
                b.sfx('punchHeavy', t, { pitch: 0.7 });
                b.emit('throw', { fighter: this, victim: t });
                b.emit('tailGrab', { fighter: this, victim: t });
                b.bark(this, 'grab');
                return;
              }
            }
            sd.phase = 'retract';
            sd.retStart = fr;
            this.anim.play(th.poses.miss, 16);
          }
          return;
        }

        if (sd.phase === 'retract') {
          const k = U.clamp01((fr - sd.retStart) / 10);
          rope.update(this.chest().addScaledVector(this.forward, 0.5 + reach * (1 - k)));
          if (fr - sd.retStart >= th.whiffRecovery) this.setState('free');
          return;
        }

        // HOLD: the victim dangles in the coil in front of Raditz
        const v = sd.victim;
        if (!v || !v.alive || v.state !== 'held' || v.sd.by !== this) {
          this.setState('free');
          return;
        }
        const hf = fr - sd.holdStart;
        const lift = U.clamp01(hf / 10);
        const dest = this.pos.clone().addScaledVector(this.forward, th.holdDistance * this.scale).add(new V3(0, th.lift * lift * this.scale, 0));
        v.pos.lerpVectors(sd.from, dest, U.easeOutCubic(lift));
        v.grounded = false;
        v.yaw = this.yaw + Math.PI;
        v.vel.set(0, 0, 0);
        v.anim.play('hitBody', 12);
        const vc = v.chest();
        rope.update(vc.clone().addScaledVector(this.forward, -v.radius * 0.75), 0.036);
        rope.coil.visible = true;
        rope.coil.position.copy(vc);
        rope.coil.rotation.set(0, v.yaw, 0);
        rope.coil.scale.setScalar(v.radius * 0.55);

        // squeezes: damage ticks, and right after each one the grip loosens (tail flashes)
        sd.squeeze++;
        if (sd.squeeze >= th.squeezeEvery) {
          sd.squeeze = 0;
          v.takeHit(this, { type: 'crush', damage: th.squeezeDamage, knock: 'held', impact: 1, dir: this.forward, pose: 'hitBody', sfx: 'punchLight' });
          v.freeze = 0; // no hit-stop on a squeeze: the loosening rhythm stays steady and readable
          if (v.state === 'held') v.sd.by = this;
          sd.loose = th.looseFrames;
          b.vfx.sparks(vc, 0xffe0b0, 6, 4, 0.08);
          b.emit('tailLoose', { fighter: this, victim: v });
        }
        const loose = sd.loose > 0;
        if (loose) sd.loose--;
        rope.coil.scale.multiplyScalar(loose ? 1.18 : 1);
        rope.group.traverse((m) => m.material && m.material.emissive && m.material.emissive.setHex(loose ? 0x663a00 : 0x000000));

        // the victim: grab the tail back during a loose moment, or mash free
        const isPlayer = v === b.player;
        const vi = v.intent || {};
        let counter = false;
        // a Heavy (or Throw) press in the last few frames counts, so a press a tick early is not lost
        if (vi.heavy) sd.victimHeavyAt = b.frame;
        const heavyPressed = sd.victimHeavyAt !== undefined && b.frame - sd.victimHeavyAt <= 4;
        if (isPlayer) {
          if (loose && heavyPressed) {
            counter = true;
            v.buffer = null;
          } else if (vi.heavy && !loose) sd.escape = Math.max(0, sd.escape - 0.05); // grabbing at a tight grip wastes effort
          else if (MASH_KEYS.some((k) => vi[k])) sd.escape += th.mashGain;
          sd.escape = Math.max(0, sd.escape - th.escapeDecay);
          b.emit('struggle', { active: true, progress: 1 - U.clamp01(sd.escape), rate: 1, label: loose ? 'GRAB THE TAIL! (Heavy)' : 'BREAK FREE' });
        } else {
          const ctl = v.controller;
          const dummy = ctl && ctl.dummy && ctl.dummy !== 'cpu';
          const skill = ctl && ctl.d ? ctl.d.escape : 0.2;
          if (!dummy) {
            if (loose && sd.loose === th.looseFrames - 3 && Math.random() < th.cpuCounter * (0.5 + skill * 2)) counter = true;
            sd.escape += th.cpuEscape * (0.6 + skill * 2);
          }
        }
        if (counter) return SL.tailCountered(this, v);
        if (sd.escape >= 1) {
          freeTailVictim(this, sd, 'escape');
          sd.victim = null;
          v.anim.play('powerUp', 24, { restart: true });
          b.vfx.ring(vc, 3, 0xffffff, 0.3);
          b.emit('tailEscape', { fighter: this, victim: v });
          this.setState('recover', { frames: 20 });
          return;
        }

        // Raditz's follow-up (Light = slam, Heavy = hurl, Special 1 = point-blank blast); he slams on his own if he waits
        const choice = it.light ? 'slam' : it.heavy ? 'hurl' : it.s1 ? 'blast' : hf >= th.maxHold ? 'slam' : null;
        if (!choice) return;
        if (choice === 'blast' && R.canAfford(this, this.skillCost('special1'))) {
          sd.keepFrames = 34;
          freeTailVictim(this, sd, 'keep');
          sd.victim = null;
          sd.kept = true;
          b.emit('tailFollowUp', { fighter: this, victim: v, kind: 'blast' });
          this._trySpecial('special1');
          return;
        }
        const fu = th.followUps[choice === 'blast' ? 'slam' : choice];
        const kind = choice === 'blast' ? 'slam' : choice;
        // hand the victim and the tail over to the finishing state
        sd.kept = true;
        sd.handoff = true;
        sd.rope = null;
        this.setState('tailFinish', { th, fu, victim: v, rope, kind });
      },

      tailFinish(it) {
        const sd = this.sd, fu = sd.fu, fr = this.stateFrame, v = sd.victim;
        const b = this.battle;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        if (fr === 1) this.anim.play(fu.pose, 16);
        if (v && v.alive && v.state === 'held' && fr <= fu.hitAt) {
          const k = fr / fu.hitAt;
          if (sd.kind === 'slam') {
            // up over Raditz's head, then down into the ground in front of him
            const arc = this.pos.clone().addScaledVector(this.forward, (1.8 - Math.sin(k * Math.PI) * 1.2) * this.scale).add(new V3(0, (1.2 + Math.sin(k * Math.PI) * 2.2 - k * 1.1) * this.scale, 0));
            v.pos.copy(arc);
          } else {
            // wind back around his side before the release
            const side = new V3(this.forward.z, 0, -this.forward.x);
            v.pos.copy(this.pos).addScaledVector(side, Math.sin(k * Math.PI) * 1.6 * this.scale).addScaledVector(this.forward, (1.8 - Math.sin(k * Math.PI) * 1.4) * this.scale).add(new V3(0, 1.0 * this.scale, 0));
          }
          v.vel.set(0, 0, 0);
          sd.rope.update(v.chest(), 0.036);
          sd.rope.coil.position.copy(v.chest());
        }
        if (fr === fu.hitAt && v && v.alive && v.state === 'held') {
          if (sd.kind === 'slam') {
            v.pos.y = b.stage.hasGround ? b.stage.heightAt(v.pos.x, v.pos.z) + 0.2 : v.pos.y;
            b.vfx.debrisBurst(v.pos.clone(), 14, b.stage.rockColor);
            b.vfx.dust(v.pos, 3, 16);
            b.cameraTraumaAt(v.pos, 0.5);
          }
          const dir = sd.kind === 'slam' ? new V3(0, -1, 0).addScaledVector(this.forward, 0.3).normalize() : this.forward.clone().setY(0.25).normalize();
          v.setState('free');
          v.takeHit(this, { type: 'throw', damage: fu.damage, knock: fu.knock, knockSpeed: fu.knockSpeed, hitstun: fu.hitstun, impact: 3, dir, pose: 'hitHeavy', sfx: 'punchHeavy' });
          b.emit('tailFollowUp', { fighter: this, victim: v, kind: sd.kind });
          sd.victim = null;
          sd.rope.coil.visible = false;
        }
        if (fr > fu.hitAt) {
          const k = U.clamp01((fr - fu.hitAt) / 10);
          sd.rope.update(this.chest().addScaledVector(this.forward, 0.5 + 1.5 * (1 - k)));
        }
        if (fr >= fu.hitAt + fu.recovery) this.setState('free');
      },

      tailPain(it) {
        this.vel.multiplyScalar(0.8);
        if (this.grounded) this.vel.y = 0;
        this.anim.play(this.sd.pose || 'stagger', 10);
        if (this.stateFrame % 10 === 0) this.battle.vfx.sparks(this.chest(), 0xfff0c0, 2, 3, 0.06);
        if (this.stateFrame >= this.sd.frames) this.setState('free');
      },
    },
    exits: {
      tailGrapple(f, sd) {
        if (!sd.kept) freeTailVictim(f, sd, 'drop');
        if (sd.rope) sd.rope.dispose();
        if (!sd.handoff) beltTail(f, true);
      },
      tailFinish(f, sd) {
        const v = sd.victim;
        if (v && v.alive && v.state === 'held' && v.sd.by === f) v.setState('hitstun', { frames: 12 });
        if (sd.rope) sd.rope.dispose();
        beltTail(f, true);
      },
    },
  });

  /** The victim grabbed the tail back: Raditz is left writhing, drained of strength. */
  SL.tailCountered = function (f, v) {
    const sd = f.sd, th = sd.th;
    const b = f.battle;
    v.setState('free');
    v.invuln = 16;
    if (v === b.player) b.emit('struggle', { active: false });
    sd.victim = null;
    f.setState('tailPain', { frames: th.counter.stunFrames, pose: th.poses.pain });
    f.ki = Math.max(0, f.ki - th.counter.kiDrain);
    f.takeHit(v, { type: 'melee', damage: th.counter.damage, knock: 'held', impact: 1, dir: v.dirTo(f), pose: 'hitBody', sfx: 'punchHeavy' });
    if (f.state !== 'tailPain' && f.alive) f.setState('tailPain', { frames: th.counter.stunFrames, pose: th.poses.pain });
    b.vfx.flash(f.chest(), 2.5, 0xffffff, 0.2);
    b.sfx('punchHeavy', f, { pitch: 0.6 });
    b.cameraTraumaAt(f.chest(), 0.4);
    b.bark(f, 'tailPain');
    b.emit('tailCounter', { fighter: f, victim: v });
  };

  /* ======================================================================
   * TELEKINESIS — Chiaotzu fixes his eyes on a target and holds it still for
   * as long as he keeps concentrating (hold the button; ki drains). The target
   * shakes in place and can fight free; bosses break it sooner. Striking
   * Chiaotzu breaks his focus. Letting go leaves the target reeling briefly.
   * ====================================================================== */
  function endHold(f, sd, how) {
    const v = sd.victim;
    if (!v) return;
    if (v.alive && v.state === 'held' && v.sd.by === f) {
      if (how === 'release') {
        v.setState('stagger', { frames: sd.spec.releaseStagger });
        v.anim.play('stagger', 10, { restart: true });
      } else {
        v.setState('hitstun', { frames: 6 });
        v.invuln = Math.max(v.invuln, how === 'escape' ? 20 : 6);
      }
    }
    if (v === f.battle.player) f.battle.emit('struggle', { active: false });
    f.battle.emit('telekinesisEnd', { fighter: f, victim: v, how });
    sd.victim = null;
  }

  register('telekinesis', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden || t.untargetable || UNGRABBABLE.includes(t.state) || f.distTo(t) > sp.range) {
        f._denied && f._denied();
        return false;
      }
      if (!R.spendKi(f, cost)) return false;
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('telekinesis', { spec: sp, slot, victim: t, phase: 'focus', escape: 0 });
      f.anim.play(sp.poses.focus, 14);
      f.battle.sfx('teleport', f, { pitch: 1.6, vol: 0.6 });
      f.battle.emit('telekinesisFocus', { fighter: f, victim: t });
      return true;
    },
    states: {
      telekinesis(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.6);
        if (this.grounded) this.vel.y = 0;
        this.faceTarget(20);
        const v = sd.victim;
        const head = this.chest().add(new V3(0, this.height * 0.3, 0));
        if (fr % 6 === 0) b.vfx.ring(head, 1.2, 0xe8c8ff, 0.25);
        const held = SL.slotHeld(sd.slot, it);

        if (sd.phase === 'focus') {
          if (fr < sp.startup) return;
          const ok = v && v.alive && !v.hidden && v.invuln <= 0 && this.distTo(v) <= sp.range + 2 && !UNGRABBABLE.includes(v.state) && !['dodge'].includes(v.state);
          if (!ok) {
            sd.phase = 'recover';
            sd.recStart = fr;
            return;
          }
          v.setState('held', { by: this, frames: 99999, psychic: true });
          v.vel.set(0, 0, 0);
          Object.assign(sd, { phase: 'hold', holdStart: fr, anchor: v.pos.clone(), max: v.poise ? sp.bossFrames : sp.maxFrames });
          this.anim.play(sp.poses.hold, 12);
          b.vfx.flash(v.chest(), 2, 0xf0d8ff, 0.2);
          b.sfx('guardBreak', v, { pitch: 1.8, vol: 0.5 });
          b.emit('telekinesis', { fighter: this, victim: v });
          b.bark(this, 'grab');
          return;
        }

        if (sd.phase === 'recover') {
          if (fr - sd.recStart >= sp.recovery) this.setState('free');
          return;
        }

        // HOLD
        if (!v || !v.alive || v.state !== 'held' || v.sd.by !== this) {
          sd.victim = null;
          this.setState('recover', { frames: sp.recovery });
          return;
        }
        const hf = fr - sd.holdStart;
        // the target shudders in place, locked in the air where it stood
        v.pos.copy(sd.anchor).add(new V3(Math.sin(hf * 1.7) * 0.03, Math.min(0.25, hf * 0.01), Math.cos(hf * 2.3) * 0.03));
        v.grounded = false;
        v.vel.set(0, 0, 0);
        v.anim.play('hitBody', 10);
        if (hf % 3 === 0) b.vfx.bolt(v.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(-0.4, 0.6), U.rand(-0.4, 0.4))), U.rand(0.25, 0.5), 0xf0d8ff);
        if (hf % 20 === 0) b.vfx.ring(v.chest(), 2.2, 0xd8b0ff, 0.3);
        if (hf % 10 === 0) this.flash = 0.25;

        if (!this.infiniteKi) this.ki -= (sp.kiPerSecond / 60);
        // the victim strains against it
        const isPlayer = v === b.player;
        if (isPlayer) {
          const vi = v.intent || {};
          if (MASH_KEYS.some((k) => vi[k])) sd.escape += sp.mashGain * (v.poise ? 1.5 : 1);
          sd.escape = Math.max(0, sd.escape - sp.escapeDecay);
          b.emit('struggle', { active: true, progress: 1 - U.clamp01(sd.escape), rate: 1, label: 'BREAK THE HOLD' });
        } else {
          const ctl = v.controller;
          const dummy = ctl && ctl.dummy && ctl.dummy !== 'cpu';
          const skill = ctl && ctl.d ? ctl.d.escape : 0.2;
          if (!dummy) sd.escape += sp.cpuEscape * (0.6 + skill * 2) * (v.poise ? 1.5 : 1);
        }
        if (sd.escape >= 1) {
          endHold(this, sd, 'escape');
          b.vfx.ring(v.chest(), 3, 0xffffff, 0.3);
          this.setState('stagger', { frames: 26 });
          return;
        }
        if (!held || hf >= sd.max || this.ki <= 0) {
          this.ki = Math.max(0, this.ki);
          endHold(this, sd, 'release');
          sd.phase = 'recover';
          sd.recStart = fr;
          this.anim.play('idle', 14);
        }
      },
    },
    exits: {
      telekinesis(f, sd) {
        if (sd.victim) endHold(f, sd, 'broken');
      },
    },
  });

  /* ======================================================================
   * SENZU BEAN — limited healing. Yajirobe digs out a bean and eats it (a
   * readable, interruptible moment: a hit before he swallows keeps the bean
   * in his pouch). If an ally close by is in worse shape, he tosses it to them.
   * ====================================================================== */
  function beansLeft(f, sp) {
    if (!f.mech) return 0;
    // a kit without Yajirobe's Senzu mechanic (Turles' fruit, Gine's rations) starts with its own spec's count
    if (f.mech.beans === undefined && sp) f.mech.beans = sp.count || 0;
    return f.mech.beans !== undefined ? f.mech.beans : 0;
  }
  register('senzu', {
    lockedReason(f, sp) {
      return beansLeft(f, sp) > 0 ? null : 'No beans left';
    },
    start(f, sp, slot) {
      const b = f.battle;
      if (beansLeft(f, sp) <= 0) {
        f._denied && f._denied();
        b.emit('senzuEmpty', { fighter: f });
        return false;
      }
      // an ally in worse shape than him gets the bean
      let to = f;
      for (const a of b.alliesOf(f)) {
        if (a === f || !a.alive || a.hidden || a.pos.distanceTo(f.pos) > sp.tossRange) continue;
        if (a.hpFrac < sp.allyBelow && a.hpFrac < to.hpFrac - 0.1 && (to === f || a.hpFrac < to.hpFrac)) to = a;
      }
      f.cooldowns[slot] = sp.cooldown || 0;
      f.setState('senzu', { spec: sp, to });
      f.anim.play(sp.poses.eat, 12);
      return true;
    },
    states: {
      senzu(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        if (fr === sp.eatAt) {
          const to = sd.to && sd.to.alive ? sd.to : this;
          this.mech.beans = Math.max(0, beansLeft(this) - 1);
          to.hp = Math.min(to.hpMax, to.hp + to.hpMax * sp.heal);
          to.ki = Math.min(to.kiMax, to.ki + sp.ki);
          to.stamina = to.staminaMax;
          if (to.strain !== undefined) to.strain = 0;
          const c = to.chest();
          if (to !== this) b.vfx.trail(this.handPos('L'), 0x8fe07a, 0.3, 0.3);
          b.vfx.sparks(c, 0x9aff7a, 24, 6, 0.1);
          b.vfx.ring(c, 2.4, 0xb8ff9a, 0.4);
          b.vfx.flash(c, 2.2, 0xd8ffc0, 0.2);
          b.sfx('kiUp', to, { pitch: 1.3 });
          b.emit('senzu', { fighter: this, to, left: this.mech.beans });
          b.bark(this, 'senzu');
        }
        if (fr >= sp.eatAt + sp.recovery) this.setState('free');
      },
    },
  });

  /* ======================================================================
   * THE DIMENSIONAL TECHNIQUES (Janemba, Fusion Reborn). The pictures come from SL.Dimension; the
   * rules for what a portal does to a hit live in the `dimensional` mechanic (mechanics.js).
   *
   *   portalGuard   DIMENSION DOOR — the tell (a giggle, both palms out: startup frames), then a
   *                 portal stands open in front of him for `frames`: a blow or a blast from the
   *                 front comes out on the attacker's own back. Go round, or wait. A hit from
   *                 behind knocks him out of it.        spec: startup, frames, recovery, poses { tell, hold }
   *   phantomShift  he comes apart into floating cubes and reassembles somewhere else (behind /
   *                 side / away from the target), already facing it. Invulnerable while apart.
   *                 spec: frames, appearAt, dist, recovery, mode, pose
   *   portalStrike  he drives a fist (or the blade) into a portal in front of him; a second portal
   *                 opens beside the target FIRST (the warning: windup frames) and the blow comes out
   *                 of it where the target WAS standing — move and it hits nothing.
   *                 spec: windup, reach, radius, damage, knockSpeed, recovery, poses { wind, strike }
   * ====================================================================== */
  register('portalGuard', {
    start(f, sp, slot, cost) {
      if (!SL.Mechanics.dimensional || !payFromSlot(f, sp, slot, cost)) return false;
      f.setState('portalGuard', { spec: sp, phase: 'tell' });
      f.anim.play(sp.poses.tell, 12);
      f.battle.sfx('giggle', f, { pitch: 1 + (f.frame % 3) * 0.08 });
      f.battle.emit('portalTell', { fighter: f });
      return true;
    },
    states: {
      portalGuard(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle, M = SL.Mechanics.dimensional;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        if (this.target && this.target.alive) this.faceTarget(sd.phase === 'tell' ? 14 : 6);
        if (sd.phase === 'tell') {
          if (fr % 6 === 0) b.vfx.streamInward(this.chest().addScaledVector(this.forward, this.radius + 0.4), 1.2 * this.scale, SL.Dimension.COLORS.rim, 2, 0.12, 0.25);
          if (fr >= sp.startup) {
            sd.phase = 'hold';
            sd.holdAt = fr;
            M.openDoor(this, sp.frames);
            this.anim.play(sp.poses.hold, 10);
          }
          return;
        }
        if (sd.phase === 'hold') {
          if (!M.doorOpen(this) || fr - sd.holdAt >= sp.frames) {
            M.closeDoor(this);
            sd.phase = 'recover';
            sd.recAt = fr;
          }
          return;
        }
        if (fr - sd.recAt >= (sp.recovery || 10)) this.setState('free');
      },
    },
    exits: {
      portalGuard(f) {
        if (SL.Mechanics.dimensional && f.mech && f.mech.door) SL.Mechanics.dimensional.closeDoor(f);
      },
    },
  });

  register('phantomShift', {
    start(f, sp, slot, cost) {
      const t = sp.from || f.target;
      if (!t || !t.alive) return false;
      if (slot !== 'evade' && !payFromSlot(f, sp, slot, cost)) return false;
      const b = f.battle;
      const mode = sp.mode || 'behind';
      const k = (sp.dist || 1.8) * t.scale;
      const fwd = t.forward.clone().setY(0).normalize();
      const side = new V3(fwd.z, 0, -fwd.x).multiplyScalar(f.frame % 2 ? 1 : -1);
      let dest;
      if (mode === 'away') dest = f.pos.clone().add(f.pos.clone().sub(t.pos).setY(0).normalize().multiplyScalar(sp.dist || 8));
      else if (mode === 'side') dest = t.pos.clone().addScaledVector(side, k);
      else if (mode === 'front') dest = t.pos.clone().addScaledVector(fwd, k);
      else dest = t.pos.clone().addScaledVector(fwd, -k);
      dest.y = t.grounded ? t.pos.y : Math.max(t.pos.y, f.pos.y);
      b.stage.clampPosition(dest);
      SL.Dimension.shatter(b, f, { hide: true });
      f.invuln = Math.max(f.invuln, sp.frames + 2);
      f.setState('phantom', { spec: sp, dest, from: t });
      return true;
    },
    gravityExempt: ['phantom'],
    states: {
      phantom(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.set(0, 0, 0);
        const assemble = Math.max(1, sp.appearAt - 12);
        if (fr === assemble) SL.Dimension.reassemble(b, this, sd.dest, { frames: sp.appearAt - assemble });
        if (fr === sp.appearAt) {
          this.setPosition(sd.dest);
          this.prevPos.copy(sd.dest);
          this.grounded = false;
          this.setHidden(false);
          if (sd.from && sd.from.alive) {
            this.target = sd.from;
            this.faceTarget(100);
          }
          this.anim.play(sp.pose || 'flyIdle', 30, { snap: true });
          this.counterFrames = 45;
          b.emit('phantomShift', { fighter: this, to: sd.dest.clone() });
        }
        if (fr >= sp.appearAt + (sp.recovery || 4)) this.setState('free');
      },
    },
    exits: {
      phantom(f) {
        if (f.hidden && f.alive) f.setHidden(false);
      },
    },
  });

  /* ======================================================================
   * TIME-SKIP (Hit). Not a teleport button: a short, still preparation (the head dips, a violet glint at the
   * eyes), then he is simply not there for a fraction of a second — the opponent loses him — while a small
   * distortion gathers where he is going: inside the guard, at the shoulder. He is there, one precise blow, and he
   * is back in his stance. No screen flash: the read is the glint and the distortion.
   * spec: { prepFrames, gapFrames, damage, knock, knockSpeed, hitstun, recovery, reach, color, poses { prep, strike, recover } }
   * ====================================================================== */
  register('timeSkip', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      f.setState('timeSkip', { spec: sp, victim: t });
      f.anim.play(sp.poses.prep, 14);
      f.battle.vfx.flash(f.headPos(), 0.35, sp.color || 0xb070ff, 0.18, SL.Toon.tex.glow);
      f.battle.sfx('kiUp', f, { pitch: 1.8, vol: 0.3 });
      return true;
    },
    gravityExempt: ['timeSkip'],
    states: {
      timeSkip() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, b = this.battle, t = sd.victim;
        const prep = sp.prepFrames || 10, gap = sp.gapFrames || 8, col = sp.color || 0xb070ff;
        this.vel.set(0, 0, 0);
        // where he will be: inside the guard, at the shoulder (kept with the target as it moves)
        const dest = () => {
          const side = new V3(-t.forward.z, 0, t.forward.x).multiplyScalar(sd.side);
          const p = t.pos.clone().addScaledVector(t.forward, 0.55 * t.scale).addScaledVector(side, 0.75 * t.scale);
          b.stage.clampPosition(p);
          return p;
        };
        if (fr === prep) {
          sd.side = this.frame % 2 ? 1 : -1;
          this.setHidden(true);
          this.intangible = true;
          b.sfx('timeWarp', this, { vol: 0.5 });
        }
        if (fr > prep && fr < prep + gap && fr % 2 === 0 && t.alive) {
          const p = dest();
          b.vfx.ring(p.add(new V3(0, this.height * 0.55, 0)), 0.3 + (fr - prep) * 0.05, col, 0.12);
        }
        if (fr === prep + gap) {
          this.setHidden(false);
          this.intangible = false;
          if (t.alive && !t.hidden) {
            const p = dest();
            this.setPosition(p);
            this.prevPos.copy(p);
            this.yaw = this.prevYaw = Math.atan2(t.pos.x - p.x, t.pos.z - p.z);
          }
          this.anim.play(sp.poses.strike, 40, { restart: true });
          b.vfx.ring(this.chest(), 0.6, col, 0.14);
          if (t.alive && !t.hidden && !t.intangible && t.capsuleDistance(this.chest()) < (sp.reach || 1.6) * this.scale + t.radius) {
            t.takeHit(this, { type: 'melee', damage: sp.damage, knock: sp.knock || 'crumple', knockSpeed: sp.knockSpeed || 8, hitstun: sp.hitstun || 30, impact: 3, dir: this.dirTo(t), point: t.chest(), pose: 'hitBody', sfx: 'punchHeavy', name: sp.name });
          }
          b.emit('timeSkipStrike', { fighter: this, victim: t });
        }
        if (fr === prep + gap + 10) this.anim.play(sp.poses.recover || 'idle', 10);
        if (fr >= prep + gap + (sp.recovery || 20)) this.setState('free');
      },
    },
    exits: {
      timeSkip(f) {
        if (f.hidden && f.alive) f.setHidden(false);
        f.intangible = false;
      },
    },
  });

  /* ======================================================================
   * BARRIER (Android 17, the Tournament of Power): a shell round him for a moment — a faint fill and a bright,
   * readable outline, snapping open in a few frames (never a huge opaque sphere). Blasts burst on it; a fighter
   * swinging into it is pushed off. He is untouchable inside it, and it costs him the slot's cooldown.
   * spec: { radius, holdFrames, damage, knockSpeed, color, poses { hold } }
   * ====================================================================== */
  register('barrier', {
    start(f, sp, slot, cost) {
      if (!payFromSlot(f, sp, slot, cost)) return false;
      const b = f.battle, r = (sp.radius || 1.7) * f.scale, col = sp.color || 0x8ad4ff;
      const shell = new THREE.Group();
      const fill = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }));
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1, 1)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.75, depthWrite: false }));
      shell.add(fill, edge);
      shell.scale.setScalar(r * 0.2);
      shell.position.copy(f.chest());
      b.scene.add(shell);
      f.setState('barrier', { spec: sp, shell, r, pushed: new Set() });
      f.anim.play(sp.poses.hold, 12);
      b.sfx('kiUp', f, { pitch: 1.35, vol: 0.6 });
      b.vfx.ring(f.chest(), r * 1.2, col, 0.2);
      return true;
    },
    gravityExempt: ['barrier'],
    states: {
      barrier() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, b = this.battle, r = sd.r, col = sp.color || 0x8ad4ff;
        this.vel.multiplyScalar(0.7);
        if (this.grounded) this.vel.y = 0;
        const k = Math.min(1, fr / 6);
        sd.shell.scale.setScalar(r * (0.2 + 0.8 * U.easeOutCubic(k)));
        sd.shell.position.copy(this.chest());
        sd.shell.rotation.y += 0.012;
        this.invuln = 2;
        const c = sd.shell.position;
        for (const p of b.projectiles.list) {
          if (!p.alive || p.team === this.team || p.pos.distanceTo(c) > r + (p.radius || 0.5)) continue;
          b.projectiles._explode(p, true);
          b.vfx.ring(p.pos.clone(), 0.9, col, 0.18);
        }
        for (const e of b.enemiesOf(this)) {
          if (!e.alive || e.hidden || sd.pushed.has(e) || e.state !== 'attack' || e.capsuleDistance(c) > r) continue;
          sd.pushed.add(e);
          e.takeHit(this, { type: 'ki', damage: sp.damage || 300, knock: 'push', knockSpeed: sp.knockSpeed || 16, hitstun: 18, impact: 2, dir: e.chest().sub(c).setY(0).normalize(), point: e.chest(), sfx: 'block', name: sp.name });
          b.vfx.ring(e.chest(), 1, col, 0.16);
        }
        if (fr >= (sp.holdFrames || 60)) this.setState('free');
      },
    },
    exits: {
      barrier(f, old) {
        const sh = old && old.shell;
        if (!sh) return;
        if (sh.parent) sh.parent.remove(sh);
        sh.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
      },
    },
  });

  register('portalStrike', {
    start(f, sp, slot, cost) {
      const t = f.target;
      if (!t || !t.alive || t.hidden) return false;
      if (!payFromSlot(f, sp, slot, cost)) return false;
      const b = f.battle;
      // the exit opens BESIDE the target (readable from any camera), at chest height
      const toF = f.pos.clone().sub(t.pos).setY(0);
      if (toF.lengthSq() < 0.001) toF.set(0, 0, 1);
      toF.normalize();
      const side = new V3(toF.z, 0, -toF.x).multiplyScalar(f.frame % 2 ? 1 : -1);
      const exit = t.chest().addScaledVector(side, (sp.reach || 1.4) * t.scale);
      const aim = t.chest();
      const entry = f.chest().addScaledVector(f.forward, f.radius + 0.4);
      const inP = SL.Dimension.portal(b, entry, f.forward, { radius: 0.55 * f.scale, open: 6 });
      const outP = SL.Dimension.portal(b, exit, aim.clone().sub(exit).normalize(), { radius: 0.6 * t.scale, open: 6, sfx: false });
      f.setState('portalStrike', { spec: sp, exit, aim, inP, outP, victim: t });
      f.anim.play(sp.poses.wind, 10);
      b.emit('telegraph', { fighter: f, pos: new V3(aim.x, t.pos.y, aim.z), radius: (sp.radius || 1.2) * t.scale, frames: sp.windup });
      b.emit('portalStrikeTell', { fighter: f, exit: exit.clone(), victim: t });
      return true;
    },
    states: {
      portalStrike(it) {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame;
        const b = this.battle;
        this.vel.multiplyScalar(0.6);
        if (this.grounded) this.vel.y = 0;
        if (fr === sp.windup) {
          this.anim.play(sp.poses.strike, 30, { restart: true });
          b.sfx('punchHeavy', this, { pitch: 0.8 });
          const dir = sd.aim.clone().sub(sd.exit).normalize();
          b.vfx.slash(sd.exit.clone(), sd.exit.clone().addScaledVector(dir, 1.6), sp.color || 0xff5ad8, 0.2, 0.12);
          for (const e of b.enemiesOf(this)) {
            if (!e.alive || e.hidden || e.intangible) continue;
            if (e.capsuleDistance(sd.aim) > (sp.radius || 1.2) * e.scale + e.radius) continue;
            e.takeHit(this, { type: 'melee', damage: sp.damage, knock: 'heavy', knockSpeed: sp.knockSpeed, hitstun: sp.hitstun || 34, impact: 3, dir, point: sd.aim.clone(), pose: 'hitSideL', sfx: 'punchHeavy', name: sp.name });
          }
          b.emit('portalStrike', { fighter: this });
        }
        if (fr === sp.windup + 8) {
          if (sd.inP) sd.inP.close();
          if (sd.outP) sd.outP.close();
        }
        if (fr >= sp.windup + (sp.recovery || 20)) this.setState('free');
      },
    },
    exits: {
      portalStrike(f, old) {
        const sd = old || {};
        if (sd.inP) sd.inP.close();
        if (sd.outP) sd.outP.close();
      },
    },
  });

  /* ======================================================================
   * BEAM SURF (Ultra Instinct -Sign-, the owner's PDF "Surf" rush). Only while an enemy beam is coming at him: he
   * rides along the top of it to the one firing it (the beam passes under him — intangible to it), flips over his
   * head and fires a Kamehameha into his chest point blank, which ends the enemy's beam. If the beam stops while he
   * rides, he carries on to the shooter. Cut off (a second enemy, a scene) he simply drops out of it.
   * ====================================================================== */
  /** The enemy beam he could ride now: aimed at him, still going, close to his body. */
  function surfableBeam(f) {
    const b = f.battle, c = f.chest();
    for (const bm of b.projectiles.beams) {
      if (bm.done || bm.team === f.team || bm.state === 'fade' || bm.state === 'clash' || !bm.owner.alive) continue;
      const to = c.clone().sub(bm.origin);
      const along = to.dot(bm.dir);
      if (along <= 0) continue;
      const off = to.clone().sub(bm.dir.clone().multiplyScalar(along)).length();
      if (off < bm.radius + f.radius + 3) return bm;
    }
    return null;
  }
  register('beamSurf', {
    lockedReason(f) {
      return surfableBeam(f) ? null : 'Needs a beam coming at you';
    },
    start(f, sp, slot, cost) {
      const bm = surfableBeam(f);
      if (!bm || !payFromSlot(f, sp, slot, cost)) return false;
      f.setState('beamSurf', { spec: sp, beam: bm, shooter: bm.owner, phase: 'ride', from: f.pos.clone(), at: 0, was: !!f.intangible });
      f.intangible = true;
      f.anim.play(sp.poses.ride, 12);
      f.battle.sfx('dash', f, { vol: 1.2 });
      return true;
    },
    gravityExempt: ['beamSurf'],
    states: {
      beamSurf() {
        const sd = this.sd, sp = sd.spec, fr = this.stateFrame, b = this.battle, sh = sd.shooter;
        this.vel.set(0, 0, 0);
        this.grounded = false;
        this.fallVel = 0;
        if (sd.phase === 'ride') {
          // along the top of the beam toward the hands that fire it (or straight at him, if the beam has stopped)
          const k = Math.min(1, fr / sp.rideFrames);
          const end = sh.chest().add(new V3(0, sh.height * 0.6 + 0.6, 0));
          this.pos.lerpVectors(sd.from, end, U.easeInOutCubic(k));
          this.pos.y += Math.sin(k * Math.PI) * (sd.beam.radius + 0.8);
          this.yaw = Math.atan2(sh.pos.x - this.pos.x, sh.pos.z - this.pos.z);
          if (fr % 2 === 0) b.vfx.trail(this.chest(), sp.color || 0xbfe6ff, 0.5, 0.3);
          if (fr % 5 === 0) this.ghost(0.25, 0.4);
          if (k >= 1 || !sh.alive) {
            sd.phase = 'flip';
            sd.at = fr;
            this.anim.play(sp.poses.flip, 20, { restart: true });
          }
          return;
        }
        if (sd.phase === 'flip') {
          // over his head, and down in front of his face
          const k = Math.min(1, (fr - sd.at) / sp.flipFrames);
          const over = sh.pos.clone().add(new V3(0, sh.height + 0.5 * this.scale, 0));
          const front = sh.pos.clone().addScaledVector(sh.forward, 1.4 * Math.max(this.scale, sh.scale));
          front.y = sh.pos.y;
          this.pos.lerpVectors(over, front, k * k);
          this.yaw = Math.atan2(sh.pos.x - this.pos.x, sh.pos.z - this.pos.z);
          if (k >= 1) {
            sd.phase = 'fire';
            sd.at = fr;
            this.anim.play(sp.poses.fire, 40, { restart: true });
            if (sd.beam && !sd.beam.done) sd.beam.stop();
            if (sh.alive) {
              const hand = this.handPos('R').add(this.handPos('L')).multiplyScalar(0.5), c = sh.chest();
              const dir = c.clone().sub(hand);
              if (dir.lengthSq() < 0.01) dir.copy(this.forward);
              dir.normalize();
              sd.fx = { vis: b.vfx.createBeam(sp.color || 0x9ad8ff, 0xffffff, {}), dir, at: fr };
              b.vfx.explosion(c, 1.2, sp.color || 0x9ad8ff, { smoke: false });
              b.sfx('beamFire', this, { vol: 1 });
              sh.takeHit(this, { type: 'ki', damage: sp.damage, knock: 'heavy', knockSpeed: 46, hitstun: 40, impact: 4, dir: dir.clone(), pose: 'hitHeavy', color: sp.color });
            }
            if (this.cine) this._cineEvent('finish');
          }
          return;
        }
        // the shot drawn on for a moment, then he lands back in the fight
        const fx = sd.fx;
        if (fx) {
          const k = (fr - fx.at) / 30;
          if (k >= 1) {
            fx.vis.dispose();
            sd.fx = null;
          } else {
            const o = this.handPos('R').add(this.handPos('L')).multiplyScalar(0.5);
            fx.vis.update(o, o.clone().addScaledVector(fx.dir, 14 * Math.min(1, k * 5)), 0.9 * (1 - 0.4 * k), k < 0.6 ? 1 : (1 - k) / 0.4, fr / 60);
          }
        }
        if (fr - sd.at === 6) this.intangible = sd.was;
        if (fr - sd.at >= sp.recovery) this.setState('free');
      },
    },
    exits: {
      beamSurf(f, sd) {
        f.intangible = !!sd.was;
        if (sd.fx) sd.fx.vis.dispose();
      },
    },
  });
})();
