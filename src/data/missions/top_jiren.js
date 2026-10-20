/*
 * CHAPTER 22 · THE TOURNAMENT OF POWER — "The Spirit Bomb" (Goku vs Jiren, the first climax; Ultra Instinct -Sign-).
 * Tournament of power ui.docx: the arena (a pale stone platform in a multicoloured void, the gods in the stands, the two
 * Zenos throwing their hands up), §3 Kaioken ×20 (the cobalt core inside the crimson shell, the strain on the face,
 * dust and rubble lifting, Jiren absorbing the pressure with minimal movement), the Spirit Bomb (the tug-of-war, the
 * implosion to a black point, the white flash, the empty crater), the silence in the stands, the Grand Priest's ruling,
 * Beerus' quiet question, Beerus' "here it comes", the pillar of light, and Ultra Instinct -Sign- walking out of it.
 * The gi: the Blue exchange ends with Jiren tearing the orange top away — ×20, the Spirit Bomb and the Sign are fought in
 * the navy undershirt (the Whis gi's own damage stages, wardrobe DAMAGE_GOKU_TOP).
 *
 *   ARENA *    (scene top_open)   the void, the platform, the stands, the Zenos; the Grand Priest; Goku facing Jiren
 *   BLUE *     (play)             Super Saiyan Blue vs Jiren: Jiren's focus (the `unshakable` mechanic) shrugs off light
 *                                 blows; heavies chip it. KO / ring-out = defeat (retry). Ends on the clock or his floor
 *   TWENTY     (ascend)           Blue Kaioken ×20 (hold Charge): the pull-back, the red over the blue, the strain
 *   KAIOKEN *  (play)             ×20: the strain is real and fast (the Kaioken strain model) — break through him before
 *                                 the body gives out. Ends on his floor or the clock
 *   BOMB       (cues + struggle)  up a rock spire, arms raised: the Spirit Bomb gathers (Charge), thrown (Heavy), Jiren
 *                                 holds it with his glare; mash to push — the story takes the bar; the bomb compresses to a
 *                                 black point, the white flash, and Goku is gone
 *   SILENCE    (staged)           the empty crater; the stands; the Grand Priest rules; Beerus; Whis; Beerus: "Here it comes..."
 *   PILLAR     (staged)           the arena shakes; a pillar of light; Ultra Instinct -Sign- walks out; the silver eyes
 *   INSTINCT * (play)             Ultra Instinct -Sign-: the body evades by itself (Goku's storyEvade + the form's own
 *                                 evasion) — fight between Jiren's blows. Ends on his floor or the clock
 *   FADE       (staged)           the silver goes out; Goku on one knee; Jiren walks away
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;
  const TK = () => SL.data.topKit;
  const ST = (m) => SL.data.u6Kit.staged(m);
  const CHAPTER = 'CHAPTER 22 · THE TOURNAMENT OF POWER';
  // TUNING: floors are fractions of Jiren's health; seconds
  const TU = {
    blue: { seconds: 40, floor: 0.9, jirenDealt: 0.3, jirenTaken: 0.45 },
    twenty: { hold: 2.6, seconds: 34, floor: 0.72, jirenDealt: 0.28, jirenTaken: 0.4, strainScale: 0.55 },
    instinct: { seconds: 45, floor: 0.55, jirenDealt: 0.35, jirenTaken: 0.7, evade: 0.85 },
  };
  const SPOT = { goku: [0, 9], jiren: [0, -9], spire: [0, 26] };
  const EDGE = { vegeta: [-26, 18], frieza: [26, 20], android_17: [-30, -8], toppo: [28, -16], caulifla: [-20, -28], kale: [-16, -30] };

  /* =================================================================== THE OPENING */
  SL.data.scenes.top_open = {
    id: 'top_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    // the Tournament of Power's own battle music (soundtrack PDF p.91–92, "Genkai Toppa x Survivor": an original stand-in)
    music: { song: 'limit_survivor', level: 1 },
    auraCap: 0,
    events: [
      // the void and the platform: a slow sweep high over it all
      {
        cam: { from: [120, 70, 150], to: [70, 38, 90], look: [0, 0, 0], look2: [0, 6, 0], fov: 56, fov2: 50, ease: 'inOut', raw: true },
        title: { chapter: CHAPTER, title: 'THE SPIRIT BOMB', subtitle: 'The World of Void · eight universes, one platform', duration: 4.6 },
        hold: 4.8,
      },
      // the Zenos in their box, throwing their hands up
      {
        call: (ctx) => TK().cheer(ctx.m, true),
        cam: { subject: 'zeno', with: 'zeno2', focus: 'full', angle: 'front' },
        hold: 2.4,
      },
      {
        call: (ctx) => TK().cheer(ctx.m, false),
        pose: [{ who: 'grandpriest', pose: 'gp_announce', face: 'calm' }],
        cam: { subject: 'grandpriest', focus: 'upper', angle: 'three' },
        say: { who: 'grandpriest', line: 'Whoever falls from the platform is eliminated. The last universe standing will be spared. The others... will be erased.', duration: 4.6 },
        hold: 4.7,
      },
      {
        pose: [{ who: 'grandpriest', pose: 'gp_idle', face: 'calm' }, { who: 'beerus', pose: 'bs_idle', face: 'serious' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Goku... if you lose this, there won\'t be a universe left to go home to.', duration: 3.4 },
        hold: 3.5,
      },
      // the two of them in the middle of the platform, everyone else at its edges
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
          K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
          K.faceTo(S.goku, S.jiren.pos);
          K.faceTo(S.jiren, S.goku.pos);
        },
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }, { who: 'jiren', pose: 'jr_idle', face: 'cold' }],
        cam: { subject: 'jiren', focus: 'full', angle: 'low' },
        say: { who: 'goku', line: 'You\'re Jiren, right? Everybody keeps saying you\'re the strongest one here.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'jiren', focus: 'closeup', angle: 'front' },
        say: { who: 'jiren', line: 'You talk too much.', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'low' },
        say: { who: 'goku', line: 'Then I\'ll let my fists do it!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
      K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
      TK().cheer(ctx.m, false);
    },
  };

  function setup(b) {
    const S = TK().setup(b, {
      player: 'goku', fight: ['goku', 'jiren'],
      seat: ['krillin', 'tien', 'roshi', 'beerus', 'whis', 'adult_gohan', 'piccolo', 'android_18'],
      edge: EDGE,
    });
    K.place(S.goku, K.ground(b, new V3(SPOT.goku[0], 0, SPOT.goku[1])), Math.PI);
    K.place(S.jiren, K.ground(b, new V3(SPOT.jiren[0], 0, SPOT.jiren[1])), 0);
    K.faceTo(S.goku, S.jiren.pos);
    K.faceTo(S.jiren, S.goku.pos);
    return S;
  }

  /** dmg: Goku's clothing for this beat (0 the gi whole; 1 Jiren's blows in it; 2 the orange top torn away) */
  function stage(m, dmg) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    TK().seat(m);
    TK().edge(m);
    if (dmg !== undefined && S.goku.setDamage) S.goku.setDamage(dmg);
    BK.give(S.goku, ['blue', 'blueKaioken', 'uiSign']);
    S.goku.formCaps = Object.assign({}, S.goku.formCaps, { blueKaioken: 1 });
    // the Kaioken's strain belongs to the ×20 fight itself; the staged beats never overload him
    S.goku.strain = 0;
    S.goku.strainScale = 0.001;
    for (const f of [S.goku, S.jiren]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
    }
  }

  /** One stretch against Jiren under the tournament's rules. Ends on his floor or opts.seconds. */
  function* fight(m, cfg, opts = {}) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    const sf = m.storyFight({
      floors: [{ f: j, at: cfg.floor }], dealt: [{ f: j, mul: cfg.jirenDealt }], taken: [{ f: j, mul: cfg.jirenTaken }],
      ease: { foe: j, hero: g, below: 0.4, min: 0.5 },
    });
    let t = 0;
    const r = yield* TK().bout(m, {
      a: g, c: j, ai: Object.assign({ aggression: 0.5, transformHp: 0 }, opts.ai || {}),
      during: () => {
        t += 1 / 60;
        if (opts.tick) opts.tick(t);
        return sf.floored(j) || (cfg.seconds && t >= cfg.seconds) ? { pause: true, how: 'story' } : null;
      },
    });
    sf.off();
    return r;
  }

  const P = {};
  P.arena = { id: 'arena', checkpoint: true, run: function* (m) {
    stage(m, 0);
    K.toForm(m.battle.story.goku, 'base');
    yield* SL.Cinema.play(m, 'top_open');
  } };

  /** Super Saiyan Blue against a wall. */
  P.blue = { id: 'blue', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, 0);
    K.toForm(g, 'blue');
    TK().place(m, 'goku', SPOT.goku, 'jiren');
    TK().place(m, 'jiren', SPOT.jiren, 'goku');
    g.hp = g.hpMax;
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    j.hp = j.hpMax;
    m.title(CHAPTER, 'GOKU VS JIREN', 'Super Saiyan Blue', 2.4);
    m.objective('wall', 'Light blows do not move him — break his focus with heavies', { icon: 'fist' });
    m.objective('ring', 'Stay on the platform', { icon: 'target' });
    let said = false;
    const r = yield* fight(m, TU.blue, {
      tick: (t) => {
        if (!said && t > 12) {
          said = true;
          m.say('vegeta', 'Kakarot\'s Blue isn\'t even scratching him...', 2.6);
        }
      },
    });
    if (m.state !== 'running' || !r.pause) return;
    m.complete('wall');
    m.complete('ring');
  } };

  /** Kaioken ×20 on top of Blue. */
  P.twenty = { id: 'twenty', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, 1);
    K.toForm(g, 'blue');
    // Jiren's answer to the Blue exchange: one Power Impact from where he stands, and the orange top is gone — ×20 is
    // fought in the navy undershirt (the owner's still)
    {
      const st0 = ST(m);
      g.controller = K.scripted();
      j.controller = K.scripted();
      K.faceTo(j, g.pos);
      K.faceTo(g, j.pos);
      g.setState('scripted', { pose: 'g_godStance', expression: 'grit', aura: 0.8 });
      SL.Cinema.shotOn(m, S, { subject: 'goku', with: 'jiren', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
      j.setState('scripted', { pose: 'jr_impact', expression: 'cold', speed: 26 });
      yield* st0.wait(0.3);
      b.vfx.slash(j.chest(), g.chest(), 0xff7a5a, 0.18, 0.5);
      b.vfx.explosion(g.chest(), 1.6, 0xff9a7a, { smoke: true });
      b.sfx('punchHeavy', g, { vol: 1.3, pitch: 0.7 });
      b.cameraTraumaAt(g.chest(), 0.6);
      g.setDamage(2, { burst: true });
      g.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 12, aura: 0.6 });
      yield* st0.wait(1);
      // close: the shreds of the orange settling, the navy under it; he straightens up grinning
      m.shot((t, o) => {
        const c = g.chest();
        o.pos.copy(c).addScaledVector(g.forward, 2.4).add(new V3(0.6, 0.15, 0));
        o.look.copy(c).add(new V3(0, 0.18, 0));
        o.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: g, face: true });
      g.setState('scripted', { pose: 'g_resolve', expression: 'grin', speed: 6, aura: 0.8 });
      m.say('goku', 'Heh... he tore right through it. Okay — no more holding back.', 3);
      yield* st0.wait(3);
      j.setState('scripted', { pose: 'jr_idle', expression: 'cold', speed: 6 });
      m.endShot();
      b.skipRequested = false;
    }
    K.watcher(j, 'jr_idle', 'cold');
    K.faceTo(j, g.pos);
    K.faceTo(g, j.pos);
    TK().control(m, 'goku');
    g.ki = g.kiMax;
    g.setState('free');
    m.objective('kk', 'Kaioken ×20 on top of Blue: hold Charge', { icon: 'transform' });
    const fw = () => g.forward.clone().setY(0).normalize();
    yield* C.ascend(m, {
      fighter: g, form: 'blueKaioken', witness: j, seconds: TU.twenty.hold, dust: false,
      label: 'Hold Charge — Kaioken ×20', meter: 'BLUE KAIOKEN ×20', music: 5,
      // §3: low, close to the floor — the dust and the broken stone lifting round him
      beats: [
        { at: 0.4, run: (mm, f) => b.vfx.dust(f.pos.clone(), 4, 18) },
        { at: 0.75, run: (mm, f) => b.cameraTraumaAt(f.chest(), 0.4) },
      ],
      transform: {
        changeShots: [
          { at: 0, shot: (t, out) => {
            const c = g.chest();
            out.pos.copy(g.pos).addScaledVector(fw(), 3.2).add(new V3(0.8, 0.2, 0));
            out.look.copy(c).add(new V3(0, 0.6, 0));
            out.fov = 52;
          } },
          { at: 0.7, free: true, shot: (t, out) => {
            const hd = g.headPos();
            out.pos.copy(hd).addScaledVector(fw(), 1.3).add(new V3(0.25, 0.05, 0));
            out.look.copy(hd);
            out.fov = 40;
          } },
        ],
      },
    });
    // straight to the second level: ×20
    g.formLevel = 1;
    g._applyFormLevel();
    b.vfx.ring(g.chest(), 8, 0xff3a2a, 0.5);
    b.sfx('kaiokenBoom', g, { vol: 1.4, pitch: 1.1 });
    m.complete('kk');
    const st = ST(m);
    m.lock(true);
    g.controller = K.scripted();
    g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'grit', speed: 8, aura: 1 });
    b.vfx.dust(g.pos.clone(), 6, 26);
    b.stage.ringCrack(g.pos.clone(), 3, 1, null);
    TK().mood(m, 'concern');
    m.shot((t, o, el) => {
      const k = Math.min(1, el / 1.2);
      o.pos.copy(g.pos).addScaledVector(fw(), 3 + k * 7).add(new V3(1.5, 0.15 + k * 0.5, 0));
      o.look.copy(g.chest()).add(new V3(0, 0.6, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(1.4);
    TK().react(m, 'beerus', 'Twenty times?! On top of Blue?! His body will fall apart!', 3, { style: 'shout' });
    K.watcher(S.beerus, 'sp_lean', 'shock');
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
  } };

  /** ×20: break through him before the body gives out. */
  P.kaioken = { id: 'kaioken', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, 2);
    K.toForm(g, 'blueKaioken');
    g.formLevel = 1;
    g._applyFormLevel();
    g.hp = Math.max(g.hp, g.hpMax * 0.8);
    g.ki = Math.max(g.ki, g.kiMax * 0.7);
    j.hp = Math.min(j.hp, j.hpMax * TU.blue.floor);
    const strainWas = g.strainScale;
    g.strainScale = TU.twenty.strainScale;
    g.strain = 0;
    m.onDispose(() => (g.strainScale = strainWas));
    m.title(CHAPTER, 'KAIOKEN ×20', 'His body against the strongest in Universe 11', 2.4);
    m.objective('break', 'Force him back before Kaioken burns you out', { icon: 'fist' });
    let said = 0;
    const r = yield* fight(m, TU.twenty, {
      ai: { aggression: 0.6 },
      tick: (t) => {
        if (said === 0 && t > 6) {
          said = 1;
          m.say('jiren', 'You force your body past its limit. It will not hold.', 2.8);
        } else if (said === 1 && g.strain > 70) {
          said = 2;
          m.say('goku', 'Gnnh... not yet... NOT YET!', 2.2, { style: 'shout' });
        }
      },
    });
    g.strainScale = strainWas;
    if (m.state !== 'running' || !r.pause) return;
    m.complete('break');
  } };

  /** The Spirit Bomb: gathered on a spire, thrown, held by a glare — and it swallows him. */
  P.bomb = { id: 'bomb', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren, A = b.stage.arena;
    stage(m, 2);
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    K.toForm(g, 'blueKaioken');
    // the rock spire Goku stands on (the owner's still: the bomb over a tall white rock, Jiren small below)
    const spireAt = new V3(SPOT.spire[0], A.y, SPOT.spire[1]);
    const geo = new THREE.CylinderGeometry(2.6, 4.2, 16, 9);
    const mat = SL.Toon.mat(0xd8d0c0);
    const spire = new THREE.Mesh(geo, mat);
    spire.position.copy(spireAt).add(new V3(0, 8, 0));
    SL.Toon.addOutline(spire, 2);
    b.stage.scene.add(spire);
    m.onDispose(() => {
      if (spire.parent) spire.parent.remove(spire);
      geo.dispose();
    });
    const top = spireAt.clone().add(new V3(0, 16, 0));
    g.setPosition(top);
    g.grounded = true;
    g.vel.set(0, 0, 0);
    K.place(j, K.ground(b, new V3(0, 0, -8)), 0);
    K.faceTo(j, g.pos);
    K.faceTo(g, j.pos);
    g.setState('scripted', { pose: 'g_spiritRaise', expression: 'grit', aura: 1 });
    j.setState('scripted', { pose: 'jr_idle', expression: 'cold' });
    // the sphere over his hands
    const sGeo = new THREE.SphereGeometry(1, 32, 20);
    const sMat = new THREE.MeshBasicMaterial({ color: 0x9ae8ff, transparent: true, opacity: 0.9, depthWrite: false });
    const core = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false });
    const ball = new THREE.Mesh(sGeo, sMat);
    const inner = new THREE.Mesh(sGeo, core);
    inner.scale.setScalar(0.7);
    ball.add(inner);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x8ad8ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 }));
    glow.scale.setScalar(3);
    ball.add(glow);
    b.scene.add(ball);
    m.onDispose(() => {
      if (ball.parent) ball.parent.remove(ball);
      sGeo.dispose();
      sMat.dispose();
      core.dispose();
      glow.material.dispose();
    });
    let R = 0.5;
    const over = () => g.pos.clone().add(new V3(0, 3 + R, 0));
    ball.position.copy(over());
    ball.scale.setScalar(R);
    // high and wide: the sphere over the spire, Jiren small at its foot
    m.shot((t, o) => {
      o.pos.set(-38, A.y + 10, -30);
      o.look.copy(g.pos).add(new V3(0, 6 + R * 0.5, 0));
      o.fov = 58;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('goku', 'Universe 7... lend me your energy!', 2.6, { style: 'shout' });
    // GATHER: hold Charge — the light streams in from everywhere
    const gather = () => {
      if (b.frame % 3 === 0) b.vfx.streamInward(ball.position, 30 + R * 4, 0x8ad8ff, 3, 0.4, 0.8);
      ball.position.copy(over());
      ball.scale.setScalar(R);
      ball.rotation.y += 0.01;
    };
    m.tickHooks.push(gather);
    const r1 = yield* m.struggle({
      start: 0.1, drain: 0.04, duration: 9, label: 'THE SPIRIT BOMB — gather it (mash)',
      until: (t, grip) => grip >= 0.98,
      onTick: (t, grip) => {
        R = 0.5 + grip * 9.5;
        b.camera.trauma = Math.max(b.camera.trauma, 0.05 + grip * 0.15);
      },
    });
    m.qteParts.push(r1.avg);
    R = 10;
    TK().react(m, 'whis', 'He is gathering the energy of the whole universe...', 2.8);
    yield* st.wait(2.4);
    // THROW
    m.shot((t, o) => {
      o.pos.set(-38, A.y + 10, -30);
      o.look.copy(g.pos).add(new V3(0, 8, 0));
      o.fov = 58;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const r2 = yield* st.cue('heavy', 'Throw it (Heavy)', { auto: 2.6, slow: 0.5 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    K.unhook(m, gather);
    g.setState('scripted', { pose: 'g_spiritThrow', expression: 'shout', speed: 20, aura: 1 });
    b.sfx('kiBlastBig', g, { vol: 1.3, pitch: 0.6 });
    // it comes down on Jiren — and stops: he holds it with his eyes
    const from = ball.position.clone();
    const hold = j.chest().add(new V3(0, R * 0.9, 0)).lerp(from, 0.25);
    let n = 0;
    yield () => {
      n++;
      ball.position.copy(from.clone().lerp(hold, Math.min(1, n / 50)));
      return n >= 50;
    };
    j.setState('scripted', { pose: 'jr_glare', expression: 'angry', speed: 10, aura: 1 });
    b.vfx.ring(j.chest(), 6, 0xff7a5a, 0.5);
    b.cameraTraumaAt(j.chest(), 0.8);
    // THE TUG-OF-WAR: high and wide, the two on either side of the sphere
    m.shot((t, o) => {
      const mid = ball.position.clone().lerp(j.chest(), 0.5);
      o.pos.copy(mid).add(new V3(34, 14, 8));
      o.look.copy(mid);
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    g.setState('scripted', { pose: 'g_spiritThrow', expression: 'grit', aura: 1 });
    m.say('jiren', '...', 1.2);
    let k = 0.5;
    const push = () => {
      ball.position.copy(hold.clone().lerp(top.clone().add(new V3(0, 4, 0)), U.clamp01(1 - k) * 0.6));
      if (b.frame % 2 === 0) b.vfx.sparks(ball.position.clone().addScaledVector(j.dirTo(g), -R * 0.8), 0xffffff, 6, 14, 0.12);
      b.camera.trauma = Math.max(b.camera.trauma, 0.2);
    };
    m.tickHooks.push(push);
    const r3 = yield* m.struggle({
      start: 0.5, drain: 0.1, duration: 8, label: 'PUSH IT THROUGH (mash)',
      // Jiren steps forward into it whatever you press: the bar is his
      override: (t, grip) => (t > 3 ? Math.max(0, Math.min(grip, 0.9) - (t - 3) * 0.12) : null),
      onTick: (t, grip) => (k = grip),
    });
    m.qteParts.push(r3.avg);
    K.unhook(m, push);
    // it is pushed back up to him... and compresses to a black point
    b.sfx('timeWarp', g, { vol: 1.2, pitch: 0.5 });
    const cFrom = ball.position.clone();
    m.shot((t, o) => {
      o.pos.copy(cFrom).add(new V3(8 + R, 3, 8 + R));
      o.look.copy(cFrom);
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    n = 0;
    yield () => {
      n++;
      const kk = Math.min(1, n / 70);
      ball.position.copy(cFrom.clone().lerp(top.clone().add(new V3(0, 2, 0)), kk));
      ball.scale.setScalar(R * (1 - kk * 0.92));
      sMat.color.setHex(kk > 0.6 ? 0x1a1030 : 0x9ae8ff);
      core.color.setHex(kk > 0.7 ? 0x000000 : 0xffffff);
      return n >= 70;
    };
    // the white flash — and the crater where he stood
    SL.ScreenFX.flash(1, '#ffffff');
    b.vfx.explosion(ball.position.clone(), 6, 0xffffff, { smoke: true });
    b.sfx('explosionHuge', g, { vol: 1.3 });
    b.cameraTraumaAt(top, 1);
    ball.visible = false;
    g.setHidden(true);
    g.untargetable = true;
    spire.visible = false;
    b.stage.ringCrack(new V3(spireAt.x, A.y, spireAt.z), 9, 2, null);
    b.vfx.dust(spireAt.clone(), 9, 40);
    yield* st.wait(1.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The empty crater; the stands; the ruling; Beerus; Whis. */
  P.silence = { id: 'silence', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren, A = b.stage.arena;
    stage(m, 2);
    g.setHidden(true);
    g.untargetable = true;
    const st = ST(m);
    j.controller = K.scripted();
    j.setState('scripted', { pose: 'jr_idle', expression: 'cold' });
    const crater = new V3(SPOT.spire[0], A.y, SPOT.spire[1]);
    m.music(null, 0);
    m.shot((t, o, el) => {
      o.pos.copy(crater).add(new V3(14 - el, 8, 10));
      o.look.copy(crater);
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.vfx.dust(crater.clone(), 6, 14);
    yield* st.wait(2.4);
    TK().react(m, 'krillin', 'Goku...? GOKU!', 2, { style: 'shout' });
    yield* st.wait(2);
    TK().react(m, 'adult_gohan', 'Dad... no...', 2);
    yield* st.wait(2);
    SL.Cinema.shotOn(m, S, { subject: 'grandpriest', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* TK().priest(m, 'Son Goku was not struck down by Jiren. He was swallowed by his own attack. There is no penalty for Universe 11.', 4.4);
    // Beerus, close and quiet
    SL.Cinema.shotOn(m, S, { subject: 'beerus', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.beerus, 'bs_idle', 'sad');
    m.say('beerus', 'Is this really it, Saiyan? ...Goku. Are you truly finished?', 4);
    yield* st.wait(4);
    // the arena trembles; rocks drift upward
    const shake = () => {
      b.camera.trauma = Math.max(b.camera.trauma, 0.25);
      if (b.frame % 6 === 0) b.vfx.rock(crater.clone().add(new V3(U.rand(-12, 12), 0.2, U.rand(-12, 12))), new V3(0, U.rand(2, 6), 0), U.rand(0.2, 0.6), 0xa29884);
    };
    m.tickHooks.push(shake);
    b.sfx('rumble', j, { vol: 1 });
    TK().react(m, 'whis', 'The Spirit Bomb\'s energy, and his own force resisting it to the very end... When those two collided, he broke through his own shell.', 5);
    yield* st.wait(5);
    // Beerus feels it before he sees it: up off the edge of his seat, close from the side, the corner of his mouth
    K.watcher(S.beerus, 'sp_lean', 'cocky');
    SL.Cinema.shotOn(m, S, { subject: 'beerus', focus: 'closeup', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.8);
    m.say('beerus', 'Here it comes...', 2.4);
    yield* st.wait(2.4);
    K.unhook(m, shake);
    m.endShot();
    b.skipRequested = false;
  } };

  /** The pillar of light, and what walks out of it. */
  P.pillar = { id: 'pillar', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren, A = b.stage.arena;
    stage(m, 2);
    // he is inside the light until he walks out of it (stage() shows everyone)
    g.setHidden(true);
    g.untargetable = true;
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    const crater = K.ground(b, new V3(SPOT.spire[0], 0, SPOT.spire[1]));
    K.place(j, K.ground(b, crater.clone().add(new V3(0, 0, -14))), 0);
    K.faceTo(j, crater);
    // the beam: a white-hot core in a cobalt shell, silver particles, straight up into the void
    const cGeo = new THREE.CylinderGeometry(2.2, 2.6, 260, 20, 1, true);
    const outer = new THREE.MeshBasicMaterial({ color: 0x4a7aff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const inner = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const pillar = new THREE.Mesh(cGeo, outer);
    const core = new THREE.Mesh(cGeo, inner);
    core.scale.set(0.55, 1, 0.55);
    pillar.add(core);
    pillar.position.copy(crater).add(new V3(0, 130, 0));
    b.scene.add(pillar);
    m.onDispose(() => {
      if (pillar.parent) pillar.parent.remove(pillar);
      cGeo.dispose();
      outer.dispose();
      inner.dispose();
    });
    const sparkle = () => {
      if (b.frame % 2 === 0) b.vfx.sparks(crater.clone().add(new V3(U.rand(-2, 2), U.rand(0.5, 12), U.rand(-2, 2))), 0xe8eeff, 3, 6, 0.1);
      pillar.rotation.y += 0.02;
    };
    m.tickHooks.push(sparkle);
    SL.ScreenFX.flash(0.6, '#e8f0ff');
    b.sfx('explosionBig', j, { vol: 1.2 });
    b.cameraTraumaAt(crater, 0.8);
    // low, straight up the pillar
    m.shot((t, o, el) => {
      o.pos.copy(crater).add(new V3(10, 0.6, 12));
      o.look.copy(crater).add(new V3(0, 20 + el * 30, 0));
      o.fov = 60;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(2.2);
    // Jiren shields his face from the heat
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    j.setState('scripted', { pose: 'guard', expression: 'shock', speed: 10 });
    yield* st.wait(1.6);
    // the light fades, and a silhouette walks out: from behind, low, slow
    K.toForm(g, 'uiSign');
    g.setHidden(false);
    g.untargetable = false;
    g.setPosition(crater.clone());
    g.grounded = true;
    K.faceTo(g, j.pos);
    g.setState('scripted', { pose: 'bb_walk', expression: 'calm', speed: 4, aura: 0.8 });
    const walkFrom = crater.clone(), walkTo = K.ground(b, crater.clone().add(new V3(0, 0, -3)));
    m.shot((t, o) => {
      const back = g.pos.clone().sub(j.pos).setY(0).normalize();
      o.pos.copy(g.pos).addScaledVector(back, 4).add(new V3(1.2, 0.4, 0));
      o.look.copy(g.chest()).add(new V3(0, 0.4, 0));
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.slowmo(0.5, 2.4);
    // the light narrows behind him as he comes out of it (a wide additive column between the lens and him washed the
    // whole frame white): a silhouette against a beam, the beam gone before he is clear of it
    pillar.scale.set(0.42, 1, 0.42);
    const t0 = performance.now();
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 2600);
      K.place(g, walkFrom.clone().lerp(walkTo, k), g.yaw);
      outer.opacity = 0.4 * Math.max(0, 1 - k * 1.4);
      inner.opacity = 0.7 * Math.max(0, 1 - k * 1.4);
      return k >= 1 || st.skip.on;
    };
    pillar.visible = false;
    K.unhook(m, sparkle);
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', speed: 6, aura: 0.8 });
    // the turn: the silver eyes, extreme close
    m.shot((t, o) => {
      const hd = g.headPos();
      o.pos.copy(hd).addScaledVector(g.forward, 0.7).add(new V3(0, 0.03, 0));
      o.look.copy(hd).add(new V3(0, 0.02, 0));
      o.fov = 34;
    }, 999, { hold: true, cut: true, blendIn: 0, subject: g, face: true });
    yield* st.wait(1.6);
    // the roar: a man's yell over something much older
    g.setState('scripted', { pose: 'powerUp', expression: 'shout', speed: 14, aura: 1 });
    b.sfx('roar', g, { vol: 1.1, pitch: 0.7 });
    m.say('goku', 'HAAAAAAAH!', 2, { style: 'shout' });
    b.vfx.ring(g.pos.clone().add(new V3(0, 0.1, 0)), 12, 0xc8d4ff, 0.6, new V3(0, 1, 0));
    b.cameraTraumaAt(g.chest(), 0.7);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(2);
    TK().mood(m, 'disbelief');
    TK().react(m, 'beerus', 'That form... the hair is black, but the eyes...', 2.8);
    yield* st.wait(2.8);
    TK().react(m, 'whis', 'Ultra Instinct. Or rather — its sign. The state even the gods struggle to reach.', 3.6);
    yield* st.wait(3.6);
    TK().mood(m, 'silent');
    m.endShot();
    b.skipRequested = false;
  } };

  /** Ultra Instinct -Sign-: the body moves by itself. */
  P.instinct = { id: 'instinct', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, 2);
    K.toForm(g, 'uiSign');
    if (g.pos.distanceTo(j.pos) < 5 || g.pos.distanceTo(j.pos) > 20) {
      TK().place(m, 'goku', [0, 6], 'jiren');
      TK().place(m, 'jiren', [0, -6], 'goku');
    }
    g.hp = Math.max(g.hp, g.hpMax * 0.6);
    g.ki = g.kiMax;
    j.hp = Math.min(j.hp, j.hpMax * TU.twenty.floor);
    // the awakening: the body evades nearly everything (the form's own evasion, made surer for this stretch)
    g.storyEvade = { mode: 'god', chance: TU.instinct.evade, gap: 10, from: [j], kinds: ['sway', 'sway', 'step', 'sway'], swayPose: 'g_uiSlip', stepPose: 'g_uiSlip2', whiff: 18, trace: 0xc8d4ff, swayVel: 1.8, stepVel: 4.5, overrun: 6 };
    m.onDispose(() => (g.storyEvade = null));
    let evades = 0;
    const offE = b.on('storyEvade', (e) => {
      if (e.fighter !== g) return;
      evades++;
      // the drop (soundtrack PDF p.91): the blow grazes empty air and the brass lands at full volume
      if (evades === 1) {
        m.music('ui_awakening', 5);
        SL.Music.stinger('ui_drop');
        m.say('jiren', '...!', 1);
      }
      if (evades === 4) m.say('vegeta', 'He isn\'t even thinking... his body is moving on its own!', 2.8);
    });
    // Ultra Instinct -Sign- (soundtrack PDF p.90–91): almost silent — only the pad and the low pulse — until his body
    // first moves on its own (above)
    m.music('ui_awakening', 0);
    m.title(CHAPTER, 'ULTRA INSTINCT -SIGN-', 'The body moves on its own', 2.6);
    m.objective('instinct', 'Your body dodges by itself — strike in the gaps his blows leave', { icon: 'fist' });
    const r = yield* fight(m, TU.instinct, { ai: { aggression: 0.75 } });
    offE();
    g.storyEvade = null;
    if (m.state !== 'running' || !r.pause) return;
    m.complete('instinct');
  } };

  /** The silver goes out. */
  P.fade = { id: 'fade', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, j = S.jiren;
    stage(m, 2);
    K.toForm(g, 'uiSign');
    const st = ST(m);
    g.controller = K.scripted();
    j.controller = K.scripted();
    if (g.pos.distanceTo(j.pos) > 8) TK().place(m, 'jiren', [g.pos.x, g.pos.z - 6], 'goku');
    K.faceTo(g, j.pos);
    K.faceTo(j, g.pos);
    g.setState('scripted', { pose: 'g_uiStance', expression: 'calm', aura: 0.8 });
    j.setState('scripted', { pose: 'jr_stance', expression: 'cold' });
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'full', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1);
    // the aura flickers, and goes
    for (let i = 0; i < 6 && !st.skip.on; i++) {
      g.setState('scripted', { pose: 'g_uiStance', expression: 'hurt', aura: i % 2 ? 0.8 : 0 });
      yield* st.wait(0.12);
    }
    K.toForm(g, 'base');
    b.sfx('kiUp', g, { pitch: 0.5, vol: 0.6 });
    g.setState('scripted', { pose: 'g_defeatKnee', expression: 'exhausted', speed: 8, aura: 0 });
    yield* st.wait(1.4);
    SL.Cinema.shotOn(m, S, { subject: 'jiren', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('jiren', 'That power was not yours to hold. You could not even keep it.', 3.2);
    yield* st.wait(3.2);
    j.setState('scripted', { pose: 'bb_walk', expression: 'cold', speed: 4 });
    const jFrom = j.pos.clone(), jTo = K.ground(b, j.pos.clone().add(new V3(0, 0, -10)));
    j.yaw = j.prevYaw = Math.atan2(jTo.x - jFrom.x, jTo.z - jFrom.z);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    const t0 = performance.now();
    m.say('goku', '...What... was that?', 2.4);
    yield () => {
      const k = Math.min(1, (performance.now() - t0) / 2400);
      K.place(j, jFrom.clone().lerp(jTo, k), j.yaw);
      return k >= 1 || st.skip.on;
    };
    TK().react(m, 'whis', 'Something he cannot yet call on at will. But his body remembers it now.', 3.4);
    yield* st.wait(3.4);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'THE SPIRIT BOMB', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.topJiren = { TU };
  SL.data.missions.top_jiren = {
    id: 'top_jiren', canon: true, chapter: CHAPTER, title: 'The Spirit Bomb', character: 'goku', stage: 'top_arena',
    subtitle: 'The Tournament of Power · Goku vs Jiren', parTime: 720, qteLabel: 'The Spirit Bomb',
    blurb: 'Eight universes, one platform, and the losers erased. Goku goes straight for the strongest fighter there — and finds a wall.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' }, adult_gohan: { outfit: 'ag_ultimate' }, tien: { outfit: 'tien_top' }, android_18: { outfit: 'a18_top' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue', 'blueKaioken', 'uiSign'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Form: Goku — Ultra Instinct -Sign-', 'Form: Goku — Blue Kaioken ×20'],
    setup,
    phases: [P.arena, P.blue, P.twenty, P.kaioken, P.bomb, P.silence, P.pillar, P.instinct, P.fade],
  };
})();
