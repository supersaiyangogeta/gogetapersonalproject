/*
 * CHAPTER 11 — BUU SAGA: THE ROOM OF SPIRIT AND TIME
 * Mission "The Room of Spirit and Time" (canon; played as Gotenks). Super Buu comes to Kami's
 * Lookout for the fighters he was promised; Piccolo asks for an hour; Buu gets bored — and every
 * human on Earth pays for it. Then Piccolo takes him to the one room where an hour is a day.
 *
 *   ARRIVAL   (scene)      Super Buu comes down out of the sky onto the Lookout; "an hour"
 *   EXTINCTION (scene)     bored: one hand to the sky, and thousands of pink beams go over the
 *                          horizon in every direction; Satan City, a street of people, and then
 *                          an empty street; back on the Lookout, "all gone" (a world-state flag)
 *   ENTER     (scene)      the palace door; the Room of Spirit and Time: white, endless, silent;
 *                          the building at the door, the great hourglass; Gotenks waiting
 *   BASE      (checkpoint) Gotenks (Super Saiyan) against Super Buu: outclassed; hold him; then
 *                          the secret — Super Saiyan 3, pushed through by holding Charge
 *   THIRD     (checkpoint) Super Saiyan 3 Gotenks against Super Buu: blow him apart three times
 *                          while he regenerates, counters and loses his temper; the Ghosts
 *   DOOR      (scene)      Piccolo destroys the only way out: "Nobody leaves"
 *   SCREAM    (scene)      Super Buu screams until the dimension tears; a hole in the air; he goes
 *                          through it; Gotenks and Piccolo follow
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // the knobs (tests read them)
  const TC = {
    baseSeconds: 30, // Super Saiyan Gotenks holds out this long...
    baseHpEnd: 0.4, // ...or until he is down to this much
    buuBaseDealt: 0.6, // Super Buu against Super Saiyan Gotenks
    buuBaseTaken: 0.35,
    ascendSeconds: 5.5,
    aparts: 2, // Super Saiyan 3: blow him apart this many times
    thirdDealt: 1.6, // Gotenks' damage as Super Saiyan 3
    buuThirdDealt: 0.24,
    buuThirdTaken: 1.8,
    thirdTaken: 0.5, // Super Saiyan 3 Gotenks shrugs off half of what lands
    reformTo: 0.4, // Super Buu grows back to this much each time
    extinctionBeams: 260,
  };
  const DOOR = new V3(0, 0, -26); // the chamber's entrance building (the only way out)
  const LOOKOUT_DOOR = new V3(0, 0, -20); // the palace doorway on the Lookout

  /* ------------------------------------------------ effects the scenes share */
  const FX = (SL.data.buuChamberFX = {
    /**
     * THE HUMAN EXTINCTION ATTACK: beams that leave a point above his hand, climb, and arc away
     * over the horizon in every direction. Call every tick with the scene's seconds; the beams are
     * launched over `launch` seconds. Distant impacts flash on the cloud line.
     */
    extinction(b, st, from, t, launch = 3) {
      st.beams = st.beams || [];
      const want = Math.min(TC.extinctionBeams, Math.floor((t / launch) * TC.extinctionBeams));
      while (st.beams.length < want) {
        const a = Math.random() * Math.PI * 2;
        st.beams.push({ a, up: 22 + Math.random() * 30, far: 160 + Math.random() * 160, t0: t, dur: 1.4 + Math.random() * 1.2, hit: false });
      }
      const pink = 0xff6ac4;
      for (const bm of st.beams) {
        const k = (t - bm.t0) / bm.dur;
        if (k < 0 || k > 1.05) continue;
        const kk = Math.min(1, k);
        // up, over, and down past the horizon
        const p = new V3(from.x + Math.cos(bm.a) * bm.far * kk, from.y + bm.up * Math.sin(kk * Math.PI) - kk * kk * 60, from.z + Math.sin(bm.a) * bm.far * kk);
        if (b.frame % 2 === 0) b.vfx.trail(p, pink, 0.9 + kk * 2.5, 0.35);
        if (k >= 1 && !bm.hit) {
          bm.hit = true;
          b.vfx.flash(p, 14, pink, 0.45, SL.Toon.tex.glow);
        }
      }
    },
    /**
     * The hole Super Buu screams into the world: a black disc with violet rims turning round it,
     * a glow, and lightning at its edge. setSize(k) 0..1, update(dt) spins it; the mission owns it.
     */
    portal(m, pos, R = 3.6) {
      const b = m.battle;
      const g = new THREE.Group();
      const geos = [], mats = [];
      const add = (geo, mat) => {
        geos.push(geo);
        mats.push(mat);
        const o = new THREE.Mesh(geo, mat);
        g.add(o);
        return o;
      };
      const disc = add(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ color: 0x06020c, side: THREE.DoubleSide }));
      const rims = [];
      for (let i = 0; i < 3; i++) {
        const r = add(new THREE.TorusGeometry(R * (1.02 + i * 0.07), R * (0.05 - i * 0.012), 8, 64), new THREE.MeshBasicMaterial({ color: [0xff4ad0, 0x9a4aff, 0xffffff][i], transparent: true, opacity: 0.9 - i * 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
        r.scale.set(1, 1 - i * 0.04, 1);
        rims.push(r);
      }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xc060ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
      mats.push(glow.material);
      glow.scale.setScalar(R * 4.4);
      g.add(glow);
      g.position.copy(pos);
      g.scale.setScalar(0.001);
      b.scene.add(g);
      let t = 0;
      const P = {
        group: g,
        size: 0,
        setSize(k) {
          P.size = k;
          g.scale.setScalar(Math.max(0.001, k));
          g.visible = k > 0.002;
        },
        face(point) {
          g.lookAt(point);
        },
        update(dt) {
          t += dt;
          rims.forEach((r, i) => (r.rotation.z = t * (1.6 + i * 0.9) * (i % 2 ? -1 : 1)));
          glow.material.opacity = 0.6 + Math.sin(t * 9) * 0.2;
          if (P.size > 0.2 && b.frame % 5 === 0) {
            const a = Math.random() * Math.PI * 2;
            const edge = new V3(Math.cos(a) * R * P.size, Math.sin(a) * R * P.size, 0).applyQuaternion(g.quaternion).add(g.position);
            b.vfx.bolt(edge, 2 + Math.random() * 2, Math.random() < 0.5 ? 0xff4ad0 : 0xc0a0ff);
          }
        },
        dispose() {
          b.scene.remove(g);
          for (const x of geos) x.dispose();
          for (const x of mats) x.dispose();
        },
      };
      m.onDispose(P.dispose);
      return P;
    },
  });

  /* ------------------------------------------------ setup */
  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const sup = b.spawn({ charId: 'super_buu', team: 1, pos: at(0, 4), startKi: 200, tags: { boss: true, priority: true } });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(-3, 10) });
    const gotenks = b.spawn({ charId: 'gotenks', player: true, team: 0, pos: at(0, 16), startKi: 100 });
    gotenks.setHidden(true);
    K.watcher(gotenks, 'gk_idle', 'grin');
    K.watcher(piccolo, 'armsCrossed', 'calm');
    sup.controller = K.scripted();
    sup.mech.maxReforms = Infinity;
    sup.cannotDie = true;
    gotenks.cannotDie = true;
    // Super Saiyan 3 is what this mission is for: nobody has it until the ascension
    gotenks.lockedForms = { ssj3: true };
    b.story = { sup, piccolo, gotenks, civilians: [], owned: false };
  }

  /** Into the Room of Spirit and Time (from the Lookout, or straight in at a checkpoint). */
  function toChamber(b) {
    if (b.stage.def.id !== 'timechamber') b.changeStage('timechamber');
    SL.data.buuChamberFX.chamberState(b);
  }
  FX.chamberState = (b) => {
    const S = b.story;
    for (const c of S.civilians) if (b.fighters.includes(c)) b.remove(c);
    S.civilians = [];
    S.gotenks.setHidden(false);
    S.sup.setHidden(false);
    S.piccolo.setHidden(false);
    K.place(S.piccolo, K.ground(b, DOOR.clone().add(new V3(4, 0, 13))));
    K.faceTo(S.piccolo, new V3(0, 0, 0));
    b.stage.clearMood(0.1);
  };

  function faceUp(b) {
    const S = b.story;
    K.faceTo(S.gotenks, S.sup.pos);
    K.faceTo(S.sup, S.gotenks.pos);
  }

  function fight(m, dealt, taken, difficulty = 'hard') {
    const b = m.battle, S = b.story, g = S.gotenks, sup = S.sup;
    if (b.player !== g) b.switchPlayer(g, { force: true });
    K.watcher(S.piccolo, 'armsCrossed', 'grit');
    g.untargetable = g.intangible = false;
    sup.untargetable = sup.intangible = false;
    g.target = sup;
    sup.target = g;
    sup.damageDealtMul = dealt;
    sup.damageTakenMul = taken;
    sup.controller = new SL.AIController(b, { difficulty });
    g.setState('free');
    sup.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  /** Super Buu loses his temper out loud as the fight goes against him (and grows back every time). */
  function temper(m) {
    const b = m.battle, S = b.story, sup = S.sup;
    const said = {};
    const lines = [
      ['amused', () => true, 'Hehe. You little ones are funny. Keep going.'],
      ['annoyed', () => sup.mech.reforms >= 1 || sup.hpFrac < 0.6, 'Stop... PLAYING with me!'],
      ['furious', () => sup.mech.reforms >= 2 || sup.hpFrac < 0.35, 'I will tear you into PIECES!'],
    ];
    const hook = () => {
      if (b.inputLocked) return;
      for (const [id, when, line] of lines) {
        if (said[id] || !when()) continue;
        said[id] = true;
        m.flags['buu_' + id] = true;
        m.say('super_buu', line, 2.6, { style: id === 'amused' ? undefined : 'shout' });
        b.emit('buuTemper', { mood: id });
        break;
      }
    };
    m.tickHooks.push(hook);
    return () => K.unhook(m, hook);
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      K.hover(b, S.sup, S.sup.pos, 30);
      S.sup.setState('scripted', { pose: 'flyIdle', expression: 'grin' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'tc_arrival');
      yield* SL.Cinema.play(m, 'tc_extinction');
    },
  };

  P.enter = {
    id: 'enter',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, 'tc_enter');
    },
  };

  /** Super Saiyan Gotenks: outclassed. */
  P.base = {
    id: 'base',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gotenks, sup = S.sup;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      toChamber(b);
      K.place(g, K.ground(b, new V3(0, 0, 6)));
      K.place(sup, K.ground(b, new V3(0, 0, -4)));
      faceUp(b);
      K.toForm(g, 'ssj');
      g.lockedForms = { ssj3: true };
      g.hp = g.hpMax;
      g.ki = 100;
      sup.hp = sup.hpMax;
      m.music('finale', 5);
      m.objective('hold', 'Show him what Gotenks can do', { icon: 'clock', target: TC.baseSeconds });
      let t = 0;
      const hook = () => {
        if (sup.hp < sup.hpMax * 0.7) sup.hp = sup.hpMax * 0.7; // Super Saiyan is not enough, and it shows
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('hold', Math.min(TC.baseSeconds, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      fight(m, TC.buuBaseDealt, TC.buuBaseTaken, 'normal');
      yield () => t >= TC.baseSeconds || g.hpFrac < TC.baseHpEnd || b.skipRequested;
      K.unhook(m, hook);
      m.complete('hold');
      m.flags.baseSeconds = Math.round(t);
      m.lock(true);
      K.clearCombat(b);
      sup.controller = K.scripted();
      if (sup.mech.apart) yield () => !sup.mech.apart;
      faceUp(b);
      yield* SL.Cinema.play(m, 'tc_secret');
      // the secret: pushed through by holding Charge
      g.hp = Math.max(g.hp, g.hpMax * 0.55);
      g.ki = 100;
      sup.setState('scripted', { pose: 'sb_idle', expression: 'smirk' });
      m.objective('ascend', 'Super Saiyan 3', { icon: 'transform' });
      m.shot((tt, out) => {
        const c = g.chest();
        const toB = sup.pos.clone().sub(g.pos).setY(0).normalize();
        const side = new V3(-toB.z, 0, toB.x);
        K.camAt(out, c.clone().addScaledVector(toB, 4.2).addScaledVector(side, 1.8).add(new V3(0, -0.4, 0)), c.clone().add(new V3(0, 0.5, 0)), 52);
      }, 60, { cut: true, blendIn: 0 });
      delete g.lockedForms.ssj3;
      yield* SL.data.cinematics.ascend(m, {
        fighter: g,
        form: 'ssj3',
        witness: S.piccolo,
        seconds: TC.ascendSeconds,
        label: 'Hold — Super Saiyan 3',
        meter: 'SUPER SAIYAN 3',
        music: 6,
        dust: false,
        beats: [
          { at: 0.3, run: () => b.stage.setMood(0.35, 0x0a0a18, 1.2) },
          { at: 0.55, run: () => b.sfx('rumble', g, { vol: 1, dur: 3 }) },
          { at: 0.75, run: () => b.vfx.skyBolt(g.pos.clone().add(new V3(4, 0, -3)), 40) },
        ],
        onReady: () => m.endShot(),
      });
      m.complete('ascend');
      b.stage.clearMood(1);
    },
  };

  /** Super Saiyan 3 Gotenks: the fight turns, and Super Buu does not like it. */
  P.third = {
    id: 'third',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gotenks, sup = S.sup;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      toChamber(b);
      if (sup.mech.apart) yield () => !sup.mech.apart;
      K.toForm(g, 'ssj3');
      g.lockedForms = {};
      g.ki = Math.max(g.ki, 100);
      g.hp = Math.max(g.hp, g.hpMax * 0.6);
      g.damageDealtMul = TC.thirdDealt;
      g.damageTakenMul = TC.thirdTaken;
      sup.hp = Math.max(sup.hp, sup.hpMax * 0.9);
      sup.reformTo = TC.reformTo;
      sup.mech.breakIdx = 0;
      K.place(g, K.ground(b, new V3(0, 0, 6)));
      K.place(sup, K.ground(b, new V3(0, 0, -4)));
      faceUp(b);
      m.music('finale', 6);
      m.objective('apart', 'Blow him apart — ' + TC.aparts + ' times', { icon: 'fist', target: TC.aparts });
      m.objective('ghost', 'Hit him with the Super Ghost Kamikaze Attack', { icon: 'ultimate', optional: true });
      m.prompt('ssj3Ki', 'charge', 'Charge — Super Saiyan 3 is burning your ki', { when: () => g.ki < 35 && g.form.id === 'ssj3', until: () => g.ki > 60 });
      let aparts = 0, ghost = false;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter === sup) m.progress('apart', ++aparts);
      });
      const offD = b.on('damage', (e) => {
        if (e.attacker === g && e.target === sup && e.source && /ghost|kamikaze/i.test(e.source) && !ghost) {
          ghost = true;
          m.complete('ghost');
        }
      });
      const offT = temper(m);
      fight(m, TC.buuThirdDealt, TC.buuThirdTaken, 'normal');
      yield () => aparts >= TC.aparts || g.formIndex < K.formIndex(g, 'ssj3') || b.skipRequested;
      offA();
      offD();
      offT();
      m.flags.thirdAparts = aparts;
      m.flags.ghostHit = ghost;
      if (!ghost) m.failObjective('ghost');
      if (aparts < TC.aparts) m.failObjective('apart');
      else m.complete('apart');
      m.qteParts.push(aparts / TC.aparts);
      m.lock(true);
      K.clearCombat(b);
      sup.controller = K.scripted();
      if (sup.mech.apart) yield () => !sup.mech.apart;
      faceUp(b);
      // leaving mid-scream (quit, retry) must not leave the picture or the sound bent
      m.onDispose(() => {
        if (SL.Audio && SL.Audio.setDream) SL.Audio.setDream(0);
        if (SL.ScreenFX && SL.ScreenFX.vision) SL.ScreenFX.vision(0);
      });
      yield* SL.Cinema.play(m, 'tc_door');
      yield* SL.Cinema.play(m, 'tc_scream');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'THE ROOM OF SPIRIT AND TIME', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_timechamber',
    canon: true,
    chapter: 'CHAPTER 11 · BUU SAGA',
    title: 'The Room of Spirit and Time',
    subtitle: "Kami's Lookout · a year in a day",
    character: 'gotenks',
    stage: 'lookout',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Super Buu came for the fighters he was promised, and got bored waiting. Now there is one room left where Gotenks can buy the world some time.',
    rewards: ['Gotenks: Super Saiyan 3', 'Super Saiyan 3 Gotenks in Free Battle'],
    setup,
    phases: [P.arrival, P.enter, P.base, P.third, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.timeChamber = { TC, DOOR, LOOKOUT_DOOR };
})();
