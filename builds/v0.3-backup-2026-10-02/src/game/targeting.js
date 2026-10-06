/*
 * Targeting: lock-on and free aim for the player.
 *
 *   LOCKED  — a target is selected (an enemy fighter, a boss, or a lockable
 *             object such as an attack pod). The camera frames it, attacks
 *             track it, Next / Previous Target switches between valid targets.
 *   FREE    — no target. The camera is free, movement follows the camera, and
 *             ki blasts and beams fly toward the centre of the screen (with a
 *             small aim assist onto anything lockable near the crosshair).
 *
 * Lock On / Unlock toggles between the two; locking on picks what the player is
 * looking at. CPU fighters are unaffected (they always have a fighter target).
 *
 * ENVIRONMENTAL TARGETS are stage props like any other lockable object. A prop can
 * carry its own `lockRange` (a mountain, a ship, the moon), and a prop marked `far`
 * sits beyond the arena's bounds: shots aimed at it — locked, or free-aimed at it
 * through the crosshair assist — fly all the way there instead of fizzling at the
 * edge of the play area (see Projectiles). A mission names what it is (`name`).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const RANGE = 90;
  // objectives such as attack pods are worth locking from much further away than a fighter
  const PROP_RANGE = 220;
  const ASSIST_DEG = 5;
  const LOCKABLE_PROPS = ['pod', 'destructible', 'objective'];

  /** A lightweight stand-in so aim, homing, lunges and the camera can follow a locked object. */
  function proxyFor(pr) {
    if (pr._lockProxy) return pr._lockProxy;
    const px = {
      isProp: true,
      prop: pr,
      get alive() {
        return pr.alive;
      },
      hidden: false,
      untargetable: false,
      pos: pr.pos,
      radius: pr.r,
      height: pr.r * 2,
      cameraScale: 1,
      tags: {},
      def: { id: pr.kind, name: pr.name || pr.kind },
      chest(out = new V3()) {
        return out.copy(pr.pos);
      },
      aimPoint(from, out = new V3()) {
        return out.copy(pr.pos);
      },
    };
    pr._lockProxy = px;
    return px;
  }

  function kindOf(e) {
    if ((e.tags && e.tags.boss) || e.def.boss) return 'boss';
    return e.grounded ? 'fighter' : 'flying';
  }

  const Targeting = (SL.Targeting = {
    RANGE,
    proxyFor,

    /** Everything the player could lock onto right now. */
    candidates(b, f) {
      const out = [];
      for (const e of b.enemiesOf(f)) {
        if (!e.alive || e.hidden || e.untargetable) continue;
        if (e.pos.distanceTo(f.pos) > RANGE * 1.5) continue;
        out.push({ kind: kindOf(e), fighter: e, pos: e.chest(), range: RANGE });
      }
      for (const pr of b.stage.props || []) {
        if (!pr.alive || pr.lockable === false) continue;
        if (!pr.lockable && !LOCKABLE_PROPS.includes(pr.kind)) continue;
        const range = pr.lockRange || PROP_RANGE;
        if (pr.pos.distanceTo(f.pos) > range) continue;
        out.push({ kind: pr.kind === 'pod' ? 'pod' : pr.objective ? 'objective' : 'destructible', prop: pr, pos: pr.pos.clone(), range });
      }
      return out;
    },

    /** Angle off the camera's view direction (radians) and signed horizontal offset. */
    view(b, pos) {
      const cam = b.camera;
      const fwd = cam.look.clone().sub(cam.pos).normalize();
      const to = pos.clone().sub(cam.pos);
      const dist = to.length();
      to.divideScalar(Math.max(0.001, dist));
      const angle = Math.acos(U.clamp(fwd.dot(to), -1, 1));
      const side = U.wrapAngle(Math.atan2(to.x, to.z) - Math.atan2(fwd.x, fwd.z));
      return { angle, side, dist };
    },

    /** The candidate the player is looking at (centre of the screen first, then distance). */
    best(b, f, list) {
      let best = null, bestScore = 1e9;
      for (const c of list || this.candidates(b, f)) {
        const d = c.pos.distanceTo(f.chest());
        if (d > c.range) continue;
        const v = this.view(b, c.pos);
        let score = v.angle * 45 + Math.min(d, 90) * 0.35;
        if (v.angle > 1.35) score += 60;
        if (c.kind === 'boss' || (c.fighter && c.fighter.tags && c.fighter.tags.priority)) score -= 6;
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }
      return best;
    },

    current(f) {
      if (f.target && f.target.alive) return { fighter: f.target };
      if (f.lockProp && f.lockProp.alive) return { prop: f.lockProp };
      return null;
    },

    isLocked(f) {
      return f.lockMode !== 'free';
    },

    lock(b, f, c, quiet) {
      if (!c) return this.unlock(b, f, true);
      f.lockMode = 'locked';
      f._manualNoTarget = false;
      if (c.fighter) {
        f.target = c.fighter;
        f.lockProp = null;
      } else {
        f.target = null;
        f.lockProp = c.prop;
      }
      if (!quiet) SL.Audio.play('uiMove');
      b.emit('targetChanged', { fighter: f, target: f.target, prop: f.lockProp, kind: c.kind });
      return true;
    },

    unlock(b, f, quiet) {
      const was = f.lockMode !== 'free' && (f.target || f.lockProp);
      f.lockMode = 'free';
      f.target = null;
      f.lockProp = null;
      if (!quiet && was) SL.Audio.play('uiBack', { vol: 0.6 });
      b.emit('targetChanged', { fighter: f, target: null, prop: null, kind: null, free: true });
      return true;
    },

    /** Lock On / Unlock. */
    toggle(b, f) {
      if (f.lockMode !== 'free' && this.current(f)) return this.unlock(b, f);
      const c = this.best(b, f);
      if (!c) {
        f.lockMode = 'free';
        return false;
      }
      return this.lock(b, f, c);
    },

    /** Next (+1) or previous (-1) target, ordered left to right on screen. From free aim it locks on. */
    next(b, f, dir = 1) {
      const list = this.candidates(b, f).filter((c) => c.pos.distanceTo(f.chest()) <= c.range);
      if (!list.length) return false;
      const cur = this.current(f);
      if (!cur || f.lockMode === 'free') return this.lock(b, f, this.best(b, f, list));
      for (const c of list) c.side = this.view(b, c.pos).side;
      list.sort((a, c) => a.side - c.side);
      const i = list.findIndex((c) => (cur.fighter ? c.fighter === cur.fighter : c.prop === cur.prop));
      const n = list[(((i < 0 ? 0 : i) + dir) % list.length + list.length) % list.length];
      return this.lock(b, f, n);
    },

    /** Next target in a screen direction (right stick flick): the nearest candidate on that side. */
    flick(b, f, side) {
      const cur = this.current(f);
      if (!cur) return this.next(b, f, side);
      const curSide = this.view(b, cur.fighter ? cur.fighter.chest() : cur.prop.pos).side;
      let best = null, bd = 1e9;
      for (const c of this.candidates(b, f)) {
        if (cur.fighter ? c.fighter === cur.fighter : c.prop === cur.prop) continue;
        const ds = this.view(b, c.pos).side - curSide;
        if (Math.sign(ds) !== Math.sign(side)) continue;
        if (Math.abs(ds) < bd) {
          bd = Math.abs(ds);
          best = c;
        }
      }
      return best ? this.lock(b, f, best) : false;
    },

    /** The thing attacks should track: the locked fighter, or a locked object's stand-in. */
    aimTarget(f) {
      if (f.target && f.target.alive) return f.target;
      if (f.lockProp && f.lockProp.alive) return proxyFor(f.lockProp);
      return null;
    },

    /**
     * Where a free-aiming player's shots go: along the camera's view through the
     * centre of the screen, snapping onto a lockable thing within a few degrees.
     */
    freeAimPoint(b, f, origin) {
      const cam = b.camera;
      const fwd = cam.look.clone().sub(cam.pos).normalize();
      let best = null, ba = (ASSIST_DEG * Math.PI) / 180;
      for (const c of this.candidates(b, f)) {
        const v = this.view(b, c.pos);
        if (v.dist < 2 || v.angle > ba) continue;
        ba = v.angle;
        best = c;
      }
      if (best) return best.pos.clone();
      // a point far along the view ray, measured from beyond the player so the shot never flies backwards
      const along = Math.max(0, f.chest().sub(cam.pos).dot(fwd));
      return cam.pos.clone().addScaledVector(fwd, along + 70);
    },

    /**
     * The far environmental target a player's shot is going at, if any: the locked prop,
     * or — aiming freely — a far prop inside the crosshair assist.
     */
    farProp(b, f) {
      if (!f.isPlayer) return null;
      if (f.lockProp && f.lockProp.alive) return f.lockProp.far ? f.lockProp : null;
      if (f.lockMode !== 'free' || (f.target && f.target.alive)) return null;
      const lim = (ASSIST_DEG * 2 * Math.PI) / 180; // a far target is small on screen: a little more help
      let best = null, ba = lim;
      for (const pr of b.stage.props || []) {
        if (!pr.alive || !pr.far) continue;
        const v = this.view(b, pr.pos);
        const within = Math.max(0, v.angle - Math.atan2(pr.r, Math.max(1, v.dist)));
        if (within < ba) {
          ba = within;
          best = pr;
        }
      }
      return best;
    },

    /** Each tick: drop dead or invalid locks; after a locked target falls, pick the next if allowed. */
    update(b, f) {
      if (!f.isPlayer) return;
      if (f.lockProp && !f.lockProp.alive) {
        f.lockProp = null;
        const c = SL.Settings.data.gameplay.autoTargetSwitch ? this.best(b, f) : null;
        if (c) this.lock(b, f, c, true);
        else this.unlock(b, f, true);
      }
    },
  });
})();
