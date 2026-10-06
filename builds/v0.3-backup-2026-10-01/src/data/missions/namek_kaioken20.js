/*
 * CHAPTER 4 — NAMEK SAGA
 * Mission "Kaio-ken Times Twenty" (canon, played as Goku).
 *
 * Canon beats: x4 is not enough, so x10 — and for a while Goku is winning exchanges. Then
 * Frieza shows fifty percent of his maximum and it is over again. Goku goes to x20, a
 * multiplier his body should not survive, and throws everything into a Kamehameha. Frieza
 * turns it away with one hand. It hurt him. It did not matter. Goku is spent.
 *
 * Phases: TEN (checkpoint: scene `goku_kaioken10`, then the x10 fight) → REVEAL (scene
 * `frieza_fifty_percent`) → TWENTY (scene `goku_kaioken20`, the major activation) →
 * DESPERATE (checkpoint: the x20 fight against fifty percent) → KAMEHAMEHA (checkpoint:
 * the x20 Kamehameha, pushed as a struggle; Frieza holds it with one hand) → DEFLECT
 * (scene `frieza_deflects_kamehameha`) → SPENT (Goku understands he cannot win this).
 *
 * The story caps: x10 from TEN, x20 from TWENTY (formCaps). Super Saiyan stays locked.
 * Strain is scaled down for these two fights (strainScale) so the multipliers can be
 * fought in for more than a few seconds; the health drain is real.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const TEN_SECONDS = 25;
  const TWENTY_SECONDS = 22;

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
  const cpu = (b, profile) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  /** The Kaioken at an exact level (the engine only climbs one level per charge). */
  function kaioken(g, level) {
    if (g.formIndex !== 1) g.applyForm(1);
    g.formLevel = Math.min(level, g.form.levels.length - 1);
    g._applyFormLevel();
  }
  /** Stage the two of them for a scene, apart and facing each other. */
  function stage(b, S, gap = 9) {
    clearCombat(b);
    for (const f of [S.goku, S.frieza]) f.controller = scripted();
    place(S.goku, ground(b, FIELD.clone().add(new V3(0, 0, gap * 0.5))), Math.PI);
    place(S.frieza, ground(b, FIELD.clone().add(new V3(0, 0, -gap * 0.5))), 0);
    faceTo(S.goku, S.frieza.pos);
    faceTo(S.frieza, S.goku.pos);
  }
  /** Both fighters back under control for a played phase. */
  function fight(m, S, opts) {
    const b = m.battle, g = S.goku, fz = S.frieza;
    g.setHidden(false);
    g.untargetable = false;
    b.switchPlayer(g, { force: true });
    m.teach(g, 'form:kaioken');
    g.lockedSlots = { transform: true };
    g.formCaps = { kaioken: opts.cap };
    kaioken(g, opts.cap);
    g.strain = 0;
    g.strainScale = opts.strainScale;
    g.cannotDie = true;
    g.ki = Math.max(g.ki, 80);
    fz.applyForm(3);
    fz.mech.phase = 3;
    fz.bossPhaseCap = 3;
    fz.cannotDie = true;
    fz.infiniteHp = true;
    fz.storyEvade = null;
    fz.aiPhase = 'dominant';
    fz.aiRhythm = opts.rhythm || null;
    fz.damageDealtMul = opts.frieza;
    fz.controller = cpu(b, opts.profile);
    fz.target = g;
    g.target = fz;
    g.setState('free');
    fz.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 40);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 5))), startKi: 100 });
    goku.lockedSlots = { transform: true };
    goku.formCaps = { kaioken: 3 }; // this mission is where x10 exists; x20 arrives with the fifty percent
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(16, 0, 18))), startKi: 30 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-15, 0, 19))), startKi: 30 });
    for (const f of [krillin, gohan]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.12);
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -5))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    faceTo(frieza, goku.pos);
    faceTo(goku, frieza.pos);
    b.story = { goku, krillin, gohan, frieza };
  }

  const P = {};

  /* x10: lit on screen, then played. For a while, Goku is winning exchanges. */
  P.ten = {
    id: 'ten',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      m.music('finale', 3);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.2);
      stage(b, S, 8);
      m.teach(g, 'form:kaioken');
      kaioken(g, 2);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.7));
      g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'grit' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      yield* SL.Cinema.play(m, 'goku_kaioken10');
      // x10: for a while Goku wins exchanges — Frieza is still measured, strings of two to four
      fight(m, S, { cap: 3, strainScale: 0.15, frieza: 0.6, rhythm: { burst: 3, rest: 80 }, profile: { comboLen: 3 } });
      m.music('battle', 4);
      m.objective('ten', 'Fight him at Kaioken x10', { icon: 'clock', target: TEN_SECONDS });
      m.objective('land', 'Land ten hits at x10', { icon: 'fist', optional: true, target: 10 });
      let landed = 0, dropped = 0;
      b.on('damage', (e) => {
        if (e.target !== fz || e.attacker !== g || g.formIndex !== 1) return;
        landed++;
        m.progress('land', Math.min(10, landed));
        if (landed === 4) m.say('frieza', 'Tch — lucky.', 1.4);
        if (landed === 8) m.say('frieza', 'Enough of this!', 1.6);
      });
      b.on('powerDown', (e) => {
        if (e.fighter === g) dropped++;
      });
      m.prompt('k10Back', 'transform', 'Kaioken dropped — light it again and push back to x10', {
        required: true,
        always: true,
        when: () => g.formIndex === 0 && g.state === 'free',
        until: () => g.formIndex === 1 && g.formLevel >= 3,
      });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('ten', Math.min(TEN_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= TEN_SECONDS || !g.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!g.alive) return;
      m.complete('ten');
      if (landed >= 10) m.complete('land');
      else m.failObjective('land');
      m.flags.x10Landed = landed;
      m.flags.x10Dropped = dropped;
      m.qteParts.push(U.clamp01(g.hpFrac * 1.5));
      yield 0.4;
    },
  };

  P.reveal = {
    id: 'reveal',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.clearObjectives();
      stage(b, S, 7);
      yield* SL.Cinema.play(m, 'frieza_fifty_percent');
    },
  };

  P.twenty = {
    id: 'twenty',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.goku, S.frieza]) f.controller = scripted();
      // he is where the fifty percent put him: on the ground, well back
      if (!m.flags.fiftyPercent) stage(b, S, 14);
      faceTo(S.goku, S.frieza.pos);
      faceTo(S.frieza, S.goku.pos);
      yield* SL.Cinema.play(m, 'goku_kaioken20');
    },
  };

  /* x20 against fifty percent: he can hurt Frieza now, and it is costing him everything. */
  P.desperate = {
    id: 'desperate',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      stage(b, S, 10);
      m.flags.fiftyPercent = true;
      m.flags.kaioken20 = true;
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.55));
      // fifty percent: much more threatening — longer bursts, shorter looks — but still a rhythm
      fight(m, S, { cap: 4, strainScale: 0.12, frieza: 1.15, rhythm: { burst: 4, rest: 55 }, profile: { comboLen: 3 } });
      // x20 is already burning his health: what Frieza lands on top of it must not grind him to nothing
      g.damageTakenMul = 0.55;
      fz.fiftyPercent = true;
      m.music('finale', 5);
      m.objective('twenty', 'Kaioken x20 — hold on', { icon: 'clock', target: TWENTY_SECONDS });
      m.objective('hurt', 'Make him feel it: six hits', { icon: 'fist', optional: true, target: 6 });
      let landed = 0;
      b.on('damage', (e) => {
        if (e.target !== fz || e.attacker !== g) return;
        landed++;
        m.progress('hurt', Math.min(6, landed));
        if (landed === 3) m.say('frieza', 'He is actually... keeping up?!', 1.8);
      });
      m.prompt('k20Back', 'transform', 'Light the Kaioken again — he will not wait', {
        required: true,
        always: true,
        when: () => g.formIndex === 0 && g.state === 'free',
        until: () => g.formIndex === 1,
      });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('twenty', Math.min(TWENTY_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= TWENTY_SECONDS || !g.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!g.alive) return;
      m.complete('twenty');
      if (landed >= 6) m.complete('hurt');
      else m.failObjective('hurt');
      m.flags.x20Landed = landed;
      m.qteParts.push(U.clamp01(g.hpFrac * 1.5));
      yield 0.4;
    },
  };

  /*
   * THE x20 KAMEHAMEHA. Charged on screen, then pushed by the player; Frieza takes it on one
   * open hand. However hard it is pushed, the next scene is the same — he turns it away.
   */
  P.kamehameha = {
    id: 'kamehameha',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      stage(b, S, 16);
      m.teach(g, 'form:kaioken');
      g.formCaps = { kaioken: 4 };
      kaioken(g, 4);
      g.strainScale = 0; // the scene owns the body now
      g.damageTakenMul = 1;
      // he is spent, not dying: the story needs him on his feet for the Spirit Bomb
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.35));
      fz.infiniteHp = true;
      fz.cannotDie = true;
      g.setState('scripted', { pose: 'g_kameCharge', expression: 'shout' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.music('finale', 5);
      // the charge, close on his hands
      m.shot((t, out) => {
        const c = g.chest();
        camAt(out, c.clone().addScaledVector(g.forward, U.lerp(2.4, 1.7, t)).add(new V3(1, 0.2, 0)), c, U.lerp(42, 36, t));
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('goku', 'Ka... me... ha... me...', 3, { style: 'shout' });
      const hands = () => g.chest().addScaledVector(g.forward, -0.35).add(new V3(0, -0.1, 0));
      const charge = () => {
        if (b.frame % 3 === 0) b.vfx.streamInward(hands(), 2.4, 0x7ad0ff, 3, 0.12, 0.4);
        if (b.frame % 20 === 0) b.vfx.flash(hands(), 1.2, 0xc8ecff, 0.25, SL.Toon.tex.glow);
        b.camera.addTrauma(0.01);
      };
      m.tickHooks.push(charge);
      yield* m.cine(3.2);
      m.tickHooks.splice(m.tickHooks.indexOf(charge), 1);
      // Frieza does not dodge it. He puts out one hand.
      fz.setState('scripted', { pose: 'fz_aim', expression: 'smirk' });
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(fz, g, { fov: 38, back: 2.4, side: -1, height: 0.7, lookUp: 0.2 });
        camAt(out, s.pos, s.look, s.fov);
      }, 1.6, { cut: true, blendIn: 0 });
      m.say('frieza', 'Go on, then.', 1.4);
      yield* m.cine(1.6);
      // HA
      g.setState('scripted', { pose: 'g_kameFire', expression: 'shout' });
      const spec = Object.assign({}, g.def.specials.special1, { range: 60, sustain: 999, damage: [0, 0], radius: [0.9, 1.1] });
      const beam = b.projectiles.spawnBeam(g, spec, 1);
      beam.hitSet.add(fz);
      b.sfx('beamFire', g, { vol: 1.4, pitch: 0.85 });
      b.vfx.flash(hands(), 5, 0xe8f8ff, 0.4, SL.Toon.tex.glow);
      m.say('goku', 'HAAAAAA!', 2, { style: 'shout' });
      const palm = () => fz.chest().addScaledVector(fz.forward, 0.9).add(new V3(0, 0.15, 0));
      const hold = () => {
        beam.headOverride = palm();
        if (b.frame % 2 === 0) b.vfx.sparks(palm(), 0x9ad8ff, 5, 12, 0.12);
        fz.vel.set(0, 0, 0);
      };
      m.tickHooks.push(hold);
      m.shot((t, out) => {
        const mid = g.chest().lerp(fz.chest(), 0.5);
        const side = new V3(-(fz.pos.z - g.pos.z), 0, fz.pos.x - g.pos.x).normalize();
        camAt(out, mid.clone().addScaledVector(side, U.lerp(15, 13, t)).add(new V3(0, 1.6, 0)), mid, 50);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(0.8);
      // the push: everything he has left. It shapes the score, not the outcome
      let pushed = 0;
      const res = yield* m.struggle({
        start: 0.5,
        drain: 0.3,
        duration: 4.2,
        label: 'KAIOKEN x20 — PUSH',
        canFail: false,
        onTick: (t, grip) => {
          pushed = Math.max(pushed, 1 - grip);
          // the harder he pushes, the further Frieza slides back on his heels
          const back = fz.forward.clone().multiplyScalar(-(1 - grip) * 0.02);
          fz.setPosition(fz.pos.clone().add(back));
          b.cameraTraumaAt(palm(), 0.04 + (1 - grip) * 0.08);
        },
      });
      m.flags.kameAvg = Math.round(res.avg * 100) / 100;
      m.qteParts.push(U.clamp01(res.avg * 1.4));
      m.tickHooks.splice(m.tickHooks.indexOf(hold), 1);
      beam.headOverride = palm();
      m.endShot();
      yield* SL.Cinema.play(m, 'frieza_deflects_kamehameha', { beam });
    },
  };

  P.spent = {
    id: 'spent',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      if (g.formIndex !== 0) g.applyForm(0);
      g.strainScale = 1;
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.25));
      g.setState('scripted', { pose: 'g_defeatKnee', expression: 'hurt' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(fz, g, { fov: 38, back: U.lerp(2.6, 2.2, t), side: 1, height: 0.9, lookUp: -0.1 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('frieza', 'Now you understand. There is no multiplier that closes this distance.', 3.4);
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const h = g.chest().add(new V3(0, 0.45, 0));
        camAt(out, h.clone().addScaledVector(g.forward, U.lerp(1.3, 1, t)).add(new V3(0.35, -0.1, 0)), h, 36);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('goku', 'He is right. I cannot win this one on my own. Not with my own power.', 3.6, { style: 'quiet' });
      yield* m.cine(3.8);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'KAIO-KEN TIMES TWENTY', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_kaioken20',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'Kaio-ken Times Twenty',
    subtitle: 'Namek · x10, fifty percent, x20 — and one hand',
    character: 'goku',
    stage: 'namek',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'x10, and for a while he is winning. Then Frieza shows fifty percent, and Goku takes the Kaioken to twenty times — a multiplier his body should not survive.',
    rewards: ['Kaioken x10 and x20 (story)', 'Chapter 4 continues'],
    setup,
    phases: [P.ten, P.reveal, P.twenty, P.desperate, P.kamehameha, P.spent],
  };

  SL.data.missions[def.id] = def;
})();
