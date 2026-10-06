// Frieza fairness pass (2026-09-23). Before the human Namek playtest the owner found Frieza
// "still too strong" — not his health bar, but that he kept removing the player's ability to
// play. Measured first with tools/frieza_probe.js (a human-scale player who sees him 18 frames
// late): a Death Beam 10–13 frames from tell to impact that hit 50–100% of the time, saucers
// that homed almost perfectly, strings that chained on after a whiff, a punish of his recovery
// erased by the story power gap, a dodged beam converted straight into a string, a shaken
// emperor who out-flew every approach. These tests pin the behaviour that fixed it: every
// dangerous action has a tell, a commitment, and a way out — and the story escalation and the
// Super Saiyan power shift are still there. Every test drives the real engine headless.
const H = require('./headless');

module.exports = function friezaFairTests({ test, eq, ok }) {
  console.log('\nFrieza fairness pass (headless)');

  const phaseAt = (SL, mission, id) => SL.data.missions[mission].phases.findIndex((p) => p.id === id);
  const AGGRESSIVE = ['attack', 'specialThrow', 'deathSaucer', 'rush', 'scatter', 'bomberWave', 'eruption', 'throw'];

  /** Free Battle Goku vs Frieza in a given form; both idle until a test gives them a controller. */
  function duel(gg, { form = 3, distance = 12 } = {}) {
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'frieza', distance, dummy: null });
    const p = b.player, fz = b.fighters[1];
    if (form) {
      fz.applyForm(form);
      fz.mech.phase = form;
      fz.bossPhaseCap = form;
    }
    fz.controller = { update: () => SL.emptyIntent() };
    p.controller = { update: () => SL.emptyIntent() };
    return { b, p, fz };
  }

  /** A story phase with control handed back (scenes skipped on the way). */
  function reach(gg, id, phase) {
    const b = gg.mission(id, { startPhase: phaseAt(gg.SL, id, phase) });
    gg.until(b, () => !b.inputLocked && b.phase === 'fight' && b.player.state !== 'scripted', 60 * 60, () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    return b;
  }

  /* ------------------------------------------------------------ the Death Beam */

  test('the Death Beam shows its tell for longer than a human reaction, takes its aim at the glint, and misses a player who moved after it', () => {
    const run = (moveFrom, moveTo) => {
      const gg = H.create({ quiet: true, seed: 3 });
      const { SL } = gg;
      const { b, p, fz } = duel(gg, { distance: 12 });
      eq(fz.specials().special2.id, 'deathBeam4', 'final form: the Death Beam is on special 2');
      let start = -1, aim = -1, fired = -1, hit = false;
      fz.controller = gg.script(b, { 2: { s2: true } });
      p.controller = {
        update: () => {
          const it = SL.emptyIntent();
          const n = start < 0 ? -1 : b.frame - start;
          if (n >= moveFrom && n < moveTo) {
            it.mx = 1;
            it.boost = true;
          }
          return it;
        },
      };
      b.on('damage', (e) => e.target === p && e.source === 'Death Beam' && (hit = true));
      gg.step(b, 100, () => {
        if (start < 0 && fz.state === 'specialThrow') start = b.frame;
        if (aim < 0 && fz.state === 'specialThrow' && fz.sd.aim) aim = b.frame;
        if (fired < 0 && b.projectiles.list.some((pr) => pr.owner === fz)) fired = b.frame;
      });
      b.dispose();
      return { tell: fired - start, aimLead: fired - aim, hit };
    };
    const still = run(999, 999);
    ok(still.tell >= 18, 'the finger is up for at least 18 frames before the shot leaves (' + still.tell + ')');
    ok(still.aimLead >= 6, 'the aim is taken before the shot, at the glint (' + still.aimLead + ' frames earlier)');
    ok(still.hit, 'a player who just stands there is hit');
    // a human-scale reaction to the raised finger: moving 18 frames after it went up
    const reacted = run(18, 60);
    ok(!reacted.hit, 'a player who moves once they have seen the finger is not where it goes');
    // moving early and then stopping: he aimed at where the player stopped
    const early = run(0, 6);
    ok(early.hit, 'a player who moved before the glint and stopped is still found — the aim follows until it commits');
  });

  /* ------------------------------------------------------------ the saucers */

  test('Death Saucers turn at a limited rate: a still player is found, a sharp move across their path makes them sail past and come round', () => {
    const run = (move) => {
      const gg = H.create({ quiet: true, seed: 4 });
      const { SL } = gg;
      const { b, p, fz } = duel(gg, { distance: 14 });
      eq(fz.specials().special1.id, 'deathSaucers', 'final form: the saucers are on special 1');
      fz.controller = gg.script(b, { 2: { s1: true } });
      let launched = -1, firstHit = -1, turned = false;
      const heading = new Map();
      p.controller = {
        update: () => {
          const it = SL.emptyIntent();
          if (move && launched >= 0) {
            it.mx = 1;
            it.boost = true;
          }
          return it;
        },
      };
      b.on('damage', (e) => e.target === p && e.attacker === fz && firstHit < 0 && (firstHit = b.frame));
      gg.step(b, 240, () => {
        for (const pr of b.projectiles.list) {
          if (pr.owner !== fz || pr.kind !== 'disc' || !pr.alive) continue;
          if (launched < 0) launched = b.frame;
          const v = pr.vel.clone().normalize();
          if (!heading.has(pr)) heading.set(pr, v);
          else if (heading.get(pr).dot(v) < 0) turned = true;
        }
      });
      b.dispose();
      return { launched, firstHit: firstHit < 0 ? null : firstHit - launched, turned };
    };
    const still = run(false);
    ok(still.launched > 0, 'he threw them');
    ok(still.firstHit !== null && still.firstHit < 90, 'a player who stands still is found (' + still.firstHit + ' frames after the throw)');
    const moving = run(true);
    ok(moving.firstHit === null || moving.firstHit > 60, 'a player who moves sharply across their path is not hit on the first pass (' + moving.firstHit + ')');
    ok(moving.turned, 'and the saucers come round again — they still follow, they just cannot turn on a coin');
  });

  /* ------------------------------------------------------------ melee: opener, whiff, recovery */

  test('the first strike of a string winds up; a strike that swings at air leaves him recovering and ends the string', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    // far out of reach: every swing is at air
    const { b, fz } = duel(gg, { distance: 22 });
    fz.controller = gg.script(b, (n) => (n % 2 === 0 && n < 120 ? { light: true } : null));
    const strikes = [];
    let prevFrame = -1;
    gg.step(b, 140, () => {
      if (fz.state === 'attack' && (prevFrame < 0 || fz.stateFrame < prevFrame)) strikes.push({ at: b.frame, startup: fz.sd.startup, move: fz.sd.move, whiff: 0, len: 0 });
      if (fz.state === 'attack') {
        const s = strikes[strikes.length - 1];
        s.len = fz.stateFrame;
        s.whiff = fz.sd.whiffPenalty;
      }
      prevFrame = fz.state === 'attack' ? fz.stateFrame : -1;
    });
    b.dispose();
    ok(strikes.length >= 2, 'he swung more than once (' + strikes.length + ')');
    const jab = SL.data.characters.frieza.forms[3].moves.light[0];
    const plain = Math.max(2, Math.round(jab.startup / Math.sqrt(fz.mult().speed)));
    eq(strikes[0].move.id, jab.id, 'the first swing opens the string');
    eq(strikes[0].startup, plain + SL.data.characters.frieza.openerStartup, 'the opener winds up longer than the move itself');
    eq(strikes[0].whiff, SL.data.characters.frieza.whiffRecovery, 'swinging at air adds his whiff recovery');
    ok(strikes[0].len >= strikes[0].startup + jab.active + jab.recovery + SL.data.characters.frieza.whiffRecovery - 1, 'and he actually stays in it (' + strikes[0].len + ' frames)');
    // mashing did not chain the string off thin air: every swing was an opener again
    for (const s of strikes) eq(s.move.id, jab.id, 'no second link of the string after a whiff (' + s.move.id + ')');
  });

  test('when his string whiffs, the AI stops swinging and takes a breath — and a player who answers the miss lands the punish', () => {
    let rests = 0, punished = 0, whiffs = 0;
    for (const seed of [11, 12, 13]) {
      const gg = H.create({ quiet: true, seed });
      const { SL } = gg;
      const { b, p, fz } = duel(gg, { distance: 8 });
      const ai = new SL.AIController(b, { difficulty: 'normal' });
      fz.controller = ai;
      // the player sidesteps each strike just as it would land, then punishes the recovery
      let lastWhiff = -999;
      p.controller = {
        update: () => {
          const it = SL.emptyIntent();
          if (fz.state === 'attack' && fz.stateFrame === fz.sd.startup - 1 && p.state === 'free') {
            it.dodge = true;
            it.my = -1;
            return it;
          }
          if (b.frame - lastWhiff < 50 && p.distTo(fz) < 3 && b.frame % 4 === 0) it.light = true;
          else if (b.frame - lastWhiff < 50) it.my = 1;
          return it;
        },
      };
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker === p && b.frame - lastWhiff < 60) {
          punished++;
          lastWhiff = -999;
        }
      });
      let wasWhiff = false;
      gg.step(b, 60 * 25, () => {
        const w = fz.state === 'attack' && !fz.sd.hit && fz.stateFrame > fz.sd.startup + fz.sd.move.active;
        if (w && !wasWhiff) {
          whiffs++;
          lastWhiff = b.frame;
        }
        // one update after the whiff is seen, the plan is over and he is resting
        if (w && wasWhiff && fz.stateFrame === fz.sd.startup + fz.sd.move.active + 3 && ai.resting()) rests++;
        wasWhiff = w;
      });
      b.dispose();
    }
    ok(whiffs >= 3, 'he whiffed (' + whiffs + ')');
    ok(rests >= whiffs * 0.8, 'after a whiff he stops the string and breathes (' + rests + ' of ' + whiffs + ')');
    ok(punished >= Math.ceil(whiffs * 0.3), 'and the recovery is punishable (' + punished + ' of ' + whiffs + ' punished)');
  });

  test('from ten metres out, his first strike cannot land before a human could react to the approach', () => {
    const gaps = [];
    // eight seeds: on some he never closes in within the 12 seconds, and the claim needs a sample
    // (2026-09-24, after the harness stopped letting three.js consume the seeded stream: 6 approaches,
    // every one 22–24 frames)
    for (const seed of [21, 22, 23, 24, 25, 26, 27, 28]) {
      const gg = H.create({ quiet: true, seed });
      const { SL } = gg;
      const { b, p, fz } = duel(gg, { distance: 26 });
      fz.controller = new SL.AIController(b, { difficulty: 'hard' });
      let inside = -1;
      b.on('damage', (e) => {
        if (e.target === p && e.attacker === fz && e.type === 'melee' && inside >= 0 && gaps.length < 99) {
          gaps.push(b.frame - inside);
          inside = -2;
        }
      });
      gg.step(b, 60 * 12, () => {
        const d = p.distTo(fz);
        if (inside === -1 && d < 10) inside = b.frame;
        if (inside === -2 && d > 12) inside = -1;
      });
      b.dispose();
    }
    ok(gaps.length >= 3, 'he did come in and hit (' + gaps.length + ' approaches)');
    ok(Math.min(...gaps) >= 18, 'every strike landed at least 18 frames after he crossed 10 m (' + gaps.join(', ') + ')');
  });

  /* ------------------------------------------------------------ rhythm and reactions */

  test('after a committed technique he watches what it did before the next exchange — a dodged Death Beam is not a run-up into a string', () => {
    const gaps = [];
    for (const seed of [31, 32, 33]) {
      const gg = H.create({ quiet: true, seed });
      const { SL } = gg;
      const { b, p, fz } = duel(gg, { distance: 16 });
      fz.controller = new SL.AIController(b, { difficulty: 'normal' });
      // the player sidesteps every Death Beam when the finger comes up, and otherwise waits
      p.controller = {
        update: () => {
          const it = SL.emptyIntent();
          if (fz.state === 'specialThrow' && fz.stateFrame > 6 && fz.stateFrame < 30) {
            it.mx = 1;
            it.boost = true;
          }
          return it;
        },
      };
      let techEnd = -1, prev = fz.state, prevFrame = 0;
      gg.step(b, 60 * 30, () => {
        const restarted = fz.state !== prev || fz.stateFrame < prevFrame;
        if (prev === 'specialThrow' && fz.state !== 'specialThrow') techEnd = b.frame;
        if (restarted && techEnd >= 0 && AGGRESSIVE.includes(fz.state)) {
          gaps.push(b.frame - techEnd);
          techEnd = -1;
        }
        prev = fz.state;
        prevFrame = fz.stateFrame;
      });
      b.dispose();
    }
    ok(gaps.length >= 4, 'he fired and then attacked again several times (' + gaps.length + ')');
    const quick = gaps.filter((g) => g < 30).length;
    ok(quick <= Math.floor(gaps.length * 0.2), 'at most one follow-up in five comes within half a second of the technique (' + gaps.join(', ') + ')');
  });

  test('he punishes a charge he has seen, not the frame the button went down', () => {
    const gg = H.create({ quiet: true, seed: 41 });
    const { SL } = gg;
    const { b, p, fz } = duel(gg, { distance: 18 });
    const ai = new SL.AIController(b, { difficulty: 'normal' });
    ai._init(fz);
    ai.patternCd = {};
    ai.frame = 1000;
    const score = (seenState) => {
      p.setState('charge');
      const scores = { melee: 1 };
      SL.AIHooks.frieza.scores(ai, fz, p, 18, { state: seenState }, scores, true);
      return scores.p_beam4 || 0;
    };
    const unseen = score('free');
    const seen = score('charge');
    ok(unseen > 0 && seen > 0, 'the Death Beam is on offer either way (' + unseen.toFixed(2) + ', ' + seen.toFixed(2) + ')');
    ok(seen > unseen * 2, 'but the charge is only a reason to fire once he has seen it (' + unseen.toFixed(2) + ' → ' + seen.toFixed(2) + ')');
    b.dispose();
  });

  test('a story power gap never erases the punish of a committed technique: his recovery takes the hit', () => {
    const gg = H.create({ quiet: true, seed: 51 });
    const { b, p, fz } = duel(gg, { distance: 1.6 });
    fz.storyEvade = { chance: 1, gap: 0, from: [p] };
    const hit = (state) => {
      fz.setState(state, state === 'recover' ? { frames: 90 } : {});
      fz.invuln = 0;
      return fz.takeHit(p, { type: 'melee', damage: 400, knock: 'flinch', hitstun: 10, impact: 1, dir: p.dirTo(fz), point: fz.chest() });
    };
    eq(hit('free'), 'vanished', 'standing free, the power gap still slips the blow');
    ok(hit('recover') !== 'vanished', 'recovering from a technique, he takes it');
    b.dispose();
  });

  /* ------------------------------------------------------------ positioning */

  test('the shaken emperor backs off to reset the spacing but never runs the fight from the far side of the arena', () => {
    const gg = H.create({ quiet: true, seed: 61 });
    const { SL } = gg;
    const b = reach(gg, 'namek_super_saiyan', 'reversal');
    const g = b.story.goku, fz = b.story.frieza;
    eq(fz.aiPhase, 'shaken', 'Super Saiyan: the shaken emperor');
    // the player walks straight at him and swings whenever close — the chase the owner described
    g.controller = {
      update: () => {
        const it = SL.emptyIntent();
        if (b.inputLocked) return it;
        g.target = fz;
        const d = g.distTo(fz);
        it.my = d > 2.2 ? 1 : 0;
        it.boost = d > 4;
        if (fz.pos.y - g.pos.y > 1.2) it.up = true;
        else if (g.pos.y - fz.pos.y > 1.2) it.down = true;
        if (d < 3 && b.frame % 9 === 0) it.light = true;
        return it;
      },
    };
    let far = 0, frames = 0, max = 0, landed = 0;
    b.on('damage', (e) => e.target === fz && e.attacker === g && !e.blocked && landed++);
    gg.step(b, 60 * 25, () => {
      if (b.inputLocked) {
        b.skipRequested = true;
        return;
      }
      if (b.mission.phaseIndex !== phaseAt(SL, 'namek_super_saiyan', 'reversal')) return false;
      frames++;
      const d = g.distTo(fz);
      max = Math.max(max, d);
      if (d > 26) far++;
    });
    ok(frames > 60 * 5, 'the phase was played (' + (frames / 60).toFixed(0) + ' s)');
    ok(max < 40, 'he never gets further than 40 m away (' + max.toFixed(0) + ' m; it was 57 m before the leash)');
    ok(far / frames < 0.1, 'and spends under a tenth of the fight past his leash (' + Math.round((far / frames) * 100) + '%)');
    ok(landed >= 8, 'Goku closes the distance and lands his blows (' + landed + ')');
    b.dispose();
  });

  /* ------------------------------------------------------------ story tuning vs Free Battle */

  test('the Namek phases escalate — toying, fifty percent, one hundred percent — and the Super Saiyan power shift is intact', () => {
    const gg = H.create({ quiet: true, seed: 71 });
    const { SL } = gg;
    const at = (id, phase) => {
      const b = reach(gg, id, phase);
      const fz = b.story.frieza, g = b.story.goku;
      gg.step(b, 2);
      const r = { rhythm: fz.controller._rhythm(fz), combo: fz.controller.p.comboLen || fz.controller.d.comboLen, dmg: fz.damageDealtMul, phase: fz.aiPhase, diff: fz.controller.difficulty, g, fz };
      return { b, r };
    };
    const base = at('namek_goku', 'base');
    const ten = at('namek_kaioken20', 'ten');
    const fifty = at('namek_kaioken20', 'desperate');
    const full = at('namek_end', 'full');
    const ssj = at('namek_super_saiyan', 'reversal');
    // the emperor toys first: short strings and long looks; each stage presses harder
    eq(base.r.combo, 2, 'early Frieza throws short strings');
    ok(base.r.rhythm.rest > ten.r.rhythm.rest && ten.r.rhythm.rest > fifty.r.rhythm.rest && fifty.r.rhythm.rest >= full.r.rhythm.rest, 'his breaths get shorter: ' + [base, ten, fifty, full].map((x) => x.r.rhythm.rest).join(' → '));
    ok(base.r.rhythm.burst <= ten.r.rhythm.burst && ten.r.rhythm.burst <= fifty.r.rhythm.burst && fifty.r.rhythm.burst <= full.r.rhythm.burst, 'and his bursts longer: ' + [base, ten, fifty, full].map((x) => x.r.rhythm.burst).join(' → '));
    ok(base.r.dmg < fifty.r.dmg, 'fifty percent hits harder than the toying emperor (' + base.r.dmg + ' → ' + fifty.r.dmg + ')');
    eq(full.r.phase, 'full', '100%: the desperate emperor');
    eq(full.r.diff, 'hard', '100% keeps its hard reflexes — it is the peak');
    // the power shift the owner described: Goku ×1.45, Frieza ×0.45 out and ×1.5 in, storySpeed, storyEvade, a poise ceiling
    eq(ssj.r.g.damageDealtMul, 1.45, 'Super Saiyan Goku hits ×1.45');
    eq(ssj.r.fz.damageDealtMul, 0.45, 'Frieza hits ×0.45');
    eq(ssj.r.fz.damageTakenMul, 1.5, 'Frieza takes ×1.5');
    ok(ssj.r.g.storySpeed && ssj.r.g.storyEvade && ssj.r.g.storyEvade.chance > 0, 'Goku outpaces him (storySpeed, storyEvade)');
    eq(ssj.r.phase, 'shaken', 'and Frieza is shaken');
    gg.step(ssj.b, 30);
    // (one frame of regeneration can sit on top of the cap before the next tick trims it)
    ok(ssj.r.fz.poise.value <= ssj.r.fz.poise.max * 0.55 + 1, 'his footing is capped (poise ceiling): ' + ssj.r.fz.poise.value.toFixed(1) + ' of ' + ssj.r.fz.poise.max);
    for (const x of [base, ten, fifty, full, ssj]) x.b.dispose();
  });

  test('Free Battle Frieza keeps his full strength: no story multipliers, no story rhythm — only the shared tells', () => {
    const gg = H.create({ quiet: true, seed: 81 });
    const { SL } = gg;
    const { b, p, fz } = duel(gg, { distance: 12 });
    eq(fz.damageDealtMul, 1, 'no story damage multiplier');
    ok(!fz.aiRhythm && !fz.aiPhase, 'no story rhythm or phase');
    const ai = new SL.AIController(b, { difficulty: 'normal' });
    ai._init(fz);
    eq(ai.p.comboLen, undefined, 'strings as long as the difficulty allows');
    eq(ai._rhythm(fz), SL.data.characters.frieza.ai.rhythm, 'his own rhythm');
    // a Death Beam that lands still costs a full-health Goku about a third of his health
    fz.controller = gg.script(b, { 2: { s2: true } });
    let dmg = 0;
    b.on('damage', (e) => e.target === p && e.source === 'Death Beam' && (dmg = e.amount));
    gg.step(b, 90);
    ok(dmg / p.hpMax > 0.3, 'a final-form Death Beam still hurts (' + Math.round((dmg / p.hpMax) * 100) + '% of Goku)');
    b.dispose();
  });

  test('the What-If x20 branch keeps its own Frieza: he strikes, then stands back and watches', () => {
    const gg = H.create({ quiet: true, seed: 91 });
    const b = reach(gg, 'whatif_twenty', 'bursts');
    const fz = b.fighters.find((f) => f.def.id === 'frieza');
    gg.step(b, 2);
    eq(JSON.stringify(fz.aiRhythm), JSON.stringify({ burst: 40, rest: 210 }), 'its rhythm is untouched');
    eq(fz.aiPhase, 'dominant', 'and its emperor is the dominant one');
    b.dispose();
  });
};
