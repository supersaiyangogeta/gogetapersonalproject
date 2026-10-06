/*
 * CHAPTER 8 — BUU SAGA: THE TOURNAMENT (Age 774)
 * Mission "Junior Division" (canon, played as Kid Trunks).
 *
 * The first thing the World Tournament system is used for. A real draw
 * (SL.Tournament.bracket), real matches under tournament rules — ring-outs end
 * them, knockouts end them — an announcer calling every one, a stadium that
 * reacts, and the bracket card on screen while the matches are called.
 *
 * Phases: OPEN (scene `junior_open`: the stadium; Goku back for one day, and the son he has
 * never met hiding behind his mother) → ROUND1 (checkpoint: Trunks vs Idasa) → ROUND1B (Goten
 * vs Ikose, watched: two CPU fighters under the same rules) → FINAL (checkpoint: the pact — no
 * Super Saiyan, and Trunks fights with one hand behind his back — then the first stretch) →
 * HOLD (the sleeper hold: keep it locked; Goten breaks it the only way he has left, and Trunks
 * answers in gold) → GOLD (checkpoint: Super Saiyan against Super Saiyan, still one-handed) →
 * FINISH (Goten comes in for the last time; the second hand comes out; the ki burst that rings
 * him out) → EXHIBITION (checkpoint: the junior champion against the World Champion) → AFTER.
 *
 * The final is the canon junior final played, not described: two very talented children, a
 * rivalry with rules they made up themselves, and both of them breaking those rules. The
 * pauses between its stretches are the story's, not the match's: SL.Tournament.match returns a
 * `pause` result that ends a stretch without ending the match.
 *
 * Canon note: Trunks wins the junior division, which is why the player is Trunks. Losing a
 * match here (or being rung out) fails the mission and retries from its checkpoint.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const T = () => SL.Tournament;

  const ENTRANTS = ['kid_trunks', 'idasa', 'goten', 'ikose'];
  const SHOW_SECONDS = 15;
  // the final, in stretches (tuning knobs)
  const FINAL = {
    holdAt: 0.55, // Goten's health when Trunks goes for the sleeper hold...
    baseSeconds: 45, // ...or after this long, whichever comes first
    goldLoss: 0.26, // Goten comes in for the last time once gold-against-gold has cost him this much...
    goldFloor: 0.12, // (never asked to go lower than this)
    goldSeconds: 40, // ...or after this long
    holdDrain: 0.00028, // what a locked hold takes out of him per frame (grip 1)
    holdFloor: 0.38,
    loseAt: 0.15, // Trunks this low: Goten wins the division (the mission fails)
    oneArmMul: 0.85, // Trunks' damage with one hand behind his back
    gotenMul: 0.6, // a year younger (and holding back too): close, and Trunks' to win
    holdSeconds: 6.5,
  };
  // the left arm behind the back, the hand open against the spine (SL.Animator override layer)
  // (found by measuring the hand on the built body: behind the lower back, at the spine, the elbow out behind)
  const ONE_ARM = { shoulderL: [60, -60, 20], elbowL: [-60, 0, 0], handL: [0, 0, 0], hands: ['open', null] };
  const BASE_AI = { aggression: 0.66, defense: 0.5, ranged: 0.3, beam: 0.25, transformHp: 0, preferredRange: 2.4 };
  const GOLD_AI = { aggression: 0.78, defense: 0.45, ranged: 0.35, beam: 0.3, transformHp: 0, preferredRange: 2.2 };
  const scripted = () => ({ update: () => SL.emptyIntent() });

  function place(f, pos, yaw) {
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
  }
  const yard = (b, x, z) => new V3(x, b.stage.heightAt(x, z), z);
  const ring = (b, x, z) => new V3(x, b.stage.arena.y, z);

  /** Everybody not in the current match waits at the ring's edge, out of it. */
  function benches(b, active) {
    const S = b.story;
    const spots = { trunks: [-15, 8], goten: [-15, 5], idasa: [15, -8], ikose: [15, -5], satan: [16, 9], goku: [-3, -26], chichi: [-5.5, -26.5] };
    for (const k of Object.keys(spots)) {
      const f = S[k];
      if (!f || active.includes(f)) continue;
      f.controller = scripted();
      f.untargetable = true;
      f.setHidden(k === 'satan' ? !S.satanOut : k === 'goku' || k === 'chichi' ? !S.gokuOut : false);
      place(f, yard(b, spots[k][0], spots[k][1]), Math.atan2(-spots[k][0], -spots[k][1]));
      f.setState('scripted', { pose: k === 'satan' ? 'ms_idle' : k === 'chichi' ? 'cc_idle' : 'idle', expression: 'calm' });
    }
  }

  /** The bracket as it stands when a stretch begins — rebuilt the same way from a checkpoint. */
  function draw(m, upTo) {
    const B = T().bracket(ENTRANTS);
    const results = [['kid_trunks', 'ringout'], ['goten', 'ringout'], ['kid_trunks', 'ko']];
    for (let i = 0; i < upTo; i++) B.report(results[i][0], m.flags['r' + i] || results[i][1]);
    m.battle.story.bracket = B;
    return B;
  }

  /** Trunks' handicap: the left hand behind his back is a real rule, on the body and in the numbers. */
  function oneArm(f, on) {
    f.anim.override = on ? ONE_ARM : null;
    f.oneArmed = !!on;
    f.damageDealtMul = on ? FINAL.oneArmMul : 1;
  }

  /** Goten is never rung out before the finish: knocked off the ring, he is back on it (he flies). */
  function keepIn(b, f) {
    const A = b.stage.arena, lim = A.half - 0.6;
    if (f.grounded && (Math.abs(f.pos.x) > lim || Math.abs(f.pos.z) > lim)) f.setPosition(new V3(U.clamp(f.pos.x, -lim, lim), Math.max(f.pos.y, A.y), U.clamp(f.pos.z, -lim, lim)));
  }

  function setup(battle) {
    const b = battle;
    const spawn = (charId, x, z, extra = {}) => {
      const f = b.spawn(Object.assign({ charId, team: 0, pos: yard(b, x, z), startKi: 50 }, extra));
      f.cannotDie = true;
      return f;
    };
    const trunks = spawn('kid_trunks', 0, 5, { player: true });
    const goten = spawn('goten', -15, 5, { team: 1 });
    const idasa = spawn('idasa', 15, -8, { team: 1 });
    const ikose = spawn('ikose', 15, -5, { team: 0 });
    const satan = spawn('mr_satan', 16, 9, { team: 1 });
    const goku = spawn('goku', -3, -26);
    const chichi = spawn('chichi', -5.5, -26.5);
    for (const f of [goten, idasa, ikose, satan, goku, chichi]) {
      f.controller = scripted();
      f.untargetable = true;
    }
    satan.setHidden(true);
    goku.setHidden(true);
    chichi.setHidden(true);
    b.story = { trunks, goten, idasa, ikose, satan, goku, chichi };
  }

  /** One of the junior matches, played through the tournament system. */
  function* play(m, a, c, opts) {
    const b = m.battle, B = b.story.bracket;
    benches(b, [a, c]);
    if (opts.intro !== false) T().showBracket(m, B);
    const r = yield* T().match(m, Object.assign({ a, b: c, onStart: () => T().hideBracket() }, opts));
    T().hideBracket();
    return r;
  }

  /** The two finalists on the ring for a stretch that picks up where the story left them. */
  function finalists(b, restage) {
    const S = b.story, t = S.trunks, g = S.goten;
    benches(b, [t, g]);
    for (const f of [t, g]) {
      f.setHidden(false);
      f.untargetable = false;
    }
    if (restage) {
      place(t, ring(b, 0, 3), Math.PI);
      place(g, ring(b, 0, -3), 0);
    }
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of b.fighters) f.controller = scripted();
      S.gokuOut = true;
      benches(b, []);
      // at the gate: Goku, Chi-Chi, and a boy who has only ever seen his father in a photograph
      place(S.goku, yard(b, -4, -19.5), 0);
      place(S.chichi, yard(b, -3.2, -16.4), Math.PI);
      place(S.goten, yard(b, -2.9, -15.85), Math.PI);
      place(S.trunks, yard(b, -7, -16), Math.PI * 0.8);
      yield* SL.Cinema.play(m, 'junior_open');
      S.gokuOut = false;
    },
  };

  P.round1 = {
    id: 'round1',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.clearObjectives();
      draw(m, 0);
      m.objective('win1', 'Win your first match', { icon: 'fist', target: 1 });
      m.objective('out1', 'Win it by ring-out', { icon: 'target', optional: true });
      m.prompt('ringOut', 'heavy', 'Knock him off the ring', { when: () => !b.inputLocked, always: true });
      const r = yield* play(m, S.trunks, S.idasa, { player: S.trunks, round: 'Junior division, round one', difficulty: 'easy' });
      if (r.winner !== S.trunks) return m.fail('Trunks lost to Idasa');
      S.bracket.report('kid_trunks', r.how);
      m.flags.r0 = r.how;
      m.complete('win1');
      if (r.how === 'ringout') m.complete('out1');
      else m.failObjective('out1');
      yield 0.4;
    },
  };

  /** Goten's first match, watched from the ring's edge: two CPU fighters, the same rules. */
  P.round1b = {
    id: 'round1b',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.clearObjectives();
      if (!S.bracket || S.bracket.rounds[0][0].winner !== 'kid_trunks') draw(m, 1);
      const watch = () => {
        m.shot((t, out, el) => {
          const a = S.goten.chest(), c = S.ikose.chest();
          const mid = a.clone().lerp(c, 0.5);
          const ang = 0.6 + el * 0.12;
          out.pos.set(mid.x + Math.sin(ang) * 11, mid.y + 3.2, mid.z + Math.cos(ang) * 11);
          out.look.copy(mid);
          out.fov = 46;
        }, 999, { hold: true, blendIn: 0.3 });
      };
      const r = yield* play(m, S.goten, S.ikose, { round: 'Round one', judges: 30, difficulty: 'normal', onStart: () => { T().hideBracket(); watch(); } });
      // the story's result stands whatever two CPU children do: Goten goes through
      S.bracket.report('goten', r.winner === S.goten ? r.how : 'decision');
      m.flags.r1 = r.winner === S.goten ? r.how : 'decision';
      m.endShot();
      yield 0.4;
    },
  };

  /** A stretch of the final. Returns 'fail' (Goten won, or Trunks went out) or 'on' (the story takes over). */
  function* stretch(m, opts) {
    const b = m.battle, S = b.story, t = S.trunks, g = S.goten;
    const r = yield* play(m, t, g, Object.assign({
      player: t, difficulty: 'normal', ringOut: [t], intro: false, begin: false, fresh: false, keepPlaces: true,
      during: (mm, frames) => {
        keepIn(b, g);
        if (t.hpFrac <= FINAL.loseAt) return { winner: g, loser: t, how: 'ko' };
        if (g.hpFrac <= opts.until || frames >= opts.seconds * 60) return { winner: t, loser: g, how: 'story', pause: true };
        return null;
      },
    }, opts.match || {}));
    if (r.pause) return 'on';
    m.fail(r.how === 'ringout' ? 'Trunks was rung out of the final' : 'Goten won the junior division');
    return 'fail';
  }

  /**
   * THE FINAL, first stretch. The two of them agree on the ring: no Super Saiyan — and Trunks,
   * who is a year older and will not let anybody forget it, puts one hand behind his back.
   */
  P.final = {
    id: 'final',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, g = S.goten;
      m.clearObjectives();
      if (!S.bracket || !S.bracket.rounds[1]) draw(m, 2);
      for (const f of [t, g]) {
        if (f.formIndex !== 0) f.applyForm(0);
        f.lockedForms = { ssj: true }; // the pact
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, f.kiMax * 0.5);
        f.stamina = f.staminaMax;
      }
      oneArm(t, false);
      g.damageDealtMul = FINAL.gotenMul;
      finalists(b, true);
      T().showBracket(m, S.bracket);
      yield* T().announce(m, 'intro', { a: t, b: g, round: 'The junior final' });
      T().hideBracket();
      yield* SL.Cinema.play(m, 'junior_pact');
      m.objective('win2', 'Win the junior division', { icon: 'fist', target: 1 });
      m.objective('holdTight', 'Keep the sleeper hold locked on', { icon: 'guard', optional: true });
      m.objective('clean', 'Win the final with more than half your health', { icon: 'potential', optional: true });
      finalists(b, false);
      // "Begin!" — a real match, under the ring-out rule for Trunks
      const res = yield* stretch(m, { until: FINAL.holdAt, seconds: FINAL.baseSeconds, match: { begin: true, ai: BASE_AI } });
      if (res === 'fail') return;
      m.flags.finalBase = Math.round(g.hpFrac * 100) / 100;
    },
  };

  /**
   * THE SLEEPER HOLD. Goten over-commits; Trunks is behind him (the one button the story waits
   * on), and then it is a struggle: keep the arm locked. Goten gets out the only way he has left
   * — gold — and the pact is over. Trunks answers the same way (the player transforms).
   */
  P.hold = {
    id: 'hold',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, g = S.goten;
      const K = SL.data.buuKit;
      m.lock(true);
      K.clearCombat(b);
      // a cut to a new shot: the fight's lingering dust does not come with it
      if (b.vfx.smoke) b.vfx.smoke.clear();
      // Goten comes in wide open
      const mid = t.pos.clone().lerp(g.pos, 0.5);
      const A = b.stage.arena, lim = A.half - 3;
      mid.set(U.clamp(mid.x, -lim, lim), A.y, U.clamp(mid.z, -lim, lim));
      place(t, ring(b, mid.x, mid.z + 1.6), Math.PI);
      place(g, ring(b, mid.x, mid.z - 1.6), 0);
      t.setState('scripted', { pose: 'kt_idle', expression: 'calm' });
      g.setState('scripted', { pose: 'gt_rush', expression: 'grin', speed: 14 });
      m.shot((tt, out) => {
        const c = t.chest().lerp(g.chest(), 0.5);
        out.pos.set(c.x + 4.2 - tt * 0.8, c.y + 0.5, c.z + 0.6);
        out.look.copy(c);
        out.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const cue = yield* m.cue('heavy', 'Sleeper hold', { slow: 0.25, auto: 4 });
      m.flags.holdCue = cue.pressed;
      // a blink: he is behind him, the arm round his neck
      b.vfx.flash(t.chest(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
      b.sfx('vanish', t);
      const behind = g.pos.clone().addScaledVector(g.forward, -0.42);
      // chest to back: no fighter push-apart while the arm is round his neck
      t.intangible = g.intangible = true;
      place(t, ring(b, behind.x, behind.z), g.yaw);
      t.setState('scripted', { pose: 'kt_sleeper', expression: 'grin', speed: 30 });
      g.setState('scripted', { pose: 'gt_choked', expression: 'hurt', speed: 20 });
      b.sfx('block', t, { pitch: 0.7 });
      b.stage.gasp && b.stage.gasp(0.6);
      m.shot((tt, out) => {
        const c = g.chest();
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(c).addScaledVector(g.forward, 1.9).addScaledVector(side, 0.9).add(new V3(0, 0.1, 0));
        out.look.copy(c).add(new V3(0, 0.12, 0));
        out.fov = 40;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('kid_trunks', 'Give up, Goten! Say it!', 2.4);
      const hpStart = g.hp;
      let flick = 0;
      const res = yield* m.struggle({
        start: 0.62, drain: 0.34, duration: FINAL.holdSeconds, label: 'HOLD', keepInput: false,
        until: (tt, grip) => grip <= 0.02,
        onTick: (tt, grip) => {
          // the tighter the hold, the more it takes out of him (at most about a tenth of him)
          g.hp = Math.max(g.hpMax * FINAL.holdFloor, g.hp - g.hpMax * FINAL.holdDrain * grip);
          // and the gold is coming: it flickers in his hair before it arrives
          if (tt > FINAL.holdSeconds * 0.55 && b.frame % 14 === 0) {
            flick++;
            b.vfx.sparks(g.chest().add(new V3(0, 0.3, 0)), 0xffe060, 8, 5, 0.08);
            b.vfx.flash(g.chest(), 1.2, 0xffd33a, 0.12, SL.Toon.tex.glow);
          }
          if (b.frame % 30 === 0) b.cameraTraumaAt(g.chest(), 0.12);
        },
      });
      m.flags.holdGrip = Math.round(res.avg * 100) / 100;
      m.flags.holdDamage = Math.round(hpStart - g.hp);
      m.qteParts.push(U.clamp01(res.avg));
      if (res.avg >= 0.55) m.complete('holdTight');
      else m.failObjective('holdTight');
      m.endShot();
      // he breaks it the only way he has left
      yield* SL.Cinema.play(m, 'junior_breakfree');
      t.intangible = g.intangible = false;
      // Trunks answers in gold: the pact is over for him too
      t.setState('free');
      m.teach(t, 'form:ssj');
      const lim2 = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim2.transform;
      m.limits(lim2);
      b.inputLocked = false;
      b.aiLocked = true;
      m.prompt('answer', 'transform', 'Transform', { required: true, when: () => t.formIndex === 0 && t.state === 'free', always: true });
      yield () => t.formIndex > 0 && t.state !== 'transform';
      m.limits(null);
      m.lock(true);
      m.flags.bothGold = true;
      yield* T().announce(m, 'gold', { line: 'Both of them — golden hair?! Folks, this is the JUNIOR division!' });
    },
  };

  /** THE FINAL, second stretch: gold against gold, and he still has one hand behind his back. */
  P.gold = {
    id: 'gold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, g = S.goten;
      const K = SL.data.buuKit;
      m.clearObjectives();
      // entered from the checkpoint: the draw, both golden, the hand still behind his back
      if (!S.bracket || !S.bracket.rounds[1]) draw(m, 2);
      if (!m.flags.bothGold) {
        for (const f of [t, g]) {
          K.toForm(f, 'ssj');
          f.hp = f.hpMax * (f === g ? FINAL.holdAt - 0.1 : 0.8);
          f.ki = f.kiMax * 0.6;
        }
        finalists(b, true);
        m.flags.bothGold = true;
      }
      oneArm(t, true);
      g.damageDealtMul = FINAL.gotenMul;
      m.objective('win2', 'Win the junior division', { icon: 'fist', target: 1 });
      m.objective('clean', 'Win the final with more than half your health', { icon: 'potential', optional: true });
      finalists(b, false);
      const res = yield* stretch(m, { until: Math.max(FINAL.goldFloor, g.hpFrac - FINAL.goldLoss), seconds: FINAL.goldSeconds, match: { ai: GOLD_AI } });
      if (res === 'fail') return;
      m.flags.finalGold = Math.round(g.hpFrac * 100) / 100;
    },
  };

  /**
   * THE FINISH. Goten comes in for the last time. The second hand comes out from behind Trunks'
   * back (the button), a burst from the open palm at arm's length, and Goten goes over the edge —
   * a ring-out the engine calls, not the script.
   */
  P.finish = {
    id: 'finish',
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks, g = S.goten, A = b.stage.arena;
      const K = SL.data.buuKit;
      m.lock(true);
      K.clearCombat(b);
      if (b.vfx.smoke) b.vfx.smoke.clear();
      for (const f of [t, g]) f.vel.set(0, 0, 0);
      // square to the nearest edge: Trunks in the middle, Goten between him and the drop
      const zT = A.half * 0.1, zG = A.half * 0.62;
      place(t, ring(b, 0, zT), 0);
      place(g, ring(b, 0, zG), Math.PI);
      t.setState('scripted', { pose: 'kt_smug', expression: 'grin' });
      g.setState('scripted', { pose: 'gt_idle', expression: 'angry' });
      m.shot((tt, out) => {
        const c = t.chest();
        out.pos.set(c.x + 1.6, c.y + 0.35, c.z - 2.6);
        out.look.copy(g.chest());
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('goten', 'Here I come — this time for real!', 2.2, { style: 'shout' });
      yield* m.cine(1.1);
      // he comes in; the world slows; the hand comes out
      g.setState('scripted', { pose: 'gt_rush', expression: 'shout', speed: 16 });
      const from = g.pos.clone(), to = ring(b, 0, zT + 1.3);
      let k = 0;
      const run = () => {
        k = Math.min(1, k + 1 / 26);
        g.setPosition(from.clone().lerp(to, k));
        g.prevPos && g.prevPos.copy(g.pos);
      };
      m.tickHooks.push(run);
      yield () => k >= 0.8;
      K.unhook(m, run);
      oneArm(t, false);
      t.setState('scripted', { pose: 'kt_twoHands', expression: 'shout', speed: 18 });
      const cue = yield* m.cue('blast', 'Second hand', { slow: 0.18, auto: 3 });
      m.flags.secondHand = cue.pressed;
      // the burst: point blank, from the hand that was not supposed to be there
      t.setState('scripted', { pose: 'blastL', expression: 'shout', speed: 30 });
      const palm = t.handPos('L');
      b.vfx.flash(palm, 2.6, 0xffe25a, 0.3, SL.Toon.tex.glow);
      b.vfx.explosion(g.chest(), 2.2, 0xffe25a, { smoke: false });
      b.sfx('kiBlastBig', t, { pitch: 1.2 });
      b.cameraTraumaAt(g.chest(), 0.5);
      g.setState('free');
      // the ring decides it, not a knockout: he always has enough left to be thrown rather than dropped
      g.hp = Math.max(g.hp, g.hpMax * 0.12);
      // flat and long: he is still tumbling when he comes down on the grass (a knockback that ended
      // in the air would let him recover into flight, and flying outside the ring is not out)
      const dir = new V3(0, -0.04, 1).normalize();
      g.takeHit(t, { type: 'ki', damage: 300, knock: 'heavy', knockSpeed: 16, impact: 3, hitstun: 150, dir, pose: 'hitHeavy', name: 'Second Hand' });
      b.emit('secondHand', { fighter: t, target: g });
      // the engine calls it: no controls for anybody, the ring-out rule on for Goten only
      m.limits(Object.assign({}, SL.Mission.ALL_OFF));
      m.shot((tt, out) => {
        const c = g.chest();
        out.pos.set(c.x + 5.5, A.y + 2.6, U.lerp(zT, A.half, 0.5) + 1);
        out.look.copy(c);
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const r = yield* T().match(m, {
        a: t, b: g, player: t, intro: false, begin: false, fresh: false, keepPlaces: true, keepStates: true, ringOut: [g], ai: GOLD_AI,
        onStart: () => (b.aiLocked = true),
        during: (mm, frames) => {
          b.aiLocked = true;
          // a safety net for a flight the physics cut short (or stretched): he still lands past the edge
          if (frames === 150 && !g.ringedOut) {
            place(g, yard(b, 0, A.half + 2.4), Math.PI);
            g.setState('knockdown', { frames: 60 });
          }
          return frames > 400 ? { winner: t, loser: g, how: 'ringout' } : null;
        },
      });
      m.limits(null);
      m.endShot();
      if (r.winner !== t) return m.fail('Goten won the junior division');
      S.bracket.report('kid_trunks', r.how);
      m.flags.r2 = r.how;
      m.flags.juniorChampion = 'kid_trunks';
      m.complete('win2');
      if (t.hpFrac > 0.5) m.complete('clean');
      else m.failObjective('clean');
      yield* T().announce(m, 'champion', { winner: t });
      yield* SL.Cinema.play(m, 'junior_twohands');
      yield 0.4;
    },
  };

  /**
   * The exhibition: the junior champion against the World Champion. Trunks could
   * end it in a second. The show is the optional objective — hold back for a while
   * so the champion looks like a champion — and the finish is up to the player.
   */
  P.exhibition = {
    id: 'exhibition',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, t = S.trunks;
      m.clearObjectives();
      S.satanOut = true;
      oneArm(t, false);
      if (t.formIndex !== 0) t.applyForm(0);
      m.objective('beat', 'Beat the World Champion', { icon: 'fist', target: 1 });
      m.objective('show', 'Give the crowd a show first: last ' + SHOW_SECONDS + ' seconds', { icon: 'clock', optional: true });
      let frames = 0;
      const r = yield* T().match(m, {
        a: t, b: S.satan, player: t, intro: true, round: 'An exhibition', difficulty: 'normal',
        onStart: () => {
          benches(b, [t, S.satan]);
          S.satan.untargetable = false;
          S.satan.setHidden(false);
        },
        during: (mm, f) => {
          frames = f;
          return null;
        },
      });
      if (r.winner !== t) return m.fail('The champion won the exhibition');
      m.flags.exhibition = r.how;
      m.complete('beat');
      if (frames >= SHOW_SECONDS * 60) m.complete('show');
      else m.failObjective('show');
      m.qteParts.push(U.clamp01(frames / (SHOW_SECONDS * 60)));
      yield 0.4;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      S.satanOut = true;
      benches(b, [S.satan, S.trunks]);
      S.satan.setHidden(false);
      place(S.satan, yard(b, 13.6, 2), -Math.PI / 2);
      place(S.trunks, new V3(4, b.stage.arena.y, 1), Math.PI / 2);
      yield* SL.Cinema.play(m, 'junior_after');
      m.endShot();
      m.flags.juniorDivisionDone = true;
      m.title('CHAPTER 8 · BUU SAGA', 'JUNIOR DIVISION', 'The adult division is next — and somebody in it is not what he seems', 3.6);
      yield* m.cine(3.8);
    },
  };

  const def = {
    id: 'buu_junior',
    canon: true,
    chapter: 'CHAPTER 8 · BUU SAGA',
    title: 'Junior Division',
    subtitle: 'The 25th World Tournament · Age 774',
    character: 'kid_trunks',
    stage: 'tournament',
    parTime: 330,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Two children in a tournament for children, and only one of them can win it.',
    rewards: [],
    setup,
    phases: [P.open, P.round1, P.round1b, P.final, P.hold, P.gold, P.finish, P.exhibition, P.after],
  };

  SL.data.juniorFinal = { FINAL, ONE_ARM, oneArm };
  SL.data.missions[def.id] = def;
})();
