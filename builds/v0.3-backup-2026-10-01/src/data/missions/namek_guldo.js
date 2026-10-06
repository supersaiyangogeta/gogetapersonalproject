/*
 * CHAPTER 4 — NAMEK SAGA (sixth mission of the Namek foundation, in development)
 * Mission "Five Seconds" (canon, played as Krillin with Kid Gohan as the second hero).
 *
 * Canon beats: Frieza's elite squad lands on Namek, takes the Dragon Balls off
 * Krillin and Gohan, and settles who gets to fight with a game. Guldo draws the
 * short straw and the two Earthlings — and loses his temper when he cannot touch
 * them. He is the weakest fighter present and still nearly kills them both,
 * because for as long as he holds his breath nobody else in the world moves.
 *
 * Phases: ARRIVAL (cutscene: the squad lands) → GULDO (checkpoint: the fight,
 * where the danger is the frozen seconds, not his fists) → BREATH (his last
 * freeze fails and Vegeta ends him) → AFTER (cutscene: Recoome steps up).
 *
 * The fight is built around one rule the player learns the hard way: when the
 * world goes grey you cannot act, so the answer is to never be somewhere bad
 * when it happens — stay spread out, keep distance, and punish the gasp.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);

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
  function fall(b, f, by) {
    b.vfx.explosion(f.chest(), 4, 0xd8ffc0, { smoke: true });
    b.cameraTraumaAt(f.chest(), 0.7);
    SL.ScreenFX.flash(0.3, '#ffffff');
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
    clearArea(b, FIELD, 30);
    const krillin = b.spawn({ charId: 'krillin', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(3, 0, 12))), startKi: 60 });
    // Guru has already unlocked him by this point in the story
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-3, 0, 13))), startKi: 60 });
    gohan.controller = scripted();
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(12, 0, 16))), startKi: 80 });
    vegeta.controller = scripted();
    vegeta.untargetable = true;
    vegeta.lockedForms = { ssj: true };
    const guldo = b.spawn({ charId: 'guldo', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -6))), startKi: 130, tags: { boss: true, priority: true } });
    guldo.controller = scripted();
    guldo.setHidden(true);
    guldo.untargetable = true;
    faceTo(krillin, FIELD);
    faceTo(gohan, FIELD);
    b.story = { krillin, gohan, vegeta, guldo };
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, gd = S.guldo, v = S.vegeta;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      // how the prince came to be standing with them (the Dragon Balls, the Ginyu Force in the sky)
      yield* SL.Cinema.play(m, 'namek_alliance');
      m.lock(true);
      k.setState('scripted', { pose: 'idle', expression: 'grit' });
      g.setState('scripted', { pose: 'kg_scared', expression: 'hurt' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.shot((t, out) => camAt(out, ground(b, FIELD.clone().add(new V3(U.lerp(-20, -13, t), 0, U.lerp(18, 14, t))), U.lerp(8, 3.4, t)), k.chest(), 48), 3.6, { cut: true, blendIn: 0 });
      SL.Audio.play('scouter');
      m.say('krillin', 'Five power levels. All of them higher than anything we have fought.', 3.2);
      yield* m.cine(3.6);
      // Guldo drops in — the smallest one, and the one nobody is worried about
      gd.setHidden(false);
      gd.setPosition(ground(b, FIELD.clone().add(new V3(0, 0, -4)), 7));
      gd.grounded = false;
      faceTo(gd, k.pos);
      gd.setState('scripted', { pose: 'gd_taunt', expression: 'smirk' });
      let drop = 0;
      m.tickHooks.push(() => {
        if (drop >= 1) return;
        drop = Math.min(1, drop + 1 / 70);
        const gy = b.stage.heightAt(gd.pos.x, gd.pos.z);
        gd.pos.y = U.lerp(gy + 7, gy, U.easeInCubic(drop));
        gd.prevPos.copy(gd.pos);
        gd.vel.set(0, 0, 0);
        if (drop >= 1) {
          gd.grounded = true;
          b.vfx.dust(gd.pos, 1.8, 14);
          b.sfx('groundImpact', gd, { vol: 0.5 });
        }
      });
      m.shot((t, out) => {
        const c = gd.chest();
        camAt(out, c.clone().addScaledVector(gd.forward, 2.8).add(new V3(-0.7, U.lerp(1.4, 0.3, t), 0)), c, 42);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('guldo', 'I won the game, so I get the little ones. Do not look so relieved.', 3.2);
      yield* m.cine(3.4);
      m.tickHooks.length = 0;
      m.shot((t, out) => camAt(out, k.chest().clone().addScaledVector(k.forward, 2.2).add(new V3(0.7, 0.2, 0)), k.chest(), 40), 2.6, { cut: true, blendIn: 0 });
      m.say('krillin', 'He is the smallest of them. That is not as comforting as it should be.', 2.4);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  P.guldo = {
    id: 'guldo',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, gd = S.guldo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      gd.setHidden(false);
      gd.untargetable = false;
      gd.hp = gd.hpMax;
      gd.ki = gd.kiMax;
      gd.mech.phase = 0;
      gd.cannotDie = true;
      place(k, ground(b, FIELD.clone().add(new V3(3, 0, 10))), Math.PI);
      place(g, ground(b, FIELD.clone().add(new V3(-3, 0, 11))), Math.PI);
      place(gd, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      k.hp = k.hpMax;
      g.hp = g.hpMax;
      gd.controller = cpu(b);
      g.controller = null;
      k.setState('free');
      g.setState('free');
      b.setParty([k, g]);
      for (const h of [k, g]) h.target = gd;
      gd.target = k;
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('guldo', 'Beat Guldo', { icon: 'fist' });
      const unfrozen = m.objective('unfrozen', 'Never be caught by a freeze', { icon: 'guard', optional: true });
      let freezes = 0, caught = false;
      b.on('timeFreeze', (e) => {
        freezes++;
        if (e.victims > 0 && !caught) {
          caught = true;
          m.failObjective('unfrozen');
        }
      });
      // the lesson: the gasp after a freeze is the only opening that matters
      m.prompt('gdGasp', 'heavy', 'He is out of air — hit him', { always: true, when: () => gd.state === 'stagger', until: () => gd.state !== 'stagger' });
      m.prompt('gdSpread', 'partyNext', 'Switch hero', { always: true, when: () => b.player.hpFrac < 0.5, until: () => SL.Input.pressed('partyNext') });
      yield () => gd.hpFrac <= 0.2 || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      m.complete('guldo');
      if (!caught) m.complete('unfrozen');
      m.flags.freezes = freezes;
      yield 0.4;
    },
  };

  P.breath = {
    id: 'breath',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, gd = S.guldo, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      gd.controller = scripted();
      place(gd, ground(b, k.pos.clone().addScaledVector(k.forward, 5)));
      faceTo(gd, k.pos);
      faceTo(k, gd.pos);
      // one last freeze — and it fails, because he is out of air
      gd.setState('scripted', { pose: 'gd_hold', expression: 'grit' });
      b.stage.setMood(0.5, 0x2a2a3a, 0.2);
      SL.ScreenFX.flash(0.3, '#d8d8f0');
      m.shot((t, out) => {
        const c = gd.chest();
        camAt(out, c.clone().addScaledVector(gd.forward, 2.6).add(new V3(0.6, 0.5, 0)), c, 42);
      }, 2.4, { cut: true, blendIn: 0 });
      yield* m.cine(1.6);
      gd.setState('scripted', { pose: 'gd_gasp', expression: 'hurt' });
      b.stage.clearMood(0.3);
      SL.Audio.play('itPop', { pitch: 1.2 });
      m.say('guldo', 'No — no, wait, I just need a second—', 2.4);
      yield* m.cine(2.6);
      // Vegeta has been watching the whole time, and he is not interested in the game
      v.untargetable = false;
      v.setHidden(false);
      place(v, ground(b, gd.pos.clone().addScaledVector(gd.forward, -6)));
      faceTo(v, gd.pos);
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 3).add(new V3(0.8, 0.6, 0)), v.chest().clone().lerp(gd.chest(), 0.4), 46), 3, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Your whole trick is needing a second. You should have picked a better one.', 3);
      yield* m.cine(3.2);
      v.setState('scripted', { pose: 'v_bigBang', expression: 'angry' });
      finisher(b, v, gd, 0x7fc6ff, 0.9);
      yield 0.3;
      fall(b, gd, v);
      yield* m.cine(1.6);
      m.endShot();
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      k.setState('scripted', { pose: 'idle', expression: 'grit' });
      g.setState('scripted', { pose: 'idle', expression: 'hurt' });
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.shot((t, out) => camAt(out, k.chest().clone().add(new V3(3.4, 1.6, 3.6)), k.chest().clone().lerp(v.chest(), 0.4), 48), 3.4, { cut: true, blendIn: 0 });
      m.say('krillin', 'That was the weakest one of them.', 2.6);
      yield* m.cine(2.8);
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 2.4).add(new V3(-0.6, 0.3, 0)), v.chest(), 40), 3, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Yes. The next one is Recoome, and he enjoys this.', 2.8);
      yield* m.cine(3);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'FIVE SECONDS', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_guldo',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'Five Seconds',
    subtitle: 'Namek · Krillin and Gohan against the Ginyu Force',
    character: 'krillin',
    stage: 'namek',
    parTime: 260,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The Ginyu Force lands and plays a game for the right to fight you. The one who wins cannot hurt you — as long as he is breathing.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.arrival, P.guldo, P.breath, P.after],
  };

  SL.data.missions[def.id] = def;
})();
