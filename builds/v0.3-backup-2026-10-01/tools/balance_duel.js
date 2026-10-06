// Balance sim (dev tool): CPU vs CPU duels with battle telemetry.
// Sides alternate every run so spawn side never decides the result.
// Prints wins plus WHY: damage by move, hit and whiff rates, time stunned,
// guard use, Perfect Guards, vanishes, throws and specials, per character.
// Usage: node tools/balance_duel.js <charA> <charB> <runs> [difficulty] [seed] [--json]
const H = require('../tests/headless');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const json = process.argv.includes('--json');
const [A = 'goku', Bc = 'vegeta', runsStr = '10', diff = 'normal', seedStr = '1'] = args;
const g = H.create({ quiet: true, seed: +seedStr });
const { SL, V3 } = g;

const TWEAKS = {
  // Goku without Kaioken: next form is Super Saiyan like before V0.3
  noKaioken: (b) => b.fighters.forEach((f) => f.def.id === 'goku' && (f.lockedForms = { kaioken: true })),
  // Goku never uses Instant Transmission
  noIT: (b) => b.fighters.forEach((f) => f.def.id === 'goku' && (f.lockedSlots = Object.assign({}, f.lockedSlots, { special2: true }))),
  // Vegeta without counter moves after Perfect Guard
  noCounter: (b) => b.fighters.forEach((f) => f.def.id === 'vegeta' && (f.def = Object.assign({}, f.def, { moves: Object.assign({}, f.def.moves, { counter: null }) }))),
  // Vegeta without Big Bang Attack
  noBBA: (b) => b.fighters.forEach((f) => f.def.id === 'vegeta' && (f.lockedSlots = Object.assign({}, f.lockedSlots, { special2: true }))),
  // no transformations for anyone
  noForms: (b) => (b.rules.allowTransform = false),
  // swap AI personalities (aggression, defense, ranged use...) but keep each character's hooks
  aiSwap: (b) => swapDef(b, (d, o) => ({ ai: Object.assign({}, o.ai, { hooks: d.ai.hooks }) })),
  // swap base stats
  statSwap: (b) => swapDef(b, (d, o) => ({ stats: o.stats })),
  // no character-specific AI hooks
  noHooks: (b) => b.fighters.forEach((f) => (f.def = Object.assign({}, f.def, { ai: Object.assign({}, f.def.ai, { hooks: null }) }))),
  // swap regular move lists (lights, heavies, air, dash, chase)
  movesSwap: (b) => swapDef(b, (d, o) => ({ moves: o.moves })),
  // both fighters the same body size (hurtbox height and hand/chest positions)
  sameHeight: (b) => b.fighters.forEach((f) => {
    f.scale = 1;
    f.height = 1.85;
  }),
  // no character mechanics for anyone (measures the kits alone)
  noMech: (b) => b.fighters.forEach((f) => (f.def = Object.assign({}, f.def, { mechanic: null }))),
  // Goku CPU with an aggressive personality (same hooks)
  gokuAggro: (b) => b.fighters.forEach((f) => f.def.id === 'goku' && (f.def = Object.assign({}, f.def, { ai: Object.assign({}, f.def.ai, { personality: 'aggressive', defense: 0.5 }) }))),
  // swap every gameplay field (moves, specials, forms, stats, AI, mechanic, poses) but keep id, name and body
  kitSwap: (b) => swapDef(b, (d, o) => { const x = Object.assign({}, o); for (const k of ['id', 'name', 'fullName', 'appearance', 'barks', 'audio', 'vfx']) delete x[k]; return x; }),
  // swap only the bodies (appearance: height, build) 
  bodySwap: (b) => { const [x, y] = b.fighters; for (const [f, o] of [[x, y], [y, x]]) { f.scale = o.def.appearance.height || 1; f.height = 1.85 * f.scale; } },
  specialsSwap: (b) => swapDef(b, (d, o) => ({ specials: o.specials })),
  // swap character mechanics (Saiyan Instinct <-> Pride)
  mechSwap: (b) => {
    const [x, y] = b.fighters;
    const mx = x.def.mechanic, my = y.def.mechanic;
    x.def = Object.assign({}, x.def, { mechanic: my });
    y.def = Object.assign({}, y.def, { mechanic: mx });
    for (const f of [x, y]) SL.mech(f, 'init');
  },
};
function swapDef(b, pick) {
  const [x, y] = b.fighters;
  const dx = x.def, dy = y.def;
  x.def = Object.assign({}, dx, pick(dx, dy));
  y.def = Object.assign({}, dy, pick(dy, dx));
}
const tweaks = process.argv.filter((a) => a.startsWith('--tweak=')).map((a) => a.slice(8).split(',')).flat();

