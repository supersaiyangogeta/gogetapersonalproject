/*
 * TRANSFORMATION CINEMATICS — shared, reusable cinematic primitives for staged
 * transformations (Frieza's four forms, Piccolo taking Nail, and whatever comes
 * after them). A transformation is one of the biggest moments in
 * Dragon Ball, so it is staged rather than assigned: camera work, dialogue, a
 * darkening sky, ground breaking up, a burst, a reaction shot from whoever is
 * standing in front of him, and only then control back to the player.
 *
 * The change itself still runs through the engine (the bossTransform technique
 * and Fighter.transformSequence), so nothing here is a special case: the same
 * helper works for any boss with forms and a transform technique.
 *
 *   yield* SL.data.cinematics.bossTransform(m, {
 *     fighter, technique: 'toSecond', witness, line, label, music,
 *   });
 *
 * Skip-safe: a skip request jumps to the end state (form applied, actors free,
 * lighting and music restored), so a skipped cinematic leaves exactly the same
 * game state as a watched one.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const C = (SL.data.cinematics = SL.data.cinematics || {});

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }

  /** Rubble and dust kicked up around a fighter while the ground objects to them (rocks false: the shake alone). */
  function quake(b, f, power, dust, rocks) {
    const c = f.pos.clone();
    b.cameraTraumaAt(f.chest(), 0.35 * power);
    if (rocks !== false && b.frame % 4 === 0) {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 5;
      const at = new V3(c.x + Math.cos(a) * r, c.y, c.z + Math.sin(a) * r);
      at.y = b.stage.heightAt(at.x, at.z);
      b.vfx.rock(at, new V3((Math.random() - 0.5) * 6, 6 + Math.random() * 10 * power, (Math.random() - 0.5) * 6), 0.2 + Math.random() * 0.3, b.stage.def.dust ? b.stage.rockColor : undefined);
      if (dust !== false) b.vfx.dust(at, 1.6, 6);
    }
  }

  /**
   * A boss transformation, staged.
   * opts: fighter, technique (key in def.boss.techniques), witness (who reacts),
   *       line (dialogue key spoken before), label (title card), music (level).
   */
  C.bossTransform = function* (m, opts) {
    const f = opts.fighter;
    const spec = (f.def.boss && f.def.boss.techniques[opts.technique]) || null;
    if (!spec) throw new Error('bossTransform: unknown technique ' + opts.technique);
    yield* C.transform(m, Object.assign({}, opts, { formIndex: spec.form, frames: spec.frames, technique: spec }));
  };

  /**
   * The staged transformation itself. Works for anybody with forms: a boss with
   * a bossTransform technique (opts.technique), or a story character who is
   * simply handed a form (Piccolo after Nail), in which case the engine's own
   * transform state runs the sequence.
   * opts.hold { pose, expression, speed, seconds, aura, shot, onFrame }: the scene's own anticipation (see below);
   * opts.dust / opts.rocks false: no dust or no stones from the quake.
   * opts.changeShots [{ at: 0..1 of the way to the burst, shot(t, out), face, aimFree, free }]: the change cut
   * as a mission wants it instead of the one circling lens; opts.onFrame(frame, burstAt, total) runs every
   * tick of the change (a film's own beats: lightning, a shaking world, things shattering).
   */
  C.transform = function* (m, opts) {
    const b = m.battle;
    const f = opts.fighter;
    const spec = opts.technique || null;
    const witness = opts.witness && opts.witness.alive ? opts.witness : null;
    const targetForm = opts.formIndex;
    const startedAt = f.formIndex;

    m.lock(true);
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
    f.setState('free');
    f.vel.set(0, 0, 0);
    if (witness) {
      witness.setState('scripted', { pose: 'idle', expression: 'shock' });
      witness.vel.set(0, 0, 0);
    }

    // 1. he takes his time about it
    const aura = f.def.forms[targetForm] && f.def.forms[targetForm].aura;
    b.stage.setMood(0.72, (aura && aura.color) || 0x2a1a3a, 0.9);
    if (opts.music !== undefined) m.music(null, opts.music);
    if (opts.line) m.say(f.def.id, SL.data.dialogue.lines[opts.line][0], 3);
    if (opts.hold) {
      // opts.hold { pose, expression, speed, seconds, aura: [from, to], shot(t, out, el), onFrame(n, frames) }: the
      // anticipation the way a scene wants it — his own stance and an aura that climbs, the scene's lens and beats —
      // instead of standing in the default push-in (2026-10-19, Vegito Blue; any caller without it is unchanged)
      const H = opts.hold, frames = Math.round((H.seconds || 3.2) * 60);
      f.setState('scripted', { pose: H.pose || 'powerCrouch', expression: H.expression || 'shout', speed: H.speed || 8, aura: H.aura ? H.aura[0] : 0.3 });
      m.shot(H.shot || ((t, out) => {
        const c = f.chest();
        camAt(out, c.clone().addScaledVector(f.forward, 5).add(new V3(1.1, 0.4, 0)), c, 46);
      }), 999, { cut: true, blendIn: 0, hold: true });
      let n = 0;
      yield () => {
        n++;
        if (H.aura) f.sd.aura = U.lerp(H.aura[0], H.aura[1], Math.min(1, n / frames));
        if (H.onFrame && !b.skipRequested) H.onFrame(n, frames);
        return n >= frames || b.skipRequested;
      };
    } else {
      m.shot((t, out) => {
        const c = f.chest();
        camAt(out, c.clone().addScaledVector(f.forward, U.lerp(6.5, 3.4, U.easeInOutCubic ? U.easeInOutCubic(t) : t)).add(new V3(1.1, 0.7, 0)), c, U.lerp(48, 40, t));
      }, 3.2, { cut: true, blendIn: 0 });
      yield* m.cine(3.2);
    }

    // 2. the change itself, driven by the engine
    if (spec) SL.Techniques[spec.type].start(f, spec, 'boss', 0);
    else f.setState('transform', { form: f.def.forms[targetForm], index: targetForm, boss: true, silent: !!opts.silent, noShots: !!(opts.changeShots && opts.changeShots.length) });
    const total = (spec && spec.frames) || (f.def.forms[targetForm].sequence || {}).length || 180;
    const burstAt = (f.def.forms[targetForm].sequence || {}).applyAt || Math.round(total * 0.6);

    // low angle, circling, while the ground gives up
    const cuts = (opts.changeShots || []).slice().sort((x, y) => x.at - y.at);
    let ci = 0;
    if (!cuts.length) {
      m.shot((t, out) => {
        const c = f.chest();
        const ang = f.yaw + Math.PI + t * 1.5;
        const r = U.lerp(5.2, 3.2, t);
        camAt(out, new V3(c.x + Math.sin(ang) * r, c.y - U.lerp(0.4, 1.1, t), c.z + Math.cos(ang) * r), c.clone().add(new V3(0, U.lerp(0.2, 0.6, t), 0)), U.lerp(44, 52, t));
      }, (burstAt / 60) * 1.02, { cut: true, blendIn: 0 });
    }
    let frames = 0;
    const hook = () => {
      frames++;
      while (ci < cuts.length && frames >= cuts[ci].at * burstAt) {
        const c = cuts[ci++];
        // c.free: a deliberate close-up inside his own reach (the teeth, the brow) that no safety pass moves
        m.shot(c.shot, 999, { cut: true, blendIn: 0, hold: true, subject: c.free ? null : f, face: !!c.face, aimFree: !!c.aimFree });
      }
      if (opts.onFrame) opts.onFrame(frames, burstAt, total);
      // opts.dust / opts.rocks false: a reveal that must stay clean (Vegito Blue, 2026-10-19: the haze and the stones
      // thrown past the lens cluttered it)
      quake(b, f, 0.4 + (frames / total) * 0.9, opts.dust, opts.rocks);
    };
    m.tickHooks.push(hook);
    yield () => f.formIndex >= targetForm || b.skipRequested || frames > total + 120;

    // 3. the burst: a flash in the aura's colour, a shockwave, and the shape everybody was afraid of.
    // Kept small (2026-10-02): an explosion's glow is ~3x its radius, and the old radius-7 white core with
    // the lens 2.4 m away whited out the frame on every story transformation
    const tint = '#' + new THREE.Color((aura && aura.color) || 0xffffff).lerp(new THREE.Color(0xffffff), 0.5).getHexString();
    SL.ScreenFX.flash(0.35, tint);
    b.vfx.ring(f.pos.clone().add(new V3(0, 0.4, 0)), 16, (aura && aura.color) || 0xff3a6a, 0.9, new V3(0, 1, 0));
    b.vfx.explosion(f.pos.clone().add(new V3(0, 1, 0)), 1, (aura && aura.color) || 0xffffff, { smoke: true });
    b.cameraTraumaAt(f.chest(), 1);
    b.sfx('explosionBig', f, { vol: 1.1 });
    m.shot((t, out) => {
      const c = f.chest();
      camAt(out, c.clone().addScaledVector(f.forward, U.lerp(4.4, 5.4, t)).add(new V3(0, U.lerp(-0.5, 0.6, t), 0)), c, U.lerp(38, 44, t));
    }, 2.6, { cut: true, blendIn: 0 });
    yield* m.cine(2.6);
    const i = m.tickHooks.indexOf(hook);
    if (i >= 0) m.tickHooks.splice(i, 1);

    // 4. the reaction, because that is what sells it
    if (witness) {
      m.shot((t, out) => camAt(out, witness.chest().clone().addScaledVector(witness.forward, 2.2).add(new V3(-0.8, 0.3, 0)), witness.chest(), 40), 2.4, { cut: true, blendIn: 0 });
      if (opts.witnessLine) m.say(witness.def.id, opts.witnessLine, 2.2);
      yield* m.cine(2.4);
    }

    // 5. and back to the fight
    b.stage.clearMood(1);
    m.endShot();
    if (f.formIndex < targetForm) f.applyForm(targetForm); // skipped: land on the same state
    f.setState('free');
    if (witness) witness.setState('free');
    m.flags.transformed = (m.flags.transformed || 0) + 1;
    b.emit('transformCinematic', { fighter: f, from: startedAt, to: targetForm, skipped: !!b.skipRequested });
    b.skipRequested = false;
  };
})();
