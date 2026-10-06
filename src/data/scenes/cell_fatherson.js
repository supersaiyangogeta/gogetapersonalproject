/*
 * SCENES — the end of Cell (mission cell_fatherson, rebuilt 2026-10-01), from the owner's brief.
 *
 *   cf_return        the smoke; a beam through Trunks' chest — on camera; Super Perfect Cell walks out
 *   cf_rage          Vegeta's barrage; untouched; swatted; the blast at Vegeta; Gohan's dive; the arm
 *   cf_despair       one knee, the arm, the guttering aura; Cell's solar-system Kamehameha stance
 *   cf_voice         King Kai's link: his father's voice; he stands on one leg, side-on; a gold ghost
 *                    of Goku behind him, a hand on his shoulder
 *   cf_disintegrate  the beam doubles; ash, skin, body, and the purple core that tries to regrow
 *   cf_after         the trench; black hair; the fall forward, smiling; Vegeta on a rock
 *
 * Dialogue is paraphrased English written for this project, following the owner's brief.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const CK = () => SL.data.cellKit;

  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const ring = (ctx, x, z) => CK().onRing(ctx.b, x, z);
  const ground = (ctx, v, lift = 0) => CK().ground(ctx.b, v, lift);
  const faceTo = (f, p) => CK().faceTo(f, p);

  /* ============================================================================ RETURN */
  S.cf_return = {
    id: 'cf_return',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'smoke', ring(ctx, 0, -6));
          st.gohan.setState('scripted', { pose: 'kneelGrieve', expression: 'hurt' });
        },
        mood: { amount: 0.3, color: 0x2a2620, seconds: 1 },
        cam: { from: { at: 'smoke', off: [6, 1.4, 14] }, to: { at: 'smoke', off: [4, 1.2, 11] }, look: { at: 'smoke', off: [0, 1.2, 0] }, fov: 46 },
        tick: (ctx) => {
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.dust(ctx.cast.smoke.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 5, 0.4, Math.cos(ctx.b.frame * 1.3) * 4)), 3, 3, 0xb8b4c4);
        },
        hold: 3,
      },
      {
        pose: [{ who: 'trunks', pose: 'ft_calm', face: 'calm', speed: 2 }],
        cam: { from: { at: 'trunks', local: [0.3, 0.3, 1.6] }, look: { at: 'trunks:head' }, fov: 34 },
        say: { who: 'future_trunks', line: 'Is it... is it over?', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      // a point of light in the smoke — and a thin beam straight through his chest
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const src = ctx.cast.smoke.pos.clone().add(new V3(0, 1.4, 0));
          b.vfx.flash(src, 0.8, 0xffe890, 0.2, SL.Toon.tex.glow);
          const to = st.trunks.chest();
          const far = to.clone().add(to.clone().sub(src).normalize().multiplyScalar(20));
          for (let s = 0; s <= 24; s++) b.vfx.trail(src.clone().lerp(far, s / 24), 0xffe890, 0.14, 0.5);
          b.vfx.sparks(to, 0xffe890, 18, 7, 0.08);
          b.sfx('kiBlast', null, { at: src, pitch: 1.8, vol: 1.1 });
          b.sfx('punchHeavy', st.trunks, { pitch: 0.5 });
        },
        pose: [{ who: 'trunks', pose: 'pierced', face: 'shock', speed: 30 }],
        slow: { scale: 0.2, seconds: 1.4 },
        cam: { from: { at: 'trunks', local: [1.4, 0.2, 1.2] }, look: { at: 'trunks', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1.6,
      },
      // his eyes; the light goes out of them
      {
        pose: [{ who: 'trunks', pose: 'pierced', face: 'ko', speed: 2 }],
        cam: { from: { at: 'trunks:face', local: [0.1, 0.16, 0.75] }, look: { at: 'trunks:head', off: [0, 0.15, 0] }, fov: 32 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.f0 = st.trunks.pos.clone();
          CK().toForm(st.trunks, 'base');
          st.trunks.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
          pt(ctx, 'fall', st.trunks.pos);
        },
        cam: { from: { at: 'fall', off: [0.4, 3.4, 1.6] }, look: { at: 'fall', off: [0, 0.2, 0] }, fov: 40 },
        tick: (ctx, t) => {
          if (t > 0.4 && !ctx.thud) {
            ctx.thud = true;
            ctx.b.vfx.dust(ctx.cast.fall.pos, 1.2, 8, 0xd8d4e2);
            ctx.b.sfx('groundImpact', story(ctx).trunks, { vol: 0.6 });
          }
        },
        hold: 2.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'stand', face: 'shock', speed: 2 }],
        cam: { from: { at: 'vegeta:face', local: [0.15, 0.16, 0.8] }, look: { at: 'vegeta:head', off: [0, 0.15, 0] }, fov: 32 },
        say: { who: 'vegeta', line: '...Trunks?', duration: 2, style: 'quiet' },
        hold: 2.4,
      },
      // out of the smoke, crackling with gold lightning
      {
        call: (ctx) => {
          const st = story(ctx), c = st.cell, K = CK();
          c.setHidden(false);
          c.alive = true;
          c._gone = false;
          c.untargetable = true;
          K.toForm(c, 'perfect');
          K.swell(ctx.m, c, 1, 0);
          K.superAura(c);
          K.place(c, ring(ctx, 0, -8));
          faceTo(c, st.gohan.pos);
          ctx.w0 = c.pos.clone();
          ctx.w1 = ring(ctx, 0, -3.5);
          c.setState('scripted', { pose: 'run', expression: 'smirk', speed: 4 });
        },
        music: { song: 'finale', level: 3 },
        cam: { from: { at: 'smoke', off: [2.4, 0.8, 8] }, look: { at: 'cell', off: [0, 0.4, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, k = Math.min(1, t / 2.6);
          c.setPosition(ctx.w0.clone().lerp(ctx.w1, k));
          c.prevPos.copy(c.pos);
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.bolt(c.chest().add(new V3(Math.sin(ctx.b.frame) * 0.6, Math.cos(ctx.b.frame) * 0.8, 0.2)), 1.2, 0xfff3a0);
        },
        hold: 2.8,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk', speed: 3, aura: 0.6 }],
        cam: { from: { at: 'cell', local: [0.4, 0.25, 1.8] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'Miss me? My core survived the blast. And my Saiyan cells made me stronger for nearly dying.', duration: 4.6 },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'cell', local: [-0.6, 0.3, 1.6] }, look: { at: 'cell:head' }, fov: 34 },
        say: { who: 'cell', line: 'I even picked up your father\'s little trick on the way back. Instant Transmission.', duration: 3.8 },
        hold: 4,
      },
    ],
    end(ctx) {
      const st = story(ctx), c = st.cell, K = CK();
      K.watch(st.trunks, st.trunks.pos.clone(), 'knockdown', 'ko');
      st.trunks._dead = true;
      c.setHidden(false);
      c.alive = true;
      K.toForm(c, 'perfect');
      K.superAura(c);
      K.place(c, ring(ctx, 0, -3.5));
      faceTo(c, st.gohan.pos);
      ctx.m.flags.trunksKilled = true;
    },
  };

  /* ============================================================================ RAGE */
  S.cf_rage = {
    id: 'cf_rage',
    cast,
    auraCap: 0.15,
    music: { song: 'gohan_theme', level: 5 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          CK().toForm(st.vegeta, 'ssj');
          ctx.b.vfx.ring(st.vegeta.chest(), 5, 0xffe25a, 0.5);
        },
        pose: [{ who: 'vegeta', pose: 'v_galickCharge', face: 'shout', speed: 8, aura: 1 }],
        shake: { at: 'vegeta', amount: 0.6 },
        cam: { from: { at: 'vegeta', local: [0.6, 0.1, 2] }, look: { at: 'vegeta:head' }, fov: 36 },
        say: { who: 'vegeta', line: 'TRUNKS!!!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      // the barrage: everything he has, as fast as he can throw it
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, c = st.cell;
          v.grounded = false;
          CK().placeAir(v, c.pos.clone().add(new V3(-6, 3.2, 7)));
          faceTo(v, c.pos);
          pt(ctx, 'cellAt', c.chest());
        },
        cam: { from: { at: 'cellAt', off: [7, 2, 7] }, look: { at: 'cellAt', off: [-2, 0.6, 2] }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b, v = st.vegeta, c = st.cell;
          if (b.frame % 5 === 0 && t < 3) {
            const from = v.chest();
            v.setState('scripted', { pose: (b.frame / 5) % 2 ? 'blastR' : 'blastL', expression: 'shout', speed: 40 });
            for (let s = 0; s <= 6; s++) b.vfx.trail(from.clone().lerp(c.chest(), s / 6), 0xffe890, 0.3, 0.2);
            b.vfx.explosion(c.chest().add(new V3(Math.sin(b.frame) * 0.5, Math.cos(b.frame) * 0.5, 0)), 0.8, 0xffd890, { smoke: true });
            b.sfx('kiBlast', v, { pitch: 1 + Math.sin(b.frame) * 0.1, vol: 0.7 });
            b.camera.addTrauma(0.05);
          }
        },
        say: { who: 'vegeta', line: 'DIE! DIE! DIEEE!', duration: 2.4, style: 'shout' },
        hold: 3.2,
      },
      // the smoke clears: not a scratch
      {
        pose: [{ who: 'cell', pose: 'armsCrossed', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'cell', local: [0.5, 0.25, 2] }, look: { at: 'cell:head' }, fov: 36 },
        tick: (ctx) => {
          if (ctx.b.frame % 8 === 0) ctx.b.vfx.dust(story(ctx).cell.chest(), 1.6, 2, 0xc8c4d0);
        },
        say: { who: 'cell', line: 'Is that all?', duration: 1.8 },
        hold: 2,
      },
      // swatted aside like a fly
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, c = st.cell;
          CK().placeAir(v, c.chest().add(c.forward.clone().setY(0).normalize().multiplyScalar(1).add(new V3(0, -0.6, 0))));
          faceTo(v, c.pos);
          v.setState('scripted', { pose: 'punchR', expression: 'shout' });
        },
        pose: [{ who: 'cell', pose: 'cl_swat', face: 'calm', speed: 30 }],
        cam: { from: { at: 'cell', local: [2.2, 0.4, 1.4] }, look: { at: 'cell', off: [0, 0.4, 0] }, fov: 40 },
        hold: 0.35,
      },
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, b = ctx.b;
          ctx.v0 = v.pos.clone();
          ctx.v1 = ground(ctx, new V3(-13, 0, 14));
          v.setState('scripted', { pose: 'tumble', expression: 'hurt' });
          b.sfx('punchHeavy', v, { pitch: 0.5, vol: 1.4 });
          b.vfx.ring(v.chest(), 2, 0xffffff, 0.3);
        },
        cam: { from: { at: 'cell', local: [-3, 1.6, -5] }, look: { at: 'vegeta' }, fov: 52 },
        tick: (ctx, t) => {
          const v = story(ctx).vegeta, k = Math.min(1, t / 0.7);
          const p = ctx.v0.clone().lerp(ctx.v1, k);
          p.y += Math.sin(k * Math.PI) * 2;
          v.setPosition(p);
          v.prevPos.copy(p);
          if (k >= 1 && !ctx.crashed) {
            ctx.crashed = true;
            ctx.b.stage.crater(ctx.v1, 2.6, 0.5, null);
            ctx.b.vfx.dust(ctx.v1, 2, 12);
            ctx.b.sfx('groundImpact', v, { vol: 1.2 });
            CK().place(v, ctx.v1);
            v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
          }
        },
        hold: 1.3,
      },
      // a palm at him: lethal, focused
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.cell, st.vegeta.pos);
        },
        pose: [{ who: 'cell', pose: 'blastR', face: 'wicked', speed: 10 }],
        cam: { from: { at: 'cell', local: [-1, 0.5, -1.8] }, look: { at: 'vegeta' }, fov: 42 },
        say: { who: 'cell', line: 'Since you\'re in such a hurry to join your son...', duration: 2.6 },
        hold: 2.4,
      },
      // Gohan throws himself between them
      {
        call: (ctx) => {
          const st = story(ctx), g = st.gohan, b = ctx.b;
          const mid = st.cell.pos.clone().lerp(st.vegeta.pos, 0.55);
          g.setPosition(ground(ctx, mid, 0.6));
          g.grounded = false;
          faceTo(g, st.cell.pos);
          const from = st.cell.chest();
          for (let s = 0; s <= 10; s++) b.vfx.trail(from.clone().lerp(g.chest(), s / 10), 0xffe890, 0.5, 0.3);
          b.vfx.explosion(g.chest(), 1.3, 0xffe890, { smoke: true });
          b.sfx('explosionBig', g, { vol: 1.3 });
          b.cameraTraumaAt(g.chest(), 0.9);
          pt(ctx, 'hit', g.chest());
        },
        pose: [{ who: 'gohan', pose: 'shieldDive', face: 'shout', speed: 30 }],
        screen: { flash: 0.2, color: '#fff0c8' },
        slow: { scale: 0.25, seconds: 1 },
        cam: { from: { at: 'hit', off: [3.4, 1, 3] }, look: { at: 'hit' }, fov: 44 },
        say: { who: 'teen_gohan', line: 'NO!', duration: 1, style: 'shout' },
        hold: 1.4,
      },
      // the smoke goes: his left arm hangs useless, blood dripping onto the burnt ground
      {
        call: (ctx) => {
          const st = story(ctx), g = st.gohan;
          CK().place(g, ground(ctx, g.pos));
          g.setTorn(true);
          ctx.drip = 0;
        },
        pose: [{ who: 'gohan', pose: 'cradleArm', face: 'hurt', speed: 3, aura: 0.15 }],
        cam: { from: { at: 'gohan', local: [0.8, 0.1, 1.8] }, look: { at: 'gohan', off: [0, -0.1, 0] }, fov: 38 },
        tick: (ctx) => {
          const g = story(ctx).gohan, b = ctx.b;
          if (b.frame % 18 === 0) {
            const hand = g.model.joints.handL ? (g.model.root.updateMatrixWorld(true), g.model.joints.handL.getWorldPosition(new V3()).sub(g.object.position).add(g.pos)) : g.chest();
            b.vfx.sparks(hand, 0x9a0a14, 2, 0.6, 0.05);
          }
        },
        sfx: { name: 'boneCrack', who: 'gohan', vol: 0.8, pitch: 0.8 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      CK().watch(st.vegeta, ground(ctx, new V3(-13, 0, 14)), 'knockdown', 'hurt', st.cell.pos);
      st.gohan.setTorn(true);
      ctx.m.flags.armBroken = true;
    },
  };

  /* ============================================================================ DESPAIR */
  S.cf_despair = {
    id: 'cf_despair',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 2 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          K.place(st.gohan, ring(ctx, 0, 9), Math.PI);
          faceTo(st.gohan, st.cell.pos);
          st.gohan.setRage(true, 0.6);
        },
        pose: [{ who: 'gohan', pose: 'cradleArm', face: 'hurt', speed: 3, aura: 0.12 }],
        cam: { from: { at: 'gohan:face', local: [0.2, 0.16, 0.9] }, to: { at: 'gohan:face', local: [0.15, 0.16, 0.75] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        tick: (ctx) => {
          // the SSJ2 aura flickering, on the edge of going out
          const g = story(ctx).gohan;
          g.sd.aura = (ctx.b.frame % 20) < 7 ? 0.04 : 0.18;
        },
        say: { who: 'teen_gohan', line: 'It\'s over... half my power\'s gone, my arm\'s useless... and it\'s all my fault. Because I was arrogant...', duration: 5.2, style: 'quiet' },
        hold: 5.4,
      },
      // the other side of the field: the deep crouch, the hands at his hip, lightning in white, gold and red
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          K.placeAir(st.cell, ring(ctx, 0, -12).add(new V3(0, 6, 0)), 0);
          faceTo(st.cell, st.gohan.pos);
          pt(ctx, 'cellAt', st.cell.pos);
        },
        pose: [{ who: 'cell', pose: 'cl_superKameCharge', face: 'wicked', speed: 4, aura: 0.9 }],
        cam: { from: { at: 'cell', local: [1.6, -0.6, 3.6] }, to: { at: 'cell', local: [1.2, -0.4, 2.8] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 42 },
        tick: (ctx) => {
          const b = ctx.b, c = story(ctx).cell;
          if (b.frame % 3 === 0) b.vfx.bolt(c.chest().add(new V3(Math.sin(b.frame) * 1.2, Math.cos(b.frame * 1.7), 0.6)), 1.6, [0xffffff, 0xfff3a0, 0xff6a4a][(b.frame / 3) % 3 | 0]);
          if (b.frame % 10 === 0) b.vfx.rock(ground(ctx, c.pos.clone().add(new V3(Math.sin(b.frame) * 8, 0, Math.cos(b.frame) * 8)), 0.2), new V3(0, 5, 0), 0.4, b.stage.rockColor);
          b.camera.addTrauma(0.02);
        },
        sfx: { name: 'kiCharge', who: 'cell', vol: 1.3, pitch: 0.5 },
        say: { who: 'cell', line: 'I have enough power in this single attack to destroy the entire solar system! Say goodbye to the Earth, Gohan!', duration: 5, style: 'shout' },
        hold: 5.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.despair = true;
    },
  };

  /* ============================================================================ THE VOICE */
  S.cf_voice = {
    id: 'cf_voice',
    cast,
    auraCap: 0.15,
    music: { song: 'vision', level: 2 },
    clearMood: false,
    events: [
      // King Kai's link: a translucent gold shape of his father behind him, and a voice nobody else hears
      {
        call: (ctx) => {
          const st = story(ctx), K = CK();
          SL.ScreenFX.vision(0.55);
          ctx.b.sfx('visionIn', null, {});
          K.spirit(ctx.b, true, 0.5);
          K.spiritFollow(ctx.b);
          st.goku.setState('scripted', { pose: 'idle', expression: 'calm', aura: 0.2 });
        },
        cam: { from: { at: 'gohan', local: [1.1, 0.45, 2.2] }, look: { at: 'goku:head', off: [0, 0.05, 0] }, fov: 38 },
        tick: (ctx) => CK().spiritFollow(ctx.b),
        say: { who: 'goku', line: 'Gohan! Don\'t give up! I know you have more power than this!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'gohan:face', local: [0.15, 0.16, 0.8] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        tick: (ctx) => CK().spiritFollow(ctx.b),
        say: { who: 'teen_gohan', line: 'Dad?! But... my arm is broken! I only have half my energy left!', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'gohan', local: [-1.2, 0.5, 1.9] }, look: { at: 'goku:head', off: [0, 0.05, 0] }, fov: 36 },
        tick: (ctx) => CK().spiritFollow(ctx.b),
        say: { who: 'goku', line: 'That doesn\'t matter! You\'re holding back because you\'re afraid of hurting the Earth. Forget about the Earth — we can fix it with the Dragon Balls! Just let it all go!', duration: 6, style: 'shout' },
        hold: 6.2,
      },
      // he pushes himself up on his right leg, turns side-on, the right hand cupped at his hip;
      // his father's hand on his shoulder
      {
        call: (ctx) => {
          SL.ScreenFX.vision(0);
          const st = story(ctx), K = CK();
          K.spirit(ctx.b, true, 0.6);
          K.spiritFollow(ctx.b);
          st.goku.setState('scripted', { pose: 'palmOn', expression: 'calm', aura: 0.25 });
          faceTo(st.gohan, st.cell.pos);
        },
        pose: [{ who: 'gohan', pose: 'tg2_oneKameCharge', face: 'angry', speed: 4, aura: 0.6 }],
        music: { song: 'finale', level: 6 },
        cam: { from: { at: 'gohan', local: [-3.2, 0.3, 0.6] }, to: { at: 'gohan', local: [-2.6, 0.25, 0.4] }, look: { at: 'gohan', off: [0, 0.3, 0] }, fov: 42 },
        tick: (ctx) => CK().spiritFollow(ctx.b),
        say: { who: 'teen_gohan', line: 'KA... ME... HA... ME...', duration: 3, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      SL.ScreenFX.vision(0);
      CK().spirit(ctx.b, true, 0.6);
      ctx.m.flags.fskVoiceHeard = true;
    },
  };

  /* ============================================================================ THE END OF CELL */
  S.cf_disintegrate = {
    id: 'cf_disintegrate',
    cast,
    auraCap: 0.15,
    music: { song: 'final_clash', level: 7 },
    clearMood: false,
    events: [
      // the scream: his eyes go white; a gold flare to the horizon
      {
        call: (ctx) => {
          const st = story(ctx), g = st.gohan, c = st.cell, b = ctx.b;
          c.setHidden(false);
          c.alive = true;
          if (c.pos.y - b.stage.heightAt(c.pos.x, c.pos.z) < 2) CK().placeAir(c, ring(ctx, 0, -12).add(new V3(0, 6, 0)), 0);
          faceTo(g, c.pos);
          if (g.model.setPupilScale) g.model.setPupilScale(0);
          b.vfx.ring(ground(ctx, g.pos, 0.3), 30, 0xffe25a, 1, new V3(0, 1, 0));
          b.vfx.explosion(g.chest(), 3, 0xffe25a, { smoke: false });
          // the beam: from his palm, past Cell, to the sky
          const from = g.chest().addScaledVector(g.forward, 0.6);
          const dir = c.chest().sub(from).normalize();
          const len = 160;
          const geo = new THREE.CylinderGeometry(1, 1, len, 20, 1, true);
          geo.translate(0, len / 2, 0);
          geo.rotateX(Math.PI / 2);
          const mat = new THREE.MeshBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
          const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
          const beam = new THREE.Mesh(geo, mat);
          beam.position.copy(from);
          beam.lookAt(from.clone().add(dir));
          core.position.copy(from);
          core.lookAt(from.clone().add(dir));
          b.scene.add(beam, core);
          st.fskBeam = { beam, core, geo, mat, dir, from };
          ctx.m.onDispose(() => {
            b.scene.remove(beam, core);
            geo.dispose();
            mat.dispose();
            core.material.dispose();
          });
          b.sfx('beamFire', g, { vol: 1.5, pitch: 0.7 });
        },
        pose: [{ who: 'gohan', pose: 'tg2_oneKameFire', face: 'shout', speed: 20, aura: 1 }],
        screen: { flash: 0.6, color: '#fff8d0' },
        shake: { at: 'gohan', amount: 1 },
        cam: { from: { at: 'gohan', local: [-3, 0.4, -0.6] }, look: { at: 'gohan', local: [0, 0.4, 3] }, fov: 46 },
        tick: (ctx, t) => {
          const B = story(ctx).fskBeam, k = Math.min(1, t / 1.2);
          const r = 1.2 + k * 1.4;
          B.beam.scale.set(r, r, 1);
          B.core.scale.set(r * 0.5, r * 0.5, 1);
        },
        say: { who: 'teen_gohan', line: 'AAAAAAAAAAAHHHHHHHHHH!!', duration: 2.8, style: 'shout' },
        hold: 2.4,
      },
      // swallowed: his eyes bulge, his feet leave the ground
      {
        pose: [{ who: 'cell', pose: 'pierced', face: 'shock', speed: 10 }],
        mood: { amount: 0.55, color: 0x2a6aff, seconds: 0.4 },
        cam: { from: { at: 'cell:face', local: [0.3, 0.19, 1.3] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 36 },
        tick: (ctx) => {
          const B = story(ctx).fskBeam;
          // inside the light now: the column is hidden and the world goes blue round him
          B.beam.visible = false;
          B.core.visible = false;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.sparks(story(ctx).cell.chest(), 0xdff4ff, 6, 6, 0.1);
        },
        say: { who: 'cell', line: 'N-NO! THIS... THIS CAN\'T—', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      // frame 1: the green-and-black armour flakes away into ash
      {
        call: (ctx) => pt(ctx, 'core', story(ctx).cell.chest()),
        cam: { from: { at: 'cell', local: [1.8, 0.2, 1.6] }, look: { at: 'cell', off: [0, 0.3, 0] }, fov: 40 },
        tick: (ctx) => {
          const b = ctx.b, c = story(ctx).cell;
          if (b.frame % 2 === 0) b.vfx.debrisBurst(c.chest().add(new V3(Math.sin(b.frame) * 0.4, Math.cos(b.frame) * 0.6, 0)), 3, b.frame % 4 ? 0x2a4a2a : 0x1a1a1a, 4, 0.06);
        },
        slow: { scale: 0.4, seconds: 1.6 },
        hold: 1.4,
      },
      // frame 2: the skin peels back to red; frame 3: muscle and bone go to nothing
      {
        call: (ctx) => {
          const c = story(ctx).cell;
          ctx.tint = [];
          c.model.root.traverse((o) => {
            if (o.isMesh && o.material && o.material.color && !o.userData.isOutline) ctx.tint.push({ m: o.material, c0: o.material.color.clone() });
          });
          ctx.base = c.model.root.scale.x;
        },
        cam: { from: { at: 'core', off: [2.4, 0.4, 2.4] }, look: { at: 'core' }, fov: 40 },
        tick: (ctx, t) => {
          const c = story(ctx).cell, b = ctx.b;
          const red = Math.min(1, t / 0.9), gone = U.clamp01((t - 1) / 1.2);
          for (const x of ctx.tint) x.m.color.copy(x.c0).lerp(new THREE.Color(0xc8281e), red);
          c.model.root.scale.setScalar(ctx.base * (1 - gone * 0.92));
          if (b.frame % 2 === 0) b.vfx.sparks(c.chest(), red > 0.6 ? 0xff6a4a : 0xdff4ff, 5, 6, 0.08);
          if (gone >= 1 && !c.hidden) c.setHidden(true);
        },
        hold: 2.4,
      },
      // frame 4: the core: one purple cell, glowing, trying to begin again — and burned out
      {
        call: (ctx) => {
          const b = ctx.b, at = ctx.cast.core.pos;
          const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshBasicMaterial({ color: 0xc86aff }));
          const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xa04aff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
          glow.scale.setScalar(0.6);
          nuc.position.copy(at);
          glow.position.copy(at);
          b.scene.add(nuc, glow);
          ctx.nuc = { nuc, glow };
          ctx.m.onDispose(() => {
            b.scene.remove(nuc, glow);
            nuc.geometry.dispose();
            nuc.material.dispose();
            glow.material.dispose();
          });
        },
        cam: { from: { at: 'core', off: [1.1, 0.15, 1.1] }, look: { at: 'core' }, fov: 36 },
        tick: (ctx, t) => {
          const N = ctx.nuc, b = ctx.b;
          if (!N) return;
          const s = 1 + Math.sin(t * 18) * 0.25 + Math.min(0.6, t * 0.4);
          N.nuc.scale.setScalar(s);
          N.glow.scale.setScalar(0.6 * s);
          if (t > 1.4 && N.nuc.visible) {
            N.nuc.visible = false;
            N.glow.visible = false;
            b.vfx.flash(ctx.cast.core.pos, 1.4, 0xffffff, 0.25, SL.Toon.tex.glow);
            b.vfx.sparks(ctx.cast.core.pos, 0xc86aff, 24, 8, 0.08);
            b.sfx('explosionSmall', null, { at: ctx.cast.core.pos, pitch: 1.8 });
          }
        },
        sfx: { name: 'regrow', at: { at: 'core' }, pitch: 1.4, vol: 0.8 },
        hold: 2.2,
      },
      // the beam leaves the atmosphere, carrying what is left of him out of the solar system
      {
        call: (ctx) => {
          const B = story(ctx).fskBeam;
          B.beam.visible = B.core.visible = true;
          ctx.b.stage.clearMood(0.6);
          pt(ctx, 'up', B.from.clone().addScaledVector(B.dir, 60));
        },
        cam: { from: { at: 'up', off: [40, -20, 60] }, look: { at: 'up', off: [0, 30, 0] }, fov: 60 },
        tick: (ctx, t) => {
          const B = story(ctx).fskBeam, k = U.clamp01(1 - (t - 1.4) / 1);
          B.mat.opacity = 0.75 * k;
          B.core.material.opacity = 0.9 * k;
        },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx), c = st.cell;
      if (st.fskBeam) {
        st.fskBeam.beam.visible = false;
        st.fskBeam.core.visible = false;
      }
      if (ctx.nuc) {
        ctx.nuc.nuc.visible = false;
        ctx.nuc.glow.visible = false;
      }
      c.setHidden(true);
      CK().gone(c);
      c.alive = false;
      const g = st.gohan;
      if (g.model.setPupilScale) g.model.setPupilScale(1);
      ctx.m.flags.cellGone = true;
    },
  };

  /* ============================================================================ AFTERMATH */
  S.cf_after = {
    id: 'cf_after',
    cast,
    auraCap: 0,
    music: { song: null, level: 0 },
    events: [
      // a trench miles long, smoking; and silence
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.gohan;
          const dir = g.forward.clone().setY(0).normalize();
          for (let i = 1; i < 9; i++) b.stage.crater(g.pos.clone().addScaledVector(dir, i * 4), 3 + i * 0.3, 0.9, null);
          pt(ctx, 'trench', g.pos.clone().addScaledVector(dir, 16));
          CK().spirit(b, false);
        },
        cam: { from: { at: 'trench', off: [14, 9, -10] }, look: { at: 'trench' }, fov: 54 },
        tick: (ctx) => {
          if (ctx.b.frame % 7 === 0) ctx.b.vfx.dust(ctx.cast.trench.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 6, 0.5, Math.cos(ctx.b.frame) * 6)), 2.6, 2, 0x8a8478);
        },
        hold: 3.6,
      },
      // the hand drops; the gold goes; the eyes are a boy's again
      {
        call: (ctx) => {
          const g = story(ctx).gohan;
          CK().toForm(g, 'base');
          g.setRage(false, 0);
          ctx.b.vfx.flash(g.chest(), 1.2, 0xfff4b0, 0.2, SL.Toon.tex.glow);
        },
        pose: [{ who: 'gohan', pose: 'sway', face: 'soft', speed: 3, aura: 0 }],
        cam: { from: { at: 'gohan:face', local: [0.15, 0.16, 0.9] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 34 },
        hold: 2.8,
      },
      // the knees go; he falls forward onto his face, smiling
      {
        call: (ctx) => {
          ctx.b.sfx('groundImpact', story(ctx).gohan, { vol: 0.5, pitch: 1.2 });
          pt(ctx, 'down', story(ctx).gohan.pos);
        },
        pose: [{ who: 'gohan', pose: 'knockdownFace', face: 'soft', speed: 4 }],
        cam: { from: { at: 'down', off: [2.4, 0.8, 2] }, look: { at: 'down', off: [0, 0.2, 0] }, fov: 42 },
        tick: (ctx, t) => {
          if (t > 0.5 && !ctx.thud) {
            ctx.thud = true;
            ctx.b.vfx.dust(ctx.cast.down.pos, 1, 6);
          }
        },
        hold: 2.8,
      },
      // Vegeta lands softly on a rock, looks down at the boy, lets his fist go, and turns his back
      {
        call: (ctx) => {
          const st = story(ctx), K = CK(), b = ctx.b;
          const at = ground(ctx, st.gohan.pos.clone().add(new V3(-5, 0, 3)));
          st.vegRock = K.prop(b, 'rock', at, { color: 0x8a7a64 });
          K.toForm(st.vegeta, 'base');
          st.vegeta.setHidden(false);
          K.place(st.vegeta, at.clone().add(new V3(0, 1.05, 0)));
          st.vegeta.grounded = true;
          faceTo(st.vegeta, st.gohan.pos);
        },
        pose: [{ who: 'vegeta', pose: 'stand', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'vegeta', local: [0.5, 0.3, 2.2] }, look: { at: 'vegeta:head' }, fov: 36 },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.vegeta, st.vegeta.pos.clone().sub(st.gohan.pos).add(st.vegeta.pos));
        },
        pose: [{ who: 'vegeta', pose: 'v_turnAway', face: 'calm', speed: 2 }],
        cam: { from: { at: 'vegeta', local: [-0.6, 0.4, -2] }, look: { at: 'vegeta:head' }, fov: 36 },
        say: { who: 'vegeta', line: '(...I will never fight again.)', duration: 3.6, style: 'quiet' },
        hold: 4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      CK().toForm(st.gohan, 'base');
      ctx.m.flags.cellSagaEnd = true;
    },
  };
})();
