/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 4: "The Legendary Super Saiyan" (the glacier)
 *
 *   WARMUP *   (staged, two cues)  GOKU'S WARM-UP, the owner's twelve beats in order: he watches in his blue jacket;
 *                                  the jacket comes off and is tossed aside; low behind his boots he starts to bounce
 *                                  from foot to foot; the lens arcs round his right side to his front; the shoulders
 *                                  loosen, the wrists shake out, the neck rolls; the eager grin; he stops and drops
 *                                  into the Turtle School stance (wide, low, from his left, Broly's aura beyond him);
 *                                  close on the boot digging into the snow — LAUNCH (Dodge): a ring of snow and ice
 *                                  blown out behind him; the sprint low over the ice; Broly charging the other way;
 *                                  both leap — STRIKE (Light) — and meet in the air; Broly catches the arm and hurls
 *                                  him across the snow. He lands on his feet. The fight is the player's.
 *   BASE *     (play)              base Goku against the Wrathful Broly: quick feet, palm strikes, low kicks, feints
 *                                  (the film's string), and Broly learning all of it until he simply overpowers him —
 *                                  through the ice pillars.
 *   GOLD *     (hold Charge)       Super Saiyan.
 *   SSJ *      (play)              Super Saiyan Goku — Broly catches up again, and again.
 *   GOD *      (hold Charge)       Super Saiyan God: the gold condensing into crimson.
 *   BIND *     (play + technique)  God Goku — and GOD BIND (Special 2): a crimson ring that holds Broly where he is.
 *                                  "You're not a bad guy." His eyes flare; the green pours out of him; the ring
 *                                  breaks like glass; the hand round Goku's face, the drag through the ice, the slam —
 *                                  and Goku on his hands and knees in the snow, back in his base form.
 *   AFTER                          the title; next: "Beyond the Limits".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;

  const GK = {
    baseSeconds: 50, baseMin: 18, baseFloor: 0.5, brolyDealtBase: 0.3,
    ssjSeconds: 45, ssjMin: 16, ssjFloor: 0.42, brolyDealtSsj: 0.32, afterSurpass: 7,
    bindMin: 10, bindAsk: 40, bindFloor: 0.35, brolyDealtGod: 0.26,
    ssjHold: 2.6, godHold: 3.2,
  };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));
  const SPOT = { goku: [20, -24], whis: [23.5, -26.5], vegeta: [12, -34], broly: [-6, 10], paragus: [-10, 18], frieza: [-31, 38], cheelai: [-38, 43], lemo: [-41, 40] };
  // the film's string for Goku in base form: palm strikes, low kicks, a feint
  const FILM_LIGHTS = [
    { id: 'gPalm', startup: 3, active: 3, recovery: 9, cancel: 5, damage: 280, reach: 1.2, radius: 0.72, lunge: 12, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_palmW', strike: 'g_palm' }, sfx: 'punchLight', hitPose: 'hitLight' },
    { id: 'gLowKick', startup: 4, active: 3, recovery: 10, cancel: 6, damage: 300, reach: 1.3, radius: 0.72, lunge: 10, hitstun: 20, knock: 'flinch', impact: 1, pose: { wind: 'g_lowKickW', strike: 'g_lowKick' }, sfx: 'punchLight', hitPose: 'hitBody' },
    { id: 'gFeint', startup: 2, active: 2, recovery: 6, cancel: 3, damage: 120, reach: 1.1, radius: 0.7, lunge: 8, hitstun: 14, knock: 'flinch', impact: 1, pose: { wind: 'g_feintW', strike: 'g_jab' }, sfx: 'punchLight', hitPose: 'hitLight' },
    { id: 'gPalmBoth', startup: 4, active: 3, recovery: 12, cancel: 7, damage: 360, reach: 1.25, radius: 0.78, lunge: 13, hitstun: 24, knock: 'push', knockSpeed: 9, impact: 2, pose: { wind: 'g_palmW', strike: 'g_palmBoth' }, sfx: 'punchHeavy', hitPose: 'hitBody' },
  ];

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at('goku'), startKi: 100 });
    const gokuCoat = b.spawn({ charId: 'goku', team: 0, pos: at('goku'), startKi: 0, wardrobe: { outfit: 'goku_broly_winter', emblem: 'none' } });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at('vegeta'), startKi: 0 });
    const whis = b.spawn({ charId: 'whis', team: 0, pos: at('whis'), startKi: 0 });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: at('broly'), startKi: 100 });
    const paragus = b.spawn({ charId: 'paragus', team: 1, pos: at('paragus'), startKi: 0 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 1, pos: at('cheelai'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 1, pos: at('lemo'), startKi: 0 });
    K.toForm(frieza, 'final');
    K.watcher(gokuCoat, 'g_pockets', 'serious');
    K.watcher(vegeta, 'v_kneelShoulder', 'hurt');
    K.watcher(whis, 'idle', 'calm');
    K.watcher(paragus, 'pg_remote', 'angry');
    K.watcher(frieza, 'fz_watch', 'smirk');
    K.watcher(cheelai, 'ch_watch', 'nervous');
    K.watcher(lemo, 'le_watch', 'calm');
    K.watcher(broly, 'br_wrathIdle', 'angry');
    goku.setHidden(true);
    broly.cannotDie = true;
    goku.cannotDie = true;
    BK.give(broly, 'wrath');
    K.toForm(broly, 'wrath');
    for (const f of [gokuCoat, whis, vegeta, paragus, frieza, cheelai, lemo]) K.faceTo(f, broly.pos);
    b.story = { goku, gokuCoat, vegeta, whis, broly, paragus, frieza, cheelai, lemo };
  }

  /** Everybody in place for the fight (checkpoint restarts start here). */
  function stage(m) {
    const b = m.battle, S = b.story;
    if (!S.gokuCoat.hidden) BK.coat(m, S.gokuCoat, S.goku, 0x2a48c0);
    S.gokuCoat.setHidden(true);
    S.goku.setHidden(false);
    K.place(S.vegeta, BK.at(b, SPOT.vegeta[0], SPOT.vegeta[1]), 0);
    K.watcher(S.vegeta, 'v_kneelShoulder', 'hurt');
    K.place(S.whis, BK.at(b, SPOT.whis[0], SPOT.whis[1]), 0);
    K.faceTo(S.vegeta, S.broly.pos);
    K.faceTo(S.whis, S.broly.pos);
    if (!m.flags.react) {
      m.flags.react = true;
      BK.react(m);
    }
  }

  function arm(m) {
    const b = m.battle, S = b.story, g = S.goku, br = S.broly;
    b.switchPlayer(g, { force: true, quiet: true });
    br.controller = cpu(b);
    br.untargetable = br.intangible = false;
    g.untargetable = g.intangible = false;
    br.target = g;
    g.target = br;
    for (const f of [g, br]) f.setState('free');
  }

  function voices(m) {
    const b = m.battle, S = b.story;
    if (m.flags.voiced) return () => {};
    m.flags.voiced = true;
    const offs = [
      b.on('brolyRead', (e) => {
        if (e.fighter !== S.broly) return;
        m.flags.reads = (m.flags.reads || 0) + 1;
        if (m.flags.reads === 1) m.say('goku', 'Whoa — he caught that! He\'s learning fast!', 2.2);
        else if (m.flags.reads === 3) m.say('whis', 'He is adapting to you as you fight, Goku. Fascinating.', 2.8);
      }),
      b.on('brolyStage', (e) => {
        if (e.fighter !== S.broly) return;
        m.flags.stageAt = b.frame;
        if (e.stage === 3 && !m.flags.surpass) {
          m.flags.surpass = true;
          m.say('goku', 'Ha... he\'s getting stronger every second. This is amazing!', 2.6);
        }
      }),
    ];
    const off = () => offs.forEach((o) => o());
    m.onDispose(off);
    return off;
  }

  /** The two-word lesson in every HUD mode: the string he catches is the one you repeat. */
  function readTip(m) {
    m.prompt('bbVaryGoku', 'light', 'HE LEARNS — feint, mix palms and low kicks, never the same string twice.', { when: () => !!m.flags.reads, until: () => m.flags.reads && m.battle.frame - (m.flags.tipAt || (m.flags.tipAt = m.battle.frame)) > 300 });
  }

  /** A fight phase: returns the floor handle; the caller yields on its end condition. */
  function fight(m, opts) {
    const b = m.battle, S = b.story, g = S.goku, br = S.broly;
    br.legendaryOverride = opts.legendary;
    arm(m);
    const h = m.storyFight({
      floors: [{ f: g, at: opts.floor }, { f: br, at: 0.35 }],
      dealt: [{ f: br, mul: opts.dealt }],
      ease: { foe: br, hero: g, below: 0.7, min: 0.45 },
    });
    voices(m);
    readTip(m);
    return h;
  }

  /** Broly simply overpowers him: the hammer, Goku through the ice pillars into a crater. Skip-safe. */
  function* overpower(m, line) {
    const b = m.battle, S = b.story, g = S.goku, br = S.broly;
    g.controller = K.scripted();
    br.controller = K.scripted();
    K.place(br, BK.at(b, g.pos.x + 2.2, g.pos.z + 1.2), 0);
    K.faceTo(br, g.pos);
    K.faceTo(g, br.pos);
    br.setState('scripted', { pose: 'br_hammerW', expression: 'shout', aura: 1, speed: 16 });
    g.setState('scripted', { pose: 'guard', expression: 'grit' });
    SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* m.cine(0.7);
    br.setState('scripted', { pose: 'br_hammer', expression: 'shout', aura: 1, speed: 30 });
    b.sfx('punchHeavy', g, { pitch: 0.5, vol: 1.4 });
    b.vfx.impact(g.chest(), 4, 0x9affb8);
    b.cameraTraumaAt(g.chest(), 0.8);
    const away = g.pos.clone().sub(br.pos).setY(0).normalize();
    const start = g.pos.clone(), end = start.clone().addScaledVector(away, 30);
    const spires = b.stage.obstacles.filter((o) => {
      if (!o.alive || o.fixture || !o.segs) return false;
      const rel = new V3(o.x - start.x, 0, o.z - start.z), along = rel.dot(away);
      return along > 2 && along < 40 && rel.clone().addScaledVector(away, -along).length() < o.r + 7;
    });
    g.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
    m.shot((t, out) => {
      const sd = new V3(away.z, 0, -away.x);
      out.pos.copy(g.chest()).addScaledVector(sd, 8).addScaledVector(away, -3).add(new V3(0, 1.4, 0));
      out.look.copy(g.chest());
      out.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 28);
      const p = start.clone().lerp(end, 1 - (1 - k) * (1 - k));
      K.place(g, BK.at(b, p.x, p.z, 0.6 + Math.sin(k * Math.PI) * 1.2), g.yaw);
      if (n % 3 === 0) BK.iceBurst(b, g.pos.clone(), 0.5);
      for (const o of spires) if (o.alive && Math.hypot(o.x - g.pos.x, o.z - g.pos.z) < o.r + 2.5) b.stage.destroyPillar(o);
      return k >= 1 || b.skipRequested;
    };
    for (const o of spires) if (o.alive) b.stage.destroyPillar(o, { quiet: true });
    K.place(g, BK.at(b, end.x, end.z), g.yaw);
    b.stage.crater(BK.at(b, end.x, end.z), 4, 1.1, null);
    BK.iceBurst(b, end.clone(), 2);
    g.setState('scripted', { pose: 'getup', expression: 'grit', speed: 6 });
    yield* m.cine(0.8);
    g.setState('scripted', { pose: 'idle', expression: 'grin' });
    SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', line, 2.8);
    yield* m.cine(2.8);
    K.place(br, BK.at(b, g.pos.x - away.x * 9, g.pos.z - away.z * 9), 0);
    K.faceTo(br, g.pos);
    K.faceTo(g, br.pos);
    br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
    m.endShot();
    b.skipRequested = false;
  }

  const P = {};

  /* ======================================================================== THE WARM-UP */
  P.warmup = {
    id: 'warmup',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, gc = S.gokuCoat, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      const cue = function* (key, label, opts) {
        if (skip.on) return { pressed: false, skipped: true };
        const r = yield* m.cue(key, label, opts);
        if (b.skipRequested) skip.on = true;
        return r;
      };
      K.place(br, BK.at(b, SPOT.broly[0], SPOT.broly[1]), 0);
      K.place(gc, BK.at(b, SPOT.goku[0], SPOT.goku[1]), 0);
      K.faceTo(gc, br.pos);
      K.faceTo(br, gc.pos);
      gc.setHidden(false);
      g.setHidden(true);
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      // Broly's green storm in the distance, all the way through
      const storm = () => {
        if (b.disposed || !m.flags.storm) return false;
        if (b.frame % 7 === 0) b.vfx.bolt(br.chest().add(new V3(Math.sin(b.frame) * 0.9, Math.cos(b.frame * 1.3) * 1.1, 0.3)), 1.4, 0x9affb8);
        if (b.frame % 40 === 0) b.vfx.ring(br.chest(), 5, 0x3aff6a, 0.4);
        return true;
      };
      m.flags.storm = true;
      b.onTick(storm);
      m.title(BK.CHAPTER, 'THE LEGENDARY SUPER SAIYAN', 'The glacier · Goku steps in', 3);
      m.music('broly_wrath', 1);
      // 1. he watches, in his blue jacket
      SL.Cinema.shotOn(m, { goku: gc, whis: S.whis }, { subject: 'goku', with: 'whis', focus: 'full' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('whis', 'The prince has had quite enough, I think. Goku?', 2.6);
      yield* wait(2.6);
      SL.Cinema.shotOn(m, { goku: gc }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Yeah. My turn.', 1.8);
      yield* wait(1.8);
      // 2. the jacket off, tossed aside
      BK.coat(m, gc, g, 0x2a48c0);
      g.setState('scripted', { pose: 'v_coatOff', expression: 'grin', speed: 10 });
      b.sfx('clothTear', g, { pitch: 0.7, vol: 0.5 });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* wait(1.4);
      const fw = () => g.forward.clone().setY(0).normalize();
      const rt = () => {
        const d = fw();
        return new V3(-d.z, 0, d.x).negate();
      };
      // 3. low behind his boots: the bounce begins, Broly's aura far beyond him
      g.setState('scripted', { pose: 'g_bounce', expression: 'grin' });
      m.shot((t, out) => {
        out.pos.copy(g.pos).addScaledVector(fw(), -2.3).add(new V3(0, 0.22, 0));
        out.look.copy(g.pos).addScaledVector(fw(), 6).add(new V3(0, 1.6, 0));
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      yield* wait(2.2);
      // 4–5. the lens arcs round his right side to his front; the shoulders, the wrists, the neck
      const th = g.yaw;
      m.shot((t, out, el) => {
        const k = U.easeInOutCubic(Math.min(1, (el || 0) / 2.6));
        const phi = th + Math.PI * (1 + k);
        const c = g.chest();
        out.pos.set(c.x + Math.sin(phi) * 3, c.y + U.lerp(-0.6, 0, k), c.z + Math.cos(phi) * 3);
        out.look.copy(c).add(new V3(0, 0.15, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: g });
      b.after(50, () => {
        if (g.state === 'scripted') g.setState('scripted', { pose: 'g_loosen', expression: 'grin' });
      });
      yield* wait(2.8);
      // 6. the grin
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      g.setState('scripted', { pose: 'g_loosen', expression: 'grin' });
      m.say('goku', 'Heh... he\'s incredible. Okay — let\'s go!', 2);
      yield* wait(1.6);
      // 7. he stops, and drops into the stance: wide and low from his left, the green storm behind
      g.setState('scripted', { pose: 'g_turtleStance', expression: 'determined', speed: 10 });
      b.sfx('groundImpact', g, { vol: 0.4, pitch: 1.4 });
      b.vfx.dust(g.pos.clone(), 1, 8, 0xa6bccf);
      m.shot((t, out) => {
        out.pos.copy(g.pos).addScaledVector(rt(), -3.4).addScaledVector(fw(), -2.6).add(new V3(0, 0.45, 0));
        out.look.copy(g.pos).addScaledVector(fw(), 14).add(new V3(0, 1.4, 0));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      yield* wait(1.8);
      // 8. close on the back boot, dug into the snow
      g.setState('scripted', { pose: 'g_bootDig', expression: 'determined', speed: 8 });
      m.shot((t, out) => {
        const foot = g.pos.clone().addScaledVector(fw(), -0.55).addScaledVector(rt(), -0.18);
        out.pos.copy(foot).addScaledVector(rt(), 1.1).addScaledVector(fw(), -0.4).add(new V3(0, 0.3, 0));
        out.look.copy(foot).add(new V3(0, 0.1, 0));
        out.fov = 40;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      if (b.stage.iceCrack) b.stage.iceCrack(g.pos.clone(), 1.6);
      m.objective('launch', 'Launch', { icon: 'run' });
      const r1 = yield* cue('dodge', 'LAUNCH! (Dodge)', { auto: 2.6, slow: 0.4 });
      m.qteParts.push(r1.pressed || skip.on ? 1 : 0.5);
      m.complete('launch');
      // 9. the launch: a ring of snow and ice blown out behind him
      const back = g.pos.clone();
      b.vfx.ring(back.clone().add(new V3(0, 0.2, 0)), 6, 0xd8ecff, 0.5, new V3(0, 1, 0));
      BK.iceBurst(b, back.clone(), 2.2);
      b.stage.crater(back.clone(), 2.4, 0.5, null);
      for (let i = 0; i < 10; i++) b.vfx.rock(back.clone().add(new V3(0, 0.4, 0)), fw().multiplyScalar(-8 - i).add(new V3((i % 3) - 1, 3 + (i % 4), (i % 2) - 0.5)), 0.2 + (i % 3) * 0.1, 0xe0f0fc);
      b.sfx('dash', g, { pitch: 0.7, vol: 1.2 });
      b.cameraTraumaAt(back, 0.5);
      // 10. the sprint, low over the ice, a wake of powder behind him; 11. Broly comes the other way
      g.setState('scripted', { pose: 'g_sprintLow', expression: 'determined', speed: 14 });
      br.setState('scripted', { pose: 'br_run', expression: 'shout', aura: 1, speed: 12 });
      b.sfx('roar', br, { pitch: 0.65, vol: 1 });
      const gFrom = g.pos.clone(), bFrom = br.pos.clone();
      const meet = gFrom.clone().lerp(bFrom, 0.55);
      m.shot((t, out) => {
        const d = fw(), sd = rt();
        out.pos.copy(g.pos).addScaledVector(sd, 2.6).addScaledVector(d, 1.4).add(new V3(0, 0.35, 0));
        out.look.copy(g.chest()).addScaledVector(d, 3);
        out.fov = 58;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 54);
        const gp = gFrom.clone().lerp(meet, k), bp = bFrom.clone().lerp(meet, k * 0.95);
        K.place(g, BK.at(b, gp.x, gp.z), g.yaw);
        K.place(br, BK.at(b, bp.x, bp.z), br.yaw);
        if (n % 2 === 0) b.vfx.dust(g.pos.clone().addScaledVector(fw(), -0.6), 0.7, 3, 0xd8e8f4);
        if (n % 3 === 0) BK.iceBurst(b, br.pos.clone(), 0.25);
        return k >= 0.8 || skip.on;
      };
      // 12. both leap, and meet in the air — STRIKE
      g.setState('scripted', { pose: 'punchWindR', expression: 'shout' });
      br.setState('scripted', { pose: 'br_hayW', expression: 'shout', aura: 1 });
      const air = meet.clone().add(new V3(0, 5, 0));
      const gU = g.pos.clone(), bU = br.pos.clone();
      m.shot((t, out) => {
        const mid = g.chest().lerp(br.chest(), 0.5), d = br.chest().sub(g.chest()).setY(0).normalize(), sd = new V3(d.z, 0, -d.x);
        out.pos.copy(mid).addScaledVector(sd, 7).add(new V3(0, -1.6, 0));
        out.look.copy(mid);
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 20);
        const dir = br.pos.clone().sub(g.pos).setY(0).normalize();
        g.setPosition(gU.clone().lerp(air.clone().addScaledVector(dir, -1.2), k));
        br.setPosition(bU.clone().lerp(air.clone().addScaledVector(dir, 1.3), k));
        g.grounded = br.grounded = false;
        return k >= 1 || skip.on;
      };
      m.objective('strike', 'Strike', { icon: 'fist' });
      const r2 = yield* cue('light', 'STRIKE! (Light)', { auto: 1.6, slow: 0.25 });
      m.qteParts.push(r2.pressed || skip.on ? 1 : 0.5);
      m.complete('strike');
      g.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 30 });
      br.setState('scripted', { pose: 'br_hay', expression: 'shout', aura: 1, speed: 30 });
      const hitAt = g.chest().lerp(br.chest(), 0.5);
      b.vfx.impact(hitAt, 5, 0xe8fff0);
      b.vfx.ring(hitAt, 8, 0x9affb8, 0.5);
      b.vfx.ring(hitAt, 6, 0xffffff, 0.4, new V3(0, 1, 0));
      b.sfx('punchHeavy', null, { at: hitAt, pitch: 0.55, vol: 1.5 });
      b.slowmo(0.25, 0.6);
      b.cameraTraumaAt(hitAt, 0.9);
      yield* wait(0.7);
      // the catch: the big hand on his arm, and the throw across the snow
      br.setState('scripted', { pose: 'br_catch', expression: 'shout', aura: 1 });
      g.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      yield* wait(0.4);
      br.setState('scripted', { pose: 'br_back', expression: 'shout', aura: 1, speed: 24 });
      const throwDir = g.pos.clone().sub(br.pos).setY(0).normalize();
      const t0 = g.pos.clone(), t1 = BK.at(b, t0.x + throwDir.x * 24, t0.z + throwDir.z * 24);
      g.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 26);
        const p = t0.clone().lerp(t1, k);
        p.y = U.lerp(t0.y, t1.y, k) + Math.sin(k * Math.PI) * 2.5;
        g.setPosition(p);
        return k >= 1 || skip.on;
      };
      // he skids on his boots and comes up on them
      K.place(g, t1, g.yaw);
      K.faceTo(g, br.pos);
      g.setState('scripted', { pose: 'g_bootDig', expression: 'grin', speed: 10 });
      n = 0;
      yield () => {
        n++;
        if (n % 2 === 0) b.vfx.dust(g.pos.clone(), 0.8, 3, 0xd8e8f4);
        K.place(g, g.pos.clone().addScaledVector(throwDir, 0.12 * (1 - n / 24)), g.yaw);
        return n >= 24 || skip.on;
      };
      K.place(br, BK.at(b, br.pos.x, br.pos.z), br.yaw);
      // the end state, watched or skipped
      m.flags.storm = false;
      gc.setHidden(true);
      g.setHidden(false);
      if (g.pos.distanceTo(br.pos) > 30) K.place(br, BK.at(b, g.pos.x - throwDir.x * 12, g.pos.z - throwDir.z * 12), 0);
      K.faceTo(g, br.pos);
      K.faceTo(br, g.pos);
      g.setState('free');
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.base = {
    id: 'base',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      if (g.formIndex !== 0) g.applyForm(0);
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      BK.eyes(br, 1);
      if (!m.flags.placed) {
        m.flags.placed = true;
        if (g.pos.distanceTo(br.pos) > 26) K.place(br, BK.at(b, g.pos.x - 10, g.pos.z + 8), 0);
      }
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 60);
      br.hp = br.hpMax;
      g.movesOverride = { light: FILM_LIGHTS };
      const h = fight(m, { floor: GK.baseFloor, dealt: GK.brolyDealtBase, legendary: { stageCap: 3, learnAt: 3 } });
      m.music('broly_wrath', 2);
      m.title(BK.CHAPTER, 'GOKU', 'Base form · quick, light, testing him', 2.4);
      m.objective('base', 'Test the Wrathful Broly — fast feet, feints, palms and low kicks', { icon: 'fist' });
      m.objective('mix', 'Land every move of your string', { icon: 'fist', optional: true, target: FILM_LIGHTS.length });
      const landed = new Set();
      const offD = b.on('damage', (e) => {
        if (e.attacker !== g || e.target !== br || !g.sd || !g.sd.move) return;
        if (FILM_LIGHTS.some((x) => x.id === g.sd.move.id) && !landed.has(g.sd.move.id)) {
          landed.add(g.sd.move.id);
          m.progress('mix', landed.size);
        }
      });
      m.onDispose(offD);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (h.floored(g) && t > GK.baseMin) || t > GK.baseSeconds || m.state !== 'running';
      K.unhook(m, clock);
      offD();
      g.movesOverride = null;
      if (m.state !== 'running') return;
      m.complete('base');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      yield* overpower(m, 'Okay... base form isn\'t going to cut it. Time to get serious!');
    },
  };

  P.gold = {
    id: 'gold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      if (g.formIndex !== 0) g.applyForm(0);
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      g.ki = g.kiMax;
      g.setState('free');
      b.switchPlayer(g, { force: true, quiet: true });
      m.objective('gold', 'Super Saiyan: hold Charge', { icon: 'transform' });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      g.auraViewCap = 0.3;
      yield* C.ascend(m, {
        fighter: g, form: 'ssj', witness: br, seconds: GK.ssjHold,
        label: 'Hold Charge — Super Saiyan', meter: 'SUPER SAIYAN', music: 2, dust: false,
        transform: { onFrame: (fr, burstAt) => {
          g.auraViewCap = fr < burstAt * 0.86 ? 0.3 : null;
          if (fr % 22 === 0 && fr > 20 && fr < burstAt && b.stage.iceCrack) b.stage.iceCrack(g.pos.clone(), 1.5 + (fr / burstAt) * 3);
          if (fr === burstAt) BK.iceBurst(b, g.pos.clone(), 2);
        } },
      });
      g.auraViewCap = null;
      m.complete('gold');
      m.endShot();
    },
  };

  P.ssj = {
    id: 'ssj',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      K.toForm(g, 'ssj');
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      g.hp = Math.max(g.hp, g.hpMax * 0.85);
      g.ki = Math.max(g.ki, g.kiMax * 0.7);
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      br.mech.xp = 0;
      br.mech.stage = 0;
      const h = fight(m, { floor: GK.ssjFloor, dealt: GK.brolyDealtSsj, legendary: { stageCap: 3, learnAt: 2, gain: 1.6 } });
      m.music('broly_wrath', 3);
      m.title(BK.CHAPTER, 'SUPER SAIYAN', 'Goku', 2.2);
      m.objective('ssj', 'Hold your own against him', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (h.floored(g) && t > GK.ssjMin) || t > GK.ssjSeconds || (br.mech.stage >= 3 && b.frame - (m.flags.stageAt || b.frame) > GK.afterSurpass * 60) || m.state !== 'running';
      K.unhook(m, clock);
      if (m.state !== 'running') return;
      m.complete('ssj');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      yield* overpower(m, 'He\'s already past a Super Saiyan... Then how about THIS?');
    },
  };

  P.god = {
    id: 'god',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      K.toForm(g, 'ssj');
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      g.ki = g.kiMax;
      g.setState('free');
      b.switchPlayer(g, { force: true, quiet: true });
      m.objective('god', 'Super Saiyan God: hold Charge', { icon: 'transform' });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      g.auraViewCap = 0.3;
      const gold = new THREE.Color(0xffc81e), red = new THREE.Color(0xff2a48);
      const fw = () => g.forward.clone().setY(0).normalize();
      yield* C.ascend(m, {
        fighter: g, form: 'god', witness: br, seconds: GK.godHold,
        label: 'Hold Charge — Super Saiyan God', meter: 'SUPER SAIYAN GOD', music: 2, dust: false,
        transform: {
          changeShots: [
            { at: 0, free: true, shot: (t, out) => {
              const hd = g.headPos();
              out.pos.copy(hd).addScaledVector(fw(), 1.0).add(new V3(0, -0.1, 0));
              out.look.copy(hd).add(new V3(0, 0.04, 0));
              out.fov = 38;
            } },
            { at: 0.35, shot: (t, out) => {
              const c = g.chest(), a = g.yaw + 0.5 + t * 0.6;
              out.pos.set(c.x + Math.sin(a) * 4.2, c.y + 0.3, c.z + Math.cos(a) * 4.2);
              out.look.copy(c).add(new V3(0, 0.25, 0));
              out.fov = 44;
            } },
            { at: 0.8, free: true, shot: (t, out) => {
              const hd = g.headPos();
              out.pos.copy(hd).addScaledVector(fw(), 1.3).add(new V3(0, 0.2, 0));
              out.look.copy(hd).add(new V3(0, 0.15, 0));
              out.fov = 40;
            } },
          ],
          onFrame: (fr, burstAt) => {
            g.auraViewCap = fr < burstAt ? 0.45 : null;
            const k = U.clamp01((fr - 30) / Math.max(1, burstAt - 30));
            if (g.aura && g.aura.color) g.aura.color.copy(gold).lerp(red, k);
            if (fr >= 60 && fr % 5 === 0) b.vfx.streamInward(g.chest(), 2.2 + (1 - k) * 2, k > 0.5 ? 0xff4a3a : 0xffc84a, 3, 0.12, 0.4);
            if (fr === burstAt) b.vfx.ring(g.pos.clone().add(new V3(0, 0.2, 0)), 9, 0xff3a4a, 0.6, new V3(0, 1, 0));
          },
        },
      });
      g.auraViewCap = null;
      m.complete('god');
      m.endShot();
    },
  };

  /** The God Bind, as a slot the player presses (Special 2 in this stretch). */
  function bindSpec(g) {
    const x = (g.def.extras || []).find((e) => e.id === 'godBind');
    return Object.assign({}, x, { fatigue: undefined, modes: undefined, shimmer: false, escapeKiCost: undefined, followWindow: undefined, kiCost: 20 });
  }

  P.bind = {
    id: 'bind',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      K.toForm(g, 'god');
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      g.hp = Math.max(g.hp, g.hpMax * 0.8);
      g.ki = g.kiMax;
      br.hp = Math.max(br.hp, br.hpMax * 0.7);
      g.specOverrides = Object.assign({}, g.specOverrides || {}, { special2: bindSpec(g) });
      const h = fight(m, { floor: GK.bindFloor, dealt: GK.brolyDealtGod, legendary: { stageCap: 2, learnAt: 3 } });
      m.music('ssj_god', 2);
      m.title(BK.CHAPTER, 'SUPER SAIYAN GOD', 'Goku · a god\'s calm', 2.2);
      m.objective('god', 'Fight him with a god\'s calm', { icon: 'fist' });
      let bound = null;
      const offB = b.on('godBind', (e) => {
        if (e.fighter === g && e.victim === br) bound = e;
      });
      m.onDispose(offB);
      let t = 0, asked = false;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
        if (!asked && t > GK.bindMin) {
          asked = true;
          m.complete('god');
          m.objective('bind', 'GOD BIND: hold him with Special 2', { icon: 'guard' });
          m.prompt('bbGodBind', 'special2', 'God Bind — Special 2: a crimson ring holds him where he is', { required: true, always: true, when: () => g.state === 'free' && g.distTo(br) < 14, until: () => !!bound });
          m.say('goku', 'Hold still a second — I want to talk to you!', 2.4);
        }
      };
      m.tickHooks.push(clock);
      m.lock(false);
      b.aiLocked = false;
      yield () => bound || t > GK.bindAsk + GK.bindMin || m.state !== 'running';
      K.unhook(m, clock);
      offB();
      if (m.state !== 'running') return;
      // nobody is stuck: the story binds him if the player has not
      if (!bound) {
        K.place(g, BK.at(b, br.pos.x + 6, br.pos.z + 4), 0);
        K.faceTo(g, br.pos);
        g.setState('free');
        g.target = br;
        SL.Techniques.godBind.start(g, bindSpec(g), 'special2', 0);
        yield () => g.state !== 'godBind' || g.sd.bound;
      }
      m.complete('bind');
      m.lock(true);
      b.aiLocked = true;
      // the story holds the ring for as long as it talks
      if (g.state === 'godBind' && g.sd) g.sd.spec = Object.assign({}, g.sd.spec, { holdFrames: 99999 });
      if (br.state === 'held' && br.sd) br.sd.frames = 99999;
      g.infiniteKi = true;
      m.onDispose(() => (g.infiniteKi = false));
      g.specOverrides = Object.assign({}, g.specOverrides || {}, { special2: undefined });
      delete g.specOverrides.special2;
      // the bind holds; Goku talks to him
      br.controller = K.scripted();
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'medium', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(1.2);
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Listen — you\'re not a bad guy. I can tell. Stop this!', 3);
      yield* m.cine(3);
      // the eyes flare, the green pours out of him, the ring breaks like glass
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'closeup', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      b.sfx('heartbeat', br, { vol: 1 });
      b.sfx('growl', br, { pitch: 0.5, vol: 1 });
      let surge = 0;
      b.onTick(() => {
        if (b.disposed || ++surge > 70) return false;
        if (surge % 4 === 0) b.vfx.bolt(br.chest().add(new V3(Math.sin(surge) * 0.8, Math.cos(surge * 1.3), 0.2)), 1.2, 0x9affb8);
        if (surge % 10 === 0) b.vfx.ring(br.chest(), 2 + surge / 10, 0x3aff6a, 0.35);
        return true;
      });
      yield* m.cine(1.2);
      if (g.state === 'godBind') SL.Techniques.godBind.shatter(g);
      g.infiniteKi = false;
      b.vfx.ring(br.chest(), 9, 0x5aff8a, 0.6);
      SL.ScreenFX.flash(0.2, '#8aff9a');
      b.sfx('roar', br, { pitch: 0.55, vol: 1.4 });
      b.cameraTraumaAt(br.chest(), 0.8);
      br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', aura: 1 });
      SL.Cinema.shotOn(m, { goku: g, broly: br }, { subject: 'broly', with: 'goku', focus: 'full' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(1);
      // the hand round his face; the drag through the ice; the slam
      g.controller = K.scripted();
      br.setState('scripted', { pose: 'br_liftW', expression: 'shout', aura: 1 });
      g.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      const hold = () => {
        const hd = br.handPos ? br.handPos('R') : br.chest();
        g.setPosition(hd.clone().add(new V3(0, -1.25, 0)).addScaledVector(br.forward, 0.35));
        g.vel.set(0, 0, 0);
        g.grounded = false;
      };
      K.place(br, BK.at(b, g.pos.x - 1.6, g.pos.z - 1), 0);
      K.faceTo(br, g.pos);
      hold();
      const dir = br.forward.clone().setY(0).normalize();
      const from = br.pos.clone(), to = from.clone().addScaledVector(dir, 34);
      const spires = b.stage.obstacles.filter((o) => o.alive && !o.fixture && o.segs && Math.hypot(o.x - (from.x + to.x) / 2, o.z - (from.z + to.z) / 2) < 26);
      m.shot((tt, out) => {
        const sd = new V3(dir.z, 0, -dir.x);
        out.pos.copy(br.chest()).addScaledVector(sd, 8).addScaledVector(dir, 3).add(new V3(0, 0.4, 0));
        out.look.copy(br.chest().lerp(g.chest(), 0.5));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 44);
        K.place(br, BK.at(b, U.lerp(from.x, to.x, k), U.lerp(from.z, to.z, k)), br.yaw);
        hold();
        if (n % 3 === 0) BK.iceBurst(b, g.pos.clone(), 0.9);
        for (const o of spires) if (o.alive && Math.hypot(o.x - g.pos.x, o.z - g.pos.z) < o.r + 3) b.stage.destroyPillar(o);
        if (n % 8 === 0) b.camera.addTrauma(0.12);
        return k >= 1 || b.skipRequested;
      };
      br.setState('scripted', { pose: 'br_slam', expression: 'shout', aura: 1 });
      const hit = br.pos.clone().addScaledVector(br.forward, 1.6);
      K.place(g, BK.at(b, hit.x, hit.z), g.yaw);
      if (g.formIndex !== 0) g.applyForm(0);
      b.stage.crater(BK.at(b, hit.x, hit.z), 4.5, 1.5, null);
      BK.iceBurst(b, hit, 2.4);
      b.sfx('groundImpact', null, { at: hit, vol: 1.5 });
      b.cameraTraumaAt(hit, 0.9);
      g.hp = Math.max(1, g.hpMax * 0.15);
      g.setState('scripted', { pose: 'g_kneesSnow', expression: 'exhausted' });
      yield* m.cine(1.2);
      // on his hands and knees in the snow, breathing hard
      m.shot((tt, out) => {
        out.pos.copy(g.pos).addScaledVector(g.forward, 2.2).add(new V3(0.6, 0.3, 0));
        out.look.copy(g.chest());
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('goku', 'Hah... hah... he\'s... unbelievable...', 2.6, { style: 'quiet' });
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'THE LEGENDARY SUPER SAIYAN', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_goku',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'The Legendary Super Saiyan',
    subtitle: 'Part 4 · The glacier',
    character: 'goku',
    stage: 'broly_glacier',
    parTime: 560,
    lockForms: BK.LOCKS,
    qteLabel: 'The warm-up',
    rules: { allowTransform: true, allowUltimates: true },
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    blurb: 'The jacket comes off. Goku warms up like a boy before a match, grins, and walks into the fight of his life — base, Super Saiyan, God, and a bind that should hold anybody.',
    rewards: ['Movie: The Legendary Super Saiyan', 'Goku: God Bind'],
    setup,
    phases: [P.warmup, P.base, P.gold, P.ssj, P.god, P.bind, P.after],
  };

  SL.data.bbGoku = { GK, FILM_LIGHTS };
  SL.data.missions[def.id] = def;
})();
