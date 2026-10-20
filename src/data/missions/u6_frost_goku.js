/*
 * CHAPTER 18 · UNIVERSE 6 — Round 2: "The Gentleman" (Goku vs Frost).
 * Owner's combat storyboard row 2: FORMS → SUPER SAIYAN → HIDDEN NEEDLE → DIZZY RING-OUT (Goku alive).
 *
 *   OPEN *     (scene u6r2_open)  Frost's public face: the bow, the "fair fight"; the match called
 *   FIRST *    (play)             base Goku vs Frost's first form, tournament rules (a real defeat retries). Ends on
 *                                 Frost's story floor
 *   CHANGE     (staged)           Frost changes to his final form (SL.data.cinematics.transform); Goku answers with
 *                                 Super Saiyan (hold Charge — SL.data.cinematics.ascend)
 *   CLASH *    (play)             Super Saiyan Goku vs final-form Frost; a knockout or ring-out here is a DEFEAT (retry)
 *   NEEDLE     (staged)           close in, the forearm strike: the close-up of Frost's wrist, a purple glint; Goku's
 *                                 body locks up, the world swims (wobble, slow motion, a purple tint); Frost's kick puts
 *                                 the dizzy Goku over the edge — the authored loss, ruled a ring-out. Goku is alive.
 * Every phase marked * is a checkpoint.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit, C = SL.data.cinematics;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  // TUNING: story floors and damage per stretch, the Super Saiyan hold
  const TU = { firstFloor: 0.6, frostDealt1: 0.5, clashFloor: 0.32, frostDealt2: 0.55, ssjHold: 2.4 };

  SL.data.scenes.u6r2_open = {
    id: 'u6r2_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.goku, UK().at(b, UK().RING.a), Math.PI);
          K.place(S.frost, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.goku, S.frost.pos);
          K.faceTo(S.frost, S.goku.pos);
        },
        pose: [{ who: 'frost', pose: 'fr_bow', face: 'calm', speed: 5 }, { who: 'goku', pose: 'g_handsHips', face: 'grin' }],
        cam: { subject: 'frost', focus: 'full', angle: 'three' },
        title: { chapter: CHAPTER, title: 'THE GENTLEMAN', subtitle: 'Round 2 · Goku vs Frost', duration: 3.6 },
        say: { who: 'frost', line: 'Son Goku. An honour. I fight for the peace of my universe — let us have a clean match.', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'You look just like Frieza... but you\'re nice? Weird. Okay, let\'s go!', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'goku', with: 'frost', focus: 'full', angle: 'side' },
        say: { who: 'announcer', line: 'Second match! Son Goku against Frost! Begin!', duration: 2.4 },
        hold: 2.5,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.frost, UK().at(b, UK().RING.c), 0);
      K.watcher(S.frost, 'idle', 'calm');
    },
  };

  /** The two on the ring in the right forms (every checkpoint and retry starts here). */
  function stage(m, gForm, fForm, place) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    UK().ring(m, { place });
    K.toForm(S.goku, gForm);
    K.toForm(S.frost, fForm);
    if (gForm === 'base') S.goku.lockedForms = Object.assign({}, S.goku.lockedForms, { ssj: true });
  }

  function* fight(m, opts) {
    const b = m.battle, S = b.story, g = S.goku, f = S.frost;
    g.hp = Math.max(g.hp, g.hpMax * opts.gokuHp);
    g.ki = Math.max(g.ki, g.kiMax * 0.6);
    f.hp = Math.max(f.hp, f.hpMax * opts.frostHp);
    const sf = m.storyFight({ floors: [{ f, at: opts.floor }], dealt: [{ f, mul: opts.dealt }], ease: { foe: f, hero: g, below: 0.45, min: 0.5 } });
    m.title(CHAPTER, opts.title, opts.subtitle, 2.4);
    m.objective('fight', opts.objective, { icon: 'fist' });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    const r = yield* UK().bout(m, { ringOut: [g], during: () => (sf.floored(f) ? { pause: true, how: 'story' } : null) });
    sf.off();
    if (m.state !== 'running' || !r.pause) return false;
    m.complete('fight');
    m.complete('ring');
    return true;
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, 'base', 'base', true);
    yield* SL.Cinema.play(m, 'u6r2_open');
  } };
  P.first = { id: 'first', checkpoint: true, run: function* (m) {
    stage(m, 'base', 'base', true);
    m.battle.story.goku.hp = m.battle.story.goku.hpMax;
    yield* fight(m, { gokuHp: 1, frostHp: 1, floor: TU.firstFloor, dealt: TU.frostDealt1, title: 'ROUND 2', subtitle: 'Base Goku vs Frost · first form', objective: 'Test the gentleman from Universe 6' });
  } };
  P.change = { id: 'change', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, f = S.frost;
    stage(m, 'base', 'base');
    g.controller = K.scripted();
    f.controller = K.scripted();
    K.watcher(g, 'idle', 'serious');
    m.say('frost', 'Splendid. Then allow me to be a little less polite.', 2.6);
    yield* C.transform(m, { fighter: f, formIndex: K.formIndex(f, 'final'), witness: g, music: 3,
      witnessLine: 'Just like Frieza... All right, then I\'ll get serious too!' });
    K.toForm(f, 'final');
    m.objective('ssj', 'Super Saiyan: hold Charge', { icon: 'transform' });
    if (g.lockedForms) delete g.lockedForms.ssj;
    UK().control(m);
    yield* C.ascend(m, { fighter: g, form: 'ssj', witness: f, seconds: TU.ssjHold, label: 'Hold Charge — Super Saiyan', meter: 'SUPER SAIYAN', music: 3 });
    m.complete('ssj');
  } };
  P.clash = { id: 'clash', checkpoint: true, run: function* (m) {
    stage(m, 'ssj', 'final');
    yield* fight(m, { gokuHp: 0.85, frostHp: 0.9, floor: TU.clashFloor, dealt: TU.frostDealt2, title: 'SUPER SAIYAN', subtitle: 'Super Saiyan Goku vs Frost · final form', objective: 'Push Frost to the limit' });
  } };

  /** The storyboard's HIDDEN NEEDLE and DIZZY RING-OUT. */
  P.needle = { id: 'needle', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, f = S.frost;
    stage(m, 'ssj', 'final');
    const st = UK().staged(m);
    g.controller = K.scripted();
    f.controller = K.scripted();
    // close: one more exchange near the edge
    const mid = K.ground(b, new V3(U.clamp(g.pos.x, -6, 6), 0, U.clamp(g.pos.z, -9, 9)));
    K.place(g, mid, 0);
    const toEdge = new V3(0, 0, mid.z >= 0 ? 1 : -1);
    K.place(f, K.ground(b, mid.clone().addScaledVector(toEdge, -1.2)), 0);
    K.faceTo(g, f.pos);
    K.faceTo(f, g.pos);
    g.setState('scripted', { pose: 'g_cross', expression: 'shout', speed: 24 });
    f.setState('scripted', { pose: 'fz_jab', expression: 'cold', speed: 24 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'frost', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    b.vfx.impact(g.chest(), 2, 0xffe27a);
    b.sfx('punchHeavy', g);
    yield* st.wait(0.5);
    // the close-up: Frost's wrist against Goku's arm — a thin purple glint where the needle comes out
    const wrist = f.handPos ? f.handPos('R') : f.chest();
    m.shot((t, o) => {
      const w = f.handPos ? f.handPos('R') : f.chest();
      o.pos.copy(w).add(new V3(0.55, 0.15, 0.4));
      o.look.copy(w);
      o.fov = 26;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.vfx.slash(wrist, wrist.clone().addScaledVector(f.forward, 0.25), 0xb84aff, 0.6, 0.012);
    b.vfx.flash(wrist, 0.35, 0xb84aff, 0.4, SL.Toon.tex.glow);
    b.slowmo(0.3, 0.8);
    yield* st.wait(1.1);
    // Goku's body locks up: the world swims
    g.setState('scripted', { pose: 'stagger', expression: 'hurt', speed: 3 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    SL.ScreenFX.flash(0.25, '#b88aff');
    m.say('goku', 'Wha... my body... it won\'t move right...', 2.6, { style: 'quiet' });
    const wob = () => {
      if (b.frame % 6 === 0) b.camera.addTrauma(0.12);
      if (b.frame % 20 === 0) b.vfx.sparks(g.headPos ? g.headPos() : g.chest(), 0xc89aff, 3, 1.5, 0.06);
    };
    m.tickHooks.push(wob);
    yield* st.wait(2.6);
    // the kick, and over the edge
    f.setState('scripted', { pose: 'fz_kick', expression: 'smirk', speed: 26 });
    b.vfx.impact(g.chest(), 3, 0xb8d0ff);
    b.sfx('punchHeavy', g, { pitch: 0.7, vol: 1.2 });
    m.shot((t, o) => {
      o.pos.copy(g.pos).add(new V3(7, 2.5, -toEdge.z * 2));
      o.look.copy(g.chest());
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* UK().ringOutTo(m, g, toEdge, { height: 2.5 });
    K.unhook(m, wob);
    // the gold goes out of him on the ground; he is alive, dazed
    g.applyForm(0);
    g.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
    f.setState('scripted', { pose: 'fr_polite', expression: 'calm' });
    b.emit('matchEnd', { winner: f, loser: g, how: 'ringout' });
    yield* SL.Tournament.announce(m, 'ringout', { winner: f, loser: g }, { seconds: 3 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Ugh... my head\'s spinning. Sorry, guys — I lost.', 2.8);
    yield* st.wait(2.8);
    SL.Cinema.shotOn(m, S, { subject: 'whis', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('whis', 'How odd. Goku was not tired at all... and yet his body simply stopped.', 3.2);
    yield* st.wait(3.2);
    m.endShot();
    b.skipRequested = false;
    yield* UK().close(m, CHAPTER, 'ROUND 2 · FROST WINS');
  } };

  SL.data.u6FrostGoku = { TU };
  SL.data.missions.u6_frost_goku = {
    id: 'u6_frost_goku', canon: true, chapter: CHAPTER, title: 'The Gentleman', character: 'goku', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 2 · Goku vs Frost', parTime: 480, qteLabel: 'The needle',
    blurb: 'Frost is everything Frieza is not: polite, admired, a hero of his universe. Goku likes him at once.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    // the storyboard: base, then Super Saiyan; nothing beyond it in this round
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'ssj'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Frost\'s first win'],
    setup: (b) => SL.data.u6Kit.setup(b, 'goku', 'frost'),
    phases: [P.open, P.first, P.change, P.clash, P.needle],
  };
})();
