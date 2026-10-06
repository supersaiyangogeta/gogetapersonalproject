// The Ultimate (2026-09-25, the owner's Buu Saga brief, priority 9): the Z Sword, the Old Kai and
// the unlocking, Ultimate Gohan as a power state of its own (not a Super Saiyan), Gohan against
// Super Buu as a power reversal, and Buutenks. Behaviour on the real engine, headless.
const H = require('./headless');

module.exports = function buuUltimateTests({ test, eq, ok }) {
  console.log('\nThe Ultimate: the Z Sword, the Old Kai, Ultimate Gohan, Buutenks (headless)');

  const phaseOf = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);

  test('the Ultimate is not a Super Saiyan: black hair held down, a white aura with no lightning, more power than Super Saiyan 2 — given by the Z Sword', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const G = SL.data.characters.adult_gohan;
    const u = G.forms.find((f) => f.id === 'ultimate'), s2 = G.forms.find((f) => f.id === 'ssj2');
    ok(u, 'the form exists');
    eq(u.look.hair.style, 'gohan_ultimate', 'his own hair');
    eq(u.look.hair.color, 0x141418, 'black, not gold');
    ok(!u.aura.lightning && !u.aura.sparks, 'no lightning');
    ok(u.aura.color > 0xe0e0e0 && (u.aura.color & 0xff) > 0xe0, 'a white aura: ' + u.aura.color.toString(16));
    ok(u.mult.damage > s2.mult.damage && u.mult.speed > s2.mult.speed && u.mult.defense > s2.mult.defense, 'stronger, faster and tougher than Super Saiyan 2');
    eq(u.freeUnlock, 'buu_zsword', 'Free Battle after the Z Sword');
    eq(SL.data.formGivenBy['adult_gohan:ultimate'], 'buu_zsword', 'the story hands it over there');
    const b = gg.battle({ p1: 'adult_gohan', p2: 'super_buu', distance: 6 });
    const g = b.player;
    SL.data.buuKit.toForm(g, 'ultimate');
    gg.step(b, 10);
    eq(g.form.id, 'ultimate', 'the form applies');
    ok(g.poses.ag_calm && g.poses.ag_meditate && g.poses.ag_pull && g.poses.ag_sword, 'his own poses: calm, meditation, the pull, the sword');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the Old Kai is a body of his own (tiny, lavender, white crest and beard, the Potara) and Buutenks wears Gotenks\' vest and pads over Super Buu', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const D = SL.data.characters;
    ok(D.elder_kai.appearance.height < D.supreme_kai.appearance.height, 'smaller than the Supreme Kai');
    ok(D.elder_kai.appearance.headExtras.some((x) => x.color === 0x3ab85a), 'the Potara');
    ok(Object.keys(D.elder_kai.poses).filter((k) => k.startsWith('ek_')).length >= 5, 'his own poses (the ritual among them)');
    const b = gg.battle({ p1: 'adult_gohan', p2: 'buutenks', distance: 6 });
    const bt = b.fighters[1];
    gg.step(b, 5);
    ok(bt.model.jacket && bt.model.jacket.length, 'the vest');
    let pads = 0;
    bt.model.root.traverse((o) => o.name === 'pad' && pads++);
    eq(pads, 2, 'two gold shoulder pads');
    ok(bt.def.specials.ultimate && /ghost/i.test(bt.def.specials.ultimate.name), 'Gotenks\' ghosts, out of Buu\'s mouth');
    ok(bt.def.stats.hp > D.super_buu.stats.hp && bt.def.stats.power > D.super_buu.stats.power, 'stronger than Super Buu');
    eq(bt.def.mechanic.type, 'majinBody', 'and he still grows back');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"The Z Sword" plays through: the pull, eight swings, the Katchin and the break, the Old Kai, the ritual, the stillness — and Ultimate Gohan', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const order = [];
    let taught = null;
    const r = gg.playMission('buu_zsword', {
      maxSeconds: 600,
      onBattle: (b) => {
        b.on('missionPhase', () => order.push(phaseOf(b)));
        b.on('skillLearned', (e) => (taught = taught || e.key));
      },
    });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'mission state');
    eq(order.join(','), 'pull,swing,still,after', 'the beats');
    ok(f.kaiWorld && f.swings === 8 && f.swordBroken && f.elderFreed, 'the sword out, swung, broken, the Old Kai out of it');
    ok(f.ritual && f.ultimate && f.katchinBroken, 'the ritual, the Ultimate, the Katchin in pieces');
    eq(taught, 'form:ultimate', 'the form handed over');
    eq(r.b.player, S.gohanU, 'the player is Gohan in the Kais\' clothes');
    ok(S.gohan.hidden && !S.gohanU.hidden, 'one Gohan, not two');
    eq(S.gohanU.form.id, 'ultimate', 'in the Ultimate');
    eq(r.b.stage.def.id, 'kai_world', 'on the Sacred World of the Kai');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the unlocking is stillness, not mashing: pressing anything spills it back, and it waits for a player who can sit still', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.mission('buu_zsword', { startPhase: phaseAt(SL, 'buu_zsword', 'still') });
    let n = 0;
    const held = SL.Input.held.bind(SL.Input);
    // a restless player for the first four seconds: a button every half second
    SL.Input.held = (a) => a === 'light' && n < 240 && n % 30 < 4;
    let filledAt = null;
    gg.until(b, () => b.mission.flags.stillSpills !== undefined || b.mission.state !== 'running', 60 * 60, () => {
      n++;
      if (b.inputLocked && phaseOf(b) === 'still' && n < 5) b.skipRequested = true;
    });
    filledAt = n;
    SL.Input.held = held;
    ok(b.mission.flags.stillSpills >= 6, 'every press spilled some: ' + b.mission.flags.stillSpills);
    const Z = SL.data.zSword.ZS;
    ok(filledAt > (Z.stillSeconds + 2) * 60, 'and it took longer than sitting still would: ' + (filledAt / 60).toFixed(1) + ' s');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Ultimate Gohan" plays through: the fist caught, Super Buu taken apart and barely touching him, the bluff, the absorption, Buutenks — and a light coming down', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = [];
    const r = gg.playMission('buu_ultimate', {
      maxSeconds: 600,
      onBattle: (b) => b.on('missionPhase', () => order.push(phaseOf(b))),
    });
    const f = r.m.flags, S = r.b.story, UG = SL.data.ultimateGohan.UG;
    eq(r.state, 'success', 'mission state');
    eq(order.join(','), 'reversal,overturn,after', 'the beats');
    ok(f.fistCaught, 'the fist caught in one hand');
    ok(f.reversalAparts >= UG.aparts, 'Super Buu taken apart ' + f.reversalAparts + ' times');
    ok(f.gohanLost < 0.5, 'and he hardly touched Gohan (lost ' + f.gohanLost + ')');
    ok(f.absorbed && f.buutenks, 'the absorption and the change');
    ok(S.sup.hidden && !S.bt.hidden && S.gotenks.hidden && S.piccolo.hidden, 'Buutenks standing, the three who went into him gone');
    ok(f.overturnSeconds > 0 && f.hope, 'the fight turned again, and the light at the end');
    eq(S.gohan.form.id, 'ultimate', 'Gohan in the Ultimate throughout');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Chapter 12 exists after Chapter 11, and both missions start cleanly from every checkpoint with only their fighters active', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const chs = SL.data.story.chapters;
    const i11 = chs.findIndex((c) => c.id === 'buu5'), i12 = chs.findIndex((c) => c.id === 'buu6');
    ok(i12 === i11 + 1, 'Chapter 12 right after Chapter 11');
    eq(chs[i12].missions.join(','), 'buu_zsword,buu_ultimate', 'its missions');
    for (const [id, phase, active] of [['buu_ultimate', 'reversal', ['gohan', 'sup']], ['buu_ultimate', 'overturn', ['gohan', 'bt']]]) {
      const b = gg.mission(id, { startPhase: phaseAt(SL, id, phase) });
      gg.until(b, () => !b.inputLocked && phaseOf(b) === phase, 60 * 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const S = b.story, act = active.map((k) => S[k]);
      eq(b.player, S.gohan, id + '/' + phase + ': Gohan is played');
      for (const f of b.fighters) {
        if (act.includes(f)) continue;
        ok(!(f.controller instanceof SL.AIController), id + '/' + phase + ': ' + f.def.id + ' has no brain');
        ok(f.untargetable || f.hidden, id + '/' + phase + ': ' + f.def.id + ' cannot be fought');
      }
      ok(act[1].controller instanceof SL.AIController && !act[1].hidden, id + '/' + phase + ': ' + active[1] + ' fights');
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Chapter 12 plays through with every scene watched in full: no missing pose, no warning, no engine error', () => {
    for (const id of ['buu_zsword', 'buu_ultimate']) {
      const gg = H.create({ quiet: true, seed: 3 });
      const r = gg.playMission(id, { maxSeconds: 900, watch: true });
      eq(r.state, 'success', id + ' watched in full');
      eq([...new Set(gg.warnings)].join(' | '), '', id + ': warnings');
      eq(gg.errors.length, 0, id + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });
};
