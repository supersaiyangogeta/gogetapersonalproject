/*
 * CHAPTER 2 — SAIYAN SAGA: ONE YEAR
 * Mission "Snake Way" (canon, playable as Goku).
 *
 * Canon beats: after dying to stop Raditz, Goku checks in with King Yemma,
 * asks to train with King Kai and runs the whole of Snake Way (the story
 * calls it a million kilometres) to the little planet at its far end.
 *
 * Gameplay: a run along a narrow, winding serpent road above a sea of clouds.
 * Goku cannot fly yet and sprinting tires him, so the run has to be paced.
 * Road posts count the distance; stepping off the road drops him into the
 * clouds and he climbs back up at the last post he passed, losing time.
 *
 * Liberties (gameplay, not canon): the road is compressed to under a kilometre
 * and it has three short gaps where the old serpent's body sinks into the
 * clouds. King Yemma is heard from his check-in station, not shown.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const PACE = 85; // optional goal: seconds from the first step to the tail
  const FALL_PENALTY = 5; // seconds added for each fall

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function place(f, pos, yaw) {
    f.setPosition(pos);
    f.yaw = yaw;
    f.prevYaw = yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  function scriptedController() {
    return { update: () => SL.emptyIntent() };
  }

  /** A point on the road s metres from the start: position on the surface and the heading along the road. */
  function roadPoint(b, s) {
    const r = b.stage.road;
    const i = U.clamp(Math.round(s / r.step), 0, r.count - 1);
    return { pos: new V3(r.x[i], r.y[i] + 0.02, r.z[i]), yaw: Math.atan2(r.tx[i], r.tz[i]), i };
  }

  /** Distance along the road from the player to the start of the next gap (Infinity if none). */
  function gapAhead(b, p) {
    const q = b.stage.roadInfo(p.pos.x, p.pos.z);
    if (q.i < 0) return Infinity;
    const gap = b.stage.road.gaps.find((g) => g.to > q.s);
    return gap ? gap.from - q.s : Infinity;
  }

  /** The halo of the dead, floating over Goku's head (SL.Cinema.halo). */
  const halo = (b, f) => SL.Cinema.halo(b, f);

  /** A road post: a golden pole with a lamp on the right edge of the road. It lights up once passed. */
  function roadPost(b, marker) {
    const r = b.stage.road, i = marker.index;
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 3.2, 8), SL.Toon.mat(0xb8862a));
    pole.position.y = 1.6;
    SL.Toon.addOutline(pole, 1.4);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd060 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), lampMat);
    lamp.position.y = 3.5;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xffd060, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.setScalar(2.6);
    glow.position.y = 3.5;
    g.add(pole, lamp, glow);
    const side = r.hw[i] - 0.35;
    g.position.set(r.x[i] - r.tz[i] * side, r.y[i], r.z[i] + r.tx[i] * side);
    b.scene.add(g);
    return { group: g, lampMat, glow, pos: new V3(g.position.x, g.position.y + 3.5, g.position.z), alive: true, s: marker.s };
  }

  function lightPost(b, post) {
    post.alive = false;
    post.lampMat.color.set(0x9af0ff);
    post.glow.material.color.set(0x9af0ff);
    post.glow.scale.setScalar(4);
    b.vfx.ring(post.pos, 2.4, 0x9af0ff, 0.35);
    SL.Audio.play('uiSelect', { vol: 0.5, pitch: 1.3 });
    b.emit('roadMarker', { post });
  }

  function setup(battle) {
    const b = battle;
    const start = roadPoint(b, 6);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: start.pos, noFlight: true, startKi: 40 });
    // Goku before King Kai: no Instant Transmission, Spirit Bomb, Kaioken or Super Saiyan
    goku.lockedSlots = { special2: true, ultimate: true, transform: true };
    goku.lockedForms = { ssj: true, kaioken: true };
    goku.formCaps = { kaioken: 0 };
    goku.yaw = goku.prevYaw = start.yaw;
    goku.target = null;
    const posts = b.stage.road.markers.map((mk) => roadPost(b, mk));
    const end = roadPoint(b, b.stage.road.length - 1);
    b.story = { goku, posts, halo: halo(b, goku), endMark: { pos: end.pos.clone().add(new V3(0, 1.5, 0)), alive: true } };
  }

  const P = {};

  P.checkin = {
    id: 'checkin',
    run: function* (m) {
      const b = m.battle, p = m.player, L = b.stage.landmarks;
      m.lock(true);
      m.music('menu', 0);
      p.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.shot((t, out) => camAt(out, L.palace.clone().add(new V3(U.lerp(-58, -50, t), U.lerp(7, 5, t), U.lerp(62, 54, t))), L.palace.clone().add(new V3(0, 3, 0)), 48), 3.8, { cut: true, blendIn: 0 });
      m.say('king_yemma', 'Train with King Kai? Then run Snake Way to its end. It is a million kilometres, and nobody has made it in ages.', 3.6);
      yield* m.cine(3.8);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, 2.3).add(new V3(0.7, U.lerp(-0.3, -0.1, t), 0)), c.clone().add(new V3(0, 0.2, 0)), 40);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('goku', "A million, huh? Then I'd better get running!", 2.4);
      p.setState('scripted', { pose: 'g_resolve', expression: 'grin' });
      yield* m.cine(2.6);
      // the road ahead, and the little planet far beyond it
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, -6).add(new V3(0, U.lerp(3, 5, t), 0)), L.kingKai, 52);
      }, 2.4, { cut: true, blendIn: 0 });
      yield* m.cine(2.2);
      m.endShot();
      p.setState('free');
    },
  };

  P.run = {
    id: 'run',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = m.player, road = b.stage.road;
      m.lock(true);
      m.clearObjectives();
      const start = roadPoint(b, 6);
      place(p, start.pos, start.yaw);
      p.noFlight = true;
      p.target = null;
      p.stamina = p.staminaMax;
      p.winded = false;
      // running, not fighting: no strikes, blasts, guard, charging or lock-on out here
      m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, charge: false, guard: false, transform: false, target: false });
      p.setState('free');
      b.camera.cut();
      m.lock(false);
      b.aiLocked = true;
      m.music('battle', 1);
      const total = S.posts.length + 1;
      m.objective('road', "Run to King Kai's planet", { icon: 'run', target: total });
      const noFall = m.objective('noFall', 'Never fall off the road', { icon: 'run', optional: true });
      m.objective('pace', 'Reach the tail within ' + PACE + ' s', { icon: 'clock', optional: true });
      let passed = 0, respawnS = 6, fell = false, falls = 0;
      const t0 = m.time;
      const next = () => (passed < S.posts.length ? S.posts[passed] : S.endMark);
      b.emit('markers', { list: [{ obj: next(), icon: 'run' }] });
      m.prompt('snakeSprint', 'boost', 'Sprint', { when: () => m.time - t0 > 2.5 && !p.winded, until: () => SL.Input.held('boost') });
      m.prompt('snakeJump', 'ascend', 'Jump', { always: true, when: () => p.grounded && gapAhead(b, p) < 7, until: () => !p.grounded });
      const atEnd = () => {
        const q = b.stage.roadInfo(p.pos.x, p.pos.z);
        return q.onRoad && p.grounded && q.s >= road.length - 4;
      };
      m.tickHooks.push(() => {
        if (b.inputLocked || fell) return;
        const q = b.stage.roadInfo(p.pos.x, p.pos.z);
        if (q.onRoad && p.grounded) {
          while (passed < S.posts.length && q.s >= S.posts[passed].s) {
            lightPost(b, S.posts[passed]);
            respawnS = S.posts[passed].s;
            passed++;
            m.progress('road', passed);
            b.emit('markers', { list: [{ obj: next(), icon: 'run' }] });
          }
        }
        // well below the road: gone into the clouds
        const below = q.i >= 0 ? road.y[q.i] : 0;
        if (p.pos.y < below - 9) fell = true;
      });
      for (;;) {
        yield () => fell || atEnd();
        if (!fell) break;
        // a moment in the clouds, then back up at the last post
        falls++;
        m.failObjective('noFall');
        m.lock(true);
        b.emit('fellOff', { fighter: p, falls });
        b.sfx('dash', p, { vol: 0.6, pitch: 0.6 });
        m.fade('black', 0.35);
        yield 0.45;
        const back = roadPoint(b, respawnS + 1);
        place(p, back.pos, back.yaw);
        p.setState('free');
        p.stamina = Math.max(p.stamina, p.staminaMax * 0.5);
        p.winded = false;
        b.camera.cut();
        m.time += FALL_PENALTY;
        m.fade('clear', 0.35);
        if (falls === 1) m.say('goku', 'Whoa! ...Okay, okay. Watch your step, Goku.', 2.2);
        fell = false;
        m.lock(false);
        b.aiLocked = true;
      }
      m.tickHooks.length = 0;
      b.emit('markers', { list: [] });
      m.progress('road', total);
      if (!noFall.failed) m.complete('noFall');
      if (m.time - t0 <= PACE) m.complete('pace');
      else m.failObjective('pace');
      b.emit('snakeWayRun', { seconds: m.time - t0, falls });
      m.limits(null);
    },
  };

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, p = m.player, road = b.stage.road, planet = b.stage.landmarks.kingKai;
      m.lock(true);
      const end = roadPoint(b, road.length - 1.5);
      place(p, end.pos, end.yaw);
      p.setState('scripted', { pose: 'g_victory', expression: 'grin' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().addScaledVector(p.forward, -4.5).add(new V3(1.2, U.lerp(0.4, 1.2, t), 0)), c.clone().lerp(planet, U.lerp(0.05, 0.6, t)), 50);
      }, 3, { cut: true, blendIn: 0 });
      m.say('goku', "There it is — King Kai's planet! Made it!", 2.6);
      yield* m.cine(2.8);
      // one big leap up toward the little planet
      const from = p.pos.clone();
      let k = 0;
      m.tickHooks.push(() => {
        k++;
        const t = Math.min(1, k / 100);
        p.pos.lerpVectors(from, planet, U.easeInOutCubic(t) * 0.55);
        p.pos.y += Math.sin(t * Math.PI) * 6;
        p.prevPos.copy(p.pos);
        if (k % 3 === 0) b.vfx.trail(p.chest(), 0xfff2a0, 0.5, 0.4);
      });
      p.setState('scripted', { pose: 'dash', expression: 'grin' });
      b.sfx('jump', p, { vol: 1.3, pitch: 0.8 });
      m.shot((t, out) => camAt(out, end.pos.clone().add(new V3(0, 2, 0)).addScaledVector(p.forward, -8), p.chest(), 56), 2, { cut: true, blendIn: 0 });
      yield* m.cine(1.7);
      m.tickHooks.length = 0;
      m.fade('black', 0.8);
      yield 1;
      m.endShot();
      m.title('CHAPTER 2', 'SNAKE WAY', 'Next: Ten Times Gravity', 3.4);
      yield* m.cine(3.6);
    },
  };

  const def = {
    id: 'saiyan_snakeway',
    canon: true,
    chapter: 'CHAPTER 2 · SAIYAN SAGA',
    title: 'Snake Way',
    subtitle: 'Other World · the road to King Kai',
    character: 'goku',
    stage: 'snakeway',
    parTime: 100,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Dead, but not done. A winding serpent road above the clouds, and at its far end a teacher who can make Goku strong enough for the Saiyans.',
    rewards: ['The way to King Kai (continues in "Ten Times Gravity")'],
    setup,
    phases: [P.checkin, P.run, P.arrive],
  };

  SL.data.missions[def.id] = def;
})();
