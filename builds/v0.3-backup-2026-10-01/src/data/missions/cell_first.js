/*
 * CHAPTER 6 — CELL SAGA (first mission)
 * Mission "The Town That Stopped" (canon, played as Piccolo).
 *
 * Gero's last project has been out of the mountain for days, and the first
 * anybody hears of it is a town with nobody left in it. The fight teaches the
 * rule the whole saga runs on: **he grows it back**. Damage that is not
 * followed up disappears, so the objective is pressure rather than poking.
 *
 * Phases: TOWN (scene `cell_sighting`) → TALK (scene `cell_names_it`) → FIGHT
 * (checkpoint: Piccolo against the imperfect form, with a regeneration bar
 * ticking every time the player lets him breathe) → GONE (scene `cell_escapes`)
 * → AFTER.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const HURT_TARGET = 45; // percent of his health before he decides to leave

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
    const piccolo = b.spawn({ charId: 'piccolo', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 7))), startKi: 80 });
    piccolo.lockedForms = { nail: true }; // the fusion is Namek's, and this is three years later
    piccolo.cannotDie = true; // canon: he walks away from this one
    const cell = b.spawn({ charId: 'cell', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -7))), startKi: 120, tags: { boss: true, priority: true } });
    cell.controller = scripted();
    cell.cannotDie = true;
    cell.untargetable = true;
    cell.setHidden(true);
    b.story = { piccolo, cell };
  }

  const P = {};

  P.town = {
    id: 'town',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of [S.piccolo, S.cell]) f.controller = scripted();
      place(S.piccolo, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(S.cell, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      faceTo(S.piccolo, S.cell.pos);
      yield* SL.Cinema.play(m, 'cell_sighting');
    },
  };

  P.talk = {
    id: 'talk',
    run: function* (m) {
      const b = m.battle, S = b.story;
      S.cell.setHidden(false);
      S.cell.untargetable = false;
      faceTo(S.cell, S.piccolo.pos);
      yield* SL.Cinema.play(m, 'cell_names_it');
    },
  };

  /**
   * The fight, and the lesson: every second the player spends at range, he
   * gets back what they just took off him.
   */
  P.fight = {
    id: 'fight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.piccolo, c = S.cell;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(p, { force: true });
      p.hp = p.hpMax;
      p.ki = Math.max(p.ki, 70);
      p.cannotDie = true;
      // three years in the Time Chamber's shadow: he is not the Namek Piccolo
      p.damageDealtMul = 1.6;
      p.damageTakenMul = 0.7;
      place(p, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(c, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      c.setHidden(false);
      c.untargetable = false;
      c.applyForm(0);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.cannotDie = true; // he leaves rather than dies
      c.infiniteHp = false;
      c.bossPhaseCap = 1; // no transformation here: he has not eaten anybody who matters yet
      c.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.7, defense: 0.5, ranged: 0.45, beam: 0.4, preferredRange: 4, hooks: 'boss' } });
      c.target = p;
      p.target = c;
      p.setState('free');
      c.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('hurt', 'Take him apart faster than he rebuilds', { icon: 'fist', target: HURT_TARGET });
      m.objective('nogaps', 'Never give him a full regeneration', { icon: 'guard', optional: true });
      m.prompt('pressure', 'light', 'Leave him alone and he grows it back', { always: true });
      let regrown = 0, gaps = 0;
      const start = c.hp;
      let best = 0;
      const hook = () => {
        if (b.inputLocked) return;
        const taken = Math.round(((start - c.hp) / c.hpMax) * 100);
        if (taken > best) best = taken;
        m.progress('hurt', Math.min(HURT_TARGET, Math.max(0, best)));
        // a full regeneration window is the thing the optional goal watches
        const mech = c.mech || {};
        const idle = b.frame - (mech.lastHurt || 0);
        const need = (c.def.regen && c.def.regen.idleFrames) || 150;
        if (idle === need + 60) {
          gaps++;
          if (gaps === 1) m.failObjective('nogaps');
        }
        regrown = Math.round(mech.regrown || 0);
      };
      m.tickHooks.push(hook);
      yield () => best >= HURT_TARGET;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('hurt');
      if (!gaps) m.complete('nogaps');
      m.flags.cellHurt = best;
      m.flags.cellRegrown = regrown;
      m.flags.regenGaps = gaps;
      m.qteParts.push(U.clamp01(p.hpFrac));
      yield 0.4;
    },
  };

  P.gone = {
    id: 'gone',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.piccolo, S.cell]) f.controller = scripted();
      faceTo(S.piccolo, S.cell.pos);
      faceTo(S.cell, S.piccolo.pos);
      yield* SL.Cinema.play(m, 'cell_escapes');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      p.controller = scripted();
      p.setState('scripted', { pose: 'idle', expression: 'grit' });
      m.shot((t, out) => camAt(out, p.chest().clone().add(new V3(U.lerp(3.2, 6, t), U.lerp(1.6, 3.2, t), U.lerp(4.2, 8, t))), p.chest(), U.lerp(42, 52, t)), 4, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Find the androids before he does. That is the whole plan, and it is not a good one.', 4.2, { style: 'quiet' });
      yield* m.cine(4.4);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.flags.chapterOpen = true;
      m.title('CHAPTER 6 · CELL SAGA', 'THE TOWN THAT STOPPED', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'cell_first',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'The Town That Stopped',
    subtitle: 'Earth · Age 767 · a street where everybody was a minute ago',
    character: 'piccolo',
    stage: 'coast',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Something came out of the laboratory ahead of the androids, and it has been eating towns.',
    rewards: ['Chapter 6 begins'],
    setup,
    phases: [P.town, P.talk, P.fight, P.gone, P.after],
  };

  SL.data.missions[def.id] = def;
})();
