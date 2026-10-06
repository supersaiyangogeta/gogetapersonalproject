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
      const b = this.battle;
      if (b.inputLocked) {
        if (b.radial && b.radial.open) b.radial = { open: false };
        this.radialSel = -1;
        return it;
      }
      const I = SL.Input;
      // RADIAL SKILL MENU: hold to open (time slows), point, release to use
      if (SL.RadialMenu && I.held('skillMenu')) {
        const entries = SL.RadialMenu.buildEntries(f, b);
        if (!(b.radial && b.radial.open)) this.radialPoint = {};
        const dir = SL.RadialMenu.pointDirection(this.radialPoint, { move: I.move, rightStick: I.rightStick, pointer: b.radialPointer });
        b.radialPointer.x = b.radialPointer.y = 0;
        const sel = SL.RadialMenu.pick(entries, dir.x, dir.y);
        if (sel >= 0) this.radialSel = sel;
        if (!(b.radial && b.radial.open)) b.emit('radialOpen', { fighter: f });
        b.radial = { open: true, entries, selected: this.radialSel === undefined ? -1 : this.radialSel, fighter: f, pointer: dir.source };
        b.slowmo(0.3, 0.1);
        it.camYaw = b.cameraYaw();
        return it;
      }
      if (b.radial && b.radial.open) {
        const e = b.radial.entries[this.radialSel];
        b.radial = { open: false };
        this.radialSel = -1;
        const chosen = e ? SL.RadialMenu.use(e, f, b) : null;
        if (chosen) this.pending = { intent: chosen, frames: 0 };
      }
      if (this.pending) {
        // press on the first tick, keep charge buttons held briefly so beams come out
        const p = this.pending;
        for (const k of Object.keys(p.intent)) if (p.frames === 0 || k.endsWith('Held')) it[k] = p.intent[k];
        p.frames++;
        if (p.frames > 32) this.pending = null;
      }
      it.mx = I.move.x;
      it.my = I.move.y;
      it.up = I.held('ascend');
      it.upPressed = I.pressed('ascend');
      it.down = I.held('descend');
      it.boost = I.held('boost');
      it.boostPressed = I.pressed('boost');
      it.light = it.light || I.pressed('light');
      it.heavy = I.pressed('heavy');
      it.blast = I.pressed('blast');
      it.blastHeld = I.held('blast');
      it.guard = I.held('guard');
      it.dodge = I.pressed('dodge');
      it.charge = I.held('charge');
      it.s1 = it.s1 || I.pressed('special1');
      it.s1Held = it.s1Held || I.held('special1');
      it.s2 = it.s2 || I.pressed('special2');
      it.s2Held = it.s2Held || I.held('special2');
      it.ult = it.ult || I.pressed('ultimate');
      it.ultHeld = it.ultHeld || I.held('ultimate');
      it.transform = it.transform || I.pressed('transform');
      it.revert = it.revert || I.pressed('revert');
      it.target = I.pressed('target');
      it.targetNext = I.pressed('targetNext');
      it.targetPrev = I.pressed('targetPrev');
      // gamepad: while locked on, a firm flick of the right stick switches to the next target on that side
      const rs = I.rightStick ? I.rightStick.x : 0;
      if (Math.abs(rs) < 0.35) this._flickReady = true;
      else if (Math.abs(rs) > 0.85 && this._flickReady && f.lockMode !== 'free' && (f.target || f.lockProp)) {
        this._flickReady = false;
        it.targetFlick = Math.sign(rs);
      }
      it.camYaw = this.battle.cameraYaw();
      const lock = this.battle.playerLimits;
      if (lock) {
        for (const k of Object.keys(lock)) if (lock[k] === false) it[k] = false;
      }
      return it;
    }
  }

  /** Decisions that put pressure on the other fighter (see AIController._rhythm). */
  const AGGRESSIVE = { melee: 1, blast: 1, beam: 1, special1: 1, special2: 1, ultimate: 1, throw: 1 };

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
      // a form may change how the character fights (def.forms[i].ai), so the profile is rebuilt on a form change
      this.p = Object.assign({ personality: 'adaptive', aggression: 0.6, defense: 0.5, ranged: 0.4, beam: 0.5, transformHp: 0.5, preferredRange: 3 }, f.def.ai || {}, (f.form && f.form.ai) || {}, this.profileOverride || {});
      this.w = PERSONALITY[this.p.personality] || PERSONALITY.adaptive;
      this._pForm = f.formIndex;
    }

    update(f) {
      if (!this.p || this._pForm !== f.formIndex) this._init(f);
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
        const slotKey = f.sd.slot === 'special1' ? 's1Held' : f.sd.slot === 'special2' ? 's2Held' : f.sd.slot && f.sd.slot.startsWith('x:') ? 'extraHeld' : 'ultHeld';
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
          if (f.specials() && f.specials().special2 && f.specials().special2.type === 'teleport' && f.ki > 40 && Math.random() < 0.5) it.s2 = true;
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

      if (!this.plan || this.plan.frames <= 0 || this.plan.done) {
        if (this.plan && this.plan.type === 'blast') battle.releaseRangedToken(f);
        this._choose(f, t, dist, seen);
      }
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
      const sp = f.specials() || {};
      for (const slot of ['special1', 'special2']) if (sp[slot] && sp[slot].type === 'beam') return { slot, spec: sp[slot] };
      return null;
    }

    /**
     * RHYTHM (owner, human playtest round 3: "Frieza appears to spam attacks constantly" and
     * the player never gets a turn). A fighter whose data asks for it (def.ai.rhythm) attacks
     * in bursts and then stops for a breath: approach, watch, taunt, reposition. The opening is
     * the point — it is when the player attacks, charges, transforms or lands a technique.
     * { burst: how many aggressive decisions in a row, rest: frames of breathing room }
     */
    _rhythm(f) {
      // a mission can retune the breathing room for a story phase (a shaken emperor hesitates
      // longer; a desperate one barely stops)
      return f.aiRhythm || (f.def && f.def.ai && f.def.ai.rhythm) || null;
    }

    _countPressure(pick) {
      const r = this._rhythm(this.fighter || {});
      if (!r) return;
      if (AGGRESSIVE[pick] || pick.startsWith('p_')) {
        this.burst = (this.burst || 0) + 1;
        if (this.burst >= (r.burst || 3)) {
          this.burst = 0;
          this.restUntil = this.frame + (r.rest || 70);
          // the opening is announced, so the player can read it: he stops and says something
          const f = this.fighter;
          if (f && this.battle) {
            this.battle.emit('aiBreath', { fighter: f, frames: r.rest || 70 });
            if (this.battle.bark) this.battle.bark(f, 'taunt');
          }
        }
      }
    }

    resting() {
      return this.restUntil !== undefined && this.frame < this.restUntil;
    }

    _choose(f, t, dist, seen) {
      const d = this.d, p = this.p, w = this.w;
      this.fighter = f;
      const battle = this.battle;
      const hpF = f.hpFrac;
      let aggr = p.aggression * d.aggression;
      if (p.personality === 'berserker') aggr *= 1 + (1 - hpF) * 0.8;
      if (p.personality === 'adaptive' && t.hpFrac < hpF) aggr *= 0.9;
      if (p.personality === 'adaptive' && hpF < t.hpFrac - 0.2) aggr *= 1.25;
      const token = battle.requestMeleeToken(f, t);
      const sp = f.specials() || {};
      const tVulnerable = ['knockdown', 'stagger', 'guardBreak', 'recover', 'charge', 'getup', 'transform'].includes(t.state);
      const scores = {};
      scores.melee = aggr * w.melee * (token ? 1 : 0.08) * (dist < 40 ? 1 : 0.7);
      scores.blast = p.ranged * w.blast * (dist > 7 ? 1 : 0.25) * (f.ki > 15 ? 1 : 0.1) * (token ? 0.7 : 1.4) * (battle.rangedTokenFree(f, t) ? 1 : 0.15);
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
      // MAJOR TECHNIQUES (owner, human playtest round 3: "the AI interrupts my Ultimate almost
      // every time"). Two rules, in one place, over every hook:
      //   1. nobody reacts before they have seen it — the punish scores that a charging target
      //      attracts are halved until the technique has been up for the difficulty's reaction time;
      //   2. once it is committed (Fighter.committedUltimate) poking at it no longer works, so the
      //      AI stops trying and braces or resets the spacing instead of mashing into armour.
      const tBusy = ['charge', 'beamCharge', 'spiritBomb', 'scatter', 'rush'].includes(t.state);
      if (tBusy && t.stateFrame <= d.reaction) {
        for (const k of ['melee', 'blast', 'beam', 'special1', 'special2', 'ultimate']) if (scores[k]) scores[k] *= 0.5;
      }
      if (t.committedUltimate && t.committedUltimate()) {
        for (const k of ['melee', 'blast', 'beam', 'special1', 'special2', 'throw']) if (scores[k]) scores[k] *= 0.35;
        scores.retreat = (scores.retreat || 0) + 0.6;
        scores.strafe = (scores.strafe || 0) + 0.5;
      }
      // the breath between bursts: he closes, circles or watches, and the player gets a turn
      if (this.resting()) {
        for (const k of ['melee', 'blast', 'beam', 'special1', 'special2', 'ultimate', 'throw']) if (scores[k]) scores[k] *= 0.12;
        for (const k of Object.keys(scores)) if (k.startsWith('p_')) scores[k] *= 0.12;
        scores.strafe = (scores.strafe || 0) + 1.2;
        scores.wait = (scores.wait || 0) + 0.8;
      }
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
      this._countPressure(pick);
      this.plan = this._makePlan(pick, f, t, dist);
    }

    _makePlan(type, f, t, dist) {
      const d = this.d;
      const hooks = this.hooks();
      if (hooks && hooks.plans && hooks.plans[type]) return hooks.plans[type](this, f, t, dist);
      switch (type) {
        case 'melee':
          // p.comboLen: a story phase can shorten or lengthen a boss's strings (a toying emperor)
          return { type, phase: 'approach', frames: 360, presses: 0, want: Math.max(1, (this.p.comboLen || d.comboLen) + U.randInt(-1, 1)), heavyDone: false, approachFrames: 0 };
        case 'blast': {
          // in a group fight against the player volleys are shorter and start with a visible tell;
          // a fighter whose profile asks for it (p.blastTell) glows first in a duel as well
          const group = t.isPlayer && this.battle.enemiesOf(t).length > 1;
          return { type, frames: group ? 150 : 120, count: group ? U.randInt(2, 3) : U.randInt(2, this.p.blastTell ? 4 : 6), fired: 0, next: 0, side: U.chance(0.5) ? 1 : -1, group, tell: group ? 0 : this.p.blastTell || 0 };
        }
        case 'beam': {
          const b = this._beamSlot(f);
          this.holdFrames = U.randInt(b.spec.chargeMin, b.spec.chargeMax);
          // a free opponent closes about 30 m/s: a longer charge just gets punished
          // (telemetry: 3 of 4 long planned charges were interrupted by melee)
          const tFree = !['knockdown', 'stagger', 'guardBreak', 'getup', 'transform', 'beamFire', 'recoverSpecial'].includes(t.state);
          if (tFree && this.difficulty !== 'easy') this.holdFrames = Math.max(b.spec.chargeMin, Math.min(this.holdFrames, Math.round(dist * 2 - this.d.reaction)));
          // a downed or staggered opponent: finish charging before they are back up
          else if (t.sd && t.sd.frames && this.difficulty !== 'easy') {
            const left = t.sd.frames - t.stateFrame + (t.state === 'knockdown' ? 20 : 0);
            const travel = (dist / (b.spec.speed || 100)) * 60;
            this.holdFrames = Math.max(b.spec.chargeMin, Math.min(this.holdFrames, Math.round(left - travel)));
          }
          return { type, slot: b.slot, frames: 30 + this.holdFrames, pressed: false };
        }
        case 'special1':
        case 'special2':
        case 'ultimate':
          if (type === 'ultimate' && f.specials().ultimate.type === 'beam') this.holdFrames = f.specials().ultimate.chargeMax;
          if (type === 'ultimate' && f.specials().ultimate.holdToCharge) {
            const ul = f.specials().ultimate;
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
            // p.approachBoost: a boss that stops boosting further out, so the last stretch of
            // his approach is seen and can be answered (it is the tell for his strings)
            const near = this.p.approachBoost || 6;
            if (dist > Math.max(16, near)) it.boost = true;
            else {
              it.my = 1;
              if (dist > near) it.boost = true;
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
          // p.whiffBreath: a strike that swung at air ends the string, and he takes a breath
          // before the next one — he recovers (def.whiffRecovery), the player gets the turn
          if (this.p.whiffBreath && f.state === 'attack' && !f.sd.hit && f.stateFrame > f.sd.startup + f.sd.move.active) {
            pl.done = true;
            this.restUntil = Math.max(this.restUntil || 0, this.frame + this.p.whiffBreath);
            this.burst = 0;
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
          // group fight: only open a combo with a melee slot, and not from outside the player's view
          if (pl.presses === 0 && t.isPlayer && !(this.battle.requestMeleeToken(f, t) && this.battle.pressureAllows(f, t))) {
            it.mx = pl.side || (pl.side = U.chance(0.5) ? 1 : -1);
            it.my = dist < 3.2 ? -0.5 : 0;
            break;
          }
          if (pl.presses < pl.want) {
            it.light = true;
            pl.presses++;
            // combo into a beam (not for bosses: their beams belong to their phase patterns)
            if (f.state === 'attack' && f.sd.hit && this.difficulty !== 'easy' && this.p.hooks !== 'boss' && pl.presses >= 2 && Math.random() < 0.06 * d.comboLen) {
              const b = this._beamSlot(f);
              if (b && R.canAfford(f, b.spec.kiCost)) {
                it.light = false;
                it[b.slot === 'special1' ? 's1' : 's2'] = true;
                this.holdFrames = Math.min(b.spec.chargeMin, R.QUICK_BEAM_MIN);
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
          if (pl.fired === 0 && pl.group && !pl.cleared) {
            // wait for a volley slot and to be in view, then glow for a moment before the first shot
            if (this.battle.pressureAllows(f, t) && this.battle.requestRangedToken(f, t)) {
              pl.cleared = true;
              pl.tell = 16;
            } else break;
          }
          if (pl.tell > 0) {
            pl.tell--;
            if (pl.tell % 4 === 0) this.battle.vfx.flash(f.handPos('R'), 0.9, 0xff8a70, 0.12, SL.Toon.tex.glow);
            f.flash = Math.max(f.flash, 0.25);
            break;
          }
          if (pl.next <= 0 && pl.fired < pl.count) {
            it.blast = true;
            pl.fired++;
            pl.next = U.randInt(pl.group ? 12 : 7, pl.group ? 18 : 11);
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
          if (this.p.leash && dist > this.p.leash) pl.done = true;
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
      const sp2 = f.specials().special2;
      const canIT = sp2 && !(f.cooldowns.special2 > 0) && R.canAfford(f, f.skillCost('special2'));
      // interrupt a charging opponent before the attack comes out
      if (canIT && ['beamCharge', 'spiritBomb', 'charge'].includes(t.state) && dist > 10 && t.stateFrame > d.reaction) {
        const key = 'i' + (t.frame - t.stateFrame);
        if (!ai.reacted.has(key)) {
          ai.reacted.add(key);
          if (Math.random() < 0.3 + d.escape) {
            // (telemetry: behind -> heavy against a charging beam was hit by the beam 3 times in 3; the light's 4-frame startup wins)
            ai.plan = { hook: true, type: 'it', mode: 'behind', follow: 'light', frames: 90, phase: 'press' };
          }
        }
      }
      return false;
    },

    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      const sp = f.specials();
      const sp2 = sp.special2;
      delete scores.special2;
      // never teleport onto a downed or rising opponent: wake-up is invulnerable and they punish
      // (telemetry: 148 damage dealt / 923 taken per use)
      const waking = ['knockdown', 'getup'].includes(t.state);
      // nor behind an opponent mid-swing: the lunge turns into Goku (telemetry: 365 dealt / 1341 taken); their recovery is fine
      const swinging = t.state === 'attack' && t.sd && t.sd.move && t.stateFrame <= t.sd.startup + t.sd.move.active;
      if (sp2 && !waking && !swinging && !(f.cooldowns.special2 > 0) && R.canAfford(f, f.skillCost('special2'))) {
        const fatigued = f.skillCost('special2') > sp2.kiCost;
        let v = 0.18;
        if (dist > 16) v += 0.45;
        if (seen && seen.state === 'guard') v += 0.35;
        if (tVulnerable && dist > 6) v += 0.5;
        if (!t.grounded && t.state === 'knockback') v += 0.4;
        scores.it = v * (fatigued ? 0.35 : 1) * (0.7 + ai.p.aggression * 0.4);
      }
      // Kaioken: keep charging to raise the level while health and strain allow
      const fm = f.form;
      const strainOk = !fm.strain || f.strain < fm.strain.max * 0.45;
      if (fm.levels && f.formLevel < f.formLevelCap(fm) && f.hpFrac > 0.45 && dist > 9 && strainOk) scores.charge = (scores.charge || 0) + 0.7;
      // strain: bail out before the body gives out; never re-enter while sore
      if (fm.strain && f.strain > fm.strain.max * 0.72) {
        if (scores.transform !== undefined) scores.transform += 1.2;
        else scores.revert = 2.5;
      }
      const nextForm = f.def.forms[f.formIndex + 1];
      if (nextForm && nextForm.strain && (f.strain > nextForm.strain.reentryAt || f.overloadCooldown > 0)) delete scores.transform;
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
        // above for a smash only on a juggled opponent: a free flying one just guards the slow hammer
        // (telemetry: above -> heavy on a free target dealt 310 and took 1317 per use)
        if (!t.grounded && ['knockback', 'hitstun'].includes(t.state) && r < 0.6) mode = 'above';
        else if (dist > 20 && r < 0.5) mode = 'front';
        else if (f.hpFrac < 0.3 && r < 0.4) mode = 'away';
        const fr = Math.random();
        // Instant Kamehameha from behind only when the target is not swinging (it lost 1323 per use into an attack)
        const busy = ['attack', 'rush', 'throw'].includes(t.state);
        const follow = mode === 'away' ? (fr < 0.6 ? 's1' : 'none') : mode === 'above' ? 'heavy' : fr < 0.3 && !busy ? 's1' : fr < 0.75 ? 'light' : 'heavy';
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


  /**
   * Raditz: a bully who grabs. Lashes his tail at guarding or hesitant
   * opponents from farther than a hand grab reaches, then picks a follow-up
   * from the situation: point-blank Double Sunday with ki to spare, a ground
   * slam to finish, otherwise a hurl.
   */
  AIHooks.raditz = {
    pre(ai, f, t, dist, seen, it) {
      if (f.state === 'tailGrapple' && f.sd.phase === 'hold') {
        const hf = f.stateFrame - f.sd.holdStart;
        if (hf < 18 + ai.d.reaction) return true;
        const v = f.sd.victim;
        if (!v) return true;
        if (R.canAfford(f, f.skillCost('special1')) && Math.random() < 0.45) {
          it.s1 = true;
          ai.holdFrames = f.specials().special1.chargeMin + 2;
        } else if (v.hpFrac < 0.3 || Math.random() < 0.5) it.light = true;
        else it.heavy = true;
        return true;
      }
      if (['tailGrapple', 'tailFinish', 'tailPain'].includes(f.state)) return true;
      return false;
    },
    scores(ai, f, t, dist, seen, scores) {
      const reach = f.moveSet.throw.reach * f.scale + t.radius;
      const grabbable = !['knockdown', 'knockback', 'held', 'dodge', 'vanish'].includes(t.state);
      if (grabbable && dist > 1.6 && dist < reach - 0.2) scores.tail = (seen && seen.state === 'guard' ? 1.3 : 0.35) + (t.state === 'charge' || t.state === 'beamCharge' ? 0.8 : 0);
    },
    plans: {
      tail(ai, f, t, dist) {
        return { hook: true, type: 'tail', frames: 60, phase: 'close' };
      },
    },
    execute(ai, f, t, dist, seen, it, pl) {
      if (pl.frames <= 0 || f.state !== 'free') {
        if (f.state !== 'free' && pl.pressed) pl.done = true;
        if (pl.frames <= 0) pl.done = true;
        return;
      }
      const reach = f.moveSet.throw.reach * f.scale + t.radius;
      if (dist > reach - 0.4) {
        it.my = 1;
        ai._altitude(f, t, it);
        return;
      }
      it.guard = true;
      it.heavy = true;
      pl.pressed = true;
    },
  };

  /**
   * Chiaotzu: support psychic. Pins the target when an ally is already on it
   * or when it starts charging, keeps range otherwise, and only throws himself
   * at an opponent with Self-Destruct when he is nearly finished anyway.
   */
  AIHooks.chiaotzu = {
    pre(ai, f, t, dist, seen, it) {
      if (f.state === 'telekinesis') {
        const sd = f.sd;
        if (sd.phase === 'focus') it.s2Held = true;
        else if (sd.phase === 'hold') {
          // hold while an ally is punishing, or long enough to charge a Dodon Ray follow-up when alone
          const allyOn = ai.battle.alliesOf(f).some((a) => a !== f && a.alive && a.target === sd.victim && a.pos.distanceTo(sd.victim.pos) < 6);
          const want = allyOn ? 140 : 45 + ai.d.reaction;
          it.s2Held = f.stateFrame - sd.holdStart < want && f.ki > 8;
        }
        return true;
      }
      return false;
    },
    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      const sp = f.specials();
      delete scores.special2;
      if (!(f.cooldowns.special2 > 0) && R.canAfford(f, sp.special2.kiCost + 15) && dist < sp.special2.range) {
        const allyOn = ai.battle.alliesOf(f).some((a) => a !== f && a.alive && a.target === t && a.pos.distanceTo(t.pos) < 8);
        scores.special2 = 0.25 + (allyOn ? 1.2 : 0) + (['charge', 'beamCharge', 'spiritBomb'].includes(t.state) ? 1 : 0);
      }
      if (dist < 3 && f.hpFrac < 0.6) scores.retreat = (scores.retreat || 0) + 0.4;
      if (scores.ultimate !== undefined) scores.ultimate = f.hpFrac < 0.25 && t.hpFrac < 0.4 ? 1.5 : 0;
    },
  };

  /**
   * Yajirobe: hangs back, slips behind opponents who are busy with someone
   * else, and eats a Senzu Bean when hurt and out of reach (or tosses one to
   * a falling ally).
   */
  AIHooks.yajirobe = {
    scores(ai, f, t, dist, seen, scores) {
      const sp = f.specials();
      delete scores.special1;
      const beans = f.mech && f.mech.beans > 0;
      const allyLow = ai.battle.alliesOf(f).some((a) => a !== f && a.alive && !a.hidden && a.hpFrac < sp.special1.allyBelow && a.pos.distanceTo(f.pos) < sp.special1.tossRange);
      if (beans && !(f.cooldowns.special1 > 0) && ((f.hpFrac < 0.35 && dist > 7) || allyLow)) scores.special1 = 2.5;
      if (scores.special2 !== undefined) {
        const busy = t.target && t.target !== f;
        scores.special2 = (busy ? 1.1 : 0.2) + (seen && seen.state === 'guard' ? 0.5 : 0);
      }
      if (t.hpFrac > 0.5 && dist < 3 && t.target === f) scores.retreat = (scores.retreat || 0) + 0.3;
    },
  };

  /**
   * Piccolo: a tactician. Keeps a working distance, yanks rushdown opponents
   * in with Demon Hand on his own terms, lays Light Grenade mines between
   * himself and an aggressor, steps in to protect a struggling ally, and only
   * commits to the Special Beam Cannon when the target is far and busy.
   */
  AIHooks.piccolo = {
    pre(ai, f, t, dist, seen, it) {
      if (f.state !== 'free') return false;
      const b = ai.battle;
      // protect an ally who is held, latched or reeling: go after whoever is on them
      for (const ally of b.alliesOf(f)) {
        if (!['held', 'knockdown', 'hitstun'].includes(ally.state)) continue;
        const threat = b.enemiesOf(f).find((e) => e.target === ally && e.pos.distanceTo(ally.pos) < 6 && !e.untargetable);
        if (threat && threat !== f.target && Math.random() < 0.04 + ai.d.escape * 0.1) {
          f.target = threat;
          return false;
        }
      }
      return false;
    },
    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      const sp = f.specials();
      delete scores.special1;
      delete scores.special2;
      if (!(f.cooldowns.special1 > 0) && R.canAfford(f, sp.special1.kiCost) && dist > 5 && dist < sp.special1.reach) {
        scores.special1 = 0.35 + (tVulnerable ? 0.5 : 0) + (['beamCharge', 'charge', 'blast'].includes(t.state) ? 0.8 : 0);
      }
      const mines = ai.battle.projectiles.list.filter((p) => p.owner === f && p.mine).length;
      if (R.canAfford(f, sp.special2.kiCost) && mines < 2 && dist > 6 && dist < 25) scores.special2 = 0.35 + (t.target === f && t.speed > 12 ? 0.5 : 0);
      // stays at his range instead of brawling
      if (dist < 3.5 && f.hpFrac < 0.6) scores.retreat = (scores.retreat || 0) + 0.5;
      scores.strafe = (scores.strafe || 0) * 1.15;
      if (scores.ultimate !== undefined) scores.ultimate *= dist > 18 && (tVulnerable || t.state === 'charge') ? 1.6 : 0.2;
      // Explosive Demon Wave: a wide, slow wave for a distant or downed target (or to meet a beam)
      const dw = (f.def.extras || []).find((e) => e.id === 'explosiveDemonWave');
      if (dw && !(f.lockedSlots && f.lockedSlots['x:' + dw.id]) && R.canAfford(f, dw.kiCost) && dist > 10) {
        scores.demonWave = 0.2 + (tVulnerable ? 0.9 : 0) + (['beamCharge', 'charge', 'spiritBomb'].includes(t.state) ? 0.7 : 0);
      }
    },
    plans: {
      demonWave(ai, f, t, dist) {
        const dw = f.def.extras.find((e) => e.id === 'explosiveDemonWave');
        ai.holdFrames = Math.min(dw.chargeMax, Math.max(dw.chargeMin + 2, Math.round(dist * 2 - ai.d.reaction)));
        return { hook: true, type: 'demonWave', id: dw.id, frames: 40 + ai.holdFrames, pressed: false };
      },
    },
    execute(ai, f, t, dist, seen, it, pl) {
      if (pl.type !== 'demonWave') {
        pl.done = true;
        return;
      }
      if (!pl.pressed && f.state === 'free') {
        it.extra = pl.id;
        it.extraHeld = true;
        pl.pressed = true;
      } else if (pl.pressed && f.state === 'free') pl.done = true;
      if (pl.frames <= 0) pl.done = true;
    },
  };

  /**
   * Vegeta: proud and relentless. Almost never waits or backs off, cashes in a
   * Perfect Guard with his Prince's Counter, closes out low-health opponents
   * with a charged Galick Gun, and answers a charging opponent by rushing them.
   */
  AIHooks.vegeta = {
    pre(ai, f, t, dist, seen, it) {
      // a Perfect Guard just happened: punish immediately
      if (f.counterFrames > 0 && (f.state === 'free' || f.state === 'guard') && dist < 5) {
        if (Math.random() < 0.55 + ai.d.escape) {
          it[Math.random() < 0.7 ? 'light' : 'heavy'] = true;
          ai.battle.bark(f, 'counter');
          return true;
        }
      }
      return false;
    },
    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      scores.wait = (scores.wait || 0) * 0.25;
      scores.retreat = (scores.retreat || 0) * 0.2;
      scores.strafe = (scores.strafe || 0) * 0.55;
      if (['charge', 'beamCharge', 'spiritBomb'].includes(t.state) && dist < 30) scores.melee = (scores.melee || 0) + 1.2;
      // finisher instinct
      if (t.hpFrac < 0.3 && scores.beam !== undefined && dist > 8) scores.beam += 0.9;
      if (f.mech && f.mech.max) scores.melee = (scores.melee || 0) * 1.3;
    },
  };

  /**
   * Kid Gohan: a frightened child who keeps his distance and fires Masenko,
   * turns into a relentless attacker while his hidden power is unleashed, and
   * backs off to recover while drained.
   */
  AIHooks.kid_gohan = {
    scores(ai, f, t, dist, seen, scores) {
      const m = f.mech || {};
      if (m.unleashed) {
        scores.melee = (scores.melee || 0.5) * 1.9 + 0.4;
        const sp2 = f.specials().special2;
        if (sp2 && R.canAfford(f, sp2.kiCost)) scores.special2 = dist > 6 ? 2.4 : 0.6;
        scores.wait = 0;
        scores.retreat = 0;
        scores.strafe = (scores.strafe || 0) * 0.25;
        scores.charge = 0;
      } else {
        delete scores.special2;
        if (m.drained > 0) {
          scores.retreat = (scores.retreat || 0) + 1.1;
          scores.melee = (scores.melee || 0) * 0.35;
        } else if (f.hpFrac > 0.5) {
          scores.strafe = (scores.strafe || 0) + 0.25;
        }
      }
    },
  };

  /**
   * Saibaman: a pack animal. Packmates spread to different sides of the prey,
   * only one tries the self-destruct latch at a time (preferably while the prey
   * is busy with someone else or reeling), the rest keep their distance while a
   * latch is in progress. Burrows toward grounded prey from mid range, spits
   * acid at prey that flies out of reach, and jumps at prey hovering just above.
   */
  const LATCHING = ['latchCrouch', 'latchLeap', 'latchCling'];
  AIHooks.saibaman = {
    pre(ai, f, t, dist, seen, it) {
      if (f.state !== 'free') return false;
      const b = ai.battle;
      // a packmate is already on the prey's back: cackle and circle, don't knock it loose
      if (b.fighters.some((o) => o !== f && o.alive && o.state === 'latchCling' && o.sd.victim === t)) {
        const want = 6;
        it.my = dist > want + 1 ? 0.7 : dist < want - 1 ? -0.6 : 0;
        it.mx = f.mech.side;
        if (ai.frame % 50 === 0) f.anim.play('sb_cackle', 12);
        return true;
      }
      // prey hovering just overhead: jump at it
      const above = t.pos.y - f.pos.y;
      if (!f.canFly() && f.grounded && above > 1.6 && above < 5 && dist < 5 && ai.frame % 40 === 0) {
        it.upPressed = true;
        it.my = 1;
        return true;
      }
      return false;
    },

    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      const b = ai.battle;
      const sp = f.specials();
      const pack = b.fighters.filter((o) => o.alive && o.team === f.team && o.def.id === f.def.id);
      f.mech.side = pack.indexOf(f) % 2 ? 1 : -1;
      const busy = t.target !== f || ['attack', 'beamCharge', 'charge', 'blast', 'guard', 'recover'].includes(t.state);
      const someoneLatching = pack.some((o) => o !== f && LATCHING.includes(o.state));
      const altitude = t.pos.y - (b.stage.hasGround ? b.stage.heightAt(t.pos.x, t.pos.z) : t.pos.y);
      const out = !f.canFly() && altitude > 4.5;

      delete scores.special1;
      delete scores.special2;
      const latch = sp.special2;
      if (latch && !(f.cooldowns.special2 > 0) && R.canAfford(f, latch.kiCost) && dist < latch.range && !someoneLatching && t.state !== 'held' && altitude < 9) {
        scores.special2 = (tVulnerable ? 1.4 : 0.15) + (busy ? 0.8 : 0) + (f.hpFrac < 0.35 ? 1.1 : 0) + (pack.length >= 3 ? 0.2 : 0);
      }
      const burrow = sp.special1;
      if (burrow && !(f.cooldowns.special1 > 0) && R.canAfford(f, burrow.kiCost) && f.grounded && dist > 8 && dist < 40 && altitude < 2.5) {
        scores.special1 = 0.5 + (busy ? 0.25 : 0);
      }
      if (out) {
        // can't reach it: spit acid, wait for it to come down
        scores.melee = (scores.melee || 0) * 0.1;
        scores.blast = (scores.blast || 0) + 1.2;
        scores.strafe = (scores.strafe || 0) + 0.4;
      }
      if (f.mech.frenzy > 0) {
        scores.melee = (scores.melee || 0) * 1.6 + 0.3;
        scores.wait = 0;
        scores.retreat = 0;
      }
      scores.charge = 0;
    },
  };

  /**
   * CELL JUNIORS — a swarm with rules, so seven of them are pressure rather than
   * a pile-up. The team shares one plan, refreshed every 20 frames:
   *   pressure — at most `pressureRules().melee` of them work the hero the
   *              player controls; after five seconds on him they rotate out, and
   *              the ones coming in circle for three quarters of a second before
   *              they swing, so the pressure moves instead of stacking;
   *   ally     — the others spread over the other heroes, never more than two on
   *              any one of them;
   *   flank    — anyone left over circles the player's hero at a distance and
   *              waits for a pressure slot to open.
   * No health or damage numbers live here: it only decides who fights whom.
   *
   * MOODS (b.juniorMood, set only by the Super Saiyan 2 purge — SL.data.cellPurge; unset, none of
   * this runs): 'hunt' — the squad as above, and the circle throws the odd Junior Blast;
   * 'desperate' — thinned out, they stop waiting their turn: quick hand-overs, more blasts, and the
   * circle climbs so the next one in comes down from the air; 'last' — the last two go in together.
   * In any mood a Junior with f._shakenUntil (one of them was just destroyed) or f._reelUntil (it was
   * just smashed and got up) holds back at a distance instead of swinging. Behaviour only: no
   * health, damage or speed changes with the mood.
   */
  const JuniorSquad = {
    REFRESH: 20,
    ROTATE: 300,
    HANDOVER: 45,
    PER_ALLY: 2,
    plan(b, f) {
      const s = b._juniorSquad || (b._juniorSquad = { frame: -999, jobs: new Map(), since: new Map() });
      if (b.frame - s.frame < JuniorSquad.REFRESH) return s;
      s.frame = b.frame;
      s.jobs = new Map();
      const juniors = b.fighters.filter((o) => o.alive && !o.hidden && o.team === f.team && o.def.id === f.def.id);
      const heroes = b.enemiesOf(f).filter((e) => !e.untargetable && !e.hidden && !e.benched);
      if (!juniors.length || !heroes.length) return s;
      const player = heroes.find((h) => h.isPlayer) || null;
      const others = heroes.filter((h) => h !== player);
      const cap = player ? b.pressureRules().melee : 0;
      const onPlayer = [];
      if (player) {
        const tired = (j) => s.since.has(j) && b.frame - s.since.get(j) > JuniorSquad.ROTATE && juniors.length > cap;
        // the ones already on him stay (oldest first) unless they have had their turn
        const current = juniors.filter((j) => s.since.has(j) && !tired(j)).sort((a, c) => s.since.get(a) - s.since.get(c));
        for (const j of current) if (onPlayer.length < cap) onPlayer.push(j);
        const fresh = juniors.filter((j) => !onPlayer.includes(j) && !tired(j)).sort((a, c) => a.pos.distanceTo(player.pos) - c.pos.distanceTo(player.pos));
        for (const j of fresh) if (onPlayer.length < cap) onPlayer.push(j);
        const rest = juniors.filter((j) => !onPlayer.includes(j)).sort((a, c) => a.pos.distanceTo(player.pos) - c.pos.distanceTo(player.pos));
        for (const j of rest) if (onPlayer.length < cap) onPlayer.push(j);
      }
      const since = new Map();
      for (const j of onPlayer) {
        since.set(j, s.since.has(j) && !(b.frame - s.since.get(j) > JuniorSquad.ROTATE && juniors.length > cap) ? s.since.get(j) : b.frame);
        s.jobs.set(j, { role: 'pressure', target: player });
      }
      s.since = since;
      const load = new Map(others.map((h) => [h, 0]));
      let side = 1;
      for (const j of juniors) {
        if (onPlayer.includes(j)) continue;
        let pick = null;
        for (const h of others) {
          if (load.get(h) >= JuniorSquad.PER_ALLY) continue;
          if (!pick || load.get(h) < load.get(pick) || (load.get(h) === load.get(pick) && j.pos.distanceTo(h.pos) < j.pos.distanceTo(pick.pos))) pick = h;
        }
        if (pick) {
          load.set(pick, load.get(pick) + 1);
          s.jobs.set(j, { role: 'ally', target: pick });
        } else if (player) {
          s.jobs.set(j, { role: 'flank', target: player, side });
          side = -side;
        }
      }
      return s;
    },
  };
  SL.JuniorSquad = JuniorSquad;

  AIHooks.cell_junior = {
    pre(ai, f, t, dist, seen, it) {
      const b = ai.battle;
      let job = JuniorSquad.plan(b, f).jobs.get(f);
      // the hero this Junior was sent at has gone down or out of reach: plan again now, not in twenty frames
      if (job && job.target && (!job.target.alive || job.target.untargetable || job.target.hidden)) {
        b._juniorSquad.frame = -999;
        job = JuniorSquad.plan(b, f).jobs.get(f);
      }
      if (!job) return false;
      if (job.target && job.target.alive && job.target !== f.target) {
        b.releaseMeleeToken(f);
        f.target = job.target;
      }
      if (f.squadRole !== job.role) {
        // a Junior taking over the pressure announces itself first: a short beat of circling
        // close before it swings, so a hand-over reads as a hand-over and not as a pile-on
        const mood = b.juniorMood;
        if (job.role === 'pressure' && f.squadRole) f.pressureDelay = mood === 'last' ? 0 : mood === 'desperate' ? 18 : JuniorSquad.HANDOVER;
        f.squadRole = job.role;
        b.emit('squadRole', { fighter: f, role: job.role, holding: job.role === 'flank' });
      }
      // Known Bugs #36: a swing that began on somebody else and has been turned onto the player
      // (the plan moved this Junior, or the friend it was hitting went down) breaks off when the
      // squad already has its quota swinging at him. New swings are refused in Fighter._startAttack.
      if (f.state === 'attack' && f.sd.victim !== f.target && b.squadMeleeFull(f, f.target)) f.setState('free');
      // one sent out to circle gives back its turn on the player: a melee token kept by a Junior that
      // only circles (its brain never chooses again while it waits) starves the pair meant to be on him
      if (job.role === 'flank' && f.state !== 'attack') {
        const held = b.tokens.get(job.target);
        if (held) held.delete(f);
      }
      if (f.pressureDelay > 0) f.pressureDelay--;
      const mood = b.juniorMood;
      // one of them was just destroyed, or this one was just smashed: it keeps its distance for a moment
      if (mood && f.state === 'free' && f.target && (f._shakenUntil > b.frame || f._reelUntil > b.frame)) {
        const d = f.distTo(f.target);
        it.my = d < 10 ? -0.9 : d > 13 ? 0.4 : 0;
        it.mx = (job.side || 1) * 0.35;
        return true;
      }
      const waiting = job.role === 'flank' || (job.role === 'pressure' && f.pressureDelay > 0);
      if (!waiting || f.state !== 'free' || !f.target) return false;
      // waiting for a turn: circle at a distance where he can see you coming
      const tt = f.target;
      const d = f.distTo(tt);
      const want = job.role === 'flank' ? 8 : 4;
      const n = b.fighters.indexOf(f);
      // thinned out, the circle climbs: whoever is sent in next comes down from the air
      const lift = mood === 'desperate' && job.role === 'flank' ? [0, 3, 5][n % 3] : 0;
      it.my = d > want + 1.5 ? 0.8 : d < want - 1.5 ? -0.8 : 0;
      it.mx = job.side || 1;
      if (tt.pos.y + lift - f.pos.y > 1.5) it.up = true;
      else if (f.pos.y - tt.pos.y - lift > 1.5) it.down = true;
      // ranged pressure from the circle: a Junior Blast now and then, one volley slot at a time
      // (timed off the frame, not a dice roll, so it does not shift anybody's random stream)
      const every = mood === 'hunt' ? 170 : mood ? 95 : 0;
      if (every && job.role === 'flank' && (b.frame + n * 37) % every === 0 && d < 30) {
        const sp = f.specFor('special1');
        if (sp && !(f.cooldowns.special1 > 0) && f.ki >= sp.kiCost && b.requestRangedToken(f, tt)) {
          it.s1 = true;
          b.releaseRangedToken(f);
        }
      }
      return true;
    },
    scores(ai, f, t, dist, seen, scores) {
      scores.charge = 0;
      if (f.squadRole === 'pressure') {
        scores.melee = (scores.melee || 0) * 1.25;
        scores.wait = (scores.wait || 0) * 0.5;
      }
      // desperation is behaviour, not numbers: they stop measuring him and just go in
      if (ai.battle.juniorMood === 'desperate' || ai.battle.juniorMood === 'last') {
        scores.melee = (scores.melee || 0) * 1.35;
        scores.wait = (scores.wait || 0) * 0.3;
        scores.strafe = (scores.strafe || 0) * 0.6;
      }
    },
  };

  /**
   * PERFECT CELL, reading the fight. Built on the boss hook, and it notices three
   * things a finished Cell would notice:
   *   - the opponent's form changing (a sudden jump in power): he stops waiting and
   *     leans on his patterns;
   *   - being countered: after two counters he stops walking into them and works
   *     from range instead;
   *   - his own regeneration: hurt, with room to breathe, he backs off on purpose to
   *     let it work — which is the player's cue to stay on him.
   * Each is announced as a `cellAdapts` event so it can be seen and tested.
   */
  AIHooks.cell = {
    pre(ai, f, t, dist, seen, it) {
      const b = ai.battle;
      const tid = t.form && t.form.id;
      if (ai.cellSeenForm !== tid) {
        if (ai.cellSeenForm !== undefined) {
          ai.cellAlarm = ai.frame;
          b.emit('cellAdapts', { fighter: f, reason: 'form', form: tid });
        }
        ai.cellSeenForm = tid;
      }
      if (t.state === 'attack' && t.sd && t.sd.counter && ai.cellCounterSd !== t.sd) {
        ai.cellCounterSd = t.sd;
        ai.cellCountered = (ai.cellCountered || 0) + 1;
        if (ai.cellCountered === 2) b.emit('cellAdapts', { fighter: f, reason: 'countered' });
      }
      const regen = f.def.regen;
      const safe = dist > 7 && !['attack', 'dash', 'rush', 'teleport'].includes(t.state);
      if (regen && !f.noRegen && f.hpFrac < 0.7 && safe && f.state === 'free') {
        if (!f.regenRetreat) {
          f.regenRetreat = true;
          b.emit('cellAdapts', { fighter: f, reason: 'regen' });
        }
        it.my = dist < 16 ? -1 : 0;
        it.mx = ai.frame % 120 < 60 ? 0.5 : -0.5;
        return true;
      }
      f.regenRetreat = false;
      return AIHooks.boss.pre(ai, f, t, dist, seen, it);
    },
    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      AIHooks.boss.scores(ai, f, t, dist, seen, scores, tVulnerable);
      const B = f.def.boss;
      if ((ai.cellCountered || 0) >= 2) {
        scores.melee = (scores.melee || 0) * 0.55;
        for (const name of Object.keys(B.patterns)) if (scores['p_' + name]) scores['p_' + name] *= 1.4;
        scores.strafe = (scores.strafe || 0) + 0.3;
      }
      if (ai.cellAlarm !== undefined) {
        scores.melee = (scores.melee || 0) * 1.15;
        for (const name of Object.keys(B.patterns)) if (scores['p_' + name]) scores['p_' + name] *= 1.25;
        scores.wait = 0;
      }
    },
  };

  /**
   * Boss AI (def.boss): keeps the shared reactions and melee, and chooses
   * named attack patterns from the current phase (weights, range limits,
   * cooldowns). Patterns start a boss technique, press a special slot, or run
   * a short input script (a charging ram). Bosses gloat over knocked-down
   * opponents, which is an opening.
   */
  const bossPlans = new Proxy({}, {
    get(o, key) {
      if (typeof key !== 'string' || !key.startsWith('p_')) return undefined;
      return () => ({ hook: true, type: key, pattern: key.slice(2), frames: 420, started: false, step: 0 });
    },
  });
  /**
   * SQUAD — light coordination for bosses that fight in a pair (def.ai.squad).
   * It does two things and nothing else: it stops a team from all piling onto
   * the same hero while another stands unwatched, and it gives each member a
   * role so they are not doing the same job at the same time.
   *
   * The roles are meant to be legible from the outside:
   *   pressure — closes the distance, and presses harder while the other one
   *              is committed to a ranged attack;
   *   space    — holds its distance, and holds its fire while the pressure
   *              partner is in melee on the same hero (so standing next to
   *              the brawler buys you a moment of quiet). If the partner is
   *              knocked down or dead it stops holding back.
   *
   * No health or damage multipliers live here. A squad is harder to fight
   * because the two halves cover different ground, and it stops being harder
   * the moment one half is on the floor.
   */
  const Squad = {
    REFRESH: 20,
    plan(b, f) {
      const key = f.team === undefined ? 'x' : f.team;
      b._squads = b._squads || {};
      const s = b._squads[key] || (b._squads[key] = { frame: -999, assign: new Map(), mates: [], foes: [] });
      if (b.frame - s.frame < Squad.REFRESH) return s;
      s.frame = b.frame;
      s.mates = b.alliesOf(f).filter((m) => m.alive && m.def.ai && m.def.ai.squad);
      if (!s.mates.includes(f) && f.alive) s.mates.unshift(f);
      s.foes = b.enemiesOf(f).filter((e) => e.alive && !e.hidden && !e.untargetable && !e.benched);
      s.assign = new Map();
      // more than one hero on the field: take one each, nearest first, before doubling up
      if (s.foes.length > 1 && s.mates.length > 1) {
        const taken = new Set();
        for (const m of s.mates) {
          const free = s.foes.filter((e) => !taken.has(e));
          const pool = free.length ? free : s.foes;
          let pick = pool[0];
          for (const e of pool) if (m.pos.distanceTo(e.pos) < m.pos.distanceTo(pick.pos)) pick = e;
          taken.add(pick);
          s.assign.set(m, pick);
        }
      }
      return s;
    },
    /** The squad partner filling the given role, if it is still standing. */
    mate(plan, f, role) {
      return plan.mates.find((m) => m !== f && m.alive && m.def.ai.squad && m.def.ai.squad.role === role) || null;
    },
    /** A fighter who is down, held or staggered is not doing their job. */
    engaged(m) {
      return m && m.alive && !['knockdown', 'getup', 'stagger', 'held', 'hitstun', 'knockback'].includes(m.state);
    },
    /** Fired when a member starts or stops holding back, so it can be seen and heard. */
    note(f, holding) {
      if (f._squadHold === holding) return;
      f._squadHold = holding;
      f.battle.emit('squadRole', { fighter: f, role: f.def.ai.squad.role, holding });
      if (holding && f.def.ai.squad.line) f.battle.bark(f, f.def.ai.squad.line);
    },
  };

  AIHooks.boss = {
    // squad members spread out across the heroes instead of stacking on one
    pre(ai, f, t, dist, seen, it) {
      if (!f.def.ai.squad) return false;
      const plan = Squad.plan(f.battle, f);
      const mine = plan.assign.get(f);
      if (mine && mine.alive && mine !== f.target) f.target = mine;
      return false;
    },
    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      const B = f.def.boss;
      const ph = B.phases[(f.mech && f.mech.phase) || 0];
      ai.patternCd = ai.patternCd || {};
      // a boss fires its beams through its phase patterns only (a generic beam score let them beam in any phase)
      for (const k of ['special1', 'special2', 'ultimate', 'transform', 'charge', 'retreat', 'beam']) delete scores[k];
      scores.wait = (scores.wait || 0) * (ph.patience || 1);
      const altitude = t.pos.y - (ai.battle.stage.hasGround ? ai.battle.stage.heightAt(t.pos.x, t.pos.z) : t.pos.y);
      for (const name of Object.keys(ph.patterns)) {
        const w = ph.patterns[name];
        if (name === 'melee') {
          scores.melee = (scores.melee || 0) * w;
          continue;
        }
        const pat = B.patterns[name];
        if (!pat || (ai.patternCd[name] || 0) > ai.frame) continue;
        if (pat.minDist !== undefined && dist < pat.minDist) continue;
        if (pat.maxDist !== undefined && dist > pat.maxDist) continue;
        if (pat.maxAltitude !== undefined && altitude > pat.maxAltitude) continue;
        if (pat.when === 'targetDown' && !['knockdown', 'getup'].includes(t.state)) continue;
        if (pat.slot && !R.canAfford(f, f.skillCost(pat.slot))) continue;
        scores['p_' + name] = w * (tVulnerable && pat.punish ? 1.8 : 1);
      }
      const sq = f.def.ai.squad;
      if (!sq) return;
      const plan = Squad.plan(f.battle, f);
      if (sq.role === 'space') {
        // he will not shoot through his own partner: while the brawler is on the
        // same hero, the ranged patterns go quiet and he uses the time to reposition
        const mate = Squad.mate(plan, f, 'pressure');
        const holding = !!(mate && Squad.engaged(mate) && mate.target === t && mate.pos.distanceTo(t.pos) < (sq.holdRange || 5.5));
        Squad.note(f, holding);
        if (holding) {
          for (const name of Object.keys(B.patterns)) if (B.patterns[name].ranged) delete scores['p_' + name];
          scores.melee = (scores.melee || 0) * 0.5;
          scores.blast = (scores.blast || 0) * 0.15;
          scores.retreat = (scores.retreat || 0) + 0.7;
          scores.strafe = (scores.strafe || 0) + 0.5;
        } else if (!mate || !mate.alive) {
          // left on his own he stops waiting for anybody
          for (const name of Object.keys(B.patterns)) if (B.patterns[name].ranged && scores['p_' + name]) scores['p_' + name] *= 1.25;
        }
      } else if (sq.role === 'pressure') {
        // while his partner is winding up a shot he goes in, to keep the hero honest
        const mate = Squad.mate(plan, f, 'space');
        const shooting = !!(mate && mate.alive && ['scatter', 'projectile', 'beamCharge', 'beamFire', 'retreatVolley'].includes(mate.state));
        Squad.note(f, shooting);
        if (shooting) {
          scores.melee = (scores.melee || 0) * 1.3;
          for (const name of Object.keys(B.patterns)) if (B.patterns[name].pressure && scores['p_' + name]) scores['p_' + name] *= 1.3;
        }
      }
    },
    plans: bossPlans,
    execute(ai, f, t, dist, seen, it, pl) {
      const B = f.def.boss;
      const pat = B.patterns[pl.pattern];
      if (!pat || pl.frames <= 0) {
        pl.done = true;
        return;
      }
      if (!pl.started) {
        if (f.state !== 'free') {
          if (pl.frames < 360) pl.done = true;
          return;
        }
        ai.patternCd[pl.pattern] = ai.frame + (pat.cooldown || 120);
        pl.started = true;
        if (pat.technique) {
          const spec = B.techniques[pat.technique];
          if (!spec || !SL.Techniques[spec.type].start(f, spec, 'boss', 0)) pl.done = true;
          return;
        }
        if (pat.slot) {
          it[{ special1: 's1', special2: 's2', ultimate: 'ult' }[pat.slot]] = true;
          if (pat.hold) ai.holdFrames = pat.hold;
          return;
        }
      }
      if (pat.inputs) {
        const step = pat.inputs[pl.step];
        if (!step) {
          if (f.state === 'free') pl.done = true;
          return;
        }
        Object.assign(it, step);
        pl.step++;
        return;
      }
      if (f.state === 'free') {
        pl.done = true;
        // p.patternBreath: after a committed technique he watches what it did before the next
        // exchange — a dodged Death Beam is not a free run-up into a string
        if (ai.p.patternBreath) ai.restUntil = Math.max(ai.restUntil || 0, ai.frame + ai.p.patternBreath);
      }
    },
  };

  /**
   * FRIEZA — boss patterns plus a personality: he punishes anyone who stops to
   * charge, keeps the distance he likes, finishes people who are nearly done,
   * and stops being patient as his own health goes. Inherits the boss hook, so
   * phases still own which specials exist at all.
   */
  AIHooks.cell.plans = AIHooks.boss.plans;
  AIHooks.cell.execute = AIHooks.boss.execute;

  AIHooks.frieza = Object.assign(Object.create(AIHooks.boss), {
    scores(ai, f, t, dist, seen, scores, tVulnerable) {
      AIHooks.boss.scores.call(this, ai, f, t, dist, seen, scores, tVulnerable);
      const B = f.def.boss;
      const want = ai.p.preferredRange || 7;
      const hurt = t.hpFrac <= ((f.def.cruelty && f.def.cruelty.below) || 0.4);
      // he punishes a charge he has SEEN (the delayed view, like every other reaction) — not
      // the frame the button went down (owner's fairness pass: "it should not look psychic")
      const charging = !!seen && ['charge', 'beamCharge', 'spiritBomb', 'scatter'].includes(seen.state) && ['charge', 'beamCharge', 'spiritBomb', 'scatter'].includes(t.state);
      for (const name of Object.keys(B.patterns)) {
        const key = 'p_' + name;
        if (!scores[key]) continue;
        const pat = B.patterns[name];
        // somebody standing still to gather ki is the whole reason he carries a beam
        if (charging && pat.punishCharge) scores[key] *= 2.4;
        // he would rather finish a hurt opponent than start something new
        if (hurt && pat.finisher) scores[key] *= 1.8;
      }
      if (charging) {
        scores.wait = (scores.wait || 0) * 0.3;
        scores.strafe = (scores.strafe || 0) * 0.5;
      }
      // he does not like being crowded — but he is a boss, not a target that flees. The
      // owner found Vegeta's fight nearly impossible because every time Vegeta closed in,
      // Frieza backed off again (playtest round 2). Now he fights up close, and only breaks
      // away to reset the spacing after being crowded for a while, at most every seven
      // seconds; after that he comes back in.
      const mem = ai.memory;
      const now = ai.frame;
      if (ai.plan && ai.plan.type === 'retreat' && now - (mem.fzRetreat || -9999) > 60) mem.fzRetreat = now;
      if (dist < want * 0.5) {
        if (mem.fzCloseSince === undefined) mem.fzCloseSince = now;
        const crowdedFor = now - mem.fzCloseSince;
        if (crowdedFor > 150 && now - (mem.fzRetreat || -9999) > 420) {
          scores.retreat = (scores.retreat || 0) + 0.9;
          scores.melee = (scores.melee || 0) * 0.75;
        } else {
          scores.retreat = 0;
          scores.melee = (scores.melee || 0) * 1.15;
        }
      } else {
        mem.fzCloseSince = undefined;
        if (dist > want * 1.6) scores.melee = (scores.melee || 0) * 1.3;
      }
      // as his own health goes, the patience goes with it
      const own = f.hpFrac;
      if (own < 0.5) {
        scores.wait = (scores.wait || 0) * 0.6;
        scores.melee = (scores.melee || 0) * 1.15;
      }
      // STORY PHASES (owner, human playtest round 4: after Super Saiyan he "could still
      // completely dominate Goku"). The mission sets f.aiPhase; the same fighter then behaves
      // like a different man:
      //   dominant — the emperor: presses, toys, punishes (the default above)
      //   shaken   — facing a Super Saiyan: he stops walking in, keeps his distance, throws
      //              everything from range, backs off when he is touched, and hesitates
      //   full     — 100%: desperate, relentless, the heavy techniques come out
      const phase = f.aiPhase || 'dominant';
      if (phase === 'shaken') {
        scores.melee = (scores.melee || 0) * 0.5;
        scores.strafe = (scores.strafe || 0) + 0.6;
        for (const k of Object.keys(scores)) if (k.startsWith('p_') && k !== 'p_melee') scores[k] *= 1.35;
        // he backs off — but one break-away at a time (every ~3.3 s): he is faster than Goku
        // on paper, and without this he out-flew every approach and the reversal never landed
        if (now - (mem.fzRetreat || -9999) > 200) {
          scores.retreat = (scores.retreat || 0) + (dist < want ? 1.1 : 0.3);
          if (seen && seen.state === 'attack') scores.retreat += 0.6;
        } else scores.retreat = 0;
      } else if (phase === 'full') {
        scores.melee = (scores.melee || 0) * 1.3;
        scores.wait = (scores.wait || 0) * 0.3;
        scores.retreat = (scores.retreat || 0) * 0.3;
        for (const k of Object.keys(scores)) if (k.startsWith('p_')) scores[k] *= 1.25;
      }
      // SOFT LEASH (ai.leash): past it he stops backing off and comes back in — he may retreat
      // to reset the spacing, never to run the fight from the far side of the arena
      if (ai.p.leash && dist > ai.p.leash) {
        scores.retreat = 0;
        scores.melee = (scores.melee || 0) * 1.6;
        scores.wait = (scores.wait || 0) * 0.4;
      }
    },
  });

  /**
   * MAJIN BUU — he plays, and then he does not. In the breathing room of his rhythm he dances,
   * pats his belly or laughs, standing there wide open (the player's window); when it ends he is
   * suddenly behind you with a heavy — no wind-up, no walk. A target his antenna turned to candy
   * is food: he goes straight for it (the mechanic eats it if he arrives first). Boss patterns
   * (candy ray, rubber arm, the ball) come from the boss hook.
   */
  AIHooks.buu = Object.assign(Object.create(AIHooks.boss), {
    pre(ai, f, t, dist, seen, it) {
      const me = f.mech || {};
      const b = ai.battle;
      if (me.apart || me.laughUntil) return true;
      if (t && t.state === 'held' && t.sd && t.sd.stone && t.sd.stone.kind === 'candy') {
        it.my = 1;
        it.boost = dist > 6;
        return true;
      }
      if (me.emoteUntil) {
        // hit out of it: the game is over, and he is angry about it
        if (f.state !== 'scripted') me.emoteUntil = 0;
        else if (ai.frame < me.emoteUntil) return true;
        else {
          me.emoteUntil = 0;
          f.setState('free');
          if (t && t.alive && dist > 2.4 && dist < 30 && !b.inputLocked) {
            // the sudden part: from wherever he was dancing to right behind you
            const dest = t.pos.clone().addScaledVector(t.forward, -1.7 * t.scale);
            dest.y = t.pos.y;
            b.stage.clampPosition(dest);
            b.vfx.afterimage(f.pos, f.height, 0xffb8d8);
            f.setPosition(dest);
            f.prevPos.copy(dest);
            f.faceTarget(100);
            b.sfx('vanish', f, { pitch: 0.8 });
            it.heavy = true;
            b.emit('buuPounce', { fighter: f, target: t });
            return true;
          }
        }
      }
      if (ai.resting() && f.state === 'free' && !me.played && t && dist > 3.2 && !b.inputLocked) {
        const acts = ['bu_dance', 'bu_bellyPat', 'bu_laugh'];
        const pose = acts[Math.floor(ai.frame / 7) % acts.length];
        f.setState('scripted', { pose, expression: 'grin' });
        me.emoteUntil = ai.frame + 70 + (ai.frame % 45);
        me.played = true;
        b.bark(f, 'taunt', true);
        b.emit('buuPlays', { fighter: f, pose });
        return true;
      }
      if (!ai.resting()) me.played = false;
      return AIHooks.boss.pre(ai, f, t, dist, seen, it);
    },
  });

  SL.PlayerController = PlayerController;
  SL.AIController = AIController;
  SL.AI_PERSONALITY = PERSONALITY;
})();
