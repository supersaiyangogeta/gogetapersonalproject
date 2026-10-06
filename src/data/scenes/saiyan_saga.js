/*
 * SCENES — the Saiyan Saga's two deaths on the battlefield (human playtest round 2).
 *
 *   piccolo_shields_gohan    Nappa aims at the boy; Piccolo is the one it hits
 *   vegeta_executes_nappa    "help me up" — the hand, the throw, the blast
 *
 * The owner played both and found them told, not shown: Piccolo's death was a line of
 * dialogue over an elevated wide shot with Piccolo nowhere near the boy, and Nappa's
 * execution was two actors who never touched while a homing blast could fly past. Both
 * are now storyboards for the cinema runner with the actors staged in the frame:
 *
 *   GOHAN ← PICCOLO ← NAPPA        the three of them on one line, the beam between
 *   NAPPA (down) → VEGETA's hand → the air → the blast that cannot miss
 *
 * Neither scene uses a fight AI: every actor is placed and posed by the scene, the beam
 * is a real engine beam whose head is pinned to Piccolo's chest, and the blast that
 * kills Nappa detonates where Nappa is. Both declare their end state, so skipping leaves
 * Piccolo dead beside the boy, and Nappa gone, exactly as watching does.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  const sceneBeam = (ctx, owner, victim, spec) => SL.Cinema.beam(ctx, owner, victim, spec);
  const pinBeam = (ctx) => SL.Cinema.pinBeam(ctx);

  const NAPPA_WAVE = {
    id: 'nappaWave', name: 'Energy Wave', type: 'beam', damage: [0, 0], radius: [0.5, 0.5], speed: 64, range: 44, sustain: 70,
    color: 0xffd48a, core: 0xffffff, oneHand: true, style: { rings: 1, ringColor: 0xfff0c0, ringSpeed: 1.2 },
  };

  S.piccolo_shields_gohan = {
    id: 'piccolo_shields_gohan',
    cast: (m) => {
      const s = m.battle.story;
      return { nappa: s.nappa, gohan: s.gohan, piccolo: s.piccolo, krillin: s.krillin, vegeta: s.vegeta };
    },
    music: { song: 'piccolo_theme', level: 1 },
    events: [
      // THE SETUP. The boy alone in front of him; Piccolo down on one knee off to the side.
      {
        call: (ctx) => {
          const { piccolo, nappa, gohan } = ctx.cast;
          piccolo.setHidden(false);
          piccolo.intangible = true; // the beam is staged to stop on him, not to knock him across the field
          piccolo.untargetable = true;
          nappa.target = gohan;
        },
        place: { who: 'gohan', at: [0, 0, 10], face: 'nappa' },
        hold: 0,
      },
      { place: { who: 'nappa', at: [0, 0, -12], face: 'gohan' }, hold: 0 },
      { place: { who: 'piccolo', at: [-5.2, 0, 6.2], face: 'nappa' }, hold: 0 },
      {
        place: { who: 'krillin', at: [6.5, 0, 13], face: 'nappa' },
        pose: [
          { who: 'gohan', pose: 'kg_scared', face: 'shock' },
          { who: 'nappa', pose: 'n_laugh', face: 'grin' },
          { who: 'piccolo', pose: 'defeatKneel', face: 'hurt' },
          { who: 'krillin', pose: 'defeatKneel', face: 'hurt' },
        ],
        // low, over Nappa's shoulder: the boy is small and alone
        cam: { from: { at: 'nappa', local: [-1.4, 0.7, -2.6] }, to: { at: 'nappa', local: [-1.1, 0.6, -2.1] }, look: { at: 'gohan' }, fov: 26, fov2: 22 },
        say: { who: 'nappa', line: "The brat's been a pain since we landed. Say goodbye!", duration: 3 },
        hold: 3,
      },
      // ANTICIPATION: the hand comes up and the energy gathers in it
      {
        pose: [{ who: 'nappa', pose: 'blastWind', face: 'grin' }],
        sfx: { name: 'kiUp', who: 'nappa', pitch: 0.7, vol: 1 },
        cam: { from: { at: 'nappa', local: [1.8, 0.2, 2.2] }, to: { at: 'nappa', local: [1.4, 0.3, 1.7] }, look: { at: 'nappa', off: [0, 0.2, 0] }, fov: 38, fov2: 34 },
        tick: (ctx, t) => {
          const n = ctx.cast.nappa;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(n.handPos('R'), 2.2, 0xffd48a, 3, 0.18, 0.35);
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.flash(n.handPos('R'), 0.8 + t * 1.6, 0xffe0a0, 0.2, SL.Toon.tex.glow);
        },
        hold: 1.6,
      },
      // the boy cannot move
      {
        cam: { from: { at: 'gohan', local: [0.25, 0.1, 1.1] }, to: { at: 'gohan', local: [0.2, 0.12, 0.85] }, look: { at: 'gohan', off: [0, 0.22, 0] }, fov: 34, fov2: 30 },
        sfx: { name: 'heartbeat', vol: 0.9 },
        hold: 1.3,
      },
      // Piccolo sees where it is going, and decides
      {
        pose: [{ who: 'piccolo', pose: 'p_kneelLook', face: 'shock' }],
        cam: { from: { at: 'piccolo', local: [0.9, 0.2, 1.6] }, look: { at: 'piccolo', off: [0, 0.35, 0] }, fov: 36 },
        say: { who: 'piccolo', line: 'Gohan...!', duration: 1.2, style: 'quiet' },
        hold: 1.2,
      },
      // THE ATTACK: the wave leaves his hand; Piccolo is already moving
      {
        pose: [
          { who: 'nappa', pose: 'blastR', face: 'shout' },
          { who: 'piccolo', pose: 'dash', face: 'grit' },
        ],
        call: (ctx) => {
          sceneBeam(ctx, ctx.cast.nappa, ctx.cast.piccolo, NAPPA_WAVE);
          ctx.b.emit('piccoloShield', { beam: ctx.beam });
        },
        say: { who: 'krillin', line: 'Gohan, MOVE!', duration: 1.2, style: 'shout' },
        // wide, square to the line: Nappa left, the wave, Piccolo crossing, the boy right
        cam: { from: { at: 'gohan', off: [11, 1.4, -5] }, to: { at: 'gohan', off: [10, 1.2, -4.4] }, look: { at: 'gohan', off: [0, 0.3, -5] }, fov: 50, fov2: 48 },
        move: { who: 'piccolo', at: [0, 0, 7.4], face: 'nappa', seconds: 0.45, ease: 'out' },
        tick: (ctx) => {
          pinBeam(ctx);
          const p = ctx.cast.piccolo;
          ctx.b.vfx.trail(p.chest(), 0xd8ffd0, 0.5, 0.25);
        },
        hold: 0.25,
      },
      // IMPACT: arms out, the whole of it on him, the boy behind him
      {
        pose: [
          { who: 'piccolo', pose: 'p_shield', face: 'shout' },
          { who: 'gohan', pose: 'kg_scared', face: 'shock' },
        ],
        slow: { scale: 0.35, seconds: 1.6 },
        screen: { flash: 0.5, color: '#fff2d0' },
        shake: { at: 'piccolo', amount: 0.55 },
        sfx: { name: 'explosionBig', who: 'piccolo', vol: 1.2, pitch: 0.8 },
        // side-on: the wave a bar of light that ends on him, arms out, the boy right behind him
        cam: { from: { at: 'piccolo', local: [5.2, 0.2, 0.4] }, to: { at: 'piccolo', local: [4.6, 0.1, 0.3] }, look: { at: 'piccolo', local: [0, 0.1, -0.8] }, fov: 44, fov2: 42 },
        tick: (ctx) => {
          pinBeam(ctx);
          const p = ctx.cast.piccolo;
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.flash(p.chest().addScaledVector(p.forward, 0.7), 1.1, 0xfff0c0, 0.12, SL.Toon.tex.glow);
          ctx.b.camera.trauma = Math.max(ctx.b.camera.trauma, 0.2);
        },
        hold: 1.6,
      },
      // from behind the boy, low: Piccolo's back against the light
      {
        cam: { from: { at: 'gohan', local: [0.7, 0.3, -1.6] }, to: { at: 'gohan', local: [0.6, 0.25, -1.3] }, look: { at: 'piccolo', off: [0, 0.35, 0] }, fov: 50, fov2: 46 },
        tick: (ctx) => {
          pinBeam(ctx);
          ctx.b.camera.trauma = Math.max(ctx.b.camera.trauma, 0.2);
        },
        hold: 1.4,
      },
      // three-quarters from Nappa's side: his face in it, the gi burning away
      {
        torn: { who: 'piccolo', on: true },
        cam: { from: { at: 'piccolo', local: [3.4, 0.1, 2.2] }, look: { at: 'piccolo', off: [0, 0.3, 0] }, fov: 38 },
        tick: (ctx) => pinBeam(ctx),
        hold: 1.2,
      },
      // it stops. He is still standing. Nothing is loud any more.
      {
        call: (ctx) => {
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
        },
        music: { song: null, level: 0 },
        pose: [{ who: 'piccolo', pose: 'p_standHurt', face: 'hurt', speed: 3 }, { who: 'nappa', pose: 'n_laugh', face: 'grin' }],
        cam: { from: { at: 'piccolo', local: [0.6, -0.35, 2.2] }, to: { at: 'piccolo', local: [0.5, -0.3, 1.8] }, look: { at: 'piccolo', off: [0, 0.45, 0] }, fov: 38, fov2: 34 },
        tick: (ctx) => {
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.dust(ctx.cast.piccolo.chest(), 0.6, 2, 0x55504a);
        },
        hold: 2.2,
      },
      // he falls
      {
        pose: [{ who: 'piccolo', pose: 'knockdown', face: 'ko', speed: 4 }],
        sfx: { name: 'groundImpact', who: 'piccolo', vol: 0.9, pitch: 0.8 },
        vfx: { kind: 'dust', at: { at: 'piccolo' }, radius: 2, count: 12 },
        cam: { from: { at: 'piccolo', local: [2.6, 0.9, 1.2] }, look: { at: 'piccolo', off: [0, -0.4, 0] }, fov: 44 },
        hold: 1.4,
      },
      // the boy runs to him
      {
        pose: [{ who: 'gohan', pose: 'run', face: 'hurt' }, { who: 'piccolo', pose: 'p_lastWords', face: 'hurt' }],
        say: { who: 'gohan', line: 'MR. PICCOLO!', duration: 1.4, style: 'shout' },
        move: { who: 'gohan', at: 'piccolo', off: [0.9, 0, 1.1], face: 'piccolo', seconds: 0.8 },
        cam: { from: { at: 'piccolo', local: [-2.4, 1.2, -1.8] }, look: { at: 'piccolo', off: [0.4, -0.2, 0.6] }, fov: 46 },
        hold: 0.5,
      },
      // down with him: the last words, close, quiet
      {
        pose: [{ who: 'gohan', pose: 'kg_kneelBy', face: 'hurt' }],
        // in front of his face (he lies face-up), a little toward his chest so the face reads upright
        cam: { from: { at: 'piccolo:face', local: [0.15, -0.4, 1.05] }, to: { at: 'piccolo:face', local: [0.1, -0.35, 0.85] }, look: { at: 'piccolo:face' }, fov: 40, fov2: 36 },
        say: { who: 'piccolo', line: 'Gohan... you were the only one... who ever talked to me like that.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'gohan:head', local: [0.15, -0.44, 0.7] }, look: { at: 'gohan:head', off: [0, -0.04, 0] }, fov: 40 },
        say: { who: 'piccolo', line: 'This year with you... it was not so bad. Do not die, Gohan.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      // he is gone. The frame stays, wide and silent.
      {
        call: (ctx) => {
          const p = ctx.cast.piccolo;
          p.setState('scripted', { pose: 'lieBack', expression: 'ko', speed: 2 });
          p.model.setExpression('ko');
        },
        pose: [{ who: 'gohan', pose: 'kg_cry', face: 'hurt' }],
        cam: { from: { at: 'gohan', off: [3, 1.9, 3.8] }, to: { at: 'gohan', off: [4.4, 2.7, 5.4] }, look: { at: 'piccolo' }, fov: 44, fov2: 48, ease: 'out' },
        mood: { amount: 0.18, color: 0x1a1a24, seconds: 2.5 },
        hold: 3.2,
      },
      // what it costs: Kami goes with him, and the Dragon Balls with Kami
      {
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'krillin:head', local: [0.3, -0.25, 0.95] }, look: { at: 'krillin:head', off: [0, -0.04, 0] }, fov: 40 },
        say: { who: 'krillin', line: 'Piccolo... Then Kami is gone too. The Dragon Balls...', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const p = cast.piccolo, g = cast.gohan;
      if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
      if (p) {
        p.setHidden(false);
        p.intangible = false;
        p.untargetable = true;
        p.cannotDie = false;
        p.infiniteHp = false;
        if (p.alive) {
          // a real knockout, so everything listening (the mission, the party, the tests) hears it
          p.hp = 0;
          p._ko(cast.nappa || null, { dir: new V3(0, 1, 0) });
        }
        p.vel.set(0, 0, 0);
        p.alive = false;
        p.benched = true;
        p.setTorn && p.setTorn(true);
        p.setState('scripted', { pose: 'lieBack', expression: 'ko' });
        if (g && p.pos.distanceTo(g.pos) > 3) {
          const at = p.pos.clone().add(new V3(0.9, 0, 1.1));
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          g.setPosition(at);
          g.yaw = g.prevYaw = Math.atan2(p.pos.x - at.x, p.pos.z - at.z);
        }
      }
      if (g) g.setState('scripted', { pose: 'kg_cry', expression: 'hurt' });
      m.flags.piccoloFell = true;
    },
  };

  S.vegeta_executes_nappa = {
    id: 'vegeta_executes_nappa',
    cast: (m) => {
      const s = m.battle.story;
      return { nappa: s.nappa, vegeta: s.vegeta, goku: s.goku };
    },
    music: { song: null, level: 0 },
    events: [
      // Nappa is finished: on his back, and Goku stands over the wreck of him
      {
        call: (ctx) => {
          const { nappa, vegeta, goku } = ctx.cast;
          nappa.cannotDie = true;
          nappa.untargetable = true;
          vegeta.untargetable = true;
          vegeta.setHidden(false);
          goku.untargetable = true;
          ctx.nappaSpot = nappa.pos.clone();
        },
        pose: [
          { who: 'nappa', pose: 'lieBack', face: 'hurt' },
          { who: 'goku', pose: 'idle', face: 'grit' },
        ],
        cam: { from: { at: 'nappa', off: [4.5, 2.6, 5] }, to: { at: 'nappa', off: [3.2, 1.8, 3.8] }, look: { at: 'nappa', off: [0, -0.3, 0] }, fov: 46, fov2: 42 },
        say: { who: 'nappa', line: 'Vegeta... help me... I cannot move...', duration: 3 },
        hold: 3,
      },
      // the prince comes down to him, in no hurry at all
      {
        call: (ctx) => {
          const { nappa, vegeta } = ctx.cast;
          // he lands a few steps from the head, then walks the rest
          const side = new V3(1, 0, -0.4).normalize();
          const at = nappa.pos.clone().addScaledVector(side, 7);
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          vegeta.setPosition(at);
          vegeta.yaw = vegeta.prevYaw = Math.atan2(nappa.pos.x - at.x, nappa.pos.z - at.z);
          ctx.b.vfx.dust(at, 2.4, 12);
          ctx.b.sfx('dash', vegeta, { vol: 1 });
        },
        pose: [{ who: 'vegeta', pose: 'run', face: 'calm', speed: 3 }],
        move: { who: 'vegeta', at: 'nappa', off: [1.3, -0.84, -0.5], face: 'nappa', seconds: 2.2, ease: 'linear' },
        // from the ground by Nappa's head, looking up at him coming
        cam: { from: { at: 'nappa', off: [-0.6, 0.3, 0.9] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 42 },
        hold: 0.2,
      },
      // "Help you? Of course." — the hand comes down
      {
        call: (ctx) => {
          // side-on and low: the offered hand and the one reaching up for it, both in frame
          const { nappa, vegeta } = ctx.cast;
          const mid = nappa.chest().lerp(vegeta.chest(), 0.5);
          const along = vegeta.pos.clone().sub(nappa.pos).setY(0).normalize();
          const side = new V3(along.z, 0, -along.x);
          ctx.cast.handMid = { pos: mid };
          ctx.cast.handCam = { pos: mid.clone().addScaledVector(side, 3.6).add(new V3(0, 0.2, 0)) };
          ctx.cast.handCam2 = { pos: mid.clone().addScaledVector(side, 3).add(new V3(0, 0.15, 0)) };
        },
        pose: [
          { who: 'vegeta', pose: 'v_offerHand', face: 'smirk' },
          { who: 'nappa', pose: 'n_reachUp', face: 'grin' },
        ],
        cam: { from: { at: 'handCam' }, to: { at: 'handCam2' }, look: { at: 'handMid', off: [0, 0.1, 0] }, fov: 42, fov2: 38 },
        say: { who: 'vegeta', line: 'Help you? Of course. Take my hand, Nappa.', duration: 2.8, style: 'quiet' },
        hold: 2.8,
      },
      // the hands meet
      {
        call: (ctx) => {
          const { nappa, vegeta } = ctx.cast;
          ctx.grip = vegeta.handPos('R').lerp(nappa.handPos('R'), 0.5);
          ctx.b.sfx('punchLight', vegeta, { vol: 0.5, pitch: 0.6 });
        },
        cam: { from: { at: 'vegeta', local: [1.1, -0.3, 1.2] }, look: { at: 'vegeta', local: [0.05, -0.55, 0.55] }, fov: 34 },
        tick: (ctx) => {
          // Nappa's hand is in Vegeta's: the two are drawn together at the grip
          const { nappa, vegeta } = ctx.cast;
          const h = vegeta.handPos('R');
          if (ctx.b.frame % 8 === 0) ctx.b.vfx.flash(h, 0.4, 0xffffff, 0.12, SL.Toon.tex.glow);
          nappa.model.setExpression('grin');
        },
        hold: 1.2,
      },
      // the throw: straight up, as high as he can send him
      {
        call: (ctx) => {
          const { nappa, vegeta } = ctx.cast;
          ctx.b.vfx.dust(vegeta.pos, 3, 16);
          ctx.b.vfx.ring(vegeta.chest(), 4, 0xffffff, 0.4, new V3(0, 1, 0));
          ctx.b.sfx('punchHeavy', vegeta, { vol: 1.3, pitch: 0.7 });
          ctx.b.camera.addTrauma(0.35);
          nappa.setState('scripted', { pose: 'launched', expression: 'shock' });
          ctx.apex = vegeta.pos.clone().add(new V3(0, 17, 0)).addScaledVector(vegeta.forward, 1.5);
        },
        pose: [{ who: 'vegeta', pose: 'v_throwUp', face: 'grin' }],
        say: { who: 'nappa', line: 'V-Vegeta?!', duration: 1.4, style: 'shout' },
        // low beside Vegeta, tilted up: the arm, the body flying
        cam: { from: { at: 'vegeta', local: [2.4, -0.2, 2.2] }, look: { at: 'nappa' }, fov: 54 },
        tick: (ctx, t) => {
          const { nappa, vegeta } = ctx.cast;
          const k = Math.min(1, t / 1.1);
          const from = vegeta.handPos('R');
          const p = from.lerp(ctx.apex, 1 - (1 - k) * (1 - k));
          p.y -= nappa.height * 0.6;
          nappa.setPosition(p);
          nappa.grounded = false;
          nappa.yaw += 0.05;
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(nappa.chest(), 0xffffff, 0.4, 0.3);
        },
        hold: 1.2,
      },
      // he hangs there. The prince raises his palm to him.
      {
        pose: [{ who: 'vegeta', pose: 'v_palmUp', face: 'smirk' }],
        slow: { scale: 0.5, seconds: 1.4 },
        cam: { from: { at: 'vegeta', local: [0.9, -0.5, 1.4] }, to: { at: 'vegeta', local: [0.8, -0.55, 1.2] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 40, fov2: 36 },
        say: { who: 'vegeta', line: 'A Saiyan who cannot fight is of no use to me.', duration: 3, style: 'quiet' },
        tick: (ctx) => {
          const { nappa, vegeta } = ctx.cast;
          const p = ctx.apex.clone();
          p.y -= nappa.height * 0.6;
          nappa.setPosition(p);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.streamInward(vegeta.handPos('R'), 1.4, 0xc8a8ff, 2, 0.12, 0.3);
        },
        hold: 2.8,
      },
      // it cannot miss: the blast leaves the palm and ends where he is
      {
        call: (ctx) => {
          const { nappa, vegeta } = ctx.cast;
          const from = vegeta.handPos('R');
          const to = nappa.chest();
          for (let i = 0; i <= 18; i++) ctx.b.vfx.trail(from.clone().lerp(to, i / 18), 0xc8a8ff, 0.8, 0.5);
          ctx.b.vfx.flash(from, 2, 0xe8d8ff, 0.2, SL.Toon.tex.glow);
          ctx.b.sfx('kiBlastBig', vegeta, { vol: 1.2 });
          ctx.blastAt = to.clone();
        },
        cam: { from: { at: 'vegeta', local: [3.5, 0.4, -3] }, look: { at: 'nappa' }, fov: 50 },
        hold: 0.35,
      },
      {
        call: (ctx) => {
          const { nappa } = ctx.cast;
          const at = ctx.blastAt || nappa.chest();
          ctx.b.vfx.explosion(at, 9, 0xd8b8ff, { smoke: true });
          ctx.b.vfx.flash(at, 14, 0xffffff, 0.35, SL.Toon.tex.glow);
          ctx.b.vfx.ring(at, 12, 0xe8d8ff, 0.6);
          ctx.b.sfx('explosionHuge', null, { at, vol: 1.2 });
          ctx.b.camera.addTrauma(0.7);
          ctx.b.emit('nappaExecuted', { blastAt: at.clone(), nappaAt: nappa.chest(), vegetaAt: ctx.cast.vegeta.pos.clone() });
          nappa.setHidden(true);
          ctx.nappaGone = true;
        },
        screen: { flash: 0.7, color: '#f0e6ff' },
        // wide from the ground: Goku in the foreground, the sky burning over the prince
        cam: { from: { at: 'goku', local: [1.2, 0.2, -2.8] }, look: { at: 'vegeta', off: [0, 9, 0] }, fov: 58 },
        hold: 2.4,
      },
      // the smoke drifts. Goku cannot believe it.
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }, { who: 'vegeta', pose: 'v_chinUp', face: 'smirk' }],
        cam: { from: { at: 'goku', local: [0.45, 0.15, 1.6] }, look: { at: 'goku', off: [0, 0.25, 0] }, fov: 36 },
        say: { who: 'goku', line: 'He was your partner!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.5, 0.15, 1.8] }, look: { at: 'vegeta', off: [0, 0.25, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'He was a soldier who could not stand up. Now, Kakarot — it is your turn.', duration: 3.6 },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const n = cast.nappa;
      if (n) {
        n.cannotDie = false;
        n.infiniteHp = false;
        if (n.alive) {
          n.hp = 0;
          n._ko(cast.vegeta || null, { dir: new V3(0, 1, 0) });
        }
        n.vel.set(0, 0, 0);
        n.alive = false;
        n.untargetable = true;
        n.setHidden(true);
      }
      if (cast.vegeta) cast.vegeta.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      if (cast.goku) cast.goku.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.flags.nappaExecuted = true;
    },
  };
})();
