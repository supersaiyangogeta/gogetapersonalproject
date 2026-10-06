/*
 * CHAPTER 4 — NAMEK SAGA (played as Gohan; sits between "The Emperor" and
 * "Two More Shapes")
 * Mission "The Child" (canon).
 *
 * Canon beats: the second form has just finished going through three adults, and
 * it explains — pleasantly — the order it intends to kill them in. The thing
 * that answers is a four-year-old who has spent the whole saga being frightened,
 * and for about twenty seconds he is the strongest person on the field.
 *
 * Phases: TAUNT (scene) → RAGE (scene: the stillness, the shaking, the shout) →
 * ASSAULT (checkpoint: the player fights as Gohan, unleashed) → SPENT (scene) →
 * AFTER.
 *
 * The rage is not a damage number: it is `Mechanics.hiddenPotential.unleash`,
 * the mechanic Gohan already owns — aura, ki surge, a timer, and a real drain
 * afterwards. The mission is built around that window.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const DAMAGE_TARGET = 18; // percent of Frieza's health, inside the rage window

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
    clearArea(b, FIELD, 36);
    const gohan = b.spawn({ charId: 'kid_gohan', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 10))), startKi: 70 });
    gohan.hp = Math.round(gohan.hpMax * 0.55);
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(6, 0, 13))), startKi: 40 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, FIELD.clone().add(new V3(-5, 0, 12))), startKi: 20 });
    if (piccolo.lockedForms) delete piccolo.lockedForms.nail;
    piccolo.applyForm(1); // he arrived carrying Nail and it still was not enough
    for (const f of [krillin, piccolo]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
    }
    piccolo.hp = Math.max(1, Math.round(piccolo.hpMax * 0.06));
    krillin.hp = Math.round(krillin.hpMax * 0.3);
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -8))), startKi: 120, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(1); // second form
    frieza.mech.phase = 1;
    frieza.bossPhaseCap = 1;
    faceTo(gohan, frieza.pos);
    faceTo(frieza, piccolo.pos);
    b.story = { gohan, krillin, piccolo, frieza };
  }

  const P = {};

  P.taunt = {
    id: 'taunt',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [S.gohan, S.frieza, S.krillin, S.piccolo]) f.controller = scripted();
      place(S.gohan, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(S.frieza, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      place(S.piccolo, ground(b, FIELD.clone().add(new V3(-4, 0, 3))));
      place(S.krillin, ground(b, FIELD.clone().add(new V3(5, 0, 10))), Math.PI);
      faceTo(S.gohan, S.frieza.pos);
      faceTo(S.frieza, S.gohan.pos);
      yield* SL.Cinema.play(m, 'frieza_second_taunt');
    },
  };

  P.rage = {
    id: 'rage',
    run: function* (m) {
      const b = m.battle, S = b.story;
      yield* SL.Cinema.play(m, 'gohan_rage');
      // the rage is the mechanic he already owns, not a damage multiplier
      const mech = SL.Mechanics.hiddenPotential;
      if (mech && mech.unleash) mech.unleash(S.gohan);
      m.flags.unleashed = !!(S.gohan.mech && S.gohan.mech.unleashed);
    },
  };

  P.assault = {
    id: 'assault',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 7))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.5));
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true; // canon: Krillin drags him out of this alive
      // reaching the checkpoint directly still starts him unleashed
      if (!(g.mech && g.mech.unleashed) && SL.Mechanics.hiddenPotential.unleash) SL.Mechanics.hiddenPotential.unleash(g);
      fz.applyForm(1);
      fz.mech.phase = 1;
      fz.bossPhaseCap = 1;
      fz.hp = fz.hpMax;
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = false; // damage has to stick for the objective to mean anything
      fz.damageDealtMul = 0.55; // he spends most of this surprised rather than working
      fz.controller = cpu(b);
      fz.target = g;
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('hurt', 'Make him feel it', { icon: 'fist', target: DAMAGE_TARGET });
      m.objective('masenko', 'Land a Masenko on him', { icon: 'beam', optional: true });
      let masenko = 0;
      b.on('damage', (e) => {
        if (e.target !== fz || e.attacker !== g) return;
        if (e.type === 'beam' && !masenko) {
          masenko++;
          m.complete('masenko');
        }
      });
      m.prompt('ghMasenko', 'special1', 'Masenko — while the rage lasts', { required: true, always: true, when: () => g.mech && g.mech.unleashed && g.ki >= 30 });
      const start = fz.hp;
      let best = 0, ragePeak = 0;
      const hook = () => {
        if (b.inputLocked) return;
        const taken = Math.round(((start - fz.hp) / fz.hpMax) * 100);
        if (taken > best) best = taken;
        m.progress('hurt', Math.min(DAMAGE_TARGET, Math.max(0, best)));
        if (g.mech && g.mech.unleashed) ragePeak++;
      };
      m.tickHooks.push(hook);
      yield () => best >= DAMAGE_TARGET || !g.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!g.alive) return;
      m.complete('hurt');
      if (!masenko) m.failObjective('masenko');
      m.flags.gohanDamage = best;
      m.flags.rageFrames = ragePeak;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.spent = {
    id: 'spent',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.gohan, S.frieza, S.krillin]) f.controller = scripted();
      place(S.gohan, ground(b, FIELD.clone().add(new V3(1, 0, 4))));
      place(S.frieza, ground(b, FIELD.clone().add(new V3(0, 0, -4))), 0);
      faceTo(S.frieza, S.gohan.pos);
      yield* SL.Cinema.play(m, 'gohan_spent');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, k = S.krillin;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [fz, k]) f.controller = scripted();
      fz.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, U.lerp(3.6, 2.4, t)).add(new V3(0.8, 0.4, 0)), fz.chest(), U.lerp(44, 36, t)), 3.2, { cut: true, blendIn: 0 });
      m.say('frieza', 'Children on this planet are very badly brought up.', 2.8);
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE CHILD', 'Next: Piccolo, carrying somebody else', 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_gohan_frieza2',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Child',
    subtitle: 'Namek · twenty seconds where Gohan is the strongest person on the field',
    character: 'kid_gohan',
    stage: 'namek',
    parTime: 260,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'He has been frightened for the whole saga. Then the second form explains what it is going to do to Piccolo, and for a little while Gohan is not frightened at all.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.taunt, P.rage, P.assault, P.spent, P.after],
  };

  SL.data.missions[def.id] = def;
})();
