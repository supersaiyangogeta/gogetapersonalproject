/*
 * CHAPTER 6 — CELL SAGA (2026-10-01, the owner: "I don't think I even got to the Hyperbolic Time Chamber")
 * Mission "A Year in a Day" (canon, played as Gohan).
 *
 * Between Cell's announcement and the Games: Vegeta and Trunks come out of the Room of Spirit and Time,
 * Goku and Gohan go in. A year inside is a day outside; ten times Earth's gravity, thin air, heat.
 *
 *   ENTER     (scene)       the door: Vegeta walks out past Goku ("I've gone beyond the Super Saiyan");
 *                           inside, the white nothing, the weight of it, the boy on one knee
 *   SPAR *    (play)        father and son, base form: land your hits on him
 *   ANGER     (scene)       "Think about why you fight." Piccolo. Krillin. His mother.
 *   ASCEND    (hold)        Gohan's first Super Saiyan, pushed through by holding Charge — his own hair,
 *                           in gold (SL.data.cinematics.ascend)
 *   MASTER *  (play)        both of them golden: the Super Saiyan made ordinary
 *   CALM      (scene)       months later: eating, sleeping, laughing — and never once leaving the gold.
 *                           Full Power. The door, a year older.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;

  const HTC = { sparHits: 10, masterHits: 12 };
  const DOOR = new V3(0, 0, -24.5);

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const gohan = b.spawn({ charId: 'teen_gohan', player: true, team: 0, pos: at(1.2, -20), startKi: 80 });
    const goku = b.spawn({ charId: 'goku', team: 1, pos: at(-1.2, -20), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(0, -23.5), startKi: 80 });
    const trunks = b.spawn({ charId: 'future_trunks', team: 0, pos: at(1, -23.5), startKi: 80 });
    for (const f of [goku, vegeta, trunks]) {
      f.controller = K.scripted();
      f.cannotDie = true;
    }
    for (const f of [vegeta, trunks]) {
      f.untargetable = f.intangible = true;
      K.toForm(f, 'ssj');
    }
    gohan.cannotDie = true;
    gohan.lockedForms = { ssj: true, ssj2: true };
    // a year before the Father-Son Kamehameha exists
    gohan.specOverrides = { ultimate: SL.data.cellKit.FULL_KAME };
    goku.lockedForms = {};
    b.story = { gohan, goku, vegeta, trunks };
  }

  const P = {};

  P.enter = {
    id: 'enter',
    run: function* (m) {
      m.lock(true);
      yield* SL.Cinema.play(m, 'ch_enter');
    },
  };

  function spar(m, opts) {
    const b = m.battle, S = b.story, gh = S.gohan, g = S.goku;
    return (function* () {
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      for (const f of [S.vegeta, S.trunks]) f.setHidden(true);
      if (b.player !== gh) b.switchPlayer(gh, { force: true });
      K.toForm(gh, opts.form);
      K.toForm(g, opts.form);
      K.place(gh, K.ground(b, new V3(0, 0, 4)), Math.PI);
      K.place(g, K.ground(b, new V3(0, 0, -4)), 0);
      gh.hp = gh.hpMax;
      gh.ki = gh.kiMax;
      gh.damageTakenMul = 0.4;
      g.hp = g.hpMax;
      g.infiniteHp = true;
      g.untargetable = false;
      g.damageDealtMul = 0.35;
      g.controller = new SL.AIController(b, { difficulty: 'normal', profile: { aggression: 0.55, defense: 0.6, ranged: 0.2, beam: 0.1, preferredRange: 2.4 } });
      g.target = gh;
      gh.target = g;
      g.setState('free');
      gh.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', opts.music);
      m.objective('spar', opts.label, { icon: 'fist', target: opts.hits });
      let hits = 0;
      const off = b.on('damage', (e) => {
        if (e.attacker === gh && e.target === g && !e.blocked) m.progress('spar', Math.min(opts.hits, ++hits));
      });
      if (opts.prompt) m.prompt(opts.prompt[0], opts.prompt[1], opts.prompt[2]);
      yield () => hits >= opts.hits;
      off();
      m.complete('spar');
      m.lock(true);
      K.clearCombat(b);
      g.controller = K.scripted();
      g.infiniteHp = false;
      yield 0.4;
    })();
  }

  P.spar = {
    id: 'spar',
    checkpoint: true,
    run: function* (m) {
      m.battle.story.gohan.lockedForms = { ssj: true, ssj2: true };
      yield* spar(m, { form: 'base', hits: HTC.sparHits, label: 'Land your hits on your father', music: 3 });
    },
  };

  P.anger = {
    id: 'anger',
    run: function* (m) {
      yield* SL.Cinema.play(m, 'ch_anger');
    },
  };

  P.ascend = {
    id: 'ascend',
    run: function* (m) {
      const b = m.battle, S = b.story;
      K.place(S.gohan, K.ground(b, new V3(0, 0, 3)), Math.PI);
      K.faceTo(S.gohan, S.goku.pos);
      S.goku.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
      yield* SL.data.cinematics.ascend(m, {
        fighter: S.gohan,
        form: 'ssj',
        witness: S.goku,
        seconds: 4.5,
        label: 'Hold — let it out',
        meter: 'SUPER SAIYAN',
        line: 'gohan_ssj',
        music: 4,
        dust: false,
        beats: [
          { at: 0.35, run: (mm) => mm.say('goku', 'That\'s it, Gohan! Don\'t hold it back!', 2.6, { style: 'shout' }) },
          { at: 0.7, run: (mm) => mm.say('teen_gohan', 'Rrrrghhh...!', 1.6, { style: 'shout' }) },
        ],
      });
      yield* SL.Cinema.play(m, 'ch_gold');
    },
  };

  P.master = {
    id: 'master',
    checkpoint: true,
    run: function* (m) {
      const S = m.battle.story;
      S.gohan.lockedForms = { ssj2: true };
      m.teach(S.gohan, 'form:ssj');
      yield* spar(m, { form: 'ssj', hits: HTC.masterHits, label: 'Stay golden: spar as a Super Saiyan', music: 5 });
    },
  };

  P.calm = {
    id: 'calm',
    run: function* (m) {
      yield* SL.Cinema.play(m, 'ch_calm');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'A YEAR IN A DAY', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'cell_chamber',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'A Year in a Day',
    subtitle: 'The Room of Spirit and Time · Age 767',
    character: 'teen_gohan',
    stage: 'timechamber',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Ten days until the Cell Games. A year in a white room with his father — and, at the end of it, the gold.',
    rewards: ['Story: Gohan\'s first Super Saiyan'],
    setup,
    phases: [P.enter, P.spar, P.anger, P.ascend, P.master, P.calm],
  };
  SL.data.missions[def.id] = def;
  SL.data.cellChamber = { HTC, DOOR };
})();
