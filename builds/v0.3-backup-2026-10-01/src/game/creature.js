/*
 * Creatures: non-humanoid wildlife and monsters that live outside the fighter
 * framework (they do not use the humanoid rig). Used for story set pieces:
 * Chapter 2's dinosaur chase. Each creature owns a procedural model, a small
 * state machine (idle / stalk / charge / bite / roar / stagger / flee) and
 * procedural locomotion (walk cycle, tail and head springs, footstep shakes).
 *
 * PROTOTYPE ART: built from primitives like the fighters.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;

  function mat(color) {
    return SL.Toon.makeMat(color, { rim: { color: 0xfff4e0, strength: 0.25 } });
  }
  function part(parent, geo, color, o = {}) {
    const m = new THREE.Mesh(geo, o.material || mat(color));
    if (o.pos) m.position.set(o.pos[0], o.pos[1], o.pos[2]);
    if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    if (o.scale) m.scale.set(o.scale[0], o.scale[1], o.scale[2]);
    m.castShadow = true;
    if (o.outline !== 0) SL.Toon.addOutline(m, o.outline || 1.4);
    parent.add(m);
    return m;
  }

  /* ---------------- T-Rex model ---------------- */
  function buildTrex(c) {
    const skin = 0x6e8a3c, belly = 0xb8b070, dark = 0x4a5e2a;
    const root = new THREE.Group();
    const sphere = new THREE.SphereGeometry(1, 20, 14);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const cone = new THREE.ConeGeometry(1, 1, 6);
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 10);
    c.geos = [sphere, box, cone, cyl];

    const hips = new THREE.Group();
    hips.position.y = 3.3;
    root.add(hips);
    const body = new THREE.Group();
    hips.add(body);
    part(body, sphere, skin, { pos: [0, 0.4, 0.6], scale: [1.35, 1.35, 2.5], rot: [-0.18, 0, 0] });
    part(body, sphere, belly, { pos: [0, -0.15, 1.2], scale: [1.05, 0.9, 1.8], rot: [-0.2, 0, 0], outline: 0.8 });
    // back ridge
    for (let i = 0; i < 7; i++) part(body, cone, dark, { pos: [0, 1.65 - i * 0.05, -0.8 + i * 0.55], scale: [0.14, 0.45, 0.3], rot: [-0.3, 0, 0], outline: 0.6 });

    // neck and head
    const neck = new THREE.Group();
    neck.position.set(0, 1.0, 2.6);
    body.add(neck);
    part(neck, cyl, skin, { pos: [0, 0.35, 0.3], scale: [0.72, 1.4, 0.72], rot: [0.9, 0, 0] });
    const head = new THREE.Group();
    head.position.set(0, 1.0, 1.2);
    neck.add(head);
    part(head, sphere, skin, { pos: [0, 0.25, 0.4], scale: [0.95, 0.8, 1.2] });
    part(head, box, skin, { pos: [0, 0.2, 1.55], scale: [1.2, 0.7, 1.7], outline: 1.2 });
    part(head, box, dark, { pos: [0, 0.62, 0.9], scale: [1.25, 0.18, 0.9], outline: 0.8 });
    for (const s of [1, -1]) {
      part(head, sphere, 0xffd23a, { pos: [s * 0.55, 0.52, 0.95], scale: [0.14, 0.14, 0.14], outline: 0.5 });
      part(head, sphere, 0x111111, { pos: [s * 0.62, 0.53, 1.0], scale: [0.06, 0.1, 0.06], outline: 0 });
      part(head, cone, dark, { pos: [s * 0.45, 0.8, 0.7], scale: [0.12, 0.35, 0.12], rot: [-0.8, 0, s * 0.5], outline: 0.5 });
    }
    const upperTeeth = new THREE.Group();
    upperTeeth.position.set(0, -0.18, 1.55);
    head.add(upperTeeth);
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.05, 0.35);
    head.add(jaw);
    part(jaw, box, skin, { pos: [0, -0.3, 1.1], scale: [1.05, 0.38, 1.7], outline: 1.1 });
    part(jaw, box, 0x8a2a2a, { pos: [0, -0.1, 1.05], scale: [0.85, 0.08, 1.45], outline: 0 });
    const toothMat = mat(0xf4f0e0);
    for (let i = 0; i < 6; i++) {
      for (const s of [1, -1]) {
        part(upperTeeth, cone, 0, { material: toothMat, pos: [s * 0.5, -0.1, -0.7 + i * 0.26], scale: [0.07, 0.22, 0.07], rot: [Math.PI, 0, 0], outline: 0 });
        part(jaw, cone, 0, { material: toothMat, pos: [s * 0.45, 0.02, 0.45 + i * 0.24], scale: [0.06, 0.18, 0.06], outline: 0 });
      }
    }

    // tiny arms
    for (const s of [1, -1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 1.0, 0.1, 2.2);
      body.add(arm);
      part(arm, cyl, skin, { pos: [0, -0.35, 0.1], scale: [0.14, 0.7, 0.14], rot: [0.6, 0, 0] });
      part(arm, cone, 0xe8e0c8, { pos: [0, -0.7, 0.45], scale: [0.06, 0.2, 0.06], rot: [2.2, 0, 0], outline: 0 });
      c['arm' + (s > 0 ? 'L' : 'R')] = arm;
    }

    // legs
    const legs = [];
    for (const s of [1, -1]) {
      const thigh = new THREE.Group();
      thigh.position.set(s * 1.05, 0, 0.1);
      hips.add(thigh);
      part(thigh, sphere, skin, { pos: [0, -0.7, 0.1], scale: [0.62, 1.2, 0.8] });
      const knee = new THREE.Group();
      knee.position.set(0, -1.7, 0.35);
      thigh.add(knee);
      part(knee, cyl, skin, { pos: [0, -0.55, -0.25], scale: [0.3, 1.25, 0.3], rot: [-0.45, 0, 0] });
      const foot = new THREE.Group();
      foot.position.set(0, -1.15, -0.5);
      knee.add(foot);
      part(foot, box, dark, { pos: [0, -0.1, 0.45], scale: [0.6, 0.25, 1.1], outline: 1 });
      for (let k = -1; k <= 1; k++) part(foot, cone, 0xe8e0c8, { pos: [k * 0.2, -0.12, 1.05], scale: [0.07, 0.25, 0.07], rot: [Math.PI / 2, 0, 0], outline: 0 });
      legs.push({ thigh, knee, foot, side: s });
    }

    // tail: chain of segments with spring sway
    const tail = [];
    let parent = hips;
    let z = -1.6;
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Group();
      seg.position.set(0, i === 0 ? 0.5 : 0, z);
      parent.add(seg);
      const r = 0.95 - i * 0.14;
      part(seg, cone, skin, { pos: [0, 0, -0.65], scale: [r, 1.5, r * 0.9], rot: [-Math.PI / 2, 0, 0], outline: 1 });
      tail.push({ seg, spring: new SL.Spring(30, 5) });
      parent = seg;
      z = -1.2;
    }

    Object.assign(c, { root, hips, body, neck, head, jaw, legs, tail });
    return root;
  }

  const CREATURES = (SL.data.creatures = SL.data.creatures || {});
  CREATURES.trex = {
    id: 'trex',
    name: 'Wild Dinosaur',
    build: buildTrex,
    scale: 1.15,
    radius: 2.4,
    height: 7,
    walkSpeed: 5.5,
    runSpeed: 12.2,
    turnRate: 2.4,
    bite: { range: 5.2, windup: 22, recovery: 34, damage: 850 },
    hp: 20000,
  };

  /* ---------------- Gregory (King Kai's cricket) ---------------- */
  function buildGregory(c) {
    const root = new THREE.Group();
    const sphere = new THREE.SphereGeometry(1, 16, 12);
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
    const plane = new THREE.PlaneGeometry(1, 1);
    c.geos = [sphere, cyl, plane];
    const body = new THREE.Group();
    body.position.y = 0.6;
    root.add(body);
    part(body, sphere, 0x5ac03a, { scale: [0.32, 0.3, 0.46] });
    const head = new THREE.Group();
    head.position.set(0, 0.28, 0.36);
    body.add(head);
    part(head, sphere, 0x6ad04a, { scale: [0.26, 0.24, 0.24] });
    for (const s of [1, -1]) {
      part(head, sphere, 0xffffff, { pos: [s * 0.14, 0.08, 0.16], scale: [0.1, 0.12, 0.08], outline: 0.5 });
      part(head, sphere, 0x111111, { pos: [s * 0.15, 0.08, 0.23], scale: [0.04, 0.06, 0.03], outline: 0 });
      part(head, cyl, 0x2a6a1a, { pos: [s * 0.08, 0.32, 0.02], scale: [0.012, 0.4, 0.012], rot: [-0.3, 0, s * 0.3], outline: 0 });
    }
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xd8ffd0, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    const wings = [];
    for (const s of [1, -1]) {
      const w = new THREE.Group();
      w.position.set(s * 0.12, 0.22, -0.05);
      body.add(w);
      const m = new THREE.Mesh(plane, wingMat);
      m.scale.set(0.5, 0.2, 1);
      m.position.x = s * 0.26;
      w.add(m);
      wings.push({ w, side: s });
    }
    for (let i = 0; i < 3; i++) for (const s of [1, -1]) part(body, cyl, 0x2a6a1a, { pos: [s * 0.2, -0.22, -0.15 + i * 0.15], scale: [0.02, 0.3, 0.02], rot: [0, 0, s * 0.6], outline: 0 });
    c.wingMat = wingMat;
    Object.assign(c, { root, body, head, wings, legs: [], tail: [], hips: body, neck: head, jaw: head });
    return root;
  }

  CREATURES.gregory = {
    id: 'gregory',
    name: 'Gregory',
    build: buildGregory,
    scale: 1,
    radius: 0.4,
    height: 1,
    flyer: true,
    update(c) {
      const b = c.battle, t = c.target, f = c.stateFrame;
      c.sd.next = c.sd.next || 0;
      const home = c.sd.home || (c.sd.home = c.pos.clone());
      if (f >= c.sd.next || !c.sd.goal) {
        const ang = Math.random() * Math.PI * 2, rad = 3 + Math.random() * 9;
        c.sd.goal = new V3(home.x + Math.cos(ang) * rad, 0, home.z + Math.sin(ang) * rad);
        // hovers around head height of a grown fighter, so a jump or a rising strike can reach
        c.sd.goal.y = b.stage.heightAt(c.sd.goal.x, c.sd.goal.z) + 0.9 + Math.random() * 1.3;
        c.sd.next = f + 30 + Math.floor(Math.random() * 45);
      }
      // reads each incoming strike once and may dart away from it
      if (t && t.state === 'attack' && c.sd.readSd !== t.sd && t.pos.distanceTo(c.pos) < 3.6) {
        c.sd.readSd = t.sd;
        if (Math.random() < (c.sd.dodgeChance === undefined ? 0.5 : c.sd.dodgeChance)) {
          const away = c.pos.clone().sub(t.pos).setY(0.2).normalize();
          c.sd.goal = c.pos.clone().addScaledVector(away, 5);
          c.sd.dodging = 12;
          c.sd.next = f + 25;
          c.sd.dodges = (c.sd.dodges || 0) + 1;
          b.sfx('dodge', null, { at: c.pos, vol: 0.6, pitch: 1.6 });
        }
      }
      if (c.sd.dodging > 0) c.sd.dodging--;
      const to = c.sd.goal.clone().sub(c.pos);
      const d = to.length();
      const speed = Math.min(c.sd.dodging > 0 ? 22 : 10, d * (c.sd.dodging > 0 ? 8 : 3));
      if (d > 0.01) c.vel.copy(to.multiplyScalar(speed / d));
      c.pos.addScaledVector(c.vel, TICK);
      b.stage.clampPosition(c.pos);
      const gh = b.stage.heightAt(c.pos.x, c.pos.z) + 0.8;
      if (c.pos.y < gh) c.pos.y = gh;
      if (c.vel.lengthSq() > 0.5) c.yaw = U.dampAngle(c.yaw, Math.atan2(c.vel.x, c.vel.z), 8, TICK);
    },
    render(c, dt) {
      const flap = Math.sin(performance.now() * 0.08);
      for (const w of c.wings) w.w.rotation.z = w.side * (0.3 + flap * 0.8);
      c.body.rotation.x = U.clamp(c.vel.length() * 0.03, 0, 0.4);
    },
  };

  class Creature {
    constructor(battle, def, opts = {}) {
      this.battle = battle;
      this.def = def;
      this.alive = true;
      this.pos = (opts.pos || new V3()).clone();
      this.prevPos = this.pos.clone();
      this.yaw = opts.yaw || 0;
      this.vel = new V3();
      this.state = 'idle';
      this.stateFrame = 0;
      this.sd = {};
      this.target = opts.target || null;
      this.scale = def.scale || 1;
      this.phase = 0;
      this.jawOpen = 0;
      this.headPitch = 0;
      this.tilt = 0;
      this.object = new THREE.Group();
      this.object.add(def.build(this));
      this.object.scale.setScalar(this.scale);
      battle.scene.add(this.object);
      this.object.position.copy(this.pos);
      battle.creatures.push(this);
    }

    get radius() {
      return this.def.radius * this.scale;
    }

    headPos(out = new V3()) {
      this.head.updateMatrixWorld(true);
      return this.head.getWorldPosition(out);
    }

    setState(name, data) {
      this.state = name;
      this.stateFrame = 0;
      this.sd = data || {};
    }

    roar() {
      this.setState('roar', {});
    }

    /** A big hit (e.g. Gohan's outburst) knocks the creature over. */
    knockOver(dir) {
      this.setState('stagger', { dir: dir.clone().setY(0).normalize() });
      this.battle.sfx('groundImpact', null, { at: this.pos, vol: 1.2 });
    }

    flee(from) {
      this.setState('flee', { from: from.clone() });
    }

    update() {
      if (!this.alive) return;
      this.prevPos.copy(this.pos);
      this.stateFrame++;
      const b = this.battle, d = this.def, t = this.target;
      const f = this.stateFrame;
      if (d.update) {
        d.update(this);
        return;
      }
      let speed = 0;
      const faceTo = (p, rate) => {
        const want = Math.atan2(p.x - this.pos.x, p.z - this.pos.z);
        this.yaw = U.dampAngle(this.yaw, want, rate, TICK);
      };
      switch (this.state) {
        case 'idle':
          if (t) faceTo(t.pos, 1.2);
          this.jawOpen = U.damp(this.jawOpen, 0.08 + Math.sin(f * 0.05) * 0.05, 4, TICK);
          break;
        case 'stalk':
        case 'charge': {
          if (!t) break;
          faceTo(t.pos, d.turnRate);
          const dist = Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
          speed = this.state === 'charge' ? d.runSpeed * (this.sd.speedMul || 1) : d.walkSpeed;
          if (dist < d.bite.range * this.scale * 0.9 && t.alive) this.setState('bite', { resume: this.state });
          this.jawOpen = U.damp(this.jawOpen, this.state === 'charge' ? 0.35 : 0.12, 5, TICK);
          break;
        }
        case 'bite': {
          if (t) faceTo(t.pos, 4);
          const bt = d.bite;
          if (f < bt.windup) {
            this.jawOpen = U.damp(this.jawOpen, 1, 10, TICK);
            this.headPitch = U.damp(this.headPitch, -0.45, 8, TICK);
            speed = d.walkSpeed * 0.4;
          } else if (f === bt.windup) {
            this.jawOpen = 0;
            this.headPitch = 1.1;
            b.sfx('punchHeavy', null, { at: this.headPos(), pitch: 0.55, vol: 1.3 });
            const hp = this.headPos();
            // the snap reaches down to the ground in front of the head
            const reach = Math.hypot(t ? t.pos.x - hp.x : 99, t ? t.pos.z - hp.z : 99);
            if (t && t.alive && reach < 3.2 * this.scale && t.pos.y < hp.y + 1.5 && t.state !== 'dodge') {
              const dir = t.pos.clone().sub(this.pos).setY(0).normalize().setY(0.35).normalize();
              t.takeHit(null, { type: 'melee', damage: bt.damage, knock: 'heavy', knockSpeed: 22, hitstun: 40, impact: 3, dir, point: hp });
              b.emit('creatureBite', { creature: this, target: t });
            }
            b.camera.addTrauma(0.15);
          } else {
            this.headPitch = U.damp(this.headPitch, 0, 5, TICK);
            if (f > bt.windup + bt.recovery) this.setState(this.sd.resume || 'stalk');
          }
          break;
        }
        case 'roar':
          this.headPitch = U.damp(this.headPitch, -0.7, 4, TICK);
          this.jawOpen = U.damp(this.jawOpen, 1.1, 6, TICK);
          if (f === 8) {
            b.sfx('roar', null, { at: this.headPos(), vol: 1.4 });
            b.camera.addTrauma(0.5);
          }
          if (f > 8 && f % 6 === 0) b.vfx.ring(this.headPos(), 3 + (f % 18) * 0.3, 0xffffff, 0.3);
          if (f >= 90) this.setState(this.sd.then || 'idle');
          break;
        case 'stagger': {
          // topple sideways, lie still, get up
          const k = U.clamp01(f / 26);
          this.tilt = U.easeOutCubic(k) * 1.35;
          if (f < 20) this.pos.addScaledVector(this.sd.dir, 7 * TICK);
          if (f === 26) {
            b.vfx.dust(this.pos, 7, 30);
            b.camera.addTrauma(0.6);
            b.sfx('groundImpact', null, { at: this.pos, vol: 1.3 });
          }
          this.jawOpen = U.damp(this.jawOpen, 0.6, 3, TICK);
          if (f > 150) {
            this.tilt = U.damp(this.tilt, 0, 3, TICK);
            if (f > 210) {
              this.tilt = 0;
              this.setState(this.sd.then || 'idle');
            }
          }
          break;
        }
        case 'flee': {
          const away = this.pos.clone().sub(this.sd.from).setY(0);
          if (away.lengthSq() < 0.01) away.set(1, 0, 0);
          faceTo(this.pos.clone().add(away), 3);
          speed = d.runSpeed * 0.9;
          if (f === 1) b.sfx('roar', null, { at: this.headPos(), vol: 0.7, pitch: 1.6 });
          if (f > 300) this.dispose();
          break;
        }
      }

      if (speed > 0) {
        const fwd = new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
        this.vel.x = U.damp(this.vel.x, fwd.x * speed, 5, TICK);
        this.vel.z = U.damp(this.vel.z, fwd.z * speed, 5, TICK);
      } else {
        this.vel.x = U.damp(this.vel.x, 0, 6, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 6, TICK);
      }
      this.pos.addScaledVector(this.vel, TICK);
      const st = b.stage;
      // knock down trees and push fighters out of the body
      st.clampPosition(this.pos);
      if (st.hasGround) this.pos.y = st.heightAt(this.pos.x, this.pos.z);
      for (const fi of b.fighters) {
        if (!fi.alive) continue;
        const dx = fi.pos.x - this.pos.x, dz = fi.pos.z - this.pos.z;
        const dd = Math.hypot(dx, dz);
        const minD = this.radius + fi.radius;
        if (dd < minD && dd > 0.01 && fi.pos.y < this.pos.y + this.def.height * this.scale * 0.7) {
          fi.pos.x = this.pos.x + (dx / dd) * minD;
          fi.pos.z = this.pos.z + (dz / dd) * minD;
        }
      }
      // footsteps
      const hs = Math.hypot(this.vel.x, this.vel.z);
      this.phase += hs * TICK * 0.55;
      const step = Math.floor(this.phase / Math.PI);
      if (step !== this._lastStep && hs > 1) {
        this._lastStep = step;
        const shake = U.clamp(hs / 14, 0.05, 0.22);
        b.cameraTraumaAt(this.pos, shake);
        b.vfx.dust(this.pos.clone().add(new V3(Math.cos(this.yaw) * (step % 2 ? 1.2 : -1.2), 0, 0)), 1.6, 5);
        b.sfx('groundImpact', null, { at: this.pos, vol: 0.35, pitch: 0.7 });
      }
    }

    render(dt, alpha) {
      if (!this.alive) return;
      const p = this.object.position.lerpVectors(this.prevPos, this.pos, alpha);
      this.object.rotation.set(0, this.yaw, 0);
      this.object.rotateZ(this.tilt);
      if (this.def.render) {
        this.def.render(this, dt);
        return;
      }
      const hs = Math.hypot(this.vel.x, this.vel.z);
      const run = U.clamp01(hs / this.def.runSpeed);
      const ph = this.phase;
      for (const leg of this.legs) {
        const s = Math.sin(ph + (leg.side > 0 ? 0 : Math.PI));
        const amp = 0.25 + run * 0.45;
        leg.thigh.rotation.x = -s * amp;
        leg.knee.rotation.x = Math.max(0, Math.cos(ph + (leg.side > 0 ? 0 : Math.PI))) * amp * 1.2;
        leg.foot.rotation.x = s * amp * 0.5;
      }
      this.hips.position.y = 3.3 + Math.abs(Math.cos(ph)) * 0.12 * (0.3 + run);
      this.body.rotation.x = 0.1 + run * 0.18;
      this.body.rotation.z = Math.sin(ph) * 0.04;
      this.neck.rotation.x = this.headPitch * 0.5;
      this.head.rotation.x = this.headPitch * 0.6 + Math.sin(performance.now() * 0.002) * 0.03;
      this.jaw.rotation.x = this.jawOpen * 0.7;
      let sway = Math.sin(ph * 0.5) * 0.18 * (0.3 + run);
      for (let i = 0; i < this.tail.length; i++) {
        const t = this.tail[i];
        const target = sway * (0.6 + i * 0.25) + (this._lastYaw !== undefined ? U.wrapAngle(this._lastYaw - this.yaw) * 2 : 0);
        t.seg.rotation.y = t.spring.step(target, dt);
        t.seg.rotation.x = 0.08 + run * 0.04;
      }
      this._lastYaw = this.yaw;
    }

    dispose() {
      if (!this.alive) return;
      this.alive = false;
      if (this.object.parent) this.object.parent.remove(this.object);
      this.object.traverse((o) => {
        if (o.material && o.material.dispose && !o.userData.isOutline) o.material.dispose();
      });
      for (const g of this.geos || []) g.dispose();
      if (this.wingMat) this.wingMat.dispose();
      const i = this.battle.creatures.indexOf(this);
      if (i >= 0) this.battle.creatures.splice(i, 1);
    }
  }

  SL.Creature = Creature;
})();
