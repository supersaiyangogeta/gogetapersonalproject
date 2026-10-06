/*
 * CHAPTER 10 — BUU SAGA: MAJIN
 * Mission "Prince of Saiyans" (canon; played as Goku). Goku against Majin Vegeta.
 *
 * The owner's brief: one of the major fights of the game, treated as a premium fight — not
 * "reduce HP to zero". Two very strong men finally fighting without holding back, moving from
 * the ground to the air to a destroyed landscape, with the clothes, the land and the forms
 * changing because of what happens in it.
 *
 *   STANDOFF (scene)      the wastes, the wind, what each of them came for
 *   FIRST    (checkpoint) Super Saiyan against the Majin: outclassed on purpose. Vegeta trades
 *                         blows and takes them (armor on his heavies); Goku is being worn down
 *   ASCEND                "Still holding back?" — the player HOLDS Charge through Goku's first
 *                         Super Saiyan 2: the ground cracks, the sky goes, the lightning starts,
 *                         and then the form's own staged transformation (not a menu entry)
 *   CLASH    (checkpoint) Super Saiyan 2 against the Majin, even; the towers around them come
 *                         down; heavy blows past half tear clothes (damagePlan)
 *   FISTS    (scene)      the exchange: both charge, the fists meet, the land answers
 *   SKY      (checkpoint) it goes up; he climbs away and gathers a Galick Gun — answer it with a
 *                         Kamehameha (the beams meet, mash to push); win or lose, the light
 *                         takes the plateau
 *   RUIN     (checkpoint) the plateau after it (Stage.devastate): craters, towers down, smoke,
 *                         both of them in rags; Vegeta no longer defends at all
 *   SIPHON   (scene)      their energy leaving them for the horizon — and what it woke up
 *
 * Goku can be beaten from CLASH on (the mission fails and the checkpoint retries); nobody dies.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const HORIZON = new V3(120, 30, -420);
  const FIRST_SECONDS = 38;
  const CLASH_TO = 0.6;
  const RUIN_TO = 0.22;

  function setup(battle) {
    const b = battle;
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: K.ground(b, new V3(0, 0, 7)), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 1, pos: K.ground(b, new V3(0, 0, -7)), startKi: 120, tags: { boss: true, priority: true } });
    goku.lockedForms = { kaioken: true, ssj2: true };
    K.toForm(goku, 'ssj');
    vegeta.lockedForms = {};
    K.toForm(vegeta, 'majin');
    vegeta.controller = K.scripted();
    goku.target = vegeta;
    vegeta.target = goku;
    b.story = { goku, vegeta };
  }

  function stand(b, dist = 14) {
    const S = b.story;
    K.place(S.goku, K.ground(b, new V3(0, 0, dist / 2)), Math.PI);
    K.place(S.vegeta, K.ground(b, new V3(0, 0, -dist / 2)), 0);
    K.faceTo(S.goku, S.vegeta.pos);
    K.faceTo(S.vegeta, S.goku.pos);
  }

  /** Hand both of them to the fight: Goku to the player, Vegeta to the Majin's own CPU. */
  function fight(m, opts = {}) {
    const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
    if (b.player !== g) b.switchPlayer(g, { force: true });
    g.target = v;
    v.target = g;
    v.controller = new SL.AIController(b, { difficulty: 'hard', profile: opts.profile || null });
    g.setState('free');
    v.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  /** A mission hook that keeps his health above a floor (the story decides when he can be hurt more). */
  function floor(m, f, frac) {
    const hook = () => {
      if (f.hp < f.hpMax * frac) f.hp = f.hpMax * frac;
    };
    m.tickHooks.push(hook);
    return () => K.unhook(m, hook);
  }

  const P = {};

  P.standoff = {
    id: 'standoff',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      stand(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'pride_standoff');
    },
  };

  /** Outclassed: the Majin state is stronger than Super Saiyan, and he fights like it. */
  P.first = {
    id: 'first',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stand(b);
      K.toForm(g, 'ssj');
      g.lockedForms = { kaioken: true, ssj2: true };
      K.toForm(v, 'majin');
      g.setDamage(0);
      v.setDamage(0);
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 80);
      g.cannotDie = true;
      g.damageTakenMul = 1;
      g.damageDealtMul = 0.9;
      g.damagePlan = [{ level: 1, below: 0.8 }];
      v.hp = v.hpMax;
      v.cannotDie = true;
      v.damageDealtMul = 0.36;
      v.damagePlan = null;
      const offFloor = floor(m, v, 0.86);
      m.music('finale', 4);
      m.objective('read', 'Read the Majin', { icon: 'clock', target: FIRST_SECONDS });
      m.objective('hits', 'Land eight of your own', { icon: 'fist', optional: true, target: 8 });
      fight(m);
      let t = 0, hits = 0;
      const off = b.on('damage', (e) => {
        if (e.target === v && e.attacker === g && !e.blocked) m.progress('hits', ++hits);
      });
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('read', Math.min(FIRST_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      // the phase ends when he has seen enough — or when Goku is being taken apart
      yield () => t >= FIRST_SECONDS || g.hpFrac < 0.4;
      K.unhook(m, hook);
      off();
      offFloor();
      m.complete('read');
      if (hits < 8) m.failObjective('hits');
      m.flags.firstHits = hits;
      m.flags.firstSeconds = Math.round(t);
      m.qteParts.push(U.clamp01(g.hpFrac + 0.2));
    },
  };

  /** "Still holding back?" — and the player pushes him through it. */
  P.ascend = {
    id: 'ascend',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      v.controller = K.scripted();
      stand(b, 12);
      g.setState('scripted', { pose: 'exhausted', expression: 'grit' });
      v.setState('scripted', { pose: 'v_majinStance', expression: 'grin' });
      m.shot((t, out) => K.camAt(out, v.chest().clone().addScaledVector(v.forward, 2.4).add(new V3(0.7, 0.1, 0)), v.chest().add(new V3(0, 0.5, 0)), 38), 3, { cut: true, blendIn: 0 });
      m.say('vegeta', 'Still holding back, Kakarot?! Show me! Show me what you have been hiding!', 3, { style: 'shout' });
      yield* m.cine(3.1);
      m.endShot();
      g.hp = Math.max(g.hp, g.hpMax * 0.6);
      m.objective('ascend', 'Go further', { icon: 'transform' });
      // over his shoulder while he gathers it, so the ground and the sky are in the shot
      m.shot((t, out) => {
        const c = g.chest();
        const toV = v.pos.clone().sub(g.pos).setY(0).normalize();
        const side = new V3(-toV.z, 0, toV.x);
        K.camAt(out, c.clone().addScaledVector(toV, 4.2).addScaledVector(side, 1.6).add(new V3(0, -0.4, 0)), c.clone().add(new V3(0, 0.3, 0)), 50);
      }, 60, { cut: true, blendIn: 0 });
      yield* SL.data.cinematics.ascend(m, {
        fighter: g,
        form: 'ssj2',
        witness: v,
        seconds: 4.5,
        label: 'Hold to go further',
        meter: 'SUPER SAIYAN 2',
        line: 'goku_ssj2',
        music: 6,
        beats: [
          { at: 0.25, run: () => b.stage.setMood(0.45, 0x0e1020, 1.2) },
          { at: 0.5, run: () => { b.stage.crater(g.pos, 5, 0.5, null); b.sfx('rumble', g, { vol: 0.9 }); } },
          { at: 0.75, run: () => { b.vfx.skyBolt(g.pos.clone().add(new V3(3, 0, 2)), 40); b.stage.setMood(0.7, 0x06060e, 0.8); } },
        ],
        onReady: () => m.endShot(),
      });
      m.complete('ascend');
      g.lockedForms = { kaioken: true };
      yield* SL.Cinema.play(m, 'pride_ssj2');
    },
  };

  /** Even. The land around them pays for it. */
  P.clash = {
    id: 'clash',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stand(b);
      K.toForm(g, 'ssj2');
      g.lockedForms = { kaioken: true };
      K.toForm(v, 'majin');
      if ((g.damageLevel || 0) < 1) g.setDamage(1);
      g.hp = Math.max(g.hp, g.hpMax * 0.75);
      g.ki = Math.max(g.ki, 70);
      g.cannotDie = false;
      g.damageDealtMul = 1.05;
      g.damageTakenMul = 0.9;
      g.damagePlan = [{ level: 2, below: 0.5 }];
      v.hp = Math.max(v.hp, v.hpMax * 0.86);
      v.cannotDie = true;
      v.damageDealtMul = 0.55;
      v.damagePlan = [{ level: 1, below: 0.8 }, { level: 2, below: 0.68 }];
      m.music('finale', 6);
      m.objective('clash', 'Match him blow for blow', { icon: 'fist', target: Math.round((1 - CLASH_TO) * 100) });
      m.objective('towers', 'Bring the towers down around you', { icon: 'target', optional: true, target: 3 });
      const start = v.hp;
      let towers = 0;
      const offT = b.on('obstacleDestroyed', (e) => {
        if (!e.quiet) m.progress('towers', ++towers);
      });
      fight(m);
      const hook = () => {
        m.progress('clash', Math.max(0, Math.round(((start - v.hp) / v.hpMax) * 100)));
      };
      m.tickHooks.push(hook);
      yield () => v.hpFrac <= CLASH_TO;
      K.unhook(m, hook);
      offT();
      m.complete('clash');
      m.flags.towers = towers;
      m.qteParts.push(U.clamp01(g.hpFrac + 0.1));
      // the exchange: both of them pulled to their marks, and the fists meet in the middle
      m.lock(true);
      K.clearCombat(b);
      v.controller = K.scripted();
      const mid = g.pos.clone().lerp(v.pos, 0.5);
      mid.y = b.stage.heightAt(mid.x, mid.z);
      const dir = g.pos.clone().sub(v.pos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
      dir.normalize();
      K.place(g, K.ground(b, mid.clone().addScaledVector(dir, 7)));
      K.place(v, K.ground(b, mid.clone().addScaledVector(dir, -7)));
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      m.flags.fistPoint = mid;
      m.flags.fistFromG = g.pos.clone();
      m.flags.fistFromV = v.pos.clone();
      yield* SL.Cinema.play(m, 'pride_fists');
    },
  };

  /**
   * Up. He climbs away and gathers a Galick Gun; the Kamehameha is the only answer. Answer it and
   * the beams meet (mash to push); miss the moment and it lands on you. Either way, what the two
   * of them let go of in that sky is what the plateau becomes.
   */
  P.sky = {
    id: 'sky',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.toForm(g, 'ssj2');
      K.toForm(v, 'majin');
      if ((g.damageLevel || 0) < 2) g.setDamage(2);
      if ((v.damageLevel || 0) < 2) v.setDamage(2);
      g.hp = Math.max(g.hp, g.hpMax * 0.6);
      g.ki = 100;
      // the Galick Gun is a story beat: it can hurt him badly, it cannot end the fight
      g.cannotDie = true;
      v.damageDealtMul = 0.55;
      v.hp = Math.min(Math.max(v.hp, v.hpMax * 0.5), v.hpMax * CLASH_TO);
      v.cannotDie = true;
      g.damagePlan = null;
      v.damagePlan = null;
      K.hover(b, g, new V3(0, 0, 6), 16);
      K.hover(b, v, new V3(0, 0, -6), 18);
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      m.music('finale', 6);
      m.objective('sky', 'Take it to the sky', { icon: 'fist', target: 12 });
      fight(m);
      const start = v.hp;
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('sky', Math.min(12, Math.max(0, Math.round(((start - v.hp) / v.hpMax) * 100))));
      };
      m.tickHooks.push(hook);
      yield () => t >= 22 || start - v.hp >= v.hpMax * 0.12;
      K.unhook(m, hook);
      m.complete('sky');
      // he breaks off and climbs: the Galick Gun
      m.lock(true);
      K.clearCombat(b);
      v.controller = K.scripted();
      const up = g.pos.clone().add(new V3(0, 5, 0)).addScaledVector(v.pos.clone().sub(g.pos).setY(0).normalize(), 24);
      v.setPosition(up);
      v.grounded = false;
      K.faceTo(v, g.pos);
      K.faceTo(g, v.pos);
      g.setState('scripted', { pose: 'flyIdle', expression: 'grit' });
      yield* SL.Cinema.play(m, 'pride_galick');
      v.setState('scripted', { pose: 'v_galickCharge', expression: 'shout' });
      b.clash.maxSeconds = 9;
      g.lockedSlots = { special2: true, ultimate: true, transform: true };
      m.objective('answer', 'Answer the Galick Gun with a Kamehameha', { icon: 'beam' });
      m.prompt('prideKame', 'special1', 'Kamehameha', { required: true, when: () => g.state === 'free', always: true });
      fight(m);
      v.controller = K.scripted();
      v.setState('scripted', { pose: 'v_galickCharge', expression: 'shout' });
      let fired = false, waited = 0, result = null;
      const loop = b.chargeLoop ? b.chargeLoop('beamCharge', v, { timbre: 'galick' }, 'beam') : null;
      const offE = b.on('clashEnd', (e) => {
        result = e.winner === g ? 'won' : e.winner === v ? 'lost' : 'draw';
      });
      const spec = v.resolveSpec(v.specFor('special1'));
      const fire = () => {
        fired = true;
        if (loop && loop.stop) loop.stop(0.2);
        v.target = g;
        v.setState('scripted', { pose: 'v_galickFire', expression: 'shout' });
        b.projectiles.spawnBeam(v, spec, 1);
        b.sfx('beamFire', v);
      };
      const hook2 = () => {
        if (b.inputLocked && !b.clash.active) return;
        waited += 1 / 60;
        if (b.frame % 3 === 0) b.vfx.streamInward(v.handPos('R'), 2.6, 0xd070ff, 2, 0.16, 0.35);
        // his Galick answers the moment Goku's beam leaves: they meet in the middle
        if (!fired && (b.projectiles.beams.some((bm) => bm.owner === g && !bm.done) || waited >= 7)) fire();
      };
      m.tickHooks.push(hook2);
      yield () => result !== null || (fired && !b.clash.active && waited > 9.5);
      K.unhook(m, hook2);
      offE();
      if (loop && loop.stop) loop.stop(0.2);
      m.flags.galick = result || 'hit';
      if (result === 'won') m.complete('answer');
      else m.failObjective('answer');
      b.clash.maxSeconds = 7;
      g.lockedSlots = {};
      m.qteParts.push(result === 'won' ? 1 : 0.3);
      yield 0.6;
      m.lock(true);
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'pride_blast');
    },
  };

  /** What is left of the plateau, and the last of the fight. */
  P.ruin = {
    id: 'ruin',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (!b.stage.devastated) b.stage.devastate(new V3(0, 0, 0), { radius: 70, craters: 10, slabs: 18, vents: 7, scorch: 0.45 });
      stand(b, 12);
      K.toForm(g, 'ssj2');
      K.toForm(v, 'majin');
      g.setDamage(Math.max(2, g.damageLevel || 0));
      v.setDamage(Math.max(2, v.damageLevel || 0));
      g.hp = Math.max(g.hp, g.hpMax * 0.7);
      g.ki = Math.max(g.ki, 60);
      g.cannotDie = false;
      g.damageDealtMul = 1.15;
      g.damagePlan = [{ level: 3, below: 0.4 }];
      v.hp = Math.min(v.hp, v.hpMax * 0.48);
      v.hp = Math.max(v.hp, v.hpMax * 0.4);
      v.cannotDie = true;
      v.damageDealtMul = 0.45;
      v.damagePlan = [{ level: 3, below: 0.34 }];
      b.stage.clearMood(1.5);
      m.fade('clear', 1);
      m.shot((t, out) => K.camAt(out, new V3(U.lerp(30, 20, t), U.lerp(14, 8, t), U.lerp(18, 12, t)), new V3(0, 1.5, 0), 44), 3.2, { cut: true, blendIn: 0 });
      m.say('goku', "Look at this place... we did all this.", 3, { style: 'quiet' });
      yield* m.cine(3.2);
      m.endShot();
      m.music('finale', 6);
      m.objective('ruin', 'Bring him down', { icon: 'fist', target: Math.round((1 - RUIN_TO) * 100) });
      // nothing held back on either side: he stops defending entirely
      fight(m, { profile: { aggression: 1, defense: 0.08 } });
      const hook = () => m.progress('ruin', Math.round((1 - v.hpFrac) * 100));
      m.tickHooks.push(hook);
      yield () => v.hpFrac <= RUIN_TO;
      K.unhook(m, hook);
      m.complete('ruin');
      m.qteParts.push(U.clamp01(g.hpFrac + 0.2));
    },
  };

  P.siphon = {
    id: 'siphon',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      v.controller = K.scripted();
      stand(b, 10);
      m.flags.horizon = HORIZON;
      yield* SL.Cinema.play(m, 'pride_siphon');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'PRINCE OF SAIYANS', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_pride',
    canon: true,
    chapter: 'CHAPTER 10 · BUU SAGA',
    title: 'Prince of Saiyans',
    subtitle: 'Earth · Age 774 · the fight he paid for',
    character: 'goku',
    stage: 'majin_wastes',
    parTime: 420,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'No ring, no rules, no crowd. Goku stops holding back, and the land around them does not survive it.',
    rewards: ['Goku: Super Saiyan 2', 'Super Saiyan 2 in Free Battle'],
    setup,
    phases: [P.standoff, P.first, P.ascend, P.clash, P.sky, P.ruin, P.siphon],
  };

  SL.data.missions[def.id] = def;
})();
