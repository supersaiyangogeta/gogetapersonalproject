/*
 * CHAPTER 7 — BUU SAGA (Age 774)
 * Mission "The Great Saiyaman" (canon, played as the Great Saiyaman).
 *
 * The first playable stretch of the Buu era, and it is a crime scene rather
 * than a battlefield. Four robbers, three people on the pavement who must not
 * be hurt, and a fighter who could level the block by accident: the mission is
 * about restraint, not damage. Robbers go down in a hit and stay down — the
 * objective counts them out cold, not dead — and hurting a civilian fails the
 * optional objective the mission actually cares about.
 *
 * Then Videl lands. She has been doing this job for years, without ki, without
 * flight, and she wants to see what the person in the helmet is. The spar is
 * the answer she gets: he has to land three clean hits without hurting her.
 *
 * Phases: ARRIVE (scene `saiyaman_arrives`) → STOP (checkpoint: the robbery) →
 * MEET (scene `saiyaman_videl`) → SPAR (checkpoint: Videl's test) → AFTER
 * (scene `saiyaman_after`).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const THUGS = 4;
  const CIVILIANS = 3;
  const SPAR_HITS = 3;
  const SPAR_SECONDS = 45;
  const scripted = () => ({ update: () => SL.emptyIntent() });

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
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  /** Down and out of the fight, without a body: how this mission "defeats" a human. */
  function knockOut(f) {
    f.untargetable = true;
    f.controller = scripted();
    f.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
  }

  function setup(battle) {
    const b = battle;
    const L = b.stage.landmarks;
    const plaza = L.plaza;
    const saiyaman = b.spawn({ charId: 'great_saiyaman', player: true, team: 0, pos: ground(b, plaza.clone().add(new V3(0, 0, 10))), startKi: 90 });
    saiyaman.cannotDie = true;
    const thugs = [];
    for (let i = 0; i < THUGS; i++) {
      const a = (i / THUGS) * Math.PI * 2;
      const t = b.spawn({ charId: 'city_thug', team: 1, pos: ground(b, plaza.clone().add(new V3(Math.sin(a) * 7, 0, Math.cos(a) * 7 - 4))), startKi: 20, tag: 'thug' });
      t.cannotDie = true; // they are people: they are knocked out, not killed
      thugs.push(t);
    }
    const civilians = [];
    for (let i = 0; i < CIVILIANS; i++) {
      const c = b.spawn({ charId: 'civilian', team: 0, pos: ground(b, plaza.clone().add(new V3(-9 + i * 9, 0, -9))), startKi: 0, tag: 'civilian' });
      c.cannotDie = true;
      c.untargetable = true;
      c.controller = scripted();
      civilians.push(c);
    }
    const videl = b.spawn({ charId: 'videl', team: 1, pos: ground(b, plaza.clone().add(new V3(6, 0, -12))), startKi: 40 });
    videl.cannotDie = true;
    videl.setHidden(true);
    videl.untargetable = true;
    videl.controller = scripted();
    b.story = { saiyaman, videl, thugs, civilians, thug0: thugs[0], thug1: thugs[1] };
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      place(S.saiyaman, ground(b, L.plaza.clone().add(new V3(0, 0, 8))), Math.PI);
      S.thugs.forEach((t, i) => {
        const a = (i / THUGS) * Math.PI * 2;
        place(t, ground(b, L.plaza.clone().add(new V3(Math.sin(a) * 7, 0, Math.cos(a) * 7 - 4))), 0);
        faceTo(t, S.saiyaman.pos);
        t.setState('scripted', { pose: 'th_idle', expression: 'angry' });
      });
      S.civilians.forEach((c, i) => {
        place(c, ground(b, L.plaza.clone().add(new V3(-9 + i * 9, 0, -10))), 0);
        c.setState('scripted', { pose: 'cv_cower', expression: 'shock' });
      });
      yield* SL.Cinema.play(m, 'saiyaman_arrives');
    },
  };

  /**
   * The robbery. Four robbers, one hit each, and three people behind them who
   * are the actual objective: the mission is a restraint exercise, and it says
   * so with an optional objective that fails the moment a civilian is hit.
   */
  P.stop = {
    id: 'stop',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, s = S.saiyaman, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(s, { force: true });
      s.hp = s.hpMax;
      s.ki = Math.max(s.ki, 90);
      s.damageTakenMul = 0.25; // a pistol is a noise, not a threat
      place(s, ground(b, L.plaza.clone().add(new V3(0, 0, 8))), Math.PI);
      S.thugs.forEach((t, i) => {
        const a = (i / THUGS) * Math.PI * 2;
        t.setHidden(false);
        t.untargetable = false;
        t.hp = t.hpMax;
        t.controller = new SL.AIController(b, { difficulty: 'normal' });
        t.target = s;
        place(t, ground(b, L.plaza.clone().add(new V3(Math.sin(a) * 8, 0, Math.cos(a) * 8 - 4))), 0);
        faceTo(t, s.pos);
        t.setState('free');
      });
      S.civilians.forEach((c) => {
        c.setHidden(false);
        c.setState('scripted', { pose: 'cv_cower', expression: 'shock' });
      });
      s.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('robbers', 'Put the robbers down', { icon: 'fist', target: THUGS });
      m.objective('nobody', 'Nobody on the pavement gets hurt', { icon: 'guard', optional: true });
      m.prompt('gentle', 'light', 'They are ordinary people — one hit is plenty', { always: true });
      let out = 0, civilianHurt = false;
      const offD = b.on('damage', (e) => {
        if (e.target && e.target.def.id === 'civilian' && e.amount > 0) civilianHurt = true;
      });
      const hook = () => {
        for (const t of S.thugs) {
          if (t.beaten || t.untargetable) continue;
          if (t.hpFrac <= 0.2 || !t.alive) {
            t.beaten = true;
            out++;
            knockOut(t);
            m.progress('robbers', out);
            b.emit('thugDown', { fighter: t, count: out });
          }
        }
      };
      m.tickHooks.push(hook);
      yield () => out >= THUGS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (offD) offD();
      m.complete('robbers');
      if (civilianHurt) m.failObjective('nobody');
      else m.complete('nobody');
      m.flags.robbersStopped = out;
      m.flags.civilianHurt = civilianHurt;
      m.qteParts.push(civilianHurt ? 0.4 : 1);
      yield 0.6;
    },
  };

  P.meet = {
    id: 'meet',
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      clearCombat(b);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      place(S.saiyaman, ground(b, L.plaza.clone().add(new V3(0, 0, 4))), Math.PI);
      S.videl.setHidden(false);
      place(S.videl, ground(b, L.plaza.clone().add(new V3(0, 0, -5))), 0);
      faceTo(S.videl, S.saiyaman.pos);
      faceTo(S.saiyaman, S.videl.pos);
      yield* SL.Cinema.play(m, 'saiyaman_videl');
    },
  };

  /**
   * Videl's test. She is a martial artist against somebody who beat Cell, so the
   * fight is measured the other way round: he has to touch her three times
   * cleanly while pulling everything, and she cannot be knocked out by it.
   */
  P.spar = {
    id: 'spar',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, s = S.saiyaman, v = S.videl, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(s, { force: true });
      for (const t of S.thugs) knockOut(t);
      s.hp = s.hpMax;
      s.ki = Math.max(s.ki, 80);
      s.damageDealtMul = 0.02; // he is pulling everything, and it still knocks her back
      s.damageTakenMul = 0.5;
      s.lockedSlots = { special1: true, special2: true, ultimate: true };
      place(s, ground(b, L.plaza.clone().add(new V3(0, 0, 5))), Math.PI);
      v.setHidden(false);
      v.untargetable = false;
      v.hp = v.hpMax;
      v.ki = v.kiMax;
      v.cannotDie = true;
      v.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.9, defense: 0.6, ranged: 0, beam: 0, preferredRange: 1.8 } });
      v.target = s;
      s.target = v;
      place(v, ground(b, L.plaza.clone().add(new V3(0, 0, -5))), 0);
      v.setState('free');
      s.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 5);
      m.objective('touch', 'Land ' + SPAR_HITS + ' clean hits — and pull every one', { icon: 'fist', target: SPAR_HITS });
      m.objective('gentle', 'Leave her standing', { icon: 'guard', optional: true });
      let hits = 0;
      const offD = b.on('damage', (e) => {
        if (e.target !== v || e.attacker !== s || e.blocked) return;
        hits++;
        m.progress('touch', Math.min(SPAR_HITS, hits));
      });
      let frames = 0;
      const hook = () => {
        if (!b.inputLocked) frames++;
      };
      m.tickHooks.push(hook);
      yield () => hits >= SPAR_HITS || frames > SPAR_SECONDS * 60;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (offD) offD();
      m.complete('touch');
      if (v.hpFrac > 0.5) m.complete('gentle');
      else m.failObjective('gentle');
      m.flags.sparHits = hits;
      m.flags.videlStanding = v.hpFrac > 0.5;
      s.lockedSlots = {};
      s.damageDealtMul = 1;
      s.damageTakenMul = 1;
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.5;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      clearCombat(b);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      // up on a roof, away from the street
      const roof = (L.rooftop || L.schoolRoof || L.plaza).clone();
      place(S.saiyaman, roof.clone().add(new V3(-1.6, 0, 1.4)), Math.PI * 0.85);
      place(S.videl, roof.clone().add(new V3(1.6, 0, -1.4)), -Math.PI * 0.15);
      faceTo(S.saiyaman, S.videl.pos);
      faceTo(S.videl, S.saiyaman.pos);
      for (const f of [S.saiyaman, S.videl]) f.grounded = true;
      yield* SL.Cinema.play(m, 'saiyaman_after');
      m.lock(true);
      m.endShot();
      m.flags.saiyamanMissionDone = true;
      m.title('CHAPTER 7 · BUU SAGA', 'THE GREAT SAIYAMAN', 'Somewhere outside the city, two children are not studying either', 3.6);
      yield* m.cine(3.8);
    },
  };

  const def = {
    id: 'buu_saiyaman',
    canon: true,
    chapter: 'CHAPTER 7 · BUU SAGA',
    title: 'The Great Saiyaman',
    subtitle: 'Satan City · Age 774 · a robbery, and a witness',
    character: 'great_saiyaman',
    stage: 'satan_city',
    parTime: 240,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Four robbers, three people on the pavement, and a hero who must not hit anything too hard.',
    rewards: ['Videl playable'],
    setup,
    phases: [P.arrive, P.stop, P.meet, P.spar, P.after],
  };

  SL.data.missions[def.id] = def;
})();
