/*
 * In-battle screens: pause menu (with training options), controls reference,
 * battle results, mission results and mission failure.
 */
(function () {
  'use strict';
  const U = SL.util;
  const el = U.el;

  const REF = [
    ['Move', ['moveF', 'moveL', 'moveB', 'moveR']],
    ['Fly up / down', ['ascend', 'descend']],
    ['Boost · tap to dash', ['boost']],
    ['Light attack (chain up to 4)', ['light']],
    ['Heavy · finisher / launcher', ['heavy']],
    ['Heavy on a launched foe: chase', ['heavy']],
    ['Ki blast · hold to charge', ['blast']],
    ['Guard · press just before a hit: perfect', ['guard']],
    ['Guard + Heavy: throw', ['guard', 'heavy']],
    ['Dodge · just before a hit: vanish', ['dodge']],
    ['Dodge while stunned: escape', ['dodge']],
    ['Charge ki', ['charge']],
    ['Specials', ['special1', 'special2']],
    ['Ultimate', ['ultimate']],
    ['Transform / power down', ['transform', 'revert']],
    ['Switch target', ['target']],
    ['Boost with no direction: rush to target', ['boost']],
  ];

  SL.Screens.controls = function () {
    const s = new SL.Screen('modal');
    s.modal = true;
    const grid = el('div', { class: 'controls-ref' });
    const render = () => {
      grid.innerHTML = '';
      for (const [label, actions] of REF) {
        const k = el('div', { class: 'kbds' });
        k.innerHTML = actions.map((a) => SL.glyph(a)).join('');
        grid.append(el('div', { text: label }), k);
      }
    };
    render();
    const rows = el('div', { class: 'rows', style: { marginTop: '14px' } });
    const back = SL.UI.actionRow(s, 'Back', () => SL.UI.pop());
    rows.appendChild(back.node);
    s.el.appendChild(el('div', { class: 'panel' }, [el('h2', { text: 'Controls' }), grid, rows]));
    s.onBack = () => SL.UI.pop();
    s.refreshGlyphs = render;
    return s;
  };

  SL.Screens.pause = function (battle) {
    const s = new SL.Screen('modal');
    s.modal = true;
    const rows = el('div', { class: 'rows' });
    const add = (it) => rows.appendChild(it.node);
    const resume = () => SL.App.resumeBattle();
    add(SL.UI.actionRow(s, 'Resume', resume));
    add(SL.UI.actionRow(s, 'Controls', () => SL.UI.push(SL.Screens.controls())));
    add(SL.UI.actionRow(s, 'Settings', () => SL.UI.push(SL.Screens.settings())));
    if (battle.mode === 'training') {
      const st = SL.App.selectState.training;
      const dummy = () => battle.fighters.find((f) => f !== battle.player);
      add(SL.UI.choiceRow(s, {
        label: 'Dummy Behavior',
        options: [['idle', 'Stand Still'], ['guard', 'Always Guard'], ['dodge', 'Dodge Attacks'], ['blast', 'Fire Ki Blasts'], ['cpu', 'Fight Back (CPU)']],
        get: () => st.dummy,
        set: (v) => {
          st.dummy = v;
          const d = dummy();
          if (d && d.controller) d.controller.dummy = v;
        },
      }));
      add(SL.UI.toggleRow(s, { label: 'Infinite Health', get: () => battle.player.infiniteHp, set: (v) => (battle.player.infiniteHp = st.infHp = v) }));
      add(SL.UI.toggleRow(s, { label: 'Infinite Ki', get: () => battle.player.infiniteKi, set: (v) => (battle.player.infiniteKi = st.infKi = v) }));
      add(SL.UI.toggleRow(s, { label: 'Infinite Stamina', get: () => battle.player.infiniteStamina, set: (v) => (battle.player.infiniteStamina = st.infStamina = v) }));
      add(SL.UI.actionRow(s, 'Reset Positions', () => {
        SL.App.resetTraining();
        resume();
      }));
      add(SL.UI.actionRow(s, 'Change Setup', () => SL.App.quitToMenu('training')));
    } else if (battle.mode === 'story' && battle.mission) {
      const m = battle.mission;
      if (m.checkpoint) add(SL.UI.actionRow(s, 'Retry from Checkpoint', () => SL.UI.confirm('Retry from checkpoint?', 'Progress since the last checkpoint will be lost.', () => SL.App.startMission(m.def.id, { startPhase: m.checkpoint, retries: m.retries + 1 }), 'Retry')));
      add(SL.UI.actionRow(s, 'Restart Mission', () => SL.UI.confirm('Restart mission?', 'The mission starts over from the beginning.', () => SL.App.startMission(m.def.id, {}), 'Restart')));
      const wi = !!m.def.whatIf;
      add(SL.UI.actionRow(s, wi ? 'Back to What If?' : 'Back to Story', () => SL.UI.confirm('Leave the mission?', 'Mission progress will be lost.', () => SL.App.quitToMenu(wi ? 'whatif' : 'story', { mission: m.def.id }), 'Leave')));
    } else {
      add(SL.UI.actionRow(s, 'Restart Battle', () => SL.UI.confirm('Restart battle?', 'The current fight will be lost.', () => SL.App.rematch(), 'Restart')));
      add(SL.UI.actionRow(s, 'Change Characters', () => SL.UI.confirm('Leave this battle?', 'Return to character select.', () => SL.App.quitToMenu('free'), 'Leave')));
    }
    if (SL.Dev && SL.Dev.active && SL.Screens.devPauseRows) SL.Screens.devPauseRows(s, battle, add, resume);
    add(SL.UI.actionRow(s, 'Quit to Main Menu', () => SL.UI.confirm('Quit to main menu?', battle.mode === 'story' ? 'Mission progress will be lost.' : 'The current fight will be lost.', () => SL.App.quitToMenu(), 'Quit')));
    const title = battle.mode === 'story' && battle.mission ? battle.mission.def.title : battle.mode === 'training' ? 'Training' : 'Paused';
    // the objectives are always here, whatever Display & Immersion shows during play
    const goals = battle.mission ? battle.mission.objectives.filter((o) => !o.done && !o.failed) : [];
    const goalList = goals.length ? el('div', { class: 'pause-goals hint' }, goals.map((o) => el('div', { text: (o.optional ? '(Optional) ' : '') + o.text + (o.target ? ' — ' + o.count + '/' + o.target : '') }))) : null;
    s.el.appendChild(el('div', { class: 'panel' }, [el('h2', { text: title }), goalList, rows]));
    s.onBack = resume;
    return s;
  };

  function statList(pairs) {
    const l = el('div', { class: 'stat-list' });
    for (const [a, b] of pairs) l.append(el('span', { text: a }), el('span', { text: String(b) }));
    return l;
  }

  function fmtTime(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function unlockCards(unlocked) {
    const wrap = el('div', { class: 'unlock-cards' });
    for (const u of unlocked || []) {
      if (!u.title) continue;
      const img = u.type === 'characters' ? el('img', { src: SL.Portraits.get(u.target), alt: '' }) : el('span', { class: 'db-icon', style: { fontSize: '40px' } });
      wrap.appendChild(el('div', { class: 'unlock-card' }, [img, el('div', null, [el('div', { class: 'hint', text: 'NEW' }), el('div', { class: 'title-font', text: u.title })])]));
    }
    return wrap;
  }

  /** Why the fight went the way it did (from battle telemetry). */
  function insightList(battle) {
    const tel = battle.telemetry;
    const box = el('div', { class: 'insights' });
    if (!tel) return box;
    const me = tel.summary().find((r) => r.player);
    if (me) {
      box.appendChild(statList([
        ['Hits landed / taken', me.hitsLanded + ' / ' + me.hitsTaken],
        ['Perfect Guards / vanishes', me.perfectGuards + ' / ' + me.vanishes],
        ['Time stunned', Math.round(me.stunShare * 100) + '%'],
        ['Attacks that missed', Math.round(me.whiffRate * 100) + '%'],
      ]));
    }
    for (const t of tel.insights().slice(0, 3)) box.appendChild(el('div', { class: 'insight', text: t }));
    return box;
  }

  SL.Screens.results = function (battle, result, unlocked) {
    const s = new SL.Screen('results');
    const p = battle.player;
    const won = result.won;
    const winner = battle.fighters.find((f) => f.team === result.winnerTeam) || p;
    const left = el('div', { style: { textAlign: 'center' } }, [
      el('img', { src: SL.Portraits.get(winner.def.id, winner.formIndex, winner.wardrobe), style: { width: '260px', borderRadius: '50%', background: 'radial-gradient(circle,' + (winner.def.appearance.portraitColor || '#f80') + ',#0a0f28 70%)' }, alt: '' }),
      el('div', { class: 'outcome title-font gradient-text', text: won ? 'Victory' : 'Defeat' }),
      el('div', { class: 'hint', text: winner.name + (result.reason === 'time' ? ' wins on time' : ' wins') }),
    ]);
    const rows = el('div', { class: 'rows', style: { marginTop: '18px' } });
    const right = el('div', { class: 'panel' }, [
      el('h2', { text: 'Battle Report' }),
      statList([
        ['Time', fmtTime(battle.fightTime)],
        ['Damage dealt', U.fmtInt(p.stats.damage)],
        ['Best combo', p.stats.maxCombo + ' hits'],
        ['Beam clashes won', p.stats.clashesWon],
        ['Transformations', p.stats.transforms],
        ['Ultimates', p.stats.ultimates],
      ]),
      insightList(battle),
      unlockCards(unlocked),
      rows,
    ]);
    s.el.append(left, right);
    rows.appendChild(SL.UI.actionRow(s, 'Rematch', () => SL.App.rematch()).node);
    rows.appendChild(SL.UI.actionRow(s, 'Change Characters', () => SL.App.quitToMenu('free')).node);
    rows.appendChild(SL.UI.actionRow(s, 'Main Menu', () => SL.App.quitToMenu()).node);
    s.onBack = () => SL.App.quitToMenu('free');
    return s;
  };

  SL.Screens.missionResults = function (battle, result) {
    const s = new SL.Screen('results');
    const def = SL.data.missions[result.mission];
    const left = el('div', { style: { textAlign: 'center' } }, [
      el('div', { class: 'hint', text: def.chapter }),
      el('div', { class: 'outcome title-font gradient-text', text: def.whatIf ? 'What-If Complete' : def.hunt ? 'Dragon Ball Hunt' : 'Mission Complete' }),
      el('div', { class: 'big-rank gradient-text', text: result.rank }),
      el('div', { class: 'hint', text: 'Score ' + U.fmtInt(result.score) }),
    ]);
    const rows = el('div', { class: 'rows', style: { marginTop: '18px' } });
    const right = el('div', { class: 'panel' }, [
      el('h2', { text: def.title }),
      statList([
        ['Time', fmtTime(result.time)],
        ['Enemies defeated', result.kills],
        ['Damage taken', U.fmtInt(result.damageTaken)],
        ['Best combo', result.maxCombo + ' hits'],
        ['Optional objectives', result.optionalDone + ' / ' + result.optionalTotal],
        [def.qteLabel || 'Final struggle', Math.round(result.qte * 100) + '%'],
        ['Retries', result.retries],
      ]),
      unlockCards(result.unlocked),
      rows,
    ]);
    s.el.append(left, right);
    const back = def.whatIf ? 'whatif' : def.hunt ? 'dragonballs' : 'story';
    const here = { mission: result.mission, cleared: true };
    rows.appendChild(SL.UI.actionRow(s, 'Continue', () => SL.App.quitToMenu(back, here)).node);
    rows.appendChild(SL.UI.actionRow(s, 'Replay Mission', () => SL.App.startMission(result.mission, {})).node);
    if (result.unlocked && result.unlocked.some((u) => u.type === 'characters')) {
      const u = result.unlocked.find((x) => x.type === 'characters');
      rows.appendChild(SL.UI.actionRow(s, 'Try ' + SL.data.characters[u.target].name + ' in Free Battle', () => {
        SL.App.selectState.free = Object.assign(SL.App.selectState.free || {}, { p1: u.target, p1Form: 0 });
        SL.App.quitToMenu('free');
      }).node);
    }
    s.onBack = () => SL.App.quitToMenu(back, here);
    return s;
  };

  SL.Screens.missionFailed = function (battle, result) {
    const s = new SL.Screen('modal');
    s.modal = true;
    const rows = el('div', { class: 'rows' });
    if (result.checkpoint) rows.appendChild(SL.UI.actionRow(s, 'Retry from Checkpoint', () => SL.App.startMission(result.mission, { startPhase: result.checkpoint, retries: result.retries + 1 })).node);
    rows.appendChild(SL.UI.actionRow(s, 'Restart Mission', () => SL.App.startMission(result.mission, {})).node);
    rows.appendChild(SL.UI.actionRow(s, 'Lower Difficulty & Retry', () => {
      const order = ['easy', 'normal', 'hard', 'veryhard'];
      const i = Math.max(0, order.indexOf(SL.Settings.data.gameplay.difficulty) - 1);
      SL.Settings.set('gameplay.difficulty', order[i]);
      SL.App.startMission(result.mission, { startPhase: result.checkpoint || 0, retries: result.retries + 1 });
    }).node);
    const fdef = SL.data.missions[result.mission];
    const fback = fdef && fdef.whatIf ? 'whatif' : fdef && fdef.hunt ? 'dragonballs' : 'story';
    rows.appendChild(SL.UI.actionRow(s, fback === 'whatif' ? 'Back to What If?' : fback === 'dragonballs' ? 'Back to the Dragon Balls' : 'Back to Story', () => SL.App.quitToMenu(fback, { mission: result.mission })).node);
    rows.appendChild(SL.UI.actionRow(s, 'Quit to Main Menu', () => SL.App.quitToMenu()).node);
    s.el.appendChild(el('div', { class: 'panel' }, [el('h2', { text: 'Defeated' }), rows]));
    s.onBack = () => {};
    return s;
  };
})();
