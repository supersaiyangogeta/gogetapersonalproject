/*
 * SCENES — Chapter 14: the Super Spirit Bomb (Buu Saga priority 12, the owner's beat sheets, 2026-10-02).
 *
 *   sb_wishes     New Namek: Porunga; the Earth put back; everyone Buu killed brought back; the Lookout
 *   sb_call       Goku high over the crater, arms in a V: "raise your hands"; the Z Fighters give it;
 *                 a star over his head; Satan City refuses ("another trick of Babidi's"); half a sun
 *   sb_beatdown   Goku's fury in close-up, a crack of purple thunder; Kid Buu's bug-eyed look up and the
 *                 belly-slapping laugh; the beating Vegeta takes (sweep, axe drop, the chest used as a
 *                 trampoline, the kick); the blast wound up over his head; Mr. Satan steps out; Kid Buu
 *                 runs at him — and spits Good Buu out onto the dirt
 *   sb_rally      "Listen to me, you fools! It's Hercule! Give me your power to defeat Buu!"; the hands go
 *                 up all over Satan City; the half-formed star becomes a sun that blots out the sky
 *   sb_launch     the throw (arms out and down, wrists together); the catch, the trenches; Buu's grin
 *                 as it starts back up; Goku's arms shaking
 *   sb_restore    Vegeta through King Kai to Dende; New Namek; "Restore Goku's full stamina and power!";
 *                 Porunga's eyes; the green light; the breath; the smirk; Super Saiyan, mid-air
 *   sb_rescue     he cannot drop it — Vegeta is lying right beside Buu; Mr. Satan sprints into the crater
 *                 (a ground-level tracking shot), slings him over his shoulder, runs him out across the rocks
 *                 yelling "DO IT NOW!"; "Way to go, Satan! You really ARE the savior of the world!"
 *   sb_farewell   palms flat on the bomb; "You're remarkable..." / "...one-on-one." / "I'll be waiting for
 *                 you..."; THE SALUTE — the right hand off the sun, two fingers to his forehead, a warm smile:
 *                 "Goodbye, Buu!"; the snap of the wrist back onto it, elbows locked
 *   sb_goodbye    the slam; into the bedrock; inside the light, the silent scream, dust; the white, the blue
 *                 haze, the pillar into space; embers; the gold going, a breath of steam; the bird's-eye
 *                 view; the slow glide down through the smoke (a low lens); the boots on the grass; the
 *                 reunion; the grin; the thumbs-up — and Vegeta's thumb coming up from the dirt
 *
 * Positions (the Sacred World): C the crater; SAT_ROCK the jagged outcrop Mr. Satan steps out from, shelters
 * behind with Good Buu, and carries Vegeta back to. Everything that needs it is rebuilt when the stage
 * comes back from an insert.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.buuKit;
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

  /* ---------------------------------------------------------------- places, set pieces, effects */
  const SB = (SL.data.spiritBomb = {
    C: new V3(0, 0, -4),
    SAT_ROCK: new V3(-13, 0, 11),
    VEG: new V3(2.6, 0, -1.8), // where Vegeta lies at the end of his beating: right beside the crater's middle
    FULL: 16, // the bomb's radius at full size (the people under it are a metre and a half tall)
    HALF: 7,
    /** The Sacred World as this story left it: the scorched crater and the jagged outcrop beside it. */
    field(b) {
      const st = b.stage;
      if (!st.hasGround || st.__sbField) return;
      st.__sbField = true;
      const C = SB.C, Q = SB.SAT_ROCK;
      if (st.crater) {
        st.crater(C, 9, 2.4, null);
        st.crater(C.clone().add(new V3(5, 0, 3)), 4, 0.8, null);
      }
      // the jagged rock formation (Mr. Satan hides behind it, and ends the story against it with Vegeta)
      if (st.addSpire) for (const [dx, dz, r, h] of [[0, 0, 1.8, 4.5], [-2.4, 1.6, 1.4, 6], [-0.8, 3.2, 1.2, 3.4], [-3.6, -1, 1, 2.6]]) st.addSpire(Q.x + dx, Q.z + dz, r, h);
    },
    /** THE SUPER SPIRIT BOMB: a blue sun. set(radius), pulse(), inside(on) — the lens inside the light. */
    bomb(b, pos) {
      const add = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), add(0x4ab8ff, 0.5));
      const mid = new THREE.Mesh(new THREE.SphereGeometry(0.86, 32, 22), add(0x9fe6ff, 0.42));
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), new THREE.MeshBasicMaterial({ color: 0xeefcff, fog: false }));
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.97, 32, 22), new THREE.MeshBasicMaterial({ color: 0x2a8cff, side: THREE.BackSide, transparent: true, opacity: 0.8, fog: false, depthWrite: false }));
      inner.visible = false;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x6ad8ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.75, depthWrite: false, fog: false }));
      glow.scale.setScalar(3.2);
      g.add(shell, mid, core, inner, glow);
      g.position.copy(pos);
      b.scene.add(g);
      let n = 0, r = 1;
      g.scale.setScalar(r);
      const api = {
        group: g,
        pos: g.position,
        get radius() {
          return r;
        },
        set(v) {
          r = Math.max(0.05, v);
          g.scale.setScalar(r);
        },
        pulse() {
          n++;
          shell.material.opacity = 0.42 + Math.sin(n * 0.3) * 0.1;
          mid.rotation.y += 0.012;
          core.rotation.y -= 0.02;
          if (n % 6 === 0 && b.vfx) {
            const d = new V3(Math.sin(n * 1.7), Math.cos(n * 0.9), Math.sin(n * 2.3)).normalize();
            b.vfx.sparks(g.position.clone().addScaledVector(d, r * 0.98), 0xdff6ff, 3, 2, 0.08);
          }
        },
        inside(on) {
          inner.visible = !!on;
          core.visible = !on;
          mid.visible = !on;
          glow.visible = !on;
        },
        /** The bottom of the sphere (where Kid Buu's palms are). */
        bottom() {
          return g.position.clone().add(new V3(0, -r, 0));
        },
        top() {
          return g.position.clone().add(new V3(0, r, 0));
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          for (const o of [shell, mid, core, inner]) {
            o.geometry.dispose();
            o.material.dispose();
          }
          glow.material.dispose();
        },
      };
      return api;
    },
    /** PORUNGA: the dragon of New Namek, coiled up out of the ground into the dark sky. eyes(k) lights them. */
    porunga(b, base, facing) {
      const T = SL.Toon;
      const g = new THREE.Group();
      const green = T.mat(0x3c8a3a), dark = T.mat(0x2a5e2a), horn = T.mat(0xd8d0b0), belly = T.mat(0x8ab060);
      const H = 64;
      const pts = [new V3(0, 0, 0), new V3(9, 12, -4), new V3(-6, 26, 4), new V3(8, 40, -2), new V3(2, 52, 6), new V3(0, H - 6, 10)];
      const curve = new THREE.CatmullRomCurve3(pts);
      const body = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 3.4, 12, false), green);
      T.addOutline(body, 1.4);
      g.add(body);
      // the spines down his back
      for (let i = 1; i < 14; i++) {
        const p = curve.getPoint(i / 14);
        const s = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3, 6), dark);
        s.position.copy(p).add(new V3(0, 0, -3.4));
        s.rotation.x = -Math.PI / 2;
        g.add(s);
      }
      // the upper body and the arms
      const chest = new THREE.Mesh(new THREE.SphereGeometry(4.4, 18, 14), green);
      chest.position.copy(curve.getPoint(0.92)).add(new V3(0, -1, 2));
      chest.scale.set(1.3, 1, 0.9);
      T.addOutline(chest, 1.4);
      const plate = new THREE.Mesh(new THREE.SphereGeometry(4.1, 16, 12), belly);
      plate.position.copy(chest.position).add(new V3(0, -0.5, 1.4));
      plate.scale.set(1, 0.9, 0.6);
      g.add(chest, plate);
      for (const s of [1, -1]) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1, 12, 10), green);
        arm.position.copy(chest.position).add(new V3(s * 7, -3, 3));
        arm.rotation.z = s * 0.9;
        arm.rotation.x = -0.5;
        T.addOutline(arm, 1.2);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 8), green);
        hand.position.copy(arm.position).add(new V3(s * 5, -5, 4));
        for (let c = 0; c < 3; c++) {
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2, 5), horn);
          claw.position.copy(hand.position).add(new V3((c - 1) * 0.9, -1.4, 1.6));
          claw.rotation.x = 2.4;
          g.add(claw);
        }
        g.add(arm, hand);
      }
      // the head: a long snout, two horns, a beard of whiskers, the red eyes
      const head = new THREE.Group();
      head.position.copy(curve.getPoint(1)).add(new V3(0, 6, 6));
      head.scale.setScalar(1.35);
      const skull = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 12), green);
      skull.scale.set(1, 0.9, 1.3);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 6), green);
      snout.position.set(0, -0.8, 4.4);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1, 5.4), dark);
      jaw.position.set(0, -2.4, 4);
      head.add(skull, snout, jaw);
      for (const o of [skull, snout]) T.addOutline(o, 1.2);
      for (const s of [1, -1]) {
        const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 6, 8), horn);
        h1.position.set(s * 2.2, 3.4, -1.4);
        h1.rotation.set(-0.6, 0, -s * 0.5);
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.05, 7, 5), horn);
        w.position.set(s * 2.4, -1.8, 6);
        w.rotation.set(0.9, 0, s * 0.9);
        head.add(h1, w);
      }
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x5a0a0a, fog: false });
      const eyeGlows = [];
      for (const s of [1, -1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), eyeMat);
        e.position.set(s * 1.7, 0.8, 2.7);
        e.scale.set(1.3, 0.7, 0.6);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xff2020, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false, fog: false }));
        glow.position.copy(e.position);
        glow.scale.setScalar(4);
        eyeGlows.push(glow);
        head.add(e, glow);
      }
      g.add(head);
      g.position.copy(base);
      if (facing) g.rotation.y = Math.atan2(facing.x - base.x, facing.z - base.z);
      b.scene.add(g);
      return {
        group: g,
        head,
        headPos: () => head.getWorldPosition(new V3()),
        eyes(k) {
          eyeMat.color.setRGB(0.35 + 0.65 * k, 0.04, 0.04);
          for (const gl of eyeGlows) gl.material.opacity = k;
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
            if (o.isSprite) o.material.dispose();
          });
          eyeMat.dispose();
        },
      };
    },
    /** Light going up from a body into the sky (the Earth giving its energy): call every tick. */
    giveUp(b, f, color = 0x8ae0ff) {
      if (b.frame % 3) return;
      const c = f.chest().add(new V3(0, 0.6, 0));
      const top = c.clone().add(new V3(0, 6 + Math.random() * 6, 0));
      for (let i = 0; i < 4; i++) b.vfx.trail(c.clone().lerp(top, i / 4 + Math.random() * 0.1), color, 0.28, 0.4);
    },
  });

  /* ---------------------------------------------------------------- poses */
  const PZ = SL.data.poses;
  // the call: arms raised and spread in a V, open to the sky, eyes shut
  PZ.sb_v = (t) => {
    const s = Math.sin(t * 2) * 2;
    return {
      root: { y: 0.02 * s }, spine: [-4, 0, 0], chest: [-8, 0, 0], head: [-16, 0, 0],
      shoulderL: [-158, 0, 38 + s], elbowL: [-8, 0, 0], shoulderR: [-158, 0, -38 - s], elbowR: [-8, 0, 0],
      thighL: [-12, 0, 6], kneeL: [30, 0, 0], footL: [30, 0, 0], thighR: [-4, 0, -6], kneeR: [22, 0, 0], footR: [35, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the same V, straining: the head down, everything shaking
  PZ.sb_vStrain = (t) => {
    const q = Math.sin(t * 34) * 2.5;
    return {
      root: { y: 0 }, spine: [6, 0, 0], chest: [4 + q, 0, 0], head: [12, 0, 0],
      shoulderL: [-152 + q, 0, 40], elbowL: [-14, 0, 0], shoulderR: [-152 - q, 0, -40], elbowR: [-14, 0, 0],
      thighL: [-20, 0, 6], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [-8, 0, -6], kneeR: [30, 0, 0], footR: [35, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // hands up to the sky (the Z Fighters, the people of Earth)
  PZ.sb_handsUp = (t) => ({
    root: { y: -0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-22, 0, 0],
    shoulderL: [-172, 0, 12 + Math.sin(t * 3) * 2], elbowL: [-6, 0, 0], shoulderR: [-172, 0, -12 - Math.sin(t * 3) * 2], elbowR: [-6, 0, 0],
    thighL: [-6, 0, 10], kneeL: [10, 0, 0], thighR: [-6, 0, -10], kneeR: [10, 0, 0],
    hands: ['open', 'open'],
  });
  // THE THROW: both arms straight out and down at forty-five degrees, wrists together, fingers spread,
  // the body leaning into it in mid-air
  PZ.sb_throw = (t) => {
    const q = Math.sin(t * 30) * 1.5;
    return {
      root: { y: 0, rx: 22 }, spine: [10, 0, 0], chest: [8 + q, 0, 0], head: [-20, 0, 0],
      shoulderL: [-48 + q, 0, -9], elbowL: [-4, 0, 0], shoulderR: [-48 - q, 0, 9], elbowR: [-4, 0, 0],
      thighL: [14, 0, 6], kneeL: [44, 0, 0], footL: [30, 0, 0], thighR: [26, 0, -6], kneeR: [62, 0, 0], footR: [35, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the restoration: head snapped back, spine arched, hands pulled to the chest, a huge breath
  PZ.sb_restore = (t) => {
    const k = Math.min(1, t * 3);
    return {
      root: { y: 0, rx: -12 * k }, spine: [-16 * k, 0, 0], chest: [-22 * k, 0, 0], neck: [-10 * k, 0, 0], head: [-34 * k, 0, 0],
      shoulderL: [-58, 0, -28], elbowL: [-132, 0, 0], shoulderR: [-58, 0, 28], elbowR: [-132, 0, 0],
      thighL: [-6, 0, 6], kneeL: [26, 0, 0], footL: [30, 0, 0], thighR: [4, 0, -6], kneeR: [20, 0, 0], footR: [35, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // palms flat on the top of the bomb below him, elbows locked, all his weight going into it
  PZ.sb_push = (t) => {
    const q = Math.sin(t * 28) * 2;
    return {
      root: { y: 0, rx: 46 }, spine: [16, 0, 0], chest: [12 + q, 0, 0], head: [-26, 0, 0],
      shoulderL: [-58 + q, 0, 16], elbowL: [-4, 0, 0], shoulderR: [-58 - q, 0, -16], elbowR: [-4, 0, 0],
      thighL: [22, 0, 8], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [34, 0, -8], kneeR: [58, 0, 0], footR: [35, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // THE SALUTE: the left palm still on the sun, the right hand up, two fingers to his forehead
  PZ.sb_salute = (t) => ({
    root: { y: 0, rx: 30 }, spine: [10, 0, 0], chest: [4, 8, 0], head: [-20, -6, 6],
    shoulderL: [-56, 0, 16], elbowL: [-4, 0, 0], shoulderR: [-118, 0, -38], elbowR: [-136, 0, 0],
    thighL: [18, 0, 8], kneeL: [40, 0, 0], footL: [30, 0, 0], thighR: [28, 0, -8], kneeR: [56, 0, 0], footR: [35, 0, 0],
    hands: ['open', 'point'],
  });
  // after the gold: hanging in the air, the shoulders dropped, breathing out
  PZ.sb_exhale = (t) => {
    const s = Math.sin(t * 1.6);
    return {
      root: { y: 0.02 * s, rx: 6 }, spine: [10, 0, 0], chest: [6 + s * 2, 0, 0], head: [6, 0, 0],
      shoulderL: [-6, 0, 12], elbowL: [-24, 0, 0], shoulderR: [-6, 0, -12], elbowR: [-24, 0, 0],
      thighL: [-14, 0, 6], kneeL: [30, 0, 0], footL: [30, 0, 0], thighR: [-4, 0, -6], kneeR: [22, 0, 0], footR: [35, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // THE THUMBS-UP: the right arm straight out toward them
  PZ.sb_thumbsUp = (t) => ({
    root: { y: -0.02 }, spine: [0, -6, 0], chest: [-4, -12, 0], head: [-6, 10, 8],
    shoulderL: [-14, 0, 14], elbowL: [-26, 0, 0], shoulderR: [-88, 0, -6], elbowR: [-4, 0, 0],
    thighL: [-10, 0, 12], kneeL: [16, 0, 0], thighR: [4, 0, -12], kneeR: [10, 0, 0],
    hands: ['open', 'thumb'],
  });
  // Mr. Satan running with a body over his right shoulder: one arm round it, the other pumping
  PZ.sb_carry = (t) => {
    const s = Math.sin(t * 12);
    return {
      root: { y: -0.05 + Math.abs(s) * 0.03, rx: 12 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [-8, 0, 0],
      shoulderL: [-40 * s, 0, 14], elbowL: [-80, 0, 0], shoulderR: [-150, 0, -10], elbowR: [-90, 0, 0],
      thighL: [-40 * s, 0, 6], kneeL: [30 + Math.max(0, s) * 50, 0, 0], thighR: [40 * s, 0, -6], kneeR: [30 + Math.max(0, -s) * 50, 0, 0],
      hands: ['fist', 'open'],
    };
  };
  // Vegeta over a shoulder: folded at the waist, arms and head hanging
  PZ.sb_slung = {
    root: { y: 0, rx: 90 }, spine: [20, 0, 0], chest: [18, 0, 0], head: [40, 0, 0],
    shoulderL: [-170, 0, 6], elbowL: [-10, 0, 0], shoulderR: [-170, 0, -6], elbowR: [-10, 0, 0],
    thighL: [-120, 0, 4], kneeL: [40, 0, 0], thighR: [-120, 0, -4], kneeR: [40, 0, 0],
    hands: ['open', 'open'],
  };
  // Mr. Satan down on one knee, an arm out holding Vegeta up against the rock
  PZ.sb_holdUp = (t) => ({
    root: { y: -0.46, rx: 10 }, spine: [12, 0, 0], chest: [6, 0, 0], head: [-10, 0, 0],
    shoulderL: [-50, 0, 30], elbowL: [-60, 0, 0], shoulderR: [-60, 0, -40], elbowR: [-40, 0, 0],
    thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
    hands: ['open', 'open'],
  });
  // Vegeta propped against the rock, legs out in the dirt, the head back against the stone
  PZ.sb_againstRock = {
    root: { y: -0.6, rx: -26 }, spine: [-6, 0, 0], chest: [-4, 0, 0], head: [-6, 12, 6],
    shoulderL: [20, 0, 20], elbowL: [-20, 0, 0], shoulderR: [16, 0, -24], elbowR: [-30, 0, 0],
    thighL: [-70, 0, 14], kneeL: [20, 0, 0], thighR: [-64, 0, -18], kneeR: [36, 0, 0],
    hands: ['open', 'open'],
  };
  // ...and his right hand coming up off the dirt: the thumb
  PZ.sb_rockThumb = (t) => ({
    root: { y: -0.6, rx: -26 }, spine: [-6, 0, 0], chest: [-4, -6, 0], head: [-10, 10, 4],
    shoulderL: [20, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-70, 0, -18], elbowR: [-20, 0, 0],
    thighL: [-70, 0, 14], kneeL: [20, 0, 0], thighR: [-64, 0, -18], kneeR: [36, 0, 0],
    hands: ['open', 'thumb'],
  });
  // Kid Buu: head thrown back, mouth wide, slapping his stomach and his thighs
  PZ.kb_bellySlap = (t) => {
    const s = Math.sin(t * 15);
    return {
      root: { y: -0.06, rx: -10 }, spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-36 + s * 4, 0, 0],
      shoulderL: [-22 - Math.max(0, s) * 26, 0, 22], elbowL: [-60 - Math.max(0, s) * 40, 0, 0], shoulderR: [-22 - Math.max(0, -s) * 26, 0, -22], elbowR: [-60 - Math.max(0, -s) * 40, 0, 0],
      thighL: [-16, 0, 20], kneeL: [26, 0, 0], thighR: [-16, 0, -20], kneeR: [26, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the low spinning sweep: hands flat in the dirt, one leg out
  PZ.kb_sweep = {
    root: { y: -0.52, rx: 26 }, spine: [18, 0, 0], chest: [10, 0, 0], head: [-24, 0, 0],
    shoulderL: [-70, 0, 20], elbowL: [-8, 0, 0], shoulderR: [-70, 0, -20], elbowR: [-8, 0, 0],
    thighL: [-110, 0, 20], kneeL: [120, 0, 0], thighR: [-20, 0, -80], kneeR: [4, 0, 0],
    hands: ['open', 'open'],
  };
  // THE CATCH: arms straight up, palms against the underside of the sun, knees bent, shaking
  PZ.kb_catch = (t) => {
    const q = Math.sin(t * 36) * 2.5;
    return {
      root: { y: -0.16, rx: -6 }, spine: [-6, 0, 0], chest: [-10 + q, 0, 0], head: [-30, 0, 0],
      shoulderL: [-166 + q, 0, 22], elbowL: [-26, 0, 0], shoulderR: [-166 - q, 0, -22], elbowR: [-26, 0, 0],
      thighL: [-38, 0, 20], kneeL: [62, 0, 0], thighR: [-38, 0, -20], kneeR: [62, 0, 0],
      hands: ['open', 'open'],
    };
  };

  /* ---------------------------------------------------------------- helpers for the inserts */
  /** Everybody who belongs to the Sacred World, hidden while the story is somewhere else. */
  const FIELD_CAST = ['goku', 'vegeta', 'kid', 'fat', 'satan'];
  const EARTH_CAST = ['gohan', 'piccolo', 'goten', 'trunks', 'krillin', 'tien', 'yamcha'];
  const NAMEK_CAST = ['dende', 'kai', 'elder'];
  function only(ctx, names) {
    const st = story(ctx);
    for (const k of FIELD_CAST.concat(EARTH_CAST, NAMEK_CAST)) if (st[k]) st[k].setHidden(!names.includes(k));
    for (const c of st.civilians || []) c.setHidden(!names.includes('civilians'));
    if (st.bomb) st.bomb.group.visible = names.includes('field');
  }
  /** To New Namek: Dende and the Kais, and the dragon. */
  function toNamek(ctx) {
    const b = ctx.b, st = story(ctx);
    b.changeStage('namek');
    ctx.m.endShot();
    only(ctx, NAMEK_CAST);
    const D = SL.Staging.clearSpot(b, new V3(0, 0, 4), 4);
    const dragonAt = SL.Staging.clearSpot(b, D.clone().add(new V3(-14, 0, -48)), 6);
    for (const [f, dx, dz] of [[st.dende, 0, 0], [st.kai, 2, 1.4], [st.elder, -1.8, 1.6]]) ctx.m.space(f, 'ground', { pos: D.clone().add(new V3(dx, 0, dz)), face: dragonAt });
    if (!st.porunga) st.porunga = SB.porunga(b, at(b, dragonAt.x, dragonAt.z), D);
    b.stage.setMood(0.6, 0x060814, 0.6);
    pt(ctx, 'dendeAt', st.dende.pos);
    pt(ctx, 'dragon', st.porunga.headPos());
  }
  /** Back to the Sacred World (the field pieces come back with the stage: SB.field on stageChanged). */
  function toField(ctx) {
    const b = ctx.b, st = story(ctx);
    if (st.porunga) {
      st.porunga.dispose();
      st.porunga = null;
    }
    b.changeStage('kai_world');
    ctx.m.endShot();
    only(ctx, FIELD_CAST.concat(['field']));
    if (st.fat && !st.fatOut) st.fat.setHidden(true);
    if (st.satan && !st.satanOut) st.satan.setHidden(true);
    if (st.kid && st.kidGone) st.kid.setHidden(true);
  }
  /** Earth: the Lookout, the Z Fighters. */
  function toLookout(ctx) {
    const b = ctx.b, st = story(ctx);
    b.changeStage('lookout');
    ctx.m.endShot();
    only(ctx, EARTH_CAST);
    const spots = { gohan: [-0.8, 6], piccolo: [1.4, 6.6], goten: [-2.4, 7.4], trunks: [-1.4, 8], krillin: [2.8, 7.6], tien: [4.2, 6.8], yamcha: [3.4, 8.8] };
    for (const k of EARTH_CAST) if (st[k]) ctx.m.space(st[k], 'ground', { pos: new V3(spots[k][0], 0, spots[k][1]), face: new V3(0, 0, 20) });
    pt(ctx, 'lookout', at(b, 0.8, 7.2));
  }
  /** Earth: a street in Satan City, its people. */
  function toCity(ctx) {
    const b = ctx.b, st = story(ctx);
    b.changeStage('satan_city');
    ctx.m.endShot();
    only(ctx, ['civilians']);
    if (!st.civilians) {
      st.civilians = [];
      for (let i = 0; i < 9; i++) {
        const c = b.spawn({ charId: i === 4 ? 'chichi' : 'civilian', team: 0, pos: at(b, -7 + i * 1.8, 20 + (i % 3) * 1.6) });
        K().watcher(c, 'idle', 'calm');
        st.civilians.push(c);
      }
    }
    st.civilians.forEach((c, i) => {
      c.setHidden(false);
      ctx.m.space(c, 'ground', { pos: new V3(-7 + i * 1.8, 0, 20 + (i % 3) * 1.6), face: new V3(0, 0, 0) });
    });
    pt(ctx, 'street', at(b, 0, 21));
  }

  /* ============================================================================ THE WISHES */
  S.sb_wishes = {
    id: 'sb_wishes',
    cast,
    music: { song: 'shenron', level: 1 },
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          toNamek(ctx);
          ctx.b.sfx('rumble', null, { vol: 1, pitch: 0.5 });
          story(ctx).porunga.eyes(0.2);
        },
        pose: [{ who: 'dende', pose: 'sb_handsUp', face: 'shout', speed: 4 }],
        cam: { from: { at: 'dende', local: [0.9, 0.5, -2.2] }, look: { at: 'dragon', off: [0, -10, 0] }, fov: 56, subject: 'dende', focus: 'full' },
        say: { who: 'dende', line: 'Arise, Porunga! Grant my wishes!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        call: (ctx) => story(ctx).porunga.eyes(1),
        cam: { from: { at: 'dragon', off: [10, -14, 34] }, look: { at: 'dragon' }, fov: 40 },
        say: { who: 'porunga', line: 'I am Porunga. You may make three wishes. Speak.', duration: 3.2 },
        tick: (ctx, t) => story(ctx).porunga.eyes(0.6 + Math.sin(t * 6) * 0.4),
        hold: 3.3,
      },
      {
        call: (ctx) => story(ctx).porunga.eyes(0.4),
        pose: [{ who: 'dende', pose: 'idle', face: 'shout', speed: 4 }],
        cam: { subject: 'dende', focus: 'upper', angle: 'three' },
        say: { who: 'dende', line: 'Put the Earth back — exactly as it was before Buu destroyed it!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      // the Earth, back where it was
      {
        call: (ctx) => {
          const st = story(ctx);
          st.earth = K().earthView(ctx.b);
          st.earth.show();
          pt(ctx, 'earth', st.earth.centre);
          ctx.b.sfx('gong', null, { vol: 0.8, pitch: 0.7 });
        },
        cam: { from: { at: 'earth', off: [0, 200, 1000] }, to: { at: 'earth', off: [0, 230, 1150] }, look: { at: 'earth', off: [0, 40, 0] }, fov: 36 },
        hold: 2.8,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.earth) {
            st.earth.dispose();
            st.earth = null;
          }
          toNamek(ctx);
        },
        cam: { subject: 'dende', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'dende', line: 'And bring back everyone Buu killed — everyone except the evil ones!', duration: 3.4, style: 'shout' },
        hold: 3.5,
      },
      {
        call: (ctx) => story(ctx).porunga.eyes(1),
        cam: { from: { at: 'dragon', off: [-12, -16, 30] }, look: { at: 'dragon' }, fov: 40 },
        say: { who: 'porunga', line: 'It is done.', duration: 1.8 },
        hold: 2,
      },
      // the Lookout: they open their eyes
      {
        call: (ctx) => {
          toLookout(ctx);
          ctx.b.vfx.flash(ctx.cast.lookout.pos.clone().add(new V3(0, 1, 0)), 4, 0xfff4c0, 0.3, SL.Toon.tex.glow);
        },
        pose: [
          { who: 'gohan', pose: 'lookHands', face: 'shock', speed: 3 },
          { who: 'goten', pose: 'getup', face: 'shock', speed: 3 },
          { who: 'trunks', pose: 'getup', face: 'shock', speed: 3 },
          { who: 'piccolo', pose: 'idle', face: 'calm', speed: 3 },
          { who: 'krillin', pose: 'lookHands', face: 'shock', speed: 3 },
        ],
        cam: { from: { at: 'lookout', off: [3, 1.6, 6] }, look: { at: 'lookout', off: [0, 1, 0] }, fov: 46 },
        say: { who: 'gohan', line: 'We\'re... alive? The Earth — it\'s back!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.earth) {
        st.earth.dispose();
        st.earth = null;
      }
      ctx.m.flags.earthRestored = true;
      if (SL.Save && SL.Save.data && SL.Save.data.flags) SL.Save.data.flags.earthDestroyed = false;
    },
  };

  /* ============================================================================ THE CALL */
  S.sb_call = {
    id: 'sb_call',
    cast,
    music: { song: 'journey', level: 2 },
    clearMood: false,
    events: [
      // high over the crater, arms open to the sky
      {
        call: (ctx) => {
          toField(ctx);
          const st = story(ctx), b = ctx.b;
          ctx.m.space(st.goku, 'air', { pos: SB.C.clone().add(new V3(0, 0, 10)), height: 34, pose: 'sb_v', expr: 'calm', face: SB.C });
          pt(ctx, 'rim', at(b, SB.C.x + 7, SB.C.z + 12, 0.6));
        },
        cam: { subject: 'goku', focus: 'full', angle: 'low', dist: 4.6, height: -1.3 },
        say: { who: 'goku', line: 'People of Earth! It\'s me — Goku! Lend me your energy! Just raise your hands to the sky!', duration: 4.4, style: 'shout' },
        hold: 4.5,
      },
      // the Lookout: they know that voice
      {
        call: (ctx) => toLookout(ctx),
        pose: [
          { who: 'gohan', pose: 'sb_handsUp', face: 'shout', speed: 4 },
          { who: 'piccolo', pose: 'sb_handsUp', face: 'calm', speed: 4 },
          { who: 'goten', pose: 'sb_handsUp', face: 'shout', speed: 4 },
          { who: 'trunks', pose: 'sb_handsUp', face: 'shout', speed: 4 },
          { who: 'krillin', pose: 'sb_handsUp', face: 'shout', speed: 4 },
          { who: 'tien', pose: 'sb_handsUp', face: 'calm', speed: 4 },
          { who: 'yamcha', pose: 'sb_handsUp', face: 'shout', speed: 4 },
        ],
        cam: { from: { at: 'lookout', off: [2, 0.4, 7] }, look: { at: 'lookout', off: [0, 2.6, 0] }, fov: 50 },
        say: { who: 'gohan', line: 'That\'s Dad! Everyone — raise your hands!', duration: 2.6, style: 'shout' },
        tick: (ctx) => {
          const st = story(ctx);
          for (const k of EARTH_CAST) if (st[k] && !st[k].hidden) SB.giveUp(ctx.b, st[k]);
        },
        hold: 3.2,
      },
      // the star forms over his head and swells
      {
        call: (ctx) => {
          toField(ctx);
          const st = story(ctx), b = ctx.b;
          if (!st.bomb) st.bomb = SB.bomb(b, st.goku.pos.clone().add(new V3(0, 3, 0)));
          st.bomb.group.visible = true;
          st.bomb.set(0.4);
          pt(ctx, 'wide', at(b, SB.C.x + 26, SB.C.z + 30, 3));
        },
        pose: [{ who: 'goku', pose: 'sb_v', face: 'calm', speed: 3 }],
        cam: { subject: 'goku', focus: 'wide', angle: 'three', room: 5, aim: [0, 4.5, 0], side: -1, height: 1 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          const r = 0.4 + Math.min(1, t / 3) * (SB.HALF - 0.4);
          st.bomb.set(r);
          st.bomb.group.position.copy(st.goku.pos).add(new V3(0, 2.5 + r, 0));
          st.bomb.pulse();
          if (b.frame % 2 === 0) {
            const from = st.bomb.pos.clone().add(new V3((Math.random() - 0.5) * 80, 60, (Math.random() - 0.5) * 80));
            for (let i = 0; i < 5; i++) b.vfx.trail(from.clone().lerp(st.bomb.pos, i / 5), 0x9ae8ff, 0.5, 0.3);
          }
        },
        sfx: { name: 'kiCharge', vol: 0.9, pitch: 0.6 },
        hold: 3.2,
      },
      // Satan City: they will not
      {
        call: (ctx) => toCity(ctx),
        pose: [],
        cam: { from: { at: 'street', off: [3, 2.2, -10] }, look: { at: 'street', off: [0, 1.4, 0] }, fov: 48 },
        tick: (ctx, t) => {
          if (ctx.posed) return;
          ctx.posed = true;
          story(ctx).civilians.forEach((c, i) => c.setState('scripted', { pose: i % 3 === 0 ? 'cv_cower' : i % 3 === 1 ? 'armsCrossed' : 'idle', expression: i % 2 ? 'angry' : 'shock' }));
        },
        say: { who: 'civilian', line: 'Another voice in our heads?! That\'s exactly what that Babidi did!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      {
        cam: { from: { at: 'street', off: [-3, 1.8, -7] }, look: { at: 'street', off: [1, 1.5, 0] }, fov: 44 },
        say: { who: 'woman', line: 'It\'s a trick! Nobody raise their hands — nobody!', duration: 2.6, style: 'shout' },
        hold: 2.7,
      },
      // the star stops: half a sun
      {
        call: (ctx) => {
          toField(ctx);
          ctx.posed = false;
        },
        pose: [{ who: 'goku', pose: 'sb_vStrain', face: 'grit', speed: 4 }],
        cam: { subject: 'goku', focus: 'wide', angle: 'low', room: 7, aim: [0, 3.5, 0] },
        tick: (ctx) => story(ctx).bomb && story(ctx).bomb.pulse(),
        say: { who: 'king_kai', line: 'It\'s no good, Goku! They won\'t do it — they think it\'s another of Babidi\'s tricks!', duration: 3.6, style: 'shout' },
        hold: 3.7,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (b.stage.def.id !== 'kai_world') toField(ctx);
      if (st.goku.storySpace !== 'air') ctx.m.space(st.goku, 'air', { pos: SB.C.clone().add(new V3(0, 0, 10)), height: 34, face: SB.C });
      if (!st.bomb) st.bomb = SB.bomb(b, st.goku.pos.clone().add(new V3(0, 2.5 + SB.HALF, 0)));
      st.bomb.set(SB.HALF);
      st.bomb.group.position.copy(st.goku.pos).add(new V3(0, 2.5 + SB.HALF, 0));
      st.bomb.group.visible = true;
      st.goku.setState('scripted', { pose: 'sb_vStrain', expression: 'grit' });
      ctx.m.flags.bombHalf = true;
    },
  };

  /* ============================================================================ THE BEATING */
  S.sb_beatdown = {
    id: 'sb_beatdown',
    cast,
    music: { song: 'kid_buu', level: 3 },
    clearMood: false,
    events: [
      // his face: sweat, blood, the teeth grinding; the blue light flickering on it
      {
        call: (ctx) => ctx.b.stage.setMood(0.35, 0x140c24, 1),
        pose: [{ who: 'goku', pose: 'sb_vStrain', face: 'grit', speed: 6 }],
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          st.bomb.pulse();
          if (b.frame % 5 === 0) b.vfx.trail(st.goku.headPos().add(new V3((Math.random() - 0.5) * 0.2, -0.1, 0.12)), 0xffffff, 0.04, 0.4);
        },
        hold: 1.6,
      },
      // a shadow over his eyes; purple lightning splits the sky
      {
        call: (ctx) => {
          const b = ctx.b, g = story(ctx).goku;
          SL.ScreenFX.flash(0.22, '#8a5cff');
          b.sfx('lightning', null, { vol: 1.1 });
          for (let i = 0; i < 3; i++) b.vfx.bolt(g.pos.clone().add(new V3(-8 + i * 6, 12 + i * 2, -10)), 9, 0xb48cff);
        },
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Please! I\'m begging you! Just raise your hands! Do it now!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      // below: the little one looks straight up — the eyes gone huge, the irises to pinpoints
      {
        call: (ctx) => {
          const k = story(ctx).kid;
          if (k.model.setPupilScale) k.model.setPupilScale(0.3);
          faceTo(k, story(ctx).goku.pos);
        },
        pose: [{ who: 'kid', pose: 'kb_idle', face: 'shock', speed: 6 }],
        cam: { subject: 'kid', focus: 'face', angle: 'front' },
        hold: 1.2,
      },
      // and the laugh: he cannot use his hands up there, and the thing is not finished
      {
        call: (ctx) => {
          const k = story(ctx).kid;
          if (k.model.setPupilScale) k.model.setPupilScale(1);
        },
        pose: [{ who: 'kid', pose: 'kb_bellySlap', face: 'grin', speed: 8 }],
        cam: { subject: 'kid', focus: 'full', angle: 'three' },
        say: { who: 'kid_buu', line: 'Eee-eee-kikikikiki!', duration: 2 },
        hold: 2.1,
      },
      // back to Vegeta: the sweep that takes his feet
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, k = st.kid;
          ctx.m.space(v, 'ground', { pos: SB.C.clone().add(new V3(5, 0, 6)), pose: 'sw_kneelUp', expr: 'hurt', face: SB.C });
          ctx.m.space(k, 'ground', { pos: v.pos.clone().add(new V3(-1, 0, -0.6)), face: v.pos, pose: 'kb_sweep', expr: 'wicked' });
          pt(ctx, 'v0', v.pos);
        },
        space: { who: 'vegeta', mode: 'air', height: 1.2, pose: 'hitAirSpin', expr: 'hurt' },
        sfx: { name: 'swing', vol: 1, pitch: 0.8 },
        cam: { subject: 'vegeta', with: 'kid', focus: 'full' },
        hold: 0.5,
      },
      // the axe-handle from above, into the ground
      {
        space: [
          { who: 'kid', mode: 'flight', to: { at: 'vegeta', off: [0, 1.4, 0] }, seconds: 0.15, pose: 'hammerWind', endPose: 'hammer' },
        ],
        hold: 0.15,
      },
      {
        pose: [{ who: 'kid', pose: 'hammer', face: 'wicked', speed: 26 }],
        space: { who: 'vegeta', mode: 'groundImpact', radius: 2.2, depth: 0.5, seconds: 0.18, endPose: 'lieBack', expr: 'ko' },
        cam: { subject: 'vegeta', focus: 'full', angle: 'high', dist: 6.5 },
        hold: 0.8,
      },
      // the chest as a trampoline, laughing
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.kid, 'ground', { pos: st.vegeta.pos.clone(), face: SB.C });
          ctx.bounceY = st.kid.pos.y + 0.2;
          ctx.bounces = 0;
        },
        cam: { subject: 'kid', with: 'vegeta', focus: 'full', side: -1 },
        tick: (ctx, t) => {
          const st = story(ctx), k = st.kid, b = ctx.b;
          const ph = (t * 2.4) % 1;
          k.setPosition(new V3(k.pos.x, ctx.bounceY + Math.sin(ph * Math.PI) * 0.9, k.pos.z));
          k.prevPos.copy(k.pos);
          const n = Math.floor(t * 2.4);
          if (n !== ctx.bounces) {
            ctx.bounces = n;
            k.setState('scripted', { pose: 'kb_stompDown', expression: 'grin', speed: 30 });
            b.sfx(n % 2 ? 'boneCrack' : 'punchHeavy', st.vegeta, { vol: 0.9 });
            b.vfx.flash(st.vegeta.chest(), 0.8, 0xffffff, 0.12, SL.Toon.tex.glow);
            b.camera.addTrauma(0.15);
          } else if (ph > 0.4) k.setState('scripted', { pose: 'kb_laugh', expression: 'grin' });
        },
        say: { who: 'kid_buu', line: 'Hehehehehehe!', duration: 1.8 },
        hold: 2.1,
      },
      // the kick: off the ground and across the dirt
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.kid, 'ground', { pos: st.vegeta.pos.clone().add(new V3(-0.9, 0, 0)), face: st.vegeta.pos });
        },
        pose: [{ who: 'kid', pose: 'kickR', face: 'wicked', speed: 24 }],
        space: { who: 'vegeta', mode: 'slide', dir: [-0.6, 0, -1], distance: 4.5, seconds: 0.45, endPose: 'lieBack', expr: 'ko' },
        sfx: { name: 'punchHeavy', vol: 1.1 },
        cam: { subject: 'vegeta', focus: 'full', angle: 'side', dist: 6.5 },
        hold: 0.8,
      },
      // a blast wound up over his head
      {
        call: (ctx) => {
          const st = story(ctx), k = st.kid, v = st.vegeta;
          ctx.m.space(k, 'ground', { pos: v.pos.clone().add(new V3(-1.4, 0, 0.4)), face: v.pos });
          st.fin = TK().orb(ctx.b, k.handPos('R'), 0.22, 0xff6ab4, 0xffe0f0);
          ctx.m.onDispose(() => st.fin && st.fin.dispose());
          pt(ctx, 'vhead', v.headPos());
        },
        pose: [{ who: 'kid', pose: 'blastR', face: 'wicked', speed: 8 }],
        cam: { subject: 'kid', focus: 'upper', angle: 'ots', over: 'vegeta' },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.fin) {
            st.fin.group.position.copy(st.kid.handPos('R'));
            st.fin.pulse();
          }
        },
        hold: 1.4,
      },
      // Mr. Satan steps out from behind the rock, shaking all over
      {
        call: (ctx) => {
          const st = story(ctx), s = st.satan;
          st.satanOut = true;
          s.setHidden(false);
          ctx.m.space(s, 'ground', { pos: SB.SAT_ROCK.clone().add(new V3(2.4, 0, -1.4)), face: st.kid.pos });
        },
        pose: [{ who: 'satan', pose: 'stagger', face: 'shock', speed: 4 }],
        cam: { subject: 'satan', focus: 'upper', angle: 'three' },
        say: { who: 'mr_satan', line: 'S-STOP IT! Stop hurting him, you monster!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
      // the grin turns round, and he runs at him
      {
        call: (ctx) => {
          const st = story(ctx), k = st.kid;
          if (st.fin) {
            st.fin.dispose();
            st.fin = null;
          }
          faceTo(k, st.satan.pos);
          pt(ctx, 'halfway', k.pos.clone().lerp(st.satan.pos, 0.55));
        },
        pose: [{ who: 'kid', pose: 'run', face: 'wicked', speed: 1.6 }],
        cam: { subject: 'kid', focus: 'full', angle: 'ots', over: 'satan' },
        move: { who: 'kid', at: 'halfway', seconds: 1.1, ease: 'in', face: 'satan' },
      },
      // he stops dead, clutching his stomach; it swells; something comes up
      {
        pose: [{ who: 'kid', pose: 'kb_gutDouble', face: 'shock', speed: 8 }],
        cam: { subject: 'kid', focus: 'upper', angle: 'three' },
        tick: (ctx, t) => {
          const k = story(ctx).kid;
          const s = k.model.baseScale * (k.model._lookScale || 1) * (1 + Math.min(1, t / 1.1) * 0.35 + Math.sin(t * 30) * 0.02);
          k.model.root.scale.setScalar(s);
          if (ctx.b.frame % 8 === 0) ctx.b.camera.addTrauma(0.05);
        },
        sfx: { name: 'growl', who: 'kid', vol: 1, pitch: 0.6 },
        hold: 1.3,
      },
      // out onto the dirt: the fat one
      {
        call: (ctx) => {
          const st = story(ctx), k = st.kid, f = st.fat, b = ctx.b;
          k.model.root.scale.setScalar(k.model.baseScale * (k.model._lookScale || 1));
          st.fatOut = true;
          f.setHidden(false);
          f.untargetable = f.intangible = true;
          const out = k.forward.clone().setY(0).normalize();
          ctx.m.space(f, 'air', { pos: k.pos.clone().addScaledVector(out, 0.8), height: 0.9 });
          b.vfx.flash(k.headPos(), 1.2, 0xff9ad0, 0.2, SL.Toon.tex.glow);
          b.vfx.dust(k.headPos(), 0.8, 8, 0xff9ad0);
          b.sfx('candyPop', k, { pitch: 0.5, vol: 1.2 });
          pt(ctx, 'spat', k.pos.clone().addScaledVector(out, 2.4));
        },
        pose: [{ who: 'kid', pose: 'kb_mouth', face: 'shout', speed: 14 }],
        space: { who: 'fat', mode: 'groundImpact', at: 'spat', radius: 1.4, depth: 0.15, seconds: 0.45, endPose: 'knockdown', expr: 'ko', shake: 0.35 },
        cam: { subject: 'kid', with: 'fat', focus: 'full', side: -1 },
        hold: 1.2,
      },
      {
        pose: [{ who: 'satan', pose: 'idle', face: 'shock' }],
        cam: { subject: 'satan', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'mr_satan', line: 'BUU! He spat you out — you\'re alive!', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      // the fat one gets up between them, the steam coming out of his head
      {
        call: (ctx) => ctx.b.sfx('steam', story(ctx).fat, { vol: 1 }),
        pose: [{ who: 'fat', pose: 'getup', face: 'angry', speed: 3 }],
        cam: { subject: 'fat', focus: 'upper', angle: 'front' },
        tick: (ctx) => {
          const f = story(ctx).fat;
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.dust(f.headPos().add(new V3(0, 0.3, 0)), 0.4, 2, 0xffffff);
        },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const st = story(ctx), k = st.kid;
      if (st.fin) {
        st.fin.dispose();
        st.fin = null;
      }
      k.model.root.scale.setScalar(k.model.baseScale * (k.model._lookScale || 1));
      if (k.model.setPupilScale) k.model.setPupilScale(1);
      st.fatOut = true;
      st.fat.setHidden(false);
      st.satan.setHidden(false);
      st.vegeta.setState('scripted', { pose: 'lieBack', expression: 'ko' });
      ctx.b.stage.setMood(0, 0x140c24, 0.8);
      ctx.m.flags.goodBuuBack = true;
    },
  };

  /* ============================================================================ THE RALLY */
  S.sb_rally = {
    id: 'sb_rally',
    cast,
    music: { song: 'ascend', level: 3 },
    clearMood: false,
    events: [
      {
        pose: [{ who: 'satan', pose: 'idle', face: 'shock', speed: 4 }],
        cam: { subject: 'satan', focus: 'upper', angle: 'three' },
        say: { who: 'king_kai', line: 'Mr. Satan! They\'ll listen to YOU — talk to them! I\'ll put you through to the whole planet!', duration: 3.6, style: 'shout' },
        hold: 3.7,
      },
      {
        pose: [{ who: 'satan', pose: 'vk_point', face: 'shout', speed: 6 }],
        cam: { subject: 'satan', focus: 'closeup', angle: 'low', side: -1 },
        say: { who: 'mr_satan', line: 'Listen to me, you fools! It\'s Hercule! Give me your power to defeat Buu!', duration: 3.6, style: 'shout' },
        hold: 3.7,
      },
      // Satan City: that voice they know
      {
        call: (ctx) => {
          toCity(ctx);
          story(ctx).civilians.forEach((c) => c.setState('scripted', { pose: 'idle', expression: 'shock' }));
        },
        cam: { from: { at: 'street', off: [2, 1.6, -8] }, look: { at: 'street', off: [0, 1.6, 0] }, fov: 46 },
        say: { who: 'civilian', line: 'That\'s Mr. Satan! Hercule needs us!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      {
        call: (ctx) => story(ctx).civilians.forEach((c) => c.setState('scripted', { pose: 'sb_handsUp', expression: 'shout', speed: 4 })),
        cam: { from: { at: 'street', off: [3, 0.6, -11] }, look: { at: 'street', off: [0, 3.2, 0] }, fov: 52 },
        say: { who: 'crowd', line: 'HERCULE! HERCULE! HERCULE!', duration: 3, style: 'shout' },
        tick: (ctx) => {
          for (const c of story(ctx).civilians) SB.giveUp(ctx.b, c);
        },
        hold: 3.2,
      },
      // the half-formed star becomes a sun that blots out the sky
      {
        call: (ctx) => {
          toField(ctx);
          pt(ctx, 'far', at(ctx.b, SB.C.x - 30, SB.C.z + 44, 2));
          ctx.b.sfx('kiCharge', null, { vol: 1.2, pitch: 0.4 });
        },
        pose: [{ who: 'goku', pose: 'sb_v', face: 'shout', speed: 4 }],
        cam: { subject: 'goku', focus: 'wide', angle: 'low', room: 20, aim: [0, 12, 0], side: -1 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          const k = U.easeInOutCubic(Math.min(1, t / 2.6));
          const r = SB.HALF + (SB.FULL - SB.HALF) * k;
          st.bomb.set(r);
          st.bomb.group.position.copy(st.goku.pos).add(new V3(0, 2.5 + r, 0));
          st.bomb.pulse();
          b.stage.setMood(0.25 * k, 0x0a1830, 0.1);
          for (let j = 0; j < 2; j++) {
            const from = st.bomb.pos.clone().add(new V3((Math.random() - 0.5) * 160, 90, (Math.random() - 0.5) * 160));
            for (let i = 0; i < 5; i++) b.vfx.trail(from.clone().lerp(st.bomb.pos, i / 5), 0x9ae8ff, 0.7, 0.3);
          }
          b.camera.addTrauma(0.02);
        },
        hold: 3.4,
      },
      {
        pose: [{ who: 'goku', pose: 'sb_v', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'low' },
        tick: (ctx) => story(ctx).bomb.pulse(),
        say: { who: 'goku', line: 'They did it... It\'s done!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (b.stage.def.id !== 'kai_world') toField(ctx);
      st.bomb.set(SB.FULL);
      st.bomb.group.position.copy(st.goku.pos).add(new V3(0, 2.5 + SB.FULL, 0));
      ctx.m.flags.bombFull = true;
    },
  };

  /* ============================================================================ THE THROW, THE CATCH */
  S.sb_launch = {
    id: 'sb_launch',
    cast,
    music: { song: 'climax', level: 3 },
    clearMood: false,
    events: [
      // arms out and down at forty-five degrees, wrists together: the sun leaves him
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          ctx.b0 = st.bomb.pos.clone();
          ctx.b1 = st.kid.pos.clone().add(new V3(0, 1.15 + SB.FULL, 0));
          pt(ctx, 'side', at(b, SB.C.x + 46, SB.C.z + 8, 6));
        },
        pose: [{ who: 'goku', pose: 'sb_throw', face: 'shout', speed: 8 }],
        cam: { subject: 'goku', focus: 'full', angle: 'back', dist: 6.5, height: 3.4, aim: [0, -2.4, 0], fov: 58 },
        say: { who: 'goku', line: 'HAAAAAAH!', duration: 1.6, style: 'shout' },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.bomb.group.position.copy(ctx.b0).lerp(ctx.b1, U.easeInOutCubic(Math.min(1, t / 4.2)) * 0.6);
          st.bomb.pulse();
        },
        sfx: { name: 'beamFire', vol: 1, pitch: 0.5 },
        hold: 2.4,
      },
      // below: he sees it coming, plants his boots, and puts his hands up
      {
        call: (ctx) => ctx.m.space(story(ctx).kid, 'ground', { face: story(ctx).goku.pos }),
        pose: [{ who: 'kid', pose: 'kb_catch', face: 'shout', speed: 8 }],
        cam: { subject: 'kid', focus: 'full', angle: 'back', dist: 3.2, height: -0.3, aim: [0, 2.2, 0], fov: 62 },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.bomb.group.position.copy(ctx.b0).lerp(ctx.b1, 0.6 + U.easeInCubic(Math.min(1, t / 1.6)) * 0.4);
          st.bomb.pulse();
        },
        hold: 1.6,
      },
      // the contact: his feet plough two trenches back through the rock
      {
        call: (ctx) => {
          const st = story(ctx), k = st.kid, b = ctx.b;
          st.bomb.group.position.copy(ctx.b1);
          const back = k.pos.clone().sub(st.goku.pos).setY(0).normalize();
          ctx.trenchFrom = k.pos.clone();
          ctx.back = back;
          b.cameraTraumaAt(k.pos, 0.8);
          b.sfx('groundImpact', null, { at: k.pos, vol: 1.3 });
        },
        cam: { from: { at: 'kid', local: [2.8, 0.2, 3.4] }, look: { at: 'kid', off: [0, 1.2, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const st = story(ctx), k = st.kid, b = ctx.b;
          const d = Math.min(1, t / 0.9) * 2.4;
          const p = ctx.trenchFrom.clone().addScaledVector(ctx.back, d);
          p.y = SL.Staging.groundY(b, p.x, p.z);
          k.setPosition(p);
          k.prevPos.copy(p);
          st.bomb.group.position.copy(p).add(new V3(0, 1.15 + SB.FULL, 0));
          st.bomb.pulse();
          if (t < 0.95 && b.frame % 3 === 0) {
            const side = new V3(-ctx.back.z, 0, ctx.back.x);
            for (const s of [1, -1]) {
              const foot = p.clone().addScaledVector(side, s * 0.18);
              b.stage.crater(foot, 0.45, 0.12, null);
              b.vfx.dust(foot, 0.5, 3, 0x6a5a4a);
            }
          }
        },
        hold: 1.3,
      },
      // the eyes bulging, the mouth wide, the grin: and he starts it back up
      {
        call: (ctx) => {
          const k = story(ctx).kid;
          if (k.model.setPupilScale) k.model.setPupilScale(0.4);
        },
        pose: [{ who: 'kid', pose: 'kb_catch', face: 'wicked', speed: 6 }],
        cam: { subject: 'kid', focus: 'closeup', angle: 'front' },
        say: { who: 'kid_buu', line: 'Hrrrrrrgh... KYAHAHAHA!', duration: 2 },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 2,
      },
    ],
    end(ctx) {
      const st = story(ctx), k = st.kid;
      if (k.model.setPupilScale) k.model.setPupilScale(1);
      st.bomb.set(SB.FULL);
      st.bomb.group.position.copy(k.pos).add(new V3(0, 1.15 + SB.FULL, 0));
      k.setState('scripted', { pose: 'kb_catch', expression: 'wicked' });
      st.goku.setState('scripted', { pose: 'sb_throw', expression: 'grit' });
      ctx.m.flags.bombThrown = true;
    },
  };

  /* ============================================================================ THE THIRD WISH */
  S.sb_restore = {
    id: 'sb_restore',
    cast,
    music: { song: 'ascend', level: 2 },
    clearMood: false,
    events: [
      // Vegeta on the ridge, his head up off the rock
      {
        call: (ctx) => pt(ctx, 'ridge', story(ctx).vegeta.pos),
        pose: [{ who: 'vegeta', pose: 'lieBack', face: 'grit', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'closeup' },
        say: { who: 'vegeta', line: 'King Kai! Can you hear me?! Tell Dende — the last wish! Restore Kakarot\'s power — all of it!', duration: 4, style: 'shout' },
        hold: 4.1,
      },
      {
        call: (ctx) => {
          toNamek(ctx);
          story(ctx).porunga.eyes(0.3);
        },
        pose: [{ who: 'dende', pose: 'sb_handsUp', face: 'shout', speed: 6 }],
        cam: { from: { at: 'dende', local: [0.9, 0.5, -2.2] }, look: { at: 'dragon', off: [0, -10, 0] }, fov: 56, subject: 'dende', focus: 'full' },
        say: { who: 'dende', line: 'Porunga! Restore Goku\'s full stamina and power!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
      // the eyes flash red across the sky of New Namek
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          st.porunga.eyes(1);
          b.vfx.flash(st.porunga.headPos(), 10, 0xff3030, 0.4, SL.Toon.tex.glow);
          b.sfx('gong', null, { vol: 0.9, pitch: 0.6 });
        },
        cam: { from: { at: 'dragon', off: [6, -6, 22] }, look: { at: 'dragon', off: [0, 0.5, 0] }, fov: 34 },
        say: { who: 'porunga', line: 'Your wish has been granted.', duration: 2.4 },
        hold: 2.5,
      },
      // over the Sacred World: the drooping body jolts; green light wraps round it
      {
        call: (ctx) => {
          toField(ctx);
          const g = story(ctx).goku, b = ctx.b;
          b.vfx.ring(g.chest(), 5, 0x6aff8a, 0.6);
          b.vfx.flash(g.chest(), 3, 0x8aff9a, 0.3, SL.Toon.tex.glow);
          b.sfx('kiUp', g, { vol: 1, pitch: 0.8 });
          if (g.model.setBattered) g.model.setBattered(false);
        },
        pose: [{ who: 'goku', pose: 'sb_restore', face: 'shock', speed: 4 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        tick: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          story(ctx).bomb.pulse();
          if (b.frame % 2 === 0) b.vfx.streamInward(g.chest(), 2.4, 0x7aff9a, 3, 0.16, 0.4);
        },
        hold: 2.2,
      },
      // the eyes open; a calm smirk, down at the little one
      {
        pose: [{ who: 'goku', pose: 'sb_throw', face: 'smirk', speed: 3 }],
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        hold: 1.6,
      },
      // elbows bent, fists to the waist, a short roar — and the gold
      {
        pose: [{ who: 'goku', pose: 'powerUp', face: 'shout', speed: 10, aura: 1 }],
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        say: { who: 'goku', line: 'HAAH!', duration: 1, style: 'shout' },
        hold: 0.7,
      },
      {
        call: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          K().toForm(g, 'ssj');
          b.vfx.flash(g.chest(), 2.4, 0xffe25a, 0.3, SL.Toon.tex.glow);
          b.vfx.ring(g.chest(), 6, 0xffd23a, 0.5);
          if (VK() && VK().pillar) VK().pillar(ctx.m, g.pos.clone().add(new V3(0, -6, 0)), { height: 22, radius: 1.6, seconds: 1.6 });
          b.sfx('transformBurst', g, { vol: 1.1 });
        },
        pose: [{ who: 'goku', pose: 'powerUp', face: 'angry', speed: 6, aura: 1 }],
        cam: { subject: 'goku', focus: 'full', focus2: 'upper', angle: 'low', side: -1, ease: 'outCubic' },
        shake: { at: 'goku', amount: 0.4 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (b.stage.def.id !== 'kai_world') toField(ctx);
      if (st.porunga) {
        st.porunga.dispose();
        st.porunga = null;
      }
      K().toForm(st.goku, 'ssj');
      ctx.m.flags.thirdWish = true;
    },
  };

  /* ============================================================================ THE RESCUE */
  // Goku cannot drop it: Vegeta is lying right beside the monster. Mr. Satan runs into the crater for him.
  S.sb_rescue = {
    id: 'sb_rescue',
    cast,
    music: { song: 'goku_theme', level: 2 },
    clearMood: false,
    events: [
      // the hesitation: looking down past his own hands at the two of them
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'eyes', st.goku.headPos().add(new V3(0, 0.25, 0.1)));
          pt(ctx, 'pair', st.kid.pos.clone().lerp(st.vegeta.pos, 0.5));
        },
        pose: [{ who: 'goku', pose: 'sb_throw', face: 'shock', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        tick: (ctx) => story(ctx).bomb.pulse(),
        say: { who: 'goku', line: 'Vegeta...! He\'s right next to him — I can\'t!', duration: 2.6, style: 'shout' },
        hold: 2.7,
      },
      // down there: Vegeta out cold a few steps from the monster under the sun
      {
        cam: { subject: 'vegeta', with: 'kid', focus: 'full', side: -1 },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 1.6,
      },
      // ground level, behind him: Mr. Satan sprinting down into the smoking crater
      {
        call: (ctx) => {
          const st = story(ctx), s = st.satan, v = st.vegeta;
          s.setHidden(false);
          faceTo(s, v.pos);
          const dir = v.pos.clone().sub(s.pos).setY(0).normalize();
          pt(ctx, 'grab', v.pos.clone().addScaledVector(dir, -0.7));
        },
        pose: [{ who: 'satan', pose: 'run', face: 'shout', speed: 1.4 }],
        // the ground-level tracking shot: right behind him as he runs down into the crater
        cam: { subject: 'satan', focus: 'full', angle: 'back', dist: 3.4, height: -0.2, fov: 52 },
        say: { who: 'mr_satan', line: 'Hang on, Vegeta! I\'m coming!', duration: 2, style: 'shout' },
        tick: (ctx) => {
          const b = ctx.b, s = story(ctx).satan;
          story(ctx).bomb.pulse();
          if (b.frame % 4 === 0) b.vfx.dust(s.pos.clone().add(new V3(0, 0.2, 0)), 0.8, 2, 0x8a8078);
        },
        move: { who: 'satan', at: 'grab', seconds: 2.4, ease: 'linear', face: 'vegeta' },
      },
      // the haul: the limp prince slung over his shoulder
      {
        call: (ctx) => {
          ctx.carry = true;
          ctx.b.sfx('clothTear', story(ctx).satan, { vol: 0.4, pitch: 1.4 });
        },
        pose: [
          { who: 'satan', pose: 'sb_carry', face: 'shout', speed: 4 },
          { who: 'vegeta', pose: 'sb_slung', face: 'ko', speed: 4 },
        ],
        cam: { from: { at: 'satan', local: [1.6, -0.2, 2.2] }, look: { at: 'satan', off: [0, 0.4, 0] }, fov: 42 },
        tick: (ctx) => slung(ctx),
        hold: 1.2,
      },
      // and away across the rocks, yelling up at the sky
      {
        call: (ctx) => pt(ctx, 'safe', at(ctx.b, SB.SAT_ROCK.x + 2.2, SB.SAT_ROCK.z - 1.8)),
        pose: [{ who: 'satan', pose: 'sb_carry', face: 'shout', speed: 6 }],
        cam: { subject: 'satan', focus: 'full', angle: 'front', dist: 5.5, side: -1 },
        say: { who: 'mr_satan', line: 'GOKU! He\'s out — DO IT! DO IT NOW!', duration: 2.6, style: 'shout' },
        tick: (ctx) => {
          slung(ctx);
          const b = ctx.b, s = story(ctx).satan;
          if (b.frame % 5 === 0) b.vfx.trail(s.headPos().add(new V3((Math.random() - 0.5) * 0.2, 0, 0.1)), 0xffffff, 0.04, 0.3);
        },
        move: { who: 'satan', at: 'safe', seconds: 2.6, ease: 'linear', face: 'safe' },
      },
      // Goku sees it, and smiles
      {
        call: (ctx) => {
          ctx.carry = false;
          settle(ctx);
        },
        pose: [{ who: 'goku', pose: 'sb_throw', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        tick: (ctx) => story(ctx).bomb.pulse(),
        say: { who: 'goku', line: 'Way to go, Satan! You really ARE the savior of the world!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
    ],
    end(ctx) {
      ctx.carry = false;
      settle(ctx);
      ctx.m.flags.vegetaRescued = true;
    },
  };
  /** Vegeta over Mr. Satan's right shoulder, every tick while he is carried. */
  function slung(ctx) {
    if (!ctx.carry) return;
    const st = story(ctx), s = st.satan, v = st.vegeta;
    const fwd = s.forward.clone().setY(0).normalize();
    const right = new V3(fwd.z, 0, -fwd.x);
    const p = s.pos.clone().addScaledVector(right, -0.22).add(new V3(0, s.height * 0.62, 0)).addScaledVector(fwd, -0.05);
    v.setPosition(p);
    v.prevPos.copy(p);
    v.grounded = false;
    v.yaw = v.prevYaw = Math.atan2(-right.x, -right.z);
  }
  /** Against the rock: Mr. Satan kneeling, holding Vegeta up; the fat one sitting nearby. */
  function settle(ctx) {
    const st = story(ctx), b = ctx.b, Q = SB.SAT_ROCK;
    const sp = new V3(Q.x + 2.2, 0, Q.z - 1.8);
    ctx.m.space(st.satan, 'ground', { pos: sp, face: SB.C, pose: 'sb_holdUp', expr: 'shock' });
    ctx.m.space(st.vegeta, 'ground', { pos: sp.clone().add(new V3(0.7, 0, 0.5)), face: SB.C, pose: 'sb_againstRock', expr: 'ko' });
    if (st.fat && st.fatOut) ctx.m.space(st.fat, 'ground', { pos: new V3(Q.x + 4.4, 0, Q.z - 0.6), face: SB.C, pose: 'bu_sit', expr: 'calm' });
  }

  /* ============================================================================ "I'LL BE WAITING FOR YOU" */
  S.sb_farewell = {
    id: 'sb_farewell',
    cast,
    music: { song: 'bittersweet', level: 2 },
    clearMood: false,
    events: [
      // palms flat on the top of it, the little one far down through the gold and the blue
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.goku, 'flight', { to: st.bomb.top().add(new V3(0, 1.3, 1.1)), seconds: 0.8, pose: 'sb_push', endPose: 'sb_push' });
        },
        cam: { subject: 'goku', focus: 'full', angle: 'side', dist: 6 },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 1.6,
      },
      {
        pose: [{ who: 'goku', pose: 'sb_push', face: 'calm', speed: 2 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'You\'re remarkable... You put up a tough fight all by yourself. I never thought there\'d be someone like you.', duration: 4.8, style: 'quiet' },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 4.9,
      },
      {
        pose: [{ who: 'kid', pose: 'kb_catch', face: 'grit', speed: 6 }],
        cam: { subject: 'kid', focus: 'full', angle: 'low', aim: [0, 1.2, 0] },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 1.3,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'I know you did terrible things, but you were amazing. Maybe someday, you\'ll come back as someone good... and when you do, I\'d like to fight you again, one-on-one.', duration: 6.8, style: 'quiet' },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 6.9,
      },
      {
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        say: { who: 'goku', line: 'I\'ll be waiting for you...', duration: 2.6, style: 'quiet' },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 2.7,
      },
      // THE SALUTE: a tight medium shot from above and in front, the blazing blue behind his head; the right
      // hand comes off the sun, two fingers to his forehead, a warm smile down into the crater
      {
        call: (ctx) => {
          const g = story(ctx).goku;
          const fwd = g.forward.clone().setY(0).normalize();
          pt(ctx, 'salute', g.headPos().addScaledVector(fwd, 1.25).add(new V3(0, 0.55, 0)));
          pt(ctx, 'sface', g.headPos().add(new V3(0, -0.12, 0)));
        },
        pose: [{ who: 'goku', pose: 'sb_salute', face: 'grin', speed: 8, aura: 0.8 }],
        cam: { from: { at: 'salute' }, look: { at: 'sface' }, fov: 34 },
        say: { who: 'goku', line: 'Goodbye, Buu!', jp: 'Sankyu!', duration: 2.2 },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 2.3,
      },
      // the snap of the wrist: the hand back on it, both elbows locked
      {
        pose: [{ who: 'goku', pose: 'sb_push', face: 'grit', speed: 30, aura: 1 }],
        cam: { from: { at: 'salute' }, look: { at: 'sface' }, fov: 38 },
        sfx: { name: 'punchHeavy', who: 'goku', vol: 1, pitch: 0.7 },
        shake: { at: 'goku', amount: 0.35 },
        tick: (ctx) => story(ctx).bomb.pulse(),
        hold: 0.5,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      const p = st.bomb.top().add(new V3(0, 1.3, 1.1));
      ctx.m.space(st.goku, 'air', { pos: p, height: p.y - SL.Staging.groundY(ctx.b, p.x, p.z), pose: 'sb_push', expr: 'grit' });
      ctx.m.flags.farewell = true;
    },
  };

  /* ============================================================================ THE END OF BUU */
  S.sb_goodbye = {
    id: 'sb_goodbye',
    cast,
    clearMood: false,
    events: [
      // the full weight of the star, down on him
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          ctx.top0 = st.bomb.pos.clone();
          ctx.k0 = st.kid.pos.clone();
          pt(ctx, 'low', at(b, SB.C.x + 30, SB.C.z + 26, 3));
        },
        pose: [{ who: 'goku', pose: 'sb_push', face: 'shout', speed: 10, aura: 1 }],
        cam: { from: { at: 'low' }, look: { at: 'kid', off: [0, 10, 0] }, fov: 60 },
        say: { who: 'goku', line: 'HAAAAAAAAH!', duration: 1.6, style: 'shout' },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          const d = U.easeInCubic(Math.min(1, t / 1.4)) * 6;
          st.bomb.group.position.copy(ctx.top0).add(new V3(0, -d, 0));
          st.goku.setPosition(st.bomb.top().add(new V3(0, 1.3, 1.1)));
          st.goku.prevPos.copy(st.goku.pos);
          st.bomb.pulse();
          b.camera.addTrauma(0.06);
          if (t > 0.6 && !ctx.sunk) {
            ctx.sunk = true;
            b.stage.crater(ctx.k0, 12, 4, null);
            b.vfx.dust(ctx.k0, 10, 40, 0x6a5a4a);
            b.sfx('explosionHuge', null, { at: ctx.k0, vol: 1.2, pitch: 0.6 });
          }
          if (ctx.sunk) {
            const p = ctx.k0.clone();
            p.y = SL.Staging.groundY(b, p.x, p.z) - Math.min(2, (t - 0.6) * 3);
            st.kid.setPosition(p);
            st.kid.prevPos.copy(p);
          }
        },
        hold: 1.6,
      },
      // inside the light: the eyes going wide, a scream with no sound, and nothing left of him
      {
        call: (ctx) => {
          const st = story(ctx), k = st.kid, b = ctx.b;
          ctx.m.music(null);
          st.bomb.inside(true);
          st.bomb.group.position.copy(k.chest());
          if (k.model.setPupilScale) k.model.setPupilScale(0.25);
          b.stage.setMood(0.5, 0x0a3a8a, 0.3);
          ctx.kidScale = k.model.root.scale.x;
        },
        pose: [{ who: 'kid', pose: 'kb_scream', face: 'shout', speed: 6 }],
        cam: { from: { at: 'kid', local: [0.3, 0.6, 1.6] }, look: { at: 'kid:head' }, fov: 40, raw: true },
        tick: (ctx, t) => {
          const k = story(ctx).kid, b = ctx.b;
          const left = Math.max(0, 1 - Math.max(0, t - 0.9) / 1.4);
          k.model.root.scale.setScalar(ctx.kidScale * Math.max(0.02, left));
          if (t > 0.9 && b.frame % 2 === 0) b.vfx.sparks(k.chest(), 0xffb0d8, 6, 4, 0.06);
          if (left <= 0.03 && !k.hidden) k.setHidden(true);
        },
        hold: 2.6,
      },
      // the white, and then a blue haze; a pillar of light into space; silence
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          SL.ScreenFX.flash(0.95, '#ffffff');
          st.bomb.inside(false);
          st.bomb.dispose();
          st.bomb = null;
          b.stage.setMood(0.35, 0x2a5aa8, 1.6);
          if (VK() && VK().pillar) VK().pillar(ctx.m, SB.C.clone().add(new V3(0, -4, 0)), { height: 600, radius: 10, seconds: 5 });
          pt(ctx, 'far', at(b, SB.C.x - 60, SB.C.z + 70, 6));
        },
        cam: { from: { at: 'far' }, look: { at: 'far', off: [60, 40, -74] }, fov: 54 },
        hold: 2.6,
      },
      // embers floating over a quiet crater
      {
        call: (ctx) => pt(ctx, 'crater', at(ctx.b, SB.C.x, SB.C.z)),
        cam: { from: { at: 'crater', off: [16, 6, 20] }, to: { at: 'crater', off: [13, 5, 16] }, look: { at: 'crater', off: [0, 5, -4] }, fov: 50 },
        tick: (ctx) => embers(ctx, ctx.cast.crater.pos, 16),
        music: { song: 'aftermath', level: 0 },
        sfx: { name: 'wind', vol: 0.5 },
        hold: 3.2,
      },
      // the gold goes out of him: the hair snaps back, the shoulders drop, a long breath of steam
      {
        call: (ctx) => {
          const g = story(ctx).goku, b = ctx.b;
          ctx.m.space(g, 'air', { pos: SB.C.clone().add(new V3(-4, 0, 7)), height: 16, pose: 'flyIdle', face: SB.SAT_ROCK });
          b.stage.setMood(0, 0x2a5aa8, 2.4);
          if (g.model.setBattered) g.model.setBattered(true);
        },
        pose: [{ who: 'goku', pose: 'sb_exhale', face: 'soft', speed: 2, aura: 0.2 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        tick: (ctx, t) => {
          const g = story(ctx).goku, b = ctx.b;
          if (t > 0.7 && !ctx.based) {
            ctx.based = true;
            K().toForm(g, 'base');
            b.vfx.flash(g.chest(), 1.2, 0xffe25a, 0.2, SL.Toon.tex.glow);
          }
          if (t > 1.1 && b.frame % 3 === 0) {
            const fwd = g.forward.clone().setY(0).normalize();
            b.vfx.dust(g.headPos().addScaledVector(fwd, 0.18 + (t - 1.1) * 0.3), 0.15, 1, 0xf0f0f0);
          }
        },
        hold: 2.6,
      },
      // the bird's-eye view: down past him, the glass-smooth crater, Mr. Satan kneeling with Vegeta off to one side
      {
        call: (ctx) => pt(ctx, 'above', story(ctx).goku.pos.clone().add(new V3(1.5, 14, 4))),
        cam: { from: { at: 'above' }, look: { at: 'goku', off: [-3, -12, 2] }, fov: 50 },
        tick: (ctx) => embers(ctx, ctx.cast.crater.pos, 14),
        hold: 2.6,
      },
      // the glide: a low lens looking up at the sky as he drifts down through the smoke and the embers
      {
        call: (ctx) => {
          const g = story(ctx).goku;
          ctx.landAt = at(ctx.b, SB.SAT_ROCK.x + 6, SB.SAT_ROCK.z - 6.5);
          pt(ctx, 'land', ctx.landAt);
          pt(ctx, 'lowLens', ctx.landAt.clone().add(new V3(2.2, 0.35, 2.6)));
          ctx.descent = ctx.m.space(g, 'landing', { to: ctx.landAt, seconds: 5, endPose: 'stand', face: SB.SAT_ROCK });
          g.setState('scripted', { pose: 'flyIdle', expression: 'soft' });
        },
        cam: { from: { at: 'lowLens' }, look: { at: 'goku' }, fov: 54 },
        tick: (ctx, t) => {
          const b = ctx.b, g = story(ctx).goku;
          embers(ctx, g.pos, 6);
          if (b.frame % 6 === 0) b.vfx.dust(g.pos.clone().add(new V3((Math.random() - 0.5) * 4, -1 - Math.random() * 2, (Math.random() - 0.5) * 4)), 1.2, 2, 0x9a9aa8);
        },
        hold: 4.4,
      },
      // the boots touch the grass: a small puff of dust
      {
        cam: { from: { at: 'land', off: [1.2, 0.3, 1.6] }, look: { at: 'land', off: [0, 0.25, 0] }, fov: 40, raw: true },
        tick: (ctx) => {
          if (ctx.descent && ctx.descent.done() && !ctx.touched) {
            ctx.touched = true;
            ctx.b.vfx.dust(ctx.landAt, 0.6, 6, 0xb0a890);
          }
        },
        hold: 1.2,
      },
      // out of the haze, arms loose at his sides
      {
        call: (ctx) => {
          if (ctx.descent) ctx.descent.finish();
          const g = story(ctx).goku;
          faceTo(g, story(ctx).satan.pos);
        },
        pose: [{ who: 'goku', pose: 'stand', face: 'soft', speed: 2 }],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        tick: (ctx) => {
          const b = ctx.b, g = story(ctx).goku;
          if (b.frame % 5 === 0) b.vfx.dust(g.pos.clone().add(new V3((Math.random() - 0.5) * 3, 0.4, (Math.random() - 0.5) * 3)), 1.4, 2, 0xb8b8c4);
        },
        hold: 2,
      },
      // the reunion: Mr. Satan holding Vegeta against the rocks, the fat one sitting nearby
      {
        call: (ctx) => pt(ctx, 'group', story(ctx).satan.pos.clone().add(new V3(0.6, 0, 0.6))),
        cam: { subject: 'vegeta', focus: 'wide', room: 1.6, angle: 'ots', over: 'goku', fov: 44 },
        hold: 2.6,
      },
      // battered, dirty, worn out — and grinning ear to ear
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'grin', speed: 2 }],
        music: { song: 'bittersweet', level: 2 },
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        hold: 2.4,
      },
      // the thumbs-up: right arm straight out toward them
      {
        pose: [{ who: 'goku', pose: 'sb_thumbsUp', face: 'grin', speed: 8 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        hold: 2.6,
      },
      // Vegeta against the dirt: the bruised eye opens, a quiet chuckle, a smile — and his thumb comes up too
      {
        pose: [{ who: 'vegeta', pose: 'sb_againstRock', face: 'hurt', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'Heh... heh heh.', duration: 1.8, style: 'quiet' },
        hold: 1.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'sb_rockThumb', face: 'smirk', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'medium', angle: 'three' },
        hold: 2.8,
      },
      // the two of them, the rocks, the quiet sky
      {
        pose: [{ who: 'satan', pose: 'sb_holdUp', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', side: -1, pad: 2.4 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (st.bomb) {
        st.bomb.dispose();
        st.bomb = null;
      }
      st.kid.setHidden(true);
      K().toForm(st.goku, 'base');
      if (ctx.descent) ctx.descent.finish();
      b.stage.setMood(0, 0x2a5aa8, 1);
      ctx.m.flags.kidBuuGone = true;
      if (SL.Save && SL.Save.data && SL.Save.data.flags) SL.Save.data.flags.buuDefeated = true;
    },
  };
  /** Golden embers drifting up over the crater (every tick of a shot that wants them). */
  function embers(ctx, centre, spread) {
    const b = ctx.b;
    if (b.frame % 4) return;
    const p = centre.clone().add(new V3((Math.random() - 0.5) * spread, Math.random() * 3, (Math.random() - 0.5) * spread));
    b.vfx.trail(p, Math.random() < 0.6 ? 0xffc870 : 0x9ad8ff, 0.12, 1.6);
  }
})();
