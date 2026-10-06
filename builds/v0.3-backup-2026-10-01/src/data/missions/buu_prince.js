/*
 * CHAPTER 13 — BUU SAGA: VEGITO
 * Mission "The Prince Returns" (canon; played as Goku). Gohan is gone, and Goku is holding one
 * earring with nobody to give the other to.
 *
 *   ALONE    (scene)       who is left? Dende... and Mr. Satan (Goku pictures "Gokule" and shudders);
 *                          Buuhan, bored of waiting, starts shooting
 *   SURVIVE  (checkpoint)  stay alive against Buuhan — he chases, the pink barrages rain in — until
 *                          a ki flares far away that should not exist; Instant Transmission (a cue)
 *                          one moment before the blast lands where he stood
 *   CANYON   (checkpoint)  a rocky canyon: Vegeta, with his body back and a halo over his head, arms
 *                          folded on a ledge; he turns his back. "I will never fuse with you!"
 *   COVER    (play)        Buuhan on the canyon rim, blowing the valley apart: get behind the boulder
 *   PLEA     (scene)       Goku grabs him by the shoulders: Bulma, Trunks, eaten. Vegeta's face.
 *                          "Give me that damn thing!" (hold out the earring: a cue) — right ear —
 *                          "Why didn't you tell me that part first?!"
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const VK = SL.data.vegitoKit;

  const PR = {
    surviveSeconds: 30,
    senseAt: 22, // the moment the far ki flares
    buuDealt: 0.45,
    barrageEvery: 5, // seconds between Buuhan's rains of blasts
    barrageCount: 8,
    hitsAllowed: 6, // optional objective (big hits only)
    coverSeconds: 14, // after this Goku is thrown behind the boulder anyway
  };
  const HAND_POTARA = { id: 'potaraHand', shape: 'potara', joint: 'handR', pos: [0, -0.1, 0.035], rot: [0, 0, 0], scale: 1.6 };
  // the canyon set
  const LEDGE = new V3(-16, 0, -14); // Vegeta's ledge (off to the side: later missions fight in the middle)
  const BOULDER = new V3(-8, 0, 6);
  const RIM = new V3(14, 0, -26); // where Buuhan lands, high on the canyon wall

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(0, 6), startKi: 100 });
    const bh = b.spawn({ charId: 'buuhan', team: 1, pos: at(0, -10), startKi: 240, tags: { boss: true } });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(0, -30), startKi: 100 });
    const gokule = b.spawn({ charId: 'gokule', team: 0, pos: at(40, 40) });
    for (const f of [vegeta, gokule]) {
      K.watcher(f, 'idle', 'calm');
      f.setHidden(true);
    }
    K.watcher(bh, 'bh_idle', 'wicked');
    bh.mech.maxReforms = Infinity;
    bh.cannotDie = goku.cannotDie = true;
    goku.lockedForms = { ssj3: true, kaioken: true };
    vegeta.lockedForms = { majin: true, ssj2: true };
    b.story = { goku, bh, vegeta, gokule, owned: false };
  }

  function own(m) {
    const S = m.battle.story;
    if (S.owned) return;
    S.owned = true;
    if (!S.goku.model.props.potaraHand) S.goku.model.addProp(HAND_POTARA);
  }

  /** The canyon's own set: Vegeta's ledge and the boulder (owned by the mission). */
  function canyonSet(m) {
    const b = m.battle, S = b.story, T = SL.Toon;
    if (S.canyon) return S.canyon;
    const geos = [], mats = [], objs = [];
    const rock = (w, h, d, col, pos, rotY) => {
      const g = new THREE.DodecahedronGeometry(1, 1);
      const mt = T.makeMat(col, {});
      geos.push(g);
      mats.push(mt);
      const o = new THREE.Mesh(g, mt);
      o.scale.set(w, h, d);
      o.position.copy(pos);
      o.rotation.y = rotY || 0;
      o.castShadow = o.receiveShadow = true;
      T.addOutline(o, 1.4);
      b.scene.add(o);
      objs.push(o);
      return o;
    };
    const lg = K.ground(b, LEDGE);
    rock(3.2, 2.2, 2.6, 0xb06a3a, lg.clone().add(new V3(0, 0.6, 0)), 0.3);
    const bg = K.ground(b, BOULDER);
    rock(2.6, 2.1, 1.8, 0xa05a30, bg.clone().add(new V3(0, 1.2, 0)), 1.1);
    const rim = K.ground(b, RIM);
    rock(5, 7, 4, 0xc8784a, rim.clone().add(new V3(0, 3, 0)), 0.6);
    // the colliders, so nobody walks through them (props push fighters out of their sphere)
    const obs = (p, r, h) => ({ shape: 'cyl', x: p.x, z: p.z, y: p.y, r, h, top: p.y + h, hp: 1e9, maxHp: 1e9, alive: true, group: null, segs: [], color: 0xa05a30 });
    b.stage.obstacles.push(obs(bg, 1.6, 2.6));
    // the set belongs to the canyon: hidden while the story is somewhere else (inside Buu)
    const offStage = b.on('stageChanged', (e) => {
      for (const o of objs) o.visible = e.id === 'rocky_canyon';
    });
    const set = {
      ledgeTop: lg.clone().add(new V3(0, 2.6, 0)),
      boulder: bg,
      rimTop: rim.clone().add(new V3(0, 9.6, 0)),
      dispose() {
        if (offStage) offStage();
        for (const o of objs) b.scene.remove(o);
        for (const g of geos) g.dispose();
        for (const mt of mats) mt.dispose();
      },
    };
    m.onDispose(set.dispose);
    S.canyon = set;
    return set;
  }

  /** Buuhan's rain: pink blasts dropping round a point (real projectiles: they hit what they touch). */
  function barrage(m, around, n, opts = {}) {
    const b = m.battle, S = b.story, bh = S.bh;
    const spec = { kind: 'ball', speed: 70, radius: 0.34, damage: opts.damage || 900, homing: 0, color: 0xff6ab4, core: 0xffffff, explode: 2.2, knock: 'heavy', knockSpeed: 18, impact: 2, life: 2.4 };
    const from = opts.from || bh.chest().add(new V3(0, 1.5, 0));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + b.frame * 0.37;
      const r = (opts.spread || 6) * (0.3 + ((i * 7) % 5) / 5);
      const to = around.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
      b.projectiles.spawnBlast(bh, from, to.sub(from), spec);
    }
    b.sfx('kiBlastBig', bh, { vol: 0.8 });
  }

  const P = {};

  P.alone = {
    id: 'alone',
    run: function* (m) {
      own(m);
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'pr_alone');
    },
  };

  /** Alone against Buuhan: nobody wins this. Stay alive until something changes. */
  P.survive = {
    id: 'survive',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, g = S.goku, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.place(g, K.ground(b, new V3(0, 0, 8)));
      K.place(bh, K.ground(b, new V3(0, 0, -6)));
      K.faceTo(g, bh.pos);
      K.faceTo(bh, g.pos);
      g.hp = g.hpMax;
      m.music('finale', 5);
      m.objective('survive', 'Stay alive — and find anybody who is left', { icon: 'clock', target: PR.surviveSeconds });
      m.objective('hits', 'Take fewer than ' + PR.hitsAllowed + ' hits', { icon: 'guard', optional: true });
      if (b.player !== g) b.switchPlayer(g, { force: true });
      g.target = bh;
      bh.target = g;
      bh.untargetable = bh.intangible = false;
      bh.damageDealtMul = PR.buuDealt;
      bh.damageTakenMul = 0.2;
      bh.controller = new SL.AIController(b, { difficulty: 'hard' });
      g.setState('free');
      bh.setState('free');
      m.lock(false);
      b.aiLocked = false;
      let hits = 0, t = 0, rain = PR.barrageEvery * 0.6, sensed = false;
      const offD = b.on('damage', (e) => {
        if (e.target === g && !e.blocked && e.amount > 1200) hits++;
      });
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('survive', Math.min(PR.surviveSeconds, Math.floor(t)));
        rain -= 1 / 60;
        if (rain <= 0) {
          rain = PR.barrageEvery;
          barrage(m, g.pos.clone(), PR.barrageCount);
          if (b.frame % 2 === 0) m.say('buuhan', U.pick ? U.pick(['Dance, Saiyan!', 'Where are you going?', 'Run! It makes it more fun!']) : 'Dance, Saiyan!', 1.8);
        }
        if (!sensed && t >= PR.senseAt) {
          sensed = true;
          m.say('goku', '...Wait. That ki... way over there. It can\'t be... VEGETA?!', 3.2, { style: 'shout' });
          b.vfx.flash(g.chest(), 1.4, 0xbfe6ff, 0.3, SL.Toon.tex.glow);
        }
      };
      m.tickHooks.push(hook);
      yield () => t >= PR.surviveSeconds || b.skipRequested;
      K.unhook(m, hook);
      offD();
      m.complete('survive');
      if (hits < PR.hitsAllowed) m.complete('hits');
      else m.failObjective('hits');
      m.flags.hitsTaken = hits;
      m.lock(true);
      K.clearCombat(b);
      bh.controller = K.scripted();
      if (bh.mech.apart) yield () => !bh.mech.apart;
      yield* SL.Cinema.play(m, 'pr_escape');
    },
  };

  /** The canyon: a dead man with his body back, and the worst possible news. */
  P.canyon = {
    id: 'canyon',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      b.changeStage('rocky_canyon');
      m.endShot();
      const set = canyonSet(m);
      S.bh.setHidden(true);
      S.bh.untargetable = S.bh.intangible = true;
      K.watcher(S.bh, 'bh_idle', 'wicked');
      v.setHidden(false);
      if (!S.vegetaHalo) S.vegetaHalo = SL.Cinema.halo(b, v);
      v.setPosition(set.ledgeTop.clone());
      v.grounded = true;
      K.place(g, K.ground(b, LEDGE.clone().add(new V3(5, 0, 6))));
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      if (b.player !== g) b.switchPlayer(g, { force: true });
      yield* SL.Cinema.play(m, 'pr_canyon');

      // COVER: Buuhan on the rim, and the valley coming apart
      const bh = S.bh;
      bh.setHidden(false);
      bh.setPosition(set.rimTop.clone());
      bh.grounded = true;
      K.faceTo(bh, g.pos);
      bh.setState('scripted', { pose: 'bh_blast', expression: 'wicked' });
      m.objective('cover', 'Get behind the boulder!', { icon: 'guard' });
      m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, transform: false, charge: false, up: false, upPressed: false });
      g.target = null;
      g.lockMode = 'free';
      g.setState('free');
      g.untargetable = true;
      g.intangible = true;
      v.setState('scripted', { pose: 'run', expression: 'angry' });
      v.grounded = true;
      const vFrom = v.pos.clone(), vTo = K.ground(b, set.boulder.clone().add(new V3(1.4, 0, 2.6)));
      m.lock(false);
      b.aiLocked = true;
      let t = 0, rain = 0.3;
      const hook = () => {
        t += 1 / 60;
        const k = Math.min(1, t / 2.6);
        v.setPosition(vFrom.clone().lerp(vTo, k));
        v.prevPos.copy(v.pos);
        K.faceTo(v, vTo.clone().add(new V3(0, 0, 1)));
        if (k >= 1) v.setState('scripted', { pose: 'crouchCover', expression: 'angry' });
        rain -= 1 / 60;
        if (rain <= 0) {
          rain = 1.1;
          barrage(m, g.pos.clone(), 5, { from: bh.chest().add(new V3(0, 1, 0)), spread: 7, damage: 1 });
        }
      };
      m.tickHooks.push(hook);
      const target = K.ground(b, set.boulder.clone().add(new V3(-0.6, 0, 2.4)));
      m.prompt('cover_go', 'move', 'Run!', { required: true, until: () => g.pos.distanceTo(target) < 2.4 });
      yield () => Math.hypot(g.pos.x - target.x, g.pos.z - target.z) < 2.4 || t > PR.coverSeconds || b.skipRequested;
      K.unhook(m, hook);
      m.complete('cover');
      m.limits(null);
      m.lock(true);
      K.clearCombat(b);
      g.untargetable = g.intangible = false;
      K.place(g, target);
      K.place(v, vTo);
      yield* SL.Cinema.play(m, 'pr_plea');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'THE PRINCE RETURNS', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_prince',
    canon: true,
    chapter: 'CHAPTER 13 · BUU SAGA',
    title: 'The Prince Returns',
    subtitle: 'Earth · Age 774 · one earring, one chance',
    character: 'goku',
    stage: 'majin_wastes',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'Everybody Goku could fuse with has been eaten. Then, out in a canyon, a ki flares that belongs to a dead man.',
    rewards: ['Story: Vegeta returns'],
    setup,
    phases: [P.alone, P.survive, P.canyon, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.princeMission = { PR, LEDGE, BOULDER, RIM, HAND_POTARA, canyonSet, barrage };
})();
