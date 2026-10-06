/*
 * CHAPTER 6 — CELL SAGA: THE CELL GAMES, PART TWO (rebuilt 2026-10-01)
 * Mission "Gohan's Turn" (canon, played as Gohan).
 *
 *   ENTER     (scene)       down from the ridge into the ring; the World Champion back by his van, sore
 *   TEST *    (play)        base form: Cell finds out how much is in the boy
 *   POWERS    (scene)       Super Saiyan — his own hair, gold (not his father's shape and not the canopy
 *                           of Super Saiyan 2): "I don't like fighting."
 *   HOLD *    (play)        holding back while Cell escalates
 *   CRUSH     (scene)       the bear hug; Android 16 grabs Cell to take him with him — and the bomb is
 *                           gone; Cell blows his body apart, on camera, and the head lands at Mr. Satan's feet
 *   BORN      (scene)       seven eggs from the tail; the Cell Juniors
 *   JUNIORS * (play)        the Juniors take the Z Fighters apart on the ridge; Gohan still holding back
 *   SIXTEEN   (scene)       Mr. Satan throws the head to Gohan; 16's last words; Cell's boot; the crunch.
 *                           The pupils shrink, the picture goes black, a red line across the screen snaps
 *                           like glass, gold tears rise and hang, the roar, the pillar of gold and blue
 *                           lightning — Super Saiyan 2
 *   AFTER                   the chapter card
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const CK = SL.data.cellKit;

  const ALLIES_BEATEN = 4;

  function setup(battle) {
    const b = battle;
    const S = CK.cast(b, { player: 'gohan' });
    CK.spectate(b, S, ['goku']);
    CK.lieRock(b);
    CK.watch(S.goku, CK.ground(b, CK.LIE_AT), 'lieBackRock', 'calm');
    CK.toForm(S.goku, 'base');
    CK.place(S.cell, CK.onRing(b, 0, -6), 0);
    S.cell.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
    CK.toForm(S.gohan, 'base');
    S.satan.setState('scripted', { pose: 'ms_sore', expression: 'hurt' });
  }

  /** The world each checkpoint expects (16 alive or gone, the Juniors, the friends who fell). */
  function restore(m, at) {
    const b = m.battle, S = b.story;
    const order = m.def.phases.map((p) => p.id);
    const past = (id) => order.indexOf(id) < order.indexOf(at);
    CK.spectate(b, S, ['goku', 'gohan', 'a16']);
    CK.crew(b);
    S.satan.setState('scripted', { pose: 'ms_sore', expression: 'hurt' });
    CK.lieRock(b);
    if (!past('crush')) CK.watch(S.a16, CK.ground(b, CK.SPOTS.a16), 'armsCrossed', 'calm');
    else if (!S.a16._gone) CK.gone(S.a16);
    // Goku sits up and joins the fight against the Juniors; before that he lies against his rock
    if (at === 'juniors') CK.watch(S.goku, CK.ground(b, CK.SPOTS.goku), 'idle', 'calm');
    else CK.watch(S.goku, CK.ground(b, CK.LIE_AT), 'lieBackRock', 'calm');
  }

  const P = {};

  P.enter = {
    id: 'enter',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'gh_enter');
    },
  };

  /** Base form: Cell tests the boy. */
  P.test = {
    id: 'test',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      CK.prep(m);
      restore(m, 'test');
      CK.takeControl(b, gh);
      gh.lockedForms = { ssj2: true, ssj: true };
      CK.toForm(gh, 'base');
      gh.hp = gh.hpMax;
      gh.ki = Math.max(gh.ki, 80);
      gh.damageDealtMul = 0.55;
      gh.damageTakenMul = 0.75;
      CK.place(gh, CK.onRing(b, 0, 7), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      CK.toForm(c, 'perfect');
      CK.place(c, CK.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.infiniteHp = true;
      c.damageDealtMul = 0.2;
      CK.cellBrain(b, c, { aggression: 0.55, defense: 0.6, ranged: 0.3, beam: 0.2, preferredRange: 3, hooks: 'boss' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      CK.goFight(m, ['battle', 4]);
      m.objective('hold', 'Hold your own', { icon: 'fist', target: 100 });
      let hits = 0, taken = 0;
      const off = b.on('damage', (e) => {
        if (e.blocked) return;
        if (e.target === c && e.attacker === gh) hits++;
        if (e.target === gh && e.attacker === c) taken += e.amount;
      });
      const hook = () => m.progress('hold', Math.min(100, Math.floor(Math.max(hits / 6, taken / (gh.hpMax * 0.35)) * 100)));
      m.tickHooks.push(hook);
      yield () => hits >= 6 || gh.hpFrac <= 0.65;
      CK.removeHook(m, hook);
      off();
      m.complete('hold');
      m.flags.gohanBaseHits = hits;
      yield 0.4;
    },
  };

  P.powers = {
    id: 'powers',
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan;
      CK.clearCombat(b);
      S.cell.controller = CK.scripted();
      CK.place(gh, CK.onRing(b, 0, 6), Math.PI);
      CK.place(S.cell, CK.onRing(b, 0, -6), 0);
      CK.faceTo(gh, S.cell.pos);
      CK.faceTo(S.cell, gh.pos);
      const ssj = CK.formIndex(gh, 'ssj');
      if (gh.formIndex !== ssj) {
        gh.lockedForms = { ssj2: true };
        yield* SL.data.cinematics.transform(m, { fighter: gh, formIndex: ssj, witness: S.cell, line: 'gohan_ssj', music: 4 });
      }
      yield* SL.Cinema.play(m, 'gh_ssj');
    },
  };

  /** Super Saiyan, still holding back, while Cell stops being patient. */
  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      CK.prep(m);
      restore(m, 'hold');
      CK.takeControl(b, gh);
      gh.lockedForms = { ssj2: true };
      CK.toForm(gh, 'ssj');
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.85));
      gh.ki = Math.max(gh.ki, 80);
      gh.damageDealtMul = 0.45;
      gh.damageTakenMul = 0.8;
      CK.place(gh, CK.onRing(b, 0, 7), Math.PI);
      CK.toForm(c, 'perfect');
      CK.place(c, CK.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.infiniteHp = true;
      c.damageDealtMul = 0.25;
      CK.cellBrain(b, c, { aggression: 0.9, defense: 0.4, ranged: 0.4, beam: 0.35, preferredRange: 3, hooks: 'cell' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      CK.goFight(m, ['battle', 5]);
      m.objective('endure', 'He wants you angry. Endure it', { icon: 'guard', target: 100 });
      m.objective('answer', 'Hit back at least five times', { icon: 'fist', optional: true, target: 5 });
      let hits = 0;
      const start = gh.hp;
      const off = b.on('damage', (e) => {
        if (e.target === c && e.attacker === gh && !e.blocked) m.progress('answer', Math.min(5, ++hits));
      });
      const hook = () => {
        const need = start - gh.hpMax * 0.4;
        m.progress('endure', Math.min(100, Math.floor(Math.max(need <= 0 ? 1 : (start - gh.hp) / need, hits / 8) * 100)));
      };
      m.tickHooks.push(hook);
      yield () => gh.hpFrac <= 0.4 || hits >= 8;
      CK.removeHook(m, hook);
      off();
      m.complete('endure');
      if (hits >= 5) m.complete('answer');
      else m.failObjective('answer');
      m.flags.gohanHeld = true;
      yield 0.4;
    },
  };

  P.crush = {
    id: 'crush',
    run: function* (m) {
      const b = m.battle, S = b.story;
      CK.prep(m);
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      S.cell.infiniteHp = false;
      yield* SL.Cinema.play(m, 'gh_crush');
    },
  };

  P.born = {
    id: 'born',
    run: function* (m) {
      CK.prep(m);
      for (const f of m.battle.fighters) if (f !== m.battle.player) f.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'gh_born');
    },
  };

  /**
   * The Juniors against the Z Fighters on the ridge. Gohan is still holding back and the Juniors
   * cannot be killed yet; at most two work him, the rest go for his friends. Ends when his friends
   * are beaten, or when he is.
   */
  P.juniors = {
    id: 'juniors',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      CK.prep(m);
      restore(m, 'juniors');
      b.rules.pressure = { melee: 2, ranged: 1, gap: 80, grace: 150 };
      CK.takeControl(b, gh);
      gh.lockedForms = { ssj2: true };
      CK.toForm(gh, 'ssj');
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.7));
      gh.damageDealtMul = 0.6;
      gh.damageTakenMul = 0.6;
      CK.place(gh, CK.ground(b, new V3(-8, 0, 38)), Math.PI);
      CK.watch(c, CK.onRing(b, 0, -6), 'cl_calm', 'smirk', CK.ground(b, CK.SPOTS.krillin));
      c.infiniteHp = false;
      const allies = ['piccolo', 'vegeta', 'trunks', 'krillin', 'tien', 'yamcha', 'goku'].map((k) => S[k]).filter((f) => f && !f._gone);
      for (const f of allies) {
        const name = Object.keys(S).find((k) => S[k] === f);
        f.setHidden(false);
        CK.place(f, CK.ground(b, CK.SPOTS[name]));
        f.untargetable = false;
        f.hp = Math.round(f.hpMax * 0.9);
        f.damageDealtMul = 0.4;
        f.damageTakenMul = 1.2;
        f.beaten = false;
        f.controller = new SL.AIController(b, { difficulty: 'normal' });
        f.setState('free');
      }
      const juniors = CK.ensureJuniors(m);
      juniors.forEach((j, i) => {
        const a = (i / juniors.length) * Math.PI * 2;
        j.setHidden(false);
        j.untargetable = false;
        j.cannotDie = true; // not while Gohan is still holding back
        j.hp = j.hpMax;
        CK.place(j, CK.ground(b, new V3(-10 + Math.cos(a) * 8, 0, 40 + Math.sin(a) * 5)), a);
        j.controller = new SL.AIController(b, { difficulty: 'normal' });
        j.target = null;
        j.setState('free');
      });
      gh.target = juniors[0];
      CK.goFight(m, ['battle', 6]);
      m.objective('stand', 'Stand with them', { icon: 'fist', target: 6 });
      m.objective('shield', 'Knock a Junior off a friend', { icon: 'guard', optional: true, target: 3 });
      const struck = new Set();
      let shields = 0;
      const off = b.on('damage', (e) => {
        if (e.blocked || e.attacker !== gh || !juniors.includes(e.target)) return;
        struck.add(e.target);
        m.progress('stand', Math.min(6, struck.size));
        const t = e.target.target;
        if (t && t !== gh && allies.includes(t)) m.progress('shield', Math.min(3, ++shields));
      });
      let beaten = 0;
      const hook = () => {
        for (const f of allies) {
          if (f.beaten || f.hp > f.hpMax * 0.15) continue;
          f.beaten = true;
          beaten++;
          f.controller = CK.scripted();
          f.untargetable = true;
          f.setState('scripted', { pose: 'knockdown', expression: 'ko' });
          b.releaseMeleeToken(f);
          b.emit('allyBeaten', { fighter: f, count: beaten });
          if (beaten === 2) m.say('piccolo', 'They\'re too fast — Gohan, stop holding back!', 3, { style: 'shout' });
        }
      };
      m.tickHooks.push(hook);
      yield () => beaten >= ALLIES_BEATEN || gh.hpFrac <= 0.3;
      CK.removeHook(m, hook);
      off();
      m.complete('stand');
      m.failObjective('shield');
      m.flags.alliesBeaten = beaten;
      m.flags.alliesBeatenNames = Object.keys(S).filter((k) => allies.includes(S[k]) && S[k].beaten);
      b.rules.pressure = null;
      for (const f of b.fighters) if (f !== gh) f.controller = CK.scripted();
      yield 0.6;
    },
  };

  P.sixteen = {
    id: 'sixteen',
    run: function* (m) {
      const b = m.battle;
      CK.prep(m);
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'gh_sixteen');
      m.teach(b.story.gohan, 'form:ssj2');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, 'gh_ssj2_reveal');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'GOHAN\'S TURN', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'cell_gohan',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'Gohan\'s Turn',
    subtitle: 'Earth · Age 767 · a boy who does not want to fight',
    character: 'teen_gohan',
    stage: 'cellarena',
    parTime: 480,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'His father gave up the fight and sent him in. There is something in him he is afraid of. Cell wants to meet it.',
    rewards: ['Story: Super Saiyan 2'],
    setup,
    phases: [P.enter, P.test, P.powers, P.hold, P.crush, P.born, P.juniors, P.sixteen, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.cellGohan = { restore };
})();
