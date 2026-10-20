/*
 * CHAPTER 21 · UNIVERSE SURVIVAL — "The Park Ranger" (canon; played as Goku, then as Android 17). Episodes 86–87 of
 * the anime (Wikipedia's episode list; an episode-87 review on theouterhaven.net): Goku goes to the island where
 * Android 17 now looks after endangered animals, to bring him into the Tournament of Power. 17 says no — he will not
 * leave his post, and thinks the tournament a waste of time. They fight. Alien poachers come for the animals with a
 * ship and a beam that lifts them aboard; Goku and 17 beat the crew, 17 takes the boss (rock-paper-scissors settles
 * who), the boss's "self-destruct" switch is a bluff (party fireworks), and 17 agrees to join: he wants the Super
 * Dragon Balls for a big ship his family can see the world on. Before "Father and Son" (episode 90).
 *
 *   ISLAND *   (play)     find the ranger: fly across the reserve to the smoke from his camp (exploration)
 *   REFUSAL    (staged)   17 will not leave the island; one round, "but scare my animals and we're done"
 *   SPAR *     (play)     Goku (base) against 17 and his barrier. THE MISSION'S OWN RULES: a blast of Goku's that
 *                         lands near an animal is a warning (three and 17 calls it off: retry); hit him in the
 *                         moment his barrier drops (optional goal). Ends at his floor (or Goku's): the ship comes
 *   BEAM       (staged)   the poachers' ship over the island, its green beam lifting an animal; "together, then"
 *   RAID *     (play)     Goku and 17 together (switch between them): poachers drop down the beam; the beam sweeps
 *                         the reserve lifting animals towards the ship — smash its emitter (fly up to the ship's
 *                         belly) and the animals come down; drive off the crew
 *   CALL       (cue)      rock, paper, scissors for the boss — 17 wins (the episode: he takes the boss)
 *   BOSS *     (play)     as Android 17: the boss and his two guards; 17's barrier against their volleys
 *   BLUFF      (staged)   the bribe, the "self-destruct" switch; 17 takes him straight up; fireworks
 *   END        (staged)   the animals back; 17 owes him one — he is in, for the wish (a big ship for his family)
 *
 * ADAPTATIONS (documented, not hidden): the fight with the crew is under the ship on the island — the episode has
 * Goku take them aboard by Instant Transmission (the engine has no ship interior) — and the bluff happens in the sky
 * over the island, not on King Kai's planet; Jaco (the Galactic Patrol) is not in the cast; the reserve's animals are
 * the game's dinosaur (`SL.data.creatures.trex`, scaled down) — the episode's species are not modelled; the poachers
 * are Level 1 stand-ins (`poachers_cast.js`); the island is a stand-in stage (`reserve_island`). Lines paraphrased.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const CHAPTER = 'CHAPTER 21 · UNIVERSE SURVIVAL';
  const GREEN = 0x5aff8a, PALE = 0xd8ffe4;
  // ponytail: provisional (2026-10-19, the owner's next batch) — floors, the warning count, the beam and the crew.
  // The owner judges the numbers in play
  const TU = {
    find: 9,
    spar: { a17Floor: 0.55, gokuFloor: 0.3, a17Dealt: 0.55, a17Taken: 0.9, warnings: 3, near: 5, window: 45, counters: 3 },
    raid: { kills: 12, maxAlive: 5, every: 2.6, gruntDealt: 0.45, emitterHp: 7000, shipLift: 26, beamR: 5.5, liftSpeed: 2.2, sweep: 0.05, sweepR: 13, warm: 240 },
    boss: { floor: 0.2, bossDealt: 0.6, guardDealt: 0.45, shields: 3 },
  };
  // the island (x, z): Goku lands at the shore, the ranger's camp over the hill, the herd round the camp
  const SPOT = { land: [0, -70], camp: [34, 26], herd: [[50, 40], [24, 48], [56, 14]] };
  const at = (b, p, lift = 0) => K.ground(b, new V3(p[0], 0, p[1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const pose = (f, p, face, speed) => f.setState('scripted', { pose: p, expression: face, speed });

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: at(b, SPOT.land), startKi: 80 });
    S.goku._playerController = S.goku.controller;
    S.a17 = b.spawn({ charId: 'android_17_top', team: 0, pos: at(b, SPOT.camp), startKi: 100 });
    S.boss = b.spawn({ charId: 'poacher_boss', team: 1, pos: at(b, SPOT.camp, 30), startKi: 60 });
    for (const f of [S.goku, S.a17, S.boss]) f.cannotDie = true;
    bench(S.boss, true);
    K.watcher(S.a17, 'a17_bored', 'calm');
    K.faceTo(S.a17, at(b, SPOT.herd[0]));
    K.faceTo(S.goku, at(b, SPOT.camp));
    // the reserve's animals: the game's dinosaur at half its size, standing in the grass round the camp
    S.animals = SPOT.herd.map((p, i) => {
      const c = new SL.Creature(b, SL.data.creatures.trex, { pos: at(b, p), yaw: i * 2.1 });
      c.scale = 0.5;
      c.object.scale.setScalar(c.scale);
      c.home = c.pos.clone();
      return c;
    });
    return S;
  }

  /** Out of the fight: nobody can reach them, they reach nobody. */
  function bench(f, hidden) {
    f.controller = K.scripted();
    f.untargetable = f.intangible = true;
    f.setHidden(hidden);
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    b.story.goal = null;
    b.story.hitProp = null;
  }

  /** The crew off the field (a checkpoint after the raid, or the raid won). */
  function clearCrew(m) {
    for (const f of m.battle.fighters) if (f.tags && f.tags.mission === 'raid') {
      f.setHidden(true);
      f.untargetable = f.intangible = true;
      f.controller = K.scripted();
    }
  }

  /** A poacher knocked out leaves the field a moment later (a puff of dust): no bodies left to trip over or target. */
  function sweepKOs(m) {
    const b = m.battle;
    const off = b.on('ko', (e) => {
      const f = e.fighter;
      if (!f.tags || !['raid', 'guard'].includes(f.tags.mission)) return;
      b.after(70, () => {
        if (b.disposed || f.hidden) return;
        b.vfx.dust(f.pos.clone(), 1.4, 8);
        f.setHidden(true);
        f.untargetable = f.intangible = true;
      });
    });
    m.onDispose(off);
    return off;
  }

  /** Every animal home, on its feet (a checkpoint, or the end). */
  function herdHome(b) {
    for (const c of b.story.animals) {
      liftEnd(c);
      c.taken = false;
      c.object.visible = true;
      c.pos.copy(c.home);
      c.prevPos.copy(c.home);
      c.setState('idle');
    }
  }

  /* --------------------------------------------------------------- the ship and its beam */

  /**
   * THE POACHERS' SHIP (a Level 1 prop of the mission's own: the episode's design is not modelled): a long dark hull
   * with a dome, fins and a ring of lights, and under its belly the EMITTER — a stage prop (hp TU.raid.emitterHp; it
   * takes blasts and blows like any prop; destroyed, the beam dies) — and the green capture beam: a cone from the
   * emitter to the ground. { group, pos, emitter, beam(on), setPos(v), update(), dispose() }.
   */
  function ship(m, pos) {
    const b = m.battle, T = SL.Toon;
    const geos = [], mats = [];
    const mk = (geo, mat) => {
      geos.push(geo);
      mats.push(mat);
      return new THREE.Mesh(geo, mat);
    };
    const g = new THREE.Group();
    const hull = mk(new THREE.SphereGeometry(1, 28, 14), T.mat(0x4a5048));
    hull.scale.set(15, 3, 8.5);
    T.addOutline(hull, 2);
    const dome = mk(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), T.mat(0x6a7468));
    dome.scale.set(5, 2.6, 4);
    dome.position.y = 2.2;
    T.addOutline(dome, 1.5);
    g.add(hull, dome);
    for (const s of [1, -1]) {
      const fin = mk(new THREE.BoxGeometry(6, 0.5, 2.2), T.mat(0x3a3e38));
      fin.position.set(-9, 0.6, s * 7.4);
      fin.rotation.y = s * 0.35;
      T.addOutline(fin, 1);
      g.add(fin);
    }
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd04a });
    mats.push(lightMat);
    const lightGeo = new THREE.SphereGeometry(0.4, 8, 6);
    geos.push(lightGeo);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const l = new THREE.Mesh(lightGeo, lightMat);
      l.position.set(Math.cos(a) * 14.6, 0.4, Math.sin(a) * 8.2);
      g.add(l);
    }
    g.position.copy(pos);
    b.scene.add(g);
    // the emitter: a stage prop hanging under the belly (lockable, damageable)
    const em = b.stage.addProp({ kind: 'emitter', pos: pos.clone().add(new V3(0, -3.2, 0)), r: 2.2, hp: TU.raid.emitterHp, id: 'captureEmitter' });
    em.explodeColor = GREEN;
    em.debrisColor = 0x4a5048;
    const lens = mk(new THREE.SphereGeometry(1.6, 18, 12), new THREE.MeshBasicMaterial({ color: 0x7affa0 }));
    const collar = mk(new THREE.TorusGeometry(1.9, 0.35, 8, 24), T.mat(0x2e322c));
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.8;
    em.group.add(lens, collar);
    // the beam: an open cone from the emitter down to the ground
    const beamMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beam = mk(new THREE.CylinderGeometry(1.2, TU.raid.beamR, 1, 24, 1, true), beamMat);
    beam.visible = false;
    b.scene.add(beam);
    let on = false, gone = false;
    const api = {
      group: g,
      pos: g.position,
      emitter: em,
      beamOn: () => on && em.alive,
      beam(v) {
        on = v;
      },
      setPos(v) {
        g.position.copy(v);
        em.pos.copy(v).add(new V3(0, -3.2, 0));
        em.group.position.copy(em.pos);
      },
      /** The beam's spot on the ground under the emitter. */
      foot() {
        return K.ground(b, new V3(g.position.x, 0, g.position.z));
      },
      update() {
        if (gone) return;
        const live = on && em.alive;
        beam.visible = live;
        if (!live) return;
        const foot = api.foot(), top = em.pos.clone().add(new V3(0, -1, 0));
        const h = Math.max(1, top.y - foot.y);
        beam.scale.set(1, h, 1);
        beam.position.set(foot.x, foot.y + h / 2, foot.z);
        beamMat.opacity = 0.22 + Math.sin(b.frame * 0.3) * 0.06;
        if (!b.skipRequested && b.frame % 10 === 0) b.vfx.ring(new V3(foot.x, foot.y + ((b.frame / 10) % 6) * (h / 6), foot.z), TU.raid.beamR * 0.8, GREEN, 0.3, new V3(0, 1, 0));
      },
      dispose() {
        if (gone) return;
        gone = true;
        b.scene.remove(g);
        b.scene.remove(beam);
        if (em.group && em.group.parent) em.group.parent.remove(em.group);
        em.alive = false;
        for (const x of geos) x.dispose();
        for (const x of mats) x.dispose();
      },
    };
    m.onDispose(api.dispose);
    return api;
  }

  /** An animal caught in the beam rises (the creature's own update is set aside while it floats). */
  function liftStart(c) {
    if (c.lift) return;
    c.lift = { def: c.def, dir: 1 };
    c.def = Object.assign({}, c.def, {
      update: (x) => {
        x.pos.y += x.lift.dir * TU.raid.liftSpeed * SL.TICK;
        x.tilt = Math.sin(x.stateFrame * 0.1) * 0.15;
      },
    });
    c.setState('idle');
  }
  function liftEnd(c) {
    if (!c.lift) return;
    c.def = c.lift.def;
    c.lift = null;
    c.tilt = 0;
  }

  const P = {};

  /** ISLAND: find the ranger — the smoke from his camp over the hill. */
  P.island = { id: 'island', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17;
    stage(m);
    herdHome(b);
    K.place(g, at(b, SPOT.land), 0);
    K.faceTo(g, at(b, SPOT.camp));
    K.place(a, at(b, SPOT.camp), 0);
    K.watcher(a, 'a17_bored', 'calm');
    K.faceTo(a, S.animals[0].pos);
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    m.music('peaceful', 1);
    m.title(CHAPTER, 'THE PARK RANGER', 'An island wildlife reserve · Age 780', 3.4);
    m.say('goku', 'Seventeen\'s supposed to be on this island somewhere... There! Smoke over the hill.', 3.2);
    const camp = at(b, SPOT.camp);
    const start = g.pos.distanceTo(camp);
    m.objective('find', 'Find the park ranger — follow the smoke from his camp', { icon: 'target', target: 100 });
    // the bot's way there (tools/mission_brains.js reads b.story.goal)
    S.goal = camp.clone().add(new V3(0, 0, -TU.find + 2));
    m.lock(false);
    b.aiLocked = true;
    yield () => {
      if (!b.skipRequested && b.frame % 4 === 0) b.vfx.smoke.emit(camp.x + U.rand(-0.6, 0.6), camp.y + 1, camp.z + U.rand(-0.6, 0.6), 0, 2.2, 0, 0.62, 0.62, 0.64, 0.5, 4, 3.2, { grow: 1.2, drag: 0.3 });
      const d = Math.hypot(g.pos.x - camp.x, g.pos.z - camp.z);
      m.progress('find', Math.round(U.clamp01(1 - (d - TU.find) / Math.max(1, start - TU.find)) * 100));
      return d < TU.find || m.state !== 'running';
    };
    S.goal = null;
    if (m.state !== 'running') return;
    m.complete('find');
    m.flags.found = true;
  } };

  /** REFUSAL: 17 will not leave the island; one round. */
  P.refusal = { id: 'refusal', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    if (g.pos.distanceTo(a.pos) < 4 || g.pos.distanceTo(a.pos) > 12) K.place(g, K.ground(b, a.pos.clone().add(new V3(0, 0, -7))), 0);
    if (!g.grounded) K.place(g, K.ground(b, g.pos.clone()), g.yaw);
    K.faceTo(g, a.pos);
    K.faceTo(a, g.pos);
    pose(g, 'g_wave', 'grin', 8);
    pose(a, 'armsCrossed', 'calm', 8);
    const cast = { goku: g, a17: a };
    shot(m, cast, { subject: 'a17', with: 'goku', focus: 'wide', angle: 'three' }, 999);
    m.say('android_17', 'Goku. Didn\'t expect you out here.', 2.4);
    yield* st.wait(2.4);
    shot(m, cast, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    pose(g, 'g_resolve', 'determined', 8);
    m.say('goku', 'There\'s a tournament, Seventeen — ten fighters from every universe, and the universes that lose get erased. We need you!', 4.2);
    yield* st.wait(4.2);
    shot(m, cast, { subject: 'a17', focus: 'upper', angle: 'low' }, 999);
    m.say('android_17', 'Not interested. I\'m a ranger now. The day I leave this island, the poachers clean it out.', 3.8);
    yield* st.wait(3.8);
    shot(m, cast, { subject: 'goku', with: 'a17', focus: 'medium', angle: 'side' }, 999);
    pose(g, 'g_handsHips', 'grin', 8);
    m.say('goku', 'Then just one round! Come on — I\'ve wanted to fight you for ages.', 3);
    yield* st.wait(3);
    shot(m, cast, { subject: 'a17', focus: 'upper', angle: 'three' }, 999);
    pose(a, 'a17_idle', 'smirk', 8);
    m.say('android_17', 'One round. But this is my island — scare my animals and we\'re done.', 3.4);
    yield* st.wait(3.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * SPAR: Goku against 17. A blast of Goku's that lands near one of the animals is a warning (the animal rears and
   * roars; 17 tells him); TU.spar.warnings of them and 17 calls it off (a retry). Hitting him just as his barrier
   * drops is the optional goal (the barrier is his defence: blasts die on it, blows bounce off; when it falls he is
   * open). Ends at his floor or Goku's — the ship comes either way.
   */
  P.spar = { id: 'spar', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17, T = TU.spar;
    stage(m);
    herdHome(b);
    K.toForm(g, 'base');
    a.team = 1;
    a.untargetable = a.intangible = g.untargetable = g.intangible = false;
    if (g.pos.distanceTo(a.pos) < 5 || g.pos.distanceTo(a.pos) > 14) K.place(g, K.ground(b, a.pos.clone().add(new V3(0, 0, -8))), 0);
    g.hp = g.hpMax;
    a.hp = a.hpMax;
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    g.target = a;
    a.target = g;
    a.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, a.def.ai, { aggression: 0.6, defense: 0.75 }) });
    g.setState('free');
    a.setState('free');
    m.music('battle', 3);
    m.title(CHAPTER, 'THE PARK RANGER', 'Goku vs Android 17', 2.4);
    m.objective('spar', 'One round with Seventeen', { icon: 'fist' });
    const warnText = (n) => 'Mind his animals — no blasts near them (' + n + ' warning' + (n === 1 ? '' : 's') + ' left)';
    m.objective('animals', warnText(T.warnings), { icon: 'guard' });
    m.objective('counter', 'Hit him the moment his barrier drops', { icon: 'target', optional: true, target: T.counters });
    m.flags.warnings = 0;
    // whose blast landed where: Goku's, near an animal, is a warning
    let lastWarn = -999;
    const offX = b.on('stageExplode', (e) => {
      if (e.owner !== g || m.state !== 'running' || b.frame - lastWarn < 30) return;
      const near = S.animals.find((c) => c.alive && Math.hypot(c.pos.x - e.pos.x, c.pos.z - e.pos.z) < e.radius + T.near);
      if (!near) return;
      lastWarn = b.frame;
      m.flags.warnings++;
      near.roar();
      b.emit('reserveWarning', { animal: near, count: m.flags.warnings });
      const left = T.warnings - m.flags.warnings;
      if (left <= 0) {
        m.failObjective('animals');
        m.say('android_17', 'That\'s it. I told you — not near my animals. We\'re done here.', 3);
        m.fail('You scared his animals once too often.');
        return;
      }
      m.objective('animals', warnText(left));
      m.say('android_17', left === 1 ? 'Last warning, Goku.' : 'Watch where you aim. They live here.', 2);
    });
    // his barrier: a blow inside the moment it drops is the counter
    let dropAt = -999, wasUp = false, counters = 0;
    const watch = () => {
      const up = a.state === 'barrier';
      if (wasUp && !up) dropAt = b.frame;
      wasUp = up;
    };
    m.tickHooks.push(watch);
    const offD = b.on('damage', (e) => {
      if (e.attacker !== g || e.target !== a || b.frame - dropAt > T.window) return;
      dropAt = -999;
      m.progress('counter', ++counters);
      b.emit('barrierCounter', { fighter: g });
    });
    const off = () => {
      offX();
      offD();
      K.unhook(m, watch);
    };
    m.onDispose(off);
    const sf = m.storyFight({
      floors: [{ f: a, at: T.a17Floor }, { f: g, at: T.gokuFloor }],
      dealt: [{ f: a, mul: T.a17Dealt }], taken: [{ f: a, mul: T.a17Taken }],
      ease: { foe: a, hero: g, below: 0.5, min: 0.5 }, fighters: [g, a],
    });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => sf.floored(a) || sf.floored(g) || m.state !== 'running';
    off();
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    m.flags.sparWon = sf.floored(a);
    m.flags.counters = counters;
    m.qteParts.push(m.flags.sparWon ? 1 : 0.6);
    m.complete('spar');
    m.complete('animals');
  } };

  /** BEAM: the poachers' ship over the island, the beam taking an animal. */
  P.beam = { id: 'beam', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    herdHome(b);
    a.team = 0;
    g.controller = K.scripted();
    a.controller = K.scripted();
    // back at the camp, catching their breath (wherever the round left them)
    const camp = at(b, SPOT.camp);
    K.place(a, camp, 0);
    K.place(g, K.ground(b, camp.clone().add(new V3(-3.5, 0, -2.5))), 0);
    K.faceTo(g, a.pos);
    K.faceTo(a, g.pos);
    pose(g, 'exhausted', 'grin', 8);
    pose(a, 'a17_idle', 'smirk', 8);
    const herd = S.animals[0];
    const hover = herd.pos.clone().add(new V3(0, TU.raid.shipLift, 0));
    const sh = (S.ship = ship(m, hover.clone().add(new V3(0, 60, 0))));
    m.music('battle', 2);
    // a shadow over them both; they look up
    m.say('goku', 'Hah... You\'re strong, Seventeen!', 2);
    yield* st.wait(1.4);
    b.sfx('rumble', null, { at: herd.pos, vol: 1, dur: 2 });
    pose(g, 'g_lookUp', 'shock', 10);
    pose(a, 'a17_idle', 'serious', 10);
    // over their shoulders, looking up the way they look: the two of them low in the frame, the hull coming down
    const pair = g.pos.clone().lerp(a.pos, 0.5);
    const toShip = hover.clone().sub(pair).setY(0).normalize();
    m.shot((t, o) => {
      o.pos.copy(pair).addScaledVector(toShip, -9).add(new V3(toShip.z * 2.5, 1.8, -toShip.x * 2.5));
      o.look.copy(o.pos).addScaledVector(toShip, 10).add(new V3(0, 2.8, 0)); // ~15° up: them low, the hull high
      o.fov = 66;
    }, 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      sh.setPos(hover.clone().add(new V3(0, 60 * (1 - U.easeOutCubic(Math.min(1, n / 120))), 0)));
      sh.update();
      return n >= 120 || b.skipRequested;
    };
    sh.setPos(hover);
    sh.beam(true);
    sh.update();
    b.sfx('drain', null, { at: herd.pos, vol: 1, pitch: 0.6 });
    // the beam takes the nearest animal up a little way before the fight starts
    if (!b.skipRequested) {
      liftStart(herd);
      n = 0;
      yield () => {
        n++;
        sh.update();
        return n >= 50 || b.skipRequested;
      };
    }
    // the beam's first catch is let go again by the fight (RAID decides who gets taken)
    herdHome(b);
    shot(m, { a17: a }, { subject: 'a17', focus: 'upper', angle: 'low' }, 999);
    m.say('android_17', 'Poachers. They picked the wrong day.', 2.4);
    yield* st.wait(2.4);
    shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    pose(g, 'g_resolve', 'grin', 8);
    m.say('goku', 'Then we take them down together!', 2.2, { style: 'shout' });
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * RAID: Goku and 17 against the crew (the party: switch between them). Poachers drop down the beam; the beam sweeps
   * the reserve, and an animal under it rises towards the ship — taken if it reaches the hull. Smash the emitter
   * (fly up under the ship) and the beam dies and the animals come down. Ends with the emitter gone and the crew
   * driven off (TU.raid.kills).
   */
  P.raid = { id: 'raid', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17, R = TU.raid;
    stage(m);
    herdHome(b);
    a.team = 0;
    const centre = S.animals.reduce((v, c) => v.add(c.home), new V3()).multiplyScalar(1 / S.animals.length);
    const sh = S.ship || (S.ship = ship(m, centre.clone().add(new V3(0, R.shipLift, 0))));
    // the beam warms up before it takes anything (4 s: time to get going)
    sh.beam(false);
    let warm = R.warm;
    g.hp = Math.max(g.hp, g.hpMax * 0.7);
    a.hp = Math.max(a.hp, a.hpMax * 0.7);
    g.untargetable = g.intangible = a.untargetable = a.intangible = false;
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    b.setParty([g, a], {});
    g.setState('free');
    a.setState('free');
    m.music('battle', 4);
    m.title(CHAPTER, 'THE PARK RANGER', 'Goku and Android 17 vs the poachers', 2.4);
    m.objective('emitter', 'Smash the capture beam\'s emitter under the ship', { icon: 'target' });
    m.objective('crew', 'Drive off the poachers', { icon: 'fist', target: R.kills });
    m.objective('herd', 'Don\'t let them take a single animal', { icon: 'guard', optional: true });
    m.objective('switch', 'Fight as Seventeen (switch)', { icon: 'target', optional: true });
    const offSw = b.on('playerSwitched', (e) => e.to === a && m.complete('switch'));
    m.say('android_17', 'The beam comes from that thing under the hull. Knock it out and they lose their catch.', 3.4);
    m.flags.taken = 0;
    // the beam sweeps the reserve: a slow circle round the herd
    // from wherever it hangs now (no jump), easing out onto its circle
    let ang = Math.atan2(sh.pos.z - centre.z, sh.pos.x - centre.x), rad = Math.hypot(sh.pos.x - centre.x, sh.pos.z - centre.z);
    const sweep = () => {
      if (warm > 0) {
        warm--;
        if (!b.skipRequested && warm % 20 === 0) b.vfx.flash(sh.emitter.pos, 2.6, GREEN, 0.15, SL.Toon.tex.glow);
        if (warm === 0) sh.beam(true);
      }
      if (!sh.emitter.alive) return;
      ang += R.sweep * SL.TICK;
      rad = U.lerp(rad, R.sweepR, 0.01);
      sh.setPos(centre.clone().add(new V3(Math.cos(ang) * rad, R.shipLift, Math.sin(ang) * rad)));
    };
    const animals = () => {
      const on = sh.beamOn(), foot = sh.foot();
      for (const c of S.animals) {
        if (c.taken) continue;
        if (c.lift) {
          // rising under a live beam, falling once it is gone (or once it has swept past)
          const under = on && Math.hypot(c.pos.x - foot.x, c.pos.z - foot.z) < R.beamR + 1;
          c.lift.dir = under ? 1 : -1;
          if (under) {
            c.pos.x = U.lerp(c.pos.x, foot.x, 0.02);
            c.pos.z = U.lerp(c.pos.z, foot.z, 0.02);
          }
          if (c.pos.y >= sh.pos.y - 3.5) {
            c.taken = true;
            c.object.visible = false;
            liftEnd(c);
            m.flags.taken++;
            m.failObjective('herd');
            b.emit('animalTaken', { animal: c });
            m.say('android_17', 'They got one aboard! Hurry, Goku!', 2, { style: 'shout' });
          }
          const gy = b.stage.heightAt(c.pos.x, c.pos.z);
          if (c.lift && c.lift.dir < 0 && c.pos.y <= gy) {
            c.pos.y = gy;
            liftEnd(c);
            b.vfx.dust(c.pos.clone(), 2, 10);
          }
        } else if (on && Math.hypot(c.pos.x - foot.x, c.pos.z - foot.z) < R.beamR) {
          liftStart(c);
          b.emit('animalLifted', { animal: c });
        }
      }
      sh.update();
    };
    m.tickHooks.push(sweep, animals);
    // the bot's target while the emitter stands (tools/mission_brains.js reads b.story.hitProp)
    S.hitProp = () => (sh.emitter.alive ? sh.emitter : null);
    const offP = b.on('propDestroyed', (e) => {
      if (e.prop !== sh.emitter) return;
      m.complete('emitter');
      m.flags.emitter = true;
      b.vfx.ring(e.prop.pos, 9, GREEN, 0.5);
      m.say('goku', 'Got it! The beam\'s down!', 2, { style: 'shout' });
    });
    // the crew drops down the beam
    let sent = 0;
    const sp = m.spawner({
      every: R.every,
      maxAlive: 99,
      while: () => sent < R.kills + 2 && m.alive('raid').length < R.maxAlive,
      spawn: () => {
        sent++;
        const id = sent % 3 === 0 ? 'poacher_gunner' : 'poacher';
        const f = sh.foot();
        const s = m.spawn({ charId: id, team: 1, pos: new V3(f.x + U.rand(-2, 2), f.y + 14, f.z + U.rand(-2, 2)), startKi: 30, tag: 'raid', damageDealtMul: R.gruntDealt, warp: false });
        s.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
        b.vfx.ring(s.chest(), 2.2, GREEN, 0.3);
      },
    });
    const offK = sweepKOs(m);
    const off = () => {
      sp.stop();
      offP();
      offSw();
      offK();
      K.unhook(m, sweep);
      K.unhook(m, animals);
    };
    m.onDispose(off);
    const heroes = m.storyFight({ floors: [{ f: g, at: 0.15 }, { f: a, at: 0.15 }] });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => {
      m.progress('crew', Math.min(R.kills, m.killsByTag.raid || 0));
      return (!sh.emitter.alive && (m.killsByTag.raid || 0) >= R.kills) || m.state !== 'running';
    };
    off();
    heroes.off();
    if (m.state !== 'running') return;
    // what was still rising comes down; the crew is gone
    for (const c of S.animals) if (c.lift) c.lift.dir = -1;
    m.complete('crew');
    if (!m.flags.taken) m.complete('herd');
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    clearCrew(m);
    S.hitProp = null;
    m.flags.raided = true;
  } };

  /** CALL: rock, paper, scissors for the boss — 17 wins. */
  P.call = { id: 'call', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17, bs = S.boss;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    herdHome(b);
    clearCrew(m);
    g.controller = K.scripted();
    a.controller = K.scripted();
    const mid = K.ground(b, g.pos.clone().lerp(a.pos, 0.5));
    K.place(g, K.ground(b, mid.clone().add(new V3(-1.6, 0, 0))), Math.PI / 2);
    K.place(a, K.ground(b, mid.clone().add(new V3(1.6, 0, 0))), -Math.PI / 2);
    // the boss comes down out of the ship
    bs.setHidden(false);
    K.place(bs, K.ground(b, mid.clone().add(new V3(0, 0, 10))), Math.PI);
    K.faceTo(bs, mid);
    pose(bs, 'taunt', 'angry', 8);
    b.vfx.dust(bs.pos.clone(), 3, 16);
    b.sfx('groundImpact', bs, { vol: 1.2 });
    const cast = { goku: g, a17: a, boss: bs };
    shot(m, cast, { subject: 'boss', focus: 'full', angle: 'low' }, 999);
    m.say('poacher_boss', 'You two have cost me a fortune. Who wants to be first?', 2.8);
    yield* st.wait(2.8);
    shot(m, cast, { subject: 'goku', with: 'a17', focus: 'medium', angle: 'side' }, 999);
    K.faceTo(g, a.pos);
    K.faceTo(a, g.pos);
    m.say('goku', 'He\'s mine!', 1.2, { style: 'shout' });
    yield* st.wait(1.1);
    m.say('android_17', 'Your island? No — mine. He\'s mine.', 1.8);
    yield* st.wait(1.8);
    m.say('goku', 'Rock, paper, scissors, then!', 1.6);
    const r = yield* st.cue('light', 'Rock, paper, scissors! (Light)', { auto: 3, slow: 0.5 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    pose(g, 'rpsRock', 'grin', 30);
    pose(a, 'rpsPaper', 'smirk', 30);
    shot(m, cast, { subject: 'a17', with: 'goku', focus: 'medium', angle: 'three' }, 999);
    yield* st.wait(0.8);
    m.say('android_17', 'Paper. He\'s mine.', 1.8);
    m.flags.rps = 'a17';
    yield* st.wait(1.8);
    pose(g, 'exhausted', 'sad', 8);
    m.say('goku', 'Aw, man...', 1.4);
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * BOSS: as Android 17 — the boss and his two guards (gunners: 17's barrier eats their volleys; optional goal).
   * Ends with the boss at his floor and the guards down.
   */
  P.boss = { id: 'boss', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17, bs = S.boss, T = TU.boss;
    stage(m);
    herdHome(b);
    clearCrew(m);
    a.team = 0;
    if (bs.hidden || bs.pos.distanceTo(a.pos) < 5) K.place(bs, K.ground(b, a.pos.clone().add(new V3(0, 0, 9))), Math.PI);
    bs.setHidden(false);
    bs.untargetable = bs.intangible = a.untargetable = a.intangible = false;
    a.cannotDie = false;
    a.hp = Math.max(a.hp, a.hpMax * 0.8);
    bs.hp = bs.hpMax;
    b.switchPlayer(a, { force: true, quiet: true });
    b.setParty([a], {});
    // Goku steps back and watches (the episode: he lost the toss) — after the hand-off, which gives the one handed
    // off an ally AI
    bench(g, false);
    K.watcher(g, 'g_handsHips', 'grin');
    K.place(g, K.ground(b, a.pos.clone().add(new V3(-8, 0, -6))), 0);
    K.faceTo(g, bs.pos);
    a.target = bs;
    bs.target = a;
    bs.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, bs.def.ai) });
    const guards = [-1, 1].map((s) => {
      const f = m.spawn({ charId: 'poacher_gunner', team: 1, pos: K.ground(b, bs.pos.clone().add(new V3(s * 5, 0, 2))), startKi: 60, tag: 'guard', damageDealtMul: T.guardDealt, warp: false });
      f.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      return f;
    });
    a.setState('free');
    bs.setState('free');
    m.music('battle', 4);
    m.title(CHAPTER, 'THE PARK RANGER', 'Android 17 vs the Poacher Boss', 2.4);
    m.objective('boss', 'Take down the poacher boss', { icon: 'fist' });
    m.objective('guards', 'Deal with his guards', { icon: 'fist', target: guards.length });
    m.objective('shield', 'Catch their shots on your barrier (Special 2)', { icon: 'guard', optional: true, target: T.shields });
    m.prompt('a17Barrier', 'special2', 'Barrier', { when: () => a.state === 'free' && guards.some((x) => x.alive) });
    // a guard's shot that dies on the barrier
    let caught = 0;
    const seen = new Set();
    const shield = () => {
      if (a.state !== 'barrier') return;
      const c = a.chest();
      for (const p of b.projectiles.list) {
        if (seen.has(p) || p.team === a.team || p.pos.distanceTo(c) > a.sd.r + 1.5) continue;
        seen.add(p);
        m.progress('shield', ++caught);
      }
    };
    m.tickHooks.push(shield);
    const offK = sweepKOs(m);
    const off = () => {
      K.unhook(m, shield);
      offK();
    };
    m.onDispose(off);
    const sf = m.storyFight({ floors: [{ f: bs, at: T.floor }], dealt: [{ f: bs, mul: T.bossDealt }], fighters: [a, bs] });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => {
      const down = guards.filter((x) => !x.alive).length;
      m.progress('guards', down);
      return (sf.floored(bs) && down >= guards.length) || m.state !== 'running';
    };
    off();
    sf.off();
    a.cannotDie = true;
    if (m.state !== 'running') return;
    m.complete('boss');
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    for (const x of guards) x.setHidden(true);
    m.flags.bossDown = true;
  } };

  /** BLUFF: the bribe, the switch; 17 takes him straight up — and it is fireworks. */
  P.bluff = { id: 'bluff', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17, bs = S.boss;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    for (const f of [a, bs]) f.controller = K.scripted();
    bs.setHidden(false);
    K.place(bs, K.ground(b, bs.pos.clone()), bs.yaw);
    K.place(a, K.ground(b, bs.pos.clone().add(new V3(0, 0, -4))), 0);
    K.faceTo(a, bs.pos);
    K.faceTo(bs, a.pos);
    pose(bs, 'defeatKneel', 'hurt', 8);
    pose(a, 'a17_idle', 'calm', 8);
    const cast = { a17: a, boss: bs, goku: g };
    shot(m, cast, { subject: 'boss', with: 'a17', focus: 'medium', angle: 'three' }, 999);
    m.say('poacher_boss', 'W-wait! Let\'s talk! Half of everything — the whole catch!', 2.8);
    yield* st.wait(2.8);
    m.say('android_17', 'Not interested.', 1.4);
    yield* st.wait(1.4);
    pose(bs, 'taunt', 'wicked', 10);
    shot(m, cast, { subject: 'boss', focus: 'upper', angle: 'low' }, 999);
    m.say('poacher_boss', 'Then one more step and I blow this ship sky-high — your precious island with it!', 3.2, { style: 'shout' });
    yield* st.wait(3.2);
    // 17 takes him straight up, away from the island
    shot(m, cast, { subject: 'a17', focus: 'upper', angle: 'three' }, 999);
    m.say('android_17', 'Then do it up there.', 1.6);
    yield* st.wait(1.2);
    pose(a, 'flyUp', 'determined', 20);
    pose(bs, 'launched', 'shock', 20);
    const from = bs.pos.clone(), top = from.clone().add(new V3(0, 70, 0));
    m.shot((t, o) => {
      o.pos.copy(from).add(new V3(-30, 10, -30));
      o.look.copy(bs.pos);
      o.fov = 50;
    }, 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      const k = U.easeInCubic(Math.min(1, n / 60));
      bs.setPosition(from.clone().lerp(top, k));
      a.setPosition(from.clone().lerp(top, k).add(new V3(0, -1.6, 0)));
      bs.grounded = a.grounded = false;
      if (n % 3 === 0 && !b.skipRequested) b.vfx.afterimage(a.pos, a.height, 0xbfe4ff);
      return n >= 60 || b.skipRequested;
    };
    // up there, close: the switch — and party fireworks
    bs.vel.set(0, 0, 0);
    a.vel.set(0, 0, 0);
    pose(bs, 'taunt', 'shout', 14);
    pose(a, 'a17_idle', 'calm', 10);
    const side = new V3(Math.cos(a.yaw), 0, -Math.sin(a.yaw));
    const both = a.chest().lerp(bs.chest(), 0.5);
    m.shot((t, o) => {
      o.pos.copy(both).addScaledVector(side, 8).add(new V3(0, 0.4, 0));
      o.look.copy(both).add(new V3(0, 0.6, 0));
      o.fov = 48;
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('poacher_boss', 'Y-you asked for it!', 1.4, { style: 'shout' });
    yield* st.wait(1);
    const pop = bs.chest();
    if (!b.skipRequested) {
      const cols = [0xff5a6a, 0xffd04a, 0x5aff8a, 0x6ac8ff, 0xd07aff];
      for (let i = 0; i < 10; i++) {
        // over his head, not in his face: he stays in the shot with his switch
        const p = pop.clone().addScaledVector(side, U.rand(-3, 3)).add(new V3(0, U.rand(2.6, 5.5), 0));
        b.vfx.sparks(p, cols[i % cols.length], 28, 9, 0.16);
        b.vfx.flash(p, 1, cols[i % cols.length], 0.25, SL.Toon.tex.glow);
        b.vfx.ring(p, 1.2, cols[i % cols.length], 0.35);
      }
      b.sfx('explosionSmall', null, { at: pop, vol: 0.5, pitch: 1.6 });
    }
    m.flags.fireworks = true;
    yield* st.wait(1.2);
    m.say('android_17', '...Fireworks.', 1.6);
    yield* st.wait(1.6);
    m.say('goku', 'Hahaha! He was bluffing the whole time!', 2.2);
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
  } };

  /** END: the animals back; 17 is in — for the wish. */
  P.end = { id: 'end', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, a = S.a17, bs = S.boss;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    herdHome(b);
    clearCrew(m);
    bench(bs, true);
    // the crew goes to the Galactic Patrol, the ship with them
    if (S.ship) S.ship.dispose();
    for (const f of [g, a]) {
      f.controller = K.scripted();
      f.setHidden(false);
    }
    const camp = at(b, SPOT.camp);
    K.place(a, camp, 0);
    K.place(g, K.ground(b, camp.clone().add(new V3(0, 0, -6))), 0);
    K.faceTo(g, a.pos);
    K.faceTo(a, g.pos);
    pose(g, 'g_handsHips', 'grin', 8);
    pose(a, 'armsCrossed', 'calm', 8);
    const cast = { goku: g, a17: a };
    shot(m, cast, { subject: 'a17', with: 'goku', focus: 'wide', angle: 'three' }, 999);
    m.say('goku', 'The crew goes to the Galactic Patrol, and every animal\'s back where it belongs.', 3.2);
    yield* st.wait(3.2);
    shot(m, cast, { subject: 'a17', focus: 'upper', angle: 'three' }, 999);
    m.say('android_17', 'I owe you one. Fine — I\'ll fight in your tournament.', 3);
    yield* st.wait(3);
    m.say('goku', 'Really?! Alright!', 1.6, { style: 'shout' });
    yield* st.wait(1.6);
    pose(a, 'a17_idle', 'smirk', 8);
    m.say('android_17', 'If we win, I want the wish. My family\'s always wanted a big ship to see the world on.', 3.6);
    yield* st.wait(3.6);
    m.say('android_17', 'Is Krillin in?', 1.6);
    yield* st.wait(1.6);
    shot(m, cast, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    pose(g, 'g_peace', 'grin', 8);
    m.say('goku', 'Yep — him and Eighteen both!', 2);
    yield* st.wait(2);
    m.flags.joined = true;
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'THE PARK RANGER', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.usRanger = { TU, SPOT };
  SL.data.missions.us_ranger = {
    id: 'us_ranger', canon: true, chapter: CHAPTER, title: 'The Park Ranger', character: 'goku', stage: 'reserve_island',
    subtitle: 'Universe Survival · Goku and Android 17', parTime: 600, qteLabel: 'Rock, paper, scissors',
    blurb: 'Goku needs ten fighters, and one of them lives on an island full of endangered animals — a park ranger now, who has no intention of leaving his post. Until the poachers come.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => x.id !== 'base').map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Android 17 joins the team for the Tournament of Power'],
    setup,
    phases: [P.island, P.refusal, P.spar, P.beam, P.raid, P.call, P.boss, P.bluff, P.end],
  };
})();
