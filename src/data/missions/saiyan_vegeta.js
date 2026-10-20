/*
 * CHAPTER 3 — SAIYAN SAGA: THE SAIYANS ARRIVE
 * Mission "The Saiyan Prince" (canon). Vegeta, the multi-phase finale.
 *
 * Canon beats: Goku and Vegeta fight one on one. Vegeta fires the Galick Gun
 * and Goku answers with a Kaioken times three Kamehameha. Beaten back, Vegeta
 * makes an artificial moon and becomes a Great Ape. Krillin and Gohan arrive
 * and the tail is cut. A battered Vegeta keeps fighting Gohan and Krillin in
 * desperation — until Gohan, whose tail has not been cut, looks up at the
 * Power Ball still hanging in the sky and becomes a Great Ape himself. Vegeta
 * cuts that tail too, and the falling giant crushes him. He crawls back to his
 * pod, and Goku asks them to let him go.
 *
 * Phases the player fights: BASE DUEL (Goku, Kaioken capped at x2) → GALICK GUN
 * BEAM STRUGGLE (Kaioken x3 unlocked in the story) → GREAT APE giant boss (cut
 * the tail: get behind him) → DESPERATE VEGETA (Gohan and Krillin) → GREAT APE
 * GOHAN, played by the player (crush Vegeta, keep him off the tail).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const ARENA = new V3(0, 0, 0);
  const PURPLE = 0x7a3cff; // the Galick Gun's light
  // the Kaioken times three Kamehameha carrying Vegeta into the sky (skyward): blue in a red shell, no damage of its own
  const SKY_KAME = {
    id: 'skyKame', name: 'Kamehameha', type: 'beam', damage: [0, 0], radius: [1.3, 1.3], speed: 120, range: 120, sustain: 80,
    color: 0x8ad4ff, core: 0xffffff, style: { rings: 2, ringColor: 0xff5a4a, ringSpeed: 2 },
  };

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
    f.yaw = yaw;
    f.prevYaw = yaw;
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
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  function cpu(b) {
    return new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  }
  function bench(f) {
    f.untargetable = true;
    f.controller = scripted();
    if (f.alive) f.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
  }
  function unbench(f) {
    f.untargetable = false;
    f.setHidden(false);
    f.benched = false;
  }

  /**
   * Yajirobe as a CPU ally in the giant fight: he circles wide until he is at
   * the Great Ape's back, climbs to the tail and hacks at it (sneak attacks
   * cut deeper, and the tail is a weak point). Input-only, like any controller.
   */
  function sneakTailController(b, y, ape) {
    let side = 1;
    return {
      update: () => {
        const it = SL.emptyIntent();
        if (b.inputLocked || b.aiLocked || !ape.alive || !['free', 'attack', 'dash'].includes(y.state)) return it;
        y.target = ape;
        const tail = ape._zoneCenters().find((z) => z.zone.id === 'tail' && !(ape.brokenZones && ape.brokenZones.tail));
        if (!tail) return it;
        const toMe = y.pos.clone().sub(ape.pos).setY(0);
        const flat = toMe.length();
        toMe.normalize();
        const behind = ape.forward.dot(toMe) < -0.45;
        const d = y.chest().distanceTo(tail.c);
        if (!behind) {
          it.mx = side;
          it.boost = true;
          it.my = flat < 14 ? -0.4 : flat > 24 ? 0.4 : 0;
          if (y.frame % 240 === 0) side = -side;
        } else if (d > 2.2) {
          it.my = 1;
          it.boost = d > 7;
        }
        const dy = tail.c.y - y.chest().y;
        if (dy > 0.5) it.up = true;
        else if (dy < -0.5) it.down = true;
        if (behind && d < 2.6) {
          if (y.frame % 11 === 0) it.light = true;
          if (y.frame % 53 === 0) it.heavy = true;
        }
        return it;
      },
    };
  }

  /** The Power Ball: a small white sphere thrown up that swells into an artificial moon. */
  function powerBall(b, from) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xf4f4ff }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xdde6ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.setScalar(4);
    g.add(core, glow);
    g.position.copy(from);
    g.scale.setScalar(0.3);
    b.scene.add(g);
    return {
      group: g,
      dispose() {
        b.scene.remove(g);
        core.geometry.dispose();
        core.material.dispose();
        glow.material.dispose();
      },
    };
  }

  /** The artificial moon, already swollen and hanging high over the battlefield. */
  function skyBall(b) {
    const ball = powerBall(b, ARENA.clone());
    ball.group.position.set(0, 110, -70);
    ball.group.scale.setScalar(14);
    return ball;
  }

  /** Is Vegeta at the played Great Ape's back, close to its tail? */
  function atTail(ape, v) {
    const to = v.pos.clone().sub(ape.pos).setY(0);
    const d = to.length();
    return d < 14 && ape.forward.dot(to.normalize()) < -0.3;
  }

  /**
   * Desperate Vegeta against the played Great Ape Gohan. He knows where a Great
   * Ape's power comes from. Input-only, like any controller: he circles in the
   * air at a distance peppering the giant with blasts, flies up and out of
   * anything drawn on the ground (the giant's stomps, sweeps and grabs are
   * telegraphed for him too), and dives for the tail whenever the giant is busy
   * or turned away. A solid hit from the giant sends him back to circling.
   */
  function tailHunter(b, v, ape) {
    const st = { mode: 'circle', until: 0, side: 1, marks: [] };
    const diff = SL.Settings.data.gameplay.difficulty;
    const nerve = { easy: 0.5, normal: 1, hard: 1.4, veryhard: 1.8 }[diff] || 1;
    // he is not a machine: he notices a telegraph a moment late, and not every time
    const notice = { easy: { delay: 20, chance: 0.5 }, normal: { delay: 12, chance: 0.7 }, hard: { delay: 8, chance: 0.85 }, veryhard: { delay: 5, chance: 0.95 } }[diff] || { delay: 12, chance: 0.7 };
    b.on('telegraph', (e) => {
      if (Math.random() < notice.chance) st.marks.push({ pos: e.pos, radius: e.radius, from: b.frame + notice.delay, until: b.frame + e.frames + 6 });
    });
    b.on('damage', (e) => {
      if (e.target === v && e.attacker === ape && !e.blocked) {
        st.mode = 'circle';
        st.until = b.frame + Math.round(200 / nerve);
      }
    });
    return {
      st,
      update: () => {
        const it = SL.emptyIntent();
        if (b.inputLocked || b.aiLocked || !ape.alive) return it;
        v.target = ape;
        if (v.state === 'held') {
          if (b.frame % 4 === 0) it.light = true;
          return it;
        }
        if (!['free', 'attack', 'dash'].includes(v.state)) return it;
        st.marks = st.marks.filter((mk) => mk.until > b.frame);
        const height = v.pos.y - b.stage.heightAt(v.pos.x, v.pos.z);
        for (const mk of st.marks) {
          if (b.frame < mk.from) continue;
          const dx = v.pos.x - mk.pos.x, dz = v.pos.z - mk.pos.z;
          if (Math.hypot(dx, dz) < mk.radius + 2.5 && height < 9) {
            // with a target, "forward" means toward it: drop the target while flying to a spot
            v.target = null;
            it.camYaw = Math.atan2(dx, dz);
            it.my = 1;
            it.up = true;
            it.boost = true;
            return it;
          }
        }
        const tail = ape._zoneCenters().find((z) => z.zone.id === 'tail' && !(ape.brokenZones && ape.brokenZones.tail));
        if (!tail) return it;
        const toV = v.pos.clone().sub(ape.pos).setY(0);
        const flat = toV.length();
        const facing = ape.forward.dot(toV.clone().normalize());
        const busy = !['free', 'attack'].includes(ape.state) || (ape.state === 'attack' && ape.stateFrame > 20);
        // he goes for it much sooner while the giant is busy or turned away
        if (st.mode === 'circle' && b.frame > st.until && Math.random() < (busy || facing < -0.2 ? 0.02 : 0.006) * nerve) {
          st.mode = 'dive';
          st.until = b.frame + 420;
        }
        if (st.mode === 'dive' && b.frame > st.until) {
          st.mode = 'circle';
          st.until = b.frame + Math.round(150 / nerve);
        }
        // once he is at the tail he keeps hacking until the giant has turned most of the way round
        const atIt = tail.c.distanceTo(v.chest()) < 3.2;
        if (st.mode === 'dive' && (atIt ? facing > -0.3 : facing > -0.8)) {
          // not behind it yet: orbit round the giant at arm's length toward its back
          // (angles measured round the giant, 0 = straight behind it)
          const back = ape.forward.clone().negate();
          const outDir = flat > 0.5 ? toV.clone().normalize() : new V3(back.z, 0, -back.x);
          let goal;
          if (flat < 7) goal = ape.pos.clone().addScaledVector(outDir, 11);
          else {
            const cur = Math.atan2(back.x * outDir.z - back.z * outDir.x, outDir.x * back.x + outDir.z * back.z);
            const next = cur - Math.sign(cur || st.side) * Math.min(Math.abs(cur), 0.45);
            const c = Math.cos(next), s = Math.sin(next);
            goal = ape.pos.clone().add(new V3(back.x * c - back.z * s, 0, back.x * s + back.z * c).multiplyScalar(10));
          }
          const to = goal.sub(v.pos);
          v.target = null;
          it.camYaw = Math.atan2(to.x, to.z);
          it.my = 1;
          it.boost = true;
          it.up = v.pos.y < tail.c.y;
          it.down = v.pos.y > tail.c.y + 2;
          return it;
        }
        if (st.mode === 'dive') {
          // attacks go to the body part nearest to him: at the giant's back that is the tail
          const goal = tail.c.clone().addScaledVector(ape.forward, -1.8);
          const to = goal.sub(v.chest());
          const d = to.length();
          if (d > 2.2) {
            v.target = null;
            it.camYaw = Math.atan2(to.x, to.z);
            it.my = 1;
            it.boost = d > 6;
            it.up = to.y > 0.5;
            it.down = to.y < -0.5;
            return it;
          }
          if (b.frame % 10 === 0) it.light = true;
          if (b.frame % 47 === 23) it.heavy = true;
          return it;
        }
        // circling low, just outside the reach of the sweep and the grab: the giant has to come to him or punish a dive
        it.camYaw = Math.atan2(-toV.x, -toV.z);
        it.my = flat < 19 ? -1 : flat > 24 ? 1 : 0;
        it.mx = st.side;
        if (b.frame % 300 === 0) st.side = -st.side;
        it.up = height < 3;
        it.down = height > 5.5;
        if (b.frame % Math.round(40 / nerve) === 0) it.blast = true;
        return it;
      },
    };
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, ARENA, 45);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, 10))), startKi: 60 });
    goku.lockedSlots = { special2: true };
    goku.lockedForms = { ssj: true };
    goku.formCaps = { kaioken: 0 };
    const vegeta = b.spawn({ charId: 'vegeta', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -10))), startKi: 60, tags: { boss: true, priority: true } });
    vegeta.controller = scripted();
    vegeta.lockedForms = { ssj: true };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, ARENA.clone().add(new V3(-40, 0, 40))), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, ARENA.clone().add(new V3(-44, 0, 42))), startKi: 60 });
    const yajirobe = b.spawn({ charId: 'yajirobe', team: 0, pos: ground(b, ARENA.clone().add(new V3(40, 0, -40))), startKi: 40 });
    for (const h of [krillin, gohan, yajirobe]) {
      h.controller = scripted();
      h.untargetable = true;
      h.setHidden(true);
    }
    faceTo(goku, vegeta.pos);
    faceTo(vegeta, goku.pos);
    b.story = { goku, vegeta, krillin, gohan, yajirobe, ape: null, ball: null };
  }

  const P = {};

  P.standoff = {
    id: 'standoff',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.music('orbit', 1);
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      g.setState('scripted', { pose: 'g_resolve', expression: 'angry' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      m.shot((t, out) => {
        const mid = g.chest().lerp(v.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(U.lerp(16, 11, t), U.lerp(2, 3.2, t), 0)), mid, 44);
      }, 3.8, { cut: true, blendIn: 0 });
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(1.8, 0.4, 2.8)), c.clone().add(new V3(0, 0.25, 0)), 38);
      }, 2.8, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Kakarot. Show me what a low-class warrior has been hiding.', 2.8);
      yield* m.cine(2.8);
      m.shot((t, out) => {
        const c = g.chest();
        camAt(out, c.clone().add(new V3(-1.6, 0.3, -2.6)), c.clone().add(new V3(0, 0.25, 0)), 38);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('goku', "You're going to pay for what you did here.", 2.4);
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 8))), Math.PI);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -8))), 0);
      g.formCaps = { kaioken: 0 };
      v.cannotDie = true;
      v.target = g;
      g.target = v;
      v.controller = scripted();
      yield* firstExchange(m);
      yield* airExchange(m);
      v.controller = cpu(b);
      g.setState('free');
      v.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      // B03 (research draft): the first Kaioken the player lights in the duel is staged (kaiokenIgnite, below the phase)
      let active = true, sawKaioken = false, ignite = false;
      b.on('transformBurst', (e) => {
        if (!active || sawKaioken || e.fighter !== g || !e.form || e.form.id !== 'kaioken') return;
        sawKaioken = ignite = true;
      });
      m.objective('push', 'Beat Vegeta back', { icon: 'fist' });
      const pg = m.objective('perfect', 'Perfect Guard Vegeta 3 times', { icon: 'guard', optional: true, target: 3 });
      const clean = m.objective('counter', "Never get caught by the Prince's Counter", { icon: 'guard', optional: true });
      let guards = 0;
      b.on('perfectGuard', (e) => {
        if (e.fighter === g && pg && !pg.done) m.progress('perfect', ++guards);
      });
      b.on('counterStrike', (e) => {
        if (e.fighter === v) S.counterAt = b.frame;
      });
      b.on('damage', (e) => {
        if (e.attacker === v && e.target === g && S.counterAt && b.frame - S.counterAt < 30 && !clean.failed) m.failObjective('counter');
      });
      m.prompt('vegetaCounter', 'guard', 'He is reading you — guard!', { always: true, when: () => v.counterFrames > 0 && g.distTo(v) < 5, until: () => v.counterFrames <= 0 });
      m.prompt('kaioken2', 'transform', 'Kaioken', { when: () => m.time > 15 && g.form.id === 'base' && g.strain < 40, until: () => g.form.id === 'kaioken' });
      for (;;) {
        yield () => v.hpFrac <= 0.55 || !g.alive || ignite;
        if (!ignite || !g.alive || v.hpFrac <= 0.55) break;
        ignite = false;
        yield* kaiokenIgnite(m);
      }
      active = false;
      if (!g.alive) return;
      m.complete('push');
      if (!clean.failed) m.complete('counter');
      yield 0.6;
      yield* kaiokenAssault(m);
    },
  };

  /*
   * THE FIRST EXCHANGE (Roadmap Three, the owner's Gemini fight research, beat B01 — staged; a research draft, not
   * checked against the footage): Goku closes the distance in a straight line (raw speed, no teleport) with a right
   * straight at the face; the prince leans out of it at the last instant and answers with a right hook to the ribs; Goku
   * takes it, turns it into a spin and a low sweep, and Vegeta hops back off it — from there the fight is played (B02).
   * Shots: S01 low at ground level looking up the line Goku flies along; S02 side-on at head height, pushing in on the
   * slip and the hook. Skip-safe: P.duel hands both fighters to the fight wherever this leaves them.
   */
  function* firstExchange(m) {
    const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
    const toV = v.pos.clone().sub(g.pos).setY(0).normalize();
    const side = new V3(toV.z, 0, -toV.x);
    const from = g.pos.clone(), meet = v.pos.clone().addScaledVector(toV, -1.15);
    g.setState('scripted', { pose: 'dash', expression: 'angry', aura: 1 });
    v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
    m.shot((t, out) => camAt(out, from.clone().addScaledVector(side, 3.2).addScaledVector(toV, -2).add(new V3(0, 0.3, 0)), g.chest().lerp(v.chest(), 0.35).add(new V3(0, 0.7, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    b.sfx('dash', g);
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 16));
      g.setPosition(ground(b, from.clone().lerp(meet, k)));
      g.vel.set(0, 0, 0);
      if (!b.skipRequested && n % 3 === 0) b.vfx.trail(g.chest(), 0xffffff, 0.4, 0.2);
      return k >= 1;
    };
    g.grounded = true;
    faceTo(g, v.pos);
    faceTo(v, g.pos);
    // the straight, and the slip
    const mid = () => g.headPos().lerp(v.headPos(), 0.5);
    m.shot((t, out, el) => {
      const k = Math.min(1, el * 1.5);
      camAt(out, mid().addScaledVector(side, U.lerp(3.6, 2.7, k)), mid(), U.lerp(42, 34, k));
    }, 999, { cut: true, blendIn: 0, hold: true });
    g.setState('scripted', { pose: 'g_cross', expression: 'angry' });
    v.setState('scripted', { pose: 'v_leanBack', expression: 'smirk' });
    b.sfx('swing', g);
    yield* m.cine(0.4);
    // the hook to the ribs
    v.setState('scripted', { pose: 'v_hook', expression: 'angry' });
    g.setState('scripted', { pose: 'hitBody', expression: 'hurt' });
    b.vfx.flash(g.chest(), 1.1, 0xffd0b0, 0.12, SL.Toon.tex.glow);
    b.sfx('punchHeavy', g, { vol: 0.9 });
    b.cameraTraumaAt(g.chest(), 0.3);
    yield* m.cine(0.45);
    // the spin and the low sweep; he hops back off it
    g.setState('scripted', { pose: 'g_sweep', expression: 'angry' });
    v.setState('scripted', { pose: 'jump', expression: 'smirk' });
    b.sfx('swing', g, { pitch: 0.8 });
    b.vfx.dust(g.pos.clone(), 1.6, 8);
    const v0 = v.pos.clone(), v1 = ground(b, v.pos.clone().addScaledVector(toV, 2.4));
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : Math.min(1, n / 14);
      const p = v0.clone().lerp(v1, k);
      p.y += Math.sin(k * Math.PI) * 1.1;
      v.setPosition(p);
      v.vel.set(0, 0, 0);
      return k >= 1;
    };
    v.grounded = true;
    m.flags.firstExchange = true;
    yield* m.cine(0.3);
    m.endShot();
    b.skipRequested = false;
  }

  /*
   * THE AIR EXCHANGE (Roadmap Three, the owner's Gemini fight research, beat B02 with shot S03 — staged; a research draft,
   * not checked against the footage): off the sweep they go up and meet ~7 m over the rock in close quarters — a blur of
   * blows, every one blocked on the frame with a ring of light, the two of them circling each other in a tight column
   * (S03: wide, from overhead at a Dutch angle, the lens orbiting fast round the clash); then Goku's left jab, the
   * prince's right forearm across it and his palm straight into Goku's chest; both flip backward off it to medium range
   * in the air, where the duel is played. The research's mapping table proposes B01–B02 as played combat: B02 is staged
   * only as this ~3.5 s opening, so S03 never takes the camera from the player mid-duel. Skip-safe: every step lands on
   * the same end state.
   */
  function* airExchange(m) {
    const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
    const WHITE = 0xfff4d8;
    const axis0 = v.pos.clone().sub(g.pos).setY(0).normalize();
    const M = g.pos.clone().lerp(v.pos, 0.5);
    const H = ground(b, M).y + 7;
    const gFrom = g.pos.clone(), vFrom = v.pos.clone();
    const at = (ang, rise, r) => {
      const d = new V3(Math.cos(ang), 0, Math.sin(ang));
      return [M.clone().addScaledVector(d, -r).setY(H + rise), M.clone().addScaledVector(d, r).setY(H + rise)];
    };
    const ang0 = Math.atan2(axis0.z, axis0.x);
    const pin = (gp, vp) => {
      g.setPosition(gp);
      v.setPosition(vp);
      g.vel.set(0, 0, 0);
      v.vel.set(0, 0, 0);
      faceTo(g, v.pos);
      faceTo(v, g.pos);
    };
    g.grounded = v.grounded = false;
    g.setState('scripted', { pose: 'flyUp', expression: 'angry', aura: 1 });
    v.setState('scripted', { pose: 'flyUp', expression: 'angry', aura: 1 });
    // S03: wide, from overhead, tilted, the lens circling fast round the clash
    const c0 = () => g.chest().lerp(v.chest(), 0.5);
    m.shot((t, out, el) => {
      const c = c0(), a = ang0 + 1.9 + el * 1.5;
      camAt(out, c.clone().add(new V3(Math.cos(a) * 5.2, 5.6, Math.sin(a) * 5.2)), c, 50);
      out.roll = 0.2;
    }, 999, { cut: true, blendIn: 0, hold: true });
    b.sfx('dash', v, { pitch: 0.9 });
    b.vfx.dust(M.clone(), 2.4, 10);
    // up: the prince first, Goku after him, into close quarters
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 26));
      const kg = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, Math.max(0, n - 3) / 23));
      const [gp, vp] = at(ang0, 0, 0.62);
      pin(gFrom.clone().lerp(gp, kg), vFrom.clone().lerp(vp, k));
      return k >= 1 && kg >= 1;
    };
    // the blur: six blows, every one taken on a guard, circling as they trade
    const BLOWS = [
      [g, 'g_jab', v, 'guard'], [v, 'v_jab', g, 'guard'], [g, 'g_kick', v, 'guard'],
      [v, 'v_hook', g, 'guard'], [g, 'g_cross', v, 'v_forearmBlock'], [v, 'v_knee', g, 'guard'],
    ];
    const EVERY = 13, END = BLOWS.length * EVERY + 6;
    let ang = ang0;
    n = 0;
    b.skipRequested = false;
    yield () => {
      n++;
      if (b.skipRequested) n = END;
      ang = ang0 + (n / END) * Math.PI * 1.6;
      const [gp, vp] = at(ang, (n / END) * 1.2, 0.6);
      pin(gp, vp);
      const i = Math.floor((n - 1) / EVERY);
      if ((n - 1) % EVERY === 0 && i < BLOWS.length && !b.skipRequested) {
        const [a, pa, d, pd] = BLOWS[i];
        a.setState('scripted', { pose: pa, expression: 'angry', speed: 30 });
        d.setState('scripted', { pose: pd, expression: 'angry', speed: 30 });
      }
      if ((n - 1) % EVERY === 4 && i < BLOWS.length && !b.skipRequested) {
        const hit = c0();
        b.vfx.ring(hit, 0.9, WHITE, 0.18, axis0);
        b.vfx.sparks(hit, WHITE, 8, 9, 0.12);
        b.sfx(i % 2 ? 'block' : 'perfectGuard', BLOWS[i][2], { vol: 0.7 });
        b.camera.addTrauma(0.12);
      }
      return n >= END;
    };
    // Goku's left jab; the right forearm across it, and the palm straight into his chest
    const ax = v.pos.clone().sub(g.pos).setY(0).normalize(), sd = new V3(ax.z, 0, -ax.x);
    const mid = () => g.headPos().lerp(v.headPos(), 0.5);
    m.shot((t, out, el) => {
      const k = Math.min(1, el * 1.6);
      camAt(out, mid().addScaledVector(sd, U.lerp(3.4, 2.8, k)).add(new V3(0, -0.15, 0)), mid(), U.lerp(40, 34, k));
    }, 999, { cut: true, blendIn: 0, hold: true });
    g.setState('scripted', { pose: 'g_jab', expression: 'angry', speed: 30 });
    v.setState('scripted', { pose: 'v_forearmBlock', expression: 'smirk', speed: 30 });
    b.sfx('swing', g);
    yield* m.cine(0.22);
    b.vfx.ring(c0(), 0.8, WHITE, 0.16, ax);
    b.sfx('block', v, { vol: 0.8 });
    yield* m.cine(0.2);
    v.setState('scripted', { pose: 'v_palmL', expression: 'angry', speed: 30 });
    g.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 30 });
    b.vfx.flash(g.chest(), 1.2, 0xffd0b0, 0.12, SL.Toon.tex.glow);
    b.vfx.ring(g.chest(), 1.4, WHITE, 0.22, ax);
    b.sfx('punchHeavy', g, { vol: 0.9 });
    b.cameraTraumaAt(g.chest(), 0.35);
    yield* m.cine(0.35);
    // both flip back off it, to medium range in the air
    const gA = g.pos.clone(), vA = v.pos.clone();
    const gB = gA.clone().addScaledVector(ax, -3.8).setY(H + 0.6), vB = vA.clone().addScaledVector(ax, 3.8).setY(H + 0.6);
    // side-on, standing back as they part
    m.shot((t, out) => {
      const c = g.chest().lerp(v.chest(), 0.5);
      camAt(out, c.clone().addScaledVector(sd, Math.max(4.5, g.distTo(v) * 0.95 + 2.2)).add(new V3(0, 0.6, 0)), c, 46);
    }, 999, { cut: true, blendIn: 0, hold: true });
    g.setState('scripted', { pose: 'backflip', expression: 'angry', speed: 40 });
    v.setState('scripted', { pose: 'backflip', expression: 'angry', speed: 40 });
    b.sfx('dodge', g);
    n = 0;
    b.skipRequested = false;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 34));
      const up = Math.sin(k * Math.PI) * 1.2;
      g.setPosition(gA.clone().lerp(gB, k).add(new V3(0, up, 0)));
      v.setPosition(vA.clone().lerp(vB, k).add(new V3(0, up, 0)));
      g.vel.set(0, 0, 0);
      v.vel.set(0, 0, 0);
      return k >= 1 && (b.skipRequested || n >= 40);
    };
    // the flip's full turn is wrapped back so the next pose does not unwind it
    for (const f of [g, v]) if (f.anim.root.rx < -Math.PI) f.anim.root.rx += Math.PI * 2;
    pin(gB, vB);
    g.setState('scripted', { pose: 'flyIdle', expression: 'angry' });
    v.setState('scripted', { pose: 'flyIdle', expression: 'smirk' });
    m.flags.airExchange = true;
    yield* m.cine(0.3);
    m.endShot();
    b.skipRequested = false;
  }

  /*
   * THE KAIOKEN IGNITES (Roadmap Three, the owner's Gemini fight research, beat B03 with shot S04 — a research draft, not
   * checked against the footage): staged around the player's own first Kaioken in the duel (the PDF maps B03 as a
   * player-triggered cinematic action). Close and square on Goku's face as the red aura catches, the frame shaking (S04);
   * wide and side-on as it swells to its full size; the arrogance goes out of the prince's face; then Goku is simply not
   * there — he is at Vegeta's back shoulder, and the prince turns into it. The duel goes on from there (B04 comes at the
   * HP threshold). Skip-safe: every step lands on the same end state.
   */
  function* kaiokenIgnite(m) {
    const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
    const RED = 0xff4a3a;
    m.lock(true);
    clearCombat(b);
    v.controller = scripted();
    // the burst blows the prince back to medium range (the research's B03 starts them apart; up close the lens would
    // stand inside him)
    const away = v.pos.clone().sub(g.pos).setY(0);
    if (away.lengthSq() < 0.01) away.set(Math.sin(g.yaw), 0, Math.cos(g.yaw));
    away.normalize();
    const apart = g.pos.clone().addScaledVector(away, Math.max(7, g.distTo(v)));
    if (v.grounded) place(v, ground(b, apart), v.yaw);
    else v.setPosition(apart.setY(v.pos.y));
    v.vel.set(0, 0, 0);
    faceTo(g, v.pos);
    faceTo(v, g.pos);
    // S04: the face, square on, shaking with the aura (the burst's own frames still playing)
    m.shot((t, out) => {
      const h = g.headPos(), fw = new V3(Math.sin(g.yaw), 0, Math.cos(g.yaw));
      camAt(out, h.clone().addScaledVector(fw, 1.25).add(new V3(0, -0.06, 0)), h.clone().add(new V3(0, -0.04, 0)), 38);
    }, 999, { cut: true, blendIn: 0, hold: true, subject: g, face: true });
    b.camera.addTrauma(0.35);
    yield* m.cine(0.25);
    yield () => g.state !== 'transform';
    g.vel.set(0, 0, 0);
    faceTo(g, v.pos);
    faceTo(v, g.pos);
    g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'shout', aura: 1 });
    v.setState('scripted', { pose: 'idle', expression: 'smirk' });
    b.camera.addTrauma(0.3);
    yield* m.cine(0.35);
    // wide and side-on: the aura swells out to its full size
    const toV = v.pos.clone().sub(g.pos).setY(0).normalize();
    const side = new V3(toV.z, 0, -toV.x);
    m.shot((t, out, el) => {
      const c = g.chest(), k = Math.min(1, el / 0.8);
      camAt(out, c.clone().addScaledVector(side, U.lerp(5.4, 6.4, k)).add(new V3(0, 0.4, 0)), c.clone().add(new V3(0, 0.2, 0)), 46);
    }, 999, { cut: true, blendIn: 0, hold: true });
    for (let i = 0; i < 3; i++) b.vfx.ring(g.pos.clone().add(new V3(0, 0.2 + i * 0.7, 0)), 1.6 + i * 0.9, RED, 0.45, new V3(0, 1, 0));
    b.vfx.dust(g.pos.clone(), 3, 10);
    b.sfx('kaiokenBoom', g, { vol: 0.9 });
    yield* m.cine(0.8);
    // the prince's face: the arrogance gone, the pupils shrunk to points; his scouter reads the jump
    v.setState('scripted', { pose: 'idle', expression: 'shock' });
    if (v.model.setPupilScale) v.model.setPupilScale(0.35);
    m.shot((t, out, el) => {
      const h = v.headPos(), fw = new V3(Math.sin(v.yaw), 0, Math.cos(v.yaw)), sd = new V3(fw.z, 0, -fw.x);
      camAt(out, h.clone().addScaledVector(fw, U.lerp(1.15, 0.95, Math.min(1, el / 1.4))).addScaledVector(sd, 0.35).add(new V3(0, -0.04, 0)), h, 34);
    }, 999, { cut: true, blendIn: 0, hold: true, subject: v, face: true });
    if (v.model.wears && v.model.wears('scouter')) b.sfx('scouter', v, { pitch: 1.3 });
    m.say('vegeta', 'What?! His power just... doubled?!', 1.8, { style: 'shout' });
    m.flags.vegetaSawKaioken = true;
    yield* m.cine(1.6);
    // gone — at his back shoulder; the prince turns into it
    const vf = new V3(Math.sin(v.yaw), 0, Math.cos(v.yaw)), vs = new V3(vf.z, 0, -vf.x);
    b.vfx.afterimage(g.pos, g.height, RED);
    b.sfx('vanish', g, { pitch: 0.9 });
    const behind = v.pos.clone().addScaledVector(vf, -1.3).addScaledVector(vs, 0.45);
    if (v.grounded) place(g, ground(b, behind), 0);
    else {
      g.setPosition(behind);
      g.grounded = false;
      g.vel.set(0, 0, 0);
    }
    faceTo(g, v.pos);
    g.setState('scripted', { pose: 'idle', expression: 'angry', aura: 1 });
    v.setState('scripted', { pose: 'v_turnAway', expression: 'shock' });
    m.shot((t, out) => {
      const c = g.chest().lerp(v.chest(), 0.5), back = v.pos.clone().sub(g.pos).setY(0).normalize();
      camAt(out, g.chest().addScaledVector(back, -1.9).addScaledVector(new V3(back.z, 0, -back.x), 1.5).add(new V3(0, 0.35, 0)), c, 44);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.flags.kaiokenIgnite = true;
    yield* m.cine(0.7);
    if (v.model.setPupilScale) v.model.setPupilScale(1);
    m.endShot();
    b.skipRequested = false;
    // caught off guard: half a second before he answers — the player's opening
    const ai = cpu(b), wakeAt = b.frame + 30;
    v.controller = {
      update: (f) => {
        if (b.frame < wakeAt) return SL.emptyIntent();
        v.controller = ai;
        return ai.update(f);
      },
    };
    g.setState('free');
    v.setState('free');
    m.lock(false);
  }

  /*
   * THE KAIOKEN ASSAULT (Roadmap Three, the owner's Gemini fight research, beat B04 — staged): in a red flash Goku is
   * behind him, a double axe-handle into the upper back, a spinning heel kick, and the prince goes down through the rock
   * spires into the ground; he comes up out of the rubble in a rage and takes to the sky (where the Galick Gun begins).
   * Skip-safe: a skip lands on the same end state.
   */
  function* kaiokenAssault(m) {
    const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
    m.lock(true);
    m.clearObjectives();
    clearCombat(b);
    v.controller = scripted();
    if (g.form.id !== 'kaioken') g.applyForm(1);
    // the prince a few metres up; Goku there in a red blur, at his back
    const fwd = new V3(Math.sin(v.yaw), 0, Math.cos(v.yaw));
    const air = ground(b, v.pos.clone(), 5);
    v.setPosition(air);
    v.grounded = false;
    v.vel.set(0, 0, 0);
    b.vfx.afterimage(g.pos, g.height, 0xff4a3a);
    b.sfx('vanish', g, { pitch: 0.9 });
    g.setPosition(air.clone().addScaledVector(fwd, -1.2).add(new V3(0, 0.9, 0)));
    g.grounded = false;
    g.vel.set(0, 0, 0);
    faceTo(g, v.pos);
    v.setState('scripted', { pose: 'v_turnAway', expression: 'shock' });
    g.setState('scripted', { pose: 'hammerWind', expression: 'shout', aura: 1 });
    const side = new V3(fwd.z, 0, -fwd.x);
    m.shot((t, out) => {
      const c = v.chest().lerp(g.chest(), 0.5);
      camAt(out, c.clone().addScaledVector(side, 5.2).add(new V3(0, 0.6, 0)), c, 42);
    }, 999, { cut: true, blendIn: 0, hold: true });
    yield* m.cine(0.5);
    // the double axe-handle into his upper back
    g.setState('scripted', { pose: 'hammer', expression: 'shout', aura: 1 });
    v.setState('scripted', { pose: 'hitBack', expression: 'hurt' });
    b.vfx.flash(v.chest(), 1.4, 0xffd0b0, 0.14, SL.Toon.tex.glow);
    b.sfx('punchHeavy', v, { vol: 1.1 });
    b.cameraTraumaAt(v.chest(), 0.4);
    yield* m.cine(0.45);
    // the spinning heel kick: and down he goes, through the spires
    g.setState('scripted', { pose: 'g_spinKick', expression: 'shout', aura: 1 });
    v.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
    b.vfx.flash(v.headPos(), 1.6, 0xffd0b0, 0.14, SL.Toon.tex.glow);
    b.sfx('punchHeavy', v, { vol: 1.2, pitch: 0.8 });
    // the nearest standing spire ahead of him, if there is one, is what he breaks on the way down
    const ahead = v.pos.clone().addScaledVector(fwd, 9);
    let spire = null, best = 1e9;
    for (const o of b.stage.obstacles) {
      if (!o.alive || o.fixture || o.hp > 1e8) continue;
      const d = Math.hypot(o.x - ahead.x, o.z - ahead.z);
      if (d < 16 && d < best) {
        best = d;
        spire = o;
      }
    }
    const land = ground(b, spire ? new V3(spire.x, 0, spire.z).addScaledVector(fwd, 2) : ahead);
    const from = v.pos.clone();
    // high and to the side of the fall path, pulling back as he goes down through the spire (the research's S05 is a
    // straight-down extreme wide; from that height he was a speck and the spire out of frame. Tried again 2026-10-18
    // starting 14 m up and climbing to 30 m with the lens widening: the fall runs across open sand there, and at the
    // crash he is lost under the dust — the side view reads, so it stays)
    m.shot((t, out, el) => {
      const c = from.clone().lerp(land, 0.5), k = Math.min(1, el * 2.5);
      camAt(out, c.clone().addScaledVector(side, U.lerp(8, 13, k)).add(new V3(0, U.lerp(6, 9, k), 0)), c.clone().add(new V3(0, -1, 0)), 54);
    }, 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 22));
      v.setPosition(from.clone().lerp(land, k));
      v.vel.set(0, 0, 0);
      if (spire && spire.alive && k > 0.5) b.stage.destroyPillar(spire);
      if (!b.skipRequested && n % 3 === 0) b.vfx.trail(v.chest(), 0xffffff, 0.5, 0.25);
      return k >= 1;
    };
    if (spire && spire.alive) b.stage.destroyPillar(spire);
    place(v, land, v.yaw);
    v.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
    b.stage.crater(land, 3.4, 0.6, v);
    b.vfx.dust(land, 5, 14);
    b.sfx('groundImpact', v, { vol: 1.3, pitch: 0.7 });
    b.cameraTraumaAt(land, 0.7);
    m.flags.kaiokenAssault = true;
    yield* m.cine(1.2);
    // out of the rubble, furious, and up into the sky
    faceTo(v, g.pos);
    v.setState('scripted', { pose: 'v_tfRoar', expression: 'shout', aura: 1 });
    b.vfx.ring(v.pos.clone().add(new V3(0, 0.3, 0)), 5, 0xbfe0ff, 0.4, new V3(0, 1, 0));
    b.vfx.dust(v.pos, 4, 10);
    m.shot((t, out) => {
      const c = v.chest();
      camAt(out, c.clone().addScaledVector(fwd, -2.6).addScaledVector(side, 1.4).add(new V3(0, -0.4, 0)), c.clone().add(new V3(0, 0.3, 0)), 40);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Impossible... A low-class clown did this to ME?!', 2.4, { style: 'shout' });
    yield* m.cine(2.4);
    const sky = ground(b, v.pos.clone(), 9);
    const low = v.pos.clone();
    v.grounded = false;
    v.setState('scripted', { pose: 'flyUp', expression: 'angry', aura: 1 });
    b.sfx('dash', v, { pitch: 0.8 });
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 26));
      v.setPosition(low.clone().lerp(sky, k));
      v.vel.set(0, 0, 0);
      return k >= 1;
    };
    if (g.form.id !== 'base') g.applyForm(0);
    m.endShot();
    b.skipRequested = false;
  }

  P.galick = {
    id: 'galick',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      for (let attempt = 0; attempt < 5; attempt++) {
        clearCombat(b);
        if (g.form.id !== 'base') g.applyForm(0);
        g.strain = 0;
        g.overloadCooldown = 0;
        place(g, ground(b, ARENA.clone().add(new V3(0, 0, 14))), Math.PI);
        v.setPosition(ground(b, ARENA.clone().add(new V3(0, 0, -16)), 9));
        v.grounded = false;
        faceTo(v, g.pos);
        v.hp = Math.max(v.hp, v.hpMax * 0.45);
        v.controller = scripted();
        v.setState('scripted', { pose: 'v_galickCharge', expression: 'shout' });
        g.setState('scripted', { pose: 'g_kameCharge', expression: 'angry' });
        v.aura.target = 1;
        if (attempt === 0) {
          // B-CLASH-01 / S-CLASH-01 (research draft): the prince flies straight up into the night, seen low past Goku,
          // the lens tilting up with him; he stops, spreads his feet and sweeps his arms back
          const hi = v.pos.clone(), lo = hi.clone().add(new V3(0, -6, 0));
          v.setPosition(lo);
          v.setState('scripted', { pose: 'flyUp', expression: 'angry', aura: 1 });
          const past = g.pos.clone().sub(hi).setY(0).normalize();
          m.shot((t, out) => {
            const gc = g.chest();
            camAt(out, gc.clone().addScaledVector(past, 1.8).add(new V3(0.9, -0.6, 0)), gc.clone().lerp(v.chest(), 0.8), 50);
          }, 999, { cut: true, blendIn: 0, hold: true });
          b.sfx('dash', v, { pitch: 0.8 });
          b.skipRequested = false;
          let n = 0;
          yield () => {
            n++;
            const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 50));
            v.setPosition(lo.clone().lerp(hi, k));
            v.vel.set(0, 0, 0);
            return k >= 1;
          };
          v.setState('scripted', { pose: 'v_galickCharge', expression: 'shout' });
          // the dense purple sphere between his palms, lightning over his arms
          m.shot((t, out, el) => {
            const c = v.chest();
            camAt(out, c.clone().add(new V3(-3, U.lerp(-1.6, -0.6, Math.min(1, el / 2.6)), 4)), c.clone().add(new V3(0, 0.4, 0)), 44);
          }, 999, { cut: true, blendIn: 0, hold: true });
          m.say('vegeta', 'I will blast you and this whole planet into dust! GALICK GUN!', 2.6);
          b.skipRequested = false;
          n = 0;
          yield () => {
            n++;
            if (!b.skipRequested && n % 4 === 0) {
              const hp = v.handPos('R').add(v.handPos('L')).multiplyScalar(0.5);
              b.vfx.ball(hp, 0.16 + 0.22 * Math.min(1, n / 150), PURPLE, 0.14);
              b.vfx.light(hp, PURPLE, 3, 10, 0.12);
              if (n % 8 === 0) b.vfx.bolt(hp.clone().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.3, 0.6), U.rand(-0.6, 0.6))), 1.1, 0xe0c0ff);
            }
            return b.skipRequested || n >= 156;
          };
          // B-CLASH-02 / S-CLASH-02: Goku low in the turtle stance, hands cupped at the hip, blue light on his face; then the
          // Kaioken forced past its threshold (the story unlocks the next level right here)
          g.formCaps = { kaioken: 1 };
          g.ki = g.kiMax;
          g.applyForm(1);
          g.formLevel = 1;
          g._applyFormLevel();
          // in profile from his right, the side his hands are drawn back to (the stance turns his back to the other side)
          const gr = new V3(-g.forward.z, 0, g.forward.x);
          m.shot((t, out, el) => {
            const c = g.chest(), k = Math.min(1, el / 2.2);
            camAt(out, c.clone().addScaledVector(gr, U.lerp(2.6, 2.2, k)).addScaledVector(g.forward, 0.5).add(new V3(0, 0.15, 0)), c.clone().add(new V3(0, 0.1, 0)), 40);
          }, 999, { cut: true, blendIn: 0, hold: true });
          b.vfx.ring(g.chest(), 7, 0xff3a2a, 0.5);
          b.sfx('kaiokenBoom', g, { pitch: 1.12 });
          b.cameraTraumaAt(g.chest(), 0.5);
          b.emit('skillLearned', { fighter: g, key: 'kaioken3' });
          m.say('goku', 'Kaioken... TIMES THREE!', 2);
          b.skipRequested = false;
          n = 0;
          yield () => {
            n++;
            if (n === 1) g.setState('scripted', { pose: 'g_kameCharge', expression: 'shout', aura: 1 });
            if (!b.skipRequested && n % 4 === 0) {
              const hp = g.handPos('R').add(g.handPos('L')).multiplyScalar(0.5);
              b.vfx.ball(hp, 0.12 + 0.14 * Math.min(1, n / 130), 0x6ab8ff, 0.14);
              b.vfx.light(hp, 0x6ab8ff, 1.4, 4, 0.12);
              b.camera.addTrauma(0.06);
            }
            return b.skipRequested || n >= 132;
          };
          m.flags.clashBuildUp = true;
        } else {
          g.formCaps = { kaioken: 1 };
          g.applyForm(1);
          g.formLevel = 1;
          g._applyFormLevel();
        }
        m.endShot();
        v.aura.target = 0;
        // the struggle itself is played
        m.objective('struggle', 'Win the beam struggle', { icon: 'beam' });
        g.setState('free');
        v.setState('free');
        const lim = Object.assign({}, SL.Mission.ALL_OFF);
        delete lim.s1;
        m.limits(lim);
        b.inputLocked = false;
        b.aiLocked = false;
        g.ki = g.kiMax;
        v.ki = v.kiMax;
        m.prompt('clashKame', 'special1', 'Kamehameha!', { required: true, always: true, until: () => g.state === 'beamCharge' || g.state === 'beamFire' || g.state === 'clash' });
        let hold = 0;
        v.controller = {
          update: () => {
            const it = SL.emptyIntent();
            hold++;
            if (hold === 60) it.s1 = true;
            if (hold >= 60 && hold < 60 + 50) it.s1Held = true;
            return it;
          },
        };
        let result = null, punished = false, gokuHit = false;
        const onEnd = (e) => (result = e);
        const onDmg = (e) => {
          if (b.clash.active || result) return;
          if (e.attacker === g && e.target === v && e.type === 'beam') punished = true;
          if (e.attacker === v && e.target === g && e.type === 'beam') gokuHit = true;
        };
        b.on('clashEnd', onEnd);
        b.on('damage', onDmg);
        // B-CLASH-04 (research draft): the struggle swings — the prince pours more in and the light comes down toward Goku;
        // a moment later Goku forces the Kaioken further, his beam thickens and drives it back (the research says "times
        // four" here; the multiplier is an open question for the owner, so the line names none)
        let surge = 0, surgeAt = 0, surge2At = 0;
        // S-CLASH-03 / S-CLASH-04 (research draft, not checked against the footage): this struggle's own camera, in
        // place of the engine's clash shot (this mission only; the engine still ends it when the clash resolves).
        // 03: the moment both waves are out — an extreme wide, side-on to the line between them, the two fighters small
        // at either side and the two colours racing together; it holds into the first instant of the collision.
        // 04: then low under the collision point looking up into it, shaking; the lens pushes in as Goku's light gains
        // and eases out as the prince's does, with a kick on every press. At Goku's surge a cut to him as his beam
        // thickens (as S-CLASH-02), then back.
        const ax = v.pos.clone().sub(g.pos).setY(0).normalize(), across = new V3(ax.z, 0, -ax.x);
        const own = (o) => b.projectiles.beams.find((bm) => bm.owner === o && !bm.done);
        let camOn = false, clashed = false, lastPoint = null;
        const galickCam = (t, out, el) => {
          const c = b.clash.active;
          if (c) lastPoint = c.point.clone();
          if (!c || c.t < 0.6) {
            // S-CLASH-03: side-on, far enough back for both of them
            const mid = g.chest().lerp(v.chest(), 0.5), sep = g.chest().distanceTo(v.chest());
            camAt(out, mid.clone().addScaledVector(across, sep * 0.95 + 4).add(new V3(0, 1, 0)), mid, 50);
            m.flags.clashWide = true;
            return;
          }
          if (surge2At && c.t - surge2At < 0.9) {
            // Goku forces it further: in profile from his right, standing back enough for the wave thickening out of his hands
            const gr = new V3(-g.forward.z, 0, g.forward.x), gc = g.chest();
            camAt(out, gc.clone().addScaledVector(gr, 5).addScaledVector(g.forward, 1.6).add(new V3(0, 0.5, 0)), gc.clone().addScaledVector(g.forward, 2.2), 46);
            m.flags.clashGokuCut = true;
            return;
          }
          // S-CLASH-04: low under the grinding ball of light, looking up into it
          const p = lastPoint || c.point, dom = b.clash.playerProgress() - 0.5;
          const shake = Math.sin(el * 41) * 0.07 + Math.sin(el * 29 + 1) * 0.05;
          // (back far enough that the ball's flashes do not fill the frame: a beam reaches out on either side of it)
          const pos = p.clone().addScaledVector(across, 12.5).addScaledVector(ax, shake * 2).add(new V3(0, -4.4 + shake * 2, 0));
          pos.y = Math.max(pos.y, b.stage.heightAt(pos.x, pos.z) + 0.5);
          camAt(out, pos, p, U.clamp(46 - dom * 18 - (c.mashPulse || 0) * 3 + Math.sin(el * 9) * 1.2, 34, 58));
          out.roll = Math.sin(el * 13) * 0.025;
          m.flags.clashLow = (m.flags.clashLow || 0) + 1;
        };
        const camStart = () => {
          camOn = true;
          m.shot(galickCam, 999, { cut: true, blendIn: 0, hold: true });
        };
        // the engine's clash shot is put in place inside the clash's start; this one replaces it straight after
        const onClash = (e) => {
          if ((e.a === g || e.b === g) && (e.a === v || e.b === v)) {
            clashed = true;
            camStart();
          }
        };
        b.on('clashStart', onClash);
        const swing = () => {
          // both waves out and racing together, not yet met: S-CLASH-03 from the launch
          if (!camOn && !clashed && own(g) && own(v)) camStart();
          // a wave that never met the other (it struck home or missed): no clash to watch, the camera goes back
          if (camOn && !clashed && !b.clash.active && !(own(g) && own(v))) {
            camOn = false;
            m.endShot();
          }
          const c = b.clash.active;
          if (!c || surge >= 2) return;
          const gA = c.a.owner === g, gb = gA ? c.a : c.b;
          if (surge === 0 && c.t > 1.8) {
            surge = 1;
            surgeAt = c.t;
            c.push = U.clamp(c.push + (gA ? -0.3 : 0.3), -0.85, 0.85);
            b.vfx.flash(v.chest(), 2.2, PURPLE, 0.2, SL.Toon.tex.glow);
            b.cameraTraumaAt(c.point, 0.3);
            m.say('vegeta', 'Hah! Feel that, Kakarot?! This is the end of you!', 1.8, { style: 'shout' });
          } else if (surge === 1 && c.t > surgeAt + 1.3) {
            surge = 2;
            surge2At = c.t;
            gb.power *= 1.1;
            gb.radius *= 1.35;
            b.vfx.ring(g.chest(), 6, 0xff3a2a, 0.45);
            b.sfx('kaiokenBoom', g, { pitch: 1.05 });
            b.cameraTraumaAt(g.chest(), 0.45);
            m.say('goku', "It's not enough... Kaioken — further!!", 1.8, { style: 'shout' });
            m.flags.clashSurge = true;
          }
        };
        const f0 = b.frame;
        yield () => {
          swing();
          return result || punished || (gokuHit && !b.projectiles.beams.length) || (b.frame - f0 > 60 * 12 && !b.clash.active);
        };
        for (const [ev, fn] of [['clashEnd', onEnd], ['damage', onDmg], ['clashStart', onClash]]) {
          const ls = b.listeners[ev] || [];
          const i = ls.indexOf(fn);
          if (i >= 0) ls.splice(i, 1);
        }
        m.prompts.delete('clashKame');
        m.limits(null);
        if ((result && result.winner === g) || punished) {
          m.complete('struggle');
          yield 0.6;
          yield* skyward(m);
          return;
        }
        if (result && result.winner === v) {
          yield 1.2;
          m.fail('clashLost');
          yield () => false;
        }
        m.lock(true);
        m.say('goku', "Not yet... one more time!", 2);
        yield 2;
      }
      m.fail('clashLost');
    },
  };

  /*
   * INTO THE SKY (Roadmap Three, the owner's Gemini fight research, beat B-CLASH-05 — staged): the beam carries the
   * prince straight up through the clouds until he is a glint in the night; below, the Kaioken gives out and Goku drops
   * out of it in pain; then Vegeta comes back down, battered and furious (the Power Ball follows in P.transform).
   * The research's "Kaioken times four" here is not taken: the episode and the manga use times three, as this mission does.
   */
  function* skyward(m) {
    const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
    m.lock(true);
    clearCombat(b);
    v.controller = scripted();
    g.setState('scripted', { pose: 'g_kameFire', expression: 'shout', aura: 1 });
    v.setState('scripted', { pose: 'hitHeavy', expression: 'shout' });
    const from = v.pos.clone();
    const top = from.clone().add(new V3(0, 70, 0));
    v.grounded = false;
    // the Kamehameha itself, carrying him: a real beam that does no damage of its own (he is out of its reach while it
    // pushes him, so it never knocks him out of the pose)
    v.intangible = true;
    g.target = v;
    const beam = b.skipRequested ? null : b.projectiles.spawnBeam(g, SKY_KAME, 1);
    m.shot((t, out) => {
      const c = g.chest();
      camAt(out, c.clone().add(new V3(4, -0.8, 6)), c.clone().lerp(v.chest(), 0.55), 62);
    }, 999, { cut: true, blendIn: 0, hold: true });
    b.sfx('kiBlastBig', v, { vol: 1.2, pitch: 0.7 });
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 70));
      v.setPosition(from.clone().lerp(top, k));
      v.vel.set(0, 0, 0);
      // the beam's head stays on him all the way up (Cinema.pinBeam's way)
      if (beam && !beam.done) beam.headOverride = v.chest();
      if (!b.skipRequested && n % 6 === 0) b.vfx.flash(v.chest(), 1.6, 0xff5a4a, 0.12, SL.Toon.tex.glow);
      return k >= 1;
    };
    v.intangible = false;
    for (const bm of b.projectiles.beams) if (bm.owner === g) bm.stop();
    // a glint where he went
    if (!b.skipRequested) {
      b.vfx.flash(top, 3, 0xffffff, 0.3, SL.Toon.tex.glow);
      b.sfx('explosionSmall', null, { at: top, vol: 0.5, pitch: 1.4 });
    }
    m.flags.skyward = true;
    yield* m.cine(0.8);
    // the Kaioken gives out
    if (g.form.id !== 'base') g.applyForm(0);
    g.strain = 30;
    g.grounded = true;
    g.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
    b.vfx.ring(g.chest(), 3, 0xff3a2a, 0.3);
    m.shot((t, out) => {
      const c = g.chest();
      camAt(out, c.clone().addScaledVector(g.forward, 2.4).add(new V3(0.8, 0.1, 0)), c.clone().add(new V3(0, 0.2, 0)), 38);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Agh... times three... My whole body is screaming...', 2.6, { style: 'quiet' });
    yield* m.cine(2.6);
    // and back down he comes, battered, in a rage
    const land = ground(b, ARENA.clone().add(new V3(0, 0, -12)));
    const high = land.clone().add(new V3(0, 40, 0));
    v.setPosition(high);
    v.setState('scripted', { pose: 'v_dive', expression: 'angry' });
    m.shot((t, out) => camAt(out, land.clone().add(new V3(6, 2, 10)), v.chest(), 50), 999, { cut: true, blendIn: 0, hold: true });
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 34));
      v.setPosition(high.clone().lerp(land, k));
      v.vel.set(0, 0, 0);
      return k >= 1;
    };
    place(v, land, v.yaw);
    faceTo(v, g.pos);
    b.stage.crater(land, 2.6, 0.4, v);
    b.vfx.dust(land, 4, 12);
    b.sfx('groundImpact', v, { vol: 1.1 });
    m.endShot();
    b.skipRequested = false;
  }

  P.transform = {
    id: 'transform',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (g.form.id !== 'base') g.applyForm(0);
      g.strain = 30;
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -12))), 0);
      faceTo(v, g.pos);
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 12))), Math.PI);
      v.setState('scripted', { pose: 'v_bigBangW', expression: 'angry' });
      g.setState('scripted', { pose: 'g_resolve', expression: 'hurt' });
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(2.2, 0.4, 3)), c, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('vegeta', 'You forced my hand, Kakarot. Behold... a Saiyan\'s true power!', 2.6);
      yield* m.cine(2.6);
      // the Power Ball rises and swells into a moon
      const hand = v.handPos('R');
      const ball = powerBall(b, hand);
      S.ball = ball;
      let k = 0;
      m.tickHooks.push(() => {
        k++;
        const t = Math.min(1, k / 120);
        ball.group.position.copy(hand).add(new V3(0, U.easeOutCubic(t) * 90, -U.easeOutCubic(t) * 60));
        ball.group.scale.setScalar(0.3 + t * t * 14);
      });
      b.sfx('kiBlastBig', v, { pitch: 0.6 });
      m.shot((t, out) => camAt(out, v.chest().add(new V3(-4, -1, 6)), ball.group.position, 55), 2.4, { cut: true, blendIn: 0 });
      yield* m.cine(2.2);
      m.tickHooks.length = 0;
      ball.group.position.copy(hand).add(new V3(0, 90, -60));
      ball.group.scale.setScalar(14);
      b.stage.setMood(0.45, 0x0c1024, 1.5);
      // the transformation
      v.setState('scripted', { pose: 'powerUp', expression: 'shout' }); // (was Goku's own g_ssjRage: a missing pose on Vegeta)
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(0, U.lerp(0, 8, t), U.lerp(5, 26, t))), c.clone().add(new V3(0, U.lerp(0, 7, t), 0)), 50);
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('goku', "His eyes... no! The moon!", 1.8);
      yield* m.cine(0.8);
      const ape = SL.growInto(b, v, 'great_ape_vegeta', { frames: 130, tags: { boss: true, priority: true } });
      S.ape = ape;
      ape.controller = scripted();
      ape.cannotDie = true;
      ape.setState('scripted', { pose: 'ga_roar', expression: 'shout' });
      b.sfx('roar', ape, { pitch: 0.55, vol: 1.4 });
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  P.greatApe = {
    id: 'greatApe',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.stage.setMood(0.45, 0x0c1024, 0.2);
      if (!S.ball) {
        S.ball = powerBall(b, ARENA.clone());
        S.ball.group.position.set(0, 110, -70);
        S.ball.group.scale.setScalar(14);
      }
      if (!S.ape || !S.ape.alive) {
        v.setHidden(true);
        v.untargetable = true;
        S.ape = b.spawn({ charId: 'great_ape_vegeta', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -12))), tags: { boss: true, priority: true } });
      }
      const ape = S.ape;
      if (g.form.id !== 'base') g.applyForm(0);
      g.formCaps = { kaioken: 1 };
      g.strain = 0;
      // a fresh checkpoint: Goku enters the giant fight at full strength
      g.hp = g.hpMax;
      g.ki = g.kiMax;
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 12))), Math.PI);
      place(ape, ground(b, ARENA.clone().add(new V3(0, 0, -12))), 0);
      ape.cannotDie = true;
      ape.controller = cpu(b);
      ape.target = g;
      g.target = ape;
      g.setState('free');
      ape.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('survive', 'Survive the Great Ape', { icon: 'guard', target: 30 });
      const t0 = m.time;
      m.prompt('apeJump', 'ascend', 'Fly over it', { always: true, when: () => (ape.state === 'giantSweep' || ape.state === 'giantStomp') && ape.stateFrame < ape.sd.spec.windup && g.distTo(ape) < 20, until: () => ape.state !== 'giantSweep' && ape.state !== 'giantStomp' });
      m.prompt('apeGrab', 'dodge', 'Get out of his reach!', { always: true, when: () => ape.state === 'giantGrab' && ape.sd.phase === 'reach', until: () => ape.state !== 'giantGrab' || ape.sd.phase !== 'reach' });
      m.prompt('apeMash', 'light', 'Break free', { required: true, always: true, when: () => g.state === 'held', until: () => g.state !== 'held' });
      m.tickHooks.push(() => m.progress('survive', Math.min(30, Math.floor(m.time - t0))));
      yield () => m.time - t0 >= 30 || !g.alive;
      if (!g.alive) return;
      m.tickHooks.length = 0;
      m.complete('survive');
      // help arrives: Krillin and Gohan see the tail
      m.lock(true);
      clearCombat(b);
      for (const h of [S.krillin, S.gohan]) {
        unbench(h);
        place(h, ground(b, ARENA.clone().add(new V3(h === S.krillin ? -10 : 10, 0, 18))), Math.PI);
        h.setState('scripted', { pose: 'idle', expression: 'angry' });
      }
      ape.setState('scripted', { pose: 'ga_chestBeat', expression: 'shout' });
      m.shot((t, out) => {
        const c = S.krillin.chest();
        camAt(out, c.clone().add(new V3(1.8, 0.3, 2.6)), c, 42);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('krillin', 'Goku! His tail — that is where his power comes from!', 2.6);
      yield* m.cine(2.6);
      m.endShot();
      // canon: Yajirobe creeps up behind the giant with his sword
      const y = S.yajirobe;
      unbench(y);
      // canon: he makes it out of this fight (a hero who drops here just stays down)
      y.cannotDie = true;
      place(y, ground(b, ape.pos.clone().addScaledVector(ape.forward, -30)), 0);
      faceTo(y, ape.pos);
      y.setState('scripted', { pose: 'y_sneak', expression: 'grit' });
      m.shot((t, out) => {
        const c = y.chest();
        camAt(out, c.clone().add(new V3(-2.2, 0.4, -2.4)), c.clone().add(new V3(0, 0.2, 0)), 42);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('yajirobe', "Nobody look at me... I'm only here because Korin made me.", 2.4);
      yield* m.cine(2.4);
      m.endShot();
      y.controller = sneakTailController(b, y, ape);
      const party = [g, S.krillin, S.gohan, y];
      for (const h of party) h.setState('free');
      ape.setState('free');
      b.setParty(party);
      m.lock(false);
      b.aiLocked = false;
      m.objective('tail', "Cut the Great Ape's tail", { icon: 'fist' });
      const disc = m.objective('disc', 'Cut it with the Destructo Disc', { icon: 'ball', optional: true });
      let broken = false;
      const yajObj = m.objective('yajirobe', 'Let Yajirobe cut it from behind', { icon: 'fist', optional: true });
      b.on('zoneBroken', (e) => {
        if (e.fighter !== ape || e.zone.id !== 'tail') return;
        broken = true;
        if (e.attacker === S.yajirobe && !yajObj.done) m.complete('yajirobe');
        if (e.attacker === S.krillin && S.krillin.state === 'specialThrow' && !disc.done) m.complete('disc');
      });
      b.on('special', (e) => {
        if (e.fighter === S.krillin && e.slot === 'special2') S.discAt = b.frame;
      });
      b.on('zoneHit', (e) => {
        if (e.fighter === ape && e.zone.id === 'tail' && e.attacker === S.krillin && S.discAt && b.frame - S.discAt < 200 && ape.brokenZones && ape.brokenZones.tail && !disc.done) m.complete('disc');
      });
      m.prompt('getBehind', 'boost', 'Get behind him', { when: () => b.player.distTo(ape) < 30 && m.time - t0 > 50, until: () => ape.zoneAt(b.player.chest()) && ape.zoneAt(b.player.chest()).zone.id === 'tail' });
      yield () => broken || !b.partyAlive().length;
      if (!broken) return;
      m.complete('tail');
      yield 0.8;
    },
  };

  P.shrink = {
    id: 'shrink',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, ape = S.ape;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      // Yajirobe slips away once the tail is gone
      S.yajirobe.controller = scripted();
      S.yajirobe.untargetable = true;
      // leave any vanish/teleport first: those unhide a fighter when they end
      if (S.yajirobe.alive) S.yajirobe.setState('scripted', { pose: 'idle' });
      S.yajirobe.setHidden(true);
      ape.setState('scripted', { pose: 'ga_roar', expression: 'hurt' });
      m.shot((t, out) => camAt(out, ape.chest().add(new V3(-14, -2, 18)), ape.chest().add(new V3(0, 2, 0)), 52), 3, { cut: true, blendIn: 0 });
      b.sfx('roar', ape, { pitch: 0.7 });
      // he shrinks back into a battered Vegeta
      let k = 0;
      const full = ape.model.baseScale;
      const small = v.scale / ape.scale;
      m.tickHooks.push(() => {
        k++;
        const t = Math.min(1, k / 100);
        ape.model.root.scale.setScalar(full * (1 - (1 - small) * U.easeInOutCubic(t)));
      });
      yield* m.cine(1.9);
      m.tickHooks.length = 0;
      const spot = ground(b, ape.pos);
      b.remove(ape);
      S.ape = null;
      // the Power Ball still hangs in the sky (it matters again soon)
      b.stage.setMood(0.25, 0x0c1024, 1.5);
      unbench(v);
      place(v, spot, 0);
      v.hp = v.hpMax * 0.35;
      v.setState('scripted', { pose: 'v_defeatPound', expression: 'grit' });
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(2, 0.2, 2.6)), c, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('vegeta', 'My tail... You worms... I am not finished!', 2.6);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  P.desperate = {
    id: 'desperate',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku, gh = S.gohan, k = S.krillin;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (S.ape && S.ape.alive) {
        b.remove(S.ape);
        S.ape = null;
      }
      if (!S.ball) S.ball = skyBall(b);
      b.stage.setMood(0.25, 0x0c1024, 0.2);
      unbench(v);
      for (const h of [gh, k]) unbench(h);
      // Goku is spent
      if (g.form.id !== 'base') g.applyForm(0);
      place(g, ground(b, ARENA.clone().add(new V3(18, 0, 18))), Math.PI);
      bench(g);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -6))), 0);
      place(gh, ground(b, ARENA.clone().add(new V3(3, 0, 8))), Math.PI);
      place(k, ground(b, ARENA.clone().add(new V3(-3, 0, 8))), Math.PI);
      v.hp = Math.min(v.hp, v.hpMax * 0.55);
      v.cannotDie = true;
      v.controller = cpu(b);
      v.damageDealtMul = 1.1;
      b.switchPlayer(gh, { force: true });
      g.controller = scripted();
      b.setParty([gh, k]);
      for (const h of [gh, k]) {
        h.cannotDie = false;
        h.target = v;
        h.setState('free');
      }
      v.target = gh;
      v.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('vegeta', 'Wear Vegeta down', { icon: 'fist' });
      const potential = m.objective('rage', "Unleash Gohan's hidden power", { icon: 'potential', optional: true });
      b.on('mechanic', (e) => {
        if (e.fighter === gh && e.kind === 'potential' && !potential.done) m.complete('rage');
      });
      yield () => v.hpFrac <= 0.3 || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      m.complete('vegeta');
      yield 0.6;
    },
  };

  /** Vegeta swats Krillin aside and turns on Gohan — who looks up at the moon. */
  P.moonlight = {
    id: 'moonlight',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, gh = S.gohan, k = S.krillin;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      if (!S.ball) S.ball = skyBall(b);
      if (b.player !== gh) b.switchPlayer(gh, { force: true });
      gh.controller = scripted();
      unbench(k);
      place(k, ground(b, ARENA.clone().add(new V3(-9, 0, 9))), Math.PI);
      bench(k);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -4))), 0);
      place(gh, ground(b, ARENA.clone().add(new V3(0, 0, 5))), Math.PI);
      faceTo(v, gh.pos);
      faceTo(gh, v.pos);
      v.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      gh.setState('scripted', { pose: 'kg_scared', expression: 'hurt' });
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(2.2, 0.3, 2.8)), c, 40);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Enough. You first, brat.', 2.2);
      yield* m.cine(2.4);
      // the boy looks up
      gh.setState('scripted', { pose: 'kg_lookUp', expression: 'calm', face: false });
      m.shot((t, out) => camAt(out, gh.pos.clone().add(new V3(0.6, 0.5, 2.2)), S.ball.group.position, U.lerp(55, 42, t)), 2.8, { cut: true, blendIn: 0 });
      m.say('krillin', "Gohan... your tail! Don't look at the moon!", 2.6);
      for (let i = 0; i < 3; i++) {
        b.camera.addTrauma(0.1 + i * 0.08);
        SL.Audio.play('groundImpact', { vol: 0.35 + i * 0.15, pitch: 0.5 });
        yield 0.7;
      }
      gh.setState('scripted', { pose: 'kg_rageBlast', expression: 'shout' });
      m.shot((t, out) => {
        const c = gh.chest();
        camAt(out, c.clone().add(new V3(0, U.lerp(0, 9, t), U.lerp(4, 26, t))), c.clone().add(new V3(0, U.lerp(0, 6, t), 0)), 50);
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('vegeta', 'His tail... No! Not him too!', 1.8);
      yield* m.cine(0.8);
      const ape = SL.growInto(b, gh, 'great_ape_gohan_player', { frames: 120 });
      S.gohanApe = ape;
      ape.controller = scripted();
      ape.cannotDie = true;
      ape.setState('scripted', { pose: 'ga_roar', expression: 'shout' });
      b.sfx('roar', ape, { pitch: 0.8, vol: 1.4 });
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  /**
   * The player is Great Ape Gohan. Crush Vegeta with swats, smashes, stomps, the
   * grab and the mouth blast; keep him off the tail. Either way the story ends
   * the same: the tail is cut and the giant falls on him (see apeFalls).
   */
  P.gohanApe = {
    id: 'gohanApe',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, gh = S.gohan, k = S.krillin, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      b.stage.setMood(0.3, 0x0c1024, 0.2);
      if (!S.ball) S.ball = skyBall(b);
      if (S.ape && S.ape.alive) {
        b.remove(S.ape);
        S.ape = null;
      }
      unbench(v);
      let ape = S.gohanApe;
      if (!ape || !ape.alive) {
        // resuming from this checkpoint: Gohan has already grown
        gh.setHidden(true);
        gh.untargetable = true;
        ape = S.gohanApe = b.spawn({ charId: 'great_ape_gohan_player', team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, 6))) });
      }
      place(ape, ground(b, ARENA.clone().add(new V3(0, 0, 6))), Math.PI);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -16))), 0);
      b.switchPlayer(ape, { force: true });
      gh.controller = scripted();
      for (const h of [g, k]) {
        if (!h.alive) continue;
        unbench(h);
        bench(h);
      }
      if (!k.alive || Math.abs(k.pos.x) < 1) place(k, ground(b, ARENA.clone().add(new V3(-24, 0, 20))), Math.PI);
      v.hp = v.hpMax * 0.3;
      v.cannotDie = true;
      v.damageDealtMul = 1;
      ape.cannotDie = true;
      // a child's wild swings: heavy, but Vegeta takes several of them (tuned with the rampage bot, see STATUS.md)
      ape.damageDealtMul = 0.55;
      ape.hp = ape.hpMax;
      ape.ki = 60;
      ape.target = v;
      v.target = ape;
      v.controller = tailHunter(b, v, ape);
      ape.setState('free');
      v.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      const goal = v.hpMax * 0.45;
      let dealt = 0, tailCut = false;
      m.objective('crush', 'Crush Vegeta', { icon: 'fist', target: 100 });
      m.objective('tail', 'Keep him away from your tail', { icon: 'guard', optional: true });
      const grabObj = m.objective('grab', 'Catch Vegeta in your hand', { icon: 'fist', optional: true });
      b.on('damage', (e) => {
        if (e.target !== v || e.attacker !== ape || e.blocked || tailCut) return;
        dealt += e.amount;
        m.progress('crush', Math.min(100, Math.floor((dealt / goal) * 100)));
      });
      b.on('giantGrab', (e) => {
        if (e.fighter === ape && e.victim === v && !grabObj.done) m.complete('grab');
      });
      b.on('zoneBroken', (e) => {
        if (e.fighter === ape && e.zone.id === 'tail') tailCut = true;
      });
      m.prompt('apeStomp', 'special1', 'Stomp', { when: () => ape.distTo(v) < 16 && v.pos.y - b.stage.heightAt(v.pos.x, v.pos.z) < 2 && !(ape.cooldowns.special1 > 0), until: () => ape.state === 'giantStomp' });
      m.prompt('apeRoar', 'ultimate', 'Roar him off your tail', { always: true, when: () => atTail(ape, v) && ape.ki >= 50 && !(ape.cooldowns.ultimate > 0), until: () => !atTail(ape, v) || ape.state === 'bossRoar' });
      m.tickHooks.push(() => {
        if (v.hpFrac < 0.05) v.hp = v.hpMax * 0.05;
      });
      yield () => dealt >= goal || tailCut;
      m.tickHooks.length = 0;
      if (tailCut) m.failObjective('tail');
      else {
        m.progress('crush', 100);
        m.complete('tail');
      }
      yield 0.5;
      yield* m.def.apeFalls(m, tailCut);
    },
  };

  /**
   * How Great Ape Gohan's rampage ends, as in the story: Vegeta cuts the tail (in
   * desperation now, if the player kept him off it) and the toppling giant lands
   * on him; the ape shrinks back into an unconscious boy.
   */
  function* apeFalls(m, alreadyCut) {
    const b = m.battle, S = b.story, v = S.vegeta, ape = S.gohanApe, gh = S.gohan;
    m.lock(true);
    clearCombat(b);
    if (v.state === 'held') v.setState('free');
    if (ape.state !== 'free') ape.setState('free');
    ape.controller = scripted();
    v.controller = scripted();
    if (!alreadyCut) {
      const spot = ground(b, ape.pos.clone().addScaledVector(ape.forward, -16), 5);
      v.setPosition(spot);
      v.grounded = false;
      faceTo(v, ape.pos);
      v.setState('scripted', { pose: 'v_bigBangW', expression: 'shout' });
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(1.6, 0.4, 0)).addScaledVector(v.forward, -3), c.clone().addScaledVector(v.forward, 6), 46);
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('vegeta', "You filthy half-breed... I'll cut it off myself!", 2.2);
      yield* m.cine(2);
      const tail = ape._zoneCenters().find((z) => z.zone.id === 'tail');
      const from = v.handPos('R');
      b.projectiles.spawnBlast(v, from, tail.c.clone().sub(from).normalize(), { kind: 'ball', speed: 120, radius: 0.45, damage: 0, color: 0xffb0ff, core: 0xffffff, explode: 1, knock: 'flinch', impact: 1, life: 0.3 });
      b.sfx('kiBlast', v, { pitch: 1.4 });
      yield 0.2;
      ape.takeHit(v, { type: 'ki', damage: 99999, knock: 'flinch', impact: 3, point: tail.c.clone() });
    }
    // the tail is gone
    for (let i = 2; i < 8; i++) {
      const j = ape.model.joints['tail' + i];
      if (j) j.visible = false;
    }
    ape.setState('scripted', { pose: 'ga_roar', expression: 'hurt' });
    b.sfx('roar', ape, { pitch: 0.9 });
    m.shot((t, out) => camAt(out, ape.chest().add(new V3(-16, -2, 20)), ape.chest().add(new V3(0, 2, 0)), 52), 1.4, { cut: true, blendIn: 0 });
    yield* m.cine(1.2);
    // Vegeta, right in front of the giant, looks up as it tips over
    place(v, ground(b, ape.pos.clone().addScaledVector(ape.forward, 7)), 0);
    faceTo(v, ape.pos);
    v.setState('scripted', { pose: 'v_chinUp', expression: 'hurt' });
    m.say('vegeta', 'Wait... no!', 1.2);
    const root = ape.model.root;
    const rx0 = root.rotation.x;
    let n = 0;
    m.tickHooks.push(() => {
      n++;
      const t = Math.min(1, n / 48);
      root.rotation.x = rx0 + t * t * 1.4;
    });
    m.shot((t, out) => camAt(out, ape.pos.clone().add(new V3(0, 3, 0)).add(new V3(ape.forward.z, 0, -ape.forward.x).multiplyScalar(26)), ape.pos.clone().addScaledVector(ape.forward, 5).add(new V3(0, 3, 0)), 50), 2.6, { cut: true, blendIn: 0 });
    yield* m.cine(0.85);
    m.tickHooks.length = 0;
    root.rotation.x = rx0 + 1.4;
    b.stage.crater(v.pos, 7, 1.6, null);
    b.vfx.dust(v.pos, 10, 40);
    b.vfx.debrisBurst(v.pos.clone().add(new V3(0, 0.5, 0)), 24, b.stage.rockColor || 0x8a6a4a, 16, 0.5);
    b.cameraTraumaAt(v.pos, 1);
    b.sfx('groundImpact', null, { at: v.pos.clone(), vol: 2 });
    v.hp = Math.max(1, Math.round(v.hpMax * 0.04));
    v.setState('scripted', { pose: 'v_defeatPound', expression: 'hurt' });
    yield* m.cine(1.4);
    // the giant shrinks back into an unconscious boy
    const full = ape.model.baseScale, small = gh.scale / ape.scale;
    n = 0;
    m.tickHooks.push(() => {
      n++;
      root.scale.setScalar(full * (1 - (1 - small) * U.easeInOutCubic(Math.min(1, n / 80))));
    });
    yield* m.cine(1.4);
    m.tickHooks.length = 0;
    const spot = ground(b, ape.pos.clone().addScaledVector(ape.forward, 3));
    unbench(gh);
    place(gh, spot, 0);
    b.switchPlayer(gh, { force: true });
    gh.controller = scripted();
    gh.setState('scripted', { pose: 'kg_sleep', expression: 'calm', face: false });
    b.remove(ape);
    S.gohanApe = null;
    if (S.ball) {
      S.ball.dispose();
      S.ball = null;
    }
    b.stage.clearMood(1.5);
    m.endShot();
  }

  P.retreat = {
    id: 'retreat',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku, k = S.krillin;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      v.setState('scripted', { pose: 'v_defeatPound', expression: 'hurt' });
      place(k, ground(b, v.pos.clone().add(new V3(-2.4, 0, 3))), 0);
      faceTo(k, v.pos);
      k.setState('scripted', { pose: 'k_discCharge', expression: 'angry' });
      m.shot((t, out) => {
        const c = k.chest();
        camAt(out, c.clone().add(new V3(2, 0.2, 2.6)), c.clone().add(new V3(0, 0.4, 0)), 42);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('krillin', "It's over, Vegeta. For Yamcha, and everyone else...", 2.4);
      yield* m.cine(2.4);
      m.shot((t, out) => {
        const c = g.chest();
        camAt(out, c.clone().add(new V3(1.8, 0.3, -2.6)), c, 40);
      }, 2.8, { cut: true, blendIn: 0 });
      g.setState('scripted', { pose: 'defeatKneel', expression: 'calm' });
      m.say('goku', "Krillin... let him go. I want to fight him again someday.", 2.8);
      yield* m.cine(2.8);
      // Vegeta drags himself away and is gone
      v.setState('scripted', { pose: 'flyUp', expression: 'angry' });
      let n = 0;
      m.tickHooks.push(() => {
        n++;
        v.pos.y += 0.35;
        v.pos.z -= 0.2;
        v.prevPos.copy(v.pos);
        if (n % 3 === 0) b.vfx.trail(v.chest(), 0xd8b8ff, 0.5, 0.4);
      });
      m.shot((t, out) => camAt(out, ground(b, ARENA.clone().add(new V3(12, 0, 20)), 3), v.chest(), 55), 3, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Kakarot! This is not the end!', 2.4);
      yield* m.cine(2.8);
      m.tickHooks.length = 0;
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('SAIYAN SAGA', 'COMPLETE', 'Next: Chapter 4 · Namek', 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'saiyan_vegeta',
    canon: true,
    chapter: 'CHAPTER 3 · SAIYAN SAGA',
    title: 'The Saiyan Prince',
    subtitle: 'Earth · Goku versus Vegeta',
    character: 'goku',
    stage: 'wasteland',
    parTime: 480,
    qteLabel: 'Beam struggle',
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The strongest Saiyan alive, a beam struggle that shakes the planet, and a monster under an artificial moon.',
    rewards: ['Kaioken x3 in the story', 'Great Ape boss fight (replayable)', 'Play as Great Ape Gohan', 'Saiyan Saga complete'],
    setup,
    apeFalls,
    phases: [P.standoff, P.duel, P.galick, P.transform, P.greatApe, P.shrink, P.desperate, P.moonlight, P.gohanApe, P.retreat],
  };

  SL.data.missions[def.id] = def;
})();
