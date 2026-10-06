/*
 * CHAPTER 4 — NAMEK SAGA (second mission of the Namek foundation, in development)
 * Mission "The Hunted" (canon, played as Krillin with Gohan as the second hero).
 *
 * Canon beats: while Vegeta hunts the Dragon Balls, Dodoria's men wipe out a
 * Namekian village. Krillin and Gohan pull the child Dende out of it, run for
 * their lives with Dodoria hunting them by scouter, and only get away when
 * Gohan blasts him in the face. Dodoria goes off to report it — and runs into
 * Vegeta (the next mission).
 *
 * Phases: VILLAGE (cutscene + two soldiers) → FLIGHT (checkpoint: carry Dende to
 * cover while Dodoria sweeps for them) → CORNERED (checkpoint: hold Dodoria off,
 * switch to Gohan and land Masenko while his guard is broken) → GETAWAY (cutscene).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const VILLAGE = new V3(0, 0, -30);

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
    f.yaw = yaw === undefined ? f.yaw : yaw;
    f.prevYaw = f.yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  function offstage(f) {
    f.untargetable = true;
    f.controller = scripted();
    f.setHidden(true);
  }
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
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
  /** A finishing shot that belongs to the cutscene: the blast is visual, the scene decides what happens. */
  function finisher(b, from, to, color, radius) {
    const origin = from.handPos('R');
    b.projectiles.spawnBlast(from, origin, to.chest().sub(origin).normalize(), { kind: 'ball', speed: 130, radius, damage: 0, color, core: 0xffffff, explode: radius * 5, knock: 'flinch', impact: 3, life: 0.5 });
    b.sfx('kiBlastBig', from);
  }
  function fall(b, f, by) {
    b.vfx.explosion(f.chest(), 4, 0xffe0f0, { smoke: true });
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
    clearArea(b, VILLAGE, 26);
    const krillin = b.spawn({ charId: 'krillin', player: true, team: 0, pos: ground(b, VILLAGE.clone().add(new V3(6, 0, 20))), startKi: 60 });
    // Guru has not touched him yet (see namek_guru)
    krillin.lockedForms = { potential: true };
    krillin.lockedSlots = { transform: true };
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, VILLAGE.clone().add(new V3(-3, 0, 21))), startKi: 60 });
    gohan.controller = scripted();
    const dende = b.spawn({ charId: 'dende', team: 0, pos: ground(b, VILLAGE.clone().add(new V3(-2, 0, -3))), tags: { cinematic: true } });
    dende.controller = scripted();
    dende.untargetable = true;
    dende.cannotDie = true;
    dende.infiniteHp = true;
    const elder = b.spawn({ charId: 'namekian_elder', team: 0, pos: ground(b, VILLAGE.clone().add(new V3(-2, 0, 0))), tags: { cinematic: true } });
    elder.controller = scripted();
    elder.untargetable = true;
    const s1 = b.spawn({ charId: 'frieza_soldier', team: 1, pos: ground(b, VILLAGE.clone().add(new V3(2, 0, -8))), tags: { priority: true } });
    const s2 = b.spawn({ charId: 'frieza_soldier', team: 1, pos: ground(b, VILLAGE.clone().add(new V3(-6, 0, -7))), tags: { priority: true } });
    for (const s of [s1, s2]) {
      s.controller = scripted();
      s.untargetable = true;
    }
    const dodoria = b.spawn({ charId: 'dodoria', team: 1, pos: ground(b, VILLAGE.clone().add(new V3(0, 0, -60))), tags: { boss: true, priority: true } });
    offstage(dodoria);
    faceTo(krillin, VILLAGE);
    faceTo(gohan, VILLAGE);
    b.story = { krillin, gohan, dende, elder, soldiers: [s1, s2], dodoria };
  }

  /** Dende is carried: he rides just under the hero who has him. */
  function carry(m, hero) {
    const b = m.battle, d = b.story.dende;
    d.setHidden(false);
    d.setState('scripted', { pose: 'nk_carried', aura: 0 });
    m.carrier = hero;
    if (!m.carryHook) {
      m.carryHook = () => {
        const h = m.carrier;
        if (!h || !h.alive) return;
        const f = h.forward;
        d.pos.copy(h.pos).addScaledVector(f, -0.15).add(new V3(0, h.height * 0.35, 0));
        d.prevPos.copy(d.pos);
        d.vel.set(0, 0, 0);
        d.yaw = d.prevYaw = h.yaw;
        d.grounded = false;
      };
      m.tickHooks.push(m.carryHook);
    }
  }

  const P = {};

  P.village = {
    id: 'village',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, dn = S.dende, el = S.elder;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      el.setState('scripted', { pose: 'nk_shield', expression: 'angry' });
      dn.setState('scripted', { pose: 'nk_scared', expression: 'hurt' });
      for (const s of S.soldiers) s.setState('scripted', { pose: 'taunt', expression: 'smirk', face: true });
      for (const s of S.soldiers) s.target = el;
      m.shot((t, out) => camAt(out, ground(b, VILLAGE.clone().add(new V3(U.lerp(16, 11, t), 0, U.lerp(16, 12, t))), U.lerp(7, 3.4, t)), el.chest(), 46), 4, { cut: true, blendIn: 0 });
      m.say('frieza_soldier', 'The Dragon Balls, old man. Hand them over and this is quick.', 3.2);
      yield* m.cine(3.4);
      m.shot((t, out) => camAt(out, el.chest().clone().addScaledVector(el.forward, 2.6).add(new V3(0.6, 0.3, 0)), el.chest(), 42), 3, { cut: true, blendIn: 0 });
      m.say('namekian_elder', 'You will take nothing from this village. Run, Dende!', 3);
      yield* m.cine(3);
      // the elder is killed; the child is next
      const s1 = S.soldiers[0];
      faceTo(s1, el.pos);
      s1.setState('scripted', { pose: 'blastR', expression: 'grin' });
      finisher(b, s1, el, 0xff4fa0, 0.5);
      yield 0.3;
      fall(b, el, s1);
      m.shot((t, out) => camAt(out, dn.chest().clone().add(new V3(2.4, 1.2, 2.6)), dn.chest(), 40), 2.6, { cut: true, blendIn: 0 });
      m.say('dende', 'Grandfather—!', 1.8);
      yield* m.cine(2.2);
      m.shot((t, out) => camAt(out, k.chest().clone().addScaledVector(k.forward, 2.4).add(new V3(-0.6, 0.2, 0)), k.chest(), 40), 2.4, { cut: true, blendIn: 0 });
      k.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.say('krillin', "They're killing children. Gohan — get the kid, I'll take these two!", 2.6);
      yield* m.cine(2.6);
      m.endShot();
      // fight: two soldiers, the child behind you
      for (const s of S.soldiers) {
        s.untargetable = false;
        s.controller = cpu(b);
        s.setState('free');
        s.target = k;
      }
      k.setState('free');
      g.setState('free');
      b.setParty([k, g]);
      for (const h of [k, g]) h.target = S.soldiers[0];
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 2);
      m.objective('soldiers', "Drive off Dodoria's men", { icon: 'fist', target: 2 });
      const safe = m.objective('dendeSafe', 'Dende is never hit', { icon: 'guard', optional: true });
      b.on('damage', (e) => {
        if (e.target === dn && !safe.failed) m.failObjective('dendeSafe');
      });
      let down = 0;
      b.on('missionKill', () => {
        down++;
        m.progress('soldiers', down);
      });
      yield () => down >= 2 || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      if (!safe.failed) m.complete('dendeSafe');
      yield 0.6;
    },
  };

  P.flight = {
    id: 'flight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, dn = S.dende, d = S.dodoria;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const s of S.soldiers) if (s.alive) fall(b, s, k);
      if (b.player !== k) b.switchPlayer(k, { force: true });
      place(k, ground(b, VILLAGE.clone().add(new V3(4, 0, 6)), 1.2));
      place(g, ground(b, VILLAGE.clone().add(new V3(-2, 0, 7)), 1.2));
      k.hp = Math.max(k.hp, k.hpMax * 0.6);
      g.hp = Math.max(g.hp, g.hpMax * 0.6);
      b.setParty([k, g]);
      carry(m, k);
      // Dodoria sweeps in from the village, scouter first
      d.setHidden(false);
      d.untargetable = true;
      d.controller = scripted();
      d.cannotDie = true;
      d.infiniteHp = true;
      // he is playing with them rather than finishing them (and canon says both walk
      // away): the phase is a guard-break puzzle, not a damage race it can lose
      d.damageDealtMul = 0.6;
      place(d, VILLAGE.clone().add(new V3(0, 26, -18)));
      d.grounded = false;
      d.setState('scripted', { pose: 'flyIdle', expression: 'angry' });
      m.shot((t, out) => camAt(out, d.chest().clone().add(new V3(U.lerp(6, 4, t), 2, U.lerp(8, 6, t))), d.chest(), 46), 3, { cut: true, blendIn: 0 });
      SL.Audio.play('scouter');
      m.say('dodoria', 'Two power levels running. Ha! Playtime.', 2.6);
      yield* m.cine(2.8);
      m.endShot();
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      // three rock shelters to reach; staying in the open gets you found
      const spots = [new V3(48, 0, 26), new V3(96, 0, -12), new V3(52, 0, -74)].map((v) => ground(b, v, 1.5));
      const covers = spots.map((pos) => ({ pos, alive: true, taken: false }));
      // bots and the HUD both read the shelters from here
      b.story.covers = covers;
      b.emit('markers', { list: covers.map((c) => ({ obj: c, icon: 'target' })) });
      m.objective('cover', 'Reach cover with Dende', { icon: 'target', target: 3 });
      const unseen = m.objective('unseen', 'Never be spotted', { icon: 'guard', optional: true });
      m.prompt('flyOn', 'boost', 'Boost away', { always: true, until: () => SL.Input.held('boost') });
      let reached = 0, seen = 0, cool = 0, shout = 0;
      const hookFlight = () => {
        const p = b.player;
        if (!p || !p.alive) return;
        // Dodoria drifts after the heroes, sweeping
        const to = p.pos.clone().sub(d.pos);
        const dist = to.length();
        d.pos.addScaledVector(to.normalize(), Math.min(0.28, dist * 0.004));
        d.pos.y = Math.max(d.pos.y, b.stage.heightAt(d.pos.x, d.pos.z) + 18);
        d.prevPos.copy(d.pos);
        d.vel.set(0, 0, 0);
        faceTo(d, p.pos);
        // cover reached?
        for (const c of covers) {
          if (c.taken) continue;
          if (p.pos.distanceTo(c.pos) < 8) {
            c.taken = true;
            c.alive = false;
            reached++;
            m.progress('cover', reached);
            b.vfx.ring(c.pos.clone().add(new V3(0, 0.4, 0)), 6, 0x9fe0ff, 0.7, new V3(0, 1, 0));
            SL.Audio.play('uiSelect');
            b.emit('markers', { list: covers.filter((x) => !x.taken).map((x) => ({ obj: x, icon: 'target' })) });
          }
        }
        // spotted: in the open, close, and in front of him
        if (cool > 0) {
          cool--;
          return;
        }
        const nearCover = covers.some((c) => p.pos.distanceTo(c.pos) < 14);
        const ahead = d.forward.dot(p.pos.clone().sub(d.pos).normalize());
        if (!nearCover && dist < 62 && ahead > 0.55) {
          seen++;
          cool = 300;
          if (!unseen.failed) m.failObjective('unseen');
          b.bark(d, 'hunt', true);
          SL.Audio.play('scouter');
          const origin = d.handPos('R');
          b.projectiles.spawnBlast(d, origin, p.chest().sub(origin).normalize(), { kind: 'ball', speed: 70, radius: 0.8, damage: 900, color: 0xff78c8, core: 0xffffff, explode: 5, homing: 0.8, knock: 'heavy', knockSpeed: 20, impact: 2, life: 3 });
          b.sfx('kiBlastBig', d);
        }
        if (reached === 1 && !shout) {
          shout = 1;
          m.say('krillin', 'Keep low and keep moving — he reads power levels, not eyes!', 3);
        }
      };
      m.tickHooks.push(hookFlight);
      yield () => reached >= 3 || !b.partyAlive().length;
      const i = m.tickHooks.indexOf(hookFlight);
      if (i >= 0) m.tickHooks.splice(i, 1);
      b.emit('markers', { list: [] });
      if (!b.partyAlive().length) return;
      m.complete('cover');
      if (!unseen.failed) m.complete('unseen');
      m.qteParts.push(U.clamp01(1 - seen * 0.25));
      yield 0.6;
    },
  };

  P.cornered = {
    id: 'cornered',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, dn = S.dende, d = S.dodoria;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.emit('markers', { list: [] });
      const at = ground(b, new V3(52, 0, -74));
      if (b.player !== k) b.switchPlayer(k, { force: true });
      place(k, ground(b, at.clone().add(new V3(3, 0, 10))));
      place(g, ground(b, at.clone().add(new V3(-3, 0, 11))));
      k.hp = k.hpMax;
      g.hp = g.hpMax;
      k.ki = Math.max(k.ki, 60);
      g.ki = Math.max(g.ki, 80);
      carry(m, k);
      dn.setHidden(false);
      place(d, ground(b, at.clone().add(new V3(0, 0, -6))));
      d.setHidden(false);
      d.untargetable = false;
      d.hp = d.hpMax;
      d.mech.phase = 0;
      d.poise.value = d.poise.max;
      d.cannotDie = true;
      d.infiniteHp = true;
      d.setState('scripted', { pose: 'dd_laugh', expression: 'grin' });
      faceTo(d, k.pos);
      m.shot((t, out) => camAt(out, d.chest().clone().addScaledVector(d.forward, 3).add(new V3(-0.8, 0.4, 0)), d.chest().clone().add(new V3(0, 0.3, 0)), 44), 3, { cut: true, blendIn: 0 });
      m.say('dodoria', 'There you are. Hand the little frog over and I might make it quick.', 3);
      yield* m.cine(3);
      m.endShot();
      d.controller = cpu(b);
      d.setState('free');
      k.setState('free');
      g.setState('free');
      b.setParty([k, g]);
      for (const h of [k, g]) h.target = d;
      d.target = b.player;
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('hold', 'Break his guard and let Gohan fire', { icon: 'fist', target: 2 });
      const noHit = m.objective('dendeSafe2', 'Dende is never hit', { icon: 'guard', optional: true });
      b.on('damage', (e) => {
        if (e.target === dn && !noHit.failed) m.failObjective('dendeSafe2');
      });
      let masenko = 0;
      b.on('damage', (e) => {
        if (e.target !== d || e.attacker !== g) return;
        if ((e.type === 'beam' || e.type === 'ki') && d.poise && d.poise.broken > 0) {
          masenko++;
          m.progress('hold', masenko);
          b.vfx.flash(d.chest(), 6, 0xffe25a, 0.4);
          SL.ScreenFX.flash(0.3, '#fff6c0');
        }
      });
      m.prompt('swapGohan', 'partyNext', 'Switch to Gohan', { required: true, always: true, when: () => d.poise && d.poise.broken > 0 && b.player === k, until: () => b.player === g });
      m.prompt('masenko', 'special1', 'Masenko — now!', { required: true, always: true, when: () => d.poise && d.poise.broken > 0 && b.player === g, until: () => masenko > 0 });
      m.prompt('ddSlam2', 'ascend', 'Jump over it', { always: true, when: () => d.state === 'bossSlam' && d.sd.phase === 'air', until: () => d.state !== 'bossSlam' });
      yield () => masenko >= 2 || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      m.complete('hold');
      if (!noHit.failed) m.complete('dendeSafe2');
      yield 0.4;
    },
  };

  P.getaway = {
    id: 'getaway',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, g = S.gohan, dn = S.dende, d = S.dodoria;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      d.controller = scripted();
      d.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      if (b.player !== k) b.switchPlayer(k, { force: true });
      carry(m, k);
      faceTo(k, d.pos);
      faceTo(g, d.pos);
      k.setState('scripted', { pose: 'idle', expression: 'angry' });
      g.setState('scripted', { pose: 'kg_masenkoFire', expression: 'shout' });
      m.shot((t, out) => camAt(out, d.chest().clone().addScaledVector(d.forward, 3.4).add(new V3(0.8, 0.6, 0)), d.chest(), 46), 3, { cut: true, blendIn: 0 });
      m.say('dodoria', 'My face— you little— aagh!', 2.4);
      yield* m.cine(2.6);
      g.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.shot((t, out) => camAt(out, k.chest().clone().addScaledVector(k.forward, -3.2).add(new V3(1.2, 1.4, 0)), k.chest(), 44), 3, { cut: true, blendIn: 0 });
      m.say('krillin', 'Gohan, go! Hold on tight, Dende!', 2.4);
      yield* m.cine(2.4);
      // they run for it
      let t = 0;
      m.tickHooks.push(() => {
        t += 1 / 60;
        for (const h of [k, g]) {
          h.pos.y += 0.22;
          h.pos.addScaledVector(h.forward, -0.35);
          h.prevPos.copy(h.pos);
          h.grounded = false;
          h.setState('scripted', { pose: 'flyForward', speed: 8 });
        }
      });
      m.shot((t2, out) => camAt(out, d.chest().clone().add(new V3(6, 6, 10)), k.chest(), 50), 3.4, { cut: true, blendIn: 0 });
      yield* m.cine(2.6);
      d.setState('scripted', { pose: 'dd_roar', expression: 'angry' });
      m.say('dodoria', "Run, then! Lord Frieza will hear about this — and I'll be the one who finds you!", 3.4);
      yield* m.cine(3.2);
      m.tickHooks.length = 0;
      m.carryHook = null;
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE HUNTED', 'Next: A Prince on Namek', 3.6);
      yield* m.cine(3.8);
    },
  };

  const def = {
    id: 'namek_hunted',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Hunted',
    subtitle: 'Namek · Krillin and Gohan',
    character: 'krillin',
    stage: 'namek',
    parTime: 300,
    rules: { allowTransform: false },
    blurb: "Frieza's men are wiping out the Namekian villages. Krillin and Gohan pull a child out of one — and Dodoria comes hunting.",
    rewards: ['Chapter 4 continues', 'Dende (story character)'],
    setup,
    phases: [P.village, P.flight, P.cornered, P.getaway],
  };

  SL.data.missions[def.id] = def;
})();
