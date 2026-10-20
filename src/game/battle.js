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
      // the story mission this battle plays (the wardrobe dresses its cast for that era)
      this.missionId = config.missionId || null;
      this.rules = Object.assign({ timeLimit: 0, allowTransform: true, allowUltimates: true, damagePlayer: 1, damageEnemy: 1, balance: 'balanced' }, config.rules || {});
      this.scene = new THREE.Scene();
      this.camera = new SL.CameraRig();
      this.camera.setAspect(window.innerWidth / window.innerHeight);
      this.shadowsOn = SL.Render.shadowMapSize() > 0;
      this.vfx = new SL.VFX(this.scene);
      const sdef = SL.data.stages[config.stageId] || SL.data.stages.wasteland;
      this.stage = new SL.Stage(this, sdef);
      // a stage built as a tournament ring plays by its rules in Free Battle (missions set their own)
      if (config.mode === 'free' && sdef.ringOut && this.rules.ringOut === undefined) this.rules.ringOut = {};
      this.vfx.setStage(this.stage);
      this.camera.setFar(sdef.type === 'space' ? 5000 : SL.Render.farDistance());
      this.projectiles = new SL.Projectiles(this);
      this.clash = new SL.BeamClash(this);
      this.fighters = [];
      this.creatures = [];
      // per-tick callbacks owned by techniques (ground warnings, delayed eruptions); return false to stop
      this.tickHandlers = [];
      this.player = null;
      this.frame = 0;
      this.fightTime = 0;
      this.acc = 0;
      this.slow = null;
      this.phase = 'setup';
      this.paused = false;
      this.cinematicOwners = null;
      this.chargeLoops = [];
      this.inputLocked = true;
      this.aiLocked = true;
      this.tokens = new Map();
      this.listeners = {};
      this.mission = null;
      this.seq = null;
      this.skipRequested = false;
      this.lookAcc = { x: 0, y: 0 };
      this.radialPointer = { x: 0, y: 0 };
      this.musicHold = 0;
      this.baseMusic = 1;
      this.result = null;
      this.playerLimits = null;
      this.chargeFocus = 0;
      this.disposed = false;
      this._resizeOff = SL.events.on('render:resize', (e) => this.camera.setAspect(e.width / e.height));
      for (const spec of config.fighters || []) this.spawn(spec);
      this.telemetry = SL.Telemetry ? new SL.Telemetry(this) : null;
      // bosses remember who hurt them lately (boss attention in party battles)
      this.on('damage', (e) => {
        const t = e.target;
        if (!t || !e.attacker || e.attacker.team === t.team || !(t.def.boss || (t.tags && t.tags.boss))) return;
        const a = t._aggro || (t._aggro = new Map());
        a.set(e.attacker, this.aggroOf(t, e.attacker) + e.amount * (e.blocked ? 0.3 : 1));
        t._aggroFrame = t._aggroFrame || new Map();
        t._aggroFrame.set(e.attacker, this.frame);
      });
    }

    /**
     * Swap the whole world for another stage in the middle of the battle (a teleport, Babidi's
     * magic, Instant Transmission to somewhere else). The old stage and everything it built go;
     * fighters stay and are clamped into the new play area; whatever was in flight is cleared.
     * Missions place their cast afterwards.
     */
    changeStage(stageId) {
      const sdef = SL.data.stages[stageId];
      if (!sdef || (this.stage && this.stage.def === sdef)) return this.stage;
      if (this.clash.active) this.clash._abort();
      for (const pr of this.projectiles.list) this.projectiles._explode(pr, true);
      for (const bm of this.projectiles.beams) bm.dispose();
      this.stage.dispose();
      this.stage = new SL.Stage(this, sdef);
      this.vfx.setStage(this.stage);
      this.camera.setFar(sdef.type === 'space' ? 5000 : SL.Render.farDistance());
      for (const f of this.fighters) {
        this.stage.clampPosition(f.pos);
        if (this.stage.hasGround && f.grounded) f.pos.y = this.stage.heightAt(f.pos.x, f.pos.z);
        f.prevPos.copy(f.pos);
      }
      if (this.camera.cut) this.camera.cut();
      this.emit('stageChanged', { stage: this.stage, id: stageId });
      return this.stage;
    }

    /**
     * Run fn every simulation tick until it returns false, or until the returned function is called (safe from
     * inside a handler: fn does not run again). Registered from inside a handler, fn first runs on the next tick.
     */
    onTick(fn) {
      let live = true;
      this.tickHandlers.push(() => live && fn());
      return () => {
        live = false;
      };
    }

    /** Run fn once after a number of simulation ticks (the returned function cancels it). */
    after(frames, fn) {
      let n = frames;
      return this.onTick(() => {
        if (--n > 0) return true;
        fn();
        return false;
      });
    }

    /* ---------------- events ---------------- */
    /** Subscribes to a battle event; returns a function that unsubscribes (phases clean up after themselves). */
    on(name, fn) {
      (this.listeners[name] || (this.listeners[name] = [])).push(fn);
      return () => this.off(name, fn);
    }
    off(name, fn) {
      const l = this.listeners[name];
      if (!l) return;
      const i = l.indexOf(fn);
      if (i >= 0) l.splice(i, 1);
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
        noFlight: spec.noFlight,
        name: spec.name,
        tags: spec.tags,
        damageTakenMul: spec.damageTakenMul,
        damageDealtMul: spec.damageDealtMul,
        wardrobe: spec.wardrobe,
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

    /* ---------------- party (hero switching) ---------------- */
    /**
     * Heroes the player can take control of. The others fight on as CPU allies.
     * opts.allyDifficulty sets how well CPU-controlled heroes play.
     */
    setParty(fighters, opts = {}) {
      this.party = fighters.slice();
      this.partyCooldown = 0;
      this.allyDifficulty = opts.allyDifficulty || this.allyDifficulty || 'normal';
      for (const f of this.party) if (f !== this.player && !(f.controller instanceof SL.AIController)) f.controller = this._allyController(f);
      this.emit('party', { party: this.party });
    }

    partyAlive() {
      return (this.party || []).filter((f) => f.alive && !f.benched);
    }

    _allyController(f) {
      return f._aiController || (f._aiController = new SL.AIController(this, { difficulty: this.allyDifficulty || 'normal' }));
    }

    /** A hero with something on their back (a Saibaman's latch): only the player can shake it off quickly. */
    inTrouble(f) {
      return !!(f && f.alive && !f.benched && f.state === 'held' && f.sd && f.sd.latched);
    }

    /** The next hero in party order after the current player (wraps). A hero in trouble comes first. */
    nextPartyMember(dir = 1) {
      const list = this.party || [];
      if (!list.length) return null;
      const trouble = list.find((f) => f !== this.player && this.inTrouble(f));
      if (trouble) return trouble;
      const i = list.indexOf(this.player);
      for (let k = 1; k <= list.length; k++) {
        const f = list[(((i + dir * k) % list.length) + list.length) % list.length];
        if (f && f !== this.player && f.alive && !f.benched) return f;
      }
      return null;
    }

    canSwitchTo(f) {
      if (!f || f === this.player || !f.alive || f.benched || !this.party || !this.party.includes(f)) return false;
      if (this.partyCooldown > 0 || this.inputLocked || this.phase !== 'fight') return false;
      const busy = ['held', 'clash', 'transform', 'transformSequence', 'spiritBomb', 'scripted', 'latchCling'];
      // switching INTO a latched hero is allowed: that is how the player saves them
      if (busy.includes(f.state) && !this.inTrouble(f)) return false;
      if (this.player && this.player.alive && busy.includes(this.player.state)) return false;
      return true;
    }

    switchPlayer(to, opts = {}) {
      if (!opts.force && !this.canSwitchTo(to)) return false;
      if (!to || !to.alive) return false;
      const from = this.player;
      if (from) {
        from.isPlayer = false;
        from.controller = this._allyController(from);
        if (from.alive && ['guard', 'charge'].includes(from.state)) from.setState('free');
        this.chargeFocus = 0;
      }
      to.isPlayer = true;
      to.controller = to._playerController || (to._playerController = new SL.PlayerController(this));
      to._manualNoTarget = false;
      to.lockMode = 'locked';
      to.lockProp = null;
      if (from) {
        from.lockMode = 'locked';
        from.lockProp = null;
      }
      if (to.state === 'guard' || to.state === 'charge') to.setState('free');
      this.player = to;
      if (!to.target || !to.target.alive || to.target.untargetable) to.target = this.pickTarget(to);
      this.partyCooldown = opts.force ? 20 : 40;
      // show the hand-off: a flash on the incoming hero (opts.quiet: a story cut hands over silently)
      if (!opts.quiet) {
        const c = to.chest();
        this.vfx.ring(c, 3.2, (to.form.aura && to.form.aura.color) || 0xffffff, 0.35);
        this.vfx.flash(c, 2.2, 0xffffff, 0.18, SL.Toon.tex.glow);
        to.flash = 0.5;
        SL.Audio.play('uiSelect', { vol: 0.6 });
      }
      this.emit('playerSwitched', { from, to, forced: !!opts.force });
      return true;
    }

    /* ---------------- body change (Captain Ginyu) ---------------- */
    /**
     * Two fighters trade minds. Everything physical stays with the body it
     * belongs to — health, ki, stats, moves, form, mechanic, cooldowns — and
     * what moves across is who is driving it: player control, the AI profile,
     * the side they fight for, the party seat and the name on the HUD.
     *
     * fighter.mind records who is currently in a body ({ id, name, ai, own }),
     * so the swap is readable from outside, testable, and reversible: swapping
     * the same two fighters again restores both, including the penalty a stolen
     * body carries (a mind that is not used to its new body cannot use its full
     * power, which is the whole reason Ginyu is dangerous and still beatable).
     *
     * opts.penalty  - damage multiplier for the stolen body (with opts.penalize).
     * opts.penalize - the body that was taken, i.e. the one the penalty lands on.
     * opts.silent   — skip the flash and the sound (used when staging a mission).
     */
    mindOf(f) {
      if (!f.mind) f.mind = { id: f.def.id, name: f.def.name, ai: f.def.ai || null, own: f };
      return f.mind;
    }

    swapBodies(a, b, opts = {}) {
      if (!a || !b || a === b || !a.alive || !b.alive) return false;
      const ma = this.mindOf(a), mb = this.mindOf(b);
      const aWasPlayer = this.player === a, bWasPlayer = this.player === b;
      // the minds change bodies
      a.mind = mb;
      b.mind = ma;
      a.name = mb.name;
      b.name = ma.name;
      // the side follows the mind, not the body
      const team = a.team;
      a.team = b.team;
      b.team = team;
      const tags = a.tags;
      a.tags = b.tags;
      b.tags = tags;
      // a mind in a body that is not its own cannot use it properly
      const penalty = opts.penalty || 1;
      for (const f of [a, b]) {
        if (f._mindPenalty) {
          f.damageDealtMul = (f.damageDealtMul || 1) / f._mindPenalty;
          f._mindPenalty = 0;
        }
      }
      // only the body that was taken carries it: the thief cannot use a stolen
      // body properly, while the mind that was robbed is already in a worse one
      const stolen = opts.penalize || null;
      if (penalty !== 1 && stolen && this.mindOf(stolen).own !== stolen) {
        stolen.damageDealtMul = (stolen.damageDealtMul || 1) * penalty;
        stolen._mindPenalty = penalty;
      }
      // controllers are rebuilt from scratch: a cached one holds the old profile
      for (const f of [a, b]) {
        f._aiController = null;
        f._playerController = null;
        f.combo.hits = 0;
        this.releaseMeleeToken(f);
        this.releaseRangedToken(f);
        if (['guard', 'charge'].includes(f.state)) f.setState('free');
      }
      const giveAI = (f) => {
        const mind = this.mindOf(f);
        const profile = Object.assign({}, mind.ai || {});
        // boss hooks read def.boss, which belongs to the body: a mind that moves
        // into a body without one loses the hooks rather than crashing on them
        if (profile.hooks === 'boss' && !f.def.boss) delete profile.hooks;
        f.isPlayer = false;
        f.controller = new SL.AIController(this, { difficulty: this.allyDifficulty || SL.Settings.data.gameplay.difficulty, profile });
      };
      // the player keeps their own mind, so control moves to the body it landed in
      if (aWasPlayer || bWasPlayer) {
        const to = aWasPlayer ? b : a;
        const from = aWasPlayer ? a : b;
        giveAI(from);
        this.player = null; // switchPlayer must not hand the old body an ally controller
        this.switchPlayer(to, { force: true });
        if (this.party) {
          const i = this.party.indexOf(from);
          if (i >= 0) this.party[i] = to;
          this.emit('party', { party: this.party });
        }
      } else {
        giveAI(a);
        giveAI(b);
      }
      // nobody keeps a target that is now on their own side
      for (const f of this.fighters) if (f.target === a || f.target === b || f === a || f === b) f.target = null;
      for (const f of this.fighters) if (!f.target) f.target = this.pickTarget(f);
      if (!opts.silent) {
        for (const f of [a, b]) {
          this.vfx.flash(f.chest(), 2.6, 0xffffff, 0.25, SL.Toon.tex.glow);
          this.vfx.ring(f.chest(), 3.4, 0xd8b0ff, 0.4);
          f.flash = 0.7;
        }
        SL.Audio.play('vanish', { vol: 0.9 });
      }
      this.emit('bodyChange', { a, b, aMind: this.mindOf(a), bMind: this.mindOf(b), player: this.player });
      return true;
    }

    enemiesOf(f) {
      return this.fighters.filter((o) => o.alive && o.team !== f.team);
    }
    alliesOf(f) {
      return this.fighters.filter((o) => o.alive && o.team === f.team && o !== f);
    }

    pickTarget(f) {
      // offstage story characters (e.g. Piccolo watching from afar) are never auto-targeted
      const enemies = this.enemiesOf(f).filter((e) => !e.untargetable);
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

    /** Damage this attacker dealt the boss lately; halves every 3 seconds. */
    aggroOf(boss, attacker) {
      const v = boss._aggro && boss._aggro.get(attacker);
      if (!v) return 0;
      return v * Math.pow(0.5, (this.frame - boss._aggroFrame.get(attacker)) / 180);
    }

    /**
     * A boss fighting a party spreads its attention instead of hunting only the
     * hero the player controls. It turns to another hero after staying on one for
     * a while (pressure rule `focus`; shorter on a CPU ally), or at once when
     * another hero has hurt it much more than its current target lately. It only
     * turns between attacks, never in the middle of a move or pattern, and prefers
     * the player's hero when choosing, so the pressure comes back.
     */
    bossAttention(f) {
      if (f.isPlayer || !this.party || this.party.length < 2 || !(f.def.boss || (f.tags && f.tags.boss))) return;
      const ai = f.controller;
      if (!(ai instanceof SL.AIController)) return;
      const t = f.target;
      const heroes = this.enemiesOf(f).filter((e) => !e.untargetable && !e.benched);
      if (heroes.length < 2 || !t || !heroes.includes(t)) {
        f._focus = null;
        return;
      }
      const fo = f._focus && f._focus.on === t ? f._focus : (f._focus = { on: t, frames: 0 });
      fo.frames++;
      // only between attacks: moving, circling or walking in before the first swing is fine; a pattern, special or swing is not
      const pl = ai.plan;
      const committed = pl && !pl.done && !(['strafe', 'wait', 'retreat'].includes(pl.type) || (pl.type === 'melee' && !pl.presses));
      // checked every tick: the moment between two attacks is often a single tick
      if (f.state !== 'free' || committed) return;
      const limit = this.pressureRules().focus * (t.isPlayer ? 1 : 0.5);
      // a CPU ally who is badly hurt is left alone: the pressure goes back to the hero the player controls
      const spent = (h) => !h.isPlayer && h.hpFrac < 0.35;
      let best = null, bestScore = -1e9;
      for (const h of heroes) {
        // a hero in the middle of a vanish or teleport cannot be picked this instant
        if (h === t || h.hidden || spent(h)) continue;
        const recent = f._lastFocus === h && this.frame - f._lastFocusEnd < 240;
        const score = this.aggroOf(f, h) / 400 - f.pos.distanceTo(h.pos) * 0.12 + (h.isPlayer ? 2 : 0) - (recent ? 4 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = h;
        }
      }
      if (!best) return;
      // provoked: only once it has spent a little time on its current target, so allies cannot yank it around
      const provoked = fo.frames >= limit * 0.35 && this.aggroOf(f, best) > Math.max(2500, this.aggroOf(f, t) * 2);
      const release = spent(t) && best.isPlayer;
      if (fo.frames < limit && !provoked && !release) return;
      f._lastFocus = t;
      f._lastFocusEnd = this.frame;
      if (pl && !pl.done) pl.done = true;
      this.releaseMeleeToken(f);
      f.target = best;
      f._focus = { on: best, frames: 0 };
      this.emit('bossAttention', { fighter: f, from: t, to: best, provoked });
    }

    assignTargets() {
      for (const f of this.fighters) {
        if (!f.alive) continue;
        this.bossAttention(f);
        // a player in free aim (or locked onto an object) keeps that choice
        if (f.isPlayer && (f.lockMode === 'free' || (f.lockProp && f.lockProp.alive))) {
          if (f.target && (!f.target.alive || f.target.untargetable)) f.target = null;
          continue;
        }
        if (f.target && f.target.alive && f.target.team !== f.team && !f.target.untargetable) continue;
        // Auto Switch Target off: when the locked enemy falls the aim goes free until the player locks on again
        if (f.isPlayer && f.target && !f.target.alive && !SL.Settings.data.gameplay.autoTargetSwitch) {
          SL.Targeting.unlock(this, f, true);
          continue;
        }
        if (f.isPlayer && !f.target && f._manualNoTarget) continue;
        f.target = this.pickTarget(f);
      }
    }

    cycleTarget(f) {
      const enemies = this.enemiesOf(f).filter((e) => !e.untargetable);
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

    /**
     * Group-fight pressure on the player (only when several enemies are after the
     * player): how many may be in melee at once, how many may be firing volleys,
     * the pause between volleys, and how long an enemy outside the camera view
     * must wait before it may strike anyway. `focus` is how long a boss fighting a
     * party stays on the hero the player controls before turning to another hero
     * (see bossAttention). Missions can override via rules.pressure.
     */
    pressureRules() {
      const diff = SL.Settings.data.gameplay.difficulty;
      const table = {
        easy: { melee: 1, ranged: 1, gap: 110, grace: 200, focus: 300 },
        normal: { melee: 2, ranged: 1, gap: 70, grace: 140, focus: 420 },
        hard: { melee: 2, ranged: 2, gap: 40, grace: 80, focus: 600 },
        veryhard: { melee: 3, ranged: 2, gap: 25, grace: 50, focus: 840 },
      };
      return Object.assign({}, table[diff] || table.normal, this.rules.pressure || {});
    }

    /** Is this fighter inside the player's camera view (about 55 degrees off centre)? */
    inPlayerView(f) {
      const cam = this.camera;
      const fwd = cam.look.clone().sub(cam.pos).normalize();
      const to = f.chest().sub(cam.pos).normalize();
      return fwd.dot(to) > 0.57;
    }

    /** May this enemy start pressuring the player now? Off-screen enemies hold back for a while. */
    pressureAllows(f, t) {
      if (!t || !t.isPlayer || this.enemiesOf(t).length <= 1) return true;
      if (t.target === f || this.inPlayerView(f)) {
        f._offscreenWait = 0;
        return true;
      }
      f._offscreenWait = (f._offscreenWait || 0) + 1;
      return f._offscreenWait > this.pressureRules().grace;
    }

    rangedTokenFree(f, t) {
      if (!t || !t.isPlayer || this.enemiesOf(t).length <= 1) return true;
      const st = this._ranged;
      if (!st) return true;
      if (st.holders.has(f)) return true;
      return this.frame >= st.freeAt && st.holders.size < this.pressureRules().ranged;
    }

    /** A volley slot against the player; returns false while others are firing or the pause runs. */
    requestRangedToken(f, t) {
      if (!t || !t.isPlayer || this.enemiesOf(t).length <= 1) return true;
      const st = (this._ranged = this._ranged || { holders: new Set(), freeAt: 0 });
      for (const h of st.holders) if (!h.alive || !(h.controller && h.controller.plan && h.controller.plan.type === 'blast' && !h.controller.plan.done)) st.holders.delete(h);
      if (st.holders.has(f)) return true;
      if (this.frame < st.freeAt || st.holders.size >= this.pressureRules().ranged) return false;
      st.holders.add(f);
      return true;
    }

    releaseRangedToken(f) {
      const st = this._ranged;
      if (st && st.holders.delete(f)) st.freeAt = this.frame + this.pressureRules().gap;
    }

    requestMeleeToken(f, t) {
      if (!t) return false;
      let set = this.tokens.get(t);
      if (!set) this.tokens.set(t, (set = new Set()));
      for (const m of set) if (!m.alive) set.delete(m);
      if (set.has(f)) return true;
      const max = this.enemiesOf(t).length <= 1 ? 9 : t.isPlayer ? this.pressureRules().melee : { easy: 1, normal: 2, hard: 2, veryhard: 3 }[SL.Settings.data.gameplay.difficulty] || 2;
      if (set.size < max) {
        set.add(f);
        return true;
      }
      return false;
    }
    releaseMeleeToken(f) {
      for (const set of this.tokens.values()) set.delete(f);
    }

    /**
     * SQUAD MELEE CAP (Known Bugs #36). A squad member (a fighter SL.JuniorSquad has given a role)
     * may be swinging at the player only while fewer than pressureRules().melee of the others are.
     * Counted from what is actually happening (state 'attack' aimed at him), not from tokens, and
     * enforced where a swing begins (Fighter._startAttack, Fighter._tryChase) and where a swing is
     * turned onto him (AIHooks.cell_junior.pre). Fighters without a squad role are never limited.
     */
    squadMeleeFull(f, t) {
      if (!f.squadRole || !t || !t.isPlayer) return false;
      let n = 0;
      for (const o of this.fighters) if (o !== f && o.squadRole && o.alive && o.state === 'attack' && o.target === t) n++;
      return n >= this.pressureRules().melee;
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
    /**
     * CHARGE MIXING. Ki charges, aura roars, beam charges and transformation surges are
     * charge-class loops, created through here instead of straight from SL.Audio. The
     * player, an actor a cinematic is about, and anybody transforming or charging an
     * ultimate are PRIMARY and keep their full voice; everybody else is SECONDARY —
     * audible, fading with distance, ducked further under a primary or in a cinematic —
     * and when several identical secondary loops play at once only the two loudest keep
     * theirs. The same weights thin the particles of secondary auras (the glow stays).
     */
    chargeLoop(kind, f, opts, tag) {
      // a battle that has fallen silent (mission complete, victory, teardown) starts nothing new
      if (this.silenced) return { set() {}, stop() {}, stopped: true };
      const h = SL.Audio.loop(kind, Object.assign({}, opts || {}, { vol: 1, tag: tag || 'charge' }));
      const e = { kind, f, h, tag: tag || 'charge', want: 0, weight: f === this.player ? 1 : 0.4, primary: false, stopped: false };
      this.chargeLoops.push(e);
      return {
        set: (v) => {
          e.want = v;
          h.set(v * e.weight);
        },
        stop: (fade) => {
          e.stopped = true;
          h.stop(fade);
        },
      };
    }

    _mixCharges() {
      // an owner that is gone (dead, disposed, removed from the fight) takes its loop with it
      for (const e of this.chargeLoops) {
        if (!e.stopped && (e.f.alive === false || !this.fighters.includes(e.f))) {
          e.stopped = true;
          e.h.stop(0.3);
        }
      }
      const L = (this.chargeLoops = this.chargeLoops.filter((e) => !e.stopped && !e.h.stopped));
      const p = this.player, cine = this.cinematicOwners;
      const cam = this.camera.pos;
      const near = (f) => U.clamp(1.2 - cam.distanceTo(f.pos) / 80, 0.2, 1);
      const focus = (f) => f === p || !!(cine && cine.includes(f));
      let anyPrimary = false;
      for (const e of L) {
        e.primary = e.want > 0.01 && (focus(e.f) || e.tag === 'transform' || e.tag === 'ultimate');
        if (e.primary) anyPrimary = true;
      }
      const inCine = !!cine || this.camera.inShot;
      const byKind = {};
      for (const e of L) {
        if (e.primary) e.weight = focus(e.f) ? 1 : 0.15 + 0.85 * near(e.f);
        else {
          e.weight = 0.55 * near(e.f) * (anyPrimary ? 0.6 : 1) * (inCine ? 0.4 : 1);
          if (e.want > 0.01) (byKind[e.kind] = byKind[e.kind] || []).push(e);
        }
      }
      let ducked = 0;
      for (const k in byKind) {
        const list = byKind[k].sort((a, c) => c.weight - a.weight);
        for (let i = 2; i < list.length; i++) {
          list[i].weight *= 0.2;
          ducked++;
        }
      }
      for (const e of L) e.h.set(e.want * e.weight);
      // auras: the same priority for the particles
      let chargers = 0;
      for (const f of this.fighters) if (f.aura && f.aura.target > 0.5) chargers++;
      for (const f of this.fighters) {
        if (!f.aura) continue;
        const primary = focus(f) || f.state === 'transform' || f.state === 'transformSequence' || (f.sd && f.sd.spec && f.sd.spec.ultimate && f.state === 'beamCharge');
        f.aura.emitMul = primary ? 1 : U.clamp(near(f) * (chargers > 3 ? 0.45 : 0.8), 0.15, 1);
      }
      this.chargeMix = { loops: L.length, primary: L.filter((e) => e.primary).length, secondary: L.filter((e) => !e.primary && e.want > 0.01).length, ducked };
    }

    /**
     * The battle falls silent: every game loop (ki and beam charges, auras, beam roars, the
     * Spirit Bomb hum, a scene's own loop) fades out and nothing new starts, and with
     * opts.sfx new one-shots from the battle stop too. Pulled when a mission ends (so the
     * Mission Complete music plays alone), at a knockout, and on teardown. One-shots that are
     * already sounding are left to ring out — a final impact is allowed to land.
     */
    silence(fade = 0.5, opts = {}) {
      if (opts.sfx) this.sfxSilenced = true;
      if (this.silenced) return 0;
      this.silenced = true;
      for (const f of this.fighters) f.loops = {};
      for (const e of this.chargeLoops) e.stopped = true;
      this.chargeLoops = [];
      const n = SL.Audio.stopLoops(fade, (h) => !h.ui);
      this.emit('silenced', { loops: n });
      return n;
    }

    volFor(f) {
      if (!f || f === this.player) return 1;
      const d = this.camera.pos.distanceTo(f.pos);
      return U.clamp(1.2 - d / 80, 0.25, 0.9);
    }

    sfx(name, fighter, opts = {}) {
      if (this.sfxSilenced) return;
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
      // a heavy blow whitens the screen a little, and only when the player is in it (2026-10-17, the shared bright-flash
      // task: 0.12 × impact for every heavy hit anywhere turned the frame white on every finisher and hid the blow)
      if (impact >= 4 && (this.involvesPlayer(att) || this.involvesPlayer(target))) SL.ScreenFX.flash(0.05 * impact);
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

    /** quiet: a guard the story makes for him (a sensed blow) — the same beat, a smaller burst, no screen flash. */
    perfectEffects(att, target, point, quiet) {
      this.vfx.flash(point, quiet ? 1.4 : 4, 0xb0f4ff, quiet ? 0.18 : 0.3);
      this.vfx.ring(point, quiet ? 1.2 : 3.2, 0xb0f4ff, quiet ? 0.25 : 0.35);
      this.sfx('perfectGuard', target);
      if (!quiet) SL.ScreenFX.flash(0.15, '#c8f4ff');
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

    /** kind 'bark': combat chatter (Settings: Subtitles → Dialogue Only leaves it out). */
    say(fighter, key, duration = 2.8, kind) {
      const D = SL.data.dialogue;
      const id = fighter ? fighter.def.id : '';
      // battle.lineOverride { key: other key or a line, or null for silence }: a story era's own voice
      // (Battle of Gods' Goku does not shout Namek's "I won't let you hurt anyone else!")
      const ov = this.lineOverride && Object.prototype.hasOwnProperty.call(this.lineOverride, key) ? this.lineOverride[key] : undefined;
      if (ov === null) return;
      const line = ov !== undefined ? D.get(ov) || ov : D.get(key) || D.get(id + '_' + key);
      if (!line) return;
      this.emit('say', { speaker: fighter ? fighter.name : '', line, duration, fighter, kind });
    }

    /**
     * Short in-combat voice line from the fighter's def.barks table.
     * Rate limited per fighter so lines stay special.
     */
    bark(fighter, kind, force) {
      if (!fighter || !fighter.alive || !fighter.def.barks) return false;
      // a story phase can change how somebody talks (Frieza stops taunting once he is losing)
      // ...and so can a state: Majin Vegeta does not talk like the prince (form.barks)
      const key = (fighter.barkOverrides && fighter.barkOverrides[kind]) || (fighter.form && fighter.form.barks && fighter.form.barks[kind]) || fighter.def.barks[kind];
      if (!key) return false;
      if (this.phase !== 'fight' || this.cinematicOwners) {
        if (!force) return false;
      }
      const now = this.frame;
      if (!force && fighter._barkAt !== undefined && now - fighter._barkAt < 60 * 7) return false;
      if (!force && Math.random() > 0.65) return false;
      if (!(fighter === this.player || fighter.target === this.player || force)) return false;
      fighter._barkAt = now;
      this.say(fighter, key, 1.8, 'bark');
      return true;
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
    /**
     * A gameplay shot's lens must not sit behind a rock spire or inside a hill (a transformation's
     * orbit swung straight through a mesa on the wasteland): walk it in toward what it looks at
     * until the line is clear, rising a little each step. Presentation only.
     */
    _clearLens(out) {
      if (!SL.Cinema || !SL.Cinema.blocked) return;
      for (let i = 0; i < 6 && SL.Cinema.blocked(this, out.pos, out.look, 0.8); i++) {
        out.pos.lerp(out.look, 0.2);
        out.pos.y += 0.25;
      }
    }

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
        this._clearLens(out);
      }, seconds, { blendIn: 0.3 });
      return startYaw;
    }

    /** Tight face close-up used for transformation reveals. */
    faceShot(f, seconds) {
      this.camera.playShot((t, out) => {
        f.model.joints.head.updateMatrixWorld(true);
        const hp = f.model.joints.head.getWorldPosition(new V3());
        hp.sub(f.object.position).add(f.pos);
        const fw = f.forward;
        const side = new V3(-fw.z, 0, fw.x);
        const r = U.lerp(1.25, 1.6, U.easeOutCubic(t)) * f.scale;
        out.pos.copy(hp).addScaledVector(fw, r).addScaledVector(side, U.lerp(0.35, 0.2, t)).add(new V3(0, U.lerp(-0.15, 0.05, t), 0));
        out.look.copy(hp).add(new V3(0, 0.02, 0));
        out.fov = U.lerp(40, 46, t);
      }, seconds, { blendIn: 0.12 });
    }

    /**
     * The reveal after a burst (transformation step shot: 'pull'): low in front of him, up at the
     * face — a scream thrown back at the sky still reads from down there — then the lens pulls
     * back and rises until the whole body and the aura are in the frame.
     */
    pullShot(f, seconds) {
      this.camera.playShot((t, out) => {
        f.model.joints.head.updateMatrixWorld(true);
        const hp = f.model.joints.head.getWorldPosition(new V3());
        hp.sub(f.object.position).add(f.pos);
        const c = f.chest();
        const fw = f.forward;
        const side = new V3(-fw.z, 0, fw.x);
        const k = U.easeInOutCubic(t);
        const look = hp.clone().add(new V3(0, 0.15 * f.scale, 0)).lerp(c, k);
        const r = U.lerp(1.9, 6.2, k) * f.scale;
        out.pos.copy(look).addScaledVector(fw, r).addScaledVector(side, U.lerp(0.35, 1.2, k)).add(new V3(0, U.lerp(-0.75, 0.9, k) * f.scale, 0));
        out.look.copy(look);
        out.fov = U.lerp(40, 48, k);
        this._clearLens(out);
      }, seconds, { blendIn: 0.08 });
    }

    /** Follows a launched Spirit Bomb from behind its owner toward the target. */
    bombFollowShot(bomb, f) {
      if (!(f === this.player || f.target === this.player)) return;
      this.camera.playShot((t, out) => {
        const bp = bomb.pos;
        const back = bomb.dir.clone().negate();
        back.y = Math.max(back.y, 0.25);
        back.normalize();
        const r = bomb.radius * 2.6 + 6;
        out.pos.copy(bp).addScaledVector(back, r).add(new V3(0, bomb.radius * 0.6, 0));
        out.look.copy(bp).addScaledVector(bomb.dir, 8);
        out.fov = U.lerp(58, 66, t);
        if (bomb.done) out.look.copy(bp);
      }, 1.4, { blendIn: 0.35 });
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

    /** Low behind his shoulder, tilting up to what he raises overhead as it grows (the Spirit Bomb). */
    riseShot(f, bomb, seconds) {
      this.camera.playShot((t, out) => {
        const c = f.chest();
        const fw = f.forward;
        const top = bomb ? bomb.pos : c.clone().add(new V3(0, 3 * f.scale, 0));
        out.pos.copy(c).addScaledVector(fw, -3.4 * f.scale).add(new V3(-fw.z * 1.6 * f.scale, -0.8 * f.scale, fw.x * 1.6 * f.scale));
        out.look.copy(c).lerp(top, U.easeInOutCubic(t));
        out.fov = U.lerp(52, 64, t);
        this._clearLens(out);
      }, seconds, { blendIn: 0.3 });
    }

    /** Low and in front, up at a one-handed pose, moving in tight on what is in the hand (the Big Bang Attack's sphere). */
    handShot(f, seconds) {
      this.camera.playShot((t, out) => {
        const c = f.chest(), fw = f.forward;
        const k = U.easeInOutCubic(t);
        const look = c.clone().lerp(f.handPos('R'), k);
        const r = U.lerp(3.6, 1.7, k) * f.scale;
        out.pos.copy(look).addScaledVector(fw, r).add(new V3(-fw.z * 1.1 * f.scale, U.lerp(-1.1, -0.3, k) * f.scale, fw.x * 1.1 * f.scale));
        out.look.copy(look);
        out.fov = U.lerp(50, 42, k);
        this._clearLens(out);
      }, seconds, { blendIn: 0.08 });
    }

    /** Square in front of him, centred and closing in (the Final Flash as his hands come together). */
    frontShot(f, seconds) {
      this.camera.playShot((t, out) => {
        const c = f.chest();
        out.pos.copy(c).addScaledVector(f.forward, U.lerp(4.4, 3.2, U.easeOutCubic(t)) * f.scale).add(new V3(0, -0.25 * f.scale, 0));
        out.look.copy(c);
        out.fov = U.lerp(48, 44, t);
        this._clearLens(out);
      }, seconds, { blendIn: 0.15 });
    }

    /** Cut in behind his shoulder along the path of what he threw, the lens following it out to where it bursts. */
    pathShot(f, p, seconds) {
      const dir = p.vel.clone().normalize();
      const last = p.pos.clone();
      this.camera.playShot((t, out) => {
        const c = f.chest();
        if (p.alive) last.copy(p.pos);
        out.pos.copy(c).addScaledVector(dir, -3 * f.scale).add(new V3(-dir.z * 0.9 * f.scale, 0.7 * f.scale, dir.x * 0.9 * f.scale));
        out.look.copy(last);
        out.fov = 54;
        this._clearLens(out);
      }, seconds, { blendIn: 0, cut: true });
    }

    /** Alongside a fighter rushing in, low and a little behind him: his trail behind, where he is going ahead (Dragon Fist). */
    rushTrackShot(f, seconds) {
      this.camera.playShot((t, out) => {
        const c = f.chest();
        const fw = f.forward;
        const side = new V3(-fw.z, 0, fw.x);
        out.pos.copy(c).addScaledVector(side, 4.6 * f.scale).addScaledVector(fw, U.lerp(-0.4, -1, t) * f.scale).add(new V3(0, -0.5 * f.scale, 0));
        out.look.copy(c).addScaledVector(fw, 1.2 * f.scale);
        out.fov = U.lerp(58, 50, t);
        this._clearLens(out);
      }, seconds, { blendIn: 0.12 });
    }

    /** Low beside the two of them, a little ahead of him, looking up at one standing on the other's head (Nappa Rush). */
    perchShot(f, tg, seconds) {
      this.camera.playShot((t, out) => {
        const low = tg.chest(), c = low.clone().lerp(f.chest(), 0.5);
        const fw = f.forward, s = Math.max(f.scale, tg.scale);
        out.pos.copy(c).addScaledVector(new V3(-fw.z, 0, fw.x), U.lerp(5.6, 5, t) * s).addScaledVector(fw, 1.2 * s).setY(low.y - 0.5 * s);
        out.look.copy(c);
        out.fov = 50;
        this._clearLens(out);
      }, seconds, { blendIn: 0.15 });
    }

    /**
     * On the side of the raised hand, a little ahead of him, closing in on the hand he holds at the other's chest — his
     * face and the hand in frame, the one in front of it beyond (Final Impact).
     */
    aimShot(f, tg, seconds) {
      this.camera.playShot((t, out) => {
        const hand = f.handPos('R'), c = hand.clone().lerp(tg.chest(), 0.3);
        const fw = f.forward, s = Math.max(f.scale, tg.scale), k = U.easeOutCubic(t);
        out.pos.copy(c).addScaledVector(new V3(fw.z, 0, -fw.x), U.lerp(5, 4.1, k) * s).addScaledVector(fw, 0.9 * s).add(new V3(0, 0.1 * s, 0));
        out.look.copy(c).add(new V3(0, 0.2 * s, 0));
        out.fov = U.lerp(46, 42, k);
        this._clearLens(out);
      }, seconds, { blendIn: 0.1 });
    }

    /**
     * Far off to one side and above, outside a blast of the given reach that bursts out of him, drawing further back
     * as it swells (Final Explosion) — the sphere, the ground and whoever it catches in frame, never the inside of it.
     */
    novaShot(f, reach, seconds) {
      const c = f.chest(), fw = f.forward, side = new V3(-fw.z, 0, fw.x);
      this.camera.playShot((t, out) => {
        const k = U.easeOutCubic(t);
        out.pos.copy(c).addScaledVector(side, reach * U.lerp(1.25, 1.7, k)).addScaledVector(fw, reach * 0.35).add(new V3(0, reach * U.lerp(0.25, 0.4, k), 0));
        out.look.copy(c).add(new V3(0, reach * 0.12, 0));
        out.fov = 60;
        this._clearLens(out);
      }, seconds, { blendIn: 0, cut: true });
    }

    /**
     * Both of them from one side of the line between them, drifting a little (the phases of a long rush): view 'low' —
     * from under them looking up (a launch, blows from below), 'high' — over them looking down (a blow driving him down).
     */
    pairShot(f, tg, seconds, view) {
      this.camera.playShot((t, out) => {
        const a = f.chest(), b = tg.chest(), c = a.clone().lerp(b, 0.5);
        const axis = b.clone().sub(a).setY(0);
        if (axis.lengthSq() < 0.04) axis.copy(f.forward);
        axis.normalize();
        const side = new V3(-axis.z, 0, axis.x), s = Math.max(f.scale, tg.scale);
        const r = (4.4 + Math.abs(a.y - b.y) * 0.6) * s, swing = U.lerp(-0.18, 0.18, t);
        out.pos.copy(c).addScaledVector(side, r * Math.cos(swing)).addScaledVector(axis, r * Math.sin(swing)).add(new V3(0, view === 'high' ? 3.4 * s : -1.6 * s, 0));
        if (this.stage.hasGround) out.pos.y = Math.max(out.pos.y, this.stage.heightAt(out.pos.x, out.pos.z) + 0.4);
        out.look.copy(c);
        out.fov = 52;
        this._clearLens(out);
      }, seconds, { blendIn: 0.08 });
    }

    /**
     * Wide and high outside the circle a swung opponent is dragged round (the Spirit Sword hook and drag): the lens trails
     * the swing round, the attacker at the centre and the one on the blade both in frame.
     */
    swingShot(f, seconds) {
      const r0 = (f.sd.swing && f.sd.swing.radius) || 4.5;
      this.camera.playShot((t, out) => {
        const tg = f.sd.victim || f.target;
        const c = f.chest(), d = tg ? tg.chest().sub(c).setY(0) : f.forward.clone();
        if (d.lengthSq() < 1e-4) d.copy(f.forward);
        const a = Math.atan2(d.x, d.z) - 0.9;
        out.pos.copy(c).add(new V3(Math.sin(a) * r0 * 1.9, r0 * 0.8, Math.cos(a) * r0 * 1.9));
        out.look.copy(c).addScaledVector(d.normalize(), r0 * 0.4);
        out.fov = 56;
        this._clearLens(out);
      }, seconds, { blendIn: 0.1 });
    }

    /** Over the target's shoulder at the attacker, cut in (Goku reappearing behind him to fire). */
    reverseShot(f, tg, seconds) {
      this.camera.playShot((t, out) => {
        const a = f.chest(), b = tg.chest();
        const dir = a.clone().sub(b).setY(0);
        if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
        dir.normalize();
        out.pos.copy(b).addScaledVector(dir, -2.4 * tg.scale).add(new V3(-dir.z * 1.1 * tg.scale, 0.5 * tg.scale, dir.x * 1.1 * tg.scale));
        out.look.copy(a).lerp(b, 0.15);
        out.fov = U.lerp(50, 56, t);
        this._clearLens(out);
      }, seconds, { blendIn: 0, cut: true });
    }

    /**
     * Wide, from the side of the line between them with both in frame, drifting slowly (the arena a finisher is
     * thrown across); onTarget: held on the point where it hit, closer, cut in — what rises out of the impact stays
     * in frame while he is thrown through it.
     */
    wideShot(f, tg, seconds, onTarget, cut) {
      const hit = onTarget ? tg.chest() : null;
      const from = onTarget ? f.chest() : null;
      this.camera.playShot((t, out) => {
        const a = from || f.chest(), b = hit || tg.chest();
        const axis = b.clone().sub(a);
        // one straight above the other (struck from on top of his head): the line is the way the attacker faces
        if (axis.x * axis.x + axis.z * axis.z < 0.04) axis.copy(f.forward);
        const sep = Math.max(1, axis.length());
        axis.normalize();
        const side = new V3().crossVectors(axis, UP);
        if (side.lengthSq() < 0.01) side.set(1, 0, 0);
        side.normalize();
        const center = onTarget ? b : a.clone().lerp(b, 0.5);
        // one launched high over the other (a finisher kicked up into the sky): far enough back for the height between them
        const r = onTarget ? 8 : U.clamp(Math.max(sep * 0.9, Math.abs(b.y - a.y) * 1.25), 9, 40);
        const swing = U.lerp(-0.25, 0.25, t);
        out.pos.copy(center).addScaledVector(side, r * Math.cos(swing)).addScaledVector(axis, r * Math.sin(swing)).add(new V3(0, r * 0.3, 0));
        // the impact: the lens tips up after what climbs out of it
        out.look.copy(center).add(new V3(0, onTarget ? U.lerp(0, 2.5, U.easeOutCubic(t)) : 0, 0));
        out.fov = onTarget ? 56 : 52;
        this._clearLens(out);
      }, seconds, { blendIn: onTarget || cut ? 0 : 0.3, cut: !!(onTarget || cut) }); // cut: no blend (a beat shorter than the 0.3 s)
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
        this._clearLens(out);
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
      this.on('transformBurst', (e) => this._formTheme(e));
      this.on('special', (e) => this._ultimateMusic(e));
      this.on('storyEvade', (e) => this._uiDrop(e));
      this.phase = 'intro';
      if (this.config.onStart) this.config.onStart(this);
      if (this.mission) {
        this.mission.start();
        return;
      }
      // a character with a theme of his own (Frieza, Cell, Kid Buu, Vegito...) brings it to a Free Battle
      // (and when the opponent has none, the player's own fighter brings his: picking Gogeta plays Gogeta's)
      const T = SL.Music.THEMES || {};
      const themed = this.mode !== 'training' && (this.fighters.find((f) => !f.isPlayer && T[f.def.id]) || this.fighters.find((f) => f.isPlayer && T[f.def.id]));
      SL.Music.play((themed && SL.Music.THEMES[themed.def.id]) || this.stage.def.music || 'battle', { intensity: 1 });
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
      // a matchup with an exchange of its own (Gogeta and Vegito): the two of them, line by line,
      // each speaker in his own shot — instead of one line each
      const ex = !this.config.skipIntro && p && e && SL.data.dialogue.exchangeFor ? SL.data.dialogue.exchangeFor(p.def.id, e.def.id) : null;
      if (ex) {
        for (const [f, other] of [[p, e], [e, p]]) {
          const introSeq = f.def.sequences && f.def.sequences.intro;
          if (introSeq) f.setState('scripted', { sequence: introSeq });
          else {
            const intro = (f.form && f.form.intro) || f.def.intro;
            f.setState('scripted', { pose: intro ? intro.pose : 'idle', speed: 6 });
            f.model.setExpression(intro ? intro.expression : 'neutral');
          }
          f.target = other;
          f.faceTarget(100);
        }
        for (const [who, line, secs] of ex) {
          if (skipped()) break;
          const f = who === p.def.id ? p : who === e.def.id ? e : null;
          if (!f) continue;
          const dur = secs || 1.9;
          this.introShot(f, dur);
          this.emit('say', { speaker: f.name, line, duration: dur, fighter: f });
          const end = performance.now() + dur * 1000;
          yield () => skipped() || performance.now() >= end;
        }
      }
      if (!ex && !this.config.skipIntro && p && e) {
        for (const [f, other] of [[p, e], [e, p]]) {
          if (skipped()) break;
          const introSeq = f.def.sequences && f.def.sequences.intro;
          if (introSeq) f.setState('scripted', { sequence: introSeq });
          else f.setState('scripted', { pose: (f.form && f.form.intro ? f.form.intro : f.def.intro) ? (f.form && f.form.intro ? f.form.intro : f.def.intro).pose : 'idle', speed: 6 });
          f.target = other;
          f.faceTarget(100);
          const intro = (f.form && f.form.intro) || f.def.intro;
          if (!introSeq) f.model.setExpression(intro ? intro.expression : 'neutral');
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
      this.emit('ko', { fighter: f, attacker: att, hit });
      this.releaseMeleeToken(f);
      f.koFrame = this.frame;
      for (const ally of this.alliesOf(f)) SL.mech(ally, 'on', 'allyDefeated');
      // in a party battle the fight goes on with the next hero
      if (f === this.player && this.party && this.party.includes(f)) {
        const next = this.nextPartyMember(1);
        if (next) {
          this.emit('heroDown', { fighter: f, next });
          this.switchPlayer(next, { force: true });
        }
      }
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
      this.silence(0.6);
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
      const p = this.player;
      const loserP = p && !result.won && p.def.sequences && p.def.sequences.defeat ? p : null;
      if (loserP && !this.mission) {
        // the player's fighter struggles back to one knee
        loserP.pos.y = this.stage.hasGround ? this.stage.heightAt(loserP.pos.x, loserP.pos.z) : loserP.pos.y;
        loserP.prevPos.copy(loserP.pos);
        loserP.vel.set(0, 0, 0);
        loserP.grounded = true;
        loserP.defeatPose = true;
        loserP.setState('scripted', { sequence: loserP.def.sequences.defeat, expression: 'hurt' });
        this.victoryShot(loserP, 4);
        this.say(loserP, loserP.def.id + '_defeat');
      } else if (w) {
        w.vel.set(0, 0, 0);
        const vs = w.def.sequences && w.def.sequences.victory;
        if (vs && vs.length) w.setState('scripted', { sequence: Array.isArray(vs[0]) ? U.pick(vs) : vs, expression: 'grin' });
        else {
          const vic = (w.form && w.form.victory) || w.def.victory;
          const vp = vic && vic.poses ? U.pick(vic.poses) : 'victory';
          w.setState('scripted', { pose: vp, speed: 5, expression: vic ? vic.expression : 'smirk' });
        }
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
      this.silence(0.3, { sfx: true });
      this.emit('end', result);
      if (this.config.onEnd) this.config.onEnd(this, result);
    }

    pause() {
      if (this.paused || this.phase === 'end') return;
      this.paused = true;
      SL.Audio.duckMusic(true);
      SL.Audio.muteLoops(true); // a charge held when the menu opened must not hum under it
      SL.Input.exitPointerLock();
      this.emit('paused', {});
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;
      SL.Audio.duckMusic(false);
      SL.Audio.muteLoops(false);
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
      for (const c of this.creatures) c.render(frameDt, alpha);

      const p = this.player;
      const lookInput = this.phase === 'fight' && !this.camera.inShot ? this.lookAcc : { x: 0, y: 0 };
      const camTarget = p ? (p.aimTarget ? p.aimTarget() : p.target) : null;
      this.camMode = p ? this.cameraMode(camTarget) : 'adventure';
      this.camera.update(frameDt, p ? { player: p, target: camTarget, mode: this.camMode, stage: this.stage, look: lookInput, fastFollow: p.state === 'dash' || p.speed > 26, charge: this.chargeFocus } : { focus: new V3(), distance: 12 });
      this.lookAcc.x = this.lookAcc.y = 0;
      // the player's own aura under the gameplay camera is see-through enough that whatever it is
      // fighting stays readable behind it (owner's Frieza fairness pass: at close range a Kaioken's
      // flames hid every wind-up); a cinematic shot shows it at full strength
      // f.auraViewCap: a film's close shots keep a fighter's aura thin so the body inside it reads (a transformation)
      for (const f of this.fighters) if (f.aura) f.aura.view = Math.min(f === p && camTarget && !this.camera.inShot ? 0.45 : 1, f.auraViewCap === undefined || f.auraViewCap === null ? 1 : f.auraViewCap);
      const focus = p ? p.pos : new V3();
      this.stage.update(frameDt, focus);
      this.vfx.update(frameDt * Math.max(scale, 0.35), this.camera.camera);
      SL.ScreenFX.update(frameDt);
      if (p && p.alive) SL.ScreenFX.vignette(p.hpFrac < 0.25 ? (0.25 - p.hpFrac) * 2.4 : 0);
      else SL.ScreenFX.vignette(0);
    }

    /**
     * Which camera behaviour follows the player (see src/render/camera.js): combat while
     * locked on; otherwise the Camera Style setting — Auto is adventure while nothing
     * hostile is near and free (stays where it is pointed) while a fight is on. A mission
     * can force one with `battle.cameraModeOverride` (a traversal stretch, for instance).
     */
    cameraMode(target) {
      if (target && target.alive !== false) return 'combat';
      if (this.cameraModeOverride) return this.cameraModeOverride;
      const style = SL.Settings.data.camera.style || 'auto';
      if (style !== 'auto') return style;
      const p = this.player;
      if (!p) return 'adventure';
      if ((this.frame % 15 === 0) || this._threatNear === undefined) {
        this._threatNear = this.enemiesOf(p).some((e) => e.alive && !e.hidden && !e.untargetable && e.pos.distanceTo(p.pos) < 45);
      }
      return this._threatNear ? 'free' : 'adventure';
    }

    tick() {
      this.frame++;
      if (this.player && !this.paused) {
        SL.Input.poll();
        // while the skill wheel is open the mouse and right stick point at it instead of turning the camera;
        // pointer motion is collected every tick because the controller runs less often in slow motion
        if (!(this.radial && this.radial.open)) {
          this.lookAcc.x += SL.Input.look.x;
          this.lookAcc.y += SL.Input.look.y;
        } else if (SL.Input.pointer) {
          this.radialPointer.x += SL.Input.pointer.x;
          this.radialPointer.y += SL.Input.pointer.y;
        }
        if (this.party && this.partyCooldown > 0) this.partyCooldown--;
        if (this.party && this.phase === 'fight' && SL.Input.pressed('partyNext')) this.switchPlayer(this.nextPartyMember(1));
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
      for (const c of this.creatures.slice()) c.update();
      if (this.tickHandlers.length) {
        // run this tick's handlers from their own list: one registered meanwhile (b.onTick / b.after inside a
        // handler) used to be lost when the list was rebuilt — now it is kept and first runs next tick, after these
        const run = this.tickHandlers, keep = [];
        this.tickHandlers = [];
        let i = 0;
        try {
          for (; i < run.length; i++) if (run[i]() !== false) keep.push(run[i]);
        } finally {
          // a handler that throws keeps its place (as before), with every one not yet run
          this.tickHandlers = keep.concat(run.slice(i), this.tickHandlers);
        }
      }
      this.projectiles.update();
      this.clash.update();
      this._mixCharges();

      if (this.rules.ringOut && this.stage.arena && this.phase === 'fight' && !this.cinematicOwners && !this.inputLocked) this._ringOutCheck();
      if (this.phase === 'fight' && !this.cinematicOwners) {
        this.fightTime += TICK;
        if (SL.Dev) SL.Dev.tick(this);
        if (this.rules.timeLimit > 0 && this.fightTime >= this.rules.timeLimit && !this.mission) this._timeUp();
      }
      this._dynamicMusic();

      if (this.mission) {
        for (const f of this.fighters.slice()) {
          // keepBody: a mission that wants the fallen seen (the destroyed Juniors) clears them itself
          if (!f.alive && !f.isPlayer && !f.keepBody && f.koFrame !== undefined && this.frame - f.koFrame > 300) this.remove(f);
        }
      }
    }

    /**
     * Tournament rules: a fighter who touches the ground outside the ring — or
     * drops below its top outside it — is out. Flying outside the ring is not a
     * ring-out by itself; coming down is. Only the fighters in the match count
     * (`rules.ringOut.fighters`, or every targetable fighter), and nothing is
     * checked while a scene holds the input or the camera.
     */
    _ringOutCheck() {
      const A = this.stage.arena, R0 = this.rules.ringOut;
      const list = R0.fighters || this.fighters;
      for (const f of list) {
        if (!f.alive || f.hidden || f.untargetable || f.ringedOut) continue;
        if (A.onRing(f.pos.x, f.pos.z)) continue;
        const floor = this.stage.heightAt(f.pos.x, f.pos.z);
        const touched = f.grounded || f.pos.y - floor < 0.25 || f.pos.y < A.y - (R0.drop || 0.6);
        if (!touched) continue;
        f.ringedOut = true;
        this.emit('ringOut', { fighter: f });
        if (!this.mission && this.phase === 'fight') {
          const other = this.fighters.find((o) => o.alive && o.team !== f.team);
          this.finish({ winnerTeam: other ? other.team : -1, reason: 'ringout', loser: f });
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

    /**
     * MUSIC THAT FOLLOWS THE FIGHT (owner: "music should react to gameplay — and breathe"). The layers:
     * 1 the opening (drums), 2 the fight (the melody), 3 only when it matters — the enemy clearly ahead,
     * somebody close to the end, a transformation's burst (musicBoost holds it ten seconds). Being
     * transformed is no longer a permanent maximum. Outside a story (the mission owns its score): when
     * the player is nearly beaten the track gives way to the desperate one, and it comes back if he
     * recovers; the victory and the defeat have their stingers (finish).
     */
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
      const pHp = p.hpFrac, tHp = t ? t.hpFrac : 1;
      if (this.fightTime > 8) lvl = 2;
      const behind = t && tHp - pHp > 0.3;
      if (pHp < 0.3 || tHp < 0.25 || behind) lvl = 3;
      if (this.mission && this.mission.musicLevel !== undefined) lvl = this.mission.musicLevel;
      else if (!this.mission && this.mode !== 'training' && SL.Music.SONG_IDS && SL.Music.SONG_IDS.includes('desperate')) {
        if (pHp < 0.2 && t && tHp > pHp + 0.15 && SL.Music.songId !== 'desperate') {
          this._calmSong = SL.Music.songId;
          SL.Music.play('desperate', { intensity: 3 });
        } else if (SL.Music.songId === 'desperate' && this._calmSong && (pHp > 0.4 || (t && tHp < pHp))) {
          SL.Music.play(this._calmSong, { intensity: 2 });
          this._calmSong = null;
        }
      }
      SL.Music.setIntensity(lvl);
    }

    /** Free Battle / Training: the player's first time in a form with music of its own (Music.FORM_THEMES). */
    /**
     * An ultimate is a peak: outside a story (a mission owns its score) the battle music jumps to its fullest and holds
     * there a few seconds, and an ultimate with its own `sting` (an original stinger — the three Gogetas' finishers)
     * lands it over the music.
     */
    _ultimateMusic(e) {
      if (this.mission || !e.spec || !(e.slot === 'ultimate' || e.spec.ultimate)) return;
      SL.Music.setIntensity(3);
      this.musicHold = Math.max(this.musicHold || 0, 5);
      if (e.spec.sting) SL.Music.stinger(e.spec.sting);
    }

    _formTheme(e) {
      if (this.mission || e.fighter !== this.player) return;
      // a character's own key first ('vegeta:ssj' — his awakening is not Goku's), then the form's
      const FT = SL.Music.FORM_THEMES || {};
      const song = FT[e.fighter.def.id + ':' + e.form.id] || FT[e.form.id];
      if (!song || SL.Music.songId === song) return;
      // an opponent's own theme, or a character song the transformation itself brought in, wins
      const T = SL.Music.THEMES || {};
      const opp = this.fighters.find((f) => f.team !== this.player.team && T[f.def.id]);
      if (opp && SL.Music.songId === T[opp.def.id]) return;
      const seq = e.form.sequence;
      if (seq && seq.steps && seq.steps.some((st) => st.song)) return;
      SL.Music.play(song, { intensity: 3 });
    }

    /**
     * The drop (the soundtrack PDF, p.90–91): when a body that evades by itself (Ultra Instinct's form.evade) makes a
     * full blow miss, the staccato brass lands over the music — the player's own fighter, outside the story (a mission
     * owns its score), at most once in fifteen seconds so it stays a moment.
     */
    _uiDrop(e) {
      const f = e.fighter;
      if (this.mission || f !== this.player || !f.form || !f.form.evade) return;
      if (this.frame - (this._uiDropAt === undefined ? -99999 : this._uiDropAt) < 900) return;
      this._uiDropAt = this.frame;
      SL.Music.stinger('ui_drop');
    }

    _separate() {
      const fs = this.fighters;
      for (let i = 0; i < fs.length; i++) {
        const a = fs[i];
        if (!a.alive || a.hidden || a.intangible) continue;
        for (let j = i + 1; j < fs.length; j++) {
          const b = fs[j];
          if (!b.alive || b.hidden || b.intangible || a.state === 'held' || b.state === 'held') continue;
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
      // this.split: two cameras for one frame, side by side (a mission's split shot sets it and clears it)
      if (this.split) SL.Render.renderSplit(this.scene, this.split);
      else SL.Render.render(this.scene, this.camera.camera);
    }

    dispose() {
      if (this.disposed) return;
      this.disposed = true;
      if (this.seq) this.seq.stop();
      if (this.mission && this.mission.dispose) this.mission.dispose();
      for (const f of this.fighters) f.dispose();
      // safety net: whatever a mission, scene or projectile started and never stopped ends here
      SL.Audio.stopLoops(0.15, (h) => !h.ui);
      this.fighters = [];
      for (const c of this.creatures.slice()) c.dispose();
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
