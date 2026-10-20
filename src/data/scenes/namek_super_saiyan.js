/*
 * SCENES — Krillin, and what comes out of it (Namek saga cinematic brief, phases seven and eight).
 *
 *   krillin_taken       Krillin comes toward Goku to help; Frieza lifts him off the ground with his
 *                       mind. Goku and Krillin held in one frame (the distance between them), Goku
 *                       starting forward and too far away, the hand closing. The flash is in the sky,
 *                       nothing graphic is shown, the sound drops out, the camera is on Goku's face.
 *   goku_super_saiyan   the flagship, in the brief's order: his head down, the fists, the face (a
 *                       whisper), from low as the first energy rises, the dust going out, the sky going
 *                       dark, the change (wide as the aura expands), his eyes, the hero shot, then the
 *                       others: Gohan (amazement and grief), Piccolo, Frieza (fury, disbelief, anger).
 *                       Only then does Goku send Gohan away with Piccolo; back to Goku facing Frieza.
 *   ssj_first_exchange  the first Super Saiyan exchanges, staged: Frieza rushes, Goku moves at the last
 *                       moment and answers to the body; Frieza's string — blocked, slipped, countered.
 *   ssj_sky_exchange    halfway through the reversal: up into the sky, an attack from above
 *                       intercepted, the collision, the two of them apart at different heights, and
 *                       back down — Frieza heavily, Goku several metres off.
 *   goku_legend         after the first exchanges: the legend has a name, and Frieza says it
 *
 * The weather is built from what the engine already has (stage mood, sky bolts, crater,
 * dust, floating rock) and the engine's own transformation sequence runs the form change.
 * The storm mood is left on (clearMood: false); the fight phases keep it going.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, krillin: s.krillin, frieza: s.frieza, gohan: s.gohan, piccolo: s.piccolo, field: s.field };
  };
  /** Lightning somewhere around him, near or far. */
  function strike(b, around, near, far) {
    const a = Math.random() * Math.PI * 2, r = near + Math.random() * (far - near);
    const at = around.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
    if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
    b.vfx.skyBolt(at, 34, 0xeaf0ff);
    b.sfx('lightning', null, { at, vol: 0.7 });
  }
  SL.data.stormStrike = strike;
  /** Store a computed shot as a pair of pseudo-actors the cam events can address. */
  function shot(ctx, name, s) {
    ctx.cast[name] = { pos: s.pos };
    ctx.cast[name + 'At'] = { pos: s.look };
    return s;
  }
  /** Where his right fist is this frame (a pseudo-actor the camera can look at). */
  function fist(ctx) {
    const g = ctx.cast.goku, j = g.model && g.model.joints;
    const p = j && j.handR && g.object ? (g.model.root.updateMatrixWorld(true), j.handR.getWorldPosition(new V3()).sub(g.object.position).add(g.pos)) : g.chest().add(new V3(0, -0.45, 0));
    if (!ctx.cast.fist) ctx.cast.fist = { pos: p };
    else ctx.cast.fist.pos.copy(p);
  }
  /** A blow landing: the flash where it lands, the sound, and on a heavy one a jolt. */
  function contact(ctx, from, to, heavy, color) {
    const a = ctx.cast[from], d = ctx.cast[to];
    if (!a || !d) return;
    const p = a.chest().lerp(d.chest(), 0.6);
    ctx.b.vfx.impact(p, heavy ? 2.6 : 1.3, color === undefined ? 0xfff0b0 : color);
    ctx.b.sfx(heavy ? 'punchHeavy' : 'punchLight', d, { vol: heavy ? 1.1 : 0.85 });
    if (heavy) ctx.b.cameraTraumaAt(p, 0.35);
  }
  /** A blow taken on the guard. */
  function blocked(ctx, from, to) {
    const a = ctx.cast[from], d = ctx.cast[to];
    if (!a || !d) return;
    const p = a.chest().lerp(d.chest(), 0.62);
    ctx.b.vfx.impact(p, 1.1, 0xfff6d0);
    ctx.b.sfx('block', d, { vol: 0.9 });
  }
  /**
   * Roadmap Three, B-KR-03 / CS-S01 (the owner's Gemini research — a research draft, not checked against the footage):
   * Frieza's hold on Krillin as a tight, glowing purple-pink sphere round him, from the lift until the flash.
   */
  function orb(ctx) {
    const k = ctx.cast.krillin;
    if (!k || k.hidden) return;
    orbShell(ctx, k);
    if (ctx.b.frame % 9 !== 0) return;
    ctx.b.vfx.ball(k.chest(), 1.15, 0x4a1470, 0.34);
    ctx.m.flags.krillinOrb = true;
  }
  /** The sphere's colour: the additive shimmer alone came out white-green against Namek's bright sky. */
  function orbShell(ctx, k) {
    if (ctx.orbShell) return;
    const b = ctx.b;
    const mesh = (ctx.orbShell = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xc040a0, transparent: true, opacity: 0.32, depthWrite: false })));
    mesh.position.copy(k.chest());
    b.scene.add(mesh);
    const drop = () => {
      if (!mesh.parent) return;
      b.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    };
    ctx.m.onDispose(drop);
    // follows him while he is held; gone with the flash (he is hidden) or when the scene ends
    b.onTick(() => {
      if (b.disposed || k.hidden || ctx.m.flags.krillinTaken) return drop(), false;
      mesh.position.copy(k.chest());
      return true;
    });
  }
  const turn = (ctx, who, to) => {
    const f = ctx.cast[who], t = ctx.cast[to];
    if (f && t) f.yaw = f.prevYaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
  };

  S.krillin_taken = {
    id: 'krillin_taken',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      // Krillin sees what state Goku is in and comes toward him to help
      {
        pose: [
          { who: 'krillin', pose: 'run', face: 'determined' },
          { who: 'goku', pose: 'exhausted', face: 'hurt' },
        ],
        move: { who: 'krillin', at: 'goku', off: [1.5, 0, -1.4], seconds: 1.1, face: 'frieza' },
        cam: { subject: 'krillin', with: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'krillin', line: 'Goku! Hang on — I\'m coming!', duration: 1.8, style: 'shout' },
      },
      {
        pose: [
          { who: 'frieza', pose: 'fz_point', face: 'smirk' },
          { who: 'krillin', pose: 'guard', face: 'shock' },
        ],
        call: (ctx) => shot(ctx, 'pick', SL.Cinema.overShoulder(ctx.cast.frieza, ctx.cast.krillin, { fov: 36, back: 2.4, side: 1, height: 0.7, lookUp: -0.15 })),
        cam: { from: { at: 'pick' }, look: { at: 'pickAt' }, fov: 36 },
        say: { who: 'frieza', line: 'You\'re the one who cut off my tail. Don\'t think I\'ve forgotten.', duration: 3 },
        hold: 3.2,
      },
      // lifted: his feet leave the ground and he cannot do anything about it
      {
        call: (ctx) => {
          ctx.liftFrom = ctx.cast.krillin.pos.clone();
          ctx.b.sfx('kiCharge', ctx.cast.frieza, { vol: 0.8, pitch: 1.4 });
        },
        pose: [{ who: 'krillin', pose: 'hitAirSpin', face: 'shock', speed: 1 }],
        tick: (ctx, t) => {
          const k = ctx.cast.krillin;
          const p = ctx.liftFrom.clone();
          p.y += Math.min(7, t * 3.2);
          k.setPosition(p);
          k.grounded = false;
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.sparks(k.chest(), 0xff8ab0, 4, 6, 0.1);
          orb(ctx);
        },
        cam: { from: { at: 'krillin', off: [3.4, -1.6, 5.4] }, look: { at: 'krillin', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'krillin', line: 'Wh-what — I can\'t move! Let me go!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      // the two of them in one frame: Goku on the ground, Krillin up there, the distance between them
      {
        tick: (ctx) => {
          const k = ctx.cast.krillin;
          const p = ctx.liftFrom.clone();
          p.y += 7 + Math.sin(ctx.b.frame * 0.3) * 0.08;
          k.setPosition(p);
          orb(ctx);
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        // CS-S01 (research draft): low behind him, his shape in front, pushing slowly in toward Krillin held up there
        cam: { from: { at: 'goku', local: [0.9, 0.2, -4.5] }, to: { at: 'goku', local: [0.8, 0.18, -3.7] }, look: { at: 'krillin', off: [0, -4.2, 0] }, fov: 64, raw: true },
        say: { who: 'krillin', line: 'Goku! GOKU, HELP ME!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      // he starts forward — and he is nowhere near close enough
      {
        tick: (ctx) => {
          const k = ctx.cast.krillin;
          const p = ctx.liftFrom.clone();
          p.y += 7 + Math.sin(ctx.b.frame * 0.3) * 0.08;
          k.setPosition(p);
          orb(ctx);
        },
        pose: [{ who: 'goku', pose: 'run', face: 'shock' }],
        move: { who: 'goku', at: 'goku', local: [0, 0, 1.6], seconds: 1.0, ease: 'in', partial: true },
        cam: { from: { at: 'goku', local: [1.2, 0.2, 2.4] }, look: { at: 'krillin', off: [0, -1.5, 0] }, fov: 46 },
        say: { who: 'goku', line: 'KRILLIN! Frieza, stop — STOP!', duration: 2, style: 'shout' },
      },
      // the hand closes
      {
        tick: (ctx) => orb(ctx),
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'smirk', speed: 4 }],
        cam: { from: { at: 'frieza', local: [0.85, 0.6, 1.7] }, to: { at: 'frieza', local: [0.7, 0.55, 1.4] }, look: { at: 'frieza:head' }, fov: 36, fov2: 32 },
        say: { who: 'frieza', line: 'Watch closely.', duration: 1.4, style: 'quiet' },
        hold: 1.4,
      },
      // from where Goku stands: the flash in the sky — then his face, and the sound gone
      {
        call: (ctx) => {
          const k = ctx.cast.krillin;
          const b = ctx.b;
          b.vfx.explosion(k.chest(), 5, 0xffd0e0, { smoke: true });
          b.vfx.ring(k.chest(), 9, 0xffe0ea, 0.6);
        },
        hide: 'krillin',
        music: { song: null, level: 0 },
        screen: { flash: 0.85, color: '#ffe8f0' },
        sfx: { name: 'explosionBig', vol: 0.6, pitch: 1.2 },
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 12 }],
        cam: { from: { at: 'goku:head', local: [0.2, 0.05, -0.6] }, look: { at: 'krillin' }, fov: 50, raw: true },
        hold: 0.5,
      },
      {
        sfx: { name: 'tinnitus', vol: 0.5 },
        cam: { from: { at: 'goku:head', local: [0.45, -0.1, 1.2] }, to: { at: 'goku:head', local: [0.32, -0.08, 0.9] }, look: { at: 'goku:head' }, fov: 36, fov2: 30 },
        hold: 2.8,
      },
      // the sky where he was
      {
        vfx: { kind: 'dust', at: { at: 'krillin' }, radius: 2, count: 8 },
        cam: { from: { at: 'goku', off: [3.6, 1.4, 5] }, to: { at: 'goku', off: [4.2, 2, 5.8] }, look: { at: 'krillin', off: [0, -1.5, 0] }, fov: 48, fov2: 52 },
        hold: 3,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [-0.7, 0.9, 1.6] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'kid_gohan', line: 'KRILLIN!', duration: 2.2, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const k = c.krillin;
      if (k) {
        k.hp = 0;
        k.alive = false;
        k.untargetable = true;
        k.setHidden(true);
      }
      if (c.goku) c.goku.setState('scripted', { pose: 'idle', expression: 'shock' });
      m.flags.krillinTaken = true;
    },
    clearMood: false,
  };

  S.goku_super_saiyan = {
    id: 'goku_super_saiyan',
    cast,
    music: { song: null, level: 0 },
    events: [
      // 1. stillness. No music, no wind. His head goes down.
      {
        call: (ctx) => ctx.cast.goku.model.setRage && ctx.cast.goku.model.setRage(true, 0.25),
        pose: [{ who: 'goku', pose: 'g_lookDown', face: 'hurt', speed: 1 }],
        mood: { amount: 0.5, color: 0x1a1426, seconds: 2 },
        cam: { from: { at: 'goku', local: [1.4, 0.4, 3.6] }, to: { at: 'goku', local: [0.9, 0.3, 2.4] }, look: { at: 'goku' }, fov: 42, fov2: 34, ease: 'inOut' },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'frieza', local: [1.1, 0.3, 2.6] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 38 },
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        say: { who: 'frieza', line: 'There. One less weakling for you to worry about.', duration: 3.6 },
        hold: 3.8,
      },
      // 2. close on the hands: the fists closing, and the first tremor under them
      {
        call: (ctx) => {
          fist(ctx);
          ctx.cast.goku.model.setRage && ctx.cast.goku.model.setRage(true, 0.45);
        },
        tick: (ctx) => fist(ctx),
        pose: [{ who: 'goku', pose: 'g_ssjClench', face: 'grit', speed: 1.5 }],
        sfx: { name: 'heartbeat', vol: 0.9 },
        shake: { at: { at: 'goku' }, amount: 0.12 },
        // CS-S03 (research draft): in profile, close; from the clenched fist the lens tilts slowly up to his shadowed face
        cam: { from: { at: 'goku', local: [1.25, -0.3, 0.3] }, to: { at: 'goku', local: [1.05, -0.1, 0.25] }, look: { at: 'fist' }, look2: { at: 'goku:head' }, fov: 34, fov2: 31, ease: 'inOut', raw: true },
        hold: 2.4,
      },
      // 3. his face, head still down: almost a whisper
      {
        call: (ctx) => {
          ctx.cast.goku.model.setRage && ctx.cast.goku.model.setRage(true, 0.6);
          ctx.m.flags.fistTilt = true;
        },
        cam: { from: { at: 'goku:head', local: [0.4, -0.12, 1.15] }, to: { at: 'goku:head', local: [0.28, -0.1, 0.85] }, look: { at: 'goku:head' }, fov: 36, fov2: 30 },
        say: { who: 'goku', line: 'I tried to end this without letting it take anything else from us.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      // 4. from low, as the first of it rises: the ground cracking, small stones lifting round his boots
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (ctx.b.stage.crater) ctx.b.stage.crater(g.pos, 3.2, 0.3);
          ctx.b.sfx('rumble', g, { vol: 0.8 });
        },
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 10, radius: 2.4, lift: 2.6 },
        shake: { at: { at: 'goku' }, amount: 0.25 },
        pose: [{ who: 'goku', pose: 'g_ssjClench', face: 'grit', aura: 0.25 }],
        cam: { from: { at: 'goku', local: [1.2, -0.9, 3.4] }, to: { at: 'goku', local: [1.0, -0.95, 3.0] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 50, fov2: 48 },
        hold: 2.6,
      },
      // 5. the dust driven out from him, the sky going dark, lightning out on the plains
      {
        call: (ctx) => {
          ctx.b.stage.setMood(0.7, 0x0a0a14, 1.2);
          strike(ctx.b, ctx.cast.goku.pos, 30, 60);
        },
        tick: (ctx, t) => {
          const b = ctx.b, g = ctx.cast.goku;
          if (b.frame % 40 === 0) strike(b, g.pos, 18, 55);
          if (b.frame % 8 === 0) b.vfx.dust(g.pos.clone().add(new V3(U.rand(-8, 8), 0, U.rand(-8, 8))), 3, 4);
          b.camera.addTrauma(0.006 + t * 0.004);
        },
        sfx: { name: 'rumble', vol: 1 },
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 16, radius: 8, lift: 10 },
        // wide enough to read the sky going over, close enough that he is still a man in it
        cam: { from: { at: 'goku', off: [0, 5, 10] }, to: { at: 'goku', off: [0, 7.5, 14] }, look: { at: 'goku', off: [0, 2.6, 0] }, fov: 54, fov2: 60, ease: 'out' },
        hold: 3.4,
      },
      {
        tick: (ctx) => {
          if (ctx.b.frame % 50 === 0) strike(ctx.b, ctx.cast.frieza.pos, 16, 40);
        },
        pose: [{ who: 'frieza', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.15] }, look: { at: 'frieza:head' }, fov: 38 },
        say: { who: 'frieza', line: 'What is this?! His power keeps rising... That\'s impossible!', duration: 3.6 },
        hold: 3.4,
      },
      // 6. the change — handed to the engine's transformation sequence; wide, as the aura expands
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (g.model.setRage) g.model.setRage(true, 1);
          const idx = g.def.forms.findIndex((f) => f.id === 'ssj');
          if (idx > 0) {
            ctx.m.teach(g, 'form:ssj');
            if (g.lockedForms) delete g.lockedForms.ssj;
            // noShots: this scene shoots the change (the orbit, the burst, the eyes); the engine's own shots cut in
            // over it — its face close-up 14 frames after the burst put the lens in the flash (CS-S04)
            g.setState('transform', { form: g.def.forms[idx], index: idx, boss: true, noShots: true });
          }
        },
        // his line here is the form's own (goku_ssj), spoken by the engine as the change starts
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 18, radius: 7, lift: 16 },
        cam: { orbit: { at: 'goku', from: Math.PI, to: Math.PI * 2.4, radius: 4.6, radius2: 3, y: -0.2, y2: 0.9 }, look: { at: 'goku', off: [0, 0.4, 0] }, from: { at: 'goku', off: [0, 0.4, 4.6] }, fov: 44, fov2: 38 },
        tick: (ctx) => {
          // the engine's orbit (the shot this beat has always shown; with noShots it is started here, as the engine did
          // on the sequence's first frame; the orbit above alone swings behind him) — cut in, as the scene's shots
          // are: its 0.3 s blend-in swooped from Frieza's close-up 10 m away
          if (!ctx.changeOrbit && !ctx.b.skipRequested) {
            ctx.changeOrbit = true;
            const g = ctx.cast.goku, form = g.def.forms.find((f) => f.id === 'ssj');
            ctx.b.transformShot(g, form.sequence.length / 60);
            if (ctx.b.camera.shot) ctx.b.camera.shot.blendIn = 0;
          }
          if (ctx.b.frame % 18 === 0) strike(ctx.b, ctx.cast.goku.pos, 6, 22);
        },
        // the engine's burst lands at frame 100 of the sequence: the next beat meets it
        hold: 1.65,
      },
      // the burst: gold, pulled back so the whole shape of it is seen — never a white screen
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          const b = ctx.b;
          if (g.model.setRage) g.model.setRage(false);
          b.vfx.ring(g.pos.clone().add(new V3(0, 0.5, 0)), 24, 0xffe066, 1, new V3(0, 1, 0));
          b.vfx.skyBolt(g.pos.clone(), 40, 0xfff6c0);
          // CS-S04 / B-SSJ-03 (research draft): the colossal pillar of white-gold light erupting from beneath him,
          // tearing up through the dark sky; it takes him in and recedes into the aura. It replaces the explosion
          // sphere that was here (6 m round his chest: it reached the lens and the frame went white)
          if (SL.data.vegitoKit && !b.skipRequested) SL.data.vegitoKit.pillar(ctx.m, g.pos.clone(), { height: 240, radius: 1, seconds: 2.4 });
          ctx.m.flags.ssjPillar = true;
        },
        screen: { flash: 0.5, color: '#fff8d0' },
        sfx: { name: 'explosionHuge', who: 'goku', vol: 1.3, pitch: 0.7 },
        // the silence ends with the gold: rising brass and timpani (soundtrack PDF p.96–97, Goku's Super Saiyan
        // awakening: an original stand-in)
        music: { song: 'ssj_awakening', level: 4 },
        shake: { at: { at: 'goku' }, amount: 1 },
        slow: { scale: 0.4, seconds: 1 },
        // from low, pulling hard back as the shake runs, the lens lifting with the column (CS-S04); off to his side,
        // so the pull-back never passes Frieza (11-12 m in front of him)
        cam: { from: { at: 'goku', local: [1.5, -0.4, 6.5] }, to: { at: 'goku', local: [3.5, 0.3, 12] }, look: { at: 'goku', off: [0, 1, 0] }, look2: { at: 'goku', off: [0, 5.5, 0] }, fov: 48, fov2: 58, ease: 'out' },
        hold: 2.8,
      },
      // 7. his eyes — shut for a beat, then snapping open on the teal (CS-S05, research draft)
      {
        call: (ctx) => ctx.b.stage.setMood(0.42, 0x1c1a2a, 1.6),
        pose: [{ who: 'goku', pose: 'g_ssjReveal', face: 'closed', speed: 2, aura: 0.45 }],
        music: { song: 'ssj_awakening', level: 4 },
        // frame: false — an extreme close-up of the eyes crops the hair on purpose; the framing pass fits the whole
        // head into a face shot and stood this one back to 1 m (the lens is still kept unblocked)
        cam: { from: { at: 'goku:head', local: [0.08, 0.02, 0.62] }, to: { at: 'goku:head', local: [0.06, 0.02, 0.5] }, look: { at: 'goku:face' }, fov: 30, fov2: 26, frame: false },
        hold: 0.4,
      },
      {
        call: (ctx) => {
          ctx.m.flags.eyesSnap = true;
          ctx.b.sfx('ssjRise', ctx.cast.goku, { vol: 0.5, pitch: 1.4 });
        },
        pose: [{ who: 'goku', pose: 'g_ssjReveal', face: 'cold', speed: 2, aura: 0.45 }],
        hold: 1.4,
      },
      // 8. the hero shot: from low, the whole of him, the storm behind
      {
        tick: (ctx) => {
          if (ctx.b.frame % 70 === 0) strike(ctx.b, ctx.cast.goku.pos, 30, 70);
        },
        pose: [{ who: 'goku', pose: 'g_ssjReveal', face: 'cold', aura: 0.6 }],
        cam: { from: { at: 'goku', local: [1.3, -0.9, 4.6] }, to: { at: 'goku', local: [1.0, -0.9, 5.0] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 46, fov2: 47 },
        hold: 3.2,
      },
      // 9. the others. Gohan: amazement, and grief under it
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'shock' }],
        cam: { subject: 'gohan', focus: 'closeup', angle: 'front' },
        say: { who: 'kid_gohan', line: 'Dad...? Your hair... your eyes...', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // Piccolo, still down: serious, and then not quite
      {
        pose: [{ who: 'piccolo', pose: 'p_kneelLook', face: 'serious', speed: 2 }],
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: 'That power... So this is the legend Vegeta kept talking about.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // Frieza: the fury goes out of him, a step back he does not choose
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          ctx.stepFrom = fz.pos.clone();
          ctx.stepTo = fz.pos.clone().addScaledVector(fz.forward, -1.2);
          ctx.stepTo.y = ctx.b.stage.heightAt(ctx.stepTo.x, ctx.stepTo.z);
        },
        tick: (ctx, t) => ctx.cast.frieza.setPosition(ctx.stepFrom.clone().lerp(ctx.stepTo, U.clamp01(t / 0.8))),
        pose: [{ who: 'frieza', pose: 'fz_block', face: 'shock' }],
        cam: { from: { at: 'frieza', local: [1, 0.3, 2.4] }, to: { at: 'frieza', local: [0.7, 0.25, 1.8] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 38, fov2: 32 },
        say: { who: 'frieza', line: 'Golden hair... green eyes... The Super Saiyan? No — that\'s just a legend!', duration: 4 },
        hold: 4.2,
      },
      // only now, the last clear thing he asks of anyone, and it is of his son
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'cold', aura: 0.45 },
          { who: 'gohan', pose: 'idle', face: 'shock' },
        ],
        cam: { from: { at: 'goku', local: [-1.1, 0.5, 2.2] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'goku', line: 'Gohan. Take Piccolo and get off this planet with Bulma — before it is too late.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [-0.7, 0.9, 1.6] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'kid_gohan', line: 'Dad — what about you?!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'goku:head', local: [0.34, -0.05, 1] }, to: { at: 'goku:head', local: [0.26, -0.04, 0.8] }, look: { at: 'goku:head' }, fov: 34, fov2: 30 },
        say: { who: 'goku', line: 'GO! Now — while I can still ask you nicely!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const { gohan, piccolo } = ctx.cast;
          const b = ctx.b;
          for (const fr of [gohan, piccolo]) {
            if (!fr) continue;
            b.vfx.trail(fr.chest(), 0xfff0c0, 0.6, 0.4);
            b.vfx.dust(fr.pos, 2, 8);
            fr.setHidden(true);
          }
          b.sfx('dash', gohan, { vol: 1 });
        },
        cam: { from: { at: 'goku', off: [4, 2, 6] }, look: { at: 'gohan', off: [0, 2, 0] }, fov: 48 },
        hold: 1.6,
      },
      // back to the two of them: Goku facing Frieza, and the fear turning into something Frieza can use
      {
        call: (ctx) => {
          turn(ctx, 'goku', 'frieza');
          turn(ctx, 'frieza', 'goku');
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'cold', aura: 0.45 }],
        cam: { subject: 'frieza', focus: 'full', angle: 'ots', over: 'goku' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry', speed: 4 }],
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          b.vfx.ring(fz.pos.clone().add(new V3(0, 0.3, 0)), 8, 0xc060ff, 0.5, new V3(0, 1, 0));
          b.sfx('kiUp', fz, { vol: 1, pitch: 0.8 });
        },
        cam: { from: { at: 'frieza', local: [0.9, 0.45, 2.1] }, to: { at: 'frieza', local: [0.7, 0.4, 1.7] }, look: { at: 'frieza:head' }, fov: 38, fov2: 32 },
        say: { who: 'frieza', line: 'Legend or not, I\'ll send you to join the rest of your miserable race!', duration: 4.4, style: 'shout' },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const { m, cast: c, b } = ctx;
      const g = c.goku;
      if (g) {
        if (g.model.setRage) g.model.setRage(false);
        const idx = g.def.forms.findIndex((f) => f.id === 'ssj');
        if (idx > 0) {
          m.teach(g, 'form:ssj');
          if (g.lockedForms) delete g.lockedForms.ssj;
          if (g.formIndex !== idx) g.applyForm(idx);
        }
        g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.7));
        g.ki = Math.max(g.ki, 90);
        g.setState('free');
        g.target = c.frieza;
      }
      for (const f of [c.gohan, c.piccolo]) {
        if (!f) continue;
        f.setHidden(true);
        f.untargetable = true;
      }
      if (c.frieza) {
        c.frieza.setState('free');
        c.frieza.target = g;
      }
      // the storm stays for the rest of the fight
      b.stage.setMood(0.42, 0x1c1a2a, 0.4);
      m.flags.superSaiyan = true;
      m.flags.gohanSentAway = true;
    },
    clearMood: false,
  };

  S.ssj_first_exchange = {
    id: 'ssj_first_exchange',
    cast,
    events: [
      // he stands up straight and lets Frieza come
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'cold', aura: 0.45 },
          { who: 'frieza', pose: 'fz_brace', face: 'angry' },
        ],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side' },
        hold: 0.8,
      },
      // CS-S07 (research draft): side-on, the lens panning with Frieza as he comes in — the owner's choreography (the
      // weave and the body blow) kept; the draft's lazy backhand deflection is not taken
      {
        call: (ctx) => (ctx.m.flags.rushPan = true),
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', local: [0, 0, 1.5] }, height: 0.3, seconds: 0.32, pose: 'fz_lunge', endPose: 'fz_jab', face: 'goku' },
        sfx: { name: 'dash', who: 'frieza', vol: 1 },
        cam: { from: { at: 'goku', local: [4.2, 0.4, 2.2] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 46 },
        hold: 0.02,
      },
      // the last moment: a turn of the shoulders, and the blow goes past his face
      {
        pose: [
          { who: 'frieza', pose: 'fz_jab', face: 'angry', speed: 24 },
          { who: 'goku', pose: 'gg_weaveL', face: 'cold', speed: 26, aura: 0.45 },
        ],
        sfx: { name: 'swing', who: 'frieza', vol: 1 },
        slow: { scale: 0.45, seconds: 0.35 },
        hold: 0.3,
      },
      // one short punch to the body; Frieza driven back, the camera going with him
      {
        call: (ctx) => contact(ctx, 'goku', 'frieza', true),
        pose: [
          { who: 'goku', pose: 'g_jab', face: 'cold', speed: 26, aura: 0.6 },
          { who: 'frieza', pose: 'hitBody', face: 'shock', speed: 20 },
        ],
        space: { who: 'frieza', mode: 'slide', distance: 4.2, seconds: 0.5, endPose: 'stagger', expr: 'shock' },
        cam: { subject: 'frieza', focus: 'full', angle: 'side', side: -1 },
        hold: 0.3,
      },
      // and back to Goku, who has not moved from where he stood
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'cold', speed: 4, aura: 0.45 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        hold: 1.3,
      },
      // Frieza gets his balance back and comes again: a string — blocked, slipped, and the third answered
      {
        call: (ctx) => turn(ctx, 'frieza', 'goku'),
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', local: [0, 0, 1.5] }, height: 0.25, seconds: 0.2, pose: 'fz_jabW', endPose: 'fz_jab', face: 'goku' },
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side', side: 1 },
        hold: 0.02,
      },
      {
        call: (ctx) => blocked(ctx, 'frieza', 'goku'),
        pose: [{ who: 'goku', pose: 'guardHit', face: 'cold', speed: 22 }],
        hold: 0.24,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_kickW', face: 'angry', speed: 20 }],
        hold: 0.1,
      },
      {
        pose: [
          { who: 'frieza', pose: 'fz_kick', face: 'angry', speed: 24 },
          { who: 'goku', pose: 'gg_weaveR', face: 'cold', speed: 24 },
        ],
        sfx: { name: 'swing', who: 'frieza', vol: 0.9 },
        hold: 0.24,
      },
      {
        pose: [
          { who: 'frieza', pose: 'fz_tailW', face: 'angry', speed: 20 },
          { who: 'goku', pose: 'g_crossW', face: 'cold', speed: 22 },
        ],
        hold: 0.1,
      },
      {
        call: (ctx) => contact(ctx, 'goku', 'frieza', true),
        pose: [
          { who: 'goku', pose: 'g_cross', face: 'cold', speed: 26, aura: 0.6 },
          { who: 'frieza', pose: 'hitHeavy', face: 'shock', speed: 20 },
        ],
        space: { who: 'frieza', mode: 'slide', distance: 2.6, seconds: 0.35, endPose: 'stagger', expr: 'shock' },
        hold: 0.6,
      },
      // the look: he cannot believe it
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'shock', speed: 4 }],
        cam: { subject: 'frieza', focus: 'closeup', angle: 'front' },
        say: { who: 'frieza', line: 'How... how is he this fast?', duration: 2, style: 'quiet' },
        hold: 2.1,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      for (const f of [c.goku, c.frieza]) {
        if (!f) continue;
        f.storySpace = null;
        f.storyMode = null;
        f.setState('free');
      }
      m.flags.ssjFirstExchange = true;
    },
    clearMood: false,
  };

  S.ssj_sky_exchange = {
    id: 'ssj_sky_exchange',
    cast,
    events: [
      // on the field, apart: Frieza goes up
      {
        pose: [
          { who: 'frieza', pose: 'fz_brace', face: 'angry' },
          { who: 'goku', pose: 'idle', face: 'cold', aura: 0.45 },
        ],
        call: (ctx) => {
          const at = (z) => {
            const p = ctx.cast.field.pos.clone().add(new V3(0, 0, z));
            p.y = ctx.b.stage.heightAt(p.x, p.z);
            return p;
          };
          SL.Staging.place(ctx.cast.goku, at(5));
          SL.Staging.place(ctx.cast.frieza, at(-3));
          turn(ctx, 'goku', 'frieza');
          turn(ctx, 'frieza', 'goku');
        },
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side' },
        hold: 0.5,
      },
      {
        space: { who: 'frieza', mode: 'flight', to: { at: 'field', off: [0, 0, -3] }, height: 9, seconds: 0.55, pose: 'flyUp', endPose: 'flyIdle' },
        cam: { from: { at: 'goku', local: [0.8, -0.6, -1.4] }, look: { at: 'frieza' }, fov: 50 },
        sfx: { name: 'dash', who: 'frieza', vol: 1 },
        hold: 0.1,
      },
      // Goku after him; the camera pulls back until both are against the sky, Namek far below
      {
        space: { who: 'goku', mode: 'flight', to: { at: 'field', off: [0, 0, 2] }, height: 6.5, seconds: 0.55, pose: 'flyUp', endPose: 'flyIdle' },
        cam: { from: { at: 'field', off: [10, 1.4, 8] }, to: { at: 'field', off: [12.5, 1.8, 9.5] }, look: { at: 'field', off: [0, 8.2, -0.5] }, fov: 52, fov2: 56 },
        sfx: { name: 'dash', who: 'goku', vol: 1 },
        hold: 0.5,
      },
      // from above, sharply: the attack comes down at him
      {
        call: (ctx) => turn(ctx, 'frieza', 'goku'),
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', off: [0, 1.3, -1.1] }, seconds: 0.18, pose: 'fz_stompW', endPose: 'fz_stomp' },
        pose: [{ who: 'goku', pose: 'guard', face: 'cold', aura: 0.5 }],
        hold: 0.02,
      },
      // intercepted: arm on arm, the shock of it rolling out — the camera going round enough to see it
      {
        call: (ctx) => {
          const g = ctx.cast.goku, fz = ctx.cast.frieza;
          const p = g.chest().lerp(fz.chest(), 0.5);
          ctx.b.vfx.ring(p, 7, 0xfff0c0, 0.5);
          ctx.b.vfx.flash(p, 3, 0xffffff, 0.25, SL.Toon.tex.glow);
          ctx.b.sfx('punchHeavy', g, { vol: 1.3, pitch: 0.75 });
          ctx.b.cameraTraumaAt(p, 0.6);
        },
        pose: [{ who: 'goku', pose: 'g_cross', face: 'cold', speed: 24, aura: 0.6 }],
        cam: { orbit: { at: 'goku', from: 0.6, to: 1.3, radius: 5, radius2: 5.4, y: 0.6, y2: 0.9 }, look: { at: 'goku', off: [0, 0.6, -0.5] }, from: { at: 'goku', off: [0, 0.6, 5] }, fov: 46 },
        hold: 0.35,
      },
      // the counter, and the two of them flung apart
      {
        call: (ctx) => contact(ctx, 'goku', 'frieza', true),
        pose: [
          { who: 'goku', pose: 'g_flyingKnee', face: 'cold', speed: 24 },
          { who: 'frieza', pose: 'hitAirSpin', face: 'shock', speed: 20 },
        ],
        space: [
          { who: 'frieza', mode: 'airImpact', dir: [0.2, 0.25, -1], distance: 7, seconds: 0.4 },
          { who: 'goku', mode: 'airImpact', dir: [0, -0.1, 1], distance: 2.5, seconds: 0.4, color: 0xfff0c0, shake: 0.2 },
        ],
        hold: 0.1,
      },
      // the pause: apart, at different heights, the scale of it — the plain far below
      {
        pose: [
          { who: 'goku', pose: 'flyIdle', face: 'cold', aura: 0.5 },
          { who: 'frieza', pose: 'flyIdle', face: 'angry' },
        ],
        call: (ctx) => {
          turn(ctx, 'goku', 'frieza');
          turn(ctx, 'frieza', 'goku');
        },
        cam: { from: { at: 'field', off: [18, 3.4, 5] }, to: { at: 'field', off: [19.5, 3.8, 5.5] }, look: { at: 'field', off: [0, 7, -1] }, fov: 46 },
        hold: 1.8,
      },
      // back down: Frieza heavily, Goku several metres off; the camera with them at ground level
      {
        space: [
          { who: 'frieza', mode: 'landing', to: { at: 'field', off: [0, 0, -4] }, seconds: 0.55, endPose: 'fz_brace', expr: 'angry' },
          { who: 'goku', mode: 'landing', to: { at: 'field', off: [0, 0, 4.5] }, seconds: 0.8, endPose: 'idle', expr: 'cold' },
        ],
        cam: { from: { at: 'field', off: [10, 1.2, 0.5] }, look: { at: 'field', off: [0, 1.1, 0.3] }, fov: 48 },
        hold: 0.1,
      },
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          if (ctx.b.stage.crater) ctx.b.stage.crater(fz.pos, 2.2, 0.12);
          ctx.b.vfx.dust(fz.pos, 2.4, 16);
          ctx.b.sfx('groundImpact', fz, { vol: 1 });
          turn(ctx, 'goku', 'frieza');
          turn(ctx, 'frieza', 'goku');
        },
        shake: { at: 'frieza', amount: 0.4 },
        hold: 1.2,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      for (const f of [c.goku, c.frieza]) {
        if (!f) continue;
        f.storySpace = null;
        f.storyMode = null;
        if (f.pos.y - ctx.b.stage.heightAt(f.pos.x, f.pos.z) > 0.6) SL.Staging.set(m, f, 'ground', {});
        f.setState('free');
      }
      m.flags.ssjSkyExchange = true;
    },
    clearMood: false,
  };

  S.goku_legend = {
    id: 'goku_legend',
    cast,
    events: [
      // THE BRUSH-OFF (2026-10-17, the owner's PDF): Frieza empties his finger at him and Goku walks through it — the
      // shots burst on his chest and do nothing — then the big one, swatted away with the back of a hand without a
      // look; it goes off far out on the plain. Staged, no damage: the fight around it keeps its challenge
      {
        pose: [
          { who: 'frieza', pose: 'fz_finger', face: 'angry' },
          { who: 'goku', pose: 'idle', face: 'calm' },
        ],
        cam: { from: { at: 'goku', local: [0.7, 0.25, 3.4] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 44 },
        say: { who: 'frieza', line: 'Stay down! Why won\'t you stay DOWN?!', duration: 2.4, style: 'shout' },
        tick: (ctx, s) => {
          const g = ctx.cast.goku, f = ctx.cast.frieza;
          if (!g || !f) return;
          const to = f.pos.clone().sub(g.pos).setY(0);
          if (to.length() > 4) g.pos.addScaledVector(to.normalize(), 0.025);
          const n = Math.round(s * 60);
          if (n % 14 === 0) {
            const c = g.chest().add(new V3((Math.random() - 0.5) * 0.4, (Math.random() - 0.3) * 0.5, 0));
            ctx.b.vfx.slash(f.handPos('R'), c, 0xc86aff, 0.12, 0.06);
            ctx.b.vfx.explosion(c, 0.45, 0xc86aff, { smoke: false });
            ctx.b.sfx('explosionSmall', g, { vol: 0.55 });
          }
        },
        hold: 2.6,
      },
      {
        pose: [
          { who: 'frieza', pose: 'fz_ball', face: 'angry' },
          { who: 'goku', pose: 'g_brushOff', face: 'calm' },
        ],
        cam: { from: { at: 'goku', local: [1.6, 0.4, 3.6] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 46 },
        tick: (ctx, s) => {
          const g = ctx.cast.goku;
          if (!g || Math.round(s * 60) !== 20) return;
          const hand = g.handPos('R'), side = new V3(-g.forward.z, 0, g.forward.x);
          const far = g.pos.clone().addScaledVector(side, 22).addScaledVector(g.forward, 6);
          if (ctx.b.stage.hasGround) far.y = ctx.b.stage.heightAt(far.x, far.z);
          ctx.b.vfx.flash(hand, 1.2, 0xc86aff, 0.12, SL.Toon.tex.glow);
          ctx.b.vfx.slash(hand, far, 0xc86aff, 0.35, 0.18);
          ctx.b.sfx('punchHeavy', g, { vol: 0.8 });
          ctx.b.vfx.explosion(far, 3.2, 0xc86aff, { smoke: true });
          ctx.b.sfx('explosionBig', null, { at: far, vol: 0.8 });
          ctx.b.cameraTraumaAt(far, 0.3);
        },
        hold: 1.8,
      },
      // he is still talking about the man he killed, and Goku says it out loud for the first time
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'smirk' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'frieza', local: [1.1, 0.4, 2.6] }, look: { at: 'frieza:head' }, fov: 38 },
        say: { who: 'frieza', line: 'This can\'t be happening... The Super Saiyan is a myth. A fairy tale!', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'goku:head', local: [0.4, -0.05, 1.15] }, to: { at: 'goku:head', local: [0.3, -0.04, 0.9] }, look: { at: 'goku:head' }, fov: 36, fov2: 31 },
        say: { who: 'goku', line: 'You\'ve hurt too many people, Frieza. Whole planets. Whole races.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'goku', local: [0.9, 0.35, 2.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 38 },
        say: { who: 'goku', line: 'I won\'t let you hurt anyone else. Not ever again.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'hurt' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'frieza', local: [1.2, 0.3, 2.8] }, to: { at: 'frieza', local: [0.9, 0.25, 2.1] }, look: { at: 'frieza', off: [0, 0.2, 0] }, fov: 40, fov2: 34 },
        say: { who: 'frieza', line: 'I can\'t touch him... I can\'t even SEE him move! What ARE you?!', duration: 3.6 },
        hold: 3.8,
      },
      {
        tick: (ctx) => {
          if (ctx.b.frame % 60 === 0) strike(ctx.b, ctx.cast.goku.pos, 25, 60);
        },
        cam: { from: { at: 'goku:head', local: [0.42, -0.06, 1.2] }, to: { at: 'goku:head', local: [0.3, -0.05, 0.9] }, look: { at: 'goku:head' }, fov: 36, fov2: 30 },
        say: { who: 'goku', line: 'You wiped out my people because you were afraid of a legend, Frieza. Well — here it is.', duration: 5.2 },
        hold: 5.4,
      },
      {
        cam: { from: { at: 'goku', local: [0.9, 0.2, 2.6] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 36 },
        say: { who: 'goku', line: 'I\'m the Super Saiyan, Son Goku! And I\'m here for every one of them!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.1] }, look: { at: 'frieza:head' }, fov: 36 },
        say: { who: 'frieza', line: 'I am the emperor of the universe! I will NOT lose to some Saiyan monkey!', duration: 3.4, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      if (c.goku) c.goku.setState('free');
      if (c.frieza) c.frieza.setState('free');
      m.flags.legendNamed = true;
    },
    clearMood: false,
  };
})();
