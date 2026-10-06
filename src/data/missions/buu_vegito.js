/*
 * CHAPTER 13 — BUU SAGA: VEGITO
 * Mission "Vegito" (canon; played as Vegito). Two earrings, two ears, and no going back.
 *
 *   POTARA  (scene)       Vegeta clips his on the right ear, Goku his on the left; the earrings flare,
 *                         the pull takes them off their feet, faster and faster — chest to chest —
 *                         a column of white-gold light through the clouds, a crater
 *   REVEAL  (scene)       the dust goes: one man. Vegeta's hairline, Goku's two bangs, the navy gi
 *                         over orange, white gloves and boots. The shoulders roll back, the neck
 *                         cracks, the gloves flex. Two voices at once: "...you get Vegito!"
 *   TEST    (checkpoint)  Buuhan does not believe it. Base Vegito: take him apart — he is fast, he
 *                         hits like two Saiyans, and he is enjoying himself
 *   CHALLENGE (scene)     Buuhan, put back together and furious, on a ledge: earrings, matching
 *                         dirty Saiyans, no more playing. Vegito: "Funny. I was just warming up."
 *
 * The fusion is SL.Fusion with the Potara data (no timer: it is meant to be permanent). Goku and
 * Vegeta are hidden inside Vegito, not removed — "Inside Buu" hands them back.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const VK = SL.data.vegitoKit;

  const VG = {
    dealt: 1.8, // base Vegito against Buuhan
    buuDealt: 0.07,
    buuTaken: 1.4,
    reformTo: 0.55,
    aparts: 1,
    untouched: 0.25,
  };
  const MEET = new V3(0, 0, 2); // where they meet: the crater

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(-2.6, 2), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(2.6, 2), startKi: 100 });
    const bh = b.spawn({ charId: 'buuhan', team: 1, pos: at(0, -14), startKi: 240, tags: { boss: true, priority: true } });
    K.watcher(vegeta, 'backTurned', 'angry');
    K.watcher(bh, 'bh_idle', 'wicked');
    bh.setHidden(true);
    bh.mech.maxReforms = Infinity;
    bh.cannotDie = goku.cannotDie = vegeta.cannotDie = true;
    goku.lockedForms = { ssj3: true, kaioken: true };
    vegeta.lockedForms = { majin: true };
    b.story = { goku, vegeta, bh, vegito: null, owned: false };
  }

  function own(m) {
    const S = m.battle.story;
    if (S.owned) return;
    S.owned = true;
    S.vegetaHalo = SL.Cinema.halo(m.battle, S.vegeta);
    SL.data.princeMission.canyonSet(m); // the same ledge, boulder and rim as the reunion
    // one earring in each hand until they go on
    if (!S.fused) for (const f of [S.goku, S.vegeta]) if (!f.model.props.potaraHand) f.model.addProp(SL.data.princeMission.HAND_POTARA);
  }

  /** The fused one, made (or found) — watched or skipped, the same state. */
  function fuse(m) {
    const b = m.battle, S = b.story;
    if (S.vegito) return S.vegito;
    for (const f of [S.goku, S.vegeta]) VK.earOff(f);
    const h = SL.Fusion.fuse(b, S.goku, S.vegeta, 'vegito', { silent: true, hpFrac: 1 });
    const v = h.fused;
    v.cannotDie = true;
    K.place(v, K.ground(b, MEET));
    v.yaw = v.prevYaw = Math.PI; // facing down the canyon, where Buuhan will come from
    S.fusion = h;
    S.vegito = v;
    v.lockedForms = { ssj: true }; // Super Vegito is the next mission's
    return v;
  }

  const P = {};

  P.potara = {
    id: 'potara',
    run: function* (m) {
      own(m);
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'vg_potara');
      fuse(m);
      yield* SL.Cinema.play(m, 'vg_reveal');
    },
  };

  /** Base Vegito against Buuhan. He does not need to transform for this, and he says so. */
  P.test = {
    id: 'test',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story;
      const v = fuse(m), bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      bh.setHidden(false);
      bh.hp = bh.hpMax;
      bh.reformTo = VG.reformTo;
      bh.mech.breakIdx = 0;
      K.place(v, K.ground(b, MEET));
      K.place(bh, K.ground(b, MEET.clone().add(new V3(0, 0, -7))));
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      v.hp = v.hpMax;
      v.ki = v.kiMax;
      m.music('vegito_theme', 5);
      m.objective('apart', 'Take Buuhan apart', { icon: 'fist', target: VG.aparts });
      m.objective('untouched', 'Barely let him touch you', { icon: 'guard', optional: true });
      let aparts = 0;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter === bh) m.progress('apart', ++aparts);
      });
      // Vegito talks while he works
      const said = {};
      const offT = b.on('damage', (e) => {
        if (e.attacker !== v || e.target !== bh) return;
        const line = !said.a && bh.hpFrac < 0.8 ? 'a' : !said.b && bh.hpFrac < 0.55 ? 'b' : null;
        if (!line) return;
        said[line] = true;
        m.say('vegito', line === 'a' ? 'Heh. Is that it? I thought you ate the strongest fighter on Earth.' : 'Come on, come on! I haven\'t even warmed up!', 2.6, { style: 'dual' });
      });
      if (b.player !== v) b.switchPlayer(v, { force: true });
      v.target = bh;
      bh.target = v;
      v.damageDealtMul = VG.dealt;
      bh.damageDealtMul = VG.buuDealt;
      bh.damageTakenMul = VG.buuTaken;
      bh.untargetable = bh.intangible = false;
      bh.controller = new SL.AIController(b, { difficulty: 'hard' });
      // the gap: Buuhan's blows do not move him (a third of the damage stays, for the optional goal)
      m.powerGap(v, { from: [bh], mul: 0.3, lines: [{ at: 3, who: 'vegito', line: 'Was that a punch? Try again.', style: 'dual' }] });
      v.setState('free');
      bh.setState('free');
      m.lock(false);
      b.aiLocked = false;
      yield () => aparts >= VG.aparts || b.skipRequested;
      offA();
      offT();
      m.complete('apart');
      const lost = 1 - v.hpFrac;
      if (lost < VG.untouched) m.complete('untouched');
      else m.failObjective('untouched');
      m.flags.vegitoLost = Math.round(lost * 100) / 100;
      m.lock(true);
      K.clearCombat(b);
      bh.controller = K.scripted();
      if (bh.mech.apart) yield () => !bh.mech.apart;
      yield* SL.Cinema.play(m, 'vg_challenge');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'VEGITO', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_vegito',
    canon: true,
    chapter: 'CHAPTER 13 · BUU SAGA',
    title: 'Vegito',
    subtitle: 'Earth · Age 774 · Kakarot and Vegeta',
    character: 'vegito',
    stage: 'rocky_canyon',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Vegeta would rather die than fuse. Buuhan has eaten everybody else. Two earrings click shut.',
    rewards: ['Character: Vegito', 'Story: the Potara fusion'],
    setup,
    phases: [P.potara, P.test, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.vegitoMission = { VG, MEET, fuse };
})();
