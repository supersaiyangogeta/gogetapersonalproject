/*
 * CHAPTER 6 — CELL SAGA (second mission)
 * Mission "Seventeen" (canon, played as Piccolo, then as Tien).
 *
 * The mission is a losing holding action, twice over: Piccolo cannot keep Cell
 * off 17, and Tien cannot keep the thing that comes out of it off anybody. What
 * the player is actually playing for is time.
 *
 * Phases: DUEL (scene `piccolo_hellzone`: Piccolo against 17, the Hellzone Grenade, and Cell
 * landing between them) → HOLD (checkpoint: Piccolo against the imperfect form, for as long as
 * he can) → TAKE (scene `cell_takes_17`, followed by the staged transformation
 * into the semi-perfect form) → STAND (scene `tien_holds_him`) → TIEN
 * (checkpoint: control moves to Tien, and the objective is seconds rather than
 * damage) → AFTER.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const HOLD_SECONDS = 40;
  const TIEN_SECONDS = 30;

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
    clearArea(b, FIELD, 34);
    const piccolo = b.spawn({ charId: 'piccolo', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 7))), startKi: 80 });
    piccolo.lockedForms = { nail: true };
    piccolo.cannotDie = true;
    const tien = b.spawn({ charId: 'tien', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 12))), startKi: 90 });
    tien.controller = scripted();
    tien.untargetable = true;
    tien.cannotDie = true; // canon: he survives this, barely
    tien.setHidden(true);
    const a17 = b.spawn({ charId: 'android_17', team: 2, pos: ground(b, FIELD.clone().add(new V3(-8, 0, -4))), startKi: 140 });
    a17.controller = scripted();
    a17.untargetable = true;
    a17.cannotDie = true;
    const cell = b.spawn({ charId: 'cell', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -7))), startKi: 130, tags: { boss: true, priority: true } });
    cell.controller = scripted();
    cell.cannotDie = true;
    b.story = { piccolo, tien, a17, cell };
  }

  const P = {};

  P.duel = {
    id: 'duel',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [S.piccolo, S.cell, S.a17]) f.controller = scripted();
      yield* SL.Cinema.play(m, 'piccolo_hellzone', { field: FIELD });
    },
  };

  /** Piccolo, buying time he does not have. */
  P.hold = {
    id: 'hold',
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
      p.damageDealtMul = 1.5;
      p.damageTakenMul = 0.75;
      place(p, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(c, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      c.applyForm(0);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.cannotDie = true;
      c.infiniteHp = true; // this phase is a clock, not a health bar
      c.bossPhaseCap = 1;
      c.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.85, defense: 0.4, ranged: 0.4, beam: 0.35, preferredRange: 3.5, hooks: 'boss' } });
      c.target = p;
      p.target = c;
      S.a17.setHidden(false);
      S.a17.untargetable = true;
      place(S.a17, ground(b, FIELD.clone().add(new V3(-8, 0, -4))));
      faceTo(S.a17, c.pos);
      S.a17.setState('scripted', { pose: 'a17_bored', expression: 'calm' });
      p.setState('free');
      c.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('hold', 'Keep him away from 17', { icon: 'clock', target: HOLD_SECONDS });
      m.objective('mark', 'Land twenty hits while you do it', { icon: 'fist', optional: true, target: 20 });
      let hits = 0, reached = 0;
      b.on('damage', (e) => {
        if (e.target === c && e.attacker === p && !e.blocked) {
          hits++;
          m.progress('mark', Math.min(20, hits));
        }
      });
      let t2 = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t2 += 1 / 60;
        m.progress('hold', Math.min(HOLD_SECONDS, Math.floor(t2)));
        if (c.pos.distanceTo(S.a17.pos) < 5) reached++;
      };
      m.tickHooks.push(hook);
      yield () => t2 >= HOLD_SECONDS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('hold');
      if (hits >= 20) m.complete('mark');
      else m.failObjective('mark');
      m.flags.heldSeconds = Math.round(t2);
      m.flags.piccoloHits = hits;
      m.flags.cellReached17 = reached;
      m.qteParts.push(U.clamp01(p.hpFrac));
      yield 0.4;
    },
  };

  P.take = {
    id: 'take',
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell;
      clearCombat(b);
      for (const f of [S.piccolo, S.cell, S.a17]) f.controller = scripted();
      S.piccolo.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      S.piccolo.untargetable = true;
      place(S.a17, ground(b, c.pos.clone().add(new V3(2.5, 0, 2.5))));
      faceTo(c, S.a17.pos);
      yield* SL.Cinema.play(m, 'cell_takes_17');
      // the shape that comes out of it, staged the way every transformation is
      c.infiniteHp = false;
      c.bossPhaseCap = 2;
      yield* SL.data.cinematics.bossTransform(m, {
        fighter: c,
        technique: 'toSemi',
        witness: S.piccolo,
        line: 'cell_semi',
        music: 6,
      });
      m.flags.semiPerfect = c.form.id === 'semi_perfect';
    },
  };

  P.stand = {
    id: 'stand',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.tien, S.cell]) f.controller = scripted();
      S.tien.setHidden(false);
      place(S.tien, ground(b, S.cell.pos.clone().add(new V3(0, 0, 8))), Math.PI);
      faceTo(S.tien, S.cell.pos);
      faceTo(S.cell, S.tien.pos);
      yield* SL.Cinema.play(m, 'tien_holds_him');
    },
  };

  /** Tien: no damage objective at all, only seconds. */
  P.tien = {
    id: 'tien',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.tien, c = S.cell;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      t.setHidden(false);
      t.untargetable = false;
      t.hp = t.hpMax;
      t.ki = t.kiMax;
      t.cannotDie = true;
      b.switchPlayer(t, { force: true });
      place(t, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(c, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      S.piccolo.setHidden(true);
      S.piccolo.untargetable = true;
      const semi = c.def.forms.findIndex((f) => f.id === 'semi_perfect');
      if (semi > 0 && c.formIndex !== semi) c.applyForm(semi);
      c.hp = c.hpMax;
      c.cannotDie = true;
      c.infiniteHp = true; // nothing Tien has can finish him, and the mission says so
      c.damageDealtMul = 0.6; // he is playing with him, which is the only reason Tien lives
      c.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.8, defense: 0.4, ranged: 0.5, beam: 0.45, preferredRange: 5, hooks: 'boss' } });
      c.target = t;
      t.target = c;
      t.setState('free');
      c.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('seconds', 'Buy them thirty seconds', { icon: 'clock', target: TIEN_SECONDS });
      m.objective('triBeam', 'Spend everything: land a Tri-Beam', { icon: 'ultimate', optional: true });
      let triBeam = 0;
      b.on('damage', (e) => {
        if (e.target === c && e.attacker === t && e.type === 'beam') {
          triBeam++;
          if (triBeam === 1) m.complete('triBeam');
        }
      });
      let t2 = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t2 += 1 / 60;
        m.progress('seconds', Math.min(TIEN_SECONDS, Math.floor(t2)));
      };
      m.tickHooks.push(hook);
      yield () => t2 >= TIEN_SECONDS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('seconds');
      if (!triBeam) m.failObjective('triBeam');
      m.flags.tienSeconds = Math.round(t2);
      m.flags.triBeams = triBeam;
      m.qteParts.push(U.clamp01(t.hpFrac));
      yield 0.4;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.tien;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [t, S.cell]) f.controller = scripted();
      t.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
      S.cell.setHidden(true);
      S.cell.untargetable = true;
      b.stage.setMood(0.36, 0x203828, 1.4);
      m.shot((x, out) => camAt(out, t.chest().clone().add(new V3(U.lerp(2.6, 5, x), U.lerp(1.2, 2.6, x), U.lerp(3.4, 7, x))), t.chest(), U.lerp(42, 52, x)), 4, { cut: true, blendIn: 0 });
      m.say('tien', 'Thirty seconds. That is what I had in me.', 3.4, { style: 'quiet' });
      yield* m.cine(4);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.flags.semiDone = true;
      m.title('CHAPTER 6 · CELL SAGA', 'SEVENTEEN', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'cell_semi',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'Seventeen',
    subtitle: 'Earth · Age 767 · a holding action, twice over',
    character: 'piccolo',
    stage: 'coast',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Nobody here can win. What they can do is make it take longer, and that is the objective.',
    rewards: ['Chapter 6 continues'],
    setup,
    phases: [P.duel, P.hold, P.take, P.stand, P.tien, P.after],
  };

  SL.data.missions[def.id] = def;
})();
