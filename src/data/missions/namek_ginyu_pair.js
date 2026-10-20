/*
 * CHAPTER 4 — NAMEK SAGA (eighth mission of the Namek foundation, in development)
 * Mission "Two Against One" (canon, played as Goku).
 *
 * Canon beats: Goku lands, hands out senzu beans and puts Recoome down with one
 * blow. Burter and Jeice come at him together — the fastest in the universe and
 * the Red Magma, working as a pair. Goku takes them both. Jeice runs for the
 * captain, which is what sets up Ginyu.
 *
 * Phases: LANDING (cutscene) → PAIR (checkpoint: Burter and Jeice together) →
 * DOWN (cutscene: Burter falls) → ALONE (checkpoint: Jeice with nobody to cover
 * him) → FLIGHT (cutscene: he goes to fetch Captain Ginyu).
 *
 * The fight teaches two rules, and both of them are about stopping people:
 *   - Burter is untouchable while he is moving and free while he is not, so the
 *     fight is about his recovery, his staggers, and guarding a Hurricane pass;
 *   - Jeice will not shoot through his own partner, so the safest place on the
 *     field is next to Burter — until Burter is down, and then it is the worst.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const CATCH_TARGET = 3;

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
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
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
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  /** Burter is only really hittable when he has stopped moving. */
  const STOPPED = ['recover', 'stagger', 'guardBreak', 'knockdown', 'getup', 'hitstun'];

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 34);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 16))), startKi: 90 });
    goku.lockedForms = { kaioken: true }; // he saves it for the captain
    goku.formCaps = { kaioken: 2 };
    goku.lockedSlots = { transform: true };
    // the three he came for, still on the ground where Recoome left them
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 15))), startKi: 40 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-9, 0, 16))), startKi: 40 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(3, 0, 20))), startKi: 30 });
    for (const f of [krillin, gohan, vegeta]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
    }
    const recoome = b.spawn({ charId: 'recoome', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, 2))), startKi: 60 });
    const burter = b.spawn({ charId: 'burter', team: 1, pos: ground(b, FIELD.clone().add(new V3(5, 0, -6))), startKi: 80, tags: { boss: true, priority: true } });
    const jeice = b.spawn({ charId: 'jeice', team: 1, pos: ground(b, FIELD.clone().add(new V3(-5, 0, -6))), startKi: 90, tags: { boss: true } });
    for (const f of [recoome, burter, jeice]) f.controller = scripted();
    recoome.untargetable = true;
    faceTo(goku, FIELD);
    for (const f of [recoome, burter, jeice]) faceTo(f, goku.pos);
    b.story = { goku, krillin, gohan, vegeta, recoome, burter, jeice };
  }

  const P = {};

  P.landing = {
    id: 'landing',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of b.fighters) f.controller = scripted();
      // Goku's arrival on Namek is a scene of its own (owner, playtest round 2: "no landing,
      // no pose, no feeling that Goku has arrived"): the boot over Gohan, the ship, the streak,
      // Goku between them, the others seeing who it is, the beans, one elbow for Recoome
      yield* SL.Cinema.play(m, 'goku_lands_ginyu');
    },
  };

  P.pair = {
    id: 'pair',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, bt = S.burter, jc = S.jeice, r = S.recoome;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== g) b.switchPlayer(g, { force: true });
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 10))), Math.PI);
      place(bt, ground(b, FIELD.clone().add(new V3(5, 0, -6))), 0);
      place(jc, ground(b, FIELD.clone().add(new V3(-6, 0, -10))), 0);
      place(r, ground(b, FIELD.clone().add(new V3(13, 0, 6))));
      r.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      r.untargetable = true;
      r.controller = scripted();
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      // canon: Goku came back from King Kai's stronger than either of them. He is not
      // fighting a pair of equals, he is fighting two people who do not know that yet.
      g.damageDealtMul = 1.7;
      g.damageTakenMul = 0.35; // canon: roughly four times their power
      // THE POWER GAP, played rather than multiplied (owner, playtest round 2: "Goku did not feel
      // stronger; Burter and Jeice were hard"). Their ordinary strikes and shots are mostly not
      // there when they arrive — Goku is behind them — and Burter's speed does nothing against
      // someone faster: nothing slides off him when Goku is the one hitting.
      g.storyEvade = { chance: 0.75, gap: 16, from: [bt, jc] };
      g.storySpeed = true;
      for (const f of [bt, jc]) {
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, 80);
        f.mech.phase = 0;
        f.poise.value = f.poise.max;
        f.controller = cpu(b);
        f.target = g;
      }
      // Burter is the one who has to fall here; Jeice survives to fetch the captain
      jc.cannotDie = true;
      bt.cannotDie = false;
      g.target = bt;
      g.setState('free');
      bt.setState('free');
      jc.setState('free');
      m.lock(false);
      b.aiLocked = false;
      // the Ginyu Force's own theme (soundtrack PDF p.95, an original stand-in: superhero-show brass)
      m.music('ginyu_force', 3);
      m.objective('burter', 'Put Burter on the ground', { icon: 'fist' });
      const catches = m.objective('catch', 'Hit Burter ' + CATCH_TARGET + ' times while he is stopped', { icon: 'fist', optional: true, target: CATCH_TARGET });
      let caught = 0, slipped = 0, blocked = 0, held = 0;
      b.on('speedEvade', () => slipped++);
      b.on('speedOrbitBlocked', (e) => {
        if (e.by === b.player) blocked++;
      });
      b.on('squadRole', (e) => {
        if (e.fighter === jc && e.holding) held++;
      });
      b.on('damage', (e) => {
        if (e.target === bt && e.attacker === g && STOPPED.includes(bt.state)) {
          caught++;
          m.progress('catch', Math.min(CATCH_TARGET, caught));
        }
      });
      // the two things the fight is actually about, taught where they happen
      m.prompt('btStopped', 'heavy', 'He has stopped — hit him now', {
        always: true,
        when: () => bt.alive && STOPPED.includes(bt.state) && g.distTo(bt) < 7,
        until: () => !STOPPED.includes(bt.state),
      });
      m.prompt('btOrbit', 'guard', 'Guard the pass to bounce him off', {
        always: true,
        when: () => bt.state === 'speedOrbit',
        until: () => bt.state !== 'speedOrbit',
      });
      // they notice, out loud, while the fight goes on
      let saidBoast = false, saidWrong = false, saidOutsped = false;
      const offs = [
        b.on('storyEvade', (e) => {
          if (e.fighter !== g) return;
          if (e.attacker === bt && e.count >= 2 && !saidBoast) {
            saidBoast = true;
            m.say('burter', 'Stand still! Nobody in the universe is faster than me!', 2.4, { style: 'shout' });
          } else if (e.count >= 5 && !saidWrong) {
            saidWrong = true;
            m.say('jeice', 'He is not even trying, mate. Something is wrong with this one.', 2.8);
          }
        }),
        b.on('outsped', (e) => {
          if (e.fighter !== bt || saidOutsped) return;
          saidOutsped = true;
          m.say('goku', 'You are fast. I am faster.', 2);
        }),
      ];
      yield () => !bt.alive || !g.alive;
      for (const off of offs) if (off) off();
      if (!g.alive) return;
      m.complete('burter');
      if (caught >= CATCH_TARGET) m.complete('catch');
      else m.failObjective('catch');
      m.flags.caught = caught;
      m.flags.slipped = slipped;
      m.flags.hurricaneBlocked = blocked;
      m.flags.jeiceHeld = held;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.5;
    },
  };

  P.down = {
    id: 'down',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, bt = S.burter, jc = S.jeice;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [bt, jc]) f.controller = scripted();
      place(bt, ground(b, g.pos.clone().addScaledVector(g.forward, 3.2)));
      bt.setState('scripted', { pose: 'bt_defeat', expression: 'ko' });
      faceTo(g, bt.pos);
      g.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.shot((t, out) => camAt(out, bt.chest().clone().add(new V3(U.lerp(2.6, 4.2, t), U.lerp(1, 2.2, t), 3)), bt.chest(), 46), 3.2, { cut: true, blendIn: 0 });
      b.bark(bt, 'beaten', true);
      yield* m.cine(3.2);
      // Jeice has been shooting around his partner all fight; now there is no partner
      place(jc, ground(b, g.pos.clone().add(new V3(-7, 0, -11))));
      faceTo(jc, bt.pos);
      jc.setState('scripted', { pose: 'idle', expression: 'shock' });
      m.shot((t, out) => camAt(out, jc.chest().clone().addScaledVector(jc.forward, 3).add(new V3(0.9, 0.5, 0)), jc.chest(), 42), 3.4, { cut: true, blendIn: 0 });
      m.say('jeice', 'Burter? BURTER! ...Right. I am getting the captain.', 3.2);
      yield* m.cine(3.4);
      m.endShot();
      // canon: Goku leaves him breathing, and the prince does not
      yield* SL.Cinema.play(m, 'vegeta_finishes_burter');
    },
  };

  P.alone = {
    id: 'alone',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, bt = S.burter, jc = S.jeice;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(bt, ground(b, FIELD.clone().add(new V3(9, 0, 2))));
      bt.setState('scripted', { pose: 'bt_defeat', expression: 'ko' });
      bt.untargetable = true;
      bt.controller = scripted();
      bt.alive = false; // he is out of the fight, and Jeice fights like it
      bt.setHidden(true); // Vegeta finished him (the 'down' scene); a checkpoint restart matches it
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(jc, ground(b, FIELD.clone().add(new V3(0, 0, -12))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.55));
      g.ki = Math.max(g.ki, 70);
      g.damageDealtMul = 1.7;
      g.damageTakenMul = 0.35; // canon: roughly four times their power
      g.storyEvade = { chance: 0.75, gap: 16, from: [jc] };
      g.storySpeed = true;
      jc.hp = jc.hpMax;
      jc.ki = Math.max(jc.ki, 90);
      jc.mech.phase = 0;
      jc.poise.value = jc.poise.max;
      jc.cannotDie = true; // canon: he leaves under his own power
      jc.controller = cpu(b);
      jc.target = g;
      g.target = jc;
      g.setState('free');
      jc.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 3);
      m.objective('breakThrough', 'Get through the Red Magma', { icon: 'fist' });
      const clean = m.objective('clean', 'Take no Crusher Ball to the face', { icon: 'guard', optional: true });
      let ballHits = 0, volleys = 0, kickoffs = 0;
      b.on('damage', (e) => {
        if (e.target !== g || e.attacker !== jc) return;
        if (e.source === 'Crusher Ball' || e.source === 'Crusher Volcano') {
          ballHits++;
          if (ballHits === 1) m.failObjective('clean');
        }
      });
      b.on('scatterBurst', (e) => {
        if (e.fighter === jc) volleys++;
      });
      b.on('retreatVolley', (e) => {
        if (e.fighter === jc) kickoffs++;
      });
      m.prompt('jcKick', 'dash', 'He is backing off — close it again', {
        always: true,
        when: () => jc.state === 'retreatVolley',
        until: () => jc.state !== 'retreatVolley',
      });
      yield () => jc.hpFrac <= 0.3 || !g.alive;
      if (!g.alive) return;
      m.complete('breakThrough');
      if (!ballHits) m.complete('clean');
      m.flags.ballHits = ballHits;
      m.flags.volleys = volleys;
      m.flags.kickoffs = kickoffs;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.flight = {
    id: 'flight',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, jc = S.jeice, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      jc.controller = scripted();
      jc.cannotDie = true;
      g.storyEvade = null;
      g.storySpeed = false;
      place(jc, ground(b, g.pos.clone().addScaledVector(g.forward, 7)));
      faceTo(jc, g.pos);
      faceTo(g, jc.pos);
      jc.setState('scripted', { pose: 'idle', expression: 'hurt' });
      g.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.shot((t, out) => camAt(out, jc.chest().clone().addScaledVector(jc.forward, 2.8).add(new V3(0.8, 0.4, 0)), jc.chest(), 44), 3, { cut: true, blendIn: 0 });
      m.say('jeice', 'Captain... I need the captain...', 2.6);
      yield* m.cine(3);
      // he leaves, and the shot follows him up
      jc.grounded = false;
      const from = jc.pos.clone();
      const hook = () => {
        if (b.inputLocked === false) return;
        jc.pos.y += 0.55;
        jc.prevPos.copy(jc.pos);
      };
      m.tickHooks.push(hook);
      jc.setState('scripted', { pose: 'jc_backW', expression: 'shock', speed: 14 });
      b.sfx('dash', jc, { pitch: 0.9 });
      m.shot((t, out) => camAt(out, from.clone().add(new V3(6, 3, 8)), jc.chest(), U.lerp(46, 58, t)), 3.4, { cut: true, blendIn: 0 });
      yield* m.cine(3);
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      jc.hidden = true;
      jc.untargetable = true;
      // Vegeta, who knows exactly what Jeice has gone to fetch
      place(v, ground(b, g.pos.clone().add(new V3(5, 0, 6))));
      v.setState('scripted', { pose: 'idle', expression: 'grit' });
      faceTo(v, g.pos);
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 2.6).add(new V3(-0.9, 0.4, 0)), v.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('vegeta', 'You should have killed him. Now he brings the captain.', 3);
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'TWO AGAINST ONE', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_ginyu_pair',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'Two Against One',
    subtitle: 'Namek · Goku against Burter and Jeice',
    character: 'goku',
    stage: 'namek',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'The fastest in the universe and the man who never lets you close. Burter cannot be hit while he is moving, and Jeice will not fire while Burter is on you — so the fight is about stopping one of them.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.landing, P.pair, P.down, P.alone, P.flight],
  };

  SL.data.missions[def.id] = def;
})();
