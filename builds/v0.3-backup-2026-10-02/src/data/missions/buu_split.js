/*
 * CHAPTER 11 — BUU SAGA: THE EVIL IN HIM
 * Mission "The Evil in Him" (canon; played as Mr. Satan, then as Majin Buu). While the boys learn
 * to fuse, the World Champion walks out to the monster's house with a present and a plan — and
 * comes away with a friend. Then two men with rifles come to shoot the monster, and what was
 * left of the old Buu comes out of him.
 *
 *   HOUSE    (scene)      Buu's round house in the wastes; the champion behind a rock with a
 *                         present that is also a bomb
 *   GIFTS    (checkpoint) as Mr. Satan: hand it over (it goes off in Buu's face; he wants
 *                         another), then "the champion's secret technique" — punch the monster;
 *                         he giggles at every hit and calls it a massage
 *   FRIENDS  (scene)      supper outside the house; "no more killing" and a promise; an
 *                         injured puppy, and Buu's hands healing him: Bee
 *   HUNTERS  (checkpoint) two hunters on the ridge shoot Buu (it closes) and Bee (Buu heals him);
 *                         as Mr. Satan, angry for somebody else for once: put both down
 *   SHOT     (scene)      the champion turns his back; the second rifle; Buu heals him — and
 *                         something in Buu will not calm down
 *   RAGE     (scene)      the steam: out of the holes in his head, up in a column, gathering into
 *                         a body beside him — tall, grey, thin, grinning. Evil Buu.
 *   SPLIT    (checkpoint) as Good Buu against Evil Buu: hold him as long as you can; then the Candy
 *                         Beam — and he swats it straight back
 *   ABSORB   (scene)      a bar of chocolate on the ground; he eats it; what stands up afterwards is
 *                         Super Buu
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // the knobs (tests read them)
  const SPLIT = {
    massageHits: 6, // the champion's secret technique: this many hits before Buu calls it a massage
    hunterDownAt: 0.15, // a hunter at this much health is down (they never die in this game)
    fightSeconds: 40, // Good Buu holds Evil Buu this long...
    fightHpEnd: 0.3, // ...or until he is down to this much
    evilFloor: 0.5, // Evil Buu is not beaten in this fight
    evilDealt: 2,
    evilTaken: 0.4,
  };
  const HOUSE = new V3(0, 0, -17);
  const ROCK = new V3(-5, 0, 5);
  const SEAT = new V3(3, 0, -8);
  const RIDGE = [new V3(15, 0, 14), new V3(18, 0, 9)];
  const GIFT = { id: 'gift', shape: 'box', joint: 'handR', pos: [0.04, -0.1, 0.1], size: [0.24, 0.18, 0.24], color: 0xd83a4a, ribbon: 0xf2d24a };
  const CHOCOLATE = { id: 'chocolate', shape: 'box', joint: 'handR', pos: [0, -0.08, 0.04], rot: [0, 0, Math.PI / 2], size: [0.1, 0.03, 0.2], color: 0x6a3a22, groove: 0x3a1c10, squares: 4 };

  /* ------------------------------------------------ the set: Buu's house and a rock to hide behind */
  function buildSet(b) {
    const T = SL.Toon;
    const geos = [], mats = [];
    const mat = (c) => {
      const m = T.makeMat(c, {});
      mats.push(m);
      return m;
    };
    const mesh = (geo, m, parent) => {
      geos.push(geo);
      const o = new THREE.Mesh(geo, m);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    const PINK = 0xf2a2c4, CREAM = 0xf6ecd8, DARK = 0x6a2a4a;
    // the house: a round pink dome shaped like its owner's head — antenna on top, round
    // windows, a cream band, a round door, and two little vents for his steam
    const house = new THREE.Group();
    const R = 4.4;
    const dome = mesh(new THREE.SphereGeometry(R, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.56), mat(PINK), house);
    dome.scale.y = 0.86;
    dome.position.y = 0.6;
    T.addOutline(dome, 2);
    const band = mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, 0.9, 32, 1, true), mat(CREAM), house);
    band.position.y = 0.6;
    band.material.side = THREE.DoubleSide;
    const door = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.3, 20), mat(DARK), house);
    door.rotation.x = Math.PI / 2;
    door.position.set(0, 1.3, R * 0.98);
    for (const sx of [1, -1]) {
      const w = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 18), mat(0x8ac8e8), house);
      w.rotation.set(Math.PI / 2, 0, 0);
      w.position.set(sx * 2.4, 2.6, R * 0.76);
      w.lookAt(new V3(sx * 2.4 * 3, 2.6 * 1.4, R * 3));
      w.rotateX(Math.PI / 2);
      const vent = mesh(new THREE.SphereGeometry(0.28, 12, 8), mat(DARK), house);
      vent.position.set(sx * 2.8, 3.4, -1.2);
    }
    // the antenna, curling back over the roof
    const curve = new THREE.CatmullRomCurve3([new V3(0, R * 0.84, 0.6), new V3(0, R * 0.84 + 1.6, 0), new V3(0, R * 0.84 + 2.2, -1.4), new V3(0, R * 0.84 + 1.5, -2.4)]);
    const ant = mesh(new THREE.TubeGeometry(curve, 20, 0.34, 10, false), mat(PINK), house);
    T.addOutline(ant, 1.5);
    const tip = mesh(new THREE.SphereGeometry(0.36, 12, 8), mat(PINK), house);
    tip.position.copy(curve.getPoint(1));
    house.position.copy(K.ground(b, HOUSE, -0.3));
    b.scene.add(house);
    // the rock the champion hides behind
    const rock = mesh(new THREE.DodecahedronGeometry(1.3, 0), mat(0x8a5a36), b.scene);
    rock.scale.set(1.3, 0.95, 0.9);
    rock.position.copy(K.ground(b, ROCK, 0.5));
    rock.rotation.y = 0.5;
    T.addOutline(rock, 1.5);
    const hp = K.ground(b, HOUSE);
    const obs = [
      { shape: 'cyl', x: HOUSE.x, z: HOUSE.z, y: hp.y, r: R, h: 5, top: hp.y + 5, hp: 1e9, maxHp: 1e9, alive: true, group: null, segs: [], color: PINK },
      { shape: 'cyl', x: ROCK.x, z: ROCK.z, y: rock.position.y - 0.5, r: 1.35, h: 1.4, top: rock.position.y + 0.9, hp: 1e9, maxHp: 1e9, alive: true, group: null, segs: [], color: 0x8a5a36 },
    ];
    for (const o of obs) b.stage.obstacles.push(o);
    return {
      house,
      rock,
      dispose() {
        b.scene.remove(house);
        b.scene.remove(rock);
        for (const g of geos) g.dispose();
        for (const m of mats) m.dispose();
      },
    };
  }

  /* ------------------------------------------------ effects the scenes share */
  const FX = (SL.data.buuSplitFX = {
    /** The two holes in a Majin's head, in the world (steam comes out of them). */
    holes(f) {
      const head = f.model.joints.head;
      f.model.root.updateMatrixWorld(true);
      const c = head.getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
      const q = head.getWorldQuaternion(new THREE.Quaternion());
      const s = f.model.root.scale.x;
      return [new V3(0.1, 0.1, -0.07), new V3(-0.1, 0.1, -0.07)].map((o) => c.clone().add(o.multiplyScalar(s / 0.55).applyQuaternion(q)));
    },
    /** Steam out of his head: k 0..1 is how hard (call every tick). */
    steam(b, f, k, color = 0xe8d4de) {
      if (!f.model || !f.model.joints.head) return;
      const n = Math.random() < k * 1.6 ? 1 + Math.floor(k * 3) : 0;
      if (!n) return;
      const col = new THREE.Color(color);
      for (const h of FX.holes(f)) {
        for (let i = 0; i < n; i++) {
          const up = 1.5 + k * 7;
          b.vfx.smoke.emit(h.x, h.y, h.z, U.rand(-0.6, 0.6) * (1 + k), up * U.rand(0.7, 1.1), U.rand(-0.6, 0.6) * (1 + k), col.r, col.g, col.b, 0.35 + k * 0.35, 0.12 + k * 0.35, U.rand(0.6, 1.2) + k, { grow: 1.8 + k, drag: 1.2 });
        }
      }
    },
    /** A beam passing from one point to another: the head of it at k 0..1, with a tail. */
    beam(b, from, to, k, color = 0xff6ac4) {
      if (k >= 1) return; // arrived: an additive trail left piling up on one point turns into a white blob
      for (let i = 0; i < 4; i++) {
        const kk = U.clamp01(k - i * 0.035);
        b.vfx.trail(from.clone().lerp(to, kk), i ? color : 0xffd0ec, 0.24 - i * 0.04, 0.18);
      }
    },
    /** Healing: warm light gathering in his hands, over somebody. */
    heal(b, at, k) {
      if (b.frame % 2) return;
      b.vfx.streamInward(at, 1.1, 0xfff0b0, 2, 0.1, 0.4);
      if (b.frame % 10 === 0) b.vfx.flash(at, 1.2 + k, 0xffe6a0, 0.2, SL.Toon.tex.glow);
    },
    /** A body's size in each axis (1 = its own): a Majin squeezing steam out, a chocolate shrinking. */
    size(f, x, y = x, z = x) {
      const s = f.model.baseScale * (f.model._lookScale || 1);
      f.model.root.scale.set(s * x, s * y, s * z);
    },
    /**
     * The bar of chocolate lying where Good Buu stood (pos), or gone (null). One per battle; the
     * mission owns it. Returns the mesh (or null).
     */
    bar(m, pos) {
      const b = m.battle, S = b.story;
      if (!pos) {
        if (S.bar) S.bar.visible = false;
        return null;
      }
      if (!S.bar) {
        const geo = new THREE.BoxGeometry(0.22, 0.06, 0.42);
        const mesh = new THREE.Mesh(geo, SL.Toon.makeMat(0x6a3a22, {}));
        SL.Toon.addOutline(mesh, 1.2);
        mesh.castShadow = true;
        b.scene.add(mesh);
        S.bar = mesh;
        m.onDispose(() => {
          b.scene.remove(mesh);
          geo.dispose();
          mesh.material.dispose();
        });
      }
      const p = K.ground(b, pos, 0.04);
      if (!S.bar.visible || S.bar.position.distanceTo(p) > 1) S.bar.position.copy(p);
      S.bar.rotation.y = 0.6;
      S.bar.visible = true;
      return S.bar;
    },
    /** A rifle going off: the flash at the muzzle, the tracer, the crack. */
    shot(b, gun, target, color = 0xfff0b0) {
      const from = gun.chest().addScaledVector(gun.forward, 0.6);
      b.vfx.flash(from, 0.8, 0xffe0a0, 0.08, SL.Toon.tex.glow);
      b.vfx.sparks(from, 0xffe0a0, 6, 6, 0.06);
      for (let i = 1; i <= 8; i++) b.vfx.trail(from.clone().lerp(target, i / 8), color, 0.08, 0.12);
      b.sfx('gunshot', gun, { vol: 1 });
    },
  });

  /* ------------------------------------------------ setup */
  function setup(battle) {
    const b = battle;
    const at = (v) => K.ground(b, v);
    const set = buildSet(b);
    const satan = b.spawn({ charId: 'mr_satan', player: true, team: 0, pos: at(new V3(-5, 0, 7.6)), noFlight: true, startKi: 30 });
    const buu = b.spawn({ charId: 'majin_buu', team: 1, pos: at(SEAT), startKi: 160, tags: { priority: true } });
    const g1 = b.spawn({ charId: 'gunman', team: 1, pos: at(RIDGE[0]), noFlight: true });
    const g2 = b.spawn({ charId: 'gunman_b', team: 1, pos: at(RIDGE[1]), noFlight: true });
    const evil = b.spawn({ charId: 'evil_buu', team: 1, pos: at(new V3(6, 0, -6)), startKi: 150, tags: { boss: true } });
    const sup = b.spawn({ charId: 'super_buu', team: 1, pos: at(new V3(8, 0, -6)), startKi: 200, tags: { boss: true } });
    const bee = new SL.Creature(b, SL.data.creatures.bee, { pos: at(new V3(-8, 0, -10)), yaw: 1.2 });
    satan.cannotDie = true;
    buu.cannotDie = true;
    buu.mech.maxReforms = Infinity;
    for (const f of [buu, g1, g2, evil, sup]) f.controller = K.scripted();
    for (const f of [g1, g2, evil, sup]) {
      K.watcher(f, 'idle', 'calm');
      f.setHidden(true);
    }
    g1.cannotDie = g2.cannotDie = evil.cannotDie = sup.cannotDie = true;
    bee.object.visible = false;
    b.story = { satan, buu, g1, g2, evil, sup, bee, set, owned: false };
  }

  /** Every phase: the mission owns the set (a checkpoint start skips the opening). */
  function own(m) {
    const S = m.battle.story;
    if (S.owned) return;
    S.owned = true;
    m.onDispose(S.set.dispose);
  }

  function hideBee(S) {
    S.bee.object.visible = false;
    S.bee.setState('stay', {});
  }

  function showBee(b, S, pos, state, data) {
    S.bee.object.visible = true;
    if (pos) {
      S.bee.pos.copy(K.ground(b, pos));
      S.bee.prevPos.copy(S.bee.pos);
    }
    S.bee.setState(state || 'stay', data || {});
  }

  /** A fighter present in the story but out of every fight. */
  function offstage(f) {
    K.watcher(f, 'idle', 'calm');
    f.setHidden(true);
  }

  /** The world as it is after the friendship: the house, a promise, a dog. */
  function friendsState(b) {
    const S = b.story;
    showBee(b, S, S.buu.pos.clone().add(new V3(1.2, 0, 0.4)), 'follow', { follow: S.buu });
    b.stage.clearMood(0.1);
  }

  const P = {};

  P.house = {
    id: 'house',
    run: function* (m) {
      const b = m.battle, S = b.story;
      own(m);
      m.lock(true);
      S.buu.setState('scripted', { pose: 'bu_sit', expression: 'grin' });
      K.faceTo(S.buu, S.satan.pos);
      K.faceTo(S.satan, S.buu.pos);
      S.satan.model.addProp(GIFT);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'split_house');
    },
  };

  /** The present, and then the champion's secret technique. */
  P.gifts = {
    id: 'gifts',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, s = S.satan, buu = S.buu;
      own(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      hideBee(S);
      if (b.player !== s) b.switchPlayer(s, { force: true });
      K.place(s, K.ground(b, new V3(-3.2, 0, 4.4))); // out from behind his rock
      K.place(buu, K.ground(b, SEAT));
      K.faceTo(buu, s.pos);
      K.faceTo(s, buu.pos);
      buu.team = 1;
      buu.controller = K.scripted();
      buu.untargetable = false;
      buu.intangible = false;
      buu.setState('scripted', { pose: 'bu_sit', expression: 'grin' });
      if (!s.model.props.gift) s.model.addProp(GIFT);
      s.model.setPropVisible('gift', true);
      s.hp = s.hpMax;
      m.music('menu', 1);
      // 1. hand it over
      m.objective('gift', 'Give Buu the present', { icon: 'guard' });
      s.lockedSlots = { special1: true, special2: true, ultimate: true, transform: true };
      m.limits({ light: false, heavy: false, blast: false, guard: false, dodge: false });
      m.lock(false);
      b.aiLocked = true;
      s.target = null;
      s.setState('free');
      yield () => s.distTo(buu) < 2.4 || b.skipRequested;
      m.lock(true);
      K.faceTo(s, buu.pos);
      s.setState('scripted', { pose: 'ms_gift', expression: 'grin' });
      m.limits(null);
      yield* m.cue('light', 'Hand it over', { auto: 6 });
      yield* SL.Cinema.play(m, 'split_gift');
      m.complete('gift');
      // 2. the secret technique: he giggles
      m.objective('massage', 'Show him the champion\'s secret technique', { icon: 'fist', target: SPLIT.massageHits });
      m.objective('dynamite', 'Land the Dynamite Kick', { icon: 'rush', optional: true });
      s.lockedSlots = { special2: true, ultimate: true, transform: true };
      buu.damageTakenMul = 0.02;
      buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      let hits = 0, kick = false, laugh = 0;
      const off = b.on('damage', (e) => {
        if (e.attacker !== s || e.target !== buu) return;
        hits++;
        laugh = 50;
        if (s.state === 'rush') kick = true;
        m.progress('massage', Math.min(SPLIT.massageHits, hits));
      });
      const hook = () => {
        buu.hp = buu.hpMax;
        if (buu.mech.apart) return;
        // every blow is a tickle: he giggles, then waits for the next one
        if (laugh > 0 && --laugh === 0) buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
        else if (laugh > 0 && buu.state !== 'scripted') buu.setState('scripted', { pose: 'bu_laugh', expression: 'grin' });
        else if (buu.state === 'free') buu.setState('scripted', { pose: laugh > 0 ? 'bu_laugh' : 'bu_idle', expression: 'grin' });
      };
      m.tickHooks.push(hook);
      m.prompt('dynamite', 's1', 'Dynamite Kick', { when: () => hits >= 2 && !kick, until: () => kick });
      s.target = buu;
      s.setState('free');
      m.lock(false);
      b.aiLocked = true;
      yield () => hits >= SPLIT.massageHits || b.skipRequested;
      K.unhook(m, hook);
      off();
      m.complete('massage');
      if (kick) m.complete('dynamite');
      else m.failObjective('dynamite');
      m.flags.massageHits = hits;
      m.flags.dynamiteKick = kick;
      m.qteParts.push(kick ? 1 : 0.6);
      m.lock(true);
      K.clearCombat(b);
      buu.damageTakenMul = 1;
      s.lockedSlots = {};
      if (buu.mech.apart) yield () => !buu.mech.apart;
      yield* SL.Cinema.play(m, 'split_massage');
    },
  };

  /** Supper, a promise, and a puppy. */
  P.friends = {
    id: 'friends',
    run: function* (m) {
      const b = m.battle, S = b.story;
      own(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const seat = K.ground(b, SEAT);
      K.place(S.buu, seat);
      K.place(S.satan, K.ground(b, SEAT.clone().add(new V3(-2.2, 0, 1))));
      K.faceTo(S.buu, S.satan.pos);
      K.faceTo(S.satan, S.buu.pos);
      showBee(b, S, new V3(-6, 0, -9), 'hurt');
      S.bee.yaw = 0.8;
      yield* SL.Cinema.play(m, 'split_friends');
    },
  };

  /** Two rifles on the ridge; the champion, angry for somebody else. */
  P.hunters = {
    id: 'hunters',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, s = S.satan, buu = S.buu;
      own(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (b.player !== s) b.switchPlayer(s, { force: true });
      K.place(buu, K.ground(b, new V3(1, 0, -4)));
      K.place(s, K.ground(b, new V3(-1.2, 0, -2.6)));
      friendsState(b);
      buu.team = 0;
      K.watcher(buu, 'bu_idle', 'grin');
      buu.setHidden(false);
      const ridge = [S.g1, S.g2];
      ridge.forEach((g, i) => {
        g.setHidden(false);
        K.place(g, K.ground(b, RIDGE[i]));
        K.faceTo(g, buu.pos);
        g.setState('scripted', { pose: 'gm_idle', expression: 'angry' });
        g.hp = g.hpMax;
        g.huntDown = false;
      });
      K.faceTo(s, S.g1.pos);
      K.faceTo(buu, S.g1.pos);
      yield* SL.Cinema.play(m, 'split_hunters');
      // the fight: Buu holds the dog and watches the champion work
      buu.setState('scripted', { pose: 'bu_cradle', expression: 'sad' });
      S.bee.setState('held', { by: buu });
      s.hp = Math.max(s.hp, s.hpMax * 0.9);
      s.lockedSlots = { special2: true, ultimate: true, transform: true };
      m.music('battle', 3);
      m.objective('hunters', 'Put both hunters down', { icon: 'fist', target: 2 });
      m.objective('dynamite2', 'Put one down with the Dynamite Kick', { icon: 'rush', optional: true });
      let down = 0, kicked = false;
      const hook = () => {
        for (const g of ridge) {
          if (g.huntDown) continue;
          if (g.hp > g.hpMax * SPLIT.hunterDownAt) continue;
          g.huntDown = true;
          if (s.state === 'rush') kicked = true;
          g.controller = K.scripted();
          g.untargetable = true;
          g.intangible = true;
          g.setState('scripted', { pose: 'knockdown', expression: 'ko' });
          m.progress('hunters', ++down);
          b.emit('hunterDown', { fighter: g });
          if (s.target === g) s.target = ridge.find((x) => x !== g && !x.untargetable) || null;
        }
      };
      m.tickHooks.push(hook);
      for (const g of ridge) {
        g.untargetable = false;
        g.intangible = false;
        g.target = s;
        g.controller = new SL.AIController(b, { difficulty: 'normal' });
        g.setState('free');
      }
      s.target = S.g1;
      s.setState('free');
      m.lock(false);
      b.aiLocked = false;
      yield () => down >= 2 || b.skipRequested;
      K.unhook(m, hook);
      m.complete('hunters');
      if (kicked) m.complete('dynamite2');
      else m.failObjective('dynamite2');
      m.flags.huntersDown = down;
      m.qteParts.push(kicked ? 1 : 0.7);
      m.lock(true);
      K.clearCombat(b);
      s.lockedSlots = {};
      for (const g of ridge) {
        g.controller = K.scripted();
        g.untargetable = true;
        g.intangible = true;
        g.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      }
      yield* SL.Cinema.play(m, 'split_shot');
      yield* SL.Cinema.play(m, 'split_rage');
    },
  };

  /** Good Buu against the evil that came out of him. */
  P.split = {
    id: 'split',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, buu = S.buu, evil = S.evil, s = S.satan;
      own(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // Good Buu is played from here (the switch first: it hands the old player a brain)
      if (b.player !== buu) b.switchPlayer(buu, { force: true });
      // the aftermath of the rage: the champion down, the dog beside him, the hunters gone
      K.watcher(s, 'knockdown', 'ko');
      K.place(s, K.ground(b, new V3(-2, 0, -1)));
      offstage(S.g1);
      offstage(S.g2);
      showBee(b, S, s.pos.clone().add(new V3(0.8, 0, 0.6)), 'stay');
      K.faceTo(S.bee, s.pos);
      offstage(S.sup);
      FX.size(buu, 1);
      if (buu.model.setStone) buu.model.setStone(false);
      buu.setHidden(false);
      evil.setHidden(false);
      K.place(buu, K.ground(b, new V3(0, 0, 4)));
      K.place(evil, K.ground(b, new V3(0, 0, -4)));
      K.faceTo(buu, evil.pos);
      K.faceTo(evil, buu.pos);
      buu.team = 0;
      evil.team = 1;
      buu.untargetable = buu.intangible = false;
      evil.untargetable = evil.intangible = false;
      buu.hp = buu.hpMax;
      buu.ki = Math.max(buu.ki, 100);
      buu.cannotDie = true;
      // the evil one is a Majin too: what he tears open in the good one does not close
      buu.noRegen = true;
      buu.lockedSlots = { special1: true }; // the Candy Beam is the ending: it waits for the cue
      evil.hp = evil.hpMax;
      evil.damageDealtMul = SPLIT.evilDealt;
      evil.damageTakenMul = SPLIT.evilTaken;
      b.stage.setMood(0.35, 0x2a1030, 0.5);
      m.music('finale', 5);
      m.objective('hold', 'Stand against the evil that came out of you', { icon: 'clock', target: SPLIT.fightSeconds });
      m.objective('hits', 'Land 12 hits on him', { icon: 'fist', optional: true, target: 12 });
      let t = 0, hits = 0;
      const off = b.on('damage', (e) => {
        if (e.attacker === buu && e.target === evil && !e.blocked) m.progress('hits', Math.min(12, ++hits));
      });
      const hook = () => {
        if (evil.hp < evil.hpMax * SPLIT.evilFloor) evil.hp = evil.hpMax * SPLIT.evilFloor;
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('hold', Math.min(SPLIT.fightSeconds, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      buu.target = evil;
      evil.target = buu;
      evil.controller = new SL.AIController(b, { difficulty: 'hard' });
      buu.setState('free');
      evil.setState('free');
      m.lock(false);
      b.aiLocked = false;
      yield () => t >= SPLIT.fightSeconds || buu.hpFrac < SPLIT.fightHpEnd || b.skipRequested;
      K.unhook(m, hook);
      off();
      m.complete('hold');
      if (hits >= 12) m.complete('hits');
      else m.failObjective('hits');
      m.flags.splitSeconds = Math.round(t);
      m.flags.splitHits = hits;
      m.qteParts.push(hits >= 12 ? 1 : 0.5 + hits / 24);
      m.lock(true);
      K.clearCombat(b);
      evil.controller = K.scripted();
      if (buu.mech.apart) yield () => !buu.mech.apart;
      buu.lockedSlots = {};
      buu.noRegen = false;
      yield* SL.Cinema.play(m, 'split_reflect');
    },
  };

  P.absorb = {
    id: 'absorb',
    run: function* (m) {
      const b = m.battle, S = b.story;
      own(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'split_absorb');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'THE EVIL IN HIM', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_split',
    canon: true,
    chapter: 'CHAPTER 11 · BUU SAGA',
    title: 'The Evil in Him',
    subtitle: 'Earth · Age 774 · the house in the wastes',
    character: 'mr_satan',
    stage: 'majin_wastes',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'The World Champion goes to kill Majin Buu with a present, and makes a friend instead. Then two men with rifles come over the ridge.',
    rewards: ['Story: Evil Buu', 'Story: Super Buu'],
    setup,
    phases: [P.house, P.gifts, P.friends, P.hunters, P.split, P.absorb, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.buuSplit = { SPLIT, GIFT, CHOCOLATE, HOUSE, SEAT };
})();
