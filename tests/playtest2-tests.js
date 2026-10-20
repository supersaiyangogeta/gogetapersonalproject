// Human playtest round 2 (2026-09-18): the owner played to Frieza vs Nail. Charge audio that never
// stopped, the lock-on hint shown on every lock, mission completion dropping the player at the
// top of the story list, and the Namek story beats that were told instead of shown. Every test
// here drives the real engine headless (tests/headless.js).
const H = require('./headless');

module.exports = function playtest2Tests({ test, eq, ok }) {
  console.log('\nHuman playtest round 2: audio lifecycle, hints, navigation, Namek staging (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;

  /* ------------------------------------------------------------ charge audio lifecycle */

  /** Loops still alive that a battle owns (menu loops excluded). */
  const gameLoops = (SL) => SL.Audio.liveLoops((h) => !h.ui);

  test('charge audio: a ki charge starts one loop and releasing the charge ends it (found by the owner: the roar never stopped)', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    SL.Audio.stopLoops(0);
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const p = b.player;
    let charging = true;
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: charging }) };
    gg.step(b, 30);
    eq(p.state, 'charge', 'charging');
    eq(gameLoops(SL).length, 1, 'one loop while charging');
    ok(p.loops.aura && !p.loops.aura.stopped, 'the aura loop is owned by the fighter');
    charging = false;
    gg.step(b, 3);
    ok(p.state !== 'charge', 'released');
    eq(gameLoops(SL).length, 0, 'released: no loop left');
    ok(!p.loops.aura, 'and the fighter holds no handle');
    // again, ten times: no accumulation
    for (let i = 0; i < 10; i++) {
      charging = true;
      gg.step(b, 12);
      charging = false;
      gg.step(b, 3);
    }
    eq(gameLoops(SL).length, 0, 'ten charges later, still nothing left');
    b.dispose();
  });

  test('charge audio: every way out of a charge ends its loop — hit, knocked down, transformation, beam charge cancelled, knockout, scene, player switch', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL, V3 } = gg;
    const start = (o) => {
      SL.Audio.stopLoops(0);
      const b = gg.battle(Object.assign({ p1: 'goku', p2: 'vegeta' }, o || {}));
      return b;
    };
    const holdCharge = (b, f) => (f.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) });

    // hit out of it
    let b = start();
    holdCharge(b, b.player);
    gg.step(b, 20);
    eq(gameLoops(SL).length, 1, 'hit: charging');
    b.player.takeHit(b.fighters[1], { type: 'melee', damage: 200, knock: 'light', hitstun: 20, impact: 1, dir: new V3(1, 0, 0) });
    gg.step(b, 2);
    eq(gameLoops(SL).length, 0, 'hit: the charge loop ended with the stagger');
    b.dispose();

    // knocked down
    b = start();
    holdCharge(b, b.player);
    gg.step(b, 20);
    b.player.takeHit(b.fighters[1], { type: 'melee', damage: 400, knock: 'heavy', knockSpeed: 20, hitstun: 40, impact: 3, dir: new V3(1, 0, 0) });
    gg.step(b, 2);
    eq(gameLoops(SL).length, 0, 'knockdown: ended');
    b.dispose();

    // a beam charge that is cancelled by a hit
    b = start();
    b.player.ki = 100;
    let n = 0;
    b.player.controller = { update: () => Object.assign(SL.emptyIntent(), { s1: ++n === 1, s1Held: true }) };
    gg.until(b, () => b.player.state === 'beamCharge', 60);
    gg.step(b, 10);
    ok(gameLoops(SL).some((h) => h.name === 'beamCharge'), 'beam charge: a beam charge loop');
    b.player.takeHit(b.fighters[1], { type: 'melee', damage: 200, knock: 'light', hitstun: 20, impact: 1, dir: new V3(1, 0, 0) });
    gg.step(b, 2);
    ok(!gameLoops(SL).some((h) => h.name === 'beamCharge'), 'beam charge: cancelled by the hit, its loop is gone');
    b.dispose();

    // charge into a transformation and out again
    b = start();
    b.player.ki = 100;
    let m = 0;
    b.player.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: m < 20, transform: ++m === 20 }) };
    gg.until(b, () => b.player.state === 'transform' || b.player.state === 'transformSequence', 60);
    ok(b.player.state.startsWith('transform'), 'transformation: started from a charge');
    gg.until(b, () => b.player.state === 'free', 60 * 20);
    gg.step(b, 2);
    eq(gameLoops(SL).length, 0, 'transformation: its loop ends with it');
    b.dispose();

    // knockout while charging
    b = start({ p1CannotDie: false });
    holdCharge(b, b.player);
    gg.step(b, 20);
    b.player.hp = 1;
    b.player.cannotDie = false;
    b.player.takeHit(b.fighters[1], { type: 'melee', damage: 5000, knock: 'heavy', hitstun: 40, impact: 3, dir: new V3(1, 0, 0) });
    gg.step(b, 2);
    eq(gameLoops(SL).length, 0, 'knockout: ended');
    b.dispose();

    // a scene takes the actor
    b = start();
    holdCharge(b, b.player);
    gg.step(b, 20);
    b.player.controller = { update: () => SL.emptyIntent() };
    b.player.setState('scripted', { pose: 'stand' });
    gg.step(b, 2);
    eq(gameLoops(SL).length, 0, 'scene: a scripted actor holds no charge loop');
    b.dispose();

    // the player switches hero in the middle of a charge
    b = start();
    holdCharge(b, b.player);
    gg.step(b, 20);
    const ally = b.fighters[1];
    ally.team = b.player.team;
    b.setParty([b.player, ally]);
    const was = b.player;
    ok(b.switchPlayer(ally, { force: true }), 'switch: accepted');
    gg.step(b, 2);
    ok(was.state !== 'charge' && !was.loops.aura, 'switch: the hero left behind stops charging');
    eq(gameLoops(SL).length, 0, 'switch: no loop left behind');
    b.dispose();

    // a CPU fighter charging stops when it stops
    b = start();
    holdCharge(b, b.fighters[1]);
    gg.step(b, 20);
    eq(gameLoops(SL).length, 1, 'CPU charge: one loop');
    b.fighters[1].controller = { update: () => SL.emptyIntent() };
    gg.step(b, 3);
    eq(gameLoops(SL).length, 0, 'CPU charge: released, ended');
    b.dispose();
    eq(gameLoops(SL).length, 0, 'teardown leaves nothing');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('charge audio: pausing mutes held loops and resuming restores them; a battle torn down mid-charge leaves nothing', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    SL.Audio.stopLoops(0);
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    b.player.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.step(b, 20);
    b.pause();
    ok(SL.Audio.loopsMuted, 'paused: loops muted');
    b.resume();
    ok(!SL.Audio.loopsMuted, 'resumed: loops back');
    eq(gameLoops(SL).length, 1, 'the held charge is still one loop');
    b.dispose();
    eq(gameLoops(SL).length, 0, 'disposed mid-charge: nothing left');
  });

  test('mission end: completing a mission silences every charge, aura and beam loop and new battle sounds, so the Mission Complete music plays alone', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    SL.Audio.stopLoops(0);
    const b = gg.mission('saiyan_kingkai');
    gg.until(b, () => !b.inputLocked, 60 * 60, skipAll(b));
    const p = b.player;
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.step(b, 20);
    ok(gameLoops(SL).length >= 1, 'charging before the end: ' + gameLoops(SL).length);
    // a beam in flight as well
    const foe = b.fighters.find((f) => f.team !== p.team) || p;
    const spec = { name: 'Test Beam', color: 0xffffff, damage: 100, radius: [1, 1], speed: 30, range: 40, sustain: 60 };
    try {
      b.projectiles.spawnBeam(foe, spec, 1);
    } catch (e) {
      /* the beam API differs per build; the charge is enough */
    }
    let ended = null;
    b.on('missionComplete', (r) => (ended = r));
    b.mission.succeed();
    ok(ended, 'the mission completed');
    eq(gameLoops(SL).length, 0, 'no loop survives the completion');
    // the fighter keeps its state behind the results screen, but nothing new starts
    gg.step(b, 30);
    eq(gameLoops(SL).length, 0, 'thirty frames later behind the results: still silent');
    ok(b.sfxSilenced, 'battle one-shots are off too');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ the lock-on lesson */

  /** Load UI scripts into a headless context (they are skipped by default). */
  const loadUI = (gg, files) => {
    const fs = require('fs'), vm = require('vm'), path = require('path');
    for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), gg.ctx, { filename: f });
  };

  test('lock-on hint: taught once (lock → Tab free → Tab lock), saved, and never shown again — in this fight or the next (owner: annoying when it appears constantly)', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    loadUI(gg, ['src/ui/ui.js', 'src/ui/hud.js']);
    const { SL } = gg;
    SL.Save.data.seen.prompts = {};
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const HUD = SL.HUD;
    HUD.battle = b;
    HUD.aimChip = { style: { opacity: 0 }, innerHTML: '' };
    HUD.lockLesson = null;
    HUD.aimSig = '';
    const p = b.player, foe = b.fighters[1];
    const tick = (lt, n = 1) => {
      for (let i = 0; i < n; i++) {
        gg.step(b, 1);
        HUD._updateAimChip(p, lt, true);
      }
    };
    p.lockMode = 'locked';
    tick(foe, 10);
    ok(+HUD.aimChip.style.opacity > 0.5 && /TARGET LOCKED/.test(HUD.aimChip.innerHTML), 'first lock: the chip teaches Tab — ' + HUD.aimChip.innerHTML);
    p.lockMode = 'free';
    tick(null, 10);
    ok(+HUD.aimChip.style.opacity > 0.5 && /FREE CAMERA/.test(HUD.aimChip.innerHTML), 'after Tab: the free-camera half of the lesson');
    p.lockMode = 'locked';
    tick(foe, 3);
    ok(SL.Save.data.seen.prompts.lockOnHint === true, 'locked again: the lesson is marked learned');
    ok(/lockOnHint/.test(gg.ctx.localStorage.getItem(SL.Save.KEY) || ''), 'and written to the save, so it survives missions and restarts');
    tick(foe, 120);
    eq(+HUD.aimChip.style.opacity, 0, 'two seconds later the chip is gone');
    // toggling again, many times, in this fight: nothing
    for (let i = 0; i < 6; i++) {
      p.lockMode = i % 2 ? 'locked' : 'free';
      tick(i % 2 ? foe : null, 20);
      eq(+HUD.aimChip.style.opacity, 0, 'toggle ' + (i + 1) + ' after learning: no chip');
    }
    // the next mission: a fresh HUD lesson state, the saved flag still holds
    HUD.lockLesson = null;
    HUD.aimSig = '';
    p.lockMode = 'locked';
    tick(foe, 30);
    eq(+HUD.aimChip.style.opacity, 0, 'next fight: never again');
    // resetting the control hints brings it back
    SL.Save.data.seen.prompts = {};
    HUD.lockLesson = null;
    HUD.aimSig = '';
    tick(foe, 10);
    ok(+HUD.aimChip.style.opacity > 0.5, 'hints reset: the lesson returns');
    b.dispose();
  });

  test('lock-on hint: a player who never presses Tab sees it for 20 seconds once, then never again', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    loadUI(gg, ['src/ui/ui.js', 'src/ui/hud.js']);
    const { SL } = gg;
    SL.Save.data.seen.prompts = {};
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const HUD = SL.HUD;
    HUD.battle = b;
    HUD.aimChip = { style: { opacity: 0 }, innerHTML: '' };
    HUD.lockLesson = null;
    HUD.aimSig = '';
    const p = b.player, foe = b.fighters[1];
    let visible = 0;
    for (let i = 0; i < 60 * 30; i++) {
      gg.step(b, 1);
      HUD._updateAimChip(p, foe, true);
      if (+HUD.aimChip.style.opacity > 0) visible++;
    }
    ok(visible > 60 * 19 && visible < 60 * 23, 'visible about 20 s: ' + (visible / 60).toFixed(1) + ' s');
    ok(SL.Save.data.seen.prompts.lockOnHint, 'then retired for good');
    b.dispose();
  });

  /* ------------------------------------------------------------ mission completion navigation */

  test('navigation: finishing a mission returns to its chapter — on the mission it unlocked, the finished one marked — not to the Prologue (owner, playtest round 2)', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    loadUI(gg, ['src/ui/ui.js', 'src/ui/screens_menu.js']);
    const { SL } = gg;
    const order = SL.data.storyOrder();
    // a save that has played in order up to and including "The Warrior" (Frieza vs Nail)
    const upTo = order.indexOf('namek_nail');
    ok(upTo > 10, 'the Warrior is deep in the story: index ' + upTo);
    for (let i = 0; i <= upTo; i++) SL.Save.completeMission(order[i], { success: true, score: 5000, rank: 'A', time: 100 });
    const s = SL.Screens.story({ mission: 'namek_nail', cleared: true });
    eq(s.focusMission, order[upTo + 1], 'the list opens on the mission it unlocked (' + order[upTo + 1] + ')');
    const done = s.items.find((it) => it.missionId === 'namek_nail');
    ok(done && done.justCleared, 'and the finished card is marked');
    ok(s.focusMission !== 'prologue_final_stand', 'not the Prologue');
    // leaving a mission without finishing it (Back to Story, a defeat) comes back to that mission
    const s2 = SL.Screens.story({ mission: 'namek_frieza1', cleared: false });
    eq(s2.focusMission, 'namek_frieza1', 'back from a mission not finished: on that mission');
    // replaying an old mission: back to it (its successor is already cleared, the list stays where the player was)
    const s3 = SL.Screens.story({ mission: 'saiyan_nappa', cleared: true });
    eq(s3.focusMission, order[order.indexOf('saiyan_nappa') + 1], 'a replayed early mission: the one after it, in its own chapter');
    // with no memory at all, the first mission not cleared (the old behaviour)
    const s4 = SL.Screens.story();
    eq(s4.focusMission, order[upTo + 1], 'no memory: the first mission not yet cleared');
    ok(typeof s.onShow === 'function', 'the list scrolls to its focus once it is on the page');
  });

  /* ------------------------------------------------------------ the Saibamen pack */

  test('Saibamen: a pack, not a sponge — three above ground at most, the rest tunnel in, allies get latched and switching saves them, and it lasts long enough to play the party (owner: too easy to switch)', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const def = SL.data.missions.saiyan_saibamen;
    let t0 = null, tEnd = null, maxUp = 0, releases = 0, saved = null, switchedInto = null, escapes = 0, hpMaxSeen = 0;
    const r = gg.playMission('saiyan_saibamen', {
      startPhase: phaseAt(SL, 'saiyan_saibamen', 'pack'),
      maxSeconds: 400,
      onBattle: (b) => {
        b.on('packRelease', () => releases++);
        b.on('missionPhase', (e) => e.phase.id === 'nappa' && tEnd === null && (tEnd = b.frame));
        b.on('latchEscape', (e) => e.victim === b.player && escapes++);
        b.onTick(() => {
          const S = b.story;
          if (!S.pack) return true;
          if (t0 === null && !b.inputLocked) t0 = b.frame;
          const up = [...S.pack.active].filter((x) => x.alive && !x.hidden && !x.untargetable).length;
          maxUp = Math.max(maxUp, up);
          for (const sb of S.saibamen) hpMaxSeen = Math.max(hpMaxSeen, sb.hpMax);
          // the first time an ally is caught, do what the prompt says: switch
          const la = (b.party || []).find((h) => h !== b.player && b.inTrouble(h));
          if (la && !saved) {
            saved = { ally: la.def.id, next: b.nextPartyMember(1) === la, can: b.canSwitchTo(la) };
            if (saved.can && b.switchPlayer(b.nextPartyMember(1))) switchedInto = b.player === la ? la.def.id : null;
          }
          return true;
        });
      },
    });
    eq(r.state, 'success', 'the mission is won');
    ok(maxUp <= def.PACK.active, 'never more than ' + def.PACK.active + ' above ground: ' + maxUp);
    ok(releases >= def.PACK.second, 'the reserve comes up from underground: ' + releases + ' ambushes');
    ok(hpMaxSeen <= SL.data.characters.saibaman.stats.hp, 'no health inflation: ' + hpMaxSeen);
    ok(saved, 'an ally was latched: the reason to switch');
    ok(saved.next && saved.can, 'switching goes to the hero in trouble, and is allowed: ' + JSON.stringify(saved));
    eq(switchedInto, saved.ally, 'the player took over the latched hero');
    ok(escapes >= 1, 'and shook it off as the player');
    const secs = (tEnd - t0) / 60;
    ok(secs >= 30, 'the pack lasts long enough to play the party (bot, which never lets up): ' + secs.toFixed(0) + ' s');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ Saiyan Saga deaths, staged */

  /** Distance from p to the segment a–b on the ground plane, and where along it (0 at a, 1 at b). */
  const onLine = (p, a, b) => {
    const ax = b.x - a.x, az = b.z - a.z;
    const t = ((p.x - a.x) * ax + (p.z - a.z) * az) / (ax * ax + az * az);
    const cx = a.x + ax * t, cz = a.z + az * t;
    return { d: Math.hypot(p.x - cx, p.z - cz), t };
  };

  test("Piccolo's death is a scene, not a line: all three actors in frame, Piccolo in the beam's path between Nappa and Gohan, the beam ends on him, he falls, and he is dead beside the boy (owner, playtest round 2)", () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      let atImpact = null, order = [], sceneRan = false;
      const b = gg.mission('saiyan_nappa', {
        startPhase: phaseAt(SL, 'saiyan_nappa', 'sacrifice'),
        onCreate: (bb) => {
          bb.on('sceneStart', (e) => e.id === 'piccolo_shields_gohan' && (sceneRan = true));
          bb.on('piccoloShield', () => order.push('beam'));
          bb.on('say', (e) => {
            if (/Say goodbye/.test(e.line) && !order.includes('nappa')) order.push('nappa');
            if (/not so bad/.test(e.line)) order.push('lastWords');
          });
        },
      });
      const S = b.story;
      gg.until(b, () => phaseId(b) !== 'sacrifice' || b.mission.state !== 'running', 60 * 90, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        const bm = b.projectiles.beams.find((x) => x.owner === S.nappa && x.headOverride);
        if (bm && !atImpact) {
          atImpact = {
            line: onLine(S.piccolo.pos, S.nappa.pos, S.gohan.pos),
            head: bm.head.distanceTo(S.piccolo.chest()),
            hitsGohan: bm.head.distanceTo(S.gohan.chest()),
            visible: !S.piccolo.hidden && !S.gohan.hidden && !S.nappa.hidden,
            pose: S.piccolo.sd.pose,
          };
        }
      });
      const tag = watch ? 'watched' : 'skipped';
      ok(sceneRan, tag + ': the scene ran');
      if (watch) {
        ok(atImpact, 'the beam reached him');
        ok(atImpact.visible, 'all three actors are in the scene at the impact');
        ok(atImpact.line.d < 0.9 && atImpact.line.t > 0.5 && atImpact.line.t < 1, 'Piccolo stands on the line from Nappa to Gohan, on the boy\'s side: ' + JSON.stringify(atImpact.line));
        ok(atImpact.head < 0.5, 'the beam ends on Piccolo: ' + atImpact.head.toFixed(2) + ' m');
        ok(atImpact.hitsGohan > 1.5, 'and never reaches the boy');
        eq(order.join(','), 'nappa,beam,lastWords', 'anticipation, the attack, the last words — in order');
      }
      ok(!S.piccolo.alive && S.piccolo.hp === 0, tag + ': Piccolo is dead');
      ok(!S.piccolo.hidden, tag + ': his body is there');
      ok(S.gohan.pos.distanceTo(S.piccolo.pos) < 3, tag + ': the boy is beside him: ' + S.gohan.pos.distanceTo(S.piccolo.pos).toFixed(1) + ' m');
      ok(b.mission.flags.piccoloFell, tag + ': the story knows');
      ok(!S.piccolo.intangible, tag + ': nothing staged is left on him');
      eq(gg.errors.length, 0, tag + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  test("Nappa's execution is staged: Vegeta walks up and takes his hand, throws him into the air, and the blast lands where Nappa is — no AI, no miss (owner, playtest round 2)", () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const b = gg.mission('saiyan_nappa', { startPhase: phaseAt(SL, 'saiyan_nappa', 'finale') });
      const S = b.story;
      let grip = null, apex = 0, blast = null, ground0 = null, aiDuring = false;
      b.on('nappaExecuted', (e) => (blast = e));
      gg.until(b, () => b.mission.state !== 'running', 60 * 90, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        const v = S.vegeta, n = S.nappa;
        if (ground0 === null) ground0 = b.stage.heightAt(n.pos.x, n.pos.z);
        if (v.sd && v.sd.pose === 'v_offerHand' && n.sd && n.sd.pose === 'n_reachUp' && !grip) grip = v.pos.distanceTo(n.pos);
        if (n.sd && n.sd.pose === 'launched') apex = Math.max(apex, n.pos.y - ground0);
        if (v.controller instanceof SL.AIController || n.controller instanceof SL.AIController) aiDuring = true;
      });
      const tag = watch ? 'watched' : 'skipped';
      if (watch) {
        ok(grip !== null && grip < 2.6, 'Vegeta is standing over Nappa when he offers the hand: ' + grip);
        ok(apex > 12, 'Nappa is thrown high into the air: ' + apex.toFixed(1) + ' m');
        ok(blast && blast.blastAt.distanceTo(blast.nappaAt) < 0.5, 'the blast detonates on Nappa: ' + (blast && blast.blastAt.distanceTo(blast.nappaAt).toFixed(2)));
        ok(!aiDuring, 'no fight AI drives either of them');
      }
      ok(!S.nappa.alive && S.nappa.hidden, tag + ': Nappa is gone');
      ok(b.mission.flags.nappaExecuted, tag + ': the story knows');
      eq(b.mission.state, 'success', tag + ': the mission ends');
      eq(gg.errors.length, 0, tag + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  test('retrying Goku vs Nappa from its checkpoint keeps the story: Piccolo, Tien and Chiaotzu stay fallen (not standing in the finale) and the fight goes on as Goku', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('saiyan_nappa', { startPhase: phaseAt(SL, 'saiyan_nappa', 'duel') });
    const S = b.story;
    gg.step(b, 60);
    for (const h of [S.piccolo, S.tien, S.chiaotzu]) ok(!h.alive && h.hidden, h.def.id + ' stays fallen');
    ok(b.mission.flags.piccoloFell, 'the story knows Piccolo fell');
    eq(b.mission.state, 'running', 'the fight goes on (the player was not the one knocked out)');
    eq(b.player, S.goku, 'as Goku');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  /* ------------------------------------------------------------ Vegeta on Namek: Cui and Dodoria */

  test("Cui's death is Vegeta's moment: he walks up on him, points behind him, raises the palm (shot from below), and the wave ends on Cui (owner, playtest round 2)", () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      let killed = null, lowShot = false, walked = null, sceneRan = false;
      const b = gg.mission('namek_vegeta', {
        startPhase: phaseAt(SL, 'namek_vegeta', 'cui'),
        onCreate: (bb) => {
          bb.on('cuiKilled', (e) => (killed = e));
          bb.on('sceneStart', (e) => e.id === 'vegeta_kills_cui' && (sceneRan = true));
        },
      });
      const S = b.story;
      // the duel itself is gameplay: bring Cui to the threshold
      gg.until(b, () => !b.inputLocked, 60 * 20, skipAll(b));
      S.cui.hp = S.cui.hpMax * 0.2;
      gg.until(b, () => phaseId(b) !== 'cui' || b.mission.state !== 'running', 60 * 60, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        const v = S.vegeta;
        if (v.sd && v.sd.pose === 'v_palmExecute' && b.camera.inShot) {
          const cam = b.camera.pos, chest = v.chest();
          // below his chest and looking up at him (story cameras stop 0.6 m above the ground)
          if (cam.y < chest.y - 0.3 && b.camera.look.y > cam.y + 0.2) lowShot = true;
        }
        if (v.sd && v.sd.pose === 'v_victoryPoint' && walked === null) walked = v.pos.distanceTo(S.cui.pos);
      });
      const tag = watch ? 'watched' : 'skipped';
      ok(sceneRan, tag + ': the scene ran');
      if (watch) {
        ok(walked !== null && walked < 4, 'he walks right up to him before the trick: ' + walked);
        ok(lowShot, 'the palm is shot from below him');
        ok(killed && killed.at.distanceTo(killed.vegeta) < 5, 'the blast lands on Cui in front of him');
      }
      ok(!S.cui.alive && S.cui.hidden, tag + ': Cui is gone');
      ok(b.mission.flags.cuiKilled, tag + ': the story knows');
      eq(gg.errors.length, 0, tag + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  test("Dodoria's death is in the frame: the camera stays level with the chase and square to it, and the explosion happens where it is looking (owner: too high, top-down, the death lost)", () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    let killed = null;
    const b = gg.mission('namek_vegeta', { startPhase: phaseAt(SL, 'namek_vegeta', 'truth'), onCreate: (bb) => bb.on('dodoriaKilled', (e) => (killed = e)) });
    const S = b.story;
    gg.until(b, () => b.mission.state !== 'running', 60 * 60);
    ok(killed, 'he is killed on camera');
    const toBlast = killed.at.clone().sub(killed.camera).normalize();
    const toLook = killed.look.clone().sub(killed.camera).normalize();
    const off = (Math.acos(Math.max(-1, Math.min(1, toBlast.dot(toLook)))) * 180) / Math.PI;
    // the wide frame holds both men, so he is off-centre by design — but well inside the picture
    // (half the horizontal field of view at 16:9 and 50° is about 41°)
    ok(off < 32, 'the explosion is inside the frame: ' + off.toFixed(1) + '° from its centre');
    const down = (Math.asin(Math.max(-1, Math.min(1, -toBlast.y))) * 180) / Math.PI;
    ok(down < 35, 'not a top-down shot: looking ' + down.toFixed(1) + '° down at it');
    const dist = killed.camera.distanceTo(killed.at);
    ok(dist < 40, 'close enough to see him: ' + dist.toFixed(1) + ' m');
    ok(!S.dodoria.alive && S.dodoria.hidden, 'Dodoria is gone');
    eq(b.mission.state, 'success', 'the mission ends');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  /* ------------------------------------------------------------ techniques that do nothing */

  test('every attacking technique on every fighter lands on a target six metres away (owner: "the Namekian attack does not work", "one of Ginyu\'s first attacks does not work")', () => {
    // utility techniques do their job without damage (teleports, flares, grips, senzu, time
    // freeze, roars, Gotenks' pose buff, Janemba's Dimension Door guard and Phantom Shift evade);
    // a technique gated on a state (requiresMech) is skipped
    // (2026-10-14: 'godBind' — a hold like telekinesis, Hit's Time Cage now as well as Goku's God Bind; universe6-tests
    // checks that it holds its target. 2026-10-17: Android 17's Tournament shell ('barrier') became a defence in the ToP
    // refinement pass — nothing swings into it at six metres — so it is a defence here too, and the next test checks
    // what it does)
    const UTILITY = ['teleport', 'senzu', 'solarFlare', 'telekinesis', 'timeFreeze', 'bossRoar', 'bossTaunt', 'bossPose', 'portalGuard', 'phantomShift', 'godBind', 'barrier'];
    const g0 = H.create({ quiet: true, seed: 1 });
    const failures = [];
    let checked = 0;
    for (const [id, def] of Object.entries(g0.SL.data.characters)) {
      for (const [slot, key] of [['special1', 's1'], ['special2', 's2'], ['ultimate', 'ult']]) {
        const sp = def.specials && def.specials[slot];
        if (!sp || UTILITY.includes(sp.type) || sp.requiresMech) continue;
        checked++;
        const gg = H.create({ quiet: true, seed: 1 });
        const { SL } = gg;
        const b = gg.battle({ p1: id, p2: 'vegeta', distance: 6 });
        const p = b.player;
        p.ki = p.kiMax;
        p.lockedSlots = {};
        let dmg = 0, n = 0;
        b.on('damage', (e) => e.attacker === p && (dmg += e.amount));
        p.controller = {
          update: () => {
            n++;
            const it = SL.emptyIntent();
            it[key] = n === 2;
            it[key + 'Held'] = n < 90;
            return it;
          },
        };
        gg.step(b, 240);
        const nan = b.projectiles.beams.some((bm) => !isFinite(bm.headDist));
        if (dmg <= 0 || nan || gg.errors.length) failures.push(id + '.' + slot + ' (' + sp.id + ', ' + sp.type + '): damage ' + Math.round(dmg) + (nan ? ', beam head NaN' : '') + (gg.errors[0] ? ', ' + gg.errors[0] : ''));
        b.dispose();
      }
    }
    ok(checked > 60, 'techniques checked: ' + checked);
    eq(failures.join(' | '), '', 'every one of them hits');
  });

  test("Android 17's Barrier (Tournament of Power): a blast that reaches the shell bursts on it, a fighter swinging into it is pushed off and hurt, and the shell is gone when it drops", () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'android_17_top', p2: 'vegeta', distance: 1.4 });
    const a = b.player, v = b.fighters.find((f) => f !== a);
    a.ki = a.kiMax;
    v.controller = { update: () => gg.SL.emptyIntent() };
    eq(a.specFor('special2').type, 'barrier', 'his Special 2 is the shell');
    ok(a._trySpecial('special2'), 'raised');
    eq(a.state, 'barrier');
    const shell = a.sd.shell;
    gg.step(b, 8);
    const hp0 = a.hp;
    const from = a.chest().addScaledVector(a.forward, 8);
    const shot = b.projectiles.spawnBlast(v, from, a.chest().sub(from).normalize(), { kind: 'blast', speed: 60, radius: 0.3, damage: 900, color: 0xffffff, life: 2 });
    let vHurt = 0;
    b.on('damage', (e) => e.target === v && e.attacker === a && (vHurt += e.amount));
    v.state = 'free';
    v._startLight();
    gg.step(b, 20);
    ok(!shot.alive, 'the blast burst on the shell');
    eq(Math.round(a.hp), Math.round(hp0), 'and 17 took nothing behind it');
    ok(vHurt > 0, 'the one who swung into it is hurt (' + Math.round(vHurt) + ')');
    gg.step(b, 80);
    eq(a.state, 'free', 'the shell drops after its hold');
    ok(!shell.parent, 'and nothing of it is left in the scene');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ the Ginyu Force arc */

  test("Goku's arrival on Namek is a landing, not a spawn: the ship comes down, he is between Recoome's boot and Gohan, the others react, and Recoome falls to one blow (owner, playtest round 2)", () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const lines = [];
    let hiddenAtStart = null, between = null, shipLanded = null;
    const b = gg.mission('namek_ginyu_pair', { onCreate: (bb) => bb.on('say', (e) => lines.push(e.line)) });
    const S = b.story;
    gg.until(b, () => phaseId(b) !== 'landing' || b.mission.state !== 'running', 60 * 90, () => {
      if (hiddenAtStart === null) hiddenAtStart = S.goku.hidden;
      if (!between && !S.goku.hidden && S.recoome.sd && S.recoome.sd.pose === 'rc_kickW') {
        const l = onLine(S.goku.pos, S.gohan.pos, S.recoome.pos);
        between = { d: l.d, t: l.t };
      }
      const ship = b.stage.props.find((p) => p.id === 'gokuShip');
      if (ship) shipLanded = ship.pos.y - b.stage.heightAt(ship.pos.x, ship.pos.z);
    });
    ok(hiddenAtStart === true, 'Goku is not on the field before he arrives');
    ok(shipLanded !== null && shipLanded < 5, 'his ship comes down and sits on the ground: ' + shipLanded);
    ok(between && between.d < 1 && between.t > 0.1 && between.t < 0.9, 'he appears between the boot and the boy: ' + JSON.stringify(between));
    const idx = (re) => lines.findIndex((l) => re.test(l));
    ok(idx(/Dad/) >= 0 && idx(/Goku! You made it/) >= 0 && idx(/Kakarot/) >= 0, 'Gohan, Krillin and Vegeta react');
    ok(idx(/Sorry I took so long/) > idx(/Dad/), 'then his line');
    ok(idx(/in one hit/) > idx(/Sorry I took so long/), 'and Jeice sees Recoome go down to one blow');
    ok(b.mission.flags.gokuLanded, 'the story knows');
    eq(S.recoome.sd.pose, 'knockdown', 'Recoome is down');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('Goku against Burter and Jeice is a power gap you can feel: their ordinary attacks are not there when they land, nothing slides off Burter, and the pair goes down fast (owner: "Goku did not feel stronger")', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    let evades = { burter: 0, jeice: 0 }, outsped = 0, t0 = null, tEnd = null, taken = 0;
    const r = gg.playMission('namek_ginyu_pair', {
      startPhase: phaseAt(SL, 'namek_ginyu_pair', 'pair'),
      maxSeconds: 300,
      onBattle: (b) => {
        b.on('storyEvade', (e) => {
          evades[e.attacker.def.id] = (evades[e.attacker.def.id] || 0) + 1;
        });
        b.on('outsped', () => outsped++);
        b.on('damage', (e) => e.target === b.story.goku && (taken += e.amount));
        b.on('missionPhase', (e) => e.phase.id === 'down' && tEnd === null && (tEnd = b.frame));
        b.onTick(() => {
          if (t0 === null && !b.inputLocked) t0 = b.frame;
          return true;
        });
      },
    });
    const S = r.b.story;
    eq(r.state, 'success', 'the mission is won');
    ok(evades.burter >= 2, 'Burter swings at nothing: ' + JSON.stringify(evades));
    ok(evades.jeice + evades.burter >= 4, 'and so does Jeice, between them: ' + JSON.stringify(evades));
    ok(outsped >= 1, 'Burter moving at full speed still takes Goku\'s hits in full: ' + outsped);
    const secs = (tEnd - t0) / 60;
    ok(secs < 75, 'the pair is beaten quickly (bot): ' + secs.toFixed(0) + ' s');
    ok(taken < S.goku.hpMax * 0.6, 'and it costs Goku little: ' + Math.round(taken) + ' of ' + S.goku.hpMax);
    ok(!S.goku.storyEvade && !S.goku.storySpeed, 'the story power gap ends with the fight');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Body Change, the state machine: a change that lands mid-fight waits for its scene, happens exactly once, and leaves Goku\'s mind (the player) in Ginyu\'s body and Ginyu\'s mind (AI) in Goku\'s — switching heroes and back never hands the player the wrong body (owner, playtest round 2)', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    let deferred = 0, swaps = 0;
    const b = gg.mission('namek_ginyu', {
      startPhase: phaseAt(SL, 'namek_ginyu', 'captain'),
      onCreate: (bb) => {
        bb.on('bodyChangeDeferred', () => deferred++);
        bb.on('bodyChange', () => swaps++);
      },
    });
    const S = b.story;
    gg.until(b, () => !b.inputLocked, 60 * 20, skipAll(b));
    // the captain fires it at point blank while Goku stands there, in the air
    const g = S.goku, gy = S.ginyu;
    g.setPosition(gy.pos.clone().addScaledVector(gy.forward, 4).add(new gg.V3(0, 3, 0)));
    g.grounded = false;
    g.controller = { update: () => SL.emptyIntent() };
    gy.controller = { update: () => SL.emptyIntent() };
    gy.target = g;
    gy.setState('free');
    SL.Techniques.bodyChange.start(gy, SL.data.characters.ginyu.boss.techniques.change, 'boss', 0);
    gg.until(b, () => deferred > 0 || gy.state !== 'bodyChange', 200);
    eq(deferred, 1, 'the landed change is deferred to the scene');
    eq(b.mindOf(g).id, 'goku', 'and nothing swapped in mid-air');
    // the scene plays it (skipped here: the end state is the same)
    gg.until(b, () => phaseId(b) === 'stolen' && !b.inputLocked, 60 * 60, skipAll(b));
    eq(swaps, 1, 'exactly one swap');
    eq(b.mindOf(gy).id, 'goku', "Goku's mind is in Ginyu's body");
    eq(b.mindOf(g).id, 'ginyu', "Ginyu's mind is in Goku's body");
    eq(b.player, gy, 'the player drives Ginyu\'s body');
    ok(g.controller instanceof SL.AIController, 'an AI drives Goku\'s');
    ok(gy.team !== g.team, 'on opposite sides');
    eq(b.fighters.filter((f) => f.isPlayer).length, 1, 'one player-controlled body');
    eq(b.mission.flags.bodyState, 'swapped', 'the story knows the state');
    // switch to Krillin, and back
    b.partyCooldown = 0;
    ok(b.switchPlayer(S.krillin, { force: true }), 'switch to Krillin');
    eq(b.player, S.krillin, 'Krillin');
    ok(!b.party.includes(g), 'Goku\'s body (with Ginyu inside) is never a party seat: ' + b.party.map((f) => f.name).join(','));
    b.partyCooldown = 0;
    const back = b.party.find((f) => f !== S.krillin && f !== S.gohan);
    ok(b.switchPlayer(back, { force: true }), 'switch back');
    eq(b.player, gy, 'back in Ginyu\'s body — Goku\'s mind, the right body');
    eq(b.mindOf(b.player).id, 'goku', 'with Goku\'s mind');
    eq(b.fighters.filter((f) => f.isPlayer).length, 1, 'still one player-controlled body');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('Body Change, told on the HUD: the plate of a mind in a foreign body carries its own face and "IN <BODY>\'S BODY"', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    loadUI(gg, ['src/ui/ui.js', 'src/ui/hud.js']);
    const { SL } = gg;
    const b = gg.mission('namek_ginyu', { startPhase: phaseAt(SL, 'namek_ginyu', 'stolen') });
    gg.until(b, () => !b.inputLocked, 60 * 20, skipAll(b));
    const S = b.story;
    const HUD = SL.HUD;
    const mk = () => ({ root: { classList: { toggle(c, on) { this[c] = on; } } }, port: { style: { setProperty() {} } }, img: {}, mindImg: { hidden: true }, bodyTag: { hidden: true, textContent: '' }, name: {}, badge: { classList: { remove() {}, add() {} } }, mech: {}, last: {} });
    const P = mk();
    HUD.battle = b;
    try {
      HUD._updatePanel(P, b.player);
    } catch (e) {
      /* later panel fields need the full DOM; the name block runs first */
    }
    ok(!P.bodyTag.hidden && /IN CAPTAIN GINYU'S BODY/.test(P.bodyTag.textContent), 'the player plate says whose body: ' + P.bodyTag.textContent);
    ok(!P.mindImg.hidden, 'and shows Goku\'s own face');
    ok(P.root.classList.swapped, 'in the swapped frame');
    const Q = mk();
    try {
      HUD._updatePanel(Q, S.goku);
    } catch (e) {}
    ok(/IN GOKU'S BODY/.test(Q.bodyTag.textContent), 'and the enemy plate: ' + Q.bodyTag.textContent);
    b.dispose();
  });

  test('the frog is real: it is at Goku\'s hand, he throws it into the path of the beam aimed at Vegeta, the beam ends on the frog, and the captain wakes up small (owner: "I have not seen where Goku threw a frog")', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 5 });
      const { SL } = gg;
      let thrown = null, startDist = null, midAir = 0, pinned = false, beamOnVegeta = false;
      const b = gg.mission('namek_frog', { startPhase: phaseAt(SL, 'namek_frog', 'lastTry'), onCreate: (bb) => bb.on('frogThrown', (e) => (thrown = Object.assign({ gy: bb.story.ginyu.pos.clone(), vg: bb.story.vegeta.pos.clone() }, e))) });
      const S = b.story;
      gg.until(b, () => phaseId(b) !== 'lastTry' || b.mission.state !== 'running', 60 * 60, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        if (startDist === null && S.frog.sd && S.frog.sd.pose === 'frog_hop') startDist = S.frog.pos.distanceTo(S.goku.pos);
        if (thrown && !pinned) midAir = Math.max(midAir, S.frog.pos.y - b.stage.heightAt(S.frog.pos.x, S.frog.pos.z));
        const bm = b.projectiles.beams.find((x) => x.owner === S.ginyu && x.headOverride);
        if (bm && bm.headOverride.distanceTo(S.frog.chest()) < 0.6) pinned = true;
        if (bm && bm.head.distanceTo(S.vegeta.chest()) < 1) beamOnVegeta = true;
      });
      const tag = watch ? 'watched' : 'skipped';
      if (watch) {
        ok(startDist !== null && startDist < 2, 'the frog is at Goku\'s hand before the throw: ' + startDist);
        ok(thrown, 'Goku throws it');
        ok(midAir > 1, 'it flies: ' + midAir.toFixed(1) + ' m off the ground');
        ok(pinned, 'the beam ends on the frog');
        ok(!beamOnVegeta, 'and never reaches Vegeta');
        const l = onLine(thrown.to, thrown.gy, thrown.vg);
        ok(l.d < 1.2 && l.t > 0.1 && l.t < 0.9, 'the frog lands in the beam\'s path: ' + JSON.stringify(l));
      }
      eq(b.mindOf(S.frog).id, 'ginyu', tag + ': the captain is in the frog');
      eq(b.mindOf(S.ginyu).id, 'namek_frog', tag + ': and the frog in the captain');
      eq(b.mission.flags.bodyState, 'frog', tag + ': the story knows');
      eq(gg.errors.length, 0, tag + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  /* ------------------------------------------------------------ Nail and Piccolo */

  test('the fusion is seen: both are there, Piccolo\'s palm on Nail\'s chest, Nail turns to light and pours into him, and the fused form is real in play (owner: "I did not see Nail and Piccolo fuse")', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 5 });
      const { SL } = gg;
      let press = null, fused = false, spiritMin = 1;
      const b = gg.mission('namek_nail', { startPhase: phaseAt(SL, 'namek_nail', 'fusion'), onCreate: (bb) => bb.on('nailFused', () => (fused = true)) });
      const S = b.story;
      gg.until(b, () => phaseId(b) !== 'fusion' || b.mission.state !== 'running', 60 * 90, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        const p = S.piccolo, n = S.nail;
        if (!press && p.sd && p.sd.pose === 'p_palmPress') press = { d: p.pos.distanceTo(n.pos), both: !p.hidden && !n.hidden };
        if (n.model._spiritMat && n.model._spiritMats) spiritMin = Math.min(spiritMin, n.model._spiritMat.opacity);
      });
      const tag = watch ? 'watched' : 'skipped';
      if (watch) {
        ok(press && press.both, 'both of them are in the scene when his hand goes on Nail');
        ok(press && press.d < 1.8, 'close enough to touch: ' + (press && press.d.toFixed(2)) + ' m');
        ok(spiritMin < 0.3, 'Nail fades into light: ' + spiritMin.toFixed(2));
        ok(fused, 'and is gone into him');
      }
      ok(S.nail.hidden, tag + ': Nail is gone');
      eq(S.piccolo.form.id, 'nail', tag + ': Piccolo is in the fused form');
      ok(S.piccolo.mult().damage > 1.3, tag + ': and it is a real power-up: x' + S.piccolo.mult().damage.toFixed(2));
      ok(b.mission.flags.fused, tag + ': the story knows');
      eq(gg.errors.length, 0, tag + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  /* ------------------------------------------------------------ Developer / Test Mode */

  test('Developer / Test Mode keeps its own save: it starts as a copy of real progress, what is cleared in it stays in it, and switching it off brings the real save back untouched', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const ls = gg.ctx.localStorage;
    SL.Save.storage = ls;
    SL.Save.data = SL.Save.fresh();
    SL.Save.completeMission('prologue_final_stand', { success: true, score: 4000, rank: 'B', time: 100 });
    const realBefore = ls.getItem(SL.Save.KEY);
    ok(realBefore, 'there is a real save');
    SL.Dev.setEnabled(true);
    ok(SL.Dev.active && SL.Save.devSlot, 'the mode is on and the test slot is in use');
    ok(SL.Save.missionResult('prologue_final_stand'), 'the test save starts from the real progress');
    SL.Save.completeMission('namek_ginyu', { success: true, score: 9000, rank: 'S', time: 60 });
    SL.Save.unlock('characters', 'frieza');
    eq(ls.getItem(SL.Save.KEY), realBefore, 'the real save has not changed by a single byte');
    ok(/namek_ginyu/.test(ls.getItem(SL.Save.DEV_KEY)), 'the test save has the clear');
    SL.Dev.setEnabled(false);
    ok(!SL.Save.devSlot, 'switched off: the real slot is back');
    ok(!SL.Save.missionResult('namek_ginyu'), 'and does not know about the test clear');
    ok(SL.Save.missionResult('prologue_final_stand'), 'and still has its own');
    SL.Dev.setEnabled(true);
    ok(SL.Save.missionResult('namek_ginyu'), 'switched on again: the test save is where it was left');
    ok(SL.Dev.actions.clearTestProgress() && !SL.Save.missionResult('prologue_final_stand'), 'clearing test progress empties only the test save');
    SL.Dev.setEnabled(false);
    ok(SL.Save.missionResult('prologue_final_stand'), 'the real save still has its progress');
  });

  test('Developer / Test Mode switched off in Settings: back on the main menu, the Developer Menu button is gone (the menu is rebuilt for the real save)', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    loadUI(gg, ['src/ui/ui.js', 'src/ui/screens_menu.js', 'src/ui/screens_dev.js']);
    const { SL } = gg;
    SL.Save.storage = gg.ctx.localStorage;
    SL.Dev.setEnabled(true);
    // the headless DOM has no text: record the labels each menu is built with
    const labels = new Map();
    let building = [];
    const mb = SL.UI.menuButton;
    SL.UI.menuButton = (s, label, ...rest) => (building.push(label), mb.call(SL.UI, s, label, ...rest));
    const build = () => {
      building = [];
      const s = SL.Screens.mainMenu();
      labels.set(s, building);
      return s;
    };
    const text = (s) => (labels.get(s) || []).join('|');
    const menu = build();
    ok(/Developer Menu/.test(text(menu)), 'on: the main menu offers the Developer Menu');
    SL.Dev.setEnabled(false);
    let rebuilt = null;
    SL.UI.replace = (s) => (rebuilt = s);
    building = [];
    menu.onReturn();
    ok(rebuilt && building.includes('Settings') && !building.includes('Developer Menu'), 'off, back from Settings: rebuilt without it (' + building.join(', ') + ')');
    const plain = build();
    rebuilt = null;
    plain.onReturn();
    eq(rebuilt, null, 'nothing changed: no rebuild');
  });

  test('Developer / Test Mode: unlock-all, cheats and tools act only while the mode is on', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    SL.Save.storage = gg.ctx.localStorage;
    SL.Save.data = SL.Save.fresh();
    const D = SL.Settings.data.dev;
    Object.assign(D, { enabled: false, unlockAll: true, infiniteHp: true, infiniteKi: true, godMode: true, noCooldowns: true, noKiCost: true, oneHitKO: true, allForms: true, overlay: true });
    const r = (id) => SL.Save.missionResult(id);
    ok(SL.data.storyLocked('namek_nail', r), 'off: the story is locked as usual');
    ok(!SL.Save.isUnlocked('characters', 'frieza'), 'off: characters locked as usual');
    SL.Dev.setEnabled(true);
    ok(!SL.data.storyLocked('namek_nail', r), 'on: every mission is open');
    ok(SL.Save.isUnlocked('characters', 'frieza') && SL.Save.isUnlocked('stages', 'namek'), 'on: every fighter and stage');
    // the cheats, in a real battle
    const b = gg.battle({ p1: 'vegeta', p2: 'goku' });
    const p = b.player;
    p.lockedForms = { ssj: true };
    p.lockedSlots = { ultimate: true };
    p.hp = 10;
    p.ki = 0;
    p.cooldowns.special1 = 300;
    gg.step(b, 2);
    eq(p.hp, p.hpMax, 'infinite health');
    eq(p.ki, p.kiMax, 'infinite ki');
    eq(p.cooldowns.special1, 0, 'no cooldowns');
    ok(p.damageTakenMul === 0 && p.cannotDie, 'god mode');
    ok(p.damageDealtMul >= 999, 'one-hit KO');
    ok(!p.lockedForms.ssj && !p.lockedSlots.ultimate, 'all forms and techniques allowed');
    ok(SL.Rules.spendKi(p, 50) && p.ki === p.kiMax, 'no ki cost');
    const form = SL.Dev.actions.forceForm(b);
    ok(form && p.formIndex > 0, 'force form: ' + form);
    SL.Dev.actions.resetPower(b);
    eq(p.formIndex, 0, 'reset power: back to base');
    const foe = SL.Dev.actions.spawn(b, 'enemy', 'saibaman');
    ok(foe && foe.team !== p.team && foe.controller instanceof SL.AIController, 'spawn enemy');
    const ally = SL.Dev.actions.spawn(b, 'ally', 'krillin');
    ok(ally && ally.team === p.team, 'spawn ally');
    ok(SL.Dev.actions.spawn(b, 'target'), 'spawn target');
    const text = SL.Dev.overlayText(b);
    ok(/camera/.test(text) && /lock/.test(text) && /audio loops/.test(text) && /hp \d+/.test(text), 'the overlay shows camera, lock, loops and state:\n' + text);
    // off again: nothing applies
    SL.Dev.setEnabled(false);
    gg.step(b, 2);
    ok(p.damageTakenMul !== 0 && p.damageDealtMul < 999, 'off: god mode and one-hit KO are gone');
    p.hp = 10;
    gg.step(b, 2);
    ok(p.hp < p.hpMax, 'off: no more infinite health');
    ok(!SL.Rules.spendKi(Object.assign(p, { ki: 0 }), 50), 'off: ki costs again');
    b.dispose();
    // mission tools
    SL.Dev.setEnabled(true);
    const mb = gg.mission('namek_ginyu');
    gg.step(mb, 30);
    ok(mb.inputLocked, 'a scene is playing');
    SL.Dev.actions.skipScene(mb);
    gg.until(mb, () => !mb.inputLocked, 600);
    ok(!mb.inputLocked, 'skip scene: control is back');
    SL.Dev.actions.forceWin(mb);
    eq(mb.mission.state, 'success', 'force win completes the mission');
    mb.dispose();
    const mf = gg.mission('namek_ginyu');
    gg.step(mf, 5);
    SL.Dev.actions.forceLoss(mf);
    eq(mf.mission.state, 'failed', 'force loss fails it');
    mf.dispose();
    SL.Dev.setEnabled(false);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ Zarbon, Frieza, and the story in between */

  test('Zarbon is challenging, not punishing: in his elegant form he fights for show (lighter blows), and the monster hits with everything (owner: "extremely difficult")', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('namek_zarbon', { startPhase: phaseAt(SL, 'namek_zarbon', 'duel') });
    gg.until(b, () => !b.inputLocked, 60 * 20, skipAll(b));
    const z = b.story.zarbon;
    ok(z.damageDealtMul < 0.8, 'duel: his blows land lighter: x' + z.damageDealtMul);
    b.dispose();
    const b2 = gg.mission('namek_zarbon', { startPhase: phaseAt(SL, 'namek_zarbon', 'monster') });
    gg.until(b2, () => !b2.inputLocked, 60 * 20, skipAll(b2));
    eq(b2.story.zarbon.damageDealtMul, 1, 'monster: full strength');
    b2.dispose();
    // the bot (which trades blows) wins the duel on most seeds now: measured 14 of 16 (was 11 of 16)
    let wins = 0;
    for (const seed of [1, 2, 3, 5]) {
      const g = H.create({ quiet: true, seed });
      const r = g.playMission('namek_zarbon', { maxSeconds: 400 });
      if (r.state === 'success') wins++;
      r.b.dispose();
    }
    ok(wins >= 3, 'the careful bot wins at least 3 of 4 seeded runs: ' + wins);
  });

  test('Frieza fights Vegeta instead of fleeing: a player who keeps closing in spends most of the fight in reach of him (owner: "Frieza constantly moves away")', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const b = gg.mission('namek_frieza1', { startPhase: phaseAt(SL, 'namek_frieza1', 'firstForm') });
    gg.until(b, () => !b.inputLocked, 60 * 30, skipAll(b));
    const p = b.player, fz = b.story.frieza;
    p.cannotDie = true;
    let n = 0;
    p.controller = {
      update: () => {
        n++;
        const it = SL.emptyIntent();
        p.target = fz;
        const d = p.distTo(fz);
        it.my = d > 2.2 ? 1 : 0;
        it.boost = d > 8;
        if (fz.pos.y - p.pos.y > 1.2) it.up = true;
        else if (p.pos.y - fz.pos.y > 1.2) it.down = true;
        if (d < 2.8 && n % 12 === 0) it.light = true;
        return it;
      },
    };
    let close = 0, frames = 0, breaks = 0, lastPlan = null;
    for (let i = 0; i < 60 * 40 && b.mission.state === 'running'; i++) {
      gg.frame(b);
      frames++;
      if (p.distTo(fz) < 4) close++;
      const pl = fz.controller.plan && fz.controller.plan.type;
      if (pl === 'retreat' && lastPlan !== 'retreat') breaks++;
      lastPlan = pl;
    }
    ok(close / frames > 0.6, 'in reach ' + ((100 * close) / frames).toFixed(0) + '% of the time');
    ok(breaks <= Math.ceil(frames / (60 * 7)), 'he breaks away at most once every seven seconds: ' + breaks);
    b.dispose();
  });

  test('the Namek story connects: the Rematch ends with Vegeta going after the Dragon Balls, Vegeta lands beside Krillin and Gohan (with their Dragon Ball) as the Ginyu Force crosses the sky, and every closing title names the real next mission', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const lines = [];
    let ballSeen = false, vegetaNear = null;
    const b = gg.mission('namek_guldo', { onCreate: (bb) => bb.on('say', (e) => lines.push(e.line)) });
    const S = b.story;
    gg.until(b, () => phaseId(b) !== 'arrival' || b.mission.state !== 'running', 60 * 60, () => {
      if (b.stage.props.some((p) => p.kind === 'dragonball' && p.group && p.group.visible)) ballSeen = true;
      if (!S.vegeta.hidden && /Relax/.test(lines[lines.length - 1] || '') && vegetaNear === null) vegetaNear = S.vegeta.pos.distanceTo(S.krillin.pos);
    });
    ok(ballSeen, 'the Dragon Ball they are carrying is in the scene');
    ok(vegetaNear !== null && vegetaNear < 7, 'Vegeta lands beside them: ' + vegetaNear);
    ok(lines.some((l) => /Ginyu Force/.test(l)), 'the Ginyu Force is named as they arrive');
    ok(b.mission.flags.alliance, 'the story knows they are allied');
    b.dispose();
    // no closing title still promises content "in development" that exists
    const fs = require('fs'), path = require('path');
    const dir = path.join(__dirname, '..', 'src', 'data', 'missions');
    const stale = [];
    for (const f of fs.readdirSync(dir)) if (/'Next: [^'\n]*\(in development\)'/.test(fs.readFileSync(path.join(dir, f), 'utf8'))) stale.push(f);
    eq(stale.join(','), '', 'no stale "(in development)" next titles');
    // nextLine names the real next mission
    const order = SL.data.storyOrder();
    const bb = gg.mission('namek_recoome');
    eq(bb.mission.nextLine(), 'Next: ' + SL.data.missions[order[order.indexOf('namek_recoome') + 1]].title, 'Recoome leads to ' + bb.mission.nextLine());
    bb.dispose();
  });

  test('mission end: a knockout fades the loops under the slow motion, and a failed mission falls silent as well', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    SL.Audio.stopLoops(0);
    const b = gg.mission('saiyan_kingkai');
    gg.until(b, () => !b.inputLocked, 60 * 60, skipAll(b));
    b.player.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.step(b, 20);
    b.mission.fail('test');
    eq(gameLoops(SL).length, 0, 'failed: silent');
    b.dispose();
    const fb = gg.battle({ p1: 'goku', p2: 'vegeta' });
    fb.fighters[1].controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.step(fb, 20);
    fb.finish({ winnerTeam: 0, loser: fb.fighters[1], reason: 'ko' });
    eq(gameLoops(SL).length, 0, 'knockout: silent');
    fb.dispose();
  });
};
