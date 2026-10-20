// Resurrection of F, the finale ("Three Minutes"): campaign access and Vegeta's lasting Blue across canon / movie /
// Free Battle, a full bot playthrough with every scene watched, the duel's real defeat, the held-Charge reveal, the
// rewind's restored world on watched / skipped / direct starts, and the player-fired finish.
const H = require('./headless');

module.exports = function rofFinaleTests({ test, eq, ok }) {
  console.log('\nChapter 17: Resurrection of F — Three Minutes (headless)');
  const ID = 'rof_finale';
  const PHASES = 'confront,blue,duel,fall,space,finish,after';
  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const at = (SL, id) => SL.data.missions[ID].phases.findIndex((p) => p.id === id);
  const locked = (f, id) => !!((f.lockedForms && f.lockedForms[id]) || (f.storyLocks && f.storyLocks[id]));
  const pressing = (SL, fn) => {
    SL.Input.held = (a) => !!fn(a);
    SL.Input.pressed = (a) => !!fn(a);
  };
  const clean = (gg, where) => {
    eq(gg.errors.length, 0, where + ' errors: ' + gg.errors.slice(0, 3).join(' | '));
    eq((gg.warnings || []).length, 0, where + ' warnings: ' + (gg.warnings || []).slice(0, 3).join(' | '));
  };

  test('campaign access: the finale follows "Blue and Gold", precedes Chapter 18 (Universe 6, which opens on Botamo since 2026-10-11), and keeps already-cleared later cards open', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const def = SL.data.missions[ID];
    ok(def && def.canon && !SL.Save.isMovie(ID), 'a main-story encounter');
    eq(def.phases.map((p) => p.id).join(','), PHASES, 'the bounded encounter');
    const order = SL.data.storyOrder(), i = order.indexOf(ID);
    eq(order.slice(i - 1, i + 2).join(','), 'rof_goku,rof_finale,u6_botamo', 'canon order');
    const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
    ok(SL.data.storyLocked(ID, results(['rof_invasion'])), 'locked until Blue and Gold');
    ok(!SL.data.storyLocked(ID, results(['rof_goku'])), 'opens after Blue and Gold');
    ok(!SL.data.storyLocked('u6_cabba', results(['rof_goku', 'u6_cabba'])), 'an old cleared Cabba card stays open');
    ok(!SL.data.storyLocked('endz_village', results(['endz_village'])), 'an old cleared End of Z card stays open');
  });

  test("Vegeta's Blue: given by the finale in the main story, still by \"Wrath\" in the Broly film, and in Free Battle after either", () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    eq(SL.data.formGivenBy['vegeta:blue'], ID, 'main-story giver');
    eq(SL.data.formGivenByMovie['vegeta:blue'], 'bb_wrath', 'the film keeps its own reveal');
    const fm = SL.data.characters.vegeta.forms.find((f) => f.id === 'blue');
    eq([].concat(fm.freeUnlock).join(','), 'rof_finale,bb_wrath', 'Free Battle: either acquisition');
    ok(!SL.formFreeUnlocked(fm), 'locked in Free Battle on a fresh save');
    // before the finale (Blue and Gold) Vegeta's Blue is story-locked; after it (Cabba) it is not
    const before = gg.mission('rof_goku', { startPhase: 0 });
    ok(locked(before.story.vegeta, 'blue'), 'Blue and Gold: Vegeta has no Blue');
    before.dispose();
    const after = gg.mission('u6_cabba', { startPhase: 0 });
    ok(!(after.story.vegeta.storyLocks || {}).blue, 'Cabba (after the finale): not story-locked by chronology');
    eq(after.rules.allowTransform, false, 'and the Cabba match still keeps the player in base; its Blue stays a scripted flash');
    after.dispose();
    // the Broly film is unaffected: still ahead in "The First Clash"
    const film = gg.mission('bb_clash', { startPhase: 0 });
    ok(locked(film.story.vegeta, 'blue'), 'The First Clash: Blue still ahead in the film');
    film.dispose();
    SL.Save.completeMission(ID, { mission: ID, success: true, score: 1, rank: 'C' });
    ok(SL.formFreeUnlocked(fm), 'Free Battle Blue after the finale');
    clean(gg, 'givers');
  });

  test('a bot plays the finale start to finish with every scene watched: every phase, Blue taught, Earth back, Frieza gone, nobody else hidden, no errors or warnings', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const r = gg.playMission(ID, { watch: true, maxSeconds: 900 });
    const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
    eq(r.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s)');
    eq(phases.join(','), PHASES, 'every phase played');
    ok(r.log.some((x) => x.ev === 'skillLearned' && x.key === 'form:blue'), 'Vegeta\'s Blue taught by the story');
    const S = r.b.story;
    eq(r.b.stage.def.id, 'plains', 'the rewind brought the world back');
    ok(S.frieza.hidden, 'Frieza is dust');
    for (const k of ['goku', 'vegeta', 'gohan', 'piccolo', 'krillin', 'tien', 'whis']) ok(!S[k].hidden, k + ' is there');
    eq(S.vegeta.form.id + ',' + S.goku.form.id, 'blue,blue', 'both Saiyans Blue at the end');
    ok(S.goku.hpFrac > 0.9 && S.piccolo.hpFrac > 0.9, 'Goku and Piccolo healed by the senzu');
    ok(r.record && r.record.completed && !gg.SL.Save.isMovie(ID), 'recorded on the canon story');
    clean(gg, 'watched');
  });

  test('the Blue reveal is a gameplay hold (skip never answers it) and the duel is a real defeat when Vegeta is knocked out', () => {
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const b = gg.mission(ID, { startPhase: at(SL, 'blue') });
      pressing(SL, () => false);
      gg.until(b, () => false, 60 * 4, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(phaseOf(b), 'blue', 'still waiting on the hold');
      ok(b.story.vegeta.form.id !== 'blue', 'no Blue without Charge');
      pressing(SL, (a) => a === 'charge');
      ok(gg.until(b, () => phaseOf(b) === 'duel', 60 * 40, () => {
        if (b.inputLocked) b.skipRequested = true;
      }) >= 0, 'holding Charge reveals it');
      eq(b.story.vegeta.form.id, 'blue', 'Vegeta is Blue');
      b.dispose();
    }
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const di = at(SL, 'duel');
      const b = gg.mission(ID, { startPhase: di });
      gg.until(b, () => !b.inputLocked && phaseOf(b) === 'duel', 60 * 10);
      const v = b.story.vegeta, f = b.story.frieza;
      eq(v.form.id + ',' + f.form.id, 'blue,golden', 'the duel forms');
      ok(v.controller instanceof SL.PlayerController && v.state === 'free' && f.state === 'free', 'both fighting, Vegeta under control');
      v.hp = 5;
      v.takeHit(f, { type: 'melee', damage: 900, knock: 'flinch', hitstun: 10, impact: 1, dir: f.dirTo(v), point: v.chest() });
      gg.until(b, () => b.mission.state !== 'running', 60 * 3);
      eq(b.mission.state, 'failed', 'knocked out: defeat');
      eq(b.mission.checkpoint, di, 'retry from the duel');
      b.dispose();
    }
  });

  test('the rewind is local and consistent: skipped from the space checkpoint, the world is the plain again with the right actors and forms, and the finish is fired by the real Ultimate button', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = gg.mission(ID, { startPhase: at(SL, 'space') });
    gg.step(b, 10);
    eq(b.stage.def.id, 'orbit', 'from orbit');
    const cues = [];
    b.on('cueDone', (r) => cues.push(r));
    let cueAt = 0;
    b.on('cue', () => (cueAt = b.frame));
    pressing(SL, (a) => b.cue && (a === b.cue.action || a === b.cue.key) && b.frame - cueAt > 8);
    ok(gg.until(b, () => phaseOf(b) === 'after' || b.mission.state !== 'running', 60 * 60, () => {
      if (b.inputLocked && !b.cue) b.skipRequested = true;
    }) >= 0, 'skips through to the aftermath');
    const S = b.story;
    eq(b.stage.def.id, 'plains', 'back on the plain');
    eq(cues.map((c) => c.key + ':' + c.pressed).join(','), 'ult:true', 'the God Kamehameha fired by the button');
    ok(S.frieza.hidden, 'Frieza is dust');
    eq(S.vegeta.form.id + ',' + S.goku.form.id + ',' + S.frieza.form.id, 'blue,blue,final', 'forms after the rewind');
    for (const k of ['goku', 'vegeta', 'gohan', 'piccolo', 'krillin', 'tien', 'whis']) ok(!S[k].hidden, k + ' visible');
    // nothing left of the space set (the barrier, the Earth, the pieces) on the plain
    let stray = 0;
    b.scene.traverse((o) => {
      if (o.isMesh && o.geometry && o.geometry.parameters && (o.geometry.parameters.radius === 700 || o.geometry.parameters.radius === 4.2)) stray++;
    });
    eq(stray, 0, 'no Earth or barrier meshes left behind');
    clean(gg, 'rewind');
    b.dispose();
  });
};
