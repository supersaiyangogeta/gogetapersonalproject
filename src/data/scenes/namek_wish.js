/*
 * SCENE — the wishes, in the middle of the fight (owner, 2026-10-01).
 *
 * Canon order, not the aftermath: with five minutes left, King Kai reaches Goku; Goku asks for
 * the wishes himself — everybody Frieza killed on Namek brought back, then everybody on Namek
 * sent to Earth except him and Frieza. The first wish brings Vegeta up out of the grave Goku dug
 * for him. He sees the gold, and says it. Then he goes for Frieza — and the second wish takes him
 * in mid-lunge ("Why, you...!", the owner's reference frame), Gohan with him.
 *
 *   namek_wish_vegeta   the telepathy, Porunga on the horizon, the grave, the line, the lunge, gone
 *
 * Dialogue is paraphrased English written for this project; Vegeta's line is the owner's own.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;
  const C = SL.data.poses;
  // the owner's reference frame: one arm thrown out at Frieza with the fingers spread, driving forward
  C.reachLunge = {
    root: { y: -0.06, rx: 16 }, hips: [0, 10, 0], spine: [10, -8, 0], chest: [8, -12, 0], head: [-14, 10, 0],
    shoulderR: [-92, 0, -8], elbowR: [-6, 0, 0], handR: [-20, 0, 0], shoulderL: [24, 0, 26], elbowL: [-50, 0, 0],
    thighL: [-58, 0, 10], kneeL: [70, 0, 0], thighR: [30, 0, -10], kneeR: [40, 0, 0], footR: [20, 0, 0],
    hands: ['fist', 'open'],
  };

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, frieza: s.frieza, gohan: s.gohan, vegeta: s.vegeta };
  };
  const ground = (b, v, lift = 0) => new V3(v.x, b.stage.heightAt(v.x, v.z) + lift, v.z);
  const faceTo = (f, p) => {
    f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
  };
  const pt = (ctx, name, v) => {
    ctx.cast[name] = { pos: v.clone() };
  };
  /** Somebody taken by the wish: a column of gold light, and nobody standing in it. */
  function wishAway(ctx, f) {
    const b = ctx.b;
    const c = f.chest();
    b.vfx.flash(c, 3.2, 0xffe680, 0.5, SL.Toon.tex.glow);
    b.vfx.ring(ground(b, f.pos, 0.2), 3, 0xffe680, 0.6, new V3(0, 1, 0));
    b.vfx.streamInward(c, 3, 0xffe680, 10, 0.18, 0.5);
    for (let i = 0; i < 10; i++) b.vfx.trail(c.clone().add(new V3(0, i * 0.9, 0)), 0xfff2b0, 0.9 - i * 0.05, 0.6);
    b.sfx('teleport', f, { pitch: 0.8, vol: 1 });
    f.setHidden(true);
    f.untargetable = true;
    f.intangible = true;
  }

  S.namek_wish_vegeta = {
    id: 'namek_wish_vegeta',
    cast,
    music: { song: 'shenron', level: 2 },
    clearMood: false,
    events: [
      // King Kai, inside his head; Frieza across the field, watching him go quiet
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'calm', speed: 3 },
          { who: 'frieza', pose: 'idle', face: 'smirk', speed: 3 },
        ],
        cam: { from: { at: 'goku', local: [0.6, 0.4, 2.2] }, to: { at: 'goku', local: [0.45, 0.38, 1.6] }, look: { at: 'goku:head' }, fov: 36, fov2: 32 },
        say: { who: 'king_kai', line: 'Goku! Can you hear me? It\'s King Kai! Dende and the Dragon Balls — we can still do something!', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'goku', local: [-0.5, 0.35, 1.5] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: 'King Kai, tell Dende: wish back everyone Frieza killed on Namek. Then send everybody here to Earth — everybody but me and Frieza.', duration: 5.4, style: 'quiet' },
        hold: 5.6,
      },
      {
        cam: { from: { at: 'frieza', local: [1, 0.4, 2.6] }, look: { at: 'frieza:head' }, fov: 36 },
        say: { who: 'frieza', line: 'Talking to yourself, monkey? Has the gold gone to your head?', duration: 3 },
        hold: 3.2,
      },
      // far off on the horizon the sky goes dark and a column of gold stands up out of it: Porunga
      {
        call: (ctx) => {
          const b = ctx.b, g = ctx.cast.goku;
          const far = g.pos.clone().add(new V3(-70, 0, -110));
          pt(ctx, 'far', ground(b, far));
          b.stage.setMood(0.55, 0x0c0a14, 1.2);
          if (SL.data.vegitoKit && SL.data.vegitoKit.pillar) SL.data.vegitoKit.pillar(ctx.m, ctx.cast.far.pos, { height: 220, radius: 6, seconds: 7, color: 0xffe680 });
          b.sfx('rumble', null, { at: ctx.cast.far.pos, vol: 1, pitch: 0.5 });
        },
        cam: { from: { at: 'goku', off: [6, 2.4, 9] }, look: { at: 'far', off: [0, 30, 0] }, fov: 54 },
        say: { who: 'dende', line: 'Porunga — please! Bring back everyone Frieza and his men killed!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      // the light comes down over the whole field
      {
        screen: { flash: 0.4, color: '#fff2b0' },
        vfx: { kind: 'stream', at: { at: 'goku' }, radius: 20, count: 30, color: 0xffe680, life: 1.3 },
        cam: { from: { at: 'goku', off: [10, 7, 14] }, to: { at: 'goku', off: [8, 5, 11] }, look: { at: 'goku', off: [-4, 1, -4] }, fov: 54, fov2: 48 },
        hold: 2.2,
      },
      // the grave Goku dug cracks, and a gloved hand comes up out of it
      {
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta, grave = b.story.grave;
          pt(ctx, 'grave', grave.pos);
          v.setHidden(false);
          v.setPosition(grave.pos.clone().add(new V3(0, -1.2, 0)));
          v.prevPos.copy(v.pos);
          faceTo(v, ctx.cast.goku.pos);
          v.setState('scripted', { pose: 'reachUp', expression: 'grit' });
          b.vfx.dust(grave.pos, 2.4, 16, 0x7a5a44);
          b.sfx('rockBreak', null, { at: grave.pos, vol: 0.9, pitch: 0.8 });
          b.cameraTraumaAt(grave.pos, 0.4);
          ctx.rise0 = v.pos.clone();
        },
        cam: { from: { at: 'grave', off: [2.6, 0.9, 3] }, look: { at: 'grave', off: [0, 0.4, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const v = ctx.cast.vegeta, k = U.easeOutCubic(Math.min(1, t / 1.6));
          v.setPosition(ctx.rise0.clone().add(new V3(0, 1.2 * k, 0)));
          v.prevPos.copy(v.pos);
          if (t < 0.2 && ctx.b.frame % 3 === 0) ctx.b.vfx.rock(ctx.cast.grave.pos.clone().add(new V3(U.rand(-0.8, 0.8), 0.3, U.rand(-0.8, 0.8))), new V3(U.rand(-2, 2), U.rand(3, 6), U.rand(-2, 2)), U.rand(0.1, 0.25), 0x7a5a44);
        },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const b = ctx.b, grave = b.story.grave;
          grave.break();
        },
        pose: [{ who: 'vegeta', pose: 'lookHands', face: 'shock', speed: 3 }],
        cam: { from: { at: 'vegeta', local: [0.4, 0.3, 1.5] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'I\'m... alive? The Dragon Balls...', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // he sees the gold
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 3 }],
        cam: { from: { at: 'vegeta', local: [-0.6, 0.45, -1.6] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 34 },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'vegeta', local: [0.35, 0.3, 1.25] }, to: { at: 'vegeta', local: [0.28, 0.28, 1.05] }, look: { at: 'vegeta:head' }, fov: 32, fov2: 28 },
        say: { who: 'vegeta', line: 'Kakarot, you dog! You did it... you actually did it!', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'frieza', local: [0.9, 0.4, 2.4] }, look: { at: 'frieza:head' }, fov: 36 },
        say: { who: 'frieza', line: 'Back from the grave, Vegeta? How very tiresome.', duration: 2.8 },
        hold: 3,
      },
      // he goes for Frieza
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          faceTo(v, ctx.cast.frieza.pos);
          ctx.lunge0 = v.pos.clone();
          ctx.lunge1 = v.pos.clone().lerp(ctx.cast.frieza.pos, 0.4).add(new V3(0, 0.6, 0));
          v.grounded = false;
          ctx.b.sfx('dash', v, { pitch: 0.9 });
        },
        pose: [{ who: 'vegeta', pose: 'reachLunge', face: 'shout', speed: 14 }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.3, 2.4] }, look: { at: 'vegeta', off: [0, 0.3, 0] }, fov: 40 },
        tick: (ctx, t) => {
          const v = ctx.cast.vegeta, k = Math.min(1, t / 1.4);
          v.setPosition(ctx.lunge0.clone().lerp(ctx.lunge1, k * (2 - k)));
          v.prevPos.copy(v.pos);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(v.chest(), 0xb8d8ff, 0.4, 0.25);
        },
        say: { who: 'vegeta', line: 'Why, you...!', duration: 1.4, style: 'shout' },
        hold: 0.75,
      },
      // the second wish takes him mid-lunge — and the boy with him
      {
        call: (ctx) => {
          wishAway(ctx, ctx.cast.vegeta);
          if (ctx.cast.gohan && !ctx.cast.gohan.hidden) wishAway(ctx, ctx.cast.gohan);
        },
        slow: { scale: 0.35, seconds: 0.6 },
        screen: { flash: 0.5, color: '#fff2b0' },
        cam: { from: { at: 'vegeta', local: [0.9, 0.3, 2.4] }, look: { at: 'vegeta', off: [0, 0.3, 0] }, fov: 40 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'shock', speed: 3 }],
        cam: { from: { at: 'frieza', local: [0.8, 0.35, 2] }, look: { at: 'frieza:head' }, fov: 34 },
        say: { who: 'frieza', line: 'What?! Where did he go?!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'smirk', speed: 3 }],
        mood: { amount: 0.25, color: 0x4a1810, seconds: 1.6 },
        music: { song: 'finale', level: 3 },
        cam: { from: { at: 'goku', local: [0.5, 0.35, 1.7] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'Earth. Everyone\'s safe now. Sorry, Vegeta — this fight is mine. It\'s just you and me, Frieza.', duration: 4.4 },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      for (const k of ['vegeta', 'gohan']) {
        const f = cast[k];
        if (!f) continue;
        f.setHidden(true);
        f.untargetable = true;
        f.intangible = true;
      }
      if (b.story.grave) b.story.grave.break();
      if (cast.goku) cast.goku.setState('free');
      if (cast.frieza) cast.frieza.setState('free');
      b.stage.setMood(0.25, 0x4a1810, 1);
      m.flags.wishesMade = true;
      m.flags.vegetaWished = true;
    },
  };
})();
