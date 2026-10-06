/*
 * CHAPTER 10 — BUU SAGA: MAJIN (first mission)
 * Mission "The Mark" (canon; played as Vegeta, then as Goku).
 *
 * Rebuilt 2026-09-24 (the owner's Buu continuation prompt: "build toward Majin Vegeta, do not
 * rush it; the player should understand the tension"). The first version was a short duel on a
 * wasteland; that fight is now its own mission ("Prince of Saiyans"), and this one plays the
 * canon order of the day:
 *
 *   SPELL   (scene majin_spell)   the crater; Babidi reaches into him, and he fights it
 *   RESIST  (checkpoint, as Vegeta) a struggle the player can win — until he stops wanting to.
 *           Memories come up while he pushes (Kakarot passing him, Kakarot again, Bulma and
 *           Trunks), and at the top of it the bar turns over by itself: he lets it in
 *   MARK    the Majin transformation, staged, and the Majin who answers to nobody (majin_awake)
 *   STANDS  (scene, after Babidi's teleport to the tournament) the blast into the crowd
 *   STOP    (checkpoint, as Goku) he aims at a second section: reach him in time and the blast
 *           goes into the sky; too slow and it does not (a consequence, not a failure)
 *   AGREE   "Somewhere nobody else can get hurt." — and Babidi sends them to the wastes
 *
 * The locations change inside the mission (Battle.changeStage, through buuKit.teleport), so the
 * day plays as one piece: crater → tournament → wastes.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // the crater in front of Babidi's ship (hatch at z ≈ -92)
  const FIELD = new V3(0, 0, -64);
  const STANDS_A = new V3(0, 4.2, 36.5);
  const STANDS_B = new V3(36.5, 4.2, 6);
  const STOP_SECONDS = 5;

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, FIELD.clone().add(new V3(x, 0, z)));
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: at(0, -4), startKi: 100 });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: at(-4, 6), startKi: 100 });
    const gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: at(3, 7) });
    const kai = b.spawn({ charId: 'supreme_kai', team: 0, pos: at(6, 8) });
    const kibito = b.spawn({ charId: 'kibito', team: 0, pos: at(8.5, 9) });
    const babidi = b.spawn({ charId: 'babidi', team: 1, pos: K.ground(b, (b.stage.landmarks && b.stage.landmarks.hatch) || at(0, -26)) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(-8, 10) });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: at(-10.5, 11) });
    for (const f of [goku, gohan, kai, kibito, babidi]) K.watcher(f, 'idle', 'calm');
    K.watcher(kai, 'sk_idle', 'grit');
    K.watcher(kibito, 'kb_idle', 'grit');
    K.watcher(babidi, 'bb_idle', 'grin');
    // Dabura's spit: they have been stone since the ship landed
    K.statue(piccolo);
    K.statue(krillin);
    vegeta.lockedForms = { majin: true };
    K.toForm(vegeta, 'ssj');
    goku.lockedForms = {};
    b.story = { goku, vegeta, gohan, kai, kibito, babidi, piccolo, krillin };
  }

  /** Face the heroes at the ship, the ship at the heroes. */
  function stageCrater(b) {
    const S = b.story;
    K.place(S.vegeta, K.ground(b, FIELD.clone().add(new V3(0, 0, -4))), Math.PI);
    for (const f of [S.goku, S.gohan, S.kai, S.kibito]) K.faceTo(f, S.vegeta.pos);
    K.faceTo(S.babidi, S.vegeta.pos);
    K.faceTo(S.vegeta, S.babidi.pos);
  }

  /** Only Goku and Vegeta go to the tournament: the rest stay behind at the ship. */
  function leaveBehind(b) {
    const S = b.story;
    for (const f of [S.gohan, S.kai, S.kibito, S.babidi, S.piccolo, S.krillin]) {
      f.setHidden(true);
      f.untargetable = true;
      f.intangible = true;
    }
  }

  const P = {};

  P.spell = {
    id: 'spell',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      stageCrater(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'majin_spell');
    },
  };

  /**
   * RESIST. Played as Vegeta: mash to push the wizard out. He can: the bar climbs, and the
   * memories come with it. At the top he stops — not the player — and the bar goes down by
   * itself however hard the buttons are pressed. The label says so; nothing else does.
   */
  P.resist = {
    id: 'resist',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stageCrater(b);
      if (b.player !== v) b.switchPlayer(v, { force: true });
      K.toForm(v, 'ssj');
      v.lockedForms = { majin: true };
      v.setState('scripted', { pose: 'v_clutchHead', expression: 'grit' });
      S.babidi.setState('scripted', { pose: 'bb_cast', expression: 'grin' });
      b.stage.setMood(0.4, 0x2a0a24, 1.5);
      m.music('finale', 3);
      m.objective('resist', 'Get him out of your head', { icon: 'guard' });
      // the whole struggle is one slow push in on his face, the wizard over his shoulder
      m.shot((t, out) => {
        // in front of him and below (he is bent over his hands), pushing in on the face, the wizard's
        // ship behind him
        const h = v.headPos();
        const toBabidi = S.babidi.chest().sub(h).setY(0).normalize();
        const side = new V3(-toBabidi.z, 0, toBabidi.x);
        K.camAt(out, h.clone().addScaledVector(toBabidi, U.lerp(2.6, 1.5, t)).addScaledVector(side, 0.45).add(new V3(0, -U.lerp(0.55, 0.35, t), 0)), h.clone().add(new V3(0, -0.02, 0)), U.lerp(44, 34, t));
      }, 40, { cut: true, blendIn: 0 });
      const MEM = [
        { at: 0.5, line: 'Kakarot... always Kakarot.' },
        { at: 0.62, line: 'A low-class soldier, and every time I climbed, he was already standing there.' },
        { at: 0.72, line: 'Bulma... Trunks...' },
      ];
      let mi = 0, letGo = false, visionT = 0, sinking = null;
      const beats = { memories: 0 };
      const r = yield* m.struggle({
        start: 0.35, drain: 0.12, duration: 28, canFail: false,
        label: () => (letGo ? 'HE STOPS RESISTING' : 'RESIST'),
        onTick: (t) => {
          if (visionT > 0) {
            visionT -= 1 / 60;
            SL.ScreenFX.vision(Math.max(0, visionT) * 0.5);
          }
        },
        override: (t, grip) => {
          while (mi < MEM.length && grip >= MEM[mi].at) {
            m.say('vegeta', MEM[mi].line, 3, { style: 'quiet' });
            SL.ScreenFX.flash(0.25, '#f0e0ff');
            b.sfx('visionIn', v, { vol: 0.6 });
            visionT = 1.2;
            beats.memories++;
            mi++;
          }
          if (!letGo && (grip >= 0.8 || t >= 16)) {
            letGo = true;
            m.flags.letGoAt = Math.round(grip * 100);
            v.setState('scripted', { pose: 'v_acceptMark', expression: 'smirk' });
            m.say('vegeta', 'No. I remember what I was. And I want it back.', 3.6, { style: 'quiet' });
            b.sfx('heartbeat', v);
            b.emit('majinAccepted', { fighter: v });
          }
          // whatever is pressed: he is the one letting go now
          if (letGo) return (sinking = (sinking === null ? grip : sinking) - 0.3 / 60);
          return undefined;
        },
        until: (t, grip) => letGo && grip <= 0.01,
      });
      SL.ScreenFX.vision(0);
      m.flags.resistMemories = beats.memories;
      m.flags.resisted = Math.round(r.avg * 100);
      m.qteParts.push(U.clamp01(r.avg * 1.4));
      m.complete('resist');
      m.endShot();
    },
  };

  P.mark = {
    id: 'mark',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      stageCrater(b);
      delete v.lockedForms.majin;
      yield* SL.data.cinematics.transform(m, {
        fighter: v,
        formIndex: K.formIndex(v, 'majin'),
        witness: S.goku,
        witnessLine: 'That mark... Vegeta, what did you do?',
        line: 'vegeta_majin',
        music: 6,
      });
      m.flags.majin = v.form.id === 'majin';
      // from here on he is on the other side
      v.team = 1;
      yield* SL.Cinema.play(m, 'majin_awake');
      // Babidi's magic: the two of them, back to the tournament
      leaveBehind(b);
      yield* K.teleport(m, 'tournament', [
        [S.goku, new V3(0, 0, -5), 0],
        [S.vegeta, new V3(0, 0, 3), Math.PI],
      ]);
      K.faceTo(S.goku, S.vegeta.pos);
      K.faceTo(S.vegeta, S.goku.pos);
      yield 0.2;
    },
  };

  /** Make sure the tournament and its first scar are there (a restart from STOP). */
  function tournamentState(b, m) {
    const S = b.story;
    leaveBehind(b);
    if (b.stage.def.id !== 'tournament') b.changeStage('tournament');
    m.flags.standsA = STANDS_A;
    m.flags.standsB = STANDS_B;
    if (m.flags.firstBlast && !b.stage.crowdHit) {
      b.stage.blastStands(STANDS_A, 8);
    }
    b.stage.crowdHit = !!m.flags.firstBlast;
    K.toForm(S.vegeta, 'majin');
    S.vegeta.team = 1;
  }

  P.stands = {
    id: 'stands',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      tournamentState(b, m);
      K.place(S.goku, K.ground(b, new V3(0, 0, -5)), 0);
      K.place(S.vegeta, K.ground(b, new V3(0, 0, 3)), 0);
      yield* SL.Cinema.play(m, 'majin_stands');
      b.stage.crowdHit = true;
    },
  };

  /**
   * STOP. Goku has one chance: Vegeta walks to the ring's edge and raises his hand at the east
   * stands. Reach him (or hit him) before it leaves his hand. Either way the story goes on — the
   * difference is whether a second section of people is there afterwards.
   */
  P.stop = {
    id: 'stop',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      m.flags.firstBlast = true;
      tournamentState(b, m);
      if (b.player !== g) b.switchPlayer(g, { force: true });
      K.toForm(g, 'ssj');
      g.lockedForms = { ssj2: true, kaioken: true };
      g.lockedSlots = { special1: true, special2: true, ultimate: true, transform: true };
      g.cannotDie = true;
      K.place(g, K.ground(b, new V3(-9, 0, -2)), Math.PI / 2);
      K.place(v, K.ground(b, new V3(9.5, 0, 2)), Math.PI / 2);
      v.controller = K.scripted();
      v.setState('scripted', { pose: 'blastWind', expression: 'grin' });
      v.cannotDie = true;
      v.target = null;
      g.target = v;
      K.faceTo(v, STANDS_B);
      m.shot((t, out) => K.camAt(out, g.chest().clone().add(new V3(-3.5, 2, -4)), v.chest(), 44), 1.4, { cut: true, blendIn: 0 });
      m.say('goku', 'Not again!', 1.4, { style: 'shout' });
      yield* m.cine(1.4);
      m.endShot();
      m.objective('stop', 'Stop him before it leaves his hand · ' + STOP_SECONDS, { icon: 'fist' });
      m.prompt('stopDash', 'boost', 'Dash', { required: true, until: () => g.distTo(v) < 3, always: true });
      m.lock(false);
      b.aiLocked = true;
      g.setState('free');
      let t = 0, reached = false, shown = STOP_SECONDS;
      const offD = b.on('damage', (e) => {
        if (e.target === v && e.attacker === g) reached = true;
      });
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        if (b.frame % 4 === 0) b.vfx.streamInward(v.handPos('R'), 1.4, 0xffe07a, 2, 0.12, 0.3);
        if (g.distTo(v) < 2.8) reached = true;
        const left = Math.max(0, Math.ceil(STOP_SECONDS - t));
        if (left !== shown) m.objective('stop', 'Stop him before it leaves his hand · ' + (shown = left));
      };
      m.tickHooks.push(hook);
      yield () => reached || t >= STOP_SECONDS;
      K.unhook(m, hook);
      offD();
      m.lock(true);
      K.clearCombat(b);
      g.setState('free');
      if (reached) {
        m.complete('stop');
        const side = v.pos.clone().sub(g.pos).setY(0).normalize();
        K.place(g, K.ground(b, v.pos.clone().addScaledVector(side, -1.1)));
        K.faceTo(g, v.pos);
        yield* SL.Cinema.play(m, 'majin_grab');
      } else {
        m.failObjective('stop');
        yield* SL.Cinema.play(m, 'majin_second');
      }
      m.qteParts.push(reached ? 1 : 0.2);
      g.lockedSlots = {};
    },
  };

  P.agree = {
    id: 'agree',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      tournamentState(b, m);
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      yield* SL.Cinema.play(m, 'majin_agree');
      yield* K.teleport(m, 'majin_wastes', [
        [g, new V3(0, 0, 7), Math.PI],
        [v, new V3(0, 0, -7), 0],
      ]);
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      m.music('finale', 2);
      g.setState('scripted', { pose: 'idle', expression: 'angry' });
      v.setState('scripted', { pose: 'v_majinStance', expression: 'grin' });
      // wind over the wastes, the two of them small against it
      m.shot((t, out) => {
        const mid = g.pos.clone().lerp(v.pos, 0.5);
        K.camAt(out, mid.clone().add(new V3(U.lerp(26, 18, t), U.lerp(6, 3, t), 0)), mid.clone().add(new V3(0, 1.2, 0)), U.lerp(40, 34, t));
      }, 4.4, { cut: true, blendIn: 0 });
      b.vfx.dust(g.pos.clone().add(new V3(0, 0.3, 0)), 3, 10, b.stage.def.terrain.sand);
      yield* m.cine(4.2);
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'THE MARK', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_majin',
    canon: true,
    chapter: 'CHAPTER 10 · BUU SAGA',
    title: 'The Mark',
    subtitle: 'Earth · Age 774 · he is not taken; he agrees',
    character: 'vegeta',
    stage: 'babidi_crater',
    parTime: 240,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'A wizard finds the darkness in a proud man and only has to open the door. The price is paid by people who came to watch a tournament.',
    rewards: ['Majin Vegeta', 'Vegeta: Super Saiyan 2 (Free Battle)'],
    setup,
    phases: [P.spell, P.resist, P.mark, P.stands, P.stop, P.agree],
  };

  SL.data.missions[def.id] = def;
})();
