/*
 * CHAPTER 5 — ANDROID SAGA (first mission)
 * Mission "The Stranger" (canon, played as Future Trunks). Rebuilt 2026-09-24 (owner's Future
 * Trunks arrival rebuild): the chapter's opening as one continuous, playable confrontation.
 *
 * Age 764. Frieza survived Namek in a rebuilt body and comes to Earth with his father and an army
 * to wait for Goku. A machine falls out of the sky first.
 *
 *   arrive     the ship comes down on the coast, the army deploys and sets a perimeter, Frieza and
 *              King Cold walk out, the scouters find nothing; on a ridge far off the Z Fighters feel it
 *   machine    the air tears, the Time Machine drops onto the rocks, a boy with a sword climbs out
 *              and puts the machine in his pocket; nobody knows who he is
 *   confront   he walks up to Frieza's army and tells him to leave; Frieza laughs and gives the order
 *   barrage    the army fires everything; the smoke clears on nothing; he is already among them
 *   massacre   CHECKPOINT · playable: the army against him, and it is not a fight — every one he
 *              kills gets a finisher (SL.data.trunksKit.finisher); he sheathes the sword on the last
 *   reveal     Frieza shoots at him and misses by an inch; "Goku is not the only one" — the
 *              transformation (his own, SL.data.trunksKit.transform), Frieza's face, the ridge's
 *   frieza     CHECKPOINT · playable: a demonstration, not a boss fight — Frieza really tries and his
 *              moods follow what happens to it (denial → confused → angry), then the Supernova he
 *              catches in two hands, then terror; the Burning Attack ends it
 *   finish     the decoy, the leap, the vanish, the cut from above, the pieces in the air, the palm
 *   cold       CHECKPOINT · the sword: offered, swung, caught bare-handed; the blast; the begging;
 *              Finish Buster — the player presses each of those
 *   after      he powers down, the Z Fighters come down to him, and he tells them when Goku lands
 *
 * No objective text and no fail state: the gap is the point (the owner: "do not make the power gap
 * subtle"). Every interactive beat is a Mission.cue (a single button the story waits on).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;

  // the stage and the army's spots live in the kit (the scenes load before this file)
  const { FIELD, SHIP_AT, FRIEZA_AT, COLD_AT, MACHINE_AT, TRUNKS_AT, RIDGE, ARMY, BLITZ, rankSpot, ringSpot } = SL.data.trunksArrival;

  // the stretch's power gap (tuning knobs; STATUS.md → The Stranger)
  const GAP = {
    army: { dealt: 7, taken: 0.08, armor: 1, move: 1.3, evade: 0.45 },
    frieza: { dealt: 2.4, taken: 0.05, armor: 2, move: 1.2, evade: 0.7 },
  };

  function setup(battle) {
    const b = battle;
    K.clearArea(b, FIELD, 62);
    K.clearArea(b, SHIP_AT, 34);
    K.clearArea(b, RIDGE, 10);
    const trunks = b.spawn({ charId: 'future_trunks', player: true, team: 0, pos: K.ground(b, TRUNKS_AT), startKi: 70 });
    trunks.lockedForms = { ssj: true };
    trunks.cannotDie = true;
    const frieza = b.spawn({ charId: 'mecha_frieza', team: 1, pos: K.ground(b, FRIEZA_AT), startKi: 120, tags: { boss: true, priority: true } });
    const cold = b.spawn({ charId: 'king_cold', team: 1, pos: K.ground(b, COLD_AT), startKi: 120, tags: { boss: true } });
    const soldiers = [];
    for (let i = 0; i < ARMY; i++) {
      const kind = i === 6 || i === 15 ? 'frieza_elite' : i % 4 === 3 ? 'frieza_gunner' : 'frieza_soldier';
      const def = SL.data.characters[kind];
      const skins = def.appearance.skinVariants;
      const s = b.spawn({ charId: kind, team: 1, pos: K.ground(b, rankSpot(i)), startKi: 40, skin: skins ? skins[(i * 3) % skins.length] : undefined, tags: { mission: 'army' }, damageDealtMul: 0.45 });
      s.controller = K.scripted();
      s.keepBody = true;
      s.armyIndex = i;
      soldiers.push(s);
    }
    // the Z Fighters, far off on the ridge: seen only when the story cuts to them
    const ridge = {};
    [['vegeta', 'vegeta'], ['piccolo', 'piccolo'], ['krillin', 'krillin'], ['gohan', 'kid_gohan_764']].forEach(([name, id], i) => {
      const f = b.spawn({ charId: id, team: 0, pos: K.ground(b, RIDGE.clone().add(new V3(i * 1.6, 0, i * 0.7))), startKi: 40 });
      f.controller = K.scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.setHidden(true);
      ridge[name] = f;
    });
    for (const f of [frieza, cold]) {
      f.controller = K.scripted();
      f.cannotDie = true;
      f.untargetable = true;
    }
    trunks.setHidden(true);
    trunks.untargetable = true;
    K.sheathe(trunks, true);
    const ship = K.ship(b, K.ground(b, SHIP_AT));
    b.story = Object.assign({ trunks, frieza, cold, soldiers, ship, ridge: Object.values(ridge), spots: { FIELD, SHIP_AT, FRIEZA_AT, COLD_AT, MACHINE_AT, TRUNKS_AT, RIDGE } }, ridge);
  }

  /* ------------------------------------------------------------ staging */

  /** Everything each phase needs to look the way playing to it looks (checkpoint safety). */
  function prep(m) {
    const b = m.battle;
    m.lock(true);
    m.clearObjectives();
    m.limits(null);
    K.clearCombat(b);
    b.rules.pressure = null;
    for (const f of b.fighters) K.plain(f);
  }
  function soldiersGone(S) {
    for (const s of S.soldiers) {
      s.setHidden(true);
      s.untargetable = true;
      if (s.alive) s.alive = false;
    }
  }
  function ridgeHidden(S) {
    for (const f of S.ridge) f.setHidden(true);
  }
  function machineGone(b, S) {
    if (S.machine) K.propGone(b, S.machine);
  }
  /** The Cold family watching from in front of their ship. */
  function coldFamily(b, S, frieza) {
    if (frieza !== false) K.watch(S.frieza, K.ground(b, FRIEZA_AT), 'idle', 'smirk', S.trunks.pos);
    K.watch(S.cold, K.ground(b, COLD_AT), 'kc_amused', 'calm', S.trunks.pos);
    S.frieza.untargetable = true;
    S.cold.untargetable = true;
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'cold_arrival');
    },
  };

  P.machine = {
    id: 'machine',
    run: function* (m) {
      yield* SL.Cinema.play(m, 'time_machine');
    },
  };

  P.confront = {
    id: 'confront',
    run: function* (m) {
      yield* SL.Cinema.play(m, 'trunks_confront');
    },
  };

  P.barrage = {
    id: 'barrage',
    run: function* (m) {
      const b = m.battle, S = b.story;
      S.army = K.army(m, S.trunks, S.soldiers);
      yield* SL.Cinema.play(m, 'army_barrage');
    },
  };

  /** THE MASSACRE: the army against him. Not a fight — a demonstration of how far beneath him they are. */
  P.massacre = {
    id: 'massacre',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      prep(m);
      machineGone(b, S);
      ridgeHidden(S);
      K.takeControl(b, t);
      K.toForm(t, 'base');
      t.lockedForms = { ssj: true };
      K.sheathe(t, false);
      t.hp = t.hpMax;
      t.ki = Math.max(t.ki, 80);
      t.cannotDie = true;
      const G = GAP.army;
      t.damageDealtMul = G.dealt;
      t.damageTakenMul = G.taken;
      t.storyArmor = G.armor;
      t.moveScale = G.move;
      t.storyEvade = { chance: G.evade, gap: 36, from: S.soldiers };
      t.swordWard = { deflect: true, slip: false, from: S.soldiers };
      coldFamily(b, S);
      // from the checkpoint the blitz has already happened: the first ones are down
      const st = S.army && S.army.t === t ? S.army : K.army(m, t, S.soldiers);
      const centre = t.pos.clone();
      if (!m.flags.blitzDone) {
        S.soldiers.slice(0, BLITZ).forEach((s) => {
          s.alive = false;
          s.setHidden(true);
          s.untargetable = true;
        });
        m.flags.blitzDone = true;
        K.place(t, K.ground(b, TRUNKS_AT), Math.PI);
      }
      const living = S.soldiers.filter((s) => s.alive);
      living.forEach((s, i) => {
        s.setHidden(false);
        s.untargetable = false;
        s.cannotDie = false;
        s.hp = s.hpMax;
        K.place(s, K.ground(b, ringSpot(t.pos, i, living.length, 7 + (i % 3) * 2.2)));
        K.faceTo(s, t.pos);
        s.controller = K.fearful(b, new SL.AIController(b, { difficulty: 'easy' }));
        s.target = t;
        s._shakenUntil = 0;
        s.setState('free');
      });
      t.target = living[0] || null;
      // they are allowed to try, all at once if they like
      b.rules.pressure = { melee: 3, ranged: 3, gap: 16, grace: 40 };
      K.goFight(m, ['battle', 5]);
      const offKo = b.on('ko', (e) => {
        if (S.soldiers.includes(e.fighter)) K.finisher(m, st, e.fighter, e.hit);
      });
      const offDeflect = b.on('swordWard', (e) => {
        if (e.fighter === t) st.deflects = (st.deflects || 0) + 1;
      });
      const hook = () => K.armyTick(m, st);
      m.tickHooks.push(hook);
      m.flags.massacre = true;
      yield () => S.soldiers.every((s) => !s.alive);
      // the last one is held longest: let it go and let it land before the camera comes round
      const endAt = b.frame + 200;
      yield () => (!st.pending.length && !st.splitting.length) || b.frame > endAt;
      offKo();
      offDeflect();
      K.removeHook(m, hook);
      b.rules.pressure = null;
      m.flags.armyDestroyed = true;
      m.flags.finishers = st.finishers.map((x) => x.kind);
      m.flags.hitsTaken = t.stats.hitsTaken;
      yield* SL.Cinema.play(m, 'army_end');
    },
  };

  P.reveal = {
    id: 'reveal',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      prep(m);
      soldiersGone(S);
      ridgeHidden(S);
      machineGone(b, S);
      // the player keeps his own controller: the story holds him with the input lock and scripted states (cues read it)
      K.sheathe(t, true);
      K.place(t, K.ground(b, FRIEZA_AT.clone().add(new V3(0, 0, 9))), Math.PI);
      K.watch(S.frieza, K.ground(b, FRIEZA_AT), 'idle', 'angry', t.pos);
      K.watch(S.cold, K.ground(b, COLD_AT), 'kc_amused', 'calm', t.pos);
      K.faceTo(t, S.frieza.pos);
      yield* SL.Cinema.play(m, 'trunks_reveal');
      // the answer to "what are you" is the transformation — his own, not Goku's
      t.lockedForms = {};
      m.teach(t, 'form:ssj');
      const V = S.vegeta;
      K.place(V, K.ground(b, RIDGE));
      K.faceTo(V, t.pos);
      yield* K.transform(m, {
        fighter: t,
        witness: S.frieza,
        witnessLine: 'Golden hair. The eyes. No — no, that is not possible.',
        watchers: [{ f: V, pose: 'idle', face: 'shock', line: 'A Super Saiyan? That boy?', seconds: 2.4, hideAfter: true }],
      });
      yield* SL.Cinema.play(m, 'trunks_no_limit');
      m.flags.superSaiyan = true;
    },
  };

  /** THE DEMONSTRATION: Frieza tries everything he has, and none of it matters. */
  P.frieza = {
    id: 'frieza',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, fz = S.frieza;
      prep(m);
      soldiersGone(S);
      ridgeHidden(S);
      machineGone(b, S);
      K.takeControl(b, t);
      m.teach(t, 'form:ssj');
      t.lockedForms = {};
      K.toForm(t, 'ssj');
      K.sheathe(t, false);
      t.hp = t.hpMax;
      t.ki = t.kiMax;
      t.cannotDie = true;
      const G = GAP.frieza;
      t.damageDealtMul = G.dealt;
      t.damageTakenMul = G.taken;
      t.storyArmor = G.armor;
      t.moveScale = G.move;
      t.storyEvade = { chance: G.evade, gap: 30, from: [fz] };
      t.swordWard = { deflect: true, slip: true, from: [fz] };
      K.place(t, K.ground(b, FRIEZA_AT.clone().add(new V3(0, 0, 9))), Math.PI);
      K.watch(S.cold, K.ground(b, COLD_AT.clone().add(new V3(-8, 0, -6))), 'kc_amused', 'calm', t.pos);
      fz.setHidden(false);
      fz.untargetable = false;
      fz.cannotDie = true; // the finish takes him, not a health bar
      fz.hp = fz.hpMax;
      fz.poise.value = fz.poise.max;
      fz.lockedSlots = { ultimate: true }; // the Supernova is the story's, not the brain's
      K.place(fz, K.ground(b, FRIEZA_AT), 0);
      K.faceTo(fz, t.pos);
      fz.target = t;
      t.target = fz;
      const st = (S.demo = { mood: null, futile: 0, moods: [], moodAt: b.frame, events: {}, supernova: false, burning: false });
      K.friezaMood(m, fz, 'denial');
      fz.setState('free');
      t.setState('free');
      K.goFight(m, ['finale', 5]);
      const futile = (kind) => {
        st.futile++;
        st.events[kind] = (st.events[kind] || 0) + 1;
      };
      const offs = [
        b.on('storyEvade', (e) => e.fighter === t && e.attacker === fz && futile('evade')),
        b.on('swordWard', (e) => e.fighter === t && e.attacker === fz && futile(e.kind)),
        b.on('armored', (e) => e.fighter === t && e.attacker === fz && futile('armored')),
        b.on('perfectGuard', (e) => e.fighter === t && futile('perfect')),
        b.on('damage', (e) => {
          if (e.target === t && e.attacker === fz && e.blocked) futile('blocked');
        }),
      ];
      let beat = null;
      const hook = () => {
        if (b.inputLocked || beat) return;
        if (st.mood === 'terrified' || st.mood === 'desperate') return;
        if (K.moodDue(b, st, fz)) beat = MOODS_NEXT(st.mood);
      };
      m.tickHooks.push(hook);
      // denial → confused → angry, each with a short beat on his face
      while (st.mood !== 'desperate') {
        yield () => !!beat;
        const next = beat;
        beat = null;
        if (next === 'desperate') {
          st.mood = 'desperate';
          st.moods.push('desperate');
          break;
        }
        yield* moodBeat(m, next);
      }
      // the Supernova: he goes up and throws the planet at him
      yield* supernova(m);
      st.supernova = true;
      // terror: he backs away, and the Burning Attack is the way it ends
      K.friezaMood(m, fz, 'terrified');
      fz.setState('free');
      K.takeControl(b, t);
      K.sheathe(t, false);
      t.ki = t.kiMax;
      K.goFight(m, ['finale', 6]);
      m.prompt('burning', 'special1', 'Burning Attack', { required: true, until: () => st.burning });
      const offB = b.on('special', (e) => {
        if (e.fighter === t && e.spec && e.spec.id === 'burningAttack') st.burning = true;
      });
      yield () => st.burning;
      offB();
      for (const off of offs) off();
      K.removeHook(m, hook);
      m.lock(true);
      t.setState('free');
      K.clearCombat(b);
      m.flags.friezaMoods = st.moods.slice();
      m.flags.futile = st.futile;
      m.flags.trunksDamage = Math.round(t.stats.damageTaken || 0);
    },
  };
  const MOODS_NEXT = (mood) => K.MOODS[mood].next;

  /** A mood change: a moment on his face, a line, and a new way of trying. */
  function* moodBeat(m, mood) {
    const b = m.battle, S = b.story, fz = S.frieza;
    const M = K.MOODS[mood];
    b.slowmo(0.45, 0.5);
    K.friezaMood(m, fz, mood);
    m.say('mecha_frieza', M.line, 2.8, { style: mood === 'angry' ? 'shout' : null });
    fz.model.setExpression(mood === 'angry' ? 'angry' : 'shock');
    // a quick look at his face, without taking the fight away (a gameplay shot: Settings may skip it)
    // three-quarter on the side away from Trunks: he is usually in melee range, square in front
    const fw0 = new V3(Math.sin(fz.yaw), 0, Math.cos(fz.yaw));
    const side = new V3(fw0.z, 0, -fw0.x);
    if (side.dot(S.trunks.pos.clone().sub(fz.pos)) > 0) side.negate();
    b.camera.playShot((k, out) => {
      const h = fz.chest().add(new V3(0, 0.35 * fz.scale, 0));
      const fw = new V3(Math.sin(fz.yaw), 0, Math.cos(fz.yaw));
      const d = U.lerp(2.1, 1.7, k);
      K.camAt(out, h.clone().addScaledVector(fw, d * 0.45).addScaledVector(side, d * 0.95).add(new V3(0, 0.15, 0)), h, 40);
    }, 0.9, { blendIn: 0.1 });
    yield 0.1;
  }

  /** The Supernova, caught in two bare hands; he blows it up anyway, and it does nothing. */
  function* supernova(m) {
    yield* SL.Cinema.play(m, 'frieza_supernova');
  }

  P.finish = {
    id: 'finish',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, fz = S.frieza;
      prep(m);
      soldiersGone(S);
      ridgeHidden(S);
      // the player keeps his own controller: the story holds him with the input lock and scripted states (cues read it)
      K.toForm(t, 'ssj');
      fz.setHidden(false);
      fz.untargetable = true;
      fz.controller = K.scripted();
      // from the checkpoint the story is the same: the fight is over, he is afraid
      const at = t.pos.clone();
      if (at.distanceTo(fz.pos) < 7 || at.distanceTo(fz.pos) > 26) {
        K.place(fz, K.ground(b, FRIEZA_AT), 0);
        K.place(t, K.ground(b, FRIEZA_AT.clone().add(new V3(0, 0, 12))), Math.PI);
      }
      fz.grounded = true;
      K.faceTo(t, fz.pos);
      K.faceTo(fz, t.pos);
      yield* SL.Cinema.play(m, 'frieza_finish');
    },
  };

  /** KING COLD: the sword he thinks is the secret. The player hands it over, catches it, fires, and finishes it. */
  P.cold = {
    id: 'cold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, kc = S.cold;
      prep(m);
      soldiersGone(S);
      ridgeHidden(S);
      machineGone(b, S);
      m.teach(t, 'form:ssj');
      t.lockedForms = {};
      K.toForm(t, 'ssj');
      K.sheathe(t, true);
      // the player keeps his own controller: the story holds him with the input lock and scripted states (cues read it)
      t.setHidden(false);
      S.frieza.setHidden(true);
      S.frieza.untargetable = true;
      S.frieza.alive = false;
      kc.setHidden(false);
      kc.untargetable = true;
      kc.controller = K.scripted();
      K.place(t, K.ground(b, FRIEZA_AT.clone().add(new V3(0, 0, 4))), Math.PI);
      K.place(kc, K.ground(b, FRIEZA_AT.clone().add(new V3(-1.5, 0, -6))), 0);
      K.faceTo(t, kc.pos);
      K.faceTo(kc, t.pos);
      yield* SL.Cinema.play(m, 'cold_sword');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      prep(m);
      soldiersGone(S);
      S.cold.setHidden(true);
      S.cold.untargetable = true;
      S.cold.alive = false;
      S.frieza.setHidden(true);
      S.frieza.alive = false;
      if (S.ship && S.ship.alive) K.propGone(b, S.ship);
      // the player keeps his own controller: the story holds him with the input lock and scripted states (cues read it)
      yield* SL.Cinema.play(m, 'trunks_waits');
      m.lock(true);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 5 · ANDROID SAGA', 'THREE HOURS LATER', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'android_trunks',
    canon: true,
    chapter: 'CHAPTER 5 · ANDROID SAGA',
    title: 'The Stranger',
    subtitle: 'Earth · Age 764 · a sword nobody recognises',
    character: 'future_trunks',
    stage: 'coast',
    parTime: 480,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Frieza survived Namek in a rebuilt body, and he has brought his father and an army to Earth to wait for Goku. Something falls out of the sky first.',
    rewards: ['Future Trunks playable', 'Coastal Flats stage'],
    // canon: the prince watches from the ridge still in his armor (the "Badman" shirt comes later that day)
    appearance: { vegeta: { outfit: 'vegeta_namek_late', armor: 'armor_v_frieza', scouter: 'none', tail: 'none' } },
    setup,
    phases: [P.arrive, P.machine, P.confront, P.barrage, P.massacre, P.reveal, P.frieza, P.finish, P.cold, P.after],
  };
  // tuning and staging the scenes and tests read
  SL.data.missions[def.id] = def;
  SL.data.trunksArrival.GAP = GAP;
})();
