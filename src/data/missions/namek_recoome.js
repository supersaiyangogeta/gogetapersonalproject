/*
 * CHAPTER 4 — NAMEK SAGA (seventh mission of the Namek foundation, in development)
 * Mission "Recoome's Show" (canon, played as Vegeta, then as Krillin and Gohan).
 *
 * Canon beats: with Guldo gone, Recoome steps up and asks Vegeta to fight him.
 * Vegeta, still riding the power he took from nearly dying, lands everything he
 * has — and Recoome gets up, poses, and breaks him. Krillin and Gohan drag the
 * fight out until the sky opens and Goku's pod lands.
 *
 * Phases: CHALLENGE (cutscene) → PRIDE (checkpoint: Vegeta, who cannot win but
 * can hurt him) → SHOW (cutscene: Recoome flattens him) → HOLD (checkpoint:
 * Krillin and Gohan survive until the pod lands) → ARRIVAL (cutscene).
 *
 * The fight teaches one rule: every pose is a free opening, and every pose you
 * waste makes the next exchange hurt much more.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const HOLD_SECONDS = 50;

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
    clearArea(b, FIELD, 32);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 10))), startKi: 80 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(7, 0, 14))), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-7, 0, 14))), startKi: 60 });
    for (const f of [krillin, gohan]) {
      f.controller = scripted();
      f.untargetable = true;
    }
    const recoome = b.spawn({ charId: 'recoome', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -8))), startKi: 90, tags: { boss: true, priority: true } });
    recoome.controller = scripted();
    faceTo(vegeta, FIELD);
    faceTo(recoome, vegeta.pos);
    b.story = { vegeta, krillin, gohan, recoome };
  }

  const P = {};

  P.challenge = {
    id: 'challenge',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, r = S.recoome;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      r.setState('scripted', { pose: 'rc_pose', expression: 'grin' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().addScaledVector(r.forward, U.lerp(5, 3.4, t)).add(new V3(1, 1.2, 0)), c.clone().add(new V3(0, 0.3, 0)), 46);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('recoome', 'Recoome likes it when they get back up!', 3.2);
      yield* m.cine(3.6);
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 2.2).add(new V3(-0.7, 0.2, 0)), v.chest(), 40), 2.8, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Talk less. I have killed better than you today.', 2.6);
      yield* m.cine(2.8);
      m.endShot();
    },
  };

  P.pride = {
    id: 'pride',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, r = S.recoome;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== v) b.switchPlayer(v, { force: true });
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 9))), Math.PI);
      place(r, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 80);
      r.hp = r.hpMax;
      r.mech.phase = 0;
      r.poise.value = r.poise.max;
      r.cannotDie = true;
      r.controller = cpu(b);
      v.target = r;
      r.target = v;
      v.setState('free');
      r.setState('free');
      m.lock(false);
      b.aiLocked = false;
      // the Ginyu Force's own theme (soundtrack PDF p.95, an original stand-in: superhero-show brass)
      m.music('ginyu_force', 3);
      m.objective('pride', 'Make Recoome stop smiling', { icon: 'fist', target: 3 });
      const punish = m.objective('punish', 'Punish three poses', { icon: 'fist', optional: true, target: 3 });
      let posed = 0, punished = 0, finished = 0;
      b.on('bossPose', () => posed++);
      // interrupting a pose means he never reaches bossPoseDone
      b.on('bossPoseDone', () => finished++);
      b.on('damage', (e) => {
        if (e.target === r && e.attacker === v && r.state === 'bossPose') {
          punished++;
          m.progress('punish', punished);
          m.progress('pride', punished);
        }
      });
      m.prompt('rcPose', 'heavy', 'He is posing — hit him', { always: true, when: () => r.state === 'bossPose', until: () => r.state !== 'bossPose' });
      yield () => punished >= 3 || r.hpFrac <= 0.55 || !v.alive;
      if (!v.alive) return;
      m.complete('pride');
      if (punished >= 3) m.complete('punish');
      else m.failObjective('punish');
      m.flags.posed = posed;
      m.flags.posesFinished = finished;
      yield 0.4;
    },
  };

  P.show = {
    id: 'show',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, r = S.recoome, k = S.krillin, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      r.controller = scripted();
      place(r, ground(b, v.pos.clone().addScaledVector(v.forward, 4.5)));
      faceTo(r, v.pos);
      faceTo(v, r.pos);
      // he takes everything Vegeta has and poses about it
      r.setState('scripted', { pose: 'rc_pose', expression: 'grin' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'grit' });
      m.shot((t, out) => camAt(out, r.chest().clone().addScaledVector(r.forward, 3.2).add(new V3(0.8, 0.8, 0)), r.chest(), 44), 3, { cut: true, blendIn: 0 });
      m.say('recoome', 'Watch this one — Recoome has been practising!', 2.8);
      yield* m.cine(3);
      // the Recoome Kick, as a scene
      r.setState('scripted', { pose: 'rc_kickW', expression: 'shout', speed: 10 });
      yield* m.cine(0.7);
      r.setState('scripted', { pose: 'rc_kick', expression: 'shout', speed: 18 });
      b.sfx('punchHeavy', r, { vol: 1.3 });
      SL.ScreenFX.flash(0.55, '#ffffff');
      b.cameraTraumaAt(v.chest(), 1);
      b.vfx.impact(v.chest(), 5, 0xffd0a0);
      v.setState('scripted', { pose: 'knockdown', expression: 'ko', speed: 16 });
      v.hp = Math.max(1, Math.round(v.hpMax * 0.06));
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(U.lerp(3, 6, t), U.lerp(1.2, 3, t), U.lerp(2.6, 5, t))), v.chest(), 50), 3.6, { cut: true, blendIn: 0 });
      yield* m.cine(2.4);
      // the other two step in front of him
      k.untargetable = false;
      g.untargetable = false;
      place(k, ground(b, v.pos.clone().add(new V3(2.5, 0, 3))), Math.PI);
      place(g, ground(b, v.pos.clone().add(new V3(-2.5, 0, 3))), Math.PI);
      k.setState('scripted', { pose: 'idle', expression: 'grit' });
      g.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.shot((t, out) => camAt(out, k.chest().clone().add(new V3(3.2, 1.4, 3.4)), k.chest().clone().lerp(r.chest(), 0.45), 48), 3.2, { cut: true, blendIn: 0 });
      m.say('krillin', 'Gohan — we only have to last. Goku is coming.', 3);
      yield* m.cine(3.2);
      m.endShot();
    },
  };

  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, r = S.recoome, k = S.krillin, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // Vegeta is down; the player takes Krillin, with Gohan as the second hero
      v.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      v.untargetable = true;
      v.controller = scripted();
      // the gap: nothing Krillin or Gohan has makes him so much as blink
      m.powerGap(r, { from: [k, g], mul: 0.05, lines: [{ at: 3, who: 'recoome', line: 'Ooh! That tickles!' }] });
      for (const f of [k, g]) {
        f.untargetable = false;
        f.controller = null;
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, 60);
        f.cannotDie = true; // canon: they are beaten, not killed, before Goku lands
      }
      place(k, ground(b, FIELD.clone().add(new V3(2.5, 0, 8))), Math.PI);
      place(g, ground(b, FIELD.clone().add(new V3(-2.5, 0, 9))), Math.PI);
      place(r, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      r.hp = Math.max(r.hp, r.hpMax * 0.5);
      r.mech.phase = 1;
      r.poise.value = r.poise.max;
      r.cannotDie = true;
      r.infiniteHp = true;
      r.controller = cpu(b);
      if (b.player !== k) b.switchPlayer(k, { force: true });
      b.setParty([k, g]);
      for (const h of [k, g]) h.target = r;
      r.target = k;
      k.setState('free');
      g.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 3);
      m.objective('hold', 'Hold out until Goku lands', { icon: 'clock', target: HOLD_SECONDS });
      const standing = m.objective('standing', 'Neither of you is knocked down', { icon: 'guard', optional: true });
      let downed = false;
      b.on('knockdown', (e) => {
        if ((e.fighter === k || e.fighter === g) && !downed) {
          downed = true;
          m.failObjective('standing');
        }
      });
      m.prompt('rcPose2', 'heavy', 'Punish the pose', { always: true, when: () => r.state === 'bossPose', until: () => r.state !== 'bossPose' });
      m.prompt('rcSwap', 'partyNext', 'Switch hero', { always: true, when: () => b.player.hpFrac < 0.45, until: () => SL.Input.pressed('partyNext') });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('hold', Math.min(HOLD_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= HOLD_SECONDS || !b.partyAlive().length;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!b.partyAlive().length) return;
      m.complete('hold');
      if (!downed) m.complete('standing');
      m.qteParts.push(U.clamp01(b.player.hpFrac));
      yield 0.4;
    },
  };

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, r = S.recoome;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      r.controller = scripted();
      r.setState('scripted', { pose: 'rc_taunt', expression: 'grin' });
      k.setState('scripted', { pose: 'idle', expression: 'hurt' });
      g.setState('scripted', { pose: 'idle', expression: 'hurt' });
      // the cliffhanger: Recoome is about to finish it, and something tears across the sky.
      // The ship lands at the start of the next mission ("Two Against One"), where Goku's
      // arrival is played in full — it is shown once, not twice (playtest round 2).
      const sky = k.pos.clone().add(new V3(-60, 55, -40));
      const over = k.pos.clone().add(new V3(50, 30, 60));
      const ship = b.stage.addProp({ kind: 'ccship', pos: sky, r: 3.4, hp: 999999, id: 'gokuShipPass' });
      let st = 0;
      const pass = () => {
        st = Math.min(1, st + 1 / 60 / 2.2);
        ship.pos.lerpVectors(sky, over, st);
        ship.group.position.copy(ship.pos);
        if (b.frame % 2 === 0) b.vfx.trail(ship.pos.clone().add(new V3(0, -3.4, 0)), 0x9fd8ff, 1.4, 0.5);
      };
      m.tickHooks.push(pass);
      r.setState('scripted', { pose: 'rc_kickW', expression: 'grin' });
      m.shot((t, out) => camAt(out, k.chest().clone().add(new V3(-3, 1.2, 4)), ship.pos.clone(), 56), 2.4, { cut: true, blendIn: 0 });
      b.sfx('dash', k, { pitch: 0.45, vol: 1.4 });
      b.camera.addTrauma(0.25);
      yield* m.cine(2.2);
      m.shot((t, out) => camAt(out, k.chest().clone().addScaledVector(k.forward, -2.6).add(new V3(0.8, 0.6, 0)), k.chest(), 42), 2.8, { cut: true, blendIn: 0 });
      m.say('krillin', 'That ship... that is from Earth. That is Goku!', 2.6);
      yield* m.cine(2.8);
      m.shot((t, out) => camAt(out, r.chest().clone().addScaledVector(r.forward, 3).add(new V3(0.8, 0.5, 0)), r.chest(), 44), 2.6, { cut: true, blendIn: 0 });
      m.say('recoome', 'Another one? Recoome finishes the little ones first!', 2.6);
      yield* m.cine(2.8);
      const pi = m.tickHooks.indexOf(pass);
      if (pi >= 0) m.tickHooks.splice(pi, 1);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', "RECOOME'S SHOW", m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_recoome',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: "Recoome's Show",
    subtitle: 'Namek · Vegeta, then Krillin and Gohan, against Recoome',
    character: 'vegeta',
    stage: 'namek',
    parTime: 320,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Recoome asks for a fight and enjoys every second of it. You cannot out-muscle him — but every pose he strikes is a gift, if you are patient enough to take it.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.challenge, P.pride, P.show, P.hold, P.arrival],
  };

  SL.data.missions[def.id] = def;
})();
