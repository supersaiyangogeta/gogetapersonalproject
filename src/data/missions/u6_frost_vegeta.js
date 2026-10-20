/*
 * CHAPTER 18 · UNIVERSE 6 — Round 4: "One Punch for a Cheat" (Vegeta vs Frost).
 * Owner's combat storyboard row 4: SUPER SAIYAN → CLOSE IN → DECISIVE PUNCH → RING-OUT.
 *
 *   OPEN *    (scene u6r4_open)  the exposed cheat back on the ring at Vegeta's own request; Vegeta goes Super Saiyan
 *   FIGHT *   (play)             a short, real fight: Super Saiyan Vegeta vs final-form Frost (a knockout or ring-out is
 *                                a DEFEAT, retry). Frost is already beaten in spirit; ends on his story floor
 *   PUNCH     (cues + staged)    Frost lunges with the needle arm — CLOSE IN (Dodge: Vegeta sways inside it), the
 *                                DECISIVE PUNCH (Heavy) to the face; Frost flies over the edge; the ruling
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  // TUNING: Frost's story floor and damage in the short fight
  const TU = { floor: 0.5, frostDealt: 0.45, frostTaken: 1.3 };

  SL.data.scenes.u6r4_open = {
    id: 'u6r4_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 1 },
    auraCap: 0,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.vegeta, UK().at(b, UK().RING.a), Math.PI);
          K.place(S.frost, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.vegeta, S.frost.pos);
          K.faceTo(S.frost, S.vegeta.pos);
        },
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cold' }, { who: 'frost', pose: 'fr_polite', face: 'angry' }],
        cam: { subject: 'vegeta', with: 'frost', focus: 'full', angle: 'side' },
        title: { chapter: CHAPTER, title: 'ONE PUNCH FOR A CHEAT', subtitle: 'Round 4 · Vegeta vs Frost', duration: 3.6 },
        say: { who: 'frost', line: 'You asked for me, Saiyan. How generous.', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'Generous? I want everyone watching when I put you out of this ring.', duration: 3.2 },
        hold: 3.3,
      },
      {
        transform: { who: 'vegeta', form: 'ssj' },
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          ctx.b.vfx.ring(v.pos.clone().add(new V3(0, 0.3, 0)), 6, 0xffd23a, 0.5, new V3(0, 1, 0));
          ctx.b.vfx.flash(v.chest(), 2.2, 0xffe27a, 0.4, SL.Toon.tex.glow);
          ctx.b.sfx('transformBurst', v);
        },
        pose: { who: 'vegeta', pose: 'v_tfPride', face: 'cold' },
        cam: { subject: 'vegeta', focus: 'full', angle: 'low' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.vegeta, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.frost, UK().at(b, UK().RING.c), 0);
      K.toForm(S.vegeta, 'ssj');
    },
  };

  function stage(m, place) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    UK().ring(m, { place });
    K.toForm(S.frost, 'final');
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, true);
    K.toForm(m.battle.story.vegeta, 'base');
    yield* SL.Cinema.play(m, 'u6r4_open');
  } };

  P.fight = { id: 'fight', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, f = S.frost;
    stage(m, !m.flags.fought);
    K.toForm(v, 'ssj');
    v.hp = v.hpMax;
    v.ki = Math.max(v.ki, v.kiMax * 0.6);
    f.hp = Math.max(f.hp, f.hpMax * 0.8);
    const sf = m.storyFight({ floors: [{ f, at: TU.floor }], dealt: [{ f, mul: TU.frostDealt }], taken: [{ f, mul: TU.frostTaken }] });
    m.title(CHAPTER, 'ROUND 4', 'Super Saiyan Vegeta vs Frost', 2.2);
    m.objective('fight', 'Beat the cheat down', { icon: 'fist' });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    const r = yield* UK().bout(m, { ringOut: [v], ai: { aggression: 0.7 }, during: () => (sf.floored(f) ? { pause: true, how: 'story' } : null) });
    sf.off();
    if (m.state !== 'running' || !r.pause) return;
    m.complete('fight');
    m.complete('ring');
  } };

  /** CLOSE IN and the DECISIVE PUNCH: his needle arm comes — Vegeta goes inside it and ends it. */
  P.punch = { id: 'punch', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, f = S.frost;
    stage(m, false);
    K.toForm(v, 'ssj');
    const st = UK().staged(m);
    v.controller = K.scripted();
    f.controller = K.scripted();
    // the line toward the nearest edge behind Frost
    const c = K.ground(b, new V3(U.clamp(v.pos.x, -5, 5), 0, U.clamp(v.pos.z, -2, 6)));
    K.place(v, c, 0);
    K.place(f, K.ground(b, c.clone().add(new V3(0, 0, -4.5))), 0);
    K.faceTo(v, f.pos);
    K.faceTo(f, v.pos);
    v.setState('scripted', { pose: 'idle', expression: 'cold' });
    f.setState('scripted', { pose: 'fz_jabW', expression: 'angry', speed: 10 });
    SL.Cinema.shotOn(m, S, { subject: 'frost', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('frost', 'Then let me finish what I started!', 2);
    yield* st.wait(1.2);
    // CLOSE IN: the needle arm comes — Vegeta sways inside it
    f.setState('scripted', { pose: 'fz_jab', expression: 'angry', speed: 22 });
    m.shot((t, o) => {
      const mid = v.chest().lerp(f.chest(), 0.5);
      o.pos.copy(mid).add(new V3(6.5, 1.2, 0));
      o.look.copy(mid);
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const r1 = yield* st.cue('dodge', 'Close in — inside his arm (Dodge)', { auto: 2.4, slow: 0.35 });
    m.qteParts.push(r1.pressed ? 1 : 0.5);
    const into = K.ground(b, f.pos.clone().add(new V3(0, 0, 1.1)));
    b.vfx.afterimage(v.pos, v.height, 0xffe27a);
    b.vfx.dust(v.pos.clone(), 1, 6);
    K.place(v, into, 0);
    K.faceTo(v, f.pos);
    v.setState('scripted', { pose: 'v_dash', expression: 'shout', speed: 26 });
    b.sfx('dash', v);
    yield* st.wait(0.35);
    // THE DECISIVE PUNCH, straight to the face
    v.setState('scripted', { pose: 'v_gutW', expression: 'shout', speed: 18 });
    const r2 = yield* st.cue('heavy', 'The decisive punch (Heavy)', { auto: 2.4, slow: 0.35 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    v.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 30 });
    const face = f.headPos ? f.headPos() : f.chest();
    b.vfx.impact(face, 4, 0xffe27a);
    b.vfx.ring(face, 2.6, 0xffe27a, 0.35);
    SL.ScreenFX.flash(0.2, '#fff2c0');
    b.sfx('punchHeavy', f, { pitch: 0.6, vol: 1.4 });
    b.cameraTraumaAt(face, 0.8);
    b.slowmo(0.25, 0.6);
    m.shot((t, o) => {
      o.pos.copy(face).add(new V3(1.6, 0.2, 1.4));
      o.look.copy(face);
      o.fov = 34;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.8);
    // over the edge
    m.shot((t, o) => {
      o.pos.copy(v.pos).add(new V3(8, 3, 2));
      o.look.copy(f.chest());
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* UK().ringOutTo(m, f, new V3(0, 0, -1), { height: 2.5, ms: 1000 });
    f.setState('scripted', { pose: 'knockdown', expression: 'ko' });
    v.setState('scripted', { pose: 'armsCrossed', expression: 'cold' });
    b.emit('matchEnd', { winner: v, loser: f, how: 'ringout' });
    yield* SL.Tournament.announce(m, 'ringout', { winner: v, loser: f }, { seconds: 3 });
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Hmph. Not even worth a second punch.', 2.4);
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
    yield* UK().close(m, CHAPTER, 'ROUND 4 · VEGETA WINS');
  } };

  SL.data.u6FrostVegeta = { TU };
  SL.data.missions.u6_frost_vegeta = {
    id: 'u6_frost_vegeta', canon: true, chapter: CHAPTER, title: 'One Punch for a Cheat', character: 'vegeta', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 4 · Vegeta vs Frost', parTime: 300, qteLabel: 'The punch',
    blurb: 'Frost was caught cheating. Vegeta asked for him back anyway — so that everyone could watch.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    // the storyboard: Super Saiyan Vegeta; no God, no Blue in this round
    lockForms: { vegeta: SL.data.characters.vegeta.forms.filter((x) => !['base', 'ssj'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Universe 6 loses Frost'],
    setup: (b) => SL.data.u6Kit.setup(b, 'vegeta', 'frost'),
    phases: [P.open, P.fight, P.punch],
  };
})();
