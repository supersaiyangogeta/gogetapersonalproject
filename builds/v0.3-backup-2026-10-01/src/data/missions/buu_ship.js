/*
 * CHAPTER 9 — BUU SAGA: THE WIZARD (Age 774)
 * Babidi's ship: three floors, three missions.
 *
 *   buu_puipui  "Planet Zoon"     Vegeta vs Pui Pui, at ten times Earth's gravity
 *   buu_yakon   "The Dark Planet" Goku vs Yakon, who eats light
 *   buu_dabura  "The Demon King"  Gohan vs Dabura — until Babidi calls him off
 *
 * BABIDI is not a fighter in any of them, and the game never pretends he is.
 * He is the ship: each floor is a world he conjured (a stage of its own), and he
 * watches every fight from a rock above it (in the source he watches through a
 * crystal ball; the ledge keeps him on screen). `watch()` below makes him react
 * to what the player actually does — a transformation, a big hit either way, a
 * servant going down, a player turned to stone — so his presence is a system
 * running during the fight, not only lines in the cutscenes around it. On the
 * last floor he is also the one who ends the fight: when Dabura starts losing,
 * Babidi recalls him, because he has noticed what is in Vegeta's heart.
 *
 * Every fight here is a checkpoint phase; the people watching from the side
 * are scripted and untargetable in every phase, so a checkpoint restart never
 * turns a spectator into a combatant.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, 0);
  const LEDGE = [13, -15]; // Babidi's rock, above and to the side of every floor
  const LEDGE_HEIGHT = 6;

  const scripted = () => ({ update: () => SL.emptyIntent() });
  function place(f, pos, yaw) {
    f.setPosition(pos);
    if (yaw !== undefined) f.yaw = yaw;
    f.prevYaw = f.yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  const ground = (b, x, z, lift = 0) => new V3(x, b.stage.heightAt(x, z) + lift, z);
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));
  /** A camera in front of a fighter (by his facing), a little to one side, looking at his chest. */
  function frontOf(f, out, dist, side) {
    const c = f.chest();
    const fwd = f.forward.clone().setY(0).normalize();
    out.pos.copy(c).addScaledVector(fwd, dist).add(new V3(fwd.z * side, 0.3, -fwd.x * side));
    out.look.copy(c);
  }
  function untick(m, fn) {
    const i = m.tickHooks.indexOf(fn);
    if (i >= 0) m.tickHooks.splice(i, 1);
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive || o.hp >= 1e9) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  }
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /* ------------------------------------------------------------ Babidi */

  /** His rock: a column of the floor's own stone, built once per battle. */
  function buildLedge(b) {
    if (b.story && b.story.ledge) return b.story.ledge;
    const at = ground(b, LEDGE[0], LEDGE[1]);
    const g = new THREE.Group();
    const rock = b.stage.def.rock && b.stage.def.rock.bands ? b.stage.def.rock.bands[0] : 0x6a5a4a;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.2, LEDGE_HEIGHT, 9), SL.Toon.mat(rock));
    SL.Toon.addOutline(col, 1.5);
    col.position.y = LEDGE_HEIGHT / 2;
    g.add(col);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.3, 0.5, 9), SL.Toon.mat(rock));
    SL.Toon.addOutline(cap, 1.5);
    cap.position.y = LEDGE_HEIGHT + 0.1;
    g.add(cap);
    g.position.copy(at);
    b.stage.scene.add(g);
    if (b.mission) b.mission.onDispose(() => b.stage.scene.remove(g));
    const top = at.clone();
    top.y += LEDGE_HEIGHT + 0.35;
    return { group: g, top };
  }

  /** Babidi on his rock, facing the floor. He cannot fly; up here, magic holds him. */
  function perch(b, babidi) {
    const L = buildLedge(b);
    babidi.setHidden(false);
    babidi.untargetable = true;
    babidi.controller = scripted();
    babidi.noFlight = false; // hovers on the rock's cap instead of falling through it
    babidi.setPosition(L.top);
    babidi.grounded = false;
    babidi.vel.set(0, 0, 0);
    faceTo(babidi, ground(b, FIELD.x, FIELD.z));
    babidi.setState('scripted', { pose: 'bb_idle', expression: 'grin' });
    return L;
  }

  /**
   * Babidi watching a floor. He answers what happens in the fight, not a timer:
   * the player transforming, a heavy hit either way, his servant getting low,
   * the player turned to stone, ki fed to Yakon. One line at a time, with a
   * cooldown so he comments rather than narrates. Returns a stop function.
   */
  function watch(m, babidi, foe, player, lines) {
    const b = m.battle;
    const L = Object.assign({
      transform: 'Oh? The hair changed colour. How very pretty. Is that meant to frighten me?',
      hurtPlayer: 'Hohoho! Did that hurt? It looked like it hurt.',
      hurtFoe: 'Get up! I did not bring you here to lose!',
      low: 'Useless... utterly useless. Do something!',
      stone: 'Stone! Hohoho — stay like that forever!',
      absorbed: 'Yes, yes — feed him! Keep feeding him!',
    }, lines || {});
    let next = 0;
    let lowSaid = false;
    const said = (m.flags.babidiLines = m.flags.babidiLines || []);
    const speak = (kind, style) => {
      if (b.inputLocked || b.frame < next || !L[kind]) return;
      next = b.frame + 60 * 7;
      said.push(kind);
      m.say('babidi', L[kind], 3, { style: style || null });
      babidi.setState('scripted', { pose: kind === 'hurtPlayer' || kind === 'stone' ? 'bb_cackle' : 'bb_cast', expression: kind === 'hurtFoe' || kind === 'low' ? 'angry' : 'grin' });
      b.emit('babidiWatch', { kind, line: L[kind] });
    };
    const offs = [
      b.on('transformBurst', (e) => e.fighter === player && speak('transform')),
      b.on('damage', (e) => {
        if (e.blocked || !foe.alive || foe.hp <= 0) return; // nothing to say over a body
        if (e.target === player && e.amount > player.hpMax * 0.08) speak('hurtPlayer');
        else if (e.target === foe && e.amount > foe.hpMax * 0.05) speak('hurtFoe', 'shout');
        if (!lowSaid && foe.hpFrac < 0.3) {
          lowSaid = true;
          next = 0;
          speak('low', 'shout');
        }
      }),
      b.on('petrified', (e) => e.fighter === player && ((next = 0), speak('stone'))),
      b.on('absorbed', (e) => e.fighter === foe && speak('absorbed')),
    ];
    return () => offs.forEach((off) => off && off());
  }

  /* ------------------------------------------------------------ shared floor pieces */

  /** Everyone in place for a floor: the two who fight, the ones who watch, Babidi on his rock. */
  function stageFloor(b, hero, foe, watchers) {
    const S = b.story;
    place(hero, ground(b, 0, 7), Math.PI);
    place(foe, ground(b, 0, -7), 0);
    const spots = [[-15, 3], [-16, -0.5], [-14.5, 6.5]];
    watchers.forEach((k, i) => {
      const f = S[k];
      f.setHidden(false);
      f.untargetable = true;
      f.controller = scripted();
      place(f, ground(b, spots[i][0], spots[i][1]));
      faceTo(f, ground(b, 0, 0));
      f.setState('scripted', { pose: k === 'kai' ? 'sk_idle' : k === 'vegeta' ? 'armsCrossed' : 'idle', expression: 'calm' });
    });
    perch(b, S.babidi);
  }

  /** The fight itself starts the same way on every floor. */
  function openFight(m, hero, foe, ai) {
    const b = m.battle;
    clearCombat(b);
    for (const f of b.fighters) if (f !== hero && f !== foe) f.controller = scripted();
    b.switchPlayer(hero, { force: true });
    hero.hp = hero.hpMax;
    hero.ki = Math.max(hero.ki, 60);
    hero.stamina = hero.staminaMax;
    hero.winded = false;
    foe.setHidden(false);
    foe.untargetable = false;
    foe.hp = foe.hpMax;
    if (foe.poise) foe.poise.value = foe.poise.max;
    foe.controller = new SL.AIController(b, Object.assign({ difficulty: 'hard' }, ai || {}));
    foe.target = hero;
    hero.target = foe;
    hero.setState('free');
    foe.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  function spawnFloor(b, heroKey, heroId, foeKey, foeId, watchers) {
    const S = {};
    S[heroKey] = b.spawn({ charId: heroId, player: true, team: 0, pos: ground(b, 0, 7), startKi: 70 });
    S[foeKey] = b.spawn({ charId: foeId, team: 1, pos: ground(b, 0, -7), startKi: 80, tags: { boss: true, priority: true } });
    S[foeKey].controller = scripted();
    S[foeKey].setHidden(true);
    S[foeKey].untargetable = true;
    const ids = { goku: 'goku', vegeta: 'vegeta', gohan: 'adult_gohan', kai: 'supreme_kai' };
    for (const k of watchers) {
      S[k] = b.spawn({ charId: ids[k], team: 0, pos: ground(b, -15, 0), startKi: 50 });
      S[k].controller = scripted();
      S[k].untargetable = true;
      S[k].cannotDie = true;
    }
    S.babidi = b.spawn({ charId: 'babidi', team: 1, pos: ground(b, LEDGE[0], LEDGE[1] + 3), startKi: 50 });
    S.babidi.controller = scripted();
    S.babidi.untargetable = true;
    S.babidi.cannotDie = true;
    b.story = S;
    clearArea(b, FIELD, 24);
    clearArea(b, ground(b, LEDGE[0], LEDGE[1]), 4);
    S.ledge = buildLedge(b);
    return S;
  }

  /* ============================================================ PLANET ZOON */

  const ZOON = {};
  ZOON.enter = {
    id: 'enter',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      stageFloor(b, S.vegeta, S.puipui, ['goku', 'gohan', 'kai']);
      S.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'smirk' });
      yield* SL.Cinema.play(m, 'zoon_enter');
    },
  };

  ZOON.fight = {
    id: 'fight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, p = S.puipui;
      m.lock(true);
      m.clearObjectives();
      stageFloor(b, v, p, ['goku', 'gohan', 'kai']);
      if (v.formIndex !== 0) v.applyForm(0);
      p.cannotDie = true;
      openFight(m, v, p);
      p.damageDealtMul = 0.5; // canon: Vegeta is toying with him, and the fight should feel like it
      m.music('battle', 3);
      m.objective('win', 'Beat Pui Pui on his own planet', { icon: 'fist', target: 1 });
      m.objective('clean', 'Let him land almost nothing (under a quarter of your health)', { icon: 'guard', optional: true });
      const stop = watch(m, S.babidi, p, v, { low: 'Pui Pui! On your own planet? Pathetic!' });
      const hp0 = v.hp;
      yield () => p.hp <= p.hpMax * 0.1;
      stop();
      m.complete('win');
      const lost = (hp0 - v.hp) / v.hpMax;
      if (lost < 0.25) m.complete('clean');
      else m.failObjective('clean');
      m.flags.zoonDamage = Math.round(lost * 100);
    },
  };

  ZOON.finish = {
    id: 'finish',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, p = S.puipui;
      m.lock(true);
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      place(v, ground(b, 0, 5), Math.PI);
      place(p, ground(b, 0, -6), 0);
      p.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      v.setState('scripted', { pose: 'idle', expression: 'smirk' });
      yield* SL.Cinema.play(m, 'puipui_end');
    },
  };

  ZOON.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.shot((t, out) => {
        const c = S.babidi.chest();
        out.pos.set(c.x - 2.2, c.y + 0.3, c.z + 3);
        out.look.copy(c);
        out.fov = 38;
      }, 4, { cut: true, blendIn: 0 });
      S.babidi.setState('scripted', { pose: 'bb_cast', expression: 'angry' });
      m.say('babidi', 'One floor. One. Fine — the next one is dark, and hungry.', 3.4);
      yield* m.cine(3.6);
      m.endShot();
      m.flags.zoonDone = true;
      m.title('CHAPTER 9 · BUU SAGA', 'PLANET ZOON', 'Next: the second floor', 3.4);
      yield* m.cine(3.6);
    },
  };

  /* ============================================================ THE DARK PLANET */

  const LIGHT_FEED = 0.03; // of Yakon's max health, every ten frames a golden Goku powers up near him
  const FEED_RANGE = 16;

  const DARK = {};
  DARK.enter = {
    id: 'enter',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      stageFloor(b, S.goku, S.yakon, ['vegeta', 'gohan', 'kai']);
      S.goku.setState('scripted', { pose: 'idle', expression: 'calm' });
      yield* SL.Cinema.play(m, 'dark_enter');
    },
  };

  /**
   * Yakon eats light. Ki attacks feed him (the absorber mechanic heals him and
   * counts what he ate), and a golden aura powered up near him is light too —
   * so the canon answer works: power up in front of him until he has eaten more
   * than he can hold and bursts. Fists hurt him normally, so beating him down
   * also works; the optional objective asks for the canon way.
   */
  DARK.fight = {
    id: 'fight',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, y = S.yakon;
      m.lock(true);
      m.clearObjectives();
      stageFloor(b, g, y, ['vegeta', 'gohan', 'kai']);
      if (g.formIndex !== 0) g.applyForm(0);
      y.cannotDie = false; // the overload has to be able to finish him
      y.alive = true;
      y.mech && (y.mech.absorbed = 0, y.mech.burst = false);
      openFight(m, g, y);
      y.damageDealtMul = 0.6; // he is dangerous to eat near, not a match for Goku in a straight fight
      b.stage.setMood && b.stage.setMood(0.5, 0x05050c, 0.4);
      m.objective('win', 'He eats light. Give him more than he can hold', { icon: 'beam', target: 1 });
      m.objective('light', 'Finish him with light, not fists', { icon: 'transform', optional: true });
      m.prompt('dark_eat', 'charge', 'Golden and powering up near him: he eats it — and can only hold so much', { required: true, when: () => g.formIndex > 0 && g.state === 'charge' && g.distTo(y) < FEED_RANGE, until: () => y.mech && y.mech.absorbed > y.hpMax * 0.5, always: true });
      const stop = watch(m, S.babidi, y, g, { low: 'Yakon! Eat him! Eat all of it!' });
      let tick = 0;
      let overloaded = false;
      const offO = b.on('overload', (e) => e.fighter === y && (overloaded = true));
      // while a golden Goku powers up in front of him Yakon cannot help himself:
      // he stops fighting and eats, and the player can see him do it
      let eating = false;
      const ai = y.controller;
      const stopEating = () => {
        if (!eating) return;
        eating = false;
        y.controller = ai;
        if (y.alive && y.state === 'scripted') y.setState('free');
      };
      const feed = () => {
        if (b.inputLocked || !y.alive || y.mech.burst) return stopEating();
        const lit = g.formIndex > 0 && g.state === 'charge' && g.distTo(y) < FEED_RANGE;
        if (!lit) return stopEating();
        if (!eating && y.state !== 'free') return;
        if (!eating) {
          eating = true;
          y.controller = scripted();
          y.setState('scripted', { pose: 'sp_regrow', expression: 'grin', aura: 1 }); // lit by what he eats
          faceTo(y, g.pos);
          m.flags.yakonAte = (m.flags.yakonAte || 0) + 1;
        }
        // the light visibly leaves Goku's aura and goes into him
        if (tick % 2 === 0) b.vfx.trail(g.chest().lerp(y.chest(), (tick % 12) / 12), 0xffe27a, 0.5, 0.35);
        if (++tick % 10) return;
        // no attacker: an aura is not an attack, so nothing is stolen from Goku's ki
        SL.Mechanics.absorber.damageIn(y, { type: 'ki', damage: y.hpMax * LIGHT_FEED }, null);
        m.flags.fedLight = (m.flags.fedLight || 0) + 1;
      };
      m.tickHooks.push(feed);
      yield () => !y.alive;
      untick(m, feed);
      stopEating();
      stop();
      if (offO) offO();
      m.complete('win');
      if (overloaded) m.complete('light');
      else m.failObjective('light');
      m.flags.yakonOverload = overloaded;
      m.flags.yakonAbsorbed = Math.round(y.mech.absorbed);
    },
  };

  DARK.finish = {
    id: 'finish',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, y = S.yakon;
      m.lock(true);
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      y.setHidden(true);
      place(g, ground(b, 0, 4), Math.PI);
      g.setState('scripted', { pose: 'idle', expression: 'calm' });
      yield* SL.Cinema.play(m, 'yakon_end');
      b.stage.clearMood && b.stage.clearMood(0.8);
    },
  };

  DARK.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.shot((t, out) => {
        const c = S.babidi.chest();
        out.pos.set(c.x - 2.2, c.y + 0.3, c.z + 3);
        out.look.copy(c);
        out.fov = 38;
      }, 4, { cut: true, blendIn: 0 });
      S.babidi.setState('scripted', { pose: 'bb_cast', expression: 'angry' });
      m.say('babidi', 'Enough of this. Dabura! The next floor is yours.', 3.2, { style: 'shout' });
      yield* m.cine(3.4);
      m.endShot();
      m.flags.darkDone = true;
      m.title('CHAPTER 9 · BUU SAGA', 'THE DARK PLANET', 'Next: the Demon Realm', 3.4);
      yield* m.cine(3.6);
    },
  };

  /* ============================================================ THE DEMON KING */

  const RECALL_AT = 0.45; // below this Babidi stops the fight

  const DEMON = {};
  DEMON.enter = {
    id: 'enter',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      stageFloor(b, S.gohan, S.dabura, ['goku', 'vegeta', 'kai']);
      S.gohan.setState('scripted', { pose: 'ag_idle', expression: 'angry' });
      yield* SL.Cinema.play(m, 'dabura_enter');
    },
  };

  /**
   * The duel. Dabura is a boss with two phases (the duelist who keeps you at
   * his sword's length, then the demon who adds fire, the spit and the spear),
   * and the stone spit is a real hazard: it petrifies, and the player mashes out.
   * It ends when Babidi decides it does — below 45% — and the objective says so.
   */
  DEMON.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, d = S.dabura;
      m.lock(true);
      m.clearObjectives();
      stageFloor(b, g, d, ['goku', 'vegeta', 'kai']);
      g.lockedForms = {}; // he showed Kibito everything he has; nothing is held back here either
      if (g.formIndex !== 0) g.applyForm(0);
      d.cannotDie = true;
      d.mech && (d.mech.phase = 0);
      openFight(m, g, d);
      m.music('finale', 5);
      m.objective('push', 'Push the Demon King back', { icon: 'fist', target: 100 });
      m.objective('stone', 'Never stay stone for long (break out in under 2 seconds)', { icon: 'guard', optional: true });
      m.prompt('dabura_stone', 'light', 'Turned to stone — mash to break out', { required: true, when: () => g.state === 'held' && g.sd && g.sd.stone, until: () => false, always: true, min: 0.5 });
      m.prompt('dabura_reach', 'dodge', 'The sword outreaches you — dodge in, then strike', { when: () => g.distTo(d) < 2.6 && g.distTo(d) > 1.5, min: 2 });
      const stop = watch(m, S.babidi, d, g, {
        hurtFoe: 'Dabura! You are the king of the Demon Realm — act like it!',
        low: 'Hm. Hmm. The boy is stronger than he looks...',
      });
      let stoneAt = -1, stoneWorst = 0, stones = 0;
      const offP = b.on('petrified', (e) => {
        if (e.fighter !== g) return;
        stones++;
        stoneAt = b.frame;
      });
      const offU = b.on('unpetrified', (e) => {
        if (e.fighter !== g || stoneAt < 0) return;
        stoneWorst = Math.max(stoneWorst, (b.frame - stoneAt) / 60);
        stoneAt = -1;
      });
      const span = 1 - RECALL_AT;
      const tick = () => m.progress('push', Math.max(0, Math.min(100, Math.floor((100 * (1 - d.hpFrac)) / span))));
      m.tickHooks.push(tick);
      yield () => d.hpFrac <= RECALL_AT;
      untick(m, tick);
      stop();
      offP && offP();
      offU && offU();
      m.complete('push');
      if (stoneWorst < 2) m.complete('stone');
      else m.failObjective('stone');
      m.flags.stoneCount = stones;
      m.flags.stoneWorst = Math.round(stoneWorst * 10) / 10;
      m.flags.daburaPhase = d.mech ? d.mech.phase : 0;
    },
  };

  /** Babidi ends it. The player is told why before the scene takes over. */
  DEMON.recall = {
    id: 'recall',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, d = S.dabura;
      m.lock(true);
      clearCombat(b);
      for (const f of b.fighters) f.controller = scripted();
      if (g.state === 'held') g.setState('free');
      place(g, ground(b, 0, 5), Math.PI);
      place(d, ground(b, 0, -5), 0);
      g.setState('scripted', { pose: 'ag_fight', expression: 'angry' });
      d.setState('scripted', { pose: 'db_idle', expression: 'angry' });
      yield* SL.Cinema.play(m, 'dabura_recalled');
      // he is gone before anybody can follow: Babidi pulls him up to the control room
      for (const f of [d, S.babidi]) {
        b.vfx.flash(f.chest(), 3, 0xc84aff, 0.4, SL.Toon.tex.glow);
        f.setHidden(true);
      }
      m.flags.recalled = true;
    },
  };

  DEMON.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.shot((t, out) => {
        frontOf(S.kai, out, 2.6, 0.9);
        out.fov = 38;
      }, 4.4, { cut: true, blendIn: 0 });
      m.say('supreme_kai', 'He did not stop because he was losing. He stopped because he found someone he can use.', 4.2, { style: 'quiet' });
      yield* m.cine(4.4);
      m.shot((t, out) => {
        frontOf(S.vegeta, out, 2 - t * 0.2, -0.5);
        out.fov = 32;
      }, 3.2, { cut: true, blendIn: 0 });
      S.vegeta.setState('scripted', { pose: 'powerCrouch', expression: 'grit' });
      m.say('vegeta', '...', 2, { style: 'quiet' });
      yield* m.cine(2.4);
      m.endShot();
      m.flags.daburaDone = true;
      m.title('CHAPTER 9 · BUU SAGA', 'THE DEMON KING', 'Next: the mark', 3.4);
      yield* m.cine(3.6);
    },
  };

  /* ============================================================ definitions */

  const defs = [
    {
      id: 'buu_puipui',
      title: 'Planet Zoon',
      subtitle: 'Babidi\'s ship · first floor · Vegeta versus Pui Pui',
      character: 'vegeta',
      stage: 'ship_zoon',
      parTime: 150,
      blurb: 'The first floor is a planet with ten times Earth\'s gravity. Vegeta has trained in worse.',
      setup: (b) => spawnFloor(b, 'vegeta', 'vegeta', 'puipui', 'pui_pui', ['goku', 'gohan', 'kai']),
      phases: [ZOON.enter, ZOON.fight, ZOON.finish, ZOON.after],
    },
    {
      id: 'buu_yakon',
      title: 'The Dark Planet',
      subtitle: 'Babidi\'s ship · second floor · Goku versus Yakon',
      character: 'goku',
      stage: 'ship_dark',
      parTime: 180,
      blurb: 'Something in the dark eats light. Goku has plenty.',
      setup: (b) => spawnFloor(b, 'goku', 'goku', 'yakon', 'yakon', ['vegeta', 'gohan', 'kai']),
      phases: [DARK.enter, DARK.fight, DARK.finish, DARK.after],
    },
    {
      id: 'buu_dabura',
      title: 'The Demon King',
      subtitle: 'Babidi\'s ship · third floor · Gohan versus Dabura',
      character: 'adult_gohan',
      stage: 'demon_realm',
      parTime: 210,
      blurb: 'The king of the Demon Realm, a sword, and a spit that turns men to stone. Gohan goes first.',
      setup: (b) => spawnFloor(b, 'gohan', 'adult_gohan', 'dabura', 'dabura', ['goku', 'vegeta', 'kai']),
      phases: [DEMON.enter, DEMON.duel, DEMON.recall, DEMON.after],
    },
  ];
  for (const d of defs) {
    SL.data.missions[d.id] = Object.assign({ canon: true, chapter: 'CHAPTER 9 · BUU SAGA', rules: { allowTransform: true, allowUltimates: true }, rewards: [] }, d);
  }
})();
