// The Future Trunks arrival (2026-09-24 rebuild): "The Stranger" (android_trunks) and "What He Came
// To Say" (android_warning). Behaviour on the real engine, headless: the Time Machine, the army and
// its finishers, the demonstration against Mecha Frieza, the Super Saiyan moment, King Cold and the
// sword, Goku's landing and Instant Transmission, the one-finger test, the medicine, the warning,
// the departure — plus unlocks, saves, the wardrobe and watched/skipped parity.
const H = require('./headless');

module.exports = function trunksArrivalTests({ test, eq, ok }) {
  console.log('\nThe Future Trunks arrival: "The Stranger" and "What He Came To Say" (headless)');

  const pi = (SL, id, ph) => SL.data.missions[id].phases.findIndex((p) => p.id === ph);
  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };

  /** Both missions played back to back by the bots, one save between them (lazy, shared). */
  const memo = {};
  function played(watch) {
    const k = watch ? 'watched' : 'skipped';
    if (memo[k]) return memo[k];
    const g = H.create({ quiet: true, seed: 5 });
    const out = { g, SL: g.SL, cues: {}, titles: [] };
    const listen = (id) => (b) => {
      out.cues[id] = [];
      b.on('cueDone', (e) => out.cues[id].push(e));
      b.on('titleCard', (e) => out.titles.push(e.chapter + ' / ' + e.title));
    };
    out.trunks = g.playMission('android_trunks', { maxSeconds: 1200, watch, onBattle: listen('android_trunks') });
    out.warning = g.playMission('android_warning', { maxSeconds: 900, watch, onBattle: listen('android_warning') });
    return (memo[k] = out);
  }

  test('the chapter opens after Namek: The Stranger, then What He Came To Say, then the Androids; each is locked until the one before is cleared', () => {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;
    const order = SL.data.storyOrder();
    const at = order.indexOf('namek_aftermath');
    eq(order.slice(at + 1, at + 4).join(' → '), 'android_trunks → android_warning → android_nineteen', 'the order');
    const done = (ids) => (id) => (ids.includes(id) ? { completed: true } : null);
    ok(SL.data.storyLocked('android_trunks', done(['namek_end'])) && !SL.data.storyLocked('android_trunks', done(['namek_aftermath'])), 'The Stranger opens after the Namek aftermath');
    ok(SL.data.storyLocked('android_warning', done(['namek_aftermath'])) && !SL.data.storyLocked('android_warning', done(['android_trunks'])), 'the warning opens after it');
    ok(SL.data.storyLocked('android_nineteen', done(['android_trunks'])) && !SL.data.storyLocked('android_nineteen', done(['android_warning'])), 'and the Androids after the warning');
    const T = SL.data.missions.android_trunks, W = SL.data.missions.android_warning;
    eq(T.character, 'future_trunks', 'The Stranger is played as Trunks');
    eq(T.phases.map((p) => p.id).join(','), 'arrive,machine,confront,barrage,massacre,reveal,frieza,finish,cold,after', 'its beats');
    eq(T.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'massacre,frieza,cold', 'checkpoints at the army, Frieza and Cold');
    eq(W.character, 'goku', 'the warning is played as Goku (the Instant Transmission demo; the test is played as Trunks)');
    eq(W.phases.map((p) => p.id).join(','), 'wait,landing,yardrat,aside,test,truth,future,medicine,warning,depart,after', 'its beats');
    eq(W.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'test', 'the sword test is the checkpoint');
  });

  test('Future Trunks has his own kit: a sword with deflections, Burning Attack, Finish Buster, Masenko, and a long story version of his transformation', () => {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;
    const t = SL.data.characters.future_trunks;
    eq(Object.values(t.specials).map((s) => s.id).join(','), 'burningAttack,shiningSword,finishBuster', 'his specials');
    ok(Object.values(t.extras || {}).some((x) => x.id === 'masenko'), "Masenko, his teacher's");
    eq((t.mechanic || {}).type, 'swordsman', 'the Sword Guard mechanic');
    ok(t.swordDeflect && t.swordDeflect.window > 0, 'a timed guard deflects ki blasts');
    eq((t.appearance.props || []).map((p) => p.id + ':' + p.shape).join(','), 'sword:broadsword,scabbard:sheath', 'a broadsword and the sheath on his back');
    const ssj = t.forms.find((f) => f.id === 'ssj');
    ok(ssj.storySequence && ssj.storySequence.length > ssj.sequence.length * 2, 'the story transformation is far longer than the gameplay one: ' + (ssj.storySequence && ssj.storySequence.length) + ' vs ' + ssj.sequence.length + ' frames');
    for (const id of ['future_trunks', 'mecha_frieza', 'king_cold', 'bulma', 'future_gohan', 'kid_gohan_764']) eq(JSON.stringify(SL.Schema.validateCharacter(SL.data.characters[id])), '[]', id + ' validates');
    // Age 764: Gohan in Piccolo's gi, no hat, no tail (the Saiyan Saga look is his playable default)
    const kg = SL.data.characters.kid_gohan_764.appearance.outfit;
    ok(kg.cap === undefined && kg.tail === undefined, 'Gohan has no hat and no tail by now');
  });

  test('the Time Machine lands, the canopy opens, Trunks climbs out and puts it back in the capsule; the army is his to play against, sword drawn, Super Saiyan locked', () => {
    const g = H.create({ quiet: true, seed: 7 });
    const { SL } = g;
    const b = g.mission('android_trunks', { startPhase: pi(SL, 'android_trunks', 'machine') });
    const S = b.story, m = b.mission;
    g.until(b, () => m.flags.massacre && !b.inputLocked, 60 * 120, skipAll(b));
    ok(m.flags.machineLanded && m.flags.capsuled, 'it lands and goes back in the capsule');
    eq(b.stage.props.filter((p) => p.kind === 'timeMachine' && p.alive).length, 0, 'the machine is gone before the fight (watched or skipped)');
    const tm = SL.data.trunksKit.timeMachine(b, S.trunks.pos.clone().add(new g.V3(0, 1.8, 6)));
    ok(tm.passable, 'a scripted prop he can sit inside: nothing pushes him (or the camera) out of it');
    const at = tm.pos.clone().add(new g.V3(0, -0.14, 0));
    S.trunks.setPosition(at);
    b.stage.resolveFighter(S.trunks);
    ok(S.trunks.pos.distanceTo(at) < 0.01, 'he stays in the seat');
    eq(b.player, S.trunks, 'the player has Trunks');
    eq(S.trunks.form.id, 'base', 'in base form');
    ok(S.trunks.lockedForms && S.trunks.lockedForms.ssj, 'Super Saiyan waits for the story');
    eq(S.trunks.sheathed, false, 'the sword is out');
    eq(m.objectives.length, 0, 'no objective text: the gap is the point');
    eq(S.soldiers.length, SL.data.trunksArrival.ARMY, 'the army is ' + SL.data.trunksArrival.ARMY + ' strong');
    ok(S.soldiers.filter((s) => s.alive).length >= SL.data.trunksArrival.ARMY - SL.data.trunksArrival.BLITZ, 'most of it still standing when control starts');
    b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('the massacre: every kill gets a finisher, the soldiers cannot overwhelm him even if he stands still, and blasts glance off the blade', () => {
    const g = H.create({ quiet: true, seed: 9 });
    const { SL } = g;
    const b = g.mission('android_trunks', { startPhase: pi(SL, 'android_trunks', 'massacre') });
    const S = b.story, t = S.trunks;
    g.until(b, () => b.mission.flags.massacre && !b.inputLocked, 60 * 60, skipAll(b));
    // he does nothing at all for ten seconds in the middle of them
    const hp0 = t.hp;
    g.step(b, 60 * 10);
    ok(t.alive && t.hp > t.hpMax * 0.85, 'standing still in the army costs him little: ' + Math.round((100 * t.hp) / t.hpMax) + '% left (from ' + Math.round((100 * hp0) / t.hpMax) + '%)');
    ok(t.damageTakenMul <= 0.1 && t.damageDealtMul >= 5, 'the gap is carried by the mission: dealt ×' + t.damageDealtMul + ', taken ×' + t.damageTakenMul);
    b.dispose();
    // the bot kills them all
    const r = g.playMission('android_trunks', { startPhase: pi(SL, 'android_trunks', 'massacre'), maxSeconds: 600 });
    const soldierKos = r.log.filter((x) => x.ev === 'ko' && /^frieza_/.test(x.who || x.victim || ''));
    const finishers = r.log.filter((x) => x.ev === 'trunksFinisher');
    ok(finishers.length >= SL.data.trunksArrival.ARMY - SL.data.trunksArrival.BLITZ, 'a finisher for the army: ' + finishers.length);
    eq(finishers.length, soldierKos.length || finishers.length, 'one finisher per kill');
    ok(r.m.flags.armyDestroyed && r.m.flags.finishers.includes('last'), 'the last one gets the last finisher');
    ok(new Set(r.m.flags.finishers).size >= 3, 'and they are not all the same: ' + [...new Set(r.m.flags.finishers)].join(','));
    ok(r.log.some((x) => x.ev === 'swordWard'), 'soldier blasts are knocked away by the sword');
    ok(r.m.flags.hitsTaken <= 12, 'the army barely touches him: ' + r.m.flags.hitsTaken + ' hits');
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('Mecha Frieza: a demonstration — the moods run denial → confused → angry → desperate → terrified, the Supernova is caught, and Frieza cannot really hurt him', () => {
    const { trunks: r, SL } = played(false);
    const f = r.m.flags;
    eq(r.state, 'success', 'the mission is won (' + r.seconds.toFixed(0) + ' s)');
    eq((f.friezaMoods || []).join(' → '), 'denial → confused → angry → desperate → terrified', 'his moods follow what happens to him');
    ok(f.futile > 0, 'his attacks come to nothing: ' + f.futile);
    ok(f.supernovaCaught && f.supernovaSurvived, 'the Supernova is caught and survived');
    const hp = SL.data.characters.future_trunks.stats.hp;
    ok(f.trunksDamage < hp * 0.3, 'Frieza barely marks him: ' + f.trunksDamage + ' of ' + hp);
    const G = SL.data.trunksArrival.GAP;
    ok(G.frieza.taken <= 0.1 && G.army.taken <= 0.1, 'the gap to both is enormous');
  });

  test('the Super Saiyan moment is his own: the story sequence plays, Frieza sees it, and the fight after it is fought as a Super Saiyan', () => {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;
    const b = g.mission('android_trunks', { startPhase: pi(SL, 'android_trunks', 'reveal') });
    const S = b.story;
    const fi = pi(SL, 'android_trunks', 'frieza');
    g.until(b, () => b.mission.phaseIndex === fi && !b.inputLocked, 60 * 90, skipAll(b));
    ok(b.mission.flags.trunksTransformed && b.mission.flags.superSaiyan, 'he transformed');
    eq(S.trunks.form.id, 'ssj', 'and fights Frieza as a Super Saiyan');
    b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('Frieza is cut down and King Cold follows: the sword offered and caught bare-handed, the blast, the ship; the borrowed sword goes back', () => {
    const { trunks: r } = played(false);
    const f = r.m.flags, S = r.b.story;
    ok(f.friezaCut && f.friezaDestroyed, 'Frieza: the cut, the pieces, gone');
    eq(S.frieza.alive, false, '');
    ok(f.swordGiven && f.bladeCaught && f.coldPierced && f.coldDestroyed && f.shipDestroyed, 'Cold: the sword, the catch, the blast, the ship');
    eq(S.cold.alive, false, '');
    ok(!(S.cold.model.props && S.cold.model.props.borrowedSword), 'Cold is not left holding the sword');
    ok(S.trunks.model.props.sword, 'Trunks still has his own');
  });

  test('clearing The Stranger unlocks Trunks and his worn and torn clothes; the save keeps it through a reload', () => {
    const { SL } = played(false);
    ok(SL.Save.isUnlocked('characters', 'future_trunks'), 'Future Trunks is playable');
    eq(SL.Save.missionResult('android_trunks').completed, true, 'The Stranger is recorded');
    eq(SL.Save.missionResult('android_warning').completed, true, 'and What He Came To Say');
    ok(SL.Wardrobe.select('future_trunks', { outfit: 'ft_capsule_worn' }).ok, 'the battle-worn outfit can be worn');
    ok(SL.Wardrobe.select('future_trunks', { outfit: 'ft_capsule_torn' }).ok, 'and the torn one');
    ok(SL.Wardrobe.select('future_trunks', { outfit: 'ft_capsule_unarmed' }).ok, 'and, after the warning, the jacket without the sword');
    ok(!SL.Wardrobe.select('future_trunks', { outfit: 'ft_armor' }).ok, 'the Cell Saga armor is planned, not wearable');
    SL.Wardrobe.select('future_trunks', { outfit: 'ft_capsule' });
    SL.Save.write();
    SL.Save.data = null;
    SL.Save.load();
    ok(SL.Save.isUnlocked('characters', 'future_trunks') && SL.Save.missionResult('android_warning').completed, 'both survive a save and reload');
    ok(SL.Save.isUnlocked('outfits', 'ft_capsule_torn'), 'and so does the torn outfit');
  });

  test('Goku lands in Yardrat clothes, and the player shows them Instant Transmission (a cue) and comes back in Roshi’s sunglasses', () => {
    const { warning: r, cues } = played(true);
    const f = r.m.flags, S = r.b.story;
    ok(f.gokuArrived && f.crater, 'the pod comes down where Trunks said');
    eq(S.goku.wardrobe && S.goku.wardrobe.outfit, 'goku_yardrat', 'in the Yardrat clothes');
    ok(cues.android_warning.some((c) => c.key === 's2'), 'Instant Transmission is a cue on the button that fires it');
    ok(f.itShown && f.shades, 'he vanishes and comes back wearing the sunglasses');
  });

  test('the private test: Trunks swings, Goku blocks every cut with one finger and is never touched', () => {
    const g = H.create({ quiet: true, seed: 11 });
    const { SL } = g;
    const blocks = [];
    const r = g.playMission('android_warning', { startPhase: pi(SL, 'android_warning', 'test'), maxSeconds: 300, onBattle: (b) => b.on('storyBlock', (e) => blocks.push(e)) });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'the mission goes on from the checkpoint');
    eq(f.testBlocks, SL.data.trunksWarning.BLOCKS, 'every cut blocked: ' + f.testBlocks);
    ok(blocks.length >= SL.data.trunksWarning.BLOCKS, 'with the one-finger block: ' + blocks.length);
    ok(f.gokuUntouched && f.testPassed, 'Goku is never touched');
    eq(S.goku.hp, S.goku.hpMax, '');
    eq(S.goku.team, 0, 'and he is back on Trunks’ side afterwards');
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('the medicine changes hands, the warning is drawn in the sand (date, time, place), and he leaves in the Time Machine; the clock starts', () => {
    const { warning: r, titles } = played(false);
    const f = r.m.flags, S = r.b.story;
    ok(f.futureSeen && f.futureTold, 'his future is shown, not described');
    ok(f.medicineGiven, 'the medicine is handed over');
    for (const who of [S.goku, S.trunks]) ok(!(who.model.props && who.model.props.medicine), 'nobody is left holding the bottle');
    eq(f.deadline, 'Age 767, May 12th', 'the date');
    eq(f.place, 'nine miles south-west of South City', 'the place');
    ok(f.trunksGone && S.trunks.hidden, 'Trunks is gone');
    ok(f.clockStarted, 'the three years start');
    ok(titles.some((x) => x.indexOf('THREE YEARS UNTIL THE ANDROIDS') === 0), 'on the title card: ' + titles.join(' | '));
  });

  test('watched or skipped, both missions end in the same story state', () => {
    const W = played(true), K = played(false);
    // what the bot's choices or the clock decide (how many hits, which finishers) is not story state
    const vary = new Set(['finishers', 'hitsTaken', 'futile', 'trunksDamage', 'testSeconds']);
    for (const id of ['trunks', 'warning']) {
      const a = W[id].m.flags, c = K[id].m.flags;
      const keys = [...new Set(Object.keys(a).concat(Object.keys(c)))].filter((k) => !vary.has(k)).sort();
      const diff = keys.filter((k) => JSON.stringify(a[k]) !== JSON.stringify(c[k]));
      eq(diff.join(','), '', id + ': flags that differ watched vs skipped');
      eq(W[id].state + '/' + K[id].state, 'success/success', id + ': won both ways');
      ok(W[id].frames > K[id].frames, id + ': skipping is faster (' + K[id].frames + ' vs ' + W[id].frames + ' frames)');
    }
    ok(W.cues.android_trunks.length >= 6, 'watched, the story waits on the player for its beats: ' + W.cues.android_trunks.map((c) => c.key).join(','));
    eq(W.g.errors.length + K.g.errors.length, 0, 'no engine errors either way');
  });

  test('wardrobe: story missions dress Trunks in the arrival look whatever the player saved; Free Battle wears the saved torn or unarmed look; clothing damage tears his clothes', () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = g;
    for (const id of ['namek_aftermath', 'android_trunks', 'android_warning']) SL.Save.completeMission(id, { score: 1, rank: 'C' });
    const free = () => {
      const b = new SL.Battle({
        mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 100 },
        fighters: [{ charId: 'future_trunks', player: true, team: 0, pos: new V3(-4, 0, 0) }, { charId: 'vegeta', team: 1, pos: new V3(4, 0, 0), dummy: 'idle' }],
        onEnd: () => {},
      });
      b.start();
      return b;
    };
    const jacketOn = (f) => (f.model.jacket || []).some((m) => m.visible);
    const rips = (f) => (f.model._rips || []).filter((r) => r.mesh.visible).length;
    ok(SL.Wardrobe.select('future_trunks', { outfit: 'ft_capsule_torn' }).ok, 'the player saves the torn look');
    let b = free();
    eq(b.player.wardrobe.outfit, 'ft_capsule_torn', 'Free Battle wears it');
    eq(jacketOn(b.player), false, 'the jacket is gone');
    ok(rips(b.player) > 0, 'and the clothes under it are ripped: ' + rips(b.player));
    b.dispose();
    // the story overrides the saved look
    b = g.mission('android_trunks', { startPhase: pi(SL, 'android_trunks', 'massacre') });
    const t = b.story.trunks;
    eq(t.wardrobe.outfit, 'ft_capsule', 'the story dresses him in the arrival look');
    ok(jacketOn(t) && t.model.props.sword && t.model.props.scabbard, 'jacket, sword and sheath');
    eq(rips(t), 0, 'clean at the start');
    // clothing damage: the rips come in levels
    t.model.setDamage(1);
    const r1 = rips(t);
    t.model.setDamage(2);
    const r2 = rips(t);
    ok(r1 > 0 && r2 > r1, 'damage tears more as it goes: ' + r1 + ' → ' + r2);
    b.dispose();
    ok(SL.Wardrobe.select('future_trunks', { outfit: 'ft_capsule_unarmed' }).ok, 'the unarmed look');
    b = free();
    ok(!b.player.model.props.sword && !b.player.model.props.scabbard, 'no sword and no sheath');
    b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });
};
