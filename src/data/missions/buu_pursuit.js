/*
 * CHAPTER 9 — BUU SAGA: THE WIZARD (Age 774)
 * Mission "The Pursuit" (canon, played as Gohan).
 *
 * Spopovich and Yamu fly home with the energy they took, and the Supreme Kai
 * wants to be led to their master without the master knowing. So the player
 * tails them: close enough to keep them in sight, far enough that they never
 * feel him. Getting too close — or letting his power flare by charging,
 * transforming or attacking — fills a "sensed" meter; falling too far behind
 * fills a "lost" one. Either one full ends the mission, and each is said out
 * loud (Kai's whispers and the on-screen prompts) before it happens.
 *
 * The chase ends at a ship half-buried in a crater, and the ship is where the
 * saga's villains are introduced properly: Babidi, who kills the men who served
 * him because they are no longer useful, and Dabura, who turns Piccolo and
 * Krillin to stone with one spit (scene `ship_arrival`).
 *
 * Phases: BRIEF → TAIL (checkpoint: the chase) → ARRIVAL (scene) → AFTER.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  // the route, as [x, height above the ground, z]; it ends at the ship's hatch. Everything stays
  // inside the crater's 170 m play radius (the rim beyond it is 50 m of rock).
  const PATH = [[40, 20, 110], [70, 22, 50], [-30, 20, 20], [-50, 18, -40], [20, 14, -60], [0, 2.2, -89]];
  const SPEED = 10.5; // under a cruising flier's 12.6, so keeping up takes attention, not a boost
  const NEAR = 22; // closer than this and they can feel him
  const FAR = 70; // farther than this and he loses them
  const SENSE_LIMIT = 2; // seconds of being felt before they know
  const LOSE_LIMIT = 5; // seconds out of sight before the trail is gone
  const START = [0, 16, 150]; // 57 m behind the first point: inside the band from the first frame
  const RIDGE = [30, -54]; // where the watchers hide for the arrival
  const HATCH = [0, -89];

  const scripted = () => ({ update: () => SL.emptyIntent() });
  function place(f, pos, yaw, air) {
    f.setPosition(pos);
    if (yaw !== undefined) f.yaw = yaw;
    f.prevYaw = f.yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = !air;
  }
  const ground = (b, x, z, lift = 0) => new V3(x, b.stage.heightAt(x, z) + lift, z);
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));

  /** The route as a polyline: position and heading at any distance along it. */
  function route(b) {
    const pts = PATH.map(([x, h, z]) => ground(b, x, z, h));
    const lens = [0];
    for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = lens[lens.length - 1];
    const seg = (s) => {
      let i = 1;
      while (i < pts.length - 1 && lens[i] < s) i++;
      return i;
    };
    return {
      total,
      at(s) {
        s = U.clamp(s, 0, total);
        const i = seg(s);
        return pts[i - 1].clone().lerp(pts[i], (s - lens[i - 1]) / Math.max(1e-6, lens[i] - lens[i - 1]));
      },
      dir(s) {
        const i = seg(U.clamp(s, 0, total));
        return pts[i].clone().sub(pts[i - 1]).normalize();
      },
    };
  }

  /** Is he giving himself away? Charging, a golden aura, or throwing anything at all. */
  const flaring = (g) => g.formIndex > 0 || ['charge', 'transform', 'beamCharge', 'beam', 'special', 'blast', 'ultimate'].includes(g.state);

  /** A slot in Gohan's frame: x to his right, z along his heading (negative = behind). */
  function slot(g, ox, oz) {
    const sin = Math.sin(g.yaw), cos = Math.cos(g.yaw);
    return new V3(g.pos.x + sin * oz - cos * ox, g.pos.y - 0.6, g.pos.z + cos * oz + sin * ox);
  }

  const TRAILERS = [['goku', -3, -5], ['vegeta', 3.4, -6], ['piccolo', -5.5, -9], ['krillin', 1, -10], ['kai', 5.5, -10]];

  function setup(battle) {
    const b = battle;
    const S = {};
    S.gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: ground(b, START[0], START[2], START[1]), startKi: 60 });
    S.gohan.cannotDie = true;
    for (const [k, id, team] of [['spopovich', 'spopovich', 1], ['yamu', 'yamu', 1], ['goku', 'goku', 0], ['vegeta', 'vegeta', 0], ['piccolo', 'piccolo', 0], ['krillin', 'krillin', 0], ['kai', 'supreme_kai', 0], ['babidi', 'babidi', 1], ['dabura', 'dabura', 1]]) {
      S[k] = b.spawn({ charId: id, team, pos: ground(b, 0, 150), startKi: 50 });
      S[k].controller = scripted();
      S[k].untargetable = true;
      S[k].cannotDie = true;
    }
    S.babidi.setHidden(true);
    S.dabura.setHidden(true);
    b.story = S;
  }

  /** Everyone at the start line: the two ahead, Gohan and the rest behind. */
  function lineUp(b, R) {
    const S = b.story;
    const g = S.gohan;
    const s0 = R.at(0);
    place(g, ground(b, START[0], START[2], START[1]), undefined, true);
    faceTo(g, s0);
    g.setState('free');
    const yaw0 = Math.atan2(R.dir(0).x, R.dir(0).z);
    place(S.spopovich, s0, yaw0, true);
    place(S.yamu, s0.clone().add(new V3(2.6, 0.4, 1.2)), yaw0, true);
    for (const k of ['spopovich', 'yamu']) S[k].setState('scripted', { pose: 'flyForward', expression: 'grin' });
    for (const [k, ox, oz] of TRAILERS) {
      const f = S[k];
      f.setHidden(false);
      place(f, slot(g, ox, oz), g.yaw, true);
      f.setState('scripted', { pose: 'flyIdle', expression: k === 'vegeta' ? 'angry' : 'calm' });
    }
  }

  /** The others keep formation on Gohan: they are there, and they are his responsibility too. */
  function trailHook(b) {
    const S = b.story;
    return () => {
      const g = S.gohan;
      for (const [k, ox, oz] of TRAILERS) {
        const f = S[k];
        const p = f.pos.clone().lerp(slot(g, ox, oz), 0.06);
        f.setPosition(p);
        f.grounded = false;
        f.yaw = f.prevYaw = g.yaw;
      }
    };
  }

  const P = {};

  P.brief = {
    id: 'brief',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      const R = route(b);
      lineUp(b, R);
      S.gohan.setState('scripted', { pose: 'flyIdle', expression: 'angry' });
      m.shot((t, out) => {
        const c = S.kai.chest();
        out.pos.set(c.x + 1.6, c.y + 0.5, c.z - 2.6 + t * 0.3);
        out.look.set(c.x, c.y + 0.1, c.z);
        out.fov = 38;
      }, 5, { cut: true, blendIn: 0 });
      m.say('supreme_kai', 'They are taking it to their master. Follow them — but hide your power. If they feel you, he will know we are coming.', 4.6, { style: 'quiet' });
      yield* m.cine(4.8);
      m.shot((t, out) => {
        const c = S.gohan.chest();
        out.pos.set(c.x - 1.2, c.y + 0.6, c.z - 3.2);
        out.look.set(c.x, c.y, c.z + 30);
        out.fov = 44;
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('adult_gohan', 'Not too close, not too far. Got it.', 2.8, { style: 'quiet' });
      yield* m.cine(3);
      m.endShot();
    },
  };

  P.tail = {
    id: 'tail',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      b.switchPlayer(g, { force: true });
      if (g.formIndex !== 0) g.applyForm(0);
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 60);
      g.stamina = g.staminaMax;
      g.target = null; // nothing to lock on to: this is not a fight
      const R = route(b);
      lineUp(b, R);
      m.lock(false);
      b.aiLocked = true;
      m.objective('tail', 'Follow them to their master', { icon: 'target', target: 100 });
      m.objective('unseen', 'Never let them feel you', { icon: 'lock', optional: true });
      const st = { s: 0, sensed: 0, lost: 0, near: false, far: false, flare: false, clean: true, minGap: Infinity, maxGap: 0 };
      m.prompt('tail_close', 'down', 'Too close — they can feel you. Drop back', { required: true, when: () => st.near, until: () => false, always: true });
      m.prompt('tail_flare', 'charge', 'Your ki is flaring — power down', { required: true, when: () => st.flare, until: () => false, always: true });
      m.prompt('tail_far', 'up', 'You are losing them — close in', { required: true, when: () => st.far, until: () => false, always: true });
      m.flags.tail = st;
      const trail = trailHook(b);
      const whispers = { near: 0, far: 0, flare: 0 };
      const whisper = (kind, line) => {
        if (b.frame < whispers[kind]) return;
        whispers[kind] = b.frame + 60 * 6;
        m.say('supreme_kai', line, 2.4, { style: 'quiet' });
      };
      const hook = () => {
        if (b.inputLocked || m.state !== 'running') return;
        const dt = 1 / 60;
        st.s = Math.min(R.total, st.s + SPEED * dt);
        const at = R.at(st.s), dir = R.dir(st.s);
        const yaw = Math.atan2(dir.x, dir.z);
        S.spopovich.setPosition(at);
        S.yamu.setPosition(at.clone().add(new V3(Math.cos(yaw) * 2.6, 0.4 + Math.sin(b.frame * 0.05) * 0.2, -Math.sin(yaw) * 2.6)));
        for (const k of ['spopovich', 'yamu']) {
          const f = S[k];
          f.grounded = false;
          f.vel.set(0, 0, 0);
          f.yaw = f.prevYaw = yaw;
        }
        trail();
        const gap = g.pos.distanceTo(at);
        st.minGap = Math.min(st.minGap, gap);
        st.maxGap = Math.max(st.maxGap, gap);
        st.near = gap < NEAR;
        st.far = gap > FAR;
        st.flare = flaring(g);
        if (st.near || st.flare) {
          st.sensed += dt * (st.flare ? 2 : 1);
          st.clean = false;
          if (st.flare) whisper('flare', 'Your power — hide it!');
          else whisper('near', 'Gohan, you are too close. Fall back.');
        } else st.sensed = Math.max(0, st.sensed - dt * 0.5);
        if (st.far) {
          st.lost += dt;
          st.clean = false;
          whisper('far', 'We are losing them. Faster.');
        } else st.lost = Math.max(0, st.lost - dt);
        m.progress('tail', Math.floor((100 * st.s) / R.total));
        if (st.sensed >= SENSE_LIMIT) m.fail('They felt you coming — and so did their master.');
        else if (st.lost >= LOSE_LIMIT) m.fail('You lost them.');
      };
      m.tickHooks.push(hook);
      yield () => st.s >= R.total;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('tail');
      if (st.clean) m.complete('unseen');
      else m.failObjective('unseen');
      m.flags.tailClean = st.clean;
      m.qteParts.push(st.clean ? 1 : 0.5);
    },
  };

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      const hatch = ground(b, HATCH[0], HATCH[1]);
      // the two land in front of the hatch; the wizard and the demon king come out of it
      place(S.spopovich, hatch.clone().add(new V3(-2.4, 0, 4.4)), Math.PI);
      place(S.yamu, hatch.clone().add(new V3(2.4, 0, 4.4)), Math.PI);
      place(S.babidi, hatch.clone().add(new V3(0, 0, 0.6)), 0);
      place(S.dabura, hatch.clone().add(new V3(2.2, 0, 0.2)), 0);
      for (const k of ['spopovich', 'yamu']) S[k].setState('scripted', { pose: k === 'spopovich' ? 'sp_idle' : 'idle', expression: 'grin' });
      S.babidi.setState('scripted', { pose: 'bb_idle', expression: 'grin' });
      S.dabura.setState('scripted', { pose: 'db_idle', expression: 'smirk' });
      // the watchers crouch on the ridge
      const spots = { gohan: [0, 0], goku: [-1.8, 0.6], vegeta: [2, 1], piccolo: [-3.6, -1], krillin: [-2.4, -2.2], kai: [1.2, -1.8] };
      for (const k of Object.keys(spots)) {
        const f = S[k];
        f.setHidden(false);
        place(f, ground(b, RIDGE[0] + spots[k][0], RIDGE[1] + spots[k][1]));
        faceTo(f, hatch);
        f.setState('scripted', { pose: k === 'kai' ? 'sk_idle' : k === 'piccolo' || k === 'vegeta' ? 'armsCrossed' : 'idle', expression: 'angry' });
      }
      yield* SL.Cinema.play(m, 'ship_arrival');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      for (const k of ['babidi', 'dabura']) S[k].setHidden(true);
      // the two statues from the ship's side, their friends behind them
      const p = S.piccolo, k = S.krillin;
      const mid = p.chest().lerp(k.chest(), 0.5);
      const fwd = p.forward.clone().setY(0).normalize();
      m.shot((t, out) => {
        out.pos.copy(mid).addScaledVector(fwd, 4.2 - t * 0.5);
        out.pos.y += 0.5;
        out.look.copy(mid);
        out.fov = 44;
      }, 5, { cut: true, blendIn: 0 });
      m.say('supreme_kai', 'While Dabura lives, they stay stone. Beat him and it breaks. The hatch is open — he is inviting us.', 4.4, { style: 'quiet' });
      yield* m.cine(4.6);
      m.say('vegeta', 'Then we accept.', 2, { style: 'quiet' });
      yield* m.cine(2.2);
      m.endShot();
      m.flags.pursuitDone = true;
      m.title('CHAPTER 9 · BUU SAGA', 'THE PURSUIT', 'Next: the first floor', 3.4);
      yield* m.cine(3.6);
    },
  };

  const def = {
    id: 'buu_pursuit',
    canon: true,
    chapter: 'CHAPTER 9 · BUU SAGA',
    title: 'The Pursuit',
    subtitle: 'After the tournament · the wizard\'s crater',
    character: 'adult_gohan',
    stage: 'babidi_crater',
    parTime: 150,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'Follow two men to their master. Do not let either of them feel you do it.',
    rewards: [],
    setup,
    phases: [P.brief, P.tail, P.arrival, P.after],
  };

  SL.data.missions[def.id] = def;
})();
