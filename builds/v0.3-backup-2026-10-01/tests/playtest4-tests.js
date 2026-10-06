// Human playtest round 4 (2026-09-21): the owner asked for the whole post-burial Frieza fight to
// be rebuilt as paced missions — the pod out of the way, a real conversation with Vegeta, the
// Kaioken climbing x2 → x4 → x10 → x20 against a Frieza who answers every level, the x20
// Kamehameha turned away with one hand, a Spirit Bomb Piccolo buys time for, a false victory,
// Frieza on a cliff, Piccolo taking the Death Beam, Krillin, the Super Saiyan storm, the power
// shift, the dying planet, 100% Frieza, the gi torn in that fight, and only then the Krillin
// line. Every test here drives the real engine headless (tests/headless.js).
const fs = require('fs');
const path = require('path');
const H = require('./headless');

module.exports = function playtest4Tests({ test, eq, ok }) {
  console.log('\nHuman playtest round 4: the Namek final Frieza rebuild (headless)');

  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  /** Start a mission at a phase and run until control is back (skipping scenes on the way). */
  const reach = (gg, id, phase, opts = {}) => {
    const { SL } = gg;
    const idx = phaseAt(SL, id, phase);
    const b = gg.mission(id, { startPhase: idx });
    gg.until(b, () => !b.inputLocked && b.mission.phaseIndex >= idx, 60 * (opts.seconds || 60), () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    return b;
  };
  /** Run a mission from a phase with everything skipped until a predicate holds. */
  const runUntil = (gg, b, pred, seconds, each) => gg.until(b, pred, 60 * seconds, () => {
    if (b.inputLocked) b.skipRequested = true;
    if (each) each();
  });

  /* ------------------------------------------------------------ structure */

  test('the rebuilt climax is six missions in the order it happened, each ending on the next one\'s name', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    const want = ['namek_vegeta_end', 'namek_goku', 'namek_kaioken20', 'namek_spirit_bomb', 'namek_super_saiyan', 'namek_end', 'namek_aftermath'];
    const idx = want.map((id) => order.indexOf(id));
    for (let i = 1; i < idx.length; i++) eq(idx[i], idx[i - 1] + 1, want[i] + ' follows ' + want[i - 1]);
    const M = SL.data.missions;
    const shape = {
      namek_vegeta_end: ['arrival,confront,beam,words,burial,after', 'beam,burial'],
      namek_goku: ['open,base,kaioken,rising,after', 'base,rising'],
      namek_kaioken20: ['ten,reveal,twenty,desperate,kamehameha,spent', 'ten,desperate,kamehameha'],
      namek_spirit_bomb: ['call,hold,impact,quiet,return,sacrifice,after', 'hold,return,sacrifice'],
      namek_super_saiyan: ['krillin,awaken,reversal,legend,desperation,core', 'krillin,awaken,reversal,desperation'],
      namek_end: ['dying,hundred,full,krillin,finish,saucers,mercy,betrayal,escape,after', 'hundred,full,finish,saucers,mercy,betrayal,escape'],
    };
    for (const [id, [phases, cps]] of Object.entries(shape)) {
      eq(M[id].phases.map((p) => p.id).join(','), phases, id + ' phases');
      eq(M[id].phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), cps, id + ' checkpoints');
    }
    // the transitions: each mission's closing card names the next mission
    for (let i = 0; i < want.length - 1; i++) {
      const b = gg.mission(want[i], {});
      ok(b.mission.nextLine().indexOf(M[want[i + 1]].title) >= 0, want[i] + ' → "' + b.mission.nextLine() + '"');
      b.dispose();
    }
    eq(M.namek_end.stage, 'namek_ruin', 'the last fight is on the dying planet');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('every objective icon the rebuilt missions use exists', () => {
    const ui = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', 'ui.js'), 'utf8');
    const table = ui.slice(ui.indexOf('const ICONS = {'), ui.indexOf('SL.icon ='));
    const icons = new Set([...table.matchAll(/^\s+([a-zA-Z]+):/gm)].map((x) => x[1]));
    for (const f of ['namek_goku', 'namek_kaioken20', 'namek_spirit_bomb', 'namek_super_saiyan', 'namek_end']) {
      const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'missions', f + '.js'), 'utf8');
      for (const mt of src.matchAll(/icon: '([a-z]+)'/g)) ok(icons.has(mt[1]), f + ' uses the icon "' + mt[1] + '", which exists');
    }
  });

  /* ------------------------------------------------------------ arrival, the pod, the conversation */

  test('the pod lands, is parked well out of the way, and never sits in the confrontation or the death', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('namek_vegeta_end', {});
    const S = b.story;
    ok(S.pod && S.pod.parent, 'the pod is a real object in the stage');
    let closest = Infinity, landedNearPod = false, beside = Infinity;
    // the landing is watched, not skipped: that is where the pod has to be seen
    gg.until(b, () => b.mission.phaseIndex >= phaseAt(SL, 'namek_vegeta_end', 'words'), 60 * 300, () => {
      const ph = b.mission.def.phases[b.mission.phaseIndex].id;
      if (ph === 'arrival') {
        if (!S.goku.hidden && S.goku.pos.distanceTo(S.podAt) < 6) landedNearPod = true;
      } else if (b.inputLocked) b.skipRequested = true;
      if (ph === 'confront' || ph === 'beam') {
        for (const f of [S.goku, S.vegeta, S.frieza]) if (!f.hidden) closest = Math.min(closest, f.pos.distanceTo(S.podAt));
      }
      if (ph === 'confront') beside = Math.min(beside, S.goku.pos.distanceTo(S.vegeta.pos));
    });
    ok(landedNearPod, 'Goku climbs out beside it (the landing has physical presence)');
    ok(closest > 20, 'and it is nowhere near the people in the important shots: nearest ' + closest.toFixed(1) + ' m');
    ok(beside < 6, 'Goku crossed the field to the prince: ' + beside.toFixed(1) + ' m');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('Vegeta tells Goku about Planet Vegeta before the beam, and Goku is in the shot for it', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const sc = SL.data.scenes.frieza_kills_vegeta;
    const lines = sc.events.map((e) => (e.say ? e.say.line : ''));
    const planet = lines.findIndex((l) => /Planet Vegeta/.test(l));
    ok(planet >= 0, 'the Planet Vegeta line is there');
    const ev = sc.events[planet];
    ok(ev.cam && String(ev.cam.from.at).indexOf('goku') === 0, 'played on Goku\'s face');
    const beam = sc.events.findIndex((e) => e.call && /beam/i.test(String(e.call)));
    ok(beam < 0 || planet < beam, 'and it comes before the beam');
    const words = SL.data.scenes.vegeta_final_words.events.map((e) => (e.say ? e.say.line : '')).join(' ');
    ok(/puppet|dog/i.test(words), 'his last words say what Frieza made of him');
    // at runtime, both are standing and talking before anything is fired
    const b = gg.mission('namek_vegeta_end', { startPhase: phaseAt(SL, 'namek_vegeta_end', 'beam') });
    const S = b.story;
    let at = null;
    b.on('say', (e) => {
      if (/Planet Vegeta/.test(e.line) && !at) at = { vegeta: S.vegeta.alive && !S.vegeta.hidden, goku: !S.goku.hidden, shot: !!b.mission.flags.vegetaShot };
    });
    gg.until(b, () => !!at, 60 * 60);
    ok(at && at.vegeta && at.goku, 'both on the field when he says it');
    eq(at && at.shot, false, 'nothing has been fired yet');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the owner\'s speech is performed in the declaration scene, every line of it', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const sc = gg.SL.data.scenes.goku_declares_frieza;
    const said = sc.events.filter((e) => e.say).map((e) => e.say.line);
    ok(said.length >= 12, 'twelve spoken beats: ' + said.length);
    ok(said.some((l) => /I WILL DEFEAT YOU/.test(l)), 'ending on the declaration');
    ok(sc.events.filter((e) => e.cam).length >= 6, 'and it is staged across many shots, not one');
  });

  /* ------------------------------------------------------------ the Kaioken, climbing */

  test('before the Kaioken, base Goku is fighting an emperor who is toying with him', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const b = reach(gg, 'namek_goku', 'base');
    const S = b.story;
    eq(b.player, S.goku, 'the player is Goku');
    eq(S.goku.formIndex, 0, 'in base form');
    ok(S.goku.lockedForms && S.goku.lockedForms.kaioken, 'the Kaioken is not his to use yet in this stretch');
    ok(S.goku.lockedForms && S.goku.lockedForms.ssj, 'and Super Saiyan is locked by the chronology');
    ok(S.frieza.storyEvade && S.frieza.storyEvade.from.includes(S.goku), 'most of what he throws is simply not there when it lands');
    eq(S.frieza.aiPhase, 'dominant', 'Frieza\'s brain is in its dominant phase');
    ok(S.frieza.infiniteHp, 'and nothing here finishes him');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the Kaioken climbs x2 → x3 → x4 in the first mission, and every level Frieza answers', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const b = reach(gg, 'namek_goku', 'rising');
    const S = b.story, g = S.goku;
    const levels = g.def.forms[1].levels.map((l) => l.name);
    eq(g.form.id, 'kaioken', 'lit from the checkpoint');
    eq(levels[g.formLevelCap(g.def.forms[1])], 'x4', 'and x4 is as high as it goes tonight');
    const said = [];
    b.on('say', (e) => said.push(e.speakerId || String(e.speaker).toLowerCase()));
    const mul0 = S.frieza.damageDealtMul;
    g.ki = g.kiMax;
    g.formLevel = 0;
    g._applyFormLevel();
    ok(g._raiseFormLevel(), 'x2 → x3');
    gg.step(b, 10);
    const mul1 = S.frieza.damageDealtMul;
    g.ki = g.kiMax;
    ok(g._raiseFormLevel(), 'x3 → x4');
    gg.step(b, 10);
    const mul2 = S.frieza.damageDealtMul;
    g.ki = g.kiMax;
    eq(g._raiseFormLevel(), false, 'x10 is refused here');
    ok(mul0 < mul1 && mul1 < mul2, 'Frieza answers each level: ×' + [mul0, mul1, mul2].map((x) => x.toFixed(2)).join(' → ×'));
    ok(said.filter((x) => /frieza/i.test(x)).length >= 2, 'and says so each time');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('x10 is only reachable in the next mission, and x20 only after Frieza shows fifty percent', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const levels = SL.data.characters.goku.forms[1].levels.map((l) => l.name);
    const b = reach(gg, 'namek_kaioken20', 'ten');
    const g = b.story.goku;
    eq(g.form.id, 'kaioken', 'x10 fight: in the Kaioken');
    eq(levels[g.formLevel], 'x10', 'at x10');
    g.ki = g.kiMax;
    eq(g._raiseFormLevel(), false, 'and x20 is refused before the fifty percent');
    ok(!b.mission.flags.fiftyPercent, 'Frieza has not shown it yet');
    let fifty = null, twenty = null;
    b.on('sceneEnd', (e) => {
      if (e.id === 'frieza_fifty_percent') fifty = { cap: levels[g.formLevelCap(g.def.forms[1])] };
      if (e.id === 'goku_kaioken20') twenty = { level: levels[g.formLevel], cap: levels[g.formLevelCap(g.def.forms[1])], form: g.form.id };
    });
    runUntil(gg, b, () => !!twenty, 200);
    ok(fifty, 'the fifty percent scene played');
    eq(fifty && fifty.cap, 'x10', 'still capped at x10 while he shows it');
    eq(twenty && twenty.level, 'x20', 'then the major activation puts him at x20');
    eq(twenty && twenty.cap, 'x20', 'with x20 now the ceiling');
    ok(g.lockedForms && g.lockedForms.ssj, 'Super Saiyan is still locked the whole way');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the x20 Kamehameha is pushed by the player, held on one hand, turned away — and it hurt him', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    const b = gg.mission('namek_kaioken20', { startPhase: phaseAt(SL, 'namek_kaioken20', 'kamehameha') });
    const S = b.story, g = S.goku, fz = S.frieza;
    let struggled = false, beam = false, deflect = null, hurtLine = false;
    b.on('struggle', (e) => {
      if (e.active) struggled = true;
    });
    b.on('say', (e) => {
      if (/That hurt/.test(e.line)) hurtLine = true;
    });
    b.on('sceneEnd', (e) => {
      if (e.id === 'frieza_deflects_kamehameha') deflect = { goku: g.formIndex, strain: g.strain, friezaAlive: fz.alive, hp: fz.hpFrac };
    });
    gg.until(b, () => !!deflect, 60 * 90, () => {
      if (b.projectiles.beams.some((x) => x.owner === g && !x.done)) beam = true;
    });
    ok(struggled, 'the push is a struggle the player drives');
    ok(beam, 'a real Kamehameha beam is on the field');
    ok(hurtLine, 'Frieza admits it hurt');
    ok(deflect && deflect.friezaAlive, 'and he is still standing');
    eq(deflect && deflect.goku, 0, 'Goku drops out of the Kaioken');
    ok(deflect && deflect.strain >= 90, 'spent: strain ' + (deflect && Math.round(deflect.strain)));
    ok(b.mission.flags.kameAvg !== undefined, 'the push is scored: ' + b.mission.flags.kameAvg);
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* ------------------------------------------------------------ the Spirit Bomb */

  test('the Spirit Bomb gathers energy from beyond Namek, and Goku cannot move while it does', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const call = SL.data.scenes.spirit_bomb_call;
    const words = call.events.map((e) => (e.say ? e.say.line : '')).join(' ');
    ok(/planets|stars/i.test(words), 'he asks the planets and stars, not only Namek');
    ok(call.events.some((e) => e.say && e.say.who === 'piccolo'), 'and Piccolo steps in front of him');
    const b = reach(gg, 'namek_spirit_bomb', 'hold');
    const S = b.story, g = S.goku;
    gg.step(b, 60);
    eq(g.state, 'spiritBomb', 'Goku is holding it up');
    // measure the gathering on its own: anything Frieza lands on Goku costs it (its own test)
    for (const f of [S.frieza, S.krillin, S.gohan]) f.controller = { update: () => SL.emptyIntent() };
    gg.step(b, 30);
    const f0 = g.sd.frac;
    gg.step(b, 120);
    ok(g.state === 'spiritBomb' && g.sd.frac > f0, 'and it grows: ' + f0.toFixed(2) + ' → ' + g.sd.frac.toFixed(2));
    ok(g.untargetable === false, 'he is exposed while he does it');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('Piccolo is the distraction: a hit turns Frieza\'s head, and a hit on Goku costs the gathering', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = reach(gg, 'namek_spirit_bomb', 'hold');
    const S = b.story, g = S.goku, fz = S.frieza, pc = S.piccolo;
    // keep the test about Piccolo: the other two stand still
    for (const f of [S.krillin, S.gohan]) f.controller = { update: () => SL.emptyIntent() };
    pc.controller = { update: () => SL.emptyIntent() };
    gg.step(b, 240);
    eq(fz.target, g, 'Frieza is going for Goku');
    fz.takeHit(pc, { type: 'melee', damage: 120, knock: 'flinch', hitstun: 10, impact: 1 });
    gg.step(b, 2);
    eq(fz.target, pc, 'one hit from Piccolo and he is looking at Piccolo');
    gg.step(b, 260);
    eq(fz.target, g, 'a few seconds later he remembers Goku');
    // a hit on Goku knocks the gathering down and costs part of it
    gg.step(b, 240);
    eq(g.state, 'spiritBomb', 'still gathering');
    // the mission charges at most one cost per 45 frames: keep Frieza's own blows out of the frames
    // before the scripted one, so the cost measured below is that blow's (the random stream decides
    // whether his AI happened to land one there)
    const fzCtl = fz.controller;
    fz.controller = { update: () => SL.emptyIntent() };
    gg.step(b, 100);
    fz.controller = fzCtl;
    eq(g.state, 'spiritBomb', 'still gathering');
    const before = g.sd.frac;
    g.takeHit(fz, { type: 'melee', damage: 200, knock: 'heavy', knockSpeed: 16, hitstun: 30, impact: 3 });
    gg.step(b, 20); // past the hit-stop
    eq(g.state, 'spiritBomb', 'he braces through the hit (a held ultimate is armored)');
    ok(g.sd.frac < before - 0.08, 'but the gathering pays for it: ' + before.toFixed(2) + ' → ' + g.sd.frac.toFixed(2));
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the impact, the quiet, and Frieza on the cliff: bloodied, half a tail, alive', () => {
    const gg = H.create({ quiet: true, seed: 8 });
    const { SL } = gg;
    const scenes = [];
    let quietMusic = null, onCliff = null, b = null;
    b = gg.mission('namek_spirit_bomb', { startPhase: phaseAt(SL, 'namek_spirit_bomb', 'impact'), onCreate: (bb) => bb.on('sceneStart', (e) => scenes.push(e.id)) });
    const S = b.story, fz = S.frieza;
    b.on('sceneEnd', (e) => {
      if (e.id === 'false_victory') quietMusic = b.mission.musicLevel;
      if (e.id === 'frieza_returns') onCliff = { y: fz.pos.y - b.stage.heightAt(fz.pos.x, fz.pos.z), cliff: fz.pos.distanceTo(S.cliff.pos), tail: !!fz.model.tailCut, battered: !!fz.model._battered, hidden: !!fz.hidden };
    });
    runUntil(gg, b, () => !!onCliff, 200);
    eq(scenes.slice(0, 3).join(','), 'spirit_bomb_impact,false_victory,frieza_returns', 'impact, the quiet, then the cliff');
    eq(quietMusic, 0, 'the false victory plays in silence');
    ok(onCliff && onCliff.cliff < 1, 'he is standing on the cliff');
    ok(onCliff && onCliff.y > 5, 'high above the field: ' + (onCliff && onCliff.y.toFixed(1)) + ' m');
    ok(onCliff && onCliff.tail, 'missing part of his tail');
    ok(onCliff && onCliff.battered, 'and battered by it');
    eq(onCliff && onCliff.hidden, false, 'and visible');
    ok(b.mission.flags.friezaSurvived, 'the story knows he survived');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the Death Beam is for Goku; Piccolo shoves him clear, takes it through the chest, and lives', () => {
    const gg = H.create({ quiet: true, seed: 8 });
    const { SL } = gg;
    let start = null, out = null;
    const b = gg.mission('namek_spirit_bomb', {
      startPhase: phaseAt(SL, 'namek_spirit_bomb', 'sacrifice'),
      onCreate: (bb) => bb.on('sceneStart', (e) => {
        if (e.id === 'piccolo_takes_the_beam') start = { goku: bb.story.goku.pos.clone() };
      }),
    });
    const S = b.story, g = S.goku, pc = S.piccolo;
    b.on('sceneEnd', (e) => {
      if (e.id === 'piccolo_takes_the_beam') out = { pcAlive: pc.alive, pcHp: pc.hp, cannotDie: pc.cannotDie, pcAt: pc.pos.distanceTo(start.goku), gokuMoved: g.pos.distanceTo(start.goku), hidden: pc.hidden };
    });
    gg.until(b, () => !!out, 60 * 90);
    ok(out && out.pcAt < 1.5, 'Piccolo ends where Goku was standing: ' + (out && out.pcAt.toFixed(2)));
    ok(out && out.gokuMoved > 2, 'Goku was shoved out of the line: ' + (out && out.gokuMoved.toFixed(2)) + ' m');
    ok(out && out.pcAlive && out.pcHp > 0, 'Piccolo is critically injured, and alive (' + (out && out.pcHp) + ' hp)');
    ok(out && out.cannotDie, 'and the story keeps him that way');
    ok(b.mission.flags.piccoloDown && b.mission.flags.piccoloAlive, 'story flags');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* ------------------------------------------------------------ Krillin, and Super Saiyan */

  test('Krillin is lifted into the air, pleads, and is gone — and Goku is not a Super Saiyan until after', () => {
    const gg = H.create({ quiet: true, seed: 9 });
    const b = gg.mission('namek_super_saiyan', {});
    const S = b.story, k = S.krillin, g = S.goku;
    let maxLift = 0, pleaded = false, out = null;
    b.on('say', (e) => {
      if (/HELP ME/.test(e.line)) pleaded = true;
    });
    b.on('sceneEnd', (e) => {
      if (e.id === 'krillin_taken') out = { alive: k.alive, hidden: k.hidden, form: g.form.id, ssjLocked: !!(g.lockedForms && g.lockedForms.ssj) };
    });
    gg.until(b, () => !!out, 60 * 60, () => {
      if (!k.hidden) maxLift = Math.max(maxLift, k.pos.y - b.stage.heightAt(k.pos.x, k.pos.z));
    });
    ok(maxLift > 5, 'held off the ground by telekinesis: ' + maxLift.toFixed(1) + ' m');
    ok(pleaded, 'he pleads for help');
    eq(out && out.alive, false, 'and does not survive it');
    eq(out && out.hidden, true, 'nothing of him is left on the field');
    eq(out && out.form, 'base', 'Goku has not transformed yet');
    eq(out && out.ssjLocked, true, 'and Super Saiyan is still locked until the transformation scene');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the Super Saiyan transformation brings its weather with it: the sky, lightning, the ground, and a storm that stays', () => {
    const gg = H.create({ quiet: true, seed: 9 });
    const { SL } = gg;
    const b = gg.mission('namek_super_saiyan', { startPhase: phaseAt(SL, 'namek_super_saiyan', 'awaken') });
    const S = b.story;
    let bolts = 0, maxMood = 0, craters = 0, out = null, feared = false;
    const sky = b.vfx.skyBolt.bind(b.vfx);
    b.vfx.skyBolt = (...a) => {
      bolts++;
      return sky(...a);
    };
    const crater = b.stage.crater.bind(b.stage);
    b.stage.crater = (...a) => {
      craters++;
      return crater(...a);
    };
    b.on('say', (e) => {
      if (e.speakerId === 'frieza' && /story|sky/i.test(e.line)) feared = true;
    });
    b.on('sceneEnd', (e) => {
      if (e.id === 'goku_super_saiyan') out = { form: S.goku.form.id, mood: b.stage.mood ? b.stage.mood.target : 0 };
    });
    gg.until(b, () => !!out, 60 * 90, () => {
      if (b.stage.mood) maxMood = Math.max(maxMood, b.stage.mood.target);
    });
    ok(bolts >= 5, 'lightning strikes around him: ' + bolts);
    ok(maxMood >= 0.6, 'the sky goes dark: mood ' + maxMood.toFixed(2));
    ok(craters >= 1, 'the ground gives under him: ' + craters);
    ok(feared, 'Frieza is afraid of what he is looking at');
    eq(out && out.form, 'ssj', 'Super Saiyan');
    ok(out && out.mood > 0.2, 'and the storm is still there when the fight starts: ' + (out && out.mood.toFixed(2)));
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('after the transformation the power shift is mechanical: Goku out-speeds him and Frieza fights like he is losing', () => {
    const gg = H.create({ quiet: true, seed: 10 });
    const { SL } = gg;
    const b = reach(gg, 'namek_super_saiyan', 'reversal');
    gg.step(b, 30);
    const S = b.story, g = S.goku, fz = S.frieza;
    eq(g.form.id, 'ssj', 'Super Saiyan');
    ok(g.storySpeed, 'Frieza\'s speed no longer slips his hits');
    ok(g.storyEvade && g.storyEvade.from.includes(fz), 'and Frieza\'s ordinary attacks miss him');
    eq(fz.aiPhase, 'shaken', 'Frieza\'s brain is shaken');
    ok(fz.aiRhythm && fz.aiRhythm.rest > 90, 'long breaths between short bursts: ' + JSON.stringify(fz.aiRhythm));
    eq(fz.barkOverrides && fz.barkOverrides.taunt, 'frieza_shaken', 'and he stops taunting');
    ok(fz.damageDealtMul < 1 && fz.damageTakenMul > 1, 'the numbers went the other way: out ×' + fz.damageDealtMul + ', in ×' + fz.damageTakenMul);
    // the brain itself: shaken Frieza keeps his distance more than the dominant one does
    const ai = fz.controller;
    const scoresFor = (phase) => {
      fz.aiPhase = phase;
      const sc = { melee: 1, retreat: 1, strafe: 1, wait: 1, p_beam: 1 };
      SL.AIHooks.frieza.scores(ai, fz, g, 3, false, sc, false);
      return sc;
    };
    const dom = scoresFor('dominant'), sh = scoresFor('shaken');
    ok(sh.melee < dom.melee && sh.retreat > dom.retreat, 'shaken: less melee, more retreat (' + JSON.stringify({ dom: { m: dom.melee, r: dom.retreat }, sh: { m: sh.melee, r: sh.retreat } }) + ')');
    fz.aiPhase = 'shaken';
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* ------------------------------------------------------------ the dying planet */

  test('the destroyed Namek is its own place, and Frieza reaches one hundred percent only there', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const st = SL.data.stages;
    ok(st.namek_ruin && st.namek_ruin.storyOnly, 'a story-only stage');
    ok(st.namek_ruin.sky.top !== st.namek.sky.top && st.namek_ruin.water.color !== st.namek.water.color, 'with its own sky and lava where the water was');
    const fin = SL.data.characters.frieza.forms.find((f) => f.id === 'final');
    const full = SL.data.characters.frieza.forms.find((f) => f.id === 'full');
    ok(full && full.look.bulk > fin.look.bulk, 'the 100% body is bigger: bulk ' + full.look.bulk);
    ok(full.mult.damage > fin.mult.damage, 'and hits harder');
    eq(SL.data.formGivenBy['frieza:full'], 'namek_end', 'and the chronology gives it to the dying planet');
    const b = gg.mission('namek_end', { startPhase: phaseAt(SL, 'namek_end', 'hundred') });
    const S = b.story;
    let out = null;
    b.on('sceneEnd', (e) => {
      if (e.id === 'frieza_full_power') out = { form: S.frieza.form.id, stage: b.stage.def.id };
    });
    runUntil(gg, b, () => !!out, 60);
    eq(out && out.form, 'full', 'after the scene he is at 100%');
    eq(out && out.stage, 'namek_ruin', 'on the dying planet');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the gi is torn in the 100% fight, on screen, and not in its first seconds', () => {
    const gg = H.create({ quiet: true, seed: 12 });
    const b = reach(gg, 'namek_end', 'full');
    const S = b.story, g = S.goku, m = b.mission;
    eq(!!g.torn, false, 'the gi is on when the 100% fight starts');
    let tornAt = null;
    b.on('giTorn', () => (tornAt = tornAt || b.frame));
    const start = b.frame;
    gg.until(b, () => !!tornAt, 60 * 40);
    ok(tornAt, 'the fight tears it');
    ok(tornAt - start >= 60 * 7.5, 'but not straight away: after ' + ((tornAt - start) / 60).toFixed(1) + ' s');
    eq(!!g.torn, true, 'and it stays torn');
    ok(m.flags.giTorn, 'the story knows');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('"DON\'T YOU DARE TALK ABOUT KRILLIN!" is only said on the dying planet, against 100% Frieza, with the gi gone', () => {
    const gg = H.create({ quiet: true, seed: 13 });
    const { SL } = gg;
    // only one scene has the line, and only one mission plays that scene
    const holders = Object.values(SL.data.scenes).filter((sc) => (sc.events || []).some((e) => e.say && /TALK ABOUT KRILLIN/.test(e.say.line)));
    eq(holders.map((x) => x.id).join(','), 'frieza_krillin_line', 'one scene carries it');
    const dir = path.join(__dirname, '..', 'src', 'data', 'missions');
    const players = fs.readdirSync(dir).filter((f) => fs.readFileSync(path.join(dir, f), 'utf8').includes("'frieza_krillin_line'"));
    eq(players.join(','), 'namek_end.js', 'and only the last mission plays it');
    // at runtime, from the 100% fight
    const b = gg.mission('namek_end', { startPhase: phaseAt(SL, 'namek_end', 'full') });
    const S = b.story;
    let at = null;
    b.on('say', (e) => {
      if (/TALK ABOUT KRILLIN/.test(e.line) && !at) at = { stage: b.stage.def.id, form: S.frieza.form.id, torn: !!S.goku.torn, gokuForm: S.goku.form.id };
    });
    gg.until(b, () => !!at, 60 * 180, () => {
      if (b.inputLocked && b.mission.def.phases[b.mission.phaseIndex].id !== 'krillin') b.skipRequested = true;
    });
    eq(at && at.stage, 'namek_ruin', 'on the destroyed planet');
    eq(at && at.form, 'full', 'with Frieza at 100%');
    eq(at && at.torn, true, 'and the gi already torn');
    eq(at && at.gokuForm, 'ssj', 'Goku a Super Saiyan');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  /* ------------------------------------------------------------ round 5: the end of Frieza */

  test('Goku tells Gohan to leave with Bulma BEFORE the transformation, not after it', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const sc = SL.data.scenes.goku_super_saiyan;
    const lines = sc.events.map((e) => (e.say ? e.say.line : ''));
    const evac = lines.findIndex((l) => /Bulma/.test(l));
    ok(evac >= 0, 'the evacuation line names Bulma: ' + (lines[evac] || ''));
    const change = sc.events.findIndex((e) => e.call && String(e.call).includes("'transform'"));
    ok(change > 0 && evac < change, 'and it is said before the change (' + evac + ' < ' + change + ')');
    // at runtime it is said while he is still himself, and the two of them are gone before the gold
    const b = gg.mission('namek_super_saiyan', { startPhase: phaseAt(SL, 'namek_super_saiyan', 'awaken') });
    const S = b.story;
    let at = null, ssjAt = null;
    b.on('say', (e) => {
      if (/Bulma/.test(e.line) && !at) at = { frame: b.frame, form: S.goku.form.id, gohan: !S.gohan.hidden };
    });
    b.on('formChanged', (e) => {
      if (e.fighter === S.goku && e.form.id === 'ssj' && !ssjAt) ssjAt = b.frame;
    });
    gg.until(b, () => at && ssjAt, 60 * 120);
    ok(at && at.gohan, 'Gohan is on the field to hear it');
    eq(at && at.form, 'base', 'and Goku is still himself when he says it');
    ok(ssjAt > at.frame, 'the transformation comes after: ' + at.frame + ' → ' + ssjAt);
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the two Krillin beats are different moments: the quiet realization first, the shout on the dying planet', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    const quiet = SL.data.scenes.goku_legend.events.map((e) => (e.say ? e.say.line : '')).join(' | ');
    ok(/You're talking about Krillin/.test(quiet), 'the realization is in the Super Saiyan mission: ' + quiet.slice(0, 70));
    ok(!/DARE TALK ABOUT KRILLIN/.test(quiet), 'and the angry line is not');
    const late = SL.data.scenes.frieza_krillin_line.events.map((e) => (e.say ? e.say.line : '')).join(' | ');
    ok(/DON'T YOU DARE TALK ABOUT KRILLIN!/.test(late), 'the angry line belongs to the dying planet');
    ok(!/You're talking about Krillin/.test(late), 'and the quiet one is not repeated there');
    // the quiet beat is quiet, and the late one is shouted
    const q = SL.data.scenes.goku_legend.events.find((e) => e.say && /talking about Krillin/.test(e.say.line));
    eq(q.say.style, 'quiet', 'the realization is delivered quietly');
    const l = SL.data.scenes.frieza_krillin_line.events.find((e) => e.say && /DARE TALK/.test(e.say.line));
    eq(l.say.style, 'shout', 'and the answer on the dying planet is shouted');
  });

  test('Goku is exhausted at the end of the Kaioken and the Spirit Bomb, not left on one hit point', () => {
    for (const id of ['namek_kaioken20', 'namek_spirit_bomb']) {
      const gg = H.create({ quiet: true, seed: 4 });
      const r = gg.playMission(id, { maxSeconds: 700, skipCinematics: true });
      const g = r.b.story.goku;
      eq(r.m.state, 'success', id + ' completes');
      ok(g.hpFrac >= 0.15, id + ': he ends it hurt but standing — ' + Math.round(g.hpFrac * 100) + '%');
      ok(g.hpFrac <= 0.6, id + ': and genuinely spent — ' + Math.round(g.hpFrac * 100) + '%');
      eq(gg.errors.length, 0, id + ' engine errors');
    }
  });

  test('the Death Saucers are played: they chase, they go loose, and one of them cuts him down', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = reach(gg, 'namek_end', 'saucers');
    const S = b.story, g = S.goku, fz = S.frieza;
    eq(b.player, g, 'the player has Goku');
    eq(g.form.id, 'ssj', 'as a Super Saiyan');
    eq(fz.cannotDie, true, 'nothing the player does kills Frieza here');
    let discs = 0, loose = 0;
    b.on('deathSaucer', () => discs++);
    b.on('deathSaucerLoose', () => loose++);
    // the event fires when he starts the technique; the discs leave his hands a moment later
    let sawDisc = false;
    gg.until(b, () => sawDisc, 60 * 40, () => {
      if (b.projectiles.list.some((p) => p.kind === 'disc' && p.alive)) sawDisc = true;
    });
    ok(discs > 0, 'he throws them');
    ok(sawDisc, 'and they are real projectiles on the field');
    // the canon rule: past its leash a saucer stops taking sides
    gg.until(b, () => loose > 0 || b.mission.phaseIndex > phaseAt(SL, 'namek_end', 'saucers'), 60 * 60);
    ok(loose > 0, 'and they turn on everybody, him included');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('only his own loose saucer cuts him down: the ground erupting under Frieza does not end the saucer phase (2026-09-24)', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = reach(gg, 'namek_end', 'saucers');
    const fz = b.story.frieza;
    const idx = phaseAt(SL, 'namek_end', 'saucers');
    fz.takeHit(null, { type: 'explosion', damage: 600, knock: 'launch', knockSpeed: 22, hitstun: 26, impact: 3, dir: new gg.V3(0, 1, 0), point: fz.pos.clone(), name: 'Eruption' });
    gg.step(b, 30);
    eq(b.mission.phaseIndex, idx, 'an eruption is not his own saucer: still the saucer phase');
    ok(!b.mission.objectives.find((o) => o.id === 'lead').done, 'and nobody led one back over him');
    b.dispose();
  });

  test('the mercy is staged: he begs, Goku answers him, walks away, and gives him the energy to leave', () => {
    const gg = H.create({ quiet: true, seed: 8 });
    const { SL } = gg;
    const said = [];
    const b = gg.mission('namek_end', {
      startPhase: phaseAt(SL, 'namek_end', 'mercy'),
      onCreate: (bb) => bb.on('say', (e) => said.push((e.speakerId || '') + ': ' + e.line)),
    });
    const S = b.story;
    eq(!!S.frieza.model._halved, true, 'he is what the saucer left of him');
    let walked = 0, start = S.goku.pos.clone();
    gg.until(b, () => b.mission.flags.mercyGiven, 60 * 90, () => {
      walked = Math.max(walked, S.goku.pos.distanceTo(start));
    });
    const all = said.join(' | ');
    ok(/begging you/.test(all), 'he begs');
    ok(/How many times have people begged you for mercy/.test(all), 'Goku answers him with it');
    ok(/enough energy for you to get out of here/.test(all), 'and gives him the energy anyway');
    ok(walked > 4, 'Goku actually walks away from him: ' + walked.toFixed(1) + ' m');
    ok(S.frieza.alive, 'and he is alive when it ends');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the betrayal is answered by a one-handed Kamehameha the player pushes, and Frieza survives it', () => {
    const gg = H.create({ quiet: true, seed: 9 });
    const { SL } = gg;
    const said = [];
    const b = gg.mission('namek_end', {
      startPhase: phaseAt(SL, 'namek_end', 'betrayal'),
      onCreate: (bb) => bb.on('say', (e) => said.push(e.line)),
    });
    const S = b.story;
    let struggled = false, gold = null;
    b.on('struggle', (e) => {
      if (e.active) struggled = true;
    });
    gg.until(b, () => b.mission.flags.friezaSurvivedNamek, 60 * 120, () => {
      const beam = b.projectiles.beams.find((x) => !x.done && x.owner === S.goku);
      if (beam && gold === null) gold = beam.spec ? beam.spec.color : null;
    });
    const all = said.join(' | ');
    ok(/emperor of the universe/.test(all), 'the pride talks first');
    ok(/YOU MUST DIE BY MY HAND/.test(all), 'then he fires at the man who spared him');
    ok(/YOU FOOL!!/.test(all), 'and Goku answers: ' + all.slice(0, 40));
    ok(struggled, 'the Kamehameha is pushed by the player');
    eq(gold, 0xffd23a, 'and it is the gold one, not the ordinary blue');
    eq(S.frieza.alive, true, 'Frieza is left alive');
    ok(S.frieza.hpFrac <= 0.1, 'and broken: ' + Math.round(S.frieza.hpFrac * 100) + '%');
    ok(b.mission.flags.friezaSurvivedNamek, 'the story records that he survived Namek');
    b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });


  /* --------------------------------------- the two cuts of the Namek ending (2026-09-24) */

  /** Play the betrayal phase in one of the two cuts and report what the run did. */
  const playBetrayal = (gg, cut) => {
    const { SL } = gg;
    SL.Settings.data.gameplay.namekEnding = cut;
    const said = [];
    const b = gg.mission('namek_end', {
      startPhase: phaseAt(SL, 'namek_end', 'betrayal'),
      onCreate: (bb) => bb.on('say', (e) => said.push(e.line)),
    });
    const S = b.story;
    let struggled = false, beamColor = null, beamCore = null, poses = [], faces = [], waveAt = -1;
    b.on('struggle', (e) => {
      if (e.active) struggled = true;
    });
    gg.until(b, () => b.mission.flags.friezaSurvivedNamek, 60 * 150, () => {
      const beam = b.projectiles.beams.find((x) => !x.done && x.owner === S.goku);
      if (beam && beamColor === null) {
        beamColor = beam.spec ? beam.spec.color : null;
        beamCore = beam.spec ? beam.spec.core : null;
        waveAt = poses.length; // how far into the run his own wave went out
      }
      const pose = S.goku.sd && S.goku.sd.pose;
      if (pose && poses[poses.length - 1] !== pose) poses.push(pose);
      const face = S.goku.sd && S.goku.sd.expression;
      if (face && faces[faces.length - 1] !== face) faces.push(face);
    });
    return { b, S, said: said.join(' | '), struggled, beamColor, beamCore, poses, faces, waveAt, flags: b.mission.flags };
  };

  test('the Namek ending has two cuts, Classic is the default, and the setting is what picks one', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    eq(SL.Settings.DEFAULTS.gameplay.namekEnding, 'classic', 'the shipped default is the classic cut');
    const entry = SL.Settings.SCHEMA.find((x) => x.key === 'namekEnding');
    ok(entry && entry.cat === 'gameplay', 'it is a gameplay setting');
    eq(entry.options.map((o) => o[0]).join(','), 'classic,manga', 'with exactly the two cuts');
    // and it is hidden until the player finds it
    eq(entry.secret, 'manga', 'the row is tagged as a secret');
    eq(SL.Settings.DEFAULTS.secrets.manga, false, 'which starts locked on a fresh install');
    const visible = (secrets) => SL.Settings.SCHEMA.filter((r) => r.cat === 'gameplay' && (!r.secret || secrets[r.secret])).map((r) => r.key);
    ok(visible({ manga: false }).indexOf('namekEnding') < 0, 'so the Settings screen does not list it');
    ok(visible({ manga: true }).indexOf('namekEnding') >= 0, 'and lists it once the secret is found');
    const classic = playBetrayal(gg, 'classic');
    eq(classic.flags.endingCut, 'classic', 'classic setting plays the classic cut');
    ok(classic.flags.betrayal && !classic.flags.mangaBeamPov, 'which is the staged scene, not the manga one');
    classic.b.dispose();
    const manga = playBetrayal(H.create({ quiet: true, seed: 2 }), 'manga');
    eq(manga.flags.endingCut, 'manga', 'manga setting plays the manga cut');
    manga.b.dispose();
  });

  test('the manga cut is its own film: he leaves, he yells, it is shot from the hand and from inside the beam, and it ends looking down at him', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const r = playBetrayal(gg, 'manga');
    ok(r.flags.mangaFriezaPov, 'the shot is taken from behind Frieza when he fires');
    ok(r.flags.mangaBeamPov, 'and then from inside the beam on its way up');
    ok(r.poses.includes('g_ssjRage'), 'Goku turns and yells before any of it: ' + r.poses.join(','));
    ok(r.poses.includes('g_angryKame'), 'the answer is the one-handed Kamehameha over the shoulder');
    ok(r.poses.includes('g_lookDown'), 'and the last image is him looking down at what is left');
    ok(r.flags.mangaLastLook, 'the cut records that last look');
    ok(!/emperor of the universe.*emperor of the universe/.test(r.said), 'the pride line is said once');
    ok(/YOU FOOL!!/.test(r.said), 'he still answers with it');
    // he answers out of the turn: the shot at his back never gets to him
    ok(r.flags.mangaFiredOnTurn, 'he turns and fires rather than bracing for it');
    ok(r.flags.mangaBeamEaten, 'and his wave goes out through the one still climbing at him');
    ok(!r.poses.includes('guard'), 'he never guards in this cut: ' + r.poses.join(','));
    // the face is the last thing, not a reaction to being shot at
    const sad = r.faces.indexOf('sad');
    ok(sad >= 0, 'he ends on a sad face: ' + r.faces.join(','));
    ok(r.waveAt >= 0 && r.poses.indexOf('g_lookDown') > r.poses.indexOf('g_angryKame'), 'which comes after the Kamehameha, not before it');
    ok(!r.faces.slice(0, Math.max(1, r.faces.indexOf('shout') + 1)).includes('sad'), 'and not while Frieza is firing at him');
    r.b.dispose();
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('both cuts end the same way: the player pushes a white-cored gold wave and Frieza is left alive', () => {
    for (const cut of ['classic', 'manga']) {
      const gg = H.create({ quiet: true, seed: 7 });
      const r = playBetrayal(gg, cut);
      ok(r.struggled, cut + ': the Kamehameha is pushed by the player, not watched');
      eq(r.beamColor, 0xffd23a, cut + ': the wave is the gold one');
      ok(r.beamCore === 0xfff6c0 || r.beamCore === 0xffffff, cut + ': with a white-hot core (' + r.beamCore + ')');
      eq(r.S.frieza.alive, true, cut + ': Frieza is alive afterwards');
      ok(r.flags.friezaSurvivedNamek, cut + ': and the story records it for Chapter 5');
      ok(typeof r.flags.angryKameAvg === 'number', cut + ': the push is still scored');
      r.b.dispose();
      eq(gg.errors.length, 0, cut + ': no engine errors');
    }
  });

  test('the chapter hands Frieza to Chapter 5 alive: nothing in the Namek climax kills him', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    // Chapter 5 opens with him rebuilt, so no Namek mission may leave him dead
    const trunks = SL.data.missions.android_trunks;
    ok(trunks && trunks.canon, 'Chapter 5 exists');
    const r = gg.playMission('namek_end', { maxSeconds: 700, skipCinematics: true });
    eq(r.m.state, 'success', 'the last Namek fight completes');
    eq(r.b.story.frieza.alive, true, 'and Frieza is alive at the end of it');
    ok(r.m.flags.friezaSurvivedNamek, 'with the flag the story reads');
    // the epilogue never contradicts it
    const dir = path.join(__dirname, '..', 'src', 'data', 'scenes');
    const after = fs.readFileSync(path.join(dir, 'namek_aftermath.js'), 'utf8');
    ok(!/Frieza is dead|killed Frieza|Frieza died/i.test(after), 'and the epilogue does not claim he is dead');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('the dying planet is dressed, not tinted: craters, broken slabs and vents that keep smoking', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('namek_end', { startPhase: 0 });
    eq(b.stage.def.id, 'namek_ruin', 'its own stage');
    ok(b.stage.ambient.length >= 1, 'with ambience hung on it: ' + b.stage.ambient.length);
    // the terrain itself is deformed (craters), not just recoloured
    const heights = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      heights.push(b.stage.heightAt(Math.cos(a) * 26, -12 + Math.sin(a) * 26));
    }
    const spread = Math.max(...heights) - Math.min(...heights);
    ok(spread > 1.2, 'the ground is broken up: ' + spread.toFixed(2) + ' m of relief around the field');
    gg.step(b, 200);
    eq(gg.errors.length, 0, 'no engine errors');
    b.dispose();
  });

  /* ------------------------------------------------------------ checkpoints, saves, audio */

  test('every major beat is a restart point that rebuilds its own state: the death, the Spirit Bomb, Frieza\'s return, Piccolo, Krillin, the transformation, 100%', () => {
    const want = [
      ['namek_vegeta_end', 'beam', 'frieza_kills_vegeta'],
      ['namek_spirit_bomb', 'hold', null],
      ['namek_spirit_bomb', 'return', 'frieza_returns'],
      ['namek_spirit_bomb', 'sacrifice', 'piccolo_takes_the_beam'],
      ['namek_super_saiyan', 'krillin', 'krillin_taken'],
      ['namek_super_saiyan', 'awaken', 'goku_super_saiyan'],
      ['namek_end', 'hundred', 'frieza_full_power'],
      ['namek_end', 'mercy', 'goku_spares_frieza'],
      ['namek_end', 'betrayal', 'frieza_betrayal'],
    ];
    for (const [id, phase, scene] of want) {
      const gg = H.create({ quiet: true, seed: 2 });
      const { SL } = gg;
      const idx = phaseAt(SL, id, phase);
      ok(SL.data.missions[id].phases[idx].checkpoint, id + '/' + phase + ' is a checkpoint');
      let played = !scene, cpAt = null;
      const b = gg.mission(id, {
        startPhase: idx,
        onCreate: (bb) => bb.on('sceneStart', (e) => {
          if (e.id !== scene || played) return;
          played = true;
          cpAt = bb.mission ? bb.mission.checkpoint : null;
        }),
      });
      const done = scene ? () => played && b.mission.phaseIndex > idx : () => !b.inputLocked && b.mission.phaseIndex >= idx;
      gg.until(b, done, 60 * 120, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      if (!scene) {
        eq(b.inputLocked, false, id + '/' + phase + ': control handed back');
      } else {
        ok(played, id + '/' + phase + ': the ' + scene + ' scene plays from the checkpoint');
        ok(b.mission.phaseIndex > idx, id + '/' + phase + ': and the mission moves on after it');
      }
      eq(scene ? cpAt : b.mission.checkpoint, idx, id + '/' + phase + ': a retry comes back here');
      eq(gg.errors.length, 0, id + '/' + phase + ' engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  test('progress through the rebuilt missions survives a save and a load, and each clear opens the next', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const chain = ['namek_goku', 'namek_kaioken20', 'namek_spirit_bomb', 'namek_super_saiyan', 'namek_end'];
    const res = (id) => SL.Save.missionResult(id);
    for (let i = 0; i < chain.length - 1; i++) {
      SL.Save.completeMission(chain[i], { score: 4000, rank: 'B' });
      SL.Save.load();
      ok(res(chain[i]) && res(chain[i]).completed, chain[i] + ' is still cleared after loading');
      ok(!SL.data.storyLocked(chain[i + 1], res), chain[i + 1] + ' is open');
    }
  });

  test('no sound loop outlives a rebuilt mission', () => {
    // the transformation and the Spirit Bomb are the two with the most loops in them
    for (const id of ['namek_kaioken20', 'namek_spirit_bomb', 'namek_super_saiyan', 'namek_end']) {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const r = gg.playMission(id, { maxSeconds: 600, skipCinematics: true });
      eq(r.m.state, 'success', id + ' completes (' + r.seconds.toFixed(0) + ' s)');
      r.b.dispose();
      const live = SL.Audio.liveLoops ? SL.Audio.liveLoops((h) => !h.ui) : [];
      eq(live.length, 0, id + ': no loop left running after it: ' + live.map((h) => h.name || h.tag).join(','));
      eq(gg.errors.length, 0, id + ' engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });
};
