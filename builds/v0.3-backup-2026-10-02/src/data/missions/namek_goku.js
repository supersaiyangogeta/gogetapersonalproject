/*
 * CHAPTER 4 — NAMEK SAGA
 * Mission "The Emperor's True Power" (canon, played as Goku).
 *
 * Canon beats: the prince is in the ground and Goku turns around. The first exchange
 * belongs to Frieza — base Goku can fight him, dodge him and sometimes touch him, and
 * none of it matters. Then the Kaioken, and for the first time the emperor has to move
 * his feet; every level Goku pushes to, Frieza answers.
 *
 * Phases: OPEN (the grave behind him, the emperor in front of him) → BASE (checkpoint:
 * base Goku against a Frieza who is toying with him — the story battle, not an even
 * match) → KAIOKEN (scene `goku_kaioken_escalation`: he lights it, Frieza is surprised)
 * → RISING (checkpoint: Kaioken x2 → x3 → x4, each one answered) → AFTER (Frieza has
 * started to take it seriously, and says how much further there is to go).
 *
 * The story ceiling here is x4 (formCaps); x10 and x20 belong to the next mission.
 * Super Saiyan is locked by the chronology rule (SL.data.formGivenBy).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const BASE_SECONDS = 30;
  const RISING_SECONDS = 30;

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
  const cpu = (b, profile) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** The grave he made in the mission before this one, still there. */
  function grave() {
    const g = new THREE.Group();
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), SL.Toon.mat(0x6a5a44));
    mound.scale.set(1, 0.35, 0.8);
    g.add(mound);
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.8, 0.14), SL.Toon.mat(0x8a8f86));
    SL.Toon.addOutline(stone, 1.4);
    stone.position.set(0, 0.42, -0.62);
    stone.rotation.z = 0.06;
    g.add(stone);
    return g;
  }

  /**
   * Frieza as the fight opens: the emperor, toying, nowhere near trying. tune: the story
   * phase's rhythm and string length (owner's Frieza fairness pass — the early emperor is
   * dangerous but learnable: short strings, long looks at what Goku does about them).
   */
  function emperor(b, fz, g, tune = {}) {
    fz.applyForm(3);
    fz.mech.phase = 3;
    fz.bossPhaseCap = 3;
    fz.hp = fz.hpMax;
    fz.poise.value = fz.poise.max;
    fz.cannotDie = true;
    fz.infiniteHp = true; // nothing in this mission finishes him
    fz.aiPhase = 'dominant';
    fz.aiRhythm = tune.rhythm || null;
    fz.controller = cpu(b, tune.profile);
    fz.target = g;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 40);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 8))), startKi: 100 });
    // he has the Kaioken, but the story lights it in the middle of the fight
    goku.lockedForms = { kaioken: true };
    goku.lockedSlots = { transform: true };
    // tonight's ceiling: x4. x10 and x20 are the next mission's
    goku.formCaps = { kaioken: 2 };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(16, 0, 18))), startKi: 30 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-15, 0, 19))), startKi: 30 });
    // the prince is in the ground by now; he is kept in the cast so the story knows him
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(13, 0, 18))), startKi: 20 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    vegeta.setHidden(true);
    vegeta.alive = false;
    for (const f of [krillin, gohan, vegeta]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.12); // everybody here has already lost today
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -6))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3); // final form: this is the fight everything has been leading to
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    const graveAt = ground(b, FIELD.clone().add(new V3(11, 0, 13)));
    const mound = grave();
    mound.position.copy(graveAt);
    b.stage.scene.add(mound);
    if (b.mission) b.mission.onDispose(() => b.stage.scene.remove(mound));
    faceTo(frieza, goku.pos);
    b.story = { goku, krillin, gohan, vegeta, frieza, grave: { pos: graveAt, object: mound } };
  }

  const P = {};

  /* The grave is behind him and the emperor is in front of him: the fight starts here. */
  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.music('finale', 2);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 5))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -3))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      g.setState('scripted', { pose: 'idle', expression: 'angry' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(g, fz, { fov: 38, back: U.lerp(2.6, 2.1, t), side: 1, height: 0.8, lookUp: 0.25 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('frieza', 'Burying a dead monkey? How touching. Are you quite finished?', 3);
      yield* m.cine(3.2);
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, 2.3).add(new V3(-0.7, 0.28, 0)), g.chest(), 38), 2.8, { cut: true, blendIn: 0 });
      m.say('goku', 'I am finished burying people. Now it is your turn to listen.', 2.8);
      yield* m.cine(3);
      m.endShot();
    },
  };

  /*
   * BASE GOKU AGAINST THE EMPEROR. He can fight, dodge and counter; he cannot make it
   * matter. Frieza slips most of what Goku throws (a story power gap, the other way round
   * from the Ginyu fight) and hits at a fraction of what he could.
   */
  P.base = {
    id: 'base',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      g.setHidden(false);
      g.untargetable = false;
      b.switchPlayer(g, { force: true });
      g.lockedForms = Object.assign(g.lockedForms || {}, { kaioken: true }); // still saved
      g.lockedSlots = { transform: true };
      if (g.formIndex !== 0) g.applyForm(0);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 7))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -5))), 0);
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      g.cannotDie = true; // canon: this is not where Goku dies
      // toying: two decisions and a long look, strings of one to three blows
      emperor(b, fz, g, { rhythm: { burst: 2, rest: 100 }, profile: { comboLen: 2 } });
      fz.damageDealtMul = 0.5; // he is not trying yet, and it shows
      // most of what base Goku throws is simply not there when it arrives
      fz.storyEvade = { chance: 0.55, gap: 26, from: [g] };
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('base', 'Stand up to the emperor', { icon: 'clock', target: BASE_SECONDS });
      m.objective('touch', 'Land eight clean hits', { icon: 'fist', optional: true, target: 8 });
      let hits = 0, slipped = 0;
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker === g) {
          hits++;
          m.progress('touch', Math.min(8, hits));
        }
      });
      b.on('storyEvade', (e) => {
        if (e.fighter !== fz) return;
        slipped++;
        if (slipped === 1) m.say('frieza', 'Too slow, monkey.', 1.8);
        if (slipped === 5) m.say('frieza', 'Is this really the best the Saiyans have to offer?', 2.4);
      });
      m.prompt('gkBeam', 'dodge', 'His beam goes through a guard — move', {
        always: true,
        when: () => fz.state === 'specialThrow',
        until: () => fz.state !== 'specialThrow',
      });
      let t = 0;
      const clock = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('base', Math.min(BASE_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(clock);
      yield () => t >= BASE_SECONDS || !g.alive;
      const i = m.tickHooks.indexOf(clock);
      if (i >= 0) m.tickHooks.splice(i, 1);
      fz.storyEvade = null;
      if (!g.alive) return;
      m.complete('base');
      if (hits >= 8) m.complete('touch');
      else m.failObjective('touch');
      m.flags.baseHits = hits;
      m.flags.baseSlipped = slipped;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.kaioken = {
    id: 'kaioken',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.goku, S.frieza]) f.controller = scripted();
      S.frieza.storyEvade = null;
      // he is thrown back before he answers: the scene opens on the ground
      place(S.goku, ground(b, S.frieza.pos.clone().add(new V3(0, 0, 8))));
      faceTo(S.goku, S.frieza.pos);
      faceTo(S.frieza, S.goku.pos);
      S.goku.hp = Math.round(S.goku.hpMax * 0.45);
      yield* SL.Cinema.play(m, 'goku_kaioken_escalation');
    },
  };

  /*
   * THE KAIOKEN, RISING. x2 lands; x3 and x4 are charged up to with the charge button, and
   * every level Frieza answers — his output goes up a step, he says so, and the exchanges
   * get heavier. The body pays: health drain and strain are real.
   */
  P.rising = {
    id: 'rising',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      g.setHidden(false);
      g.untargetable = false;
      b.switchPlayer(g, { force: true });
      // reaching this checkpoint directly: the story already lit the Kaioken
      m.teach(g, 'form:kaioken');
      g.formCaps = { kaioken: 2 };
      if (g.formIndex < 1) g.applyForm(1);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.6));
      g.ki = Math.max(g.ki, 85);
      g.cannotDie = true;
      emperor(b, fz, g, { rhythm: { burst: 3, rest: 80 }, profile: { comboLen: 2 } });
      fz.storyEvade = null; // with the Kaioken lit, Goku lands
      fz.damageDealtMul = 0.6; // he has started paying attention
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 4);
      m.objective('push', 'Push the Kaioken to x4', { icon: 'transform', target: 2 });
      m.objective('hold', 'Keep him honest', { icon: 'clock', target: RISING_SECONDS });
      m.objective('strain', 'Finish it without overloading', { icon: 'guard', optional: true });
      let overloads = 0, kaiokenSeconds = 0, landed = 0;
      b.on('overload', (e) => {
        if (e.fighter !== g) return;
        overloads++;
        if (overloads === 1) m.failObjective('strain');
      });
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker === g) landed++;
      });
      // ESCALATION: every time Goku pushes the Kaioken higher, Frieza answers it
      let stage = 0;
      b.on('formLevel', (e) => {
        if (e.fighter !== g || e.level <= stage) return;
        stage = e.level;
        m.progress('push', Math.min(2, stage));
        fz.damageDealtMul = 0.6 + stage * 0.1;
        b.bark(fz, 'taunt');
        b.cameraTraumaAt(g.chest(), 0.35);
        m.say('frieza', stage >= 2 ? 'Even higher? Then I\'ll stop playing nice.' : 'Oh? You\'re stronger than I thought.', 2.4);
      });
      // teach the climb where it is used, not in a menu
      m.prompt('kkUp', 'charge', 'Hold Charge — push the Kaioken higher', {
        required: true,
        always: true,
        when: () => g.formIndex === 1 && g.formLevel < 2 && g.state === 'free',
        until: () => g.formLevel >= 2,
      });
      m.prompt('kkCost', 'charge', 'The Kaioken burns health — power down to cool off', {
        always: true,
        when: () => g.formIndex > 0 && g.hpFrac < 0.3,
        until: () => g.formIndex === 0,
      });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        if (g.formIndex > 0) kaiokenSeconds += 1 / 60;
        m.progress('hold', Math.min(RISING_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      // the climb is the point: the phase ends once he has reached x4 and held the fight
      yield () => (t >= RISING_SECONDS && stage >= 2) || t >= RISING_SECONDS * 2 || !g.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!g.alive) return;
      if (stage >= 2) m.complete('push');
      m.complete('hold');
      if (!overloads) m.complete('strain');
      m.flags.kaiokenSeconds = Math.round(kaiokenSeconds);
      m.flags.kaiokenReached = stage;
      m.flags.risingLanded = landed;
      m.flags.overloads = overloads;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      // he ends it with the Kaioken still burning, whatever the last second of the fight was
      if (g.formIndex < 1) g.applyForm(1);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 5))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -3))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'grit' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, U.lerp(2.6, 2.1, t)).add(new V3(-0.8, 0.3, 0)), g.chest(), 40), 3.2, { cut: true, blendIn: 0 });
      m.say('goku', 'x4, and he is still standing there like it is nothing.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(g, fz, { fov: 36, back: U.lerp(2.4, 2, t), side: 1, height: 0.8, lookUp: 0.25 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('frieza', 'Impressive. You\'ve made me use my hands. Let\'s see how long that body of yours holds up.', 3.6);
      yield* m.cine(3.8);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', "THE EMPEROR'S TRUE POWER", m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_goku',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: "The Emperor's True Power",
    subtitle: 'Namek · base Goku against the emperor, and the Kaioken rising',
    character: 'goku',
    stage: 'namek',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'He can fight Frieza, dodge him, even touch him — and none of it matters, until the Kaioken. Every level he climbs, the emperor answers.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.open, P.base, P.kaioken, P.rising, P.after],
  };

  SL.data.missions[def.id] = def;
})();
