/*
 * CHAPTER 4 — NAMEK SAGA (eleventh mission of the Namek foundation, in development)
 * Mission "The Warrior" (canon, played as Nail).
 *
 * Canon beats: while everybody else is busy with the Ginyu Force, Frieza flies to
 * the Grand Elder's plateau for the password he cannot get any other way, and one
 * Namekian walks out to meet him. Nail knows exactly how this ends. He does it
 * anyway, because every minute he wastes is a minute Dende is running with the
 * answer. When Frieza finally tires of it, Piccolo lands — and Nail offers him the
 * only thing he has left.
 *
 * Phases: STAND (cutscene: the meeting) → STALL (checkpoint: a fight you cannot
 * win, played for time) → ARM (cutscene: Frieza takes an arm; it grows back) →
 * FUSION (cutscene: Piccolo takes Nail, staged with the shared transformation
 * cinematic) → AFTER (cutscene: what Piccolo does with it).
 *
 * Nail is a real fighter (src/data/characters/namek_locals.js) with Namekian
 * regeneration: holding a guard heals him, which is the only reason the stall
 * is survivable at all.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const PLATEAU = new V3(0, 0, -8);
  const STALL_SECONDS = 55;

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
    clearArea(b, PLATEAU, 32);
    const nail = b.spawn({ charId: 'nail', player: true, team: 0, pos: ground(b, PLATEAU.clone().add(new V3(0, 0, 10))), startKi: 80 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, PLATEAU.clone().add(new V3(0, 0, -10))), startKi: 120, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.bossPhaseCap = 0; // first form: he does not need anything else for this
    // Piccolo is off the field until the end of the mission
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, PLATEAU.clone().add(new V3(20, 0, 26))), startKi: 70 });
    piccolo.controller = scripted();
    piccolo.untargetable = true;
    piccolo.cannotDie = true;
    piccolo.setHidden(true);
    faceTo(nail, frieza.pos);
    faceTo(frieza, nail.pos);
    b.story = { nail, frieza, piccolo };
  }

  const P = {};

  P.stand = {
    id: 'stand',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nail, fz = S.frieza;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      n.setState('scripted', { pose: 'nl_braceW', expression: 'calm' });
      fz.setState('scripted', { pose: 'idle', expression: 'calm' });
      // the plateau, the two of them, and a very large difference between them
      m.shot((t, out) => {
        const mid = n.pos.clone().lerp(fz.pos, 0.5);
        camAt(out, mid.clone().add(new V3(U.lerp(15, 9, U.easeInOutCubic(t)), U.lerp(8, 3.2, U.easeInOutCubic(t)), 0)), mid.clone().add(new V3(0, 1.2, 0)), 46);
      }, 4, { cut: true, blendIn: 0 });
      b.stage.setMood(0.3, 0x243a4a, 1.6);
      m.say('frieza', 'I\'m told the old man up there can give me what I came for.', 3.4);
      yield* m.cine(4);
      m.shot((t, out) => camAt(out, n.chest().clone().addScaledVector(n.forward, 2.4).add(new V3(-0.8, 0.3, 0)), n.chest(), 40), 3.2, { cut: true, blendIn: 0 });
      m.say('nail', 'He will give you nothing. Neither will I.', 2.8);
      yield* m.cine(3.2);
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, 2.6).add(new V3(0.9, 0.35, 0)), fz.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      b.sfx('uiSelect', fz, { pitch: 1.5 });
      m.say('frieza', 'Forty two thousand. How brave of you.', 2.8);
      yield* m.cine(3.2);
      b.stage.clearMood(1.2);
      m.endShot();
    },
  };

  P.stall = {
    id: 'stall',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nail, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== n) b.switchPlayer(n, { force: true });
      place(n, ground(b, PLATEAU.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, PLATEAU.clone().add(new V3(0, 0, -8))), 0);
      n.hp = n.hpMax;
      n.ki = Math.max(n.ki, 80);
      n.cannotDie = true; // canon: he is still alive when Piccolo arrives
      fz.applyForm(0);
      fz.bossPhaseCap = 0;
      fz.mech.phase = 0;
      fz.hp = fz.hpMax;
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = true; // nothing Nail does to him matters, and he knows it
      fz.damageDealtMul = 0.5; // he is not trying to kill him, he is playing
      fz.controller = cpu(b);
      fz.target = n;
      n.target = fz;
      n.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('stall', 'Waste his time', { icon: 'clock', target: STALL_SECONDS });
      m.objective('mark', 'Land eight hits on him anyway', { icon: 'fist', optional: true, target: 8 });
      let hits = 0, healed0 = n.mech ? n.mech.healed : 0;
      b.on('damage', (e) => {
        if (e.target !== fz || e.attacker !== n) return;
        hits++;
        m.progress('mark', Math.min(8, hits));
      });
      // the thing that makes him different from everybody else the player has had
      m.prompt('nlRegen', 'guard', 'Hold guard — Namekians knit themselves back together', {
        always: true,
        when: () => n.hpFrac < 0.6 && n.state !== 'guard',
        until: () => n.state === 'guard',
      });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('stall', Math.min(STALL_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= STALL_SECONDS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('stall');
      if (hits >= 8) m.complete('mark');
      else m.failObjective('mark');
      m.flags.stallHits = hits;
      m.flags.regenerated = Math.round((n.mech ? n.mech.healed : 0) - healed0);
      m.qteParts.push(U.clamp01(n.hpFrac));
      yield 0.4;
    },
  };

  P.arm = {
    id: 'arm',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nail, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [n, fz]) f.controller = scripted();
      place(fz, ground(b, n.pos.clone().addScaledVector(n.forward, 3.2)));
      faceTo(fz, n.pos);
      faceTo(n, fz.pos);
      n.setState('scripted', { pose: 'nl_braceW', expression: 'grit' });
      fz.setState('scripted', { pose: 'fz_aim', expression: 'smirk' });
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, 2.6).add(new V3(0.8, 0.4, 0)), fz.chest(), 42), 2.8, { cut: true, blendIn: 0 });
      m.say('frieza', 'Still standing? I\'m almost impressed.', 2.6);
      yield* m.cine(2.8);
      // the arm
      b.sfx('punchHeavy', n, { vol: 1.3 });
      SL.ScreenFX.flash(0.4, '#ffffff');
      b.cameraTraumaAt(n.chest(), 0.9);
      b.vfx.impact(n.chest(), 5, 0x9fe08a);
      n.hp = Math.max(1, Math.round(n.hpMax * 0.2));
      n.setState('scripted', { pose: 'nl_armless', expression: 'hurt' });
      m.shot((t, out) => camAt(out, n.chest().clone().add(new V3(U.lerp(2.2, 3.4, t), U.lerp(0.9, 1.6, t), 2.6)), n.chest(), 44), 3.4, { cut: true, blendIn: 0 });
      yield* m.cine(2);
      // ...and it grows back, which is the point
      b.vfx.streamInward(n.chest(), 2.4, 0x9fe08a, 8, 0.14, 0.5);
      b.sfx('kiCharge', n, { vol: 0.8 });
      n.setState('scripted', { pose: 'nl_brace', expression: 'calm' });
      m.say('nail', 'That will grow back.', 2.4);
      yield* m.cine(2.8);
      m.shot((t, out) => camAt(out, fz.chest().clone().add(new V3(-1.6, 0.6, 2.8)), fz.chest(), 44), 3, { cut: true, blendIn: 0 });
      m.say('nail', 'Every second I keep you here is a second they are not spending on you.', 3);
      yield* m.cine(3.2);
      m.say('frieza', 'You\'ve stopped being amusing.', 2.4);
      yield* m.cine(2.6);
      // he leaves for the Dragon Balls, which is exactly what Nail wanted
      fz.setState('scripted', { pose: 'fz_aim', expression: 'angry' });
      const from = fz.pos.clone();
      fz.grounded = false;
      const hook = () => {
        fz.pos.y += 0.5;
        fz.prevPos.copy(fz.pos);
      };
      m.tickHooks.push(hook);
      b.sfx('dash', fz, { pitch: 0.85 });
      m.shot((t, out) => camAt(out, from.clone().add(new V3(6, 3, 8)), fz.chest(), U.lerp(46, 58, t)), 3, { cut: true, blendIn: 0 });
      yield* m.cine(2.6);
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      fz.setHidden(true);
      fz.untargetable = true;
      m.flags.friezaLeft = true;
      m.endShot();
    },
  };

  P.fusion = {
    id: 'fusion',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nail, p = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // Piccolo lands
      p.setHidden(false);
      place(p, ground(b, n.pos.clone().add(new V3(4, 0, 6))));
      faceTo(p, n.pos);
      faceTo(n, p.pos);
      p.setState('scripted', { pose: 'idle', expression: 'grit' });
      n.setState('scripted', { pose: 'nl_armless', expression: 'hurt' });
      b.vfx.dust(p.pos.clone(), 3, 14);
      b.sfx('groundImpact', p, { vol: 0.9 });
      m.shot((t, out) => camAt(out, p.chest().clone().add(new V3(U.lerp(6, 3, t), U.lerp(3.4, 1.2, t), 4)), p.chest(), 44), 3.2, { cut: true, blendIn: 0 });
      m.say('piccolo', 'You are the one who has been keeping him busy.', 2.8);
      yield* m.cine(3.2);
      // the fusion itself, shown (owner, playtest round 2: 'I did not see Nail and Piccolo fuse'):
      // the palm on his chest, the light, Nail pouring into him — then the staged transformation
      p.controller = scripted();
      n.controller = scripted();
      yield* SL.Cinema.play(m, 'nail_fuses_piccolo');
      m.lock(true);
      n.setHidden(true);
      n.untargetable = true;
      m.teach(p, 'form:nail'); // the story unlocks it here, and only here
      yield* SL.data.cinematics.transform(m, {
        fighter: p,
        formIndex: 1,
        line: 'piccolo_fuse',
        music: 4,
      });
      m.flags.fused = true;
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
      p.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.shot((t, out) => camAt(out, p.chest().clone().addScaledVector(p.forward, 3).add(new V3(0.9, 0.4, 0)), p.chest(), 42), 3.4, { cut: true, blendIn: 0 });
      m.say('piccolo', 'I can feel all of it. Every one of them.', 3);
      yield* m.cine(3.4);
      // he looks toward the fight he is about to join
      m.shot((t, out) => camAt(out, p.chest().clone().add(new V3(-3.4, 1.6, -3.2)), p.chest().clone().add(new V3(0, 0, -14)), U.lerp(46, 52, t)), 3.4, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Gohan. Hold on a little longer.', 2.8);
      yield* m.cine(3.4);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE WARRIOR', 'Next: Frieza himself', 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_nail',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Warrior',
    subtitle: 'Namek · Nail buys time he will not live to spend',
    character: 'nail',
    stage: 'namek',
    parTime: 220,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'A fight you cannot win, played for the clock. Hold guard and the wounds close; stop holding it and they do not.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.stand, P.stall, P.arm, P.fusion, P.after],
  };

  SL.data.missions[def.id] = def;
})();
