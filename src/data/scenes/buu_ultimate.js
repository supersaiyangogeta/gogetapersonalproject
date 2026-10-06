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

  // the owner's brief (2026-10-02): he ducks a hook with his hands still at his belt...
  SL.data.poses.ug_duckBelt = {
    root: { y: -0.3, rx: 18 }, spine: [22, 0, 0], chest: [10, 0, 0], head: [-14, 0, 0],
    shoulderL: [-8, 0, 16], elbowL: [-82, 0, 0], shoulderR: [-8, 0, -16], elbowR: [-82, 0, 0],
    thighL: [-58, 8, 12], kneeL: [82, 0, 0], thighR: [-26, -8, -12], kneeR: [70, 0, 0],
    hands: ['fist', 'fist'],
  };
  // ...and comes up with one elbow into the ribs, the other hand never leaving the belt
  SL.data.poses.ug_ribElbow = {
    root: { y: -0.16, rx: 8 }, hips: [0, -16, 0], spine: [6, -12, 0], chest: [6, -26, 0], head: [-4, 18, 0],
    shoulderR: [-84, 34, -24], elbowR: [-146, 0, 0], shoulderL: [-8, 0, 16], elbowL: [-82, 0, 0],
    thighL: [-40, 10, 12], kneeL: [52, 0, 0], thighR: [12, -10, -12], kneeR: [30, 0, 0],
    hands: ['fist', 'fist'],
  };

  S.ug_return = {
    id: 'ug_return',
    cast,
    music: { song: 'gohan_theme', level: 2 },
    events: [
      // a leveled wasteland, Super Buu alone in it, bored
      {
        call: (ctx) => {
          const st = story(ctx);
          st.sup.setPosition(ground(ctx, new V3(0, 0, -3)));
          st.gohan.setPosition(ground(ctx, new V3(0, 0, 5)));
          st.gohan.setHidden(true);
          faceTo(st.sup, new V3(0, 0, -20));
          faceTo(st.gohan, st.sup.pos);
        },
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'angry', speed: 3 }],
        cam: { from: { at: 'sup', local: [1, 0.4, 3] }, look: { at: 'sup:head' }, fov: 40 },
        say: { who: 'sup', line: 'Where are they hiding? There must be SOMEBODY left worth fighting...', duration: 3.4 },
        hold: 3.6,
      },
      // something coming: a white streak out of the sky
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.land = ground(ctx, new V3(0, 0, 5));
          ctx.top = ctx.land.clone().add(new V3(-14, 46, 18));
          st.gohan.setHidden(false);
          st.gohan.setPosition(ctx.top);
          st.gohan.grounded = false;
          faceTo(st.sup, ctx.land);
          pt(ctx, 'land', ctx.land);
        },
        pose: [
          { who: 'gohan', pose: 'ug_flyForward', face: 'calm', speed: 4 },
          { who: 'sup', pose: 'sb_idle', face: 'shock', speed: 4 },
        ],
        cam: { from: { at: 'sup', local: [0.9, -0.2, 2.4] }, look: { at: 'land', off: [-6, 20, 8] }, look2: { at: 'land', off: [0, 1.2, 0] }, ease: 'in', fov: 50 },
        tick: (ctx, t) => {
          const g = story(ctx).gohan, k = U.easeInOutCubic(Math.min(1, t / 1.5));
          g.setPosition(ctx.top.clone().lerp(ctx.land.clone().add(new V3(0, 0.05, 0)), k));
          g.prevPos.copy(g.pos);
          if (ctx.b.frame % 2 === 0 && k < 0.98) ctx.b.vfx.trail(g.chest(), 0xf4f8ff, 0.5, 0.45);
        },
        sfx: { name: 'dash', vol: 0.8, pitch: 0.7 },
        hold: 1.6,
      },
      // the boots touch the dirt — softly: a little dust, no crater
      {
        call: (ctx) => {
          const g = story(ctx).gohan;
          g.setPosition(ctx.land);
          g.grounded = true;
          g.setState('scripted', { pose: 'ag_calm', expression: 'calm' });
          ctx.b.vfx.dust(ctx.land, 1, 6);
          ctx.b.vfx.ring(ctx.land.clone().add(new V3(0, 0.05, 0)), 2.2, 0xf4f8ff, 0.5, new V3(0, 1, 0));
        },
        cam: { from: { at: 'land', off: [1.1, 0.25, 1.6] }, to: { at: 'land', off: [1.2, 0.9, 1.8] }, look: { at: 'land', off: [0, 0.3, 0] }, look2: { at: 'gohan:head', off: [0, 0, 0] }, fov: 44 },
        hold: 2,
      },
      // arms crossed, the grin coming back
      {
        call: (ctx) => faceTo(story(ctx).sup, story(ctx).gohan.pos),
        pose: [{ who: 'sup', pose: 'armsCrossed', face: 'grin', speed: 6 }],
        cam: { from: { at: 'sup', local: [0.7, 0.75, 3.3] }, look: { at: 'sup:head', off: [0, -0.15, 0] }, fov: 38 },
        say: { who: 'sup', line: 'So, you want to fight me?', duration: 2.4 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'gohan', pose: 'ug_stare', face: 'calm', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.35, 0.55, 1.5] }, to: { at: 'gohan', local: [0.3, 0.55, 1.25] }, look: { at: 'gohan:head', off: [0, 0.1, 0] }, fov: 34 },
        say: { who: 'adult_gohan', line: 'Fight you? No. I\'m gonna kill you.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // a supersonic right hook...
      {
        pose: [{ who: 'sup', pose: 'sb_jabW', face: 'angry', speed: 10 }],
        move: { who: 'sup', at: 'gohan', off: [0, 0, -1.1], seconds: 0.35, ease: 'in' },
        cam: { from: { at: 'gohan', local: [2.6, 0.4, 1.4] }, look: { at: 'gohan', local: [0, 0.3, 0.8] }, fov: 44 },
        hold: 0.05,
      },
      { cue: { key: 'dodge', label: 'Duck', auto: 6, slow: 0.25 } },
      // ...and he is under it, hands still at his belt
      {
        pose: [
          { who: 'gohan', pose: 'ug_duckBelt', face: 'calm', speed: 30 },
          { who: 'sup', pose: 'sb_jab', face: 'angry', speed: 30 },
        ],
        sfx: { name: 'swing', vol: 1, pitch: 0.7 },
        slow: { scale: 0.3, seconds: 0.9 },
        cam: { from: { at: 'gohan', local: [2.2, 0.1, 0.7] }, look: { at: 'gohan', local: [0, 0.2, 0.5] }, fov: 40 },
        flag: { ducked: true },
        hold: 1,
      },
      // one elbow to the ribs: the torso caves round it
      {
        pose: [
          { who: 'gohan', pose: 'ug_ribElbow', face: 'calm', speed: 30 },
          { who: 'sup', pose: 'hitBody', face: 'shock', speed: 30 },
        ],
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, s = st.sup;
          const side = new V3(-s.forward.z, 0, s.forward.x);
          const ribs = s.chest().addScaledVector(side, -0.25).add(new V3(0, -0.1, 0));
          b.vfx.impact(ribs, 1.2, 0xffffff);
          b.vfx.ring(ribs, 1.6, 0xf2f6ff, 0.3, side);
          b.cameraTraumaAt(ribs, 0.6);
          b.sfx('punchHeavy', s, { pitch: 0.6, vol: 1.4 });
          b.sfx('boneCrack', s, { pitch: 0.9, vol: 0.8 });
          size(s, 1, 0.94, 0.8);
        },
        slow: { scale: 0.3, seconds: 1 },
        cam: { from: { at: 'sup', local: [2.2, 0.15, 0.9] }, look: { at: 'sup', off: [0, 0.1, 0] }, fov: 40 },
        flag: { ribs: true },
        hold: 1.2,
      },
      // he reels back spitting purple; the boy has not moved
      {
        call: (ctx) => {
          const s = story(ctx).sup;
          size(s, 1);
          ctx.r0 = s.pos.clone();
          ctx.r1 = ground(ctx, s.pos.clone().addScaledVector(s.forward, -1.6));
        },
        pose: [{ who: 'sup', pose: 'eb_mutate', face: 'hurt', speed: 10 }],
        cam: { from: { at: 'sup', local: [2.6, 0.3, 0.4] }, look: { at: 'sup:head', off: [0, -0.1, 0] }, fov: 40 },
        tick: (ctx, t) => {
          const s = story(ctx).sup, b = ctx.b, k = U.easeOutCubic(Math.min(1, t / 0.5));
          s.setPosition(ctx.r0.clone().lerp(ctx.r1, k));
          s.prevPos.copy(s.pos);
          if (t < 0.8 && b.frame % 3 === 0) {
            const mouth = SL.Cinema.actorPoint(ctx, 'sup:head').addScaledVector(s.forward, 0.18);
            b.vfx.sparks(mouth, 0x8a3ab0, 6, 4, 0.06);
            b.vfx.trail(mouth.clone().addScaledVector(s.forward, 0.2 + t * 0.6).add(new V3(0, -t * 0.8, 0)), 0x7a2aa0, 0.12, 0.5);
          }
        },
        hold: 1.6,
      },
      {
        pose: [{ who: 'gohan', pose: 'ug_stare', face: 'calm', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.6, -0.4, 1.9] }, look: { at: 'gohan:head', off: [0, 0.05, 0] }, fov: 36 },
        hold: 2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.gohan.setHidden(false);
      st.gohan.grounded = true;
      size(st.sup, 1);
      ctx.m.flags.ducked = true;
      ctx.m.flags.ribs = true;
    },

  };

  /** The end of the reversal: Super Buu's beam, and a Masenko from over the head that eats it. */
  S.ug_masenko = {
    id: 'ug_masenko',
    cast,
    clearMood: false,
    music: { song: 'gohan_theme', level: 4 },
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
