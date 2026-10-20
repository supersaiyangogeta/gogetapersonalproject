/*
 * MOVIE: FUSION REBORN (not canon) — mission 4 of 7: "The Dictator"   (Earth, at the same time as "Son of
 * Goku" and the fight in the Other World)
 *
 *   OPEN    (scene fr_dictator)   "Achtung!" — a dead dictator on top of his tank with an army behind him;
 *                                 "you can't call dibs on a whole country!"; "Ready, aim, fire!"
 *   TANKS * (play)                KID TRUNKS (Goten at his side): the tanks are real — they drive round the
 *                                 square, swing their turrets onto you, flash and draw a red line before they
 *                                 fire (move!), and a heavy blow sends one SLIDING: knock one into another and
 *                                 both go up. Riflemen pop at you from the sides. "Hey! Broom lip!"
 *   GOLD    (scenes + play)       "Let's give him a little scare": both boys go Super Saiyan (the player's
 *                                 Transform), and the Dictator wants to recruit them
 *   FINISH * (play)               the rest of the armour and the command tank; the Dictator on his backside;
 *                                 "Are we inferior?" — and he runs
 *
 * Comedy, not violence: tanks become smoking wrecks; soldiers are knocked down, not killed on screen.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;

  const BY = { goldAt: 4, soldiers: 6 };
  const TANKS = [
    [0, -34, 0], [-18, -16, 0.6], [18, -16, -0.6], [-26, 4, 1.2], [26, 4, -1.2], [-14, 22, 2.2], [14, 22, -2.2], [0, -8, 0],
  ];
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  function setup(battle) {
    const b = battle;
    const at = (x, z) => FR.at(b, x, z);
    const trunks = b.spawn({ charId: 'kid_trunks', player: true, team: 0, pos: at(1.4, 26), startKi: 80 });
    const goten = b.spawn({ charId: 'goten', team: 0, pos: at(-1.4, 26), startKi: 80 });
    const dictator = b.spawn({ charId: 'dictator', team: 1, pos: at(0, -34), startKi: 0 });
    dictator.noCollide = true;
    dictator.cannotDie = true;
    K.watcher(dictator, 'dt_idle', 'smirk');
    const soldiers = [];
    for (let i = 0; i < BY.soldiers; i++) {
      const s = b.spawn({ charId: 'dead_soldier', team: 1, pos: at((i % 2 ? 1 : -1) * (30 + (i % 3) * 4), -10 + i * 5), startKi: 40, damageDealtMul: 0.5 });
      K.watcher(s, 'sd_idle', 'angry');
      soldiers.push(s);
    }
    K.watcher(goten, 'idle', 'grin');
    for (const f of [dictator, ...soldiers]) FR.halo(b, f);
    K.faceTo(trunks, dictator.pos);
    K.faceTo(goten, dictator.pos);
    b.story = { trunks, goten, dictator, soldiers, armour: null };
  }

  /** The Dictator rides the command tank (until there is no tank to ride). */
  function ride(m) {
    const b = m.battle, S = b.story;
    const hook = () => {
      const A = S.armour, d = S.dictator;
      if (!A || d.hidden) return;
      const ct = A.tanks[0];
      if (!ct || !ct.pr.alive) return;
      const p = ct.pr.pos.clone().add(new V3(0, 0.95, 0));
      d.setPosition(p);
      d.grounded = false;
      d.vel.set(0, 0, 0);
      if (b.player) K.faceTo(d, b.player.pos);
    };
    m.tickHooks.push(hook);
    return () => K.unhook(m, hook);
  }

  function ensureArmour(m) {
    const b = m.battle, S = b.story;
    if (S.armour) return S.armour;
    S.armour = FR.armour(m, {
      positions: TANKS,
      command: 0,
      hp: 4000,
      reload: 4.8,
      knockAt: 420,
      targets: () => [S.trunks, S.goten].filter((f) => f.alive && !f.hidden),
    });
    return S.armour;
  }

  function freeSoldiers(m) {
    const b = m.battle, S = b.story;
    for (const s of S.soldiers) {
      if (!s.alive) continue;
      s.untargetable = false;
      s.intangible = false;
      s.controller = cpu(b);
      s.setState('free');
    }
  }

  function arm(m) {
    const b = m.battle, S = b.story;
    b.switchPlayer(S.trunks, { force: true });
    b.setParty([S.trunks, S.goten], { allyDifficulty: 'normal' });
    for (const f of [S.trunks, S.goten]) {
      f.untargetable = false;
      f.intangible = false;
      f.cannotDie = false;
      f.setState('free');
    }
    S.goten.cannotDie = true;
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      ensureArmour(m);
      ride(m);
      yield* SL.Cinema.play(m, 'fr_dictator');
      // the first volley, all at once
      for (const [i, tk] of b.story.armour.tanks.entries()) tk.wait = 0.2 + i * 0.25;
    },
  };

  P.tanks = {
    id: 'tanks',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      const A = ensureArmour(m);
      if (!m.flags.riding) {
        m.flags.riding = true;
        ride(m);
      }
      arm(m);
      freeSoldiers(m);
      S.trunks.lockedForms = Object.assign({}, S.trunks.lockedForms, { ssj: true });
      S.goten.lockedForms = Object.assign({}, S.goten.lockedForms, { ssj: true });
      m.music('dictator_march', 2);
      const others = A.tanks.filter((t) => !t.command);
      m.objective('tanks', 'Wreck the tanks', { icon: 'fist', target: others.length });
      m.objective('pile', 'Knock one tank into another', { icon: 'rush', optional: true });
      m.prompt('frTankHeavy', 'heavy', 'Heavy blow: send a tank sliding', { always: true, until: () => A.pileups > 0 || A.destroyed > 2 });
      m.say('dictator', 'Get them! Schnell!', 1.8, { style: 'shout' });
      b.after(160, () => m.say('kid_trunks', 'That little maniac is trying to kill us.', 2.4));
      const lines = { first: false, kid: false, wow: false };
      const offT = b.on('tankDestroyed', () => {
        if (!lines.first) {
          lines.first = true;
          m.say('kid_trunks', 'Hey! Broom lip! See if you can hit me now!', 2.6, { style: 'shout' });
          b.after(170, () => m.say('dictator', 'Run him down! Kill him!', 2, { style: 'shout' }));
        }
      });
      const offP = b.on('tankPileup', () => {
        m.complete('pile');
        if (!lines.wow) {
          lines.wow = true;
          m.say('goten', 'Wow.', 1.2);
          // Goten bounces off a loose tyre for the fun of it
          const g = S.goten;
          if (g.grounded && g.state === 'free') {
            g.vel.y = 9;
            g.grounded = false;
            b.sfx('boing', g, { pitch: 1.3, vol: 0.6 });
          }
        }
      });
      const offH = b.on('damage', (e) => {
        if (e.target === S.trunks && e.source === 'Tank shell' && !lines.kid) {
          lines.kid = true;
          m.say('kid_trunks', 'Hey! Shame on you! I\'m just a kid!', 2.4, { style: 'shout' });
        }
      });
      m.onDispose(offT);
      m.onDispose(offP);
      m.onDispose(offH);
      m.lock(false);
      b.aiLocked = false;
      yield () => {
        const down = others.filter((t) => !t.pr.alive).length;
        m.progress('tanks', down);
        return down >= BY.goldAt || m.state !== 'running';
      };
      offT();
      offH();
      m.flags.pileOff = offP;
      if (m.state !== 'running') return;
      // "Let's give him a little scare"
      m.lock(true);
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'fr_boys_gold');
      for (const f of [S.trunks, S.goten]) {
        if (f.lockedForms) delete f.lockedForms.ssj;
        f.ki = Math.max(f.ki, f.kiMax * 0.7);
      }
      m.teach(S.trunks, 'form:ssj');
      m.objective('gold', 'Super Saiyan', { icon: 'transform', target: 1 });
      const onlyTf = Object.assign({}, SL.Mission.ALL_OFF);
      delete onlyTf.transform;
      m.limits(onlyTf);
      m.prompt('frBoysGold', 'transform', 'Transform', { required: true, when: () => S.trunks.formIndex === 0 && S.trunks.state === 'free', always: true });
      b.inputLocked = false;
      b.aiLocked = true;
      S.trunks.setState('free');
      yield () => (S.trunks.formIndex > 0 && S.trunks.state !== 'transform') || m.state !== 'running';
      m.limits(null);
      m.complete('gold');
      // Goten goes gold with him
      const gi = K.formIndex(S.goten, 'ssj');
      if (gi > 0 && S.goten.formIndex !== gi) {
        S.goten.applyForm(gi);
        b.vfx.flash(S.goten.chest(), 3, 0xffd23a, 0.3, SL.Toon.tex.glow);
        b.vfx.ring(S.goten.chest(), 3, 0xffd23a, 0.4);
        b.sfx('transformBurst', S.goten, { pitch: 1.4 });
      }
      m.lock(true);
      yield* SL.Cinema.play(m, 'fr_dictator_shock');
    },
  };

  P.finish = {
    id: 'finish',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      const A = ensureArmour(m);
      if (!m.flags.riding) {
        m.flags.riding = true;
        ride(m);
      }
      arm(m);
      freeSoldiers(m);
      for (const f of [S.trunks, S.goten]) K.toForm(f, 'ssj');
      if (!m.flags.pileOff) {
        const off = b.on('tankPileup', () => m.complete('pile'));
        m.onDispose(off);
      }
      // from a checkpoint the first four are already wrecks
      const others = A.tanks.filter((t) => !t.command);
      if (others.filter((t) => !t.pr.alive).length < BY.goldAt) for (const t of others.slice(0, BY.goldAt)) if (t.pr.alive) b.stage.damageProp(t.pr, 99999, S.trunks);
      m.music('dictator_march', 3);
      m.objective('rest', 'Wreck the rest of the armour — and the command tank', { icon: 'fist', target: A.tanks.filter((t) => t.pr.alive).length });
      if (!m.objectives.find((o) => o.id === 'pile')) m.objective('pile', 'Knock one tank into another', { icon: 'rush', optional: true });
      const start = A.tanks.filter((t) => t.pr.alive).length;
      m.lock(false);
      b.aiLocked = false;
      yield () => {
        const left = A.tanks.filter((t) => t.pr.alive).length;
        m.progress('rest', start - left);
        return left === 0 || m.state !== 'running';
      };
      if (m.state !== 'running') return;
      m.complete('rest');
      m.lock(true);
      K.clearCombat(b);
      A.stop();
      for (const s of S.soldiers) {
        if (!s.alive) continue;
        s.controller = K.scripted();
        s.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      }
      // the Dictator, thrown off the last wreck onto his backside
      const d = S.dictator;
      const ct = A.tanks[0];
      const land = FR.at(b, ct.pr.pos.x + 3, ct.pr.pos.z + 4);
      K.place(d, land, 0);
      d.noCollide = false;
      K.faceTo(d, S.trunks.pos);
      for (const f of [S.trunks, S.goten]) {
        K.place(f, FR.at(b, land.x + (f === S.trunks ? 2 : -2), land.z + 6), 0);
        K.faceTo(f, d.pos);
        f.controller = K.scripted();
        f.setState('scripted', { pose: 'idle', expression: 'grin' });
      }
      yield* SL.Cinema.play(m, 'fr_boys_end');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(FR.CHAPTER, 'THE DICTATOR', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'fr_boys',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'The Dictator',
    subtitle: 'The old capital · not canon',
    character: 'kid_trunks',
    stage: 'old_capital',
    parTime: 360,
    lockForms: FR.LOCKS,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'A dead dictator, an army of tanks, and two eight-year-olds who think the whole thing is hilarious.',
    rewards: ['Movie: Earth\'s Chaos'],
    setup,
    phases: [P.open, P.tanks, P.finish, P.after],
  };

  SL.data.frBoys = { BY, TANKS };
  SL.data.missions[def.id] = def;
})();
