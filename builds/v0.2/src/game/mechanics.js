/*
 * Character-specific mechanics. Each mechanic hooks into the shared combat
 * framework through a small interface, so new characters add a mechanic
 * here instead of branching inside Fighter.
 *
 * Interface (all optional):
 *   init(f), update(f, dt), damageOut(f, ctx) -> mult, damageIn(f, ctx) -> mult,
 *   armor(f, hit) -> bool, costMul(f, action) -> mult, kiRegenMul(f) -> mult,
 *   on(f, event, data), hud(f) -> { value, label, active, color }
 */
(function () {
  'use strict';
  const U = SL.util;

  const Mechanics = (SL.Mechanics = {
    saiyanInstinct: {
      init(f) {
        f.mech = { empower: 0, zenkai: false };
      },
      update(f) {
        if (f.mech.empower > 0) f.mech.empower--;
        if (!f.mech.zenkai && f.hp / f.hpMax < 0.3 && f.alive) {
          f.mech.zenkai = true;
          f.ki = Math.min(f.kiMax, f.ki + 30);
          f.battle.emit('mechanic', { fighter: f, kind: 'zenkai' });
        }
      },
      damageOut(f) {
        return f.mech.empower > 0 ? 1.2 : 1;
      },
      costMul(f, action) {
        return action === 'dodge' || action === 'vanish' ? 0.72 : 1;
      },
      on(f, ev) {
        if (ev === 'vanish' || ev === 'perfectGuard') f.mech.empower = 180;
      },
      hud(f) {
        return { value: f.mech.empower / 180, label: 'INSTINCT', active: f.mech.empower > 0, color: '#8fd8ff' };
      },
    },

    pride: {
      init(f) {
        f.mech = { pride: 0, far: 0, max: false };
      },
      update(f, dt) {
        const m = f.mech;
        const t = f.target;
        const lowHp = f.hp / f.hpMax < 0.35 ? 1.5 : 1;
        if (t && t.alive) {
          const d = f.pos.distanceTo(t.pos);
          if (d < 8) {
            m.pride += 2.4 * lowHp * dt;
            m.far = 0;
          } else if (d > 25) {
            m.far += dt;
            if (m.far > 2) m.pride -= 12 * dt;
          }
        }
        m.pride = U.clamp(m.pride, 0, 100);
        const wasMax = m.max;
        m.max = m.pride >= 100;
        if (m.max && !wasMax) f.battle.emit('mechanic', { fighter: f, kind: 'prideMax' });
      },
      damageOut(f) {
        return 1 + (f.mech.pride / 100) * 0.25;
      },
      armor(f, hit) {
        return f.mech.max && hit.impact <= 1;
      },
      on(f, ev, data) {
        const m = f.mech;
        const lowHp = f.hp / f.hpMax < 0.35 ? 1.5 : 1;
        if (ev === 'hitDealt') m.pride += 3.2 * lowHp;
        if (ev === 'perfectGuard' || ev === 'vanish' || ev === 'counterHit') m.pride += 18 * lowHp;
        if (ev === 'hitTaken' && data && data.impact >= 3) m.pride -= 8;
        m.pride = U.clamp(m.pride, 0, 100);
      },
      hud(f) {
        return { value: f.mech.pride / 100, label: 'PRIDE', active: f.mech.max, color: '#c77dff' };
      },
    },

    battleHardened: {
      init(f) {
        f.mech = { rage: false, fury: 0 };
      },
      update(f) {
        const m = f.mech;
        const was = m.rage;
        m.rage = f.alive && f.hp / f.hpMax < 0.3;
        if (m.rage && !was) f.battle.emit('mechanic', { fighter: f, kind: 'rage' });
        if (m.fury > 0) m.fury--;
        if (f.aura) {
          if (m.rage) f.aura.rageTint = true;
        }
      },
      damageOut(f) {
        const lost = 1 - f.hp / f.hpMax;
        return (1 + lost * 0.35) * (f.mech.fury > 0 ? 1.15 : 1);
      },
      damageIn(f) {
        return f.mech.rage ? 0.85 : 1;
      },
      armor(f, hit) {
        return (f.mech.rage || f.mech.fury > 0) && hit.impact <= 1;
      },
      kiRegenMul(f) {
        return f.mech.rage ? 1.7 : 1;
      },
      on(f, ev) {
        if (ev === 'allyDefeated') {
          f.mech.fury = 420;
          f.battle.emit('mechanic', { fighter: f, kind: 'fury' });
        }
      },
      hud(f) {
        return { value: 1 - f.hp / f.hpMax, label: f.mech.rage ? 'RAGE' : 'HARDENED', active: f.mech.rage || f.mech.fury > 0, color: '#ff5a3a' };
      },
    },

    /**
     * RADITZ — Ruthless: hits harder against opponents who are already
     * reeling, and every knockdown he causes feeds his arrogance (ki).
     */
    ruthless: {
      init(f) {
        f.mech = { gloat: 0 };
      },
      update(f) {
        if (f.mech.gloat > 0) f.mech.gloat--;
      },
      damageOut(f, hit) {
        const t = f.target;
        const reeling = t && ['hitstun', 'knockback', 'knockdown', 'guardBreak', 'stagger', 'getup'].includes(t.state);
        return (reeling ? 1.12 : 1) * (f.mech.gloat > 0 ? 1.08 : 1);
      },
      on(f, ev) {
        if (ev === 'hitDealt' && f.target && f.target.state === 'knockdown') {
          f.ki = Math.min(f.kiMax, f.ki + 6);
          f.mech.gloat = 240;
        }
      },
      hud(f) {
        return { value: f.mech.gloat / 240, label: 'RUTHLESS', active: f.mech.gloat > 0, color: '#c05aff' };
      },
    },

    /**
     * PICCOLO — Namekian Regeneration: after a few seconds without taking
     * damage, slowly regenerates lost health (never past 60% of max).
     */
    regeneration: {
      init(f) {
        f.mech = { calm: 0 };
      },
      update(f, dt) {
        const m = f.mech;
        m.calm += dt;
        if (m.calm > 4 && f.alive && f.hp < f.hpMax * 0.6) f.hp = Math.min(f.hpMax * 0.6, f.hp + f.hpMax * 0.012 * dt);
      },
      on(f, ev) {
        if (ev === 'hitTaken') f.mech.calm = 0;
      },
      hud(f) {
        return { value: Math.min(1, f.mech.calm / 4), label: 'REGEN', active: f.mech.calm > 4 && f.hp < f.hpMax * 0.6, color: '#7bd66a' };
      },
    },
  });

  /** Safe call helper used by Fighter. */
  SL.mech = function (f, fn, ...args) {
    const m = f.def.mechanic && Mechanics[f.def.mechanic.type];
    if (!m || !m[fn]) return undefined;
    return m[fn](f, ...args);
  };
})();
