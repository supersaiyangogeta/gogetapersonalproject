/*
 * SCENES — Vegeta's first two kills on Namek (human playtest round 2).
 *
 *   vegeta_kills_cui       "Look — behind you." The trick, the pose, the fireworks.
 *   vegeta_kills_dodoria   He runs, and it does not matter.
 *
 * The owner asked for Cui's death to be a Vegeta moment rather than a generic kill,
 * and found Dodoria's death shot from so high above that the death itself was lost.
 * Both are now short storyboards (about ten seconds each):
 *   - Cui: Vegeta walks up on a kneeling Cui, points past him; Cui turns; the prince
 *     raises his palm (from the ground, looking up at him — the camera that says he has
 *     become terrifyingly sure of himself); Cui turns back into it.
 *   - Dodoria: he bolts into the sky; the camera stays level with the chase and square
 *     to it, so Vegeta, the wave and Dodoria share one frame, and the explosion happens
 *     where the camera is looking.
 * The finishing wave is a real engine beam pinned to the victim; the victim is made
 * intangible for the beat so nothing knocks him out of the shot. Skipping lands on the
 * same end state as watching.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  const PRINCE_WAVE = {
    id: 'princeWave', name: 'Energy Wave', type: 'beam', damage: [0, 0], radius: [0.7, 0.7], speed: 90, range: 60, sustain: 50,
    color: 0x8fc8ff, core: 0xffffff, oneHand: true, style: { rings: 1, ringColor: 0xd8ecff, ringSpeed: 1.4 },
  };

  /** The end of someone Vegeta has finished with: a flash where they are, and nothing left. */
  function obliterate(ctx, f, color) {
    const b = ctx.b;
    const at = f.chest();
    b.vfx.explosion(at, 6, color, { smoke: true });
    b.vfx.flash(at, 9, 0xffffff, 0.3, SL.Toon.tex.glow);
    b.vfx.ring(at, 7, color, 0.5);
    b.sfx('explosionBig', null, { at, vol: 1.2 });
    b.cameraTraumaAt(at, 0.8);
    SL.ScreenFX.flash(0.4, '#ffffff');
    f.setHidden(true);
    return at;
  }
  function gone(f, by) {
    if (!f) return;
    f.intangible = false;
    f.cannotDie = false;
    f.infiniteHp = false;
    if (f.alive) {
      f.hp = 0;
      f._ko(by || null, { dir: new V3(0, 1, 0) });
    }
    f.alive = false;
    f.setHidden(true);
    f.untargetable = true;
  }

  S.vegeta_kills_cui = {
    id: 'vegeta_kills_cui',
    cast: (m) => ({ vegeta: m.battle.story.vegeta, cui: m.battle.story.cui }),
    music: { song: null, level: 0 },
    events: [
      // Cui on his knees; the prince walks up on him, taking his time
      {
        call: (ctx) => {
          const { cui, vegeta } = ctx.cast;
          cui.intangible = true;
          cui.untargetable = true;
          cui.setHidden(false);
          vegeta.untargetable = true;
        },
        place: { who: 'cui', at: 'vegeta', local: [0, 0, 7], face: 'vegeta' },
        hold: 0,
      },
      {
        pose: [
          { who: 'cui', pose: 'defeatKneel', face: 'hurt' },
          { who: 'vegeta', pose: 'run', face: 'smirk', speed: 2.5 },
        ],
        // low behind Cui: the prince coming, bigger every step
        cam: { from: { at: 'cui', local: [0.7, 0.1, -1.5] }, look: { at: 'vegeta', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'cui', line: 'W-wait, Vegeta! We can come to an arrangement! We are old friends!', duration: 3 },
        move: { who: 'vegeta', at: 'cui', local: [0, 0, 3.2], face: 'cui', seconds: 2.4, ease: 'linear' },
        hold: 0.5,
      },
      // the trick
      {
        pose: [{ who: 'vegeta', pose: 'v_victoryPoint', face: 'angry' }],
        cam: { from: { at: 'vegeta', local: [1.2, -0.3, 2.2] }, look: { at: 'vegeta', off: [0, 0.25, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Look! Behind you — Lord Frieza!', duration: 1.8, style: 'shout' },
        hold: 1.6,
      },
      // Cui turns to look at nothing
      {
        call: (ctx) => {
          const c = ctx.cast.cui;
          c.yaw += Math.PI;
          c.prevYaw = c.yaw;
        },
        pose: [{ who: 'cui', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'cui', local: [0.8, 0.35, -1.2] }, look: { at: 'cui', local: [0, 0.5, 16] }, fov: 46 },
        say: { who: 'cui', line: 'L-Lord Frieza...?', duration: 1.2, style: 'quiet' },
        hold: 1.2,
      },
      // THE POSE: from the ground, looking up at him. The palm comes up. He is enjoying this.
      {
        pose: [{ who: 'vegeta', pose: 'v_palmExecute', face: 'smirk' }],
        sfx: { name: 'kiUp', who: 'vegeta', pitch: 1.1, vol: 0.8 },
        cam: { from: { at: 'vegeta', local: [1.9, -1.0, 1.2] }, to: { at: 'vegeta', local: [1.6, -1.0, 1.0] }, look: { at: 'vegeta', off: [0, 0.35, 0] }, fov: 42, fov2: 36 },
        tick: (ctx) => {
          const v = ctx.cast.vegeta;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(v.handPos('R'), 1.3, 0x8fc8ff, 2, 0.12, 0.3);
        },
        hold: 1.6,
      },
      // Cui turns back into it
      {
        call: (ctx) => {
          const c = ctx.cast.cui, v = ctx.cast.vegeta;
          c.yaw = c.prevYaw = Math.atan2(v.pos.x - c.pos.x, v.pos.z - c.pos.z);
        },
        pose: [{ who: 'cui', pose: 'hitBody', face: 'shock' }],
        cam: { from: { at: 'cui', local: [0.25, 0.12, 0.9] }, look: { at: 'cui', off: [0, 0.25, 0] }, fov: 34 },
        hold: 0.6,
      },
      // the wave, from the side: both of them in frame, and it ends on him
      {
        call: (ctx) => {
          SL.Cinema.beam(ctx, ctx.cast.vegeta, ctx.cast.cui, PRINCE_WAVE);
          ctx.b.sfx('kiBlastBig', ctx.cast.vegeta, { vol: 1.1 });
        },
        cam: { from: { at: 'vegeta', local: [5.5, 0.3, 1.6] }, look: { at: 'vegeta', local: [0, 0.2, 1.6] }, fov: 50 },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xd8ecff),
        hold: 0.7,
      },
      {
        call: (ctx) => {
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
          const at = obliterate(ctx, ctx.cast.cui, 0x8fc8ff);
          ctx.b.emit('cuiKilled', { at, vegeta: ctx.cast.vegeta.pos.clone() });
        },
        slow: { scale: 0.4, seconds: 0.8 },
        hold: 1.4,
      },
      // the smoke, and the line
      {
        pose: [{ who: 'vegeta', pose: 'v_chinUp', face: 'smirk' }],
        cam: { from: { at: 'vegeta', local: [0.6, -0.7, 1.6] }, look: { at: 'vegeta', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'How pretty. Fireworks.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { cui, vegeta } = ctx.cast;
      if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
      gone(cui, vegeta);
      if (vegeta) {
        vegeta.untargetable = false;
        vegeta.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      }
      ctx.m.flags.cuiKilled = true;
    },
  };

  S.vegeta_kills_dodoria = {
    id: 'vegeta_kills_dodoria',
    cast: (m) => ({ vegeta: m.battle.story.vegeta, dodoria: m.battle.story.dodoria }),
    music: { song: null, level: 0 },
    events: [
      // he bolts, straight up and away. The camera stays level with it, not above it.
      {
        call: (ctx) => {
          const { dodoria, vegeta } = ctx.cast;
          dodoria.intangible = true;
          dodoria.untargetable = true;
          vegeta.untargetable = true;
          const away = dodoria.pos.clone().sub(vegeta.pos).setY(0).normalize();
          ctx.flyFrom = dodoria.pos.clone();
          ctx.flyTo = dodoria.pos.clone().addScaledVector(away, 9).add(new V3(0, 6, 0));
          ctx.b.vfx.dust(dodoria.pos, 3, 14);
          ctx.b.sfx('dash', dodoria, { vol: 1.1 });
        },
        pose: [
          { who: 'dodoria', pose: 'flyUp', face: 'hurt' },
          { who: 'vegeta', pose: 'v_chinUp', face: 'angry' },
        ],
        // beside Vegeta at head height, looking where Dodoria is going
        cam: { from: { at: 'vegeta', local: [4.5, 0.8, -1.5] }, look: { at: 'dodoria' }, fov: 50 },
        say: { who: 'vegeta', line: 'And where do you think you are going?', duration: 1.8 },
        tick: (ctx, t) => {
          const d = ctx.cast.dodoria;
          const k = Math.min(1, t / 1.3);
          d.setPosition(ctx.flyFrom.clone().lerp(ctx.flyTo, 1 - (1 - k) * (1 - k)));
          d.grounded = false;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(d.chest(), 0xffc0e0, 0.5, 0.3);
        },
        hold: 1.4,
      },
      // the palm comes up at him; he is still in the frame, above and behind
      {
        call: (ctx) => {
          const { dodoria, vegeta } = ctx.cast;
          vegeta.yaw = vegeta.prevYaw = Math.atan2(dodoria.pos.x - vegeta.pos.x, dodoria.pos.z - vegeta.pos.z);
        },
        pose: [{ who: 'vegeta', pose: 'v_palmExecute', face: 'smirk' }],
        cam: { from: { at: 'vegeta', local: [0.8, 0.3, -2.3] }, look: { at: 'dodoria' }, fov: 46 },
        tick: (ctx) => {
          const d = ctx.cast.dodoria;
          d.setPosition(ctx.flyTo.clone().add(new V3(0, Math.sin(ctx.b.frame * 0.2) * 0.05, 0)));
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(ctx.cast.vegeta.handPos('R'), 1.2, 0x8fc8ff, 2, 0.12, 0.3);
        },
        hold: 1,
      },
      // the wave: square to the line, both men and the whole beam in one frame
      {
        call: (ctx) => {
          const { dodoria, vegeta } = ctx.cast;
          SL.Cinema.beam(ctx, vegeta, dodoria, Object.assign({}, PRINCE_WAVE, { radius: [1, 1], speed: 80 }));
          ctx.b.sfx('kiBlastBig', vegeta, { vol: 1.3, pitch: 0.8 });
          // the camera goes to the side of the line between them, far enough to hold both
          const mid = vegeta.chest().lerp(dodoria.chest(), 0.5);
          const line = dodoria.chest().sub(vegeta.chest());
          const side = new V3(-line.z, 0, line.x).normalize();
          // scene points the camera can name: where the wide frame stands and what it looks at
          ctx.cast.wide = { pos: mid.clone().addScaledVector(side, Math.max(12, line.length() * 1.1)).add(new V3(0, -1, 0)) };
          ctx.cast.mid = { pos: mid };
        },
        cam: { from: { at: 'wide' }, look: { at: 'mid' }, fov: 50 },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xd8ecff),
        hold: 1.1,
      },
      {
        call: (ctx) => {
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
          const at = obliterate(ctx, ctx.cast.dodoria, 0xff9fd0);
          ctx.b.emit('dodoriaKilled', { at, camera: ctx.b.camera.pos.clone(), look: ctx.b.camera.look.clone() });
        },
        slow: { scale: 0.45, seconds: 0.9 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const { dodoria, vegeta } = ctx.cast;
      if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
      gone(dodoria, vegeta);
      if (vegeta) {
        vegeta.untargetable = false;
        vegeta.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      }
      ctx.m.flags.dodoriaKilled = true;
    },
  };
})();
