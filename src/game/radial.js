/*
 * Radial skill menu (logic). Hold the Skill Menu button, point with the left
 * stick / WASD, release to use. The wheel lists every technique the fighter
 * has — including ones the story has not taught yet, shown locked with the
 * reason — plus transformations, powering down, switching hero, and
 * contextual actions a mission registers (battle.contextActions).
 *
 * The menu slows time instead of pausing it. The HUD draws battle.radial.
 */
(function () {
  'use strict';

  const SLOT_KEYS = { special1: 's1', special2: 's2', ultimate: 'ult' };
  // what a technique is aimed at: the locked target (or the crosshair when free), everything
  // around the user, or the user; mission actions aim at the thing they name
  const AREA = ['bomberWave', 'scatter', 'solarFlare', 'giantStomp', 'bossRoar', 'giantSweep', 'timeFreeze'];
  const SELF = ['senzu'];
  const aimOf = (x) => (AREA.includes(x.type) ? 'area' : SELF.includes(x.type) ? 'self' : 'target');

  const RadialMenu = (SL.RadialMenu = {
    /** Every wheel entry for this fighter right now. Pure: no side effects. */
    buildEntries(f, b) {
      const out = [];
      const lim = (f === b.player && b.playerLimits) || {};
      for (const slot of ['special1', 'special2', 'ultimate']) {
        // the active form's technique (Ultimate Gohan's own Masenko), as the HUD cards show it
        const x = f.specFor(slot);
        if (!x) continue;
        const key = SLOT_KEYS[slot];
        let locked = null;
        if (f.lockedSlots && f.lockedSlots[slot]) locked = 'Not learned yet';
        else if (lim[key] === false) locked = 'Not now';
        else if (slot === 'ultimate' && !b.rules.allowUltimates) locked = 'Not allowed here';
        else if (x.requiresMech && !(f.mech && f.mech[x.requiresMech])) locked = 'Needs ' + x.requiresMech;
        const tech = SL.Techniques && SL.Techniques[x.type];
        if (!locked && tech && tech.lockedReason) locked = tech.lockedReason(f, x);
        const cost = f.skillCost(slot);
        out.push({
          id: slot, kind: 'special', label: x.name, icon: x.icon || 'beam', cost, aim: aimOf(x),
          cooldown: f.cooldowns[slot] || 0, cooldownMax: x.cooldown || 0,
          affordable: !!f.infiniteKi || f.ki >= cost, locked,
          intent: { [key]: true, [key + 'Held']: true },
        });
      }
      // extra techniques: no button of their own, reached through the wheel
      for (const x of (f.def && f.def.extras) || []) {
        const slot = 'x:' + x.id;
        const gate = f.extraLock(x);
        if (gate === 'hidden') continue;
        const tech = SL.Techniques && SL.Techniques[x.type];
        // a technique's own wording first (God Bind: "Needs divine ki"), then the shared gates
        const locked = f.lockedSlots && f.lockedSlots[slot] ? 'Not learned yet' : (tech && tech.lockedReason && tech.lockedReason(f, x)) || gate;
        const cost = f.skillCost(slot);
        out.push({
          id: slot, kind: 'special', extra: true, label: x.name, icon: x.icon || 'beam', cost, aim: aimOf(x),
          cooldown: f.cooldowns[slot] || 0, cooldownMax: x.cooldown || 0,
          affordable: !!f.infiniteKi || f.ki >= cost, locked,
          intent: { extra: x.id, extraHeld: true },
        });
      }
      const next = f.def.forms ? f.def.forms[f.formIndex + 1] : null;
      // a story form nobody has been given yet is not advertised at all: the player
      // has never heard of it, so it does not sit on the wheel wearing a padlock
      // a form the story has not shown yet stays a secret (story-locked, or not earned for Free Battle)
      const secret = next && (next.storyLocked || next.freeUnlock) && f.lockedForms && f.lockedForms[next.id];
      if (next && !secret) {
        let locked = null;
        if (!b.rules.allowTransform || lim.transform === false) locked = 'Not allowed here';
        else if (f.lockedSlots && f.lockedSlots.transform) locked = 'Not learned yet';
        else if (f.lockedForms && f.lockedForms[next.id]) locked = 'Not unlocked in the story';
        else if (next.strain && (f.strain > next.strain.reentryAt || f.overloadCooldown > 0)) locked = 'Body too strained';
        out.push({ id: 'transform', kind: 'form', label: next.name, icon: 'transform', cost: next.kiCost || 0, affordable: !!f.infiniteKi || f.ki >= (next.kiCost || 0), locked, intent: { transform: true } });
      }
      // a leveled form (Kaioken) shows its next level and how it is reached
      const fm = f.form;
      // levels the form keeps for a later part of the story are not advertised at all: there is
      // nothing the player can do about them here (Kaioken x10 and x20 outside Namek)
      const reserved = fm && fm.levels && fm.defaultLevelCap !== undefined && !(f.formCaps && f.formCaps[fm.id] !== undefined) && f.formLevel >= fm.defaultLevelCap;
      if (fm && fm.levels && f.formLevel < fm.levels.length - 1 && !reserved) {
        const storyCapped = f.formCaps && f.formCaps[fm.id] !== undefined && f.formLevel >= f.formCaps[fm.id];
        const capped = f.formLevel >= f.formLevelCap(fm);
        out.push({ id: 'formLevel', kind: 'info', label: fm.name + ' ' + fm.levels[f.formLevel + 1].name, icon: 'transform', cost: fm.levelCost || 15, affordable: true, locked: storyCapped ? 'Not mastered yet' : capped ? 'Limited by battle rules' : null, hint: 'Hold Charge', intent: null });
      }
      if (f.formIndex > 0) out.push({ id: 'revert', kind: 'form', label: 'Power Down', icon: 'transform', cost: 0, affordable: true, locked: b.playerLimits && b.playerLimits.revert === false ? 'Unavailable in this encounter' : null, intent: { revert: true } });
      if (b.party && b.party.length > 1) {
        const nx = b.nextPartyMember(1);
        out.push({ id: 'switch', kind: 'party', label: nx ? 'Switch to ' + nx.name : 'Switch hero', icon: 'run', cost: 0, affordable: true, locked: nx && b.canSwitchTo(nx) ? null : 'No one can take over', action: 'partyNext' });
      }
      for (const c of b.contextActions || []) {
        if (!c.when || c.when()) out.push({ id: c.id, kind: 'context', label: c.label, icon: c.icon || 'ultimate', cost: c.cost || 0, affordable: true, locked: null, run: c.run, context: true, aim: c.aim || null, targetName: c.targetName || null });
      }
      return out;
    },

    /** Which entry a stick direction points at (entries are laid out clockwise from the top). */
    pick(entries, x, y) {
      if (!entries.length || Math.hypot(x, y) < 0.35) return -1;
      const ang = Math.atan2(x, y);
      let best = -1, bd = 1e9;
      entries.forEach((e, i) => {
        const a = (i / entries.length) * Math.PI * 2;
        // atan2 gives -π..π and the slots 0..2π, so the gap can pass a full turn: fold it into 0..π
        let d = Math.abs(ang - a) % (Math.PI * 2);
        if (d > Math.PI) d = Math.PI * 2 - d;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    },

    /**
     * Combine every pointing device into one direction for pick():
     * left stick / WASD first, then the right stick, then accumulated mouse motion.
     * state.mouse keeps the mouse vector between frames (clamped, so a flick selects
     * and a small move the other way re-selects).
     */
    pointDirection(state, input) {
      const MOUSE_RADIUS = 60, MOUSE_MIN = 16;
      state.mouse = state.mouse || { x: 0, y: 0 };
      const m = state.mouse;
      if (input.pointer) {
        m.x += input.pointer.x;
        m.y -= input.pointer.y;
        const len = Math.hypot(m.x, m.y);
        if (len > MOUSE_RADIUS) {
          m.x *= MOUSE_RADIUS / len;
          m.y *= MOUSE_RADIUS / len;
        }
      }
      const mv = input.move || { x: 0, y: 0 };
      if (Math.hypot(mv.x, mv.y) >= 0.35) return { x: mv.x, y: mv.y, source: 'stick' };
      const rs = input.rightStick || { x: 0, y: 0 };
      if (Math.hypot(rs.x, rs.y) >= 0.35) return { x: rs.x, y: rs.y, source: 'rightStick' };
      const ml = Math.hypot(m.x, m.y);
      if (ml >= MOUSE_MIN) return { x: m.x / ml, y: m.y / ml, source: 'mouse' };
      return { x: 0, y: 0, source: null };
    },

    usable(e) {
      return !!e && !e.locked && e.affordable && !(e.cooldown > 0) && (e.intent || e.action || e.run);
    },

    /**
     * Use an entry. Returns an intent to feed the fighter for a few ticks
     * (null when the action was handled directly or refused).
     */
    use(e, f, b) {
      if (!RadialMenu.usable(e)) {
        b.emit('radialRefused', { fighter: f, entry: e });
        return null;
      }
      b.emit('radialUsed', { fighter: f, entry: e });
      if (e.run) {
        e.run();
        return null;
      }
      if (e.action === 'partyNext') {
        b.switchPlayer(b.nextPartyMember(1));
        return null;
      }
      return Object.assign({}, e.intent);
    },
  });
})();
