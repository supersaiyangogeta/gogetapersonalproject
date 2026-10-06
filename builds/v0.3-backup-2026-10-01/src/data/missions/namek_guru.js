/*
 * CHAPTER 4 — NAMEK SAGA (fifth mission of the Namek foundation, in development)
 * Mission "The Eldest Namekian" (canon, played as Krillin).
 *
 * Canon beats: with a Dragon Ball in hand and Dende guiding him, Krillin climbs to
 * the Grand Elder's plateau. Frieza's search parties are already sweeping it. Guru
 * puts a hand on Krillin's head and pulls out what was sleeping in him — and then
 * tells him what Frieza has just called down on the planet: the Ginyu Force.
 *
 * Phases: CLIMB (cutscene) → PATROL (checkpoint: hold the plateau) → AWAKENING
 * (the unlock, as an event, then a test of the new power) → WARNING (cutscene).
 *
 * The unlock is real: Krillin's "Unlocked Potential" form is story-locked until
 * Guru touches him, then taught with m.teach('form:potential') so the HUD and the
 * skill wheel show it appearing. The last fight is deliberately winnable only
 * after it: the elite soldier hits harder than base Krillin trades well with.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const PLATEAU = new V3(0, 0, -20);

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
    clearArea(b, PLATEAU, 30);
    const krillin = b.spawn({ charId: 'krillin', player: true, team: 0, pos: ground(b, PLATEAU.clone().add(new V3(0, 0, 16))), startKi: 60 });
    // the potential is his, but it stays shut until Guru opens it
    krillin.lockedForms = { potential: true };
    krillin.lockedSlots = { transform: true };
    const dende = b.spawn({ charId: 'dende', team: 0, pos: ground(b, PLATEAU.clone().add(new V3(-2, 0, 17))), tags: { cinematic: true } });
    dende.controller = scripted();
    dende.untargetable = true;
    dende.cannotDie = true;
    dende.infiniteHp = true;
    const guru = b.spawn({ charId: 'guru', team: 0, pos: ground(b, PLATEAU.clone()), tags: { cinematic: true } });
    guru.controller = scripted();
    guru.untargetable = true;
    guru.cannotDie = true;
    guru.infiniteHp = true;
    faceTo(guru, PLATEAU.clone().add(new V3(0, 0, 20)));
    b.story = { krillin, dende, guru, wave: [] };
  }

  const P = {};

  P.climb = {
    id: 'climb',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, d = S.dende, gu = S.guru;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      k.setState('scripted', { pose: 'idle', expression: 'calm' });
      d.setState('scripted', { pose: 'nk_point', expression: 'calm' });
      gu.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.shot((t, out) => camAt(out, ground(b, PLATEAU.clone().add(new V3(U.lerp(20, 12, t), 0, U.lerp(26, 20, t))), U.lerp(9, 4, t)), gu.chest(), 50), 4, { cut: true, blendIn: 0 });
      m.say('dende', 'That is him. The Grand Elder. He has been waiting for you.', 3.2);
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const c = gu.chest();
        camAt(out, c.clone().addScaledVector(gu.forward, U.lerp(7, 5, t)).add(new V3(1.2, 1.4, 0)), c.clone().add(new V3(0, 0.4, 0)), 46);
      }, 3.6, { cut: true, blendIn: 0 });
      gu.setState('scripted', { pose: 'gr_speak', expression: 'calm' });
      m.say('guru', 'Come closer, child of Earth. I have been waiting for someone with hands like yours.', 3.4);
      yield* m.cine(3.6);
      // Frieza's search party finds the plateau first
      SL.Audio.play('scouter');
      m.shot((t, out) => camAt(out, ground(b, PLATEAU.clone().add(new V3(-16, 0, -14)), 8), gu.chest(), 52), 2.4, { cut: true, blendIn: 0 });
      m.say('krillin', "They followed us. Of course they followed us.", 2.2);
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  P.patrol = {
    id: 'patrol',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, gu = S.guru;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(k, ground(b, PLATEAU.clone().add(new V3(0, 0, 12))), Math.PI);
      k.hp = k.hpMax;
      k.ki = Math.max(k.ki, 50);
      for (const f of S.wave) if (b.fighters.includes(f)) b.remove(f);
      S.wave = [];
      const spots = [new V3(-10, 0, -6), new V3(9, 0, -8), new V3(0, 0, -14)];
      for (let i = 0; i < 3; i++) {
        const e = m.spawn({ charId: i === 2 ? 'frieza_gunner' : 'frieza_soldier', pos: ground(b, PLATEAU.clone().add(spots[i]), i === 2 ? 5 : 0), grounded: i !== 2, tag: 'patrol' });
        e.target = k;
        S.wave.push(e);
      }
      k.target = S.wave[0];
      k.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 2);
      m.objective('patrol', "Keep them off the Grand Elder", { icon: 'fist', target: 3 });
      const guruSafe = m.objective('guruSafe', 'Guru is never hit', { icon: 'guard', optional: true });
      b.on('damage', (e) => {
        if (e.target === gu && !guruSafe.failed) m.failObjective('guruSafe');
      });
      let down = 0;
      b.on('missionKill', () => {
        down++;
        m.progress('patrol', down);
      });
      yield () => down >= 3 || !k.alive;
      if (!k.alive) return;
      m.complete('patrol');
      if (!guruSafe.failed) m.complete('guruSafe');
      yield 0.5;
    },
  };

  P.awakening = {
    id: 'awakening',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, gu = S.guru, d = S.dende;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of S.wave) if (b.fighters.includes(f) && f.alive) b.remove(f);
      S.wave = [];
      place(k, ground(b, gu.pos.clone().addScaledVector(gu.forward, 3)), 0);
      faceTo(k, gu.pos);
      k.hp = k.hpMax;
      k.setState('scripted', { pose: 'idle', expression: 'calm' });
      gu.setState('scripted', { pose: 'gr_reach', expression: 'calm' });
      m.shot((t, out) => {
        const c = k.chest();
        camAt(out, c.clone().add(new V3(2.2, 1.6, 2.4)), c.clone().lerp(gu.chest(), 0.35), 44);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('guru', 'You have carried more than you know. Let me take the lid off it.', 3.2);
      yield* m.cine(3.4);
      // the unlock, as an event: light, pressure, then the form appears on the wheel
      b.stage.setMood(0.4, 0x2a2410, 1);
      SL.Audio.play('kiUp', { pitch: 0.8 });
      m.shot((t, out) => {
        const c = k.chest();
        camAt(out, c.clone().addScaledVector(k.forward, -U.lerp(2.4, 1.6, t)).add(new V3(0.5, 0.5, 0)), c.clone().add(new V3(0, 0.15, 0)), U.lerp(40, 32, t));
      }, 3.2, { cut: true, blendIn: 0 });
      for (let i = 0; i < 3; i++) {
        b.vfx.ring(k.chest(), 3 + i * 1.6, 0xffe9a8, 0.5);
        b.vfx.streamInward(k.chest(), 6, 0xffe9a8, 10, 0.2, 0.5);
        SL.Audio.play('heartbeat');
        yield 0.55;
      }
      k.setState('scripted', { pose: 'powerUp', expression: 'shout', aura: 1, speed: 14 });
      b.vfx.explosion(k.chest(), 5, 0xffe9a8, { smoke: false });
      b.vfx.ring(k.pos.clone().add(new V3(0, 0.2, 0)), 10, 0xfff0c0, 0.8, new V3(0, 1, 0));
      b.vfx.sparks(k.chest(), 0xffffff, 40, 14, 0.14);
      SL.Audio.play('transformBurst', { pitch: 1.2 });
      SL.ScreenFX.flash(0.6, '#fff4d8');
      b.cameraTraumaAt(k.chest(), 0.6);
      k.ki = k.kiMax;
      m.teach(k, 'form:potential');
      yield 1.2;
      b.stage.clearMood(1);
      m.say('krillin', 'Whoa — is this me?!', 2.4);
      yield* m.cine(2.4);
      m.endShot();
      // a straggler arrives: the story hands you a reason to use it immediately
      const elite = m.spawn({ charId: 'frieza_elite', pos: ground(b, PLATEAU.clone().add(new V3(6, 0, -12)), 6), grounded: false, tag: 'elite' });
      elite.target = k;
      S.wave.push(elite);
      k.target = elite;
      k.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('elite', 'Use what Guru gave you', { icon: 'fist' });
      m.prompt('useForm', 'transform', 'Unlocked Potential', { required: true, always: true, when: () => k.formIndex === 0, until: () => k.formIndex > 0 });
      let usedForm = false;
      b.on('formChanged', (e) => {
        if (e.fighter === k && e.form.id === 'potential') usedForm = true;
      });
      yield () => !elite.alive || !k.alive;
      if (!k.alive) return;
      m.complete('elite');
      m.flags.usedPotential = usedForm;
      yield 0.5;
    },
  };

  P.warning = {
    id: 'warning',
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin, gu = S.guru, d = S.dende;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(k, ground(b, gu.pos.clone().addScaledVector(gu.forward, 3.4)), 0);
      faceTo(k, gu.pos);
      k.setState('scripted', { pose: 'idle', expression: 'calm' });
      gu.setState('scripted', { pose: 'gr_speak', expression: 'calm' });
      d.setHidden(false);
      place(d, ground(b, gu.pos.clone().addScaledVector(gu.forward, 2).add(new V3(-1.6, 0, 0))), 0);
      faceTo(d, gu.pos);
      m.shot((t, out) => {
        const c = gu.chest();
        camAt(out, c.clone().addScaledVector(gu.forward, U.lerp(6, 4.6, t)).add(new V3(-1.4, 1.2, 0)), c.clone().add(new V3(0, 0.3, 0)), 46);
      }, 4.2, { cut: true, blendIn: 0 });
      m.say('guru', 'Frieza has called for five more. They are not like the ones you have met.', 4);
      yield* m.cine(4.2);
      m.shot((t, out) => {
        const c = k.chest();
        camAt(out, c.clone().addScaledVector(k.forward, -2.2).add(new V3(0.6, 0.4, 0)), c, 40);
      }, 3, { cut: true, blendIn: 0 });
      k.setState('scripted', { pose: 'idle', expression: 'grit' });
      m.say('krillin', 'Five. Great. I will go warn Gohan.', 2.6);
      yield* m.cine(2.8);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE ELDEST NAMEKIAN', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_guru',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Eldest Namekian',
    subtitle: 'Namek · Krillin, Dende and the Grand Elder',
    character: 'krillin',
    stage: 'namek',
    parTime: 260,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Dende leads Krillin to the Grand Elder while Frieza\'s search parties close in. What Guru unlocks does not wear off.',
    rewards: ['Krillin: Unlocked Potential', 'Chapter 4 continues'],
    setup,
    phases: [P.climb, P.patrol, P.awakening, P.warning],
  };

  SL.data.missions[def.id] = def;
})();
