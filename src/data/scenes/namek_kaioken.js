/*
 * SCENES — Goku against Frieza on Namek, the first stretch (mission namek_goku; Namek saga
 * cinematic brief, phases one to three).
 *
 *   goku_frieza_confrontation  wide and above, then closer: Frieza on his rock, Goku on the low
 *                              ground in his guard. Two short lines; Frieza leans forward and lifts
 *                              off the rock, which gives under him; Goku drops his weight.
 *   goku_tests_frieza          the first exchanges, staged before control is handed over: Goku
 *                              advances in bursts, the first punch passes, the second is blocked,
 *                              a short counter; then Frieza's string — blocked, slipped, dodged —
 *                              a change of direction and a clean hit that sends Goku sliding back on
 *                              his boots; low on the ground, he looks up at Frieza hovering.
 *   frieza_shows_the_gap       Frieza stops toying: the eyes narrow, a rush the camera only just
 *                              keeps, a blow from the front, then from the side, and Goku goes
 *                              through the rock pillar. He gets up. "I've been holding back."
 *                              Gohan and Krillin, each in their own way.
 *   goku_kaioken_escalation    the Kaioken (low angle on the burst), Frieza's surprise, and the first
 *                              Kaioken rush: a punch and a kick land, a burst behind him, and Frieza
 *                              turns and counters.
 *
 * Not every Kaioken is a cutscene: the player activates it in gameplay like any other form. The
 * form itself is applied by the engine (Fighter transform states), so the scene stages it and the
 * mission teaches the level; a skip lands on the same state: Kaioken unlocked, control returned.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, frieza: s.frieza, krillin: s.krillin, gohan: s.gohan, field: s.field, pillarHit: s.pillarHit, pillarFoot: s.pillarFoot };
  };
  /** A blow landing: the flash where it lands, the sound, and on a heavy one a jolt. */
  function contact(ctx, from, to, heavy, color) {
    const a = ctx.cast[from], d = ctx.cast[to];
    if (!a || !d) return;
    const p = a.chest().lerp(d.chest(), 0.6);
    ctx.b.vfx.impact(p, heavy ? 2.4 : 1.3, color === undefined ? 0xffffff : color);
    ctx.b.sfx(heavy ? 'punchHeavy' : 'punchLight', d, { vol: heavy ? 1.1 : 0.85 });
    if (heavy) ctx.b.cameraTraumaAt(p, 0.35);
  }
  /**
   * Roadmap Three, S-FRZ-03 (the owner's Gemini research — a research draft, not checked against the footage): close
   * beside Frieza's face at a Dutch angle (side ±1 picks the side and the tilt), shaking hard, cut in on a white flash
   * frame — the red blows landing in the first Kaioken rush.
   */
  function dutch(ctx, side) {
    const fz = ctx.cast.frieza, g = ctx.cast.goku;
    if (!fz || !g) return;
    ctx.m.flags.kaiokenDutch = (ctx.m.flags.kaiokenDutch || 0) + 1;
    SL.ScreenFX.flash(0.35, '#ffffff');
    ctx.b.camera.addTrauma(0.5);
    // 2.1 m to his side, aimed between his face and the striking fist (or Goku's body for the kick): both on the
    // tilted diagonal (closer, the fist was out of frame — he slides back off the blow)
    ctx.m.shot((t, out) => {
      const h = fz.headPos(), to = g.pos.clone().sub(fz.pos).setY(0).normalize(), sd = new V3(to.z, 0, -to.x).multiplyScalar(side);
      out.pos.copy(h).addScaledVector(sd, 2.1).addScaledVector(to, 0.5);
      out.look.copy(h).lerp(side > 0 && g.handPos ? g.handPos('R') : g.chest(), 0.45);
      out.fov = 48;
      out.roll = 0.3 * side;
    }, 999, { cut: true, blendIn: 0, hold: true });
  }
  /** A blow taken on the guard: a smaller, colder flash and the block sound. */
  function blocked(ctx, from, to) {
    const a = ctx.cast[from], d = ctx.cast[to];
    if (!a || !d) return;
    const p = a.chest().lerp(d.chest(), 0.62);
    ctx.b.vfx.impact(p, 1.1, 0xcfe6ff);
    ctx.b.sfx('block', d, { vol: 0.9 });
  }
  /** Gone from where he was: the after-image and the sound of it. */
  function vanish(ctx, who, color) {
    const f = ctx.cast[who];
    if (!f) return;
    ctx.b.vfx.trail(f.chest(), color === undefined ? 0xe8d8ff : color, 0.7, 0.3);
    ctx.b.sfx('vanish', f, { vol: 0.8 });
  }
  const turn = (ctx, who, to) => {
    const f = ctx.cast[who], t = ctx.cast[to];
    if (f && t) f.yaw = f.prevYaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
  };

  S.goku_frieza_confrontation = {
    id: 'goku_frieza_confrontation',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      // wide, and slightly above the field: the green sky over the top half, the two of them far apart
      {
        pose: [
          { who: 'goku', pose: 'guard', face: 'focused' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        cam: { from: { at: 'field', off: [19, 5.4, 13] }, to: { at: 'field', off: [14, 4.2, 9.5] }, look: { at: 'field', off: [0, 3.4, 0] }, fov: 52, fov2: 48, ease: 'inOut', subject: 'goku', focus: 'wide' },
        hold: 4.6,
      },
      // the emperor on his rock, looking down at him past his shoulder
      {
        cam: { subject: 'frieza', focus: 'medium', angle: 'ots', over: 'goku' },
        say: { who: 'frieza', line: 'Burying a dead monkey? How touching. Are you quite finished?', duration: 3.2 },
        hold: 3.4,
      },
      // S-FRZ-01 (Roadmap Three, the owner's Gemini research — a research draft, not checked against the footage): eye
      // level, in profile, close on Goku's face: calm, unblinking; his eyes, low and turned aside, come round to meet Frieza's
      {
        call: (ctx) => {
          turn(ctx, 'goku', 'frieza');
          ctx.m.flags.calmEyes = true;
          // unblinking: the next blink is put off past the shot
          const md = ctx.cast.goku.model;
          md.blinkTimer = Math.max(md.blinkTimer || 0, 1.8);
          md.blinkT = 0;
        },
        tick: (ctx, t) => {
          const md = ctx.cast.goku.model;
          if (!md.setGaze) return;
          // held low and toward the lens side (the face's -x, where the lens is) for half a second, then round to
          // straight ahead — on Frieza — in 0.3 s
          const k = Math.min(1, Math.max(0, (t - 0.5) / 0.3)), e = k * k * (3 - 2 * k);
          md.setGaze(-(1 - e), -(1 - e));
          if (e >= 1) ctx.m.flags.eyesMeet = true;
        },
        pose: [{ who: 'goku', pose: 'g_resolve', face: 'focused', speed: 6 }],
        // the face's own frame (the eye stays in shot as he moves): close enough for the eye to read, a little ahead
        // of square so the lens sees the eye's outer face; the semantic close-up left the eye a few pixels wide
        cam: { from: { at: 'goku:face', local: [-0.55, 0, 0.18] }, look: { at: 'goku:face' }, fov: 30, frame: false },
        hold: 1.6,
      },
      {
        pose: [{ who: 'goku', pose: 'g_resolve', face: 'serious', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'You\'ve hurt enough people. I\'m not letting you do this again.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'cocky' }],
        cam: { subject: 'frieza', focus: 'closeup', angle: 'three' },
        say: { who: 'frieza', line: 'You still believe this battle is something you can control.', duration: 3.4 },
        hold: 3.6,
      },
      // he leans into it and lifts off the rock — which gives under him; Goku drops his weight
      {
        call: (ctx) => {
          const p = ctx.b.story.rocks && ctx.b.story.rocks.perch;
          if (p && p.alive) ctx.b.stage.destroyPillar(p);
        },
        space: { who: 'frieza', mode: 'flight', to: { at: 'field', off: [0, 0, -3] }, height: 0.9, seconds: 1.4, pose: 'flyIdle', endPose: 'idle', face: 'goku' },
        pose: [{ who: 'goku', pose: 'g_turtleStance', face: 'focused', speed: 3 }],
        // side on and far enough back for both of them, nine metres apart
        cam: { from: { at: 'field', off: [13, 2, 1.5] }, look: { at: 'field', off: [0, 1.4, 1.5] }, fov: 46 },
        hold: 1.4,
      },
    ],
    end(ctx) {
      const { b, m, cast: c } = ctx;
      const p = b.story.rocks && b.story.rocks.perch;
      if (p && p.alive) b.stage.destroyPillar(p, { quiet: true });
      if (c.goku) c.goku.setState('scripted', { pose: 'guard', expression: 'focused' });
      // a skip in the middle of S-FRZ-01 leaves the eyes where they were
      if (c.goku && c.goku.model.setGaze) c.goku.model.setGaze(0, 0);
      m.flags.confrontation = true;
    },
  };

  S.goku_tests_frieza = {
    id: 'goku_tests_frieza',
    cast,
    music: { song: 'battle', level: 3 },
    events: [
      // EXCHANGE A — Goku advances in short bursts; Frieza hovers a hand's breadth off the ground
      {
        space: { who: 'frieza', mode: 'air', height: 0.45, face: 'goku', pose: 'idle' },
        pose: [{ who: 'goku', pose: 'guard', face: 'focused' }],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'three' },
        hold: 0.5,
      },
      {
        pose: [{ who: 'goku', pose: 'g_sprintLow', face: 'focused' }],
        space: { who: 'goku', mode: 'slide', dir: [0, 0, -1], distance: 2.4, seconds: 0.22, face: 'frieza' },
        sfx: { name: 'dash', who: 'goku', vol: 0.8 },
        hold: 0.14,
      },
      {
        space: { who: 'goku', mode: 'slide', dir: [0, 0, -1], distance: 3.6, seconds: 0.22, face: 'frieza', pose: 'g_jabW' },
        sfx: { name: 'dash', who: 'goku', vol: 0.8 },
        hold: 0.06,
      },
      // the first punch, at the upper body — and he simply is not there: a small shift to the side
      {
        pose: [{ who: 'goku', pose: 'g_jab', face: 'shout', speed: 22 }],
        space: { who: 'frieza', mode: 'slide', dir: [1, 0, 0], distance: 0.8, seconds: 0.16, face: 'goku', pose: 'strafeR', endPose: 'idle' },
        sfx: { name: 'swing', who: 'goku', vol: 0.9 },
        hold: 0.24,
      },
      // the torso turns after him, the second punch — one forearm takes it
      {
        call: (ctx) => turn(ctx, 'goku', 'frieza'),
        pose: [{ who: 'goku', pose: 'g_crossW', face: 'focused', speed: 18 }],
        move: { who: 'goku', at: 'frieza', local: [0, 0, 1.3], seconds: 0.1, face: 'frieza' },
      },
      {
        call: (ctx) => blocked(ctx, 'goku', 'frieza'),
        pose: [
          { who: 'goku', pose: 'g_cross', face: 'shout', speed: 22 },
          { who: 'frieza', pose: 'fz_block', face: 'smirk', speed: 22 },
        ],
        hold: 0.3,
      },
      // a short body strike back; seen from his side, so the precision of it reads
      {
        pose: [{ who: 'frieza', pose: 'fz_jabW', face: 'smirk', speed: 18 }],
        cam: { subject: 'frieza', with: 'goku', focus: 'full', angle: 'three', side: -1 },
        hold: 0.12,
      },
      {
        call: (ctx) => contact(ctx, 'frieza', 'goku', false),
        pose: [
          { who: 'frieza', pose: 'fz_jab', face: 'smirk', speed: 24 },
          { who: 'goku', pose: 'hitBody', face: 'hurt', speed: 20 },
        ],
        space: { who: 'goku', mode: 'slide', distance: 1.3, seconds: 0.26, endPose: 'guard', expr: 'grit' },
        hold: 0.5,
      },
      // EXCHANGE B — Frieza takes it: a string, blocked, slipped, dodged
      {
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', local: [0, 0, 1.5] }, height: 0.4, seconds: 0.16, pose: 'fz_jabW', endPose: 'fz_jab', face: 'goku' },
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side' },
        hold: 0.04,
      },
      {
        call: (ctx) => blocked(ctx, 'frieza', 'goku'),
        pose: [{ who: 'goku', pose: 'guardHit', face: 'grit', speed: 20 }],
        hold: 0.24,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_kickW', face: 'smirk', speed: 18 }],
        hold: 0.12,
      },
      {
        pose: [
          { who: 'frieza', pose: 'fz_kick', face: 'smirk', speed: 22 },
          { who: 'goku', pose: 'gg_weaveL', face: 'focused', speed: 22 },
        ],
        sfx: { name: 'swing', who: 'frieza', vol: 0.9 },
        hold: 0.26,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_tailW', face: 'smirk', speed: 18 }],
        hold: 0.1,
      },
      {
        pose: [{ who: 'frieza', pose: 'fz_tail', face: 'smirk', speed: 22 }],
        space: { who: 'goku', mode: 'slide', distance: 1.0, seconds: 0.16, pose: 'flyBack', endPose: 'guard', expr: 'focused' },
        sfx: { name: 'dodge', who: 'goku', vol: 0.9 },
        hold: 0.2,
      },
      // the sudden change of direction: at his side before the guard can turn
      {
        call: (ctx) => vanish(ctx, 'frieza'),
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', local: [-1.0, 0, 1.1] }, height: 0.4, seconds: 0.09, pose: 'fz_kickW', endPose: 'fz_kickW', face: 'goku' },
        hold: 0.06,
      },
      // the clean hit: several metres back on his boots, dust behind him, the camera going with him to the ground
      {
        call: (ctx) => contact(ctx, 'frieza', 'goku', true),
        pose: [
          { who: 'frieza', pose: 'fz_kick', face: 'smirk', speed: 24 },
          { who: 'goku', pose: 'hitBody', face: 'hurt', speed: 24 },
        ],
        hold: 0.1,
      },
      {
        space: { who: 'goku', mode: 'slide', dir: [0, 0, 1], distance: 6, seconds: 0.75, pose: 'g_bootDig', endPose: 'g_bootDig', expr: 'grit' },
        cam: { from: { at: 'goku', local: [-2.2, -0.75, 2.6] }, follow: true, look: { at: 'goku', off: [0, -0.1, 0] }, fov: 46 },
        hold: 0.3,
      },
      {
        vfx: { kind: 'dust', at: 'goku:feet', radius: 1.6, count: 14 },
        sfx: { name: 'groundImpact', who: 'goku', vol: 0.6 },
        hold: 0.6,
      },
      // low on the ground, he raises his head: Frieza is hovering above the field, looking down at him
      {
        pose: [
          { who: 'goku', pose: 'guard', face: 'grit', speed: 4 },
          { who: 'frieza', pose: 'idle', face: 'cocky' },
        ],
        space: { who: 'frieza', mode: 'flight', to: { at: 'frieza:feet', off: [0, 1.5, 0] }, seconds: 0.9, pose: 'idle', endPose: 'idle', face: 'goku' },
        cam: { subject: 'goku', focus: 'upper', angle: 'low' },
      },
      {
        cam: { from: { at: 'goku', local: [0.55, -0.45, -1.0] }, look: { at: 'frieza:head' }, fov: 30 },
        hold: 1.5,
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
      if (c.goku) c.goku.target = c.frieza;
      if (c.frieza) c.frieza.target = c.goku;
      m.flags.testedFrieza = true;
    },
  };

  S.frieza_shows_the_gap = {
    id: 'frieza_shows_the_gap',
    cast,
    music: { song: 'frieza_theme', level: 3 },
    events: [
      // the posture changes: upright, arms at his sides, the eyes narrowing
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'cold', speed: 2 },
          { who: 'goku', pose: 'guard', face: 'grit' },
        ],
        cam: { subject: 'frieza', focus: 'upper', angle: 'front', dist: 3.4 },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          ctx.b.vfx.ring(fz.pos.clone().add(new V3(0, 0.3, 0)), 6, 0xc070ff, 0.5, new V3(0, 1, 0));
          ctx.b.vfx.streamInward(fz.chest(), 2.4, 0xd8a0ff, 10, 0.12, 0.5);
        },
        pose: [{ who: 'frieza', pose: 'idle', face: 'cold', aura: 0.75 }],
        sfx: { name: 'kiUp', who: 'frieza', vol: 1, pitch: 0.8 },
        cam: { subject: 'frieza', focus: 'face', angle: 'front' },
        hold: 1.4,
      },
      // Goku raises his guard
      {
        pose: [{ who: 'goku', pose: 'guard', face: 'serious', speed: 6 }],
        cam: { subject: 'frieza', focus: 'medium', angle: 'ots', over: 'goku' },
        hold: 1.1,
      },
      // the rush: so fast the camera only just keeps him
      {
        call: (ctx) => vanish(ctx, 'frieza', 0xd8a0ff),
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', local: [0, 0, 1.4] }, height: 0.3, seconds: 0.14, pose: 'fz_lunge', endPose: 'fz_jab', face: 'goku' },
        pose: [{ who: 'frieza', pose: 'fz_lunge', face: 'angry', aura: 0.6 }],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side', side: -1 },
        sfx: { name: 'dash', who: 'frieza', vol: 1 },
        hold: 0.04,
      },
      {
        call: (ctx) => blocked(ctx, 'frieza', 'goku'),
        pose: [{ who: 'goku', pose: 'guardHit', face: 'grit', speed: 20 }],
        hold: 0.24,
      },
      // gone, and at his side — the side away from the pillar
      {
        call: (ctx) => vanish(ctx, 'frieza', 0xd8a0ff),
        space: { who: 'frieza', mode: 'flight', to: { at: 'goku', local: [-1.3, 0, 0.2] }, height: 0.3, seconds: 0.08, pose: 'fz_kickW', endPose: 'fz_kickW', face: 'goku' },
        hold: 0.08,
      },
      // the second blow gets through, and sends him into the pillar
      {
        call: (ctx) => contact(ctx, 'frieza', 'goku', true, 0xf0d8ff),
        pose: [
          { who: 'frieza', pose: 'fz_kick', face: 'angry', speed: 24 },
          { who: 'goku', pose: 'hitHeavy', face: 'hurt', speed: 20 },
        ],
        move: { who: 'goku', at: 'pillarHit', seconds: 0.3, ease: 'in', ground: false },
        cam: { from: { at: 'field', off: [3, 3.4, 14.5] }, look: { at: 'pillarHit', off: [1.5, -0.4, 0] }, fov: 50 },
      },
      {
        call: (ctx) => {
          const p = ctx.b.story.rocks && ctx.b.story.rocks.pillar;
          if (p && p.alive) ctx.b.stage.destroyPillar(p);
          ctx.b.vfx.debrisBurst(ctx.cast.goku.chest(), 18, 0x8a9a7a, 11, 0.35);
          ctx.cast.goku.setDamage(1, { burst: true });
        },
        space: { who: 'goku', mode: 'groundImpact', to: { at: 'pillarFoot' }, seconds: 0.25, radius: 2.2, depth: 0.35, endPose: 'knockdownFace', expr: 'hurt' },
        shake: { at: 'goku', amount: 0.7 },
        hold: 0.3,
      },
      // the debris coming down after him
      {
        vfx: { kind: 'rocks', at: 'goku:feet', count: 12, radius: 2.4, lift: 7 },
        cam: { from: { at: 'goku', off: [4.6, 1.8, 3.2] }, to: { at: 'goku', off: [3.8, 1.2, 2.6] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 44 },
        hold: 1.6,
      },
      // he pushes himself up
      {
        pose: [{ who: 'goku', pose: 'g_riseSlow', face: 'hurt', speed: 1 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three', side: -1, dist: 4.2 },
        hold: 2.4,
      },
      {
        call: (ctx) => turn(ctx, 'frieza', 'goku'),
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk', aura: 0 }],
        cam: { subject: 'frieza', focus: 'upper', angle: 'three' },
        say: { who: 'frieza', line: 'You keep standing up. I will give you that.', duration: 2.8 },
        hold: 3,
      },
      {
        call: (ctx) => turn(ctx, 'goku', 'frieza'),
        pose: [{ who: 'goku', pose: 'exhausted', face: 'grit' }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'I\'m still here.', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      // calm, almost conversational: the gap, said out loud
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'cold' }],
        cam: { subject: 'frieza', focus: 'upper', focus2: 'closeup', angle: 'front' },
        say: { who: 'frieza', line: 'Don\'t flatter yourself. I haven\'t used a fraction of my power. I\'ve been holding back since the moment you arrived.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      // the two watching, each their own way: Gohan leans in, Krillin cannot take it in
      {
        pose: [{ who: 'gohan', pose: 'sp_lean', face: 'shock' }],
        cam: { subject: 'gohan', focus: 'upper', angle: 'three' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'krillin', pose: 'sp_shock', face: 'nervous' }],
        cam: { subject: 'krillin', focus: 'closeup', angle: 'front' },
        say: { who: 'krillin', line: 'Holding back...? After all of that?', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { b, m, cast: c } = ctx;
      const p = b.story.rocks && b.story.rocks.pillar;
      if (p && p.alive) b.stage.destroyPillar(p, { quiet: true });
      const g = c.goku, fz = c.frieza;
      if (g) {
        if ((g.damageLevel || 0) < 1) g.setDamage(1);
        // wherever a skip left him: on his feet at the foot of what was the pillar, facing Frieza
        if (c.pillarFoot && g.pos.distanceTo(c.pillarFoot.pos) > 2.5) SL.Staging.place(g, c.pillarFoot.pos.clone());
      }
      if (fz) {
        fz.storySpace = null;
        if (fz.pos.y - b.stage.heightAt(fz.pos.x, fz.pos.z) > 0.6) SL.Staging.set(m, fz, 'ground', {});
      }
      if (g && fz) {
        turn(ctx, 'goku', 'frieza');
        turn(ctx, 'frieza', 'goku');
        g.setState('scripted', { pose: 'exhausted', expression: 'grit' });
        fz.setState('scripted', { pose: 'idle', expression: 'cold' });
      }
      m.flags.gapShown = true;
    },
  };

  S.goku_kaioken_escalation = {
    id: 'goku_kaioken_escalation',
    cast,
    events: [
      // he gets up straight. Slowly, and with a plan.
      {
        pose: [{ who: 'goku', pose: 'g_kaiokenFlex', face: 'grit', speed: 3 }],
        cam: { from: { at: 'goku', local: [0.7, 0.28, 2.6] }, to: { at: 'goku', local: [0.42, 0.14, 1.7] }, look: { at: 'goku', off: [0, 0.1, 0] }, fov: 40, fov2: 32 },
        say: { who: 'goku', line: 'Then let me try something I have been saving.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // the red: ground cracks, rock lifts, the camera circles him
      {
        music: { level: 4 },
        sfx: { name: 'kiCharge', who: 'goku', vol: 1.1 },
        vfx: { kind: 'stream', at: { at: 'goku' }, radius: 3, count: 12, color: 0xff5a48, life: 0.6 },
        mood: { amount: 0.65, color: 0x40101a, seconds: 0.5 },
        cam: { orbit: { at: 'goku', from: 0, to: Math.PI * 1.2, radius: 4.4, radius2: 2.8, y: 0.2, y2: 0.8 }, look: { at: 'goku', off: [0, 0.3, 0] }, from: { at: 'goku', off: [0, 0.4, 4] }, fov: 44, fov2: 50 },
        hold: 2.6,
      },
      {
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 12, radius: 4.5, lift: 11 },
        shake: { at: { at: 'goku' }, amount: 0.7 },
        hold: 0.9,
      },
      // the burst, from low: the stance looks like it is driving into the ground
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (!g) return;
          ctx.b.vfx.ring(g.pos.clone().add(new V3(0, 0.4, 0)), 13, 0xff5a48, 0.8, new V3(0, 1, 0));
          ctx.b.vfx.explosion(g.chest(), 5, 0xff8a70, { smoke: false });
        },
        // the red is on him from here, not only in the burst: the form itself, its aura up
        transform: { who: 'goku', form: 'kaioken' },
        pose: [{ who: 'goku', pose: 'g_kaiokenFlex', face: 'shout', aura: 1 }],
        screen: { flash: 0.45, color: '#ffd8d0' },
        sfx: { name: 'kaiokenBoom', who: 'goku', vol: 1 },
        shake: { at: { at: 'goku' }, amount: 1 },
        cam: { from: { at: 'goku', local: [0.5, -0.85, 2.6] }, to: { at: 'goku', local: [0.3, -0.6, 4.4] }, look: { at: 'goku', off: [0, 0.55, 0] }, fov: 40, fov2: 50, subject: 'goku', focus: 'full' },
        say: { who: 'goku', jp: '界王拳！', line: 'Kaioken!', duration: 2.2, style: 'shout', voice: 'goku_kaioken' },
        hold: 2.4,
      },
      // Frieza notices, which is new
      {
        pose: [
          { who: 'frieza', pose: 'idle', face: 'shock' },
          { who: 'goku', pose: 'guard', face: 'grit', aura: 0.85 },
        ],
        cam: { from: { at: 'frieza', local: [0.9, 0.5, 2.6] }, to: { at: 'frieza', local: [0.7, 0.4, 2] }, look: { at: 'frieza' }, fov: 40, fov2: 34 },
        say: { who: 'frieza', line: 'Where did that come from?', duration: 2.2 },
        hold: 2.4,
      },
      // THE FIRST KAIOKEN RUSH: a punch lands, then a kick, a burst of movement behind him — and he turns and answers
      {
        call: (ctx) => vanish(ctx, 'goku', 0xff6a50),
        space: { who: 'goku', mode: 'flight', to: { at: 'frieza', local: [0, 0, 1.5] }, height: 0.1, seconds: 0.22, pose: 'dash', endPose: 'g_crossW', face: 'frieza' },
        pose: [{ who: 'goku', pose: 'dash', face: 'shout', aura: 0.9 }],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'low' },
        sfx: { name: 'dash', who: 'goku', vol: 1 },
        hold: 0.04,
      },
      // S-FRZ-03 (research draft): the cross to his face — his head snaps aside — close beside him, tilted; the kick
      // cuts again from his other side, tilted the other way
      {
        call: (ctx) => {
          contact(ctx, 'goku', 'frieza', true, 0xff8a70);
          dutch(ctx, 1);
        },
        pose: [
          { who: 'goku', pose: 'g_cross', face: 'shout', speed: 24, aura: 0.9 },
          { who: 'frieza', pose: 'hitSideR', face: 'shock', speed: 20 },
        ],
        space: { who: 'frieza', mode: 'slide', distance: 1.2, seconds: 0.16, endPose: 'hitSideR', expr: 'shock' },
        hold: 0.12,
      },
      {
        space: { who: 'goku', mode: 'flight', to: { at: 'frieza', local: [0, 0, 1.4] }, height: 0.1, seconds: 0.1, pose: 'g_kickW', endPose: 'g_kickW', face: 'frieza' },
        hold: 0.06,
      },
      {
        call: (ctx) => {
          contact(ctx, 'goku', 'frieza', true, 0xff8a70);
          dutch(ctx, -1);
        },
        pose: [
          { who: 'goku', pose: 'g_kick', face: 'shout', speed: 24, aura: 0.9 },
          { who: 'frieza', pose: 'stagger', face: 'angry', speed: 18 },
        ],
        space: { who: 'frieza', mode: 'slide', distance: 1.6, seconds: 0.2, endPose: 'stagger', expr: 'angry' },
        hold: 0.16,
      },
      // gone — and behind him
      {
        call: (ctx) => vanish(ctx, 'goku', 0xff6a50),
        place: { who: 'goku', at: 'frieza', local: [0, 0, -1.6], face: 'frieza' },
        pose: [{ who: 'goku', pose: 'g_elbowW', face: 'shout', speed: 20, aura: 0.9 }],
        cam: { subject: 'frieza', with: 'goku', focus: 'full', angle: 'three', side: -1 },
        hold: 0.26,
      },
      // he reads it, turns, and the tail comes round first
      {
        call: (ctx) => turn(ctx, 'frieza', 'goku'),
        pose: [{ who: 'frieza', pose: 'fz_tailW', face: 'angry', speed: 22 }],
        hold: 0.1,
      },
      {
        call: (ctx) => contact(ctx, 'frieza', 'goku', true, 0xf0d8ff),
        pose: [
          { who: 'frieza', pose: 'fz_tail', face: 'angry', speed: 24 },
          { who: 'goku', pose: 'hitBody', face: 'hurt', speed: 20 },
        ],
        space: { who: 'goku', mode: 'slide', distance: 2.4, seconds: 0.3, endPose: 'guard', expr: 'grit' },
        hold: 0.6,
      },
      {
        pose: [{ who: 'krillin', pose: 'sp_lean', face: 'shock' }],
        cam: { subject: 'krillin', focus: 'closeup', angle: 'front' },
        say: { who: 'krillin', line: 'He was holding that back. He was holding that back the whole time.', duration: 3, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const { b, m, cast } = ctx;
      const g = cast.goku, fz = cast.frieza;
      if (g) {
        // the escalation the scene was about: the form is unlocked and active
        m.teach(g, 'form:kaioken');
        if (g.formIndex < 1) g.applyForm(1);
        if (g.setFormLevel) g.setFormLevel(Math.min(1, (g.form.levels || []).length - 1));
        g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.45));
        g.ki = Math.max(g.ki, 70);
        g.storySpace = null;
        g.setState('free');
        g.target = fz;
      }
      if (fz) {
        fz.storySpace = null;
        fz.setState('free');
        fz.target = g;
      }
      if (b.stage.clearMood) b.stage.clearMood(0.6);
      m.flags.kaiokenShown = true;
    },
  };
})();
