// The Buu saga, Chapter 10 "Majin" (2026-09-24): clothing damage as states, Super Saiyan 2 for
// Goku and Vegeta, Majin Vegeta as a distinct state, Majin Buu's body, stage swaps and
// devastation, and the four missions — The Mark (rebuilt), Prince of Saiyans, Majin Buu and The
// Prince's Pride. Runs the real engine headless (tests/headless.js); each test reads what the
// engine actually did (models, states, events), not just data.
const H = require('./headless');

module.exports = function buuCTests({ test, eq, ok }) {
  console.log('\nThe Buu saga, Chapter 10: Majin (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
  const CH10 = ['buu_majin', 'buu_pride', 'buu_awakening', 'buu_sacrifice'];
  const CH11 = ['buu_ssj3', 'buu_fusion', 'buu_split', 'buu_timechamber'];
  const visibleRips = (f) => (f.model._rips || []).filter((r) => r.mesh.visible).length;
  const hex = (c) => c.toString(16).padStart(6, '0');

  /** Start a mission at a phase and run until the player has control. */
  function at(gg, id, phase, who) {
    const b = gg.mission(id, { startPhase: phaseAt(gg.SL, id, phase) });
    gg.until(b, () => phaseId(b) === phase && !b.inputLocked && (!who || b.player === b.story[who]), 60 * 90, skipAll(b));
    gg.step(b, 10);
    return b;
  }
  function clear(SL, ids) {
    for (const id of ids) SL.Save.completeMission(id, { score: 5000, rank: 'A' });
  }

  /* ------------------------------------------------------------ clothing damage */

  test('clothing damage is a state with four levels, and every outfit tears its own way (no shared damage texture)', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('buu_sacrifice');
    gg.step(b, 2);
    const S = b.story, g = S.goku, v = S.vegeta;
    for (const f of [g, v]) f.setDamage(0);
    eq(visibleRips(g) + visibleRips(v), 0, 'intact: nothing torn');
    const counts = { goku: [], vegeta: [] };
    for (const L of [1, 2, 3]) {
      g.setDamage(L);
      v.setDamage(L);
      counts.goku.push(visibleRips(g));
      counts.vegeta.push(visibleRips(v));
    }
    ok(counts.goku[0] > 0 && counts.goku[1] > counts.goku[0], 'Goku: damaged, then more: ' + counts.goku.join('/'));
    ok(counts.vegeta[0] > 0 && counts.vegeta[2] > counts.vegeta[1], 'Vegeta: his suit keeps splitting: ' + counts.vegeta.join('/'));
    // the gi itself comes off only at TORN — and what is left is the navy undershirt
    g.setDamage(2);
    ok(!g.model._torn, 'heavily damaged: the Buu-era gi is still on');
    eq(hex(g.model.chestMesh.material.color.getHex()), 'f2741c', 'orange over the chest');
    g.setDamage(3);
    ok(g.model._torn, 'torn: the gi top is gone');
    eq(hex(g.model.chestMesh.material.color.getHex()), '16225a', 'and the dark navy undershirt is what is left');
    ok(g.model.gi.sleeves.every((sl) => sl.visible), 'the undershirt keeps its sleeves');
    // the rips are the outfit's own: fills and places differ between Goku, Vegeta and Gohan
    const specOf = (f) => JSON.stringify(f.appearance.outfit.damage.rips.map((r) => [r.at, r.y || r.t, r.ang]));
    ok(specOf(g) !== specOf(v), "Goku's rips are not Vegeta's");
    const gohan = gg.battle({ p1: 'adult_gohan', p2: 'goku' });
    ok(gohan.player.appearance.outfit.damage && specOf(gohan.player) !== specOf(g), "and Gohan's are his own");
    gohan.dispose();
    // a rip in the gi shows the undershirt; the same place after the tear shows skin
    const chestRip = g.model._rips.find((r) => r.spec.at === 'chest' && r.spec.fill === 'under');
    ok(chestRip && !chestRip.mesh.visible, 'a gi rip goes with the gi');
    // it survives a transformation and a power-down
    v.applyForm(v.def.forms.findIndex((x) => x.id === 'ssj'));
    v.applyForm(v.def.forms.findIndex((x) => x.id === 'majin'));
    eq(visibleRips(v), counts.vegeta[2], 'the damage survives the forms');
    // stone never turns a rip into a square of rock: they hide while stone, and come back
    v.model.setStone(true);
    eq(visibleRips(v), 0, 'stone: the rips are hidden');
    v.model.setStone(false);
    eq(visibleRips(v), counts.vegeta[2], 'and back');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('damage is driven by the story and by heavy blows past a threshold — never by a health percentage alone', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'vegeta', p2: 'goku', distance: 2 });
    const p = b.player, e = b.fighters[1];
    const seen = [];
    b.on('damageState', (ev) => seen.push(ev.level));
    p.damagePlan = [{ level: 1, below: 0.9 }, { level: 2, below: 0.6 }];
    p.hp = p.hpMax * 0.5;
    p.takeHit(e, { type: 'melee', damage: 50, knock: 'flinch', impact: 1, hitstun: 10, dir: new V3(1, 0, 0) });
    eq(p.damageLevel || 0, 0, 'a light hit at half health tears nothing');
    p.setState('free');
    p.takeHit(e, { type: 'melee', damage: 50, knock: 'heavy', knockSpeed: 10, impact: 3, hitstun: 20, dir: new V3(1, 0, 0) });
    eq(p.damageLevel, 1, 'a heavy blow past the first line tears one level');
    p.setState('free');
    p.takeHit(e, { type: 'beam', damage: 50, knock: 'heavy', knockSpeed: 10, impact: 3, hitstun: 20, dir: new V3(1, 0, 0) });
    eq(p.damageLevel, 2, 'the next heavy blow, the next level');
    eq(seen.join(','), '1,2', 'each change is an event (the HUD and missions can follow it)');
    // without a plan, the same blows change nothing
    e.hp = e.hpMax * 0.3;
    e.takeHit(p, { type: 'beam', damage: 50, knock: 'heavy', knockSpeed: 10, impact: 4, hitstun: 20, dir: new V3(-1, 0, 0) });
    eq(e.damageLevel || 0, 0, 'no plan, no tearing: only a story says so');
    // a scene says so
    SL.Cinema.event({ m: { flags: {}, tickHooks: [], cine: function* () {}, battle: b }, b, cast: { e }, flags: {} }, { damage: { who: 'e', level: 3 } }).next();
    eq(e.damageLevel, 3, 'Cinema "damage" events set it');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ forms */

  test('Super Saiyan 2 is its own state (hair, lightning, stance, strikes, CPU) for Goku and Vegeta, and Majin Vegeta is not SSJ2 with a mark on it', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const G = SL.data.characters.goku, V = SL.data.characters.vegeta;
    eq(G.forms.map((f) => f.id).slice(0, 4).join(','), 'base,kaioken,ssj,ssj2', 'Goku: base, Kaioken, SSJ, then SSJ2');
    const g2 = G.forms.find((f) => f.id === 'ssj2'), g1 = G.forms.find((f) => f.id === 'ssj');
    eq(g2.look.hair.style, 'goku_ssj2', 'its own hair');
    ok(SL.data.hair.goku_ssj2.spikes.some((s) => s.d[1] < -0.8 && s.a[2] > 0.5), 'with the single loose bang over the forehead');
    ok(g2.aura.lightning && !g1.aura.lightning, 'lightning that SSJ1 does not have');
    ok(g2.poses && g2.poses.idle && g2.poses.idle !== G.poses.idle, 'a different stance');
    ok(g2.moves && g2.moves.dash && g2.moves.dash.teleport, 'a knee that arrives from behind');
    ok(g2.sequence && g2.sequence.steps.some((s) => s.burst) && g2.sequence.length > g1.sequence.length, 'a longer staged transformation');
    ok(g2.mult.damage > g1.mult.damage * 1.2, 'and a real jump in power');
    const m = V.forms.find((f) => f.id === 'majin'), v2 = V.forms.find((f) => f.id === 'ssj2');
    ok(m.look.headExtras && m.look.headExtras.length, 'Majin: the M');
    ok(m.poses && m.poses.idle, 'a stance of his own');
    ok(Object.values(m.moves.heavy).some((mv) => mv.armor), 'heavies that take your blow to land theirs');
    ok(m.ai.aggression >= 1 && m.ai.defense < 0.3, 'a CPU that barely defends');
    ok(m.barks && m.barks.taunt && m.barks.taunt !== V.barks.taunt, 'and he does not talk like the prince');
    ok(m.aura.sparks !== v2.aura.sparks, 'his aura is not Super Saiyan 2\'s');
    // the battle reads them: a Majin Vegeta CPU fights with the Majin profile, and barks its lines
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const vf = b.fighters[1];
    vf.lockedForms = {};
    vf.applyForm(V.forms.indexOf(m));
    const ai = new SL.AIController(b, { difficulty: 'hard' });
    ai._init(vf);
    eq(ai.p.aggression, 1, 'the AI reads the form');
    eq(vf.anim.poses.idle, m.poses.idle, 'the stance is on');
    vf.applyForm(0);
    eq((vf.model._headExtras || []).filter((x) => x.shape === 'bar').length, 0, 'the M goes with the state');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('form progression: the story hands Super Saiyan 2 over, Free Battle has it only once it is cleared, and a What-If never inherits it', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    eq(SL.data.formGivenBy['goku:ssj2'], 'buu_pride', 'Goku: given by Prince of Saiyans');
    eq(SL.data.formGivenBy['vegeta:ssj2'], 'buu_majin', 'Vegeta: given by The Mark');
    // before: the story locks it (The Mark comes before Prince of Saiyans)
    const mk = gg.mission('buu_majin');
    gg.step(mk, 2);
    ok(mk.story.goku.lockedForms.ssj2, 'in The Mark, Goku cannot reach it yet');
    mk.dispose();
    // Free Battle: locked, then earned
    let fb = gg.battle({ p1: 'goku', p2: 'vegeta' });
    ok(fb.player.lockedForms && fb.player.lockedForms.ssj2, 'Free Battle before the story shows it: locked');
    ok(fb.fighters[1].lockedForms.ssj2, 'Vegeta too');
    fb.player.applyForm(fb.player.def.forms.findIndex((f) => f.id === 'ssj'));
    fb.player.ki = fb.player.kiMax;
    fb.player.setState('free');
    eq(fb.player._tryTransform(), false, 'from Super Saiyan the button goes nowhere');
    fb.dispose();
    clear(SL, ['buu_majin', 'buu_pride']);
    fb = gg.battle({ p1: 'goku', p2: 'vegeta' });
    ok(!(fb.player.lockedForms && fb.player.lockedForms.ssj2), 'after the clear, Goku has it');
    ok(!fb.fighters[1].lockedForms.ssj2, 'and Vegeta');
    ok(fb.fighters[1].lockedForms.majin, 'the Majin state never becomes a Free Battle form');
    fb.player.applyForm(fb.player.def.forms.findIndex((f) => f.id === 'ssj'));
    fb.player.ki = fb.player.kiMax;
    fb.player.setState('free');
    ok(fb.player._tryTransform(), 'and the button reaches it');
    fb.dispose();
    // What-If: the branch point decides, whatever the canon save has reached
    const wi = gg.mission('whatif_twenty');
    gg.step(wi, 2);
    const wg = wi.fighters.find((f) => f.def.id === 'goku');
    ok(wg && wg.lockedForms && wg.lockedForms.ssj && wg.lockedForms.ssj2, 'a Namek What-If: neither Super Saiyan level, even with Chapter 10 cleared');
    wi.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('a form can burn ki instead of health (the Super Saiyan 3 pattern): it drains while held and an empty tank ends it', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 10 });
    const p = b.player;
    p.applyForm(p.def.forms.findIndex((f) => f.id === 'ssj'));
    p.form = Object.assign({}, p.form, { drain: { kiPerSec: 60 } });
    p.ki = 50;
    let ex = 0;
    b.on('formExhausted', () => ex++);
    gg.step(b, 30);
    ok(p.ki < 30, 'the ki goes: ' + p.ki.toFixed(1));
    gg.step(b, 60);
    eq(p.formIndex, 0, 'empty: back to base');
    eq(ex, 1, 'announced once');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ stages */

  test('a mission can swap the whole world (Babidi\'s teleports), tear up the stands, and leave a field devastated — deterministically', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', stage: 'babidi_crater' });
    const oldRoot = b.stage.root;
    let changed = 0;
    b.on('stageChanged', () => changed++);
    b.changeStage('tournament');
    ok(!oldRoot.parent, 'the old world is gone from the scene');
    eq(b.stage.def.id, 'tournament', 'the new one is there');
    eq(b.scene.children.filter((c) => c.name && c.name.indexOf('stage:') === 0).length, 1, 'exactly one world at a time');
    eq(changed, 1, 'an event');
    ok(b.fighters.every((f) => f.pos.length() <= b.stage.arenaRadius + 1), 'the fighters are inside the new play area');
    const people = b.stage.crowd.people.length;
    let hit = null;
    b.on('standsHit', (e) => (hit = e));
    const lost = b.stage.blastStands(new V3(0, 4.2, 36.5), 8);
    ok(lost > 10 && hit && hit.lost === lost, 'a section of the stands is gone: ' + lost + ' of ' + people);
    eq(b.stage.crowd.people.filter((p) => p.gone).length, lost, 'and stays gone');
    gg.step(b, 30);
    b.changeStage('majin_wastes');
    const spiresBefore = b.stage.obstacles.filter((o) => o.alive && o.segs).length;
    const h0 = b.stage.heightAt(10, 10);
    b.stage.devastate(new V3(0, 0, 0), { radius: 70 });
    const spiresAfter = b.stage.obstacles.filter((o) => o.alive && o.segs).length;
    ok(spiresAfter < spiresBefore, 'towers inside the ruin come down: ' + spiresBefore + ' → ' + spiresAfter);
    ok(b.stage.devastated && b.stage.devastated.group.children.length >= 10, 'broken slabs lie where they stood');
    ok(b.stage.ambient.length > 0, 'and the vents keep smoking');
    const sig = () => b.stage.devastated.group.children.map((c) => c.position.x.toFixed(2)).join(',');
    const first = sig();
    b.changeStage('tournament');
    b.changeStage('majin_wastes');
    b.stage.devastate(new V3(0, 0, 0), { radius: 70 });
    eq(sig(), first, 'the same ruin every time (seeded, off the gameplay stream)');
    ok(Number.isFinite(h0), 'terrain intact before');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ Majin Buu */

  test('Majin Buu: punches sink into his belly, wounds close while you watch, and when he comes apart he puts himself back together', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL, V3 } = gg;
    eq(JSON.stringify(SL.Schema.validateCharacter(SL.data.characters.majin_buu)), '[]', 'he validates');
    const b = gg.battle({ p1: 'goku', p2: 'majin_buu', distance: 2, dummy: 'idle', p2InfiniteHp: false });
    const p = b.player, buu = b.fighters[1];
    buu.mech.maxReforms = 2;
    const ev = { gut: 0, wound: 0, apart: 0, reformed: 0 };
    b.on('buuGut', () => ev.gut++);
    b.on('buuWound', () => ev.wound++);
    b.on('buuApart', () => ev.apart++);
    b.on('buuReformed', () => ev.reformed++);
    // the gut: the same light strike, from the front and from behind
    const strike = (from) => {
      buu.setState('free');
      buu.invuln = 0;
      buu.yaw = 0;
      p.setPosition(buu.pos.clone().add(from));
      const before = buu.hp;
      buu.takeHit(p, { type: 'melee', damage: 600, knock: 'flinch', impact: 1, hitstun: 10, dir: buu.pos.clone().sub(p.pos).normalize() });
      return before - buu.hp;
    };
    const front = strike(new V3(0, 0, 1.5));
    const back = strike(new V3(0, 0, -1.5));
    ok(ev.gut >= 1 && front < back * 0.6, 'a punch into his front sinks in (' + Math.round(front) + ' vs ' + Math.round(back) + ' from behind)');
    // a wound, and it closes with the health coming back
    buu.hp = buu.hpMax * 0.9;
    buu.mech.lastHp = buu.hp;
    buu.takeHit(p, { type: 'beam', damage: 4000, knock: 'heavy', knockSpeed: 5, impact: 3, hitstun: 20, dir: new V3(0, 0, 1) });
    gg.step(b, 12); // past the hitstop
    const low = buu.hp;
    ok(ev.wound >= 1 && buu.model.openWounds >= 1, 'a hole opens where it landed');
    gg.step(b, 150);
    ok(buu.hp > low + buu.hpMax * 0.02 && buu.model.openWounds === 0, 'and pulls shut, giving back health: ' + (low / buu.hpMax).toFixed(2) + ' → ' + buu.hpFrac.toFixed(2));
    // coming apart at half
    buu.hp = buu.hpMax * 0.52;
    buu.mech.lastHp = buu.hp;
    buu.takeHit(p, { type: 'beam', damage: 3000, knock: 'heavy', knockSpeed: 5, impact: 3, hitstun: 20, dir: new V3(0, 0, 1) });
    gg.step(b, 12);
    ok(ev.apart === 1 && buu.hidden && buu.intangible, 'he comes apart: the body is gone and nothing can hit it');
    eq(buu.takeHit(p, { type: 'melee', damage: 999, impact: 1 }), 'miss', 'hitting the air where he was does nothing');
    const pieces = buu.mech.apart.pieces;
    ok(pieces.length >= 8, 'pieces on the ground: ' + pieces.length);
    gg.until(b, () => !buu.mech.apart, 60 * 8);
    ok(ev.reformed === 1 && !buu.hidden && buu.hpFrac >= 0.8, 'and they crawl back: he is whole again at ' + buu.hpFrac.toFixed(2));
    ok(pieces.every((pc) => !pc.m.parent), 'the pieces are cleaned up');
    // spent reforms: the third time he stays down (outside a story that says otherwise)
    buu.mech.reforms = 2;
    buu.mech.breakIdx = 1;
    buu.hp = 5;
    buu.mech.lastHp = 5;
    buu.takeHit(p, { type: 'beam', damage: 3000, knock: 'heavy', knockSpeed: 5, impact: 3, hitstun: 20, dir: new V3(0, 0, 1) });
    gg.step(b, 5);
    eq(buu.alive, false, 'with no reforms left, he stays down');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Majin Buu: the antenna turns you into candy, and he comes to eat it — struggling out first is the counter', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'majin_buu', distance: 10, dummy: null });
    const p = b.player, buu = b.fighters[1];
    buu.controller = new SL.AIController(b, { difficulty: 'normal' });
    b.aiLocked = false;
    b.inputLocked = false;
    let kind = null, ate = 0;
    b.on('petrified', (e) => (kind = e.kind));
    b.on('buuAte', () => ate++);
    // a direct candy hit (the projectile carries it)
    p.takeHit(buu, { type: 'ki', damage: 100, knock: 'flinch', impact: 1, stone: { frames: 200, mash: 9, kind: 'candy' }, dir: new V3(1, 0, 0) });
    eq(p.state, 'held', 'he is stuck');
    eq(kind, 'candy', 'as candy, not stone');
    const hp0 = p.hp;
    gg.until(b, () => ate > 0 || p.state !== 'held', 60 * 6);
    eq(ate, 1, 'standing still, Buu reaches him and eats');
    ok(p.hp < hp0 - p.hpMax * 0.1, 'and it costs a lot');
    // this time the player struggles
    gg.step(b, 120);
    p.setState('free');
    p.setPosition(buu.pos.clone().add(new V3(12, 0, 0)));
    p.takeHit(buu, { type: 'ki', damage: 100, knock: 'flinch', impact: 1, stone: { frames: 200, mash: 9, kind: 'candy' }, dir: new V3(1, 0, 0) });
    p.controller = gg.script(b, (n) => ({ light: n % 2 === 0 }));
    gg.until(b, () => p.state !== 'held' || ate > 1, 60 * 6);
    eq(ate, 1, 'mashing breaks it before he gets there');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Majin Buu plays — dances, laughs, pats his belly wide open — and then he is suddenly behind you', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'majin_buu', distance: 8, dummy: null });
    const p = b.player, buu = b.fighters[1];
    p.cannotDie = true;
    p.controller = new SL.AIController(b, { difficulty: 'normal' });
    buu.controller = new SL.AIController(b, { difficulty: 'normal' });
    b.aiLocked = false;
    b.inputLocked = false;
    let plays = 0, pounces = 0, poses = new Set();
    b.on('buuPlays', (e) => {
      plays++;
      poses.add(e.pose);
    });
    b.on('buuPounce', () => pounces++);
    gg.step(b, 60 * 70);
    ok(plays >= 2, 'he stops to play in the middle of the fight: ' + plays + ' (' + [...poses].join(', ') + ')');
    ok(pounces >= 1, 'and it ends with him behind you: ' + pounces);
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ the missions */

  test('Chapter 10 is its own chapter after the wizard, in canon order, each mission opening the next, and progress survives a reload', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const ch = SL.data.story.chapters.find((c) => c.id === 'buu4');
    eq(ch.missions.join(','), CH10.join(','), 'The Mark, Prince of Saiyans, Majin Buu, The Prince\'s Pride');
    const order = SL.data.storyOrder();
    eq(order.indexOf('buu_majin'), order.indexOf('buu_dabura') + 1, 'straight after the Demon King');
    for (let i = 1; i < CH10.length; i++) {
      eq(order.indexOf(CH10[i]), order.indexOf(CH10[i - 1]) + 1, CH10[i] + ' follows ' + CH10[i - 1]);
      ok(SL.data.storyLocked(CH10[i], results([])), CH10[i] + ' is locked at first');
      ok(!SL.data.storyLocked(CH10[i], results([CH10[i - 1]])), CH10[i] + ' opens after ' + CH10[i - 1]);
    }
    const M = SL.data.missions;
    for (const id of CH10) ok(M[id].canon && SL.data.stages[M[id].stage], id + ' is canon and on a stage that exists');
    eq(M.buu_pride.phases.map((p) => p.id).join(','), 'standoff,first,ascend,clash,sky,ruin,siphon', 'Prince of Saiyans');
    eq(M.buu_awakening.phases.map((p) => p.id).join(','), 'ball,demon,hatch,buu,after', 'Majin Buu');
    eq(M.buu_sacrifice.phases.map((p) => p.id).join(','), 'arrive,blow,again,final,after', "The Prince's Pride");
    for (const [id, cps] of [['buu_majin', 'resist,stop'], ['buu_pride', 'first,clash,sky,ruin'], ['buu_awakening', 'demon,buu'], ['buu_sacrifice', 'blow,again']]) {
      eq(M[id].phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), cps, id + ' checkpoints');
    }
    // eras: the whole chapter wears the Buu-era looks
    for (const id of CH10) eq(SL.data.eraOf(id), 'buu', id + ' is in the Buu era');
    clear(SL, ['buu_majin', 'buu_pride']);
    SL.Save.load();
    ok(SL.Save.missionResult('buu_pride') && SL.Save.missionResult('buu_pride').completed, 'a clear survives a reload');
    ok(!SL.data.storyLocked('buu_awakening', (id) => SL.Save.missionResult(id)), 'and the next mission is still open');
    const before = JSON.stringify(SL.Save.data.unlocks);
    SL.Save.load();
    eq(JSON.stringify(SL.Save.data.unlocks), before, 'loading again unlocks nothing twice');
  });

  test('"The Mark": he can push the wizard out — until he chooses not to; the bar sinks whatever is pressed, and the story goes on without input too', () => {
    for (const mash of [true, false]) {
      const gg = H.create({ quiet: true, seed: 2 });
      const { SL } = gg;
      const b = gg.mission('buu_majin', { startPhase: phaseAt(SL, 'buu_majin', 'resist') });
      const labels = new Set();
      let peak = 0;
      b.on('struggle', (e) => {
        if (!e.active) return;
        labels.add(e.label);
        peak = Math.max(peak, 1 - e.progress);
      });
      SL.Input.pressed = (a) => mash && a === 'light' && b.mission.struggling && b.frame % 3 === 0;
      gg.until(b, () => phaseId(b) !== 'resist', 60 * 40);
      SL.Input.pressed = () => false;
      eq(phaseId(b), 'mark', (mash ? 'mashing' : 'doing nothing') + ': the struggle ends');
      ok(labels.has('RESIST') && labels.has('HE STOPS RESISTING'), 'the label turns over: ' + [...labels].join(' / '));
      if (mash) {
        ok(peak >= 0.75, 'mashing pushes him near the top: ' + peak.toFixed(2));
        eq(b.mission.flags.resistMemories, 3, 'three memories on the way up');
      } else ok(peak < 0.5, 'without input the bar never climbs: ' + peak.toFixed(2));
      b.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('"The Mark": reach him in time and the second blast goes into the sky; too slow and another section of the stands is gone', () => {
    const lostWith = {};
    for (const late of [false, true]) {
      const gg = H.create({ quiet: true, seed: 2 });
      const r = gg.playMission('buu_majin', { maxSeconds: 600, late, startPhase: phaseAt(gg.SL, 'buu_majin', 'stop') });
      eq(r.state, 'success', (late ? 'late' : 'in time') + ': mission state');
      const f = r.m.flags;
      ok(late ? f.secondBlast && !f.savedStand : f.savedStand && !f.secondBlast, late ? 'too slow: a second section' : 'in time: into the sky');
      lostWith[late] = r.b.stage.def.id === 'majin_wastes' ? f : null;
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
    ok(lostWith.false && lostWith.true, 'both end on the wastes');
  });

  test('"Prince of Saiyans": Super Saiyan 2 is pushed through by holding Charge (never skipped, never failed), and the fight tears through clothes and land', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('buu_pride', { startPhase: phaseAt(SL, 'buu_pride', 'ascend') });
    const g = b.story.goku;
    let holding = false;
    g.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: holding }) };
    b.on('playerSwitched', (e) => (e.to.controller = g.controller));
    let power = 0;
    b.on('struggle', (e) => {
      if (e.active) power = 1 - e.progress;
    });
    gg.until(b, () => !b.inputLocked && b.mission.struggling === undefined && power === 0 && phaseId(b) === 'ascend' && b.mission.prompts.size > 0, 60 * 20, skipAll(b));
    b.skipRequested = true; // a stale skip request never jumps the gameplay
    gg.step(b, 5);
    eq(g.form.id, 'ssj', 'not transformed by a skip');
    holding = true;
    gg.step(b, 120);
    const mid = power;
    ok(mid > 0.3 && mid < 1, 'holding raises it: ' + mid.toFixed(2));
    holding = false;
    gg.step(b, 60);
    ok(power < mid, 'letting go lets it sink: ' + power.toFixed(2));
    holding = true;
    let burst = 0;
    b.on('transformBurst', (e) => e.fighter === g && burst++);
    gg.until(b, () => g.form.id === 'ssj2', 60 * 20);
    eq(g.form.id, 'ssj2', 'held to the top: Super Saiyan 2');
    eq(burst, 1, 'through the form\'s own staged transformation');
    ok(!g.lockedForms.ssj2, 'and it is his now');
    b.dispose();
    // the fists: both of them come out of the exchange heavily damaged, and the land with them
    const gg2 = H.create({ quiet: true, seed: 3 });
    const r = gg2.playMission('buu_pride', { maxSeconds: 900, startPhase: phaseAt(gg2.SL, 'buu_pride', 'clash') });
    eq(r.state, 'success', 'from the clash to the end');
    ok(r.m.flags.fists, 'the fists met');
    ok(r.b.stage.devastated, 'the plateau is a ruin by the end');
    eq(r.b.story.goku.damageLevel, 3, 'Goku ends torn');
    eq(r.b.story.vegeta.damageLevel, 3, 'and so does Vegeta');
    ok(['won', 'lost', 'draw', 'hit'].includes(r.m.flags.galick), 'the Galick Gun was answered one way or another: ' + r.m.flags.galick);
    ok(r.m.flags.buuAwake, 'and the fight woke what was in the ball');
    eq(gg2.errors.length, 0, 'engine errors: ' + gg2.errors.slice(0, 2).join(' | '));
  });

  test('"Majin Buu": the seal breaks on a clock, he comes out of the smoke, the first fight shows the body coming back, and Dabura is eaten', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const r = gg.playMission('buu_awakening', { maxSeconds: 900 });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'mission state');
    ok(f.sealSeconds > 0 && f.sealSeconds <= 70, 'the seal clock ran: ' + f.sealSeconds + ' s');
    ok(f.buuOut, 'he came out');
    ok(f.buuBrokenApart && f.buuReforms >= 1, 'the fight blew him apart, and he came back: ' + f.buuReforms);
    ok(f.wounds >= 1, 'wounds opened and closed: ' + f.wounds);
    ok(f.gohanBeaten && S.gohan.damageLevel === 3, 'Gohan is beaten, his clothes torn');
    ok(f.daburaEaten && S.dabura.hidden, 'Dabura is candy, and gone');
    ok(S.ball.opened, 'the ball is empty');
    ok(S.piccolo.model._stoneMats === null || S.piccolo.model._stoneMats === undefined, 'the stone left Piccolo with Dabura');
    eq(S.gohan.alive, true, 'Gohan is alive');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"The Prince\'s Pride": blow him apart, hold him, say goodbye, and hold everything he has until the light — Buu slapping it out of him if he gets there', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('buu_sacrifice', { startPhase: phaseAt(SL, 'buu_sacrifice', 'final') });
    const v = b.story.vegeta, buu = b.story.buu;
    v.controller = { update: () => SL.emptyIntent() };
    let slaps = 0;
    b.on('finalSlap', () => slaps++);
    gg.until(b, () => slaps > 0, 60 * 20, skipAll(b));
    ok(slaps >= 1, 'not holding: Buu walks across and slaps it out of him');
    ok(!b.mission.flags.finalExplosion, 'and nothing happens without the hold');
    v.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.until(b, () => b.mission.flags.finalExplosion, 60 * 30);
    ok(b.mission.flags.finalExplosion, 'holding it through: the light');
    ok(buu.mech.apart || buu.hidden, 'it took Buu apart too');
    b.dispose();
    const gg2 = H.create({ quiet: true, seed: 3 });
    const r = gg2.playMission('buu_sacrifice', { maxSeconds: 900 });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'the whole mission');
    ok(f.gokuDown && f.firstReform && f.farewell && f.finalExplosion && f.statue, 'every beat: ' + Object.keys(f).join(','));
    ok(S.vegeta.hidden, 'nothing of him is left standing');
    ok(!S.buu.mech.apart && !S.buu.hidden, 'and Buu is whole again');
    eq(S.vegeta.form.id, 'majin', 'he died with the mark on');
    eq(gg2.errors.length, 0, 'engine errors: ' + gg2.errors.slice(0, 2).join(' | '));
  });

  test('checkpoints: every Chapter 10 fight restarts with only its fighters active — nobody watching becomes an AI combatant', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const cases = [
      ['buu_pride', 'first', 'goku', ['goku', 'vegeta']],
      ['buu_pride', 'clash', 'goku', ['goku', 'vegeta']],
      ['buu_pride', 'ruin', 'goku', ['goku', 'vegeta']],
      ['buu_awakening', 'demon', 'gohan', ['gohan', 'dabura']],
      ['buu_awakening', 'buu', 'gohan', ['gohan', 'buu']],
      ['buu_sacrifice', 'blow', 'vegeta', ['vegeta', 'buu']],
      ['buu_sacrifice', 'again', 'vegeta', ['vegeta', 'buu']],
      ['buu_ssj3', 'delay', 'goku', ['goku', 'buu']],
      ['buu_ssj3', 'third', 'goku', ['goku', 'buu']],
    ];
    for (const [id, phase, hero, active] of cases) {
      const b = at(gg, id, phase, hero);
      const S = b.story;
      eq(b.player, S[hero], id + '/' + phase + ': the player is ' + hero);
      const act = active.map((k) => S[k]);
      for (const f of b.fighters) {
        if (act.includes(f)) continue;
        ok(!(f.controller instanceof SL.AIController), id + '/' + phase + ': ' + f.def.id + ' is not given a brain');
        ok(f.untargetable || f.hidden || !f.alive, id + '/' + phase + ': ' + f.def.id + ' cannot be fought');
      }
      for (const k of active.slice(1)) ok(S[k].controller instanceof SL.AIController && !S[k].untargetable, id + '/' + phase + ': ' + k + ' fights');
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('every Chapter 10 and 11 mission plays through with every scene watched in full: no missing pose, no warning, no engine error', () => {
    for (const id of CH10.concat(CH11)) {
      const gg = H.create({ quiet: true, seed: 3 });
      const r = gg.playMission(id, { maxSeconds: 900, watch: true });
      eq(r.state, 'success', id + ' watched in full');
      eq([...new Set(gg.warnings)].join(' | '), '', id + ': warnings');
      eq(gg.errors.length, 0, id + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  /* ------------------------------------------------------------ Chapter 11: the third level */

  test('Super Saiyan 3 is an event, not a menu entry: the mane, no eyebrows, a silence before the reveal — and it burns ki every second', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const G = SL.data.characters.goku;
    // Battle of Gods (2026-10-05) added Super Saiyan God and God Ki after the third level
    const ids = G.forms.map((f) => f.id);
    eq(ids.slice(0, 5).join(','), 'base,kaioken,ssj,ssj2,ssj3', 'Goku: up to Super Saiyan 3');
    // ...and Movie 2 · Super Broly (2026-10-10) Super Saiyan Blue after them, handed over only inside that film
    // ...and Chapters 18-21 (2026-10-13) Blue Kaioken (Goku vs Hit) and the two stages of Ultra Instinct (the Tournament of Power)
    eq(ids.slice(5).join(','), 'god,godki,blue,blueKaioken,uiSign,mui', 'then only the god forms');
    eq(['blueKaioken', 'uiSign', 'mui'].map((id) => SL.data.formGivenBy['goku:' + id]).join(','), 'u6_goku_hit,top_jiren,top_mui', 'each handed over by its own mission');
    eq(SL.data.formGivenBy['goku:god'] + ',' + SL.data.formGivenBy['goku:godki'], 'bog_ritual,bog_sphere', 'each given by its own Battle of Gods mission');
    eq(SL.data.formGivenBy['goku:blue'], 'rof_goku', 'Blue is Resurrection of F\'s to give in canon');
    eq(SL.data.formGivenByMovie['goku:blue'], 'bb_legend', 'the Broly film keeps its own Blue handover');
    const f3 = G.forms.find((f) => f.id === 'ssj3');
    eq(f3.look.hair.style, 'goku_ssj3', 'its own hair');
    ok(SL.data.hair.goku_ssj3.spikes.concat(SL.data.hair.goku_ssj3.mirror).filter((sp) => sp.d[1] < -0.8 && sp.l > 0.6).length >= 6, 'a long mane down the back');
    eq(f3.look.brow, G.appearance.skin, 'no eyebrows');
    ok(f3.drain && f3.drain.kiPerSec > 0 && f3.mult.kiRegen === 0, 'it burns ki and stops ki recovery');
    const burst = f3.sequence.steps.find((st) => st.burst);
    const silence = f3.sequence.steps.filter((st) => st.at < burst.at && st.at >= burst.at - 40 && st.music === 0);
    ok(silence.length === 1, 'a silence just before the reveal');
    ok(f3.sequence.length > G.forms.find((f) => f.id === 'ssj2').sequence.length, 'the longest transformation so far');
    eq(SL.data.formGivenBy['goku:ssj3'], 'buu_ssj3', 'given by The Third Level');
    // Free Battle: locked until the story shows it; then it drains, charging sustains it, empty ends it
    let fb = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 12 });
    ok(fb.player.lockedForms && fb.player.lockedForms.ssj3, 'locked before the story');
    fb.dispose();
    clear(SL, ['buu_majin', 'buu_pride', 'buu_awakening', 'buu_sacrifice', 'buu_ssj3']);
    fb = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 12 });
    const p = fb.player;
    ok(!(p.lockedForms && p.lockedForms.ssj3), 'unlocked after');
    ok(p.lockedForms && p.lockedForms.god && p.lockedForms.godki, 'the god forms stay locked until their own missions');
    p.applyForm(G.forms.indexOf(f3));
    p.ki = 60;
    gg.step(fb, 120);
    ok(p.ki < 52 && p.form.id === 'ssj3', 'the tank goes down while he holds it: ' + p.ki.toFixed(1));
    p.controller = gg.script(fb, () => ({ charge: true }));
    gg.step(fb, 60);
    ok(p.ki > 52, 'charging keeps it up: ' + p.ki.toFixed(1));
    p.controller = gg.script(fb, () => ({}));
    p.ki = 3;
    gg.step(fb, 90);
    eq(p.form.id, 'base', 'empty: he drops all the way to base');
    fb.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"The Third Level": the broadcast and the candy people, a city that pays for every miss, the third level held through, Buu blown apart — and the wizard who shouted at him', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    eq(order.indexOf('buu_ssj3'), order.indexOf('buu_sacrifice') + 1, 'Chapter 11 follows the sacrifice');
    eq(SL.data.story.chapters.find((c) => c.id === 'buu5').missions[0], 'buu_ssj3', 'Chapter 11 opens with it');
    ok(SL.data.storyLocked('buu_ssj3', results(['buu_awakening'])) && !SL.data.storyLocked('buu_ssj3', results(['buu_sacrifice'])), 'it opens after the sacrifice');
    eq(SL.data.missions.buu_ssj3.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'delay,third', 'checkpoints');
    const r = gg.playMission('buu_ssj3', { maxSeconds: 900 });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'mission state');
    eq(f.candyPeople, 5, 'the people in the square are candy');
    ok(S.civilians.every((c) => c.model._stoneMats), 'and stay candy');
    ok(f.ascended_ssj3 >= 6, 'the third level took the full hold: ' + f.ascended_ssj3 + ' s');
    ok(f.ssj3Aparts >= 1 || f.ssj3RanDry, 'he blew Buu apart, or ran dry trying: ' + f.ssj3Aparts);
    ok(f.gokuLeft && S.goku.hidden, 'Goku leaves');
    ok(f.babidiDead && S.babidi.hidden, 'and Babidi does not survive shouting at Buu');
    ok(S.buu.alive && !S.buu.hidden, 'Buu goes on');
    eq(S.goku.formIndex, 0, 'Goku left in base form: the third level cost him');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
