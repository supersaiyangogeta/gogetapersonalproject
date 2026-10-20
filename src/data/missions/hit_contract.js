/*
 * CHAPTER 20 · THE ASSASSIN — "The Contract" (Goku vs Hit, again: the assassination and the revival).
 * Tournament of power ui.docx §3B: Goku picks a remote place so nobody nearby gets hurt; Hit lands his nearly invisible
 * assassination strike; Goku collapses and his friends arrive too late; the energy attack Goku fired high into the air
 * before the fight comes back down and restarts his heart; he gets up and fights on, understanding Hit's attack better.
 * The doc's rule: the player fires the orb WITHOUT knowing why, loses the first exchange, and gets the payoff when the
 * projectile returns — a gameplay reveal, not a text box.
 *
 *   OPEN *     (scene hc_open)  night in empty rock country; Hit steps out of a violet seam in the air: a contract
 *   SIGNAL     (cue)            "warming up": the player fires a ki blast straight up into the clouds (Blast)
 *   DUEL *     (play)           Blue Goku vs Hit, who is serious now: the half-second skip (u6_kit timeSkip: the
 *                               evasion, the tell, the vital strike, the read) and the TIME CAGE — a violet cube drawn
 *                               round the spot you stand on (move out before it closes); caught, you are frozen inside
 *                               it until you break it (mash Charge) or it crushes you. KO = defeat (retry)
 *   KILL       (staged)         the strike nobody sees: no colour, no sound, a ripple through Goku's chest; he falls;
 *                               "Contract fulfilled" — Hit leaves through the seam
 *   FRIENDS    (staged)         Krillin and Gohan land beside him: no heartbeat. Silence. Then a light falls out of
 *                               the clouds — the blast — into his chest; the heart starts; Goku sits up
 *   REMATCH *  (play)           Hit comes back. Goku understands it now: the read window is wider, a press inside the
 *                               stopped time counters; the cages come faster. Ends on Hit's floor
 *   END        (staged)         Goku catches the vital strike inside the skip; Hit: the contract was to kill him once,
 *                               and it has been done; he leaves. Krillin: "You DIED!"
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 20 · THE ASSASSIN';
  const VIOLET = 0xb070ff;
  // TUNING
  const TU = {
    duel: { gap: 200, floor: 0.6, seconds: 55, hitDealt: 0.18, hitTaken: 0.45, tu: { tell: 0.85, readWindow: 0.42, vital: 4600, skipJab: 560, strikeEvery: 5, firstStrike: 2, appear: 5, swing: 24, resume: 30 } },
    rematch: { gap: 220, floor: 0.35, hitDealt: 0.18, hitTaken: 0.55, tu: { tell: 0.85, readWindow: 0.6, vital: 4600, skipJab: 560, strikeEvery: 4.4, firstStrike: 2.4, appear: 5, swing: 24, resume: 30, breakFrom: 6, counter: 1700 } },
    // the Time Cage: seconds between cages, the tell, the cube's half-size, presses to break it, seconds before it crushes
    cage: { every: 9, everyRematch: 6.5, tell: 1.0, half: 1.3, presses: 6, crush: 3.6, crushDamage: 0.09 },
  };
  const SPOT = { goku: [0, 4], hit: [0, -6], seam: [0, -7.5], friends: [6, 10] };
  const at = (b, k, lift) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift || 0);

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: at(b, 'goku'), startKi: 80 });
    S.goku._playerController = S.goku.controller;
    S.hit = b.spawn({ charId: 'hit', team: 1, pos: at(b, 'hit'), startKi: 60 });
    S.krillin = b.spawn({ charId: 'krillin', team: 0, pos: at(b, 'friends'), startKi: 0 });
    S.gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: at(b, 'friends').add(new V3(1.5, 0, 0)), startKi: 0 });
    for (const f of Object.values(S)) f.cannotDie = true;
    for (const f of [S.krillin, S.gohan]) {
      K.watcher(f, 'idle', 'serious');
      f.setHidden(true);
      f.untargetable = true;
    }
    K.watcher(S.hit, 'ht_pockets', 'cold');
    K.faceTo(S.goku, S.hit.pos);
    K.faceTo(S.hit, S.goku.pos);
    // the time-skip kit works on b.u6: who stands against Hit
    b.u6 = { a: 'goku', c: 'hit' };
    return S;
  }

  /* =================================================================== THE SEAM (Hit's way in and out) */
  function seam(b, pos, open) {
    const c = pos.clone().add(new V3(0, 1.2, 0));
    b.vfx.flash(c, open ? 2.6 : 2, VIOLET, 0.4, SL.Toon.tex.glow);
    b.vfx.ring(c, 1.8, VIOLET, 0.35);
    b.vfx.slash(c.clone().add(new V3(0, 1.1, 0)), c.clone().add(new V3(0, -1.1, 0)), 0xd8b0ff, 0.2, 0.4);
    b.sfx('portalOpen', null, { at: c, vol: 0.8 });
  }

  /* =================================================================== THE SCENE */
  SL.data.scenes.hc_open = {
    id: 'hc_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      // wide over the rock pillars at night, down to the one small figure waiting among them
      {
        cam: { from: [26, 18, 34], to: [12, 6, 18], look: [0, 3, 0], look2: [0, 1.4, 2], fov: 52, fov2: 46, ease: 'inOut', raw: true },
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'serious' }],
        title: { chapter: CHAPTER, title: 'THE CONTRACT', subtitle: 'Somewhere nobody else can get hurt', duration: 4 },
        hold: 4.2,
      },
      {
        call: (ctx) => {
          const h = ctx.cast.hit;
          h.setHidden(false);
          seam(ctx.b, h.pos.clone(), true);
        },
        pose: [{ who: 'hit', pose: 'ht_step', face: 'cold' }],
        cam: { subject: 'hit', focus: 'full', angle: 'front' },
        hold: 2,
      },
      {
        cam: { subject: 'hit', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'hit', pose: 'ht_pockets', face: 'cold' }],
        say: { who: 'hit', line: 'I have been paid to end your life, Son Goku.', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Yeah, I figured it was something like that. That\'s why I picked a place out here — nobody else gets hurt.', duration: 4.2 },
        hold: 4.3,
      },
      {
        cam: { subject: 'goku', with: 'hit', focus: 'full', angle: 'side' },
        say: { who: 'goku', line: 'Just gimme a second to warm up first!', duration: 2.6 },
        hold: 2.7,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, at(b, 'goku'), Math.PI);
      K.place(S.hit, at(b, 'hit'), 0);
      S.hit.setHidden(false);
    },
  };

  /* =================================================================== THE TIME CAGE */
  /**
   * Every so often Hit lifts one hand and a violet cube is drawn round the place you stand: move out of it before it
   * closes. Caught, you are frozen inside it (Fighter.freeze) — mash Charge to break it, or it crushes you. Returns
   * { off(), st }.
   */
  function timeCage(m, every) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    const C = TU.cage;
    const st = { t: 0, next: every * 0.6, phase: null, f0: 0, at: null, presses: 0, caught: 0, broken: 0, mesh: null, edges: null, chargeWas: false };
    const geo = new THREE.BoxGeometry(C.half * 2, C.half * 2.2, C.half * 2);
    const mat = new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0, depthWrite: false });
    const eg = new THREE.EdgesGeometry(geo);
    const em = new THREE.LineBasicMaterial({ color: 0xe0c8ff, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(eg, em);
    mesh.add(edges);
    mesh.visible = false;
    b.scene.add(mesh);
    const show = (pos, a, e) => {
      mesh.visible = a > 0.01 || e > 0.01;
      mesh.position.copy(pos).add(new V3(0, C.half * 1.1, 0));
      mat.opacity = a;
      em.opacity = e;
    };
    const release = (crushed) => {
      g.freeze = 0;
      st.phase = null;
      st.t = 0;
      st.next = every * U.rand(0.85, 1.15);
      b.vfx.explosion(mesh.position.clone(), 0.8, VIOLET, { smoke: false });
      b.sfx(crushed ? 'punchHeavy' : 'warpShatter', g, { vol: 1 });
      show(mesh.position.clone().sub(new V3(0, C.half * 1.1, 0)), 0, 0);
      if (crushed) {
        g.takeHit(h, { type: 'melee', damage: Math.round(g.hpMax * C.crushDamage), knock: 'crumple', hitstun: 40, impact: 3, dir: new V3(0, -1, 0), point: g.chest(), pose: 'hitBody', sfx: 'punchHeavy', name: 'Time Cage' });
      } else {
        st.broken++;
        SL.ScreenFX.flash(0.25, '#e8d8ff');
        b.vfx.ring(g.chest(), 3, 0x8ad8ff, 0.4);
        if (st.broken === 1) m.say('goku', 'Hah! A box isn\'t gonna hold me!', 2.2, { style: 'shout' });
      }
      if (h.state === 'scripted') h.setState('free');
    };
    const hook = () => {
      if (b.inputLocked) return;
      // the cage never starts while the skip is busy
      const busy = b.u6Hit && (b.u6Hit.phase || b.u6Hit.evadeAt >= 0);
      if (!st.phase) {
        st.t += 1 / 60;
        if (st.t < st.next || busy || !['free', 'guard', 'recover', 'dash'].includes(h.state) || !g.alive || g.state === 'knockdown') return;
        st.phase = 'tell';
        st.f0 = b.frame;
        st.at = g.pos.clone();
        st.at.y = b.stage.heightAt(st.at.x, st.at.z);
        h.setState('scripted', { pose: 'ht_jabW', expression: 'cold', speed: 12 });
        K.faceTo(h, st.at);
        b.emit('telegraph', { pos: st.at.clone(), radius: C.half * 1.2, frames: C.tell * 60 });
        b.sfx('portalOpen', null, { at: st.at, vol: 0.6, pitch: 1.4 });
        if (!st.caught && !st.broken) m.say(S.gohan.hidden ? 'goku' : 'gohan', S.gohan.hidden ? "The air around me — it's closing in!" : 'Dad, the air around you — move!', 2);
        return;
      }
      const e = b.frame - st.f0;
      if (st.phase === 'tell') {
        h.invuln = 2;
        const k = U.clamp01(e / (C.tell * 60));
        show(st.at, 0.04 + k * 0.1, 0.25 + k * 0.7);
        mesh.scale.setScalar(1.6 - k * 0.6);
        if (e < C.tell * 60) return;
        mesh.scale.setScalar(1);
        const d = Math.hypot(g.pos.x - st.at.x, g.pos.z - st.at.z);
        if (d > C.half * 1.15 || g.state === 'vanish' || g.hidden) {
          // he got out: the cube closes on nothing and shatters
          b.vfx.explosion(st.at.clone().add(new V3(0, C.half, 0)), 0.6, VIOLET, { smoke: false });
          b.sfx('warpShatter', null, { at: st.at, vol: 0.7 });
          show(st.at, 0, 0);
          st.phase = null;
          st.t = 0;
          st.next = every * U.rand(0.85, 1.15);
          h.setState('free');
          return;
        }
        // caught
        st.phase = 'caught';
        st.f0 = b.frame;
        st.caught++;
        st.presses = 0;
        st.chargeWas = true;
        g.freeze = 9999;
        g.vel.set(0, 0, 0);
        show(g.pos.clone().setY(st.at.y), 0.22, 1);
        b.sfx('timeWarp', g, { vol: 0.8, pitch: 1.2 });
        h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 10 });
        m.prompt('hc_cage', 'charge', 'Break the cage — mash Charge', { required: true, until: () => st.phase !== 'caught' });
        if (st.caught === 1) m.say('hit', 'A pocket of time that belongs to me. You cannot move in it.', 2.8);
        return;
      }
      if (st.phase === 'caught') {
        h.invuln = 2;
        const ch = !!(g.intent && (g.intent.charge || g.intent.chargeHeld));
        if (ch && !st.chargeWas) {
          st.presses++;
          b.vfx.flash(g.chest(), 0.8 + st.presses * 0.15, 0x8ad8ff, 0.15, SL.Toon.tex.glow);
          b.sfx('kiUp', g, { pitch: 0.8 + st.presses * 0.08, vol: 0.5 });
          mesh.scale.setScalar(1 + st.presses * 0.03);
          b.camera.addTrauma(0.05);
        }
        st.chargeWas = ch;
        em.opacity = 1 - st.presses / (C.presses * 1.4);
        if (st.presses >= C.presses) return release(false);
        if (e >= C.crush * 60) return release(true);
      }
    };
    m.tickHooks.push(hook);
    let done = false;
    const off = () => {
      if (done) return;
      done = true;
      K.unhook(m, hook);
      if (st.phase === 'caught') g.freeze = 0;
      if (m.prompts && m.prompts.has('hc_cage')) {
        m.prompts.delete('hc_cage');
        b.emit('prompt', { id: 'hc_cage', show: false });
      }
      if (mesh.parent) mesh.parent.remove(mesh);
      geo.dispose();
      mat.dispose();
      eg.dispose();
      em.dispose();
    };
    m.onDispose(off);
    b.hcCage = st; // bots read it (tools/mission_brains.js)
    return { off, st };
  }

  /* =================================================================== THE PHASES */
  function stage(m) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    UK().tint(0);
    UK().stopWorld(S, 0);
    BK.give(S.goku, 'blue');
    S.hit.setHidden(false);
  }

  /** The fight in the open: Goku against the skip and the cage. Ends on Hit's floor or opts.seconds. */
  function* duel(m, cfg, opts) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    g.cannotDie = false; // a knockout is a real defeat here
    h.cannotDie = true;
    g.untargetable = g.intangible = h.untargetable = h.intangible = false;
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    g.target = h;
    h.target = g;
    h.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, h.def.ai, { aggression: 0.45, defense: 0.7 }) });
    g.setState('free');
    h.setState('free');
    const sf = m.storyFight({
      floors: [{ f: h, at: cfg.floor }], dealt: [{ f: h, mul: cfg.hitDealt }], taken: [{ f: h, mul: cfg.hitTaken }],
      ease: { foe: h, hero: g, below: 0.4, min: 0.5 }, fighters: [g, h], space: 'ground',
    });
    const ts = UK().timeSkip(m, { gap: cfg.gap, strike: true, insist: true, tu: cfg.tu, lines: opts.lines, breakFree: opts.breakFree });
    const cage = timeCage(m, opts.cageEvery);
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    let t = 0;
    const clock = () => {
      if (!b.inputLocked) t += 1 / 60;
    };
    m.tickHooks.push(clock);
    yield () => sf.floored(h) || (opts.seconds && t >= opts.seconds) || m.state !== 'running';
    K.unhook(m, clock);
    cage.off();
    ts.off();
    sf.off();
    g.cannotDie = true;
    m.flags.caught = (m.flags.caught || 0) + cage.st.caught;
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    return m.state === 'running';
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m);
    const S = m.battle.story;
    K.toForm(S.goku, 'base');
    S.hit.setHidden(true);
    yield* SL.Cinema.play(m, 'hc_open');
  } };

  /** "Warming up": the blast into the sky (the player does not know why). */
  P.signal = { id: 'signal', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m);
    K.toForm(g, 'base');
    const st = UK().staged(m);
    g.controller = K.scripted();
    K.place(g, at(b, 'goku'), Math.PI);
    K.place(h, at(b, 'hit'), 0);
    K.faceTo(g, h.pos);
    K.watcher(h, 'ht_pockets', 'cold');
    K.faceTo(h, g.pos);
    g.setState('scripted', { pose: 'blastWind', expression: 'grin', speed: 10 });
    m.shot((t, o) => {
      const c = g.chest();
      o.pos.copy(c).add(new V3(2.4, -0.6, 2.6));
      o.look.copy(c).add(new V3(0, 2.4, 0));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const r = yield* st.cue('blast', 'Warm up — a ki blast straight up into the sky (Blast)', { auto: 4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    g.setState('scripted', { pose: 'blastR', expression: 'grin', speed: 30 });
    b.sfx('kiBlastBig', g, { vol: 1 });
    // the ball climbs until the clouds swallow it
    const from = g.chest().add(new V3(0, 0.6, 0));
    const t0 = performance.now();
    m.shot((t, o, el) => {
      const c = g.chest();
      o.pos.copy(c).add(new V3(3.5, 0.2, 3.5));
      o.look.copy(c).add(new V3(0, 6 + el * 30, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield () => {
      const k = (performance.now() - t0) / 1600;
      const p = from.clone().add(new V3(0, k * 120, 0));
      b.vfx.flash(p, 1.2, 0xfff0a0, 0.08, SL.Toon.tex.glow);
      b.vfx.trail(p, 0xffe27a, 0.5, 0.3);
      return k >= 1 || st.skip.on;
    };
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin', speed: 8 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Okay! All warmed up.', 2);
    yield* st.wait(2);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', '...A wasted shot.', 1.8);
    yield* st.wait(1.8);
    // Blue, at once
    K.toForm(g, 'blue');
    b.vfx.ring(g.pos.clone().add(new V3(0, 0.1, 0)), 7, 0x3ac8ff, 0.5, new V3(0, 1, 0));
    b.vfx.flash(g.chest(), 2.4, 0x8ae0ff, 0.35, SL.Toon.tex.glow);
    b.sfx('transformBurst', g, { vol: 0.9 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.2);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The fight in the open, the one he does not win. */
  P.duel = { id: 'duel', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m);
    K.toForm(g, 'blue');
    K.place(g, at(b, 'goku'), Math.PI);
    K.place(h, at(b, 'hit'), 0);
    g.hp = g.hpMax;
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    h.hp = h.hpMax;
    m.music('battle', 3);
    m.title(CHAPTER, 'THE CONTRACT', 'Super Saiyan Blue Goku vs Hit', 2.4);
    m.objective('duel', 'Fight the assassin — read the skip, and get out of the violet cube before it closes', { icon: 'fist' });
    m.objective('cage', 'Caught in the cage? Mash Charge to break it', { icon: 'target' });
    const ok = yield* duel(m, TU.duel, {
      cageEvery: TU.cage.every, seconds: TU.duel.seconds,
      lines: {
        tell1: ['goku', 'There it is — that stillness again!', 2.2],
        strike1: ['goku', 'Gh...! He\'s gotten even sharper since the tournament!', 2.6],
        read1: ['goku', 'Heh! I remember this one!', 2],
        evade1: ['hit', 'Too slow.', 1.4],
      },
    });
    if (!ok) return;
    m.complete('duel');
    m.complete('cage');
  } };

  /** The strike nobody sees. */
  P.kill = { id: 'kill', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m);
    K.toForm(g, 'blue');
    const st = UK().staged(m);
    g.controller = K.scripted();
    h.controller = K.scripted();
    const c = K.ground(b, new V3(U.clamp(g.pos.x, -14, 14), 0, U.clamp(g.pos.z, -14, 14)));
    K.place(g, c, Math.PI);
    K.place(h, K.ground(b, c.clone().add(new V3(0, 0, -5))), 0);
    K.faceTo(g, h.pos);
    K.faceTo(h, g.pos);
    g.setState('scripted', { pose: 'g_godStance', expression: 'grin', aura: 1 });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'hit', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Okay, Hit — let\'s get serious!', 2.2, { style: 'shout' });
    yield* st.wait(2);
    g.setState('scripted', { pose: 'g_flyingKnee', expression: 'shout', speed: 24, aura: 1 });
    b.sfx('dash', g, { vol: 1.1 });
    // NOTHING: no colour, no sound. A single frame and Hit is past him.
    m.music(null, 0);
    b.sfxSilenced = true;
    yield* st.wait(0.25);
    const behind = K.ground(b, g.pos.clone().add(new V3(0, 0, 2.2)));
    K.place(h, behind, Math.PI);
    K.faceTo(h, g.pos);
    h.setState('scripted', { pose: 'ht_vital', expression: 'cold', speed: 60 });
    b.vfx.ring(g.chest(), 0.7, 0xe8e0ff, 0.25);
    m.shot((t, o) => {
      const cc = g.chest();
      o.pos.copy(cc).add(new V3(1.6, 0.25, -0.4));
      o.look.copy(cc);
      o.fov = 36;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.9);
    b.sfxSilenced = false;
    // the ripple through his chest, a single dull heartbeat — and nothing after it
    b.sfx('heartbeat', g, { vol: 1.2, pitch: 0.6 });
    b.vfx.ring(g.chest(), 1.6, 0xd8d0ff, 0.5);
    g.setState('scripted', { pose: 'pierced', expression: 'shock', speed: 20, aura: 0 });
    K.toForm(g, 'base');
    yield* st.wait(1.1);
    g.setState('scripted', { pose: 'knockdownFace', expression: 'ko', speed: 6, aura: 0 });
    b.vfx.dust(g.pos.clone(), 1, 8);
    b.sfx('groundImpact', g, { vol: 0.6 });
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 6 });
    yield* st.wait(1.4);
    m.say('hit', 'The contract is fulfilled.', 2.4);
    yield* st.wait(2.4);
    seam(b, h.pos.clone(), false);
    h.setHidden(true);
    yield* st.wait(0.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Too late — and then the light comes down. */
  P.friends = { id: 'friends', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit, kr = S.krillin, gh = S.gohan;
    stage(m);
    h.setHidden(true);
    K.toForm(g, 'base');
    const st = UK().staged(m);
    g.controller = K.scripted();
    g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
    // they land beside him
    for (const [f, off] of [[kr, new V3(-1.2, 0, 1.6)], [gh, new V3(1.2, 0, 1.4)]]) {
      f.setHidden(false);
      f.untargetable = true;
      K.place(f, K.ground(b, g.pos.clone().add(off)), 0);
      K.faceTo(f, g.pos);
      b.vfx.dust(f.pos.clone(), 0.8, 6);
    }
    kr.setState('scripted', { pose: 'kneelGrieve', expression: 'shock' });
    gh.setState('scripted', { pose: 'kneelGrieve', expression: 'shock' });
    m.shot((t, o, el) => {
      const c = g.pos.clone().add(new V3(0, 0.3, 0));
      o.pos.copy(c).add(new V3(-2.6, 2.2 + el * 0.1, 3.6));
      o.look.copy(c);
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('gohan', 'Dad! DAD!', 1.8, { style: 'shout' });
    yield* st.wait(1.8);
    m.say('krillin', 'His heart... Gohan, it isn\'t beating.', 2.8);
    yield* st.wait(2.8);
    SL.Cinema.shotOn(m, S, { subject: 'gohan', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('gohan', 'No... not like this. Not to an assassin in the middle of nowhere!', 3.2);
    yield* st.wait(3.4);
    // silence — then a light falling out of the clouds
    m.music(null, 0);
    m.shot((t, o, el) => {
      const c = g.pos.clone();
      o.pos.copy(c).add(new V3(4, 0.6, 4));
      o.look.copy(c).add(new V3(0, 12 + el * 2, 0));
      o.fov = 56;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('krillin', 'Wait — what\'s that? Up there!', 2);
    const top = g.chest().add(new V3(0, 90, 0));
    const t0 = performance.now();
    b.sfx('kiBlastBig', null, { at: g.pos, vol: 0.6, pitch: 0.7 });
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 2200);
      const p = top.clone().lerp(g.chest(), k * k);
      b.vfx.flash(p, 1.4 + k, 0xfff0a0, 0.08, SL.Toon.tex.glow);
      b.vfx.trail(p, 0xffe27a, 0.6, 0.35);
      return k >= 1 || st.skip.on;
    };
    // into his chest: the jolt
    SL.ScreenFX.flash(0.6, '#fff6d0');
    b.vfx.impact(g.chest(), 3, 0xfff0a0);
    b.vfx.ring(g.chest(), 3, 0xffe27a, 0.45);
    b.sfx('explosionSmall', g, { vol: 1 });
    b.cameraTraumaAt(g.chest(), 0.6);
    g.setState('scripted', { pose: 'hitBack', expression: 'shock', speed: 30 });
    yield* st.wait(0.5);
    b.sfx('heartbeat', g, { vol: 1.2 });
    yield* st.wait(0.6);
    b.sfx('heartbeat', g, { vol: 1.2, pitch: 1.1 });
    g.setState('scripted', { pose: 'getup', expression: 'hurt', speed: 6 });
    m.shot((t, o) => {
      const hd = g.headPos ? g.headPos() : g.chest();
      o.pos.copy(hd).add(new V3(1.4, 0.2, 1.6));
      o.look.copy(hd);
      o.fov = 42;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('goku', '*cough*... Whew! It worked!', 2.2);
    yield* st.wait(2.2);
    m.music('battle', 2);
    g.setState('scripted', { pose: 'stand', expression: 'grin', speed: 6 });
    SL.Cinema.shotOn(m, S, { subject: 'gohan', with: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    kr.setState('scripted', { pose: 'stand', expression: 'shock', speed: 6 });
    gh.setState('scripted', { pose: 'stand', expression: 'shock', speed: 6 });
    m.say('gohan', 'Dad?!', 1.4, { style: 'shout' });
    yield* st.wait(1.4);
    m.say('goku', 'That blast I fired before the fight — I set it to come back down and hit me in the chest. In case he stopped my heart.', 4.6);
    yield* st.wait(4.6);
    m.say('krillin', 'You planned on DYING?!', 2, { style: 'shout' });
    yield* st.wait(2);
    // and he is back: Hit steps out of the seam again
    h.setHidden(false);
    K.place(h, K.ground(b, g.pos.clone().add(new V3(0, 0, -6))), 0);
    K.faceTo(h, g.pos);
    K.faceTo(g, h.pos);
    seam(b, h.pos.clone(), true);
    h.setState('scripted', { pose: 'ht_pockets', expression: 'shock' });
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'Your heart stopped. I felt it.', 2.4);
    yield* st.wait(2.4);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Yep! And now I know what your attack is. Let\'s go again!', 2.8);
    yield* st.wait(2.8);
    for (const f of [kr, gh]) {
      K.place(f, K.ground(b, g.pos.clone().add(new V3(f === kr ? -9 : -11, 0, 8))), 0);
      K.watcher(f, 'stand', 'serious');
      K.faceTo(f, g.pos);
    }
    m.endShot();
    b.skipRequested = false;
  } };

  /** The rematch: he understands it now. */
  P.rematch = { id: 'rematch', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m);
    for (const f of [S.krillin, S.gohan]) {
      f.setHidden(false);
      K.watcher(f, 'stand', 'serious');
    }
    K.toForm(g, 'blue');
    g.hp = Math.max(g.hp, g.hpMax * 0.85);
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    h.hp = Math.min(h.hp, h.hpMax * TU.duel.floor);
    K.place(h, K.ground(b, g.pos.clone().add(new V3(0, 0, -6))), 0);
    K.faceTo(g, h.pos);
    K.faceTo(h, g.pos);
    m.music('battle', 4);
    m.title(CHAPTER, 'THE REMATCH', 'Now Goku knows what is coming', 2.4);
    m.objective('rematch', 'Beat him — read the skip, strike inside the stopped time, break the cages', { icon: 'fist' });
    const ok = yield* duel(m, TU.rematch, {
      cageEvery: TU.cage.everyRematch,
      breakFree: { pose: 'punchR', name: 'Inside the Skip', color: 0x8ad8ff },
      lines: {
        tell1: ['krillin', 'Here it comes again, Goku!', 2],
        break1: ['goku', 'There you are!', 1.8, { style: 'shout' }],
        break2: ['hit', 'He keeps adapting... just like at the tournament.', 2.6],
        read1: ['gohan', 'He\'s reading it — he\'s really reading it!', 2.4],
        strike1: ['goku', 'Ngh — not twice in one night!', 2.2],
      },
    });
    if (!ok) return;
    m.complete('rematch');
  } };

  /** He catches it — and the contract is over. */
  P.end = { id: 'end', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m);
    K.toForm(g, 'blue');
    const st = UK().staged(m);
    g.controller = K.scripted();
    h.controller = K.scripted();
    K.place(h, K.ground(b, g.pos.clone().add(new V3(0, 0, -4.5))), 0);
    K.faceTo(g, h.pos);
    K.faceTo(h, g.pos);
    g.setState('scripted', { pose: 'g_godStance', expression: 'determined', aura: 1 });
    h.setState('scripted', { pose: 'ht_vitalW', expression: 'determined' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'hit', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1);
    // the skip — and inside it, Goku's hand closes on his wrist
    UK().stopWorld(S, 99999);
    UK().tint(1);
    b.sfx('timeWarp', h, { vol: 1, pitch: 0.8 });
    const to = K.ground(b, g.pos.clone().add(new V3(0.9, 0, 0.4)));
    K.place(h, to, h.yaw);
    K.faceTo(h, g.pos);
    h.setState('scripted', { pose: 'ht_vital', expression: 'determined', speed: 40 });
    yield* st.wait(0.5);
    UK().stopWorld(S, 0);
    UK().tint(0);
    K.faceTo(g, h.pos);
    g.setState('scripted', { pose: 'grab', expression: 'grin', speed: 40, aura: 1 });
    SL.ScreenFX.flash(0.3, '#d8f0ff');
    b.vfx.ring(h.chest(), 1.8, 0x8ad8ff, 0.4);
    b.sfx('block', g, { vol: 1.2, pitch: 0.7 });
    m.shot((t, o) => {
      const mid = g.chest().lerp(h.chest(), 0.5);
      o.pos.copy(mid).add(new V3(1.8, 0.3, 2.2));
      o.look.copy(mid);
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('goku', 'Got you.', 1.6);
    yield* st.wait(1.8);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', '...My contract was to kill you once. I did. It is fulfilled.', 3.4);
    yield* st.wait(3.4);
    K.toForm(g, 'base');
    g.setState('scripted', { pose: 'g_handsHips', expression: 'shock', speed: 8 });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 8 });
    K.place(h, K.ground(b, g.pos.clone().add(new V3(0, 0, -3.5))), 0);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Aw, come on! We were just getting good!', 2.4);
    yield* st.wait(2.4);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'Then we will meet again. Without a contract.', 2.6);
    yield* st.wait(2.6);
    seam(b, h.pos.clone(), false);
    h.setHidden(true);
    yield* st.wait(0.8);
    SL.Cinema.shotOn(m, S, { subject: 'krillin', with: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.krillin, 'stand', 'angry');
    m.say('krillin', 'Goku, you DIED tonight! Doesn\'t that bother you even a little?!', 3, { style: 'shout' });
    yield* st.wait(3);
    m.say('goku', 'Eh... I got better!', 2);
    yield* st.wait(2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'THE CONTRACT · FULFILLED', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.hitContract = { TU };
  SL.data.missions.hit_contract = {
    id: 'hit_contract', canon: true, chapter: CHAPTER, title: 'The Contract', character: 'goku', stage: 'night_wastes',
    subtitle: 'Goku vs Hit · the assassination', parTime: 600, qteLabel: 'The signal',
    blurb: 'Someone has paid the universe\'s best assassin to kill Son Goku. Goku chooses the battlefield — and fires one blast into the sky before it starts.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Hit\'s contract on Goku is fulfilled — and Goku is still here'],
    setup,
    phases: [P.open, P.signal, P.duel, P.kill, P.friends, P.rematch, P.end],
  };
})();
