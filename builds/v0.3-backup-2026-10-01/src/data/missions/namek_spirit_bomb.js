/*
 * CHAPTER 4 — NAMEK SAGA
 * Mission "The Spirit Bomb" (canon; the gathering is played as Piccolo).
 *
 * Canon beats: Goku is spent, and Namek has almost nothing left to give, so he asks the
 * planets and stars around it. The gathering takes time he does not have: Piccolo stands in
 * front of him, with Gohan and Krillin, and keeps Frieza busy. It lands. Silence. Relief.
 * People sit down. Then a sound from the cliff above them — Frieza, bloodied, half his tail
 * gone — and a Death Beam meant for Goku that Piccolo shoves him clear of and takes
 * through the chest. He is down, and alive.
 *
 * Phases: CALL (scene `spirit_bomb_call`) → HOLD (checkpoint: Piccolo is the player; Goku
 * gathers the Spirit Bomb for real, and anything Frieza lands on him costs the gathering)
 * → IMPACT (scene `spirit_bomb_impact`) → QUIET (scene `false_victory`) → RETURN (checkpoint:
 * scene `frieza_returns`) → SACRIFICE (checkpoint: scene `piccolo_takes_the_beam`) → AFTER.
 *
 * The bomb is the engine's own Spirit Bomb, held by Goku's controller; the mission only
 * decides who Frieza is looking at, and carries the gathered energy across interruptions.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const CHARGE_FRAMES = 1500; // twenty-five seconds of Piccolo standing in the way
  const DISTRACT_FRAMES = 240; // how long a hit on Frieza keeps his eyes off Goku
  const CLIFF = new V3(-17, 0, -24); // the rock he climbs out onto, relative to FIELD

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
  const cpu = (b, d) => new SL.AIController(b, { difficulty: d || SL.Settings.data.gameplay.difficulty });
  /** Goku during the gathering: hands up, and nothing else. */
  const gathering = () => ({ update: () => Object.assign(SL.emptyIntent(), { ult: true, ultHeld: true }) });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** A rock ledge above the field: where Frieza comes back from. Solid, and part of the stage. */
  function buildCliff(b) {
    const at = ground(b, FIELD.clone().add(CLIFF));
    const h = 7.5, r = 4.2;
    const g = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r, h, 7), SL.Toon.mat(0x6a7a6a));
    SL.Toon.addOutline(rock, 1.2);
    rock.position.y = h / 2 - 0.3;
    g.add(rock);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.72, 0.8, 7), SL.Toon.mat(0x7c8c72));
    cap.position.y = h - 0.3;
    g.add(cap);
    g.position.copy(at);
    b.stage.scene.add(g);
    const top = at.y + h + 0.1;
    b.stage.obstacles.push({ shape: 'cyl', x: at.x, z: at.z, y: at.y, r: r * 0.9, h: h + 0.1, top, hp: 1e9, maxHp: 1e9, alive: true, group: g, segs: [], color: 0x6a7a6a });
    if (b.mission) b.mission.onDispose(() => b.stage.scene.remove(g));
    const ledge = FIELD.clone().sub(at).setY(0).normalize().multiplyScalar(r * 0.5);
    return { pos: new V3(at.x + ledge.x, top, at.z + ledge.z), object: g };
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 42);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 10))), startKi: 100 });
    goku.lockedSlots = { transform: true };
    goku.formCaps = { kaioken: 4 };
    // the Spirit Bomb here is a set piece, not a move: it takes as long as it takes
    goku.specOverrides = { ultimate: { chargeFrames: CHARGE_FRAMES, chargeMin: 300 } };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 8))), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-9, 0, 9))), startKi: 60 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, FIELD.clone().add(new V3(-14, 0, 14))), startKi: 80 });
    if (piccolo.lockedForms) delete piccolo.lockedForms.nail;
    piccolo.applyForm(1); // he is still carrying Nail
    piccolo.setHidden(true); // he steps in during the call
    for (const f of [krillin, gohan, piccolo]) {
      f.controller = scripted();
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.45);
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -10))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    const cliff = buildCliff(b);
    faceTo(goku, frieza.pos);
    faceTo(frieza, goku.pos);
    b.story = { goku, krillin, gohan, piccolo, frieza, cliff };
  }

  const P = {};

  P.call = {
    id: 'call',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [S.goku, S.frieza, S.krillin, S.gohan, S.piccolo]) f.controller = scripted();
      place(S.goku, ground(b, FIELD.clone().add(new V3(0, 0, 9))), Math.PI);
      place(S.frieza, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      faceTo(S.goku, S.frieza.pos);
      faceTo(S.frieza, S.goku.pos);
      S.goku.hp = Math.round(S.goku.hpMax * 0.3);
      yield* SL.Cinema.play(m, 'spirit_bomb_call');
    },
  };

  /*
   * THE GATHERING, PLAYED AS PICCOLO. Goku holds the Spirit Bomb up for twenty-five seconds and
   * can do nothing else. Frieza wants to get to him. Every hit Piccolo (or Gohan, or Krillin)
   * lands turns Frieza's head for a few seconds; anything that reaches Goku knocks the
   * gathering down and costs part of what was gathered.
   */
  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 11))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -9))), 0);
      place(pc, ground(b, FIELD.clone().add(new V3(0, 0, 3))), Math.PI);
      faceTo(pc, fz.pos);
      pc.setHidden(false);
      pc.untargetable = false;
      pc.hp = Math.max(pc.hp, Math.round(pc.hpMax * 0.6));
      pc.ki = Math.max(pc.ki, 80);
      b.switchPlayer(pc, { force: true });
      b.setParty([pc]);
      // Goku: the gathering, for real, and exposed while he does it
      g.specOverrides = { ultimate: { chargeFrames: CHARGE_FRAMES, chargeMin: 300 } };
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.3));
      g.ki = g.kiMax;
      g.infiniteKi = true; // the energy is everybody else's, not his
      g.damageTakenMul = 0.35; // braced around it: blows cost the gathering, not the last of him
      g.cannotDie = true;
      g.untargetable = false;
      g.controller = gathering();
      g.target = fz;
      g.setState('free');
      for (const f of [S.krillin, S.gohan]) {
        f.controller = cpu(b, 'hard');
        f.untargetable = false;
        f.cannotDie = true;
        f.target = fz;
        f.setState('free');
      }
      fz.applyForm(3);
      fz.mech.phase = 3;
      fz.bossPhaseCap = 3;
      fz.hp = fz.hpMax;
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = true;
      fz.aiPhase = 'dominant';
      fz.damageDealtMul = 0.55; // three people at once, and he is angry, not careful
      fz.controller = cpu(b);
      fz.target = g;
      pc.target = fz;
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 4);
      m.objective('charge', 'Keep Frieza off Goku while he gathers it', { icon: 'bomb', target: 100 });
      m.objective('clean', 'Frieza never reaches Goku', { icon: 'guard', optional: true });
      let best = 0, resume = 0, breaks = 0, done = false, distract = 0, turned = 0, broken = false, lastCost = -999;
      // DISTRACTION: a hit on Frieza buys time; a hit on Goku costs it
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker && e.attacker.team === pc.team && e.attacker !== g) {
          if (fz.target === g) {
            turned++;
            if (turned === 1) m.say('frieza', 'Out of my way, Namekian!', 1.8);
            else if (turned === 4) m.say('frieza', 'You are all insects. Every one of you!', 2.2);
          }
          fz.target = e.attacker;
          distract = DISTRACT_FRAMES;
        }
        if (e.target === g && e.attacker === fz && b.frame - lastCost > 45) {
          // he braces through it (a held ultimate is armored), but the gathering pays for every blow
          lastCost = b.frame;
          breaks++;
          if (g.state === 'spiritBomb' && g.sd && g.sd.bomb && !g.sd.released) {
            g.stateFrame = Math.max(2, g.stateFrame - Math.round(CHARGE_FRAMES * 0.12));
            best = U.clamp01(g.stateFrame / CHARGE_FRAMES);
            b.vfx.ring(g.sd.bomb.pos, g.sd.bomb.radius * 1.8, 0x9fe4ff, 0.4);
          }
          if (breaks === 1) {
            m.failObjective('clean');
            m.say('piccolo', 'Damn it — he got through!', 1.8);
          }
        }
      });
      const hook = () => {
        if (b.inputLocked) return;
        if (distract > 0 && --distract === 0 && fz.target !== g) fz.target = g;
        if (!fz.target || !fz.target.alive) fz.target = g;
        const inBomb = g.state === 'spiritBomb' && g.sd && g.sd.bomb && !g.sd.released;
        if (inBomb) {
          broken = false;
          // back in it after an interruption: the gathered energy is still there, minus the cost
          if (resume > 0 && g.stateFrame >= 2 && !g.sd.resumed) {
            g.sd.resumed = true;
            g.stateFrame = Math.max(g.stateFrame, resume);
          }
          const frac = U.clamp01(g.sd.frac || 0);
          if (frac > best) best = frac;
          m.progress('charge', Math.round(best * 100));
          if (frac >= 0.995) done = true;
        } else if (best > 0 && !done && !broken) {
          // knocked out of it: part of it is gone
          broken = true;
          best = Math.max(0, best - 0.15);
          resume = Math.round(best * CHARGE_FRAMES);
          m.progress('charge', Math.round(best * 100));
        }
      };
      m.tickHooks.push(hook);
      m.prompt('sbDistract', 'light', 'Hit Frieza — make him look at you, not Goku', {
        always: true,
        when: () => fz.target === g && fz.distTo(g) < 18,
        until: () => fz.target !== g,
      });
      yield () => done || !pc.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      g.infiniteKi = false;
      if (!pc.alive) return;
      m.complete('charge');
      if (!breaks) m.complete('clean');
      m.flags.chargeBreaks = breaks;
      m.flags.friezaTurned = turned;
      m.flags.chargeFrac = Math.round(best * 100);
      m.qteParts.push(U.clamp01(1 - breaks * 0.2));
      yield 0.2;
    },
  };

  P.impact = {
    id: 'impact',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      clearCombat(b);
      for (const f of [g, fz, S.krillin, S.gohan, S.piccolo]) f.controller = scripted();
      // the engine's gathering hands over to the scene's throw (setState cancels the held bomb)
      g.damageTakenMul = 1;
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.25));
      g.setState('scripted', { pose: 'g_spiritRaise', expression: 'shout' });
      b.switchPlayer(g, { force: true });
      b.setParty([g]);
      for (const f of [S.krillin, S.gohan, S.piccolo]) {
        f.untargetable = true;
        f.setHidden(false);
        // whatever the fight left lit on the two of them goes out: nobody powers up in the quiet
        if (f !== S.piccolo && f.formIndex) f.applyForm(0);
        f.setState('scripted', { pose: 'idle', expression: 'shock' });
      }
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 11))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      place(S.piccolo, ground(b, FIELD.clone().add(new V3(1, 0, -1))));
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      faceTo(S.piccolo, fz.pos);
      fz.setHidden(false);
      fz.setState('scripted', { pose: 'fz_block', expression: 'shock' });
      yield* SL.Cinema.play(m, 'spirit_bomb_impact');
    },
  };

  P.quiet = {
    id: 'quiet',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku;
      clearCombat(b);
      S.frieza.setHidden(true);
      S.frieza.untargetable = true;
      // everybody who survived is standing here, whichever way this phase was entered
      for (const f of [S.goku, S.krillin, S.gohan, S.piccolo]) {
        f.setHidden(false);
        f.controller = scripted();
        if (f !== S.piccolo && f.formIndex) f.applyForm(0);
      }
      place(S.krillin, ground(b, g.pos.clone().add(new V3(3.2, 0, -1.5))));
      place(S.gohan, ground(b, g.pos.clone().add(new V3(-8, 0, 4))));
      place(S.piccolo, ground(b, g.pos.clone().add(new V3(2, 0, -4.5))));
      for (const f of [S.krillin, S.gohan, S.piccolo]) faceTo(f, g.pos);
      faceTo(g, FIELD.clone().add(new V3(0, 0, -6)));
      g.setState('scripted', { pose: 'g_defeatKnee', expression: 'hurt' });
      yield* SL.Cinema.play(m, 'false_victory');
    },
  };

  /* FRIEZA SURVIVES: restartable from here. Everybody is where the quiet left them. */
  P.return = {
    id: 'return',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz, S.krillin, S.gohan, S.piccolo]) {
        f.controller = scripted();
        f.setHidden(false);
      }
      b.switchPlayer(g, { force: true });
      b.setParty([g]);
      m.music(null, 0);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 11))), Math.PI);
      place(S.krillin, ground(b, g.pos.clone().add(new V3(3.2, 0, -1.5))));
      place(S.gohan, ground(b, g.pos.clone().add(new V3(-1.4, 0, 0.8))));
      place(S.piccolo, ground(b, g.pos.clone().add(new V3(2, 0, -4.5))));
      for (const f of [S.krillin, S.gohan, S.piccolo]) {
        f.untargetable = true;
        faceTo(f, S.cliff.pos);
      }
      fz.untargetable = true;
      fz.cannotDie = true;
      fz.setHidden(true);
      fz.setPosition(S.cliff.pos.clone());
      g.setState('scripted', { pose: 'g_defeatKnee', expression: 'soft' });
      S.krillin.setState('scripted', { pose: 'idle', expression: 'soft' });
      S.gohan.setState('scripted', { pose: 'idle', expression: 'grin' });
      S.piccolo.setState('scripted', { pose: 'p_kneelLook', expression: 'calm' });
      yield* SL.Cinema.play(m, 'frieza_returns');
      m.music('finale', 3);
    },
  };

  /* THE PICCOLO SACRIFICE: restartable from here. */
  P.sacrifice = {
    id: 'sacrifice',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, pc = S.piccolo;
      m.lock(true);
      clearCombat(b);
      for (const f of [g, fz, S.krillin, S.gohan, pc]) {
        f.controller = scripted();
        f.setHidden(false);
      }
      if (fz.pos.distanceTo(S.cliff.pos) > 1) fz.setPosition(S.cliff.pos.clone());
      if (fz.model.cutTail) fz.model.cutTail(0.45);
      if (fz.model.setBattered) fz.model.setBattered(true);
      faceTo(fz, g.pos);
      place(pc, ground(b, g.pos.clone().add(new V3(2, 0, -4.5))));
      faceTo(pc, fz.pos);
      g.setState('scripted', { pose: 'g_defeatKnee', expression: 'shock' });
      pc.setState('scripted', { pose: 'p_stance', expression: 'shock' });
      m.music('finale', 3);
      yield* SL.Cinema.play(m, 'piccolo_takes_the_beam');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, k = S.krillin;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz, k]) f.controller = scripted();
      faceTo(fz, k.pos);
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      k.setState('scripted', { pose: 'guard', expression: 'shock' });
      // his eyes move off Piccolo and settle on the next one
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(fz, k, { fov: 36, back: U.lerp(2.8, 2.2, t), side: 1, height: 0.6, lookUp: -0.2 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('frieza', 'Now. Which of you would like to be next?', 3.2);
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const c = k.chest();
        camAt(out, c.clone().addScaledVector(k.forward, U.lerp(1.9, 1.5, t)).add(new V3(0.4, 0.2, 0)), c, 36);
      }, 2.4, { cut: true, blendIn: 0 });
      yield* m.cine(2.4);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE SPIRIT BOMB', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_spirit_bomb',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Spirit Bomb',
    subtitle: 'Namek · Piccolo buys the time, and it is not enough',
    character: 'goku',
    stage: 'namek',
    parTime: 380,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Goku asks the stars for their energy and cannot move while it comes. Piccolo stands in front of him. It lands — and for a minute, everybody believes it.',
    rewards: ['Chapter 4 continues'],
    setup,
    // the next mission opens under the same rock
    buildCliff,
    phases: [P.call, P.hold, P.impact, P.quiet, P.return, P.sacrifice, P.after],
  };

  SL.data.missions[def.id] = def;
})();
