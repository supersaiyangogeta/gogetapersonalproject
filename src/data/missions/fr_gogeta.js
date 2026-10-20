/*
 * MOVIE: FUSION REBORN (not canon) — mission 7 of 7: "Gogeta"
 *
 *   PIKKON *   (play + scene)   PIKKON'S STAND: in Janemba's face, the insults cracking the armour; then on the
 *                               open field, played as Pikkon — the blows land, chip the plate and do nothing;
 *                               he changes tactics and holds him off (block, evade) while Janemba stops playing
 *                               (the blade, the Phantom Shift, the Dimension Slash, the claw); then his defeat,
 *                               staged: the kick into empty air, the demon behind him, the blocked cut, the
 *                               broken guard and the crash across the field, the Thunder Flash swallowed by one
 *                               portal and poured into his back out of another. Down, alive, he warns Goku.
 *   DANCE *    (rhythm)         THE SECOND FUSION DANCE — the last chance, with Janemba coming across the field
 *                               behind them: every beat in time (Light), a pulse of the same light on both of
 *                               them at every matched step. Miss one and Janemba's blade comes between them —
 *                               again. The last beat: their hands, slow — both index fingers straight.
 *   BIRTH      (scene)          a column of gold and every colour into the warped sky; a silhouette in the
 *                               light; the light thins until the vest and the face show; he steps out of it:
 *                               "I am not Goku or Vegeta! I am Gogeta!"
 *   DOMINATE * (cues + play)    Janemba comes at him with the sword, faster and faster: EVADE on each swing —
 *                               a lean, half a step, nothing more. CATCH THE BLADE between two fingers; a flick,
 *                               and it shatters into cubes. Then the fight is yours: SUPER SAIYAN GOGETA against
 *                               an unarmed Janemba who cannot keep up (his tricks no longer work on Gogeta; key
 *                               blows land in slow motion).
 *   FINISH     (cues + hold)    the combination on three cues; then the STARDUST BREAKER in seven shots
 *                               (breaker() below): the low-angle reveal; hold Special 2 and the right arm goes
 *                               up, deep space behind him, a translucent sphere of every colour grows over his
 *                               palm; let go, and he tosses it. It is not an explosion: it is light running through
 *                               Janemba until the evil leaves him as glittering dust, and the young ogre drops
 *                               out of it onto the pastel ground, terrified.
 *   FAREWELL   (scene)          the fusion runs out; the world puts itself right; "Vegeta, thanks." — the
 *                               body fades into gold — "Goodbye, my friend."
 *   AFTER                       FUSION REBORN — the end. The movie is marked complete; Gogeta joins the roster.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;

  // charge: seconds of holding Special 2 from an empty hand to the full orb (it drives shots B..F);
  // orbR: the full orb's radius (m); releaseAuto: a full orb held this long throws itself
  const GG = { beat: 0.82, window: 0.2, perfect: 0.075, assistAfter: 2, assistWindow: 0.3, maxTries: 4, swings: 5, floor: 0.15, jbDealt: 0.15, ggDealt: 1.25, throwAuto: 14, charge: 5.4, orbR: 0.3, releaseAuto: 5 };
  // PIKKON'S STAND: blows — landed blows before he sees they do nothing (or blowsMax seconds); hold — seconds he
  // holds out once Janemba hits back; stages — seconds into the hold when the Dimension Slash, then the claw join
  // in; floor — his health floor (reaching it ends the stand early); taken — the share of a blow Janemba takes;
  // dealt — Janemba's damage, by stage
  const PK = { blows: 6, blowsMax: 22, hold: 24, stages: [8, 16], floor: 0.3, taken: 0.04, dealt: [0.26, 0.33, 0.4] };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  /** THE LIGHT COLUMN: gold and every colour, up into the warped sky, thinning away over `seconds`. */
  function column(b, at, r = 2.6, seconds = 3.2) {
    const g = new THREE.Group();
    const mk = (rad, color, op) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 1.2, 140, 24, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      m.position.y = 70;
      g.add(m);
      return m;
    };
    const outer = mk(r, 0xffd040, 0.45), inner = mk(r * 0.45, 0xfff8e0, 0.8);
    g.position.copy(at);
    b.scene.add(g);
    const total = seconds * 60;
    let n = 0;
    b.onTick(() => {
      if (b.disposed) return false;
      n++;
      const k = n / total;
      const fade = k < 0.15 ? k / 0.15 : 1 - Math.max(0, k - 0.5) / 0.5;
      outer.material.opacity = 0.45 * fade;
      inner.material.opacity = 0.8 * fade;
      // it narrows as it fades, so by the silhouette shot the lens is outside it (never a gold screen)
      const s = (1 + Math.sin(n * 0.3) * 0.04) * (1 - 0.75 * Math.min(1, k / 0.5));
      outer.scale.set(s, 1, s);
      inner.scale.set(s, 1, s);
      if (n % 3 === 0) {
        const c = SL.Dimension.PRISM[n % SL.Dimension.PRISM.length];
        b.vfx.ring(at.clone().add(new V3(0, (n * 0.6) % 40, 0)), r * 1.6, c, 0.5, new V3(0, 1, 0));
        b.vfx.sparks(at.clone().add(new V3(0, 1 + (n % 9), 0)), c, 6, 9, 0.12);
      }
      if (n >= total) {
        b.scene.remove(g);
        for (const m of [outer, inner]) {
          m.geometry.dispose();
          m.material.dispose();
        }
        return false;
      }
      return true;
    });
  }

  function setup(battle) {
    const b = battle;
    FR.warped(b);
    const hide = FR.lm(b, 'spikeBehind');
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: FR.at(b, hide.x - 1.7, hide.z), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: FR.at(b, hide.x + 1.7, hide.z), startKi: 100 });
    const sj = b.spawn({ charId: 'super_janemba', team: 1, pos: FR.at(b, hide.x + 20, hide.z + 20), startKi: 100 });
    const saike = b.spawn({ charId: 'saike_oni', team: 0, pos: FR.at(b, hide.x + 30, hide.z + 30), startKi: 0 });
    const yemma = b.spawn({ charId: 'king_yemma', team: 0, pos: FR.lm(b, 'yemma'), startKi: 0 });
    const pikkon = b.spawn({ charId: 'pikkon', team: 0, pos: FR.at(b, hide.x - 20, hide.z + 24), startKi: 100 });
    K.watcher(pikkon, 'pk_idle', 'determined');
    pikkon.setHidden(true);
    FR.halo(b, pikkon);
    yemma.noCollide = true;
    K.watcher(yemma, 'ye_worry', 'shock');
    yemma.yaw = yemma.prevYaw = 0;
    K.watcher(vegeta, 'idle', 'angry');
    K.watcher(sj, 'sj_idle', 'wicked');
    K.watcher(saike, 'so_sit', 'shock');
    saike.setHidden(true);
    sj.cannotDie = true;
    sj.setHidden(true);
    FR.halo(b, goku);
    FR.halo(b, vegeta);
    b.story = { goku, vegeta, sj, saike, yemma, pikkon, gogeta: null, fusion: null };
  }

  /** Out from behind the spiked rock into the open, where the light has room (and the lens a clear view). */
  function lineUp(b) {
    const S = b.story, hide = FR.lm(b, 'spikeBehind');
    const at = (dx) => FR.at(b, hide.x - 6 + dx, hide.z - 7);
    K.place(S.goku, at(-1.7), Math.PI);
    K.place(S.vegeta, at(1.7), Math.PI);
    for (const f of [S.goku, S.vegeta]) {
      f.setHidden(false);
      f.intangible = true;
      f.untargetable = true;
      f.controller = K.scripted();
      f.setState('scripted', { pose: f === S.goku ? 'fd_stepBR' : 'fd_stepB', expression: 'determined' });
      f.yaw = f.prevYaw = Math.PI;
      if (f.formIndex !== 0) f.applyForm(0);
    }
    return { at };
  }

  /**
   * PIKKON ARRIVES: Janemba hangs over them with the sword out — and Pikkon is in his face, shouting him
   * down; every insult lands like a blow and the armour cracks and chips (FR.chip); "Catch me if you can!"
   * and the two of them are gone across the sky toward the open field.
   */
  function* pikkonArrives(m) {
    const b = m.battle, S = b.story, sj = S.sj, pk = S.pikkon;
    const { at } = lineUp(b);
    const mid = at(0);
    sj.setHidden(false);
    sj.controller = K.scripted();
    if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
    K.hover(b, sj, mid.clone().add(new V3(5, 0, 7)), 5.5);
    K.faceTo(sj, mid);
    sj.setState('scripted', { pose: 'sj_overheadW', expression: 'wicked', speed: 8 });
    pk.setHidden(false);
    pk.controller = K.scripted();
    K.hover(b, pk, sj.pos.clone().add(new V3(-3.4, 0, 2.2)), 5.5);
    K.faceTo(pk, sj.pos);
    pk.setState('scripted', { pose: 'pk_point', expression: 'shout', speed: 10 });
    // the two of them in the air, the dancers small on the ground under them
    m.shot((t, out, el) => {
      const c = sj.chest().lerp(pk.chest(), 0.5);
      out.pos.copy(c).add(new V3(-1.2 - el * 0.15, -1.1, -5.2));
      out.look.copy(c).add(new V3(0, -0.3, 0));
      out.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const insults = [
      'Janemba! Up here, you overgrown nightmare! Look at me when I talk to you!',
      'You call that armour? It\'s cracking like a cheap candy shell!',
      'Nothing but borrowed evil in a bad costume — come on, show me what\'s underneath!',
    ];
    for (const [i, line] of insults.entries()) {
      m.say('pikkon', line, 2.6, { style: 'shout' });
      yield* m.cine(1.5);
      // the words land like blows: the plate cracks and chips
      const p = FR.chip(b, sj, i, { big: i === 2 });
      sj.setState('scripted', { pose: i === 2 ? 'sj_roar' : 'hitBody', expression: i === 2 ? 'angry' : 'hurt', speed: 20 });
      b.cameraTraumaAt(p, 0.2);
      yield* m.cine(1.1);
    }
    // he turns on Pikkon; the two of them are gone across the sky, toward the open field
    m.say('pikkon', 'That\'s it — this way! Catch me if you can!', 2, { style: 'shout' });
    K.faceTo(sj, pk.pos);
    let n = 0;
    const off = FR.lm(b, 'field').sub(pk.pos).setY(0).normalize().multiplyScalar(14).add(new V3(0, 4, 0));
    const p0 = pk.pos.clone(), s0 = sj.pos.clone();
    const away = () => {
      n++;
      const k = Math.min(1, n / 50), e = k * k;
      pk.setPosition(p0.clone().addScaledVector(off, e));
      sj.setPosition(s0.clone().addScaledVector(off, Math.max(0, e - 0.08)));
    };
    m.tickHooks.push(away);
    K.faceTo(pk, p0.clone().add(off));
    pk.setState('scripted', { pose: 'flyForward', expression: 'determined', speed: 10 });
    sj.setState('scripted', { pose: 'sj_float', expression: 'angry', speed: 10 });
    b.sfx('dash', pk, { vol: 0.7 });
    yield* m.cine(1);
    K.unhook(m, away);
  }

  /**
   * PIKKON'S STAND (played as Pikkon): on the open field he goes at Janemba with everything — and the blows
   * land, chip the armour, and do nothing (story armour: no flinch; he takes a sliver of the damage). After
   * PK.blows landed blows (or PK.blowsMax seconds) Pikkon sees it and changes tactics: hold him here, block
   * and evade, for PK.hold seconds, while Janemba stops playing — the blade, then the Phantom Shift, the
   * Dimension Slash, the claw through a portal, harder at each stage. Pikkon cannot be killed (a floor at
   * PK.floor: reaching it ends the stand early) and the Thunder Flash is held back for the defeat.
   */
  function* pikkonStand(m) {
    const b = m.battle, S = b.story, sj = S.sj, pk = S.pikkon;
    const fd = FR.lm(b, 'field');
    K.place(pk, FR.at(b, fd.x - 3, fd.z), 0);
    K.place(sj, FR.at(b, fd.x + 3, fd.z), 0);
    K.faceTo(pk, sj.pos);
    K.faceTo(sj, pk.pos);
    for (const f of [pk, sj]) {
      f.setHidden(false);
      f.untargetable = false;
      f.intangible = false;
    }
    pk.hp = pk.hpMax;
    pk.ki = pk.kiMax;
    pk.cannotDie = true;
    b.switchPlayer(pk, { force: true, quiet: true });
    // the Thunder Flash is his last card (the defeat plays it)
    pk.lockedSlots = { ultimate: true };
    sj.target = pk;
    pk.target = sj;
    // he is not even fighting back: he stands in it, turns to keep Pikkon in front of him, follows him
    // when he backs off — the blows land on the armour and he barely moves
    sj.controller = K.scripted();
    sj.storyArmor = 3;
    // no tricks yet either (the Phantom Shift would answer a repeated blow)
    sj.dimensionOverride = { doors: false };
    sj.damageDealtMul = PK.dealt[0];
    sj.setState('scripted', { pose: 'sj_idle', expression: 'wicked', speed: 6 });
    const toy = () => {
      if (b.inputLocked || sj.state !== 'scripted') return;
      const d = pk.pos.clone().sub(sj.pos).setY(0);
      const dist = d.length();
      if (dist > 0.01) sj.yaw = sj.prevYaw = U.dampAngle(sj.yaw, Math.atan2(d.x, d.z), 6, 1 / 60);
      if (dist > 3.2) {
        const p = sj.pos.clone().addScaledVector(d.normalize(), 3.4 / 60);
        p.y = Math.max(p.y, FR.at(b, p.x, p.z).y);
        sj.setPosition(p);
      }
    };
    m.tickHooks.push(toy);
    const fight = m.storyFight({ floors: [{ f: pk, at: PK.floor }], taken: [{ f: sj, mul: PK.taken }] });
    // the armour never breaks his stance (poise kept full): the blows land, the plate chips, that is all
    const keepPoise = () => {
      if (sj.poise) sj.poise.value = sj.def.poise.max;
    };
    m.tickHooks.push(keepPoise);
    let blows = 0, chips = 3, lastChip = -99;
    const offA = b.on('armored', (e) => {
      if (e.fighter !== sj || e.attacker !== pk) return;
      blows++;
      m.progress('blows', blows);
      const heavy = (e.hit.impact || 1) >= 2 || e.hit.type === 'ki';
      // every blow shows on the plate; a heavy one (and no more than one a third of a second) takes a chip out
      if (heavy && b.frame - lastChip > 20) {
        lastChip = b.frame;
        FR.chip(b, sj, chips++, { big: (e.hit.impact || 1) >= 3 });
      } else b.vfx.sparks(e.hit.point || sj.chest(), 0xe8d8ff, 5, 4, 0.06);
      if (blows % 3 === 0) b.sfx('giggle', sj, { pitch: 0.8, vol: 0.5 });
    });
    let blocks = 0;
    const offB = b.on('damage', (e) => {
      if (e.target === pk && e.blocked) blocks++;
    });
    m.onDispose(offA);
    m.onDispose(offB);
    m.title(FR.CHAPTER, 'PIKKON\'S STAND', 'Pikkon · buy them the time', 3);
    m.music('super_janemba', 2);
    m.objective('blows', 'Hit Janemba with everything', { icon: 'fist', target: PK.blows });
    m.lock(false);
    b.aiLocked = false;
    pk.setState('free');
    sj.setState('free');
    let t = 0, holding = false, shown = 0;
    const clock = () => {
      if (b.inputLocked) return;
      t += 1 / 60;
      if (holding && Math.floor(t) > shown) m.progress('hold', (shown = Math.floor(t)));
    };
    m.tickHooks.push(clock);
    yield () => blows >= PK.blows || t >= PK.blowsMax || fight.floored(pk) || m.state !== 'running';
    if (m.state !== 'running') return;
    m.complete('blows');
    m.flags.pikkonBlows = blows;
    // he sees it: the blows land and nothing happens. A breath of it, and he changes tactics
    K.unhook(m, toy);
    if (!fight.floored(pk)) {
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      for (const f of [pk, sj]) f.vel.set(0, 0, 0);
      pk.controller = K.scripted();
      // the two of them a few paces apart; the lens off Pikkon's nose to the side, Janemba past his shoulder
      const c = pk.pos.clone().lerp(sj.pos, 0.5), ln = sj.pos.clone().sub(pk.pos).setY(0);
      if (ln.lengthSq() < 0.01) ln.set(1, 0, 0);
      ln.normalize();
      K.place(pk, FR.at(b, c.x - ln.x * 1.7, c.z - ln.z * 1.7), 0);
      K.place(sj, FR.at(b, c.x + ln.x * 1.7, c.z + ln.z * 1.7), 0);
      pk.setState('scripted', { pose: 'guard', expression: 'shock', speed: 10 });
      sj.setState('scripted', { pose: 'sj_present', expression: 'wicked', speed: 8 });
      K.faceTo(pk, sj.pos);
      K.faceTo(sj, pk.pos);
      const sd = new V3(ln.z, 0, -ln.x);
      // over the demon's shoulder: his armour and horn at the edge, Pikkon's face as it sinks in
      m.shot((tt, out) => {
        out.pos.copy(sj.headPos()).addScaledVector(ln, 0.9).addScaledVector(sd, 0.55).add(new V3(0, 0.05, 0));
        out.look.copy(pk.headPos()).add(new V3(0, -0.15, 0));
        out.fov = 32;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.sfx('giggle', sj, { pitch: 0.7, vol: 0.7 });
      m.say('pikkon', 'Nothing... My best blows, and he barely feels them.', 2.4, { style: 'quiet' });
      yield* m.cine(2.2);
      pk.setState('scripted', { pose: 'guard', expression: 'determined', speed: 10 });
      m.say('pikkon', 'Then I won\'t win this. I only have to LAST.', 2.2, { style: 'shout' });
      yield* m.cine(1.9);
      m.endShot();
    }
    // the stand: hold him here; he stops playing
    m.objective('hold', 'Hold him off — block and evade', { icon: 'guard', target: PK.hold });
    m.objective('standing', 'Still standing when the time is up', { icon: 'clock', optional: true });
    m.prompt('frPkGuard', 'guard', 'Block the blade', { when: () => sj.state === 'attack' && sj.pos.distanceTo(pk.pos) < 4, until: () => blocks >= 3 });
    m.prompt('frPkDodge', 'dodge', 'Evade — it comes out of the portal', { when: () => sj.state === 'portalStrike', until: () => !!m.flags.pkSawClaw });
    sj.controller = cpu(b);
    sj.target = pk;
    sj.lockedSlots = { special1: true, ultimate: true };
    sj.dimensionOverride = null;
    if (b.player === pk) pk.controller = pk._playerController || pk.controller;
    m.music('super_janemba', 3);
    t = 0;
    holding = true;
    let stage = 0;
    const offC = b.on('portalStrike', (e) => {
      if (e.fighter === sj) m.flags.pkSawClaw = true;
    });
    m.onDispose(offC);
    if (!fight.floored(pk)) {
      m.lock(false);
      b.aiLocked = false;
      pk.setState('free');
      sj.setState('free');
      for (;;) {
        yield () => m.state !== 'running' || fight.floored(pk) || t >= PK.hold || (stage < 2 && t >= PK.stages[stage]);
        if (m.state !== 'running') return;
        if (fight.floored(pk) || t >= PK.hold) break;
        // worse at every stage: the Dimension Slash, then the claw
        stage++;
        sj.damageDealtMul = PK.dealt[stage];
        if (stage === 1) delete sj.lockedSlots.special1;
        if (stage === 2) delete sj.lockedSlots.ultimate;
        m.music('super_janemba', 3 + stage);
      }
    }
    m.flags.pikkonHeld = Math.round(t * 10) / 10;
    m.flags.pikkonBlocks = blocks;
    if (t >= PK.hold) {
      m.complete('hold');
      m.complete('standing');
    } else m.failObjective('standing');
    K.unhook(m, clock);
    K.unhook(m, keepPoise);
    K.unhook(m, toy);
    offA();
    offB();
    offC();
    fight.off();
    sj.storyArmor = 0;
    sj.damageDealtMul = 1;
  }

  /**
   * PIKKON'S DEFEAT, staged: he goes in with the Hurricane Kick — Janemba comes apart into cubes and is
   * behind him; the first cut, barely blocked; gone again, at his side: the guard breaks and the cleave
   * sends him crashing across the field; he gets up, and throws the Thunder Flash — Janemba does not even
   * lift the sword: the light goes into a portal in front of him and comes out of one behind Pikkon, into
   * his back. A stillness after the hit. Down, and he cannot get up. Alive (a defeat, not a death): he
   * warns Goku, and Janemba turns toward the two at the rock.
   */
  function* pikkonFalls(m) {
    const b = m.battle, S = b.story, sj = S.sj, pk = S.pikkon;
    m.lock(true);
    m.clearObjectives();
    K.clearCombat(b);
    b.aiLocked = true;
    for (const f of [pk, sj]) {
      f.controller = K.scripted();
      f.vel.set(0, 0, 0);
      f.untargetable = true;
      f.intangible = true;
      f.freeze = 0;
      f.setHidden(false);
    }
    if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
    const fd = FR.lm(b, 'field');
    // the line of the fight runs across the open field; every side lens stands on Sd
    const E = new V3(1, 0, 0), Sd = new V3(0, 0, -1);
    const P0 = FR.at(b, fd.x - 3.4, fd.z), J0 = FR.at(b, fd.x + 3.4, fd.z);
    K.place(pk, P0, 0);
    K.place(sj, J0, 0);
    K.faceTo(pk, J0);
    K.faceTo(sj, P0);
    const run = (fn) => {
      m.tickHooks.push(fn);
      return () => K.unhook(m, fn);
    };
    const lens = (fn, opts) => m.shot(fn, 999, Object.assign({ hold: true, cut: true, blendIn: 0 }, opts));
    const turnTo = (f, p, frames) => {
      const y0 = f.yaw, y1 = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
      let n = 0;
      return run(() => {
        n++;
        const k = Math.min(1, n / frames), e = k * k * (3 - 2 * k);
        f.yaw = f.prevYaw = y0 + U.wrapAngle(y1 - y0) * e;
      });
    };
    // 1 — he goes in with everything: the Hurricane Kick, side on and low
    pk.setState('scripted', { pose: 'pk_spinW', expression: 'determined', speed: 16 });
    pk.anim.play('pk_spinW', 16, { snap: true });
    sj.setState('scripted', { pose: 'sj_idle', expression: 'wicked', speed: 8 });
    lens((t, out) => {
      const c = pk.chest().lerp(sj.chest(), 0.5);
      out.pos.copy(c).addScaledVector(Sd, 5.6).addScaledVector(E, -0.6).add(new V3(0, -0.35, 0));
      out.look.copy(c).add(new V3(0, 0.1, 0));
      out.fov = 44;
    });
    m.say('pikkon', 'HAAAAH!', 1.1, { style: 'shout' });
    yield* m.cine(0.6);
    pk.setState('scripted', { pose: 'pk_spin', expression: 'shout', speed: 24 });
    b.sfx('dash', pk);
    const rushTo = J0.clone().addScaledVector(E, -0.9);
    let rn = 0;
    const offRush = run(() => {
      rn++;
      const k = Math.min(1, rn / 16);
      pk.setPosition(P0.clone().lerp(rushTo, k * (2 - k)));
      if (rn % 2 === 0) b.vfx.trail(pk.chest(), 0xc8ffb8, 0.3, 0.2);
      // 2 — and the demon is not there: he comes apart a breath before the kick lands
      if (rn === 11) SL.Dimension.shatter(b, sj, { hide: true });
      if (rn === 16) b.sfx('swing', pk, { pitch: 0.7, vol: 0.9 });
    });
    yield* m.cine(0.45);
    offRush();
    // ...and he is behind him: Pikkon's face, the demon forming over his shoulder
    const pf = pk.forward.clone().setY(0).normalize(), ps = new V3(pf.z, 0, -pf.x);
    const behind = FR.at(b, pk.pos.x - pf.x * 2.1, pk.pos.z - pf.z * 2.1);
    sj.setPosition(behind);
    K.faceTo(sj, pk.pos);
    sj.setState('scripted', { pose: 'sj_backW', expression: 'wicked', speed: 30 });
    sj.anim.play('sj_backW', 30, { snap: true });
    SL.Dimension.reassemble(b, sj, behind, { frames: 12, show: true });
    pk.setState('scripted', { pose: 'pk_kick', expression: 'shock', speed: 20 });
    lens((t, out) => {
      out.pos.copy(pk.chest()).addScaledVector(pf, 2.5).addScaledVector(ps, 0.95).add(new V3(0, 0.08, 0));
      out.look.copy(pk.chest()).addScaledVector(pf, -0.9).add(new V3(0, 0.12, 0));
      out.fov = 46;
    }, { subject: pk, face: true });
    yield* m.cine(0.5);
    // 3 — he turns into it with his arms up: the first cut, barely blocked
    pk.setState('scripted', { pose: 'guard', expression: 'grit', speed: 34 });
    const offT = turnTo(pk, sj.pos, 6);
    lens((t, out) => {
      const c = pk.chest().lerp(sj.chest(), 0.5);
      out.pos.copy(c).addScaledVector(ps, -4.2).add(new V3(0, -0.2, 0));
      out.look.copy(c).add(new V3(0, 0.15, 0));
      out.fov = 44;
    });
    yield* m.cine(0.12);
    sj.setState('scripted', { pose: 'sj_back', expression: 'wicked', speed: 44 });
    yield* m.cine(0.1);
    offT();
    const bp = pk.chest().addScaledVector(pk.forward, 0.35);
    b.vfx.flash(bp, 0.6, 0x7ab8ff, 0.1, SL.Toon.tex.glow);
    b.vfx.ring(bp, 1, 0x7ab8ff, 0.22);
    b.vfx.sparks(bp, 0xe8f4ff, 16, 9, 0.09);
    b.sfx('swordClang', pk, { pitch: 0.9, vol: 1.1 });
    b.sfx('block', pk);
    b.cameraTraumaAt(bp, 0.3);
    pk.setState('scripted', { pose: 'guardHit', expression: 'hurt', speed: 30 });
    // the blow drives him back across the ground
    const back = pk.forward.clone().setY(0).normalize().negate(), s0 = pk.pos.clone();
    let sk = 0;
    const offS = run(() => {
      sk++;
      const k = Math.min(1, sk / 14);
      const p = s0.clone().addScaledVector(back, 1.5 * k * (2 - k));
      pk.setPosition(FR.at(b, p.x, p.z));
      if (sk % 3 === 0 && sk <= 14) b.vfx.dust(pk.pos.clone(), 0.6, 4, 0xffc8e4);
    });
    yield* m.cine(0.55);
    offS();
    // 4 — gone again, and at his side: the guard breaks; the cleave sends him across the field
    SL.Dimension.shatter(b, sj, { hide: true });
    yield* m.cine(0.22);
    const pf2 = pk.forward.clone().setY(0).normalize(), side = new V3(pf2.z, 0, -pf2.x);
    const at2 = FR.at(b, pk.pos.x + side.x * 1.9, pk.pos.z + side.z * 1.9);
    sj.setPosition(at2);
    K.faceTo(sj, pk.pos);
    sj.setState('scripted', { pose: 'sj_slashW', expression: 'wicked', speed: 40 });
    sj.anim.play('sj_slashW', 40, { snap: true });
    SL.Dimension.reassemble(b, sj, at2, { frames: 8, show: true });
    // from his other side, a little in front: Pikkon whole, the demon arriving beyond him
    lens((t, out) => {
      const c = pk.chest().lerp(sj.chest(), 0.4);
      out.pos.copy(pk.chest()).addScaledVector(side, -3.6).addScaledVector(pf2, 1.6).add(new V3(0, -0.1, 0));
      out.look.copy(c).add(new V3(0, 0.1, 0));
      out.fov = 46;
    });
    yield* m.cine(0.14);
    sj.setState('scripted', { pose: 'sj_slash', expression: 'wicked', speed: 50 });
    const gp = pk.chest().addScaledVector(side, 0.3);
    b.vfx.slash(gp.clone().add(new V3(0, 0.6, 0)).addScaledVector(side, 0.5), gp.clone().add(new V3(0, -0.5, 0)).addScaledVector(side, -0.4), 0xff3a5a, 0.2, 0.09);
    b.vfx.sparks(gp, 0xffd0a0, 14, 8, 0.09);
    b.sfx('guardBreak', pk);
    pk.setState('scripted', { pose: 'stagger', expression: 'shock', speed: 24 });
    yield* m.cine(0.3);
    sj.setState('scripted', { pose: 'sj_overheadW', expression: 'wicked', speed: 36 });
    yield* m.cine(0.2);
    sj.setState('scripted', { pose: 'sj_overhead', expression: 'wicked', speed: 50 });
    const away = pk.pos.clone().sub(sj.pos).setY(0).normalize();
    const hp = pk.chest();
    b.vfx.slash(hp.clone().add(new V3(0, 1.1, 0)), hp.clone().add(new V3(0, -0.6, 0)).addScaledVector(away, 0.4), 0xff3a5a, 0.26, 0.14);
    b.vfx.impact(hp, 2, 0xff9ab8);
    b.sfx('swordSlash', sj, { pitch: 0.8 });
    b.sfx('punchHeavy', pk, { pitch: 0.7, vol: 1.2 });
    b.cameraTraumaAt(hp, 0.5);
    pk.setState('scripted', { pose: 'hitAirSpin', expression: 'hurt', speed: 20 });
    // the flight: a long arc across the field, the lens wide and still on the south side of it
    const l0 = pk.pos.clone(), land = FR.at(b, l0.x + away.x * 13, l0.z + away.z * 13);
    const slideTo = FR.at(b, land.x + away.x * 2.6, land.z + away.z * 2.6);
    const mid = l0.clone().lerp(land, 0.55), perp = new V3(away.z, 0, -away.x);
    // side on to the flight, panning with him
    lens((t, out) => {
      out.pos.copy(mid).addScaledVector(perp, 7).add(new V3(0, 1.2, 0));
      out.look.copy(pk.pos).lerp(mid, 0.4).add(new V3(0, 0.9, 0));
      out.fov = 52;
    });
    let fl = 0, landed = false;
    const offF = run(() => {
      fl++;
      if (fl <= 34) {
        const k = fl / 34;
        const p = l0.clone().lerp(land, k);
        p.y = U.lerp(l0.y, land.y, k) + Math.sin(Math.PI * k) * 2.4;
        pk.setPosition(p);
        pk.grounded = false;
        return;
      }
      if (!landed) {
        landed = true;
        // the crash: the jellybean ground bursts under him
        pk.setState('scripted', { pose: 'knockdown', expression: 'hurt', speed: 30 });
        b.vfx.dust(land.clone(), 2.2, 18, 0xffc8e4);
        SL.Dimension.cubes(b, land.clone().add(new V3(0, 0.2, 0)), { count: 18, spread: 0.5, speed: 7, life: 50, size: 0.22, colors: [0xff8ad8, 0xffd86a, 0x8ad8ff, 0x6a4a8a], drift: 14 });
        b.vfx.ring(land.clone().add(new V3(0, 0.08, 0)), 2.8, 0xffb0e0, 0.4, new V3(0, 1, 0));
        b.sfx('groundImpact', pk, { vol: 1.1 });
        b.sfx('rockBreak', pk, { pitch: 0.8, vol: 0.8 });
        b.cameraTraumaAt(land, 0.55);
      }
      const k = Math.min(1, (fl - 34) / 26);
      const p = land.clone().lerp(slideTo, k * (2 - k));
      pk.setPosition(FR.at(b, p.x, p.z));
      if (fl % 4 === 0 && k < 1) b.vfx.dust(pk.pos.clone(), 0.6, 3, 0xffc8e4);
    });
    yield* m.cine(1.3);
    offF();
    // 5 — he gets up. Slowly. And throws the last thing he has
    K.faceTo(pk, sj.pos);
    const pf3 = pk.forward.clone().setY(0).normalize(), ps3 = new V3(pf3.z, 0, -pf3.x);
    lens((t, out) => {
      const h = pk.headPos();
      out.pos.copy(pk.pos).addScaledVector(pf3, 2.2).addScaledVector(ps3, 0.8).add(new V3(0, 0.45, 0));
      out.look.copy(h).add(new V3(0, -0.25, 0));
      out.fov = 46;
    }, { subject: pk, face: true });
    pk.setState('scripted', { pose: 'getup', expression: 'grit', speed: 3 });
    m.say('pikkon', 'Not... yet...!', 1.6, { style: 'quiet' });
    yield* m.cine(1.4);
    pk.setState('scripted', { pose: 'exhausted', expression: 'grit', speed: 5 });
    yield* m.cine(0.6);
    pk.setState('scripted', { pose: 'pk_thunderW', expression: 'shout', speed: 8 });
    m.say('pikkon', 'THUNDER FLASH ATTACK!', 1.5, { style: 'shout' });
    b.sfx('kiCharge', pk, { vol: 0.8 });
    const hands = () => pk.handPos('L').lerp(pk.handPos('R'), 0.5);
    let ch = 0;
    const offCh = run(() => {
      ch++;
      if (ch % 3 === 0) b.vfx.streamInward(hands(), 1.3, 0xb8ffd8, 3, 0.1, 0.3);
    });
    // over his shoulder: the demon far off across the field, waiting
    lens((t, out) => {
      const c = pk.chest();
      out.pos.copy(c).addScaledVector(pf3, -1.6).addScaledVector(ps3, 0.75).add(new V3(0, 0.35, 0));
      out.look.copy(sj.chest());
      out.fov = 30;
    });
    yield* m.cine(0.9);
    offCh();
    // 6 — he fires; Janemba does not lift the sword. The light goes into a portal in front of him...
    pk.setState('scripted', { pose: 'pk_thunder', expression: 'shout', speed: 30 });
    sj.setState('scripted', { pose: 'sj_present', expression: 'wicked', speed: 10 });
    b.sfx('beamFire', pk);
    const toPk = pk.pos.clone().sub(sj.pos).setY(0).normalize();
    const entry = sj.chest().addScaledVector(toPk, 1.1);
    const inP = SL.Dimension.portal(b, entry, toPk, { radius: 0.85, open: 5 });
    // a deep green (a pale one vanishes against the bright field), a pale core
    const BEAM = [0x22b85a, 0xe8ffe8, { rings: 1, ringColor: 0x8affaa }];
    const beam1 = b.vfx.createBeam(...BEAM);
    let beam2 = null, outP = null, exit = null, bn = 0, hitAt = -1, stillUntil = -1, fade = 1, hold = false;
    const back2 = () => pk.chest().addScaledVector(pk.forward, -0.25);
    const offBeam = run(() => {
      if (hold) return;
      bn++;
      const o = hands();
      const k1 = Math.min(1, bn / 18);
      beam1.update(o, o.clone().lerp(entry, k1), 0.42, fade, bn / 60);
      // ...and out of one behind Pikkon, into his back
      if (bn === 26) {
        exit = pk.chest().addScaledVector(pk.forward, -2.6).add(new V3(0, 0.25, 0));
        outP = SL.Dimension.portal(b, exit, back2().sub(exit).normalize(), { radius: 0.85, open: 4 });
        beam2 = b.vfx.createBeam(...BEAM);
      }
      if (beam2) {
        const k2 = Math.min(1, (bn - 26) / 9);
        beam2.update(exit, exit.clone().lerp(back2(), k2), 0.42, fade, bn / 60);
        if (k2 >= 1 && hitAt < 0) hitAt = bn;
      }
      if (hitAt > 0 && bn > hitAt + 6) fade = Math.max(0, fade - 0.08);
    });
    const perp6 = new V3(toPk.z, 0, -toPk.x);
    lens((t, out) => {
      const c = pk.chest().lerp(sj.chest(), 0.45);
      out.pos.copy(c).addScaledVector(perp6, 14).add(new V3(0, 0.8, 0));
      out.look.copy(c).add(new V3(0, 0.3, 0));
      out.fov = 54;
    });
    yield () => bn >= 24;
    // the portal behind him: his own light coming for his back
    lens((t, out) => {
      out.pos.copy(pk.chest()).addScaledVector(pf3, 1.6).addScaledVector(ps3, -2.4).add(new V3(0, 0.25, 0));
      out.look.copy(pk.chest()).addScaledVector(pf3, -1.3);
      out.fov = 46;
    });
    pk.setState('scripted', { pose: 'pk_thunder', expression: 'shock', speed: 30 });
    yield () => hitAt > 0;
    // the hit — and everything stops for a breath
    const hit = back2();
    b.vfx.flash(hit, 2.2, 0xc8ffd8, 0.22, SL.Toon.tex.glow);
    b.vfx.ring(hit, 1.8, 0xb8ffd8, 0.35);
    b.vfx.sparks(hit, 0xd8ffe0, 24, 10, 0.12);
    b.sfx('explosionBig', pk, { pitch: 1.2, vol: 0.9 });
    b.cameraTraumaAt(hit, 0.6);
    pk.setState('scripted', { pose: 'smashed', expression: 'hurt', speed: 40 });
    pk.anim.play('smashed', 40, { snap: true });
    hold = true;
    pk.freeze = sj.freeze = 16;
    yield* m.cine(0.3);
    hold = false;
    inP.close();
    if (outP) outP.close();
    // side on and low: down on his face, sliding
    const fp = pk.pos.clone();
    lens((t, out) => {
      out.pos.copy(fp).addScaledVector(perp6, 4.2).addScaledVector(pk.forward, 1.6).add(new V3(0, 0.7, 0));
      out.look.copy(pk.pos).add(new V3(0, 0.35, 0));
      out.fov = 46;
    });
    // he goes down on his face and slides
    const s1 = pk.pos.clone(), fwd = pk.forward.clone().setY(0).normalize();
    let dn = 0;
    const offD = run(() => {
      dn++;
      const k = Math.min(1, dn / 22);
      const p = s1.clone().addScaledVector(fwd, 2.4 * k * (2 - k));
      pk.setPosition(FR.at(b, p.x, p.z));
      if (dn === 8) {
        pk.setState('scripted', { pose: 'knockdownFace', expression: 'ko', speed: 26 });
        b.vfx.dust(pk.pos.clone(), 1.8, 18, 0xffc8e4);
        b.sfx('groundImpact', pk, { vol: 0.9, pitch: 0.9 });
      }
      if (dn % 3 === 0 && dn > 8 && k < 1) b.vfx.dust(pk.pos.clone(), 0.7, 4, 0xffc8e4);
    });
    yield* m.cine(0.5);
    offD();
    offBeam();
    beam1.dispose();
    if (beam2) beam2.dispose();
    // 7 — the stillness: on the ground, at his face; he tries to push up — and cannot
    const pf4 = pk.forward.clone().setY(0).normalize(), ps4 = new V3(pf4.z, 0, -pf4.x);
    lens((t, out) => {
      const h = pk.headPos();
      out.pos.copy(h).addScaledVector(pf4, 1.5).addScaledVector(ps4, 0.6).add(new V3(0, 0.12, 0));
      out.look.copy(h).add(new V3(0, 0.05, 0));
      out.fov = 42;
    }, { subject: pk, face: true });
    yield* m.cine(0.8);
    pk.setState('scripted', { pose: 'pk_pushUp', expression: 'grit', speed: 3 });
    b.sfx('drain', pk, { vol: 0.3, pitch: 0.7 });
    yield* m.cine(1.3);
    pk.setState('scripted', { pose: 'knockdownFace', expression: 'ko', speed: 10 });
    b.vfx.dust(pk.pos.clone(), 0.8, 6, 0xffc8e4);
    yield* m.cine(0.9);
    m.flags.pikkonDown = true;
    // the demon is done with him; he turns to where the other two are
    const rock = lineUp(b).at(0);
    const toF = sj.pos.clone().sub(rock).setY(0).normalize(), sideF = new V3(toF.z, 0, -toF.x);
    for (const [f, sg] of [[S.goku, 1], [S.vegeta, -1]]) {
      K.place(f, FR.at(b, rock.x + sideF.x * sg * 0.8, rock.z + sideF.z * sg * 0.8), 0);
      K.faceTo(f, sj.pos);
      f.setState('scripted', { pose: 'idle', expression: 'shock', speed: 8 });
    }
    const overP = FR.at(b, pk.pos.x - pf4.x * 0.4 + ps4.x * 2.6, pk.pos.z - pf4.z * 0.4 + ps4.z * 2.6);
    sj.setPosition(overP);
    K.faceTo(sj, pk.pos);
    sj.setState('scripted', { pose: 'sj_idle', expression: 'wicked', speed: 8 });
    lens((t, out) => {
      const h = pk.headPos();
      out.pos.copy(h).addScaledVector(pf4, 0.9).addScaledVector(ps4, -0.7).add(new V3(0, 0.05, 0));
      out.look.copy(sj.headPos()).add(new V3(0, -0.2, 0));
      out.fov = 46;
    });
    yield* m.cine(0.8);
    const offTurn = turnTo(sj, rock, 26);
    b.sfx('giggle', sj, { pitch: 0.6, vol: 0.8 });
    yield* m.cine(1.3);
    offTurn();
    // at the rock: they saw it
    lens((t, out) => {
      const c = S.goku.chest().lerp(S.vegeta.chest(), 0.5);
      out.pos.copy(c).addScaledVector(toF, 3.6).addScaledVector(sideF, 0.4).add(new V3(0, -0.1, 0));
      out.look.copy(c);
      out.fov = 44;
    });
    m.say('goku', 'PIKKON!', 1.3, { style: 'shout' });
    yield* m.cine(1.3);
    // he lifts his head: the warning
    pk.setState('scripted', { pose: 'pk_pushUp', expression: 'grit', speed: 2 });
    lens((t, out) => {
      const h = pk.headPos();
      out.pos.copy(h).addScaledVector(pf4, 1.3).addScaledVector(ps4, -0.5).add(new V3(0, 0.08, 0));
      out.look.copy(h);
      out.fov = 40;
    }, { subject: pk, face: true });
    m.say('pikkon', 'Goku! Ordinary blows won\'t stop him... Whatever you two are planning — do it NOW!', 3.4, { style: 'shout' });
    yield* m.cine(3.3);
    pk.setState('scripted', { pose: 'knockdownFace', expression: 'ko', speed: 6 });
    lens((t, out) => {
      const h = S.vegeta.headPos(), f = S.vegeta.forward;
      out.pos.copy(h).addScaledVector(f, 1.6).addScaledVector(new V3(f.z, 0, -f.x), 0.5).add(new V3(0, -0.1, 0));
      out.look.copy(h);
      out.fov = 40;
    }, { subject: S.vegeta, face: true });
    S.vegeta.setState('scripted', { pose: 'idle', expression: 'angry', speed: 8 });
    m.say('vegeta', 'You heard him, Kakarot. The dance — NOW, while he is still out there.', 2.8, { style: 'shout' });
    yield* m.cine(2.7);
    S.goku.setState('scripted', { pose: 'idle', expression: 'determined', speed: 8 });
    lens((t, out) => {
      const h = S.goku.headPos(), f = S.goku.forward;
      out.pos.copy(h).addScaledVector(f, 1.6).addScaledVector(new V3(-f.z, 0, f.x), 0.5).add(new V3(0, -0.1, 0));
      out.look.copy(h);
      out.fov = 40;
    }, { subject: S.goku, face: true });
    m.say('goku', 'Right. No mistakes this time — it\'s our last chance.', 2.4, { style: 'shout' });
    yield* m.cine(2.3);
    m.endShot();
  }

  /** Pikkon down on the field, out of it, alive (for any phase after his defeat). */
  function pikkonDown(b) {
    const pk = b.story.pikkon;
    if (!pk) return;
    if (b.player === pk) b.switchPlayer(b.story.goku, { force: true, quiet: true });
    K.watcher(pk, 'knockdownFace', 'ko');
    pk.setHidden(true);
  }

  // where Janemba is on his way to them during the dance: from far out behind them (from: metres) to near
  const COMING = { from: 30, to: 9, lift: 1.2 };
  /** Janemba coming at them from behind (the dance lens sees him between them): k 0 far .. 1 near. */
  function approach(b, k) {
    const S = b.story, sj = S.sj, mid = S.goku.pos.clone().lerp(S.vegeta.pos, 0.5);
    const d = U.lerp(COMING.from, COMING.to, k);
    sj.setHidden(false);
    K.hover(b, sj, FR.at(b, mid.x + 0.6, mid.z + d), COMING.lift);
    K.faceTo(sj, mid);
  }

  /** One dance, judged strictly: returns 'ok' or 'timing'. opts.from: how far along Janemba already is (0..1). */
  function* dance(m, opts) {
    const b = m.battle, S = b.story, sj = S.sj;
    const { at } = lineUp(b);
    b.switchPlayer(S.goku, { force: true, quiet: true });
    sj.controller = K.scripted();
    if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
    sj.setState('scripted', { pose: 'sj_float', expression: 'wicked', speed: 6 });
    let k = opts.from || 0, want = k;
    approach(b, k);
    const coming = () => {
      k += (want - k) * 0.04;
      approach(b, k);
    };
    m.tickHooks.push(coming);
    const STEPS = SL.data.fusionDance.STEPS;
    m.shot((t, out, el) => {
      const mid = S.goku.chest().lerp(S.vegeta.chest(), 0.5);
      out.pos.set(mid.x + Math.sin(el * 0.08) * 0.5, mid.y + 0.15, mid.z - 5);
      out.look.copy(mid).add(new V3(0, -0.05, 0));
      out.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say(opts.who, opts.line, 2.2, { style: 'quiet' });
    yield* m.cine(1.4);
    let matched = 0;
    const off = b.on('rhythmStep', (e) => {
      if (e.grade === 'miss') return;
      matched++;
      // the same light on both of them: in sync
      for (const f of [S.goku, S.vegeta]) {
        b.vfx.ring(f.chest(), 1.6 + matched * 0.15, e.grade === 'perfect' ? 0xffe8a0 : 0xfff4d8, 0.35);
        b.vfx.sparks(f.chest(), 0xfff0b0, 4 + matched, 4, 0.06);
      }
      b.sfx('tierUp', S.goku, { pitch: 0.9 + matched * 0.06, vol: 0.5 });
    });
    const res = yield* m.rhythm(STEPS.map((s) => ({ key: 'light', label: s.label })), {
      beat: GG.beat, window: opts.window, perfect: GG.perfect, lead: 1,
      onBeat: (i) => {
        const st = STEPS[i];
        const ha = st.id === 'ha';
        want = Math.max(want, (opts.from || 0) + (1 - (opts.from || 0)) * ((i + 1) / STEPS.length));
        S.goku.setState('scripted', { pose: st.pose + 'R', expression: ha ? 'shout' : 'determined', speed: 18 });
        S.vegeta.setState('scripted', { pose: st.pose, expression: ha ? 'shout' : 'determined', speed: 18 });
        if (st.id.startsWith('step')) {
          const k = Number(st.id.slice(4));
          const gap = U.lerp(1.7, 0.55, k / 3);
          K.place(S.goku, at(-gap), Math.PI);
          K.place(S.vegeta, at(gap), Math.PI);
        }
        if (st.call) {
          m.say('goku', st.call, 0.8, { style: 'shout' });
          m.say('vegeta', st.call, 0.8, { style: 'shout' });
          b.sfx('swing', S.vegeta, { pitch: 1.05, vol: 0.7 });
        }
      },
    });
    off();
    K.unhook(m, coming);
    m.flags.sjComing = Math.round(k * 100) / 100;
    m.endShot();
    m.flags.danceScores = (m.flags.danceScores || []).concat([Math.round(res.score * 100) / 100]);
    return res.hits.some((h) => h.grade === 'miss') ? 'timing' : 'ok';
  }

  /** Janemba's blade comes down between them: no fusion, scatter, try again. */
  function* interrupt(m) {
    const b = m.battle, S = b.story, sj = S.sj;
    const mid = S.goku.pos.clone().lerp(S.vegeta.pos, 0.5);
    sj.setHidden(false);
    K.place(sj, FR.at(b, mid.x, mid.z + 3), 0);
    K.faceTo(sj, mid);
    sj.setState('scripted', { pose: 'sj_overhead', expression: 'wicked', speed: 26 });
    b.vfx.slash(mid.clone().add(new V3(0, 3, 1)), mid.clone().add(new V3(0, 0.2, -1)), 0xff3a5a, 0.3, 0.14);
    b.sfx('swordSlash', sj, { pitch: 0.8 });
    b.cameraTraumaAt(mid, 0.5);
    for (const [f, s] of [[S.goku, -1], [S.vegeta, 1]]) {
      K.place(f, FR.at(b, mid.x + s * 3.4, mid.z - 1), 0);
      f.setState('scripted', { pose: 'idle', expression: 'shock' });
    }
    SL.Cinema.shotOn(m, { sj, goku: S.goku }, { subject: 'sj', with: 'goku', focus: 'wide' }, 2.2, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Again, Kakarot! And keep in TIME!', 2, { style: 'shout' });
    yield* m.cine(2.1);
    m.endShot();
    sj.setHidden(true);
  }

  function fuse(m) {
    const b = m.battle, S = b.story;
    const mid = S.goku.pos.clone().lerp(S.vegeta.pos, 0.5);
    const h = SL.Fusion.fuse(b, S.goku, S.vegeta, 'gogeta', { silent: true, hpFrac: 1, form: 'ssj' });
    S.fusion = h;
    S.gogeta = h.fused;
    const gg = h.fused;
    // he is born dead, like both of them: the halo comes with him
    FR.halo(b, gg);
    gg.controller = K.scripted();
    gg.untargetable = true;
    // the reveal must read: the aura stays thin until he steps out of the light
    gg.auraViewCap = 0.25;
    K.place(gg, FR.at(b, mid.x, mid.z), Math.PI);
    gg.setState('scripted', { pose: 'gg_arrival', expression: 'closed' });
    b.emit('fusionDance', { id: 'gogeta', fused: gg });
    // Janemba arrives in front of the light
    S.sj.setHidden(false);
    K.place(S.sj, FR.at(b, mid.x, mid.z - 9), 0);
    K.faceTo(S.sj, gg.pos);
    K.faceTo(gg, S.sj.pos);
    S.sj.setState('scripted', { pose: 'sj_present', expression: 'angry' });
    if (S.sj.model.setPropFill) S.sj.model.setPropFill('sword', 1);
    return gg;
  }

  function ensureGogeta(m) {
    const b = m.battle, S = b.story;
    if (S.gogeta && S.gogeta.alive) return S.gogeta;
    lineUp(b);
    return fuse(m);
  }

  /** How far Gogeta's catching fingers are from Janemba's blade (m; Infinity with no blade). */
  function bladeGap(gg, sj) {
    const sw = sj.model.props && sj.model.props.sword;
    if (!sw || !sw.visible) return Infinity;
    sj.model.root.updateMatrixWorld(true);
    const hand = gg.handPos('R').add(new V3(0, 0.04, 0));
    const base = new V3(0, 0, 0).applyMatrix4(sw.matrixWorld).sub(sj.object.position).add(sj.pos);
    const ab = new V3(0, 1, 0).applyMatrix4(sw.matrixWorld).sub(sj.object.position).add(sj.pos).sub(base);
    const t = U.clamp(hand.clone().sub(base).dot(ab) / Math.max(1e-6, ab.lengthSq()), 0, 1);
    return hand.distanceTo(base.addScaledVector(ab, t));
  }

  /**
   * THE CATCH, SOLVED BEFORE IT IS SHOWN: where Janemba must stand for his blade to come down between
   * Gogeta's two fingers. Both bodies are put in their end poses for one instant (nothing is drawn in
   * between), the point of the blade level with the fingers is found, and Janemba is set over by the gap —
   * before the stand-off's first frame, so the catch itself never moves him. The given poses go back on after.
   * Returns the distance left between blade and fingers (m), measured in the end poses after the fit.
   */
  function catchFit(b, gg, sj, back) {
    const sw = sj.model.props && sj.model.props.sword;
    if (!sw) return 0;
    const pose = (f, name) => {
      f.object.position.copy(f.pos);
      f.object.rotation.y = f.yaw;
      f.anim.play(name, 30, { snap: true });
      f.anim.update(0);
      f.object.updateMatrixWorld(true);
    };
    // the bodies' turns are held while he is moved (that makes each fit exact in one step); the second fit turns
    // Janemba half way back toward Gogeta, so neither of them ends far off square to the other
    let gap = 0;
    K.faceTo(sj, gg.pos);
    K.faceTo(gg, sj.pos);
    for (const turn of [0, 0.5, 0.5]) {
      if (turn) sj.yaw = sj.prevYaw = sj.yaw + U.wrapAngle(Math.atan2(gg.pos.x - sj.pos.x, gg.pos.z - sj.pos.z) - sj.yaw) * turn;
      pose(sj, 'sj_caught');
      pose(gg, 'gg_catchBlind');
      const hand = gg.handPos('R').add(new V3(0, 0.04, 0));
      const base = new V3(0, 0, 0).applyMatrix4(sw.matrixWorld), tip = new V3(0, 1, 0).applyMatrix4(sw.matrixWorld);
      // the point on the blade level with the fingers (kept between a third and nine tenths of the way up it)
      const t = Math.abs(tip.y - base.y) > 1e-3 ? U.clamp((hand.y - base.y) / (tip.y - base.y), 0.35, 0.9) : 0.75;
      const d = hand.clone().sub(base.lerp(tip, t));
      sj.setPosition(sj.pos.clone().add(new V3(d.x, 0, d.z)));
    }
    pose(sj, 'sj_caught');
    pose(gg, 'gg_catchBlind');
    gap = bladeGap(gg, sj);
    pose(sj, back[0]);
    pose(gg, back[1]);
    return gap;
  }

  /**
   * THE STARDUST BREAKER — seven shots, the player's hold on Special 2 driving them:
   *   A  the reveal: a low three-quarter lens, the whole of him and the halo   (until Special 2 is held)
   *   B  the gathering: the arm goes up, colour streams into his palm          (charge 0    → 0.3)
   *   C  the sphere against the dark, from under it                            (0.3  → 0.5)
   *   D  the hero shot: a ground-level lens, the whole pose, the sash in the wind (0.5 → 0.72)
   *   E  the sphere alone: its bands, the star in it, the twinkles, his palm under it (0.72 → 0.9)
   *   F  his face, calm, the sphere clear of it — let go                       (0.9 → the release)
   *   G  the release (the owner's beat sheet, 2026-10-10): the fist CRUSHES the sphere into glittering
   *      dust; behind Janemba — recovered in mid-air, he spins round — Gogeta far off with his back
   *      turned; Gogeta turns on his heel; the lens rides backward with the dust, away from him toward
   *      Janemba, as he flicks it; it hits Janemba dead-centre in the chest
   * He makes the sphere with his BACK to Janemba (the finish turns him away from the tumbling demon):
   * the front lenses see Janemba small in the distance behind him, as in the owner's reference.
   * Every front lens sits on his RIGHT, 20-40 degrees off his nose: the raised right arm is abducted
   * out from his shoulder, so from there it stands clear of his head and never crosses his face (from
   * his left the sphere crowds the halo). From B on, deep space (SL.Dimension.cosmos) stands behind him, so the
   * sphere is seen against the dark. Letting go early pauses the charge (the shot holds); nobody is
   * stuck: it holds itself after GG.throwAuto idle seconds and throws GG.releaseAuto seconds after
   * it is full. Bots read battle.breaker ({ want: 'hold' | 'release' }). Expects Gogeta turned away
   * from Janemba (who hangs in the air behind him). Returns { space } (deep space, already closing).
   */
  function* breaker(m, gg, sj) {
    const b = m.battle, PR = SL.Dimension.PRISM;
    const UPV = new V3(0, 1, 0);
    const f0 = gg.forward.clone().setY(0).normalize(), l0 = new V3(f0.z, 0, -f0.x), r0 = l0.clone().negate(); // his front, left, right
    // the reveal and the gathering want a quiet body: the aura down to a thread
    gg.auraViewCap = 0;
    b.switchPlayer(gg, { force: true, quiet: true });
    // a hard cut: the stance and the quiet aura are there on the first frame, not blended into
    gg.setState('scripted', { pose: 'gg_breakerStand', expression: 'calm' });
    gg.anim.play('gg_breakerStand', 8, { snap: true });
    if (gg.aura) gg.aura.viewMul = 0;
    const lim = Object.assign({}, SL.Mission.ALL_OFF);
    delete lim.s2;
    delete lim.s2Held;
    m.limits(lim);
    b.inputLocked = false;
    b.aiLocked = true;
    const BR = (b.breaker = { want: 'hold', k: 0 });
    const orb = SL.Dimension.prismOrb(b, { fade: 24 });
    // over the palm, high enough that it never sits on his hand or level with the halo
    const orbAt = (r) => gg.handPos('R').addScaledVector(UPV, r + 0.32);
    const lens = (fn, opts) => m.shot(fn, 999, Object.assign({ hold: true, cut: true, blendIn: 0, subject: gg }, opts));
    let idle = 0, fullFor = 0, auto = false, released = false, n = 0, space = null, open = false;
    const hook = () => {
      n++;
      const it = gg.intent;
      const held = auto ? BR.want === 'hold' : !!(it && (it.s2 || it.s2Held));
      if (BR.want === 'hold') {
        if (held && open) BR.k = Math.min(1, BR.k + 1 / (60 * GG.charge));
        else if (++idle > 60 * GG.throwAuto) auto = true;
        if (BR.k >= 1) {
          BR.want = 'release';
          b.sfx('tierUp', gg, { pitch: 1.3 });
          b.vfx.ring(orb.pos, 0.9, 0xffe8a0, 0.35);
        }
      } else if (BR.want === 'release' && !released) {
        fullFor++;
        if (!held || fullFor > 60 * (auto ? 0.8 : GG.releaseAuto)) released = true;
      }
      if (BR.k > 0 && !released) {
        const k = BR.k, r = GG.orbR * (0.12 + 0.88 * (1 - (1 - k) * (1 - k)));
        orb.set(orbAt(r), r);
        gg.model.wind = 0.3 + 0.55 * k;
        // the gathering: streams and streaks of every colour running into his palm
        if (k < 1 && held) {
          if (n % 2 === 0) b.vfx.streamInward(orb.pos, 1.5, PR[n % PR.length], 3, 0.09, 0.35);
          if (n % 3 === 0) {
            // from above and round the sides only: no streak ever crosses his face
            const a = n * 2.39996, e = 0.25 + Math.abs(Math.sin(n * 0.7)) * 0.95;
            const d = new V3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
            // ...and from the side away from his head, never over his hair or his halo
            const out = orb.pos.clone().sub(gg.headPos()).setY(0);
            if (d.x * out.x + d.z * out.z < 0) {
              d.x = -d.x;
              d.z = -d.z;
            }
            b.vfx.slash(orb.pos.clone().addScaledVector(d, 1.7), orb.pos.clone().addScaledVector(d, 0.55), PR[(n / 3) % PR.length | 0], 0.14, 0.02);
          }
          if (n % 40 === 0) b.sfx('prismHum', gg, { vol: 0.3 + 0.35 * k });
        } else if (n % 6 === 0) b.vfx.sparks(orb.pos, PR[n % PR.length], 2, 1.5, 0.05);
      }
    };
    m.tickHooks.push(hook);
    m.objective('breaker', 'STARDUST BREAKER: hold Special 2, let go to throw', { icon: 'ball' });
    m.prompt('frBreakerHold', 'special2', 'Hold Special 2 — the Stardust Breaker', { required: true, until: () => BR.k >= 1 });
    m.music('gogeta_z_arrival', 1);
    // A — THE REVEAL: low, three-quarter, the whole of him and the halo; a slow push
    let heldNow = false;
    const peek = () => {
      const it = gg.intent;
      heldNow = auto || !!(it && (it.s2 || it.s2Held));
    };
    m.tickHooks.push(peek);
    lens((t, out) => {
      // feet to halo filling ~90% of the frame (fitted for this lens height and field of view: as big
      // a face as a full-body frame allows), a slow push into that fit
      const k = Math.min(1, t / 4), a = 0.4;
      const dir = f0.clone().multiplyScalar(Math.cos(a)).addScaledVector(r0, Math.sin(a));
      out.pos.copy(gg.pos).addScaledVector(dir, 3.4 - 0.26 * k).add(new V3(0, 0.35, 0));
      out.look.copy(gg.pos).add(new V3(0, gg.height * 0.58, 0));
      out.fov = 44;
    }, { face: true });
    yield* m.cine(1.4);
    // the charge starts with the arm going up, not before
    yield () => heldNow;
    K.unhook(m, peek);
    open = true;
    // B — THE GATHERING: the arm goes up; deep space comes in behind him
    gg.setState('scripted', { pose: 'gg_breakerRaise', expression: 'focused', speed: 9 });
    space = SL.Dimension.cosmos(b, gg.pos.clone(), { in: 40 });
    b.sfx('kiUp', gg, { vol: 0.6, pitch: 1.4 });
    lens((t, out) => {
      const k = Math.min(1, t / 2.5), hd = gg.headPos();
      out.pos.copy(gg.chest()).addScaledVector(f0, 2.4 - 0.3 * k).addScaledVector(r0, 1.2).add(new V3(0, -0.3, 0));
      out.look.copy(hd).lerp(orb.r > 0.01 ? orb.pos : hd, 0.42);
      out.fov = 42;
    }, { face: true });
    yield () => BR.k >= 0.3;
    // C — THE SPHERE against the dark, from under it
    lens((t, out) => {
      const k = Math.min(1, t / 1.5);
      out.pos.copy(orb.pos).addScaledVector(f0, 1.65).addScaledVector(r0, 0.8).add(new V3(0, -1 + 0.12 * k, 0));
      out.look.copy(orb.pos).add(new V3(0, -0.14, 0));
      out.fov = 36;
    }, { aimFree: true });
    yield () => BR.k >= 0.5;
    // D — THE HERO SHOT: the lens at his feet, the whole pose, the arm and the sphere above him
    lens((t, out) => {
      // a little off his nose to his right (where his face is turned), drifting further round; feet to
      // the top of the sphere filling the frame (fitted like A)
      const a = 0.12 + Math.min(1, t / 3) * 0.14;
      const dir = f0.clone().multiplyScalar(Math.cos(a)).addScaledVector(r0, Math.sin(a));
      out.pos.copy(gg.pos).addScaledVector(dir, 3.12).add(new V3(0, 0.35, 0));
      out.look.copy(gg.pos).add(new V3(0, gg.height * 0.69, 0));
      out.fov = 50;
    }, { face: true });
    yield () => BR.k >= 0.72;
    // E — THE SPHERE ALONE: the bands, the star, the twinkles; his palm under it
    gg.setState('scripted', { pose: 'gg_breakerRaise', expression: 'calm', speed: 9 });
    // the lens out beyond his hand, looking up past it: the sphere alone against the dark (the halo,
    // level with the sphere's foot and edge-on from here, is framed out for this one beat)
    const away = orb.pos.clone().sub(gg.headPos()).setY(0);
    if (away.lengthSq() < 0.01) away.copy(r0);
    away.normalize().multiplyScalar(0.85).addScaledVector(f0, 0.55).normalize();
    if (gg.halo) gg.halo.userData.off = true;
    lens((t, out) => {
      const k = Math.min(1, t / 1.5);
      out.pos.copy(orb.pos).addScaledVector(away, 1.45 - 0.12 * k).add(new V3(0, -0.34, 0));
      out.look.copy(orb.pos).add(new V3(0, -0.08, 0));
      out.fov = 36;
    }, { aimFree: true });
    yield () => BR.k >= 0.9;
    // F — HIS FACE, calm, the sphere clear of it: a restrained push in
    if (gg.halo) gg.halo.userData.off = false;
    lens((t, out) => {
      const k = Math.min(1, t / 3), hd = gg.headPos();
      out.pos.copy(hd).addScaledVector(f0, 1.95 - 0.22 * k).addScaledVector(r0, 1.45).add(new V3(0, -0.32, 0));
      out.look.copy(hd).lerp(orb.pos, 0.42);
      out.fov = 40;
    }, { face: true });
    yield () => BR.k >= 1;
    m.prompt('frBreakerGo', 'special2', 'Let go of Special 2 — throw it', { required: true, until: () => released });
    yield () => released;
    // G1 — THE CRUSH: the fist closes round the sphere and it bursts into glittering dust in his hand
    m.limits(SL.Mission.ALL_OFF);
    b.breaker = null;
    gg.model.wind = 0.2;
    gg.setState('scripted', { pose: 'gg_breakerCrush', expression: 'cold', speed: 24 });
    lens((t, out) => {
      const h = gg.handPos('R');
      out.pos.copy(h).addScaledVector(f0, 1.3).addScaledVector(r0, 0.45).add(new V3(0, -0.32, 0));
      out.look.copy(h).add(new V3(0, 0.1, 0));
      out.fov = 40;
    }, { aimFree: true });
    const from0 = orb.pos.clone(), R0 = orb.r;
    let c = 0;
    const crush = () => {
      c++;
      const fist = gg.handPos('R').addScaledVector(UPV, 0.08);
      if (c <= 8) orb.set(from0.clone().lerp(fist, c / 8), R0 * (1 - 0.85 * (c / 8)));
      if (c === 8) {
        orb.close();
        SL.Dimension.glitter(b, fist, 46, { speed: 2.4, life: 0.9, size: 0.09 });
        b.vfx.flash(fist, 0.9, 0xfff4ff, 0.14, SL.Toon.tex.glow);
        b.sfx('warpShatter', gg, { pitch: 1.7, vol: 0.8 });
      }
      // the dust held in his fist leaks out between the fingers
      if (c > 8 && c % 3 === 0) SL.Dimension.glitter(b, fist, 3, { speed: 0.5, life: 0.8, size: 0.07 });
    };
    m.tickHooks.push(crush);
    yield* m.cine(1.1);
    // G2 — BEHIND JANEMBA: recovered in the air, he spins round to face him; far off, Gogeta with his
    // back turned
    const toG = gg.pos.clone().sub(sj.pos).setY(0).normalize(), sSide = new V3(toG.z, 0, -toG.x);
    sj.setState('scripted', { pose: 'sj_float', expression: 'angry', speed: 10 });
    const y0 = sj.yaw, y1 = Math.atan2(toG.x, toG.z);
    let sp = 0;
    const spin = () => {
      sp++;
      const k = Math.min(1, sp / 26), e = k * k * (3 - 2 * k);
      sj.yaw = sj.prevYaw = y0 + U.wrapAngle(y1 - y0) * e;
    };
    m.tickHooks.push(spin);
    lens((t, out) => {
      out.pos.copy(sj.chest()).addScaledVector(toG, -1.8).addScaledVector(sSide, 0.6).add(new V3(0, 0.55, 0));
      out.look.copy(gg.chest()).add(new V3(0, 0.1, 0));
      out.fov = 30;
    }, { subject: null });
    yield* m.cine(0.9);
    K.unhook(m, spin);
    // ...and Gogeta turns on his heel
    const g0 = gg.yaw, g1 = Math.atan2(-toG.x, -toG.z);
    gg.setState('scripted', { pose: 'gg_coldStand', expression: 'cold', speed: 12 });
    let gs = 0;
    const heel = () => {
      gs++;
      const k = Math.min(1, gs / 20), e = k * k * (3 - 2 * k);
      gg.yaw = gg.prevYaw = g0 + U.wrapAngle(g1 - g0) * e;
    };
    m.tickHooks.push(heel);
    yield* m.cine(0.6);
    K.unhook(m, heel);
    K.unhook(m, crush);
    // G3 — THE DUST'S FLIGHT, flicked as casually as a pinch of salt. One readable comet: a bright heart, specks
    // of every colour shed behind it (solid, so they keep their colour on a bright sky), a short rainbow
    // streak, and under it all a soft dark bed that makes the colours stand off the bright ground as well as
    // the dark. Two lenses: riding backward ahead of it, low, looking back at him against the far dark sky;
    // then behind it, chasing it up into Janemba's chest.
    gg.setState('scripted', { pose: 'gg_flick', expression: 'cold', speed: 22 });
    b.sfx('soulPunisher', gg);
    m.flags.breakerThrown = true;
    const toS = toG.clone().negate(), sideS = new V3(toS.z, 0, -toS.x);
    const start = gg.handPos('R'), flight = 50;
    const bed = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.soft, color: 0x1c0a34, transparent: true, opacity: 0.42, depthWrite: false }));
    const heart = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xfff0ff, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
    bed.renderOrder = 12;
    heart.renderOrder = 14;
    bed.scale.setScalar(0.9);
    b.scene.add(bed, heart);
    const comet = () => {
      for (const sp of [bed, heart]) {
        b.scene.remove(sp);
        sp.material.dispose();
      }
    };
    m.onDispose(comet);
    let fl = 0;
    const dp = start.clone(), prev = start.clone();
    const fly = () => {
      fl++;
      const k = Math.min(1, fl / flight), e = 1 - (1 - k) * (1 - k);
      prev.copy(dp);
      dp.copy(start).lerp(sj.chest(), e);
      bed.position.copy(dp);
      heart.position.copy(dp);
      heart.scale.setScalar(0.3 + Math.sin(fl * 0.9) * 0.05);
      SL.Dimension.glitter(b, dp, 6, { speed: 0.3, life: 0.7, size: 0.12, solid: true });
      b.vfx.slash(prev.clone(), dp.clone(), PR[fl % PR.length], 0.3, 0.06);
    };
    m.tickHooks.push(fly);
    const g0p = gg.chest();
    lens((t, out) => {
      // low (his chest height), ahead of the dust and riding backward with it, tilting up after it: he stays low
      // in the frame, getting smaller, the dust rising over him against the far dark sky
      const run = Math.max(0, dp.clone().sub(start).dot(toS));
      out.pos.copy(g0p).addScaledVector(toS, 1.5 + run * 1.05).addScaledVector(sideS, 0.35).add(new V3(0, -0.15, 0));
      out.look.copy(g0p).lerp(dp, 0.68).add(new V3(0, 0.2, 0));
      out.fov = 54;
    }, { subject: null });
    yield () => fl >= flight * 0.42;
    // ...and behind it, low, chasing it up into his chest; the lens slows to a stop short of him
    const stopAt = sj.chest().addScaledVector(toS, -3.2);
    lens((t, out) => {
      // far enough back and aside that the trail runs across the frame into him, not past the lens
      out.pos.copy(dp).addScaledVector(toS, -2.4).addScaledVector(sideS, 1.1).add(new V3(0, -0.45, 0));
      const over = out.pos.clone().sub(stopAt).dot(toS);
      if (over > 0) out.pos.addScaledVector(toS, -over);
      out.look.copy(sj.chest()).add(new V3(0, 0.1, 0));
      out.fov = 44;
    }, { subject: sj });
    yield () => fl >= flight;
    K.unhook(m, fly);
    comet();
    // G4 — IN: dead centre in his chest. A beat to read it — the light gathering on the plate, a ring of
    // every colour, the jolt — before the purification
    m.flags.breakerHit = true;
    const hc = sj.chest();
    b.vfx.flash(hc, 0.8, 0xffd8ff, 0.16, SL.Toon.tex.glow);
    SL.Dimension.glitter(b, hc, 40, { speed: 2.2, life: 1, size: 0.1, solid: true });
    for (let i = 0; i < 3; i++) b.vfx.ring(hc, 0.7 + i * 0.45, PR[i * 2], 0.45);
    b.sfx('prismHum', sj, { vol: 0.9, pitch: 1.2 });
    b.sfx('punchHeavy', sj, { pitch: 1.4, vol: 0.6 });
    sj.setState('scripted', { pose: 'hitBody', expression: 'shock', speed: 40 });
    sj.anim.play('hitBody', 40, { snap: true });
    b.cameraTraumaAt(hc, 0.2);
    if (space) space.close(45);
    sj.vel.set(0, 0, 0);
    yield* m.cine(0.2);
    // he freezes where he is, trying to scream; the dark thins away and the pink sky comes back
    sj.setState('scripted', { pose: 'sj_scream', expression: 'shout', speed: 20 });
    yield* m.cine(0.3);
    K.unhook(m, hook);
    gg.model.wind = 0;
    m.complete('breaker');
    m.qteParts.push(auto ? 0.4 : 1);
    return { space };
  }

  const P = {};

  P.pikkon = {
    id: 'pikkon',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      m.music('super_janemba', 1);
      yield* pikkonArrives(m);
      // Goku and Vegeta at the rock, out of the fight
      for (const f of [b.story.goku, b.story.vegeta]) K.watcher(f, 'idle', 'determined');
      yield* pikkonStand(m);
      if (m.state !== 'running') return;
      yield* pikkonFalls(m);
    },
  };

  P.dance = {
    id: 'dance',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      pikkonDown(b);
      m.title(FR.CHAPTER, 'THE PERFECT FUSION', 'The last chance — every beat in time, the fingers straight', 3);
      m.music('fusion_theme', 2);
      m.objective('dance', 'The Fusion Dance: every beat in time', { icon: 'transform' });
      const lines = [
        { who: 'goku', line: 'Perfectly symmetrical this time, Vegeta. Watch those fingers.' },
        { who: 'vegeta', line: 'I KNOW, Kakarot. Just keep the count.' },
        { who: 'goku', line: 'Slower. Breathe. Together...' },
        { who: 'goku', line: 'Last chance — together!' },
      ];
      let tries = 0;
      for (;;) {
        tries++;
        const l = lines[Math.min(tries - 1, lines.length - 1)];
        // every try, he is nearer when it starts
        const out = yield* dance(m, { window: tries > GG.assistAfter ? GG.assistWindow : GG.window, who: l.who, line: l.line, from: Math.min(0.6, (tries - 1) * 0.25) });
        m.flags.danceTries = tries;
        if (out === 'ok' || tries >= GG.maxTries) break;
        yield* interrupt(m);
      }
      m.complete('dance');
      m.qteParts.push(1 / tries);
      // their hands, slow: both index fingers straight, touching
      const gh = S.goku.handPos('L').lerp(S.goku.handPos('R'), 0.5), vh = S.vegeta.handPos('L').lerp(S.vegeta.handPos('R'), 0.5);
      const mid = gh.clone().lerp(vh, 0.5);
      m.shot((t, out, el) => {
        out.pos.set(mid.x - 0.25, mid.y + 0.15, mid.z - 1.5 + el * 0.12);
        out.look.copy(mid);
        out.fov = 34;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      b.slowmo(0.25, 1.6);
      b.vfx.flash(mid, 1.2, 0xfff0b0, 0.8, SL.Toon.tex.glow);
      b.sfx('kiUp', S.goku, { pitch: 1.4 });
      yield* m.cine(1.6);
      m.endShot();
    },
  };

  P.birth = {
    id: 'birth',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      const gg = ensureGogeta(m);
      yield* SL.Cinema.play(m, 'fr_gogeta_birth');
      gg.auraViewCap = null;
      const sj = b.story.sj;
      // the look: from under his jaw, the teal eyes staring DOWN at Janemba — no anger, no feeling at all
      K.faceTo(gg, sj.pos);
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'cold', speed: 10 });
      m.shot((t, out, el) => {
        const hd = gg.headPos(), fw = gg.forward;
        out.pos.copy(hd).addScaledVector(fw, 1.0 + el * 0.04).addScaledVector(new V3(-fw.z, 0, fw.x), 0.12).add(new V3(0, -0.34, 0));
        out.look.copy(hd).add(new V3(0, 0.16, 0));
        out.fov = 38;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: gg, face: true });
      yield* m.cine(2.2);
      // through Janemba's own eyes: Gogeta comes at him — not a walk, not a run: a glide, the feet just
      // off the ground and the legs still, closing the distance like something that cannot be stopped
      sj.setHidden(false);
      sj.controller = K.scripted();
      sj.setState('scripted', { pose: 'sj_idle', expression: 'shock', speed: 6 });
      K.faceTo(sj, gg.pos);
      const startP = gg.pos.clone(), dir = sj.pos.clone().sub(startP).setY(0);
      const dist = dir.length();
      dir.normalize();
      const endP = startP.clone().addScaledVector(dir, Math.max(0, dist - 2.6));
      gg.setState('scripted', { pose: 'gg_glide', expression: 'cold', speed: 12 });
      let gl = 0;
      const glide = () => {
        gl++;
        const k = Math.min(1, gl / 70), e = k * k * (3 - 2 * k);
        const p = startP.clone().lerp(endP, e);
        p.y = FR.at(b, p.x, p.z).y + 0.06;
        gg.setPosition(p);
        gg.grounded = false;
        K.faceTo(gg, sj.pos);
      };
      m.tickHooks.push(glide);
      m.shot((t, out) => {
        out.pos.copy(sj.headPos()).addScaledVector(sj.forward, 0.35).add(new V3(0, 0.05, 0));
        out.look.copy(gg.headPos()).lerp(gg.chest(), 0.4);
        out.fov = 30;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      b.sfx('kiUp', gg, { vol: 0.5, pitch: 0.6 });
      yield () => gl >= 70;
      yield* m.cine(0.5);
      K.unhook(m, glide);
      K.place(gg, FR.at(b, gg.pos.x, gg.pos.z), gg.yaw);
      m.endShot();
    },
  };

  P.dominate = {
    id: 'dominate',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, sj = S.sj;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      const gg = ensureGogeta(m);
      K.toForm(gg, 'ssj');
      gg.hp = gg.hpMax;
      gg.ki = gg.kiMax;
      sj.setHidden(false);
      sj.hp = sj.hpMax;
      if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
      sj.movesOverride = null;
      if (sj.pos.distanceTo(gg.pos) > 6) K.place(sj, FR.at(b, gg.pos.x + gg.forward.x * 2.6, gg.pos.z + gg.forward.z * 2.6), 0);
      K.faceTo(sj, gg.pos);
      K.faceTo(gg, sj.pos);
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'cold' });
      sj.controller = K.scripted();
      b.switchPlayer(gg, { force: true });
      m.music('gogeta_z_arrival', 2);
      m.objective('evade', 'Evade the blade', { icon: 'dodge', target: GG.swings });
      // the swings, faster each time; a lean, half a step — he hardly moves
      let clean = 0;
      for (let i = 0; i < GG.swings; i++) {
        const side = new V3(gg.forward.z, 0, -gg.forward.x).multiplyScalar(i % 2 ? 0.7 : -0.7);
        K.place(sj, FR.at(b, gg.pos.x + gg.forward.x * 2.4, gg.pos.z + gg.forward.z * 2.4), 0);
        K.faceTo(sj, gg.pos);
        sj.setState('scripted', { pose: i % 2 ? 'sj_backW' : 'sj_slashW', expression: 'angry', speed: 20 + i * 4 });
        SL.Cinema.shotOn(m, { gogeta: gg, sj }, { subject: 'gogeta', with: 'sj', focus: 'medium', angle: 'three', side: i % 2 ? 1 : -1 }, 999, { cut: i === 0, blendIn: 0.15, hold: true });
        const r = yield* m.cue('dodge', 'Evade', { auto: Math.max(0.9, 1.8 - i * 0.2), slow: 0.55 });
        if (r.pressed) clean++;
        sj.setState('scripted', { pose: i % 2 ? 'sj_back' : 'sj_slash', expression: 'angry', speed: 40 });
        const from = sj.handPos('R'), to = gg.chest().addScaledVector(side, -1.2);
        b.vfx.slash(from, to, 0xff3a5a, 0.22, 0.1);
        b.sfx('swordSlash', sj, { pitch: 1 + i * 0.05 });
        K.place(gg, FR.at(b, gg.pos.x + side.x, gg.pos.z + side.z), gg.yaw);
        K.faceTo(gg, sj.pos);
        gg.setState('scripted', { pose: i % 2 ? 'gg_counter' : 'gg_coldStand', expression: 'cold', speed: 30 });
        m.progress('evade', i + 1);
        yield* m.cine(0.35);
      }
      m.flags.cleanEvades = clean;
      m.qteParts.push(clean / GG.swings);
      // the fight: the sword is still in his hand (the catch is the first blow of the finish) — and he
      // still cannot keep up
      sj.movesOverride = null;
      sj.dimensionOverride = { doors: true };
      sj.damageDealtMul = GG.jbDealt;
      gg.damageDealtMul = GG.ggDealt;
      gg.untargetable = false;
      gg.intangible = false;
      sj.untargetable = false;
      sj.intangible = false;
      sj.controller = cpu(b);
      sj.target = gg;
      gg.target = sj;
      gg.setState('free');
      sj.setState('free');
      m.music('gogeta_z_arrival', 3);
      const fight = m.storyFight({ floors: [{ f: sj, at: GG.floor }] });
      m.objective('show', 'Show Janemba the difference', { icon: 'fist' });
      m.objective('untouched', 'Do not let him touch you', { icon: 'guard', optional: true });
      let slowAt = -999;
      const offD = b.on('damage', (e) => {
        if (e.target === gg && e.attacker === sj) m.failObjective('untouched');
        // brief slow motion on the KEY blows only
        if (e.attacker === gg && e.target === sj && e.amount > 1600 && b.frame - slowAt > 150) {
          slowAt = b.frame;
          b.slowmo(0.35, 0.3);
        }
      });
      m.onDispose(offD);
      m.lock(false);
      b.aiLocked = false;
      yield () => fight.floored(sj) || m.state !== 'running';
      offD();
      if (m.state !== 'running') return;
      m.complete('show');
      if (!m.objectives.find((o) => o.id === 'untouched').failed) m.complete('untouched');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  P.finish = {
    id: 'finish',
    run: function* (m) {
      const b = m.battle, S = b.story, sj = S.sj;
      const gg = ensureGogeta(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      gg.controller = K.scripted();
      sj.controller = K.scripted();
      // the stand-off on the open field (a clear lens all round): Gogeta, and Janemba with the sword up
      const fd = FR.lm(b, 'field');
      K.place(gg, FR.at(b, fd.x, fd.z - 4), 0);
      K.place(sj, FR.at(b, fd.x, fd.z - 1.6), 0);
      sj.setHidden(false);
      if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
      // where he stands is where the blade will meet the fingers (nothing moves him at the catch)
      m.flags.catchGap = Math.round(catchFit(b, gg, sj, ['sj_overheadW', 'gg_coldStand']) * 1000) / 1000;
      const fwd = () => sj.pos.clone().sub(gg.pos).setY(0).normalize(); // Gogeta → Janemba
      const left = () => {
        const d = fwd();
        return new V3(d.z, 0, -d.x);
      };
      const hit = (p, level) => {
        b.vfx.impact(p, level, 0xfff0c0);
        b.sfx('punchHeavy', sj, { pitch: 0.82 + level * 0.03 });
        b.cameraTraumaAt(p, 0.25 + level * 0.06);
      };
      m.objective('combo', 'The counter-combination', { icon: 'fist', target: 5 });
      // 1 — THE BLADE: he cuts down with everything; two fingers stop it, and Gogeta never even looks
      sj.setState('scripted', { pose: 'sj_overheadW', expression: 'wicked', speed: 14 });
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'cold' });
      // his own front and left (the fit leaves him turned off Janemba: he is not even facing the blow)
      const gF = gg.forward.clone().setY(0).normalize(), gL = new V3(gF.z, 0, -gF.x);
      // the two of them from in front of him, a little low: the blade up over the demon's head against the sky
      m.shot((t, out) => {
        const c = gg.chest().lerp(sj.chest(), 0.4);
        out.pos.copy(c).addScaledVector(gF, 4.2).addScaledVector(gL, 1.2).add(new V3(0, -0.45, 0));
        out.look.copy(c).add(new V3(0, 0.7, 0));
        out.fov = 54;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cue('guard', 'Catch the blade', { auto: 3, slow: 0.3 });
      // the blade comes down and his hand comes up to meet it, both into the poses the stand-off was solved
      // for: the blade stops between two fingers. The lens on the side his face is turned to — calm, not
      // even looking — the hand and the blade between him and the demon
      sj.setState('scripted', { pose: 'sj_caught', expression: 'wicked', speed: 34 });
      gg.setState('scripted', { pose: 'gg_catchBlind', expression: 'cold', speed: 40 });
      b.sfx('swordSlash', sj, { pitch: 0.9 });
      // the moment it reaches the fingers it stops dead: both are set on their end poses
      let cn = 0, met = false;
      const meet = () => {
        if (met) return;
        cn++;
        if (bladeGap(gg, sj) > 0.07 && cn < 14) return;
        met = true;
        sj.anim.snap();
        gg.anim.snap();
        m.flags.caughtAt = cn;
      };
      m.tickHooks.push(meet);
      m.shot((t, out) => {
        const h = gg.handPos('R'), hd = gg.headPos();
        // in front of him and a little low: his calm face turned away, the arm out, the whole blade from the
        // demon's fist to the two fingers near its point
        out.pos.copy(hd).addScaledVector(gF, 2.6).addScaledVector(gL, 0.6).add(new V3(0, -0.4, 0));
        out.look.copy(h).lerp(hd, 0.5);
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      yield () => met;
      K.unhook(m, meet);
      // contact
      b.sfx('swordClang', gg, { pitch: 1.3, vol: 1.2 });
      b.vfx.sparks(gg.handPos('R'), 0xffe8c0, 20, 8, 0.1);
      sj.setState('scripted', { pose: 'sj_caught', expression: 'shock', speed: 24 });
      b.slowmo(0.3, 1);
      yield* m.cine(1.1);
      // the snap: the blade goes to glittering glass dust
      const sw = sj.model.props && sj.model.props.sword;
      const base = sw ? sw.getWorldPosition(new V3()) : sj.handPos('R');
      const along = sw ? new V3(0, 1, 0).applyQuaternion(sw.getWorldQuaternion(new THREE.Quaternion())) : sj.forward.clone();
      for (let k = 0; k < 6; k++) {
        const p = base.clone().addScaledVector(along, 0.2 + k * 0.16);
        SL.Dimension.cubes(b, p, { count: 8, spread: 0.08, speed: 6, life: 40, size: 0.08, colors: [0xff2a4a, 0x9a0e2a, 0xffb0c0] });
        SL.Dimension.glitter(b, p, 10, { speed: 2, life: 1, size: 0.07 });
      }
      if (sj.model.setPropFill) sj.model.setPropFill('sword', 0);
      b.sfx('warpShatter', sj, { pitch: 0.8, vol: 1.2 });
      sj.setState('scripted', { pose: 'sj_reel', expression: 'shock', speed: 20 });
      m.progress('combo', 1);
      yield* m.cine(0.7);
      // 2 — THE KNEE: he is gone — and directly in front of him, knee first, into the chest and up under the chin
      SL.Cinema.shotOn(m, { gogeta: gg, sj }, { subject: 'sj', with: 'gogeta', focus: 'medium', angle: 'three', side: -1 }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cue('light', 'Knee', { auto: 3, slow: 0.4 });
      b.vfx.afterimage(gg.pos, gg.height, 0xfff0b0);
      b.sfx('vanish', gg, { vol: 0.7 });
      K.place(gg, FR.at(b, sj.pos.x - fwd().x * 0.9, sj.pos.z - fwd().z * 0.9), gg.yaw);
      K.faceTo(gg, sj.pos);
      gg.setState('scripted', { pose: 'gg_knee', expression: 'cold', speed: 40 });
      sj.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 30 });
      hit(sj.chest().add(new V3(0, 0.3, 0)), 2);
      m.progress('combo', 2);
      yield* m.cine(0.5);
      // 3 — THE REVERSE KICK: as he reels back, Gogeta turns his back on him and drives a heel up into his jaw
      K.place(sj, FR.at(b, sj.pos.x + fwd().x * 0.4, sj.pos.z + fwd().z * 0.4), sj.yaw);
      K.faceTo(sj, gg.pos);
      gg.setState('scripted', { pose: 'gg_backKickW', expression: 'cold', speed: 30 });
      sj.setState('scripted', { pose: 'sj_reel', expression: 'hurt', speed: 20 });
      m.shot((t, out) => {
        const mid = gg.chest().lerp(sj.chest(), 0.5);
        out.pos.copy(mid).addScaledVector(left(), 4.4).add(new V3(0, -0.1, 0));
        out.look.copy(mid).add(new V3(0, 0.25, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cue('heavy', 'Reverse kick', { auto: 3, slow: 0.4 });
      gg.setState('scripted', { pose: 'gg_backKick', expression: 'cold', speed: 44 });
      sj.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 30 });
      hit(sj.headPos(), 2);
      m.progress('combo', 3);
      yield* m.cine(0.5);
      // 4 — THE FLURRY, side on and wide: three fists too fast to see, three shockwaves through his body
      gg.setState('scripted', { pose: 'gg_fight', expression: 'cold', speed: 30 });
      m.shot((t, out) => {
        const mid = gg.chest().lerp(sj.chest(), 0.5);
        out.pos.copy(mid).addScaledVector(left(), -7).add(new V3(0, 0.2, 0));
        out.look.copy(mid);
        out.fov = 40;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cue('light', 'Flurry', { auto: 3, slow: 0.4 });
      for (let i = 0; i < 3; i++) {
        gg.setState('scripted', { pose: i % 2 ? 'gg_cross' : 'gg_jab', expression: 'cold', speed: 70 });
        sj.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 40 });
        const p = sj.chest().add(new V3(0, -0.15 + i * 0.15, 0));
        b.vfx.ring(p, 0.7 + i * 0.25, 0xfff4d8, 0.28, fwd());
        hit(p, 2);
        yield* m.cine(0.14);
      }
      m.progress('combo', 4);
      // 5 — THE DOUBLE PALM: square on, both open hands into his chest — and he goes end over end
      m.shot((t, out) => {
        const mid = gg.chest().lerp(sj.chest(), 0.45);
        out.pos.copy(mid).addScaledVector(left(), 3.6).addScaledVector(fwd(), -0.8).add(new V3(0, -0.25, 0));
        out.look.copy(mid).add(new V3(0, 0.1, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cue('heavy', 'Double palm', { auto: 3, slow: 0.4 });
      gg.setState('scripted', { pose: 'gg_palms', expression: 'cold', speed: 50 });
      const pc = sj.chest();
      b.vfx.ring(pc, 1.6, 0xfff0c0, 0.4, fwd());
      b.vfx.flash(pc, 1, 0xfff4d8, 0.14, SL.Toon.tex.glow);
      hit(pc, 3);
      b.slowmo(0.35, 0.4);
      m.progress('combo', 5);
      m.complete('combo');
      // he tumbles away and comes to a stop in the air, dazed; Gogeta has already turned his back on him
      const dir = fwd(), p0 = sj.pos.clone();
      // off to one side of the line, so the lenses in front of Gogeta see him clear of Gogeta's body
      const dest = FR.at(b, p0.x + dir.x * 12 + dir.z * 3, p0.z + dir.z * 12 - dir.x * 3).add(new V3(0, 3, 0));
      sj.setState('scripted', { pose: 'sj_tumble', expression: 'hurt', speed: 20 });
      let tf = 0;
      const tumble = () => {
        tf++;
        const k = Math.min(1, tf / 54), e = 1 - (1 - k) * (1 - k);
        const p = p0.clone().lerp(dest, e);
        p.y += Math.sin(Math.PI * k) * 2.2;
        sj.setPosition(p);
        sj.grounded = false;
      };
      m.tickHooks.push(tumble);
      yield* m.cine(0.3);
      // behind Gogeta: Janemba flying away past him — and then he turns his back on it, toward the lens
      const gp = gg.pos.clone();
      m.shot((t, out) => {
        out.pos.copy(gp).addScaledVector(dir, -4.6).addScaledVector(new V3(dir.z, 0, -dir.x), 1.4).add(new V3(0, 1.45, 0));
        out.look.copy(gp).addScaledVector(dir, 3).add(new V3(0, 1.4, 0));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(0.3);
      const g0 = gg.yaw, g1 = g0 + Math.PI;
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'cold', speed: 12 });
      let gt = 0;
      const turn = () => {
        gt++;
        const k = Math.min(1, gt / 16), e = k * k * (3 - 2 * k);
        gg.yaw = gg.prevYaw = g0 + (g1 - g0) * e;
      };
      m.tickHooks.push(turn);
      yield () => tf >= 54;
      K.unhook(m, tumble);
      K.unhook(m, turn);
      gg.yaw = gg.prevYaw = U.wrapAngle(g1);
      sj.setState('scripted', { pose: 'sj_reel', expression: 'hurt', speed: 6 });
      sj.untargetable = false;
      sj.intangible = false;
      // THE STARDUST BREAKER (see breaker() above), made with his back to Janemba
      sj.vel.set(0, 0, 0);
      gg.target = sj;
      const { space } = yield* breaker(m, gg, sj);
      m.limits(null);
      m.lock(true);
      K.clearCombat(b);
      // THE PURIFICATION: he freezes; light of every colour bleeds out through his skin, his eyes and his
      // mouth; he tries to scream; and he comes apart, piece by piece, into harmless glittering dust that
      // floats away into the pink sky — no explosion, no white frame
      const f1 = sj.pos.clone().sub(gg.pos).setY(0).normalize(), l1 = new V3(f1.z, 0, -f1.x);
      const dust = SL.Dimension.stardust(b, sj, { frames: 200, hideAt: 0.72, leak: true, apart: [0.42, 0.72], tint: 1.35 });
      const evil = () => {
        if (dust.k > 0.4 || b.frame % 2) return;
        const c = sj.pos.clone().add(new V3(Math.sin(b.frame * 1.7) * 0.5, sj.height * (0.3 + (b.frame * 0.05) % 0.6), Math.cos(b.frame * 1.1) * 0.5));
        b.vfx.sparks(c, dust.k < 0.2 ? 0x3a0a4a : SL.Dimension.PRISM[b.frame % SL.Dimension.PRISM.length], 4, 3, 0.1);
      };
      m.tickHooks.push(evil);
      yield () => dust.k >= 0.2;
      // his face: the light pouring out of the eyes and the open mouth
      m.shot((t, out) => {
        const hd = sj.headPos();
        out.pos.copy(hd).addScaledVector(f1, -1.9).addScaledVector(l1, 0.5).add(new V3(0, -0.3, 0));
        out.look.copy(hd).add(new V3(0, 0.05, 0));
        out.fov = 38;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: sj, aimFree: true });
      yield () => dust.k >= 0.4;
      // wide and from under him: the pieces of him floating up into the pink sky as dust
      sj.setState('scripted', { pose: 'sj_purify', expression: 'shout', speed: 6 });
      m.shot((t, out, el) => {
        out.pos.copy(sj.pos).addScaledVector(f1, -5).addScaledVector(l1, 2).add(new V3(0, -1.2 + el * 0.2, 0));
        out.look.copy(sj.pos).add(new V3(0, 1.1 + el * 0.4, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield () => dust.k >= 0.86;
      K.unhook(m, evil);
      // the young ogre falls out of the air and lands on his backside on the jellybean ground
      const sk = S.saike;
      sk.setHidden(false);
      sk.setPosition(sj.pos.clone().add(new V3(0, 0.6, 0)));
      sk.grounded = false;
      sk.vel.set(0, 0, 0);
      sk.setState('scripted', { pose: 'so_shock', expression: 'shock' });
      K.faceTo(sk, gg.pos);
      FR.warp(b, 0.75, 3);
      SL.Cinema.shotOn(m, { saike: sk }, { subject: 'saike', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      const floor = FR.at(b, sk.pos.x, sk.pos.z).y;
      let vy = 0, landed = false;
      const fall = () => {
        if (landed) return;
        vy -= 22 / 60;
        const p = sk.pos.clone();
        p.y = Math.max(floor, p.y + vy / 60);
        sk.setPosition(p);
        if (p.y <= floor) {
          landed = true;
          K.place(sk, FR.at(b, p.x, p.z), sk.yaw);
          sk.setState('scripted', { pose: 'so_sit', expression: 'shock', speed: 30 });
          b.vfx.dust(sk.pos.clone(), 0.8, 8, 0xffb0d4);
          b.sfx('groundImpact', sk, { vol: 0.5 });
          b.cameraTraumaAt(sk.pos, 0.15);
        }
      };
      m.tickHooks.push(fall);
      yield () => landed;
      yield* m.cine(0.6);
      K.unhook(m, fall);
      // he looks round: where is he, what happened (the lens side on, so nothing behind him shows)
      const toG = gg.pos.clone().sub(sk.pos).setY(0).normalize(), sl = new V3(toG.z, 0, -toG.x);
      sk.setState('scripted', { pose: 'so_lookAround', expression: 'shock', speed: 10 });
      m.shot((t, out) => {
        const hd = sk.headPos();
        out.pos.copy(hd).addScaledVector(sl, 2.2).addScaledVector(toG, -0.4).add(new V3(0, 0.05, 0));
        out.look.copy(hd).add(new V3(0, -0.15, 0));
        out.fov = 40;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: sk, face: true });
      m.say('saike_oni', 'Wh-what happened...? Where am I...?', 2.2, { style: 'quiet' });
      yield* m.cine(2.2);
      // Gogeta, standing over him: he walked up while the boy looked the other way
      K.place(gg, FR.at(b, sk.pos.x + toG.x * 1.7, sk.pos.z + toG.z * 1.7), 0);
      K.faceTo(gg, sk.pos);
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'cold', speed: 30 });
      gg.anim.play('gg_coldStand', 8, { snap: true });
      sk.setState('scripted', { pose: 'so_lookUp', expression: 'shock', speed: 14 });
      // the boy's eye view: up, and up, at the towering stoic face
      m.shot((t, out, el) => {
        out.pos.copy(sk.headPos()).addScaledVector(toG, 0.15).add(new V3(0, -0.05, 0));
        out.look.copy(gg.headPos()).add(new V3(0, -0.05, 0));
        out.fov = 52 - el * 3;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: gg, face: true });
      yield* m.cine(1.5);
      // the yelp
      sk.setState('scripted', { pose: 'so_shock', expression: 'forced', speed: 30 });
      m.shot((t, out) => {
        const hd = sk.headPos();
        out.pos.copy(hd).addScaledVector(toG, 1.4).addScaledVector(sl, 0.35).add(new V3(0, 0.15, 0));
        out.look.copy(hd);
        out.fov = 40;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: sk, face: true });
      m.say('saike_oni', 'AAAAAAH!', 1.2, { style: 'shout' });
      b.sfx('giggle', sk, { pitch: 1.8, vol: 0.5 });
      yield* m.cine(1.1);
      // ...and he scrambles away as fast as his little legs can carry him
      sk.setState('scripted', { pose: 'so_run', expression: 'shock', speed: 20 });
      const away = sk.pos.clone().addScaledVector(toG, -18);
      const from = sk.pos.clone();
      let n = 0;
      const run = () => {
        n++;
        const k = Math.min(1, n / 80);
        const p = from.clone().lerp(away, k);
        p.y = FR.at(b, p.x, p.z).y;
        sk.setPosition(p);
        sk.yaw = sk.prevYaw = Math.atan2(away.x - from.x, away.z - from.z);
      };
      m.tickHooks.push(run);
      m.shot((t, out) => {
        out.pos.copy(gg.pos).addScaledVector(toG, 2.2).addScaledVector(sl, -1.1).add(new V3(0, 1.5, 0));
        out.look.copy(sk.pos).add(new V3(0, 0.5, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(1.5);
      K.unhook(m, run);
      sk.setHidden(true);
      // the stone face breaks: a warm, confident smile — peace in the afterlife
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'warm', speed: 4 });
      m.shot((t, out, el) => {
        const hd = gg.headPos(), fw = gg.forward;
        out.pos.copy(hd).addScaledVector(fw, 1.45 - el * 0.1).addScaledVector(new V3(-fw.z, 0, fw.x), 0.45).add(new V3(0, -0.1, 0));
        out.look.copy(hd).add(new V3(0, 0.1, 0));
        out.fov = 32;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: gg, face: true });
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  P.farewell = {
    id: 'farewell',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // the fusion runs out before either of them can take in what he did
      const gg = S.gogeta;
      if (S.fusion && S.fusion.active) {
        b.vfx.flash(gg.chest(), 3, 0xfff0b0, 0.4, SL.Toon.tex.glow);
        b.sfx('capsulePop', gg, { pitch: 0.8 });
        SL.Fusion.defuse(b, S.fusion, { to: S.goku, timeUp: true });
      }
      S.fusion = null;
      S.sj.setHidden(true);
      S.saike.setHidden(true);
      const field = FR.lm(b, 'field');
      for (const [f, dx] of [[S.goku, -1.2], [S.vegeta, 1.2]]) {
        f.setHidden(false);
        f.controller = K.scripted();
        if (f.formIndex !== 0) f.applyForm(0);
        K.place(f, FR.at(b, field.x + dx, field.z - 6), Math.PI);
        f.yaw = f.prevYaw = Math.PI;
        FR.halo(b, f);
        if (f.halo) f.halo.userData.off = false;
      }
      b.switchPlayer(S.goku, { force: true });
      S.goku.controller = K.scripted();
      yield* SL.Cinema.play(m, 'fr_farewell');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.6);
      yield* m.cine(1.8);
      m.title('MOVIE · NOT CANON', 'FUSION REBORN', 'The end · Gogeta joins the roster', 5);
      yield* m.cine(5.2);
    },
  };

  const def = {
    id: 'fr_gogeta',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'Gogeta',
    subtitle: 'The Other World · not canon',
    character: 'gogeta',
    stage: 'other_world',
    parTime: 420,
    lockForms: FR.LOCKS,
    qteLabel: 'Pikkon, dance, evade, finish',
    formSongs: true,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Pikkon buys them the time it costs him. The dance again — perfectly this time. Super Saiyan Gogeta, a blade caught between two fingers, and a light that does not destroy Janemba: it cleans him.',
    rewards: ['Gogeta (playable)', 'Movie complete: Fusion Reborn'],
    setup,
    phases: [P.pikkon, P.dance, P.birth, P.dominate, P.finish, P.farewell, P.after],
  };

  SL.data.frGogeta = { GG, PK, column, bladeGap };
  SL.data.missions[def.id] = def;
})();
