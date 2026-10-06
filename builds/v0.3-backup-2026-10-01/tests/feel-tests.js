// Human-playtest / core-feel pass (2026-09-18): the Raditz beam duel's timing, the camera
// (direction, modes, no runaway turning), lock-on and free aim, far environmental targets
// (the moon), charge audio/aura priority, the Father-Son Kamehameha's spirit staging and
// Bardock's last moments. Runs the real engine headless (tests/headless.js).
const H = require('./headless');

module.exports = function feelTests({ test, eq, ok }) {
  console.log('\nCore feel: camera, targeting, the Raditz duel, charge mixing, flagship cinematics (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;

  /* ------------------------------------------------------------ the Raditz duel */

  /** Play the What-If beam duel with a scripted Kamehameha: press on frame `press`, let go on `release`. */
  function duel(press, release, mashEvery = 4, seed = 3) {
    const gg = H.create({ quiet: true, seed });
    const { SL } = gg;
    const b = gg.mission('whatif_raditz', { startPhase: phaseAt(SL, 'whatif_raditz', 'beamDuel') });
    const p = b.story.goku, r = b.story.raditz;
    gg.until(b, () => !b.inputLocked && p.state === 'free', 60 * 30, skipAll(b));
    let n = 0, hitBeforeClash = false, clashSeen = false;
    const grades = [];
    b.on('duelGrade', (e) => grades.push(e));
    b.on('clashStart', () => (clashSeen = true));
    // what the camera shows at the flare: the angle between Goku and Raditz as seen from the lens
    let tellView = null;
    b.on('duelTell', () => {
      const c = b.camera.pos, toP = p.chest().sub(c).normalize(), toR = r.chest().sub(c).normalize();
      tellView = { deg: (Math.acos(Math.max(-1, Math.min(1, toP.dot(toR)))) * 180) / Math.PI, shot: !!b.camera.shot };
    });
    b.on('damage', (e) => {
      if (e.target === r && e.type === 'beam' && !clashSeen) hitBeforeClash = true;
    });
    p.controller = {
      update: () => {
        const it = SL.emptyIntent();
        n++;
        if (press >= 0 && n === press) it.s1 = true;
        if (press >= 0 && n >= press && n < release) it.s1Held = true;
        return it;
      },
    };
    SL.Input.pressed = (a) => !!mashEvery && a === 'light' && !!b.clash.active && b.frame % mashEvery === 0;
    gg.until(b, () => b.mission.state !== 'running' || phaseId(b) !== 'beamDuel' || (b.mission.flags.duelAttempts || 0) >= 2, 60 * 40, () => {
      if (b.inputLocked && !b.clash.active) b.skipRequested = true;
    });
    SL.Input.pressed = () => false;
    const out = { gg, b, grades, hitBeforeClash, tellView, duel: b.mission.flags.duel, phase: phaseId(b), state: b.mission.state, attempts: b.mission.flags.duelAttempts, raditz: r };
    return out;
  }

  test('the Raditz duel: letting go early still meets his beam in a struggle — weaker, never a free kill', () => {
    const r = duel(1, 24);
    eq(r.grades.length, 1, 'one struggle');
    eq(r.grades[0].grade, 'early', 'graded early');
    ok(r.grades[0].start < 0.45, 'the collision starts on Goku\'s side of the middle: ' + r.grades[0].start.toFixed(2));
    ok(!r.hitBeforeClash, 'his beam never reaches Raditz before the struggle (he always answers)');
    ok(r.duel.rFire - r.duel.gFire <= 4, 'Raditz answers at once: ' + (r.duel.rFire - r.duel.gFire) + ' frames');
    eq(r.phase, 'aftermath', 'mashed hard, the early struggle is still winnable');
    ok(r.raditz.alive, 'and Raditz is beaten, not dead');
    eq(r.gg.errors.length, 0, 'engine errors: ' + r.gg.errors.slice(0, 2).join(' | '));
  });

  test('the Raditz duel: letting go when his charge flares starts the struggle on his side — the window', () => {
    const r = duel(1, 80);
    ok(r.duel.tellF > 0 && r.duel.gFire > r.duel.tellF, 'released after the flare: tell ' + r.duel.tellF + ', fire ' + r.duel.gFire);
    eq(r.grades[0].grade, 'window', 'graded in the window');
    ok(r.grades[0].start > 0.55, 'the collision starts on Raditz\'s side: ' + r.grades[0].start.toFixed(2));
    ok(!r.hitBeforeClash, 'no free hit either way');
    // found in the browser: from behind Goku, Raditz stood straight behind Goku's own aura and the flare was hidden
    ok(r.tellView && r.tellView.shot && r.tellView.deg > 12, 'the stand-off is framed from the side, the flare clear of Goku: ' + JSON.stringify(r.tellView));
    eq(r.phase, 'aftermath', 'won');
    // timing matters: at a middling mash rate only the window wins
    const middling = { early: duel(1, 24, 8), window: duel(1, 80, 8), late: duel(1, 999, 8) };
    eq(middling.window.phase, 'aftermath', 'at 7.5 presses a second the window wins');
    ok(middling.early.phase !== 'aftermath', 'the early release does not at that rate (' + middling.early.phase + ')');
    ok(middling.late.phase !== 'aftermath', 'nor does the late one (' + middling.late.phase + ')');
  });

  test('the Raditz duel: holding too long does not hand him the win — his beam forces the Kamehameha out point-blank', () => {
    const r = duel(1, 999);
    ok(r.duel.rFire >= 0 && r.duel.gFire > r.duel.rFire, 'he fired first: ' + r.duel.rFire + ' then Goku ' + r.duel.gFire);
    eq(r.grades[0].grade, 'late', 'graded late');
    ok(r.grades[0].start < 0.3, 'the struggle starts deep on Goku\'s side: ' + r.grades[0].start.toFixed(2));
    eq(r.phase, 'aftermath', 'and it can still be pushed back and won');
    // never firing at all: his beam lands, and Piccolo restages the duel instead of failing it
    const n = duel(-1, 0);
    eq(n.state, 'running', 'no failure');
    ok(n.attempts >= 2, 'the duel is restaged: attempt ' + n.attempts);
  });

  test('the Raditz duel: a lost struggle knocks Goku down and restages it; only the third loss fails the mission', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('whatif_raditz', { startPhase: phaseAt(SL, 'whatif_raditz', 'beamDuel') });
    const p = b.story.goku;
    gg.until(b, () => !b.inputLocked && p.state === 'free', 60 * 30, skipAll(b));
    let losses = 0;
    b.on('clashEnd', (e) => e.winner === b.story.raditz && losses++);
    const m = b.mission;
    p.controller = {
      update: () => {
        const it = SL.emptyIntent();
        const d = m.flags.duel;
        if (!d || d.gFire >= 0) return it;
        if (p.state === 'free') it.s1 = it.s1Held = true;
        else if (p.state === 'beamCharge') it.s1Held = !(d.told && p.stateFrame >= 24);
        return it;
      },
    };
    gg.until(b, () => m.state !== 'running', 60 * 120, () => {
      if (b.inputLocked && !b.clash.active) b.skipRequested = true;
    });
    eq(losses, 3, 'three struggles lost (no mashing)');
    eq(m.state, 'failed', 'the third fails the mission');
    eq(m.flags.duelLosses, 3, 'counted');
  });

  test('the Raditz What-If plays through end to end with normal inputs', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const r = gg.playMission('whatif_raditz', { maxSeconds: 600 });
    eq(r.state, 'success', 'mission state');
    eq(r.m.flags.duelWonGrade, 'window', 'the bot lets go in the window');
    ok(r.b.story.raditz.alive, 'Raditz lives to hear the scouter');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ camera */

  function freeBattle(gg, opts = {}) {
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 6 });
    b.aiLocked = true;
    const p = b.player, v = b.fighters[1];
    if (opts.noEnemy) {
      v.setHidden(true);
      v.untargetable = true;
    }
    p.setPosition(new V3(0, 0, 0));
    if (!opts.locked) SL.Targeting.unlock(b, p, true);
    gg.step(b, 30);
    return { b, p, v };
  }
  const look = (b, x, frames = 20) => {
    for (let i = 0; i < frames; i++) {
      b.lookAcc.x += x;
      b.update(1 / 60);
    }
  };

  test('camera: moving the mouse right turns the view right — unlocked and locked on — and Invert Horizontal flips it', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    for (const locked of [false, true]) {
      const { b } = freeBattle(gg, { locked, noEnemy: !locked });
      const cam = b.camera;
      const ahead = cam.look.clone().add(cam.look.clone().sub(cam.pos).normalize().multiplyScalar(20));
      look(b, 0.02);
      cam.camera.updateMatrixWorld();
      const x = ahead.clone().project(cam.camera).x;
      ok(x < -0.05, (locked ? 'locked' : 'unlocked') + ': what was straight ahead moved left on screen (the view turned right): ' + x.toFixed(3));
      b.dispose();
    }
    ok(SL.Input.mapLook(100, 0).x > 0 && SL.Input.mapLook(0, 0, 0.8, 0).x > 0, 'mouse right and stick right give positive look (the view turns right)');
    SL.Settings.data.camera.invertX = true;
    ok(SL.Input.mapLook(100, 0).x < 0 && SL.Input.mapLook(0, 0, 0.8, 0).x < 0, 'Invert Horizontal reverses both');
    SL.Settings.data.camera.invertX = false;
  });

  test('camera: running where the view points does not keep turning it, strafing does not swing it, and a real turn is followed', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const { b, p } = freeBattle(gg, { noEnemy: true });
    eq(b.camMode, 'adventure', 'nothing hostile near: adventure camera');
    look(b, 0.03); // the player turns the view first
    gg.step(b, 90); // let it settle
    const run = (mx, my, frames) => {
      p.controller = { update: () => Object.assign(SL.emptyIntent(), { mx, my, camYaw: b.cameraYaw() }) };
      const y0 = b.cameraYaw();
      gg.step(b, frames);
      return Math.abs(SL.util.wrapAngle(b.cameraYaw() - y0));
    };
    const fwd = run(0, 1, 240);
    ok(fwd < 0.12, 'forward for 4 s: the view holds (' + fwd.toFixed(3) + ' rad) — before this pass it kept turning');
    const strafe = run(1, 0, 180);
    ok(strafe < 0.15, 'strafing for 3 s does not drag the view around (' + strafe.toFixed(3) + ')');
    const turn = run(0.7, 0.7, 180);
    ok(turn > 0.4, 'running at an angle for 3 s: the camera comes round behind (' + turn.toFixed(3) + ')');
    b.dispose();
  });

  test('camera modes: combat while locked, adventure out of a fight, free (no drift) in one; the setting and a mission can choose', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const a = freeBattle(gg, { locked: true });
    ok(a.p.aimTarget(), 'locked on');
    eq(a.b.camMode, 'combat', 'locked on: combat camera');
    SL.Targeting.unlock(a.b, a.p, true);
    gg.step(a.b, 20);
    eq(a.b.camMode, 'free', 'unlocked with an enemy 6 m away: free camera');
    // free: running does not recentre it
    look(a.b, 0.03);
    gg.step(a.b, 60);
    a.p.controller = { update: () => Object.assign(SL.emptyIntent(), { mx: 0.7, my: 0.7, camYaw: a.b.cameraYaw() }) };
    const y0 = a.b.cameraYaw();
    gg.step(a.b, 180);
    ok(Math.abs(SL.util.wrapAngle(a.b.cameraYaw() - y0)) < 0.1, 'free camera stays where it was pointed');
    a.b.dispose();
    const c = freeBattle(gg, { noEnemy: true });
    eq(c.b.camMode, 'adventure', 'no enemy near: adventure');
    SL.Settings.data.camera.style = 'free';
    gg.step(c.b, 2);
    eq(c.b.camMode, 'free', 'Camera Style: Free');
    SL.Settings.data.camera.style = 'auto';
    c.b.cameraModeOverride = 'free';
    gg.step(c.b, 2);
    eq(c.b.camMode, 'free', 'a mission can override');
    c.b.cameraModeOverride = null;
    gg.step(c.b, 2);
    eq(c.b.camMode, 'adventure', 'and hand it back');
    ok(SL.Settings.SCHEMA.some((s) => s.key === 'style' && s.cat === 'camera') && SL.Settings.SCHEMA.some((s) => s.key === 'invertX'), 'both are real settings');
    eq(SL.Settings.ACTION_LABELS.target, 'Lock-On / Free Camera', 'the controls screen names what Tab does');
    ok(/Descend/.test(SL.Settings.ACTION_LABELS.descend) && /Ascend/.test(SL.Settings.ACTION_LABELS.ascend), 'and ascend / descend');
    c.b.dispose();
  });

  test('Snake Way: an adventure camera the whole run, no target to fixate on, and the run still clears', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const modes = new Set();
    const r = gg.playMission('saiyan_snakeway', {
      maxSeconds: 300,
      onBattle: (bb) => bb.on('roadMarker', () => modes.add(bb.camMode)),
    });
    eq(r.state, 'success', 'mission state');
    eq([...modes].join(','), 'adventure', 'adventure camera at every road post');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  /* ------------------------------------------------------------ lock-on / free aim / environment */

  test('lock-on: Tab frees the camera, Tab again locks what you look at, Next Target reacquires', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const { b, p, v } = freeBattle(gg, { locked: true });
    ok(SL.Targeting.isLocked(p) && p.target === v, 'starts locked on Vegeta');
    SL.Targeting.toggle(b, p);
    ok(!SL.Targeting.isLocked(p) && !p.target, 'Tab: free camera, no target');
    gg.step(b, 5);
    eq(b.camMode, 'free', 'and the camera is the free one');
    SL.Targeting.toggle(b, p);
    eq(p.target, v, 'Tab again: locked on what is in view');
    SL.Targeting.unlock(b, p);
    SL.Targeting.next(b, p, 1);
    eq(p.target, v, 'Next Target from free aim locks on too');
    b.dispose();
  });

  test('far environmental targets: a prop beyond the arena can be locked, and shots at it fly all the way there', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const { b, p } = freeBattle(gg, { noEnemy: true });
    // a target far outside the play area and high in the sky
    const far = b.stage.addProp({ kind: 'objective', pos: new V3(60, 160, -260), r: 18, hp: 1, id: 'sky' });
    Object.assign(far, { objective: true, far: true, lockable: true, lockRange: 560, static: true, name: 'the Sky Target' });
    ok(SL.Targeting.candidates(b, p).some((c) => c.prop === far), 'it is a candidate at ' + Math.round(far.pos.distanceTo(p.pos)) + ' m');
    SL.Targeting.next(b, p, 1);
    eq(p.lockProp, far, 'Next Target locks it');
    eq(SL.Targeting.farProp(b, p), far, 'and it is the far target shots go to');
    let destroyed = false, farShot = null;
    b.on('propDestroyed', (e) => e.prop === far && (destroyed = true));
    b.on('farShot', (e) => (farShot = e));
    p.ki = p.kiMax;
    p.controller = gg.script(b, { 1: { blast: true } });
    gg.until(b, () => destroyed, 60 * 12);
    ok(farShot && farShot.kind === 'projectile', 'a ki blast was sent at it');
    ok(destroyed, 'and destroyed it, far outside the arena bounds');
    // free aim: looking at it (within the crosshair assist) is enough, no lock
    const far2 = b.stage.addProp({ kind: 'objective', pos: new V3(-40, 140, 240), r: 18, hp: 1, id: 'sky2' });
    Object.assign(far2, { objective: true, far: true, lockable: true, lockRange: 560, static: true, name: 'the Other Target' });
    SL.Targeting.unlock(b, p, true);
    const cam = b.camera;
    // point the view at it
    cam.look.copy(far2.pos);
    eq(SL.Targeting.farProp(b, p), far2, 'free-aimed at it through the crosshair');
    b.dispose();
  });

  test('the moon: locked on the Great Ape a shot hits the Ape; the moon must be aimed at — by lock, Next Target, or the skill wheel', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const idx = phaseAt(SL, 'saiyan_survival', 'moon');
    const b = gg.mission('saiyan_survival', { startPhase: idx });
    const m = b.mission;
    gg.until(b, () => m.objectives.some((o) => o.id === 'moon' && !o.done) && !b.inputLocked, 60 * 90, () => {
      if (b.inputLocked) b.skipRequested = true;
      // Piccolo keeps the giant busy for 20 s: guard through it
      const pc = b.story.piccolo;
      if (b.player === pc && !b.inputLocked) pc.controller = { update: () => Object.assign(SL.emptyIntent(), { guard: true }) };
    });
    const pc = b.story.piccolo, ape = b.story.gape, moon = b.story.moonProp;
    ok(moon && moon.far && moon.alive, 'the moon is a real far target now');
    ok(SL.Targeting.candidates(b, pc).some((c) => c.prop === moon), 'lockable from the ground');
    // locked on the Ape: shots are aimed at the Ape
    SL.Targeting.lock(b, pc, { fighter: ape, kind: 'boss' });
    eq(SL.Targeting.farProp(b, pc), null, 'locked on the Ape, nothing goes to the moon');
    // the skill wheel entry locks the moon and fires the same ki blast
    const entry = SL.RadialMenu.buildEntries(pc, b).find((e) => e.id === 'moonBlast');
    ok(entry && entry.aim === 'environment' && entry.targetName === 'the Moon', 'the wheel says where it goes');
    pc.setState('free');
    pc.controller = { update: () => SL.emptyIntent() };
    entry.run();
    eq(pc.lockProp, moon, 'the wheel locked the moon');
    let fired = null;
    b.on('farShot', (e) => (fired = e));
    gg.until(b, () => !!fired || !moon.alive, 60 * 3);
    ok(fired && fired.prop === moon, 'and the blast went at the moon');
    gg.until(b, () => !moon.alive || m.state !== 'running', 60 * 20, skipAll(b));
    ok(!moon.alive, 'the moon is destroyed by the shot itself');
    gg.until(b, () => m.objectives.some((o) => o.id === 'moon' && o.done) || m.state !== 'running', 60 * 10, skipAll(b));
    ok(m.objectives.find((o) => o.id === 'moon').done, 'objective complete');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"Alone in the Wild" plays through with the moon aimed at properly (Next Target from the Ape to the moon)', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const shots = [];
    const r = gg.playMission('saiyan_survival', { maxSeconds: 900, onBattle: (bb) => bb.on('farShot', (e) => shots.push(e.kind)) });
    eq(r.state, 'success', 'mission state');
    ok(shots.length >= 1, 'the moon fell to an aimed shot: ' + shots.join(','));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('skill wheel: every technique says what it is aimed at (target, all around, self)', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'krillin', p2: 'vegeta', distance: 6 });
    const e = SL.RadialMenu.buildEntries(b.player, b).filter((x) => x.kind === 'special');
    ok(e.length >= 3 && e.every((x) => ['target', 'area', 'self'].includes(x.aim)), 'Krillin: ' + e.map((x) => x.label + ':' + x.aim).join(', '));
    ok(e.some((x) => x.aim === 'area'), 'Scattering Bullet is an area technique');
    const y = SL.RadialMenu.buildEntries(gg.battle({ p1: 'yajirobe', p2: 'vegeta' }).player, b).find((x) => x.label === 'Senzu Bean');
    ok(!y || y.aim === 'self', 'a Senzu Bean is for yourself');
  });

  /* ------------------------------------------------------------ charge mixing */

  test('charge mixing: the player\'s charge leads, two others stay audible, a crowd of identical charges is ducked, auras thin', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 6 });
    const p = b.player;
    const extra = ['krillin', 'tien', 'yamcha', 'piccolo'].map((id, i) => b.spawn({ charId: id, team: 1, pos: new V3(8 + i * 3, 0, 5) }));
    for (const f of [b.fighters[1], ...extra]) f.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.step(b, 60);
    const mix = b.chargeMix;
    eq(mix.primary, 1, 'one primary: the player');
    eq(mix.secondary, 5, 'five secondary chargers');
    eq(mix.ducked, 3, 'all but the two loudest identical loops ducked');
    const w = (f) => b.chargeLoops.find((e) => e.f === f).weight;
    eq(w(p), 1, 'the player at full voice');
    const others = [b.fighters[1], ...extra].map(w).sort((a, c) => c - a);
    ok(others[0] > 0.2 && others[1] > 0.2 && others[2] < 0.1, 'two audible, the rest ducked: ' + others.map((x) => x.toFixed(2)).join(' '));
    ok(p.aura.emitMul === 1 && extra.every((f) => f.aura.emitMul < 0.6), 'secondary auras shed particles, the player\'s does not');
    // a cinematic about somebody else ducks the rest further, and puts that actor first
    b.beginCinematic([extra[0]]);
    gg.step(b, 2);
    eq(w(extra[0]), 1, 'the cinematic actor leads');
    ok(w(extra[1]) < 0.2 && w(extra[1]) < others[0], 'the others fall back further: ' + w(extra[1]).toFixed(2));
    b.endCinematic();
    b.dispose();
  });

  test('charge mixing: a transformation outranks ordinary charging', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'krillin', p2: 'goku', distance: 20 });
    const g = b.fighters[1];
    g.ki = g.kiMax;
    g.controller = { update: () => Object.assign(SL.emptyIntent(), { transform: true }) };
    b.player.controller = { update: () => Object.assign(SL.emptyIntent(), { charge: true }) };
    gg.until(b, () => g.state === 'transform' || g.state === 'transformSequence', 120);
    gg.step(b, 20);
    const e = b.chargeLoops.find((x) => x.f === g && x.tag === 'transform');
    ok(e && e.primary, 'the transforming Goku is primary');
    ok(g.aura.emitMul === 1, 'and his aura keeps every particle');
    b.dispose();
  });

  /* ------------------------------------------------------------ flagship cinematics */

  test('Father-Son Kamehameha: his father is at his back as a spirit — seen, never touched, never a fighter — and goes with the beam', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      let atClash = null;
      const beats = [];
      let gokuHit = 0, voiceF = -1, lens = Infinity;
      const r = gg.playMission('cell_games', {
        startPhase: phaseAt(SL, 'cell_games', 'beam'),
        maxSeconds: 300,
        watch,
        onBattle: (bb) => {
          bb.on('clashStart', () => {
            const g = bb.story.goku, gh = bb.story.gohan;
            const behind = g.pos.clone().sub(gh.pos).dot(gh.forward);
            atClash = atClash || { on: bb.story.spiritOn, hidden: g.hidden, intangible: g.intangible, untargetable: g.untargetable, brain: g.controller instanceof SL.AIController, behind, d: g.pos.distanceTo(gh.pos), halo: !!bb.story.halo };
          });
          bb.on('fskBeat', (e) => {
            beats.push(e.beat);
            if (e.beat === 'voice') voiceF = bb.frame;
          });
          bb.on('damage', (e) => e.target === bb.story.goku && gokuHit++);
          // the voice insert's lens, measured against the clash point (found in the browser: inside its flashes the frame went white)
          const cu = bb.camera.update.bind(bb.camera);
          bb.camera.update = (...a) => {
            const out = cu(...a);
            if (voiceF >= 0 && bb.frame - voiceF < 150 && bb.clash.active) lens = Math.min(lens, bb.camera.pos.distanceTo(bb.clash.active.point));
            return out;
          };
        },
      });
      const tag = watch ? 'watched' : 'skipped';
      eq(r.state, 'success', tag + ': mission state');
      ok(atClash && atClash.on && !atClash.hidden && atClash.intangible && atClash.untargetable && !atClash.brain, tag + ': spirit present in the struggle, intangible, untargetable, no brain: ' + JSON.stringify(atClash));
      ok(atClash.behind < -0.5 && atClash.d < 2, tag + ': at his back (' + atClash.behind.toFixed(2) + ' m behind)');
      ok(atClash.halo, tag + ': with a halo');
      eq(beats.join(','), 'voice,vegeta,through', tag + ': voice, Vegeta, the push through');
      eq(gokuHit, 0, tag + ': nothing ever hits the spirit');
      ok(lens > 5 && lens < Infinity, tag + ': the voice insert keeps its lens clear of the clash light: ' + lens.toFixed(1) + ' m');
      ok(!r.b.story.spiritOn, tag + ': gone by the end');
      eq(gg.errors.length, 0, tag + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('Bardock\'s last moments: the armor fractures, breaks away, and he is thrown back through the light before it takes him', () => {
    const g = H.create({ quiet: true, seed: 5 });
    const b = g.mission('prologue_final_stand', { startPhase: 5 });
    const m = b.mission;
    const beats = [];
    b.on('cinematicBeat', (e) => beats.push(e));
    let atBreak = null, atBlown = null, atConsumed = null;
    g.until(b, () => m.state !== 'running', 60 * 240, () => {
      if (phaseId(b) === 'frieza' && b.inputLocked) b.skipRequested = true;
      const ctx = m.endingCtx;
      if (!ctx) return;
      const A = b.player.model.armorParts;
      if (ctx.beat === 'defeat' && A && !atBreak) atBreak = null;
      if (ctx.beat === 'armorBreak' && !atBreak && A.level >= 4) atBreak = { level: A.level, plate: A.plate.visible, pads: A.pads.filter((x) => x.visible).length };
      if (ctx.beat === 'blownAway' && !atBlown) atBlown = b.player.pos.clone();
      if (ctx.beat === 'consumed' && !atConsumed) atConsumed = { pos: b.player.pos.clone(), from: ctx.defeatPos.clone() };
    });
    eq(m.state, 'success', 'mission state');
    const ids = beats.map((x) => x.id);
    ok(ids.indexOf('smile') < ids.indexOf('armorBreak') && ids.indexOf('armorBreak') < ids.indexOf('blownAway') && ids.indexOf('blownAway') < ids.indexOf('consumed'), 'smile → armor → blown away → consumed: ' + ids.join(','));
    ok(atBreak && atBreak.level === 4 && !atBreak.plate && atBreak.pads === 0, 'the shoulder guards and the chest plate are gone: ' + JSON.stringify(atBreak));
    const T = (id) => beats.find((x) => x.id === id).time;
    ok(T('consumed') - T('blownAway') >= 1, 'he is thrown for a real moment first: ' + (T('consumed') - T('blownAway')).toFixed(2) + ' s');
    ok(atConsumed && atConsumed.pos.distanceTo(atConsumed.from) > 12, 'thrown back, not dropped: ' + atConsumed.pos.distanceTo(atConsumed.from).toFixed(1) + ' m');
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });
};
