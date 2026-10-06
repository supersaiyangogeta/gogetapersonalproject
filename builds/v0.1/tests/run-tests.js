// Automated tests for systems that do not need a GPU.
// Run with:  node tests/run-tests.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function makeContext() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const ctx = {
    console,
    Math,
    JSON,
    Date,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    performance: { now: () => Date.now() },
    localStorage,
  };
  ctx.window = ctx;
  ctx.document = { createElement: () => ({}) };
  vm.createContext(ctx);
  const load = (rel) => vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), ctx, { filename: rel });
  ['src/core/namespace.js', 'src/core/settings.js', 'src/core/save.js', 'src/game/rules.js', 'src/data/unlocks.js'].forEach(load);
  ctx.__store = store;
  // minimal mission registry so completion() has content
  ctx.SL.data.missions.prologue_final_stand = { id: 'prologue_final_stand' };
  return ctx;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok  ' + name);
  } catch (e) {
    failed++;
    console.log('  FAIL ' + name + '\n       ' + e.message);
  }
}
function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'expected equal') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b));
}
function ok(v, msg) {
  if (!v) throw new Error(msg || 'expected truthy');
}

console.log('\nCombat rules');
{
  const { SL } = makeContext();
  const R = SL.Rules;
  test('first hit is unscaled', () => eq(R.comboScale(1), 1));
  test('combo scaling decreases and floors at 35%', () => {
    ok(R.comboScale(5) < R.comboScale(2));
    eq(R.comboScale(100), 0.35);
  });
  test('damage respects attacker and defender multipliers', () => {
    const base = R.computeDamage({ base: 1000, type: 'melee', hitIndex: 1 });
    const strong = R.computeDamage({ base: 1000, type: 'melee', hitIndex: 1, attackerMul: 1.3 });
    const tanky = R.computeDamage({ base: 1000, type: 'melee', hitIndex: 1, defenderMul: 2 });
    eq(base, 1000);
    eq(strong, 1300);
    eq(tanky, 500);
  });
  test('guarding reduces melee damage to chip', () => {
    eq(R.computeDamage({ base: 1000, type: 'melee', hitIndex: 1, guarded: true }), 100);
  });
  test('beams ignore combo scaling', () => {
    eq(R.computeDamage({ base: 2000, type: 'beam', hitIndex: 12 }), 2000);
  });
  test('damage never drops below 1', () => {
    eq(R.computeDamage({ base: 1, type: 'melee', hitIndex: 30, guarded: true, defenderMul: 10 }), 1);
  });
  test('heavy finisher picks the highest key not above chain length', () => {
    const map = { 0: 'a', 2: 'b', 4: 'c' };
    eq(R.heavyFor(map, 0), 'a');
    eq(R.heavyFor(map, 1), 'a');
    eq(R.heavyFor(map, 3), 'b');
    eq(R.heavyFor(map, 9), 'c');
  });
  test('ki spending fails without enough ki and succeeds with it', () => {
    const f = { ki: 20, infiniteKi: false };
    ok(!R.spendKi(f, 30));
    eq(f.ki, 20);
    ok(R.spendKi(f, 15));
    eq(f.ki, 5);
  });
  test('infinite ki never depletes', () => {
    const f = { ki: 0, infiniteKi: true };
    ok(R.spendKi(f, 100));
  });
  test('stamina spend sets regen delay', () => {
    const f = { stamina: 50, staminaDelay: 0 };
    ok(R.spendStamina(f, 18));
    eq(f.stamina, 32);
    ok(f.staminaDelay > 0);
  });
  test('form multipliers stack with stats; canon balance scales power', () => {
    const f = { def: { stats: { power: 1.1, defense: 1, speed: 1, kiRegen: 2, chargeRate: 30, canonPower: 4 } }, form: { mult: { damage: 1.3 } }, balance: 'balanced' };
    ok(Math.abs(R.multipliers(f).damage - 1.43) < 1e-9);
    f.balance = 'canon';
    ok(Math.abs(R.multipliers(f).damage - 2.86) < 1e-9);
  });
  test('beam clash: equal inputs stay balanced', () => {
    let p = 0;
    for (let i = 0; i < 600; i++) p = R.clashStep(p, 1, 1, 8, 8, 1 / 60, i / 60);
    ok(Math.abs(p) < 1e-9);
  });
  test('beam clash: nothing moves during the grace period', () => {
    eq(R.clashStep(0, 1, 1, 12, 0, 1 / 60, 0.1), 0);
  });
  test('beam clash: faster mashing wins within a few seconds', () => {
    let p = 0, t = 0;
    while (Math.abs(p) < 1 && t < 12) {
      p = R.clashStep(p, 1, 1, 11, 6, 1 / 60, t);
      t += 1 / 60;
    }
    ok(p >= 1, 'side A should win');
    ok(t < 8, 'should resolve in under 8s, took ' + t.toFixed(2));
  });
  test('mission rank thresholds', () => {
    eq(R.rank(9000), 'S');
    eq(R.rank(7200), 'A');
    eq(R.rank(5600), 'B');
    eq(R.rank(4100), 'C');
    eq(R.rank(100), 'D');
  });
}

