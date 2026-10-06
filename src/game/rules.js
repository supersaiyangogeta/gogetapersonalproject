/*
 * Combat rules: pure functions and tuning tables with no rendering
 * dependencies, so they can be unit tested in Node (tests/run-tests.js).
 */
(function () {
  'use strict';
  const U = SL.util;

  const Rules = (SL.Rules = {
    FPS: 60,

    GUARD_CHIP: { melee: 0.1, ki: 0.22, beam: 0.3, explosion: 0.3, throw: 1 },
    GUARD_STAMINA: { melee: 9, heavy: 24, ki: 5, beam: 30, explosion: 20 },
    // A beam cancelled out of a landed melee hit may fire this early (frames), so
    // hit -> beam is a real combo for every beam. Before V0.3 it used each beam's
    // own minimum charge: Galick Gun (20) beat the hitstun, Kamehameha (22) did not,
    // and telemetry showed CPU Goku's cancel beams interrupted 7 times in 15.
    QUICK_BEAM_MIN: 14,
    // a player hit by two or more enemies: hitstun received within 2.5 s beyond this breaks them free
    GROUP_STUN_CAP: 110,
    PERFECT_GUARD_WINDOW: 8, // frames after pressing guard
    VANISH_WINDOW: 8, // frames after pressing dodge
    HITSTOP: [0, 3, 6, 9, 12, 16],
    TRAUMA: [0, 0.1, 0.22, 0.38, 0.6, 0.85],

    COST: {
      dash: 6,
      dodge: 18,
      vanishExtra: 10,
      burstEscape: 50,
      chaseKi: 10,
      chaseStamina: 10,
      blastKi: 3,
      chargedBlastKi: 14,
      quickRecover: 10,
    },

    SPEED: { run: 9, fly: 12, boost: 30, dash: 40, homing: 36, vertical: 10 },

    /** Damage multiplier for the nth hit (1-based) of a combo. */
    comboScale(hitIndex) {
      return Math.max(0.35, 1 - 0.055 * Math.max(0, hitIndex - 1));
    },

    /**
     * ctx: { base, type, hitIndex, attackerMul, defenderMul, guarded, rulesMul }
     * attackerMul: product of form/mechanic/stat damage multipliers.
     * defenderMul: product of form/mechanic/stat defense multipliers (higher = tankier).
     */
    computeDamage(ctx) {
      let d = ctx.base;
      d *= ctx.attackerMul === undefined ? 1 : ctx.attackerMul;
      d /= Math.max(0.1, ctx.defenderMul === undefined ? 1 : ctx.defenderMul);
      if (ctx.type !== 'beam' && ctx.type !== 'explosion') d *= this.comboScale(ctx.hitIndex || 1);
      if (ctx.guarded) d *= this.GUARD_CHIP[ctx.type] === undefined ? 0.2 : this.GUARD_CHIP[ctx.type];
      d *= ctx.rulesMul === undefined ? 1 : ctx.rulesMul;
      return Math.max(1, Math.round(d));
    },

    /** Picks the heavy finisher for a given number of lights already landed. */
    heavyFor(heavyMap, chainIndex) {
      let best = null, bestKey = -1;
      for (const k of Object.keys(heavyMap)) {
        const n = Number(k);
        if (n <= chainIndex && n > bestKey) {
          best = heavyMap[k];
          bestKey = n;
        }
      }
      return best;
    },

    canAfford(fighter, kiCost) {
      return fighter.infiniteKi || fighter.ki >= kiCost;
    },

    spendKi(fighter, kiCost) {
      if (fighter.infiniteKi) return true;
      if (SL.Dev && SL.Dev.noKiCost(fighter)) return true;
      if (fighter.ki < kiCost) return false;
      fighter.ki -= kiCost;
      return true;
    },

    spendStamina(fighter, cost) {
      if (fighter.infiniteStamina) return true;
      if (fighter.stamina < cost) return false;
      fighter.stamina -= cost;
      fighter.staminaDelay = 36;
      return true;
    },

    /** Form + stat + balance multipliers. */
    multipliers(fighter) {
      // leveled forms (Kaioken x3...) resolve their multipliers into fighter.formMult
      const f = fighter.formMult || (fighter.form && fighter.form.mult ? fighter.form.mult : {});
      const s = fighter.def.stats;
      const bal = fighter.balance === 'canon' ? Math.sqrt(s.canonPower || 1) : 1;
      const out = this._baseMult(f, s, bal);
      // lingering Kaioken strain after powering down
      const pen = fighter.strainPenalty;
      if (pen) for (const k of Object.keys(pen)) if (out[k] !== undefined) out[k] *= pen[k];
      // mechanics can speed a fighter up (e.g. a Saibaman frenzy)
      const sm = SL.mech && fighter.def && SL.mech(fighter, 'speedMul');
      if (sm) out.speed *= sm;
      return out;
    },

    _baseMult(f, s, bal) {
      return {
        damage: (f.damage || 1) * (s.power || 1) * bal,
        defense: (f.defense || 1) * (s.defense || 1) * bal,
        speed: (f.speed || 1) * (s.speed || 1),
        kiRegen: (f.kiRegen || 1) * (s.kiRegen || 2),
        chargeRate: (f.chargeRate || 1) * (s.chargeRate || 30),
        staminaRegen: f.staminaRegen || 1,
        guardStamina: f.guardStamina || 1,
        accel: f.accel || 1,
      };
    },

    DIFFICULTY: {
      easy: { reaction: 26, guard: 0.12, perfect: 0.02, vanish: 0.02, escape: 0.0, comboLen: 2, mistake: 0.3, mash: 6, aggression: 0.6, decisionEvery: 16, blockBias: 0.4 },
      normal: { reaction: 17, guard: 0.32, perfect: 0.08, vanish: 0.1, escape: 0.08, comboLen: 3, mistake: 0.14, mash: 8.5, aggression: 0.85, decisionEvery: 11, blockBias: 0.7 },
      hard: { reaction: 11, guard: 0.5, perfect: 0.18, vanish: 0.24, escape: 0.22, comboLen: 4, mistake: 0.06, mash: 10.5, aggression: 1, decisionEvery: 8, blockBias: 0.9 },
      veryhard: { reaction: 7, guard: 0.62, perfect: 0.3, vanish: 0.38, escape: 0.4, comboLen: 5, mistake: 0.02, mash: 12.5, aggression: 1.1, decisionEvery: 6, blockBias: 1 },
    },

    /** Story mission rank from score components. */
    rank(score) {
      if (score >= 8500) return 'S';
      if (score >= 7000) return 'A';
      if (score >= 5500) return 'B';
      if (score >= 4000) return 'C';
      return 'D';
    },

    /** Beam power used in clashes. */
    beamPower(chargeFrac, fighter) {
      const m = fighter ? this.multipliers(fighter).damage : 1;
      return (0.7 + 0.6 * U.clamp01(chargeFrac)) * m;
    },

    /**
     * Beam clash push step. push in [-1, 1]; positive favors side A.
     * mashA / mashB are presses-per-second (or equivalent hold rate).
     */
    clashStep(push, powerA, powerB, mashA, mashB, dt, elapsed = 2) {
      if (elapsed < this.CLASH_GRACE) return push;
      const a = powerA * (0.35 + mashA * 0.09);
      const b = powerB * (0.35 + mashB * 0.09);
      const ramp = 1 + Math.max(0, elapsed - 4) * 0.3;
      const delta = ((a - b) / Math.max(0.5, a + b)) * 1.35 * ramp * dt;
      return U.clamp(push + delta, -1, 1);
    },
    CLASH_GRACE: 0.9,
  });
})();
