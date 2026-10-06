// The Buu saga, Milestone A (2026-09-18): the seven-year time skip, Satan City,
// adult Gohan, the Great Saiyaman, Videl, Goten and Kid Trunks, and the three
// missions that introduce them. Runs the real engine headless (tests/headless.js).
const H = require('./headless');

module.exports = function buuTests({ test, eq, ok }) {
  console.log('\nThe Buu saga, Milestone A: seven years later (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseId = (b) => b.mission.def.phases[b.mission.phaseIndex].id;
  const NEW_CAST = ['adult_gohan', 'great_saiyaman', 'videl', 'goten', 'kid_trunks', 'city_thug', 'civilian'];

  test('the Buu-era cast validates, and each fighter is a kit of its own rather than a reskin', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    for (const id of NEW_CAST) {
      const c = SL.data.characters[id];
      ok(c, id + ' exists');
      eq(SL.Schema.validateCharacter(c).join(' | '), '', id + ' validates');
      eq(c.assetLevel, 1, id + ' is honestly a Level 1 prototype');
    }
    const moveIds = (c) => {
      const out = [];
      const mv = c.moves || {};
      for (const m of mv.light || []) out.push(m.id);
      for (const k of Object.keys(mv.heavy || {})) out.push(mv.heavy[k].id);
      if (mv.dash) out.push(mv.dash.id);
      for (const k of Object.keys(c.specials || {})) out.push(c.specials[k].id);
      return out;
    };
    // nobody shares a move with the fighter they could be mistaken for
    const pairs = [['adult_gohan', 'teen_gohan'], ['adult_gohan', 'great_saiyaman'], ['goten', 'goku'], ['kid_trunks', 'vegeta'], ['kid_trunks', 'future_trunks'], ['goten', 'kid_trunks']];
    for (const [a, b] of pairs) {
      const A = moveIds(SL.data.characters[a]), B = new Set(moveIds(SL.data.characters[b]));
      eq(A.filter((x) => B.has(x)).join(','), '', a + ' shares no move id with ' + b);
    }
    const C = SL.data.characters;
    // the children are children: smaller, lighter, faster, weaker than their fathers
    for (const [kid, dad] of [['goten', 'goku'], ['kid_trunks', 'vegeta']]) {
      ok(C[kid].appearance.height < C[dad].appearance.height * 0.75, kid + ' is visibly a child');
      ok(C[kid].stats.speed > C[dad].stats.speed * 0.95 && C[kid].stats.hp < C[dad].stats.hp, kid + ' is quick and fragile');
    }
    ok(C.goten.mechanic.type !== C.kid_trunks.mechanic.type, 'the two children fight on different mechanics');
    // Videl: a martial artist with no energy attacks and no flight until the story teaches her
    eq(C.videl.flight, false, 'Videl cannot fly yet');
    eq(C.videl.flightUnlock, 'buu_flight', 'until Gohan teaches her');
    ok(!Object.values(C.videl.specials).some((s) => s.type === 'beam' || s.type === 'projectile' || s.type === 'scatter'), 'and has no ki attacks');
    ok(C.videl.moves.counter && C.videl.moves.counter.light, 'what she has instead is a real counter');
    // the Great Saiyaman's costume is on the model, not in the description
    const o = C.great_saiyaman.appearance.outfit;
    ok(o.helmet !== undefined && o.cape !== undefined && o.visor !== undefined, 'helmet, visor and cape');
    ok(C.great_saiyaman.victory.poses.includes('gs_pose1'), 'and he poses when he wins');
    // adult Gohan: the two Super Saiyan levels, and the Ultimate the Old Kai unlocks (Chapter 12)
    eq(C.adult_gohan.forms.map((f) => f.id).join(','), 'base,ssj,ssj2,ultimate', 'adult Gohan: base, Super Saiyan, Super Saiyan 2, the Ultimate');
    ok(C.adult_gohan.forms[2].ai && C.adult_gohan.forms[2].poses, 'his Super Saiyan 2 fights differently, not just harder');
    // they all build, pose and fight in the engine without errors
    const b = gg.battle({ p1: 'great_saiyaman', p2: 'videl', distance: 3 });
    const s = b.player;
    ok(s.model && s.model.capeNode, 'the cape is built on the model');
    gg.step(b, 240);
    b.dispose();
    for (const [p1, p2] of [['goten', 'kid_trunks'], ['adult_gohan', 'city_thug']]) {
      const bb = gg.battle({ p1, p2, distance: 3 });
      gg.step(bb, 180);
      bb.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Satan City is its own place: flat streets, real buildings that come down, a school and a plaza', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL, THREE } = gg;
    const V3 = THREE.Vector3;
    const st = SL.data.stages.satan_city;
    eq(st.builder, 'city', 'its own builder');
    const b = gg.mission('buu_years', { startPhase: 0 });
    const S = b.stage;
    ok(S.isCity, 'built as a city');
    eq(S.heightAt(0, 0), 0, 'the plaza is flat street');
    eq(S.heightAt(120, -80), 0, 'and so is everywhere else');
    for (const k of ['plaza', 'school', 'schoolSteps', 'schoolRoof', 'rooftop']) ok(S.landmarks[k], 'landmark ' + k);
    const buildings = S.obstacles.filter((o) => o.building);
    ok(buildings.length > 20, 'a city of buildings: ' + buildings.length);
    ok(buildings.every((o) => Math.hypot(o.x, o.z) > st.city.plazaRadius - 4), 'nothing built on the plaza');
    // a building is an obstacle that takes damage and collapses
    let downs = 0;
    b.on('buildingDown', () => downs++);
    const o = buildings[0];
    const m4 = new THREE.Matrix4(), p = new V3(), q = new THREE.Quaternion(), sc = new V3();
    o.building.mesh.getMatrixAt(o.building.index, m4);
    m4.decompose(p, q, sc);
    const tall = sc.y;
    S.explode(new V3(o.x, 4, o.z), o.r + 3, o.maxHp * 3, true, null);
    ok(!o.alive, 'a big enough explosion brings the building down');
    eq(downs, 1, 'and says so');
    o.building.mesh.getMatrixAt(o.building.index, m4);
    m4.decompose(p, q, sc);
    ok(sc.y < tall * 0.2, 'what is left is rubble: ' + sc.y.toFixed(1) + ' of ' + tall.toFixed(1));
    // an impact on the painted street must not throw (no vertex colours to scorch)
    S.crater(new V3(10, 0, 10), 4, 0.6, null);
    gg.step(b, 60, skipAll(b));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('story order: the three Buu-era missions come after the Cell Games and before the wizard, each with its checkpoints', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    const at = (id) => order.indexOf(id);
    ok(at('cell_games') >= 0 && at('buu_years') === at('cell_games') + 1, 'seven years after the Cell Games');
    eq(order.slice(at('buu_years'), at('buu_years') + 3).join(','), 'buu_years,buu_saiyaman,buu_kids', 'the era before Babidi, in order');
    ok(at('buu_kids') < at('buu_majin'), 'and all of it before the wizard');
    const M = SL.data.missions;
    eq(M.buu_years.phases.map((p) => p.id).join(','), 'morning,flight,robbery,change,after', 'Seven Years');
    eq(M.buu_saiyaman.phases.map((p) => p.id).join(','), 'arrive,stop,meet,spar,after', 'The Great Saiyaman');
    eq(M.buu_kids.phases.map((p) => p.id).join(','), 'open,spar,ascend,rematch,after', 'Two Children');
    for (const [id, cps] of [['buu_years', 'flight'], ['buu_saiyaman', 'stop,spar'], ['buu_kids', 'spar,rematch']]) {
      eq(M[id].phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), cps, id + ' checkpoints');
      ok(M[id].canon, id + ' is canon story, not a What-If');
    }
    // nothing a movie owns turns up in the canon story
    for (const id of order) ok(!/gogeta|broly|fusion_reborn/i.test(id), 'no movie content in the canon order: ' + id);
  });

  test('"Seven Years": the time skip is flown, not told — the flight is real movement across the city, and the change of clothes is a change of fighter', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    let start = null, arrival = null;
    const r = gg.playMission('buu_years', {
      maxSeconds: 300,
      onBattle: (b) => {
        b.on('missionPhase', (e) => {
          const g = b.story.gohan;
          if (e.phase.id === 'flight') start = g.pos.clone();
          if (e.phase.id === 'robbery') arrival = { dz: start ? start.z - g.pos.z : 0 };
        });
      },
    });
    eq(r.state, 'success', 'mission state');
    const f = r.m.flags;
    ok(f.reachedPlaza && f.flightSeconds >= 5, 'the flight takes real time: ' + f.flightSeconds + ' s');
    ok(start && start.z > 200, 'it starts outside the city');
    const S = r.b.story;
    ok(S.gohan.hidden && !S.saiyaman.hidden, 'the student went round the corner and the hero came out');
    ok(f.becameSaiyaman && f.yearsDone, 'flags');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the Great Saiyaman\'s change: watched or skipped, the same fighter comes out', () => {
    const run = (skip) => {
      const gg = H.create({ quiet: true, seed: 5 });
      const { SL } = gg;
      const b = gg.mission('buu_years', { startPhase: phaseAt(SL, 'buu_years', 'change') });
      gg.until(b, () => phaseId(b) === 'after', 60 * 40, skip ? skipAll(b) : () => {});
      const S = b.story;
      const out = { gohanHidden: S.gohan.hidden, saiyamanHidden: S.saiyaman.hidden, saiyamanTargetable: !S.saiyaman.untargetable, flag: !!b.mission.flags.becameSaiyaman, errors: gg.errors.length };
      b.dispose();
      return out;
    };
    const watched = run(false), skipped = run(true);
    eq(JSON.stringify(skipped), JSON.stringify(watched), 'same state');
    ok(watched.gohanHidden && !watched.saiyamanHidden && watched.flag, 'the hero is out, the student is not');
    eq(watched.errors, 0, 'no engine errors');
  });

  test('"The Great Saiyaman": robbers are knocked out rather than killed, a hurt bystander fails the objective that matters, and Videl\'s test is pulled punches', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    // the robbery, cleared by the bot
    const r = gg.playMission('buu_saiyaman', { maxSeconds: 300 });
    eq(r.state, 'success', 'mission state');
    const S = r.b.story;
    eq(r.m.flags.robbersStopped, 4, 'four robbers stopped');
    ok(S.thugs.every((t) => t.alive && t.untargetable), 'every one of them alive, out of the fight');
    ok(S.videl.alive, 'Videl is still standing somewhere');
    eq(r.m.flags.sparHits, 3, 'the spar ended on three clean hits');
    ok(S.saiyaman.damageDealtMul === 1 && !(S.saiyaman.lockedSlots && S.saiyaman.lockedSlots.special1), 'his restraint is lifted after the test');
    // the bystander rule, forced
    const b = gg.mission('buu_saiyaman', { startPhase: phaseAt(SL, 'buu_saiyaman', 'stop') });
    gg.until(b, () => b.player === b.story.saiyaman && !b.inputLocked, 60 * 30, skipAll(b));
    gg.step(b, 10);
    const civ = b.story.civilians[0], s = b.story.saiyaman;
    civ.takeHit(s, { type: 'melee', damage: 50, knock: 'flinch', hitstun: 6, impact: 1, dir: civ.forward.clone() });
    for (const t of b.story.thugs) t.hp = t.hpMax * 0.1;
    gg.step(b, 30);
    const nobody = b.mission.objectives.find((o) => o.id === 'nobody');
    ok(nobody && nobody.failed, 'a hurt civilian fails "Nobody on the pavement gets hurt"');
    ok(civ.alive, 'and the civilian survives it');
    // the spar: she cannot be knocked out, and his specials are off
    const b2 = gg.mission('buu_saiyaman', { startPhase: phaseAt(SL, 'buu_saiyaman', 'spar') });
    gg.until(b2, () => b2.player === b2.story.saiyaman && !b2.inputLocked, 60 * 30, skipAll(b2));
    gg.step(b2, 5);
    const s2 = b2.story.saiyaman, v = b2.story.videl;
    ok(s2.lockedSlots.special1 && s2.lockedSlots.ultimate, 'no specials in a test of restraint');
    ok(v.cannotDie && !v.untargetable && !v.hidden, 'Videl is in the fight and cannot be killed by it');
    s2.ki = s2.kiMax;
    eq(s2._trySpecial('ultimate'), false, 'pressing the ultimate does nothing');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Two Children": Super Saiyan is locked until the story opens it, both children earn it on screen, and the rematch checkpoint hands it back', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = gg.mission('buu_kids', { startPhase: phaseAt(SL, 'buu_kids', 'spar') });
    gg.until(b, () => b.player === b.story.goten && !b.inputLocked, 60 * 30, skipAll(b));
    gg.step(b, 5);
    const g = b.story.goten;
    ok(g.lockedForms && g.lockedForms.ssj, 'the first spar is in base form');
    g.ki = g.kiMax;
    eq(g._tryTransform(), false, 'and the transform button does not open it early');
    eq(g.form.id, 'base', 'still base');
    b.dispose();
    // a bot plays it through: two transformations, both children end the fights alive
    let atRematch = null;
    const r = gg.playMission('buu_kids', {
      maxSeconds: 400,
      // what the ascension left behind, read the moment the next stretch begins (watched or skipped, the same)
      onBattle: (bb) => bb.on('missionPhase', (e) => {
        if (e.phase.id === 'rematch' && !atRematch) atRematch = { goten: bb.story.goten.form.id, trunks: bb.story.trunks.form.id, gotenLocked: !!(bb.story.goten.lockedForms && bb.story.goten.lockedForms.ssj) };
      }),
    });
    eq(r.state, 'success', 'mission state');
    ok(r.m.flags.kidsAscended && r.m.flags.rematchWon, 'flags');
    ok(atRematch && atRematch.goten === 'ssj' && atRematch.trunks === 'ssj', 'both children come out of the ascension as Super Saiyans: ' + JSON.stringify(atRematch));
    ok(atRematch && !atRematch.gotenLocked, 'and the form is his from then on');
    ok(r.b.story.goten.alive && r.b.story.trunks.alive, 'nobody is hurt in a game');
    // the rematch checkpoint stages both of them as Super Saiyans
    const b2 = gg.mission('buu_kids', { startPhase: phaseAt(SL, 'buu_kids', 'rematch') });
    gg.until(b2, () => b2.player === b2.story.goten && !b2.inputLocked, 60 * 30, skipAll(b2));
    gg.step(b2, 5);
    eq(b2.story.goten.form.id, 'ssj', 'Goten resumes as a Super Saiyan');
    eq(b2.story.trunks.form.id, 'ssj', 'and so does Trunks');
    ok(b2.story.trunks.controller instanceof SL.AIController, 'with a brain');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('every Milestone A checkpoint resumes in its own stretch with a live, controllable hero in the right form', () => {
    const gg = H.create({ quiet: true, seed: 8 });
    const { SL } = gg;
    const want = {
      buu_years: { flight: ['adult_gohan', 'base'] },
      buu_saiyaman: { stop: ['great_saiyaman', 'base'], spar: ['great_saiyaman', 'base'] },
      buu_kids: { spar: ['goten', 'base'], rematch: ['goten', 'ssj'] },
    };
    for (const [mission, phases] of Object.entries(want)) {
      for (const [ph, [hero, form]] of Object.entries(phases)) {
        const b = gg.mission(mission, { startPhase: phaseAt(SL, mission, ph) });
        ok(b.player && b.player.alive, mission + '@' + ph + ': a live player from the first frame');
        gg.until(b, () => !b.inputLocked && b.player.def.id === hero, 60 * 30, skipAll(b));
        gg.step(b, 10);
        eq(phaseId(b), ph, mission + '@' + ph + ': resumes in its own stretch');
        eq(b.player.def.id, hero, mission + '@' + ph + ': hero');
        eq(b.player.form.id, form, mission + '@' + ph + ': form');
        ok(b.player.controller instanceof SL.PlayerController, mission + '@' + ph + ': the player drives');
        ok(!b.player.hidden && !b.player.untargetable, mission + '@' + ph + ': on the field');
        b.dispose();
      }
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
