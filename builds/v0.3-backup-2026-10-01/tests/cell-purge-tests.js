// "The Difference in Power" (2026-09-24): the Cell Games' purge stretch rebuilt as a hack-and-slash
// power reveal — Super Saiyan 2 Gohan against the seven Cell Juniors (src/data/missions/cell_purge.js).
// Behaviour on the real engine, headless: the squad, Gohan's tuning, the finishers, the world, the gi,
// the scenes, the HUD, and Known Bugs #36 (the two-attacker cap) kept fixed.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const H = require('./headless');
const MiniDom = require('./minidom');

module.exports = function cellPurgeTests({ test, eq, ok }) {
  console.log('\nThe Difference in Power: Super Saiyan 2 Gohan against the Cell Juniors (headless)');

  const pi = (SL, id) => SL.data.missions.cell_games.phases.findIndex((p) => p.id === id);
  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const idle = (SL) => ({ update: () => SL.emptyIntent() });

  /** The purge from its checkpoint with the opening skipped: control is his. */
  function purge(seed, o = {}) {
    const gg = o.gg || H.create({ quiet: true, seed });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: pi(SL, 'purge'), onCreate: o.onCreate });
    gg.until(b, () => b.story.purge && b.mission.flags.purgeOpened && !b.inputLocked, 60 * 60, skipAll(b));
    return { gg, SL, b, S: b.story, gh: b.story.gohan, J: b.story.juniors, st: b.story.purge };
  }
  /** Everybody but `keep` out of the way: far off, holding back, brainless. */
  function clearOthers(env, keep) {
    const { b, J, SL } = env;
    J.forEach((j, i) => {
      if (keep.includes(j) || !j.alive) return;
      j.controller = idle(SL);
      j.setHidden(true); // out of the squad's plan as well as out of the way
      env.b.releaseMeleeToken(j);
      j.setPosition(new env.gg.ctx.THREE.Vector3(-14 + i * 2, b.stage.heightAt(-14 + i * 2, -12), -12));
      j.vel.set(0, 0, 0);
    });
  }
  /** Stand `j` in front of Gohan at `d` metres, facing him, without a brain. */
  function standBefore(env, j, d = 1.3) {
    const { gh, SL, b } = env;
    const fwd = gh.forward.clone().setY(0).normalize();
    const p = gh.pos.clone().addScaledVector(fwd, d);
    p.y = b.stage.heightAt(p.x, p.z);
    j.setPosition(p);
    j.prevPos.copy(p);
    j.vel.set(0, 0, 0);
    j.grounded = true;
    j.yaw = j.prevYaw = Math.atan2(gh.pos.x - p.x, gh.pos.z - p.z);
    j.controller = idle(SL);
    j.setHidden(false);
    j.setState('free');
    gh.target = j;
    gh.faceTarget(100);
  }

  test('the stretch opens on a clean Super Saiyan 2 Gohan inside a ring of seven Juniors, with no objective text, and his power is tuned for it', () => {
    const env = purge(3);
    const { SL, b, S, gh, J } = env;
    eq(b.mission.def.phases[b.mission.phaseIndex].id, 'purge', 'the purge checkpoint');
    eq(b.player, gh, 'the player has Gohan');
    eq(gh.form.id, 'ssj2', 'Super Saiyan 2');
    eq(gh.damageLevel || 0, 0, 'clean going in');
    ok(!gh.torn, 'the gi is whole');
    eq(J.length, 7, 'seven Juniors');
    ok(J.every((j) => j.alive && !j.hidden && !j.untargetable && j.controller instanceof SL.AIController), 'all of them alive and fighting');
    ok(J.every((j) => j.distTo(gh) < 7), 'closed in round him: ' + J.map((j) => j.distTo(gh).toFixed(1)).join(','));
    // round him, not in a line: the bearings cover the circle
    const ang = J.map((j) => Math.atan2(j.pos.x - gh.pos.x, j.pos.z - gh.pos.z)).sort((a, c) => a - c);
    let gap = 0;
    for (let i = 0; i < ang.length; i++) gap = Math.max(gap, ((ang[(i + 1) % ang.length] - ang[i] + Math.PI * 4) % (Math.PI * 2)) || Math.PI * 2);
    ok(gap < Math.PI * 0.6, 'no side of him is open: widest gap ' + gap.toFixed(2) + ' rad');
    ok(b.stage.arena.onRing(gh.pos.x, gh.pos.z), 'on the ring itself');
    ok(S.cell.untargetable && S.cell.state === 'scripted', 'Cell watches');
    ok(S.piccolo.untargetable, 'his friends lie where they fell');
    eq(b.mission.objectives.length, 0, 'no objective text');
    eq(gh.storyArmor, 1, 'light blows do not move him');
    ok(gh.storyEvade && gh.storyEvade.mode === 'guard' && gh.storyEvade.behind, 'he feels what comes from behind');
    eq(gh.specFor('ultimate').id, 'tg2Burst', 'the Aura Burst on the ultimate button');
    eq(b.juniorMood, 'hunt', 'the squad hunts');
    ok(J.every((j) => j.def.ai.hooks === 'cell_junior'), 'on the squad hook');
    eq(env.gg.errors.length, 0, 'engine errors: ' + env.gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the opening (they close in; he looks at them) leaves the same fight watched or skipped', () => {
    const run = (watch) => {
      const gg = H.create({ quiet: true, seed: 4 });
      const { SL } = gg;
      let seen = false, snap = null;
      // the state the scene hands over, taken the moment it ends (the fight starts moving right after)
      const b = gg.mission('cell_games', {
        startPhase: pi(SL, 'purge'),
        onCreate: (bb) => {
          bb.on('sceneStart', (e) => (seen = seen || e.id === 'purge_open'));
          bb.on('sceneEnd', (e) => {
            if (e.id !== 'purge_open') return;
            const S = bb.story;
            snap = JSON.stringify({ j: S.juniors.map((j) => [j.pos.x.toFixed(2), j.pos.z.toFixed(2), j.state]), g: S.gohan.pos.toArray().map((v) => v.toFixed(2)), s: S.gohan.state, f: S.gohan.form.id, d: S.gohan.damageLevel || 0 });
          });
        },
      });
      let frames = 0;
      gg.until(b, () => b.mission.flags.purgeOpened && !b.inputLocked, 60 * 60, () => {
        frames++;
        if (!watch && b.inputLocked) b.skipRequested = true;
      });
      b.dispose();
      return { snap, frames, seen, errors: gg.errors.length, warn: gg.warnings.filter((w) => /pose/i.test(w)) };
    };
    const w = run(true), s = run(false);
    ok(w.seen && s.seen, 'the scene is played');
    eq(s.snap, w.snap, 'skipped: the same circle, the same states');
    ok(s.frames < w.frames, 'skipping is faster: ' + s.frames + ' vs ' + w.frames);
    eq(w.warn.length, 0, 'every pose exists: ' + w.warn.slice(0, 2).join(' | '));
    eq(w.errors + s.errors, 0, 'no engine errors');
  });

  test('the first blow that reaches him is caught in one hand, and the Junior is sent across the ring — watched or skipped', () => {
    for (const watch of [false, true]) {
      const env = purge(5);
      const { gg, SL, b, gh, st } = env;
      gh.controller = idle(SL);
      let caught = null;
      b.on('purgeCatch', (e) => (caught = e.fighter));
      gg.until(b, () => !!caught && !b.inputLocked, 60 * 40, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
      });
      ok(caught, (watch ? 'watched' : 'skipped') + ': a Junior was caught');
      ok(b.mission.flags.purgeCaught && st.caught, 'the beat is marked');
      ok(caught.alive && caught.hp < caught.hpMax * 0.8, 'hurt, not finished: ' + Math.round(caught.hp));
      const from = gh.pos.clone();
      let far = 0;
      gg.step(b, 90, () => {
        far = Math.max(far, caught.pos.distanceTo(from));
      });
      ok(far > 7, 'thrown well clear of him: ' + far.toFixed(1) + ' m');
      eq(st.kills, 0, 'nobody died to it');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    }
  });

  test('the squad works him from every side: several are active, two at most swing at once, the circle throws ki, and nobody stun-locks him', () => {
    const env = purge(6);
    const { gg, SL, b, gh, J } = env;
    // a player who only guards: the worst case for dogpiling (the catch beat is skipped when it comes)
    gh.controller = { update: () => Object.assign(SL.emptyIntent(), { guard: b.frame % 90 < 60 }) };
    let maxSwing = 0, twoAtOnce = 0, blasts = 0, longest = 0, chain = 0, lastHit = -999;
    const bearings = new Set();
    b.on('special', (e) => {
      if (J.includes(e.fighter) && e.spec.id === 'cjBlast') blasts++;
    });
    b.on('damage', (e) => {
      if (e.blocked || e.target !== gh || !J.includes(e.attacker)) return;
      chain = b.frame - lastHit < 45 ? chain + 1 : 1;
      lastHit = b.frame;
      longest = Math.max(longest, chain);
    });
    gg.step(b, 60 * 25, () => {
      if (b.inputLocked) b.skipRequested = true;
      const on = J.filter((j) => j.alive && j.target === gh && j.state === 'attack');
      maxSwing = Math.max(maxSwing, on.length);
      if (on.length === 2) twoAtOnce++;
      for (const j of on) bearings.add(Math.round(((Math.atan2(j.pos.x - gh.pos.x, j.pos.z - gh.pos.z) + Math.PI) / (Math.PI * 2)) * 8) % 8);
    });
    ok(maxSwing <= 2, 'never more than two swinging at him: ' + maxSwing);
    ok(twoAtOnce > 0, 'but two at once does happen: ' + twoAtOnce + ' frames');
    ok(bearings.size >= 4, 'from different sides (eighths of the circle): ' + [...bearings].join(','));
    ok(blasts >= 1, 'the ones waiting throw Junior Blasts: ' + blasts);
    ok(longest <= 30, 'no endless chain on him: ' + longest);
    ok(J.filter((j) => j.alive).length >= 4, 'several are still in it at the end: ' + J.filter((j) => j.alive).length);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the Aura Burst hits every Junior round him and sends them off in different directions; it costs its ki and has a cooldown', () => {
    const env = purge(2);
    const { gg, SL, b, gh, J } = env;
    const three = J.slice(0, 3);
    clearOthers(env, three);
    three.forEach((j, i) => {
      const a = (i / 3) * Math.PI * 2;
      const p = gh.pos.clone().add(new gg.ctx.THREE.Vector3(Math.sin(a) * 2.4, 0, Math.cos(a) * 2.4));
      p.y = b.stage.heightAt(p.x, p.z);
      j.setPosition(p);
      j.vel.set(0, 0, 0);
      j.controller = idle(SL);
      j.setState('free');
    });
    gh.target = three[0];
    gh.ki = gh.kiMax;
    const start = three.map((j) => j.pos.clone());
    const hp0 = three.map((j) => j.hp);
    let pressed = 0, bursts = 0, kiAtCharge = null;
    const ki0 = gh.ki;
    b.on('bomberWave', (e) => e.fighter === gh && bursts++);
    b.on('bomberCharge', (e) => {
      if (e.fighter === gh && kiAtCharge === null) kiAtCharge = gh.ki;
    });
    gh.controller = { update: () => Object.assign(SL.emptyIntent(), { ult: pressed++ < 2 }) };
    gg.step(b, 40);
    eq(bursts, 1, 'one burst');
    ok(kiAtCharge !== null && ki0 - kiAtCharge >= gh.specFor('ultimate').kiCost - 0.5, 'it cost its ki: ' + ki0.toFixed(0) + ' -> ' + kiAtCharge);
    ok(gh.cooldowns.ultimate > 200, 'and started its cooldown: ' + gh.cooldowns.ultimate);
    three.forEach((j, i) => ok(j.hp < hp0[i], 'Junior ' + i + ' was hit'));
    const dirs = three.map((j, i) => j.pos.clone().sub(start[i]).setY(0).normalize());
    for (let i = 0; i < 3; i++) for (let k = i + 1; k < 3; k++) ok(dirs[i].dot(dirs[k]) < 0.5, 'Juniors ' + i + ' and ' + k + ' went different ways: ' + dirs[i].dot(dirs[k]).toFixed(2));
    ok(three.every((j, i) => j.pos.distanceTo(start[i]) > 4), 'and far: ' + three.map((j, i) => j.pos.distanceTo(start[i]).toFixed(1)).join(','));
    // pressed again at once: nothing
    pressed = 0;
    gg.step(b, 20);
    eq(bursts, 1, 'the cooldown holds');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('a launcher takes a Junior up, a heavy follows it into the air, and the follow-up drives it into the ring', () => {
    const env = purge(7);
    const { gg, SL, b, gh, J } = env;
    const j = J[0];
    clearOthers(env, [j]);
    standBefore(env, j, 1.3);
    j.hp = j.hpMax; // a fresh one survives the launcher
    const rise = gh.form.moves.heavy[2];
    eq(rise.knock, 'launch', 'the rising strike launches');
    ok(gh._startAttack(rise, 'heavy', 2), 'the launcher starts');
    gg.until(b, () => j.state === 'knockback', 60);
    eq(j.state, 'knockback', 'the Junior goes up');
    let chased = 0, craters = 0;
    b.on('chase', (e) => e.fighter === gh && chased++);
    b.on('crater', () => craters++);
    b.on('ringDamaged', () => craters++); // on the ring a crater is a crack
    const hp = j.hp;
    let top = j.pos.y;
    gh.controller = { update: () => Object.assign(SL.emptyIntent(), { heavy: b.frame % 2 === 0 && !chased }) };
    gg.step(b, 90, () => {
      top = Math.max(top, j.pos.y);
    });
    ok(top - b.stage.heightAt(j.pos.x, j.pos.z) > 1.5, 'it was in the air');
    eq(chased, 1, 'Gohan followed it up');
    ok(j.hp < hp || !j.alive, 'and hit it there');
    ok(craters >= 1, 'it came down hard enough to break the ring: ' + craters);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('a heavy blow knocks a Junior far back; it gets up, keeps its distance for a moment, then comes again', () => {
    const env = purge(8);
    const { gg, SL, b, gh, J } = env;
    const j = J[1];
    clearOthers(env, [j]);
    standBefore(env, j, 1.4);
    j.controller = new SL.AIController(b, { difficulty: 'hard' });
    j.target = gh;
    const from = j.pos.clone();
    ok(gh._startAttack(gh.form.moves.dash, 'dash', 0), 'the blink strike starts');
    gh.controller = idle(SL);
    let far = 0, down = false, backOff = false, again = false;
    gg.step(b, 60 * 8, () => {
      far = Math.max(far, j.pos.distanceTo(from));
      if (j.state === 'knockback' || j.state === 'knockdown') down = true;
      if (down && j.state === 'free' && j._reelUntil > b.frame && j.distTo(gh) > 6) backOff = true;
      if (backOff && j.state === 'attack' && j.target === gh) again = true;
    });
    ok(j.alive, 'it survived the one blow');
    ok(far > 3, 'knocked back: ' + far.toFixed(1) + ' m');
    ok(down, 'sent flying');
    ok(backOff, 'up again, it held back at a distance');
    ok(again, 'then it came at him again');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('every Junior he destroys gets a finisher: a hit-stop, a short slow-down, and a body that goes where the blow sends it — the last one biggest', () => {
    const env = purge(9);
    const { gg, SL, b, gh, J, st } = env;
    clearOthers(env, []);
    const V3 = gg.ctx.THREE.Vector3;
    const events = [];
    b.on('purgeFinisher', (e) => events.push(e));
    // the blow shapes that decide the finisher (the real moves are covered by the launcher test and the bot run)
    const shapes = [
      ['launch', { type: 'melee', damage: 200, knock: 'heavy', knockSpeed: 26, hitstun: 30, impact: 3 }],
      ['rocket', { type: 'melee', damage: 200, knock: 'launch', knockSpeed: 22, hitstun: 34, impact: 3 }],
      ['slam', { type: 'melee', damage: 200, knock: 'smash', knockSpeed: 34, hitstun: 36, impact: 4 }],
      ['blast', { type: 'ki', damage: 200, knock: 'push', knockSpeed: 14, hitstun: 20, impact: 2 }],
      ['burst', { type: 'explosion', damage: 200, knock: 'heavy', knockSpeed: 34, hitstun: 50, impact: 4, technique: 'tg2Burst' }],
      ['spike', { type: 'melee', damage: 200, knock: 'flinch', hitstun: 20, impact: 2 }],
      ['launch', { type: 'melee', damage: 200, knock: 'heavy', knockSpeed: 26, hitstun: 30, impact: 3 }],
    ];
    const bodies = [];
    shapes.forEach(([want, hit], i) => {
      const j = J[i];
      standBefore(env, j, 1.4);
      if (want === 'spike') {
        // a light blow in the air
        j.setPosition(j.pos.clone().add(new V3(0, 3, 0)));
        j.grounded = false;
        gh.setPosition(gh.pos.clone().add(new V3(0, 3, 0)));
        gh.grounded = false;
      }
      j.hp = 1;
      const dir = j.pos.clone().sub(gh.pos).setY(0.1).normalize();
      j.takeHit(gh, Object.assign({ dir, point: j.chest() }, hit));
      const e = events[events.length - 1];
      ok(e && e.fighter === j, want + ': a finisher');
      eq(e.kind, want, 'the blow decides the finisher');
      eq(e.final, i === 6, 'final only for the last');
      ok(gh.freeze >= e.stop, want + ': hit-stop on him (' + gh.freeze + ' >= ' + e.stop + ')');
      ok(b.slow && b.slow.scale < 0.5, want + ': time slows');
      // slow motion runs fewer ticks per frame: wait on the simulation's own clock
      const held = j.pos.clone();
      gg.until(b, () => b.frame >= e.frame + e.stop - 1, 600);
      ok(j.pos.distanceTo(held) < 0.3, want + ': the body holds on the blow');
      // then it goes: up, down into the ring, or away across it
      let rise = 0, impact = false;
      const offI = b.on('ringDamaged', (x) => (impact = impact || x.pos.distanceTo(j.pos) < 4));
      const offC = b.on('crater', (x) => (impact = impact || x.pos.distanceTo(j.pos) < 4));
      gg.until(b, () => b.frame >= e.frame + e.stop + 24, 900, () => (rise = Math.max(rise, j.pos.y - held.y)));
      offI();
      offC();
      const flat = Math.hypot(j.pos.x - held.x, j.pos.z - held.z);
      if (want === 'rocket') ok(rise > 4, 'rocket: straight up (' + rise.toFixed(1) + ' m)');
      else if (want === 'slam' || want === 'spike') ok(impact, want + ': driven into the ring');
      else ok(flat > 5, want + ': thrown away (' + flat.toFixed(1) + ' m)');
      bodies.push(j);
      gg.step(b, 40);
      gh.setPosition(new V3(gh.pos.x, b.stage.heightAt(gh.pos.x, gh.pos.z), gh.pos.z));
      gh.grounded = true;
      gh.vel.set(0, 0, 0);
    });
    eq(st.kills, 7, 'seven destroyed');
    const last = events[6], first = events[0];
    ok(last.stop > first.stop * 1.5, 'the last one holds longest: ' + last.stop + ' vs ' + first.stop);
    ok(new Set(events.map((e) => e.kind)).size >= 5, 'no two alike in a row of seven: ' + events.map((e) => e.kind).join(','));
    // bodies stay while the stretch lasts
    gg.step(b, 400, skipAll(b));
    ok(bodies.every((j) => !j.alive), 'all gone');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the survivors lose their nerve after each kill (they back off, each on its own beat), the mood follows the numbers, and none of it is stats', () => {
    const env = purge(10);
    const { gg, SL, b, gh, J, st } = env;
    gh.controller = idle(SL);
    const stats0 = J.map((j) => [j.damageDealtMul, j.damageTakenMul, j.hpMax, j.mult().damage, j.mult().speed].join('/'));
    const moods = [];
    const kill = (j) => {
      j.hp = 1;
      j.takeHit(gh, { type: 'melee', damage: 50, knock: 'heavy', knockSpeed: 26, hitstun: 30, impact: 3, dir: j.pos.clone().sub(gh.pos).setY(0.1).normalize() });
    };
    gg.step(b, 30, skipAll(b));
    const out0 = J.map((j) => SL.mech(j, 'damageOut') || 1); // the whole pack, counted (every 20 frames)
    const dist = () => {
      const a = J.filter((j) => j.alive);
      return a.reduce((s, j) => s + j.distTo(gh), 0) / a.length;
    };
    kill(J[0]);
    gg.step(b, 5);
    moods.push(b.juniorMood);
    const until = J.filter((j) => j.alive).map((j) => j._shakenUntil);
    ok(until.every((u) => u > b.frame + 15), 'every survivor holds back after the kill');
    ok(new Set(until).size >= 3, 'each on its own beat, not in step: ' + until.join(','));
    const before = dist();
    gg.step(b, 40);
    ok(dist() > before + 1, 'they back away from him: ' + before.toFixed(1) + ' -> ' + dist().toFixed(1));
    let thinned = null;
    for (let i = 1; i < 7; i++) {
      gg.step(b, 20, skipAll(b));
      kill(J[i]);
      gg.step(b, 5);
      moods.push(b.juniorMood);
      if (i === 3) {
        gg.step(b, 25); // the pack is counted every 20 frames
        thinned = J.map((j) => (j.alive ? SL.mech(j, 'damageOut') || 1 : null));
      }
    }
    eq(moods.join(','), 'hunt,hunt,desperate,desperate,last,last,last', 'hunt while there are five or more, desperate at four and three, the last two together');
    const stats1 = J.map((j) => [j.damageDealtMul, j.damageTakenMul, j.hpMax, j.mult().damage, j.mult().speed].join('/'));
    eq(stats1.join(' '), stats0.join(' '), 'nothing about them got stronger or faster (no frenzy when a sibling falls)');
    // the pack bonus is the one number that moves, and it only goes down as the pack thins
    thinned.forEach((v, i) => v === null || ok(v <= out0[i] + 1e-9, 'Junior ' + i + ' hits no harder with fewer beside it: ' + out0[i] + ' -> ' + v));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('a blow from behind is felt: he turns, takes it on one arm and counters on his own; a blow from the front is his to answer', () => {
    const env = purge(11);
    const { gg, SL, b, gh, J } = env;
    const j = J[2];
    clearOthers(env, [j]);
    gh.controller = idle(SL);
    gh.storyEvade.chance = 1; // the mechanism, not the dice
    // he is locked on to another one, far in front; this one comes from behind his back
    const lock = J[0];
    lock.setHidden(false);
    // the first swing of the stretch is always the caught one: let that happen first
    const first = J[3];
    standBefore(env, first, 1.2);
    first.target = gh;
    first._startAttack(first.moveSet.light[0], 'light', 0);
    gg.until(b, () => b.mission.flags.purgeCaught && !b.inputLocked, 60 * 20, skipAll(b));
    ok(b.mission.flags.purgeCaught, 'the catch beat came first');
    first.setHidden(true);
    b.releaseMeleeToken(first);
    gh.controller = idle(SL);
    lock.controller = idle(SL);
    gh.target = lock;
    gh.faceTarget(100);
    const back = lock.pos.clone().sub(gh.pos).setY(0).normalize().negate();
    const p = gh.pos.clone().addScaledVector(back, 1.2);
    p.y = b.stage.heightAt(p.x, p.z);
    j.setPosition(p);
    j.vel.set(0, 0, 0);
    j.yaw = j.prevYaw = Math.atan2(gh.pos.x - p.x, gh.pos.z - p.z);
    j.controller = idle(SL);
    j.target = gh;
    j.setState('free');
    const yaw0 = gh.yaw;
    let sensed = null, countered = 0, yawAtSense = null;
    b.on('storyEvade', (e) => {
      sensed = e;
      if (yawAtSense === null) yawAtSense = gh.yaw;
    });
    b.on('counterStrike', (e) => e.fighter === gh && countered++);
    const hp = j.hp;
    ok(j._startAttack(j.moveSet.light[0], 'light', 0), 'the Junior swings from behind');
    gg.step(b, 50);
    ok(sensed && sensed.mode === 'guard', 'he felt it');
    ok(yawAtSense !== null && Math.cos(yawAtSense - yaw0) < 0, 'he turned to it: ' + yaw0.toFixed(2) + ' -> ' + (yawAtSense === null ? '-' : yawAtSense.toFixed(2)));
    eq(countered, 1, 'and countered by himself');
    ok(j.hp < hp, 'the counter landed');
    // from the front: nothing automatic
    sensed = null;
    gh.storyEvade.last = -9999;
    standBefore(env, j, 1.2);
    j.target = gh;
    gg.step(b, 5);
    j._startAttack(j.moveSet.light[0], 'light', 0);
    gg.step(b, 30);
    eq(sensed, null, 'a blow he can see is his to answer');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('a bot plays the whole stretch: the ring cracks, the gi wears from clean to heavily damaged, the last Junior gets the biggest finisher and a scene, and Gohan vs Cell follows', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const log = { fin: [], dmg: [], craters: 0, scenes: [], maxSwing: 0 };
    let rip1 = -1, rip2 = -1;
    const r = gg.playMission('cell_games', {
      startPhase: pi(SL, 'purge'),
      style: 'reader',
      maxSeconds: 240,
      onCreate: (b) => b.on('sceneStart', (e) => log.scenes.push(e.id)),
      onBattle: (b) => {
        b.on('purgeFinisher', (e) => log.fin.push(e));
        b.on('crater', () => log.craters++);
        b.on('ringDamaged', () => log.craters++);
        b.on('damageState', (e) => {
          if (e.fighter !== b.story.gohan) return;
          log.dmg.push(e.level);
          const vis = (b.story.gohan.model._rips || []).filter((x) => x.mesh.visible).length;
          if (e.level === 1) rip1 = vis;
          if (e.level === 2 && rip2 < 0) rip2 = vis;
        });
        b.on('missionPhase', (e) => {
          if (e.index === pi(SL, 'rage')) b.mission.state = 'stopped';
        });
        b.tickHandlers.push(() => {
          const S = b.story;
          if (!S || !S.juniors) return;
          log.maxSwing = Math.max(log.maxSwing, S.juniors.filter((j) => j.alive && j.target === S.gohan && j.state === 'attack').length);
        });
      },
    });
    const b = r.b, S = b.story, m = b.mission;
    eq(m.def.phases[m.phaseIndex].id, 'rage', 'on to Gohan vs Cell');
    eq(S.purge.kills, 7, 'all seven destroyed');
    ok(m.flags.juniorsDestroyed && m.flags.purgeDone, 'flags: ' + JSON.stringify({ d: m.flags.juniorsDestroyed, p: m.flags.purgeDone }));
    ok(log.scenes.includes('purge_open') && log.scenes.includes('purge_last'), 'the opening and the last beat: ' + log.scenes.join(','));
    eq(log.fin.filter((e) => e.final).length, 1, 'one last finisher');
    ok(log.fin[6].final && log.fin[6].stop >= Math.max(...log.fin.slice(0, 6).map((e) => e.stop)), 'and it is the biggest');
    ok(log.maxSwing <= 2, 'never more than two swinging at him: ' + log.maxSwing);
    ok(log.craters >= 5, 'the ring and the ground answer: ' + log.craters + ' impacts');
    eq(log.dmg.slice(0, 2).join(','), '1,2', 'clean → damaged → heavily damaged');
    ok(rip1 > 0 && rip2 > rip1, 'the rips grow: ' + rip1 + ' -> ' + rip2);
    ok(!S.gohan.torn, 'but the gi is still on him (Cell tears it later)');
    ok(S.juniors.every((j) => !j.alive && j.hidden), 'the destroyed are cleared before the fight with their father');
    eq(b.juniorMood, null, 'the squad mood is gone');
    ok(!S.gohan.storyArmor && !S.gohan.storyEvade, 'and so is his tuning for the stretch');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Cinematic presentation: during the stretch nothing is on screen but the fight — no damage numbers, no tips, no objective text', () => {
    const run = (preset) => {
      const gg = H.create({ quiet: true, seed: 12 });
      const dom = MiniDom.create();
      gg.ctx.document = dom.document;
      for (const f of ['src/ui/ui.js', 'src/ui/hud.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), gg.ctx, { filename: f });
      const { SL } = gg;
      SL.Portraits.get = () => '';
      SL.Audio.init = () => {};
      SL.Subtitles.show = () => {};
      SL.Subtitles.clear = () => {};
      SL.UI.root = dom.document.getElementById('screens');
      SL.App = SL.App || {};
      SL.Settings.applyHudPreset(preset);
      const env = purge(12, { gg });
      const { b, gh } = env;
      SL.HUD.attach(b);
      let numbers = 0, prompts = 0;
      const add = SL.HUD._addTransient.bind(SL.HUD);
      SL.HUD._addTransient = (node, ms) => {
        if (!/word/.test(node.className)) numbers++;
        return add(node, ms);
      };
      b.on('prompt', () => prompts++);
      const mp = b.mission.prompt.bind(b.mission);
      b.mission.prompt = (...a) => {
        prompts++;
        return mp(...a);
      };
      // he fights: presses every few frames at whatever is locked
      gh.controller = { update: () => Object.assign(SL.emptyIntent(), { light: b.frame % 6 === 0, heavy: b.frame % 40 === 20 }) };
      for (let i = 0; i < 60 * 12; i++) {
        gg.step(b, 1);
        SL.HUD.update(1 / 60);
        if (b.inputLocked) b.skipRequested = true;
      }
      const out = { numbers, prompts, objectives: b.mission.objectives.length, hits: b.story.purge.kills + gh.stats.damage };
      b.dispose();
      return out;
    };
    const cine = run('cinematic'), std = run('standard');
    ok(std.numbers > 0, 'the counter works (Standard shows numbers: ' + std.numbers + ')');
    eq(cine.numbers, 0, 'Cinematic: no damage numbers');
    eq(cine.prompts, 0, 'no tips or prompts');
    eq(cine.objectives, 0, 'no objective text');
    ok(cine.hits > 0, 'and he was fighting');
  });

  test('checkpoints: the purge restarts with a clean gi; the stretches after it keep the damage it left, and Cell\'s return still tears it', () => {
    const gg = H.create({ quiet: true, seed: 13 });
    const { SL } = gg;
    const want = { purge: [0, false], rage: [2, false], desperate: [2, false], beam: [3, true] };
    for (const [id, [lvl, torn]] of Object.entries(want)) {
      const b = gg.mission('cell_games', { startPhase: pi(SL, id) });
      gg.until(b, () => !b.inputLocked, 60 * 60, skipAll(b));
      gg.step(b, 5);
      const gh = b.story.gohan;
      ok((gh.damageLevel || 0) >= Math.min(lvl, 2) && (id === 'purge' ? (gh.damageLevel || 0) === 0 : true), id + ': damage level ' + gh.damageLevel);
      eq(!!gh.torn, torn, id + ': torn');
      eq(gh.storyArmor || 0, id === 'purge' ? 1 : 0, id + ': story armour only in the purge');
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Known Bugs #36 stays fixed: the Juniors phase keeps two swinging at Gohan on the seeds that broke it, and the cap never touches other group fights', () => {
    for (const seed of [1, 6]) {
      const gg = H.create({ quiet: true, seed });
      const { SL } = gg;
      const b = gg.mission('cell_games', { startPhase: pi(SL, 'juniors') });
      gg.step(b, 20, skipAll(b));
      const gh = b.story.gohan, J = b.story.juniors;
      gh.controller = { update: () => Object.assign(SL.emptyIntent(), { guard: b.frame % 90 < 60 }) };
      let max = 0;
      gg.step(b, 60 * 15, () => {
        if (b.mission.def.phases[b.mission.phaseIndex].id !== 'juniors') return;
        max = Math.max(max, J.filter((j) => j.alive && j.target === gh && j.state === 'attack').length);
      });
      ok(max <= 2, 'seed ' + seed + ': at most two at once (' + max + ')');
      eq(gg.errors.length, 0, 'engine errors');
      b.dispose();
    }
    // a fighter the squad has not given a role is never limited, however many are swinging
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'goku', p2: 'saibaman' });
    const p = b.player, s = b.fighters[1];
    for (let i = 0; i < 3; i++) {
      const o = b.spawn({ charId: 'saibaman', team: 1, pos: p.pos.clone().add(new gg.ctx.THREE.Vector3(i + 1, 0, 1)) });
      o.target = p;
      o.setState('attack', { move: o.moveSet.light[0], kind: 'light', hit: false, hitSet: new Set(), startup: 3, bonus: 1, whiffPenalty: 0, window: -1, victim: p });
    }
    s.target = p;
    eq(b.squadMeleeFull(s, p), false, 'Saibamen are not a squad: no cap');
    ok(s._startAttack(s.moveSet.light[0], 'light', 0), 'and their swings start');
    b.dispose();
  });

  test('bomberWave pressed from a technique slot costs its ki and starts its cooldown (Android 17\'s Energy Field used to be free)', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const b = gg.battle({ p1: 'android_17', p2: 'goku', dummy: 'idle' });
    const a = b.player;
    a.ki = a.kiMax;
    const sp = a.specFor('special2');
    eq(sp.type, 'bomberWave', 'Energy Field is a bomberWave');
    ok(a._trySpecial('special2'), 'it starts');
    ok(a.ki <= a.kiMax - sp.kiCost + 0.01, 'it cost ' + sp.kiCost + ' ki: ' + a.ki.toFixed(1));
    eq(a.cooldowns.special2, sp.cooldown, 'the cooldown started');
    gg.step(b, 80);
    a.ki = a.kiMax;
    eq(a._trySpecial('special2'), false, 'not again until the cooldown is over');
    b.dispose();
  });
};
