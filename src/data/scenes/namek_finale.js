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
  /** The betrayal's wave has reached him (or the scene was skipped): its per-frame trail stops. */
  function waveDone(ctx) {
    const i = ctx.waveHook ? ctx.m.tickHooks.indexOf(ctx.waveHook) : -1;
    if (i >= 0) ctx.m.tickHooks.splice(i, 1);
    ctx.waveHook = null;
  }
  /** Half a body on the ground: the silhouette, the dust, and nothing graphic. */
  function halve(b, fz) {
    fz.auraOff = true; // he stops burning the moment it goes through him
    if (fz.model.setHalved) fz.model.setHalved(true);
    if (fz.model.setBattered) fz.model.setBattered(true);
    b.vfx.dust(fz.pos, 3.2, 18);
    b.vfx.debrisBurst(fz.chest(), 12, 0x8a2a3a, 8, 0.2);
  }

  /*
   * GOKU DECIDES TO STOP (Namek saga brief, phase twelve; before the saucers, as in the story): Frieza
   * cannot hold one hundred percent any more; Goku sees it, lets the aura down and tells him it is over.
   * Frieza will not have it. Goku turns to go — and the disc comes up over Frieza's hand behind him.
   */
  S.goku_its_over = {
    id: 'goku_its_over',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza, field: s.field };
    },
    events: [
      // the fight has slowed to nothing: Frieza bent over, breathing, steam coming off him
      {
        pose: [
          { who: 'frieza', pose: 'exhausted', face: 'hurt', aura: 0.2 },
          { who: 'goku', pose: 'guard', face: 'cold', aura: 0.5 },
        ],
        cam: { subject: 'frieza', focus: 'full', angle: 'three' },
        tick: (ctx) => {
          const b = ctx.b, fz = ctx.cast.frieza;
          if (b.frame % 8 === 0) b.vfx.smoke.emit(fz.chest().x, fz.chest().y + 0.2, fz.chest().z, 0, 1.6, 0, 0.85, 0.82, 0.9, 0.3, 0.2, 0.7, { grow: 1.4, drag: 1 });
        },
        hold: 2.4,
      },
      // Goku watches; the guard comes down, the gold settles to almost nothing
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 2, aura: 0.15 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        hold: 1.8,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'ots', over: 'frieza', fov: 26 },
        say: { who: 'goku', line: 'It\'s over. You can stop now.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // anger, and under it, disbelief
      {
        pose: [{ who: 'frieza', pose: 'fz_brace', face: 'angry', speed: 4 }],
        cam: { subject: 'frieza', focus: 'closeup', angle: 'front' },
        say: { who: 'frieza', line: 'You think YOU can decide when this ends?', duration: 3 },
        hold: 3.2,
      },
      // he turns away, ready to leave — no smile, nothing won
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          g.yaw = g.prevYaw = g.yaw + 2.4;
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'serious', aura: 0.15 }],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side' },
        hold: 1.8,
      },
      // behind his back, a disc over Frieza's hand — thin, bright, the edge of it clear
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          const top = fz.chest().add(new V3(0, 1.1, 0));
          ctx.b.vfx.ring(top, 1.1, 0xff8ad8, 0.9);
          ctx.b.vfx.flash(top, 1.4, 0xffc0f0, 0.5, SL.Toon.tex.glow);
        },
        pose: [{ who: 'frieza', pose: 'fz_saucerW', face: 'shout', speed: 6, aura: 0.6 }],
        sfx: { name: 'kiCharge', who: 'frieza', vol: 1, pitch: 1.3 },
        cam: { from: { at: 'frieza', local: [-0.9, -0.3, -2.4] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 44 },
        hold: 1.6,
      },
      // he feels it, turns, and goes up and back to give himself room
      {
        call: (ctx) => {
          const g = ctx.cast.goku, fz = ctx.cast.frieza, b = ctx.b;
          g.yaw = g.prevYaw = Math.atan2(fz.pos.x - g.pos.x, fz.pos.z - g.pos.z);
          // where the saucer fight starts him: two metres up, ten back (namek_end P.saucers)
          const p = ctx.cast.field.pos.clone().add(new V3(0, 0, 10));
          p.y = b.stage.heightAt(p.x, p.z) + 2;
          ctx.cast.room = { pos: p };
          g.grounded = false;
        },
        // backing off facing it, never turning his back on it again
        move: { who: 'goku', at: 'room', seconds: 0.6, ground: false, face: 'frieza', ease: 'out' },
        pose: [{ who: 'goku', pose: 'flyBack', face: 'cold', aura: 0.6 }],
        cam: { subject: 'goku', with: 'frieza', focus: 'full', angle: 'side' },
      },
      {
        pose: [{ who: 'goku', pose: 'flyIdle', face: 'cold', aura: 0.6 }],
        hold: 0.3,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      if (c.goku) c.goku.storySpace = null;
      m.flags.itsOver = true;
    },
  };

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
          // the lens on the ground behind him (he is the foreground), a little to the side so Goku is not hidden
          const side = new V3(away.z, 0, -away.x);
          const low = (back, s, up) => {
            const p = frieza.pos.clone().addScaledVector(away, -back).addScaledVector(side, s);
            p.y = Math.max(frieza.pos.y, ctx.b.stage.heightAt(p.x, p.z)) + up;
            return p;
          };
          ctx.cast.p3From = { pos: low(1.9, 0.9, 0.45) };
          ctx.cast.p3To = { pos: low(1.1, 0.7, 0.5) };
          ctx.m.flags.csP3Low = true;
        },
        pose: [{ who: 'goku', pose: 'run', face: 'grit', speed: 0.6 }],
        tick: (ctx, t) => {
          const g = ctx.cast.goku;
          g.setPosition(ctx.walkFrom.clone().lerp(ctx.walkTo, U.clamp01(t / 3.2)));
        },
        // CS-P3-01 (Roadmap Three, the owner's Gemini fight research — a research draft, not checked against the footage):
        // low behind Frieza on the ground, looking past him at Goku's back, pushing slowly in after him
        cam: { from: { at: 'p3From' }, to: { at: 'p3To' }, look: { at: 'goku', off: [0, 0.9, 0] }, fov: 44, fov2: 38 },
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
      // the wave goes up after him: it travels, and the lens — beside his hand, side-on — whips round after it
      // (Roadmap Three, the owner's Gemini research, CS-P3-02: a research draft, not checked against the footage)
      {
        call: (ctx) => {
          const b = ctx.b, m = ctx.m, { frieza, goku } = ctx.cast;
          const from = frieza.handPos('R');
          const head = from.clone();
          ctx.cast.wave = { pos: head };
          let k = 0;
          const hook = (ctx.waveHook = () => {
            k = Math.min(1, k + 1 / 27);
            head.lerpVectors(from, goku.chest(), k);
            b.vfx.trail(head, 0xc060ff, 1.1, 0.55);
            b.vfx.trail(head, 0xf0e0ff, 0.55, 0.4);
            if (k >= 1) waveDone(ctx);
          });
          m.tickHooks.push(hook);
          b.vfx.flash(from, 5, 0xe8d0ff, 0.4, SL.Toon.tex.glow);
          b.sfx('beamFire', frieza, { vol: 1.3, pitch: 0.8 });
          b.cameraTraumaAt(from, 0.6);
        },
        screen: { flash: 0.35, color: '#e8d0ff' },
        cam: { from: { at: 'frieza', off: [3.4, 0.9, 0.4] }, look: { at: 'wave' }, fov: 54 },
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
      waveDone(ctx);
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
      // the look down at what is left of him, before a word (Roadmap Three, the owner's Gemini research, CS-P3-04: a
      // locked, still close-up on his face, no music — "do not rush" it): not triumph, not anger; disappointment
      {
        pose: [{ who: 'goku', pose: 'flyIdle', face: 'hurt', speed: 1 }],
        music: { song: null, level: 0 },
        cam: { from: { at: 'goku:face', local: [0.12, -0.04, 1.05] }, look: { at: 'goku:face' }, fov: 32 },
        hold: 2.6,
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

  /*
   * THE DEPARTURE (Roadmap Three: the owner's Gemini research, the "You fool" block, B-PH3-05 / CS-P3-05 — a research
   * draft, not checked against the footage): before the run off the dying planet, a breath — the eyes shut for a
   * moment — then up at the sky, the knees bend, and he goes straight up, a gold streak; seen from high above, the
   * lens tilting up after him as he comes. The escape itself stays played.
   */
  S.goku_departs = {
    id: 'goku_departs',
    cast,
    events: [
      // a breath, the eyes shut for a moment
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'closed', speed: 4 }],
        cam: { from: { at: 'goku:face', local: [0.18, -0.04, 1.15] }, to: { at: 'goku:face', local: [0.14, -0.04, 1] }, look: { at: 'goku:face' }, fov: 34 },
        hold: 1.6,
      },
      // then up, at what is left of the sky
      {
        pose: [{ who: 'goku', pose: 'g_lookUp', face: 'cold', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.9, -0.55, 2.3] }, look: { at: 'goku:head', off: [0, 0.55, 0] }, fov: 48 },
        hold: 1.2,
      },
      // the knees bend
      {
        pose: [{ who: 'goku', pose: 'powerCrouch', face: 'shout', speed: 14, aura: 1 }],
        call: (ctx) => {
          const g = ctx.cast.goku;
          ctx.b.vfx.ring(g.pos.clone().add(new V3(0, 0.15, 0)), 3.4, 0xffe27a, 0.45, new V3(0, 1, 0));
          ctx.b.vfx.dust(g.pos.clone(), 2.6, 14);
        },
        cam: { from: { at: 'goku', local: [2.6, 0.2, 4.2] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 52 },
        hold: 0.35,
      },
      // straight up, a gold streak — from high above, the lens tilting up after him as he comes
      {
        space: { who: 'goku', mode: 'flight', to: { at: 'goku', off: [0, 34, 0] }, seconds: 0.9, pose: 'flyUp', endPose: 'flyIdle' },
        vfx: { kind: 'beamLine', at: { at: 'goku' }, to: { at: 'goku', off: [0, 34, 0] }, color: 0xffd84a, size: 0.9, steps: 22, life: 1 },
        call: (ctx) => {
          const b = ctx.b, g = ctx.cast.goku;
          b.sfx('dash', g, { vol: 1.4, pitch: 0.8 });
          b.cameraTraumaAt(g.pos, 0.4);
          // the planet still going under him
          for (let i = 0; i < 4; i++) {
            const a = Math.random() * Math.PI * 2, r = 14 + Math.random() * 22;
            const at = g.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
            if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
            b.vfx.explosion(at, 7, 0xff9a5a, { smoke: true });
          }
        },
        cam: { from: { at: 'goku', off: [6, 46, 7] }, look: { at: 'goku' }, fov: 60 },
        hold: 1.5,
      },
    ],
    end(ctx) {
      const { m, cast: c } = ctx;
      const g = c.goku;
      if (g) {
        // skipped or watched, the run starts in the air over the dying plain
        if (g.pos.y - ctx.b.stage.heightAt(g.pos.x, g.pos.z) < 20) SL.Staging.set(m, g, 'air', { height: 34 });
        g.setState('free');
      }
      m.flags.departed = true;
    },
    clearMood: false,
  };
})();
