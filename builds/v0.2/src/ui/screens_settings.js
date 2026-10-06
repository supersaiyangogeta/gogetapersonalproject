/*
 * Settings screen generated from SL.Settings.SCHEMA, plus the control
 * rebinding grid (keyboard primary/secondary and gamepad).
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;

  const REBINDABLE = ['moveF', 'moveB', 'moveL', 'moveR', 'ascend', 'descend', 'boost', 'light', 'heavy', 'blast', 'guard', 'dodge', 'charge', 'special1', 'special2', 'ultimate', 'transform', 'revert', 'target', 'pause', 'resetPos'];
  const PAD_REBINDABLE = REBINDABLE.filter((a) => !a.startsWith('move'));

  SL.Screens.settings = function () {
    const s = new SL.Screen('settings dark');
    let tab = 0;
    const cats = SL.Settings.CATEGORIES;
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
      const schemaRows = SL.Settings.SCHEMA.filter((r) => r.cat === cat);
      const items = [];
      for (const r of schemaRows) {
        const path = r.cat + '.' + r.key;
        const common = { label: r.label, desc: r.desc, get: () => SL.Settings.get(path), set: (v) => SL.Settings.set(path, v) };
        let item;
        if (r.type === 'choice') item = SL.UI.choiceRow(s, { ...common, options: r.options });
        else if (r.type === 'slider') item = SL.UI.sliderRow(s, { ...common, min: r.min, max: r.max, step: r.step, fmt: r.fmt });
        else item = SL.UI.toggleRow(s, common);
        items.push(item);
        rows.appendChild(item.node);
      }
      if (cat === 'graphics') {
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
      if (cat === 'controls') buildBindings(scroll);
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
    build();
    return s;
  };
})();
