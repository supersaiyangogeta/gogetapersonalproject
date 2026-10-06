// Balance sim (dev tool): hero team (CPU) vs a boss (CPU), repeated.
// Prints wins, fight length, phases reached, poise breaks and boss technique use.
// Usage: node tools/balance_boss.js <boss> <hero[,hero2,...]> <runs> [difficulty]
const H = require('../tests/headless');
const g = H.create({ quiet: true });
const { SL, V3 } = g;
const [boss = 'nappa', heroesArg = 'goku', runsStr = '4', diff = 'normal', driver = 'cpu'] = process.argv.slice(2);
// driver 'reader' plays the first hero with the telegraph-reading bot from tools/mission_brains.js
const brains = require('./mission_brains');
const heroes = heroesArg.split(',');
const runs = +runsStr;
let wins = 0, tsum = 0;
const tot = {};
const add = (k, n = 1) => (tot[k] = (tot[k] || 0) + n);
for (let r = 0; r < runs; r++) {
  const b = new SL.Battle({
    mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 50 },
    fighters: [
      ...heroes.map((id, i) => ({ charId: id, player: i === 0, team: 0, pos: new V3(-3 + i * 3, 0, 10), difficulty: diff })),
      { charId: boss, team: 1, pos: new V3(0, 0, -12), difficulty: diff },
    ],
    onEnd: () => {},
  });
  b.start();
  const team = b.fighters.filter((f) => f.team === 0);
  if (driver === 'reader') {
    const st = {};
    team[0].controller = { update: (f) => (b.inputLocked ? SL.emptyIntent() : brains.skills.bossReader({ SL, b, p: f, st }, SL.emptyIntent())) };
  } else team[0].controller = new SL.AIController(b, { difficulty: diff });
  const B = b.fighters.find((f) => f.team === 1);
  for (const ev of ['bossSlam', 'bomberWave', 'eruption', 'bossRoar', 'bossTaunt', 'poiseBreak', 'bossPhase']) b.on(ev, () => add(ev));
  b.on('damage', (e) => {
    if (e.attacker === B && !e.blocked) add('bossDamage', e.amount);
    if (e.target === B && !e.blocked) add('heroDamage', e.amount);
  });
  let started = false, frames = 0;
  g.until(b, () => (started = started || b.phase === 'fight') && b.phase !== 'fight', 60 * 300, () => b.phase === 'fight' && frames++);
  if (!B.alive) wins++;
  tsum += frames / 60;
  add('phaseReached', B.mech.phase);
  b.dispose();
}
const avg = (k) => ((tot[k] || 0) / runs).toFixed(1);
console.log(`[${driver}] ${heroes.join('+')} vs ${boss} (${diff}): hero wins ${wins}/${runs}, avg ${(tsum / runs).toFixed(0)}s, avg phase ${avg('phaseReached')}, poise breaks ${avg('poiseBreak')}, slams ${avg('bossSlam')}, eruptions ${avg('eruption')}, bomber ${avg('bomberWave')}, taunts ${avg('bossTaunt')}, boss dmg ${avg('bossDamage')}, hero dmg ${avg('heroDamage')}, errors ${g.errors.length}`);
