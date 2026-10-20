/*
 * CHAPTER 17 · RESURRECTION OF F — "The Thousand Soldiers" (the invasion: MASTER_SPEC §3, "a large-scale invasion
 * mission"). The first Resurrection of F encounter: Frieza, revived, comes back to Earth with an army. No Golden
 * Frieza and no Super Saiyan Blue here — those belong to the saga's later missions (Goku vs Frieza).
 *
 *   ARRIVAL *    (scene rof_arrival)  the plain outside the city; the army drops out of the sky in ranks; Frieza floats
 *                                     down between Sorbet and Tagoma; Gohan, Piccolo, Krillin and Tien stand in the way —
 *                                     hold them until Goku and Vegeta get back
 *   HORDE *      (play, party)        THE INVASION: the four of them against wave after wave of Frieza's soldiers (gunners,
 *                                     elites); switch heroes; the others fight on as CPU allies. Defeat 32. The whole
 *                                     party down = defeat (retry from here)
 *   TAGOMA *     (play)               Frieza sends his best: base Gohan, years out of practice, against Tagoma — and losing
 *   GOLD         (hold Charge)        Gohan remembers how: SUPER SAIYAN (SL.data.cinematics.ascend)
 *   TURNAROUND * (play)               Super Saiyan Gohan takes Tagoma apart (a knockout here is a real defeat)
 *   TRICK        (cue + staged)       Tagoma lies still; Gohan lowers his guard — and the boot comes up off the ground
 *                                     (Guard: braced or not, he goes down)
 *   BEAM         (staged)             Frieza's finger: the death beam at Gohan — and Piccolo steps into it
 *   AFTER        (scene rof_after)    Gohan's cry; a column of light comes down out of the sky: Goku and Vegeta are back
 * Every phase marked * is a checkpoint.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const C = SL.data.cinematics;
  const CHAPTER = 'CHAPTER 17 · RESURRECTION OF F';

  // TUNING: kills, seconds, story floors, damage multipliers
  const TU = {
    kills: 32, reinforceEvery: 2.2, maxAlive: 9, soldierDealt: 0.5, heroTaken: 0.7,
    tagomaSeconds: 45, gohanFloor: 0.45, tagomaDealt1: 0.7,
    turnSeconds: 50, tagomaFloor: 0.2, tagomaDealt2: 0.45, tagomaTaken2: 0.5, ssjHold: 3,
  };
  // where everybody stands (x, z): the heroes at -z, the army and its officers at +z
  const SPOT = { gohan: [0, -6], piccolo: [-3.5, -8], krillin: [3.4, -8.5], tien: [6.5, -10], frieza: [0, 22], sorbet: [-3, 25], tagoma: [3.2, 20] };
  const at = (b, k, lift) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift || 0);
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));
  // the army in ranks: (x, z) for soldier i
  const rank = (i) => [-12 + (i % 6) * 4.8, 12 + Math.floor(i / 6) * 3.4];
  const ARMY = 18;

  function setup(battle) {
    const b = battle;
    const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: at(b, 'gohan'), startKi: 60 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(b, 'piccolo'), startKi: 60 });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: at(b, 'krillin'), startKi: 60 });
    const tien = b.spawn({ charId: 'tien', team: 0, pos: at(b, 'tien'), startKi: 60 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at(b, 'frieza'), startKi: 0 });
    const sorbet = b.spawn({ charId: 'sorbet', team: 1, pos: at(b, 'sorbet'), startKi: 0 });
    const tagoma = b.spawn({ charId: 'tagoma', team: 1, pos: at(b, 'tagoma'), startKi: 60 });
    K.toForm(frieza, 'final');
    const army = [];
    for (let i = 0; i < ARMY; i++) {
      const [x, z] = rank(i);
      const id = i % 6 === 2 ? 'frieza_elite' : i % 3 === 1 ? 'frieza_gunner' : 'frieza_soldier';
      const def = SL.data.characters[id];
      const skin = def.appearance.skinVariants ? def.appearance.skinVariants[i % def.appearance.skinVariants.length] : undefined;
      const s = b.spawn({ charId: id, team: 1, pos: K.ground(b, new V3(x, 0, z)), startKi: 30, skin, damageDealtMul: TU.soldierDealt });
      s.tags.mission = 'army';
      army.push(s);
    }
    for (const f of [gohan, piccolo, krillin, tien]) K.watcher(f, 'idle', 'serious');
    K.watcher(frieza, 'fz_watch', 'smirk');
    K.watcher(sorbet, 'sb_idle', 'smirk');
    K.watcher(tagoma, 'tg_idle', 'smirk');
    for (const s of army) K.watcher(s, 'idle', 'cold');
    for (const f of [gohan, piccolo, krillin, tien]) K.faceTo(f, new V3(0, 0, 20));
    for (const f of [frieza, sorbet, tagoma, ...army]) K.faceTo(f, new V3(0, 0, -6));
    gohan.cannotDie = true;
    tagoma.cannotDie = true;
    frieza.cannotDie = true;
    b.story = { gohan, piccolo, krillin, tien, frieza, sorbet, tagoma, army };
  }

  /** The officers and the heroes who are not fighting stand and watch. */
  function watchers(m, except) {
    const S = m.battle.story;
    const map = { frieza: ['fz_watch', 'smirk'], sorbet: ['sb_idle', 'smirk'], tagoma: ['tg_idle', 'smirk'], piccolo: ['armsCrossed', 'serious'], krillin: ['idle', 'serious'], tien: ['armsCrossed', 'serious'] };
    for (const k of Object.keys(map)) if (!except.includes(k) && S[k].alive) K.watcher(S[k], map[k][0], map[k][1]);
  }

  /** Clear the field of soldiers (a checkpoint after the horde, or the horde won). */
  function clearArmy(m) {
    const b = m.battle;
    for (const s of b.fighters.slice()) if (s.tags && s.tags.mission && ['army', 'reinforce'].includes(s.tags.mission)) {
      s.setHidden(true);
      s.untargetable = s.intangible = true;
      s.controller = K.scripted();
    }
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    checkpoint: true,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, 'rof_arrival');
    },
  };

  P.horde = {
    id: 'horde',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const heroes = [S.gohan, S.piccolo, S.krillin, S.tien];
      heroes.forEach((f, i) => {
        K.place(f, at(b, ['gohan', 'piccolo', 'krillin', 'tien'][i]), 0);
        K.faceTo(f, new V3(0, 0, 20));
        f.untargetable = f.intangible = false;
        f.hp = f.hpMax;
        f.damageTakenMul = TU.heroTaken;
        f.setState('free');
      });
      // the officers watch from behind the army
      watchers(m, ['piccolo', 'krillin', 'tien']);
      for (const f of [S.frieza, S.sorbet, S.tagoma]) f.untargetable = f.intangible = true;
      // the ranks come at them
      for (const s of S.army) {
        if (!s.alive) continue;
        s.setHidden(false);
        s.untargetable = s.intangible = false;
        s.controller = cpu(b);
        s.setState('free');
      }
      b.switchPlayer(S.gohan, { force: true, quiet: true });
      b.setParty(heroes, {});
      // A HERO WHO GOES DOWN is out of this fight (benched: knocked down, nobody's target, no longer switchable) —
      // the story still needs all four afterwards, so nobody dies here. All four down = DEFEAT (retry from here).
      const downed = new Set();
      for (const f of heroes) f.cannotDie = true;
      const knockOut = (f) => {
        if (downed.has(f) || m.state !== 'running') return;
        downed.add(f);
        f.benched = true;
        f.untargetable = f.intangible = true;
        if (f === b.player) {
          const next = b.nextPartyMember(1);
          if (next) b.switchPlayer(next, { force: true });
        }
        f.controller = K.scripted();
        f.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
        m.say(f === S.krillin ? 'tien' : 'krillin', downed.size >= 3 ? "We can't hold them much longer!" : f.def.name + ' is down!', 2, { style: 'shout' });
        if (downed.size >= heroes.length) m.fail('defeated');
      };
      const hordeFight = m.storyFight({ floors: heroes.map((f) => ({ f, at: 0.02, onFloor: knockOut })) });
      // his Super Saiyan comes back to him against Tagoma, not before
      S.gohan.lockedForms = Object.assign({}, S.gohan.lockedForms, { ssj: true });
      m.music('battle', 2);
      m.title(CHAPTER, 'THE INVASION', 'Gohan · Piccolo · Krillin · Tien — hold the line', 2.6);
      m.objective('army', 'Defeat Frieza\'s soldiers', { icon: 'fist', target: TU.kills });
      m.objective('switch', 'Fight as another hero (switch)', { icon: 'target', optional: true });
      const offS = b.on('playerSwitched', (e) => {
        if (e.to !== S.gohan) m.complete('switch');
      });
      m.onDispose(offS);
      // reinforcements drop out of the sky behind the ranks while the fight lasts
      let sent = S.army.length, n = 0;
      const sp = m.spawner({
        every: TU.reinforceEvery,
        maxAlive: TU.maxAlive,
        while: () => sent < TU.kills,
        spawn: () => {
          n++;
          const id = n % 5 === 0 ? 'frieza_elite' : n % 2 ? 'frieza_gunner' : 'frieza_soldier';
          const x = U.rand(-14, 14), z = U.rand(16, 22);
          const s = m.spawn({ charId: id, team: 1, pos: K.ground(b, new V3(x, 0, z), 12), startKi: 30, tag: 'reinforce', damageDealtMul: TU.soldierDealt });
          s.controller = cpu(b);
          sent++;
        },
      });
      let said = 0;
      m.lock(false);
      b.aiLocked = false;
      yield () => {
        const down = m.kills;
        m.progress('army', Math.min(TU.kills, down));
        if (said === 0 && down >= 6) {
          said = 1;
          m.say('krillin', 'They just keep coming! How many did he bring?!', 2.6);
        } else if (said === 1 && down >= 16) {
          said = 2;
          m.say('piccolo', 'Don\'t let them surround you, Gohan! Back to back!', 2.6);
        } else if (said === 2 && down >= 26) {
          said = 3;
          m.say('frieza', 'Hm. My soldiers really are hopeless.', 2.4);
        }
        return down >= TU.kills || m.state !== 'running';
      };
      sp.stop();
      offS();
      hordeFight.off();
      if (m.state !== 'running') return;
      m.complete('army');
      m.lock(true);
      K.clearCombat(b);
      clearArmy(m);
      // everybody back on their feet for what comes next
      for (const f of heroes) {
        f.damageTakenMul = 1;
        f.benched = false;
        f.untargetable = f.intangible = false;
        f.hp = Math.max(f.hp, f.hpMax * 0.5);
      }
    },
  };

  /** Frieza sends Tagoma; the others are told to stay back (or have no breath left to argue). */
  function duelStage(m) {
    const b = m.battle, S = b.story, g = S.gohan, t = S.tagoma;
    clearArmy(m);
    b.setParty([g], {});
    b.switchPlayer(g, { force: true, quiet: true });
    K.place(g, at(b, 'gohan'), 0);
    K.place(t, K.ground(b, new V3(0, 0, 1)), 0);
    K.faceTo(g, t.pos);
    K.faceTo(t, g.pos);
    K.place(S.piccolo, K.ground(b, new V3(-7, 0, -12)), 0);
    K.place(S.krillin, K.ground(b, new V3(7, 0, -12)), 0);
    K.place(S.tien, K.ground(b, new V3(10, 0, -14)), 0);
    K.place(S.frieza, at(b, 'frieza'), 0);
    for (const f of [S.piccolo, S.krillin, S.tien]) K.faceTo(f, t.pos);
    for (const f of [S.frieza, S.sorbet]) K.faceTo(f, g.pos);
    watchers(m, ['tagoma']);
    t.untargetable = t.intangible = false;
    g.untargetable = g.intangible = false;
  }

  P.tagoma = {
    id: 'tagoma',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, t = S.tagoma;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      duelStage(m);
      m.flags.dueled = true;
      if (g.formIndex !== 0) g.applyForm(0);
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, g.kiMax * 0.5);
      t.hp = t.hpMax;
      // the story owns his Super Saiyan: it comes back to him in the next beat
      g.lockedForms = Object.assign({}, g.lockedForms, { ssj: true });
      SL.Cinema.shotOn(m, { frieza: S.frieza }, { subject: 'frieza', focus: 'upper', angle: 'three' }, 2.8, { cut: true, blendIn: 0 });
      m.say('frieza', 'Tagoma. Show the boy what my army is for.', 2.6);
      yield* m.cine(2.7);
      SL.Cinema.shotOn(m, { tagoma: t }, { subject: 'tagoma', focus: 'upper', angle: 'low' }, 2.4, { cut: true, blendIn: 0 });
      m.say('tagoma', 'With pleasure, Lord Frieza.', 2.2);
      yield* m.cine(2.3);
      m.endShot();
      t.controller = cpu(b, { profile: Object.assign({}, t.def.ai, { aggression: 0.85 }) });
      t.target = g;
      g.target = t;
      t.setState('free');
      g.setState('free');
      const fight = m.storyFight({
        floors: [{ f: g, at: TU.gohanFloor }, { f: t, at: 0.55 }],
        dealt: [{ f: t, mul: TU.tagomaDealt1 }],
        aggression: [{ f: t, value: 0.85 }],
      });
      m.music('battle', 3);
      m.title(CHAPTER, 'TAGOMA', 'Gohan · base form · out of practice', 2.4);
      m.objective('tagoma', 'Fight Tagoma', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t0 = 0;
      const clock = () => {
        if (!b.inputLocked) t0 += 1 / 60;
      };
      m.tickHooks.push(clock);
      let said = false;
      yield () => {
        if (!said && g.hpFrac < 0.7) {
          said = true;
          m.say('piccolo', 'Gohan, you\'re slow! This is what skipping training gets you!', 2.8, { style: 'shout' });
        }
        return fight.floored(g) || t0 > TU.tagomaSeconds || m.state !== 'running';
      };
      K.unhook(m, clock);
      if (m.state !== 'running') return;
      m.complete('tagoma');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      t.setState('scripted', { pose: 'tg_idle', expression: 'smirk' });
      g.setState('scripted', { pose: 'stagger', expression: 'hurt' });
      SL.Cinema.shotOn(m, { tagoma: t }, { subject: 'tagoma', focus: 'upper', angle: 'three' }, 2.6, { cut: true, blendIn: 0 });
      m.say('tagoma', 'This is the son of Son Goku? Pathetic.', 2.6);
      yield* m.cine(2.7);
      SL.Cinema.shotOn(m, { gohan: g }, { subject: 'gohan', focus: 'closeup', angle: 'front' }, 2.8, { cut: true, blendIn: 0 });
      m.say('gohan', 'Not... yet. I still remember how.', 2.6);
      yield* m.cine(2.8);
      m.endShot();
    },
  };

  P.gold = {
    id: 'gold',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, t = S.tagoma;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (!m.flags.dueled) duelStage(m);
      m.flags.dueled = true;
      t.controller = K.scripted();
      t.setState('scripted', { pose: 'tg_idle', expression: 'smirk' });
      if (g.formIndex !== 0) g.applyForm(0);
      g.ki = g.kiMax;
      m.objective('gold', 'Super Saiyan: hold Charge', { icon: 'transform' });
      yield* C.ascend(m, {
        fighter: g, form: 'ssj', witness: t, seconds: TU.ssjHold,
        label: 'Hold Charge — Super Saiyan', meter: 'SUPER SAIYAN', music: 3,
        witnessLine: 'What... his hair...?!',
      });
      m.complete('gold');
    },
  };

  P.turnaround = {
    id: 'turnaround',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, t = S.tagoma;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (!m.flags.dueled) duelStage(m);
      m.flags.dueled = true;
      K.toForm(g, 'ssj');
      g.hp = Math.max(g.hp, g.hpMax * 0.8);
      g.ki = Math.max(g.ki, g.kiMax * 0.7);
      t.hp = Math.max(t.hp, t.hpMax * 0.9);
      t.controller = cpu(b, { profile: Object.assign({}, t.def.ai, { aggression: 0.75 }) });
      t.target = g;
      g.target = t;
      t.setState('free');
      g.setState('free');
      b.switchPlayer(g, { force: true, quiet: true });
      // no story floor on Gohan here: a knockout is a real defeat (retry from this checkpoint)
      g.cannotDie = false;
      const fight = m.storyFight({
        floors: [{ f: t, at: TU.tagomaFloor }],
        dealt: [{ f: t, mul: TU.tagomaDealt2 }],
        taken: [{ f: t, mul: TU.tagomaTaken2 }],
        ease: { foe: t, hero: g, below: 0.5, min: 0.5 },
      });
      m.music('battle', 4);
      m.title(CHAPTER, 'THE SON OF GOKU', 'Super Saiyan Gohan', 2.4);
      m.objective('turn', 'Take Tagoma apart', { icon: 'fist' });
      m.objective('combo', 'Land a 6-hit combo', { icon: 'fist', optional: true });
      m.lock(false);
      b.aiLocked = false;
      let t0 = 0;
      const clock = () => {
        if (!b.inputLocked) t0 += 1 / 60;
        if (g.stats.maxCombo >= 6) m.complete('combo');
      };
      m.tickHooks.push(clock);
      yield () => fight.floored(t) || t0 > TU.turnSeconds || m.state !== 'running';
      K.unhook(m, clock);
      g.cannotDie = true;
      if (m.state !== 'running') return;
      m.complete('turn');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /** Tagoma down, Gohan standing over him with his guard dropped — and the boot comes up off the ground. */
  P.trick = {
    id: 'trick',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, t = S.tagoma;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (!m.flags.dueled) duelStage(m);
      K.toForm(g, 'ssj');
      g.controller = K.scripted();
      t.controller = K.scripted();
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      // Tagoma face down; Gohan walks up to him
      const tp = K.ground(b, new V3(U.clamp(t.pos.x, -10, 10), 0, U.clamp(t.pos.z, -4, 10)));
      K.place(t, tp, 0);
      t.setState('scripted', { pose: 'tg_down', expression: 'ko' });
      K.place(g, K.ground(b, tp.clone().add(new V3(0, 0, -1.6))), 0);
      K.faceTo(g, t.pos);
      g.setState('scripted', { pose: 'idle', expression: 'calm' });
      SL.Cinema.shotOn(m, { gohan: g }, { subject: 'gohan', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gohan', 'It\'s over. Get up and leave — take the rest of them with you.', 3.2);
      yield* wait(3.2);
      // the guard comes down: a low shot past Tagoma's still hand
      m.shot((tt, out) => {
        const d = g.pos.clone().sub(t.pos).setY(0).normalize();
        const s = new V3(d.z, 0, -d.x);
        out.pos.copy(t.pos).addScaledVector(d, -1.2).addScaledVector(s, 1.4).add(new V3(0, 0.35, 0));
        out.look.copy(g.chest());
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      t.setState('scripted', { pose: 'tg_sneak', expression: 'grin', speed: 30 });
      b.sfx('swing', t, { pitch: 0.7 });
      const r = skip.on ? { pressed: false } : yield* m.cue('guard', 'Look out — Guard!', { auto: 1.1, slow: 0.25 });
      m.qteParts.push(r.pressed ? 1 : 0.5);
      // braced or not, it lands: years out of practice
      g.setState('scripted', { pose: r.pressed ? 'guardHit' : 'hitHeavy', expression: 'hurt', speed: 24 });
      b.vfx.impact(g.chest(), r.pressed ? 2 : 3, 0xc89aff);
      b.sfx('punchHeavy', g, { pitch: 0.7, vol: 1.2 });
      b.cameraTraumaAt(g.chest(), 0.6);
      const from = g.pos.clone(), dir = g.pos.clone().sub(t.pos).setY(0).normalize();
      const to = K.ground(b, from.clone().addScaledVector(dir, r.pressed ? 3 : 5));
      // real time (the cue's slow motion is still easing off): a short, hard flight back
      const k0 = performance.now();
      yield () => {
        const k = Math.min(1, (performance.now() - k0) / 420);
        K.place(g, from.clone().lerp(to, 1 - Math.pow(1 - k, 2)), g.yaw);
        return k >= 1 || skip.on;
      };
      K.place(g, to, g.yaw);
      // the gold goes out of him as he hits the ground
      g.applyForm(0);
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
      b.stage.crater(to.clone(), 2.4, 0.5, null);
      t.setState('scripted', { pose: 'tg_idle', expression: 'grin' });
      // in front of him, low: the grin over the boy on the ground
      m.shot((tt, out) => {
        const f = t.forward.clone().setY(0).normalize();
        out.pos.copy(t.chest()).addScaledVector(f, 3).addScaledVector(new V3(f.z, 0, -f.x), 0.8).add(new V3(0, -0.6, 0));
        out.look.copy(t.headPos());
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: t });
      m.say('tagoma', 'Rule one, Saiyan: never turn your back on an enemy who is still breathing.', 3.4);
      yield* wait(3.4);
      m.endShot();
      b.skipRequested = false;
    },
  };

  /** Frieza's finger: the death beam at the boy on the ground — and Piccolo steps into it. */
  P.beam = {
    id: 'beam',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, pc = S.piccolo, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      if (!m.flags.dueled) duelStage(m);
      if (g.formIndex !== 0) g.applyForm(0);
      g.controller = K.scripted();
      pc.controller = K.scripted();
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
      // Frieza a little closer, a finger raised
      K.place(fz, K.ground(b, g.pos.clone().add(new V3(2, 0, 12))), 0);
      K.faceTo(fz, g.pos);
      fz.setState('scripted', { pose: 'twoFingers', expression: 'smirk' });
      SL.Cinema.shotOn(m, { frieza: fz }, { subject: 'frieza', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Goodbye, son of Son Goku.', 2.2);
      yield* wait(2.2);
      // Piccolo between them
      const mid = g.pos.clone().lerp(fz.pos, 0.18);
      K.place(pc, K.ground(b, mid), 0);
      K.faceTo(pc, fz.pos);
      pc.setState('scripted', { pose: 'v_braced', expression: 'angry' });
      b.vfx.afterimage(pc.pos, pc.height, 0x6ad86a);
      const tip = fz.handPos ? fz.handPos('R') : fz.chest();
      const hit = pc.chest();
      b.vfx.slash(tip, hit, 0xff4ac8, 0.5, 0.06);
      b.vfx.flash(hit, 1.4, 0xff6ad8, 0.3, SL.Toon.tex.glow);
      b.sfx('beamFire', fz, { pitch: 1.6, vol: 0.8 });
      b.slowmo(0.25, 1.2);
      m.shot((t, out) => {
        const tw = SL.Cinema.twoShot(pc, g, { fov: 42, pad: 1.4, lookUp: 0.1 });
        out.pos.copy(tw.pos);
        out.look.copy(tw.look);
        out.fov = tw.fov;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* wait(1.2);
      pc.setState('scripted', { pose: 'knockdownFace', expression: 'ko', speed: 10 });
      b.sfx('groundImpact', pc, { vol: 0.6 });
      yield* wait(1.2);
      fz.setState('scripted', { pose: 'fz_watch', expression: 'smirk' });
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      // a direct start (Developer Menu) gets the beam's end state: the field clear, Piccolo down in front of Gohan
      if (!m.flags.dueled) {
        duelStage(m);
        K.place(S.piccolo, K.ground(b, S.gohan.pos.clone().add(new V3(0, 0, 2))), 0);
      }
      clearArmy(m);
      S.piccolo.controller = K.scripted();
      S.piccolo.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      S.gohan.controller = K.scripted();
      if (S.gohan.formIndex !== 0) S.gohan.applyForm(0);
      K.faceTo(S.frieza, S.gohan.pos);
      yield* SL.Cinema.play(m, 'rof_after');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(CHAPTER, 'THE THOUSAND SOLDIERS', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'rof_invasion',
    canon: true,
    chapter: CHAPTER,
    title: 'The Thousand Soldiers',
    subtitle: 'Resurrection of F · the invasion',
    character: 'adult_gohan',
    stage: 'plains',
    parTime: 600,
    qteLabel: 'The trick',
    // Gohan at Age 779 is years out of practice: Super Saiyan, nothing beyond it
    lockForms: { adult_gohan: ['ssj2', 'ultimate'] },
    rules: { allowTransform: true, allowUltimates: true },
    // the gi Piccolo dresses him in for the fight
    appearance: { adult_gohan: { outfit: 'ag_tournament' } },
    blurb: 'Frieza is alive again — and he has brought an army to Earth. Goku and Vegeta are on Beerus\' planet. Somebody has to hold the line.',
    rewards: ['Story: Resurrection of F begins'],
    setup,
    phases: [P.arrival, P.horde, P.tagoma, P.gold, P.turnaround, P.trick, P.beam, P.after],
  };

  SL.data.rofInvasion = { TU, SPOT };
  SL.data.missions[def.id] = def;
})();
