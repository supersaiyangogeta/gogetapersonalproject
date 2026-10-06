/*
 * CHAPTER 12 — BUU SAGA: THE ULTIMATE
 * Mission "The Z Sword" (canon; played as Gohan). On the Sacred World of the Kai, Gohan pulls out
 * the sword the Kais kept in a rock, learns to swing it, breaks it on the hardest metal there is —
 * and lets out the Kai who was sealed inside it, who does something much better with him.
 *
 *   ARRIVE   (scene)      the Sacred World of the Kai; the Supreme Kai, Kibito, the Z Sword in its rock
 *   PULL     (checkpoint) hold Charge to heave it out of the rock
 *   SWING    (play)       the sword is heavier than anything: swing it until it stops dragging him
 *                         round (each swing faster); then the Katchin cube, and "cut it" (a cue)
 *   BREAK    (scene)      the sword snaps; smoke; an old, old Kai: "Seventy-five million years!"
 *   RITUAL   (scene)      five hours of a ritual dance round him; twenty hours of sitting; the sky
 *                         going round overhead; the Kais bored out of their minds
 *   STILL    (checkpoint) the unlocking: be still — any button spills it — while it comes up
 *   ULTIMATE (scene)      no gold, no lightning: a close white aura, the grass flattened in a ring,
 *                         black hair held down, the Supreme Kai speechless; the Katchin cube, with
 *                         one punch (a cue)
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // the knobs (tests read them)
  const ZS = {
    pullSeconds: 4.5,
    swings: 8, // swings before the sword is his (each one a press of Light, each one faster)
    stillSeconds: 7, // the unlocking: this long without pressing anything
    spill: 0.22, // what one press costs the unlocking (fraction of the meter)
  };
  const ROCK = new V3(0, 0, -6); // the sword in its rock
  const CUBE = new V3(0, 0, 9); // the Katchin (away from the Kais watching)
  const Z_SWORD = { id: 'zsword', shape: 'broadsword', joint: 'handR', pos: [0, -0.06, 0.04], rot: [Math.PI / 2, 0, 0], length: 1.25, blade: 0xe6ecf4, guard: 0x2a4aa0, grip: 0x3a2a60, pommel: 0xd8b04a };

  /* ------------------------------------------------ the set: the rock with the sword, the cube */
  function buildSet(b) {
    const T = SL.Toon;
    const geos = [], mats = [];
    const mesh = (geo, color, parent, basic) => {
      geos.push(geo);
      const mat = basic ? new THREE.MeshBasicMaterial({ color }) : T.makeMat(color, {});
      mats.push(mat);
      const o = new THREE.Mesh(geo, mat);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    // the rock: a grey mound with the sword standing in it
    const rock = new THREE.Group();
    const mound = mesh(new THREE.DodecahedronGeometry(1.6, 1), 0x8a8478, rock);
    mound.scale.set(0.8, 0.45, 0.7);
    mound.position.y = 0.35;
    T.addOutline(mound, 1.5);
    const sword = new THREE.Group();
    mesh(new THREE.BoxGeometry(0.1, 1.5, 0.025), 0xe6ecf4, sword).position.y = 0.75;
    mesh(new THREE.BoxGeometry(0.34, 0.05, 0.08), 0x2a4aa0, sword).position.y = 1.52;
    mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 8), 0x3a2a60, sword).position.y = 1.72;
    mesh(new THREE.SphereGeometry(0.05, 8, 6), 0xd8b04a, sword).position.y = 1.92;
    sword.position.y = -0.37; // the hilt just above the rock, where two hands can reach it
    rock.add(sword);
    rock.position.copy(K.ground(b, ROCK));
    b.scene.add(rock);
    // the Katchin: a cube of the hardest metal in the universe
    const cube = new THREE.Group();
    const c = mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), 0x5a5e6a, cube);
    c.position.y = 1.1;
    T.addOutline(c, 1.6);
    cube.position.copy(K.ground(b, CUBE));
    cube.rotation.y = 0.4;
    cube.visible = false;
    b.scene.add(cube);
    // half a sword, flying
    const shard = new THREE.Group();
    mesh(new THREE.BoxGeometry(0.1, 0.8, 0.025), 0xe6ecf4, shard);
    shard.visible = false;
    b.scene.add(shard);
    const obs = { shape: 'cyl', x: ROCK.x, z: ROCK.z, y: rock.position.y, r: 1, h: 1.2, top: rock.position.y + 1.2, hp: 1e9, maxHp: 1e9, alive: true, group: null, segs: [], color: 0x8a8478 };
    b.stage.obstacles.push(obs);
    return {
      rock,
      sword,
      cube,
      shard,
      dispose() {
        for (const g of [rock, cube, shard]) b.scene.remove(g);
        for (const g of geos) g.dispose();
        for (const m of mats) m.dispose();
      },
    };
  }

  /* ------------------------------------------------ setup */
  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const set = buildSet(b);
    // Gohan in his gi; the Ultimate body (the Kais' clothes, the hair held down) waits hidden for
    // the time-lapse, where the story changes him
    const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: at(0, -3.2), startKi: 100 });
    const gohanU = b.spawn({ charId: 'adult_gohan', team: 0, pos: at(0, -3.2), startKi: 100, wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } });
    const shin = b.spawn({ charId: 'supreme_kai', team: 0, pos: at(-3, 1) });
    const kibito = b.spawn({ charId: 'kibito', team: 0, pos: at(3.2, 1.4) });
    const elder = b.spawn({ charId: 'elder_kai', team: 0, pos: at(0.8, -1.6) });
    for (const f of [shin, kibito, elder, gohanU]) K.watcher(f, 'idle', 'calm');
    elder.setHidden(true);
    gohanU.setHidden(true);
    for (const f of [gohan, gohanU]) f.lockedForms = { ssj: true, ssj2: true, ultimate: true };
    b.story = { gohan, gohanU, shin, kibito, elder, set, owned: false };
  }

  function own(m) {
    const S = m.battle.story;
    if (S.owned) return;
    S.owned = true;
    m.onDispose(S.set.dispose);
  }

  /** The Gohan being played now (the story changes his clothes during the ritual). */
  const hero = (b) => (b.story.changed ? b.story.gohanU : b.story.gohan);

  /** From the time-lapse on: the Ultimate body is Gohan (the Kais' clothes, the hair held down). */
  function change(b) {
    const S = b.story;
    if (S.changed) return;
    S.changed = true;
    const a = S.gohan, u = S.gohanU;
    K.place(u, a.pos.clone(), a.yaw);
    u.setHidden(false);
    u.untargetable = u.intangible = false;
    if (b.player === a) b.switchPlayer(u, { force: true });
    K.watcher(a, 'idle', 'calm');
    a.setHidden(true);
    if (a.model.props.zsword) a.model.setPropVisible('zsword', false);
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle;
      own(m);
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'zs_arrive');
    },
  };

  /** Heave it out of the rock (hold Charge). */
  P.pull = {
    id: 'pull',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan;
      own(m);
      m.lock(true);
      m.clearObjectives();
      S.set.sword.visible = true;
      if (g.model.props.zsword) g.model.setPropVisible('zsword', false);
      K.place(g, K.ground(b, ROCK.clone().add(new V3(0, 0, 1.3))));
      K.faceTo(g, ROCK);
      m.objective('pull', 'Pull the Z Sword out of the rock', { icon: 'transform' });
      g.setState('scripted', { pose: 'ag_pull', expression: 'grit' });
      m.shot((t, out) => {
        const c = g.chest();
        K.camAt(out, c.clone().add(new V3(3, 0.5, 1.2)), c.clone().add(new V3(0, -0.1, -0.7)), 44);
      }, 60, { cut: true, blendIn: 0 });
      // only Charge answers
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.charge;
      m.limits(lim);
      b.inputLocked = false;
      b.aiLocked = true;
      let power = 0;
      m.prompt('zsPull', 'charge', 'Hold — pull!', { required: true, until: () => power >= 1, always: true });
      const hook = () => {
        const holding = !!(g.intent && g.intent.charge);
        power = U.clamp01(power + (holding ? 1 / (ZS.pullSeconds * 60) : -0.3 / 60));
        if (g.state !== 'scripted' || (g.sd && g.sd.pose !== 'ag_pull')) g.setState('scripted', { pose: 'ag_pull', expression: 'grit' });
        if (holding && b.frame % 4 === 0) {
          b.vfx.debrisBurst(S.set.rock.position.clone().add(new V3(0, 0.9, 0)), 2, 0x8a8478, 3 + power * 4, 0.12);
          b.camera.addTrauma(0.02 + power * 0.04);
        }
        S.set.sword.position.y = -0.37 + power * 0.6;
        b.emit('struggle', { active: true, progress: 1 - power, rate: 0, label: 'THE Z SWORD', action: 'charge' });
      };
      m.tickHooks.push(hook);
      b.skipRequested = false;
      yield () => power >= 1;
      K.unhook(m, hook);
      b.emit('struggle', { active: false });
      m.limits(null);
      m.lock(true);
      m.endShot();
      m.complete('pull');
      S.set.sword.visible = false;
      if (!g.model.props.zsword) g.model.addProp(Z_SWORD);
      g.model.setPropVisible('zsword', true);
      b.sfx('swordDraw', g, { pitch: 0.7, vol: 1.2 });
      b.vfx.debrisBurst(S.set.rock.position.clone().add(new V3(0, 1, 0)), 12, 0x8a8478, 8, 0.2);
      yield* SL.Cinema.play(m, 'zs_pulled');
    },
  };

  /** Learn to swing it (each swing a press of Light, each one faster); then the cube. */
  P.swing = {
    id: 'swing',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan;
      own(m);
      m.lock(true);
      m.clearObjectives();
      if (!g.model.props.zsword) g.model.addProp(Z_SWORD);
      g.model.setPropVisible('zsword', true);
      S.set.sword.visible = false;
      K.place(g, K.ground(b, new V3(0, 0, 2)));
      K.faceTo(g, new V3(0, 0, 10));
      m.objective('swing', 'Swing the Z Sword until it is yours', { icon: 'fist', target: ZS.swings });
      m.shot((t, out) => {
        const c = g.chest();
        K.camAt(out, c.clone().add(new V3(3.4, 0.4, 3.2)), c.clone().add(new V3(0, 0.2, 1)), 46);
      }, 120, { cut: true, blendIn: 0 });
      let swings = 0;
      for (let i = 0; i < ZS.swings; i++) {
        yield* m.cue('light', i === 0 ? 'Swing it' : 'Again');
        const k = (i + 1) / ZS.swings;
        // heavy at first: a long wind-up that drags him round; by the end it is a blur
        g.setState('scripted', { pose: 'ag_swordW', expression: 'grit', speed: 5 + k * 14 });
        yield* m.cine(0.55 - k * 0.38);
        g.setState('scripted', { pose: 'ag_sword', expression: 'shout', speed: 14 + k * 16 });
        b.sfx('swordSlash', g, { pitch: 0.6 + k * 0.5, vol: 0.9 });
        b.cameraTraumaAt(g.pos, 0.25 - k * 0.15);
        if (b.stage.hasGround && k < 0.5) b.vfx.dust(g.pos.clone().addScaledVector(g.forward, 1.4), 1.2, 6);
        swings++;
        m.progress('swing', swings);
        yield* m.cine(0.5 - k * 0.3);
      }
      m.endShot();
      m.complete('swing');
      m.flags.swings = swings;
      m.lock(true);
      yield* SL.Cinema.play(m, 'zs_cube');
      yield* SL.Cinema.play(m, 'zs_break');
      yield* SL.Cinema.play(m, 'zs_ritual');
    },
  };

  /** The unlocking: be still. */
  P.still = {
    id: 'still',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      own(m);
      m.lock(true);
      m.clearObjectives();
      change(b);
      const g = hero(b), elder = S.elder;
      elder.setHidden(false);
      K.place(g, K.ground(b, new V3(0, 0, 0)));
      K.place(elder, K.ground(b, new V3(0, 0, 1.6)));
      K.faceTo(elder, g.pos);
      K.faceTo(g, elder.pos);
      g.setState('scripted', { pose: 'ag_meditate', expression: 'calm' });
      elder.setState('scripted', { pose: 'ek_palms', expression: 'calm' });
      b.stage.setMood(0.3, 0x1a1030, 1);
      m.objective('still', 'Be still — let it come out', { icon: 'clock' });
      m.shot((t, out) => {
        const c = g.chest();
        K.camAt(out, c.clone().add(new V3(-2.2, 0.6, 2.8)), c.clone().add(new V3(0, -0.1, 0)), 44);
      }, 60, { cut: true, blendIn: 0 });
      // nothing answers here: the input is read raw, and any button spills it
      m.limits(Object.assign({}, SL.Mission.ALL_OFF));
      b.inputLocked = false;
      b.aiLocked = true;
      let level = 0, spills = 0, was = false;
      const busy = () => Object.keys(SL.Settings.ACTION_LABELS).some((a) => SL.Input.held(a));
      m.prompt('zsStill', 'charge', 'Be still — press nothing', { required: true, until: () => level >= 1, always: true });
      const hook = () => {
        const now = busy();
        if (now && !was) {
          spills++;
          level = Math.max(0, level - ZS.spill);
          b.sfx('uiError', null, { vol: 0.4 });
          b.camera.addTrauma(0.15);
        }
        was = now;
        if (!now) level = U.clamp01(level + 1 / (ZS.stillSeconds * 60));
        if (g.state !== 'scripted') g.setState('scripted', { pose: 'ag_meditate', expression: 'calm' });
        if (b.frame % 3 === 0) b.vfx.streamInward(g.chest(), 1.4 + level * 2.5, 0xf2f6ff, 2, 0.12, 0.5);
        b.emit('struggle', { active: true, progress: 1 - level, rate: 0, label: 'THE UNLOCKING', action: 'charge' });
      };
      m.tickHooks.push(hook);
      b.skipRequested = false;
      yield () => level >= 1;
      K.unhook(m, hook);
      b.emit('struggle', { active: false });
      m.limits(null);
      m.lock(true);
      m.endShot();
      m.complete('still');
      m.flags.stillSpills = spills;
      m.qteParts.push(spills ? Math.max(0.3, 1 - spills * 0.2) : 1);
      yield* SL.Cinema.play(m, 'zs_ultimate');
      if (g.lockedForms) delete g.lockedForms.ultimate;
      m.teach(g, 'form:ultimate');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'THE Z SWORD', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_zsword',
    canon: true,
    chapter: 'CHAPTER 12 · BUU SAGA',
    title: 'The Z Sword',
    subtitle: 'The Sacred World of the Kai · Age 774',
    character: 'adult_gohan',
    stage: 'kai_world',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'A sword in a rock that only the strongest can pull out. Gohan pulls it out. It is not the sword that matters.',
    rewards: ['Gohan: the Ultimate', 'Ultimate Gohan in Free Battle'],
    setup,
    phases: [P.arrive, P.pull, P.swing, P.still, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.zSword = { ZS, ROCK, CUBE, Z_SWORD, hero, change };
})();
