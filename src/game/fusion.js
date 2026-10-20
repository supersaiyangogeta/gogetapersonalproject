/*
 * FUSION — two fighters become one, for a while (the Fusion Dance now; the Potara later).
 *
 *   SL.Fusion.fuse(battle, a, b, fusedId, opts)   → handle { fused, parts, id, left, active }
 *   SL.Fusion.defuse(battle, handle, opts)
 *
 * Data: SL.data.fusions[fusedId] = { parts: [idA, idB], method: 'dance' | 'potara', seconds }.
 *
 * The fused fighter is spawned where the two parts meet, on their team, and takes the player's
 * seat if either part had it (and their place in a party). The parts are NOT removed: they are
 * hidden, untargetable, intangible and scripted, and defusion hands the same two fighters back —
 * their forms, their outfits — either side of where the fused one stood, carrying its health
 * fraction. A timer (opts.seconds, simulation seconds, paused while a scene holds the game) ends
 * it by itself. Everything here is existing engine: spawn, hide, switchPlayer, onTick. No new
 * fighter state.
 *
 * opts (fuse): seconds (0 = until defused), form (index or id for the fused fighter), hpFrac
 *   (override), silent (no flash/sound), ai (profile for a CPU fusion), difficulty
 * opts (defuse): to (which part the player takes), silent, timeUp (set by the timer)
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const scripted = () => ({ update: () => SL.emptyIntent() });

  const Fusion = (SL.Fusion = {
    /** The fusion a fighter is part of right now (or null). */
    of(f) {
      return (f && (f.fusion || (f.fusedInto && f.fusedInto.fusion))) || null;
    },

    fuse(b, a, c, fusedId, opts = {}) {
      const data = (SL.data.fusions && SL.data.fusions[fusedId]) || {};
      const at = a.pos.clone().lerp(c.pos, 0.5);
      const grounded = a.grounded && c.grounded;
      if (grounded && b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
      const wasPlayer = b.player === a || b.player === c;
      const hpFrac = opts.hpFrac !== undefined ? opts.hpFrac : Math.min(1, (a.hpFrac + c.hpFrac) / 2);
      const f = b.spawn({ charId: fusedId, team: a.team, pos: at, grounded, startKi: 0, cannotDie: a.cannotDie || c.cannotDie });
      f.hp = Math.max(1, f.hpMax * hpFrac);
      f.ki = Math.min(f.kiMax, ((a.ki / a.kiMax + c.ki / c.kiMax) / 2) * f.kiMax);
      f.grounded = grounded;
      f.yaw = f.prevYaw = a.yaw;
      if (opts.form !== undefined) {
        const i = typeof opts.form === 'number' ? opts.form : f.def.forms.findIndex((x) => x.id === opts.form);
        if (i > 0) f.applyForm(i);
      }
      for (const p of [a, c]) {
        p.fusedInto = f;
        p._preFusion = { untargetable: p.untargetable, intangible: p.intangible, controller: p.controller };
        p.setHidden(true);
        p.untargetable = true;
        p.intangible = true;
        p.controller = scripted();
        p.setState('scripted', { pose: 'idle', expression: 'calm' });
      }
      // whoever was after one of them is after the fusion now
      for (const o of b.fighters) if (o !== f && (o.target === a || o.target === c)) o.target = f;
      f.target = (a.target && a.target !== c && a.target) || (c.target && c.target !== a && c.target) || null;
      if (b.party) {
        const i = b.party.findIndex((p) => p === a || p === c);
        b.party = b.party.filter((p) => p !== a && p !== c);
        if (i >= 0) b.party.splice(Math.min(i, b.party.length), 0, f);
      }
      if (wasPlayer) b.switchPlayer(f, { force: true });
      else f.controller = new SL.AIController(b, { difficulty: opts.difficulty || 'normal', profile: opts.ai });
      // (switchPlayer hands the old player an ally brain: the parts are out of the fight, so script them again)
      for (const p of [a, c]) {
        p.isPlayer = false;
        p.controller = scripted();
      }
      const seconds = opts.seconds !== undefined ? opts.seconds : data.seconds || 0;
      const h = { id: fusedId, fused: f, parts: [a, c], left: seconds, seconds, active: true };
      f.fusion = h;
      if (seconds > 0) {
        b.onTick(() => {
          if (!h.active || b.disposed) return false;
          if (b.inputLocked || b.paused) return true;
          h.left -= 1 / 60;
          if (h.left <= 0) {
            Fusion.defuse(b, h, { timeUp: true });
            return false;
          }
          return true;
        });
      }
      if (!opts.silent) {
        const col = (f.form.aura && f.form.aura.color) || 0xffffff;
        b.vfx.flash(f.chest(), 5, 0xffffff, 0.5, SL.Toon.tex.glow);
        b.vfx.ring(f.chest(), 6, col, 0.6);
        b.vfx.ring(f.pos.clone().add(new V3(0, 0.2, 0)), 8, 0xffffff, 0.6, new V3(0, 1, 0));
        SL.ScreenFX.flash(0.7, '#ffffff');
        b.sfx('transformBurst', f, { pitch: 1.2 });
        b.cameraTraumaAt(f.chest(), 0.5);
      }
      b.emit('fusion', { fused: f, parts: [a, c], id: fusedId });
      // the dance's fanfare (soundtrack PDF p.97) the moment the fingertips meet and the light comes — a fusion that
      // came out right (data.fanfare), never the failures; it plays over whatever music the scene has
      if (data.method === 'dance' && data.fanfare) SL.Music.stinger('fusion_fanfare');
      return h;
    },

    defuse(b, h, opts = {}) {
      if (!h || !h.active) return null;
      h.active = false;
      const f = h.fused;
      const [a, c] = h.parts;
      const fwd = f.forward.clone().setY(0);
      if (fwd.lengthSq() < 0.001) fwd.set(0, 0, 1);
      fwd.normalize();
      const side = new V3(fwd.z, 0, -fwd.x);
      const hpFrac = f.hpFrac;
      [a, c].forEach((p, i) => {
        const at = f.pos.clone().addScaledVector(side, i ? -0.75 : 0.75);
        if (f.grounded && b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
        p.setPosition(at);
        p.vel.set(0, 0, 0);
        p.grounded = f.grounded;
        p.yaw = p.prevYaw = f.yaw;
        p.hp = Math.max(1, p.hpMax * hpFrac);
        p.ki = Math.min(p.kiMax, (f.ki / f.kiMax) * p.kiMax);
        p.fusedInto = null;
        const pre = p._preFusion || {};
        p.untargetable = !!pre.untargetable;
        p.intangible = !!pre.intangible;
        p.setHidden(false);
        p.setState('free');
      });
      const to = opts.to || a;
      const wasPlayer = b.player === f;
      if (b.party && b.party.includes(f)) {
        const i = b.party.indexOf(f);
        b.party.splice(i, 1, a, c);
      }
      for (const o of b.fighters) if (o.target === f) o.target = to;
      if (wasPlayer) b.switchPlayer(to, { force: true });
      for (const p of [a, c]) {
        if (p === b.player) continue;
        // never two player controllers: the part that had the player's before the fusion gets an ally's
        const pre = (p._preFusion || {}).controller;
        p.isPlayer = false;
        p.controller = pre && !(pre instanceof SL.PlayerController) ? pre : b._allyController(p);
      }
      if (!opts.silent) {
        b.vfx.flash(f.chest(), 4, 0xffffff, 0.4, SL.Toon.tex.glow);
        b.vfx.ring(f.chest(), 4, 0xffffff, 0.45);
        b.sfx('capsulePop', f, { pitch: 0.8, vol: 1 });
      }
      b.remove(f);
      b.emit('fusionEnd', { fused: f, parts: [a, c], id: h.id, timeUp: !!opts.timeUp });
      return [a, c];
    },
  });
})();
