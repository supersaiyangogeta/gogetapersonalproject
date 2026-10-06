/*
 * CHAPTER 4 — NAMEK SAGA (thirteenth mission of the Namek foundation, in development)
 * Mission "Two More Shapes" (canon, played as Piccolo).
 *
 * Canon beats: Piccolo arrives carrying Nail and, for about two minutes, the fight
 * is even — which is the worst thing that could have happened, because it makes
 * Frieza stop pretending. He changes twice more. Neither change is a cutscene the
 * player watches from outside: they happen in the middle of a fight the player is
 * losing, and the second one ends the mission with everybody still standing and
 * nobody safe.
 *
 * Phases: ARRIVE (cutscene) → EVEN (checkpoint: Piccolo against the second form,
 * a fight he can actually win exchanges in) → THIRD (staged transformation) →
 * OUTCLASSED (checkpoint: survive the third form) → FINAL (staged transformation,
 * with Vegeta reading it completely wrong) → AFTER (cutscene).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const SURVIVE_SECONDS = 40;

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
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 38);
    const piccolo = b.spawn({ charId: 'piccolo', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 13))), startKi: 90 });
    // he arrives already carrying Nail: the previous mission is what granted this
    if (piccolo.lockedForms) delete piccolo.lockedForms.nail;
    piccolo.applyForm(1);
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(7, 0, 18))), startKi: 50 });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(-7, 0, 19))), startKi: 50 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(14, 0, 20))), startKi: 60 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    for (const f of [gohan, krillin, vegeta]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.4);
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -10))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(1); // he is already in his second form when this starts
    frieza.mech.phase = 1;
    frieza.bossPhaseCap = 1;
    faceTo(piccolo, frieza.pos);
    faceTo(frieza, piccolo.pos);
    b.story = { piccolo, gohan, krillin, vegeta, frieza };
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.piccolo, fz = S.frieza, v = S.vegeta;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      p.setState('scripted', { pose: 'idle', expression: 'calm' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      v.setState('scripted', { pose: 'idle', expression: 'hurt' });
      m.shot((t, out) => camAt(out, p.chest().clone().add(new V3(U.lerp(7, 3.2, U.easeInOutCubic(t)), U.lerp(4, 1, U.easeInOutCubic(t)), 4.5)), p.chest(), 44), 3.6, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Namekian. You feel different.', 2.8);
      yield* m.cine(3.6);
      m.shot((t, out) => camAt(out, p.chest().clone().addScaledVector(p.forward, 2.4).add(new V3(-0.8, 0.3, 0)), p.chest(), 40), 3.2, { cut: true, blendIn: 0 });
      m.say('piccolo', 'I am. Keep the boy behind me.', 2.8);
      yield* m.cine(3.2);
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, 3).add(new V3(0.9, 0.5, 0)), fz.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('frieza', 'Another one? Very well. Let\'s see what you\'ve got.', 3);
      yield* m.cine(3.2);
      m.endShot();
    },
  };

  P.even = {
    id: 'even',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.piccolo, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== p) b.switchPlayer(p, { force: true });
      if (p.formIndex < 1) {
        m.teach(p, 'form:nail');
        p.applyForm(1);
      }
      place(p, ground(b, FIELD.clone().add(new V3(0, 0, 11))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -9))), 0);
      p.hp = p.hpMax;
      p.ki = Math.max(p.ki, 90);
      // canon: carrying Nail puts him level with the second form for a few minutes
      p.damageDealtMul = 1.6;
      p.damageTakenMul = 0.7;
      p.cannotDie = true; // canon: he is alive for the next two transformations
      fz.applyForm(1);
      fz.mech.phase = 1;
      fz.bossPhaseCap = 1;
      fz.hp = fz.hpMax;
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.controller = cpu(b);
      fz.target = p;
      p.target = fz;
      p.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('even', 'Make the second form work for it', { icon: 'fist', target: 100 });
      m.objective('untouched', 'Take no impaling charge', { icon: 'guard', optional: true });
      let charged = 0;
      b.on('damage', (e) => {
        if (e.target === p && e.attacker === fz && e.source === 'Impaling Charge') {
          charged++;
          if (charged === 1) m.failObjective('untouched');
        }
      });
      m.prompt('fzHorn2', 'dodge', 'The charge goes through a guard — move', {
        always: true,
        when: () => fz.state === 'rush',
        until: () => fz.state !== 'rush',
      });
      const hook = () => {
        if (b.inputLocked) return;
        m.progress('even', Math.round((1 - fz.hpFrac) * 100));
      };
      m.tickHooks.push(hook);
      yield () => fz.hpFrac <= 0.6 || !p.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!p.alive) return;
      m.complete('even');
      if (!charged) m.complete('untouched');
      m.flags.chargesTaken = charged;
      m.qteParts.push(U.clamp01(p.hpFrac));
      yield 0.4;
    },
  };

  P.third = {
    id: 'third',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, p = S.piccolo;
      m.clearObjectives();
      faceTo(fz, p.pos);
      faceTo(p, fz.pos);
      fz.controller = scripted();
      fz.bossPhaseCap = 2;
      yield* SL.data.cinematics.bossTransform(m, {
        fighter: fz,
        technique: 'toThird',
        witness: p,
        line: 'frieza_transform3',
        witnessLine: 'That is not a power-up. That is a different animal.',
        music: 4,
      });
      m.flags.thirdForm = true;
    },
  };

  P.outclassed = {
    id: 'outclassed',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.piccolo, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== p) b.switchPlayer(p, { force: true });
      if (p.formIndex < 1) {
        m.teach(p, 'form:nail');
        p.applyForm(1);
      }
      if (fz.formIndex < 2) fz.applyForm(2);
      fz.mech.phase = 2;
      fz.bossPhaseCap = 2;
      fz.hp = Math.round(fz.hpMax * 0.5);
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = true; // this one is survived, not won
      fz.controller = cpu(b);
      place(p, ground(b, FIELD.clone().add(new V3(0, 0, 10))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      p.hp = Math.max(p.hp, Math.round(p.hpMax * 0.55));
      p.ki = Math.max(p.ki, 70);
      p.cannotDie = true;
      p.target = fz;
      fz.target = p;
      p.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 4);
      m.objective('survive', 'Stay standing', { icon: 'clock', target: SURVIVE_SECONDS });
      m.objective('answer', 'Land a Special Beam Cannon on him', { icon: 'beam', optional: true });
      let sbc = 0;
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker === p && e.type === 'beam') {
          sbc++;
          if (sbc === 1) m.complete('answer');
        }
      });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('survive', Math.min(SURVIVE_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= SURVIVE_SECONDS || !p.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!p.alive) return;
      m.complete('survive');
      if (!sbc) m.failObjective('answer');
      m.flags.beamsLanded = sbc;
      m.qteParts.push(U.clamp01(p.hpFrac));
      yield 0.4;
    },
  };

  P.final = {
    id: 'final',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, v = S.vegeta;
      m.clearObjectives();
      fz.infiniteHp = false;
      fz.controller = scripted();
      fz.bossPhaseCap = 3;
      // Vegeta, watching, and getting it completely wrong in the most Vegeta way
      v.untargetable = false;
      place(v, ground(b, fz.pos.clone().add(new V3(9, 0, 12))));
      faceTo(v, fz.pos);
      yield* SL.data.cinematics.bossTransform(m, {
        fighter: fz,
        technique: 'toFinal',
        witness: v,
        line: 'frieza_transform4',
        witnessLine: 'Let him. Let him do it. He is making me a Super Saiyan.',
        music: 5,
      });
      m.flags.finalForm = true;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, p = S.piccolo, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [fz, p, v]) f.controller = scripted();
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -4))), 0);
      place(p, ground(b, FIELD.clone().add(new V3(-3, 0, 7))), Math.PI);
      place(v, ground(b, FIELD.clone().add(new V3(5, 0, 9))), Math.PI);
      fz.setState('scripted', { pose: 'idle', expression: 'calm' });
      p.setState('scripted', { pose: 'idle', expression: 'hurt' });
      v.setState('scripted', { pose: 'idle', expression: 'grit' });
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, U.lerp(4.4, 2.6, t)).add(new V3(0.8, 0.3, 0)), fz.chest(), 40), 3.4, { cut: true, blendIn: 0 });
      m.say('frieza', 'This is my true form. Consider yourselves honored.', 2.8);
      yield* m.cine(3.4);
      m.shot((t, out) => camAt(out, p.chest().clone().add(new V3(-2.2, 0.8, 2.6)), p.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Gohan. Krillin. Whatever happens, do not let him near the boy.', 3);
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'TWO MORE SHAPES', 'Next: the final form, and the man who is still on his way', 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_frieza2',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'Two More Shapes',
    subtitle: 'Namek · Piccolo, and the two transformations he causes',
    character: 'piccolo',
    stage: 'namek',
    parTime: 420,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Fighting him evenly is the worst thing anybody has done all day: it makes him stop pretending, twice.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.arrive, P.even, P.third, P.outclassed, P.final, P.after],
  };

  SL.data.missions[def.id] = def;
})();
