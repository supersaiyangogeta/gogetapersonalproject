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
    /*
     * GOKU — Saiyan Instinct. Vanishing or a Perfect Guard empowers his next
     * strikes at once. He also adapts: every hit he takes or blocks fills an
     * Adaptation meter, and when it is full the same empowerment triggers.
     * (Balance note: before V0.3 only vanish/Perfect Guard triggered it, which
     * the CPU and most new players manage less than once a fight — telemetry
     * showed an average damage bonus of x1.02 against Pride's x1.13.)
     */
    saiyanInstinct: {
      EMPOWER_FRAMES: 180,
      init(f) {
        f.mech = { empower: 0, zenkai: false, adapt: 0 };
      },
      empower(f, kind) {
        const first = f.mech.empower <= 0;
        f.mech.empower = this.EMPOWER_FRAMES;
        if (first) {
          f.battle.vfx.sparks(f.chest(), 0x8fd8ff, 18, 10, 0.1);
          f.battle.emit('mechanic', { fighter: f, kind });
        }
      },
      update(f) {
        if (f.mech.empower > 0) {
          f.mech.empower--;
          if (f.frame % 8 === 0) f.battle.vfx.sparks(f.chest(), 0x8fd8ff, 1, 3, 0.06);
        }
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
      on(f, ev, data) {
        const m = f.mech;
        if (ev === 'vanish' || ev === 'perfectGuard') {
          this.empower(f, 'instinct');
          return;
        }
        if (m.empower > 0) return;
        if (ev === 'hitTaken') m.adapt += 4 + ((data && data.impact) || 1) * 2;
        if (ev === 'blocked') m.adapt += 3;
        if (m.adapt >= 100) {
          m.adapt = 0;
          this.empower(f, 'adapted');
        }
      },
      hud(f) {
        const m = f.mech;
        if (m.empower > 0) return { value: m.empower / this.EMPOWER_FRAMES, label: 'INSTINCT', active: true, color: '#8fd8ff' };
        return { value: Math.min(1, m.adapt / 100), label: 'ADAPTING', active: false, color: '#5aa8d8' };
      },
    },

    /*
     * GOGETA — Fusion Tempo. Not Vegito's instinct: a rhythm. Every clean hit, counter, vanish and
     * Perfect Guard keeps the tempo up; getting hit knocks it down, and standing around lets it
     * die. At full tempo he is IN THE ZONE for five seconds: faster, harder, and vanishing costs
     * him almost nothing — then it drops back to a third. The player who keeps the pressure on
     * gets the fusion's real speed; the one who trades hits never sees it.
     */
    fusionTempo: {
      ZONE_FRAMES: 300,
      init(f) {
        f.mech = { tempo: 0, zone: 0, idle: 0 };
      },
      update(f, dt) {
        const m = f.mech;
        if (m.zone > 0) {
          m.zone--;
          if (f.frame % 6 === 0) f.battle.vfx.sparks(f.chest(), 0xffe27a, 1, 4, 0.06);
          if (m.zone === 0) m.tempo = 33;
          return;
        }
        const busy = ['attack', 'rush', 'dash', 'teleport', 'specialThrow', 'beamFire'].includes(f.state);
        m.idle = busy ? 0 : m.idle + dt;
        if (m.idle > 2) m.tempo = Math.max(0, m.tempo - 8 * dt);
      },
      add(f, n) {
        const m = f.mech;
        if (m.zone > 0) return;
        m.tempo = U.clamp(m.tempo + n, 0, 100);
        m.idle = 0;
        if (m.tempo >= 100) {
          m.zone = this.ZONE_FRAMES;
          f.battle.vfx.ring(f.chest(), 5, 0xffe27a, 0.4);
          f.battle.vfx.flash(f.chest(), 3, 0xfff4c0, 0.2, SL.Toon.tex.glow);
          f.battle.sfx('tierUp', f, { pitch: 1.15 });
          f.battle.emit('mechanic', { fighter: f, kind: 'fusionZone' });
          f.battle.bark(f, 'tempo', true);
        }
      },
      speedMul(f) {
        return f.mech.zone > 0 ? 1.12 : 1;
      },
      damageOut(f) {
        return f.mech.zone > 0 ? 1.15 : 1 + f.mech.tempo * 0.0006;
      },
      costMul(f, action) {
        return action === 'dodge' || action === 'vanish' ? (f.mech.zone > 0 ? 0.4 : 0.8) : 1;
      },
      on(f, ev, data) {
        if (ev === 'hitDealt') this.add(f, data && data.type === 'melee' ? 6 : 3);
        else if (ev === 'counterHit') this.add(f, 18);
        else if (ev === 'vanish' || ev === 'perfectGuard') this.add(f, 16);
        else if (ev === 'hitTaken' && f.mech.zone <= 0) f.mech.tempo = Math.max(0, f.mech.tempo - 8 - ((data && data.impact) || 1) * 5);
      },
      hud(f) {
        const m = f.mech;
        if (m.zone > 0) return { value: m.zone / this.ZONE_FRAMES, label: 'IN THE ZONE', active: true, color: '#ffe27a' };
        return { value: m.tempo / 100, label: 'TEMPO', active: false, color: '#e8a83a' };
      },
    },

    /*
     * BEERUS — God's Whim. He starts BORED (his blows at 90 %). Every blow that lands on him makes
     * him more INTERESTED; at full interest he is ROUSED for eight seconds (140 % damage, faster),
     * then bored again with the meter emptied. Interest also drifts down while nothing happens.
     * The answer to him is a burst or distance, never a poke.
     */
    godsWhim: {
      ROUSED_FRAMES: 480,
      init(f) {
        f.mech = { interest: 0, roused: 0 };
      },
      update(f, dt) {
        const m = f.mech;
        if (m.roused > 0) {
          m.roused--;
          if (m.roused === 0) {
            m.interest = 0;
            f.battle.emit('mechanic', { fighter: f, kind: 'bored' });
          }
        } else m.interest = Math.max(0, m.interest - 2.5 * dt);
      },
      speedMul(f) {
        return f.mech.roused > 0 ? 1.15 : 1;
      },
      damageOut(f) {
        return f.mech.roused > 0 ? 1.4 : 0.9;
      },
      on(f, ev, data) {
        const m = f.mech;
        if (m.roused > 0 || ev !== 'hitTaken') return;
        m.interest += 7 + ((data && data.impact) || 1) * 4;
        if (m.interest >= 100) {
          m.interest = 100;
          m.roused = this.ROUSED_FRAMES;
          f.battle.vfx.ring(f.chest(), 4, 0xc89aff, 0.45);
          f.battle.sfx('kiUp', f, { pitch: 0.8 });
          f.battle.emit('mechanic', { fighter: f, kind: 'roused' });
        }
      },
      hud(f) {
        const m = f.mech;
        if (m.roused > 0) return { value: m.roused / this.ROUSED_FRAMES, label: 'INTERESTED', active: true, color: '#c89aff' };
        return { value: m.interest / 100, label: 'BORED', active: false, color: '#8a7aa8' };
      },
    },

    /*
     * JIREN — Unshakable. While his FOCUS holds, light blows do not move him (armor: impact 1),
     * each one chipping at the focus; a heavy blow knocks a chunk out of it. Emptied, it breaks
     * for four seconds — he flinches like anybody — and comes back at 60 %. A Perfect Guard opens
     * his counter window and steadies the focus. The fight against him is about breaking his focus with heavies,
     * not mashing lights into a wall.
     */
    unshakable: {
      BREAK_FRAMES: 240,
      init(f) {
        f.mech = { focus: 100, broken: 0 };
      },
      update(f, dt) {
        const m = f.mech;
        if (m.broken > 0) {
          m.broken--;
          if (m.broken === 0) {
            m.focus = 60;
            f.battle.vfx.ring(f.chest(), 3, 0xff7050, 0.35);
          }
        } else m.focus = Math.min(100, m.focus + 9 * dt);
      },
      armor(f, hit) {
        return f.mech.broken <= 0 && f.mech.focus > 0 && (hit.impact || 1) <= 1 && ['free', 'guard', 'charge', 'attack', 'dash'].includes(f.state);
      },
      _drain(f, n) {
        const m = f.mech;
        if (m.broken > 0) return;
        m.focus -= n;
        if (m.focus <= 0) {
          m.focus = 0;
          m.broken = this.BREAK_FRAMES;
          f.battle.vfx.ring(f.chest(), 4, 0xff4040, 0.45);
          f.battle.vfx.sparks(f.chest(), 0xff6a4a, 20, 10, 0.12);
          f.battle.sfx('guardBreak', f, { pitch: 0.7 });
          f.battle.emit('mechanic', { fighter: f, kind: 'focusBroken' });
        }
      },
      on(f, ev, data) {
        if (ev === 'armoredHit') this._drain(f, 16);
        else if (ev === 'hitTaken' && data && (data.impact || 1) >= 2) this._drain(f, 10 + (data.impact || 1) * 6);
        else if (ev === 'perfectGuard' && f.mech.broken <= 0) f.mech.focus = Math.min(100, f.mech.focus + 20);
      },
      hud(f) {
        const m = f.mech;
        if (m.broken > 0) return { value: m.broken / this.BREAK_FRAMES, label: 'FOCUS BROKEN', active: false, color: '#ff6060' };
        return { value: m.focus / 100, label: 'FOCUS', active: m.focus >= 100, color: '#ff5030' };
      },
    },

    /*
     * FUTURE TRUNKS — Sword Guard. A guard timed on a ki shot knocks it back with the blade
     * (def.swordDeflect, handled where projectiles meet fighters); every deflection sharpens his
     * next cuts for two seconds (+15 %). It rewards reading a zoner instead of running from one.
     */
    swordsman: {
      EDGE_FRAMES: 120,
      init(f) {
        f.mech = { edge: 0, deflects: 0 };
      },
      update(f) {
        if (f.mech.edge > 0) f.mech.edge--;
      },
      on(f, ev) {
        if (ev !== 'deflect') return;
        f.mech.deflects++;
        f.mech.edge = this.EDGE_FRAMES;
        f.battle.emit('mechanic', { fighter: f, kind: 'swordGuard' });
      },
      damageOut(f, hit) {
        return f.mech.edge > 0 && hit && hit.type === 'melee' ? 1.15 : 1;
      },
      hud(f) {
        return { value: f.mech.edge / this.EDGE_FRAMES, label: 'SWORD GUARD', active: f.mech.edge > 0, color: '#bfe4ff' };
      },
    },

    /*
     * VEGETA — Pride. Pressing an opponent at close range (attacking, or the
     * opponent guarding or reeling), landing hits, counters, Perfect Guards and
     * vanishes build it; up to +20% damage. Taking hits wounds it, retreating
     * loses it. At max he shrugs off one light hit — which costs him Pride.
     * (Balance note: before V0.3 standing near the opponent built it and hits
     * taken barely lowered it; telemetry showed x1.13 average damage for CPU Vegeta.)
     */
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
            m.far = 0;
            const pressing = f.state === 'attack' || f.state === 'rush' || ['guard', 'hitstun', 'knockback', 'knockdown', 'guardBreak', 'stagger', 'getup', 'held'].includes(t.state);
            if (pressing) m.pride += 2.4 * lowHp * dt;
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
        return 1 + (f.mech.pride / 100) * 0.2;
      },
      armor(f, hit) {
        return f.mech.max && hit.impact <= 1;
      },
      on(f, ev, data) {
        const m = f.mech;
        const lowHp = f.hp / f.hpMax < 0.35 ? 1.5 : 1;
        if (ev === 'hitDealt') m.pride += 3.2 * lowHp;
        if (ev === 'perfectGuard' || ev === 'vanish' || ev === 'counterHit') m.pride += 18 * lowHp;
        if (ev === 'hitTaken') m.pride -= data && data.impact >= 3 ? 10 : 1.5;
        if (ev === 'armoredHit' && m.max) {
          // the proud shrug: visible, and it costs him
          m.pride -= 25;
          m.max = false;
          f.battle.vfx.sparks(f.chest(), 0xc77dff, 12, 8, 0.1);
          f.battle.emit('mechanic', { fighter: f, kind: 'prideShrug' });
        }
        m.pride = U.clamp(m.pride, 0, 100);
      },
      hud(f) {
        return { value: f.mech.pride / 100, label: 'PRIDE', active: f.mech.max, color: '#c77dff' };
      },
    },

    /*
     * CHIAOTZU — Psychic Link. His own ki recovers faster, and while he is
     * alive every ally within 30 m slowly recovers ki too (faint violet motes
     * drift between them so the link is visible).
     */
    psychicLink: {
      RANGE: 30,
      init(f) {
        f.mech = { linked: 0 };
      },
      update(f, dt) {
        const m = f.mech;
        const allies = f.alive ? f.battle.alliesOf(f).filter((a) => a !== f && a.alive && !a.hidden && a.pos.distanceTo(f.pos) < this.RANGE) : [];
        m.linked = allies.length;
        for (const a of allies) {
          if (!a.infiniteKi) a.ki = Math.min(a.kiMax, a.ki + 1.4 * dt);
          if (f.frame % 30 === 0) f.battle.vfx.sparks(a.chest(), 0xe0c0ff, 2, 2, 0.06);
        }
      },
      kiRegenMul(f) {
        return 1.3;
      },
      hud(f) {
        return { value: f.mech.linked ? 1 : 0.35, label: f.mech.linked ? 'PSYCHIC LINK ×' + f.mech.linked : 'PSYCHIC LINK', active: f.mech.linked > 0, color: '#d8a8ff' };
      },
    },

    /*
     * YAJIROBE — Senzu Bean. He starts every battle with a small pouch of beans
     * (the Senzu Bean technique eats or tosses them). A coward's instinct: any
     * strike that lands on an opponent's back cuts 40% deeper.
     */
    senzuBean: {
      init(f) {
        const sp = f.def.specials && Object.values(f.def.specials).find((x) => x && x.type === 'senzu');
        f.mech = { beans: sp ? sp.count : 0, backstabs: 0 };
      },
      damageOut(f, hit) {
        const t = f.target;
        if (!t || !t.alive || !hit || hit.type === 'beam') return 1;
        const toMe = f.pos.clone().sub(t.pos).setY(0);
        if (toMe.lengthSq() < 0.0001) return 1;
        toMe.normalize();
        return t.forward.dot(toMe) < -0.3 ? 1.4 : 1;
      },
      on(f, ev) {
        if (ev === 'hitDealt' && f.target && f.target.forward.dot(f.pos.clone().sub(f.target.pos).setY(0).normalize()) < -0.3) {
          f.mech.backstabs++;
          if (f.frame % 2 === 0) f.battle.vfx.sparks(f.target.chest(), 0xfff0a0, 6, 5, 0.08);
        }
      },
      hud(f) {
        return { value: Math.min(1, (f.mech.beans || 0) / 2), label: 'SENZU ×' + (f.mech.beans || 0), active: (f.mech.beans || 0) > 0, color: '#8fe07a' };
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
        // (Balance note: was +35% at zero health plus 15% damage reduction in rage; telemetry showed
        // x1.14 average damage for CPU Bardock and 38 wins in 40 against Goku or Vegeta. Rage keeps its
        // light-hit armor and ki surge — the visible part — but no longer also reduces damage.)
        const lost = 1 - f.hp / f.hpMax;
        return (1 + lost * 0.15) * (f.mech.fury > 0 ? 1.15 : 1);
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
        if (m.calm > 4 && f.alive && f.hp < f.hpMax * 0.6) {
          f.hp = Math.min(f.hpMax * 0.6, f.hp + f.hpMax * 0.02 * dt);
          if (!m.regenerating) {
            m.regenerating = true;
            f.battle.emit('mechanic', { fighter: f, kind: 'regen' });
          }
          // green motes rising off the body: the player can see it working
          if (f.frame % 6 === 0) f.battle.vfx.sparks(f.chest(), 0x9aff7a, 2, 3, 0.08);
        } else m.regenerating = false;
      },
      on(f, ev) {
        if (ev === 'hitTaken') f.mech.calm = 0;
      },
      hud(f) {
        return { value: Math.min(1, f.mech.calm / 4), label: 'REGEN', active: f.mech.calm > 4 && f.hp < f.hpMax * 0.6, color: '#7bd66a' };
      },
    },

    /**
     * KID GOHAN — Hidden Potential: hits taken and fallen allies fill a meter.
     * At 100 (or when a story moment forces it) his power erupts: he is
     * UNLEASHED for 8 seconds (much more damage, super armor against light and
     * medium hits, faster ki, Hidden Power Blast available), then DRAINED for 5.
     */
    hiddenPotential: {
      UNLEASH_FRAMES: 480,
      DRAIN_FRAMES: 300,
      init(f) {
        f.mech = { potential: 0, unleashed: false, unleashT: 0, drained: 0 };
      },
      update(f, dt) {
        const m = f.mech;
        if (m.unleashed) {
          m.unleashT--;
          if (m.unleashT % 6 === 0) f.battle.vfx.sparks(f.chest(), 0xf0d8ff, 3, 6, 0.08);
          if (m.unleashT <= 0) {
            m.unleashed = false;
            m.drained = this.DRAIN_FRAMES;
            f.stamina = Math.min(f.stamina, f.staminaMax * 0.35);
            f.aura.setStyle(f.form.aura || { color: 0xffffff });
            f.battle.emit('mechanic', { fighter: f, kind: 'potentialEnd' });
          }
          return;
        }
        if (m.drained > 0) m.drained--;
        // desperation slowly builds on its own when badly hurt
        if (f.alive && f.hp / f.hpMax < 0.35 && m.drained <= 0) m.potential += 6 * dt;
        if (m.potential >= 100 && f.alive && !f.lockedSlots?.potential) this.unleash(f);
      },
      unleash(f) {
        const m = f.mech;
        const b = f.battle;
        m.potential = 0;
        m.unleashed = true;
        m.unleashT = this.UNLEASH_FRAMES;
        m.drained = 0;
        f.ki = Math.min(f.kiMax, f.ki + 40);
        // a character can give the outburst its own colour (Uub's is pale pink: def.mechanic.aura)
        f.aura.setStyle((f.def.mechanic && f.def.mechanic.aura) || { color: 0xf4e4ff, core: 0xffffff, particles: 0xe0c0ff, speed: 1.8, sharp: 0.6, sparks: 0xffffff });
        const c = f.chest();
        b.vfx.flash(c, 5, 0xffffff, 0.3, SL.Toon.tex.glow);
        b.vfx.ring(c, 9, 0xf0d8ff, 0.5);
        b.vfx.ring(f.pos.clone().add(new THREE.Vector3(0, 0.2, 0)), 12, 0xf0d8ff, 0.7, new THREE.Vector3(0, 1, 0));
        b.vfx.sparks(c, 0xffffff, 40, 16, 0.14);
        b.sfx('transformBurst', f, { pitch: 1.35 });
        b.cameraTraumaAt(c, 0.55);
        SL.ScreenFX.flash(0.3, '#f4e8ff');
        f.anim.squash = 0.2;
        f.flash = 0.6;
        // the outburst shoves everything nearby away
        for (const e of b.enemiesOf(f)) {
          const d = e.pos.distanceTo(f.pos);
          if (d < 9 && e.state !== 'knockdown') e.vel.addScaledVector(f.dirTo(e), 22 * (1 - d / 9));
        }
        b.emit('mechanic', { fighter: f, kind: 'potential' });
      },
      damageOut(f) {
        return f.mech.unleashed ? 1.7 : f.mech.drained > 0 ? 0.8 : 1;
      },
      damageIn(f) {
        return f.mech.unleashed ? 0.65 : 1;
      },
      armor(f, hit) {
        return f.mech.unleashed && hit.impact <= 2;
      },
      kiRegenMul(f) {
        return f.mech.unleashed ? 2.5 : 1;
      },
      on(f, ev, data) {
        const m = f.mech;
        if (m.unleashed) return;
        if (ev === 'hitTaken') m.potential += 3 + ((data && data.impact) || 1) * 3.5;
        if (ev === 'allyDefeated') m.potential += 65;
      },
      hud(f) {
        const m = f.mech;
        if (m.unleashed) return { value: m.unleashT / this.UNLEASH_FRAMES, label: 'UNLEASHED', active: true, color: '#e8c8ff' };
        return { value: m.drained > 0 ? 0 : Math.min(1, m.potential / 100), label: m.drained > 0 ? 'DRAINED' : 'POTENTIAL', active: false, color: '#c89aff' };
      },
    },
  });

  /**
   * SAIBAMAN — Pack Hunter: a little stronger for every packmate close by;
   * when a packmate falls the others screech and frenzy for a few seconds.
   * Defeated Saibamen wither into green smoke instead of lying on the field.
   */
  Mechanics.packHunter = {
    FRENZY_FRAMES: 300,
    init(f) {
      f.mech = { pack: 0, frenzy: 0, wither: 0, vaporized: false, side: Math.random() < 0.5 ? 1 : -1 };
    },
    update(f) {
      const m = f.mech;
      if (f.frame % 20 === 0) {
        m.pack = 0;
        for (const o of f.battle.fighters) if (o !== f && o.alive && o.team === f.team && o.def.mechanic && o.def.mechanic.type === 'packHunter' && o.pos.distanceTo(f.pos) < 30) m.pack++;
      }
      if (m.frenzy > 0) {
        m.frenzy--;
        if (m.frenzy % 8 === 0) f.battle.vfx.sparks(f.chest(), 0xd8ff6a, 2, 5, 0.07);
        if (m.frenzy === 0) f.aura.target = 0;
      }
    },
    damageOut(f) {
      return (1 + 0.06 * Math.min(3, f.mech.pack)) * (f.mech.frenzy > 0 ? 1.2 : 1);
    },
    on(f, ev) {
      // f.noFrenzy: a story where losing a sibling must not make the rest stronger (the Super
      // Saiyan 2 purge: their desperation is behaviour, SL.JuniorSquad moods, not numbers)
      if (ev !== 'allyDefeated' || !f.alive || f.noFrenzy) return;
      const m = f.mech;
      m.frenzy = this.FRENZY_FRAMES;
      f.aura.target = 0.6;
      f.battle.sfx('saibaScreech', f, { pitch: 0.85 + Math.random() * 0.3 });
    },
    speedMul(f) {
      return f.mech.frenzy > 0 ? 1.18 : 1;
    },
    dead(f) {
      const m = f.mech;
      if (m.vaporized || f.hidden) return;
      m.wither++;
      const b = f.battle;
      // f.witherAfter: how long the body lies there before it crumbles (a story can keep its fallen in view)
      const w0 = f.witherAfter === undefined ? 50 : f.witherAfter;
      if (m.wither > w0 && m.wither % 5 === 0) b.vfx.dust(f.pos.clone().add(new THREE.Vector3(0, 0.3, 0)), 0.8, 3, 0x6a9a4a);
      if (m.wither > w0) f.model.root.scale.setScalar(f.model.baseScale * Math.max(0.05, 1 - (m.wither - w0) / 70));
      if (m.wither > w0 + 70) f.setHidden(true);
    },
    hud(f) {
      const m = f.mech;
      if (m.frenzy > 0) return { value: m.frenzy / this.FRENZY_FRAMES, label: 'FRENZY', active: true, color: '#c8ff5a' };
      return { value: Math.min(1, m.pack / 3), label: 'PACK', active: m.pack > 0, color: '#8ad65a' };
    },
  };

  /**
   * KRILLIN — Survivor: below 40% health his dodges and vanishes cost half the
   * stamina and his ki recovers twice as fast.
   */
  Mechanics.survivor = {
    init(f) {
      f.mech = { desperate: false };
    },
    update(f) {
      const d = f.hpFrac < 0.4;
      if (d !== f.mech.desperate) {
        f.mech.desperate = d;
        if (d) f.battle.emit('mechanic', { fighter: f, kind: 'survivor' });
      }
    },
    costMul(f, action) {
      return f.mech.desperate && (action === 'dodge' || action === 'vanish') ? 0.5 : 1;
    },
    kiRegenMul(f) {
      return f.mech.desperate ? 2 : 1;
    },
    hud(f) {
      return { value: f.mech.desperate ? 1 : Math.max(0, 1 - (f.hpFrac - 0.4) / 0.6), label: 'SURVIVOR', active: f.mech.desperate, color: '#ffb84a' };
    },
  };

  /**
   * TIEN — Third Eye: reads incoming attacks. Perfect Guard window is 5 frames
   * wider and each Perfect Guard restores 12 extra ki.
   */
  Mechanics.thirdEye = {
    init(f) {
      f.mech = { reads: 0, glow: 0 };
    },
    update(f) {
      if (f.mech.glow > 0) f.mech.glow--;
    },
    perfectWindowBonus() {
      return 5;
    },
    on(f, ev) {
      if (ev !== 'perfectGuard') return;
      f.ki = Math.min(f.kiMax, f.ki + 12);
      f.mech.reads++;
      f.mech.glow = 60;
    },
    hud(f) {
      return { value: f.mech.glow / 60, label: 'THIRD EYE', active: f.mech.glow > 0, color: '#fff27a' };
    },
  };

  /**
   * BOSS — generic phase controller for boss characters (def.boss). Phases
   * advance by health and never go back; each phase can change speed and
   * damage, and entering a phase can trigger a technique (a roar, a wave).
   * Missions can hold a boss below a phase with fighter.bossPhaseCap.
   * The HUD bar shows the boss's poise (see Fighter poise).
   */
  // states in which a speedster (def.boss.evade) is moving fast enough to slip a hit
  // 'rush' is in the list because the travel frames of a rush are the fastest he
  // ever moves; the velocity check below keeps the slow strike frames out of it
  const EVADE_STATES = { free: 1, dash: 1, dodge: 1, rush: 1 };
  // a character can carry a boss-derived mechanic without being a boss
  const EMPTY_PHASE = { id: 'none', label: 'BOSS', damage: 1, speed: 1, patience: 1, patterns: {} };

  Mechanics.boss = {
    init(f) {
      f.mech = { phase: 0 };
    },
    phaseOf(f) {
      const B = f.def.boss;
      if (!B || !B.phases || !B.phases.length) return EMPTY_PHASE;
      return B.phases[f.mech.phase] || B.phases[0];
    },
    update(f) {
      const B = f.def.boss;
      if (!B || !B.phases || !B.phases.length) return;
      // a phase-entry move waits until the boss can act (never cuts a poise break short)
      const pend = f.mech.pendingEnter;
      if (pend && f.state === 'free' && !f.battle.inputLocked) {
        f.mech.pendingEnter = null;
        const spec = B.techniques[pend];
        if (spec && SL.Techniques[spec.type]) SL.Techniques[spec.type].start(f, spec, 'boss', 0);
      }
      let idx = B.phases.findIndex((p) => f.hpFrac > p.hpAbove);
      if (idx < 0) idx = B.phases.length - 1;
      if (f.bossPhaseCap !== undefined) idx = Math.min(idx, f.bossPhaseCap);
      if (idx <= f.mech.phase || !f.alive) return;
      f.mech.phase = idx;
      const ph = B.phases[idx];
      const b = f.battle;
      b.emit('bossPhase', { fighter: f, phase: ph, index: idx });
      if (ph.line) b.bark(f, ph.line, true);
      if (ph.enter) f.mech.pendingEnter = ph.enter;
    },
    damageOut(f) {
      return this.phaseOf(f).damage || 1;
    },
    /**
     * Optional speedster evasion (def.boss.evade). While the boss is genuinely moving
     * fast, most of a hit slides off him and he leaves an afterimage behind; the moment
     * he stops — his own recovery, a stagger, a guard break — he takes everything.
     * Data-driven so any later speed fighter can use it. Throws always land.
     */
    damageIn(f, hit, att) {
      const ev = f.def.boss && f.def.boss.evade;
      if (!ev || !hit || hit.type === 'throw') return 1;
      // a story can put somebody above the speedster (att.storySpeed): nothing slides off
      // when the man hitting you is simply faster than you (Goku against Burter)
      if (att && att.storySpeed) {
        if (EVADE_STATES[f.state] && f.vel.length() >= (ev.minSpeed || 18)) f.battle.emit('outsped', { fighter: f, by: att });
        return 1;
      }
      // only while he is actually moving under his own power: his attack recovery,
      // a stagger, a guard or a knockdown all leave him standing still and fully open
      if (!EVADE_STATES[f.state]) return 1;
      // live velocity, not f.speed: that one only refreshes in the free state and would
      // stay stale (and keep him evasive) all the way through a committed attack
      const spd = f.vel.length();
      if (spd < (ev.minSpeed || 18)) return 1;
      const b = f.battle;
      b.vfx.afterimage(f.pos, f.height, (f.def.vfx && f.def.vfx.ghost) || 0x9fd8ff);
      b.emit('speedEvade', { fighter: f, speed: spd });
      return ev.damageMul || 0.35;
    },
    speedMul(f) {
      return this.phaseOf(f).speed || 1;
    },
    hud(f) {
      const pz = f.poise;
      const ph = this.phaseOf(f);
      if (!pz) return { value: 0, label: ph.label || 'BOSS', active: false, color: '#ff9a4a' };
      if (pz.broken > 0) return { value: pz.broken / f.def.poise.breakFrames, label: 'BROKEN', active: true, color: '#ffe080' };
      return { value: pz.value / pz.max, label: ph.label || 'POISE', active: false, color: '#ff9a4a' };
    },
  };

  /**
   * FRIEZA — the boss phase controller plus cruelty: he hits hardest at people
   * who are already hurt. def.cruelty = { below, mul }. Everything else (phases,
   * phase-entry techniques, the poise HUD, speed and damage per phase) is the
   * boss mechanic, inherited rather than copied.
   */
  Mechanics.frieza = Object.assign(Object.create(Mechanics.boss), {
    init(f) {
      Mechanics.boss.init(f);
      f.mech.cruelFrame = -999;
    },
    damageOut(f, hit, target) {
      const base = Mechanics.boss.damageOut.call(this, f, hit);
      const c = f.def.cruelty;
      if (!c || !target || target.hpFrac > (c.below || 0.4)) return base;
      // one callout per exchange, not per tick of a beam
      if (f.battle.frame - f.mech.cruelFrame > 40) {
        f.mech.cruelFrame = f.battle.frame;
        f.battle.emit('cruelty', { fighter: f, target, mul: c.mul || 1.35 });
      }
      return base * (c.mul || 1.35);
    },
    hud(f) {
      const h = Mechanics.boss.hud.call(this, f);
      const c = f.def.cruelty;
      const t = f.target;
      // the bar turns while somebody in front of him is worth finishing
      if (h && c && t && t.alive && t.hpFrac <= (c.below || 0.4)) h.color = '#ff4a7a';
      return h;
    },
  });

  /**
   * REGENERATOR — Namekian regeneration (Nail). Holding a guard knits the body
   * back together, up to a cap, so a defensive fighter can outlast damage he
   * could never out-trade. def.regen = { perSecond, maxFrac }.
   */
  Mechanics.regenerator = {
    init(f) {
      f.mech = { healed: 0 };
    },
    update(f) {
      const r = f.def.regen;
      if (!r || !f.alive || f.state !== 'guard') return;
      const cap = f.hpMax * (r.maxFrac === undefined ? 0.85 : r.maxFrac);
      if (f.hp >= cap) return;
      const gain = f.hpMax * (r.perSecond || 0.02) * (1 / 60);
      f.hp = Math.min(cap, f.hp + gain);
      f.mech.healed += gain;
      if (f.battle.frame % 20 === 0) f.battle.vfx.streamInward(f.chest(), 1.8, 0x9fe08a, 2, 0.1, 0.35);
    },
    hud(f) {
      const cap = f.hpMax * ((f.def.regen && f.def.regen.maxFrac) || 0.85);
      return { value: Math.min(1, f.hp / cap), label: 'REGEN', active: f.state === 'guard', color: '#9fe08a' };
    },
  };

  /**
   * ENERGY ABSORPTION (Androids 19 and 20). Ki that touches their palms is not
   * damage, it is a meal: a beam or a blast aimed at them is absorbed instead of
   * landing, healing them and costing the attacker the ki they spent. Strikes
   * and throws work normally, which is the whole counterplay — hit them with
   * your hands, not with your ki.
   *
   * def.absorb = { heal, kiSteal, cap }
   *   heal     fraction of the absorbed damage turned into health (default 0.6)
   *   kiSteal  ki taken from the attacker per absorbed hit (default 12)
   *   cap      health ceiling as a fraction of max (default 1)
   */
  Mechanics.absorber = Object.assign(Object.create(Mechanics.boss), {
    init(f) {
      Mechanics.boss.init(f);
      f.mech.absorbed = 0;
      f.mech.lastAt = -999;
    },
    damageIn(f, hit, att) {
      const a = f.def.absorb;
      if (!a || !hit) return 1;
      const kind = hit.type;
      if (kind !== 'beam' && kind !== 'projectile' && kind !== 'ki' && kind !== 'blast') return Mechanics.boss.damageIn(f, hit);
      const b = f.battle;
      const cap = f.hpMax * (a.cap === undefined ? 1 : a.cap);
      const heal = (hit.damage || 0) * (a.heal === undefined ? 0.6 : a.heal);
      f.hp = Math.min(cap, f.hp + heal);
      f.mech.absorbed += heal;
      f.mech.lastAt = b.frame;
      if (att && att.ki !== undefined) att.ki = Math.max(0, att.ki - (a.kiSteal === undefined ? 12 : a.kiSteal));
      b.vfx.streamInward(f.chest(), 2.4, 0xffe27a, 8, 0.14, 0.4);
      b.sfx('kiUp', f, { vol: 0.7, pitch: 1.2 });
      b.emit('absorbed', { fighter: f, amount: heal, attacker: att || null });
      // a.burstAt: past this much absorbed (as a fraction of max health) he cannot hold it
      if (a.burstAt && f.mech.absorbed >= f.hpMax * a.burstAt && !f.mech.burst) {
        f.mech.burst = true;
        b.vfx.explosion(f.chest(), 4, 0xffe27a, { smoke: true });
        b.emit('overload', { fighter: f, attacker: att || null });
        // it all comes out at once: the overload itself is the killing blow
        f._applyDamage(f.hp + 1, att || null, { type: 'explosion', impact: 4, damage: f.hp + 1 }, f.chest());
        return 0;
      }
      return 0; // nothing lands
    },
    hud(f) {
      const on = f.battle.frame - (f.mech ? f.mech.lastAt : -999) < 40;
      return { value: Math.min(1, f.hp / f.hpMax), label: 'ABSORB', active: on, color: '#ffe27a' };
    },
  });

  /**
   * INFINITE ENERGY (Androids 16, 17 and 18). They do not tire and they do not
   * run dry: stamina is held full and ki is topped up, so the usual plan of
   * waiting a boss out — chipping a guard, baiting a long charge, outlasting a
   * ki bar — simply does not apply to them. It changes nothing about how much
   * damage they take: the answer is still to beat them.
   */
  Mechanics.tireless = Object.assign(Object.create(Mechanics.boss), {
    init(f) {
      Mechanics.boss.init(f);
      f.mech.topped = 0;
    },
    update(f, dt) {
      if (Mechanics.boss.update) Mechanics.boss.update(f, dt);
      if (!f.alive) return;
      if (f.stamina < f.staminaMax) {
        f.stamina = f.staminaMax;
        f.winded = false;
      }
      const kiFloor = f.kiMax * 0.5;
      if (f.ki < kiFloor) {
        f.mech.topped += kiFloor - f.ki;
        f.ki = kiFloor;
      }
    },
    hud(f) {
      return { value: 1, label: 'INFINITE', active: true, color: '#8ad4ff' };
    },
  });

  /**
   * BIO-REGENERATION (Cell). Leave him alone and he grows the damage back:
   * after `def.regen.idleFrames` without taking a hit he knits himself together
   * at `perSecond` of his maximum health, up to `maxFrac`. It makes a fight
   * against him a fight against a clock — chip damage and long ranged pokes are
   * worth nothing, and pressure is the only thing that sticks.
   */
  Mechanics.bioRegen = Object.assign(Object.create(Mechanics.boss), {
    init(f) {
      Mechanics.boss.init(f);
      f.mech.lastHurt = 0;
      f.mech.regrown = 0;
    },
    update(f, dt) {
      if (Mechanics.boss.update) Mechanics.boss.update(f, dt);
      const r = f.def.regen;
      // a mission can switch the regeneration off for a phase (the last one, where he is finished)
      if (!r || !f.alive || f.noRegen) return;
      const b = f.battle;
      const idle = b.frame - (f.mech.lastHurt || 0);
      if (idle < (r.idleFrames === undefined ? 150 : r.idleFrames)) return;
      const cap = f.hpMax * (r.maxFrac === undefined ? 1 : r.maxFrac);
      if (f.hp >= cap) return;
      const gain = f.hpMax * (r.perSecond || 0.03) * (1 / 60);
      f.hp = Math.min(cap, f.hp + gain);
      f.mech.regrown += gain;
      if (b.frame % 18 === 0) b.vfx.streamInward(f.chest(), 2, 0xa8e08a, 3, 0.12, 0.35);
    },
    damageIn(f, hit, att) {
      f.mech.lastHurt = f.battle.frame;
      return Mechanics.boss.damageIn(f, hit, att);
    },
    hud(f) {
      const r = f.def.regen || {};
      const idle = f.battle.frame - (f.mech ? f.mech.lastHurt || 0 : 0);
      return { value: Math.min(1, idle / (r.idleFrames || 150)), label: 'REGEN', active: idle >= (r.idleFrames || 150), color: '#a8e08a' };
    },
  });

  /**
   * MAJIN BODY (Majin Buu). Why conventional attacks do not work, shown rather than told:
   *   GUT     a light strike into the front of him sinks into the belly and bounces back
   *           (def.majin.gut of it lands); from behind, from above, heavies and ki land in full
   *   WOUNDS  a real hit opens a hole where it landed (Model.addWound) and the hole pulls shut
   *           while you watch, giving back def.majin.holeHeal of what it took, with steam
   *   APART   at each def.majin.breakAt health line he comes apart: the body is gone, pink pieces
   *           scatter and smoke, and after a moment they crawl back and he stands up whole at
   *           reformTo (def.majin.maxReforms times; a story sets f.mech.maxReforms = Infinity)
   *   CANDY   a fighter his antenna turned to candy (stone of kind 'candy') is food: if he gets
   *           to them before they struggle out, he eats (heavy damage to them, health to him)
   * Events: buuGut, buuWound, buuApart, buuReformed, buuAte. Boss phases come from Mechanics.boss.
   */
  const PIECE = { geo: null };
  Mechanics.majinBody = Object.assign(Object.create(Mechanics.boss), {
    init(f) {
      Mechanics.boss.init(f);
      const M = f.def.majin || {};
      f.mech.breakIdx = 0;
      f.mech.reforms = 0;
      f.mech.maxReforms = M.maxReforms === undefined ? 2 : M.maxReforms;
      f.mech.heals = [];
      f.mech.pending = 0;
      f.mech.wounds = 0;
      f.cannotDie = true; // he dies only once his reforms are spent (see update)
    },
    damageIn(f, hit, att) {
      if (f.mech.apart) return 0;
      const base = Mechanics.boss.damageIn.call(this, f, hit, att);
      const M = f.def.majin || {};
      if (hit && hit.type === 'melee' && !hit.heavy && att && (hit.impact || 1) < 3) {
        const to = att.pos.clone().sub(f.pos).setY(0);
        const above = att.pos.y - f.pos.y > f.height * 0.6;
        if (!above && to.lengthSq() > 0.0001 && f.forward.dot(to.normalize()) > 0.25) {
          const b = f.battle;
          f.anim.squash = 0.28; // the belly takes it, and gives
          b.vfx.ring(f.chest(), 1.4, 0xffb8d8, 0.25);
          if (b.frame - (f.mech.gutAt || -99) > 20) b.sfx('stretch', f, { vol: 0.6, pitch: 1.3 });
          f.mech.gutAt = b.frame;
          f.mech.gutHits = (f.mech.gutHits || 0) + 1;
          b.emit('buuGut', { fighter: f, attacker: att });
          return base * (M.gut === undefined ? 0.45 : M.gut);
        }
      }
      return base;
    },
    update(f, dt) {
      Mechanics.boss.update(f);
      const M = f.def.majin || {};
      const me = f.mech, b = f.battle;
      if (me.lastHp === undefined) me.lastHp = f.hp;
      if (f.model.updateWounds) f.model.updateWounds(1 / 60);
      if (me.apart) {
        this._apartTick(f, M);
        me.lastHp = f.hp;
        return;
      }
      if (!f.alive) return;
      // a wound for every real hit, and each one closes on its own
      const lost = me.lastHp - f.hp;
      if (lost > 0) me.pending += lost;
      if (me.pending >= f.hpMax * 0.015 && b.frame - (me.woundAt || -99) > 12) {
        const spots = [['chest', 0.18, 0.4], ['spine', 0.1, -0.5], ['chest', 0.1, -0.7], ['spine', 0.14, 0.9], ['chest', 0.22, 2.6], ['spine', 0.06, -2.4]];
        const sp = spots[me.wounds % spots.length];
        const size = U.clamp(0.4 + (me.pending / f.hpMax) * 6, 0.4, 1.1);
        if (!f.noRegen && f.model.addWound) f.model.addWound(sp[0], sp[1], sp[2], size, M.holeSeconds || 2.2);
        if (!f.noRegen) me.heals.push({ left: (M.holeSeconds || 2.2) * 60, per: (me.pending * (M.holeHeal === undefined ? 0.55 : M.holeHeal)) / ((M.holeSeconds || 2.2) * 60) });
        me.wounds++;
        me.woundAt = b.frame;
        b.emit('buuWound', { fighter: f, amount: me.pending });
        me.pending = 0;
      }
      if (b.frame - (me.woundAt || -99) > 30) me.pending = 0;
      for (let i = me.heals.length - 1; i >= 0; i--) {
        const h = me.heals[i];
        f.hp = Math.min(f.hpMax, f.hp + h.per);
        me.regrown = (me.regrown || 0) + h.per;
        if (--h.left <= 0) me.heals.splice(i, 1);
      }
      if (me.heals.length && b.frame % 14 === 0) b.vfx.dust(f.chest(), 0.9, 3, 0xf8f0f4);
      // coming apart at the next line (the last one is his death: floored at 1 hp)
      const lines = M.breakAt || [0];
      const line = lines[me.breakIdx];
      if (line !== undefined && (f.hpFrac <= line || f.hp <= 1)) {
        if (line <= 0 && me.reforms >= me.maxReforms) {
          // spent: this time he stays down
          f.cannotDie = false;
          f.hp = 0;
          f._ko(null, { type: 'explosion' });
        } else this._breakApart(f, M);
      }
      me.lastHp = f.hp;
      this._candy(f, M);
    },
    _breakApart(f, M) {
      const b = f.battle, me = f.mech;
      if (!PIECE.geo) PIECE.geo = new THREE.SphereGeometry(1, 10, 8);
      me.breakIdx++;
      me.heals = [];
      const lines = M.breakAt || [0];
      if (me.breakIdx >= lines.length) me.breakIdx = lines.length - 1; // the last line repeats: he can always come apart again
      const pieces = [];
      const c = f.chest();
      const mat = SL.Toon.mat(f.appearance.skin);
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2;
        const r = 0.16 + (i % 3) * 0.07;
        const m = new THREE.Mesh(PIECE.geo, mat);
        m.scale.set(r * 1.2, r, r);
        SL.Toon.addOutline(m, 1.2);
        m.position.copy(c);
        b.scene.add(m);
        const out = 7 + (i % 4) * 2.2;
        pieces.push({ m, v: new THREE.Vector3(Math.cos(a) * out, 5 + (i % 3) * 2.5, Math.sin(a) * out), home: new THREE.Vector3(Math.cos(a) * 0.3, 0.2 + (i % 3) * 0.3, Math.sin(a) * 0.3) });
      }
      me.apart = { t: 0, pieces, total: Math.round((M.reformSeconds || 2.8) * 60), from: f.pos.clone() };
      f.intangible = true;
      f.untargetable = true;
      f.setHidden(true);
      f.setState('scripted', { pose: 'bu_sit' });
      f.vel.set(0, 0, 0);
      b.vfx.explosion(c, 3, 0xff9ac8, { smoke: true });
      b.vfx.dust(f.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), 3.5, 18, 0xf0a8c8);
      b.sfx('explosionBig', f, { pitch: 1.2 });
      b.cameraTraumaAt(c, 0.5);
      b.emit('buuApart', { fighter: f, count: me.breakIdx });
    },
    _apartTick(f, M) {
      const b = f.battle, A = f.mech.apart;
      A.t++;
      const scatter = Math.round(A.total * (A.scatterFrac || 0.5));
      const ground = b.stage.hasGround ? (p) => b.stage.heightAt(p.x, p.z) : () => -1e9;
      for (const p of A.pieces) {
        if (A.t < scatter) {
          p.v.y -= 22 / 60;
          p.m.position.addScaledVector(p.v, 1 / 60);
          const gy = ground(p.m.position) + p.m.scale.y * 0.6;
          if (p.m.position.y < gy) {
            p.m.position.y = gy;
            p.v.multiplyScalar(0.35);
            p.v.y = Math.abs(p.v.y) * 0.2;
          }
          // still alive: the pieces twitch where they lie
          if (A.t > scatter * 0.6 && (A.t + p.m.id) % 9 === 0) p.m.scale.x *= 1.08;
        } else {
          // they crawl back and pile into a body again
          const k = (A.t - scatter) / (A.total - scatter);
          const to = A.from.clone().add(p.home).add(new THREE.Vector3(0, f.height * 0.35 * k, 0));
          p.m.position.lerp(to, 0.06 + k * 0.2);
          p.m.scale.multiplyScalar(1 + k * 0.01);
        }
      }
      if (A.t % 10 === 0) b.vfx.dust(A.from.clone().add(new THREE.Vector3(0, 0.5, 0)), 2.5, 4, 0xf8e0ec);
      if (A.t === scatter) b.sfx('regrow', f, { dur: (A.total - scatter) / 60 });
      if (A.t >= A.total) this._reform(f, M);
    },
    _reform(f, M) {
      const b = f.battle, me = f.mech, A = me.apart;
      for (const p of A.pieces) b.scene.remove(p.m);
      me.apart = null;
      me.reforms++;
      f.setPosition(A.from);
      f.setHidden(false);
      f.intangible = false;
      f.untargetable = false;
      f.hp = Math.max(f.hp, f.hpMax * (f.reformTo !== undefined ? f.reformTo : M.reformTo || 0.85));
      me.lastHp = f.hp;
      f.anim.squash = 0.35;
      f.setState('scripted', { pose: 'bu_laugh', expression: 'grin' });
      f.mech.laughUntil = b.frame + 50;
      b.vfx.ring(f.chest(), 3.5, 0xff9ac8, 0.5);
      b.vfx.flash(f.chest(), 3, 0xffc8e0, 0.3, SL.Toon.tex.glow);
      b.bark(f, 'taunt', true);
      b.emit('buuReformed', { fighter: f, reforms: me.reforms });
    },
    _candy(f, M) {
      const b = f.battle, me = f.mech;
      if (me.laughUntil && b.frame >= me.laughUntil && !b.inputLocked) {
        me.laughUntil = 0;
        if (f.state === 'scripted') f.setState('free');
      }
      const t = f.target, ce = M.candyEat;
      if (!ce || !t || !t.alive || t.state !== 'held' || !t.sd.stone || t.sd.stone.kind !== 'candy') return;
      if (f.state !== 'free' || f.distTo(t) > (ce.reach || 1.7)) return;
      // he eats it
      f.setState('scripted', { pose: 'bu_eat', expression: 'grin' });
      me.laughUntil = b.frame + 60;
      t.setState('knockdown', { frames: 70 });
      t._applyDamage(Math.round(t.hpMax * (ce.damage || 0.2)), f, { type: 'throw', impact: 3, knock: 'heavy' }, t.chest());
      f.hp = Math.min(f.hpMax, f.hp + f.hpMax * (ce.heal || 0.08));
      b.vfx.sparks(t.chest(), 0xff8ac4, 24, 10, 0.14);
      b.sfx('candyPop', f, { pitch: 0.7 });
      b.sfx('punchHeavy', t);
      b.emit('buuAte', { fighter: f, victim: t });
    },
    hud(f) {
      const me = f.mech || {};
      if (me.apart) return { value: me.apart.t / me.apart.total, label: 'REFORMING', active: true, color: '#ff9ac8' };
      const ph = this.phaseOf(f);
      return { value: me.heals && me.heals.length ? 1 : 0, label: me.heals && me.heals.length ? 'HEALING' : ph.label || 'MAJIN', active: !!(me.heals && me.heals.length), color: '#ff9ac8' };
    },
  });

  /** Safe call helper used by Fighter. */
  SL.mech = function (f, fn, ...args) {
    const m = f.def.mechanic && Mechanics[f.def.mechanic.type];
    if (!m || !m[fn]) return undefined;
    return m[fn](f, ...args);
  };
})();
