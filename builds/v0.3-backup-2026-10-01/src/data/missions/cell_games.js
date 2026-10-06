/*
 * CHAPTER 6 — CELL SAGA (fourth mission)
 * Mission "The Cell Games" (canon, played as Goku, then as Gohan).
 *
 * Built as interactive anime: STORY SCENE → PLAYABLE STRETCH → CINEMATIC BEAT →
 * PLAYABLE STRETCH … Every cinematic sits between two stretches of gameplay and is
 * entered from the state of the fight (damage dealt or taken, hits landed, a beam
 * answered, allies beaten, the Juniors destroyed) — never from a clock.
 *
 * Phases (checkpoints marked *):
 *   ring         scene games_open: the arena, the broadcast, the arrivals, Goku steps up
 *   goku*        STAGE 1 — testing each other: on the ground, no beams, both reading the other
 *   measures     scene cell_measures
 *   serious*     STAGE 2 — serious: flight, beams and patterns, the ring starts to break
 *   blitz        scene cell_blitz: the fight leaves the ground
 *   speed*       STAGE 3 — high-speed exchange in the air (aerial hits are what count)
 *   pressure     scene cell_pressure: Goku exhausted, Cell untouched
 *   limit*       STAGE 4 — maximum escalation: Cell climbs and charges a Kamehameha at the
 *                planet; the player answers it (beam clash, a Kamehameha into the charge,
 *                or Instant Transmission and an Instant Kamehameha)
 *   regrow       scene cell_regrows: it lands, and he grows the missing half back
 *   forfeit      scene goku_forfeits: "I give up", the Senzu Bean, Gohan sent in
 *   gohan*       Gohan, base form: Cell tests him
 *   powers       the Super Saiyan transformation (shared transformation cinematic)
 *   refuses      scene gohan_refuses
 *   hold*        Super Saiyan Gohan holding back while Cell escalates
 *   strike16     scene sixteen_strikes: the crush, 16's failed self-destruct, 16 broken
 *   born         scene juniors_born
 *   juniors*     the Cell Juniors against the Z Fighters (squad AI; Gohan still holding back)
 *   sixteen      scene sixteen_speaks: 16's last words, the silence, tears, the red line, the scream
 *   ascend       the Super Saiyan 2 transformation, then scene ssj2_reveal
 *   purge*       "The Difference in Power": Super Saiyan 2 Gohan tears through the Juniors
 *                (hack-and-slash power reveal, src/data/missions/cell_purge.js)
 *   rage*        Super Saiyan 2 Gohan against Perfect Cell (Cell's AI adapts to him)
 *   spit         scene cell_spits: the gut punch, 18 comes out, the perfect form goes
 *   desperate*   Semi-Perfect Cell, falling apart
 *   sacrifice    scene goku_sacrifice
 *   returns      scene cell_returns: Trunks, Vegeta, Gohan's arm
 *   beam*        the Father-Son Kamehameha, played: charge, clash, Goku's voice, Vegeta's
 *                blast, the final push; Cell dies to the beam that connects
 *   ends         scene cell_ends: the payoff and the silence
 *   after        scene gohan_after, and the chapter card
 *
 * Canon simplifications (documented in STATUS.md): Mr. Satan's match and the other
 * Z Fighters' turns are not staged; Android 16 is broken but whole (the engine has
 * no dismemberment); Gohan begins the fight in base form at the owner's direction
 * (in canon he arrives already a Super Saiyan); Cell's "super perfect" return is
 * the perfect form with a sparking aura.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const GOKU_TEST = { dealt: 0.12, taken: 0.35 }; // stage 1 ends when either side has proven something
  const SERIOUS_HP = 0.65; // stage 2 ends when he is pushed below this (he regenerates, so it takes pressure)
  const AERIAL_HITS = 8; // stage 3: hits landed while both are in the air
  const JUNIORS = 7;
  const ALLIES_BEATEN = 4;

  /* ------------------------------------------------------------ staging helpers */

  const scripted = () => ({ update: () => SL.emptyIntent() });
  const CG = (SL.data.cellGames = {
    /** Where everybody watches from: the flat below the ring, on the steps side. */
    SPOTS: {
      piccolo: new V3(-9, 0, 24),
      vegeta: new V3(-4.5, 0, 26),
      trunks: new V3(-1, 0, 27),
      krillin: new V3(3.5, 0, 25),
      tien: new V3(8, 0, 24.5),
      goku: new V3(12, 0, 23),
      a16: new V3(-13, 0, 21),
    },
    GOHAN_SPOT: new V3(6, 0, 22.5),

    ground(b, v, lift = 0) {
      const p = v.clone();
      p.y = b.stage.heightAt(p.x, p.z) + lift;
      return p;
    },
    /** A point on the paving (the ring top is lifted analytically by the stage). */
    onRing(b, x, z) {
      return new V3(x, b.stage.heightAt(x, z), z);
    },
    place(f, pos, yaw) {
      if (!f) return;
      f.setPosition(pos);
      if (yaw !== undefined) f.yaw = yaw;
      f.prevYaw = f.yaw;
      f.vel.set(0, 0, 0);
      f.fallVel = 0;
      f.grounded = true;
    },
    placeAir(f, pos, yaw) {
      if (!f) return;
      CG.place(f, pos, yaw);
      f.grounded = false;
    },
    faceTo(f, pos) {
      f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
    },
    /** A bystander: placed, posed, out of the fight. */
    watch(f, pos, pose, face) {
      if (!f) return;
      CG.place(f, pos);
      CG.faceTo(f, new V3(0, pos.y, 0));
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      const down = /knockdown/.test(pose || '');
      f.setState('scripted', { pose: pose || 'idle', expression: face || 'calm', aura: down ? 0 : undefined });
    },
    /** The Z Fighters at the ring's edge; names in `except` are left alone. */
    spectate(b, S, except = []) {
      const poses = { piccolo: 'armsCrossed', vegeta: 'armsCrossed', trunks: 'idle', krillin: 'idle', tien: 'armsCrossed', goku: 'idle' };
      for (const name of Object.keys(poses)) {
        if (except.includes(name)) continue;
        const f = S[name];
        if (!f || !f.alive) continue;
        f.setHidden(false);
        CG.watch(f, CG.ground(b, CG.SPOTS[name]), poses[name], 'calm');
      }
    },
    hideHeroes(m) {
      const S = m.battle.story;
      for (const k of ['goku', 'gohan', 'piccolo', 'vegeta', 'trunks', 'krillin', 'tien']) if (S[k]) S[k].setHidden(true);
    },
    /** Seven Cell Juniors, created once and reused by every phase that needs them. */
    ensureJuniors(m) {
      const b = m.battle, S = b.story;
      if (S.juniors && S.juniors.length) return S.juniors;
      S.juniors = [];
      for (let i = 0; i < JUNIORS; i++) {
        const a = (i / JUNIORS) * Math.PI * 2;
        const j = m.spawn({ charId: 'cell_junior', team: 1, pos: CG.onRing(b, Math.cos(a) * 4, -4 + Math.sin(a) * 4), warp: false, tag: 'junior', startKi: 70 });
        j.controller = scripted();
        j.setHidden(true);
        j.untargetable = true;
        S.juniors.push(j);
      }
      return S.juniors;
    },
    /** Cell inflating before the self-destruct (and back to normal when `to` is 1). */
    swell(m, f, to, seconds) {
      if (!f || !f.model) return;
      const base = f.model.baseScale * (f.form && f.form.look && f.form.look.scale ? f.form.look.scale : 1);
      if (!seconds) {
        f.model.root.scale.setScalar(base * to);
        return;
      }
      const from = f.model.root.scale.x;
      let t = 0;
      const hook = () => {
        t = Math.min(1, t + 1 / 60 / seconds);
        f.model.root.scale.setScalar(U.lerp(from, base * to, t));
        if (t >= 1) {
          const i = m.tickHooks.indexOf(hook);
          if (i >= 0) m.tickHooks.splice(i, 1);
        }
      };
      m.tickHooks.push(hook);
    },
    /** The returned Cell: the perfect form with electricity running over it. */
    superAura(f) {
      const a = f.form.aura || {};
      f.aura.setStyle(Object.assign({}, a, { sparks: 0xdff6ff, lightning: true, sharp: 0.5 }));
      f.aura.target = 0.55;
      f.superPerfect = true;
    },

    /**
     * Goku from beyond, at his son's back in the last stand. It is the Goku fighter shown as
     * a spirit — translucent, a halo, a soft aura, mirroring the Kamehameha — and it is
     * intangible, untargetable, benched and has no brain: seen, never a combatant.
     * `level` is how present he is (0..1).
     */
    spirit(b, on, level = 0.5) {
      const S = b.story, g = S.goku;
      if (!g || !S.gohan) return null;
      if (on) {
        g.alive = true;
        g.intangible = true;
        g.untargetable = true;
        g.cannotDie = true;
        g.benched = true;
        g.controller = scripted();
        g.setHidden(false);
        g.model.setSpirit(true);
        g.model.setSpiritLevel(level);
        if (!S.halo) S.halo = SL.Cinema.halo(b, g);
        CG.spiritFollow(b);
        g.setState('scripted', { pose: 'g_kameFire', expression: 'calm', aura: 0.3 });
        S.spiritLevel = level;
        S.spiritOn = true;
      } else if (S.spiritOn) {
        g.model.setSpirit(false);
        g.setHidden(true);
        g.alive = false;
        g.intangible = false;
        S.spiritOn = false;
      }
      return g;
    },

    /** Keeps the spirit at his son's back: behind him and off his right shoulder, facing the same way. */
    spiritFollow(b) {
      const S = b.story, g = S.goku, gh = S.gohan;
      if (!S.spiritOn && !g.intangible) return;
      const fwd = new V3(Math.sin(gh.yaw), 0, Math.cos(gh.yaw));
      const right = new V3(-fwd.z, 0, fwd.x);
      g.setPosition(gh.pos.clone().addScaledVector(fwd, -1.1).addScaledVector(right, 0.5).add(new V3(0, 0.25, 0)));
      g.grounded = false;
      g.vel.set(0, 0, 0);
      g.yaw = g.prevYaw = gh.yaw;
    },
  });

  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** Every playable stretch starts from a clean slate: no leftover muls, states, limits or brains. */
  function prep(m) {
    const b = m.battle;
    m.lock(true);
    m.clearObjectives();
    m.limits(null);
    clearCombat(b);
    b.clash.maxSeconds = 7;
    for (const f of b.fighters) {
      f.damageDealtMul = 1;
      f.damageTakenMul = 1;
      f.specOverrides = null;
      f.storyArmor = 0;
      f.storyEvade = null;
    }
    // Gohan's ultimate slot is the Father-Son Kamehameha, and that technique does not exist until his father is
    // gone: before the last stand the slot holds his own full-power Kamehameha instead, so he keeps the tool
    // without the story firing a beam it has not earned. The beam phase puts the real one back.
    const gh = b.story && b.story.gohan;
    if (gh) gh.specOverrides = { ultimate: { id: 'tgFullKame', name: 'Full-Power Kamehameha', cinematic: false } };
  }

  function removeHook(m, hook) {
    const i = m.tickHooks.indexOf(hook);
    if (i >= 0) m.tickHooks.splice(i, 1);
  }

  function formIndex(f, id) {
    return f.def.forms.findIndex((x) => x.id === id);
  }
  function toForm(f, id) {
    const i = formIndex(f, id);
    if (i >= 0 && f.formIndex !== i) f.applyForm(i);
  }

  /** Cell as the boss this stretch needs: a fresh brain every time, never a stale one. */
  function cellBrain(b, c, profile, difficulty = 'hard') {
    c.controller = new SL.AIController(b, { difficulty, profile });
    return c.controller;
  }

  /** Hand the player a hero (always re-attach: scene phases give everybody a scripted brain). */
  function takeControl(b, f) {
    const from = b.player;
    const watching = from && from !== f && from.untargetable;
    f.setHidden(false);
    f.untargetable = false;
    b.switchPlayer(f, { force: true });
    // handing the player to somebody else gives the previous hero an ally brain; a
    // hero who was already watching from the edge (Goku, from a checkpoint) keeps watching
    if (watching) from.controller = scripted();
    f.setState('free');
  }

  function goFight(m, music) {
    const b = m.battle;
    m.lock(false);
    b.aiLocked = false;
    if (music) m.music(music[0], music[1]);
  }

  /* ------------------------------------------------------------ setup */

  function setup(battle) {
    const b = battle;
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x, o.z) < 44 + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: CG.onRing(b, 0, 7), startKi: 100 });
    S.goku.lockedForms = {};
    toForm(S.goku, 'ssj');
    S.goku.cannotDie = true;
    S.gohan = b.spawn({ charId: 'teen_gohan', team: 0, pos: CG.ground(b, CG.GOHAN_SPOT), startKi: 90 });
    S.gohan.lockedForms = { ssj2: true }; // the story opens it, and only the story
    S.gohan.cannotDie = true;
    for (const [name, charId] of [['piccolo', 'piccolo'], ['vegeta', 'vegeta'], ['trunks', 'future_trunks'], ['krillin', 'krillin'], ['tien', 'tien']]) {
      const f = b.spawn({ charId, team: 0, pos: CG.ground(b, CG.SPOTS[name]), startKi: 80 });
      S[name] = f;
      if (name === 'vegeta' || name === 'trunks') toForm(f, 'ssj');
    }
    S.a16 = b.spawn({ charId: 'android_16', team: 0, pos: CG.ground(b, CG.SPOTS.a16), startKi: 60 });
    S.a18 = b.spawn({ charId: 'android_18', team: 0, pos: CG.ground(b, new V3(-14, 0, 30)), startKi: 60 });
    S.a18.setHidden(true);
    S.cell = b.spawn({ charId: 'cell', team: 1, pos: CG.onRing(b, 0, -7), startKi: 150, tags: { boss: true, priority: true } });
    toForm(S.cell, 'perfect');
    S.cell.cannotDie = true;
    S.juniors = [];
    for (const f of [S.gohan, S.piccolo, S.vegeta, S.trunks, S.krillin, S.tien, S.a16, S.a18, S.cell]) {
      f.controller = scripted();
      f.cannotDie = true;
    }
    for (const f of [S.gohan, S.piccolo, S.vegeta, S.trunks, S.krillin, S.tien, S.a16, S.a18]) f.untargetable = true;
    S.goku.untargetable = false;
  }

  /** Re-applies the world a checkpoint expects (who has fallen, who is gone, who is torn). */
  function restoreStory(m, phaseId) {
    const b = m.battle, S = b.story;
    const order = m.def.phases.map((p) => p.id);
    const at = order.indexOf(phaseId);
    const past = (id) => order.indexOf(id) < at;
    CG.swell(m, S.cell, 1, 0);
    // Android 16: in the ring, broken, from the strike on; gone after his death
    if (past('strike16') && !past('sixteen')) {
      CG.watch(S.a16, CG.onRing(b, -9, -9), 'knockdown', 'ko');
      S.a16.setTorn(true);
    } else if (past('sixteen')) {
      S.a16.setHidden(true);
      S.a16.untargetable = true;
      S.a16.alive = false;
    } else {
      CG.watch(S.a16, CG.ground(b, CG.SPOTS.a16), 'armsCrossed', 'calm');
    }
    // Android 18 is only there after Cell loses her
    if (past('spit')) CG.watch(S.a18, CG.onRing(b, -5, -6), 'knockdown', 'ko');
    else S.a18.setHidden(true);
    // Goku: in the ring until the forfeit, watching until the sacrifice, gone after it
    if (past('sacrifice')) {
      S.goku.setHidden(true);
      S.goku.untargetable = true;
      S.goku.alive = false;
    }
    // Gohan's state: rage from 16's death, the torn gi from Cell's return
    if (past('sixteen')) S.gohan.setRage(true, 1);
    // the purge leaves his gi heavily damaged (set before the torn gi: setDamage decides the tear too)
    if (past('purge')) S.gohan.setDamage(2);
    if (past('returns')) S.gohan.setTorn(true);
    // Trunks and Vegeta after Cell's return
    if (past('returns')) {
      CG.watch(S.trunks, CG.ground(b, CG.SPOTS.trunks), 'knockdown', 'ko');
      CG.watch(S.vegeta, CG.ground(b, CG.SPOTS.vegeta), 'knockdown', 'ko');
    }
    if (past('returns')) CG.superAura(S.cell);
    // Everybody who is not the hero of the stretch is out of it. A checkpoint builds a
    // fresh battle in which the Z Fighters are ordinary allies with AI brains; without
    // this, restarting after the Juniors put Goku (and the others) back into Gohan's
    // fight. The Juniors stretch is the one place allies are meant to fight.
    if (at > order.indexOf('juniors')) {
      const down = phaseId === 'purge'; // the Juniors have just beaten them
      for (const name of ['piccolo', 'krillin', 'tien', 'vegeta', 'trunks']) {
        const f = S[name];
        if (!f || !f.alive) continue;
        if (past('returns') && (name === 'trunks' || name === 'vegeta')) continue; // staged above
        CG.watch(f, CG.ground(b, CG.SPOTS[name]), down ? 'knockdown' : name === 'krillin' || name === 'trunks' ? 'idle' : 'armsCrossed', down ? 'ko' : 'hurt');
      }
      if (!past('sacrifice') && S.goku.alive) CG.watch(S.goku, CG.ground(b, CG.SPOTS.goku), 'idle', 'calm');
    }
  }

  const P = {};

  /* ------------------------------------------------------------ the opening */

  P.ring = {
    id: 'ring',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of b.fighters) f.controller = scripted();
      yield* SL.Cinema.play(m, 'games_open');
    },
  };

  /* ------------------------------------------------------------ Goku vs Cell */

  /** STAGE 1 — testing each other: grounded, no beams, and both of them reading. */
  P.goku = {
    id: 'goku',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, c = S.cell;
      prep(m);
      restoreStory(m, 'goku');
      CG.spectate(b, S, ['goku']);
      CG.watch(S.gohan, CG.ground(b, CG.GOHAN_SPOT), 'tg_scared', 'hurt');
      takeControl(b, g);
      toForm(g, 'ssj');
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      g.cannotDie = true;
      g.damageDealtMul = 1.3;
      g.damageTakenMul = 0.6;
      g.noFlight = true;
      CG.place(g, CG.onRing(b, 0, 7), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      toForm(c, 'perfect');
      CG.place(c, CG.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.cannotDie = true;
      c.infiniteHp = false;
      c.noRegen = false;
      c.noFlight = true;
      c.damageDealtMul = 0.15; // he is measuring, not trying to end it
      // restrained: close range, no beams, a lot of guarding
      cellBrain(b, c, { personality: 'adaptive', aggression: 0.45, defense: 0.7, ranged: 0.08, beam: 0, preferredRange: 2.4, hooks: null });
      c.target = g;
      g.target = c;
      c.setState('free');
      m.limits({ up: false, upPressed: false });
      goFight(m, ['finale', 3]);
      m.objective('test', 'Test each other', { icon: 'fist', target: 100 });
      m.objective('read', 'Land a Perfect Guard', { icon: 'guard', optional: true });
      m.prompt('cgGuard', 'guard', 'Guard', { when: () => c.state === 'attack' && g.distTo(c) < 4 });
      let dealt = 0, taken = 0;
      const offD = b.on('damage', (e) => {
        if (e.blocked) return;
        if (e.target === c && e.attacker === g) dealt += e.amount;
        if (e.target === g && e.attacker === c) taken += e.amount;
      });
      const offP = b.on('perfectGuard', (e) => {
        if (e.fighter === g) m.complete('read');
      });
      const hook = () => {
        const k = Math.max(dealt / (c.hpMax * GOKU_TEST.dealt), taken / (g.hpMax * GOKU_TEST.taken));
        m.progress('test', Math.min(100, Math.floor(k * 100)));
      };
      m.tickHooks.push(hook);
      yield () => dealt >= c.hpMax * GOKU_TEST.dealt || taken >= g.hpMax * GOKU_TEST.taken;
      removeHook(m, hook);
      if (offD) offD();
      if (offP) offP();
      m.complete('test');
      m.failObjective('read');
      m.limits(null);
      g.noFlight = false;
      c.noFlight = false;
      m.flags.stage1 = { dealt: Math.round(dealt), taken: Math.round(taken) };
      m.flags.stage = 1;
      yield 0.4;
    },
  };

  P.measures = {
    id: 'measures',
    run: function* (m) {
      const b = m.battle;
      clearCombat(b);
      b.story.goku.controller = scripted();
      b.story.cell.controller = scripted();
      yield* SL.Cinema.play(m, 'cell_measures');
    },
  };

  /** STAGE 2 — serious: flight, beams and patterns; the ring starts to break. */
  P.serious = {
    id: 'serious',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, c = S.cell;
      prep(m);
      restoreStory(m, 'serious');
      CG.spectate(b, S, ['goku']);
      CG.watch(S.gohan, CG.ground(b, CG.GOHAN_SPOT), 'tg_scared', 'hurt');
      takeControl(b, g);
      toForm(g, 'ssj');
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.8));
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true;
      g.damageDealtMul = 1.3;
      g.damageTakenMul = 0.6;
      g.noFlight = false;
      CG.place(g, CG.onRing(b, 0, 7), Math.PI);
      toForm(c, 'perfect');
      CG.place(c, CG.onRing(b, 0, -7), 0);
      c.hp = Math.max(c.hp, Math.round(c.hpMax * 0.9));
      c.cannotDie = true;
      c.noRegen = false;
      c.noFlight = false;
      c.damageDealtMul = 0.3;
      cellBrain(b, c, { aggression: 0.75, defense: 0.5, ranged: 0.45, beam: 0.4, preferredRange: 3.5, hooks: 'boss' });
      c.target = g;
      g.target = c;
      c.setState('free');
      goFight(m, ['finale', 5]);
      m.objective('push', 'Push him back', { icon: 'fist', target: 100 });
      m.objective('pressure', 'Never let him regenerate to full', { icon: 'guard', optional: true });
      let regenFull = false;
      const start = c.hp;
      const hook = () => {
        const need = start - c.hpMax * SERIOUS_HP;
        const done = need <= 0 ? 1 : U.clamp01((start - c.hp) / need);
        m.progress('push', Math.floor(done * 100));
        if (c.hp >= c.hpMax && start - c.hp < 0 && !regenFull) regenFull = true;
      };
      m.tickHooks.push(hook);
      yield () => c.hpFrac <= SERIOUS_HP || g.hpFrac <= 0.3;
      removeHook(m, hook);
      m.complete('push');
      if (!regenFull) m.complete('pressure');
      else m.failObjective('pressure');
      m.flags.stage = 2;
      m.flags.ringDamageAfterStage2 = b.stage.ringDamage || 0;
      yield 0.4;
    },
  };

  P.blitz = {
    id: 'blitz',
    run: function* (m) {
      const b = m.battle;
      clearCombat(b);
      b.story.goku.controller = scripted();
      b.story.cell.controller = scripted();
      yield* SL.Cinema.play(m, 'cell_blitz');
    },
  };

  /** STAGE 3 — the high-speed exchange: in the air, where only aerial hits count. */
  P.speed = {
    id: 'speed',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, c = S.cell;
      prep(m);
      restoreStory(m, 'speed');
      CG.spectate(b, S, ['goku']);
      CG.watch(S.gohan, CG.ground(b, CG.GOHAN_SPOT), 'tg_scared', 'hurt');
      takeControl(b, g);
      toForm(g, 'ssj');
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.65));
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true;
      g.damageDealtMul = 1.3;
      g.damageTakenMul = 0.6;
      CG.placeAir(g, CG.onRing(b, 0, 6).add(new V3(0, 11, 0)), Math.PI);
      toForm(c, 'perfect');
      CG.placeAir(c, CG.onRing(b, 0, -6).add(new V3(0, 11, 0)), 0);
      c.hp = Math.max(c.hp, Math.round(c.hpMax * 0.75));
      c.cannotDie = true;
      c.noRegen = false;
      c.damageDealtMul = 0.3;
      cellBrain(b, c, { aggression: 0.85, defense: 0.72, ranged: 0.3, beam: 0.25, preferredRange: 3, hooks: 'boss' });
      c.target = g;
      g.target = c;
      c.setState('free');
      goFight(m, ['finale', 6]);
      m.objective('air', 'Win the exchange in the air', { icon: 'fist', target: AERIAL_HITS });
      let hits = 0;
      const air = (f) => !f.grounded && f.pos.y - b.stage.heightAt(f.pos.x, f.pos.z) > 1.2;
      const off = b.on('damage', (e) => {
        if (e.blocked || e.target !== c || e.attacker !== g) return;
        if (air(g) && air(c)) {
          hits++;
          m.progress('air', Math.min(AERIAL_HITS, hits));
        }
      });
      m.prompt('cgFly', 'ascend', 'Fly Up', { when: () => g.grounded && air(c) });
      yield () => hits >= AERIAL_HITS || g.hpFrac <= 0.25;
      if (off) off();
      m.complete('air');
      m.flags.aerialHits = hits;
      m.flags.stage = 3;
      yield 0.4;
    },
  };

  P.pressure = {
    id: 'pressure',
    run: function* (m) {
      const b = m.battle;
      clearCombat(b);
      const S = b.story;
      S.goku.controller = scripted();
      S.cell.controller = scripted();
      CG.place(S.goku, CG.onRing(b, 0, 7), Math.PI);
      CG.place(S.cell, CG.onRing(b, 0, -7), 0);
      yield* SL.Cinema.play(m, 'cell_pressure');
    },
  };

  /**
   * STAGE 4 — maximum escalation. Cell climbs over the ring and charges a
   * Kamehameha at the planet. The player has to answer it: fire into the charge,
   * meet the beam and win the clash, or Instant Transmission in front of him and
   * an Instant Kamehameha. If his beam lands instead, he takes the hit, and Cell
   * charges again: this stretch cannot be lost, only answered.
   */
  P.limit = {
    id: 'limit',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, c = S.cell;
      prep(m);
      restoreStory(m, 'limit');
      CG.spectate(b, S, ['goku']);
      CG.watch(S.gohan, CG.ground(b, CG.GOHAN_SPOT), 'tg_scared', 'hurt');
      takeControl(b, g);
      toForm(g, 'ssj');
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.55));
      g.ki = g.kiMax;
      g.cannotDie = true;
      g.damageDealtMul = 1.5;
      g.damageTakenMul = 0.5;
      CG.place(g, CG.onRing(b, 0, 8), Math.PI);
      toForm(c, 'perfect');
      CG.placeAir(c, CG.onRing(b, 0, -10).add(new V3(0, 6, 0)), 0);
      c.hp = Math.max(c.hp, Math.round(c.hpMax * 0.8));
      c.cannotDie = true;
      c.noRegen = false;
      c.ki = c.kiMax;
      // a Kamehameha that takes long enough to see coming, and long enough to answer
      c.specOverrides = { special1: { chargeMin: 230, chargeMax: 230, name: 'Kamehameha' } };
      const st = { cooldown: 60, tries: 0, charging: false };
      c.controller = {
        update() {
          const it = SL.emptyIntent();
          if (b.inputLocked || b.aiLocked) return it;
          c.target = g;
          if (c.state === 'beamCharge') {
            it.s1Held = true;
            return it;
          }
          if (c.state !== 'free') return it;
          const alt = c.pos.y - b.stage.heightAt(c.pos.x, c.pos.z);
          if (alt < 15) {
            it.up = true;
            return it;
          }
          if (st.cooldown > 0) {
            st.cooldown--;
            return it;
          }
          c.ki = c.kiMax; // he has the energy for this; the question is whether it lands
          st.tries++;
          st.cooldown = 110;
          it.s1 = true;
          it.s1Held = true;
          return it;
        },
      };
      c.target = g;
      g.target = c;
      c.setState('free');
      goFight(m, ['finale', 6]);
      m.objective('answer', 'Answer his Kamehameha', { icon: 'beam', target: 1 });
      m.prompt('cgAnswer', 'special1', 'Kamehameha', { required: true, when: () => c.state === 'beamCharge' || c.state === 'beamFire', always: true });
      m.prompt('cgInstant', 'special2', 'Instant Transmission', { when: () => c.state === 'beamCharge' && g.distTo(c) > 12 });
      let answered = false, via = null, landed = 0, warned = false;
      const offD = b.on('damage', (e) => {
        if (e.blocked) return;
        if (e.target === c && e.attacker === g && e.type === 'beam') {
          answered = true;
          via = via || (c.state === 'beamCharge' ? 'interrupt' : 'beam');
        }
        if (e.target === g && e.attacker === c && e.type === 'beam') landed++;
      });
      const offC = b.on('clashEnd', (e) => {
        if (e.winner === g) via = 'clash';
      });
      const hook = () => {
        if (!warned && c.state === 'beamCharge') {
          warned = true;
          m.say('krillin', 'He is not aiming at Goku — he is aiming at the planet!', 3, { style: 'shout' });
          m.music(null, 7);
        }
      };
      m.tickHooks.push(hook);
      yield () => answered;
      removeHook(m, hook);
      if (offD) offD();
      if (offC) offC();
      m.complete('answer');
      m.flags.answeredVia = via;
      m.flags.cellBeamLanded = landed;
      m.flags.stage = 4;
      yield 1;
    },
  };

  P.regrow = {
    id: 'regrow',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      S.goku.controller = scripted();
      S.cell.controller = scripted();
      S.cell.specOverrides = null;
      yield* SL.Cinema.play(m, 'cell_regrows');
    },
  };

  P.forfeit = {
    id: 'forfeit',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.goku, S.gohan, S.cell]) f.controller = scripted();
      CG.place(S.goku, CG.onRing(b, 0, 7), Math.PI);
      CG.place(S.cell, CG.onRing(b, 0, -7), 0);
      yield* SL.Cinema.play(m, 'goku_forfeits');
    },
  };

  /* ------------------------------------------------------------ Gohan */

  /** Gohan in base form, and Cell finding out how much is there. */
  P.gohan = {
    id: 'gohan',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      prep(m);
      restoreStory(m, 'gohan');
      CG.spectate(b, S, []);
      takeControl(b, gh);
      S.goku.untargetable = true;
      gh.lockedForms = { ssj2: true };
      toForm(gh, 'base');
      gh.hp = gh.hpMax;
      gh.ki = Math.max(gh.ki, 80);
      gh.cannotDie = true;
      gh.damageDealtMul = 0.55;
      gh.damageTakenMul = 0.75;
      CG.place(gh, CG.onRing(b, 0, 7), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      toForm(c, 'perfect');
      CG.place(c, CG.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.cannotDie = true;
      c.infiniteHp = true; // he is testing, not fighting
      c.noRegen = false;
      c.damageDealtMul = 0.2;
      cellBrain(b, c, { aggression: 0.55, defense: 0.6, ranged: 0.3, beam: 0.2, preferredRange: 3, hooks: 'boss' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      goFight(m, ['battle', 4]);
      m.objective('hold', 'Hold your own', { icon: 'fist', target: 100 });
      let hits = 0, taken = 0;
      const off = b.on('damage', (e) => {
        if (e.blocked) return;
        if (e.target === c && e.attacker === gh) hits++;
        if (e.target === gh && e.attacker === c) taken += e.amount;
      });
      const hook = () => m.progress('hold', Math.min(100, Math.floor(Math.max(hits / 6, taken / (gh.hpMax * 0.35)) * 100)));
      m.tickHooks.push(hook);
      yield () => hits >= 6 || gh.hpFrac <= 0.65;
      removeHook(m, hook);
      if (off) off();
      m.complete('hold');
      m.flags.gohanBaseHits = hits;
      yield 0.4;
    },
  };

  /** Pushed far enough, he stops pretending to be only a boy: Super Saiyan, staged. */
  P.powers = {
    id: 'powers',
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan;
      clearCombat(b);
      for (const f of [gh, S.cell]) f.controller = scripted();
      CG.faceTo(gh, S.cell.pos);
      CG.faceTo(S.cell, gh.pos);
      const ssj = formIndex(gh, 'ssj');
      if (gh.formIndex !== ssj) {
        yield* SL.data.cinematics.transform(m, { fighter: gh, formIndex: ssj, witness: S.cell, line: 'gohan_ssj', music: 4 });
      }
      m.flags.gohanSsj = gh.form.id === 'ssj';
    },
  };

  P.refuses = {
    id: 'refuses',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.gohan, S.cell]) f.controller = scripted();
      yield* SL.Cinema.play(m, 'gohan_refuses');
    },
  };

  /** Super Saiyan, still holding back, while Cell stops being patient. */
  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      prep(m);
      restoreStory(m, 'hold');
      CG.spectate(b, S, []);
      takeControl(b, gh);
      gh.lockedForms = { ssj2: true };
      toForm(gh, 'ssj');
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.85));
      gh.ki = Math.max(gh.ki, 80);
      gh.cannotDie = true;
      // he is stronger than everybody here and refuses to use it
      gh.damageDealtMul = 0.45;
      gh.damageTakenMul = 0.8;
      CG.place(gh, CG.onRing(b, 0, 7), Math.PI);
      toForm(c, 'perfect');
      CG.place(c, CG.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.cannotDie = true;
      c.infiniteHp = true; // nothing a held-back Gohan does here matters
      c.damageDealtMul = 0.25;
      cellBrain(b, c, { aggression: 0.9, defense: 0.4, ranged: 0.4, beam: 0.35, preferredRange: 3, hooks: 'boss' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      goFight(m, ['battle', 5]);
      m.objective('endure', 'He wants you angry. Endure it', { icon: 'guard', target: 100 });
      m.objective('answer', 'Hit back at least five times', { icon: 'fist', optional: true, target: 5 });
      let hits = 0;
      const start = gh.hp;
      const off = b.on('damage', (e) => {
        if (e.target === c && e.attacker === gh && !e.blocked) {
          hits++;
          m.progress('answer', Math.min(5, hits));
        }
      });
      const hook = () => {
        const need = start - gh.hpMax * 0.4;
        m.progress('endure', Math.min(100, Math.floor(Math.max(need <= 0 ? 1 : (start - gh.hp) / need, hits / 8) * 100)));
      };
      m.tickHooks.push(hook);
      yield () => gh.hpFrac <= 0.4 || hits >= 8;
      removeHook(m, hook);
      if (off) off();
      m.complete('endure');
      if (hits >= 5) m.complete('answer');
      else m.failObjective('answer');
      m.flags.gohanHits = hits;
      m.flags.gohanHeld = true;
      yield 0.4;
    },
  };

  P.strike16 = {
    id: 'strike16',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.gohan, S.cell, S.a16]) f.controller = scripted();
      S.cell.infiniteHp = false;
      yield* SL.Cinema.play(m, 'sixteen_strikes');
    },
  };

  P.born = {
    id: 'born',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.gohan, S.cell]) f.controller = scripted();
      yield* SL.Cinema.play(m, 'juniors_born');
    },
  };

  /**
   * The Juniors against the Z Fighters. Gohan is still holding back and the
   * Juniors cannot be killed yet; the squad AI keeps at most two of them on him and
   * sends the rest at his friends. The stretch ends when his friends are beaten,
   * or when he is.
   */
  P.juniors = {
    id: 'juniors',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      prep(m);
      restoreStory(m, 'juniors');
      b.rules.pressure = { melee: 2, ranged: 1, gap: 80, grace: 150 };
      takeControl(b, gh);
      gh.lockedForms = { ssj2: true };
      toForm(gh, 'ssj');
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.7));
      gh.cannotDie = true;
      gh.damageDealtMul = 0.6;
      gh.damageTakenMul = 0.6;
      CG.place(gh, CG.ground(b, new V3(0, 0, 20)), Math.PI);
      // Cell watches from the ring
      CG.watch(c, CG.onRing(b, 0, -8), 'cl_calm', 'smirk');
      c.infiniteHp = false;
      // the Z Fighters, fighting for real
      const allies = [S.piccolo, S.vegeta, S.trunks, S.krillin, S.tien, S.goku].filter((f) => f && f.alive);
      allies.forEach((f, i) => {
        f.setHidden(false);
        const spot = f === S.goku ? CG.SPOTS.goku : CG.SPOTS[Object.keys(S).find((k) => S[k] === f)];
        CG.place(f, CG.ground(b, spot));
        f.untargetable = false;
        f.cannotDie = true;
        f.hp = Math.round(f.hpMax * 0.9);
        f.damageDealtMul = 0.4;
        f.damageTakenMul = 1.2;
        f.beaten = false;
        f.controller = new SL.AIController(b, { difficulty: 'normal' });
        f.setState('free');
      });
      const juniors = CG.ensureJuniors(m);
      juniors.forEach((j, i) => {
        const a = (i / juniors.length) * Math.PI * 2;
        j.setHidden(false);
        j.untargetable = false;
        j.cannotDie = true; // not while Gohan is still holding back
        j.hp = j.hpMax;
        CG.place(j, CG.ground(b, new V3(Math.cos(a) * 10, 0, 18 + Math.sin(a) * 6)), a);
        j.controller = new SL.AIController(b, { difficulty: 'normal' });
        j.target = null;
        j.setState('free');
      });
      gh.target = juniors[0];
      goFight(m, ['battle', 6]);
      m.objective('stand', 'Stand with them', { icon: 'fist', target: 6 });
      m.objective('shield', 'Knock a Junior off a friend', { icon: 'guard', optional: true, target: 3 });
      const struck = new Set();
      let shields = 0;
      const off = b.on('damage', (e) => {
        if (e.blocked || e.attacker !== gh || !juniors.includes(e.target)) return;
        struck.add(e.target);
        m.progress('stand', Math.min(6, struck.size));
        const t = e.target.target;
        if (t && t !== gh && allies.includes(t)) {
          shields++;
          m.progress('shield', Math.min(3, shields));
        }
      });
      let beaten = 0;
      const hook = () => {
        for (const f of allies) {
          if (f.beaten || f.hp > f.hpMax * 0.15) continue;
          f.beaten = true;
          beaten++;
          f.controller = scripted();
          f.untargetable = true;
          f.setState('scripted', { pose: 'knockdown', expression: 'ko' });
          b.releaseMeleeToken(f);
          b.emit('allyBeaten', { fighter: f, count: beaten });
          if (beaten === 2) m.say('piccolo', 'They are too fast — Gohan, stop holding back!', 3, { style: 'shout' });
        }
      };
      m.tickHooks.push(hook);
      yield () => beaten >= ALLIES_BEATEN || gh.hpFrac <= 0.3;
      removeHook(m, hook);
      if (off) off();
      m.complete('stand');
      m.failObjective('shield');
      m.flags.alliesBeaten = beaten;
      m.flags.alliesBeatenNames = Object.keys(S).filter((k) => allies.includes(S[k]) && S[k].beaten);
      m.flags.juniorsStruck = struck.size;
      b.rules.pressure = null;
      // the fight stops where it is: everybody freezes for the scene
      for (const f of b.fighters) if (f !== gh) f.controller = scripted();
      yield 0.6;
    },
  };

  P.sixteen = {
    id: 'sixteen',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      yield* SL.Cinema.play(m, 'sixteen_speaks');
    },
  };

  /** The transformation, entered from the flag the scene above sets. */
  P.ascend = {
    id: 'ascend',
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan;
      if (!m.flags.gohanBreaking) return; // never on a timer
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      CG.faceTo(gh, S.cell.pos);
      CG.faceTo(S.cell, gh.pos);
      gh.lockedForms = {};
      m.teach(gh, 'form:ssj2');
      const ssj2 = formIndex(gh, 'ssj2');
      yield* SL.data.cinematics.transform(m, {
        fighter: gh,
        formIndex: ssj2,
        witness: S.cell,
        line: 'gohan_ssj2',
        music: 6,
      });
      yield* SL.Cinema.play(m, 'ssj2_reveal');
      m.flags.ascended = gh.form.id === 'ssj2';
    },
  };

  /**
   * Super Saiyan 2: the Juniors, and none of them last — "The Difference in Power", a hack-and-slash
   * power reveal built in SL.data.cellPurge (src/data/missions/cell_purge.js) on this mission's own
   * staging helpers.
   */
  P.purge = {
    id: 'purge',
    checkpoint: true,
    run: function* (m) {
      yield* SL.data.cellPurge.run(m, { CG, prep, restoreStory, takeControl, goFight, toForm, removeHook });
    },
  };

  /** Super Saiyan 2 against the perfect form: the payoff, played — and Cell reads it. */
  P.rage = {
    id: 'rage',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      prep(m);
      restoreStory(m, 'rage');
      takeControl(b, gh);
      gh.lockedForms = {};
      toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.8));
      gh.ki = Math.max(gh.ki, 90);
      gh.stamina = gh.staminaMax;
      gh.winded = false;
      gh.cannotDie = true;
      gh.damageDealtMul = 1.8;
      gh.damageTakenMul = 0.35;
      CG.place(gh, CG.onRing(b, 0, 7), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      toForm(c, 'perfect');
      CG.place(c, CG.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.cannotDie = true;
      c.infiniteHp = false;
      c.noRegen = false; // he will try to use it; staying on him is the answer
      c.damageDealtMul = 0.5;
      const brain = cellBrain(b, c, { aggression: 0.9, defense: 0.5, ranged: 0.5, beam: 0.45, preferredRange: 4, hooks: 'cell' });
      // he knew the boy before: the jump in power is what he reacts to
      brain.cellSeenForm = 'ssj';
      c.target = gh;
      gh.target = c;
      c.setState('free');
      goFight(m, ['finale', 6]);
      m.objective('break', 'Take him apart', { icon: 'fist', target: 100 });
      m.objective('counter', 'Counter him twice', { icon: 'guard', optional: true, target: 2 });
      const adapts = [];
      let counters = 0;
      const offA = b.on('cellAdapts', (e) => {
        adapts.push(e.reason);
        if (e.reason === 'form') m.say('cell', 'Where did this come from? This is not the same child.', 2.8);
        if (e.reason === 'regen') m.say('teen_gohan', 'Grow it back. I will take it off again.', 2.6, { style: 'quiet' });
        if (e.reason === 'countered') m.say('cell', 'Enough of that. Keep your distance, then.', 2.4);
      });
      const offC = b.on('counterStrike', (e) => {
        if (e.fighter !== gh) return;
        counters++;
        m.progress('counter', Math.min(2, counters));
      });
      const start = c.hp;
      const hook = () => {
        const need = start - c.hpMax * 0.45;
        m.progress('break', Math.min(100, Math.floor(U.clamp01((start - c.hp) / need) * 100)));
      };
      m.tickHooks.push(hook);
      yield () => c.hpFrac <= 0.45;
      removeHook(m, hook);
      if (offA) offA();
      if (offC) offC();
      m.complete('break');
      if (counters < 2) m.failObjective('counter');
      m.flags.cellAdapted = adapts.slice();
      m.flags.rageDamage = Math.round((1 - c.hpFrac) * 100);
      yield 0.4;
    },
  };

  P.spit = {
    id: 'spit',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.gohan, S.cell]) f.controller = scripted();
      yield* SL.Cinema.play(m, 'cell_spits');
    },
  };

  /** Semi-perfect again, and falling apart: he is losing, and he knows it. */
  P.desperate = {
    id: 'desperate',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      prep(m);
      restoreStory(m, 'desperate');
      takeControl(b, gh);
      toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.7));
      gh.cannotDie = true;
      gh.damageDealtMul = 1.4;
      gh.damageTakenMul = 0.4;
      CG.place(gh, CG.onRing(b, 0, 6), Math.PI);
      toForm(c, 'semi_perfect');
      CG.place(c, CG.onRing(b, 0, -6), 0);
      c.hp = Math.min(c.hp > 0 ? c.hp : c.hpMax, Math.round(c.hpMax * 0.6));
      c.cannotDie = true;
      c.noRegen = true; // the perfect form's cells went with 18
      c.damageDealtMul = 0.6;
      cellBrain(b, c, { aggression: 1, defense: 0.2, ranged: 0.5, beam: 0.5, preferredRange: 3, hooks: 'boss' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      goFight(m, ['finale', 6]);
      m.objective('finish', 'He is falling apart. Finish it', { icon: 'fist', target: 100 });
      const start = c.hp;
      const hook = () => {
        const need = start - c.hpMax * 0.3;
        m.progress('finish', Math.min(100, Math.floor(U.clamp01(need <= 0 ? 1 : (start - c.hp) / need) * 100)));
      };
      m.tickHooks.push(hook);
      yield () => c.hpFrac <= 0.3;
      removeHook(m, hook);
      m.complete('finish');
      m.flags.desperateDone = true;
      yield 0.4;
    },
  };

  P.sacrifice = {
    id: 'sacrifice',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      CG.place(S.cell, CG.onRing(b, 0, -5), 0);
      yield* SL.Cinema.play(m, 'goku_sacrifice');
    },
  };

  P.returns = {
    id: 'returns',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      yield* SL.Cinema.play(m, 'cell_returns');
    },
  };

  /**
   * The Father-Son Kamehameha, played. Cell charges above the ring; Gohan charges
   * with one arm; the beams meet and the player pushes. The clash is the engine's
   * own BeamClash — the mission only shapes it from the state of the struggle:
   *   - Cell's beam starts heavier, so the boy is pushed back first;
   *   - when he is pushed back far enough, his father's voice: his beam steadies;
   *   - when he pushes back past the middle, Vegeta's blast hits Cell from the side;
   *   - the final push is the player's.
   * Winning the clash sends the beam through Cell and the damage it does is what
   * kills him. Losing it hurts Gohan and Cell charges again.
   */
  /** Where the last stand happens: Gohan on the ring in Super Saiyan 2 with one arm, Cell above the far edge. */
  function stageBeam(b) {
    const S = b.story, gh = S.gohan, c = S.cell;
    gh.lockedForms = {};
    toForm(gh, 'ssj2');
    gh.setHidden(false);
    gh.setRage(true, 1);
    gh.setTorn(true);
    CG.place(gh, CG.onRing(b, 0, 9), Math.PI);
    c.setHidden(false);
    c.alive = true;
    toForm(c, 'perfect');
    CG.superAura(c);
    CG.placeAir(c, CG.onRing(b, 0, -10).add(new V3(0, 5, 0)), 0);
  }

  P.beam = {
    id: 'beam',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      prep(m);
      restoreStory(m, 'beam');
      clearCombat(b);
      // the prelude is shot where the struggle is played, whether the story arrived here or a checkpoint did,
      // and the hero of this phase is Gohan from its first frame (Goku is dead by now, so nobody else can be)
      stageBeam(b);
      takeControl(b, gh);
      if (!m.flags.fatherSon) {
        for (const f of b.fighters) f.controller = scripted();
        yield* SL.Cinema.play(m, 'father_son');
        prep(m);
        restoreStory(m, 'beam');
      }
      takeControl(b, gh);
      gh.lockedForms = {};
      toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      gh.setTorn(true);
      // his father is at his back from the moment the struggle is his (watched or skipped, the same)
      CG.spirit(b, true, m.flags.fskVoice ? 0.72 : 0.5);
      const follow = () => {
        if (b.story.spiritOn) CG.spiritFollow(b);
      };
      m.tickHooks.push(follow);
      gh.hp = Math.max(Math.min(gh.hp, Math.round(gh.hpMax * 0.5)), Math.round(gh.hpMax * 0.35));
      gh.ki = gh.kiMax;
      gh.cannotDie = true;
      // one arm and nothing left but this: no other technique, no flight, and his blows barely register —
      // until his beam wins the struggle and goes through
      gh.damageDealtMul = 1;
      gh.damageTakenMul = 0.45;
      gh.noFlight = true;
      gh.lockedSlots = { special1: true, special2: true, ultimate: true, transform: true };
      // one arm: the pose and the beam come from the right hand only, and it answers fast
      // a narrower column than the free-battle ultimate: at this range two full-width beams wash the screen out
      gh.specOverrides = { ultimate: { chargeMin: 10, chargeMax: 50, oneHand: true, radius: [1.5, 1.5], poses: { charge: 'tg2_oneKameCharge', fire: 'tg2_oneKameFire' } } };
      gh.anim.poses = Object.assign({}, gh.anim.poses, { idle: gh.poses.tg2_oneArm });
      CG.place(gh, CG.onRing(b, 0, 9), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      c.alive = true;
      toForm(c, 'perfect');
      CG.superAura(c);
      CG.placeAir(c, CG.onRing(b, 0, -12).add(new V3(0, 7, 0)), 0);
      c.hp = c.hpMax;
      c.cannotDie = false; // the one stretch in the chapter where he can die
      c.noRegen = true;
      c.infiniteHp = false;
      c.ki = c.kiMax;
      c.damageDealtMul = 0.7;
      // a slow, heavy beam that comes down at him: time to answer it, and to meet it head-on
      c.specOverrides = { ultimate: { chargeMin: 100, chargeMax: 100, name: 'Kamehameha', color: 0x8ad4ff, radius: [1.5, 1.5], speed: 20, range: 80, sustain: 260 } };
      b.clash.maxSeconds = 40;
      const st = { cooldown: 90, rounds: 0 };
      c.controller = {
        update() {
          const it = SL.emptyIntent();
          if (b.inputLocked || b.aiLocked) return it;
          c.target = gh;
          if (c.state === 'beamCharge') {
            it.ultHeld = true;
            return it;
          }
          if (c.state !== 'free') return it;
          if (st.cooldown > 0) {
            st.cooldown--;
            return it;
          }
          c.ki = c.kiMax;
          st.rounds++;
          st.cooldown = 150;
          it.ult = true;
          it.ultHeld = true;
          return it;
        },
      };
      c.target = gh;
      gh.target = c;
      c.setState('free');
      goFight(m, ['finale', 7]);
      m.objective('fsk', 'Father-Son Kamehameha', { icon: 'ultimate', target: 100 });
      m.prompt('cgFsk', 'ultimate', 'Kamehameha', { required: true, when: () => gh.state === 'free' && !gh.lockedSlots.ultimate, always: true });
      m.prompt('cgPush', 'light', 'Push', { required: true, when: () => !!b.clash.active, always: true });
      const beats = { voice: !!m.flags.fskVoice, vegeta: !!m.flags.fskVegeta, clashes: 0, lost: 0 };
      let wonClash = false;
      const offS = b.on('clashStart', (e) => {
        if (!((e.a === gh || e.b === gh) && (e.a === c || e.b === c))) return;
        beats.clashes++;
        const cl = b.clash.active;
        cl.gohanBeam = cl.a.owner === gh ? cl.a : cl.b;
        cl.cellBeam = cl.a.owner === c ? cl.a : cl.b;
        cl.basePowerG = cl.gohanBeam.power;
        cl.basePowerC = cl.cellBeam.power;
        // he has more behind it at first
        cl.cellBeam.power = cl.basePowerC * (beats.vegeta ? 0.8 : beats.voice ? 1.5 : 2.2);
        cl.gohanBeam.power = cl.basePowerG * (beats.voice ? 1.9 : 1);
        m.music(null, 7);
        // the default clash shot sits too close for this one: the boy is on the ring and Cell is in the sky,
        // so pull back along the perpendicular until both of them and the struggle between them are in frame
        m.shot((t, out) => {
          const pa = gh.chest(), pb = c.chest();
          const live = b.clash.active;
          const mid = live ? live.point : pa.clone().lerp(pb, 0.5);
          const axis = pb.clone().sub(pa);
          const sep = axis.length();
          axis.normalize();
          const side = new V3().crossVectors(axis, new V3(0, 1, 0));
          if (side.lengthSq() < 0.01) side.set(1, 0, 0);
          side.normalize();
          const centre = pa.clone().lerp(pb, 0.5).lerp(mid, 0.4);
          out.pos.copy(centre).addScaledVector(side, sep).add(new V3(0, sep * 0.1, 0));
          out.look.copy(centre);
          out.fov = 50;
        }, 999, { hold: true, blendIn: 0.3 });
      });
      const offE = b.on('clashEnd', (e) => {
        if (e.winner === gh) {
          wonClash = true;
          // everything he was holding goes through with the beam
          gh.damageDealtMul = 3.2;
          // the push through, in slow motion, and his father letting go of him
          b.slowmo(0.3, 1.8);
          SL.ScreenFX.flash(0.7, '#e8f6ff');
          m.say('teen_gohan', 'AAAAAHHH!', 1.6, { style: 'shout' });
          b.emit('fskBeat', { beat: 'through' });
        }
        else if (e.winner === c) {
          beats.lost++;
          m.say('goku', 'Get up, Gohan. You are not done.', 2.6, { style: 'quiet' });
        }
      });
      let lastHitType = null;
      const offD = b.on('damage', (e) => {
        if (e.target === c && e.attacker === gh) lastHitType = e.type;
      });
      let envTick = 0;
      const hook = () => {
        // the answer is only possible once his beam is coming: the struggle cannot be skipped
        if (c.state === 'beamFire' || b.clash.active) {
          if (gh.lockedSlots.ultimate) {
            delete gh.lockedSlots.ultimate;
            b.emit('fskReady', {});
          }
        } else if (!gh.lockedSlots.ultimate && !['beamCharge', 'beamFire', 'clash'].includes(gh.state) && !wonClash) {
          gh.lockedSlots.ultimate = true;
        }
        const cl = b.clash.active;
        if (!cl || !cl.gohanBeam) {
          m.progress('fsk', wonClash ? 100 : 0);
          // a lost struggle can blow him off the ring, and he cannot fly: once he is up, he is back at his spot
          const spot = CG.onRing(b, 0, 9);
          if (!wonClash && gh.state === 'free' && c.state !== 'beamFire' && (Math.abs(gh.pos.x) > 15 || Math.abs(gh.pos.z) > 15 || gh.pos.y < spot.y - 1)) {
            b.vfx.flash(gh.chest(), 2, 0xffe25a, 0.25, SL.Toon.tex.glow);
            CG.place(gh, spot, Math.PI);
            CG.faceTo(gh, c.pos);
            b.sfx('teleport', gh);
          }
          return;
        }
        const p = b.clash.playerProgress();
        m.progress('fsk', Math.floor(p * 100));
        // his father's voice, when the boy is being pushed back
        if (!beats.voice && p <= 0.3) {
          beats.voice = true;
          m.flags.fskVoice = true;
          m.say('goku', 'Now, Gohan! Everything you have been holding — let it all go!', 3.6, { style: 'shout' });
          cl.gohanBeam.power = cl.basePowerG * 1.9;
          cl.cellBeam.power = cl.basePowerC * 1.5;
          SL.ScreenFX.flash(0.35, '#dff2ff');
          // his father steps into the light behind him: brighter, and the shot is of the two of them
          b.story.spiritLevel = 0.78;
          b.story.goku.model.setSpiritLevel(0.78);
          b.story.goku.sd.aura = 0.7;
          const wide = b.camera.shot;
          m.shot((t, out) => {
            const c = gh.chest();
            const fwd = new V3(Math.sin(gh.yaw), 0, Math.cos(gh.yaw));
            const right = new V3(-fwd.z, 0, fwd.x);
            // side-on from just behind his shoulder line: the boy, his arm out, his father at his back, and the
            // beam going away from the lens (a lens ahead of him sits in the beam's glow and the clash flashes)
            out.pos.copy(c).addScaledVector(fwd, -0.7 - t * 0.3).addScaledVector(right, -4.0).add(new V3(0, 0.1, 0));
            out.look.copy(c).addScaledVector(fwd, -0.4).add(new V3(0, 0.35, 0));
            out.fov = 38;
          }, 2.6, { cut: true, blendIn: 0, onEnd: () => {
            // back to the struggle between them
            if (wide && b.clash.active) b.camera.playShot(wide.fn, 999, { hold: true, kind: 'story', blendIn: 0.25 });
          } });
          b.emit('fskBeat', { beat: 'voice' });
        }
        // Vegeta, from the ground, when the push comes back past the middle
        if (beats.voice && !beats.vegeta && p >= 0.52) {
          beats.vegeta = true;
          m.flags.fskVegeta = true;
          const v = S.vegeta;
          if (v) {
            v.setState('scripted', { pose: 'blastR', expression: 'shout' });
            const from = v.chest(), to = c.chest();
            for (let i = 0; i <= 10; i++) b.vfx.trail(from.clone().lerp(to, i / 10), 0xffd33a, 0.5, 0.4);
            b.vfx.explosion(to, 4, 0xffd33a, { smoke: true });
            b.sfx('explosionBig', c, { vol: 1.2 });
          }
          m.say('vegeta', 'Gohan — NOW!', 2, { style: 'shout' });
          cl.cellBeam.power = cl.basePowerC * 0.8;
          b.emit('fskBeat', { beat: 'vegeta' });
        }
        // the ring coming apart under it
        envTick++;
        if (envTick % 18 === 0) {
          const pt = cl.point;
          const under = new V3(pt.x, b.stage.heightAt(pt.x, pt.z), pt.z);
          b.stage.crater(under, 2 + Math.abs(cl.push) * 3, 0.3, null);
          b.vfx.rock(under.clone().add(new V3(U.rand(-4, 4), 0.2, U.rand(-4, 4))), new V3(0, U.rand(4, 9), 0), U.rand(0.2, 0.5), b.stage.rockColor);
          b.vfx.bolt(pt.clone().add(new V3(U.rand(-2, 2), U.rand(-2, 2), U.rand(-2, 2))), U.rand(2, 4), 0xdff6ff);
          b.cameraTraumaAt(pt, 0.2 + Math.abs(cl.push) * 0.3);
        }
      };
      m.tickHooks.push(hook);
      yield () => !c.alive;
      removeHook(m, hook);
      removeHook(m, follow);
      // he fades with the light of the beam
      let fade = S.spiritLevel || 0.6;
      const fadeHook = () => {
        fade -= 1 / 60 / 1.2;
        if (b.story.spiritOn) b.story.goku.model.setSpiritLevel(Math.max(0, fade));
        if (fade <= 0) {
          CG.spirit(b, false);
          removeHook(m, fadeHook);
        }
      };
      m.tickHooks.push(fadeHook);
      for (const off of [offS, offE, offD]) if (off) off();
      m.complete('fsk');
      m.flags.cellBeaten = true;
      m.flags.finishedWithBeam = lastHitType === 'beam';
      m.flags.fskClashes = beats.clashes;
      m.flags.fskLost = beats.lost;
      m.flags.fskWonClash = wonClash;
      b.clash.maxSeconds = 7;
      gh.lockedSlots = {};
      gh.noFlight = false;
      yield 1.2;
    },
  };

  P.ends = {
    id: 'ends',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      CG.spirit(b, false); // his father has gone with the beam, whatever was skipped
      for (const f of b.fighters) f.controller = scripted();
      S.gohan.specOverrides = null;
      yield* SL.Cinema.play(m, 'cell_ends');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      // the survivors come to him
      for (const name of ['piccolo', 'krillin', 'tien']) {
        const f = S[name];
        if (!f || !f.alive) continue;
        CG.watch(f, CG.ground(b, CG.SPOTS[name]), name === 'piccolo' ? 'armsCrossed' : 'idle', 'hurt');
      }
      if (S.vegeta) CG.watch(S.vegeta, CG.ground(b, CG.SPOTS.vegeta), 'idle', 'hurt');
      // well clear of the platform edge: the close shots sit in front of him, and a story camera is never
      // allowed under the terrain — 2 m from the wall it would be shoved up on top of the ring
      CG.place(S.gohan, CG.ground(b, new V3(1.5, 0, 24)), Math.PI);
      yield* SL.Cinema.play(m, 'gohan_after');
      m.lock(true);
      m.fade('black', 1.4);
      yield 1.6;
      m.endShot();
      m.flags.gamesDone = true;
      m.title('CHAPTER 6 · CELL SAGA', 'THE CELL GAMES', 'Seven years later: a tournament, and a wizard (Chapter 7)', 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'cell_games',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'The Cell Games',
    subtitle: 'Earth · Age 767 · a ring, and a child who does not want to be in it',
    character: 'goku',
    stage: 'cellarena',
    parTime: 900,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'He built a ring and invited the planet. The person who beats him is the one who least wants to be there.',
    rewards: ['Gohan (age 11) playable', 'Chapter 6 complete'],
    setup,
    phases: [
      P.ring, P.goku, P.measures, P.serious, P.blitz, P.speed, P.pressure, P.limit, P.regrow, P.forfeit,
      P.gohan, P.powers, P.refuses, P.hold, P.strike16, P.born, P.juniors, P.sixteen, P.ascend, P.purge,
      P.rage, P.spit, P.desperate, P.sacrifice, P.returns, P.beam, P.ends, P.after,
    ],
  };

  SL.data.missions[def.id] = def;
})();
