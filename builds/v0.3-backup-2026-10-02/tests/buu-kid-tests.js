// Kid Buu (2026-10-02, the owner's Buu Saga brief, priority 11): the original Buu, the Earth destroyed
// as a stage state, the Sacred World of the Kai, Super Saiyan 3 as a draining resource, Vegeta's
// one minute as a real countdown and Good Buu as a playable interruption. Behaviour on the real
// engine, headless.
const H = require('./headless');

module.exports = function buuKidTests({ test, eq, ok }) {
  console.log('\nKid Buu: Pure Evil and Number One (headless)');

  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;

  test('Kid Buu is a body of his own: a child\'s size, black eyes with red irises, his own poses, wild AI and the Majin body', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const D = gg.SL.data.characters;
    const k = D.kid_buu;
    ok(k, 'the character exists');
    ok(k.appearance.height < D.goku.appearance.height && k.appearance.height < D.majin_buu.appearance.height, 'smaller than Goku and than the fat one');
    eq(k.appearance.face.sclera, 0x141418, 'black sclera');
    eq(k.appearance.face.pupil, 0xc01830, 'red irises');
    ok(['kb_idle', 'kb_tell', 'kb_scream', 'kb_burstUp', 'kb_laugh', 'kb_mouth'].every((p) => k.poses[p]), 'his own poses');
    eq(k.ai.hooks, 'kid_buu', 'his own AI hooks');
    ok(gg.SL.AIHooks.kid_buu && gg.SL.AIHooks.kid_buu.pre, 'and they exist');
    ok(k.majin && k.majin.maxReforms >= 1, 'he grows back');
    ok(!k.playable, 'not playable');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('unpredictable but readable: every trick (behind, hop, scream) comes after a tell the player can see', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'kid_buu', distance: 5, p1InfiniteHp: true });
    const kid = b.fighters[1];
    kid.controller = new SL.AIController(b, { difficulty: 'hard' });
    const tells = [], tricks = [];
    b.on('kidBuuTell', (e) => e.fighter === kid && tells.push({ frame: b.frame, trick: e.trick }));
    b.on('kidBuuTrick', (e) => e.fighter === kid && tricks.push({ frame: b.frame, trick: e.trick }));
    gg.step(b, 60 * 50);
    ok(tricks.length >= 6, 'he keeps doing it: ' + tricks.length + ' tricks in 50 s');
    eq(new Set(tricks.map((t) => t.trick)).size, 3, 'all three kinds: ' + [...new Set(tricks.map((t) => t.trick))].join(','));
    for (const t of tricks) {
      const tell = tells.filter((x) => x.frame <= t.frame).pop();
      ok(tell && tell.trick === t.trick, 'a ' + t.trick + ' is announced as itself');
      ok(tell && t.frame - tell.frame >= 20, 'with time to read it: ' + (tell ? t.frame - tell.frame : 'none') + ' frames');
    }
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Chapter 14 follows Chapter 13: Pure Evil, then Number One', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    eq(order.indexOf('buu_kidbuu'), order.indexOf('buu_inside') + 1, 'Pure Evil straight after the escape from inside Buu');
    eq(order.indexOf('buu_sacred'), order.indexOf('buu_kidbuu') + 1, 'Number One next');
    const chapters = SL.data.story.chapters;
    const c = chapters.find((x) => x.id === 'buu8');
    eq(c.missions.join(','), 'buu_kidbuu,buu_sacred', 'the chapter lists both');
    eq(chapters.indexOf(c), chapters.findIndex((x) => x.id === 'buu7') + 1, 'right after Chapter 13');
    const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
    ok(SL.data.storyLocked('buu_kidbuu', results(['buu_vegito'])), 'locked until Chapter 13 is played');
    ok(!SL.data.storyLocked('buu_kidbuu', results(['buu_inside'])), 'and opens after the escape');
  });

  test('"Pure Evil" plays through: the birth, the Planet Burst, the fetch from the Lookout, and the Earth gone — a world state, not a broken stage', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const order = [];
    let cues = 0;
    const r = gg.playMission('buu_kidbuu', {
      maxSeconds: 400,
      watch: true,
      onBattle: (b) => {
        b.on('missionPhase', () => order.push(phaseOf(b)));
        b.on('cue', () => cues++);
      },
    });
    const f = r.m.flags;
    eq(r.state, 'success', 'mission state');
    eq(order.join(','), 'burst,fetch,boom,after', 'the beats after the birth');
    ok(f.kidBorn && f.planetBurst && f.fetched && f.earthDestroyed, 'born, the ball, the fetch, the Earth gone');
    eq(cues, 2, 'two Instant Transmissions, played');
    eq(SL.Save.data.flags.earthDestroyed, true, 'the world state the next chapters read');
    eq(r.b.stage.def.id, 'rocky_canyon', 'the stage is back after the Lookout');
    ok(!SL.data.stages.rocky_canyon.destroyed && !SL.data.stages.lookout.destroyed, 'the reusable stages are never destroyed');
    ok(!r.b.story.burstOrb, 'the ball is cleaned up');
    eq([...new Set(gg.warnings)].join(' | '), '', 'warnings');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Number One" plays through: Goku\'s round in Super Saiyan 3, Vegeta\'s minute, Good Buu, the plan', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const seen = {};
    const r = gg.playMission('buu_sacred', {
      maxSeconds: 900,
      onBattle: (b) => {
        b.on('missionPhase', () => (seen[phaseOf(b)] = seen[phaseOf(b)] || {}));
        // who is fighting, read when each fight hands out its objective (the player is switched by then)
        b.on('objectives', (e) => {
          const id = phaseOf(b), p = b.player, s = seen[id];
          if (!s || s.player || !e.changed || !['apart', 'minute', 'stand'].includes(e.changed.id)) return;
          Object.assign(s, { player: p.def.id, form: p.form.id, gap: b.story.kid.storyNoSell, target: e.changed.target });
        });
      },
    });
    const f = r.m.flags;
    eq(r.state, 'success', 'mission state');
    eq(Object.keys(seen).join(','), 'goku,ask,minute,numberone,goodbuu,plan,after', 'the beats');
    eq(seen.goku.player + ':' + seen.goku.form, 'goku:ssj3', 'Goku fights in Super Saiyan 3');
    ok(f.gokuRound && (f.gokuRound.aparts >= 1 || f.gokuRound.dry || f.gokuRound.beaten), 'his round ends on a reason: ' + JSON.stringify(f.gokuRound));
    eq(seen.minute.player + ':' + seen.minute.form, 'vegeta:ssj2', 'the minute is Vegeta\'s, in Super Saiyan 2');
    eq(seen.minute.target, 60, 'one real minute');
    ok(seen.minute.gap && seen.minute.gap.from && seen.minute.gap.from[0].def.id === 'vegeta' && seen.minute.gap.mul < 1, 'his blows barely register (the power gap)');
    ok(f.minuteSurvived, 'he holds it');
    eq(seen.goodbuu.player, 'majin_buu', 'Good Buu is the player for the interruption');
    ok(f.goodBuuStood && f.numberOne && f.spiritBombPlan, 'Number One, Good Buu, the Spirit Bomb plan');
    eq(r.b.stage.def.id, 'kai_world', 'on the Sacred World of the Kai');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Super Saiyan 3 is a resource: it drains ki and runs dry; reading his tricks only counts when the player dodges', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const def = SL.data.missions.buu_sacred;
    const b = gg.mission('buu_sacred', { startPhase: def.phases.findIndex((p) => p.id === 'goku') });
    gg.step(b, 60 * 4);
    const g = b.story.goku;
    eq(g.form.id, 'ssj3', 'the round starts in the third level');
    const ki0 = g.ki;
    gg.step(b, 60 * 3);
    ok(g.ki < ki0 || g.form.id !== 'ssj3', 'it burns: ' + Math.round(ki0) + ' -> ' + Math.round(g.ki));
    // an idle player: beaten down or dry, never "reading" anything
    gg.until(b, () => phaseOf(b) !== 'goku', 60 * 120);
    eq(phaseOf(b), 'ask', 'the round ends by itself');
    const tells = b.mission.objectives.find((o) => o.id === 'tells');
    ok(!tells || (tells.count === 0 && !tells.done), 'nothing read without a dodge: ' + (tells && tells.count));
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('watched or skipped, Chapter 14 ends in the same world state', () => {
    for (const id of ['buu_kidbuu', 'buu_sacred']) {
      const flags = [];
      for (const watch of [true, false]) {
        const gg = H.create({ quiet: true, seed: 3 });
        const r = gg.playMission(id, { maxSeconds: 900, watch });
        eq(r.state, 'success', id + (watch ? ' watched' : ' skipped'));
        const keys = Object.keys(r.m.flags).filter((k) => r.m.flags[k] === true).sort();
        flags.push(keys.join(','));
        if (id === 'buu_kidbuu') eq(gg.SL.Save.data.flags.earthDestroyed, true, 'the Earth is gone either way');
        eq(gg.errors.length, 0, id + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      }
      eq(flags[1], flags[0], id + ': the same story flags');
    }
  });
};
