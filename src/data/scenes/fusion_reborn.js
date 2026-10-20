/*
 * SCENES — MOVIE: FUSION REBORN (not canon). Data for SL.Cinema (src/game/cinema.js).
 *
 *   ACT I   fr_open          the Spirit Cleansing Machine: Saike dancing, the tank turning, the explosion,
 *                            the sludge, Janemba; the warp; the barrier; King Yemma's warning
 *           fr_meet          Goku and Pikkon at the barrier; "Janemba."; Pikkon backhanded; "Ooooooo!"
 *   ACT II  fr_ssj3_reveal   the full-body reveal after Super Saiyan 3 (the transformation itself is the
 *                            form's own sequence, played by the player holding Charge)
 *           fr_evolve        the shell cracks: Super Janemba, the sword pulled out of his head
 *   ACT III fr_earth_open    the sky over Earth tears; the dead come through (Gohan and Videl)
 *           fr_frieza_meet   "Son of Goku, guardian of all that is good. Gohan!"
 *           fr_frieza_end    one punch, one blast, back where he came from
 *           fr_dictator      "Achtung!" — the Dictator and his tanks; "Broom lip!"
 *           fr_boys_gold     "Let's give him a little scare" — "Blonde hair! Blue eyes!"
 *           fr_boys_end      the last tank, the Dictator on his backside, "Are we inferior?"
 *   ACT IV  fr_vegeta_arrive the sword raised over Goku — a gold blast — Vegeta, with his halo
 *           fr_proposal      behind the spiked rock: the dance explained, "Ballet!!!?", "you're already dead"
 *   ACT V   fr_veku_birth    the bent finger, the light, the blimp
 *           fr_kais          the spectators
 *           fr_veku_timeup   thirty minutes: "Watch those fingers"; neither of them can take Janemba alone
 *   ACT VI  fr_gogeta_birth  the light column, the silhouette, the vest, the face: "I am Gogeta!"
 *           fr_farewell      the world put right; "Vegeta, thanks." — "Goodbye, my friend."
 *
 * Dialogue: the owner's pasted lines are used as written. Lines that are not in the owner's text
 * (Saike's "Huh?", Goku after the reveal, the boys' small talk) are original and kept short.
 * Every dialogue shot is semantic (Cinema FRAMING): the speaker's face, never the ground.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const cast = (m) => SL.data.frKit.cast(m);
  const D = () => SL.Dimension;
  const lm = (ctx, n) => SL.data.frKit.lm(ctx.b, n);
  const arr = (v) => [v.x, v.y, v.z];

  /* =================================================================== ACT I */
  S.fr_open = {
    id: 'fr_open',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // the Other World as it was: a sea of yellow cloud, the station, the plant on its own platform
      {
        call: (ctx) => ctx.b.stage.setTank && ctx.b.stage.setTank(0.08),
        cam: { from: [-40, 46, 120], to: [-10, 34, 96], look: [30, 6, -6], fov: 50, fov2: 44, ease: 'inOut' },
        title: { chapter: 'MOVIE · FUSION REBORN', title: 'THE SPIRIT CLEANSING MACHINE', subtitle: 'The Other World', duration: 4 },
        hold: 4.2,
      },
      // the tank: every soul's evil, cleaned out and stored — humming
      {
        call: (ctx) => {
          ctx.b.sfx('machineHum', null, { at: lm(ctx, 'tank') });
          const t = lm(ctx, 'tank');
          ctx.m.shot((tt, out) => {
            out.pos.set(t.x + 13 - tt * 1.2, t.y - 4 + tt * 0.6, t.z + 15);
            out.look.copy(t);
            out.fov = 42;
          }, 2.8, { cut: true, blendIn: 0 });
        },
        hold: 2.8,
      },
      // ...and the young ogre who is meant to be watching it, in his headphones
      {
        pose: [{ who: 'saike', pose: 'so_dance', face: 'grin', speed: 9 }],
        cam: { subject: 'saike', focus: 'full', angle: 'three' },
        sfx: { name: 'machineHum', at: 'saike', vol: 0.5 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'saike', pose: 'so_dance', face: 'closed', speed: 10 }],
        cam: { subject: 'saike', focus: 'upper', angle: 'front' },
        tick: (ctx, s) => ctx.b.stage.setTank && ctx.b.stage.setTank(0.15 + Math.min(1, s / 2) * 0.25),
        hold: 2.2,
      },
      // the gauge climbs; a lamp goes yellow
      {
        call: (ctx) => {
          const g = lm(ctx, 'gauge');
          ctx.m.shot((tt, out) => {
            out.pos.set(g.x + 1.4, g.y + 0.5, g.z + 2.6 - tt * 0.4);
            out.look.copy(g);
            out.fov = 38;
          }, 2.4, { cut: true, blendIn: 0 });
          ctx.b.sfx('alarm', null, { at: g, vol: 0.7 });
        },
        tick: (ctx, s) => ctx.b.stage.setTank && ctx.b.stage.setTank(0.4 + Math.min(1, s / 2.2) * 0.22),
        hold: 2.4,
      },
      // over his shoulder: the tank behind him going purple, and he does the big move
      {
        pose: [{ who: 'saike', pose: 'so_dance2', face: 'grin', speed: 8 }],
        call: (ctx) => {
          const sk = ctx.cast.saike, t = lm(ctx, 'tank');
          ctx.m.shot((tt, out) => {
            // Saike in the lower third, the tank filling the frame above and behind him
            out.pos.set(sk.pos.x - 1.6, sk.pos.y + 1.5, sk.pos.z + 4.6);
            out.look.set(sk.pos.x * 0.55 + t.x * 0.45, sk.pos.y + 3.2 + tt * 2.2, sk.pos.z * 0.55 + t.z * 0.45);
            out.fov = 64;
          }, 3.2, { cut: true, blendIn: 0 });
          ctx.b.sfx('machineHum', null, { at: t, pitch: 1.35 });
          ctx.b.sfx('alarm', null, { at: t });
        },
        tick: (ctx, s) => {
          if (ctx.b.stage.setTank) ctx.b.stage.setTank(0.62 + Math.min(1, s / 3) * 0.26);
          ctx.b.camera.addTrauma(0.004 + s * 0.004);
        },
        hold: 3.2,
      },
      // the tank strains: cracks of light, the whole plant shaking
      {
        call: (ctx) => {
          const t = lm(ctx, 'tank');
          ctx.m.shot((tt, out) => {
            out.pos.set(t.x + 9, t.y - 6, t.z + 10);
            out.look.copy(t);
            out.fov = 46 - tt * 6;
          }, 1.9, { cut: true, blendIn: 0 });
          ctx.b.sfx('rumble', null, { at: t, vol: 1 });
        },
        tick: (ctx, s) => {
          const t = lm(ctx, 'tank');
          if (ctx.b.stage.setTank) ctx.b.stage.setTank(0.9 + s * 0.05);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.bolt(t.clone().add(new V3(Math.sin(ctx.b.frame) * 4, Math.cos(ctx.b.frame * 0.7) * 4, 3)), 2.4, 0xd88aff);
          ctx.b.camera.addTrauma(0.02);
        },
        hold: 1.9,
      },
      // he finally turns round
      {
        pose: [{ who: 'saike', pose: 'so_shock', face: 'shock', speed: 14 }],
        call: (ctx) => SL.data.buuKit.faceTo(ctx.cast.saike, lm(ctx, 'tank')),
        cam: { subject: 'saike', focus: 'closeup', angle: 'front' },
        say: { who: 'saike_oni', line: '...Huh?', duration: 1.2, style: 'quiet' },
        hold: 1.3,
      },
      // THE EXPLOSION
      {
        call: (ctx) => {
          const b = ctx.b;
          const at = b.stage.burstTank ? b.stage.burstTank() || lm(ctx, 'tank') : lm(ctx, 'tank');
          b.vfx.explosion(at, 5, 0x6a1a8a, { life: 0.7 });
          b.vfx.dust(at, 6, 30, 0x2a0a34);
          b.vfx.ring(at, 16, 0xb04aff, 0.8);
          SL.ScreenFX.flash(0.4, '#c070ff');
          b.sfx('explosionHuge', null, { at });
          b.cameraTraumaAt(at, 0.9);
          const bt = lm(ctx, 'booth');
          ctx.m.shot((tt, out) => {
            out.pos.set(bt.x + 6, bt.y + 2, bt.z + 13);
            out.look.set(at.x, at.y * (1 - tt * 0.5), at.z);
            out.fov = 56;
          }, 1.4, { cut: true, blendIn: 0 });
        },
        hold: 1.4,
      },
      // the evil pours down on him
      {
        pose: [{ who: 'saike', pose: 'so_cower', face: 'shock', speed: 12 }],
        cam: { subject: 'saike', focus: 'medium', angle: 'high' },
        tick: (ctx) => {
          const b = ctx.b, sk = ctx.cast.saike;
          if (b.frame % 2) return;
          const top = sk.pos.clone().add(new V3(Math.sin(b.frame * 0.9) * 1.2, 6 + (b.frame % 7), Math.cos(b.frame * 0.7) * 1.2));
          b.vfx.smoke.emit(top.x, top.y, top.z, 0, -9, 0, 0.12, 0.04, 0.16, 0.85, 1.6, 0.9, { grow: 1.4, drag: 0.6 });
        },
        hold: 2.2,
      },
      // swallowed — and something grows out of the dark where he stood
      {
        call: (ctx) => {
          const b = ctx.b, sk = ctx.cast.saike, jb = ctx.cast.janemba;
          b.vfx.dust(sk.pos.clone(), 3, 24, 0x2a0a34);
          b.vfx.ring(sk.chest(), 5, 0xd24aff, 0.6);
          sk.setHidden(true);
          if (jb) {
            // a few paces out from the booth (his body is far bigger than the young ogre's)
            jb.setPosition(SL.data.frKit.at(ctx.b, sk.pos.x, sk.pos.z + 3.2));
            jb.setHidden(false);
            SL.data.buuKit.faceTo(jb, sk.pos.clone().add(new V3(0, 0, 10)));
            jb.setState('scripted', { pose: 'jb_crack', expression: 'closed' });
            jb.model.root.scale.setScalar(jb.model.baseScale * 0.2);
          }
          b.sfx('stretch', jb, { pitch: 0.5, vol: 1 });
        },
        cam: { from: { at: 'saike', off: [6, 1.6, 13] }, look: { at: 'saike', off: [0, 2.6, 3.2] }, fov: 50 },
        tick: (ctx, s) => {
          const jb = ctx.cast.janemba;
          if (!jb) return;
          const k = Math.min(1, s / 2.2);
          const wob = 1 + Math.sin(s * 18) * 0.06 * (1 - k);
          jb.model.root.scale.set(jb.model.baseScale * (0.2 + 0.8 * k) * wob, jb.model.baseScale * (0.2 + 0.8 * k) / wob, jb.model.baseScale * (0.2 + 0.8 * k) * wob);
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.smoke.emit(jb.pos.x, jb.pos.y + 1, jb.pos.z, 0, 2, 0, 0.2, 0.06, 0.24, 0.6, 2, 1.2, { grow: 1.8, drag: 1 });
        },
        hold: 2.4,
      },
      // JANEMBA
      {
        call: (ctx) => {
          const jb = ctx.cast.janemba;
          if (jb) jb.model.root.scale.setScalar(jb.model.baseScale);
          ctx.b.sfx('giggle', jb, { vol: 1.1 });
        },
        pose: [{ who: 'janemba', pose: 'jb_giggle', face: 'grin', speed: 9 }],
        cam: { subject: 'janemba', focus: 'full', angle: 'three' },
        say: { who: 'janemba', line: 'Janemba! Janemba!', duration: 2 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'janemba', pose: 'jb_ooo', face: 'grin', speed: 7 }],
        cam: { subject: 'janemba', focus: 'upper', angle: 'front' },
        hold: 1.5,
      },
      // the warp: the Other World turns into his playground
      {
        call: (ctx) => {
          SL.data.frKit.warp(ctx.b, 1, 4.2);
          ctx.b.sfx('portalOpen', null, { vol: 1.2 });
          ctx.b.sfx('magic', null, { vol: 0.9 });
        },
        music: { song: 'janemba_theme', level: 1 },
        cam: { from: [80, 26, 80], to: [50, 64, 128], look: [6, 4, -26], fov: 50, fov2: 58, ease: 'inOut' },
        hold: 4.4,
      },
      // the crystal over the Check-In Station
      {
        call: (ctx) => {
          SL.data.frKit.barrier(ctx.b, 1, 2.6);
          ctx.b.sfx('timeWarp', null, { vol: 1 });
        },
        cam: { from: [16, 9, 14], to: [10, 11, 6], look: [0, 9, -50], fov: 50, ease: 'inOut' },
        hold: 3,
      },
      // King Yemma, inside it
      {
        pose: [{ who: 'yemma', pose: 'ye_worry', face: 'shock', speed: 6 }],
        cam: { subject: 'yemma', focus: 'upper', angle: 'front' },
        say: { who: 'king_yemma', line: 'When the Check-In Station shuts down, there will be no barrier between dimensions.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'yemma', pose: 'ye_bang', face: 'angry', speed: 6 }],
        cam: { subject: 'yemma', focus: 'closeup', angle: 'three' },
        say: { who: 'king_yemma', line: 'The heavens will no longer be protected and the gates of Hell will be wide open.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'yemma', pose: 'ye_worry', face: 'shock', speed: 5 }],
        cam: { from: [18, 3, -6], to: [14, 5, -10], look: [0, 8, -50], fov: 52, ease: 'inOut' },
        say: { who: 'king_yemma', line: 'The dead will walk among the living... and the living among the dead.', duration: 4 },
        hold: 4.2,
      },
    ],
    end(ctx) {
      const b = ctx.b;
      SL.data.frKit.warped(b);
      if (ctx.cast.saike) ctx.cast.saike.setHidden(true);
      const jb = ctx.cast.janemba;
      if (jb) jb.model.root.scale.setScalar(jb.model.baseScale);
    },
  };

  S.fr_meet = {
    id: 'fr_meet',
    cast,
    music: { song: 'janemba_theme', level: 1 },
    events: [
      // from behind the two of them, up at the child sitting on top of the crystal
      {
        pose: [
          { who: 'janemba', pose: 'jb_sit', face: 'grin', speed: 4 },
          { who: 'goku', pose: 'idle', face: 'calm', speed: 4 },
          { who: 'pikkon', pose: 'pk_folded', face: 'serious', speed: 4 },
        ],
        cam: { from: { at: 'goku', off: [2.6, 0.6, 5.5] }, look: { at: 'janemba', off: [0, 0.5, 0] }, fov: 50 },
        hold: 2.6,
      },
      {
        cam: { subject: 'janemba', focus: 'upper', angle: 'low' },
        sfx: { name: 'giggle', who: 'janemba', vol: 0.8 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'pikkon', pose: 'pk_point', face: 'serious', speed: 6 }],
        cam: { subject: 'pikkon', focus: 'upper', angle: 'three', side: 1 },
        say: { who: 'pikkon', line: 'Are you the one who put the barrier up around this world?', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'janemba', pose: 'jb_sit', face: 'grin', speed: 6 }],
        cam: { subject: 'janemba', focus: 'closeup', angle: 'front' },
        say: { who: 'janemba', line: 'Janemba. Janemba.', duration: 2 },
        hold: 2.1,
      },
      {
        pose: [{ who: 'pikkon', pose: 'pk_point', face: 'calm', speed: 5 }],
        cam: { subject: 'pikkon', focus: 'closeup', angle: 'three', side: 1 },
        say: { who: 'pikkon', line: 'Okay. Be a good boy and take down the barrier now, Janemba.', duration: 3.4 },
        hold: 3.5,
      },
      // he just stares: head on one side
      {
        pose: [{ who: 'janemba', pose: 'jb_idle', face: 'neutral', speed: 3 }],
        cam: { subject: 'janemba', focus: 'face', angle: 'front' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'pikkon', pose: 'pk_point', face: 'angry', speed: 9 }],
        cam: { subject: 'pikkon', focus: 'upper', angle: 'front' },
        say: { who: 'pikkon', line: 'Are you stupid or what? You heard me! Take that barrier down right this instant or else!', duration: 4.2, style: 'shout' },
        hold: 4.3,
      },
      {
        cam: { subject: 'janemba', focus: 'closeup', angle: 'low' },
        say: { who: 'janemba', line: 'Janemba.', duration: 1.4 },
        hold: 1.5,
      },
      {
        pose: [{ who: 'pikkon', pose: 'pk_idle', face: 'angry', speed: 10 }],
        cam: { subject: 'pikkon', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'pikkon', line: 'Are you trying to make a fool out of me!?', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      // he charges up the dome...
      {
        pose: [{ who: 'pikkon', pose: 'pk_kickW', face: 'shout', speed: 12 }],
        call: (ctx) => ctx.b.sfx('dash', ctx.cast.pikkon),
        cam: { subject: 'pikkon', with: 'janemba', focus: 'wide' },
        move: { who: 'pikkon', to: { at: 'janemba', off: [0, -0.6, 3.2] }, seconds: 0.55 },
      },
      // ...and the child backhands him without getting up
      {
        call: (ctx) => {
          const b = ctx.b, p = ctx.cast.pikkon, jb = ctx.cast.janemba;
          jb.setState('scripted', { pose: 'jb_slap', expression: 'grin', speed: 30 });
          b.vfx.impact(p.chest(), 4, 0xffe0a0);
          b.sfx('punchHeavy', p, { pitch: 0.7, vol: 1.2 });
          b.cameraTraumaAt(p.chest(), 0.6);
          p.setState('scripted', { pose: 'hitHeavy', expression: 'shock', speed: 20 });
        },
        slow: { scale: 0.35, seconds: 0.5 },
        cam: { subject: 'janemba', with: 'pikkon', focus: 'medium' },
        hold: 0.6,
      },
      {
        pose: [{ who: 'pikkon', pose: 'tumble', face: 'hurt', speed: 14 }],
        cam: { from: { at: 'goku', off: [-4, 1.4, 6] }, look: { at: 'pikkon' }, fov: 54, follow: false },
        move: { who: 'pikkon', to: { at: 'goku', off: [12, 0, 8] }, seconds: 0.9 },
      },
      {
        call: (ctx) => {
          const p = ctx.cast.pikkon;
          SL.data.buuKit.place(p, SL.data.frKit.at(ctx.b, p.pos.x, p.pos.z), p.yaw);
          ctx.b.vfx.dust(p.pos.clone(), 1.6, 12, 0xffb0d4);
          ctx.b.sfx('groundImpact', p);
          SL.data.buuKit.faceTo(p, ctx.cast.janemba.pos);
        },
        pose: [{ who: 'pikkon', pose: 'pk_down', face: 'hurt', speed: 10 }, { who: 'janemba', pose: 'jb_sit', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'He didn\'t even try.', duration: 2 },
        hold: 2.1,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'low' },
        say: { who: 'goku', line: 'You really pack a wallop. Who are you anyway?', duration: 3 },
        hold: 3.1,
      },
      // Pikkon in the shot, up on an elbow: he is still here
      {
        pose: [{ who: 'pikkon', pose: 'pk_idle', face: 'angry', speed: 6 }],
        cam: { subject: 'pikkon', with: 'goku', focus: 'medium' },
        say: { who: 'pikkon', line: 'Careful, Goku. He\'s stronger than he looks.', duration: 3 },
        hold: 3.1,
      },
      // and the child comes down to play
      {
        pose: [{ who: 'janemba', pose: 'jb_ooo', face: 'grin', speed: 7 }],
        call: (ctx) => ctx.b.sfx('giggle', ctx.cast.janemba, { pitch: 0.9 }),
        cam: { subject: 'janemba', focus: 'full', angle: 'low' },
        move: { who: 'janemba', to: { at: 'goku', off: [0, 0, -9] }, seconds: 1.6 },
      },
      {
        cam: { subject: 'janemba', focus: 'upper', angle: 'front' },
        say: { who: 'janemba', line: 'Janemba. Ooooooo!', duration: 2.4 },
        hold: 2.5,
      },
    ],
    end(ctx) {
      const { b } = ctx, jb = ctx.cast.janemba, g = ctx.cast.goku, p = ctx.cast.pikkon;
      if (jb && g) {
        SL.data.buuKit.place(jb, SL.data.frKit.at(b, g.pos.x, g.pos.z - 9), 0);
        SL.data.buuKit.faceTo(jb, g.pos);
        jb.setState('scripted', { pose: 'jb_idle', expression: 'grin' });
      }
      if (p) p.setState('scripted', { pose: 'pk_idle', expression: 'angry' });
    },
  };

  /* =================================================================== ACT II */
  S.fr_ssj3_reveal = {
    id: 'fr_ssj3_reveal',
    cast,
    events: [
      // the reveal: all of him, the mane down his back, no brows, the lightning
      {
        pose: [{ who: 'goku', pose: 'g2_stance', face: 'angry', speed: 5 }],
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        shake: { at: 'goku', amount: 0.25 },
        hold: 2.2,
      },
      {
        cam: { subject: 'goku', focus: 'full', angle: 'back', side: 1 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'janemba', pose: 'jb_giggle', face: 'grin', speed: 9 }],
        cam: { subject: 'janemba', focus: 'upper', angle: 'three' },
        sfx: { name: 'giggle', who: 'janemba', vol: 0.9 },
        hold: 1.5,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Okay, Janemba. Let\'s play.', duration: 2.4 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goku;
      if (g) g.setState('free');
    },
  };

  S.fr_evolve = {
    id: 'fr_evolve',
    cast,
    music: { song: 'super_janemba', level: 0 },
    events: [
      // the blast has him: squeezed, shaking
      {
        pose: [{ who: 'janemba', pose: 'jb_compress', face: 'hurt', speed: 10 }],
        cam: { subject: 'janemba', focus: 'full', angle: 'three' },
        tick: (ctx, s) => {
          const jb = ctx.cast.janemba;
          if (!jb) return;
          const sq = 1 - Math.min(0.25, s * 0.12);
          const wob = Math.sin(s * 40) * 0.03;
          jb.model.root.scale.set(jb.model.baseScale * (sq + wob), jb.model.baseScale * sq, jb.model.baseScale * (sq - wob));
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.bolt(jb.chest().add(new V3(Math.sin(ctx.b.frame) * 1.2, Math.cos(ctx.b.frame * 1.3) * 1.2, 0.6)), 1.4, 0xffe0ff);
          ctx.b.camera.addTrauma(0.03);
        },
        sfx: { name: 'rumble', who: 'janemba', vol: 1 },
        hold: 2.1,
      },
      // the shell gives: light out of the cracks
      {
        pose: [{ who: 'janemba', pose: 'jb_crack', face: 'shout', speed: 12 }],
        cam: { subject: 'janemba', focus: 'full', angle: 'low' },
        tick: (ctx) => {
          const b = ctx.b, jb = ctx.cast.janemba;
          if (!jb || b.frame % 3) return;
          const c = jb.chest();
          const dir = new V3(Math.sin(b.frame * 2.1), Math.cos(b.frame * 1.3) * 0.8, Math.cos(b.frame * 2.7)).normalize();
          b.vfx.slash(c.clone().addScaledVector(dir, 0.6), c.clone().addScaledVector(dir, 3.2), 0xffb8f8, 0.25, 0.1);
          b.vfx.sparks(c.clone().addScaledVector(dir, 1.4), 0xffd8ff, 4, 6, 0.08);
        },
        screen: { flash: 0.18, color: '#ff9af0' },
        sfx: { name: 'warpShatter', who: 'janemba', vol: 1 },
        hold: 2,
      },
      // the outer body collapses into pieces — and something narrower stands in the smoke
      {
        call: (ctx) => {
          const b = ctx.b, jb = ctx.cast.janemba, sj = ctx.cast.sj;
          D().cubes(b, jb.pos.clone(), { count: 60, height: jb.height, spread: jb.radius, speed: 9, life: 70, size: 0.34, colors: [0xf2c63a, 0x6a2a8a, 0xffe08a, 0x8a3aa8] });
          b.vfx.explosion(jb.chest(), 2.4, 0xb04aff, { life: 0.5 });
          b.vfx.dust(jb.pos.clone(), 4, 30, 0x3a1a4a);
          jb.model.root.scale.setScalar(jb.model.baseScale);
          jb.setHidden(true);
          if (sj) {
            sj.setPosition(jb.pos.clone());
            SL.data.buuKit.faceTo(sj, ctx.cast.goku.pos);
            sj.setHidden(false);
            sj.setState('scripted', { pose: 'sj_rise', expression: 'closed' });
            if (sj.model.setPropFill) sj.model.setPropFill('sword', 0);
          }
          b.sfx('explosionBig', jb);
          b.cameraTraumaAt(jb.chest(), 0.7);
        },
        mood: { amount: 0.45, color: 0x1a0612, seconds: 0.4 },
        cam: { subject: 'sj', focus: 'wide', angle: 'low', room: 3 },
        hold: 1.6,
      },
      // the smoke thins round a silhouette
      {
        mood: { amount: 0.2, color: 0x1a0612, seconds: 1.4 },
        vfx: { kind: 'dust', at: { at: 'sj', off: [0, 0.2, 0] }, radius: 3, count: 12, color: 0x4a2a5a },
        cam: { subject: 'sj', focus: 'full', focus2: 'upper', angle: 'low' },
        hold: 2.4,
      },
      // the eyes open
      {
        pose: [{ who: 'sj', pose: 'sj_rise', face: 'wicked', speed: 4 }],
        cam: { subject: 'sj', focus: 'face', angle: 'front' },
        sfx: { name: 'kiUp', who: 'sj', pitch: 0.55, vol: 0.9 },
        hold: 1.5,
      },
      // the hand to the spike on his head: the sword comes out of it, growing
      {
        pose: [{ who: 'sj', pose: 'sj_draw', face: 'wicked', speed: 7 }],
        cam: { subject: 'sj', focus: 'upper', angle: 'three', side: 1 },
        sfx: { name: 'swordDraw', who: 'sj', vol: 1 },
        tick: (ctx, s) => {
          const sj = ctx.cast.sj;
          if (!sj) return;
          if (sj.model.setPropFill) sj.model.setPropFill('sword', Math.min(1, s / 1.3));
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(sj.handPos('R'), 1.4, 0xff3a5a, 2, 0.1, 0.25);
        },
        hold: 1.7,
      },
      {
        pose: [{ who: 'sj', pose: 'sj_present', face: 'wicked', speed: 6 }],
        call: (ctx) => ctx.cast.sj && ctx.cast.sj.model.setPropFill && ctx.cast.sj.model.setPropFill('sword', 1),
        cam: { subject: 'sj', focus: 'full', angle: 'three' },
        sfx: { name: 'warpShatter', who: 'sj', pitch: 0.8 },
        music: { song: 'super_janemba', level: 2 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'goku', pose: 'g2_stance', face: 'shock', speed: 6 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'That\'s... not the same guy.', duration: 2.2, style: 'quiet' },
        hold: 2.3,
      },
    ],
    end(ctx) {
      const jb = ctx.cast.janemba, sj = ctx.cast.sj;
      if (jb) {
        jb.model.root.scale.setScalar(jb.model.baseScale);
        jb.setHidden(true);
      }
      if (sj) {
        sj.setHidden(false);
        if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
        sj.setState('scripted', { pose: 'sj_present', expression: 'wicked' });
      }
    },
  };

  /* =================================================================== ACT III — EARTH */
  S.fr_earth_open = {
    id: 'fr_earth_open',
    cast,
    music: { song: 'ominous', level: 1 },
    events: [
      // the sky over the city tears open
      {
        title: { chapter: 'MOVIE · FUSION REBORN', title: 'MEANWHILE, ON EARTH', subtitle: 'While Goku fights in the Other World', duration: 3.6 },
        call: (ctx) => {
          ctx.flags.rift = SL.data.frKit.skyRift(ctx.b, new V3(0, 46, -40), 16);
        },
        cam: { from: [10, 3, 40], to: [6, 5, 30], look: [0, 40, -40], fov: 56, ease: 'inOut' },
        hold: 3.6,
      },
      // the dead come through it — soldiers with halos over their heads
      {
        cam: { subject: 'gohan', with: 'videl', focus: 'medium' },
        pose: [{ who: 'gohan', pose: 'idle', face: 'calm', speed: 4 }, { who: 'videl', pose: 'idle', face: 'shock', speed: 4 }],
        say: { who: 'videl', line: 'This is really freaky, Gohan. What do you think\'s causing this to happen?', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { subject: 'gohan', focus: 'upper', angle: 'three' },
        pose: [{ who: 'gohan', pose: 'idle', face: 'grin', speed: 5 }],
        say: { who: 'gohan', line: 'Hm? I don\'t know, but it\'s nothin\' that the two of us can\'t handle — and it\'s a lot better than doin\' dishes!', duration: 4.6 },
        hold: 4.6,
      },
      {
        cam: { subject: 'videl', focus: 'closeup', angle: 'three', side: -1 },
        pose: [{ who: 'videl', pose: 'idle', face: 'smirk', speed: 4 }],
        say: { who: 'videl', line: 'True.', duration: 1.2 },
        hold: 1.3,
      },
    ],
  };

  S.fr_frieza_meet = {
    id: 'fr_frieza_meet',
    cast,
    music: { song: 'frieza_theme', level: 1 },
    events: [
      {
        show: ['frieza'],
        call: (ctx) => {
          const f = ctx.cast.frieza;
          ctx.b.vfx.flash(f.chest(), 3, 0xd24aff, 0.3, SL.Toon.tex.glow);
          ctx.b.sfx('portalOpen', f);
        },
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk', speed: 4 }],
        cam: { subject: 'frieza', focus: 'full', angle: 'low' },
        say: { who: 'frieza', line: 'I wouldn\'t get overconfident if I were you! The real battle hasn\'t even started yet. Ha ha ha ha ha!', duration: 4.4 },
        hold: 4.5,
      },
      {
        cam: { subject: 'videl', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'videl', pose: 'idle', face: 'shock', speed: 5 }],
        say: { who: 'videl', line: 'Huh?', duration: 1 },
        hold: 1.1,
      },
      {
        cam: { subject: 'gohan', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'gohan', pose: 'idle', face: 'serious', speed: 5 }],
        say: { who: 'gohan', line: 'It\'s Frieza!', duration: 1.6, style: 'shout' },
        hold: 1.7,
      },
      {
        cam: { subject: 'frieza', focus: 'upper', angle: 'three' },
        say: { who: 'frieza', line: 'A common stranger knows my name!? I see that my illustrious reputation precedes me!', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { subject: 'gohan', with: 'frieza', focus: 'medium' },
        say: { who: 'gohan', line: 'You don\'t recognize me, but I\'m no stranger. I fought with you on Namek years ago.', duration: 4 },
        hold: 4.1,
      },
      {
        cam: { subject: 'frieza', focus: 'closeup', angle: 'front' },
        pose: [{ who: 'frieza', pose: 'idle', face: 'shock', speed: 5 }],
        say: { who: 'frieza', line: 'What\'s that!? Ah! You\'re that little brat, aren\'t you!?', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'gohan', focus: 'upper', angle: 'low' },
        pose: [{ who: 'gohan', pose: 'idle', face: 'determined', speed: 5 }],
        say: { who: 'gohan', line: 'I see that you\'ve forgotten my name. Allow me to remind you. I am son of Goku, guardian of all that is good. Gohan!', duration: 5.4 },
        hold: 5.5,
      },
      {
        cam: { subject: 'videl', focus: 'upper', angle: 'three', side: -1 },
        pose: [{ who: 'videl', pose: 'idle', face: 'smirk', speed: 4 }],
        say: { who: 'videl', line: 'Well done. Remember that one, Gohan.', duration: 2.4 },
        hold: 2.5,
      },
      {
        cam: { subject: 'frieza', focus: 'upper', angle: 'low' },
        pose: [{ who: 'frieza', pose: 'idle', face: 'wicked', speed: 4 }],
        say: { who: 'frieza', line: 'I\'d love to kill Goku. But killing his son is the next best thing! Ha ha ha ha!', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { subject: 'gohan', focus: 'closeup', angle: 'front' },
        say: { who: 'gohan', line: 'Yeah? Well, you\'ll never know.', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'frieza', focus: 'medium', angle: 'three' },
        say: { who: 'frieza', line: 'Teach this son of a Saiyan a lesson, men!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
    ],
  };

  S.fr_frieza_end = {
    id: 'fr_frieza_end',
    cast,
    events: [
      // gone: the light takes him back where he came from
      {
        call: (ctx) => {
          const f = ctx.cast.frieza, b = ctx.b;
          b.vfx.explosion(f.chest(), 2.2, 0xffe8a0, { life: 0.45, smoke: false });
          b.vfx.sparks(f.chest(), 0xfff4c0, 30, 12, 0.12);
          b.sfx('soulBurst', f, { vol: 0.8 });
          f.setHidden(true);
        },
        cam: { subject: 'gohan', focus: 'full', angle: 'three' },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          for (const s of ctx.flags.frSoldiers || []) if (s.alive && !s.hidden) s.setState('scripted', { pose: 'hitBody', expression: 'shock' });
        },
        cam: { subject: 'videl', with: 'gohan', focus: 'medium' },
        say: { who: 'videl', line: 'One punch. You didn\'t even break a sweat.', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { subject: 'gohan', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'gohan', pose: 'idle', face: 'grin', speed: 4 }],
        say: { who: 'gohan', line: 'Something big is going on in the Other World. I hope Dad\'s okay.', duration: 3.4, style: 'quiet' },
        hold: 3.5,
      },
    ],
  };

  S.fr_dictator = {
    id: 'fr_dictator',
    cast,
    music: { song: 'dictator_march', level: 1 },
    events: [
      {
        title: { chapter: 'MOVIE · FUSION REBORN', title: 'MEANWHILE, ON EARTH', subtitle: 'Another city · the same afternoon', duration: 3.4 },
        cam: { from: [40, 22, 40], to: [26, 14, 30], look: [0, 2, -6], fov: 52, ease: 'inOut' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'dictator', pose: 'dt_rant', face: 'shout', speed: 9 }],
        cam: { subject: 'dictator', focus: 'upper', angle: 'low' },
        say: { who: 'dictator', line: 'Achtung! This is your new ruler speaking! Surrender or die!', duration: 3.4, style: 'shout' },
        hold: 3.5,
      },
      {
        pose: [{ who: 'dictator', pose: 'dt_idle', face: 'grin', speed: 4 }],
        cam: { subject: 'dictator', focus: 'closeup', angle: 'three' },
        say: { who: 'dictator', line: 'Aha... I love this... it\'s been too long. Do not resist. This country now belongs to me!', duration: 4.4 },
        hold: 4.5,
      },
      {
        pose: [{ who: 'trunks', pose: 'idle', face: 'grin', speed: 5 }, { who: 'goten', pose: 'idle', face: 'shock', speed: 5 }],
        cam: { subject: 'trunks', with: 'goten', focus: 'medium' },
        say: { who: 'kid_trunks', line: 'That guy\'s nuts!', duration: 1.8 },
        hold: 1.9,
      },
      {
        cam: { subject: 'goten', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goten', line: 'Hey, you can\'t call dibs on a whole country!', duration: 2.6, style: 'shout' },
        hold: 2.7,
      },
      {
        pose: [{ who: 'dictator', pose: 'dt_order', face: 'shout', speed: 10 }],
        cam: { subject: 'dictator', focus: 'medium', angle: 'low' },
        say: { who: 'dictator', line: 'Ready, aim, fire!', duration: 1.8, style: 'shout' },
        hold: 1.9,
      },
    ],
  };

  S.fr_boys_gold = {
    id: 'fr_boys_gold',
    cast,
    events: [
      {
        pose: [{ who: 'dictator', pose: 'dt_rant', face: 'shout', speed: 10 }],
        cam: { subject: 'dictator', focus: 'upper', angle: 'low' },
        say: { who: 'dictator', line: 'Regroup, men! Attack!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
      {
        pose: [{ who: 'trunks', pose: 'idle', face: 'smirk', speed: 5 }],
        cam: { subject: 'trunks', focus: 'upper', angle: 'three' },
        say: { who: 'kid_trunks', line: 'This guy is too much. He can\'t read the writing on the wall.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'goten', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { subject: 'goten', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goten', line: 'Ha. He\'s funny.', duration: 1.6 },
        hold: 1.7,
      },
      {
        cam: { subject: 'trunks', with: 'goten', focus: 'medium' },
        say: { who: 'kid_trunks', line: 'Hey, let\'s give him a little scare and turn into Super Saiyans!', duration: 3.2 },
        hold: 3.3,
      },
      {
        cam: { subject: 'goten', focus: 'closeup', angle: 'front' },
        say: { who: 'goten', line: 'Hee hee.', duration: 1.2 },
        hold: 1.3,
      },
    ],
  };

  S.fr_dictator_shock = {
    id: 'fr_dictator_shock',
    cast,
    events: [
      {
        pose: [{ who: 'dictator', pose: 'dt_scared', face: 'shock', speed: 8 }],
        cam: { subject: 'dictator', focus: 'closeup', angle: 'front' },
        say: { who: 'dictator', line: 'Grr... huh? Blonde hair! Blue eyes! Super strength! I should be recruiting them!', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'dictator', pose: 'dt_order', face: 'shout', speed: 10 }],
        cam: { subject: 'dictator', focus: 'upper', angle: 'low' },
        say: { who: 'dictator', line: 'Kill them! Fire! Dummkopf! Shoot them down! They are no match for us! They are inferior!', duration: 4, style: 'shout' },
        hold: 4.1,
      },
    ],
  };

  S.fr_boys_end = {
    id: 'fr_boys_end',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // on his backside in the rubble, the cap over his eyes
      {
        pose: [{ who: 'dictator', pose: 'knockdown', face: 'hurt', speed: 6 }],
        cam: { subject: 'dictator', focus: 'full', angle: 'high' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'goten', pose: 'idle', face: 'grin', speed: 4 }],
        cam: { subject: 'goten', with: 'trunks', focus: 'medium' },
        say: { who: 'goten', line: 'Are we inferior?', duration: 1.8 },
        hold: 1.9,
      },
      {
        pose: [{ who: 'trunks', pose: 'idle', face: 'smirk', speed: 4 }],
        cam: { subject: 'trunks', focus: 'upper', angle: 'three' },
        say: { who: 'kid_trunks', line: 'No. Look at him. He can\'t fly and we\'re almost as tall as he is.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'goten', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goten', line: 'Yeah, and he\'s full grown.', duration: 2 },
        hold: 2.1,
      },
      // and away he goes, as fast as his little legs carry him
      {
        pose: [{ who: 'dictator', pose: 'dt_run', face: 'shock', speed: 12 }],
        cam: { subject: 'trunks', with: 'dictator', focus: 'wide' },
        move: { who: 'dictator', to: { at: 'dictator', off: [0, 0, -22] }, seconds: 2.2 },
      },
    ],
    end(ctx) {
      if (ctx.cast.dictator) ctx.cast.dictator.setHidden(true);
    },
  };

  /* =================================================================== ACT IV — VEGETA */
  S.fr_vegeta_arrive = {
    id: 'fr_vegeta_arrive',
    cast,
    music: { song: 'ominous', level: 1 },
    events: [
      // the sword up over a beaten Goku
      {
        pose: [{ who: 'goku', pose: 'knockdown', face: 'hurt', speed: 6 }, { who: 'sj', pose: 'sj_overheadW', face: 'wicked', speed: 6 }],
        cam: { subject: 'sj', with: 'goku', focus: 'medium', angle: 'low' },
        hold: 1.6,
      },
      // a gold blast out of nowhere knocks the blade aside
      {
        call: (ctx) => {
          const b = ctx.b, sj = ctx.cast.sj;
          const hit = sj.handPos('R');
          b.vfx.explosion(hit, 1.6, 0xffe06a, { life: 0.4 });
          b.vfx.sparks(hit, 0xfff0a0, 24, 12, 0.12);
          b.sfx('kiBlastBig', sj, { pitch: 0.9 });
          b.cameraTraumaAt(hit, 0.5);
          sj.setState('scripted', { pose: 'hitSideL', expression: 'angry', speed: 20 });
        },
        slow: { scale: 0.35, seconds: 0.5 },
        cam: { subject: 'sj', focus: 'upper', angle: 'three' },
        hold: 0.9,
      },
      // VEGETA: a low shot, the halo over him, arms folded
      {
        show: ['vegeta'],
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 4 }],
        call: (ctx) => SL.data.frKit.halo(ctx.b, ctx.cast.vegeta),
        cam: { subject: 'vegeta', focus: 'full', focus2: 'upper', angle: 'low' },
        music: { song: 'vegeta_theme', level: 1 },
        hold: 2.6,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'How many times do I have to tell you that if anyone\'s going to end your existence, it\'s going to be me.', duration: 4.6 },
        hold: 4.7,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 6 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Vegeta!? But how!?', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'vegeta', with: 'goku', focus: 'medium' },
        say: { who: 'vegeta', line: 'I\'ve been trying to answer that question myself, Kakarot. I don\'t know how I got my body back. It was as if death was a dream and I just woke up.', duration: 6 },
        hold: 6.1,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Uh... it must have something to do with the Check-In Station being out of commission.', duration: 3.8 },
        hold: 3.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 5 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'It doesn\'t matter. I\'m here and I\'m ready to fight. That\'s that. Now stay back while I handle this.', duration: 4.6 },
        hold: 4.7,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'But he\'s strong. I don\'t think he can be beat.', duration: 2.8 },
        hold: 2.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'Hmm. Don\'t worry. I have one thing in my favor. I have nothing to lose.', duration: 3.8, style: 'quiet' },
        hold: 3.9,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'What do you mean? Don\'t say that!', duration: 2.2 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 5 }],
        cam: { subject: 'vegeta', with: 'goku', focus: 'medium' },
        say: { who: 'vegeta', line: 'You\'ve been good, Kakarot. I haven\'t. The afterlife quite frankly sucks for me! Fighting him will be a piece o\' cake. Anything\'s better than my existence here.', duration: 6.4 },
        hold: 6.5,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Vegeta, are you okay?', duration: 1.8, style: 'quiet' },
        hold: 1.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shout', speed: 8 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'Am I okay? Do I look okay, Kakarot? The most painful thing is that you\'ve gotten stronger while I\'ve remained the same.', duration: 5.4, style: 'shout' },
        hold: 5.5,
      },
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'medium' },
        say: { who: 'goku', line: 'What you\'re saying is true, Vegeta, but I\'ve been training in the Other World this whole time — it\'s only natural that I\'ve progressed. I\'m more amazed that you\'re just as strong as before, even though you hadn\'t had a body to train in.', duration: 7.6 },
        hold: 7.7,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 7 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'three' },
        say: { who: 'vegeta', line: 'Tah! Don\'t belittle me with your pity, Kakarot!', duration: 2.8, style: 'shout' },
        hold: 2.9,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goku, v = ctx.cast.vegeta, sj = ctx.cast.sj;
      if (v) {
        v.setHidden(false);
        SL.data.frKit.halo(ctx.b, v);
      }
      if (sj) sj.setState('scripted', { pose: 'sj_idle', expression: 'wicked' });
      if (g) g.setState('scripted', { pose: 'idle', expression: 'serious' });
    },
  };

  S.fr_proposal = {
    id: 'fr_proposal',
    cast,
    music: { song: 'fusion_theme', level: 1 },
    events: [
      // behind the spiked rock: Vegeta down on one knee, clutching his bleeding shoulder; Goku over him
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'exhausted', speed: 5 }, { who: 'vegeta', pose: 'v_kneelShoulder', face: 'grit', speed: 5 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'wide', angle: 'low' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'nervous', speed: 8 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'We\'d better get started, Vegeta. Are you ready? It\'s a simple technique, but we have to harmonize our spiritual energies or it won\'t work.', duration: 5.6 },
        hold: 5.7,
      },
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'medium' },
        say: { who: 'goku', line: 'Our power levels have to be exactly the same. We also have to move in perfect sync. Your posture has to mirror mine.', duration: 4.8 },
        hold: 4.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_kneelShoulder', face: 'shock', speed: 6 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'My what?', duration: 1.4 },
        hold: 1.5,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'I\'ll show you. Don\'t worry. It\'s not that complicated. It\'s kind of like a cross between a traditional fighting stance and water ballet — except without the water.', duration: 6 },
        hold: 6.1,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_kneelShoulder', face: 'shout', speed: 9 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'low' },
        say: { who: 'vegeta', line: 'Ballet!!!?', duration: 1.6, style: 'shout' },
        hold: 1.7,
      },
      // Goku demonstrates, all of it, alone — Vegeta watching in horror
      {
        pose: [{ who: 'goku', pose: 'fd_out', face: 'grin', speed: 8 }],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        say: { who: 'goku', line: 'Just watch for a second. It\'s easier to show you than to explain it. Fuuuu...', duration: 3.2 },
        hold: 1.6,
      },
      { pose: [{ who: 'goku', pose: 'fd_stepA', face: 'grin', speed: 8 }], cam: { subject: 'goku', focus: 'full', angle: 'front' }, hold: 0.7 },
      { pose: [{ who: 'goku', pose: 'fd_stepB', face: 'grin', speed: 8 }], hold: 0.7 },
      { pose: [{ who: 'goku', pose: 'fd_fu', face: 'grin', speed: 10 }], hold: 0.9 },
      {
        pose: [{ who: 'vegeta', pose: 'v_kneelShoulder', face: 'shock', speed: 6 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: '...now think of two rivers flowing toward one another that become narrower and narrower the closer they get to each other...', duration: 4.4 },
        hold: 2.2,
      },
      { pose: [{ who: 'goku', pose: 'fd_sion', face: 'grin', speed: 10 }], cam: { subject: 'goku', focus: 'full', angle: 'three' }, hold: 2.3 },
      {
        pose: [{ who: 'goku', pose: 'fd_ha', face: 'shout', speed: 12 }],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        say: { who: 'goku', line: '...sion... note the opposing position of knee and arms... HA! The two rivers converge at two single points, the points give way under the pressure and the rivers flood into each other and become one.', duration: 6.6 },
        hold: 6.7,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_kneelShoulder', face: 'shout', speed: 9 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'You\'re insane! I\'m not posing like that!', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'nervous', speed: 5 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Why not? This is how it\'s done. There\'s no other way to fuse. Come on...', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_kneelShoulder', face: 'angry', speed: 7 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'Grrr... we\'re warriors, Kakarot. Not ballerinas!', duration: 2.8, style: 'shout' },
        hold: 2.9,
      },
      {
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        say: { who: 'vegeta', line: 'Fuse with you? I\'d rather die!', duration: 2.2 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'medium' },
        say: { who: 'goku', line: 'But, Vegeta, you\'re already dead.', duration: 2.4 },
        hold: 2.6,
      },
      // the silence that is a yes
      {
        pose: [{ who: 'vegeta', pose: 'v_kneelShoulder', face: 'grit', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three', side: -1 },
        hold: 2,
      },
    ],
  };

  /* =================================================================== ACT V — VEKU */
  S.fr_veku_birth = {
    id: 'fr_veku_birth',
    cast,
    music: { song: 'fusion_theme', level: 0 },
    events: [
      // the light where they met; something in the smoke that is the wrong shape
      {
        call: (ctx) => ctx.b.vfx.dust(ctx.cast.veku.pos.clone(), 4, 20, 0xffd8f0),
        pose: [{ who: 'veku', pose: 'vk_idle', face: 'closed', speed: 3 }],
        mood: { amount: 0.4, color: 0x14101c, seconds: 0.3 },
        cam: { subject: 'veku', focus: 'full', angle: 'low' },
        hold: 1.8,
      },
      // the smoke clears: a short, round, pale fusion, wheezing
      {
        mood: { amount: 0, seconds: 1.4 },
        pose: [{ who: 'veku', pose: 'vk_idle', face: 'hurt', speed: 6 }],
        cam: { subject: 'veku', focus: 'full', focus2: 'upper', angle: 'front' },
        sfx: { name: 'boing', who: 'veku', pitch: 0.7, vol: 0.6 },
        hold: 2.4,
      },
      {
        cam: { subject: 'veku', focus: 'face', angle: 'three' },
        hold: 1.4,
      },
      // Janemba looks at it
      {
        pose: [{ who: 'sj', pose: 'sj_idle', face: 'neutral', speed: 3 }],
        cam: { subject: 'sj', focus: 'upper', angle: 'three' },
        hold: 1.6,
      },
      // a punch with everything he has: it bounces off
      {
        pose: [{ who: 'veku', pose: 'vk_slap', face: 'angry', speed: 14 }],
        call: (ctx) => {
          ctx.b.vfx.impact(ctx.cast.sj.chest(), 1, 0xffffff);
          ctx.b.sfx('punchLight', ctx.cast.sj, { pitch: 1.6, vol: 0.5 });
        },
        cam: { subject: 'veku', with: 'sj', focus: 'medium' },
        hold: 1.2,
      },
      {
        pose: [{ who: 'veku', pose: 'vk_stumble', face: 'shock', speed: 10 }],
        cam: { subject: 'veku', focus: 'full', angle: 'three' },
        sfx: { name: 'boing', who: 'veku', pitch: 1.2 },
        hold: 1.2,
      },
      // the sword comes up
      {
        pose: [{ who: 'sj', pose: 'sj_overheadW', face: 'wicked', speed: 6 }, { who: 'veku', pose: 'vk_idle', face: 'shock', speed: 8 }],
        cam: { subject: 'sj', with: 'veku', focus: 'medium', angle: 'low' },
        hold: 1.3,
      },
    ],
  };

  S.fr_kais = {
    id: 'fr_kais',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      {
        pose: [
          { who: 'king_kai', pose: 'kk_antennae', face: 'shock', speed: 6 },
          { who: 'south_kai', pose: 'idle', face: 'grin', speed: 4 },
          { who: 'west_kai', pose: 'idle', face: 'smirk', speed: 4 },
          { who: 'east_kai', pose: 'idle', face: 'shock', speed: 4 },
          { who: 'grand_kai', pose: 'idle', face: 'calm', speed: 4 },
        ],
        cam: { subject: 'king_kai', focus: 'upper', angle: 'front' },
        say: { who: 'king_kai', line: 'What a fiasco! His butt\'s even bigger than mine! Oh no!', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'south_kai', focus: 'upper', angle: 'three' },
        say: { who: 'south_kai', line: 'I know you decided on Gogeta, but in this particular form I think he looks more like Veku.', duration: 3.8 },
        hold: 3.9,
      },
      {
        cam: { subject: 'west_kai', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'west_kai', line: 'Veku the Blimp.', duration: 1.8 },
        hold: 1.9,
      },
      {
        cam: { subject: 'east_kai', focus: 'upper', angle: 'three' },
        say: { who: 'east_kai', line: 'I got my book of names if you want to take a look, North Kai.', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'grand_kai', with: 'king_kai', focus: 'medium' },
        say: { who: 'grand_kai', line: 'It always takes a crisis for you four to be nice to each other.', duration: 3.2 },
        hold: 3.3,
      },
      {
        cam: { subject: 'king_kai', focus: 'closeup', angle: 'front' },
        say: { who: 'king_kai', line: 'Gosh, you\'re right.', duration: 1.6 },
        hold: 1.7,
      },
      {
        cam: { subject: 'west_kai', with: 'south_kai', focus: 'medium' },
        say: { who: 'west_kai', line: 'What an artful dodger.', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'south_kai', focus: 'closeup', angle: 'three' },
        say: { who: 'south_kai', line: 'Hoo-hoo! Yeah! Veku is confounding him with his unpredictable movement.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'king_kai', focus: 'upper', angle: 'three' },
        say: { who: 'king_kai', line: 'And with his gas attacks.', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'grand_kai', focus: 'upper', angle: 'front' },
        say: { who: 'grand_kai', line: 'At this rate, old bubble-butt might actually last the entire thirty minutes.', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'king_kai', pose: 'kk_antennae', face: 'nervous', speed: 6 }],
        cam: { subject: 'king_kai', focus: 'closeup', angle: 'front' },
        say: { who: 'king_kai', line: 'I hope so. If he doesn\'t, we\'re sunk.', duration: 2.4 },
        hold: 2.5,
      },
    ],
  };

  S.fr_veku_timeup = {
    id: 'fr_veku_timeup',
    cast,
    music: { song: 'ominous', level: 1 },
    events: [
      // Janemba over the open ground, hunting for them
      {
        pose: [{ who: 'sj', pose: 'sj_float', face: 'wicked', speed: 4 }],
        cam: { subject: 'sj', focus: 'full', angle: 'low' },
        sfx: { name: 'giggle', who: 'sj', pitch: 0.7, vol: 0.6 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'exhausted', speed: 5 }, { who: 'vegeta', pose: 'idle', face: 'shout', speed: 8 }],
        cam: { subject: 'vegeta', with: 'goku', focus: 'medium' },
        say: { who: 'vegeta', line: 'Kakarot, your fusion technique almost got us both killed! Are you out of your mind?!', duration: 3.8, style: 'shout' },
        hold: 3.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'nervous', speed: 5 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Hey, sorry! I didn\'t know! Something must\'ve gone wrong.', duration: 3 },
        hold: 3.1,
      },
      // King Kai, by telepathy (his voice only)
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'king_kai', line: 'Goku, the two of you weren\'t perfectly symmetrical! Vegeta\'s hand wasn\'t in the proper position!', duration: 4.2 },
        hold: 4.3,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'medium' },
        say: { who: 'goku', line: 'Oh, so it wasn\'t the technique, it was the execution. Watch those fingers. The index finger must be perfectly stretched.', duration: 5 },
        hold: 5.1,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock', speed: 7 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'You mean we turned into that blimp because I bent one lousy finger?!', duration: 3.4, style: 'shout' },
        hold: 3.5,
      },
      // neither of them can take him alone, and both of them know it
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 8 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Forget the dance. I\'ll finish him myself!', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'serious', speed: 5 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'medium' },
        say: { who: 'goku', line: 'We both tried that, Vegeta. On our own, he takes us apart one at a time.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'One more try — done right. It\'s the only real chance we\'ve got.', duration: 3 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 5 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'three' },
        say: { who: 'vegeta', line: 'Fine!', duration: 1.2, style: 'shout' },
        hold: 1.4,
      },
      // ...and the demon has stopped looking at the open ground: he turns toward the rock
      {
        call: (ctx) => {
          if (ctx.b.story.huntStop) ctx.b.story.huntStop();
          SL.Cinema.turnTo(ctx, ctx.cast.sj, 'goku', 24);
        },
        cam: { subject: 'sj', focus: 'upper', angle: 'low' },
        sfx: { name: 'giggle', who: 'sj', pitch: 0.6, vol: 0.8 },
        hold: 1.6,
      },
    ],
  };

  /* =================================================================== ACT VI — GOGETA */
  S.fr_gogeta_birth = {
    id: 'fr_gogeta_birth',
    cast,
    music: { song: 'gogeta_z_arrival', level: 0 },
    events: [
      // a column of gold and every other colour, up into the warped sky
      {
        call: (ctx) => {
          const b = ctx.b, gg = ctx.cast.gogeta;
          SL.data.frGogeta.column(b, gg.pos.clone(), 2.6);
          b.sfx('transformBurst', gg, { pitch: 0.8, vol: 1.2 });
          b.sfx('kaiokenBoom', gg, { pitch: 0.7 });
          b.cameraTraumaAt(gg.chest(), 0.7);
        },
        screen: { flash: 0.3, color: '#fff0b0' },
        cam: { from: { at: 'gogeta', off: [-16, 3, 22] }, look: { at: 'gogeta', off: [0, 13, 0] }, fov: 60 },
        hold: 2.8,
      },
      // the dust; a silhouette standing in the light
      {
        call: (ctx) => {
          const gg = ctx.cast.gogeta;
          // no aura yet: a figure standing in the light, the glow BEHIND him (a backlight, not a gold screen)
          gg.auraOff = true;
          ctx.b.vfx.dust(gg.pos.clone().addScaledVector(gg.forward, -2.5), 3, 10, 0xd8c8a0);
        },
        mood: { amount: 0.55, color: 0x18120a, seconds: 0.3 },
        pose: [{ who: 'gogeta', pose: 'gg_arrival', face: 'closed', speed: 3 }],
        cam: { subject: 'gogeta', focus: 'full', angle: 'low' },
        hold: 2,
      },
      // the light fades enough to see him: the vest, the collar, the sash, the gold hair
      {
        mood: { amount: 0, seconds: 1.8 },
        cam: { subject: 'gogeta', focus: 'full', focus2: 'upper', angle: 'low' },
        hold: 2.6,
      },
      // the eyes
      {
        pose: [{ who: 'gogeta', pose: 'gg_rise', face: 'focused', speed: 4 }],
        cam: { subject: 'gogeta', focus: 'face', angle: 'front' },
        sfx: { name: 'kiUp', who: 'gogeta', pitch: 0.7 },
        hold: 1.4,
      },
      // he steps forward out of it
      {
        call: (ctx) => {
          // the aura comes back as he steps out, kept thin until the fight
          ctx.cast.gogeta.auraOff = false;
        },
        pose: [{ who: 'gogeta', pose: 'gg_ready', face: 'cold', speed: 5 }],
        cam: { subject: 'gogeta', focus: 'full', angle: 'three' },
        move: { who: 'gogeta', to: { at: 'gogeta', local: [0, 0, 2.4] }, seconds: 1.2 },
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_oneHand', face: 'cold', speed: 6 }],
        cam: { subject: 'gogeta', focus: 'upper', angle: 'low' },
        say: { who: 'gogeta', line: 'I am not Goku or Vegeta! I am Gogeta!', duration: 3 },
        music: { song: 'gogeta_z_arrival', level: 1 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'sj', pose: 'sj_present', face: 'angry', speed: 6 }],
        cam: { subject: 'sj', focus: 'upper', angle: 'three' },
        hold: 1.2,
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_twoFinger', face: 'cold', speed: 6 }],
        cam: { subject: 'gogeta', focus: 'closeup', angle: 'three' },
        say: { who: 'gogeta', line: 'It\'s over, Janemba! I\'ve come for you!', duration: 2.6 },
        hold: 2.7,
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_fight', face: 'cold', speed: 8 }],
        cam: { subject: 'gogeta', with: 'sj', focus: 'medium' },
        say: { who: 'gogeta', line: 'Every force you create has an echo! Your own bad energy will be your undoing!', duration: 3.8 },
        hold: 3.9,
      },
    ],
    end(ctx) {
      const gg = ctx.cast.gogeta;
      if (gg) gg.auraOff = false;
    },
  };

  S.fr_farewell = {
    id: 'fr_farewell',
    cast,
    music: { song: 'bittersweet', level: 1 },
    events: [
      // the world put right: the warp drains away, the floating things come down and vanish, the crystal melts
      {
        call: (ctx) => {
          SL.data.frKit.warp(ctx.b, 0, 6);
          ctx.b.after(150, () => {
            SL.data.frKit.barrier(ctx.b, 0, 2.4);
            ctx.b.sfx('soulBurst', null, { at: lm(ctx, 'barrier'), vol: 0.8 });
          });
        },
        cam: { from: [30, 24, 46], to: [18, 14, 30], look: [0, 6, -40], fov: 54, fov2: 48, ease: 'inOut' },
        hold: 6.4,
      },
      {
        cam: { from: [0, 4, -4], to: [0, 6, -14], look: [0, 9, -52], fov: 46, ease: 'inOut' },
        hold: 2.8,
      },
      // the two of them, side by side on the cloud
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 3 }, { who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 3 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'wide', angle: 'low' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'soft', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Vegeta, thanks.', duration: 2, style: 'quiet' },
        hold: 2.1,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'For what? I should be thanking you, Kakarot.', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'Nah, what do you mean? I loved every minute.', duration: 2.8 },
        hold: 2.9,
      },
      // a rare, small smile — and he looks away before anybody can see it
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        hold: 1.8,
      },
      // the halo stays; the body goes, as gold light, back to where he rests
      {
        cam: { subject: 'vegeta', with: 'goku', focus: 'medium' },
        tick: (ctx, s) => {
          const v = ctx.cast.vegeta, b = ctx.b;
          if (!v || v.hidden) return;
          if (b.frame % 2 === 0) {
            const p = v.pos.clone().add(new V3(Math.sin(b.frame * 1.3) * 0.4, (b.frame * 0.037) % 1 * v.height, Math.cos(b.frame * 0.9) * 0.4));
            b.vfx.add.emit(p.x, p.y, p.z, 0, 1.8, 0, 1, 0.86, 0.4, 0.9, 0.09, 1.4, { drag: 0.4 });
          }
          if (v.model.setTint && b.frame % 4 === 0) v.model.setTint(0xfff0b0, Math.min(0.9, s * 0.35));
          if (s > 2.6) {
            v.setHidden(true);
            if (v.halo) v.halo.userData.off = true;
            b.vfx.sparks(v.chest(), 0xfff0b0, 30, 6, 0.1);
            b.sfx('soulBurst', v, { vol: 0.5 });
          }
        },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'soft', speed: 2 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Goodbye, my friend.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // the last shot: Goku alone in front of the restored station, the gold sky back
      {
        cam: { from: { at: 'goku', off: [3, 1.2, 7] }, to: { at: 'goku', off: [6, 7, 20] }, look: { at: 'goku', off: [0, 4, -30] }, fov: 50, fov2: 56, ease: 'inOut' },
        hold: 4.2,
      },
    ],
    end(ctx) {
      const b = ctx.b, v = ctx.cast.vegeta;
      if (b.stage.setWarp) b.stage.setWarp(0);
      if (b.stage.setBarrier) b.stage.setBarrier(0);
      if (v) {
        v.setHidden(true);
        if (v.model.setTint) v.model.setTint(0x000000, 0);
        if (v.halo) v.halo.userData.off = true;
      }
    },
  };

  void arr;
})();
