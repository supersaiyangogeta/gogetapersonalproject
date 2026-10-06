/*
 * Projectiles: ki blasts, energy balls, javelins, beams and the Spirit Bomb.
 * Beams are persistent objects with a growing head; they can hit fighters,
 * carve terrain, destroy rock spires, and clash with opposing beams.
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;
  const UP = new V3(0, 1, 0);

  let coreGeo = null;
  function getCoreGeo() {
    if (!coreGeo) coreGeo = new THREE.SphereGeometry(1, 14, 10);
    return coreGeo;
  }

  class Projectiles {
    constructor(battle) {
      this.battle = battle;
      this.scene = battle.scene;
      this.list = [];
      this.beams = [];
      this.bombs = [];
      this.orbs = [];
      this.meshPool = [];
    }

    chargeOrb(color) {
      let s = this.orbs.find((o) => !o.visible);
      if (!s) {
        // soft colored halo with a hot white core, so the orb reads without hiding the body
        s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 }));
        s.renderOrder = 12;
        const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: 0xffffff }));
        core.scale.setScalar(0.42);
        core.renderOrder = 13;
        s.add(core);
        this.scene.add(s);
        this.orbs.push(s);
      }
      s.material.color.set(color);
      s.visible = true;
      return s;
    }

    _visual(p) {
      let v = this.meshPool.find((m) => !m.group.visible);
      if (!v) {
        const group = new THREE.Group();
        const core = new THREE.Mesh(getCoreGeo(), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        glow.renderOrder = 12;
        group.add(core, glow);
        this.scene.add(group);
        v = { group, core, glow };
        this.meshPool.push(v);
      }
      v.core.material.color.set(p.core || 0xffffff);
      v.glow.material.color.set(p.color);
      const r = p.radius;
      if (p.kind === 'javelin') {
        v.core.scale.set(r * 0.35, r * 0.35, r * 3.2);
        v.glow.scale.setScalar(r * 5);
      } else {
        v.core.scale.setScalar(r * 0.62);
        v.glow.scale.setScalar(r * (p.kind === 'blast' ? 4.2 : 4.8));
      }
      v.group.visible = true;
      return v;
    }

    spawnBlast(owner, origin, dir, params) {
      const p = {
        ...params,
        owner,
        team: owner.team,
        pos: origin.clone(),
        vel: dir.clone().normalize().multiplyScalar(params.speed),
        speed: params.speed,
        life: params.life || 2.5,
        alive: true,
        target: owner.target,
      };
      p.visual = this._visual(p);
      p.visual.group.position.copy(p.pos);
      this.list.push(p);
      return p;
    }

    spawnBeam(owner, spec, frac) {
      const b = new Beam(this.battle, owner, spec, frac);
      this.beams.push(b);
      return b;
    }

    spawnSpiritBomb(owner, spec) {
      const b = new SpiritBomb(this.battle, owner, spec);
      this.bombs.push(b);
      return b;
    }

    update() {
      const battle = this.battle;
      for (const p of this.list) {
        if (!p.alive) continue;
        if (battle.isFrozen(p.owner)) continue;
        p.life -= TICK;
        if (p.life <= 0) {
          this._explode(p, true);
          continue;
        }
        const t = p.target;
        if (p.homing && t && t.alive) {
          const to = t.chest().sub(p.pos);
          const dist = to.length();
          to.divideScalar(Math.max(0.001, dist));
          const cur = p.vel.clone().normalize();
          if (cur.dot(to) > 0.2 && dist > 1.5) {
            cur.lerp(to, U.clamp01(p.homing * TICK * 2.2)).normalize();
            p.vel.copy(cur).multiplyScalar(p.speed);
          }
        }
        p.pos.addScaledVector(p.vel, TICK);
        p.visual.group.position.copy(p.pos);
        if (p.kind === 'javelin') p.visual.core.quaternion.setFromUnitVectors(new V3(0, 0, 1), p.vel.clone().normalize());
        if (battle.frame % (p.kind === 'blast' ? 2 : 1) === 0) battle.vfx.trail(p.pos, p.color, p.radius * (p.kind === 'blast' ? 1.4 : 1.8), 0.18);

        // fighters
        let consumed = false;
        for (const f of battle.fighters) {
          if (!f.alive || f.team === p.team) continue;
          if (f.capsuleDistance(p.pos) > p.radius + f.radius) continue;
          // deflect with a heavy strike
          if (p.kind === 'blast' && f.state === 'attack' && f.sd.kind === 'heavy' && f.stateFrame >= f.sd.startup && f.stateFrame < f.sd.startup + f.sd.move.active + 2) {
            this._deflect(p, f);
            consumed = true;
            break;
          }
          const res = f.takeHit(p.owner, {
            type: 'ki', damage: p.damage, knock: p.knock, knockSpeed: p.knockSpeed, hitstun: p.hitstun, impact: p.impact,
            dir: p.vel.clone().normalize(), point: p.pos.clone(), color: p.color, guardPierce: p.guardPierce, sfx: 'kiBlast',
          });
          if (res === 'miss' || res === 'vanished') continue;
          this._explode(p, false, f);
          consumed = true;
          break;
        }
        if (consumed) continue;

        // other projectiles
        for (const q of this.list) {
          if (q === p || !q.alive || q.team === p.team) continue;
          if (q.pos.distanceTo(p.pos) < q.radius + p.radius) {
            const pBig = p.radius >= q.radius * 1.8, qBig = q.radius >= p.radius * 1.8;
            if (!pBig) this._explode(p, false);
            if (!qBig) this._explode(q, false);
            break;
          }
        }
        if (!p.alive) continue;
        const hit = battle.stage.collideSphere(p.pos, p.radius);
        if (hit) this._explode(p, hit.type === 'bounds', null, hit);
      }
      this.list = this.list.filter((p) => p.alive);

      for (const b of this.beams) if (!b.done) b.update();
      this.beams = this.beams.filter((b) => !b.done);
      for (const b of this.bombs) if (!b.done) b.update();
      this.bombs = this.bombs.filter((b) => !b.done);
    }

    _deflect(p, f) {
      const back = p.owner && p.owner.alive ? p.owner.chest().sub(p.pos).normalize() : f.forward;
      p.vel.copy(back).multiplyScalar(p.speed * 1.25);
      p.owner = f;
      p.team = f.team;
      p.target = f.target;
      p.life = 2;
      p.damage *= 1.3;
      this.battle.vfx.impact(p.pos, 2, 0xffffff);
      this.battle.sfx('block', f, { vol: 1.2 });
      this.battle.emit('deflect', { fighter: f });
    }

    _explode(p, fizzle, directTarget, stageHit) {
      if (!p.alive) return;
      p.alive = false;
      p.visual.group.visible = false;
      const battle = this.battle;
      const r = p.explode || 1;
      if (fizzle) {
        battle.vfx.flash(p.pos, p.radius * 3, p.color, 0.15, SL.Toon.tex.glow);
        return;
      }
      if (r < 2) {
        battle.vfx.impact(p.pos, 1, p.color);
        battle.vfx.ball(p.pos, r * 1.2, p.color, 0.28);
        battle.sfx('explosionSmall', null, { at: p.pos, vol: 0.5 });
      } else {
        battle.vfx.explosion(p.pos, r * 0.8, p.color);
        battle.sfx(r > 5 ? 'explosionBig' : 'explosionSmall', null, { at: p.pos });
        battle.cameraTraumaAt(p.pos, 0.2 + r * 0.04);
        for (const f of battle.fighters) {
          if (!f.alive || f.team === p.team || f === directTarget) continue;
          const d = f.capsuleDistance(p.pos);
          if (d < r * 0.8) {
            f.takeHit(p.owner, { type: 'explosion', damage: p.damage * 0.45 * (1 - d / (r * 0.8)), knock: 'push', knockSpeed: 10, hitstun: 18, impact: 2, dir: f.chest().sub(p.pos).normalize(), point: p.pos.clone() });
          }
        }
      }
      battle.stage.explode(p.pos, Math.max(r, 1.2), p.damage * 0.6, stageHit, p.owner);
    }

    dispose() {
      for (const b of this.beams) b.dispose();
      for (const b of this.bombs) b.dispose();
      for (const v of this.meshPool) {
        v.group.parent && v.group.parent.remove(v.group);
        v.core.material.dispose();
        v.glow.material.dispose();
      }
      for (const o of this.orbs) {
        o.parent && o.parent.remove(o);
        o.material.dispose();
        for (const c of o.children) c.material.dispose();
      }
    }
  }

  /* ---------------- Beam ---------------- */
  class Beam {
    constructor(battle, owner, spec, frac) {
      this.battle = battle;
      this.owner = owner;
      this.team = owner.team;
      this.spec = spec;
      this.frac = frac;
      this.radius = U.lerp(spec.radius[0], spec.radius[1], frac) * Math.max(1, owner.scale);
      this.damage = U.lerp(spec.damage[0], spec.damage[1], frac);
      this.speed = spec.speed;
      this.range = spec.range;
      this.sustain = spec.sustain;
      this.power = R.beamPower(frac, owner) * (spec.ultimate ? 1.35 : 1);
      this.state = 'extend';
      this.headDist = 0.5;
      this.alpha = 1;
      this.done = false;
      this.hitSet = new Set();
      this.aimYaw = 0;
      this.aimPitch = 0;
      this.time = 0;
      this.origin = this._handOrigin();
      const t = owner.target;
      this.baseDir = t && t.alive ? t.chest().sub(this.origin).normalize() : owner.forward;
      this.dir = this.baseDir.clone();
      this.headOverride = null;
      this.visual = battle.vfx.createBeam(spec.color, spec.core, spec.style || {});
      this.loop = SL.Audio.loop('beam', { vol: battle.volFor(owner), timbre: spec.sound });
      battle.cameraTraumaAt(this.origin, 0.25);
      battle.vfx.flash(this.origin, this.radius * 6, spec.color, 0.25);
      this.update(true);
    }

    _handOrigin() {
      const o = this.owner;
      const h = this.spec.oneHand ? o.handPos('R') : o.handPos('R').add(o.handPos('L')).multiplyScalar(0.5);
      return h.addScaledVector(o.forward, 0.25);
    }

    get head() {
      if (this.headOverride) return this.headOverride.clone();
      return this.origin.clone().addScaledVector(this.dir, this.headDist);
    }

    stop() {
      if (this.state !== 'fade') {
        this.state = 'fade';
        if (this.loop) this.loop.stop(0.3);
        this.loop = null;
      }
    }

    update(initial) {
      const battle = this.battle;
      this.time += TICK;
      if (this.owner.alive) this.origin = this._handOrigin();
      if (this.state === 'clash') {
        this._render();
        return;
      }
      if (!initial && battle.isFrozen(this.owner)) {
        this._render();
        return;
      }
      if (this.state === 'extend' || this.state === 'sustain') {
        const t = this.owner.target;
        if (t && t.alive && this.state === 'extend') {
          const want = t.chest().sub(this.origin).normalize();
          this.baseDir.lerp(want, 0.35 * TICK).normalize();
        }
        const right = new V3().crossVectors(this.baseDir, UP).normalize();
        this.dir.copy(this.baseDir).applyAxisAngle(UP, this.aimYaw);
        if (right.lengthSq() > 0.01) this.dir.applyAxisAngle(right, this.aimPitch);
        this.dir.normalize();
      }
      if (this.state === 'extend') {
        this.headDist += this.speed * TICK;
        if (this.headDist >= this.range) {
          this.headDist = this.range;
          this.state = 'sustain';
        }
      } else if (this.state === 'sustain') {
        this.sustain--;
        if (this.sustain <= 0) this.stop();
      } else if (this.state === 'fade') {
        this.alpha -= TICK * 4;
        if (this.alpha <= 0) {
          this.dispose();
          return;
        }
      }
      if (this.loop) this.loop.set(this.power);

      if (this.state === 'extend' || this.state === 'sustain') this._collide();
      this._render();
    }

    _collide() {
      const battle = this.battle;
      const head = this.head;
      for (const f of battle.fighters) {
        if (!f.alive || f.team === this.team || this.hitSet.has(f)) continue;
        const dHead = f.capsuleDistance(head);
        const dBody = segmentDistance(f.chest(), this.origin, head);
        if (dHead < this.radius * 1.15 + f.radius || (this.state === 'sustain' && dBody < this.radius + f.radius)) {
          const res = f.takeHit(this.owner, {
            type: 'beam', damage: this.damage, knock: 'heavy', knockSpeed: 30, hitstun: 46, impact: this.spec.ultimate ? 5 : 4,
            dir: this.dir.clone(), point: head, color: this.spec.color,
          });
          this.hitSet.add(f);
          if (res === 'miss' || res === 'vanished') continue;
          this._impact(head, true);
          return;
        }
      }
      for (const p of battle.projectiles.list) {
        if (!p.alive || p.team === this.team) continue;
        if (p.pos.distanceTo(head) < this.radius * 1.4 + p.radius) battle.projectiles._explode(p, false);
      }
      const hit = battle.stage.collideSphere(head, this.radius * 0.8);
      if (hit && hit.type !== 'bounds') this._impact(head, false, hit);
    }

    _impact(point, onFighter, stageHit) {
      const battle = this.battle;
      const size = this.radius * 3.2 + 2;
      battle.vfx.explosion(point, size, this.spec.color);
      SL.ScreenFX.flash(battle.involvesPlayer(this.owner) ? 0.35 : 0.15);
      battle.sfx('explosionBig', null, { at: point });
      battle.cameraTraumaAt(point, 0.55);
      battle.stage.explode(point, size * 1.4, this.damage, stageHit, this.owner);
      this.headDist = Math.max(1, point.distanceTo(this.origin));
      this.state = 'sustain';
      this.sustain = Math.min(this.sustain, 12);
    }

    _render() {
      const head = this.head;
      this.visual.update(this.origin, head, this.radius, U.clamp01(this.alpha), this.time);
      if (this.state !== 'fade' && this.battle.frame % 2 === 0) {
        const c = new THREE.Color(this.spec.color);
        const vfx = this.battle.vfx;
        for (let i = 0; i < 3; i++) {
          const v = new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(3, 9));
          vfx.add.emit(head.x, head.y, head.z, v.x, v.y, v.z, c.r, c.g, c.b, 1, this.radius * U.rand(0.3, 0.7), 0.3, { drag: 3 });
        }
      }
    }

    dispose() {
      if (this.done) return;
      this.done = true;
      if (this.loop) this.loop.stop(0.2);
      this.visual.dispose();
    }
  }

  function segmentDistance(p, a, b) {
    const ab = new V3().subVectors(b, a);
    const t = U.clamp01(new V3().subVectors(p, a).dot(ab) / Math.max(0.0001, ab.lengthSq()));
    return a.clone().addScaledVector(ab, t).distanceTo(p);
  }

  /* ---------------- Spirit Bomb ---------------- */
  const lerpParam = (v, t) => (Array.isArray(v) ? U.lerp(v[0], v[1], t) : v);

  /**
   * Spirit Bomb. Radius, damage, blast size and clash power scale with how long
   * the owner held the charge (spec arrays [min, max]). While flying it can be
   * met by an opposing beam, which starts a beam-vs-bomb clash (clash.js).
   */
  class SpiritBomb {
    constructor(battle, owner, spec) {
      this.battle = battle;
      this.owner = owner;
      this.team = owner.team;
      this.spec = spec;
      this.isBomb = true;
      this.state = 'charging';
      this.chargeFrac = 0;
      this.done = false;
      this.pos = owner.pos.clone().add(new V3(0, owner.height + 2, 0));
      this.vel = new V3();
      this.maxRadius = lerpParam(spec.radius, 1);
      this.radius = lerpParam(spec.radius, 0) * 0.1;
      this.hitSet = new Set();
      this.headOverride = null;
      this.origin = owner.chest();
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(spec.color) }, uTime: { value: 0 }, uCharge: { value: 0 } },
        vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){ vP = position; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `${SL.NOISE_GLSL} uniform vec3 uColor; uniform float uTime; uniform float uCharge; varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){ float f = abs(dot(normalize(vN), normalize(vV)));
            float n = vnoise(vP*2.5 + vec3(0.0, uTime*1.5, uTime));
            float n2 = vnoise(vP*6.0 - vec3(uTime*2.0, 0.0, uTime*0.7));
            float veins = smoothstep(0.62, 0.8, n2) * (0.35 + 0.4 * uCharge);
            vec3 col = mix(uColor, vec3(1.0), pow(f, 3.0)*0.5 + n*0.18 + veins) * 1.15;
            float a = 0.42 + pow(1.0-f, 2.0)*0.5;
            gl_FragColor = vec4(col*a, a); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        // premultiplied over: keeps the bomb blue with visible swirling detail instead of blowing out to white
        blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat);
      this.mesh.renderOrder = 11;
      this.core = new THREE.Mesh(getCoreGeo(), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      this.core.renderOrder = 12;
      this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: spec.color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
      battle.scene.add(this.mesh, this.core, this.glow);
      this.light = new THREE.PointLight(spec.color, 2, 80, 2);
      battle.scene.add(this.light);
      this.time = 0;
      this.hum = SL.Audio.loop('aura', { vol: 0.8 });
    }

    get head() {
      return this.headOverride ? this.headOverride.clone() : this.pos.clone();
    }
    get dir() {
      return this.vel.lengthSq() > 0.0001 ? this.vel.clone().normalize() : this.owner.forward;
    }

    /** Locks the final size and power in at release. */
    launch(target) {
      const sp = this.spec, k = this.chargeFrac;
      this.state = 'flying';
      this.target = target;
      this.life = 9;
      this.radius = lerpParam(sp.radius, k);
      this.damage = lerpParam(sp.damage, k);
      this.explodeR = lerpParam(sp.explode, k);
      this.power = lerpParam(sp.clashPower || [1, 1.6], k) * R.multipliers(this.owner).damage;
      this.speed = sp.speed * (1.15 - 0.3 * k);
      const dir = target && target.alive ? target.chest().sub(this.pos).normalize() : this.owner.forward;
      this.vel.copy(dir).multiplyScalar(this.speed);
      this.origin = this.owner.chest();
      this.battle.stage.clearMood(2.5);
      this.battle.emit('bombLaunch', { fighter: this.owner, frac: k });
    }

    cancel() {
      if (this.done) return;
      this.battle.vfx.flash(this.pos, this.radius * 4, this.spec.color, 0.3, SL.Toon.tex.glow);
      this.battle.sfx('explosionSmall', null, { at: this.pos });
      this.dispose();
    }

    /** Clash interface (same as Beam): a lost clash dissolves the bomb. */
    stop() {
      if (this.done) return;
      this.battle.vfx.explosion(this.head, this.radius * 1.4, this.spec.color, { smoke: false });
      this.dispose();
    }

    update() {
      const battle = this.battle;
      this.time += TICK;
      this.mesh.material.uniforms.uTime.value = this.time;
      this.mesh.material.uniforms.uCharge.value = this.chargeFrac;
      if (this.state === 'clash') {
        if (this.headOverride) this.pos.copy(this.headOverride);
        if (this.hum) this.hum.set(1);
        this._render();
        return;
      }
      if (battle.isFrozen(this.owner)) {
        this._render();
        return;
      }
      if (this.state === 'charging') {
        const o = this.owner;
        if (!o.alive || o.state !== 'spiritBomb') {
          this.cancel();
          return;
        }
        const k = this.chargeFrac;
        const target = lerpParam(this.spec.radius, k) * (0.12 + 0.88 * Math.min(1, k * 3));
        this.radius = U.damp(this.radius, target, 4, TICK);
        this.pos.copy(o.pos).add(new V3(0, o.height + 0.8 + this.radius, 0));
        if (battle.frame % 2 === 0) {
          const c = new THREE.Color(this.spec.color);
          const n = 3 + Math.round(k * 4);
          for (let i = 0; i < n; i++) {
            const dir = new V3(U.rand(-1, 1), U.rand(-0.2, 1), U.rand(-1, 1)).normalize();
            const start = this.pos.clone().addScaledVector(dir, 25 + Math.random() * 25);
            const v = this.pos.clone().sub(start).multiplyScalar(1 / 0.9);
            battle.vfx.add.emit(start.x, start.y, start.z, v.x, v.y, v.z, c.r, c.g, c.b, 0.9, U.rand(0.15, 0.35), 0.9, {});
          }
        }
        if (battle.frame % 30 === 0) battle.vfx.ring(this.pos, this.radius * 1.6, this.spec.color, 0.5);
        if (this.hum) this.hum.set(0.3 + k * 0.6);
      } else if (this.state === 'flying') {
        this.life -= TICK;
        const t = this.target;
        if (t && t.alive) {
          const to = t.chest().sub(this.pos).normalize();
          const cur = this.vel.clone().normalize().lerp(to, U.clamp01(this.spec.homing * TICK)).normalize();
          this.vel.copy(cur).multiplyScalar(this.speed);
        }
        this.pos.addScaledVector(this.vel, TICK);
        if (battle.frame % 3 === 0) battle.vfx.trail(this.pos, this.spec.color, this.radius * 0.9, 0.4);
        // ki blasts are absorbed by the bomb
        for (const p of battle.projectiles.list) {
          if (p.alive && p.team !== this.team && p.pos.distanceTo(this.pos) < this.radius + p.radius) battle.projectiles._explode(p, true);
        }
        let hitF = null;
        for (const f of battle.fighters) {
          if (!f.alive || f.team === this.team) continue;
          if (f.capsuleDistance(this.pos) < this.radius + f.radius) {
            hitF = f;
            break;
          }
        }
        if (hitF || battle.stage.collideSphere(this.pos, this.radius * 0.7) || this.life <= 0) {
          this._explode();
          return;
        }
      }
      this._render();
    }

    /** Resumes flight after winning a clash, now aimed at the loser. */
    resumeToward(target, point) {
      this.state = 'flying';
      this.headOverride = null;
      this.pos.copy(point);
      this.target = target;
      this.life = 6;
      this.speed *= 1.5;
      this.damage *= 1.2;
      const dir = target && target.alive ? target.chest().sub(this.pos).normalize() : this.dir;
      this.vel.copy(dir).multiplyScalar(this.speed);
    }

    _explode() {
      const battle = this.battle;
      const sp = this.spec;
      const er = this.explodeR || lerpParam(sp.explode, this.chargeFrac);
      const dmg = this.damage || lerpParam(sp.damage, this.chargeFrac);
      battle.vfx.explosion(this.pos, er * 0.8, sp.color);
      battle.vfx.explosion(this.pos, er * 0.45, 0xffffff, { smoke: false });
      battle.vfx.ring(this.pos, er * 1.3, sp.color, 0.8);
      battle.vfx.light(this.pos, sp.color, 8, er * 6, 0.6);
      SL.ScreenFX.flash(0.85, '#e8f8ff');
      battle.sfx('explosionHuge', null, { at: this.pos });
      battle.cameraTraumaAt(this.pos, 1);
      for (const f of battle.fighters) {
        if (!f.alive || f.team === this.team) continue;
        const d = f.capsuleDistance(this.pos);
        if (d < er) {
          f.takeHit(this.owner, { type: 'explosion', damage: dmg * U.lerp(1, 0.5, d / er), knock: 'heavy', knockSpeed: 34, hitstun: 50, impact: 5, dir: f.chest().sub(this.pos).normalize(), point: this.pos.clone(), color: sp.color });
        }
      }
      battle.stage.explode(this.pos, er * 1.3, dmg, null, this.owner);
      battle.emit('bombExplode', { fighter: this.owner, pos: this.pos.clone(), radius: er });
      this.dispose();
    }

    _render() {
      const pulse = 1 + Math.sin(this.time * 12) * 0.02;
      this.mesh.position.copy(this.pos);
      this.mesh.scale.setScalar(this.radius * pulse);
      this.mesh.rotation.y = this.time * 0.6;
      this.core.position.copy(this.pos);
      this.core.scale.setScalar(this.radius * 0.45 * (1 + Math.sin(this.time * 7) * 0.05));
      this.glow.position.copy(this.pos);
      this.glow.scale.setScalar(this.radius * 3.4);
      this.light.position.copy(this.pos);
      this.light.intensity = 0.8 + this.radius * 0.3;
    }

    dispose() {
      if (this.done) return;
      this.done = true;
      if (this.hum) this.hum.stop(0.3);
      this.hum = null;
      this.battle.scene.remove(this.mesh, this.core, this.glow, this.light);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.core.material.dispose();
      this.glow.material.dispose();
    }
  }

  SL.Projectiles = Projectiles;
  SL.Beam = Beam;
  SL.SpiritBomb = SpiritBomb;
})();
