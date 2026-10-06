/*
 * CHAPTER 4 — NAMEK SAGA
 * Mission "Five Minutes" (canon, played as Goku).
 *
 * Canon beats: the planet has minutes left, and the fight moves onto what is left of it —
 * a separate place now (stage 'namek_ruin': lava where the water was, a burning sky).
 * Frieza goes to one hundred percent. The fight tears Goku's gi off him. And only then, on
 * the dying planet, against 100% Frieza, with the gi gone, Frieza says the thing about
 * Krillin — and Goku answers it.
 *
 * Phases: DYING (scene `namek_dying`) → HUNDRED (checkpoint: scene `frieza_full_power`)
 * → FULL (checkpoint: the 100% fight, on ground that erupts under both of them; the gi is
 * torn in it, on screen, when the fight earns it) → KRILLIN (scene `frieza_krillin_line`:
 * gated on the destroyed planet, 100% Frieza and the torn gi) → FINISH (checkpoint: the
 * fight that breaks him) → SAUCERS (checkpoint: his Death Saucers, played — lead one back
 * over him and it cuts him in half) → MERCY (checkpoint: he begs, and Goku gives him the
 * energy to leave) → BETRAYAL (checkpoint: he fires at Goku's back, and the answer is a
 * one-handed Kamehameha thrown in anger) → ESCAPE (checkpoint) → AFTER.
 *
 * CANON CONTINUITY: Frieza is never killed here. Chapter 5 opens with him arriving at Earth
 * in a rebuilt body, so every beat past the saucers leaves him broken, buried and alive.
 *
 * The eruptions are real hazards that hit whoever is standing on them, Frieza included.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const FULL_SECONDS = 40;
  const SAUCER_SECONDS = 22;
  // the gi goes when the fight has hurt him or gone on long enough — never in the first seconds
  const TEAR_AT = { hpFrac: 0.55, seconds: 18, minSeconds: 8 };
  const ESCAPE_SECONDS = 30;

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

  /**
   * WHAT IS LEFT OF THE FIELD. The dying planet is not the green field with a red filter on
   * it: the ground is cratered, broken slabs stand where the rock towers were, and vents burn
   * along the horizon. Built once in setup from the stage's own pieces (craters, toon meshes,
   * an ambience hook), so it costs nothing per frame beyond the smoke.
   */
  function dressRuin(b) {
    const S = b.stage;
    const rand = (n) => (Math.random() - 0.5) * n;
    // craters, dug with the stage's own tool so the terrain really is deformed
    if (S.crater) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + rand(0.7), r = 14 + Math.random() * 34;
        const at = FIELD.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
        at.y = S.heightAt(at.x, at.z);
        S.crater(at, 5 + Math.random() * 7, 0.8 + Math.random() * 0.8);
      }
    }
    // broken slabs: what the rock towers came down as
    const group = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, r = 16 + Math.random() * 46;
      const at = FIELD.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
      at.y = S.heightAt(at.x, at.z);
      const w = 1.4 + Math.random() * 3.4, h = 2 + Math.random() * 6;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.7), SL.Toon.mat(i % 3 ? 0x4a3026 : 0x3a241c));
      SL.Toon.addOutline(slab, 1.2);
      slab.position.copy(at).add(new V3(0, h * 0.3, 0));
      slab.rotation.set(rand(1.1), Math.random() * Math.PI, rand(1.1));
      group.add(slab);
    }
    S.scene.add(group);
    // vents: smoke on the horizon, and the odd flare out where the ground has already gone
    const vents = [];
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2, r = 46 + Math.random() * 60;
      const at = FIELD.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
      at.y = S.heightAt(at.x, at.z);
      vents.push(at);
    }
    let n = 0;
    const ambience = () => {
      n++;
      if (n % 26 === 0) {
        const at = vents[(n / 26) % vents.length | 0];
        b.vfx.dust(at.clone().add(new V3(0, 1.5, 0)), 4.5, 5, 0x4a3a34);
      }
      if (n % 150 === 0) {
        const at = vents[Math.floor(Math.random() * vents.length)];
        b.vfx.explosion(at.clone().add(new V3(0, 2, 0)), 9, 0xff8a4a, { smoke: true });
      }
    };
    S.ambient.push(ambience);
    if (b.mission) {
      b.mission.onDispose(() => {
        S.scene.remove(group);
        const i = S.ambient.indexOf(ambience);
        if (i >= 0) S.ambient.splice(i, 1);
      });
    }
    return group;
  }

  function battered(fz) {
    if (fz.model.cutTail) fz.model.cutTail(0.45);
    if (fz.model.setBattered) fz.model.setBattered(true);
  }
  function superSaiyan(g) {
    const ssj = g.def.forms.findIndex((f) => f.id === 'ssj');
    if (ssj > 0 && g.formIndex !== ssj) {
      if (g.lockedForms) delete g.lockedForms.ssj;
      g.applyForm(ssj);
    }
  }
  /** Frieza at one hundred percent, however the phase was reached. */
  function fullPower(fz) {
    const i = fz.def.forms.findIndex((f) => f.id === 'full');
    if (i > 0 && fz.formIndex !== i) fz.applyForm(i);
    fz.mech.phase = 3;
    fz.bossPhaseCap = 3;
    fz.aiPhase = 'full';
    fz.aiRhythm = { burst: 4, rest: 45 };
    fz.barkOverrides = { taunt: 'frieza_full_taunt' };
    battered(fz);
  }

  /**
   * One eruption: a warning ring, then a column that hurts whoever is standing
   * in it — the player and Frieza alike. Returns a tick hook.
   */
  function eruptions(m, opts = {}) {
    const b = m.battle;
    const every = opts.every || 150;
    const radius = opts.radius || 3.2;
    const damage = opts.damage || 900;
    const warn = opts.warn || 42;
    const pending = [];
    let n = 0;
    return () => {
      if (b.inputLocked) return;
      n++;
      if (n % every === 0) {
        // aim near somebody, so it is a threat rather than scenery
        const who = b.fighters.filter((f) => f.alive && !f.hidden);
        const t = who[Math.floor(Math.random() * who.length)];
        if (t) {
          const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 6;
          const at = t.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
          if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
          pending.push({ at, t: warn });
          b.vfx.ring(at.clone().add(new V3(0, 0.2, 0)), radius, 0xff8a4a, 0.7, new V3(0, 1, 0));
          b.vfx.dust(at, radius * 0.7, 8);
        }
      }
      for (let i = pending.length - 1; i >= 0; i--) {
        const p = pending[i];
        if (--p.t > 0) {
          if (p.t % 8 === 0) b.vfx.dust(p.at, radius * 0.5, 4);
          continue;
        }
        pending.splice(i, 1);
        b.vfx.explosion(p.at.clone().add(new V3(0, 1.4, 0)), radius * 1.6, 0xff9a5a, { smoke: true });
        b.vfx.ring(p.at.clone().add(new V3(0, 0.3, 0)), radius * 2, 0xffc08a, 0.8, new V3(0, 1, 0));
        b.cameraTraumaAt(p.at, 0.5);
        b.sfx('explosionBig', null, { at: p.at, vol: 0.9, pitch: 0.75 });
        for (const f of b.fighters) {
          if (!f.alive || f.hidden) continue;
          if (f.pos.distanceTo(p.at) > radius + f.radius) continue;
          if (!f.grounded) continue; // in the air is the safe place, and that is the lesson
          f.takeHit(null, {
            type: 'explosion',
            damage,
            knock: 'launch',
            knockSpeed: 22,
            hitstun: 26,
            impact: 3,
            dir: new V3(0, 1, 0),
            point: p.at.clone(),
            name: 'Eruption',
          });
        }
        m.flags.eruptions = (m.flags.eruptions || 0) + 1;
      }
    };
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 46);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 9))), startKi: 90 });
    goku.lockedForms = {}; // he has everything by now
    goku.formCaps = { kaioken: 4 }; // by now the Kaioken has nothing left to hold back
    const ssj = goku.def.forms.findIndex((f) => f.id === 'ssj');
    if (ssj > 0) goku.applyForm(ssj);
    // the gi is still on him: the 100% fight is what tears it (see P.full)
    goku.hp = Math.round(goku.hpMax * 0.6);
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-9, 0, 14))), startKi: 40 });
    gohan.controller = scripted();
    gohan.untargetable = true;
    gohan.cannotDie = true;
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -9))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    frieza.hp = Math.round(frieza.hpMax * 0.45);
    battered(frieza);
    dressRuin(b);
    faceTo(goku, frieza.pos);
    faceTo(frieza, goku.pos);
    b.story = { goku, gohan, frieza };
  }

  const P = {};

  P.dying = {
    id: 'dying',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [S.goku, S.frieza]) f.controller = scripted();
      place(S.goku, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(S.frieza, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      faceTo(S.goku, S.frieza.pos);
      faceTo(S.frieza, S.goku.pos);
      yield* SL.Cinema.play(m, 'namek_dying');
    },
  };

  /* ONE HUNDRED PERCENT. Restartable here. */
  P.hundred = {
    id: 'hundred',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      b.switchPlayer(g, { force: true });
      superSaiyan(g);
      g.setTorn(false);
      m.flags.giTorn = false;
      if (fz.formIndex !== 3) fz.applyForm(3);
      battered(fz);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      b.stage.setMood(0.25, 0x4a1810, 1);
      m.music('finale', 4);
      yield* SL.Cinema.play(m, 'frieza_full_power');
    },
  };

  /*
   * THE 100% FIGHT, on a planet coming apart. The gi goes in it, on screen, when the fight
   * earns it (health, or time) — not before, and not in a menu.
   */
  P.full = {
    id: 'full',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      superSaiyan(g);
      g.setTorn(false); // restarting here: the gi is whole again until the fight takes it
      m.flags.giTorn = false;
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.8));
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true;
      fullPower(fz);
      fz.hp = Math.max(fz.hp, Math.round(fz.hpMax * 0.6));
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = true;
      fz.damageDealtMul = 0.5; // the form itself hits twice as hard as final form did
      fz.damageTakenMul = 0.85;
      fz.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 1, defense: 0.3, preferredRange: 4, hooks: 'frieza' } });
      fz.target = g;
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      b.stage.setMood(0.28, 0x4a1810, 2);
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('full', 'Stand against one hundred percent', { icon: 'clock', target: FULL_SECONDS });
      m.objective('footing', 'Never be caught by an eruption', { icon: 'guard', optional: true });
      let caught = 0;
      b.on('damage', (e) => {
        if (e.target !== g || e.source !== 'Eruption') return;
        caught++;
        if (caught === 1) m.failObjective('footing');
      });
      m.prompt('erupt', 'up', 'The ground is opening — get off it', {
        required: true,
        always: true,
        when: () => g.grounded && (m.flags.eruptions || 0) > 0,
        until: () => !g.grounded,
      });
      const erupt = eruptions(m, { every: 150, radius: 3.4, damage: 800 });
      m.tickHooks.push(erupt);
      let t = 0, tear = false;
      const clock = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('full', Math.min(FULL_SECONDS, Math.floor(t)));
        if (!m.flags.giTorn && t >= TEAR_AT.minSeconds && (g.hpFrac <= TEAR_AT.hpFrac || t >= TEAR_AT.seconds)) tear = true;
      };
      m.tickHooks.push(clock);
      // THE GI: a beat of its own, in the middle of the fight
      yield () => tear || !g.alive;
      if (!g.alive) return;
      yield* tearGi(m, S);
      yield () => t >= FULL_SECONDS || !g.alive;
      for (const h of [erupt, clock]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      if (!g.alive) return;
      m.complete('full');
      if (!caught) m.complete('footing');
      m.flags.caughtByGround = caught;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  /** The hit that takes the gi: slow, close, and then straight back into the fight. */
  function* tearGi(m, S) {
    const b = m.battle, g = S.goku, fz = S.frieza;
    m.lock(true);
    clearCombat(b);
    for (const f of [g, fz]) f.vel.set(0, 0, 0);
    faceTo(fz, g.pos);
    faceTo(g, fz.pos);
    g.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
    fz.setState('scripted', { pose: 'lieBack', expression: 'shout' });
    const c = g.chest();
    b.vfx.explosion(c, 3.6, 0xff6a8a, { smoke: true });
    b.vfx.debrisBurst(c, 14, 0xf08a2a, 10, 0.2);
    b.sfx('explosionBig', g, { vol: 1.1, pitch: 1.1 });
    b.cameraTraumaAt(c, 0.8);
    g.setTorn(true);
    m.flags.giTorn = true;
    b.emit('giTorn', { fighter: g });
    m.shot((t, out) => {
      const h = g.chest();
      camAt(out, h.clone().addScaledVector(g.forward, U.lerp(2.4, 1.8, t)).add(new V3(0.8, 0.3, 0)), h, 38);
    }, 2.6, { cut: true, blendIn: 0 });
    yield* m.cine(1.2);
    g.setState('scripted', { pose: 'idle', expression: 'angry' });
    m.say('frieza', 'Look at you. Your clothes are coming apart faster than you are.', 2.6);
    yield* m.cine(1.4);
    m.endShot();
    g.setState('free');
    fz.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  /*
   * THE LINE. Only here: the destroyed planet, Frieza at 100%, and the gi already gone.
   * If a skip or a restart ever reached this without the tear, the tear is made first.
   */
  P.krillin = {
    id: 'krillin',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      superSaiyan(g);
      fullPower(fz);
      if (!m.flags.giTorn) {
        g.setTorn(true);
        m.flags.giTorn = true;
      }
      place(g, ground(b, fz.pos.clone().addScaledVector(fz.forward, 7)));
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      m.flags.krillinLineAt = { stage: b.stage.def ? b.stage.def.id : null, friezaForm: fz.form.id, torn: !!(g.model && g.model._torn) };
      yield* SL.Cinema.play(m, 'frieza_krillin_line');
    },
  };

  P.finish = {
    id: 'finish',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      const ssj = g.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && g.formIndex !== ssj) {
        if (g.lockedForms) delete g.lockedForms.ssj;
        g.applyForm(ssj);
      }
      g.setTorn(true);
      m.flags.giTorn = true;
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 7))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.45));
      g.ki = Math.max(g.ki, 70);
      g.cannotDie = true;
      fullPower(fz);
      fz.barkOverrides = { taunt: 'frieza_shaken' }; // after the line, he is the one losing
      fz.hp = Math.round(fz.hpMax * 0.18);
      fz.poise.value = fz.poise.max;
      // he is broken here, never killed: what finishes this fight is his own saucer
      fz.cannotDie = true;
      fz.infiniteHp = false;
      // 100% is burning him out: everything he throws, and less behind each one
      fz.damageDealtMul = 0.55;
      fz.damageTakenMul = 1.1;
      fz.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 1, defense: 0.1, ranged: 0.85, beam: 0.8, preferredRange: 5, hooks: 'frieza' } });
      fz.target = g;
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('finish', 'Break him', { icon: 'fist', target: 100 });
      m.objective('standing', 'Finish it without being knocked down', { icon: 'guard', optional: true });
      let downed = false;
      b.on('knockdown', (e) => {
        if (e.fighter !== g || downed) return;
        downed = true;
        m.failObjective('standing');
      });
      // the ground keeps opening while it happens: the planet does not wait
      const erupt = eruptions(m, { every: 190, radius: 3.6, damage: 700 });
      m.tickHooks.push(erupt);
      const start = fz.hp, floor = fz.hpMax * 0.12;
      const hook = () => {
        if (b.inputLocked) return;
        m.progress('finish', Math.round(U.clamp01((start - fz.hp) / Math.max(1, start - floor)) * 100));
      };
      m.tickHooks.push(hook);
      yield () => fz.hp <= floor || !g.alive;
      for (const h of [erupt, hook]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      if (!g.alive) return;
      m.complete('finish');
      if (!downed) m.complete('standing');
      m.flags.friezaDown = fz.hp <= fz.hpMax * 0.13;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.6;
    },
  };

  /*
   * THE DEATH SAUCERS — played, not watched. He throws discs that chase, and the canon answer
   * is the engine's own rule: a saucer that has been chasing long enough (`turnFrames`) stops
   * caring whose side it is on. Lead one back over him and it cuts him in half. If the player
   * never manages it, the story still arrives: the last pair is sent loose at him.
   */
  P.saucers = {
    id: 'saucers',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      superSaiyan(g);
      g.setTorn(true);
      m.flags.giTorn = true;
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 10)), 2), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.5));
      g.ki = Math.max(g.ki, 70);
      g.cannotDie = true;
      fullPower(fz);
      fz.hp = Math.max(1, Math.round(fz.hpMax * 0.12));
      fz.cannotDie = true; // he is cut by his own saucer, not beaten to death
      fz.infiniteHp = false;
      fz.untargetable = false;
      fz.damageDealtMul = 0.5;
      fz.barkOverrides = { taunt: 'frieza_shaken' };
      // a controller with one idea in it: throw saucers, and keep his distance between throws
      const spec = fz.specFor('special1');
      fz.target = g;
      g.target = fz;
      let cool = 60;
      fz.controller = {
        update: (f) => {
          const it = SL.emptyIntent();
          if (f.state !== 'free') return it;
          if (--cool <= 0 && SL.Techniques.deathSaucer) {
            cool = 210;
            f.ki = Math.max(f.ki, spec.kiCost + 10);
            f.cooldowns.special1 = 0;
            SL.Techniques.deathSaucer.start(f, spec, 'special1', spec.kiCost);
            return it;
          }
          const d = f.distTo(g);
          if (d < 11) it.my = -1;
          else if (d > 17) it.my = 1;
          return it;
        },
      };
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('survive', 'Stay ahead of the saucers', { icon: 'clock', target: SAUCER_SECONDS });
      m.objective('lead', 'Lead one back over him', { icon: 'guard', optional: true });
      let loose = 0, cut = false, hitByDisc = 0;
      b.on('deathSaucerLoose', () => {
        loose++;
        if (loose === 1) m.say('goku', 'They stopped chasing me. They do not care whose side they are on any more.', 3.4, { style: 'quiet' });
      });
      b.on('damage', (e) => {
        if (e.target === g && e.type === 'ki') hitByDisc++;
        // a loose disc found its owner: his own ki, not Goku's and not the ground erupting under
        // him (an eruption, attacker null, used to end the phase and play the saucer cut anyway)
        if (e.target === fz && e.attacker === fz && e.type === 'ki') cut = true;
      });
      m.prompt('sauDodge', 'dodge', 'They follow — keep moving, and put him between you and them', {
        always: true,
        when: () => b.projectiles.list.some((p) => p.kind === 'disc' && p.alive),
        until: () => false,
      });
      const erupt = eruptions(m, { every: 220, radius: 3.4, damage: 600 });
      m.tickHooks.push(erupt);
      let t = 0;
      const clock = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('survive', Math.min(SAUCER_SECONDS, Math.floor(t)));
        // the story does not depend on the player pulling it off: past the clock, the pair he
        // has in the air turns on him
        if (t > SAUCER_SECONDS && !cut) {
          for (const p of b.projectiles.list) {
            if (!p.alive || p.kind !== 'disc' || p.loose) continue;
            p.loose = true;
            p.team = -1;
            p.target = fz;
            p.vel.copy(fz.chest().sub(p.pos).normalize().multiplyScalar(p.speed || 34));
            b.emit('deathSaucerLoose', { fighter: fz, projectile: p });
          }
        }
      };
      m.tickHooks.push(clock);
      yield () => cut || !g.alive || t > SAUCER_SECONDS + 12;
      for (const h of [erupt, clock]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      if (!g.alive) return;
      m.complete('survive');
      if (cut) m.complete('lead');
      else m.failObjective('lead');
      m.flags.saucerSeconds = Math.round(t);
      m.flags.discHits = hitByDisc;
      m.qteParts.push(U.clamp01(1 - hitByDisc * 0.15));
      // the cut itself
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      place(fz, ground(b, fz.pos.clone()));
      place(g, ground(b, fz.pos.clone().add(new V3(0, 0, 7))));
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      yield* SL.Cinema.play(m, 'frieza_saucer_cut');
    },
  };

  /* THE MERCY. Restartable here. */
  P.mercy = {
    id: 'mercy',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      superSaiyan(g);
      g.setTorn(true);
      m.flags.giTorn = true;
      fullPower(fz);
      if (fz.model.setHalved) fz.model.setHalved(true);
      fz.auraOff = true;
      if (fz.model.setBattered) fz.model.setBattered(true);
      fz.cannotDie = true;
      fz.untargetable = true;
      fz.hp = Math.max(1, Math.round(fz.hpMax * 0.04));
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 0))), Math.PI);
      faceTo(g, fz.pos);
      fz.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      fz.auraOff = true;
      g.setState('scripted', { pose: 'idle', expression: 'angry' });
      b.stage.setMood(0.3, 0x5a1c10, 1.2);
      yield* SL.Cinema.play(m, 'goku_spares_frieza');
    },
  };

  /*
   * THE BETRAYAL AND THE ANSWER. He fires at the man who spared him; Goku turns and puts
   * everything he has left into one hand. The push is the player's — and whatever it scores,
   * Frieza is left broken and ALIVE (Chapter 5 is him arriving at Earth).
   */

  /**
   * THE MANGA VERSION of the betrayal (Settings -> Gameplay -> "Namek Ending Cut").
   * Same events, different film: Goku turns to leave and only yells; the shot is taken from
   * behind Frieza's outstretched hand; then it rides the beam up at him in slow motion; the
   * answer is a one-handed Kamehameha over the shoulder, white inside gold, filmed slowly from
   * three angles; and it ends on Goku looking down at what is left of him.
   * The push is still the player's - the struggle is the one the classic cut uses.
   */
  function* mangaBetrayal(m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
    const hand = () => fz.handPos('R');
    const gChest = () => g.chest();
    const side = () => new V3(-(g.pos.z - fz.pos.z), 0, g.pos.x - fz.pos.x).normalize();
    const away = Math.atan2(g.pos.x - fz.pos.x, g.pos.z - fz.pos.z); // the way out, back turned

    // 1 - he is leaving. There is nothing else to do here.
    g.yaw = g.prevYaw = away;
    g.setState('scripted', { pose: 'flyIdle', expression: 'calm' });
    fz.setState('scripted', { pose: 'lieBack', expression: 'angry' });
    m.music('finale', 2);
    m.shot((t, out) => {
      const c = gChest();
      camAt(out, c.clone().addScaledVector(g.forward, U.lerp(-7, -9, t)).add(new V3(0, U.lerp(1.4, 2.6, t), 0)), c, U.lerp(44, 48, t));
    }, 3.4, { cut: true, blendIn: 0, hold: true });
    m.say('frieza', 'I am... the emperor of the universe...', 3.2, { style: 'quiet' });
    yield* m.cine(3.4);

    // 2 - and then he just yells. No line: the yell is the line.
    g.setState('scripted', { pose: 'g_ssjRage', expression: 'shout' });
    b.sfx('powerUp', g, { vol: 1.4, pitch: 1.05 });
    b.bark(g, 'effort', true);
    b.vfx.ring(gChest(), 7, 0xfff0a0, 0.5, new V3(0, 1, 0));
    b.cameraTraumaAt(gChest(), 0.5);
    m.shot((t, out) => {
      const c = gChest().add(new V3(0, 0.35, 0));
      camAt(out, c.clone().addScaledVector(g.forward, U.lerp(-2.6, -2.1, t)).addScaledVector(side(), 0.8).add(new V3(0, 0.15, 0)), c, U.lerp(40, 34, t));
    }, 2.2, { cut: true, blendIn: 0, hold: true });
    yield* m.cine(2.2);

    // 3 - from behind his hand: the emperor's own shot
    fz.setState('scripted', { pose: 'fz_aim', expression: 'shout' });
    faceTo(fz, g.pos);
    m.shot((t, out) => {
      const h = hand();
      const back = fz.pos.clone().sub(g.pos).setY(0).normalize();
      camAt(out, h.clone().addScaledVector(back, U.lerp(1.9, 1.5, t)).add(new V3(0, 0.12, 0)), gChest(), U.lerp(32, 28, t));
    }, 2.6, { cut: true, blendIn: 0, hold: true });
    b.vfx.streamInward(hand(), 2.2, 0xc060ff, 10, 0.16, 0.5);
    b.sfx('kiCharge', fz, { vol: 1.1, pitch: 0.7 });
    m.say('frieza', 'That is why - YOU MUST DIE BY MY HAND!', 2.4, { style: 'shout' });
    yield* m.cine(2.6);
    const from = hand();
    for (let i = 0; i <= 20; i++) b.vfx.trail(from.clone().lerp(gChest(), i / 20), i % 3 ? 0xc060ff : 0xf0e0ff, 1.1, 0.5);
    b.vfx.flash(from, 5, 0xe8d0ff, 0.45, SL.Toon.tex.glow);
    b.sfx('beamFire', fz, { vol: 1.3, pitch: 0.8 });
    SL.ScreenFX.flash(0.3, '#e8d0ff');
    m.flags.mangaFriezaPov = true;

    /*
     * 4 - riding it up at him, slowed down. The shot never lands: it is still on its way while
     * he turns, and the answer goes out to meet it. `crawl` is how far up the beam has come.
     */
    b.slowmo(0.22, 4.6);
    const lane = gChest().clone().sub(from);
    let crawl = 0;
    const creep = () => {
      crawl = Math.min(0.72, crawl + 0.0042); // it never reaches him
      const head = from.clone().addScaledVector(lane, crawl);
      if (b.frame % 2 === 0) b.vfx.trail(head, 0xc060ff, 0.95, 0.28);
    };
    m.tickHooks.push(creep);
    const beamHead = () => from.clone().addScaledVector(lane, crawl);
    m.shot((t, out) => camAt(out, beamHead(), gChest().add(new V3(0, 0.45, 0)), U.lerp(48, 38, t)), 1.6, { cut: true, blendIn: 0, hold: true });
    m.flags.mangaBeamPov = true;
    yield* m.cine(1.5);

    /*
     * 5 - the answer. No flinch and no sad face here: he turns slowly, already in the stance,
     * and fires straight out of the turn while the beam is still climbing.
     */
    const turnFrom = g.yaw, turnTo = Math.atan2(fz.pos.x - g.pos.x, fz.pos.z - g.pos.z);
    let turn = 0;
    const turning = () => {
      turn = Math.min(1, turn + 1 / 70);
      g.yaw = g.prevYaw = turnFrom + U.wrapAngle(turnTo - turnFrom) * U.easeInOutCubic(turn);
    };
    m.tickHooks.push(turning);
    g.setState('scripted', { pose: 'g_angryKame', expression: 'shout' });
    b.vfx.streamInward(g.handPos('R'), 2.6, 0xfff6c0, 10, 0.12, 0.4);
    b.sfx('kiCharge', g, { vol: 1.2, pitch: 1.1 });
    m.shot((t, out) => {
      const c = gChest().add(new V3(0, 0.3, 0));
      camAt(out, c.clone().addScaledVector(side(), U.lerp(3, 2.2, t)).addScaledVector(g.forward, -1.1).add(new V3(0, 0.5, 0)), c, U.lerp(42, 36, t));
    }, 1.8, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'YOU FOOL!!', 1.8, { style: 'shout' });
    yield* m.cine(1.6);
    m.tickHooks.splice(m.tickHooks.indexOf(turning), 1);
    faceTo(g, fz.pos);
    m.flags.mangaFiredOnTurn = true;

    // the wave itself: white inside, gold outside
    const spec = Object.assign({}, g.def.specials.special1, {
      range: 60, sustain: 999, damage: [0, 0], radius: [0.85, 1.05],
      color: 0xffd23a, core: 0xffffff,
    });
    const beam = b.projectiles.spawnBeam(g, spec, 1);
    beam.hitSet.add(fz);
    b.sfx('beamFire', g, { vol: 1.5, pitch: 0.75 });
    b.vfx.flash(g.handPos('R'), 6, 0xffffff, 0.5, SL.Toon.tex.glow);
    m.say('goku', 'KA-ME-HA-ME-HAAAA!', 2.6, { style: 'shout' });
    // it goes through the shot that was still on its way: the purple one ends here
    m.tickHooks.splice(m.tickHooks.indexOf(creep), 1);
    const meet = beamHead();
    b.vfx.flash(meet, 5, 0xfff0ff, 0.35, SL.Toon.tex.glow);
    b.vfx.sparks(meet, 0xc060ff, 14, 12);
    b.cameraTraumaAt(meet, 0.35);
    m.flags.mangaBeamEaten = true;
    const onFrieza = () => fz.chest().add(new V3(0, 0.2, 0));
    const hold = () => {
      beam.headOverride = onFrieza();
      if (b.frame % 2 === 0) b.vfx.sparks(onFrieza(), 0xfff6c0, 6, 14, 0.14);
      b.cameraTraumaAt(onFrieza(), 0.05);
    };
    m.tickHooks.push(hold);
    m.shot((t, out) => {
      const mid = gChest().lerp(fz.chest(), 0.5);
      camAt(out, mid.clone().addScaledVector(side(), U.lerp(11, 8.5, t)).add(new V3(0, 2.2, 0)), mid, U.lerp(48, 44, t));
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const res = yield* m.struggle({
      start: 0.55,
      drain: 0.26,
      duration: 4,
      label: 'EVERYTHING HE HAS LEFT',
      canFail: false,
      onTick: (t, grip) => {
        fz.setState('scripted', { pose: 'fz_brace', expression: 'shout' });
        if (b.frame % 6 === 0) b.vfx.dust(fz.pos, 2.2 + (1 - grip) * 2, 6);
      },
    });
    m.flags.angryKameAvg = Math.round(res.avg * 100) / 100;
    m.qteParts.push(U.clamp01(res.avg * 1.4));
    m.tickHooks.splice(m.tickHooks.indexOf(hold), 1);
    beam.headOverride = null;
    beam.stop();
    b.vfx.explosion(onFrieza(), 12, 0xffe066, { smoke: true });
    b.vfx.ring(fz.pos.clone().add(new V3(0, 0.3, 0)), 18, 0xfff0a0, 0.9, new V3(0, 1, 0));
    b.cameraTraumaAt(fz.pos, 1);
    b.sfx('explosionHuge', null, { vol: 1.3, pitch: 0.7 });
    SL.ScreenFX.flash(0.55, '#fff4c0');
    if (b.stage.crater) b.stage.crater(fz.pos, 8, 1.2);
    yield 1.2;

    // 6 - the last image: he comes down to where he left him, and looks at him
    const standAt = fz.pos.clone().addScaledVector(fz.pos.clone().sub(g.pos).setY(0).normalize(), -4.2);
    place(g, ground(b, standAt));
    // and only now, standing over what he thinks he has just killed, the face changes
    g.setState('scripted', { pose: 'g_lookDown', expression: 'sad' });
    faceTo(g, fz.pos);
    fz.setState('scripted', { pose: 'lieBack', expression: 'ko' });
    m.shot((t, out) => {
      // from the ground where Frieza is: the man who spared him, looking down at him
      // from the ground where Frieza is, looking up at the man who spared him
      const up = g.pos.clone().sub(fz.pos).setY(0).normalize();
      const eye = fz.chest().add(new V3(0, 0.1, 0)).addScaledVector(up, U.lerp(1.4, 1.1, t));
      camAt(out, eye, gChest().add(new V3(0, U.lerp(0.45, 0.6, t), 0)), U.lerp(36, 32, t));
    }, 3, { cut: true, blendIn: 0, hold: true });
    yield* m.cine(3);
    m.shot((t, out) => {
      // and in on his face: headroom, slightly below him, disappointed rather than angry
      const c = gChest().add(new V3(0, 0.72, 0));
      camAt(out, c.clone().addScaledVector(g.forward, U.lerp(2.2, 1.8, t)).addScaledVector(side(), 0.5).add(new V3(0, -0.12, 0)), c.clone().add(new V3(0, 0.18, 0)), U.lerp(34, 30, t));
    }, 3, { cut: true, blendIn: 0.35, hold: true });
    yield* m.cine(3);
    m.flags.mangaLastLook = true;
    m.endShot();
  }

  P.betrayal = {
    id: 'betrayal',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      superSaiyan(g);
      g.setTorn(true);
      m.flags.giTorn = true;
      fullPower(fz);
      if (fz.model.setHalved) fz.model.setHalved(true);
      fz.auraOff = true;
      if (fz.model.setBattered) fz.model.setBattered(true);
      fz.cannotDie = true;
      fz.untargetable = true;
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 6)), 4));
      g.grounded = false;
      faceTo(fz, g.pos);
      // two cuts of the same ending; the player picks in Settings -> Gameplay
      if (SL.Settings.data.gameplay.namekEnding === 'manga') {
        m.flags.endingCut = 'manga';
        yield* mangaBetrayal(m);
        yield* SL.Cinema.play(m, 'frieza_left_behind');
        m.flags.friezaFell = true;
        return;
      }
      m.flags.endingCut = 'classic';
      yield* SL.Cinema.play(m, 'frieza_betrayal');
      // THE ANGRY KAMEHAMEHA: one hand, gold, and pushed by the player
      m.lock(true);
      g.setState('scripted', { pose: 'g_kameFire', expression: 'shout' });
      fz.setState('scripted', { pose: 'lieBack', expression: 'shout' });
      faceTo(g, fz.pos);
      const spec = Object.assign({}, g.def.specials.special1, {
        range: 60, sustain: 999, damage: [0, 0], radius: [0.8, 1],
        color: 0xffd23a, core: 0xfff6c0, // gold, not blue: this one is thrown in anger
      });
      const beam = b.projectiles.spawnBeam(g, spec, 1);
      beam.hitSet.add(fz);
      b.sfx('beamFire', g, { vol: 1.5, pitch: 0.75 });
      b.vfx.flash(g.chest().addScaledVector(g.forward, 0.6), 6, 0xfff0a0, 0.5, SL.Toon.tex.glow);
      m.say('goku', 'KA-ME-HA-ME-HAAAA!', 2.6, { style: 'shout' });
      const onFrieza = () => fz.chest().add(new V3(0, 0.2, 0));
      const hold = () => {
        beam.headOverride = onFrieza();
        if (b.frame % 2 === 0) b.vfx.sparks(onFrieza(), 0xffe066, 6, 14, 0.14);
        b.cameraTraumaAt(onFrieza(), 0.05);
      };
      m.tickHooks.push(hold);
      // the camera stays on him while it lands: the struggle is the point, not a white screen
      const sideOf = () => new V3(-(g.pos.z - fz.pos.z), 0, g.pos.x - fz.pos.x).normalize();
      m.shot((t, out) => {
        const c = fz.chest();
        camAt(out, c.clone().addScaledVector(sideOf(), U.lerp(9, 7.5, t)).add(new V3(0, 1.1, 0)), c, 42);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(1.4);
      // in on him: the player has to see what it is doing to him, not a white screen
      m.shot((t, out) => {
        const c = fz.chest().add(new V3(0, 0.25, 0));
        camAt(out, c.clone().addScaledVector(sideOf(), U.lerp(4.4, 3.4, t)).add(new V3(0, 0.45, 0)), c, 38);
      }, 999, { hold: true, cut: true, blendIn: 0.4 });
      const res = yield* m.struggle({
        start: 0.55,
        drain: 0.26,
        duration: 4,
        label: 'EVERYTHING HE HAS LEFT',
        canFail: false,
        onTick: (t, grip) => {
          fz.setState('scripted', { pose: 'fz_brace', expression: 'shout' });
          if (b.frame % 6 === 0) b.vfx.dust(fz.pos, 2.2 + (1 - grip) * 2, 6);
        },
      });
      m.flags.angryKameAvg = Math.round(res.avg * 100) / 100;
      m.qteParts.push(U.clamp01(res.avg * 1.4));
      m.tickHooks.splice(m.tickHooks.indexOf(hold), 1);
      beam.headOverride = null;
      beam.stop();
      b.vfx.explosion(onFrieza(), 12, 0xffe066, { smoke: true });
      b.vfx.ring(fz.pos.clone().add(new V3(0, 0.3, 0)), 18, 0xfff0a0, 0.9, new V3(0, 1, 0));
      b.cameraTraumaAt(fz.pos, 1);
      b.sfx('explosionHuge', null, { vol: 1.3, pitch: 0.7 });
      SL.ScreenFX.flash(0.55, '#fff4c0');
      if (b.stage.crater) b.stage.crater(fz.pos, 8, 1.2);
      yield 1.2;
      m.endShot();
      yield* SL.Cinema.play(m, 'frieza_left_behind');
      m.flags.friezaFell = true;
    },
  };

  P.escape = {
    id: 'escape',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, gh = S.gohan, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      // he is beaten and the planet is the opponent now — beaten, not dead
      fz.cannotDie = true;
      fz.alive = true;
      fz.setHidden(true);
      fz.untargetable = true;
      fz.controller = scripted();
      gh.setHidden(false);
      gh.untargetable = true;
      gh.controller = scripted();
      place(gh, ground(b, FIELD.clone().add(new V3(-14, 0, 22))));
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      g.setTorn(true); // the 100% fight took the gi, however this checkpoint was reached
      m.flags.giTorn = true;
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.4));
      g.ki = Math.max(g.ki, 60);
      g.cannotDie = true;
      g.setState('free');
      g.target = null;
      b.stage.setMood(0.34, 0x5a1c10, 1.6);
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('escape', 'Stay alive while it goes', { icon: 'clock', target: ESCAPE_SECONDS });
      m.objective('air', 'Spend the whole run in the air', { icon: 'guard', optional: true });
      let grounded = 0;
      const erupt = eruptions(m, { every: 70, radius: 4, damage: 1100, warn: 34 });
      m.tickHooks.push(erupt);
      let t = 0;
      const clock = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        if (g.grounded) grounded++;
        m.progress('escape', Math.min(ESCAPE_SECONDS, Math.floor(t)));
        // the sky gets worse as it goes
        if (Math.floor(t) % 6 === 0 && b.frame % 60 === 0) {
          const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 30;
          const at = g.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
          if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
          b.vfx.explosion(at, 10, 0xff9a5a, { smoke: true });
          b.cameraTraumaAt(g.chest(), 0.35);
        }
      };
      m.tickHooks.push(clock);
      m.prompt('flyOut', 'up', 'Fly — the ground is not survivable now', { required: true, always: true, when: () => g.grounded, until: () => !g.grounded });
      yield () => t >= ESCAPE_SECONDS || !g.alive;
      for (const h of [erupt, clock]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      if (!g.alive) return;
      m.complete('escape');
      if (grounded < 60) m.complete('air');
      else m.failObjective('air');
      m.flags.groundedFrames = grounded;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      g.controller = scripted();
      g.setState('scripted', { pose: 'idle', expression: 'hurt' });
      b.stage.setMood(0.36, 0x5a1c10, 1.2);
      m.shot((t, out) => camAt(out, g.chest().clone().add(new V3(U.lerp(4, 9, t), U.lerp(2.4, 7, t), U.lerp(5, 12, t))), g.chest(), U.lerp(46, 58, t)), 4, { cut: true, blendIn: 0 });
      m.say('goku', 'There is nothing left down there to save.', 3, { style: 'quiet' });
      yield* m.cine(4);
      // the planet, still going
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2, r = 25 + Math.random() * 40;
        const at = g.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
        if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
        b.vfx.explosion(at, 12, 0xff9a5a, { smoke: true });
      }
      b.cameraTraumaAt(g.chest(), 0.8);
      b.sfx('explosionBig', null, { vol: 1.2, pitch: 0.5 });
      yield* m.cine(2.4);
      m.fade('black', 1.4);
      yield 1.6;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'FIVE MINUTES', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_end',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'Five Minutes',
    subtitle: 'Namek, dying · one hundred percent',
    character: 'goku',
    stage: 'namek_ruin',
    parTime: 480,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The planet has five minutes left. Frieza goes to one hundred percent on what remains of it, the fight takes the gi off Goku, and it ends with his own Death Saucer, a mercy he did not deserve, and what he did with it.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.dying, P.hundred, P.full, P.krillin, P.finish, P.saucers, P.mercy, P.betrayal, P.escape, P.after],
  };

  SL.data.missions[def.id] = def;
})();
