/*
 * CHAPTER 12 — BUU SAGA: THE ULTIMATE
 * Mission "Ultimate Gohan" (canon; played as Gohan in the Ultimate). Gohan comes back to Earth and
 * finds Super Buu. The fight is not close — until Buu stops fighting fair.
 *
 *   RETURN    (scene)      the wastes; Super Buu, bored and looking for fighters; a calm voice behind
 *                          him; a fist caught in one open hand (a cue)
 *   REVERSAL  (checkpoint) Ultimate Gohan against Super Buu: efficient, fast, overwhelming. Take him
 *                          apart twice; optional: barely get touched
 *   TRICK     (scene)      Buu, losing, threatens to blow up the Earth; Gohan calls the bluff; Gotenks
 *                          and Piccolo arrive; a piece of Buu left behind swallows them both
 *   BUUTENKS  (scene)      the body changes: bigger, Gotenks' vest and gold pads, Gotenks' grin
 *   OVERTURN  (checkpoint) Gohan against Buutenks: now it is Gohan who is outclassed — last as long as
 *                          you can (the story goes on either way)
 *   HOPE      (scene)      Gohan on his knees; far away, a light: somebody is coming back
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // the knobs (tests read them)
  const UG = {
    gohanDealt: 1.8, // Ultimate Gohan against Super Buu
    buuDealt: 0.18,
    buuTaken: 1.5,
    reformTo: 0.45,
    aparts: 2,
    untouched: 0.2, // optional: finish having lost less than this much health
    btDealt: 0.7, // Buutenks against Gohan
    btTaken: 0.35,
    overturnSeconds: 35,
    overturnHpEnd: 0.25,
  };

  /* ------------------------------------------------ the blob: a piece of Buu left behind */
  const FX = (SL.data.ultimateFX = {
    blob(m, pos) {
      const b = m.battle, S = b.story;
      if (!S.blob) {
        const geo = new THREE.SphereGeometry(1, 20, 14);
        const mat = SL.Toon.makeMat(0xf29ac0, {});
        const mesh = new THREE.Mesh(geo, mat);
        SL.Toon.addOutline(mesh, 1.4);
        b.scene.add(mesh);
        S.blob = mesh;
        m.onDispose(() => {
          b.scene.remove(mesh);
          geo.dispose();
          mat.dispose();
        });
      }
      if (pos) S.blob.position.copy(pos);
      return S.blob;
    },
  });

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: at(0, 8), startKi: 100, wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } });
    const sup = b.spawn({ charId: 'super_buu', team: 1, pos: at(0, -4), startKi: 200, tags: { boss: true, priority: true } });
    const bt = b.spawn({ charId: 'buutenks', team: 1, pos: at(0, -4), startKi: 200, tags: { boss: true } });
    const gotenks = b.spawn({ charId: 'gotenks', team: 0, pos: at(14, 18) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(16, 18) });
    for (const f of [bt, gotenks, piccolo]) {
      K.watcher(f, 'idle', 'calm');
      f.setHidden(true);
    }
    sup.controller = K.scripted();
    for (const f of [sup, bt]) {
      f.mech.maxReforms = Infinity;
      f.cannotDie = true;
    }
    gohan.cannotDie = true;
    K.toForm(gohan, 'ultimate');
    gohan.lockedForms = { ssj: true, ssj2: true };
    b.story = { gohan, sup, bt, gotenks, piccolo };
  }

  function faceUp(b, foe) {
    const S = b.story;
    K.faceTo(S.gohan, foe.pos);
    K.faceTo(foe, S.gohan.pos);
  }

  function fight(m, foe, opts) {
    const b = m.battle, S = b.story, g = S.gohan;
    if (b.player !== g) b.switchPlayer(g, { force: true });
    g.target = foe;
    foe.target = g;
    g.damageDealtMul = opts.dealt;
    foe.damageDealtMul = opts.foeDealt;
    foe.damageTakenMul = opts.foeTaken;
    foe.untargetable = foe.intangible = false;
    foe.controller = new SL.AIController(b, { difficulty: opts.difficulty || 'hard' });
    g.setState('free');
    foe.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  const P = {};

  P.ret = {
    id: 'return',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'ug_return');
    },
  };

  /** The reversal: Super Buu cannot touch him. */
  P.reversal = {
    id: 'reversal',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, sup = S.sup;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.toForm(g, 'ultimate');
      g.lockedForms = { ssj: true, ssj2: true };
      g.hp = g.hpMax;
      g.ki = 100;
      sup.setHidden(false);
      sup.hp = sup.hpMax;
      sup.reformTo = UG.reformTo;
      sup.mech.breakIdx = 0;
      K.place(g, K.ground(b, new V3(0, 0, 5)));
      K.place(sup, K.ground(b, new V3(0, 0, -3)));
      faceUp(b, sup);
      m.music('finale', 5);
      m.objective('apart', 'Take him apart — twice', { icon: 'fist', target: UG.aparts });
      m.objective('untouched', 'Barely let him touch you', { icon: 'guard', optional: true });
      let aparts = 0;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter === sup) m.progress('apart', ++aparts);
      });
      // Super Buu does not like losing, and says so
      const said = {};
      const offT = b.on('damage', (e) => {
        if (e.target !== sup || e.attacker !== g) return;
        const line = sup.hpFrac < 0.5 && !said.a ? 'a' : aparts >= 1 && !said.b ? 'b' : null;
        if (!line) return;
        said[line] = true;
        m.say('super_buu', line === 'a' ? 'How... how are you THIS strong?!' : 'Stop it! STOP IT!', 2.4, { style: 'shout' });
      });
      fight(m, sup, { dealt: UG.gohanDealt, foeDealt: UG.buuDealt, foeTaken: UG.buuTaken });
      yield () => aparts >= UG.aparts || b.skipRequested;
      offA();
      offT();
      m.complete('apart');
      const lost = 1 - g.hpFrac;
      if (lost < UG.untouched) m.complete('untouched');
      else m.failObjective('untouched');
      m.flags.reversalAparts = aparts;
      m.flags.gohanLost = Math.round(lost * 100) / 100;
      m.qteParts.push(lost < UG.untouched ? 1 : 0.7);
      m.lock(true);
      K.clearCombat(b);
      sup.controller = K.scripted();
      if (sup.mech.apart) yield () => !sup.mech.apart;
      faceUp(b, sup);
      // his beam against a Masenko fired from over the head (the brief's reversal, Phase 2)
      yield* SL.Cinema.play(m, 'ug_masenko');
      yield* SL.Cinema.play(m, 'ug_trick');
    },
  };

  /** Buutenks: now Gohan is the one outclassed. */
  P.overturn = {
    id: 'overturn',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, bt = S.bt;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      for (const f of [S.sup, S.gotenks, S.piccolo]) {
        K.watcher(f, 'idle', 'calm');
        f.setHidden(true);
      }
      if (S.blob) S.blob.visible = false;
      K.toForm(g, 'ultimate');
      bt.setHidden(false);
      bt.hp = bt.hpMax;
      K.place(g, K.ground(b, new V3(0, 0, 5)));
      K.place(bt, K.ground(b, new V3(0, 0, -3)));
      faceUp(b, bt);
      g.hp = Math.max(g.hp, g.hpMax * 0.8);
      m.music('finale', 6);
      m.objective('last', 'Hold on', { icon: 'clock', target: UG.overturnSeconds });
      let t = 0;
      const hook = () => {
        if (bt.hp < bt.hpMax * 0.6) bt.hp = bt.hpMax * 0.6;
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('last', Math.min(UG.overturnSeconds, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      fight(m, bt, { dealt: 1, foeDealt: UG.btDealt, foeTaken: UG.btTaken });
      yield () => t >= UG.overturnSeconds || g.hpFrac < UG.overturnHpEnd || b.skipRequested;
      K.unhook(m, hook);
      m.complete('last');
      m.flags.overturnSeconds = Math.round(t);
      m.lock(true);
      K.clearCombat(b);
      bt.controller = K.scripted();
      if (bt.mech.apart) yield () => !bt.mech.apart;
      faceUp(b, bt);
      yield* SL.Cinema.play(m, 'ug_hope');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'ULTIMATE GOHAN', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_ultimate',
    canon: true,
    chapter: 'CHAPTER 12 · BUU SAGA',
    title: 'Ultimate Gohan',
    subtitle: 'Earth · Age 774 · he came back',
    character: 'adult_gohan',
    stage: 'majin_wastes',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Gohan comes back from the Sacred World calm, and stronger than anything on Earth. Super Buu has never lost a fight. He does not intend to start now.',
    rewards: ['Story: Buutenks'],
    setup,
    phases: [P.ret, P.reversal, P.overturn, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.ultimateGohan = { UG };
})();
