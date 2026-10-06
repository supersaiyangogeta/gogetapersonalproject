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
    const port = el('div', { class: 'fport' }, [el('img', { alt: '' })]);
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
    const mechLabel = el('span');
    const mechI = el('i');
    const mech = el('div', { class: 'mechbar' }, [mechLabel, el('div', { class: 'mtrack' }, [mechI])]);
    const count = el('div', { class: 'enemy-count' });
    const bars = el('div', { class: 'fbars' }, [el('div', { class: 'fname-row' }, [name, badge]), hp, ki, stam, mech, count]);
    const root = el('div', { class: 'fpanel ' + side }, [port, bars]);
    return { root, port, img: port.querySelector('img'), name, badge, hp, fill, trail, ki, segs, stam, stamI, mech, mechLabel, mechI, count, last: {} };
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
      this.objectives = el('div', { class: 'hud-objectives' });
      this.comboN = el('div', { class: 'n' });
      this.comboD = el('div', { class: 'd' });
      this.combo = el('div', { class: 'hud-combo' }, [this.comboN, el('div', { class: 'l', text: 'HITS' }), this.comboD]);
      this.banner = el('div', { class: 'hud-banner gradient-text' });
      this.center = el('div', { class: 'hud-center gradient-text' });
      this.skills = el('div', { class: 'hud-skills' });
      this.prompts = el('div', { class: 'hud-prompt' });
      this.lock = el('div', { class: 'lock' }, [el('span', { class: 'alt' })]);
      this.offArrow = el('div', { class: 'offarrow' });
      this.markerLayer = el('div');
      this.dmgLayer = el('div');
      this.structTrack = el('i');
      this.structKnob = el('b');
      this.structLabel = el('span');
      this.structKey = el('span');
      this.struggle = el('div', { class: 'hud-struggle' }, [el('div', { class: 'track' }, [this.structTrack, this.structKnob]), el('div', { class: 'mash' }, [this.structKey, this.structLabel])]);
      this.training = el('div', { class: 'hud-training' });
      this.titleCard = el('div', { class: 'titlecard' });
      this.fadeEl = el('div', { class: 'hud-fade' });
      root.append(this.p1.root, this.p2.root, this.timer, this.objectives, this.combo, this.banner, this.center, this.skills, this.prompts, this.lock, this.offArrow, this.markerLayer, this.dmgLayer, this.struggle, this.training, this.titleCard, this.fadeEl);
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

      const b = battle;
      b.on('say', (e) => SL.Subtitles.show(e.speaker, e.line, e.duration));
      b.on('clearSubtitles', () => SL.Subtitles.clear());
      b.on('ready', () => this.showCenter('READY', 'show'));
      b.on('fightStart', () => this.showCenter('FIGHT!', 'show'));
      b.on('finishKO', (r) => this.showCenter(r.reason === 'time' ? 'TIME' : 'K.O.', 'hold'));
      b.on('missionFailed', () => this.showCenter('DEFEATED', 'hold'));
      b.on('end', () => this.showCenter('', ''));
      b.on('victoryStart', () => this.showCenter('', ''));
      b.on('special', (e) => this._onSpecial(e));
      b.on('formChanged', (e) => {
        if (e.form.short && SL.Settings.data.gameplay.moveNames && e.fighter === b.player) this.showBanner(e.form.short, false);
        this.skillCards = null;
      });
      b.on('damage', (e) => this._onDamage(e));
      b.on('vanish', (e) => this._word(e.fighter, 'VANISH'));
      b.on('perfectGuard', (e) => this._word(e.fighter, 'PERFECT'));
      b.on('guardBreak', (e) => this._word(e.fighter, 'GUARD BREAK'));
      b.on('deflect', (e) => this._word(e.fighter, 'DEFLECT'));
      b.on('burst', (e) => this._word(e.fighter, 'ESCAPE'));
      b.on('chase', (e) => {
        if (e.fighter === b.player) this._word(e.fighter, 'CHASE');
      });
      b.on('denied', (e) => {
        if (e.fighter !== b.player) return;
        this.p1.ki.classList.remove('denied');
        void this.p1.ki.offsetWidth;
        this.p1.ki.classList.add('denied');
      });
      b.on('mechanic', (e) => this._onMechanic(e));
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
          this._struggleLabel(e.label);
        }
      });
      b.on('objectives', (e) => this._renderObjectives(e));
      b.on('prompt', (e) => this._onPrompt(e));
      b.on('markers', (e) => this._setMarkers(e.list));
      b.on('titleCard', (e) => this._titleCard(e));
      b.on('fade', (e) => {
        this.fadeEl.style.transition = 'opacity ' + e.seconds + 's';
        this.fadeEl.style.opacity = e.to === 'black' ? 1 : 0;
      });
      b.on('missionPhase', () => {
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
      this.structKey.innerHTML = SL.glyph(this.struggleMode === 'mission' ? 'ultimate' : 'special1');
      this.structLabel.textContent = label || (mode === 'hold' ? 'HOLD!' : 'MASH!');
    },

    _onSpecial(e) {
      if (!SL.Settings.data.gameplay.moveNames) return;
      const b = this.battle;
      if (e.fighter !== b.player && e.fighter.target !== b.player) return;
      if (e.spec.type === 'teleport' && e.fighter !== b.player) return;
      this.showBanner(e.spec.name, e.fighter !== b.player);
    },

    _onMechanic(e) {
      const b = this.battle;
      const f = e.fighter;
      const lines = { zenkai: 'zenkai', prideMax: 'prideMax', rage: 'rage', fury: 'fury' };
      if (lines[e.kind]) b.say(f, f.def.id + '_' + lines[e.kind], 2.4);
      if (f === b.player && SL.Settings.data.gameplay.moveNames) {
        const label = { rage: 'BATTLE-HARDENED', prideMax: 'MAX PRIDE', zenkai: 'ZENKAI', fury: 'FURY' }[e.kind];
        if (label) this.showBanner(label, false);
      }
    },

    _onDamage(e) {
      const b = this.battle;
      if (!b) return;
      if (b.mode === 'training' && e.attacker === b.player) this.trainingStats.last = e.amount;
      const port = e.target === b.player ? this.p1.port : e.target === (b.player && b.player.target) ? this.p2.port : null;
      if (port && e.amount > 300) {
        port.classList.remove('hit');
        void port.offsetWidth;
        port.classList.add('hit');
      }
      if (!SL.Settings.data.hud.damageNumbers) return;
      if (!(e.attacker === b.player || e.target === b.player)) return;
      const pt = e.point || e.target.chest();
      const pr = b.camera.project(pt, {});
      if (!pr.onScreen) return;
      const cls = 'dmg' + (e.blocked ? ' blocked' : '') + (e.amount >= 1000 ? ' big' : '') + (e.target === b.player ? ' player' : '');
      const node = el('div', { class: cls, text: U.fmtInt(e.amount) });
      node.style.left = pr.x + U.rand(-18, 18) + 'px';
      node.style.top = pr.y - 30 + 'px';
      this._addTransient(node, 950);
    },

    _word(f, text) {
      const b = this.battle;
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
        const node = el('div', { class: 'prompt' });
        node.innerHTML = '<span class="glyph">' + SL.glyph(e.action) + '</span><span></span>';
        node.lastChild.textContent = e.label;
        this.prompts.appendChild(node);
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

    _buildSkills(p) {
      const s = this.skills;
      s.innerHTML = '';
      const cards = [];
      const sp = p.def.specials || {};
      const add = (slot, action, spec, cls, icon, name, cost) => {
        const node = el('div', { class: 'skill ' + (cls || '') });
        node.innerHTML = '<div class="key"></div><div class="ic">' + SL.icon(icon) + '</div><div class="nm"></div><div class="cost"></div>';
        node.querySelector('.nm').textContent = name;
        const pips = Math.max(1, Math.round(cost / 20));
        node.querySelector('.cost').innerHTML = '<i></i>'.repeat(pips);
        node.querySelector('.key').innerHTML = SL.Settings.data.hud.controlHints ? SL.glyph(action) : '';
        s.appendChild(node);
        cards.push({ node, slot, spec, cost, action });
      };
      if (sp.special1) add('special1', 'special1', sp.special1, '', sp.special1.icon || 'beam', sp.special1.name, sp.special1.kiCost);
      if (sp.special2) add('special2', 'special2', sp.special2, '', sp.special2.icon || 'ball', sp.special2.name, sp.special2.kiCost);
      if (sp.ultimate) add('ultimate', 'ultimate', sp.ultimate, 'ult', sp.ultimate.icon || 'ultimate', sp.ultimate.name, sp.ultimate.kiCost);
      const next = p.def.forms[p.formIndex + 1];
      if (next) add('transform', 'transform', null, 'tf', 'transform', next.name, next.kiCost);
      else if (p.formIndex > 0) add('revert', 'revert', null, 'tf', 'transform', 'Power Down', 0);
      this.skillCards = cards;
      this.skillFormIndex = p.formIndex;
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
      this.p1.root.style.opacity = hideBars ? 0 : 1;
      this.p2.root.style.opacity = hideBars ? 0 : 1;
      this.skills.style.opacity = hideBars || !hudSet.skillPanel || this.struggleMode ? 0 : 1;
      this.objectives.style.opacity = hideBars ? 0 : 1;
      this.prompts.style.opacity = b.inputLocked || hideForCinema || b.phase !== 'fight' ? 0 : 1;

      this._updatePanel(this.p1, p);
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
      if (hudSet.comboCounter && hits >= 2) {
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
      if (!this.skillCards || this.skillFormIndex !== p.formIndex) this._buildSkills(p);
      for (const c of this.skillCards) {
        const can = c.slot === 'revert' ? true : p.infiniteKi || p.ki >= c.cost;
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

      // lock-on marker
      const showLock = hudSet.lockOn && t && t.alive && !hideBars && b.phase === 'fight';
      if (showLock) {
        const pr = b.camera.project(t.chest(), {});
        if (pr.onScreen) {
          this.lock.hidden = false;
          this.offArrow.hidden = true;
          const d = p.distTo(t);
          const size = U.clamp(90 - d * 1.1, 34, 80);
          this.lock.style.left = pr.x + 'px';
          this.lock.style.top = pr.y + 'px';
          this.lock.style.width = this.lock.style.height = size + 'px';
          this.lock.style.margin = -size / 2 + 'px 0 0 ' + -size / 2 + 'px';
          const dy = t.pos.y - p.pos.y;
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
        const dummy = b.fighters.find((f) => f !== p);
        this.training.innerHTML =
          'Last hit <b>' + U.fmtInt(ts.last) + '</b><br>Combo damage <b>' + U.fmtInt(p.combo.hits ? p.combo.damage : ts.combo) + '</b><br>Best combo <b>' + ts.best + '</b> hits' +
          (dummy ? '<br>Dummy <b>' + dummy.state + '</b>' : '') + '<br>' + SL.glyph('resetPos') + ' reset';
      }
    },

    _updatePanel(P, f) {
      const L = P.last;
      if (L.id !== f.id || L.form !== f.formIndex) {
        P.img.src = SL.Portraits.get(f.def.id, f.formIndex);
        P.port.style.setProperty('--pc', f.def.appearance.portraitColor || '#ff8a1c');
        P.name.textContent = f.name;
        const showBadge = f.formIndex > 0;
        P.badge.hidden = !showBadge;
        P.badge.textContent = showBadge ? f.form.name : '';
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