console.log('\nSave system');
{
  const ctx = makeContext();
  const { SL } = ctx;
  test('fresh save starts with the base roster only', () => {
    SL.Save.load();
    eq(SL.Save.loadStatus, 'fresh');
    ok(SL.Save.isUnlocked('characters', 'goku'));
    ok(!SL.Save.isUnlocked('characters', 'bardock'));
    eq(SL.Save.completion(), 0);
  });
  test('completing the prologue unlocks Bardock and the orbit stage', () => {
    const unlocked = SL.Save.completeMission('prologue_final_stand', { score: 8000, rank: 'A' });
    ok(unlocked.some((u) => u.target === 'bardock'));
    ok(SL.Save.isUnlocked('characters', 'bardock'));
    ok(SL.Save.isUnlocked('stages', 'orbit'));
    ok(SL.Save.completion() > 0);
  });
  test('unlocks are not granted twice', () => {
    const again = SL.Save.completeMission('prologue_final_stand', { score: 9000, rank: 'S' });
    eq(again.length, 0);
    eq(SL.Save.data.story.missions.prologue_final_stand.bestRank, 'S');
    eq(SL.Save.data.story.missions.prologue_final_stand.clears, 2);
  });
  test('lower scores do not overwrite best rank', () => {
    SL.Save.completeMission('prologue_final_stand', { score: 100, rank: 'D' });
    eq(SL.Save.data.story.missions.prologue_final_stand.bestRank, 'S');
  });
  test('save round-trips through storage', () => {
    SL.Save.recordBattle({ won: true, maxCombo: 14, character: 'goku', damage: 5000 });
    SL.Save.write();
    SL.Save.data = SL.Save.fresh();
    SL.Save.load();
    eq(SL.Save.loadStatus, 'loaded');
    eq(SL.Save.data.stats.maxCombo, 14);
    ok(SL.Save.isUnlocked('characters', 'bardock'));
  });
  test('corrupted main save restores from backup and keeps a copy', () => {
    SL.Save.write();
    ctx.__store.set(SL.Save.KEY, '{"sum":"deadbeef","payload":"{}"}');
    SL.Save.load();
    eq(SL.Save.loadStatus, 'restoredBackup');
    ok(ctx.__store.has(SL.Save.CORRUPT_KEY));
    ok(SL.Save.isUnlocked('characters', 'bardock'));
  });
  test('garbage in both slots resets safely without throwing', () => {
    ctx.__store.set(SL.Save.KEY, 'not json');
    ctx.__store.set(SL.Save.BACKUP_KEY, 'also not json');
    SL.Save.load();
    eq(SL.Save.loadStatus, 'corruptReset');
    ok(!SL.Save.isUnlocked('characters', 'bardock'));
  });
  test('older saves missing fields are migrated with defaults', () => {
    const old = { version: 1, story: { started: true, missions: {} }, unlocks: { characters: ['goku', 'vegeta'] } };
    ctx.__store.set(SL.Save.KEY, SL.Save.pack(old));
    SL.Save.load();
    eq(SL.Save.loadStatus, 'loaded');
    ok(SL.Save.data.stats && typeof SL.Save.data.stats.battles === 'number');
    ok(Array.isArray(SL.Save.data.unlocks.stages));
  });
}

