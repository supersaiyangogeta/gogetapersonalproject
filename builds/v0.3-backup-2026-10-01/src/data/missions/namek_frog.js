/*
 * CHAPTER 4 — NAMEK SAGA (tenth mission of the Namek foundation, in development)
 * Mission "Nothing Like a Frog" (canon, played as Vegeta).
 *
 * Canon beats: with his body back, Goku is in no state to finish anything, and
 * Vegeta walks onto the field instead. Jeice does not last. The captain, in a
 * body that is falling apart, opens up one last time and aims at the prince —
 * and Goku puts a Namekian frog in the way.
 *
 * Phases: CLEANUP (checkpoint: Vegeta against Jeice, who would much rather be
 * anywhere else) → LAST TRY (cutscene: the beam, and the frog) → ARMOUR
 * (cutscene: Vegeta helps himself to what the Ginyu Force no longer needs).
 *
 * The body change here is the same system as in "The Captain" — the mission
 * simply puts a different body in the path (battle.swapBodies, techniques.js
 * bodyChange with interceptRadius). Nothing about the frog is special-cased.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);

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

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 34);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 12))), startKi: 90 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    const goku = b.spawn({ charId: 'goku', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 17))), startKi: 40 });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(13, 0, 19))), startKi: 40 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-13, 0, 19))), startKi: 40 });
    for (const f of [goku, krillin, gohan]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
    }
    goku.hp = Math.round(goku.hpMax * 0.15); // he has his body back, and it is wrecked
    const jeice = b.spawn({ charId: 'jeice', team: 1, pos: ground(b, FIELD.clone().add(new V3(-4, 0, -9))), startKi: 80, tags: { boss: true, priority: true } });
    const ginyu = b.spawn({ charId: 'ginyu', team: 1, pos: ground(b, FIELD.clone().add(new V3(6, 0, -14))), startKi: 60 });
    ginyu.hp = Math.round(ginyu.hpMax * 0.25);
    ginyu.untargetable = true;
    ginyu.cannotDie = true;
    for (const f of [jeice, ginyu]) f.controller = scripted();
    // the frog is just another body, waiting off to one side
    const frog = b.spawn({ charId: 'namek_frog', team: 0, pos: ground(b, FIELD.clone().add(new V3(18, 0, 6))) });
    frog.controller = scripted();
    frog.untargetable = true;
    frog.cannotDie = true;
    faceTo(vegeta, FIELD);
    for (const f of [jeice, ginyu]) faceTo(f, vegeta.pos);
    b.story = { vegeta, goku, krillin, gohan, jeice, ginyu, frog };
  }

  const P = {};

  P.cleanup = {
    id: 'cleanup',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, jc = S.jeice;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.2);
      if (b.player !== v) b.switchPlayer(v, { force: true });
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 10))), Math.PI);
      place(jc, ground(b, FIELD.clone().add(new V3(-4, 0, -9))), 0);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 90);
      // canon: the Zenkai has left him far above what is still standing here
      v.damageDealtMul = 1.9;
      v.damageTakenMul = 0.5;
      jc.hp = jc.hpMax;
      jc.mech.phase = 0;
      jc.poise.value = jc.poise.max;
      jc.cannotDie = false;
      jc.controller = cpu(b);
      jc.target = v;
      v.target = jc;
      v.setState('free');
      jc.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.say('vegeta', 'Run if you like. It only makes this take longer.', 3);
      m.objective('jeice', 'Finish the last of the Ginyu Force', { icon: 'fist' });
      const fast = m.objective('fast', 'Inside 60 seconds', { icon: 'clock', optional: true });
      let t = 0, kickoffs = 0;
      b.on('retreatVolley', (e) => {
        if (e.fighter === jc) kickoffs++;
      });
      const hook = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(hook);
      // with nobody left to cover him, the spacing move is all he has
      m.prompt('jcKick2', 'dash', 'He is buying distance — take it back', {
        always: true,
        when: () => jc.state === 'retreatVolley',
        until: () => jc.state !== 'retreatVolley',
      });
      yield () => !jc.alive || !v.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!v.alive) return;
      m.complete('jeice');
      if (t <= 60) m.complete('fast');
      else m.failObjective('fast');
      m.flags.jeiceSeconds = Math.round(t);
      m.flags.jeiceKickoffs = kickoffs;
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.5;
    },
  };

  P.lastTry = {
    id: 'lastTry',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, gy = S.ginyu, g = S.goku, frog = S.frog;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [gy, g, frog, v]) f.controller = scripted();
      place(gy, ground(b, v.pos.clone().addScaledVector(v.forward, 9)));
      faceTo(gy, v.pos);
      faceTo(v, gy.pos);
      // Goku is down beside Vegeta, off the line between them — the frog is by his hand
      place(g, ground(b, v.pos.clone().addScaledVector(v.forward, 3).add(new V3(4.5, 0, 0))));
      faceTo(g, gy.pos);
      // the frog, the grab, the throw, the beam finding it (owner, playtest round 2:
      // "I have not seen where Goku threw a frog" — it used to be placed on the line, not thrown)
      yield* SL.Cinema.play(m, 'frog_intercept');
    },
  };

  P.armour = {
    id: 'armour',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 4))), Math.PI);
      place(g, ground(b, FIELD.clone().add(new V3(4, 0, 8))), Math.PI);
      v.setState('scripted', { pose: 'idle', expression: 'smirk' });
      g.setState('scripted', { pose: 'idle', expression: 'hurt' });
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 2.8).add(new V3(-0.9, 0.4, 0)), v.chest(), 42), 3.4, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Their armour is better than mine. They will not be needing it.', 3.2);
      yield* m.cine(3.4);
      m.shot((t, out) => camAt(out, g.chest().clone().add(new V3(1.6, 0.7, 2.6)), g.chest(), 44), 3.2, { cut: true, blendIn: 0 });
      m.say('goku', 'Vegeta... Frieza is still out there. And he is not like them.', 3);
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'NOTHING LIKE A FROG', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_frog',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'Nothing Like a Frog',
    subtitle: 'Namek · Vegeta closes the Ginyu Force account',
    character: 'vegeta',
    stage: 'namek',
    parTime: 180,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Jeice has nobody left to cover him, and the captain has one trick left. Neither problem survives the prince for long.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.cleanup, P.lastTry, P.armour],
  };

  SL.data.missions[def.id] = def;
})();
