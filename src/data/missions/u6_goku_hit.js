/*
 * CHAPTER 18 · UNIVERSE 6 — Round 7: "The Unfinished Match" (Goku vs Hit), the end of the Universe 6 tournament.
 * Tournament of power ui.docx §3A (the Kaioken ×10 reveal): Goku cannot connect cleanly because Hit moves through tiny
 * intervals of time; he works out the timing instead of just being faster; Super Saiyan Blue Kaioken ×10 (the camera
 * pulls back to show the red and blue auras overlapping, then cuts in as he attacks); the exchanges get bigger but Hit
 * keeps adapting — the power-up changes the contest, it does not make the skip irrelevant. Canon: Goku steps out of
 * the ring on his own; Hit forfeits his next match; Universe 7 wins; Zeno comes to see the winners.
 *
 *   OPEN *     (scene u6r7_open) Goku on the ring for Vegeta; Hit; Beerus' order
 *   BLUE       (ascend)          Super Saiyan Blue (hold Charge)
 *   STUDY *    (play)            Blue Goku vs Hit's 0.1 s skip (u6_kit timeSkip: the evasion, the tell, the vital strike).
 *                                The goal is not damage but the gap: READ the skip (Dodge at the last moment of the
 *                                tell) three times — or wear him to his floor. KO / ring-out = defeat (retry)
 *   SECRET     (staged)          "You're stopping time." Hit makes it longer: half a second; the world stops and Goku
 *                                is on one knee before it starts again
 *   KAIOKEN    (ascend)          SUPER SAIYAN BLUE KAIOKEN ×10 (hold Charge) — the red over the blue, Beerus' horror
 *   INSIDE *   (play)            Kaioken Goku vs Hit's 0.5 s skip. Strain and HP drain are real (the Kaioken strain
 *                                model). NEW COUNTER: when time stops, strike (Light / Heavy) and Goku moves INSIDE the
 *                                skip — the red tears the violet and Hit eats the counter. Reads still work. Ends on
 *                                his floor
 *   CLASH      (cues + staged)   everything into one fist (Charge), the skip, and the punch inside it (Heavy): both blows
 *                                land at once; the Kaioken burns out; Goku looks at his hand, grins, and steps off the
 *                                ring by himself
 *   AFTER      (staged)          Hit withdraws from his next match; Universe 7 wins; Zeno arrives
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  const RED = 0xff3a2a;
  // TUNING: seconds unless named frames; floors are fractions of Hit's health
  const TU = {
    blueHold: 1.8, kaiokenHold: 2.6,
    // STUDY: the 0.1 s skip
    study: { gap: 190, reads: 3, floor: 0.72, hitDealt: 0.2, hitTaken: 0.85, tu: { tell: 1.0, readWindow: 0.45, vital: 4400, skipJab: 520, strikeEvery: 4.8, firstStrike: 2.2, resume: 14 } },
    // INSIDE: the 0.5 s skip, Kaioken
    inside: { gap: 220, floor: 0.42, hitDealt: 0.14, hitTaken: 0.8, strainScale: 0.35, tu: { tell: 0.8, readWindow: 0.4, vital: 5200, skipJab: 600, strikeEvery: 3.6, firstStrike: 1.6, appear: 5, swing: 24, resume: 30, breakFrom: 6, counter: 1800 } },
  };

  /* =================================================================== THE OPENING */
  SL.data.scenes.u6r7_open = {
    id: 'u6r7_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 1 },
    auraCap: 0,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.goku, UK().at(b, UK().RING.a), Math.PI);
          K.place(S.hit, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.goku, S.hit.pos);
          K.faceTo(S.hit, S.goku.pos);
        },
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }, { who: 'hit', pose: 'ht_pockets', face: 'cold' }],
        cam: { subject: 'goku', with: 'hit', focus: 'full', angle: 'side' },
        title: { chapter: CHAPTER, title: 'THE UNFINISHED MATCH', subtitle: 'Round 7 · Goku vs Hit', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { subject: 'hit', focus: 'closeup', angle: 'front' },
        say: { who: 'hit', line: 'You saw what I did to him.', duration: 2.4 },
        hold: 2.5,
      },
      {
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Nope! Didn\'t see a thing. That\'s what\'s got me so excited.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Kakarot. Whatever he does, it happens before you can see it. Don\'t stand still.', duration: 3.6 },
        hold: 3.7,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'serious' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Goku! No warming up. Go Blue from the start — and win!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.hit, UK().at(b, UK().RING.c), 0);
      K.faceTo(S.goku, S.hit.pos);
      K.faceTo(S.hit, S.goku.pos);
    },
  };

  const tint = (k) => UK().tint(k);
  const stopWorld = (S, frames) => UK().stopWorld(S, frames);
  const onRing = (b, p) => UK().onRing(b, p);

  function stage(m, place) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    tint(0);
    stopWorld(S, 0);
    UK().ring(m, { place });
    BK.give(S.goku, ['blue', 'blueKaioken']);
    S.goku.formCaps = Object.assign({}, S.goku.formCaps, { blueKaioken: 0 });
    // Vegeta on the bench: back on his feet, and furious about it
    K.watcher(S.vegeta, 'armsCrossed', 'angry');
  }

  /** One play stretch against the skip; ends on the floor or on opts.until(st). Returns the bout's result. */
  function* skipFight(m, cfg, opts) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    const sf = m.storyFight({ floors: [{ f: h, at: cfg.floor }], dealt: [{ f: h, mul: cfg.hitDealt }], taken: [{ f: h, mul: cfg.hitTaken }], ease: { foe: h, hero: g, below: 0.4, min: 0.5 } });
    const ts = UK().timeSkip(m, { gap: cfg.gap, strike: true, insist: !!opts.breakFree, tu: cfg.tu, lines: opts.lines, breakFree: opts.breakFree, allowSpecial: !!opts.breakFree });
    const r = yield* UK().bout(m, {
      ringOut: [g], begin: opts.begin, ai: opts.ai,
      during: () => (sf.floored(h) || (opts.until && opts.until(ts.st)) ? { pause: true, how: 'story' } : null),
    });
    m.flags.reads = (m.flags.reads || 0) + ts.st.reads;
    m.flags.breaks = (m.flags.breaks || 0) + (ts.st.breaks || 0);
    ts.off();
    sf.off();
    return r;
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, true);
    K.toForm(m.battle.story.goku, 'base');
    yield* SL.Cinema.play(m, 'u6r7_open');
  } };

  P.blue = { id: 'blue', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m, true);
    K.toForm(g, 'base');
    K.watcher(h, 'ht_pockets', 'cold');
    K.faceTo(h, g.pos);
    UK().control(m);
    g.ki = g.kiMax;
    m.objective('blue', 'Super Saiyan Blue: hold Charge', { icon: 'transform' });
    yield* C.ascend(m, { fighter: g, form: 'blue', witness: h, seconds: TU.blueHold, dust: false, label: 'Hold Charge — Super Saiyan Blue', meter: 'SUPER SAIYAN BLUE', music: 4 });
    m.complete('blue');
  } };

  /** STUDY: find the gap in his time. */
  P.study = { id: 'study', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m, true);
    K.toForm(g, 'blue');
    g.hp = g.hpMax;
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    h.hp = h.hpMax;
    m.flags.reads = 0;
    let seen = 0;
    m.title(CHAPTER, 'ROUND 7', 'Super Saiyan Blue Goku vs Hit', 2.4);
    m.objective('read', 'Find the gap: when his eyes burn and the ring closes, Dodge at the last moment', { icon: 'fist', target: TU.study.reads });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    const r = yield* skipFight(m, TU.study, {
      ai: { aggression: 0.45, defense: 0.7 },
      until: (st) => {
        if (st.reads !== seen) m.progress('read', (seen = st.reads));
        return st.reads >= TU.study.reads;
      },
      lines: {
        evade1: ['goku', 'Whoa! He was right there a second ago!', 2.4],
        evade3: ['champa', 'See?! Nobody touches Hit!', 2.2, { style: 'shout' }],
        landed: ['vegeta', 'Hmph. So he CAN be hit...', 2.4],
        tell1: ['whis', 'There it is again, Goku — that stillness.', 2.6],
        strike1: ['goku', 'Ow...! Okay — I didn\'t feel that coming at all.', 2.6],
        read1: ['goku', 'Got it! There\'s a gap — like the whole world skips a beat!', 3],
        read2: ['hit', '...He saw it.', 1.8],
      },
    });
    if (m.state !== 'running' || !r.pause) return;
    m.complete('read');
    m.complete('ring');
  } };

  /** "You're stopping time." — and he makes it longer. */
  P.secret = { id: 'secret', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m, false);
    K.toForm(g, 'blue');
    const st = UK().staged(m);
    g.controller = K.scripted();
    h.controller = K.scripted();
    const c = K.ground(b, new V3(U.clamp(g.pos.x, -6, 6), 0, U.clamp(g.pos.z, -4, 6)));
    K.place(g, c, Math.PI);
    K.place(h, onRing(b, c.clone().add(new V3(0, 0, -4.2))), 0);
    K.faceTo(g, h.pos);
    K.faceTo(h, g.pos);
    g.setState('scripted', { pose: 'g_godStance', expression: 'grin' });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'hit', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'You\'re stopping time, aren\'t you? Just for a moment. A tenth of a second, maybe.', 3.6);
    yield* st.wait(3.6);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'You have good eyes. Then I will make it longer.', 3);
    yield* st.wait(2.6);
    // his eyes flare, and the stillness comes — longer this time
    for (let i = 0; i < 5 && !st.skip.on; i++) {
      b.vfx.flash((h.headPos ? h.headPos() : h.chest()).addScaledVector(h.forward, 0.14), 0.8, UK().VIOLET, 0.16, SL.Toon.tex.glow);
      yield* st.wait(0.08);
    }
    stopWorld(S, 99999);
    tint(1);
    SL.ScreenFX.flash(0.3, '#3a0a6a');
    b.sfx('timeWarp', h, { vol: 1.1, pitch: 0.75 });
    m.shot((t, o, el) => {
      const mid = g.chest().lerp(h.chest(), 0.5);
      o.pos.copy(mid).add(new V3(5.5 - el * 0.6, 1.1, 1.5));
      o.look.copy(mid);
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.35);
    // he walks round the frozen Goku, unhurried, and comes to his side
    const side = new V3(1, 0, 0);
    const to = onRing(b, g.pos.clone().addScaledVector(side, 1.0));
    const from = h.pos.clone();
    h.setState('scripted', { pose: 'ht_step', expression: 'cold', speed: 6 });
    const t0 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 1300);
      K.place(h, from.clone().lerp(to, k), h.yaw);
      K.faceTo(h, g.pos);
      return k >= 1 || st.skip.on;
    };
    K.place(h, to, h.yaw);
    K.faceTo(h, g.pos);
    h.setState('scripted', { pose: 'ht_vitalW', expression: 'cold', speed: 30 });
    yield* st.wait(0.35);
    h.setState('scripted', { pose: 'ht_vital', expression: 'cold', speed: 40 });
    b.vfx.ring(g.chest(), 1.4, UK().VIOLET, 0.4);
    yield* st.wait(0.3);
    // time again: the blow has already landed
    stopWorld(S, 0);
    tint(0);
    SL.ScreenFX.flash(0.35, '#ffffff');
    b.vfx.impact(g.chest(), 3, 0xe8d8ff);
    b.cameraTraumaAt(g.chest(), 0.8);
    b.sfx('punchHeavy', g, { pitch: 0.55, vol: 1.4 });
    g.hp = Math.max(1, g.hp - g.hpMax * 0.12);
    g.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 40 });
    yield* st.wait(0.5);
    g.setState('scripted', { pose: 'kneelGrieve', expression: 'hurt', speed: 8 });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 8 });
    SL.Cinema.shotOn(m, S, { subject: 'whis', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('whis', 'Half a second, now. He is lengthening it as the fight goes on — he adapts as he fights.', 3.6);
    yield* st.wait(3.6);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    g.setState('scripted', { pose: 'g_godStance', expression: 'grin', speed: 6 });
    m.say('goku', 'Heh... alright. Then I can\'t hold anything back either.', 3);
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
  } };

  /** SUPER SAIYAN BLUE KAIOKEN ×10: the red over the blue. */
  P.kaioken = { id: 'kaioken', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m, false);
    K.toForm(g, 'blue');
    K.watcher(h, 'ht_pockets', 'cold');
    K.faceTo(h, g.pos);
    K.faceTo(g, h.pos);
    UK().control(m);
    g.ki = g.kiMax;
    g.setState('free');
    m.objective('kk', 'Kaioken on top of Blue: hold Charge', { icon: 'transform' });
    const fw = () => g.forward.clone().setY(0).normalize();
    yield* C.ascend(m, {
      fighter: g, form: 'blueKaioken', witness: h, seconds: TU.kaiokenHold, dust: false,
      label: 'Hold Charge — Kaioken ×10', meter: 'BLUE KAIOKEN ×10', music: 5,
      transform: {
        changeShots: [
          // §3A: pulled back wide to show the two flames overlapping...
          { at: 0, shot: (t, out) => {
            const c = g.chest();
            out.pos.copy(c).addScaledVector(fw(), 9 + t * 2).add(new V3(2.5, 2.2, 0));
            out.look.copy(c).add(new V3(0, 0.4, 0));
            out.fov = 50;
          } },
          // ...then in close as it bursts
          { at: 0.75, free: true, shot: (t, out) => {
            const hd = g.headPos();
            out.pos.copy(hd).addScaledVector(fw(), 1.4).add(new V3(0.3, 0.1, 0));
            out.look.copy(hd).add(new V3(0, 0.05, 0));
            out.fov = 40;
          } },
        ],
      },
    });
    m.complete('kk');
    const st = UK().staged(m);
    m.lock(true);
    SL.Cinema.shotOn(m, S, { subject: 'beerus', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.beerus, 'bs_idle', 'shock');
    m.say('beerus', 'Kaioken... on top of Blue?! Has he lost his mind?', 2.8, { style: 'shout' });
    yield* st.wait(2.8);
    SL.Cinema.shotOn(m, S, { subject: 'whis', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('whis', 'Ten times, I believe. His body will not last long like that.', 3);
    yield* st.wait(3);
    K.watcher(S.beerus, 'bs_idle', 'serious');
    m.endShot();
    b.skipRequested = false;
  } };

  /** INSIDE: Kaioken against the half-second skip — move inside it. */
  P.inside = { id: 'inside', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m, true);
    K.toForm(g, 'blueKaioken');
    g.hp = Math.max(g.hp, g.hpMax * 0.8);
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    h.hp = Math.min(h.hp, h.hpMax * TU.study.floor);
    m.flags.breaks = 0;
    // he holds the ×10 for the length of this fight: the strain builds, slower than a free Kaioken (restored after)
    const strainWas = g.strainScale;
    g.strainScale = TU.inside.strainScale;
    g.strain = 0;
    m.onDispose(() => (g.strainScale = strainWas));
    m.title(CHAPTER, 'ROUND 7', 'Blue Kaioken ×10 vs the half-second skip', 2.4);
    m.objective('inside', 'When time stops, strike (Light or Heavy) — Kaioken moves inside his skip', { icon: 'fist' });
    m.objective('strain', 'Kaioken burns your body: finish it before it gives out', { icon: 'target' });
    const r = yield* skipFight(m, TU.inside, {
      begin: false,
      ai: { aggression: 0.38, defense: 0.7 },
      breakFree: { pose: 'punchR', name: 'Kaioken Counter', color: RED },
      lines: {
        tell1: ['beerus', 'Don\'t stop moving, Goku!', 2.2, { style: 'shout' }],
        strike1: ['goku', 'Gah—! Longer... he really made it longer!', 2.4],
        break1: ['goku', 'I can see you in there!', 2.2, { style: 'shout' }],
        break2: ['hit', 'He moved... inside my time?', 2.4],
        read1: ['vegeta', 'Hmph. Kakarot reads it too...', 2.4],
        landed: ['champa', 'Hit! What are you doing?! Finish him!', 2.4, { style: 'shout' }],
      },
    });
    g.strainScale = strainWas;
    if (m.state !== 'running' || !r.pause) return;
    m.complete('inside');
    m.complete('strain');
  } };

  /** The last exchange — and Goku steps out of the ring by himself. */
  P.clash = { id: 'clash', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    stage(m, false);
    K.toForm(g, 'blueKaioken');
    const st = UK().staged(m);
    g.controller = K.scripted();
    h.controller = K.scripted();
    K.place(g, UK().at(b, [0, 3]), Math.PI);
    K.place(h, UK().at(b, [0, -3]), 0);
    K.faceTo(g, h.pos);
    K.faceTo(h, g.pos);
    g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'grit', aura: 1 });
    // he takes his hands out of his pockets for the first time
    h.setState('scripted', { pose: 'ht_vitalW', expression: 'determined', speed: 8 });
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'This is the first time in a thousand years I have fought seriously.', 3.2);
    yield* st.wait(3.2);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Same here! Let\'s make it count!', 2.4, { style: 'shout' });
    const r1 = yield* st.cue('charge', 'Everything into one fist (Charge)', { auto: 3, slow: 0.5 });
    m.qteParts.push(r1.pressed ? 1 : 0.5);
    b.vfx.ring(g.pos.clone().add(new V3(0, 0.1, 0)), 7, RED, 0.5, new V3(0, 1, 0));
    b.vfx.flash(g.chest(), 2.4, 0xff6a5a, 0.35, SL.Toon.tex.glow);
    b.sfx('kaiokenBoom', g, { vol: 1.3 });
    b.cameraTraumaAt(g.chest(), 0.5);
    // the two of them cross the ring at each other — and time stops on the way
    m.shot((t, o) => {
      const mid = g.chest().lerp(h.chest(), 0.5);
      o.pos.copy(mid).add(new V3(7.5, 1.2, 0));
      o.look.copy(mid);
      o.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const gFrom = g.pos.clone(), hFrom = h.pos.clone();
    const meet = K.ground(b, gFrom.clone().lerp(hFrom, 0.5));
    g.setState('scripted', { pose: 'g_flyingKnee', expression: 'shout', speed: 30, aura: 1 });
    h.setState('scripted', { pose: 'ht_slide', expression: 'determined', speed: 20 });
    b.sfx('dash', g, { vol: 1.2 });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 14);
      K.place(g, gFrom.clone().lerp(meet.clone().add(new V3(0, 0, 0.65)), k), g.yaw);
      K.place(h, hFrom.clone().lerp(meet.clone().add(new V3(0, 0, -0.65)), k), h.yaw);
      if (n % 3 === 0) b.vfx.afterimage(g.pos, g.height, 0xff6a5a);
      return n >= 14;
    };
    g.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 40, aura: 1 });
    h.setState('scripted', { pose: 'ht_vital', expression: 'determined', speed: 40 });
    // THE SKIP — and the punch inside it
    stopWorld(S, 99999);
    tint(1);
    b.sfx('timeWarp', h, { vol: 1.1, pitch: 0.7 });
    const r2 = yield* st.cue('heavy', 'Move inside his time — punch (Heavy)', { auto: 2.6, slow: 0.25 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    // the red tears the violet: both blows land in the same instant
    stopWorld(S, 0);
    tint(0);
    SL.ScreenFX.flash(0.45, '#ffd0c0');
    const mid = g.chest().lerp(h.chest(), 0.5);
    b.vfx.impact(mid, 5, 0xffffff);
    b.vfx.ring(mid, 6, RED, 0.5);
    b.vfx.ring(mid, 4.5, UK().VIOLET, 0.45);
    b.cameraTraumaAt(mid, 1);
    b.sfx('explosionBig', g, { vol: 1 });
    b.slowmo(0.2, 0.6);
    m.shot((t, o) => {
      o.pos.copy(mid).add(new V3(3.2, 0.4, 2.2));
      o.look.copy(mid);
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.9);
    // both thrown apart
    const gTo = onRing(b, g.pos.clone().add(new V3(0, 0, 4))), hTo = onRing(b, h.pos.clone().add(new V3(0, 0, -4)));
    g.setState('scripted', { pose: 'hitBack', expression: 'hurt', speed: 20 });
    h.setState('scripted', { pose: 'hitBack', expression: 'hurt', speed: 20 });
    const g0 = g.pos.clone(), h0 = h.pos.clone();
    n = 0;
    yield () => {
      n++;
      const k = U.clamp01(n / 24);
      K.place(g, g0.clone().lerp(gTo, k), g.yaw);
      K.place(h, h0.clone().lerp(hTo, k), h.yaw);
      if (n % 3 === 0) {
        b.vfx.dust(g.pos.clone(), 0.6, 3);
        b.vfx.dust(h.pos.clone(), 0.6, 3);
      }
      return n >= 24;
    };
    // the Kaioken burns out: steam, and the blue goes with it
    K.toForm(g, 'blue');
    b.vfx.flash(g.chest(), 2.4, 0xff9a8a, 0.3, SL.Toon.tex.glow);
    b.sfx('steam', g, { vol: 0.8 });
    g.setState('scripted', { pose: 'exhausted', expression: 'hurt', speed: 8 });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold', speed: 6 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.2);
    K.toForm(g, 'base');
    g.setState('scripted', { pose: 'lookHands', expression: 'calm', speed: 6 });
    m.say('goku', '...My body\'s about done. Heh.', 2.4);
    yield* st.wait(2.4);
    // he turns, walks to the edge, and steps down off the ring
    const edge = K.ground(b, new V3(g.pos.x, 0, UK().RING.a[1] + 7.8));
    const out = K.ground(b, new V3(g.pos.x, 0, UK().RING.a[1] + 10.5));
    K.faceTo(g, edge);
    g.setState('scripted', { pose: 'run', expression: 'grin', speed: 6 });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    const w0 = g.pos.clone();
    let t1 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - t1) / 1600);
      K.place(g, w0.clone().lerp(edge, k), g.yaw);
      return k >= 1 || st.skip.on;
    };
    t1 = performance.now();
    g.setState('scripted', { pose: 'jump', expression: 'grin', speed: 10 });
    yield () => {
      const k = Math.min(1, (performance.now() - t1) / 500);
      const q = edge.clone().lerp(out, k);
      q.y = U.lerp(edge.y, out.y, k) + Math.sin(k * Math.PI) * 0.6;
      g.setPosition(q);
      g.vel.set(0, 0, 0);
      return k >= 1 || st.skip.on;
    };
    g.setPosition(out);
    g.grounded = true;
    g.ringedOut = true;
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin', speed: 8 });
    K.faceTo(g, h.pos);
    b.vfx.dust(out.clone(), 0.8, 6);
    b.emit('matchEnd', { winner: h, loser: g, how: 'ringout' });
    m.say('announcer', 'Son Goku has stepped out of the ring — on his own! The winner is... Hit!', 3.4);
    yield* st.wait(3.4);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'Why?', 1.6);
    yield* st.wait(1.6);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'If I\'d kept going, I\'d have broken before your skip did. Let\'s finish this for real some other time.', 4);
    yield* st.wait(4);
    m.endShot();
    b.skipRequested = false;
  } };

  /** Hit withdraws; Universe 7 wins; and someone comes to watch the winners. */
  P.after = { id: 'after', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, h = S.hit;
    m.lock(true);
    m.clearObjectives();
    m.endShot();
    tint(0);
    stopWorld(S, 0);
    UK().bench(m);
    const st = UK().staged(m);
    for (const f of [g, h]) f.controller = K.scripted();
    if (!g.ringedOut) K.place(g, K.ground(b, new V3(0, 0, UK().RING.a[1] + 10.5)), Math.PI);
    K.place(h, UK().at(b, [0, -2]), 0);
    K.toForm(g, 'base');
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
    h.setState('scripted', { pose: 'ht_pockets', expression: 'cold' });
    SL.Cinema.shotOn(m, S, { subject: 'champa', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.champa, 'ch6_shout', 'grin');
    m.say('champa', 'HA! Universe 6 takes it! Next match — bring out your last one, Beerus!', 3.2, { style: 'shout' });
    yield* st.wait(3.2);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'I withdraw from the next match.', 2.2);
    yield* st.wait(2.2);
    SL.Cinema.shotOn(m, S, { subject: 'champa', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.champa, 'ch6_shout', 'shock');
    m.say('champa', 'WHAT?!', 1.4, { style: 'shout' });
    yield* st.wait(1.4);
    SL.Cinema.shotOn(m, S, { subject: 'hit', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('hit', 'He stepped out with strength left in him. I will not call that a victory — and I will not take another from it.', 4.2);
    yield* st.wait(4.2);
    m.say('announcer', 'Hit withdraws! That means... Universe 7 wins the tournament!', 3.2);
    SL.Cinema.shotOn(m, S, { subject: 'beerus', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.beerus, 'bs_idle', 'grin');
    yield* st.wait(1.6);
    m.say('beerus', 'Ha... HA! Of course we did! Did you ever doubt it, brother?', 3, { style: 'shout' });
    yield* st.wait(3);
    // a white light in the middle of the ring: the King of Everything has come to see the winners
    let z = S.zeno;
    if (!z) {
      z = S.zeno = b.spawn({ charId: 'zeno', team: 0, pos: UK().at(b, [0, 0]), startKi: 0 });
      z.cannotDie = true;
    }
    z.setHidden(true);
    K.place(z, UK().at(b, [0, 1]), Math.PI);
    K.watcher(z, 'zn_idle', 'calm');
    const zc = z.pos.clone().add(new V3(0, 1, 0));
    SL.ScreenFX.flash(0.6, '#ffffff');
    b.vfx.flash(zc, 6, 0xffffff, 0.6, SL.Toon.tex.glow);
    b.vfx.ring(z.pos.clone().add(new V3(0, 0.1, 0)), 8, 0xe8f0ff, 0.8, new V3(0, 1, 0));
    b.sfx('magic', z, { vol: 1 });
    z.setHidden(false);
    m.shot((t, o, el) => {
      const c = z.chest();
      o.pos.copy(c).add(new V3(0.6, 0.15 - el * 0.05, 2.6 + el * 0.3));
      o.look.copy(c).add(new V3(0, 0.15, 0));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.6);
    // the gods drop to one knee
    for (const id of ['beerus', 'whis', 'champa', 'vados']) K.watcher(S[id], 'fr_bow', 'shock');
    SL.Cinema.shotOn(m, S, { subject: 'beerus', with: 'whis', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('whis', 'The King of Everything... himself.', 2.6);
    yield* st.wait(2.6);
    m.shot((t, o) => {
      const c = z.chest();
      o.pos.copy(c).add(new V3(0.4, 0.1, 2.2));
      o.look.copy(c).add(new V3(0, 0.2, 0));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    K.watcher(z, 'zn_cheer', 'grin');
    m.say('zeno', 'That looked like fun! I want to see one with every universe!', 3.4);
    yield* st.wait(3.4);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    g.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
    m.say('goku', 'Hiya, little guy! A tournament with everybody? Count me in!', 3);
    yield* st.wait(3);
    SL.Cinema.shotOn(m, S, { subject: 'beerus', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('beerus', 'GOKU! Show some respect, you idiot!', 2.4, { style: 'shout' });
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
    yield* UK().close(m, CHAPTER, 'ROUND 7 · UNIVERSE 7 WINS');
  } };

  SL.data.u6GokuHit = { TU };
  SL.data.missions.u6_goku_hit = {
    id: 'u6_goku_hit', canon: true, chapter: CHAPTER, title: 'The Unfinished Match', character: 'goku', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 7 · Goku vs Hit', parTime: 600, qteLabel: 'The last exchange',
    blurb: 'Vegeta never saw the blow that beat him. Goku steps up to find out what Hit is doing — and to go further than Blue to answer it.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    // Blue, then Blue Kaioken (handed over here: story.js formGivenBy); nothing in between
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue', 'blueKaioken'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Form: Goku — Super Saiyan Blue Kaioken (×10)', 'Story: Universe 7 wins the Universe 6 tournament'],
    setup: (b) => SL.data.u6Kit.setup(b, 'goku', 'hit'),
    phases: [P.open, P.blue, P.study, P.secret, P.kaioken, P.inside, P.clash, P.after],
  };
})();
