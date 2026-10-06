/*
 * SCENES — Chapter 14: Kid Buu (Buu Saga priority 11).
 *
 *   kb_birth      the canyon: the huge body shrinking in its steam, and the small thing standing up in it;
 *                 the scream; "Buu's original form"; a mesa blown away for nothing
 *   kb_burst      up into the air, both arms raised, a sun growing over his head; Kibito Kai; the choice
 *   kb_fetch      Instant Transmission to the Lookout (a cue): Dende and Mr. Satan; back (a cue); gone
 *   kb_boom       the Earth from space, and what Kid Buu does to it; a pink speck in the dark, laughing
 *   sw_arrive     the Sacred World of the Kai: the survivors; a purple flash — he followed them; Super Saiyan 3
 *   sw_ask        Goku guttering in the gold: "I need one full minute"; Vegeta's answer; Super Saiyan 2;
 *                 the walk past Kakarot (a tracking shot behind his boots); Kid Buu beating his chest
 *   sw_overwhelm  VEGETA DOWN: the throat, the gut, the slam into the ground, the monster laughing over him
 *   sw_prince     VEGETA RECOVERS: fingers in the rock, up in stages, the jaw wiped — "What are you laughing
 *                 at?! ... You're nothing but a trickster! I am a warrior! The Saiyan Prince... VEGETA!"
 *   sw_numberone  the minute up; Goku's Super Saiyan 3 caving in to base; the stomp; Vegeta's thoughts —
 *                 "You are Number One!" (Mr. Satan and Good Buu come in "Goodbye, Buu": sb_beatdown)
 *   sw_plan       the Spirit Bomb, and the Dragon Balls of Namek
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.buuKit;
  const VK = () => SL.data.vegitoKit;
  const TK = () => SL.data.trunksKit;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const ground = (ctx, v, lift = 0) => {
    const p = v.clone();
    p.y = (ctx.b.stage.hasGround ? ctx.b.stage.heightAt(p.x, p.z) : 0) + lift;
    return p;
  };
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));
  const scale = (f, k) => {
    const s = f.model.baseScale * (f.model._lookScale || 1) * k;
    f.model.root.scale.setScalar(s);
  };
  /** Everybody on the canyon who must not be seen on the Lookout (and back again). */
  const CANYON = ['vegeta', 'kid', 'gohan', 'goten', 'trunks', 'piccolo', 'kai'];

  /* ============================================================================ THE BIRTH */
  S.kb_birth = {
    id: 'kb_birth',
    cast,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      // the canyon, the steam still pouring off something that is getting smaller
      {
        call: (ctx) => {
          const st = story(ctx);
          st.kid.setHidden(true);
          pt(ctx, 'spot', st.kid.pos);
          ctx.b.stage.setMood(0.5, 0x24081a, 1);
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'shock' },
          { who: 'vegeta', pose: 'idle', face: 'shock' },
        ],
        cam: { from: { at: 'spot', off: [8, 2, 14] }, look: { at: 'spot', off: [0, 1, 0] }, fov: 46 },
        tick: (ctx) => {
          VK().steam(ctx.b, story(ctx).kid, 1.6);
          if (ctx.b.frame % 6 === 0) ctx.b.camera.addTrauma(0.1);
        },
        sfx: { name: 'steam', vol: 1.3 },
        hold: 2.8,
      },
      // curled up in it, small; then unfolding
      {
        call: (ctx) => {
          const k = story(ctx).kid;
          k.setHidden(false);
          scale(k, 0.5);
          k.setState('scripted', { pose: 'eb_form', expression: 'calm' });
        },
        cam: { from: { at: 'spot', off: [2.2, 0.6, 3.6] }, to: { at: 'spot', off: [1.8, 0.5, 3] }, look: { at: 'spot', off: [0, 0.4, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const k = story(ctx).kid;
          scale(k, 0.5 + 0.5 * U.easeOutCubic(Math.min(1, t / 1.6)));
          VK().steam(ctx.b, k, 1 - Math.min(1, t / 2));
        },
        sfx: { name: 'regrow', vol: 1.1, pitch: 1.3 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'kid', pose: 'kb_idle', face: 'grin', speed: 4 }],
        cam: { from: { at: 'kid', local: [0.5, -0.1, 1.9] }, look: { at: 'kid:head', off: [0, 0.05, 0] }, fov: 40 },
        hold: 1.8,
      },
      // the scream
      {
        pose: [{ who: 'kid', pose: 'kb_scream', face: 'shout', speed: 10 }],
        call: (ctx) => {
          const k = story(ctx).kid, b = ctx.b;
          b.sfx('roar', k, { pitch: 1.6, vol: 1.4 });
          b.vfx.ring(k.chest(), 9, 0xff8ac8, 0.6);
          b.vfx.ring(ground(ctx, k.pos).add(new V3(0, 0.1, 0)), 14, 0xffd0e8, 0.8, new V3(0, 1, 0));
        },
        vfx: { kind: 'rocks', at: { at: 'kid' }, radius: 7, count: 12, lift: 9 },
        cam: { from: { at: 'kid', off: [-5, 0.8, 7] }, look: { at: 'kid', off: [0, 0.4, 0] }, fov: 48 },
        tick: (ctx) => ctx.b.camera.addTrauma(0.08),
        say: { who: 'kid_buu', line: 'HYAAAAAAAAAAAAAAAH!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [0.35, 0.45, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'What... is that thing?', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.35, 0.45, 1.5] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Buu\'s original form. No mind, no reason... nothing left in him but destruction.', duration: 3.8 },
        hold: 4,
      },
      // a giggle, and a mesa gone for no reason at all
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, k = st.kid;
          let best = null;
          for (const o of b.stage.obstacles) if (o.alive && (!best || Math.hypot(o.x - k.pos.x, o.z - k.pos.z) < Math.hypot(best.x - k.pos.x, best.z - k.pos.z))) best = o;
          ctx.mesa = best;
          if (best) {
            faceTo(k, new V3(best.x, k.pos.y, best.z));
            pt(ctx, 'mesa', new V3(best.x, (best.top || 4) * 0.5, best.z));
          } else pt(ctx, 'mesa', k.pos.clone().add(new V3(12, 2, -6)));
        },
        pose: [{ who: 'kid', pose: 'kb_mouth', face: 'grin', speed: 12 }],
        cam: { from: { at: 'kid', local: [-2.4, 0.6, -1.6] }, look: { at: 'mesa' }, fov: 50 },
        tick: (ctx, t) => {
          if (t < 0.35 || ctx.shot) return;
          ctx.shot = true;
          const b = ctx.b, k = story(ctx).kid, to = ctx.cast.mesa.pos;
          const from = SL.Cinema.actorPoint(ctx, 'kid:head');
          for (let i = 0; i <= 10; i++) b.vfx.trail(from.clone().lerp(to, i / 10), 0xff6ab4, 0.4, 0.4);
          b.vfx.explosion(to, 1.4, 0xff9ad0, { smoke: true });
          if (ctx.mesa) b.stage.destroyPillar(ctx.mesa, {});
          b.sfx('explosionBig', null, { at: to, vol: 1.1 });
        },
        say: { who: 'kid_buu', line: 'Kyahahahaha!', duration: 1.8 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const k = story(ctx).kid;
      k.setHidden(false);
      scale(k, 1);
      k.setState('scripted', { pose: 'kb_idle', expression: 'grin' });
      ctx.m.flags.kidBorn = true;
    },
  };

  /** Down on one knee, beaten, but the head up: a prince who still has something to say. */
  SL.data.poses.sw_kneelUp = (t) => ({
    root: { y: -0.46, rx: 8 },
    spine: [14, 0, 0], chest: [4, 0, 0], neck: [-6, 0, 0], head: [-10 + Math.sin(t * 1.4) * 2, 0, 0],
    shoulderL: [-38, 0, 8], elbowL: [-40, 0, 0], shoulderR: [-10, 0, -10], elbowR: [-10, 0, 0],
    thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
  });

  /* ---------------------------------------------------------------- poses for Vegeta's minute (any rig) */
  const PZ = SL.data.poses;
  // Kid Buu beating his chest like an ape, head back, belly out
  PZ.kb_chestBeat = (t) => {
    const s = Math.sin(t * 14);
    return {
      root: { y: -0.06 + Math.abs(s) * 0.03, rx: -6 }, spine: [-6, 0, 0], chest: [-10, s * 6, 0], head: [-22, 0, 0],
      shoulderL: [-70 - Math.max(0, s) * 30, 0, 24], elbowL: [-120, 0, 0], shoulderR: [-70 - Math.max(0, -s) * 30, 0, -24], elbowR: [-120, 0, 0],
      thighL: [-18, 0, 22], kneeL: [32, 0, 0], thighR: [-18, 0, -22], kneeR: [32, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // bent double with laughing, slapping his knees in turn
  PZ.kb_kneeSlap = (t) => {
    const s = Math.sin(t * 16);
    return {
      root: { y: -0.1, rx: 26 }, spine: [22, 0, 0], chest: [10, 0, 0], head: [-34 + s * 6, 0, 0],
      shoulderL: [-14 - Math.max(0, s) * 40, 0, 10], elbowL: [-18, 0, 0], shoulderR: [-14 - Math.max(0, -s) * 40, 0, -10], elbowR: [-18, 0, 0],
      thighL: [-34, 0, 16], kneeL: [48, 0, 0], thighR: [-34, 0, -16], kneeR: [48, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // folded round a fist in the stomach, mouth open
  PZ.kb_gutDouble = {
    root: { y: -0.16, rx: 30 }, spine: [34, 0, 0], chest: [24, 0, 0], head: [-26, 0, 0],
    shoulderL: [-44, 0, -12], elbowL: [-112, 0, 0], shoulderR: [-44, 0, 12], elbowR: [-112, 0, 0],
    thighL: [-42, 0, 10], kneeL: [62, 0, 0], thighR: [-20, 0, -10], kneeR: [50, 0, 0],
    hands: ['open', 'open'],
  };
  // a hook to the jaw: the head wrenched round, the body following it
  PZ.kb_headTwist = {
    root: { y: -0.05, rz: 14 }, spine: [0, 22, 8], chest: [-6, 30, 12], neck: [0, 28, 0], head: [-14, 62, 22],
    shoulderL: [-20, 0, 64], elbowL: [-30, 0, 0], shoulderR: [-34, 0, -44], elbowR: [-60, 0, 0],
    thighL: [-8, 0, 18], kneeL: [26, 0, 0], thighR: [12, 0, -12], kneeR: [20, 0, 0],
    hands: ['open', 'open'],
  };
  // Vegeta face down, both hands clawing into the rock
  PZ.vk_dig = {
    root: { y: -0.84, rx: 90 }, head: [-46, 18, 0],
    shoulderL: [-150, 0, 24], elbowL: [-50, 0, 0], shoulderR: [-150, 0, -24], elbowR: [-50, 0, 0],
    thighL: [10, 0, 10], kneeL: [16, 0, 0], thighR: [0, 0, -8], kneeR: [30, 0, 0],
    hands: ['fist', 'fist'],
  };
  // up, but barely: the legs shaking, the left arm hanging
  PZ.vk_battered = (t) => {
    const q = Math.sin(t * 31) * 2;
    return {
      root: { y: -0.1, rx: 12, rz: Math.sin(t * 2) * 2 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
      shoulderL: [-6, 0, 8], elbowL: [-14, 0, 0], shoulderR: [-26, 0, -16], elbowR: [-70, 0, 0],
      thighL: [-26 + q, 0, 12], kneeL: [42 - q, 0, 0], thighR: [-6 - q, 0, -12], kneeR: [30 + q, 0, 0],
      hands: ['open', 'fist'],
    };
  };
  // the back of the right glove across the jaw
  PZ.vk_wipe = {
    root: { y: -0.06, rx: 6 }, spine: [8, 0, 0], chest: [4, -10, 0], head: [-4, 22, 6],
    shoulderL: [-8, 0, 10], elbowL: [-18, 0, 0], shoulderR: [-112, 0, -34], elbowR: [-142, 0, 0],
    thighL: [-20, 0, 12], kneeL: [32, 0, 0], thighR: [-4, 0, -12], kneeR: [22, 0, 0],
    hands: ['open', 'fist'],
  };
  // one arm out at the monster
  PZ.vk_point = {
    root: { y: -0.04, rx: -2 }, spine: [-2, -8, 0], chest: [-6, -16, 0], head: [-6, 14, 0],
    shoulderL: [-22, 0, 16], elbowL: [-70, 0, 0], shoulderR: [-88, 0, -6], elbowR: [-4, 0, 0],
    thighL: [-22, 0, 16], kneeL: [28, 0, 0], thighR: [10, 0, -14], kneeR: [18, 0, 0],
    hands: ['fist', 'point'],
  };
  // fists at his sides, chest out, chin down
  PZ.vk_glare = (t) => ({
    root: { y: -0.06 }, spine: [-4, 0, 0], chest: [-8 + Math.sin(t * 30), 0, 0], head: [8, 0, 0],
    shoulderL: [-14, 0, 22], elbowL: [-34, 0, 0], shoulderR: [-14, 0, -22], elbowR: [-34, 0, 0],
    thighL: [-12, 0, 18], kneeL: [22, 0, 0], thighR: [-12, 0, -18], kneeR: [22, 0, 0],
    hands: ['fist', 'fist'],
  });
  // the roar: arms flung down and back, chest out, the head coming forward with it
  PZ.vk_declare = (t) => {
    const s = Math.sin(t * 40) * 2;
    return {
      root: { y: -0.12 }, spine: [-10, 0, 0], chest: [-20 + s, 0, 0], neck: [-4, 0, 0], head: [-6, 0, 0],
      shoulderL: [26, 0, 36 + s], elbowL: [-24, 0, 0], shoulderR: [26, 0, -36 - s], elbowR: [-24, 0, 0],
      thighL: [-10, 0, 26], kneeL: [34, 0, 0], footL: [-10, 0, -14], thighR: [-10, 0, -26], kneeR: [34, 0, 0], footR: [-10, 0, 14],
      hands: ['fist', 'fist'],
    };
  };
  // the barrage from above: palms down, one after the other
  PZ.vk_barrage = (t) => {
    const s = Math.sin(t * 26);
    return {
      root: { y: 0, rx: 34 }, spine: [16, 0, 0], chest: [10, 0, 0], head: [10, 0, 0],
      shoulderL: [-70 - s * 18, 0, 10], elbowL: [-10 - Math.max(0, -s) * 50, 0, 0], shoulderR: [-70 + s * 18, 0, -10], elbowR: [-10 - Math.max(0, s) * 50, 0, 0],
      thighL: [-40, 0, 10], kneeL: [70, 0, 0], thighR: [-10, 0, -10], kneeR: [40, 0, 0],
      hands: ['open', 'open'],
    };
  };

  /** The Planet Burst ball: a pink sun that the canyon haze must not wash out. */
  function sun(b, pos, r) {
    const o = TK().orb(b, pos, r, 0xff6ab4, 0xffe0f0);
    o.group.traverse((m) => m.material && (m.material.fog = false));
    return o;
  }

  /* ============================================================================ THE PLANET BURST */
  S.kb_burst = {
    id: 'kb_burst',
    cast,
    music: { song: 'overwhelm', level: 3 },
    clearMood: false,
    events: [
      // up into the air
      {
        call: (ctx) => {
          const k = story(ctx).kid;
          ctx.k0 = k.pos.clone();
          ctx.k1 = k.pos.clone().add(new V3(0, 14, 0));
          k.grounded = false;
        },
        pose: [{ who: 'kid', pose: 'kb_burstUp', face: 'grin', speed: 6 }],
        cam: { from: { at: 'goku', local: [1.2, -0.4, -2.2] }, look: { at: 'kid', off: [0, 0.5, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const k = story(ctx).kid;
          k.setPosition(ctx.k0.clone().lerp(ctx.k1, U.easeInOutCubic(Math.min(1, t / 1.6))));
          k.prevPos.copy(k.pos);
        },
        hold: 1.8,
      },
      // the sun over his head
      {
        call: (ctx) => {
          const st = story(ctx), k = st.kid;
          st.burstOrb = sun(ctx.b, k.pos.clone().add(new V3(0, 3.5, 0)), 0.3);
          ctx.m.onDispose(() => st.burstOrb && st.burstOrb.dispose());
          pt(ctx, 'ball', k.pos.clone().add(new V3(0, 3.5, 0)));
        },
        sfx: { name: 'kiCharge', who: 'kid', vol: 1.2, pitch: 0.5 },
        cam: { from: { at: 'ball', off: [20, -6, 34] }, look: { at: 'ball', off: [0, -3, 0] }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx);
          if (!st.burstOrb) return;
          const r = 0.3 + Math.min(1, t / 3) * 8.5;
          st.burstOrb.set(r);
          st.burstOrb.group.position.copy(st.kid.pos).add(new V3(0, 1.2 + r, 0));
          st.burstOrb.pulse();
          ctx.b.camera.addTrauma(0.03);
        },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        tick: (ctx) => story(ctx).burstOrb && story(ctx).burstOrb.pulse(),
        say: { who: 'goku', line: 'He\'s going to blow up the whole planet!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      // Kibito Kai, out of nowhere
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          st.kai.setHidden(false);
          K().place(st.kai, ground(ctx, st.goku.pos.clone().add(new V3(-1.6, 0, 1.4))));
          faceTo(st.kai, st.goku.pos);
          b.vfx.flash(st.kai.chest(), 2, 0xffffff, 0.25, SL.Toon.tex.glow);
          b.sfx('teleport', st.kai, {});
        },
        pose: [{ who: 'kai', pose: 'idle', face: 'shout' }],
        cam: { from: { at: 'kai', local: [0.5, 0.4, 1.8] }, look: { at: 'kai:head', off: [0, 0.06, 0] }, fov: 38 },
        say: { who: 'kibitoshin', line: 'Goku! Vegeta! Take my hand — there\'s no time!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Wait! Dende and Mr. Satan are still on the Lookout!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.4, 0.4, 1.6] }, look: { at: 'vegeta:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'And our sons are lying right there, Kakarot!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'kai', local: [0.5, 0.4, 1.8] }, look: { at: 'kai:head', off: [0, 0.06, 0] }, fov: 38 },
        say: { who: 'kibitoshin', line: 'We can\'t save everyone! The Dragon Balls can bring the rest back — go!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const st = story(ctx), k = st.kid;
      if (!st.burstOrb) st.burstOrb = sun(ctx.b, k.pos.clone().add(new V3(0, 10, 0)), 8.8);
      st.burstOrb.set(8.8);
      st.kai.setHidden(false);
      ctx.m.flags.planetBurst = true;
    },
  };

  /* ============================================================================ THE FETCH */
  S.kb_fetch = {
    id: 'kb_fetch',
    cast,
    clearMood: false,
    events: [
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'angry', speed: 8 }],
        cam: { from: { at: 'goku', local: [0.45, 0.45, 1.5] }, look: { at: 'goku:head', off: [0, 0.06, 0] }, fov: 36 },
        say: { who: 'goku', line: 'I\'ll be right back!', duration: 1.6, style: 'shout' },
        hold: 0.6,
      },
      { cue: { key: 's2', label: 'Instant Transmission', auto: 6, slow: 0.3 } },
      // the Lookout: the two of them, staring down at a pink light where the canyon is
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          for (const k of CANYON) if (st[k]) st[k].setHidden(true);
          if (st.burstOrb) st.burstOrb.group.visible = false;
          b.changeStage('lookout');
          ctx.m.endShot();
          const at = (x, z) => ground(ctx, new V3(x, 0, z));
          st.dende.setHidden(false);
          st.satan.setHidden(false);
          K().place(st.dende, at(-0.8, 6));
          K().place(st.satan, at(0.9, 6.2));
          K().place(st.goku, at(0, 7.6));
          for (const f of [st.dende, st.satan]) faceTo(f, st.goku.pos);
          faceTo(st.goku, st.dende.pos);
          b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.25, SL.Toon.tex.glow);
          b.sfx('teleport', st.goku, {});
          pt(ctx, 'three', at(0, 6.6));
        },
        pose: [
          { who: 'satan', pose: 'guard', face: 'shock' },
          { who: 'dende', pose: 'idle', face: 'shock' },
          { who: 'goku', pose: 'idle', face: 'angry' },
        ],
        cam: { from: { at: 'three', off: [-4.6, 1.4, 1.2] }, look: { at: 'three', off: [0, 0.9, 0] }, fov: 44 },
        say: { who: 'mr_satan', line: 'G-Goku?! What is that thing down there?!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'No time — grab on, both of you!', duration: 2, style: 'shout' },
        hold: 0.6,
      },
      { cue: { key: 's2', label: 'Instant Transmission', auto: 6, slow: 0.3 } },
      // back: everybody holding on to Kibito Kai, the sun coming down
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.changeStage('rocky_canyon');
          ctx.m.endShot();
          for (const k of CANYON) if (st[k]) st[k].setHidden(false);
          if (st.burstOrb) st.burstOrb.group.visible = true;
          else {
            K().hover(b, st.kid, st.kid.pos.clone(), 14);
            st.burstOrb = sun(b, st.kid.pos.clone().add(new V3(0, 10, 0)), 8.8);
            ctx.m.onDispose(() => st.burstOrb && st.burstOrb.dispose());
          }
          const base = ground(ctx, st.kai.pos);
          K().place(st.goku, ground(ctx, base.clone().add(new V3(0.9, 0, 0.46))));
          K().place(st.dende, ground(ctx, base.clone().add(new V3(-0.8, 0, -0.41))));
          K().place(st.satan, ground(ctx, base.clone().add(new V3(-1.6, 0, -0.83))));
          K().place(st.vegeta, ground(ctx, base.clone().add(new V3(1.9, 0, 0.37))));
          for (const f of [st.goku, st.dende, st.satan, st.vegeta, st.kai]) faceTo(f, st.kid.pos);
          b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.25, SL.Toon.tex.glow);
          b.sfx('teleport', st.goku, {});
          pt(ctx, 'group', base.clone().add(new V3(0.4, 1, 0.4)));
        },
        cam: { from: { at: 'group', off: [-3, -0.4, 5.6] }, look: { at: 'group', off: [0, 3.2, -2] }, fov: 54 },
        say: { who: 'kibitoshin', line: 'Everyone, hold on to me — NOW!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // he throws it down, and the Kai takes them away
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.o0 = st.burstOrb ? st.burstOrb.group.position.clone() : st.kid.pos.clone();
          ctx.o1 = ground(ctx, st.kid.pos.clone().add(new V3(0, 0, 4)));
        },
        pose: [{ who: 'kid', pose: 'kb_mouth', face: 'grin', speed: 10 }],
        cam: { from: { at: 'group', off: [-8, -0.6, 12] }, look: { at: 'group', off: [0, 6, -10] }, fov: 56 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (st.burstOrb) {
            st.burstOrb.group.position.copy(ctx.o0).lerp(ctx.o1, U.easeInCubic(Math.min(1, t / 1.6)));
            st.burstOrb.pulse();
          }
          if (t > 0.9 && !ctx.gone) {
            ctx.gone = true;
            b.vfx.flash(ctx.cast.group.pos, 3, 0xffffff, 0.3, SL.Toon.tex.glow);
            b.sfx('teleport', null, { vol: 1.2 });
            for (const k of ['goku', 'vegeta', 'kai', 'dende', 'satan']) st[k].setHidden(true);
          }
          b.camera.addTrauma(0.05 + t * 0.05);
        },
        sfx: { name: 'rumble', vol: 1.2, dur: 2 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (ctx.b.stage.def.id !== 'rocky_canyon') ctx.b.changeStage('rocky_canyon');
      for (const k of ['goku', 'vegeta', 'kai', 'dende', 'satan']) st[k].setHidden(true);
      ctx.m.flags.fetched = true;
    },
  };

  /* ============================================================================ THE EARTH */
  S.kb_boom = {
    id: 'kb_boom',
    cast,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      // the Earth, from far away, a pink spark on it
      {
        call: (ctx) => {
          const st = story(ctx);
          st.earth = K().earthView(ctx.b);
          st.earth.show();
          pt(ctx, 'earth', st.earth.centre);
        },
        cam: { from: { at: 'earth', off: [0, 260, 1150] }, to: { at: 'earth', off: [0, 240, 1080] }, look: { at: 'earth', off: [0, 60, 0] }, fov: 36 },
        tick: (ctx) => story(ctx).earth.shake(),
        sfx: { name: 'rumble', vol: 0.8, pitch: 0.5, dur: 2 },
        hold: 1.6,
      },
      // and then there is no Earth
      {
        call: (ctx) => {
          ctx.b.sfx('explosionHuge', null, { vol: 1.4, pitch: 0.5 });
          SL.ScreenFX.flash(0.3, '#ffd0ea');
        },
        cam: { from: { at: 'earth', off: [0, 240, 1080] }, to: { at: 'earth', off: [0, 300, 1700] }, look: { at: 'earth' }, fov: 40 },
        tick: (ctx, t) => story(ctx).earth.burst(Math.min(1, t / 2.8)),
        hold: 3.2,
      },
      // the dark; something pink pulling itself back together out of nothing, and laughing
      {
        call: (ctx) => pt(ctx, 'speck', story(ctx).earth.centre.clone().add(new V3(0, 40, 900))),
        cam: { from: { at: 'speck', off: [0, 0, 26] }, look: { at: 'speck' }, fov: 40 },
        tick: (ctx, t) => {
          const p = ctx.cast.speck.pos;
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.streamInward(p, 6 - Math.min(5, t * 2), 0xff8ac8, 3, 0.3, 0.5);
          if (t > 1.2 && ctx.b.frame % 5 === 0) ctx.b.vfx.flash(p, 1 + t, 0xff9ad0, 0.2, SL.Toon.tex.glow);
        },
        say: { who: 'kid_buu', line: 'Kyahahahahahaha!', duration: 2.6 },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.earth) {
        st.earth.dispose();
        st.earth = null;
      }
      if (st.burstOrb) {
        st.burstOrb.dispose();
        st.burstOrb = null;
      }
      ctx.m.flags.earthDestroyed = true;
      // the world state the next missions read (the Dragon Balls of Namek put it back)
      if (SL.Save && SL.Save.data && SL.Save.data.flags) SL.Save.data.flags.earthDestroyed = true;
    },
  };

  /* ============================================================================ THE SACRED WORLD */
  S.sw_arrive = {
    id: 'sw_arrive',
    cast,
    music: { song: 'aftermath', level: 1 },
    clearMood: false,
    events: [
      {
        call: (ctx) => pt(ctx, 'here', story(ctx).goku.pos),
        pose: [
          { who: 'satan', pose: 'idle', face: 'hurt' },
          { who: 'dende', pose: 'idle', face: 'hurt' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'hurt' },
        ],
        cam: { from: { at: 'here', off: [6, 2.4, 9] }, to: { at: 'here', off: [5, 2, 7.5] }, look: { at: 'here', off: [0, 1, -2] }, fov: 44 },
        say: { who: 'mr_satan', line: 'The Earth... it\'s really gone?', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { from: { at: 'elder', local: [0.4, 0.3, 1.6] }, look: { at: 'elder:head', off: [0, 0.06, 0] }, fov: 36 },
        say: { who: 'elder_kai', line: 'Gone. And everyone who was on it.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.35, 0.4, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.08, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'Bulma... Trunks...', duration: 2.4, style: 'quiet' },
        hold: 2.8,
      },
      // a purple flash in the sky: he followed them
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, k = st.kid;
          k.setHidden(false);
          K().hover(b, k, st.goku.pos.clone().add(new V3(0, 0, -11)), 3);
          faceTo(k, st.goku.pos);
          b.vfx.flash(k.chest(), 3, 0xb070ff, 0.35, SL.Toon.tex.glow);
          b.vfx.ring(k.chest(), 5, 0xc890ff, 0.5);
          b.sfx('teleport', k, { pitch: 0.7, vol: 1.2 });
        },
        pose: [{ who: 'kid', pose: 'kb_idle', face: 'grin' }],
        cam: { from: { at: 'here', off: [-2, 0.4, 3] }, look: { at: 'kid', off: [0, 0.3, 0] }, fov: 46 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'kid', pose: 'kb_scream', face: 'shout', speed: 10 }],
        call: (ctx) => {
          const k = story(ctx).kid;
          ctx.b.sfx('roar', k, { pitch: 1.6, vol: 1.3 });
          ctx.b.vfx.ring(k.chest(), 9, 0xff8ac8, 0.6);
        },
        cam: { from: { at: 'kid', local: [0.3, 0.6, 1.3] }, look: { at: 'kid:head', off: [0, 0.06, 0] }, fov: 38 },
        tick: (ctx) => ctx.b.camera.addTrauma(0.06),
        say: { who: 'kid_buu', line: 'HYAAAAAAH!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'He followed us. Good. There\'s nothing left here to protect — I can go all out.', duration: 3.8 },
        hold: 4,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.35, 0.4, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.08, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'Kakarot—', duration: 1, style: 'quiet' },
        hold: 1.1,
      },
      {
        cam: { from: { at: 'goku', local: [-0.5, 0.35, 1.7] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Let me have the first round, Vegeta.', duration: 2.4 },
        hold: 2.6,
      },
      // straight to the third level: a burst, the mane
      {
        call: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          K().toForm(g, 'ssj3');
          b.vfx.ring(g.chest(), 6, 0xffd23a, 0.5);
          b.vfx.flash(g.chest(), 2, 0xffe25a, 0.25, SL.Toon.tex.glow);
          b.sfx('transformBurst', g, { vol: 1.1 });
        },
        pose: [{ who: 'goku', pose: 'g2_stance', face: 'angry', speed: 6, aura: 0.8 }],
        cam: { from: { at: 'goku', local: [1.2, 0.2, 3] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 44 },
        say: { who: 'goku', line: 'HRRAAAAAAH!', duration: 1.4, style: 'shout' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      K().toForm(st.goku, 'ssj3');
      st.kid.setHidden(false);
      ctx.m.flags.swArrived = true;
    },
  };

  /* ============================================================================ THE ASK */
  S.sw_ask = {
    id: 'sw_ask',
    cast,
    music: { song: 'farewell', level: 2 },
    clearMood: false,
    events: [
      // still in the gold, but the gold is guttering: down on one knee, the aura coming and going
      {
        call: (ctx) => {
          const st = story(ctx);
          K().toForm(st.goku, 'ssj3');
          ctx.m.space(st.goku, 'ground', { face: st.kid.pos });
          ctx.m.space(st.vegeta, 'ground', { face: st.goku.pos });
        },
        pose: [{ who: 'goku', pose: 'sw_kneelUp', face: 'hurt', speed: 4, aura: 0.3 }],
        cam: { from: { at: 'goku', local: [0.8, -0.2, 2] }, look: { at: 'goku:head', off: [0, 0.04, 0] }, fov: 38 },
        tick: (ctx, t) => {
          const g = story(ctx).goku;
          if (g.aura) g.aura.target = 0.12 + Math.abs(Math.sin(t * 7)) * 0.5;
        },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [0.35, 0.4, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.08, 0] }, fov: 34 },
        say: { who: 'vegeta', line: '(Kakarot... what\'s wrong with you?! Finish him off!)', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku', local: [0.5, -0.1, 1.5] }, look: { at: 'goku:head', off: [0, 0.04, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Vegeta... this form... it\'s different now that I\'m alive! I can\'t build up enough power!', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock', speed: 6 }],
        cam: { from: { at: 'vegeta', local: [-0.35, 0.35, 1.4] }, look: { at: 'vegeta:head', off: [0, 0.06, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'What are you saying?!', duration: 1.6, style: 'shout' },
        hold: 1.7,
      },
      {
        cam: { from: { at: 'goku', local: [-0.6, -0.2, 1.7] }, to: { at: 'goku', local: [-0.45, -0.15, 1.3] }, look: { at: 'goku:head', off: [0, 0.04, 0] }, fov: 36 },
        say: { who: 'goku', line: 'I need... one full minute! If I can gather my Ki for sixty seconds without moving, I can power up to 100% and completely atomize every single cell of him!', duration: 5.4 },
        hold: 5.6,
      },
      {
        pose: [{ who: 'kid', pose: 'kb_chestBeat', face: 'grin', speed: 6 }],
        cam: { from: { at: 'kid', local: [0.3, 0.6, 1.5] }, look: { at: 'kid:head', off: [0, 0.06, 0] }, fov: 38 },
        say: { who: 'kid_buu', line: 'Hehehehehe!', duration: 1.6 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [0.35, 0.4, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.08, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'One minute, huh? That shouldn\'t be a problem.', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { from: { at: 'vegeta', local: [-0.4, 0.3, 1.4] }, look: { at: 'vegeta:head', off: [0, 0.06, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'I\'ll buy you your minute... just make sure you finish that monster!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      // Super Saiyan 2
      {
        call: (ctx) => {
          const v = story(ctx).vegeta, b = ctx.b;
          K().toForm(v, 'ssj2');
          b.vfx.ring(v.chest(), 5, 0xffd23a, 0.45);
          for (let i = 0; i < 3; i++) b.vfx.bolt(v.chest().add(new V3(Math.sin(i * 2) * 0.6, i * 0.3 - 0.3, Math.cos(i * 2) * 0.6)), 1.1, 0xbfe4ff);
          b.sfx('ssjRise', v, { vol: 1 });
        },
        pose: [{ who: 'vegeta', pose: 'powerUp', face: 'shout', speed: 10, aura: 0.8 }],
        cam: { from: { at: 'vegeta', local: [1.2, 0.2, 3] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 44 },
        hold: 1.6,
      },
      // SHOT 1: ground level behind his white boots, walking past Kakarot toward the monster
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, k = st.kid;
          faceTo(v, k.pos);
          const dir = k.pos.clone().sub(v.pos).setY(0).normalize();
          pt(ctx, 'walkTo', ground(ctx, v.pos.clone().addScaledVector(dir, 4.5)));
        },
        pose: [{ who: 'vegeta', pose: 'run', face: 'angry', speed: 0.45, aura: 0.5 }],
        cam: { from: { at: 'vegeta', local: [0.35, -1.05, -1.5] }, look: { at: 'vegeta', local: [0, -0.3, 3] }, fov: 50, follow: true },
        move: { who: 'vegeta', at: 'walkTo', seconds: 2.6, ease: 'linear', face: 'kid' },
      },
      // SHOT 2: the taunt — beating his chest, slapping his belly, aping the stance
      {
        pose: [
          { who: 'vegeta', pose: 'guard', face: 'angry', speed: 6, aura: 0.5 },
          { who: 'kid', pose: 'kb_chestBeat', face: 'grin', speed: 10 },
        ],
        cam: { from: { at: 'vegeta', local: [0.5, 0.25, -1.2] }, look: { at: 'kid', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'kid_buu', line: 'Kyahahahaha!', duration: 1.6 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      K().toForm(st.goku, 'ssj3');
      K().toForm(st.vegeta, 'ssj2');
      ctx.m.flags.minuteAsked = true;
    },
  };

  /* ============================================================================ VEGETA'S MINUTE: DOWN */
  // the minute goes the way the monster wants it to: the throat, the gut, the slam, the laugh
  S.sw_overwhelm = {
    id: 'sw_overwhelm',
    cast,
    music: { song: 'overwhelm', level: 2 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, k = st.kid, b = ctx.b;
          const dir = v.pos.clone().sub(k.pos).setY(0);
          if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
          dir.normalize();
          b.vfx.afterimage(k.pos, k.height, 0xffb8d8);
          ctx.m.space(v, 'ground', {});
          ctx.m.space(k, 'ground', { pos: v.pos.clone().addScaledVector(dir, -0.8), face: v.pos });
          faceTo(v, k.pos);
          // off his feet by the throat
          ctx.m.space(v, 'air', { height: 0.45, pose: 'hitHeavy', expr: 'hurt' });
          b.sfx('vanish', k, { pitch: 1.2 });
          pt(ctx, 'pair', v.pos.clone().lerp(k.pos, 0.5));
        },
        pose: [{ who: 'kid', pose: 'grab', face: 'grin', speed: 16 }],
        cam: { from: { at: 'pair', off: [2.4, -0.1, 1.8] }, look: { at: 'pair', off: [0, 0.5, 0] }, fov: 42 },
        say: { who: 'kid_buu', line: 'Hehehehe!', duration: 1.2 },
        hold: 1.1,
      },
      // the gut, again and again
      {
        cam: { from: { at: 'pair', off: [-1.7, 0.2, 2.2] }, look: { at: 'vegeta', off: [0, 0.1, 0] }, fov: 38 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          const n = Math.floor(t * 9);
          if (n === ctx.lastPunch) return;
          ctx.lastPunch = n;
          st.kid.setState('scripted', { pose: n % 2 ? 'punchR' : 'punchL', expression: 'grin', speed: 30 });
          st.vegeta.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 30 });
          b.vfx.flash(st.vegeta.chest(), 0.9, 0xffffff, 0.12, SL.Toon.tex.glow);
          b.sfx('punchLight', st.vegeta, { vol: 0.9, pitch: 0.9 + (n % 3) * 0.08 });
          b.camera.addTrauma(0.08);
        },
        hold: 1.5,
      },
      // the slam: down through the crystal ground
      {
        pose: [{ who: 'kid', pose: 'hammer', face: 'wicked', speed: 24 }],
        space: { who: 'vegeta', mode: 'groundImpact', radius: 2.6, depth: 0.9, seconds: 0.22, endPose: 'knockdownFace', expr: 'ko' },
        damage: { who: 'vegeta', level: 2, burst: true },
        cam: { from: { at: 'pair', off: [3.2, 1.6, 2.6] }, look: { at: 'pair', off: [0, -0.2, 0] }, fov: 46 },
        hold: 0.8,
      },
      // and he floats over the hole, slapping his knees
      {
        space: { who: 'kid', mode: 'air', at: 'vegeta', off: [1.1, 0, 0.8], height: 0.45, pose: 'kb_kneeSlap', face: 'vegeta' },
        pose: [{ who: 'kid', pose: 'kb_kneeSlap', face: 'grin', speed: 6 }],
        cam: { from: { at: 'kid', local: [0.6, 0.1, 2.4] }, look: { at: 'kid', off: [0, 0.1, 0] }, fov: 42 },
        say: { who: 'kid_buu', line: 'Kikikikikiki!', duration: 1.8 },
        hold: 1.9,
      },
    ],
    end(ctx) {
      const st = story(ctx), v = st.vegeta, k = st.kid;
      ctx.m.space(v, 'ground', { pose: 'knockdownFace', expr: 'ko' });
      if (v.setDamage && (v.damageLevel || 0) < 2) v.setDamage(2);
      if (k.storySpace !== 'air') ctx.m.space(k, 'air', { pos: v.pos.clone().add(new V3(1.1, 0, 0.8)), height: 0.45, pose: 'kb_kneeSlap', expr: 'grin', face: v.pos });
      ctx.m.flags.vegetaDown = true;
    },
  };

  /* ============================================================================ "THE SAIYAN PRINCE, VEGETA!" */
  // the laugh over him; his fingers in the rock; up, one stage at a time; and the answer
  S.sw_prince = {
    id: 'sw_prince',
    cast,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, k = st.kid;
          // Buu a few steps off, hovering and laughing, so the rise has room
          const dir = k.pos.clone().sub(v.pos).setY(0);
          if (dir.lengthSq() < 0.01) dir.set(1, 0, 0);
          dir.normalize();
          ctx.m.space(k, 'air', { pos: v.pos.clone().addScaledVector(dir, 2.8), height: 0.4, pose: 'kb_kneeSlap', expr: 'grin', face: v.pos });
          faceTo(v, k.pos);
          const hand = v.handPos('R');
          const out = hand.clone().sub(v.pos).setY(0);
          if (out.lengthSq() < 0.01) out.set(1, 0, 0);
          out.normalize();
          pt(ctx, 'hand', hand);
          pt(ctx, 'handCam', hand.clone().addScaledVector(out, 0.6).add(new V3(0, 0.3, 0)));
        },
        pose: [{ who: 'vegeta', pose: 'vk_dig', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'handCam' }, look: { at: 'hand' }, fov: 34 },
        crack: { at: 'hand', radius: 0.9, depth: 0.06 },
        sfx: { name: 'rockBreak', vol: 0.7, pitch: 1.3 },
        say: { who: 'kid_buu', line: 'Kikikikiki!', duration: 1.4 },
        tick: (ctx) => ctx.b.camera.addTrauma(0.02),
        hold: 1.6,
      },
      // up onto his hands
      {
        pose: [{ who: 'vegeta', pose: 'getup', face: 'hurt', speed: 2.2 }],
        cam: { from: { at: 'vegeta', local: [1.7, -0.6, 0.6] }, look: { at: 'vegeta', off: [0, -0.4, 0] }, fov: 40 },
        hold: 1.3,
      },
      // one knee, the head coming up
      {
        pose: [{ who: 'vegeta', pose: 'sw_kneelUp', face: 'hurt', speed: 2.5 }],
        cam: { from: { at: 'vegeta', local: [0.5, -0.45, 1.6] }, look: { at: 'vegeta:head' }, fov: 38 },
        hold: 1.2,
      },
      // on his feet, the legs shaking; the monster still laughing beyond him
      {
        pose: [{ who: 'vegeta', pose: 'vk_battered', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'vegeta', local: [0.7, -0.4, -1.7] }, look: { at: 'kid' }, fov: 44 },
        hold: 1.4,
      },
      // the back of the hand across the jaw; the laughing stops
      {
        pose: [
          { who: 'vegeta', pose: 'vk_wipe', face: 'angry', speed: 4 },
          { who: 'kid', pose: 'kb_idle', face: 'calm', speed: 4 },
        ],
        cam: { from: { at: 'vegeta', local: [0.5, 0.25, 1.3] }, look: { at: 'vegeta:head' }, fov: 36 },
        hold: 1.3,
      },
      // one eye nearly shut, the other burning
      {
        pose: [{ who: 'vegeta', pose: 'vk_battered', face: 'angry', speed: 2 }],
        cam: { from: { at: 'vegeta', local: [0.12, 0.62, 0.62] }, look: { at: 'vegeta:head', off: [0, 0.03, 0] }, fov: 24 },
        say: { who: 'vegeta', line: 'What are you laughing at?!', duration: 1.9, style: 'shout' },
        hold: 2,
      },
      {
        cam: { from: { at: 'vegeta', local: [-0.6, -0.4, 1.9] }, to: { at: 'vegeta', local: [-0.5, -0.35, 1.5] }, look: { at: 'vegeta:head' }, fov: 38 },
        say: { who: 'vegeta', line: 'Did you think I\'ll crumble down and fall?!', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      // the monster, for once, not laughing
      {
        pose: [{ who: 'kid', pose: 'kb_idle', face: 'angry', speed: 4 }],
        cam: { from: { at: 'kid', local: [0.3, 0.5, 1.4] }, look: { at: 'kid:head', off: [0, 0.04, 0] }, fov: 36 },
        hold: 0.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'vk_point', face: 'angry', speed: 8 }],
        cam: { from: { at: 'kid', local: [-0.6, 0.6, -1.4] }, look: { at: 'vegeta', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'You\'re nothing but a trickster!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
      // the gold coming back, low and close
      {
        call: (ctx) => ctx.b.sfx('ssjRise', story(ctx).vegeta, { vol: 0.9 }),
        pose: [{ who: 'vegeta', pose: 'vk_glare', face: 'angry', speed: 4, aura: 0.6 }],
        cam: { from: { at: 'vegeta', local: [0.4, -0.5, 1.8] }, to: { at: 'vegeta', local: [0.3, -0.45, 1.25] }, look: { at: 'vegeta:head' }, fov: 38 },
        say: { who: 'vegeta', line: 'I am a warrior!', duration: 1.8, style: 'shout' },
        hold: 1.9,
      },
      // THE SAIYAN PRINCE: the gold coming off him, the ground breaking, the lens in the dirt looking up
      {
        call: (ctx) => {
          const v = story(ctx).vegeta, b = ctx.b;
          b.vfx.ring(v.chest(), 7, 0xffd23a, 0.55);
          b.vfx.flash(v.chest(), 2.2, 0xffe25a, 0.3, SL.Toon.tex.glow);
          for (let i = 0; i < 4; i++) b.vfx.bolt(v.chest().add(new V3(Math.sin(i * 1.7) * 0.7, i * 0.25 - 0.3, Math.cos(i * 1.7) * 0.7)), 1.3, 0xbfe4ff);
          b.sfx('transformBurst', v, { vol: 1 });
        },
        pose: [{ who: 'vegeta', pose: 'vk_declare', face: 'shout', speed: 10, aura: 1 }],
        music: { song: 'pride', level: 3 },
        crack: { at: 'vegeta', radius: 3.4, depth: 0.15 },
        vfx: { kind: 'rocks', at: 'vegeta', count: 10, radius: 3 },
        cam: { from: { at: 'vegeta', local: [1.1, -1.0, 2.6] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 50 },
        shake: { at: 'vegeta', amount: 0.55 },
        say: { who: 'vegeta', line: 'The Saiyan Prince... VEGETA!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx), v = st.vegeta, k = st.kid;
      K().toForm(v, 'ssj2');
      ctx.m.space(v, 'ground', { pose: 'vk_glare', expr: 'angry', face: k.pos });
      if (k.storySpace !== 'air') ctx.m.space(k, 'air', { pos: v.pos.clone().add(new V3(2.8, 0, 0)), height: 0.4, face: v.pos });
      k.setState('scripted', { pose: 'kb_idle', expression: 'angry' });
      ctx.m.flags.princeDeclared = true;
    },
  };

  /* ============================================================================ NUMBER ONE */
  S.sw_numberone = {
    id: 'sw_numberone',
    cast,
    music: { song: 'pride', level: 2 },
    clearMood: false,
    events: [
      // 00:00 the countdown: in the dirt, holding his arm, shouting at the sky
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, k = st.kid, g = st.goku;
          ctx.m.space(v, 'ground', { pose: 'lieBack', expr: 'hurt' });
          k.setHidden(false);
          ctx.m.space(k, 'ground', { pos: v.pos.clone().add(new V3(2.2, 0, 1.2)), face: v.pos });
          pt(ctx, 'down', v.pos);
          const h = v.headPos();
          const away = h.clone().sub(g.pos).setY(0).normalize();
          const side = new V3(-away.z, 0, away.x);
          pt(ctx, 'low', ground(ctx, h.clone().addScaledVector(away, 2.1).addScaledVector(side, 0.9)).add(new V3(0, 0.5, 0)));
          pt(ctx, 'toGoku', h.clone().lerp(g.chest(), 0.2));
        },
        pose: [{ who: 'kid', pose: 'kb_laugh', face: 'grin', speed: 6 }],
        cam: { from: { at: 'low' }, look: { at: 'toGoku' }, fov: 46 },
        say: { who: 'vegeta', line: 'Kakarot... your minute is up! Do it now!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      // 00:03 the strain: screaming, forcing it to compress
      {
        pose: [{ who: 'goku', pose: 'powerUp', face: 'shout', speed: 12, aura: 1 }],
        cam: { from: { at: 'goku', local: [0.35, 0.3, 1.4] }, look: { at: 'goku:head', off: [0, 0.04, 0] }, fov: 34 },
        tick: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          b.camera.addTrauma(0.03);
          if (b.frame % 4 === 0) b.vfx.streamInward(g.chest(), 3, 0xffe25a, 2, 0.14, 0.35);
        },
        say: { who: 'goku', line: 'HRRRAAAAAAGH!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      // 00:06 the collapse: the gold flickers, and goes in on itself
      {
        cam: { from: { at: 'goku', local: [1.3, 0.2, 3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 44 },
        sfx: { name: 'wind', who: 'goku', vol: 0.9, pitch: 0.5 },
        tick: (ctx, t) => {
          const g = story(ctx).goku;
          if (g.aura) g.aura.target = Math.abs(Math.sin(t * 22)) * Math.max(0, 1 - t / 1.2);
        },
        hold: 1.3,
      },
      // 00:09 base: the hair gone, the brows back, down on his hands and knees
      {
        call: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          K().toForm(g, 'base');
          b.vfx.flash(g.chest(), 1.4, 0xffe25a, 0.2, SL.Toon.tex.glow);
          b.vfx.streamInward(g.chest(), 2.4, 0xffe25a, 10, 0.16, 0.4);
          b.sfx('heartbeat', g, { vol: 0.9 });
        },
        pose: [{ who: 'goku', pose: 'getup', face: 'hurt', speed: 6 }],
        cam: { from: { at: 'goku', local: [1.5, -0.3, 1.6] }, look: { at: 'goku', off: [0, -0.3, 0] }, fov: 42 },
        hold: 1.5,
      },
      // 00:12 the despair: his own shaking hands
      {
        pose: [{ who: 'goku', pose: 'lookHands', face: 'shock', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.25, 0.35, 1.0] }, look: { at: 'goku', off: [0, -0.1, 0] }, fov: 36 },
        say: { who: 'goku', line: 'I... I can\'t... my Ki... it\'s dropping! Super Saiyan 3 drained everything I had left...', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      // the monster comes back to Vegeta: up, and down on him
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.kid, 'ground', { pos: st.vegeta.pos.clone().add(new V3(0.6, 0, 0.4)), face: st.vegeta.pos });
        },
        pose: [{ who: 'kid', pose: 'kb_stompUp', face: 'wicked', speed: 10 }],
        cam: { from: { at: 'down', off: [2, 0.5, 2.6] }, look: { at: 'down', off: [0, 0.6, 0] }, fov: 44 },
        hold: 0.6,
      },
      {
        call: (ctx) => {
          const b = ctx.b, p = ctx.cast.down.pos;
          b.sfx('boneCrack', null, { at: p, vol: 1.1 });
          b.vfx.dust(p, 0.7, 4); // small: the next shot is from the ground beside him
          b.cameraTraumaAt(p, 0.5);
        },
        pose: [{ who: 'kid', pose: 'kb_stompDown', face: 'wicked', speed: 30 }],
        cam: { from: { at: 'down', off: [2, 0.5, 2.6] }, look: { at: 'down', off: [0, 0.4, 0] }, fov: 44 },
        hold: 1,
      },
      // the realisation, said to nobody: from the ground beside his head, the child above him
      {
        call: (ctx) => {
          const st = story(ctx), h = st.vegeta.headPos();
          const away = h.clone().sub(st.kid.pos).setY(0).normalize();
          const side = new V3(-away.z, 0, away.x);
          pt(ctx, 'low2', ground(ctx, h.clone().addScaledVector(away, 2.1).addScaledVector(side, 0.9)).add(new V3(0, 0.5, 0)));
          pt(ctx, 'over', h.clone().lerp(st.kid.chest(), 0.55));
        },
        cam: { from: { at: 'low2' }, look: { at: 'over' }, fov: 46 },
        say: { who: 'vegeta', line: '(Kakarot... you truly are remarkable. I fought because I enjoyed the destruction... to break my opponents and pride myself on my power. But you\'re different.)', duration: 6.4, style: 'quiet' },
        hold: 6.6,
      },
      // what he is looking at: Kakarot on his hands and knees, far off
      {
        call: (ctx) => {
          const st = story(ctx), h = st.vegeta.headPos();
          pt(ctx, 'eyes', h.clone().add(new V3(0, 0.25, 0)));
        },
        cam: { from: { at: 'eyes' }, look: { at: 'goku', off: [0, -0.2, 0] }, fov: 30 },
        say: { who: 'vegeta', line: '(You never fought to kill your enemy... you fought to test your own limits and push past them. You never cared about victory, only about self-improvement. That\'s why you spared my life... that\'s why you never gave up.)', duration: 7.2, style: 'quiet' },
        hold: 7.4,
      },
      {
        call: (ctx) => {
          // above his chest, looking along the body at his face (from past the crown it would be upside down)
          const v = story(ctx).vegeta, h = v.headPos(), c = v.chest();
          const up = h.clone().sub(c).setY(0).normalize();
          pt(ctx, 'face', h.clone().add(new V3(0, 0.08, 0)));
          pt(ctx, 'above', h.clone().addScaledVector(up, -0.28).add(new V3(0, 0.85, 0)));
        },
        cam: { from: { at: 'above' }, look: { at: 'face' }, fov: 34 },
        say: { who: 'vegeta', line: '(I couldn\'t see it before... but now I understand. You are the best... You are Number One!)', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.fin) {
        st.fin.dispose();
        st.fin = null;
      }
      scale(st.kid, 1);
      st.vegeta.setState('scripted', { pose: 'lieBack', expression: 'ko' });
      ctx.m.flags.numberOne = true;
    },
  };

  S.sw_plan = {
    id: 'sw_plan',
    cast,
    music: { song: 'journey', level: 1 },
    clearMood: false,
    events: [
      {
        call: (ctx) => pt(ctx, 'kidAt', story(ctx).kid.pos),
        pose: [{ who: 'kid', pose: 'kb_kneeSlap', face: 'grin', speed: 6 }],
        cam: { from: { at: 'kidAt', off: [3.4, 1.4, 4.2] }, look: { at: 'kidAt', off: [0, 0.6, 0] }, fov: 44 },
        say: { who: 'kid_buu', line: 'Kikikikiki!', duration: 1.6 },
        hold: 2,
      },
      {
        call: (ctx) => story(ctx).vegeta.setState('scripted', { pose: 'sw_kneelUp', expression: 'hurt' }),
        cam: { from: { at: 'vegeta', local: [0.4, -0.35, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.04, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'Kakarot... the Spirit Bomb. Use the Spirit Bomb.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'The Spirit Bomb? But the Earth is gone — there\'s no one left to give me their energy!', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.4, -0.35, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.04, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'Then bring them back. The Dragon Balls of Namek — wish back the Earth, and everyone on it.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        cam: { from: { at: 'dende', local: [0.4, 0.3, 1.5] }, look: { at: 'dende:head', off: [0, 0.06, 0] }, fov: 36 },
        say: { who: 'dende', line: 'The Dragon Balls of New Namek! I can call Porunga!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku', local: [-0.4, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.08, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Vegeta... you\'re a genius!', duration: 2.2 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'vegeta', local: [-0.4, -0.35, 1.5] }, look: { at: 'vegeta:head', off: [0, 0.04, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'Hmph. Just do it.', duration: 1.8, style: 'quiet' },
        hold: 2.2,
      },
      // the Kai takes Dende to New Namek, to the dragon
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          for (const k of ['kai', 'dende', 'elder']) if (st[k]) b.vfx.flash(st[k].chest(), 1.6, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('teleport', st.kai, {});
        },
        cam: { from: { at: 'kai', local: [0.6, 0.35, 2] }, look: { at: 'kai:head', off: [0, 0.05, 0] }, fov: 38 },
        say: { who: 'kibitoshin', line: 'Hold on to me, Dende — to New Namek!', duration: 2.2, style: 'shout' },
        tick: (ctx, t) => {
          if (t > 1.4 && !ctx.gone) {
            ctx.gone = true;
            for (const k of ['kai', 'dende', 'elder']) if (story(ctx)[k]) story(ctx)[k].setHidden(true);
          }
        },
        hold: 2.2,
      },
    ],
    end(ctx) {
      for (const k of ['kai', 'dende', 'elder']) if (story(ctx)[k]) story(ctx)[k].setHidden(true);
      ctx.m.flags.spiritBombPlan = true;
    },
  };
})();
