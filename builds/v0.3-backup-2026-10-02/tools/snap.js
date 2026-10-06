/*
 * Snap — developer helper for visual checks (screenshots of specific moments).
 * Load it from the browser console on index.html:
 *   const s = document.createElement('script'); s.src = 'tools/snap.js'; document.body.appendChild(s);
 * Then:
 *   const b = await Snap.setup('goku', 'vegeta', 20);   // training battle, player driven by Snap.q / Snap.hold
 *   Snap.q.push({ s1: true, s1Held: true }); Snap.hold = { s1Held: true };
 *   await Snap.until(() => b.player.sd.tier >= 2); Snap.freeze(); Snap.orbit(b.player, -2.2, 4.5, 1.4, 1.1, 50);
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const Snap = {
    q: [],
    hold: null,
    async setup(p1 = 'goku', cpu = 'vegeta', dist = 20, stage = 'wasteland', opts = {}) {
      const prev = SL.App.battle;
      SL.Audio.init();
      SL.App.startTraining(Object.assign({ p1, p1Form: 0, cpu, cpuForm: 0, stage, dummy: 'idle', difficulty: 'normal', infHp: true, infKi: true, infStamina: true, dummyInfHp: true }, opts));
      await new Promise((r) => {
        const w = () => {
          const b = SL.App.battle;
          if (b && b !== prev && b.phase === 'fight') r();
          else setTimeout(w, 50);
        };
        w();
      });
      const b = SL.App.battle, p = b.player, d = b.fighters[1];
      this.q = [];
      this.hold = null;
      p.controller = {
        update: () => {
          const it = SL.emptyIntent();
          const n = this.q.shift();
          if (n) Object.assign(it, n);
          if (this.hold) Object.assign(it, this.hold);
          return it;
        },
      };
      p.setPosition(new V3(-dist / 2, b.stage.heightAt(-dist / 2, 0), 0));
      d.setPosition(new V3(dist / 2, b.stage.heightAt(dist / 2, 0), 0));
      p.faceTarget(100);
      d.faceTarget(100);
      await this.wait(300);
      return b;
    },
    wait(ms) {
      return new Promise((r) => setTimeout(r, ms));
    },
    until(pred, ms = 10000) {
      return new Promise((res) => {
        const t0 = performance.now();
        const w = () => {
          if (pred() || performance.now() - t0 > ms) res(!!pred());
          else requestAnimationFrame(w);
        };
        w();
      });
    },
    freeze(on = true) {
      SL.App.battle.paused = on;
    },
    hud(on) {
      SL.HUD.setVisible(on);
    },
    /** Camera orbiting a fighter: yaw offset from facing, radius, height, look height, fov. */
    orbit(f, yawOff, r, h, lookH, fov = 50) {
      const b = SL.App.battle;
      b.camera.playShot((t, out) => {
        const c = f.pos.clone();
        const a = f.yaw + yawOff;
        out.pos.set(c.x + Math.sin(a) * r, c.y + h, c.z + Math.cos(a) * r);
        out.look.set(c.x, c.y + lookH, c.z);
        out.fov = fov;
      }, 999, { hold: true, blendIn: 0, cut: true, kind: 'story' });
    },
    free() {
      SL.App.battle.camera.endShot();
    },
  };
  window.Snap = Snap;
})();
