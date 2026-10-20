/*
 * CHAPTER 17 · RESURRECTION OF F — "Three Minutes" (the finale, after "Blue and Gold").
 * Visual direction: documentation/RESURRECTION_OF_F_VISUAL_REFERENCE.md, Reference A §4–6 and Reference B §3.
 *
 *   CONFRONT *  (scene rof_finale_confront) where Blue and Gold ended: injured base Goku, Krillin beside him, base
 *                                    Vegeta between them and a depleted Golden Frieza. The senzu beans: Goku healed,
 *                                    Gohan brings one to Piccolo, who gets up (he was left down, never dead)
 *   BLUE        (hold Charge)        VEGETA'S FIRST LASTING SUPER SAIYAN BLUE in the main story — the lens on the
 *                                    ground looking up through the cobalt aura (formGivenBy['vegeta:blue'] = this mission)
 *   DUEL *      (play)               Super Saiyan Blue Vegeta vs Golden Frieza: a real fight, a knockout is a DEFEAT
 *                                    (retry from here). Ends on Frieza's story floor
 *   FALL        (staged)             the gold goes out of Frieza; on his knees in the crater; over Vegeta's shoulder, the
 *                                    palm raised — and Frieza drives his own hand into the ground: the core. Whis raises
 *                                    his barrier round the others; Vegeta is outside it
 *   SPACE *     (staged)             from orbit: red cracks across the Earth, the burst, the pieces; the barrier adrift
 *                                    with the survivors (no Vegeta), Frieza laughing in the void; Goku's regret; Whis:
 *                                    three minutes, no more; TAP, TAP — a cyan ripple, the pieces fly back, the Earth
 *                                    closes up (local to this mission: the stage is rebuilt, nothing is saved)
 *   FINISH *    (cue + staged)       three minutes earlier: Vegeta's palm over the kneeling Frieza — Goku, already Blue,
 *                                    leaps over him: "FRIEZA!" — the player fires the God Kamehameha (Ultimate); side-on,
 *                                    the beam takes him to dust before his hand reaches the ground
 *   AFTER       (scene rof_finale_after) Vegeta furious at the stolen kill; the rewind explained; Goku's offer to train
 *                                    together, scoffed at
 * Every phase marked * is a checkpoint. The Hell ending is not part of this mission.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit, BK = SL.data.brolyKit, C = SL.data.cinematics;
  const CHAPTER = 'CHAPTER 17 · RESURRECTION OF F';

  // TUNING: the duel's story floor and damage, the hold, the space beats (seconds)
  const TU = {
    blueHold: 3.6, friezaStart: 0.7, friezaFloor: 0.15, friezaDealt: 0.11, friezaTaken: 0.75, vegetaDealt: 2.6,
    duelSeconds: 90, novaSeconds: 2.2, crackSeconds: 2.8, burstSeconds: 2.4, rewindSeconds: 3,
  };
  // where everybody stands (x, z) — the established "Blue and Gold" handoff
  const SPOT = {
    goku: [0, -6], krillin: [1.3, -6.5], vegeta: [0, -2], frieza: [0, 3], sorbet: [-10, 18], whis: [13, -14],
    gohan: [-11, -13], piccolo: [-12, -11], tien: [-19, -16],
    // the survivors' huddle (Whis' barrier) and the execution
    huddle: [-9, -12], kneel: [0, 5], over: [0, 3.2],
    // after the senzu: Goku and Krillin step aside, out of the line between the lens and Vegeta
    gokuUp: [-5, -6.5], krillinUp: [-6.6, -7.4],
  };
  const at = (b, k, lift) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift || 0);
  const HUDDLE = ['goku', 'gohan', 'piccolo', 'krillin', 'tien', 'whis'];

  /* ----- poses ----- */
  const PO = SL.data.poses;
  // Frieza's spite: on his knees, the right palm driven flat into the ground
  PO.fz_slam = { root: { y: -0.5, rx: 22 }, spine: [20, 0, 0], chest: [16, 0, 0], head: [-14, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-10, 0, 0], handR: [60, 0, 0], shoulderL: [-30, 0, 30], elbowL: [-50, 0, 0], thighL: [-90, 0, 10], kneeL: [90, 0, 0], thighR: [-90, 0, -10], kneeR: [90, 0, 0], hands: ['fist', 'open'] };
  // laughing in the void: arms out, head back
  PO.fz_laugh = (t) => {
    const s = Math.sin(t * 14) * 3;
    return { root: { y: 0, rx: -10 }, spine: [-10, 0, 0], chest: [-12 + s, 0, 0], head: [-24, 0, 0], shoulderL: [-40, 0, 60], elbowL: [-30, 0, 0], shoulderR: [-40, 0, -60], elbowR: [-30, 0, 0], thighL: [-10, 0, 8], kneeL: [16, 0, 0], thighR: [-6, 0, -8], kneeR: [12, 0, 0], hands: ['open', 'open'] };
  };
  // Goku's fist against the barrier wall
  PO.g_punchWall = (t) => {
    const k = Math.abs(Math.sin(t * 5));
    return { root: { y: -0.3, rx: 12 }, spine: [12, 0, 0], chest: [10, 10, 0], head: [-6, 0, 0], shoulderR: [-80 - k * 10, 0, -6], elbowR: [-10 - k * 30, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-60, 0, 0], thighL: [-80, 0, 10], kneeL: [90, 0, 0], thighR: [-20, 0, -10], kneeR: [96, 0, 0], hands: ['fist', 'fist'] };
  };

  function setup(b) {
    const S = {};
    for (const key of ['goku', 'krillin', 'vegeta', 'frieza', 'sorbet', 'whis', 'gohan', 'piccolo', 'tien']) {
      S[key] = b.spawn({ charId: key === 'gohan' ? 'adult_gohan' : key, team: ['frieza', 'sorbet'].includes(key) ? 1 : 0,
        player: key === 'vegeta', pos: at(b, key), startKi: 80 });
    }
    b.story = S;
    // the Golden look is the previous encounter's own recolour (reused, local to this battle's model)
    b.on('formChanged', (e) => {
      if (e.fighter === S.frieza && SL.data.rofGoku) SL.data.rofGoku.goldenLook(S.frieza);
    });
    S.vegeta._playerController = S.vegeta.controller;
    S.goku._playerController = new SL.PlayerController(b);
    handoff(b);
  }

  /** "Blue and Gold"'s last picture: Goku down, Krillin by him, Vegeta in front, Frieza Golden and spent. */
  function handoff(b) {
    const S = b.story;
    for (const key of Object.keys(S)) {
      const f = S[key];
      f.setHidden(false);
      f.cannotDie = true;
      K.place(f, at(b, key), 0);
      K.watcher(f, 'idle', 'serious');
    }
    K.faceTo(S.frieza, S.vegeta.pos);
    K.faceTo(S.vegeta, S.frieza.pos);
    for (const k of ['krillin', 'gohan', 'tien', 'whis', 'sorbet']) K.faceTo(S[k], S.frieza.pos);
    K.watcher(S.goku, 'knockdownFace', 'hurt');
    K.watcher(S.krillin, 'kneelGrieve', 'serious');
    K.faceTo(S.krillin, S.goku.pos);
    K.watcher(S.piccolo, 'knockdownFace', 'ko');
    K.watcher(S.gohan, 'kneelGrieve', 'sad');
    K.faceTo(S.gohan, S.piccolo.pos);
    K.watcher(S.vegeta, 'guard', 'serious');
    K.watcher(S.frieza, 'exhausted', 'angry');
    K.watcher(S.sorbet, 'sb_idle', 'smirk');
    K.watcher(S.whis, 'w_idle', 'calm');
    K.toForm(S.goku, 'base');
    K.toForm(S.vegeta, 'base');
    BK.give(S.frieza, 'golden');
    K.toForm(S.frieza, 'golden');
    S.goku.hp = Math.max(1, S.goku.hpMax * 0.12);
    S.frieza.hp = S.frieza.hpMax * 0.08;
  }

  /** After the senzu: Goku and Piccolo back on their feet, the others gathered to watch. */
  function healed(b) {
    const S = b.story;
    for (const k of ['goku', 'piccolo']) S[k].hp = S[k].hpMax;
    K.place(S.goku, at(b, 'gokuUp'), 0);
    K.place(S.krillin, at(b, 'krillinUp'), 0);
    K.place(S.piccolo, at(b, 'piccolo'), 0);
    K.place(S.gohan, at(b, 'gohan'), 0);
    K.watcher(S.goku, 'idle', 'serious');
    K.watcher(S.krillin, 'idle', 'serious');
    K.watcher(S.piccolo, 'armsCrossed', 'serious');
    K.watcher(S.gohan, 'idle', 'serious');
    for (const k of ['goku', 'krillin', 'piccolo', 'gohan', 'tien', 'whis']) K.faceTo(S[k], S.frieza.pos);
  }

  /** The world back on the plain (a checkpoint after the rewind, or a retry): the right stage, nobody hidden. */
  function onEarth(m) {
    const b = m.battle;
    if (b.stage.def.id !== 'plains') {
      b.changeStage('plains');
      m.endShot();
    }
    for (const f of Object.values(b.story)) {
      f.setHidden(false);
      f.grounded = true;
      f.vel.set(0, 0, 0);
    }
  }

  /** The player drives `f` (Vegeta for the duel, Goku for the finish). */
  function control(m, f) {
    const b = m.battle;
    b.setParty([f], {});
    f.controller = f._playerController || (f._playerController = new SL.PlayerController(b));
    b.switchPlayer(f, { force: true, quiet: true });
  }

  /** Common start of every phase: lock, clear, restore the world. */
  function begin(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    onEarth(m);
  }

  /** Vegeta's Blue: locked until the story's reveal, then his. */
  function vegetaBlue(f, on) {
    if (on) BK.give(f, 'blue');
    else f.lockedForms = Object.assign({}, f.lockedForms, { blue: true });
  }

  const P = {};

  P.confront = {
    id: 'confront',
    checkpoint: true,
    run: function* (m) {
      begin(m);
      handoff(m.battle);
      vegetaBlue(m.battle.story.vegeta, false);
      yield* SL.Cinema.play(m, 'rof_finale_confront');
    },
  };

  /** VEGETA'S BLUE: the lens on the ground, looking up through the cobalt flame at the beaten Frieza beyond him. */
  P.blue = {
    id: 'blue',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, f = S.frieza;
      begin(m);
      if (!m.flags.healed) {
        handoff(b);
        healed(b);
      }
      vegetaBlue(v, false);
      K.toForm(v, 'base');
      K.place(v, at(b, 'vegeta'), 0);
      K.faceTo(v, f.pos);
      control(m, v);
      v.ki = v.kiMax;
      v.setState('free');
      m.objective('blue', 'Super Saiyan Blue: hold Charge', { icon: 'transform' });
      const fw = () => v.forward.clone().setY(0).normalize();
      yield* C.ascend(m, {
        fighter: v, form: 'blue', witness: f, seconds: TU.blueHold,
        label: 'Hold Charge — Super Saiyan Blue', meter: 'SUPER SAIYAN BLUE', music: 4,
        witnessLine: 'You too...? That colour again!',
        transform: {
          changeShots: [
            // Reference A §4 Shot 1: on the ground, looking up at Vegeta, the aura flaring over Frieza beyond him
            { at: 0, shot: (t, out) => {
              const p = v.pos.clone();
              out.pos.copy(p).addScaledVector(fw(), -2.4).addScaledVector(new V3(fw().z, 0, -fw().x), 0.9).add(new V3(0, 0.25, 0));
              out.look.copy(v.headPos()).add(new V3(0, 0.6 + t * 0.4, 0));
              out.fov = 54;
            } },
            { at: 0.7, free: true, shot: (t, out) => {
              const h = v.headPos();
              out.pos.copy(h).addScaledVector(fw(), 1.2).add(new V3(0, 0.15, 0));
              out.look.copy(h).add(new V3(0, 0.12, 0));
              out.fov = 40;
            } },
          ],
        },
      });
      m.complete('blue');
      m.flags.vegetaBlue = true;
    },
  };

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, f = S.frieza;
      begin(m);
      handoff(b);
      healed(b);
      m.flags.healed = true;
      vegetaBlue(v, true);
      K.toForm(v, 'blue');
      BK.give(f, 'golden');
      K.toForm(f, 'golden');
      K.place(v, at(b, 'vegeta'), 0);
      K.place(f, at(b, 'frieza'), 0);
      K.faceTo(v, f.pos);
      K.faceTo(f, v.pos);
      v.hp = v.hpMax;
      v.ki = v.kiMax * 0.8;
      f.hp = f.hpMax * TU.friezaStart;
      f.ki = f.kiMax * 0.6;
      v.cannotDie = false; // a knockout is a real defeat here
      f.cannotDie = true;
      v.untargetable = v.intangible = f.untargetable = f.intangible = false;
      control(m, v);
      v.target = f;
      f.target = v;
      f.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, f.def.ai, { transformHp: 0, aggression: 0.8 }) });
      v.setState('free');
      f.setState('free');
      const fight = m.storyFight({
        floors: [{ f, at: TU.friezaFloor }],
        dealt: [{ f, mul: TU.friezaDealt }, { f: v, mul: TU.vegetaDealt }],
        taken: [{ f, mul: TU.friezaTaken }],
        fighters: [v, f], space: 'ground',
      });
      // the Blue stays on for the duel (the story takes it back, not the Power Down key)
      m.limits({ revert: false });
      m.music('battle', 4);
      m.title(CHAPTER, 'THE PRINCE\'S TURN', 'Super Saiyan Blue Vegeta vs Golden Frieza', 2.6);
      m.objective('duel', 'Beat Golden Frieza', { icon: 'fist' });
      m.objective('hits', 'Land 12 hits', { icon: 'fist', optional: true, target: 12 });
      let hits = 0;
      const offD = b.on('damage', (e) => {
        if (e.attacker !== v || e.target !== f) return;
        hits++;
        m.progress('hits', Math.min(12, hits));
        if (hits === 12) m.complete('hits');
        if (hits === 4) m.say('vegeta', 'Too slow. You are not even worth the gold.', 2.4);
      });
      m.onDispose(offD);
      let said = false;
      const talk = () => {
        if (!said && f.hpFrac < 0.4) {
          said = true;
          m.say('frieza', 'No... NO! A monkey prince is not stronger than me!', 2.8, { style: 'shout' });
        }
      };
      m.tickHooks.push(talk);
      m.lock(false);
      b.aiLocked = false;
      yield () => fight.floored(f) || m.state !== 'running';
      K.unhook(m, talk);
      offD();
      fight.off();
      v.cannotDie = true;
      if (m.state !== 'running') return;
      m.complete('duel');
      m.lock(true);
      b.aiLocked = true;
      K.clearCombat(b);
      m.flags.duelWon = true;
    },
  };

  /** The barrier: a soft cyan shell round the survivors (Whis' protection). Returns { group, dispose }. */
  function barrier(b, center, r) {
    const geo = new THREE.SphereGeometry(r, 32, 20);
    const mat = new THREE.MeshBasicMaterial({ color: 0x7ad8ff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const rimGeo = new THREE.SphereGeometry(r * 1.01, 32, 20);
    const rimMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x9ae8ff) } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(uColor*f, f); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, mat), new THREE.Mesh(rimGeo, rimMat));
    group.position.copy(center);
    b.scene.add(group);
    return {
      group,
      dispose() {
        if (group.parent) group.parent.remove(group);
        geo.dispose();
        mat.dispose();
        rimGeo.dispose();
        rimMat.dispose();
      },
    };
  }

  /** The gold goes out of him; the palm over him; his hand into the ground; the barrier; the light. */
  P.fall = {
    id: 'fall',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, f = S.frieza;
      begin(m);
      if (!m.flags.healed) {
        handoff(b);
        healed(b);
      }
      vegetaBlue(v, true);
      K.toForm(v, 'blue');
      v.controller = K.scripted();
      f.controller = K.scripted();
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      const fx = [];
      const drop = () => {
        for (const x of fx.splice(0)) x.dispose();
      };
      m.onDispose(drop);
      // on his knees in a crater, Vegeta over him
      const kp = at(b, 'kneel');
      K.place(f, kp, 0);
      K.place(v, at(b, 'over'), 0);
      K.faceTo(f, v.pos);
      K.faceTo(v, f.pos);
      b.stage.crater(kp.clone(), 3.4, 0.9, null);
      v.setState('scripted', { pose: 'idle', expression: 'cold' });
      f.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      // the gold goes out of him
      SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      b.vfx.flash(f.chest(), 2.4, 0xffd04a, 0.5, SL.Toon.tex.glow);
      K.toForm(f, 'final');
      m.say('frieza', 'My... my golden form...', 2.2, { style: 'quiet' });
      yield* wait(2.3);
      // Reference A §4 Shot 2: over Vegeta's shoulder, down at Frieza on his knees; the palm raised and charging
      v.setState('scripted', { pose: 'v_palmUp', expression: 'cold', speed: 10 });
      m.shot((t, out) => {
        const d = f.pos.clone().sub(v.pos).setY(0).normalize();
        const s = new V3(d.z, 0, -d.x);
        out.pos.copy(v.chest()).addScaledVector(d, -1.4).addScaledVector(s, 0.7).add(new V3(0, 0.75, 0));
        out.look.copy(f.chest());
        out.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const palmGlow = () => {
        if (b.frame % 4 === 0) b.vfx.flash(v.handPos ? v.handPos('R') : v.chest(), 0.7, 0x4ab8ff, 0.2, SL.Toon.tex.glow);
      };
      m.tickHooks.push(palmGlow);
      m.say('vegeta', 'Goodbye, Frieza. Kakarot\'s mercy ends with me.', 3);
      yield* wait(3);
      // Reference A §4 Shot 3: his face against the dirt — and the hand into the ground
      f.setState('scripted', { pose: 'fz_slam', expression: 'wicked', speed: 26 });
      m.shot((t, out) => {
        const p = f.pos.clone();
        out.pos.copy(p).add(new V3(4.2, 0.5, -1.5));
        out.look.copy(p).add(new V3(0, 0.4, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('frieza', 'If I cannot have this planet... then NOBODY WILL!', 2.8, { style: 'shout' });
      b.sfx('groundImpact', f, { vol: 1.4 });
      b.stage.crater(kp.clone(), 6, 1.6, null);
      b.cameraTraumaAt(kp, 0.9);
      const quake = () => {
        b.camera.trauma = Math.max(b.camera.trauma, 0.4);
        if (b.frame % 3 === 0) {
          const a = U.rand(0, Math.PI * 2), r = U.rand(2, 14);
          const p = kp.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
          p.y = b.stage.heightAt(p.x, p.z);
          b.vfx.flash(p.clone().add(new V3(0, 0.3, 0)), 1.6, 0xff5a1a, 0.4, SL.Toon.tex.glow);
          b.vfx.bolt(p.clone().add(new V3(0, 0.2, 0)), U.rand(2, 6), 0xff6a2a);
        }
      };
      m.tickHooks.push(quake);
      yield* wait(2);
      K.unhook(m, palmGlow);
      // Whis raises his barrier round the others — Vegeta is out by Frieza
      const S2 = S;
      const hc = at(b, 'huddle');
      HUDDLE.forEach((k, i) => {
        const a = (i / HUDDLE.length) * Math.PI * 2;
        K.place(S2[k], hc.clone().add(new V3(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8)), 0);
        K.faceTo(S2[k], f.pos);
      });
      K.watcher(S.whis, 'w_staffShow', 'serious');
      const bar = barrier(b, hc.clone().add(new V3(0, 1, 0)), 3.6);
      fx.push(bar);
      b.sfx('teleport', S.whis, { pitch: 0.8 });
      m.shot((t, out) => {
        out.pos.copy(hc).add(new V3(9, 3, 7));
        out.look.copy(hc).add(new V3(0, 1, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('whis', 'Everyone, close to me. Quickly, please.', 2.2);
      yield* wait(2.2);
      K.watcher(S.goku, 'idle', 'shock');
      SL.Cinema.shotOn(m, S, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      v.setState('scripted', { pose: 'guard', expression: 'shock' });
      m.say('goku', 'VEGETA! Get over here!', 1.8, { style: 'shout' });
      yield* wait(1.6);
      // the light comes up out of the ground and takes everything
      SL.ScreenFX.flash(1, '#fff2d8');
      m.fade('white', 0.35);
      b.sfx('explosionHuge', null, { at: kp, vol: 1.4 });
      yield* wait(0.6);
      K.unhook(m, quake);
      drop();
      m.endShot();
      b.skipRequested = false;
    },
  };

  /** The Earth from orbit; the burst; the barrier adrift; three minutes; the rewind. */
  P.space = {
    id: 'space',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.limits(null);
      m.clearObjectives();
      m.endShot();
      K.clearCombat(b);
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      for (const f of Object.values(S)) {
        f.controller = K.scripted();
        f.untargetable = f.intangible = true;
      }
      b.changeStage('orbit');
      m.endShot();
      const os = b.stage;
      // the orbit stage's own planet and ship belong to another story: hidden, the Earth takes the planet's place
      for (const o of [os.planet, os.atmo, os.ship]) if (o) o.visible = false;
      const FX = SL.data.cinematics.planetFX;
      const PC = os.planet ? os.planet.position.clone() : new V3(0, -860, -260);
      const fx = [];
      const drop = () => {
        for (const x of fx.splice(0)) x.dispose();
      };
      m.onDispose(drop);
      const earth = FX.earthFx(b, PC, 700);
      fx.push(earth);
      const up = new V3(0, 1, 0);
      const cracks = FX.crackShell(b, { position: PC }, up.clone().add(new V3(0, 0, 0.6)).normalize());
      fx.push(cracks);
      // the survivors in Whis' barrier, adrift above; Vegeta is not with them
      const bc = new V3(0, 30, 40);
      const bar = barrier(b, bc, 4.2);
      fx.push(bar);
      HUDDLE.forEach((k, i) => {
        const f = S[k];
        f.setHidden(false);
        f.grounded = false;
        const a = (i / HUDDLE.length) * Math.PI * 2;
        f.setPosition(bc.clone().add(new V3(Math.cos(a) * 2, -1, Math.sin(a) * 2)));
        f.vel.set(0, 0, 0);
        K.faceTo(f, PC);
      });
      for (const k of HUDDLE) K.watcher(S[k], 'idle', 'shock');
      K.watcher(S.whis, 'w_staffShow', 'calm');
      S.vegeta.setHidden(true);
      S.sorbet.setHidden(true);
      // Frieza, alive in the void, laughing
      const fz = S.frieza;
      fz.setHidden(false);
      fz.grounded = false;
      K.toForm(fz, 'final');
      fz.setPosition(new V3(-26, 22, 10));
      fz.vel.set(0, 0, 0);
      K.faceTo(fz, PC);
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'wicked' });
      m.fade('clear', 0.6);
      // Reference A §4 Shot 4: the extreme wide from orbit — red cracks race over the globe, then the burst
      let T0 = 0, chunks = null, burstAt = TU.crackSeconds;
      const tick = () => {
        T0 += 1 / 60;
        const k = U.clamp01(T0 / TU.crackSeconds);
        if (!chunks) {
          cracks.set(k);
          if (earth.group) earth.group.scale.setScalar(1 + 0.02 * k * k);
          if (b.frame % 8 === 0) b.vfx.ball(PC.clone().addScaledVector(new V3(U.rand(-1, 1), U.rand(0.2, 1), U.rand(-1, 1)).normalize(), 700), U.rand(30, 70) * (0.5 + k), 0xff7a2a, 1);
          if (T0 >= burstAt) {
            earth.group.visible = false;
            cracks.mesh.visible = false;
            chunks = FX.planetChunks(b, PC, 46);
            fx.push(chunks);
            b.vfx.ball(PC.clone().add(new V3(0, 300, 0)), 600, 0xffe0a0, 1.6);
            SL.ScreenFX.flash(0.8, '#fff0d0');
            b.sfx('explosionHuge', null, { vol: 1.5 });
          }
        }
        for (const x of fx) if (x.update) x.update(1 / 60);
        b.camera.trauma = Math.max(b.camera.trauma, chunks ? 0.25 : 0.1 + 0.2 * k);
      };
      m.tickHooks.push(tick);
      m.shot((t, out, el) => {
        // the whole globe in frame, far out in the dark (Reference A §4 Shot 4)
        out.pos.set(1300, 300, 2000);
        out.look.copy(PC);
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.title(CHAPTER, 'THE EARTH', '', 2);
      yield* wait(TU.crackSeconds + TU.burstSeconds);
      if (!chunks) {
        // skipped: land on the same state — the Earth gone, the pieces flying
        earth.group.visible = false;
        cracks.mesh.visible = false;
        chunks = FX.planetChunks(b, PC, 46);
        fx.push(chunks);
      }
      // Frieza laughing in the void
      SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Ohohoho! Gone! Your precious planet, your prince — all of it!', 3);
      yield* wait(3);
      // Reference A §5 Shot 1 / B §3: Goku on his knees in the barrier, his fist on the wall
      K.watcher(S.goku, 'g_punchWall', 'angry');
      SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Dammit! I had him... I let my guard down, and now everyone\'s gone — Vegeta too!', 3.6, { style: 'shout' });
      yield* wait(3.6);
      // Whis: calm, the staff in his hand
      SL.Cinema.shotOn(m, S, { subject: 'whis', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('whis', 'It seems I have no choice. I shall give you a do-over.', 2.8);
      yield* wait(2.8);
      m.say('goku', 'A do-over?!', 1.4);
      yield* wait(1.4);
      m.say('whis', 'I can turn back time — but three minutes at the very most, and not often. This time, Goku, finish it.', 4.2);
      yield* wait(4.2);
      // TAP. TAP. — a turquoise ripple across the dark; the pieces fly back; the Earth closes up
      K.watcher(S.whis, 'w_staffTap', 'calm');
      for (let i = 0; i < 2; i++) {
        b.after(i * 26, () => {
          b.vfx.ring(bc.clone(), 30 + i * 10, 0x6af0e8, 1.4);
          b.vfx.ring(bc.clone(), 120 + i * 60, 0xbffaff, 2);
          b.sfx('teleport', S.whis, { pitch: 1.4 - i * 0.2 });
        });
      }
      m.say('whis', '(tap... tap)', 1.2, { style: 'quiet' });
      yield* wait(1.4);
      const back = () => {
        if (!chunks) return;
        for (const c of chunks.list) c.vel.multiplyScalar(-1.8);
      };
      back();
      let R = 0;
      const rewind = () => {
        R += 1 / 60;
        const k = U.clamp01(R / TU.rewindSeconds);
        if (k > 0.55 && !earth.group.visible) {
          earth.group.visible = true;
          cracks.mesh.visible = true;
          if (chunks) for (const c of chunks.list) c.mesh.visible = false;
        }
        if (earth.group.visible) cracks.set(1 - U.clamp01((k - 0.55) / 0.45));
        if (b.frame % 10 === 0) b.vfx.ring(PC.clone().add(new V3(0, 300, 0)), 700 + R * 200, 0x6af0e8, 0.8);
      };
      m.tickHooks.push(rewind);
      m.shot((t, out) => {
        // the whole globe in frame, far out in the dark (Reference A §4 Shot 4)
        out.pos.set(1300, 300, 2000);
        out.look.copy(PC);
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.title(CHAPTER, 'THREE MINUTES EARLIER', '', 2.4);
      yield* wait(TU.rewindSeconds + 0.3);
      SL.ScreenFX.flash(0.7, '#d8fffa');
      m.fade('white', 0.3);
      yield* wait(0.4);
      K.unhook(m, tick);
      K.unhook(m, rewind);
      drop();
      m.flags.rewound = true;
      m.endShot();
      b.skipRequested = false;
    },
  };

  /** Three minutes earlier: Vegeta's palm over Frieza — and Goku over Vegeta, the Kamehameha in his hands. */
  P.finish = {
    id: 'finish',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, f = S.frieza, g = S.goku;
      begin(m);
      handoff(b);
      healed(b);
      vegetaBlue(v, true);
      K.toForm(v, 'blue');
      BK.give(g, 'blue');
      K.toForm(g, 'blue');
      K.toForm(f, 'final');
      for (const x of Object.values(S)) x.untargetable = x.intangible = true;
      const kp = at(b, 'kneel');
      K.place(f, kp, 0);
      K.place(v, at(b, 'over'), 0);
      K.faceTo(f, v.pos);
      K.faceTo(v, f.pos);
      b.stage.crater(kp.clone(), 3.4, 0.9, null);
      v.controller = K.scripted();
      f.controller = K.scripted();
      v.setState('scripted', { pose: 'v_palmUp', expression: 'cold' });
      f.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      control(m, g);
      g.controller = K.scripted(); // the body is staged; the cue reads the player's buttons
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      m.fade('clear', 0.4);
      m.shot((t, out) => {
        const d = f.pos.clone().sub(v.pos).setY(0).normalize();
        out.pos.copy(v.chest()).addScaledVector(d, -1.4).add(new V3(0.7, 0.75, 0));
        out.look.copy(f.chest());
        out.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('vegeta', 'Goodbye, Frieza—', 1.4);
      yield* wait(1.2);
      // Goku, already Blue, leaps over Vegeta and lands between them
      const from = g.pos.clone(), land = v.pos.clone().lerp(f.pos, 0.42);
      land.y = b.stage.heightAt(land.x, land.z);
      g.setState('scripted', { pose: 'flyForward', expression: 'shout' });
      m.say('goku', 'FRIEZAAA!', 1.4, { style: 'shout' });
      m.shot((t, out) => {
        out.pos.copy(v.pos).add(new V3(7, 2.4, -3));
        out.look.copy(g.chest());
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const t0 = performance.now();
      yield () => {
        const k = Math.min(1, (performance.now() - t0) / 700);
        const p = from.clone().lerp(land, k);
        p.y = U.lerp(from.y, land.y, k) + Math.sin(k * Math.PI) * 4;
        g.setPosition(p);
        g.vel.set(0, 0, 0);
        return k >= 1 || skip.on;
      };
      g.setPosition(land);
      g.grounded = true;
      K.faceTo(g, f.pos);
      v.setState('scripted', { pose: 'idle', expression: 'shock' });
      f.setState('scripted', { pose: 'fz_slam', expression: 'shock', speed: 6 });
      // the player fires it (Ultimate); the story waits as long as it takes
      g.setState('scripted', { pose: 'g_kameCharge', expression: 'shout' });
      m.objective('kame', 'Finish it: the God Kamehameha', { icon: 'beam' });
      const charge = () => {
        if (b.frame % 3 === 0) b.vfx.streamInward(g.handPos ? g.handPos('R') : g.chest(), 2, 0x6ad0ff, 2, 0.14, 0.35);
      };
      m.tickHooks.push(charge);
      SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      // a skipped leap must not answer the player's finish: the cue waits for the button
      b.skipRequested = false;
      const r = yield* m.cue('ult', 'God Kamehameha (Ultimate)', { slow: 0.4, auto: 8 });
      K.unhook(m, charge);
      m.qteParts.push(r.pressed ? 1 : 0.5);
      m.complete('kame');
      // Reference A §6 Shot 2: side profile, the beam point blank — Frieza to dust before his hand reaches the core
      g.setState('scripted', { pose: 'g_kameFire', expression: 'shout', speed: 30 });
      const hand = g.handPos ? g.handPos('R') : g.chest();
      const dir = f.chest().sub(hand).setY(0).normalize();
      const len = 60;
      const beamGeo = new THREE.CylinderGeometry(1.1, 1.1, len, 20, 1, true);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, len / 2);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x8ae4ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.copy(hand);
      beam.lookAt(hand.clone().add(dir));
      beam.scale.set(0.2, 0.2, 0.02);
      b.scene.add(beam);
      const dropBeam = () => {
        if (beam.parent) beam.parent.remove(beam);
        beamGeo.dispose();
        beamMat.dispose();
      };
      m.onDispose(dropBeam);
      b.sfx('beamFire', g, { pitch: 0.8, vol: 1.4 });
      m.shot((t, out, el) => {
        const s = new V3(dir.z, 0, -dir.x);
        // side on, Goku at the left edge of the frame and the beam running out across it
        const mid = hand.clone().addScaledVector(dir, 2.6 + el * 2);
        out.pos.copy(mid).addScaledVector(s, 8).add(new V3(0, 1.4, 0));
        out.look.copy(mid).add(new V3(0, 0.2, 0));
        out.fov = 54;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const t1 = performance.now();
      let gone = false;
      yield () => {
        const k = Math.min(1, (performance.now() - t1) / 1600);
        beam.scale.set(0.3 + k, 0.3 + k, Math.min(1, k * 2.5));
        beamMat.opacity = 0.85 * (k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2);
        if (k > 0.25 && !gone) {
          gone = true;
          b.vfx.explosion(f.chest(), 2, 0x9ae8ff, { smoke: true });
          b.vfx.sparks(f.chest(), 0xffffff, 30, 8, 0.1);
          f.setHidden(true);
          b.cameraTraumaAt(f.chest(), 0.7);
        }
        return k >= 1 || skip.on;
      };
      dropBeam();
      f.setHidden(true);
      g.setState('scripted', { pose: 'idle', expression: 'serious' });
      m.flags.friezaGone = true;
      b.skipRequested = false;
      m.endShot();
      yield* SL.Cinema.play(m, 'rof_finale_after');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      if (!m.flags.friezaGone) {
        // a direct start: the finish's end state
        begin(m);
        handoff(b);
        healed(b);
        vegetaBlue(S.vegeta, true);
        K.toForm(S.vegeta, 'blue');
        K.toForm(S.goku, 'blue');
        S.frieza.setHidden(true);
        yield* SL.Cinema.play(m, 'rof_finale_after');
      }
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(CHAPTER, 'THREE MINUTES', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  SL.data.rofFinale = { TU, SPOT, handoff, healed };
  SL.data.missions.rof_finale = {
    id: 'rof_finale', canon: true, chapter: CHAPTER, title: 'Three Minutes', character: 'vegeta', stage: 'plains',
    subtitle: 'Resurrection of F · Vegeta vs Golden Frieza', parTime: 600,
    qteLabel: 'The finish',
    blurb: 'Goku let his guard down. Now it is Vegeta\'s turn — and Frieza has one more cruelty left in him.',
    appearance: { goku: { outfit: 'goku_whis' }, vegeta: { outfit: 'vegeta_whis' }, adult_gohan: { outfit: 'ag_tournament' } },
    // the Whis-trained Saiyans: base and Blue only (Vegeta's Blue is handed over by this mission)
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
      vegeta: SL.data.characters.vegeta.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: true, allowUltimates: true },
    rewards: ['Form: Vegeta — Super Saiyan Blue (main story and Free Battle)'],
    setup,
    phases: [P.confront, P.blue, P.duel, P.fall, P.space, P.finish, P.after],
  };
})();
