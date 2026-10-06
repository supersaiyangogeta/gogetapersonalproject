/*
 * Camera rig: lock-on battle camera, free orbit, cinematic shots and
 * trauma-based shake. Readability first: both fighters stay framed, the
 * camera never dips under terrain, and shake scales with impact level.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V = () => new THREE.Vector3();

  const DIST_MUL = { near: 0.8, normal: 1, far: 1.28 };

  class CameraRig {
    constructor() {
      this.camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.1, 4000);
      this.pos = V();
      this.look = V();
      this.desiredPos = V();
      this.desiredLook = V();
      this.orbitYaw = 0;
      this.orbitPitch = 0.1;
      this.freeYaw = 0;
      this.freePitch = 0.15;
      this.lastInputTime = 0;
      this.baseYaw = 0;
      this.trauma = 0;
      this.time = 0;
      this.fov = 62;
      this.fovKick = 0;
      this.shot = null;
      this.cutNext = true;
      this.mode = 'battle';
      this._tmp = V();
      this._tmp2 = V();
      this._shotOut = { pos: V(), look: V(), fov: 62, roll: 0 };
      this.roll = 0;
    }

    setAspect(a) {
      this.camera.aspect = a;
      this.camera.updateProjectionMatrix();
    }

    setFar(far) {
      this.camera.far = far;
      this.camera.updateProjectionMatrix();
    }

    cut() {
      this.cutNext = true;
    }

    addTrauma(amount) {
      this.trauma = Math.min(1, this.trauma + amount);
    }

    /**
     * Plays a cinematic shot. fn(t01, out, elapsedSec) must write out.pos / out.look / out.fov.
     * kind: 'story' (always plays) or 'gameplay' (obeys the cinematic setting).
     */
    playShot(fn, duration, opts = {}) {
      const setting = SL.Settings.data.camera.cinematic;
      const kind = opts.kind || 'gameplay';
      if (kind === 'gameplay' && setting === 'off') return false;
      if (kind === 'gameplay' && setting === 'reduced') duration *= 0.6;
      this.shot = {
        fn,
        duration,
        elapsed: 0,
        blendIn: opts.blendIn === undefined ? 0.25 : opts.blendIn,
        blendOut: opts.blendOut === undefined ? 0.35 : opts.blendOut,
        startPos: this.pos.clone(),
        startLook: this.look.clone(),
        hold: !!opts.hold,
        onEnd: opts.onEnd,
      };
      if (opts.cut) this.cut();
      return true;
    }

    endShot() {
      if (!this.shot) return;
      const s = this.shot;
      this.shot = null;
      this._returnBlend = s.blendOut;
      this._returnT = 0;
      if (s.onEnd) s.onEnd();
    }

    get inShot() {
      return !!this.shot;
    }

    update(dt, ctx) {
      this.time += dt;
      const cam = this.camera;
      const set = SL.Settings.data.camera;

      if (this.shot) {
        const s = this.shot;
        s.elapsed += dt;
        const t = U.clamp01(s.elapsed / s.duration);
        const out = this._shotOut;
        out.fov = this.fov;
        out.roll = 0;
        s.fn(t, out, s.elapsed);
        const bi = s.blendIn > 0 ? U.smooth(U.clamp01(s.elapsed / s.blendIn)) : 1;
        if (this.cutNext || bi >= 1) {
          this.pos.copy(out.pos);
          this.look.copy(out.look);
        } else {
          this.pos.lerpVectors(s.startPos, out.pos, bi);
          this.look.lerpVectors(s.startLook, out.look, bi);
        }
        this.cutNext = false;
        this.fov = U.damp(this.fov, out.fov, 12, dt);
        this.roll = out.roll || 0;
        if (t >= 1 && !s.hold) this.endShot();
      } else if (ctx && ctx.player) {
        this.roll = 0;
        this._follow(dt, ctx, set);
      } else if (ctx && ctx.focus) {
        this._orbitFocus(dt, ctx);
      }

      // shake
      this.trauma = Math.max(0, this.trauma - dt * 1.5);
      const shakeAmt = this.trauma * this.trauma * set.shake;
      cam.position.copy(this.pos);
      if (shakeAmt > 0.0001) {
        const tt = this.time * 38;
        cam.position.x += (Math.sin(tt * 1.1) + Math.sin(tt * 2.3 + 1.2) * 0.5) * shakeAmt * 0.35;
        cam.position.y += (Math.sin(tt * 1.7 + 2.1) + Math.sin(tt * 3.1) * 0.5) * shakeAmt * 0.3;
        cam.position.z += Math.sin(tt * 1.3 + 4.2) * shakeAmt * 0.25;
      }
      cam.lookAt(this.look);
      if (this.roll) cam.rotateZ(this.roll);
      if (shakeAmt > 0.0001) cam.rotateZ(Math.sin(this.time * 31) * shakeAmt * 0.02);

      const targetFov = U.clamp(this.fov + this.fovKick, 30, 95);
      if (Math.abs(cam.fov - targetFov) > 0.05) {
        cam.fov = targetFov;
        cam.updateProjectionMatrix();
      }
      this.fovKick = U.damp(this.fovKick, 0, 5, dt);
    }

    _follow(dt, ctx, set) {
      const p = ctx.player;
      const t = ctx.target;
      const look = ctx.look || { x: 0, y: 0 };
      const hasInput = Math.abs(look.x) + Math.abs(look.y) > 0.0005;
      if (hasInput) this.lastInputTime = this.time;

      const pc = this._tmp.set(p.pos.x, p.pos.y + p.height * 0.62, p.pos.z);
      let distance, lookPoint;
      const distMul = DIST_MUL[set.distance] || 1;

      if (t && t.alive !== false) {
        const dx = t.pos.x - p.pos.x, dz = t.pos.z - p.pos.z;
        const horiz = Math.hypot(dx, dz);
        if (horiz > 0.6) this.baseYaw = U.dampAngle(this.baseYaw, Math.atan2(dx, dz), horiz < 3 ? 4 : 9, dt);
        const sep = Math.hypot(horiz, t.pos.y - p.pos.y);
        this.orbitYaw += look.x;
        this.orbitPitch = U.clamp(this.orbitPitch + look.y, -0.7, 0.9);
        if (set.autoCorrect && this.time - this.lastInputTime > 1.1) {
          this.orbitYaw = U.damp(this.orbitYaw, 0, 1.6, dt);
          this.orbitPitch = U.damp(this.orbitPitch, 0.1, 1.6, dt);
        }
        this.orbitYaw = U.wrapAngle(this.orbitYaw);
        distance = U.clamp(4.6 + sep * 0.18, 4.6, 10.5) * distMul * (p.cameraScale || 1);
        const tc = this._tmp2.set(t.pos.x, t.pos.y + t.height * 0.55, t.pos.z);
        const w = sep > 35 ? 0.62 : 0.5;
        lookPoint = pc.clone().lerp(tc, w);
        // vertical framing: tilt toward a target far above/below
        const dy = t.pos.y - p.pos.y;
        const pitchAssist = U.clamp(-Math.atan2(dy, Math.max(horiz, 4)) * 0.45, -0.5, 0.5);
        this._pitch = U.damp(this._pitch || 0.1, this.orbitPitch + pitchAssist, 6, dt);
      } else {
        this.baseYaw = U.dampAngle(this.baseYaw, p.yaw, this.time - this.lastInputTime > 1.5 && p.speed > 3 ? 1.5 : 0, dt);
        this.orbitYaw += look.x;
        this.orbitPitch = U.clamp(this.orbitPitch + look.y, -0.7, 0.9);
        distance = 6.2 * distMul * (p.cameraScale || 1);
        lookPoint = pc.clone();
        this._pitch = U.damp(this._pitch || 0.1, this.orbitPitch, 8, dt);
      }

      const yaw = this.baseYaw + this.orbitYaw;
      const pitch = this._pitch;
      const cp = Math.cos(pitch);
      const back = new THREE.Vector3(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp);
      const right = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw));
      const desired = this.desiredPos.copy(pc).addScaledVector(back, distance).addScaledVector(right, 0.7).add(new THREE.Vector3(0, 0.35, 0));

      // keep camera above ground and out of rock pillars
      if (ctx.stage) {
        const gh = ctx.stage.heightAt(desired.x, desired.z);
        if (desired.y < gh + 0.7) desired.y = gh + 0.7;
        ctx.stage.pushCameraOut(pc, desired);
      }
      this.desiredLook.copy(lookPoint);

      if (this.cutNext) {
        this.pos.copy(desired);
        this.look.copy(lookPoint);
        this.cutNext = false;
      } else {
        let rate = ctx.fastFollow ? 22 : 11;
        if (this._returnBlend) {
          this._returnT += dt;
          rate = U.lerp(4, rate, U.clamp01(this._returnT / this._returnBlend));
          if (this._returnT >= this._returnBlend) this._returnBlend = 0;
        }
        this.pos.x = U.damp(this.pos.x, desired.x, rate, dt);
        this.pos.y = U.damp(this.pos.y, desired.y, rate, dt);
        this.pos.z = U.damp(this.pos.z, desired.z, rate, dt);
        this.look.x = U.damp(this.look.x, lookPoint.x, rate * 1.3, dt);
        this.look.y = U.damp(this.look.y, lookPoint.y, rate * 1.3, dt);
        this.look.z = U.damp(this.look.z, lookPoint.z, rate * 1.3, dt);
      }
      this.fov = U.damp(this.fov, 62, 4, dt);
    }

    _orbitFocus(dt, ctx) {
      const f = ctx.focus;
      this.freeYaw += (ctx.orbitSpeed || 0.12) * dt;
      const d = ctx.distance || 6;
      const h = ctx.height || 1.2;
      this.desiredPos.set(f.x + Math.sin(this.freeYaw) * d, f.y + h, f.z + Math.cos(this.freeYaw) * d);
      this.pos.lerp(this.desiredPos, this.cutNext ? 1 : 1 - Math.exp(-3 * dt));
      this.look.lerp(f, this.cutNext ? 1 : 1 - Math.exp(-4 * dt));
      this.cutNext = false;
    }

    /** Screen-space projection helper for HUD markers. */
    project(worldPos, out) {
      const v = this._tmp.copy(worldPos).project(this.camera);
      const behind = v.z > 1;
      out.x = (v.x * 0.5 + 0.5) * window.innerWidth;
      out.y = (-v.y * 0.5 + 0.5) * window.innerHeight;
      out.behind = behind;
      out.onScreen = !behind && v.x > -1 && v.x < 1 && v.y > -1 && v.y < 1;
      out.ndcX = v.x;
      out.ndcY = v.y;
      return out;
    }
  }

  SL.CameraRig = CameraRig;
})();
