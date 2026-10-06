/*
 * CHAPTER 3 — SAIYAN SAGA: THE SAIYANS ARRIVE
 * Mission "The Saibamen" (canon).
 *
 * Canon beats: Nappa and Vegeta face the gathered Z Fighters; Nappa grows six
 * Saibamen from the ground. Tien wins the first bout. Yamcha wins his too —
 * until his Saibaman latches onto him and self-destructs. Krillin, furious,
 * wipes out most of the rest with the Scattering Bullet, and Piccolo stops the
 * last one before it reaches Gohan. Then Nappa decides it's his turn.
 *
 * Playable: Tien (first bout), then Krillin with Piccolo, Gohan and Tien as a
 * switchable party. Yamcha's death is a cutscene driven by the real latch
 * technique, not an animation trick.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const SAIYANS = new V3(0, 0, -30);
  const HEROES = new V3(0, 0, 14);
  const DUEL = new V3(0, 0, -4);

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function ground(b, v, lift = 0) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  }
  function place(f, pos, yaw) {
    f.setPosition(pos);
    f.yaw = yaw;
    f.prevYaw = yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function clearCombat(b) {
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** A Saibaman climbs out of the soil where a seed was planted. */
  function* sprout(m, sb) {
    const b = m.battle;
    const sand = b.stage.def.terrain.sand, dirt = b.stage.def.terrain.dirt;
    sb.setHidden(false);
    sb.setState('scripted', { pose: 'sb_dig', expression: 'grin' });
    let k = 0;
    const hook = () => {
      k++;
      sb.model.root.position.y = -1.5 * Math.max(0, 1 - k / 40);
      if (k % 4 === 0 && k < 40) b.vfx.dust(sb.pos, 0.9, 4, sand);
      if (k === 1) b.vfx.debrisBurst(sb.pos.clone().add(new V3(0, 0.2, 0)), 10, dirt, 7, 0.18);
    };
    m.tickHooks.push(hook);
    yield 0.7;
    m.tickHooks.splice(m.tickHooks.indexOf(hook), 1);
    sb.model.root.position.y = 0;
    sb.setState('scripted', { pose: 'sb_cackle', expression: 'grin' });
    b.sfx('saibaScreech', sb, { pitch: U.rand(0.9, 1.2) });
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, new V3(0, 0, -6), 58);
    const vegeta = b.spawn({ charId: 'vegeta', team: 1, pos: ground(b, SAIYANS.clone().add(new V3(-3, 0, -2))), cannotDie: true, infiniteHp: true, tags: { cinematic: true } });
    const nappa = b.spawn({ charId: 'nappa', team: 1, pos: ground(b, SAIYANS.clone().add(new V3(4, 0, 0))), cannotDie: true, infiniteHp: true, tags: { cinematic: true } });
    for (const v of [vegeta, nappa]) {
      v.controller = scripted();
      v.untargetable = true;
      faceTo(v, HEROES);
    }
    const tien = b.spawn({ charId: 'tien', player: true, team: 0, pos: ground(b, HEROES.clone().add(new V3(-2, 0, 0))), startKi: 60 });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, HEROES.clone().add(new V3(-6, 0, 1))), startKi: 40 });
    const yamcha = b.spawn({ charId: 'yamcha', team: 0, pos: ground(b, HEROES.clone().add(new V3(-10, 0, 0))), startKi: 40 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, HEROES.clone().add(new V3(3, 0, 0))), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, HEROES.clone().add(new V3(7, 0, 1))), startKi: 40 });
    const heroes = [tien, krillin, yamcha, piccolo, gohan];
    for (const h of heroes) {
      if (h !== tien) h.controller = scripted();
      faceTo(h, SAIYANS);
    }
    // six seeds in a row between the two groups
    const saibamen = [];
    for (let i = 0; i < 6; i++) {
      const pos = ground(b, SAIYANS.clone().add(new V3(-10 + i * 4, 0, 9)));
      const sb = b.spawn({ charId: 'saibaman', team: 1, pos, tags: { mission: 'saibaman' } });
      sb.controller = scripted();
      sb.untargetable = true;
      sb.setHidden(true);
      faceTo(sb, HEROES);
      saibamen.push(sb);
    }
    b.story = { vegeta, nappa, tien, krillin, yamcha, piccolo, gohan, heroes, saibamen };
  }

  const P = {};

  P.standoff = {
    id: 'standoff',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.music('orbit', 0);
      for (const h of S.heroes) h.setState('scripted', { pose: 'idle', expression: 'angry' });
      S.vegeta.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      S.nappa.setState('scripted', { pose: 'idle', expression: 'grin' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.8);
      // over the heroes' shoulders toward the two Saiyans: a slow push in
      m.shot((t, out) => camAt(out, ground(b, HEROES.clone().add(new V3(U.lerp(1.5, 1, t), 0, U.lerp(11, 7, t))), U.lerp(3.2, 2.6, t)), ground(b, SAIYANS, 1.8), 46), 4.2, { cut: true, blendIn: 0 });
      yield* m.cine(4);
      m.shot((t, out) => {
        const c = S.nappa.chest();
        camAt(out, c.clone().add(new V3(U.lerp(2.4, 1.9, t), 1.1, 3.2)), c.clone().add(new V3(0, 0.9, 0)), 40);
      }, 3, { cut: true, blendIn: 0 });
      S.nappa.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
      m.say('nappa', 'Six weaklings. Let the Saibamen have some fun first.', 3);
      yield* m.cine(3);
      // the seeds are planted and the Saibamen crawl out of the ground
      m.shot((t, out) => camAt(out, ground(b, SAIYANS.clone().add(new V3(U.lerp(-14, -10, t), 0, 22)), 3.5), ground(b, SAIYANS.clone().add(new V3(0, 0, 9)), 0.6), 48), 4.2, { cut: true, blendIn: 0 });
      S.nappa.setState('scripted', { pose: 'n_twoFingers', expression: 'grin' });
      b.camera.addTrauma(0.2);
      SL.Audio.play('burrow');
      for (const sb of S.saibamen) {
        yield* sprout(m, sb);
        yield 0.05;
      }
      yield* m.cine(0.8);
      m.shot((t, out) => {
        const c = S.vegeta.chest();
        camAt(out, c.clone().add(new V3(-1.8, 0.3, 2.8)), c, 40);
      }, 2.8, { cut: true, blendIn: 0 });
      S.vegeta.setState('scripted', { pose: 'v_scouterTap', expression: 'smirk' });
      m.say('vegeta', 'One each. Let us see what this planet has to offer.', 2.8);
      yield* m.cine(2.8);
      m.shot((t, out) => {
        const c = S.tien.chest();
        camAt(out, c.clone().addScaledVector(S.tien.forward, 2.6).add(new V3(0.8, 0.2, 0)), c, 42);
      }, 2.4, { cut: true, blendIn: 0 });
      S.tien.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.say('tien', 'I will go first.', 2);
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  P.tien = {
    id: 'tien',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.tien;
      m.lock(true);
      clearCombat(b);
      if (b.player !== p) b.switchPlayer(p, { force: true });
      const foe = S.saibamen[0];
      for (const sb of S.saibamen) sb.setHidden(false);
      foe.untargetable = false;
      place(p, ground(b, DUEL.clone().add(new V3(0, 0, 5))), Math.PI);
      place(foe, ground(b, DUEL.clone().add(new V3(0, 0, -5))), 0);
      for (const sb of S.saibamen.slice(1)) sb.setState('scripted', { pose: 'sb_cackle', expression: 'grin' });
      for (const h of S.heroes) if (h !== p) h.setState('scripted', { pose: 'idle', expression: 'angry' });
      p.target = foe;
      foe.target = p;
      foe.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      p.setState('free');
      foe.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 2);
      m.objective('duel', 'Defeat the Saibaman', { icon: 'fist' });
      const clean = m.objective('noLatch', 'Never get latched', { icon: 'guard', optional: true });
      b.on('latch', (e) => {
        if (e.victim === p && !clean.done) m.failObjective('noLatch');
      });
      // read the tells: the coil before a leap, the mound before an ambush
      m.prompt('latchGuard', 'guard', 'Guard', { always: true, when: () => foe.state === 'latchCrouch', until: () => SL.Input.held('guard') || foe.state !== 'latchCrouch' });
      m.prompt('latchMash', 'light', 'Shake it off', { required: true, always: true, when: () => foe.state === 'latchCling', until: () => foe.state !== 'latchCling' });
      m.prompt('burrowDodge', 'dodge', 'Dodge', { when: () => foe.state === 'burrow' && foe.sd.phase === 'warn', until: () => SL.Input.pressed('dodge') || foe.state !== 'burrow' });
      yield () => !foe.alive || !p.alive;
      if (!p.alive) return;
      m.complete('duel');
      if (!clean.failed) m.complete('noLatch');
      yield 1.2;
    },
  };

  P.yamcha = {
    id: 'yamcha',
    run: function* (m) {
      const b = m.battle, S = b.story, y = S.yamcha;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      const sb = S.saibamen[1];
      // when this beat is reached directly (dev start / skipped phases) the earlier bout is already over
      for (const other of S.saibamen.slice(1)) other.setHidden(false);
      const first = S.saibamen[0];
      if (first.alive) {
        first.mech.vaporized = true;
        first.hp = 0;
        first._ko(null, {});
        first.setHidden(true);
      }
      for (const h of S.heroes) if (h.alive && h !== y) {
        h.setState('scripted', { pose: 'idle', expression: 'calm' });
        faceTo(h, DUEL);
      }
      S.tien.hp = Math.max(S.tien.hp, S.tien.hpMax * 0.55);
      place(S.tien, ground(b, HEROES.clone().add(new V3(-2, 0, 0))), Math.PI);
      place(y, ground(b, DUEL.clone().add(new V3(1, 0, 2))), Math.PI);
      place(sb, ground(b, DUEL.clone().add(new V3(1, 0, -2))), 0);
      sb.untargetable = false;
      y.setState('scripted', { pose: 'idle', expression: 'smirk' });
      sb.setState('scripted', { pose: 'sb_cackle', expression: 'grin' });
      m.shot((t, out) => {
        const c = y.chest();
        camAt(out, c.clone().add(new V3(2.6, 0.2, 2.2)), c, 42);
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('yamcha', 'My turn. Watch and learn.', 2.2);
      yield* m.cine(2.2);
      // a quick, one-sided exchange
      const mid = y.pos.clone().lerp(sb.pos, 0.5);
      m.shot((t, out) => camAt(out, mid.clone().add(new V3(U.lerp(7, 5, t), 1.6, U.lerp(-1, 1, t))), mid.clone().add(new V3(0, 1, 0)), 44), 3.2, { cut: true, blendIn: 0 });
      for (let i = 0; i < 4; i++) {
        y.anim.play(i % 2 ? 'punchL' : 'punchR', 44, { restart: true });
        sb.anim.play('hitBody', 40, { restart: true });
        b.vfx.impact(sb.chest(), 2, 0xffffff);
        b.sfx(i === 3 ? 'punchHeavy' : 'punchLight', y);
        yield 0.28;
      }
      y.anim.play('kickR', 44, { restart: true });
      b.vfx.impact(sb.chest(), 3, 0xffffff);
      b.sfx('punchHeavy', y, { vol: 1.3 });
      sb.vel.set(0, 5, -14);
      sb.grounded = false;
      sb.setState('knockdown', { frames: 9999 });
      b.camera.addTrauma(0.3);
      yield* m.cine(1.6);
      // he turns his back on it
      y.setState('scripted', { pose: 'idle', expression: 'grin' });
      faceTo(y, HEROES);
      m.shot((t, out) => {
        const c = y.chest();
        camAt(out, c.clone().addScaledVector(y.forward, 2.4).add(new V3(0.6, 0.3, 0)), c, 42);
      }, 2, { cut: true, blendIn: 0 });
      m.say('yamcha', "That's that. Who's next?", 2);
      yield* m.cine(2);
      // the Saibaman was never down
      place(sb, ground(b, y.pos.clone().addScaledVector(y.forward, -5)), y.yaw);
      sb.setState('free');
      sb.target = y;
      m.shot((t, out) => camAt(out, y.chest().addScaledVector(y.forward, 3.4).add(new V3(-1.2, 0.8, 0)), y.chest().addScaledVector(y.forward, -2), 46), 3.4, { cut: true, blendIn: 0 });
      b.aiLocked = false;
      const latch = sb.def.specials.special2;
      sb.controller = { update: () => SL.emptyIntent() };
      y.setState('free');
      SL.Techniques.latch.start(sb, Object.assign({}, latch, { fuse: 95 }), 'special2', 0);
      yield () => sb.state === 'latchCling' || sb.stateFrame > 90;
      // Yamcha never gets it off (canon)
      if (sb.state === 'latchCling') sb.sd.cpuRate = 0;
      // three-quarter view from behind: the Saibaman wrapped around his back, fuse flashing
      m.shot((t, out) => {
        const c = y.chest();
        const side = new V3(-y.forward.z, 0, y.forward.x);
        camAt(out, c.clone().addScaledVector(y.forward, -2.6).addScaledVector(side, U.lerp(2.2, 1.6, t)).add(new V3(0, 0.5, 0)), c.clone().add(new V3(0, 0.2, 0)), 42);
      }, 3, { cut: true, blendIn: 0 });
      m.say('krillin', 'YAMCHA! BEHIND YOU!', 1.4);
      y.cannotDie = false;
      y.hp = Math.min(y.hp, 1800);
      yield () => !sb.alive || !y.alive || y.state !== 'held';
      b.aiLocked = true;
      b.slowmo(0.25, 1.2);
      yield* m.cine(2);
      // the smoke clears
      m.shot((t, out) => camAt(out, y.pos.clone().add(new V3(4, 3, 4)), y.pos.clone().add(new V3(0, 0.4, 0)), 40), 3, { cut: true, blendIn: 0 });
      if (y.alive) {
        y.hp = 0;
        y._ko(sb, { dir: new V3(0, 1, 0) });
      }
      S.krillin.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      place(S.krillin, ground(b, y.pos.clone().add(new V3(-1.6, 0, 1.4))), Math.atan2(y.pos.x - S.krillin.pos.x, y.pos.z - S.krillin.pos.z));
      yield* m.cine(1.6);
      m.shot((t, out) => {
        const c = S.krillin.chest();
        camAt(out, c.clone().add(new V3(1.4, 0.1, -2.2)), c, 40);
      }, 2.6, { cut: true, blendIn: 0 });
      m.say('krillin', "Yamcha... You'll pay for this!", 2.6);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  /**
   * THE PACK (owner, playtest round 2: "so easy there wasn't time to play the others").
   * Not more health — a pack that behaves like one:
   *   - Nappa empties the rest of his pouch: the four canon survivors and five more seeds,
   *     which go straight underground. (Adaptation: canon grows six; the second handful is
   *     this game's, so the switchable party has a fight long enough to use.)
   *   - At most three are above ground at once. The rest tunnel under a hero and erupt —
   *     the moving mound and the crack are the warning — as soon as a slot is free.
   *   - They spread over the heroes instead of piling on one, and they go for the CPU
   *     allies' backs: a latched ally escapes slowly on its own, so switching to that hero
   *     (the switch goes to the hero in trouble first) or knocking it off is how you save
   *     them. Allies who get blown up are out of the fight, not dead.
   *   - Krillin starts without full ki: the Scattering Bullet is the payoff of the fight,
   *     not its first move.
   *   - Hit and run: one that has taken a real beating digs out and comes up under another
   *     hero (twice at most each). Chasing one down is a choice; covering the others is too.
   */
  const PACK = { active: 3, second: 5, releaseGap: 4.5, latchEvery: 17, allyEscape: 0.0024, allyFuse: 230, allyDamage: 0.5, retreatAt: 0.25, retreats: 2, retreatGap: 5 };

  P.pack = {
    id: 'pack',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, k = S.krillin;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // restarting from this checkpoint: the first two bouts already happened
      if (S.yamcha.alive) {
        S.yamcha.hp = 0;
        S.yamcha._ko(null, {});
        S.yamcha.setHidden(true);
      }
      for (const sb of S.saibamen.slice(0, 2)) if (sb.alive) {
        sb.mech.vaporized = true;
        sb.hp = 0;
        sb._ko(null, {});
        sb.setHidden(true);
      }
      // heroes that can be controlled for the rest of the fight
      const party = [k, S.piccolo, S.gohan, S.tien].filter((h) => h.alive);
      const survivors = S.saibamen.filter((sb) => sb.alive);
      for (const sb of survivors) sb.setHidden(false);
      const spots = [[-6, 6], [-2, 7], [3, 6], [7, 7]];
      party.forEach((h, i) => place(h, ground(b, DUEL.clone().add(new V3(spots[i][0], 0, spots[i][1]))), Math.PI));
      survivors.forEach((sb, i) => {
        place(sb, ground(b, DUEL.clone().add(new V3(-7 + i * 4.5, 0, -8))), 0);
        sb.setState('scripted', { pose: 'sb_cackle', expression: 'grin' });
      });
      // the rest of the pouch: four more seeds behind the pack
      if (!S.secondWave) {
        S.secondWave = [];
        for (let i = 0; i < PACK.second; i++) {
          const sb = b.spawn({ charId: 'saibaman', team: 1, pos: ground(b, SAIYANS.clone().add(new V3(-9 + i * 6, 0, 12))), tags: { mission: 'saibaman' } });
          sb.controller = scripted();
          sb.untargetable = true;
          sb.setHidden(true);
          faceTo(sb, HEROES);
          S.secondWave.push(sb);
        }
        S.saibamen.push(...S.secondWave);
      }
      for (const h of party) h.setState('scripted', { pose: 'idle', expression: 'angry' });
      // Nappa is not finished
      m.shot((t, out) => {
        const c = S.nappa.chest();
        camAt(out, c.clone().add(new V3(U.lerp(-2.6, -2, t), 0.8, 3.2)), c.clone().add(new V3(0, 0.6, 0)), 42);
      }, 2.6, { cut: true, blendIn: 0 });
      S.nappa.setState('scripted', { pose: 'n_twoFingers', expression: 'grin' });
      m.say('nappa', 'Down to four? I brought the whole pouch. Grow!', 2.6);
      yield* m.cine(2.4);
      m.shot((t, out) => camAt(out, ground(b, SAIYANS.clone().add(new V3(U.lerp(-16, -12, t), 0, 26)), 3.2), ground(b, SAIYANS.clone().add(new V3(0, 0, 12)), 0.4), 48), 3, { cut: true, blendIn: 0 });
      SL.Audio.play('burrow');
      for (const sb of S.secondWave) {
        if (!sb.alive) continue;
        yield* sprout(m, sb);
      }
      // and they go straight back into the ground
      for (const sb of S.secondWave) {
        if (!sb.alive) continue;
        sb.setState('scripted', { pose: 'sb_dig', expression: 'grin' });
        b.vfx.debrisBurst(sb.pos.clone().add(new V3(0, 0.3, 0)), 10, b.stage.def.terrain.dirt, 8, 0.2);
      }
      b.sfx('burrow', S.secondWave[0], { vol: 1 });
      yield* m.cine(0.7);
      for (const sb of S.secondWave) if (sb.alive) sb.setHidden(true);
      m.shot((t, out) => {
        const c = k.chest();
        camAt(out, c.clone().addScaledVector(k.forward, 2.4).add(new V3(0.4, -0.3, 0)), c, 38);
      }, 1.8, { cut: true, blendIn: 0 });
      k.setState('scripted', { pose: 'powerUp', expression: 'shout' });
      k.aura.target = 1;
      b.sfx('transformBurst', k, { pitch: 1.4, vol: 0.7 });
      m.say('krillin', 'They went underground — watch your feet!', 2);
      yield* m.cine(1.8);
      m.endShot();
      k.aura.target = 0;
      // the Scattering Bullet has to be earned in this fight
      k.ki = Math.min(k.ki, k.kiMax * 0.5);
      b.switchPlayer(k, { force: true });
      b.setParty(party);
      for (const h of party) {
        h.setState('free');
        // the CPU heroes fight warily (one of these just took Yamcha with it): the hero the
        // player holds does the real work, so every switch hands over the fight, not a spectator seat
        h.storyAllyMul = PACK.allyDamage;
        h.cannotDie = true;
        h.benched = false;
        h.untargetable = false;
      }
      // one step sharper than the story difficulty: they leap back out of a combo and come again
      const DIFF = ['easy', 'normal', 'hard', 'veryhard'];
      const sharp = DIFF[Math.min(DIFF.length - 1, DIFF.indexOf(SL.Settings.data.gameplay.difficulty) + 1)] || 'hard';
      const ai = () => new SL.AIController(b, { difficulty: sharp });
      const all = S.saibamen.filter((sb) => sb.alive && !sb.mech.vaporized);
      const active = new Set();
      const reserve = [];
      // three above ground, the fourth survivor digs in with the new seeds
      survivors.forEach((sb, i) => {
        if (i < PACK.active) {
          sb.untargetable = false;
          sb.controller = ai();
          sb.target = party[i % party.length];
          sb.setState('free');
          active.add(sb);
        } else {
          sb.setState('scripted', { pose: 'sb_dig', expression: 'grin' });
          sb.setHidden(true);
          sb.untargetable = true;
          reserve.push(sb);
        }
      });
      for (const sb of S.secondWave) if (sb.alive) reserve.push(sb);
      S.pack = { active, reserve, released: 0, latches: 0, allyLatched: 0, switchesToSave: 0 };
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      const toKill = Math.max(1, all.length - 1);
      let down = 0;
      m.objective('pack', 'Defeat the Saibamen', { icon: 'fist', target: toKill });
      const noBoom = m.objective('noBoom', 'Nobody gets blown up', { icon: 'guard', optional: true });
      const offs = [
        b.on('selfDestruct', (e) => {
          if (e.victim && e.victim.team === 0 && !noBoom.done) m.failObjective('noBoom');
        }),
        b.on('ko', (e) => {
          if (all.includes(e.fighter)) {
            down++;
            active.delete(e.fighter);
            m.progress('pack', Math.min(toKill, down));
          }
        }),
        b.on('latch', (e) => {
          S.pack.latches++;
          if (e.victim !== b.player && party.includes(e.victim)) S.pack.allyLatched++;
        }),
        b.on('playerSwitched', (e) => {
          if (e.to && e.to.state === 'held' && e.to.sd && e.to.sd.latched) S.pack.switchesToSave++;
        }),
      ];
      const latchedAlly = () => party.find((h) => h !== b.player && h.alive && !h.benched && h.state === 'held' && h.sd && h.sd.latched);
      m.prompt('scatter', 'ultimate', 'Scattering Bullet', { always: true, when: () => b.player === k && k.ki >= 99 && [...active].filter((sb) => sb.alive && !sb.hidden).length >= 3, until: () => k.state === 'scatter' });
      m.prompt('saveAlly', 'partyNext', 'Switch — shake it off!', { required: true, always: true, when: () => !!latchedAlly() && b.canSwitchTo(latchedAlly()), until: () => !latchedAlly() });
      m.prompt('mound', 'dodge', 'Dodge', { when: () => [...active].some((sb) => sb.state === 'burrow' && sb.sd.phase === 'warn' && sb.sd.victim === b.player), until: () => SL.Input.pressed('dodge') });
      let lastRelease = m.time - PACK.releaseGap + 4;
      let lastLatch = m.time - PACK.latchEvery + 10; // the first one about ten seconds in
      const burrowSpec = Object.assign({}, survivors[0].def.specials.special1, { cooldown: 0 });
      const director = () => {
        for (const sb of [...active]) if (!sb.alive) active.delete(sb);
        // a hero reduced to nothing is out of the fight, not dead (canon: nobody else dies here)
        for (const h of party) {
          if (h.benched || !h.alive || h.hp > 1) continue;
          h.benched = true;
          h.untargetable = true;
          h.controller = scripted();
          h.setState('knockdown', { frames: 99999 });
          b.emit('heroDown', { fighter: h });
          if (h === b.player) {
            const next = b.nextPartyMember(1);
            if (next) b.switchPlayer(next, { force: true });
          }
        }
        if (!b.partyAlive().length) {
          m.fail('defeated');
          return;
        }
        const heroes = b.partyAlive();
        // a free slot: the next one comes up from under somebody
        if (active.size < PACK.active && reserve.length && m.time - lastRelease > PACK.releaseGap) {
          const sb = reserve.shift();
          const allies = heroes.filter((h) => h !== b.player);
          const victim = allies.length && S.pack.released % 3 !== 2 ? allies[S.pack.released % allies.length] : b.player;
          const ang = Math.random() * Math.PI * 2;
          place(sb, ground(b, victim.pos.clone().add(new V3(Math.cos(ang) * 11, 0, Math.sin(ang) * 11))), 0);
          sb.setHidden(false);
          sb.untargetable = false;
          sb.controller = ai();
          sb.target = victim;
          sb.setState('free');
          sb.grounded = true;
          SL.Techniques.burrow.start(sb, burrowSpec, 'special1', 0);
          active.add(sb);
          S.pack.released++;
          lastRelease = m.time;
          b.emit('packRelease', { fighter: sb, victim });
        }
        // spread the pack: nobody piles onto the hero the player holds while others stand idle
        const counts = new Map(heroes.map((h) => [h, 0]));
        for (const sb of active) if (sb.alive && counts.has(sb.target)) counts.set(sb.target, counts.get(sb.target) + 1);
        for (const sb of active) {
          if (!sb.alive || sb.state !== 'free') continue;
          if (!sb.target || !sb.target.alive || sb.target.benched || counts.get(sb.target) > 1) {
            const pick = heroes.slice().sort((a, c) => counts.get(a) - counts.get(c) || a.pos.distanceTo(sb.pos) - c.pos.distanceTo(sb.pos))[0];
            if (pick && pick !== sb.target) {
              if (counts.has(sb.target)) counts.set(sb.target, counts.get(sb.target) - 1);
              sb.target = pick;
              counts.set(pick, counts.get(pick) + 1);
            }
          }
        }
        // hit and run: a Saibaman that has lost a third of itself since it last came up goes under
        for (const sb of active) {
          if (!sb.alive || sb.state !== 'free' || !sb.grounded) continue;
          const mem = (sb._pack = sb._pack || { hp: sb.hp, runs: 0, at: m.time });
          if (mem.runs >= PACK.retreats || m.time - mem.at < PACK.retreatGap) continue;
          if (mem.hp - sb.hp < sb.hpMax * PACK.retreatAt) continue;
          const others = heroes.filter((h) => h !== sb.target);
          const next = others.length ? others[(mem.runs + S.pack.released) % others.length] : sb.target;
          if (!next) continue;
          sb.target = next;
          if (SL.Techniques.burrow.start(sb, burrowSpec, 'special1', 0) !== false) {
            mem.runs++;
            mem.at = m.time;
            mem.hp = sb.hp;
            S.pack.retreats = (S.pack.retreats || 0) + 1;
            b.emit('packRetreat', { fighter: sb, victim: next });
          }
        }
        // every so often one of them goes for an ally's back: the reason to switch
        if (m.time - lastLatch > PACK.latchEvery && !latchedAlly()) {
          const allies = heroes.filter((h) => h !== b.player && h.state !== 'held');
          const hunter = [...active].find((sb) => sb.alive && sb.state === 'free' && allies.includes(sb.target) && sb.distTo(sb.target) < 12);
          if (!hunter && allies.length) {
            // nobody is on an ally: send the free one nearest to an ally after them
            let best = null, bd = Infinity, bv = null;
            for (const sb of active) {
              if (!sb.alive || sb.state !== 'free') continue;
              for (const h of allies) {
                const d = sb.distTo(h);
                if (d < bd) (bd = d), (best = sb), (bv = h);
              }
            }
            if (best) best.target = bv;
          }
          if (hunter) {
            const spec = Object.assign({}, hunter.def.specials.special2, { cpuEscape: PACK.allyEscape, fuse: PACK.allyFuse, cooldown: 0 });
            if (SL.Techniques.latch.start(hunter, spec, 'special2', 0) !== false) lastLatch = m.time;
          }
        }
        m.progress('pack', Math.min(toKill, down));
      };
      m.tickHooks.push(director);
      yield () => (all.filter((sb) => sb.alive).length <= 1 && !reserve.length) || !b.partyAlive().length || m.state !== 'running';
      const hi = m.tickHooks.indexOf(director);
      if (hi >= 0) m.tickHooks.splice(hi, 1);
      for (const off of offs) if (off) off();
      for (const h of party) h.storyAllyMul = undefined;
      if (!b.partyAlive().length || m.state !== 'running') return;
      m.progress('pack', toKill);
      if (!noBoom.failed) m.complete('noBoom');
      yield 0.6;
      const last = all.find((sb) => sb.alive);
      if (last) {
        last.setHidden(false);
        yield* m.def.lastOne(m, last);
      }
    },
  };

  /** The last Saibaman goes for Gohan; Piccolo is faster. */
  function* lastOne(m, sb) {
    const b = m.battle, S = b.story, g = S.gohan, pc = S.piccolo;
    m.lock(true);
    clearCombat(b);
    for (const h of b.party || []) if (h.alive) h.setState('scripted', { pose: 'idle', expression: 'angry' });
    place(g, ground(b, DUEL.clone().add(new V3(4, 0, 6))), Math.PI);
    if (pc.alive) place(pc, ground(b, DUEL.clone().add(new V3(9, 0, 8))), Math.PI);
    place(sb, ground(b, DUEL.clone().add(new V3(4, 0, -6))), 0);
    sb.target = g;
    g.setState('free');
    g.anim.play('kg_scared', 12);
    m.shot((t, out) => camAt(out, g.chest().add(new V3(-3, 0.6, 3)), sb.chest(), 44), 2.4, { cut: true, blendIn: 0 });
    b.aiLocked = false;
    sb.controller = scripted();
    SL.Techniques.latch.start(sb, sb.def.specials.special2, 'special2', 0);
    yield () => sb.state === 'latchCrouch' || sb.stateFrame > 40;
    b.slowmo(0.2, 1.4);
    const shooter = pc.alive ? pc : S.krillin;
    shooter.setState('scripted', { pose: 'blastR', expression: 'angry' });
    shooter.target = sb;
    const from = shooter.handPos('R');
    b.projectiles.spawnBlast(shooter, from, sb.chest().sub(from).normalize(), { kind: 'ball', speed: 140, radius: 0.7, damage: 99999, color: 0xe8ff8a, core: 0xffffff, homing: 8, explode: 3, knock: 'heavy', impact: 3, life: 1.5 });
    b.sfx('kiBlastBig', shooter);
    m.shot((t, out) => camAt(out, shooter.chest().add(new V3(-1.5, 0.4, 2.6)), sb.chest(), 50), 1.8, { cut: true, blendIn: 0 });
    sb.cannotDie = false;
    sb.infiniteHp = false;
    const shotFrame = b.frame;
    yield () => !sb.alive || b.frame - shotFrame > 150;
    if (sb.alive) {
      sb.cannotDie = false;
      sb.hp = 0;
      sb._ko(shooter, { dir: new V3(0, 1, 0) });
    }
    yield* m.cine(1.4);
    if (pc.alive) {
      pc.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().add(new V3(2.4, 0.2, -2.6)), c, 40);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('piccolo', 'Stay sharp, Gohan.', 2.2);
      yield* m.cine(2.2);
    }
    m.endShot();
  }

  P.nappa = {
    id: 'nappa',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      for (const h of S.heroes) if (h.alive) {
        h.setState('scripted', { pose: 'idle', expression: 'angry' });
        faceTo(h, n.pos);
      }
      n.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
      m.shot((t, out) => {
        const c = n.chest();
        camAt(out, c.clone().add(new V3(U.lerp(-3, -2.2, t), U.lerp(-0.8, -0.4, t), 3.6)), c.clone().add(new V3(0, 0.5, 0)), 44);
      }, 3.2, { cut: true, blendIn: 0 });
      m.say('nappa', "Useless weeds. Fine — I'll break you myself!", 3);
      b.camera.addTrauma(0.25);
      yield* m.cine(3.2);
      m.fade('black', 1);
      yield 1.2;
      m.endShot();
      m.title('CHAPTER 3', 'NAPPA ATTACKS', 'Next: hold the line until Goku arrives', 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'saiyan_saibamen',
    canon: true,
    chapter: 'CHAPTER 3 · SAIYAN SAGA',
    title: 'The Saibamen',
    subtitle: 'Earth · the Saiyans have landed',
    character: 'krillin',
    stage: 'wasteland',
    parTime: 300,
    qteLabel: 'Composure',
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Six creatures grown from the soil. They cannot fly, they do not care if they live, and one of them is about to take a hero with it.',
    rewards: ['Krillin — playable prototype', 'Tien — playable prototype', 'Saibaman enemy in Training'],
    setup,
    lastOne,
    PACK,
    phases: [P.standoff, P.tien, P.yamcha, P.pack, P.nappa],
  };

  SL.data.missions[def.id] = def;
})();
