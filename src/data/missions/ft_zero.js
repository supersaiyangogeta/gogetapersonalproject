/*
 * CHAPTER 19 · FUTURE TRUNKS — "Zero Mortals" (canon; played as Goku, then Future Trunks). Roadmap Three, the owner's
 * Goku Black arc research (2026-10-18, `Downloads/Goku black arc research.pdf`): BT-RAGE-01, the Divine Lasso (DL-S01
 * to S04), B-DL-01 and B-DL-02. The second trip to the future, between "Rosé" (the first trip) and "A Genuine Saiyan"
 * (Vegeta back from his training). A research draft: built from the PDF's text and its reference images, not checked
 * against the footage. Lines are paraphrased and written for this project.
 *
 *   CONFESSION * (staged)  Goku held against a ruined wall by Zamasu's blade (the PDF's image: the blade at his side, no
 *                          wound); Black tells him how he took the body and what he did with it. The music cuts out: the
 *                          bowed face in close-up, the eyes lost under the hair, the fists trembling; the head comes up,
 *                          teal; the roar from low, the aura bursting out, the ground cratered, both gods blown back
 *   RAGE *       (played)  Blue Goku against Rosé Black and Zamasu together: the blitz opens it, then the player's. The
 *                          rage state for this stretch only (provisional values, TU.rage): ki kept full, light blows do
 *                          not stop him (storyArmor 1), the two gods take more damage. Ends when both are driven to their
 *                          floors, or when the rage burns out (TU.rage.seconds)
 *   LASSO        (staged)  the Divine Lasso: the crescent blade at Black's hand (low, tilting up); the sweep and the
 *                          needles across the gap (wide whip-pan); Goku held in the air by them (close, Dutch, shaking:
 *                          the needles touch him, nothing graphic); Black turns away and closes his fist; the detonation
 *                          (a sudden pull back to an extreme wide); Goku down in a crater out of Blue; the mockery
 *   TRUNKS       (staged)  the two raise their hands over the crater; Trunks steps between them, sword drawn; they call
 *                          him the sinner whose time travel began it all; Super Saiyan Rage (gold inside blue, blue
 *                          lightning, the eyes white), and both are pushed back
 *   HOLD *       (played)  Super Saiyan Rage Trunks against the two of them; ends at their floors or his
 *   RETREAT      (staged)  Vegeta takes Goku back to the past in the Time Machine; Trunks stays, alone, sword up
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const PZ = SL.data.poses;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  // ponytail: provisional story-stretch values (the PDF asks +200 % damage, full ki, super armor for the rage; the owner
  // has not approved a number) — every one is local to this mission and restored when its stretch ends
  const TU = {
    rage: { foeFloor: 0.55, gokuFloor: 0.25, foeTaken: 2.2, foeDealt: 0.15, armor: 1, seconds: 60 },
    hold: { foeFloor: 0.6, trunksFloor: 0.3, foeTaken: 1.3, foeDealt: 0.25, seconds: 40 },
  };
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const CYAN = 0x4ad8ff, PINK = 0xff4aa8, MAGENTA = 0xc23cff, GOLD = 0xffd860;

  /* ---------------------------------------------------------------- poses (hands are [left, right]) */

  // held against the wall, the head bowed so the hair hides the eyes; the right fist clutching the gi at his chest, the
  // left clenched at his side; both trembling (BT-RAGE-01, the PDF's image of the bowed head)
  PZ.gz_bowed = PZ.gz_bowed || ((t) => {
    const s = Math.sin(t * 41) * 1.8, c = Math.cos(t * 37) * 1.4;
    return {
      hands: ['fist', 'fist'],
      root: { y: -0.02, rx: -4 }, spine: [6, 0, 0], chest: [8, 0, 0], neck: [6, 0, 0], head: [16, 0, 0],
      shoulderR: [-36 + s, 0, 34], elbowR: [-112 + c, 0, 0], handR: [10, 0, 0],
      shoulderL: [8 - c, 0, 12], elbowL: [-24 + s, 0, 0],
      thighL: [-4, 0, 8], kneeL: [8, 0, 0], thighR: [-2, 0, -8], kneeR: [6, 0, 0],
    };
  });
  // the head up, level, the jaw set; fists low and shaking
  PZ.gz_glare = PZ.gz_glare || ((t) => {
    const s = Math.sin(t * 43) * 1.6;
    return {
      hands: ['fist', 'fist'],
      root: { y: -0.03 }, spine: [4, 0, 0], chest: [4, 0, 0], neck: [2, 0, 0], head: [6, 0, 0],
      shoulderR: [-14 + s, 0, -14], elbowR: [-40, 0, 0], shoulderL: [-14 - s, 0, 14], elbowL: [-40, 0, 0],
      thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [-4, 0, -10], kneeR: [8, 0, 0],
    };
  });
  // the roar: legs wide, the whole body tensed back, the head thrown back, fists driven down and out (goku_ssb_rage_roar)
  PZ.gz_roar = PZ.gz_roar || ((t) => {
    const s = Math.sin(t * 47) * 1.4;
    return {
      hands: ['fist', 'fist'],
      root: { y: -0.08, rx: -2 }, spine: [-6, 0, 0], chest: [-8 + s, 0, 0], neck: [-4, 0, 0], head: [-12, 0, 0],
      shoulderL: [14, 0, 34 + s], elbowL: [-24, 0, 0], shoulderR: [14, 0, -34 - s], elbowR: [-24, 0, 0],
      thighL: [-10, 0, 16], kneeL: [22, 0, 0], thighR: [-10, 0, -16], kneeR: [22, 0, 0],
    };
  });
  // Zamasu holding him to the wall (the PDF's image): the left hand flat on his chest, the right low with the blade
  // level past his waist into the wall; leaning in
  PZ.zm_pin = PZ.zm_pin || {
    hands: ['open', 'open'],
    root: { y: -0.04, rx: 6 }, spine: [6, 0, 0], chest: [6, 0, 0], head: [6, 0, 0],
    shoulderL: [-84, 0, -8], elbowL: [-14, 0, 0], shoulderR: [-34, 0, 14], elbowR: [-58, 0, 0], handR: [0, 0, 0],
    thighL: [-24, 0, 8], kneeL: [20, 0, 0], thighR: [14, 0, -8], kneeR: [10, 0, 0],
  };
  /* ---------------------------------------------------------------- setup and helpers */

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: K.ground(b, new V3(0, 0, -5)), startKi: 100 });
    S.goku._playerController = S.goku.controller;
    S.black = b.spawn({ charId: 'goku_black', team: 1, pos: K.ground(b, new V3(2, 0, 6)), startKi: 80 });
    S.zamasu = b.spawn({ charId: 'zamasu', team: 1, pos: K.ground(b, new V3(-2, 0, 6)), startKi: 80 });
    S.vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: K.ground(b, new V3(-6, 0, -9)), startKi: 40 });
    S.trunks = b.spawn({ charId: 'future_trunks', team: 0, pos: K.ground(b, new V3(6, 0, -9)), startKi: 80 });
    for (const f of Object.values(S)) f.cannotDie = true;
    for (const f of [S.vegeta, S.trunks]) bench(f, false);
    return S;
  }

  /** Out of the fight: nobody can reach them, they reach nobody. */
  function bench(f, hidden) {
    f.controller = K.scripted();
    f.untargetable = f.intangible = true;
    f.setHidden(hidden);
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  const fill = (f, prop, k) => f.model && f.model.setPropFill && f.model.setPropFill(prop, k);
  const flat = (v) => v.clone().setY(0).normalize();
  const sideOf = (d) => new V3(d.z, 0, -d.x);
  /**
   * The eyes lost in shadow under the hair (BT-RAGE-01): the model's brow-shadow shell (setRage, used for Gohan),
   * without its tears and darker, with the eyes themselves hidden under it — the bowed head alone still showed them.
   */
  function eyesShaded(f, on) {
    const md = f.model;
    if (!md || !md.setRage || !md.face) return;
    md.setRage(on, 1);
    if (md._rage) {
      for (const t of md._rage.tears) t.visible = false;
      md._rage.shadow.material.opacity = on ? 0.85 : 0;
    }
    md.setPupilScale(on ? 0.04 : 1);
    for (const e of md.face.eyes.concat(md.face.pupils, md.face.rims || [])) e.visible = !on;
  }
  const eyesWhite = (f, on) => f.model && f.model.setPupilScale && f.model.setPupilScale(on ? 0.04 : 1);
  /** Pose a fighter and hold the aura at k (a scripted state's sd.aura). */
  const poseAura = (f, pose, face, speed, k) => {
    K.pose(f, pose, face, speed);
    f.sd.aura = k;
  };

  /**
   * THE WALL (BT-RAGE-01): the face of the ruined building nearest the square, from its instanced box (a building
   * collides as a cylinder, but its walls are flat). Returns { at: the ground at the face, out: its outward normal }.
   * A stage with no buildings: a point by the square, facing it.
   */
  function pinWall(b) {
    let o = null, bd = Infinity;
    for (const x of b.stage.obstacles || []) {
      if (!x.alive || !x.building || x.h < 2.6) continue;
      const d = Math.hypot(x.x, x.z);
      if (d >= 12 && d < bd) (o = x), (bd = d);
    }
    if (!o) return { at: K.ground(b, new V3(0, 0, -12)), out: new V3(0, 0, 1) };
    const F = faceOf(o, new V3(0, 0, 0));
    return { at: K.ground(b, F.at.addScaledVector(F.out, 0.32)), out: F.out };
  }

  /**
   * A building's wall toward a point: the box side the centre-to-point line leaves through (a building collides as a
   * cylinder, but its walls are flat — its instanced box gives their size). Returns { at: the face on the line (y 0),
   * out: its outward normal, size: the box }.
   */
  function boxOf(o) {
    const m4 = new THREE.Matrix4(), p = new V3(), q = new THREE.Quaternion(), s = new V3(1, 1, 1);
    if (o.building && o.building.mesh && o.building.mesh.getMatrixAt) {
      o.building.mesh.getMatrixAt(o.building.index, m4);
      m4.decompose(p, q, s);
    } else s.set(o.r * 2, o.h, o.r * 2);
    return s;
  }
  function faceOf(o, toward) {
    const s = boxOf(o);
    const dx = toward.x - o.x, dz = toward.z - o.z;
    const xFace = Math.abs(dx) * s.z >= Math.abs(dz) * s.x;
    const out = xFace ? new V3(Math.sign(dx) || 1, 0, 0) : new V3(0, 0, Math.sign(dz) || 1);
    return { at: new V3(o.x, 0, o.z).addScaledVector(out, xFace ? s.x / 2 : s.z / 2), out, size: s };
  }

  /**
   * No building's box near the line from `from` along `v` on the ground plan: 3 m clear at the blast, 13 m at the lens
   * end (a tower beside the lens fills the frame). The boxes, not the collision cylinders (r is half the shorter side).
   */
  function openLine(b, from, v) {
    for (const o of b.stage.obstacles || []) {
      if (!o.alive || !o.building) continue;
      const s = boxOf(o);
      for (let i = 1; i <= 8; i++) {
        const p = from.clone().addScaledVector(v, i / 8), mg = 3 + 10 * (i / 8);
        if (Math.abs(p.x - o.x) < s.x / 2 + mg && Math.abs(p.z - o.z) < s.z / 2 + mg) return false;
      }
    }
    return true;
  }

  /**
   * DL-S04's "blowing out surrounding building glass": the walls of the nearest buildings facing the blast throw out
   * glass as the shockwave reaches them (later the farther they are). Pooled debris (vfx.rock), a few dozen shards in
   * all. Returns how many walls broke.
   */
  function glassOut(b, at, reach = 70) {
    const near = (b.stage.obstacles || []).filter((o) => o.alive && o.building && o.h > 2)
      .map((o) => ({ o, d: Math.hypot(o.x - at.x, o.z - at.z) - o.r })).filter((x) => x.d < reach)
      .sort((p, q) => p.d - q.d).slice(0, 3);
    for (const { o, d } of near) {
      const F = faceOf(o, at), along = new V3(F.out.z, 0, -F.out.x);
      const y = U.clamp(at.y, 1.5, Math.max(1.5, o.h - 1));
      b.after(Math.max(1, Math.round((d / 90) * 60)), () => {
        for (let i = 0; i < 12; i++) {
          const p = F.at.clone().addScaledVector(along, U.rand(-4, 4)).add(new V3(0, y + U.rand(-1.6, 1.6), 0)).addScaledVector(F.out, 0.2);
          b.vfx.rock(p, F.out.clone().multiplyScalar(U.rand(4, 9)).add(new V3(U.rand(-1.5, 1.5), U.rand(0, 3), U.rand(-1.5, 1.5))), U.rand(0.1, 0.2), 0xcfe8ff);
        }
        b.vfx.sparks(F.at.clone().add(new V3(0, y, 0)).addScaledVector(F.out, 0.3), 0xeaf6ff, 14, 7, 0.1);
      });
    }
    return near.length;
  }

  /**
   * The Divine Lasso's crescent and needles are the technique's own (src/game/techniques.js 'divineLasso', the Free
   * Battle move): here they ride the mission's tick hooks and go with its dispose.
   */
  const LASSO = () => SL.Techniques.divineLasso;
  function crescent(m, f) {
    const c = LASSO().crescent(m.battle.scene, MAGENTA);
    const hook = () => c.follow(f);
    m.tickHooks.push(hook);
    const dispose = () => {
      K.removeHook(m, hook);
      c.dispose();
    };
    m.onDispose(dispose);
    return {
      group: c.group,
      set(v) {
        c.set(v);
        c.follow(f);
      },
      edge: c.edge,
      dispose,
    };
  }
  function needles(m, from, g, toward) {
    const nd = LASSO().needles(m.battle.scene, from, g, toward);
    const hook = () => nd.place();
    m.tickHooks.push(hook);
    const dispose = () => {
      K.removeHook(m, hook);
      nd.dispose();
    };
    m.onDispose(dispose);
    return { list: nd.list, fly: nd.fly, flare: nd.flare, tips: nd.tips, dispose };
  }

  /** A body slid along the ground by a blast of aura, over `frames`, with a hit pose and dust where it stops. */
  function* blownBack(m, list, frames) {
    const b = m.battle;
    const from = list.map(([f]) => f.pos.clone());
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / frames));
      list.forEach(([f, to], i) => {
        f.setPosition(from[i].clone().lerp(to, k));
        f.vel.set(0, 0, 0);
        if (n % 5 === 0 && !b.skipRequested) b.vfx.dust(K.ground(b, f.pos.clone()), 0.9, 3);
      });
      return k >= 1;
    };
  }

  /** A played stretch: the hero under the player against two AIs. Returns the storyFight handle. */
  function fight(m, hero, foes, T, heroFloorKey) {
    const b = m.battle;
    for (const f of [hero].concat(foes)) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
      f.hp = f.hpMax;
    }
    for (const f of foes) {
      fill(f, f === b.story.black ? 'blackBlade' : 'zamasuBlade', 0);
      if (f.pos.distanceTo(hero.pos) < 5) K.place(f, K.ground(b, hero.pos.clone().add(new V3(foes.indexOf(f) ? -4 : 4, 0, 8))), Math.PI);
    }
    hero.ki = Math.max(hero.ki, hero.kiMax * 0.7);
    hero.controller = hero._playerController || (hero._playerController = new SL.PlayerController(b));
    b.switchPlayer(hero, { force: true, quiet: true });
    hero.target = foes[0];
    for (const f of foes) {
      f.target = hero;
      f.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, f.def.ai, f.form.ai || {}, { transformHp: 0 }) });
    }
    for (const f of [hero].concat(foes)) f.setState('free');
    const sf = m.storyFight({
      floors: foes.map((f) => ({ f, at: T.foeFloor })),
      dealt: foes.map((f) => ({ f, mul: T.foeDealt })),
      taken: foes.map((f) => ({ f, mul: T.foeTaken })),
      fighters: [hero].concat(foes),
    });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    return sf;
  }

  /** Waits out a played stretch; returns whether both foes reached their floors. */
  function* endFight(m, sf, hero, foes, heroFloor, seconds) {
    const b = m.battle;
    let n = 0;
    yield () => {
      n++;
      return foes.every((f) => sf.floored(f)) || hero.hpFrac < heroFloor || n >= seconds * 60 || m.state !== 'running';
    };
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    return foes.every((f) => sf.floored(f));
  }

  const P = {};

  /* ---------------------------------------------------------------- CONFESSION — BT-RAGE-01 phases A and B */
  P.confession = { id: 'confession', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, z = S.zamasu, v = S.vegeta, tr = S.trunks;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    K.toForm(g, 'blue');
    K.toForm(bk, 'rose');
    K.toForm(z, 'base');
    K.toForm(v, 'base');
    K.toForm(tr, 'ssj');
    for (const f of [g, bk, z]) f.controller = K.scripted();
    bench(v, false);
    bench(tr, false);
    K.sheathe(tr, true);
    eyesWhite(tr, false);
    const W = pinWall(b), out = W.out, side = sideOf(out);
    S.wall = W;
    K.place(g, W.at, 0);
    K.faceTo(g, W.at.clone().add(out));
    // Zamasu a step in front of him and a little aside, so the blade passes his waist into the wall (the PDF's image)
    K.place(z, K.ground(b, W.at.clone().addScaledVector(out, 0.95).addScaledVector(side, 0.32)), 0);
    K.faceTo(z, W.at.clone().addScaledVector(side, 0.32));
    K.place(bk, K.ground(b, W.at.clone().addScaledVector(out, 3.4).addScaledVector(side, -1.8)), 0);
    K.faceTo(bk, g.pos);
    K.place(v, K.ground(b, W.at.clone().addScaledVector(out, 6.5).addScaledVector(side, -4.2)), 0);
    K.faceTo(v, g.pos);
    K.place(tr, K.ground(b, W.at.clone().addScaledVector(out, 5.5).addScaledVector(side, -7)), 0);
    K.faceTo(tr, g.pos);
    poseAura(v, 'knockdownFace', 'hurt', 6, 0);
    poseAura(tr, 'ft_kneel', 'hurt', 6, 0);
    poseAura(g, 'gz_bowed', 'grit', 8, 0.25);
    K.pose(z, 'zm_pin', 'wicked', 8);
    fill(z, 'zamasuBlade', 1);
    K.pose(bk, 'gb_idle', 'smirk', 4);
    m.music('zamasu_theme', 1);
    // wide, along the wall (the PDF's image): Zamasu holding him there in profile, Black aside; Vegeta down in the
    // rubble, Trunks on one knee beyond
    m.shot((t, o) => K.camAt(o, W.at.clone().addScaledVector(out, 5).addScaledVector(side, 7.5).add(new V3(0, 1.2, 0)), W.at.clone().addScaledVector(out, 1.6).add(new V3(0, 1.15, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    m.title(CHAPTER, 'ZERO MORTALS', 'Future · the second trip', 3.4);
    m.say('zamasu', 'Be still, mortal. You will want to hear this.', 2.6, { style: 'quiet' });
    yield* st.wait(2.8);
    // Black walks up beside Zamasu, unhurried
    const b0 = bk.pos.clone(), b1 = K.ground(b, W.at.clone().addScaledVector(out, 1.7).addScaledVector(side, -0.9));
    K.pose(bk, 'run', 'smirk', 3);
    let n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 50));
      bk.setPosition(b0.clone().lerp(b1, k));
      return k >= 1;
    };
    K.faceTo(bk, g.pos);
    K.pose(bk, 'gb_idle', 'smirk', 5);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.say('goku_black', 'This body was yours once. I made my wish on the Super Dragon Balls and traded mine for it.', 3.4, { style: 'quiet' });
    yield* st.wait(3.4);
    m.say('goku_black', 'Then I ended you — the Goku of that world — with my own old hands. And then his wife, and his son.', 3.6, { style: 'quiet' });
    yield* st.wait(3.8);
    m.flags.confession = true;

    // PHASE A — the drop: the music cut dead, a heartbeat, the bowed face close (the eyes under the hair)
    SL.Music.stop(0.15);
    b.stage.setMood(0.3, 0x081420, 0.5);
    poseAura(g, 'gz_bowed', 'grit', 10, 0.2);
    eyesShaded(g, true);
    const gf = flat(out);
    m.shot((t, o) => {
      const F = SL.data.brolyKit.facePoint(g);
      K.camAt(o, F.center.clone().addScaledVector(gf, 0.85).add(new V3(0, 0.06, 0)), F.center.clone().add(new V3(0, -0.04, 0)), 30);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) b.sfx('heartbeat', g, { vol: 1 });
    m.flags.silence = true;
    yield* st.wait(1.2);
    m.say('goku', 'You took my body... you took my life... and then you killed Chi-Chi and Goten too...?', 3.4, { style: 'quiet' });
    // the fist at his chest, trembling (from the side away from Zamasu, his blade in the corner)
    m.shot((t, o) => {
      const h = g.handPos('R');
      K.camAt(o, h.clone().addScaledVector(gf, 0.55).addScaledVector(side, -0.7).add(new V3(0, 0.1, 0)), h, 34);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) b.sfx('heartbeat', g, { vol: 1, pitch: 1.08 });
    yield* st.wait(1.5);
    m.shot((t, o) => {
      const F = SL.data.brolyKit.facePoint(g);
      K.camAt(o, F.center.clone().addScaledVector(gf, 0.85).add(new V3(0, 0.06, 0)), F.center.clone().add(new V3(0, -0.04, 0)), 30);
    }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.9);

    // the head comes up: level with the eyes now, the teal blazing (two flashes on the eyes)
    poseAura(g, 'gz_glare', 'angry', 30, 0.55);
    eyesShaded(g, false);
    m.shot((t, o) => {
      const F = SL.data.brolyKit.facePoint(g);
      K.camAt(o, F.center.clone().addScaledVector(gf, 0.9).add(new V3(0, 0.02, 0)), F.center.clone().add(new V3(0, 0.01, 0)), 30);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      const F = SL.data.brolyKit.facePoint(g);
      const across = sideOf(gf);
      for (const s of [-1, 1]) b.vfx.flash(F.center.clone().addScaledVector(gf, F.R * 0.9).addScaledVector(across, s * F.R * 0.38).add(new V3(0, F.R * 0.05, 0)), 0.22, CYAN, 0.3, SL.Toon.tex.glow);
      b.sfx('tierUp', g, { vol: 0.7, pitch: 0.6 });
    }
    m.flags.eyesUp = true;
    m.say('goku', 'You shouldn\'t have told me that, Zamasu. I\'m mad now. REALLY mad... and you\'re gonna PAY FOR IT!', 3.8, { style: 'shout' });
    yield* st.wait(3.8);

    // PHASE B — the roar: from low in front, the head thrown back; the aura bursting out of him, the ground giving
    b.stage.clearMood(0.3);
    fill(z, 'zamasuBlade', 0);
    poseAura(g, 'gz_roar', 'shout', 30, 1);
    const feet = K.ground(b, g.pos.clone());
    m.shot((t, o, el) => {
      const c = g.chest(), k = U.easeOutCubic(Math.min(1, el / 1.6));
      K.camAt(o, feet.clone().addScaledVector(gf, U.lerp(3.4, 4.8, k)).addScaledVector(side, 2.8).add(new V3(0, 0.9, 0)), c.clone().add(new V3(0, U.lerp(0.45, 0.7, k), 0)), U.lerp(44, 52, k));
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.22, '#cdeeff'); // one short frame of light, not a white-out
      b.sfx('roar', g, { vol: 1.1 });
      b.sfx('transformBurst', g, { vol: 1 });
      b.vfx.ring(feet.clone().add(new V3(0, 0.3, 0)), 14, CYAN, 0.9, new V3(0, 1, 0));
      b.vfx.ring(feet.clone().add(new V3(0, 0.5, 0)), 8, 0xffffff, 0.5, new V3(0, 1, 0));
      b.stage.crater(feet.clone().addScaledVector(gf, 0.6), 3.4, 0.45, g);
      b.vfx.debrisBurst(feet.clone().addScaledVector(gf, 1.2), 12, 0x8a8478, 10, 0.22);
    }
    m.flags.roar = true;
    // both gods blown back across the square, away from the lens, from the first frame of it (the shake, 1.5 s, rides
    // on top)
    K.pose(z, 'hitBody', 'shock', 20);
    K.pose(bk, 'guard', 'shock', 20);
    const flung = [[z, K.ground(b, W.at.clone().addScaledVector(out, 6.5).addScaledVector(side, -3.5))], [bk, K.ground(b, W.at.clone().addScaledVector(out, 7.5).addScaledVector(side, -5))]];
    const flungFrom = flung.map(([f]) => f.pos.clone());
    let fk = 0;
    const fling = () => {
      fk++;
      const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, fk / 40));
      flung.forEach(([f, to], i) => {
        f.setPosition(flungFrom[i].clone().lerp(to, k));
        f.vel.set(0, 0, 0);
        if (fk % 5 === 0 && k < 1) b.vfx.dust(K.ground(b, f.pos.clone()), 0.9, 3);
      });
      return k < 1;
    };
    b.onTick(fling);
    let shake = 0;
    const quake = () => {
      shake++;
      if (shake % 6 === 0 && !b.skipRequested) {
        b.cameraTraumaAt(g.chest(), 0.42);
        b.vfx.bolt(g.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.4, 1), U.rand(-0.6, 0.6))), 1.4, 0xffffff);
      }
      return shake < 90;
    };
    b.onTick(quake);
    yield* st.wait(0.8);
    // wide along the square: Goku at the wall in his aura, the two of them thrown back across it
    m.shot((t, o) => K.camAt(o, W.at.clone().addScaledVector(out, 4).addScaledVector(side, 11).add(new V3(0, 1.6, 0)), W.at.clone().addScaledVector(out, 3.5).addScaledVector(side, -1.5).add(new V3(0, 1.1, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.4);
    for (const [f, to] of flung) K.place(f, to, 0);
    K.faceTo(z, g.pos);
    K.faceTo(bk, g.pos);
    K.pose(z, 'zm_idle', 'shock', 6);
    K.pose(bk, 'gb_idle', 'grit', 6);
    yield* st.wait(1.4);
    m.music('ssj_blue', 3);
    m.endShot();
    b.skipRequested = false;
  } };

  /* ---------------------------------------------------------------- RAGE — phase C, played */
  P.rage = { id: 'rage', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, z = S.zamasu;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    bench(S.vegeta, false);
    bench(S.trunks, false);
    poseAura(S.vegeta, 'knockdownFace', 'hurt', 6, 0);
    poseAura(S.trunks, 'ft_kneel', 'hurt', 6, 0);
    K.toForm(g, 'blue');
    K.toForm(bk, 'rose');
    for (const f of [g, bk, z]) f.controller = K.scripted();
    fill(z, 'zamasuBlade', 0);
    fill(bk, 'blackBlade', 0);
    if (g.pos.distanceTo(bk.pos) > 16 || g.pos.distanceTo(bk.pos) < 4) K.place(bk, K.ground(b, g.pos.clone().add(new V3(3, 0, 8))), Math.PI);
    if (g.pos.distanceTo(z.pos) > 16 || g.pos.distanceTo(z.pos) < 4) K.place(z, K.ground(b, g.pos.clone().add(new V3(-3, 0, 8))), Math.PI);
    // the blitz (the PDF: Black slammed into the street, a spin, Zamasu struck away) — staged, one breath long
    if (!b.skipRequested) {
      const d = flat(bk.pos.clone().sub(g.pos)), sd = sideOf(d);
      b.vfx.afterimage(g.pos, g.height, CYAN);
      b.sfx('vanish', g);
      K.place(g, K.ground(b, bk.pos.clone().addScaledVector(d, -1.1)), 0);
      K.faceTo(g, bk.pos);
      poseAura(g, 'hammer', 'angry', 40, 1);
      K.pose(bk, 'smashed', 'hurt', 30);
      const p = bk.chest();
      m.shot((t, o) => K.camAt(o, p.clone().addScaledVector(sd, 5).add(new V3(0, 0.6, 0)), p, 48), 999, { cut: true, blendIn: 0, hold: true });
      b.vfx.impact(p, 3, CYAN);
      b.stage.crater(K.ground(b, bk.pos.clone()), 2.2, 0.4, bk);
      b.vfx.dust(K.ground(b, bk.pos.clone()), 2.4, 14);
      b.sfx('punchHeavy', bk, { vol: 1.1 });
      b.cameraTraumaAt(p, 0.5);
      yield* st.wait(0.5);
      // the spin, and Zamasu struck away across the street
      K.place(g, K.ground(b, z.pos.clone().addScaledVector(flat(g.pos.clone().sub(z.pos)), 1.1)), 0);
      K.faceTo(g, z.pos);
      poseAura(g, 'punchR', 'angry', 40, 1);
      K.pose(z, 'hitSideL', 'shock', 30);
      const q = z.chest().lerp(g.chest(), 0.5), qs = sideOf(flat(z.pos.clone().sub(g.pos)));
      m.shot((t, o) => K.camAt(o, q.clone().addScaledVector(qs, -4.4).add(new V3(0, 0.5, 0)), q, 48), 999, { cut: true, blendIn: 0, hold: true });
      b.vfx.impact(z.chest(), 3, CYAN);
      b.sfx('punchHeavy', z, { vol: 1.1 });
      b.cameraTraumaAt(z.chest(), 0.45);
      yield* blownBack(m, [[z, K.ground(b, z.pos.clone().addScaledVector(flat(z.pos.clone().sub(g.pos)), 9))]], 18);
      m.flags.blitz = true;
    }
    m.endShot();
    b.skipRequested = false;
    m.title(CHAPTER, 'ZERO MORTALS', 'Rage · Blue Goku vs Black and Zamasu', 2.4);
    m.objective('rage', 'Make them pay — drive back Black and Zamasu before the rage burns out', { icon: 'fist' });
    m.music('ssj_blue', 3);
    const sf = fight(m, g, [bk, z], TU.rage);
    // the rage state, for this stretch only: ki locked full, light blows land without stopping him. The engine's own
    // infiniteKi (spends skipped in R.spendKi, held at max in _regen): a refill in a mission hook ran before the
    // fighters' update, so a spend left the bar at 90 % for the rest of that tick
    const armor0 = g.storyArmor, ki0 = g.infiniteKi;
    g.storyArmor = TU.rage.armor;
    g.infiniteKi = true;
    g.ki = g.kiMax;
    const restore = () => {
      g.storyArmor = armor0;
      g.infiniteKi = ki0;
    };
    m.onDispose(restore);
    const both = yield* endFight(m, sf, g, [bk, z], TU.rage.gokuFloor, TU.rage.seconds);
    restore();
    if (m.state !== 'running') return;
    m.flags.rage = both;
    m.qteParts.push(both ? 1 : 0.6);
    m.complete('rage');
  } };

  /* ---------------------------------------------------------------- LASSO — DL-S01 to S04, B-DL-01 */
  P.lasso = { id: 'lasso', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, z = S.zamasu;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    for (const f of [g, bk, z]) f.controller = K.scripted();
    K.toForm(g, 'blue');
    K.toForm(bk, 'rose');
    // the rage spent: Goku up in the air, breathing hard; Black on the street below, getting up
    const G0 = K.ground(b, g.pos.clone());
    const air = G0.clone().add(new V3(0, 3.6, 0));
    g.grounded = false;
    K.place(g, air, 0);
    const d = (() => {
      const v = flat(bk.pos.clone().sub(G0));
      return v.lengthSq() > 0.5 ? v : new V3(0, 0, 1);
    })();
    const side = sideOf(d);
    K.place(bk, K.ground(b, G0.clone().addScaledVector(d, 10)), 0);
    K.place(z, K.ground(b, G0.clone().addScaledVector(d, 12).addScaledVector(side, -3)), 0);
    K.faceTo(g, bk.pos);
    K.faceTo(bk, g.pos);
    K.faceTo(z, g.pos);
    poseAura(g, 'exhausted', 'grit', 6, 0.3);
    K.pose(bk, 'gb_idle', 'grin', 5);
    K.pose(z, 'zm_idle', 'wicked', 5);
    let held = true;
    const hold = () => {
      if (!held) return;
      g.grounded = false;
      g.vel.set(0, 0, 0);
      g.setPosition(air);
    };
    m.tickHooks.push(hold);
    m.onDispose(() => K.removeHook(m, hold));
    // the bridge out of the played rage (the PDF: the burst "hits a physical ceiling" and Blue, run on anger, drains
    // him): from a little below and in front, Goku breathing hard in the air while the Blue aura sputters out and back
    if (!b.skipRequested) {
      const gs = sideOf(flat(g.forward));
      m.shot((t, o) => {
        const c = g.chest();
        K.camAt(o, c.clone().addScaledVector(flat(g.forward), 2.7).addScaledVector(gs, 0.9).add(new V3(0, -0.45, 0)), c.clone().add(new V3(0, 0.3, 0)), 44);
      }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Hah... hah... no... it\'s running out...', 1.8, { style: 'quiet' });
      let n = 0;
      yield () => {
        n++;
        g.sd.aura = n % 14 < 6 ? 0.75 : 0.1;
        return n >= 100 || b.skipRequested;
      };
      g.sd.aura = 0.3;
      m.flags.burnOut = true;
    }
    shot(m, { black: bk }, { subject: 'black', focus: 'closeup', angle: 'three' }, 999);
    m.say('goku_black', 'Ha... ha ha. Yes — this pain. Every blow you land only makes this body stronger.', 3.2, { style: 'quiet' });
    yield* st.wait(3.2);

    // DL-S01: low and close, tilting up from his hand as the crescent grows out of the palm
    const cr = crescent(m, bk);
    K.pose(bk, 'gb_lassoW', 'grin', 10);
    const bf = flat(g.pos.clone().sub(bk.pos));
    m.shot((t, o, el) => {
      const k = U.easeInOutCubic(Math.min(1, el / 1.3));
      const h = bk.handPos('R');
      K.camAt(o, K.ground(b, bk.pos.clone()).addScaledVector(bf, 3).addScaledVector(sideOf(bf), -1.1).add(new V3(0, 0.35, 0)), h.clone().lerp(bk.headPos(), k * 0.75).add(new V3(0, 0.2, 0)), 46);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) b.sfx('kiCharge', bk, { vol: 0.9 });
    {
      let n = 0;
      yield () => {
        n++;
        cr.set(b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 48)));
        if (!b.skipRequested && n % 7 === 0) b.vfx.sparks(bk.handPos('R'), 0xe0a0ff, 4, 3, 0.05);
        return n >= 84 || b.skipRequested;
      };
    }
    m.flags.crescent = true;

    // DL-S02: wide, the lens whipping across with the sweep; the blade breaks into needles that cross the gap
    K.pose(bk, 'gb_sweepW', 'angry', 30);
    const mid = bk.chest().lerp(g.chest(), 0.5);
    m.shot((t, o, el) => {
      const k = U.easeOutCubic(Math.min(1, el / 0.35));
      K.camAt(o, mid.clone().addScaledVector(side, 13).add(new V3(0, 1, 0)), bk.chest().lerp(g.chest(), k * 0.55), 52); // ends with both in frame
    }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.2);
    K.pose(bk, 'gb_sweep', 'angry', 34);
    if (!b.skipRequested) b.sfx('swordSlash', bk, { vol: 1.1 });
    const nd = needles(m, cr.edge(9), g, bk.pos);
    cr.set(0);
    m.flags.needles = nd.list.length;
    {
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : Math.min(1, n / 14);
        nd.fly(k);
        if (!b.skipRequested && n % 2 === 0) for (const p of nd.tips().slice(0, 4)) b.vfx.trail(p, 0xd070ff, 0.08, 0.15);
        return n >= 22 || b.skipRequested;
      };
    }
    cr.dispose();

    // DL-S03: close on Goku, Dutch, the camera shaking — held in the air by them, screaming
    poseAura(g, 'needled', 'shout', 40, 0.6);
    const gf = flat(bk.pos.clone().sub(g.pos)), gs = sideOf(gf);
    m.shot((t, o) => {
      const c = g.chest();
      K.camAt(o, c.clone().addScaledVector(gf, 1.35).addScaledVector(gs, 0.55).add(new V3(0, 0.3, 0)), c.clone().add(new V3(0, 0.32, 0)), 36);
      o.roll = 0.26;
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.sfx('roar', g, { vol: 0.9, pitch: 1.15 });
      for (const p of nd.tips()) b.vfx.flash(p, 0.35, 0xe8b8ff, 0.18, SL.Toon.tex.glow);
      b.cameraTraumaAt(g.chest(), 0.55);
    }
    m.flags.pinned = true;
    yield* st.wait(1.3);

    // Black turns half away and closes his hand
    K.pose(bk, 'gb_lassoClose', 'smirk', 12);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.say('goku_black', 'Shatter.', 1.2, { style: 'quiet' });
    yield* st.wait(0.9);
    if (!b.skipRequested) b.sfx('kiUp', g, { vol: 1, pitch: 1.4 });
    {
      let n = 0;
      yield () => {
        n++;
        nd.flare(b.skipRequested ? 1 : Math.min(1, n / 14));
        return n >= 16 || b.skipRequested;
      };
    }

    // DL-S04: the detonation — the lens snapping back to an extreme wide as the violet blast swallows him
    const at = g.chest();
    nd.dispose();
    // the pull-back goes to whichever side of the blast has open street (the rage ends wherever the player left it,
    // and a 40 m lens on the wrong side ended against a tower)
    const pull = [side, side.clone().negate(), gf.clone().negate(), gf].map((v) => v.clone().multiplyScalar(40).addScaledVector(gf, -5))
      .find((v) => openLine(b, at, v)) || side.clone().multiplyScalar(24);
    m.shot((t, o, el) => {
      const k = U.easeOutCubic(Math.min(1, el / 0.45));
      K.camAt(o, at.clone().addScaledVector(pull, U.lerp(0.18, 1, k)).add(new V3(0, U.lerp(0.6, 9, k), 0)), at.clone().add(new V3(0, U.lerp(0, 2, k), 0)), U.lerp(48, 56, k));
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.28, '#f0c8ff');
      b.vfx.explosion(at, 2.6, MAGENTA, { smoke: true });
      b.vfx.ring(at, 12, 0xe070ff, 0.7);
      b.vfx.ring(at, 7, 0xffffff, 0.4, new V3(0, 1, 0));
      b.sfx('explosionHuge', g, { vol: 1.1 });
      b.cameraTraumaAt(at, 0.8);
      m.flags.glass = glassOut(b, at);
    }
    m.flags.detonation = true;
    yield* st.wait(0.6);

    // he falls out of the smoke, out of Blue, into the street
    held = false;
    K.removeHook(m, hold);
    K.pose(g, 'tumble', 'hurt', 20);
    g.sd.aura = 0;
    const land = K.ground(b, G0.clone().addScaledVector(d, -2));
    {
      const p0 = g.pos.clone();
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 26));
        g.grounded = false;
        g.setPosition(p0.clone().lerp(land, k));
        g.vel.set(0, 0, 0);
        return k >= 1;
      };
    }
    K.toForm(g, 'base');
    K.place(g, land, 0);
    K.faceTo(g, bk.pos);
    K.pose(g, 'lieBack', 'hurt', 10);
    b.stage.crater(land.clone(), 2.6, 0.55, g);
    b.vfx.dust(land.clone(), 3, 16);
    b.sfx('groundImpact', g, { vol: 1.1 });
    b.cameraTraumaAt(land, 0.5);
    S.crater = land;
    m.flags.gokuDown = g.form.id === 'base';
    // B-DL-01: smoke rolling off him; Black floats down to the crater's edge beside Zamasu
    const rim = K.ground(b, land.clone().addScaledVector(d, 3.2));
    K.place(bk, rim.clone().add(new V3(0, 2.2, 0)), 0);
    K.place(z, K.ground(b, rim.clone().addScaledVector(side, 1.8)), 0);
    K.faceTo(bk, land);
    K.faceTo(z, land);
    K.pose(bk, 'gb_idle', 'smirk', 5);
    K.pose(z, 'zm_idle', 'wicked', 5);
    m.shot((t, o) => K.camAt(o, land.clone().addScaledVector(d, 0.6).add(new V3(0, 0.5, 0)), rim.clone().add(new V3(0, 1.8, 0)), 52), 999, { cut: true, blendIn: 0, hold: true });
    {
      const r0 = bk.pos.clone();
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 60));
        bk.grounded = false;
        bk.setPosition(r0.clone().lerp(rim, k));
        bk.vel.set(0, 0, 0);
        if (!b.skipRequested && n % 10 === 0) b.vfx.dust(land.clone().add(new V3(U.rand(-0.6, 0.6), 0.3, U.rand(-0.6, 0.6))), 0.8, 3);
        return k >= 1;
      };
    }
    K.place(bk, rim, 0);
    K.faceTo(bk, land);
    m.say('goku_black', 'Mortal anger. It burns hot, and then it burns out. A god\'s power never does.', 3.4, { style: 'quiet' });
    yield* st.wait(3.4);
    m.endShot();
    b.skipRequested = false;
  } };

  /* ---------------------------------------------------------------- TRUNKS — B-DL-02, Super Saiyan Rage */
  P.trunks = { id: 'trunks', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, z = S.zamasu, tr = S.trunks;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    for (const f of [g, bk, z]) f.controller = K.scripted();
    bench(g, false);
    K.toForm(g, 'base');
    K.toForm(bk, 'rose');
    K.toForm(tr, 'ssj');
    const land = S.crater || K.ground(b, g.pos.clone());
    K.place(g, land, 0);
    K.pose(g, 'lieBack', 'hurt', 6);
    const d = (() => {
      const x = flat(bk.pos.clone().sub(land));
      return x.lengthSq() > 0.5 ? x : new V3(0, 0, 1);
    })();
    const side = sideOf(d);
    // back from the crater and apart: the engine's burst lens (4–5 m in front of Trunks) passes between them
    K.place(bk, K.ground(b, land.clone().addScaledVector(d, 8).addScaledVector(side, -2.4)), 0);
    K.place(z, K.ground(b, land.clone().addScaledVector(d, 8).addScaledVector(side, 2.4)), 0);
    K.faceTo(bk, land);
    K.faceTo(z, land);
    // the two raise their hands over the crater: one blast, and no more Saiyans
    K.pose(bk, 'blastR', 'wicked', 8);
    K.pose(z, 'zm_lightW', 'wicked', 8);
    m.music('zamasu_theme', 2);
    shot(m, { black: bk, zamasu: z }, { subject: 'black', with: 'zamasu', focus: 'medium', angle: 'low' }, 999);
    m.say('zamasu', 'Let us finish it. Both Saiyans, at once.', 2.4);
    let n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 6 === 0) {
        b.vfx.flash(bk.handPos('R'), 0.6, PINK, 0.14, SL.Toon.tex.glow);
        b.vfx.flash(z.handPos('R'), 0.6, 0xe8e0ff, 0.14, SL.Toon.tex.glow);
      }
      return n >= 140 || b.skipRequested;
    };
    // Trunks between them and the crater, the sword out
    const guard = K.ground(b, land.clone().addScaledVector(d, 1.8));
    tr.setHidden(false);
    b.vfx.afterimage(tr.pos, tr.height, GOLD);
    b.sfx('dash', tr);
    K.place(tr, guard, 0);
    K.faceTo(tr, bk.pos.clone().lerp(z.pos, 0.5));
    K.sheathe(tr, false);
    K.pose(tr, 'ft_drawOut', 'angry', 14);
    if (!b.skipRequested) b.sfx('swordDraw', tr, { vol: 1 });
    // from low behind the crater: his back, the two gods beyond him
    m.shot((t, o) => K.camAt(o, land.clone().addScaledVector(d, -2.2).addScaledVector(side, 0.9).add(new V3(0, 0.45, 0)), tr.chest().addScaledVector(d, 2).add(new V3(0, 0.6, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    K.pose(bk, 'gb_idle', 'smirk', 5);
    K.pose(z, 'zm_idle', 'calm', 5);
    m.say('future_trunks', 'Get away from them!', 1.8, { style: 'shout' });
    yield* st.wait(2);
    m.flags.trunksSteps = true;
    // the sinner (B-DL-02): the blame laid on him
    shot(m, { zamasu: z }, { subject: 'zamasu', focus: 'upper', angle: 'three' }, 999);
    m.say('zamasu', 'You, of all mortals. You crossed time to save one Saiyan — and opened the door to all of this.', 3.6);
    yield* st.wait(3.6);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.say('goku_black', 'Every world we have cleansed began with your sin, Trunks. We are only finishing what you started.', 3.6, { style: 'quiet' });
    yield* st.wait(3.6);
    K.pose(tr, 'ft_tfClench', 'grit', 8);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'closeup', angle: 'low' }, 999);
    m.say('future_trunks', 'Shut up... SHUT UP!', 2, { style: 'shout' });
    yield* st.wait(1.8);
    m.endShot();
    b.skipRequested = false;
    // the awakening: the gold flame with the blue wrapped round it, blue lightning, the eyes gone white
    const tf = flat(bk.pos.clone().lerp(z.pos, 0.5).sub(tr.pos)), ts = sideOf(tf);
    yield* SL.data.cinematics.transform(m, {
      fighter: tr, formIndex: K.formIndex(tr, 'rage'), witness: bk, music: 3,
      witnessLine: 'What...? There is god ki in that flame — from a mortal?',
      changeShots: [
        // low in front, the whole of him as the ground lifts
        { at: 0, shot: (t, o) => K.camAt(o, K.ground(b, tr.pos.clone()).addScaledVector(tf, 4.2).addScaledVector(ts, 1.2).add(new V3(0, 0.3, 0)), tr.chest().add(new V3(0, 0.5, 0)), 50) },
        // the face, close, as it breaks — along the way the face points (the press bows the head), the eyes gone white
        { at: 0.62, free: true, shot: (t, o) => {
          const F = SL.data.brolyKit.facePoint(tr);
          K.camAt(o, F.center.clone().addScaledVector(F.fwd, 0.9).addScaledVector(F.up, 0.06).addScaledVector(ts, 0.1), F.center, 34);
        } },
      ],
      onFrame: (n, burstAt) => {
        if (n % 7 === 0) b.vfx.bolt(tr.chest().add(new V3(U.rand(-0.7, 0.7), U.rand(-0.6, 1.2), U.rand(-0.7, 0.7))), 1.6, 0x6ac0ff);
        if (n >= burstAt * 0.62) eyesWhite(tr, true);
      },
    });
    K.toForm(tr, 'rage');
    eyesWhite(tr, true);
    m.flags.trunksRage = tr.form.id === 'rage';
    // and both of them pushed back
    poseAura(tr, 'ft_tfBurst', 'shout', 30, 1);
    if (!b.skipRequested) {
      b.vfx.ring(tr.chest(), 10, 0x9ad8ff, 0.6, tf.clone());
      b.vfx.ring(K.ground(b, tr.pos.clone()).add(new V3(0, 0.3, 0)), 9, GOLD, 0.5, new V3(0, 1, 0));
      b.sfx('explosionBig', tr, { vol: 1 });
      b.cameraTraumaAt(tr.chest(), 0.6);
    }
    K.pose(bk, 'guard', 'shock', 20);
    K.pose(z, 'hitBody', 'shock', 20);
    m.shot((t, o) => {
      const c = tr.chest();
      K.camAt(o, c.clone().addScaledVector(ts, 14).addScaledVector(tf, 4).add(new V3(0, 1, 0)), c.clone().addScaledVector(tf, 5.5), 52); // Trunks and the two of them
    }, 999, { cut: true, blendIn: 0, hold: true });
    yield* blownBack(m, [[bk, K.ground(b, bk.pos.clone().addScaledVector(tf, 6))], [z, K.ground(b, z.pos.clone().addScaledVector(tf, 6))]], 24);
    m.flags.pushedBack = true;
    K.faceTo(bk, tr.pos);
    K.faceTo(z, tr.pos);
    K.pose(bk, 'gb_idle', 'grit', 6);
    K.pose(z, 'zm_idle', 'grit', 6);
    K.pose(tr, 'ft_ready', 'angry', 8);
    yield* st.wait(1);
    m.endShot();
    b.skipRequested = false;
  } };

  /* ---------------------------------------------------------------- HOLD — played */
  P.hold = { id: 'hold', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, bk = S.black, z = S.zamasu, g = S.goku;
    stage(m);
    bench(g, false);
    bench(S.vegeta, false);
    K.toForm(g, 'base');
    K.pose(g, 'lieBack', 'hurt', 6);
    K.pose(S.vegeta, 'knockdownFace', 'hurt', 6);
    K.toForm(tr, 'rage');
    K.toForm(bk, 'rose');
    K.sheathe(tr, false);
    eyesWhite(tr, false); // the white was the awakening; in the fight his own eyes
    m.title(CHAPTER, 'ZERO MORTALS', 'Super Saiyan Rage Trunks vs Black and Zamasu', 2.4);
    // the PDF: he holds the line so the others can get away — a count of the seconds held (the one HUD addition)
    m.objective('hold', 'Hold the line — keep Black and Zamasu off Goku and Vegeta (seconds)', { icon: 'fist', target: TU.hold.seconds });
    m.music('zamasu_theme', 3);
    const sf = fight(m, tr, [bk, z], TU.hold);
    let t = 0;
    const count = () => {
      if (++t % 60 === 0) m.progress('hold', t / 60);
    };
    m.tickHooks.push(count);
    yield* endFight(m, sf, tr, [bk, z], TU.hold.trunksFloor, TU.hold.seconds);
    K.removeHook(m, count);
    if (m.state !== 'running') return;
    const held = tr.hpFrac >= TU.hold.trunksFloor;
    m.flags.hold = held;
    m.qteParts.push(held ? 1 : 0.6);
    m.complete('hold');
  } };

  /* ---------------------------------------------------------------- RETREAT */
  P.retreat = { id: 'retreat', run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, bk = S.black, z = S.zamasu, g = S.goku, v = S.vegeta;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    for (const f of [tr, bk, z]) f.controller = K.scripted();
    bench(g, false);
    bench(v, false);
    K.toForm(tr, 'rage');
    K.toForm(g, 'base');
    const land = S.crater || K.ground(b, g.pos.clone());
    K.place(g, land, 0);
    K.pose(g, 'lieBack', 'hurt', 6);
    const d = (() => {
      const x = flat(bk.pos.clone().sub(land));
      return x.lengthSq() > 0.5 ? x : new V3(0, 0, 1);
    })();
    const side = sideOf(d);
    K.place(tr, K.ground(b, land.clone().addScaledVector(d, 2.2)), 0);
    K.place(bk, K.ground(b, land.clone().addScaledVector(d, 9).addScaledVector(side, -1.6)), 0);
    K.place(z, K.ground(b, land.clone().addScaledVector(d, 9).addScaledVector(side, 1.6)), 0);
    K.faceTo(tr, bk.pos);
    K.faceTo(bk, tr.pos);
    K.faceTo(z, tr.pos);
    K.pose(tr, 'ft_ready', 'angry', 6);
    K.pose(bk, 'gb_idle', 'smirk', 5);
    K.pose(z, 'zm_idle', 'calm', 5);
    // Vegeta on his feet beside Goku
    K.place(v, K.ground(b, land.clone().addScaledVector(side, 1.4).addScaledVector(d, -0.4)), 0);
    K.faceTo(v, tr.pos);
    K.pose(v, 'idle', 'grit', 6);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'three' }, 999);
    m.say('future_trunks', 'Father! Take Goku back to the past — find a way to beat them. I\'ll hold them here!', 3.4, { style: 'shout' });
    yield* st.wait(3.4);
    shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999);
    m.say('vegeta', '...Tch. Don\'t you dare die before we get back.', 2.6);
    yield* st.wait(2.6);
    // the Time Machine by the crater; the flash; gone
    const tm = K.ground(b, land.clone().addScaledVector(d, -3.5).addScaledVector(side, 1.5));
    S.machine = K.timeMachine(b, tm);
    m.onDispose(() => K.propGone(b, S.machine));
    K.pose(v, 'grab', 'grit', 8);
    m.shot((t, o) => K.camAt(o, tm.clone().addScaledVector(side, 8).addScaledVector(d, 4).add(new V3(0, 1.6, 0)), land.clone().addScaledVector(d, -1.5).add(new V3(0, 0.8, 0)), 52), 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.2);
    SL.ScreenFX.flash(0.4, '#e8f4ff');
    b.sfx('timeWarp', v, { vol: 1.1 });
    g.setHidden(true);
    v.setHidden(true);
    K.propGone(b, S.machine);
    m.flags.retreat = g.hidden && v.hidden;
    yield* st.wait(0.8);
    // Trunks alone, the sword up, the two gods before him (low, from behind him)
    m.shot((t, o) => K.camAt(o, K.ground(b, tr.pos.clone()).addScaledVector(d, -3.4).addScaledVector(side, 2.1).add(new V3(0, 0.4, 0)), bk.chest().lerp(z.chest(), 0.5), 50), 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku_black', 'Alone, Trunks? Then you will be the last one standing in this world — for a little while.', 3.2, { style: 'quiet' });
    yield* st.wait(3.2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'ZERO MORTALS', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.ftZero = { TU };
  SL.data.missions.ft_zero = {
    id: 'ft_zero', canon: true, chapter: CHAPTER, title: 'Zero Mortals', character: 'goku', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · the truth about the body', parTime: 420, qteLabel: 'Rage, and the line held',
    blurb: 'Back in the ruined future, Black tells Goku what he did with his body. Goku\'s rage — until the Divine Lasso; then Trunks stands alone between the two gods and the fallen.',
    lockForms: {
      goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
      future_trunks: SL.data.characters.future_trunks.forms.filter((x) => !['base', 'ssj', 'rage'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: the truth about Black\'s body; Trunks\' Super Saiyan Rage awakens'],
    setup,
    phases: [P.confession, P.rage, P.lasso, P.trunks, P.hold, P.retreat],
  };
})();
