// CHAPTER 18 · UNIVERSE 6 — "The Pride of Sadala" (Vegeta vs Cabba), headless on the real engine: campaign access and
// the lock chain, the cast's schema, a full bot playthrough with every scene watched, the awakening (skipped or not), the
// one-second Blue lesson taken by the real buttons, the ring-out that ends the match, and a real defeat (ring-out / KO).
const H = require('./headless');

module.exports = function universe6Tests({ test, eq, ok }) {
  console.log('\nChapter 18: Universe 6 — The Pride of Sadala (headless)');

  const pressing = (SL, fn) => {
    SL.Input.held = (a) => !!fn(a);
    SL.Input.pressed = (a) => !!fn(a);
  };
  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const at = (SL, id) => SL.data.missions.u6_cabba.phases.findIndex((p) => p.id === id);

  test('campaign access: Chapter 18 sits between Resurrection of F and the Future Trunks / Hit / Universe Survival / Tournament of Power chapters (19-22) before the End of Z (Chapter 23), opens after Goku\'s Resurrection of F encounter, and never locks a save that already cleared the End of Z', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const chs = SL.data.story.chapters;
    const i = chs.findIndex((c) => c.id === 'super_u6');
    eq(chs.slice(i - 1, i + 6).map((c) => c.id).join(','), 'super_rof,super_u6,super_future,super_hit,super_survival,super_top,endz', 'chapter order');
    ok(/^CHAPTER 18/.test(chs[i].head) && chs[i].status === 'playable', chs[i].head);
    ok(/^CHAPTER 23/.test(chs[i + 5].head), 'the End of Z is Chapter 23: ' + chs[i + 5].head);
    eq(SL.data.missions.endz_village.chapter, 'CHAPTER 23 · THE END OF Z', 'its missions say so too');
    const order = SL.data.storyOrder();
    const k = order.indexOf('u6_botamo');
    eq(order[k - 1], 'rof_finale', 'Chapter 18 follows Resurrection of F in canon order');
    const e = order.indexOf('endz_village');
    eq(order.slice(e - 2, e + 1).join(','), 'top_mui,top_finale,endz_village', 'the Tournament of Power ends right before the End of Z');
    const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
    ok(SL.data.storyLocked('u6_botamo', results([])), 'locked on a fresh save');
    ok(SL.data.storyLocked('u6_botamo', results(['bog_sphere'])), 'it waits for Resurrection of F');
    ok(SL.data.storyLocked('u6_botamo', results(['rof_invasion'])), 'the invasion alone does not skip Goku\'s encounter');
    ok(SL.data.storyLocked('u6_botamo', results(['rof_goku'])), "Goku's encounter alone does not skip the finale");
    ok(!SL.data.storyLocked('u6_botamo', results(['rof_finale'])), 'Chapter 18 opens after the Resurrection of F finale');
    ok(SL.data.storyLocked('u6_cabba', results(['rof_finale'])), 'Cabba\'s match waits for the matches before it');
    ok(!SL.data.storyLocked('u6_cabba', results(['u6_magetta'])), 'and opens after Magetta\'s');
    ok(SL.data.storyLocked('endz_village', results(['rof_finale'])), 'the End of Z waits for it');
    ok(!SL.data.storyLocked('endz_village', results(['bog_sphere', 'endz_village'])), 'a save that already cleared the End of Z keeps it open');
    eq(SL.data.eraOf('u6_cabba'), 'super', 'it belongs to the Super era (wardrobe)');
    eq(SL.data.formGivenBy['cabba:ssj'], 'u6_cabba', 'Cabba\'s gold is given by this mission');
  });

  test('the Universe 6 cast is valid: Cabba is a playable fighter (Super Saiyan after this mission in Free Battle); Frost and Hit become fighters after their rounds; Botamo, Magetta, Champa and Vados are story cast', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    for (const id of ['cabba', 'frost', 'hit', 'botamo', 'magetta', 'champa', 'vados']) {
      const def = SL.data.characters[id];
      ok(def, id + ' exists');
      eq(SL.Schema.validateCharacter(def).join(' | '), '', id + ' schema');
      eq(def.assetLevel, 1, id + ' is a Level 1 prototype');
    }
    const cb = SL.data.characters.cabba;
    ok(cb.playable, 'Cabba is playable');
    eq(cb.forms.map((f) => f.id).join(','), 'base,ssj', 'base and Super Saiyan');
    eq(cb.forms[1].freeUnlock, 'u6_cabba', 'Free Battle gold after the mission');
    for (const id of ['botamo', 'champa', 'vados']) ok(!SL.data.characters[id].playable, id + ' is story cast');
    // the roster continuation (2026-10-14): Magetta is a fighter after his round, with the two techniques he lacked —
    // marked freeOnly, so "Iron and Magma" keeps the body press as his only special (the lava is the mission's)
    const mg = SL.data.characters.magetta;
    ok(mg.playable && SL.data.unlocks.some((u) => u.target === 'magetta' && u.condition.missionComplete === 'u6_magetta'), 'Magetta: playable after "Iron and Magma"');
    ok(mg.specials.special2.freeOnly && mg.specials.ultimate.freeOnly && !mg.specials.special1.freeOnly, 'his new techniques are Free Battle only');
    // the roster expansion (2026-10-14): Frost and Hit are Free Battle fighters once their rounds are won — full
    // kits (Hit: Time-Skip, Time Cage, Flash Fist Crush), and Frost's final form only after "The Gentleman"
    const unlockOf = (id) => (SL.data.unlocks.find((u) => u.type === 'characters' && u.target === id) || {}).condition;
    ok(SL.data.characters.frost.playable && unlockOf('frost').missionComplete === 'u6_frost_vegeta', 'Frost: playable after "One Punch for a Cheat"');
    eq(SL.data.characters.frost.forms[1].freeUnlock, 'u6_frost_goku', 'his final form opens in Free Battle after "The Gentleman"');
    const hit = SL.data.characters.hit;
    ok(hit.playable && unlockOf('hit').any.some((c) => c.missionComplete === 'u6_goku_hit'), 'Hit: playable after "The Unfinished Match"');
    eq(['special1', 'special2', 'ultimate'].map((k) => hit.specials[k].type).join(','), 'timeSkip,godBind,rush', 'Hit\'s three techniques');
    ok(SL.data.unlocks.some((u) => u.target === 'cabba' && u.condition.missionComplete === 'u6_cabba'), 'Cabba unlocks with the mission');
    ok(SL.data.unlocks.some((u) => u.target === 'u6_arena' && u.condition.missionComplete === 'u6_cabba'), 'and the arena');
    ok(SL.data.stages.u6_arena.ringOut, 'the arena plays by tournament rules in Free Battle');
  });

  test('a bot plays "The Pride of Sadala" start to finish with every scene watched: every phase in order, no engine errors or warnings, recorded on the canon story, Cabba and the arena unlocked', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const r = gg.playMission('u6_cabba', { watch: true, maxSeconds: 900 });
    const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
    eq(r.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s)');
    eq(phases.join(','), 'arena,spar,provoke,awaken,flurry,test,lesson,after', 'every phase played');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    eq((gg.warnings || []).length, 0, 'warnings: ' + (gg.warnings || []).slice(0, 3).join(' | '));
    ok(r.record && r.record.completed && !gg.SL.Save.isMovie('u6_cabba'), 'recorded on the canon story');
    ok(gg.SL.Save.isUnlocked('characters', 'cabba') && gg.SL.Save.isUnlocked('stages', 'u6_arena'), 'Cabba and the Nameless Planet unlocked');
    const S = r.b.story;
    eq(S.vegeta.form.id, 'base', 'Vegeta ends in base form');
    eq(S.cabba.form.id, 'base', 'the gold has gone out of Cabba');
  });

  test('the match before the awakening: Cabba\'s gold is locked, Vegeta cannot transform, and only Vegeta can be rung out (the rules are real)', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('u6_cabba', { startPhase: at(SL, 'spar') });
    gg.until(b, () => !b.inputLocked, 60 * 10);
    const S = b.story;
    eq(phaseOf(b), 'spar', 'in the fight');
    ok(S.cabba.lockedForms && S.cabba.lockedForms.ssj, 'Cabba cannot go Super Saiyan yet');
    eq(b.rules.allowTransform, false, 'Vegeta fights in base form (Version B)');
    eq((b.rules.ringOut.fighters || []).map((f) => f.def.id).join(','), 'vegeta', 'ring-out rule on Vegeta only');
    ok(S.cabba.controller instanceof SL.AIController, 'Cabba fights');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('THE AWAKENING, skipped, lands on the same state: Cabba Super Saiyan (gold hair), Vegeta base, and the next fight in the player\'s hands with Cabba fighting', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = gg.mission('u6_cabba', { startPhase: at(SL, 'awaken') });
    pressing(SL, () => false);
    ok(gg.until(b, () => phaseOf(b) === 'test' && !b.inputLocked, 60 * 40, () => {
      if (b.inputLocked) b.skipRequested = true;
    }) >= 0, 'reaches the Super Saiyan fight');
    const S = b.story;
    eq(S.cabba.form.id, 'ssj', 'Cabba is Super Saiyan');
    eq(S.cabba.form.look.hair.style, 'gohan_teen_ssj', 'with the gold hair');
    eq(S.vegeta.form.id, 'base', 'Vegeta still in base');
    ok(b.player === S.vegeta && S.vegeta.controller instanceof SL.PlayerController, 'Vegeta is the player\'s');
    ok(S.cabba.controller instanceof SL.AIController && S.cabba.state !== 'scripted', 'Cabba is fighting: ' + S.cabba.state);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('THE LESSON is played with the real buttons: Charge for one second of Blue, Heavy for the jab; Vegeta is Blue for it and back in base after; Cabba ends outside the ring, a ring-out the announcer calls', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('u6_cabba', { startPhase: at(SL, 'lesson') });
    const cues = [], forms = [], ends = [];
    b.on('cueDone', (r) => cues.push(r));
    b.on('formChanged', (e) => e.fighter === b.story.vegeta && forms.push(e.form.id));
    b.on('matchEnd', (e) => ends.push(e.how + ':' + e.winner.def.id));
    let cueAt = 0;
    b.on('cue', () => (cueAt = b.frame));
    pressing(SL, (a) => b.cue && (a === b.cue.action || a === b.cue.key) && b.frame - cueAt > 12);
    ok(gg.until(b, () => phaseOf(b) === 'after', 60 * 60) >= 0, 'the lesson plays through');
    eq(cues.map((c) => c.key).join(','), 'charge,heavy', 'two beats the player answers');
    ok(cues.every((c) => c.pressed), 'both taken by the button');
    ok(forms.includes('blue'), 'Vegeta went Super Saiyan Blue: ' + forms.join(','));
    const S = b.story;
    eq(S.vegeta.form.id, 'base', 'for one second only');
    eq(S.cabba.form.id, 'base', 'Cabba knocked out of the gold');
    ok(!b.stage.arena.onRing(S.cabba.pos.x, S.cabba.pos.z), 'Cabba lies outside the ring');
    eq(ends.join(','), 'ringout:vegeta', 'the match ends on a ring-out, Vegeta the winner');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('a defeat is real: rung out of the ring (or knocked out) in the Super Saiyan fight, the mission fails and retries from that checkpoint', () => {
    for (const how of ['ringout', 'ko']) {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const ti = at(SL, 'test');
      const b = gg.mission('u6_cabba', { startPhase: ti });
      gg.until(b, () => !b.inputLocked && phaseOf(b) === 'test', 60 * 10);
      gg.step(b, 20);
      const v = b.story.vegeta;
      if (how === 'ringout') {
        // on the ground, outside the ring
        v.setPosition(new gg.V3(22, 0, 0));
        v.grounded = true;
      } else {
        v.hp = 1;
      }
      gg.until(b, () => b.mission.state !== 'running', 60 * 5);
      eq(b.mission.state, 'failed', how + ': the mission fails');
      eq(b.mission.checkpoint, ti, how + ': the retry is from the Super Saiyan fight');
      eq(gg.errors.length, 0, how + ' engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  test('Hit as a Free Battle fighter (2026-10-14): Time Cage holds the target in place and lets go; Flash Fist Crush lands', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'hit', p2: 'vegeta', distance: 4 });
    const p = b.player, v = b.fighters[1];
    v.controller = { update: () => SL.emptyIntent() };
    p.ki = p.kiMax;
    let n = 0, held = 0, freedAfter = false, dmg = 0;
    b.on('damage', (e) => e.attacker === p && (dmg += e.amount));
    p.controller = { update: () => { n++; const it = SL.emptyIntent(); it.s2 = n === 2; return it; } };
    gg.step(b, 200, () => {
      if (v.state === 'held') held++;
      else if (held > 0) freedAfter = true;
    });
    ok(held > 30, 'the cage holds him: ' + held + ' frames');
    ok(freedAfter, 'and lets him go');
    p.ki = p.kiMax;
    n = 0;
    p.controller = { update: () => { n++; const it = SL.emptyIntent(); it.ult = n === 2; return it; } };
    gg.step(b, 200);
    ok(dmg > 0, 'Flash Fist Crush lands: ' + Math.round(dmg));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });
};
