/*
 * CHAPTER 11 — BUU SAGA: BUYING TIME
 * Mission "Fusion" (canon; played as Kid Trunks, then as Gotenks). Kami's Lookout, above the clouds,
 * on the last hours of Goku's day on Earth.
 *
 *   LESSON   (scene)      Goku shows the boys the Fusion Dance — every step of it, alone, while
 *                         Piccolo looks away
 *   GOODBYE  (scene)      his day is up: Goten, Trunks, and a halo going back up into the light
 *   DANCE1   (checkpoint) the dance, played: the steps on the beat (Mission.rhythm). Trunks is the
 *                         player's; Goten is seven — his finger is not out, and what comes out of
 *                         the light is fat, wheezing and useless (scene `fusion_fat`). Thirty
 *                         minutes later it is over.
 *   DANCE2                again, and now it is the player's timing that decides: a step out of time
 *                         and the fusion comes out eighty years old (scene `fusion_thin`) — thirty
 *                         minutes, and again. On the beat: GOTENKS (scene `fusion_birth`).
 *   SPAR     (checkpoint) Gotenks against Piccolo: land the hits, go Super Saiyan when Piccolo
 *                         stops holding back, and spit the Super Ghost Kamikaze Attack at him. The
 *                         pose (Grim Reaper of Justice) is there for anybody who wants to risk it.
 *   TIMEUP   (scene)      mid-brag, the fusion runs out: two boys on the floor of the Lookout
 *   AFTER                 the title
 *
 * Canon notes: the order (the lesson, then Goku leaving, then two failed fusions and Piccolo left
 * to finish the training) follows the owner's written reference. Dialogue is paraphrased English
 * written for this project.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // the dance on the beat (tuning knobs)
  const DANCE = {
    beat: 0.82, // seconds between steps
    window: 0.2, // ± seconds for a step to count
    perfect: 0.075,
    assistAfter: 2, // failed tries in DANCE2 before Piccolo slows the count (the window widens)
    assistWindow: 0.3,
    maxTries: 5, // after this many failed tries Piccolo stops the lesson and they get it (nobody is stuck)
  };
  const SPAR = { hits: 6, seconds: 75 };
  // the steps, in order; each is a press of Light on the beat
  const STEPS = [
    { id: 'out', label: 'ARMS OUT', pose: 'fd_out' },
    { id: 'step1', label: 'STEP', pose: 'fd_stepA' },
    { id: 'step2', label: 'STEP', pose: 'fd_stepB' },
    { id: 'step3', label: 'STEP', pose: 'fd_stepA' },
    { id: 'fu', label: 'FU—', pose: 'fd_fu', call: 'FUUU—' },
    { id: 'sion', label: '—SION', pose: 'fd_sion', call: '—SION!' },
    { id: 'ha', label: 'HA!', pose: 'fd_ha', call: 'HA!' },
  ];

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    // the dancers face the camera: Goten at -x has Trunks on his right (mirrored steps), Trunks the plain ones
    const trunks = b.spawn({ charId: 'kid_trunks', player: true, team: 0, pos: at(1.8, 4), startKi: 60 });
    const goten = b.spawn({ charId: 'goten', team: 0, pos: at(-1.8, 4), startKi: 60 });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: at(0, -2), startKi: 60 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 1, pos: at(6.5, -1), startKi: 100 });
    for (const f of [goten, goku, piccolo]) K.watcher(f, 'idle', 'calm');
    K.watcher(piccolo, 'armsCrossed', 'calm');
    for (const f of [trunks, goten]) f.lockedForms = { ssj: true };
    b.story = { trunks, goten, goku, piccolo, gotenks: null, fusion: null };
  }

  /** The two boys three paces apart, facing Piccolo and the camera, their partner beside them. */
  function lineUp(b) {
    const S = b.story;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    K.place(S.goten, at(-1.7, 4.2), Math.PI);
    K.place(S.trunks, at(1.7, 4.2), Math.PI);
    for (const f of [S.goten, S.trunks]) {
      f.setHidden(false);
      f.intangible = true;
      f.untargetable = true;
      f.controller = K.scripted();
      f.setState('scripted', { pose: f === S.goten ? 'fd_stepBR' : 'fd_stepB', expression: 'calm' });
    }
    K.place(S.piccolo, at(0, -3.5), 0);
    S.piccolo.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
  }

  /**
   * One dance. Trunks is the player; Goten follows the count (and, in the first try, fumbles the
   * finger). The dancers take each step's pose ON the beat whatever is pressed; what is pressed
   * decides what comes out of the light. Returns 'finger' | 'timing' | 'ok' and the rhythm result.
   */
  function* dance(m, opts = {}) {
    const b = m.battle, S = b.story;
    lineUp(b);
    b.switchPlayer(S.trunks, { force: true });
    m.shot((t, out) => {
      const mid = S.goten.chest().lerp(S.trunks.chest(), 0.5);
      out.pos.set(mid.x + Math.sin(t * 0.08) * 0.5, mid.y + 0.15, mid.z - 4.6);
      out.look.copy(mid).add(new V3(0, -0.05, 0));
      out.fov = 42;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('piccolo', opts.count || 'From the top. On my count.', 2.2, { style: 'quiet' });
    yield* m.cine(1.4);
    const res = yield* m.rhythm(STEPS.map((s) => ({ key: 'light', label: s.label })), {
      beat: DANCE.beat,
      window: opts.window || DANCE.window,
      perfect: DANCE.perfect,
      lead: 1,
      onBeat: (i) => {
        const st = STEPS[i];
        S.goten.setState('scripted', { pose: st.pose + 'R', expression: st.id === 'ha' ? 'shout' : 'calm', speed: 18 });
        S.trunks.setState('scripted', { pose: st.pose, expression: st.id === 'ha' ? 'shout' : 'calm', speed: 18 });
        // the side-steps close the three paces
        if (st.id.startsWith('step')) {
          const k = Number(st.id.slice(4));
          const gap = U.lerp(1.7, 0.55, k / 3);
          K.place(S.goten, K.ground(b, new V3(-gap, 0, 4.2)), Math.PI);
          K.place(S.trunks, K.ground(b, new V3(gap, 0, 4.2)), Math.PI);
        }
        if (st.call) {
          m.say('goten', st.call, 0.8, { style: 'shout' });
          b.sfx('swing', S.goten, { pitch: 1.4, vol: 0.7 });
        }
      },
    });
    m.endShot();
    // what the dance was worth: a step out of time spoils it; the first try, Goten's finger does
    let outcome = 'ok';
    if (res.hits.some((h) => h.grade === 'miss')) outcome = 'timing';
    if (opts.gotenFumbles) outcome = 'finger';
    m.flags.danceScores = (m.flags.danceScores || []).concat([Math.round(res.score * 100) / 100]);
    return { outcome, res };
  }

  /** Into the light: two dancers meet, and one body comes out (or the wrong one). */
  function* fuseInto(m, id, opts = {}) {
    const b = m.battle, S = b.story;
    const g = S.goten, t = S.trunks;
    const mid = g.pos.clone().lerp(t.pos, 0.5);
    b.vfx.flash(mid.clone().add(new V3(0, 0.8, 0)), 6, 0xffffff, 0.6, SL.Toon.tex.glow);
    b.vfx.ring(mid.clone().add(new V3(0, 0.8, 0)), 7, 0xffffff, 0.7);
    SL.ScreenFX.flash(0.9, '#ffffff');
    b.sfx('transformBurst', t, { pitch: 1.3 });
    const h = SL.Fusion.fuse(b, g, t, id, { silent: true, hpFrac: 1 });
    S.fusion = h;
    const f = h.fused;
    f.untargetable = true;
    f.controller = K.scripted();
    K.faceTo(f, S.piccolo.pos);
    f.setState('scripted', { pose: opts.pose || 'idle', expression: opts.face || 'calm' });
    if (id === 'gotenks') S.gotenks = f;
    b.emit('fusionDance', { id, fused: f });
    yield* m.cine(0.2);
    return f;
  }

  /** Thirty minutes later: whatever came out comes apart again. */
  function* waitItOut(m) {
    const b = m.battle, S = b.story;
    m.fade('black', 0.6);
    yield* m.cine(0.7);
    m.title('', 'THIRTY MINUTES LATER', '', 1.8);
    if (S.fusion && S.fusion.active) SL.Fusion.defuse(b, S.fusion, { to: S.trunks, silent: true });
    S.fusion = null;
    lineUp(b);
    yield* m.cine(1.8);
    m.fade('clear', 0.6);
    yield* m.cine(0.5);
  }

  const P = {};

  P.lesson = {
    id: 'lesson',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      K.place(S.goku, K.ground(b, new V3(0, 0, -1.5)), 0);
      K.place(S.goten, K.ground(b, new V3(-1.3, 0, 3.4)), Math.PI);
      K.place(S.trunks, K.ground(b, new V3(1.3, 0, 3.4)), Math.PI);
      K.place(S.piccolo, K.ground(b, new V3(5.5, 0, 0.5)), -Math.PI / 2);
      S.goku.halo = S.goku.halo || SL.Cinema.halo(b, S.goku);
      yield* SL.Cinema.play(m, 'fusion_lesson');
    },
  };

  P.goodbye = {
    id: 'goodbye',
    run: function* (m) {
      yield* SL.Cinema.play(m, 'fusion_goodbye');
    },
  };

  P.dance1 = {
    id: 'dance1',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      S.goku.setHidden(true);
      m.music('farewell', 2);
      m.objective('dance', 'The Fusion Dance: press on every beat', { icon: 'transform' });
      const d = yield* dance(m, { gotenFumbles: true, count: 'Arms out. Three steps. Fu. Sion. Ha. Go.' });
      m.flags.dance1 = d.outcome;
      yield* fuseInto(m, 'gotenks_fat', { pose: 'gkf_idle', face: 'hurt' });
      yield* SL.Cinema.play(m, 'fusion_fat');
      yield* waitItOut(m);
    },
  };

  P.dance2 = {
    id: 'dance2',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      m.objective('dance', 'The Fusion Dance: every step on the beat', { icon: 'transform' });
      let tries = 0;
      for (;;) {
        tries++;
        const assisted = tries > DANCE.assistAfter;
        const d = yield* dance(m, { window: assisted ? DANCE.assistWindow : DANCE.window, count: tries === 1 ? 'Goten. Your FINGER. Again.' : assisted ? 'Slower, then. Watch me count.' : 'Again. In time, this time.' });
        m.flags.dance2Tries = tries;
        if (d.outcome === 'ok' || tries >= DANCE.maxTries) break;
        yield* fuseInto(m, 'gotenks_thin', { pose: 'gkt_idle', face: 'hurt' });
        yield* SL.Cinema.play(m, 'fusion_thin');
        yield* waitItOut(m);
      }
      m.complete('dance');
      m.qteParts.push(1 / tries);
      yield* fuseInto(m, 'gotenks', { pose: 'gk_intro', face: 'grin' });
      yield* SL.Cinema.play(m, 'fusion_birth');
    },
  };

  /** Gotenks against Piccolo: the cockiest fighter on Earth gets to prove it. */
  P.spar = {
    id: 'spar',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      S.goku.setHidden(true);
      // entered from the checkpoint: the boys fuse straight away (the dance is behind them)
      if (!S.gotenks) {
        lineUp(b);
        yield* fuseInto(m, 'gotenks', { pose: 'gk_intro', face: 'grin' });
      }
      const g = S.gotenks;
      K.place(g, K.ground(b, new V3(0, 0, 5)), Math.PI);
      K.place(p, K.ground(b, new V3(0, 0, -5)), 0);
      g.untargetable = false;
      g.intangible = false;
      g.cannotDie = true;
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 60);
      g.lockedForms = { ssj: true, ssj3: true };
      p.untargetable = false;
      p.intangible = false;
      p.cannotDie = true;
      p.hp = p.hpMax;
      p.damageDealtMul = 0.45;
      p.damageTakenMul = 0.7;
      b.switchPlayer(g, { force: true });
      g.target = p;
      p.target = g;
      p.controller = new SL.AIController(b, { difficulty: 'normal', profile: { aggression: 0.55, defense: 0.6, ranged: 0.3, beam: 0.15, preferredRange: 3 } });
      g.setState('free');
      p.setState('free');
      m.music('battle', 4);
      m.objective('hits', 'Show Piccolo what Gotenks can do: ' + SPAR.hits + ' clean hits', { icon: 'fist', target: SPAR.hits });
      m.objective('pose', 'Strike the Grim Reaper pose and get away with it', { icon: 'transform', optional: true });
      let hits = 0, ghostHit = false, posed = false;
      const offD = b.on('damage', (e) => {
        if (e.attacker !== g || e.target !== p) return;
        if (e.source === 'Super Ghost Kamikaze Attack') ghostHit = true;
        else if (e.type === 'melee' || e.type === 'throw') {
          hits++;
          m.progress('hits', Math.min(SPAR.hits, hits));
        }
      });
      const offP = b.on('bossPoseDone', (e) => {
        if (e.fighter !== g) return;
        posed = true;
        m.complete('pose');
      });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => hits >= SPAR.hits || t > SPAR.seconds * 0.5;
      m.complete('hits');
      // "Stop showing off and show me something": the gold
      m.lock(true);
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'fusion_gold');
      g.setState('free');
      m.teach(g, 'form:ssj');
      g.ki = Math.max(g.ki, g.kiMax * 0.6);
      const onlyTf = Object.assign({}, SL.Mission.ALL_OFF);
      delete onlyTf.transform;
      m.limits(onlyTf);
      b.inputLocked = false;
      b.aiLocked = true;
      m.objective('gold', 'Super Saiyan', { icon: 'transform', target: 1 });
      m.prompt('gkGold', 'transform', 'Transform', { required: true, when: () => g.formIndex === 0 && g.state === 'free', always: true });
      yield () => g.formIndex > 0 && g.state !== 'transform';
      m.limits(null);
      m.complete('gold');
      // and the one he has been dying to show somebody
      g.ki = g.kiMax;
      m.objective('ghost', 'Hit Piccolo with the Super Ghost Kamikaze Attack', { icon: 'ultimate', target: 1 });
      m.prompt('gkGhost', 'ultimate', 'Super Ghost Kamikaze Attack', { required: true, when: () => g.ki >= 100 && g.state === 'free', until: () => ghostHit, always: true });
      m.lock(false);
      b.aiLocked = false;
      t = 0;
      yield () => ghostHit || t > SPAR.seconds;
      K.unhook(m, clock);
      offD();
      offP();
      if (ghostHit) m.complete('ghost');
      else m.failObjective('ghost');
      if (!posed) m.failObjective('pose');
      m.flags.sparHits = hits;
      m.flags.ghostHit = ghostHit;
      m.qteParts.push(ghostHit ? 1 : 0.5);
      m.lock(true);
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'fusion_timeup');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'FUSION', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_fusion',
    canon: true,
    chapter: 'CHAPTER 11 · BUU SAGA',
    title: 'Fusion',
    subtitle: 'Kami\'s Lookout · Age 774',
    character: 'kid_trunks',
    stage: 'lookout',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'A dance from another world, two boys who cannot keep a straight face, and the most arrogant fighter who has ever lived.',
    rewards: ['Gotenks (playable)', 'Gotenks: Super Saiyan'],
    setup,
    phases: [P.lesson, P.goodbye, P.dance1, P.dance2, P.spar, P.after],
  };

  SL.data.fusionDance = { DANCE, SPAR, STEPS };
  SL.data.missions[def.id] = def;
})();
