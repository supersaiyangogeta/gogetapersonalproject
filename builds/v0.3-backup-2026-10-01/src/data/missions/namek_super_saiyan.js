/*
 * CHAPTER 4 — NAMEK SAGA
 * Mission "The Legendary Super Saiyan" (canon, played as Goku).
 *
 * Canon beats: Piccolo is down. Frieza lifts Krillin into the air with his mind and closes
 * his hand. Goku breaks — the sky goes dark, the ground comes apart, lightning — and what
 * stands up is gold. He sends Gohan away with Piccolo. And then the fight is the other way
 * round: the emperor who has been toying with everybody all day cannot touch him.
 *
 * Phases: KRILLIN (checkpoint: scene `krillin_taken`) → AWAKEN (checkpoint: scene
 * `goku_super_saiyan`, the flagship) → REVERSAL (checkpoint: Super Saiyan Goku against a
 * Frieza who is shaken — the power shift is mechanical, not just a colour) → LEGEND (scene
 * `goku_legend`) → DESPERATION (checkpoint: Frieza throws everything, and it is still not
 * enough) → CORE (scene `namek_destruction`: he shoots the planet).
 *
 * The storm the transformation brings stays for the rest of the mission (stage mood and
 * lightning strikes, see stormHook). Krillin is gone and Piccolo is off the field from
 * here on; Frieza's tail stays cut and his body battered (the Spirit Bomb did that).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const REVERSAL_TARGET = 35; // percent of Frieza's health the first stretch takes
  const DESPERATION_FLOOR = 0.3; // he shoots the planet when it gets this bad

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
  /** What the Spirit Bomb left of him: half a tail and a battered body. */
  function battered(fz) {
    if (fz.model.cutTail) fz.model.cutTail(0.45);
    if (fz.model.setBattered) fz.model.setBattered(true);
  }
  /** Krillin gone, Piccolo and Gohan off the field. Every phase after the flash looks like this. */
  function afterKrillin(S) {
    S.krillin.setHidden(true);
    S.krillin.untargetable = true;
    S.krillin.alive = false;
    for (const f of [S.gohan, S.piccolo]) {
      f.setHidden(true);
      f.untargetable = true;
    }
  }
  /** Super Saiyan Goku, however the phase was reached. */
  function superSaiyan(m, g) {
    m.teach(g, 'form:ssj');
    if (g.lockedForms) delete g.lockedForms.ssj;
    const ssj = g.def.forms.findIndex((f) => f.id === 'ssj');
    if (g.formIndex !== ssj) g.applyForm(ssj);
  }
  /**
   * A boss who can no longer hold his footing: his poise is capped, so Super Saiyan hits break
   * through his armour and leave punish windows instead of bouncing off it.
   */
  function poiseCeiling(fz, frac) {
    return () => {
      const cap = fz.poise.max * frac;
      if (fz.poise.value > cap) fz.poise.value = cap;
    };
  }

  /** The storm the transformation brought: dark sky, lightning out on the plains. */
  function stormHook(m) {
    const b = m.battle;
    b.stage.setMood(0.55, 0x161428, 1);
    let n = 0;
    return () => {
      if (++n % 150 === 0 && SL.data.stormStrike) SL.data.stormStrike(b, FIELD, 35, 80);
    };
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 42);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 11))), startKi: 60 });
    // Super Saiyan is his only once the transformation scene hands it over (it deletes this lock)
    goku.lockedForms = { ssj: true };
    goku.lockedSlots = { transform: true };
    goku.formCaps = { kaioken: 4 };
    goku.hp = Math.round(goku.hpMax * 0.3);
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(3.2, 0, 9.5))), startKi: 30 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-1.8, 0, 12))), startKi: 30 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, FIELD.clone().add(new V3(2, 0, 6.5))), startKi: 10 });
    if (piccolo.lockedForms) delete piccolo.lockedForms.nail;
    piccolo.applyForm(1);
    for (const f of [krillin, gohan, piccolo]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.25);
    }
    // the Death Beam went through him: down, and alive
    piccolo.hp = Math.max(1, Math.round(piccolo.hpMax * 0.03));
    const cliff = SL.data.missions.namek_spirit_bomb.buildCliff(b);
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: cliff.pos.clone(), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    frieza.hp = Math.round(frieza.hpMax * 0.7); // the Spirit Bomb did do something
    battered(frieza);
    faceTo(goku, frieza.pos);
    faceTo(frieza, krillin.pos);
    b.story = { goku, krillin, gohan, piccolo, frieza, cliff };
  }

  const P = {};

  /* KRILLIN. Restartable here: everybody where the last mission left them. */
  P.krillin = {
    id: 'krillin',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [g, fz, S.krillin, S.gohan, S.piccolo]) f.controller = scripted();
      b.switchPlayer(g, { force: true });
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 11))), Math.PI);
      place(S.krillin, ground(b, FIELD.clone().add(new V3(3.2, 0, 9.5))));
      place(S.gohan, ground(b, FIELD.clone().add(new V3(-1.8, 0, 12))));
      place(S.piccolo, ground(b, FIELD.clone().add(new V3(2, 0, 6.5))));
      S.krillin.setHidden(false);
      S.krillin.alive = true;
      S.gohan.setHidden(false);
      S.piccolo.setHidden(false);
      fz.setHidden(false);
      fz.setPosition(S.cliff.pos.clone());
      battered(fz);
      faceTo(fz, S.krillin.pos);
      faceTo(g, fz.pos);
      faceTo(S.krillin, fz.pos);
      faceTo(S.gohan, fz.pos);
      S.piccolo.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      g.setState('scripted', { pose: 'idle', expression: 'hurt' });
      yield* SL.Cinema.play(m, 'krillin_taken');
    },
  };

  /* THE FLAGSHIP. Restartable here. */
  P.awaken = {
    id: 'awaken',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      S.krillin.setHidden(true);
      S.krillin.untargetable = true;
      S.krillin.alive = false;
      S.gohan.setHidden(false);
      S.piccolo.setHidden(false);
      S.piccolo.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      // he comes down off the rock to look at what he has done
      place(fz, ground(b, FIELD.clone().add(new V3(-4, 0, -2))));
      battered(fz);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 9))));
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      if (g.formIndex !== 0) g.applyForm(0);
      yield* SL.Cinema.play(m, 'goku_super_saiyan');
      afterKrillin(S);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      yield* SL.Cinema.play(m, 'goku_pays_for_that');
    },
  };

  /*
   * THE REVERSAL. He is faster than Frieza now, and it is mechanical: Frieza's ordinary
   * attacks are simply not there when they arrive (storyEvade), his speed does not slip
   * Goku's hits (storySpeed), Goku hits harder than he has all day, and Frieza's AI is in
   * its 'shaken' phase — backing off, throwing from range, short bursts and long breaths.
   */
  P.reversal = {
    id: 'reversal',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      afterKrillin(S);
      b.switchPlayer(g, { force: true });
      superSaiyan(m, g);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 7))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.7));
      g.ki = Math.max(g.ki, 90);
      g.cannotDie = true;
      g.damageDealtMul = 1.45;
      g.storySpeed = true;
      g.storyEvade = { chance: 0.55, gap: 22, from: [fz] };
      fz.applyForm(3);
      fz.mech.phase = 3;
      fz.bossPhaseCap = 3;
      fz.hp = Math.max(fz.hp, Math.round(fz.hpMax * 0.7));
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = false;
      battered(fz);
      fz.damageDealtMul = 0.45;
      fz.damageTakenMul = 1.5;
      fz.aiPhase = 'shaken';
      fz.barkOverrides = { taunt: 'frieza_shaken' };
      fz.aiRhythm = { burst: 2, rest: 110 };
      // the player's own difficulty, not 'hard': an outclassed emperor does not get faster
      // reflexes than every other Frieza in the story (owner's Frieza fairness pass)
      fz.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: { aggression: 0.7, defense: 0.45, preferredRange: 7, hooks: 'frieza', comboLen: 2 } });
      fz.target = g;
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 5);
      const storm = stormHook(m);
      m.tickHooks.push(storm);
      const poise = poiseCeiling(fz, 0.55);
      m.tickHooks.push(poise);
      m.objective('reverse', 'Show him the difference', { icon: 'fist', target: REVERSAL_TARGET });
      m.objective('untouched', 'Take no more than three of his hits', { icon: 'guard', optional: true });
      let taken = 0, slipped = 0;
      b.on('damage', (e) => {
        if (e.target !== g || e.attacker !== fz) return;
        taken++;
        if (taken === 4) m.failObjective('untouched');
      });
      b.on('storyEvade', (e) => {
        if (e.fighter !== g) return;
        slipped++;
        if (slipped === 1) m.say('frieza', 'Where — ?! Where did he go?!', 1.8);
        if (slipped === 4) m.say('frieza', 'Stand STILL, you — !', 1.6);
      });
      const start = fz.hp;
      const hook = () => {
        if (b.inputLocked) return;
        const pct = Math.round(((start - fz.hp) / fz.hpMax) * 100);
        m.progress('reverse', U.clamp(pct, 0, REVERSAL_TARGET));
      };
      m.tickHooks.push(hook);
      yield () => start - fz.hp >= fz.hpMax * (REVERSAL_TARGET / 100) || !g.alive;
      for (const h of [hook, storm, poise]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      if (!g.alive) return;
      m.complete('reverse');
      if (taken <= 3) m.complete('untouched');
      m.flags.reversalTaken = taken;
      m.flags.reversalSlipped = slipped;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.legend = {
    id: 'legend',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      clearCombat(b);
      // entered directly (a skip, a restart): the field still looks like it does after Krillin
      afterKrillin(S);
      superSaiyan(m, g);
      battered(fz);
      for (const f of [g, fz]) f.controller = scripted();
      place(g, ground(b, fz.pos.clone().addScaledVector(fz.forward, 7)));
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      yield* SL.Cinema.play(m, 'goku_legend');
    },
  };

  /* DESPERATION: everything he has, as fast as he can throw it. Restartable here. */
  P.desperation = {
    id: 'desperation',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      afterKrillin(S);
      b.switchPlayer(g, { force: true });
      superSaiyan(m, g);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.6));
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true;
      g.damageDealtMul = 1.35;
      g.storySpeed = true;
      g.storyEvade = { chance: 0.4, gap: 26, from: [fz] };
      fz.applyForm(3);
      fz.mech.phase = 3;
      fz.bossPhaseCap = 3;
      fz.hp = Math.min(fz.hp, Math.round(fz.hpMax * 0.45));
      fz.hp = Math.max(fz.hp, Math.round(fz.hpMax * 0.4));
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = false;
      battered(fz);
      fz.damageDealtMul = 0.7;
      fz.damageTakenMul = 1.3;
      fz.aiPhase = 'shaken';
      fz.barkOverrides = { taunt: 'frieza_shaken' };
      fz.aiRhythm = { burst: 3, rest: 70 };
      fz.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: { aggression: 1, defense: 0.2, ranged: 0.9, beam: 0.8, preferredRange: 6, hooks: 'frieza', comboLen: 2 } });
      fz.target = g;
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      const storm = stormHook(m);
      m.tickHooks.push(storm);
      const poise = poiseCeiling(fz, 0.7);
      m.tickHooks.push(poise);
      m.objective('break', 'Break him', { icon: 'fist', target: 100 });
      m.objective('noBall', 'Never let a Death Ball land', { icon: 'guard', optional: true });
      let balls = 0;
      b.on('damage', (e) => {
        if (e.target === g && e.source === 'Death Ball') {
          balls++;
          if (balls === 1) m.failObjective('noBall');
        }
      });
      const start = fz.hp, floor = fz.hpMax * DESPERATION_FLOOR;
      const hook = () => {
        if (b.inputLocked) return;
        m.progress('break', Math.round(U.clamp01((start - fz.hp) / Math.max(1, start - floor)) * 100));
      };
      m.tickHooks.push(hook);
      yield () => fz.hp <= floor || !g.alive;
      for (const h of [hook, storm, poise]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      g.storyEvade = null;
      if (!g.alive) return;
      m.complete('break');
      if (!balls) m.complete('noBall');
      m.flags.deathBalls = balls;
      m.flags.friezaBroken = true;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.core = {
    id: 'core',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.clearObjectives();
      clearCombat(b);
      afterKrillin(S);
      superSaiyan(m, g);
      battered(fz);
      for (const f of [g, fz]) f.controller = scripted();
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      yield* SL.Cinema.play(m, 'namek_destruction');
      m.lock(true);
      m.shot((t, out) => camAt(out, g.chest().clone().add(new V3(5, 3.6, 8)), g.chest().clone().add(new V3(0, 0, -16)), U.lerp(52, 60, t)), 3, { cut: true, blendIn: 0 });
      yield* m.cine(3);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE LEGENDARY SUPER SAIYAN', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_super_saiyan',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Legendary Super Saiyan',
    subtitle: 'Namek · Krillin, the storm, and the other way round',
    character: 'goku',
    stage: 'namek',
    parTime: 480,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Frieza takes Krillin in front of him. What stands up afterwards is gold — and for the first time all day, the emperor is the one who cannot keep up.',
    rewards: ['Super Saiyan (story)', 'Chapter 4 continues'],
    setup,
    phases: [P.krillin, P.awaken, P.reversal, P.legend, P.desperation, P.core],
  };

  SL.data.missions[def.id] = def;
})();
