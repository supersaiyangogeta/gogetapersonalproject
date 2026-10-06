/*
 * CHAPTER 10 — BUU SAGA: MAJIN
 * Mission "Majin Buu" (canon; played as Gohan). The ball, the awakening, and the first fight
 * against a body that does not stay broken.
 *
 *   BALL    (scene)      the crater: the ball filling with a fight happening somewhere else
 *   DEMON   (checkpoint) Gohan against Dabura again, with the seal breaking on a clock he cannot
 *                         stop (the energy is coming from Goku and Vegeta, miles away)
 *   HATCH   (scene)      silence, smoke, a shape far too big — and then him, and the Supreme Kai
 *                         flying across the crater before anybody saw Buu move
 *   BUU     (checkpoint) the first Buu fight: punches sink into him, wounds close while you
 *                         watch, and when you finally blow him apart the pieces crawl back.
 *                         Then he stops playing
 *   BEATEN  (scene)      Gohan put into the ground; the Demon King who will not kneel, made into
 *                         candy and eaten; the stone lifts from Piccolo and Krillin
 *
 * Gohan cannot be killed here (the story needs him beaten, not dead); Dabura and Buu cannot be
 * finished (the story is not done with either).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const FIELD = new V3(0, 0, -58);
  const BALL = new V3(-14, 0, -80);
  const SIPHON_FROM = new V3(260, 90, 220);
  const SEAL_SECONDS = 70;
  const DABURA_TO = 0.2;
  const BUU_SURVIVE = 30;

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, FIELD.clone().add(new V3(x, 0, z)));
    const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: at(0, 4), startKi: 100 });
    const dabura = b.spawn({ charId: 'dabura', team: 1, pos: at(-3, -10), startKi: 100, tags: { boss: true, priority: true } });
    const kai = b.spawn({ charId: 'supreme_kai', team: 0, pos: at(6, 8) });
    const kibito = b.spawn({ charId: 'kibito', team: 0, pos: at(8.5, 9.5) });
    const babidi = b.spawn({ charId: 'babidi', team: 1, pos: K.ground(b, BALL.clone().add(new V3(6, 0, 3))) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(-9, 10) });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: at(-11.5, 11) });
    const buu = b.spawn({ charId: 'majin_buu', team: 1, pos: K.ground(b, BALL), startKi: 160, tags: { boss: true, priority: true } });
    K.watcher(kai, 'sk_idle', 'grit');
    K.watcher(kibito, 'kb_idle', 'grit');
    K.watcher(babidi, 'bb_cast', 'grin');
    K.statue(piccolo);
    K.statue(krillin);
    // he is not out yet
    buu.controller = K.scripted();
    buu.setHidden(true);
    buu.untargetable = true;
    buu.intangible = true;
    dabura.controller = K.scripted();
    gohan.lockedForms = {};
    K.toForm(gohan, 'ssj2');
    b.story = { gohan, dabura, kai, kibito, babidi, piccolo, krillin, buu, siphonFrom: SIPHON_FROM };
    b.story.ball = K.buuBall(b, BALL, 4.2);
  }

  function faceUp(b) {
    const S = b.story;
    K.faceTo(S.gohan, S.dabura.pos);
    K.faceTo(S.dabura, S.gohan.pos);
    K.faceTo(S.kai, S.gohan.pos);
    K.faceTo(S.kibito, S.gohan.pos);
    K.faceTo(S.babidi, S.gohan.pos);
  }

  const P = {};

  P.ball = {
    id: 'ball',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      faceUp(b);
      S.ball.charge(0.35);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'buu_ball');
    },
  };

  /** Dabura again, with the seal breaking on a clock nobody on this field controls. */
  P.demon = {
    id: 'demon',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, d = S.dabura;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.place(g, K.ground(b, FIELD.clone().add(new V3(0, 0, 4))));
      K.place(d, K.ground(b, FIELD.clone().add(new V3(-3, 0, -10))));
      faceUp(b);
      K.toForm(g, 'ssj2');
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      g.cannotDie = true;
      g.damagePlan = [{ level: 1, below: 0.6 }];
      d.hp = Math.round(d.hpMax * 0.58); // he is where The Demon King left him: angry, and in his second phase
      d.cannotDie = true;
      d.damageDealtMul = 0.8;
      m.music('finale', 5);
      m.objective('dabura', 'Get past Dabura', { icon: 'fist', target: Math.round((0.58 - DABURA_TO) * 100) });
      m.objective('seal', 'The seal: it cannot be stopped from here', { icon: 'clock', target: 100 });
      m.objective('beatDabura', 'Beat Dabura before the seal breaks', { icon: 'skull', optional: true });
      if (b.player !== g) b.switchPlayer(g, { force: true });
      g.target = d;
      d.target = g;
      d.controller = new SL.AIController(b, { difficulty: 'hard' });
      g.setState('free');
      d.setState('free');
      m.lock(false);
      let t = 0, beaten = false;
      const start = d.hpMax * 0.58;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        const seal = U.clamp01(t / SEAL_SECONDS);
        S.ball.charge(0.35 + seal * 0.6);
        K.siphonTick(b, SIPHON_FROM, S.ball.pos);
        m.progress('seal', Math.floor(seal * 100));
        m.progress('dabura', Math.max(0, Math.round(((start - d.hp) / d.hpMax) * 100)));
        if (!beaten && d.hpFrac <= DABURA_TO) {
          beaten = true;
          m.complete('beatDabura');
        }
        if (b.frame % 360 === 0 && seal > 0.2 && seal < 0.95) m.say('supreme_kai', seal < 0.6 ? 'It is still filling. Goku and Vegeta are still fighting!' : 'Gohan — it is almost full!', 2.6, { kind: 'bark' });
      };
      m.tickHooks.push(hook);
      yield () => beaten || t >= SEAL_SECONDS;
      K.unhook(m, hook);
      if (!beaten) m.failObjective('beatDabura');
      m.complete('dabura');
      m.flags.sealSeconds = Math.round(t);
      m.flags.daburaBeaten = beaten;
      m.qteParts.push(beaten ? 1 : U.clamp01(1 - d.hpFrac));
      m.lock(true);
      K.clearCombat(b);
      d.controller = K.scripted();
      d.setState('scripted', { pose: beaten ? 'defeatKneel' : 'db_idle', expression: beaten ? 'hurt' : 'angry' });
      // Babidi: it is ready either way
      S.ball.charge(1);
      m.shot((t2, out) => K.camAt(out, S.babidi.chest().clone().add(new V3(2.4, 0.6, 3)), S.babidi.chest().add(new V3(0, 0.3, 0)), 40), 2.8, { cut: true, blendIn: 0 });
      m.say('babidi', beaten ? 'Useless demon! No matter — it is FULL!' : 'Hee hee hee! It is FULL!', 2.8, { style: 'shout' });
      yield* m.cine(2.8);
      m.endShot();
    },
  };

  P.hatch = {
    id: 'hatch',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      S.ball.charge(1);
      K.faceTo(S.gohan, S.ball.pos);
      K.faceTo(S.kai, S.ball.pos);
      yield* SL.Cinema.play(m, 'buu_hatch');
    },
  };

  /** Restore what the awakening leaves behind (a restart from the Buu fight). */
  function afterHatch(b) {
    const S = b.story;
    if (!S.ball.opened) {
      S.ball.charge(1);
      S.ball.open();
    }
    const buu = S.buu;
    buu.setHidden(false);
    buu.untargetable = false;
    buu.intangible = false;
    buu.model.root.scale.setScalar(buu.model.baseScale);
    // the Supreme Kai where Buu put him, and the Demon King standing aside, hurt
    S.kai.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
    const beaten = b.mission && b.mission.flags.daburaBeaten;
    K.watcher(S.dabura, beaten ? 'defeatKneel' : 'db_idle', beaten ? 'hurt' : 'angry');
  }

  /** The first Buu fight: nothing you know works the way it should. */
  P.buu = {
    id: 'buu',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      afterHatch(b);
      K.place(g, K.ground(b, FIELD.clone().add(new V3(-2, 0, -4))));
      K.place(buu, K.ground(b, FIELD.clone().add(new V3(-6, 0, -14))));
      K.faceTo(g, buu.pos);
      K.faceTo(buu, g.pos);
      K.toForm(g, 'ssj2');
      g.hp = Math.max(g.hp, g.hpMax * 0.8);
      g.ki = 100;
      g.cannotDie = true;
      g.damageDealtMul = 1.1;
      g.damagePlan = [{ level: 1, below: 0.8 }, { level: 2, below: 0.5 }];
      buu.hp = buu.hpMax;
      buu.mech.maxReforms = Infinity; // the story is not done with him
      buu.mech.breakIdx = 0;
      buu.mech.reforms = 0;
      buu.damageDealtMul = 0.55;
      m.music('finale', 6);
      m.objective('hurt', 'Hurt him', { icon: 'fist', target: 50 });
      if (b.player !== g) b.switchPlayer(g, { force: true });
      g.target = buu;
      buu.target = g;
      buu.controller = new SL.AIController(b, { difficulty: 'normal' });
      g.setState('free');
      buu.setState('free');
      m.lock(false);
      let apart = false, reformed = false, t = 0;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter !== buu || apart) return;
        apart = true;
        m.complete('hurt');
        m.say('adult_gohan', 'Got him...!', 1.6);
      });
      const offR = b.on('buuReformed', (e) => {
        if (e.fighter !== buu || reformed) return;
        reformed = true;
        m.say('supreme_kai', 'He... he put himself back together.', 2.8, { style: 'quiet' });
        m.objective('stay', 'He does not stay down. Hold on', { icon: 'clock', target: BUU_SURVIVE });
      });
      const offW = b.on('buuWound', () => (m.flags.wounds = (m.flags.wounds || 0) + 1));
      const offG = b.on('buuGut', () => (m.flags.gutHits = (m.flags.gutHits || 0) + 1));
      const hook = () => {
        if (!apart) m.progress('hurt', Math.min(50, Math.round((1 - buu.hpFrac) * 100)));
        if (reformed && !b.inputLocked) {
          t += 1 / 60;
          m.progress('stay', Math.min(BUU_SURVIVE, Math.floor(t)));
        }
      };
      m.tickHooks.push(hook);
      // a player who cannot find the way in does not fight forever: past a minute and a half he
      // simply stops playing (the scene is the same either way)
      let total = 0;
      const clock = () => (total += b.inputLocked ? 0 : 1 / 60);
      m.tickHooks.push(clock);
      yield () => (reformed && t >= BUU_SURVIVE) || g.hpFrac < 0.2 || total > 90;
      K.unhook(m, hook);
      K.unhook(m, clock);
      offA();
      offR();
      offW();
      offG();
      m.flags.buuReforms = buu.mech.reforms;
      m.flags.buuBrokenApart = apart;
      if (reformed) m.complete('stay');
      m.qteParts.push(apart ? 1 : 0.4);
      m.lock(true);
      K.clearCombat(b);
      buu.controller = K.scripted();
      if (buu.mech.apart) {
        // he is in pieces when the phase ends: let him finish coming back first
        yield () => !buu.mech.apart;
      }
      buu.setState('free');
      yield* SL.Cinema.play(m, 'buu_beats_gohan');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'MAJIN BUU', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_awakening',
    canon: true,
    chapter: 'CHAPTER 10 · BUU SAGA',
    title: 'Majin Buu',
    subtitle: 'Earth · Age 774 · what was in the ball',
    character: 'adult_gohan',
    stage: 'babidi_crater',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The fight between Goku and Vegeta was feeding something. It is awake now, it is round and it is laughing, and nothing you hit it with stays done.',
    rewards: ['Majin Buu appears'],
    setup,
    phases: [P.ball, P.demon, P.hatch, P.buu, P.after],
  };

  SL.data.missions[def.id] = def;
})();
