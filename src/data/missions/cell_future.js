/*
 * CHAPTER 6 — CELL SAGA: EPILOGUE (2026-10-01, the owner's brief)
 * Mission "The Future Trunks Made" (canon, played as Future Trunks).
 *
 * Back in his own ruined timeline after a year in the Room of Spirit and Time and the Cell Games,
 * Trunks finishes what killed Gohan and his world — methodically, calmly, without gloating. The
 * Future Androids never trained; he did. The power gap is the point: their blows do nothing.
 *
 *   ARRIVE      (scene)  the time machine in the ruins; smoke over Parsley City
 *   CITY        (scene)  17 and 18 hunting survivors for fun; 18's blast at an old man, swatted into the
 *                        sky with one hand; they laugh; the gold, and the asphalt shattering under him
 *   EIGHTEEN *  (play)   she cannot touch him
 *   EXECUTE18   (scene)  her strike stopped on one arm; a kick into the sky; the Finish Buster, point-blank
 *   SEVENTEEN * (play)   "You monster!" — wild, and useless
 *   JUDGMENT    (scene)  a knee; on his hands and knees; "This is for Gohan..."; the volley; a crater
 *   AMBUSH      (scene)  three years later at Capsule Corporation: the imperfect Cell, and Trunks already
 *                        knowing; out to the wasteland
 *   CELL *      (play)   Super Saiyan Grade 2: he ragdolls it
 *   HEAT DOME   (scene)  Cell climbs for a Kamehameha; thrown higher still; the Heat Dome Attack
 *   AFTER                "It's over, Gohan."
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;

  const FU = { eighteenTo: 0.4, seventeenTo: 0.4, cellTo: 0.4 };
  const STREET = new V3(0, 0, 4);

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const t = b.spawn({ charId: 'future_trunks', player: true, team: 0, pos: at(0, 30), startKi: 100 });
    const a17 = b.spawn({ charId: 'android_17', team: 1, pos: at(-4, -8), startKi: 100, tags: { boss: true } });
    const a18 = b.spawn({ charId: 'android_18', team: 1, pos: at(4, -8), startKi: 100, tags: { boss: true } });
    const old = b.spawn({ charId: 'civilian', team: 0, pos: at(0, -2), startKi: 0 });
    const cell = b.spawn({ charId: 'cell', team: 1, pos: at(0, -60), startKi: 120, tags: { boss: true } });
    for (const f of [a17, a18, old, cell]) {
      f.controller = K.scripted();
      f.cannotDie = true;
    }
    old.untargetable = old.intangible = true;
    cell.setHidden(true);
    cell.untargetable = true;
    t.cannotDie = true;
    t.lockedForms = {};
    b.story = { trunks: t, a17, a18, old, cell };
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'fu_arrive');
      yield* SL.Cinema.play(m, 'fu_city');
    },
  };

  function fightAndroid(m, foe, other, to, label) {
    const b = m.battle, S = b.story, t = S.trunks;
    return (function* () {
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.toForm(t, 'ssj');
      if (b.player !== t) b.switchPlayer(t, { force: true });
      t.hp = Math.max(t.hp, Math.round(t.hpMax * 0.85));
      t.ki = t.kiMax;
      t.damageDealtMul = 1.6;
      // a power gap you can feel: they never trained, he did — their blows simply do not land
      m.powerGap(t, { from: [foe], mul: 0.05 });
      foe.setHidden(false);
      foe.untargetable = false;
      foe.hp = foe.hpMax;
      foe.damageDealtMul = 0.6;
      foe.controller = new SL.AIController(b, { difficulty: 'hard' });
      foe.target = t;
      t.target = foe;
      if (other && !other._gone) K.watch(other, other.pos.clone(), 'a17_bored', 'smirk', t.pos);
      foe.setState('free');
      t.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 5);
      m.objective('fight', label, { icon: 'fist', target: 100 });
      let ns = 0;
      const offN = b.on('noSell', (e) => {
        if (e.fighter === t) ns++;
      });
      const hook = () => m.progress('fight', Math.min(100, Math.floor(U.clamp01((1 - foe.hpFrac) / (1 - to)) * 100)));
      m.tickHooks.push(hook);
      yield () => foe.hpFrac <= to;
      K.removeHook(m, hook);
      offN();
      m.complete('fight');
      t.storyNoSell = null;
      m.lock(true);
      K.clearCombat(b);
      foe.controller = K.scripted();
      m.flags['noSell_' + foe.def.id] = ns;
      yield 0.4;
    })();
  }

  P.eighteen = {
    id: 'eighteen',
    checkpoint: true,
    run: function* (m) {
      const S = m.battle.story;
      S.old.setHidden(true);
      yield* fightAndroid(m, S.a18, S.a17, FU.eighteenTo, 'She can\'t touch you');
      yield* SL.Cinema.play(m, 'fu_execute18');
      yield* SL.Cinema.play(m, 'fu_seventeen');
    },
  };

  P.seventeen = {
    id: 'seventeen',
    checkpoint: true,
    run: function* (m) {
      const S = m.battle.story;
      S.old.setHidden(true);
      if (!S.a18._gone) {
        S.a18.setHidden(true);
        S.a18._gone = true;
      }
      yield* fightAndroid(m, S.a17, null, FU.seventeenTo, 'Seventeen');
      yield* SL.Cinema.play(m, 'fu_judgment');
      yield* SL.Cinema.play(m, 'fu_ambush');
    },
  };

  P.cell = {
    id: 'cell',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, c = S.cell;
      m.lock(true);
      m.clearObjectives();
      for (const f of [S.a17, S.a18, S.old]) {
        f.setHidden(true);
        f._gone = true;
      }
      if (b.stage.def.id !== 'wasteland') b.changeStage('wasteland');
      m.endShot();
      K.clearCombat(b);
      K.toForm(t, 'ssj');
      if (b.player !== t) b.switchPlayer(t, { force: true });
      K.place(t, K.ground(b, new V3(0, 0, 6)), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      K.toForm(c, 'base');
      K.place(c, K.ground(b, new V3(0, 0, -6)), 0);
      K.faceTo(t, c.pos);
      K.faceTo(c, t.pos);
      t.hp = Math.max(t.hp, Math.round(t.hpMax * 0.85));
      t.ki = t.kiMax;
      t.damageDealtMul = 1.8;
      m.powerGap(t, { from: [c], mul: 0.05 });
      c.hp = c.hpMax;
      c.noRegen = false;
      c.damageDealtMul = 0.6;
      c.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.8, defense: 0.4, ranged: 0.4, beam: 0.3, preferredRange: 3, hooks: 'boss' } });
      c.target = t;
      t.target = c;
      c.setState('free');
      t.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 6);
      m.objective('cell', 'Throw it around', { icon: 'fist', target: 100 });
      const hook = () => m.progress('cell', Math.min(100, Math.floor(U.clamp01((1 - c.hpFrac) / (1 - FU.cellTo)) * 100)));
      m.tickHooks.push(hook);
      yield () => c.hpFrac <= FU.cellTo;
      K.removeHook(m, hook);
      m.complete('cell');
      t.storyNoSell = null;
      m.lock(true);
      K.clearCombat(b);
      c.controller = K.scripted();
      yield* SL.Cinema.play(m, 'fu_heatdome');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, 'fu_over');
      m.fade('black', 1.4);
      yield* m.cine(1.6);
      m.endShot();
      m.title('CHAPTER 6 · CELL SAGA', 'THE FUTURE TRUNKS MADE', 'Seven years later: a tournament, and a wizard (Chapter 7)', 4.6);
      yield* m.cine(4.8);
    },
  };

  const def = {
    id: 'cell_future',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'The Future Trunks Made',
    subtitle: 'Earth · Age 785 · his own timeline',
    character: 'future_trunks',
    stage: 'future_ruins',
    parTime: 420,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Back in the world the Androids broke. He trained for a year in a room outside time. They did not.',
    rewards: ['Chapter 6 complete'],
    setup,
    phases: [P.arrive, P.eighteen, P.seventeen, P.cell, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.cellFuture = { FU, STREET };
})();
