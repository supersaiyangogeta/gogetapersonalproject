/*
 * CHAPTER 8 — BUU SAGA: THE TOURNAMENT (Age 774)
 * Mission "Spopovich" (canon, played as Videl).
 *
 * The adult division opens. Krillin wins in one blow; Piccolo walks into the
 * ring against a small purple man called Shin and walks straight out again.
 * Then Videl draws Spopovich — a man Mr. Satan beat years ago, who now grows
 * back anything done to him.
 *
 * This is a match the player is not meant to win, and the mission says so
 * rather than hiding it: the objective is to hold on and to make him pay for it.
 * Her hits really land and really hurt him — and Babidi's magic undoes them
 * (the bio-regeneration mechanic Cell uses, running on magic). When he is put
 * down he gets up again, visibly, so a knockout never counts; he flies, so he
 * cannot simply be pushed off the ring. The match ends when she can no longer
 * stand, and what he does then is the scene.
 *
 * The turn (2026-09-25, reference-driven): she is winning, he staggers, and the player throws the
 * Eagle Kick (a cue) — it lands on his head and turns it all the way round; the stadium gasps;
 * he reaches up and turns it back (scene `spopovich_regrows`). From then on she tires visibly
 * (her guard sags, her stamina shrinks with her health), Gohan and Krillin react from outside the
 * ring, and the crowd flinches at every heavy hit she takes. The cruelty scene has him kneeling
 * on her, Gohan setting foot on the ring, and Yamu calling him off before he throws her out.
 *
 * Phases: DRAW (the adult bracket, Krillin, and Piccolo's forfeit —
 * scene `piccolo_forfeits`) → MATCH (checkpoint: Videl vs Spopovich) → CRUELTY
 * (scene `spopovich_cruelty`, and the ring-out that ends it) → AFTER.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const T = () => SL.Tournament;

  const ADULTS = ['krillin', 'pintar', 'piccolo', 'shin', 'videl', 'spopovich', 'adult_gohan', 'kibito'];
  const BREAK_AT = 0.3; // she can no longer stand
  const FIRST_DOWN = 0.7; // the hit that should have ended it (scene `spopovich_regrows`)
  const scripted = () => ({ update: () => SL.emptyIntent() });

  function place(f, pos, yaw) {
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
  }
  const yard = (b, x, z) => new V3(x, b.stage.heightAt(x, z), z);
  const ring = (b, x, z) => new V3(x, b.stage.arena.y, z);

  const SPOTS = { gohan: [-15, 6], piccolo: [-15, 9], krillin: [-15, 3], goku: [-17, 7.5], vegeta: [-17, 4.5], kai: [15, 6], kibito: [15, 9], yamu: [16, -6] };

  function benches(b, active) {
    const S = b.story;
    for (const k of Object.keys(SPOTS)) {
      const f = S[k];
      if (!f || active.includes(f)) continue;
      f.controller = scripted();
      f.untargetable = true;
      f.setHidden(false);
      place(f, yard(b, SPOTS[k][0], SPOTS[k][1]), Math.atan2(-SPOTS[k][0], -SPOTS[k][1]));
      f.setState('scripted', { pose: k === 'kai' ? 'sk_idle' : k === 'kibito' ? 'kb_idle' : k === 'piccolo' || k === 'vegeta' ? 'armsCrossed' : 'idle', expression: 'calm' });
    }
  }

  function draw(m, upTo) {
    const B = T().bracket(ADULTS);
    const results = [['krillin', 'ko'], ['shin', 'forfeit'], ['spopovich', 'ringout']];
    for (let i = 0; i < upTo; i++) B.report(results[i][0], results[i][1]);
    m.battle.story.bracket = B;
    return B;
  }

  function setup(battle) {
    const b = battle;
    const spawn = (charId, key, team = 0, extra = {}) => {
      const pos = SPOTS[key] ? yard(b, SPOTS[key][0], SPOTS[key][1]) : ring(b, 0, 0);
      const f = b.spawn(Object.assign({ charId, team, pos, startKi: 50 }, extra));
      f.cannotDie = true;
      return f;
    };
    const videl = spawn('videl', 'videl', 0, { player: true });
    const spopovich = spawn('spopovich', 'spopovich', 1);
    const S = { videl, spopovich };
    for (const [k, id] of [['gohan', 'adult_gohan'], ['piccolo', 'piccolo'], ['krillin', 'krillin'], ['goku', 'goku'], ['vegeta', 'vegeta'], ['kai', 'supreme_kai'], ['kibito', 'kibito'], ['yamu', 'yamu']]) {
      S[k] = spawn(id, k, k === 'yamu' ? 1 : 0);
      S[k].controller = scripted();
      S[k].untargetable = true;
    }
    spopovich.controller = scripted();
    b.story = S;
    benches(b, []);
  }

  const P = {};

  /** The draw: two results in two beats, and the forfeit that tells Piccolo who "Shin" is. */
  P.draw = {
    id: 'draw',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      benches(b, []);
      place(S.videl, yard(b, 15, 3), -Math.PI / 2);
      place(S.spopovich, yard(b, 16, -3), -Math.PI / 2);
      const B = draw(m, 0);
      T().showBracket(m, B);
      yield* T().announce(m, 'intro', { line: '', round: 'The adult division', a: 'Krillin', b: 'Pintar' });
      B.report('krillin', 'ko');
      yield* T().announce(m, 'ko', { winner: 'Krillin', loser: 'Pintar' });
      T().showBracket(m, B);
      yield* T().announce(m, 'intro', { a: 'Piccolo', b: 'Shin' });
      T().hideBracket();
      // Piccolo and "Shin" in the ring
      place(S.piccolo, ring(b, 0, 5), Math.PI);
      place(S.kai, ring(b, 0, -5), 0);
      S.piccolo.setHidden(false);
      S.kai.setHidden(false);
      yield* SL.Cinema.play(m, 'piccolo_forfeits');
      B.report('shin', 'forfeit');
      yield* T().announce(m, 'forfeit', { winner: 'Shin', loser: 'Piccolo' }, { shot: false });
      m.flags.adultDrawn = true;
    },
  };

  P.match = {
    id: 'match',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl, sp = S.spopovich;
      const K = SL.data.buuKit;
      m.clearObjectives();
      if (!S.bracket || S.bracket.rounds[0][1].winner !== 'shin') draw(m, 2);
      v.noFlight = false; // she learned yesterday
      v.flightCtl = { lift: 1, speed: 0.85, wobble: 0.1, ceiling: 30, drain: 3 };
      m.objective('hold', 'Hold on — he does not stay hurt', { icon: 'guard', target: 1 });
      m.objective('pay', 'Make him pay: 12 clean hits', { icon: 'fist', target: 12, optional: true });
      let hits = 0, regrewShown = false;
      const offD = b.on('damage', (e) => {
        if (e.target !== sp || e.attacker !== v || e.blocked) return;
        hits++;
        m.progress('pay', Math.min(12, hits));
      });
      T().showBracket(m, S.bracket);
      const ai = { aggression: 0.75, defense: 0.2, ranged: 0, beam: 0, preferredRange: 1.6 };
      // he will not let her fall out: this match ends when she cannot stand, not at the edge
      const A = b.stage.arena;
      const keepIn = () => {
        const lim = A.half - 0.6;
        if (Math.abs(v.pos.x) > lim || Math.abs(v.pos.z) > lim) v.setPosition(new V3(U.clamp(v.pos.x, -lim, lim), Math.max(v.pos.y, A.y), U.clamp(v.pos.z, -lim, lim)));
      };
      // first stretch: she is the better fighter, and for a while the fight says so
      let r = yield* T().match(m, {
        a: v, b: sp, player: v, round: 'Videl versus Spopovich', difficulty: 'hard', ai: Object.assign({}, ai, { defense: 0 }), ringOut: false,
        onStart: () => {
          T().hideBracket();
          benches(b, [v, sp]);
          // he is letting her: no guard, no regrowth yet, and every hit lands in full
          sp.damageDealtMul = 0.2;
          sp.damageTakenMul = 2.2;
          sp.noRegen = true;
        },
        // the stretch ends on the story's beat, not the match's (SL.Tournament pause result)
        during: () => (keepIn(), sp.hpFrac <= FIRST_DOWN ? { winner: v, loser: sp, how: 'story', pause: true } : v.hpFrac <= BREAK_AT ? { winner: sp, loser: v, how: 'held' } : null),
      });
      if (r.how === 'story') {
        // he staggers, wide open: the kick the whole stadium sees (the one button the story waits on)
        K.clearCombat(b);
        if (b.vfx.smoke) b.vfx.smoke.clear();
        const lim = A.half - 1.2;
        const toV = v.pos.clone().sub(sp.pos).setY(0);
        if (toV.lengthSq() < 0.01) toV.set(0, 0, 1);
        toV.normalize();
        place(sp, ring(b, U.clamp(sp.pos.x, -lim + 2, lim - 2), U.clamp(sp.pos.z, -lim + 2, lim - 2)));
        place(v, ring(b, U.clamp(sp.pos.x + toV.x * 2.6, -lim, lim), U.clamp(sp.pos.z + toV.z * 2.6, -lim, lim)));
        v.yaw = v.prevYaw = Math.atan2(sp.pos.x - v.pos.x, sp.pos.z - v.pos.z);
        sp.yaw = sp.prevYaw = Math.atan2(v.pos.x - sp.pos.x, v.pos.z - sp.pos.z);
        sp.setState('scripted', { pose: 'stagger', expression: 'hurt' });
        v.setState('scripted', { pose: 'vd_eagleW', expression: 'shout', speed: 8 });
        m.shot((t, out) => {
          const c = v.chest().lerp(sp.chest(), 0.5);
          const side = new V3(v.forward.z, 0, -v.forward.x);
          out.pos.copy(c).addScaledVector(side, 3.6).add(new V3(0, 0.3, 0));
          out.look.copy(c);
          out.fov = 42;
        }, 999, { hold: true, cut: true, blendIn: 0 });
        const kick = yield* m.cue('ult', 'Eagle Kick', { slow: 0.25, auto: 4 });
        m.flags.eagleKick = kick.pressed;
        // the hit that should have ended it — and what he does instead
        yield* SL.Cinema.play(m, 'spopovich_regrows');
        sp.hp = sp.hpMax;
        b.vfx.streamInward(sp.chest(), 2.4, 0x9aff6a, 14, 0.14, 0.6);
        b.emit('magicRegrowth', { fighter: sp });
        regrewShown = true;
        m.prompt('regen', 'light', 'He grows back — keep hitting', { when: () => !b.inputLocked, always: true });
        // from here on it takes more out of her every exchange, and the ones who can see it say so
        const reactions = [
          [0.72, 'adult_gohan', 'Videl, that\'s enough — he\'s not normal! Get out of the ring!'],
          [0.6, 'videl', 'I\'m not... done yet!'],
          [0.5, 'adult_gohan', 'He\'s not even feeling it... Forfeit, Videl. Please!'],
          [0.4, 'krillin', 'Gohan — he\'s toying with her.'],
        ];
        let said = 0, tired = false;
        const offHit = b.on('damage', (e) => {
          if (e.target === v && e.amount >= v.hpMax * 0.06 && b.stage.gasp) b.stage.gasp(0.45);
        });
        m.onDispose(offHit);
        // second stretch: he stops letting her
        r = yield* T().match(m, {
          a: v, b: sp, player: v, difficulty: 'hard', ai, intro: false, begin: false, fresh: false, keepPlaces: true, ringOut: false,
          onStart: () => {
            sp.damageDealtMul = 0.35;
            sp.damageTakenMul = 1;
            sp.noRegen = false;
          },
          during: () => {
            keepIn();
            while (said < reactions.length && v.hpFrac <= reactions[said][0]) {
              const [, who, line] = reactions[said++];
              m.say(who, line, 2.8, { style: who === 'videl' ? 'quiet' : 'shout' });
              b.emit('gohanReacts', { who, line });
            }
            // exhaustion shows: the guard sags, the breath goes, and the legs run out of stamina
            if (!tired && v.hpFrac < 0.58) {
              tired = true;
              v.poses.idle = v.poses.vd_tired;
              b.emit('videlExhausted', { fighter: v });
            }
            if (tired) v.stamina = Math.min(v.stamina, v.staminaMax * (0.3 + 0.6 * v.hpFrac));
            // put down again, he gets up again: a knockout never counts against him
            if (sp.hp <= sp.hpMax * 0.25) {
              sp.hp = sp.hpMax;
              sp.setState('scripted', { pose: 'sp_regrow', expression: 'grin' });
              b.vfx.streamInward(sp.chest(), 2.4, 0x9aff6a, 12, 0.14, 0.5);
              m.say('announcer', 'Again?! He is not even hurt!', 2.4, { style: 'shout' });
              b.emit('magicRegrowth', { fighter: sp });
              setTimeout0(() => sp.state === 'scripted' && sp.setState('free'), 96, m);
            }
            return v.hpFrac <= BREAK_AT ? { winner: sp, loser: v, how: 'held' } : null;
          },
        });
      }
      if (offD) offD();
      m.complete('hold');
      if (hits >= 12) m.complete('pay');
      else m.failObjective('pay');
      m.flags.videlHits = hits;
      m.flags.sawMagicRegrowth = regrewShown;
      m.flags.matchResult = r.how;
      m.qteParts.push(U.clamp01(hits / 12));
    },
  };

  /** Frames later, on the mission clock: used for the regrowth beat inside the match. */
  function setTimeout0(fn, frames, m) {
    let n = 0;
    const hook = () => {
      if (++n < frames) return;
      fn();
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
    };
    m.tickHooks.push(hook);
  }

  P.cruelty = {
    id: 'cruelty',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl, sp = S.spopovich;
      m.lock(true);
      for (const f of b.fighters) f.controller = scripted();
      benches(b, [v, sp, S.gohan]);
      place(v, ring(b, 2, 0), -Math.PI / 2);
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
      place(sp, ring(b, 0, -1.5), Math.PI / 4);
      place(S.gohan, yard(b, -14, 2), Math.PI / 2);
      S.gohan.setHidden(false);
      yield* SL.Cinema.play(m, 'spopovich_cruelty');
      if (S.bracket.current() && S.bracket.current().a === 'videl') S.bracket.report('spopovich', 'ringout');
      yield* T().announce(m, 'ringout', { winner: sp, loser: v });
      m.flags.spopovichWon = true;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.videl, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      // Gohan is over the wall before anybody else moves
      place(g, yard(b, 14.4, 1), Math.PI / 2);
      g.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      m.shot((t, out) => {
        const c = g.chest();
        out.pos.set(c.x + 2.6, c.y + 0.6, c.z + 2.8 - t * 0.5);
        out.look.set(c.x, c.y - 0.2, c.z);
        out.fov = 40;
      }, 5, { cut: true, blendIn: 0 });
      m.say('adult_gohan', 'Videl. Videl, can you hear me? ...Somebody get a Senzu Bean.', 3.4, { style: 'quiet' });
      yield* m.cine(3.6);
      m.shot((t, out) => {
        // in front of him, by his own facing: the announcer stands just behind his shoulder
        const c = S.kai.chest();
        const fwd = S.kai.forward.clone().setY(0).normalize();
        out.pos.copy(c).addScaledVector(fwd, 2.4).add(new V3(-fwd.z * 0.6, 0.3, fwd.x * 0.6));
        out.look.copy(c);
        out.fov = 36;
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('shin', 'Patience. He is not the one we are here for.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      m.endShot();
      m.flags.spopovichDone = true;
      m.title('CHAPTER 8 · BUU SAGA', 'SPOPOVICH', 'Next: Son Gohan versus Kibito', 3.4);
      yield* m.cine(3.6);
    },
  };

  const def = {
    id: 'buu_spopovich',
    canon: true,
    // the tournament: the short hair and the purple sleeves (2026-09-25)
    appearance: { videl: { outfit: 'videl_tournament' } },
    chapter: 'CHAPTER 8 · BUU SAGA',
    title: 'Spopovich',
    subtitle: 'The 25th World Tournament · adult division',
    character: 'videl',
    stage: 'tournament',
    parTime: 240,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'She has beaten him before, in a sense. He has changed since.',
    rewards: [],
    setup,
    phases: [P.draw, P.match, P.cruelty, P.after],
  };

  SL.data.missions[def.id] = def;
})();
