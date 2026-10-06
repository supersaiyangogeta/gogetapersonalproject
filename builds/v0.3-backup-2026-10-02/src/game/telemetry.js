/*
 * Battle telemetry: what actually happened in a fight, per fighter.
 *
 * Win rates alone hide why a character loses. This records the details that
 * explain it — damage by source and by move, hits landed and taken, attacks
 * whiffed, guards, Perfect Guards, vanishes, throws, time spent stunned or
 * guarding, combo lengths, specials used and landed, overloads — and turns
 * them into plain-language insights shown on the results screen.
 *
 * Local only: the last battles are kept in this browser's localStorage
 * (SL.Telemetry.history()) so your own play sessions can be compared later.
 */
(function () {
  'use strict';
  const STORE_KEY = 'saiyanLegacy.telemetry.v1';
  const STUN = ['hitstun', 'knockback', 'knockdown', 'getup', 'stagger', 'guardBreak', 'held'];

  function blank(f) {
    return {
      id: f.def.id, name: f.name, team: f.team, player: !!f.isPlayer,
      damageDealt: 0, damageTaken: 0, bySource: {}, byMove: {},
      hitsLanded: 0, hitsTaken: 0, attacks: 0, whiffs: 0,
      blockedHits: 0, hitsIntoGuard: 0, perfectGuards: 0, vanishes: 0, bursts: 0,
      throwsLanded: 0, throwsTaken: 0, guardBreaks: 0, knockdowns: 0,
      specials: {}, combos: [], overloads: 0, transforms: 0,
      frames: 0, stateFrames: {}, formFrames: {},
      // health lost outside of hits (Kaioken drain, overload, life-cost techniques)
      hpLostOther: 0, lastHp: f.hp, hitLossThisTick: 0,
      kiSpent: {},
      // character mechanic: time its HUD reports active, average damage multiplier, hits it shrugged off
      mechActiveFrames: 0, mechDamageSum: 0, armoredHits: 0, armoredByMechanic: 0,
    };
  }

  class Telemetry {
    constructor(battle) {
      this.battle = battle;
      this.rec = new Map();
      this.frames = 0;
      const b = battle;
      const R = (f) => {
        if (!f || !f.def) return null;
        let r = this.rec.get(f);
        if (!r) this.rec.set(f, (r = blank(f)));
        return r;
      };
      this.R = R;
      b.on('damage', (e) => {
        const t = R(e.target), a = R(e.attacker);
        if (e.blocked) {
          // chip damage through a guard still counts as damage, not as a landed hit
          if (t) {
            t.hitLossThisTick += e.amount;
            t.blockedHits++;
            t.damageTaken += e.amount;
          }
          if (a) {
            a.hitsIntoGuard++;
            a.damageDealt += e.amount;
          }
          return;
        }
        if (t) {
          t.hitLossThisTick += e.amount;
          t.damageTaken += e.amount;
          t.hitsTaken++;
        }
        if (a) {
          // damage within 2 seconds of a special counts toward that special (its follow-ups included)
          const open = a.specialOpen;
          if (open && this.battle.frame <= open.until) {
            const sp = a.specials[open.k];
            sp.damage += e.amount;
            if (!open.landed) {
              open.landed = true;
              sp.landed++;
            }
          }
          a.damageDealt += e.amount;
          a.hitsLanded++;
          a.bySource[e.type] = (a.bySource[e.type] || 0) + e.amount;
          const mv = e.attacker.state === 'attack' && e.attacker.sd.move ? e.attacker.sd.move.id : e.type === 'melee' ? 'other melee' : null;
          if (mv) a.byMove[mv] = (a.byMove[mv] || 0) + e.amount;
        }
      });
      b.on('armored', (e) => {
        const r = R(e.fighter);
        if (!r) return;
        r.armoredHits++;
        if (e.source === 'mechanic') r.armoredByMechanic++;
      });
      b.on('perfectGuard', (e) => R(e.fighter) && R(e.fighter).perfectGuards++);
      b.on('vanish', (e) => R(e.fighter) && R(e.fighter).vanishes++);
      b.on('burst', (e) => R(e.fighter) && R(e.fighter).bursts++);
      b.on('throw', (e) => {
        if (R(e.fighter)) R(e.fighter).throwsLanded++;
        if (R(e.victim)) R(e.victim).throwsTaken++;
      });
      b.on('guardBreak', (e) => R(e.fighter) && R(e.fighter).guardBreaks++);
      b.on('overload', (e) => R(e.fighter) && R(e.fighter).overloads++);
      b.on('transformBurst', (e) => R(e.fighter) && R(e.fighter).transforms++);
      b.on('comboEnd', (e) => R(e.fighter) && R(e.fighter).combos.push(e.hits));
      b.on('special', (e) => {
        const r = R(e.fighter);
        if (!r) return;
        const k = (e.spec && e.spec.name) || e.slot;
        r.specials[k] = r.specials[k] || { used: 0, landed: 0, damage: 0 };
        r.specials[k].used++;
        r.specialOpen = { k, until: this.battle.frame + 120, landed: false };
        const cost = e.fighter.skillCost ? e.fighter.skillCost(e.slot) : 0;
        if (cost) r.kiSpent[k] = (r.kiSpent[k] || 0) + cost;
      });
      b.onTick(() => this._tick());
    }

    _tick() {
      const b = this.battle;
      const live = b.phase === 'fight' && !b.inputLocked;
      if (live) this.frames++;
      for (const f of b.fighters) {
        const r = this.R(f);
        // health lost between samples that no hit explains
        const drop = r.lastHp - f.hp - r.hitLossThisTick;
        if (live && drop > 0.5) r.hpLostOther += drop;
        r.lastHp = f.hp;
        r.hitLossThisTick = 0;
        if (!live || !f.alive || f.hidden || (f.tags && f.tags.cinematic)) continue;
        r.frames++;
        r.stateFrames[f.state] = (r.stateFrames[f.state] || 0) + 1;
        const form = f.form ? f.form.id + (f.form.levels ? ' ' + f.form.levels[f.formLevel || 0].name : '') : 'base';
        r.formFrames[form] = (r.formFrames[form] || 0) + 1;
        const hud = SL.mech(f, 'hud');
        if (hud && hud.active) r.mechActiveFrames++;
        r.mechDamageSum += SL.mech(f, 'damageOut', {}) || 1;
        // an attack that ends without connecting (hit or blocked) is a whiff
        if (f.state === 'attack' && f.sd !== f._telSd) {
          if (f._telSd && f._telSd.move && !f._telSd.hit) r.whiffs++;
          f._telSd = f.sd;
          r.attacks++;
        } else if (f.state !== 'attack' && f._telSd) {
          if (!f._telSd.hit) r.whiffs++;
          f._telSd = null;
        }
        if (f.state === 'knockdown' && f.stateFrame === 1) r.knockdowns++;
      }
    }

    /** Numbers per fighter plus derived rates. */
    summary() {
      const out = [];
      for (const r of this.rec.values()) {
        const stun = STUN.reduce((n, s) => n + (r.stateFrames[s] || 0), 0);
        out.push(Object.assign({}, r, {
          seconds: +(r.frames / 60).toFixed(1),
          stunShare: r.frames ? +(stun / r.frames).toFixed(3) : 0,
          guardShare: r.frames ? +((r.stateFrames.guard || 0) / r.frames).toFixed(3) : 0,
          whiffRate: r.attacks ? +(r.whiffs / r.attacks).toFixed(3) : 0,
          avgCombo: r.combos.length ? +(r.combos.reduce((a, c) => a + c, 0) / r.combos.length).toFixed(1) : 0,
          mechUptime: r.frames ? +(r.mechActiveFrames / r.frames).toFixed(3) : 0,
          mechDamageAvg: r.frames ? +(r.mechDamageSum / r.frames).toFixed(3) : 1,
          topMove: Object.entries(r.byMove).sort((a, c) => c[1] - a[1])[0] || null,
        }));
      }
      return out;
    }

    /** Plain-language reasons behind the result, most telling first. */
    insights(focus) {
      const all = this.summary();
      const me = all.find((r) => (focus ? r.id === focus.def.id && r.team === focus.team : r.player));
      if (!me) return [];
      const foes = all.filter((r) => r.team !== me.team);
      const foe = foes.sort((a, c) => c.damageDealt - a.damageDealt)[0];
      const tips = [];
      const pct = (x) => Math.round(x * 100) + '%';
      if (me.stunShare > 0.2) tips.push({ w: me.stunShare, text: 'Spent ' + pct(me.stunShare) + ' of the fight stunned, knocked down or held — escape combos earlier (Dodge during hitstun bursts free).' });
      if (me.whiffRate > 0.4 && me.attacks >= 10) tips.push({ w: me.whiffRate * 0.8, text: pct(me.whiffRate) + ' of attacks hit nothing — close the distance first or punish recoveries.' });
      if (me.throwsTaken >= 3) tips.push({ w: 0.3 + me.throwsTaken * 0.05, text: 'Thrown ' + me.throwsTaken + ' times — guarding too long invites throws; dodge or strike instead.' });
      if (me.guardShare > 0.3) tips.push({ w: me.guardShare * 0.7, text: 'Guarded ' + pct(me.guardShare) + ' of the time — a well-timed guard is a Perfect Guard; a held one gets broken.' });
      if (me.guardBreaks >= 2) tips.push({ w: 0.4, text: 'Guard broken ' + me.guardBreaks + ' times.' });
      if (me.overloads >= 1) tips.push({ w: 0.35 + me.overloads * 0.1, text: 'Kaioken overloaded ' + me.overloads + ' time(s) — power down before the strain bar fills.' });
      if (me.perfectGuards + me.vanishes >= 4) tips.push({ w: 0.2, text: 'Read the opponent well: ' + me.perfectGuards + ' Perfect Guards and ' + me.vanishes + ' vanishes.' });
      if (foe && foe.topMove && foe.damageDealt > 0 && foe.topMove[1] / foe.damageDealt > 0.3) tips.push({ w: 0.25 + foe.topMove[1] / foe.damageDealt * 0.3, text: foe.name + ' did ' + pct(foe.topMove[1] / foe.damageDealt) + ' of their damage with ' + foe.topMove[0] + '.' });
      if (foe && me.damageDealt < foe.damageDealt * 0.6) tips.push({ w: 0.3, text: 'Dealt ' + Math.round(me.damageDealt) + ' damage against ' + Math.round(foe.damageDealt) + ' taken.' });
      return tips.sort((a, c) => c.w - a.w).map((t) => t.text);
    }

    /** Keep a short local history of battles for later comparison (this browser only). */
    store(result) {
      try {
        const list = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
        list.push({ at: Date.now(), mode: this.battle.mode, won: result && result.won, fighters: this.summary().map((r) => ({ id: r.id, player: r.player, team: r.team, dmg: Math.round(r.damageDealt), taken: Math.round(r.damageTaken), stun: r.stunShare, whiff: r.whiffRate, guard: r.guardShare, thrown: r.throwsTaken, pg: r.perfectGuards, sec: r.seconds })) });
        while (list.length > 40) list.shift();
        localStorage.setItem(STORE_KEY, JSON.stringify(list));
      } catch (e) {
        /* storage unavailable: telemetry is optional */
      }
    }

    static history() {
      try {
        return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    }
  }

  SL.Telemetry = Telemetry;
})();
