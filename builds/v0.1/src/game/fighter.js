/*
 * Fighter: the shared combat framework every character runs on.
 * Characters differ through data (moves, specials, forms, poses, stats) and
 * mechanics (src/game/mechanics.js). Player and CPU fighters use the exact
 * same rules — both are driven by an "intent" produced by a controller.
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;
  const UP = new V3(0, 1, 0);
  let NEXT_ID = 1;

  const CHASE_SMASH = { id: 'chaseSmash', startup: 5, active: 6, recovery: 22, damage: 640, reach: 1.1, radius: 1.05, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' };
  const CHASE_STRIKE = { id: 'chaseStrike', startup: 5, active: 6, recovery: 22, damage: 600, reach: 1.2, radius: 1.05, lunge: 16, hitstun: 34, knock: 'heavy', knockSpeed: 28, impact: 3, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' };
  const BLAST_DEFAULT = { color: 0xffd84a, core: 0xffffff, damage: 150, speed: 72, radius: 0.3 };

  function emptyIntent() {
    return {
      mx: 0, my: 0, up: false, upPressed: false, down: false, boost: false, boostPressed: false,
      light: false, heavy: false, blast: false, blastHeld: false, guard: false, dodge: false, charge: false,
      s1: false, s1Held: false, s2: false, s2Held: false, ult: false, ultHeld: false,
      transform: false, revert: false, target: false,
    };
  }
  const PRESS_KEYS = ['light', 'heavy', 'blast', 's1', 's2', 'ult', 'dodge'];

  class Fighter {
    constructor(battle, def, opts = {}) {
      this.battle = battle;
      this.def = def;
      this.id = NEXT_ID++;
      this.team = opts.team || 0;
      this.isPlayer = !!opts.isPlayer;
      this.name = opts.name || def.name;
      this.controller = opts.controller || null;
      this.tags = opts.tags || {};

      let modelDef = def;
      if (opts.skin !== undefined) {
        modelDef = { ...def, appearance: { ...def.appearance, skin: opts.skin } };
      }
      this.model = new SL.Model(modelDef);
      this.object = new THREE.Group();
      this.object.add(this.model.root);
      battle.scene.add(this.object);
      this.model.root.traverse((o) => {
        if (o.isMesh && !o.userData.isOutline) o.castShadow = battle.shadowsOn;
      });

      this.poses = Object.assign({}, SL.data.poses, def.poses || {});
      this.anim = new SL.Animator(this.model, this.poses);
      this.anim.ctx = this;
      this.scale = def.appearance.height || 1;
      this.height = 1.85 * this.scale;
      this.radius = 0.42 * this.scale;
      this.cameraScale = Math.max(1, this.scale);

      this.pos = new V3();
      this.prevPos = new V3();
      this.vel = new V3();
      this.yaw = 0;
      this.speed = 0;
      this.grounded = false;

      const s = def.stats;
      this.hpMax = Math.round(s.hp * (opts.hpMul || 1));
      this.hp = this.hpMax;
      this.kiMax = s.ki;
      this.ki = opts.startKi !== undefined ? opts.startKi : 30;
      this.staminaMax = s.stamina;
      this.stamina = this.staminaMax;
      this.staminaDelay = 0;
      this.infiniteHp = !!opts.infiniteHp;
      this.infiniteKi = !!opts.infiniteKi;
      this.infiniteStamina = !!opts.infiniteStamina;
      this.balance = opts.balance || 'balanced';
      this.cannotDie = !!opts.cannotDie;
      this.damageTakenMul = opts.damageTakenMul || 1;
      this.damageDealtMul = opts.damageDealtMul || 1;

      this.formIndex = 0;
      this.form = def.forms[0];
      this.alive = true;
      this.state = 'free';
      this.stateFrame = 0;
      this.sd = {};
      this.target = null;
      this.freeze = 0;
      this.invuln = 0;
      this.chain = 0;
      this.chainTimer = 0;
      this.combo = { hits: 0, damage: 0, timer: 0 };
      this.chaseCount = 0;
      this.cooldowns = {};
      this.followFrames = 0;
      this.followBonus = 1;
      this.counterFrames = 0;
      this.frame = 0;
      this.buffer = null;
      this.flash = 0;
      this.blastHand = 0;
      this.hidden = false;
      this.stats = { damage: 0, maxCombo: 0, ultimates: 0, transforms: 0, clashesWon: 0, hitsTaken: 0 };
      this.intent = emptyIntent();
      this.loops = {};
      this.mech = {};
      SL.mech(this, 'init');

      this.aura = battle.vfx.createAura(this);
      this.aura.setStyle(this.form.aura || { color: 0xffffff });
      this.anim.play('idle', 10, { snap: true });
    }

    /* ---------------- geometry helpers ---------------- */
    get forward() {
      return new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    }
    chest(out = new V3()) {
      return out.set(this.pos.x, this.pos.y + this.height * 0.55, this.pos.z);
    }
    dirTo(other, out = new V3()) {
      const a = this.chest(), b = other.chest();
      out.subVectors(b, a);
      const l = out.length();
      if (l < 0.0001) return out.copy(this.forward);
      return out.divideScalar(l);
    }
    distTo(other) {
      return this.chest().distanceTo(other.chest());
    }
    /** Distance from a point to this fighter's body capsule. */
    capsuleDistance(p) {
      const y0 = this.pos.y + this.height * 0.2, y1 = this.pos.y + this.height * 0.92;
      const cy = U.clamp(p.y, y0, y1);
      const dx = p.x - this.pos.x, dz = p.z - this.pos.z, dy = p.y - cy;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    setPosition(v) {
      this.pos.copy(v);
      this.prevPos.copy(v);
      this.object.position.copy(v);
    }
    faceTarget(rate = 12) {
      const t = this.target;
      if (!t) return;
      const dx = t.pos.x - this.pos.x, dz = t.pos.z - this.pos.z;
      if (dx * dx + dz * dz < 0.0004) return;
      this.yaw = rate >= 100 ? Math.atan2(dx, dz) : U.dampAngle(this.yaw, Math.atan2(dx, dz), rate, TICK);
    }
    handPos(side = 'R', out = new V3()) {
      this.model.root.updateMatrixWorld(true);
      const j = this.model.joints['hand' + side];
      j.getWorldPosition(out);
      // hands are part of the render object, which is interpolated: re-base on sim position
      out.sub(this.object.position).add(this.pos);
      return out;
    }
    mult() {
      return R.multipliers(this);
    }
    get hpFrac() {
      return this.hp / this.hpMax;
    }
    enemies() {
      return this.battle.enemiesOf(this);
    }

    setState(name, data) {
      const prev = this.state;
      if (prev !== name || data) this._exitState(prev, name);
      this.state = name;
      this.stateFrame = 0;
      this.sd = data || {};
    }

    _exitState(prev, next) {
      const sd = this.sd;
      if (sd.orb) {
        sd.orb.visible = false;
        sd.orb = null;
      }
      if (this.loops.beamCharge) {
        this.loops.beamCharge.stop(0.1);
        this.loops.beamCharge = null;
      }
      if (prev === 'beamFire' && next !== 'clash' && sd.beam && !sd.beam.done) sd.beam.stop();
      if (prev === 'clash' && sd.beam && !sd.beam.done && next !== 'beamFire') sd.beam.stop();
      if (prev === 'spiritBomb' && sd.bomb && !sd.released) sd.bomb.cancel();
      if (prev === 'throw' && sd.victim && sd.victim.state === 'held') sd.victim.setState('free');
      if (prev === 'rush' && sd.victim && sd.victim.state === 'held') sd.victim.setState('free');
      if (prev === 'transform' && sd.cinematic) this.battle.endCinematic(this);
      if (prev === 'vanish' || prev === 'teleport') this.setHidden(false);
    }

    setHidden(h) {
      this.hidden = h;
      this.model.root.visible = !h;
    }

    /* ---------------- main update (one simulation tick) ---------------- */
    update() {
      this.frame++;
      this.prevPos.copy(this.pos);
      if (!this.alive) {
        STATES.ko.call(this, emptyIntent());
        this._physics();
        this._post(false);
        return;
      }
      // read input every tick — presses made during hit-stop are buffered, never lost
      const it = (this.intent = this.controller ? this.controller.update(this) : emptyIntent());
      for (const k of PRESS_KEYS) {
        if (it[k]) this.buffer = { action: k, frame: this.frame };
      }
      if (it.guard && it.heavy) this.buffer = { action: 'throw', frame: this.frame };
      if (this.freeze > 0) {
        this.freeze--;
        if (this.buffer) this.buffer.frame = this.frame;
        this._post(true);
        return;
      }
      if (it.target) this.battle.cycleTarget(this);

      this.stateFrame++;
      if (this.invuln > 0) this.invuln--;
      for (const k in this.cooldowns) if (this.cooldowns[k] > 0) this.cooldowns[k]--;
      if (this.followFrames > 0) this.followFrames--;
      if (this.counterFrames > 0) this.counterFrames--;
      if (this.chainTimer > 0) {
        this.chainTimer--;
        if (this.chainTimer === 0 && this.state !== 'attack') this.chain = 0;
      }
      if (this.combo.timer > 0) {
        this.combo.timer--;
        if (this.combo.timer === 0) this._endCombo();
      }
      this._regen();
      SL.mech(this, 'update', TICK);

      const handler = STATES[this.state] || STATES.free;
      handler.call(this, it);
      this._physics();
      this._post(false);
    }

    _regen() {
      const m = this.mult();
      if (this.infiniteKi) this.ki = this.kiMax;
      else if (!['charge', 'beamCharge', 'beamFire', 'clash', 'spiritBomb', 'transform', 'ko'].includes(this.state)) {
        this.ki = Math.min(this.kiMax, this.ki + m.kiRegen * (SL.mech(this, 'kiRegenMul') || 1) * TICK * 0.5);
      }
      if (this.infiniteStamina) this.stamina = this.staminaMax;
      else if (this.staminaDelay > 0) this.staminaDelay--;
      else if (this.state !== 'guard') this.stamina = Math.min(this.staminaMax, this.stamina + 24 * m.staminaRegen * TICK);
      const drain = this.form.drain;
      if (drain && this.hp > this.hpMax * drain.minHpFrac) this.hp = Math.max(this.hpMax * drain.minHpFrac, this.hp - drain.hpPerSec * TICK);
      if (this.infiniteHp && this.combo.timer === 0 && this.state === 'free' && this.hp < this.hpMax) this.hp = Math.min(this.hpMax, this.hp + this.hpMax * TICK * 0.5);
    }

    _consumeBuffer(it, windowFrames = 8) {
      const b = this.buffer;
      if (!b) return it;
      this.buffer = null;
      if (this.frame - b.frame > windowFrames) return it;
      if (b.action === 'throw') return { ...it, guard: true, heavy: true };
      return { ...it, [b.action]: true };
    }

    /* ---------------- movement ---------------- */
    _moveBasis() {
      const t = this.target;
      const fwd = new V3();
      if (t && t.alive) {
        fwd.set(t.pos.x - this.pos.x, 0, t.pos.z - this.pos.z);
        if (fwd.lengthSq() < 0.01) fwd.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      } else {
        const cy = this.intent.camYaw !== undefined ? this.intent.camYaw : this.yaw;
        fwd.set(Math.sin(cy), 0, Math.cos(cy));
      }
      fwd.normalize();
      const right = new V3(-fwd.z, 0, fwd.x);
      return { fwd, right };
    }

    _wish(it) {
      const { fwd, right } = this._moveBasis();
      const w = new V3().addScaledVector(fwd, it.my).addScaledVector(right, it.mx);
      const len = Math.min(1, w.length());
      if (len > 0.001) w.normalize();
      return { dir: w, len, fwd, right };
    }

    _locomotion(it, speedMul = 1) {
      const m = this.mult();
      const stage = this.battle.stage;
      const { dir, len } = this._wish(it);
      if (this.grounded) {
        if (it.upPressed || (it.up && this.stateFrame > 2)) {
          this.grounded = false;
          this.vel.y = 9;
          this.battle.sfx('jump', this);
          this.battle.vfx.dust(this.pos, 0.6, 6);
        }
        const spd = (it.boost ? 16 : R.SPEED.run) * m.speed * len * speedMul;
        this.vel.x = U.damp(this.vel.x, dir.x * spd, 14, TICK);
        this.vel.z = U.damp(this.vel.z, dir.z * spd, 14, TICK);
        if (this.grounded) this.vel.y = 0;
      } else {
        const spd = (it.boost ? R.SPEED.boost : R.SPEED.fly) * m.speed * speedMul;
        const desired = dir.clone().multiplyScalar(spd * len);
        let vy = 0;
        if (it.up) vy += R.SPEED.vertical * (it.boost ? 2 : 1) * m.speed;
        if (it.down) vy -= R.SPEED.vertical * (it.boost ? 2 : 1) * m.speed;
        this.sd.homing = false;
        const t = this.target;
        if (it.boost && len < 0.2 && !it.up && !it.down && t && t.alive) {
          const d = t.chest().sub(this.chest());
          const dist = d.length();
          if (dist > 3.4) {
            desired.copy(d.divideScalar(dist)).multiplyScalar(R.SPEED.homing * m.speed * speedMul);
            vy = desired.y;
            this.sd.homing = true;
          }
        }
        desired.y = vy;
        const rate = it.boost ? 5 : 9;
        this.vel.x = U.damp(this.vel.x, desired.x, rate, TICK);
        this.vel.y = U.damp(this.vel.y, desired.y, rate + 2, TICK);
        this.vel.z = U.damp(this.vel.z, desired.z, rate, TICK);
        if (it.down && stage.hasGround) {
          const gh = stage.heightAt(this.pos.x, this.pos.z);
          if (this.pos.y - gh < 0.9) {
            this.grounded = true;
            this.pos.y = gh;
            this.vel.y = 0;
            this.battle.vfx.dust(this.pos, 0.8, 8);
          }
        }
      }
      this.speed = this.vel.length();
    }

    _locomotionPose() {
      const v = this.vel;
      if (this.grounded) {
        const hs = Math.hypot(v.x, v.z);
        if (hs < 0.8) this.anim.play(this.stamina < 12 && !this.infiniteStamina ? 'exhausted' : 'idle', 9);
        else {
          this.runRate = U.clamp(hs / 9, 0.6, 1.6);
          this.anim.play('run', 10);
        }
        return;
      }
      const fwd = this.forward;
      const right = new V3(-fwd.z, 0, fwd.x);
      const f = v.x * fwd.x + v.z * fwd.z;
      const s = v.x * right.x + v.z * right.z;
      let pose = 'flyIdle';
      if (this.sd.homing || this.speed > 27) pose = 'dash';
      else if (this.speed < 2.5) pose = 'flyIdle';
      else if (f > 4 && f >= Math.abs(s)) pose = 'flyForward';
      else if (f < -4 && -f >= Math.abs(s)) pose = 'flyBack';
      else if (Math.abs(s) > 4) pose = s > 0 ? 'strafeR' : 'strafeL';
      else if (v.y > 3) pose = 'flyUp';
      else if (v.y < -3) pose = 'flyDown';
      this.anim.play(pose, pose === 'dash' ? 10 : 7);
    }

    /* ---------------- action starters ---------------- */
    _tryActions(it) {
      if (it.transform && this._tryTransform()) return true;
      if (it.revert && this.formIndex > 0) {
        this._powerDown();
        return true;
      }
      if (it.s1 && this._trySpecial('special1')) return true;
      if (it.s2 && this._trySpecial('special2')) return true;
      if (it.ult && this._trySpecial('ultimate')) return true;
      if (it.dodge && this._startDodge(it)) return true;
      if (it.guard && it.heavy) {
        this._startThrow();
        return true;
      }
      if (it.heavy) {
        if (this._tryChase()) return true;
        this._startHeavy();
        return true;
      }
      if (it.light) {
        if ((this.speed > 20 || this.state === 'dash') && this.def.moves.dash) this._startAttack(this.def.moves.dash, 'dash', 0);
        else this._startLight();
        return true;
      }
      if (it.blast && this._startBlast()) return true;
      if (it.guard) {
        this.setState('guard', {});
        return true;
      }
      if (it.charge) {
        this.setState('charge', {});
        return true;
      }
      return false;
    }

    _denied() {
      if (this.isPlayer) {
        SL.Audio.play('uiError');
        this.battle.emit('denied', { fighter: this });
      }
    }

    _startLight() {
      const lights = this.def.moves.light;
      if (!lights || !lights.length) return false;
      let idx = this.chainTimer > 0 || this.state === 'attack' ? this.chain : 0;
      if (idx >= lights.length) idx = 0;
      this._startAttack(lights[idx], 'light', idx);
      return true;
    }

    _startHeavy() {
      const idx = this.chainTimer > 0 || this.state === 'attack' ? this.chain : 0;
      const mv = R.heavyFor(this.def.moves.heavy || {}, idx);
      if (!mv) return this._startLight();
      this._startAttack(mv, 'heavy', idx);
      return true;
    }

    _startAttack(move, kind, chainIdx) {
      const m = this.mult();
      let startupMul = 1 / Math.sqrt(m.speed);
      let bonus = 1;
      if (this.followFrames > 0) {
        startupMul *= 0.5;
        bonus = this.followBonus;
        this.followFrames = 0;
      }
      const startup = Math.max(2, Math.round(move.startup * startupMul));
      this.setState('attack', { move, kind, hit: false, hitSet: new Set(), startup, bonus, whiffPenalty: 0 });
      if (kind === 'light') this.chain = chainIdx + 1;
      else this.chain = 0;
      this.chainTimer = 0;
      this.anim.play(move.pose.wind, 20);
      this.grounded = this.grounded && kind !== 'dash';
    }

    _startDodge(it) {
      const cost = R.COST.dodge * (SL.mech(this, 'costMul', 'dodge') || 1);
      if (!R.spendStamina(this, cost)) {
        this._denied();
        return false;
      }
      const w = this._wish(it);
      let dir = w.len > 0.2 ? w.dir.clone() : w.fwd.clone().negate();
      if (it.up) dir.y += 0.8;
      if (it.down) dir.y -= 0.8;
      dir.normalize();
      this.setState('dodge', { dir });
      this.invuln = 10;
      this.vel.copy(dir).multiplyScalar(24);
      if (dir.y > 0.2) this.grounded = false;
      this.battle.vfx.afterimage(this.pos, this.height, 0xcfe8ff);
      this.battle.sfx('dodge', this);
      return true;
    }

    _startThrow() {
      const th = this.def.moves.throw;
      if (!th) return this._startHeavy();
      this.setState('throw', { th });
      this.anim.play('grab', 22);
      return true;
    }

    _tryChase() {
      const t = this.target;
      if (!t || !t.alive || t.state !== 'knockback' || t.stateFrame > 45) return false;
      if (this.chaseCount >= 2) return false;
      if (this.pos.distanceTo(t.pos) > 45) return false;
      if (!R.canAfford(this, R.COST.chaseKi) || (this.stamina < R.COST.chaseStamina && !this.infiniteStamina)) return false;
      R.spendKi(this, R.COST.chaseKi);
      R.spendStamina(this, R.COST.chaseStamina);
      this.chaseCount++;
      const launched = t.sd.knock === 'launch';
      const lead = t.vel.clone().multiplyScalar(0.09);
      const dest = t.pos.clone().add(lead);
      if (launched) dest.y += 2.4 * t.scale;
      else {
        const dv = t.vel.clone().setY(0);
        if (dv.lengthSq() < 1) dv.copy(t.pos).sub(this.pos).setY(0);
        dest.addScaledVector(dv.normalize(), 2.3);
      }
      this.battle.stage.clampPosition(dest);
      this.battle.vfx.afterimage(this.pos, this.height);
      this.battle.sfx('vanish', this);
      this.pos.copy(dest);
      this.prevPos.copy(dest);
      this.grounded = false;
      this.vel.set(0, 0, 0);
      this.faceTarget(100);
      this.battle.vfx.afterimage(this.pos, this.height);
      this._startAttack(launched ? CHASE_SMASH : CHASE_STRIKE, 'heavy', 0);
      this.battle.emit('chase', { fighter: this });
      return true;
    }

    _startBlast() {
      if (!R.canAfford(this, R.COST.blastKi)) {
        this._denied();
        return false;
      }
      this.setState('blast', { count: 0, fired: false, charged: false });
      this.anim.play('blastWind', 30);
      return true;
    }

    _fireBlast() {
      if (!R.spendKi(this, R.COST.blastKi)) return false;
      const side = this.blastHand++ % 2 === 0 ? 'R' : 'L';
      const origin = this.handPos(side);
      const bd = this.def.blast || BLAST_DEFAULT;
      const t = this.target;
      const dir = t && t.alive ? t.chest().sub(origin).normalize() : this.forward;
      if (t && t.alive) {
        dir.x += U.rand(-0.03, 0.03);
        dir.y += U.rand(-0.03, 0.03);
        dir.normalize();
      }
      this.battle.projectiles.spawnBlast(this, origin, dir, {
        kind: 'blast', speed: bd.speed, radius: bd.radius, damage: bd.damage, color: bd.color, core: bd.core,
        homing: 0.6, knock: 'flinch', impact: 1, hitstun: 12, explode: 0.9, life: 2.2,
      });
      this.anim.play(side === 'R' ? 'blastR' : 'blastL', 45, { restart: true });
      this.battle.sfx('kiBlast', this, { pitch: bd.sfxPitch || 1 });
      return true;
    }

    _trySpecial(slot, opts = {}) {
      const sp = this.def.specials && this.def.specials[slot];
      if (!sp) return false;
      if (this.cooldowns[slot] > 0) return false;
      if (!this.battle.rules.allowUltimates && slot === 'ultimate') return false;
      if (sp.type === 'teleport') return this._startTeleport(sp, slot, opts);
      if (!R.canAfford(this, sp.kiCost)) {
        this._denied();
        return false;
      }
      if (!this.target && sp.type !== 'beam') return false;
      switch (sp.type) {
        case 'beam':
          this.setState('beamCharge', { spec: sp, slot });
          this.anim.play(sp.poses.charge, 14);
          this.loops.beamCharge = SL.Audio.loop('beamCharge', { vol: this.battle.volFor(this) });
          break;
        case 'projectile':
          this.setState('specialThrow', { spec: sp });
          this.anim.play(sp.pose.wind, 18);
          break;
        case 'rush':
          R.spendKi(this, sp.kiCost);
          this.setState('rush', { spec: sp, phase: 'wind' });
          this.anim.play(sp.poses.wind, 20);
          break;
        case 'spiritBomb':
          R.spendKi(this, sp.kiCost);
          this.setState('spiritBomb', { spec: sp });
          this.anim.play(sp.poses.charge, 8);
          break;
        default:
          return false;
      }
      if (slot === 'ultimate') this.stats.ultimates++;
      this.battle.emit('special', { fighter: this, spec: sp, slot });
      return true;
    }

    _startTeleport(sp, slot, opts) {
      const t = this.target;
      if (!t || !t.alive) return false;
      const escape = ['hitstun', 'knockback'].includes(this.state) || !!opts.escape;
      const cost = escape ? sp.escapeKiCost : sp.kiCost;
      if (!R.canAfford(this, cost)) {
        this._denied();
        return false;
      }
      R.spendKi(this, cost);
      this.cooldowns[slot] = sp.cooldown;
      this.setState('teleport', { spec: sp, escape });
      this.anim.play(sp.pose, 30);
      if (escape) this.invuln = 20;
      this.battle.sfx('teleport', this);
      this.battle.emit('special', { fighter: this, spec: sp, slot });
      return true;
    }

    _tryTransform() {
      if (!this.battle.rules.allowTransform) return false;
      const next = this.def.forms[this.formIndex + 1];
      if (!next) return false;
      if (this.battle.rules.maxForm !== undefined && this.formIndex + 1 > this.battle.rules.maxForm) return false;
      if (!R.canAfford(this, next.kiCost)) {
        this._denied();
        return false;
      }
      R.spendKi(this, next.kiCost);
      this.setState('transform', { form: next, index: this.formIndex + 1 });
      this.stats.transforms++;
      this.battle.emit('transformStart', { fighter: this, form: next });
      return true;
    }

    applyForm(index) {
      this.formIndex = index;
      this.form = this.def.forms[index];
      this.model.setForm(this.form);
      this.aura.setStyle(this.form.aura || { color: 0xffffff });
      this.battle.emit('formChanged', { fighter: this, form: this.form });
    }

    _powerDown() {
      this.applyForm(0);
      this.battle.vfx.flash(this.chest(), 3, 0xffffff, 0.2, SL.Toon.tex.glow);
      this.battle.sfx('kiUp', this, { pitch: 0.6 });
    }

    _stagger(frames) {
      if (!this.alive) return;
      this.setState('stagger', { frames });
      this.vel.multiplyScalar(0.2);
    }

    _endCombo() {
      if (this.combo.hits > this.stats.maxCombo) this.stats.maxCombo = this.combo.hits;
      if (this.combo.hits > 0) this.battle.emit('comboEnd', { fighter: this, hits: this.combo.hits, damage: this.combo.damage });
      this.combo.hits = 0;
      this.combo.damage = 0;
      this.chaseCount = 0;
    }

    /* ---------------- melee hit detection ---------------- */
    _meleeCheck(mv) {
      const sd = this.sd;
      const t = this.target;
      const c = this.chest();
      let dir;
      if (t && t.alive && this.distTo(t) < mv.reach * this.scale + 3) dir = this.dirTo(t);
      else dir = this.forward;
      const center = c.addScaledVector(dir, mv.reach * this.scale);
      const r = mv.radius * this.scale;
      for (const e of this.enemies()) {
        if (sd.hitSet.has(e)) continue;
        // a well-timed dodge reads the incoming strike slightly early, so vanishing is practical
        const vanishReach = e.state === 'dodge' && e.stateFrame <= R.VANISH_WINDOW ? 1.8 : 0;
        if (e.capsuleDistance(center) < r + e.radius + vanishReach) {
          sd.hitSet.add(e);
          const res = e.takeHit(this, {
            type: 'melee', damage: mv.damage * sd.bonus, knock: mv.knock, knockSpeed: mv.knockSpeed, hitstun: mv.hitstun,
            impact: mv.impact, guardCrush: mv.guardCrush, guardDamage: mv.guardDamage, pose: mv.hitPose, sfx: mv.sfx,
            heavy: sd.kind !== 'light', dir: this.dirTo(e), point: center,
          });
          if (res === 'hit' || res === 'blocked' || res === 'armored' || res === 'guardBreak') sd.hit = true;
          if (res === 'vanished') sd.whiffPenalty = 14;
          if (res === 'perfect') return;
        }
      }
      this.battle.stage.meleeProps(this, center, r, mv.damage * sd.bonus, mv.impact);
    }

    /* ---------------- receiving hits ---------------- */
    /**
     * hit: { type, damage, knock, knockSpeed, hitstun, impact, guardCrush, guardDamage, pose, dir, point, color, sfx }
     * returns 'miss' | 'vanished' | 'perfect' | 'blocked' | 'guardBreak' | 'armored' | 'hit'
     */
    takeHit(att, hit) {
      if (!this.alive) return 'miss';
      const dir = hit.dir ? hit.dir.clone() : att ? att.dirTo(this) : this.forward.negate();
      if (this.state === 'dodge' && this.stateFrame <= R.VANISH_WINDOW && att && (hit.type === 'melee' || hit.type === 'ki') && this._vanishCounter(att)) return 'vanished';
      if (this.invuln > 0 || this.state === 'vanish') return 'miss';
      if (this.state === 'transform') return 'miss';

      if (this.state === 'guard' && hit.type !== 'throw') {
        const facing = this.forward.dot(dir.clone().setY(0).normalize().negate());
        if (facing > -0.35) {
          if (this.stateFrame <= R.PERFECT_GUARD_WINDOW && (hit.type === 'melee' || hit.type === 'ki')) return this._perfectGuard(att, hit, dir);
          return this._block(att, hit, dir);
        }
      }

      let armorLevel = 0;
      if (this.state === 'attack' && this.sd.move && this.sd.move.armor) armorLevel = 2;
      if (this.state === 'rush' && this.sd.phase === 'dash') armorLevel = 2;
      if (SL.mech(this, 'armor', hit)) armorLevel = Math.max(armorLevel, 1);
      const armored = hit.type !== 'throw' && hit.knock !== 'held' && (hit.impact || 1) <= armorLevel && hit.type !== 'beam';

      const dmg = this._damageFrom(att, hit, false);
      const point = hit.point ? hit.point.clone() : this.chest().addScaledVector(dir, -this.radius);
      this._applyDamage(dmg, att, hit, point);
      const impact = hit.impact || 1;
      this.flash = 1;
      this.anim.shake = 0.12 + impact * 0.03;
      this.battle.hitEffects(att, this, hit, point, armored ? 1 : impact);
      if (!this.alive) return 'hit';
      if (armored) return 'armored';
      this._react(att, hit, dir);
      return 'hit';
    }

    _damageFrom(att, hit, guarded) {
      const attackerMul = att ? att.mult().damage * (SL.mech(att, 'damageOut', hit) || 1) * att.damageDealtMul * (att.counterFrames > 0 ? 1.15 : 1) : 1;
      const inMul = (SL.mech(this, 'damageIn', hit) || 1) * this.damageTakenMul;
      const defenderMul = this.mult().defense / inMul;
      return R.computeDamage({
        base: hit.damage,
        type: hit.type === 'throw' ? 'melee' : hit.type,
        hitIndex: att ? att.combo.hits + 1 : 1,
        attackerMul,
        defenderMul,
        guarded,
        rulesMul: this.battle.rulesDamageMul(att, this),
      });
    }

    _applyDamage(dmg, att, hit, point) {
      this.hp -= dmg;
      if (this.infiniteHp && this.hp < 1) this.hp = 1;
      if (this.cannotDie && this.hp < 1) this.hp = 1;
      this.stats.hitsTaken++;
      this.ki = Math.min(this.kiMax, this.ki + 0.8);
      if (att) {
        att.combo.hits++;
        att.combo.damage += dmg;
        att.combo.timer = 80;
        att.stats.damage += dmg;
        if (att.combo.hits > att.stats.maxCombo) att.stats.maxCombo = att.combo.hits;
        att.ki = Math.min(att.kiMax, att.ki + (hit.type === 'melee' ? 2.2 : 0.8));
        if (att.counterFrames > 0) {
          SL.mech(att, 'on', 'counterHit', hit);
          att.counterFrames = 0;
        }
        SL.mech(att, 'on', 'hitDealt', hit);
      }
      SL.mech(this, 'on', 'hitTaken', hit);
      this.battle.emit('damage', { target: this, attacker: att, amount: dmg, point, type: hit.type });
      if (this.hp <= 0) {
        this.hp = 0;
        this._ko(att, hit);
      }
    }

    _react(att, hit, dir) {
      const knock = hit.knock || 'flinch';
      const wMul = 1 / Math.max(0.5, this.def.stats.weight || 1);
      const ks = (hit.knockSpeed || 10) * wMul;
      if (knock === 'held') {
        this.anim.play(hit.pose || 'hitLight', 40, { restart: true });
        return;
      }
      this.chain = 0;
      switch (knock) {
        case 'flinch':
          this.setState('hitstun', { frames: hit.hitstun || 18 });
          this.vel.copy(dir).multiplyScalar(3.5);
          this.anim.play(hit.pose || 'hitLight', 32, { restart: true });
          break;
        case 'push':
          this.setState('hitstun', { frames: hit.hitstun || 22 });
          this.vel.copy(dir).multiplyScalar(ks);
          this.anim.play(hit.pose || 'hitLight', 32, { restart: true });
          break;
        case 'crumple':
          this.setState('hitstun', { frames: hit.hitstun || 40, crumple: true });
          this.vel.copy(dir).multiplyScalar(2);
          this.anim.play('hitBody', 20, { restart: true });
          break;
        case 'launch':
          this.setState('knockback', { frames: hit.hitstun || 34, knock, startFrames: hit.hitstun || 34 });
          this.grounded = false;
          this.vel.copy(dir).setY(0).multiplyScalar(3).addScaledVector(UP, ks);
          this.anim.play('launched', 26, { restart: true });
          break;
        case 'smash':
          this.setState('knockback', { frames: hit.hitstun || 34, knock, startFrames: hit.hitstun || 34 });
          this.grounded = false;
          this.vel.copy(dir).setY(0).multiplyScalar(4);
          this.vel.y = -ks;
          this.anim.play('smashed', 26, { restart: true });
          break;
        default: {
          // heavy
          this.setState('knockback', { frames: hit.hitstun || 30, knock: 'heavy', startFrames: hit.hitstun || 30 });
          const upBias = this.grounded ? 3 : 1;
          this.grounded = false;
          this.vel.copy(dir).multiplyScalar(ks).addScaledVector(UP, upBias);
          this.anim.play('hitHeavy', 30, { restart: true });
        }
      }
    }

    _block(att, hit, dir) {
      const chip = this._damageFrom(att, hit, true);
      this.hp = Math.max(1, this.hp - chip);
      if (att) {
        att.combo.timer = Math.max(att.combo.timer, 40);
        att.stats.damage += chip;
      }
      const baseCost = hit.guardDamage || (hit.heavy ? R.GUARD_STAMINA.heavy : R.GUARD_STAMINA[hit.type] || 10);
      if (!this.infiniteStamina) this.stamina -= baseCost;
      this.staminaDelay = 45;
      this.vel.copy(dir).setY(0).multiplyScalar(hit.type === 'beam' ? 7 : hit.heavy ? 6 : 3.5);
      this.sd.hitFrames = 8;
      this.anim.play('guardHit', 30, { restart: true });
      const point = hit.point ? hit.point.clone() : this.chest().addScaledVector(dir, -this.radius * 1.4);
      this.battle.blockEffects(att, this, hit, point);
      this.battle.emit('damage', { target: this, attacker: att, amount: chip, point, type: hit.type, blocked: true });
      if (this.stamina <= 0 || (hit.guardCrush && this.stamina < 30)) {
        this.stamina = 0;
        this.setState('guardBreak', { frames: 56 });
        this.battle.sfx('guardBreak', this);
        this.battle.vfx.impact(point, 3, 0xffa040);
        this.battle.emit('guardBreak', { fighter: this, attacker: att });
        return 'guardBreak';
      }
      return 'blocked';
    }

    _perfectGuard(att, hit, dir) {
      this.ki = Math.min(this.kiMax, this.ki + 8);
      this.stamina = Math.min(this.staminaMax, this.stamina + 10);
      SL.mech(this, 'on', 'perfectGuard', hit);
      this.counterFrames = 45;
      const point = hit.point ? hit.point.clone() : this.chest().addScaledVector(dir, -this.radius * 1.4);
      this.battle.perfectEffects(att, this, point);
      if (att && hit.type === 'melee') {
        att._stagger(30);
        att.freeze = 6;
      }
      this.freeze = 6;
      this.anim.play('guardHit', 40, { restart: true });
      return 'perfect';
    }

    _vanishCounter(att) {
      const cost = R.COST.vanishExtra * (SL.mech(this, 'costMul', 'vanish') || 1);
      if (!R.spendStamina(this, cost)) return false;
      const dest = att.pos.clone().addScaledVector(att.forward, -1.8 * att.scale);
      if (!att.grounded) dest.y = att.pos.y;
      this.battle.stage.clampPosition(dest);
      this.battle.vfx.afterimage(this.pos, this.height, 0xdff2ff);
      this.setState('vanish', { dest, attacker: att });
      this.invuln = 18;
      this.setHidden(true);
      this.battle.sfx('vanish', this);
      SL.mech(this, 'on', 'vanish');
      if (att.state === 'attack') att.sd.whiffPenalty = 14;
      this.battle.emit('vanish', { fighter: this, attacker: att });
      return true;
    }

    _ko(att, hit) {
      this.alive = false;
      const dir = hit && hit.dir ? hit.dir : att ? att.dirTo(this) : this.forward.negate();
      this.setState('ko', {});
      this.invuln = 99999;
      this.grounded = false;
      this.vel.copy(dir).multiplyScalar(14).addScaledVector(UP, 5);
      this.model.setExpression('ko');
      this.aura.target = 0;
      for (const k of Object.keys(this.loops)) if (this.loops[k]) this.loops[k].stop(0.2);
      this.loops = {};
      this.battle.onKO(this, att, hit);
    }

    /* ---------------- physics ---------------- */
    _physics() {
      const stage = this.battle.stage;
      this.pos.addScaledVector(this.vel, TICK);
      if (stage.hasGround) {
        const gh = stage.heightAt(this.pos.x, this.pos.z);
        if (this.grounded) {
          if (this.vel.y > 0.01) this.grounded = false;
          else {
            this.pos.y = gh;
            this.vel.y = 0;
          }
        } else if (this.pos.y < gh) {
          const impactSpeed = -this.vel.y;
          this.pos.y = gh;
          this._onGroundContact(impactSpeed);
        }
      }
      const hitPillar = stage.resolveFighter(this);
      if (hitPillar && (this.state === 'knockback' || (!this.alive && this.speed > 10))) {
        const sp = hitPillar.speed;
        if (sp > 12) this._wallImpact(hitPillar, sp);
      }
      stage.clampPosition(this.pos, this.vel);
    }

    _onGroundContact(speed) {
      const stage = this.battle.stage;
      if (!this.alive && speed < 10) {
        // settle the body instead of bouncing forever
        this.vel.set(this.vel.x * 0.5, 0, this.vel.z * 0.5);
        this.grounded = true;
        return;
      }
      if (this.state === 'knockback' || !this.alive) {
        if (this.sd.knock === 'smash' || speed > 14 || !this.alive) {
          const big = U.clamp(speed / 36, 0.3, 1.2);
          stage.crater(this.pos, 1.4 + big * 2.4, 0.25 + big * 0.7, this);
          this.battle.groundImpactEffects(this, speed);
          if (this.alive && this.sd.knock === 'smash') {
            const bonus = Math.round(140 + speed * 6);
            this._applyDamage(bonus, this.sd.attacker || null, { type: 'explosion', impact: 2 }, this.pos.clone());
          }
          this.vel.set(this.vel.x * 0.3, Math.min(7, speed * 0.22), this.vel.z * 0.3);
          if (this.alive) {
            this.setState('knockdown', { frames: 52, bounce: true });
            this.grounded = false;
          }
          return;
        }
        this.vel.y = 0;
        this.grounded = true;
        if (this.alive) this.setState('knockdown', { frames: 40 });
        return;
      }
      if (this.state === 'knockdown') {
        this.vel.set(this.vel.x * 0.4, 0, this.vel.z * 0.4);
        this.grounded = true;
        return;
      }
      this.grounded = true;
      this.vel.y = 0;
      if (speed > 8) {
        this.battle.vfx.dust(this.pos, 1, 10);
        this.battle.sfx('jump', this, { vol: 0.8 });
      }
    }

    _wallImpact(info, speed) {
      const stage = this.battle.stage;
      stage.damagePillar(info.pillar, speed * 60, this.chest());
      this.battle.wallImpactEffects(this, info, speed);
      if (this.alive) {
        this._applyDamage(Math.round(120 + speed * 5), null, { type: 'explosion', impact: 2 }, this.chest());
        if (this.alive) {
          this.vel.multiplyScalar(-0.25);
          this.setState('hitstun', { frames: 22 });
          this.anim.play('hitHeavy', 40, { restart: true });
        }
      }
    }

    /* ---------------- presentation ---------------- */
    _post(frozen) {
      const st = this.state;
      let aura = this.form.aura && this.form.aura.idle ? this.form.aura.idle : 0;
      if (st === 'charge' || st === 'transform') aura = 1;
      else if (st === 'beamCharge' || st === 'spiritBomb') aura = 0.65;
      else if (st === 'beamFire' || st === 'clash') aura = 0.8;
      else if (this.speed > 24 && st === 'free') aura = Math.max(aura, 0.35);
      if (this.mech.rage) {
        aura = Math.max(aura, 0.4);
        if (this.formIndex === 0) this.aura.setStyle({ color: 0xff3a1e, core: 0xffc0a0, particles: 0xff6040 });
      }
      if (this.sd.aura !== undefined) aura = this.sd.aura;
      if (!this.alive || this.hidden) aura = 0;
      this.aura.target = aura;

      if (this.flash > 0) {
        this.flash = Math.max(0, this.flash - TICK * 7);
        this.model.setFlash(this.flash * 0.9);
      }

      let expr = 'neutral';
      if (!this.alive) expr = 'ko';
      else if (['charge', 'transform', 'beamCharge', 'beamFire', 'clash', 'spiritBomb'].includes(st)) expr = 'shout';
      else if (['hitstun', 'knockback', 'knockdown', 'guardBreak', 'stagger', 'held'].includes(st)) expr = 'hurt';
      else if (['attack', 'guard', 'rush', 'throw', 'specialThrow', 'blast'].includes(st)) expr = 'angry';
      else if (this.hpFrac < 0.3) expr = 'angry';
      else if (this.sd.expression) expr = this.sd.expression;
      this.model.setExpression(expr);

      const t = this.target;
      if (t && (st === 'free' || st === 'guard' || st === 'charge')) {
        const want = Math.atan2(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
        this.anim.lookYaw = U.damp(this.anim.lookYaw, U.clamp(U.wrapAngle(want - this.yaw), -0.9, 0.9) * 0.7, 8, TICK);
      } else this.anim.lookYaw = U.damp(this.anim.lookYaw, 0, 8, TICK);
      this.anim.breathe = st === 'free' && this.speed < 2 ? 1 : 0.2;
      if (!frozen) this.anim.update(TICK);
      this.object.rotation.y = this.yaw;

      if (this.isPlayer) {
        const fast = this.speed > 24 && (st === 'free' || st === 'dash');
        SL.ScreenFX.setSpeed(fast ? U.clamp01((this.speed - 20) / 25) : st === 'dash' ? 0.5 : 0);
        this.battle.camera.fovKick = Math.max(this.battle.camera.fovKick, fast ? (this.speed - 20) * 0.25 : 0);
      }
    }

    dispose() {
      for (const k of Object.keys(this.loops)) if (this.loops[k]) this.loops[k].stop(0.1);
      this.aura.dispose();
      this.model.dispose();
      if (this.object.parent) this.object.parent.remove(this.object);
    }
  }

  /* =================== state handlers =================== */
  const STATES = {
    free(it) {
      it = this._consumeBuffer(it);
      if (this._tryActions(it)) return;
      if (it.boostPressed && (Math.abs(it.mx) + Math.abs(it.my) > 0.2) && this.stamina >= R.COST.dash) {
        R.spendStamina(this, R.COST.dash);
        const w = this._wish(it);
        this.setState('dash', { dir: w.dir.clone() });
        this.battle.sfx('dash', this);
        return;
      }
      this._locomotion(it);
      if (this.target && this.target.alive) this.faceTarget(12);
      else if (Math.hypot(this.vel.x, this.vel.z) > 1.5) this.yaw = U.dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 10, TICK);
      this._locomotionPose();
    },

    dash(it) {
      const sd = this.sd;
      const m = this.mult();
      if (it.light && this.def.moves.dash) {
        this._startAttack(this.def.moves.dash, 'dash', 0);
        return;
      }
      if (it.dodge && this._startDodge(it)) return;
      const dir = sd.dir;
      const k = 1 - this.stateFrame / 14;
      this.vel.copy(dir).multiplyScalar(R.SPEED.dash * m.speed * (0.55 + 0.45 * k));
      if (this.grounded) this.vel.y = 0;
      if (this.target && this.target.alive) this.faceTarget(14);
      else this.yaw = U.dampAngle(this.yaw, Math.atan2(dir.x, dir.z), 16, TICK);
      const fwd = this.forward;
      const f = dir.x * fwd.x + dir.z * fwd.z;
      const right = new V3(-fwd.z, 0, fwd.x);
      const s = dir.x * right.x + dir.z * right.z;
      this.anim.play(f > 0.5 ? 'dash' : f < -0.5 ? 'flyBack' : s > 0 ? 'strafeR' : 'strafeL', 16);
      if (this.stateFrame % 2 === 0) this.battle.vfx.trail(this.chest(), (this.form.aura && this.form.aura.color) || 0xffffff, 0.4, 0.25);
      if (this.stateFrame >= 14) this.setState('free');
    },

    attack(it) {
      const sd = this.sd, mv = sd.move, f = this.stateFrame;
      const startup = sd.startup;
      const activeEnd = startup + mv.active;
      const total = activeEnd + mv.recovery + sd.whiffPenalty;
      const t = this.target;
      const m = this.mult();
      if (f < activeEnd && mv.lunge && t && t.alive) {
        const d = t.chest().sub(this.chest());
        const dist = d.length();
        const stop = mv.reach * this.scale * 0.72 + t.radius;
        if (dist < 9 + mv.lunge * 0.4 && dist > stop) {
          const spd = Math.min(mv.lunge * m.speed, (dist - stop) / TICK);
          this.vel.copy(d.divideScalar(dist)).multiplyScalar(spd);
          if (this.grounded && this.vel.y > 2) this.grounded = false;
        } else this.vel.multiplyScalar(0.6);
        this.faceTarget(22);
      } else {
        this.vel.x = U.damp(this.vel.x, 0, 10, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 10, TICK);
        this.vel.y = this.grounded ? 0 : U.damp(this.vel.y, 0, 10, TICK);
      }
      if (this.grounded) this.vel.y = Math.max(0, this.vel.y);
      if (f === startup) {
        this.anim.play(mv.pose.strike, 44);
        this.battle.sfx('swing', this, { pitch: sd.kind === 'light' ? 1.2 : 0.8 });
      }
      if (f >= startup && f < activeEnd) this._meleeCheck(mv);
      if (f === activeEnd + Math.floor(mv.recovery * 0.4)) this.anim.play(this.grounded ? 'idle' : 'flyIdle', 9);

      const b = this.buffer;
      const cancelAt = (mv.cancel || activeEnd + 2) + (sd.hit ? 0 : 4);
      if (b && this.frame - b.frame <= 10 && f >= cancelAt) {
        const lights = this.def.moves.light || [];
        if (b.action === 'light' && sd.kind === 'light' && this.chain < lights.length) {
          this.buffer = null;
          this._startLight();
          return;
        }
        if (b.action === 'heavy' && sd.kind === 'light') {
          this.buffer = null;
          this._startHeavy();
          return;
        }
        if (b.action === 'heavy' && sd.kind === 'heavy' && sd.hit) {
          if (this._tryChase()) {
            this.buffer = null;
            return;
          }
        }
        if (sd.hit && (b.action === 's1' || b.action === 's2' || b.action === 'ult')) {
          const slot = b.action === 's1' ? 'special1' : b.action === 's2' ? 'special2' : 'ultimate';
          this.buffer = null;
          if (this._trySpecial(slot)) return;
        }
        if (sd.hit && b.action === 'dodge') {
          this.buffer = null;
          if (this._startDodge(it)) return;
        }
      }
      if (f >= total) {
        this.chainTimer = sd.kind === 'light' ? 28 : 0;
        if (sd.kind !== 'light') this.chain = 0;
        this.setState('free');
      }
    },

    guard(it) {
      if (!it.guard) {
        this.setState('free');
        return;
      }
      if (it.heavy) {
        this._startThrow();
        return;
      }
      if (it.dodge && this._startDodge(it)) return;
      this.staminaDelay = Math.max(this.staminaDelay, 12);
      const w = this._wish(it);
      const spd = 3;
      this.vel.x = U.damp(this.vel.x, w.dir.x * spd * w.len, 10, TICK);
      this.vel.z = U.damp(this.vel.z, w.dir.z * spd * w.len, 10, TICK);
      this.vel.y = this.grounded ? 0 : U.damp(this.vel.y, (it.up ? 3 : 0) - (it.down ? 3 : 0), 10, TICK);
      this.faceTarget(14);
      if (this.sd.hitFrames > 0) this.sd.hitFrames--;
      else this.anim.play('guard', 16);
    },

    charge(it) {
      if (!it.charge) {
        this.setState('free');
        return;
      }
      const other = { ...it, charge: false };
      if ((it.light || it.heavy || it.blast || it.s1 || it.s2 || it.ult || it.dodge || it.transform || it.guard) && this._tryActions(other)) return;
      const m = this.mult();
      const before = this.ki;
      this.ki = Math.min(this.kiMax, this.ki + m.chargeRate * TICK);
      if (before < this.kiMax && this.ki >= this.kiMax) {
        this.battle.sfx('kiUp', this);
        this.battle.vfx.flash(this.chest(), 3.5, (this.form.aura && this.form.aura.color) || 0xffffff, 0.25, SL.Toon.tex.glow);
      }
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      this.faceTarget(6);
      this.anim.play('charge', 12);
      if (!this.loops.aura) this.loops.aura = SL.Audio.loop('aura', { vol: this.battle.volFor(this) });
      this.loops.aura.set(1);
      if (this.stateFrame % 6 === 0 && this.grounded) this.battle.vfx.dust(this.pos, 1.4, 4);
      if (this.stateFrame % 20 === 0 && this.grounded && SL.Render.effectsLevel() !== 'low') {
        const p = this.pos.clone().add(new V3(U.rand(-2.5, 2.5), 0.2, U.rand(-2.5, 2.5)));
        this.battle.vfx.rock(p, new V3(0, U.rand(2, 4), 0), U.rand(0.08, 0.2), this.battle.stage.rockColor);
      }
      if (this.isPlayer) this.battle.camera.addTrauma(0.012);
    },

    blast(it) {
      const sd = this.sd, f = this.stateFrame;
      this.faceTarget(18);
      this.vel.multiplyScalar(0.82);
      if (this.grounded) this.vel.y = 0;
      if (sd.charged) {
        this.anim.play('blastCharged', 16);
        if (!sd.orb) sd.orb = this.battle.projectiles.chargeOrb((this.def.blast || BLAST_DEFAULT).color);
        const hp = this.handPos('R').add(this.handPos('L')).multiplyScalar(0.5);
        sd.orb.position.copy(hp);
        sd.orb.scale.setScalar(0.6 + Math.min(1, f / 40) * 1.4 + Math.random() * 0.2);
        if (!it.blastHeld || f >= 46) {
          if (R.spendKi(this, R.COST.chargedBlastKi)) {
            const bd = this.def.blast || BLAST_DEFAULT;
            const t = this.target;
            const dir = t && t.alive ? t.chest().sub(hp).normalize() : this.forward;
            this.battle.projectiles.spawnBlast(this, hp, dir, {
              kind: 'ball', speed: 52, radius: 0.75, damage: 900, color: bd.color, core: bd.core, homing: 1.2,
              knock: 'heavy', knockSpeed: 16, hitstun: 26, impact: 2, explode: 3.5, life: 3,
            });
            this.battle.sfx('kiBlastBig', this);
            this.anim.play('blastCharged', 40, { restart: true });
          }
          this.setState('recoverSpecial', { frames: 16 });
        }
        return;
      }
      if (!sd.fired && f >= 2) {
        sd.fired = true;
        sd.count++;
        if (!this._fireBlast()) {
          this.setState('free');
          return;
        }
      }
      if (sd.count === 1 && f >= 15 && it.blastHeld && R.canAfford(this, R.COST.chargedBlastKi)) {
        sd.charged = true;
        this.stateFrame = 0;
        return;
      }
      const b = this.buffer;
      if (f >= 7 && b && b.action === 'blast' && this.frame - b.frame <= 8 && sd.count < 8) {
        this.buffer = null;
        if (R.canAfford(this, R.COST.blastKi)) {
          sd.fired = false;
          this.stateFrame = 0;
          return;
        }
      }
      if (f >= 7 && b && b.action !== 'blast' && this.frame - b.frame <= 8) {
        this.setState('free');
        return;
      }
      if (f >= (sd.count >= 8 ? 26 : 16) && !it.blastHeld) this.setState('free');
      if (f >= 40) this.setState('free');
    },

    recoverSpecial(it) {
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      if (this.stateFrame >= (this.sd.frames || 20)) this.setState('free');
    },

    beamCharge(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      this.faceTarget(16);
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      const frac = U.clamp01(f / sp.chargeMax);
      if (this.loops.beamCharge) this.loops.beamCharge.set(frac);
      if (!sd.orb) sd.orb = this.battle.projectiles.chargeOrb(sp.color);
      const side = sp.oneHand ? this.handPos('R') : this.handPos('R').add(this.handPos('L')).multiplyScalar(0.5);
      sd.orb.position.copy(side);
      sd.orb.scale.setScalar((0.6 + frac * (sp.ultimate ? 3.4 : 2.2)) * (0.9 + Math.random() * 0.2));
      if (f === 1 && (sp.cinematic || sp.ultimate)) this.battle.ultimateChargeShot(this, sp.chargeMax / 60);
      const held = sd.slot === 'special1' ? it.s1Held : sd.slot === 'special2' ? it.s2Held : it.ultHeld;
      const minDone = f >= sp.chargeMin;
      if ((minDone && !held) || f >= sp.chargeMax) {
        if (!R.spendKi(this, sp.kiCost)) {
          this._denied();
          this.setState('free');
          return;
        }
        const beam = this.battle.projectiles.spawnBeam(this, sp, frac);
        this.setState('beamFire', { spec: sp, beam, frac, aimYaw: 0, aimPitch: 0 });
        this.anim.play(sp.poses.fire, 40);
        this.battle.sfx('kiBlastBig', this, { vol: 1.2 });
      }
    },

    beamFire(it) {
      const sd = this.sd;
      const beam = sd.beam;
      this.vel.copy(beam.dir).multiplyScalar(-0.8);
      if (this.grounded) this.vel.y = 0;
      sd.aimYaw = U.clamp(sd.aimYaw - it.mx * 0.9 * TICK, -0.45, 0.45);
      sd.aimPitch = U.clamp(sd.aimPitch + it.my * 0.9 * TICK, -0.45, 0.45);
      beam.aimYaw = sd.aimYaw;
      beam.aimPitch = sd.aimPitch;
      if (beam.done || this.stateFrame > 400) this.setState('recoverSpecial', { frames: sd.spec.recovery || 20 });
    },

    clash(it) {
      this.vel.set(0, 0, 0);
      this.anim.play('beamPush', 20);
    },

    specialThrow(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      this.faceTarget(20);
      this.vel.multiplyScalar(0.82);
      if (this.grounded) this.vel.y = 0;
      if (f < sp.startup) {
        if (!sd.orb) sd.orb = this.battle.projectiles.chargeOrb(sp.projectile.color);
        sd.orb.position.copy(this.handPos('R'));
        sd.orb.scale.setScalar(0.5 + (f / sp.startup) * 1.8);
      }
      if (f === sp.startup) {
        if (sd.orb) {
          sd.orb.visible = false;
          sd.orb = null;
        }
        if (!R.spendKi(this, sp.kiCost)) {
          this._denied();
          this.setState('free');
          return;
        }
        const origin = this.handPos('R');
        const t = this.target;
        const dir = t && t.alive ? t.chest().sub(origin).normalize() : this.forward;
        this.battle.projectiles.spawnBlast(this, origin, dir, { ...sp.projectile, special: true, name: sp.name });
        this.anim.play(sp.pose.release, 44);
        this.battle.sfx('kiBlastBig', this);
      }
      if (f >= sp.startup + sp.recovery) this.setState('free');
    },

    teleport(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      const startup = sd.escape ? 2 : sp.startup;
      this.vel.multiplyScalar(0.7);
      if (f === startup) {
        this.battle.vfx.afterimage(this.pos, this.height, 0xe0f4ff);
        this.setHidden(true);
        this.invuln = Math.max(this.invuln, 14);
      }
      if (f === startup + 5) {
        const t = this.target;
        if (t && t.alive) {
          const behind = t.pos.clone().addScaledVector(t.forward, -1.9 * t.scale);
          if (!t.grounded) behind.y = t.pos.y;
          else behind.y = t.pos.y;
          this.battle.stage.clampPosition(behind);
          this.pos.copy(behind);
          this.prevPos.copy(behind);
          this.grounded = t.grounded;
          this.vel.set(0, 0, 0);
          this.faceTarget(100);
        }
        this.setHidden(false);
        this.battle.vfx.afterimage(this.pos, this.height, 0xe0f4ff);
        this.battle.sfx('vanish', this);
        this.followFrames = sp.followWindow;
        this.followBonus = sp.followBonus;
        this.anim.play(this.grounded ? 'idle' : 'flyIdle', 20, { snap: true });
        this.battle.emit('teleported', { fighter: this });
      }
      if (f >= startup + 5 + sp.recovery) this.setState('free');
    },

    rush(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      const t = this.target;
      if (sd.phase === 'wind') {
        this.vel.multiplyScalar(0.7);
        this.faceTarget(20);
        if (f >= sp.startup) {
          sd.phase = 'dash';
          sd.dashStart = f;
          this.anim.play(sp.poses.dash, 20);
          this.battle.sfx('dash', this, { vol: 1.3 });
        }
        return;
      }
      if (sd.phase === 'dash') {
        if (!t || !t.alive) {
          sd.phase = 'recover';
          sd.recStart = f;
          return;
        }
        const d = t.chest().sub(this.chest());
        const dist = d.length();
        this.vel.copy(d.divideScalar(Math.max(0.01, dist))).multiplyScalar(sp.speed * this.mult().speed);
        this.grounded = false;
        this.faceTarget(30);
        if (f % 2 === 0) this.battle.vfx.trail(this.chest(), 0xffffff, 0.5, 0.3);
        if (dist < 1.8 * this.scale + t.radius) {
          const res = t.takeHit(this, { type: 'melee', damage: 120, knock: 'held', impact: 1, dir: this.dirTo(t), pose: 'hitBody', sfx: 'punchHeavy' });
          if (res === 'hit' && t.alive) {
            t.setState('held', { by: this, frames: 160 });
            sd.victim = t;
            sd.phase = 'combo';
            sd.hitIndex = 0;
            sd.nextHit = f + 3;
            this.vel.set(0, 0, 0);
          } else {
            sd.phase = 'recover';
            sd.recStart = f;
          }
          return;
        }
        if (f - sd.dashStart > sp.dashFrames) {
          sd.phase = 'recover';
          sd.recStart = f;
        }
        return;
      }
      if (sd.phase === 'combo') {
        const v = sd.victim;
        this.vel.set(0, 0, 0);
        if (!v || !v.alive || v.state !== 'held') {
          sd.phase = 'recover';
          sd.recStart = f;
          return;
        }
        v.pos.copy(this.pos).addScaledVector(this.forward, 1.25 * this.scale);
        v.vel.set(0, 0, 0);
        v.yaw = this.yaw + Math.PI;
        if (f >= sd.nextHit) {
          const h = sp.hits[sd.hitIndex];
          this.anim.play(h.pose, 44, { restart: true });
          const last = sd.hitIndex === sp.hits.length - 1;
          const dir = this.forward;
          if (h.knock === 'smash') dir.y = -0.7;
          v.takeHit(this, {
            type: 'melee', damage: h.damage, knock: last ? h.knock || 'heavy' : 'held', knockSpeed: h.knockSpeed || 24,
            hitstun: 36, impact: last ? h.impact || 3 : 2, dir: dir.normalize(), pose: 'hitBody', sfx: h.sfx,
          });
          sd.hitIndex++;
          sd.nextHit = f + h.frames;
          if (sd.hitIndex >= sp.hits.length) {
            sd.victim = null;
            sd.phase = 'recover';
            sd.recStart = f;
          }
        }
        return;
      }
      this.vel.multiplyScalar(0.85);
      if (f - sd.recStart >= sp.recovery) this.setState('free');
    },

    spiritBomb(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      this.faceTarget(10);
      if (f === 1) {
        sd.bomb = this.battle.projectiles.spawnSpiritBomb(this, sp);
        this.battle.ultimateChargeShot(this, sp.chargeFrames / 60, true);
      }
      if (sd.bomb && !sd.released) sd.bomb.chargeFrac = U.clamp01(f / sp.chargeFrames);
      if (f === sp.chargeFrames && sd.bomb) {
        sd.released = true;
        sd.bomb.launch(this.target);
        this.anim.play(sp.poses.release, 30);
        this.battle.sfx('kiBlastBig', this, { vol: 1.3, pitch: 0.6 });
      }
      if (f >= sp.chargeFrames + sp.recovery) this.setState('free');
    },

    transform(it) {
      const sd = this.sd, f = this.stateFrame;
      const style = sd.form.style || 'burst';
      const short = SL.Settings.data.gameplay.shortTransforms || SL.Settings.data.camera.cinematic === 'off';
      const full = style === 'full' && !short;
      const applyAt = full ? 58 : style === 'full' ? 22 : 16;
      const end = full ? 118 : style === 'full' ? 50 : 36;
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      if (f === 1) {
        this.anim.play(full ? 'powerCrouch' : 'powerUp', 10);
        this.aura.setStyle(sd.form.aura);
        if (full) {
          sd.cinematic = true;
          this.battle.beginCinematic(this);
          this.battle.transformShot(this, end / 60);
        }
        if (sd.form.line) this.battle.say(this, sd.form.line);
        if (sd.form.music !== undefined) this.battle.musicBoost(sd.form.music);
        this.loops.aura = this.loops.aura || SL.Audio.loop('aura', { vol: this.battle.volFor(this) });
      }
      if (this.loops.aura) this.loops.aura.set(f < applyAt ? 0.4 + 0.6 * (f / applyAt) : 1);
      if (f < applyAt) {
        if (full && f % 4 === 0) {
          const p = this.pos.clone().add(new V3(U.rand(-3, 3), 0.1, U.rand(-3, 3)));
          if (this.battle.stage.hasGround) this.battle.vfx.rock(p, new V3(0, U.rand(3, 7), 0), U.rand(0.1, 0.3), this.battle.stage.rockColor);
          this.battle.vfx.bolt(this.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.8, 0.8), U.rand(-0.6, 0.6))), U.rand(0.6, 1.2));
        }
        if (full) this.battle.camera.addTrauma(0.02 + 0.02 * (f / applyAt));
      }
      if (f === applyAt) {
        this.applyForm(sd.index);
        const c = this.chest();
        const col = (sd.form.aura && sd.form.aura.color) || 0xffffff;
        this.battle.vfx.explosion(c, full ? 5 : 3, col, { smoke: false });
        this.battle.vfx.ring(this.pos.clone().add(new V3(0, 0.2, 0)), full ? 12 : 7, col, 0.7, new V3(0, 1, 0));
        SL.ScreenFX.flash(full ? 0.75 : 0.35, '#ffffff');
        this.battle.sfx('transformBurst', this);
        this.battle.camera.addTrauma(full ? 0.7 : 0.35);
        this.anim.play('powerUp', 22);
        if (this.battle.stage.hasGround && this.grounded) this.battle.stage.crater(this.pos, full ? 4.5 : 2.5, full ? 0.5 : 0.25, null);
        for (const e of this.enemies()) {
          const d = e.pos.distanceTo(this.pos);
          if (d < 7 && e.state !== 'knockdown') {
            const dir = this.dirTo(e);
            e.vel.addScaledVector(dir, 18 * (1 - d / 7));
          }
        }
      }
      if (f >= end) {
        if (sd.cinematic) {
          this.battle.endCinematic(this);
          sd.cinematic = false;
        }
        if (this.loops.aura) {
          this.loops.aura.stop(0.5);
          this.loops.aura = null;
        }
        this.setState('free');
      }
    },

    throw(it) {
      const sd = this.sd, th = sd.th, f = this.stateFrame;
      const t = this.target;
      if (f <= 6 && t && t.alive) {
        this.faceTarget(20);
        const d = t.chest().sub(this.chest());
        const dist = d.length();
        if (dist > 1.4 && dist < 5) this.vel.copy(d.normalize()).multiplyScalar(10);
        else this.vel.multiplyScalar(0.5);
      } else this.vel.multiplyScalar(0.7);
      if (this.grounded) this.vel.y = 0;
      if (f === 6) {
        const ok = t && t.alive && this.distTo(t) < 1.9 * this.scale + t.radius && t.invuln <= 0 && !['knockdown', 'vanish', 'dodge', 'transform', 'knockback', 'held'].includes(t.state);
        if (ok) {
          sd.victim = t;
          sd.success = true;
          t.setState('held', { by: this, frames: 60 });
          t.vel.set(0, 0, 0);
          this.battle.sfx('punchLight', this);
          this.battle.emit('throw', { fighter: this, victim: t });
        }
      }
      if (sd.success) {
        const v = sd.victim;
        if (v && v.alive && v.state === 'held') {
          v.pos.copy(this.pos).addScaledVector(this.forward, 1.05 * this.scale);
          if (!this.grounded) v.pos.y = this.pos.y;
          v.yaw = this.yaw + Math.PI;
          v.vel.set(0, 0, 0);
        }
        if (f === 12) this.anim.play(th.poses[1], 22);
        if (f === 22) this.anim.play(th.poses[2], 44);
        if (f === 24 && v && v.state === 'held') {
          v.takeHit(this, { type: 'throw', damage: th.damage, knock: 'heavy', knockSpeed: th.knockSpeed, hitstun: 36, impact: 3, dir: this.forward, pose: 'hitHeavy', sfx: 'punchHeavy' });
          sd.victim = null;
        }
        if (f >= 44) this.setState('free');
      } else if (f >= 32) this.setState('free');
    },

    held(it) {
      this.vel.set(0, 0, 0);
      if (this.stateFrame > (this.sd.frames || 60)) this.setState('free');
    },

    hitstun(it) {
      const sd = this.sd;
      sd.frames--;
      this.vel.x = U.damp(this.vel.x, 0, 7, TICK);
      this.vel.z = U.damp(this.vel.z, 0, 7, TICK);
      this.vel.y = this.grounded ? 0 : U.damp(this.vel.y, 0, 7, TICK);
      const b = this.buffer;
      const wantsBurst = it.dodge || (b && b.action === 'dodge' && this.frame - b.frame <= 8);
      if (this.stateFrame > 3 && wantsBurst && this._burstEscape()) {
        this.buffer = null;
        return;
      }
      if (it.s2 && this.def.specials && this.def.specials.special2 && this.def.specials.special2.type === 'teleport' && this._trySpecial('special2', { escape: true })) return;
      if (sd.frames <= 0) this.setState('free');
    },

    knockback(it) {
      const sd = this.sd;
      sd.frames--;
      const k = sd.knock;
      const space = !this.battle.stage.hasGround;
      if (k === 'launch') {
        if (this.vel.y > 0) this.vel.y -= 26 * TICK;
        else this.vel.y = U.damp(this.vel.y, 0, 4, TICK);
        this.vel.x = U.damp(this.vel.x, 0, 2, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 2, TICK);
        this.anim.play('launched', 12);
      } else if (k === 'smash') {
        if (!space) this.vel.y -= 20 * TICK;
        else this.vel.multiplyScalar(Math.exp(-1.2 * TICK));
        this.anim.play('smashed', 12);
      } else {
        this.vel.multiplyScalar(Math.exp(-2.1 * TICK));
        this.anim.play(this.speed > 12 ? 'tumble' : 'hitHeavy', 10);
      }
      this.speed = this.vel.length();
      if (this.stateFrame % 3 === 0 && this.speed > 15) this.battle.vfx.trail(this.chest(), 0xffffff, 0.3, 0.3);
      const early = sd.frames < sd.startFrames * 0.45 && k !== 'smash';
      const buffered = this.buffer && this.frame - this.buffer.frame <= 8;
      if (early && (it.light || it.heavy || it.dodge || it.guard || it.up || buffered) && (this.stamina >= R.COST.quickRecover || this.infiniteStamina)) {
        this.buffer = null;
        R.spendStamina(this, R.COST.quickRecover);
        this.setState('recover', { frames: 12 });
        this.invuln = 12;
        return;
      }
      if (sd.frames <= 0) {
        this.setState('recover', { frames: 14 });
        this.invuln = 12;
      }
    },

    recover(it) {
      this.vel.multiplyScalar(0.8);
      this.anim.play('recover', 20);
      if (this.stateFrame >= this.sd.frames) this.setState('free');
    },

    knockdown(it) {
      const sd = this.sd;
      this.invuln = Math.max(this.invuln, 2);
      this.anim.play('knockdown', 14);
      if (this.grounded) {
        this.vel.x = U.damp(this.vel.x, 0, 6, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 6, TICK);
      } else if (this.battle.stage.hasGround) this.vel.y -= 25 * TICK;
      else {
        this.vel.multiplyScalar(0.9);
        if (this.stateFrame > 20) {
          this.setState('recover', { frames: 14 });
          this.invuln = 14;
          return;
        }
      }
      const wantUp = this.stateFrame > 16 && (it.light || it.heavy || it.dodge || it.guard || it.up || Math.abs(it.mx) + Math.abs(it.my) > 0.5);
      if ((wantUp || this.stateFrame >= sd.frames) && (this.grounded || this.stateFrame > 90)) {
        this.setState('getup', {});
        this.invuln = 20;
      }
    },

    getup(it) {
      this.vel.multiplyScalar(0.7);
      this.anim.play('getup', 14);
      if (this.stateFrame >= 16) {
        this.anim.play('idle', 10);
        this.setState('free');
      }
    },

    stagger(it) {
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      this.anim.play('stagger', 14);
      if (this.stateFrame >= this.sd.frames) this.setState('free');
    },

    guardBreak(it) {
      STATES.stagger.call(this, it);
    },

    dodge(it) {
      const sd = this.sd;
      this.vel.multiplyScalar(0.86);
      if (this.grounded) this.vel.y = 0;
      const fwd = this.forward;
      const f = sd.dir.x * fwd.x + sd.dir.z * fwd.z;
      const right = new V3(-fwd.z, 0, fwd.x);
      const s = sd.dir.x * right.x + sd.dir.z * right.z;
      this.anim.play(f < -0.5 ? 'flyBack' : f > 0.5 ? 'dash' : s > 0 ? 'strafeR' : 'strafeL', 18);
      this.faceTarget(10);
      if (this.stateFrame >= 15) this.setState('free');
    },

    vanish(it) {
      const sd = this.sd;
      this.vel.set(0, 0, 0);
      if (this.stateFrame === 5) {
        this.pos.copy(sd.dest);
        this.prevPos.copy(sd.dest);
        this.grounded = false;
        this.setHidden(false);
        if (sd.attacker) {
          this.target = this.target || sd.attacker;
          this.faceTarget(100);
        }
        this.battle.vfx.afterimage(this.pos, this.height, 0xdff2ff);
        this.anim.play('flyIdle', 20, { snap: true });
        this.counterFrames = 45;
      }
      if (this.stateFrame >= 11) this.setState('free');
    },

    ko(it) {
      const stage = this.battle.stage;
      if (stage.hasGround && !this.grounded) this.vel.y -= 24 * TICK;
      this.vel.x = U.damp(this.vel.x, 0, this.grounded ? 6 : 1.2, TICK);
      this.vel.z = U.damp(this.vel.z, 0, this.grounded ? 6 : 1.2, TICK);
      if (!stage.hasGround) this.vel.y = U.damp(this.vel.y, 0, 1, TICK);
      this.anim.play(this.grounded || this.stateFrame > 40 ? 'knockdown' : 'tumble', 8);
    },

    scripted(it) {
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      if (this.sd.pose) this.anim.play(this.sd.pose, this.sd.speed || 8);
      if (this.sd.face && this.target) this.faceTarget(8);
    },
  };

  Fighter.prototype._burstEscape = function () {
    if (!(this.stamina >= R.COST.burstEscape || this.infiniteStamina)) return false;
    R.spendStamina(this, R.COST.burstEscape);
    const away = this.target ? this.target.dirTo(this).setY(0.15).normalize() : this.forward.negate();
    const dest = this.pos.clone().addScaledVector(away, 7);
    this.battle.stage.clampPosition(dest);
    this.battle.vfx.afterimage(this.pos, this.height, 0xffffff);
    this.battle.vfx.ring(this.chest(), 4, 0xffffff, 0.35);
    this.pos.copy(dest);
    this.prevPos.copy(dest);
    this.grounded = false;
    this.vel.set(0, 0, 0);
    this.invuln = 16;
    this.setState('recover', { frames: 10 });
    this.battle.sfx('vanish', this);
    this.battle.emit('burst', { fighter: this });
    return true;
  };

  SL.Fighter = Fighter;
  SL.FighterStates = STATES;
  SL.emptyIntent = emptyIntent;
})();
