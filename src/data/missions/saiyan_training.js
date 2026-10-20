/*
 * CHAPTER 2 — SAIYAN SAGA: ONE YEAR
 * Mission "Alone in the Wild" (canon, playable as Kid Gohan).
 *
 * Canon beats: Piccolo leaves Gohan alone in the wilderness to toughen him
 * up; Gohan gets down from a rock pinnacle, finds food, is chased by a
 * dinosaur and his hidden power erupts; months later Piccolo trains him
 * personally (dodging barrages, fighting back, flying, Masenko); at the end
 * of the year two Saiyan pods streak toward Earth.
 * The full-moon night: Gohan looks at the moon and becomes a Great Ape; the
 * player takes Piccolo, keeps the giant busy, flies above it and blasts the
 * moon out of the sky; the ape shrinks back into a sleeping child.
 *
 * Gohan starts without flight, guard, dodge, heavy attacks or Masenko and
 * learns them through play. The HUD shows each skill appearing; there are no
 * tutorial text boxes. Contextual prompts only appear when the situation
 * calls for the action.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const START_LIMITS = { blast: false, charge: false, guard: false, dodge: false, heavy: false };
  const GOHAN_LOCKS = () => ({ special1: true, special2: true, ultimate: true, transform: true, potential: true });

  const PINNACLE = new V3(0, 0, 0);
  const STEPS = [
    { x: 7.4, z: 3.6, r: 2.6, h: 15 },
    { x: 13.2, z: -0.8, r: 2.5, h: 9.5 },
    { x: 18.2, z: 3.9, r: 2.7, h: 4.5 },
  ];
  const TREE = new V3(40, 0, 22);
  const DINO_SPAWN = new V3(78, 0, 52);
  const DEAD_END = new V3(-42, 0, -32);
  const TRAINING = new V3(-18, 0, 34);
  const MOON_CLEARING = new V3(-18, 0, 34);
  const CHASE_ROUTE = [new V3(74, 0, -22), new V3(32, 0, -74), new V3(-34, 0, -74)];

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function ground(b, v, lift = 0) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  }
  function place(f, pos, yaw, grounded = true) {
    f.setPosition(pos);
    f.yaw = yaw;
    f.prevYaw = yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = grounded;
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive || o.mission) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
      }
    }
  }
  function scriptedController() {
    return { update: () => SL.emptyIntent() };
  }

  /** A lone fruit tree: the first thing Gohan finds in the wild. */
  function fruitTree(b, pos) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 5.5, 8), SL.Toon.mat(0x5a3a22));
    trunk.position.y = 2.75;
    SL.Toon.addOutline(trunk, 1.5);
    g.add(trunk);
    for (const [x, y, z, s] of [[0, 6.4, 0, 3], [1.6, 5.6, 0.8, 2.2], [-1.5, 5.8, -0.6, 2.3], [0.3, 7.6, -0.4, 2]]) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), SL.Toon.mat(0x3f7a2e));
      c.position.set(x, y, z);
      SL.Toon.addOutline(c, 1.5);
      g.add(c);
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), SL.Toon.mat(0xe8402a));
      f.position.set(Math.cos(a) * 2.4, 5.2 + (i % 3) * 0.6, Math.sin(a) * 2.4);
      g.add(f);
    }
    g.position.copy(ground(b, pos));
    b.scene.add(g);
    return g;
  }

  function setup(battle, startPhase) {
    const b = battle;
    // set pieces: Gohan's pinnacle and the rocks he can jump down
    clearArea(b, new V3(9, 0, 1), 16);
    clearArea(b, TREE, 12);
    clearArea(b, TRAINING, 22);
    // the full-moon night needs room for a giant and a camera pulled far back to frame it
    clearArea(b, MOON_CLEARING, 46);
    const pin = b.stage.addSpire(PINNACLE.x, PINNACLE.z, 3.3, 21);
    pin.mission = true;
    for (const s of STEPS) b.stage.addSpire(s.x, s.z, s.r, s.h).mission = true;
    // the dead end where the chase ends
    for (const [dx, dz, r, h] of [[0, 0, 6, 26], [-7, 6, 5, 22], [7, -5, 5.5, 24], [-3, -8, 5, 20]]) b.stage.addSpire(DEAD_END.x + dx, DEAD_END.z + dz, r, h).mission = true;
    fruitTree(b, TREE);

    const top = pin.top;
    const gohan = b.spawn({ charId: 'kid_gohan', player: true, team: 0, pos: new V3(PINNACLE.x, top + 0.05, PINNACLE.z), grounded: false, noFlight: true, startKi: 20 });
    gohan.grounded = true;
    gohan.lockedSlots = GOHAN_LOCKS();
    const piccolo = b.spawn({ charId: 'piccolo', team: 1, pos: new V3(3, top + 6, 6), grounded: false, dummy: 'idle', cannotDie: true, infiniteHp: true, tags: { cinematic: true } });
    piccolo.controller = scriptedController();
    piccolo.untargetable = true;
    b.story = { gohan, piccolo, pinTop: top, dino: null };
  }

  const P = {};

  P.abandoned = {
    id: 'abandoned',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, pc = S.piccolo;
      m.lock(true);
      m.limits(Object.assign({}, START_LIMITS));
      m.music('orbit', 0);
      p.setState('scripted', { pose: 'kg_cry', expression: 'hurt' });
      pc.setState('scripted', { pose: 'flyIdle', expression: 'calm' });
      pc.yaw = Math.PI + 0.4;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.8);
      const top = S.pinTop;
      m.shot((t, out) => camAt(out, new V3(U.lerp(-60, -34, t), top + U.lerp(24, 12, t), U.lerp(70, 44, t)), new V3(0, top - 4, 0), 50), 4.4, { cut: true, blendIn: 0 });
      yield* m.cine(4.2);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(U.lerp(2.2, 1.6, t), U.lerp(0.6, 0.3, t), U.lerp(2.6, 2.0, t))), c, 44);
      }, 2.8, { cut: true, blendIn: 0 });
      yield* m.cine(2.6);
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, p.chest().add(new V3(-1.2, -0.4, -1.4)), c, 46);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Stop crying. In six months the Saiyans arrive. Until then, survive on your own.', 3.4);
      yield* m.cine(3.4);
      m.say('kid_gohan', 'M-Mister Piccolo! Don’t leave me here!', 2.2);
      // Piccolo leaves without looking back
      let rise = 0;
      m.tickHooks.push(() => {
        rise += 1 / 60;
        pc.pos.y += 18 / 60;
        pc.pos.x += 10 / 60;
        pc.prevPos.copy(pc.pos);
        if (Math.floor(rise * 60) % 3 === 0) b.vfx.trail(pc.chest(), 0xeaffd8, 0.5, 0.4);
      });
      pc.setState('scripted', { pose: 'flyUp' });
      m.shot((t, out) => camAt(out, p.chest().add(new V3(0.8, 0.2, 3.4)), pc.chest(), 52), 2.4, { cut: true, blendIn: 0 });
      yield* m.cine(2.2);
      m.tickHooks.length = 0;
      pc.setHidden(true);
      pc.pos.set(-80, 60, -30);
      pc.prevPos.copy(pc.pos);
      m.endShot();
      p.setState('free');
    },
  };

  P.descend = {
    id: 'descend',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player;
      m.lock(true);
      place(p, new V3(PINNACLE.x, S.pinTop + 0.05, PINNACLE.z), 1.2);
      p.noFlight = true;
      p.lockedSlots = GOHAN_LOCKS();
      m.limits(Object.assign({}, START_LIMITS));
      p.setState('free');
      m.lock(false);
      b.aiLocked = true;
      m.music('battle', 0);
      m.objective('down', 'Get down', { icon: 'down' });
      const soft = m.objective('soft', 'No hard landings', { icon: 'down', optional: true });
      let hard = false;
      const onDmg = (e) => {
        if (e.target === p && e.type === 'explosion' && !soft.failed) {
          hard = true;
          m.failObjective('soft');
        }
      };
      b.on('damage', onDmg);
      const t0 = m.time;
      m.prompt('jumpDown', 'ascend', 'Jump', { when: () => m.time - t0 > 3 && p.grounded, until: () => !p.grounded });
      yield () => p.grounded && p.pos.y < b.stage.heightAt(p.pos.x, p.pos.z) + 0.3 && p.state !== 'knockdown';
      m.complete('down');
      if (!hard) m.complete('soft');
      yield 0.4;
    },
  };

  P.hungry = {
    id: 'hungry',
    run: function* (m) {
      const b = m.battle, p = m.player;
      // stomach growls; Gohan clutches it — no text needed
      m.lock(true);
      p.setState('scripted', { pose: 'kg_scared', expression: 'hurt' });
      SL.Audio.play('growl');
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.6).add(new V3(0.6, 0.2, 0)), c, 42);
      }, 1.8, { cut: true, blendIn: 0 });
      yield* m.cine(1.6);
      m.endShot();
      p.setState('free');
      m.lock(false);
      b.aiLocked = true;
      let got = 0;
      m.objective('food', 'Find food', { icon: 'fruit', target: 3 });
      const spots = [[-1.6, -0.8], [1.8, 0.9], [0.2, 2.2]];
      const fruits = spots.map(([dx, dz]) =>
        m.pickup(ground(b, TREE.clone().add(new V3(dx, 0, dz)), 0.4), {
          kind: 'fruit',
          onCollect: () => {
            got++;
            m.progress('food', got);
            b.emit('markers', { list: fruits.filter((f) => f.alive).map((f) => ({ obj: f, icon: 'fruit' })) });
          },
        })
      );
      // the tree is visible from the rocks; markers only appear if the player wanders
      const t0 = m.time;
      m.tickHooks.push(() => {
        if (!m.flags.foodMarkers && m.time - t0 > 12) {
          m.flags.foodMarkers = true;
          b.emit('markers', { list: fruits.filter((f) => f.alive).map((f) => ({ obj: f, icon: 'fruit' })) });
        }
      });
      yield () => got >= 3;
      m.tickHooks.length = 0;
      b.emit('markers', { list: [] });
      m.lock(true);
      p.vel.set(0, 0, 0);
      p.setState('scripted', { pose: 'kg_eat', expression: 'grin' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(2.4, 0.6, 2)), c, 40);
      }, 2.2, { cut: true, blendIn: 0 });
      yield* m.cine(2);
    },
  };

  P.chase = {
    id: 'chase',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player;
      m.lock(true);
      m.clearObjectives();
      if (Math.hypot(p.pos.x - TREE.x, p.pos.z - TREE.z) > 12) place(p, ground(b, TREE.clone().add(new V3(-3, 0, -3))), -2.3);
      p.noFlight = true;
      p.lockedSlots = GOHAN_LOCKS();
      m.limits(Object.assign({}, START_LIMITS));
      p.cannotDie = true;
      p.setState('scripted', { pose: 'kg_eat', expression: 'grin' });
      // the ground starts to shake
      for (let i = 0; i < 3; i++) {
        b.camera.addTrauma(0.12 + i * 0.1);
        SL.Audio.play('groundImpact', { vol: 0.4 + i * 0.2, pitch: 0.6 });
        yield 0.55;
      }
      p.setState('scripted', { pose: 'kg_scared', expression: 'hurt', face: false });
      const dino = new SL.Creature(b, SL.data.creatures.trex, { pos: ground(b, DINO_SPAWN), yaw: Math.atan2(TREE.x - DINO_SPAWN.x, TREE.z - DINO_SPAWN.z), target: p });
      S.dino = dino;
      dino.setState('stalk');
      m.music('battle', 2);
      m.shot((t, out) => {
        const hp = dino.headPos();
        camAt(out, p.chest().add(new V3(-2, 0.6, -2.5)).lerp(hp, U.lerp(0, 0.15, t)), hp, 55);
      }, 3.2, { cut: true, blendIn: 0 });
      yield* m.cine(1.6);
      dino.roar();
      dino.sd.then = 'charge';
      yield* m.cine(1.8);
      m.endShot();
      p.yaw = Math.atan2(DEAD_END.x - p.pos.x, DEAD_END.z - p.pos.z);
      p.setState('free');
      m.lock(false);
      b.aiLocked = true;
      // a winding escape through the canyon; the last turn is a dead end
      const route = CHASE_ROUTE.map((v) => ({ pos: ground(b, v, 1), alive: true }));
      route.push({ pos: ground(b, DEAD_END.clone().add(new V3(11, 0, 10)), 1), alive: true });
      let leg = 0;
      const goal = route[route.length - 1];
      m.objective('escape', 'Run', { icon: 'run' });
      S.runGoal = route[0];
      b.emit('markers', { list: [{ obj: route[0], icon: 'run' }] });
      const bitesObj = m.objective('unbitten', 'Never get caught', { icon: 'dino', optional: true });
      let bites = 0;
      b.on('creatureBite', () => {
        bites++;
        if (!bitesObj.failed) m.failObjective('unbitten');
      });
      m.prompt('sprint', 'boost', 'Sprint', { when: () => dino.alive && dino.pos.distanceTo(p.pos) < 18, until: () => SL.Input.held('boost') });
      // rubber band: the dinosaur never falls far behind and never simply wins
      const t0 = m.time;
      m.tickHooks.push(() => {
        if (!dino.alive) return;
        if (leg < route.length - 1 && Math.hypot(p.pos.x - route[leg].pos.x, p.pos.z - route[leg].pos.z) < 9) {
          route[leg].alive = false;
          leg++;
          S.runGoal = route[leg];
          b.emit('markers', { list: [{ obj: route[leg], icon: 'run' }] });
        }
        const d = dino.pos.distanceTo(p.pos);
        if (dino.state === 'charge' || dino.state === 'stalk') {
          dino.state = 'charge';
          dino.sd.speedMul = d > 20 ? 1.75 : d < 8 ? 1.05 : 1.3;
        }
      });
      yield () => (leg === route.length - 1 && p.pos.distanceTo(goal.pos) < 7) || m.time - t0 > 75;
      if (bites === 0) m.complete('unbitten');
      m.tickHooks.length = 0;
      b.emit('markers', { list: [] });
      m.complete('escape');
      yield* m.def.outburst(m);
    },
  };

  /** Cornered: Gohan's hidden power erupts (player pushes it out). */
  function* outburst(m) {
    const b = m.battle, S = b.story, p = m.player, dino = S.dino, pc = S.piccolo;
    m.lock(true);
    const back = DEAD_END.clone().sub(p.pos).setY(0).normalize();
    place(p, ground(b, p.pos.clone()), Math.atan2(-back.x, -back.z));
    p.setState('scripted', { pose: 'kg_scared', expression: 'hurt' });
    const front = p.pos.clone().addScaledVector(back, -12);
    dino.pos.copy(ground(b, front));
    dino.prevPos.copy(dino.pos);
    dino.yaw = Math.atan2(p.pos.x - dino.pos.x, p.pos.z - dino.pos.z);
    dino.setState('roar', { then: 'idle' });
    m.shot((t, out, el) => {
      const hp = dino.headPos();
      camAt(out, p.chest().addScaledVector(back, 2.2).add(new V3(0, -0.3, 0)), hp, U.lerp(50, 36, Math.min(1, el / 1.8)));
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.slowmo(0.2, 3.5);
    m.say('kid_gohan', 'STOP IIIT!', 1.4);
    const res = yield* m.struggle({ start: 0.15, drain: 0.05, duration: 1.8, label: 'PUSH IT OUT', restoreLimits: true });
    m.qteParts.push(U.clamp01(res.avg * 1.6));
    b.slow = null;
    // the hidden power
    SL.Mechanics.hiddenPotential.unleash(p);
    p.setState('scripted', { pose: 'kg_rageBlast', expression: 'shout' });
    const origin = p.chest();
    const dir = dino.headPos().sub(origin).normalize();
    b.projectiles.spawnBlast(p, origin, dir, { kind: 'ball', speed: 80, radius: 1.4, damage: 0, color: 0xf0d8ff, core: 0xffffff, explode: 1, knock: 'flinch', impact: 1, life: 0.2 });
    b.sfx('kiBlastBig', p, { vol: 1.4, pitch: 0.8 });
    yield 0.25;
    b.vfx.explosion(dino.headPos(), 5, 0xf0d8ff, { smoke: true });
    SL.ScreenFX.flash(0.5, '#f8eeff');
    b.camera.addTrauma(0.9);
    dino.knockOver(dir);
    m.shot((t, out) => camAt(out, dino.pos.clone().add(new V3(-10, 6, 12)), dino.pos.clone().add(new V3(0, 3, 0)), 50), 3, { cut: true, blendIn: 0 });
    yield* m.cine(2.6);
    dino.sd.then = 'flee';
    dino.setState('flee', { from: p.pos.clone() });
    // Gohan looks at his own hands
    p.setState('scripted', { pose: 'kg_lookHands', expression: 'calm' });
    m.shot((t, out) => {
      const c = p.chest();
      camAt(out, c.clone().addScaledVector(p.forward, 1.6).add(new V3(0.3, 0.5, 0)), c.clone().addScaledVector(p.forward, 0.4).add(new V3(0, -0.15, 0)), 38);
    }, 2.6, { cut: true, blendIn: 0 });
    yield* m.cine(2.4);
    // someone was watching
    pc.setHidden(false);
    const perch = S.dino ? DEAD_END.clone().add(new V3(0, 0, 0)) : DEAD_END;
    const pinTop = b.stage.obstacles.filter((o) => o.mission && Math.hypot(o.x - DEAD_END.x, o.z - DEAD_END.z) < 1).map((o) => o.top)[0] || ground(b, perch).y + 26;
    place(pc, new V3(perch.x, pinTop + 0.05, perch.z), Math.atan2(p.pos.x - perch.x, p.pos.z - perch.z));
    pc.setState('scripted', { pose: 'idle', expression: 'smirk' });
    m.shot((t, out) => {
      const c = pc.chest();
      camAt(out, c.clone().add(new V3(2.4, -0.4, 2.6)), c, 42);
    }, 2.4, { cut: true, blendIn: 0 });
    m.say('piccolo', 'Hmph. So it’s in there after all.', 2.4);
    yield* m.cine(2.4);
    m.endShot();
    pc.setHidden(true);
    if (dino.alive) dino.dispose();
    p.mech.unleashed = false;
    p.mech.unleashT = 0;
    p.aura.setStyle(p.form.aura);
    p.cannotDie = false;
  }

  /** The full moon: a pale disc with a glow, far up in the night sky. */
  function fullMoon(b, at) {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xfff0c0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
    glow.scale.setScalar(4.5);
    g.add(disc, glow);
    g.position.copy(at).add(new V3(70, 150, -240));
    g.scale.setScalar(20);
    b.scene.add(g);
    return {
      group: g,
      dispose() {
        b.scene.remove(g);
        disc.geometry.dispose();
        disc.material.dispose();
        glow.material.dispose();
      },
    };
  }

  P.moon = {
    id: 'moon',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.gohan, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 0.6);
      yield 0.7;
      if (S.dino && S.dino.alive) S.dino.dispose();
      const spot = ground(b, MOON_CLEARING);
      place(p, spot.clone(), 0);
      p.hp = p.hpMax;
      p.noFlight = true;
      p.setState('scripted', { pose: 'idle', expression: 'calm', face: true });
      pc.setHidden(true);
      b.stage.setMood(0.85, 0x060a1c, 0.2);
      if (S.moon) S.moon.dispose();
      S.moon = fullMoon(b, spot);
      const moonPos = S.moon.group.position;
      m.fade('clear', 0.8);
      m.shot((t, out, el) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(1.2, -0.3, 2.2)), c.clone().lerp(moonPos, 0.02 + el * 0.03), 44);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('kid_gohan', 'The moon is so big and round tonight...', 2.6);
      yield* m.cine(2.6);
      p.setState('scripted', { pose: 'powerCrouch', expression: 'shout' });
      b.sfx('roar', p, { pitch: 1.6 });
      yield* m.cine(0.8);
      // the transformation: Gohan's body swells into a giant
      const ape = SL.growInto(b, p, 'great_ape_gohan', { frames: 120, tags: { boss: true, priority: true } });
      ape.team = 1;
      ape.cannotDie = true;
      // cold moonlight on the silhouette so the giant reads against the night
      ape.rimLight = { color: 0xc8d8ff, strength: 1.2 };
      ape.controller = scriptedController();
      ape.setState('scripted', { pose: 'ga_roar', expression: 'shout' });
      S.gape = ape;
      m.shot((t, out, el) => camAt(out, ground(b, spot.clone().add(new V3(-16, 0, 22)), 3), ape.pos.clone().add(new V3(0, 2 + el * 5, 0)), 56), 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(2.4);
      b.sfx('roar', ape, { pitch: 0.8 });
      // Piccolo takes over
      const perch = ground(b, spot.clone().add(new V3(4, 0, 17)));
      pc.setHidden(false);
      pc.untargetable = false;
      pc.team = 0;
      pc.tags = {};
      pc.infiniteHp = false;
      pc.cannotDie = true;
      pc.hp = pc.hpMax;
      pc.ki = pc.kiMax;
      pc.rimLight = { color: 0xc8d8ff, strength: 0.9 };
      place(pc, perch, Math.atan2(ape.pos.x - perch.x, ape.pos.z - perch.z));
      pc.setState('scripted', { pose: 'idle', expression: 'angry', face: true });
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(2.2, 0.2, 2.6)), c, 40);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('piccolo', 'A tail and a full moon... So that is the Saiyan secret. I will deal with this myself.', 3.2);
      yield* m.cine(3.2);
      m.endShot();
      b.switchPlayer(pc, { force: true });
      ape.target = pc;
      pc.target = ape;
      ape.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      ape.setState('free');
      pc.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      const t0 = m.time;
      m.objective('busy', 'Keep the Great Ape busy', { icon: 'guard', target: 20 });
      m.prompt('gapeJump', 'ascend', 'Fly over it', { always: true, when: () => (ape.state === 'giantSweep' || ape.state === 'giantStomp') && ape.stateFrame < ape.sd.spec.windup && pc.distTo(ape) < 20, until: () => ape.state !== 'giantSweep' && ape.state !== 'giantStomp' });
      m.prompt('gapeMash', 'light', 'Break free', { required: true, always: true, when: () => pc.state === 'held', until: () => pc.state !== 'held' });
      m.tickHooks.push(() => m.progress('busy', Math.min(20, Math.floor(m.time - t0))));
      yield () => m.time - t0 >= 20;
      m.tickHooks.length = 0;
      m.complete('busy');

      // blast the moon. It is a real target now (an environmental prop far beyond the arena):
      // lock onto it (Lock-On picks what you look at; Next Target cycles to it) or free-aim at it,
      // and fire any ki attack — button or skill wheel. Shots at the giant hit the giant.
      m.objective('moon', 'Fly high above the Great Ape and blast the moon', { icon: 'ball' });
      const high = () => pc.alive && pc.pos.y - b.stage.heightAt(pc.pos.x, pc.pos.z) > ape.height * 0.95;
      const moonProp = b.stage.addProp({ kind: 'objective', pos: moonPos, r: 20, hp: 1, id: 'moon' });
      Object.assign(moonProp, { objective: true, far: true, lockable: true, lockRange: 560, static: true, name: 'the Moon', invulnerable: false });
      S.moonProp = moonProp;
      const aimingAtMoon = () => pc.lockProp === moonProp || SL.Targeting.farProp(b, pc) === moonProp;
      let shot = null;
      const offShot = b.on('farShot', (e) => {
        if (e.prop === moonProp && e.owner === pc && !shot) shot = e;
      });
      m.prompt('climb', 'ascend', 'Fly higher', { required: true, always: true, when: () => !high() && !shot && pc.state !== 'held', until: () => high() || !!shot });
      m.prompt('moonAim', 'target', 'Look up at the moon and lock on (it picks what you look at)', { required: true, always: true, when: () => high() && !shot && !aimingAtMoon(), until: () => !!shot });
      m.prompt('moonBlast', 'blast', 'Blast the moon', { required: true, always: true, when: () => high() && !shot && aimingAtMoon(), until: () => !!shot });
      // the skill wheel offers it too, and it goes through the same aim and the same ki blast
      b.contextActions = [{
        id: 'moonBlast', label: 'Blast the Moon', icon: 'ball', aim: 'environment', targetName: 'the Moon',
        when: () => !shot,
        run: () => {
          SL.Targeting.lock(b, pc, { prop: moonProp, kind: 'objective' });
          pc.buffer = { action: 'blast', frame: pc.frame };
        },
      }];
      const inFlight = () => b.projectiles.beams.some((x) => x.farProp === moonProp && !x.done) || b.projectiles.list.some((x) => x.farProp === moonProp && x.alive);
      const head = () => {
        const bm = b.projectiles.beams.find((x) => x.farProp === moonProp && !x.done);
        if (bm) return bm.head;
        const pr = b.projectiles.list.find((x) => x.farProp === moonProp && x.alive);
        return pr ? pr.pos : moonPos;
      };
      while (moonProp.alive) {
        shot = null;
        yield () => !!shot;
        m.flags.moonShotKind = shot.kind;
        // the shot is on its way: follow it up into the sky
        m.lock(true);
        const from = pc.chest();
        m.shot((t, out) => camAt(out, ground(b, pc.pos.clone().add(new V3(-8, 0, 10)), 2), from.clone().lerp(head(), 0.85), 52), 999, { hold: true, cut: true, blendIn: 0 });
        yield () => !moonProp.alive || !inFlight();
        if (moonProp.alive) {
          // it did not get there (the giant was in the way): back to the fight, and say why
          m.endShot();
          m.lock(false);
          m.flags.moonMisses = (m.flags.moonMisses || 0) + 1;
          m.say('piccolo', 'He is in the way — get above him and try again!', 2.4, { style: 'shout' });
        }
      }
      b.contextActions = [];
      if (offShot) offShot();
      ape.controller = scriptedController();
      ape.setState('scripted', { pose: 'ga_roar', expression: 'shout' });
      b.vfx.flash(moonPos, 600, 0xfff6d8, 0.6, SL.Toon.tex.glow);
      SL.ScreenFX.flash(0.5, '#fff6d8');
      b.cameraTraumaAt(pc.pos, 0.4);
      b.sfx('explosionBig', null, { at: pc.pos, vol: 1.3 });
      S.moon.dispose();
      S.moon = null;
      S.moonGone = true;
      b.stage.setMood(0.93, 0x03050c, 1.2);
      m.complete('moon');
      b.emit('moonDestroyed', { by: pc });
      yield* m.cine(1.2);

      // the Great Ape shrinks back into a sleeping boy
      m.shot((t, out) => camAt(out, ground(b, ape.pos.clone().add(new V3(-12, 0, 16)), 3), ape.pos.clone().add(new V3(0, 2, 0)), 52), 999, { hold: true, cut: true, blendIn: 0 });
      let sk = 0;
      const full = ape.model.baseScale;
      const small = p.scale / ape.scale;
      m.tickHooks.push(() => {
        sk++;
        ape.model.root.scale.setScalar(full * (1 - (1 - small) * U.easeInOutCubic(Math.min(1, sk / 100))));
      });
      yield* m.cine(1.8);
      m.tickHooks.length = 0;
      const where = ground(b, ape.pos);
      b.remove(ape);
      S.gape = null;
      p.setHidden(false);
      p.untargetable = false;
      place(p, where, 0);
      p.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(1.6, 1.0, 1.8)), c, 40);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('piccolo', 'Asleep, after all that. Tomorrow your real training begins, brat.', 3);
      yield* m.cine(3);
      m.endShot();
      // back to the story as it was: Gohan is the hero, Piccolo his (sparring) opponent
      b.switchPlayer(p, { force: true });
      pc.team = 1;
      pc.tags = { cinematic: true };
      pc.controller = scriptedController();
      pc.untargetable = true;
      pc.infiniteHp = true;
      pc.rimLight = null;
      pc.setHidden(true);
      b.stage.clearMood(0.1);
      m.music('orbit', 0);
    },
  };

  P.training = {
    id: 'training',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 0.6);
      yield 0.7;
      if (S.dino && S.dino.alive) S.dino.dispose();
      const home = ground(b, TRAINING);
      place(p, home.clone(), 0);
      p.hp = p.hpMax;
      p.ki = 40;
      p.noFlight = true;
      p.lockedSlots = GOHAN_LOCKS();
      m.limits(Object.assign({}, START_LIMITS));
      p.setState('scripted', { pose: 'kg_ready', expression: 'angry' });
      pc.setHidden(false);
      place(pc, ground(b, TRAINING.clone().add(new V3(0, 0, 16))), Math.PI);
      pc.team = 1;
      pc.untargetable = false;
      pc.setState('scripted', { pose: 'idle', expression: 'calm' });
      p.target = pc;
      pc.target = p;
      m.fade('clear', 0.8);
      m.title('SIX MONTHS LATER', 'TRAINING WITH PICCOLO', '', 3);
      m.music('battle', 1);
      m.shot((t, out) => {
        const mid = p.chest().lerp(pc.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(U.lerp(14, 10, t), 4, U.lerp(-2, 2, t))), mid, 48);
      }, 3.4, { cut: true, blendIn: 0 });
      yield* m.cine(3.2);
      m.say('piccolo', 'Dodge.', 1.4);
      m.endShot();

      /* --- drill 1: survive the barrage (guard and dodge) --- */
      m.teach(p, 'guard');
      m.teach(p, 'dodge');
      p.setState('free');
      pc.setState('scripted', { pose: 'blastWind', expression: 'calm', face: true });
      m.lock(false);
      b.aiLocked = true;
      m.objective('barrage', 'Survive the barrage', { icon: 'clock', target: 20 });
      const counterObj = m.objective('clean', 'Perfect Guard or vanish 3 times', { icon: 'guard', optional: true });
      let counters = 0;
      const onCounter = (e) => {
        if (e.fighter !== p || counterObj.done) return;
        counters++;
        if (counters >= 3) m.complete('clean');
      };
      b.on('perfectGuard', onCounter);
      b.on('vanish', onCounter);
      m.prompt('dodgeBlast', 'dodge', 'Dodge', { when: () => b.projectiles.list.some((pr) => pr.owner === pc && pr.pos.distanceTo(p.chest()) < 9), until: () => SL.Input.pressed('dodge') });
      m.prompt('guardBlast', 'guard', 'Guard', { when: () => m.time > 0 && b.projectiles.list.some((pr) => pr.owner === pc && pr.pos.distanceTo(p.chest()) < 7), until: () => SL.Input.held('guard') });
      const t0 = m.time;
      let volley = 0;
      m.tickHooks.push(() => {
        if (b.inputLocked) return;
        pc.faceTarget(10);
        volley++;
        if (volley % 55 === 0 || (volley % 55 === 9 && volley > 110) || (volley % 55 === 18 && volley > 330)) {
          const side = volley % 2 ? 'R' : 'L';
          const origin = pc.handPos(side);
          const dir = p.chest().sub(origin).normalize();
          b.projectiles.spawnBlast(pc, origin, dir, { kind: 'blast', speed: 46, radius: 0.35, damage: 110, color: 0xe8ff8a, core: 0xffffff, homing: 0.4, knock: 'flinch', impact: 1, hitstun: 14, explode: 1, life: 2.2 });
          pc.anim.play(side === 'R' ? 'blastR' : 'blastL', 45, { restart: true });
          b.sfx('kiBlast', pc);
        }
        m.progress('barrage', Math.floor(m.time - t0));
      });
      p.cannotDie = true;
      yield () => m.time - t0 >= 20;
      m.tickHooks.length = 0;
      m.progress('barrage', 20);
      // Piccolo is harsh, but he is not trying to kill his student
      p.hp = Math.max(p.hp, p.hpMax * 0.8);
      yield 0.6;

      /* --- drill 2: land hits on Piccolo --- */
      m.lock(true);
      m.teach(p, 'heavy');
      p.cannotDie = true;
      m.say('piccolo', 'Enough running. Hit me.', 1.8);
      yield* m.cine(1.4);
      pc.controller = new SL.AIController(b, { difficulty: 'normal', profile: { aggression: 0.3, defense: 0.5, ranged: 0.1, beam: 0, preferredRange: 3 } });
      pc.cannotDie = true;
      pc.infiniteHp = true;
      pc.damageDealtMul = 0.35;
      // a sparring partner, not a boss: no beams or finishers against his student
      pc.lockedSlots = { special1: true, special2: true, ultimate: true, transform: true };
      // Piccolo fights on foot until his student can fly
      pc.noFlight = true;
      place(pc, ground(b, pc.pos.clone()), pc.yaw);
      pc.setState('free');
      m.lock(false);
      let hits = 0;
      m.objective('hits', 'Land hits on Piccolo', { icon: 'fist', target: 8 });
      const onHit = (e) => {
        if (e.attacker === p && e.target === pc && !e.blocked) {
          hits++;
          m.progress('hits', hits);
        }
      };
      b.on('damage', onHit);
      m.prompt('headbuttPrompt', 'heavy', 'Headbutt', { when: () => pc.state === 'stagger' || pc.state === 'guardBreak' || (p.state === 'attack' && p.chain >= 1), until: () => SL.Input.pressed('heavy') });
      yield () => hits >= 8;
      yield 0.5;

      /* --- drill 3: thrown into the sky, Gohan flies --- */
      m.lock(true);
      clearCombat(b);
      pc.controller = scriptedController();
      pc.noFlight = false;
      place(pc, pc.pos.clone(), pc.yaw);
      pc.setState('scripted', { pose: 'p_chop', expression: 'angry' });
      p.setState('free');
      p.takeHit(pc, { type: 'melee', damage: 60, knock: 'launch', knockSpeed: 30, hitstun: 70, impact: 3, dir: new V3(0, 1, 0), point: p.chest() });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(6, -3, 6)), c, 55);
      }, 999, { hold: true, cut: true, blendIn: 0.2 });
      yield () => p.vel.y < -2;
      b.slowmo(0.25, 1.2);
      m.say('kid_gohan', 'Waaaah—!', 1.2);
      yield 0.5;
      m.teach(p, 'flight');
      p.setState('recover', { frames: 6 });
      p.vel.set(0, 0, 0);
      m.endShot();
      m.lock(false);
      b.aiLocked = true;
      // Piccolo flies a slow loop; catch him
      pc.setState('scripted', { pose: 'flyForward', expression: 'smirk' });
      const loopC = TRAINING.clone().add(new V3(0, 0, 8));
      const loopY = ground(b, loopC).y + 16;
      let ang = 0;
      m.objective('catch', 'Catch Piccolo', { icon: 'fly' });
      m.prompt('flyUp', 'ascend', 'Fly', { required: true, always: true, when: () => pc.pos.y - p.pos.y > 4, until: () => p.pos.y - b.stage.heightAt(p.pos.x, p.pos.z) > 6 });
      m.tickHooks.push(() => {
        ang += 0.35 / 60;
        const np = new V3(loopC.x + Math.cos(ang) * 22, loopY + Math.sin(ang * 2) * 3, loopC.z + Math.sin(ang) * 22);
        pc.yaw = Math.atan2(np.x - pc.pos.x, np.z - pc.pos.z);
        pc.pos.copy(np);
        pc.prevPos.copy(np);
        if (b.frame % 3 === 0) b.vfx.trail(pc.chest(), 0xeaffd8, 0.35, 0.35);
      });
      b.emit('markers', { list: [{ obj: pc, icon: 'fly' }] });
      yield () => p.chest().distanceTo(pc.chest()) < 3.6;
      m.tickHooks.length = 0;
      b.emit('markers', { list: [] });
      m.complete('catch');

      /* --- drill 4: Masenko --- */
      m.lock(true);
      clearCombat(b);
      pc.setState('scripted', { pose: 'flyIdle', expression: 'calm', face: true });
      place(pc, pc.pos.clone(), pc.yaw, false);
      const away = pc.pos.clone().sub(p.pos).setY(0).normalize();
      place(p, pc.pos.clone().addScaledVector(away, -24), Math.atan2(away.x, away.z), false);
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().addScaledVector(away, -3).add(new V3(1.2, 0.3, 0)), c, 40);
      }, 2.8, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Now. Show me the power you were hiding.', 2.6);
      yield* m.cine(2.6);
      m.endShot();
      m.teach(p, 'special1');
      p.ki = p.kiMax;
      p.setState('free');
      m.lock(false);
      b.aiLocked = true;
      pc.controller = { update: () => Object.assign(SL.emptyIntent(), { guard: true }) };
      pc.setState('free');
      m.objective('masenko', 'Hit Piccolo with Masenko', { icon: 'beam' });
      m.prompt('masenkoPrompt', 'special1', 'Masenko', { required: true, always: true, when: () => p.state === 'free', until: () => p.state === 'beamCharge' || p.state === 'beamFire' });
      let landed = false;
      b.on('damage', (e) => {
        if (e.attacker === p && e.target === pc && e.type === 'beam') landed = true;
      });
      m.tickHooks.push(() => {
        if (p.ki < 30 && p.state === 'free') p.ki = Math.min(p.kiMax, p.ki + 0.6);
        pc.vel.set(0, 0, 0);
      });
      yield () => landed;
      m.tickHooks.length = 0;
      m.complete('masenko');
      yield 1.2;
    },
  };

  function clearCombat(b) {
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  P.ready = {
    id: 'ready',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      m.fade('black', 0.6);
      yield 0.7;
      const rock = b.stage.obstacles.find((o) => o.mission && Math.hypot(o.x - STEPS[2].x, o.z - STEPS[2].z) < 1);
      const seat = rock ? new V3(rock.x, rock.top + 0.05, rock.z) : ground(b, TRAINING);
      place(p, seat.clone().add(new V3(-0.9, 0, 0.3)), 0.6);
      place(pc, seat.clone().add(new V3(1.0, 0, -0.4)), 0.2);
      p.setState('scripted', { pose: 'kg_meditate', expression: 'calm' });
      pc.setState('scripted', { pose: 'p_meditate', expression: 'calm' });
      b.stage.setMood(0.42, 0x6a2a10, 1.2);
      m.fade('clear', 1);
      m.music('finale', 0);
      m.title('ONE YEAR LATER', '', '', 2.4);
      m.shot((t, out) => camAt(out, seat.clone().add(new V3(U.lerp(-9, -7, t), 2.2, U.lerp(10, 8, t))), seat.clone().add(new V3(0, 0.6, 0)), 44), 12, { cut: true, blendIn: 0 });
      yield* m.cine(3);
      // two streaks of light cross the sky
      const streaks = [0, 1].map((i) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.flare, color: 0xffe0c0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
        s.scale.setScalar(9);
        b.scene.add(s);
        return s;
      });
      let k = 0;
      m.tickHooks.push(() => {
        k = Math.min(1, k + 1 / 200);
        streaks.forEach((s, i) => {
          s.position.set(U.lerp(-260, 220, k) + i * 18, seat.y + U.lerp(120, 40, k) - i * 6, U.lerp(-200, 120, k) - i * 10);
          if (b.frame % 2 === 0) b.vfx.trail(s.position, 0xffc890, 4, 0.7);
        });
      });
      SL.Audio.play('dash', { vol: 0.8 });
      yield* m.cine(1.6);
      pc.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.say('piccolo', 'They’re here.', 1.8);
      yield* m.cine(1.8);
      p.setState('scripted', { pose: 'kg_ready', expression: 'angry' });
      m.say('kid_gohan', 'I’m ready, Mister Piccolo.', 2.2);
      yield* m.cine(2.2);
      m.tickHooks.length = 0;
      streaks.forEach((s) => {
        b.scene.remove(s);
        s.material.dispose();
      });
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      b.stage.clearMood(0.1);
      m.title('CHAPTER 2', 'THE SAIYANS ARE COMING', 'Meanwhile, Goku races along Snake Way.', 3.8);
      yield* m.cine(4);
    },
  };

  const survival = {
    id: 'saiyan_survival',
    canon: true,
    chapter: 'CHAPTER 2 · SAIYAN SAGA',
    title: 'Alone in the Wild',
    subtitle: 'Earth · the year before the Saiyans',
    character: 'kid_gohan',
    stage: 'wilderness',
    parTime: 420,
    qteLabel: 'Hidden power',
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Piccolo abandons Gohan in the wilderness. To survive the year, the boy will have to find the power inside himself.',
    rewards: ['Kid Gohan — playable prototype', 'Wilderness Canyon stage'],
    setup,
    outburst,
    phases: [P.abandoned, P.descend, P.hungry, P.chase, P.moon, P.training, P.ready],
  };

  SL.data.missions[survival.id] = survival;

  /* ======================================================================
   * Mission "Ten Times Gravity" (canon, playable as Goku).
   * Goku reaches King Kai's tiny planet at the end of Snake Way (the run
   * itself is the mission before this one, saiyan_snakeway.js), adapts to the crushing gravity by catching
   * Bubbles, hits Gregory with a hammer, and learns the Kaioken — capped at
   * x2, exactly as King Kai warns him. Then the Dragon Balls wish him back.
   * ====================================================================== */
  const KK = {};
  const HOUSE = new V3(-4, 0, -21);

  function kkHouse(b) {
    const g = new THREE.Group();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.2, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), SL.Toon.mat(0xf4efe0));
    SL.Toon.addOutline(dome, 1.8);
    g.add(dome);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(4.25, 4.25, 0.6, 24, 1, true), SL.Toon.mat(0xd8402a, { side: THREE.DoubleSide }));
    band.position.y = 0.3;
    g.add(band);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2, 0.3), SL.Toon.mat(0x6a4a2a));
    door.position.set(0, 1, 4.05);
    g.add(door);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.6, 8), SL.Toon.mat(0xd8402a));
    spire.position.y = 4.9;
    g.add(spire);
    const car = new THREE.Group();
    const bodyM = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 3.2), SL.Toon.mat(0xd8302a));
    bodyM.position.y = 0.7;
    SL.Toon.addOutline(bodyM, 1.2);
    car.add(bodyM);
    for (const [x, z] of [[0.9, 1.1], [-0.9, 1.1], [0.9, -1.1], [-0.9, -1.1]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 12), SL.Toon.mat(0x222222));
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.38, z);
      car.add(w);
    }
    car.position.set(7, 0, 3);
    car.rotation.y = 0.6;
    g.add(car);
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 4, 8), SL.Toon.mat(0x6a4a2a));
    trunk.position.y = 2;
    tree.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), SL.Toon.mat(0x3f8a2e));
    crown.position.y = 5;
    SL.Toon.addOutline(crown, 1.5);
    tree.add(crown);
    tree.position.set(-8, 0, 4);
    g.add(tree);
    g.position.copy(ground(b, HOUSE, -0.2));
    // sit flush on the curved little planet
    const R = b.stage.def.planet ? b.stage.def.planet.radius : 1e6;
    g.quaternion.setFromUnitVectors(new V3(0, 1, 0), new V3(HOUSE.x / R, 1, HOUSE.z / R).normalize());
    b.scene.add(g);
  }

  function kkSetup(battle) {
    const b = battle;
    kkHouse(b);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, new V3(0, 0, 14)), noFlight: true, startKi: 60 });
    // Saiyan Saga Goku before King Kai: no Instant Transmission, Spirit Bomb or transformations
    goku.lockedSlots = { special2: true, ultimate: true, transform: true };
    goku.lockedForms = { ssj: true };
    goku.formCaps = { kaioken: 0 };
    const kai = b.spawn({ charId: 'king_kai', team: 0, pos: ground(b, HOUSE.clone().add(new V3(2, 0, 8))), dummy: 'idle', infiniteHp: true, cannotDie: true, tags: { cinematic: true } });
    kai.controller = scriptedController();
    kai.untargetable = true;
    const bubbles = b.spawn({ charId: 'bubbles', team: 1, pos: ground(b, new V3(4, 0, 2)), noFlight: true, dummy: 'idle', infiniteHp: true, cannotDie: true, tags: { cinematic: true } });
    bubbles.controller = scriptedController();
    goku.yaw = goku.prevYaw = Math.atan2(kai.pos.x - goku.pos.x, kai.pos.z - goku.pos.z);
    b.story = { goku, kai, bubbles, gregory: null };
    goku.target = null;
  }

  KK.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, kai = S.kai, bub = S.bubbles;
      m.lock(true);
      m.music('menu', 0);
      p.moveScale = 0.45;
      p.setState('scripted', { pose: 'g_defeatKnee', expression: 'grit' });
      kai.setState('scripted', { pose: 'idle', expression: 'smirk', face: false });
      kai.yaw = Math.atan2(p.pos.x - kai.pos.x, p.pos.z - kai.pos.z);
      bub.setState('scripted', { pose: 'idle', expression: 'grin' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      m.shot((t, out) => camAt(out, new V3(U.lerp(40, 28, t), U.lerp(26, 14, t), U.lerp(40, 30, t)), new V3(0, -2, 0), 48), 4, { cut: true, blendIn: 0 });
      yield* m.cine(3.8);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.2).add(new V3(0.9, U.lerp(-0.5, -0.3, t), 0)), c.clone().add(new V3(0, 0.15, 0)), 42);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('goku', "Whoa... my body weighs a ton...!", 2.4);
      b.camera.addTrauma(0.2);
      yield* m.cine(2.4);
      m.shot((t, out) => {
        const c = kai.chest();
        camAt(out, c.clone().add(new V3(-1.6, 0.3, 2.6)), c, 42);
      }, 3.4, { cut: true, blendIn: 0 });
      kai.setState('scripted', { pose: 'kk_point', expression: 'smirk' });
      m.say('king_kai', "Ten times Earth's gravity. If you can't catch my monkey Bubbles, I'm not teaching you anything.", 3.4);
      yield* m.cine(3.4);
      m.endShot();
      kai.setState('scripted', { pose: 'idle', expression: 'smirk' });
      p.setState('free');
    },
  };

  KK.bubbles = {
    id: 'bubbles',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, bub = S.bubbles;
      m.lock(true);
      clearCombat(b);
      place(p, ground(b, new V3(0, 0, 12)), Math.PI);
      p.moveScale = 0.45;
      p.noFlight = true;
      bub.untargetable = false;
      place(bub, ground(b, new V3(3, 0, 4)), 0);
      p.target = bub;
      bub.target = p;
      // catching, not fighting: no strikes on the monkey
      m.limits({ light: false, heavy: false, blast: false, s1: false, charge: false });
      p.setState('free');
      bub.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 1);
      m.objective('bubbles', 'Catch Bubbles', { icon: 'run' });
      // Bubbles flees, cuts corners and hops; Goku slowly adapts to the gravity
      let n = 0, dodge = 0;
      bub.controller = {
        update: () => {
          const it = SL.emptyIntent();
          if (b.inputLocked) return it;
          n++;
          const away = bub.pos.clone().sub(p.pos).setY(0);
          const d = away.length();
          // circle around the planet instead of running off the edge
          const tangent = new V3(-bub.pos.z, 0, bub.pos.x).normalize().multiplyScalar(Math.sin(n * 0.01) > 0 ? 1 : -1);
          const inward = bub.pos.clone().setY(0).multiplyScalar(-1 / 40);
          const dir = away.normalize().multiplyScalar(d < 10 ? 1 : 0.3).add(tangent.multiplyScalar(0.8)).add(inward);
          it.camYaw = Math.atan2(dir.x, dir.z);
          it.my = d < 22 ? 1 : 0.3;
          it.boost = d < 5;
          // a sudden hop when Goku lunges
          if (d < 3 && bub.grounded && n - dodge > 40) {
            it.upPressed = true;
            dodge = n;
          }
          bub.target = null;
          return it;
        },
      };
      const t0 = m.time;
      m.prompt('kkSprint', 'boost', 'Sprint', { when: () => m.time - t0 > 4, until: () => SL.Input.held('boost') });
      m.tickHooks.push(() => {
        if (b.inputLocked) return;
        // adaptation: faster the more Goku moves under the weight
        const moving = Math.hypot(p.vel.x, p.vel.z) > 2 ? 1 : 0.2;
        p.moveScale = Math.min(1.08, p.moveScale + 0.0012 * moving);
        if (b.frame % 10 === 0 && p.moveScale < 0.9 && p.grounded && moving > 0.5) b.vfx.dust(p.pos, 0.6, 3);
        bub.moveScale = Math.max(0.78, 1 - (m.time - t0) * 0.004);
      });
      yield () => p.chest().distanceTo(bub.chest()) < 1.6 && !b.inputLocked;
      m.tickHooks.length = 0;
      m.complete('bubbles');
      m.lock(true);
      bub.controller = scriptedController();
      bub.setState('scripted', { pose: 'idle', expression: 'hurt' });
      p.setState('scripted', { pose: 'g_victory', expression: 'grin' });
      p.moveScale = 1;
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(2.6, 0.5, 2.6)), c, 44);
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('goku', 'Gotcha! Heh... I can move normally now!', 2.2);
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  KK.gregory = {
    id: 'gregory',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, kai = S.kai, bub = S.bubbles;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      p.moveScale = 1;
      bub.untargetable = true;
      bub.setHidden(true);
      place(p, ground(b, new V3(0, 0, 6)), Math.PI);
      p.target = null;
      p.setState('scripted', { pose: 'idle', expression: 'calm' });
      const home = ground(b, new V3(0, 0, -2), 2);
      const greg = new SL.Creature(b, SL.data.creatures.gregory, { pos: home, target: p });
      S.gregory = greg;
      m.shot((t, out) => {
        const c = kai.chest();
        camAt(out, c.clone().add(new V3(2, 0.3, 2.6)), c, 44);
      }, 2.6, { cut: true, blendIn: 0 });
      kai.setState('scripted', { pose: 'kk_point', expression: 'grin' });
      m.say('king_kai', 'Next: hit Gregory with this hammer. He is quicker than he looks!', 2.6);
      yield* m.cine(2.6);
      m.endShot();
      // a hammer in Goku's hand
      const hammer = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), SL.Toon.mat(0x8a6a3a));
      handle.position.y = -0.3;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.2), SL.Toon.mat(0x6a6a72));
      head.position.y = -0.72;
      SL.Toon.addOutline(head, 1);
      hammer.add(handle, head);
      hammer.rotation.x = Math.PI / 2;
      p.model.joints.handR.add(hammer);
      // a hammer, not ki
      m.limits({ blast: false, s1: false, charge: false });
      p.setState('free');
      m.lock(false);
      b.aiLocked = true;
      m.objective('gregory', 'Hit Gregory', { icon: 'fist' });
      b.emit('markers', { list: [{ obj: greg, icon: 'target' }] });
      let hit = false, lastSd = null, attempts = 0;
      greg.sd.dodgeChance = 0.7;
      b.on('meleeSwing', (e) => {
        if (hit || e.fighter !== p || !greg.alive) return;
        if (e.center.distanceTo(greg.pos) < e.r + 0.9) hit = true;
      });
      m.tickHooks.push(() => {
        if (b.inputLocked || hit) return;
        greg.target = p;
        // every swing teaches Goku's body the weight a little more: Gregory's escapes get narrower
        if (p.state === 'attack' && p.sd !== lastSd) {
          lastSd = p.sd;
          attempts++;
          greg.sd.dodgeChance = Math.max(0.15, 0.7 - attempts * 0.05);
        }
      });
      yield () => hit;
      m.tickHooks.length = 0;
      b.emit('markers', { list: [] });
      m.complete('gregory');
      b.vfx.impact(greg.pos.clone().add(new V3(0, 0.6, 0)), 3, 0xffffff);
      b.sfx('punchHeavy', p, { pitch: 1.4 });
      m.lock(true);
      b.slowmo(0.3, 0.25);
      // Gregory tumbles out of the air with a lump on his head
      const knock = greg.pos.clone().sub(p.pos).setY(0).normalize();
      let fallV = 3;
      greg.def = Object.assign({}, greg.def, {
        update(c) {
          fallV -= 20 * SL.TICK;
          c.pos.addScaledVector(knock, 4 * SL.TICK);
          c.pos.y += fallV * SL.TICK;
          const gh = b.stage.heightAt(c.pos.x, c.pos.z) + 0.25;
          if (c.pos.y < gh) {
            c.pos.y = gh;
            fallV = 0;
          }
          c.yaw += 0.3;
        },
      });
      p.model.joints.handR.remove(hammer);
      p.setState('scripted', { pose: 'g_peace', expression: 'grin' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.6).add(new V3(0.5, 0.3, 0)), c, 42);
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('king_kai', 'Ow! ...I mean — well done. Gregory, you okay?', 2.2);
      yield* m.cine(2.2);
      m.endShot();
      greg.dispose();
    },
  };

  KK.kaioken = {
    id: 'kaioken',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, kai = S.kai;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      p.moveScale = 1;
      if (S.bubbles) S.bubbles.setHidden(true);
      place(p, ground(b, new V3(2, 0, 6)), Math.PI);
      p.lockedSlots = { special2: true, ultimate: true, transform: true };
      p.target = null;
      p.setState('scripted', { pose: 'g_resolve', expression: 'angry' });
      kai.setState('scripted', { pose: 'kk_point', expression: 'calm', face: false });
      m.shot((t, out) => {
        const c = kai.chest();
        camAt(out, c.clone().add(new V3(-2.2, 0.3, 2.2)), c, 42);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('king_kai', "Now my technique: the Kaioken. It multiplies your power in an instant...", 3.4);
      yield* m.cine(3.4);
      m.say('king_kai', "...but your body pays for it. Double is the limit. Push past it and you'll tear yourself apart.", 3.8);
      yield* m.cine(3.8);
      m.endShot();
      // boulders only Kaioken can shatter
      // spread across the planet: running between them in Kaioken keeps the strain climbing
      const spots = [[-20, 2], [22, -10], [-6, 32], [28, 24]];
      const boulders = spots.map(([x, z], i) => {
        const pos = ground(b, new V3(x, 0, z), 1.2);
        const pr = b.stage.addProp({ kind: 'boulder', pos, r: 1.8, hp: 3800, id: 'boulder' + i });
        pr.static = true;
        pr.rocky = true;
        pr.requireForm = 'kaioken';
        pr.debrisColor = 0x8a8478;
        pr.explodeColor = 0xd8c8a0;
        const rock = new THREE.Mesh(b.stage.track(new THREE.DodecahedronGeometry(1.8, 0)), SL.Toon.mat(0x9a948a));
        rock.scale.set(1.1, 0.9, 1);
        SL.Toon.addOutline(rock, 1.8);
        pr.group.add(rock);
        return pr;
      });
      m.limits(null);
      // ten times gravity: the Kaioken tears at Goku's body faster here than it would on Earth
      p.strainScale = 1.6;
      m.teach(p, 'transform');
      p.setState('free');
      m.lock(false);
      b.aiLocked = true;
      let broken = 0;
      m.objective('boulders', 'Shatter the boulders', { icon: 'fist', target: boulders.length });
      const safe = m.objective('noOverload', 'Never overload', { icon: 'transform', optional: true });
      b.emit('markers', { list: boulders.map((pr) => ({ obj: pr, icon: 'target' })) });
      b.on('propDestroyed', (e) => {
        if (!boulders.includes(e.prop)) return;
        broken++;
        m.progress('boulders', broken);
        b.emit('markers', { list: boulders.filter((pr) => pr.alive).map((pr) => ({ obj: pr, icon: 'target' })) });
      });
      b.on('overload', (e) => {
        if (e.fighter !== p) return;
        m.failObjective('noOverload');
        m.say('king_kai', 'I warned you! Your body can only take so much!', 2.4);
      });
      let warned = false;
      m.tickHooks.push(() => {
        if (!warned && p.form.id === 'kaioken' && p.strain > 72) {
          warned = true;
          m.say('king_kai', 'That is enough! Let it go before it tears you apart!', 2.4);
        }
        if (p.strain < 30) warned = false;
      });
      let resisted = false;
      b.on('propResisted', (e) => {
        if (e.owner === p) resisted = true;
      });
      m.prompt('kaiokenPrompt', 'transform', 'Kaioken', { required: true, always: true, when: () => resisted && p.form.id === 'base' && p.strain < 60, until: () => p.form.id === 'kaioken' });
      m.prompt('powerDownPrompt', 'revert', 'Power down', { required: true, always: true, when: () => p.form.id === 'kaioken' && p.strain > 70, until: () => p.form.id !== 'kaioken' });
      yield () => broken >= boulders.length;
      m.tickHooks.length = 0;
      if (!safe.failed) m.complete('noOverload');
      b.emit('markers', { list: [] });
      yield 1;
    },
  };

  KK.wish = {
    id: 'wish',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, kai = S.kai;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      kai.setState('scripted', { pose: 'kk_antennae', expression: 'hurt' });
      m.shot((t, out) => {
        const c = kai.chest();
        camAt(out, c.clone().add(new V3(1.8, 0.4, 2.4)), c.clone().add(new V3(0, 0.3, 0)), 40);
      }, 3.2, { cut: true, blendIn: 0 });
      SL.Audio.play('scouter');
      m.say('king_kai', "Goku! The Saiyans have landed on Earth — and your friends just used the Dragon Balls to wish you back!", 3.4);
      yield* m.cine(3.4);
      if (p.form.id !== 'base') p.applyForm(0);
      p.strain = 0;
      p.setState('scripted', { pose: 'g_resolve', expression: 'angry' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.2).add(new V3(0.6, 0.1, 0)), c, 40);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('goku', 'Thanks, King Kai! Hang on, everybody... I’m coming!', 2.4);
      yield* m.cine(2.4);
      // Goku tears off toward Snake Way wrapped in red
      p.aura.setStyle(p.def.forms[1].aura);
      p.aura.target = 1;
      p.sd.aura = 1;
      const dir = new V3(0, 0, 1);
      let k = 0;
      m.tickHooks.push(() => {
        k++;
        p.pos.addScaledVector(dir, 0.9);
        p.prevPos.copy(p.pos);
        p.pos.y = b.stage.heightAt(p.pos.x, p.pos.z) + Math.min(6, k * 0.08);
        if (k % 2 === 0) b.vfx.trail(p.chest(), 0xff4a3a, 0.8, 0.5);
      });
      p.setState('scripted', { pose: 'dash', expression: 'angry' });
      b.sfx('kaiokenBoom', p);
      m.shot((t, out) => camAt(out, ground(b, new V3(6, 0, 20), 3), p.chest(), 54), 2, { cut: true, blendIn: 0 });
      yield* m.cine(1.8);
      m.tickHooks.length = 0;
      m.fade('black', 1);
      yield 1.2;
      m.endShot();
      m.title('CHAPTER 2 COMPLETE', 'THE SAIYANS ARRIVE', 'Next: Chapter 3 · Nappa and Vegeta', 3.8);
      yield* m.cine(4);
    },
  };

  const kingKai = {
    id: 'saiyan_kingkai',
    canon: true,
    chapter: 'CHAPTER 2 · SAIYAN SAGA',
    title: 'Ten Times Gravity',
    subtitle: "Other World · King Kai's planet",
    character: 'goku',
    stage: 'kingkai',
    parTime: 300,
    qteLabel: 'Adaptation',
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'At the end of Snake Way waits a tiny planet, crushing gravity and a teacher with a technique that could get Goku killed.',
    rewards: ['Kaioken (story: up to x2)', "King Kai's Planet stage"],
    setup: kkSetup,
    phases: [KK.arrival, KK.bubbles, KK.gregory, KK.kaioken, KK.wish],
  };

  SL.data.missions[kingKai.id] = kingKai;
})();
