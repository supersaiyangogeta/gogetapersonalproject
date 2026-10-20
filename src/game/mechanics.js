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
          if (f.frame % 6 === 0) f.battle.vfx.sparks(f.chest(), (f.def.mechanic && f.def.mechanic.color) || 0x9aff7a, 2, 3, 0.08);
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
   * MR. SEE-THROUGH — Invisible (2026-10-15). He cannot be seen, only read:
   *   - his body is a faint glassy shimmer (Model.setCloak: nearly clear, the rim glinting at the edge, no ink lines);
   *     his shadow stays on the ground, and dust kicks up where his feet go;
   *   - every wind-up shows him half-way (a strike, a rush, a throw, a charge: the attack itself is the telegraph);
   *   - he flickers into full view for a moment when he is hit, when he lands a blow or has one blocked.
   * Lock-on, collision and hit detection are untouched: he is all there, only hard to see. The CPU fights him exactly
   * as it fights anybody (it reads positions, not pixels).
   */
  const SEEN_STATES = { attack: 1, rush: 1, specialThrow: 1, throw: 1, charge: 1, beamCharge: 1, beamFire: 1, recoverSpecial: 1, transform: 1 };
  const REVEALED_STATES = { hitstun: 1, stagger: 1, guardBreak: 1, held: 1 };
  Mechanics.invisible = {
    init(f) {
      f.mech = { reveal: 0, cloak: 1, step: 0 };
    },
    update(f) {
      const m = f.mech;
      if (m.reveal > 0) m.reveal--;
      const target = !f.alive || m.reveal > 0 || REVEALED_STATES[f.state] ? 0 : SEEN_STATES[f.state] ? 0.5 : 1;
      // in quickly, out slowly: a reveal reads, then the shimmer closes again
      m.cloak += (target - m.cloak) * (target < m.cloak ? 0.35 : 0.1);
      if (f.model && f.model.setCloak) f.model.setCloak(m.cloak);
      const b = f.battle;
      if (m.cloak > 0.6 && f.grounded && f.vel.x * f.vel.x + f.vel.z * f.vel.z > 4 && ++m.step % 12 === 0 && b.vfx && b.vfx.dust) {
        b.vfx.dust(f.pos, 0.45, 3, b.stage && b.stage.def && b.stage.def.terrain ? b.stage.def.terrain.sand : undefined);
      }
    },
    on(f, ev) {
      if (ev === 'hitTaken') f.mech.reveal = Math.max(f.mech.reveal, 40);
      else if (ev === 'blocked') f.mech.reveal = Math.max(f.mech.reveal, 20);
      else if (ev === 'hitDealt' || ev === 'armoredHit') f.mech.reveal = Math.max(f.mech.reveal, 16);
    },
    hud(f) {
      const c = f.mech.cloak;
      return { value: c, label: c > 0.55 ? 'UNSEEN' : 'SEEN', active: c > 0.55, color: '#bfe8ff' };
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

  /**
   * DIMENSIONAL (Janemba, Fusion Reborn): a body that does not have to obey where it is. Built on
   * the boss controller (phases, poise, entry techniques). def.dimension switches its parts on:
   *   portal  { redirectMul, front, max }  THE FRONT DOOR. While a portal stands open in front of him
   *           (the technique `portalGuard` opens it: a giggle, both palms out, a swirling ring between
   *           him and you — the tell), a blow or a blast that comes in from the FRONT goes through it
   *           and lands on the attacker's own back out of a second portal (redirectMul of its damage).
   *           From the side, from behind or from above it lands on him as normal — that is the
   *           counter the player learns: stop, or go round. Ultimates go through regardless.
   *   elastic { squash, bounce }           a rubber body: heavy blows squash him, and he bounces
   *           when he hits the ground in a knockback (exaggerated, never extra damage)
   *   phantom { repeat, combo, cooldown }  PUNISHES THE PREDICTABLE: the same strike `repeat` times
   *           in a row, or a string `combo` hits long, and he comes apart into floating cubes and
   *           reassembles behind you (technique `phantomShift`), already swinging
   *   doors   true                         teleport strikes (moves' `teleport`) leave through one
   *           portal and arrive through another
   * Events: 'portalRedirect' { fighter, attacker, count }, 'phantomEvade' { fighter, attacker }.
   */
  Mechanics.dimensional = Object.assign(Object.create(Mechanics.boss), {
    init(f) {
      Mechanics.boss.init(f);
      Object.assign(f.mech, { door: null, doorUntil: 0, redirects: 0, doorHits: 0, seen: [], phantomAt: -999, phantoms: 0, lastHits: 0, bounced: false });
    },
    // a story can change what he is allowed to do for a while (f.dimensionOverride): Gogeta is too much for his tricks
    cfg(f) {
      return f.dimensionOverride || f.def.dimension || {};
    },
    /** Opens the front door for `frames` (portalGuard calls this). */
    openDoor(f, frames) {
      const me = f.mech, b = f.battle;
      this.closeDoor(f);
      const at = f.chest().addScaledVector(f.forward, f.radius + 0.5 * f.scale);
      me.door = SL.Dimension.portal(b, at, f.forward, { radius: 0.75 * f.scale, open: 8 });
      me.doorUntil = b.frame + frames;
      me.doorHits = 0;
      b.emit('portalDoor', { fighter: f, open: true });
    },
    closeDoor(f) {
      const me = f.mech;
      if (me.door) me.door.close();
      me.door = null;
      me.doorUntil = 0;
    },
    doorOpen(f) {
      const me = f.mech;
      return !!(me && me.door && me.door.alive && f.battle.frame < me.doorUntil);
    },
    /** Fighter.takeHit asks first: a hit can go somewhere else entirely. */
    intercept(f, hit, att) {
      const C = this.cfg(f), me = f.mech, b = f.battle;
      if (!att || att === f || !hit || (hit.type !== 'melee' && hit.type !== 'ki')) return undefined;
      // THE FRONT DOOR
      if (C.portal && this.doorOpen(f) && !hit.ultimate) {
        const to = att.pos.clone().sub(f.pos).setY(0);
        if (to.lengthSq() > 0.0001) to.normalize();
        if (f.forward.dot(to) > (C.portal.front === undefined ? 0.15 : C.portal.front)) {
          const key = hit.type === 'melee' ? att.sd : hit.point;
          if (me.redirectKey === key) return 'miss';
          me.redirectKey = key;
          const back = att.forward.clone().setY(0);
          if (back.lengthSq() < 0.001) back.copy(to).negate();
          back.normalize();
          const exit = att.chest().addScaledVector(back, -(att.radius + 0.55)).add(new THREE.Vector3(0, 0.25 * att.height, 0));
          SL.Dimension.portal(b, exit, back, { radius: 0.5 * att.scale, life: 22, open: 4, vol: 0.6 });
          b.vfx.flash(hit.point || f.chest(), 1.4, SL.Dimension.COLORS.inner, 0.15, SL.Toon.tex.glow);
          me.redirects++;
          me.doorHits++;
          att.takeHit(f, {
            type: 'melee', damage: Math.round((hit.damage || 400) * (C.portal.redirectMul || 0.75)),
            knock: (hit.impact || 1) >= 3 ? 'heavy' : 'push', knockSpeed: (hit.impact || 1) >= 3 ? 22 : 12, hitstun: 30, impact: Math.max(2, hit.impact || 1),
            dir: back.clone(), point: exit.clone(), pose: 'hitBack', sfx: 'punchHeavy', name: 'Dimension Door',
          });
          b.emit('portalRedirect', { fighter: f, attacker: att, count: me.redirects, type: hit.type });
          if (me.doorHits >= (C.portal.max || 2)) this.closeDoor(f);
          return hit.type === 'ki' ? 'portal' : 'miss';
        }
      }
      // PHANTOM SHIFT: read a pattern, and be somewhere else when it lands
      const P = C.phantom;
      if (P && hit.type === 'melee' && f.alive && ['free', 'guard', 'dash', 'recover', 'attack'].includes(f.state) && b.frame - me.phantomAt > (P.cooldown || 90)) {
        const id = att.sd && att.sd.move ? att.sd.move.id : '?';
        me.seen.push({ id, frame: b.frame });
        me.seen = me.seen.filter((s) => b.frame - s.frame < (P.window || 150));
        const last = me.seen.slice(-(P.repeat || 3));
        const repeated = last.length >= (P.repeat || 3) && last.every((s) => s.id === id);
        const long = att.combo && att.combo.hits >= (P.combo || 5);
        if ((repeated || long) && SL.Techniques.phantomShift) {
          const spec = Object.assign({ frames: 22, appearAt: 16, dist: 1.8, recovery: 4 }, P.spec || {}, { mode: 'behind', from: att });
          if (SL.Techniques.phantomShift.start(f, spec, 'evade', 0)) {
            me.phantomAt = b.frame;
            me.phantoms++;
            me.seen.length = 0;
            me.punish = att;
            if (att.state === 'attack') att.sd.whiffPenalty = 18;
            b.emit('phantomEvade', { fighter: f, attacker: att, why: repeated ? 'repeat' : 'combo' });
            return 'vanished';
          }
        }
      }
      return undefined;
    },
    update(f, dt) {
      Mechanics.boss.update(f);
      const C = this.cfg(f), me = f.mech, b = f.battle;
      // the door follows him while it is open, and shuts when its time is up
      if (me.door) {
        if (!this.doorOpen(f) || !f.alive || f.hidden || f.state === 'hitstun' || f.state === 'knockback' || f.state === 'knockdown') this.closeDoor(f);
        else me.door.set(f.chest().addScaledVector(f.forward, f.radius + 0.5 * f.scale), f.forward);
      }
      const E = C.elastic;
      if (E) {
        const hits = f.stats.hitsTaken;
        if (hits > me.lastHits) f.anim.squash = Math.max(f.anim.squash || 0, E.squash || 0.4);
        me.lastHits = hits;
        if ((f.state === 'knockback' || f.state === 'knockdown') && f.grounded && !me.bounced && b.stage.hasGround) {
          me.bounced = true;
          f.vel.y = E.bounce || 7;
          f.grounded = false;
          f.anim.squash = Math.max(f.anim.squash || 0, (E.squash || 0.4) * 1.2);
          b.sfx('stretch', f, { pitch: 0.7, vol: 0.7 });
          b.vfx.dust(f.pos.clone(), 1.2 * f.scale, 8, b.stage.def.terrain.sand);
        }
        if (f.state === 'free') me.bounced = false;
      }
    },
    on(f, ev, data) {
      if (ev === 'teleportStrike' && this.cfg(f).doors && data) {
        const b = f.battle;
        SL.Dimension.portal(b, data.from.clone().add(new THREE.Vector3(0, f.height * 0.5, 0)), f.forward, { radius: 0.7 * f.scale, life: 12, open: 3 });
        SL.Dimension.portal(b, data.to.clone().add(new THREE.Vector3(0, f.height * 0.5, 0)), f.forward.clone().negate(), { radius: 0.7 * f.scale, life: 14, open: 3, sfx: false });
      }
    },
    hud(f) {
      const me = f.mech || {};
      if (this.doorOpen(f)) return { value: Math.max(0, (me.doorUntil - f.battle.frame) / 100), label: 'PORTAL — GO ROUND', active: true, color: '#d24aff' };
      return Mechanics.boss.hud.call(this, f);
    },
  });

  /**
   * BLIMP (Veku, the failed fusion): a body that cannot fight and will not stay still. A dodge is not
   * a vanish: it is a big hop (def.blimp.bounce up, .push across) in a direction even he cannot
   * predict — away from the nearest threat, thrown off to one side by his own wobble — and he is
   * invulnerable while airborne (.iframes). Land at speed and he may trip (.trip, deterministic from
   * the frame count, never Math.random). Events: 'blimpBounce' { fighter }, 'blimpTrip' { fighter }.
   */
  Mechanics.blimp = {
    init(f) {
      f.mech = { next: 0, air: false, bounces: 0, trips: 0 };
    },
    update(f) {
      const B = f.def.blimp || {}, me = f.mech, b = f.battle;
      // a dodge becomes the bounce
      if (f.state === 'dodge' && f.stateFrame <= 1 && b.frame >= me.next) {
        const foes = b.enemiesOf(f).filter((e) => e.alive && !e.hidden);
        const near = foes.sort((a, c) => a.pos.distanceTo(f.pos) - c.pos.distanceTo(f.pos))[0];
        const away = near ? f.pos.clone().sub(near.pos).setY(0) : f.forward.clone().negate();
        if (away.lengthSq() < 0.01) away.set(1, 0, 0);
        away.normalize();
        // the wobble: a sideways throw that changes every bounce
        const k = Math.sin(me.bounces * 2.39 + b.frame * 0.013);
        const side = new THREE.Vector3(away.z, 0, -away.x).multiplyScalar(k * 0.9);
        const dir = away.add(side).normalize();
        f.setState('free');
        f.vel.set(dir.x * (B.push || 9), B.bounce || 9.5, dir.z * (B.push || 9));
        f.grounded = false;
        f.invuln = Math.max(f.invuln, B.iframes || 22);
        f.anim.squash = 0.5;
        me.air = true;
        me.bounces++;
        me.next = b.frame + (B.cooldown || 26);
        b.sfx('boing', f, { pitch: 0.9 + (me.bounces % 3) * 0.12 });
        b.vfx.dust(f.pos.clone(), 0.9, 6, b.stage.def.terrain ? b.stage.def.terrain.sand : 0xd8d0c0);
        b.emit('blimpBounce', { fighter: f });
        return;
      }
      if (me.air && f.grounded) {
        me.air = false;
        f.anim.squash = 0.45;
        const fast = Math.hypot(f.vel.x, f.vel.z) > 5;
        // a trip, about one landing in three — never on two landings in a row
        if (fast && !me.tripped && ((me.bounces * 7 + b.frame) % 10) / 10 < (B.trip === undefined ? 0.35 : B.trip)) {
          me.tripped = true;
          me.trips++;
          // a comic stumble, never a death sentence: he is too busy flailing to be hit cleanly
          f.setState('stagger', { frames: 20 });
          f.invuln = Math.max(f.invuln, 20);
          f.anim.play('vk_stumble', 30, { restart: true });
          b.sfx('stretch', f, { pitch: 0.6 });
          b.emit('blimpTrip', { fighter: f });
        } else me.tripped = false;
      }
    },
    costMul(f, action) {
      return action === 'dodge' ? 0.4 : 1;
    },
    hud(f) {
      const me = f.mech || {};
      return { value: Math.max(0, 1 - (me.next - f.battle.frame) / ((f.def.blimp || {}).cooldown || 26)), label: 'BOUNCE', active: me.air, color: '#f08a24' };
    },
  };

  /**
   * BROLY — LEGENDARY ADAPTATION (Movie 2 · Super Broly): the boss that learns. Built on the boss mechanic
   * (patterns, poise HUD), but his PHASE follows his FORM (def.boss.phases[i].form): the story changes his
   * form, never his health.
   *   READS     every strike that reaches him is counted by its move id (once per swing, landed or blocked).
   *             A move he has seen `learnAt` times (form.legendary) is CAUGHT the next time, when he is free
   *             to act: his hand closes on the fist (a Perfect Guard — the attacker staggers, his counter
   *             window opens) and the CPU answers at once (AIHooks.broly). Familiarity fades: a move not seen
   *             for `forget` frames loses a count.
   *   SWATS     ki blasts that have reached him `blastAt` times are batted aside before they land.
   *   ADAPTS    what he sees and reads raises his stage — WATCHING → LEARNING → MATCHING → SURPASSING —
   *             each a little faster and harder; at MATCHING he takes the strike you used most and throws it
   *             back (movesOverride: your own poses drive his rig).
   *   RAGES     a meter the story reads: it fills on the blows he takes (heavy ones and beams more). The
   *             Wrathful state is a story event; this is what calls it.
   *   BODY      the form's state: the veins (form.legendary.veins) pulse, the chest armour shatters (shatterArmor).
   * A mission tunes it with f.legendaryOverride (merged over the form's numbers; stageCap, learnAt 0 = off) and
   * listens: 'brolyRead' { fighter, attacker, id, count }, 'brolySwat', 'brolyStage' { stage, label },
   * 'brolyCopy' { move }, 'brolyRage' { value }.
   */
  const LEG_STAGES = [{ at: 0, label: 'WATCHING' }, { at: 8, label: 'LEARNING' }, { at: 20, label: 'MATCHING' }, { at: 36, label: 'SURPASSING' }];
  const LEG_READY = { free: 1, guard: 1, dash: 1, charge: 1, land: 1, recover: 1 };
  Mechanics.legendary = Object.assign(Object.create(Mechanics.boss), {
    STAGES: LEG_STAGES,
    init(f) {
      Mechanics.boss.init(f);
      Object.assign(f.mech, { seen: {}, blasts: 0, blastAt: 0, xp: 0, stage: 0, reads: 0, swats: 0, catchAt: -999, swatAt: -999, rage: 0, rageCount: 0, lastSd: null, copied: null, formSeen: -1, punish: null, hudMode: 'adapt', armorShattered: false });
    },
    cfg(f) {
      const base = (f.form && f.form.legendary) || {};
      return f.legendaryOverride ? Object.assign({}, base, f.legendaryOverride) : base;
    },
    phaseOf(f) {
      const B = f.def.boss;
      if (!B || !B.phases || !B.phases.length) return Mechanics.boss.phaseOf.call(this, f);
      return B.phases[f.mech.phase] || B.phases[0];
    },
    /** Adaptation from what he has seen; returns the stage. */
    gain(f, xp) {
      const me = f.mech, C = this.cfg(f), b = f.battle;
      me.xp += xp;
      let st = 0;
      for (let i = 0; i < LEG_STAGES.length; i++) if (me.xp >= LEG_STAGES[i].at) st = i;
      if (C.stageCap !== undefined) st = Math.min(st, C.stageCap);
      if (st > me.stage) {
        me.stage = st;
        b.emit('brolyStage', { fighter: f, stage: st, label: LEG_STAGES[st].label });
        b.vfx.ring(f.chest(), 2.6 * f.scale, 0x7aff9a, 0.35);
        if (st === 2) this.copy(f);
      }
      return me.stage;
    },
    /** THE CATCH: a move he knows stops in his hand, and he answers. */
    catchIt(f, att, hit, id, count) {
      const me = f.mech, b = f.battle;
      me.catchAt = b.frame;
      me.reads++;
      me.punish = att;
      f.yaw = f.prevYaw = Math.atan2(att.pos.x - f.pos.x, att.pos.z - f.pos.z);
      f.setState('guard', {});
      const dir = f.pos.clone().sub(att.pos).setY(0);
      if (dir.lengthSq() < 1e-6) dir.copy(f.forward).negate();
      dir.normalize();
      const r = f._perfectGuard(att, hit, dir, true);
      f.anim.play('br_catch', 60, { restart: true });
      const hand = f.handPos ? f.handPos('R') : f.chest();
      b.vfx.sparks(hand, 0xd8ffe0, 14, 6, 0.08);
      b.vfx.ring(hand, 0.9, 0x9affb8, 0.22);
      b.sfx('block', f, { pitch: 0.45, vol: 1.3 });
      b.slowmo(0.45, 0.22);
      b.cameraTraumaAt(hand, 0.18);
      this.gain(f, 3);
      b.emit('brolyRead', { fighter: f, attacker: att, id, count, reads: me.reads });
      return r;
    },
    /** MATCHING: the strike you used most comes back at you — your own poses on his body, his strength in it. */
    copy(f) {
      const me = f.mech;
      if (me.copied || !f.target) return;
      const att = f.target;
      let best = null, bn = 0;
      for (const [id, s] of Object.entries(me.seen)) if (s.n > bn && s.move) {
        best = s;
        bn = s.n;
      }
      if (!best) return;
      const src = best.move;
      const mine = Object.assign({}, src, { id: 'copied_' + src.id, damage: Math.round((src.damage || 400) * 1.3), lunge: (src.lunge || 10) * 1.1, cancel: src.cancel || 8, sfx: 'punchHeavy' });
      const pose = mine.pose || {};
      for (const k of [pose.wind, pose.strike, pose.follow]) {
        if (!k || f.poses[k] || !(att.poses && att.poses[k])) continue;
        f.poses[k] = att.poses[k];
        if (f.anim.poses !== f.poses) f.anim.poses[k] = att.poses[k];
      }
      const lights = ((f.form && f.form.moves && f.form.moves.light) || f.def.moves.light).slice();
      lights[0] = mine;
      f.movesOverride = Object.assign({}, f.movesOverride || {}, { light: lights });
      me.copied = mine;
      f.battle.emit('brolyCopy', { fighter: f, attacker: att, move: mine, source: src });
    },
    /** A blast he has learned: the back of a hand, and it is gone off to the side. */
    swat(f, p) {
      const me = f.mech, b = f.battle;
      me.swats++;
      me.swatAt = b.frame;
      const side = new THREE.Vector3(f.forward.z, 0, -f.forward.x).multiplyScalar(me.swats % 2 ? 1 : -1);
      p.vel.copy(side.add(new THREE.Vector3(0, 0.5, 0)).normalize().multiplyScalar(p.speed || 40));
      p.deflected = true;
      p.owner = f;
      p.team = f.team;
      p.target = null;
      p.life = Math.min(p.life, 0.6);
      f.anim.play('br_back', 40, { restart: true });
      b.vfx.impact(p.pos, 1.6, 0xd8ffe0);
      b.sfx('block', f, { pitch: 0.6, vol: 1 });
      b.emit('brolySwat', { fighter: f, swats: me.swats });
    },
    intercept(f, hit, att) {
      const me = f.mech, b = f.battle, C = this.cfg(f);
      if (!att || att === f || !hit || C.learnAt === 0) return undefined;
      if (hit.type === 'melee' && att.state === 'attack' && att.sd && att.sd.move) {
        const id = att.sd.move.id || '?';
        const s = (me.seen[id] = me.seen[id] || { n: 0, at: 0, move: att.sd.move });
        if (me.lastSd === att.sd) return undefined; // the same swing, a second hit window
        me.lastSd = att.sd;
        const known = s.n >= (C.learnAt || 3);
        s.n++;
        s.at = b.frame;
        this.gain(f, C.gain || 1);
        if (known && LEG_READY[f.state] && f.alive && !f.hidden && b.frame - me.catchAt > (C.cooldown || 60) && !hit.ultimate && !f.legendaryHold) return this.catchIt(f, att, hit, id, s.n);
        return undefined;
      }
      if (hit.type === 'ki' && !hit.ultimate) {
        me.blasts++;
        me.blastAt = b.frame;
      }
      return undefined;
    },
    update(f) {
      const me = f.mech, b = f.battle, C = this.cfg(f);
      const B = f.def.boss;
      // the phase follows the form
      if (me.formSeen !== f.formIndex) {
        me.formSeen = f.formIndex;
        if (B && B.phases) {
          const i = B.phases.findIndex((p) => p.form === f.form.id);
          if (i >= 0 && i !== me.phase) {
            me.phase = i;
            b.emit('bossPhase', { fighter: f, phase: B.phases[i], index: i });
          }
        }
        // a new form fights its own way: what he copied belongs to the old one
        if (me.copied) {
          f.movesOverride = null;
          me.copied = null;
        }
        const veins = !!C.veins;
        for (const v of (f.model && f.model.veinDecals) || []) v.visible = veins;
        if (C.shatterArmor && !me.armorShattered && f.model && f.model.damageArmor) {
          me.armorShattered = true;
          for (const pc of f.model.damageArmor(4)) {
            const p = pc.pos.sub(f.object.position).add(f.pos);
            b.vfx.rock(p, new THREE.Vector3(Math.sin(pc.size * 40) * 6, 7, Math.cos(pc.size * 40) * 6), pc.size * 0.6, pc.color);
          }
        }
      }
      // the veins pulse with his heartbeat
      const vd = f.model && f.model.veinDecals;
      if (vd && vd.length && vd[0].visible) {
        const k = 1 + Math.max(0, Math.sin(b.frame * 0.16)) * 0.35;
        for (const v of vd) v.scale.x = (v.userData.sx || (v.userData.sx = v.scale.x)) * k;
      }
      // forgetting: a move not seen for a while loses a count
      const forget = C.forget || 420;
      for (const s of Object.values(me.seen)) if (s.n > 0 && b.frame - s.at > forget) {
        s.n--;
        s.at = b.frame;
      }
      if (me.blasts > 0 && b.frame - me.blastAt > forget) {
        me.blasts--;
        me.blastAt = b.frame;
      }
      // blasts he has learned are batted aside before they land
      const blastAt = C.blastAt || 4;
      if (me.blasts >= blastAt && LEG_READY[f.state] && f.alive && !f.hidden && !f.legendaryHold && b.frame - me.swatAt > 8) {
        const c = f.chest();
        for (const p of b.projectiles.list) {
          if (!p.alive || p.team === f.team || p.kind !== 'blast' || p.deflected) continue;
          if (p.pos.distanceTo(c) > f.radius + 1.8 * f.scale) continue;
          this.swat(f, p);
          break;
        }
      }
      // the rage he carries (the story reads it): it sinks slowly when nobody is hurting him
      if (me.rage > 0 && b.frame % 6 === 0) me.rage = Math.max(0, me.rage - (C.rageCool === undefined ? 0.15 : C.rageCool));
    },
    on(f, ev, data) {
      const me = f.mech, C = this.cfg(f);
      if (ev !== 'hitTaken' && ev !== 'armoredHit') return;
      const hit = ev === 'armoredHit' ? data && data.hit : data;
      const imp = (hit && hit.impact) || 1;
      const add = (hit && hit.type === 'beam' ? 7 : imp >= 3 ? 5 : imp >= 2 ? 2.5 : 1) * (C.rageGain === undefined ? 1 : C.rageGain);
      me.rage = Math.min(100, me.rage + add);
      if (me.rage >= 100 && !me.rageFull) {
        me.rageFull = true;
        me.rageCount++;
        f.battle.emit('brolyRage', { fighter: f, value: me.rage, count: me.rageCount });
      } else if (me.rage < 70) me.rageFull = false;
    },
    // light blows do not stop him once he is angry (form.legendary.armor: blows up to that impact)
    armor(f, hit) {
      const a = this.cfg(f).armor || 0;
      return a > 0 && hit && hit.type !== 'throw' && (hit.impact || 1) <= a;
    },
    damageOut(f, hit) {
      return Mechanics.boss.damageOut.call(this, f, hit) * (1 + 0.06 * f.mech.stage);
    },
    speedMul(f) {
      return Mechanics.boss.speedMul.call(this, f) * (1 + 0.04 * f.mech.stage);
    },
    hud(f) {
      const me = f.mech || {};
      if (me.hudMode === 'rage') return { value: Math.min(1, (me.rage || 0) / 100), label: 'RAGE', active: (me.rage || 0) > 70, color: '#3aff6a' };
      const st = me.stage || 0, next = LEG_STAGES[st + 1];
      const lo = LEG_STAGES[st].at, hi = next ? next.at : lo + 1;
      return { value: next ? Math.min(1, (me.xp - lo) / (hi - lo)) : 1, label: LEG_STAGES[st].label, active: st >= 2, color: '#5aff7a' };
    },
  });

  /** Safe call helper used by Fighter. */
  SL.mech = function (f, fn, ...args) {
    const m = f.def.mechanic && Mechanics[f.def.mechanic.type];
    if (!m || !m[fn]) return undefined;
    return m[fn](f, ...args);
  };
})();
