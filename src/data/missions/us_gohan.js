/*
 * CHAPTER 21 · UNIVERSE SURVIVAL — "Father and Son" (Goku vs Gohan, the sparring match before the Tournament of Power).
 * Tournament of power ui.docx §2: grounded to start, a wide shot that sets Goku's relaxed confidence against Gohan's
 * concentration; short-range punches, blocks and counters with both fighters in frame; Gohan shows he can keep up;
 * Goku raises the intensity through stronger forms; it ends on the two of them recognising that Gohan can fight
 * seriously again. The owner's still: Super Saiyan Blue Goku and Gohan meeting fist to fist in the air.
 *
 *   OPEN *     (scene us_open)   the training ground; Piccolo has had Gohan for weeks; "test him yourself"
 *   SPAR *     (play)            base against base, on the ground (SL.Staging 'ground'): read him, counter him. He keeps up.
 *                                A knockout is a defeat (retry). Ends on his floor
 *   RISE       (staged)          Gohan's Ultimate power comes back — the white flare; Goku answers in Super Saiyan Blue
 *   PRESS *    (play)            Blue Goku vs Ultimate Gohan: faster, heavier, and Gohan presses now. Ends on his floor
 *   CLASH      (cue + staged)    one last exchange: they meet in the air, fist against fist (Heavy)
 *   END        (staged)          the recognition: Gohan is back; he will fight in the tournament — and he has a plan
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const CHAPTER = 'CHAPTER 21 · UNIVERSE SURVIVAL';
  const TU = {
    spar: { floor: 0.65, gohanDealt: 0.22, gohanTaken: 1.25 },
    press: { floor: 0.35, gohanDealt: 0.22, gohanTaken: 1.15 },
  };
  const SPOT = { goku: [0, 6], gohan: [0, -6], piccolo: [13, -2] };
  const at = (b, k) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]));

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: at(b, 'goku'), startKi: 80 });
    S.goku._playerController = S.goku.controller;
    S.gohan = b.spawn({ charId: 'adult_gohan', team: 1, pos: at(b, 'gohan'), startKi: 60 });
    S.piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(b, 'piccolo'), startKi: 0 });
    for (const f of Object.values(S)) f.cannotDie = true;
    K.watcher(S.piccolo, 'armsCrossed', 'serious');
    K.faceTo(S.piccolo, new V3(0, 0, 0));
    K.watcher(S.gohan, 'ag_idle', 'determined');
    K.faceTo(S.goku, S.gohan.pos);
    K.faceTo(S.gohan, S.goku.pos);
    return S;
  }

  SL.data.scenes.us_open = {
    id: 'us_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      // §2: the wide, grounded opening — father and son facing each other across the rock
      {
        cam: { subject: 'goku', with: 'gohan', focus: 'wide', angle: 'side' },
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }, { who: 'gohan', pose: 'ag_fight', face: 'determined' }],
        title: { chapter: CHAPTER, title: 'FATHER AND SON', subtitle: 'Before the Tournament of Power', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: 'He has trained with me every day for weeks. Don\'t take my word for it — test him yourself.', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Alright, Gohan! Show me what you\'ve got. No holding back!', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'gohan', focus: 'upper', angle: 'low' },
        say: { who: 'gohan', line: 'Don\'t you hold back either, Dad.', duration: 2.4 },
        hold: 2.5,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, at(b, 'goku'), Math.PI);
      K.place(S.gohan, at(b, 'gohan'), 0);
    },
  };

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    BK.give(b.story.goku, 'blue');
    BK.give(b.story.gohan, 'ultimate');
  }

  /** One sparring stretch on the ground. Ends on Gohan's floor; a knockout is a real defeat. */
  function* spar(m, cfg, ai) {
    const b = m.battle, S = b.story, g = S.goku, gh = S.gohan;
    g.cannotDie = false;
    gh.cannotDie = true;
    g.untargetable = g.intangible = gh.untargetable = gh.intangible = false;
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    g.target = gh;
    gh.target = g;
    gh.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, gh.def.ai, (gh.form && gh.form.ai) || {}, ai, { transformHp: 0 }) });
    g.setState('free');
    gh.setState('free');
    const sf = m.storyFight({
      floors: [{ f: gh, at: cfg.floor }], dealt: [{ f: gh, mul: cfg.gohanDealt }], taken: [{ f: gh, mul: cfg.gohanTaken }],
      ease: { foe: gh, hero: g, below: 0.4, min: 0.5 }, fighters: [g, gh], space: 'ground',
    });
    // a counter: a blow that lands inside the window a dodge or a Perfect Guard opens (Fighter.counterFrames; the hit
    // that uses it clears it, so the window is remembered from the frame before)
    let counters = 0, windowAt = -99;
    const watch = () => {
      if (g.counterFrames > 0) windowAt = b.frame;
    };
    m.tickHooks.push(watch);
    const offW = () => K.unhook(m, watch);
    const offDmg = b.on('damage', (e) => {
      if (e.attacker === g && e.target === gh && b.frame - windowAt <= 2) m.progress('counters', ++counters);
    });
    const offD = () => {
      offDmg();
      offW();
    };
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => sf.floored(gh) || m.state !== 'running';
    offD();
    sf.off();
    g.cannotDie = true;
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    return m.state === 'running';
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m);
    const S = m.battle.story;
    K.toForm(S.goku, 'base');
    K.toForm(S.gohan, 'base');
    yield* SL.Cinema.play(m, 'us_open');
  } };

  P.spar = { id: 'spar', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, gh = S.gohan;
    stage(m);
    K.toForm(g, 'base');
    K.toForm(gh, 'base');
    K.place(g, at(b, 'goku'), Math.PI);
    K.place(gh, at(b, 'gohan'), 0);
    g.hp = g.hpMax;
    gh.hp = gh.hpMax;
    m.title(CHAPTER, 'THE TEST', 'Goku vs Gohan', 2.4);
    m.objective('spar', 'Test him: short exchanges on the ground — block, read, counter', { icon: 'fist' });
    m.objective('counters', 'Counter him (a blow straight after a dodge or a guard)', { icon: 'fist', optional: true, target: 4 });
    const ok = yield* spar(m, TU.spar, { aggression: 0.55, defense: 0.65 });
    if (!ok) return;
    m.complete('spar');
  } };

  /** His Ultimate power comes back; Goku goes Super Saiyan. */
  P.rise = { id: 'rise', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, gh = S.gohan;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    gh.controller = K.scripted();
    if (g.pos.distanceTo(gh.pos) < 6) K.place(gh, K.ground(b, g.pos.clone().add(new V3(0, 0, -8))), 0);
    K.faceTo(g, gh.pos);
    K.faceTo(gh, g.pos);
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
    gh.setState('scripted', { pose: 'ag_charge', expression: 'shout', aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'gohan', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('gohan', 'I\'m not done yet!', 2, { style: 'shout' });
    yield* st.wait(1.6);
    K.toForm(gh, 'ultimate');
    b.vfx.ring(gh.pos.clone().add(new V3(0, 0.1, 0)), 8, 0xeef4ff, 0.6, new V3(0, 1, 0));
    b.vfx.flash(gh.chest(), 3, 0xffffff, 0.4, SL.Toon.tex.glow);
    b.vfx.dust(gh.pos.clone(), 3, 16);
    b.sfx('transformBurst', gh, { vol: 1 });
    b.cameraTraumaAt(gh.chest(), 0.6);
    gh.setState('scripted', { pose: 'ag_fight', expression: 'determined', speed: 10 });
    yield* st.wait(1.2);
    SL.Cinema.shotOn(m, S, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('piccolo', 'There it is. The power the Elder Kai drew out of him.', 3);
    yield* st.wait(3);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'That\'s it, Gohan! Then I\'m not holding back either!', 2.6, { style: 'shout' });
    yield* st.wait(1.4);
    K.toForm(g, 'blue');
    b.vfx.ring(g.pos.clone().add(new V3(0, 0.1, 0)), 7, 0x3ac8ff, 0.5, new V3(0, 1, 0));
    b.vfx.flash(g.chest(), 2.4, 0x8ae0ff, 0.4, SL.Toon.tex.glow);
    b.sfx('transformBurst', g, { vol: 0.9 });
    g.setState('scripted', { pose: 'g_godStance', expression: 'grin', speed: 8 });
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
  } };

  P.press = { id: 'press', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, gh = S.gohan;
    stage(m);
    K.toForm(g, 'blue');
    K.toForm(gh, 'ultimate');
    g.hp = Math.max(g.hp, g.hpMax * 0.85);
    gh.hp = Math.min(gh.hp, gh.hpMax * TU.spar.floor);
    if (g.pos.distanceTo(gh.pos) < 4) K.place(gh, K.ground(b, g.pos.clone().add(new V3(0, 0, -7))), 0);
    m.title(CHAPTER, 'THE TEST', 'Super Saiyan Blue Goku vs Ultimate Gohan', 2.4);
    m.objective('press', 'He is faster now and he presses — keep up with him', { icon: 'fist' });
    const ok = yield* spar(m, TU.press, { aggression: 0.65, defense: 0.55 });
    if (!ok) return;
    m.complete('press');
  } };

  /** One last exchange: Blue against Ultimate, fist against fist in the air. */
  P.clash = { id: 'clash', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, gh = S.gohan;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    gh.controller = K.scripted();
    const mid = K.ground(b, g.pos.clone().lerp(gh.pos, 0.5));
    K.place(g, K.ground(b, mid.clone().add(new V3(0, 0, 5))), Math.PI);
    K.place(gh, K.ground(b, mid.clone().add(new V3(0, 0, -5))), 0);
    K.faceTo(g, gh.pos);
    K.faceTo(gh, g.pos);
    K.toForm(g, 'blue');
    g.setState('scripted', { pose: 'g_godStance', expression: 'grin', aura: 1 });
    gh.setState('scripted', { pose: 'ag_fight', expression: 'determined', aura: 1 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'gohan', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Last one, Gohan — give it everything!', 2.4, { style: 'shout' });
    const r = yield* st.cue('heavy', 'Meet him in the air (Heavy)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    // up and at each other: the owner's still, fist against fist in the air
    const gFrom = g.pos.clone(), hFrom = gh.pos.clone();
    const meet = mid.clone().add(new V3(0, 4, 0));
    g.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 30, aura: 1 });
    gh.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 30, aura: 1 });
    m.shot((t, o) => {
      o.pos.copy(meet).add(new V3(6.5, 0.4, 0));
      o.look.copy(meet);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 16);
      g.setPosition(gFrom.clone().lerp(meet.clone().add(new V3(0, 0, 0.7)), k));
      gh.setPosition(hFrom.clone().lerp(meet.clone().add(new V3(0, 0, -0.7)), k));
      g.vel.set(0, 0, 0);
      gh.vel.set(0, 0, 0);
      if (n % 3 === 0) {
        b.vfx.afterimage(g.pos, g.height, 0x8ad8ff);
        b.vfx.afterimage(gh.pos, gh.height, 0xeef4ff);
      }
      return n >= 16;
    };
    SL.ScreenFX.flash(0.4, '#e8f6ff');
    b.vfx.impact(meet, 5, 0xffffff);
    b.vfx.ring(meet, 6, 0x8ad8ff, 0.5);
    b.cameraTraumaAt(meet, 0.9);
    b.sfx('punchHeavy', g, { pitch: 0.6, vol: 1.4 });
    b.slowmo(0.2, 0.6);
    yield* st.wait(1.2);
    // back down, apart
    K.place(g, K.ground(b, mid.clone().add(new V3(0, 0, 3))), Math.PI);
    K.place(gh, K.ground(b, mid.clone().add(new V3(0, 0, -3))), 0);
    K.faceTo(g, gh.pos);
    K.faceTo(gh, g.pos);
    g.setState('scripted', { pose: 'exhausted', expression: 'grin', speed: 8 });
    gh.setState('scripted', { pose: 'exhausted', expression: 'grin', speed: 8 });
    b.vfx.dust(g.pos.clone(), 1, 8);
    b.vfx.dust(gh.pos.clone(), 1, 8);
    yield* st.wait(0.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The recognition: he can fight seriously again. */
  P.end = { id: 'end', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, gh = S.gohan;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    gh.controller = K.scripted();
    K.toForm(g, 'base');
    K.toForm(gh, 'base');
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
    gh.setState('scripted', { pose: 'ag_sheepish', expression: 'grin' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'gohan', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Hah... You\'re back, Gohan. You really are.', 2.8);
    yield* st.wait(2.8);
    SL.Cinema.shotOn(m, S, { subject: 'gohan', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    gh.setState('scripted', { pose: 'ag_fight', expression: 'determined', speed: 6 });
    m.say('gohan', 'I want to fight in the tournament, Dad. Seriously this time — and as a team. I already have a plan.', 4);
    yield* st.wait(4);
    SL.Cinema.shotOn(m, S, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('piccolo', 'Hmph. He gets that from me.', 2.2);
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'FATHER AND SON', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.usGohan = { TU };
  SL.data.missions.us_gohan = {
    id: 'us_gohan', canon: true, chapter: CHAPTER, title: 'Father and Son', character: 'goku', stage: 'wasteland',
    subtitle: 'Universe Survival · Goku vs Gohan', parTime: 480, qteLabel: 'The last exchange',
    blurb: 'Eight universes will fight for their lives. Before Goku names his team, he has to know one thing: can Gohan fight seriously again?',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, adult_gohan: { outfit: 'ag_ultimate' } },
    lockForms: {
      goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
      adult_gohan: SL.data.characters.adult_gohan.forms.filter((x) => !['base', 'ultimate'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Gohan joins the team for the Tournament of Power'],
    setup,
    phases: [P.open, P.spar, P.rise, P.press, P.clash, P.end],
  };
})();
