// The 25th World Tournament, rebuilt from the owner's Buu Saga references (2026-09-25): Goku's day
// back and the son he never met, the junior final played beat by beat (the pact, one hand behind
// the back, the sleeper hold, Goten's gold, the second hand, the ring-out), Spopovich's neck and
// Yamu calling him off, Gohan's Super Saiyan 2 and the siphon, and Vegeta's point-blank finish on
// Pui Pui. Behaviour on the real engine, headless: every check reads bodies, positions, forms and
// the running mission, not ids alone.
const H = require('./headless');

module.exports = function buuTournamentTests({ test, eq, ok }) {
  console.log('\nThe 25th World Tournament, reference pass (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  function at(gg, id, phase, who) {
    const b = gg.mission(id, { startPhase: phaseAt(gg.SL, id, phase) });
    gg.until(b, () => phaseId(b) === phase && !b.inputLocked && (!who || b.player === b.story[who]), 60 * 60, skipAll(b));
    gg.step(b, 20);
    return b;
  }
  /** Where a joint is, in the fighter's own frame: +z in front of the chest, +x to his left. */
  function local(f, joint) {
    f.model.root.updateMatrixWorld(true);
    const V3 = f.pos.constructor;
    const p = f.model.joints[joint].getWorldPosition(new V3()).sub(f.object.position).add(f.pos).sub(f.chest());
    const fwd = f.forward.clone().setY(0).normalize();
    const left = new V3(fwd.z, 0, -fwd.x);
    return { z: p.dot(fwd), x: p.dot(left), y: p.y };
  }
  /** How far the head is turned from the body: 1 = facing the same way, -1 = all the way round. */
  function headFacing(f) {
    f.model.root.updateMatrixWorld(true);
    const V3 = f.pos.constructor;
    const q = f.model.joints.head.getWorldQuaternion(new f.model.joints.head.quaternion.constructor());
    const hf = new V3(0, 0, 1).applyQuaternion(q).setY(0).normalize();
    return hf.dot(f.forward.clone().setY(0).normalize());
  }

  test('the one-hand rule is a real rule: the left arm stays behind his back through every attack, and he hits softer until it comes out', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'kid_trunks', p2: 'goten' });
    const t = b.player;
    SL.data.juniorFinal.oneArm(t, true);
    let front = 0, behind = 0;
    t.controller = gg.script(b, (n) => (n % 12 === 0 ? { light: true } : n % 50 === 0 ? { heavy: true } : {}));
    // (the first frames are the arm blending round from his guard to behind his back)
    gg.step(b, 20);
    gg.step(b, 150, () => {
      const h = local(t, 'handL');
      if (h.z > 0.02) front++;
      else if (h.z < -0.02) behind++;
    });
    eq(front, 0, 'the left hand never comes in front of him while the rule holds (behind on ' + behind + ' frames)');
    ok(behind > 100, 'it is held behind his back');
    ok(t.damageDealtMul < 1, 'one hand hits softer: ' + t.damageDealtMul);
    SL.data.juniorFinal.oneArm(t, false);
    t.controller = gg.script(b, () => ({}));
    gg.step(b, 40);
    ok(local(t, 'handL').z > 0, 'released, the left fist is back in his guard in front of him');
    eq(t.damageDealtMul, 1, 'and his damage is his own again');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('two different children: Goten\'s Turtle School stance (open lead hand) and Trunks\' own (the other lead, fists) are not the same body language', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const C = gg.SL.data.characters;
    const g = C.goten.poses.idle(0.3), t = C.kid_trunks.poses.idle(0.3);
    eq(g.hands.join('/'), 'open/fist', 'Goten leads with an open hand');
    eq(t.hands.join('/'), 'fist/fist', 'Trunks keeps both fists');
    ok(Math.sign(g.hips[1]) !== Math.sign(t.hips[1]), 'they lead with opposite sides: hips ' + g.hips[1] + ' vs ' + t.hips[1]);
    for (const k of ['gt_shy', 'gt_leap', 'gt_hug', 'gt_choked', 'gt_rush', 'gt_sit']) ok(C.goten.poses[k], 'Goten has ' + k);
    for (const k of ['kt_sleeper', 'kt_twoHands']) ok(C.kid_trunks.poses[k], 'Trunks has ' + k);
  });

  test('Goku\'s one day back: Chi-Chi, a boy hiding behind her, his father on one knee, the jump into his arms — watched, not told', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const b = gg.mission('buu_junior', {});
    const S = b.story;
    const gotenPoses = new Set(), gokuPoses = new Set();
    let hugNear = Infinity, chichiSeen = false;
    gg.until(b, () => phaseId(b) !== 'open', 60 * 60, () => {
      gotenPoses.add(S.goten.anim.name);
      gokuPoses.add(S.goku.anim.name);
      if (!S.chichi.hidden) chichiSeen = true;
      if (S.goten.anim.name === 'gt_hug') hugNear = Math.min(hugNear, S.goten.chest().distanceTo(S.goku.chest()));
    });
    for (const k of ['gt_shy', 'gt_leap', 'gt_hug']) ok(gotenPoses.has(k), 'Goten ' + k + ' (' + [...gotenPoses].join(',') + ')');
    ok(gokuPoses.has('g_kneelOpen') && gokuPoses.has('g_holdKid'), 'Goku kneels, then holds him: ' + [...gokuPoses].join(','));
    ok(chichiSeen, 'Chi-Chi is there');
    ok(hugNear < 0.8, 'in his arms, not beside him: ' + hugNear.toFixed(2) + ' m chest to chest');
    ok(S.gokuHalo, 'the halo of the dead over Goku\'s head');
    ok(b.mission.flags.gotenMetGoku, 'flag');
    ok(!S.goten.grounded || S.goten.pos.y - b.stage.heightAt(S.goten.pos.x, S.goten.pos.z) < 0.2, 'and back on his own feet afterwards');
    eq([...new Set(gg.warnings)].join(' | '), '', 'no missing pose');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the junior final keeps its pact: no Super Saiyan for either boy until Goten breaks it, and Trunks fights with one hand', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = at(gg, 'buu_junior', 'final', 'trunks');
    const S = b.story, t = S.trunks, g = S.goten;
    ok(b.mission.flags.pact, 'the pact scene played');
    ok(t.oneArmed && t.anim.override, 'Trunks has one hand behind his back');
    ok(t.lockedForms.ssj && g.lockedForms.ssj, 'Super Saiyan is off the table for both');
    ok(b.rules.ringOut && b.rules.ringOut.fighters.includes(t) && !b.rules.ringOut.fighters.includes(g), 'Trunks can be rung out; Goten flies back in until the finish');
    // pressing Transform does nothing while the pact holds
    t.controller = gg.script(b, (n) => (n % 20 === 0 ? { transform: true } : {}));
    let gotenGold = false;
    gg.step(b, 240, () => {
      if (g.formIndex !== 0) gotenGold = true;
    });
    eq(t.formIndex, 0, 'Trunks cannot transform');
    ok(!gotenGold, 'and neither does Goten');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the junior final, played: the sleeper hold, Goten goes gold to get out, Trunks answers, the second hand, and a ring-out the engine calls', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const seen = { hold: null, holdGap: null, gotenGoldFirst: null, second: null, ringOuts: [], ends: [] };
    const r = gg.playMission('buu_junior', {
      startPhase: phaseAt(SL, 'buu_junior', 'final'), maxSeconds: 400,
      onBattle: (b) => {
        const S = b.story;
        b.on('cueDone', (e) => {
          if (e.key === 'heavy') {
            seen.hold = { gotenForm: S.goten.formIndex };
            // the next frame puts him behind Goten
            b.onTick(() => {
              seen.holdGap = S.trunks.pos.distanceTo(S.goten.pos);
              seen.holdFacing = S.trunks.forward.dot(S.goten.forward);
              seen.holdBehind = S.goten.forward.dot(S.trunks.pos.clone().sub(S.goten.pos));
              return false;
            });
          }
        });
        b.on('skillLearned', (e) => {
          if (e.fighter === S.trunks && e.key === 'form:ssj') seen.gotenGoldFirst = S.goten.form.id === 'ssj' && S.trunks.formIndex === 0;
        });
        b.on('secondHand', () => (seen.second = { oneArmed: S.trunks.oneArmed, trunksForm: S.trunks.form.id, gotenForm: S.goten.form.id }));
        // the final only (the exhibition afterwards has ring-outs of its own)
        b.on('ringOut', (e) => ['final', 'hold', 'gold', 'finish'].includes(b.mission.def.phases[b.mission.phaseIndex].id) && seen.ringOuts.push(e.fighter.def.id));
        b.on('matchEnd', (e) => seen.ends.push([e.winner.def.id, e.loser.def.id, e.how]));
      },
    });
    eq(r.state, 'success', 'mission state');
    ok(seen.hold && seen.hold.gotenForm === 0, 'Goten is still in his base form when the hold goes on');
    ok(seen.holdGap < 0.9 && seen.holdFacing > 0.8 && seen.holdBehind < 0, 'Trunks is right behind him, facing the same way: ' + JSON.stringify({ gap: seen.holdGap, facing: seen.holdFacing, behind: seen.holdBehind }));
    ok(r.m.flags.holdDamage > 0, 'the hold takes something out of him: ' + r.m.flags.holdDamage);
    eq(seen.gotenGoldFirst, true, 'Goten breaks the pact first; Trunks is handed his gold after');
    ok(seen.second && seen.second.oneArmed === false, 'the second hand is out for the finish');
    eq(seen.second && seen.second.trunksForm + '/' + seen.second.gotenForm, 'ssj/ssj', 'gold against gold at the end');
    eq(seen.ringOuts.join(','), 'goten', 'the engine calls the ring-out, and only on Goten');
    const fin = seen.ends.find((e) => e[1] === 'goten');
    eq(fin && fin.join(','), 'kid_trunks,goten,ringout', 'the final is Trunks over Goten by ring-out');
    const A = r.b.stage.arena;
    ok(!A.onRing(r.b.story.goten.pos.x, r.b.story.goten.pos.z), 'Goten is off the ring');
    eq(r.b.story.bracket.champion, 'kid_trunks', 'champion');
    ok(r.m.flags.twoHandsArgued, 'and they argue about it afterwards');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('ring-outs cut both ways: Trunks landing outside the ring loses the final; Goten knocked out before the finish is back on it', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL, V3 } = gg;
    let b = at(gg, 'buu_junior', 'final', 'trunks');
    const A = b.stage.arena;
    let g = b.story.goten;
    g.setPosition(new V3(0, b.stage.heightAt(0, A.half + 3), A.half + 3));
    g.grounded = true;
    gg.step(b, 3);
    ok(A.onRing(g.pos.x, g.pos.z), 'Goten is put back on the ring (he flies)');
    eq(b.mission.state, 'running', 'and the final goes on');
    b.dispose();
    b = at(gg, 'buu_junior', 'final', 'trunks');
    const t = b.story.trunks;
    let reason = null;
    b.on('missionFailed', (e) => (reason = e.reason));
    t.controller = gg.script(b, () => ({}));
    t.setPosition(new V3(A.half + 3, b.stage.heightAt(A.half + 3, 0), 0));
    t.grounded = true;
    gg.until(b, () => b.mission.state !== 'running', 600);
    eq(b.mission.state, 'failed', 'Trunks out of the ring fails the mission');
    ok(/rung out/.test(reason || ''), 'and says why: ' + reason);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Spopovich is not normal: the Eagle Kick turns his head all the way round, the stadium gasps, and his own hands turn it back', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const b = at(gg, 'buu_spopovich', 'match', 'videl');
    const S = b.story, sp = S.spopovich, v = S.videl;
    // she has him at the edge of going down: the story's beat (a skip left over from reaching the
    // checkpoint must not answer the cue for the player)
    b.skipRequested = false;
    sp.hp = sp.hpMax * 0.69;
    let minFace = 1, gasp = 0, cue = null;
    const shotsAfter = [];
    b.on('cueDone', (e) => (cue = e));
    // the player presses Ultimate when the cue asks
    v.controller = { update: () => Object.assign(gg.SL.emptyIntent(), b.cue ? { ult: true, ultHeld: true } : {}) };
    gg.until(b, () => b.mission.flags.sawNeck, 60 * 40, () => {
      if (b.stage.crowd) gasp = Math.max(gasp, b.stage.crowd.gasp || 0);
      if (sp.anim.name === 'sp_neckBack') minFace = Math.min(minFace, headFacing(sp));
    });
    ok(cue && cue.key === 'ult' && cue.pressed, 'the kick is the player\'s: a cue on Ultimate, pressed');
    ok(minFace < -0.5, 'his head faced backwards: ' + minFace.toFixed(2));
    ok(gasp > 0.5, 'the crowd gasped: ' + gasp.toFixed(2));
    gg.step(b, 30);
    ok(headFacing(sp) > 0.8, 'and it faces the right way again');
    ok(sp.hpFrac > 0.95, 'he is whole');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('after the neck, Videl runs out: the guard sags, the stamina shrinks with her, and Gohan and Krillin say it from outside the ring', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = at(gg, 'buu_spopovich', 'match', 'videl');
    const S = b.story, sp = S.spopovich, v = S.videl;
    const says = [];
    b.on('say', (e) => says.push(e.speakerId));
    sp.hp = sp.hpMax * 0.69;
    gg.until(b, () => b.mission.flags.sawNeck && !b.inputLocked, 60 * 60, skipAll(b));
    ok(v.poses.idle !== v.poses.vd_tired, 'not tired yet');
    v.hp = v.hpMax * 0.38;
    v.controller = gg.script(b, () => ({}));
    let exhausted = false;
    b.on('videlExhausted', () => (exhausted = true));
    gg.step(b, 30);
    ok(exhausted && v.poses.idle === v.poses.vd_tired, 'the tired guard replaces her stance');
    ok(v.stamina <= v.staminaMax * (0.3 + 0.6 * 0.38) + 0.5, 'her stamina is capped by what she has left: ' + Math.round(v.stamina) + '/' + v.staminaMax);
    ok(says.includes('adult_gohan') && says.includes('krillin'), 'Gohan and Krillin react: ' + says.join(','));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the cruelty, watched: he kneels on her, Gohan sets foot on the ring, and Yamu calls him off before he throws her out', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const b = at(gg, 'buu_spopovich', 'match', 'videl');
    const S = b.story, v = S.videl, gh = S.gohan, A = b.stage.arena;
    const says = [];
    b.on('say', (e) => says.push(e.speakerId));
    // skip to the end of the match, then watch the scene in full
    b.mission.flags.sawNeck = true;
    S.spopovich.hp = S.spopovich.hpMax;
    v.hp = v.hpMax * 0.29;
    let pinned = false, gohanOnRing = false;
    gg.until(b, () => phaseId(b) === 'after', 60 * 60, () => {
      if (S.spopovich.anim.name === 'sp_pin' && S.spopovich.pos.distanceTo(v.pos) < 3) pinned = true;
      if (A.onRing(gh.pos.x, gh.pos.z) && Math.abs(gh.pos.y - A.y) < 0.2) gohanOnRing = true;
    });
    ok(pinned, 'he kneels on her');
    ok(gohanOnRing, 'Gohan steps onto the ring');
    ok(says.indexOf('yamu') > says.indexOf('adult_gohan'), 'Yamu calls him off after Gohan moves: ' + says.join(','));
    ok(b.mission.flags.yamuCalledOff && b.mission.flags.spopovichWon, 'flags');
    ok(!A.onRing(v.pos.x, v.pos.z), 'and she ends outside the ring');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Show me everything": Gohan holds Charge through Super Saiyan to Super Saiyan 2; the stadium answers', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const b = at(gg, 'buu_kibito', 'power', 'gohan');
    const g = b.story.gohan;
    const forms = [];
    let gasp = 0;
    // a player who never presses Charge gets nowhere
    g.controller = gg.script(b, () => ({}));
    gg.step(b, 180);
    eq(g.formIndex, 0, 'no charge, no transformation');
    g.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.until(b, () => g.form.id === 'ssj2' && g.state !== 'transform', 60 * 30, () => {
      if (!forms.length || forms[forms.length - 1] !== g.form.id) forms.push(g.form.id);
      if (b.stage.crowd) gasp = Math.max(gasp, b.stage.crowd.gasp || 0);
    });
    eq(forms.join('>'), 'base>ssj>ssj2', 'through the first gold to the second');
    ok(gasp > 0.5, 'the crowd recoils: ' + gasp.toFixed(2));
    ok(g.form.aura && g.form.aura.lightning, 'with the lightning of Super Saiyan 2');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the siphon: Kibito freezes him, Spopovich pins him, and the canister fills while Super Saiyan 2 gives way to 1 and then to nothing', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const b = gg.mission('buu_kibito', { startPhase: phaseAt(SL, 'buu_kibito', 'ambush') });
    const S = b.story, g = S.gohan;
    const steps = [], auras = [];
    let fillMid = null, start = null, frozenPose = false, moved = 0;
    b.on('drainStep', (e) => steps.push(e.form));
    // the player mashes and pushes the stick the whole time: nothing moves him
    g.controller = { update: (f) => Object.assign(SL.emptyIntent(), { my: 1, mx: 1, light: b.frame % 3 === 0 }) };
    SL.Input.pressed = (a) => a === 'light' && b.frame % 3 === 0;
    gg.until(b, () => b.mission.flags.drained, 60 * 60, () => {
      if (g.anim.name === 'ag_frozen') frozenPose = true;
      if (b.mission.struggling) {
        if (!start) start = g.pos.clone();
        moved = Math.max(moved, g.pos.distanceTo(start));
        if (b.frame % 30 === 0) auras.push(g.sd.aura);
        const pr = S.yamu.model.props.siphon;
        if (pr && steps.length === 1 && fillMid === null) fillMid = pr.userData.fill.scale.y;
      }
    });
    SL.Input.pressed = () => false;
    ok(frozenPose, 'Kibito\'s hand holds him first (frozen)');
    ok(moved < 0.05, 'held in place through the drain, whatever the player presses: ' + moved.toFixed(3) + ' m');
    eq(steps.join('>'), 'ssj>base', 'the forms drain away in order');
    ok(S.yamu.model.props.siphon, 'Yamu holds the siphon');
    ok(fillMid > 0.3 && fillMid < 0.9, 'half-way the glass is part full: ' + fillMid);
    ok(S.yamu.model.props.siphon.userData.fill.scale.y >= 0.99, 'and it leaves full');
    ok(auras.length > 3 && auras[auras.length - 1] < auras[0] * 0.3, 'his aura dies with it: ' + auras.map((a) => a.toFixed(2)).join(','));
    ok(g.ki < g.kiMax * 0.05, 'nothing left: ' + g.ki.toFixed(1));
    eq(g.formIndex, 0, 'base form');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Planet Zoon: Vegeta never transforms, closes the distance and fires with both palms on Pui Pui\'s chest; nothing is left', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    let atBlast = null, everGold = false;
    const r = gg.playMission('buu_puipui', {
      maxSeconds: 300, watch: true,
      onBattle: (b) => {
        b.on('puipuiVaporized', () => {
          const v = b.story.vegeta, p = b.story.puipui;
          atBlast = { gap: v.pos.distanceTo(p.pos), pose: v.anim.name, hands: local(v, 'handL').z > 0.2 && local(v, 'handR').z > 0.2 };
        });
        b.on('transformBurst', (e) => e.fighter === b.story.vegeta && (everGold = true));
      },
    });
    eq(r.state, 'success', 'mission state');
    ok(atBlast && atBlast.gap < 1.3, 'point blank: ' + (atBlast && atBlast.gap.toFixed(2)) + ' m');
    ok(atBlast && atBlast.pose === 'v_twoPalms' && atBlast.hands, 'both palms out in front of him: ' + JSON.stringify(atBlast));
    ok(!everGold && r.b.story.vegeta.formIndex === 0, 'no Super Saiyan');
    const p = r.b.story.puipui;
    ok(p.hidden && !p.alive, 'Pui Pui is gone');
    eq([...new Set(gg.warnings)].join(' | '), '', 'no missing pose');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the stadium gasps: the crowd rises and leans back from the ring, and settles again', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ stage: 'tournament' });
    const C = b.stage.crowd, THREE = gg.THREE;
    const m4 = new THREE.Matrix4(), pos = new THREE.Vector3();
    const headDist = () => {
      let d = 0;
      for (const p of C.people.slice(0, 40)) {
        C.heads.getMatrixAt(p.head, m4);
        pos.setFromMatrixPosition(m4);
        d += Math.hypot(pos.x, pos.z) + pos.y;
      }
      return d;
    };
    gg.step(b, 5);
    const d0 = headDist();
    b.stage.gasp(1);
    gg.step(b, 10);
    ok(headDist() > d0 + 5, 'heads up and back from the ring');
    gg.step(b, 60 * 6);
    ok(Math.abs(headDist() - d0) < 1, 'and back in their seats');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
