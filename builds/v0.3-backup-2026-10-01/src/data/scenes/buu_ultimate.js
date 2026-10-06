/*
 * SCENES — Chapter 12: Ultimate Gohan.
 *
 *   ug_return   Super Buu in the wastes; a calm voice behind him; a fist caught in one open hand
 *   ug_trick    "I'll blow up the whole Earth!" — "Go ahead." Gotenks and Piccolo arrive; a piece
 *               of Buu left lying behind them swallows them both; the body changes: Buutenks
 *   ug_hope     Gohan on his knees; far away, a light coming down: somebody is coming back
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const FX = () => SL.data.ultimateFX;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const ground = (ctx, v) => {
    const p = v.clone();
    if (ctx.b.stage.hasGround) p.y = ctx.b.stage.heightAt(p.x, p.z);
    return p;
  };
  const faceTo = (f, p) => {
    f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
  };
  const pt = (ctx, name, v) => {
    ctx.cast[name] = { pos: v.clone() };
  };
  const size = (f, x, y = x, z = x) => {
    const s = f.model.baseScale * (f.model._lookScale || 1);
    f.model.root.scale.set(s * x, s * y, s * z);
  };

  S.ug_return = {
    id: 'ug_return',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          st.sup.setPosition(ground(ctx, new V3(0, 0, -3)));
          st.gohan.setPosition(ground(ctx, new V3(0, 0, 5)));
          faceTo(st.sup, new V3(0, 0, -20));
          faceTo(st.gohan, st.sup.pos);
        },
        pose: [
          { who: 'sup', pose: 'sb_idle', face: 'angry', speed: 3 },
          { who: 'gohan', pose: 'ag_calm', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'sup', local: [1, 0.4, 3] }, look: { at: 'sup:head' }, fov: 40 },
        say: { who: 'sup', line: 'Where are they hiding? There must be SOMEBODY left worth fighting...', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'gohan', local: [0.6, 0.3, -1.8] }, look: { at: 'sup' }, fov: 40 },
        say: { who: 'adult_gohan', line: 'There is. Me.', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      {
        call: (ctx) => faceTo(story(ctx).sup, story(ctx).gohan.pos),
        pose: [{ who: 'sup', pose: 'sb_fight', face: 'grin', speed: 6 }],
        cam: { from: { at: 'sup', local: [0.6, 0.5, 2.6] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: 'Gohan? You look different. It doesn\'t matter — you\'ll taste the same.', duration: 3.4 },
        hold: 3.6,
      },
      // he comes in with everything; one open hand
      {
        pose: [{ who: 'sup', pose: 'sb_jabW', face: 'angry', speed: 10 }],
        move: { who: 'sup', at: 'gohan', off: [0, 0, -1.2], seconds: 0.35, ease: 'in' },
        cam: { from: { at: 'gohan', local: [2.6, 0.4, 1.4] }, look: { at: 'gohan', local: [0, 0.3, 0.8] }, fov: 44 },
        hold: 0.05,
      },
      { cue: { key: 'guard', label: 'Catch it', auto: 6, slow: 0.25 } },
      {
        pose: [
          { who: 'gohan', pose: 'ag_catch', face: 'calm', speed: 30 },
          { who: 'sup', pose: 'sb_jab', face: 'shock', speed: 30 },
        ],
        call: (ctx) => {
          const st = story(ctx);
          const p = st.gohan.chest().addScaledVector(st.gohan.forward, 0.6);
          ctx.b.vfx.impact(p, 2, 0xffffff);
          ctx.b.cameraTraumaAt(p, 0.3);
        },
        sfx: { name: 'perfectGuard', who: 'gohan' },
        slow: { scale: 0.3, seconds: 1 },
        cam: { from: { at: 'gohan', local: [1.6, 0.4, 1.2] }, look: { at: 'gohan', local: [0, 0.4, 0.6] }, fov: 38 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'sup', pose: 'sb_fight', face: 'shock', speed: 6 }],
        cam: { from: { at: 'sup', local: [1.5, 0.5, 1.2] }, look: { at: 'sup:head' }, fov: 36 },
        say: { who: 'sup', line: '...What?', duration: 1.6, style: 'quiet' },
        flag: { fistCaught: true },
        hold: 1.8,
      },
      // no wind-up: the left fist into his stomach, and the blow comes out of his back
      {
        pose: [
          { who: 'gohan', pose: 'ug_gut', face: 'calm', speed: 30 },
          { who: 'sup', pose: 'hitBody', face: 'shock', speed: 30 },
        ],
        call: (ctx) => {
          const st = story(ctx);
          const back = st.sup.chest().addScaledVector(st.sup.forward, -0.6);
          ctx.b.vfx.impact(st.sup.chest(), 3, 0xffffff);
          ctx.b.vfx.ring(back, 2.6, 0xffffff, 0.35, st.sup.forward.clone());
          ctx.b.vfx.ring(back.clone().addScaledVector(st.sup.forward, -0.8), 3.6, 0xf2f6ff, 0.45, st.sup.forward.clone());
          ctx.b.cameraTraumaAt(back, 0.5);
          ctx.b.sfx('punchHeavy', st.sup, { pitch: 0.7, vol: 1.3 });
        },
        slow: { scale: 0.3, seconds: 0.9 },
        cam: { from: { at: 'sup', local: [2.4, 0.1, -0.6] }, look: { at: 'sup', off: [0, 0.1, 0] }, fov: 42 },
        hold: 1.2,
      },
      // doubled over, eyes bulging
      {
        pose: [{ who: 'sup', pose: 'eb_mutate', face: 'hurt', speed: 10 }],
        cam: { from: { at: 'sup', local: [0.5, -0.3, 1.8] }, look: { at: 'sup:head' }, fov: 36 },
        hold: 0.9,
      },
      // the right elbow straight down on the back of his neck: face first into the dirt
      {
        pose: [{ who: 'gohan', pose: 'ug_elbowW', face: 'calm', speed: 16 }],
        cam: { from: { at: 'sup', local: [3, 0.5, 0.6] }, look: { at: 'sup', off: [0, 0.4, 0] }, fov: 44 },
        hold: 0.35,
      },
      {
        pose: [
          { who: 'gohan', pose: 'ug_elbow', face: 'calm', speed: 30 },
          { who: 'sup', pose: 'knockdownFace', face: 'ko', speed: 20 },
        ],
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.vfx.impact(st.sup.chest(), 3, 0xffffff);
          ctx.b.stage.crater(st.sup.pos, 3, 0.5, null);
          ctx.b.vfx.dust(st.sup.pos, 3, 14, ctx.b.stage.dustColor);
          ctx.b.cameraTraumaAt(st.sup.pos, 0.8);
          ctx.b.sfx('groundImpact', st.sup);
        },
        cam: { from: { at: 'sup', local: [3.2, 0.3, 0.8] }, look: { at: 'sup', off: [0, -0.4, 0] }, fov: 46 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'gohan', pose: 'ug_stare', face: 'calm', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.4, 0.55, 1.6] }, look: { at: 'gohan:head' }, fov: 34 },
        say: { who: 'adult_gohan', line: 'Get up.', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.fistCaught = true;
    },
  };

  /** The end of the reversal: Super Buu's beam, and a Masenko from over the head that eats it. */
  S.ug_masenko = {
    id: 'ug_masenko',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 4 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          // he leaps back out of reach first: the beam needs the distance
          const away = st.sup.pos.clone().sub(st.gohan.pos).setY(0);
          if (away.lengthSq() < 0.01) away.set(0, 0, -1);
          st.sup.setPosition(ground(ctx, st.gohan.pos.clone().addScaledVector(away.normalize(), 10)));
          st.sup.grounded = true;
          faceTo(st.sup, st.gohan.pos);
          faceTo(st.gohan, st.sup.pos);
          ctx.b.vfx.dust(st.sup.pos, 2, 10, ctx.b.stage.dustColor);
        },
        pose: [
          { who: 'sup', pose: 'sb_blastW', face: 'shout', speed: 8 },
          { who: 'gohan', pose: 'ug_stare', face: 'calm', speed: 4 },
        ],
        cam: { from: { at: 'sup', local: [0.8, 0.3, 2.2] }, look: { at: 'sup:head' }, fov: 38 },
        tick: (ctx) => {
          const st = story(ctx);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.streamInward(st.sup.chest().addScaledVector(st.sup.forward, 0.6), 2, 0xff6ab4, 2, 0.14, 0.35);
        },
        say: { who: 'sup', line: 'DISAPPEAR!', duration: 1.4, style: 'shout' },
        hold: 1.4,
      },
      // hands together over the head; a gold ball between them
      {
        pose: [
          { who: 'sup', pose: 'sb_blast', face: 'shout', speed: 14 },
          { who: 'gohan', pose: 'ug_masenkoW', face: 'calm', speed: 10 },
        ],
        cam: { from: { at: 'gohan', local: [1.4, 0.2, 2.4] }, look: { at: 'gohan', off: [0, 0.8, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const hands = st.gohan.model.joints.handR.getWorldPosition(new THREE.Vector3()).sub(st.gohan.object.position).add(st.gohan.pos);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.flash(hands, 0.6 + Math.min(1, t) * 0.8, 0xffe25a, 0.12, SL.Toon.tex.glow);
          // the pink beam coming, eating the distance
          const k = Math.min(0.55, t / 2);
          const from = st.sup.chest().addScaledVector(st.sup.forward, 0.6), to = from.clone().lerp(st.gohan.chest(), k);
          if (ctx.b.frame % 2 === 0) for (let i = 0; i <= 8; i++) ctx.b.vfx.trail(from.clone().lerp(to, i / 8), 0xff6ab4, 0.7, 0.25);
        },
        hold: 1.2,
      },
      {
        cam: { from: { at: 'gohan', local: [1.4, 0.2, 2.4] }, look: { at: 'gohan', off: [0, 0.8, 0] }, fov: 42 },
        cue: { key: 's1', label: 'Masenko', auto: 6, slow: 0.3 },
      },
      {
        pose: [{ who: 'gohan', pose: 'ug_masenko', face: 'shout', speed: 24 }],
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.sfx('beamFire', st.gohan, { pitch: 1.1, vol: 1.2 });
          SL.ScreenFX.flash(0.4, '#fff4b0');
        },
        cam: { from: { at: 'gohan', local: [-1.6, 0.6, -2.4] }, look: { at: 'sup', off: [0, 0.3, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const from = st.gohan.chest().addScaledVector(st.gohan.forward, 0.6), to = st.sup.chest();
          const k = Math.min(1, t / 0.6);
          if (ctx.b.frame % 2 === 0) for (let i = 0; i <= 12; i++) ctx.b.vfx.trail(from.clone().lerp(to, (i / 12) * k), 0xffe25a, 1.1, 0.28);
          if (k >= 1 && !ctx.hit) {
            ctx.hit = true;
            ctx.b.vfx.explosion(to, 4, 0xffe25a, { smoke: true });
            ctx.b.cameraTraumaAt(to, 0.9);
            ctx.b.sfx('explosionBig', st.sup);
            st.sup.setState('scripted', { pose: 'hitHeavy', expression: 'ko' });
          }
        },
        say: { who: 'adult_gohan', line: 'MASENKO!', duration: 1.4, style: 'shout' },
        hold: 1.6,
      },
      // what is left of him, growing back, furious
      {
        pose: [{ who: 'sup', pose: 'eb_mutate', face: 'angry', speed: 8 }],
        cam: { from: { at: 'sup', local: [0.8, 0.2, 2.4] }, look: { at: 'sup', off: [0, 0.3, 0] }, fov: 40 },
        tick: (ctx) => {
          const st = story(ctx);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.smoke.emit(st.sup.chest().x, st.sup.chest().y + 0.4, st.sup.chest().z, U.rand(-1, 1), U.rand(1, 3), U.rand(-1, 1), 0.95, 0.75, 0.85, 0.4, 0.5, 1, { grow: 1.6, drag: 1 });
        },
        sfx: { name: 'regrow', who: 'sup' },
        say: { who: 'sup', line: 'Grrr... HOW?!', duration: 1.6, style: 'shout' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.masenko = true;
    },
  };

  S.ug_trick = {
    id: 'ug_trick',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      // losing, he swells up: the whole Earth with him
      {
        pose: [{ who: 'sup', pose: 'sb_roar', face: 'shout', speed: 6 }],
        mood: { amount: 0.3, color: 0x2a0a20, seconds: 1.5 },
        cam: { from: { at: 'sup', local: [0.6, 0.6, 3.2] }, look: { at: 'sup:head' }, fov: 40 },
        say: { who: 'sup', line: 'Enough! I\'ll blow myself up — and the whole Earth with me!', duration: 3.2, style: 'shout' },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 3);
          size(st.sup, 1 + k * 0.35 + Math.sin(t * 30) * 0.02);
          if (ctx.b.frame % 10 === 0) ctx.b.vfx.flash(st.sup.chest(), 2 + k * 3, 0xff7ab8, 0.2, SL.Toon.tex.glow);
        },
        hold: 3.4,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_calm', face: 'calm', speed: 3 }],
        cam: { from: { at: 'gohan', local: [0.5, 0.35, 2.1] }, look: { at: 'gohan:head' }, fov: 36 },
        say: { who: 'adult_gohan', line: 'Go ahead. You won\'t. You like living too much.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        call: (ctx) => size(story(ctx).sup, 1),
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'angry', speed: 5 }],
        cam: { from: { at: 'sup', local: [0.6, 0.5, 2.4] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: '...Tch.', duration: 1.4, style: 'quiet' },
        hold: 1.6,
      },
      // two more arrive; behind them, a piece of pink lying on the ground, left there a moment ago
      {
        call: (ctx) => {
          const st = story(ctx);
          for (const f of [st.gotenks, st.piccolo]) f.setHidden(false);
          st.gotenks.setPosition(ground(ctx, new V3(7, 0, 9)));
          st.piccolo.setPosition(ground(ctx, new V3(9, 0, 9.6)));
          SL.data.buuKit.toForm(st.gotenks, 'ssj3');
          for (const f of [st.gotenks, st.piccolo]) faceTo(f, st.sup.pos);
          const blob = FX().blob(ctx.m, ground(ctx, new V3(8, 0, 12)).add(new V3(0, 0.3, 0)));
          blob.visible = true;
          blob.scale.set(0.4, 0.25, 0.4);
          pt(ctx, 'blob', blob.position);
        },
        pose: [
          { who: 'gotenks', pose: 'gk_pose', face: 'grin', speed: 6 },
          { who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 4 },
        ],
        cam: { from: { at: 'gotenks', local: [0.5, 0.3, 3] }, look: { at: 'gotenks', local: [1, 0.2, 0] }, fov: 44 },
        say: { who: 'gotenks', line: 'We\'re BACK! Hey — who stole our fight?!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'grin', speed: 5 }],
        cam: { from: { at: 'sup', local: [0.5, 0.5, 2.2] }, look: { at: 'sup:head' }, fov: 36 },
        say: { who: 'sup', line: 'Hehehe... just in time.', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      // the piece of him rises behind them and spreads over them
      {
        cam: { from: { at: 'blob', off: [5, 3, 6] }, look: { at: 'blob', off: [0, 1.4, -2] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), blob = st.blob;
          const k = Math.min(1, t / 1.6);
          const mid = st.gotenks.pos.clone().lerp(st.piccolo.pos, 0.5);
          blob.position.lerpVectors(ctx.cast.blob.pos, mid.clone().add(new V3(0, 1 + k * 0.4, 0)), k);
          blob.scale.set(0.4 + k * 2.2, 0.25 + k * 1.6, 0.4 + k * 2.2);
          if (t > 1.6 && !st.gotenks.hidden) {
            for (const f of [st.gotenks, st.piccolo]) f.setHidden(true);
            ctx.b.sfx('stretch', null, { at: mid, pitch: 0.6, vol: 1.2 });
          }
        },
        pose: [
          { who: 'gotenks', pose: 'gk_uhoh', face: 'shock', speed: 8 },
          { who: 'piccolo', pose: 'p_standHurt', face: 'shock', speed: 8 },
        ],
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const b = st.blob;
          b.visible = true;
        },
        cam: { from: { at: 'sup', local: [0.8, 0.4, 5] }, look: { at: 'sup', off: [0, 0.4, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx), blob = st.blob;
          // back to its owner
          const k = Math.min(1, t / 1.2);
          blob.position.lerp(st.sup.chest(), 0.08 + k * 0.2);
          blob.scale.multiplyScalar(0.985);
          if (k >= 1 && blob.visible) {
            blob.visible = false;
            ctx.b.sfx('regrow', st.sup, { pitch: 0.8 });
          }
        },
        pose: [{ who: 'gohan', pose: 'ag_calm', face: 'shock', speed: 6 }],
        say: { who: 'adult_gohan', line: 'Gotenks! Piccolo!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      // the change
      {
        pose: [{ who: 'sup', pose: 'sb_roar', face: 'shout', speed: 8 }],
        sfx: { name: 'steam', who: 'sup', vol: 1, dur: 2.4 },
        cam: { from: { at: 'sup', local: [2.2, -0.2, 5] }, look: { at: 'sup', off: [0, 0.4, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), f = st.sup;
          const k = Math.min(1, t / 2.2);
          size(f, 1 + k * 0.08 + Math.sin(t * 34) * 0.02 * k, 1 + k * 0.05);
          if (ctx.b.frame % 8 === 0) ctx.b.cameraTraumaAt(f.pos, 0.15 + k * 0.3);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.smoke.emit(f.chest().x, f.chest().y + 0.8, f.chest().z, U.rand(-1, 1), U.rand(2, 5), U.rand(-1, 1), 0.95, 0.75, 0.85, 0.5, 0.5 + k * 0.6, 1.2, { grow: 2, drag: 1 });
        },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          size(st.sup, 1);
          st.bt.setHidden(false);
          st.bt.setPosition(st.sup.pos.clone());
          st.bt.yaw = st.bt.prevYaw = st.sup.yaw;
          st.sup.setHidden(true);
          ctx.b.vfx.explosion(st.bt.chest(), 3, 0xff7ab8);
          SL.ScreenFX.flash(0.5, '#ffc0e0');
        },
        pose: [{ who: 'bt', pose: 'bt_pose', face: 'grin', speed: 8 }],
        sfx: { name: 'transformBurst', who: 'bt', pitch: 0.8 },
        shake: { at: 'bt', amount: 0.8 },
        cam: { from: { at: 'bt', local: [1.2, 0.7, 5] }, look: { at: 'bt', off: [0, 0.4, 0] }, fov: 46 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'bt', pose: 'bt_idle', face: 'grin', speed: 5 }],
        cam: { from: { at: 'bt', local: [0.5, 0.5, 2.4] }, look: { at: 'bt:head' }, fov: 36 },
        say: { who: 'buutenks', line: 'Ahh. So THIS is what the little show-off felt like. I like it.', duration: 3.4 },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      size(st.sup, 1);
      st.sup.setHidden(true);
      st.sup.untargetable = st.sup.intangible = true;
      st.bt.setHidden(false);
      if (st.bt.pos.distanceTo(st.sup.pos) > 0.5) st.bt.setPosition(st.sup.pos.clone());
      for (const f of [st.gotenks, st.piccolo]) f.setHidden(true);
      if (st.blob) st.blob.visible = false;
      ctx.m.flags.absorbed = true;
      ctx.m.flags.buutenks = true;
    },
  };

  S.ug_hope = {
    id: 'ug_hope',
    cast,
    clearMood: false,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [
          { who: 'gohan', pose: 'defeatKneel', face: 'hurt', speed: 4 },
          { who: 'bt', pose: 'bt_laugh', face: 'grin', speed: 6 },
        ],
        mood: { amount: 0.3, color: 0x1a1024, seconds: 1.5 },
        cam: { from: { at: 'bt', local: [0.6, 0.6, 2.6] }, look: { at: 'bt:head' }, fov: 38 },
        say: { who: 'buutenks', line: 'What\'s the matter, Gohan? Not so calm now!', duration: 2.8 },
        hold: 3,
      },
      {
        cam: { from: { at: 'gohan', local: [0.9, 0.1, 1.6] }, look: { at: 'gohan:head' }, fov: 36 },
        say: { who: 'adult_gohan', line: '(Gotenks... Piccolo... I\'m sorry. I can\'t...)', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // far away, a light coming down out of the sky
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'far', ground(ctx, st.gohan.pos.clone().add(new V3(-60, 0, 90))));
        },
        cam: { from: { at: 'gohan', local: [0.6, 0.8, -1.6] }, look: { at: 'far', off: [0, 30, 0] }, fov: 50 },
        tick: (ctx, t) => {
          const p = ctx.cast.far.pos.clone().add(new V3(0, 60 - t * 16, 0));
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(p, 0xfff4c0, 3, 0.6);
          if (ctx.b.frame % 12 === 0) ctx.b.vfx.flash(p, 9, 0xfff4c0, 0.35, SL.Toon.tex.glow);
        },
        say: { who: 'adult_gohan', line: '...That ki. It can\'t be...', duration: 2.6, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.hope = true;
    },
  };
})();
