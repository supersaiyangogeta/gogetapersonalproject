// Power gaps (2026-10-02, the owner's brief "power gaps across all sagas"): one architecture —
// Mission.powerGap() on top of Fighter.storyNoSell — used by every fight where canon says the blows
// do nothing: Raditz, Nappa, Recoome, 100% Frieza, 18 against Trunks, the Buu fights, the Cell
// Juniors, semi-perfect Cell, and the future androids. Runs the real engine headless.
const H = require('./headless');

module.exports = function powerGapTests({ test, eq, ok }) {
  console.log('\nPower gaps: blows that do nothing, felt in the fight (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const pi = (SL, id, ph) => SL.data.missions[id].phases.findIndex((p) => p.id === ph);
  const punch = (to, from) => to.takeHit(from, { type: 'melee', damage: 1200, knock: 'heavy', knockSpeed: 18, hitstun: 20, impact: 2, dir: to.forward.clone().negate() });

  test('Mission.powerGap: blows from the named fighters are shrugged off (no flinch, almost no damage, the fist bounces back), counted, voiced, and cleared with the phase', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.mission('namek_recoome', { startPhase: pi(SL, 'namek_recoome', 'hold') });
    gg.until(b, () => !b.inputLocked, 60 * 30, skipAll(b));
    const S = b.story, r = S.recoome, k = S.krillin, v = S.vegeta;
    ok(r.storyNoSell && r.storyNoSell.from.includes(k), 'Recoome shrugs off Krillin');
    const said = [];
    b.on('missionSay', (e) => said.push(e.line || e.text));
    const lines = [];
    const sayOrig = b.mission.say.bind(b.mission);
    b.mission.say = (who, line, ...rest) => (lines.push(who + ':' + line), sayOrig(who, line, ...rest));
    const hp0 = r.hp;
    const state0 = r.state;
    let res;
    for (let i = 0; i < 3; i++) {
      k.state = 'free';
      res = punch(r, k);
      gg.step(b, 2);
    }
    eq(res, 'armored', 'the blow is shrugged off');
    ok(r.state !== 'hitstun' && r.state !== 'knockback', 'no flinch, no knockback: ' + r.state + ' (was ' + state0 + ')');
    ok(hp0 - r.hp <= 1200 * 3 * 0.06, 'almost no damage: ' + (hp0 - r.hp));
    eq(b.mission.flags.gap_recoome, 3, 'counted on the mission');
    ok(lines.some((l) => l.startsWith('recoome:')), 'and he says so on the third: ' + lines.join(' | '));
    // somebody the gap does not name hurts him normally
    const hp1 = r.hp;
    v.state = 'free';
    const res2 = punch(r, v);
    ok(r.hp < hp1 - 100, 'a fighter the gap does not name still hurts him: ' + res2 + ', ' + (hp1 - r.hp));
    // the next phase takes it off
    b.mission.state = 'running';
    b.emit('missionPhase', { phase: { id: 'x' }, index: 99 });
    eq(r.storyNoSell, null, 'cleared when the phase ends');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('every fight the owner named has its gap at its own checkpoint: the right side shrugs off the right attacker', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const cases = [
      ['saiyan_brothers', 'onslaught', (S, b) => [S.raditz, b.player]],
      ['saiyan_nappa', 'duel', (S) => [S.goku, S.nappa]],
      ['namek_recoome', 'hold', (S) => [S.recoome, S.gohan]],
      ['namek_end', 'full', (S) => [S.frieza, S.goku]],
      ['android_road', 'trunks', (S) => [S.a18, S.trunks]],
      ['buu_vegito', 'test', (S, b) => [b.player, S.bh]],
      ['buu_ultimate', 'reversal', (S) => [S.gohan, S.sup]],
      ['cell_rampage', 'rampage', (S) => [S.gohan, S.juniors[0]]],
      ['cell_rampage', 'toyed', (S) => [S.gohan, S.cell]],
      ['cell_future', 'eighteen', (S) => [S.trunks, S.a18]],
    ];
    for (const [id, phase, pick] of cases) {
      const b = gg.mission(id, { startPhase: pi(SL, id, phase) });
      gg.until(b, () => !b.inputLocked && b.mission.def.phases[b.mission.phaseIndex].id === phase, 60 * 40, skipAll(b));
      gg.step(b, 3);
      const [tank, att] = pick(b.story, b);
      const tag = id + '.' + phase + ': ' + tank.def.id + ' vs ' + att.def.id;
      ok(tank.storyNoSell, tag + ' — a gap is set');
      ok(!tank.storyNoSell.from || tank.storyNoSell.from.includes(att), tag + ' — against that attacker');
      att.state = 'free';
      tank.invuln = 0;
      if (tank.state === 'vanish' || tank.state === 'transform') tank.setState('free');
      eq(punch(tank, att), 'armored', tag + ' — the blow does nothing');
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
