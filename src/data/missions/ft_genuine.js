/*
 * CHAPTER 19 · FUTURE TRUNKS — "A Genuine Saiyan" (canon; played as Vegeta). The owner's moveset roadmap §8.18,
 * mission 3 (roadmap #45: Super Saiyan Blue Vegeta's beatdown of Goku Black). Back from his training, Vegeta returns
 * to Trunks' future and takes Rosé apart. Lines are paraphrased and written for this project.
 *
 *   ARRIVE *   (staged)  the Time Machine in the square; Rosé waiting; Vegeta walks out ahead of everyone; Super Saiyan
 *                        Blue in a blinding burst of cyan; a blur — his hand over Black's face, the head driven into
 *                        the street
 *   BEATDOWN * (played)  Blue Vegeta against Rosé: this time Black is the one outclassed. Land the blows (a count on
 *                        screen) — the stretch ends when you have landed them, or when he is down to his floor
 *   THE WALL   (staged)  Vegeta drags him through the wall of a building and buries fists and an elbow in his gut
 *   THE THROW  (staged)  lifted by the collar, the speech (paraphrased), thrown into the sky, and the Final Flash
 *                        swallows him; the smoke clears and Black is still there, laughing (no wound shown)
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const PZ = SL.data.poses;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  const TU = { blows: 15, blackFloor: 0.25, vegetaFloor: 0.25, blackTaken: 1.1, blackDealt: 0.55 };
  const SPOT = { vegeta: [0, -5], black: [0, 7], machine: [-7, -11] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const CYAN = 0x4ad8ff;
  // the scene's Final Flash: a real beam that ends on him and does no damage of its own (the story does)
  const FINAL_FLASH = {
    id: 'finalFlashGenuine', name: 'Final Flash', type: 'beam', damage: [0, 0], radius: [1.6, 1.6], speed: 90, range: 120, sustain: 120,
    color: 0xffe14a, core: 0xffffff, style: { rings: 3, ringColor: 0xfff3a0, ringSpeed: 2 },
  };

  // the beatdown's own poses (hands are [left, right])
  // the hand over his face, driving the head down into the street
  PZ.v_faceSlam = PZ.v_faceSlam || {
    hands: ['fist', 'open'],
    root: { y: -0.32, rx: 30 }, spine: [24, 0, 0], chest: [16, 0, 0], head: [-20, 0, 0],
    shoulderL: [-20, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-64, 0, -4], elbowR: [-8, 0, 0],
    thighL: [-70, 0, 10], kneeL: [80, 0, 0], thighR: [10, 0, -10], kneeR: [40, 0, 0],
  };
  // one arm straight up and out, a fist in a collar, the other fist at his side
  PZ.v_collarLift = PZ.v_collarLift || {
    hands: ['fist', 'fist'],
    root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 0],
    shoulderL: [-8, 0, 14], elbowL: [-30, 0, 0], shoulderR: [-150, 0, 6], elbowR: [-12, 0, 0],
    thighL: [-20, 0, 14], kneeL: [26, 0, 0], thighR: [12, 0, -14], kneeR: [18, 0, 0],
  };
  // hanging by the collar: arms loose, legs dangling, the head back
  PZ.gb_held = PZ.gb_held || {
    hands: ['open', 'open'],
    root: { rx: -6 }, spine: [-6, 0, 0], chest: [-8, 0, 0], neck: [-10, 0, 0], head: [-18, 0, 0],
    shoulderL: [8, 0, 12], elbowL: [-20, 0, 0], shoulderR: [8, 0, -12], elbowR: [-20, 0, 0],
    thighL: [-10, 0, 4], kneeL: [22, 0, 0], footL: [30, 0, 0], thighR: [4, 0, -4], kneeR: [28, 0, 0], footR: [30, 0, 0],
  };

  function setup(b) {
    const S = (b.story = {});
    S.vegeta = b.spawn({ charId: 'vegeta', team: 0, player: true, pos: at(b, 'vegeta'), startKi: 80 });
    S.vegeta._playerController = S.vegeta.controller;
    S.black = b.spawn({ charId: 'goku_black', team: 1, pos: at(b, 'black'), startKi: 80 });
    for (const f of Object.values(S)) f.cannotDie = true;
    K.faceTo(S.vegeta, S.black.pos);
    K.faceTo(S.black, S.vegeta.pos);
    return S;
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  /** Move a body over frames (skip-safe: a skip lands it at once). */
  function* glide(m, f, to, frames, arc = 0) {
    const b = m.battle, from = f.pos.clone();
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / frames));
      const p = from.clone().lerp(to, k);
      p.y += Math.sin(k * Math.PI) * arc;
      f.grounded = false;
      f.setPosition(p);
      f.vel.set(0, 0, 0);
      return k >= 1;
    };
  }

  /** The city building nearest a point (the wall he goes through), or null. */
  function wallNear(b, p) {
    let best = null, bd = Infinity;
    for (const o of b.stage.obstacles || []) {
      if (!o.alive || !o.building) continue;
      const d = Math.hypot(o.x - p.x, o.z - p.z);
      if (d >= 10 && d < bd) (best = o), (bd = d);
    }
    return best;
  }

  const P = {};

  P.arrive = { id: 'arrive', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    K.toForm(v, 'base');
    K.toForm(bk, 'rose');
    v.controller = K.scripted();
    bk.controller = K.scripted();
    K.place(v, at(b, 'vegeta'), 0);
    K.place(bk, at(b, 'black'), Math.PI);
    S.machine = K.timeMachine(b, at(b, 'machine'));
    m.onDispose(() => K.propGone(b, S.machine));
    v.setHidden(true);
    m.music('last_hope', 1);
    const tm = at(b, 'machine');
    m.shot((t, out) => K.camAt(out, tm.clone().add(new V3(9, 1.2, 12)), tm.clone().add(new V3(0, 2, 0)), 54), 999, { cut: true, blendIn: 0, hold: true });
    SL.ScreenFX.flash(0.35, '#e8f4ff');
    b.sfx('timeWarp', null, { at: tm, vol: 1 });
    m.title(CHAPTER, 'A GENUINE SAIYAN', 'Future · the square again', 3.4);
    yield* st.wait(2.2);
    v.setHidden(false);
    K.faceTo(v, bk.pos);
    K.pose(v, 'idle', 'serious', 6);
    K.pose(bk, 'gb_idle', 'smirk', 4);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'low' }, 999);
    m.say('goku_black', 'Vegeta. Back from the past so soon? You must enjoy losing.', 3);
    yield* st.wait(3);
    shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999);
    m.say('vegeta', 'Stay out of this, Kakarot. This fake is mine.', 2.6);
    yield* st.wait(2.6);
    m.endShot();
    b.skipRequested = false;
    // Super Saiyan Blue: a blinding burst of cyan
    yield* SL.data.cinematics.transform(m, { fighter: v, formIndex: K.formIndex(v, 'blue'), witness: bk, witnessLine: 'Blue again? It changes nothing.', music: 4 });
    K.toForm(v, 'blue');
    m.endShot();
    b.skipRequested = false;
    v.controller = K.scripted();
    bk.controller = K.scripted();
    SL.ScreenFX.flash(0.4, '#bff4ff');
    b.vfx.ring(v.pos.clone().add(new V3(0, 0.4, 0)), 14, CYAN, 0.8, new V3(0, 1, 0));
    // a blur: the hand over his face, the head driven into the street
    K.faceTo(bk, v.pos);
    const front = bk.pos.clone().add(new V3(Math.sin(bk.yaw), 0, Math.cos(bk.yaw)).multiplyScalar(0.9));
    b.sfx('vanish', v, { vol: 0.9 });
    K.place(v, K.ground(b, front), 0);
    K.faceTo(v, bk.pos);
    K.pose(v, 'v_faceSlam', 'angry', 30);
    K.pose(bk, 'knockdownFace', 'hurt', 30);
    const hd = bk.pos.clone();
    if (!b.skipRequested) {
      b.vfx.impact(hd.clone().add(new V3(0, 0.3, 0)), 4, CYAN);
      b.vfx.dust(hd.clone(), 2.4, 16);
      b.sfx('groundImpact', bk, { vol: 1.2 });
      b.cameraTraumaAt(hd, 0.7);
    }
    b.stage.crater(hd.clone(), 1.8, 0.4, bk);
    m.flags.slam = true;
    m.shot((t, out) => {
      const mid = v.chest().lerp(hd.clone().add(new V3(0, 0.3, 0)), 0.5);
      K.camAt(out, mid.clone().add(new V3(Math.cos(v.yaw) * 4.4, 0.2, -Math.sin(v.yaw) * 4.4)), mid, 46);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Get up. I\'m not finished.', 2, { style: 'quiet' });
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
  } };

  P.beat = { id: 'beat', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, bk = S.black;
    stage(m);
    K.toForm(v, 'blue');
    K.toForm(bk, 'rose');
    bk.setHidden(false);
    bk.untargetable = bk.intangible = v.untargetable = v.intangible = false;
    if (v.pos.distanceTo(bk.pos) < 3) K.place(bk, K.ground(b, v.pos.clone().add(new V3(0, 0, 5))), Math.PI);
    v.hp = v.hpMax;
    bk.hp = bk.hpMax;
    v.ki = Math.max(v.ki, v.kiMax * 0.6);
    v.controller = v._playerController || (v._playerController = new SL.PlayerController(b));
    b.switchPlayer(v, { force: true, quiet: true });
    v.target = bk;
    bk.target = v;
    bk.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, bk.def.ai, { aggression: 0.6, defense: 0.4, transformHp: 0 }) });
    v.setState('free');
    bk.setState('free');
    m.title(CHAPTER, 'A GENUINE SAIYAN', 'Super Saiyan Blue Vegeta vs Super Saiyan Rosé', 2.4);
    m.objective('beat', 'Take him apart — land your blows', { icon: 'fist', target: TU.blows });
    m.music('vegeta_theme', 5);
    let blows = 0;
    const offD = b.on('damage', (e) => {
      if (e.attacker === v && e.target === bk && !e.blocked) m.progress('beat', ++blows);
    });
    m.onDispose(offD);
    const sf = m.storyFight({
      floors: [{ f: bk, at: TU.blackFloor }], dealt: [{ f: bk, mul: TU.blackDealt }], taken: [{ f: bk, mul: TU.blackTaken }],
      fighters: [v, bk], space: 'ground',
    });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => blows >= TU.blows || sf.floored(bk) || v.hpFrac < TU.vegetaFloor || m.state !== 'running';
    offD();
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    m.flags.blows = blows;
    m.qteParts.push(blows >= TU.blows || sf.floored(bk) ? 1 : 0.5);
    m.complete('beat');
  } };

  P.wall = { id: 'wall', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    v.controller = K.scripted();
    bk.controller = K.scripted();
    K.toForm(v, 'blue');
    K.toForm(bk, 'rose');
    K.place(v, K.ground(b, v.pos.clone()), 0);
    // dragged through the wall of the nearest building
    const wall = wallNear(b, v.pos);
    const into = wall ? new V3(wall.x - v.pos.x, 0, wall.z - v.pos.z).normalize() : new V3(0, 0, 1);
    // through it and out the far side, into the next street
    const inside = wall ? K.ground(b, new V3(wall.x, 0, wall.z).addScaledVector(into, wall.r + 1.6)) : K.ground(b, v.pos.clone().addScaledVector(into, 14));
    K.place(bk, K.ground(b, v.pos.clone().addScaledVector(into, 0.9)), 0);
    K.faceTo(v, bk.pos);
    K.faceTo(bk, v.pos);
    K.pose(v, 'grab', 'angry', 20);
    K.pose(bk, 'hitBody', 'hurt', 20);
    const side = new V3(into.z, 0, -into.x);
    m.shot((t, out) => K.camAt(out, v.chest().addScaledVector(side, 7).add(new V3(0, 1, 0)), v.chest().addScaledVector(into, 2), 50), 999, { cut: true, blendIn: 0, hold: true });
    const bkTo = inside.clone().addScaledVector(into, 0.9);
    b.sfx('dash', v, { vol: 1 });
    let n = 0;
    const v0 = v.pos.clone(), b0 = bk.pos.clone(), frames = 34;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : Math.min(1, n / frames);
      v.setPosition(v0.clone().lerp(inside, k));
      bk.setPosition(b0.clone().lerp(bkTo, k));
      v.vel.set(0, 0, 0);
      bk.vel.set(0, 0, 0);
      if (wall && wall.alive && k > 0.55) b.stage.destroyPillar(wall);
      return k >= 1;
    };
    if (wall && wall.alive) b.stage.destroyPillar(wall);
    m.flags.wall = !!wall && !wall.alive;
    K.faceTo(v, bk.pos);
    K.faceTo(bk, v.pos);
    // fists and an elbow in his gut, close and side-on in the dust
    m.shot((t, out) => {
      const c = v.chest().lerp(bk.chest(), 0.5);
      K.camAt(out, c.clone().addScaledVector(side, 3.4).add(new V3(0, -0.3, 0)), c, 42);
    }, 999, { cut: true, blendIn: 0, hold: true });
    const blows = ['v_gut', 'v_gutW', 'v_gut', 'v_gutW', 'v_gut', 'v_gutW', 'v_gut', 'v_elbowW', 'v_elbow'];
    for (let i = 0; i < blows.length && !b.skipRequested; i++) {
      const strike = !/W$/.test(blows[i]);
      K.pose(v, blows[i], 'angry', 26);
      if (strike) {
        K.pose(bk, i % 4 === 0 ? 'hitBody' : 'stagger', 'hurt', 26);
        b.vfx.impact(bk.chest(), i === blows.length - 1 ? 3 : 2, CYAN);
        b.sfx(i === blows.length - 1 ? 'punchHeavy' : 'punchLight', bk, { vol: 1 });
        b.cameraTraumaAt(bk.chest(), 0.25);
        m.flags.gut = (m.flags.gut || 0) + 1;
      }
      yield* st.wait(strike ? 0.16 : 0.1);
    }
    K.pose(bk, 'stagger', 'hurt', 10);
    yield* st.wait(0.6);
    m.endShot();
    b.skipRequested = false;
  } };

  P.flash = { id: 'flash', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    v.controller = K.scripted();
    bk.controller = K.scripted();
    K.toForm(v, 'blue');
    K.toForm(bk, 'rose');
    // out into the street again, Black held up by the collar
    K.place(v, K.ground(b, v.pos.clone()), v.yaw);
    const fwd = new V3(Math.sin(v.yaw), 0, Math.cos(v.yaw));
    K.pose(v, 'v_collarLift', 'angry', 12);
    K.pose(bk, 'gb_held', 'hurt', 12);
    const hang = () => {
      v.model.root.updateMatrixWorld(true);
      const h = v.handPos('R');
      bk.grounded = false;
      bk.setPosition(new V3(h.x, h.y - 1.45, h.z).addScaledVector(fwd, 0.15));
      bk.vel.set(0, 0, 0);
    };
    bk.yaw = bk.prevYaw = v.yaw + Math.PI;
    m.tickHooks.push(hang);
    hang();
    m.shot((t, out) => {
      const c = v.chest().lerp(bk.chest(), 0.5);
      const side = new V3(fwd.z, 0, -fwd.x);
      K.camAt(out, c.clone().addScaledVector(side, 3.2).addScaledVector(fwd, -0.6).add(new V3(0, -0.2, 0)), c, 44);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Shall I tell you where you went wrong? You\'re a counterfeit. A thief.', 3.2);
    yield* st.wait(3.2);
    // his face, from beside the arm that holds him up
    m.shot((t, out) => {
      const h = v.headPos(), side = new V3(fwd.z, 0, -fwd.x);
      K.camAt(out, h.clone().addScaledVector(side, 1.8).addScaledVector(fwd, 0.4).add(new V3(0, -0.2, 0)), h, 38);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'That body\'s power was earned in battle after battle — and only a real Saiyan can draw it out.', 3.8);
    yield* st.wait(3.8);
    m.say('vegeta', 'You? You\'re just some impostor calling himself Goku!', 3, { style: 'shout' });
    yield* st.wait(3);
    K.removeHook(m, hang);
    // thrown up into the sky
    K.pose(v, 'throwRelease', 'shout', 24);
    K.pose(bk, 'tumble', 'hurt', 16);
    b.sfx('punchHeavy', bk, { vol: 1.1 });
    const sky = bk.pos.clone().addScaledVector(fwd, 10).add(new V3(0, 24, 0));
    m.shot((t, out) => K.camAt(out, v.pos.clone().addScaledVector(fwd, -3).add(new V3(0.8, 0.4, 0)), bk.chest(), 54), 999, { cut: true, blendIn: 0, hold: true });
    yield* glide(m, bk, sky, 40);
    bk.setState('scripted', { pose: 'tumble', expression: 'hurt' });
    m.flags.thrown = true;
    // the Final Flash
    K.faceTo(v, bk.pos);
    v.setState('scripted', { pose: 'v_finalFlashCharge', expression: 'shout', speed: 16, aura: 1 });
    b.sfx('beamCharge', v, { vol: 1.1 });
    m.shot((t, out) => {
      const c = v.chest();
      K.camAt(out, c.clone().addScaledVector(fwd, 3).add(new V3(0.6, 0.1, 0)), c.clone().add(new V3(0, 0.3, 0)), 44);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'FINAL...', 1.6, { style: 'shout' });
    let n = 0;
    yield () => {
      n++;
      if (n % 6 === 0 && !b.skipRequested) {
        b.vfx.flash(v.handPos('L'), 0.7, 0xffe14a, 0.12, SL.Toon.tex.glow);
        b.vfx.flash(v.handPos('R'), 0.7, 0xffe14a, 0.12, SL.Toon.tex.glow);
      }
      return n >= 80 || b.skipRequested;
    };
    const ctx = { b, m };
    if (!b.skipRequested) {
      bk.intangible = true;
      v.setState('scripted', { pose: 'beamFire', expression: 'shout', speed: 20, aura: 1 });
      SL.Cinema.beam(ctx, v, bk, FINAL_FLASH);
      b.sfx('beamFire', v, { vol: 1.4, pitch: 0.75 });
      b.cameraTraumaAt(v.chest(), 0.8);
      m.say('vegeta', '...FLASH!', 1.6, { style: 'shout' });
      const pin = () => SL.Cinema.pinBeam(ctx, 0xfff3a0);
      m.tickHooks.push(pin);
      // up the length of it, over his shoulder
      m.shot((t, out) => K.camAt(out, v.chest().addScaledVector(fwd, -2.6).add(new V3(0.9, 0.6, 0)), bk.chest(), 52), 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1.2);
      // wide: the light swallowing him in the sky
      m.shot((t, out) => {
        const mid = v.chest().lerp(bk.chest(), 0.5);
        const side = new V3(fwd.z, 0, -fwd.x);
        K.camAt(out, mid.clone().addScaledVector(side, 30).add(new V3(0, -4, 0)), mid, 56);
      }, 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1.4);
      K.removeHook(m, pin);
    }
    if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
    b.vfx.explosion(bk.chest(), 4, 0xfff0a0, { smoke: true });
    b.sfx('explosionBig', bk, { vol: 1.2 });
    m.flags.finalFlash = true;
    bk.intangible = false;
    yield* st.wait(1);
    // the smoke clears: torn up, and laughing
    const land = K.ground(b, v.pos.clone().addScaledVector(fwd, 9));
    K.place(bk, land, 0);
    K.faceTo(bk, v.pos);
    K.faceTo(v, bk.pos);
    K.pose(v, 'idle', 'serious', 8);
    K.pose(bk, 'defeatKneel', 'grit', 6);
    b.vfx.dust(land.clone(), 2, 12);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'low' }, 999);
    m.say('goku_black', 'Ha... ha ha ha! Splendid, Vegeta. Every blow you land, this body learns from.', 3.6, { style: 'quiet' });
    yield* st.wait(3.6);
    shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999);
    m.say('vegeta', 'Then learn this. Next time, there won\'t be anything left of you to learn with.', 3.2);
    yield* st.wait(3.2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'A GENUINE SAIYAN', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.ftGenuine = { TU };
  SL.data.missions.ft_genuine = {
    id: 'ft_genuine', canon: true, chapter: CHAPTER, title: 'A Genuine Saiyan', character: 'vegeta', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · the prince returns', parTime: 300, qteLabel: 'The beatdown',
    blurb: 'Back from his training, Vegeta walks out ahead of everyone and takes Super Saiyan Rosé apart — then tells the impostor exactly what he got wrong.',
    lockForms: {
      vegeta: SL.data.characters.vegeta.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Vegeta\'s beatdown of Goku Black'],
    setup,
    phases: [P.arrive, P.beat, P.wall, P.flash],
  };
})();
