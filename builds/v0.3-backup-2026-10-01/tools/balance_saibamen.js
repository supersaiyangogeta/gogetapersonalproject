// Balance sim (dev tool): hero AI vs N Saibamen AI, repeated; prints win rate, time and events.
// Usage: node tools/balance_saibamen.js <hero> <count> <runs>
const H = require('../tests/headless');
const g = H.create({ quiet: true });
const { SL, V3 } = g;
const [hero = 'goku', nStr = '1', runsStr = '6'] = process.argv.slice(2);
const n = +nStr, runs = +runsStr;
let wins = 0, tsum = 0, hpsum = 0;
const evTot = {};
for (let r = 0; r < runs; r++) {
  const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: false, allowUltimates: true, startKi: 50 },
    fighters: [{ charId: hero, player: true, team: 0, pos: new V3(0, 0, 0) }, ...Array.from({ length: n }, (_, i) => ({ charId: 'saibaman', team: 1, pos: new V3(Math.cos(i * 1.6) * 14, 0, Math.sin(i * 1.6) * 14), difficulty: 'normal' }))], onEnd: () => {} });
  b.start();
  const p = b.player;
  p.controller = new SL.AIController(b, { difficulty: 'normal' });
  const ev = {};
  ['latch', 'selfDestruct', 'latchEscape', 'burrowErupt', 'ko'].forEach((k) => b.on(k, () => (ev[k] = (ev[k] || 0) + 1)));
  let frames = 0;
  let started = false;
  g.until(b, () => (started = started || b.phase === 'fight') && b.phase !== 'fight', 60 * 240, () => b.phase === 'fight' && frames++);
  const won = p.alive;
  wins += won ? 1 : 0;
  tsum += frames / 60;
  hpsum += won ? p.hp / p.hpMax : 0;
  for (const k in ev) evTot[k] = (evTot[k] || 0) + ev[k];
  b.dispose();
}
console.log(hero, 'vs', n, 'saibamen:', 'wins', wins + '/' + runs, 'avg sec', (tsum / runs).toFixed(1), 'avg hp left (wins)', wins ? (hpsum / wins).toFixed(2) : '-', JSON.stringify(evTot), 'errors', g.errors.length);
