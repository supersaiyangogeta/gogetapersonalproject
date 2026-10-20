/*
 * SCENES — Goku's sacrifice (mission cell_goodbye, 2026-10-01), from the owner's frame-by-frame brief.
 *
 *   cb_bloat     the balloon on tiny legs; the countdown; Gohan on his knees
 *   cb_farewell  "Tell Chi-Chi I'm sorry"; two fingers (cue); the palm on the swollen skin; the look back
 *                and the smile; gone
 *   cb_kingkai   King Kai, Bubbles and Gregory turning round; "Sorry, King Kai!"; white; the supernova
 *   cb_silence   the sky over the ring, empty
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

  S.cb_bloat = {
    id: 'cb_bloat',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      // 00:00 the body balloons: a pulsing ball, anchored to the stone on two tiny legs
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.cell, st.gohan.pos);
          ctx.bal = 0;
          pt(ctx, 'cellAt', st.cell.pos);
        },
        pose: [{ who: 'cell', pose: 'cl_bloat', face: 'wicked', speed: 3 }],
        sfx: { name: 'stretch', who: 'cell', pitch: 0.35, vol: 1.4 },
        cam: { from: { at: 'cellAt', off: [5, 1.4, 8] }, to: { at: 'cellAt', off: [7, 2.4, 11] }, look: { at: 'cellAt', off: [0, 2, 0] }, fov: 46, fov2: 52 },
        tick: (ctx, t) => {
          const k = U.easeInOutCubic(Math.min(1, t / 3));
          story(ctx).balloon.set(k);
          ctx.b.camera.addTrauma(0.01);
        },
        hold: 3.4,
      },
      // SAC-S01 (Roadmap Three, the owner's Gemini research — a research draft, not checked against the footage): a slow
      // push-in on his laughing face, blue lightning running over the swollen skin
      {
        mood: { amount: 0.35, color: 0x241c10, seconds: 1.4 },
        // not nearer than 1.2 m: closer, the curve of the swollen body comes up over his mouth and eyes
        cam: { from: { at: 'cell:face', local: [0.2, 0.14, 1.4] }, to: { at: 'cell:face', local: [0.17, 0.18, 1.2] }, look: { at: 'cell:head', off: [0, 0.15, 0] }, fov: 36, fov2: 33 },
        tick: (ctx) => {
          const c = story(ctx).cell, b = ctx.b;
          if (b.frame % 5 !== 0) return;
          ctx.m.flags.bloatBolts = (ctx.m.flags.bloatBolts || 0) + 1;
          // over the swollen skin round his face, on the lens's side (the frame is his face on top of the body; the head
          // joint itself sits inside the swelling)
          const h = SL.Cinema.actorPoint(ctx, 'cell:face'), toCam = b.camera.camera.position.clone().sub(h).normalize();
          const side = new V3(toCam.z, 0, -toCam.x).normalize();
          // sparks, not bolts: the 1-pixel bolt lines were lost against the skin at this distance
          b.vfx.sparks(h.addScaledVector(side, U.rand(-0.7, 0.7)).add(new V3(0, U.rand(-0.35, 0.3), 0)).addScaledVector(toCam, 0.3), 0x9ad8ff, 6, 3, 0.18);
        },
        say: { who: 'cell', line: 'Hahahaha! Touch me and I explode instantly! In one minute I take this whole planet with me!', duration: 4.6, style: 'shout' },
        hold: 4.8,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'krillin', local: [0.4, 0.3, 1.8] }, look: { at: 'krillin:head' }, fov: 36 },
        say: { who: 'krillin', line: 'He\'s going to blow up the Earth?! We can\'t even touch him!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      // 00:08 Gohan on his knees, fists into the dirt, crying with rage
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.gohan, st.cell.pos);
        },
        pose: [{ who: 'gohan', pose: 'kneelPound', face: 'hurt', speed: 6 }],
        rage: { who: 'gohan', amount: 0.5 },
        cam: { from: { at: 'gohan', local: [0.6, 0.1, 1.8] }, to: { at: 'gohan', local: [0.45, 0.05, 1.4] }, look: { at: 'gohan', off: [0, -0.1, 0] }, fov: 36 },
        tick: (ctx) => {
          if (ctx.b.frame % 26 === 0) {
            ctx.b.vfx.dust(story(ctx).gohan.pos.clone().addScaledVector(story(ctx).gohan.forward, 0.5), 0.6, 4);
            ctx.b.sfx('groundImpact', story(ctx).gohan, { vol: 0.4, pitch: 1.2 });
          }
        },
        say: { who: 'teen_gohan', line: 'No... it\'s my fault! I should have finished him when I had the chance!', duration: 4.2, style: 'shout' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.balloon.set(1);
      st.gohan.setState('scripted', { pose: 'kneelPound', expression: 'hurt' });
      ctx.m.flags.bloated = true;
    },
  };

  S.cb_farewell = {
    id: 'cb_farewell',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 2 },
    clearMood: false,
    events: [
      // 00:15 Goku, on the ridge, turns to his friends: calm, peaceful
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.krillin.pos);
          st.cell.setState('scripted', { pose: 'cl_bloat', expression: 'wicked' });
          st.gohan.setState('scripted', { pose: 'kneelPound', expression: 'hurt' });
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'soft', speed: 2 }],
        cam: { from: { at: 'goku', local: [0.5, 0.3, 1.8] }, to: { at: 'goku', local: [0.4, 0.28, 1.5] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'You guys put up a great fight. Tell Chi-Chi I\'m sorry I won\'t be coming home.', duration: 4.4 },
        hold: 4.6,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'shock', speed: 3 }],
        cam: { from: { at: 'krillin', local: [0.3, 0.3, 1.6] }, look: { at: 'krillin:head' }, fov: 34 },
        say: { who: 'krillin', line: 'Goku...? What are you—', duration: 2, style: 'quiet' },
        hold: 2,
      },
      // 00:22 two fingers to his forehead. SAC-S02 (research draft): the gentle smile. Its profile framing is not used: from
      // one side the near shoulder hides the fingers, from the other the raised arm crosses his face; the three-quarter
      // shows both
      {
        call: (ctx) => faceTo(story(ctx).goku, story(ctx).cell.pos),
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'soft', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.4] }, look: { at: 'goku:head' }, fov: 32 },
        cue: { key: 's2', label: 'Instant Transmission', auto: 7, slow: 0.4 },
      },
      // 00:25 SHUN: gone from the ridge, there on the broken stone in front of the swollen thing
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.cell;
          b.vfx.flash(st.goku.chest(), 1.6, 0xffffff, 0.15, SL.Toon.tex.glow);
          b.sfx('teleport', st.goku, { pitch: 1.1 });
          const at = ground(ctx, c.pos.clone().addScaledVector(c.forward.clone().setY(0).normalize(), 2.05));
          CK().place(st.goku, at);
          faceTo(st.goku, c.pos);
          b.vfx.flash(st.goku.chest(), 1.6, 0xffffff, 0.15, SL.Toon.tex.glow);
        },
        pose: [{ who: 'goku', pose: 'stand', face: 'calm', speed: 6 }],
        cam: { from: { at: 'goku', local: [-1.8, 0.4, -1.2] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 42 },
        hold: 1.4,
      },
      // 00:28 a palm flat against the hot, veined skin
      {
        call: (ctx) => {
          const st = story(ctx);
          const hand = st.goku.chest().addScaledVector(st.goku.forward, 0.55);
          pt(ctx, 'palm', hand);
          ctx.b.sfx('steam', st.goku, { vol: 0.5 });
        },
        pose: [{ who: 'goku', pose: 'palmOn', face: 'calm', speed: 4 }],
        cam: { from: { at: 'palm', off: [0.9, 0.2, 0.6] }, look: { at: 'palm' }, fov: 38 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelPound', face: 'shock', speed: 2 }],
        cam: { from: { at: 'gohan', local: [0.4, 0.3, 1.6] }, look: { at: 'gohan:head' }, fov: 34 },
        say: { who: 'teen_gohan', line: 'Dad...?', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      // 00:32 he looks back over his shoulder, one last time: the warm, goofy smile
      {
        pose: [{ who: 'goku', pose: 'palmLookBack', face: 'grin', speed: 3 }],
        cam: { from: { at: 'goku', local: [0.5, 0.42, -1.25] }, to: { at: 'goku', local: [0.42, 0.4, -1.05] }, look: { at: 'goku:head', off: [0, 0.14, 0] }, fov: 34 },
        say: { who: 'goku', line: 'You fought well, Gohan. I\'m proud of you... Take care of your mother.', duration: 4.6 },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'gohan:face', local: [0.1, 0.16, 0.7] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        hold: 1.2,
      },
      // 00:38 SHUN: the two of them are gone from the Earth
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.vfx.flash(st.goku.chest(), 3, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.vfx.ring(st.cell.chest(), 6, 0xdff2ff, 0.4);
          b.sfx('teleport', st.goku, { pitch: 0.8, vol: 1.2 });
          for (const f of [st.goku, st.cell]) f.setHidden(true);
          pt(ctx, 'empty', st.cell.pos);
        },
        screen: { flash: 0.5, color: '#ffffff' },
        cam: { from: { at: 'empty', off: [4, 1.6, 6] }, look: { at: 'empty', off: [0, 1.6, 0] }, fov: 46 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock', speed: 3 }],
        cam: { from: { at: 'gohan', local: [0.5, 0.2, 2] }, look: { at: 'gohan:head' }, fov: 36 },
        say: { who: 'teen_gohan', line: 'DAAAD!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const f of [st.goku, st.cell]) f.setHidden(true);
      ctx.m.flags.transmitted = true;
    },
  };

  S.cb_kingkai = {
    id: 'cb_kingkai',
    cast,
    auraCap: 0.15,
    music: { song: null, level: 0 },
    events: [
      // King Kai's little planet: King Kai, Bubbles and Gregory, and then two more people than usual
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, K = CK();
          const at = (x, z) => new V3(x, b.stage.heightAt(x, z), z);
          K.place(st.kingkai, at(0, -1), 0);
          K.place(st.bubbles, at(1.6, -1.6), 0);
          for (const f of [st.kingkai, st.bubbles]) {
            f.setHidden(false);
            f.setState('scripted', { pose: 'idle', expression: 'calm' });
          }
          st.gregory = K.prop(b, 'gregory', at(-1.2, -1.4), { scale: 1.6 });
          st.goku.setHidden(false);
          K.place(st.goku, at(0, 5), Math.PI);
          st.cell.setHidden(false);
          K.place(st.cell, at(0, 2.4), 0);
          st.balloon.set(1);
          faceTo(st.goku, st.cell.pos);
          b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.15, SL.Toon.tex.glow);
          b.sfx('teleport', st.goku, { pitch: 1 });
          pt(ctx, 'kk', st.kingkai.pos);
        },
        pose: [
          { who: 'goku', pose: 'palmOn', face: 'calm', speed: 4 },
          { who: 'cell', pose: 'cl_bloat', face: 'shock', speed: 4 },
        ],
        cam: { from: { at: 'kk', off: [-4, 1.4, -5] }, look: { at: 'kk', off: [0, 0.6, 3] }, fov: 46 },
        hold: 1.6,
      },
      // they turn round
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.kingkai, st.goku.pos);
          faceTo(st.bubbles, st.goku.pos);
          if (st.gregory) st.gregory.group.rotation.y = Math.PI;
        },
        pose: [
          { who: 'kingkai', pose: 'kk_antennae', face: 'shock', speed: 8 },
          { who: 'bubbles', pose: 'idle', face: 'shock', speed: 8 },
        ],
        cam: { from: { at: 'kingkai', local: [0.3, 0.3, 1.5] }, look: { at: 'kingkai:head' }, fov: 36 },
        say: { who: 'king_kai', line: 'GOKU?! WHY DID YOU BRING HIM HERE?!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'goku', pose: 'scratchHead', face: 'grin', speed: 6 }],
        cam: { from: { at: 'goku', local: [1.5, 0.35, 0.3] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'Sorry, King Kai! This was the only safe place I could think of!', duration: 3.2 },
        hold: 3.2,
      },
      // 00:46 Cell turns blinding white, and cracks
      {
        call: (ctx) => pt(ctx, 'ball', story(ctx).cell.chest()),
        pose: [{ who: 'cell', pose: 'cl_bloat', face: 'shout', speed: 10 }],
        cam: { from: { at: 'ball', off: [3.4, 0.6, 4.2] }, look: { at: 'ball' }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), k = Math.min(1, t / 1.6);
          st.balloon.glow(k);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.bolt(st.cell.chest().add(new V3(Math.sin(ctx.b.frame) * 1.5, Math.cos(ctx.b.frame * 1.7) * 1.5, 1)), 1.4, 0xffffff);
          ctx.b.camera.addTrauma(0.03 * k);
        },
        sfx: { name: 'kiCharge', who: 'cell', vol: 1.4, pitch: 0.4 },
        say: { who: 'cell', line: 'NOOOOOOOOOO!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      // 00:48 the supernova: the planetoid, all of them, in one flash of white
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, c = st.ball || st.cell.chest();
          const at = st.cell.chest();
          b.vfx.explosion(at, 24, 0xffffff, { smoke: false });
          b.vfx.ring(at, 40, 0xffffff, 1.2);
          b.vfx.ring(at, 60, 0xfff4d0, 1.6, new V3(0, 1, 0));
          b.sfx('explosionHuge', null, { at, vol: 1.6, pitch: 0.5 });
          b.cameraTraumaAt(at, 1);
          for (const f of [st.goku, st.cell, st.kingkai, st.bubbles]) f.setHidden(true);
          st.balloon.set(0);
          if (st.gregory) st.gregory.group.visible = false;
          pt(ctx, 'nova', at);
        },
        screen: { flash: 1, color: '#ffffff' },
        slow: { scale: 0.4, seconds: 1.6 },
        cam: { from: { at: 'nova', off: [60, 40, 90] }, to: { at: 'nova', off: [90, 60, 140] }, look: { at: 'nova' }, fov: 54 },
        tick: (ctx, t) => {
          if (t < 1.2 && ctx.b.frame % 4 === 0) ctx.b.vfx.explosion(ctx.cast.nova.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 20, Math.cos(ctx.b.frame * 0.7) * 10, Math.cos(ctx.b.frame) * 20)), 16, 0xfff4d0, { smoke: false });
        },
        hold: 2.6,
      },
      { fade: { to: 'black', seconds: 0.8 }, hold: 1.2 },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const f of [st.goku, st.cell, st.kingkai, st.bubbles]) f.setHidden(true);
      st.balloon.set(0);
      if (st.gregory) st.gregory.group.visible = false;
      CK().gone(st.goku);
      st.goku.alive = false;
      ctx.m.flags.sacrificed = true;
    },
  };

  S.cb_silence = {
    id: 'cb_silence',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 1 },
    events: [
      {
        fade: { to: 'clear', seconds: 1.2 },
        call: (ctx) => {
          const st = story(ctx), K = CK();
          K.spectate(ctx.b, st, ['goku', 'gohan', 'a16', 'cell']);
          K.crew(ctx.b);
          K.place(st.gohan, ring(ctx, 0, 5), Math.PI);
          pt(ctx, 'sky', ring(ctx, 0, -6).add(new V3(0, 30, 0)));
        },
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'hurt', speed: 2 }],
        cam: { from: { at: 'gohan', off: [3, 0.6, 5] }, look: { at: 'sky' }, fov: 54 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'gohan:face', local: [0.15, 0.14, 0.8] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'hurt', speed: 2 }],
        cam: { from: { at: 'krillin', local: [0.3, 0.3, 1.6] }, look: { at: 'krillin:head' }, fov: 34 },
        say: { who: 'krillin', line: 'Goku...', duration: 2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.silence = true;
    },
  };
})();
