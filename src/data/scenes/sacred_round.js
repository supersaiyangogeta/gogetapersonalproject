/*
 * SCENES — Chapter 14, "Number One": Goku's Super Saiyan 3 round against Kid Buu, the four beats of the
 * owner's sheet that were not built (2026-10-03).
 *
 *   sw_round      THE NAP: Goku at full power, the gold roaring — and Kid Buu drops onto his side in the dirt,
 *                 curls up and snores, a pink snot bubble swelling and shrinking; Goku's eye twitches, the
 *                 aura flares. THE RIDGE KICK: gone in a flash of gold, a boot into the sleeping cheek, and
 *                 Buu through a granite ridge and out the other side. THE RUBBER GRAPPLE: in flight his arms
 *                 stretch the whole distance back, wrap Goku up in mid-air — and he reels himself in, head
 *                 first, into Goku's jaw. (then the round is played)
 *   sw_pointblank THE POINT-BLANK KAMEHAMEHA: "KAME... HAME..." at the hip; Instant Transmission to inches from
 *                 his stomach (the player's cue); "...HAAA!" — Buu blown into pink ribbons that melt into
 *                 steam and pull back together, cackling.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const PZ = SL.data.poses;
  const TK = () => SL.data.trunksKit;
  const VK = () => SL.data.vegitoKit;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const gy = (b, x, z) => SL.Staging.groundY(b, x, z);
  const at = (b, x, z, lift = 0) => new V3(x, gy(b, x, z) + lift, z);
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));
  let RNG = null;
  const rnd = () => (RNG || (RNG = SL.util.mulberry32(3)))();

  // where it happens on the Sacred World: the nap at the middle, the ridge off to the west
  const R = (SL.data.sacredRound = { NAP: new V3(0, 0, -5), RIDGE: new V3(-30, 0, -5), OUT: new V3(-50, 0, -5) });
  /** The granite ridge he is kicked through (a real obstacle; built once per stage). */
  R.ridge = function (b) {
    const st = b.stage;
    if (st.__sacredRidge && st.__sacredRidge.alive) return st.__sacredRidge;
    if (!st.addSpire) return null;
    const o = st.addSpire(R.RIDGE.x, R.RIDGE.z, 5.5, 20);
    st.__sacredRidge = o;
    return o;
  };

  /* ---------------------------------------------------------------- poses */
  // fake-asleep: on his side in the dirt, curled up, hands under his cheek
  PZ.kb_nap = (t) => {
    const s = Math.sin(t * 1.7);
    return {
      root: { y: -0.6, rz: 84 }, spine: [26, 0, 0], chest: [18 + s * 3, 0, 0], neck: [10, 0, 0], head: [16, 0, -6],
      shoulderL: [-110, 0, 6], elbowL: [-130, 0, 0], shoulderR: [-96, 0, -8], elbowR: [-120, 0, 0],
      thighL: [-104, 0, 6], kneeL: [122, 0, 0], thighR: [-98, 0, -6], kneeR: [126, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // both arms flung forward, stretching
  PZ.kb_stretch = (t) => ({
    root: { y: 0, rx: 18 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [-14, 0, 0],
    shoulderL: [-92, 0, 6], elbowL: [-2, 0, 0], shoulderR: [-92, 0, -6], elbowR: [-2, 0, 0],
    thighL: [-20, 0, 8], kneeL: [40, 0, 0], thighR: [10, 0, -8], kneeR: [30, 0, 0],
    hands: ['open', 'open'],
  });
  // head first, like a slingshot stone
  PZ.kb_headbutt = (t) => ({
    root: { y: 0, rx: 80 }, spine: [6, 0, 0], chest: [4, 0, 0], neck: [20, 0, 0], head: [30, 0, 0],
    shoulderL: [30, 0, 30], elbowL: [-10, 0, 0], shoulderR: [30, 0, -30], elbowR: [-10, 0, 0],
    thighL: [10, 0, 6], kneeL: [10, 0, 0], thighR: [10, 0, -6], kneeR: [10, 0, 0],
    hands: ['fist', 'fist'],
  });
  // Goku annoyed: the stance, fists clenched, the shoulders up
  PZ.g3_twitch = (t) => {
    const q = Math.sin(t * 40) * 1.5;
    return {
      root: { y: -0.1 }, spine: [4, 0, 0], chest: [2 + q, 0, 0], head: [-2, q, 0],
      shoulderL: [-10, 0, 26], elbowL: [-60, 0, 0], shoulderR: [-10, 0, -26], elbowR: [-60, 0, 0],
      thighL: [-20, 0, 14], kneeL: [26, 0, 0], thighR: [10, 0, -14], kneeR: [20, 0, 0],
      hands: ['fist', 'fist'],
    };
  };

  /* ---------------------------------------------------------------- the snot bubble, the rubber arms */
  function bubble(f, on) {
    const m = f.model;
    if (!m || !m.headCenter) return null;
    if (!m.__bubble) {
      const R0 = m.b.headR;
      // a pale, glassy bubble (pink on pink skin did not read), with a white glint on it
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(R0 * 0.42, 16, 12), new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.6, depthWrite: false }));
      const glint = new THREE.Mesh(new THREE.SphereGeometry(R0 * 0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(-R0 * 0.16, R0 * 0.18, R0 * 0.3);
      mesh.add(glint);
      mesh.position.set(R0 * 0.08, -R0 * 0.12, R0 * 1.3);
      mesh.renderOrder = 4;
      m.headCenter.add(mesh);
      m.__bubble = mesh;
    }
    m.__bubble.visible = !!on;
    return m.__bubble;
  }
  /** Two arms of pink rubber from his shoulders to wherever they end, waving: set(from, to, k) every tick. */
  function rubberArms(b) {
    const mat = SL.Toon.makeMat(0xf28ac4, {});
    const geo = new THREE.CylinderGeometry(0.09, 0.09, 1, 8);
    const g = new THREE.Group();
    const arms = [0, 1].map(() => {
      const segs = [];
      for (let i = 0; i < 12; i++) {
        const s = new THREE.Mesh(geo, mat);
        g.add(s);
        segs.push(s);
      }
      return segs;
    });
    const coils = [];
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 6, 18), mat);
      c.visible = false;
      g.add(c);
      coils.push(c);
    }
    b.scene.add(g);
    const up = new V3(0, 1, 0);
    return {
      set(froms, to, k, t, wrapAt) {
        arms.forEach((segs, a) => {
          const A = froms[a], B = to.clone().add(new V3(a ? 0.25 : -0.25, a ? -0.15 : 0.12, 0));
          const end = A.clone().lerp(B, k);
          const dir = end.clone().sub(A);
          const side = new V3(-dir.z, 0, dir.x).normalize();
          let prev = A.clone();
          for (let i = 1; i <= segs.length; i++) {
            const u = i / segs.length;
            const p = A.clone().lerp(end, u).addScaledVector(side, Math.sin(u * Math.PI * 3 + t * 8 + a) * 0.6 * (1 - u) * k).add(new V3(0, Math.sin(u * Math.PI * 2 + t * 6) * 0.4 * (1 - u), 0));
            const s = segs[i - 1];
            const d = p.clone().sub(prev);
            s.position.copy(prev).addScaledVector(d, 0.5);
            s.scale.set(1, Math.max(0.01, d.length()), 1);
            s.quaternion.setFromUnitVectors(up, d.normalize());
            prev = p;
          }
        });
        coils.forEach((c, i) => {
          c.visible = !!wrapAt;
          if (wrapAt) {
            c.position.copy(wrapAt).add(new V3(0, (i - 1) * 0.22, 0));
            c.rotation.set(Math.PI / 2 + (i - 1) * 0.15, 0, 0);
          }
        });
      },
      dispose() {
        if (g.parent) b.scene.remove(g);
        geo.dispose();
        mat.dispose();
        for (const c of coils) c.geometry.dispose();
      },
    };
  }
  const shoulders = (f) => {
    f.model.root.updateMatrixWorld(true);
    return [f.model.joints.shoulderL, f.model.joints.shoulderR].map((j) => j.getWorldPosition(new V3()).sub(f.object.position).add(f.pos));
  };

  /* ================================================================================ THE NAP, THE KICK, THE GRAPPLE */
  S.sw_round = {
    id: 'sw_round',
    cast,
    music: { song: 'kid_buu', level: 2 },
    clearMood: false,
    events: [
      // the third level at full power, the gold roaring
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          R.ridge(b);
          ctx.m.space(st.goku, 'ground', { pos: new V3(0, 0, 5), face: R.NAP });
          st.kid.setHidden(false);
          ctx.m.space(st.kid, 'ground', { pos: R.NAP.clone(), face: st.goku.pos });
          b.sfx('kiUp', st.goku, { vol: 1, pitch: 0.7 });
        },
        pose: [
          { who: 'goku', pose: 'g3_stanceUp', face: 'angry', speed: 6, aura: 1 },
          { who: 'kid', pose: 'kb_idle', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        hold: 2.2,
      },
      // ...and the little one lies down in the dirt, curls up, and goes to sleep
      {
        call: (ctx) => bubble(story(ctx).kid, true),
        pose: [{ who: 'kid', pose: 'kb_nap', face: 'ko', speed: 4 }],
        cam: { from: { at: 'kid:face', local: [0.6, 0.5, 2.6] }, look: { at: 'kid:face', off: [0, -0.15, 0] }, fov: 46, raw: true },
        tick: (ctx, t) => {
          const bb = story(ctx).kid.model.__bubble;
          if (bb) bb.scale.setScalar(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.4)));
        },
        hold: 2,
      },
      {
        cam: { from: { at: 'kid:face', local: [0.12, 0.1, 0.85] }, look: { at: 'kid:face' }, fov: 40, raw: true },
        say: { who: 'kid_buu', line: 'Zzzzz... pwwwohhhh... Zzzzz...', duration: 3 },
        tick: (ctx, t) => {
          const bb = story(ctx).kid.model.__bubble;
          if (bb) bb.scale.setScalar(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.4)));
        },
        hold: 3.2,
      },
      // the eye twitching; the gold flaring out
      {
        call: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          b.vfx.ring(g.chest(), 4, 0xffd84a, 0.4);
          b.sfx('ssjRise', g, { vol: 0.6, pitch: 1.2 });
        },
        pose: [{ who: 'goku', pose: 'g3_twitch', face: 'angry', speed: 8, aura: 1 }],
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        tick: (ctx) => ctx.b.camera.addTrauma(0.02),
        hold: 1.8,
      },
      // THE RIDGE KICK: gone in a flash of gold — a boot into the sleeping cheek
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku, k = st.kid;
          VK().vanishTo(b, g, k.pos.clone().add(new V3(1.3, 0, 0.2)), { face: k.pos });
          g.grounded = true;
          bubble(k, false);
          b.sfx('punchHeavy', k, { vol: 1.5, pitch: 0.6 });
          b.vfx.flash(k.headPos(), 2.2, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.cameraTraumaAt(k.pos, 0.7);
          ctx.k0 = k.pos.clone().add(new V3(0, 0.6, 0));
          ctx.k1 = R.OUT.clone().setY(gy(b, R.OUT.x, R.OUT.z) + 4);
          ctx.broke = false;
        },
        pose: [
          { who: 'goku', pose: 'kickR', face: 'angry', speed: 22, aura: 1 },
          { who: 'kid', pose: 'tumble', face: 'shock', speed: 10 },
        ],
        slow: { scale: 0.4, seconds: 0.4 },
        cam: { subject: 'goku', with: 'kid', focus: 'full' },
        hold: 0.6,
      },
      // ...and Buu straight through the granite ridge and out the other side
      {
        call: (ctx) => pt(ctx, 'ridgeLens', R.RIDGE.clone().add(new V3(9, 5, 15))),
        cam: { from: { at: 'ridgeLens' }, look: { at: 'kid' }, fov: 54, raw: true },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b, k = st.kid;
          const u = Math.min(1, t / 1.1);
          const p = ctx.k0.clone().lerp(ctx.k1, u);
          k.setPosition(p);
          k.prevPos.copy(p);
          k.grounded = false;
          if (b.frame % 2 === 0) b.vfx.trail(k.chest(), 0xffffff, 0.4, 0.3);
          if (!ctx.broke && p.x < R.RIDGE.x + 5) {
            ctx.broke = true;
            const o = b.stage.__sacredRidge;
            if (o && o.alive) b.stage.destroyPillar(o);
            for (let i = 0; i < 4; i++) b.vfx.dust(R.RIDGE.clone().add(new V3(0, 4 + i * 4, 0)), 6, 12, 0x9a9a86);
            b.cameraTraumaAt(R.RIDGE, 0.8);
            b.sfx('explosionHuge', null, { at: R.RIDGE, vol: 1.2, pitch: 0.8 });
          }
        },
        hold: 1.8,
      },
      // in flight, the arms come back: stretched the whole way, round Goku, pinning him in the air
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku;
          ctx.m.space(g, 'air', { pos: new V3(-14, 0, -5), height: 5, face: st.kid.pos, pose: 'flyIdle' });
          ctx.m.space(st.kid, 'air', { pos: ctx.k1.clone(), height: 4, face: g.pos });
          if (!ctx.arms) ctx.arms = rubberArms(b);
          ctx.grabT = 0;
          pt(ctx, 'stretchLens', g.pos.clone().lerp(st.kid.pos, 0.5).add(new V3(0, 7, 26)));
          b.sfx('stretch', st.kid, { vol: 1 });
        },
        pose: [
          { who: 'kid', pose: 'kb_stretch', face: 'wicked', speed: 6 },
          { who: 'goku', pose: 'flyIdle', face: 'shock', speed: 4 },
        ],
        cam: { from: { at: 'stretchLens' }, look: { at: 'goku', off: [-12, 0, 0] }, fov: 56, raw: true },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 1);
          ctx.arms.set(shoulders(st.kid), st.goku.chest(), k, t, k >= 1 ? st.goku.chest() : null);
          if (k >= 1 && !ctx.wrapped) {
            ctx.wrapped = true;
            st.goku.setState('scripted', { pose: 'wrapped', expression: 'grit' });
          }
        },
        hold: 1.8,
      },
      {
        pose: [{ who: 'goku', pose: 'wrapped', face: 'grit', speed: 6 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        tick: (ctx, t) => ctx.arms.set(shoulders(story(ctx).kid), story(ctx).goku.chest(), 1, t, story(ctx).goku.chest()),
        say: { who: 'goku', line: 'Gnnh — let go of me!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      // the reel-in: he yanks himself along his own arms, head first, into Goku's jaw
      {
        call: (ctx) => {
          ctx.r0 = story(ctx).kid.pos.clone();
          ctx.hit = false;
        },
        pose: [{ who: 'kid', pose: 'kb_headbutt', face: 'wicked', speed: 10 }],
        cam: { subject: 'goku', with: 'kid', focus: 'full' },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b, k = st.kid, g = st.goku;
          const u = Math.min(1, (t / 0.7) * (t / 0.7));
          const goal = g.headPos().addScaledVector(g.pos.clone().sub(k.pos).setY(0).normalize(), -0.6).add(new V3(0, -0.4, 0));
          const p = ctx.r0.clone().lerp(goal, u);
          k.setPosition(p);
          k.prevPos.copy(p);
          faceTo(k, g.pos);
          ctx.arms.set(shoulders(k), g.chest(), 1, t, g.chest());
          if (u >= 1 && !ctx.hit) {
            ctx.hit = true;
            ctx.arms.dispose();
            ctx.arms = null;
            ctx.arms = { set() {}, dispose() {} };
            b.sfx('punchHeavy', g, { vol: 1.6, pitch: 0.5 });
            b.vfx.flash(g.headPos(), 2.4, 0xffffff, 0.2, SL.Toon.tex.glow);
            b.vfx.ring(g.headPos(), 2.6, 0xffd0ec, 0.35);
            b.cameraTraumaAt(g.pos, 0.9);
            b.slowmo(0.35, 0.5);
            ctx.m.space(g, 'airImpact', { dir: g.pos.clone().sub(k.pos).setY(0.4).normalize(), distance: 6, seconds: 0.4 });
            g.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
          }
        },
        hold: 1.4,
      },
      {
        pose: [{ who: 'kid', pose: 'kb_laugh', face: 'grin', speed: 4 }],
        cam: { subject: 'kid', focus: 'full', angle: 'three' },
        say: { who: 'kid_buu', line: 'KYAHAHAHA!', duration: 1.6 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (ctx.arms) ctx.arms.dispose();
      bubble(st.kid, false);
      const o = b.stage.__sacredRidge;
      if (o && o.alive) b.stage.destroyPillar(o, { quiet: true });
      ctx.m.flags.napKick = true;
    },
  };

  /* ================================================================================ THE POINT-BLANK KAMEHAMEHA */
  const KAME_PB = { id: 'kamePointBlank', name: 'Super Kamehameha', type: 'beam', damage: [0, 0], radius: [1.4, 1.4], speed: 120, range: 40, sustain: 70, color: 0x6ac8ff, core: 0xffffff, style: { rings: 3, ringColor: 0xbfe8ff, ringSpeed: 2 } };
  S.sw_pointblank = {
    id: 'sw_pointblank',
    cast,
    clearMood: false,
    events: [
      // KAME... HAME...: the hands cupped at his hip, a blue sun between them
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku, k = st.kid;
          SL.data.buuKit.toForm(g, 'ssj3');
          g.setHidden(false);
          k.setHidden(false);
          if (g.storySpace !== 'ground') ctx.m.space(g, 'ground', { pos: g.pos.clone(), face: k.pos });
          if (k.pos.distanceTo(g.pos) < 6) ctx.m.space(k, 'ground', { pos: g.pos.clone().addScaledVector(g.forward.clone().setY(0).normalize(), 9), face: g.pos });
          faceTo(g, k.pos);
          faceTo(k, g.pos);
          k.setState('scripted', { pose: 'kb_laugh', expression: 'grin' });
          ctx.orb = TK().orb(b, g.chest(), 0.08, 0x6ac8ff, 0xffffff);
        },
        music: { song: 'climax', level: 2 },
        pose: [{ who: 'goku', pose: 'g_kameCharge', face: 'shout', speed: 8, aura: 1 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'KAME... HAME...', duration: 2.2, style: 'shout' },
        tick: (ctx, t) => {
          const g = story(ctx).goku;
          g.model.root.updateMatrixWorld(true);
          const h = g.model.joints.handR.getWorldPosition(new V3()).sub(g.object.position).add(g.pos);
          ctx.orb.group.position.copy(h);
          ctx.orb.set(0.08 + Math.min(1, t / 2) * 0.22);
          ctx.orb.pulse();
        },
        hold: 2.2,
      },
      // THE PLAYER: Instant Transmission, to inches from his stomach
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        tick: (ctx) => ctx.orb && ctx.orb.pulse(),
        cue: { key: 's2', label: 'Instant Transmission', auto: 4, slow: 0.4 },
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku, k = st.kid;
          const d = g.pos.clone().sub(k.pos).setY(0).normalize();
          VK().vanishTo(b, g, k.pos.clone().addScaledVector(d, 0.9), { face: k.pos });
          b.sfx('teleport', g, {});
          if (ctx.orb) {
            ctx.orb.dispose();
            ctx.orb = null;
          }
          k.intangible = true;
          SL.Cinema.beam(ctx, g, k, KAME_PB);
          b.sfx('beamFire', g, { vol: 1.4, pitch: 0.9 });
          b.cameraTraumaAt(k.pos, 0.9);
          pt(ctx, 'pbLens', g.pos.clone().lerp(k.pos, 0.5).add(new V3(-d.z * 4, 1.2, d.x * 4)));
        },
        pose: [
          { who: 'goku', pose: 'g_kameFire', face: 'shout', speed: 18, aura: 1 },
          { who: 'kid', pose: 'kb_scream', face: 'shock', speed: 10 },
        ],
        cam: { from: { at: 'pbLens' }, look: { at: 'kid' }, fov: 50, raw: true },
        say: { who: 'goku', line: '...HAAAAA!', duration: 1.6, style: 'shout' },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xbfe8ff),
        hold: 1.1,
      },
      // blown into a thousand pink ribbons
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, k = st.kid;
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
          ctx.boom = k.chest();
          ctx.kidScale = k.model.root.scale.x;
          k.setHidden(true);
          b.sfx('explosionBig', null, { at: ctx.boom, vol: 1.3 });
          b.vfx.flash(ctx.boom, 3, 0xffd0ec, 0.3, SL.Toon.tex.glow);
          for (let i = 0; i < 40; i++) {
            const v = new V3(rnd() - 0.5, rnd() * 0.9 - 0.2, rnd() - 0.5).normalize().multiplyScalar(6 + rnd() * 14);
            b.vfx.rock(ctx.boom, v, 0.12 + rnd() * 0.22, 0xf28ac4);
          }
          pt(ctx, 'boom', ctx.boom);
        },
        cam: { from: { at: 'boom', off: [6, 2.5, 8] }, look: { at: 'boom' }, fov: 50, raw: true },
        tick: (ctx) => {
          const b = ctx.b;
          if (b.frame % 3 === 0) b.vfx.dust(ctx.boom.clone().add(new V3(rnd() * 6 - 3, rnd() * 2 - 1, rnd() * 6 - 3)), 1.4, 3, 0xffb8e0);
        },
        hold: 1.8,
      },
      // the ribbons melt into pink steam — and it all pulls back together, cackling
      {
        cam: { from: { at: 'boom', off: [4.5, 1.2, 6] }, look: { at: 'boom', off: [0, -0.3, 0] }, fov: 46, raw: true },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b, k = st.kid;
          if (b.frame % 2 === 0) b.vfx.streamInward(ctx.boom, 4 - Math.min(3, t * 2), 0xffb8e0, 4, 0.3, 0.5);
          if (t > 1.1 && k.hidden) {
            k.setHidden(false);
            k.setState('scripted', { pose: 'kb_laugh', expression: 'grin' });
            b.sfx('regrow', k, { vol: 1, pitch: 1.2 });
          }
          if (!k.hidden) k.model.root.scale.setScalar(ctx.kidScale * Math.min(1, 0.15 + (t - 1.1) * 1.4));
        },
        say: { who: 'kid_buu', line: 'KYAHAHAHAHAHA!', duration: 2.2 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'g3_stanceUp', face: 'grit', speed: 4 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: '...You\'ve gotta be kidding me.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const st = story(ctx), k = st.kid;
      if (ctx.orb) ctx.orb.dispose();
      if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
      k.setHidden(false);
      if (ctx.kidScale) k.model.root.scale.setScalar(ctx.kidScale);
      k.intangible = false;
      k.setState('scripted', { pose: 'kb_laugh', expression: 'grin' });
      ctx.m.flags.pointBlank = true;
    },
  };
})();
