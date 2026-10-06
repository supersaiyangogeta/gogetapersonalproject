/*
 * Title, main menu, story timeline and records screens, plus the living 3D
 * menu background (which changes as the player progresses).
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;
  const V3 = THREE.Vector3;

  /* ---------------- 3D menu background ---------------- */
  class MenuScene {
    constructor() {
      const battle = (this.battle = new SL.Battle({ mode: 'menu', stageId: 'wasteland', fighters: [], rules: {} }));
      battle.phase = 'menu';
      const bardock = SL.Save.isUnlocked('menuScenes', 'bardock');
      const heroId = bardock && Math.random() < 0.5 ? 'bardock' : 'goku';
      this.hero = battle.spawn({ charId: heroId, team: 0, pos: new V3(0, 0, 0), dummy: 'idle' });
      this.hero.controller = null;
      this.hero.yaw = 0.5;
      this.hero.setState('scripted', { pose: 'idle' });
      if (bardock) {
        const other = heroId === 'bardock' ? 'goku' : 'bardock';
        this.rival = battle.spawn({ charId: other, team: 0, pos: new V3(-9, 0, -16), dummy: 'idle' });
        this.rival.controller = null;
        this.rival.yaw = 2.6;
        this.rival.setState('scripted', { pose: other === 'bardock' ? 'b_victory' : 'g_introPalm' });
      }
      this.powered = 0;
      this.time = 0;
      // where the hero sits in frame: left of centre for the menu column; a screen with its
      // column on the left and the scene on the right (the visual setup) sets lookShiftTarget
      this.lookShift = this.lookShiftTarget = 1.7;
      this.aimHero();
    }

    /** The menu's slow orbit round the hero (a screen that took the camera gives it back with this). */
    aimHero() {
      const hero = this.hero;
      this.battle.camera.playShot((t, out, el2) => {
        const c = hero.chest();
        const a = 0.9 + Math.sin(el2 * 0.06) * 0.35;
        const r = 5.4;
        out.pos.set(c.x + Math.sin(a) * r, c.y + 0.4 + Math.sin(el2 * 0.1) * 0.15, c.z + Math.cos(a) * r);
        const right = new V3(Math.cos(a), 0, -Math.sin(a));
        out.look.copy(c).addScaledVector(right, this.lookShift).add(new V3(0, 0.2, 0));
        out.fov = 52;
      }, 1e9, { hold: true, cut: true, blendIn: 0, kind: 'story' });
    }

    setPower(on) {
      const h = this.hero;
      if (on && !this.loop) {
        this.loop = SL.Audio.loop('aura', { vol: 0.8, ui: true });
        h.setState('scripted', { pose: 'charge', aura: 1, expression: 'shout' });
        if (!SL.Save.data.flags.menuPowerUp) {
          SL.Save.data.flags.menuPowerUp = true;
          SL.Save.write();
        }
      }
      if (!on && this.loop) {
        this.loop.stop(0.4);
        this.loop = null;
        h.setState('scripted', { pose: 'idle' });
      }
    }

    update(dt) {
      this.time += dt;
      this.lookShift += (this.lookShiftTarget - this.lookShift) * Math.min(1, dt * 1.5);
      if (this.loop) {
        this.loop.set(1);
        this.battle.camera.addTrauma(0.01);
        if (Math.random() < 0.08) this.battle.vfx.dust(this.hero.pos, 1.5, 3);
      }
      this.battle.update(dt);
    }

    render() {
      this.battle.render();
    }

    dispose() {
      if (this.loop) this.loop.stop(0.1);
      this.battle.dispose();
    }
  }
  SL.MenuScene = MenuScene;

  /* ---------------- title ---------------- */
  function logo(cls) {
    return el('div', { class: 'logo ' + (cls || '') }, [
      el('div', { class: 'top' }, [el('span', { class: 'db-icon', style: { fontSize: '0.9em' } }), el('span', { text: 'DRAGON BALL' })]),
      el('div', { class: 'big title-font gradient-text', text: 'Saiyan Legacy' }),
    ]);
  }
  SL.logo = logo;

  const LEGAL = 'Unofficial, non-commercial fan project. Dragon Ball © Bird Studio / Shueisha, Toei Animation. Not affiliated with or endorsed by Bandai Namco, Toei, or Shueisha.';

  SL.Screens = SL.Screens || {};

  SL.Screens.title = function () {
    const s = new SL.Screen('title-screen');
    const press = el('div', { class: 'press', text: 'PRESS ANY BUTTON' });
    s.el.append(logo(), el('div', { class: 'tag', text: SL.BUILD }), press, el('div', { class: 'legal', text: LEGAL }));
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      SL.Audio.init();
      SL.Audio.play('uiSelect');
      // first launch (and once for saves from before it existed): the visual experience choice,
      // over quiet music, before anything else
      const setup = !SL.Settings.data.visualExperienceConfigured;
      SL.Music.play('menu', { intensity: setup ? 0.3 : 1 });
      SL.UI.replace(setup ? SL.Screens.visualSetup() : SL.Screens.mainMenu());
    };
    s.handleNav = (nav) => {
      if (nav.any) go();
    };
    s.el.addEventListener('mousedown', go);
    return s;
  };

  /* ---------------- main menu ---------------- */
  SL.Screens.mainMenu = function () {
    const s = new SL.Screen('main-menu dim');
    const save = SL.Save.data;
    const col = el('div', { class: 'menu-col' });
    const brand = logo();
    brand.classList.add('brand');
    const next = nextMission();
    const storyCap = save.story.started ? (next ? 'Continue: ' + next.title : 'Replay any chapter') : 'Begin: ' + SL.data.missions.prologue_final_stand.title;
    const story = SL.UI.menuButton(s, save.story.started ? 'Story' : 'New Game', storyCap, () => SL.UI.push(SL.Screens.story(SL.App.storyFocus)), { isNew: !save.story.started });
    const free = SL.UI.menuButton(s, 'Free Battle', 'Any fighter, any stage', () => SL.UI.push(SL.Screens.select('free')));
    const train = SL.UI.menuButton(s, 'Training', 'Practice combos and techniques', () => SL.UI.push(SL.Screens.select('training')));
    col.append(story.node, free.node, train.node);
    if (SL.Screens.wardrobe) {
      const wd = SL.UI.menuButton(s, 'Customization', 'Outfits · Armor · Emblems · Scouters', () => SL.UI.push(SL.Screens.wardrobe()));
      col.append(wd.node);
    }
    if (SL.Save.isUnlocked('modes', 'whatif')) {
      const wi = SL.UI.menuButton(s, 'What If?', 'Alternate timelines', () => SL.UI.push(SL.Screens.whatIf()), { isNew: !SL.Save.data.whatIf.seen });
      col.append(wi.node);
    }
    if (SL.Save.hasProgress()) {
      const rec = SL.UI.menuButton(s, 'Records', 'Stats and completion', () => SL.UI.push(SL.Screens.records()));
      col.append(rec.node);
    }
    const settings = SL.UI.menuButton(s, 'Settings', 'Gameplay · Graphics · Audio · Controls', () => SL.UI.push(SL.Screens.settings()));
    col.append(settings.node);
    const devShown = !!(SL.Dev && SL.Dev.active && SL.Screens.devMenu);
    if (devShown) {
      const dev = SL.UI.menuButton(s, 'Developer Menu', 'DEV · test save · any mission, any phase', () => SL.UI.push(SL.Screens.devMenu()));
      col.append(dev.node);
    }
    // back from Settings with Developer / Test Mode switched: another save is active, so rebuild
    // (the button and the progress shown belong to the save that was active when this was built)
    s.onReturn = () => {
      if (devShown !== !!(SL.Dev && SL.Dev.active)) SL.UI.replace(SL.Screens.mainMenu());
    };

    const pct = SL.Save.completion();
    const progress = el('div', { class: 'progress' }, [el('b', { text: pct + '%' }), el('span', { text: 'COMPLETION' })]);
    const version = el('div', { class: 'version', text: SL.BUILD + ' · v' + SL.VERSION + ' — ' + LEGAL });
    const footer = SL.UI.footer([['confirm', 'Select']]);
    s.el.append(brand, col, progress, version, footer);
    s.refreshGlyphs = () => footer.render();
    s.onBack = () => {};
    s.onUpdate = () => {
      const scene = SL.App.menuScene;
      if (scene) scene.setPower(SL.Input.anyHeldRaw('charge'));
    };
    s.onHide = () => {
      if (SL.App.menuScene) SL.App.menuScene.setPower(false);
    };
    return s;
  };

  function nextMission() {
    for (const id of SL.data.storyOrder()) {
      const r = SL.Save.missionResult(id);
      if (!r || !r.completed) return SL.data.missions[id];
    }
    return null;
  }

  /** A selectable mission card (canon or What-If). */
  function missionCard(id, locked, hint) {
    const m = SL.data.missions[id];
    const res = SL.Save.missionResult(id);
    const card = el('div', { class: 'mcard' + (locked ? ' locked' : '') + (m.whatIf ? ' whatif' : '') });
    card.append(
      el('img', { class: 'portrait', src: SL.Portraits.get(m.character), alt: '' }),
      el('div', { class: 'm-title', text: m.title }),
      el('div', { class: 'm-sub', text: m.subtitle }),
      el('div', { class: 'm-blurb', text: locked ? hint : m.blurb })
    );
    const status = el('div', { class: 'm-status' });
    if (locked) status.append(el('span', { class: 'badge', text: 'LOCKED' }));
    else if (res && res.completed) status.append(el('span', { class: 'rank', text: res.bestRank || '—' }), el('span', { class: 'badge done', text: 'CLEARED' }));
    else status.append(el('span', { class: 'badge', text: 'NEW' }));
    if (m.whatIf) status.append(el('span', { class: 'badge whatif', text: 'WHAT IF' }));
    card.appendChild(status);
    return card;
  }

  function difficultyRow(s) {
    const diffRow = el('div', { class: 'rows', style: { maxWidth: '520px' } });
    const diff = SL.UI.choiceRow(s, {
      label: 'Difficulty',
      desc: 'Changes enemy reactions, guarding and damage.',
      options: SL.Settings.SCHEMA.find((x) => x.key === 'difficulty').options,
      get: () => SL.Settings.data.gameplay.difficulty,
      set: (v) => SL.Settings.set('gameplay.difficulty', v),
    });
    diffRow.appendChild(diff.node);
    return diffRow;
  }

  /* ---------------- story (canon timeline) ---------------- */
  /**
   * Story timeline. opts.mission: the mission the player is coming back from (opts.cleared if
   * they just finished it) — the list opens there, on the mission it unlocked when there is
   * one, with the finished card marked, instead of at the Prologue (owner, playtest round 2).
   */
  SL.Screens.story = function (opts = {}) {
    const s = new SL.Screen('story dim');
    s.el.appendChild(el('h1', { class: 'title-font gradient-text', text: 'Story' }));
    const tl = el('div', { class: 'timeline' });
    const order = SL.data.storyOrder();
    let focusItem = null;
    for (const ch of SL.data.story.chapters) {
      const col = el('div', { class: 'chapter' }, [el('div', { class: 'ch-head', text: ch.head }), el('div', { class: 'ch-title', text: ch.title })]);
      if (ch.status !== 'playable') {
        col.appendChild(el('div', { class: 'mcard locked' }, [
          el('div', { class: 'm-title', text: 'In Development' }),
          el('div', { class: 'm-sub', text: 'NOT IN THIS BUILD' }),
          el('div', { class: 'm-blurb', text: ch.blurb || '' }),
        ]));
        tl.appendChild(col);
        continue;
      }
      for (const id of ch.missions) {
        const m = SL.data.missions[id];
        if (!m) continue;
        const i = order.indexOf(id);
        const prev = i > 0 ? order[i - 1] : null;
        const locked = SL.data.storyLocked(id, (x) => SL.Save.missionResult(x));
        const card = missionCard(id, locked, 'Clear "' + (prev ? SL.data.missions[prev].title : '') + '" to continue the story.');
        col.appendChild(card);
        const res = SL.Save.missionResult(id);
        const rewards = el('div', { class: 'rewards' });
        rewards.innerHTML = (res && res.completed ? 'Unlocked: ' : 'Rewards: ') + m.rewards.map((r) => '<b>' + r + '</b>').join(' · ');
        col.appendChild(rewards);
        const item = s.addItem(card, { disabled: locked, onSelect: () => SL.App.startMission(id, {}) });
        item.missionId = id;
        if (opts.cleared && id === opts.mission) {
          card.classList.add('just-cleared');
          item.justCleared = true;
        }
        // focus the first chapter not yet cleared, otherwise the latest available one
        const cleared = !!(res && res.completed);
        if (!locked && (!focusItem || (focusItem.cleared && !cleared) || (focusItem.cleared && cleared))) focusItem = Object.assign(item, { cleared });
      }
      tl.appendChild(col);
    }
    s.el.appendChild(tl);
    s.el.appendChild(difficultyRow(s));
    const want = storyFocusTarget(order, opts);
    const byId = (id) => s.items.find((it) => it.missionId === id && !it.disabled);
    if (want && byId(want)) focusItem = byId(want);
    if (focusItem) s.focus(s.items.indexOf(focusItem), true);
    s.focusMission = focusItem && focusItem.missionId;
    // the list is built before it is on the page, where scrolling does nothing: scroll once shown
    s.onShow = () => {
      const it = s.items[s.index];
      const go = () => it && it.node.scrollIntoView && it.node.scrollIntoView({ block: 'center', inline: 'center' });
      go();
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(go);
    };
    const footer = SL.UI.footer([['confirm', 'Start'], ['adjust', 'Difficulty'], ['back', 'Back']]);
    s.el.appendChild(footer);
    s.refreshGlyphs = () => footer.render();
    s.onBack = () => SL.UI.pop();
    return s;
  };

  /**
   * Which mission the story list should open on. Coming back from a mission just cleared:
   * the next one in story order when it is playable (that is where the player is going),
   * otherwise the cleared one. Coming back any other way: the mission itself.
   */
  function storyFocusTarget(order, opts) {
    if (!opts || !opts.mission) return null;
    if (opts.cleared) {
      const i = order.indexOf(opts.mission);
      const next = i >= 0 ? order[i + 1] : null;
      if (next && !SL.data.storyLocked(next, (x) => SL.Save.missionResult(x))) return next;
    }
    return opts.mission;
  }
  SL.Screens.storyFocusTarget = storyFocusTarget;

  /* ---------------- What If? (alternate timelines, separate progress) ---------------- */
  SL.Screens.whatIf = function (opts = {}) {
    const s = new SL.Screen('story dim');
    s.el.appendChild(el('h1', { class: 'title-font gradient-text', text: 'What If?' }));
    s.el.appendChild(el('div', { class: 'hint', text: 'Alternate timelines. Nothing here changes the canon story or its progress.' }));
    const tl = el('div', { class: 'timeline' });
    let first = null;
    for (const w of SL.data.story.whatIf) {
      const m = SL.data.missions[w.mission];
      if (!m) continue;
      const base = SL.data.missions[w.branchOf];
      const col = el('div', { class: 'chapter' }, [el('div', { class: 'ch-head', text: 'BRANCHES FROM · ' + (base ? base.chapter : '') }), el('div', { class: 'ch-title', text: base ? base.title : '' })]);
      const locked = !SL.Save.conditionMet(SL.Save.data, w.unlock);
      const card = missionCard(w.mission, locked, w.hint);
      col.appendChild(card);
      const item = s.addItem(card, { disabled: locked, onSelect: () => SL.App.startMission(w.mission, {}) });
      if (!locked && !first) first = item;
      if (!locked && opts.mission === w.mission) {
        first = item;
        if (opts.cleared) card.classList.add('just-cleared');
      }
      tl.appendChild(col);
    }
    const next = el('div', { class: 'chapter' }, [el('div', { class: 'ch-head', text: 'NEXT BRANCH' }), el('div', { class: 'ch-title', text: '???' })]);
    next.appendChild(el('div', { class: 'mcard locked' }, [el('div', { class: 'm-title', text: 'In Development' }), el('div', { class: 'm-sub', text: 'NOT IN THIS BUILD' }), el('div', { class: 'm-blurb', text: 'More What-If stories will branch from later chapters.' })]));
    tl.appendChild(next);
    s.el.appendChild(tl);
    s.el.appendChild(difficultyRow(s));
    if (first) s.focus(s.items.indexOf(first), true);
    s.onShow = () => {
      const it = s.items[s.index];
      if (it && it.node.scrollIntoView) it.node.scrollIntoView({ block: 'center', inline: 'center' });
    };
    const footer = SL.UI.footer([['confirm', 'Start'], ['adjust', 'Difficulty'], ['back', 'Back']]);
    s.el.appendChild(footer);
    s.refreshGlyphs = () => footer.render();
    s.onBack = () => SL.UI.pop();
    return s;
  };

  /* ---------------- records ---------------- */
  SL.Screens.records = function () {
    const s = new SL.Screen('story dim');
    const st = SL.Save.data.stats;
    s.el.appendChild(el('h1', { class: 'title-font gradient-text', text: 'Records' }));
    const wrap = el('div', { style: { display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' } });
    const general = el('div', { class: 'panel' }, [el('h2', { text: 'Overall' })]);
    const list = el('div', { class: 'stat-list' });
    const rows = [
      ['Completion', SL.Save.completion() + '%'],
      ['Battles', st.battles],
      ['Wins', st.wins],
      ['Losses', st.losses],
      ['Best combo', st.maxCombo + ' hits'],
      ['Beam clashes won', st.clashesWon],
    ];
    for (const m of Object.values(SL.data.missions)) {
      const r = SL.Save.missionResult(m.id);
      rows.push([m.title, r && r.completed ? r.bestRank + ' · ' + U.fmtInt(r.bestScore) : '—']);
    }
    for (const [a, b] of rows) list.append(el('span', { text: a }), el('span', { text: String(b) }));
    general.appendChild(list);
    wrap.appendChild(general);

    const roster = el('div', { class: 'panel' }, [el('h2', { text: 'Fighters' })]);
    const rl = el('div', { class: 'stat-list' });
    for (const c of Object.values(SL.data.characters)) {
      if (!c.playable) continue;
      const un = SL.Save.isUnlocked('characters', c.id);
      const pc = st.perCharacter[c.id];
      rl.append(el('span', { text: un ? c.name : '???' }), el('span', { text: un ? (pc ? pc.wins + 'W / ' + pc.battles + ' · ' + U.fmtInt(pc.damage) + ' dmg' : 'not played') : 'locked' }));
    }
    roster.appendChild(rl);
    wrap.appendChild(roster);
    s.el.appendChild(wrap);
    const back = SL.UI.actionRow(s, 'Back', () => SL.UI.pop());
    const r = el('div', { class: 'rows', style: { maxWidth: '300px' } }, [back.node]);
    s.el.appendChild(r);
    s.onBack = () => SL.UI.pop();
    return s;
  };
})();
