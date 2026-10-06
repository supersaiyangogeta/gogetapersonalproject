/*
 * CHAPTER 5 — ANDROID SAGA (fourth mission)
 * Mission "The Laboratory Door" (canon, played as Future Trunks).
 *
 * Gero runs for the mountain while the fight on the road is still going. The
 * mission is a race the story says you lose, and then a race against the second
 * capsule that you can still win something from: the capsules are objects in
 * the world with health, and every one you break is one fewer problem later.
 *
 * Phases: CHASE (checkpoint: fly the ridge line to the laboratory before he is
 * inside) → DOOR (scene `gero_at_the_door`) → CAPSULES (checkpoint: wreck what
 * you can reach before 17 stops you) → WAKE (scenes `seventeen_wakes` and
 * `gero_ends`) → AFTER (scene `the_pair_leaves`).
 *
 * There is no boss fight here on purpose. The worst thing that happens in this
 * chapter is a switch being thrown, and the player is in the room for it.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -8);
  const LAB_AT = new V3(-64, 0, -82);
  const CHASE_SECONDS = 10; // he has a head start: this is a sprint, not a journey
  const CAPSULE_SECONDS = 35;

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
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
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
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** A capsule: a prop with health that the player can actually break. */
  function capsule(b, id, at) {
    const pr = b.stage.addProp({ kind: 'pod', id, pos: ground(b, at, 1.3), r: 1.5, hp: 4200 });
    if (pr.glow && pr.glow.material) pr.glow.material.color.setHex(0x8ad4ff);
    return pr;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 30);
    clearArea(b, LAB_AT, 24);
    const trunks = b.spawn({ charId: 'future_trunks', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 6))), startKi: 80 });
    trunks.lockedForms = {};
    trunks.cannotDie = true; // nothing in this mission is trying to kill him
    const ssj = trunks.def.forms.findIndex((f) => f.id === 'ssj');
    if (ssj > 0) trunks.applyForm(ssj);
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(6, 0, 9))), startKi: 40 });
    krillin.controller = scripted();
    krillin.untargetable = true;
    krillin.cannotDie = true;
    const gero = b.spawn({ charId: 'android_20', team: 1, pos: ground(b, LAB_AT.clone().add(new V3(0, 0, -4))), startKi: 100, tags: { boss: true } });
    const a17 = b.spawn({ charId: 'android_17', team: 1, pos: ground(b, LAB_AT.clone().add(new V3(-3, 0, -7))), startKi: 140, tags: { boss: true, priority: true } });
    const a18 = b.spawn({ charId: 'android_18', team: 1, pos: ground(b, LAB_AT.clone().add(new V3(3, 0, -7))), startKi: 140, tags: { boss: true } });
    for (const f of [gero, a17, a18]) {
      f.controller = scripted();
      f.cannotDie = true;
      f.untargetable = true;
    }
    for (const f of [a17, a18]) f.setHidden(true);
    b.story = { trunks, krillin, gero, a17, a18, capsules: [] };
  }

  const P = {};

  /** The ridge line, at speed, with a clock the story has already decided. */
  P.chase = {
    id: 'chase',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(t, { force: true });
      t.hp = t.hpMax;
      t.ki = Math.max(t.ki, 70);
      t.cannotDie = true;
      t.target = null;
      t.setState('free');
      place(t, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      const lab = b.stage.addProp({ kind: 'pod', id: 'labDoor', pos: ground(b, LAB_AT, 2.6), r: 5, hp: 999999 });
      lab.invulnerable = true;
      if (lab.glow && lab.glow.material) lab.glow.material.color.setHex(0xffd070);
      m.onDispose(() => {
        lab.alive = false;
        if (lab.group) lab.group.visible = false;
      });
      b.emit('markers', { list: [{ obj: lab, icon: 'run' }] });
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      const flat = (a, c) => Math.hypot(a.x - c.x, a.z - c.z);
      const start = Math.round(flat(t.pos, lab.pos));
      m.objective('reach', 'Get to the laboratory', { icon: 'run', target: 100 });
      m.objective('fast', 'Inside ' + CHASE_SECONDS + ' seconds', { icon: 'clock', optional: true, target: CHASE_SECONDS });
      m.prompt('flyFast', 'up', 'Fly. He has a head start and a door', { required: true, always: true, when: () => t.grounded, until: () => !t.grounded });
      let t2 = 0, arrived = false;
      const hook = () => {
        if (b.inputLocked) return;
        t2 += 1 / 60;
        const d = flat(t.pos, lab.pos);
        m.progress('reach', Math.max(0, Math.min(100, Math.round((1 - d / Math.max(1, start)) * 100))));
        m.progress('fast', Math.min(CHASE_SECONDS, Math.floor(t2)));
        if (d < 9) arrived = true;
      };
      m.tickHooks.push(hook);
      yield () => arrived || t2 >= CHASE_SECONDS + 40;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      b.emit('markers', { list: [] });
      m.complete('reach');
      if (t2 <= CHASE_SECONDS) m.complete('fast');
      else m.failObjective('fast');
      m.flags.chaseSeconds = Math.round(t2);
      m.flags.reachedLab = arrived;
      lab.alive = false;
      if (lab.group) lab.group.visible = false;
      place(t, ground(b, LAB_AT.clone().add(new V3(0, 0, 8))), Math.PI);
      m.qteParts.push(U.clamp01(t.hpFrac));
      yield 0.4;
    },
  };

  P.door = {
    id: 'door',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.trunks, S.krillin, S.gero]) f.controller = scripted();
      S.gero.setHidden(false);
      place(S.gero, ground(b, LAB_AT.clone().add(new V3(0, 0, -3))), 0);
      place(S.krillin, ground(b, LAB_AT.clone().add(new V3(5, 0, 10))), Math.PI);
      faceTo(S.trunks, S.gero.pos);
      faceTo(S.gero, S.trunks.pos);
      yield* SL.Cinema.play(m, 'gero_at_the_door');
    },
  };

  /**
   * The capsules. Every one broken is one fewer android later, and the phase
   * ends when the doctor reaches the switch — which he does, because the story
   * says so. What the player controls is how much is left when he gets there.
   */
  P.capsules = {
    id: 'capsules',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(t, { force: true });
      t.hp = Math.max(t.hp, Math.round(t.hpMax * 0.8));
      t.ki = Math.max(t.ki, 70);
      t.cannotDie = true;
      t.target = null;
      t.setState('free');
      place(t, ground(b, LAB_AT.clone().add(new V3(0, 0, 7))), Math.PI);
      S.gero.setHidden(false);
      S.gero.untargetable = true;
      S.gero.controller = scripted();
      S.gero.setState('scripted', { pose: 'a19_smug', expression: 'smirk' });
      // three capsules in the room: 16, 17 and 18
      const spots = [new V3(-5, 0, -6), new V3(0, 0, -8), new V3(5, 0, -6)];
      S.capsules = spots.map((off, i) => capsule(b, 'capsule' + (16 + i), LAB_AT.clone().add(off)));
      m.onDispose(() => {
        for (const c of S.capsules) {
          c.alive = false;
          if (c.group) c.group.visible = false;
        }
      });
      b.emit('markers', { list: S.capsules.map((c) => ({ obj: c, icon: 'fist' })) });
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 5);
      m.objective('break', 'Break what you can reach', { icon: 'fist', target: S.capsules.length });
      m.objective('all', 'Break all three before he reaches the switch', { icon: 'guard', optional: true });
      let broken = 0;
      b.on('propDestroyed', (e) => {
        if (!e.prop || String(e.prop.id).indexOf('capsule') !== 0) return;
        broken++;
        m.progress('break', broken);
      });
      let t2 = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t2 += 1 / 60;
      };
      m.tickHooks.push(hook);
      yield () => broken >= S.capsules.length || t2 >= CAPSULE_SECONDS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      b.emit('markers', { list: [] });
      m.complete('break');
      if (broken >= S.capsules.length) m.complete('all');
      else m.failObjective('all');
      m.flags.capsulesBroken = broken;
      m.flags.capsuleSeconds = Math.round(t2);
      m.qteParts.push(U.clamp01(t.hpFrac));
      yield 0.4;
    },
  };

  P.wake = {
    id: 'wake',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.trunks, S.gero, S.a17, S.a18]) f.controller = scripted();
      place(S.a17, ground(b, LAB_AT.clone().add(new V3(-2.5, 0, -6))), Math.PI);
      place(S.a18, ground(b, LAB_AT.clone().add(new V3(2.5, 0, -6))), Math.PI);
      faceTo(S.trunks, S.a17.pos);
      yield* SL.Cinema.play(m, 'seventeen_wakes');
      yield* SL.Cinema.play(m, 'gero_ends');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.trunks, S.krillin, S.a17, S.a18]) f.controller = scripted();
      faceTo(S.trunks, S.a17.pos);
      yield* SL.Cinema.play(m, 'the_pair_leaves');
      m.lock(true);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.flags.labDone = true;
      m.title('CHAPTER 5 · ANDROID SAGA', 'THE LABORATORY DOOR', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'android_lab',
    canon: true,
    chapter: 'CHAPTER 5 · ANDROID SAGA',
    title: 'The Laboratory Door',
    subtitle: 'Earth · Age 767 · a switch nobody should reach',
    character: 'future_trunks',
    stage: 'coast',
    parTime: 240,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'A race the story has already decided, and a room full of capsules you can still do something about.',
    rewards: ['Chapter 5 continues'],
    setup,
    phases: [P.chase, P.door, P.capsules, P.wake, P.after],
  };

  SL.data.missions[def.id] = def;
})();
