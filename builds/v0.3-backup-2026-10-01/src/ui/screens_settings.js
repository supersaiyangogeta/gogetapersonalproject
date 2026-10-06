/*
 * Settings screen generated from SL.Settings.SCHEMA, plus the control
 * rebinding grid (keyboard primary/secondary and gamepad).
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;

  const REBINDABLE = ['moveF', 'moveB', 'moveL', 'moveR', 'ascend', 'descend', 'boost', 'light', 'heavy', 'blast', 'guard', 'dodge', 'charge', 'special1', 'special2', 'ultimate', 'transform', 'revert', 'target', 'targetNext', 'targetPrev', 'partyNext', 'skillMenu', 'pause', 'resetPos'];
  const PAD_REBINDABLE = REBINDABLE.filter((a) => !a.startsWith('move'));

  /** opts.tab: the category to open on (e.g. 'hud' for Display & Immersion). */
  SL.Screens.settings = function (opts = {}) {
    const s = new SL.Screen('settings dark');
    const cats = SL.Settings.CATEGORIES;
    let tab = Math.max(0, cats.findIndex((c) => c[0] === opts.tab));
    const title = el('h1', { class: 'title-font gradient-text', text: 'Settings' });
    const tabs = el('div', { class: 'tabs' });
    const scroll = el('div', { class: 'scroll' });
    const footer = SL.UI.footer([['tabs', 'Category'], ['adjust', 'Change'], ['back', 'Save & Back']]);
    s.el.append(title, tabs, scroll, footer);

    const renderTabs = () => {
      tabs.innerHTML = '';
      tabs.insertAdjacentHTML('beforeend', '<span style="margin-right:6px">' + SL.menuGlyph('tabL') + '</span>');
      cats.forEach(([id, label], i) => {
        const t = el('div', { class: 'tab' + (i === tab ? ' active' : ''), text: label });
        t.addEventListener('click', () => {
          tab = i;
          build();
          SL.Audio.play('uiMove');
        });
        tabs.appendChild(t);
      });
      tabs.insertAdjacentHTML('beforeend', '<span style="margin-left:6px">' + SL.menuGlyph('tabR') + '</span>');
    };

    const build = () => {
      renderTabs();
      s.clearItems();
      scroll.innerHTML = '';
      const cat = cats[tab][0];
      const rows = el('div', { class: 'rows' });
      scroll.appendChild(rows);
      // developer rows beyond the master switch only exist while the mode is on
      // developer rows beyond the master switch only exist while the mode is on, and a secret
      // row only exists once the player has found it (see the typed code below)
      const secrets = SL.Settings.data.secrets || {};
      const schemaRows = SL.Settings.SCHEMA.filter((r) => r.cat === cat
        && (!r.dev || SL.Settings.data.dev.enabled)
        && (!r.secret || secrets[r.secret]));
      const items = [];
      for (const r of schemaRows) {
        const path = r.cat + '.' + r.key;
        const common = {
          label: r.label,
          desc: r.desc,
          get: () => SL.Settings.get(path),
          set: (v) => {
            SL.Settings.set(path, v);
            // switching the developer mode swaps the save slot and shows or hides its rows
            if (path === 'dev.enabled') setTimeout(build, 0);
          },
        };
        let item;
        if (r.type === 'choice') item = SL.UI.choiceRow(s, { ...common, options: r.options });
        else if (r.type === 'slider') item = SL.UI.sliderRow(s, { ...common, min: r.min, max: r.max, step: r.step, fmt: r.fmt });
        else item = SL.UI.toggleRow(s, common);
        items.push(item);
        rows.appendChild(item.node);
      }
      // a preset row changes the rows below it, and a row changes the preset: redraw them all
      if (cat === 'graphics' || cat === 'hud') {
        const renderAll = () => items.forEach((it) => it.render && it.render());
        items.forEach((it) => {
          const origR = it.onRight, origL = it.onLeft;
          it.onRight = () => {
            origR();
            renderAll();
          };
          it.onLeft = () => {
            origL();
            renderAll();
          };
          if (it.onSelect) {
            const os = it.onSelect;
            it.onSelect = () => {
              os();
              renderAll();
            };
          }
        });
      }
      if (cat === 'hud') {
        const again = SL.UI.actionRow(s, 'Experience Setup — compare Cinematic, Standard and Custom', () =>
          SL.UI.push(SL.Screens.visualSetup({ again: true, onDone: () => { SL.UI.pop(); build(); } })));
        scroll.appendChild(el('div', { class: 'rows', style: { marginTop: '10px' } }, [again.node]));
      }
      if (cat === 'controls') buildBindings(scroll);
      if (cat === 'dev' && SL.Settings.data.dev.enabled && SL.Screens.devMenu) {
        const open = SL.UI.actionRow(s, 'Open Developer Menu (mission & phase select, test save tools)', () => SL.UI.push(SL.Screens.devMenu()));
        scroll.appendChild(el('div', { class: 'rows' }, [open.node]));
      }
      const reset = SL.UI.actionRow(s, 'Reset ' + cats[tab][1] + ' to Defaults', () => {
        SL.Settings.resetCategory(cat);
        build();
      });
      scroll.appendChild(el('div', { class: 'rows' }, [reset.node]));
      s.focus(0, true);
    };

    const buildBindings = (container) => {
      const grid = el('div', { class: 'bind-grid', style: { marginTop: '18px' } });
      grid.append(el('div', { class: 'h', text: 'Action' }), el('div', { class: 'h', text: 'Key' }), el('div', { class: 'h', text: 'Alt Key' }), el('div', { class: 'h', text: 'Controller' }));
      REBINDABLE.forEach((action, r) => {
        grid.appendChild(el('div', { text: SL.Settings.ACTION_LABELS[action] }));
        const cells = [
          { device: 'keyboard', slot: 0 },
          { device: 'keyboard', slot: 1 },
          { device: 'gamepad', slot: 0 },
        ];
        cells.forEach((c, ci) => {
          const cell = el('div', { class: 'bind-cell' });
          const render = () => {
            if (c.device === 'gamepad' && !PAD_REBINDABLE.includes(action)) {
              cell.textContent = 'Left Stick';
              return;
            }
            const code = (SL.Settings.data.controls[c.device][action] || [])[c.slot];
            cell.textContent = code ? (c.device === 'gamepad' ? SL.Input.padLabel(code) : SL.Input.keyLabel(code)) : '—';
          };
          render();
          grid.appendChild(cell);
          const item = s.addItem(cell, {
            grid: { r, c: ci },
            onSelect: () => {
              if (c.device === 'gamepad' && !PAD_REBINDABLE.includes(action)) return;
              capture(c.device, action, c.slot, () => {
                s.items.forEach((it) => it.renderBinding && it.renderBinding());
              });
            },
          });
          item.renderBinding = render;
        });
      });
      container.appendChild(grid);
      const note = el('p', { class: 'hint', text: 'Select a slot, then press the new key or button. Esc cancels, Delete clears. Controller: hold LB while pressing a button to create a combo.' });
      container.appendChild(note);
      const resetKb = SL.UI.actionRow(s, 'Reset Keyboard Bindings', () => {
        SL.Settings.resetBindings('keyboard');
        build();
      });
      const resetPad = SL.UI.actionRow(s, 'Reset Controller Bindings', () => {
        SL.Settings.resetBindings('gamepad');
        build();
      });
      container.appendChild(el('div', { class: 'rows' }, [resetKb.node, resetPad.node]));
    };

    const capture = (device, action, slot, done) => {
      const overlay = el('div', { class: 'capture' }, [
        el('div', { class: 'title-font', text: SL.Settings.ACTION_LABELS[action] }),
        el('div', { text: device === 'gamepad' ? 'Press a controller button' : 'Press a key or mouse button' }),
        el('div', { class: 'hint', text: 'Esc to cancel · Delete to clear' }),
      ]);
      document.body.appendChild(overlay);
      setTimeout(() => {
        SL.Input.startCapture(device, (code) => {
          overlay.remove();
          if (code === 'Delete') SL.Settings.bind(device, action, slot, null);
          else if (code) SL.Settings.bind(device, action, slot, code);
          SL.Audio.play(code ? 'uiSelect' : 'uiBack');
          done();
        });
      }, 120);
    };

    s.onTab = (d) => {
      tab = (tab + d + cats.length) % cats.length;
      SL.Audio.play('uiMove');
      build();
    };
    s.onBack = () => {
      SL.Settings.saveNow();
      SL.UI.pop();
    };
    s.refreshGlyphs = () => {
      footer.render();
      renderTabs();
    };
    /*
     * The secret: type MANGA anywhere on this screen. It unlocks the hidden rows tagged
     * `secret: 'manga'` (right now: the Namek ending cut) and says so once.
     */
    let typed = '';
    const onKey = (e) => {
      if (!e.key || e.key.length !== 1) return;
      if (!s.el.isConnected) return; // a screen that is no longer on screen does not listen
      typed = (typed + e.key).toUpperCase().slice(-6);
      if (typed.slice(-5) !== 'MANGA' || (SL.Settings.data.secrets && SL.Settings.data.secrets.manga)) return;
      SL.Settings.data.secrets = SL.Settings.data.secrets || {};
      SL.Settings.data.secrets.manga = true;
      SL.Settings.save();
      SL.Audio.play('uiSelect');
      if (SL.Notify && SL.Notify.toast) SL.Notify.toast('Manga Mode', 'SECRET FOUND', null, 4.5);
      const g = cats.findIndex((c) => c[0] === 'gameplay');
      if (g >= 0) tab = g;
      build();
    };
    window.addEventListener('keydown', onKey);
    s.onHide = () => window.removeEventListener('keydown', onKey);
    build();
    return s;
  };

  /**
   * First launch: "How do you want to experience Saiyan Legacy?" over the living menu backdrop.
   * Focusing a choice sets up the preview HUD — built from the real HUD's pieces — exactly as
   * that preset would show it the moment a blow lands, so the difference is seen, not read.
   * The choice is saved with the settings; everything is editable later in Display & Immersion.
   * opts.again: opened from Settings (Back returns); opts.onDone(id): replaces the default exit
   * (main menu, plus the Display & Immersion page for Custom).
   */
  SL.Screens.visualSetup = function (opts = {}) {
    const s = new SL.Screen('xp-setup');
    const S = SL.Settings;
    const CHOICES = [
      ['cinematic', 'Cinematic', 'Less HUD. Fewer interruptions. Focus on the fight.'],
      ['standard', 'Standard', 'Full gameplay information when you need it.'],
      ['custom', 'Custom', 'Choose every visual preference yourself.'],
    ];
    const hud = el('div', { class: 'xp-hud' });
    const mock = previewHud(hud);
    const side = el('div', { class: 'xp-side' }, [
      el('div', { class: 'xp-kicker', text: opts.again ? 'Display & Immersion' : 'Before you begin' }),
      el('h1', { class: 'xp-q title-font' }, [el('span', { text: 'How do you want to experience' }), el('span', { class: 'gradient-text', text: 'Saiyan Legacy?' })]),
    ]);
    const show = (id) => {
      hud.className = 'xp-hud mode-' + id;
      // Custom starts from everything on; the dashed pieces blink to say "each one is yours"
      mock.apply(S.HUD_PRESETS[id] || S.HUD_PRESETS.standard);
      s.shown = id;
    };
    const choose = (id) => {
      if (id === 'custom') S.set('hud.preset', 'custom', { save: false });
      else S.applyHudPreset(id);
      S.data.visualExperienceConfigured = true;
      S.saveNow();
      s.chosen = id;
      if (opts.onDone) return opts.onDone(id);
      SL.Music.setIntensity(1);
      SL.UI.replace(SL.Screens.mainMenu());
      if (id === 'custom') SL.UI.push(SL.Screens.settings({ tab: 'hud' }));
    };
    for (const [id, name, cap] of CHOICES) {
      const mini = el('div', { class: 'xp-mini mini-' + id }, ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => el('i', { class: k })));
      const nameEl = el('div', { class: 'xp-name', text: name.toUpperCase() });
      if (id === 'cinematic') nameEl.appendChild(el('span', { class: 'xp-rec', text: 'RECOMMENDED' }));
      const card = el('div', { class: 'xp-card' }, [mini, nameEl, el('div', { class: 'xp-cap', text: cap })]);
      side.appendChild(card);
      s.addItem(card, { onFocus: () => show(id), onSelect: () => choose(id) }).choice = id;
    }
    side.appendChild(el('div', { class: 'xp-note', text: 'Change any of it later: Settings → Display & Immersion.' }));
    const footer = SL.UI.footer(opts.again ? [['confirm', 'Choose'], ['back', 'Back']] : [['confirm', 'Choose']]);
    s.el.append(hud, side, footer);
    s.refreshGlyphs = () => {
      footer.render();
      mock.keys();
    };
    s.onBack = opts.again ? () => SL.UI.pop() : () => {};
    const start = opts.again ? Math.max(0, CHOICES.findIndex((c) => c[0] === S.data.hud.preset)) : 0;
    s.focus(start, true);

    // the backdrop: the menu hero in a stand-off, wind and dust, a restless aura
    let rival = null, spawned = false, t = 0, dustT = 0;
    s.onShow = () => {
      const scene = SL.App && SL.App.menuScene;
      if (scene) scene.lookShiftTarget = -1.2; // the hero steps out from behind the choices
      if (!scene || scene.rival) {
        rival = scene ? scene.rival : null;
        return;
      }
      const b = scene.battle, def = SL.data.characters.vegeta;
      rival = b.spawn({ charId: 'vegeta', team: 1, pos: new THREE.Vector3(-7, 0, -12), dummy: 'idle' });
      rival.controller = null;
      rival.target = scene.hero;
      rival.faceTarget(100);
      rival.setState('scripted', { pose: def.intro ? def.intro.pose : 'idle' });
      spawned = true;
    };
    s.onUpdate = (dt) => {
      const scene = SL.App && SL.App.menuScene;
      t += dt;
      if (scene && scene.hero && scene.hero.state === 'scripted' && !scene.loop) {
        scene.hero.sd.aura = 0.14 + 0.1 * Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 1.9));
        dustT -= dt;
        if (dustT <= 0) {
          dustT = 0.35;
          const h = scene.hero.pos;
          scene.battle.vfx.dust(new THREE.Vector3(h.x + U.rand(-4, 4), h.y, h.z + U.rand(-4, 4)), 1.6, 3);
        }
      }
      mock.track(scene && rival && rival.alive !== false ? scene.battle : null, rival);
    };
    s.onHide = () => {
      const scene = SL.App && SL.App.menuScene;
      if (scene) scene.lookShiftTarget = 1.7;
      if (scene && scene.hero && scene.hero.state === 'scripted') scene.hero.sd.aura = undefined;
      if (spawned && scene && rival) scene.battle.remove(rival);
      rival = null;
    };
    return s;
  };

  /** The preview HUD: the real HUD's classes, filled with a Goku vs Vegeta moment. */
  function previewHud(root) {
    const goku = SL.data.characters.goku, vegeta = SL.data.characters.vegeta;
    const panel = (side, def, hp, ki, st, form) => {
      const port = el('div', { class: 'fport xp-el' }, [el('img', { src: SL.Portraits.get(def.id), alt: '' })]);
      port.style.setProperty('--pc', def.appearance.portraitColor || '#ff8a1c');
      const badge = el('span', { class: 'form-badge', text: form || '' });
      badge.hidden = !form;
      const nameRow = el('div', { class: 'fname-row xp-el' }, [el('span', { text: def.name }), badge]);
      const bar = el('div', { class: 'bar xp-el' + (hp < 0.5 ? ' mid' : '') }, [el('i', { class: 'trail', style: { width: hp * 100 + 7 + '%' } }), el('i', { class: 'fill', style: { width: hp * 100 + '%' } })]);
      const kiBar = el('div', { class: 'kibar xp-el' }, [0, 1, 2, 3, 4].map((i) => el('div', { class: 'seg' + (ki >= i + 1 ? ' full' : '') }, [el('i', { style: { width: Math.max(0, Math.min(1, ki - i)) * 100 + '%' } })])));
      const stam = el('div', { class: 'stambar xp-el' }, [el('i', { style: { width: st * 100 + '%' } })]);
      const rootEl = el('div', { class: 'fpanel xp-el ' + side }, [port, el('div', { class: 'fbars' }, [nameRow, bar, kiBar, stam])]);
      return { root: rootEl, port, nameRow, bar, ki: kiBar, stam };
    };
    const p1 = panel('p1', goku, 0.72, 3.4, 0.8, null);
    const p2 = panel('p2', vegeta, 0.46, 2.2, 0.6, null);
    const objectives = el('div', { class: 'hud-objectives xp-el' }, [
      el('div', { class: 'obj', html: '<span class="oi">' + SL.icon('target') + '</span><span class="ot">Defeat Vegeta</span>' }),
      el('div', { class: 'obj optional', html: '<span class="oi">' + SL.icon('clock') + '</span><span class="ot">Win a beam clash</span>' }),
    ]);
    const combo = el('div', { class: 'hud-combo xp-el' }, [el('div', { class: 'n', text: '12' }), el('div', { class: 'l', text: 'HITS' }), el('div', { class: 'd', text: '2,480' })]);
    const dmg = el('div', { class: 'dmg big xp-el', text: '1,284', style: { left: '46%', top: '38%' } });
    const word = el('div', { class: 'dmg word xp-el', text: 'PERFECT', style: { left: '30%', top: '30%', animationDelay: '-1.3s' } });
    const lock = el('div', { class: 'lock xp-el', style: { left: '58%', top: '44%' } }, [el('span', { class: 'alt' })]);
    const skills = el('div', { class: 'hud-skills xp-el' });
    const sp = goku.specials || {};
    const cards = [['special1', sp.special1, ''], ['special2', sp.special2, ''], ['ultimate', sp.ultimate, 'ult'], ['transform', goku.forms && goku.forms[1] ? { name: goku.forms[1].name, icon: 'transform', kiCost: goku.forms[1].kiCost || 20 } : null, 'tf']]
      .filter((c) => c[1])
      .map(([action, x, cls]) => {
        const key = el('div', { class: 'key' });
        const node = el('div', { class: 'skill ' + cls }, [key, el('div', { class: 'ic', html: SL.icon(x.icon || 'beam') }), el('div', { class: 'nm', text: x.name }), el('div', { class: 'cost', html: '<i></i>'.repeat(Math.max(1, Math.round((x.kiCost || 20) / 20))) })]);
        skills.appendChild(node);
        return { key, action };
      });
    const sub = el('div', { class: 'xp-sub xp-el' }, [el('div', { class: 'subline' }, [el('span', { class: 'who', text: 'Vegeta' }), 'You are still standing, Kakarot?'])]);
    root.append(p1.root, p2.root, objectives, combo, skills, lock, dmg, word, sub);
    let values = SL.Settings.HUD_PRESETS.standard;
    const on = (node, yes) => node.classList.toggle('xp-off', !yes);
    const api = {
      /** The same rules as the real HUD, at the moment a blow lands (health and the enemy plate have a reason to show). */
      apply(v) {
        values = v;
        const hpMin = v.playerHealth !== 'full';
        p1.root.classList.toggle('hp-min', hpMin);
        p1.root.classList.toggle('ki-min', v.ki === 'minimal' || (v.ki === 'contextual' && hpMin));
        p1.root.classList.toggle('st-min', v.stamina === 'minimal' || (v.stamina === 'contextual' && hpMin));
        for (const n of [p1.port, p1.nameRow, p1.bar]) on(n, v.playerHealth !== 'hidden');
        on(p1.ki, v.ki !== 'contextual');
        on(p1.stam, v.stamina !== 'contextual');
        on(p2.root, v.enemyHealth !== 'hidden');
        p2.root.classList.toggle('hp-min', v.enemyHealth === 'minimal');
        p2.root.classList.toggle('res-off', v.enemyHealth === 'minimal');
        on(skills, v.skillPanel === 'full' || v.skillPanel === 'minimal');
        skills.classList.toggle('min', v.skillPanel !== 'full');
        on(objectives, v.objectives !== 'contextual');
        objectives.classList.toggle('min', v.objectives !== 'full');
        on(combo, v.comboCounter);
        on(dmg, v.damageNumbers === 'all');
        on(word, v.notifications === 'all');
        on(lock, v.lockOn === 'full' || v.lockOn === 'minimal');
        lock.classList.toggle('min', v.lockOn === 'minimal');
        on(sub, v.subtitles !== 'off');
        root.style.opacity = v.opacity;
        api.keys();
      },
      keys() {
        for (const c of cards) c.key.innerHTML = values.controlHints ? SL.glyph(c.action) : '';
      },
      /** Keep the reticle on the rival in the backdrop (when there is one). */
      track(b, rival) {
        if (!b || !rival || !root.getBoundingClientRect) return;
        const pr = b.camera.project(rival.chest(), {});
        if (!pr.onScreen) return;
        const r = root.getBoundingClientRect();
        lock.style.left = pr.x - r.left + 'px';
        lock.style.top = pr.y - r.top + 'px';
        dmg.style.left = pr.x - r.left - 30 + 'px';
        dmg.style.top = pr.y - r.top - 90 + 'px';
      },
    };
    return api;
  }
})();
