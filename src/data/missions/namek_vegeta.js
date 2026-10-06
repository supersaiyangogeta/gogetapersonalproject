/*
 * CHAPTER 4 — NAMEK SAGA (the first mission of the Namek foundation, in development)
 * Mission "A Prince on Namek" (canon, playable as Vegeta).
 *
 * Canon beats: healed and stronger after Earth, Vegeta reaches Namek to take the
 * Dragon Balls for himself. Frieza sends Cui after him; Vegeta beats his old
 * rival and finishes him with a trick. Later he ambushes Dodoria, who — trying
 * to save himself — tells Vegeta the truth: Frieza destroyed Planet Vegeta. It
 * does not save him.
 *
 * Phases: ARRIVAL (cutscene) → CUI (duel, checkpoint) → DODORIA (boss, checkpoint)
 * → THE TRUTH (cutscene). Vegeta cannot turn Super Saiyan or use Final Flash yet
 * (both locked by the story).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const ARENA = new V3(0, 0, 0);

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
    f.yaw = yaw;
    f.prevYaw = yaw;
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
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  function offstage(f) {
    f.untargetable = true;
    f.controller = scripted();
    f.setHidden(true);
  }
  function finish(b, f, by) {
    b.vfx.explosion(f.chest(), 5, 0xffe0f0, { smoke: true });
    b.cameraTraumaAt(f.chest(), 0.8);
    SL.ScreenFX.flash(0.35, '#ffffff');
    f.cannotDie = false;
    f.infiniteHp = false;
    if (f.alive) {
      f.hp = 0;
      f._ko(by, { dir: new V3(0, 1, 0) });
    }
    f.setHidden(true);
    f.untargetable = true;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, ARENA, 40);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, 12))), startKi: 50 });
    // Vegeta on Namek: no Super Saiyan yet, and Final Flash is years away
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { ultimate: true, transform: true };
    const cui = b.spawn({ charId: 'cui', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -12))), startKi: 60, tags: { priority: true } });
    cui.controller = scripted();
    cui.setHidden(true);
    const dodoria = b.spawn({ charId: 'dodoria', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -40))), tags: { boss: true, priority: true } });
    offstage(dodoria);
    faceTo(vegeta, ARENA.clone().add(new V3(0, 0, -12)));
    b.story = { vegeta, cui, dodoria };
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cui;
      m.lock(true);
      m.music('menu', 0);
      v.setState('scripted', { pose: 'v_scouterTap', expression: 'smirk' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      m.shot((t, out) => camAt(out, v.pos.clone().add(new V3(U.lerp(-34, -22, t), U.lerp(20, 10, t), U.lerp(40, 28, t))), v.chest(), 50), 3.8, { cut: true, blendIn: 0 });
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const ch = v.chest();
        camAt(out, ch.clone().addScaledVector(v.forward, 2.2).add(new V3(0.7, 0.2, 0)), ch.clone().add(new V3(0, 0.2, 0)), 40);
      }, 3, { cut: true, blendIn: 0 });
      SL.Audio.play('scouter');
      m.say('vegeta', 'Namek. Seven Dragon Balls... and Frieza has no idea I am already here.', 3);
      yield* m.cine(3);
      // Cui drops out of the sky
      c.setHidden(false);
      c.setPosition(ground(b, ARENA.clone().add(new V3(0, 0, -12)), 8));
      c.grounded = false;
      faceTo(c, v.pos);
      c.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.shot((t, out) => {
        const ch = c.chest();
        camAt(out, ch.clone().addScaledVector(c.forward, 2.6).add(new V3(-0.6, 0.3, 0)), ch, 42);
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('cui', 'Well, well. Vegeta. Lord Frieza wants you brought in. In pieces is fine.', 3);
      yield* m.cine(3.2);
      m.shot((t, out) => {
        const ch = v.chest();
        camAt(out, ch.clone().addScaledVector(v.forward, 2.2).add(new V3(-0.7, 0.2, 0)), ch, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      m.say('vegeta', 'Cui. You always did talk more than you fought.', 2.4);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  P.cui = {
    id: 'cui',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cui, d = S.dodoria;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      offstage(d);
      c.setHidden(false);
      c.untargetable = false;
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, 12))), Math.PI);
      place(c, ground(b, ARENA.clone().add(new V3(0, 0, -12))), 0);
      c.hp = c.hpMax;
      c.cannotDie = true;
      c.controller = cpu(b);
      v.target = c;
      c.target = v;
      v.setState('free');
      c.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 2);
      m.objective('cui', 'Beat Cui', { icon: 'fist' });
      const cannon = m.objective('cannon', 'Never get hit by the Cui Cannon', { icon: 'guard', optional: true });
      b.on('damage', (e) => {
        if (e.target === v && e.attacker === c && !e.blocked && e.type === 'ki' && e.amount >= 2500 && !cannon.failed) m.failObjective('cannon');
      });
      yield () => c.hpFrac <= 0.25 || !v.alive;
      if (!v.alive) return;
      m.complete('cui');
      if (!cannon.failed) m.complete('cannon');
      // the trick — a scene of its own (owner, playtest round 2: make it a Vegeta moment)
      m.lock(true);
      clearCombat(b);
      c.controller = scripted();
      yield* SL.Cinema.play(m, 'vegeta_kills_cui');
      m.endShot();
    },
  };

  P.dodoria = {
    id: 'dodoria',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cui, d = S.dodoria;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (c.alive || !c.hidden) finish(b, c, null);
      // later: Dodoria, chasing two Earthlings, flies straight into Vegeta's path
      d.setHidden(false);
      d.untargetable = false;
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, 10))), Math.PI);
      place(d, ground(b, ARENA.clone().add(new V3(0, 0, -10))), 0);
      d.hp = d.hpMax;
      d.mech.phase = 0;
      d.cannotDie = true;
      d.poise.value = d.poise.max;
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 60);
      d.setState('scripted', { pose: 'dd_laugh', expression: 'grin' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      m.shot((t, out) => {
        const ch = d.chest();
        camAt(out, ch.clone().addScaledVector(d.forward, 3).add(new V3(-0.8, 0.4, 0)), ch.clone().add(new V3(0, 0.3, 0)), 42);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('dodoria', 'Vegeta?! What do you think you are doing here?', 2.4);
      yield* m.cine(2.6);
      m.shot((t, out) => {
        const ch = v.chest();
        camAt(out, ch.clone().addScaledVector(v.forward, 2.2).add(new V3(0.7, 0.2, 0)), ch, 40);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Collecting what I am owed, Dodoria.', 2.2);
      yield* m.cine(2.4);
      m.endShot();
      d.controller = cpu(b);
      v.target = d;
      d.target = v;
      v.setState('free');
      d.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('dodoria', 'Defeat Dodoria', { icon: 'fist' });
      m.objective('poise', "Break Dodoria's guard twice", { icon: 'fist', optional: true, target: 2 });
      let breaks = 0;
      b.on('poiseBreak', (e) => {
        if (e.fighter !== d) return;
        breaks++;
        m.progress('poise', breaks);
      });
      m.prompt('ddSlam', 'ascend', 'Jump over it', { always: true, when: () => d.state === 'bossSlam' && d.sd.phase === 'air', until: () => d.state !== 'bossSlam' });
      m.prompt('ddOpen', 'light', 'He is open!', { always: true, when: () => d.poise && d.poise.broken > 0 && v.distTo(d) < 12, until: () => !(d.poise && d.poise.broken > 0) });
      yield () => d.hpFrac <= 0.12 || !v.alive;
      if (!v.alive) return;
      m.complete('dodoria');
      yield 0.5;
    },
  };

  P.truth = {
    id: 'truth',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, d = S.dodoria;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(d, ground(b, v.pos.clone().addScaledVector(v.forward, 5)), 0);
      faceTo(d, v.pos);
      faceTo(v, d.pos);
      d.setState('scripted', { pose: 'dd_beg', expression: 'hurt' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.shot((t, out) => {
        const ch = d.chest();
        camAt(out, ch.clone().addScaledVector(d.forward, 2.8).add(new V3(0.8, 0.4, 0)), ch, 42);
      }, 4.2, { cut: true, blendIn: 0 });
      m.say('dodoria', "W-wait! I'll tell you something you don't know! Planet Vegeta was no meteor. Lord Frieza destroyed it himself!", 4);
      yield* m.cine(4.2);
      m.shot((t, out) => {
        const ch = v.chest();
        camAt(out, ch.clone().addScaledVector(v.forward, 2.2).add(new V3(-0.6, 0.1, 0)), ch, 38);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Hmph. I always suspected as much.', 2.4);
      yield* m.cine(2.6);
      // he runs for it — staged level with the chase, so the death is in the frame
      // (owner, playtest round 2: it was seen from too high, and the death itself was lost)
      d.controller = scripted();
      yield* SL.Cinema.play(m, 'vegeta_kills_dodoria');
      m.lock(true);
      m.shot((t, out) => {
        const ch = v.chest();
        camAt(out, ch.clone().addScaledVector(v.forward, 2.4).add(new V3(0.5, 0.3, 0)), ch, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.say('vegeta', 'Frieza... your time is coming.', 2.4);
      yield* m.cine(2.6);
      m.fade('black', 1);
      yield 1.2;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'A PRINCE ON NAMEK', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_vegeta',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'A Prince on Namek',
    subtitle: "Namek · Vegeta against Frieza's men",
    character: 'vegeta',
    stage: 'namek',
    parTime: 320,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: "Vegeta reaches Namek before Frieza expects him. First his old rival Cui, then Frieza's enforcer Dodoria — and a truth about Planet Vegeta.",
    rewards: ['Namek stage', 'The Namek Saga begins'],
    setup,
    phases: [P.arrival, P.cui, P.dodoria, P.truth],
  };

  SL.data.missions[def.id] = def;
})();
