/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 8: "The Ultimate Fusion" (the lava wasteland; the dimension break)
 *
 *   ARRIVE *   (A, staged + cues)    Instant Transmission: GOGETA between Golden Frieza and Super Saiyan Broly. Broly's
 *                                    green barrage — Gogeta walks into it (low in front of him, tracking back), the
 *                                    lens circling his torso as a beam goes under his arm, over his shoulder as the
 *                                    needles come: WEAVE (Dodge) three times. Then SUPER SAIYAN: the boots planted
 *                                    (embers floating at his ankles), the fists drawn back, the eyes and hair flashing,
 *                                    the golden column from above clearing the smoke.
 *   COUNTER    (B, cues)             from behind Broly: his hook — Gogeta gone, inside his guard: the spinning
 *                                    roundhouse (Heavy); side on, the four-hit combo (Light: ribs, jaw, knee, backfist);
 *                                    low, the double-palm blast (Blast) — Broly through the rock pillars.
 *   AERIAL *   (C, play)             SSJ Gogeta against SSJ Broly in the air over the lava.
 *   BEAMS      (C, beam clash)       Broly's mouth beam — answer it with the Big Bang Kamehameha (Ultimate): both
 *                                    fighters and the clash in one wide side-on frame. He powers through it anyway.
 *   BLUE *     (D, hold Charge)      SUPER SAIYAN BLUE: the arms folded, a breath, the roar dropping to a hum; the gold
 *                                    going magenta going cyan; the column from the sky; boots to face, the blue.
 *   FULL *     (E, staged + play)    FULL POWER BROLY: bigger, greener, the chest plate bursting, the arena coming apart
 *                                    round him — and a new, wilder fighter.
 *   BREAK      (F, staged)           the two of them side on, fists drawn back; the fists meet — CRACK: reality breaks
 *                                    like a mirror, shards falling away round them into the dimension.
 *   DIMENSION *(G, play + cues)      a space of light (magenta, violet, cyan, emerald; crystals and beams at every
 *                                    depth). Gogeta in control. FUTILE: arms folded, a lean, the fist grazing past
 *                                    (Dodge) — the inverted spin kick (Heavy). GOD PUNISHER (Special 1): the stance, the
 *                                    spheres, the low dash, the kick up, the pursuit, the crossed arms and the barrage,
 *                                    the detonation. STARDUST FALL (Special 2): palms down, the prismatic rain, the dome.
 *                                    SOUL PUNISHER (Ultimate): the rainbow orb thrown — he SURVIVES it; Gogeta's smile.
 *                                    The heel-kick (Heavy) and the second fracture.
 *   RETURN     (H, cues)             back on the lava: his last green geyser; the uppercut (Light), the hammer from
 *                                    above (Heavy), the meteor kick (Heavy) — the crater.
 *   KAME *     (I, hold + release)   terror in Broly's eyes; Gogeta above him, hands cupped at his hip — hold Charge,
 *                                    KA-ME-HA-ME — HA! (Ultimate). Cheelai's wish; the dragon's eyes; Broly gone in
 *                                    a green flash; the beam on into the sky; Gogeta lets it go, and smiles.
 *   AFTER                            the title; next: "A New Beginning".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project (two short phrases the owner
 * named — "futile", Cheelai's wish — are kept to their sense in a few words).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;
  const EK = () => SL.data.endzKit;

  const GG = {
    aerialSeconds: 26, aerialMin: 12, gogetaFloor: 0.5, brolyFloor: 0.45, brolyDealt: 0.3,
    fullSeconds: 30, fullMin: 12, brolyDealtFull: 0.32, dimSeconds: 22, dimMin: 10, blueHold: 2.8, kameHold: 2.6, alt: 40,
  };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));
  const SPOT = { frieza: [-6, -16], broly: [6, 12], gogeta: [0, -4], cheelai: [-48, 58], lemo: [-51, 56], ship: [-54, 62] };
  const PRISM = () => SL.Dimension.PRISM;

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const gogeta = b.spawn({ charId: 'gogeta', player: true, team: 0, pos: at('gogeta'), startKi: 100 });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: at('broly'), startKi: 100 });
    const frieza = b.spawn({ charId: 'frieza', team: 0, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 0, pos: at('cheelai'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 0, pos: at('lemo'), startKi: 0 });
    BK.give(frieza, 'golden');
    K.toForm(frieza, 'golden');
    K.watcher(frieza, 'defeatKneel', 'hurt');
    K.watcher(cheelai, 'ch_watch', 'nervous');
    K.watcher(lemo, 'le_watch', 'calm');
    K.watcher(broly, 'br_lsIdle', 'shout');
    BK.give(broly, ['wrath', 'ssj']);
    K.toForm(broly, 'ssj');
    for (const f of [gogeta, broly, frieza]) f.cannotDie = true;
    K.faceTo(cheelai, broly.pos);
    K.faceTo(lemo, broly.pos);
    b.story = { gogeta, broly, frieza, cheelai, lemo };
  }

  /** The skip-safe pair every staged phase here uses: wait(seconds) and cue(key, label, opts). */
  function film(m) {
    const b = m.battle;
    const skip = { on: false };
    return {
      skip,
      *wait(s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      },
      *cue(key, label, opts) {
        if (skip.on) return { pressed: false, skipped: true };
        const r = yield* m.cue(key, label, opts);
        if (b.skipRequested) skip.on = true;
        m.qteParts.push(r.pressed ? 1 : 0.5);
        return r;
      },
    };
  }
  const lens = (m, fn, opts) => m.shot(fn, 999, Object.assign({ hold: true, cut: true, blendIn: 0 }, opts || {}));
  const fwd = (f) => f.forward.clone().setY(0).normalize();
  const sideOf = (f) => {
    const d = fwd(f);
    return new V3(d.z, 0, -d.x);
  };

  /** A many-coloured explosion, layered (the God Punisher's end, the Stardust Fall's dome, the Soul Punisher). */
  function prismBurst(b, at, r) {
    const P = PRISM();
    for (let i = 0; i < 5; i++) b.after(i * 4, () => b.vfx.explosion(at.clone().add(new V3(Math.sin(i * 2.1) * r * 0.3, Math.cos(i * 1.7) * r * 0.3, Math.sin(i * 3.3) * r * 0.3)), r * (0.6 + i * 0.12), P[i % P.length], {}));
    b.vfx.ring(at, r * 2.4, 0xffffff, 0.6);
    b.vfx.ring(at, r * 1.8, 0x8ad8ff, 0.5, new V3(0.3, 1, 0.2).normalize());
    if (SL.Dimension.glitter) SL.Dimension.glitter(b, at, 30, { spread: r, solid: true });
    b.sfx('explosionBig', null, { at, pitch: 1.1, vol: 1.3 });
    b.cameraTraumaAt(at, 0.8);
  }

  /** Move a fighter from where he is to `to` over `frames` (an eased line, optionally arched), as a generator. */
  function* travel(b, f, to, frames, arch = 0, ground = false) {
    const from = f.pos.clone();
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / frames);
      const e = 1 - (1 - k) * (1 - k);
      const p = from.clone().lerp(to, e);
      p.y += Math.sin(k * Math.PI) * arch;
      if (ground) K.place(f, BK.at(b, p.x, p.z, Math.max(0, p.y - BK.at(b, p.x, p.z).y)), f.yaw);
      else {
        f.setPosition(p);
        f.vel.set(0, 0, 0);
        f.grounded = false;
      }
      return k >= 1 || b.skipRequested;
    };
    if (!ground) f.setPosition(to);
  }

  function lava(m) {
    if (m.flags.lava) return;
    m.flags.lava = true;
    BK.lavaReact(m);
  }

  const P = {};

  /* ======================================================================== A · BASE GOGETA */
  P.arrive = {
    id: 'arrive',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly, fz = S.frieza;
      const F = film(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      if (gg.formIndex !== 0) gg.applyForm(0);
      K.toForm(br, 'ssj');
      // he is not here yet: Instant Transmission brings him
      gg.setHidden(true);
      gg.controller = K.scripted();
      br.controller = K.scripted();
      K.place(fz, BK.at(b, SPOT.frieza[0], SPOT.frieza[1]), 0);
      K.place(br, BK.at(b, SPOT.broly[0], SPOT.broly[1]), 0);
      K.faceTo(br, fz.pos);
      K.faceTo(fz, br.pos);
      fz.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      if (fz.model && fz.model.setBattered) fz.model.setBattered(true);
      m.title(BK.CHAPTER, 'THE ULTIMATE FUSION', 'The lava wasteland', 3);
      m.music('broly_wrath', 2);
      SL.Cinema.shotOn(m, { frieza: fz, broly: br }, { subject: 'broly', with: 'frieza', focus: 'full' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* F.wait(1.6);
      // pop: between them
      BK.appear(b, gg, BK.at(b, SPOT.gogeta[0], SPOT.gogeta[1]), Math.atan2(br.pos.x - SPOT.gogeta[0], br.pos.z - SPOT.gogeta[1]));
      gg.untargetable = gg.intangible = true;
      gg.setState('scripted', { pose: 'gg_it', expression: 'calm' });
      lens(m, (t, out) => {
        out.pos.copy(gg.pos).addScaledVector(fwd(gg), 2.4).add(new V3(0.5, 0.25, 0));
        out.look.copy(gg.chest()).add(new V3(0, 0.4, 0));
        out.fov = 50;
      });
      yield* F.wait(1.2);
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'calm' });
      SL.Cinema.shotOn(m, { frieza: fz }, { subject: 'frieza', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'And who might YOU be...?', 2);
      yield* F.wait(2);
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gogeta', 'Sit there and watch.', 1.8);
      yield* F.wait(1.8);
      // the barrage: he walks into it
      b.sfx('roar', br, { pitch: 0.6, vol: 1.3 });
      br.setState('scripted', { pose: 'br_eraser', expression: 'shout', aura: 1 });
      gg.setState('scripted', { pose: 'bb_walk', expression: 'calm', speed: 3 });
      const walkTo = gg.pos.clone().lerp(br.pos, 0.55);
      const w0 = gg.pos.clone();
      let wn = 0;
      const walk = () => {
        if (b.disposed || wn > 400 || !m.flags.walking) return false;
        wn++;
        const k = Math.min(1, wn / 400);
        K.place(gg, BK.at(b, U.lerp(w0.x, walkTo.x, k), U.lerp(w0.z, walkTo.z, k)), gg.yaw);
        // the spheres raining down round him
        if (wn % 9 === 0) {
          const a = wn * 1.7, r = 2.5 + (wn % 4);
          const hit = BK.at(b, gg.pos.x + Math.cos(a) * r, gg.pos.z + Math.sin(a) * r);
          const from = br.chest();
          for (let i = 0; i <= 5; i++) b.vfx.trail(from.clone().lerp(hit, i / 5), 0x5aff6a, 0.4, 0.2);
          b.after(3, () => {
            b.vfx.explosion(hit.clone().add(new V3(0, 0.4, 0)), 1.2, 0x5aff6a, {});
            if (b.stage.lavaGeyser) b.stage.lavaGeyser(hit, 3);
          });
          b.sfx('explosionSmall', null, { at: hit, vol: 0.6 });
        }
        return true;
      };
      m.flags.walking = true;
      b.onTick(walk);
      // 1. low in front of him, tracking back as he walks; a small tilt of the head
      lens(m, (t, out) => {
        out.pos.copy(gg.pos).addScaledVector(fwd(gg), 3.2).add(new V3(0, 0.45, 0));
        out.look.copy(gg.chest()).add(new V3(0, 0.25, 0));
        out.fov = 50;
      }, { subject: gg });
      yield* F.wait(1);
      m.objective('weave', 'Weave through it', { icon: 'guard', target: 3 });
      const weave = (i) => {
        gg.setState('scripted', { pose: i % 2 ? 'gg_weaveR' : 'gg_weaveL', expression: 'calm', speed: 22 });
        b.vfx.afterimage(gg.pos, gg.height, 0xffe9b0);
        b.sfx('swing', gg, { pitch: 1.3, vol: 0.6 });
        m.progress('weave', i + 1);
      };
      const streak = (offset, color = 0x6aff7a) => {
        const from = br.chest(), to = gg.chest().add(offset).addScaledVector(gg.chest().sub(from).normalize(), 8);
        b.vfx.slash(from, to, color, 0.18, 0.06);
      };
      streak(new V3(0.35, 0.3, 0));
      yield* F.cue('dodge', 'Weave (Dodge)', { auto: 1.3, slow: 0.35 });
      weave(0);
      yield* F.wait(0.5);
      // 2. circling his upper body: a beam straight at his chest — it goes under his arm
      gg.setState('scripted', { pose: 'bb_walk', expression: 'calm', speed: 3 });
      const th = gg.yaw;
      lens(m, (t, out, el) => {
        const k = Math.min(1, (el || 0) / 1.8), a = th + 0.8 + k * 2.6, c = gg.chest();
        out.pos.set(c.x + Math.sin(a) * 2.6, c.y + 0.3, c.z + Math.cos(a) * 2.6);
        out.look.copy(c);
        out.fov = 46;
      });
      streak(sideOf(gg).multiplyScalar(0.55).add(new V3(0, -0.15, 0)), 0x3aff5a);
      yield* F.cue('dodge', 'Weave', { auto: 1.1, slow: 0.35 });
      weave(1);
      b.vfx.flash(gg.chest(), 1.6, 0x5aff6a, 0.25, SL.Toon.tex.glow);
      yield* F.wait(0.6);
      // 3. over his left shoulder: needles of green coming at the lens
      lens(m, (t, out) => {
        out.pos.copy(gg.headPos()).addScaledVector(fwd(gg), -1.1).addScaledVector(sideOf(gg), -0.4).add(new V3(0, 0.12, 0));
        out.look.copy(br.chest());
        out.fov = 40;
      });
      for (let i = 0; i < 6; i++) b.after(i * 5, () => streak(new V3(Math.sin(i * 2) * 0.6, 0.3 + Math.cos(i) * 0.3, 0), 0x9affb0));
      yield* F.cue('dodge', 'Weave', { auto: 0.9, slow: 0.35 });
      weave(2);
      yield* F.wait(0.6);
      m.flags.walking = false;
      m.complete('weave');
      // SUPER SAIYAN: the boots planted, embers floating at his ankles
      gg.setState('free');
      const idx = K.formIndex(gg, 'ssj');
      yield* C.transform(m, {
        fighter: gg, formIndex: idx, witness: S.frieza, dust: false,
        witnessLine: 'That power... it\'s not even the same KIND of power...',
        changeShots: [
          { at: 0, free: true, shot: (t, out) => {
            out.pos.copy(gg.pos).addScaledVector(fwd(gg), 1.4).addScaledVector(sideOf(gg), 0.6).add(new V3(0, 0.2, 0));
            out.look.copy(gg.pos).add(new V3(0, 0.35, 0));
            out.fov = 46;
          } },
          { at: 0.35, free: true, shot: (t, out) => {
            const c = gg.chest();
            out.pos.copy(c).addScaledVector(fwd(gg), 2).add(new V3(0, 0.25, 0));
            out.look.copy(c).add(new V3(0, 0.3, 0));
            out.fov = 40;
          } },
          { at: 0.72, free: true, shot: (t, out) => {
            const hd = gg.headPos();
            out.pos.copy(hd).addScaledVector(fwd(gg), 0.7).add(new V3(0, 0.05, 0));
            out.look.copy(hd).add(new V3(0, 0.06, 0));
            out.fov = 30;
          } },
          { at: 1.0, shot: (t, out) => {
            out.pos.copy(gg.pos).add(new V3(2, 22 + t * 6, 2));
            out.look.copy(gg.pos);
            out.fov = 56;
          } },
        ],
        onFrame: (fr, burstAt) => {
          if (fr < burstAt && fr % 4 === 0 && b.vfx.specks) {
            const p = gg.pos;
            b.vfx.specks.emit(p.x + Math.sin(fr) * 0.8, p.y + 0.1, p.z + Math.cos(fr) * 0.8, 0, 0.9 + (fr % 3) * 0.3, 0, 1, 0.5, 0.15, 1, 0.05, 1.4, { fadeIn: 10 });
          }
          if (fr === burstAt) {
            const col = gg.pos.clone().add(new V3(0, 30, 0));
            b.vfx.ring(gg.pos.clone().add(new V3(0, 0.3, 0)), 24, 0xffd23a, 0.9, new V3(0, 1, 0));
            b.vfx.flash(col, 12, 0xffe680, 0.5, SL.Toon.tex.glow);
          }
        },
      });
      gg.untargetable = gg.intangible = false;
      m.endShot();
      b.skipRequested = false;
    },
  };

  /* ======================================================================== B · THE COUNTER */
  P.counter = {
    id: 'counter',
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      const F = film(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      K.toForm(gg, 'ssj');
      K.toForm(br, 'ssj');
      gg.controller = K.scripted();
      br.controller = K.scripted();
      b.switchPlayer(gg, { force: true, quiet: true });
      gg.controller = K.scripted();
      K.place(br, BK.at(b, gg.pos.x + fwd(gg).x * 9, gg.pos.z + fwd(gg).z * 9), 0);
      K.faceTo(br, gg.pos);
      K.faceTo(gg, br.pos);
      gg.setState('scripted', { pose: 'gg_lowStance', expression: 'cocky' });
      // behind Broly's shoulder: the hook — and Gogeta is not there
      br.setState('scripted', { pose: 'br_hayW', expression: 'shout', aura: 1 });
      lens(m, (t, out) => {
        out.pos.copy(br.chest()).addScaledVector(fwd(br), -2.2).addScaledVector(sideOf(br), 0.9).add(new V3(0, 0.6, 0));
        out.look.copy(gg.chest());
        out.fov = 40;
      });
      yield* F.wait(0.5);
      br.setState('scripted', { pose: 'br_hay', expression: 'shout', aura: 1, speed: 26 });
      b.vfx.afterimage(gg.pos, gg.height, 0xffd23a);
      b.sfx('vanish', gg);
      K.place(gg, BK.at(b, br.pos.x - fwd(br).x * -1.6, br.pos.z - fwd(br).z * -1.6), 0);
      K.faceTo(gg, br.pos);
      // tight behind him as he spins on his heel
      gg.setState('scripted', { pose: 'gg_roundW', expression: 'focused', speed: 20 });
      lens(m, (t, out) => {
        out.pos.copy(gg.chest()).addScaledVector(fwd(gg), -1.8).add(new V3(0.5, 0.4, 0));
        out.look.copy(br.headPos());
        out.fov = 44;
      });
      m.objective('combo', 'The counter', { icon: 'fist', target: 3 });
      yield* F.cue('heavy', 'Spinning roundhouse! (Heavy)', { auto: 1.6, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_round', expression: 'focused', speed: 30 });
      br.setState('scripted', { pose: 'hitSideR', expression: 'hurt', speed: 30 });
      b.vfx.impact(br.headPos(), 4, 0xffe9b0);
      b.sfx('punchHeavy', br, { pitch: 0.45, vol: 1.5 });
      b.cameraTraumaAt(br.chest(), 0.9);
      m.progress('combo', 1);
      yield* F.wait(0.5);
      // side on: the four-hit combination
      const mid = () => gg.chest().lerp(br.chest(), 0.5);
      lens(m, (t, out) => {
        const d = br.chest().sub(gg.chest()).setY(0).normalize(), sd = new V3(d.z, 0, -d.x);
        out.pos.copy(mid()).addScaledVector(sd, 6).add(new V3(0, 0.3, 0));
        out.look.copy(mid());
        out.fov = 44;
      });
      gg.setState('scripted', { pose: 'gg_jabW', expression: 'focused' });
      yield* F.cue('light', 'Four-hit combo! (Light)', { auto: 1.4, slow: 0.35 });
      const hits = [['gg_jab', 'hitBody'], ['gg_launch', 'hitLight'], ['gg_knee', 'hitBody'], ['gg_backfist', 'hitSideL']];
      for (const [pose, hp] of hits) {
        gg.setState('scripted', { pose, expression: 'focused', speed: 34 });
        br.setState('scripted', { pose: hp, expression: 'hurt', speed: 30 });
        b.vfx.impact(br.chest(), 2.6, 0xffe9b0);
        b.vfx.ring(br.chest(), 1.6, 0x8ad8ff, 0.3);
        b.vfx.ring(br.chest(), 1.2, 0xffd23a, 0.3);
        b.sfx('punchHeavy', br, { pitch: 0.8, vol: 1 });
        yield* F.wait(0.22);
      }
      m.progress('combo', 2);
      // low: both palms into his chest, a blast of gold
      gg.setState('scripted', { pose: 'gg_meteorW', expression: 'shout' });
      lens(m, (t, out) => {
        out.pos.copy(gg.pos).addScaledVector(fwd(gg), 0.6).addScaledVector(sideOf(gg), 1.6).add(new V3(0, 0.2, 0));
        out.look.copy(br.chest()).add(new V3(0, 0.4, 0));
        out.fov = 52;
      });
      yield* F.cue('blast', 'Double-palm blast! (Blast)', { auto: 1.4, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_palms', expression: 'shout', speed: 30 });
      b.vfx.explosion(br.chest(), 2, 0xffe27a, {});
      b.vfx.flash(br.chest(), 3, 0xfff4c0, 0.3, SL.Toon.tex.glow);
      b.sfx('explosionBig', br, { pitch: 1.2, vol: 1.1 });
      m.progress('combo', 3);
      m.complete('combo');
      // through the rock pillars
      const away = br.pos.clone().sub(gg.pos).setY(0).normalize();
      const start = br.pos.clone(), end = start.clone().addScaledVector(away, 40);
      const spires = b.stage.obstacles.filter((o) => o.alive && !o.fixture && o.segs && Math.hypot(o.x - (start.x + end.x) / 2, o.z - (start.z + end.z) / 2) < 28);
      br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
      lens(m, (t, out) => {
        out.pos.copy(br.chest()).addScaledVector(sideOf(gg), 9).addScaledVector(away, -3).add(new V3(0, 1.6, 0));
        out.look.copy(br.chest());
        out.fov = 52;
      });
      const smash = () => {
        if (b.disposed || !m.flags.smashing) return false;
        for (const o of spires) if (o.alive && Math.hypot(o.x - br.pos.x, o.z - br.pos.z) < o.r + 3) b.stage.destroyPillar(o);
        return true;
      };
      m.flags.smashing = true;
      b.onTick(smash);
      yield* travel(b, br, end.clone().add(new V3(0, 1.5, 0)), 30, 3, true);
      m.flags.smashing = false;
      for (const o of spires) if (o.alive) b.stage.destroyPillar(o, { quiet: true });
      K.place(br, BK.at(b, end.x, end.z), br.yaw);
      b.stage.crater(BK.at(b, end.x, end.z), 4, 1.2, null);
      br.setState('scripted', { pose: 'br_down', expression: 'hurt' });
      yield* F.wait(0.8);
      m.endShot();
      b.skipRequested = false;
    },
  };

  /* ======================================================================== C · IN THE AIR */
  function airFight(m, opts) {
    const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
    b.switchPlayer(gg, { force: true, quiet: true });
    br.controller = cpu(b);
    br.untargetable = br.intangible = false;
    gg.untargetable = gg.intangible = false;
    br.target = gg;
    gg.target = br;
    for (const f of [gg, br]) f.setState('free');
    br.legendaryOverride = opts.legendary;
    return m.storyFight({
      floors: [{ f: gg, at: GG.gogetaFloor }, { f: br, at: GG.brolyFloor }],
      dealt: [{ f: br, mul: opts.dealt }],
      space: opts.space, fighters: [gg, br],
    });
  }

  P.aerial = {
    id: 'aerial',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      K.toForm(gg, 'ssj');
      K.toForm(br, 'ssj');
      const c = BK.at(b, 0, 10);
      K.hover(b, gg, c.clone().add(new V3(0, 0, -6)), 8);
      K.hover(b, br, c.clone().add(new V3(0, 0, 6)), 8);
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      gg.hp = Math.max(gg.hp, gg.hpMax * 0.85);
      gg.ki = Math.max(gg.ki, gg.kiMax * 0.7);
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      const fight = airFight(m, { dealt: GG.brolyDealt, legendary: { stageCap: 2, learnAt: 3 }, space: 'air' });
      m.music('gogeta_super_rush', 3);
      m.title(BK.CHAPTER, 'SUPER SAIYAN GOGETA', 'In the air over the lava', 2.4);
      m.objective('aerial', 'Take him apart in the air', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (fight.floored(br) && t > GG.aerialMin) || t > GG.aerialSeconds || m.state !== 'running';
      K.unhook(m, clock);
      if (m.state !== 'running') return;
      m.complete('aerial');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /** The beam clash: his mouth beam, the Big Bang Kamehameha — wide and side on, both of them in the frame. */
  P.beams = {
    id: 'beams',
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      K.toForm(gg, 'ssj');
      K.toForm(br, 'ssj');
      const c = BK.at(b, 0, 0);
      K.hover(b, gg, c.clone().add(new V3(9, 0, 0)), 9);
      K.hover(b, br, c.clone().add(new V3(-9, 0, 0)), 9);
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_roarCharge', expression: 'shout', aura: 1 });
      gg.ki = gg.kiMax;
      gg.target = br;
      br.target = gg;
      b.switchPlayer(gg, { force: true, quiet: true });
      gg.setState('free');
      b.clash.maxSeconds = 7;
      gg.lockedSlots = { special1: true, special2: true, transform: true };
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      for (const k of ['ult', 'ultHeld', 'light', 'heavy', 'blast']) delete lim[k];
      m.limits(lim);
      // wide, side on: the two of them on opposite sides of the frame, the clash between them
      lens(m, (t, out) => {
        const mid = gg.chest().lerp(br.chest(), 0.5);
        const d = gg.chest().sub(br.chest()), sep = d.length();
        const sd = new V3(d.z, 0, -d.x).normalize();
        out.pos.copy(mid).addScaledVector(sd, Math.max(11, sep * 0.95)).add(new V3(0, 1.4, 0));
        out.look.copy(mid);
        out.fov = 52;
      }, { subject: gg });
      m.objective('clash', 'He opens his mouth: answer with the Big Bang Kamehameha (Ultimate) — then mash', { icon: 'beam' });
      m.prompt('bbBigBang', 'ultimate', 'Big Bang Kamehameha — the Ultimate button', { required: true, always: true, when: () => gg.state === 'free' });
      b.sfx('roar', br, { pitch: 0.6, vol: 1.2 });
      let fired = false, mine = false, waited = 0, result = null;
      const offE = b.on('clashEnd', (e) => {
        result = e.winner === gg ? 'won' : e.winner === br ? 'lost' : 'draw';
      });
      m.onDispose(offE);
      const spec = br.resolveSpec(br.specFor('ultimate'));
      const gspec = gg.resolveSpec(gg.specFor('ultimate'));
      const hook = () => {
        if (b.inputLocked && !b.clash.active) return;
        waited += 1 / 60;
        // the green gathering in his open mouth: the tell
        if (b.frame % 3 === 0) b.vfx.streamInward(br.headPos(), 2.2, 0x5aff6a, 2, 0.14, 0.3);
        if (b.projectiles.beams.some((bm) => bm.owner === gg && !bm.done)) mine = true;
        // nobody is stuck: if the player does not answer, Gogeta does
        if (!mine && waited > 4.2) {
          mine = true;
          gg.setState('scripted', { pose: 'gg_bbkFire', expression: 'shout' });
          b.projectiles.spawnBeam(gg, gspec, 1);
        }
        // his roar leaves the moment the Big Bang does: they meet between them
        if (mine && !fired) {
          fired = true;
          br.setState('scripted', { pose: 'br_roarFire', expression: 'shout', aura: 1 });
          b.projectiles.spawnBeam(br, spec, 1);
          b.sfx('beamFire', br, { pitch: 0.7 });
        }
      };
      m.tickHooks.push(hook);
      m.lock(false);
      b.aiLocked = true;
      yield () => result !== null || (fired && mine && !b.clash.active && waited > 12) || waited > 16;
      K.unhook(m, hook);
      offE();
      m.limits(null);
      gg.lockedSlots = {};
      m.flags.clash = result || 'hit';
      if (result === 'won') m.complete('clash');
      else m.failObjective('clash');
      m.qteParts.push(result === 'won' ? 1 : 0.4);
      m.lock(true);
      K.clearCombat(b);
      gg.controller = K.scripted();
      // he comes through it anyway
      br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', aura: 1 });
      b.vfx.ring(br.chest(), 10, 0x5aff6a, 0.6);
      b.sfx('roar', br, { pitch: 0.5, vol: 1.4 });
      BK.swell(br, 0.5, 'full', 'ssj');
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(1.6);
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'calm' });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gogeta', 'He keeps climbing. Fine — then so do I.', 2.6);
      yield* m.cine(2.6);
      BK.swell(br, 0, 'full', 'ssj');
      K.toForm(br, 'ssj');
      m.endShot();
    },
  };

  /* ======================================================================== D · BLUE */
  P.blue = {
    id: 'blue',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      K.toForm(gg, 'ssj');
      K.toForm(br, 'ssj');
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      gg.ki = gg.kiMax;
      gg.setState('free');
      b.switchPlayer(gg, { force: true, quiet: true });
      m.objective('blue', 'Super Saiyan Blue: hold Charge', { icon: 'transform' });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      gg.auraViewCap = 0.3;
      SL.Music.stop(0.4);
      const gold = new THREE.Color(0xffd23a), mag = new THREE.Color(0xff5ad8), cyan = new THREE.Color(0x2a8aff);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 220, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x3a9aff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      b.scene.add(col);
      m.onDispose(() => {
        if (col.parent) b.scene.remove(col);
        col.geometry.dispose();
        col.material.dispose();
      });
      BK.give(gg, 'blue');
      yield* C.ascend(m, {
        fighter: gg, form: 'blue', witness: br, seconds: GG.blueHold,
        label: 'Hold Charge — Super Saiyan Blue', meter: 'SUPER SAIYAN BLUE', music: 3, dust: false,
        transform: {
          changeShots: [
            // the arms folded, a deliberate breath: low, looking up at him against the dark sky
            { at: 0, shot: (t, out) => {
              const c = gg.chest();
              out.pos.copy(c).addScaledVector(fwd(gg), 2.6).add(new V3(0.3, -1.2, 0));
              out.look.copy(c).add(new V3(0, 0.4, 0));
              out.fov = 46;
            } },
            // the brow and the eyes: gold to magenta to cyan
            { at: 0.4, free: true, shot: (t, out) => {
              const hd = gg.headPos();
              out.pos.copy(hd).addScaledVector(fwd(gg), 0.7).add(new V3(0, 0.05, 0));
              out.look.copy(hd).add(new V3(0, 0.06, 0));
              out.fov = 30;
            } },
            // from the sky: the column through the clouds
            { at: 0.88, shot: (t, out) => {
              out.pos.copy(gg.pos).add(new V3(4, 46 + t * 8, 6));
              out.look.copy(gg.pos);
              out.fov = 58;
            } },
            // boots to face: the blue
            { at: 1.08, shot: (t, out) => {
              const c = gg.chest();
              out.pos.copy(gg.pos).addScaledVector(fwd(gg), 2.2).add(new V3(0.4, 0.2 + t * 0.6, 0));
              out.look.copy(c).add(new V3(0, 0.2 + t * 0.5, 0));
              out.fov = 48;
            } },
          ],
          onFrame: (fr, burstAt) => {
            gg.auraViewCap = fr < burstAt ? 0.4 : null;
            const k = U.clamp01(fr / burstAt);
            if (gg.aura && gg.aura.color) gg.aura.color.copy(k < 0.5 ? gold.clone().lerp(mag, k * 2) : mag.clone().lerp(cyan, (k - 0.5) * 2));
            if (fr > burstAt * 0.8) {
              col.position.copy(gg.pos).add(new V3(0, 110, 0));
              col.material.opacity = fr < burstAt ? (fr - burstAt * 0.8) / (burstAt * 0.2) * 0.45 : Math.max(0, 0.45 - (fr - burstAt) / 60);
            }
            if (fr === burstAt) {
              b.vfx.ring(gg.pos.clone().add(new V3(0, 0.3, 0)), 30, 0x8ad8ff, 1, new V3(0, 1, 0));
              b.sfx('transformBurst', gg, { vol: 1 });
            }
          },
        },
      });
      gg.auraViewCap = null;
      if (col.parent) b.scene.remove(col);
      m.complete('blue');
      m.endShot();
    },
  };

  /* ======================================================================== E · FULL POWER */
  P.full = {
    id: 'full',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      BK.give(gg, 'blue');
      K.toForm(gg, 'blue');
      K.toForm(br, 'ssj');
      gg.controller = K.scripted();
      br.controller = K.scripted();
      K.place(br, BK.at(b, 0, 8), 0);
      K.place(gg, BK.at(b, 0, -8), 0);
      K.faceTo(br, gg.pos);
      K.faceTo(gg, br.pos);
      gg.setState('scripted', { pose: 'gg_lowStance', expression: 'cocky' });
      // the arena comes apart round him as he goes up
      let wrecked = false;
      const wreck = () => {
        if (wrecked) return;
        wrecked = true;
        for (const o of b.stage.obstacles) if (o.alive && !o.fixture && o.segs && Math.hypot(o.x - br.pos.x, o.z - br.pos.z) < 70) b.stage.destroyPillar(o);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          if (b.stage.lavaGeyser) b.stage.lavaGeyser(BK.at(b, br.pos.x + Math.cos(a) * 14, br.pos.z + Math.sin(a) * 14), 10);
        }
      };
      BK.give(br, 'full');
      yield* C.transform(m, {
        fighter: br, formIndex: K.formIndex(br, 'full'), witness: gg, dust: false,
        witnessLine: 'Heh... now THAT is a lot of power.',
        changeShots: [
          { at: 0, shot: (t, out) => {
            const c = br.chest();
            out.pos.copy(c).addScaledVector(fwd(br), 5.5).add(new V3(1.4, -1.2, 0));
            out.look.copy(c).add(new V3(0, 0.6, 0));
            out.fov = 50;
          } },
          { at: 0.55, shot: (t, out) => {
            out.pos.copy(br.pos).add(new V3(30, 12 + t * 4, 26));
            out.look.copy(br.chest());
            out.fov = 54;
          } },
          { at: 1.0, shot: (t, out) => {
            const c = br.chest();
            out.pos.copy(c).addScaledVector(fwd(br), 7).add(new V3(0, -1.6, 0));
            out.look.copy(c).add(new V3(0, 1.2, 0));
            out.fov = 52;
          } },
        ],
        onFrame: (fr, burstAt) => {
          if (fr === burstAt) wreck();
          if (fr % 8 === 0) b.vfx.ring(br.pos.clone().add(new V3(0, 0.4, 0)), 6 + (fr / burstAt) * 10, 0x6aff2a, 0.4, new V3(0, 1, 0));
        },
      });
      wreck();
      K.toForm(br, 'full');
      m.endShot();
      // the fight against the Full Power
      const fight = airFight(m, { dealt: GG.brolyDealtFull, legendary: { stageCap: 2, learnAt: 3 } });
      m.music('broly_wrath', 3);
      m.title(BK.CHAPTER, 'FULL POWER', 'Super Saiyan Blue Gogeta · the Legendary Super Saiyan at full power', 2.6);
      m.objective('full', 'Stand up to the Full Power', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => ((fight.floored(br) || fight.floored(gg)) && t > GG.fullMin) || t > GG.fullSeconds || m.state !== 'running';
      K.unhook(m, clock);
      if (m.state !== 'running') return;
      m.complete('full');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /* ======================================================================== F · THE DIMENSION BREAK */
  /** The world as glass, broken: the cracks round the fists, then the burst, the world gone, the light. */
  function openDimension(m, center) {
    const b = m.battle, S = b.story;
    if (S.kaleido && S.kaleido.alive) return S.kaleido;
    SL.Dimension.hideWorld(b);
    S.kaleido = SL.Dimension.kaleido(b, center, { radius: 75, in: 30 });
    m.onDispose(() => SL.Dimension.showWorld(b));
    return S.kaleido;
  }
  function closeDimension(m) {
    const b = m.battle, S = b.story;
    if (S.kaleido) S.kaleido.close(20);
    S.kaleido = null;
    SL.Dimension.showWorld(b);
  }

  P.breakthrough = {
    id: 'break',
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      const F = film(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      K.toForm(gg, 'blue');
      K.toForm(br, 'full');
      gg.controller = K.scripted();
      br.controller = K.scripted();
      // side on: Gogeta right, Broly left, both fists drawn back, coated in their colours
      const c = BK.at(b, 0, 0).add(new V3(0, GG.alt * 0.75, 0));
      gg.setPosition(c.clone().add(new V3(10, 0, 0)));
      br.setPosition(c.clone().add(new V3(-10, 0, 0)));
      for (const f of [gg, br]) {
        f.grounded = false;
        f.vel.set(0, 0, 0);
      }
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      gg.setState('scripted', { pose: 'gg_heavyW', expression: 'shout' });
      br.setState('scripted', { pose: 'br_hayW', expression: 'shout', aura: 1 });
      lens(m, (t, out) => {
        const mid = gg.chest().lerp(br.chest(), 0.5);
        out.pos.copy(mid).add(new V3(0, 1.2, 18));
        out.look.copy(mid);
        out.fov = 52;
      });
      const glowG = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x3a8aff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x5aff3a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      glowG.scale.setScalar(1.2);
      glowB.scale.setScalar(1.4);
      b.scene.add(glowG, glowB);
      const fists = () => {
        if (b.disposed || !glowG.parent) return false;
        glowG.position.copy(gg.handPos ? gg.handPos('R') : gg.chest());
        glowB.position.copy(br.handPos ? br.handPos('R') : br.chest());
        return true;
      };
      b.onTick(fists);
      const dropGlows = () => {
        b.scene.remove(glowG, glowB);
        glowG.material.dispose();
        glowB.material.dispose();
      };
      m.onDispose(() => glowG.parent && dropGlows());
      b.sfx('kiCharge', gg, { pitch: 0.8 });
      yield* F.wait(1.2);
      // they fly at each other
      gg.setState('scripted', { pose: 'gg_flyForward', expression: 'shout' });
      br.setState('scripted', { pose: 'br_flyForward', expression: 'shout', aura: 1 });
      const gt = c.clone().add(new V3(0.9, 0, 0)), bt = c.clone().add(new V3(-1, 0, 0));
      let n = 0;
      const g0 = gg.pos.clone(), b0 = br.pos.clone();
      yield () => {
        n++;
        const k = Math.min(1, n / 22);
        gg.setPosition(g0.clone().lerp(gt, k * k));
        br.setPosition(b0.clone().lerp(bt, k * k));
        if (n % 2 === 0) {
          b.vfx.trail(gg.chest(), 0x6ad0ff, 0.6, 0.3);
          b.vfx.trail(br.chest(), 0x8aff5a, 0.7, 0.3);
        }
        return k >= 1 || F.skip.on;
      };
      // the fists meet: the crack
      gg.setState('scripted', { pose: 'gg_heavy', expression: 'shout', speed: 30 });
      br.setState('scripted', { pose: 'br_hay', expression: 'shout', aura: 1, speed: 30 });
      const hit = gg.handPos ? gg.handPos('R').lerp(br.handPos('R'), 0.5) : c.clone();
      lens(m, (t, out) => {
        out.pos.copy(hit).add(new V3(0.2, 0.25, 1.8));
        out.look.copy(hit);
        out.fov = 34;
      }, { aimFree: true });
      const glass = SL.Dimension.glassBreak(b, hit, { radius: 14, cracks: 18 });
      b.slowmo(0.2, 0.9);
      b.cameraTraumaAt(hit, 0.6);
      yield* F.wait(0.9);
      // the world falls away round them
      glass.burst();
      dropGlows();
      openDimension(m, c.clone());
      SL.ScreenFX.flash(0.25, '#e8d8ff');
      const th0 = 0;
      lens(m, (t, out, el) => {
        const k = Math.min(1, (el || 0) / 2.4), a = th0 + k * Math.PI * 2, mid = gg.chest().lerp(br.chest(), 0.5);
        out.pos.set(mid.x + Math.sin(a) * 9, mid.y + 1.2, mid.z + Math.cos(a) * 9);
        out.look.copy(mid);
        out.fov = 54;
      });
      m.music('gogeta_super_rush', 4);
      yield* F.wait(2.4);
      // apart, in the light
      gg.setPosition(c.clone().add(new V3(5, 0, 0)));
      br.setPosition(c.clone().add(new V3(-5, 0, 0)));
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      m.endShot();
      b.skipRequested = false;
    },
  };

  /* ======================================================================== G · INSIDE THE DIMENSION */
  P.dimension = {
    id: 'dimension',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      const F = film(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      BK.give(gg, 'blue');
      K.toForm(gg, 'blue');
      K.toForm(br, 'full');
      const c = BK.at(b, 0, 0).add(new V3(0, GG.alt * 0.75, 0));
      if (!S.kaleido) {
        gg.setPosition(c.clone().add(new V3(5, 0, 0)));
        br.setPosition(c.clone().add(new V3(-5, 0, 0)));
      }
      openDimension(m, c.clone());
      for (const f of [gg, br]) {
        f.grounded = false;
        f.vel.set(0, 0, 0);
      }
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      // G1: in control
      const fight = airFight(m, { dealt: 0.18, legendary: { stageCap: 1, learnAt: 4 }, space: 'air' });
      m.title(BK.CHAPTER, 'THE DIMENSION', 'Gogeta in control', 2.2);
      m.objective('dim', 'Take control of the fight', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
        if (S.kaleido && b.frame % 90 === 0) S.kaleido.pulse(t % 2 < 1 ? 0xff7ad8 : 0x7affb8);
      };
      m.tickHooks.push(clock);
      yield () => (fight.floored(br) && t > GG.dimMin) || t > GG.dimSeconds || m.state !== 'running';
      K.unhook(m, clock);
      fight.off();
      if (m.state !== 'running') return;
      m.complete('dim');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      gg.controller = K.scripted();
      br.controller = K.scripted();
      // G2: FUTILE — arms folded, he leans back from the fist, and the inverted spin kick
      gg.setPosition(c.clone().add(new V3(3, 0, 0)));
      br.setPosition(c.clone().add(new V3(-6, 0, 0)));
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      gg.setState('scripted', { pose: 'gg_armsCrossed', expression: 'cocky' });
      br.setState('scripted', { pose: 'br_hayW', expression: 'shout', aura: 1 });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gogeta', 'It\'s futile.', 1.6);
      yield* F.wait(1.5);
      lens(m, (tt, out) => {
        out.pos.copy(gg.headPos()).addScaledVector(fwd(gg), -1).add(new V3(0.45, 0.1, 0));
        out.look.copy(br.chest());
        out.fov = 40;
      });
      yield* travel(b, br, c.clone().add(new V3(1.7, 0, 0)), 12);
      m.objective('futile', 'Futile', { icon: 'guard', target: 2 });
      yield* F.cue('dodge', 'Lean away from it (Dodge)', { auto: 1.2, slow: 0.3 });
      gg.setState('scripted', { pose: 'gg_leanBack', expression: 'cocky', speed: 22 });
      br.setState('scripted', { pose: 'br_hay', expression: 'shout', aura: 1, speed: 30 });
      b.vfx.ring(gg.headPos().addScaledVector(fwd(gg), -1.4), 2.4, 0x9affb8, 0.3);
      b.sfx('swing', br, { pitch: 0.5, vol: 1.2 });
      m.progress('futile', 1);
      yield* F.wait(0.4);
      lens(m, (tt, out) => {
        out.pos.copy(gg.pos).addScaledVector(fwd(gg), 1.4).addScaledVector(sideOf(gg), 2.2).add(new V3(0, -0.6, 0));
        out.look.copy(gg.chest()).add(new V3(0, 0.3, 0));
        out.fov = 52;
      });
      gg.setState('scripted', { pose: 'gg_backKickW', expression: 'focused', speed: 24 });
      yield* F.cue('heavy', 'Inverted spin kick! (Heavy)', { auto: 1.2, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_backKick', expression: 'focused', speed: 30 });
      b.vfx.impact(br.headPos(), 4.5, 0x8ad8ff);
      b.vfx.ring(br.headPos(), 4, 0x3a8aff, 0.5);
      b.sfx('punchHeavy', br, { pitch: 0.45, vol: 1.5 });
      b.cameraTraumaAt(br.chest(), 0.9);
      m.progress('futile', 2);
      br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 18 });
      yield* travel(b, br, c.clone().add(new V3(-14, 2, 2)), 18, 1);
      // G3: GOD PUNISHER
      gg.setPosition(c.clone().add(new V3(6, 0, 0)));
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      gg.setState('scripted', { pose: 'gg_punishStance', expression: 'focused' });
      const spheres = [0, 1].map(() => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x6ad8ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
        s.scale.setScalar(0.9);
        b.scene.add(s);
        return s;
      });
      const dropSpheres = () => spheres.forEach((s) => {
        if (s.parent) b.scene.remove(s);
        s.material.dispose();
      });
      m.onDispose(dropSpheres);
      const holdSpheres = () => {
        if (b.disposed || !spheres[0].parent) return false;
        spheres[0].position.copy(gg.handPos ? gg.handPos('L') : gg.chest());
        spheres[1].position.copy(gg.handPos ? gg.handPos('R') : gg.chest());
        return true;
      };
      b.onTick(holdSpheres);
      lens(m, (tt, out) => {
        const ch = gg.chest();
        out.pos.copy(ch).addScaledVector(fwd(gg), 2.8).add(new V3(0.4, -1, 0));
        out.look.copy(ch).add(new V3(0, 0.3, 0));
        out.fov = 46;
      });
      m.objective('punisher', 'God Punisher', { icon: 'rush' });
      yield* F.cue('s1', 'GOD PUNISHER (Special 1)', { auto: 1.8, slow: 0.4 });
      // the low dash, arms crossed at the waist, light trailing
      gg.setState('scripted', { pose: 'gg_lowDash', expression: 'focused' });
      lens(m, (tt, out) => {
        out.pos.copy(gg.chest()).addScaledVector(sideOf(gg), 5).add(new V3(0, 0.4, 0));
        out.look.copy(gg.chest().lerp(br.chest(), 0.3));
        out.fov = 52;
      });
      const dashTo = br.pos.clone().addScaledVector(fwd(br), 1.4).add(new V3(0, -1, 0));
      let dn = 0;
      const dashTrail = () => {
        if (b.disposed || ++dn > 20) return false;
        b.vfx.trail(gg.handPos ? gg.handPos('L') : gg.chest(), 0x6ad8ff, 0.4, 0.4);
        b.vfx.trail(gg.handPos ? gg.handPos('R') : gg.chest(), 0x8ad8ff, 0.4, 0.4);
        return true;
      };
      b.onTick(dashTrail);
      yield* travel(b, gg, dashTo, 14);
      // the somersault kick: up he goes
      gg.setState('scripted', { pose: 'gg_launch', expression: 'shout', speed: 30 });
      b.vfx.impact(br.chest().add(new V3(0, -0.4, 0)), 4, 0x8ad8ff);
      b.sfx('punchHeavy', br, { pitch: 0.5, vol: 1.3 });
      br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
      lens(m, (tt, out) => {
        out.pos.copy(gg.pos).addScaledVector(sideOf(gg), 2).add(new V3(0, -0.5, 0));
        out.look.copy(br.chest());
        out.fov = 56;
      });
      const up = br.pos.clone().add(new V3(0, 16, 0));
      yield* travel(b, br, up, 18);
      // the pursuit: he is already above him
      b.vfx.afterimage(gg.pos, gg.height, 0x8ad8ff);
      gg.setPosition(up.clone().add(new V3(1.5, 4, 1.5)));
      K.faceTo(gg, br.pos);
      gg.setState('scripted', { pose: 'gg_xArms', expression: 'focused' });
      lens(m, (tt, out) => {
        const ch = gg.chest();
        out.pos.copy(ch).addScaledVector(fwd(gg), 2.4).add(new V3(0, 0.2, 0));
        out.look.copy(ch);
        out.fov = 42;
      });
      yield* F.wait(0.7);
      // the X thrown open: a storm of blue and rainbow spheres into his chest
      gg.setState('scripted', { pose: 'gg_xOpen', expression: 'shout', speed: 24 });
      lens(m, (tt, out) => {
        out.pos.copy(gg.headPos()).addScaledVector(fwd(gg), -1.2).add(new V3(0.5, 0.4, 0));
        out.look.copy(br.chest());
        out.fov = 46;
      });
      const pal = PRISM();
      for (let i = 0; i < 18; i++) {
        b.after(i * 2, () => {
          const from = gg.handPos ? gg.handPos(i % 2 ? 'L' : 'R') : gg.chest();
          const to = br.chest().add(new V3(Math.sin(i) * 0.6, Math.cos(i * 1.3) * 0.6, Math.sin(i * 2.1) * 0.5));
          for (let k = 0; k <= 4; k++) b.vfx.trail(from.clone().lerp(to, k / 4), i % 3 ? 0x6ad8ff : pal[i % pal.length], 0.3, 0.25);
          b.after(3, () => b.vfx.explosion(to, 0.8, i % 3 ? 0x6ad8ff : pal[i % pal.length], {}));
          if (i % 3 === 0) b.sfx('kiBlast', gg, { pitch: 1.2, vol: 0.5 });
        });
      }
      yield* F.wait(0.9);
      dropSpheres();
      lens(m, (tt, out) => {
        out.pos.copy(br.chest()).add(new V3(14, 3, 10));
        out.look.copy(br.chest());
        out.fov = 54;
      });
      prismBurst(b, br.chest(), 4);
      m.complete('punisher');
      yield* F.wait(1.4);
      // G4: STARDUST FALL — up, palms down, the prismatic rain, the dome
      gg.setPosition(br.pos.clone().add(new V3(0, 9, 0)));
      gg.setState('scripted', { pose: 'gg_stardustW', expression: 'focused' });
      lens(m, (tt, out) => {
        out.pos.copy(gg.pos).add(new V3(2.4, -4, 2.4));
        out.look.copy(gg.chest());
        out.fov = 48;
      });
      m.objective('stardust', 'Stardust Fall', { icon: 'ball' });
      yield* F.cue('s2', 'STARDUST FALL (Special 2)', { auto: 1.6, slow: 0.4 });
      gg.setState('scripted', { pose: 'gg_stardustFin', expression: 'shout', speed: 20 });
      lens(m, (tt, out) => {
        out.pos.copy(gg.headPos()).add(new V3(0.6, 0.8, 0.6));
        out.look.copy(br.chest());
        out.fov = 50;
      });
      for (let i = 0; i < 30; i++) {
        b.after(i * 2, () => {
          const from = gg.handPos ? gg.handPos(i % 2 ? 'L' : 'R') : gg.chest();
          const to = br.chest().add(new V3(Math.sin(i * 1.7) * 1.2, Math.cos(i) * 0.5, Math.cos(i * 1.3) * 1.2));
          b.vfx.slash(from, to, pal[i % pal.length], 0.08, 0.03);
          if (i % 4 === 0) b.vfx.sparks(to, pal[(i + 2) % pal.length], 4, 3, 0.05);
        });
      }
      yield* F.wait(1.1);
      lens(m, (tt, out) => {
        out.pos.copy(br.chest()).add(new V3(-12, 4, 12));
        out.look.copy(br.chest().lerp(gg.chest(), 0.3));
        out.fov = 56;
      });
      prismBurst(b, br.chest(), 6);
      if (S.kaleido) S.kaleido.pulse(0xffffff);
      m.complete('stardust');
      yield* F.wait(1.4);
      // G5: SOUL PUNISHER — his mouth beam, slid over; the orb, thrown into his back
      br.setState('scripted', { pose: 'br_roarFire', expression: 'shout', aura: 1 });
      gg.setPosition(br.pos.clone().addScaledVector(fwd(br), 8));
      K.faceTo(gg, br.pos);
      lens(m, (tt, out) => {
        const mid = gg.chest().lerp(br.chest(), 0.5);
        out.pos.copy(mid).addScaledVector(sideOf(br), 9).add(new V3(0, 1, 0));
        out.look.copy(mid);
        out.fov = 52;
      });
      const beamEnd = br.headPos().addScaledVector(fwd(br), 30);
      for (let i = 0; i < 6; i++) b.after(i * 3, () => b.vfx.slash(br.headPos(), beamEnd, 0x5aff6a, 0.5, 0.2));
      b.sfx('beamFire', br, { pitch: 0.7 });
      b.vfx.afterimage(gg.pos, gg.height, 0x8ad8ff);
      gg.setPosition(br.pos.clone().addScaledVector(fwd(br), -3).add(new V3(0, 4, 0)));
      K.faceTo(gg, br.pos);
      gg.setState('scripted', { pose: 'gg_soulW', expression: 'smirk' });
      const orb = SL.Dimension.prismOrb(b, { fade: 20 });
      let orbR = 0.2, orbOn = true;
      const orbAt = () => (gg.handPos ? gg.handPos('R') : gg.chest()).add(new V3(0, orbR + 0.3, 0));
      const orbTick = () => {
        if (b.disposed || !orbOn) return false;
        orbR = Math.min(1.1, orbR + 0.03);
        orb.set(orbAt(), orbR);
        return true;
      };
      b.onTick(orbTick);
      lens(m, (tt, out) => {
        const ch = gg.chest();
        out.pos.copy(ch).addScaledVector(fwd(gg), 2.6).add(new V3(0.6, 0.6, 0));
        out.look.copy(orbAt());
        out.fov = 44;
      });
      m.objective('soul', 'Soul Punisher', { icon: 'ball' });
      yield* F.cue('ult', 'SOUL PUNISHER — throw it (Ultimate)', { auto: 1.8, slow: 0.4 });
      gg.setState('scripted', { pose: 'gg_soulThrow', expression: 'shout', speed: 30 });
      orbOn = false;
      const o0 = orbAt(), o1 = br.chest();
      let on = 0;
      yield () => {
        on++;
        const k = Math.min(1, on / 14);
        orb.set(o0.clone().lerp(o1, k), orbR);
        return k >= 1 || F.skip.on;
      };
      orb.close();
      lens(m, (tt, out) => {
        out.pos.copy(br.chest()).addScaledVector(sideOf(br), 12).add(new V3(0, 1, 0));
        out.look.copy(br.chest());
        out.fov = 54;
      });
      prismBurst(b, br.chest(), 7);
      SL.ScreenFX.flash(0.2, '#ffe8ff');
      m.complete('soul');
      yield* F.wait(1.4);
      // the smoke clears: battered, breathing — alive. And Gogeta's smile
      br.setState('scripted', { pose: 'exhausted', expression: 'hurt', aura: 0.3 });
      for (let i = 0; i < 10; i++) b.vfx.smoke.emit(br.pos.x + Math.sin(i) * 1.4, br.pos.y + 1, br.pos.z + Math.cos(i) * 1.4, 0, 0.8, 0, 0.7, 0.62, 0.8, 0.6, 1.6, 2, { grow: 1.6 });
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* F.wait(1.6);
      gg.setState('scripted', { pose: 'gg_smirk', expression: 'smirk' });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gogeta', 'Heh. Not a trace of evil in you, is there.', 2.6, { style: 'quiet' });
      yield* F.wait(2.6);
      // G6: the heel-kick, and the second fracture
      gg.setPosition(br.pos.clone().addScaledVector(fwd(br), 2.2).add(new V3(0, 0.6, 0)));
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      gg.setState('scripted', { pose: 'gg_backKickW', expression: 'focused' });
      lens(m, (tt, out) => {
        out.pos.copy(br.pos).addScaledVector(fwd(br), 1).addScaledVector(sideOf(br), 2.4).add(new V3(0, -1.4, 0));
        out.look.copy(br.chest()).add(new V3(0, 0.4, 0));
        out.fov = 54;
      });
      m.objective('heel', 'Break out of here', { icon: 'fist' });
      yield* F.cue('heavy', 'Spinning heel-kick! (Heavy)', { auto: 1.4, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_backKick', expression: 'shout', speed: 30 });
      const at = br.chest();
      b.vfx.impact(at, 5, 0x8ad8ff);
      b.sfx('punchHeavy', br, { pitch: 0.4, vol: 1.6 });
      SL.Dimension.glassBreak(b, at, { radius: 16, cracks: 20, burst: true });
      m.complete('heel');
      yield* F.wait(0.5);
      closeDimension(m);
      m.endShot();
      b.skipRequested = false;
    },
  };

  /* ======================================================================== H · BACK ON THE LAVA */
  P.ret = {
    id: 'return',
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly;
      const F = film(m);
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      if (S.kaleido) closeDimension(m);
      SL.Dimension.showWorld(b);
      K.toForm(gg, 'blue');
      K.toForm(br, 'full');
      gg.controller = K.scripted();
      br.controller = K.scripted();
      // falling out of the broken sky
      const land = BK.at(b, 0, 6);
      br.setPosition(land.clone().add(new V3(-4, 26, 0)));
      gg.setPosition(land.clone().add(new V3(6, 30, -4)));
      for (const f of [gg, br]) f.grounded = false;
      br.setState('scripted', { pose: 'tumble', expression: 'hurt' });
      gg.setState('scripted', { pose: 'gg_flyIdleSsj', expression: 'calm' });
      lens(m, (t, out) => {
        out.pos.copy(br.chest()).add(new V3(10, 3, 10));
        out.look.copy(br.chest());
        out.fov = 56;
      });
      yield* travel(b, br, land.clone().add(new V3(0, 0.1, 0)), 30);
      K.place(br, land.clone(), 0);
      b.stage.crater(land.clone(), 5, 1.2, null);
      if (b.stage.lavaGeyser) b.stage.lavaGeyser(land.clone(), 10);
      b.sfx('groundImpact', null, { at: land, vol: 1.4 });
      K.place(gg, BK.at(b, land.x + 9, land.z - 3), 0);
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      // his last green geyser
      br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', aura: 1 });
      b.vfx.ring(br.chest(), 10, 0x6aff2a, 0.6);
      b.sfx('roar', br, { pitch: 0.5, vol: 1.4 });
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* F.wait(1.4);
      // the speed-blitz uppercut: ground level, alongside him
      gg.setState('scripted', { pose: 'gg_run', expression: 'focused' });
      lens(m, (t, out) => {
        out.pos.copy(gg.pos).addScaledVector(sideOf(gg), 2.4).add(new V3(0, 0.4, 0));
        out.look.copy(gg.chest().lerp(br.chest(), 0.4));
        out.fov = 56;
      });
      yield* travel(b, gg, BK.at(b, br.pos.x + fwd(br).x * 1.4, br.pos.z + fwd(br).z * 1.4), 12, 0, true);
      br.setState('scripted', { pose: 'br_hookL', expression: 'shout', aura: 1, speed: 26 });
      m.objective('end', 'Finish the exchange', { icon: 'fist', target: 3 });
      gg.setState('scripted', { pose: 'gg_launchW', expression: 'focused' });
      yield* F.cue('light', 'Uppercut! (Light)', { auto: 1.2, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_launch', expression: 'shout', speed: 30 });
      b.vfx.impact(br.headPos(), 4, 0x8ad8ff);
      b.sfx('punchHeavy', br, { pitch: 0.5, vol: 1.4 });
      m.progress('end', 1);
      br.setState('scripted', { pose: 'tumble', expression: 'hurt' });
      yield* travel(b, br, br.pos.clone().add(new V3(0, 9, 0)), 14);
      // above him: both hands, a hammer
      b.vfx.afterimage(gg.pos, gg.height, 0x8ad8ff);
      gg.setPosition(br.pos.clone().add(new V3(0.6, 2.6, 0.6)));
      K.faceTo(gg, br.pos);
      gg.setState('scripted', { pose: 'gg_airHammerW', expression: 'shout' });
      lens(m, (t, out) => {
        out.pos.copy(br.chest()).add(new V3(0, 7, 0.01)).addScaledVector(sideOf(gg), 1.5);
        out.look.copy(br.chest());
        out.fov = 50;
      });
      yield* F.cue('heavy', 'Hammer it down! (Heavy)', { auto: 1.2, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_airHammer', expression: 'shout', speed: 30 });
      b.vfx.impact(br.headPos(), 4.5, 0x8ad8ff);
      b.sfx('punchHeavy', br, { pitch: 0.4, vol: 1.6 });
      m.progress('end', 2);
      const pit = BK.at(b, br.pos.x, br.pos.z);
      yield* travel(b, br, pit.clone(), 10);
      K.place(br, pit, br.yaw);
      b.stage.crater(pit.clone(), 9, 3, null);
      if (b.stage.lavaGeyser) b.stage.lavaGeyser(pit.clone(), 12);
      b.cameraTraumaAt(pit, 1);
      br.setState('scripted', { pose: 'br_down', expression: 'hurt' });
      // the meteor kick: from inside the crater, looking up at him diving
      gg.setPosition(pit.clone().add(new V3(1, 22, 1)));
      gg.setState('scripted', { pose: 'gg_axeW', expression: 'shout' });
      lens(m, (t, out) => {
        out.pos.copy(pit).add(new V3(2.2, 0.6, 2.2));
        out.look.copy(gg.chest());
        out.fov = 58;
      });
      yield* F.cue('heavy', 'Meteor kick! (Heavy)', { auto: 1.2, slow: 0.35 });
      gg.setState('scripted', { pose: 'gg_axe', expression: 'shout', speed: 30 });
      yield* travel(b, gg, pit.clone().add(new V3(0.5, 1.2, 0.5)), 10);
      b.vfx.ring(pit.clone().add(new V3(0, 0.6, 0)), 14, 0x3a8aff, 0.8, new V3(0, 1, 0));
      b.vfx.explosion(pit.clone().add(new V3(0, 0.8, 0)), 3, 0x6ad0ff, { smoke: true });
      b.sfx('explosionBig', null, { at: pit, vol: 1.4 });
      b.cameraTraumaAt(pit, 1);
      m.progress('end', 3);
      m.complete('end');
      yield* F.wait(1.2);
      m.endShot();
      b.skipRequested = false;
    },
  };

  /* ======================================================================== I · THE KAMEHAMEHA */
  P.kame = {
    id: 'kame',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, br = S.broly, ch = S.cheelai;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      lava(m);
      SL.Dimension.showWorld(b);
      BK.give(gg, 'blue');
      K.toForm(gg, 'blue');
      K.toForm(br, 'full');
      gg.controller = K.scripted();
      br.controller = K.scripted();
      // Broly in the crater, drained; Gogeta over him in the dark sky
      const pit = BK.at(b, 0, 6);
      if (!m.flags.pit) {
        m.flags.pit = true;
        b.stage.crater(pit.clone(), 9, 3, null);
      }
      K.place(br, BK.at(b, pit.x, pit.z), 0);
      br.setState('scripted', { pose: 'exhausted', expression: 'shock', aura: 0 });
      gg.setPosition(pit.clone().add(new V3(6, 16, -10)));
      gg.grounded = false;
      K.faceTo(gg, br.pos);
      K.faceTo(br, gg.pos);
      // terror in his eyes: the pupils come back
      if (br.model.face && br.model.face.pupilMat) br.model.face.pupilMat.color.set(0x141414);
      if (br.model._applyEyes) {
        br.model._pupilBase = 1;
        br.model._applyEyes();
      }
      m.shot((t, out) => {
        const Fp = BK.facePoint(br);
        out.pos.copy(Fp.face).addScaledVector(Fp.fwd, 0.6).add(new V3(0, 0.05, 0));
        out.look.copy(Fp.center).addScaledVector(Fp.fwd, Fp.R * 0.6);
        out.fov = 32;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      SL.Music.stop(0.8);
      b.sfx('heartbeat', br, { vol: 1.2 });
      yield* m.cine(1.6);
      // high, over his shoulders: the tiny crater far below
      lens(m, (t, out) => {
        out.pos.copy(gg.headPos()).addScaledVector(fwd(gg), -1.6).add(new V3(0, 0.8, 0));
        out.look.copy(br.chest());
        out.fov = 48;
      });
      yield* m.cine(1.4);
      // the stance: hands cupped at his hip; hold Charge
      gg.setState('free');
      b.switchPlayer(gg, { force: true, quiet: true });
      gg.setState('scripted', { pose: 'kame_hip', expression: 'cold' });
      const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x6ad0ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      b.scene.add(core);
      m.onDispose(() => {
        if (core.parent) b.scene.remove(core);
        core.material.dispose();
      });
      let power = 0, t = 0;
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.charge;
      m.limits(lim);
      b.inputLocked = false;
      b.aiLocked = true;
      m.objective('kame', 'KAMEHAMEHA: hold Charge', { icon: 'beam' });
      m.prompt('bbKame', 'charge', 'Hold Charge — the Kamehameha', { required: true, always: true, until: () => power >= 1 });
      const callouts = ['KA...', 'ME...', 'HA...', 'ME...'];
      let said = 0;
      lens(m, (tt, out, el) => {
        const k = (el || 0) * 0.5, c = gg.chest();
        out.pos.set(c.x + Math.sin(gg.yaw + 1 + k) * 3.4, c.y + 0.2, c.z + Math.cos(gg.yaw + 1 + k) * 3.4);
        out.look.copy(c);
        out.fov = 46;
      }, { subject: gg });
      const hook = () => {
        t += 1 / 60;
        const holding = !!(gg.intent && gg.intent.charge) || (SL.Input.held && SL.Input.held('charge'));
        power = U.clamp01(power + (holding ? 1 / (GG.kameHold * 60) : -0.3 / 60));
        const hp = gg.handPos ? gg.handPos('R').lerp(gg.handPos('L'), 0.5) : gg.chest();
        core.position.copy(hp);
        core.scale.setScalar(0.4 + power * 2.4);
        if (holding && b.frame % 3 === 0) b.vfx.streamInward(hp, 2 + power * 2, 0x6ad0ff, 2, 0.12, 0.3);
        while (said < callouts.length && power >= (said + 1) / (callouts.length + 1)) m.say('gogeta', callouts[said++], 0.9, { style: 'shout' });
        b.emit('struggle', { active: true, progress: 1 - power, rate: 0, label: 'KAMEHAMEHA', action: 'charge' });
      };
      m.tickHooks.push(hook);
      b.skipRequested = false;
      yield () => power >= 1 || t > 30;
      K.unhook(m, hook);
      b.emit('struggle', { active: false });
      m.limits(null);
      m.complete('kame');
      m.lock(true);
      gg.controller = K.scripted();
      // HA!
      const r = yield* m.cue('ult', 'HA! (Ultimate)', { auto: 1.6, slow: 0.4 });
      m.qteParts.push(r.pressed ? 1 : 0.6);
      gg.setState('scripted', { pose: 'kame_fire', expression: 'shout', speed: 30 });
      m.say('gogeta', 'HAAAAA!', 1.2, { style: 'shout' });
      if (core.parent) b.scene.remove(core);
      const hp = gg.chest().addScaledVector(br.chest().sub(gg.chest()).normalize(), 1);
      const dir = br.chest().sub(hp).normalize();
      // the beam: a column of blue from his palms down into the crater
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0x3ab0ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      const beamCore = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xf0fbff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      b.scene.add(beam, beamCore);
      m.onDispose(() => {
        for (const x of [beam, beamCore]) {
          if (x.parent) b.scene.remove(x);
          x.geometry.dispose();
          x.material.dispose();
        }
      });
      let len = 0;
      const beamTick = () => {
        if (b.disposed || !beam.parent) return false;
        len = Math.min(140, len + 4);
        for (const [x, w] of [[beam, 2.2], [beamCore, 0.9]]) {
          x.scale.set(w * (1 + Math.sin(b.frame * 0.6) * 0.06), len, w * (1 + Math.cos(b.frame * 0.6) * 0.06));
          x.position.copy(hp).addScaledVector(dir, len / 2);
          x.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
        }
        if (b.frame % 2 === 0) b.vfx.sparks(hp.clone().addScaledVector(dir, len), 0x8ad8ff, 5, 8, 0.1);
        return true;
      };
      b.onTick(beamTick);
      b.sfx('beamFire', gg, { pitch: 0.8, vol: 1.4 });
      // side on, the beam's path and his face
      lens(m, (tt, out) => {
        const mid = hp.clone().lerp(br.chest(), 0.5);
        out.pos.copy(mid).addScaledVector(new V3(dir.z, 0, -dir.x).normalize(), 18).add(new V3(0, 2, 0));
        out.look.copy(mid);
        out.fov = 56;
      });
      yield* m.cine(0.7);
      // inside the crater, behind his head, the blue coming
      lens(m, (tt, out) => {
        out.pos.copy(br.headPos()).addScaledVector(dir, 1).add(new V3(0.4, 0.2, 0));
        out.look.copy(hp);
        out.fov = 54;
      });
      br.setState('scripted', { pose: 'guard', expression: 'shock', aura: 0 });
      yield* m.cine(0.8);
      // the wish: the dragon's eyes, Cheelai
      const base = BK.at(b, SPOT.ship[0] + 6, SPOT.ship[1] - 6);
      if (!S.shenron && EK()) {
        S.shenron = EK().shenron(b, base, br.pos);
        S.shenron.rise(1);
        S.shenron.eyes(1);
        m.onDispose(() => S.shenron && S.shenron.dispose());
      }
      if (S.shenron) {
        lens(m, (tt, out) => {
          const h = S.shenron.headPos();
          out.pos.copy(h).add(new V3(10, -2, 10));
          out.look.copy(h);
          out.fov = 40;
        });
        yield* m.cine(0.8);
      }
      K.place(ch, BK.at(b, base.x - 6, base.z + 4), 0);
      K.faceTo(ch, S.shenron ? S.shenron.headPos() : br.pos);
      ch.setState('scripted', { pose: 'ch_wish', expression: 'shout' });
      SL.Cinema.shotOn(m, { cheelai: ch }, { subject: 'cheelai', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('cheelai', 'Send Broly back to the planet where we found him!', 2.6, { style: 'shout' });
      yield* m.cine(2.6);
      // a green flash in the crater — gone
      b.vfx.flash(br.chest(), 4, 0x6aff8a, 0.5, SL.Toon.tex.glow);
      b.vfx.ring(br.chest(), 5, 0x6aff8a, 0.5);
      b.sfx('itPop', br, { pitch: 0.6, vol: 1.2 });
      br.setHidden(true);
      br.untargetable = br.intangible = true;
      // the beam goes on down through the empty crater and away; far off, a starburst in the sky
      lens(m, (tt, out) => {
        out.pos.copy(pit).add(new V3(70, 40, 70));
        out.look.copy(pit).add(new V3(0, 10, 0));
        out.fov = 60;
      });
      b.stage.crater(pit.clone(), 12, 4, null);
      if (b.stage.lavaGeyser) b.stage.lavaGeyser(pit.clone(), 16);
      b.after(40, () => {
        b.vfx.flash(pit.clone().add(new V3(-200, 260, -300)), 60, 0xbfe8ff, 0.8, SL.Toon.tex.glow);
        b.vfx.ring(pit.clone().add(new V3(-200, 260, -300)), 80, 0xdff2ff, 1.2);
      });
      b.sfx('explosionBig', null, { at: pit, vol: 1.2, pitch: 0.6 });
      yield* m.cine(2.2);
      // he lets it go, lowers his hands, and smiles
      if (beam.parent) b.scene.remove(beam, beamCore);
      gg.setState('scripted', { pose: 'gg_victoryLook', expression: 'smirk' });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gogeta', 'Heh. So that\'s how it ends. Good.', 2.4, { style: 'quiet' });
      m.music('gogeta_super_rush', 1);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'THE ULTIMATE FUSION', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_gogeta',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'The Ultimate Fusion',
    subtitle: 'Part 8 · The lava wasteland',
    character: 'gogeta',
    stage: 'broly_lava',
    parTime: 600,
    qteLabel: 'The finish',
    rules: { allowTransform: true, allowUltimates: true },
    appearance: { gogeta: { outfit: 'gogeta_broly' } },
    blurb: 'Instant Transmission, and he is standing between Frieza and the Legendary Super Saiyan. Base, Super Saiyan, Blue — and then the two of them break the world.',
    rewards: ['Gogeta: Super Saiyan Blue', 'Broly: Full Power', 'Movie: The Ultimate Fusion'],
    setup,
    phases: [P.arrive, P.counter, P.aerial, P.beams, P.blue, P.full, P.breakthrough, P.dimension, P.ret, P.kame, P.after],
  };

  SL.data.bbGogeta = { GG };
  SL.data.missions[def.id] = def;
})();
