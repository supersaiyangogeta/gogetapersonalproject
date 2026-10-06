// Character customization / saga-aware wardrobe (2026-09-23). Behaviour, not ids: every test
// looks at what the built body actually wears (the model's armor pieces, scouter, emblem textures,
// tail, torso materials) in real headless battles and missions, and at what the save keeps.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const H = require('./headless');
const MiniDom = require('./minidom');

module.exports = function ({ test, eq, ok }) {
  console.log('\nCustomization / saga-aware wardrobe');

  const hex = (c) => (c === undefined || c === null ? c : c.toString(16));

  /** What a built body is wearing, read off the model (not off the selection). */
  function worn(f) {
    const m = f.model;
    const A = m.armorParts;
    const vis = (x) => !!(x && x.visible);
    const lens = m.scouter ? m.scouter.find((x) => x.name === 'scouter:lens') : null;
    return {
      outfit: f.wardrobe && f.wardrobe.outfit,
      armor: !!A && vis(A.plate),
      pads: A ? A.pads.filter(vis).length : 0,
      strap: !!(A && f.appearance.outfit.armor && f.appearance.outfit.armor.padStyle === 'strap'),
      hipGuards: A ? A.hips.filter(vis).length : 0,
      longHips: !!(A && A.hips.length && A.hips[0].scale.y > 0.12),
      scouter: lens ? hex(lens.material.color.getHex()) : null,
      tail: !!m.beltTail,
      emblems: (m.emblems || []).map((e) => e.name + '=' + e.material.userData.emblem),
      top: f.appearance.outfit.top,
      topStyle: f.appearance.outfit.topStyle,
    };
  }
  const fighter = (b, id) => b.fighters.find((f) => f.def.id === id);

  /** A Free Battle exactly as the app builds it (mode 'free', the player's saved looks). */
  function freeBattle(gg, p1 = 'goku', cpu = 'vegeta') {
    const { SL, V3 } = gg;
    return new SL.Battle({
      mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 100 },
      fighters: [{ charId: p1, player: true, team: 0, pos: new V3(-4, 0, 0) }, { charId: cpu, team: 1, pos: new V3(4, 0, 0), dummy: 'idle' }],
      onEnd: () => {},
    });
  }
  const clearAll = (SL, ids) => ids.forEach((id) => SL.Save.completeMission(id, { score: 1, rank: 'C' }));

  test('wardrobe data is valid: every piece, default and canon look resolves; saga restrictions hold; the validator catches bad data', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    eq(SL.Wardrobe.validate().join(' | '), '', 'no problems in the shipped data');
    // every canon era a profile names is a real era, in the story order
    for (const [c, pr] of Object.entries(SL.data.wardrobe.profiles)) for (const era of Object.keys(pr.canonByEra)) ok(SL.data.eras.some((e) => e.id === era), c + ' ' + era);
    // break it on purpose: the validator must name each problem
    const P = SL.data.wardrobe.pieces, pr = SL.data.wardrobe.profiles.vegeta;
    P.bad_outfit = { id: 'bad_outfit', slot: 'outfit', name: 'Bad', chars: ['nobody'], era: 'nowhen', kind: 'canon', status: 'prototype', look: {}, defaults: { armor: 'armor_missing' }, glb: { model: { asset: 'missing_asset' } } };
    pr.canonByEra.saiyan = Object.assign({}, pr.canonByEra.saiyan, { outfit: 'vegeta_whis' }); // a Super outfit in the Saiyan Saga
    const probs = SL.Wardrobe.validate().join('\n');
    ok(/unknown character nobody/.test(probs), 'invalid character');
    ok(/unknown era nowhen/.test(probs), 'invalid era');
    ok(/default armor armor_missing/.test(probs), 'missing component');
    ok(/missing_asset is not loaded/.test(probs), 'missing model reference');
    ok(/saiyan wears vegeta_whis from the later era super/.test(probs), 'invalid saga restriction: ' + probs);
  });

  test('canon auto-select: Vegeta changes armor as the story moves — Saiyan (hip guards, red scouter, tail) → Namek (stripped) → Frieza Force (straps, no scouter) → Earth → Buu (no armor)', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const at = (id, phase = 0) => {
      const b = gg.mission(id, { startPhase: phase });
      gg.step(b, 2);
      const w = worn(fighter(b, 'vegeta'));
      eq(fighter(b, 'vegeta').wardrobeKind, 'canon', id + ' is dressed by the story');
      b.dispose();
      return w;
    };
    const saiyan = at('saiyan_vegeta');
    eq(saiyan.outfit, 'vegeta_saiyan');
    ok(saiyan.armor && saiyan.pads === 2 && saiyan.hipGuards === 2 && saiyan.longHips, 'Saiyan armor: flaps and long hip guards (on the hips, none on the seat)');
    eq(saiyan.scouter, 'ff3a3a', 'the red scouter');
    ok(saiyan.tail, 'and his tail');
    const early = at('namek_vegeta');
    ok(early.armor && early.pads === 2 && early.hipGuards === 0, 'Namek: the hip guards are gone, the flaps stay');
    eq(early.scouter, 'ff3a3a', 'still scouting');
    ok(!early.tail, 'no tail after the Saiyan Saga');
    const late = at('namek_rematch');
    ok(late.armor && late.strap && late.hipGuards === 0, 'after the tank: the later armor, straps instead of flaps');
    eq(late.scouter, null, 'no scouter any more');
    const casual = at('android_warning');
    eq(casual.outfit, 'vegeta_badman');
    ok(!casual.armor && casual.topStyle === 'shirt', 'Age 764: the pink shirt, no armor');
    const earth = at('android_nineteen');
    ok(earth.armor && earth.strap && earth.scouter === null, 'Androids: Capsule Corp armor, no scouter');
    const buu = at('buu_majin');
    ok(!buu.armor && buu.scouter === null && !buu.tail, 'Buu: the sleeveless suit and nothing over it');
    eq(hex(buu.top), '2b2d74', 'in dark indigo');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test("canon auto-select: Goku's gi and kanji follow the eras — 亀 → 界王 on the back → 悟 on Namek → Yardrat → symbol-less (Cell, Buu)", () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const goku = (id) => {
      const b = gg.mission(id);
      gg.step(b, 2);
      const w = worn(fighter(b, 'goku'));
      b.dispose();
      return w;
    };
    eq(goku('saiyan_brothers').emblems.join(','), 'emblem:front=亀,emblem:back=亀', 'Raditz: the Turtle School marks');
    eq(goku('saiyan_nappa').emblems.join(','), 'emblem:front=亀,emblem:back=界\n王', "back from King Kai's planet");
    const namek = goku('namek_goku');
    eq(namek.outfit, 'goku_namek');
    eq(namek.emblems.join(','), 'emblem:front=悟,emblem:back=界\n王', 'the Namek gi');
    eq(goku('android_warning').outfit, 'goku_yardrat', 'he lands in Yardrat clothes');
    const cell = goku('cell_games');
    eq(cell.outfit, 'goku_cell');
    eq(cell.emblems.length, 0, 'the Cell Games gi has no symbol');
    const buu = goku('buu_majin');
    eq(buu.outfit, 'goku_buu');
    eq(buu.emblems.length, 0, 'nor the Buu one');
  });

  test('story continuity always wins: a player who dressed Vegeta in Capsule Corp armor and Goku in the Whis gi still sees the Saiyan Saga in Saiyan armor', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['android_nineteen', 'buu_majin']);
    ok(SL.Wardrobe.select('vegeta', { outfit: 'vegeta_capsule' }).ok, 'the player picks Capsule Corp armor');
    ok(SL.Wardrobe.select('goku', { outfit: 'goku_whis' }).ok, 'and the Whis gi');
    const b = gg.mission('saiyan_vegeta');
    gg.step(b, 2);
    eq(fighter(b, 'vegeta').wardrobe.outfit, 'vegeta_saiyan', 'the Saiyan Saga shows Saiyan armor');
    eq(worn(fighter(b, 'vegeta')).scouter, 'ff3a3a', 'with the scouter');
    eq(fighter(b, 'goku').wardrobe.outfit, 'goku_saiyan', 'and the Turtle School gi');
    b.dispose();
    const fb = freeBattle(gg);
    eq(fighter(fb, 'vegeta').wardrobe.outfit, 'vegeta_capsule', 'while Free Battle wears the choice');
    eq(fighter(fb, 'goku').wardrobe.outfit, 'goku_whis');
    ok(worn(fighter(fb, 'goku')).emblems.every((e) => /@whis/.test(e)), 'with the Whis mark front and back');
    fb.dispose();
  });

  test('Free Battle customization: outfit, armor, emblem and scouter choices are worn, persist through a save round-trip, and do not leak between characters', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['saiyan_kingkai', 'namek_vegeta', 'android_nineteen', 'buu_years']);
    ok(SL.Wardrobe.select('goku', { outfit: 'goku_cell', emblem: 'emblem_kaio', scouter: 'scouter_blue' }).ok, 'Goku: Cell gi with the King Kai mark and a blue scouter (non-canon, allowed here)');
    ok(SL.Wardrobe.select('vegeta', { outfit: 'vegeta_buu', armor: 'armor_v_namek', scouter: 'none', tail: 'none' }).ok, 'Vegeta: Buu suit under Namek armor, no scouter');
    SL.Save.write();
    SL.Save.data = SL.Save.fresh();
    SL.Save.load();
    eq(SL.Save.loadStatus, 'loaded');
    eq(SL.Wardrobe.saved('goku').emblem, 'emblem_kaio', 'emblem persisted');
    eq(SL.Wardrobe.saved('goku').scouter, 'scouter_blue', 'accessory persisted');
    const b = freeBattle(gg);
    const g = worn(fighter(b, 'goku')), v = worn(fighter(b, 'vegeta'));
    eq(g.outfit, 'goku_cell');
    eq(g.emblems.join(','), 'emblem:front=亀,emblem:back=界\n王', 'the chosen emblem is on the chosen gi');
    eq(g.scouter, '3a8aff', 'the blue scouter is on Goku');
    eq(v.scouter, null, "and Goku's scouter did not leak to Vegeta");
    ok(v.armor && v.hipGuards === 0 && v.pads === 2, 'Namek armor over the Buu suit');
    eq(hex(v.top), '2b2d74');
    eq(fighter(b, 'goku').wardrobeKind, 'custom');
    b.dispose();
    // scouter equip / remove on the same character
    ok(SL.Wardrobe.select('goku', Object.assign({}, SL.Wardrobe.saved('goku'), { scouter: 'none' })).ok);
    const b2 = freeBattle(gg);
    eq(worn(fighter(b2, 'goku')).scouter, null, 'removed');
    b2.dispose();
    // Training uses the same choices
    const t = gg.battle({ p1: 'vegeta', p2: 'goku' });
    eq(t.player.wardrobe.outfit, 'vegeta_buu', 'training wears it too');
    t.dispose();
  });

  test('locked outfits cannot be worn; clearing the mission unlocks them, announces them and lets them be picked', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const r = SL.Wardrobe.select('vegeta', { outfit: 'vegeta_capsule' });
    ok(!r.ok && /locked/.test(r.problems.join()), 'refused while locked: ' + r.problems.join());
    eq(SL.Wardrobe.current('vegeta').outfit, 'vegeta_saiyan', 'nothing changed');
    const opt = SL.Wardrobe.options('vegeta', 'outfit', SL.Wardrobe.current('vegeta')).find((o) => o.id === 'vegeta_capsule');
    ok(opt && opt.locked, 'listed as locked');
    // even a hand-edited save cannot wear it
    SL.Wardrobe.store().selected.vegeta = { outfit: 'vegeta_capsule' };
    const b = freeBattle(gg, 'vegeta', 'goku');
    eq(b.player.wardrobe.outfit, 'vegeta_saiyan', 'a locked outfit in the save falls back to the default');
    b.dispose();
    const got = SL.Save.completeMission('android_nineteen', { score: 1, rank: 'C' });
    ok(got.some((u) => u.target === 'vegeta_capsule' && u.type === 'outfits' && /CAPSULE CORP ARMOR/.test(u.title)), 'the clear hands it over with a notice');
    ok(got.some((u) => u.target === 'goku_cell'), "and Goku's Cell-era gi with it");
    ok(SL.Wardrobe.select('vegeta', { outfit: 'vegeta_capsule' }).ok, 'now it can be worn');
    // planned outfits are never wearable
    const p = SL.Wardrobe.select('goku', { outfit: 'goku_early' });
    ok(!p.ok && /planned/.test(p.problems.join()), 'a planned outfit (no body for it yet) is refused');
  });

  test('invalid and incompatible pieces are rejected, and a broken selection never reaches the renderer', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const W = SL.Wardrobe;
    const bad = (c, s, re, msg) => {
      const r = W.select(c, s);
      ok(!r.ok && re.test(r.problems.join()), msg + ': ' + r.problems.join());
    };
    bad('goku', { outfit: 'vegeta_saiyan' }, /does not fit goku/, "Goku cannot wear Vegeta's outfit");
    bad('goku', { outfit: 'no_such_outfit' }, /unknown piece/, 'unknown outfit id');
    bad('goku', { outfit: 'goku_saiyan', armor: 'armor_v_saiyan' }, /cannot be worn over goku_saiyan/, 'no armor over a gi');
    bad('vegeta', { outfit: 'vegeta_saiyan', emblem: 'emblem_kame' }, /does not fit vegeta/, 'no kanji on Vegeta');
    bad('vegeta', { outfit: 'vegeta_saiyan', armor: 'armor_bardock' }, /does not fit vegeta/, "Bardock's armor is Bardock's");
    bad('goku', { outfit: 'goku_saiyan', scouter: 'armor_v_saiyan' }, /is a armor, not a scouter/, 'a piece in the wrong slot');
    bad('vegeta', { outfit: 'vegeta_saiyan', palette: 'namek' }, /palette/, 'a palette the outfit does not offer');
    eq(W.options('goku', 'armor', { outfit: 'goku_saiyan' }).length, 0, 'the screen offers no armor over a gi');
    eq(W.options('vegeta', 'emblem', { outfit: 'vegeta_saiyan' }).length, 0, 'nor emblems on Saiyan armor');
    ok(W.options('vegeta', 'outfit', {}).every((o) => o.piece.chars.includes('vegeta')), "only Vegeta's outfits are listed for Vegeta");
    // a garbage explicit selection still builds the default body
    const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: {}, fighters: [{ charId: 'goku', player: true, team: 0, pos: new V3(0, 0, 0), wardrobe: { outfit: 'nope', scouter: 'nope2', palette: 'zzz' } }], onEnd: () => {} });
    eq(b.player.wardrobe.outfit, 'goku_saiyan', 'garbage falls back to the default outfit');
    eq(b.player.wardrobe.scouter, 'none');
    b.dispose();
    eq(gg.errors.length, 0);
  });

  test('What-If: branches wear the canon look of their branch point; the player may opt in to their own look; a mission can force its own variant', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['android_nineteen']);
    SL.Wardrobe.select('vegeta', { outfit: 'vegeta_capsule' });
    let b = gg.mission('whatif_prince');
    gg.step(b, 2);
    eq(fighter(b, 'vegeta').wardrobeKind, 'whatif');
    eq(fighter(b, 'vegeta').wardrobe.outfit, 'vegeta_saiyan', 'the branch from The Saiyan Prince wears Saiyan armor');
    b.dispose();
    SL.Wardrobe.setPref('whatIfCustom', true);
    b = gg.mission('whatif_prince');
    gg.step(b, 2);
    eq(b.player.def.id, 'vegeta');
    eq(b.player.wardrobe.outfit, 'vegeta_capsule', 'opted in: the player fighter wears the player look');
    eq(fighter(b, 'goku').wardrobe.outfit, 'goku_saiyan', 'the rest of the cast stays in the era');
    b.dispose();
    // a What-If variant the mission forces wins over the player's choice
    SL.data.missions.whatif_prince.appearance = { vegeta: { scouter: 'none', tail: 'none' } };
    b = gg.mission('whatif_prince');
    gg.step(b, 2);
    const w = worn(b.player);
    eq(w.outfit, 'vegeta_saiyan', 'forced variant');
    ok(w.scouter === null && !w.tail, 'without the scouter and the tail');
    b.dispose();
    delete SL.data.missions.whatif_prince.appearance;
  });

  test('transformations keep the outfit: Super Saiyan on a custom gi, Majin Vegeta gets the M (and loses it again) over the Buu suit', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['android_nineteen']);
    SL.Wardrobe.select('goku', { outfit: 'goku_cell' });
    const b = freeBattle(gg);
    const g = b.player;
    g.applyForm(g.def.forms.findIndex((f) => f.id === 'ssj'));
    eq(g.model.currentHair.split('|')[0], 'goku_ssj', 'the hair changes');
    eq(worn(g).outfit, 'goku_cell');
    eq(worn(g).emblems.length, 0, 'the symbol-less gi stays symbol-less');
    g.setTorn(true);
    g.applyForm(0);
    ok(g.torn && g.model._torn, 'battle damage survives the power-down');
    b.dispose();
    const m = gg.mission('buu_majin', { startPhase: 1 });
    gg.step(m, 2);
    const v = fighter(m, 'vegeta');
    const bars = () => (v.model._headExtras || []).filter((x) => x.shape === 'bar').length;
    v.applyForm(0);
    eq(bars(), 0, 'no mark in base form');
    v.applyForm(v.def.forms.findIndex((f) => f.id === 'majin'));
    eq(bars(), 4, 'the Majin state puts the M on');
    eq(worn(v).outfit, 'vegeta_buu');
    ok(!worn(v).armor, 'still the Buu suit, no armor');
    v.applyForm(0);
    eq(bars(), 0, 'and it comes off with the state');
    m.dispose();
  });

  test('battle damage works on dressed bodies: the Namek gi tears down to the blue undershirt, armor breaks in stages, and wear survives a transformation', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('namek_end');
    gg.step(b, 2);
    const g = fighter(b, 'goku');
    const M = g.model;
    g.setTorn(false);
    g.setTorn(true);
    eq(M.chestMesh.material.color.getHex(), g.appearance.skin, 'the chest is bare');
    eq(hex(M.gi.trap.material.color.getHex()), '2a4aa8', 'the undershirt straps are left');
    eq(hex(M.gi.abs.material.color.getHex()), '2a4aa8', 'and the undershirt round the waist');
    eq(M.gi.sleeves.filter((s) => s.visible).length, 1, 'one undershirt sleeve hangs on');
    ok(M.emblems.length === 2 && M.emblems.every((e) => !e.visible), 'the 悟 and 界王 marks went with the gi');
    g.setTorn(false);
    ok(M.gi.sleeves.every((s) => s.visible) && M.gi.trim.every((s) => s.visible), 'and it can be mended for a restart');
    b.dispose();
    // armor in levels, on the custom preview dial
    const f = freeBattle(gg, 'vegeta', 'goku');
    const v = f.player;
    SL.Wardrobe.applyDamage(v, 1);
    ok(v.model._worn && v.model.armorParts.cracks.length > 0, 'battle-worn: dirt and cracks');
    SL.Wardrobe.applyDamage(v, 2);
    eq(v.model.armorParts.pads.filter((p) => p.visible).length, 0, 'heavy: the shoulder guards are gone');
    v.applyForm(v.def.forms.findIndex((x) => x.id === 'ssj'));
    ok(v.model._worn, 'the wear survives Super Saiyan');
    SL.Wardrobe.applyDamage(v, 0);
    eq(v.model.armorParts.pads.filter((p) => p.visible).length, 2, 'intact again');
    f.dispose();
  });

  test('model fallback: characters without a wardrobe are untouched; a .glb body takes an outfit (material override, socket attachment); a missing asset costs the piece, not the fighter', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'piccolo', p2: 'goku' });
    eq(b.player.wardrobe, undefined, 'Piccolo has no wardrobe yet');
    eq(b.player.appearance, SL.data.characters.piccolo.appearance, 'and wears his own appearance');
    b.dispose();
    const spawn = (sel) => new SL.Battle({ mode: 'training', stageId: 'wasteland', skipIntro: true, rules: {}, fighters: [{ charId: 'test_dummy', player: true, team: 0, pos: new V3(0, 0, 0), wardrobe: sel }], onEnd: () => {} });
    const plain = spawn({ outfit: 'dummy_default' });
    const body = (bb) => [...bb.player.model.mats.values()].find((m) => m.userData.gltfName === 'Body');
    eq(plain.player.model.def.model.type, 'glb', 'still the imported body');
    ok(body(plain).color.getHex() !== 0xf57b22, 'own material colour');
    plain.dispose();
    const orange = spawn({ outfit: 'dummy_orange' });
    eq(body(orange).color.getHex(), 0xf57b22, 'the outfit recolours the Body material by name');
    eq(orange.player.model.attachments.length, 1, 'and puts its accessory mesh on the head socket');
    eq(orange.player.model.attachments[0].parent, orange.player.model.joints.head);
    orange.dispose();
    const P = SL.data.wardrobe.pieces;
    P.dummy_broken = { id: 'dummy_broken', slot: 'outfit', name: 'Broken', chars: ['test_dummy'], era: 'super', kind: 'event', status: 'prototype', look: {}, glb: { model: { type: 'glb', asset: 'missing_body' }, attach: [{ asset: 'missing_prop', joint: 'head' }] } };
    const broken = spawn({ outfit: 'dummy_broken' });
    eq(broken.player.model.def.model.asset, 'test_dummy', 'a replacement body that is not loaded falls back to the own body');
    eq(broken.player.model.attachments.length, 0, 'the missing accessory is skipped');
    ok(gg.warnings.some((w) => /missing_body/.test(w)) && gg.warnings.some((w) => /missing_prop/.test(w)), 'both are reported');
    broken.dispose();
    delete P.dummy_broken;
    eq(gg.errors.length, 0);
  });

  test('an existing save migrates safely: progress kept, wardrobe fields added, outfits earned by past clears unlocked on load', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    // a save written before the wardrobe existed: no wardrobe, no outfit lists
    const old = SL.Save.fresh();
    delete old.wardrobe;
    delete old.unlocks.outfits;
    delete old.unlocks.accessories;
    for (const id of SL.data.storyOrder().slice(0, SL.data.storyOrder().indexOf('namek_aftermath') + 1)) old.story.missions[id] = { completed: true, clears: 1, bestRank: 'A', bestScore: 5000 };
    old.story.started = true;
    old.stats.battles = 42;
    gg.ctx.localStorage.setItem(SL.Save.KEY, SL.Save.pack(old));
    SL.Save.load();
    eq(SL.Save.loadStatus, 'loaded');
    eq(SL.Save.data.stats.battles, 42, 'stats kept');
    ok(SL.Save.data.story.missions.namek_aftermath.completed, 'story kept');
    ok(SL.Save.data.wardrobe && SL.Save.data.wardrobe.selected, 'wardrobe fields added');
    ok(SL.Save.isUnlocked('outfits', 'goku_namek'), 'the Namek gi, earned before the wardrobe existed');
    ok(SL.Save.isUnlocked('outfits', 'vegeta_namek_late') && SL.Save.isUnlocked('accessories', 'emblem_go'), 'and the rest of that progress');
    ok(!SL.Save.isUnlocked('outfits', 'goku_cell'), 'but nothing from later');
    eq(SL.Wardrobe.current('goku').outfit, 'goku_saiyan', 'the default look until the player picks');
  });

  test('restore canon default: the character returns to their default look, per character', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['android_nineteen']);
    SL.Wardrobe.select('goku', { outfit: 'goku_cell', scouter: 'scouter_red' });
    SL.Wardrobe.select('vegeta', { outfit: 'vegeta_capsule' });
    const d = SL.Wardrobe.restoreDefault('goku');
    eq(d.outfit, 'goku_saiyan');
    eq(d.scouter, 'none');
    eq(d.emblem, 'emblem_kame');
    eq(SL.Wardrobe.saved('goku'), null, 'the choice is forgotten');
    eq(SL.Wardrobe.current('vegeta').outfit, 'vegeta_capsule', "Vegeta's is not");
  });

  test('the Customization screen: the figure stands in the menu scene, changes as choices change, saves them, only offers valid ones, restores the default and gives the scene back', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const dom = MiniDom.create();
    gg.ctx.document = dom.document;
    for (const f of ['src/ui/ui.js', 'src/ui/screens_menu.js', 'src/ui/screens_wardrobe.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), gg.ctx, { filename: f });
    const { SL } = gg;
    SL.Portraits.get = () => '';
    SL.Portraits.outfit = () => '';
    SL.Portraits.release = () => {};
    SL.UI.root = dom.document.getElementById('screens');
    SL.App = { menuScene: new SL.MenuScene() };
    clearAll(SL, ['prologue_final_stand', 'android_nineteen']);
    const scene = SL.App.menuScene;
    const s = SL.UI.push(SL.Screens.wardrobe());
    const P = s.preview;
    ok(P.f && P.f.def.id === 'goku', 'Goku stands in the menu scene');
    ok(scene.hero.hidden, 'in place of the menu hero');
    ok(/CUSTOMIZATION/i.test(s.el.textContent) && /Symbol-less Gi|Turtle School Gi/.test(s.el.textContent), 'the screen names the outfit');
    const labels = [...s.el.querySelectorAll('.wd-lbl')].map((n) => n.textContent);
    ok(labels.includes('Outfit') && labels.includes('Emblem') && labels.includes('Scouter') && !labels.includes('Armor'), 'rows for what Goku can change, none for armor over a gi: ' + labels.join(','));
    // cycle the outfit: the next offered one is the Cell gi (unlocked), never a locked or planned one
    const offered = [];
    const outfitRow = s.items.find((it) => it.key === 'outfit');
    s.focus(s.items.indexOf(outfitRow), true);
    for (let i = 0; i < 12; i++) {
      s.handleNav({ right: true });
      offered.push(s.state.sel.outfit);
      eq(s.preview.f.wardrobe.outfit, s.state.sel.outfit, 'the figure changed with it');
    }
    ok(offered.includes('goku_cell'), 'the unlocked Cell gi is offered');
    ok(!offered.includes('goku_namek') && !offered.includes('goku_early'), 'locked and planned outfits are not: ' + [...new Set(offered)].join(','));
    while (s.state.sel.outfit !== 'goku_cell') s.handleNav({ right: true });
    eq(SL.Wardrobe.saved('goku').outfit, 'goku_cell', 'saved at once');
    eq(worn(s.preview.f).emblems.length, 0, 'the figure wears the symbol-less gi');
    const strip = s.el.querySelectorAll('.wd-thumb');
    ok(strip.length >= 10 && s.el.querySelectorAll('.wd-thumb.locked').length > 0 && s.el.querySelectorAll('.wd-thumb.planned').length > 0, 'the strip shows every outfit, locked and planned ones greyed');
    // the scouter on and off
    s.focus(s.items.findIndex((it) => it.key === 'scouter'), true);
    s.handleNav({ right: true });
    ok(worn(s.preview.f).scouter, 'a scouter appears on the figure');
    // transformation preview
    s.focus(s.items.findIndex((it) => it.key === 'form'), true);
    s.handleNav({ right: true });
    ok(s.preview.f.formIndex > 0, 'form preview: ' + s.preview.f.form.id);
    // switch character: Vegeta has armor rows, and Goku's scouter is not on him
    s.onTab(1);
    eq(s.preview.f.def.id, 'vegeta');
    const vl = [...s.el.querySelectorAll('.wd-lbl')].map((n) => n.textContent);
    ok(vl.includes('Armor') && !vl.includes('Emblem'), 'Vegeta: armor, no kanji');
    eq(worn(s.preview.f).scouter, 'ff3a3a', "his own red scouter, not Goku's choice");
    s.onTab(-1);
    // restore
    const restore = s.items.find((it) => it.key === 'restore');
    restore.onSelect();
    eq(s.state.sel.outfit, 'goku_saiyan', 'restored');
    eq(s.preview.f.wardrobe.outfit, 'goku_saiyan', 'on the figure too');
    SL.UI.pop();
    ok(!scene.hero.hidden, 'leaving gives the menu its hero back');
    ok(!scene.battle.fighters.some((f) => f === P.f), 'and the preview figure is gone');
    eq(gg.errors.length, 0, 'errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
/* ============ refinement pass (2026-09-24): real tails, Bardock, construction ============ */

  /** The Customization screen over a real menu scene (headless, small DOM). */
  function uiEnv(clears) {
    const gg = H.create({ quiet: true, seed: 3 });
    const dom = MiniDom.create();
    gg.ctx.document = dom.document;
    for (const f of ['src/ui/ui.js', 'src/ui/screens_menu.js', 'src/ui/screens_wardrobe.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), gg.ctx, { filename: f });
    const { SL } = gg;
    SL.Portraits.get = () => '';
    SL.Portraits.outfit = () => '';
    SL.Portraits.release = () => {};
    SL.UI.root = dom.document.getElementById('screens');
    SL.App = { menuScene: new SL.MenuScene() };
    clearAll(SL, clears || []);
    return { gg, SL, dom };
  }
  /** Where a node sits in the model's own space (the model root's frame). */
  function local(model, node, v) {
    model.root.updateMatrixWorld(true);
    const p = v ? v.clone() : new (node.position.constructor)();
    node.localToWorld(p);
    return model.root.worldToLocal(p);
  }
  const tailMeshes = (m) => { const out = []; m.root.traverse((o) => o.isMesh && /^tail:/.test(o.name) && out.push(o)); return out; };

  test('no brown oval on the lower back: tail "none" builds no tail at all, and no armor puts a plate on the seat', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const b = freeBattle(gg);
    const g = fighter(b, 'goku'), v = fighter(b, 'vegeta');
    eq(g.wardrobe.tail, 'none', 'adult Goku: no tail');
    ok(!g.model.beltTail && !g.model.joints.tailBase && tailMeshes(g.model).length === 0, 'and nothing tail-shaped anywhere on him');
    // Vegeta by default wears the Saiyan armor with his tail wrapped
    eq(v.wardrobe.tail, 'tail_saiyan');
    const A = v.model.armorParts;
    eq(A.hips.length, 2, 'two hip guards');
    for (const h of A.hips) ok(local(v.model, h).z > -0.05, 'each on a hip, none behind: z ' + local(v.model, h).z.toFixed(3));
    b.dispose();
    // taking the tail off leaves nothing behind
    ok(SL.Wardrobe.select('vegeta', { outfit: 'vegeta_saiyan', tail: 'none' }).ok);
    const b2 = freeBattle(gg);
    const v2 = fighter(b2, 'vegeta');
    ok(!v2.model.beltTail && tailMeshes(v2.model).length === 0 && !v2.model.joints.tailBase, 'tail none: no tail geometry');
    b2.dispose();
    // the canon stories keep adult Goku tailless in every era, and Vegeta loses his after the Saiyan Saga
    for (const id of ['saiyan_brothers', 'namek_goku', 'android_nineteen', 'buu_majin']) eq(SL.Wardrobe.canonFor('goku', id).tail, 'none', 'Goku ' + id);
    for (const [id, want] of [['saiyan_vegeta', 'tail_saiyan'], ['namek_vegeta', 'none'], ['android_nineteen', 'none'], ['buu_majin', 'none']]) eq(SL.Wardrobe.canonFor('vegeta', id).tail, want, 'Vegeta ' + id);
    eq(gg.errors.length, 0);
  });

  test('a Saiyan tail is a real tail: wrapped, it leaves the lower back, tapers and coils round the waist clear of the body; loose, it hangs behind and curls up', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const b = freeBattle(gg, 'bardock', 'vegeta');
    const f = b.player, m = f.model, bd = m.b;
    eq(m.tailStyle, 'wrapped');
    const grp = m.beltTail, curve = grp.userData.curve;
    eq(grp.name, 'tail:wrapped');
    const tube = grp.children.find((c) => c.name === 'tail:tube');
    ok(tube && tube.geometry.type === 'TubeGeometry', 'a tube along a curve, not a ring');
    ok(grp.children.some((c) => c.name === 'tail:tip'), 'with a rounded tip');
    const start = curve.getPointAt(0), end = curve.getPointAt(1);
    ok(start.z < 0 && start.y < -0.08, 'it starts low on the back (the tailbone): ' + start.toArray().map((x) => x.toFixed(3)));
    ok(end.y > start.y + 0.08, 'and the end is higher up, over the coil');
    // thick at the root, thin at the tip
    const pos = tube.geometry.attributes.position, R = 8, T = pos.count / (R + 1) - 1;
    const radiusAt = (i) => { const c = curve.getPointAt(i / T); return new V3().fromBufferAttribute(pos, i * (R + 1)).distanceTo(c); };
    ok(radiusAt(T) < radiusAt(2) * 0.6, 'it tapers: ' + radiusAt(2).toFixed(4) + ' → ' + radiusAt(T).toFixed(4));
    // every point of the coil stays outside the belly (and the armor over it)
    const ax = bd.waistW * 1.13, az = bd.waistD * 1.08;
    for (let t = 0.12; t <= 1; t += 0.02) {
      const p = curve.getPointAt(t);
      ok((p.x / ax) ** 2 + (p.z / az) ** 2 > 1.05, 'clear of the body at t=' + t.toFixed(2));
    }
    b.dispose();
    // loose: jointed segments behind the body, bending upward toward the tip
    ok(SL.Wardrobe.select('goku', { outfit: 'goku_saiyan', tail: 'tail_saiyan_free' }).ok);
    const b2 = freeBattle(gg);
    const gm = b2.player.model;
    eq(gm.tailStyle, 'free');
    ok(gm.joints.tailBase && gm.tailSegs.length >= 8, 'segments from the lower back');
    gg.step(b2, 30);
    const pts = gm.tailSegs.map((sg) => local(gm, sg.node));
    ok(pts.every((p) => p.z < -0.05), 'all of it behind the body: ' + pts.map((p) => p.z.toFixed(2)).join(','));
    const low = Math.min(...pts.map((p) => p.y));
    ok(pts[pts.length - 1].y > low + 0.03, 'and it curls back up at the end');
    b2.dispose();
    eq(gg.errors.length, 0);
  });

  test('Bardock: every outfit switches to every other one; an armor that does not fit falls back to the outfit\'s own, and nothing invalid reaches the body', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const W = SL.Wardrobe;
    clearAll(SL, ['prologue_final_stand']);
    const outfits = ['bardock_classic', 'bardock_damaged', 'bardock_movie', 'bardock_super'];
    const allowed = { bardock_classic: ['armor_bardock', 'armor_bardock_movie'], bardock_damaged: ['armor_bardock'], bardock_movie: ['armor_bardock', 'armor_bardock_movie'], bardock_super: ['armor_bardock_movie', 'armor_bardock'] };
    for (const from of outfits) {
      for (const to of outfits) {
        // wearing "from" with any armor it allows, pick "to" keeping that armor where it can
        for (const armor of allowed[from]) {
          const r = W.sanitize('bardock', { outfit: to, armor, scouter: 'scouter_blue', tail: 'tail_saiyan_free' }, { checkUnlock: true });
          ok(allowed[to].includes(r.selection.armor), from + ' → ' + to + ' with ' + armor + ': armor ' + r.selection.armor);
          ok(W.select('bardock', r.selection).ok, from + ' → ' + to + ': the resolved look is accepted');
          eq(W.sanitize('bardock', r.selection, { checkUnlock: true }).problems.length, 0, 'and it is valid');
        }
      }
    }
    // the exact case from the owner's screenshot: movie armor held when the damaged (classic) look is chosen
    const fixed = W.sanitize('bardock', { outfit: 'bardock_damaged', armor: 'armor_bardock_movie' });
    eq(fixed.selection.armor, 'armor_bardock', 'the damaged look takes the classic armor instead');
    // a body is never built from an invalid combination, even when one is passed in directly
    const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: {}, fighters: [{ charId: 'bardock', player: true, team: 0, pos: new V3(0, 0, 0), wardrobe: { outfit: 'bardock_damaged', armor: 'armor_bardock_movie' } }], onEnd: () => {} });
    eq(b.player.wardrobe.armor, 'armor_bardock');
    eq(b.player.appearance.outfit.armor.padStyle, 'strap', 'the classic armor is what was built (straps, not the movie flaps)');
    b.dispose();
    // the data check catches an outfit whose own defaults do not fit it (the root of the bug)
    SL.data.wardrobe.pieces.bad_combo = { id: 'bad_combo', slot: 'outfit', name: 'Bad', chars: ['bardock'], era: 'prologue', kind: 'canon', status: 'prototype', base: 'bardock_classic', armors: ['armor_bardock'], defaults: { armor: 'armor_bardock_movie' } };
    ok(W.validate().some((x) => /bad_combo: with its own defaults, armor "armor_bardock_movie" is not one of the armors/.test(x)), 'validate names it');
    delete SL.data.wardrobe.pieces.bad_combo;
    eq(W.validate().join(' | '), '', 'the shipped data is clean');
  });

  test('Bardock on the Customization screen: the Outfit row cycles all four looks and back, armor/scouter/tail change, no internal message ever shows, and Restore Canon Default clears everything', () => {
    const { gg, SL } = uiEnv(['prologue_final_stand', 'saiyan_brothers']);
    const s = SL.UI.push(SL.Screens.wardrobe({ charId: 'bardock' }));
    const P = s.preview;
    const key = (k) => s.items.find((it) => it.key === k);
    const msg = () => s.el.querySelector('.wd-tag').textContent;
    s.focus(s.items.indexOf(key('outfit')), true);
    const seen = [];
    for (let i = 0; i < 4; i++) {
      s.handleNav({ right: true });
      seen.push(s.state.sel.outfit);
      eq(P.f.wardrobe.outfit, s.state.sel.outfit, 'the figure follows');
      ok(!/cannot|armor_|not one of|locked/.test(msg()), 'no internal message: ' + msg());
    }
    eq(seen.join(','), 'bardock_damaged,bardock_movie,bardock_super,bardock_classic', 'all four, in order, and round again');
    // backwards too: classic → super directly
    s.handleNav({ left: true });
    eq(s.state.sel.outfit, 'bardock_super');
    eq(P.f.appearance.face.scar, false, 'Super Bardock: no scar');
    ok(P.f.appearance.outfit.headband === undefined, 'and no headband');
    eq(P.f.appearance.outfit.armor.padStyle, 'flap', 'the big shoulder flaps');
    s.handleNav({ right: true });
    eq(s.state.sel.outfit, 'bardock_classic');
    ok(P.f.appearance.face.scar !== false && P.f.appearance.outfit.headband !== undefined, 'classic: scar and headband back');
    // armor, scouter and tail rows
    for (const k of ['armor', 'scouter', 'tail']) {
      s.focus(s.items.indexOf(key(k)), true);
      const before = s.state.sel[k];
      s.handleNav({ right: true });
      ok(s.state.sel[k] !== before, k + ' changes: ' + before + ' → ' + s.state.sel[k]);
      eq(P.f.wardrobe[k], s.state.sel[k], 'on the figure');
      ok(!/cannot|armor_|not one of/.test(msg()), 'no internal message');
    }
    // from super with the classic armor, a loose tail and a blue scouter, restore
    SL.Wardrobe.select('bardock', { outfit: 'bardock_super', armor: 'armor_bardock', scouter: 'scouter_blue', tail: 'tail_saiyan_free' });
    key('restore').onSelect();
    const d = SL.Wardrobe.complete('bardock', SL.data.wardrobe.profiles.bardock.default);
    for (const k of ['outfit', 'armor', 'scouter', 'tail', 'emblem', 'palette']) eq(s.state.sel[k], d[k], 'restored ' + k);
    eq(P.f.model.tailStyle, 'wrapped', 'the figure has the wrapped tail back');
    eq(P.f.appearance.outfit.armor.padStyle, 'strap', 'and the classic armor');
    SL.UI.pop();
    eq(gg.errors.length, 0);
  });

  test('Bardock: a saved look survives a reload; an invalid legacy look is migrated on load; the story still wears the prologue armor; Free Battle wears the choice', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['prologue_final_stand', 'saiyan_brothers', 'namek_vegeta']);
    ok(SL.Wardrobe.select('bardock', { outfit: 'bardock_super', armor: 'armor_bardock', scouter: 'scouter_blue', tail: 'tail_saiyan_free' }).ok);
    SL.Save.write();
    SL.Save.data = SL.Save.fresh();
    SL.Save.load();
    const kept = SL.Wardrobe.saved('bardock');
    eq([kept.outfit, kept.armor, kept.scouter, kept.tail].join(','), 'bardock_super,armor_bardock,scouter_blue,tail_saiyan_free', 'kept exactly');
    // an old save holding what the bug allowed to be written, plus junk
    SL.Save.data.wardrobe.selected.bardock = { outfit: 'bardock_damaged', armor: 'armor_bardock_movie', scouter: 'no_such_scouter', tail: 'tail_saiyan' };
    SL.Save.data.wardrobe.selected.nobody = { outfit: 'x' };
    SL.Save.write();
    SL.Save.data = SL.Save.fresh();
    SL.Save.load();
    const m = SL.Save.data.wardrobe.selected.bardock;
    eq(m.armor, 'armor_bardock', 'migrated to the armor the damaged look takes');
    eq(m.scouter, 'scouter_green', 'unknown scouter → the outfit\'s own');
    eq(SL.Save.data.wardrobe.selected.nobody, undefined, 'a look for no known character is dropped');
    eq(SL.Wardrobe.sanitize('bardock', m, { checkUnlock: true }).problems.length, 0, 'nothing invalid left in the save');
    // story canon wins
    const b = gg.mission('prologue_final_stand');
    gg.step(b, 2);
    const bd = fighter(b, 'bardock');
    eq(bd.wardrobe.outfit, 'bardock_classic', 'the prologue wears the classic armor');
    eq(bd.appearance.outfit.armor.padStyle, 'strap');
    ok(bd.appearance.face.scar !== false && bd.model.tailStyle === 'wrapped', 'scar, wrapped tail');
    b.dispose();
    // Free Battle wears the choice
    const fb = freeBattle(gg, 'bardock', 'goku');
    eq(fb.player.wardrobe.outfit, 'bardock_damaged');
    fb.dispose();
  });

  test('damage keeps the outfit family: Super Bardock battle-worn stays Super, classic stays classic; the prologue ending still breaks the classic armor', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['prologue_final_stand']);
    SL.Wardrobe.select('bardock', { outfit: 'bardock_super' });
    const b = freeBattle(gg, 'bardock', 'goku');
    const f = b.player, A = f.model.armorParts;
    const plateColor = A.plate.material.color.getHex();
    SL.Wardrobe.applyDamage(f, 1);
    ok(A.cracks.length > 0 && f.model._worn, 'worn: cracks and dirt');
    eq(A.plate.material.color.getHex(), plateColor, 'on the Super armor (its grey plate)');
    eq(f.appearance.outfit.pants, 0x2c469c, 'over the blue suit');
    SL.Wardrobe.applyDamage(f, 2);
    eq(A.pads.filter((p) => p.visible).length, 0, 'heavy: the flaps come off');
    ok(A.plate.visible, 'the plate stays: it is still his Super armor');
    b.dispose();
    // the story's own scripted break (prologue ending) works on the classic armor as before
    const m = gg.mission('prologue_final_stand');
    const bd = fighter(m, 'bardock');
    bd.model.damageArmor(4);
    ok(!bd.model.armorParts.plate.visible && bd.model.armorParts.pads.every((p) => !p.visible), 'level 4: plate and straps gone');
    m.dispose();
  });

  test('construction, not colour: Yardrat has its collar, vest and sash; the "59" jacket is an open layer over a shirt with the patch on the sleeve; Badman has a shirt collar; young outfits wait for a young body', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    clearAll(SL, ['android_warning', 'cell_games', 'android_trunks']);
    SL.Wardrobe.select('goku', { outfit: 'goku_yardrat' });
    let b = freeBattle(gg);
    let m = b.player.model;
    ok(m.collarParts && m.collarParts.length >= 5, 'the gathered collar');
    ok(m.armorParts && m.armorParts.plate.material.color.getHex() === 0x1d2a5e, 'a navy vest over the white shirt (built into the outfit, not the armor slot)');
    eq(b.player.wardrobe.armor, 'none', 'the armor slot itself is empty');
    eq(b.player.appearance.outfit.beltStyle, 'sash');
    eq(b.player.appearance.outfit.pants, 0xa81e2a, 'red trousers');
    b.dispose();
    SL.Wardrobe.select('goku', { outfit: 'goku_cell_casual' });
    b = freeBattle(gg);
    m = b.player.model;
    ok(m.jacket && m.jacket.length === 3, 'a jacket: chest shell, belly shell, collar');
    const shell = m.jacket[0].geometry.parameters;
    ok(shell.phiStart > 0.3 && shell.phiLength < Math.PI * 2 - 0.6, 'open at the front: the shirt shows between the halves');
    eq(m.chestMesh.material.color.getHex(), 0xf2f0ea, 'the white shirt under it');
    const patch = (m.emblems || []).find((e) => e.name === 'emblem:sleeve');
    ok(patch && patch.parent === m.joints.shoulderL && patch.material.userData.emblem === '59', 'the 59 patch on the left sleeve');
    b.dispose();
    SL.Wardrobe.select('vegeta', { outfit: 'vegeta_badman' });
    b = freeBattle(gg, 'vegeta', 'goku');
    ok(b.player.model.collarParts && b.player.model.collarParts.length === 3, 'a shirt collar: the band and two points');
    b.dispose();
    const r = SL.Wardrobe.select('goku', { outfit: 'goku_early' });
    ok(!r.ok, 'young Goku\'s clothes cannot go on the adult body');
    eq(SL.data.wardrobe.pieces.goku_early.body, 'young', 'they are marked for a young body');
    eq(gg.errors.length, 0);
  });
};
