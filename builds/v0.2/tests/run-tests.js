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
  test('leveled forms (Kaioken x3) override the base form multipliers', () => {
    const f = { form: { mult: { damage: 1.1, speed: 1.1 } }, formMult: { damage: 1.3, speed: 1.2 }, def: { stats: { power: 1, defense: 1, speed: 1 } }, balance: 'balanced' };
    eq(Math.round(R.multipliers(f).damage * 100), 130);
    f.formMult = null;
    eq(Math.round(R.multipliers(f).damage * 100), 110);
  });
  test('form guard stamina multiplier defaults to 1', () => {
    const f = { form: { mult: {} }, def: { stats: {} }, balance: 'balanced' };
    eq(R.multipliers(f).guardStamina, 1);
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
  test('a Version 0.1 save is imported into the Version 0.2 slot and left untouched', () => {
    ctx.__store.clear();
    const v1 = { version: 1, story: { started: true, missions: { prologue_final_stand: { completed: true, bestRank: 'A', bestScore: 7200 } } }, unlocks: { characters: ['goku', 'vegeta', 'bardock'], stages: ['wasteland', 'orbit'] } };
    const packed = SL.Save.pack(v1);
    ctx.__store.set(SL.Save.LEGACY_KEYS[0], packed);
    SL.Save.load();
    eq(SL.Save.loadStatus, 'imported');
    eq(SL.Save.data.version, 2);
    ok(SL.Save.data.unlocks.characters.includes('bardock'), 'unlocks carried over');
    ok(SL.Save.data.whatIf && typeof SL.Save.data.whatIf.missions === 'object', 'what-if track added');
    ok(ctx.__store.has(SL.Save.KEY), 'written to the v2 key');
    eq(ctx.__store.get(SL.Save.LEGACY_KEYS[0]), packed, 'v0.1 save is not modified');
  });
  test('What-If clears go to their own track and never touch canon story progress', () => {
    ctx.__store.clear();
    SL.Save.load();
    SL.data.missions.whatif_test = { id: 'whatif_test', whatIf: true };
    const before = JSON.stringify(SL.Save.data.story);
    SL.Save.completeMission('whatif_test', { score: 5000, rank: 'B' });
    eq(JSON.stringify(SL.Save.data.story), before, 'canon story untouched');
    ok(SL.Save.data.whatIf.missions.whatif_test.completed, 'what-if track updated');
    ok(SL.Save.missionResult('whatif_test').completed, 'missionResult reads the right track');
    ok(SL.Save.data.whatIf.seen);
    delete SL.data.missions.whatif_test;
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
  ['src/data/poses_common.js', 'src/data/hair.js', 'src/data/characters/goku.js', 'src/data/characters/vegeta.js', 'src/data/characters/bardock.js', 'src/data/characters/frieza_force.js', 'src/data/characters/raditz.js', 'src/data/characters/piccolo.js', 'src/data/dialogue.js', 'src/game/mechanics.js', 'src/data/schema.js', 'src/data/unlocks.js', 'src/data/missions/prologue_bardock.js', 'src/data/missions/saiyan_raditz.js', 'src/data/story.js', 'src/data/stages.js'].forEach(load);
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
  test('every character passes the schema validator (moves, specials, forms, sequences, barks)', () => {
    const problems = SL.Schema.validateAll();
    ok(problems.length === 0, problems.join('\n       '));
  });
  test('schema validator catches broken data', () => {
    const bad = JSON.parse(JSON.stringify({ id: 'bad', name: 'Bad', playable: true, stats: { hp: 100, ki: 100, stamina: 100 }, appearance: {}, forms: [{ id: 'base' }, { id: 'up' }], moves: { light: [], heavy: {} }, specials: { special1: { type: 'beam', name: 'x', kiCost: 1, damage: 5, radius: [1, 2], chargeMin: 9, chargeMax: 3 } } }));
    const problems = SL.Schema.validateCharacter(bad);
    ok(problems.some((m) => m.includes('kiCost')), 'form kiCost');
    ok(problems.some((m) => m.includes('damage and radius')), 'beam arrays');
    ok(problems.some((m) => m.includes('chargeMin')), 'charge window');
    ok(problems.some((m) => m.includes('special2')), 'missing slot');
  });
  test('Goku V0.2 showcase data is wired (IT modes, Kamehameha tiers, Kaioken levels, SSJ event)', () => {
    const g = SL.data.characters.goku;
    const it = g.specials.special2;
    ['behind', 'front', 'away', 'above'].forEach((m) => ok(it.modes[m], 'IT mode ' + m));
    ok(it.fatigue && it.fatigue.max > 0, 'IT fatigue');
    const k = g.specials.special1;
    ok(k.tiers.length === 3 && k.tiers[2] < k.chargeMax, 'top tier reachable before the forced release');
    ok(k.instant && k.formVariants.kaioken && k.formVariants.ssj, 'instant + form variants');
    const kk = g.forms.find((f) => f.id === 'kaioken');
    eq(kk.levels.length, 3);
    const ssj = g.forms.find((f) => f.id === 'ssj');
    ok(ssj.sequence && ssj.sequence.steps.some((st) => st.burst), 'SSJ sequence');
    ok(g.specials.ultimate.holdToCharge, 'Spirit Bomb hold to charge');
  });
  test('story timeline: every playable chapter points at real canon missions in order', () => {
    const order = SL.data.storyOrder();
    ok(order.length >= 2, 'prologue + chapter 1');
    eq(order[0], 'prologue_final_stand');
    for (const id of order) {
      const m = SL.data.missions[id];
      ok(m, 'mission ' + id);
      ok(!m.whatIf, id + ' must not be a What-If mission');
      ok(SL.data.stages[m.stage], id + ' stage ' + m.stage);
      ok(SL.data.characters[m.character], id + ' character');
    }
  });
  test('What-If missions are flagged, branch from a canon mission and unlock after it', () => {
    ok(SL.data.story.whatIf.length >= 1);
    for (const w of SL.data.story.whatIf) {
      const m = SL.data.missions[w.mission];
      ok(m && m.whatIf, w.mission + ' flagged whatIf');
      ok(SL.data.missions[m.branchOf] && SL.data.missions[m.branchOf].canon, w.mission + ' branches from a canon mission');
      eq(w.unlock.missionComplete, m.branchOf, 'unlocks after its canon chapter');
    }
  });
  test('every mission has named phases, generator scripts and at least one checkpoint', () => {
    for (const m of Object.values(SL.data.missions)) {
      ok(Array.isArray(m.phases) && m.phases.length, m.id + ' phases');
      for (const ph of m.phases) {
        ok(ph.id, m.id + ' phase id');
        ok(ph.run && ph.run.constructor && ph.run.constructor.name === 'GeneratorFunction', m.id + '.' + ph.id + ' run must be a generator');
      }
      ok(m.phases.some((ph) => ph.checkpoint), m.id + ' has a checkpoint');
      ok(typeof m.setup === 'function', m.id + ' setup');
    }
  });
  test('Chapter 1 enforces Saiyan Saga Goku (no transformations or ultimates)', () => {
    for (const id of ['saiyan_brothers', 'whatif_raditz']) {
      const r = SL.data.missions[id].rules;
      eq(r.allowTransform, false, id);
      eq(r.allowUltimates, false, id);
    }
  });
  test('unlock rules reference real characters, stages and missions', () => {
    for (const u of SL.data.unlocks) {
      if (u.type === 'characters') ok(SL.data.characters[u.target], u.id);
      if (u.type === 'stages') ok(SL.data.stages[u.target], u.id);
      if (u.condition && u.condition.missionComplete) ok(SL.data.missions[u.condition.missionComplete], u.id + ' mission');
    }
  });
  test('forms after base define a ki cost', () => {
    for (const c of Object.values(SL.data.characters)) (c.forms || []).slice(1).forEach((f) => ok(f.kiCost > 0, c.id + ' ' + f.id));
  });
}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
