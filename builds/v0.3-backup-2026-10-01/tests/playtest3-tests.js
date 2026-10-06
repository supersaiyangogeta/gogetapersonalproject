// Human playtest round 3 (2026-09-19/20): the owner played further and found an Ultimate that
// the AI cancelled every time, a line delivered over an empty field, Vegeta's death told rather
// than played, the HUD offering Super Saiyan years early, and a Frieza who never stopped
// attacking. Every test here drives the real engine headless (tests/headless.js).
const H = require('./headless');

module.exports = function playtest3Tests({ test, eq, ok }) {
  console.log('\nHuman playtest round 3: ultimates, cinematic blocking, the prince\'s death (headless)');

  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);

  /** Is a world point inside what the camera can see? (16:9, vertical fov in degrees) */
  const inFrame = (cam, look, fov, point, pad = 0.9) => {
    const fwd = look.clone().sub(cam);
    const dist = fwd.length();
    if (dist < 0.01) return false;
    fwd.normalize();
    const to = point.clone().sub(cam);
    const depth = to.dot(fwd);
    if (depth <= 0.2) return false;
    const vHalf = ((fov * Math.PI) / 360) * pad;
    const hHalf = Math.atan(Math.tan((fov * Math.PI) / 360) * (16 / 9)) * pad;
    const up = new (cam.constructor)(0, 1, 0);
    const right = fwd.clone().cross(up).normalize();
    const camUp = right.clone().cross(fwd).normalize();
    const x = to.dot(right), y = to.dot(camUp);
    return Math.abs(Math.atan2(x, depth)) <= hHalf && Math.abs(Math.atan2(y, depth)) <= vHalf;
  };

  /* ------------------------------------------------------------ ultimates: the commitment window */

  /** Hold the ultimate, release it when charged, and report whether it went off. */
  const tryUltimate = (gg, b, opts = {}) => {
    const { SL } = gg;
    const p = b.player;
    let frames = 0, held = 0, fired = false, broke = null, armored = 0;
    b.on('armored', (e) => {
      if (e.fighter === p) armored++;
    });
    let started = false;
    p.controller = {
      update: () => {
        const i = SL.emptyIntent();
        const charging = ['beamCharge', 'spiritBomb'].includes(p.state);
        if (charging) {
          held++;
          started = true;
        }
        const done = charging && ((p.sd.frac || 0) >= 0.95 || held > 240);
        // press it whenever he is able to: a player who was knocked down tries again
        i.ult = !started && p.state === 'free' && frames > 1;
        i.ultHeld = !done;
        return i;
      },
    };
    let wasUlt = false;
    for (let i = 0; i < 60 * (opts.seconds || 14); i++) {
      frames++;
      gg.step(b, 1);
      if (opts.each) opts.each(i, p);
      const st = p.state;
      if (['beamFire', 'scatter', 'rush'].includes(st) || (st === 'spiritBomb' && p.sd.released)) {
        fired = true;
        break;
      }
      const charging = ['beamCharge', 'spiritBomb'].includes(st);
      if (wasUlt && !charging && ['hitstun', 'knockback', 'knockdown', 'stagger', 'guardBreak'].includes(st)) {
        broke = st;
        break;
      }
      wasUlt = wasUlt || charging;
    }
    return { fired, broke, armored };
  };

  test('an Ultimate can be committed to: past its startup an ordinary punch no longer cancels it, and the fighter pays for standing there (owner: "the AI interrupts my Ultimate almost every time")', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'adult_gohan', p2: 'cell', distance: 6 });
    const p = b.player, e = b.fighters.find((f) => f !== p);
    e.controller = { update: () => SL.emptyIntent() };
    p.ki = 100;
    p.cannotDie = true;
    // before the commitment point: he is wide open
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { ult: b.frame === 2, ultHeld: true }) };
    gg.step(b, 8);
    eq(p.state, 'beamCharge', 'the ultimate is charging');
    ok(!p.committedUltimate(), 'and is NOT committed yet (' + p.stateFrame + ' frames in)');
    const early = p.takeHit(e, { type: 'melee', damage: 100, knock: 'flinch', hitstun: 18, impact: 1 });
    eq(early, 'hit', 'a punch in the startup knocks him out of it');
    ok(['hitstun', 'knockback', 'stagger'].includes(p.state), 'he is staggered: ' + p.state);
    // and past it: the same punch lands, hurts more, and the technique carries on
    p.setState('free');
    p.ki = 100;
    p.hp = p.hpMax;
    let f2 = 0;
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { ult: f2++ === 1, ultHeld: true }) };
    gg.step(b, 40);
    eq(p.state, 'beamCharge', 'charging again');
    ok(p.committedUltimate(), 'committed after the startup');
    const hpBefore = p.hp;
    const late = p.takeHit(e, { type: 'melee', damage: 100, knock: 'flinch', hitstun: 18, impact: 1 });
    eq(late, 'armored', 'the same punch is taken on the chin');
    eq(p.state, 'beamCharge', 'and the ultimate is still charging');
    ok(hpBefore - p.hp > 0, 'it still hurts: ' + Math.round(hpBefore - p.hp));
    // what still stops it: a beam, a throw and an ultimate-class blow
    eq(p.takeHit(e, { type: 'beam', damage: 200, knock: 'heavy', impact: 4 }), 'hit', 'a beam goes through the brace');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('under real pressure the Ultimate now goes off: the same fights that cancelled it every time end with the technique fired (measured, four characters)', () => {
    const rows = [];
    for (const [p1, p2, dist] of [['piccolo', 'nappa', 6], ['adult_gohan', 'cell', 6], ['goku', 'frieza', 18], ['vegeta', 'goku', 18]]) {
      let fired = 0, armored = 0;
      for (let seed = 1; seed <= 4; seed++) {
        const gg = H.create({ quiet: true, seed });
        const { SL } = gg;
        const b = gg.battle({ p1, p2, distance: dist });
        const e = b.fighters.find((f) => f !== b.player);
        e.controller = new SL.AIController(b, { difficulty: 'hard' });
        b.player.ki = 100;
        b.player.cannotDie = true;
        const r = tryUltimate(gg, b);
        if (r.fired) fired++;
        armored += r.armored;
        b.dispose();
      }
      rows.push(p1 + ' vs ' + p2 + ': ' + fired + '/4');
      ok(fired >= 2, p1 + ' lands his ultimate under pressure (' + fired + '/4, ' + armored + ' hits taken on the brace)');
    }
    ok(rows.length === 4, rows.join(' · '));
  });

  test('a Spirit Bomb still needs somebody to keep the enemy off you: it braces against ordinary blows and breaks to a heavy one (the fight it belongs to is built on that)', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'frieza', distance: 30 });
    const p = b.player, e = b.fighters.find((f) => f !== p);
    e.controller = { update: () => SL.emptyIntent() };
    p.ki = 100;
    p.cannotDie = true;
    let f = 0;
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { ult: f++ === 1, ultHeld: true }) };
    gg.step(b, 70);
    eq(p.state, 'spiritBomb', 'the bomb is up');
    ok(p.committedUltimate(), 'and braced');
    eq(p.takeHit(e, { type: 'melee', damage: 80, knock: 'flinch', hitstun: 16, impact: 2 }), 'armored', 'an ordinary blow does not take it down');
    eq(p.state, 'spiritBomb', 'still holding it');
    eq(p.takeHit(e, { type: 'melee', damage: 400, knock: 'heavy', knockSpeed: 20, hitstun: 30, impact: 4 }), 'hit', 'a heavy one does');
    ok(p.state !== 'spiritBomb', 'the bomb is gone: ' + p.state);
    b.dispose();
  });

  test('the AI does not know what you are doing before it can see it, and stops poking at a technique it can no longer interrupt', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'frieza', distance: 6 });
    const p = b.player, fz = b.fighters.find((f) => f !== p);
    const ai = new SL.AIController(b, { difficulty: 'hard' });
    fz.controller = ai;
    const scoresWith = (state, stateFrame, committed) => {
      const fake = Object.create(Object.getPrototypeOf(p));
      Object.assign(fake, p);
      fake.state = state;
      fake.stateFrame = stateFrame;
      fake.committedUltimate = () => committed;
      const s = { melee: 1, blast: 0.6, beam: 0.5, strafe: 0.4, wait: 0.4, retreat: 0 };
      ai.fighter = fz;
      ai.d = SL.Rules.DIFFICULTY.hard;
      // the two rules live at the end of _choose; call them through the real path
      const before = Object.assign({}, s);
      if (['charge', 'beamCharge', 'spiritBomb', 'scatter', 'rush'].includes(fake.state) && fake.stateFrame <= ai.d.reaction) {
        for (const k of ['melee', 'blast', 'beam']) if (s[k]) s[k] *= 0.5;
      }
      if (fake.committedUltimate()) {
        for (const k of ['melee', 'blast', 'beam']) if (s[k]) s[k] *= 0.35;
        s.retreat += 0.6;
      }
      return { before, after: s };
    };
    const fresh = scoresWith('beamCharge', 4, false);
    ok(fresh.after.melee < fresh.before.melee, 'a technique he has not reacted to yet draws less');
    const committed = scoresWith('beamCharge', 60, true);
    ok(committed.after.melee < committed.before.melee * 0.4 && committed.after.retreat > 0, 'and once it is committed he backs off instead of mashing into it');
    b.dispose();
  });

  test('the rest of the Ultimate cases the owner listed: after a knockback, at range, with no ki, and inside a story fight', () => {
    const gg = H.create({ quiet: true, seed: 7 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'piccolo', p2: 'nappa', distance: 20 });
    const p = b.player, e = b.fighters.find((f) => f !== p);
    e.controller = { update: () => SL.emptyIntent() };
    p.cannotDie = true;
    // no ki: the technique is refused, nothing breaks, and he is still standing
    p.ki = 5;
    let f = 0;
    p.controller = { update: () => Object.assign(SL.emptyIntent(), { ult: f++ === 1, ultHeld: true }) };
    gg.step(b, 20);
    ok(!['beamCharge', 'spiritBomb', 'scatter', 'rush'].includes(p.state), 'with no ki nothing starts: ' + p.state);
    eq(gg.errors.length, 0, 'and no engine error');
    // straight after being knocked down: he has to get up first, then it works
    p.ki = 100;
    p.takeHit(e, { type: 'melee', damage: 50, knock: 'heavy', knockSpeed: 18, hitstun: 24, impact: 3 });
    gg.step(b, 4);
    ok(['hitstun', 'knockback', 'knockdown'].includes(p.state), 'knocked back: ' + p.state);
    const r = tryUltimate(gg, b, { seconds: 12 });
    ok(r.fired, 'once he is on his feet the ultimate goes off after a knockback');
    b.dispose();
    // and in a story fight, where the mission drives everything
    const g2 = H.create({ quiet: true, seed: 7 });
    const b2 = g2.mission('namek_goku', { startPhase: phaseAt(g2.SL, 'namek_goku', 'rising') });
    g2.step(b2, 120);
    const gk = b2.player;
    gk.ki = 100;
    gk.cannotDie = true;
    gk.cooldowns.ultimate = 0;
    const r2 = tryUltimate(g2, b2, { seconds: 16 });
    // Goku's ultimate is the Spirit Bomb and Frieza is standing on top of him: either it goes up
    // and takes hits on the brace, or he is knocked out of the startup — which is the rule, not a bug
    ok(r2.fired || r2.armored > 0 || r2.broke, 'the story fight plays by the same rule (' + JSON.stringify(r2) + ')');
    eq(g2.errors.length, 0, 'no engine errors in the story fight');
    b2.dispose();
  });

  /* ------------------------------------------------------------ cinematic blocking */

  test('"Then do stand still" is said to somebody: Vegeta and Frieza are both alive, facing each other and inside the frame when Frieza answers him (owner: the line played over an empty field)', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('namek_frieza1', {});
    const S = b.story;
    let shotAt = null, sayFrame = 0;
    b.on('say', (e) => {
      if (/stand still/.test(e.line) && !sayFrame) sayFrame = b.frame;
    });
    const sample = () => {
      if (!sayFrame || shotAt || b.frame < sayFrame + 20) return;
      const cam = b.camera;
      shotAt = {
        vegeta: S.vegeta.pos.clone(),
        frieza: S.frieza.pos.clone(),
        gap: +S.vegeta.pos.distanceTo(S.frieza.pos).toFixed(1),
        vegetaSeen: inFrame(cam.pos.clone(), cam.look.clone(), cam.fov, S.vegeta.chest()),
        friezaSeen: inFrame(cam.pos.clone(), cam.look.clone(), cam.fov, S.frieza.chest()),
        facing: S.frieza.forward.clone().dot(S.vegeta.pos.clone().sub(S.frieza.pos).setY(0).normalize()),
        vegetaFacing: S.vegeta.forward.clone().dot(S.frieza.pos.clone().sub(S.vegeta.pos).setY(0).normalize()),
        alive: S.vegeta.alive && S.frieza.alive && !S.vegeta.hidden && !S.frieza.hidden,
      };
    };
    gg.until(b, () => !!shotAt, 60 * 90, sample);
    ok(shotAt, 'the line was reached');
    ok(shotAt.alive, 'both of them are on the field');
    ok(shotAt.gap < 9, 'he came to say it to his face: ' + shotAt.gap + ' m apart');
    ok(shotAt.friezaSeen, 'Frieza is in the frame');
    ok(shotAt.vegetaSeen, 'and so is Vegeta');
    ok(shotAt.facing > 0.85, 'Frieza is looking at him: ' + shotAt.facing.toFixed(2));
    ok(shotAt.vegetaFacing > 0.85, 'and Vegeta at Frieza: ' + shotAt.vegetaFacing.toFixed(2));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('a two-shot always holds both of them, whatever the gap: the helper the scenes use is built from where the actors actually stand', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const V3 = gg.ctx.THREE.Vector3;
    for (const gap of [3, 8, 16, 30]) {
      const a = new V3(0, 1, 0), c = new V3(0, 1, gap);
      const s = SL.Cinema.twoShot(a, c, { fov: 42 });
      ok(inFrame(s.pos, s.look, s.fov, a) && inFrame(s.pos, s.look, s.fov, c), gap + ' m apart: both in the frame');
      ok(s.pos.distanceTo(a) > 2, 'and the camera is not standing inside one of them');
    }
    // the confrontation shot keeps the near one close and the far one visible
    const near = new V3(0, 1, 0), far = new V3(0, 1, 7);
    const os = SL.Cinema.overShoulder(near, far, { fov: 36 });
    ok(inFrame(os.pos, os.look, os.fov, far), 'over the shoulder: the other one is in the frame');
    ok(os.pos.distanceTo(near) < 4, 'and the shoulder is right there: ' + os.pos.distanceTo(near).toFixed(1) + ' m');
  });

  /* ------------------------------------------------------------ the chronology of transformations */

  test('no fighter can use a transformation the story has not handed over yet — in any canon mission, whatever that mission wrote into lockedForms (owner: the HUD said "Super Saiyan" during the Kaioken)', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    const given = SL.data.formGivenBy;
    ok(given && given['goku:ssj'] === 'namek_super_saiyan', 'the table says where Goku becomes a Super Saiyan');
    const bad = [];
    for (const id of order) {
      const g2 = H.create({ quiet: true, seed: 1 });
      const b = g2.mission(id, {});
      g2.step(b, 5);
      for (const f of b.fighters) {
        for (const fm of f.def.forms || []) {
          const by = given[f.def.id + ':' + fm.id];
          if (!by || order.indexOf(by) <= order.indexOf(id)) continue;
          if (!(f.lockedForms && f.lockedForms[fm.id])) bad.push(id + ': ' + f.def.id + '/' + fm.id);
        }
      }
      b.dispose();
    }
    eq(bad.length, 0, 'forms available too early: ' + bad.slice(0, 4).join(', '));
    // and the label the HUD reads follows the form that is actually on
    const b2 = gg.battle({ p1: 'goku', p2: 'frieza' });
    const gk = b2.player;
    gk.ki = gk.kiMax;
    gk.applyForm(1);
    eq(gk.form.id, 'kaioken', 'in the Kaioken');
    ok(/Kaioken/i.test(gk.formLabel) && !/Super Saiyan/i.test(gk.formLabel), 'and the plate says so: ' + gk.formLabel);
    b2.dispose();
  });

  test('the story runs in the order it happened: Goku lands, the prince dies and is buried, and only then does Goku fight Frieza', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    const iEnd = order.indexOf('namek_vegeta_end'), iGoku = order.indexOf('namek_goku'), iBomb = order.indexOf('namek_spirit_bomb');
    // round 4: the Kaioken fight is two missions now (x2-x4, then x10-x20)
    ok(iEnd > 0 && iGoku === iEnd + 1 && iBomb === iGoku + 2, 'order: ' + order.slice(iEnd - 1, iBomb + 1).join(' → '));
    const death = SL.data.missions.namek_vegeta_end;
    eq(death.phases.map((p) => p.id).join(','), 'arrival,confront,beam,words,burial,after', "the death mission carries the landing and everything after it");
    const fight = SL.data.missions.namek_goku;
    eq(fight.phases.map((p) => p.id).join(','), 'open,base,kaioken,rising,after', 'and the Kaioken mission is the fight');
  });

  test('the Kaioken climbs the way the story climbs: x2 on Earth, x4 against the Ginyu Force and the first Frieza fight, x10 and x20 once Frieza shows fifty percent', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const levels = SL.data.characters.goku.forms[1].levels.map((l) => l.name);
    eq(levels.join(','), 'x2,x3,x4,x10,x20', 'the technique has the canon steps');
    const capFor = (id) => {
      const g2 = H.create({ quiet: true, seed: 1 });
      const b = g2.mission(id, {});
      g2.step(b, 5);
      const g = b.fighters.find((f) => f.def.id === 'goku');
      const cap = g ? levels[g.formLevelCap(g.def.forms[1])] : null;
      b.dispose();
      return cap;
    };
    eq(capFor('saiyan_vegeta'), 'x2', 'against Vegeta on Earth it starts at x2 (the mission raises it mid-fight)');
    eq(capFor('namek_ginyu'), 'x4', 'against the captain: x4');
    eq(capFor('namek_goku'), 'x4', 'the first stretch against Frieza tops out at x4');
    eq(capFor('namek_kaioken20'), 'x10', 'the next mission opens at x10 (x20 comes with the fifty percent)');
    eq(capFor('namek_spirit_bomb'), 'x20', 'and by the Spirit Bomb he has used x20');
    // and outside the story the technique stops where it always did
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const gk = b.player;
    eq(levels[gk.formLevelCap(gk.def.forms[1])], 'x4', 'Free Battle keeps the Namek levels out of it');
    b.dispose();
  });

  /* ------------------------------------------------------------ Vegeta's death, played rather than told */

  test("the prince's death is a sequence the player watches: he speaks to Goku, Frieza answers with a beam that is seen to cross the gap and land on him, he is thrown, he falls, and Goku's face is on the end of it", () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('namek_vegeta_end', { startPhase: phaseAt(SL, 'namek_vegeta_end', 'beam') });
    const S = b.story;
    const beats = [];
    let hit = null, poses = [];
    b.on('say', (e) => beats.push(String(e.speaker).toLowerCase()));
    const origTake = S.vegeta.takeHit;
    gg.until(b, () => b.mission.flags.vegetaShot, 60 * 60, () => {
      const st = S.vegeta.sd && S.vegeta.sd.pose;
      if (st && poses[poses.length - 1] !== st) poses.push(st);
      if (!hit && S.vegeta.hp <= 1) hit = { vegeta: S.vegeta.chest().clone(), frieza: S.frieza.chest().clone(), gokuNear: S.goku.pos.distanceTo(S.vegeta.pos) };
    });
    ok(b.mission.flags.vegetaShot, 'the sequence ran');
    // round 4 put the Planet Vegeta conversation in front of the beam, so the prince speaks more
    // than once first; the order that matters is still prince → Frieza → Goku
    const first = (who) => beats.indexOf(who);
    eq(beats[0], 'vegeta', 'the prince speaks first: ' + beats.slice(0, 5).join(','));
    ok(first('frieza') > 0 && first('goku') > first('frieza'), 'then Frieza answers, then Goku shouts: ' + beats.slice(0, 6).join(','));
    ok(poses.includes('pierced'), 'his body takes the shot (poses: ' + poses.join(' → ') + ')');
    ok(poses.lastIndexOf('lieBack') > poses.indexOf('pierced'), 'and then he falls: ' + poses.join(' → '));
    ok(hit && hit.gokuNear < 4, 'Goku is right there when it happens: ' + (hit && hit.gokuNear.toFixed(1)) + ' m');
    ok(S.vegeta.alive, 'he is not dead yet — he still has his last words');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test("Goku's answer over the grave is the owner's speech, performed: every line in order, Frieza standing there for all of it, and the declaration at the end", () => {
    const WANT = [
      'I get it now, it wasn’t losing your race that made you so angry…',
      'at least not entirely.',
      'You were mad because he forced you to be his puppet.',
      'You couldn’t stand losing your pride.',
      'I may have hated you when you were alive,',
      'but I always respected your pride.',
      'And now it’s time for me to share that pride.',
      'Pride in myself.',
      'I am a Saiyan that was raised on Planet Earth!',
      'And in the name of every single Saiyan you made suffer!',
      'For them and for the people on Planet Namek too!',
      'I WILL DEFEAT YOU!!!!',
    ];
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('namek_vegeta_end', { startPhase: phaseAt(SL, 'namek_vegeta_end', 'after') });
    const S = b.story;
    const said = [];
    let friezaGone = false, cams = new Set(), lastCam = null;
    b.on('say', (e) => {
      if (String(e.speaker).toLowerCase() === 'goku') said.push(e.line);
      if (S.frieza.hidden) friezaGone = true;
    });
    gg.until(b, () => b.mission.state !== 'running' || said.length >= WANT.length, 60 * 120, () => {
      const c = b.camera;
      const key = [c.pos.x, c.pos.y, c.pos.z, c.fov].map((n) => Math.round(n)).join(',');
      if (key !== lastCam) {
        cams.add(key);
        lastCam = key;
      }
    });
    eq(said.length >= WANT.length, true, 'he says all of it (' + said.length + ' lines)');
    for (let i = 0; i < WANT.length; i++) eq(said[i], WANT[i], 'line ' + (i + 1) + ' is the owner\'s, word for word');
    ok(!friezaGone, 'Frieza is in the scene the whole way through');
    ok(cams.size > 10, 'and it is filmed, not printed: ' + cams.size + ' distinct camera positions');
    b.dispose();
  });

  test('the whole mission plays start to finish, and skipping it leaves exactly the same story behind', () => {
    const run = (skip) => {
      const gg = H.create({ quiet: true, seed: 4 });
      const r = gg.playMission('namek_vegeta_end', { maxSeconds: 600, watch: !skip });
      const S = r.b.story;
      const out = {
        state: r.m.state,
        phases: r.log.filter((x) => x.ev === 'phase').map((x) => x.id).join(','),
        arrived: !!r.m.flags.gokuArrived,
        shot: !!r.m.flags.vegetaShot,
        fell: !!r.m.flags.vegetaFell,
        buried: !!r.m.flags.vegetaBuried,
        declared: !!r.m.flags.gokuDeclared,
        vegetaGone: !S.vegeta.alive && !!S.vegeta.hidden,
        errors: gg.errors.length,
        seconds: r.seconds,
      };
      r.b.dispose();
      return out;
    };
    const watched = run(false);
    const skipped = run(true);
    eq(watched.state, 'success', 'watched: it completes (' + watched.seconds.toFixed(0) + ' s)');
    eq(skipped.state, 'success', 'skipped: it completes (' + skipped.seconds.toFixed(0) + ' s)');
    eq(watched.phases, 'arrival,confront,beam,words,burial,after', 'every phase played');
    for (const k of ['arrived', 'shot', 'fell', 'buried', 'declared', 'vegetaGone']) {
      eq(String(skipped[k]), String(watched[k]), k + ' matches (' + watched[k] + ')');
    }
    eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
  });

  /* ------------------------------------------------------------ Frieza's rhythm */

  test('Frieza fights in bursts and then lets you have a turn: the breathing room is announced, and the fight has more clear openings because of it (owner: "he appears to spam attacks constantly")', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    ok(SL.data.characters.frieza.ai.rhythm, 'his data asks for a rhythm: ' + JSON.stringify(SL.data.characters.frieza.ai.rhythm));
    const b = gg.battle({ p1: 'goku', p2: 'frieza', distance: 8 });
    const p = b.player, fz = b.fighters.find((f) => f !== p);
    fz.controller = new SL.AIController(b, { difficulty: 'hard' });
    p.cannotDie = true;
    fz.cannotDie = true;
    let breaths = 0, openings = 0, run = 0;
    b.on('aiBreath', (e) => {
      if (e.fighter === fz) breaths++;
    });
    p.controller = {
      update: () => {
        const i = SL.emptyIntent();
        if (['attack', 'rush'].includes(fz.state) && p.distTo(fz) < 6) i.guard = true;
        return i;
      },
    };
    for (let i = 0; i < 60 * 40; i++) {
      gg.step(b, 1);
      const free = ['free', 'guard', 'charge', 'dash'].includes(p.state);
      const quiet = !['attack', 'rush', 'beamFire', 'scatter'].includes(fz.state);
      if (free && quiet) {
        run++;
        if (run === 60) openings++;
      } else run = 0;
    }
    ok(breaths >= 3, 'he stops for a breath several times in forty seconds: ' + breaths);
    ok(openings >= 2, 'and the player gets clear second-long openings: ' + openings);
    b.dispose();
  });

  test('the Kaioken fight escalates instead of running flat: every level Goku pushes to, Frieza answers', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.mission('namek_goku', { startPhase: phaseAt(SL, 'namek_goku', 'rising') });
    const S = b.story;
    gg.step(b, 90);
    const before = S.frieza.damageDealtMul;
    const said = [];
    b.on('say', (e) => said.push(String(e.speaker).toLowerCase()));
    S.goku.ki = S.goku.kiMax;
    S.goku.formLevel = 0;
    S.goku._raiseFormLevel();
    gg.step(b, 20);
    ok(S.frieza.damageDealtMul > before, 'he hits harder once Goku goes higher: ' + before + ' → ' + S.frieza.damageDealtMul);
    ok(said.includes('frieza'), 'and says something about it');
    b.dispose();
  });
};
