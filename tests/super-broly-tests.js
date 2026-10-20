// MOVIE 2 · Dragon Ball Super: Broly — behaviour on the real engine, headless. The film is its own content (registry,
// save track, form chronology); Broly learns (the read, the swat, the stages, the copy) and his phase follows his
// form; the Wrathful transformation's cues take the player's real buttons and end on the same state skipped or not.
const H = require('./headless');

module.exports = function superBrolyTests({ test, eq, ok }) {
  console.log('\nMovie 2: Dragon Ball Super: Broly (headless)');

  // the buttons a human is holding, read by SL.Input (Battle.tick polls it every tick)
  const pressing = (SL, fn) => {
    SL.Input.held = (a) => !!fn(a);
    SL.Input.pressed = (a) => !!fn(a);
  };

  const FILM = ['bb_planet', 'bb_vampa', 'bb_clash', 'bb_wrath', 'bb_goku', 'bb_legend', 'bb_alliance', 'bb_fusion', 'bb_gogeta', 'bb_epilogue'];

  test('the film is its own content: registered as Movie 2, never in the canon order, every part built, in the film\'s order, each opening after the one before', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const mv = SL.data.story.movies.find((x) => x.id === 'super_broly');
    ok(mv && /Broly/.test(mv.title), 'listed under Movies');
    eq(mv.placedAfter, 'bog_sphere', 'its world is after the Battle of Gods');
    const order = SL.data.storyOrder();
    ok(!order.some((id) => /^bb_/.test(id)), 'no film mission in the canon order');
    eq(mv.missions.map((e) => e.id).join(','), FILM.join(','), 'the nine parts in order (part 3 in two missions)');
    ok(mv.missions.every((e) => SL.data.missions[e.id] && !e.title), 'every part is built (no in-development card left)');
    ok(FILM.every((id) => SL.data.missions[id].movie === 'super_broly'), 'every mission is on the film\'s own track');
    ok(FILM.every((id, i) => /^Part \d/.test(SL.data.missions[id].subtitle)), 'each card says which part of the film it is');
    const none = () => null;
    ok(SL.data.movieLocked('bb_planet', none, false), 'closed until the film opens');
    ok(!SL.data.movieLocked('bb_planet', none, true), 'the prologue opens with the film');
    for (let i = 1; i < FILM.length; i++) {
      ok(SL.data.movieLocked(FILM[i], none, true), FILM[i] + ' waits for ' + FILM[i - 1]);
      ok(!SL.data.movieLocked(FILM[i], (id) => (id === FILM[i - 1] ? { completed: true } : null), true), FILM[i] + ' opens after ' + FILM[i - 1]);
    }
    ok(!SL.data.movieLocked('bb_wrath', (id) => (id === 'bb_wrath' ? { completed: true } : null), true), 'a cleared part never locks again (replay)');
  });

  test('save isolation: clearing a film mission writes the movies track, never the canon story; the clear unlocks the glacier and (after Wrath) Broly', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const storyBefore = JSON.stringify(SL.Save.data.story.missions);
    SL.Save.completeMission('bb_clash', { score: 5000, rank: 'B' });
    ok(SL.Save.data.movies.missions.bb_clash && SL.Save.data.movies.missions.bb_clash.completed, 'recorded in the movies track');
    eq(JSON.stringify(SL.Save.data.story.missions), storyBefore, 'the canon story records are untouched');
    ok(SL.Save.isUnlocked('stages', 'broly_glacier'), 'the glacier opens for Free Battle');
    ok(!SL.Save.isUnlocked('characters', 'broly'), 'Broly is not playable yet');
    SL.Save.completeMission('bb_wrath', { score: 5000, rank: 'B' });
    ok(SL.Save.isUnlocked('characters', 'broly'), 'Broly after "Wrath"');
  });

  test('form chronology: the film\'s forms are locked in the canon story, in What-Ifs and in Fusion Reborn; inside the film they arrive where it gives them', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const locks = (id) => {
      const b = gg.mission(id, {});
      gg.step(b, 3);
      const out = {};
      for (const f of b.fighters) out[f.def.id] = Object.assign({}, out[f.def.id] || {}, f.lockedForms || {});
      b.dispose();
      return out;
    };
    const canon = locks('buu_majin');
    ok(canon.vegeta && canon.vegeta.god && canon.vegeta.blue, 'canon "The Mark": no God, no Blue for Vegeta');
    const wi = locks('whatif_vegeta');
    ok(wi.vegeta && wi.vegeta.god && wi.vegeta.blue, 'a What-If: none either');
    const fr = locks('fr_vegeta');
    ok(fr.vegeta && fr.vegeta.god && fr.vegeta.blue, 'Fusion Reborn (another film): none either');
    const clash = locks('bb_clash');
    ok(clash.vegeta.blue, 'in "The First Clash" Blue is still ahead');
    ok(clash.broly && clash.broly.wrath && clash.broly.ssj && clash.broly.full, 'and Broly has none of his later states');
    const wrath = locks('bb_wrath');
    ok(!wrath.vegeta.god, 'in "Wrath" the God form is his (handed over by the first clash)');
    ok(wrath.broly && wrath.broly.ssj && wrath.broly.full, 'Broly\'s Super Saiyan and Full Power stay ahead');
    ok(!SL.formFreeUnlocked(SL.data.characters.vegeta.forms.find((x) => x.id === 'god')), 'Free Battle: no God Vegeta before the film gives it');
    // the rest of the film's forms
    ok(canon.goku && canon.goku.blue, 'canon: no Blue for Goku');
    ok(fr.gogeta === undefined || fr.gogeta.blue, 'Fusion Reborn: no Blue Gogeta');
    const goku = locks('bb_goku');
    ok(goku.goku.blue && !goku.goku.god, 'in "The Legendary Super Saiyan" Goku has God (Battle of Gods) but not yet Blue');
    const alliance = locks('bb_alliance');
    ok(!alliance.goku.blue && !alliance.vegeta.blue, 'in "Desperate Alliance" both have Blue');
    ok(!alliance.broly.ssj && alliance.broly.full, 'Broly is a Super Saiyan by then, Full Power still ahead');
    const gogeta = locks('bb_gogeta');
    ok(!gogeta.frieza || !gogeta.frieza.golden, 'Golden Frieza after "The Birth of Gogeta"');
    eq(SL.data.formGivenBy['gogeta:blue'], 'bb_gogeta', 'Blue Gogeta is handed over in the finale');
    ok(SL.data.characters.frieza.forms.find((x) => x.id === 'golden').storyLocked, 'Golden Frieza is story-only');
    ok(!SL.formFreeUnlocked(SL.data.characters.goku.forms.find((x) => x.id === 'blue')), 'Free Battle: no Blue Goku before the film gives it');
    ok(!SL.data.characters.veku_thin.playable && !SL.data.characters.veku.playable, 'both failed fusions are story-only');
  });

  test('GOD BIND holds one enemy in a crimson ring (no mashing out), only in the god forms; something stronger breaks it like glass', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'broly', dummy: 'idle', distance: 6 });
    const g = b.player, br = b.fighters[1];
    const spec = g.def.extras.find((x) => x.id === 'godBind');
    ok(spec && spec.type === 'godBind', 'Goku has God Bind on the wheel');
    ok(SL.Techniques.godBind.lockedReason(g, spec), 'not in base form');
    eq(SL.Techniques.godBind.start(g, spec, 'x:godBind', 0), false, 'and it will not start there');
    g.applyForm(g.def.forms.findIndex((x) => x.id === 'god'));
    g.target = br;
    g.ki = g.kiMax;
    const events = [];
    for (const ev of ['godBind', 'godBindBroken', 'godBindEnd']) b.on(ev, () => events.push(ev));
    ok(SL.Techniques.godBind.start(g, spec, 'x:godBind', spec.kiCost), 'God Goku binds him');
    gg.step(b, spec.startup + 5);
    eq(br.state, 'held', 'he is held');
    gg.step(b, 30);
    eq(br.state, 'held', 'still held');
    ok(SL.Techniques.godBind.shatter(g), 'the ring breaks');
    gg.step(b, 2);
    ok(br.state !== 'held', 'and he is free: ' + br.state);
    eq(events.join(','), 'godBind,godBindBroken', 'announced: ' + events.join(','));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('THE MELT: the glacier goes to the lava wasteland (black rock, glowing rivers, a sea of lava, a red sky); the lava stage starts melted and opens after "Beyond the Limits"', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'broly', dummy: 'idle', distance: 6, stage: 'broly_glacier' });
    const st = b.stage;
    const col = st.terrainGeo.attributes.color.array;
    const avg = () => {
      let r = 0, g2 = 0;
      for (let i = 0; i < col.length; i += 3) (r += col[i]), (g2 += col[i + 1]);
      return { r: r / (col.length / 3), g: g2 / (col.length / 3) };
    };
    const before = avg(), sky0 = st.sky.material.uniforms.top.value.clone();
    st.setMelt(1);
    const after = avg();
    ok(after.g < before.g * 0.6, 'the white is gone from the ground: ' + before.g.toFixed(2) + ' → ' + after.g.toFixed(2));
    ok(st.water.material.color.r > 0.8 && st.water.material.color.b < 0.3, 'the sea is lava');
    ok(st.sky.material.uniforms.top.value.b < sky0.b, 'the sky has gone dark red');
    eq(st._melt, 1, 'fully melted');
    st.setMelt(0);
    ok(Math.abs(avg().g - before.g) < 0.01, 'and it is a blend: back to the snow at 0');
    b.dispose();
    const b2 = gg.battle({ p1: 'goku', p2: 'broly', dummy: 'idle', distance: 6, stage: 'broly_lava' });
    eq(b2.stage._melt, 1, 'the lava stage is the glacier melted');
    b2.dispose();
    ok(!SL.Save.isUnlocked('stages', 'broly_lava'), 'not open in Free Battle yet');
    SL.Save.completeMission('bb_legend', { score: 5000, rank: 'B' });
    ok(SL.Save.isUnlocked('stages', 'broly_lava'), 'open after "Beyond the Limits"');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('THE DIMENSION BREAK: the world hidden behind a kaleidoscope with depth (crystals and beams inside it), the glass breaking, and the world back afterwards', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'gogeta', p2: 'broly', dummy: 'idle', distance: 6, stage: 'broly_lava' });
    const st = b.stage;
    const visible = () => st.root.children.filter((o) => !o.isLight && o.visible).length;
    const v0 = visible();
    const glass = SL.Dimension.glassBreak(b, new V3(0, 10, 0), { radius: 10 });
    gg.step(b, 10);
    glass.burst();
    SL.Dimension.hideWorld(b);
    const k = SL.Dimension.kaleido(b, new V3(0, 10, 0), { radius: 60 });
    gg.step(b, 40);
    eq(visible(), 0, 'the world is out of sight');
    ok(st.root.children.some((o) => o.isLight), 'its lights still light the fighters');
    ok(k.group.children.length > 20, 'crystals and beams at many depths: ' + k.group.children.length);
    k.close(10);
    SL.Dimension.showWorld(b);
    gg.step(b, 30);
    eq(visible(), v0, 'the world is back');
    ok(!k.alive, 'the kaleidoscope closed');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('THE READ: a strike he has seen three times is caught (a Perfect Guard and his answer); varied strikes are not; blasts he knows are swatted aside', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'vegeta', p2: 'broly', dummy: 'idle', distance: 2.2 });
    const v = b.player, br = b.fighters[1];
    const reads = [];
    b.on('brolyRead', (e) => reads.push(e.id));
    const jab = v.def.moves.light[0], hook = v.def.moves.light[1];
    const swing = (mv) => {
      br.setState('free');
      v.setState('attack', { move: mv, kind: 'light', hit: false, hitSet: new Set(), startup: 1, bonus: 1, whiffPenalty: 0, window: -1, victim: br });
      const r = br.takeHit(v, { type: 'melee', damage: mv.damage, knock: 'flinch', hitstun: 18, impact: 1, dir: v.dirTo(br), point: br.chest() });
      gg.step(b, 40);
      return r;
    };
    const first = [swing(jab), swing(jab), swing(jab)];
    ok(first.every((r) => r === 'hit'), 'the first three land: ' + first.join(','));
    eq(swing(jab), 'perfect', 'the fourth is caught');
    eq(reads.join(','), jab.id, 'and announced as a read of that strike');
    eq(swing(hook), 'hit', 'a strike he has not learned still lands');
    ok(br.mech.stage >= 0 && br.mech.xp > 0, 'he gains from what he sees');
    // ki blasts: four land, then he bats them away
    br.mech.blasts = 4;
    br.setState('free');
    const p = b.projectiles.spawnBlast(v, br.chest().add(new V3(0, 0, -3)), new V3(0, 0, 1), { kind: 'blast', speed: 30, radius: 0.3, damage: 300, color: 0xffffff, core: 0xffffff, homing: 0, knock: 'flinch', impact: 1, hitstun: 12, explode: 0.9, life: 2 });
    let swats = 0;
    b.on('brolySwat', () => swats++);
    gg.step(b, 20);
    ok(swats >= 1, 'a known blast is swatted aside');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('ADAPTATION: his stage climbs with what he sees; at MATCHING he throws your most-used strike back (your poses on his rig); a new form drops it; his phase follows his form, never his health', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'vegeta', p2: 'broly', dummy: 'idle', distance: 2.2 });
    const v = b.player, br = b.fighters[1];
    const stages = [];
    let copied = null;
    b.on('brolyStage', (e) => stages.push(e.label));
    b.on('brolyCopy', (e) => (copied = e.move));
    br.target = v;
    const jab = v.def.moves.light[0];
    for (let i = 0; i < 24; i++) {
      br.setState('hitstun', { frames: 30 });
      v.setState('attack', { move: jab, kind: 'light', hit: false, hitSet: new Set(), startup: 1, bonus: 1, whiffPenalty: 0, window: -1, victim: br });
      br.takeHit(v, { type: 'melee', damage: 100, knock: 'flinch', hitstun: 18, impact: 1, dir: v.dirTo(br), point: br.chest() });
      gg.step(b, 2);
    }
    ok(stages.includes('LEARNING') && stages.includes('MATCHING'), 'climbed: ' + stages.join(' → '));
    ok(copied && copied.id === 'copied_' + jab.id, 'he copied the strike he saw most');
    eq(br.moveSet.light[0].id, copied.id, 'and opens his strings with it');
    ok(br.poses[jab.pose.strike] || br.anim.poses[jab.pose.strike], 'with Vegeta\'s own pose driving his body');
    eq(br.mech.phase, 0, 'still CONTROLLED in base form whatever his health');
    br.hp = br.hpMax * 0.1;
    gg.step(b, 3);
    eq(br.mech.phase, 0, '...even at 10 %');
    const wi = br.def.forms.findIndex((x) => x.id === 'wrath');
    br.applyForm(wi);
    gg.step(b, 30);
    eq(SL.Mechanics.legendary.phaseOf(br).id, 'wrath', 'the Wrathful form is the WRATHFUL phase');
    ok(!br.movesOverride, 'the copied string belongs to the old form');
    eq(br.moveSet.light[0].id, 'brwClaw', 'the Wrathful moveset (reach, clawing swipes)');
    ok((br.model.veinDecals || []).every((m) => m.visible), 'the veins come up with the form');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('THE WRATHFUL TRANSFORMATION is played: Fire, Brace and Dodge are taken by the real buttons; it ends with Broly Wrathful and the fight in the player\'s hands', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('bb_wrath', { startPhase: 0 });
    const cues = [], done = new Set();
    b.on('cueDone', (r) => cues.push(r));
    b.on('objectives', (e) => e.completed && done.add(e.changed.id));
    let cueAt = 0;
    b.on('cue', () => (cueAt = b.frame));
    pressing(SL, (a) => b.cue && (a === b.cue.action || a === b.cue.key) && b.frame - cueAt > 12);
    const S = b.story;
    ok(gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id !== 'wake', 60 * 60) >= 0, 'the transformation plays through');
    eq(cues.map((c) => c.key).join(','), 'blast,guard,dodge', 'three beats the player answers: fire, brace, dodge');
    ok(cues.every((c) => c.pressed && c.seconds < 1.5), 'every one taken by the button: ' + JSON.stringify(cues.map((c) => [c.key, +c.seconds.toFixed(2)])));
    eq(S.broly.form.id, 'wrath', 'Broly is Wrathful');
    ok(done.has('fire') && done.has('brace') && done.has('dodge'), 'fired, braced and dodged: ' + [...done].join(','));
    ok(b.player === S.vegeta && b.player.controller instanceof SL.PlayerController, 'Vegeta is the player\'s again');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('skipped, the transformation lands on the same state: Wrathful, standing, facing Vegeta, nobody stuck in a scripted pose', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('bb_wrath', { startPhase: 0 });
    pressing(SL, () => false);
    ok(gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id !== 'wake', 60 * 30, () => {
      if (b.inputLocked) b.skipRequested = true;
    }) >= 0, 'skips through');
    const S = b.story;
    eq(S.broly.form.id, 'wrath', 'Wrathful');
    ok(S.broly.forward.dot(S.vegeta.pos.clone().sub(S.broly.pos).setY(0).normalize()) > 0.9, 'facing Vegeta');
    gg.step(b, 30);
    ok(!['scripted'].includes(S.vegeta.state), 'Vegeta is free to fight: ' + S.vegeta.state);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the first clash ends on RAGE: God Vegeta\'s blows fill Broly\'s rage meter, and a full meter ends the phase (a story event, not a health bar)', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const at = SL.data.missions.bb_clash.phases.findIndex((p) => p.id === 'overwhelm');
    const b = gg.mission('bb_clash', { startPhase: at });
    gg.step(b, 10);
    const br = b.story.broly, v = b.story.vegeta;
    eq(SL.mech(br, 'hud').label, 'RAGE', 'his meter is RAGE in this stretch');
    let raged = 0;
    b.on('brolyRage', () => raged++);
    for (let i = 0; i < 60 && b.mission.def.phases[b.mission.phaseIndex].id === 'overwhelm'; i++) {
      br.takeHit(v, { type: 'melee', damage: 50, knock: 'flinch', hitstun: 10, impact: 3, dir: v.dirTo(br), point: br.chest() });
      gg.step(b, 8);
    }
    ok(raged >= 1, 'the meter filled');
    ok(b.mission.def.phases[b.mission.phaseIndex].id !== 'overwhelm', 'and the story took over: ' + b.mission.def.phases[b.mission.phaseIndex].id);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('every part of the film plays to the end with the bot brains, every scene watched in full, without engine errors or missing poses', () => {
    for (const id of FILM) {
      const gg = H.create({ quiet: true, seed: 11 });
      const r = gg.playMission(id, { watch: true, maxSeconds: 900 });
      eq(r.state, 'success', id + ' completes');
      eq(gg.errors.length, 0, id + ' engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      eq((gg.warnings || []).length, 0, id + ' warnings: ' + (gg.warnings || []).slice(0, 3).join(' | '));
      ok(r.record && r.record.completed && gg.SL.Save.isMovie(id), id + ' recorded on the film track');
    }
  });
};
