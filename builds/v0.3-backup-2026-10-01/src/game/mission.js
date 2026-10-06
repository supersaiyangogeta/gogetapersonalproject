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
  // input actions that belong to a teachable skill (see Mission.teach)
  const LEARN_ACTIONS = { guard: ['guard'], dodge: ['dodge'], blast: ['blast'], charge: ['charge'], heavy: ['heavy'], light: ['light'], flight: ['up', 'down'], special1: ['s1'], special2: ['s2'], ultimate: ['ult'], boost: ['boost', 'boostPressed'] };

  const MASH = ['ultimate', 'special1', 'light', 'heavy', 'blast'];
  // a cue's intent key → the input action whose binding the prompt shows
  const CUE_ACTIONS = { s1: 'special1', s2: 'special2', ult: 'ultimate' };
  const ALL_OFF = { light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, dodge: false, guard: false, charge: false, transform: false, boost: false, boostPressed: false, up: false, upPressed: false, down: false, mx: false, my: false, target: false };

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
      // run when the battle is torn down mid-phase (quit, retry): restores screen, audio and scene state
      this.cleanups = [];
      // world items live in their own list so phases can clear tickHooks freely
      this.itemHooks = [];
      this.items = [];
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
      this._lockUnearnedForms();
      this._runPhase();
    }

    /**
     * CHRONOLOGY (owner, human playtest round 3: the HUD said "Super Saiyan" in a mission that
     * happens before Goku has ever turned Super Saiyan). A mission that sets `lockedForms` by
     * hand replaces whatever the character started with, so one missing entry silently hands a
     * form over years too early. The story table (SL.data.formGivenBy) says which mission hands
     * each form over; any canon mission before that one locks it, for every fighter on the
     * field, whatever the mission itself wrote.
     */
    _lockUnearnedForms() {
      const given = SL.data.formGivenBy;
      if (!given) return;
      const order = SL.data.storyOrder();
      let here = order.indexOf(this.def.id);
      // WHAT-IF ISOLATION: a branch lives at its branch point, whatever the canon save has reached
      // since — a player who has seen Super Saiyan 2 in the story does not carry it into a
      // Saiyan Saga What-If
      if (!this.def.canon) {
        const w = SL.data.story && SL.data.story.whatIf.find((x) => x.mission === this.def.id);
        here = w ? order.indexOf(w.branchOf) : -1;
      }
      if (here < 0) return;
      for (const f of this.battle.fighters) {
        for (const fm of f.def.forms || []) {
          const by = given[f.def.id + ':' + fm.id];
          if (!by || by === this.def.id) continue;
          if (order.indexOf(by) > here) {
            // kept apart from the mission's own locks: every later `lockedForms = {...}` merges it back in
            f.storyLocks = f.storyLocks || {};
            f.storyLocks[fm.id] = true;
            f.lockedForms = f.lockedForms;
          }
        }
      }
    }

    _runPhase() {
      const ph = this.def.phases[this.phaseIndex];
      if (!ph) {
        this.succeed();
        return;
      }
      if (ph.checkpoint) this.checkpoint = this.phaseIndex;
      // prompts belong to the phase that created them
      this.prompts.clear();
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
      for (const h of this.itemHooks) h();
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

    /**
     * A spoken line. opts.jp carries the original Japanese where we have it,
     * opts.voice names a voice cue (no audio ships with the project — see
     * SL.Voice), opts.style is a delivery hint ('quiet', 'shout') that the
     * subtitle and the voice hook can both use.
     */
    say(speaker, line, duration = 3.2, opts = {}) {
      const name = SL.data.dialogue.speakers[speaker] || speaker;
      const ev = { speaker: name, speakerId: speaker, line, jp: opts.jp || null, style: opts.style || null, voice: opts.voice || null, duration };
      if (SL.Voice) SL.Voice.cue(ev);
      this.battle.emit('say', ev);
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
     * Contextual control hint; hides when `until()` is true. Settings → Display & Immersion →
     * Tutorial Tips decides how much teaching the player wants: Full (as authored: a hint comes
     * back until it is learned, `always` ones every mission), Contextual (a learned hint never
     * returns, and a hint that has been up once does not reappear in this mission), Off.
     * `opts.required` marks what the story cannot go on without — a struggle to mash out of, the
     * technique or form a scene waits for, a lethal floor — and shows in every mode.
     */
    prompt(id, action, label, opts = {}) {
      const tips = SL.Settings.data.hud.tips;
      if (!opts.required) {
        if (tips === 'off') return;
        if (SL.Save.data.seen.prompts[id] && (!opts.always || tips === 'contextual')) return;
      }
      if (this.prompts.has(id)) return;
      this.prompts.set(id, { id, action, label, until: opts.until || (() => SL.Input.pressed(action)), when: opts.when || (() => true), shown: false, min: opts.min || 1.2, t: 0, required: !!opts.required, once: !opts.required && tips === 'contextual' });
    }

    _updatePrompts() {
      const now = performance.now() / 1000;
      // contextual tips teach one thing at a time (required prompts never wait)
      const oneTip = SL.Settings.data.hud.tips === 'contextual';
      let tipsUp = 0;
      for (const p of this.prompts.values()) if (p.shown && !p.required) tipsUp++;
      for (const p of this.prompts.values()) {
        const active = !this.battle.inputLocked && !this.battle.paused && !this.struggling && p.when();
        if (active && !p.shown && now >= (p.cooldownUntil || 0) && !(oneTip && !p.required && tipsUp > 0)) {
          if (!p.required) tipsUp++;
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
            // contextual tips say it once per mission, never on a loop
            if (p.once) this.prompts.delete(p.id);
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
      const st = this.battle.stage;
      // story cameras never dip below the terrain (0.3 m still allows a low shot up at a kneeling face)
      const safe = (t, out, el) => {
        fn(t, out, el);
        if (st.hasGround) out.pos.y = Math.max(out.pos.y, st.heightAt(out.pos.x, out.pos.z) + 0.3);
      };
      this.battle.camera.playShot(safe, seconds, Object.assign({ kind: 'story', blendIn: 0.4 }, opts));
    }

    endShot() {
      this.battle.camera.endShot();
      this.battle.camera.cut();
    }

    /**
     * A collectible in the world (fruit, capsule...). Collected when the player
     * touches it. Returns { pos, alive } so it can also be used as a HUD marker.
     */
    pickup(pos, opts = {}) {
      const b = this.battle;
      const g = new THREE.Group();
      const color = opts.color || 0xe8402a;
      const body = new THREE.Mesh(new THREE.SphereGeometry(opts.r || 0.32, 14, 10), SL.Toon.mat(color));
      SL.Toon.addOutline(body, 1.2);
      g.add(body);
      if (opts.kind === 'fruit') {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 5), SL.Toon.mat(0x4aa83a));
        leaf.position.set(0.06, 0.34, 0);
        leaf.rotation.z = -0.6;
        g.add(leaf);
      }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: opts.glow || 0xfff0b0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }));
      glow.scale.setScalar(1.4);
      g.add(glow);
      const base = pos.clone();
      g.position.copy(base);
      b.scene.add(g);
      const item = { pos: base.clone(), alive: true, group: g, kind: opts.kind || 'item' };
      this.items.push(item);
      const hook = () => {
        if (!item.alive) return;
        const t = b.frame * 0.05;
        g.position.set(base.x, base.y + Math.sin(t) * 0.12, base.z);
        g.rotation.y = t;
        if (b.frame % 40 === 0) b.vfx.sparks(g.position, opts.glow || 0xfff0b0, 3, 2, 0.06);
        const p = this.player;
        if (p && p.alive && p.chest().distanceTo(g.position) < (opts.reach || 1.5)) {
          item.alive = false;
          b.scene.remove(g);
          body.geometry.dispose();
          b.vfx.sparks(g.position, 0xffffff, 16, 5, 0.1);
          b.sfx('pickup', p);
          if (opts.onCollect) opts.onCollect(item);
          b.emit('pickup', { item });
        }
      };
      this.itemHooks.push(hook);
      item.hook = hook;
      return item;
    }

    /**
     * Story progression inside a mission: a locked technique becomes available.
     * The HUD shows the new skill appearing; no text box.
     */
    /**
     * Story progression: a technique — or a form — becomes available.
     * `form:<id>` unlocks a locked form (Krillin's potential, a Saiyan's first
     * transformation), so the wheel and HUD stop showing it as story-locked.
     */
    teach(fighter, key) {
      if (key.startsWith('form:')) {
        const id = key.slice(5);
        if (fighter.storyLocks) delete fighter.storyLocks[id];
        if (fighter.lockedForms && fighter.lockedForms[id]) delete fighter.lockedForms[id];
        if (fighter.lockedSlots && fighter.lockedSlots.transform) delete fighter.lockedSlots.transform;
      }
      if (fighter.lockedSlots && fighter.lockedSlots[key]) delete fighter.lockedSlots[key];
      if (key === 'flight') fighter.noFlight = false;
      if (this.battle.playerLimits && fighter === this.player) {
        const lim = Object.assign({}, this.battle.playerLimits);
        for (const k of LEARN_ACTIONS[key] || []) delete lim[k];
        this.battle.playerLimits = lim;
      }
      SL.Audio.play('learn');
      this.battle.emit('skillLearned', { fighter, key });
    }

    /**
     * Generic hold-on struggle (tail grips, holds, outbursts). Mash (or hold, per the
     * clash input setting) to keep the grip bar up while it drains.
     * Returns { avg, failed }.
     */
    *struggle(opts) {
      const m = this;
      const b = m.battle;
      const I = SL.Input;
      let grip = opts.start, t = 0, sum = 0, n = 0, failed = false, surge = 0;
      let surgeT = opts.surgeEvery || 0;
      const presses = [];
      const prevLimits = b.playerLimits;
      m.struggling = true;
      m.limits(ALL_OFF);
      b.inputLocked = false;
      b.aiLocked = true;
      const hook = () => {
        t += 1 / 60;
        const assist = SL.Settings.data.gameplay.qteAssist;
        let gain = 0;
        if (SL.Settings.data.gameplay.beamClashInput === 'hold') {
          if (MASH.some((a) => I.held(a))) gain = (assist ? 0.62 : 0.48) / 60;
        } else if (MASH.some((a) => I.pressed(a))) {
          gain = assist ? 0.065 : 0.05;
          presses.push(t);
          SL.Audio.play('mash');
        }
        while (presses.length && t - presses[0] > 1) presses.shift();
        let drain = opts.drain / 60;
        if (opts.surgeEvery) {
          surgeT -= 1 / 60;
          if (surgeT <= 0) {
            surge = 0.5;
            surgeT = opts.surgeEvery * U.rand(0.75, 1.25);
            if (opts.onSurge) opts.onSurge();
          }
        }
        if (surge > 0) {
          surge -= 1 / 60;
          drain += opts.surgeDrain / 60;
        }
        grip = U.clamp01(grip + gain - drain);
        // opts.override(t, grip): the story takes the bar (he stops resisting, whatever you press)
        if (opts.override) {
          const o = opts.override(t, grip);
          if (o !== undefined && o !== null) grip = U.clamp01(o);
        }
        sum += grip;
        n++;
        b.emit('struggle', { active: true, progress: 1 - grip, rate: presses.length, label: surge > 0 ? opts.surgeLabel : typeof opts.label === 'function' ? opts.label(t, grip) : opts.label });
        if (opts.onTick) opts.onTick(t, grip);
        if (grip <= 0 && opts.canFail) failed = true;
      };
      m.tickHooks.push(hook);
      yield () => failed || t >= opts.duration || (opts.until && opts.until(t, grip));
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      b.emit('struggle', { active: false });
      m.struggling = false;
      m.limits(opts.restoreLimits ? prevLimits : null);
      b.inputLocked = !opts.keepInput;
      return { avg: n ? sum / n : 0, failed, grip, t };
    }

    /**
     * AN INTERACTIVE BEAT: the story waits for one button — hand him the sword, catch the blade,
     * fire. The body stays scripted (nothing else the player presses does anything), the prompt
     * names the button in every HUD mode, time can crawl while it waits (opts.slow), and a cue with
     * opts.auto goes ahead by itself after that many seconds so nobody is ever stuck. A skip
     * request ends it at once. key: an intent key ('light', 'heavy', 'blast', 'guard', 'dodge',
     * 's1', 's2', 'ult', 'charge'). Bots read `battle.cue` (tools/mission_brains.js).
     * Returns { pressed, seconds }.
     */
    *cue(key, label, opts = {}) {
      const b = this.battle;
      const action = CUE_ACTIONS[key] || key;
      const prevLimits = b.playerLimits;
      const lim = Object.assign({}, ALL_OFF);
      delete lim[key];
      delete lim[key + 'Held'];
      this.limits(lim);
      b.inputLocked = false;
      b.aiLocked = true;
      const id = 'cue:' + key + ':' + label;
      const cue = (b.cue = { key, label, action, t: 0 });
      this.prompt(id, action, label, { required: true, until: () => false });
      let pressed = false;
      // real seconds (a cue that slows the world still goes ahead on its own in opts.auto seconds)
      const t0 = performance.now();
      const hook = () => {
        if (opts.slow) b.slowmo(opts.slow, 0.1);
        const p = this.player;
        const it = p && p.intent;
        if (it && (it[key] || it[key + 'Held'])) pressed = true;
      };
      this.tickHooks.push(hook);
      b.emit('cue', { key, label, action });
      yield () => {
        cue.t = (performance.now() - t0) / 1000;
        return pressed || (opts.auto && cue.t >= opts.auto) || b.skipRequested;
      };
      const i = this.tickHooks.indexOf(hook);
      if (i >= 0) this.tickHooks.splice(i, 1);
      if (this.prompts.has(id)) {
        this.prompts.delete(id);
        b.emit('prompt', { id, show: false, learned: pressed });
      }
      this.limits(prevLimits);
      b.inputLocked = true;
      b.cue = null;
      const res = { pressed, seconds: cue.t, key };
      b.emit('cueDone', res);
      return res;
    }

    /**
     * A RHYTHM SEQUENCE (the Fusion Dance): steps [{ key, label }] fall on a fixed beat. For each step
     * the meter fills toward its beat; pressing the step's key as it lands counts — within
     * opts.perfect seconds 'perfect', within opts.window 'good' — and a press too far off, or none,
     * is a 'miss'. A press long before a step is ignored (no mashing through it). opts.onBeat(i)
     * runs ON each beat whatever was pressed: the dancers move to the count, not to the player; the
     * player decides what the count was worth. Nothing else the player presses does anything. A
     * cutscene skip never jumps it. Bots read `battle.rhythm` ({ next, key, index }).
     * Returns { hits: [{ grade, error }], score 0..1 }.
     */
    *rhythm(steps, opts = {}) {
      const b = this.battle;
      const beat = opts.beat || 0.8, win = opts.window || 0.2, perf = opts.perfect || 0.07;
      const prevLimits = b.playerLimits;
      const keyOf = (s) => (s && s.key) || 'light';
      const lim = Object.assign({}, ALL_OFF);
      for (const s of steps) {
        delete lim[keyOf(s)];
        delete lim[keyOf(s) + 'Held'];
      }
      this.limits(lim);
      b.inputLocked = false;
      b.aiLocked = true;
      this.struggling = true; // the step names are the meter's label: tips step aside
      b.skipRequested = false;
      let t = -(opts.lead === undefined ? 1 : opts.lead), live = 0, beatDone = -1, prevDown = false, last = '';
      const hits = steps.map(() => null);
      const R = (b.rhythm = { next: 0, key: keyOf(steps[0]), index: 0 });
      const judge = (i, err) => {
        const grade = err === null ? 'miss' : Math.abs(err) <= perf ? 'perfect' : Math.abs(err) <= win ? 'good' : 'miss';
        hits[i] = { grade, error: err };
        last = grade.toUpperCase();
        b.emit('rhythmStep', { index: i, grade, error: err, label: steps[i].label });
      };
      const hook = () => {
        t += 1 / 60;
        while (beatDone + 1 < steps.length && t >= (beatDone + 1) * beat) {
          beatDone++;
          if (opts.onBeat) opts.onBeat(beatDone);
        }
        const p = this.player, it = p && p.intent;
        if (live < steps.length) {
          const key = keyOf(steps[live]), at = live * beat;
          const down = !!(it && (it[key] || it[key + 'Held']));
          const press = down && !prevDown;
          prevDown = down;
          if (press && t >= at - win * 1.8) {
            judge(live, t - at);
            live++;
          } else if (t > at + win) {
            judge(live, null);
            live++;
          }
        }
        R.index = live;
        R.next = live < steps.length ? live * beat - t : 0;
        R.key = keyOf(steps[Math.min(live, steps.length - 1)]);
        const fill = live < steps.length ? U.clamp01(1 - (live * beat - t) / beat) : 1;
        const step = steps[Math.min(live, steps.length - 1)];
        b.emit('struggle', { active: true, progress: 1 - fill, rate: 0, label: step.label + (last ? '   ' + last : ''), action: CUE_ACTIONS[R.key] || R.key });
      };
      this.tickHooks.push(hook);
      yield () => live >= steps.length && t >= (steps.length - 1) * beat + 0.35;
      const i = this.tickHooks.indexOf(hook);
      if (i >= 0) this.tickHooks.splice(i, 1);
      if (opts.onBeat) while (beatDone + 1 < steps.length) opts.onBeat(++beatDone);
      b.emit('struggle', { active: false });
      this.struggling = false;
      this.limits(prevLimits);
      b.inputLocked = true;
      b.rhythm = null;
      const score = hits.reduce((a, h) => a + (h.grade === 'perfect' ? 1 : h.grade === 'good' ? 0.7 : 0), 0) / steps.length;
      const res = { hits, score };
      b.emit('rhythmDone', res);
      return res;
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
      // a fallen ally is not a kill (in party battles control has already moved on)
      if (b.player && f.team === b.player.team) {
        b.emit('allyDown', { fighter: f });
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
      b.silence(0.8, { sfx: true });
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
      // the Mission Complete music plays alone: charges, auras, beams and battle one-shots end here
      b.silence(0.5, { sfx: true });
      b.emit('missionComplete', result);
      if (b.config.onEnd) b.config.onEnd(b, result);
    }

    /** The subtitle of a mission's closing title: the next mission in the story, by name. */
    nextLine() {
      const order = SL.data.storyOrder ? SL.data.storyOrder() : [];
      const i = order.indexOf(this.def.id);
      const next = i >= 0 ? SL.data.missions[order[i + 1]] : null;
      return next ? 'Next: ' + next.title : 'Next: the story continues';
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

    onDispose(fn) {
      this.cleanups.push(fn);
    }

    dispose() {
      if (this.seq) this.seq.stop();
      for (const fn of this.cleanups.splice(0)) {
        try {
          fn();
        } catch (e) {
          console.error('[SL] mission cleanup failed', e);
        }
      }
      this.spawners = [];
      this.tickHooks = [];
    }
  }

  Mission.ALL_OFF = ALL_OFF;
  SL.Mission = Mission;
})();
