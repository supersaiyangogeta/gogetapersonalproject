/*
 * Mission bot brains, shared by the browser tool (tools/missionbot.js) and the
 * headless Node tests (tests/sim-tests.js). A brain only returns intents — the
 * same inputs a player sends — so a passing run proves the mission can be
 * completed with normal controls.
 *
 * brain(ctx) where ctx = { SL, b, m, p, st, phase } -> intent
 */
(function (root) {
  'use strict';

  function aim(it, p, pos) {
    const dx = pos.x - p.pos.x, dz = pos.z - p.pos.z;
    it.camYaw = Math.atan2(dx, dz);
    return Math.hypot(dx, dz);
  }

  const objectiveOpen = (m, id) => m.objectives.some((o) => o.id === id && !o.done && !o.failed);

  /**
   * A plain, fair fighter: closes in, strings lights into a heavy, guards a
   * visible latch coil, dodges a burrow warning, mashes free when grabbed and
   * fires the ultimate when the ki bar is full and several enemies are near.
   */
  /** A hold the story is waiting on (a required Charge prompt). */
  function holding(b) {
    const m = b.mission;
    if (!m || b.inputLocked) return false;
    for (const p of m.prompts.values()) if (p.action === 'charge' && p.required) return true;
    return false;
  }

  function brawl({ SL, b, p, st }, it) {
    st.n = (st.n || 0) + 1;
    const n = st.n;
    if (p.state === 'held') {
      if (n % 3 === 0) it.light = true;
      return it;
    }
    const foes = b.enemiesOf(p).filter((e) => !e.untargetable && !e.hidden);
    if (!foes.length) return it;
    if (!p.target || !p.target.alive || p.target.untargetable) p.target = foes.sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos))[0];
    const t = p.target;
    const d = p.distTo(t);
    const threat = foes.find((e) => (e.state === 'latchCrouch' || e.state === 'latchLeap') && e.sd.victim === p);
    if (threat) {
      it.guard = true;
      return it;
    }
    const mound = foes.find((e) => e.state === 'burrow' && e.sd.phase === 'warn' && Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) < 3);
    if (mound && p.state === 'free') {
      it.dodge = true;
      it.mx = 1;
      return it;
    }
    const ult = p.def.specials && p.def.specials.ultimate;
    if (ult && b.rules.allowUltimates && p.ki >= ult.kiCost && p.state === 'free' && foes.filter((e) => e.pos.distanceTo(p.pos) < 40).length >= 3) {
      it.ult = true;
      it.ultHeld = true;
      return it;
    }
    if (p.state === 'beamCharge' || p.state === 'spiritBomb') {
      it.s1Held = it.s2Held = it.ultHeld = true;
      return it;
    }
    it.my = d > 2.2 ? 1 : 0;
    it.boost = d > 9;
    if (t.pos.y - p.pos.y > 1.2) it.up = true;
    else if (p.pos.y - t.pos.y > 1.2) it.down = true;
    if (d < 2.8) {
      const k = n % 40;
      if (k === 0 || k === 10 || k === 20) it.light = true;
      if (k === 30) it.heavy = true;
    }
    return it;
  }

  /**
   * A careful player against a boss: reads every telegraph and punishes the
   * openings. Stays out of warning discs, jumps over slam shockwaves, guards
   * close strings (a well-timed guard is a Perfect Guard), attacks only while
   * the boss is recovering, gloating or poise-broken, and chips with ki blasts
   * from range otherwise. Used to check that a boss is beatable by reading it.
   */
  const OPENINGS = ['stagger', 'recover', 'knockdown', 'getup', 'hitstun', 'bossTaunt', 'recoverSpecial', 'guardBreak', 'charge', 'beamCharge'];
  function bossReader({ SL, b, p, st }, it) {
    st.n = (st.n || 0) + 1;
    const n = st.n;
    if (!st.marks) {
      st.marks = [];
      b.on('telegraph', (e) => st.marks.push({ pos: e.pos, radius: e.radius, until: b.frame + e.frames + 4 }));
    }
    st.marks = st.marks.filter((mk) => mk.until > b.frame);
    const boss = b.enemiesOf(p).find((e) => e.poise) || p.target;
    if (!boss) return it;
    p.target = boss;
    const d = p.distTo(boss);
    if (p.state === 'held') {
      if (n % 3 === 0) it.light = true;
      return it;
    }
    if (p.state === 'beamCharge') {
      it.s1Held = p.stateFrame < 30;
      return it;
    }
    // get out of any warning disc: step away from its centre
    for (const mk of st.marks) {
      const dx = p.pos.x - mk.pos.x, dz = p.pos.z - mk.pos.z;
      const flat = Math.hypot(dx, dz);
      if (flat < mk.radius + 1.5) {
        it.camYaw = Math.atan2(dx, dz);
        p.target = null;
        it.my = 1;
        it.boost = true;
        if (boss.state === 'bossSlam' && boss.sd.phase === 'air') it.up = true;
        st.retarget = true;
        return it;
      }
    }
    if (st.retarget) {
      p.target = boss;
      st.retarget = false;
    }
    // Kaioken when it is safe to use, off again before the strain gets dangerous
    const nextForm = p.def.forms[p.formIndex + 1];
    if (p.form.strain && p.strain > 70 && p.state === 'free') {
      it.revert = true;
      return it;
    }
    if (nextForm && nextForm.id === 'kaioken' && b.rules.allowTransform && !(p.lockedSlots && p.lockedSlots.transform) && p.strain < 20 && p.ki > 45 && p.state === 'free' && d > 8) {
      it.transform = true;
      return it;
    }
    // a whiffed or blocked attack is an opening too
    const whiff = boss.state === 'attack' && boss.sd.move && boss.stateFrame > (boss.sd.startup || 0) + boss.sd.move.active + 2;
    const open = whiff || OPENINGS.includes(boss.state) || (boss.state === 'bossBomber' && boss.sd.phase !== 'charge') || (boss.state === 'bossSlam' && boss.sd.phase === 'recover') || (boss.state === 'bossEruption' && boss.sd.doneAt !== undefined);
    const threat = boss.state === 'attack' && boss.stateFrame <= (boss.sd.startup || 8) && d < 4.5;
    if (threat) {
      it.guard = true;
      return it;
    }
    if (open) {
      it.my = d > 2 ? 1 : 0;
      it.boost = d > 7;
      if (boss.pos.y - p.pos.y > 1.2) it.up = true;
      if (d < 2.8) {
        const k = n % 36;
        if (k === 0 || k === 9 || k === 18) it.light = true;
        if (k === 27) it.heavy = true;
      }
      return it;
    }
    // not open: keep a respectful distance and chip away
    if (d < 7) {
      it.my = -1;
      it.mx = Math.sin(n * 0.03) > 0 ? 0.6 : -0.6;
    } else {
      it.mx = Math.sin(n * 0.02) > 0 ? 1 : -1;
      if (d > 16) it.my = 0.6;
      if (n % 24 === 0 && p.ki > 20) it.blast = true;
    }
    return it;
  }

  /**
   * A careful player against a giant: keeps out of its reach and its warning
   * areas by staying high and at range, and, once the weak point is the goal,
   * flies behind it and strikes the tail.
   */
  /**
   * Playing the Great Ape (Gohan in "The Saiyan Prince"): face the little enemy,
   * roar when he gets behind to the tail, stomp him when he is on the ground,
   * grab when he is in reach, mouth blast at range, swat and smash up close.
   */
  function apeRampage({ SL, b, p, st }, it) {
    st.n = (st.n || 0) + 1;
    const n = st.n;
    const v = b.enemiesOf(p).find((e) => !e.untargetable && !e.hidden);
    if (!v) return it;
    p.target = v;
    const d = aim(it, p, v.pos);
    if (p.state !== 'free') return it;
    const height = v.pos.y - b.stage.heightAt(v.pos.x, v.pos.z);
    const to = v.pos.clone().sub(p.pos).setY(0).normalize();
    const behind = p.forward.dot(to) < -0.3;
    const cd = (slot) => (p.cooldowns[slot] || 0) > 0;
    if (behind && d < 14 && !cd('ultimate') && p.ki >= p.def.specials.ultimate.kiCost) {
      it.ult = true;
      it.ultHeld = true;
      return it;
    }
    if (d < 13 && height < 2 && !cd('special1')) {
      it.s1 = true;
      it.s1Held = true;
      return it;
    }
    if (d < 11 && height < 7 && n % 50 === 0) {
      it.guard = true;
      it.heavy = true;
      return it;
    }
    if (d < 16 && height < 4.5 && !behind && !cd('x:sweep') && n % 20 === 10) {
      it.extra = 'sweep';
      it.extraHeld = true;
      return it;
    }
    if (d > 14 && p.ki >= p.def.specials.special2.kiCost && n % 40 === 0) {
      it.s2 = true;
      return it;
    }
    it.my = d > 7 ? 1 : 0;
    if (d < 9 && n % 18 === 0) it.light = true;
    if (d < 9 && n % 64 === 32) it.heavy = true;
    return it;
  }

  function giantReader({ SL, b, p, st }, it, goForTail) {
    st.n = (st.n || 0) + 1;
    const n = st.n;
    if (!st.gmarks) {
      st.gmarks = [];
      b.on('telegraph', (e) => st.gmarks.push({ pos: e.pos, radius: e.radius, until: b.frame + e.frames + 4 }));
    }
    st.gmarks = st.gmarks.filter((mk) => mk.until > b.frame);
    const ape = b.enemiesOf(p).find((e) => e.def.hitZones);
    if (!ape) return bossReader({ SL, b, p, st }, it);
    if (p.state === 'held') {
      if (n % 3 === 0) it.light = true;
      return it;
    }
    const gh = b.stage.heightAt(p.pos.x, p.pos.z);
    const height = p.pos.y - gh;
    if (goForTail && !(ape.brokenZones && ape.brokenZones.tail)) {
      // hover behind the tail and strike it (the zone nearest to us is what we hit)
      const tail = ape._zoneCenters().filter((z) => z.zone.id === 'tail')[0];
      const goal = tail ? tail.c.clone().addScaledVector(ape.forward, -1.6) : ape.pos.clone().addScaledVector(ape.forward, -5);
      const to = goal.clone().sub(p.chest());
      const flat = Math.hypot(to.x, to.z);
      p.target = ape;
      if (flat > 1.2 || Math.abs(to.y) > 1) {
        p.target = null;
        it.camYaw = Math.atan2(to.x, to.z);
        it.my = flat > 0.8 ? 1 : 0;
        it.boost = flat > 8;
        it.up = to.y > 0.6;
        it.down = to.y < -0.6;
        return it;
      }
      if (n % 12 === 0) it.light = true;
      if (n % 48 === 36) it.heavy = true;
      return it;
    }
    // survive: stay above sweeps and stomps, out of grab reach, chip with blasts
    p.target = ape;
    const flat = Math.hypot(ape.pos.x - p.pos.x, ape.pos.z - p.pos.z);
    it.up = height < 7;
    it.my = flat < 18 ? -1 : flat > 26 ? 0.6 : 0;
    it.mx = Math.sin(n * 0.02) > 0 ? 1 : -1;
    it.boost = flat < 14;
    if (n % 30 === 0 && p.ki > 25) it.blast = true;
    return it;
  }

  const BRAINS = {
    /* ---- Buu saga, Milestone B ---- */

    /** "Learning to Fly": charge, lift, then fly to each marker, landing to rest when her breath runs short. */
    buu_flight(ctx) {
      const { SL, b, m, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      st.n = (st.n || 0) + 1;
      if (phase === 'ki') {
        it.charge = true;
        return it;
      }
      const alt = p.pos.y - b.stage.heightAt(p.pos.x, p.pos.z);
      const breath = p.stamina / p.staminaMax;
      if (phase === 'hover') {
        if (st.resting && breath > 0.7) st.resting = false;
        if (!st.resting && breath < 0.2) st.resting = true;
        if (st.resting) {
          if (!p.grounded) it.down = true;
          return it;
        }
        if (p.grounded) {
          it.up = true;
          it.upPressed = st.n % 10 === 0;
        } else if (alt < 1.4) it.up = true;
        return it;
      }
      if (phase !== 'control' && phase !== 'sustain') return it;
      const marks = m.items.filter((i) => i.alive && i.kind === 'marker');
      if (!marks.length) return it;
      const t = marks.sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos))[0];
      if (st.resting && breath > 0.75) st.resting = false;
      if (!st.resting && breath < 0.12) st.resting = true;
      if (st.resting) {
        if (!p.grounded) it.down = true;
        return it;
      }
      const d = aim(it, p, t.pos);
      if (p.grounded) {
        it.up = true;
        it.upPressed = st.n % 10 === 0;
        return it;
      }
      if (p.pos.y < t.pos.y - 0.6) it.up = true;
      else if (p.pos.y > t.pos.y + 0.8) it.down = true;
      it.my = 1;
      it.boost = phase === 'sustain' && d > 14 && breath > 0.5;
      return it;
    },

    /** "Junior Division": fight every match the player is in; watch the one he is not. */
    buu_junior(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      // the pact is broken: Goten went gold to get out of the hold, and Trunks answers in kind
      if (phase === 'hold' && p.formIndex === 0 && p.state === 'free' && !(p.lockedForms && p.lockedForms.ssj)) {
        it.transform = true;
        return it;
      }
      if (!['round1', 'final', 'gold', 'exhibition'].includes(phase)) return it;
      if (!b.rules.ringOut) return it;
      brawl(ctx, it);
      // a player who knows ring-outs exist steps back toward the middle near the edge
      const A = b.stage.arena;
      if (A && Math.max(Math.abs(p.pos.x), Math.abs(p.pos.z)) > A.half - 2.5 && p.state === 'free') {
        it.camYaw = Math.atan2(-p.pos.x, -p.pos.z);
        p.target = null;
        it.my = 1;
        it.light = it.heavy = false;
      } else if (!p.target) p.target = b.enemiesOf(p).find((e) => !e.untargetable && !e.hidden) || null;
      return it;
    },

    /** "The Evil in Him": walk the present over, punch the giggling monster (the kick once it is taught), put the hunters down, stand against the other Buu. */
    buu_split(ctx) {
      const { SL, b, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      if (!['gifts', 'hunters', 'split'].includes(phase)) return it;
      if (phase === 'gifts' && !p.target) p.target = b.story.buu;
      // the champion's Dynamite Kick, now and then, when it is his to throw
      if (p.def.id === 'mr_satan' && p.state === 'free' && p.target && p.distTo(p.target) < 6 && p.ki >= 10 && !(p.lockedSlots && p.lockedSlots.special1)) {
        st.kick = (st.kick || 0) + 1;
        if (st.kick % 150 === 0) {
          it.s1 = true;
          return it;
        }
      }
      return brawl(ctx, it);
    },

    /** "The Z Sword": heave (Charge) in the pull; nothing at all in the stillness; the cues are answered by attach(). */
    buu_zsword(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'pull' && b.mission.objectives.find((o) => o.id === 'pull' && !o.done)) it.charge = true;
      return it;
    },

    /** "Ultimate Gohan": take Super Buu apart; against Buutenks, fight on for as long as it lasts. */
    buu_ultimate(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'reversal' || phase === 'overturn') return brawl(ctx, it);
      return it;
    },

    /** "The Potara": hold Charge to take the Old Kai's life; the cues are answered by attach(). */
    buu_potara(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'life' && b.mission.objectives.find((o) => o.id === 'life' && !o.done)) it.charge = true;
      return it;
    },

    /** "The Earring": as Gohan, walk to the nearest glinting spot in the rubble until the earring turns up. */
    buu_earring(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      const spots = b.story && b.story.spots;
      if (phase !== 'search' || !spots || b.inputLocked) return it;
      const next = spots.filter((s) => !s.dug).sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos))[0];
      if (!next) return it;
      p.target = null;
      aim(it, p, next.pos);
      it.my = 1;
      return it;
    },

    /** "The Prince Returns": fight on while the clock runs; in the canyon, run for the boulder. */
    buu_prince(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'survive') return brawl(ctx, it);
      const cover = b.mission.objectives.find((o) => o.id === 'cover' && !o.done);
      if (phase === 'canyon' && cover && b.story.canyon && !b.inputLocked) {
        p.target = null;
        aim(it, p, b.story.canyon.boulder.clone().add({ x: -0.6, y: 0, z: 2.4 }));
        it.my = 1;
      }
      return it;
    },

    /** "Vegito": take Buuhan apart as base Vegito. */
    buu_vegito(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'test') return brawl(ctx, it);
      return it;
    },

    /**
     * "Super Vegito": hold Charge to transform; the rhythm beats and cues are answered by attach();
     * kick him about with the arms folded; fly into the scream; fly the candy into each glowing mark.
     */
    buu_supervegito(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'ascend' && b.mission.objectives.find((o) => o.id === 'ascend' && !o.done)) {
        it.charge = true;
        return it;
      }
      if (phase === 'arms') return brawl(ctx, it);
      if (phase === 'shout' && !b.inputLocked) {
        it.my = 1;
        it.boost = true;
        return it;
      }
      if (phase === 'candy' && !b.inputLocked && b.story.marks) {
        const c = p.pos.clone();
        c.y += p.height * 0.5;
        const marks = Object.values(b.story.marks).filter((s) => s.visible);
        const mk = marks.sort((a, d) => a.position.distanceTo(c) - d.position.distanceTo(c))[0];
        if (!mk) return it;
        p.target = null;
        const dist = aim(it, p, mk.position);
        it.my = dist > 0.25 ? 1 : 0;
        const dy = mk.position.y - c.y;
        if (dy > 0.2) it.up = true;
        else if (dy < -0.2) it.down = true;
        return it;
      }
      return it;
    },

    /** "Inside Buu": as Vegeta, walk to the nearest pod not found yet. */
    /** Chapter 14: the cues answer themselves; on the Sacred World, fight (and dodge his screamed tells). */
    buu_kidbuu(ctx) {
      return ctx.SL.emptyIntent();
    },

    buu_sacred(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (!['goku', 'minute', 'goodbuu'].includes(phase)) return it;
      const kid = b.story && b.story.kid;
      const ai = kid && kid.controller && kid.controller.kid;
      if (ai && ai.trick && b.frame % 20 === 0) {
        it.dodge = true;
        return it;
      }
      return brawl(ctx, it);
    },

    /** Chapter 15 "Peace": walk the exhausted Goku to Vegeta (the cue answers itself). */
    buu_peace(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'walk' || b.inputLocked || !b.story) return it;
      p.target = null;
      if (aim(it, p, b.story.vegeta.pos) > 2) it.my = 1;
      return it;
    },

    /** "Ten Years Later": as Uub, go to the nearest training target still standing and hit it. */
    endz_village(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'train' || b.inputLocked || !b.story) return it;
      const goals = (b.story.targets || []).filter((pr) => pr.alive).sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos));
      if (!goals.length) return it;
      p.target = null;
      const d = aim(it, p, goals[0].pos);
      // a solid prop keeps him out at its own radius: strike from there
      if (d > (goals[0].r || 0.5) + 1.1) it.my = 1;
      else if (p.state === 'free' && b.frame % 9 === 0) {
        if (goals[0].id && goals[0].id.startsWith('boulder') && b.frame % 27 === 0) it.heavy = true;
        else it.light = true;
      }
      return it;
    },

    /** "The 28th World Tournament": Uub against a Goku who only blocks and laughs. */
    endz_tournament(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'clash' && phase !== 'pan') return it;
      return brawl(ctx, it);
    },

    /** Chapter 14: the Good Buu round is a brawl; the cue and the two struggles answer themselves. */
    buu_spiritbomb(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'goodbuu') return it;
      return brawl(ctx, it);
    },

    buu_inside(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      const inn = b.story && b.story.innards;
      if (phase !== 'search' || !inn || b.inputLocked) return it;
      const found = b.story.found || new Set();
      const far = inn.pods.slice(0, 4).filter((pod, i) => !found.has(i));
      const next = far.sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos))[0];
      if (!next || b.mission.objectives.find((o) => o.id === 'pods' && o.done)) return it;
      p.target = null;
      aim(it, p, next.pos);
      it.my = 1;
      it.boost = true;
      return it;
    },

    /** "The Room of Spirit and Time": fight as Super Saiyan, hold Charge for the third level, then take Super Buu apart (the ghosts when the ki is there). */
    buu_timechamber(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (!['base', 'third'].includes(phase) || p.def.id !== 'gotenks') return it;
      const asc = b.mission.objectives.find((o) => o.id === 'ascend' && !o.done);
      if (phase === 'base' && p.form.id !== 'ssj3' && asc) {
        it.charge = true;
        return it;
      }
      // the third level burns ki: a careful player charges early and fills up (not one tick at a time)
      if (phase === 'third' && p.form.id === 'ssj3') {
        if (p.ki < 40) ctx.st.charging = true;
        if (p.ki > 90) ctx.st.charging = false;
        if (ctx.st.charging && (p.state === 'free' || p.state === 'charge')) {
          it.charge = true;
          return it;
        }
      }
      if (phase === 'third' && p.ki >= 100 && p.state === 'free' && p.target && p.distTo(p.target) < 14) {
        it.ult = true;
        it.ultHeld = true;
        return it;
      }
      return brawl(ctx, it);
    },

    /** "Fusion": the dance is pressed on the beat by attach(); the spar is fought, the gold and the ghosts used when asked. */
    buu_fusion(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'spar' || p.def.id !== 'gotenks') return it;
      if (p.formIndex === 0 && !(p.lockedForms && p.lockedForms.ssj) && p.state === 'free') {
        it.transform = true;
        return it;
      }
      if (p.formIndex > 0 && p.ki >= 100 && p.state === 'free' && p.target && p.distTo(p.target) < 14) {
        it.ult = true;
        it.ultHeld = true;
        return it;
      }
      return brawl(ctx, it);
    },

    /** "The Ultimate Fusion" (What If): the dance is answered by attach(); then Goku and Vegeta fight Gogeta — transform, then brawl. */
    whatif_gogeta(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if ((phase !== 'fight' && phase !== 'gold') || b.inputLocked) return it;
      const next = p.def.forms[p.formIndex + 1];
      if (next && !(p.lockedForms && p.lockedForms[next.id]) && !next.storyLocked && p.ki >= (next.kiCost || 0) && p.state === 'free') {
        it.transform = true;
        return it;
      }
      return brawl(ctx, it);
    },

    /** What If: Future Trunks early — brawl Nappa, then Vegeta; the Galick Gun cue answers itself. */
    whatif_trunks(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'nappa' && phase !== 'vegeta') return it;
      return brawl(ctx, it);
    },

    /** What If: Vegeta first — the ascension is a hold (the brain holds Charge), then the duel. */
    whatif_frieza(ctx) {
      const { SL, b, m, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'crush' && phase !== 'goku') return it;
      const g = b.story && b.story.goku;
      const rage = (m.flags.wfRage || {});
      // a player who reads the meter: Goku first whenever he is getting close, or turning gold
      if (g && (rage.window > 0 || rage.rage > 70)) p.target = g;
      else if (p.target === g && phase === 'crush') p.target = null;
      return brawl(ctx, it);
    },

    whatif_cell(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'guard' || phase === 'duel') return brawl(ctx, it);
      if (phase !== 'solar') return it;
      const c = b.story && b.story.cell;
      if (p.state === 'beamCharge') {
        it.ultHeld = true;
        return it;
      }
      if (c && ['beamCharge', 'beamFire'].includes(c.state) && p.state === 'free' && !b.clash.active) {
        it.ult = true;
        it.ultHeld = true;
      }
      return it;
    },

    whatif_vegeta(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'rise') {
        if (!b.inputLocked) it.charge = true;
        return it;
      }
      if (phase !== 'duel') return it;
      return brawl(ctx, it);
    },

    /** The Eternal Dragon: nothing to press (the wish is chosen for a bot: the first on offer). */
    db_shenron(ctx) {
      return ctx.SL.emptyIntent();
    },

    /** "Spopovich": fight the match she cannot win, as well as she can. */
    buu_spopovich(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'match' || ctx.b.inputLocked) return it;
      brawl(ctx, it);
      return it;
    },

    /** "The Supreme Kai": hold Charge through the ascension to Super Saiyan 2; the struggle is mashed by the harness. */
    buu_kibito(ctx) {
      const { SL, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'power' || p.state === 'transform') return it;
      it.charge = true;
      return it;
    },

    /**
     * "What if Goku defeated Raditz?": fight him down, then the beam duel — start the
     * Kamehameha early and let go when his charge flares (the window); the harness mashes.
     */
    whatif_raditz(ctx) {
      const { SL, m, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'finalFight') return brawl(ctx, it);
      if (phase !== 'beamDuel') return it;
      const d = m.flags.duel;
      if (!d || d.gFire >= 0) return it;
      if (p.state === 'free') {
        it.s1 = true;
        it.s1Held = true;
      } else if (p.state === 'beamCharge') it.s1Held = !(d.told && p.stateFrame >= 24);
      return it;
    },

    /** "The Pursuit": hold the gap — 30 to 40 metres behind the leader, at his height. */
    buu_pursuit(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'tail') return it;
      const lead = b.story.spopovich;
      aim(it, p, lead.pos);
      const gap = p.pos.distanceTo(lead.pos);
      it.my = gap > 40 ? 1 : gap < 30 ? -0.5 : 0.35;
      if (p.grounded) {
        it.up = true;
        it.upPressed = true;
      } else if (p.pos.y < lead.pos.y - 1) it.up = true;
      else if (p.pos.y > lead.pos.y + 1) it.down = true;
      return it;
    },

    /** "Planet Zoon": a straight fight. */
    buu_puipui(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'fight') return it;
      return brawl(ctx, it);
    },

    /** "The Dark Planet": the canon answer — go golden and power up in front of him until he bursts. */
    buu_yakon(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'fight' || p.state === 'transform') return it;
      const y = b.story.yakon;
      if (p.state === 'held') return brawl(ctx, it);
      const ssj = p.def.forms.findIndex((f) => f.id === 'ssj');
      if (p.formIndex < ssj) {
        if (p.ki >= 50 && p.state === 'free') it.transform = true;
        else it.charge = true;
        return it;
      }
      const d = p.distTo(y);
      if (d < 3.2) return brawl(ctx, it);
      if (d > 12) {
        aim(it, p, y.pos);
        it.my = 1;
        return it;
      }
      it.charge = true;
      return it;
    },

    /** "The Demon King": read the boss, mash out of the stone. */
    buu_dabura(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'duel') return it;
      return bossReader(ctx, it);
    },

    /* ---- Buu saga, Milestone A ---- */

    /** "Seven Years": the only thing to do is fly across the city to the plaza. */
    buu_years(ctx) {
      const { SL, b, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'flight') return it;
      const plaza = b.stage.landmarks.plaza;
      const d = aim(it, p, plaza);
      st.n = (st.n || 0) + 1;
      // get off the ground first, then hold the line to the plaza
      if (p.grounded) {
        it.up = true;
        it.upPressed = st.n % 12 === 0;
        return it;
      }
      if (p.pos.y < 14) it.up = true;
      it.my = 1;
      it.boost = d > 14;
      return it;
    },

    /** "The Great Saiyaman": the robbery, then Videl's test — both ordinary fighting. */
    buu_saiyaman(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'stop' && phase !== 'spar') return it;
      brawl(ctx, it);
      // nothing in this mission wants a beam: people are standing behind the target
      it.s1 = it.s2 = it.ult = it.blast = false;
      it.s1Held = it.s2Held = it.ultHeld = it.blastHeld = false;
      return it;
    },

    /** "Two Children": a spar, and then the same spar with two Super Saiyans. */
    buu_kids(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase, st } = ctx;
      if (phase !== 'spar' && phase !== 'rematch') return it;
      brawl(ctx, it);
      return it;
    },

    whatif_tail(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      // the grip beats are struggles (the harness mashes them); the steering beat is movement:
      // walk the held Saiyan onto Piccolo's firing line and stand there
      if (phase !== 'steer') return it;
      const pc = b.story.piccolo;
      p.target = null; // the grip is not a lock-on: movement is camera-relative in this phase
      const laneDir = pc.pos.clone().negate().setY(0).normalize(); // Piccolo → the middle of the field
      const spot = pc.pos.clone().addScaledVector(laneDir, 9.5);
      const d = aim(it, p, spot);
      if (d > 1.2) it.my = 1;
      return it;
    },

    whatif_signal(ctx) {
      const { SL, b, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      st.n = (st.n || 0) + 1;
      if (phase !== 'rig' && phase !== 'send') return it;
      const pod = b.story.pod;
      let foes = b.enemiesOf(p).filter((e) => e.alive && !e.untargetable);
      if (!foes.length) return it;
      // in SEND the job is the pod, not the kill count: go for whatever is closest to it
      const key = phase === 'send' && pod ? (e) => e.pos.distanceTo(pod.pos) : (e) => e.pos.distanceTo(p.pos);
      foes = foes.sort((a, c) => key(a) - key(c));
      const t = foes[0];
      p.target = t;
      const d = p.distTo(t);
      if (d > 2.4) {
        it.my = 1;
        it.boost = d > 7;
        it.up = t.pos.y - p.pos.y > 1.5;
        it.down = p.pos.y - t.pos.y > 1.5;
        return it;
      }
      if (st.n % 8 === 0 || p.state === 'attack') it.light = true;
      else if (st.n % 37 === 0) it.heavy = true;
      return it;
    },

    whatif_twenty(ctx) {
      const { SL, b, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      st.n = (st.n || 0) + 1;
      const n = st.n;
      if (phase === 'bursts') {
        const spires = b.story.spires.filter((s) => s.alive);
        if (!spires.length) return it;
        // free aim: locked on to Frieza the stick would orbit him instead of walking to the rock
        p.lockMode = 'free';
        p.target = null;
        spires.sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos));
        const d = aim(it, p, spires[0].pos);
        // x20 is level 4: light the Kaioken, charge it up, break rock, then put it out
        const lit = p.formIndex === 1;
        if (p.strain > 80 && lit) {
          it.revert = true;
          st.cool = true;
          return it;
        }
        if (st.cool && p.strain < 20) st.cool = false;
        // close first in base, then light it: the burst clock starts the moment he does
        if (!st.cool && !lit && p.state === 'free' && d < 8) {
          it.transform = true;
          return it;
        }
        const lit20 = lit && p.formLevel >= 4;
        // the rock's own body keeps him at arm's length: swing from where he can actually stand
        const reach = (spires[0].r || 2) + 1.8;
        if (d > reach) {
          it.my = 1;
          it.boost = d > 9;
          // rock does not dodge: burn it down from wherever he is standing
          if (lit20 && d < 12 && n % 12 === 0) it.blast = true;
          return it;
        }
        if (lit20 && (n % 6 === 0 || p.state === 'attack')) it.light = true;
        else if (lit20 && n % 11 === 0) it.blast = true;
        return it;
      }
      if (phase === 'defend') {
        // stand between Frieza and the body, and keep him busy
        const fz = b.story.frieza, g = b.story.goku;
        p.target = fz;
        const d = p.distTo(fz);
        if (fz.distTo(g) < 9 || d > 4) {
          // put a body between them: stand on the line from Frieza to Goku
          const spot = fz.pos.clone().lerp(g.pos, 0.55);
          const far = aim(it, p, spot);
          p.target = null;
          if (far > 1.2) {
            it.my = 1;
            it.boost = far > 8;
            return it;
          }
          p.target = fz;
        }
        if (n % 9 === 0) it.light = true;
        else if (fz.state === 'attack' && n % 3 === 0) it.guard = true;
        return it;
      }
      return it;
    },

    whatif_prince(ctx) {
      const { SL, b, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      // refuse is a struggle (the harness mashes it); duel is an ordinary fight
      if (phase === 'refuse') return it;
      const g = b.story.goku;
      if (phase !== 'counter') return bossReader(ctx, it);
      // the counter beat: never trade, wait until Kakarot has committed to a swing
      st.n = (st.n || 0) + 1;
      p.target = g;
      const d = p.distTo(g);
      const committed = g.state === 'attack' && g.stateFrame >= (g.sd.startup || 6);
      if (d > 2.4) {
        it.my = 1;
        it.boost = d > 7;
        return it;
      }
      // guarding and countering on the same frame cancel each other out: pick one
      if (committed) it.light = true;
      else if (g.state === 'attack') it.guard = true;
      else if (st.n % 40 === 0) it.light = true; // stay in his face so he keeps swinging
      return it;
    },

    whatif_piccolo(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, st, phase } = ctx;
      if (phase !== 'together') return it;
      const n = b.story.nappa;
      const cost = p.def.specials.ultimate.kiCost;
      // the team attack rides on the Special Beam Cannon (a full ki bar): charge while Nappa is busy with Gohan
      if (p.ki < cost && p.state === 'free' && !(n.poise && n.poise.broken > 0) && n.target !== p && p.distTo(n) > 9) {
        it.charge = true;
        return it;
      }
      // cash in a broken poise with the team attack
      if (n.poise && n.poise.broken > 0 && p.state === 'free' && !st.teamTried && b.story.gohan.alive && p.ki >= cost) {
        st.teamTried = true;
        it.ult = true;
        it.ultHeld = true;
        return it;
      }
      if (n.poise && n.poise.broken <= 0) st.teamTried = false;
      return bossReader(ctx, it);
    },

    saiyan_vegeta(ctx) {
      const it = ctx.SL.emptyIntent();
      const { p, st, phase } = ctx;
      if (phase === 'duel' || phase === 'desperate') return bossReader(ctx, it);
      if (phase === 'galick') {
        st.n = (st.n || 0) + 1;
        if (p.state === 'free' && !st.fired) {
          it.s1 = true;
          it.s1Held = true;
          st.fired = ctx.b.frame;
        } else if (p.state === 'beamCharge') it.s1Held = p.stateFrame < 26;
        if (p.state === 'free' && st.fired && ctx.b.frame - st.fired > 200) st.fired = 0;
        return it;
      }
      if (phase === 'greatApe') {
        const tailGoal = ctx.m.objectives.some((o) => o.id === 'tail' && !o.done);
        return giantReader(ctx, it, tailGoal);
      }
      if (phase === 'gohanApe') return apeRampage(ctx, it);
      return it;
    },

    saiyan_survival({ SL, b, m, p, st, phase }) {
      const it = SL.emptyIntent();
      const S = b.story;
      st.n = (st.n || 0) + 1;
      const n = st.n;
      if (phase === 'descend') {
        p.target = null;
        // hop down the rock steps: aim for the highest step below the current footing
        if (p.grounded || st.foot === undefined) st.foot = p.pos.y;
        const steps = b.stage.obstacles.filter((o) => o.mission && o.shape === 'cyl' && o.top < st.foot - 1 && Math.hypot(o.x, o.z) < 25).sort((a, c) => c.top - a.top);
        const next = steps[0];
        const goal = next ? { x: next.x, z: next.z } : { x: 26, z: 6 };
        const d = aim(it, p, goal);
        it.my = d > 0.6 ? 1 : 0;
        const here = b.stage.obstacles.find((o) => o.mission && o.shape === 'cyl' && Math.hypot(p.pos.x - o.x, p.pos.z - o.z) < o.r && Math.abs(o.top - p.pos.y) < 0.4);
        if (here && p.grounded && Math.hypot(p.pos.x - here.x, p.pos.z - here.z) > here.r - 0.9) it.upPressed = true;
      } else if (phase === 'hungry') {
        const item = m.items.filter((i) => i.alive).sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos))[0];
        if (item) {
          aim(it, p, item.pos);
          it.my = 1;
        }
      } else if (phase === 'chase') {
        p.target = null;
        if (S.runGoal) aim(it, p, S.runGoal.pos);
        it.my = 1;
        // sprint in bursts: keep a little stamina for when the dinosaur gets close
        const dino = S.dino;
        const close = dino && dino.pos.distanceTo(p.pos) < 14;
        it.boost = st.naiveSprint ? true : close || p.stamina > p.staminaMax * 0.5;
      } else if (phase === 'moon') {
        // Piccolo: read the giant until the moon objective opens, then climb and blast it
        if (objectiveOpen(m, 'moon')) {
          // climb above the giant, move the lock from the giant to the moon (Next Target), fire
          const ape = S.gape;
          const groundY = b.stage.heightAt(p.pos.x, p.pos.z);
          const high = !ape || p.pos.y - groundY > ape.height * 1.1;
          it.up = !high;
          if (ape && !high) {
            aim(it, p, { x: ape.pos.x + 18, z: ape.pos.z + 18 });
            it.my = 0.4;
          }
          const moon = S.moonProp;
          if (high && moon && moon.alive) {
            if (p.lockProp !== moon) {
              if (n % 15 === 0) it.targetNext = true;
            } else if (n % 12 === 0) it.blast = true;
          }
        } else if (b.player === p && S.gape) return giantReader({ SL, b, p, st }, it, false);
      } else if (phase === 'training') {
        const pc = S.piccolo;
        if (objectiveOpen(m, 'barrage')) {
          it.guard = true;
        } else if (objectiveOpen(m, 'hits')) {
          p.target = pc;
          const d = p.distTo(pc);
          it.my = d > 1.8 ? 1 : 0;
          it.boost = d > 8;
          if (d < 2.6 && n % 9 === 0) it.light = true;
          if (d < 2.6 && n % 47 === 0) it.heavy = true;
        } else if (objectiveOpen(m, 'catch')) {
          p.target = null;
          const d = aim(it, p, pc.pos);
          it.my = 1;
          it.boost = d > 6;
          const dy = pc.chest().y - p.chest().y;
          it.up = dy > 0.8;
          it.down = dy < -0.8;
        } else if (objectiveOpen(m, 'masenko')) {
          p.target = pc;
          if (p.state === 'free' && n % 30 === 0) {
            it.s1 = true;
            it.s1Held = true;
          } else if (p.state === 'beamCharge') it.s1Held = true;
        }
      }
      return it;
    },

    saiyan_nappa(ctx) {
      const it = ctx.SL.emptyIntent();
      const { p, phase, st } = ctx;
      if (phase !== 'holdLine' && phase !== 'duel') return it;
      if (phase === 'duel' && p.state === 'free') {
        // a careful player uses the Kaioken rather than saving it for a funeral
        const next = p.def.forms[p.formIndex + 1];
        if (next && p.formIndex === 0 && p.hpFrac > 0.45 && p.ki >= next.kiCost + 10 && !st.kkTried) {
          st.kkTried = true;
          it.transform = true;
          return it;
        }
        // and blocks when a single exchange would end the mission
        if (p.hpFrac < 0.22 && p.target && p.target.state === 'attack' && p.distTo(p.target) < 4) {
          it.guard = true;
          return it;
        }
      }
      return bossReader(ctx, it);
    },

    namek_vegeta(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase === 'cui') return brawl(ctx, it);
      if (ctx.phase === 'dodoria') return bossReader(ctx, it);
      return it;
    },

    /** 'The Third Level': stall him, hold Charge through the third level, then keep the ki up while it burns. */
    buu_ssj3(ctx) {
      const { SL, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'ascend') {
        it.charge = true;
        return it;
      }
      if (phase === 'third' && p.form.id === 'ssj3' && p.ki < 25 && p.state === 'free') {
        it.charge = true;
        return it;
      }
      if (phase === 'delay' || phase === 'third') return brawl(ctx, it);
      return it;
    },

    /** 'Majin Buu': read Dabura, then fight Buu (he is the lesson, not the win). */
    buu_awakening(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase === 'demon') return bossReader(ctx, it);
      if (ctx.phase === 'buu') return brawl(ctx, it);
      return it;
    },

    /** 'The Prince's Pride': fight Buu as Majin Vegeta, then hold Charge through the end. */
    buu_sacrifice(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase === 'final') {
        it.charge = true;
        return it;
      }
      if (ctx.phase === 'blow' || ctx.phase === 'again') return brawl(ctx, it);
      return it;
    },

    /** 'Prince of Saiyans': fight, hold Charge through the ascension, answer the Galick Gun. */
    buu_pride(ctx) {
      const { SL, b, p, phase, st } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'ascend') {
        it.charge = true;
        return it;
      }
      if (phase === 'sky' && b.mission.objectives.some((o) => o.id === 'answer' && !o.done && !o.failed)) {
        const v = b.story.vegeta;
        if (p.state === 'beamCharge') {
          it.s1Held = p.stateFrame < 30;
          return it;
        }
        if (p.state === 'free' && v.state === 'scripted') {
          aim(it, p, v.pos);
          it.s1 = true;
          it.s1Held = true;
        }
        return it;
      }
      if (phase === 'first' || phase === 'clash' || phase === 'sky' || phase === 'ruin') return brawl(ctx, it);
      return it;
    },

    /** 'The Mark': the resist struggle is mashed by the harness; at the stands, get to him in time. */
    buu_majin(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'stop') return it;
      if (ctx.st.late) return it; // a seed that lets him fire: the consequence path
      brawl(ctx, it);
      it.boost = true;
      return it;
    },

    /** The Cell Games chain (rebuilt 2026-10-01): fight the playable stretches, hold Charge when a hold is
     *  waiting (the Kamehameha's charge, Gohan's first gold), answer the Father-Son Kamehameha. */
    cell_games(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (holding(b)) {
        it.charge = true;
        return it;
      }
      if (phase === 'goku' || phase === 'air') return brawl(ctx, it);
      return it;
    },

    cell_chamber(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (holding(b)) {
        it.charge = true;
        return it;
      }
      if (phase === 'spar' || phase === 'master') return brawl(ctx, it);
      return it;
    },

    cell_gohan(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (['test', 'hold', 'juniors'].includes(phase)) return brawl(ctx, it);
      return it;
    },

    cell_rampage(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'rampage' || phase === 'toyed') return brawl(ctx, it);
      return it;
    },

    cell_goodbye(ctx) {
      return ctx.SL.emptyIntent();
    },

    cell_fatherson(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      const c = b.story && b.story.cell;
      if (phase !== 'beam') return it;
      if (p.state === 'beamCharge') {
        it.ultHeld = true;
        return it;
      }
      if (c && c.state === 'beamFire' && p.state === 'free' && !b.clash.active && !(p.lockedSlots && p.lockedSlots.ultimate)) {
        it.ult = true;
        it.ultHeld = true;
      }
      return it;
    },

    cell_future(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (['eighteen', 'seventeen', 'cell'].includes(phase)) return brawl(ctx, it);
      return it;
    },

    cell_semi(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'hold' && ctx.phase !== 'tien') return it;
      return brawl(ctx, it);
    },

    cell_perfect(ctx) {
      const it = ctx.SL.emptyIntent();
      if (holding(ctx.b)) {
        it.charge = true;
        return it;
      }
      if (ctx.phase !== 'semi' && ctx.phase !== 'beaten') return it;
      return brawl(ctx, it);
    },

    cell_first(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'fight') return it;
      // he regrows what you do not follow up: stay on him
      return brawl(ctx, it);
    },

    android_road(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'vegeta' && ctx.phase !== 'trunks') return it;
      // she is faster than both of them: stay in her face and keep hitting
      return brawl(ctx, it);
    },

    android_lab({ SL, b, p, st, phase }) {
      const it = SL.emptyIntent();
      if (phase === 'chase') {
        const lab = b.stage.props.find((x) => x.id === 'labDoor' && x.alive);
        if (!lab) return it;
        aim(it, p, lab.pos);
        it.my = 1;
        it.up = p.grounded || p.pos.y < lab.pos.y + 6;
        it.boost = !p.winded && p.stamina > p.staminaMax * 0.3;
        return it;
      }
      if (phase !== 'capsules') return it;
      const c = b.stage.props.find((x) => String(x.id).indexOf('capsule') === 0 && x.alive);
      if (!c) return it;
      const d = aim(it, p, c.pos);
      if (p.state !== 'free') return it;
      if (d > 3) {
        it.my = 1;
        it.boost = !p.winded && d > 8;
        return it;
      }
      st.n = (st.n || 0) + 1;
      if (st.n % 18 === 0) it.heavy = true;
      else if (st.n % 5 === 0) it.light = true;
      return it;
    },

    android_nineteen(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase !== 'goku' && ctx.phase !== 'vegeta') return it;
      // ki feeds them: this bot only uses its hands
      const r = brawl(ctx, it);
      r.s1 = false; r.s2 = false; r.ult = false;
      return r;
    },

    // THE TEST: Trunks swings at Goku, who stops every cut on one finger (the bot just keeps swinging)
    android_warning(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'test') return it;
      const g = b.story && b.story.goku;
      if (!g || p === g) return it;
      st.n = (st.n || 0) + 1;
      const d = aim(it, p, g.pos);
      p.target = g;
      if (p.state !== 'free' && p.state !== 'attack') return it;
      if (d > 2.2) {
        it.my = 1;
        return it;
      }
      if (st.n % 9 === 0) it.heavy = true;
      else if (st.n % 4 === 0) it.light = true;
      return it;
    },

    // THE STRANGER: cut through the army; against Frieza, press him until he is afraid, then the
    // Burning Attack (the story waits for it)
    android_trunks(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'massacre') return brawl(ctx, it);
      if (phase !== 'frieza') return it;
      st.n = (st.n || 0) + 1;
      const n = st.n;
      const demo = b.story && b.story.demo;
      const v = b.story && b.story.frieza;
      if (!v || !v.alive) return it;
      p.target = v;
      const d = aim(it, p, v.pos);
      if (p.state === 'held' || p.state === 'clash') {
        if (n % 3 === 0) it.light = true;
        return it;
      }
      if (p.state !== 'free' && p.state !== 'attack') return it;
      if (demo && demo.mood === 'terrified' && p.ki >= p.def.specials.special1.kiCost) {
        it.s1 = true;
        it.s1Held = true;
        return it;
      }
      if (d > 3.5) {
        it.my = 1;
        it.boost = d > 9 && !p.winded;
        return it;
      }
      if (n % 20 === 14) it.heavy = true;
      else if (n % 5 === 0) it.light = true;
      return it;
    },

    namek_aftermath(ctx) {
      const { SL, b, p, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'search' && phase !== 'pods') return it;
      const id = phase === 'search' ? 'friezaShip' : 'ginyuPod';
      const pr = b.stage.props.find((x) => x.id === id && x.alive);
      if (!pr) return it;
      // fly there: the ground is a hazard for the whole run
      aim(it, p, pr.pos);
      it.my = 1;
      it.up = !p.grounded ? p.pos.y < pr.pos.y + 6 : true;
      it.boost = !p.winded && p.stamina > p.staminaMax * 0.35;
      return it;
    },

    namek_end(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (!['full', 'finish', 'saucers', 'escape'].includes(phase)) return it;
      // the ground is the hazard now: stay off it
      if (p.grounded && p.state === 'free') {
        it.up = true;
        it.my = 1;
        return it;
      }
      // the saucers: keep moving, keep him between you and the discs
      if (phase === 'saucers') {
        const fz2 = b.story.frieza;
        const disc = b.projectiles.list.find((p) => p.alive && p.kind === 'disc');
        if (p.state === 'free' && disc && p.pos.distanceTo(disc.pos) < 7) {
          it.dodge = true;
          it.mx = 1;
          return it;
        }
        if (fz2 && fz2.alive) {
          aim(it, p, fz2.pos);
          const d = p.distTo(fz2);
          it.my = d > 9 ? 1 : -0.4;
          it.up = p.grounded;
          return it;
        }
        return it;
      }
      if (phase === 'escape') {
        it.up = !p.grounded && p.pos.y < 14;
        it.my = 1;
        return it;
      }
      const fz = b.story.frieza;
      if (fz && fz.alive && p.state === 'free' && (fz.state === 'specialThrow' || fz.state === 'deathSaucer')) {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_super_saiyan(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (!['reversal', 'desperation'].includes(phase)) return it;
      const fz = b.story.frieza;
      if (!fz || !fz.alive) return it;
      if (p.state === 'free' && (fz.state === 'specialThrow' || fz.state === 'deathSaucer')) {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_spirit_bomb(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'hold') return it;
      // Piccolo's job: be on Frieza, so Frieza is not on Goku
      const fz = b.story.frieza;
      if (!fz || !fz.alive) return it;
      p.target = fz;
      if (p.state === 'free' && (fz.state === 'specialThrow' || fz.state === 'deathSaucer') && fz.target === p) {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      return bossReader(ctx, it);
    },

    // every beat of the death mission is a scene now: the bot only has to watch
    namek_vegeta_end(ctx) {
      return ctx.SL.emptyIntent();
    },

    namek_goku(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'base' && phase !== 'rising') return it;
      const fz = b.story.frieza;
      if (!fz || !fz.alive) return it;
      // the Death Beam and the saucers are both answered by moving, not blocking
      if (p.state === 'free' && (fz.state === 'specialThrow' || fz.state === 'deathSaucer')) {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      // in the second half the Kaioken is the point: keep it lit and climb it to x4
      if (phase === 'rising' && p.state === 'free') {
        const kk = p.def.forms[1];
        if (p.formIndex === 0 && p.ki >= kk.kiCost + 10 && p.hpFrac > 0.35 && !p.overloadCooldown) {
          it.transform = true;
          return it;
        }
        if ((p.formIndex === 1 && p.formLevel < p.formLevelCap(kk) && p.ki > 30 && p.distTo(fz) > 6) || p.state === 'charge') {
          it.charge = true;
          return it;
        }
      }
      return bossReader(ctx, it);
    },

    namek_kaioken20(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'ten' && phase !== 'desperate') return it;
      const fz = b.story.frieza;
      if (!fz || !fz.alive) return it;
      if (p.state === 'free' && (fz.state === 'specialThrow' || fz.state === 'deathSaucer')) {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      // the multiplier is the fight: relight it when it drops
      if (p.state === 'free' && p.formIndex === 0 && p.ki >= p.def.forms[1].kiCost + 5 && !p.overloadCooldown) {
        it.transform = true;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_frieza2(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'even' && phase !== 'outclassed') return it;
      const fz = b.story.frieza;
      // the second form charges and the third one rushes: both are answered by not
      // standing in the line, and the third form is survived rather than beaten
      if (fz && fz.state === 'rush' && p.state === 'free') {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      if (phase === 'outclassed' && p.hpFrac < 0.4 && p.state === 'free' && fz && p.distTo(fz) < 4) {
        it.guard = true;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_nail(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase, st } = ctx;
      if (phase !== 'stall') return it;
      // the whole fight is a clock: guard to knit the damage back together, and
      // steal a hit whenever the emperor is busy recovering from his own move
      const fz = b.story.frieza;
      if (!fz || !fz.alive || p.state !== 'free') return it;
      if (p.hpFrac < 0.55) {
        it.guard = true;
        return it;
      }
      st.n = (st.n || 0) + 1;
      const d = p.distTo(fz);
      if (d > 3) {
        p.target = fz;
        aim(it, p, fz.pos);
        it.my = 1;
        it.boost = d > 9;
        return it;
      }
      if (['recover', 'stagger', 'recoverSpecial'].includes(fz.state)) {
        if (st.n % 8 === 0) it.heavy = true;
        else if (st.n % 3 === 0) it.light = true;
        return it;
      }
      if (st.n % 20 === 0) it.light = true;
      else it.guard = true;
      return it;
    },

    namek_gohan_frieza2(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase, st } = ctx;
      if (phase !== 'assault') return it;
      const fz = b.story.frieza;
      if (!fz || !fz.alive || p.state !== 'free') return bossReader(ctx, it);
      st.n = (st.n || 0) + 1;
      // the rage window is short: spend the ki on the Masenko, then keep swinging
      if (p.ki >= 30 && st.n % 90 === 0) {
        it.s1 = true;
        it.s1Held = true;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_frieza1(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'firstForm' && phase !== 'hold') return it;
      const fz = b.story.frieza;
      // his beam goes through a guard and his charge goes through everything:
      // both are answered by not being in the line
      if (fz && (fz.state === 'specialThrow' || fz.state === 'rush') && p.state === 'free') {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_frog(ctx) {
      const it = ctx.SL.emptyIntent();
      // one straight fight: Jeice keeps buying distance, so chase him down
      if (ctx.phase !== 'cleanup') return it;
      const { b, p } = ctx;
      const jc = b.story.jeice;
      if (jc && jc.alive && p.distTo(jc) > 10 && p.state === 'free') it.boostPressed = true;
      return bossReader(ctx, it);
    },

    namek_ginyu(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (!['captain', 'stolen', 'retake'].includes(phase)) return it;
      const thief = b.fighters.find((f) => b.mindOf(f).id === 'ginyu');
      if (phase === 'retake' && thief) {
        // the whole phase is one job: be standing in the beam when it fires
        const vg = b.story.vegeta;
        const line = thief.pos.clone().lerp(vg.pos, 0.45);
        const to = line.clone().sub(p.pos);
        const flat = Math.hypot(to.x, to.z);
        p.target = null;
        it.camYaw = Math.atan2(to.x, to.z);
        if (flat > 0.9) {
          it.my = 1;
          it.boostPressed = flat > 5 && p.stamina > 30;
          it.boost = flat > 5;
        }
        return it;
      }
      if (thief && thief.state === 'bodyChange' && p.state === 'free') {
        it.dodge = true;
        it.mx = 1;
        return it;
      }
      return bossReader(ctx, it);
    },

    namek_ginyu_pair(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase !== 'pair' && phase !== 'alone') return it;
      const S = b.story;
      // guard a Blue Hurricane pass rather than eat six of them
      if (phase === 'pair' && S.burter && S.burter.state === 'speedOrbit' && p.state === 'free') {
        it.guard = true;
        return it;
      }
      // Jeice keeps kicking off backwards: chase him down instead of trading shots
      if (phase === 'alone' && S.jeice && p.distTo(S.jeice) > 9 && p.state === 'free') {
        it.boostPressed = true;
      }
      // with the story power gap on (playtest round 2) nothing slides off Burter: press, the way a
      // player who has just felt it would, instead of waiting for openings
      if (p.storySpeed) return brawl(ctx, it);
      return bossReader(ctx, it);
    },

    namek_recoome(ctx) {
      const it = ctx.SL.emptyIntent();
      // bossReader already treats a posing boss as an opening, which is the whole fight
      if (ctx.phase === 'pride' || ctx.phase === 'hold') return bossReader(ctx, it);
      return it;
    },

    namek_guldo(ctx) {
      const it = ctx.SL.emptyIntent();
      // the only real opening is the gasp after a freeze; bossReader already
      // punishes stagger states, which is exactly what Guldo leaves behind
      if (ctx.phase === 'guldo') return bossReader(ctx, it);
      return it;
    },

    namek_guru(ctx) {
      const it = ctx.SL.emptyIntent();
      const { p, st, phase } = ctx;
      if (phase !== 'patrol' && phase !== 'awakening') return it;
      // once Guru has opened it, use it: the elite is tuned to punish base Krillin
      if (phase === 'awakening' && p.formIndex === 0 && !(p.lockedForms && p.lockedForms.potential) && p.state === 'free' && !st.tfTried) {
        st.tfTried = true;
        it.transform = true;
        return it;
      }
      return brawl(ctx, it);
    },

    namek_rematch(ctx) {
      const it = ctx.SL.emptyIntent();
      // straight boss fight: the Zenkai does the talking, the bot just reads telegraphs
      if (ctx.phase === 'rematch') return bossReader(ctx, it);
      return it;
    },

    namek_zarbon(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      // both halves are read the same way — telegraphs first — but the monstrous
      // form punishes trading, so the bot keeps its distance when it is hurt
      if (phase === 'duel') return bossReader(ctx, it);
      if (phase === 'monster') {
        const z = b.story.zarbon;
        if (z && p.hpFrac < 0.35 && p.distTo(z) < 6) {
          p.target = z;
          it.my = -1;
          it.boost = true;
          it.guard = p.distTo(z) < 4;
          return it;
        }
        return bossReader(ctx, it);
      }
      return it;
    },

    namek_hunted(ctx) {
      const it = ctx.SL.emptyIntent();
      const { b, p, phase } = ctx;
      if (phase === 'village') return brawl(ctx, it);
      if (phase === 'flight') {
        // run the shelters in order of distance; with a target set, movement would be target-relative
        const left = (b.story.covers || []).filter((c) => !c.taken).sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos));
        if (!left.length) return it;
        p.target = null;
        const goal = left[0];
        const d = aim(it, p, goal.pos);
        it.my = 1;
        it.boost = d > 10;
        const dy = goal.pos.y - p.chest().y;
        it.up = dy > 0.8;
        it.down = dy < -0.8;
        return it;
      }
      // Gohan (CPU ally) lands the Masenko himself; the player's job is breaking the
      // guard: bossReader reads telegraphs, and a guarding Dodoria gets a committed
      // heavy every so often instead of being poked at forever
      if (phase === 'cornered') {
        const dod = b.story.dodoria;
        const st = ctx.st;
        st.poke = (st.poke || 0) + 1;
        if (dod && dod.alive && dod.state === 'guard' && p.state === 'free' && p.distTo(dod) < 2.8 && st.poke % 26 === 0) {
          it.heavy = true;
          return it;
        }
        return bossReader(ctx, it);
      }
      return it;
    },

    saiyan_saibamen(ctx) {
      const it = ctx.SL.emptyIntent();
      if (ctx.phase === 'tien' || ctx.phase === 'pack') return brawl(ctx, it);
      return it;
    },

    /**
     * Snake Way: follow the road a few metres ahead, pace the sprint so there is
     * stamina for the long gaps, and jump at the edge of each gap.
     */
    saiyan_snakeway({ SL, b, p, st, phase }) {
      const it = SL.emptyIntent();
      if (phase !== 'run') return it;
      const stage = b.stage, road = stage.road;
      const q = stage.roadInfo(p.pos.x, p.pos.z);
      if (q.i >= 0 && q.onRoad) st.lastS = q.s;
      // over a gap the nearest sample still says how far along he is: steer from there, never back toward the takeoff
      const s = q.i >= 0 ? Math.max(q.s, st.lastS || 0) : st.lastS || 0;
      const ahead = Math.min(road.length - 0.5, s + 6);
      const k = Math.round(ahead / road.step);
      aim(it, p, { x: road.x[k], z: road.z[k] });
      it.my = 1;
      const gap = road.gaps.find((g) => g.to > s);
      const toGap = gap ? gap.from - s : Infinity;
      const long = gap && gap.to - gap.from > 4.5;
      if (long && toGap < 22) it.boost = !p.winded;
      else it.boost = !p.winded && p.stamina > p.staminaMax * (long && toGap < 60 ? 0.95 : 0.5);
      if (p.grounded && toGap < 1.2 && toGap > -0.3) {
        it.upPressed = true;
        it.boost = !p.winded;
      }
      return it;
    },

    saiyan_kingkai({ SL, b, p, st, phase }) {
      const it = SL.emptyIntent();
      const S = b.story;
      st.n = (st.n || 0) + 1;
      const n = st.n;
      if (phase === 'bubbles') {
        p.target = S.bubbles;
        it.my = 1;
        it.boost = true;
      } else if (phase === 'gregory' && S.gregory) {
        p.target = null;
        const d = aim(it, p, S.gregory.pos);
        if (d > 1.4) {
          it.my = 1;
          it.boost = d > 5;
        }
        if (d < 2.2 && n % 12 === 0) it.light = true;
        if (S.gregory.pos.y - p.pos.y > 1.9 && p.grounded && d < 2 && n % 30 === 0) it.upPressed = true;
      } else if (phase === 'kaioken') {
        p.target = null;
        const rocks = b.stage.props.filter((pr) => pr.alive && pr.requireForm);
        if (!rocks.length) return it;
        rocks.sort((a, c) => a.pos.distanceTo(p.pos) - c.pos.distanceTo(p.pos));
        const d = aim(it, p, rocks[0].pos);
        // careful player: power down before the body gives out; greedy player never does
        if (p.strain > (st.greedy ? 101 : 78) && p.form.id === 'kaioken') {
          it.revert = true;
          st.cool = true;
        }
        if (st.cool && p.strain < 25) st.cool = false;
        if (d > 2.6) {
          it.my = 1;
          it.boost = d > 6;
        } else if (!st.cool && p.form.id === 'base' && p.state === 'free' && n % 20 === 0 && st.resisted) it.transform = true;
        else if ((n % 10 === 0 && p.state === 'free') || (p.state === 'attack' && n % 6 === 0)) it.light = true;
      }
      return it;
    },
    /* ---------------- MOVIE: FUSION REBORN ---------------- */
    /** Mission 1: fly to the station round the rifts, then strike the crystal. */
    fr_cleansing(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      const B = b.stage.barrier;
      if (phase === 'arrive') {
        p.target = null;
        const front = b.stage.landmarks.barrierFront;
        const d = aim(it, p, front);
        it.my = 1;
        it.boost = d > 10;
        // a careful pilot goes round the rifts
        for (const r of (b.story && b.story.rifts) || []) {
          const dx = r.at.x - p.pos.x, dz = r.at.z - p.pos.z;
          if (Math.hypot(dx, dz) < 7 && Math.abs(r.at.y - p.chest().y) < 5) it.mx = (dx * Math.cos(it.camYaw) - dz * Math.sin(it.camYaw)) > 0 ? -1 : 1;
        }
        if (p.pos.y - b.stage.heightAt(p.pos.x, p.pos.z) < 4) it.up = true;
        return it;
      }
      if (phase === 'barrier' && B) {
        p.target = null;
        const d = aim(it, p, B.center) - B.radius;
        if (p.pos.y - b.stage.heightAt(p.pos.x, p.pos.z) > 1.5) it.down = true;
        if (d > 2.2) it.my = 1;
        else if (p.state === 'free' && (st.n = (st.n || 0) + 1) % 12 === 0) it.light = true;
      }
      return it;
    },

    /** Mission 2: test the crystal as Pikkon; fight the child without punching into his doors; hold for SSJ3;
     *  charge when SSJ3 runs low; fire the Kamehameha when that is all the story allows. */
    fr_janemba(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      st.n = (st.n || 0) + 1;
      if (holding(b)) {
        it.charge = true;
        return it;
      }
      const B = b.stage.barrier, m = b.mission;
      if (phase === 'pikkon' && B) {
        p.target = null;
        const d = aim(it, p, B.center) - B.radius;
        if (p.pos.y - b.stage.heightAt(p.pos.x, p.pos.z) > 1.5) it.down = true;
        const want = !m.flags.pkMelee ? 'light' : !m.flags.pkBlast ? 'blast' : 'heavy';
        if (want === 'blast') {
          if (d > 6) it.my = 1;
          else if (d < 4) it.my = -1;
          else if (p.state === 'free' && st.n % 20 === 0) it.blast = true;
          return it;
        }
        if (d > 2.2) it.my = 1;
        else if (p.state === 'free' && st.n % 14 === 0) it[want] = true;
        return it;
      }
      if (phase === 'finish') {
        if (b.playerLimits && b.playerLimits.s1 === undefined && b.playerLimits.light === false) {
          st.k = (st.k || 0) + 1;
          if (st.k < 3) it.s1 = true;
          it.s1Held = st.k < 64;
        }
        return it;
      }
      if (phase === 'duel' || phase === 'fight') {
        const jb = b.story && b.story.janemba;
        // the door is open: do not hit into it, step round to his side instead
        if (jb && SL.Mechanics.dimensional.doorOpen(jb)) {
          p.target = jb;
          it.mx = 1;
          it.my = p.distTo(jb) > 5 ? 1 : 0;
          if (p.distTo(jb) < 2.6 && jb.forward.dot(p.pos.clone().sub(jb.pos).setY(0).normalize()) < 0.1 && st.n % 10 === 0) it.light = true;
          return it;
        }
        if (jb && p.form.id === 'ssj3' && p.ki < p.kiMax * 0.2 && p.state === 'free' && p.distTo(jb) > 7) st.charging = true;
        if (st.charging) {
          if (!jb || p.ki > p.kiMax * 0.7 || p.distTo(jb) < 4) st.charging = false;
          else {
            it.charge = true;
            return it;
          }
        }
        return brawl(ctx, it);
      }
      return it;
    },

    fr_gohan(ctx) {
      const { SL, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'soldiers' || phase === 'frieza') return brawl(ctx, it);
      return it;
    },

    /** Mission 4: go for the nearest tank, heavy it when close; transform when that is all the story allows. */
    fr_boys(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      st.n = (st.n || 0) + 1;
      if (b.playerLimits && b.playerLimits.transform === undefined && b.playerLimits.light === false) {
        if (p.state === 'free' && p.formIndex === 0) it.transform = true;
        return it;
      }
      if (phase !== 'tanks' && phase !== 'finish') return it;
      const A = b.story && b.story.armour;
      const tanks = A ? A.tanks.filter((t) => t.pr.alive) : [];
      if (!tanks.length) return brawl(ctx, it);
      tanks.sort((a, c) => a.pr.pos.distanceTo(p.pos) - c.pr.pos.distanceTo(p.pos));
      p.target = null;
      const tk = tanks[0];
      const d = aim(it, p, tk.pr.pos);
      const dy = tk.pr.pos.y - p.chest().y;
      if (dy > 0.8) it.up = true;
      else if (dy < -1.2) it.down = true;
      if (d > 3.4) {
        it.my = 1;
        it.boost = d > 10;
      } else if (p.state === 'free' && st.n % 16 === 0) it[st.n % 48 === 0 ? 'light' : 'heavy'] = true;
      return it;
    },

    /** Mission 5: last against Super Janemba without repeating one strike (he reads it), then the duo. */
    fr_vegeta(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'struggle' && phase !== 'duo') return it;
      st.n = (st.n || 0) + 1;
      const t = b.enemiesOf(p).find((e) => !e.hidden && !e.untargetable);
      if (!t) return it;
      p.target = t;
      const d = p.distTo(t);
      it.my = d > 2.4 ? 1 : 0;
      it.boost = d > 9;
      if (t.pos.y - p.pos.y > 1.2) it.up = true;
      else if (p.pos.y - t.pos.y > 1.2) it.down = true;
      // varied: light, heavy, blast, a pause: never the same strike three times in a row
      if (d < 2.8 && p.state === 'free') {
        const k = st.n % 60;
        if (k === 0) it.light = true;
        if (k === 20) it.heavy = true;
        if (k === 40) it.blast = true;
      }
      if (d >= 2.8 && d < 14 && st.n % 50 === 0) it.blast = true;
      return it;
    },

    /** Mission 6: bounce away whenever Janemba is close or swinging; waddle away otherwise. */
    fr_veku(ctx) {
      const { SL, b, p, st, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase !== 'survive') return it;
      st.n = (st.n || 0) + 1;
      const sj = b.story && b.story.sj;
      if (!sj) return it;
      p.target = null;
      const away = p.pos.clone().sub(sj.pos).setY(0);
      const d = away.length();
      const goal = p.pos.clone().add(away.normalize().multiplyScalar(10));
      if (goal.length() > 100) goal.multiplyScalar(0.5);
      aim(it, p, goal);
      it.my = 1;
      const shot = b.projectiles.list.some((pr) => pr.alive && pr.owner === sj && pr.pos.distanceTo(p.chest()) < 9 && pr.vel.clone().normalize().dot(p.chest().sub(pr.pos).normalize()) > 0.7);
      const threat = d < 4.5 || (sj.state === 'attack' && d < 6) || sj.state === 'portalStrike' || shot;
      if (threat && p.state === 'free' && st.n % 6 === 0) it.dodge = true;
      return it;
    },

    /** Mission 7: Pikkon's stand (brawl); the dance and the cues answer themselves; fight Janemba; hold the Stardust Breaker. */
    fr_gogeta(ctx) {
      const { SL, b, phase } = ctx;
      const it = SL.emptyIntent();
      if (phase === 'finish') {
        // the Stardust Breaker: hold Special 2 until the orb is full, then let go
        if (b.breaker) it.s2Held = b.breaker.want === 'hold';
        return it;
      }
      // Pikkon's stand and the free fight: brawl (the stand ends on its own clock, win or not)
      if (phase === 'dominate' || phase === 'pikkon') return brawl(ctx, it);
      return it;
    },

    fr_x_fat(ctx) {
      return BRAINS.fr_janemba(Object.assign({}, ctx, { phase: 'fight' }));
    },
    fr_x_earth(ctx) {
      return brawl(ctx, ctx.SL.emptyIntent());
    },
    fr_x_dance(ctx) {
      return ctx.SL.emptyIntent();
    },
    fr_x_super(ctx) {
      const { p } = ctx;
      const next = p.def.forms[p.formIndex + 1];
      if (next && !(p.lockedForms && p.lockedForms[next.id]) && p.ki >= (next.kiCost || 0) && p.state === 'free') {
        const it = ctx.SL.emptyIntent();
        it.transform = true;
        return it;
      }
      return BRAINS.fr_vegeta(Object.assign({}, ctx, { phase: 'duo' }));
    },

    /** MOVIE 2 · "The First Clash": hold for the transformations; brawl (Broly reads the bot's repeated jab — as a
     *  real player who never varies would be read); the finish cue answers itself. */
    bb_clash(ctx) {
      const { SL, b } = ctx;
      const it = SL.emptyIntent();
      if (holding(b)) {
        it.charge = true;
        return it;
      }
      return bbFight(ctx, it);
    },
    /** "Wrath": the seven shots' cues answer themselves; hold for Blue; brawl round the leaps; the Galick Gun. */
    bb_wrath(ctx) {
      const { SL, b, st, phase } = ctx;
      const it = SL.emptyIntent();
      if (holding(b)) {
        it.charge = true;
        return it;
      }
      if (phase === 'clash') {
        if (b.playerLimits && b.playerLimits.s1 === undefined && !b.clash.active) {
          st.k = (st.k || 0) + 1;
          if (st.k < 3) it.s1 = true;
          it.s1Held = st.k < 48;
        }
        return it;
      }
      return bbFight(ctx, it);
    },
  };

  /**
   * MOVIE 2, the rest of the film: one brain for every part. Holds for a required Charge; walks to an
   * exploration goal (b.story.goal); hits a story target that is not a fighter (b.story.hitProp: the Vampa beast,
   * the rockfall); presses the button a required prompt names (God Bind, a beam); otherwise a Broly fight.
   */
  function bbFilm(ctx) {
    const { SL, b, m, p, st } = ctx;
    const it = SL.emptyIntent();
    if (holding(b)) {
      it.charge = true;
      return it;
    }
    st.n = (st.n || 0) + 1;
    // a required prompt naming a special or the ultimate: press it (and hold it a while)
    for (const pr of m.prompts.values()) {
      if (!pr.required) continue;
      const k = pr.action === 'special1' ? 's1' : pr.action === 'special2' ? 's2' : pr.action === 'ultimate' ? 'ult' : null;
      if (!k || p.state === 'stagger') continue;
      st.hold = (st.hold || 0) + 1;
      if (st.hold % 90 < 2) it[k] = true;
      it[k + 'Held'] = st.hold % 90 < 60;
      return it;
    }
    st.hold = 0;
    const S = b.story || {};
    if (S.goal) {
      p.target = null;
      const d = aim(it, p, S.goal);
      it.my = d > 1.6 ? 1 : 0;
      it.boost = d > 12;
      if (S.goal.y - p.pos.y > 1.5) it.up = true;
      else if (p.pos.y - S.goal.y > 2.5 && d < 8) it.down = true;
      return it;
    }
    const prop = S.hitProp && (typeof S.hitProp === 'function' ? S.hitProp() : S.hitProp);
    if (prop && prop.alive && !prop.invulnerable) {
      p.target = null;
      const d = aim(it, p, prop.pos);
      const dy = prop.pos.y - p.pos.y;
      it.my = d > prop.r + 1.2 ? 1 : 0;
      it.boost = d > 10;
      if (dy > 1.4) it.up = true;
      else if (dy < -1.4) it.down = true;
      if (d < prop.r + 2.2 && Math.abs(dy) < prop.r + 1.6) {
        const k = st.n % 30;
        if (k === 0 || k === 10) it.light = true;
        if (k === 20) it.heavy = true;
      }
      return it;
    }
    // a red ring on the ground (a lunge, a leap): get out of it
    if (!st.marks) {
      st.marks = [];
      b.on('telegraph', (e) => st.marks.push({ pos: e.pos, radius: e.radius, until: b.frame + e.frames + 4 }));
    }
    st.marks = st.marks.filter((mk) => mk.until > b.frame);
    for (const mk of st.marks) {
      const dx = p.pos.x - mk.pos.x, dz = p.pos.z - mk.pos.z;
      if (Math.hypot(dx, dz) < mk.radius + 1.5) {
        p.target = null;
        it.camYaw = Math.atan2(dx, dz);
        it.my = 1;
        it.boost = true;
        return it;
      }
    }
    return bbFight(ctx, it);
  }
  for (const id of ['bb_planet', 'bb_vampa', 'bb_goku', 'bb_legend', 'bb_alliance', 'bb_fusion', 'bb_gogeta', 'bb_epilogue']) BRAINS[id] = bbFilm;

  /**
   * UNIVERSE 6 (a tournament match): fight as in the film brain — but the ring is the rule: near its edge, walk back
   * toward the middle first (a ring-out is a defeat).
   */
  function u6Match(ctx) {
    const { SL, b, p } = ctx;
    const A = b.stage.arena;
    if (A && !b.inputLocked && b.rules.ringOut && Math.max(Math.abs(p.pos.x), Math.abs(p.pos.z)) > A.half - 6) {
      const it = SL.emptyIntent();
      p.target = null;
      it.camYaw = Math.atan2(-p.pos.x, -p.pos.z);
      it.my = 1;
      if (p.pos.y - A.y > 1.5) it.down = true;
      return it;
    }
    return bbFilm(ctx);
  }
  BRAINS.u6_cabba = u6Match;
  BRAINS.u6_botamo = u6Match;
  BRAINS.u6_frost_goku = u6Match;
  BRAINS.u6_frost_piccolo = u6Match;
  BRAINS.u6_frost_vegeta = u6Match;
  BRAINS.u6_magetta = u6Match;
  // Vegeta vs Hit: the match brain, plus the read — Dodge in the last moment of Hit's tell (b.u6Hit, u6_hit.js)
  BRAINS.u6_hit = (ctx) => {
    const { SL, b, p } = ctx;
    const hs = b.u6Hit, tu = SL.data.u6Hit && SL.data.u6Hit.TU;
    if (hs && tu && hs.phase === 'tell' && !b.inputLocked && b.frame - hs.f0 >= (tu.tell - tu.readWindow * 0.6) * 60 && p.state === 'free') {
      const it = SL.emptyIntent();
      it.dodge = true;
      it.mx = 1;
      return it;
    }
    return u6Match(ctx);
  };
  // Goku vs Hit: the same read, and in Kaioken a punch inside the stopped time
  BRAINS.u6_goku_hit = (ctx) => {
    const { SL, b } = ctx;
    const hs = b.u6Hit;
    if (hs && hs.phase === 'skip' && !b.inputLocked && b.frame - hs.f0 >= 8) {
      const it = SL.emptyIntent();
      it.heavy = true;
      return it;
    }
    return BRAINS.u6_hit(ctx);
  };
  // The Contract: the Hit reads, and out of the Time Cage's cube before it closes (b.hcCage), mashing Charge inside
  BRAINS.hit_contract = (ctx) => {
    const { SL, b, p } = ctx;
    const cg = b.hcCage;
    if (cg && !b.inputLocked && cg.phase === 'caught') {
      const it = SL.emptyIntent();
      it.charge = b.frame % 4 < 2;
      return it;
    }
    if (cg && !b.inputLocked && cg.phase === 'tell' && cg.at && p.state === 'free') {
      const it = SL.emptyIntent();
      it.dodge = true;
      it.mx = 1;
      return it;
    }
    return BRAINS.u6_goku_hit(ctx);
  };
  // The Future Trunks Saga: the film brawler (fights, holds, staged beats)
  BRAINS.ft_black = bbFilm;
  BRAINS.ft_rose = bbFilm;
  BRAINS.ft_hakai = bbFilm;
  BRAINS.ft_zero = bbFilm;
  BRAINS.ft_genuine = bbFilm;
  BRAINS.ft_scythe = bbFilm;
  // "Vegito" (2026-10-19): its assault has the lightning bird to break (b.story.hitProp) — the parity-safe film brawler
  BRAINS.ft_vegito = filmParity;
  BRAINS.ft_hope = bbFilm;
  BRAINS.sh_beast = bbFilm;
  // Universe Survival: the sparring match (the film brawler: fights, cues, holds)
  BRAINS.us_gohan = bbFilm;
  // "The Park Ranger": b.story.goal (the camp) and b.story.hitProp (the beam's emitter) steer the film brawler.
  // Known quirk of bbFilm (not changed here, other missions' bot runs depend on it): bbFilm and brawl both advance
  // st.n, so an early return (goal, prop, prompt, mark) flips its parity and brawl's `k === 0 / 10 / 20` never comes
  // round again — the bot stops attacking. This mission's goal and prop phases hit it: set the parity each call (the
  // prop branch reads st.n after one step and wants it even then, brawl after two).
  function filmParity(ctx) {
    const S = ctx.b.story || {};
    const prop = S.hitProp && (typeof S.hitProp === 'function' ? S.hitProp() : S.hitProp);
    const want = prop && prop.alive ? 1 : 0;
    if ((ctx.st.n || 0) % 2 !== want) ctx.st.n = (ctx.st.n || 0) + 1;
    return bbFilm(ctx);
  }
  BRAINS.us_ranger = filmParity;
  // "The Tenth Warrior": the same (its cues and struggle flip the parity too); the lock-on goes to whoever grabs the Crone
  BRAINS.us_frieza = filmParity;
  // The Tournament of Power: the film brawler (fights, cues, holds and struggles)
  BRAINS.top_jiren = bbFilm;
  BRAINS.top_saiyans = bbFilm;
  BRAINS.top_kefla = bbFilm;
  BRAINS.top_vegeta = bbFilm;
  // Vegeta vs Toppo: keep moving while a Hakai sphere drifts after you (b.hakai), and burst it with a blast
  BRAINS.top_toppo = (ctx) => {
    const { SL, b, p } = ctx;
    const hk = b.hakai;
    if (hk && hk.orbs && hk.orbs.length && !b.inputLocked && p.state === 'free') {
      const it = SL.emptyIntent();
      if (b.frame % 40 < 2) it.blast = true;
      else {
        it.mx = b.frame % 240 < 120 ? 1 : -1;
        it.boost = true;
      }
      return it;
    }
    return bbFilm(ctx);
  };
  // Mastered Ultra Instinct: the film brawler, and in the protect phase fly at each Power Impact headed for the stands (b.muiOrbs)
  BRAINS.top_mui = (ctx) => {
    const { SL, b, p } = ctx;
    const orbs = b.muiOrbs;
    if (orbs && orbs.length && !b.inputLocked && (p.state === 'free' || p.state === 'attack' || p.state === 'dash')) {
      const it = SL.emptyIntent();
      let o = orbs[0];
      for (const x of orbs) if (x.mesh.position.distanceTo(p.chest()) < o.mesh.position.distanceTo(p.chest())) o = x;
      const at = o.mesh.position, d = aim(it, p, at), dy = at.y - p.chest().y;
      p.target = null;
      it.my = 1;
      it.boost = d > 4;
      if (dy > 0.6) it.up = true;
      else if (dy < -0.6) it.down = true;
      if (p.chest().distanceTo(at) < 3) it.light = b.frame % 6 < 3;
      return it;
    }
    return bbFilm(ctx);
  };
  BRAINS.top_finale = bbFilm;
  // RESURRECTION OF F, the invasion: the film brain (brawl the nearest soldier, holds, cues)
  BRAINS.rof_invasion = bbFilm;
  BRAINS.rof_goku = bbFilm;
  BRAINS.rof_finale = bbFilm;

  /** A Broly fight: brawl — but a crashing leap is a red ring on the ice, and the bot flies out of it. */
  function bbFight(ctx, it) {
    const { b, p } = ctx;
    const br = b.story && b.story.broly;
    if (br && br.state === 'bossSlam' && br.sd && br.sd.land) {
      const dx = p.pos.x - br.sd.land.x, dz = p.pos.z - br.sd.land.z;
      if (Math.hypot(dx, dz) < 11) {
        it.camYaw = Math.atan2(dx, dz);
        p.target = null;
        it.my = 1;
        it.boost = true;
        it.up = true;
        return it;
      }
    }
    if (br && !p.target && br.alive && !br.untargetable) p.target = br;
    return brawl(ctx, it);
  }

  /** Wire a brain onto a mission battle. Returns the run log. */
  /**
   * A Dragon Ball hunt: fight whatever is close, otherwise follow the radar to the ball (break the boulder
   * on top of it, fly up to a rooftop or a spire).
   */
  function hunt(ctx) {
    const { SL, b, p, st } = ctx;
    const it = SL.emptyIntent();
    if (b.inputLocked) return it;
    const foes = b.enemiesOf(p).filter((e) => e.alive && !e.hidden && !e.untargetable && e.pos.distanceTo(p.pos) < 14);
    if (foes.length) return brawl(ctx, it);
    const item = b.mission.items.find((x) => x.kind === 'dragonball' && x.alive);
    if (!item) return it;
    const rock = (b.stage.props || []).find((pr) => pr.id === 'dbBoulder' && pr.alive);
    const goal = rock ? rock.pos : item.pos;
    p.target = null;
    const d = aim(it, p, goal);
    st.n = (st.n || 0) + 1;
    if (rock) {
      // walk up to the rock (never onto it) and hit it
      if (!p.grounded) it.down = true;
      it.my = d > 3 ? 1 : 0;
      if (d < 3.6 && st.n % 18 === 0) it.heavy = true;
      return it;
    }
    it.my = d > 1 ? 1 : 0;
    it.boost = d > 10;
    if (goal.y + 0.3 - p.pos.y > 1) it.up = true;
    else if (p.pos.y - goal.y > 2.5 && d < 6) it.down = true;
    return it;
  }
  for (let i = 1; i <= 7; i++) BRAINS['db_hunt_' + i] = hunt;

  function attach(SL, b, missionId, opts = {}) {
    const m = b.mission, p = m.player;
    const brain = BRAINS[missionId];
    if (!brain) throw new Error('no bot brain for ' + missionId);
    const st = { greedy: !!opts.greedy, style: opts.style || null, late: !!opts.late };
    const log = [];
    const phaseId = () => (m.def.phases[m.phaseIndex] ? m.def.phases[m.phaseIndex].id : null);
    // the bot always drives whichever hero is the player (party battles switch heroes)
    const bot = {
      update: (f) => {
        const ph = phaseId();
        // a rhythm (the Fusion Dance): the button on the beat, once per step
        if (b.rhythm && f === b.player) {
          const r = SL.emptyIntent();
          if (b.rhythm.next <= 0.009 && st.rhythmStep !== b.rhythm.index && !opts.offBeat) {
            st.rhythmStep = b.rhythm.index;
            r[b.rhythm.key] = true;
          }
          return r;
        }
        if (b.cue && f === b.player) {
          const cue = SL.emptyIntent();
          if (b.cue.t > 0.35) {
            cue[b.cue.key] = true;
            cue[b.cue.key + 'Held'] = true;
          }
          return cue;
        }
        if (b.inputLocked || f !== b.player) return SL.emptyIntent();
        return brain({ SL, b, m, p: f, st, phase: ph });
      },
    };
    p.controller = bot;
    // phases are logged from the mission itself (a phase can start and end between two controller ticks)
    log.push({ t: +m.time.toFixed(1), ev: 'phase', id: phaseId() });
    b.on('missionPhase', (e) => log.push({ t: +m.time.toFixed(1), ev: 'phase', id: e.phase.id }));
    b.on('playerSwitched', (e) => {
      e.to.controller = bot;
      log.push({ t: +m.time.toFixed(1), ev: 'switch', from: e.from && e.from.def.id, to: e.to.def.id });
    });
    b.on('propResisted', () => (st.resisted = true));
    for (const ev of ['cueDone', 'trunksFinisher', 'friezaMood', 'storyBlock', 'swordWard', 'objectives', 'overload', 'powerDown', 'propDestroyed', 'skillLearned', 'creatureBite', 'pickup', 'ko', 'latch', 'latchEscape', 'selfDestruct', 'allyDown', 'scatterBurst', 'poiseBreak', 'bossPhase', 'bossSlam', 'bomberWave', 'eruption', 'heroDown', 'missionFailed', 'zoneBroken', 'clashEnd', 'counterStrike', 'giantGrab', 'grabEscape', 'teamAttack', 'deflectedBlast', 'mineTriggered', 'moonDestroyed', 'grown', 'tailGrab', 'tailCounter', 'telekinesis', 'senzu', 'fellOff', 'roadMarker', 'snakeWayRun', 'bossAttention']) {
      b.on(ev, (e) => {
        if (ev === 'objectives' && !e.changed) return;
        const row = { t: +m.time.toFixed(1), ev };
        if (ev === 'objectives') Object.assign(row, { id: e.changed.id, count: e.changed.count, done: e.changed.done, failed: e.changed.failed });
        if (ev === 'skillLearned') row.key = e.key;
        if (e && e.fighter && e.fighter.def) row.who = e.fighter.def.id;
        if (e && e.victim && e.victim.def) row.victim = e.victim.def.id;
        if (e && e.zone) row.zone = e.zone.id;
        if (e && e.winner && e.winner.def) row.winner = e.winner.def.id;
        log.push(row);
      });
    }
    return { log, st, phaseId };
  }

  const api = { BRAINS, attach, skills: { brawl, bossReader } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MissionBrains = api;
})(typeof window !== 'undefined' ? window : this);
