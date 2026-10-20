/*
 * CHAPTER 4 — NAMEK SAGA (eleventh mission of the Namek foundation, in development)
 * Mission "The Emperor" (canon, played as Vegeta, with Krillin and Gohan).
 *
 * Canon beats: with the Ginyu Force gone, the thing they were working for comes
 * to the field itself. Frieza is not in a hurry and does not need to be: he walks
 * into the middle of three people who have just survived the worst day of their
 * lives and asks them, politely, to hand over what is his. Vegeta's answer is to
 * attack him, which is the last time in this mission anybody is confident.
 *
 * Phases: ARRIVAL (cutscene: he arrives, reads them, and they understand) →
 * FIRST FORM (checkpoint: a real fight against a man who is not trying) →
 * SECOND FORM (staged transformation cinematic, shared with later missions) →
 * HOLD (checkpoint: survive what comes out of it) → AFTER (cutscene).
 *
 * The transformation is SL.data.cinematics.bossTransform (frieza_cinematics.js),
 * and his phases are held with fighter.bossPhaseCap so the mission owns when he
 * changes rather than his health bar doing it mid-sentence.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const HOLD_SECONDS = 45;

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
    clearArea(b, FIELD, 38);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 14))), startKi: 90 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(6, 0, 18))), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-6, 0, 18))), startKi: 60 });
    for (const f of [krillin, gohan]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -16))), startKi: 120, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.bossPhaseCap = 0; // the mission decides when he changes, not his health bar
    faceTo(vegeta, FIELD);
    faceTo(frieza, vegeta.pos);
    b.story = { vegeta, krillin, gohan, frieza };
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, k = S.krillin, g = S.gohan;
      m.lock(true);
      // the emperor, far off and in no hurry: thin tremolo violins on wrong notes (soundtrack PDF p.96, "Looming Threat")
      m.music('looming_threat', 2);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of [v, k, g]) f.setState('scripted', { pose: 'idle', expression: 'grit' });
      fz.setState('scripted', { pose: 'idle', expression: 'calm' });
      // he is a long way off, and the camera takes its time getting to him
      m.shot((t, out) => {
        const c = fz.chest();
        camAt(out, c.clone().add(new V3(U.lerp(5, 3.2, U.easeInOutCubic(t)), U.lerp(2.4, 0.8, U.easeInOutCubic(t)), U.lerp(6, 3.9, U.easeInOutCubic(t)))), c, U.lerp(44, 36, t));
      }, 4.4, { cut: true, blendIn: 0 });
      b.stage.setMood(0.35, 0x2a1a3a, 1.4);
      yield* m.cine(2);
      m.say('frieza', 'You\'ve been busy, Vegeta. My best men... and a great deal of my time.', 3.2);
      yield* m.cine(2.6);
      // the scouter beep that tells the heroes exactly how little it matters
      b.sfx('uiSelect', fz, { pitch: 1.5 });
      // both of them in the frame, square to the line between them
      m.shot((t, out) => {
        const s = SL.Cinema.twoShot(k, g, { fov: 42, height: 1.1, pad: 1.6 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('krillin', 'Gohan. Do not move. Do not even power up.', 3);
      yield* m.cine(3.4);
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 2.4).add(new V3(-0.8, 0.35, 0)), v.chest(), 40), 3.2, { cut: true, blendIn: 0 });
      m.say('vegeta', 'I am not spending another day running from you.', 3);
      yield* m.cine(3.2);
      // HE COMES TO HIM. The prince said it to his face, so the answer is given to his face:
      // Frieza closes the distance (he is faster than anything here), both of them turn to each
      // other, and the shot is built from where they actually stand — the owner found this line
      // playing over an empty field, with neither of them on screen (playtest round 3).
      const closeAt = ground(b, v.pos.clone().addScaledVector(v.forward, 5.5));
      for (let i = 0; i <= 16; i++) b.vfx.trail(fz.pos.clone().lerp(closeAt, i / 16).add(new V3(0, 1, 0)), 0xd8c8ff, 0.5, 0.35);
      b.sfx('dash', fz, { vol: 1.1, pitch: 0.9 });
      place(fz, closeAt, 0);
      faceTo(fz, v.pos);
      faceTo(v, fz.pos);
      b.vfx.dust(fz.pos, 2.4, 10);
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });
      // over the prince's shoulder: his back fills one side, Frieza stands in the rest of it
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(v, fz, { fov: 34, back: U.lerp(2.4, 1.9, t), side: 1, height: 0.7, lookUp: 0.2 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('frieza', 'Then hold still. This will only take a moment.', 2.6);
      yield* m.cine(3.4);
      b.stage.clearMood(1.2);
      m.endShot();
    },
  };

  P.firstForm = {
    id: 'firstForm',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, k = S.krillin, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== v) b.switchPlayer(v, { force: true });
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 11))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -9))), 0);
      place(k, ground(b, FIELD.clone().add(new V3(7, 0, 16))), Math.PI);
      place(g, ground(b, FIELD.clone().add(new V3(-7, 0, 16))), Math.PI);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 90);
      fz.applyForm(0);
      fz.bossPhaseCap = 0; // first form, whatever his health does
      fz.mech.phase = 0;
      fz.hp = fz.hpMax;
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true; // canon: nobody here is finishing him
      fz.controller = cpu(b);
      fz.target = v;
      v.target = fz;
      v.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('press', 'Make Frieza take this seriously', { icon: 'fist', target: 100 });
      const clean = m.objective('untouched', 'Never let a Death Beam land', { icon: 'guard', optional: true });
      let beams = 0, cruel = 0;
      b.on('damage', (e) => {
        if (e.target !== v) return;
        if (e.source === 'Death Beam') {
          beams++;
          if (beams === 1) m.failObjective('untouched');
        }
      });
      b.on('cruelty', (e) => {
        if (e.fighter === fz) cruel++;
      });
      // the one rule of his first form: a guard is not an answer to that finger
      m.prompt('fzBeam', 'dodge', 'The beam goes through a guard — move', {
        always: true,
        when: () => fz.state === 'specialThrow',
        until: () => fz.state !== 'specialThrow',
      });
      const hook = () => {
        if (b.inputLocked) return;
        m.progress('press', Math.round((1 - fz.hpFrac) * 100));
      };
      m.tickHooks.push(hook);
      yield () => fz.hpFrac <= 0.74 || !v.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!v.alive) return;
      m.complete('press');
      if (!beams) m.complete('untouched');
      m.flags.beamHits = beams;
      m.flags.crueltyHits = cruel;
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.4;
      void clean;
    },
  };

  P.second = {
    id: 'second',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, v = S.vegeta;
      m.clearObjectives();
      faceTo(fz, v.pos);
      faceTo(v, fz.pos);
      fz.controller = scripted();
      fz.bossPhaseCap = 1;
      yield* SL.data.cinematics.bossTransform(m, {
        fighter: fz,
        technique: 'toSecond',
        witness: v,
        line: 'frieza_transform2',
        witnessLine: 'That is not the same creature. That is not even close.',
        music: 4,
      });
      m.flags.secondForm = true;
    },
  };

  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, k = S.krillin, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // reaching this checkpoint directly: put him in the form the story left him in
      if (fz.formIndex < 1) fz.applyForm(1);
      fz.bossPhaseCap = 1;
      fz.mech.phase = 1;
      fz.hp = Math.round(fz.hpMax * 0.7);
      fz.poise.value = fz.poise.max;
      fz.cannotDie = true;
      fz.infiniteHp = true; // this phase is survived, not won
      fz.controller = cpu(b);
      for (const f of [k, g]) {
        f.untargetable = false;
        f.controller = null;
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, 60);
        f.cannotDie = true;
      }
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 10))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      place(k, ground(b, FIELD.clone().add(new V3(6, 0, 14))), Math.PI);
      place(g, ground(b, FIELD.clone().add(new V3(-6, 0, 15))), Math.PI);
      v.hp = Math.max(v.hp, Math.round(v.hpMax * 0.5));
      v.ki = Math.max(v.ki, 70);
      v.cannotDie = true;
      if (b.player !== v) b.switchPlayer(v, { force: true });
      b.setParty([v, k, g]);
      for (const f of [v, k, g]) f.target = fz;
      fz.target = v;
      for (const f of [v, k, g, fz]) f.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 4);
      m.objective('survive', 'Survive the second form', { icon: 'clock', target: HOLD_SECONDS });
      const together = m.objective('together', 'Nobody is knocked down', { icon: 'guard', optional: true });
      let downed = false, charges = 0;
      b.on('knockdown', (e) => {
        if ([v, k, g].includes(e.fighter) && !downed) {
          downed = true;
          m.failObjective('together');
        }
      });
      b.on('special', (e) => {
        if (e.fighter === fz && e.spec && e.spec.id === 'hornRush') charges++;
      });
      m.prompt('fzHorn', 'guard', 'He is charging — do not be in front of it', {
        always: true,
        when: () => fz.state === 'rush',
        until: () => fz.state !== 'rush',
      });
      m.prompt('fzSwap', 'partyNext', 'Switch hero', { always: true, when: () => b.player.hpFrac < 0.4, until: () => SL.Input.pressed('partyNext') });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('survive', Math.min(HOLD_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= HOLD_SECONDS || !b.partyAlive().length;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!b.partyAlive().length) return;
      m.complete('survive');
      if (!downed) m.complete('together');
      m.flags.hornCharges = charges;
      m.qteParts.push(U.clamp01(b.player.hpFrac));
      yield 0.4;
      void together;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, k = S.krillin, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [v, k, g, fz]) f.controller = scripted();
      fz.infiniteHp = false;
      place(fz, ground(b, v.pos.clone().addScaledVector(v.forward, 7)));
      faceTo(fz, v.pos);
      faceTo(v, fz.pos);
      v.setState('scripted', { pose: 'idle', expression: 'hurt' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, 3.4).add(new V3(0.9, 0.5, 0)), fz.chest(), 44), 3.2, { cut: true, blendIn: 0 });
      m.say('frieza', 'That was only my second form. I have two more. Think about that.', 3);
      yield* m.cine(3.2);
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(1.8, 0.7, 2.6)), v.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Four. He said four.', 2.8);
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE EMPEROR', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_frieza1',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Emperor',
    subtitle: 'Namek · Vegeta, Krillin and Gohan against Frieza',
    character: 'vegeta',
    stage: 'namek',
    parTime: 400,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'He walks up to three exhausted people and asks for what he wants. The first form is him not trying; the second is him being mildly inconvenienced.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.arrival, P.firstForm, P.second, P.hold, P.after],
  };

  SL.data.missions[def.id] = def;
})();
