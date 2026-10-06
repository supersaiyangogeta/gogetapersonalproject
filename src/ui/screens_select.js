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
      set(charId, formIndex, label) {
        const c = SL.data.characters[charId];
        const unlocked = SL.Save.isUnlocked('characters', charId);
        root.classList.toggle('locked', !unlocked);
        img.src = SL.Portraits.get(charId, formIndex || 0);
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
    free: { p1: 'goku', p1Form: 0, cpu: 'vegeta', cpuForm: 0, stage: 'wasteland', difficulty: null, time: 0, hp: 1, balance: 'balanced', transform: true, ultimates: true, formLevel: -1 },
    training: { p1: 'goku', p1Form: 0, cpu: 'vegeta', cpuForm: 0, stage: 'wasteland', dummy: 'idle', difficulty: 'normal', infHp: true, infKi: true, infStamina: false, dummyInfHp: true },
  };

  SL.Screens.select = function (mode) {
    const s = new SL.Screen('select dim');
    const st = (SL.App.selectState[mode] = SL.App.selectState[mode] || U.deepClone(DEFAULTS[mode]));
    if (!st.difficulty) st.difficulty = SL.Settings.data.gameplay.difficulty;
    for (const k of ['p1', 'cpu']) if (!SL.Save.isUnlocked('characters', st[k])) st[k] = 'goku';
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

    const charOptions = () => roster().map((c) => [c.id, SL.Save.isUnlocked('characters', c.id) ? c.name : '??? (locked)', !SL.Save.isUnlocked('characters', c.id)]);
    const formOptions = (id) => () => SL.data.characters[st[id]].forms.map((f, i) => [i, f.name]);
    const refresh = () => {
      c1.set(st.p1, st.p1Form, 'YOU');
      c2.set(st.cpu, st.cpuForm, mode === 'free' ? 'CPU' : 'DUMMY');
      for (const it of s.items) if (it.render) it.render();
    };
    const add = (item) => rows.appendChild(item.node);

    add(SL.UI.choiceRow(s, { label: 'Fighter', options: charOptions, get: () => st.p1, set: (v) => { st.p1 = v; st.p1Form = 0; refresh(); } }));
    add(SL.UI.choiceRow(s, { label: 'Starting Form', options: formOptions('p1'), get: () => st.p1Form, set: (v) => { st.p1Form = v; refresh(); } }));
    // the player's saved look for that fighter (the same choice the Customization screen makes)
    if (SL.Wardrobe) {
      const W = SL.Wardrobe;
      const outfits = () => (W.has(st.p1) ? W.options(st.p1, 'outfit', W.current(st.p1)).filter((o) => !o.locked && !o.planned).map((o) => [o.id, o.name]) : [['-', 'Default']]);
      add(SL.UI.choiceRow(s, {
        label: 'Outfit', desc: 'Customization screen: armor, emblems, scouters.', options: outfits,
        get: () => (W.has(st.p1) ? W.current(st.p1).outfit : '-'),
        set: (v) => {
          if (!W.has(st.p1)) return;
          const cur = W.current(st.p1);
          W.select(st.p1, W.sanitize(st.p1, W.complete(st.p1, { outfit: v, scouter: cur.scouter, tail: cur.tail, hair: cur.hair }), { checkUnlock: true }).selection);
        },
      }));
    }
    add(SL.UI.choiceRow(s, { label: mode === 'free' ? 'Opponent' : 'Dummy', options: charOptions, get: () => st.cpu, set: (v) => { st.cpu = v; st.cpuForm = 0; refresh(); } }));
    add(SL.UI.choiceRow(s, { label: mode === 'free' ? 'Opponent Form' : 'Dummy Form', options: formOptions('cpu'), get: () => st.cpuForm, set: (v) => { st.cpuForm = v; refresh(); } }));
    const diffOpts = SL.Settings.SCHEMA.find((x) => x.key === 'difficulty').options;
    if (mode === 'free') {
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
