// Resurrection of F, Goku's encounter: real engine behaviour, campaign access, Blue's canon/movie
// chronology, held-input and skip safety, playable checkpoints, defeat/retry, and the Sorbet handoff.
const H = require('./headless');

module.exports = function rofGokuTests({ test, eq, ok }) {
  console.log('\nChapter 17: Resurrection of F — Goku vs Frieza (headless)');
  const ID = 'rof_goku';
  const PHASES = 'arrival,base,full,blue,golden,duel,stamina,ambush,after';
  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const at = (SL, id) => SL.data.missions[ID].phases.findIndex((p) => p.id === id);
  const locked = (f, id) => !!((f.lockedForms && f.lockedForms[id]) || (f.storyLocks && f.storyLocks[id]));
  const pressing = (SL, fn) => {
    SL.Input.held = (a) => !!fn(a);
    SL.Input.pressed = (a) => !!fn(a);
  };
  const clean = (gg, where) => {
    eq(gg.errors.length, 0, where + ' errors: ' + gg.errors.slice(0, 3).join(' | '));
    eq(gg.warnings.length, 0, where + ' warnings: ' + gg.warnings.slice(0, 3).join(' | '));
  };

  test('the new encounter is canon, opens after the invasion, precedes Cabba, and preserves already-cleared downstream saves', () => {
    const gg = H.create({ quiet: true, seed: 3 }), { SL } = gg;
    const def = SL.data.missions[ID];
    ok(def && def.canon && !def.whatIf && !SL.Save.isMovie(ID), 'a main-story encounter');
    eq(def.character, 'goku', 'Goku is playable');
    eq(def.phases.map((p) => p.id).join(','), PHASES, 'the bounded encounter');
    const order = SL.data.storyOrder(), i = order.indexOf(ID);
    eq(order.slice(i - 1, i + 2).join(','), 'rof_invasion,rof_goku,rof_finale', 'canon order (the finale follows it)');
    const results = (done) => (id) => done.includes(id) ? { completed: true } : null;
    ok(SL.data.storyLocked(ID, results([])), 'locked on a fresh save');
    ok(SL.data.storyLocked(ID, results(['bog_sphere'])), 'Battle of Gods alone does not skip the invasion');
    ok(!SL.data.storyLocked(ID, results(['rof_invasion'])), 'the invasion opens it');
    ok(SL.data.storyLocked('rof_finale', results(['rof_invasion'])), 'the finale waits for this encounter');
    ok(!SL.data.storyLocked('rof_finale', results([ID])), 'the next playable card opens after it');
    ok(!SL.data.storyLocked('u6_cabba', results(['u6_cabba'])), 'an old cleared Cabba card stays playable');
    ok(!SL.data.storyLocked('endz_village', results(['endz_village'])), 'an old cleared End of Z card stays playable');
    eq(SL.data.formGivenBy['goku:blue'], ID, 'lasting main-story Goku Blue');
    eq(SL.data.formGivenBy['frieza:golden'], ID, 'Golden appears in the main story here');
    eq(SL.data.formGivenByMovie['goku:blue'], 'bb_legend', 'the film still hands over its own Blue');
    eq(SL.data.formGivenByMovie['frieza:golden'], 'bb_fusion', 'the film still hands over its own Golden');
    eq(SL.data.formGivenBy['vegeta:blue'], 'rof_finale', "Vegeta's persistent Blue waits for the next encounter, not this one");
    clean(gg, 'access');
  });

  test('each fight checkpoint restores the intended fighters/forms and a real defeat retries the same fight with control restored', () => {
    for (const [phase, gForm, fForm] of [['base', 'base', 'final'], ['full', 'base', 'full'], ['duel', 'blue', 'golden'], ['stamina', 'blue', 'golden']]) {
      const gg = H.create({ quiet: true, seed: 3 }), { SL } = gg;
      const cp = at(SL, phase);
      ok(cp >= 0 && SL.data.missions[ID].phases[cp].checkpoint, phase + ' is a checkpoint');
      const b = gg.mission(ID, { startPhase: cp });
      ok(gg.until(b, () => phaseOf(b) === phase && !b.inputLocked, 60 * 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      }) >= 0, phase + ' returns control');
      const g = b.story.goku, f = b.story.frieza;
      eq(g.form.id, gForm, phase + ' Goku');
      eq(f.form.id, fForm, phase + ' Frieza');
      if (fForm === 'golden') ok([...f.model.mats.values()].some((mat) => mat.color && mat.color.getHex() === 0xe8b432), phase + ': visible Golden body palette');
      ok(b.player === g && !g.hidden && g.controller instanceof SL.PlayerController, phase + ': visible player');
      ok(!f.hidden && f.controller instanceof SL.AIController && !b.aiLocked, phase + ': active enemy');
      ok(!g.untargetable && !g.intangible && !f.untargetable && !f.intangible, phase + ': both fighters can exchange real damage');
      if (gForm === 'base') ok(locked(g, 'blue'), phase + ': Blue not revealed yet');
      else ok(!locked(g, 'blue'), phase + ': Blue available from the retry');
      if (gForm === 'blue') {
        const down = SL.RadialMenu.buildEntries(g, b).find((e) => e.id === 'revert');
        ok(down && down.locked, phase + ': the wheel explains why Power Down is unavailable');
        pressing(SL, (a) => a === 'revert');
        gg.step(b, 3);
        eq(g.form.id, 'blue', phase + ': the real Power Down key cannot strand Goku in base');
        pressing(SL, () => false);
      }
      g.hp = 5;
      g.takeHit(f, { type: 'melee', damage: 100000, knock: 'flinch', hitstun: 10, impact: 1, dir: f.dirTo(g), point: g.chest() });
      ok(gg.until(b, () => b.mission.state !== 'running', 60 * 5) >= 0, phase + ': defeat resolves');
      eq(b.mission.state, 'failed', phase + ': KO fails');
      eq(b.mission.checkpoint, cp, phase + ': retry checkpoint');
      ok(!SL.Save.missionResult(ID), phase + ': no success record from defeat');
      b.dispose();
      const retry = gg.mission(ID, { startPhase: cp });
      ok(gg.until(retry, () => phaseOf(retry) === phase && !retry.inputLocked, 60 * 90, () => {
        if (retry.inputLocked) retry.skipRequested = true;
      }) >= 0, phase + ': retry returns control');
      eq(retry.story.goku.form.id, gForm, phase + ': retry Goku form');
      eq(retry.story.frieza.form.id, fForm, phase + ': retry Frieza form');
      ok(retry.story.goku.hp > 5 && !retry.story.goku.hidden, phase + ': retry is on his feet');
      retry.dispose();
      clean(gg, phase);
    }
  });

  test('Blue requires held Charge: idle input and Skip cannot grant it, then the real button completes the reveal and teaches it', () => {
    const gg = H.create({ quiet: true, seed: 7 }), { SL } = gg, learned = [];
    const b = gg.mission(ID, {
      startPhase: at(SL, 'blue'),
      onCreate: (battle) => battle.on('skillLearned', (e) => learned.push(e)),
    });
    pressing(SL, () => false);
    ok(gg.until(b, () => b.mission.prompts.has('ascend_blue') && !b.inputLocked, 60 * 60) >= 0, 'reaches the held-charge prompt');
    gg.step(b, 120, () => { b.skipRequested = true; });
    eq(phaseOf(b), 'blue', 'Skip does not answer a gameplay hold');
    ok(b.story.goku.form.id !== 'blue' && locked(b.story.goku, 'blue'), 'idle has not revealed Blue');
    pressing(SL, (a) => a === 'charge');
    ok(gg.until(b, () => phaseOf(b) === 'golden', 60 * 90) >= 0, 'held Charge reaches the Golden reveal');
    eq(b.story.goku.form.id, 'blue', 'Blue from real Charge');
    ok(!locked(b.story.goku, 'blue'), 'the story lock is removed');
    eq(learned.filter((e) => e.fighter === b.story.goku && e.key === 'form:blue').length, 1, 'Blue taught once');
    ok(b.mission.flags.ascended_blue >= 2, 'the hold took real simulated time');
    b.dispose();
    clean(gg, 'held Charge');
  });

  test('watching or skipping the Blue/Golden reveal returns the same playable Blue-vs-Golden state without bypassing the hold', () => {
    const states = [];
    for (const skip of [false, true]) {
      const gg = H.create({ quiet: true, seed: 7 }), { SL } = gg;
      const b = gg.mission(ID, { startPhase: at(SL, 'blue') });
      pressing(SL, (a) => a === 'charge' || !!(b.cue && (a === b.cue.action || a === b.cue.key)));
      ok(gg.until(b, () => phaseOf(b) === 'duel' && !b.inputLocked, 60 * 120, () => {
        if (skip && b.inputLocked) b.skipRequested = true;
      }) >= 0, (skip ? 'skipped' : 'watched') + ': reaches the duel');
      const S = b.story;
      states.push([S.goku.form.id, S.frieza.form.id, locked(S.goku, 'blue'), locked(S.frieza, 'golden'), S.goku.hidden, S.frieza.hidden, b.aiLocked].join(','));
      ok(b.player === S.goku && S.goku.controller instanceof SL.PlayerController, 'Goku returns to the player');
      ok(S.frieza.controller instanceof SL.AIController && S.frieza.state !== 'scripted', 'Frieza fights');
      ok(b.mission.flags.ascended_blue >= 2, 'the hold survives cutscene skipping');
      b.dispose();
      clean(gg, skip ? 'skipped reveal' : 'watched reveal');
    }
    eq(states[0], 'blue,golden,false,false,false,false,false', 'the intended playable state');
    eq(states[1], states[0], 'skip-safe result');
  });

  test('Blue unlocks in Free Battle from either canon RoF or the original movie clear, without crossing the save tracks or giving Vegeta Blue', () => {
    for (const giver of [ID, 'bb_legend']) {
      const gg = H.create({ quiet: true, seed: 3 }), { SL } = gg;
      const fm = SL.data.characters.goku.forms.find((f) => f.id === 'blue');
      ok(!SL.formFreeUnlocked(fm), 'fresh save: Blue locked');
      const before = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 8 });
      ok(locked(before.player, 'blue'), 'fresh Free Battle fighter locked');
      before.dispose();
      SL.Save.completeMission(giver, { score: 5000, rank: 'B' });
      ok(SL.formFreeUnlocked(fm), giver + ': Blue available');
      const after = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 8 });
      ok(!locked(after.player, 'blue'), giver + ': newly spawned Goku has Blue');
      const v = after.fighters.find((f) => f.def.id === 'vegeta');
      ok(locked(v, 'blue'), giver + ': Vegeta is not unlocked by Goku\'s giver');
      ok(!SL.Save.missionResult(giver === ID ? 'bb_legend' : ID), 'the alternate giver was not silently cleared');
      ok(SL.data.characters.frieza.forms.find((f) => f.id === 'golden').storyLocked, 'Golden remains a story-only form');
      after.dispose();
      clean(gg, giver + ' Free Battle');
    }
  });

  test('clears from either track never leak Blue/Golden into earlier canon, What-Ifs, Fusion Reborn, or pre-reveal Broly phases', () => {
    for (const clear of [ID, 'bb_legend']) {
      const gg = H.create({ quiet: true, seed: 3 }), { SL } = gg;
      SL.Save.completeMission(clear, { score: 5000, rank: 'B' });
      SL.Save.completeMission('bb_fusion', { score: 5000, rank: 'B' });
      for (const id of ['bog_sphere', 'whatif_twenty', 'fr_janemba', 'bb_goku']) {
        const b = gg.mission(id);
        gg.step(b, 3);
        const g = b.fighters.find((f) => f.def.id === 'goku');
        ok(g && locked(g, 'blue'), clear + ': ' + id + ' keeps Goku Blue ahead');
        const f = b.fighters.find((f) => f.def.id === 'frieza');
        if (f) ok(locked(f, 'golden'), clear + ': ' + id + ' keeps Golden ahead');
        b.dispose();
      }
      const film = gg.mission('bb_alliance');
      gg.step(film, 3);
      ok(!locked(film.story.goku, 'blue'), clear + ': later Broly Goku has Blue');
      film.dispose();
      const canon = gg.mission('endz_tournament');
      gg.step(canon, 3);
      const g = canon.fighters.find((f) => f.def.id === 'goku');
      ok(g && !locked(g, 'blue'), clear + ': later canon permits Goku Blue');
      canon.dispose();
      clean(gg, clear + ' chronology');
    }
  });

  test('the Sorbet ambush and Vegeta handoff are skip-safe: Goku remains hurt, Frieza depleted, and Vegeta guards between them', () => {
    for (const skip of [false, true]) {
      const gg = H.create({ quiet: true, seed: 7 }), { SL } = gg;
      let beams = 0;
      const needle = SL.data.brolyKit.needle;
      SL.data.brolyKit.needle = (...args) => { beams++; return needle(...args); };
      const b = gg.mission(ID, { startPhase: at(SL, 'ambush') });
      ok(gg.until(b, () => b.mission.state !== 'running', 60 * 120, () => {
        if (skip && b.inputLocked) b.skipRequested = true;
      }) >= 0, (skip ? 'skipped' : 'watched') + ': handoff completes');
      eq(b.mission.state, 'success', 'this encounter ends at the handoff');
      const S = b.story;
      ok(b.mission.flags.ambushed && b.mission.flags.vegetaHandoff, 'ambush and handoff executed');
      eq(S.goku.form.id, 'base', 'Goku powered down before the shot');
      ok(S.goku.hp > 0 && S.goku.hp <= S.goku.hpMax * 0.2 && S.goku.alive, 'Goku is injured and alive');
      eq(S.goku.state, 'scripted', 'the injured pose is preserved');
      eq(S.goku.sd.pose, 'knockdownFace', 'Goku stays down');
      ok(S.frieza.hp > 0 && S.frieza.hp <= S.frieza.hpMax * 0.1, 'Frieza stays depleted after the fight');
      eq(S.frieza.form.id, 'golden', 'Golden persists for the next encounter');
      eq(S.vegeta.form.id, 'base', 'Vegeta\'s reveal remains for the next encounter');
      eq(S.vegeta.sd.pose, 'guard', 'Vegeta visibly guards');
      ok(S.goku.pos.z < S.vegeta.pos.z && S.vegeta.pos.z < S.frieza.pos.z, 'Vegeta stands between Goku and Frieza');
      ok(S.krillin.pos.distanceTo(S.goku.pos) < 2.5, 'Krillin reaches the injured Goku even when skipped');
      if (!skip) eq(beams, 1, 'the watched scene actually stages Sorbet\'s beam');
      clean(gg, skip ? 'skipped ambush' : 'watched ambush');
      b.dispose();
    }
  });

  test('the complete encounter bot-plays watched and skipped: every phase, Blue learned, Sorbet ambush and Vegeta handoff, canon completion and no runtime errors', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: watch ? 11 : 5 });
      const r = gg.playMission(ID, { watch, maxSeconds: 1200 });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': ' + r.seconds.toFixed(1) + ' s, phase ' + phaseOf(r.b) +
        ', Goku HP ' + r.b.story.goku.hp + ', Frieza HP ' + r.b.story.frieza.hp + ', last events ' + JSON.stringify(r.log.slice(-4)));
      eq(r.log.filter((e) => e.ev === 'phase').map((e) => e.id).join(','), PHASES, 'every phase in order');
      ok(r.log.some((e) => e.ev === 'skillLearned' && e.key === 'form:blue'), 'Blue taught in the story');
      const S = r.b.story;
      ok(r.m.flags.goldenRevealed && r.m.flags.staminaWon && r.m.flags.ambushed && r.m.flags.vegetaHandoff,
        'the Golden reveal, stamina victory, ambush and handoff are delivered');
      ok(S.goku.alive && S.goku.hp > 0, 'Goku survives the scripted ambush');
      ok(S.frieza.alive && S.frieza.form.id === 'golden', 'Frieza survives for Vegeta\'s next encounter');
      ok(S.vegeta.alive && !S.vegeta.hidden && S.vegeta.form.id === 'base', 'Vegeta steps in without his persistent Blue unlock');
      ok(r.record && r.record.completed && !gg.SL.Save.isMovie(ID), 'completion on the canon track');
      ok(!gg.SL.Save.missionResult('bb_legend'), 'does not complete the film');
      clean(gg, watch ? 'full watched' : 'full skipped');
      r.b.dispose();
    }
  });
};
