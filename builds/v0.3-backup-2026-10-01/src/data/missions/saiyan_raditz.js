/*
 * CHAPTER 1 — SAIYAN SAGA: "A Brother From Space" (canon)
 * WHAT IF: "What if Goku defeated Raditz?" (branch from the same chapter)
 *
 * Both missions share the same cast, stage and staging helpers, but they are
 * separate mission definitions: the canon mission is flagged `canon`, the
 * branch is flagged `whatIf` with `branchOf` + `branchPoint`. Save progress
 * for What-If missions goes to a separate track (SL.Save.track).
 *
 * Canon beats preserved: Raditz arrives and takes Gohan, Goku and Piccolo
 * team up, Goku grabs Raditz's tail and is tricked into letting go, Piccolo's
 * first Special Beam Cannon misses, Gohan's hidden power breaks Raditz's
 * armor, Goku holds Raditz and Piccolo's second shot kills them both.
 * Dialogue is written for this fan project (paraphrased, not transcribed).
 *
 * Goku at this point in the story has no Kaioken, Super Saiyan, Instant
 * Transmission or Spirit Bomb — the mission rules and input limits enforce it.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const GOKU_LIMITS = { s2: false, ult: false, transform: false, revert: false };
  const ALL_OFF = { light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, dodge: false, guard: false, charge: false, transform: false, boost: false, boostPressed: false, up: false, upPressed: false, down: false, mx: false, my: false, target: false };
  const MASH = ['ultimate', 'special1', 'light', 'heavy', 'blast'];

  const RADITZ_START = new V3(0, 0, -14);
  const GOKU_START = new V3(-2, 0, 18);
  const PICCOLO_START = new V3(7, 0, 20);
  const POD_POS = new V3(-16, 0, -26);

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }

  function ground(b, v) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z);
    return p;
  }

  /** Saiyan space pod: white sphere, dark hatch ring, red window. */
  function podMesh() {
    const g = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), SL.Toon.mat(0xf2efe8));
    SL.Toon.addOutline(shell, 2);
    shell.position.y = 1;
    g.add(shell);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.06, 8, 30), SL.Toon.mat(0x4a4a54));
    ring.position.set(0, 1.05, 0.72);
    g.add(ring);
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.68, 24), new THREE.MeshBasicMaterial({ color: 0xc02a2a }));
    win.position.set(0, 1.05, 0.705);
    g.add(win);
    g.userData.shell = shell;
    return g;
  }

  /** Places two fighters in a fixed relation for a scripted beat. */
  function stage2(f, pos, yaw, grounded = true) {
    f.setPosition(pos);
    f.yaw = yaw;
    f.prevYaw = yaw;
    f.vel.set(0, 0, 0);
    f.grounded = grounded;
  }

  function clearCombat(b) {
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
    if (b.clash.active) b.clash._abort();
  }

  function scriptedController() {
    return { update: () => SL.emptyIntent() };
  }

  /** Hold-on struggle (tail grip, full nelson) — see Mission.struggle. */
  function* struggle(m, opts) {
    return yield* m.struggle(opts);
  }

  /** Fires Piccolo's Special Beam Cannon as a scripted beam at Raditz. */
  function fireCannon(b, pc, r) {
    pc.target = r;
    pc.setState('scripted', { pose: 'p_sbcFire', expression: 'shout', face: false });
    pc.faceTarget(100);
    const beam = b.projectiles.spawnBeam(pc, pc.def.specials.ultimate, 1);
    b.sfx('beamFire', pc, { vol: 1.3, pitch: 1.3 });
    b.vfx.ring(pc.handPos('R'), 2.5, 0xffe860, 0.4, beam.dir);
    return beam;
  }

  /* ---------------- shared setup ---------------- */
  function setup(battle, startPhase) {
    const b = battle;
    b.stage.crater(ground(b, POD_POS), 5, 1.2, null);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: GOKU_START.clone(), startKi: 40 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: PICCOLO_START.clone(), cannotDie: true, damageDealtMul: 0.7, startKi: 40 });
    const raditz = b.spawn({ charId: 'raditz', team: 1, pos: RADITZ_START.clone(), cannotDie: true, tags: { priority: true }, startKi: 40, damageDealtMul: 0.7 });
    const pod = podMesh();
    pod.position.copy(ground(b, POD_POS));
    pod.rotation.y = 0.6;
    b.scene.add(pod);
    // Saiyan Saga Goku: no Instant Transmission, Spirit Bomb or transformations yet
    goku.lockedSlots = { special2: true, ultimate: true, transform: true };
    b.story = { goku, piccolo, raditz, pod, gohan: null };
    goku.target = raditz;
    piccolo.target = raditz;
    raditz.target = goku;
    if (startPhase > 0) SL.Save.data.story.started = true;
  }

  /* ---------------- canon phases ---------------- */
  const P = {};

  P.intro = {
    id: 'intro',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      m.music('battle', 0);
      p.setState('scripted', { pose: 'g_resolve', expression: 'angry', face: true });
      pc.setState('scripted', { pose: 'idle', expression: 'calm', face: true });
      r.setState('scripted', { pose: 'r_taunt', expression: 'smirk', face: true });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.8);
      m.shot((t, out) => camAt(out, new V3(U.lerp(-40, -18, t), U.lerp(26, 9, t), U.lerp(50, 34, t)), new V3(0, U.lerp(2, 1.5, t), -6), 48), 4.2, { cut: true, blendIn: 0 });
      yield* m.cine(4);
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().add(new V3(U.lerp(1.6, 1.1, t), 0.15, U.lerp(3.4, 2.8, t))), c.clone().add(new V3(0, 0.15, 0)), 40);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('raditz', "Kakarot. You were sent here to wipe this planet clean, and instead you went soft. Your boy stays with me.", 3.6);
      yield* m.cine(3.6);
      m.shot((t, out) => camAt(out, ground(b, POD_POS).add(new V3(4, 2.4, 5.5)), ground(b, POD_POS).add(new V3(0, 1, 0)), 42), 2.2, { cut: true, blendIn: 0 });
      m.say('gohan', 'Daddy! Daddy, help!', 2.2);
      yield* m.cine(2.2);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(-1.2, 0.1, -U.lerp(3.2, 2.6, t))), c.clone().add(new V3(0, 0.1, 0)), 40);
      }, 3, { cut: true, blendIn: 0 });
      m.say('goku', "I don't care what planet I came from. Give Gohan back!", 3);
      yield* m.cine(3);
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(-2.2, 0.2, -2.4)), c, 40);
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('piccolo', "Don't misunderstand, Goku. I'm only here because he's in my way. After him, it's your turn.", 3.2);
      yield* m.cine(3.2);
      r.setState('scripted', { pose: 'r_laugh', expression: 'grin', face: true });
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().add(new V3(-4, 1.5, 7)), c, 46);
      }, 2.8, { cut: true, blendIn: 0 });
      m.say('raditz', 'Two weaklings, side by side. This should be amusing.', 2.8);
      yield* m.cine(2.8);
      m.endShot();
      for (const f of [p, pc, r]) f.setState('free');
    },
  };

  P.duo = {
    id: 'duo',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(false);
      m.limits(GOKU_LIMITS);
      m.music('battle', 2);
      r.hp = r.hpMax;
      m.objective('wear', 'Wear Raditz down together with Piccolo', { icon: 'skull', target: 100 });
      const combo = m.objective('combo', 'Land a 10-hit combo', { icon: 'fist', optional: true });
      m.say('piccolo', "Hit him from both sides. And stay out of my line of fire.", 2.8);
      m.tickHooks.push(() => {
        m.progress('wear', Math.round(U.clamp01((1 - r.hpFrac) / 0.45) * 100));
        if (!combo.done && p.combo.hits >= 10) m.complete('combo');
      });
      m.prompt('kameStory', 'special1', 'Kamehameha', { when: () => p.ki >= 30 && p.state === 'free' && p.target && p.distTo(p.target) > 10, until: () => SL.Input.pressed('special1') });
      m.prompt('chaseStory', 'heavy', 'Chase', { when: () => r.state === 'knockback' && p.state === 'attack', until: () => p.state === 'attack' && p.sd.move && p.sd.move.id && p.sd.move.id.startsWith('chase') });
      yield () => r.hpFrac <= 0.55;
      m.tickHooks.length = 0;
      m.progress('wear', 100);
      yield 0.6;
    },
  };

  P.tail = {
    id: 'tail',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      m.limits(null);
      clearCombat(b);
      m.clearObjectives();
      m.fade('black', 0.3);
      yield 0.35;
      const base = ground(b, new V3(r.pos.x, 0, r.pos.z));
      const yaw = Math.atan2(PICCOLO_START.x - base.x, PICCOLO_START.z - base.z);
      stage2(r, base, yaw);
      const fwd = new V3(Math.sin(yaw), 0, Math.cos(yaw));
      stage2(p, ground(b, base.clone().addScaledVector(fwd, -1.3)), yaw);
      stage2(pc, ground(b, base.clone().addScaledVector(fwd, 9)), yaw + Math.PI);
      p.hp = Math.max(p.hp, 3000);
      r.setState('scripted', { pose: 'r_tailPain', expression: 'hurt' });
      p.setState('scripted', { pose: 'g_tailGrab', expression: 'grit' });
      pc.setState('scripted', { pose: 'idle', expression: 'angry', face: true });
      m.fade('clear', 0.3);
      m.shot((t, out) => {
        const c = r.pos.clone().add(new V3(0, 0.8, 0));
        const side = new V3(fwd.z, 0, -fwd.x);
        camAt(out, c.clone().addScaledVector(side, U.lerp(3.8, 3.2, t)).add(new V3(0, -0.2, 0)).addScaledVector(fwd, -0.6), c, 44);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      SL.Audio.play('punchHeavy');
      m.say('goku', "Got your tail! Every Saiyan has the same weak spot, right?", 2.6);
      yield* m.cine(1.4);
      m.say('raditz', 'Gaaah! Let go of me, Kakarot!', 2.2);
      // the tail itself, stretched from Raditz's back into Goku's fists
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1, 8), SL.Toon.mat(r.def.appearance.outfit.tail));
      SL.Toon.addOutline(tail, 1);
      b.scene.add(tail);
      const tailHook = () => {
        const a = r.pos.clone().add(new V3(0, 0.95 * r.scale, 0)).addScaledVector(fwd, -0.18);
        const c = p.handPos('R').add(p.handPos('L')).multiplyScalar(0.5);
        const d = c.clone().sub(a);
        tail.position.copy(a).addScaledVector(d, 0.5);
        tail.scale.set(1, Math.max(0.1, d.length()), 1);
        tail.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize());
      };
      m.tickHooks.push(tailHook);
      const res = yield* struggle(m, { start: 0.55, drain: 0.22, duration: 3.6, label: 'HOLD ON', onTick: (t) => b.camera.addTrauma(0.015) });
      m.qteParts.push(res.avg);
      // the trick (canon: Goku lets go)
      r.setState('scripted', { pose: 'r_beg', expression: 'hurt' });
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().addScaledVector(fwd, 2.4).add(new V3(0.6, -0.1, 0)), c, 40);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('raditz', "Kakarot... we're brothers. Let me go and I swear I'll leave this planet. You'll never see me again.", 3.4);
      yield* m.cine(3.4);
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(1.4, 0.2, 2.4)), c, 40);
      }, 2, { cut: true, blendIn: 0 });
      m.say('piccolo', "Goku, don't you dare listen to him!", 2);
      yield* m.cine(2);
      p.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(fwd, -2.6).add(new V3(0.8, 0.2, 0)), c, 40);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('goku', '...Alright. Take your pod and go.', 2.4);
      yield* m.cine(2.4);
      m.tickHooks.splice(m.tickHooks.indexOf(tailHook), 1);
      b.scene.remove(tail);
      tail.geometry.dispose();
      r.setState('scripted', { pose: 'r_elbow', expression: 'grin' });
      r.yaw += Math.PI;
      SL.Audio.play('swing');
      m.say('raditz', 'Fool!', 1.4);
      yield 0.25;
      p.takeHit(r, { type: 'melee', damage: 900, knock: 'heavy', knockSpeed: 24, hitstun: 50, impact: 4, dir: fwd.clone().negate().setY(0.2).normalize(), point: p.chest() });
      yield 1.6;
      m.endShot();
      r.setState('scripted', { pose: 'r_laugh', expression: 'grin' });
      m.say('raditz', "Sentiment. That's what makes you weak!", 2.4);
      yield 2.2;
    },
  };

  P.onslaught = {
    id: 'onslaught',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      clearCombat(b);
      // Piccolo backs off to charge; Goku has to keep Raditz busy
      const pcPos = ground(b, new V3(34, 0, 26));
      stage2(pc, pcPos, Math.atan2(-pcPos.x, -pcPos.z));
      pc.controller = scriptedController();
      pc.target = r;
      pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'grit', face: true });
      if (p.state === 'scripted') p.setState('free');
      r.setState('free');
      r.damageDealtMul = 0.85;
      r.damageTakenMul = 0.55;
      r.hp = Math.max(r.hp, r.hpMax * 0.5);
      p.hp = Math.min(p.hpMax, Math.max(p.hp, p.hpMax * 0.45) + p.hpMax * 0.3);
      p.ki = Math.max(p.ki, 50);
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(-2, 0.4, -3)), c.clone().add(new V3(0, 0.3, 0)), 40);
      }, 2.8, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Goku! Keep him busy. I need time to charge a technique that can pierce him.', 2.8);
      yield* m.cine(2.8);
      m.endShot();
      m.lock(false);
      m.limits(GOKU_LIMITS);
      m.music('battle', 3);
      m.objective('stall', 'Keep Raditz busy while Piccolo charges', { icon: 'clock', target: 100 });
      const guardObj = m.objective('counter', 'Perfect Guard or vanish 3 times', { icon: 'fist', optional: true });
      let counters = 0;
      const onCounter = (e) => {
        if (e.fighter !== p || guardObj.done) return;
        counters++;
        if (counters >= 3) m.complete('counter');
      };
      b.on('perfectGuard', onCounter);
      b.on('vanish', onCounter);
      let charge = 0;
      m.tickHooks.push(() => {
        if (b.inputLocked) return;
        r.target = p;
        charge = Math.min(100, charge + 100 / 60 / 32);
        m.progress('stall', Math.floor(charge));
        if (b.frame % 5 === 0) {
          const hp = pc.handPos('R');
          b.vfx.flash(hp, 0.5 + charge * 0.012, 0xfff0a0, 0.15, SL.Toon.tex.glow);
          if (b.frame % 10 === 0) b.vfx.streamInward(hp, 1.6, 0xffe860, 2, 0.08, 0.35);
        }
      });
      m.say('raditz', "Now I'll show you the real gap between us!", 2.4);
      yield () => charge >= 100;
      m.tickHooks.length = 0;
      m.progress('stall', 100);

      // first Special Beam Cannon: Raditz dodges it
      m.lock(true);
      m.limits(null);
      clearCombat(b);
      const rBase = ground(b, new V3(6, 0, -6));
      stage2(r, rBase, Math.atan2(pcPos.x - rBase.x, pcPos.z - rBase.z));
      r.setState('scripted', { pose: 'idle', expression: 'smirk' });
      r.invuln = 1e9;
      stage2(p, ground(b, new V3(-10, 0, -12)), 0.5);
      p.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      pc.faceTarget(100);
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(-3.2, 0.2, 1.2)), c.clone().lerp(r.chest(), 0.3), 42);
      }, 1.8, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Special Beam Cannon!', 1.6);
      yield* m.cine(1.1);
      const beam = fireCannon(b, pc, r);
      const side = new V3(-beam.dir.z, 0, beam.dir.x);
      let dodge = 0;
      m.tickHooks.push(() => {
        const d = beam.origin.distanceTo(r.chest());
        if (beam.headDist > d - 9 && dodge < 1) {
          dodge = Math.min(1, dodge + 1 / 12);
          r.pos.copy(rBase).addScaledVector(side, 2.2 * U.easeOutCubic(dodge));
          if (dodge === 1) {
            b.vfx.sparks(r.chest().addScaledVector(side, -0.5), 0xffe860, 16, 8);
            b.vfx.ghost(r.model, 0xd8b0ff, 0.3, 0.5);
          }
        }
      });
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().addScaledVector(side, -6).add(new V3(0, 1.2, 0)).addScaledVector(beam.dir, -3), c, 50);
      }, 2.4, { cut: true, blendIn: 0 });
      yield 1.3;
      r.setState('scripted', { pose: 'r_taunt', expression: 'grin' });
      m.say('raditz', 'Heh. That grazed my armor. Impressive... and useless.', 2.6);
      yield 1.2;
      beam.stop();
      yield* m.cine(1.4);
      m.tickHooks.length = 0;
      r.invuln = 0;
      m.endShot();
    },
  };

  P.gohan = {
    id: 'gohan',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // Raditz stands over Goku
      const gPos = ground(b, new V3(-6, 0, -10));
      stage2(p, gPos, 2.2);
      p.setState('scripted', { pose: 'knockdownFace', expression: 'hurt' });
      const rPos = ground(b, gPos.clone().add(new V3(0.9, 0, 0.7)));
      stage2(r, rPos, Math.atan2(gPos.x - rPos.x, gPos.z - rPos.z));
      r.setState('scripted', { pose: 'r_stomp', expression: 'grin' });
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, gPos.clone().add(new V3(-2.2, 0.35, 2.2)), c.clone().add(new V3(0, 0.2, 0)), 46);
      }, 3, { cut: true, blendIn: 0 });
      SL.Audio.play('punchHeavy');
      b.camera.addTrauma(0.3);
      m.say('raditz', 'Last chance to beg, little brother.', 2.6);
      yield* m.cine(2.8);
      // the pod reacts
      SL.Audio.play('scouter');
      const podPos = ground(b, POD_POS);
      m.tickHooks.push(() => {
        S.pod.userData.shell.position.x = Math.sin(b.frame * 1.7) * 0.05;
      });
      m.shot((t, out) => camAt(out, podPos.clone().add(new V3(5, 2, 5)), podPos.clone().add(new V3(0, 1, 0)), 44), 2.4, { cut: true, blendIn: 0 });
      m.say('raditz', "My scouter...? A power reading, rising fast! Where is it coming from?", 2.4);
      yield* m.cine(2.4);
      m.tickHooks.length = 0;
      // Gohan bursts out and headbutts Raditz
      b.vfx.explosion(podPos.clone().add(new V3(0, 1, 0)), 3, 0xffffff, { smoke: true });
      b.vfx.debrisBurst(podPos.clone().add(new V3(0, 1, 0)), 16, 0xf2efe8, 12, 0.25);
      SL.Audio.play('rockBreak');
      S.pod.visible = false;
      const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: podPos.clone().add(new V3(0, 1, 0)), grounded: false, dummy: 'idle', infiniteHp: true, cannotDie: true, tags: { cinematic: true } });
      gohan.controller = scriptedController();
      S.gohan = gohan;
      gohan.setState('scripted', { pose: 'g_headbutt', expression: 'shout' });
      const from = gohan.pos.clone();
      const to = r.chest().add(new V3(0, -0.35, 0));
      gohan.yaw = Math.atan2(to.x - from.x, to.z - from.z);
      m.say('gohan', 'LEAVE MY DAD ALONE!', 1.6);
      let fl = 0;
      m.shot((t, out) => {
        const c = gohan.pos;
        camAt(out, c.clone().add(new V3(3.5, 1.2, -3)), c, 52);
      }, 0.7, { cut: true, blendIn: 0 });
      m.tickHooks.push(() => {
        fl = Math.min(1, fl + 1 / 26);
        const pos = from.clone().lerp(to, fl);
        pos.y += Math.sin(fl * Math.PI) * 1.2 - 0.9;
        gohan.setPosition(pos);
        if (b.frame % 2 === 0) b.vfx.trail(gohan.chest(), 0xffffff, 0.35, 0.3);
      });
      yield () => fl >= 1;
      m.tickHooks.length = 0;
      // impact
      const hit = r.chest();
      b.vfx.impact(hit, 5, 0xffffff);
      b.vfx.sparks(hit, 0xd8b0ff, 30, 14);
      SL.ScreenFX.flash(0.7);
      SL.Audio.play('groundImpact');
      SL.Audio.play('punchHeavy');
      b.camera.addTrauma(0.7);
      b.slowmo(0.2, 0.5);
      r.setState('scripted', { pose: 'r_stunned', expression: 'hurt' });
      r.flash = 1;
      gohan.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      stage2(gohan, ground(b, r.pos.clone().addScaledVector(r.forward, 1.6)), r.yaw);
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().addScaledVector(r.forward, 2.4).add(new V3(-0.8, -0.3, 0)), c, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      yield 0.6;
      m.say('raditz', 'My armor... cracked by a child?!', 2.4);
      yield* m.cine(2.4);
    },
  };

  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      clearCombat(b);
      m.clearObjectives();
      if (S.gohan) {
        b.remove(S.gohan);
        S.gohan = null;
      }
      S.pod.visible = false;
      const base = ground(b, new V3(0, 0, -6));
      const pcPos = ground(b, new V3(20, 0, 16));
      const yaw = Math.atan2(pcPos.x - base.x, pcPos.z - base.z);
      const fwd = new V3(Math.sin(yaw), 0, Math.cos(yaw));
      stage2(r, base, yaw);
      stage2(p, ground(b, base.clone().addScaledVector(fwd, -0.62)), yaw);
      stage2(pc, pcPos, yaw + Math.PI);
      pc.controller = scriptedController();
      pc.target = r;
      r.setState('scripted', { pose: 'r_struggle', expression: 'shout' });
      p.setState('scripted', { pose: 'g_fullNelson', expression: 'grit' });
      pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'grit' });
      m.music('finale', 2);
      const side = new V3(fwd.z, 0, -fwd.x);
      m.shot((t, out, el) => {
        const c = r.chest();
        camAt(out, c.clone().addScaledVector(side, 3.4 + Math.sin(el * 0.4) * 0.3).addScaledVector(fwd, 1.4).add(new V3(0, 0.1, 0)), c.clone().addScaledVector(fwd, -0.3), 44);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('goku', "Piccolo! I've got him — do it now!", 2.4);
      yield* m.cine(2.2);
      m.say('raditz', "Let go! If he fires, you die too, you idiot!", 2.4);
      yield* m.cine(1.6);
      m.say('piccolo', "Hold him still, Goku. Ten seconds.", 2.2);
      let charge = 0;
      m.objective('holdOn', "Hold Raditz until Piccolo's attack is ready", { icon: 'clock', target: 100 });
      const res = yield* struggle(m, {
        start: 0.6, drain: 0.16, duration: 8.5, canFail: true, label: 'HOLD HIM', surgeEvery: 1.8, surgeDrain: 0.55, surgeLabel: 'HE’S BREAKING FREE!',
        onSurge: () => {
          b.camera.addTrauma(0.35);
          SL.Audio.play('kiUp');
          r.flash = 0.6;
          b.vfx.ring(r.chest(), 2.4, 0xd8b0ff, 0.3);
        },
        onTick: (t) => {
          charge = Math.min(100, (t / 8.5) * 100);
          m.progress('holdOn', Math.floor(charge));
          if (b.frame % 4 === 0) b.vfx.flash(pc.handPos('R'), 0.6 + t * 0.08, 0xfff0a0, 0.15, SL.Toon.tex.glow);
        },
      });
      if (res.failed) {
        b.camera.endShot();
        r.setState('scripted', { pose: 'r_elbow', expression: 'angry' });
        p.takeHit(r, { type: 'melee', damage: 1, knock: 'heavy', knockSpeed: 20, hitstun: 50, impact: 3, dir: fwd.clone().negate(), point: p.chest() });
        m.say('raditz', 'Too weak to even hold me!', 2);
        yield 1.2;
        m.fail('brokeFree');
        yield () => false;
      }
      m.qteParts.push(res.avg);
      m.progress('holdOn', 100);
      yield* m.def.afterHold(m, { base, fwd, side, pcPos });
    },
  };

  /** Canon ending: the beam pierces both brothers. */
  function* canonEnding(m, ctx) {
    const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
    const { fwd, side } = ctx;
    m.clearObjectives();
    m.shot((t, out) => {
      const c = pc.chest();
      camAt(out, c.clone().addScaledVector(side, -2).add(new V3(0, 0.3, 0)).addScaledVector(fwd, 1.5), c.clone().addScaledVector(fwd, 4), 44);
    }, 1.4, { cut: true, blendIn: 0 });
    m.say('piccolo', 'Special Beam Cannon!', 1.4);
    yield* m.cine(0.9);
    r.invuln = 1e9;
    const beam = fireCannon(b, pc, r);
    let pierced = false;
    m.tickHooks.push(() => {
      if (pierced || beam.done) return;
      if (beam.headDist >= beam.origin.distanceTo(r.chest()) - 0.3) {
        pierced = true;
        const hit = r.chest();
        b.vfx.impact(hit, 3, 0xfff0a0);
        b.vfx.sparks(hit, 0xffe860, 40, 16);
        b.vfx.sparks(p.chest(), 0xffe860, 20, 10);
        SL.ScreenFX.flash(0.35, '#fff6d0');
        SL.Audio.play('explosionBig');
        b.slowmo(0.15, 1.2);
        b.camera.addTrauma(0.9);
        r.setState('scripted', { pose: 'r_pierced', expression: 'hurt' });
        p.setState('scripted', { pose: 'g_pierced', expression: 'hurt' });
        r.flash = p.flash = 1;
      }
    });
    m.shot((t, out) => {
      const c = r.chest();
      camAt(out, c.clone().addScaledVector(side, -5.5).addScaledVector(fwd, 2.5).add(new V3(0, 0.8, 0)), c.clone().addScaledVector(fwd, -0.4), 46);
    }, 3.2, { cut: true, blendIn: 0 });
    yield () => pierced;
    yield 1.6;
    beam.stop();
    m.tickHooks.length = 0;
    p.setState('scripted', { pose: 'knockdown', expression: 'ko' });
    r.setState('scripted', { pose: 'knockdown', expression: 'ko' });
    stage2(p, ground(b, ctx.base.clone().addScaledVector(fwd, -1.5).addScaledVector(side, 0.7)), r.yaw);
    SL.Music.stop(1.5);
    m.shot((t, out) => {
      const c = r.pos.clone();
      camAt(out, c.clone().add(new V3(0, U.lerp(6, 4, t), 0)).addScaledVector(side, 2).addScaledVector(fwd, -1), c, 50);
    }, 12, { cut: true, blendIn: 0 });
    m.say('raditz', "Heh... it doesn't matter. Two more of us are coming. Stronger than me. This planet is finished.", 4);
    yield* m.cine(4);
    m.say('goku', 'Piccolo... Gohan... look after him for me...', 3.2);
    yield* m.cine(3.2);
    m.say('piccolo', 'Rest, Goku. Your son will be ready when they come. I will see to that.', 3.4);
    yield* m.cine(3.4);
    m.fade('black', 1.4);
    yield 1.6;
    m.endShot();
    m.title('EPILOGUE', 'ONE YEAR', 'Goku gave his life to stop his brother. Two more Saiyans are on their way to Earth.', 4.6);
    SL.Music.stinger('defeat');
    yield* m.cine(4.8);
  }

  const canon = {
    id: 'saiyan_brothers',
    canon: true,
    chapter: 'CHAPTER 1 · SAIYAN SAGA',
    title: 'A Brother From Space',
    subtitle: 'Earth · Age 761',
    character: 'goku',
    stage: 'plains',
    parTime: 360,
    qteLabel: 'Grip strength',
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'A Saiyan warrior lands on Earth, calls Goku "Kakarot" and kidnaps his son. Goku must team up with his old enemy, Piccolo.',
    rewards: ['Raditz — playable prototype in Free Battle & Training', 'Grassland Hills stage', 'What-If: "What if Goku defeated Raditz?"'],
    setup,
    phases: [P.intro, P.duo, P.tail, P.onslaught, P.gohan, P.hold],
    afterHold: canonEnding,
  };

  /* ---------------- What-If branch ---------------- */
  const W = {};

  W.recap = {
    id: 'recap',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      m.music('finale', 0);
      S.pod.visible = false;
      const base = ground(b, new V3(0, 0, -6));
      stage2(r, base, 0.3);
      r.setState('scripted', { pose: 'r_stunned', expression: 'hurt' });
      stage2(p, ground(b, new V3(-3, 0, 2)), Math.PI + 0.3);
      p.setState('scripted', { pose: 'g_resolve', expression: 'grit', face: false });
      stage2(pc, ground(b, new V3(20, 0, 16)), -2.3);
      pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'grit' });
      m.title('WHAT IF...?', m.def.title.toUpperCase(), 'A branch from Chapter 1 · Not canon', 4.2);
      m.shot((t, out) => camAt(out, new V3(U.lerp(-24, -12, t), U.lerp(14, 6, t), U.lerp(24, 16, t)), base.clone().add(new V3(0, 1, 0)), 46), 4.4, { cut: true, blendIn: 0 });
      yield* m.cine(4.4);
      m.say('narrator', "Gohan's hidden power cracked Raditz's armor. In the story you know, Goku held his brother still and gave his life so Piccolo's attack could end the fight.", 5);
      yield* m.cine(5);
      m.say('narrator', 'But what if Goku had refused to die that day?', 3);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.6).add(new V3(0.5, 0.1, 0)), c, 40);
      }, 3, { cut: true, blendIn: 0 });
      yield* m.cine(3);
    },
  };

  W.refusal = {
    id: 'refusal',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(-2.4, 0.3, -2)), c, 40);
      }, 2.8, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Goku! Grab him while he is stunned. My attack will finish it — both of you, if it has to.', 3.2);
      yield* m.cine(3.2);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.2).add(new V3(-0.6, 0, 0)), c, 38);
      }, 3.4, { cut: true, blendIn: 0 });
      p.setState('scripted', { pose: 'g_resolve', expression: 'angry' });
      m.say('goku', "No. If I go down with him, who's going to protect Gohan? I'll beat him myself!", 3.4);
      yield* m.cine(3.4);
      m.say('piccolo', "Stubborn fool... Fine. Don't expect me to save you.", 2.6);
      pc.setState('scripted', { pose: 'idle', expression: 'angry' });
      yield* m.cine(2.2);
      r.setState('scripted', { pose: 'r_taunt', expression: 'angry', face: true });
      r.target = p;
      m.shot((t, out) => {
        const c = r.chest();
        camAt(out, c.clone().addScaledVector(r.forward, 3).add(new V3(0, -0.4, 0)), c, 44);
      }, 2.8, { cut: true, blendIn: 0 });
      m.say('raditz', "You just threw away your only chance, Kakarot!", 2.6);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  W.finalFight = {
    id: 'finalFight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      clearCombat(b);
      S.pod.visible = false;
      // Piccolo stays in the fight, but at a distance
      pc.controller = new SL.AIController(b, { difficulty: 'easy', profile: { aggression: 0.2, ranged: 0.8, beam: 0, preferredRange: 14 } });
      for (const f of [p, pc, r]) f.setState('free');
      r.hp = Math.min(r.hp, r.hpMax * 0.62);
      r.damageTakenMul = 1.0;
      r.damageDealtMul = 0.95;
      p.hp = Math.max(p.hp, p.hpMax * 0.6);
      p.ki = Math.max(p.ki, 50);
      r.target = p;
      m.lock(false);
      m.limits(GOKU_LIMITS);
      m.music('battle', 3);
      m.objective('defeat', 'Defeat Raditz — his armor is cracked', { icon: 'skull', target: 100 });
      const kameObj = m.objective('kameHit', 'Hit Raditz with a Kamehameha', { icon: 'beam', optional: true });
      const start = r.hpFrac;
      const onDmg = (e) => {
        if (e.attacker === p && e.target === r && e.type === 'beam' && !kameObj.done) m.complete('kameHit');
      };
      b.on('damage', onDmg);
      m.tickHooks.push(() => {
        r.target = p;
        m.progress('defeat', Math.round(U.clamp01((start - r.hpFrac) / Math.max(0.01, start - 0.15)) * 100));
      });
      yield () => r.hpFrac <= 0.15;
      m.tickHooks.length = 0;
      m.progress('defeat', 100);
      yield 0.4;
    },
  };

  /*
   * The beam duel: Double Sunday against Kamehameha, played as a readable struggle.
   *
   * Raditz winds up (pose, energy gathering), then charges his beam; partway through,
   * his charge FLARES — a bright flash and a rising sound — and from the flare until he
   * fires is the window. The player holds the Kamehameha and chooses when to let go:
   *
   *   early  (before the flare)  Raditz answers at once with what he has; the beams meet,
   *                              but the collision starts on Goku's side of the middle and
   *                              Raditz pushes harder — a weaker, still winnable struggle
   *   window (flare → his shot)  the collision starts on Raditz's side and he pushes less
   *   late   (after his shot)    his beam is on top of Goku: the Kamehameha is forced out
   *                              point-blank and the struggle starts deep on Goku's side
   *
   * Raditz always answers, so an early shot can never catch him mid-charge and end the
   * scene; waiting too long raises the danger instead of handing him the win. Only never
   * firing lets his beam land (Piccolo restages the duel). The struggle itself is the
   * engine's beam clash (SL.BeamClash) — the timing only decides where it starts.
   */
  const DUEL = {
    windup: 36, // frames of visible gathering before his beam charge begins
    tell: 0.45, // share of his beam charge at which it flares and the window opens
    pointBlank: 11, // metres: a Double Sunday this close forces the Kamehameha out
    grades: {
      early: { start: 0.38, rate: 1.12, who: 'piccolo', line: 'Too soon — he had time to brace! Push, Goku!' },
      window: { start: 0.66, rate: 0.85, who: 'goku', line: 'Got you!' },
      late: { start: 0.24, rate: 1.0, who: 'piccolo', line: 'Too close! Push it back!' },
    },
  };

  W.beamDuel = {
    id: 'beamDuel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      let attempts = 0, losses = 0;
      while (true) {
        attempts++;
        m.lock(true);
        m.limits(null);
        clearCombat(b);
        m.clearObjectives();
        r.hp = Math.max(r.hp, r.hpMax * 0.12);
        r.cannotDie = true; // this scene ends with him beaten, not dead
        p.cannotDie = true; // a lost struggle hurts; losing it three times is what fails the mission
        const rPos = ground(b, new V3(0, 0, -22));
        const gPos = ground(b, new V3(0, 0, 14));
        stage2(r, rPos, 0);
        stage2(p, gPos, Math.PI);
        stage2(pc, ground(b, new V3(26, 0, 4)), -1.4);
        pc.controller = scriptedController();
        pc.setState('scripted', { pose: 'idle', expression: 'calm', face: true });
        r.controller = scriptedController();
        p.target = r;
        r.target = p;
        p.ki = p.kiMax;
        r.ki = r.kiMax;
        p.forceBeamRelease = r.forceBeamRelease = false;
        p.setState('scripted', { pose: 'g_resolve', expression: 'angry' });
        r.setState('scripted', { pose: 'r_sundayCharge', expression: 'shout' });
        if (attempts === 1) {
          m.shot((t, out) => {
            const c = r.chest();
            camAt(out, c.clone().add(new V3(-3, 0.5, 4.5)), c, 44);
          }, 2.6, { cut: true, blendIn: 0 });
          m.say('raditz', "Enough! I'll wipe you off this planet! DOUBLE SUNDAY!", 2.6);
          yield* m.cine(2.6);
          m.shot((t, out) => {
            const c = p.chest();
            camAt(out, c.clone().add(new V3(2.2, 0.3, -3)), c, 42);
          }, 1.8, { cut: true, blendIn: 0 });
          m.say('goku', 'Then take everything I have left!', 1.8);
          yield* m.cine(1.8);
        }
        m.endShot();
        m.objective('duel', 'Win the beam struggle with a Kamehameha', { icon: 'beam' });
        p.setState('free');
        const lim = Object.assign({}, ALL_OFF, { s1: undefined });
        delete lim.s1;
        m.limits(lim);
        b.inputLocked = false;
        b.aiLocked = false;
        m.prompt('duelKame', 'special1', 'Kamehameha — hold, and let go when his charge flares', { required: true, always: true, until: () => p.state === 'beamFire' || p.state === 'clash' });
        // the stand-off is framed from the side: from behind Goku, Raditz stands straight behind Goku's own aura
        // and the flare that opens the window is hidden. Held until the beams meet (or one of them lands)
        m.shot((t, out) => {
          const a = p.chest(), d = r.chest().sub(a);
          d.y = 0;
          d.normalize();
          const side = new V3(-d.z, 0, d.x);
          camAt(out, a.clone().addScaledVector(d, -6).addScaledVector(side, 3.4).add(new V3(0, 1.1, 0)), a.clone().addScaledVector(d, 10), 45);
        }, 30, { blendIn: 0.4 });

        // Raditz: gathers (scripted), then charges for real, and always answers
        const duel = { f: 0, stage: 'windup', pressed: false, answer: false, told: false, tellF: -1, gFire: -1, rFire: -1, grade: null, clashStart: null };
        m.flags.duel = duel;
        r.controller = {
          update: () => {
            const it = SL.emptyIntent();
            if (duel.stage !== 'charge') return it;
            if (!duel.pressed) {
              duel.pressed = true;
              it.s1 = true;
            }
            it.s1Held = true;
            return it;
          },
        };
        const hands = (f) => f.handPos('R').add(f.handPos('L')).multiplyScalar(0.5);
        const rBeam = () => b.projectiles.beams.find((bm) => bm.owner === r && !bm.done);
        const duelTick = () => {
          if (b.inputLocked || b.clash.active || duel.clashStart) return;
          duel.f++;
          if (duel.stage === 'windup') {
            // anticipation: the energy gathering in his hands before the charge itself
            if (duel.f % 3 === 0) b.vfx.streamInward(hands(r), 2.4, 0xc050ff, 2, 0.1, 0.4);
            if (duel.f === 1) b.sfx('kiUp', r, { pitch: 0.8, vol: 0.8 });
            if (duel.f >= DUEL.windup) {
              duel.stage = 'charge';
              r.setState('free');
            }
          }
          // the tell: his charge flares, and the window is open
          if (!duel.told && r.state === 'beamCharge' && (r.sd.frac || 0) >= DUEL.tell) {
            duel.told = true;
            duel.tellF = duel.f;
            const h = hands(r);
            b.vfx.flash(h, 11, 0xe0a0ff, 0.45, SL.Toon.tex.glow);
            b.vfx.sparks(h, 0xc050ff, 40, 16);
            b.vfx.ring(h, 6, 0xe0a0ff, 0.5);
            b.sfx('tierUp', r, { pitch: 1.7, vol: 1.1 });
            b.cameraTraumaAt(h, 0.12);
            b.emit('duelTell', { fighter: r });
            if (attempts === 1) m.say('piccolo', 'Now, Goku!', 1.4, { style: 'shout' });
          }
          // from the flare until he fires his hands keep blazing: the window is a state you can see from across the field
          if (duel.told && duel.rFire < 0 && r.state === 'beamCharge' && duel.f % 4 === 0) b.vfx.flash(hands(r), 5.5 + Math.sin(duel.f * 0.5) * 1.5, 0xe0a0ff, 0.14, SL.Toon.tex.glow);
          // Goku lets go: grade it, and Raditz answers at once with whatever he has
          if (duel.gFire < 0 && p.state === 'beamFire') {
            duel.gFire = duel.f;
            duel.grade = duel.rFire >= 0 ? 'late' : duel.told ? 'window' : 'early';
            if (duel.rFire < 0) duel.answer = true;
          }
          if (duel.answer && duel.rFire < 0) {
            if (duel.stage === 'windup') {
              duel.stage = 'charge';
              r.setState('free');
            }
            if (r.state === 'beamCharge') r.forceBeamRelease = true;
          }
          if (duel.rFire < 0 && r.state === 'beamFire') duel.rFire = duel.f;
          // too late: his beam is on top of Goku while Goku is still gathering — it comes out now
          if (duel.rFire >= 0 && p.state === 'beamCharge') {
            const bm = rBeam();
            if (bm && bm.head.distanceTo(p.chest()) < DUEL.pointBlank) p.forceBeamRelease = true;
          }
        };
        m.tickHooks.push(duelTick);

        let clashResult = null, clashT = 0, gokuHit = false;
        const onStart = () => {
          const c = b.clash.active;
          if (!c || duel.clashStart) return;
          m.endShot();
          const g = DUEL.grades[duel.grade || 'late'];
          const sign = c.a.owner === p ? 1 : -1;
          // where the collision starts says how the timing went; how hard he pushes follows it
          c.push = (g.start - 0.5) * 2 * sign;
          if (c.a.owner === r) c.aiRateA *= g.rate;
          else c.aiRateB *= g.rate;
          duel.grade = duel.grade || 'late';
          duel.clashStart = b.clash.playerProgress();
          m.say(g.who, g.line, 2.2, { style: 'shout' });
          b.emit('duelGrade', { grade: duel.grade, start: duel.clashStart });
        };
        const onEnd = (e) => {
          clashResult = e;
        };
        const onDmg = (e) => {
          if (b.clash.active || clashResult) return;
          if (e.attacker === r && e.target === p && e.type === 'beam') gokuHit = true;
        };
        const offs = [b.on('clashStart', onStart), b.on('clashEnd', onEnd), b.on('damage', onDmg)];
        const clashTick = () => {
          if (b.clash.active) clashT = b.clash.active.t;
        };
        m.tickHooks.push(clashTick);
        const t0 = m.time;
        yield () => clashResult || (gokuHit && !b.projectiles.beams.length) || (m.time - t0 > 12 && !b.clash.active);
        b.emit('prompt', { id: 'duelKame', show: false });
        m.prompts.delete('duelKame');
        m.endShot();
        for (const off of offs) if (off) off();
        for (const h of [duelTick, clashTick]) {
          const hi = m.tickHooks.indexOf(h);
          if (hi >= 0) m.tickHooks.splice(hi, 1);
        }
        p.forceBeamRelease = r.forceBeamRelease = false;
        m.flags.duelAttempts = attempts;
        if (clashResult && clashResult.winner === p) {
          // a faster clash win scores higher, and the window is worth more than a rescue
          const bonus = duel.grade === 'window' ? 0.15 : duel.grade === 'early' ? 0 : -0.1;
          m.qteParts.push(U.clamp01(1.25 - clashT / 7 + bonus));
          m.flags.duelWonGrade = duel.grade;
          m.complete('duel');
          yield 1.8;
          break;
        }
        if (clashResult && clashResult.winner === r) {
          losses++;
          m.flags.duelLosses = losses;
          yield 1.6;
          if (losses >= 3) {
            p.cannotDie = false;
            m.fail('clashLost');
            yield () => false;
          }
          m.say('piccolo', losses === 1 ? 'Get up, Goku! That took everything he had too — again!' : 'One more time. Watch his hands!', 2.6);
          yield 2.4;
          continue;
        }
        // no clash (Goku never fired) or a draw: restage and try again
        m.say('piccolo', clashResult ? 'Neither one gave an inch! Again!' : 'Goku! Answer his attack with your Kamehameha — let go when his charge flares!', 2.6);
        yield 2.4;
      }
    },
  };

  W.aftermath = {
    id: 'aftermath',
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      m.limits(null);
      clearCombat(b);
      m.clearObjectives();
      const rPos = ground(b, new V3(0, 0, -16));
      stage2(r, rPos, 0);
      r.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      const gPos = ground(b, new V3(0.6, 0, -11.5));
      stage2(p, gPos, Math.PI);
      p.setState('scripted', { pose: 'g_resolve', expression: 'grit' });
      const pcPos = ground(b, new V3(5, 0, -10));
      stage2(pc, pcPos, Math.atan2(rPos.x - pcPos.x, rPos.z - pcPos.z));
      pc.setState('scripted', { pose: 'idle', expression: 'calm' });
      SL.Music.stop(1);
      m.shot((t, out) => camAt(out, rPos.clone().add(new V3(U.lerp(-6, -4, t), U.lerp(3, 2, t), U.lerp(6, 4, t))), rPos.clone().add(new V3(0, 0.6, 2)), 46), 20, { cut: true, blendIn: 0 });
      m.say('raditz', 'Beaten... by a Saiyan raised on this backwater rock...', 3);
      yield* m.cine(3);
      m.say('goku', "You're still my brother. Get in your pod, leave Earth, and never come back.", 3.2);
      yield* m.cine(3.2);
      pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'angry' });
      m.say('piccolo', 'He will only come back stronger. Let me end this now.', 2.8);
      yield* m.cine(2.8);
      p.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.say('goku', 'No, Piccolo.', 1.6);
      yield* m.cine(1.6);
      SL.Audio.play('scouter');
      m.say('vegeta_voice', "Raditz, you disgrace. We heard every word over your scouter. Wish-granting Dragon Balls... this planet sounds worth a visit.", 4.4);
      yield* m.cine(4.4);
      m.say('raditz', 'Vegeta... they are coming. And now they know everything.', 3);
      yield* m.cine(3);
      pc.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.say('goku', "Then I'll get stronger. I'm still here — and I'm not going anywhere.", 3.2);
      yield* m.cine(3.2);
      m.fade('black', 1.4);
      yield 1.6;
      m.endShot();
      m.title('WHAT-IF ENDING', 'THE BROTHER WHO LIVED', "Goku never died, so he never trained with King Kai. Vegeta and Nappa arrive in one year — and they know about the Dragon Balls.", 5.2);
      SL.Music.stinger('victory');
      yield* m.cine(5.4);
    },
  };

  const whatIf = {
    id: 'whatif_raditz',
    whatIf: true,
    branchOf: 'saiyan_brothers',
    branchPoint: 'hold',
    chapter: 'WHAT IF · CHAPTER 1',
    title: 'What if Goku defeated Raditz?',
    subtitle: 'Earth · Age 761 · Alternate timeline',
    character: 'goku',
    stage: 'plains',
    parTime: 240,
    qteLabel: 'Beam struggle',
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'At the moment Goku should grab his brother and sacrifice himself, he refuses. Can he win without dying?',
    rewards: ['An alternate ending'],
    setup,
    phases: [W.recap, W.refusal, W.finalFight, W.beamDuel, W.aftermath],
  };

  SL.data.missions[canon.id] = canon;
  SL.data.missions[whatIf.id] = whatIf;
})();
