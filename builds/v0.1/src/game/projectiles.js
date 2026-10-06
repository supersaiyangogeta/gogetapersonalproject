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
        s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        s.renderOrder = 12;
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
      this.visual = battle.vfx.createBeam(spec.color, spec.core);
      this.loop = SL.Audio.loop('beam', { vol: battle.volFor(owner) });
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
  class SpiritBomb {
    constructor(battle, owner, spec) {
      this.battle = battle;
      this.owner = owner;
      this.team = owner.team;
      this.spec = spec;
      this.state = 'charging';
      this.chargeFrac = 0;
      this.done = false;
      this.pos = owner.pos.clone().add(new V3(0, owner.height + 2, 0));
      this.vel = new V3();
      this.radius = spec.radius * 0.1;
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(spec.color) }, uTime: { value: 0 } },
        vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){ vP = position; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `${SL.NOISE_GLSL} uniform vec3 uColor; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){ float f = abs(dot(normalize(vN), normalize(vV)));
            float n = vnoise(vP*2.5 + vec3(0.0, uTime*1.5, uTime));
            vec3 col = mix(uColor, vec3(1.0), pow(f, 2.5)*0.8 + n*0.25);
            float a = 0.55 + pow(1.0-f, 2.0)*0.6;
            gl_FragColor = vec4(col*a, a); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
      });
      this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat);
      this.mesh.renderOrder = 11;
      this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: spec.color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      battle.scene.add(this.mesh, this.glow);
      this.light = new THREE.PointLight(spec.color, 2, 60, 2);
      battle.scene.add(this.light);
      this.time = 0;
      this.hum = SL.Audio.loop('aura', { vol: 0.8 });
    }

    launch(target) {
      this.state = 'flying';
      this.target = target;
      this.life = 7;
      const dir = target && target.alive ? target.chest().sub(this.pos).normalize() : this.owner.forward;
      this.vel.copy(dir).multiplyScalar(this.spec.speed);
      this.battle.emit('bombLaunch', { fighter: this.owner });
    }

    cancel() {
      if (this.done) return;
      this.battle.vfx.flash(this.pos, this.radius * 4, this.spec.color, 0.3, SL.Toon.tex.glow);
      this.battle.sfx('explosionSmall', null, { at: this.pos });
      this.dispose();
    }

    update() {
      const battle = this.battle;
      this.time += TICK;
      this.mesh.material.uniforms.uTime.value = this.time;
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
        this.radius = this.spec.radius * (0.12 + 0.88 * this.chargeFrac);
        this.pos.copy(o.pos).add(new V3(0, o.height + 0.8 + this.radius, 0));
        if (battle.frame % 2 === 0) {
          const c = new THREE.Color(this.spec.color);
          for (let i = 0; i < 4; i++) {
            const dir = new V3(U.rand(-1, 1), U.rand(-0.2, 1), U.rand(-1, 1)).normalize();
            const start = this.pos.clone().addScaledVector(dir, 25 + Math.random() * 20);
            const v = this.pos.clone().sub(start).multiplyScalar(1 / 0.9);
            battle.vfx.add.emit(start.x, start.y, start.z, v.x, v.y, v.z, c.r, c.g, c.b, 0.9, U.rand(0.15, 0.35), 0.9, {});
          }
        }
        if (this.hum) this.hum.set(0.3 + this.chargeFrac * 0.5);
      } else if (this.state === 'flying') {
        this.life -= TICK;
        const t = this.target;
        if (t && t.alive) {
          const to = t.chest().sub(this.pos).normalize();
          const cur = this.vel.clone().normalize().lerp(to, U.clamp01(this.spec.homing * TICK)).normalize();
          this.vel.copy(cur).multiplyScalar(this.spec.speed);
        }
        this.pos.addScaledVector(this.vel, TICK);
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

    _explode() {
      const battle = this.battle;
      const sp = this.spec;
      battle.vfx.explosion(this.pos, sp.explode * 0.8, sp.color);
      battle.vfx.explosion(this.pos, sp.explode * 0.45, 0xffffff, { smoke: false });
      SL.ScreenFX.flash(0.85, '#e8f8ff');
      battle.sfx('explosionHuge', null, { at: this.pos });
      battle.cameraTraumaAt(this.pos, 1);
      for (const f of battle.fighters) {
        if (!f.alive || f.team === this.team) continue;
        const d = f.capsuleDistance(this.pos);
        if (d < sp.explode) {
          f.takeHit(this.owner, { type: 'explosion', damage: sp.damage * U.lerp(1, 0.5, d / sp.explode), knock: 'heavy', knockSpeed: 34, hitstun: 50, impact: 5, dir: f.chest().sub(this.pos).normalize(), point: this.pos.clone(), color: sp.color });
        }
      }
      battle.stage.explode(this.pos, sp.explode * 1.3, sp.damage, null, this.owner);
      this.dispose();
    }

    _render() {
      this.mesh.position.copy(this.pos);
      this.mesh.scale.setScalar(this.radius * (1 + Math.sin(this.time * 12) * 0.02));
      this.glow.position.copy(this.pos);
      this.glow.scale.setScalar(this.radius * 5);
      this.light.position.copy(this.pos);
      this.light.intensity = 1 + this.radius * 0.6;
    }

    dispose() {
      if (this.done) return;
      this.done = true;
      if (this.hum) this.hum.stop(0.3);
      this.battle.scene.remove(this.mesh, this.glow, this.light);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.glow.material.dispose();
    }
  }

  SL.Projectiles = Projectiles;
  SL.Beam = Beam;
  SL.SpiritBomb = SpiritBomb;
})();
