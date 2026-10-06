/*
 * CHAPTER 4 — NAMEK SAGA (fifteenth mission of the Namek foundation, in development)
 * Mission "The Prince's Last Words" (canon, played as Goku).
 *
 * Canon beats: Frieza has been playing with everybody all day, and the person he
 * decides to stop playing with is Vegeta. Goku gets between them — and it does
 * not matter, because the Death Beam does not care what you put in front of it.
 * What is left is the only conversation those two ever have honestly, and then a
 * man digging a grave on a planet that is not his.
 *
 * Phases: ARRIVAL (scene `goku_namek_arrival`: the ship lands out at the edge of
 * the field, he crosses to the prince) → CONFRONT (Frieza over the prince, Goku
 * between them) → BEAM (scene `frieza_kills_vegeta`: the prince starts telling
 * him about Planet Vegeta, Frieza answers with the Death Beam) → WORDS (scene
 * `vegeta_final_words`) → BURIAL (scene `goku_buries_vegeta`) → AFTER (scene
 * `goku_declares_frieza`, the owner's speech). Goku does not fight Frieza here:
 * canon, and the owner's order — the fight is the missions that follow.
 *
 * The two quiet scenes are data (src/data/scenes/namek_vegeta_end.js) run
 * through SL.Cinema, so both are skip-safe: skipping still buries him.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);

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
  function place(f, pos, yaw) {
    f.setPosition(pos);
    if (yaw !== undefined) f.yaw = yaw;
    f.prevYaw = f.yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** The attack pod he came down in: a prop, built once and left in its crater. */
  function landingPod() {
    const g = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.15, 22, 16), SL.Toon.mat(0xd9d4cc));
    SL.Toon.addOutline(shell, 1.5);
    shell.position.y = 0.9;
    g.add(shell);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 8, 28), SL.Toon.mat(0x5a5a66));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.6;
    g.add(ring);
    for (let i = 0; i < 3; i++) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 8), SL.Toon.mat(0x5a5a66));
      const a = (i / 3) * Math.PI * 2;
      foot.position.set(Math.cos(a) * 0.8, 0.25, Math.sin(a) * 0.8);
      g.add(foot);
    }
    return g;
  }

  /** A mound of turned earth and a piece of rock stood on end. Nothing else. */
  function grave() {
    const g = new THREE.Group();
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), SL.Toon.mat(0x6a5a44));
    mound.scale.set(1, 0.35, 0.8);
    g.add(mound);
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.8, 0.14), SL.Toon.mat(0x8a8f86));
    SL.Toon.addOutline(stone, 1.4);
    stone.position.set(0, 0.42, -0.62);
    stone.rotation.z = 0.06;
    g.add(stone);
    return g;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 40);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 9))), startKi: 90 });
    // he is saving the Kaioken for the fight that follows this one: here he stands in front of
    // the prince in his base form, which is exactly as much as that is worth against Frieza
    goku.lockedForms = { kaioken: true };
    goku.lockedSlots = { transform: true };
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(5, 0, 3))), startKi: 10 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    vegeta.controller = scripted();
    vegeta.untargetable = true;
    vegeta.cannotDie = true;
    vegeta.hp = Math.round(vegeta.hpMax * 0.08);
    // the two who have watched all of it from the edge of the field
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 14))), startKi: 30 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-8, 0, 15))), startKi: 30 });
    for (const f of [krillin, gohan]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.15);
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -8))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    // the grave is built now and hidden until it is dug
    const graveAt = ground(b, FIELD.clone().add(new V3(11, 0, 12)));
    const mound = grave();
    mound.position.copy(graveAt);
    mound.visible = false;
    b.stage.scene.add(mound);
    if (b.mission) b.mission.onDispose(() => b.stage.scene.remove(mound));
    // he is not on the field yet: the mission opens with him landing
    goku.setHidden(true);
    goku.untargetable = true;
    goku.controller = scripted();
    // it lands well out at the edge of the field and stays there: the ground the prince dies on
    // belongs to Goku, Vegeta and Frieza, not to a spaceship (owner, round 4)
    const podAt = ground(b, FIELD.clone().add(new V3(38, 0, 30)));
    const pod = landingPod();
    pod.position.copy(podAt);
    b.stage.scene.add(pod);
    if (b.mission) b.mission.onDispose(() => b.stage.scene.remove(pod));
    faceTo(goku, frieza.pos);
    faceTo(frieza, vegeta.pos);
    b.story = { goku, vegeta, frieza, krillin, gohan, pod, podAt, grave: { pos: graveAt, object: mound } };
  }

  const P = {};

  /*
   * THE LANDING. Canon order, and the owner's: Goku arrives while the prince is still alive,
   * and everything that follows in this mission happens in front of him.
   */
  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.flags.arrivalPoint = S.podAt.clone();
      place(S.goku, S.podAt.clone().add(new V3(0, 0, 2)), Math.PI);
      faceTo(S.goku, S.frieza.pos);
      for (const f of [S.krillin, S.gohan]) faceTo(f, S.frieza.pos);
      S.vegeta.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      yield* SL.Cinema.play(m, 'goku_namek_arrival');
    },
  };

  P.confront = {
    id: 'confront',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, fz = S.frieza;
      m.lock(true);
      // whatever route the player took here (a checkpoint, a retry), the three of them are staged
      g.setHidden(false);
      g.untargetable = true;
      place(g, ground(b, v.pos.clone().add(new V3(-2, 0, 2.4))));
      place(fz, ground(b, v.pos.clone().add(new V3(-1.2, 0, -4))));
      faceTo(fz, v.pos);
      faceTo(g, fz.pos);
      v.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      g.setState('scripted', { pose: 'idle', expression: 'grit' });
      fz.setState('scripted', { pose: 'idle', expression: 'calm' });
      b.stage.setMood(0.3, 0x241c30, 1.6);
      // from the ground the prince is lying on, up at the man standing over him
      m.shot((t, out) => {
        const sh = SL.Cinema.overShoulder(v, fz, { fov: 38, back: U.lerp(1.6, 1.3, t), side: 0.8, height: 0.3, lookUp: 0.7 });
        camAt(out, sh.pos, sh.look, sh.fov);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('frieza', 'You have been very loud all day, prince. Lie still.', 3);
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const head = g.chest().add(new V3(0, 0.35, 0));
        camAt(out, head.clone().addScaledVector(g.forward, U.lerp(1.5, 1.2, t)).add(new V3(-0.35, -0.05, 0)), head, U.lerp(38, 34, t));
      }, 3, { cut: true, blendIn: 0 });
      m.say('goku', 'You are not touching him.', 2.4, { style: 'quiet' });
      yield* m.cine(3);
      b.stage.clearMood(1);
      m.endShot();
    },
  };

  P.beam = {
    id: 'beam',
    checkpoint: true, // the prince's death: a restart comes back to it, not to the landing
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      fz.infiniteHp = false;
      // the scene stages it: the prince speaks, Frieza answers with the beam, and it is seen
      // to cross the gap, hit him, throw him and drop him — with Goku's face on the end of it
      yield* SL.Cinema.play(m, 'frieza_kills_vegeta');
      m.endShot();
    },
  };

  P.words = {
    id: 'words',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.goku, S.frieza]) f.controller = scripted();
      // Frieza steps back to the edge of the frame and lets it happen
      place(S.frieza, ground(b, FIELD.clone().add(new V3(-9, 0, -12))), 0);
      faceTo(S.frieza, S.vegeta.pos);
      place(S.goku, ground(b, S.vegeta.pos.clone().add(new V3(2.2, 0, 1.8))));
      faceTo(S.goku, S.vegeta.pos);
      yield* SL.Cinema.play(m, 'vegeta_final_words');
    },
  };

  P.burial = {
    id: 'burial',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      S.goku.setHidden(false);
      // Frieza is gone from this scene entirely; it is just the two of them
      S.frieza.setHidden(true);
      S.frieza.untargetable = true;
      S.grave.object.visible = true;
      place(S.goku, ground(b, S.grave.pos.clone().add(new V3(1.6, 0, 1.4))));
      faceTo(S.goku, S.grave.pos);
      if (!S.vegeta.hidden) place(S.vegeta, ground(b, S.grave.pos.clone().add(new V3(-1.2, 0, 0.6))));
      yield* SL.Cinema.play(m, 'goku_buries_vegeta');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      // what he says to him over the grave (the owner's speech, performed rather than printed)
      yield* SL.Cinema.play(m, 'goku_declares_frieza');
      m.lock(true);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', "THE PRINCE'S LAST WORDS", m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_vegeta_end',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: "The Prince's Last Words",
    subtitle: 'Namek · Goku lands, and the prince runs out of time',
    character: 'goku',
    stage: 'namek',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'You can hold him off. You cannot hold off a beam he fires past you. What is left afterwards is quiet, and it is the point.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.arrival, P.confront, P.beam, P.words, P.burial, P.after],
  };

  SL.data.missions[def.id] = def;
})();