console.log('\nSettings');
{
  const { SL } = makeContext();
  test('graphics preset writes all quality keys', () => {
    SL.Settings.load();
    SL.Settings.applyPreset('low');
    eq(SL.Settings.data.graphics.shadows, 'off');
    eq(SL.Settings.data.graphics.antialias, false);
  });
  test('changing a single quality key switches preset to custom', () => {
    SL.Settings.set('graphics.shadows', 'high');
    eq(SL.Settings.data.graphics.preset, 'custom');
  });
  test('rebinding a key removes it from the action that had it', () => {
    SL.Settings.bind('keyboard', 'light', 0, 'KeyK');
    ok(SL.Settings.data.controls.keyboard.light.includes('KeyK'));
    ok(!SL.Settings.data.controls.keyboard.heavy.includes('KeyK'));
  });
  test('clearing a binding slot works', () => {
    SL.Settings.bind('keyboard', 'blast', 1, null);
    eq(SL.Settings.data.controls.keyboard.blast.length, 1);
  });
  test('settings persist and load with new defaults filled in', () => {
    SL.Settings.saveNow();
    const raw = JSON.parse(SL.Settings.storage.getItem('saiyanLegacy.settings.v1'));
    delete raw.hud;
    SL.Settings.storage.setItem('saiyanLegacy.settings.v1', JSON.stringify(raw));
    SL.Settings.load();
    eq(SL.Settings.data.hud.scale, 1);
    ok(SL.Settings.data.controls.keyboard.light.includes('KeyK'));
  });
  test('every schema entry points at an existing default', () => {
    for (const r of SL.Settings.SCHEMA) ok(SL.Settings.DEFAULTS[r.cat][r.key] !== undefined, r.cat + '.' + r.key);
  });
  test('every action has keyboard defaults', () => {
    for (const a of Object.keys(SL.Settings.ACTION_LABELS)) ok(SL.Settings.DEFAULTS.controls.keyboard[a], a);
  });
}

console.log('\nData integrity');
{
  // character data needs THREE-free poses helpers; load with a light shim
  const ctx = makeContext();
  ctx.THREE = new Proxy({}, { get: () => function () {} });
  const load = (rel) => vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), ctx, { filename: rel });
  ctx.SL.Anim = { mirror: (p) => p };
  ['src/data/poses_common.js', 'src/data/hair.js', 'src/data/characters/goku.js', 'src/data/characters/vegeta.js', 'src/data/characters/bardock.js', 'src/data/characters/frieza_force.js', 'src/game/mechanics.js'].forEach(load);
  const { SL } = ctx;
  const poses = SL.data.poses;
  test('every move and special references a pose that exists', () => {
    for (const c of Object.values(SL.data.characters)) {
      const all = Object.assign({}, poses, c.poses || {});
      const need = [];
      const mv = c.moves || {};
      for (const m of mv.light || []) need.push(m.pose.wind, m.pose.strike);
      for (const m of Object.values(mv.heavy || {})) need.push(m.pose.wind, m.pose.strike);
      if (mv.dash) need.push(mv.dash.pose.wind, mv.dash.pose.strike);
      if (mv.throw) need.push(...mv.throw.poses);
      for (const s of Object.values(c.specials || {})) {
        if (s.poses) need.push(...Object.values(s.poses));
        if (s.pose && typeof s.pose === 'string') need.push(s.pose);
        if (s.pose && typeof s.pose === 'object') need.push(...Object.values(s.pose));
        if (s.hits) need.push(...s.hits.map((h) => h.pose));
      }
      if (c.intro) need.push(c.intro.pose);
      if (c.victory) need.push(...c.victory.poses);
      if (c.defeat) need.push(c.defeat.pose);
      for (const n of need) ok(all[n], c.id + ' is missing pose "' + n + '"');
    }
  });
  test('every hair style used by a character or form exists', () => {
    for (const c of Object.values(SL.data.characters)) {
      if (c.appearance.hair) ok(SL.data.hair[c.appearance.hair.style], c.id + ' base hair');
      for (const f of c.forms || []) if (f.look && f.look.hair) ok(SL.data.hair[f.look.hair.style], c.id + ' ' + f.id + ' hair');
    }
  });
  test('every mechanic referenced exists', () => {
    for (const c of Object.values(SL.data.characters)) if (c.mechanic) ok(SL.Mechanics[c.mechanic.type], c.id + ' mechanic ' + c.mechanic.type);
  });
  test('playable characters have full specials and at least one light chain', () => {
    for (const c of Object.values(SL.data.characters)) {
      if (!c.playable) continue;
      ok(c.moves.light.length >= 3, c.id + ' lights');
      ok(c.moves.heavy[0], c.id + ' standalone heavy');
      ok(c.specials.special1 && c.specials.special2 && c.specials.ultimate, c.id + ' specials');
    }
  });
  test('forms after base define a ki cost', () => {
    for (const c of Object.values(SL.data.characters)) (c.forms || []).slice(1).forEach((f) => ok(f.kiCost > 0, c.id + ' ' + f.id));
  });
}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
