/*
 * Mission runner: story missions are data files with ordered phases.
 * Each phase is a generator script using the helpers below. Phases marked
 * `checkpoint` are restart points — retrying rebuilds the battle and resumes
 * from the last reached checkpoint, so players never replay long sections.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const STORY_DAMAGE = { frieza_soldier: 0.45, frieza_gunner: 0.4, frieza_elite: 0.5 };

  const DIFF_RULES = {
    easy: { damagePlayer: 1.3, damageEnemy: 0.6 },
    normal: { damagePlayer: 1, damageEnemy: 1 },
    hard: { damagePlayer: 0.95, damageEnemy: 1.2 },
    veryhard: { damagePlayer: 0.9, damageEnemy: 1.4 },
  };

  class Mission {
    constructor(battle, def, opts = {}) {
      this.battle = battle;
      this.def = def;
      this.opts = opts;
      this.phaseIndex = opts.startPhase || 0;
      this.objectives = [];
      this.kills = 0;
      this.killsByTag = {};
      this.time = 0;
      this.seq = null;
      this.state = 'running';
      this.flags = {};
      this.spawners = [];
      this.prompts = new Map();
      this.tickHooks = [];
      this.musicLevel = undefined;
      this.damageTaken = 0;
      this.optionalDone = 0;
      this.optionalTotal = 0;
      this.retries = opts.retries || 0;
      this.qteScore = 0;
      this.qteParts = [];
      battle.mission = this;
      battle.on('damage', (e) => {
        if (e.target === battle.player) this.damageTaken += e.amount;
      });
    }

    static rulesFor(difficulty) {
      return DIFF_RULES[difficulty] || DIFF_RULES.normal;
    }

    get player() {
      return this.battle.player;
    }

    start() {
      const b = this.battle;
      b.phase = 'fight';
      b.inputLocked = true;
      b.aiLocked = true;
      this._runPhase();
    }

    _runPhase() {
      const ph = this.def.phases[this.phaseIndex];
      if (!ph) {
        this.succeed();
        return;
      }
      if (ph.checkpoint) this.checkpoint = this.phaseIndex;
      this.battle.emit('missionPhase', { phase: ph, index: this.phaseIndex });
      const self = this;
      this.seq = new SL.Coroutine(
        (function* () {
          yield* ph.run(self);
          self.phaseIndex++;
          if (self.state === 'running') self._runPhase();
        })()
      );
    }

    update(dt) {
      if (this.state !== 'running') return;
      if (this.battle.phase === 'fight' && !this.battle.inputLocked) this.time += dt;
      if (this.seq) this.seq.update(dt);
      this._updatePrompts();
    }

    tick() {
      if (this.state !== 'running') return;
      for (const sp of this.spawners) sp.tick();
      for (const h of this.tickHooks) h();
    }

    /* ---------------- script helpers ---------------- */
    wait(seconds) {
      return seconds;
    }

    until(fn) {
      return fn;
    }

    /** Waits for seconds, ends early when the player skips. */
    *cine(seconds) {
      const b = this.battle;
      b.skipRequested = false;
      const end = performance.now() + seconds * 1000;
      yield () => b.skipRequested || performance.now() >= end;
    }

    lock(on) {
      this.battle.inputLocked = on;
      this.battle.aiLocked = on;
    }

    limits(obj) {
      this.battle.playerLimits = obj;
    }

    spawn(spec) {
      const s = Object.assign({ team: 1 }, spec);
      // story grunts exist to be plowed through; they chip rather than shred
      if (s.damageDealtMul === undefined && STORY_DAMAGE[s.charId] !== undefined) s.damageDealtMul = STORY_DAMAGE[s.charId];
      if (s.charId === 'frieza_soldier' || s.charId === 'frieza_gunner') {
        const def = SL.data.characters[s.charId];
        if (s.skin === undefined && def.appearance.skinVariants) s.skin = U.pick(def.appearance.skinVariants);
      }
      const f = this.battle.spawn(s);
      if (spec.warp !== false) {
        this.battle.vfx.flash(f.chest(), 4, 0xff6080, 0.3, SL.Toon.tex.glow);
        this.battle.vfx.ring(f.chest(), 3, 0xff6080, 0.3);
      }
      if (spec.tag) f.tags.mission = spec.tag;
      return f;
    }

    alive(tag) {
      return this.battle.fighters.filter((f) => f.alive && f.team !== this.player.team && (!tag || (f.tags && f.tags.mission === tag)));
    }

    objective(id, text, opts = {}) {
      let o = this.objectives.find((x) => x.id === id);
      if (!o) {
        o = { id, text, icon: opts.icon || 'target', count: 0, target: opts.target || 0, optional: !!opts.optional, done: false, failed: false };
        this.objectives.push(o);
        if (o.optional) this.optionalTotal++;
      } else {
        o.text = text;
        if (opts.target !== undefined) o.target = opts.target;
      }
      this.battle.emit('objectives', { list: this.objectives, changed: o });
      return o;
    }

    progress(id, count) {
      const o = this.objectives.find((x) => x.id === id);
      if (!o || o.done) return;
      o.count = Math.min(o.target || count, count);
      this.battle.emit('objectives', { list: this.objectives, changed: o });
      if (o.target && o.count >= o.target) this.complete(id);
    }

    complete(id) {
      const o = this.objectives.find((x) => x.id === id);
      if (!o || o.done || o.failed) return;
      o.done = true;
      if (o.optional) this.optionalDone++;
      SL.Audio.play('uiSelect');
      this.battle.emit('objectives', { list: this.objectives, changed: o, completed: true });
    }

    failObjective(id) {
      const o = this.objectives.find((x) => x.id === id);
      if (!o || o.done) return;
      o.failed = true;
      this.battle.emit('objectives', { list: this.objectives, changed: o });
    }

    clearObjectives() {
      this.objectives = [];
      this.battle.emit('objectives', { list: this.objectives });
    }

    say(speaker, line, duration = 3.2) {
      const name = SL.data.dialogue.speakers[speaker] || speaker;
      this.battle.emit('say', { speaker: name, line, duration });
    }

    title(chapter, title, subtitle, duration = 3.4) {
      this.battle.emit('titleCard', { chapter, title, subtitle, duration });
    }

    fade(to, seconds = 0.6) {
      this.battle.emit('fade', { to, seconds });
    }

    music(song, level) {
      if (song) SL.Music.play(song, { intensity: level === undefined ? 1 : level });
      if (level !== undefined) {
        SL.Music.setIntensity(level);
        this.musicLevel = level;
      }
    }

    /**
     * Contextual control hint. Shows only when tutorial prompts are enabled and
     * the prompt has not been learned before; hides when `until()` is true.
     */
    prompt(id, action, label, opts = {}) {
      if (!SL.Settings.data.gameplay.tutorialPrompts) return;
      if (SL.Save.data.seen.prompts[id] && !opts.always) return;
      if (this.prompts.has(id)) return;
      this.prompts.set(id, { id, action, label, until: opts.until || (() => SL.Input.pressed(action)), when: opts.when || (() => true), shown: false, min: opts.min || 1.2, t: 0 });
    }

    _updatePrompts() {
      const now = performance.now() / 1000;
      for (const p of this.prompts.values()) {
        const active = !this.battle.inputLocked && !this.battle.paused && p.when();
        if (active && !p.shown && now >= (p.cooldownUntil || 0)) {
          p.shown = true;
          p.t = 0;
          this.battle.emit('prompt', { id: p.id, action: p.action, label: p.label, show: true });
        }
        if (p.shown) {
          p.t += 1 / 60;
          // hysteresis: stay up at least 2s, then wait 4s before reappearing
          if (!active && p.t > 2) {
            p.shown = false;
            p.cooldownUntil = now + 4;
            this.battle.emit('prompt', { id: p.id, show: false });
          } else if (p.t > p.min && p.until()) {
            this.battle.emit('prompt', { id: p.id, show: false, learned: true });
            SL.Save.markSeen('prompts', p.id);
            this.prompts.delete(p.id);
          }
        }
      }
    }

    shot(fn, seconds, opts = {}) {
      this.battle.camera.playShot(fn, seconds, Object.assign({ kind: 'story', blendIn: 0.4 }, opts));
    }

    endShot() {
      this.battle.camera.endShot();
      this.battle.camera.cut();
    }

    /** Periodic enemy spawner (e.g. drop pods). Returns handle with stop(). */
    spawner(opts) {
      const m = this;
      const sp = {
        timer: opts.delay || 0,
        active: true,
        tick() {
          if (!this.active || m.battle.inputLocked) return;
          if (opts.while && !opts.while()) return;
          this.timer -= 1 / 60;
          if (this.timer > 0) return;
          this.timer = opts.every;
          if (m.alive().length >= (opts.maxAlive || 6)) return;
          opts.spawn();
        },
        stop() {
          this.active = false;
        },
      };
      this.spawners.push(sp);
      return sp;
    }

    onKO(f, att) {
      const b = this.battle;
      if (f === b.player) {
        this.fail('defeated');
        return;
      }
      this.kills++;
      const tag = f.tags && f.tags.mission;
      if (tag) this.killsByTag[tag] = (this.killsByTag[tag] || 0) + 1;
      b.emit('missionKill', { fighter: f, kills: this.kills });
    }

    fail(reason) {
      if (this.state !== 'running') return;
      this.state = 'failed';
      const b = this.battle;
      b.inputLocked = true;
      b.aiLocked = true;
      if (this.seq) this.seq.stop();
      b.slowmo(0.25, 1.2);
      SL.Audio.play('ko');
      SL.Music.stop(1);
      if (b.player) b.koShot(b.player);
      b.emit('missionFailed', { reason });
      setTimeout(() => {
        if (b.disposed) return;
        SL.Music.stinger('defeat');
        if (b.config.onEnd) b.config.onEnd(b, { mission: this.def.id, failed: true, reason, checkpoint: this.checkpoint || 0, retries: this.retries });
      }, 2600);
    }

    succeed() {
      if (this.state !== 'running') return;
      this.state = 'success';
      const b = this.battle;
      b.inputLocked = true;
      b.aiLocked = true;
      const score = this.computeScore();
      const rank = SL.Rules.rank(score);
      const p = b.player;
      const result = {
        mission: this.def.id, success: true, score, rank, time: this.time, kills: this.kills,
        damageTaken: Math.round(this.damageTaken), maxCombo: p ? p.stats.maxCombo : 0,
        optionalDone: this.optionalDone, optionalTotal: this.optionalTotal, retries: this.retries, qte: this.qteScore,
      };
      const unlocked = SL.Save.completeMission(this.def.id, result);
      result.unlocked = unlocked;
      b.emit('missionComplete', result);
      if (b.config.onEnd) b.config.onEnd(b, result);
    }

    computeScore() {
      // missions with several struggles average them into one QTE score
      if (this.qteParts.length) this.qteScore = this.qteParts.reduce((a, v) => a + v, 0) / this.qteParts.length;
      const par = this.def.parTime || 480;
      const p = this.battle.player;
      let s = 6000;
      s -= Math.max(0, this.time - par) * 5;
      s -= (this.damageTaken / Math.max(1, p ? p.hpMax : 10000)) * 2200;
      s += this.optionalDone * 1000;
      s += Math.min(1000, (p ? p.stats.maxCombo : 0) * 30);
      s += this.qteScore * 1500;
      s -= this.retries * 800;
      if ((this.opts.startPhase || 0) > 0) s -= 1500;
      return Math.max(0, Math.round(s));
    }

    dispose() {
      if (this.seq) this.seq.stop();
      this.spawners = [];
      this.tickHooks = [];
    }
  }

  SL.Mission = Mission;
})();