function duel(left, right) {
  const b = new SL.Battle({
    mode: 'free', stageId: 'wasteland', skipIntro: true,
    rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 40 },
    fighters: [
      { charId: left, player: true, team: 0, pos: new V3(-5, 0, 0), difficulty: diff },
      { charId: right, team: 1, pos: new V3(5, 0, 0), difficulty: diff },
    ],
    onEnd: () => {},
  });
  for (const t of tweaks) TWEAKS[t](b);
  b.start();
  b.fighters[0].controller = new SL.AIController(b, { difficulty: diff });
  let started = false;
  g.until(b, () => (started = started || b.phase === 'fight') && b.phase !== 'fight', 60 * 240);
  const sum = b.telemetry.summary();
  const winner = b.fighters.find((f) => f.alive && f.hp > 0 && b.fighters.some((o) => o !== f && !o.alive));
  const out = { winner: winner ? winner.def.id + ':' + winner.team : 'none', seconds: b.telemetry.frames / 60, sum, insightsLeft: b.telemetry.insights(b.fighters[0]), insightsRight: b.telemetry.insights(b.fighters[1]) };
  b.dispose();
  return out;
}

const runs = +runsStr;
const agg = {};
const bucket = (key) => (agg[key] = agg[key] || { wins: 0, fights: 0, dmg: 0, taken: 0, hits: 0, attacks: 0, whiffs: 0, stun: 0, guard: 0, pg: 0, van: 0, thrownBy: 0, throws: 0, guardBreaks: 0, overloads: 0, transforms: 0, bursts: 0, blocked: 0, byMove: {}, bySource: {}, specials: {}, combos: [], secs: 0, hpOther: 0, forms: {}, kiSpent: {}, mechUp: 0, mechDmg: 0, armored: 0, armoredMech: 0, states: {}, frames: 0 });
let draws = 0;
const insightCount = {};
for (let r = 0; r < runs; r++) {
  const flip = r % 2 === 1;
  const left = flip ? Bc : A, right = flip ? A : Bc;
  const res = duel(left, right);
  if (res.winner === 'none') draws++;
  res.sum.forEach((s, i) => {
    // mirror matches: keep the two sides apart by their role in the command line
    const key = A === Bc ? (s.team === (flip ? 1 : 0) ? A + ' (A)' : Bc + ' (B)') : s.id;
    const k = bucket(key);
    k.fights++;
    if (res.winner === s.id + ':' + s.team) k.wins++;
    k.dmg += s.damageDealt;
    k.taken += s.damageTaken;
    k.hits += s.hitsLanded;
    k.attacks += s.attacks;
    k.whiffs += s.whiffs;
    k.stun += s.stunShare;
    k.guard += s.guardShare;
    k.pg += s.perfectGuards;
    k.van += s.vanishes;
    k.throws += s.throwsLanded;
    k.thrownBy += s.throwsTaken;
    k.guardBreaks += s.guardBreaks;
    k.overloads += s.overloads;
    k.transforms += s.transforms;
    k.bursts += s.bursts;
    k.blocked += s.blockedHits;
    k.secs += s.seconds;
    k.combos.push(...s.combos);
    k.hpOther += s.hpLostOther;
    k.mechUp += s.mechUptime;
    k.frames += s.frames;
    for (const [m, v] of Object.entries(s.stateFrames)) k.states[m] = (k.states[m] || 0) + v;
    k.mechDmg += s.mechDamageAvg;
    k.armored += s.armoredHits;
    k.armoredMech += s.armoredByMechanic;
    for (const [m, v] of Object.entries(s.formFrames)) k.forms[m] = (k.forms[m] || 0) + v / 60;
    for (const [m, v] of Object.entries(s.kiSpent)) k.kiSpent[m] = (k.kiSpent[m] || 0) + v;
    for (const [m, v] of Object.entries(s.byMove)) k.byMove[m] = (k.byMove[m] || 0) + v;
    for (const [m, v] of Object.entries(s.bySource)) k.bySource[m] = (k.bySource[m] || 0) + v;
    for (const [m, v] of Object.entries(s.specials)) {
      const o = (k.specials[m] = k.specials[m] || { used: 0, landed: 0, damage: 0 });
      o.used += v.used;
      o.landed += v.landed;
      o.damage += v.damage;
    }
    for (const t of (res.sum[0] === s ? res.insightsLeft : res.insightsRight)) {
      const head = key + ': ' + t.replace(/\d+(\.\d+)?%?/g, '#');
      insightCount[head] = (insightCount[head] || 0) + 1;
    }
  });
}

