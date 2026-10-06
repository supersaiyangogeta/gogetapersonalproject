/*
 * Animator: pose-based animation with exponential blending.
 * A pose is { jointName: [x, y, z] degrees, root: {y, rx, ry, rz}, hands: [L, R] }.
 * Poses may also be functions (t, ctx) => pose for cycles (run, flight).
 * Snappy strikes use a high blend speed; wind-ups use a low one, which gives
 * anticipation and follow-through without hand-keyed curves.
 *
 * V0.2: timed pose sequences (intros, victories, transformations), hand
 * shapes per pose, squash & stretch, and additive banking/lean layers.
 */
(function () {
  'use strict';
  const DEG = Math.PI / 180;
  const JOINTS = ['hips', 'spine', 'chest', 'neck', 'head', 'shoulderL', 'elbowL', 'handL', 'shoulderR', 'elbowR', 'handR', 'thighL', 'kneeL', 'footL', 'thighR', 'kneeR', 'footR'];
  const ZERO = [0, 0, 0];
  const ROOT0 = { y: 0, rx: 0, ry: 0, rz: 0 };

  const tmpE = new THREE.Euler();
  const tmpQ = new THREE.Quaternion();
  const addQ = new THREE.Quaternion();

  function mirrorPose(p) {
    if (typeof p === 'function') return (t, c) => mirrorPose(p(t, c));
    const out = {};
    for (const k of Object.keys(p)) {
      const v = p[k];
      if (k === 'root') {
        out.root = { y: v.y || 0, rx: v.rx || 0, ry: -(v.ry || 0), rz: -(v.rz || 0) };
        continue;
      }
      if (k === 'hands') {
        out.hands = [v[1], v[0]];
        continue;
      }
      let name = k;
      if (k.endsWith('L')) name = k.slice(0, -1) + 'R';
      else if (k.endsWith('R')) name = k.slice(0, -1) + 'L';
      out[name] = [v[0], -v[1], -v[2]];
    }
    return out;
  }

  /** Linear blend of two static poses (degrees). */
  function blendPoses(a, b, t) {
    const out = {};
    for (const j of JOINTS) {
      const pa = a[j] || ZERO, pb = b[j] || ZERO;
      out[j] = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t];
    }
    const ra = a.root || ROOT0, rb = b.root || ROOT0;
    out.root = {
      y: (ra.y || 0) + ((rb.y || 0) - (ra.y || 0)) * t,
      rx: (ra.rx || 0) + ((rb.rx || 0) - (ra.rx || 0)) * t,
      ry: (ra.ry || 0) + ((rb.ry || 0) - (ra.ry || 0)) * t,
      rz: (ra.rz || 0) + ((rb.rz || 0) - (ra.rz || 0)) * t,
    };
    out.hands = t < 0.5 ? a.hands : b.hands;
    return out;
  }

  /** Returns a copy of a pose with some joints overridden (for small variants). */
  function withPose(base, over) {
    return Object.assign({}, base, over);
  }

  class Animator {
    constructor(model, poses) {
      this.model = model;
      this.poses = poses;
      this.cur = {};
      for (const j of JOINTS) this.cur[j] = new THREE.Quaternion();
      this.root = { y: 0, rx: 0, ry: 0, rz: 0 };
      this.name = 'idle';
      this.speed = 10;
      this.start = 0;
      this.time = 0;
      this.ctx = null;
      this.breathe = 1;
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.leanX = 0;
      this.leanZ = 0;
      this.shake = 0;
      this.squash = 0;
      this.seq = null;
    }

    has(name) {
      return !!this.poses[name];
    }

    play(name, speed = 10, opts = {}) {
      if (this.seq && !opts.fromSequence) this.seq = null;
      if (!this.poses[name]) {
        if (!this._warned) this._warned = new Set();
        if (!this._warned.has(name)) {
          SL.warn('missing pose', name, 'for', this.model.def.id);
          this._warned.add(name);
        }
        name = 'idle';
      }
      if (name !== this.name || opts.restart) this.start = this.time;
      this.name = name;
      this.speed = speed;
      if (opts.snap) this.snap();
    }

    /**
     * Timed sequence: steps [{ pose, dur (s), speed, expression, onStart }].
     * Holds the last pose unless opts.loop. opts.onEnd fires once.
     */
    playSequence(steps, opts = {}) {
      if (!steps || !steps.length) return;
      this.seq = { steps, i: -1, t: 0, loop: !!opts.loop, onEnd: opts.onEnd };
      this._advance();
    }

    get inSequence() {
      return !!this.seq;
    }

    _advance() {
      const s = this.seq;
      s.i++;
      if (s.i >= s.steps.length) {
        if (s.loop) s.i = 0;
        else {
          const end = s.onEnd;
          this.seq = null;
          if (end) end();
          return;
        }
      }
      s.t = 0;
      const step = s.steps[s.i];
      this.play(step.pose, step.speed || 8, { fromSequence: true, restart: true });
      if (step.expression) this.model.setExpression(step.expression);
      if (step.onStart) step.onStart();
    }

    resolve(name) {
      let p = this.poses[name] || this.poses.idle;
      if (typeof p === 'function') p = p(this.time - this.start, this.ctx);
      return p;
    }

    snap() {
      const p = this.resolve(this.name);
      for (const j of JOINTS) {
        const e = p[j] || ZERO;
        tmpE.set(e[0] * DEG, e[1] * DEG, e[2] * DEG);
        this.cur[j].setFromEuler(tmpE);
      }
      const r = p.root || ROOT0;
      this.root.y = r.y || 0;
      this.root.rx = (r.rx || 0) * DEG;
      this.root.ry = (r.ry || 0) * DEG;
      this.root.rz = (r.rz || 0) * DEG;
    }

    update(dt) {
      this.time += dt;
      if (this.seq) {
        this.seq.t += dt;
        const step = this.seq.steps[this.seq.i];
        if (step && step.dur !== undefined && this.seq.t >= step.dur) this._advance();
      }
      const p = this.resolve(this.name);
      const k = 1 - Math.exp(-this.speed * dt);
      const J = this.model.joints;
      for (const j of JOINTS) {
        const e = p[j] || ZERO;
        tmpE.set(e[0] * DEG, e[1] * DEG, e[2] * DEG);
        tmpQ.setFromEuler(tmpE);
        this.cur[j].slerp(tmpQ, k);
        J[j].quaternion.copy(this.cur[j]);
      }
      if (this.model.setHands) {
        const h = p.hands || ['fist', 'fist'];
        this.model.setHands(h[0], h[1]);
      }
      const r = p.root || ROOT0;
      const rk = 1 - Math.exp(-Math.min(this.speed, 18) * dt);
      this.root.y += ((r.y || 0) - this.root.y) * rk;
      this.root.rx += ((r.rx || 0) * DEG + this.leanX - this.root.rx) * rk;
      this.root.ry += ((r.ry || 0) * DEG - this.root.ry) * rk;
      this.root.rz += ((r.rz || 0) * DEG + this.leanZ - this.root.rz) * rk;

      const pivot = this.model.pivot;
      const baseY = this.model.b.hipY;
      pivot.position.y = baseY + this.root.y;
      pivot.rotation.set(this.root.rx, this.root.ry, this.root.rz);

      // additive layers
      if (this.breathe > 0) {
        tmpE.set(Math.sin(this.time * 2.1) * 0.022 * this.breathe, 0, 0);
        addQ.setFromEuler(tmpE);
        J.chest.quaternion.multiply(addQ);
        pivot.position.y += Math.sin(this.time * 2.1 + 1) * 0.006 * this.breathe;
      }
      if (this.lookYaw || this.lookPitch) {
        tmpE.set(this.lookPitch, this.lookYaw, 0);
        addQ.setFromEuler(tmpE);
        J.head.quaternion.multiply(addQ);
      }
      if (this.shake > 0) {
        this.shake -= dt;
        const s = Math.min(1, this.shake * 8) * 0.03;
        pivot.position.x = (Math.random() - 0.5) * s;
        pivot.position.z = (Math.random() - 0.5) * s;
      } else {
        pivot.position.x = 0;
        pivot.position.z = 0;
      }
      // squash & stretch: positive squashes (impact, landing), negative stretches (launch)
      if (Math.abs(this.squash) > 0.002) {
        const s = this.squash;
        pivot.scale.set(1 + s * 0.5, 1 - s, 1 + s * 0.5);
        this.squash *= Math.exp(-14 * dt);
      } else if (pivot.scale.y !== 1) pivot.scale.set(1, 1, 1);
    }
  }

  SL.Animator = Animator;
  SL.Anim = { JOINTS, mirror: mirrorPose, blend: blendPoses, with: withPose };
})();
