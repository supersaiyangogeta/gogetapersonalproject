/*
 * Controllers turn player input or AI decisions into a per-tick "intent".
 *
 * AI design: the CPU perceives its target through a delay buffer (reaction
 * time depends on difficulty), rolls defensive reactions once per incoming
 * attack, and chooses plans by weighted utility shaped by a personality
 * profile. Difficulty changes reactions, defense, combo length and mistakes
 * — never raw health.
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;

  class PlayerController {
    constructor(battle) {
      this.battle = battle;
      this.isPlayer = true;
    }
    update(f) {
      const it = SL.emptyIntent();
      if (this.battle.inputLocked) return it;
      const I = SL.Input;
      it.mx = I.move.x;
      it.my = I.move.y;
      it.up = I.held('ascend');
      it.upPressed = I.pressed('ascend');
      it.down = I.held('descend');
      it.boost = I.held('boost');
      it.boostPressed = I.pressed('boost');
      it.light = I.pressed('light');
      it.heavy = I.pressed('heavy');
      it.blast = I.pressed('blast');
      it.blastHeld = I.held('blast');
      it.guard = I.held('guard');
      it.dodge = I.pressed('dodge');
      it.charge = I.held('charge');
      it.s1 = I.pressed('special1');
      it.s1Held = I.held('special1');
      it.s2 = I.pressed('special2');
      it.s2Held = I.held('special2');
      it.ult = I.pressed('ultimate');
      it.ultHeld = I.held('ultimate');
      it.transform = I.pressed('transform');
      it.revert = I.pressed('revert');
      it.target = I.pressed('target');
      it.camYaw = this.battle.cameraYaw();
      const lock = this.battle.playerLimits;
      if (lock) {
        for (const k of Object.keys(lock)) if (lock[k] === false) it[k] = false;
      }
      return it;
    }
  }

  const PERSONALITY = {
    adaptive: { melee: 1, blast: 0.8, beam: 1, special2: 1, strafe: 1, wait: 0.8, charge: 1, throwBias: 1 },
    // Goku: presses forward like a martial artist, but still reads and punishes
    martial: { melee: 1.35, blast: 0.6, beam: 1, special2: 1.1, strafe: 0.65, wait: 0.45, charge: 0.6, throwBias: 1.1 },
    aggressive: { melee: 1.45, blast: 0.55, beam: 0.9, special2: 1.1, strafe: 0.6, wait: 0.4, charge: 0.5, throwBias: 1.3 },
    berserker: { melee: 1.35, blast: 0.6, beam: 0.8, special2: 1.2, strafe: 0.5, wait: 0.4, charge: 0.7, throwBias: 1.2 },
    grunt: { melee: 1, blast: 0.6, beam: 0, special2: 0, strafe: 1.1, wait: 1.2, charge: 0.2, throwBias: 0.3 },
    gunner: { melee: 0.12, blast: 1.8, beam: 0, special2: 0, strafe: 1.3, wait: 0.7, charge: 0.4, throwBias: 0 },
    elite: { melee: 1.2, blast: 0.5, beam: 0, special2: 1, strafe: 0.7, wait: 0.7, charge: 0.4, throwBias: 0.8 },
  };

  class AIController {
    constructor(battle, opts = {}) {
      this.battle = battle;
      this.difficulty = opts.difficulty || 'normal';
      this.d = R.DIFFICULTY[this.difficulty] || R.DIFFICULTY.normal;
      this.profileOverride = opts.profile || null;
      this.dummy = opts.dummy || null;
      this.p = null;
      this.w = null;
      this.plan = null;
      this.history = [];
      this.reacted = new Set();
      this.react = null;
      this.recent = [];
      this.memory = { melee: 0, blast: 0, beam: 0, guard: 0 };
      this.lastTargetState = null;
      this.lastTargetForm = 0;
      this.formReactUntil = 0;
      this.escapeTaken = -1;
      this.frame = 0;
    }

    _init(f) {
      this.p = Object.assign({ personality: 'adaptive', aggression: 0.6, defense: 0.5, ranged: 0.4, beam: 0.5, transformHp: 0.5, preferredRange: 3 }, f.def.ai || {}, this.profileOverride || {});
      this.w = PERSONALITY[this.p.personality] || PERSONALITY.adaptive;
    }

    update(f) {
      if (!this.p) this._init(f);
      this.frame++;
      const it = SL.emptyIntent();
      const battle = this.battle;
      if (battle.aiLocked || battle.inputLocked) return it;
      const t = f.target;
      if (!t || !t.alive) return it;

      this._observe(f, t);
      if (this.dummy && this.dummy !== 'cpu') return this._dummy(f, t, it);

      const seen = this.history[Math.max(0, this.history.length - 1 - this.d.reaction)] || this.history[0];
      const dist = f.distTo(t);

      // committed special states
      if (f.state === 'beamCharge') {
        const slotKey = f.sd.slot === 'special1' ? 's1Held' : f.sd.slot === 'special2' ? 's2Held' : 'ultHeld';
        it[slotKey] = f.stateFrame < (this.holdFrames || 30);
        return it;
      }
      if (f.state === 'spiritBomb') {
        it.ultHeld = f.stateFrame < (this.bombHold || 120);
        return it;
      }
      if (f.state === 'clash' || f.state === 'transform') return it;
      if (f.state === 'beamFire') return it;

      if (f.state === 'hitstun') {
        if (this.escapeTaken !== t.combo.hits && t.combo.hits >= 3 && Math.random() < this.d.escape) {
          this.escapeTaken = t.combo.hits;
          if (f.def.specials && f.def.specials.special2 && f.def.specials.special2.type === 'teleport' && f.ki > 40 && Math.random() < 0.5) it.s2 = true;
          else it.dodge = true;
        }
        return it;
      }
      if (f.state === 'knockback') {
        if (f.stateFrame > 8 && Math.random() < this.d.escape * 0.35 + 0.02) it.dodge = true;
        return it;
      }
      if (f.state === 'knockdown') {
        if (f.stateFrame > 20 && Math.random() < 0.05 + this.d.escape * 0.2) it.light = true;
        return it;
      }

      const hooks = this.hooks();
      if (hooks && hooks.pre && hooks.pre(this, f, t, dist, seen, it)) return it;
      if (this._defend(f, t, seen, dist, it)) return it;

      if (!this.plan || this.plan.frames <= 0 || this.plan.done) this._choose(f, t, dist, seen);
      this._execute(f, t, dist, seen, it);
      return it;
    }

    /** Character-specific AI behaviour registered in SL.AIHooks (def.ai.hooks). */
    hooks() {
      return this.p && this.p.hooks ? SL.AIHooks[this.p.hooks] || null : null;
    }

    _observe(f, t) {
      const snap = {
        state: t.state,
        stateFrame: t.stateFrame,
        startFrame: t.frame - t.stateFrame,
        kind: t.sd && t.sd.kind,
        startup: t.sd && t.sd.startup,
        dist: f.distTo(t),
        form: t.formIndex,
      };
      this.history.push(snap);
      if (this.history.length > 40) this.history.shift();
      if (snap.state !== this.lastTargetState) {
        if (snap.state === 'attack') this.memory.melee += 1;
        if (snap.state === 'blast') this.memory.blast += 1;
        if (snap.state === 'beamCharge') this.memory.beam += 1;
        this.lastTargetState = snap.state;
      }
      if (snap.state === 'guard') this.memory.guard += 1 / 60;
      for (const k of Object.keys(this.memory)) this.memory[k] *= 0.9995;
      if (t.formIndex > this.lastTargetForm) this.formReactUntil = this.frame + 300;
      this.lastTargetForm = t.formIndex;
    }

    _canAct(f) {
      if (['free', 'guard', 'charge', 'dash'].includes(f.state)) return true;
      if (f.state === 'blast' && f.stateFrame > 6) return true;
      if (f.state === 'attack' && f.stateFrame > f.sd.startup + f.sd.move.active + 4) return true;
      return false;
    }

    _defend(f, t, seen, dist, it) {
      const d = this.d, p = this.p;
      const battle = this.battle;
      if (this.react) {
        const r = this.react;
        r.frames--;
        if (r.type === 'guard') it.guard = true;
        if (r.type === 'dodge') {
          it.dodge = true;
          it.mx = r.side;
          r.frames = 0;
        }
        if (r.type === 'strafe') {
          it.mx = r.side;
          it.boost = true;
        }
        if (r.type === 'counter') {
          it.light = true;
          r.frames = 0;
        }
        if (r.frames <= 0) this.react = null;
        return true;
      }
      if (!this._canAct(f)) return false;
      const defenseMul = 0.55 + p.defense * 0.9 + Math.min(0.5, this.memory.melee * 0.02) * (p.personality === 'adaptive' || p.personality === 'martial' ? 1 : 0);

      if (seen && seen.state === 'attack' && seen.dist < 4.4) {
        const key = 'a' + seen.startFrame;
        if (!this.reacted.has(key)) {
          this.reacted.add(key);
          const roll = Math.random();
          const vanishP = d.vanish * (0.7 + p.defense * 0.6) * (f.stamina > 45 ? 1 : 0.2);
          const guardP = Math.min(0.9, d.guard * defenseMul);
          if (roll < vanishP) this.react = { type: 'dodge', frames: 1, side: U.chance(0.5) ? 1 : -1 };
          else if (roll < vanishP + guardP) this.react = { type: 'guard', frames: 16 + U.randInt(0, 16) };
          else if (roll < vanishP + guardP + 0.12 * p.aggression && dist < 2.4 && f.state === 'free') this.react = { type: 'counter', frames: 1 };
          if (this.react) return this._defend(f, t, seen, dist, it);
        }
      }

      // pre-emptive guard when the target rushes in
      if (seen && (seen.state === 'dash' || (t.speed > 22 && t.state === 'free')) && dist < 7 && f.state === 'free') {
        const key = 'r' + seen.startFrame;
        if (!this.reacted.has(key)) {
          this.reacted.add(key);
          if (Math.random() < d.guard * d.blockBias * defenseMul * 0.6) {
            this.react = { type: 'guard', frames: 20 };
            return this._defend(f, t, seen, dist, it);
          }
        }
      }

      // Instant Transmission tell: guard or vanish when the target disappears
      if (seen && seen.state === 'teleport' && f.state === 'free' && dist < 30) {
        const key = 't' + seen.startFrame;
        if (!this.reacted.has(key)) {
          this.reacted.add(key);
          const roll = Math.random();
          if (roll < d.vanish * 0.8) this.react = { type: 'dodge', frames: 1, side: U.chance(0.5) ? 1 : -1 };
          else if (roll < d.vanish * 0.8 + d.guard * 0.7) this.react = { type: 'guard', frames: 26 };
          if (this.react) return this._defend(f, t, seen, dist, it);
        }
      }

      // a flying Spirit Bomb: answer with a beam (clash) or get out of the way
      for (const bomb of battle.projectiles.bombs) {
        if (bomb.done || bomb.state !== 'flying' || bomb.team === f.team) continue;
        if (!bomb.aiSeen) bomb.aiSeen = new Set();
        if (bomb.aiSeen.has(this)) continue;
        const to = f.chest().sub(bomb.pos);
        if (to.length() > 70 || bomb.dir.dot(to.clone().normalize()) < 0.8) continue;
        bomb.aiSeen.add(this);
        const mySp = this._beamSlot(f);
        if (mySp && R.canAfford(f, mySp.spec.kiCost) && f.state === 'free' && to.length() > 18 && Math.random() < 0.35 + d.escape) {
          this.plan = { type: 'beam', slot: mySp.slot, frames: 90, pressed: false };
          this.holdFrames = mySp.spec.chargeMin + 2;
          return false;
        }
        this.react = { type: 'strafe', frames: 50, side: U.chance(0.5) ? 1 : -1 };
        return this._defend(f, t, seen, dist, it);
      }

      // projectiles
      for (const pr of battle.projectiles.list) {
        if (!pr.alive || pr.team === f.team) continue;
        const to = f.chest().sub(pr.pos);
        const len = to.length();
        if (len > 16 || len < 0.5) continue;
        if (pr.vel.clone().normalize().dot(to.divideScalar(len)) < 0.85) continue;
        if (!pr.aiSeen) pr.aiSeen = new Set();
        if (pr.aiSeen.has(this)) continue;
        pr.aiSeen.add(this);
        if (len / pr.speed * 60 < d.reaction * 0.5) continue;
        const roll = Math.random();
        const big = pr.radius > 0.6;
        if (roll < d.vanish + (big ? 0.15 : 0)) this.react = { type: 'strafe', frames: 14, side: U.chance(0.5) ? 1 : -1 };
        else if (roll < d.vanish + d.guard * defenseMul) this.react = { type: 'guard', frames: 18 };
        if (this.react) return this._defend(f, t, seen, dist, it);
      }

      // beams
      for (const b of battle.projectiles.beams) {
        if (b.done || b.team === f.team || b.state !== 'extend') continue;
        if (!b.aiSeen) b.aiSeen = new Set();
        if (b.aiSeen.has(this)) continue;
        const to = f.chest().sub(b.head);
        if (b.dir.dot(to.clone().normalize()) < 0.7) continue;
        b.aiSeen.add(this);
        const mySp = this._beamSlot(f);
        const roll = Math.random();
        if (mySp && R.canAfford(f, mySp.spec.kiCost) && f.state === 'free' && to.length() > 14 && roll < p.beam * this.w.beam * 0.9) {
          this.plan = { type: 'beam', slot: mySp.slot, frames: 90, pressed: false };
          this.holdFrames = mySp.spec.chargeMin + 2;
          return false;
        }
        if (roll < 0.35 + d.vanish) this.react = { type: 'strafe', frames: 22, side: U.chance(0.5) ? 1 : -1 };
        else if (roll < 0.35 + d.vanish + d.guard) this.react = { type: 'guard', frames: 40 };
        if (this.react) return this._defend(f, t, seen, dist, it);
      }
      if (this.reacted.size > 200) this.reacted.clear();
      return false;
    }

    _beamSlot(f) {
      const sp = f.def.specials || {};
      for (const slot of ['special1', 'special2']) if (sp[slot] && sp[slot].type === 'beam') return { slot, spec: sp[slot] };
      return null;
    }

    _choose(f, t, dist, seen) {
      const d = this.d, p = this.p, w = this.w;
      const battle = this.battle;
      const hpF = f.hpFrac;
      let aggr = p.aggression * d.aggression;
      if (p.personality === 'berserker') aggr *= 1 + (1 - hpF) * 0.8;
      if (p.personality === 'adaptive' && t.hpFrac < hpF) aggr *= 0.9;
      if (p.personality === 'adaptive' && hpF < t.hpFrac - 0.2) aggr *= 1.25;
      const token = battle.requestMeleeToken(f, t);
      const sp = f.def.specials || {};
      const tVulnerable = ['knockdown', 'stagger', 'guardBreak', 'recover', 'charge', 'getup', 'transform'].includes(t.state);
      const scores = {};
      scores.melee = aggr * w.melee * (token ? 1 : 0.08) * (dist < 40 ? 1 : 0.7);
      scores.blast = p.ranged * w.blast * (dist > 7 ? 1 : 0.25) * (f.ki > 15 ? 1 : 0.1) * (token ? 0.7 : 1.4);
      const beam = this._beamSlot(f);
      scores.beam = beam && R.canAfford(f, beam.spec.kiCost) ? p.beam * w.beam * (dist > 9 ? 0.7 : 0.15) * (tVulnerable ? 2.4 : 0.45) : 0;
      const s2 = sp.special2 && sp.special2.type !== 'beam' ? sp.special2 : null;
      if (s2 && (R.canAfford(f, s2.kiCost) && !(f.cooldowns.special2 > 0))) {
        let v = 0.4;
        if (s2.type === 'teleport') v = (dist > 14 ? 0.7 : 0.15) + (this.memory.blast > 3 ? 0.6 : 0) + (seen && seen.state === 'guard' ? 0.4 : 0);
        if (s2.type === 'projectile') v = dist > 8 && dist < 45 ? 0.55 : 0.1;
        if (s2.type === 'rush') v = (dist > 5 && dist < 30 ? 0.45 : 0.05) + (tVulnerable ? 0.8 : 0);
        scores.special2 = v * w.special2 * (0.6 + aggr * 0.5);
      }
      const s1 = sp.special1 && sp.special1.type !== 'beam' ? sp.special1 : null;
      if (s1 && R.canAfford(f, s1.kiCost)) scores.special1 = (dist > 8 && dist < 45 ? 0.55 : 0.1) * (w.special2 || 0.5);
      const ult = sp.ultimate;
      if (ult && battle.rules.allowUltimates && R.canAfford(f, ult.kiCost)) {
        scores.ultimate = (tVulnerable ? 2.6 : 0.35) + (hpF < 0.3 ? 0.8 : 0) + (t.hpFrac < 0.35 ? 0.6 : 0);
        if (ult.type === 'spiritBomb' && dist < 20) scores.ultimate *= 0.2;
      }
      const next = f.def.forms[f.formIndex + 1];
      if (next && battle.rules.allowTransform && R.canAfford(f, next.kiCost) && (battle.rules.maxForm === undefined || f.formIndex + 1 <= battle.rules.maxForm)) {
        scores.transform = (hpF < p.transformHp ? 2.2 : 0) + (this.frame < this.formReactUntil ? 1.8 : 0) + (battle.fightTime > 20 && d.aggression >= 1 ? 0.4 : 0);
        if (dist < 5) scores.transform *= 0.3;
      }
      scores.charge = f.ki < 50 && dist > 15 && !['beamCharge', 'blast'].includes(t.state) ? (1 - f.ki / 100) * 1.1 * w.charge : 0;
      if (f.ki < 20 && dist > 12) scores.charge += 0.5 * w.charge;
      scores.strafe = (0.3 + (1 - aggr) * 0.3) * w.strafe;
      scores.wait = (d.mistake * 1.6 + 0.08) * w.wait;
      scores.retreat = (hpF < 0.25 && p.defense > 0.5 ? 0.8 : 0) + (p.personality === 'gunner' && dist < 8 ? 1.4 : 0);
      scores.throw = seen && seen.state === 'guard' && dist < 5 ? 1.2 * aggr * w.throwBias : this.memory.guard > 4 && dist < 5 ? 0.5 * w.throwBias : 0;

      const hooks = this.hooks();
      if (hooks && hooks.scores) hooks.scores(this, f, t, dist, seen, scores, tVulnerable);
      for (const r of this.recent) if (scores[r] !== undefined) scores[r] *= 0.55;
      if (Math.random() < d.mistake) scores.wait += 0.8;

      let total = 0;
      for (const k in scores) total += Math.max(0, scores[k]);
      let roll = Math.random() * total;
      let pick = 'strafe';
      for (const k in scores) {
        roll -= Math.max(0, scores[k]);
        if (roll <= 0) {
          pick = k;
          break;
        }
      }
      this.recent.push(pick);
      if (this.recent.length > 3) this.recent.shift();
      if (pick !== 'melee') battle.releaseMeleeToken(f);
      this.plan = this._makePlan(pick, f, t, dist);
    }

    _makePlan(type, f, t, dist) {
      const d = this.d;
      const hooks = this.hooks();
      if (hooks && hooks.plans && hooks.plans[type]) return hooks.plans[type](this, f, t, dist);
      switch (type) {
        case 'melee':
          return { type, phase: 'approach', frames: 360, presses: 0, want: Math.max(1, d.comboLen + U.randInt(-1, 1)), heavyDone: false, approachFrames: 0 };
        case 'blast':
          return { type, frames: 120, count: U.randInt(2, 6), fired: 0, next: 0, side: U.chance(0.5) ? 1 : -1 };
        case 'beam': {
          const b = this._beamSlot(f);
          this.holdFrames = U.randInt(b.spec.chargeMin, b.spec.chargeMax);
          return { type, slot: b.slot, frames: 30 + this.holdFrames, pressed: false };
        }
        case 'special1':
        case 'special2':
        case 'ultimate':
          if (type === 'ultimate' && f.def.specials.ultimate.type === 'beam') this.holdFrames = f.def.specials.ultimate.chargeMax;
          if (type === 'ultimate' && f.def.specials.ultimate.holdToCharge) {
            const ul = f.def.specials.ultimate;
            this.bombHold = U.randInt(ul.chargeMin, dist > 40 ? ul.chargeFrames : Math.round((ul.chargeMin + ul.chargeFrames) / 2));
          }
          return { type, frames: 12, pressed: false };
        case 'transform':
          return { type, frames: 10, pressed: false };
        case 'charge':
          return { type, frames: U.randInt(50, 140) };
        case 'retreat':
          return { type, frames: U.randInt(30, 55) };
        case 'throw':
          return { type, frames: 90 };
        case 'wait':
          return { type, frames: U.randInt(12, 36) };
        default:
          return { type: 'strafe', frames: U.randInt(28, 70), side: U.chance(0.5) ? 1 : -1, boost: U.chance(0.35) };
      }
    }

    _altitude(f, t, it) {
      const dy = t.pos.y - f.pos.y;
      if (dy > 1.2) it.up = true;
      else if (dy < -1.2) {
        if (t.grounded && f.pos.y - t.pos.y < 3) it.down = true;
        else it.down = true;
      } else if (t.grounded && !f.grounded && f.distTo(t) < 8) it.down = true;
    }

    _execute(f, t, dist, seen, it) {
      const pl = this.plan;
      const d = this.d;
      pl.frames--;
      if (pl.hook) {
        const hooks = this.hooks();
        if (hooks && hooks.execute) hooks.execute(this, f, t, dist, seen, it, pl);
        else pl.done = true;
        return;
      }
      switch (pl.type) {
        case 'melee': {
          if (pl.phase === 'approach') {
            pl.approachFrames++;
            if (dist > 16) it.boost = true;
            else {
              it.my = 1;
              if (dist > 6) it.boost = true;
              this._altitude(f, t, it);
            }
            if (dist < 2.7 + t.radius) pl.phase = 'combo';
            if (pl.approachFrames > 240) pl.done = true;
            break;
          }
          if (f.state === 'free' && dist > 4.2 + t.radius) {
            pl.phase = 'approach';
            break;
          }
          const ready = f.state === 'free' || (f.state === 'attack' && f.stateFrame >= (f.sd.move.cancel || f.sd.startup + f.sd.move.active) - 1);
          if (!ready) break;
          if (seen && seen.state === 'guard' && pl.presses >= 1 && !pl.guardHandled) {
            pl.guardHandled = true;
            if (Math.random() < 0.35 * this.w.throwBias) {
              it.guard = true;
              it.heavy = true;
              pl.done = true;
              break;
            }
          }
          if (pl.presses < pl.want) {
            it.light = true;
            pl.presses++;
            if (f.state === 'attack' && f.sd.hit && this.difficulty !== 'easy' && pl.presses >= 2 && Math.random() < 0.06 * d.comboLen) {
              const b = this._beamSlot(f);
              if (b && R.canAfford(f, b.spec.kiCost)) {
                it.light = false;
                it[b.slot === 'special1' ? 's1' : 's2'] = true;
                this.holdFrames = b.spec.chargeMin;
                pl.done = true;
              }
            }
          } else if (!pl.heavyDone) {
            it.heavy = true;
            pl.heavyDone = true;
          } else if (!pl.chaseDone && t.state === 'knockback' && f.state === 'attack' && f.sd.hit && Math.random() < 0.12 * d.comboLen) {
            it.heavy = true;
            pl.chaseDone = true;
          } else if (f.state === 'free') pl.done = true;
          break;
        }
        case 'blast': {
          const pref = this.p.preferredRange;
          it.mx = pl.side;
          if (dist < pref - 3) {
            it.my = -1;
            it.boost = dist < 5;
          } else if (dist > pref + 12) it.my = 0.6;
          this._altitude(f, t, it);
          if (pl.next <= 0 && pl.fired < pl.count) {
            it.blast = true;
            pl.fired++;
            pl.next = U.randInt(7, 11);
          }
          pl.next--;
          if (pl.fired >= pl.count && f.state === 'free') pl.done = true;
          if (Math.random() < 0.01) pl.side *= -1;
          break;
        }
        case 'beam':
        case 'special1':
        case 'special2':
        case 'ultimate': {
          if (!pl.pressed && f.state === 'free') {
            const key = pl.type === 'beam' ? (pl.slot === 'special1' ? 's1' : 's2') : pl.type === 'special1' ? 's1' : pl.type === 'special2' ? 's2' : 'ult';
            it[key] = true;
            pl.pressed = true;
          } else if (pl.pressed && f.state === 'free') pl.done = true;
          break;
        }
        case 'transform':
          if (!pl.pressed && f.state === 'free') {
            it.transform = true;
            pl.pressed = true;
          } else pl.done = true;
          break;
        case 'charge':
          if (dist < 10 || f.ki >= f.kiMax - 1) pl.done = true;
          else it.charge = true;
          break;
        case 'retreat':
          it.my = -1;
          it.boost = true;
          it.mx = Math.sin(this.frame * 0.05) > 0 ? 0.5 : -0.5;
          break;
        case 'throw':
          if (dist > 1.9 + t.radius) {
            it.my = 1;
            it.boost = dist > 6;
            this._altitude(f, t, it);
          } else {
            it.guard = true;
            it.heavy = true;
            pl.done = true;
          }
          break;
        case 'wait':
          if (dist < 3 && Math.random() < 0.05) pl.done = true;
          break;
        default: {
          it.mx = pl.side;
          it.boost = pl.boost;
          const pref = Math.max(this.p.preferredRange, 7);
          if (dist < pref - 2) it.my = -0.5;
          else if (dist > pref + 14) it.my = 0.7;
          this._altitude(f, t, it);
          if (Math.random() < 0.015) pl.side *= -1;
        }
      }
    }

    _dummy(f, t, it) {
      switch (this.dummy) {
        case 'guard':
          it.guard = true;
          break;
        case 'dodge': {
          const seen = this.history[Math.max(0, this.history.length - 1 - 6)];
          if (seen && seen.state === 'attack' && seen.dist < 4) {
            const key = 'a' + seen.startFrame;
            if (!this.reacted.has(key)) {
              this.reacted.add(key);
              it.dodge = true;
              it.mx = U.chance(0.5) ? 1 : -1;
            }
          }
          break;
        }
        case 'blast':
          if (this.frame % 50 === 0) it.blast = true;
          break;
        case 'idle':
        default:
          break;
      }
      return it;
    }
  }

  /* ---------------- character AI hooks ---------------- */
  const AIHooks = (SL.AIHooks = SL.AIHooks || {});

  /**
   * Goku: reads the fight. Uses Instant Transmission with intent (behind to
   * punish, above for a smash, away to reset, into an Instant Kamehameha),
   * interrupts charging opponents, climbs Kaioken levels while healthy and
   * holds the Spirit Bomb longer when he has room.
   */
  AIHooks.goku = {
    pre(ai, f, t, dist, seen, it) {
      if (f.state !== 'free' || (ai.plan && ai.plan.hook && !ai.plan.done)) return false;
      const d = ai.d;
      const sp2 = f.def.specials.special2;
      const canIT = sp2 && !(f.cooldowns.special2 > 0) && R.canAfford(f, f.skillCost('special2'));
      // interrupt a charging opponent before the attack comes out
      if (canIT && ['beamCharge', 'spiritBomb', 'charge'].includes(t.state) && dist > 10 && t.stateFrame > d.reaction) {
        const key = 'i' + (t.frame - t.stateFrame);
        if (!ai.reacted.has(key)) {
          ai.reacted.add(key);
          if (Math.random() < 0.3 + d.escape) {
            ai.plan = { hook: true, type: 'it', mode: 'behind', follow: t.state === 'charge' ? 'light' : 'heavy', frames: 90, phase: 'press' };
          }
        }
      }
      return false;
    },

    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      const sp = f.def.specials;
      const sp2 = sp.special2;
      delete scores.special2;
      if (sp2 && !(f.cooldowns.special2 > 0) && R.canAfford(f, f.skillCost('special2'))) {
        const fatigued = f.skillCost('special2') > sp2.kiCost;
        let v = 0.18;
        if (dist > 16) v += 0.45;
        if (seen && seen.state === 'guard') v += 0.35;
        if (tVulnerable && dist > 6) v += 0.5;
        if (!t.grounded && t.state === 'knockback') v += 0.4;
        scores.it = v * (fatigued ? 0.35 : 1) * (0.7 + ai.p.aggression * 0.4);
      }
      // Kaioken: keep charging to raise the level while health allows
      const fm = f.form;
      if (fm.levels && f.formLevel < fm.levels.length - 1 && f.hpFrac > 0.45 && dist > 9) scores.charge = (scores.charge || 0) + 0.7;
      // Kaioken strain at low health: push on to Super Saiyan if possible, otherwise drop it
      if (fm.levels && f.hpFrac < 0.3) {
        if (scores.transform !== undefined) scores.transform += 1.5;
        else if (f.hpFrac < 0.2) scores.revert = 1.2;
      }
      // the Spirit Bomb needs room
      if (scores.ultimate !== undefined && sp.ultimate.type === 'spiritBomb') scores.ultimate *= dist > 35 || tVulnerable ? 1.4 : 0.25;
    },

    plans: {
      it(ai, f, t, dist) {
        let mode = 'behind';
        const r = Math.random();
        if (!t.grounded && r < 0.35) mode = 'above';
        else if (dist > 20 && r < 0.5) mode = 'front';
        else if (f.hpFrac < 0.3 && r < 0.4) mode = 'away';
        const fr = Math.random();
        const follow = mode === 'away' ? (fr < 0.6 ? 's1' : 'none') : mode === 'above' ? 'heavy' : fr < 0.3 ? 's1' : fr < 0.75 ? 'light' : 'heavy';
        return { hook: true, type: 'it', mode, follow, frames: 100, phase: 'press' };
      },
      revert() {
        return { hook: true, type: 'revert', frames: 6, phase: 'press' };
      },
    },

    execute(ai, f, t, dist, seen, it, pl) {
      if (pl.type === 'revert') {
        if (f.state === 'free' && f.formIndex > 0) it.revert = true;
        pl.done = true;
        return;
      }
      if (pl.frames <= 0) {
        pl.done = true;
        return;
      }
      if (pl.phase === 'press') {
        if (f.state !== 'free') {
          if (pl.frames < 60) pl.done = true;
          return;
        }
        it.s2 = true;
        if (pl.mode === 'above') it.up = true;
        else if (pl.mode === 'front') it.my = 1;
        else if (pl.mode === 'away') it.my = -1;
        pl.phase = 'teleporting';
        return;
      }
      if (pl.phase === 'teleporting') {
        if (f.state === 'teleport') return;
        if (f.state === 'attack' && pl.mode === 'front') {
          pl.phase = 'combo';
          pl.presses = 1;
          return;
        }
        if (f.state !== 'free' || f.followFrames <= 0) {
          pl.done = true;
          return;
        }
        if (pl.follow === 's1' && R.canAfford(f, f.skillCost('special1'))) {
          it.s1 = true;
          ai.holdFrames = U.randInt(6, 14);
        } else if (pl.follow === 'heavy') it.heavy = true;
        else if (pl.follow === 'light') {
          it.light = true;
          pl.phase = 'combo';
          pl.presses = 1;
          return;
        }
        pl.done = true;
        return;
      }
      if (pl.phase === 'combo') {
        const ready = f.state === 'free' || (f.state === 'attack' && f.stateFrame >= (f.sd.move.cancel || f.sd.startup + f.sd.move.active) - 1);
        if (!ready) return;
        if (pl.presses < 3) {
          it.light = true;
          pl.presses++;
        } else {
          it.heavy = true;
          pl.done = true;
        }
      }
    },
  };


  SL.PlayerController = PlayerController;
  SL.AIController = AIController;
  SL.AI_PERSONALITY = PERSONALITY;
})();
