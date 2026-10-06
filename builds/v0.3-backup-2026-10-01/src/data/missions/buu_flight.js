/*
 * CHAPTER 8 — BUU SAGA: THE TOURNAMENT (Age 774)
 * Mission "Learning to Fly" (canon, played as Videl).
 *
 * Videl blackmails Gohan into teaching her to fly, and the mission is the
 * lesson. It is not an unlock screen: she learns in stages, and each stage is
 * the same flight system every other character uses with a learner's limits on
 * it (`Fighter.flightCtl`) — how much lift she can hold, how far and how fast she
 * can move, how much her body wanders, how high she can go, and how quickly it
 * tires her. Run out of stamina in the air and she stalls and drops; she gets
 * her breath back on the ground and tries again.
 *
 * Phases: LESSON (scene `flight_lesson`) → KI (gather it: hold Charge) →
 * HOVER (checkpoint: get off the ground and hold it) → CONTROL (checkpoint:
 * through the markers, low and unsteady) → SUSTAIN (checkpoint: a real flight
 * across the valley, the limits nearly gone) → AFTER (scene `flight_after`).
 *
 * Clearing the mission is what lets Videl fly anywhere else in the game
 * (`def.flightUnlock`).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const START = new V3(0, 0, 6);
  // what her flight can do at each stage of the lesson
  const LEVELS = {
    hover: { lift: 0.32, speed: 0.12, noBoost: true, wobble: 0.9, ceiling: 2.4, drain: 14, recoverAt: 0.4 },
    control: { lift: 0.65, speed: 0.42, noBoost: true, wobble: 0.45, ceiling: 7, drain: 9, recoverAt: 0.35 },
    sustain: { lift: 1, speed: 0.8, noBoost: false, wobble: 0.15, ceiling: 40, drain: 4.2, recoverAt: 0.3 },
  };
  const HOVER_SECONDS = 4;
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
  const altitude = (b, f) => f.pos.y - b.stage.heightAt(f.pos.x, f.pos.z);

  function setup(battle) {
    const b = battle;
    clearArea(b, new V3(0, 0, -40), 60);
    const videl = b.spawn({ charId: 'videl', player: true, team: 0, pos: ground(b, START), startKi: 0 });
    videl.noFlight = true; // whatever the save says, the lesson starts on the ground
    videl.cannotDie = true;
    const gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: ground(b, START.clone().add(new V3(-2.5, 0, -3))), startKi: 60 });
    gohan.untargetable = true;
    gohan.cannotDie = true;
    gohan.controller = scripted();
    const goten = b.spawn({ charId: 'goten', team: 0, pos: ground(b, START.clone().add(new V3(6, 0, 4))), startKi: 40 });
    goten.untargetable = true;
    goten.cannotDie = true;
    goten.controller = scripted();
    goten.setHidden(true);
    b.story = { videl, gohan, goten };
  }

  /** The coach: Gohan stays just ahead of her shoulder, a little higher, facing her. */
  function coach(m) {
    const b = m.battle, S = b.story, g = S.gohan, v = S.videl;
    const hook = () => {
      if (b.inputLocked) return;
      // ahead of her and to one side, in her own frame, so he is in her view and never in the camera's
      const fwd = v.forward.clone().setY(0).normalize();
      const want = v.pos.clone().addScaledVector(fwd, 3).add(new V3(fwd.z * 2.6, Math.max(1.4, altitude(b, v) * 0.3 + 1.4), -fwd.x * 2.6));
      g.setPosition(g.pos.clone().lerp(want, 0.06));
      g.grounded = false;
      g.vel.set(0, 0, 0);
      g.yaw = g.prevYaw = Math.atan2(v.pos.x - g.pos.x, v.pos.z - g.pos.z);
      if (g.state !== 'scripted') g.setState('scripted', { pose: 'flyIdle', expression: 'soft' });
    };
    m.tickHooks.push(hook);
    return hook;
  }
  function drop(m, hook) {
    const i = m.tickHooks.indexOf(hook);
    if (i >= 0) m.tickHooks.splice(i, 1);
  }

  /** Every lesson stage starts the same way: Videl on the grass, rested, with that stage's limits. */
  function stage(m, level) {
    const b = m.battle, v = b.story.videl;
    m.lock(true);
    m.clearObjectives();
    b.switchPlayer(v, { force: true });
    v.noFlight = !level;
    v.flightCtl = level ? Object.assign({ stalled: false }, LEVELS[level]) : null;
    v.stamina = v.staminaMax;
    v.winded = false;
    v.hp = v.hpMax;
    v.setState('free');
    m.lock(false);
    b.aiLocked = true;
  }

  const P = {};

  P.lesson = {
    id: 'lesson',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      place(S.videl, ground(b, START), Math.PI);
      place(S.gohan, ground(b, START.clone().add(new V3(-1.5, 0, -3.4))), 0);
      yield* SL.Cinema.play(m, 'flight_lesson');
    },
  };

  /** Feel it first: gathering ki is the thing she has never done. */
  P.ki = {
    id: 'ki',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl;
      place(v, ground(b, START), Math.PI);
      stage(m, null);
      v.ki = 0;
      m.objective('ki', 'Gather your ki', { icon: 'potential', target: 100 });
      m.prompt('vKi', 'charge', 'Feel it — hold', { required: true, always: true });
      const hook = coach(m);
      const tick = () => m.progress('ki', Math.floor((100 * v.ki) / v.kiMax));
      m.tickHooks.push(tick);
      yield () => v.ki >= v.kiMax * 0.98;
      drop(m, hook);
      drop(m, tick);
      m.complete('ki');
      m.say('adult_gohan', 'That is it. Now push it down — gently.', 2.6, { style: 'quiet' });
      yield 0.8;
    },
  };

  P.hover = {
    id: 'hover',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl;
      place(v, ground(b, START), Math.PI);
      stage(m, 'hover');
      m.teach(v, 'flight');
      v.noFlight = false;
      v.ki = v.kiMax;
      m.objective('hover', 'Lift off and hold yourself up', { icon: 'fly', target: HOVER_SECONDS });
      m.objective('noStall', 'Do not run out of breath in the air', { icon: 'guard', optional: true });
      m.prompt('vUp', 'flyUp', 'Push down — lift', { required: true, when: () => v.grounded, always: true });
      const hook = coach(m);
      let held = 0, stalls = 0;
      const offS = b.on('flightStall', (e) => {
        if (e.fighter === v) stalls++;
      });
      const tick = () => {
        if (b.inputLocked) return;
        if (!v.grounded && altitude(b, v) > 0.7 && v.canFly()) held += 1 / 60;
        m.progress('hover', Math.min(HOVER_SECONDS, Math.floor(held)));
      };
      m.tickHooks.push(tick);
      yield () => held >= HOVER_SECONDS;
      drop(m, hook);
      drop(m, tick);
      if (offS) offS();
      m.complete('hover');
      if (stalls) m.failObjective('noStall');
      else m.complete('noStall');
      m.flags.hoverStalls = stalls;
      m.say('adult_gohan', 'You are flying. A little. Now move.', 2.4, { style: 'quiet' });
      yield 0.8;
    },
  };

  /** Low, unsteady and slow: through four markers without losing it. */
  P.control = {
    id: 'control',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl;
      place(v, ground(b, START), Math.PI);
      stage(m, 'control');
      v.noFlight = false;
      const points = [new V3(0, 0, -6), new V3(6, 0, -14), new V3(-2, 0, -22), new V3(4, 0, -31)];
      let got = 0;
      m.objective('rings', 'Fly through the markers', { icon: 'target', target: points.length });
      m.prompt('vMove', 'flyUp', 'Keep your height', { required: true, when: () => v.grounded, always: true });
      points.forEach((p, i) => {
        const at = ground(b, p, 2.6 + (i % 2) * 0.8);
        m.pickup(at, {
          r: 0.7, color: 0x8ad4ff, glow: 0xdff2ff, reach: 2.6, kind: 'marker',
          onCollect: () => {
            got++;
            m.progress('rings', got);
          },
        });
      });
      const hook = coach(m);
      yield () => got >= points.length;
      drop(m, hook);
      m.complete('rings');
      m.say('videl', 'Okay. Okay! I have got this.', 2.2, { style: 'shout' });
      yield 0.8;
    },
  };

  /** The real thing: across the valley and up to the ridge, with only her breath to manage. */
  P.sustain = {
    id: 'sustain',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl;
      place(v, ground(b, START), Math.PI);
      stage(m, 'sustain');
      v.noFlight = false;
      const points = [new V3(18, 0, -60), new V3(-24, 0, -110), new V3(10, 0, -160)];
      let got = 0, secs = 0;
      m.objective('route', 'Fly the valley to the far ridge', { icon: 'target', target: points.length });
      m.objective('pace', 'Do it without landing to rest', { icon: 'clock', optional: true });
      points.forEach((p, i) => {
        const at = ground(b, p, 10 + i * 5);
        m.pickup(at, {
          r: 0.9, color: 0xffd36a, glow: 0xfff0b0, reach: 4.5, kind: 'marker',
          onCollect: () => {
            got++;
            m.progress('route', got);
          },
        });
      });
      let landed = 0, wasAir = false;
      const tick = () => {
        if (b.inputLocked) return;
        secs += 1 / 60;
        if (!v.grounded) wasAir = true;
        else if (wasAir) {
          landed++;
          wasAir = false;
        }
      };
      m.tickHooks.push(tick);
      const hook = coach(m);
      yield () => got >= points.length;
      drop(m, hook);
      drop(m, tick);
      m.complete('route');
      if (landed === 0) m.complete('pace');
      else m.failObjective('pace');
      m.flags.flightLandings = landed;
      m.flags.flightSeconds = Math.round(secs);
      m.qteParts.push(U.clamp01(1 - landed / 4));
      yield 0.6;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl;
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      // the lesson is over: she flies like anybody else now
      v.flightCtl = null;
      v.noFlight = false;
      place(v, ground(b, v.pos), v.yaw);
      place(S.gohan, ground(b, v.pos.clone().add(new V3(-2.4, 0, -1.6))), 0);
      S.goten.setPosition(ground(b, v.pos.clone().add(new V3(8, 6, 6))));
      yield* SL.Cinema.play(m, 'flight_after');
      m.endShot();
      m.flags.flightLearned = true;
      m.title('CHAPTER 8 · BUU SAGA', 'LEARNING TO FLY', 'The World Tournament is tomorrow', 3.4);
      yield* m.cine(3.6);
    },
  };

  const def = {
    id: 'buu_flight',
    canon: true,
    // the lessons are where she cuts her hair short (2026-09-25)
    appearance: { videl: { outfit: 'videl_tournament' } },
    chapter: 'CHAPTER 8 · BUU SAGA',
    title: 'Learning to Fly',
    subtitle: 'Mount Paozu · Age 774 · a promise, and a blackmail',
    character: 'videl',
    stage: 'wilderness',
    parTime: 240,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'She knows his secret. The price is flying lessons.',
    rewards: ['Videl can fly'],
    setup,
    phases: [P.lesson, P.ki, P.hover, P.control, P.sustain, P.after],
  };

  SL.data.missions[def.id] = def;
})();
