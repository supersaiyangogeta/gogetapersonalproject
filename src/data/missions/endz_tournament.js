/*
 * CHAPTER 15 — THE END OF Z: "THE 28TH WORLD TOURNAMENT" (the owner's epilogue brief, the Uub beat sheet and
 * reference images, 2026-10-03). Age 784. Played as Uub. The last mission of the Buu Saga.
 *
 *   ARRIVE    (scene)   the hall, the crowd, the announcer; the family at the gate — Goten and Trunks grown,
 *                       Pan at four; Mr. Satan rigged the draw; Mr. Buu's secret; "What are you up to, Kakarot?"
 *   PAN *     (play)    the exhibition: PLAYED AS PAN, four years old, against Rocco the heavyweight who laughs
 *                       at her. His blows do nothing (Mission.powerGap); eight of hers, then one button —
 *                       the kick that sends him out of the ring; the hush, the roar, "THAT'S MY GRANDDAUGHTER!"
 *   ENTRANCE  (scene)   "UUB!"; a barefoot boy shaking on the steps; Goku up on the ring; the pink ghost;
 *                       "...So it's you."; the bow
 *   PROVOKE   (scene)   "Begin!"; the fake villain and the swamp rat; Chi-Chi; "...Clever, Kakarot."
 *   AWAKEN    (scene)   the tears, the fists, the tiles lifting off the ring, the scream; the HUD learns
 *                       Village Stomp
 *   CLASH *   (play)    Uub against a Goku who only blocks, sidesteps and laughs: land fourteen blows
 *   FIST      (scene)   the fists meet, lightning between them; the next one caught; the apology
 *   OFFER     (scene)   on one knee: the village, the food, the training; "Please... teach me!"; both out
 *   FAREWELL  (scene)   the wave; Chi-Chi; Gohan; Mr. Buu; VEGETA'S SMILE; the salute
 *   FLYAWAY   (scene)   on Goku's back; the kick off the stone; open country; the last shot
 *   END                 THE END OF THE BUU SAGA
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const T = () => SL.data.endz.T;

  function setup(battle) {
    const b = battle, t = T();
    const uub = b.spawn({ charId: 'uub', player: true, team: 0, pos: new V3(0, 0, 18.6), startKi: 60 });
    const goku = b.spawn({ charId: 'goku', team: 1, pos: new V3(13.6, 0, -6), startKi: 100 });
    const kid = b.spawn({ charId: 'kid_buu', team: 1, pos: new V3(40, 0, -40) });
    const s = (charId, key, extra) => {
      const [x, z] = t.FRIENDS[key] || [0, 30];
      return b.spawn(Object.assign({ charId, team: 0, pos: new V3(x, 0, z) }, extra || {}));
    };
    const story = {
      uub,
      goku,
      kid,
      vegeta: s('vegeta', 'vegeta'),
      bulma: s('bulma', 'bulma'),
      chichi: s('chichi', 'chichi'),
      gohan: s('adult_gohan', 'gohan'),
      videl: s('videl', 'videl', { wardrobe: { outfit: 'videl_tournament', hair: 'hair_videl_short' } }),
      piccolo: s('piccolo', 'piccolo'),
      krillin: s('krillin', 'krillin'),
      satan: s('mr_satan', 'satan'),
      fat: s('majin_buu', 'fat'),
      // ten years on: the boys grown, and Gohan and Videl's daughter (src/data/characters/endz_cast.js)
      pan: s('pan', 'pan'),
      goten: s('teen_goten', 'goten'),
      trunks: s('teen_trunks', 'trunks'),
      rocco: b.spawn({ charId: 'rocco', team: 1, pos: new V3(0, 0, -30) }),
    };
    for (const k of Object.keys(story)) {
      const f = story[k];
      f.cannotDie = true;
      if (f === uub) continue;
      K.watcher(f, 'idle', 'calm');
    }
    kid.setHidden(true);
    story.rocco.setHidden(true);
    kid.mech.maxReforms = Infinity;
    goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true };
    uub.lockedSlots = Object.assign({}, uub.lockedSlots || {}, { special2: true, ultimate: true });
    uub.setState('scripted', { pose: 'ub_nervous', expression: 'nervous' });
    for (const k of ['uub', 'goku']) story[k].setHidden(true);
    b.story = story;
  }

  /**
   * THE TEACHER: Goku in the ring with a ten-year-old — keeps a step away, blocks with his forearms, now and
   * then a sidestep; never a blow worth the name (damageDealtMul is a tap).
   */
  function teacher(g, u) {
    let n = 0, cd = 0;
    return {
      update() {
        const it = SL.emptyIntent();
        n++;
        g.target = u;
        const d = g.pos.distanceTo(u.pos);
        if (d > 4) it.my = 0.6;
        else if (d < 1.3) it.my = -0.5;
        if (d < 3.4 || u.state === 'attack' || u.state === 'special') it.guard = true;
        if (cd > 0) cd--;
        else if (d < 2.4 && n % 170 === 0) {
          it.guard = false;
          it.dodge = true;
          cd = 100;
        }
        return it;
      },
    };
  }

  const P = {};
  const scene = (id, sceneId, prep) => ({
    id,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      if (prep) prep(m);
      yield* SL.Cinema.play(m, sceneId);
    },
  });

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'et_arrive');
    },
  };
  /**
   * PAN'S EXHIBITION: a four-year-old against a heavyweight who thinks it is a joke. Played: his blows do
   * nothing to her (the power gap, shown — his fist bounces, she does not flinch), hers send him reeling.
   * Eight of them (or forty seconds), then one button: the kick out of the ring.
   */
  P.pan = {
    id: 'pan',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.pan, r = S.rocco, t = T();
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'et_pan_call');
      m.space(p, 'ground', { pos: t.PAN.clone(), face: t.ROCCO });
      m.space(r, 'ground', { pos: t.ROCCO.clone(), face: t.PAN });
      p.setHidden(false);
      r.setHidden(false);
      p.untargetable = p.intangible = false;
      r.untargetable = r.intangible = false;
      r.cannotDie = true;
      b.switchPlayer(p, { force: true });
      r.controller = new SL.AIController(b, { difficulty: 'normal' });
      p.target = r;
      r.target = p;
      m.powerGap(p, {
        from: [r],
        mul: 0.03,
        lines: [
          { at: 2, who: 'rocco', line: 'Wh-what? It didn\'t... do anything?', duration: 2.2 },
          { at: 5, who: 'pan', line: 'Was that a punch? Hee hee!', duration: 2 },
        ],
      });
      const sf = m.storyFight({ floors: [{ f: r, at: 0.3 }], fighters: [p, r], space: 'ground' });
      p.setState('free');
      r.setState('free');
      m.music('tenkaichi', 3);
      m.objective('show', 'Show them what a four-year-old can do', { icon: 'fist', target: 8 });
      let n = 0, secs = 0;
      const lines = { 3: ['crowd', 'Whoa — the little girl HIT him!'], 6: ['mr_satan', 'That\'s it, Pan! Just like Grandpa!'] };
      const off = b.on('damage', (e) => {
        if (e.attacker !== p || e.target !== r) return;
        n++;
        m.progress('show', Math.min(8, n));
        if (lines[n]) m.say(lines[n][0], lines[n][1], 2, { style: 'shout' });
      });
      const clock = () => {
        if (!b.inputLocked) secs += 1 / 60;
      };
      m.tickHooks.push(clock);
      m.lock(false);
      b.aiLocked = false;
      yield () => b.skipRequested || n >= 8 || sf.floored(r) || secs >= 40;
      off();
      K.unhook(m, clock);
      sf.off();
      m.complete('show');
      // the finish: one button
      m.lock(true);
      K.clearCombat(b);
      r.setState('scripted', { pose: 'rc_idle', expression: 'shock' });
      p.setState('scripted', { pose: 'pn_idle', expression: 'grin' });
      K.faceTo(p, r.pos);
      SL.Cinema.shotOn(m, { pan: p, rocco: r }, { subject: 'pan', with: 'rocco', focus: 'full' }, 30, { cut: true, blendIn: 0, hold: true });
      yield* m.cue('heavy', 'Kick him out of the ring!', { slow: 0.5, auto: 6 });
      p.setState('scripted', { pose: 'pn_flyKick', expression: 'shout', speed: 14 });
      const dir = r.pos.clone().sub(p.pos).setY(0).normalize();
      r.setState('free');
      r.takeHit(p, { type: 'melee', damage: 400, knock: 'heavy', knockSpeed: 46, hitstun: 60, impact: 4, dir: dir.clone().setY(0.25).normalize(), pose: 'hitHeavy', sfx: 'punchHeavy' });
      b.vfx.impact(r.chest(), 3, 0xfff0c0);
      b.cameraTraumaAt(r.chest(), 0.6);
      b.slowmo(0.35, 0.5);
      SL.Cinema.shotOn(m, { rocco: r }, { subject: 'rocco', focus: 'wide', angle: 'three', room: 7 }, 2, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(1.9);
      m.endShot();
      r.controller = K.scripted();
      r.untargetable = r.intangible = true;
      p.untargetable = p.intangible = true;
      p.controller = K.scripted();
      yield* SL.Cinema.play(m, 'et_pan_win');
      if (b.player !== S.uub) b.switchPlayer(S.uub, { force: true });
      S.uub.setHidden(true);
      m.flags.panWon = true;
    },
  };
  P.entrance = scene('entrance', 'et_entrance');
  P.provoke = scene('provoke', 'et_provoke', (m) => {
    const S = m.battle.story;
    if (!m.flags.recognized) {
      for (const k of ['uub', 'goku']) S[k].setHidden(false);
      m.space(S.uub, 'ground', { pos: T().UUB.clone(), face: T().GOKU });
      m.space(S.goku, 'ground', { pos: T().GOKU.clone(), face: T().UUB });
    }
  });
  P.awaken = {
    id: 'awaken',
    run: function* (m) {
      const S = m.battle.story;
      m.lock(true);
      m.clearObjectives();
      if (!m.flags.provoked) {
        for (const k of ['uub', 'goku']) S[k].setHidden(false);
        m.space(S.uub, 'ground', { pos: T().UUB.clone(), face: T().GOKU });
        m.space(S.goku, 'ground', { pos: T().UUB.clone().add(new V3(0, 0, 2.2)), face: S.uub.pos });
      }
      yield* SL.Cinema.play(m, 'et_awaken');
      // the HUD learns what the ring just felt
      m.teach(S.uub, 'special2');
    },
  };

  /** THE CLASH: Uub's fists against a Goku who only blocks and laughs. Fourteen blows (or fifty seconds). */
  P.clash = {
    id: 'clash',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, u = S.uub, g = S.goku, t = T();
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      SL.data.endz.friends({ b, m, cast: {} });
      for (const f of [u, g]) f.setHidden(false);
      if (u.lockedSlots) delete u.lockedSlots.special2;
      if (b.player !== u) b.switchPlayer(u, { force: true });
      m.space(u, 'ground', { pos: t.UUB.clone(), face: t.GOKU });
      m.space(g, 'ground', { pos: t.GOKU.clone().add(new V3(0, 0, -3)), face: t.UUB });
      g.controller = teacher(g, u);
      g.untargetable = g.intangible = false;
      u.untargetable = u.intangible = false;
      u.target = g;
      g.target = u;
      g.damageDealtMul = 0.04;
      const sf = m.storyFight({ floors: [{ f: u, at: 0.35 }, { f: g, at: 0.55 }], taken: [{ f: g, mul: 0.25 }], fighters: [u, g], space: 'ground' });
      u.setState('free');
      g.setState('free');
      m.music('uub_theme', 3);
      m.objective('show', 'Show him what you\'ve got', { icon: 'target', target: 14 });
      const lines = { 3: 'Ha ha! That\'s it!', 7: 'Come on — harder!', 11: 'Whoa! Ha ha ha!' };
      let n = 0, secs = 0;
      const off = b.on('damage', (e) => {
        if (e.attacker !== u || e.target !== g) return;
        n++;
        m.progress('show', Math.min(14, n));
        if (lines[n]) m.say('goku', lines[n], 1.8, { style: 'shout' });
      });
      const clock = () => {
        if (!b.inputLocked) secs += 1 / 60;
      };
      m.tickHooks.push(clock);
      m.lock(false);
      b.aiLocked = false;
      yield () => b.skipRequested || n >= 14 || secs >= 50;
      off();
      K.unhook(m, clock);
      sf.off();
      m.complete('show');
      m.lock(true);
      K.clearCombat(b);
      for (const f of [u, g]) {
        f.untargetable = f.intangible = true;
        f.setState('scripted', { pose: f === u ? 'ub_idle' : 'ez_forearms', expression: f === u ? 'angry' : 'grin' });
      }
      g.controller = K.scripted();
      m.flags.clash = { blows: n };
    },
  };
  /** The two of them on the ring and the friends on the yard (every phase after the clash starts from here). */
  function onRing(m) {
    const S = m.battle.story, t = T();
    SL.data.endz.friends({ b: m.battle, m, cast: {} });
    for (const f of [S.uub, S.goku]) f.setHidden(false);
    if (!m.flags.clash) {
      m.space(S.uub, 'ground', { pos: t.UUB.clone(), face: t.GOKU });
      m.space(S.goku, 'ground', { pos: t.UUB.clone().add(new V3(0, 0, 2.4)), face: t.UUB });
      S.uub.setState('scripted', { pose: 'ub_idle', expression: 'angry' });
      S.goku.setState('scripted', { pose: 'ez_forearms', expression: 'grin' });
    }
  }
  P.fist = scene('fist', 'et_fist', onRing);
  P.offer = scene('offer', 'et_offer', (m) => !m.flags.fistsMet && onRing(m));
  P.farewell = scene('farewell', 'et_farewell', (m) => !m.flags.offered && onRing(m));
  P.flyaway = scene('flyaway', 'et_flyaway', (m) => !m.flags.goodbyes && onRing(m));

  P.end = {
    id: 'end',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      // from the light, slowly, to night: and then the last card
      m.fade('black', 2.2);
      m.music('next_journey', 2);
      yield* m.cine(2.6);
      m.endShot();
      m.title('SAIYAN LEGACY · CHAPTER 23', 'THE END OF THE BUU SAGA', 'Goku and Uub · Age 784 — the journey goes on', 6.4);
      yield* m.cine(7);
      if (SL.Save && SL.Save.data && SL.Save.data.flags) SL.Save.data.flags.buuSagaComplete = true;
    },
  };

  const def = {
    id: 'endz_tournament',
    canon: true,
    chapter: 'CHAPTER 23 · THE END OF Z',
    title: 'The 28th World Tournament',
    subtitle: 'Goku and Uub · Age 784',
    character: 'uub',
    stage: 'tournament',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'The World Tournament, ten years on. A barefoot boy from the south shaking on the steps — and the man in the other corner who has been waiting for him since the day he said goodbye to Kid Buu.',
    rewards: ['Story: the End of the Buu Saga', 'Character: Uub', 'Character: Pan'],
    setup,
    phases: [P.arrive, P.pan, P.entrance, P.provoke, P.awaken, P.clash, P.fist, P.offer, P.farewell, P.flyaway, P.end],
  };
  SL.data.missions[def.id] = def;
})();
