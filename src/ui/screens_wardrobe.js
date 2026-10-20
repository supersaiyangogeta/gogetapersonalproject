/*
 * CUSTOMIZATION (main menu → Customization): the wardrobe screen.
 *
 * The character stands in the menu's own 3D scene (no battle is loaded): a slim column of
 * categories on the left, the figure large on the right, turning slowly, in a cool rim light.
 * Every change is saved at once and the figure is rebuilt in the same frame. Only valid choices
 * are offered: pieces that fit the character (and, for armor and emblems, the outfit) and that
 * the player has unlocked. The outfit strip along the bottom also shows what is still locked or
 * planned, greyed, so the player can see what the story will hand over.
 *
 * What is chosen here dresses the character in Free Battle, Training and the menus — never in
 * a canon story mission (SL.Wardrobe), which always wears its era's look.
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;
  const V3 = THREE.Vector3;
  const W = () => SL.Wardrobe;

  const VIEWS = [['turn', 'Turntable'], ['front', 'Front'], ['side', 'Side'], ['back', 'Back'], ['free', 'Free (drag)']];
  const VIEW_YAW = { front: 0, side: -Math.PI / 2, back: Math.PI };
  const ZOOMS = [[1, 'Full Body'], [1.7, 'Upper Body'], [2.7, 'Close-Up']];
  const WEAR = [[0, 'Intact'], [1, 'Damaged'], [2, 'Heavily Damaged'], [3, 'Torn']];
  const SLOT_ROWS = [['outfit', 'Outfit', 'outfit'], ['armor', 'Armor', 'guard'], ['emblem', 'Emblem', 'emblem'], ['scouter', 'Scouter', 'scouter'], ['tail', 'Tail', 'tail'], ['hair', 'Hair', 'hair'], ['palette', 'Colors', 'palette']];
  const KIND = { casual: 'CASUAL', training: 'TRAINING', movie: 'MOVIE', gt: 'GT', event: 'EVENT', whatif: 'WHAT IF' };

  function poseOptions(def) {
    const out = [['idle', 'Combat Stance'], ['stand', 'Standing']];
    if (def.intro && def.intro.pose) out.push([def.intro.pose, 'Intro']);
    if (def.victory && def.victory.poses && def.victory.poses[0]) out.push([def.victory.poses[0], 'Victory']);
    return out;
  }

  function unlockHint(p) {
    const c = (p && p.unlock) || {};
    if (c.missionComplete) {
      const m = SL.data.missions[c.missionComplete];
      return 'Clear "' + (m ? m.title : c.missionComplete) + '"';
    }
    return 'Locked';
  }

  SL.Screens.wardrobe = function (opts = {}) {
    const s = new SL.Screen('wardrobe');
    const chars = W().characters().filter((id) => SL.Save.isUnlocked('characters', id) || W().profile(id).devOnly);
    const st = {
      charId: chars.includes(opts.charId) ? opts.charId : chars[0],
      sel: null, view: 'turn', zoom: 1, zoomS: 1, pose: 'idle', aura: false, form: 0, wear: 0, rot: 0.5, drag: null, notice: '',
    };
    st.sel = W().current(st.charId);
    s.state = st;

    const stage = el('div', { class: 'wd-stage' });
    const tabs = el('div', { class: 'wd-tabs' });
    const nameEl = el('div', { class: 'wd-name title-font gradient-text' });
    const rows = el('div', { class: 'wd-rows' });
    const side = el('div', { class: 'wd-side' }, [
      el('div', { class: 'wd-kicker', text: 'Customization' }), tabs, nameEl, rows,
      el('div', { class: 'wd-note', text: 'Worn in Free Battle, Training and the menus. Story missions always wear the canon look of their era.' }),
    ]);
    const tag = el('div', { class: 'wd-tag' });
    const strip = el('div', { class: 'wd-strip' });
    const footer = SL.UI.footer([['adjust', 'Change'], ['tabs', 'Character'], ['back', 'Back']]);
    s.el.append(stage, side, tag, strip, footer);
    s.refreshGlyphs = () => footer.render();

    /* ---------------- choices ---------------- */
    const def = () => SL.data.characters[st.charId];
    const offered = (slot) => W().options(st.charId, slot, st.sel).filter((o) => !o.locked && !o.planned).map((o) => [o.id, o.name]);
    // what the story still holds back in a slot (locked, not planned): the row says so, so a missing piece reads as "not yet"
    const lockedIn = (slot) => W().options(st.charId, slot, st.sel).filter((o) => o.locked && !o.planned).length;
    const lockNote = (slot) => (lockedIn(slot) ? lockedIn(slot) + ' to unlock' : '');

    /**
     * Puts a new selection on, saved at once. A new outfit brings its own armor, marks and colours;
     * accessories (scouter, tail, hair) stay. Whatever no longer fits is resolved here — the outfit's
     * default when it fits, otherwise none — so the rows never get stuck and the player never sees a
     * compatibility message (the Bardock outfit row used to stop on one).
     */
    const change = (slot, value) => {
      let next;
      // a new outfit keeps the accessories and the body (the body belongs to the character, not to the clothes)
      if (slot === 'outfit') next = W().complete(st.charId, { outfit: value, scouter: st.sel.scouter, tail: st.sel.tail, hair: st.sel.hair, body: st.sel.body });
      else next = Object.assign({}, st.sel, { [slot]: value });
      next = W().sanitize(st.charId, next, { checkUnlock: true }).selection;
      const r = W().select(st.charId, next);
      if (!r.ok) {
        // cannot happen after sanitize; if data ever makes it happen, log it and keep the look as is
        SL.warn('wardrobe: selection refused after sanitize', r.problems);
        SL.Audio.play('uiError');
        return false;
      }
      st.sel = r.selection;
      st.notice = '';
      build();
      spawnPreview();
      return true;
    };

    const row = (o) => {
      const valEl = el('span', { class: 'wd-v' });
      const subEl = el('span', { class: 'wd-sub' });
      const node = el('div', { class: 'wd-row' + (o.small ? ' small' : '') }, [
        el('i', { class: 'wd-ico', html: SL.icon(o.icon) }),
        el('span', { class: 'wd-lbl', text: o.label }),
        el('span', { class: 'wd-val' }, [el('span', { class: 'arrow', text: '◀', 'data-dir': 'l' }), valEl, el('span', { class: 'arrow', text: '▶', 'data-dir': 'r' })]),
        subEl,
      ]);
      const render = () => {
        const v = o.get();
        const found = o.values().find((x) => x[0] === v);
        valEl.textContent = found ? found[1] : '—';
        subEl.textContent = o.sub ? o.sub(v) : '';
        node.classList.toggle('single', o.values().length < 2);
      };
      const step = (d) => {
        const list = o.values();
        if (list.length < 2) return;
        let i = list.findIndex((x) => x[0] === o.get());
        i = (i + d + list.length) % list.length;
        o.set(list[i][0]);
        render();
      };
      const item = s.addItem(node, { onLeft: () => step(-1), onRight: () => step(1), onSelect: o.onSelect || (() => step(1)) });
      item.key = o.key;
      item.render = render;
      item.sound = 'uiMove';
      rows.appendChild(node);
      render();
      return item;
    };

    const heading = (text) => rows.appendChild(el('div', { class: 'wd-head', text }));

    /** (Re)builds the rows for the character and outfit on show; keeps the focused row. */
    const build = () => {
      const was = s.items[s.index] && s.items[s.index].key;
      s.clearItems();
      rows.innerHTML = '';
      tabs.innerHTML = '';
      for (const id of chars) {
        const c = SL.data.characters[id];
        const chip = el('div', { class: 'wd-chip' + (id === st.charId ? ' on' : ''), title: c.name }, [el('img', { src: SL.Portraits.get(id), alt: '' })]);
        chip.style.setProperty('--pc', c.appearance.portraitColor || '#ff8a1c');
        chip.addEventListener('click', () => switchChar(id));
        tabs.appendChild(chip);
      }
      nameEl.textContent = def().name;
      for (const [slot, label, icon] of SLOT_ROWS) {
        if (!W().options(st.charId, slot, st.sel).length) continue; // nothing to choose: no row
        row({
          key: slot, label, icon,
          values: () => offered(slot),
          get: () => (slot === 'palette' ? st.sel.palette : st.sel[slot]),
          set: (v) => change(slot, v),
          sub: slot === 'outfit' ? () => [W().eraLabel(W().piece(st.sel.outfit).era), lockNote(slot)].filter(Boolean).join(' · ') : () => lockNote(slot),
        });
      }
      // body controls (a profile that offers them: Kefla): bounded steps either side of her authored build
      const ctl = W().bodyControls(st.charId);
      if (ctl) {
        heading('Body');
        const steps = [];
        for (let v = -1; v <= 1.0001; v += W().BODY_STEP) {
          const n = Math.round(v / W().BODY_STEP);
          steps.push([Math.round(v * 100) / 100, n === 0 ? 'Default' : (n > 0 ? '+' : '−') + Math.abs(n)]);
        }
        for (const c of ctl) {
          row({
            key: 'body:' + c.id, label: c.name, icon: 'pose', small: true,
            values: () => steps,
            get: () => (st.sel.body && st.sel.body[c.id]) || 0,
            set: (v) => change('body', Object.assign({}, st.sel.body, { [c.id]: v })),
          });
        }
      }
      heading('Preview');
      row({ key: 'view', label: 'View', icon: 'view', small: true, values: () => VIEWS, get: () => st.view, set: (v) => (st.view = v) });
      row({ key: 'zoom', label: 'Framing', icon: 'view', small: true, values: () => ZOOMS, get: () => ZOOMS.reduce((a, z) => (Math.abs(z[0] - st.zoom) < Math.abs(a[0] - st.zoom) ? z : a))[0], set: (v) => (st.zoom = v) });
      row({ key: 'pose', label: 'Pose', icon: 'pose', small: true, values: () => poseOptions(def()), get: () => st.pose, set: (v) => { st.pose = v; posePreview(); } });
      row({ key: 'aura', label: 'Aura', icon: 'transform', small: true, values: () => [[false, 'Off'], [true, 'On']], get: () => st.aura, set: (v) => { st.aura = v; posePreview(); } });
      if (def().forms.length > 1) row({ key: 'form', label: 'Form', icon: 'transform', small: true, values: () => def().forms.map((f, i) => [i, f.name]).filter((x) => !def().forms[x[0]].bossOnly), get: () => st.form, set: (v) => { st.form = v; spawnPreview(); } });
      row({ key: 'wear', label: 'Damage', icon: 'wear', small: true, values: () => WEAR, get: () => st.wear, set: (v) => { st.wear = v; if (P.f) W().applyDamage(P.f, v); } });
      heading('Modes');
      row({ key: 'whatif', label: 'What If?', icon: 'emblem', small: true, values: () => [[false, 'Canon look'], [true, 'My look']], get: () => !!W().prefs().whatIfCustom, set: (v) => W().setPref('whatIfCustom', v) });
      // every change above is saved as it is made; Save Look writes it again and says so
      const save = SL.UI.actionRow(s, 'Save Look', () => {
        const r = W().select(st.charId, st.sel);
        st.notice = r.ok ? 'Look saved' : 'Not saved: ' + r.problems.join('; ');
        renderTag();
      }, 'wd-restore');
      save.key = 'save';
      rows.appendChild(save.node);
      // presets: a look as a JSON file, to carry it between the game and the file-based viewer (tools/viewer.html)
      const exp = SL.UI.actionRow(s, 'Export Look (JSON)', () => {
        download(st.charId + '-look.json', W().exportPreset(st.charId, st.sel));
        st.notice = 'Look exported';
        renderTag();
      }, 'wd-restore');
      exp.key = 'export';
      rows.appendChild(exp.node);
      const imp = SL.UI.actionRow(s, 'Import Look (JSON)', () => pickFile((text) => {
        const r = W().importPreset(text, { checkUnlock: true });
        if (!r.ok) st.notice = 'Import refused: ' + r.problems.join('; ');
        else if (!chars.includes(r.charId)) st.notice = 'Import refused: ' + r.charId + ' is not available here';
        else {
          if (r.charId !== st.charId) switchChar(r.charId);
          const w = W().select(r.charId, r.selection);
          st.sel = w.ok ? w.selection : st.sel;
          st.notice = w.ok ? 'Look imported' + (r.problems.length ? ' (adjusted: ' + r.problems.join('; ') + ')' : '') : 'Import refused: ' + w.problems.join('; ');
          build();
          spawnPreview();
        }
        renderTag();
      }), 'wd-restore');
      imp.key = 'import';
      rows.appendChild(imp.node);
      const pr = W().profile(st.charId);
      const canon = pr && Object.keys(pr.canonByEra || {}).length;
      const restore = SL.UI.actionRow(s, canon ? 'Restore Canon Default' : 'Restore Default', () => {
        st.sel = W().restoreDefault(st.charId);
        st.notice = canon ? 'Canon default restored' : 'Default restored';
        build();
        spawnPreview();
      }, 'wd-restore');
      restore.key = 'restore';
      rows.appendChild(restore.node);
      const back = s.items.findIndex((it) => it.key === was);
      s.focus(back >= 0 ? back : 0, true);
      renderTag();
      renderStrip();
    };

    const renderTag = () => {
      const o = W().piece(st.sel.outfit);
      tag.innerHTML = '';
      const badges = el('div', { class: 'wd-badges' });
      badges.append(el('span', { class: 'b ' + (o.canon ? 'canon' : 'alt'), text: o.canon ? 'CANON' : 'ALTERNATE' }));
      if (KIND[o.kind]) badges.append(el('span', { class: 'b', text: KIND[o.kind] }));
      badges.append(el('span', { class: 'b proto', text: 'PROTOTYPE', title: 'Built from procedural prototype parts (asset level 1–2). Not a production model.' }));
      if (o.accuracy === 'approximate') badges.append(el('span', { class: 'b approx', text: 'COLORS APPROX.', title: 'Colours are a best reading of the reference; not yet checked by the owner.' }));
      tag.append(el('div', { class: 'wd-era', text: W().eraLabel(o.era) }), el('div', { class: 'wd-title', text: o.name }), badges);
      // where the story itself dresses them in it (canon missions never read the player's choice), and how much is owned
      const pr = W().profile(st.charId);
      // (two eras can share a label: the Saiyan Saga before and after King Kai)
      const story = [...new Set(Object.entries((pr && pr.canonByEra) || {}).filter(([, e]) => e.outfit === o.id).map(([era]) => W().eraLabel(era)).filter(Boolean))];
      if (story.length) tag.append(el('div', { class: 'wd-story', text: 'Story look · ' + story.join(', ') }));
      const all = W().options(st.charId, 'outfit', st.sel).filter((x) => !x.planned);
      if (all.length > 1) tag.append(el('div', { class: 'wd-story', text: all.filter((x) => !x.locked).length + ' of ' + all.length + ' outfits owned' }));
      if (st.notice) tag.append(el('div', { class: 'wd-notice', text: st.notice }));
    };

    const renderStrip = () => {
      strip.innerHTML = '';
      for (const o of W().options(st.charId, 'outfit', st.sel)) {
        const cls = 'wd-thumb' + (o.id === st.sel.outfit ? ' on' : '') + (o.locked ? ' locked' : '') + (o.planned ? ' planned' : '');
        const img = o.planned ? el('div', { class: 'wd-ph', text: 'PLANNED' }) : el('img', { alt: '', src: SL.Portraits.outfit(st.charId, W().complete(st.charId, { outfit: o.id })) });
        const card = el('div', { class: cls, title: o.name + ' · ' + W().eraLabel(o.era) }, [img, el('span', { class: 'wd-tn', text: o.name })]);
        if (o.locked && !o.planned) card.appendChild(el('i', { class: 'wd-lock', html: SL.icon('lock') }));
        card.addEventListener('click', () => {
          if (o.planned) st.notice = o.name + ' — planned: needs ' + o.piece.needs;
          else if (o.locked) st.notice = o.name + ' — locked · ' + unlockHint(o.piece);
          else if (o.id !== st.sel.outfit) {
            SL.Audio.play('uiSelect');
            change('outfit', o.id);
            return;
          }
          if (o.planned || o.locked) SL.Audio.play('uiError');
          renderTag();
        });
        strip.appendChild(card);
      }
    };

    /** A text file for the player to keep (a look preset). */
    const download = (name, text) => {
      if (typeof document === 'undefined' || typeof Blob === 'undefined') return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 0);
    };
    /** Asks the player for a file and hands its text over. */
    const pickFile = (then) => {
      if (typeof document === 'undefined') return;
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.json,application/json';
      inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (f) f.text().then(then);
      };
      inp.click();
    };

    const switchChar = (id) => {
      if (id === st.charId || !chars.includes(id)) return;
      st.charId = id;
      st.sel = W().current(id);
      st.form = 0;
      st.wear = 0;
      st.pose = 'idle';
      st.notice = '';
      SL.Audio.play('uiMove');
      build();
      spawnPreview();
    };
    s.onTab = (d) => switchChar(chars[(chars.indexOf(st.charId) + d + chars.length) % chars.length]);
    s.onBack = () => SL.UI.pop();

    /* ---------------- the 3D figure (in the menu's scene) ---------------- */
    const P = { f: null, lights: [], hidden: [] };
    s.preview = P;
    const scene = () => SL.App && SL.App.menuScene;

    const posePreview = () => {
      if (!P.f) return;
      P.f.setState('scripted', { pose: st.pose, aura: st.aura ? 0.85 : 0, expression: st.aura ? 'shout' : st.pose === 'idle' ? 'angry' : 'calm' });
    };

    const spawnPreview = () => {
      const sc = scene();
      if (!sc) return;
      const b = sc.battle;
      if (P.f) b.remove(P.f);
      const f = b.spawn({ charId: st.charId, team: 0, pos: new V3(0, 0, 0), dummy: 'idle', wardrobe: st.sel });
      f.controller = null;
      f.target = null;
      f.yaw = P.yaw !== undefined ? P.yaw : st.rot;
      f.rimLight = { color: 0xcfe4ff, strength: 0.62 };
      if (st.form) f.applyForm(st.form);
      if (st.wear) W().applyDamage(f, st.wear);
      P.f = f;
      posePreview();
      f.anim.snap();
    };

    s.onShow = () => {
      const sc = scene();
      listen(true);
      if (!sc) {
        build();
        return;
      }
      const b = sc.battle;
      for (const f of [sc.hero, sc.rival]) if (f && !f.hidden) {
        f.setHidden(true);
        P.hidden.push(f);
      }
      if (sc.loop) sc.setPower(false);
      // a cool rim from behind (the stage's own sun is the key): the outfit's edges read.
      // Toon shading clips fast, so this stays low (0.9 plus a front key washed everything out)
      const rim = new THREE.DirectionalLight(0xbfdcff, 0.25);
      rim.position.set(-3, 4, -5);
      P.lights = [rim];
      for (const l of P.lights) b.scene.add(l);
      b.camera.playShot((t, out) => {
        const f = P.f;
        if (!f) return;
        const z = st.zoomS;
        const r = 5.2 / z;
        const k = Math.min(1, (z - 1) / 1.0); // 0 full body → 1 close-up
        const y = f.pos.y + f.height * (0.5 + 0.36 * k);
        out.pos.set(f.pos.x, y + 0.12 / z, f.pos.z + r);
        // the figure stands at ~62 % of the width (clear of the column, whatever the aspect) with
        // its head just under the title and its feet above the outfit strip
        const aspect = (b.camera.camera && b.camera.camera.aspect) || 16 / 9;
        out.look.set(f.pos.x - 0.073 * aspect * r, y - 0.04 * r * (1 - k), f.pos.z);
        out.fov = 34;
      }, 1e9, { hold: true, cut: true, blendIn: 0, kind: 'story' });
      build();
      spawnPreview();
      listen(true);
    };

    s.onUpdate = (dt) => {
      st.zoomS += (st.zoom - st.zoomS) * Math.min(1, dt * 6);
      const f = P.f;
      if (!f) return;
      if (st.view === 'turn' && !st.drag) st.rot += dt * 0.4;
      const want = st.view === 'turn' || st.view === 'free' ? st.rot : VIEW_YAW[st.view];
      f.yaw += U.wrapAngle(want - f.yaw) * Math.min(1, dt * 7);
      P.yaw = f.yaw;
    };

    s.onHide = () => {
      const sc = scene();
      if (sc) {
        const b = sc.battle;
        if (P.f) b.remove(P.f);
        for (const l of P.lights) b.scene.remove(l);
        for (const f of P.hidden) f.setHidden(false);
        sc.aimHero();
      }
      P.f = null;
      P.lights = [];
      P.hidden = [];
      listen(false);
      SL.Portraits.release();
    };

    // drag to turn, wheel to zoom (the stage layer sits behind the column)
    stage.addEventListener('pointerdown', (e) => {
      st.drag = { x: e.clientX, rot: st.rot };
      st.rot = P.f ? P.f.yaw : st.rot;
      st.drag.rot = st.rot;
      if (st.view !== 'turn' && st.view !== 'free') st.view = 'free';
    });
    const onMove = (e) => {
      if (!st.drag) return;
      st.rot = st.drag.rot + (e.clientX - st.drag.x) * 0.012;
      if (st.view !== 'free') st.view = 'free';
    };
    const onUp = () => {
      if (!st.drag) return;
      st.drag = null;
      for (const it of s.items) if (it.render) it.render();
    };
    const listen = (on) => {
      if (typeof window === 'undefined' || !window.addEventListener) return;
      const fn = on ? 'addEventListener' : 'removeEventListener';
      window[fn]('pointermove', onMove);
      window[fn]('pointerup', onUp);
    };
    stage.addEventListener('wheel', (e) => {
      st.zoom = U.clamp(st.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 1, 2.7);
      if (e.preventDefault) e.preventDefault();
    });

    return s;
  };
})();
