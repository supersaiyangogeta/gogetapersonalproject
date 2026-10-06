/*
 * WHAT IF · CHAPTER 3 — "What if Vegeta refused the moon?"   (NOT CANON)
 * Astra What-If Bible, Scenario 35 — S27: "Vegeta Refuses the Moon" (PROPOSED STORY DESIGN · MEDIUM).
 *
 * Branches from "The Saiyan Prince" at the Power Ball. In canon Vegeta throws it,
 * becomes a Great Ape and the fight turns into a monster hunt. Here the player *is*
 * Vegeta, and the divergence is his own: he crushes the ball in his fist rather than
 * win as an animal, and finishes an exhausted, base-form duel with his hands.
 *
 * Divergence → no artificial moon, no Great Ape. Consequence → a low-resource rematch
 * decided by a counter, not by a tail. Ending → the prince wins, Krillin and Gohan stop
 * him before the killing blow, and he leaves with the debt unpaid.
 *
 * Phases: REFUSE (checkpoint: crush the Power Ball) → DUEL (checkpoint: the exhausted
 * fight) → COUNTER (checkpoint: read his Kaioken rush and punish it) → AFTER.
 *
 * Saved on the separate What-If track (`whatIf`, `branchOf`); canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const ARENA = new V3(0, 0, 0);
  const DUEL_TARGET = 0.32; // drop Kakarot to this much health and he stops holding back
  const COUNTERS = 2; // clean counters needed to end it
  // what counts as "committed": anything he cannot take back once it has started
  const COMMITTED = ['attack', 'beamCharge', 'beamFire', 'blast', 'rush', 'throw'];

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
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
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

  /** The Power Ball: the same small white sphere the canon mission throws. */
  function powerBall(b, from) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xf4f4ff }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xdde6ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.setScalar(4);
    g.add(core, glow);
    g.position.copy(from);
    g.scale.setScalar(0.3);
    b.scene.add(g);
    return {
      group: g,
      dispose() {
        b.scene.remove(g);
        core.geometry.dispose();
        core.material.dispose();
        glow.material.dispose();
      },
    };
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, ARENA, 45);
    // the prince is the player here, and he has already spent most of himself
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, -12))), startKi: 45 });
    vegeta.hp = Math.round(vegeta.hpMax * 0.42);
    vegeta.lockedForms = { ssj: true }; // Namek is years away in any timeline
    vegeta.lockedSlots = { ultimate: true }; // Final Flash is not a Saiyan-saga technique
    const goku = b.spawn({ charId: 'goku', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, 12))), startKi: 40, tags: { boss: true, priority: true } });
    goku.hp = Math.round(goku.hpMax * 0.5);
    goku.controller = scripted();
    goku.cannotDie = true; // the allies stop the killing blow, not the health bar
    goku.lockedForms = { ssj: true };
    goku.formCaps = { kaioken: 1 };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, ARENA.clone().add(new V3(-38, 0, 34))), startKi: 40 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, ARENA.clone().add(new V3(-42, 0, 36))), startKi: 30 });
    for (const f of [krillin, gohan]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
      f.setHidden(true);
    }
    faceTo(vegeta, goku.pos);
    faceTo(goku, vegeta.pos);
    b.story = { vegeta, goku, krillin, gohan, ball: null };
  }

  const P = {};

  /*
   * THE REFUSAL. The ball is already in his hand — the canon beat, up to the moment he
   * would throw it. The player closes the fist instead, and has to keep closing it.
   */
  P.refuse = {
    id: 'refuse',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(v, { force: true });
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -12))), 0);
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 12))), Math.PI);
      faceTo(v, g.pos);
      faceTo(g, v.pos);
      v.setState('scripted', { pose: 'v_bigBangW', expression: 'angry' });
      g.setState('scripted', { pose: 'g_resolve', expression: 'hurt' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      m.music('battle', 5);
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(2.2, 0.4, 3)), v.chest(), U.lerp(42, 38, t)), 3, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', "You forced my hand, Kakarot. Behold... a Saiyan's true power!", 2.8);
      yield* m.cine(3);
      // the ball rises the way it always does
      const ball = powerBall(b, v.handPos('R'));
      S.ball = ball;
      let k = 0;
      const rise = () => {
        k++;
        const t = Math.min(1, k / 90);
        ball.group.position.copy(v.handPos('R')).add(new V3(0, U.easeOutCubic(t) * 6, 0));
        ball.group.scale.setScalar(0.3 + t * 2.2);
      };
      m.tickHooks.push(rise);
      b.sfx('kiBlastBig', v, { pitch: 0.6 });
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(-3.4, 0.6, 4.4)), ball.group.position, 50), 2.6, { cut: true, blendIn: 0, hold: true });
      m.say('goku', "That light — Vegeta, what is that?!", 2.2, { style: 'shout' });
      yield* m.cine(2.6);
      m.tickHooks.splice(m.tickHooks.indexOf(rise), 1);
      // and then he looks at it
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      m.shot((t, out) => {
        const c = v.chest().add(new V3(0, 0.5, 0));
        camAt(out, c.clone().addScaledVector(v.forward, U.lerp(2.6, 2.1, t)).add(new V3(0.6, 0.1, 0)), c, 36);
      }, 4, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'No. If that thing wins this, then the ape beat you — and I did not.', 3.8);
      yield* m.cine(4);
      // crushing it: the ball fights back, and the fist has to keep closing
      m.shot((t, out) => {
        // in close on the fist, from his own side, so the ball is between us and him
        const h = v.handPos('R');
        const side = new V3(-v.forward.z, 0, v.forward.x);
        camAt(out, h.clone().addScaledVector(side, 1.5).addScaledVector(v.forward, 0.9).add(new V3(0, 0.25, 0)), h, 40);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'v_galickCharge', expression: 'grit' });
      const res = yield* m.struggle({
        start: 0.3,
        drain: -0.03,
        duration: 4.4,
        label: 'CRUSH IT',
        canFail: false,
        keepInput: false,
        onTick: (t, grip) => {
          ball.group.position.copy(v.handPos('R'));
          ball.group.scale.setScalar(Math.max(0.12, 2.5 * (1 - grip)));
          b.cameraTraumaAt(v.handPos('R'), 0.02 + grip * 0.05);
          if (b.frame % 6 === 0) b.vfx.sparks(v.handPos('R'), 0xdde6ff, 4, 6);
        },
      });
      m.flags.crushAvg = Math.round(res.avg * 100) / 100;
      m.qteParts.push(U.clamp01(res.avg * 1.2));
      b.vfx.flash(v.handPos('R'), 2.4, 0xeef2ff, 0.35, SL.Toon.tex.glow);
      b.sfx('kiBlastBig', v, { pitch: 1.3, vol: 1.2 });
      b.cameraTraumaAt(v.handPos('R'), 0.6);
      ball.dispose();
      S.ball = null;
      m.flags.refusedMoon = true;
      m.endShot();
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, 2.6).add(new V3(0.7, 0.2, 0)), g.chest(), 40), 3, { cut: true, blendIn: 0, hold: true });
      m.say('goku', "You... threw away your own trump card?", 2.4);
      yield* m.cine(2.6);
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, 3).add(new V3(-0.8, 0.3, 0)), v.chest(), 40), 3.2, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'I am the prince of all Saiyans. I do not need a moon to beat a farmer.', 3.2);
      yield* m.cine(3.4);
      m.endShot();
    },
  };

  /* THE EXHAUSTED DUEL. No moon, no transformations, nothing left but what is in the arms. */
  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(v, { force: true });
      b.setParty([v]);
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -9))), 0);
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 9))), Math.PI);
      faceTo(v, g.pos);
      faceTo(g, v.pos);
      g.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      g.applyForm(0);
      g.target = v;
      v.target = g;
      // both of them are running on empty: everything lands, nothing lands hard
      v.damageDealtMul = 0.85;
      g.damageDealtMul = 0.8;
      g.aiRhythm = { burst: 100, rest: 70 };
      for (const f of [v, g]) f.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 4);
      m.objective('wear', 'Wear Kakarot down', { icon: 'fist', target: 100 });
      m.objective('feet', 'Beat him on your feet — no flying', { icon: 'guard', optional: true });
      let flew = 0;
      const hook = () => {
        if (b.inputLocked) return;
        const cut = 1 - DUEL_TARGET;
        const taken = U.clamp01((1 - g.hpFrac) / cut);
        m.progress('wear', Math.round(taken * 100));
        if (!v.grounded && v.pos.y - b.stage.heightAt(v.pos.x, v.pos.z) > 2.5) flew += 1 / 60;
      };
      m.tickHooks.push(hook);
      yield () => g.hpFrac <= DUEL_TARGET;
      m.tickHooks.splice(m.tickHooks.indexOf(hook), 1);
      m.complete('wear');
      if (flew < 1.5) m.complete('feet');
      else m.failObjective('feet');
      m.flags.flew = Math.round(flew);
      m.lock(true);
      g.controller = scripted();
      m.say('goku', "You are stronger than me... so I am going to have to break my own body to beat you.", 4, { style: 'shout' });
      yield 2.4;
    },
  };

  /*
   * THE COUNTER. Kakarot spends what is left on a Kaioken rush. A prince does not trade —
   * he waits for the commitment and puts an elbow through it.
   */
  P.counter = {
    id: 'counter',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(v, { force: true });
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -7))), 0);
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 7))), Math.PI);
      faceTo(v, g.pos);
      faceTo(g, v.pos);
      g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'shout' });
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, U.lerp(4, 3.2, t)).add(new V3(0, 0.6, 0)), g.chest(), 42), 2.6, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'KAIOKEN!', 1.6, { style: 'shout' });
      const kk = g.def.forms.findIndex((f) => f.id === 'kaioken');
      if (kk > 0) g.applyForm(kk);
      b.cameraTraumaAt(g.chest(), 0.5);
      yield* m.cine(2.6);
      m.endShot();
      g.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      g.storySpeed = 1.2;
      g.damageDealtMul = 0.9;
      // the Kaioken hurts, but the prince does not die at the end of his own What-If:
      // he can be worn down to a sliver and has to counter his way out of it
      v.damageTakenMul = 0.55;
      g.aiRhythm = { burst: 220, rest: 24 }; // he comes forward and keeps coming
      g.target = v;
      v.target = g;
      for (const f of [v, g]) f.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 4);
      m.objective('counter', 'Punish him mid-attack', { icon: 'fist', target: COUNTERS });
      m.objective('clean', 'Take nothing while you do it', { icon: 'guard', optional: true });
      let hits = 0, taken = 0, lastSwing = -999;
      m.tickHooks.push(() => {
        if (COMMITTED.includes(g.state)) lastSwing = b.frame;
      });
      const floor = () => {
        if (!b.inputLocked) v.hp = Math.max(v.hp, Math.round(v.hpMax * 0.1));
      };
      m.tickHooks.push(floor);
      const off = b.on('damage', (e) => {
        if (e.blocked) return;
        // a counter is a hit landed while Kakarot is committed — inside a swing or a beam,
        // or in the moment he is still recovering from one
        if (e.target === g && e.attacker === v && b.frame - lastSwing < 22) {
          hits++;
          m.progress('counter', Math.min(COUNTERS, hits));
          b.cameraTraumaAt(g.chest(), 0.45);
          SL.ScreenFX.flash(0.16, '#e6d0ff');
          if (hits === 1) m.say('vegeta', 'Too slow. You telegraph everything.', 2.2);
        } else if (e.target === v && e.attacker === g) taken++;
      });
      yield () => hits >= COUNTERS;
      off();
      m.tickHooks.splice(m.tickHooks.indexOf(floor), 1);
      v.damageTakenMul = 1;
      m.complete('counter');
      if (taken === 0) m.complete('clean');
      else m.failObjective('clean');
      m.flags.counters = hits;
      m.flags.counterClean = taken === 0;
      m.qteParts.push(U.clamp01(1 - taken * 0.12));
      // the finish: the Kaioken goes out and he goes down
      m.lock(true);
      clearCombat(b);
      g.controller = scripted();
      g.storySpeed = 1;
      g.applyForm(0);
      g.strain = 90;
      g.hp = Math.max(1, Math.round(g.hpMax * 0.04));
      place(g, ground(b, v.pos.clone().addScaledVector(v.forward, 4)), 0);
      faceTo(g, v.pos);
      g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      b.vfx.dust(g.pos, 3, 14);
      b.cameraTraumaAt(g.chest(), 0.8);
      b.sfx('punchHeavy', g, { vol: 1.3, pitch: 0.8 });
      m.flags.gokuDown = true;
      yield 1.2;
    },
  };

  /* THE DEBT. He won it with his hands, and they do not let him finish it. */
  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku, k = S.krillin, gh = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [v, g, k, gh]) f.controller = scripted();
      place(v, ground(b, ARENA.clone().add(new V3(0, 0, -3))), 0);
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 1))), 0);
      faceTo(v, g.pos);
      v.setState('scripted', { pose: 'v_chinUp', expression: 'angry' });
      g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      m.music('finale', 3);
      m.shot((t, out) => {
        const mid = v.chest().lerp(g.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(2.6, 1, 2.2)), mid, U.lerp(44, 40, t));
      }, 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'Look at you. No moon, no tricks — just a Saiyan who was always above you.', 3.6);
      yield* m.cine(3.6);
      // the allies arrive and stand in the way
      for (const f of [k, gh]) f.setHidden(false);
      place(k, ground(b, ARENA.clone().add(new V3(-2.4, 0, 3.4))), 0);
      place(gh, ground(b, ARENA.clone().add(new V3(2.4, 0, 3.6))), 0);
      faceTo(k, v.pos);
      faceTo(gh, v.pos);
      k.setState('scripted', { pose: 'guard', expression: 'grit' });
      gh.setState('scripted', { pose: 'guard', expression: 'angry' });
      b.vfx.dust(k.pos, 2, 8);
      b.vfx.dust(gh.pos, 2, 8);
      m.shot((t, out) => {
        // over the two of them, at Vegeta on the other side of the line they just drew
        const mid = k.chest().lerp(gh.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(0, 0.9, 3.2)), v.chest().clone().add(new V3(0, -0.2, 0)), 42);
      }, 3.6, { cut: true, blendIn: 0, hold: true });
      m.say('krillin', "That is far enough! You want him, you go through both of us!", 3.2, { style: 'shout' });
      yield* m.cine(3.4);
      m.say('kid_gohan', 'Leave my dad alone!', 1.8, { style: 'shout' });
      yield* m.cine(2);
      // he is too spent to take three, and he knows exactly what that is worth
      m.shot((t, out) => camAt(out, v.chest().clone().addScaledVector(v.forward, U.lerp(3.2, 2.6, t)).add(new V3(-0.7, 0.3, 0)), v.chest(), 38), 4, { cut: true, blendIn: 0, hold: true });
      v.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
      m.say('vegeta', m.flags.counterClean
        ? 'Three of you. And I can barely stand. ...Enjoy your rescue, Kakarot.'
        : 'Three of you, and I can barely lift my arms. ...Take him, then.', 4);
      yield* m.cine(4.2);
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(4, 2.4, -5)), v.chest().clone().add(new V3(0, 1, 6)), U.lerp(44, 52, t)), 4, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'I beat you today, and I did not get to finish it. That is a debt, Kakarot. I always collect.', 4.4);
      yield* m.cine(4.6);
      v.setState('scripted', { pose: 'flyUp', expression: 'angry' });
      b.vfx.dust(v.pos, 3, 12);
      b.sfx('powerUp', v, { vol: 1 });
      m.shot((t, out) => camAt(out, ARENA.clone().add(new V3(6, 3, 14)), ARENA.clone().add(new V3(0, U.lerp(2, 22, t), 0)), 50), 3, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(3);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('WHAT IF...?', 'THE PRINCE KEPT HIS PRIDE', 'No moon, no ape — and a debt nobody collected · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_prince',
    whatIf: true,
    branchOf: 'saiyan_vegeta',
    branchPoint: 'transform',
    chapter: 'WHAT IF · CHAPTER 3',
    title: 'What if Vegeta refused the moon?',
    subtitle: 'Earth · Age 762 · Alternate timeline',
    character: 'vegeta',
    stage: 'wasteland',
    parTime: 300,
    qteLabel: 'Crush the Power Ball',
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Play the prince. Crush the Power Ball in your own fist, and beat Kakarot with nothing but what is left in your arms.',
    rewards: ['An alternate ending: the prince kept his pride', 'Play the Saiyan Prince against Goku'],
    setup,
    phases: [P.refuse, P.duel, P.counter, P.after],
  };

  SL.data.missions[def.id] = def;
})();
