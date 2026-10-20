/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "Pride and Destruction" (Vegeta vs Toppo; Super Saiyan Blue Evolution).
 * Tournament of power ui.docx §5 and §6: Vegeta's evolved blue form is his own road, not Goku's — its own
 * transformation, aura and feel; Toppo abandons justice to become a God of Destruction; Vegeta defeats him with a
 * desperate, self-sacrificing explosion, survives it, and goes on toward Jiren. The owner's still: Blue Vegeta against
 * a Toppo glowing violet behind the Hakai sphere ("Destroy!").
 *
 *   OPEN *       (scene top_toppo_open) Toppo gives up his justice: the God of Destruction's violet light
 *   HAKAI *      (play)           Blue Vegeta vs God of Destruction Toppo. HAKAI SPHERES: he raises a hand, a violet
 *                                 sphere gathers over his palm (the tell), then drifts after you — touching it erases a
 *                                 large part of you. Keep moving, or break it early with a ki blast. Ends on his floor or
 *                                 when Vegeta is pushed to his limit
 *   EVOLUTION    (ascend)         "I'm not Kakarot": Super Saiyan Blue Evolution (hold Charge) — deeper blue, lightning
 *   PRIDE *      (play)           Blue Evolution vs Toppo: the spheres keep coming, but now a heavy blow shatters them
 *                                 (at a cost). Ends on his floor
 *   EXPLOSION    (struggle + cue) Toppo's last, enormous Hakai; Vegeta walks into it and holds (mash) — then lets
 *                                 everything go at once (Charge): the explosion takes the platform's edge and Toppo with
 *                                 it; the ruling; Vegeta left standing, burned down to base, his armour gone
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;
  const TK = () => SL.data.topKit;
  const ST = (m) => SL.data.u6Kit.staged(m);
  const CHAPTER = 'CHAPTER 22 · THE TOURNAMENT OF POWER';
  const HAKAI = 0x9a3aff;
  const TU = {
    hakai: { floor: 0.7, limit: 0.45, dealt: 0.16, taken: 1.3, every: 7.5, tell: 1.4, speed: 9, life: 7, radius: 1.3, erase: 0.2 },
    pride: { floor: 0.35, dealt: 0.1, taken: 1.6, every: 6.5, tell: 1.2, speed: 11, life: 7, radius: 1.3, erase: 0.18, shatterCost: 0.04 },
    evolutionHold: 3,
  };
  const SPOT = { vegeta: [0, 9], toppo: [0, -8] };

  SL.data.scenes.top_toppo_open = {
    id: 'top_toppo_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    // the Tournament of Power's own battle music (soundtrack PDF p.91–92, "Genkai Toppa x Survivor": an original stand-in)
    music: { song: 'limit_survivor', level: 2 },
    auraCap: 0,
    events: [
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cocky' }, { who: 'toppo', pose: 'tp_justice', face: 'determined' }],
        cam: { subject: 'vegeta', with: 'toppo', focus: 'full', angle: 'side' },
        title: { chapter: CHAPTER, title: 'PRIDE AND DESTRUCTION', subtitle: 'Vegeta vs Toppo', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { subject: 'toppo', focus: 'upper', angle: 'low' },
        say: { who: 'toppo', line: 'Justice alone will not save my universe. Then I will throw it away — and become a God of Destruction.', duration: 4.4 },
        hold: 4.5,
      },
      // the violet light of destruction rises round him
      {
        call: (ctx) => {
          const t = ctx.cast.toppo;
          K.toForm(t, 'god');
          ctx.b.vfx.ring(t.pos.clone().add(new V3(0, 0.2, 0)), 14, HAKAI, 0.8, new V3(0, 1, 0));
          ctx.b.vfx.flash(t.chest(), 4, 0xd8a0ff, 0.5, SL.Toon.tex.glow);
          ctx.b.sfx('transformBurst', t, { vol: 1.1, pitch: 0.7 });
          if (t.setDamage) t.setDamage(3, { burst: true });
        },
        // justice thrown away: his own music lands with the violet light (wave 9)
        music: { song: 'toppo_destroyer', level: 2 },
        pose: [{ who: 'toppo', pose: 'tp_hakai', face: 'cold' }],
        cam: { subject: 'toppo', focus: 'full', angle: 'low' },
        hold: 2.6,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Universe 11\'s candidate... he really did it. That is a God of Destruction\'s power.', duration: 3.4 },
        hold: 3.5,
      },
      {
        call: (ctx) => K.toForm(ctx.cast.vegeta, 'blue'),
        pose: [{ who: 'vegeta', pose: 'v_tfPride', face: 'cocky' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'A god? Good. I\'ve been wanting to crush one.', duration: 2.8 },
        hold: 2.9,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.vegeta, K.ground(b, new V3(SPOT.vegeta[0], 0, SPOT.vegeta[1])), Math.PI);
      K.place(S.toppo, K.ground(b, new V3(SPOT.toppo[0], 0, SPOT.toppo[1])), 0);
      K.faceTo(S.vegeta, S.toppo.pos);
      K.faceTo(S.toppo, S.vegeta.pos);
    },
  };

  function setup(b) {
    const S = TK().setup(b, {
      player: 'vegeta', fight: ['vegeta', 'toppo'],
      seat: ['beerus', 'whis', 'krillin', 'tien', 'roshi', 'adult_gohan', 'piccolo'],
      edge: { goku: [-28, 20], jiren: [30, -26], frieza: [28, 22], android_17: [-30, -14] },
    });
    K.place(S.vegeta, K.ground(b, new V3(SPOT.vegeta[0], 0, SPOT.vegeta[1])), Math.PI);
    K.place(S.toppo, K.ground(b, new V3(SPOT.toppo[0], 0, SPOT.toppo[1])), 0);
    K.faceTo(S.vegeta, S.toppo.pos);
    K.faceTo(S.toppo, S.vegeta.pos);
    return S;
  }

  /** dmg: Vegeta's suit for this beat (0 whole; 1 the first destruction grazes; 2 armour cracked, the suit holed) */
  function stage(m, dmg) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    TK().seat(m);
    TK().ruin(b, 1);
    if (dmg !== undefined && S.vegeta.setDamage) S.vegeta.setDamage(dmg);
    TK().edge(m);
    BK.give(S.vegeta, ['blue', 'blueEvo']);
    BK.give(S.toppo, 'god');
    for (const f of [S.vegeta, S.toppo]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
    }
  }

  /**
   * HAKAI SPHERES for one fight. Every so often Toppo raises a hand and a violet sphere gathers over it (the tell);
   * then it drifts after Vegeta. Touching it erases cfg.erase of his health (a real hit, a crumple). A ki blast of
   * Vegeta's that reaches it bursts it early; with opts.shatter, a heavy blow does too (and costs cfg.shatterCost).
   * Returns { off(), st }.
   */
  function hakai(m, cfg, opts = {}) {
    const b = m.battle, S = b.story, v = S.vegeta, t = S.toppo;
    const st = { t: 0, next: cfg.every * 0.5, orbs: [], tells: 0, hits: 0, broken: 0 };
    const geo = new THREE.SphereGeometry(1, 24, 16);
    const make = () => {
      const mat = new THREE.MeshBasicMaterial({ color: HAKAI, transparent: true, opacity: 0.85, depthWrite: false });
      const inner = new THREE.MeshBasicMaterial({ color: 0x1a0430, transparent: true, opacity: 0.9, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      const core = new THREE.Mesh(geo, inner);
      core.scale.setScalar(0.65);
      mesh.add(core);
      mesh.scale.setScalar(0.1);
      b.scene.add(mesh);
      return { mesh, mat, inner, phase: 'tell', f0: b.frame, pos: new V3(), vel: new V3() };
    };
    const kill = (o, burst) => {
      if (burst) {
        b.vfx.explosion(o.mesh.position.clone(), 1.2, HAKAI, { smoke: false });
        b.sfx('warpShatter', null, { at: o.mesh.position, vol: 0.8 });
      }
      if (o.mesh.parent) o.mesh.parent.remove(o.mesh);
      o.mat.dispose();
      o.inner.dispose();
      st.orbs.splice(st.orbs.indexOf(o), 1);
    };
    const hook = () => {
      if (b.inputLocked) return;
      st.t += 1 / 60;
      // a new sphere when the last one is gone
      if (!st.orbs.length && st.t >= st.next && ['free', 'guard', 'recover'].includes(t.state)) {
        st.next = st.t + cfg.every * U.rand(0.85, 1.15);
        st.tells++;
        const o = make();
        st.orbs.push(o);
        t.setState('scripted', { pose: 'tp_hakai', expression: 'cold', speed: 12, aura: 1 });
        b.sfx('kiCharge', t, { vol: 0.8, pitch: 0.6 });
        b.emit('telegraph', { pos: t.pos.clone(), radius: cfg.radius, frames: cfg.tell * 60 });
        if (st.tells === 1) m.say('toppo', 'Hakai!', 1.4, { style: 'shout' });
      }
      for (const o of st.orbs.slice()) {
        const e = b.frame - o.f0;
        // destruction is not ki: the dark core holds, the shell will not — it trembles between violet and magenta,
        // and a faint warp ring breathes round it
        o.mat.color.setHex(b.frame % 6 < 3 ? HAKAI : 0xd84ae8);
        o.mat.opacity = 0.68 + Math.random() * 0.22;
        if (b.frame % 12 === 0) b.vfx.ring(o.mesh.position.clone(), o.mesh.scale.x * 1.35, 0xff6ad8, 0.14);
        if (o.phase === 'tell') {
          t.invuln = 2;
          const hand = t.chest().add(new V3(0, 1.4 * t.scale, 0));
          o.mesh.position.copy(hand);
          o.mesh.scale.setScalar(0.1 + (e / (cfg.tell * 60)) * cfg.radius);
          if (e % 5 === 0) b.vfx.streamInward(hand, 3, HAKAI, 2, 0.15, 0.3);
          if (e >= cfg.tell * 60) {
            o.phase = 'drift';
            o.f0 = b.frame;
            o.vel.copy(v.chest().sub(hand).normalize().multiplyScalar(cfg.speed));
            t.setState('scripted', { pose: 'tp_hakaiThrow', expression: 'cold', speed: 20, aura: 1 });
            b.after(18, () => {
              if (t.state === 'scripted') t.setState('free');
            });
            b.sfx('kiBlastBig', t, { vol: 0.9, pitch: 0.5 });
          }
          continue;
        }
        // drifting after him, slowly turning to follow
        const want = v.chest().sub(o.mesh.position).normalize().multiplyScalar(cfg.speed);
        o.vel.lerp(want, 0.025);
        o.mesh.position.addScaledVector(o.vel, 1 / 60);
        o.mesh.rotation.y += 0.05;
        if (b.frame % 3 === 0) b.vfx.trail(o.mesh.position.clone(), HAKAI, 0.5, 0.3);
        // a ki blast of his bursts it
        const shot = b.projectiles.list.find((p) => p.alive && p.owner === v && p.pos.distanceTo(o.mesh.position) < cfg.radius + 0.6);
        if (shot) {
          b.projectiles._explode(shot, true);
          st.broken++;
          if (st.broken === 1) m.say('vegeta', 'Hah! Your "destruction" pops like a soap bubble!', 2.4);
          kill(o, true);
          continue;
        }
        // with the evolution, a heavy blow shatters it
        if (opts.shatter && v.state === 'attack' && v.sd && v.sd.kind === 'heavy' && v.chest().distanceTo(o.mesh.position) < cfg.radius + 1.4) {
          st.broken++;
          v.hp = Math.max(1, v.hp - v.hpMax * (cfg.shatterCost || 0));
          b.vfx.flash(o.mesh.position.clone(), 3, 0x6aa8ff, 0.3, SL.Toon.tex.glow);
          b.cameraTraumaAt(v.chest(), 0.5);
          if (st.broken === 1) m.say('vegeta', 'I\'ll break your destruction with my own hands!', 2.4, { style: 'shout' });
          kill(o, true);
          continue;
        }
        // it touches him: erased
        if (v.alive && v.chest().distanceTo(o.mesh.position) < cfg.radius + 0.4 && v.state !== 'vanish' && !(v.state === 'dodge' && v.stateFrame < 10)) {
          st.hits++;
          v.takeHit(t, { type: 'ki', damage: 1, knock: 'crumple', hitstun: 40, impact: 3, dir: o.vel.clone().normalize(), point: v.chest(), pose: 'hitBody', sfx: 'explosionSmall', name: 'Hakai', ultimate: true });
          v.hp = Math.max(1, v.hp - v.hpMax * cfg.erase);
          b.vfx.flash(v.chest(), 3, HAKAI, 0.4, SL.Toon.tex.glow);
          SL.ScreenFX.flash(0.3, '#6a1aa8');
          b.cameraTraumaAt(v.chest(), 0.7);
          if (st.hits === 1) m.say('vegeta', 'Gaaah—! It\'s... erasing me...!', 2.2, { style: 'shout' });
          kill(o, false);
          continue;
        }
        if (b.frame - o.f0 > cfg.life * 60) kill(o, true);
      }
    };
    m.tickHooks.push(hook);
    let done = false;
    const off = () => {
      if (done) return;
      done = true;
      K.unhook(m, hook);
      for (const o of st.orbs.slice()) kill(o, false);
      geo.dispose();
    };
    m.onDispose(off);
    b.hakai = st; // bots read it (tools/mission_brains.js)
    return { off, st };
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, 0);
    const S = m.battle.story;
    K.toForm(S.vegeta, 'base');
    K.toForm(S.toppo, 'base');
    yield* SL.Cinema.play(m, 'top_toppo_open');
  } };

  P.hakai = { id: 'hakai', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, t = S.toppo;
    stage(m, 0);
    K.toForm(v, 'blue');
    K.toForm(t, 'god');
    if (t.setDamage) t.setDamage(3);
    TK().place(m, 'vegeta', SPOT.vegeta, 'toppo');
    TK().place(m, 'toppo', SPOT.toppo, 'vegeta');
    v.hp = v.hpMax;
    v.ki = Math.max(v.ki, v.kiMax * 0.7);
    t.hp = t.hpMax;
    const H = TU.hakai;
    const hk = hakai(m, H);
    m.title(CHAPTER, 'VEGETA VS TOPPO', 'Super Saiyan Blue vs a God of Destruction', 2.4);
    m.music('toppo_destroyer', 2);
    m.objective('hakai', 'Violet spheres erase what they touch — keep moving, or burst them with a ki blast', { icon: 'target' });
    m.objective('ring', 'Stay on the platform', { icon: 'target' });
    const ok = yield* TK().brawl(m, {
      hero: v, foes: [{ f: t, floor: H.floor, dealt: H.dealt, taken: H.taken, ai: { aggression: 0.55, ranged: 0.2 } }],
      until: () => v.hpFrac < H.limit,
    });
    hk.off();
    if (!ok) return;
    m.complete('hakai');
    m.complete('ring');
  } };

  /** "I'm not Kakarot": Super Saiyan Blue Evolution. */
  P.evolution = { id: 'evolution', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, t = S.toppo;
    stage(m, 1);
    K.toForm(v, 'blue');
    K.watcher(t, 'tp_idle', 'cold');
    K.faceTo(t, v.pos);
    K.faceTo(v, t.pos);
    const st = ST(m);
    v.controller = K.scripted();
    v.setState('scripted', { pose: 'v_bentGasp', expression: 'grit' });
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'I am not Kakarot. I don\'t need his road — I\'ll carve my own!', 3.4, { style: 'shout' });
    yield* st.wait(3.4);
    TK().control(m, 'vegeta');
    v.ki = v.kiMax;
    v.setState('free');
    m.objective('evo', 'Your own road: hold Charge', { icon: 'transform' });
    const fw = () => v.forward.clone().setY(0).normalize();
    yield* C.ascend(m, {
      fighter: v, form: 'blueEvo', witness: t, seconds: TU.evolutionHold, dust: false,
      label: 'Hold Charge — Super Saiyan Blue Evolution', meter: 'BLUE EVOLUTION', music: 5,
      beats: [
        { at: 0.5, run: (mm, f) => b.vfx.bolt(f.chest(), 1.4, 0x6aa8ff) },
        { at: 0.8, run: (mm, f) => b.cameraTraumaAt(f.chest(), 0.5) },
      ],
      transform: {
        changeShots: [
          { at: 0, shot: (tt, out) => {
            const c = v.chest();
            out.pos.copy(v.pos).addScaledVector(fw(), 3.4).add(new V3(-1, 0.3, 0));
            out.look.copy(c).add(new V3(0, 0.5, 0));
            out.fov = 52;
          } },
          { at: 0.7, free: true, shot: (tt, out) => {
            const hd = v.headPos();
            out.pos.copy(hd).addScaledVector(fw(), 1.25).add(new V3(-0.2, 0.05, 0));
            out.look.copy(hd);
            out.fov = 40;
          } },
        ],
      },
    });
    m.complete('evo');
    m.lock(true);
    TK().react(m, 'whis', 'Oh my. That is no longer simply Blue. He has found a way of his own.', 3.2);
    yield* st.wait(3.2);
    TK().react(m, 'goku', 'Vegeta... you went past it!', 2.2);
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
  } };

  P.pride = { id: 'pride', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, t = S.toppo;
    stage(m, 2);
    K.toForm(v, 'blueEvo');
    K.toForm(t, 'god');
    if (t.setDamage) t.setDamage(3);
    v.hp = Math.max(v.hp, v.hpMax * 0.7);
    v.ki = Math.max(v.ki, v.kiMax * 0.7);
    t.hp = t.hpMax * TU.hakai.floor;
    if (v.pos.distanceTo(t.pos) > 20) {
      TK().place(m, 'vegeta', SPOT.vegeta, 'toppo');
      TK().place(m, 'toppo', SPOT.toppo, 'vegeta');
    }
    const H = TU.pride;
    const hk = hakai(m, H, { shatter: true });
    m.title(CHAPTER, 'BLUE EVOLUTION', 'Vegeta vs Toppo', 2.2);
    m.music('toppo_destroyer', 3);
    m.objective('pride', 'Break his destruction: a heavy blow now shatters the spheres (it costs you)', { icon: 'fist' });
    const ok = yield* TK().brawl(m, { hero: v, foes: [{ f: t, floor: H.floor, dealt: H.dealt, taken: H.taken, ai: { aggression: 0.65 } }] });
    hk.off();
    if (!ok) return;
    m.complete('pride');
  } };

  /** The last Hakai, and the explosion. */
  P.explosion = { id: 'explosion', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, t = S.toppo, A = b.stage.arena;
    stage(m, 2);
    K.toForm(v, 'blueEvo');
    K.toForm(t, 'god');
    const st = ST(m);
    v.controller = K.scripted();
    t.controller = K.scripted();
    // Toppo near the edge behind him, Vegeta in front
    TK().place(m, 'toppo', [0, -(A.half - 9)], 'vegeta');
    TK().place(m, 'vegeta', [0, -(A.half - 20)], 'toppo');
    t.setState('scripted', { pose: 'tp_hakai', expression: 'cold', aura: 1 });
    v.setState('scripted', { pose: 'v_ffStance', expression: 'grit', aura: 1 });
    // the biggest sphere yet over his palm
    const geo = new THREE.SphereGeometry(1, 28, 18);
    const mat = new THREE.MeshBasicMaterial({ color: HAKAI, transparent: true, opacity: 0.85, depthWrite: false });
    const orb = new THREE.Mesh(geo, mat);
    b.scene.add(orb);
    m.onDispose(() => {
      if (orb.parent) orb.parent.remove(orb);
      geo.dispose();
      mat.dispose();
    });
    let R = 0.5;
    const over = () => t.chest().add(new V3(0, 1.6 * t.scale + R, 0));
    const grow = () => {
      orb.position.copy(over());
      orb.scale.setScalar(R);
      if (b.frame % 3 === 0) b.vfx.streamInward(orb.position, 6 + R, HAKAI, 3, 0.25, 0.4);
    };
    m.tickHooks.push(grow);
    // the owner's still: Vegeta in the foreground, Toppo violet behind the sphere
    m.shot((tt, o) => {
      o.pos.copy(v.chest()).addScaledVector(v.forward, -2.2).add(new V3(-1.1, 0.6, 0));
      o.look.copy(orb.position.clone().lerp(t.chest(), 0.5));
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('toppo', 'This is the end of your pride. DESTROY!', 2.6, { style: 'shout' });
    const t0 = performance.now();
    yield () => {
      R = 0.5 + Math.min(1, (performance.now() - t0) / 1800) * 3.5;
      return R >= 4 || st.skip.on;
    };
    R = 4;
    K.unhook(m, grow);
    // thrown: it rolls over the stone at him — and he walks INTO it
    t.setState('scripted', { pose: 'tp_hakaiThrow', expression: 'cold', speed: 20, aura: 1 });
    const from = orb.position.clone(), to = v.chest().add(new V3(0, 0.5, 0));
    let n = 0;
    yield () => {
      n++;
      orb.position.copy(from.clone().lerp(to, Math.min(1, n / 40)));
      return n >= 40;
    };
    v.setState('scripted', { pose: 'v_finalExplosion', expression: 'shout', speed: 10, aura: 1 });
    m.shot((tt, o) => {
      o.pos.copy(v.chest()).add(new V3(6, 1.5, 4));
      o.look.copy(v.chest());
      o.fov = 48;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('vegeta', 'Erase me? Try it! I\'ll take ALL of it!', 2.4, { style: 'shout' });
    const hold = () => {
      orb.position.copy(v.chest());
      orb.rotation.y += 0.05;
      if (b.frame % 2 === 0) b.vfx.sparks(v.chest(), 0xc8a0ff, 6, 10, 0.1);
      b.camera.trauma = Math.max(b.camera.trauma, 0.25);
    };
    m.tickHooks.push(hold);
    const r1 = yield* m.struggle({
      start: 0.45, drain: 0.16, duration: 7, label: 'ENDURE IT (mash)',
      until: (tt, grip) => grip >= 0.97,
      onTick: (tt, grip) => {
        orb.scale.setScalar(R * (1 - grip * 0.4));
        mat.color.setHex(grip > 0.6 ? 0x6a8aff : HAKAI);
      },
    });
    m.qteParts.push(r1.avg);
    K.unhook(m, hold);
    orb.visible = false;
    // everything he has left, all at once
    m.say('vegeta', 'This is MY pride... TAKE IT!', 2, { style: 'shout' });
    const r2 = yield* st.cue('charge', 'Let it all go (Charge)', { auto: 2.4, slow: 0.4 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    const boom = v.chest();
    SL.ScreenFX.flash(1, '#e8f0ff');
    b.vfx.explosion(boom, 9, 0x6aa8ff, { smoke: true });
    b.vfx.ring(boom, 26, 0x9ac8ff, 0.9, new V3(0, 1, 0));
    b.sfx('explosionHuge', v, { vol: 1.4 });
    b.cameraTraumaAt(boom, 1);
    b.slowmo(0.3, 1);
    b.stage.ringCrack(K.ground(b, v.pos.clone()), 10, 2, null);
    TK().ruin(b, 2);
    // Toppo thrown over the edge into the void
    m.shot((tt, o) => {
      o.pos.set(28, A.y + 10, -(A.half - 6));
      o.look.copy(t.pos);
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* TK().fall(m, t, t.pos.clone().sub(v.pos), { height: 4, ms: 1600 });
    TK().mood(m, 'celebration', ['krillin', 'tien', 'adult_gohan', 'piccolo', 'goku']);
    TK().mood(m, 'frustration', ['jiren', 'dyspo']);
    TK().cheer(m, true);
    SL.Cinema.shotOn(m, S, { subject: 'grandpriest', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* TK().eliminate(m, t, { id: 'toppo' });
    TK().cheer(m, false);
    // the smoke clears: Vegeta is still standing — burned down to base, his armour gone
    K.toForm(v, 'base');
    if (v.setDamage) v.setDamage(3, { burst: true });
    v.setState('scripted', { pose: 'v_bentGasp', expression: 'exhausted', aura: 0 });
    m.shot((tt, o) => {
      o.pos.copy(v.chest()).add(new V3(2.6 - tt * 0.3, 0.2, 3.4));
      o.look.copy(v.chest()).add(new V3(0, 0.3, 0));
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.vfx.dust(v.pos.clone(), 5, 20);
    yield* st.wait(2);
    m.say('vegeta', 'Hah... hah... I am... the Prince of all Saiyans. Don\'t you forget it.', 3.4);
    yield* st.wait(3.4);
    TK().react(m, 'beerus', 'He beat a God of Destruction candidate... and he\'s still on his feet.', 3.2);
    yield* st.wait(3.2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'PRIDE AND DESTRUCTION', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.topToppo = { TU };
  SL.data.missions.top_toppo = {
    id: 'top_toppo', canon: true, chapter: CHAPTER, title: 'Pride and Destruction', character: 'vegeta', stage: 'top_green',
    subtitle: 'The Tournament of Power · Vegeta vs Toppo', parTime: 660, qteLabel: 'The explosion',
    blurb: 'Universe 11\'s leader throws away his justice to become a god of destruction. Vegeta has never cared about justice — only about his pride.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' }, adult_gohan: { outfit: 'ag_ultimate' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { vegeta: SL.data.characters.vegeta.forms.filter((x) => !['base', 'blue', 'blueEvo'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Form: Vegeta — Super Saiyan Blue Evolution', 'Toppo (playable)', 'Form: Toppo — God of Destruction'],
    setup,
    phases: [P.open, P.hakai, P.evolution, P.pride, P.explosion],
  };
})();
