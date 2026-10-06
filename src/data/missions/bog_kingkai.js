/*
 * CHAPTER 16 — BATTLE OF GODS, mission 2: "A Friendly Spar" (canon; King Kai's planet, GROUND / LOW-AIR).
 *
 *   FACEOFF   (scene)            Goku in the grass, the god with his hands behind his back
 *   SPAR 1 *  (play)             base / Super Saiyan: everything Goku throws is slipped — a lean, a small step,
 *                                a palm, and once in a while he is just behind you (storyEvade 'god'); the god
 *                                barely moves and yawns between exchanges
 *   SSJ2      (hold Charge)      "Then how about this!" — the second level as an event
 *   SPAR 2 *  (play)             faster, harder — and he still has not taken his hands out from behind his back
 *   SSJ3      (hold Charge)      the third level: the hair, the brows, the lightning, the roar (the form's own
 *                                330-frame sequence)
 *   SPAR 3 *  (play)             one full-power punch... stopped on one finger (storyBlock)
 *   FINGER    (scene)            the fist on the fingertip, the flick, through King Kai's house, the god already
 *                                behind him, the chop; King Kai blurts out "Vegeta, on Earth"; the god leaves;
 *                                King Kai calls Vegeta
 *   AFTER
 *
 * Beerus' power is shown in behaviour, not numbers: nothing lands, he is never knocked about, he hardly moves.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const U = SL.util;
  const K = () => SL.data.bogKit;
  const S = (SL.data.scenes = SL.data.scenes || {});
  const A = () => SL.data.bogAwaken;

  // the spar: how long each stretch lasts and what the god says as it goes
  const SPAR = {
    base: { evades: 5, seconds: 28, aggression: 0.1, dealt: 0.25, brain: { counter: 70, heavy: 0.1 } },
    one: { evades: 8, seconds: 40, aggression: 0.1, dealt: 0.3, brain: { counter: 60, heavy: 0.15 } },
    two: { evades: 10, seconds: 45, aggression: 0.2, dealt: 0.35, brain: { counter: 40, heavy: 0.3, flick: 0.12 } },
    three: { seconds: 14 },
  };

  function setup(battle) {
    const b = battle, KKP = A().KKP;
    // Goku of the Super era: his own transformation lines, not Namek's
    K().superVoice(b);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: KKP.goku.clone(), startKi: 100 });
    const beerus = b.spawn({ charId: 'beerus', team: 1, pos: KKP.goku.clone().add(new V3(0, 0, -7)), tags: { boss: true } });
    const whis = b.spawn({ charId: 'whis', team: 0, pos: new V3(8, 0, -9) });
    const kingkai = b.spawn({ charId: 'king_kai', team: 0, pos: new V3(5.5, 0, -11) });
    const bubbles = b.spawn({ charId: 'bubbles', team: 0, pos: new V3(-6, 0, -10) });
    for (const f of [beerus, whis, kingkai, bubbles]) {
      f.controller = K().scripted();
      f.cannotDie = true;
    }
    for (const f of [whis, kingkai, bubbles]) f.untargetable = f.intangible = true;
    beerus.untargetable = beerus.intangible = true;
    goku.cannotDie = true;
    // the forms come by the story's cinematics, not the transform button (see transformCine)
    goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true, god: true, godki: true };
    const house = K().kkHouse(b, KKP.house);
    b.story = { goku, beerus, whis, kingkai, bubbles, house };
  }

  /** Who stands where while the spar goes on: the god and Goku in the middle, the rest by the house. GROUND. */
  function stage(m) {
    const b = m.battle, s = b.story, KKP = A().KKP;
    const C = KKP.goku.clone().add(new V3(0, 0, -3));
    m.cast({
      active: [s.goku, s.beerus],
      support: [
        { f: s.whis, at: new V3(8, 0, -10), pose: 'w_idle', face: 'calm' },
        { f: s.kingkai, at: new V3(5, 0, -12), pose: 'bg_kkPanic', face: 'nervous' },
        { f: s.bubbles, at: new V3(-6, 0, -11), pose: 'idle', face: 'shock' },
      ],
    }, { centre: C, supportClear: 6 });
    return C;
  }

  /**
   * A STRETCH OF THE SPAR: the player attacks, the god slips it. Ends after `evades` slipped blows or `seconds`.
   * lines: [{ at: count, who, line }]; idle lines when the player stops attacking.
   */
  function* spar(m, cfg, lines) {
    const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
    m.lock(true);
    m.clearObjectives();
    K().clearCombat(b);
    const C = stage(m);
    m.space(g, 'ground', { pos: C.clone().add(new V3(0, 0, -3.5)), face: C });
    m.space(bs, 'ground', { pos: C.clone().add(new V3(0, 0, 3.5)), face: g.pos });
    bs.hp = bs.hpMax;
    const se = K().godDodge(bs, { from: [g] });
    m.powerGap(bs, { from: [g], mul: 0, beams: true });
    K().brawl(m, g, bs, { profile: { aggression: cfg.aggression, defense: 0.95 }, song: 'beerus_theme', music: 3 });
    // the god at play: hands behind his back, answering only what is left hanging (AI personalities are for fights)
    bs.controller = K().godBrain(b, bs, cfg.brain);
    const sf = m.storyFight({ floors: [{ f: g, at: 0.3 }], dealt: [{ f: bs, mul: cfg.dealt }], fighters: [g, bs], space: 'ground' });
    m.objective('hit', 'Land a single blow on Beerus', { icon: 'target' });
    let t = 0, said = 0, idle = 0, nagged = 0, shown = -1;
    const L = lines.slice().sort((a, c) => a.at - c.at);
    const hook = () => {
      if (b.inputLocked) return;
      t += 1 / 60;
      const n = se.count || 0;
      while (said < L.length && n >= L[said].at) {
        m.say(L[said].who, L[said].line, L[said].duration || 2.8, { style: L[said].style });
        said++;
      }
      if (n !== shown) {
        shown = n;
        m.objective('hit', 'Land a single blow on Beerus  ·  slipped: ' + n);
      }
      // the player standing about: the god is bored, and says so
      if (g.state === 'attack' || g.state === 'dash' || g.state === 'blast') idle = 0;
      else idle += 1 / 60;
      if (idle > 6 && nagged < 2) {
        idle = 0;
        nagged++;
        m.say('beerus', nagged === 1 ? 'Well? I didn\'t come all this way to watch you stand there.' : 'Yawn...', 2.6);
      }
    };
    m.tickHooks.push(hook);
    yield () => (se.count || 0) >= cfg.evades || t > cfg.seconds;
    K().unhook(m, hook);
    sf.off();
    m.failObjective('hit');
    m.lock(true);
    K().clearCombat(b);
    bs.controller = K().scripted();
    bs.storyEvade = null;
    g.setState('free');
    bs.setState('scripted', { pose: 'bs_idle', expression: 'calm' });
    yield* m.cine(0.5);
    return { evades: se.count || 0, t };
  }

  const P = {};
  P.faceoff = K().scene('faceoff', 'bgk_faceoff');

  /**
   * GAMEPLAY → FILM: a short hold of Charge (he gathers himself under the player's thumb, the gameplay camera
   * still on him), then the transformation's own shot list (bogKit.transformCine), then the fight goes on.
   */
  function* ascendFilmed(m, formId, o) {
    const b = m.battle, s = b.story, g = s.goku;
    K().clearCombat(b);
    m.lock(true);
    s.beerus.controller = K().scripted();
    s.beerus.storyEvade = null;
    s.beerus.setState('scripted', { pose: 'bs_idle', expression: 'calm' });
    if (o.say) {
      SL.Cinema.shotOn(m, { goku: g, beerus: s.beerus }, { subject: 'goku', focus: 'upper', angle: 'three' }, 3);
      m.say('goku', o.say, 2.6);
      yield* m.cine(2.6);
      m.endShot();
    }
    yield* K().hold(m, { id: 'asc_' + formId, fighter: g, seconds: o.hold || 1.3, auto: 5, meter: o.meter, label: o.label || 'Hold to power up',
      tick: (mm, k) => {
        g.setState('scripted', { pose: 'charge', expression: 'grit', aura: 0.2 + k * 0.6 });
        if (b.frame % 4 === 0) b.vfx.streamInward(g.chest(), 2.2 + k * 2, 0xffe27a, 2, 0.14, 0.4);
        b.camera.addTrauma(0.01 + k * 0.03);
      } });
    if (g.lockedForms) delete g.lockedForms[formId];
    yield* K().transformCine(m, g, formId, Object.assign({ watcher: s.beerus }, o));
    m.teach(g, 'form:' + formId);
  }

  P.spar1 = {
    id: 'spar1',
    checkpoint: true,
    run: function* (m) {
      const s = m.battle.story, g = s.goku;
      K().toForm(g, 'base');
      const r0 = yield* spar(m, SPAR.base, [
        { at: 2, who: 'beerus', line: 'Hm.' },
        { at: 4, who: 'whis', line: 'He hasn\'t taken his hands out from behind his back, has he?' },
      ]);
      // the gold, filmed
      yield* ascendFilmed(m, 'ssj', {
        kind: 'ssj', say: 'Heh. You\'re the real thing, all right. Then let\'s warm up!', meter: 'SUPER SAIYAN', hold: 1.2,
        watcherLine: 'Oh? Golden hair. So that\'s a Super Saiyan.', watcherPose: 'bg_tilt', music: 3,
      });
      const r = yield* spar(m, SPAR.one, [
        { at: 2, who: 'beerus', line: 'You\'re slow.' },
        { at: 5, who: 'king_kai', line: 'Goku, stop! He\'s just PLAYING with you!', style: 'shout' },
        { at: 7, who: 'whis', line: 'He moves well, for a Saiyan.' },
      ]);
      m.flags.spar1 = r0.evades + r.evades;
    },
  };

  /** THE SECOND LEVEL — filmed. */
  P.ssj2 = {
    id: 'ssj2',
    run: function* (m) {
      const s = m.battle.story, g = s.goku;
      m.clearObjectives();
      K().toForm(g, 'ssj');
      yield* ascendFilmed(m, 'ssj2', {
        kind: 'ssj2', say: 'Okay. Let\'s take it up a notch.', meter: 'SUPER SAIYAN 2', hold: 1.5,
        watcherLine: 'Your hair stood up a little more. Is that it?', watcherPose: 'bs_idle', watcherFace: 'calm', music: 4,
      });
    },
  };

  P.spar2 = {
    id: 'spar2',
    checkpoint: true,
    run: function* (m) {
      const s = m.battle.story;
      K().toForm(s.goku, 'ssj2');
      const r = yield* spar(m, SPAR.two, [
        { at: 2, who: 'goku', line: 'Come on — hit back!', style: 'shout' },
        { at: 4, who: 'beerus', line: 'Faster. Still slow.' },
        { at: 7, who: 'whis', line: 'My, he really is quite good. For a mortal.' },
        { at: 9, who: 'beerus', line: 'Is that everything you have?' },
      ]);
      m.flags.spar2 = r.evades;
    },
  };

  /** THE THIRD LEVEL: filmed shot by shot (A–I) — the hair growing out of his scalp — and the launch at the god. */
  P.ssj3 = {
    id: 'ssj3',
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku;
      m.clearObjectives();
      K().toForm(g, 'ssj2');
      const C = stage(m);
      m.space(g, 'ground', { pos: C.clone().add(new V3(0, 0, -4)), face: C });
      m.space(s.beerus, 'ground', { pos: C.clone().add(new V3(0, 0, 2.5)), face: g.pos });
      yield* ascendFilmed(m, 'ssj3', {
        kind: 'ssj3', say: 'Not bad at all... Alright. Here goes everything I\'ve got!', meter: 'SUPER SAIYAN 3', hold: 1.8,
        watcherLine: 'Ooh. Your hair got long. That\'s a little more interesting.', watcherPose: 'bg_tilt', music: 5,
      });
      SL.Cinema.shotOn(m, { kingkai: s.kingkai }, { subject: 'kingkai', focus: 'closeup', angle: 'front' }, 2.2);
      s.kingkai.setState('scripted', { pose: 'bg_kkPanic', expression: 'nervous', speed: 14 });
      m.say('king_kai', 'Goku, you idiot! Don\'t make him INTERESTED!', 2.2, { style: 'shout' });
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  /** ONE PUNCH: everything he has — and it stops on the tip of a finger. */
  P.spar3 = {
    id: 'spar3',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      K().toForm(g, 'ssj3');
      stage(m);
      // the line of the punch (the film after it uses the same one): the god out on the grass, Goku between him and
      // King Kai's door — so the flick that ends it can send him through the house
      const L = fingerLine(s);
      m.space(bs, 'ground', { pos: L.F, face: L.door, pose: 'bs_idle', expr: 'calm' });
      m.space(g, 'ground', { pos: L.F.clone().addScaledVector(L.d, 6), face: L.F });
      bs.storyEvade = null;
      bs.storyBlock = { from: [g], pose: 'bg_finger', count: 0 };
      m.powerGap(bs, { from: [g], mul: 0, beams: true });
      K().brawl(m, g, bs, { profile: { aggression: 0, defense: 0 }, music: 6 });
      bs.controller = K().scripted();
      bs.setState('scripted', { pose: 'bs_idle', expression: 'calm' });
      m.objective('punch', 'Charge in and hit him with everything you have', { icon: 'target' });
      m.say('goku', 'HAAAAH!', 1.4, { style: 'shout' });
      m.prompt('sparPunch', 'light', 'Punch', { required: true, until: () => (bs.storyBlock && bs.storyBlock.count > 0) });
      let t = 0;
      const hook = () => {
        if (!b.inputLocked) t += 1 / 60;
        // the god just stands there: he turns to face you, nothing else
        if (bs.state === 'scripted' && b.frame % 6 === 0) K().faceTo(bs, g.pos);
      };
      m.tickHooks.push(hook);
      yield () => (bs.storyBlock && bs.storyBlock.count > 0) || t > SPAR.three.seconds;
      K().unhook(m, hook);
      m.flags.fingerStopped = bs.storyBlock && bs.storyBlock.count > 0 ? 'player' : 'story';
      bs.storyBlock = null;
      m.complete('punch');
      m.lock(true);
      K().clearCombat(b);
      yield* SL.Cinema.play(m, 'bgk_finger');
    },
  };

  P.after = K().after('A FRIENDLY SPAR');

  /** Where the one-finger block happens: F (the god), the door behind Goku, d (from the god toward the door). */
  function fingerLine(s) {
    const door = s.house.door();
    const F = door.clone().add(new V3(0, 0, 9));
    F.y = 0;
    return { F, door, d: door.clone().sub(F).setY(0).normalize() };
  }

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, v) => K().pt(ctx, n, v);

  S.bgk_faceoff = {
    id: 'bgk_faceoff',
    cast,
    music: { song: 'beerus_theme', level: 2 },
    events: [
      {
        call: (ctx) => {
          const C = stage(ctx.m), s = st(ctx);
          ctx.m.space(s.goku, 'ground', { pos: C.clone().add(new V3(0, 0, -3.5)), face: C, pose: 'idle', expr: 'grin' });
          ctx.m.space(s.beerus, 'ground', { pos: C.clone().add(new V3(0, 0, 3.5)), face: s.goku.pos, pose: 'bs_idle', expr: 'calm' });
          pt(ctx, 'mid', C.clone());
        },
        cam: { from: { at: 'mid', off: [14, 3, 8] }, to: { at: 'mid', off: [10, 2.4, 5] }, look: { at: 'mid', off: [0, 1.2, 0] }, fov: 44 },
        title: { chapter: 'CHAPTER 16 · BATTLE OF GODS', title: 'A FRIENDLY SPAR', subtitle: 'King Kai\'s planet · ten times gravity', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'goku', pose: 'g_introPalm', face: 'grin', speed: 8 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', to: 'beerus', line: 'Okay. Here I come — and I\'m not holding back!', duration: 2.8 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'calm' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'front' },
        say: { who: 'beerus', to: 'goku', line: 'Come on, then. Any time you like.', duration: 2.6 },
        hold: 2.6,
      },
    ],
  };

  /* ---------------------------------------------------------------- the finger, the flick, the house, the chop */
  S.bgk_finger = {
    id: 'bgk_finger',
    cast,
    music: { song: null, level: 0 },
    events: [
      // the charge: Goku from six metres out, the fist leading, the camera running alongside it
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const L = fingerLine(s), F = L.F, d = L.d;
          // the punch the player threw becomes the charge: from where he is on the line (pulled back far enough for
          // a run-up), never a cut to somewhere else
          const along = U.clamp(s.goku.pos.clone().sub(F).dot(d), 3.5, 7);
          ctx.m.space(s.beerus, 'ground', { pos: F, face: L.door, pose: 'bs_idle', expr: 'calm' });
          ctx.m.space(s.goku, 'air', { pos: F.clone().addScaledVector(d, along), height: 0.25, face: F, pose: 'dash', expr: 'shout' });
          pt(ctx, 'stop', F.clone().addScaledVector(d, 1.3).add(new V3(0, 0.25, 0)));
          ctx.dir = d;
          s.goku.auraViewCap = 0.35;
          b.sfx('dash', s.goku, { vol: 1 });
          b.sfx('kiCharge', s.goku, { vol: 0.9, pitch: 1.3 });
        },
        space: { who: 'goku', mode: 'flight', to: 'stop', seconds: 0.6, pose: 'bg_stoppedPunch', endPose: 'bg_stoppedPunch' },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          // the finger comes up at the last instant — nothing else on him moves
          if (t > 0.42 && s.beerus.anim.name !== 'bg_finger') s.beerus.setState('scripted', { pose: 'bg_finger', expression: 'calm', speed: 30 });
          b.vfx.trail(s.goku.handPos('R'), 0xffe27a, 0.35, 0.25);
          if (b.frame % 3 === 0) b.vfx.dust(s.goku.pos.clone().setY(SL.Staging.groundY(b, s.goku.pos.x, s.goku.pos.z)), 0.6, 2);
        },
        // the camera runs alongside the fist, a little ahead of it, the god growing in the frame
        cam: { from: { at: 'goku', local: [0.75, 0.3, 0.05] }, look: { at: 'goku', local: [0.05, 0.3, 3.4] }, fov: 50, follow: true, raw: true },
      },
      // CONTACT: knuckles on a fingertip, extreme close-up, the world slowing
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, d = ctx.dir;
          ctx.m.space(s.goku, 'air', { pos: ctx.cast.stop.pos.clone(), height: 0.25, face: s.beerus.pos, pose: 'bg_stoppedPunch', expr: 'shout' });
          s.beerus.setState('scripted', { pose: 'bg_finger', expression: 'calm', speed: 30 });
          s.goku.auraViewCap = 0.15;
          // the poses settle in a few frames: put the knuckles on the fingertip now and keep them there (tick)
          s.beerus.anim.update(0.5);
          s.goku.anim.update(0.5);
          const c = K().touch(s.goku, s.beerus);
          const perp = new V3(-d.z, 0, d.x);
          pt(ctx, 'tip', c);
          pt(ctx, 'tipCam', c.clone().addScaledVector(perp, 0.95).addScaledVector(d, 0.12).add(new V3(0, 0.06, 0)));
          pt(ctx, 'tipCam2', c.clone().addScaledVector(perp, 0.62).addScaledVector(d, 0.08).add(new V3(0, 0.04, 0)));
          b.slowmo(0.12, 1.6);
          b.vfx.flash(c, 1.4, 0xffffff, 0.25, SL.Toon.tex.glow);
          b.vfx.sparks(c, 0xfff3c0, 26, 10, 0.06);
          // the ring of the impact stands across the line of the punch, round the fingertip
          b.vfx.ring(c, 1.6, 0xffffff, 0.5, d);
          b.vfx.ring(c, 0.8, 0xfff2c0, 0.35, d);
          b.sfx('explosionBig', s.beerus, { pitch: 0.55, vol: 1.3 });
          b.sfx('punchHeavy', s.beerus, { pitch: 0.45, vol: 1.3 });
          SL.ScreenFX.flash(0.22);
        },
        tick: (ctx) => {
          const s = st(ctx);
          const c = K().touch(s.goku, s.beerus);
          ctx.cast.tip.pos.copy(c);
        },
        cam: { from: { at: 'tipCam' }, to: { at: 'tipCam2' }, look: { at: 'tip' }, fov: 24, raw: true, ease: 'out' },
        hold: 1.5,
      },
      // THE SHOCKWAVE: out across the grass — the house rattling, the tree bent, King Kai off his feet; the god unmoved
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.goku.auraViewCap = null;
          K().shockwave(b, s.beerus.pos, { radius: 26, grass: 0x6ab83a });
          b.vfx.ring(ctx.cast.tip.pos, 9, 0xffffff, 0.7, ctx.dir);
          // the grass flattened outward in a ring, and a gust of it
          for (let i = 0; i < 3; i++) b.vfx.ring(s.beerus.pos.clone().add(new V3(0, 0.1 + i * 0.3, 0)), 6 + i * 7, 0xd8f0b0, 0.5 + i * 0.25, new V3(0, 1, 0));
          pt(ctx, 'wideW', s.beerus.pos.clone().add(new V3(-ctx.dir.z, 0, ctx.dir.x).multiplyScalar(11)).add(new V3(0, 1.6, 0)));
          b.sfx('wind', null, { vol: 1.2, pitch: 0.6 });
        },
        space: [
          { who: 'kingkai', mode: 'slide', dir: [1, 0, -0.4], distance: 5, seconds: 0.7, endPose: 'knockdown', expr: 'shock' },
          { who: 'bubbles', mode: 'slide', dir: [-1, 0, -0.3], distance: 4, seconds: 0.7, endPose: 'knockdown', expr: 'shock' },
        ],
        tick: (ctx, t) => {
          const s = st(ctx);
          if (s.house) s.house.shake(Math.max(0, 1 - t / 1.6), s.beerus.pos);
          ctx.cast.tip.pos.copy(K().touch(s.goku, s.beerus));
        },
        cam: { from: { at: 'wideW' }, look: { at: 'beerus', off: [0, 0.7, 0] }, fov: 50 },
        hold: 1.8,
      },
      // the contrast: everything he has, his whole body behind it...
      {
        call: (ctx) => (st(ctx).goku.auraViewCap = 0.2),
        pose: [{ who: 'goku', pose: 'bg_stoppedPunch', face: 'shout', speed: 10 }],
        tick: (ctx) => ctx.cast.tip.pos.copy(K().touch(st(ctx).goku, st(ctx).beerus)),
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1, height: -0.05 },
        sfx: { name: 'roar', vol: 0.7, pitch: 0.9 },
        hold: 1.2,
      },
      // ...and the god, bored, one finger out, not a hair out of place
      {
        tick: (ctx) => ctx.cast.tip.pos.copy(K().touch(st(ctx).goku, st(ctx).beerus)),
        cam: { subject: 'beerus', focus: 'upper', angle: 'three', side: -1 },
        hold: 1.0,
      },
      {
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        say: { who: 'beerus', line: 'Hm. That\'s it?', duration: 1.8 },
        hold: 1.9,
      },
      {
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        pose: [{ who: 'whis', pose: 'w_laugh', face: 'smirk', speed: 6 }],
        say: { who: 'whis', line: 'Oh my. One finger.', duration: 1.8 },
        hold: 1.8,
      },
      // the flick: to the forehead — and Goku is gone
      {
        pose: [{ who: 'beerus', pose: 'bs_flickW', face: 'calm', speed: 14 }],
        cam: { subject: 'goku', with: 'beerus', focus: 'upper' },
        hold: 0.5,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_flick', expression: 'calm', speed: 30 });
          b.vfx.flash(s.goku.headPos(), 2.6, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('punchHeavy', s.goku, { pitch: 1.5, vol: 1.2 });
          b.cameraTraumaAt(s.goku.pos, 0.7);
          SL.ScreenFX.flash(0.25);
          pt(ctx, 'door', s.house.door());
          pt(ctx, 'back', s.house.back());
          pt(ctx, 'side', s.house.pos.clone().add(new V3(11, 2.6, 4)));
        },
        space: { who: 'goku', mode: 'flight', to: 'door', seconds: 0.35, pose: 'hitHeavy', endPose: 'hitHeavy' },
        cam: { from: { at: 'side' }, look: { at: 'goku' }, fov: 50 },
      },
      // through the house
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.goku.setHidden(true);
          s.house.smash();
          b.vfx.dust(ctx.cast.door.pos, 2.5, 14, 0xe8e0c8);
        },
        cam: { from: { at: 'side' }, look: { at: 'back' }, fov: 46 },
        hold: 0.45,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          s.goku.setHidden(false);
          ctx.m.space(s.goku, 'ground', { pos: ctx.cast.back.pos.clone(), face: ctx.cast.door.pos, pose: 'knockdownFace', expr: 'hurt' });
        },
        space: { who: 'goku', mode: 'slide', dir: [0, 0, -1], distance: 3, seconds: 0.4, endPose: 'knockdownFace', expr: 'hurt' },
        cam: { from: { at: 'back', off: [6, 2, -6] }, look: { at: 'goku' }, fov: 44 },
        sfx: { name: 'groundImpact', vol: 1 },
      },
      {
        pose: [{ who: 'kingkai', pose: 'bg_kkPanic', face: 'shout', speed: 14 }],
        cam: { subject: 'kingkai', focus: 'upper', angle: 'front' },
        say: { who: 'king_kai', line: 'MY HOUSE!', duration: 1.6, style: 'shout' },
        hold: 1.6,
      },
      // he gets up — and the god is already standing behind him
      {
        pose: [{ who: 'goku', pose: 'stagger', face: 'grit', speed: 6 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Ngh... Wh-where did he...', duration: 2 },
        hold: 2,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const behind = s.goku.pos.clone().addScaledVector(s.goku.forward, -1.3);
          b.vfx.afterimage(s.beerus.pos, s.beerus.height, 0xd8b0ff);
          ctx.m.space(s.beerus, 'ground', { pos: behind, face: s.goku.pos, pose: 'bs_chopW', expr: 'calm' });
          b.sfx('vanish', s.beerus);
        },
        cam: { subject: 'beerus', with: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Behind you.', duration: 1.4, style: 'quiet' },
        hold: 1.4,
      },
      // the chop
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_chop', expression: 'calm', speed: 30 });
          b.vfx.flash(s.goku.headPos(), 1.6, 0xffffff, 0.15, SL.Toon.tex.glow);
          b.sfx('punchHeavy', s.goku, { pitch: 1.8, vol: 0.8 });
          b.slowmo(0.35, 0.6);
        },
        pose: [{ who: 'goku', pose: 'hitHeavy', face: 'ko', speed: 20 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        hold: 0.8,
      },
      // face-first into the grass, the gold draining out of his hair
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().toForm(s.goku, 'base');
          b.vfx.flash(s.goku.chest(), 2, 0xffe27a, 0.4, SL.Toon.tex.glow);
          b.vfx.dust(s.goku.pos, 1.6, 10);
        },
        pose: [{ who: 'goku', pose: 'knockdownFace', face: 'ko', speed: 10 }, { who: 'beerus', pose: 'bs_idle', face: 'calm' }],
        cam: { subject: 'goku', focus: 'full', angle: 'high' },
        sfx: { name: 'ko', vol: 0.6 },
        hold: 2.2,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'He was a little entertaining. But he\'s no Super Saiyan God.', duration: 3.4 },
        hold: 3.4,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'beerus', line: 'North Kai. Are there any other Saiyans left?', duration: 2.6 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'kingkai', pose: 'bg_kkPanic', face: 'nervous', speed: 10 }],
        cam: { subject: 'kingkai', focus: 'closeup', angle: 'front' },
        say: { who: 'king_kai', line: 'N-no! No, none at all! ...Well, there\'s Vegeta, on Earth, but — OH NO.', duration: 3.8 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'whis', pose: 'w_idle', face: 'smirk' }],
        cam: { subject: 'beerus', with: 'whis', focus: 'full', angle: 'front' },
        say: { who: 'beerus', line: 'Earth. Then that\'s where we\'re going. And if the god doesn\'t turn up...', duration: 3.6 },
        hold: 3.6,
      },
      {
        cam: { subject: 'beerus', focus: 'face', angle: 'front' },
        say: { who: 'beerus', line: '...I\'ll destroy it.', duration: 2, style: 'quiet' },
        music: { song: 'ominous', level: 1 },
        hold: 2.2,
      },
      {
        cam: { subject: 'whis', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'whis', line: 'Earth! I hear the food there is wonderful.', duration: 2.4 },
        hold: 2.4,
      },
      // they leave in the light
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          ctx.m.space(s.beerus, 'ground', { pos: s.whis.pos.clone().addScaledVector(s.whis.forward, -0.9).add(new V3(0.5, 0, 0)), face: s.whis.pos, pose: 'bs_idle', expr: 'calm' });
          s.travel = K().travel(b, s.whis.pos.clone());
          b.sfx('teleport', s.whis, { pitch: 0.6, vol: 1 });
          pt(ctx, 'low', s.whis.pos.clone().add(new V3(4, 0.4, 7)));
        },
        space: [
          { who: 'whis', mode: 'flight', to: { at: 'whis', off: [0, 70, 0] }, seconds: 1.4, pose: 'w_fly', endPose: 'w_fly' },
          { who: 'beerus', mode: 'flight', to: { at: 'beerus', off: [0, 70, 0] }, seconds: 1.4, pose: 'bs_flyIdle', endPose: 'bs_flyIdle' },
        ],
        tick: (ctx, t) => st(ctx).travel && st(ctx).travel.set(1 - t / 1.4),
        cam: { from: { at: 'low' }, look: { at: 'whis' }, fov: 54 },
      },
      // King Kai, alone in the wreck: he calls Vegeta
      {
        call: (ctx) => K().hide([st(ctx).beerus, st(ctx).whis]),
        pose: [{ who: 'kingkai', pose: 'kk_antennae', face: 'nervous', speed: 8 }],
        cam: { subject: 'kingkai', focus: 'upper', angle: 'front' },
        sfx: { name: 'visionIn', vol: 0.6 },
        say: { who: 'king_kai', line: 'Vegeta! Vegeta, can you hear me?! Listen very carefully — your life depends on it!', duration: 4 },
        hold: 4,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.travel) {
        s.travel.dispose();
        s.travel = null;
      }
      K().toForm(s.goku, 'base');
      K().hide([s.beerus, s.whis]);
      ctx.m.flags.gokuChopped = true;
    },
  };

  const def = {
    id: 'bog_kingkai',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'A Friendly Spar',
    subtitle: 'Goku vs Beerus · King Kai\'s planet',
    character: 'goku',
    stage: 'kingkai',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'Goku asked for a friendly match. The God of Destruction is happy to oblige — with his hands behind his back.',
    rewards: ['Story: Goku vs Beerus', 'Super Saiyan 3 against a god'],
    setup,
    phases: [P.faceoff, P.spar1, P.ssj2, P.spar2, P.ssj3, P.spar3, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogSpar = { SPAR };
})();
