/*
 * DEVELOPER / TEST MODE screens (src/core/dev.js holds the logic).
 *
 *   SL.Screens.devMenu()        mission + phase select, Free Battle / Training with everything
 *                               open, and the test-save tools
 *   SL.Screens.devPauseRows()   the in-battle tools added to the pause menu while the mode is on
 *
 * Every screen here is labelled DEV, and none of it exists unless the mode is on.
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;

  /** Missions in story order, then the What-Ifs, as [id, label] choice options. */
  function missionOptions() {
    const ids = SL.data.storyOrder().concat(Object.keys(SL.data.missions).filter((id) => SL.data.missions[id].whatIf), SL.data.movieOrder ? SL.data.movieOrder() : []);
    return ids.filter((id) => SL.data.missions[id]).map((id) => {
      const m = SL.data.missions[id];
      return [id, (m.whatIf ? 'WHAT IF · ' : m.movie ? 'MOVIE · ' : '') + m.title + '  (' + (m.chapter || '').replace(/ ·.*/, '') + ')'];
    });
  }

  SL.Screens.devMenu = function () {
    const s = new SL.Screen('settings dark');
    s.el.appendChild(el('h1', { class: 'title-font gradient-text', text: 'Developer / Test' }));
    s.el.appendChild(el('div', { class: 'hint', text: 'Test save in use — nothing here touches your real progress.' }));
    const rows = el('div', { class: 'rows', style: { maxWidth: '760px' } });
    s.el.appendChild(rows);
    const st = (SL.App.devSel = SL.App.devSel || { mission: 'namek_ginyu', phase: 0 });
    const add = (item) => rows.appendChild(item.node);
    let phaseRow = null;
    add(SL.UI.choiceRow(s, {
      label: 'Mission',
      options: missionOptions,
      get: () => st.mission,
      set: (v) => {
        st.mission = v;
        st.phase = 0;
        if (phaseRow) phaseRow.render();
      },
    }));
    phaseRow = SL.UI.choiceRow(s, {
      label: 'Start at',
      desc: 'Any phase, not only checkpoints (◆ = checkpoint).',
      options: () => (SL.data.missions[st.mission] || { phases: [] }).phases.map((p, i) => [i, i + 1 + ' · ' + p.id + (p.checkpoint ? ' ◆' : '')]),
      get: () => st.phase,
      set: (v) => (st.phase = v),
    });
    add(phaseRow);
    add(SL.UI.actionRow(s, 'Launch', () => SL.Dev.actions.startMission(st.mission, st.phase)));
    add(SL.UI.actionRow(s, 'Free Battle (every fighter, form and stage)', () => SL.UI.push(SL.Screens.select('free'))));
    add(SL.UI.actionRow(s, 'Training', () => SL.UI.push(SL.Screens.select('training'))));
    const note = el('div', { class: 'hint', text: '' });
    const flash = (t) => (note.textContent = t);
    add(SL.UI.actionRow(s, 'Backup Test Save', () => flash(SL.Dev.actions.backupTestSave() ? 'Test save backed up.' : 'Nothing to back up.')));
    add(SL.UI.actionRow(s, 'Restore Test Save Backup', () => flash(SL.Dev.actions.restoreTestSave() ? 'Backup restored.' : 'No backup yet.')));
    add(SL.UI.actionRow(s, 'Reset Test Save (copy real progress again)', () => SL.UI.confirm('Reset the test save?', 'It becomes a copy of your real progress again.', () => flash(SL.Dev.actions.resetTestSave() ? 'Test save reset.' : 'Failed.'), 'Reset')));
    add(SL.UI.actionRow(s, 'Clear Test Progress (brand-new test save)', () => SL.UI.confirm('Clear the test save?', 'Only the test save is cleared. Your real progress is not touched.', () => flash(SL.Dev.actions.clearTestProgress() ? 'Test progress cleared.' : 'Failed.'), 'Clear')));
    add(SL.UI.actionRow(s, 'Reset Control Hints', () => {
      SL.Dev.actions.resetHints();
      flash('Control hints will show again.');
    }));
    s.el.appendChild(note);
    const footer = SL.UI.footer([['confirm', 'Select'], ['adjust', 'Change'], ['back', 'Back']]);
    s.el.appendChild(footer);
    s.refreshGlyphs = () => footer.render();
    s.onBack = () => SL.UI.pop();
    s.focus(0, true);
    return s;
  };

  /** Rows for the pause menu while the mode is on; each tool resumes the fight after it runs. */
  SL.Screens.devPauseRows = function (s, battle, add, resume) {
    const A = SL.Dev.actions;
    const run = (fn) => () => {
      resume();
      fn();
    };
    add(SL.UI.actionRow(s, 'DEV · Skip Current Scene', run(() => A.skipScene(battle))));
    add(SL.UI.actionRow(s, 'DEV · Force Win', run(() => A.forceWin(battle))));
    add(SL.UI.actionRow(s, 'DEV · Force Loss', run(() => A.forceLoss(battle))));
    if (battle.mission) {
      add(SL.UI.actionRow(s, 'DEV · Restart This Phase', () => A.restartPhase(battle)));
      add(SL.UI.actionRow(s, 'DEV · Jump to Next Phase', () => A.nextPhase(battle)));
    }
    add(SL.UI.actionRow(s, 'DEV · Next Form', run(() => A.forceForm(battle))));
    add(SL.UI.actionRow(s, 'DEV · Reset Power (base form, full bars)', run(() => A.resetPower(battle))));
    add(SL.UI.actionRow(s, 'DEV · Spawn Enemy', run(() => A.spawn(battle, 'enemy'))));
    add(SL.UI.actionRow(s, 'DEV · Spawn Ally', run(() => A.spawn(battle, 'ally'))));
    add(SL.UI.actionRow(s, 'DEV · Spawn Target', run(() => A.spawn(battle, 'target'))));
  };
})();
