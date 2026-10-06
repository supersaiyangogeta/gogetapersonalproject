/*
 * CHAPTER 5 — ANDROID SAGA (fifth mission)
 * Mission "The Pair on the Road" (canon, played as Vegeta, then as Trunks).
 *
 * The fight Vegeta has been waiting three years for, and the one the story has
 * already decided he loses. The mission is built around what the loss is *made*
 * of rather than around a health bar: his ki and stamina drain the way they
 * always do, and hers do not, because she does not have any to spend.
 *
 * Phases: ROAD (scene `pair_on_the_road`) → VEGETA (checkpoint: push her to 60%
 * while the fight costs you everything it normally costs) → TURN (scene
 * `eighteen_turns`: the arm) → TRUNKS (checkpoint: control moves to Trunks and
 * the objective becomes keeping her off his father) → CALL (scene
 * `seventeen_calls_it`) → AFTER.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const VEGETA_TARGET = 40; // percent of her health before she stops playing
  const HOLD_SECONDS = 30;

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
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 34);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 7))), startKi: 90 });
    vegeta.lockedForms = {};
    const ssj = vegeta.def.forms.findIndex((f) => f.id === 'ssj');
    if (ssj > 0) vegeta.applyForm(ssj);
    vegeta.cannotDie = true; // canon: she breaks his arm, she does not kill him
    const trunks = b.spawn({ charId: 'future_trunks', team: 0, pos: ground(b, FIELD.clone().add(new V3(7, 0, 11))), startKi: 80 });
    trunks.lockedForms = {};
    const tssj = trunks.def.forms.findIndex((f) => f.id === 'ssj');
    if (tssj > 0) trunks.applyForm(tssj);
    trunks.controller = scripted();
    trunks.untargetable = true;
    trunks.cannotDie = true;
    const a18 = b.spawn({ charId: 'android_18', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -7))), startKi: 140, tags: { boss: true, priority: true } });
    const a17 = b.spawn({ charId: 'android_17', team: 1, pos: ground(b, FIELD.clone().add(new V3(-5, 0, -10))), startKi: 140, tags: { boss: true } });
    for (const f of [a18, a17]) {
      f.controller = scripted();
      f.cannotDie = true;
      f.untargetable = true;
    }
    b.story = { vegeta, trunks, a17, a18 };
  }

  const P = {};

  P.road = {
    id: 'road',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of [S.vegeta, S.trunks, S.a17, S.a18]) f.controller = scripted();
      place(S.vegeta, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(S.a18, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      place(S.a17, ground(b, FIELD.clone().add(new V3(-4, 0, -9))), 0.2);
      faceTo(S.vegeta, S.a18.pos);
      yield* SL.Cinema.play(m, 'pair_on_the_road');
    },
  };

  /**
   * The half he is winning. Everything about it is normal — which is the point:
   * his ki and stamina behave like a fighter's, and hers do not move at all.
   */
  P.vegeta = {
    id: 'vegeta',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, a = S.a18;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(v, { force: true });
      const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 80);
      v.cannotDie = true;
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(a, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      a.setHidden(false);
      a.untargetable = false;
      a.hp = a.hpMax;
      a.poise.value = a.poise.max;
      a.cannotDie = true; // she is never in danger here
      a.infiniteHp = false;
      a.damageDealtMul = 0.55; // she is not trying yet
      a.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.6, defense: 0.55, ranged: 0.2, beam: 0.15, preferredRange: 2.6, hooks: 'boss' } });
      a.target = v;
      v.target = a;
      S.a17.setHidden(false);
      S.a17.untargetable = true;
      S.a17.controller = scripted();
      S.a17.setState('scripted', { pose: 'a17_bored', expression: 'calm' });
      v.setState('free');
      a.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('push', 'Make her take you seriously', { icon: 'fist', target: VEGETA_TARGET });
      m.objective('style', 'Do it without a single Galick Gun', { icon: 'guard', optional: true });
      let beams = 0;
      b.on('damage', (e) => {
        if (e.target === a && e.attacker === v && (e.type === 'beam' || e.source === 'Galick Gun')) {
          beams++;
          if (beams === 1) m.failObjective('style');
        }
      });
      const start = a.hp;
      let best = 0;
      const hook = () => {
        if (b.inputLocked) return;
        const taken = Math.round(((start - a.hp) / a.hpMax) * 100);
        if (taken > best) best = taken;
        m.progress('push', Math.min(VEGETA_TARGET, Math.max(0, best)));
      };
      m.tickHooks.push(hook);
      yield () => best >= VEGETA_TARGET;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('push');
      if (!beams) m.complete('style');
      m.flags.vegetaDamage = best;
      m.flags.vegetaKi = Math.round(v.ki);
      m.flags.eighteenKi = Math.round(a.ki);
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.4;
    },
  };

  P.turn = {
    id: 'turn',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.vegeta, S.a18, S.trunks]) f.controller = scripted();
      S.trunks.setHidden(false);
      place(S.trunks, ground(b, S.vegeta.pos.clone().add(new V3(5, 0, 6))), Math.PI);
      faceTo(S.trunks, S.vegeta.pos);
      faceTo(S.a18, S.vegeta.pos);
      yield* SL.Cinema.play(m, 'eighteen_turns');
    },
  };

  /** Control moves again: keeping her off his father is the whole objective. */
  P.trunks = {
    id: 'trunks',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, v = S.vegeta, a = S.a18;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      t.setHidden(false);
      t.untargetable = false;
      const ssj = t.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && t.formIndex !== ssj) t.applyForm(ssj);
      t.hp = t.hpMax;
      t.ki = Math.max(t.ki, 70);
      t.cannotDie = true;
      b.switchPlayer(t, { force: true });
      place(t, ground(b, FIELD.clone().add(new V3(0, 0, 5))), Math.PI);
      place(a, ground(b, FIELD.clone().add(new V3(0, 0, -5))), 0);
      place(v, ground(b, FIELD.clone().add(new V3(4, 0, 10))), Math.PI);
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      v.untargetable = true;
      v.controller = scripted();
      a.hp = Math.round(a.hpMax * 0.6);
      a.cannotDie = true;
      a.damageDealtMul = 1; // she has stopped pulling them
      a.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.85, defense: 0.45, ranged: 0.3, beam: 0.2, preferredRange: 2.4, hooks: 'boss' } });
      a.target = t;
      t.target = a;
      t.setState('free');
      a.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 5);
      m.objective('hold', 'Keep her off him', { icon: 'guard', target: HOLD_SECONDS });
      m.objective('clean', 'Stay off the ground', { icon: 'run', optional: true });
      let downed = false;
      b.on('knockdown', (e) => {
        if (e.fighter !== t || downed) return;
        downed = true;
        m.failObjective('clean');
      });
      let t2 = 0, reachedFather = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t2 += 1 / 60;
        m.progress('hold', Math.min(HOLD_SECONDS, Math.floor(t2)));
        if (a.pos.distanceTo(v.pos) < 4) reachedFather++;
      };
      m.tickHooks.push(hook);
      yield () => t2 >= HOLD_SECONDS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('hold');
      if (!downed) m.complete('clean');
      m.flags.heldSeconds = Math.round(t2);
      m.flags.fatherReached = reachedFather;
      m.qteParts.push(U.clamp01(t.hpFrac));
      yield 0.4;
    },
  };

  P.call = {
    id: 'call',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.trunks, S.a17, S.a18]) f.controller = scripted();
      S.a17.setHidden(false);
      place(S.a17, ground(b, S.trunks.pos.clone().add(new V3(-4, 0, -8))), 0);
      faceTo(S.a17, S.trunks.pos);
      faceTo(S.trunks, S.a17.pos);
      yield* SL.Cinema.play(m, 'seventeen_calls_it');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      t.controller = scripted();
      t.setState('scripted', { pose: 'ft_calm', expression: 'calm' });
      m.shot((t2, out) => camAt(out, t.chest().clone().add(new V3(U.lerp(3.4, 6, t2), U.lerp(1.6, 3.2, t2), U.lerp(4.4, 8, t2))), t.chest(), U.lerp(42, 52, t2)), 4, { cut: true, blendIn: 0 });
      m.say('future_trunks', 'They are going to Goku. And he can barely stand up.', 3.6, { style: 'quiet' });
      yield* m.cine(4);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.flags.roadDone = true;
      m.title('CHAPTER 5 · ANDROID SAGA', 'THE PAIR ON THE ROAD', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'android_road',
    canon: true,
    chapter: 'CHAPTER 5 · ANDROID SAGA',
    title: 'The Pair on the Road',
    subtitle: 'Earth · Age 767 · the fight he waited three years for',
    character: 'vegeta',
    stage: 'coast',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'He is stronger than he has ever been, and she is not even breathing hard.',
    rewards: ['Chapter 5 continues'],
    setup,
    phases: [P.road, P.vegeta, P.turn, P.trunks, P.call, P.after],
  };

  SL.data.missions[def.id] = def;
})();