if (json) {
  console.log(JSON.stringify({ agg, draws, runs }, null, 1));
} else {
  const f1 = (x) => x.toFixed(1), pc = (x) => Math.round(x * 100) + '%';
  console.log(`${A} vs ${Bc} (${diff}, ${runs} runs, seed ${seedStr}${tweaks.length ? ', tweaks ' + tweaks.join('+') : ''}), draws/timeouts ${draws}, errors ${g.errors.length}`);
  for (const [id, k] of Object.entries(agg)) {
    const n = k.fights;
    const top = Object.entries(k.byMove).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m, v]) => `${m} ${pc(v / k.dmg)}`).join(', ');
    const src = Object.entries(k.bySource).sort((a, b) => b[1] - a[1]).map(([m, v]) => `${m} ${pc(v / k.dmg)}`).join(', ');
    const sp = Object.entries(k.specials).map(([m, v]) => `${m} ${f1(v.used / n)} (landed ${pc(v.landed / Math.max(1, v.used))}, ${Math.round(v.damage / Math.max(1, v.used))} dmg each)`).join(', ');
    const avgC = k.combos.length ? f1(k.combos.reduce((a, c) => a + c, 0) / k.combos.length) : '0';
    console.log(`\n${id}: wins ${k.wins}/${n}, avg fight ${f1(k.secs / n)}s`);
    console.log(`  damage dealt ${Math.round(k.dmg / n)} / taken ${Math.round(k.taken / n)} per fight; sources: ${src}`);
    console.log(`  top moves: ${top}`);
    console.log(`  attacks ${f1(k.attacks / n)}, hits ${f1(k.hits / n)}, whiff ${pc(k.whiffs / Math.max(1, k.attacks))}, avg combo ${avgC}, hits blocked ${f1(k.blocked / n)}`);
    console.log(`  stunned ${pc(k.stun / n)}, guarding ${pc(k.guard / n)}, perfect guards ${f1(k.pg / n)}, vanishes ${f1(k.van / n)}, bursts ${f1(k.bursts / n)}`);
    console.log(`  throws landed ${f1(k.throws / n)}, thrown ${f1(k.thrownBy / n)}, guard broken ${f1(k.guardBreaks / n)}, transforms ${f1(k.transforms / n)}, overloads ${f1(k.overloads / n)}`);
    console.log(`  specials per fight: ${sp || 'none'}`);
    console.log(`  ki spent per fight: ${Object.entries(k.kiSpent).map(([m, v]) => m + ' ' + Math.round(v / n)).join(', ') || 'none'}; health lost outside hits ${Math.round(k.hpOther / n)}`);
    console.log(`  mechanic active ${pc(k.mechUp / n)} of the fight, average damage multiplier from it x${(k.mechDmg / n).toFixed(3)}, hits shrugged off ${f1(k.armored / n)} (by mechanic ${f1(k.armoredMech / n)})`);
    console.log(`  time by state: ${Object.entries(k.states).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([m, v]) => m + " " + pc(v / k.frames)).join(", ")}`);
    console.log(`  seconds per fight in form: ${Object.entries(k.forms).map(([m, v]) => m + ' ' + f1(v / n)).join(', ')}`);
  }
  const common = Object.entries(insightCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (common.length) {
    console.log('\nmost frequent insights:');
    for (const [t, c] of common) console.log(`  ${c}x ${t}`);
  }
}
