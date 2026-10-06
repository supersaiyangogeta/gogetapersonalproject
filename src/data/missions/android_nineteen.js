/*
 * CHAPTER 5 — ANDROID SAGA (third mission)
 * Mission "Ten in the Morning" (canon, played as Goku, then as Vegeta).
 *
 * Age 767, on the date the boy gave them. Androids 19 and 20 are exactly where
 * he said they would be, and the fight teaches its own rule the hard way:
 * **ki does not work on them**. Every beam and blast is absorbed, heals them,
 * and costs the attacker the ki they spent. Hands and throws still land.
 *
 * Phases: ARRIVE (scene `androids_arrive`) → GOKU (checkpoint: Super Saiyan
 * Goku against 19, with the absorption rule taught by a prompt and by the
 * android's health bar going the wrong way) → VIRUS (scene `goku_virus`: the
 * fight stops because his heart does) → VEGETA (checkpoint: control moves to
 * Vegeta, who can actually finish it) → FLEE (scene `gero_flees`) → AFTER.
 *
 * The hand-off between heroes is the mission's structure, not a cutscene: the
 * player loses the fight as Goku and finishes it as somebody else.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const GOKU_TARGET = 30; // percent of 19's health before the virus takes him

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

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 38);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 8))), startKi: 90 });
    goku.lockedForms = {};
    goku.cannotDie = true; // canon: what stops him here is not the android
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(-10, 0, 12))), startKi: 90 });
    vegeta.lockedForms = {}; // he has had three years, and he has been hiding it
    vegeta.controller = scripted();
    vegeta.untargetable = true;
    vegeta.cannotDie = true;
    vegeta.setHidden(true);
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 13))), startKi: 40 });
    krillin.controller = scripted();
    krillin.untargetable = true;
    krillin.cannotDie = true;
    const a19 = b.spawn({ charId: 'android_19', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -8))), startKi: 120, tags: { boss: true, priority: true } });
    const a20 = b.spawn({ charId: 'android_20', team: 1, pos: ground(b, FIELD.clone().add(new V3(-5, 0, -11))), startKi: 120, tags: { boss: true } });
    for (const f of [a19, a20]) {
      f.controller = scripted();
      f.cannotDie = true;
      f.untargetable = true;
    }
    b.story = { goku, vegeta, krillin, a19, a20 };
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of [S.goku, S.krillin, S.a19, S.a20]) f.controller = scripted();
      place(S.goku, ground(b, FIELD.clone().add(new V3(0, 0, 7))), Math.PI);
      place(S.a19, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      place(S.a20, ground(b, FIELD.clone().add(new V3(-4, 0, -9))), 0.3);
      faceTo(S.goku, S.a19.pos);
      yield* SL.Cinema.play(m, 'androids_arrive');
    },
  };

  /**
   * Goku against 19. He is winning on paper and the health bar keeps going the
   * wrong way, because every beam he throws is a meal.
   */
  P.goku = {
    id: 'goku',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, a = S.a19;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      m.teach(g, 'form:ssj');
      const ssj = g.def.forms.findIndex((f) => f.id === 'ssj');
      if (g.formIndex !== ssj) g.applyForm(ssj);
      g.hp = Math.round(g.hpMax * 0.85);
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true;
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 7))), Math.PI);
      place(a, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      a.setHidden(false);
      a.untargetable = false;
      a.hp = a.hpMax;
      a.poise.value = a.poise.max;
      a.cannotDie = true; // canon: Goku never finishes him
      a.infiniteHp = false;
      a.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.7, defense: 0.5, ranged: 0.4, beam: 0.3, preferredRange: 3, hooks: 'boss' } });
      a.target = g;
      g.target = a;
      S.a20.setHidden(false);
      S.a20.untargetable = true;
      S.a20.controller = scripted();
      S.a20.setState('scripted', { pose: 'a19_smug', expression: 'calm' });
      g.setState('free');
      a.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('hurt', 'Take him apart with your hands', { icon: 'fist', target: GOKU_TARGET });
      m.objective('noKi', 'Never feed him ki', { icon: 'guard', optional: true });
      m.prompt('noKi', 'special1', 'Ki feeds him — use your hands', { always: true });
      let fed = 0;
      b.on('absorbed', (e) => {
        if (e.fighter !== a) return;
        fed++;
        if (fed === 1) {
          m.failObjective('noKi');
          b.bark(a, 'taunt');
        }
      });
      const start = a.hp;
      let best = 0;
      const hook = () => {
        if (b.inputLocked) return;
        const taken = Math.round(((start - a.hp) / a.hpMax) * 100);
        if (taken > best) best = taken;
        m.progress('hurt', Math.min(GOKU_TARGET, Math.max(0, best)));
      };
      m.tickHooks.push(hook);
      yield () => best >= GOKU_TARGET;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('hurt');
      if (!fed) m.complete('noKi');
      m.flags.gokuDamage = best;
      m.flags.absorbed = fed;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.virus = {
    id: 'virus',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.goku, S.a19]) f.controller = scripted();
      faceTo(S.a19, S.goku.pos);
      yield* SL.Cinema.play(m, 'goku_virus');
      yield* SL.Cinema.play(m, 'vegeta_arrives');
    },
  };

  /** The hand-off: the player finishes the fight as somebody else. */
  P.vegeta = {
    id: 'vegeta',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, a = S.a19, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      g.untargetable = true;
      g.controller = scripted();
      v.setHidden(false);
      v.untargetable = false;
      const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 80);
      v.cannotDie = true;
      // three years of training against a machine built to read Goku
      v.damageDealtMul = 2.2;
      v.damageTakenMul = 0.45;
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(a, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      b.switchPlayer(v, { force: true });
      a.hp = Math.round(a.hpMax * 0.8);
      a.poise.value = a.poise.max;
      a.cannotDie = true; // the finish is a scene (vegeta_rips): his arms, then the Big Bang Attack
      a.infiniteHp = false;
      a.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.8, defense: 0.45, ranged: 0.5, beam: 0.35, preferredRange: 3, hooks: 'boss' } });
      a.target = v;
      v.target = a;
      v.setState('free');
      a.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('end19', 'Finish Android 19', { icon: 'fist', target: 100 });
      m.objective('noFeed', 'Do not feed him either', { icon: 'guard', optional: true });
      let fed = 0;
      b.on('absorbed', (e) => {
        if (e.fighter !== a) return;
        fed++;
        if (fed === 1) m.failObjective('noFeed');
      });
      const start = a.hp;
      const hook = () => {
        if (b.inputLocked) return;
        m.progress('end19', Math.round(((start - a.hp) / Math.max(1, start)) * 100));
      };
      m.tickHooks.push(hook);
      yield () => a.hpFrac <= 0.35 || !a.alive || !v.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!v.alive) return;
      m.complete('end19');
      if (!fed) m.complete('noFeed');
      m.flags.nineteenDown = !a.alive;
      m.flags.vegetaFed = fed;
      m.qteParts.push(U.clamp01(v.hpFrac));
      m.lock(true);
      clearCombat(b);
      a.controller = scripted();
      yield 0.3;
      yield* SL.Cinema.play(m, 'vegeta_rips');
    },
  };

  P.flee = {
    id: 'flee',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.vegeta, S.a20]) f.controller = scripted();
      S.a19.setHidden(true);
      S.a19.untargetable = true;
      S.a20.setHidden(false);
      place(S.a20, ground(b, S.vegeta.pos.clone().add(new V3(3, 0, -7))), 0);
      faceTo(S.a20, S.vegeta.pos);
      faceTo(S.vegeta, S.a20.pos);
      yield* SL.Cinema.play(m, 'gero_flees');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      v.controller = scripted();
      v.setState('scripted', { pose: 'armsCrossed', expression: 'smirk' });
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(U.lerp(3, 6, t), U.lerp(1.4, 3, t), U.lerp(4, 8, t))), v.chest(), U.lerp(42, 52, t)), 4, { cut: true, blendIn: 0 });
      m.say('vegeta', 'The boy was right about the day. He had better be wrong about the rest.', 4);
      yield* m.cine(4.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.flags.chapterOpen = true;
      m.title('CHAPTER 5 · ANDROID SAGA', 'TEN IN THE MORNING', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'android_nineteen',
    canon: true,
    chapter: 'CHAPTER 5 · ANDROID SAGA',
    title: 'Ten in the Morning',
    subtitle: 'Earth · Age 767 · exactly where he said they would be',
    character: 'goku',
    stage: 'coast',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Two strangers on the road, on the day a boy from the future named. Your ki is the worst thing you can give them.',
    rewards: ['Chapter 5 continues'],
    setup,
    phases: [P.arrive, P.goku, P.virus, P.vegeta, P.flee, P.after],
  };

  SL.data.missions[def.id] = def;
})();
