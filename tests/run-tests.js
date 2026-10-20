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
  ['src/core/namespace.js', 'src/core/settings.js', 'src/core/voice.js', 'src/core/save.js', 'src/game/rules.js', 'src/data/unlocks.js'].forEach(load);
  ctx.__store = store;
  // minimal mission registry so completion() has content
  ctx.SL.data.missions.prologue_final_stand = { id: 'prologue_final_stand' };
  return ctx;
}

let passed = 0, failed = 0;
const pendingTests = [];
function test(name, fn) {
  const pass = () => {
    passed++;
    console.log('  ok  ' + name);
  };
  const fail = (e) => {
    failed++;
    console.log('  FAIL ' + name + '\n       ' + (e && e.message));
  };
  try {
    const r = fn();
    // async tests (e.g. texture decoding) settle before the summary
    if (r && typeof r.then === 'function') pendingTests.push(r.then(pass, fail));
    else pass();
  } catch (e) {
    fail(e);
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
  test('a Version 0.1 save is imported into the Version 0.3 slot and left untouched', () => {
    ctx.__store.clear();
    const v1 = { version: 1, story: { started: true, missions: { prologue_final_stand: { completed: true, bestRank: 'A', bestScore: 7200 } } }, unlocks: { characters: ['goku', 'vegeta', 'bardock'], stages: ['wasteland', 'orbit'] } };
    const packed = SL.Save.pack(v1);
    const v1Key = SL.Save.LEGACY_KEYS.find((k) => k.endsWith('v1'));
    ctx.__store.set(v1Key, packed);
    SL.Save.load();
    eq(SL.Save.loadStatus, 'imported');
    eq(SL.Save.data.version, 3);
    ok(SL.Save.data.unlocks.characters.includes('bardock'), 'unlocks carried over');
    ok(SL.Save.data.whatIf && typeof SL.Save.data.whatIf.missions === 'object', 'what-if track added');
    ok(ctx.__store.has(SL.Save.KEY), 'written to the v3 key');
    eq(ctx.__store.get(v1Key), packed, 'v0.1 save is not modified');
  });
  test('a Version 0.2 save is preferred over an older 0.1 save and keeps its What-If progress', () => {
    ctx.__store.clear();
    const v1 = { version: 1, story: { started: true, missions: {} }, unlocks: { characters: ['goku', 'vegeta'] } };
    const v2 = { version: 2, story: { started: true, missions: { saiyan_brothers: { completed: true, bestRank: 'S', bestScore: 9100 } } }, whatIf: { seen: true, missions: { whatif_raditz: { completed: true } } }, unlocks: { characters: ['goku', 'vegeta', 'raditz'], stages: ['plains'] } };
    const v1Key = SL.Save.LEGACY_KEYS.find((k) => k.endsWith('v1'));
    const v2Key = SL.Save.LEGACY_KEYS.find((k) => k.endsWith('v2'));
    const packed2 = SL.Save.pack(v2);
    ctx.__store.set(v1Key, SL.Save.pack(v1));
    ctx.__store.set(v2Key, packed2);
    SL.Save.load();
    eq(SL.Save.loadStatus, 'imported');
    eq(SL.Save.data.version, 3);
    ok(SL.Save.data.unlocks.characters.includes('raditz'), 'v0.2 unlocks used');
    ok(SL.Save.data.story.missions.saiyan_brothers.completed, 'v0.2 story progress used');
    ok(SL.Save.data.whatIf.missions.whatif_raditz.completed, 'What-If track kept separate');
    eq(ctx.__store.get(v2Key), packed2, 'v0.2 save is not modified');
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
  ['src/data/poses_common.js', 'src/data/hair.js', 'src/data/characters/goku.js', 'src/data/characters/vegeta.js', 'src/data/characters/bardock.js', 'src/data/characters/frieza_force.js', 'src/data/characters/raditz.js', 'src/data/characters/piccolo.js', 'src/data/characters/kid_gohan.js', 'src/data/characters/other_world.js', 'src/data/characters/saibaman.js', 'src/data/characters/z_fighters.js', 'src/data/characters/saiyan_allies.js', 'src/data/characters/nappa.js', 'src/data/characters/great_ape.js', 'src/data/characters/namek_force.js', 'src/data/characters/namek_locals.js', 'src/data/characters/zarbon.js', 'src/data/characters/future_trunks.js', 'src/data/characters/cold_force.js', 'src/data/characters/androids_gero.js', 'src/data/characters/androids_pair.js', 'src/data/characters/cell.js', 'src/data/characters/cell_junior.js', 'src/data/characters/cell_games_cast.js', 'src/data/characters/chichi.js', 'src/data/characters/teen_gohan.js', 'src/data/characters/ginyu_force.js', 'src/data/characters/test_dummy.js', 'src/data/characters/adult_gohan.js', 'src/data/characters/future_timeline.js', 'src/data/characters/great_saiyaman.js', 'src/data/characters/videl.js', 'src/data/characters/satan_city.js', 'src/data/characters/buu_kids.js', 'src/data/characters/tournament_cast.js', 'src/data/characters/kai.js', 'src/data/characters/babidi_force.js', 'src/data/characters/majin_buu.js', 'src/data/characters/gotenks.js', 'src/data/characters/buu_forms.js', 'src/data/characters/buu_absorbed.js', 'src/data/characters/kai_elder.js', 'src/data/characters/vegito.js', 'src/data/characters/gogeta.js', 'src/data/characters/jiren.js', 'src/data/characters/beerus.js', 'src/data/characters/whis.js', 'src/data/characters/uub.js', 'src/data/characters/endz_cast.js', 'src/data/characters/janemba.js', 'src/data/characters/fusion_reborn_cast.js', 'src/data/characters/broly.js', 'src/data/characters/super_broly_cast.js', 'src/data/characters/universe6_cast.js', 'src/data/characters/caulifla_kefla.js', 'src/data/characters/top_cast.js', 'src/data/characters/poachers_cast.js', 'src/data/characters/survival_cast.js', 'src/data/characters/rof_cast.js', 'src/data/characters/cooler.js', 'src/data/characters/saiyan_squad.js', 'src/data/characters/goku_black.js', 'src/data/characters/broly_z.js', 'src/data/characters/movie_androids.js', 'src/data/characters/movie_villains.js', 'src/data/characters/movie_cast.js', 'src/data/characters/zamasu.js', 'src/data/characters/future_androids.js', 'src/data/characters/super_perfect_cell.js', 'src/data/characters/super_hero_cast.js', 'src/data/characters/gt_cast.js', 'src/data/characters/dragon_ball_cast.js', 'src/data/characters/movie_henchmen.js', 'src/data/characters/dragon_ball_extras.js', 'src/data/dialogue.js', 'src/game/mechanics.js', 'src/data/schema.js', 'src/data/unlocks.js', 'src/data/missions/prologue_bardock.js', 'src/data/missions/prologue_ending.js','src/data/missions/whatif_signal.js','src/data/missions/saiyan_raditz.js', 'src/data/missions/saiyan_training.js', 'src/data/missions/saiyan_snakeway.js', 'src/data/missions/saiyan_arrival.js', 'src/data/scenes/saiyan_saga.js', 'src/data/missions/saiyan_nappa.js', 'src/data/missions/saiyan_vegeta.js', 'src/data/missions/whatif_piccolo.js', 'src/data/missions/whatif_tail.js', 'src/data/missions/whatif_prince.js', 'src/data/missions/namek_hunted.js', 'src/data/scenes/namek_prince.js', 'src/data/missions/namek_vegeta.js', 'src/data/missions/namek_zarbon.js', 'src/data/missions/namek_rematch.js', 'src/data/missions/namek_guru.js', 'src/data/missions/namek_guldo.js', 'src/data/missions/namek_recoome.js', 'src/data/scenes/namek_ginyu.js', 'src/data/missions/namek_ginyu_pair.js', 'src/data/missions/namek_ginyu.js', 'src/data/missions/namek_frog.js', 'src/data/missions/frieza_cinematics.js', 'src/data/scenes/namek_nail.js', 'src/data/missions/namek_nail.js', 'src/data/missions/namek_frieza1.js', 'src/data/missions/namek_frieza2.js', 'src/data/scenes/namek_gohan_rage.js', 'src/data/missions/namek_gohan_frieza2.js', 'src/data/scenes/namek_arrival.js', 'src/data/scenes/namek_kaioken.js', 'src/data/scenes/namek_vegeta_end.js', 'src/data/missions/namek_goku.js', 'src/data/scenes/namek_kaioken20.js', 'src/data/missions/namek_kaioken20.js', 'src/data/missions/whatif_twenty.js', 'src/data/scenes/namek_spirit_bomb.js', 'src/data/missions/namek_vegeta_end.js', 'src/data/scenes/namek_super_saiyan.js', 'src/data/scenes/namek_rage.js', 'src/data/missions/namek_spirit_bomb.js', 'src/data/scenes/namek_destruction.js', 'src/data/scenes/namek_finale.js', 'src/data/scenes/namek_wish.js', 'src/data/missions/namek_super_saiyan.js', 'src/data/missions/namek_end.js', 'src/data/scenes/namek_aftermath.js', 'src/data/missions/namek_aftermath.js', 'src/data/missions/trunks_kit.js', 'src/data/scenes/android_arrival.js', 'src/data/missions/android_trunks.js', 'src/data/scenes/android_warning.js', 'src/data/missions/android_warning.js', 'src/data/scenes/android_nineteen.js', 'src/data/missions/android_nineteen.js', 'src/data/scenes/android_lab.js', 'src/data/missions/android_lab.js', 'src/data/scenes/android_road.js', 'src/data/missions/android_road.js', 'src/data/scenes/cell_first.js', 'src/data/missions/cell_first.js', 'src/data/scenes/cell_absorb.js', 'src/data/missions/cell_semi.js', 'src/data/missions/cell_perfect.js', 'src/data/missions/cell_kit.js', 'src/data/scenes/cell_chamber.js', 'src/data/missions/cell_chamber.js', 'src/data/scenes/cell_games.js', 'src/data/missions/cell_games.js', 'src/data/scenes/cell_gohan.js', 'src/data/missions/cell_gohan.js', 'src/data/scenes/cell_rampage.js', 'src/data/missions/cell_rampage.js', 'src/data/scenes/cell_goodbye.js', 'src/data/missions/cell_goodbye.js', 'src/data/scenes/cell_fatherson.js', 'src/data/missions/cell_fatherson.js', 'src/data/scenes/cell_future.js', 'src/data/missions/cell_future.js', 'src/data/scenes/buu_era.js', 'src/data/missions/buu_years.js', 'src/data/missions/buu_saiyaman.js', 'src/data/missions/buu_kids.js', 'src/data/scenes/buu_tournament.js', 'src/data/missions/buu_flight.js', 'src/data/missions/buu_junior.js', 'src/data/missions/buu_spopovich.js', 'src/data/missions/buu_kibito.js', 'src/data/scenes/buu_babidi.js', 'src/data/missions/buu_pursuit.js', 'src/data/missions/buu_ship.js', 'src/data/missions/buu_kit.js', 'src/data/scenes/buu_majin.js', 'src/data/missions/buu_majin.js', 'src/data/scenes/buu_pride.js', 'src/data/missions/buu_pride.js', 'src/data/scenes/buu_awakening.js', 'src/data/missions/buu_awakening.js', 'src/data/scenes/buu_sacrifice.js', 'src/data/missions/buu_sacrifice.js', 'src/data/scenes/buu_ssj3.js', 'src/data/missions/buu_ssj3.js', 'src/data/scenes/buu_fusion.js', 'src/data/missions/buu_fusion.js', 'src/data/scenes/buu_split.js', 'src/data/missions/buu_split.js', 'src/data/scenes/buu_timechamber.js', 'src/data/missions/buu_timechamber.js', 'src/data/scenes/buu_zsword.js', 'src/data/missions/buu_zsword.js', 'src/data/scenes/buu_ultimate.js', 'src/data/missions/buu_ultimate.js', 'src/data/missions/vegito_kit.js', 'src/data/scenes/buu_potara.js', 'src/data/missions/buu_potara.js', 'src/data/missions/buu_earring.js', 'src/data/scenes/buu_vegito.js', 'src/data/missions/buu_prince.js', 'src/data/missions/buu_vegito.js', 'src/data/scenes/buu_supervegito.js', 'src/data/missions/buu_supervegito.js', 'src/data/scenes/buu_inside.js', 'src/data/missions/buu_inside.js', 'src/data/scenes/buu_kid.js', 'src/data/scenes/sacred_round.js', 'src/data/missions/buu_kidbuu.js', 'src/data/missions/buu_sacred.js', 'src/data/scenes/buu_spiritbomb.js', 'src/data/missions/buu_spiritbomb.js', 'src/data/missions/endz_kit.js', 'src/data/scenes/buu_peace.js', 'src/data/missions/buu_peace.js', 'src/data/scenes/end_z.js', 'src/data/missions/endz_village.js', 'src/data/missions/endz_tournament.js', 'src/data/missions/bog_kit.js', 'src/data/missions/bog_awaken.js', 'src/data/missions/bog_kingkai.js', 'src/data/missions/bog_party.js', 'src/data/missions/bog_wrath.js', 'src/data/missions/bog_ritual.js', 'src/data/missions/bog_battle.js', 'src/data/missions/bog_sphere.js', 'src/data/scenes/whatif_gogeta.js', 'src/data/missions/whatif_gogeta.js', 'src/data/dragonballs.js', 'src/data/lore.js', 'src/data/missions/db_hunt.js', 'src/data/missions/whatif_trunks.js', 'src/data/missions/whatif_vegeta.js', 'src/data/missions/whatif_cell.js', 'src/data/missions/whatif_frieza.js', 'src/data/missions/fr_kit.js', 'src/data/scenes/fusion_reborn.js', 'src/data/missions/fr_cleansing.js', 'src/data/missions/fr_janemba.js', 'src/data/missions/fr_gohan.js', 'src/data/missions/fr_boys.js', 'src/data/missions/fr_vegeta.js', 'src/data/missions/fr_veku.js', 'src/data/missions/fr_gogeta.js', 'src/data/missions/fr_challenges.js', 'src/data/missions/bb_kit.js', 'src/data/scenes/super_broly.js', 'src/data/scenes/super_broly2.js', 'src/data/missions/bb_planet.js', 'src/data/missions/bb_vampa.js', 'src/data/missions/bb_clash.js', 'src/data/missions/bb_wrath.js', 'src/data/missions/bb_goku.js', 'src/data/missions/bb_legend.js', 'src/data/missions/bb_alliance.js', 'src/data/missions/bb_fusion.js', 'src/data/missions/bb_gogeta.js', 'src/data/missions/bb_epilogue.js', 'src/data/scenes/rof.js', 'src/data/missions/rof_invasion.js', 'src/data/scenes/rof_goku.js', 'src/data/missions/rof_goku.js', 'src/data/scenes/rof_finale.js', 'src/data/missions/rof_finale.js', 'src/data/scenes/universe6.js', 'src/data/missions/u6_cabba.js', 'src/data/missions/u6_kit.js', 'src/data/missions/u6_botamo.js', 'src/data/missions/u6_frost_goku.js', 'src/data/missions/u6_frost_piccolo.js', 'src/data/missions/u6_frost_vegeta.js', 'src/data/missions/u6_magetta.js', 'src/data/missions/u6_hit.js', 'src/data/missions/u6_goku_hit.js', 'src/data/missions/ft_black.js', 'src/data/missions/ft_rose.js', 'src/data/missions/ft_hakai.js', 'src/data/missions/ft_zero.js', 'src/data/missions/ft_genuine.js', 'src/data/missions/ft_scythe.js','src/data/missions/ft_vegito.js', 'src/data/missions/ft_hope.js', 'src/data/missions/sh_beast.js', 'src/data/missions/hit_contract.js', 'src/data/missions/us_ranger.js', 'src/data/missions/us_gohan.js', 'src/data/missions/us_frieza.js', 'src/data/missions/top_kit.js', 'src/data/missions/top_jiren.js', 'src/data/missions/top_saiyans.js', 'src/data/missions/top_kefla.js', 'src/data/missions/top_toppo.js', 'src/data/missions/top_vegeta.js', 'src/data/missions/top_mui.js', 'src/data/missions/top_finale.js', 'src/data/story.js', 'src/data/wardrobe.js', 'src/data/stages.js'].forEach(load);
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
      if (mv.throw) need.push(...Object.values(mv.throw.poses), ...Object.values(mv.throw.followUps || {}).map((x) => x.pose));
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
  test('every technique names the pose keys its type plays (a wrong key is a "missing pose" in the fight)', () => {
    // the keys each technique type reads without a fallback: sp.poses.X / sp.pose.X in techniques.js
    // (found 2026-10-02: 19's grip said 'wind' for 'focus', Cell's slam and Frieza's wave and storm likewise)
    const need = {};
    const parts = fs.readFileSync(path.join(root, 'src/game/techniques.js'), 'utf8').split(/register\('(\w+)'/);
    for (let i = 1; i < parts.length; i += 2) {
      const keys = new Set();
      for (const m of parts[i + 1].matchAll(/sp\.(poses?)\.(\w+)(\s*\|\|)?/g)) if (!m[3]) keys.add(m[1] + '.' + m[2]);
      need[parts[i]] = [...keys];
    }
    ok(need.telekinesis && need.telekinesis.includes('poses.focus'), 'the scan finds what telekinesis plays: ' + JSON.stringify(need.telekinesis));
    for (const c of Object.values(SL.data.characters)) {
      const all = [...Object.values(c.specials || {}), ...(c.forms || []).flatMap((f) => Object.values(f.specials || {})), ...(c.extras || [])];
      for (const s of all) {
        for (const k of need[s.type] || []) {
          const [o, key] = k.split('.');
          ok(s[o] && s[o][key], c.id + ' ' + s.id + ' (' + s.type + ') names no ' + k);
        }
      }
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
  test('every character declares its asset quality level; only a production .glb may claim level 3', () => {
    for (const c of Object.values(SL.data.characters)) ok([1, 2, 3].includes(c.assetLevel), c.id + ' assetLevel ' + c.assetLevel);
    const base = SL.data.characters.krillin;
    const fake = Object.assign({}, base, { assetLevel: 3 });
    ok(SL.Schema.validateCharacter(fake).some((m) => m.includes('production .glb')), 'procedural body cannot claim production');
    const mannequin = Object.assign({}, base, { assetLevel: 3, model: { type: 'glb', asset: 'test_dummy', production: true } });
    ok(SL.Schema.validateCharacter(mannequin).some((m) => m.includes('test mannequin')), 'test asset cannot claim production');
    const real = Object.assign({}, base, { assetLevel: 3, model: { type: 'glb', asset: 'krillin_hd', production: true } });
    ok(!SL.Schema.validateCharacter(real).some((m) => /assetLevel|production/.test(m)), 'a real production glb may');
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
    // x2, x3, x4 on Earth, then the two the Namek missions hand over (x10, x20)
    eq(kk.levels.map((l) => l.name).join(','), 'x2,x3,x4,x10,x20');
    eq(kk.strain.buildPerSec.length, kk.levels.length, 'strain is defined for every level');
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
  test('story lock: a mission opens after the previous one is cleared; an already cleared mission is never locked', () => {
    const order = SL.data.storyOrder();
    const iSnake = order.indexOf('saiyan_snakeway');
    ok(iSnake > 0 && order[iSnake - 1] === 'saiyan_survival' && order[iSnake + 1] === 'saiyan_kingkai', 'Snake Way sits between "Alone in the Wild" and "Ten Times Gravity"');
    const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
    ok(!SL.data.storyLocked('prologue_final_stand', results([])), 'the first mission is always open');
    ok(SL.data.storyLocked('saiyan_snakeway', results(['saiyan_brothers'])), 'Snake Way waits for "Alone in the Wild"');
    ok(!SL.data.storyLocked('saiyan_snakeway', results(['saiyan_survival'])), 'and opens after it');
    // a save from before Snake Way existed: "Ten Times Gravity" already cleared stays open
    ok(!SL.data.storyLocked('saiyan_kingkai', results(['saiyan_survival', 'saiyan_kingkai'])), 'cleared mission stays open');
    ok(!SL.data.storyLocked('saiyan_saibamen', results(['saiyan_survival', 'saiyan_kingkai'])), 'the chapter after it stays open');
    ok(SL.data.stages.snakeway.storyOnly, 'Snake Way is a story-only stage (not listed for Free Battle)');
  });
  test('What-If missions are flagged, branch from a canon mission and unlock after it', () => {
    ok(SL.data.story.whatIf.length >= 1);
    for (const w of SL.data.story.whatIf) {
      const m = SL.data.missions[w.mission];
      ok(m && m.whatIf, w.mission + ' flagged whatIf');
      ok(SL.data.missions[m.branchOf] && SL.data.missions[m.branchOf].canon, w.mission + ' branches from a canon mission');
      // (an { any: [...] } unlock: its story condition is the one that must name the branch point)
      eq(w.unlock.missionComplete || (w.unlock.any || []).map((c) => c.missionComplete).find(Boolean), m.branchOf, 'unlocks after its canon chapter');
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
  test('forms after base define a ki cost, unless the player never buys them', () => {
    // a bossOnly form (Frieza's second, third and final) is entered by the boss
    // controller itself, so there is no transform button and nothing to charge for
    for (const c of Object.values(SL.data.characters)) (c.forms || []).slice(1).forEach((f) => ok(f.noCost || f.kiCost > 0, c.id + ' ' + f.id));
  });
}

// behaviour tests on the real engine (headless); `--fast` skips them
if (!process.argv.includes('--fast')) require('./sim-tests')({ test, eq, ok });

Promise.all(pendingTests).then(() => {
  console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
  process.exit(failed ? 1 : 0);
});
