/*
 * Battle HUD: health/ki/stamina, form & mechanic meters, skill panel with
 * live button glyphs, lock-on marker with off-screen arrow, objective list,
 * combo counter, damage numbers, struggle meter, contextual prompts.
 * Information is shown with bars, icons and motion rather than sentences.
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;
  const V3 = THREE.Vector3;

  function fighterPanel(side) {
    // body change: the mind's own face, small, over the body's portrait
    const mindImg = el('img', { class: 'mind', alt: '' });
    mindImg.hidden = true;
    const port = el('div', { class: 'fport' }, [el('img', { alt: '' }), mindImg]);
    const name = el('span');
    const badge = el('span', { class: 'form-badge' });
    const trail = el('i', { class: 'trail' });
    const fill = el('i', { class: 'fill' });
    const hp = el('div', { class: 'bar' }, [trail, fill]);
    const segs = [];
    const ki = el('div', { class: 'kibar' });
    for (let i = 0; i < 5; i++) {
      const fi = el('i');
      const s = el('div', { class: 'seg' }, [fi]);
      segs.push({ s, fi });
      ki.appendChild(s);
    }
    const stamI = el('i');
    const stam = el('div', { class: 'stambar' }, [stamI]);
    const strainI = el('i');
    const strain = el('div', { class: 'strainbar' }, [strainI]);
    const mechLabel = el('span');
    const mechI = el('i');
    const mech = el('div', { class: 'mechbar' }, [mechLabel, el('div', { class: 'mtrack' }, [mechI])]);
    const count = el('div', { class: 'enemy-count' });
    // "IN GINYU'S BODY": whose body this mind is wearing, when it is not its own
    const bodyTag = el('div', { class: 'body-tag' });
    bodyTag.hidden = true;
    const nameRow = el('div', { class: 'fname-row' }, [name, badge]);
    const bars = el('div', { class: 'fbars' }, [nameRow, bodyTag, hp, ki, stam, strain, mech, count]);
    const root = el('div', { class: 'fpanel ' + side }, [port, bars]);
    return { root, port, img: port.querySelector('img'), mindImg, bodyTag, nameRow, name, badge, hp, fill, trail, ki, segs, stam, stamI, strain, strainI, mech, mechLabel, mechI, count, last: {} };
  }

  const HUD = (SL.HUD = {
    battle: null,
    root: null,

    attach(battle) {
      this.detach();
      this.battle = battle;
      const root = (this.root = document.getElementById('hud'));
      root.innerHTML = '';
      root.hidden = false;
      this.p1 = fighterPanel('p1');
      this.p2 = fighterPanel('p2');
      this.timer = el('div', { class: 'hud-timer' });
      // a STORY CLOCK (a countdown the story owns: Veku's thirty minutes): a ring that empties, a time, a label
      this.clockText = el('div', { class: 't' });
      this.clockLabel = el('div', { class: 'l' });
      this.clockEl = el('div', { class: 'hud-clock' }, [el('div', { class: 'ring' }), this.clockText, this.clockLabel]);
      this.clockEl.hidden = true;
      this.objectives = el('div', { class: 'hud-objectives' });
      this.comboN = el('div', { class: 'n' });
      this.comboD = el('div', { class: 'd' });
      this.combo = el('div', { class: 'hud-combo' }, [this.comboN, el('div', { class: 'l', text: 'HITS' }), this.comboD]);
      this.banner = el('div', { class: 'hud-banner gradient-text' });
      this.center = el('div', { class: 'hud-center gradient-text' });
      this.callout = el('div', { class: 'hud-callout' });
      this.skills = el('div', { class: 'hud-skills' });
      this.prompts = el('div', { class: 'hud-prompt' });
      // what the story is waiting for (a cue, a hold, a required press): bottom right, out of the shot,
      // and up through cutscene cameras — the owner could not see which button moved a scene on
      this.cueBox = el('div', { class: 'hud-cue' });
      this.lock = el('div', { class: 'lock' }, [el('span', { class: 'alt' })]);
      this.offArrow = el('div', { class: 'offarrow' });
      // threats about to strike or fire at the player from outside the view: small edge arrows
      this.threatEls = [0, 1, 2, 3].map(() => el('div', { class: 'threat' }));
      for (const t of this.threatEls) t.hidden = true;
      // free aim: a small crosshair at the centre of the screen
      this.crosshair = el('div', { class: 'crosshair' });
      this.crosshair.hidden = true;
      // what the camera and the aim are doing right now, and what Lock-On does about it
      this.aimChip = el('div', { class: 'hud-aimchip' });
      this.aimChip.style.opacity = 0;
      this.aimSig = '';
      this.aimShownAt = -99;
      // the flight controls, the first time the player is in the air
      // Developer / Test Mode: the debug overlay (camera, lock-on, audio loops, state, phase)
      this.devOverlay = el('pre', { class: 'dev-overlay' });
      this.devOverlay.hidden = true;
      this.flightHint = el('div', { class: 'hud-flighthint' });
      this.flightHint.style.opacity = 0;
      this.flightHintState = null;
      this.markerLayer = el('div');
      // THE DRAGON RADAR (a hunt points it at a ball: battle 'radar' event): a round green screen with a
      // grid, the player in the middle, up = where the camera looks, and a blinking blip
      this.radarBlip = el('i', { class: 'blip' });
      this.radarDist = el('span', { class: 'rdist' });
      this.radarEl = el('div', { class: 'hud-radar' }, [el('b', { class: 'me' }), this.radarBlip, this.radarDist]);
      this.radarEl.hidden = true;
      this.radarTarget = null;
      this.dmgLayer = el('div');
      this.structTrack = el('i');
      this.structKnob = el('b');
      this.structLabel = el('span');
      this.structKey = el('span');
      this.struggle = el('div', { class: 'hud-struggle' }, [el('div', { class: 'track' }, [this.structTrack, this.structKnob]), el('div', { class: 'mash' }, [this.structKey, this.structLabel])]);
      this.training = el('div', { class: 'hud-training' });
      this.titleCard = el('div', { class: 'titlecard' });
      this.fadeEl = el('div', { class: 'hud-fade' });
      this.partyEl = el('div', { class: 'hud-party' });
      this.radialEl = el('div', { class: 'hud-radial' });
      this.radialEl.hidden = true;
      this.radialSig = '';
      this.partyCards = [];
      root.append(this.radarEl, this.p1.root, this.p2.root, this.timer, this.clockEl, this.objectives, this.combo, this.banner, this.center, this.callout, this.skills, this.prompts, this.cueBox, this.lock, this.offArrow, this.crosshair, this.aimChip, this.flightHint, this.devOverlay, ...this.threatEls, this.markerLayer, this.dmgLayer, this.struggle, this.training, this.partyEl, this.radialEl, this.titleCard, this.fadeEl);
      this.timer.hidden = !(battle.rules.timeLimit > 0);
      this.struggle.hidden = true;
      this.training.hidden = battle.mode !== 'training';
      this.combo.style.opacity = 0;
      this.lock.hidden = true;
      this.offArrow.hidden = true;
      this.markers = [];
      this.activePrompts = new Map();
      this.comboShown = 0;
      this.comboFade = 0;
      this.trainingStats = { last: 0, combo: 0, best: 0 };
      this.skillCards = null;
      this.hiddenAll = false;
      // Display & Immersion: when each kind of information last had a reason to be on screen
      this.woke = {};
      this.lastRes = null;
      this.objSig = '';

      const b = battle;
      b.on('say', (e) => {
        if (this._subtitleOn(e)) SL.Subtitles.show(e.speaker, e.line, e.duration, { jp: e.jp, style: e.style });
      });
      b.on('clearSubtitles', () => SL.Subtitles.clear());
      // { active, frac (1 full .. 0 out), text, label, color }
      b.on('storyClock', (e) => {
        this.clockEl.hidden = !e.active;
        if (!e.active) return;
        this.clockEl.style.setProperty('--frac', String(Math.max(0, Math.min(1, e.frac === undefined ? 1 : e.frac))));
        if (e.color) this.clockEl.style.setProperty('--clock', e.color);
        if (this.clockText.textContent !== e.text) this.clockText.textContent = e.text || '';
        if (this.clockLabel.textContent !== (e.label || '')) this.clockLabel.textContent = e.label || '';
        this.clockEl.classList.toggle('urgent', !!e.urgent);
      });
      b.on('ready', () => this.showCenter('READY', 'show'));
      b.on('fightStart', () => this.showCenter('FIGHT!', 'show'));
      b.on('finishKO', (r) => this.showCenter(r.reason === 'time' ? 'TIME' : 'K.O.', 'hold'));
      b.on('missionFailed', () => this.showCenter('DEFEATED', 'hold'));
      b.on('end', () => this.showCenter('', ''));
      b.on('victoryStart', () => this.showCenter('', ''));
      b.on('special', (e) => this._onSpecial(e));
      b.on('formChanged', (e) => {
        const H = SL.Settings.data.hud;
        // a form changed while a story scene holds the input is shown by the scene itself: no HUD popping up or banner over it
        if (e.fighter === b.player && !b.inputLocked) {
          this._wake('skills', 'ki', 'hp');
          if (e.form.short && H.moveNames) this.showBanner(e.form.short, false);
        } else if (b.player && e.fighter.team !== b.player.team && (e.fighter.def.boss || (e.fighter.tags && e.fighter.tags.boss))) {
          // a boss entering a new phase: its plate comes back with the new form on it, and
          // (unless damage numbers are off) the form's name over it once
          this._wake('boss');
          if (H.damageNumbers !== 'off') this._word(e.fighter, String(e.form.short || e.form.name || '').toUpperCase(), true);
        }
        this.skillCards = null;
      });
      b.on('damage', (e) => this._onDamage(e));
      b.on('callout', (e) => this._onCallout(e));
      b.on('skillLearned', (e) => this._onLearned(e));
      b.on('formLevel', (e) => {
        if (e.fighter !== b.player) return;
        this._wake('skills', 'ki');
        if (SL.Settings.data.hud.moveNames) this.showBanner(e.label, false);
      });
      b.on('targetChanged', (e) => {
        if (e.fighter === b.player) this._wake('lock', 'enemy');
      });
      b.on('teleported', (e) => {
        if (e.fighter === b.player && e.mode !== 'behind') this._word(e.fighter, e.mode.toUpperCase());
      });
      b.on('bombLaunch', (e) => {
        if (e.fighter === b.player && e.frac >= 0.95) this._word(e.fighter, 'MAX POWER');
      });
      b.on('vanish', (e) => this._word(e.fighter, 'VANISH'));
      b.on('perfectGuard', (e) => this._word(e.fighter, 'PERFECT'));
      b.on('guardBreak', (e) => {
        if (e.fighter === b.player) this._wake('stam');
        this._word(e.fighter, 'GUARD BREAK');
      });
      b.on('deflect', (e) => this._word(e.fighter, 'DEFLECT'));
      // a body change keeps both fighter ids and swaps the names on them
      b.on('bodyChange', () => {
        for (const P of [this.p1, this.p2]) if (P && P.last) P.last.id = -1;
      });
      b.on('burst', (e) => this._word(e.fighter, 'ESCAPE'));
      b.on('chase', (e) => {
        if (e.fighter === b.player) this._word(e.fighter, 'CHASE');
      });
      b.on('denied', (e) => {
        if (e.fighter !== b.player) return;
        this._wake('ki', 'skills');
        this.p1.ki.classList.remove('denied');
        void this.p1.ki.offsetWidth;
        this.p1.ki.classList.add('denied');
      });
      b.on('mechanic', (e) => this._onMechanic(e));
      b.on('party', () => this._buildParty());
      b.on('radialRefused', () => {
        this.radialEl.classList.remove('refused');
        void this.radialEl.offsetWidth;
        this.radialEl.classList.add('refused');
        SL.Audio.play('uiError');
      });
      b.on('radialUsed', () => SL.Audio.play('uiSelect'));
      b.on('playerSwitched', (e) => {
        this.skillCards = null;
        this.skillSlotsShown = null;
        this._buildParty();
      });
      b.on('comboEnd', (e) => {
        if (e.fighter === b.player && b.mode === 'training') {
          this.trainingStats.combo = e.damage;
          this.trainingStats.best = Math.max(this.trainingStats.best, e.hits);
        }
      });
      b.on('clashStart', (e) => {
        if (!e.player) return;
        this.struggle.hidden = false;
        const pl = b.player;
        const mine = e.a === pl ? b.clash.active.a : b.clash.active.b;
        const theirs = e.a === pl ? b.clash.active.b : b.clash.active.a;
        this.struggle.style.setProperty('--c1', '#' + new THREE.Color(mine.spec.color).getHexString());
        this.struggle.style.setProperty('--c2', '#' + new THREE.Color(theirs.spec.color).getHexString());
        this.struggleMode = 'clash';
        this._struggleLabel();
      });
      b.on('clashEnd', () => {
        this.struggle.hidden = true;
        this.struggleMode = null;
      });
      b.on('struggle', (e) => {
        this.struggle.hidden = !e.active;
        this.struggleMode = e.active ? 'mission' : null;
        if (e.active) {
          this.struggle.style.setProperty('--c1', '#5fd0ff');
          this.struggle.style.setProperty('--c2', '#ff7a1a');
          this.structTrack.style.width = (1 - e.progress) * 100 + '%';
          this.structKnob.style.left = (1 - e.progress) * 100 + '%';
          this.struggle.classList.toggle('pulse', e.rate > 0 && SL.Input.pressed('ultimate'));
          this.structAction = e.action || null;
          this._struggleLabel(e.label);
        }
      });
      b.on('objectives', (e) => {
        // many phases re-post their objectives every frame: only a real change is a reason to show them
        const sig = e.list.map((o) => o.id + o.text + o.count + o.done + o.failed).join('|');
        if (sig === this.objSig) return;
        this.objSig = sig;
        this._wake('obj');
        this._renderObjectives(e);
      });
      b.on('prompt', (e) => this._onPrompt(e));
      b.on('markers', (e) => this._setMarkers(e.list));
      b.on('radar', (e) => {
        this.radarTarget = e.target;
        this.radarEl.hidden = !e.target;
      });
      b.on('titleCard', (e) => this._titleCard(e));
      b.on('fade', (e) => {
        this.fadeEl.style.transition = 'opacity ' + e.seconds + 's, background-color ' + e.seconds + 's';
        // 'white' fades into light (the end of the Buu Saga); 'black' after it turns the light to night
        if (e.to === 'white') this.fadeEl.style.backgroundColor = '#fffaf0';
        else if (e.to === 'black') this.fadeEl.style.backgroundColor = '#000';
        this.fadeEl.style.opacity = e.to === 'black' || e.to === 'white' ? 1 : 0;
      });
      b.on('missionPhase', () => {
        this._wake('obj');
        for (const id of Array.from(this.activePrompts.keys())) this._onPrompt({ id, show: false });
      });
      b.on('spawn', () => (this.enemyCountDirty = true));
      b.on('removed', () => (this.enemyCountDirty = true));
    },

    detach() {
      if (this.root) {
        this.root.innerHTML = '';
        this.root.hidden = true;
      }
      SL.Subtitles.clear();
      this.battle = null;
    },

    refreshGlyphs() {
      this.skillCards = null;
      for (const [id, p] of this.activePrompts) {
        const k = p.node.querySelector('.glyph');
        if (k) k.innerHTML = SL.glyph(p.action);
      }
      if (this.struggleMode) this._struggleLabel();
    },

    setVisible(v) {
      if (this.root) this.root.style.visibility = v ? '' : 'hidden';
    },

    showCenter(text, mode) {
      const c = this.center;
      c.className = 'hud-center gradient-text';
      c.textContent = text;
      if (!mode) return;
      void c.offsetWidth;
      c.classList.add(mode);
    },

    showBanner(text, enemy) {
      const b = this.banner;
      b.className = 'hud-banner gradient-text' + (enemy ? ' enemy' : '');
      b.textContent = text;
      void b.offsetWidth;
      b.classList.add('show');
    },

    _struggleLabel(label) {
      const mode = SL.Settings.data.gameplay.beamClashInput;
      this.structKey.innerHTML = SL.glyph(this.struggleMode === 'mission' ? this.structAction || 'ultimate' : 'special1');
      this.structLabel.textContent = label || (mode === 'hold' ? 'HOLD!' : 'MASH!');
    },

    /* ---- Display & Immersion: information appears when there is a reason, then rests ---- */
    _now() {
      return this.battle ? this.battle.frame / 60 : 0;
    },

    _wake(...kinds) {
      const t = this._now();
      for (const k of kinds) this.woke[k] = t;
      this.woke.any = t;
    },

    _awake(kind, hold) {
      const t = this.woke && this.woke[kind];
      return t !== undefined && this._now() - t < hold;
    },

    /** Subtitles setting: On / Dialogue Only (no combat taunts) / Cinematic Only (story scenes) / Off. */
    _subtitleOn(e) {
      const mode = SL.Settings.data.hud.subtitles;
      if (mode === 'off') return false;
      if (mode === 'dialogue') return e.kind !== 'bark';
      if (mode === 'cinematic') {
        const b = this.battle;
        return !!b && !!(b.camera.inShot || b.inputLocked || b.phase === 'intro');
      }
      return true;
    },

    /**
     * What is on screen this frame (true = shown). Full and Minimal stay up, unless Auto-Hide
     * rests them while nothing is happening; Contextual shows only after its own reason
     * (spent, charged, hit, changed) or while it is critical; Hidden never. Being badly hurt
     * always counts as something happening.
     */
    _visibility(p, H) {
      const b = this.battle;
      const now = this._now();
      const crit = p.hp / p.hpMax < 0.25;
      // the player acting, or an enemy about to strike, keeps the HUD awake
      const busy = p.state !== 'free' || p.combo.hits > 0 || (b.radial && b.radial.open) ||
        b.enemiesOf(p).some((e) => e.alive && e.target === p && (e.state === 'attack' || e.state === 'beamCharge') && e.distTo(p) < 14);
      if (busy) this.woke.any = now;
      // ki and stamina: spending a chunk or dropping into the red is a reason to show them
      const kiF = p.ki / p.kiMax, stF = p.stamina / p.staminaMax;
      const L = this.lastRes;
      if (L && L.f === p) {
        if (p.ki < L.ki - 3 || (L.kiF >= 0.2 && kiF < 0.2)) this._wake('ki');
        if (stF < L.stF - 0.05 || (L.stF >= 0.25 && stF < 0.25)) this._wake('stam');
      }
      this.lastRes = { f: p, ki: p.ki, kiF, stF };
      if (b.radial && b.radial.open) this.woke.skills = now;
      const live = !H.autoHide || crit || this._awake('any', 4);
      const show = (mode, kind, hold, critical) => (mode === 'hidden' ? false : mode === 'contextual' ? !!critical || this._awake(kind, hold) : live || !!critical);
      return {
        hp: show(H.playerHealth, 'hp', 3, crit),
        ki: show(H.ki, 'ki', 2.5, p.state === 'charge'),
        stam: show(H.stamina, 'stam', 2.5),
        enemy: H.enemyHealth !== 'hidden' && (live || this._awake('boss', 4)),
        skills: show(H.skillPanel, 'skills', 3),
        obj: show(H.objectives, 'obj', 6),
        lockRing: H.lockOn === 'contextual' ? this._awake('lock', 1.6) : H.lockOn !== 'hidden' && live,
        rest: live,
      };
    },

    _part(node, on) {
      const v = on ? '' : '0';
      if (node.style.opacity !== v) node.style.opacity = v;
    },

    _onSpecial(e) {
      const b = this.battle;
      if (e.fighter === b.player) this._wake('skills', 'ki');
      if (!SL.Settings.data.hud.moveNames) return;
      if (e.fighter !== b.player && e.fighter.target !== b.player) return;
      if (e.spec.type === 'teleport' && e.fighter !== b.player) return;
      this.showBanner(e.spec.name, e.fighter !== b.player);
    },

    /** Technique name spoken syllable by syllable, big final word on release. */
    _onCallout(e) {
      const b = this.battle;
      if (!b || !SL.Settings.data.hud.moveNames) return;
      if (!(e.fighter === b.player || e.fighter.target === b.player)) return;
      const box = this.callout;
      clearTimeout(this._callTimer);
      if (e.index === 0 || e.burst) box.innerHTML = '';
      box.classList.remove('out');
      const col = e.fighter.def.specials && e.fighter.def.specials.special1 ? e.fighter.def.specials.special1.color : 0x5ac8ff;
      box.style.setProperty('--cc', '#' + new THREE.Color(e.burst ? e.fighter.form.aura.color : col).getHexString());
      if (e.final && !e.burst) box.innerHTML = '';
      const span = el('span', { class: e.final ? 'final' : '', text: e.text });
      box.appendChild(span);
      this._callTimer = setTimeout(() => box.classList.add('out'), e.final ? 900 : 1600);
    },

    _onMechanic(e) {
      const b = this.battle;
      const f = e.fighter;
      const lines = { zenkai: 'zenkai', prideMax: 'prideMax', rage: 'rage', fury: 'fury', roused: 'roused' };
      if (f === b.player) this._wake('ki');
      if (lines[e.kind]) b.say(f, f.def.id + '_' + lines[e.kind], 2.4, 'bark');
      const H = SL.Settings.data.hud;
      if (f === b.player && H.moveNames && H.notifications === 'all') {
        const label = { rage: 'BATTLE-HARDENED', prideMax: 'MAX PRIDE', zenkai: 'ZENKAI', fury: 'FURY', instinct: 'SAIYAN INSTINCT', adapted: 'ADAPTED' }[e.kind];
        if (label) this.showBanner(label, false);
      }
      // the opponent's mechanic the player has to break — tell them when they did
      if (e.kind === 'focusBroken' && f !== b.player && H.notifications !== 'off') this.showBanner('FOCUS BROKEN', false);
      if (e.kind === 'roused' && H.notifications !== 'off') this.showBanner(f === b.player ? 'INTERESTED' : 'NOW HE\'S INTERESTED', false);
    },

    _onDamage(e) {
      const b = this.battle;
      if (!b) return;
      if (b.mode === 'training' && e.attacker === b.player) this.trainingStats.last = e.amount;
      if (e.target === b.player) this._wake('hp');
      if (e.attacker === b.player || (b.player && e.target === b.player.target)) this._wake('enemy');
      const port = e.target === b.player ? this.p1.port : e.target === (b.player && b.player.target) ? this.p2.port : null;
      if (port && e.amount > 300) {
        port.classList.remove('hit');
        void port.offsetWidth;
        port.classList.add('hit');
      }
      // Damage Numbers: Off / Important Only (a blow worth a tenth of the target's health) / All
      const mode = SL.Settings.data.hud.damageNumbers;
      if (mode === 'off') return;
      if (mode === 'important' && (e.blocked || e.amount < e.target.hpMax * 0.1)) return;
      if (!(e.attacker === b.player || e.target === b.player)) return;
      const pt = e.point || e.target.chest();
      const pr = b.camera.project(pt, {});
      if (!pr.onScreen) return;
      const cls = 'dmg' + (e.blocked ? ' blocked' : '') + (e.amount >= 1000 ? ' big' : '') + (e.target === b.player ? ' player' : '');
      const node = el('div', { class: cls, text: U.fmtInt(e.amount) });
      // scattered by the frame number, not Math.random: the HUD must not draw from the random
      // stream the fight uses, or showing numbers would change how a seeded fight plays out
      node.style.left = pr.x + (((b.frame * 7919) % 37) - 18) + 'px';
      node.style.top = pr.y - 30 + 'px';
      this._addTransient(node, 950);
    },

    /** A combat word over a fighter (PERFECT, VANISH…): Notifications = All only, unless important. */
    _word(f, text, important) {
      const b = this.battle;
      if (!important && SL.Settings.data.hud.notifications !== 'all') return;
      if (!b || !f || !(f === b.player || f.target === b.player)) return;
      const pr = b.camera.project(f.chest().add(new V3(0, f.height * 0.5, 0)), {});
      if (!pr.onScreen) return;
      const node = el('div', { class: 'dmg word', text });
      node.style.left = pr.x + 'px';
      node.style.top = pr.y + 'px';
      this._addTransient(node, 950);
    },

    _addTransient(node, ms) {
      if (this.dmgLayer.childElementCount > 24) this.dmgLayer.firstChild.remove();
      this.dmgLayer.appendChild(node);
      setTimeout(() => node.remove(), ms);
    },

    _renderObjectives(e) {
      const box = this.objectives;
      box.innerHTML = '';
      for (const o of e.list) {
        const node = el('div', { class: 'obj' + (o.optional ? ' optional' : '') + (o.done ? ' done' : '') + (o.failed ? ' failed' : '') });
        node.innerHTML = '<span class="oi">' + SL.icon(o.icon) + '</span><span class="ot"></span>';
        node.querySelector('.ot').textContent = o.text;
        if (o.target) {
          const c = el('span', { class: 'oc', text: o.count + '/' + o.target });
          node.appendChild(c);
        } else if (o.done) node.appendChild(el('span', { class: 'oc', text: '' }));
        if (e.changed === o && (e.completed || o.count > 0)) node.classList.add('flash');
        box.appendChild(node);
      }
    },

    _onPrompt(e) {
      if (e.show) {
        if (this.activePrompts.has(e.id)) return;
        const node = el('div', { class: 'prompt' + (e.required ? ' cue' : '') });
        node.innerHTML = '<span class="glyph">' + SL.glyph(e.action) + '</span><span></span>';
        node.lastChild.textContent = e.label;
        (e.required ? this.cueBox : this.prompts).appendChild(node);
        this.activePrompts.set(e.id, { node, action: e.action });
        SL.Audio.play('uiMove');
      } else {
        const p = this.activePrompts.get(e.id);
        if (!p) return;
        this.activePrompts.delete(e.id);
        if (e.learned) p.node.classList.add('learned');
        p.node.classList.add('out');
        setTimeout(() => p.node.remove(), 380);
      }
    },

    /** The Dragon Radar: the target in the camera's frame (up = forward), 120 m to the rim. */
    _updateRadar(b, p) {
      const t = this.radarTarget;
      if (!t || !t.alive || !p) {
        this.radarEl.hidden = true;
        return;
      }
      this.radarEl.hidden = false;
      const cam = b.camera.camera;
      cam.updateMatrixWorld();
      const e = cam.matrixWorld.elements;
      // the camera's right and forward, flattened onto the ground
      let rx = e[0], rz = e[2], fx = -e[8], fz = -e[10];
      const rl = Math.hypot(rx, rz) || 1, fl = Math.hypot(fx, fz) || 1;
      rx /= rl; rz /= rl; fx /= fl; fz /= fl;
      const dx = t.pos.x - p.pos.x, dz = t.pos.z - p.pos.z;
      const dist = Math.hypot(dx, dz);
      const x = dx * rx + dz * rz, y = dx * fx + dz * fz;
      const k = Math.min(1, dist / 120) / Math.max(1e-3, dist);
      const R = 46;
      this.radarBlip.style.left = 60 + x * k * R + 'px';
      this.radarBlip.style.top = 60 - y * k * R + 'px';
      const up = t.pos.y - p.pos.y;
      this.radarDist.textContent = Math.round(Math.hypot(dist, up)) + 'm' + (up > 4 ? ' ▲' : up < -4 ? ' ▼' : '');
      this.radarEl.classList.toggle('near', dist < 15);
    },

    _setMarkers(list) {
      this.markerLayer.innerHTML = '';
      this.markers = list.map((m) => {
        const node = el('div', { class: 'marker' });
        node.innerHTML = SL.icon(m.icon) + '<span class="dist"></span>';
        this.markerLayer.appendChild(node);
        return { ...m, node, dist: node.querySelector('.dist') };
      });
    },

    _titleCard(e) {
      const t = this.titleCard;
      t.innerHTML = '';
      t.append(el('div', { class: 'c', text: e.chapter || '' }), el('div', { class: 't gradient-text', text: e.title }), el('div', { class: 'line' }), el('div', { class: 's', text: e.subtitle || '' }));
      t.classList.remove('show');
      void t.offsetWidth;
      t.classList.add('show');
      clearTimeout(this._tcTimer);
      this._tcTimer = setTimeout(() => t.classList.remove('show'), e.duration * 1000);
    },

    /** Party strip: the heroes you can switch to, their health, and the switch button on the next one. */
    _buildParty() {
      const b = this.battle;
      this.partyEl.innerHTML = '';
      this.partyCards = [];
      const party = b.party || [];
      this.partyEl.hidden = party.length < 2;
      for (const f of party) {
        const img = el('img');
        img.src = SL.Portraits.get(f.def.id, f.formIndex, f.wardrobe);
        const fill = el('i');
        const key = el('span', { class: 'pk' });
        const card = el('div', { class: 'pcard' }, [el('div', { class: 'pp' }, [img]), el('div', { class: 'phb' }, [fill]), key]);
        card.style.setProperty('--pc', f.def.appearance.portraitColor || '#ff8a1c');
        this.partyEl.appendChild(card);
        this.partyCards.push({ f, card, fill, key, img, last: {} });
      }
    },

    _updateParty() {
      const b = this.battle;
      if (!this.partyCards.length) return;
      const next = b.nextPartyMember ? b.nextPartyMember(1) : null;
      for (const c of this.partyCards) {
        const f = c.f, L = c.last;
        const hp = f.alive ? U.clamp01(f.hp / f.hpMax) : 0;
        if (Math.abs((L.hp ?? -1) - hp) > 0.002) {
          c.fill.style.width = hp * 100 + '%';
          L.hp = hp;
        }
        const active = f === b.player;
        if (L.active !== active) {
          c.card.classList.toggle('active', active);
          L.active = active;
        }
        if (L.alive !== f.alive) {
          c.card.classList.toggle('down', !f.alive);
          L.alive = f.alive;
        }
        const isNext = f === next;
        const ready = isNext && b.canSwitchTo(f);
        if (L.next !== isNext || L.ready !== ready) {
          c.key.innerHTML = isNext ? SL.glyph('partyNext') : '';
          c.card.classList.toggle('ready', ready);
          L.next = isNext;
          L.ready = ready;
        }
        if (L.form !== f.formIndex) {
          c.img.src = SL.Portraits.get(f.def.id, f.formIndex, f.wardrobe);
          L.form = f.formIndex;
        }
        const held = f.state === 'held';
        if (L.held !== held) {
          c.card.classList.toggle('danger', held);
          L.held = held;
        }
        // a boss has turned its attention to this hero: the card glows
        const hunted = f.alive && b.fighters.some((e) => e.alive && e.team !== f.team && e.target === f && (e.def.boss || (e.tags && e.tags.boss)));
        if (L.hunted !== hunted) {
          c.card.classList.toggle('hunted', hunted);
          L.hunted = hunted;
        }
      }
    },

    /** The radial skill wheel: icons around a ring, locked entries greyed with a padlock and the reason. */
    _updateRadial() {
      const r = this.battle.radial;
      const open = !!(r && r.open);
      this.radialEl.hidden = !open;
      if (!open) {
        this.radialSig = '';
        return;
      }
      const sig = r.entries.map((e) => e.id + (e.locked || '') + e.affordable + (e.cooldown > 0)).join('|');
      if (sig !== this.radialSig) {
        this.radialSig = sig;
        this.radialEl.innerHTML = '';
        const n = r.entries.length;
        this.radialItems = r.entries.map((e, i) => {
          const a = (i / n) * Math.PI * 2;
          const node = el('div', { class: 'rad-item' + (e.locked ? ' locked' : '') + (!e.affordable ? ' poor' : '') + (e.context ? ' context' : '') });
          node.style.left = 50 + Math.sin(a) * 38 + '%';
          node.style.top = 50 - Math.cos(a) * 38 + '%';
          node.innerHTML = '<div class="ic">' + SL.icon(e.locked ? 'lock' : e.icon) + '</div><div class="nm"></div><div class="cost"></div><div class="cd"></div>';
          node.querySelector('.nm').textContent = e.label;
          node.querySelector('.cost').innerHTML = e.cost ? '<i></i>'.repeat(Math.max(1, Math.round(e.cost / 20))) : '';
          this.radialEl.appendChild(node);
          return { node, cd: node.querySelector('.cd') };
        });
        this.radialCenter = el('div', { class: 'rad-center' });
        this.radialEl.appendChild(this.radialCenter);
      }
      r.entries.forEach((e, i) => {
        const it = this.radialItems[i];
        if (!it) return;
        it.node.classList.toggle('sel', i === r.selected);
        const frac = e.cooldown > 0 && e.cooldownMax ? e.cooldown / e.cooldownMax : 0;
        it.cd.style.height = frac * 100 + '%';
      });
      const e = r.entries[r.selected];
      const text = e ? e.label + (e.locked ? ' — ' + e.locked : e.hint ? ' — ' + e.hint : !e.affordable ? ' — not enough ki' : e.cooldown > 0 ? ' — recharging' : this._aimText(e)) : 'Choose';
      if (this.radialCenter.textContent !== text) this.radialCenter.textContent = text;
    },

    /** Where the selected wheel entry will go: the locked target, the crosshair, around you, or a named objective. */
    _aimText(e) {
      const p = this.battle.player;
      if (!p) return '';
      if (e.aim === 'area') return ' — all around you';
      if (e.aim === 'self') return ' — on yourself';
      if (e.aim === 'environment') return e.targetName ? ' → ' + e.targetName : '';
      if (e.aim !== 'target') return '';
      const lt = p.aimTarget ? p.aimTarget() : p.target;
      if (lt && lt.alive) return ' → ' + (lt.isProp ? lt.def.name : lt.name || lt.def.name);
      return ' → where you aim';
    },

    /**
     * The camera / aim state in two words and the key that changes it: TARGET LOCKED
     * (Tab: free camera), LOCKED ON <object>, or FREE CAMERA (Tab: lock target). Shown
     * whenever there is something that could be locked; until the player has used
     * Lock-On twice it stays up, afterwards it appears for a moment on each change.
     */
    /**
     * The lock-on lesson, taught ONCE (owner, playtest round 2: "annoying when it appears
     * constantly"). The first time the player is in a fight with something to lock, the chip
     * says TARGET LOCKED · Tab Free Camera; when they press it, FREE CAMERA · Tab Lock Target;
     * when they lock again the lesson is done — `seen.prompts.lockOnHint` is saved and the chip
     * never appears again, in this mission or any other. If they never press it, the chip
     * retires by itself after 20 seconds on screen. Resetting the control hints (Settings →
     * Gameplay, or the developer menu) brings it back.
     */
    _updateAimChip(p, lt, inFight) {
      const b = this.battle;
      const chip = this.aimChip;
      const seen = SL.Save && SL.Save.data ? SL.Save.data.seen.prompts : {};
      const limited = (b.playerLimits && b.playerLimits.target === false) || !SL.Targeting;
      let sig = '', html = '';
      if (inFight && !limited && !seen.lockOnHint && SL.Settings.data.hud.tips !== 'off') {
        const key = SL.glyph('target');
        if (lt && lt.alive) {
          sig = 'lock';
          html = lt.isProp
            ? '<b class="obj">LOCKED ON ' + String(lt.def.name).toUpperCase() + '</b>' + key + '<span>Free Camera</span>'
            : '<b class="lk">TARGET LOCKED</b>' + key + '<span>Free Camera</span>';
        } else if (p.lockMode === 'free') {
          // only worth saying when there is something to lock onto
          if (!this._candCache || b.frame - this._candCache.frame > 20) this._candCache = { frame: b.frame, any: SL.Targeting.candidates(b, p).length > 0 };
          if (this._candCache.any) {
            sig = 'free';
            html = '<b>FREE CAMERA</b>' + key + '<span>Lock Target</span>';
          }
        }
      }
      const now = performance.now() / 1000;
      const L = (this.lockLesson = this.lockLesson || { freed: false, relocked: false, shown: 0, last: now, doneAt: 0 });
      if (sig !== this.aimSig) {
        // the player's own toggle (lock → free, then free → lock) is what teaches it
        if (this.aimSig === 'lock' && sig === 'free') L.freed = true;
        if (this.aimSig === 'free' && sig === 'lock' && L.freed) L.relocked = true;
        this.aimSig = sig;
        if (html) chip.innerHTML = html;
      }
      if (sig && !L.doneAt) L.shown += Math.min(0.1, Math.max(0, now - L.last));
      L.last = now;
      if (!L.doneAt && (L.relocked || L.shown > 20)) {
        L.doneAt = now;
        seen.lockOnHint = true;
        if (SL.Save && SL.Save.write) SL.Save.write();
      }
      // shown only during the lesson; once learned it lingers a moment, then goes for good
      const show = !!sig && (!L.doneAt || now - L.doneAt < 1.5);
      const want = show ? 0.78 : 0;
      if (chip.style.opacity != want) chip.style.opacity = want;
    },

    /**
     * Flight controls, the first time the player is flying: move, ascend, descend, boost,
     * with the keys the player actually has bound. It goes once the player has flown up
     * and down (or after a while) and does not come back.
     */
    _updateFlightHint(p, inFight) {
      const hint = this.flightHint;
      const seen = SL.Save && SL.Save.data ? SL.Save.data.seen.prompts : {};
      const st = this.flightHintState;
      const flying = inFight && !p.grounded && p.canFly && p.canFly() && !(this.battle.playerLimits && this.battle.playerLimits.up === false);
      if (!st) {
        if (!flying || seen.flightHint || SL.Settings.data.hud.tips === 'off') return;
        this.flightHintState = { t0: performance.now() / 1000, up: false, down: false, done: 0 };
        const g = (a) => SL.glyph(a);
        hint.innerHTML = '<span>' + g('moveF') + g('moveL') + g('moveB') + g('moveR') + ' Move</span><span>' + g('ascend') + ' Ascend</span><span>' + g('descend') + ' Descend</span><span>' + g('boost') + ' Boost</span>';
        hint.style.opacity = 0.9;
        return;
      }
      if (st.done) {
        if (performance.now() / 1000 - st.done > 0.6) hint.style.opacity = 0;
        return;
      }
      const it = p.intent || {};
      if (flying && it.up) st.up = true;
      if (flying && it.down) st.down = true;
      hint.style.opacity = inFight ? 0.9 : 0;
      if ((st.up && st.down) || performance.now() / 1000 - st.t0 > 16) {
        st.done = performance.now() / 1000;
        seen.flightHint = true;
        if (SL.Save.write) SL.Save.write();
      }
    },

    _updateThreats(p, inFight) {
      const b = this.battle;
      let n = 0;
      if (inFight) {
        for (const e of b.enemiesOf(p)) {
          if (n >= this.threatEls.length) break;
          if (!e.alive || e.hidden || e.target !== p || e === p.target) continue;
          const pl = e.controller && e.controller.plan;
          const winding = (e.state === 'attack' && e.stateFrame <= (e.sd.startup || 0) + 1) || e.state === 'beamCharge' || (pl && pl.type === 'blast' && pl.tell > 0);
          if (!winding) continue;
          const pr = b.camera.project(e.chest(), {});
          if (pr.onScreen) continue;
          let nx = pr.ndcX, ny = pr.ndcY;
          if (pr.behind) {
            nx = -nx;
            ny = -ny;
          }
          const ang = Math.atan2(nx, ny);
          const w = window.innerWidth, h = window.innerHeight;
          const r = Math.min(w, h) * 0.36;
          const node = this.threatEls[n++];
          node.hidden = false;
          node.style.left = w / 2 + Math.sin(ang) * r + 'px';
          node.style.top = h / 2 - Math.cos(ang) * r + 'px';
          node.style.transform = 'rotate(' + ang + 'rad)';
        }
      }
      for (let i = n; i < this.threatEls.length; i++) if (!this.threatEls[i].hidden) this.threatEls[i].hidden = true;
    },

    _skillSig(p) {
      return JSON.stringify(p.lockedSlots || {}) + JSON.stringify(p.lockedForms || {}) + JSON.stringify(this.battle.playerLimits || {}) + '|' + this.battle.rules.allowTransform + this.battle.rules.allowUltimates;
    },

    /** Small icon card when the story teaches a new skill (no text box). */
    _onLearned(e) {
      const b = this.battle;
      if (!b || e.fighter !== b.player) return;
      this._wake('skills');
      // a new technique is an important unlock: shown unless Notifications is Off (the skill panel still pops it in)
      if (SL.Settings.data.hud.notifications === 'off') return;
      const sp = e.fighter.def.specials || {};
      const names = { flight: ['fly', 'FLIGHT'], guard: ['guard', 'GUARD'], dodge: ['dodge', 'DODGE'], blast: ['ball', 'KI BLAST'], charge: ['transform', 'CHARGE KI'], heavy: ['fist', 'HEAVY'], boost: ['rush', 'BOOST'], kaioken3: ['transform', 'KAIOKEN X3'] };
      let icon = 'ultimate', label = e.key.toUpperCase();
      if (names[e.key]) [icon, label] = names[e.key];
      else if (sp[e.key]) {
        icon = sp[e.key].icon || 'beam';
        label = sp[e.key].name.toUpperCase();
      } else if (e.key === 'transform') {
        const next = e.fighter.def.forms[e.fighter.formIndex + 1];
        icon = 'transform';
        label = next ? next.name.toUpperCase() : 'TRANSFORM';
      }
      const node = el('div', { class: 'hud-learned' });
      node.innerHTML = '<span class="ic">' + SL.icon(icon) + '</span><span class="nm"></span><span class="new">NEW</span>';
      node.querySelector('.nm').textContent = label;
      this.root.appendChild(node);
      setTimeout(() => node.classList.add('out'), 2200);
      setTimeout(() => node.remove(), 2800);
    },

    _buildSkills(p) {
      const s = this.skills;
      s.innerHTML = '';
      const cards = [];
      // the active form's techniques (Super Saiyan 2 Gohan's Super Kamehameha), including story overrides
      const sp = { special1: p.specFor('special1'), special2: p.specFor('special2'), ultimate: p.specFor('ultimate') };
      const add = (slot, action, spec, cls, icon, name, cost) => {
        const node = el('div', { class: 'skill ' + (cls || '') });
        node.innerHTML = '<div class="key"></div><div class="ic">' + SL.icon(icon) + '</div><div class="nm"></div><div class="cost"></div>';
        node.querySelector('.nm').textContent = name;
        const pips = Math.max(1, Math.round(cost / 20));
        node.querySelector('.cost').innerHTML = '<i></i>'.repeat(pips);
        const tag = el('div', { class: 'tag' });
        tag.hidden = true;
        node.appendChild(tag);
        node.querySelector('.key').innerHTML = SL.Settings.data.hud.controlHints ? SL.glyph(action) : '';
        s.appendChild(node);
        cards.push({ node, slot, spec, cost, baseCost: cost, action, tag, costEl: node.querySelector('.cost'), nameEl: node.querySelector('.nm') });
      };
      // techniques locked by the story or the rules are not shown at all
      // (mission input limits hide a technique for the current drill in the same way)
      const lim = (p === this.battle.player && this.battle.playerLimits) || {};
      const lock = Object.assign({}, p.lockedSlots || {});
      if (lim.s1 === false) lock.special1 = true;
      if (lim.s2 === false) lock.special2 = true;
      if (lim.ult === false) lock.ultimate = true;
      if (lim.transform === false) lock.transform = true;
      const rules = this.battle.rules;
      if (sp.special1 && !lock.special1) add('special1', 'special1', sp.special1, '', sp.special1.icon || 'beam', sp.special1.name, sp.special1.kiCost);
      if (sp.special2 && !lock.special2) add('special2', 'special2', sp.special2, '', sp.special2.icon || 'ball', sp.special2.name, sp.special2.kiCost);
      if (sp.ultimate && !lock.ultimate && rules.allowUltimates) add('ultimate', 'ultimate', sp.ultimate, 'ult', sp.ultimate.icon || 'ultimate', sp.ultimate.name, sp.ultimate.kiCost);
      let next = rules.allowTransform && !lock.transform ? p.def.forms[p.formIndex + 1] : null;
      if (next && p.lockedForms && p.lockedForms[next.id]) next = null;
      if (next) add('transform', 'transform', null, 'tf', 'transform', next.name, next.kiCost);
      else if (p.formIndex > 0) add('revert', 'revert', null, 'tf', 'transform', 'Power Down', 0);
      // a technique that was not on the panel before pops in (story progression)
      const prev = this.skillSlotsShown || null;
      if (prev) for (const c of cards) if (!prev.includes(c.slot)) c.node.classList.add('appear');
      this.skillSlotsShown = cards.map((c) => c.slot);
      this.skillCards = cards;
      this.skillFormIndex = p.formIndex;
      this.skillSig = this._skillSig(p);
    },

    update(dt) {
      const b = this.battle;
      if (!b || !this.root) return;
      const p = b.player;
      if (!p) return;
      const hudSet = SL.Settings.data.hud;
      const hideForCinema = b.camera.inShot && !this.struggleMode;
      const intro = b.phase === 'intro' || b.phase === 'victory' || b.phase === 'end' || (b.mission && b.inputLocked && !this.struggleMode);
      const hideBars = hideForCinema || intro;
      // Display & Immersion (prompts, struggles and the skill wheel are never affected)
      const V = this._visibility(p, hudSet);
      const P1 = this.p1, P2 = this.p2;
      this.p1.root.style.opacity = hideBars ? 0 : 1;
      this.p2.root.style.opacity = hideBars || !V.enemy ? 0 : 1;
      for (const n of [P1.port, P1.nameRow, P1.bodyTag, P1.hp, P1.strain]) this._part(n, V.hp);
      // the mechanic meter (pride, rage…) is a resource: it rests with ki
      this._part(P1.ki, V.ki);
      this._part(P1.mech, V.ki);
      this._part(P1.stam, V.stam);
      const hpMin = hudSet.playerHealth !== 'full';
      P1.root.classList.toggle('hp-min', hpMin);
      P1.root.classList.toggle('ki-min', hudSet.ki === 'minimal' || (hudSet.ki === 'contextual' && hpMin));
      P1.root.classList.toggle('st-min', hudSet.stamina === 'minimal' || (hudSet.stamina === 'contextual' && hpMin));
      P2.root.classList.toggle('hp-min', hudSet.enemyHealth === 'minimal');
      P2.root.classList.toggle('res-off', hudSet.enemyHealth === 'minimal');
      this.skills.classList.toggle('min', hudSet.skillPanel === 'minimal' || hudSet.skillPanel === 'contextual');
      this.objectives.classList.toggle('min', hudSet.objectives !== 'full');
      this.skills.style.opacity = hideBars || !V.skills || this.struggleMode ? 0 : 1;
      this.objectives.style.opacity = hideBars || !V.obj ? 0 : 1;
      this.training.style.opacity = hideBars ? 0 : 1;
      this.prompts.style.opacity = b.inputLocked || hideForCinema || b.phase !== 'fight' ? 0 : 1;
      this.cueBox.style.opacity = b.phase !== 'fight' || b.paused ? 0 : 1;
      // a meter the story asks for during a cutscene sits bottom right with the cue, out of the shot
      this.struggle.classList.toggle('cine', b.camera.inShot && this.struggleMode === 'mission');

      this._updatePanel(this.p1, p);
      this.partyEl.style.opacity = hideBars || !V.rest ? 0 : 1;
      this._updateParty();
      this._updateRadial();
      const t = p.target;
      this.p2.root.hidden = !t || t.tags && t.tags.cinematic;
      if (t) this._updatePanel(this.p2, t);
      if (b.mission && this.enemyCountDirty !== false) {
        const n = b.enemiesOf(p).filter((e) => !(e.tags && e.tags.cinematic)).length;
        if (this.p2.last.count !== n) {
          this.p2.count.innerHTML = n > 1 ? '<i></i>'.repeat(Math.min(12, n)) : '';
          this.p2.last.count = n;
        }
      }

      if (!this.timer.hidden) {
        const left = Math.max(0, Math.ceil(b.rules.timeLimit - b.fightTime));
        if (this._lastTime !== left) {
          this.timer.textContent = left;
          this._lastTime = left;
        }
      }

      // combo
      const hits = p.combo.hits;
      // a story scene is not a fight: the counter from the last exchange does not hang over it
      if (b.mission && b.inputLocked && !this.struggleMode) this.comboFade = 0;
      if (hudSet.comboCounter && hits >= 2 && !(b.mission && b.inputLocked && !this.struggleMode)) {
        if (hits !== this.comboShown) {
          this.comboN.textContent = hits;
          this.comboD.textContent = U.fmtInt(p.combo.damage);
          this.combo.classList.remove('bump');
          void this.combo.offsetWidth;
          this.combo.classList.add('bump');
          this.comboShown = hits;
        }
        this.combo.style.opacity = 1;
        this.comboFade = 1.2;
      } else {
        this.comboFade -= dt;
        if (this.comboFade <= 0) {
          this.combo.style.opacity = 0;
          this.comboShown = 0;
        }
      }

      // skills
      if (!this.skillCards || this.skillFormIndex !== p.formIndex || this.skillSig !== this._skillSig(p)) this._buildSkills(p);
      for (const c of this.skillCards) {
        if (c.spec) {
          // live cost: Instant Transmission fatigue, Instant Kamehameha follow-up
          const cost = p.skillCost(c.slot);
          if (cost !== c.cost) {
            c.cost = cost;
            const pips = Math.max(1, Math.round(cost / 20));
            const extra = Math.max(0, pips - Math.max(1, Math.round(c.baseCost / 20)));
            c.costEl.innerHTML = '<i></i>'.repeat(pips - extra) + '<i class="fatigue"></i>'.repeat(extra);
          }
          const instant = c.spec.instant && p.followFrames > 0;
          if (c.instant !== instant) {
            c.instant = instant;
            c.tag.hidden = !instant;
            c.tag.textContent = 'INSTANT';
          }
        }
        const gated = c.spec && c.spec.requiresMech && !(p.mech && p.mech[c.spec.requiresMech]);
        if (c.gated !== gated) {
          c.node.classList.toggle('gated', gated);
          c.gated = gated;
        }
        const can = c.slot === 'revert' ? true : (p.infiniteKi || p.ki >= c.cost) && !gated;
        const cd = c.slot !== 'transform' && c.slot !== 'revert' && p.cooldowns[c.slot] > 0;
        const off = !can || cd || (c.slot === 'transform' && !b.rules.allowTransform) || (c.slot === 'ultimate' && !b.rules.allowUltimates);
        if (c.off !== off) {
          c.node.classList.toggle('off', off);
          c.off = off;
        }
        const ready = !off && c.slot === 'ultimate';
        if (c.ready !== ready) {
          c.node.classList.toggle('ready', ready);
          c.ready = ready;
        }
      }

      // lock-on marker (a fighter, or a locked object such as a pod) / free-aim crosshair
      const lt = p.aimTarget ? p.aimTarget() : t;
      const inFight = !hideBars && b.phase === 'fight' && !this.struggleMode && !b.inputLocked;
      const freeAim = inFight && !lt && p.lockMode === 'free';
      if (this.crosshair.hidden === freeAim) this.crosshair.hidden = !freeAim;
      this.lock.classList.toggle('object', !!(lt && lt.isProp));
      // Lock-On UI changes the marker only: the lock itself, the camera and the aim are untouched
      this.lock.classList.toggle('min', hudSet.lockOn === 'minimal');
      const showLock = hudSet.lockOn !== 'hidden' && lt && lt.alive && inFight;
      if (showLock) {
        const pr = b.camera.project(lt.chest(), {});
        if (pr.onScreen) {
          this.lock.hidden = !V.lockRing;
          this.offArrow.hidden = true;
          const d = p.pos.distanceTo(lt.pos);
          const size = U.clamp(90 - d * 1.1, 34, 80);
          this.lock.style.left = pr.x + 'px';
          this.lock.style.top = pr.y + 'px';
          this.lock.style.width = this.lock.style.height = size + 'px';
          this.lock.style.margin = -size / 2 + 'px 0 0 ' + -size / 2 + 'px';
          const dy = lt.pos.y - p.pos.y;
          const alt = this.lock.firstChild;
          if (Math.abs(dy) > 6) {
            alt.className = 'alt ' + (dy > 0 ? 'up' : 'down');
            alt.textContent = (dy > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(dy)) + 'm';
          } else alt.textContent = '';
        } else {
          this.lock.hidden = true;
          this.offArrow.hidden = false;
          let nx = pr.ndcX, ny = pr.ndcY;
          if (pr.behind) {
            nx = -nx;
            ny = -ny;
          }
          const ang = Math.atan2(nx, ny);
          const w = window.innerWidth, h = window.innerHeight;
          const r = Math.min(w, h) * 0.42;
          this.offArrow.style.left = w / 2 + Math.sin(ang) * r + 'px';
          this.offArrow.style.top = h / 2 - Math.cos(ang) * r + 'px';
          this.offArrow.style.transform = 'rotate(' + ang + 'rad)';
        }
      } else {
        this.lock.hidden = true;
        this.offArrow.hidden = true;
      }

      this._updateAimChip(p, lt, inFight);
      const devOn = !!(SL.Dev && SL.Dev.active && SL.Settings.data.dev.overlay);
      if (this.devOverlay.hidden === devOn) this.devOverlay.hidden = !devOn;
      if (devOn && b.frame % 6 === 0) this.devOverlay.textContent = SL.Dev.overlayText(b);
      this._updateFlightHint(p, inFight);
      this._updateThreats(p, inFight);

      if (this.radarTarget) this._updateRadar(b, p);

      for (const m of this.markers) {
        const obj = m.obj;
        if (!obj.alive) {
          m.node.hidden = true;
          continue;
        }
        const pr = b.camera.project(obj.pos, {});
        m.node.hidden = !pr.onScreen || hideBars;
        if (pr.onScreen) {
          m.node.style.left = pr.x + 'px';
          m.node.style.top = pr.y - 26 + 'px';
          m.dist.textContent = Math.round(p.pos.distanceTo(obj.pos)) + 'm';
        }
      }

      if (this.struggleMode === 'clash' && b.clash.active) {
        const prog = b.clash.playerProgress();
        this.structTrack.style.width = prog * 100 + '%';
        this.structKnob.style.left = prog * 100 + '%';
        this.struggle.classList.toggle('pulse', b.clash.active.mashPulse > 0.5);
      }

      if (!this.training.hidden) {
        const ts = this.trainingStats;
        const dummy = b.fighters.find((f) => f.team !== p.team);
        this.training.innerHTML =
          'Last hit <b>' + U.fmtInt(ts.last) + '</b><br>Combo damage <b>' + U.fmtInt(p.combo.hits ? p.combo.damage : ts.combo) + '</b><br>Best combo <b>' + ts.best + '</b> hits' +
          (dummy ? '<br>Dummy <b>' + dummy.state + '</b>' : '') + '<br>' + SL.glyph('resetPos') + ' reset';
      }
    },

    _updatePanel(P, f) {
      const L = P.last;
      if (L.level !== f.formLevel && L.id === f.id && L.form === f.formIndex) {
        P.badge.textContent = f.formLabel;
        P.badge.classList.remove('level');
        void P.badge.offsetWidth;
        P.badge.classList.add('level');
        L.level = f.formLevel;
      }
      if (L.id !== f.id || L.form !== f.formIndex) {
        P.img.src = SL.Portraits.get(f.def.id, f.formIndex, f.wardrobe);
        P.port.style.setProperty('--pc', f.def.appearance.portraitColor || '#ff8a1c');
        P.name.textContent = f.name;
        // a mind in somebody else's body says so on the plate, in words and with its own face
        const mind = f.mind;
        const swapped = !!(mind && mind.own && mind.own !== f);
        P.root.classList.toggle('swapped', swapped);
        if (P.bodyTag) {
          P.bodyTag.hidden = !swapped;
          P.bodyTag.textContent = swapped ? 'IN ' + String(f.def.name).toUpperCase() + "'S BODY" : '';
        }
        if (P.mindImg) {
          P.mindImg.hidden = !swapped;
          if (swapped) P.mindImg.src = SL.Portraits.get(mind.id, 0);
        }
        const showBadge = f.formIndex > 0;
        P.badge.hidden = !showBadge;
        P.badge.textContent = showBadge ? f.formLabel : '';
        L.level = f.formLevel;
        P.badge.className = 'form-badge' + (f.form.id === 'kaioken' ? ' kaioken' : '');
        const m = SL.mech(f, 'hud');
        P.mech.hidden = !m;
        L.id = f.id;
        L.form = f.formIndex;
        L.hp = -1;
      }
      const hpF = U.clamp01(f.hp / f.hpMax);
      if (Math.abs(L.hp - hpF) > 0.0005) {
        const w = hpF * 100 + '%';
        P.fill.style.width = w;
        if (hpF < L.hp || L.hp < 0) P.trail.style.width = w;
        else P.trail.style.width = w;
        P.hp.classList.toggle('mid', hpF < 0.5 && hpF >= 0.25);
        P.hp.classList.toggle('low', hpF < 0.25);
        L.hp = hpF;
      }
      const ki = f.ki;
      if (Math.abs((L.ki || 0) - ki) > 0.2) {
        const per = f.kiMax / 5;
        for (let i = 0; i < 5; i++) {
          const v = U.clamp01((ki - i * per) / per);
          P.segs[i].fi.style.width = v * 100 + '%';
          P.segs[i].s.classList.toggle('full', v >= 1);
        }
        L.ki = ki;
      }
      const st = f.stamina / f.staminaMax;
      if (Math.abs((L.st || 0) - st) > 0.004) {
        P.stamI.style.width = st * 100 + '%';
        P.stam.classList.toggle('low', st < 0.25);
        L.st = st;
      }
      const sd = f._strainDef && f._strainDef();
      const strain = sd ? f.strain / sd.max : 0;
      if (Math.abs((L.strain || 0) - strain) > 0.004) {
        P.strain.style.display = strain > 0.005 ? '' : 'none';
        P.strainI.style.width = strain * 100 + '%';
        P.strain.classList.toggle('hot', !!sd && f.strain > sd.reentryAt);
        L.strain = strain;
      }
      const m = SL.mech(f, 'hud');
      if (m) {
        P.mechLabel.textContent = m.label;
        P.mechI.style.width = U.clamp01(m.value) * 100 + '%';
        P.mechI.style.background = m.color;
        P.mech.classList.toggle('active', !!m.active);
        P.mech.style.color = m.active ? m.color : '';
      }
    },
  });
})();
