/*
 * WHAT IF · THE END OF THE BUU SAGA — "The Ultimate Fusion"   (NOT CANON · the secret battle)
 *
 * Branches from "Goodbye, Buu". Kid Buu is gone; Goku and Vegeta are alive on the Sacred World of
 * the Kai, and they have never done the one thing the whole saga kept almost making them do.
 *
 *   ARRIVE   (scene)      Goku wants to try the dance; Vegeta refuses; the Old Kai needles him
 *   DANCE    (checkpoint) the Fusion Dance PLAYED (Mission.rhythm, the shared steps of
 *                         SL.data.fusionDance), Goku is the player's, Vegeta keeps the count with
 *                         him. Out of step and they argue and go again (the window widens after
 *                         two misses; nobody is ever stuck)
 *   BIRTH    (scene)      the light, the silhouette in the smoke, the lens climbing from the boots,
 *                         the eyes opening, the smirk, the stance: GOGETA. The Old Kai gives the
 *                         fusion's will a body of its own until the dance runs out — and Goku and
 *                         Vegeta stand either side of what they would make
 *   FIGHT    (checkpoint) Goku and Vegeta (switch between them) against base Gogeta. He is playful:
 *                         bursts, then a breath and a smirk (his AI's rhythm). At half his health:
 *   GOLD     (checkpoint) "Not bad. Now it's my turn." — his own Super Saiyan transformation, in the
 *                         fight (the world holds while the cinematic camera shows it), his theme
 *                         rising; then the real fight: shorter rests, every technique
 *   AFTER    (scene)      on one knee, grinning; he comes apart into light. Gogeta joins the roster.
 *
 * DIFFICULTY IS BEHAVIOUR. Gogeta has his Free Battle stats (no damage or health multipliers); the
 * mission's difficulty setting is the only scale, as everywhere. What makes him hard is the AI
 * (AIHooks.gogeta): it reads repeated strikes, counters out of vanishes, teleports with intent,
 * finishes with the Big Bang Kamehameha and never throws the same technique twice in a row.
 * Saved on the separate What-If track; canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const GG = {
    beat: 0.82, window: 0.2, perfect: 0.075, assistAfter: 2, assistWindow: 0.3, maxTries: 4,
    goldAt: 0.5, // Gogeta's health when he stops playing
    beatenAt: 0.03, // ...and where the fight is over (his body is the fusion's: it does not die, it comes apart)
  };

  const at = (b, x, z) => K.ground(b, new V3(x, 0, z));
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });

  function setup(battle) {
    const b = battle;
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(b, -2.4, 2.2), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(b, 2.4, 2.2), startKi: 100 });
    const kai = b.spawn({ charId: 'elder_kai', team: 0, pos: at(b, 0, -4), startKi: 0 });
    K.watcher(vegeta, 'armsCrossed', 'calm');
    K.watcher(kai, 'ek_idle', 'calm');
    K.faceTo(goku, vegeta.pos);
    K.faceTo(vegeta, goku.pos);
    K.faceTo(kai, goku.pos.clone().lerp(vegeta.pos, 0.5));
    b.story = { goku, vegeta, kai, gogeta: null, fusion: null };
  }

  /** The two of them three paces apart facing the camera (and the Old Kai), Goku on the left. */
  function lineUp(b) {
    const S = b.story;
    K.place(S.goku, at(b, -1.7, 4.2), Math.PI);
    K.place(S.vegeta, at(b, 1.7, 4.2), Math.PI);
    for (const f of [S.goku, S.vegeta]) {
      f.setHidden(false);
      f.intangible = true;
      f.untargetable = true;
      f.controller = K.scripted();
      f.setState('scripted', { pose: f === S.goku ? 'fd_stepBR' : 'fd_stepB', expression: f === S.goku ? 'grin' : 'angry' });
    }
    K.place(S.kai, at(b, 0, -2.5), 0);
    S.kai.setState('scripted', { pose: 'ek_idle', expression: 'calm' });
  }

  /** One dance: Goku is the player's; Vegeta follows the count — and judges it. */
  function* dance(m, opts = {}) {
    const b = m.battle, S = b.story;
    const STEPS = SL.data.fusionDance.STEPS;
    lineUp(b);
    b.switchPlayer(S.goku, { force: true }); // (lineUp scripted him: the seat hands the controls back)
    m.shot((t, out, el) => {
      const mid = S.goku.chest().lerp(S.vegeta.chest(), 0.5);
      out.pos.set(mid.x + Math.sin(el * 0.08) * 0.5, mid.y + 0.15, mid.z - 4.8);
      out.look.copy(mid).add(new V3(0, -0.05, 0));
      out.fov = 42;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say(opts.who || 'vegeta', opts.count || 'Keep up, Kakarot.', 2, { style: 'quiet' });
    yield* m.cine(1.4);
    const res = yield* m.rhythm(STEPS.map((s) => ({ key: 'light', label: s.label })), {
      beat: GG.beat,
      window: opts.window || GG.window,
      perfect: GG.perfect,
      lead: 1,
      onBeat: (i) => {
        const st = STEPS[i];
        const ha = st.id === 'ha';
        S.goku.setState('scripted', { pose: st.pose + 'R', expression: ha ? 'shout' : 'grin', speed: 18 });
        S.vegeta.setState('scripted', { pose: st.pose, expression: ha ? 'shout' : 'angry', speed: 18 });
        if (st.id.startsWith('step')) {
          const k = Number(st.id.slice(4));
          const gap = U.lerp(1.7, 0.55, k / 3);
          K.place(S.goku, at(b, -gap, 4.2), Math.PI);
          K.place(S.vegeta, at(b, gap, 4.2), Math.PI);
        }
        if (st.call) {
          m.say('vegeta', st.call, 0.8, { style: 'shout' });
          b.sfx('swing', S.vegeta, { pitch: 1.1, vol: 0.7 });
        }
      },
    });
    m.endShot();
    m.flags.danceScores = (m.flags.danceScores || []).concat([Math.round(res.score * 100) / 100]);
    return res.hits.some((h) => h.grade === 'miss') ? 'timing' : 'ok';
  }

  /** The light where they meet, and one body standing in it. */
  function fuse(m) {
    const b = m.battle, S = b.story;
    const g = S.goku, v = S.vegeta;
    const mid = g.pos.clone().lerp(v.pos, 0.5);
    b.vfx.flash(mid.clone().add(new V3(0, 0.9, 0)), 5, 0xffffff, 0.6, SL.Toon.tex.glow);
    b.vfx.ring(mid.clone().add(new V3(0, 0.9, 0)), 7, 0xfff4d8, 0.7);
    b.vfx.ring(mid.clone().add(new V3(0, 0.1, 0)), 10, 0xffffff, 0.7, new V3(0, 1, 0));
    SL.ScreenFX.flash(0.85, '#ffffff');
    b.sfx('transformBurst', v, { pitch: 1.15 });
    b.cameraTraumaAt(mid, 0.5);
    const h = SL.Fusion.fuse(b, g, v, 'gogeta', { silent: true, hpFrac: 1 });
    S.fusion = h;
    S.gogeta = h.fused;
    const gg = h.fused;
    gg.untargetable = true;
    gg.controller = K.scripted();
    K.faceTo(gg, S.kai.pos);
    gg.setState('scripted', { pose: 'gg_arrival', expression: 'closed' });
    b.emit('fusionDance', { id: 'gogeta', fused: gg });
    return gg;
  }

  /**
   * The Old Kai's trick (What If): the fusion's will keeps the body, and the two who made it are
   * given back theirs — the same two fighters, stepping out of the light either side of him.
   */
  function* echo(m) {
    const b = m.battle, S = b.story, gg = S.gogeta;
    S.kai.setState('scripted', { pose: 'ek_ritualA', expression: 'calm' });
    SL.Cinema.shotOn(m, { kai: S.kai }, { subject: 'kai', focus: 'upper', angle: 'front' }, 3, { cut: true, blendIn: 0, hold: true });
    m.say('elder_kai', 'Hold still. There\'s something an old Kai has only ever read about...', 3);
    yield* m.cine(3.1);
    const fwd = gg.forward.clone().setY(0).normalize();
    const side = new V3(fwd.z, 0, -fwd.x);
    if (S.fusion) {
      S.fusion.active = false;
      gg.fusion = null;
    }
    [[S.goku, 1], [S.vegeta, -1]].forEach(([p, s]) => {
      const pos = at(b, gg.pos.x + side.x * 3.4 * s + fwd.x * 1.6, gg.pos.z + side.z * 3.4 * s + fwd.z * 1.6);
      K.place(p, pos, 0);
      K.faceTo(p, gg.pos);
      p.fusedInto = null;
      p.setHidden(false);
      p.untargetable = false;
      p.intangible = false;
      p.setState('scripted', { pose: 'idle', expression: 'shock' });
      b.vfx.flash(p.chest(), 2.4, 0xfff4d8, 0.45, SL.Toon.tex.glow);
      b.vfx.ring(p.chest(), 2.6, 0xffe9b0, 0.5);
    });
    b.sfx('magic', null, { vol: 0.8 });
    SL.ScreenFX.flash(0.4, '#fff4d8');
    m.endShot();
    yield* m.cine(0.4);
  }

  /** The fight's staging: the two of them on one side, Gogeta on the other, the Old Kai well back. */
  function spread(b) {
    const S = b.story;
    K.place(S.goku, at(b, -3.5, 7), Math.PI);
    K.place(S.vegeta, at(b, 3.5, 7), Math.PI);
    K.place(S.gogeta, at(b, 0, -5), 0);
    K.place(S.kai, at(b, 18, 16), -Math.PI * 0.75);
    K.watcher(S.kai, 'ek_idle', 'shock');
    for (const f of [S.goku, S.vegeta]) K.faceTo(f, S.gogeta.pos);
    K.faceTo(S.gogeta, S.goku.pos.clone().lerp(S.vegeta.pos, 0.5));
  }

  /** Entered from a checkpoint: Gogeta stands there already (the dance is behind them). */
  function ensureGogeta(b) {
    const S = b.story;
    if (S.gogeta && S.gogeta.alive) return S.gogeta;
    S.gogeta = b.spawn({ charId: 'gogeta', team: 1, pos: at(b, 0, -5), startKi: 100 });
    for (const p of [S.goku, S.vegeta]) {
      p.setHidden(false);
      p.untargetable = false;
      p.intangible = false;
      p.fusedInto = null;
    }
    return S.gogeta;
  }

  /** Both of them, the player's team, against him. */
  function arm(m, gg) {
    const b = m.battle, S = b.story;
    gg.team = 1;
    gg.untargetable = false;
    gg.intangible = false;
    gg.cannotDie = true;
    gg.tags = Object.assign({}, gg.tags, { boss: true, priority: true });
    for (const p of [S.goku, S.vegeta]) {
      p.untargetable = false;
      p.intangible = false;
      p.setState('free');
      p.target = gg;
    }
    // the seat first (a fusion born from the player's Goku had it), then his own brain
    b.switchPlayer(S.goku, { force: true });
    b.setParty([S.goku, S.vegeta], { allyDifficulty: 'normal' });
    gg.isPlayer = false;
    gg.controller = cpu(b);
    gg.target = S.goku;
    gg.setState('free');
    m.flags.armed = true;
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'gg_arrive');
    },
  };

  P.dance = {
    id: 'dance',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      m.music('journey', 2);
      m.objective('dance', 'The Fusion Dance: press on every beat', { icon: 'transform' });
      const lines = [
        { who: 'vegeta', count: 'Keep up, Kakarot.' },
        { who: 'vegeta', count: 'You were OFF, Kakarot! AGAIN.' },
        { who: 'goku', count: 'Me?! Your finger was crooked! ...Okay, okay. Again.' },
        { who: 'elder_kai', count: 'Slower, slower. I\'ll count for you, children.' },
      ];
      let tries = 0;
      for (;;) {
        tries++;
        const assisted = tries > GG.assistAfter;
        const l = lines[Math.min(tries - 1, lines.length - 1)];
        const out = yield* dance(m, { window: assisted ? GG.assistWindow : GG.window, who: l.who, count: l.count });
        m.flags.danceTries = tries;
        if (out === 'ok' || tries >= GG.maxTries) break;
        // out of step: no fusion, just two proud men glaring at each other
        const S = b.story;
        S.goku.setState('scripted', { pose: 'idle', expression: 'nervous' });
        S.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'angry' });
        b.vfx.flash(S.goku.chest().lerp(S.vegeta.chest(), 0.5), 1.4, 0xffffff, 0.2, SL.Toon.tex.glow);
        b.sfx('capsulePop', S.vegeta, { pitch: 0.6, vol: 0.7 });
        SL.Cinema.shotOn(m, { vegeta: S.vegeta }, { subject: 'vegeta', focus: 'closeup', angle: 'three' }, 1.8, { cut: true, blendIn: 0, hold: true });
        m.say('vegeta', 'Nothing. NOTHING happened.', 1.8, { style: 'shout' });
        yield* m.cine(1.9);
        m.endShot();
      }
      m.complete('dance');
      m.qteParts.push(1 / tries);
    },
  };

  P.birth = {
    id: 'birth',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      fuse(m);
      yield* SL.Cinema.play(m, 'gg_birth');
      yield* echo(m);
      yield* SL.Cinema.play(m, 'gg_echo');
      void b;
    },
  };

  P.fight = {
    id: 'fight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const gg = ensureGogeta(b);
      if (gg.formIndex !== 0) gg.applyForm(0);
      gg.hp = gg.hpMax;
      gg.ki = gg.kiMax;
      // base form: he plays with them first; the gold is the story's beat, not a coin toss
      gg.lockedForms = Object.assign({}, gg.lockedForms, { ssj: true });
      spread(b);
      for (const p of [S.goku, S.vegeta]) {
        p.hp = p.hpMax;
        p.ki = p.kiMax;
      }
      arm(m, gg);
      const fight = m.storyFight({ floors: [{ f: gg, at: GG.goldAt }] });
      m.music('gogeta_z_arrival', 1);
      m.objective('gogeta', 'Defeat Gogeta', { icon: 'fist' });
      m.objective('both', 'Keep both of you standing', { icon: 'guard', optional: true });
      m.prompt('ggTf', 'transform', 'Transform', { always: true, when: () => b.player.formIndex === 0 && b.player.state === 'free' && b.player.ki >= 50, until: () => b.player.formIndex > 0 });
      m.prompt('ggSwap', 'partyNext', 'Switch fighter', { always: true, when: () => b.player.hpFrac < 0.4 && b.partyAlive().length > 1, until: () => SL.Input.pressed('partyNext') });
      const offKo = b.on('allyDown', () => m.failObjective('both'));
      m.onDispose(offKo);
      m.lock(false);
      b.aiLocked = false;
      yield () => fight.floored(gg) || m.state !== 'running';
      offKo();
    },
  };

  P.gold = {
    id: 'gold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      const gg = ensureGogeta(b);
      if (!m.flags.armed) {
        // entered from this checkpoint: the first half is behind them
        if (gg.formIndex !== 0) gg.applyForm(0);
        spread(b);
        arm(m, gg);
        gg.hp = gg.hpMax * GG.goldAt;
        m.objective('gogeta', 'Defeat Gogeta', { icon: 'fist' });
      }
      // "Not bad. Now it's my turn." — a breath of story, then his transformation IS gameplay:
      // his own sequence, the world holding while the cinematic camera shows it
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      yield* SL.Cinema.play(m, 'gg_serious');
      if (gg.lockedForms) delete gg.lockedForms.ssj;
      gg.ki = gg.kiMax;
      const ssj = gg.def.forms.findIndex((x) => x.id === 'ssj');
      gg.setState('transform', { form: gg.def.forms[ssj], index: ssj });
      b.emit('transformStart', { fighter: gg, form: gg.def.forms[ssj] });
      m.lock(false);
      b.aiLocked = false;
      yield () => gg.state !== 'transform';
      gg.ki = Math.max(gg.ki, 60);
      m.music('gogeta_z_arrival', 3);
      const fight = m.storyFight({ floors: [{ f: gg, at: GG.beatenAt }] });
      const offKo = b.on('allyDown', () => m.failObjective('both'));
      m.onDispose(offKo);
      yield () => fight.floored(gg) || m.state !== 'running';
      offKo();
      if (m.state !== 'running') return;
      m.complete('gogeta');
      if (b.partyAlive().length === 2) m.complete('both');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      m.flags.beatHim = true;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const gg = S.gogeta;
      if (gg && gg.formIndex !== 0) gg.applyForm(0);
      // the three of them where the fight ended: Gogeta down, the two of them in front of him
      if (gg) {
        K.place(gg, at(b, gg.pos.x, gg.pos.z), gg.yaw);
        const fwd = gg.forward.clone().setY(0).normalize();
        const side = new V3(fwd.z, 0, -fwd.x);
        [[S.goku, 1], [S.vegeta, -1]].forEach(([p, s]) => {
          if (p.formIndex !== 0) p.applyForm(0);
          p.hp = Math.max(p.hp, 1);
          p.alive = true;
          K.place(p, at(b, gg.pos.x + fwd.x * 3.4 + side.x * 1.6 * s, gg.pos.z + fwd.z * 3.4 + side.z * 1.6 * s), 0);
          K.faceTo(p, gg.pos);
          p.setState('scripted', { pose: 'idle', expression: 'grin' });
        });
        K.place(S.kai, at(b, gg.pos.x - side.x * 4, gg.pos.z - side.z * 4), 0);
        K.faceTo(S.kai, gg.pos);
      }
      yield* SL.Cinema.play(m, 'gg_after');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title('WHAT IF...?', 'THE ULTIMATE FUSION', 'Gogeta joins the roster · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_gogeta',
    whatIf: true,
    branchOf: 'buu_spiritbomb',
    branchPoint: 'peace',
    chapter: 'WHAT IF · THE BUU SAGA',
    title: 'The Ultimate Fusion',
    subtitle: 'The Sacred World of the Kai · Age 774 · Alternate timeline',
    character: 'goku',
    stage: 'kai_world',
    parTime: 420,
    qteLabel: 'Dance in step',
    // his transformation brings his theme in (Fighter.transformSequence step.song)
    formSongs: true,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'What if Goku and Vegeta finally danced? A perfect fusion — and the Old Kai lets the two of them find out what they would make. Beat him, and he is yours.',
    rewards: ['Gogeta (playable)', 'Gogeta: Super Saiyan', 'Costume: Gogeta (Super Broly)'],
    setup,
    phases: [P.arrive, P.dance, P.birth, P.fight, P.gold, P.after],
  };

  SL.data.gogetaFusion = { GG };
  SL.data.missions[def.id] = def;
})();
