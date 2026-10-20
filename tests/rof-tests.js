// CHAPTER 17 · RESURRECTION OF F — "The Thousand Soldiers" (the invasion), headless on the real engine: campaign access
// and chronology, the new cast, a full bot playthrough with every scene watched, the forms the story allows, the horde's
// party defeat, the Super Saiyan fight's real defeat, and the trick cue.
const H = require('./headless');

module.exports = function rofTests({ test, eq, ok }) {
  console.log('\nChapter 17: Resurrection of F — The Thousand Soldiers (headless)');

  const pressing = (SL, fn) => {
    SL.Input.held = (a) => !!fn(a);
    SL.Input.pressed = (a) => !!fn(a);
  };
  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const at = (SL, id) => SL.data.missions.rof_invasion.phases.findIndex((p) => p.id === id);

  test('campaign access: Resurrection of F is Chapter 17, after the Battle of Gods and before Universe 6 (18); it opens after "My World"', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const chs = SL.data.story.chapters;
    const i = chs.findIndex((c) => c.id === 'super_rof');
    eq(chs.slice(i - 1, i + 4).map((c) => c.id).join(','), 'super1,super_rof,super_u6,super_future,super_hit', 'chapter order (Chapter 19 Future Trunks between Universe 6 and The Assassin)');
    ok(/^CHAPTER 17 · AGE 779/.test(chs[i].head) && chs[i].status === 'playable', chs[i].head);
    const order = SL.data.storyOrder();
    const k = order.indexOf('rof_invasion');
    eq(order.slice(k - 1, k + 2).join(','), 'bog_sphere,rof_invasion,rof_goku', 'canon order');
    const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
    ok(SL.data.storyLocked('rof_invasion', results([])), 'locked on a fresh save');
    ok(!SL.data.storyLocked('rof_invasion', results(['bog_sphere'])), 'opens after "My World"');
    ok(!SL.data.storyLocked('u6_cabba', results(['bog_sphere', 'u6_cabba'])), 'a save that already cleared the Cabba match keeps it open');
    eq(SL.data.eraOf('rof_invasion'), 'super', 'Super era');
    // This invasion gives no lasting Blue: Goku gets his in "Blue and Gold", Vegeta in the finale (movie givers unchanged).
    eq(SL.data.formGivenBy['vegeta:blue'], 'rof_finale', "Vegeta's lasting Blue is handed over by the finale, not the invasion");
    eq(SL.data.formGivenBy['goku:blue'], 'rof_goku', 'Goku\'s Blue is handed over by the following encounter');
    eq(SL.data.formGivenByMovie['goku:blue'], 'bb_legend', 'the film retains its own handover');
  });

  test('the new cast is valid: Tagoma (a fighter) and Sorbet (story only)', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    for (const id of ['tagoma', 'sorbet']) {
      const def = SL.data.characters[id];
      ok(def, id + ' exists');
      eq(SL.Schema.validateCharacter(def).join(' | '), '', id + ' schema');
    }
    ok(!SL.data.characters.sorbet.playable, 'sorbet is story cast');
    // the roster continuation (2026-10-14): Tagoma is a Free Battle fighter after "The Thousand Soldiers"; his own two
    // techniques are freeOnly, so the invasion's fight keeps the elite soldier's kit it was built with
    const tg = SL.data.characters.tagoma;
    ok(tg.playable && SL.data.unlocks.some((u) => u.target === 'tagoma' && u.condition.missionComplete === 'rof_invasion'), 'Tagoma: playable after "The Thousand Soldiers"');
    ok(tg.specials.special2.freeOnly && tg.specials.ultimate.freeOnly && !tg.specials.special1.freeOnly, 'his own techniques are Free Battle only');
    ok(tg.moves.light.length >= 3 && tg.moves.heavy[0], 'Tagoma fights');
  });

  test('a bot plays "The Thousand Soldiers" start to finish with every scene watched: every phase in order, 32 soldiers down, no engine errors or warnings, recorded on the canon story', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const r = gg.playMission('rof_invasion', { watch: true, maxSeconds: 900 });
    const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
    eq(r.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s)');
    eq(phases.join(','), 'arrival,horde,tagoma,gold,turnaround,trick,beam,after', 'every phase played');
    ok(r.m.kills >= 32, 'the soldiers fell: ' + r.m.kills);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    eq((gg.warnings || []).length, 0, 'warnings: ' + (gg.warnings || []).slice(0, 3).join(' | '));
    ok(r.record && r.record.completed && !gg.SL.Save.isMovie('rof_invasion'), 'recorded on the canon story');
    ok(r.log.some((x) => x.ev === 'skillLearned' && x.key === 'form:ssj'), 'Gohan\'s Super Saiyan came back to him in the story');
  });

  test('the forms the story allows: no Super Saiyan for Gohan before the Tagoma beat, no Super Saiyan 2 or Ultimate at all; Frieza in his final form, never Golden', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('rof_invasion', { startPhase: at(SL, 'horde') });
    gg.until(b, () => !b.inputLocked, 60 * 10);
    const S = b.story;
    eq(phaseOf(b), 'horde', 'in the horde');
    const locked = (f, id) => !!((f.lockedForms && f.lockedForms[id]) || (f.storyLocks && f.storyLocks[id]));
    ok(locked(S.gohan, 'ssj') && locked(S.gohan, 'ssj2') && locked(S.gohan, 'ultimate'), 'Gohan: SSJ held for the story, SSJ2 and Ultimate locked');
    eq(S.frieza.form.id, 'final', 'Frieza in his final form');
    ok(locked(S.frieza, 'golden'), 'Golden Frieza locked');
    eq((b.party || []).map((f) => f.def.id).join(','), 'adult_gohan,piccolo,krillin,tien', 'the party');
    b.dispose();
  });

  test('the horde is lost when all four heroes are down (retry from the horde), and a fallen hero is benched, never killed', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const hi = at(SL, 'horde');
    const b = gg.mission('rof_invasion', { startPhase: hi });
    gg.until(b, () => !b.inputLocked && phaseOf(b) === 'horde', 60 * 10);
    const S = b.story, heroes = [S.gohan, S.piccolo, S.krillin, S.tien];
    const foe = S.army.find((s) => s.alive);
    for (let i = 0; i < heroes.length; i++) {
      const f = heroes[i];
      f.hp = 5;
      f.takeHit(foe, { type: 'melee', damage: 500, knock: 'flinch', hitstun: 10, impact: 1, dir: foe.dirTo(f), point: f.chest() });
      gg.step(b, 10);
      if (i < heroes.length - 1) {
        ok(f.alive && f.benched, f.def.id + ' benched, alive');
        eq(b.mission.state, 'running', 'the fight goes on with ' + (heroes.length - 1 - i) + ' left');
      }
    }
    gg.until(b, () => b.mission.state !== 'running', 60 * 3);
    eq(b.mission.state, 'failed', 'all four down: defeat');
    eq(b.mission.checkpoint, hi, 'retry from the horde');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the Super Saiyan fight is a real defeat when Gohan is knocked out (retry from it); the trick cue is taken by the real Guard button', () => {
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const ti = at(SL, 'turnaround');
      const b = gg.mission('rof_invasion', { startPhase: ti });
      gg.until(b, () => !b.inputLocked && phaseOf(b) === 'turnaround', 60 * 10);
      const g = b.story.gohan, t = b.story.tagoma;
      eq(g.form.id, 'ssj', 'Super Saiyan Gohan');
      g.hp = 5;
      g.takeHit(t, { type: 'melee', damage: 800, knock: 'flinch', hitstun: 10, impact: 1, dir: t.dirTo(g), point: g.chest() });
      gg.until(b, () => b.mission.state !== 'running', 60 * 3);
      eq(b.mission.state, 'failed', 'knocked out: defeat');
      eq(b.mission.checkpoint, ti, 'retry from the Super Saiyan fight');
      b.dispose();
    }
    {
      const gg = H.create({ quiet: true, seed: 11 });
      const { SL } = gg;
      const b = gg.mission('rof_invasion', { startPhase: at(SL, 'trick') });
      const cues = [];
      b.on('cueDone', (r) => cues.push(r));
      let cueAt = 0;
      b.on('cue', () => (cueAt = b.frame));
      pressing(SL, (a) => b.cue && (a === b.cue.action || a === b.cue.key) && b.frame - cueAt > 6);
      ok(gg.until(b, () => phaseOf(b) === 'beam', 60 * 30) >= 0, 'the trick plays through');
      eq(cues.map((c) => c.key + ':' + c.pressed).join(','), 'guard:true', 'Guard taken by the button');
      eq(b.story.gohan.form.id, 'base', 'knocked out of the gold');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });
};
