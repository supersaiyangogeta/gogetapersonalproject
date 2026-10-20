/*
 * Free Battle and Training setup: fighter, form, opponent, stage and rules,
 * with live fighter cards (portrait, style, ratings, techniques).
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;

  function roster() {
    return Object.values(SL.data.characters).filter((c) => c.playable);
  }

  // the portrait grid runs in story order: an era's fighters stay in their definition order inside it
  const ERA_ORDER = ['Dragon Ball', 'Planet Vegeta', 'Saiyan Saga', 'Namek Saga', 'Android Saga', 'Future Timeline', 'Cell Saga', 'Buu Saga', 'End of Z', 'Super', 'Movie', 'GT', 'What If'];
  const eraRank = (c) => (ERA_ORDER.indexOf(c.era) + 1 || ERA_ORDER.length + 1);
  const PICK_COLS = 11;

  /**
   * Every fighter at a glance (Select on the Fighter / Opponent row): a grid of portraits, locked ones as
   * silhouettes. Arrows move in the grid, Select picks, Back closes; the row's own arrows still step one by one.
   */
  function pickFighter(title, current, onPick) {
    const s = new SL.Screen('modal picker');
    s.modal = true;
    const list = roster().sort((a, b) => eraRank(a) - eraRank(b));
    const cap = el('div', { class: 'pick-cap' });
    const grid = el('div', { class: 'pick-grid' });
    s.el.appendChild(el('div', { class: 'panel' }, [el('h2', { text: title }), grid, cap]));
    const imgs = [];
    list.forEach((c, i) => {
      const un = SL.Save.isUnlocked('characters', c.id);
      const img = el('img', { alt: '' });
      const cell = el('div', { class: 'pick' + (un ? '' : ' locked') + (c.id === current ? ' current' : ''), style: { '--pc': c.appearance.portraitColor || '#ff8a1c' } }, [img]);
      grid.appendChild(cell);
      s.addItem(cell, {
        grid: { r: Math.floor(i / PICK_COLS), c: i % PICK_COLS },
        disabled: !un,
        onFocus: () => (cap.textContent = (un ? c.name : '???') + ' · ' + (c.era || '')),
        onSelect: () => {
          SL.UI.pop();
          onPick(c.id);
        },
      });
      imgs.push([img, c.id]);
    });
    // portraits fill in a few at a time (each is rendered once, then SL.Portraits keeps it)
    let k = 0;
    const fill = () => {
      if (!s.alive) return;
      for (let n = 0; n < 4 && k < imgs.length; n++, k++) imgs[k][0].src = SL.Portraits.get(imgs[k][1], 0);
      if (k < imgs.length) requestAnimationFrame(fill);
    };
    requestAnimationFrame(fill);
    // (the select screen's own footer shows through the backdrop: Select / Back)
    s.onBack = () => SL.UI.pop();
    SL.UI.push(s);
    s.focus(Math.max(0, list.findIndex((c) => c.id === current)), true);
  }

  function fighterCard() {
    const img = el('img', { class: 'pbig', alt: '' });
    const name = el('div', { class: 'fname' });
    const style = el('div', { class: 'fstyle' });
    const blurb = el('div', { class: 'fblurb' });
    const ratings = el('div', { class: 'ratings' });
    const skills = el('div', { class: 'skills-list' });
    const level = el('div', { class: 'asset-level' });
    const root = el('div', { class: 'fcard' }, [img, name, level, style, blurb, ratings, skills]);
    return {
      root,
      // look: the wardrobe selection the fighter will wear (the portrait shows it)
      set(charId, formIndex, label, look) {
        const c = SL.data.characters[charId];
        const unlocked = SL.Save.isUnlocked('characters', charId);
        root.classList.toggle('locked', !unlocked);
        img.src = SL.Portraits.get(charId, formIndex || 0, unlocked ? look : null);
        img.style.setProperty('--pc', c.appearance.portraitColor || '#ff8a1c');
        name.textContent = unlocked ? c.name : '???';
        const lv = SL.ASSET_LEVELS && SL.ASSET_LEVELS[c.assetLevel];
        level.textContent = unlocked && lv && c.assetLevel < 3 ? lv.name + ' model' : '';
        level.title = 'Level ' + c.assetLevel + ' of 3. Prototype bodies are placeholders for gameplay development and will be replaced by production models.';
        // def.card: short tags under the name (Gogeta: "Fusion · Super Saiyan available")
        style.textContent = (label ? label + ' · ' : '') + (unlocked ? c.style + (formIndex ? ' · ' + c.forms[formIndex].name : '') + (c.card ? ' · ' + c.card.join(' · ') : '') : 'LOCKED');
        blurb.textContent = unlocked ? c.blurb : 'Unlock through Story.';
        ratings.innerHTML = '';
        if (unlocked) {
          for (const k of ['power', 'speed', 'ki', 'defense']) {
            const pips = el('div', { class: 'pips' });
            for (let i = 0; i < 5; i++) pips.appendChild(el('i', { class: i < c.ratings[k] ? 'on' : '' }));
            ratings.append(el('span', { text: k.toUpperCase() }), pips);
          }
          const sp = c.specials || {};
          const names = [sp.special1, sp.special2, sp.ultimate].concat(c.extras || []).filter(Boolean).map((x) => x.name);
          skills.innerHTML = '';
          skills.append(el('span', { text: 'Techniques: ' }), names.join(' · '));
          if (c.mechanic) {
            skills.appendChild(el('br'));
            skills.append(el('span', { text: c.mechanic.name + ': ' }), c.mechanic.desc);
          }
        } else skills.textContent = '';
      },
    };
  }

  const DEFAULTS = {
    // partner / cpu2 (2026-10-17): a second fighter on your side (a CPU ally you can switch to with the party key) and,
    // in Free Battle, a second opponent — 'none' keeps the old one-on-one
    free: { p1: 'goku', p1Form: 0, partner: 'none', partnerForm: 0, cpu: 'vegeta', cpuForm: 0, cpu2: 'none', stage: 'wasteland', difficulty: null, time: 0, hp: 1, balance: 'balanced', transform: true, ultimates: true, formLevel: -1 },
    training: { p1: 'goku', p1Form: 0, partner: 'none', partnerForm: 0, cpu: 'vegeta', cpuForm: 0, stage: 'wasteland', dummy: 'idle', difficulty: 'normal', infHp: true, infKi: true, infStamina: false, dummyInfHp: true },
  };

  SL.Screens.select = function (mode) {
    const s = new SL.Screen('select dim');
    const st = (SL.App.selectState[mode] = SL.App.selectState[mode] || U.deepClone(DEFAULTS[mode]));
    if (!st.difficulty) st.difficulty = SL.Settings.data.gameplay.difficulty;
    for (const k of ['p1', 'cpu']) if (!SL.Save.isUnlocked('characters', st[k])) st[k] = 'goku';
    for (const k of ['partner', 'cpu2']) if (!st[k] || (st[k] !== 'none' && !SL.Save.isUnlocked('characters', st[k]))) st[k] = 'none';
    if (!SL.Save.isUnlocked('stages', st.stage)) st.stage = 'wasteland';

    const left = el('div', { class: 'left' }, [el('h1', { class: 'title-font gradient-text', text: mode === 'free' ? 'Free Battle' : 'Training' })]);
    const rows = el('div', { class: 'rows' });
    left.appendChild(rows);
    const right = el('div', { class: 'right' });
    const c1 = fighterCard(), c2 = fighterCard();
    right.appendChild(el('div', { class: 'vs-wrap' }, [c1.root, el('div', { class: 'vs', text: 'VS' }), c2.root]));
    const lockedCount = roster().filter((c) => !SL.Save.isUnlocked('characters', c.id)).length;
    if (lockedCount) right.appendChild(el('div', { class: 'hint', style: { textAlign: 'center' }, text: lockedCount + (lockedCount === 1 ? ' fighter' : ' fighters') + ' still locked.' }));
    s.el.append(left, right);

    // the row's arrows step through the same grouped order as the portrait grid
    const charOptions = () => roster().sort((a, b) => eraRank(a) - eraRank(b)).map((c) => [c.id, SL.Save.isUnlocked('characters', c.id) ? c.name : '??? (locked)', !SL.Save.isUnlocked('characters', c.id)]);
    // only the forms open outside the story are starting forms (SL.formStartFree: earned, not story-only, not story-locked
    // unless the form says where it is earned); the value stays the form's index in def.forms
    const formOptions = (id) => () => (st[id] === 'none' ? [[0, '—']] : SL.data.characters[st[id]].forms.map((f, i) => [i, f.name, f]).filter((o) => SL.formStartFree(o[2])).map((o) => [o[0], o[1]]));
    const startForm = (id, i) => { if (st[id] === 'none') return 0; const f = SL.data.characters[st[id]].forms[i]; return f && SL.formStartFree(f) ? i : 0; };
    const withNone = () => [['none', 'None']].concat(charOptions());
    // the looks the two will wear: the player's saved one; the opponent's for this battle (SL.Wardrobe.opponentLook)
    const W = SL.Wardrobe;
    const p1Look = () => (W && W.has(st.p1) ? W.current(st.p1) : null);
    const cpuLook = () => (W && W.has(st.cpu) ? W.opponentLook(st.cpu, st.cpuOutfit, st.p1) || W.current(st.cpu) : null);
    const refresh = () => {
      // (a remembered starting form that is now story-only falls back to the base)
      st.p1Form = startForm('p1', st.p1Form);
      st.cpuForm = startForm('cpu', st.cpuForm);
      st.partnerForm = startForm('partner', st.partnerForm);
      c1.set(st.p1, st.p1Form, 'YOU', p1Look());
      c2.set(st.cpu, st.cpuForm, mode === 'free' ? 'CPU' : 'DUMMY', cpuLook());
      for (const it of s.items) if (it.render) it.render();
    };
    const add = (item) => rows.appendChild(item.node);

    const setP1 = (v) => { st.p1 = v; st.p1Form = 0; refresh(); };
    const setCpu = (v) => { st.cpu = v; st.cpuForm = 0; st.cpuOutfit = 'auto'; refresh(); };
    add(SL.UI.choiceRow(s, { label: 'Fighter', options: charOptions, get: () => st.p1, set: setP1, onSelect: () => pickFighter('Fighter', st.p1, setP1) }));
    add(SL.UI.choiceRow(s, { label: 'Starting Form', options: formOptions('p1'), get: () => st.p1Form, set: (v) => { st.p1Form = v; refresh(); } }));
    // the player's saved look for that fighter (the same choice the Customization screen makes)
    const owned = (id) => W.options(id, 'outfit', W.current(id)).filter((o) => !o.locked && !o.planned).map((o) => [o.id, o.name]);
    if (W) {
      add(SL.UI.choiceRow(s, {
        label: 'Outfit', desc: 'Customization screen: armor, emblems, scouters.', options: () => (W.has(st.p1) ? owned(st.p1) : [['-', 'Default']]),
        get: () => (W.has(st.p1) ? W.current(st.p1).outfit : '-'),
        set: (v) => {
          if (!W.has(st.p1)) return;
          const cur = W.current(st.p1);
          W.select(st.p1, W.sanitize(st.p1, W.complete(st.p1, { outfit: v, scouter: cur.scouter, tail: cur.tail, hair: cur.hair, body: cur.body }), { checkUnlock: true }).selection);
          refresh();
        },
      }));
    }
    // a partner on your side: a CPU ally you can switch to (party key); its form
    const setPartner = (v) => { st.partner = v; st.partnerForm = 0; refresh(); };
    add(SL.UI.choiceRow(s, { label: 'Partner', desc: 'A second fighter on your side (CPU); switch to them with the party key. None: one on one.', options: withNone, get: () => st.partner || 'none', set: setPartner, onSelect: () => pickFighter('Partner', st.partner, setPartner) }));
    add(SL.UI.choiceRow(s, { label: 'Partner Form', options: formOptions('partner'), get: () => st.partnerForm || 0, set: (v) => { st.partnerForm = v; refresh(); } }));
    add(SL.UI.choiceRow(s, { label: mode === 'free' ? 'Opponent' : 'Dummy', options: charOptions, get: () => st.cpu, set: setCpu, onSelect: () => pickFighter(mode === 'free' ? 'Opponent' : 'Dummy', st.cpu, setCpu) }));
    add(SL.UI.choiceRow(s, { label: mode === 'free' ? 'Opponent Form' : 'Dummy Form', options: formOptions('cpu'), get: () => st.cpuForm, set: (v) => { st.cpuForm = v; refresh(); } }));
    // the opponent's outfit for this battle only (nothing saved): Auto is their saved look, another one in a mirror match
    if (W) {
      const cpuOutfits = () => [['auto', 'Auto']].concat(W.has(st.cpu) ? owned(st.cpu) : []);
      add(SL.UI.choiceRow(s, {
        label: mode === 'free' ? 'Opponent Outfit' : 'Dummy Outfit', desc: 'Auto: their saved look, a different one in a mirror match.', options: cpuOutfits,
        get: () => (cpuOutfits().some((o) => o[0] === st.cpuOutfit) ? st.cpuOutfit : 'auto'),
        set: (v) => { st.cpuOutfit = v; refresh(); },
      }));
    }
    const diffOpts = SL.Settings.SCHEMA.find((x) => x.key === 'difficulty').options;
    if (mode === 'free') {
      const setCpu2 = (v) => { st.cpu2 = v; refresh(); };
      add(SL.UI.choiceRow(s, { label: 'Second Opponent', desc: 'A second CPU against you (base form). None: one on one.', options: withNone, get: () => st.cpu2 || 'none', set: setCpu2, onSelect: () => pickFighter('Second Opponent', st.cpu2, setCpu2) }));
      add(SL.UI.choiceRow(s, { label: 'CPU Difficulty', options: diffOpts, get: () => st.difficulty, set: (v) => (st.difficulty = v) }));
      add(SL.UI.choiceRow(s, { label: 'Time Limit', options: [[0, 'None'], [99, '99 sec'], [180, '3 min'], [300, '5 min']], get: () => st.time, set: (v) => (st.time = v) }));
      add(SL.UI.choiceRow(s, { label: 'Health', options: [[0.5, '50%'], [1, '100%'], [1.5, '150%'], [2, '200%']], get: () => st.hp, set: (v) => (st.hp = v) }));
      add(SL.UI.choiceRow(s, { label: 'Power Balance', desc: 'Canon scales strength to the story.', options: [['balanced', 'Balanced'], ['canon', 'Canon Power']], get: () => st.balance, set: (v) => (st.balance = v) }));
      add(SL.UI.toggleRow(s, { label: 'Transformations', get: () => st.transform, set: (v) => (st.transform = v) }));
      add(SL.UI.toggleRow(s, { label: 'Ultimate Attacks', get: () => st.ultimates, set: (v) => (st.ultimates = v) }));
      add(SL.UI.choiceRow(s, { label: 'Form Level Limit', desc: 'Caps leveled forms (Kaioken x2 / x3 / x4) for both fighters.', options: [[-1, 'No Limit'], [0, 'First Level Only'], [1, 'Up to Second Level'], [2, 'Up to Third Level']], get: () => (st.formLevel === undefined ? -1 : st.formLevel), set: (v) => (st.formLevel = v) }));
    } else {
      add(SL.UI.choiceRow(s, { label: 'Dummy Behavior', options: [['idle', 'Stand Still'], ['guard', 'Always Guard'], ['dodge', 'Dodge Attacks'], ['blast', 'Fire Ki Blasts'], ['cpu', 'Fight Back (CPU)']], get: () => st.dummy, set: (v) => (st.dummy = v) }));
      add(SL.UI.choiceRow(s, { label: 'CPU Difficulty', desc: 'Used when the dummy fights back.', options: diffOpts, get: () => st.difficulty, set: (v) => (st.difficulty = v) }));
      add(SL.UI.toggleRow(s, { label: 'Infinite Health', get: () => st.infHp, set: (v) => (st.infHp = v) }));
      add(SL.UI.toggleRow(s, { label: 'Infinite Ki', get: () => st.infKi, set: (v) => (st.infKi = v) }));
      add(SL.UI.toggleRow(s, { label: 'Infinite Stamina', get: () => st.infStamina, set: (v) => (st.infStamina = v) }));
      add(SL.UI.toggleRow(s, { label: 'Dummy Infinite Health', get: () => st.dummyInfHp, set: (v) => (st.dummyInfHp = v) }));
    }
    // story-only stages (Snake Way's narrow road) are not battle arenas and never appear here
    const stageOpts = () => Object.values(SL.data.stages).filter((d) => !d.storyOnly).map((d) => [d.id, SL.Save.isUnlocked('stages', d.id) ? d.name : '??? (locked)', !SL.Save.isUnlocked('stages', d.id)]);
    add(SL.UI.choiceRow(s, { label: 'Stage', options: stageOpts, get: () => st.stage, set: (v) => (st.stage = v) }));
    add(SL.UI.actionRow(s, mode === 'free' ? 'Fight!' : 'Start Training', () => (mode === 'free' ? SL.App.startFreeBattle(st) : SL.App.startTraining(st))));

    const footer = SL.UI.footer([['adjust', 'Change'], ['confirm', 'Select'], ['back', 'Back']]);
    s.el.appendChild(footer);
    s.refreshGlyphs = () => footer.render();
    s.onBack = () => SL.UI.pop();
    refresh();
    return s;
  };
})();
