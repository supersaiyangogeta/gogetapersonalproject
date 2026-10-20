/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 6: "Desperate Alliance" (the lava wasteland, then Piccolo's plateau)
 *
 *   BARRAGE *  (survive)              Super Saiyan Broly over the boiling rock, throwing green spheres in every
 *                                     direction: Super Saiyan Blue Goku has to live through it (move, guard, dodge).
 *                                     It ends with Goku knocked back across the magma, boots dug into a rising rock.
 *   TOGETHER   (scene)                Vegeta lands beside him and goes Blue: the two of them shoulder to shoulder
 *                                     from below, the blue auras running into each other. "We fight him together."
 *   DUO *      (play, two heroes)     Goku AND Vegeta against him — switch heroes (the party button); the partner
 *                                     fights on. Hit him from a different angle while he is busy with the other one.
 *   CAUGHT     (staged + cue)         the synchronized rush: Goku's volley, Vegeta's kick from the flank — Broly
 *                                     catches the fist in one hand and the kick in the other, smashes their heads
 *                                     together, pins them; green light gathering in his mouth. Goku gets one arm
 *                                     free — INSTANT TRANSMISSION (Special 2) — a grin over his shoulder at Frieza:
 *                                     "Have fun, Frieza!" Pop. The mouth-cannon blows the lava where they were.
 *                                     Frieza's hand, trembling; Broly turning to look at him.
 *   PICCOLO    (scene)                a grassy plateau far away: the two of them tumble out of the air at Piccolo's
 *                                     boots. The Fusion Dance. Vegeta refuses — then agrees.
 *   AFTER                             the title; next: "The Birth of Gogeta".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project, following the owner's
 * beat text.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;

  const AL = { barrageSeconds: 24, every: 13, blastDamage: 700, duoSeconds: 55, duoMin: 14, flanks: 6, brolyDealt: 0.3 };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));
  const SPOT = { goku: [6, -6], vegeta: [-40, -40], broly: [-4, 10], frieza: [-48, 58], cheelai: [-56, 64], lemo: [-59, 62], piccolo: [0, 0] };

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at('goku'), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at('vegeta'), startKi: 100 });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: at('broly'), startKi: 100 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 1, pos: at('cheelai'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 1, pos: at('lemo'), startKi: 0 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: BK.at(b, 60, 60), startKi: 0 });
    K.toForm(frieza, 'final');
    K.watcher(frieza, 'fz_watch', 'smirk');
    K.watcher(cheelai, 'ch_watch', 'nervous');
    K.watcher(lemo, 'le_watch', 'calm');
    K.watcher(piccolo, 'armsCrossed', 'serious');
    K.watcher(vegeta, 'idle', 'serious');
    piccolo.setHidden(true);
    vegeta.setHidden(true);
    for (const f of [goku, vegeta, broly]) f.cannotDie = true;
    BK.give(goku, 'blue');
    K.toForm(goku, 'blue');
    BK.give(broly, ['wrath', 'ssj']);
    K.toForm(broly, 'ssj');
    for (const f of [frieza, cheelai, lemo]) K.faceTo(f, broly.pos);
    b.story = { goku, vegeta, broly, frieza, cheelai, lemo, piccolo };
  }

  function lava(m) {
    if (m.flags.lava) return;
    m.flags.lava = true;
    BK.lavaReact(m);
  }

  /** One green sphere out of him (the barrage). */
  function sphere(b, br, dir) {
    const from = br.chest().addScaledVector(dir, 1.2);
    b.projectiles.spawnBlast(br, from, dir, { kind: 'ball', speed: 34, radius: 0.75, damage: AL.blastDamage, color: 0x3aff5a, core: 0xe0ffe0, homing: 0, explode: 3.2, knock: 'heavy', knockSpeed: 18, impact: 3, hitstun: 24, life: 3 });
  }

  const P = {};

  P.barrage = {
    id: 'barrage',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      BK.give(g, 'blue');
      K.toForm(g, 'blue');
      K.toForm(br, 'ssj');
      S.vegeta.setHidden(true);
      K.place(g, BK.at(b, SPOT.goku[0], SPOT.goku[1]), 0);
      K.hover(b, br, BK.at(b, SPOT.broly[0], SPOT.broly[1]), 6);
      K.faceTo(br, g.pos);
      K.faceTo(g, br.pos);
      br.controller = K.scripted();
      br.untargetable = true;
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      g.hp = Math.max(g.hp, g.hpMax * 0.85);
      b.switchPlayer(g, { force: true, quiet: true });
      g.setState('free');
      m.title(BK.CHAPTER, 'DESPERATE ALLIANCE', 'The lava wasteland', 2.8);
      m.music('broly_wrath', 3);
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'full', angle: 'low' }, 2.2, { cut: true, blendIn: 0, hold: true });
      b.sfx('roar', br, { pitch: 0.55, vol: 1.4 });
      yield* m.cine(2.2);
      m.endShot();
      const fight = m.storyFight({ floors: [{ f: g, at: 0.4 }] });
      m.objective('survive', 'Survive his barrage', { icon: 'clock', target: AL.barrageSeconds });
      m.objective('clean', 'Take no more than four of them', { icon: 'guard', optional: true });
      m.prompt('bbBarrage', 'dodge', 'Keep moving — dodge through the green spheres, or guard', { when: () => true });
      let hits = 0;
      const offD = b.on('damage', (e) => {
        if (e.target === g && e.attacker === br) {
          hits++;
          if (hits > 4) m.failObjective('clean');
        }
      });
      m.onDispose(offD);
      let t = 0, n = 0, shown = -1;
      const fire = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        n++;
        if (n % AL.every === 0) {
          // every third one at Goku, the rest anywhere
          const a = n * 0.73;
          const dir = n % (AL.every * 3) === 0 ? g.chest().sub(br.chest()).normalize() : new V3(Math.cos(a), -0.35 - (n % 5) * 0.08, Math.sin(a)).normalize();
          sphere(b, br, dir);
          br.setState('scripted', { pose: n % 2 ? 'br_eraser' : 'br_eraserW', expression: 'shout', aura: 1, speed: 20 });
          b.sfx('kiBlast', br, { pitch: 0.6, vol: 0.8 });
        }
        const sec = Math.floor(t);
        if (sec !== shown) m.progress('survive', (shown = sec));
      };
      m.tickHooks.push(fire);
      m.lock(false);
      b.aiLocked = false;
      yield () => t > AL.barrageSeconds || fight.floored(g) || m.state !== 'running';
      K.unhook(m, fire);
      offD();
      if (m.state !== 'running') return;
      m.complete('survive');
      if (hits <= 4) m.complete('clean');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      // knocked back across the magma; the boots dig into a rising rock
      g.controller = K.scripted();
      const away = g.pos.clone().sub(br.pos).setY(0).normalize();
      const s0 = g.pos.clone(), s1 = s0.clone().addScaledVector(away, 18);
      b.vfx.explosion(g.chest(), 1.6, 0x3aff5a, { smoke: true });
      g.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
      m.shot((tt, out) => {
        const sd = new V3(away.z, 0, -away.x);
        out.pos.copy(g.chest()).addScaledVector(sd, 6).addScaledVector(away, -2).add(new V3(0, 1, 0));
        out.look.copy(g.chest());
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let k2 = 0;
      yield () => {
        k2 = Math.min(1, k2 + 1 / 24);
        K.place(g, BK.at(b, U.lerp(s0.x, s1.x, k2), U.lerp(s0.z, s1.z, k2), Math.sin(k2 * Math.PI) * 1.5), g.yaw);
        if (b.frame % 3 === 0 && b.stage.lavaGeyser) b.stage.lavaGeyser(g.pos.clone(), 2);
        return k2 >= 1 || b.skipRequested;
      };
      g.setState('scripted', { pose: 'g_bootDig', expression: 'grit' });
      b.vfx.dust(g.pos.clone(), 1.2, 10, b.stage.def.dust);
      yield* m.cine(0.8);
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.together = {
    id: 'together',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      g.controller = K.scripted();
      v.controller = K.scripted();
      br.controller = K.scripted();
      // Vegeta comes down beside him, and goes Blue
      const side = new V3(g.forward.z, 0, -g.forward.x);
      K.place(v, BK.at(b, g.pos.x + side.x * 1.6, g.pos.z + side.z * 1.6), g.yaw);
      v.setHidden(false);
      v.untargetable = v.intangible = false;
      b.vfx.dust(v.pos.clone(), 1.4, 12, b.stage.def.dust);
      BK.give(v, ['god', 'blue']);
      K.toForm(v, 'blue');
      b.vfx.ring(v.pos.clone().add(new V3(0, 0.3, 0)), 6, 0x2a8aff, 0.5, new V3(0, 1, 0));
      b.sfx('transformBurst', v, { vol: 0.8 });
      K.faceTo(g, br.pos);
      K.faceTo(v, br.pos);
      g.setState('scripted', { pose: 'g_turtleStance', expression: 'determined' });
      v.setState('scripted', { pose: 'v_tfPride', expression: 'serious' });
      if (br.pos.distanceTo(g.pos) > 30 || br.pos.distanceTo(g.pos) < 8) K.hover(b, br, BK.at(b, g.pos.x + g.forward.x * 18, g.pos.z + g.forward.z * 18), 4);
      K.faceTo(br, g.pos);
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      yield* SL.Cinema.play(m, 'bb_al_together');
    },
  };

  P.duo = {
    id: 'duo',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      BK.give(g, 'blue');
      BK.give(v, ['god', 'blue']);
      K.toForm(g, 'blue');
      K.toForm(v, 'blue');
      K.toForm(br, 'ssj');
      v.setHidden(false);
      for (const f of [g, v, br]) {
        f.untargetable = f.intangible = false;
        f.setState('free');
      }
      if (br.pos.distanceTo(g.pos) > 26) K.place(br, BK.at(b, g.pos.x + 10, g.pos.z + 6), 0);
      for (const f of [g, v]) f.hp = Math.max(f.hp, f.hpMax * 0.8);
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      br.legendaryOverride = { stageCap: 2, learnAt: 3 };
      b.switchPlayer(g, { force: true, quiet: true });
      b.setParty([g, v]);
      br.controller = cpu(b);
      br.target = g;
      g.target = br;
      v.target = br;
      const fight = m.storyFight({
        floors: [{ f: g, at: 0.35 }, { f: v, at: 0.35 }, { f: br, at: 0.4 }],
        dealt: [{ f: br, mul: AL.brolyDealt }],
      });
      m.music('ssj_blue', 3);
      m.title(BK.CHAPTER, 'TOGETHER', 'Goku and Vegeta · switch heroes with the party button', 2.6);
      m.objective('flank', 'Hit him from another angle while he is busy with your partner', { icon: 'fist', target: AL.flanks });
      m.objective('switch', 'Fight as both: switch heroes twice', { icon: 'run', optional: true, target: 2 });
      m.prompt('bbParty', 'partyNext', 'Switch heroes: the party button — the other one keeps fighting', { always: true, when: () => true });
      let flanks = 0, switches = 0;
      const offD = b.on('damage', (e) => {
        if (e.target !== br || (e.attacker !== g && e.attacker !== v)) return;
        if (br.target && br.target !== e.attacker && e.amount > 50) m.progress('flank', ++flanks);
      });
      const offS = b.on('playerSwitched', (e) => {
        if (e.to === g || e.to === v) m.progress('switch', ++switches);
      });
      m.onDispose(offD);
      m.onDispose(offS);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (flanks >= AL.flanks && t > AL.duoMin) || t > AL.duoSeconds || fight.floored(br) || (fight.floored(g) && fight.floored(v)) || m.state !== 'running';
      K.unhook(m, clock);
      offD();
      offS();
      if (m.state !== 'running') return;
      m.complete('flank');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      b.party = null;
    },
  };

  P.caught = {
    id: 'caught',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, br = S.broly, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      b.party = null;
      BK.give(g, 'blue');
      BK.give(v, ['god', 'blue']);
      K.toForm(g, 'blue');
      K.toForm(v, 'blue');
      for (const f of [g, v, br]) {
        f.controller = K.scripted();
        f.setHidden(false);
      }
      b.switchPlayer(g, { force: true, quiet: true });
      g.controller = K.scripted();
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      // the synchronized rush: wide, from the side, the two of them going in together
      const c = BK.at(b, 0, 0);
      K.place(br, c.clone(), 0);
      const dir = new V3(0, 0, 1);
      K.place(g, BK.at(b, c.x - 3, c.z - 16), 0);
      K.place(v, BK.at(b, c.x + 3, c.z - 16), 0);
      K.faceTo(g, br.pos);
      K.faceTo(v, br.pos);
      K.faceTo(br, g.pos.clone().lerp(v.pos, 0.5));
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      g.setState('scripted', { pose: 'blastWind', expression: 'shout' });
      v.setState('scripted', { pose: 'flyForward', expression: 'shout' });
      m.shot((t, out) => {
        const mid = g.chest().lerp(v.chest(), 0.5).lerp(br.chest(), 0.4);
        out.pos.copy(mid).add(new V3(14, 2, 0));
        out.look.copy(mid);
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      // Goku's volley, Vegeta curving in from the flank
      let n = 0;
      const v0 = v.pos.clone();
      yield () => {
        n++;
        if (n % 6 === 0 && n < 50) {
          const from = g.handPos ? g.handPos(n % 12 ? 'R' : 'L') : g.chest();
          g.setState('scripted', { pose: n % 12 ? 'blastR' : 'blastL', expression: 'shout', speed: 30 });
          for (let i = 0; i <= 6; i++) b.vfx.trail(from.clone().lerp(br.chest(), i / 6), 0x6ad0ff, 0.3, 0.25);
          b.after(4, () => b.vfx.explosion(br.chest().add(new V3(Math.sin(n) * 0.6, Math.cos(n) * 0.5, 0)), 0.9, 0x6ad0ff, {}));
          b.sfx('kiBlast', g, { pitch: 1.1, vol: 0.7 });
        }
        const k = Math.min(1, n / 60);
        const side = new V3(1, 0, 0);
        const p = v0.clone().lerp(br.pos.clone().addScaledVector(side, 1.7), k).addScaledVector(side, Math.sin(k * Math.PI) * 9);
        K.place(v, BK.at(b, p.x, p.z, 0.6), Math.atan2(br.pos.x - p.x, br.pos.z - p.z));
        if (n % 3 === 0) b.vfx.trail(v.chest(), 0x6ad0ff, 0.5, 0.3);
        return n >= 60 || skip.on;
      };
      // Goku closes in for the fist; Vegeta's kick — both caught
      K.place(g, BK.at(b, br.pos.x - 1.8, br.pos.z - 1.4), 0);
      K.place(v, BK.at(b, br.pos.x + 1.8, br.pos.z - 1.2), 0);
      K.faceTo(g, br.pos);
      K.faceTo(v, br.pos);
      g.setState('scripted', { pose: 'punchR', expression: 'shout' });
      v.setState('scripted', { pose: 'kickR', expression: 'shout' });
      br.setState('scripted', { pose: 'br_catch', expression: 'shout', aura: 1 });
      // from behind Broly, looking at the two of them
      m.shot((t, out) => {
        out.pos.copy(br.chest()).addScaledVector(br.forward, -2.6).add(new V3(0.4, 0.9, 0));
        out.look.copy(g.chest().lerp(v.chest(), 0.5));
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.vfx.impact(g.handPos ? g.handPos('R') : g.chest(), 2, 0xe8fff0);
      b.vfx.impact(v.chest(), 2, 0xe8fff0);
      b.sfx('punchHeavy', br, { pitch: 0.6 });
      b.slowmo(0.3, 0.6);
      yield* wait(1.1);
      // their heads together
      const mid = br.pos.clone().addScaledVector(br.forward, 1.3);
      K.place(g, BK.at(b, mid.x - 0.4, mid.z), 0);
      K.place(v, BK.at(b, mid.x + 0.4, mid.z), 0);
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      g.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      v.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      b.vfx.impact(g.headPos().lerp(v.headPos(), 0.5), 3, 0xffffff);
      b.sfx('punchHeavy', null, { at: mid, pitch: 0.45, vol: 1.4 });
      b.cameraTraumaAt(mid, 0.8);
      SL.Cinema.shotOn(m, { goku: g, vegeta: v }, { subject: 'goku', with: 'vegeta', focus: 'upper' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* wait(0.9);
      // pinned: Goku by the throat, Vegeta under his palm on the rock; green gathering in his mouth
      for (const f of [g, v]) if (f.formIndex !== 0) f.applyForm(0);
      br.setState('scripted', { pose: 'br_liftW', expression: 'shout', aura: 1 });
      const gHold = () => {
        const h = br.handPos ? br.handPos('R') : br.chest();
        g.setPosition(h.clone().add(new V3(0, -1.2, 0)).addScaledVector(br.forward, 0.3));
        g.grounded = false;
      };
      gHold();
      K.place(v, BK.at(b, br.pos.x + br.forward.x * 1.4 - br.forward.z * 1.6, br.pos.z + br.forward.z * 1.4 + br.forward.x * 1.6), 0);
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      const mouthG = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x5aff6a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      b.scene.add(mouthG);
      let mg = 0;
      const mouth = () => {
        if (b.disposed || !mouthG.parent) return false;
        mg++;
        const hd = br.headPos().addScaledVector(br.forward, 0.25);
        mouthG.position.copy(hd);
        mouthG.scale.setScalar(Math.min(2.4, 0.3 + mg * 0.02));
        gHold();
        if (mg % 4 === 0) b.vfx.streamInward(hd, 1.6, 0x5aff6a, 2, 0.1, 0.3);
        return true;
      };
      b.onTick(mouth);
      m.onDispose(() => {
        if (mouthG.parent) b.scene.remove(mouthG);
        mouthG.material.dispose();
      });
      // tight on the two faces in his grip
      m.shot((t, out) => {
        const a = g.headPos(), d = br.headPos().sub(a).setY(0).normalize();
        out.pos.copy(a).addScaledVector(d, -1.2).add(new V3(0.6, 0.15, 0));
        out.look.copy(a).lerp(v.headPos(), 0.3);
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('vegeta', 'Kakarot... do something...!', 1.8);
      yield* wait(1.8);
      // one arm free: two fingers to the forehead
      g.setState('scripted', { pose: 'twoFingers', expression: 'grit' });
      m.objective('it', 'Instant Transmission', { icon: 'teleport' });
      const r = yield* (skip.on ? (function* () {
        return { pressed: false };
      })() : m.cue('s2', 'Instant Transmission! (Special 2)', { auto: 3, slow: 0.4 }));
      m.qteParts.push(r.pressed || skip.on ? 1 : 0.5);
      m.complete('it');
      // the grin over his shoulder at Frieza
      g.setState('scripted', { pose: 'twoFingers', expression: 'grin' });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Have fun, Frieza!', 1.6);
      yield* wait(1.4);
      // pop
      K.unhook(m, mouth);
      BK.vanish(b, g, 0x8ad8ff);
      BK.vanish(b, v, 0x8ad8ff);
      // the mouth cannon goes off into the lava where they were
      if (mouthG.parent) b.scene.remove(mouthG);
      const blast = br.pos.clone().addScaledVector(br.forward, 4);
      b.vfx.explosion(BK.at(b, blast.x, blast.z, 0.5), 4, 0x5aff6a, { smoke: true });
      if (b.stage.lavaGeyser) {
        b.stage.lavaGeyser(blast.clone(), 12);
        b.stage.crater(BK.at(b, blast.x, blast.z), 6, 2, null);
      }
      b.sfx('explosionBig', null, { at: blast, vol: 1.4, pitch: 0.7 });
      b.cameraTraumaAt(blast, 0.9);
      br.setState('scripted', { pose: 'br_roarFire', expression: 'shout', aura: 1 });
      m.shot((t, out) => {
        out.pos.copy(br.pos).add(new V3(16, 4, -10));
        out.look.copy(br.chest());
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* wait(1.6);
      // Frieza, alone with it
      fz.setHidden(false);
      K.place(fz, BK.at(b, br.pos.x - 14, br.pos.z + 12), 0);
      K.faceTo(fz, br.pos);
      fz.setState('scripted', { pose: 'fz_tremble', expression: 'nervous' });
      m.shot((t, out) => {
        const h = fz.handPos ? fz.handPos('R') : fz.chest();
        out.pos.copy(h).addScaledVector(fz.forward, 0.9).add(new V3(0.2, 0.1, 0));
        out.look.copy(h);
        out.fov = 34;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      b.sfx('heartbeat', fz, { vol: 0.9 });
      yield* wait(1.6);
      K.faceTo(br, fz.pos);
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'closeup', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      b.sfx('growl', br, { pitch: 0.5, vol: 1 });
      yield* wait(1.4);
      m.say('frieza', '...Oh dear.', 1.4, { style: 'quiet' });
      yield* wait(1.4);
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.piccolo = {
    id: 'piccolo',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      m.fade('black', 0.4);
      yield* m.cine(0.45);
      for (const f of [S.broly, S.frieza, S.cheelai, S.lemo]) f.setHidden(true);
      b.changeStage('plains');
      m.endShot();
      for (const f of [g, v]) {
        if (f.formIndex !== 0) f.applyForm(0);
        f.controller = K.scripted();
      }
      pc.setHidden(false);
      K.place(pc, BK.at(b, 0, 0), 0);
      // they tumble out of the air at his boots
      K.place(g, BK.at(b, 1.4, 3.2), 0);
      K.place(v, BK.at(b, -1.2, 3.6), 0);
      for (const f of [g, v]) {
        f.setHidden(false);
        f.untargetable = f.intangible = true;
        K.faceTo(f, pc.pos);
      }
      K.faceTo(pc, g.pos.clone().lerp(v.pos, 0.5));
      g.setState('scripted', { pose: 'knockdownFace', expression: 'exhausted' });
      v.setState('scripted', { pose: 'knockdown', expression: 'exhausted' });
      b.vfx.flash(g.chest(), 1.4, 0xdff2ff, 0.16, SL.Toon.tex.glow);
      b.sfx('itPop', g, { pitch: 1.1 });
      b.vfx.dust(g.pos.clone(), 1.2, 10, b.stage.def.terrain.sand);
      m.fade('clear', 0.4);
      yield* SL.Cinema.play(m, 'bb_al_piccolo');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'DESPERATE ALLIANCE', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_alliance',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'Desperate Alliance',
    subtitle: 'Part 6 · The lava wasteland',
    character: 'goku',
    stage: 'broly_lava',
    parTime: 360,
    lockForms: BK.LOCKS,
    qteLabel: 'The escape',
    rules: { allowTransform: true, allowUltimates: true },
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    blurb: 'Two Super Saiyan Blues against one Legendary Super Saiyan, and it is still not enough. There is one way left — and Vegeta would rather die.',
    rewards: ['Movie: Desperate Alliance'],
    setup,
    phases: [P.barrage, P.together, P.duo, P.caught, P.piccolo, P.after],
  };

  SL.data.bbAlliance = { AL };
  SL.data.missions[def.id] = def;
})();
