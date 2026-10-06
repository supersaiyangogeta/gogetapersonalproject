/*
 * CHAPTER 4 — NAMEK SAGA (third mission of the Namek foundation, in development)
 * Mission "The Beautiful Monster" (canon, played as Vegeta).
 *
 * Canon beats: Vegeta is emptying Namekian villages for Dragon Balls when Frieza
 * sends Zarbon after him. Vegeta handles the elegant, evasive Zarbon — right up
 * to the moment Zarbon stops being elegant. The monstrous form overwhelms him,
 * and Zarbon leaves him broken by the water, certain he is dead. (Vegeta's
 * rematch, where he returns the favour, is the next mission and does not exist yet.)
 *
 * Phases: ARRIVAL (cutscene) → DUEL (checkpoint: normal Zarbon) → CHANGE
 * (transformation cinematic) → MONSTER (checkpoint: survive the transformed boss)
 * → AFTERMATH (cutscene). Vegeta still has no Super Saiyan and no Final Flash.
 *
 * The fight is not "hit it until the health bar empties": the duel ends when his
 * composure breaks, the transformation is an event, and the second half is about
 * staying alive against something that now walks through your hits.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const ARENA = new V3(0, 0, 0);
  const SURVIVE = 55; // seconds of the monstrous form the story asks you to live through

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
    clearArea(b, ARENA, 34);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, 10))), startKi: 60 });
    // still years from Super Saiyan, and the Final Flash does not exist yet
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { ultimate: true, transform: true };
    const zarbon = b.spawn({ charId: 'zarbon', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -10))), startKi: 70, tags: { boss: true, priority: true } });
    zarbon.controller = scripted();
    zarbon.setHidden(true);
    zarbon.untargetable = true;
    // he does not become the monster on his own schedule: the story decides
    zarbon.bossPhaseCap = 0;
    faceTo(vegeta, ARENA.clone().add(new V3(0, 0, -10)));
    b.story = { vegeta, zarbon };
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      m.shot((t, out) => camAt(out, ground(b, ARENA.clone().add(new V3(U.lerp(-26, -16, t), 0, U.lerp(24, 18, t))), U.lerp(14, 6, t)), v.chest(), 48), 3.6, { cut: true, blendIn: 0 });
      SL.Audio.play('scouter');
      m.say('vegeta', 'Four down. Frieza can keep counting his own.', 3);
      yield* m.cine(3.2);
      // Zarbon drops in without hurrying
      z.setHidden(false);
      z.setPosition(ground(b, ARENA.clone().add(new V3(2, 0, -12)), 9));
      z.grounded = false;
      faceTo(z, v.pos);
      z.setState('scripted', { pose: 'zb_flourish', expression: 'smirk' });
      let fall = 0;
      m.tickHooks.push(() => {
        if (fall >= 1) return;
        fall = Math.min(1, fall + 1 / 90);
        const gy = b.stage.heightAt(z.pos.x, z.pos.z);
        z.pos.y = U.lerp(gy + 9, gy, U.easeInCubic(fall));
        z.prevPos.copy(z.pos);
        z.vel.set(0, 0, 0);
        if (fall >= 1) {
          z.grounded = true;
          b.vfx.dust(z.pos, 2.2, 16);
          b.sfx('groundImpact', z, { vol: 0.6 });
        }
      });
      m.shot((t, out) => {
        const c = z.chest();
        camAt(out, c.clone().addScaledVector(z.forward, 3.2).add(new V3(-0.8, U.lerp(1.6, 0.2, t), 0)), c, 44);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('zarbon', 'Must we? You will ruin my hair.', 3);
      yield* m.cine(3.4);
      m.tickHooks.length = 0;
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().addScaledVector(v.forward, 2.2).add(new V3(0.7, 0.2, 0)), c, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.say('vegeta', "Zarbon. Frieza sends his prettiest errand boy.", 2.4);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      z.setHidden(false);
      z.untargetable = false;
      z.bossPhaseCap = 0;
      if (z.formIndex !== 0) z.applyForm(0);
      z.hp = z.hpMax;
      z.mech.phase = 0;
      z.poise.value = z.poise.max;
      z.cannotDie = true;
      // challenging, not frustrating (owner, playtest round 2: 'Zarbon was extremely difficult'):
      // in his elegant form he fights for show, not all-out — his blows land lighter, and the
      // fight stays about catching him rather than surviving his chains
      z.damageDealtMul = 0.75;
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, 9))), Math.PI);
      place(z, ground(b, ARENA.clone().add(new V3(0, 0, -9))), 0);
      z.controller = cpu(b);
      v.target = z;
      z.target = v;
      v.setState('free');
      z.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 2);
      m.objective('duel', 'Break Zarbon', { icon: 'fist' });
      const clean = m.objective('composure', 'Break his composure twice', { icon: 'fist', optional: true, target: 2 });
      let breaks = 0;
      b.on('poiseBreak', (e) => {
        if (e.fighter !== z) return;
        breaks++;
        m.progress('composure', breaks);
      });
      // he blinks out of pressure: the fight is about catching him, not out-trading him
      m.prompt('zbMirage', 'target', 'He keeps moving — stay locked on', { always: true, when: () => z.state === 'teleport' || z.cooldowns.special2 > 0, until: () => SL.Input.pressed('target') });
      yield () => z.hpFrac <= 0.45 || !v.alive;
      if (!v.alive) return;
      m.complete('duel');
      if (breaks >= 2) m.complete('composure');
      else m.failObjective('composure');
      yield 0.4;
    },
  };

  P.change = {
    id: 'change',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      clearCombat(b);
      z.controller = scripted();
      z.setState('scripted', { pose: 'zb_flourish', expression: 'grit' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      place(z, ground(b, v.pos.clone().addScaledVector(v.forward, 7)));
      faceTo(z, v.pos);
      faceTo(v, z.pos);
      m.shot((t, out) => {
        const c = z.chest();
        camAt(out, c.clone().addScaledVector(z.forward, 2.6).add(new V3(0.7, 0.3, 0)), c, 40);
      }, 3, { cut: true, blendIn: 0 });
      m.say('zarbon', 'You are going to make me do something I hate.', 2.8);
      yield* m.cine(3);
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().addScaledVector(v.forward, 2.2).add(new V3(-0.7, 0.2, 0)), c, 40);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Then do it. I am bored of the pretty one.', 2.2);
      yield* m.cine(2.4);
      m.endShot();
      // the transformation itself: the boss technique drives the engine's own
      // transform state, so the form sequence (poses, aura, mood, burst) plays out
      z.bossPhaseCap = undefined;
      b.aiLocked = true;
      m.music('finale', 1);
      const started = SL.Techniques.bossTransform.start(z, { type: 'bossTransform', frames: 150, form: 1 });
      b.emit('zarbonTransform', { fighter: z, started });
      yield () => z.state !== 'transform' || !z.alive;
      // whatever happened (skipped cinematics, short transforms), he is the monster now
      if (z.alive && z.formIndex !== 1) z.applyForm(1);
      z.mech.phase = 1;
      z.poise.value = z.poise.max;
      m.shot((t, out) => {
        const c = z.chest();
        camAt(out, c.clone().addScaledVector(z.forward, U.lerp(4.6, 3.6, t)).add(new V3(0.9, 1.1, 0)), c.clone().add(new V3(0, 0.2, 0)), 46);
      }, 2.6, { cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'shock' });
      m.say('vegeta', '...That is what you were hiding.', 2.4);
      yield* m.cine(2.6);
      m.endShot();
      yield 0.3;
    },
  };

  P.monster = {
    id: 'monster',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // resuming from this checkpoint starts with the monster already standing there
      z.setHidden(false);
      z.untargetable = false;
      z.bossPhaseCap = undefined;
      if (z.formIndex !== 1) z.applyForm(1);
      z.mech.phase = 1;
      z.hp = Math.min(z.hp, z.hpMax * 0.45);
      if (z.hp <= 0) z.hp = z.hpMax * 0.45;
      z.poise.value = z.poise.max;
      z.cannotDie = true;
      z.infiniteHp = true; // canon: this is not the fight Vegeta wins
      z.damageDealtMul = 1; // the monster does not hold back
      v.cannotDie = true;
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, 8))), Math.PI);
      place(z, ground(b, ARENA.clone().add(new V3(0, 0, -8))), 0);
      z.controller = cpu(b);
      v.target = z;
      z.target = v;
      v.setState('free');
      z.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 3);
      m.objective('survive', 'Survive', { icon: 'clock', target: SURVIVE });
      const standing = m.objective('standing', 'Never be knocked down', { icon: 'guard', optional: true });
      let downed = false;
      b.on('knockdown', (e) => {
        if (e.fighter === v && !downed) {
          downed = true;
          m.failObjective('standing');
        }
      });
      m.prompt('zbQuake', 'ascend', 'Get off the ground', { always: true, when: () => z.state === 'bossSlam' && z.sd.phase === 'air', until: () => z.state !== 'bossSlam' });
      m.prompt('zbGuard', 'guard', 'He is too strong to trade with', { always: true, when: () => v.hpFrac < 0.6 && v.distTo(z) < 4, until: () => SL.Input.held('guard') });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('survive', Math.min(SURVIVE, Math.floor(t)));
        // he hits harder the longer this goes on: the story is running out of room
        if (Math.floor(t) === 30 && !m.flags.zarbonPush) {
          m.flags.zarbonPush = true;
          b.bark(z, 'taunt', true);
        }
      };
      m.tickHooks.push(hook);
      yield () => t >= SURVIVE || !v.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!v.alive) return;
      m.complete('survive');
      if (!downed) m.complete('standing');
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.4;
    },
  };

  P.aftermath = {
    id: 'aftermath',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, z = S.zarbon;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      z.controller = scripted();
      v.controller = scripted();
      place(v, ground(b, ARENA.clone()), Math.PI);
      place(z, ground(b, ARENA.clone().add(new V3(0, 0, -4))), 0);
      faceTo(z, v.pos);
      // the last exchange of the fight, as a scene: he simply out-muscles the prince
      z.setState('scripted', { pose: 'zb_beastSmashW', expression: 'angry', speed: 10 });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'grit' });
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(4.2, 1.4, 3.4)), v.chest().clone().lerp(z.chest(), 0.4), 46), 2.2, { cut: true, blendIn: 0 });
      yield* m.cine(1.2);
      z.setState('scripted', { pose: 'zb_beastSmash', expression: 'shout', speed: 16 });
      b.sfx('punchHeavy', z, { vol: 1.2 });
      SL.ScreenFX.flash(0.5, '#ffffff');
      b.cameraTraumaAt(v.chest(), 0.9);
      b.vfx.impact(v.chest(), 4, 0xbfe6ff);
      v.setState('scripted', { pose: 'knockdown', expression: 'ko', speed: 14 });
      v.hp = Math.max(1, Math.round(v.hpMax * 0.05));
      yield* m.cine(1.6);
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(U.lerp(2.6, 5.5, t), U.lerp(0.9, 3.2, t), U.lerp(2.2, 4.5, t))), v.chest(), 50), 4, { cut: true, blendIn: 0 });
      z.setState('scripted', { pose: 'zb_beastIdle', expression: 'grin' });
      m.say('zarbon', 'Beautiful, was it not? Lord Frieza can have what is left.', 3.4);
      yield* m.cine(3.6);
      // he leaves with the Dragon Ball, certain he is finished
      let up = 0;
      m.tickHooks.push(() => {
        up += 1 / 60;
        z.pos.y += 0.26;
        z.pos.addScaledVector(z.forward, -0.18);
        z.prevPos.copy(z.pos);
        z.grounded = false;
        if (b.frame % 3 === 0) b.vfx.trail(z.chest(), 0x8ef07a, 0.5, 0.5);
      });
      z.setState('scripted', { pose: 'flyUp', expression: 'smirk', speed: 8 });
      yield* m.cine(2.2);
      m.tickHooks.length = 0;
      z.setHidden(true);
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(1.6, 0.6, 2.2)), v.chest(), 38), 3, { cut: true, blendIn: 0 });
      m.say('vegeta', '...Not... finished...', 2.6);
      yield* m.cine(2.8);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE BEAUTIFUL MONSTER', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_zarbon',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Beautiful Monster',
    subtitle: 'Namek · Vegeta against Zarbon',
    character: 'vegeta',
    stage: 'namek',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: "Frieza sends Zarbon to bring the Saiyan prince in. The elegant one is not the problem — what he turns into is.",
    rewards: ['Chapter 4 continues', 'Zarbon (story boss, two forms)'],
    setup,
    phases: [P.arrival, P.duel, P.change, P.monster, P.aftermath],
  };

  SL.data.missions[def.id] = def;
})();
