/*
 * CHAPTER 18 · UNIVERSE 6 — Round 1: "The Bear Who Can't Be Hit" (Goku vs Botamo). Base Goku.
 * Owner's combat storyboard row 1: SILHOUETTE → RESISTANCE → LIFT → RING-OUT.
 *
 *   OPEN *     (scene u6r1_open)  the arena, the Super Dragon Balls, the gods; the rules (knockout, ring-out, surrender;
 *                                 five a side); Universe 6's first fighter: Botamo; Goku steps up
 *   RESIST *   (play)             tournament rules. Botamo is rubber: blows sink in and bounce back (Mission.powerGap: no
 *                                 flinch, no knockback, a dull tap). He shoves you toward the edge — rung out or knocked out
 *                                 is a DEFEAT (retry). The answer the story teaches: if he can't be hurt, he can be moved —
 *                                 get him near the edge, get in close, and a prompt offers the lift (Heavy)
 *   LIFT       (cue + staged)     under him, both arms, up over Goku's head (the storyboard's LIFT), and thrown over the
 *                                 edge (RING-OUT); the announcer's ruling; Champa's fury
 * Every phase marked * is a checkpoint.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  // TUNING: the edge zone where the lift is offered (m from the edge), how close Goku must be, Botamo's damage
  const TU = { liftEdge: 5.5, liftReach: 2.4, botamoDealt: 0.55, hintAfter: 6 };

  SL.data.scenes.u6r1_open = {
    id: 'u6r1_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      {
        cam: { from: [64, 26, 64], to: [50, 20, -44], look: [-10, 12, -10], look2: [0, 8, 0], fov: 58, fov2: 52, ease: 'inOut', raw: true },
        title: { chapter: CHAPTER, title: 'THE TOURNAMENT OF DESTROYERS', subtitle: 'Round 1 · Goku vs Botamo', duration: 4.2 },
        hold: 4.4,
      },
      {
        cam: { subject: 'vados', focus: 'upper', angle: 'three' },
        say: { who: 'vados', line: 'The rules are simple. Knock your opponent out, push them out of the ring, or make them give up. Five fighters each.', duration: 4.6 },
        hold: 4.7,
      },
      {
        cam: { subject: 'champa', focus: 'medium', angle: 'three' },
        pose: { who: 'champa', pose: 'ch6_shout', face: 'grin' },
        say: { who: 'champa', line: 'Botamo! Show them why nobody in Universe 6 can lay a finger on you!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.goku, UK().at(b, UK().RING.a), Math.PI);
          K.place(S.botamo, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.goku, S.botamo.pos);
          K.faceTo(S.botamo, S.goku.pos);
          // the storyboard's SILHOUETTE: behind Goku, the bear filling the frame
          ctx.m.shot((t, out) => {
            const d = S.botamo.pos.clone().sub(S.goku.pos).setY(0).normalize();
            out.pos.copy(S.goku.chest()).addScaledVector(d, -2.6).add(new V3(0.9, 0.2, 0));
            out.look.copy(S.botamo.chest()).add(new V3(0, 0.4, 0));
            out.fov = 46;
          }, 3.3, { cut: true, blendIn: 0 });
        },
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }, { who: 'botamo', pose: 'bo_idle', face: 'calm' }],
        say: { who: 'announcer', line: 'First match! From Universe 7, Son Goku! From Universe 6, Botamo!', duration: 3.2 },
        hold: 3.3,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Heh. He looks soft. Let\'s go!', duration: 2.2 },
        hold: 2.3,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.botamo, UK().at(b, UK().RING.c), 0);
      ctx.m.flags.opened = true;
    },
  };

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    m.lock(true);
    m.clearObjectives();
    UK().bench(m);
    yield* SL.Cinema.play(m, 'u6r1_open');
  } };

  P.resist = { id: 'resist', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bo = S.botamo;
    m.lock(true);
    m.clearObjectives();
    K.clearCombat(b);
    UK().ring(m, { place: true });
    g.hp = g.hpMax;
    g.ki = Math.max(g.ki, g.kiMax * 0.6);
    bo.hp = bo.hpMax;
    // the rubber: every blow and blast sinks in and bounces back
    m.powerGap(bo, { from: [g], mul: 0.02, beams: true, lines: [
      { at: 3, who: 'goku', line: 'Huh?! It\'s like punching a pillow!' },
      { at: TU.hintAfter, who: 'goku', line: 'He just bounces back... If I can\'t knock him down, I\'ll throw him out!', duration: 3.2 },
      { at: 14, who: 'whis', line: 'The rules, Goku. Remember the rules.', duration: 2.4 },
    ] });
    const fight = m.storyFight({ dealt: [{ f: bo, mul: TU.botamoDealt }] });
    m.title(CHAPTER, 'ROUND 1', 'Base Goku vs Botamo · tournament rules', 2.4);
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    m.objective('out', 'He can\'t be hurt — get him to the edge of the ring', { icon: 'fist' });
    let offered = false;
    const r = yield* UK().bout(m, {
      ringOut: [g],
      ai: { aggression: 0.8 },
      during: () => {
        const near = UK().edgeDist(bo) < TU.liftEdge;
        const close = g.distTo(bo) < TU.liftReach;
        if (near && !offered) {
          offered = true;
          m.objective('out', 'He is at the edge — get in close and lift him (Heavy)', { icon: 'fist' });
          m.prompt('u6Lift', 'heavy', 'Lift him (Heavy)', { required: true, when: () => UK().edgeDist(bo) < TU.liftEdge && g.distTo(bo) < TU.liftReach, until: () => false });
        }
        // the lift answers the player's own Heavy, not the AI's pace
        if (near && close && g.intent && g.intent.heavy) return { pause: true, how: 'lift' };
        return null;
      },
    });
    fight.off();
    m.prompts.delete('u6Lift');
    b.emit('prompt', { id: 'u6Lift', show: false });
    if (m.state !== 'running' || !r.pause) return;
    m.complete('out');
    m.complete('ring');
    m.flags.lifted = true;
  } };

  /** The storyboard's LIFT and RING-OUT: under him, up, over the edge. */
  P.lift = { id: 'lift', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bo = S.botamo;
    m.lock(true);
    m.clearObjectives();
    K.clearCombat(b);
    UK().ring(m);
    const st = UK().staged(m);
    g.controller = K.scripted();
    bo.controller = K.scripted();
    bo.storyNoSell = null;
    // a direct start: Botamo near the edge, Goku in front of him
    if (UK().edgeDist(bo) > TU.liftEdge + 1) K.place(bo, UK().at(b, [0, -11.5]), 0);
    const out = new V3(bo.pos.x, 0, bo.pos.z);
    if (Math.abs(out.x) > Math.abs(out.z)) out.set(Math.sign(out.x) || 1, 0, 0);
    else out.set(0, 0, Math.sign(out.z) || -1);
    K.place(g, K.ground(b, bo.pos.clone().addScaledVector(out, -1.3)), 0);
    K.faceTo(g, bo.pos);
    K.faceTo(bo, g.pos);
    g.setState('scripted', { pose: 'grab', expression: 'determined' });
    bo.setState('scripted', { pose: 'bo_idle', expression: 'shock' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'botamo', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    const r = yield* st.cue('heavy', 'Lift him (Heavy)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    // up: both arms under the belly, the bear off his feet and over Goku's head
    g.setState('scripted', { pose: 'g_spiritRaise', expression: 'shout', speed: 10 });
    m.say('goku', 'Hnnnngh... UP YOU GO!', 2, { style: 'shout' });
    b.sfx('kiUp', g, { pitch: 0.8 });
    const base = bo.pos.clone();
    const t0 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 900);
      const p = g.pos.clone().add(new V3(0, 1.4 + k * 1.1, 0));
      bo.setPosition(base.clone().lerp(p, k));
      bo.setState('scripted', { pose: 'tumble', expression: 'shock', speed: 2 });
      return k >= 1;
    };
    yield* st.wait(0.6);
    // and over the edge
    g.setState('scripted', { pose: 'g_spiritThrow', expression: 'shout', speed: 24 });
    b.sfx('swing', g, { pitch: 0.6, vol: 1.2 });
    m.shot((t, o) => {
      o.pos.copy(g.pos).addScaledVector(out, -5).add(new V3(out.z * 5, 3, out.x * 5));
      o.look.copy(bo.chest());
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* UK().ringOutTo(m, bo, out, { height: 4, ms: 1100 });
    bo.setState('scripted', { pose: 'knockdown', expression: 'shock' });
    g.setState('scripted', { pose: 'g_victoryHop', expression: 'grin' });
    b.emit('matchEnd', { winner: g, loser: bo, how: 'ringout' });
    m.shot((t, o) => {
      o.pos.copy(bo.pos).addScaledVector(out, 6).add(new V3(0, 2.2, 0));
      o.look.copy(bo.pos).add(new V3(0, 0.6, 0));
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* SL.Tournament.announce(m, 'ringout', { winner: g, loser: bo }, { shot: false, seconds: 3 });
    SL.Cinema.shotOn(m, S, { subject: 'champa', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.champa, 'ch6_shout', 'angry');
    m.say('champa', 'Out of the ring?! Botamo, you useless lump!', 2.6, { style: 'shout' });
    yield* st.wait(2.6);
    m.endShot();
    b.skipRequested = false;
    yield* UK().close(m, CHAPTER, 'ROUND 1 · GOKU WINS');
  } };

  SL.data.u6Botamo = { TU };
  SL.data.missions.u6_botamo = {
    id: 'u6_botamo', canon: true, chapter: CHAPTER, title: 'The Bear Who Can\'t Be Hit', character: 'goku', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 1 · Goku vs Botamo', parTime: 300, qteLabel: 'The lift',
    blurb: 'Champa\'s tournament begins. Universe 6 sends out a bear that nothing can hurt.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    // the storyboard: base Goku for the whole round
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => x.id !== 'base').map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: the Universe 6 tournament begins'],
    setup: (b) => SL.data.u6Kit.setup(b, 'goku', 'botamo'),
    phases: [P.open, P.resist, P.lift],
  };
})();
