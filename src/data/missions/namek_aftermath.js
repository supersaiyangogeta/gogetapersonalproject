/*
 * CHAPTER 4 — NAMEK SAGA (nineteenth and last mission of the Namek chapter)
 * Mission "What He Left Behind" (canon, played as Goku).
 *
 * Canon beats: the wishes are granted and everyone who can leave leaves, which
 * puts Goku alone on a planet with a few minutes left. Frieza's ship is intact
 * and completely dead, so the last thing he does on Namek is look for a way off
 * it while the surface comes apart.
 *
 * Phases: WISHES (scene `namek_wishes`) → SEARCH (checkpoint: fly to Frieza's
 * ship across erupting ground) → SHIP (scene `namek_ship_dead`) → PODS
 * (checkpoint: reach a Ginyu pod before the clock runs out) → GONE (scene
 * `namek_gone`) → AFTER (cutscene: what everyone on Earth was told, and what
 * actually happened).
 *
 * There is no opponent in this mission. The planet is the opponent, and the
 * objectives are distance and time rather than health.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const SHIP_AT = new V3(72, 0, -96);
  const POD_AT = new V3(-86, 0, -60);
  const PODS_SECONDS = 50;

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
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** The same hazard the destruction mission uses: a warning ring, then a column. */
  function eruptions(m, opts = {}) {
    const b = m.battle;
    const every = opts.every || 150;
    const radius = opts.radius || 3.2;
    const damage = opts.damage || 900;
    const warn = opts.warn || 42;
    const pending = [];
    let n = 0;
    return () => {
      if (b.inputLocked) return;
      n++;
      if (n % every === 0) {
        const who = b.fighters.filter((f) => f.alive && !f.hidden);
        const t = who[Math.floor(Math.random() * who.length)];
        if (t) {
          const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 7;
          const at = t.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
          if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
          pending.push({ at, t: warn });
          b.vfx.ring(at.clone().add(new V3(0, 0.2, 0)), radius, 0xff8a4a, 0.7, new V3(0, 1, 0));
          b.vfx.dust(at, radius * 0.7, 8);
        }
      }
      for (let i = pending.length - 1; i >= 0; i--) {
        const p = pending[i];
        if (--p.t > 0) {
          if (p.t % 8 === 0) b.vfx.dust(p.at, radius * 0.5, 4);
          continue;
        }
        pending.splice(i, 1);
        b.vfx.explosion(p.at.clone().add(new V3(0, 1.4, 0)), radius * 1.6, 0xff9a5a, { smoke: true });
        b.cameraTraumaAt(p.at, 0.45);
        b.sfx('explosionBig', null, { at: p.at, vol: 0.85, pitch: 0.75 });
        for (const f of b.fighters) {
          if (!f.alive || f.hidden || !f.grounded) continue;
          if (f.pos.distanceTo(p.at) > radius + f.radius) continue;
          f.takeHit(null, {
            type: 'explosion',
            damage,
            knock: 'launch',
            knockSpeed: 20,
            hitstun: 24,
            impact: 3,
            dir: new V3(0, 1, 0),
            point: p.at.clone(),
            name: 'Eruption',
          });
        }
        m.flags.eruptions = (m.flags.eruptions || 0) + 1;
      }
    };
  }

  /**
   * A place to get to. The prop is the thing the HUD marker points at, so the
   * objective is a distance the player can see rather than a number in a corner.
   */
  function beacon(b, id, at, color, r) {
    const pr = b.stage.addProp({ kind: 'pod', id, pos: ground(b, at, (r || 2.2) * 0.55), r: r || 2.2, hp: 999999 });
    pr.invulnerable = true;
    if (pr.glow && pr.glow.material && color !== undefined) pr.glow.material.color.setHex(color);
    return pr;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 40);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 4))), startKi: 80 });
    goku.lockedForms = {};
    const ssj = goku.def.forms.findIndex((f) => f.id === 'ssj');
    if (ssj > 0) goku.applyForm(ssj);
    goku.setDamage(2); // the trousers as the whole fight left them
    goku.setTorn(true); // he has not had a chance to change
    goku.hp = Math.round(goku.hpMax * 0.5);
    goku.cannotDie = true; // canon: nothing on this planet kills him, he simply runs out of time
    const dende = b.spawn({ charId: 'dende', team: 0, pos: ground(b, FIELD.clone().add(new V3(5, 0, 7))), startKi: 20 });
    const elder = b.spawn({ charId: 'namekian_elder', team: 0, pos: ground(b, FIELD.clone().add(new V3(-6, 0, 9))), startKi: 20 });
    for (const f of [dende, elder]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      faceTo(f, goku.pos);
    }
    b.story = { goku, dende, elder };
    b.stage.setMood(0.5, 0x5a1c10, 1.5);
  }

  const P = {};

  P.wishes = {
    id: 'wishes',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [S.goku, S.dende, S.elder]) f.controller = scripted();
      faceTo(S.goku, S.dende.pos);
      yield* SL.Cinema.play(m, 'namek_wishes');
    },
  };

  /**
   * The first run: Frieza's ship, across ground that keeps opening. The air is
   * the safe place, exactly as the last mission taught.
   */
  P.search = {
    id: 'search',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      for (const k of ['dende', 'elder']) {
        const f = S[k];
        f.setHidden(true);
        f.untargetable = true;
        f.alive = false;
      }
      g.setTorn(true);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.4));
      g.ki = Math.max(g.ki, 60);
      g.cannotDie = true;
      g.target = null;
      g.setState('free');
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 4))), Math.PI);
      // Frieza's ship is the same round hull at a larger size (Level 1 prototype prop)
      const ship = beacon(b, 'friezaShip', SHIP_AT, 0xffd070, 6);
      m.onDispose(() => {
        ship.alive = false;
        if (ship.group) ship.group.visible = false;
      });
      b.emit('markers', { list: [{ obj: ship, icon: 'run' }] });
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 3);
      const flat = (a, c) => Math.hypot(a.x - c.x, a.z - c.z);
      const start = Math.round(flat(g.pos, ship.pos));
      m.objective('reach', "Reach Frieza's ship", { icon: 'run', target: 100 });
      m.objective('untouched', 'Get there without being caught by an eruption', { icon: 'guard', optional: true });
      let caught = 0;
      b.on('damage', (e) => {
        if (e.target === g && e.source === 'Eruption') caught++;
      });
      const erupt = eruptions(m, { every: 110, radius: 3.6, damage: 800, warn: 38 });
      m.tickHooks.push(erupt);
      let arrived = false;
      const hook = () => {
        if (b.inputLocked) return;
        const d = flat(g.pos, ship.pos);
        m.progress('reach', Math.max(0, Math.min(100, Math.round((1 - d / Math.max(1, start)) * 100))));
        if (d < 7) arrived = true;
      };
      m.tickHooks.push(hook);
      m.prompt('flyThere', 'up', 'Fly — the ground is not safe', { required: true, always: true, when: () => g.grounded, until: () => !g.grounded });
      yield () => arrived;
      for (const h of [erupt, hook]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      b.emit('markers', { list: [] });
      m.complete('reach');
      if (!caught) m.complete('untouched');
      else m.failObjective('untouched');
      m.flags.reachedShip = true;
      m.flags.caughtOnTheWay = caught;
      m.qteParts.push(U.clamp01(g.hpFrac));
      ship.alive = false;
      if (ship.group) ship.group.visible = false;
      yield 0.4;
    },
  };

  P.ship = {
    id: 'ship',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      S.goku.controller = scripted();
      yield* SL.Cinema.play(m, 'namek_ship_dead');
    },
  };

  /**
   * The second run, and the only timed one in the chapter: the pods are further
   * out than the ship was, and the surface has stopped pretending.
   */
  P.pods = {
    id: 'pods',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      g.setTorn(true);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.35));
      g.ki = Math.max(g.ki, 50);
      g.cannotDie = true;
      g.target = null;
      g.setState('free');
      place(g, ground(b, SHIP_AT.clone().add(new V3(0, 0, 5))), Math.PI);
      const pod = beacon(b, 'ginyuPod', POD_AT, 0xff6a5a);
      m.onDispose(() => {
        pod.alive = false;
        if (pod.group) pod.group.visible = false;
      });
      b.emit('markers', { list: [{ obj: pod, icon: 'run' }] });
      b.stage.setMood(0.7, 0x5a1c10, 1.4);
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      const flat = (a, c) => Math.hypot(a.x - c.x, a.z - c.z);
      const start = Math.round(flat(g.pos, pod.pos));
      m.objective('pod', 'Reach a Ginyu pod', { icon: 'run', target: 100 });
      m.objective('clock', 'Before the surface goes', { icon: 'clock', target: PODS_SECONDS });
      const erupt = eruptions(m, { every: 70, radius: 4, damage: 900, warn: 32 });
      m.tickHooks.push(erupt);
      let t = 0, arrived = false;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        const d = flat(g.pos, pod.pos);
        m.progress('pod', Math.max(0, Math.min(100, Math.round((1 - d / Math.max(1, start)) * 100))));
        m.progress('clock', Math.min(PODS_SECONDS, Math.floor(t)));
        if (d < 7) arrived = true;
        // the horizon keeps letting go while he flies
        if (b.frame % 90 === 0) {
          const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 40;
          const at = g.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
          if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
          b.vfx.explosion(at, 12, 0xff9a5a, { smoke: true });
          b.cameraTraumaAt(g.chest(), 0.3);
        }
      };
      m.tickHooks.push(hook);
      yield () => arrived || t >= PODS_SECONDS + 25;
      for (const h of [erupt, hook]) {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
      b.emit('markers', { list: [] });
      m.complete('pod');
      if (t <= PODS_SECONDS) m.complete('clock');
      else m.failObjective('clock');
      m.flags.podSeconds = Math.round(t);
      m.flags.reachedPod = arrived;
      place(g, ground(b, POD_AT.clone().add(new V3(0, 0, 4))), Math.PI);
      faceTo(g, pod.pos);
      m.qteParts.push(U.clamp01(g.hpFrac));
      pod.alive = false;
      if (pod.group) pod.group.visible = false;
      yield 0.4;
    },
  };

  P.gone = {
    id: 'gone',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      S.goku.controller = scripted();
      yield* SL.Cinema.play(m, 'namek_gone');
    },
  };

  /**
   * The epilogue is told the way the characters experienced it: Earth is given
   * the wrong answer, and the player is given the right one without a line of
   * dialogue explaining it.
   */
  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      g.setHidden(true);
      g.untargetable = true;
      m.fade('black', 0.8);
      yield 1;
      m.title('EARTH · AGE 762', 'THEY WAITED', 'The wish that would have brought him home was refused: he was not dead', 4.2);
      yield* m.cine(4.4);
      m.say('krillin', 'They said he could not be wished back. That means he is out there.', 3.6, { style: 'quiet' });
      yield* m.cine(3.8);
      m.say('kid_gohan', 'Then we wait for him. However long it takes.', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      // and the answer, shown rather than said: a pod, still flying, with nobody
      // left to see it. He stays inside it — the player is told by the picture.
      const sky = FIELD.clone().add(new V3(0, 0, 40));
      const pod = beacon(b, 'escapePod', sky, 0xff6a5a, 2.4);
      pod.pos.y = b.stage.heightAt(sky.x, sky.z) + 118;
      if (pod.group) pod.group.position.copy(pod.pos);
      m.onDispose(() => {
        pod.alive = false;
        if (pod.group) pod.group.visible = false;
      });
      b.stage.setMood(0.5, 0x203050, 1.2);
      m.music('dawn', 4);
      m.fade('clear', 1.2);
      // the shot never looks down: only the pod, climbing, and empty sky behind it
      m.shot((t, out) => {
        const at = pod.pos.clone().add(new V3(0, t * 26, -t * 34));
        if (pod.group) pod.group.position.copy(at);
        pod.pos.copy(at);
        camAt(out, at.clone().add(new V3(U.lerp(7, 12, t), U.lerp(-1.5, 1, t), U.lerp(13, 30, t))), at.clone().add(new V3(0, U.lerp(3, 7, t), 0)), U.lerp(40, 50, t));
      }, 5, { cut: true, blendIn: 0 });
      for (let i = 0; i < 5; i++) {
        b.vfx.trail(pod.pos.clone().add(new V3(0, -i * 1.4, i * 2.4)), 0xffb070, 1.4 - i * 0.18, 0.7);
      }
      yield* m.cine(5.2);
      m.fade('black', 1.4);
      yield 1.6;
      m.endShot();
      m.flags.epilogue = true;
      m.title('CHAPTER 4 · NAMEK SAGA', 'WHAT HE LEFT BEHIND', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'namek_aftermath',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'What He Left Behind',
    subtitle: 'Namek · everyone who can leave has left',
    character: 'goku',
    stage: 'namek',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The wishes are granted, the planet keeps coming apart, and the last thing he does here is look for a way off it.',
    rewards: ['Chapter 4 complete'],
    setup,
    phases: [P.wishes, P.search, P.ship, P.pods, P.gone, P.after],
  };

  SL.data.missions[def.id] = def;
})();
