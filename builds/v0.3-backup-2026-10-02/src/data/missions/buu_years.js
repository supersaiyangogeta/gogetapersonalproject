/*
 * CHAPTER 7 — BUU SAGA (Age 774, first mission of the era)
 * Mission "Seven Years" (canon, played as Gohan).
 *
 * The time skip, played rather than announced. The player takes the strongest
 * fighter on Earth to school: a flight across a city that has never appeared in
 * this game before, a robbery he can see from the air, and the decision that a
 * seventeen-year-old makes about being seen — which is where the Great Saiyaman
 * comes from.
 *
 * Phases: MORNING (scene `years_morning`) → FLIGHT (checkpoint: fly across
 * Satan City to the plaza, which is the mission's tutorial for the new stage) →
 * ROBBERY (scene `city_robbery`) → CHANGE (scene `saiyaman_change`) → AFTER.
 *
 * Nothing here is a fight. It is the chapter learning to breathe before the
 * wizard arrives.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FLIGHT_PAR = 22; // seconds for the optional objective
  // he comes in from outside the city, the way anybody who lives on a mountain would
  const EDGE = new V3(0, 0, 236);
  const scripted = () => ({ update: () => SL.emptyIntent() });

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
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  function setup(battle) {
    const b = battle;
    const L = b.stage.landmarks;
    const start = ground(b, EDGE);
    const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: start, startKi: 80 });
    gohan.cannotDie = true;
    gohan.lockedForms = { ssj: true, ssj2: true }; // nothing in this mission needs them
    const saiyaman = b.spawn({ charId: 'great_saiyaman', team: 0, pos: start.clone().add(new V3(2, 0, 0)), startKi: 80 });
    saiyaman.cannotDie = true;
    saiyaman.setHidden(true);
    saiyaman.untargetable = true;
    saiyaman.controller = scripted();
    // the robbery, hidden until the story reaches it
    const thugs = [];
    for (let i = 0; i < 2; i++) {
      const t = b.spawn({ charId: 'city_thug', team: 1, pos: ground(b, new V3(-4 + i * 8, 0, 6)), startKi: 20, tag: 'thug' });
      t.setHidden(true);
      t.untargetable = true;
      t.controller = scripted();
      thugs.push(t);
    }
    const civilians = [];
    for (let i = 0; i < 2; i++) {
      const c = b.spawn({ charId: 'civilian', team: 0, pos: ground(b, new V3(-8 + i * 16, 0, 12)), startKi: 0, tag: 'civilian' });
      c.setHidden(true);
      c.untargetable = true;
      c.cannotDie = true;
      c.controller = scripted();
      civilians.push(c);
    }
    b.story = { gohan, saiyaman, thugs, civilians, thug0: thugs[0], thug1: thugs[1] };
  }

  const P = {};

  P.morning = {
    id: 'morning',
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of b.fighters) f.controller = scripted();
      place(S.gohan, ground(b, EDGE), Math.PI);
      faceTo(S.gohan, L.plaza);
      yield* SL.Cinema.play(m, 'years_morning');
    },
  };

  /**
   * The flight. The only thing the player does here is move, and that is the
   * point: a new city, a new set of rooftops, and the reminder that the boy who
   * beat Cell now uses this power to avoid being late.
   */
  P.flight = {
    id: 'flight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      g.setHidden(false);
      g.untargetable = false;
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 80);
      place(g, ground(b, EDGE, 0.1), Math.PI);
      faceTo(g, L.plaza);
      g.setState('free');
      m.lock(false);
      b.aiLocked = true; // nothing else on this street is fighting
      m.music('battle', 3);
      m.objective('plaza', 'Fly into the city, to the plaza in the middle', { icon: 'target', target: 1 });
      m.objective('quick', 'Be there inside ' + FLIGHT_PAR + ' seconds', { icon: 'clock', optional: true });
      m.prompt('flyUp', 'flyUp', 'Fly', { required: true, when: () => g.grounded, always: true });
      const plaza = L.plaza.clone();
      let t = 0, done = false, secs = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t++;
        secs = t / 60;
        if (!done && Math.hypot(g.pos.x - plaza.x, g.pos.z - plaza.z) < 12) {
          done = true;
          m.progress('plaza', 1);
        }
      };
      m.tickHooks.push(hook);
      yield () => done;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('plaza');
      if (secs <= FLIGHT_PAR) m.complete('quick');
      else m.failObjective('quick');
      m.flags.flightSeconds = Math.round(secs);
      m.flags.reachedPlaza = true;
      m.qteParts.push(U.clamp01(1 - secs / (FLIGHT_PAR * 2)));
      yield 0.4;
    },
  };

  P.robbery = {
    id: 'robbery',
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      clearCombat(b);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      place(S.gohan, ground(b, L.plaza.clone().add(new V3(0, 0, 9))), Math.PI);
      S.thugs.forEach((t, i) => {
        t.setHidden(false);
        place(t, ground(b, L.plaza.clone().add(new V3(-3 + i * 6, 0, -4))), 0);
        t.setState('scripted', { pose: 'th_idle', expression: 'angry' });
      });
      S.civilians.forEach((c, i) => {
        c.setHidden(false);
        place(c, ground(b, L.plaza.clone().add(new V3(-7 + i * 14, 0, -1))), Math.PI * 0.5);
        c.setState('scripted', { pose: 'cv_cower', expression: 'shock' });
      });
      yield* SL.Cinema.play(m, 'city_robbery');
    },
  };

  P.change = {
    id: 'change',
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      for (const f of b.fighters) f.controller = scripted();
      // round the corner, out of sight of the street
      place(S.gohan, ground(b, L.plaza.clone().add(new V3(16, 0, 16))), Math.PI * 0.75);
      place(S.saiyaman, ground(b, L.plaza.clone().add(new V3(16, 0, 16))), Math.PI * 0.75);
      yield* SL.Cinema.play(m, 'saiyaman_change');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.endShot();
      m.flags.yearsDone = true;
      m.title('CHAPTER 7 · BUU SAGA', 'SATAN CITY', 'Somebody in a helmet is about to interrupt a robbery', 3.6);
      yield* m.cine(3.8);
    },
  };

  const def = {
    id: 'buu_years',
    canon: true,
    // his first day at Orange Star High: the school clothes, not the gi (2026-09-25)
    appearance: { adult_gohan: { outfit: 'ag_school' } },
    chapter: 'CHAPTER 7 · BUU SAGA',
    title: 'Seven Years',
    subtitle: 'Satan City · Age 774 · first day at a new school',
    character: 'adult_gohan',
    stage: 'satan_city',
    parTime: 150,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'The strongest fighter on Earth is seventeen, late for class, and about to invent a superhero.',
    rewards: ['Gohan (Age 17) playable', 'Great Saiyaman playable'],
    setup,
    phases: [P.morning, P.flight, P.robbery, P.change, P.after],
  };

  SL.data.missions[def.id] = def;
})();
