/*
 * CHAPTER 16 — BATTLE OF GODS, mission 7: "My World" (canon). Played as GOKU. The climax, the owner's shot list.
 *
 *   SPHERE    (scene, SPACE)           one finger raised: a sun of orange fire grows on it until it fills the sky
 *                                      and lights everything; "If you can't stop this, your world ends"; thrown
 *                                      down at the Earth
 *   CATCH *   (play: a struggle, SPACE / HIGH-AIR)  under it, palms flat on it — and it is too much: pushed down
 *                                      toward the Earth, the gi burning away, the gold going out of his hair, the
 *                                      eyes rolling back, the grip going (the story will not let him win this one)
 *   VOID      (scene, black)           nothing: no sky, no Earth, no battle. Goku tumbling in the dark. The voices —
 *                                      "Goku!" "Kakarot!" "Dad!" — and silence. CHI-CHI, running at the lens, in
 *                                      tears: "GOKUUUU!!!" A blue line of light crosses the dark and strikes him in
 *                                      the back. The eyes open. The fists to the waist.
 *   ROAR *    (cue: Charge, then scene) the head thrown back, the scream — no words — the God's flame, the red hair;
 *                                      up into the sphere; his ki through it; it cracks; it blows outward at the
 *                                      lens; white
 *   QUIET     (scene, ZERO-G)          the white fades to space; no music, nothing on screen; Goku in base form,
 *                                      floating, emptied; "You are the second strongest foe I have fought in a long
 *                                      time." / "Only the second...?"; the laugh; the head lolls; he drifts — and the
 *                                      god's hand catches his wrist
 *   UNIVERSES (scene, GROUND: the deck) Universe 7, twelve universes, someone stronger (Whis); a pebble destroyed;
 *                                      a god pretending to fall asleep; Whis takes him home; "That's MY Bulma!"
 *   AFTER                              the chapter card
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const BP = () => SL.data.bogParty;
  const S = (SL.data.scenes = SL.data.scenes || {});

  const SP = { full: 38, hand: 2.25, catchY: 0, pushTo: -46, struggle: 10, start: 0.75 };

  function setup(battle) {
    const b = battle;
    // Goku of the Super era: his own transformation lines, not Namek's
    K().superVoice(b);
    const s = BP().setup(b, { player: 'goku', godsHere: true });
    for (const f of Object.values(s)) {
      if (!f || !f.setState) continue;
      if (f !== s.goku) f.untargetable = f.intangible = true;
      if (f !== s.goku && f !== s.beerus) f.setHidden(true);
    }
    s.beerus.setHidden(false);
    K().toForm(s.goku, 'godki');
    s.goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true };
    if (s.goku.setDamage) s.goku.setDamage(1);
    SL.Staging._put(s.goku, new V3(-4, 0, 0));
    SL.Staging._put(s.beerus, new V3(4, 6, 0));
    s.goku.grounded = s.beerus.grounded = false;
    s.goku.storySpace = s.beerus.storySpace = 'air';
    return s;
  }

  /** The sun, wherever a restart needs it. */
  function ensureSphere(m, r, at) {
    const b = m.battle, s = b.story;
    if (!s.sphere) {
      s.sphere = K().sphere(b, at || new V3(0, 40, 0));
      m.onDispose(() => s.sphere && s.sphere.dispose());
    }
    s.sphere.set(r);
    if (at) s.sphere.group.position.copy(at);
    s.sphere.group.visible = true;
    b.stage.setMood(0.35, 0x3a1406, 0.6);
    return s.sphere;
  }
  /** Goku under it, palms on it (SPACE: exactly where he is put). */
  function underIt(m, y, pose = 'bg_holdUp', expr = 'grit') {
    const b = m.battle, s = b.story;
    K().air(m, s.goku, 0, y, 0, new V3(0, y, 6), pose, expr);
    s.sphere.group.position.set(0, y + SP.hand + s.sphere.radius, 0);
  }

  const P = {};
  P.sphere = {
    id: 'sphere',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        m.endShot();
      }
      b.stage.setAltitude(0.95);
      yield* SL.Cinema.play(m, 'bgs_sphere');
    },
  };

  /** THE CATCH: a struggle the story will not let him win. */
  P.catch = {
    id: 'catch',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        m.endShot();
      }
      b.stage.setAltitude(0.95);
      K().toForm(g, 'godki');
      ensureSphere(m, SP.full);
      underIt(m, SP.catchY);
      K().air(m, s.beerus, 30, 70, -40, g.pos, 'bs_idle', 'calm');
      const GOKU = { subject: 'goku', focus: 'upper', angle: 'low' };
      const WIDE = { subject: 'goku', focus: 'wide', angle: 'low', room: 30, aim: [0, 24, 0], fov: 58 };
      SL.Cinema.shotOn(m, { goku: g }, (t, el) => (el % 5 < 2.8 ? GOKU : WIDE), 60);
      m.objective('hold', 'Hold it back', { icon: 'ball' });
      m.music('desperate', 4);
      let said = 0, dmg = 1, base = false;
      const r = yield* m.struggle({
        start: SP.start,
        drain: 0.16,
        duration: SP.struggle,
        label: 'HOLD IT BACK!',
        // the story holds the bar: he is losing, whatever is pressed
        override: (t, grip) => Math.min(grip, SP.start - t * 0.07),
        onTick: (t, grip) => {
          const k = Math.min(1, t / SP.struggle);
          const y = SP.catchY + (SP.pushTo - SP.catchY) * k * k;
          underIt(m, y, t > SP.struggle * 0.62 ? 'bg_holdFail' : 'bg_holdUp', t > SP.struggle * 0.8 ? 'ko' : 'grit');
          s.sphere.pulse();
          b.stage.setAltitude(0.95 - k * 0.3);
          if (b.frame % 4 === 0) b.camera.addTrauma(0.04 + k * 0.06);
          if (b.frame % 3 === 0) b.vfx.sparks(g.handPos('R'), 0xffb060, 3, 4, 0.1);
          // the gi burning away
          const want = k > 0.7 ? 3 : k > 0.35 ? 2 : 1;
          if (want > dmg && g.setDamage) {
            dmg = want;
            g.setDamage(dmg, { burst: true });
          }
          // the gold goes out of his hair
          if (!base && t > SP.struggle * 0.55) {
            base = true;
            K().toForm(g, 'base');
            b.vfx.flash(g.chest(), 2, 0xffd040, 0.3, SL.Toon.tex.glow);
          }
          if (t > 1.5 && said === 0) {
            said = 1;
            m.say('goku', 'Ngh...! It\'s... so HEAVY...!', 2.4, { style: 'shout' });
          }
          if (t > 4.5 && said === 1) {
            said = 2;
            m.say('beerus', 'Is that all? Then your planet is finished.', 2.6);
          }
          if (t > 7 && said === 2) {
            said = 3;
            m.say('goku', 'I... can\'t...', 2, { style: 'quiet' });
          }
        },
      });
      m.flags.held = Math.round((1 - r.grip) * 100);
      m.failObjective('hold');
      m.endShot();
      K().toForm(g, 'base');
      if (g.setDamage) g.setDamage(3);
    },
  };

  P.void = K().scene('void', 'bgs_void');

  /** THE ROAR: one button — then no words, only the scream. */
  P.roar = {
    id: 'roar',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku;
      m.lock(true);
      m.clearObjectives();
      if (!b._void) {
        if (b.stage.def.id !== 'stratosphere') {
          b.changeStage('stratosphere');
          m.endShot();
        }
        ensureSphere(m, SP.full);
        underIt(m, SP.pushTo, 'bg_fistsWaist', 'determined');
        s.sphere.group.visible = false;
        K().voidOn(m, [g]);
        K().toForm(g, 'base');
        if (g.setDamage) g.setDamage(3);
      }
      g.setState('scripted', { pose: 'bg_fistsWaist', expression: 'determined', speed: 10 });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'front' }, 60);
      const cue = yield* m.cue('charge', 'Let it out', { auto: 3 });
      m.flags.roar = cue.pressed ? 'player' : 'story';
      yield* SL.Cinema.play(m, 'bgs_roar');
    },
  };

  P.quiet = K().scene('quiet', 'bgs_quiet');
  P.universes = K().scene('universes', 'bgs_universes');
  P.after = K().after('BATTLE OF GODS');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, p) => K().pt(ctx, n, p);

  /* ---------------------------------------------------------------- the Sphere of Destruction */
  S.bgs_sphere = {
    id: 'bgs_sphere',
    cast,
    clearMood: false,
    music: { song: 'ominous', level: 3 },
    events: [
      // up above him, one finger raised
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().toForm(s.goku, 'godki');
          K().air(m, s.goku, 0, 0, 0, new V3(0, 30, 0), 'g_godStance', 'serious');
          K().air(m, s.beerus, 0, 30, -4, s.goku.pos, 'bs_sphere', 'calm');
          s.sphere = s.sphere || K().sphere(ctx.b, s.beerus.handPos('R').add(new V3(0, 0.6, 0)));
          ctx.m.onDispose(() => s.sphere && s.sphere.dispose());
          s.sphere.set(0.3);
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const r = 0.3 + Math.min(1, t / 3) * 3.2;
          s.sphere.set(r);
          s.sphere.group.position.copy(s.beerus.handPos('R').add(new V3(0, 0.3 + r, 0)));
          s.sphere.pulse();
        },
        title: { chapter: 'CHAPTER 16 · BATTLE OF GODS', title: 'MY WORLD', subtitle: 'The Sphere of Destruction', duration: 3.4 },
        cam: { subject: 'beerus', focus: 'full', angle: 'low', aim: [0, 2, 0] },
        sfx: { name: 'kiCharge', vol: 1, pitch: 0.5 },
        hold: 3.2,
      },
      // it keeps growing: a sun over the Earth
      {
        call: (ctx) => {
          pt(ctx, 'below', new V3(18, -26, 40));
          ctx.b.stage.setMood(0.3, 0x3a1406, 2);
          ctx.b.sfx('rumble', null, { vol: 1.2, pitch: 0.4 });
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const r = 3.5 + Math.min(1, t / 4) * (SP.full - 3.5);
          s.sphere.set(r);
          s.sphere.group.position.copy(s.beerus.handPos('R').add(new V3(0, 0.3 + r, 0)));
          s.sphere.pulse();
          b.camera.addTrauma(0.03);
        },
        cam: { from: { at: 'below' }, look: { at: 'beerus', off: [0, 22, 0] }, fov: 70, raw: true },
        hold: 4.2,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'low' },
        tick: (ctx) => st(ctx).sphere.pulse(),
        say: { who: 'goku', line: 'That\'s... huge! He\'s going to destroy the Earth!', duration: 2.8, style: 'shout' },
        hold: 2.8,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'low' },
        tick: (ctx) => st(ctx).sphere.pulse(),
        say: { who: 'beerus', line: 'If you can\'t stop this, your world ends. Let\'s see what a god can do.', duration: 3.6 },
        hold: 3.6,
      },
      // thrown down
      {
        pose: [{ who: 'beerus', pose: 'bs_sphereThrow', face: 'grin', speed: 12 }],
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const p = s.sphere.group.position;
          p.y -= 0.18 + t * 0.3;
          s.sphere.pulse();
          b.camera.addTrauma(0.04);
        },
        cam: { from: { at: 'goku', off: [10, -6, 22] }, look: { at: 'goku', off: [0, 20, 0] }, fov: 66, raw: true },
        sfx: { name: 'wind', vol: 1.2, pitch: 0.4 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          K().air(ctx.m, s.goku, 0, SP.catchY, 0, new V3(0, SP.catchY, 6), 'bg_holdUp', 'shout');
          s.sphere.group.position.set(0, SP.catchY + SP.hand + SP.full, 0);
          ctx.b.cameraTraumaAt(s.goku.pos, 1);
          ctx.b.sfx('explosionBig', s.goku, { pitch: 0.5, vol: 1.2 });
          SL.ScreenFX.flash(0.3, '#ffb070');
        },
        tick: (ctx) => st(ctx).sphere.pulse(),
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        say: { who: 'goku', line: 'I won\'t... let you...!', duration: 2, style: 'shout' },
        hold: 2,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      ensureSphere(ctx.m, SP.full);
      underIt(ctx.m, SP.catchY);
    },
  };

  /* ---------------------------------------------------------------- THE VOID */
  S.bgs_void = {
    id: 'bgs_void',
    cast,
    clearMood: false,
    music: { song: null, level: 0 },
    events: [
      // the light of the sphere is gone: black, silent; he tumbles over backwards in it
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().toForm(s.goku, 'base');
          if (s.goku.setDamage) s.goku.setDamage(3);
          if (s.sphere) s.sphere.group.visible = false;
          K().voidOn(ctx.m, [s.goku]);
          s.goku.setState('scripted', { pose: 'bg_tumble', expression: 'ko', speed: 3 });
          b.silence && b.silence(0.6, { sfx: true });
          pt(ctx, 'here', s.goku.chest());
        },
        cam: { from: { at: 'here', off: [3.4, 0.8, 4.2] }, to: { at: 'here', off: [2.6, 0.2, 3.2] }, look: { at: 'here' }, fov: 40, raw: true },
        sfx: { name: 'tinnitus', vol: 0.25 },
        hold: 3.6,
      },
      // THE VOICES: all of them, over each other, out of nowhere — surfacing in the dark and sinking away
      {
        call: (ctx) => {
          ctx.offWhispers = K().whispers(ctx.m, [
            ['krillin', 'Goku!'],
            ['vegeta', 'Kakarot!'],
            ['gohan', 'Dad!'],
            ['bulma', 'Son-kun!'],
            ['goten', 'Daddy!'],
            ['piccolo', 'Goku!'],
            ['trunks', 'Mr. Goku!'],
            ['videl', 'Mr. Goku!'],
            ['krillin', 'GOKU!'],
            ['vegeta', 'KAKAROT!'],
            ['gohan', 'DAD!'],
          ], 0.4);
        },
        cam: { from: { at: 'here', off: [-2.6, 1.6, 3] }, to: { at: 'here', off: [-1.7, 1.1, 2.1] }, look: { at: 'here' }, fov: 36, raw: true, ease: 'linear' },
        sfx: { name: 'visionIn', vol: 0.45, pitch: 0.55 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'here', off: [0.6, 3.4, 1.6] }, to: { at: 'here', off: [0.4, 2.6, 1.2] }, look: { at: 'here' }, fov: 40, raw: true },
        hold: 2,
      },
      // silence: the voices are gone
      {
        call: (ctx) => {
          if (ctx.offWhispers) ctx.offWhispers();
          ctx.offWhispers = null;
        },
        hold: 1.6,
      },
      // CHI-CHI: tight, running at the lens, in tears
      {
        call: (ctx) => {
          const s = st(ctx);
          s.goku.setHidden(true);
          s.chichi.setHidden(false);
          SL.Staging._put(s.chichi, s.goku.pos.clone().add(new V3(0, -0.6, -9)));
          s.chichi.grounded = false;
          K().faceTo(s.chichi, s.goku.pos.clone().add(new V3(0, 0, 10)));
          s.chichi.setState('scripted', { pose: 'bg_reachRun', expression: 'sad', speed: 9 });
          SL.ScreenFX.vision(0.45);
          pt(ctx, 'lens', s.chichi.pos.clone().add(new V3(0.2, 1.5, 4)));
        },
        move: { who: 'chichi', at: 'lens', off: [0, -1.5, -1.6], seconds: 2.2, ground: false },
        cam: { from: { at: 'lens' }, look: { at: 'chichi', off: [0, 0.4, 0] }, fov: 34, raw: true },
        tick: (ctx) => {
          const c = st(ctx).chichi;
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.trail(c.headPos().add(new V3(0.08, 0.02, 0.1)), 0xbfe8ff, 0.05, 0.4);
        },
      },
      {
        cam: { subject: 'chichi', focus: 'closeup', angle: 'front' },
        pose: [{ who: 'chichi', pose: 'bg_reachRun', face: 'shout', speed: 9 }],
        say: { who: 'chichi', line: 'GOKUUUU!!!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      // the blue line: across the dark, into his back
      {
        call: (ctx) => {
          const s = st(ctx);
          s.chichi.setHidden(true);
          SL.ScreenFX.vision(0);
          s.goku.setHidden(false);
          s.goku.setState('scripted', { pose: 'bg_tumble', expression: 'ko', speed: 1 });
          const back = s.goku.chest().addScaledVector(s.goku.forward, -0.25);
          // it comes from far behind him, out of the dark, straight at the middle of his back
          const from = back.clone().addScaledVector(s.goku.forward, -46).add(new V3(-14, -10, 0));
          const dir = back.clone().sub(from).normalize();
          const across = new V3().crossVectors(dir, new V3(0, 1, 0)).normalize();
          pt(ctx, 'from', from);
          pt(ctx, 'back', back);
          // the lens off to the side of its path: the whole streak crosses the frame toward him
          pt(ctx, 'wideL', back.clone().addScaledVector(dir, -9).addScaledVector(across, 13).add(new V3(0, 2.2, 0)));
          pt(ctx, 'wideLook', back.clone().addScaledVector(dir, -9));
        },
        tick: (ctx, t) => {
          const head = K().blueLine(ctx.b, ctx.cast.from.pos, ctx.cast.back.pos, t / 1.5);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.sparks(head, 0x8ad8ff, 4, 4, 0.1);
        },
        cam: { from: { at: 'wideL' }, look: { at: 'wideLook' }, fov: 58, raw: true },
        sfx: { name: 'visionIn', vol: 1 },
        hold: 1.55,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.flash(ctx.cast.back.pos, 3, 0x9ae0ff, 0.35, SL.Toon.tex.glow);
          b.vfx.ring(ctx.cast.back.pos, 3, 0x6ac8ff, 0.45);
          b.camera.addTrauma(0.7);
          b.sfx('kiBlastBig', s.goku, { pitch: 1.3, vol: 1.1 });
          SL.ScreenFX.flash(0.35, '#9ad8ff');
        },
        pose: [{ who: 'goku', pose: 'hitBack', face: 'shock', speed: 20 }],
        cam: { from: { at: 'back', off: [2.2, 0.5, 2.6] }, look: { at: 'back' }, fov: 42, raw: true },
        hold: 0.8,
      },
      // the eyes snap open
      {
        pose: [{ who: 'goku', pose: 'bg_float', face: 'determined', speed: 10 }],
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        sfx: { name: 'heartbeat', vol: 1.1 },
        hold: 1.2,
      },
      // the fists to the waist
      {
        pose: [{ who: 'goku', pose: 'bg_fistsWaist', face: 'determined', speed: 12 }],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        sfx: { name: 'heartbeat', vol: 1.2 },
        hold: 1.4,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (ctx.offWhispers) ctx.offWhispers();
      ctx.offWhispers = null;
      if (ctx.b._void && ctx.b._void.key) ctx.b._void.key.color.set(0xdfe8ff);
      SL.ScreenFX.vision(0);
      s.chichi.setHidden(true);
      if (!ctx.b._void) K().voidOn(ctx.m, [s.goku]);
      if (s.sphere) s.sphere.group.visible = false;
      s.goku.setHidden(false);
      s.goku.setState('scripted', { pose: 'bg_fistsWaist', expression: 'determined' });
    },
  };

  /* ---------------------------------------------------------------- the roar, the flame, the sphere breaking */
  S.bgs_roar = {
    id: 'bgs_roar',
    cast,
    clearMood: false,
    events: [
      // tight on the face: the head goes back; the scream; no words
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.sfx('roar', s.goku, { vol: 1.3, pitch: 0.9 });
          b.camera.addTrauma(0.5);
        },
        pose: [{ who: 'goku', pose: 'bg_roar', face: 'shout', speed: 12 }],
        // the head is thrown back, the face to the sky: the lens above it and in front of him, looking down into
        // the scream (the forehead to the top of the frame — never the underside of the chin)
        cam: { from: { at: 'goku', local: [0.2, 1.75, 1.0] }, look: { at: 'goku:face' }, fov: 40, raw: true, follow: true },
        tick: (ctx) => ctx.b.camera.addTrauma(0.03),
        hold: 1.6,
      },
      // the God's flame erupts out of him: the dark lit red, ring after ring, the hair going red
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().toForm(s.goku, 'god');
          b.vfx.ring(s.goku.chest(), 6, 0xff5a6a, 0.6);
          b.after(10, () => b.vfx.ring(s.goku.chest(), 11, 0xff8a7a, 0.7));
          b.after(20, () => b.vfx.ring(s.goku.chest(), 17, 0xffb0a0, 0.8));
          b.vfx.flash(s.goku.chest(), 6, 0xff6a5a, 0.5, SL.Toon.tex.glow);
          b.vfx.light(s.goku.chest(), 0xff4a4a, 6, 30, 1.6);
          b.sfx('transformBurst', s.goku, { vol: 1.3, pitch: 0.8 });
          SL.ScreenFX.flash(0.45, '#ff8a7a');
          pt(ctx, 'flameCam', s.goku.pos.clone().addScaledVector(s.goku.forward, 5.2).add(new V3(1.2, 0.4, 0)));
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          b.camera.addTrauma(0.04);
          // the void takes his light: the cold key light goes red
          if (b._void && b._void.key) b._void.key.color.set(0xdfe8ff).lerp(new THREE.Color(0xff4a4a), Math.min(1, t / 0.8));
          if (b._void && b._void.light) b._void.light.color.set(0x9ab0ff).lerp(new THREE.Color(0xff6a5a), Math.min(1, t / 0.8));
          if (b.frame % 2 === 0) b.vfx.streamInward(s.goku.chest(), 3.5, 0xff6a6a, 3, 0.16, 0.35);
        },
        pose: [{ who: 'goku', pose: 'bg_roar', face: 'shout', speed: 12, aura: 1.4 }],
        cam: { from: { at: 'flameCam' }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 50, raw: true },
        music: { song: 'ssj_god', level: 6 },
        hold: 1.8,
      },
      // the world comes back: the sun above him, the Earth below
      {
        call: (ctx) => {
          const s = st(ctx);
          K().voidOff(ctx.m, false);
          for (const f of Object.values(s)) if (f && f.setHidden && f !== s.goku && f !== s.beerus) f.setHidden(true);
          s.beerus.setHidden(false);
          // (a run that came straight into the void has no sun yet: it is right where he left it, over him)
          if (!s.sphere) ensureSphere(ctx.m, SP.full, s.goku.pos.clone().add(new V3(0, SP.hand + SP.full, 0)));
          s.sphere.group.visible = true;
          pt(ctx, 'under', s.goku.pos.clone().add(new V3(14, -18, 30)));
        },
        pose: [{ who: 'goku', pose: 'bg_surge', face: 'shout', speed: 10, aura: 1 }],
        cam: { from: { at: 'under' }, look: { at: 'goku', off: [0, 16, 0] }, fov: 66, raw: true },
        tick: (ctx) => st(ctx).sphere && st(ctx).sphere.pulse(),
        hold: 1.2,
      },
      // up into it
      {
        call: (ctx) => {
          const s = st(ctx);
          pt(ctx, 'core', s.sphere.group.position.clone());
        },
        space: { who: 'goku', mode: 'flight', to: { at: 'core', off: [0, -SP.full * 0.55, 0] }, seconds: 1, pose: 'bg_surge', endPose: 'bg_surge' },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          s.sphere.pulse();
          s.sphere.veins(t * 0.8);
          b.vfx.trail(s.goku.chest(), 0xff4a5a, 1.6, 0.5);
          b.camera.addTrauma(0.05);
        },
        // rising with him, under and behind: the red flame going up into the face of the sun
        cam: { from: { at: 'goku', off: [3.2, -4.5, 6.5] }, look: { at: 'goku', off: [0, 9, 0] }, fov: 64, raw: true, follow: true },
      },
      // his hands in it: the surface of the sun right over him, the red going into the orange
      {
        call: (ctx) => {
          const s = st(ctx);
          pt(ctx, 'palms', s.goku.handPos('R').lerp(s.goku.handPos('L'), 0.5));
        },
        pose: [{ who: 'goku', pose: 'bg_holdUp', face: 'shout', speed: 14, aura: 1.2 }],
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          s.sphere.pulse();
          s.sphere.veins(0.8 + t * 0.1);
          if (b.frame % 2 === 0) b.vfx.sparks(ctx.cast.palms.pos, 0xff4a6a, 6, 7, 0.12);
          b.camera.addTrauma(0.05);
        },
        cam: { from: { at: 'palms', off: [3.4, -1.6, 3.8] }, look: { at: 'palms', off: [0, 0.6, 0] }, fov: 52, raw: true },
        sfx: { name: 'kiCharge', vol: 1.2, pitch: 0.55 },
        hold: 1.2,
      },
      // his ki through it: red veins, then cracks of light
      {
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          s.sphere.pulse();
          s.sphere.veins(0.8 + t * 0.2);
          s.sphere.crack(t / 1.8);
          b.camera.addTrauma(0.06);
          if (b.frame % 3 === 0) {
            const d = new V3(Math.sin(b.frame * 1.3), Math.cos(b.frame * 0.7), Math.sin(b.frame * 2.1)).normalize();
            b.vfx.sparks(s.sphere.group.position.clone().addScaledVector(d, s.sphere.radius), 0xff4a8a, 6, 8, 0.4);
          }
        },
        cam: { from: { at: 'core', off: [34, -30, 62] }, look: { at: 'core' }, fov: 64, raw: true },
        sfx: { name: 'rumble', vol: 1.3, pitch: 0.6 },
        hold: 1.8,
      },
      // it blows outward — at the lens — and everything is white
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.sfx('explosionHuge', null, { vol: 1.5, pitch: 0.6 });
          b.camera.addTrauma(1);
          pt(ctx, 'lens', s.sphere.group.position.clone().add(new V3(0, -10, SP.full * 2.2)));
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          s.sphere.burst(t / 1.1);
          b.vfx.ring(s.sphere.group.position, SP.full * (1 + t * 2), 0xffd0a0, 0.3);
          if (t > 0.5) SL.ScreenFX.flash(Math.min(1, (t - 0.5) * 2), '#ffffff');
        },
        cam: { from: { at: 'lens' }, look: { at: 'core' }, fov: 70, raw: true },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.sphere) {
            s.sphere.dispose();
            s.sphere = null;
          }
          ctx.m.fade('white', 0.3);
          SL.ScreenFX.flash(1, '#ffffff');
        },
        music: { song: null, level: 0 },
        hold: 1.2,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      K().voidOff(ctx.m, false);
      if (s.sphere) {
        s.sphere.dispose();
        s.sphere = null;
      }
      b.stage.clearMood(0.2);
      ctx.m.flags.sphereBroken = true;
    },
  };

  /** The god's hand on the mortal's wrist: Beerus is eased until his right hand is where Goku's right hand is. */
  function gripHold(ctx) {
    const s = st(ctx);
    const d = s.goku.handPos('R').sub(s.beerus.handPos('R'));
    if (d.length() > 3) return;
    s.beerus.pos.addScaledVector(d, 0.35);
    s.beerus.prevPos.copy(s.beerus.pos);
  }

  /** Square to the line between the god and the mortal, on the side Goku is facing. */
  function gripSide(ctx) {
    const s = st(ctx);
    const dir = s.beerus.pos.clone().sub(s.goku.pos).setY(0);
    if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0);
    dir.normalize();
    const across = new V3().crossVectors(dir, new V3(0, 1, 0)).normalize();
    if (across.dot(s.goku.forward) < 0) across.negate();
    return across;
  }

  /* ---------------------------------------------------------------- the quiet: "Only the second...?" */
  S.bgs_quiet = {
    id: 'bgs_quiet',
    cast,
    clearMood: false,
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          if (b.stage.def.id !== 'stratosphere') {
            b.changeStage('stratosphere');
            m.endShot();
          }
          b.stage.setAltitude(0.97);
          K().toForm(s.goku, 'base');
          if (s.goku.setDamage) s.goku.setDamage(3);
          s.goku.aura.target = 0;
          K().air(m, s.goku, 0, 0, 0, new V3(3, 0.5, 0), 'bg_float', 'exhausted');
          K().air(m, s.beerus, 3, 0.8, 0.4, s.goku.pos, 'bs_flyIdle', 'calm');
          m.fade('clear', 1.6);
          pt(ctx, 'two', new V3(1.5, 0.4, 0));
        },
        cam: { from: { at: 'two', off: [2, 3, 14] }, to: { at: 'two', off: [1, 1.5, 9] }, look: { at: 'two', off: [0, -0.4, 0] }, fov: 44, raw: true },
        sfx: { name: 'wind', vol: 0.2, pitch: 0.4 },
        hold: 3.4,
      },
      // 00:00 — the god looks at him
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'You are the second strongest foe I have fought in a long time.', duration: 3.8 },
        hold: 4,
      },
      // 00:05 — "Only the second...?"
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        pose: [{ who: 'goku', pose: 'bg_float', face: 'shock', speed: 3 }],
        say: { who: 'goku', line: 'Only the second...? And here I thought I gave it everything I\'ve got...', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      // 00:10 — the laugh: how big the universe is, how far there is to go
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        pose: [{ who: 'goku', pose: 'bg_floatLaugh', face: 'grin', speed: 4 }],
        say: { who: 'goku', line: 'Heh... heh heh...', duration: 2.4, style: 'quiet' },
        hold: 3,
      },
      // 00:15 — the head lolls over; he starts to drift down
      {
        pose: [{ who: 'goku', pose: 'bg_floatOut', face: 'ko', speed: 2 }],
        space: { who: 'goku', mode: 'flight', to: { at: 'goku', off: [0, -2.2, 0] }, seconds: 2.4, pose: 'bg_floatOut', endPose: 'bg_floatOut' },
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
      },
      // 00:18 — the hand
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.afterimage(s.beerus.pos, s.beerus.height, 0xd8b0ff);
          b.sfx('vanish', s.beerus, { vol: 0.6 });
          const hand = s.goku.pos.clone().add(new V3(0, 2.1, 0));
          // his hand (reaching down and forward from the shoulder, ~0.95 m over his feet) on Goku's raised wrist
          K().air(ctx.m, s.beerus, hand.x + 0.42, hand.y - 0.95, hand.z, new V3(hand.x - 3, hand.y - 0.95, hand.z), 'bg_catch', 'calm');
          s.goku.setState('scripted', { pose: 'bg_hangWrist', expression: 'ko', speed: 6 });
          pt(ctx, 'grip', hand);
          // the lens level with the hands, square to the line between the two of them: the god's fingers round
          // the mortal's wrist in the middle of the frame, Goku's lolling head under it
          ctx.gripSide = gripSide(ctx);
          // first the two of them: he is simply there, beside him, and has him
          pt(ctx, 'appearCam', hand.clone().addScaledVector(ctx.gripSide, 5.5).add(new V3(0, -0.6, 0)));
          pt(ctx, 'appearLook', hand.clone().add(new V3(0, -0.9, 0)));
        },
        tick: (ctx) => {
          gripHold(ctx);
          const s = st(ctx);
          ctx.cast.grip.pos.copy(s.goku.handPos('R'));
        },
        cam: { from: { at: 'appearCam' }, look: { at: 'appearLook' }, fov: 44, raw: true },
        hold: 1,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.grip.pos, side = ctx.gripSide;
          pt(ctx, 'gripCam', g.clone().addScaledVector(side, 2.6).add(new V3(0, -0.35, 0)));
          pt(ctx, 'gripLook', g.clone().add(new V3(0, -0.45, 0)));
        },
        // tracks the grip itself every frame (the arm is still swinging up into the god's hand as it starts, and the
        // god is still being eased onto it): square to the line between them, on Goku's side — neither body in front
        tick: (ctx) => {
          gripHold(ctx);
          const g = st(ctx).goku.handPos('R');
          ctx.cast.grip.pos.copy(g);
          // level with the grip or a little above it, never looking up at the god's hips
          const want = g.clone().addScaledVector(gripSide(ctx), 2.9).add(new V3(0, 0.25, 0));
          if (!ctx.gripInit) ctx.cast.gripCam.pos.copy(want);
          else ctx.cast.gripCam.pos.lerp(want, 0.12);
          ctx.gripInit = true;
          ctx.cast.gripLook.pos.copy(g).add(new V3(0, -0.3, 0));
        },
        cam: { from: { at: 'gripCam' }, look: { at: 'gripLook' }, fov: 32, raw: true, follow: true },
        sfx: { name: 'block', vol: 0.4, pitch: 0.6 },
        hold: 2.8,
      },
      // the two of them, chest-up: the god holding him up over the curve of the world
      {
        tick: (ctx) => gripHold(ctx),
        cam: { subject: 'beerus', with: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: '...Hmph.', duration: 1.6, style: 'quiet' },
        hold: 2.2,
      },
      // hold it: the end of the battle, pulling away over the Earth
      {
        tick: (ctx) => gripHold(ctx),
        cam: { from: { at: 'grip', off: [6, 1.2, 8] }, to: { at: 'grip', off: [16, 4, 22] }, look: { at: 'grip', off: [0, -1.4, 0] }, look2: { at: 'grip', off: [0, -8, 0] }, fov: 42, raw: true },
        hold: 4,
      },
    ],
    end(ctx) {
      ctx.m.fade('clear', 0.4);
      ctx.m.flags.secondStrongest = true;
    },
  };

  /* ---------------------------------------------------------------- back on the deck: twelve universes */
  S.bgs_universes = {
    id: 'bgs_universes',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('cruise_liner');
          m.endShot();
          K().skyTo(b, { top: 0x3a5ab8, horizon: 0xffb070, bottom: 0xe8905a, fog: 0xf0b890 }, 1);
          for (const f of Object.values(s)) if (f && f.setHidden && f !== s.goku) f.setHidden(false);
          if (s.gotenks) s.gotenks.setHidden(true);
          BP().places(b);
          K().ground(m, s.goku, 0, 10, new V3(0, 0, 14), 'lieBack', 'exhausted');
          K().ground(m, s.beerus, 1.6, 13, s.goku.pos, 'bs_idle', 'calm');
          K().ground(m, s.whis, 3.4, 13.6, s.goku.pos, 'w_idle', 'calm');
          const ring = [[s.krillin, -2, 8.4], [s.gohan, -2.6, 10.6], [s.videl, -3.4, 12], [s.chichi, -1.2, 7.6], [s.vegeta, 2.8, 8.6], [s.bulma, 3.6, 7.6], [s.goten, 1, 7.2], [s.trunks, 2, 6.8], [s.piccolo, -4.4, 9.4]];
          for (const [f, x, z] of ring) K().ground(m, f, x, z, s.goku.pos, 'idle', 'shock');
          s.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'angry' });
          m.fade('clear', 0.8);
          pt(ctx, 'deck', new V3(0, 0, 10));
        },
        cam: { from: { at: 'deck', off: [26, 16, 30] }, to: { at: 'deck', off: [14, 7, 16] }, look: { at: 'deck', off: [0, 1, 0] }, fov: 46 },
        say: { who: 'krillin', line: 'Goku! Hey — he\'s waking up!', duration: 2.4, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'pe_sitUpGasp', face: 'exhausted', speed: 4 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Heh... I lost, huh?', duration: 2.2 },
        hold: 2.4,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'low' },
        say: { who: 'beerus', line: 'I am Beerus, the God of Destruction of Universe 7.', duration: 3 },
        hold: 3,
      },
      {
        cam: { subject: 'krillin', focus: 'upper', angle: 'front' },
        say: { who: 'krillin', line: 'Universe... SEVEN?', duration: 1.8 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'whis', pose: 'w_finger', face: 'calm' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'There are twelve universes in all. Each one has its own God of Destruction.', duration: 3.6 },
        hold: 3.6,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'beerus', line: 'And out there are warriors stronger than any of you. Some... stronger than me.', duration: 3.6 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'whis', pose: 'w_laugh', face: 'smirk' }],
        cam: { subject: 'whis', focus: 'closeup', angle: 'three' },
        say: { who: 'whis', line: 'Lord Beerus\' teacher, for instance. That would be me.', duration: 2.8 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'goku', pose: 'pe_sitUpGasp', face: 'grin', speed: 6 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'Stronger than YOU?! Oh man... I can\'t wait!', duration: 2.8 },
        hold: 2.8,
      },
      // a promise is a promise: one finger at the Earth
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, T = SL.Toon;
          const p = new V3(6.2, 0.18, 11.2);
          s.pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), T.mat(0x8a7a6a));
          T.addOutline(s.pebble, 0.8);
          s.pebble.position.copy(p);
          b.scene.add(s.pebble);
          ctx.m.onDispose(() => s.pebble && s.pebble.parent && s.pebble.parent.remove(s.pebble));
          ctx.m.space(s.beerus, 'ground', { pos: p.clone().add(new V3(-1.6, 0, 0.6)).setY(0), face: p, pose: 'bg_pointDown', expr: 'calm' });
          pt(ctx, 'pebble', p);
        },
        cam: { subject: 'beerus', focus: 'full', angle: 'three' },
        say: { who: 'beerus', line: 'Well. I did say I would destroy the Earth...', duration: 2.8 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'bulma', pose: 'idle', face: 'shock' }, { who: 'krillin', pose: 'idle', face: 'shock' }],
        cam: { subject: 'krillin', with: 'bulma', focus: 'upper', angle: 'front' },
        say: { who: 'bulma', line: 'WHAT?!', duration: 1.4, style: 'shout' },
        hold: 1.4,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.beerus.handPos('R'), 0xd8b0ff, 0.2, 0.3);
          b.vfx.flash(ctx.cast.pebble.pos, 0.6, 0xd8b0ff, 0.2, SL.Toon.tex.glow);
          for (let i = 0; i < 6; i++) b.vfx.rock(ctx.cast.pebble.pos, new V3((i % 3) - 1, 2 + i * 0.3, (i % 2) - 0.5), 0.05, 0x8a7a6a);
          b.sfx('kiBlast', s.beerus, { pitch: 2, vol: 0.4 });
          if (s.pebble && s.pebble.parent) s.pebble.parent.remove(s.pebble);
        },
        cam: { from: { at: 'pebble', off: [0.9, 0.5, 1.2] }, look: { at: 'pebble' }, fov: 34 },
        hold: 1.4,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'There. Destroyed. ...A little bit.', duration: 2.4 },
        hold: 2.4,
      },
      // ...so tired...
      {
        pose: [{ who: 'beerus', pose: 'bg_doze', face: 'closed', speed: 3 }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'front' },
        say: { who: 'beerus', line: 'Ahh... I\'m so... tired...', duration: 2.4, style: 'quiet' },
        sfx: { name: 'growl', vol: 0.4, pitch: 0.5 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'whis', pose: 'w_bow', face: 'smirk' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'Oh dear, he\'s fallen asleep. I\'ll take him home. Thank you for the food — especially that... "pudding."', duration: 4.4 },
        hold: 4.4,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          ctx.m.space(s.whis, 'ground', { pos: s.beerus.pos.clone().add(new V3(0.9, 0, 0.6)), face: s.goku.pos, pose: 'w_staffTap', expr: 'calm' });
          s.travel = K().travel(b, s.whis.pos.clone());
          b.sfx('teleport', s.whis, { pitch: 0.6 });
          pt(ctx, 'up', s.whis.pos.clone().add(new V3(4, 0.5, 6)));
        },
        space: [
          { who: 'whis', mode: 'flight', to: { at: 'whis', off: [0, 70, 0] }, seconds: 1.6, pose: 'w_fly', endPose: 'w_fly' },
          { who: 'beerus', mode: 'flight', to: { at: 'beerus', off: [0, 70, 0] }, seconds: 1.6, pose: 'bg_doze', endPose: 'bg_doze' },
        ],
        tick: (ctx, t) => st(ctx).travel && st(ctx).travel.set(1 - t / 1.6),
        cam: { from: { at: 'up' }, look: { at: 'whis' }, fov: 54 },
      },
      // "That's MY Bulma!"
      {
        call: (ctx) => {
          const s = st(ctx);
          K().hide([s.beerus, s.whis]);
          ctx.m.space(s.goku, 'ground', { pos: s.goku.pos.clone(), face: s.vegeta.pos, pose: 'idle', expr: 'grin' });
        },
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Hey, Vegeta... I heard about earlier. "That\'s MY Bulma!"', duration: 3.2 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'bg_tremble', face: 'angry', speed: 8 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'SHUT UP, KAKAROT!', duration: 2, style: 'shout' },
        hold: 2,
      },
      {
        pose: [{ who: 'bulma', pose: 'bg_cheer', face: 'grin', speed: 5 }, { who: 'krillin', pose: 'bg_cheer', face: 'grin', speed: 5 }, { who: 'goten', pose: 'bg_cheer', face: 'grin', speed: 6 }, { who: 'trunks', pose: 'bg_cheer', face: 'grin', speed: 6 }],
        cam: { subject: 'bulma', focus: 'upper', angle: 'three' },
        say: { who: 'bulma', line: 'Aww, Vegeta! Say it again!', duration: 2.4 },
        music: { song: 'next_journey', level: 1 },
        hold: 2.6,
      },
      // the ship on the sea at sunset
      {
        call: (ctx) => pt(ctx, 'ship', new V3(0, 0, 6)),
        cam: { from: { at: 'ship', off: [40, 22, 70] }, to: { at: 'ship', off: [70, 36, 110] }, look: { at: 'ship', off: [0, 2, 0] }, fov: 46 },
        hold: 4,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.travel) {
        s.travel.dispose();
        s.travel = null;
      }
      if (s.pebble && s.pebble.parent) s.pebble.parent.remove(s.pebble);
      K().hide([s.beerus, s.whis]);
      ctx.m.flags.twelveUniverses = true;
    },
  };

  const def = {
    id: 'bog_sphere',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'My World',
    subtitle: 'The Sphere of Destruction · Universe 7',
    character: 'goku',
    stage: 'stratosphere',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'A sun on the end of a finger, thrown at the Earth. Goku catches it — and there is nothing left in him. Almost nothing.',
    rewards: ['Super Saiyan (God Ki)', 'Free Battle: Beerus', 'Story: the twelve universes'],
    setup,
    phases: [P.sphere, P.catch, P.void, P.roar, P.quiet, P.universes, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogSphere = { SP };
})();
