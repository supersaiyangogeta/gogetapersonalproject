/*
 * VEGITO KIT — the staging pieces Chapter 13 (the Potara, Buuhan, Vegito, inside Buu) shares.
 *
 *   poses      the shared acting the chapter needs on anybody (an earring onto an ear, digging in
 *              the dirt, grabbing somebody by the shoulders, curled up in a pod...) — SL.data.poses
 *   potara     an earring in the world (thrown, dropped, lost in the rubble) / on an ear (earOn)
 *   hold       hold Charge to push something through (a life handed over, a barrier)
 *   magnet     two bodies pulled together by the Potara, and the pillar of light
 *   disc       Goku's Destructo Disc, spinning, flying
 *   creeper    a piece of Buu crawling through the rocks, then opening into a sheet (wrap / pull)
 *   barrier    a sphere of ki round a fighter (Vegito's shield inside the sheet)
 *   ghosts     Buuhan's Super Ghost Kamikaze replicas
 *   rift       the Vice Shout's tear in space
 *   candy      the world's strongest coffee candy
 *   vanishTo   one step of Super Vegito's speed: an afterimage left behind, a small shockwave
 *               where he arrives, dust thrown off the ground
 *   innards    the inside of Buu: the walls, the tubes, the pods
 *
 * Everything owned by a mission is removed with it (Mission.onDispose). No new engine: meshes,
 * the existing VFX pool, mission tick hooks.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const C = SL.data.poses;
  const BK = () => SL.data.buuKit;

  /* ================================================================ shared acting */
  // fastening an earring on the LEFT ear (Goku) / the RIGHT ear (Vegeta)
  C.earringR = { root: { y: 0 }, chest: [-2, 0, 0], head: [2, 0, -16], shoulderR: [-70, 0, -64], elbowR: [-132, 0, 0], shoulderL: [-4, 0, 14], elbowL: [-18, 0, 0], thighL: [-4, 0, 10], kneeL: [4, 0, 0], thighR: [-4, 0, -10], kneeR: [4, 0, 0], hands: ['open', 'point'] };
  C.earringL = SL.Anim && SL.Anim.mirror ? SL.Anim.mirror(C.earringR) : C.earringR;
  // one hand held out, palm up, something small in it
  C.offerPalm = { root: { y: 0 }, spine: [2, 0, 0], chest: [2, 0, 0], head: [6, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-30, 0, 0], handR: [0, 0, 0], shoulderL: [-4, 0, 12], elbowL: [-18, 0, 0], thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [-4, 0, -10], kneeR: [6, 0, 0], hands: ['open', 'open'] };
  // an underarm toss
  C.tossW = { root: { y: -0.04 }, spine: [6, 10, 0], chest: [4, 14, 0], head: [-6, -10, 0], shoulderR: [30, 0, -20], elbowR: [-20, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0], thighL: [-16, 0, 12], kneeL: [18, 0, 0], thighR: [6, 0, -12], kneeR: [16, 0, 0], hands: ['open', 'fist'] };
  C.toss = { root: { y: -0.02 }, spine: [-4, -8, 0], chest: [-6, -10, 0], head: [-10, 8, 0], shoulderR: [-110, 0, -10], elbowR: [-10, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0], thighL: [-20, 0, 12], kneeL: [22, 0, 0], thighR: [10, 0, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] };
  // reaching up for something falling
  C.reachUp = { root: { y: 0.02 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-30, 0, 0], shoulderR: [-160, 0, -14], elbowR: [-10, 0, 0], shoulderL: [-130, 0, 20], elbowL: [-20, 0, 0], thighL: [-10, 0, 10], kneeL: [12, 0, 0], thighR: [6, 0, -10], kneeR: [10, 0, 0], hands: ['open', 'open'] };
  // on the knees, both hands in the dirt
  C.digKneel = (t) => {
    const a = Math.sin(t * 9), c = Math.cos(t * 9);
    return {
      root: { y: -0.5, rx: 30 }, spine: [26, a * 6, 0], chest: [14, 0, 0], head: [20, a * 8, 0],
      shoulderL: [-50 + a * 20, 0, 16], elbowL: [-30 - c * 10, 0, 0], shoulderR: [-50 - a * 20, 0, -16], elbowR: [-30 + c * 10, 0, 0],
      thighL: [-60, 0, 14], kneeL: [120, 0, 0], thighR: [-60, 0, -14], kneeR: [120, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // up on one knee with something held high in a fist: found it
  C.foundIt = { root: { y: -0.36, rx: 6 }, spine: [4, 0, 0], chest: [-4, 0, 0], head: [-18, 0, 0], shoulderR: [-150, 0, -10], elbowR: [-20, 0, 0], shoulderL: [-20, 0, 20], elbowL: [-40, 0, 0], thighL: [-80, 0, 10], kneeL: [90, 0, 0], thighR: [10, 0, -10], kneeR: [110, 0, 0], hands: ['open', 'fist'] };
  // wrapped from behind: arms pinned, the head thrown back
  C.wrapped = (t) => {
    const s = Math.sin(t * 22) * 4;
    return {
      root: { y: -0.02, rx: -14 }, spine: [-12, 0, s], chest: [-14, 0, -s], head: [-28, s, 0],
      shoulderL: [-10, 0, 8], elbowL: [-20, 0, 0], shoulderR: [-10, 0, -8], elbowR: [-20, 0, 0],
      thighL: [-20, 0, 8], kneeL: [30, 0, 0], thighR: [-6, 0, -8], kneeR: [16, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // both hands on somebody's shoulders, leaning in, shouting into his face
  C.shoulderGrab = { root: { y: -0.02, rx: 8 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [-6, 0, 0], shoulderL: [-80, 0, 20], elbowL: [-40, 0, 0], shoulderR: [-80, 0, -20], elbowR: [-40, 0, 0], thighL: [-20, 0, 10], kneeL: [22, 0, 0], thighR: [8, 0, -10], kneeR: [16, 0, 0], hands: ['open', 'open'] };
  // the back turned, the arms folded, the chin up (the yaw does the turning)
  C.backTurned = { root: { y: 0 }, spine: [-2, 0, 0], chest: [-6, 0, 0], head: [-14, 12, 0], shoulderL: [-14, -72, 6], elbowL: [-92, 0, 0], shoulderR: [-18, 72, -6], elbowR: [-88, 0, 0], thighL: [-4, 0, 9], kneeL: [4, 0, 0], thighR: [2, 0, -9], kneeR: [4, 0, 0], hands: ['fist', 'fist'] };
  // snatching something out of a hand
  C.snatch = { root: { y: -0.02 }, spine: [6, -14, 0], chest: [4, -18, 0], head: [-8, 12, 0], shoulderR: [-80, 0, -6], elbowR: [-60, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-50, 0, 0], thighL: [-14, 0, 12], kneeL: [16, 0, 0], thighR: [8, 0, -12], kneeR: [12, 0, 0], hands: ['fist', 'fist'] };
  // crushing something small in the right fist, held up in front of the face
  C.crushFist = (t) => {
    const s = Math.sin(t * 30) * 2;
    return { root: { y: -0.02 }, spine: [2, 0, 0], chest: [0, 0, 0], head: [8, 0, 0], shoulderR: [-70 + s, 20, -10], elbowR: [-110, 0, 0], shoulderL: [-6, 0, 18], elbowL: [-30, 0, 0], thighL: [-6, 0, 12], kneeL: [8, 0, 0], thighR: [2, 0, -10], kneeR: [8, 0, 0], hands: ['fist', 'fist'] };
  };
  // diving flat to the ground for cover
  C.dive = { root: { y: -0.7, rx: 70 }, spine: [-10, 0, 0], chest: [-8, 0, 0], head: [-40, 0, 0], shoulderL: [-160, 0, 20], elbowL: [-20, 0, 0], shoulderR: [-160, 0, -20], elbowR: [-20, 0, 0], thighL: [6, 0, 8], kneeL: [20, 0, 0], thighR: [0, 0, -8], kneeR: [30, 0, 0], hands: ['open', 'open'] };
  // crouched behind cover, head down
  C.crouchCover = { root: { y: -0.46, rx: 16 }, spine: [24, 0, 0], chest: [12, 0, 0], head: [14, 0, 0], shoulderL: [-70, 0, 30], elbowL: [-120, 0, 0], shoulderR: [-70, 0, -30], elbowR: [-120, 0, 0], thighL: [-100, 0, 14], kneeL: [130, 0, 0], thighR: [-100, 0, -14], kneeR: [130, 0, 0], hands: ['fist', 'fist'] };
  // curled up asleep inside a pod
  C.podCurl = (t) => {
    const b = Math.sin(t * 0.9);
    return { root: { y: -0.2, rx: 30 }, spine: [30, 0, 0], chest: [20, 0, 0], head: [30 + b * 3, 0, 0], shoulderL: [-60, 0, 10], elbowL: [-120, 0, 0], shoulderR: [-60, 0, -10], elbowR: [-120, 0, 0], thighL: [-100, 0, 8], kneeL: [120, 0, 0], thighR: [-100, 0, -8], kneeR: [120, 0, 0], hands: ['fist', 'fist'] };
  };
  // sitting cross-legged, both hands pressed together: the Old Kai's gift
  C.prayerSit = (t) => {
    const s = Math.sin(t * 20) * 1.2;
    return { root: { y: -0.42 }, spine: [4, 0, 0], chest: [0, 0, 0], head: [4, 0, 0], shoulderL: [-50, -30, 10], elbowL: [-110 + s, 0, 0], shoulderR: [-50, 30, -10], elbowR: [-110 - s, 0, 0], thighL: [-84, 30, 36], kneeL: [124, 0, 0], thighR: [-84, -30, -36], kneeR: [124, 0, 0], hands: ['open', 'open'] };
  };
  // kneeling on one knee, head bowed: receiving
  C.kneelReceive = { root: { y: -0.4, rx: 6 }, spine: [10, 0, 0], chest: [6, 0, 0], head: [16, 0, 0], shoulderL: [-20, 0, 14], elbowL: [-40, 0, 0], shoulderR: [-30, 0, -10], elbowR: [-70, 0, 0], thighL: [-90, 0, 8], kneeL: [90, 0, 0], thighR: [10, 0, -8], kneeR: [110, 0, 0], hands: ['open', 'fist'] };
  // Goku's disc raised on the flat of his hand overhead
  C.discRaise = (t) => {
    const s = Math.sin(t * 30) * 1.5;
    return { root: { y: -0.04 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-16, 0, 0], shoulderR: [-176, 0, -4], elbowR: [-6 + s, 0, 0], handR: [-80, 0, 0], shoulderL: [-10, 0, 20], elbowL: [-30, 0, 0], thighL: [-16, 0, 12], kneeL: [20, 0, 0], thighR: [6, 0, -12], kneeR: [14, 0, 0], hands: ['open', 'open'] };
  };
  C.discThrow = { root: { y: -0.06, rx: 12 }, spine: [14, -10, 0], chest: [10, -12, 0], head: [-6, 10, 0], shoulderR: [-60, 0, -40], elbowR: [-8, 0, 0], shoulderL: [-20, 0, 30], elbowL: [-50, 0, 0], thighL: [-30, 0, 12], kneeL: [30, 0, 0], thighR: [12, 0, -12], kneeR: [16, 0, 0], hands: ['open', 'open'] };
  // laughing and pointing at somebody (Goku, at Buu in Piccolo's clothes)
  C.laughPoint = (t) => {
    const b = Math.sin(t * 14);
    return { root: { y: -0.04 + Math.abs(b) * 0.012, rx: 8 }, spine: [10, -10, 0], chest: [6, -12, 0], head: [-6 + b * 4, 10, 0], shoulderR: [-86, 0, -4], elbowR: [-6, 0, 0], shoulderL: [-40, 20, 10], elbowL: [-100, 0, 0], thighL: [-10, 0, 12], kneeL: [16, 0, 0], thighR: [-4, 0, -12], kneeR: [14, 0, 0], hands: ['fist', 'point'] };
  };
  // hand shading the eyes, looking round for somebody
  C.lookAround = (t) => {
    const s = Math.sin(t * 1.6) * 30;
    return { root: { y: 0 }, spine: [0, s * 0.3, 0], chest: [-2, s * 0.4, 0], head: [-4, s, 0], shoulderR: [-120, 30, -20], elbowR: [-120, 0, 0], shoulderL: [-6, 0, 14], elbowL: [-20, 0, 0], thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [-4, 0, -10], kneeR: [6, 0, 0], hands: ['open', 'open'] };
  };
  // pulled through the air by a magnet in the ear: the body trailing, the head first
  C.pulled = { root: { rx: -6, rz: 6 }, spine: [-8, 0, 0], chest: [-8, 0, 0], head: [-12, 0, -14], shoulderL: [20, 0, 30], elbowL: [-20, 0, 0], shoulderR: [20, 0, -30], elbowR: [-20, 0, 0], thighL: [10, 0, 8], kneeL: [30, 0, 0], thighR: [16, 0, -8], kneeR: [40, 0, 0], hands: ['open', 'open'] };

  /* ================================================================ helpers */
  const own = (m, fn) => m.onDispose(fn);
  const additive = (color, opacity = 0.8) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });

  const VK = (SL.data.vegitoKit = {
    /** Remove a tick hook. */
    unhook(m, fn) {
      const i = m.tickHooks.indexOf(fn);
      if (i >= 0) m.tickHooks.splice(i, 1);
    },

    /** A Potara earring loose in the world (thrown, falling, lying in the dirt). */
    potara(m, pos) {
      const b = m.battle;
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 18), SL.Toon.makeMat(0xf2c82a, {}));
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), SL.Toon.makeMat(0xb8e04a, {}));
      bead.position.y = -0.09;
      g.add(ring, bead);
      const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xfff0a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
      glint.scale.setScalar(0.5);
      g.add(glint);
      if (pos) g.position.copy(pos);
      b.scene.add(g);
      const out = { group: g, pos: g.position, glint };
      out.dispose = () => {
        b.scene.remove(g);
        ring.geometry.dispose();
        bead.geometry.dispose();
        ring.material.dispose();
        bead.material.dispose();
        glint.material.dispose();
      };
      own(m, out.dispose);
      return out;
    },

    /** An earring on a fighter's ear (side +1: his left ear, -1: his right). */
    earOn(f, side) {
      const R = f.model.b.headR;
      f.model.addProp({ id: 'potara' + (side > 0 ? 'L' : 'R'), shape: 'potara', joint: 'head', pos: [side * R * 1.04, R * 0.6, 0], rot: [0, 0, 0], scale: 1.3 });
    },
    earOff(f) {
      f.model.removeProp('potaraL');
      f.model.removeProp('potaraR');
    },
    /** The world position of an ear (for the glow). */
    ear(f, side) {
      const R = f.model.b.headR;
      f.model.root.updateMatrixWorld(true);
      return f.model.joints.head.localToWorld(new V3(side * R * 1.04, R * 0.6, 0)).sub(f.object.position).add(f.pos);
    },

    /**
     * HOLD: the player pushes something through by holding Charge (a life handed over, a barrier
     * raised). Holding fills it, letting go lets it sink back; it never fails. beats [{ at, run }]
     * fire as it rises; tick(k) runs every frame with the level. A skip lands on the full state.
     */
    *hold(m, opts) {
      const b = m.battle, f = opts.fighter;
      const need = opts.seconds || 3.5;
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.charge;
      m.limits(lim);
      if (b.player !== f) b.switchPlayer(f, { force: true });
      b.inputLocked = false;
      b.aiLocked = true;
      f.setState('scripted', { pose: opts.pose || 'charge', expression: opts.face || 'grit' });
      let k = 0;
      const beats = (opts.beats || []).slice().sort((a, c) => a.at - c.at);
      let next = 0;
      m.prompt('hold_' + (opts.id || 'x'), 'charge', opts.label || 'Hold', { required: true, until: () => k >= 1, always: true });
      const hook = () => {
        const holding = !!(f.intent && f.intent.charge);
        k = U.clamp01(k + (holding ? 1 / (need * 60) : -0.3 / 60));
        if (opts.tick) opts.tick(k, holding);
        while (next < beats.length && k >= beats[next].at) beats[next++].run(m, f);
        b.emit('struggle', { active: true, progress: 1 - k, rate: 0, label: opts.meter || 'HOLD' });
      };
      m.tickHooks.push(hook);
      b.skipRequested = false;
      yield () => k >= 1 || b.skipRequested;
      VK.unhook(m, hook);
      b.emit('struggle', { active: false });
      while (next < beats.length) beats[next++].run(m, f);
      if (opts.tick) opts.tick(1, false);
      m.limits(null);
      b.inputLocked = true;
    },

    /**
     * THE POTARA'S PULL: two bodies dragged together through the air, faster and faster, the
     * earrings flaring; they meet chest to chest in `seconds`. Returns the meeting point.
     */
    *magnet(m, a, c, opts = {}) {
      const b = m.battle;
      const lift = opts.lift === undefined ? 1.2 : opts.lift;
      const A0 = a.pos.clone(), C0 = c.pos.clone();
      const mid = A0.clone().lerp(C0, 0.5);
      mid.y = Math.max(A0.y, C0.y) + lift;
      const seconds = opts.seconds || 1.6;
      let t = 0;
      for (const f of [a, c]) {
        f.grounded = false;
        f.setState('scripted', { pose: 'pulled', expression: 'shock' });
      }
      const hook = () => {
        t += 1 / 60;
        const k = Math.min(1, t / seconds);
        const e = k * k * k; // slow, then all at once
        a.setPosition(A0.clone().lerp(mid, e * 0.97 + 0.0).add(new V3(0, Math.sin(k * Math.PI) * 0.3, 0)));
        c.setPosition(C0.clone().lerp(mid, e * 0.97).add(new V3(0, Math.sin(k * Math.PI) * 0.3, 0)));
        a.prevPos.copy(a.pos);
        c.prevPos.copy(c.pos);
        BK().faceTo(a, c.pos);
        BK().faceTo(c, a.pos);
        if (b.frame % 3 === 0) {
          for (const [f, s] of [[a, 1], [c, -1]]) b.vfx.flash(VK.ear(f, s), 0.4 + k * 1.4, 0xfff0a0, 0.12, SL.Toon.tex.glow);
        }
        if (k > 0.4 && b.frame % 2 === 0) for (const f of [a, c]) b.vfx.trail(f.chest(), 0xfff4c0, 0.4 + k * 0.4, 0.3);
        if (k > 0.6) b.camera.addTrauma(0.04);
      };
      m.tickHooks.push(hook);
      yield* m.cine(seconds);
      VK.unhook(m, hook);
      return mid;
    },

    /** A column of white-gold light, miles high, from a point; fades out by itself. */
    pillar(m, pos, opts = {}) {
      const b = m.battle;
      const H = opts.height || 220, R = opts.radius || 5;
      const g = new THREE.Group();
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.6, R * 2.2, H, 24, 1, true), additive(0xfff0c0, 0.35));
      const core = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.9, H, 16, 1, true), additive(0xffffff, 0.8));
      outer.position.y = core.position.y = H / 2;
      g.add(outer, core);
      g.position.copy(pos);
      b.scene.add(g);
      let life = 0;
      const total = opts.seconds || 2.6;
      const dispose = () => {
        if (!g.parent) return;
        b.scene.remove(g);
        for (const o of [outer, core]) {
          o.geometry.dispose();
          o.material.dispose();
        }
      };
      own(m, dispose);
      b.onTick(() => {
        if (b.disposed || !g.parent) return false;
        life += 1 / 60;
        const k = life / total;
        const w = k < 0.15 ? k / 0.15 : 1 + (k - 0.15) * 0.6;
        g.scale.set(w, 1, w);
        outer.material.opacity = 0.35 * Math.max(0, 1 - Math.max(0, k - 0.5) * 2);
        core.material.opacity = 0.8 * Math.max(0, 1 - Math.max(0, k - 0.4) * 1.7);
        outer.rotation.y += 0.02;
        if (k >= 1) {
          dispose();
          return false;
        }
        return true;
      });
      return g;
    },

    /** Goku's Destructo Disc: a flat spinning ring of yellow ki. update(pos, scale) each tick. */
    disc(m) {
      const b = m.battle;
      const g = new THREE.Group();
      const edge = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 36), additive(0xffe24a, 0.95));
      const face = new THREE.Mesh(new THREE.CircleGeometry(1, 36), additive(0xfff4a0, 0.45));
      edge.rotation.x = face.rotation.x = -Math.PI / 2;
      face.material.side = THREE.DoubleSide;
      g.add(edge, face);
      g.visible = false;
      b.scene.add(g);
      const dispose = () => {
        b.scene.remove(g);
        for (const o of [edge, face]) {
          o.geometry.dispose();
          o.material.dispose();
        }
      };
      own(m, dispose);
      return {
        group: g,
        set(pos, r) {
          g.visible = true;
          g.position.copy(pos);
          g.scale.setScalar(Math.max(0.01, r));
          g.rotation.y += 0.6;
          if (b.frame % 2 === 0) b.vfx.trail(pos, 0xffe890, r * 0.5, 0.18);
        },
        hide() {
          g.visible = false;
        },
      };
    },

    /**
     * A piece of Buu with a mind of its own: a pink worm that crawls along a path of points
     * (crawl(k) 0..1), then opens into a sheet round somebody (wrap(f, k)), then pulls back into its
     * owner (pull(to, k)). A chain of balls for the worm, one squashed shell for the sheet.
     */
    creeper(m, opts = {}) {
      const b = m.battle;
      const T = SL.Toon;
      const color = opts.color || 0xf29ac0;
      const n = opts.segments || 9;
      const mat = T.makeMat(color, {});
      const geo = new THREE.SphereGeometry(1, 12, 9);
      const segs = [];
      const worm = new THREE.Group();
      for (let i = 0; i < n; i++) {
        const s = new THREE.Mesh(geo, mat);
        T.addOutline(s, 1.4);
        worm.add(s);
        segs.push(s);
      }
      const sheet = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), T.makeMat(color, { side: THREE.DoubleSide }));
      T.addOutline(sheet, 1.3);
      sheet.visible = false;
      b.scene.add(worm, sheet);
      const dispose = () => {
        b.scene.remove(worm, sheet);
        geo.dispose();
        mat.dispose();
        sheet.geometry.dispose();
        sheet.material.dispose();
      };
      own(m, dispose);
      const path = (opts.path || []).map((p) => p.clone());
      const size = opts.size || 0.14;
      const at = (k) => {
        if (!path.length) return new V3();
        const x = U.clamp01(k) * (path.length - 1);
        const i = Math.min(path.length - 2, Math.floor(x));
        return path[i].clone().lerp(path[i + 1], x - i);
      };
      return {
        worm,
        sheet,
        path,
        visible(on) {
          worm.visible = on;
          if (!on) sheet.visible = false;
        },
        /** crawl to k along the path; the body undulates behind the head */
        crawl(k, t) {
          worm.visible = true;
          for (let i = 0; i < n; i++) {
            const kk = k - i * 0.012;
            const p = at(kk);
            p.y += size * 0.6 + Math.abs(Math.sin(t * 8 - i * 0.8)) * size * 0.5;
            p.x += Math.sin(t * 6 - i) * size * 0.4;
            segs[i].position.copy(p);
            segs[i].scale.setScalar(size * (1 - i / (n * 1.6)));
          }
          return at(k);
        },
        head() {
          return segs[0].position.clone();
        },
        /** rear up and spread over a fighter (0..1): the worm becomes a sheet round him */
        wrap(f, k) {
          const c = f.chest();
          worm.visible = k < 0.5;
          for (let i = 0; i < n; i++) segs[i].position.lerp(c, 0.2);
          sheet.visible = k > 0.25;
          sheet.position.copy(c).add(new V3(0, -0.1, 0));
          const r = f.height * (0.25 + k * 0.42);
          sheet.scale.set(r * 0.85, r * 1.25, r * 0.85);
          sheet.rotation.y = Math.sin(k * 20) * 0.1;
          return sheet;
        },
        /** the whole bundle flying back into its owner */
        pull(from, to, k, carried) {
          const p = from.clone().lerp(to, k * k);
          p.y += Math.sin(k * Math.PI) * 2.5;
          sheet.visible = true;
          sheet.position.copy(p);
          const s = sheet.scale.x * (1 - 0.01);
          sheet.scale.set(s, s * 1.4, s);
          if (carried) {
            carried.setPosition(p.clone().add(new V3(0, -carried.height * 0.4, 0)));
            carried.prevPos.copy(carried.pos);
          }
          return p;
        },
        hide() {
          worm.visible = false;
          sheet.visible = false;
        },
      };
    },

    /** A sphere of ki round a fighter (green-white): follows him; set(k) 0..1 opacity/size. */
    barrier(m, f, color = 0x9affc8) {
      const b = m.battle;
      const mat = additive(color, 0.0);
      const rim = additive(0xffffff, 0.0);
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), mat);
      const edge = new THREE.Mesh(new THREE.SphereGeometry(1.02, 28, 20), rim);
      edge.material.side = THREE.BackSide;
      g.add(shell, edge);
      b.scene.add(g);
      const dispose = () => {
        b.scene.remove(g);
        for (const o of [shell, edge]) {
          o.geometry.dispose();
          o.material.dispose();
        }
      };
      own(m, dispose);
      let level = 0;
      const out = {
        group: g,
        set(k) {
          level = k;
          mat.opacity = 0.28 * k;
          rim.opacity = 0.35 * k;
          g.visible = k > 0.01;
        },
        follow() {
          g.position.copy(f.chest());
          const r = f.height * 0.72 * (0.85 + level * 0.15) + Math.sin(b.frame * 0.3) * 0.02;
          g.scale.setScalar(r);
        },
      };
      out.set(0);
      b.onTick(() => {
        if (b.disposed || !g.parent) return false;
        out.follow();
        return true;
      });
      return out;
    },

    /** Five pink ghosts of Buuhan (the Super Ghost Kamikaze Attack, stolen from Gotenks). */
    ghosts(m, count = 5) {
      const b = m.battle;
      const T = SL.Toon;
      const bodyMat = additive(0xffa8d8, 0.7);
      const coreMat = T.makeMat(0xf29ac0, {});
      const faceMat = new THREE.MeshBasicMaterial({ color: 0x3a0a1a });
      const geo = new THREE.SphereGeometry(1, 16, 12);
      const tail = new THREE.ConeGeometry(0.5, 1.2, 10);
      const list = [];
      for (let i = 0; i < count; i++) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(geo, bodyMat);
        body.scale.set(0.42, 0.5, 0.42);
        const head = new THREE.Mesh(geo, coreMat);
        head.scale.setScalar(0.24);
        head.position.y = 0.22;
        T.addOutline(head, 1.4);
        const ant = new THREE.Mesh(tail, coreMat);
        ant.scale.set(0.12, 0.3, 0.12);
        ant.position.set(0, 0.34, -0.2);
        ant.rotation.x = -1.2;
        const tl = new THREE.Mesh(tail, bodyMat);
        tl.position.y = -0.45;
        tl.rotation.x = Math.PI;
        tl.scale.set(0.5, 0.5, 0.5);
        // a mean little face: two slits and a grin
        for (const sx of [1, -1]) {
          const e = new THREE.Mesh(geo, faceMat);
          e.scale.set(0.035, 0.02, 0.01);
          e.position.set(sx * 0.08, 0.26, 0.22);
          g.add(e);
        }
        const grin = new THREE.Mesh(geo, faceMat);
        grin.scale.set(0.09, 0.02, 0.01);
        grin.position.set(0, 0.16, 0.22);
        g.add(body, head, ant, tl, grin);
        g.visible = false;
        b.scene.add(g);
        list.push({ group: g, pos: g.position, alive: true, phase: i * 1.3 });
      }
      own(m, () => {
        for (const x of list) b.scene.remove(x.group);
        geo.dispose();
        tail.dispose();
        bodyMat.dispose();
        coreMat.dispose();
        faceMat.dispose();
      });
      return list;
    },

    /** The Vice Shout's tear: a ragged purple wound in the air that swallows the light. */
    rift(m, pos) {
      const b = m.battle;
      const g = new THREE.Group();
      const discs = [];
      for (let i = 0; i < 4; i++) {
        const d = new THREE.Mesh(new THREE.RingGeometry(0.2 + i * 0.5, 0.5 + i * 0.6, 32, 1), additive(i % 2 ? 0x8a3aff : 0xd070ff, 0.5 - i * 0.08));
        d.material.side = THREE.DoubleSide;
        g.add(d);
        discs.push(d);
      }
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshBasicMaterial({ color: 0x05000a, side: THREE.DoubleSide }));
      g.add(hole);
      g.position.copy(pos);
      g.visible = false;
      b.scene.add(g);
      own(m, () => {
        b.scene.remove(g);
        for (const o of discs.concat([hole])) {
          o.geometry.dispose();
          o.material.dispose();
        }
      });
      return {
        group: g,
        set(k, faceTo) {
          g.visible = k > 0.01;
          g.scale.setScalar(Math.max(0.01, k) * 6);
          if (faceTo) g.lookAt(faceTo);
          discs.forEach((d, i) => (d.rotation.z += 0.02 * (i % 2 ? -1 : 1) * (1 + i)));
          hole.scale.set(1 + Math.sin(b.frame * 0.2) * 0.05, 1 + Math.cos(b.frame * 0.17) * 0.08, 1);
        },
      };
    },

    /** The world's strongest coffee candy: a brown sweet with a paler swirl. */
    candy(m) {
      const b = m.battle;
      const T = SL.Toon;
      const g = new THREE.Group();
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), T.makeMat(0x6a3a1c, { rim: { color: 0xffe0b0, strength: 0.5 } }));
      T.addOutline(ball, 1.5);
      const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 6, 20), T.makeMat(0xc8905a, {}));
      swirl.rotation.x = Math.PI / 2.4;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xffd23a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
      glow.scale.setScalar(0.9);
      g.add(ball, swirl, glow);
      g.visible = false;
      b.scene.add(g);
      own(m, () => {
        b.scene.remove(g);
        ball.geometry.dispose();
        ball.material.dispose();
        swirl.geometry.dispose();
        swirl.material.dispose();
        glow.material.dispose();
      });
      return {
        group: g,
        pos: g.position,
        set(p, speed = 0) {
          g.visible = true;
          g.position.copy(p);
          g.rotation.y += 0.1 + speed * 0.02;
          g.rotation.x += 0.05;
          if (speed > 6 && b.frame % 2 === 0) b.vfx.trail(p, 0xffd890, 0.25, 0.22);
        },
        hide() {
          g.visible = false;
        },
      };
    },

    /**
     * SPEED: he is somewhere else. An afterimage where he was (the model ghost), a small shockwave
     * and a flash where he arrives, the dust shoved off the ground under both, a 'vanish' crack.
     */
    vanishTo(b, f, pos, opts = {}) {
      b.vfx.ghost(f.model, f.ghostColor ? f.ghostColor() : 0xfff0a0, 0.45, 0.6);
      b.vfx.afterimage(f.pos, f.height, 0xfff4c0);
      if (b.stage.hasGround && f.pos.y - b.stage.heightAt(f.pos.x, f.pos.z) < 3) b.vfx.dust(f.pos, 1.6, 8, b.stage.dustColor);
      f.setPosition(pos);
      f.prevPos.copy(pos);
      f.vel.set(0, 0, 0);
      if (opts.face) BK().faceTo(f, opts.face);
      b.vfx.ring(f.chest(), 1.8, 0xfff4c0, 0.25);
      b.vfx.flash(f.chest(), 1.4, 0xffffff, 0.12, SL.Toon.tex.glow);
      if (b.stage.hasGround && pos.y - b.stage.heightAt(pos.x, pos.z) < 3) b.vfx.dust(pos, 1.4, 8, b.stage.dustColor);
      b.sfx('vanish', f, { pitch: opts.pitch || 1.2 });
    },

    /** Levitating stones round a powering-up fighter: rise(k) lifts them; drop() lets them fall. */
    stones(m, f, count = 14) {
      const b = m.battle;
      const T = SL.Toon;
      const col = b.stage.rockColor || 0x8a6446;
      const mat = T.makeMat(col, {});
      const geo = new THREE.DodecahedronGeometry(1, 0);
      const list = [];
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        T.addOutline(mesh, 1.3);
        const a = (i / count) * Math.PI * 2 + (i % 3) * 0.4;
        const r = 2.4 + (i % 4) * 1.1;
        const base = BK().ground(b, f.pos.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r)));
        const s = 0.07 + (i % 5) * 0.04;
        mesh.scale.setScalar(s);
        mesh.position.copy(base);
        mesh.visible = false;
        b.scene.add(mesh);
        list.push({ mesh, base, s, h: 0.8 + (i % 6) * 0.7, spin: 0.01 + (i % 4) * 0.01, fall: 0 });
      }
      own(m, () => {
        for (const x of list) b.scene.remove(x.mesh);
        geo.dispose();
        mat.dispose();
      });
      let dropping = false;
      return {
        rise(k) {
          for (const x of list) {
            x.mesh.visible = true;
            x.mesh.position.set(x.base.x, x.base.y + x.h * k + Math.sin(b.frame * 0.05 + x.h) * 0.08 * k, x.base.z);
            x.mesh.rotation.x += x.spin * k;
            x.mesh.rotation.y += x.spin * 0.7 * k;
          }
        },
        drop() {
          if (dropping) return;
          dropping = true;
          b.onTick(() => {
            if (b.disposed) return false;
            let any = false;
            for (const x of list) {
              if (x.mesh.position.y <= x.base.y) {
                x.mesh.visible = false;
                continue;
              }
              any = true;
              x.fall += 0.02;
              x.mesh.position.y -= x.fall;
            }
            return any;
          });
        },
      };
    },

    /**
     * THE INSIDE OF BUU (stage buu_inside): pink walls closing overhead, ribs, hanging tubes,
     * and the pods — translucent sacs on stalks with the absorbed fighters asleep inside. Returns
     * { pods: [{ pos, mesh, who }], pulse(t) }.
     */
    innards(m, podSpots) {
      const b = m.battle;
      const T = SL.Toon;
      const geos = [], mats = [], objs = [];
      const mk = (geo, mat) => {
        geos.push(geo);
        mats.push(mat);
        const o = new THREE.Mesh(geo, mat);
        objs.push(o);
        return o;
      };
      const wallMat = T.makeMat(0xd0668a, { side: THREE.BackSide });
      // the cavern: a squashed dome over the whole floor
      const dome = mk(new THREE.SphereGeometry(62, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), wallMat);
      dome.scale.set(1, 0.42, 1);
      dome.position.y = -2;
      b.scene.add(dome);
      // ribs arching over, and tubes hanging down
      const ribMat = T.makeMat(0xb04a72, {});
      for (let i = 0; i < 7; i++) {
        const rib = mk(new THREE.TorusGeometry(40 + (i % 3) * 6, 1.4, 8, 40, Math.PI), ribMat);
        rib.rotation.y = (i / 7) * Math.PI;
        rib.scale.y = 0.55;
        rib.position.y = -3;
        b.scene.add(rib);
      }
      const tubeMat = T.makeMat(0xe890b0, {});
      for (let i = 0; i < 14; i++) {
        const a = i * 2.39, r = 12 + (i % 5) * 7;
        const len = 8 + (i % 4) * 4;
        const tube = mk(new THREE.CylinderGeometry(0.5 + (i % 3) * 0.3, 0.9, len, 10), tubeMat);
        tube.position.set(Math.cos(a) * r, 24 - len / 2, Math.sin(a) * r);
        T.addOutline(tube, 1.2);
        b.scene.add(tube);
      }
      // the pods
      const podMat = new THREE.MeshBasicMaterial({ color: 0xffb0d0, transparent: true, opacity: 0.35, depthWrite: false });
      mats.push(podMat);
      const stalkMat = T.makeMat(0xc05880, {});
      const pods = [];
      for (const spot of podSpots) {
        const pod = mk(new THREE.SphereGeometry(1, 20, 14), podMat);
        pod.scale.set(1.05, 1.4, 1.05);
        pod.position.copy(spot.pos).add(new V3(0, 1.4, 0));
        b.scene.add(pod);
        const stalk = mk(new THREE.CylinderGeometry(0.25, 0.4, 30, 8), stalkMat);
        stalk.position.copy(spot.pos).add(new V3(0, 1.4 + 1.4 + 15, 0));
        b.scene.add(stalk);
        pods.push({ pos: pod.position, mesh: pod, stalk, who: spot.who, open: false });
      }
      // the set belongs to the inside of Buu: gone when the story steps back out
      const offStage = b.on('stageChanged', (e) => {
        for (const o of objs) o.visible = e.id === 'buu_inside';
      });
      own(m, () => {
        offStage();
        for (const o of objs) b.scene.remove(o);
        for (const g of geos) g.dispose();
        for (const mt of mats) mt.dispose();
      });
      return {
        pods,
        pulse(t) {
          dome.scale.set(1 + Math.sin(t * 1.1) * 0.01, 0.42 + Math.sin(t * 1.1) * 0.012, 1 + Math.cos(t * 1.1) * 0.01);
          for (const p of pods) if (!p.open) p.mesh.scale.set(1.05 + Math.sin(t * 2 + p.pos.x) * 0.04, 1.4 + Math.sin(t * 2 + p.pos.z) * 0.05, 1.05);
        },
      };
    },

    /** Bits of white cloth coming off somebody (Piccolo's cape disintegrating). */
    shreds(b, f, color = 0xf4f2ee, n = 16) {
      const c = f.chest();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        b.vfx.rock(c.clone().add(new V3(Math.cos(a) * 0.3, U.rand(-0.3, 0.4), Math.sin(a) * 0.3)), new V3(Math.cos(a) * U.rand(2, 5), U.rand(2, 6), Math.sin(a) * U.rand(2, 5)), U.rand(0.05, 0.12), color);
      }
    },

    /** Teeth knocked out: small white chips flying from a point. */
    teeth(b, pos, dir) {
      for (let i = 0; i < 6; i++) b.vfx.rock(pos.clone(), dir.clone().multiplyScalar(U.rand(4, 9)).add(new V3(U.rand(-2, 2), U.rand(1, 4), U.rand(-2, 2))), U.rand(0.03, 0.05), 0xfaf8f0);
    },

    /** Steam out of a Majin's head vents and all over him (a mutation). */
    steam(b, f, k = 1) {
      const c = f.chest();
      if (b.frame % 2 === 0) b.vfx.smoke.emit(c.x + U.rand(-0.4, 0.4), c.y + 0.9, c.z + U.rand(-0.4, 0.4), U.rand(-1.5, 1.5), U.rand(2, 5), U.rand(-1.5, 1.5), 1, 0.8, 0.9, 0.5 * k, 0.6 + k * 0.6, 1.3, { grow: 2.2, drag: 1 });
    },

    /** Two bodies in turn, every few frames — a body changing into another (hide/show). */
    flicker(b, a, c, k) {
      const alt = Math.floor(b.frame / (k > 0.7 ? 2 : 4)) % 2 === 0;
      a.setHidden(!alt);
      c.setHidden(alt);
    },
  });
})();
