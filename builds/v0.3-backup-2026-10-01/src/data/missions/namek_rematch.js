/*
 * CHAPTER 4 — NAMEK SAGA (fourth mission of the Namek foundation, in development)
 * Mission "The Prince Repaid" (canon, played as Vegeta).
 *
 * Canon beats: Zarbon left Vegeta for dead, then had to come back for him when
 * Frieza wanted him alive. A Saiyan who nearly dies comes back stronger, and the
 * Zarbon who won the last fight is not ready for the one who climbs out of the
 * water. This time the monstrous form is where the fight starts, not where it
 * turns — and it ends with Zarbon begging.
 *
 * Phases: WAKE (cutscene: the Zenkai) → REMATCH (checkpoint: Zarbon opens in his
 * monstrous form) → BEG (his elegant form, a plea, and the answer) → END.
 *
 * The difference from "The Beautiful Monster" is deliberate: same opponent, same
 * two forms, reversed roles. Vegeta hits far harder (Zenkai), Zarbon's monstrous
 * form no longer wins trades, and the fight is decided by pressure instead of survival.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const ARENA = new V3(0, 0, 0);
  const ZENKAI = 1.4; // a Saiyan back from the edge

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
  function finisher(b, from, to, color, radius) {
    const origin = from.handPos('R');
    b.projectiles.spawnBlast(from, origin, to.chest().sub(origin).normalize(), { kind: 'ball', speed: 140, radius, damage: 0, color, core: 0xffffff, explode: radius * 5, knock: 'flinch', impact: 3, life: 0.5 });
    b.sfx('kiBlastBig', from);
  }
  function finish(b, f, by) {
    b.vfx.explosion(f.chest(), 5, 0xd8ffd0, { smoke: true });
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
    clearArea(b, ARENA, 32);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, 9))), startKi: 70 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { ultimate: true, transform: true };
    // the Zenkai is the whole point of this mission: he is simply stronger now
    vegeta.damageDealtMul = ZENKAI;
    const zarbon = b.spawn({ charId: 'zarbon', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -9))), startKi: 80, tags: { boss: true, priority: true } });
    zarbon.controller = scripted();
    zarbon.setHidden(true);
    zarbon.untargetable = true;
    faceTo(vegeta, ARENA.clone().add(new V3(0, 0, -9)));
    b.story = { vegeta, zarbon };
  }

  const P = {};

  P.wake = {
    id: 'wake',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, 6))), Math.PI);
      v.hp = Math.max(1, Math.round(v.hpMax * 0.08));
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(U.lerp(4.5, 2.6, t), U.lerp(3.2, 1.1, t), U.lerp(4, 2.4, t))), v.chest(), 46), 3.4, { cut: true, blendIn: 0 });
      m.say('vegeta', '...Still... breathing...', 2.6);
      yield* m.cine(3);
      // the Zenkai: he gets up with more than he had
      v.setState('scripted', { pose: 'powerUp', expression: 'grit', aura: 0.6, speed: 8 });
      b.stage.setMood(0.35, 0x0c2038, 0.8);
      SL.Audio.play('kiUp');
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(2.2, 0.8, 2.6)), v.chest(), 42), 3, { cut: true, blendIn: 0 });
      yield* m.cine(1.2);
      v.hp = v.hpMax;
      v.ki = v.kiMax;
      v.setState('scripted', { pose: 'powerUp', expression: 'shout', aura: 1, speed: 14 });
      b.vfx.explosion(v.chest(), 5, 0x7fc6ff, { smoke: false });
      b.vfx.ring(v.pos.clone().add(new V3(0, 0.3, 0)), 9, 0x9fd8ff, 0.8, new V3(0, 1, 0));
      SL.Audio.play('transformBurst');
      b.cameraTraumaAt(v.chest(), 0.6);
      SL.ScreenFX.flash(0.5, '#cfe8ff');
      m.say('vegeta', 'Every time you nearly kill me, I come back stronger. Remember that.', 3.4);
      yield* m.cine(3.4);
      b.stage.clearMood(1);
      m.endShot();
    },
  };

  P.rematch = {
    id: 'rematch',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, 8))), Math.PI);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 70);
      // the Zenkai is not only a bigger fist: he also takes this beating far better than the last one
      v.damageDealtMul = ZENKAI;
      v.damageTakenMul = 0.45;
      // and Zarbon, who won the last fight on raw weight, is outclassed now — canon: this one is not close
      z.damageDealtMul = 0.6;
      // this time he does not bother being elegant first
      z.setHidden(false);
      z.untargetable = false;
      if (z.formIndex !== 1) z.applyForm(1);
      z.mech.phase = 1;
      z.bossPhaseCap = undefined;
      z.hp = z.hpMax;
      z.poise.value = z.poise.max;
      z.cannotDie = true;
      place(z, ground(b, ARENA.clone().add(new V3(0, 0, -8))), 0);
      z.setState('scripted', { pose: 'zb_beastIdle', expression: 'grin' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      m.shot((t, out) => {
        const c = z.chest();
        camAt(out, c.clone().addScaledVector(z.forward, U.lerp(4, 3.2, t)).add(new V3(0.9, 0.6, 0)), c, 44);
      }, 3, { cut: true, blendIn: 0 });
      m.say('zarbon', 'Lord Frieza wants you alive. Personally, I would rather not repeat myself.', 3);
      yield* m.cine(3.2);
      m.endShot();
      z.controller = cpu(b);
      v.target = z;
      z.target = v;
      v.setState('free');
      z.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('rematch', 'Repay Zarbon', { icon: 'fist' });
      const fast = m.objective('fast', 'Finish him within 90 seconds', { icon: 'clock', optional: true });
      const noHeal = m.objective('untouched', 'Never be knocked down', { icon: 'guard', optional: true });
      let downed = false;
      b.on('knockdown', (e) => {
        if (e.fighter === v && !downed) {
          downed = true;
          m.failObjective('untouched');
        }
      });
      m.prompt('zbQuake2', 'ascend', 'Jump the quake', { always: true, when: () => z.state === 'bossSlam' && z.sd.phase === 'air', until: () => z.state !== 'bossSlam' });
      const t0 = m.time;
      yield () => z.hpFrac <= 0.25 || !v.alive;
      if (!v.alive) return;
      m.complete('rematch');
      if (m.time - t0 <= 90) m.complete('fast');
      else m.failObjective('fast');
      if (!downed) m.complete('untouched');
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.4;
    },
  };

  P.beg = {
    id: 'beg',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      z.controller = scripted();
      place(z, ground(b, v.pos.clone().addScaledVector(v.forward, 5)));
      faceTo(z, v.pos);
      faceTo(v, z.pos);
      // beaten out of the monstrous form: he goes back to the pretty one to be spared
      z.applyForm(0);
      z.mech.phase = 0;
      z.setState('scripted', { pose: 'zb_defeat', expression: 'hurt' });
      b.vfx.flash(z.chest(), 4, 0x9ff0d8, 0.4);
      SL.Audio.play('kiUp', { pitch: 0.7 });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.shot((t, out) => {
        const c = z.chest();
        camAt(out, c.clone().addScaledVector(z.forward, 2.6).add(new V3(0.7, 0.4, 0)), c, 42);
      }, 4, { cut: true, blendIn: 0 });
      m.say('zarbon', 'Wait — wait! Spare me and I will tell Lord Frieza you escaped. I can be useful!', 3.8);
      yield* m.cine(4);
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().addScaledVector(v.forward, 2.2).add(new V3(-0.7, 0.2, 0)), c, 38);
      }, 3, { cut: true, blendIn: 0 });
      m.say('vegeta', 'You were useful. You brought me back to life.', 2.8);
      yield* m.cine(3);
      v.setState('scripted', { pose: 'v_bigBang', expression: 'angry' });
      finisher(b, v, z, 0x7fc6ff, 1);
      yield 0.3;
      finish(b, z, v);
      m.say('vegeta', 'Tell Frieza yourself.', 2);
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  P.end = {
    id: 'end',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta;
      m.lock(true);
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(U.lerp(3, 7, t), U.lerp(1, 4, t), U.lerp(3, 8, t))), v.chest(), 48), 4, { cut: true, blendIn: 0 });
      m.say('vegeta', 'One Dragon Ball back. Frieza keeps five on his ship, and the Earthlings are carrying another.', 3.6);
      yield* m.cine(3.6);
      // and he goes to take them: the next mission is where he finds the Earthlings
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(-4, -1, 5)), v.chest().clone().add(new V3(0, 6 * t, -10 * t)), 50), 2.2, { cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'flyUp', expression: 'smirk' });
      m.say('vegeta', 'They will all be mine.', 1.8);
      b.sfx('dash', v, { vol: 1.1 });
      let rise = 0;
      const up = () => {
        rise++;
        v.pos.y += 0.4;
        v.pos.z -= 0.35;
        v.prevPos.copy(v.pos);
        if (rise % 2 === 0) b.vfx.trail(v.chest(), 0x8fc8ff, 0.5, 0.35);
      };
      m.tickHooks.push(up);
      yield* m.cine(2.2);
      const ui = m.tickHooks.indexOf(up);
      if (ui >= 0) m.tickHooks.splice(ui, 1);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE PRINCE REPAID', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_rematch',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Prince Repaid',
    subtitle: 'Namek · Vegeta returns the favour',
    character: 'vegeta',
    stage: 'namek',
    parTime: 240,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Zarbon came back to collect a body. A Saiyan who survives that kind of beating does not come back the same.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.wake, P.rematch, P.beg, P.end],
  };

  SL.data.missions[def.id] = def;
})();
