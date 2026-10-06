/*
 * SCENES — the end of Frieza on Namek.
 *
 *   frieza_saucer_cut   the Death Saucer he threw comes back through him
 *   goku_spares_frieza  he begs; Goku answers him, turns his back, and then gives him
 *                       enough energy to leave
 *   frieza_betrayal     pride: the emperor of the universe fires at the man who spared him
 *   frieza_left_behind  the last look at him — beaten, buried, and ALIVE (he is at Earth in
 *                       Chapter 5, so nothing here may kill him)
 *
 * The mercy is the point of the sequence, so it is staged as one: Goku walks away with his
 * back to him, the camera stays on Frieza while he begs, and the energy is given over the
 * shoulder rather than declared to his face.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, frieza: s.frieza };
  };
  /** Store a computed shot as pseudo-actors the cam events can address. */
  function shot(ctx, name, s) {
    ctx.cast[name] = { pos: s.pos };
    ctx.cast[name + 'At'] = { pos: s.look };
    return s;
  }
  /** Half a body on the ground: the silhouette, the dust, and nothing graphic. */
  function halve(b, fz) {
    fz.auraOff = true; // he stops burning the moment it goes through him
    if (fz.model.setHalved) fz.model.setHalved(true);
    if (fz.model.setBattered) fz.model.setBattered(true);
    b.vfx.dust(fz.pos, 3.2, 18);
    b.vfx.debrisBurst(fz.chest(), 12, 0x8a2a3a, 8, 0.2);
  }

  S.frieza_saucer_cut = {
    id: 'frieza_saucer_cut',
    cast,
    events: [
      // the disc has stopped caring whose side it is on, and he is still talking
      {
        pose: [
          { who: 'frieza', pose: 'fz_saucer', face: 'shout' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'frieza', local: [1.6, 0.5, 2.6] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'frieza', line: 'Hold still and die, monkey!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      // Goku sees it coming back before he does
      {
        pose: [{ who: 'goku', pose: 'guard', face: 'shock' }],
        cam: { from: { at: 'goku', local: [0.9, 0.5, 2.2] }, look: { at: 'frieza', off: [0, 0.6, 0] }, fov: 42 },
        say: { who: 'goku', line: 'Frieza — behind you! MOVE!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // the cut: a line of light across the frame, and the camera cuts away on the flash
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          const c = fz.chest();
          const across = c.clone().add(new V3(-8, 0.4, 0));
          for (let i = 0; i <= 16; i++) b.vfx.trail(across.clone().lerp(c.clone().add(new V3(8, -0.4, 0)), i / 16), 0xffe066, 0.5, 0.35);
          b.vfx.flash(c, 4, 0xffffff, 0.3, SL.Toon.tex.glow);
          b.cameraTraumaAt(c, 0.7);
          b.sfx('guardBreak', fz, { vol: 1.2, pitch: 1.3 });
        },
        pose: [{ who: 'frieza', pose: 'hitHeavy', face: 'shock', speed: 6 }],
        screen: { flash: 0.5, color: '#fff4c0' },
        slow: { scale: 0.35, seconds: 0.9 },
        cam: { from: { at: 'frieza', local: [3.4, 0.2, 0.4] }, look: { at: 'frieza', off: [0, 0.4, 0] }, fov: 38 },
        hold: 1.4,
      },
      // he goes down, and what is left of him is a silhouette in the dust
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          halve(b, fz);
          fz.setPosition(ctx.b.stage.hasGround ? fz.pos.clone().setY(b.stage.heightAt(fz.pos.x, fz.pos.z)) : fz.pos);
          b.sfx('groundImpact', fz, { vol: 1 });
          ctx.m.flags.friezaHalved = true;
        },
        pose: [{ who: 'frieza', pose: 'lieBack', face: 'ko', speed: 3 }],
        sfx: { name: 'roar', who: 'frieza', vol: 1.1, pitch: 1.4 },
        cam: { from: { at: 'frieza', off: [2.2, 0.6, 2.4] }, to: { at: 'frieza', off: [1.5, 0.4, 1.7] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 44, fov2: 40 },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'goku', local: [0.6, 0.35, 1.5] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'I told you to move.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { m, cast: c, b } = ctx;
      const fz = c.frieza;
      if (fz) {
        halve(b, fz);
        fz.cannotDie = true;
        fz.untargetable = true;
        fz.hp = Math.max(1, Math.round(fz.hpMax * 0.04));
        fz.setState('scripted', { pose: 'lieBack', expression: 'ko' });
        fz.auraOff = true;
      }
      if (c.goku) c.goku.setState('free');
      m.flags.friezaHalved = true;
    },
    clearMood: false,
  };

  S.goku_spares_frieza = {
    id: 'goku_spares_frieza',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      // on the ground, and begging for the first time in his life
      {
        pose: [
          { who: 'frieza', pose: 'lieBack', face: 'hurt' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'frieza', off: [1.3, 0.3, 1.4] }, to: { at: 'frieza', off: [1, 0.26, 1.1] }, look: { at: 'frieza:head' }, fov: 40, fov2: 36 },
        say: { who: 'frieza', line: 'Wait! Please... help me! I\'m begging you!', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      // the answer, with his back already turning
      {
        call: (ctx) => shot(ctx, 'over', SL.Cinema.overShoulder(ctx.cast.goku, ctx.cast.frieza, { fov: 38, back: 2.4, side: 1, height: 0.8, lookUp: -0.3 })),
        pose: [{ who: 'goku', pose: 'idle', face: 'shout' }],
        cam: { from: { at: 'over' }, look: { at: 'overAt' }, fov: 38 },
        say: { who: 'goku', line: 'How many times have people begged you for mercy, and you killed them anyway?!', duration: 4.6, style: 'shout' },
        hold: 4.8,
      },
      // he walks away. The camera stays on the ground with Frieza.
      {
        call: (ctx) => {
          const { goku, frieza } = ctx.cast;
          ctx.walkFrom = goku.pos.clone();
          const away = goku.pos.clone().sub(frieza.pos).setY(0).normalize();
          const to = goku.pos.clone().addScaledVector(away, 7);
          to.y = ctx.b.stage.heightAt(to.x, to.z);
          ctx.walkTo = to;
          goku.yaw = goku.prevYaw = Math.atan2(away.x, away.z);
        },
        pose: [{ who: 'goku', pose: 'run', face: 'grit', speed: 0.6 }],
        tick: (ctx, t) => {
          const g = ctx.cast.goku;
          g.setPosition(ctx.walkFrom.clone().lerp(ctx.walkTo, U.clamp01(t / 3.2)));
        },
        cam: { from: { at: 'frieza', off: [1.8, 0.6, 2.4] }, to: { at: 'frieza', off: [2.4, 0.9, 3.2] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 42, fov2: 46 },
        say: { who: 'frieza', line: 'You can\'t leave me here! Not like this!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      // and he stops
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 2 }],
        music: { level: 1 },
        cam: { from: { at: 'goku', local: [0.7, 0.4, 1.8] }, to: { at: 'goku', local: [0.5, 0.35, 1.4] }, look: { at: 'goku:head' }, fov: 38, fov2: 34 },
        hold: 2.6,
      },
      // the energy, given over his shoulder
      {
        call: (ctx) => {
          const b = ctx.b, { goku, frieza } = ctx.cast;
          goku.yaw = goku.prevYaw = Math.atan2(frieza.pos.x - goku.pos.x, frieza.pos.z - goku.pos.z);
          const from = goku.handPos('R');
          const to = frieza.chest();
          for (let i = 0; i <= 14; i++) b.vfx.trail(from.clone().lerp(to, i / 14), 0x9fe4ff, 0.45, 0.6);
          b.vfx.flash(to, 3, 0xd8f4ff, 0.5, SL.Toon.tex.glow);
          b.vfx.streamInward(to, 2.4, 0x9fe4ff, 8, 0.14, 0.5);
          b.sfx('kiUp', goku, { vol: 0.9, pitch: 0.8 });
        },
        pose: [
          { who: 'goku', pose: 'blastR', face: 'calm', speed: 3 },
          { who: 'frieza', pose: 'lieBack', face: 'shock' },
        ],
        cam: { from: { at: 'goku', local: [1.5, 0.6, 2.2] }, look: { at: 'frieza', off: [0, 0.4, 0] }, fov: 44 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'goku', local: [0.55, 0.35, 1.4] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'That should be enough energy for you to get out of here. I don\'t want to see you ever again.', duration: 5, style: 'quiet' },
        hold: 5.2,
      },
      // he leaves for real this time
      {
        call: (ctx) => {
          const { goku, frieza } = ctx.cast;
          const away = goku.pos.clone().sub(frieza.pos).setY(0).normalize();
          goku.yaw = goku.prevYaw = Math.atan2(away.x, away.z);
          ctx.liftFrom = goku.pos.clone();
          ctx.liftTo = goku.pos.clone().addScaledVector(away, 6).add(new V3(0, 3.5, 0));
        },
        pose: [{ who: 'goku', pose: 'flyForward', face: 'calm' }],
        tick: (ctx, t) => {
          const g = ctx.cast.goku;
          g.setPosition(ctx.liftFrom.clone().lerp(ctx.liftTo, U.clamp01(t / 2.4)));
          g.grounded = false;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(g.chest(), 0xffe066, 0.5, 0.3);
        },
        cam: { from: { at: 'frieza', off: [2.6, 1.4, 3.4] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 46 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      if (c.frieza) {
        c.frieza.ki = Math.max(c.frieza.ki, 60);
        c.frieza.setState('scripted', { pose: 'lieBack', expression: 'angry' });
        c.frieza.auraOff = true;
      }
      if (c.goku) c.goku.setState('free');
      m.flags.mercyGiven = true;
    },
    clearMood: false,
  };

  S.frieza_betrayal = {
    id: 'frieza_betrayal',
    cast,
    events: [
      // the pride talking, quietly, while the man who spared him flies away
      {
        pose: [{ who: 'frieza', pose: 'lieBack', face: 'angry' }],
        music: { song: null, level: 0 },
        cam: { from: { at: 'frieza', off: [1.2, 0.26, 1.3] }, to: { at: 'frieza', off: [0.95, 0.22, 1.05] }, look: { at: 'frieza:head' }, fov: 38, fov2: 34 },
        say: { who: 'frieza', line: 'I am... the emperor of the universe...', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          b.vfx.streamInward(fz.handPos('R'), 2, 0xc060ff, 8, 0.16, 0.5);
          b.sfx('kiCharge', fz, { vol: 1, pitch: 0.7 });
        },
        pose: [{ who: 'frieza', pose: 'lieBack', face: 'shout', speed: 4 }],
        cam: { from: { at: 'frieza', off: [1, 0.24, 1.1] }, look: { at: 'frieza:head' }, fov: 34 },
        say: { who: 'frieza', line: 'I will NOT... be beaten by a Saiyan! DIE!', duration: 3, style: 'shout' },
        hold: 3,
      },
      // the wave goes up after him
      {
        call: (ctx) => {
          const b = ctx.b, { frieza, goku } = ctx.cast;
          const from = frieza.handPos('R');
          const to = goku.chest();
          for (let i = 0; i <= 20; i++) b.vfx.trail(from.clone().lerp(to, i / 20), i % 3 ? 0xc060ff : 0xf0e0ff, 1.1, 0.5);
          b.vfx.flash(from, 5, 0xe8d0ff, 0.4, SL.Toon.tex.glow);
          b.sfx('beamFire', frieza, { vol: 1.3, pitch: 0.8 });
          b.cameraTraumaAt(from, 0.6);
        },
        screen: { flash: 0.35, color: '#e8d0ff' },
        cam: { from: { at: 'frieza', off: [-3.4, 1.2, 4.6] }, to: { at: 'frieza', off: [-3.8, 2, 5.4] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 50, fov2: 54 },
        hold: 1.8,
      },
      // he hears it coming
      {
        pose: [{ who: 'goku', pose: 'flyIdle', face: 'shock', speed: 8 }],
        cam: { from: { at: 'goku', local: [0.6, 0.3, 1.6] }, look: { at: 'goku:head' }, fov: 36 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'goku', pose: 'guard', face: 'shout', speed: 6 }],
        call: (ctx) => {
          const { goku, frieza } = ctx.cast;
          goku.yaw = goku.prevYaw = Math.atan2(frieza.pos.x - goku.pos.x, frieza.pos.z - goku.pos.z);
          ctx.b.cameraTraumaAt(goku.chest(), 0.5);
        },
        cam: { from: { at: 'goku', local: [0.8, 0.4, 2] }, to: { at: 'goku', local: [0.6, 0.35, 1.5] }, look: { at: 'goku:head' }, fov: 40, fov2: 34 },
        say: { who: 'goku', line: 'YOU FOOL!!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      if (c.goku) c.goku.setState('free');
      if (c.frieza) c.frieza.setState('scripted', { pose: 'fz_aim', expression: 'shout' });
      m.flags.betrayal = true;
    },
    clearMood: false,
  };

  S.frieza_left_behind = {
    id: 'frieza_left_behind',
    cast,
    events: [
      // what is left of him: down, burning, and still breathing (Chapter 5 needs him)
      {
        call: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          b.vfx.dust(fz.pos, 5, 20);
          if (fz.model.setBattered) fz.model.setBattered(true);
        },
        pose: [{ who: 'frieza', pose: 'lieBack', face: 'ko' }],
        mood: { amount: 0.55, color: 0x5a1c10, seconds: 1.2 },
        cam: { from: { at: 'frieza', off: [1.6, 0.4, 1.8] }, to: { at: 'frieza', off: [4.2, 2, 5.2] }, look: { at: 'frieza', off: [0, 0.3, 0] }, fov: 46, fov2: 52, ease: 'out' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'flyIdle', face: 'hurt', speed: 2 }],
        cam: { from: { at: 'goku', local: [0.8, 0.4, 2.2] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'I gave you the way off this planet. You threw it at my back.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const fz = c.frieza;
      if (fz) {
        // CANON CONTINUITY: he is beaten and buried here, never killed — Chapter 5 is Frieza
        // arriving at Earth in a rebuilt body
        fz.hp = Math.max(1, Math.round(fz.hpMax * 0.02));
        fz.alive = true;
        fz.cannotDie = true;
        fz.untargetable = true;
        fz.setState('scripted', { pose: 'lieBack', expression: 'ko' });
        fz.auraOff = true;
      }
      if (c.goku) c.goku.setState('free');
      m.flags.friezaSurvivedNamek = true;
    },
    clearMood: false,
  };
})();
