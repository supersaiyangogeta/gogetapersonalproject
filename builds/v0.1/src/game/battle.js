/*
 * Battle: owns a fight — scene, stage, fighters, projectiles, camera, flow
 * (intro → fight → KO → victory → results) and all hit feedback.
 * Simulation runs at a fixed 60 Hz; rendering interpolates positions.
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;
  const UP = new V3(0, 1, 0);

  /** Generator-driven sequence: yield seconds, or a predicate function. */
  class Coroutine {
    constructor(gen) {
      this.gen = gen;
      this.wait = 0;
      this.cond = null;
      this.done = false;
      this._next();
    }
    update(dt) {
      if (this.done) return;
      if (this.cond) {
        if (!this.cond()) return;
        this.cond = null;
      } else if (this.wait > 0) {
        this.wait -= dt;
        if (this.wait > 0) return;
      }
      this._next();
    }
    _next() {
      let guard = 0;
      while (!this.done && guard++ < 50) {
        let r;
        try {
          r = this.gen.next();
        } catch (e) {
          console.error('[SL] sequence error', e);
          this.done = true;
          return;
        }
        if (r.done) {
          this.done = true;
          return;
        }
        const v = r.value;
        if (typeof v === 'number') {
          this.wait = v;
          if (v > 0) return;
        } else if (typeof v === 'function') {
          if (!v()) {
            this.cond = v;
            return;
          }
        }
      }
    }
    stop() {
      this.done = true;
    }
  }
  SL.Coroutine = Coroutine;

  class Battle {
    constructor(config) {
      this.config = config;
      this.mode = config.mode || 'free';
      this.rules = Object.assign({ timeLimit: 0, allowTransform: true, allowUltimates: true, damagePlayer: 1, damageEnemy: 1, balance: 'balanced' }, config.rules || {});
      this.scene = new THREE.Scene();
      this.camera = new SL.CameraRig();
      this.camera.setAspect(window.innerWidth / window.innerHeight);
      this.shadowsOn = SL.Render.shadowMapSize() > 0;
      this.vfx = new SL.VFX(this.scene);
      const sdef = SL.data.stages[config.stageId] || SL.data.stages.wasteland;
      this.stage = new SL.Stage(this, sdef);
      this.vfx.setStage(this.stage);
      this.camera.setFar(sdef.type === 'space' ? 5000 : SL.Render.farDistance());
      this.projectiles = new SL.Projectiles(this);
      this.clash = new SL.BeamClash(this);
      this.fighters = [];
      this.player = null;
      this.frame = 0;
      this.fightTime = 0;
      this.acc = 0;
      this.slow = null;
      this.phase = 'setup';
      this.paused = false;
      this.cinematicOwners = null;
      this.inputLocked = true;
      this.aiLocked = true;
      this.tokens = new Map();
      this.listeners = {};
      this.mission = null;
      this.seq = null;
      this.skipRequested = false;
      this.lookAcc = { x: 0, y: 0 };
      this.musicHold = 0;
      this.baseMusic = 1;
      this.result = null;
      this.playerLimits = null;
      this.disposed = false;
      this._resizeOff = SL.events.on('render:resize', (e) => this.camera.setAspect(e.width / e.height));
      for (const spec of config.fighters || []) this.spawn(spec);
    }

    /* ---------------- events ---------------- */
    on(name, fn) {
      (this.listeners[name] || (this.listeners[name] = [])).push(fn);
    }
    emit(name, data) {
      const l = this.listeners[name];
      if (l) for (const fn of l.slice()) {
        try {
          fn(data);
        } catch (e) {
          console.error('[SL] battle listener', name, e);
        }
      }
      SL.events.emit('battle:' + name, data);
    }

    /* ---------------- fighters ---------------- */
    spawn(spec) {
      const def = SL.data.characters[spec.charId];
      if (!def) throw new Error('Unknown character ' + spec.charId);
      const difficulty = spec.difficulty || SL.Settings.data.gameplay.difficulty;
      // `autopilot` lets the CPU drive the player fighter (automated soak tests)
      const autopilot = spec.autopilot || (spec.player && SL.debugAutopilot);
      const controller = spec.player && !autopilot ? new SL.PlayerController(this) : new SL.AIController(this, { difficulty: autopilot || difficulty, profile: spec.profile, dummy: spec.dummy });
      const f = new SL.Fighter(this, def, {
        team: spec.team || 0,
        isPlayer: !!spec.player,
        controller,
        hpMul: (spec.hpMul || 1) * (this.rules.hpMul || 1),
        startKi: spec.startKi !== undefined ? spec.startKi : this.rules.startKi,
        infiniteHp: spec.infiniteHp,
        infiniteKi: spec.infiniteKi,
        infiniteStamina: spec.infiniteStamina,
        balance: this.rules.balance,
        skin: spec.skin,
        cannotDie: spec.cannotDie,
        name: spec.name,
        tags: spec.tags,
        damageTakenMul: spec.damageTakenMul,
        damageDealtMul: spec.damageDealtMul,
      });
      const pos = spec.pos ? spec.pos.clone() : new V3((spec.team || 0) === 0 ? -8 : 8, 0, 0);
      if (this.stage.hasGround && spec.grounded !== false) {
        pos.y = this.stage.heightAt(pos.x, pos.z);
        f.grounded = true;
      }
      f.setPosition(pos);
      f.yaw = spec.yaw !== undefined ? spec.yaw : Math.atan2(-pos.x, -pos.z);
      if (spec.form) f.applyForm(spec.form);
      this.fighters.push(f);
      if (spec.player) this.player = f;
      f.anim.snap();
      this.emit('spawn', { fighter: f });
      return f;
    }

    remove(f) {
      this.releaseMeleeToken(f);
      const i = this.fighters.indexOf(f);
      if (i >= 0) this.fighters.splice(i, 1);
      for (const o of this.fighters) if (o.target === f) o.target = null;
      f.dispose();
      this.emit('removed', { fighter: f });
    }

    enemiesOf(f) {
      return this.fighters.filter((o) => o.alive && o.team !== f.team);
    }
    alliesOf(f) {
      return this.fighters.filter((o) => o.alive && o.team === f.team && o !== f);
    }

    pickTarget(f) {
      const enemies = this.enemiesOf(f);
      if (!enemies.length) return null;
      let best = null, bestScore = 1e9;
      const camFwd = new V3().subVectors(this.camera.look, this.camera.pos).setY(0).normalize();
      for (const e of enemies) {
        const d = f.pos.distanceTo(e.pos);
        let score = d;
        if (f.isPlayer) {
          const to = e.pos.clone().sub(f.pos).setY(0).normalize();
          score += (1 - camFwd.dot(to)) * 18;
        } else if (e.isPlayer) score -= 25;
        if (e.tags && e.tags.priority) score -= 40;
        if (score < bestScore) {
          bestScore = score;
          best = e;
        }
      }
      return best;
    }

    assignTargets() {
      for (const f of this.fighters) {
        if (!f.alive) continue;
        if (f.target && f.target.alive && f.target.team !== f.team) continue;
        if (f.isPlayer && f.target && !f.target.alive && !SL.Settings.data.gameplay.autoTargetSwitch) {
          f.target = null;
          continue;
        }
        if (f.isPlayer && !f.target && f._manualNoTarget) continue;
        f.target = this.pickTarget(f);
      }
    }

    cycleTarget(f) {
      const enemies = this.enemiesOf(f);
      if (!enemies.length) return;
      const camYaw = this.cameraYaw();
      enemies.sort((a, b) => {
        const ya = U.wrapAngle(Math.atan2(a.pos.x - f.pos.x, a.pos.z - f.pos.z) - camYaw);
        const yb = U.wrapAngle(Math.atan2(b.pos.x - f.pos.x, b.pos.z - f.pos.z) - camYaw);
        return ya - yb;
      });
      const i = enemies.indexOf(f.target);
      f.target = enemies[(i + 1) % enemies.length];
      f._manualNoTarget = false;
      SL.Audio.play('uiMove');
      this.emit('targetChanged', { fighter: f, target: f.target });
    }

    requestMeleeToken(f, t) {
      if (!t) return false;
      let set = this.tokens.get(t);
      if (!set) this.tokens.set(t, (set = new Set()));
      for (const m of set) if (!m.alive) set.delete(m);
      if (set.has(f)) return true;
      const diff = SL.Settings.data.gameplay.difficulty;
      const max = this.enemiesOf(t).length <= 1 ? 9 : { easy: 1, normal: 2, hard: 2, veryhard: 3 }[diff] || 2;
      if (set.size < max) {
        set.add(f);
        return true;
      }
      return false;
    }
    releaseMeleeToken(f) {
      for (const set of this.tokens.values()) set.delete(f);
    }

    isFrozen(f) {
      if (!this.cinematicOwners) return false;
      return !this.cinematicOwners.includes(f);
    }
    beginCinematic(owners) {
      this.cinematicOwners = [].concat(owners);
    }
    endCinematic() {
      this.cinematicOwners = null;
    }

    cameraYaw() {
      return Math.atan2(this.camera.look.x - this.camera.pos.x, this.camera.look.z - this.camera.pos.z);
    }

    involvesPlayer(f) {
      const p = this.player;
      return !!p && (f === p || (f && f.target === p));
    }

    /* ---------------- audio / feedback ---------------- */
    volFor(f) {
      if (!f || f === this.player) return 1;
      const d = this.camera.pos.distanceTo(f.pos);
      return U.clamp(1.2 - d / 80, 0.25, 0.9);
    }

    sfx(name, fighter, opts = {}) {
      const pos = opts.at || (fighter ? fighter.chest() : null);
      let vol = opts.vol || 1, pan = 0;
      if (pos) {
        const d = this.camera.camera.position.distanceTo(pos);
        vol *= U.clamp(1.4 - d / 90, 0.15, 1);
        const p = this.camera.project(pos, {});
        pan = p.behind ? 0 : U.clamp(p.ndcX * 0.7, -0.7, 0.7);
      }
      SL.Audio.play(name, { vol, pan, pitch: opts.pitch });
    }

    cameraTraumaAt(pos, amount) {
      const d = this.camera.pos.distanceTo(pos);
      this.camera.addTrauma(amount * U.clamp(1 - d / 140, 0.08, 1));
    }

    hitEffects(att, target, hit, point, impact) {
      const color = hit.color || (hit.type === 'melee' || hit.type === 'throw' ? 0xfff0c0 : 0xffffff);
      if (hit.type !== 'beam') this.vfx.impact(point, impact, color);
      if (hit.type === 'melee' || hit.type === 'throw') this.sfx(hit.sfx || (impact >= 2 ? 'punchHeavy' : 'punchLight'), target, { vol: 0.9 + impact * 0.1 });
      else if (hit.type === 'ki') this.sfx('explosionSmall', target, { vol: 0.5 });
      const hsBase = R.HITSTOP[U.clamp(impact, 0, 5)] * SL.Settings.data.gameplay.hitStop;
      if (hit.type === 'melee' || hit.type === 'throw') {
        const hs = Math.round(hsBase);
        target.freeze = Math.max(target.freeze, hs);
        if (att) att.freeze = Math.max(att.freeze, hs);
      } else target.freeze = Math.max(target.freeze, Math.round(hsBase * 0.4));
      const trauma = R.TRAUMA[U.clamp(impact, 0, 5)];
      if (this.involvesPlayer(att) || this.involvesPlayer(target)) this.camera.addTrauma(trauma);
      else this.cameraTraumaAt(point, trauma * 0.5);
      if (impact >= 4) SL.ScreenFX.flash(0.12 * impact);
      if (att === this.player || target === this.player) {
        SL.Input.rumble(0.15 * impact, 0.12 * impact, 50 + impact * 30);
        if (impact >= 3 && hit.type === 'melee') this.slowmo(0.45, 0.1);
      }
    }

    blockEffects(att, target, hit, point) {
      this.vfx.flash(point, 1.8, 0x9fdcff, 0.12, SL.Toon.tex.glow);
      this.vfx.ring(point, 1.6, 0x9fdcff, 0.22);
      this.sfx('block', target);
      const hs = Math.round(3 * SL.Settings.data.gameplay.hitStop);
      target.freeze = Math.max(target.freeze, hs);
      if (att && hit.type === 'melee') att.freeze = Math.max(att.freeze, hs);
    }

    perfectEffects(att, target, point) {
      this.vfx.flash(point, 4, 0xb0f4ff, 0.3);
      this.vfx.ring(point, 3.2, 0xb0f4ff, 0.35);
      this.sfx('perfectGuard', target);
      SL.ScreenFX.flash(0.15, '#c8f4ff');
      if (this.involvesPlayer(target) || this.involvesPlayer(att)) this.slowmo(0.3, 0.28);
      this.emit('perfectGuard', { fighter: target, attacker: att });
    }

    groundImpactEffects(f, speed) {
      const p = f.pos.clone();
      this.vfx.dust(p, 2 + speed * 0.05, 26, this.stage.def.terrain ? this.stage.def.terrain.sand : 0xb89a78);
      this.vfx.debrisBurst(p, 10, this.stage.def.terrain ? this.stage.def.terrain.dirt : 0x8a6a4a, 9 + speed * 0.2, 0.3);
      this.vfx.ring(p.clone().add(new V3(0, 0.3, 0)), 3 + speed * 0.08, 0xffe6c0, 0.45, UP);
      this.sfx('groundImpact', f);
      this.cameraTraumaAt(p, 0.3 + speed * 0.012);
      if (f === this.player || (f.target === this.player)) SL.Input.rumble(0.7, 0.5, 200);
    }

    wallImpactEffects(f, info, speed) {
      const c = f.chest();
      this.vfx.debrisBurst(c, 12, info.pillar.color, 10, 0.35);
      this.vfx.dust(c, 2, 12);
      this.vfx.impact(c, 3, 0xffe0b0);
      this.sfx('rockBreak', f);
      this.cameraTraumaAt(c, 0.45);
    }

    rulesDamageMul(att, target) {
      let m = 1;
      if (att && att.isPlayer) m *= this.rules.damagePlayer;
      if (target && target.isPlayer) m *= this.rules.damageEnemy;
      return m;
    }

    say(fighter, key, duration = 2.8) {
      const D = SL.data.dialogue;
      const id = fighter ? fighter.def.id : '';
      const line = D.get(key) || D.get(id + '_' + key);
      if (!line) return;
      this.emit('say', { speaker: fighter ? fighter.name : '', line, duration, fighter });
    }

    sayText(speaker, line, duration = 3) {
      this.emit('say', { speaker, line, duration });
    }

    musicBoost(level) {
      SL.Music.setIntensity(Math.max(SL.Music.targetIntensity, level));
      this.musicHold = 10;
    }

    slowmo(scale, seconds) {
      if (!this.slow || this.slow.scale > scale || this.slow.t < seconds) this.slow = { scale, t: seconds };
    }

    /* ---------------- camera shots ---------------- */
    transformShot(f, seconds) {
      const startYaw = this.cameraYaw() + Math.PI;
      this.camera.playShot((t, out) => {
        const c = f.chest();
        const a = f.yaw + 0.7 - t * 1.6;
        const r = U.lerp(2.6, 5.2, U.easeInOutCubic(t)) * f.scale;
        out.pos.set(c.x + Math.sin(a) * r, c.y + U.lerp(-0.9, 0.4, t) * f.scale, c.z + Math.cos(a) * r);
        out.look.copy(c).add(new V3(0, U.lerp(0.3, 0, t), 0));
        out.fov = U.lerp(48, 60, t);
        out.roll = Math.sin(t * Math.PI) * 0.06;
      }, seconds, { blendIn: 0.3 });
      return startYaw;
    }

    ultimateChargeShot(f, seconds, high) {
      if (!this.involvesPlayer(f) && f !== this.player) {
        if (!(f.target === this.player)) return;
      }
      this.camera.playShot((t, out) => {
        const c = f.chest();
        const fw = f.forward;
        const side = new V3(-fw.z, 0, fw.x);
        const r = U.lerp(4.2, 3.2, t) * f.scale;
        out.pos.copy(c).addScaledVector(fw, r).addScaledVector(side, 1.4).add(new V3(0, high ? -1.2 : -0.6, 0));
        out.look.copy(c).add(new V3(0, high ? 1.2 + t * 1.5 : 0.1, 0));
        out.fov = U.lerp(55, 46, t);
      }, Math.min(seconds, 2.2), { blendIn: 0.25 });
    }

    clashShot(a, b, clash) {
      this.camera.playShot((t, out, el) => {
        const pa = a.chest(), pb = b.chest();
        const mid = clash.active ? clash.active.point : pa.clone().lerp(pb, 0.5);
        const axis = pb.clone().sub(pa);
        const sep = axis.length();
        axis.normalize();
        let side = new V3().crossVectors(axis, UP);
        if (side.lengthSq() < 0.01) side.set(1, 0, 0);
        side.normalize();
        const r = U.clamp(sep * 0.75, 12, 60);
        const drift = Math.sin(el * 0.35) * 0.25;
        const center = pa.clone().lerp(pb, 0.5).lerp(mid, 0.4);
        out.pos.copy(center).addScaledVector(side, r).addScaledVector(axis, sep * drift * 0.2).add(new V3(0, r * 0.22, 0));
        out.look.copy(center);
        out.fov = 55;
      }, 999, { hold: true, blendIn: 0.4, kind: 'story' });
    }

    koShot(loser) {
      this.camera.playShot((t, out) => {
        const c = loser.chest();
        const a = loser.yaw + 1.2 + t * 0.8;
        out.pos.set(c.x + Math.sin(a) * 5, c.y + 1.2, c.z + Math.cos(a) * 5);
        out.look.copy(c);
        out.fov = 50;
      }, 2.4, { blendIn: 0.2, kind: 'story' });
    }

    victoryShot(f, seconds = 4) {
      this.camera.playShot((t, out) => {
        const c = f.chest();
        const a = f.yaw + 0.35 - t * 0.25;
        const r = U.lerp(3.4, 2.9, t) * f.scale;
        out.pos.set(c.x + Math.sin(a) * r, c.y + 0.25 * f.scale, c.z + Math.cos(a) * r);
        out.look.copy(c).add(new V3(0, 0.25 * f.scale, 0));
        out.fov = 45;
      }, seconds, { blendIn: 0.1, cut: true, kind: 'story' });
    }

    introShot(f, seconds) {
      this.camera.playShot((t, out) => {
        const c = f.chest();
        const a = f.yaw + U.lerp(-0.5, 0.2, t);
        const r = U.lerp(4.4, 3.2, U.easeOutCubic(t)) * f.scale;
        out.pos.set(c.x + Math.sin(a) * r, c.y + U.lerp(-0.3, 0.15, t), c.z + Math.cos(a) * r);
        out.look.copy(c).add(new V3(0, 0.2, 0));
        out.fov = 46;
      }, seconds, { blendIn: 0, cut: true, kind: 'story' });
    }

    /* ---------------- flow ---------------- */
    start() {
      SL.Input.setBattleMode(true);
      this.phase = 'intro';
      if (this.config.onStart) this.config.onStart(this);
      if (this.mission) {
        this.mission.start();
        return;
      }
      SL.Music.play(this.stage.def.music || 'battle', { intensity: 1 });
      if (this.mode === 'training') {
        this.camera.cut();
        this._beginFight();
        return;
      }
      this.seq = new Coroutine(this._introSeq());
    }

    *_introSeq() {
      const p = this.player;
      const e = this.fighters.find((f) => f.team !== p.team);
      this.skipRequested = false;
      const skipped = () => this.skipRequested;
      if (!this.config.skipIntro && p && e) {
        for (const [f, other] of [[p, e], [e, p]]) {
          if (skipped()) break;
          f.setState('scripted', { pose: f.def.intro ? f.def.intro.pose : 'idle', speed: 6 });
          f.target = other;
          f.faceTarget(100);
          f.model.setExpression(f.def.intro ? f.def.intro.expression : 'neutral');
          this.introShot(f, 2.1);
          const line = SL.data.dialogue.introFor(f.def.id, other.def.id);
          if (line) this.emit('say', { speaker: f.name, line, duration: 2.1, fighter: f });
          const end = performance.now() + 2100;
          yield () => skipped() || performance.now() >= end;
        }
      }
      this.camera.endShot();
      this.camera.cut();
      this.emit('clearSubtitles', {});
      for (const f of this.fighters) if (f.state === 'scripted') f.setState('free');
      this.phase = 'ready';
      this.emit('ready', {});
      SL.Audio.play('gong');
      yield 1.1;
      this._beginFight();
    }

    _beginFight() {
      this.phase = 'fight';
      this.inputLocked = false;
      this.aiLocked = false;
      this.emit('fightStart', {});
    }

    requestSkip() {
      this.skipRequested = true;
      if (this.phase === 'victory' && this.victoryTimer !== undefined) this.victoryTimer = Math.min(this.victoryTimer, 0.2);
    }

    onKO(f, att, hit) {
      this.emit('ko', { fighter: f, attacker: att });
      this.releaseMeleeToken(f);
      f.koFrame = this.frame;
      for (const ally of this.alliesOf(f)) SL.mech(ally, 'on', 'allyDefeated');
      if (this.mission) {
        this.mission.onKO(f, att);
        return;
      }
      const teams = new Set(this.fighters.filter((o) => o.alive).map((o) => o.team));
      if (teams.size <= 1) {
        const winnerTeam = teams.size ? [...teams][0] : -1;
        this.finish({ winnerTeam, loser: f, reason: 'ko' });
      }
    }

    finish(result) {
      if (this.phase === 'ko' || this.phase === 'victory' || this.phase === 'end') return;
      this.phase = 'ko';
      this.inputLocked = true;
      this.aiLocked = true;
      this.result = result;
      const p = this.player;
      result.won = p ? result.winnerTeam === p.team : false;
      this.slowmo(0.22, 1.1);
      SL.ScreenFX.flash(0.55);
      SL.Audio.play('ko');
      SL.Music.stop(0.8);
      if (result.loser && result.reason === 'ko') this.koShot(result.loser);
      this.emit('finishKO', result);
      this.seq = new Coroutine(this._victorySeq(result));
    }

    *_victorySeq(result) {
      yield 2.3;
      this.phase = 'victory';
      this.emit('victoryStart', result);
      this.projectiles.beams.forEach((b) => b.stop());
      const winners = this.fighters.filter((f) => f.alive && f.team === result.winnerTeam);
      const w = winners.find((f) => f.isPlayer) || winners[0];
      if (w) {
        w.vel.set(0, 0, 0);
        const vp = w.def.victory && w.def.victory.poses ? U.pick(w.def.victory.poses) : 'victory';
        w.setState('scripted', { pose: vp, speed: 5, expression: w.def.victory ? w.def.victory.expression : 'smirk' });
        w.applyForm(w.formIndex);
        this.victoryShot(w, 4);
        this.say(w, w.def.id + '_victory');
      }
      SL.Music.stinger(result.won ? 'victory' : 'defeat');
      this.victoryTimer = 3.6;
      this.skipRequested = false;
      yield () => {
        this.victoryTimer -= 1 / 60;
        return this.victoryTimer <= 0;
      };
      this.phase = 'end';
      this.emit('end', result);
      if (this.config.onEnd) this.config.onEnd(this, result);
    }

    pause() {
      if (this.paused || this.phase === 'end') return;
      this.paused = true;
      SL.Audio.duckMusic(true);
      SL.Input.exitPointerLock();
      this.emit('paused', {});
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;
      SL.Audio.duckMusic(false);
      SL.Input.clearToggles();
      this.emit('resumed', {});
    }

    /* ---------------- update ---------------- */
    update(dt) {
      if (this.disposed) return;
      const frameDt = Math.min(dt, 0.1);
      if (this.paused) {
        this.camera.update(0, null);
        return;
      }
      let scale = 1;
      if (this.slow) {
        this.slow.t -= frameDt;
        if (this.slow.t > 0) scale = this.slow.scale;
        else this.slow = null;
      }
      if (this.seq) this.seq.update(frameDt);
      if (this.mission) this.mission.update(frameDt);

      this.acc += frameDt * scale;
      let steps = 0;
      const maxSteps = SL.debugMaxSteps || 5;
      while (this.acc >= TICK && steps < maxSteps) {
        this.tick();
        this.acc -= TICK;
        steps++;
      }
      if (steps >= maxSteps) this.acc = 0;
      const alpha = this.acc / TICK;
      for (const f of this.fighters) f.object.position.lerpVectors(f.prevPos, f.pos, alpha);

      const p = this.player;
      const lookInput = this.phase === 'fight' && !this.camera.inShot ? this.lookAcc : { x: 0, y: 0 };
      this.camera.update(frameDt, p ? { player: p, target: p.target, stage: this.stage, look: lookInput, fastFollow: p.state === 'dash' || p.speed > 26 } : { focus: new V3(), distance: 12 });
      this.lookAcc.x = this.lookAcc.y = 0;
      const focus = p ? p.pos : new V3();
      this.stage.update(frameDt, focus);
      this.vfx.update(frameDt * Math.max(scale, 0.35), this.camera.camera);
      SL.ScreenFX.update(frameDt);
      if (p && p.alive) SL.ScreenFX.vignette(p.hpFrac < 0.25 ? (0.25 - p.hpFrac) * 2.4 : 0);
      else SL.ScreenFX.vignette(0);
    }

    tick() {
      this.frame++;
      if (this.player && !this.paused) {
        SL.Input.poll();
        this.lookAcc.x += SL.Input.look.x;
        this.lookAcc.y += SL.Input.look.y;
        if (this.phase === 'intro' || this.phase === 'victory') {
          const I = SL.Input;
          if (I.pressed('light') || I.pressed('heavy') || I.pressed('blast') || I.pressed('ascend') || I.pressed('special1')) this.requestSkip();
        }
      }
      if (this.mission) this.mission.tick();
      this.assignTargets();
      for (const f of this.fighters) {
        if (this.isFrozen(f)) {
          f.prevPos.copy(f.pos);
          continue;
        }
        f.update();
      }
      this._separate();
      this.projectiles.update();
      this.clash.update();

      if (this.phase === 'fight' && !this.cinematicOwners) {
        this.fightTime += TICK;
        if (this.rules.timeLimit > 0 && this.fightTime >= this.rules.timeLimit && !this.mission) this._timeUp();
      }
      this._dynamicMusic();

      if (this.mission) {
        for (const f of this.fighters.slice()) {
          if (!f.alive && !f.isPlayer && f.koFrame !== undefined && this.frame - f.koFrame > 300) this.remove(f);
        }
      }
    }

    _timeUp() {
      const p = this.player;
      const teams = {};
      for (const f of this.fighters) teams[f.team] = (teams[f.team] || 0) + (f.alive ? f.hpFrac : 0);
      let best = -1, bestV = -1;
      for (const k of Object.keys(teams)) if (teams[k] > bestV) {
        bestV = teams[k];
        best = Number(k);
      }
      this.emit('timeUp', {});
      this.finish({ winnerTeam: best, reason: 'time', loser: null });
      if (p) this.victoryShot(p, 2);
    }

    _dynamicMusic() {
      if (this.phase !== 'fight' || this.frame % 30 !== 0) return;
      if (this.musicHold > 0) {
        this.musicHold -= 0.5;
        return;
      }
      const p = this.player;
      if (!p) return;
      let lvl = 1;
      const t = p.target;
      if (this.fightTime > 8) lvl = 2;
      if (p.hpFrac < 0.3 || (t && t.hpFrac < 0.25) || p.formIndex > 0 || (t && t.formIndex > 0)) lvl = 3;
      if (this.mission && this.mission.musicLevel !== undefined) lvl = this.mission.musicLevel;
      SL.Music.setIntensity(lvl);
    }

    _separate() {
      const fs = this.fighters;
      for (let i = 0; i < fs.length; i++) {
        const a = fs[i];
        if (!a.alive || a.hidden) continue;
        for (let j = i + 1; j < fs.length; j++) {
          const b = fs[j];
          if (!b.alive || b.hidden || a.state === 'held' || b.state === 'held') continue;
          const dx = b.pos.x - a.pos.x, dy = (b.pos.y + b.height * 0.5) - (a.pos.y + a.height * 0.5), dz = b.pos.z - a.pos.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const minD = (a.radius + b.radius) * 1.05;
          if (d < minD && d > 0.0001) {
            const push = (minD - d) * 0.5;
            const nx = dx / d, ny = (dy / d) * 0.3, nz = dz / d;
            a.pos.x -= nx * push;
            a.pos.z -= nz * push;
            b.pos.x += nx * push;
            b.pos.z += nz * push;
            if (!a.grounded) a.pos.y -= ny * push;
            if (!b.grounded) b.pos.y += ny * push;
          }
        }
      }
    }

    render() {
      SL.Render.render(this.scene, this.camera.camera);
    }

    dispose() {
      if (this.disposed) return;
      this.disposed = true;
      if (this.seq) this.seq.stop();
      if (this.mission && this.mission.dispose) this.mission.dispose();
      for (const f of this.fighters) f.dispose();
      this.fighters = [];
      this.projectiles.dispose();
      this.vfx.dispose();
      this.stage.dispose();
      this._resizeOff();
      SL.ScreenFX.reset();
      SL.Input.setBattleMode(false);
      this.scene.traverse((o) => {
        if (o.geometry && !SL.ModelBuilder.geoCache.has(o.geometry) && o.geometry.dispose) {
          let shared = false;
          for (const g of SL.ModelBuilder.geoCache.values()) if (g === o.geometry) { shared = true; break; }
          if (!shared) o.geometry.dispose();
        }
      });
      this.listeners = {};
    }
  }

  SL.Battle = Battle;
})();
