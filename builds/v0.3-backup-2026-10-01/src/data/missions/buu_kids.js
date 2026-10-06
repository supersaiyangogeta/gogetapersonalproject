/*
 * CHAPTER 7 — BUU SAGA (Age 774)
 * Mission "Two Children" (canon, played as Goten).
 *
 * Goten and Kid Trunks, sparring in a field, because that is what they do all
 * day. The mission exists to make the player feel what the story needs them to
 * feel before the tournament: these two are children — small, fast, playing —
 * and they turn Super Saiyan the way other children ride a bicycle.
 *
 * Phases: OPEN (scene `kids_spar_open`) → SPAR (checkpoint: first to six clean
 * hits, nobody can be hurt) → ASCEND (both children transform, played through
 * the shared transformation cinematic) → REMATCH (checkpoint: the same fight
 * with two Super Saiyans in it) → AFTER (scene `kids_after`).
 *
 * Neither child can die in any phase. The worst outcome in this mission is
 * being told off.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -6);
  const SPAR_HITS = 6;
  const REMATCH_HITS = 8;
  const scripted = () => ({ update: () => SL.emptyIntent() });

  function ground(b, v, lift = 0) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  }
  function place(f, pos, yaw) {
    f.setPosition(pos);
    if (yaw !== undefined) f.yaw = yaw;
    f.prevYaw = f.yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  function formIndex(f, id) {
    return f.def.forms.findIndex((x) => x.id === id);
  }
  /** A close shot on whoever is talking, so no line plays over the gameplay camera. */
  function closeOn(m, f, seconds) {
    m.shot((t, out) => {
      const c = f.chest();
      out.pos.copy(c).addScaledVector(f.forward, U.lerp(2.2, 1.8, t)).add(new V3(0.6, 0.25, 0));
      out.look.copy(c).add(new V3(0, 0.2, 0));
      out.fov = 38;
    }, seconds, { cut: true, blendIn: 0 });
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

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 30);
    const goten = b.spawn({ charId: 'goten', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 5))), startKi: 60 });
    const trunks = b.spawn({ charId: 'kid_trunks', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -5))), startKi: 60 });
    for (const f of [goten, trunks]) {
      f.cannotDie = true;
      f.lockedForms = { ssj: true }; // the story opens it, in the scene that is about it
    }
    const chichi = b.spawn({ charId: 'chichi', team: 0, pos: ground(b, FIELD.clone().add(new V3(12, 0, 14))), startKi: 0 });
    chichi.cannotDie = true;
    chichi.untargetable = true;
    chichi.controller = scripted();
    chichi.setHidden(true);
    b.story = { goten, trunks, chichi };
  }

  /** A spar: nobody dies, nobody is hurt badly, and both of them are having fun. */
  function sparSetup(m, opts) {
    const b = m.battle, S = b.story, g = S.goten, t = S.trunks;
    m.lock(true);
    m.clearObjectives();
    clearCombat(b);
    b.switchPlayer(g, { force: true });
    for (const f of [g, t]) {
      f.hp = f.hpMax;
      f.ki = Math.max(f.ki, 60);
      f.cannotDie = true;
      f.damageTakenMul = 0.35;
    }
    place(g, ground(b, FIELD.clone().add(new V3(0, 0, 5))), Math.PI);
    place(t, ground(b, FIELD.clone().add(new V3(0, 0, -5))), 0);
    faceTo(g, t.pos);
    faceTo(t, g.pos);
    t.controller = new SL.AIController(b, { difficulty: opts.difficulty || 'normal', profile: { aggression: 0.8, defense: 0.45, ranged: 0.3, beam: 0.25, preferredRange: 2.2 } });
    t.target = g;
    g.target = t;
    g.setState('free');
    t.setState('free');
    m.lock(false);
    b.aiLocked = false;
    m.music('battle', opts.music || 4);
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      place(S.goten, ground(b, FIELD.clone().add(new V3(0, 0, 4))), Math.PI);
      place(S.trunks, ground(b, FIELD.clone().add(new V3(0, 0, -4))), 0);
      faceTo(S.goten, S.trunks.pos);
      faceTo(S.trunks, S.goten.pos);
      yield* SL.Cinema.play(m, 'kids_spar_open');
    },
  };

  P.spar = {
    id: 'spar',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goten, t = S.trunks;
      sparSetup(m, { difficulty: 'normal', music: 4 });
      m.objective('hits', 'Land ' + SPAR_HITS + ' clean hits on Trunks', { icon: 'fist', target: SPAR_HITS });
      m.objective('clean', 'Take fewer than four yourself', { icon: 'guard', optional: true });
      let mine = 0, his = 0;
      const offD = b.on('damage', (e) => {
        if (e.blocked) return;
        if (e.target === t && e.attacker === g) {
          mine++;
          m.progress('hits', Math.min(SPAR_HITS, mine));
        } else if (e.target === g && e.attacker === t) his++;
      });
      yield () => mine >= SPAR_HITS;
      if (offD) offD();
      m.complete('hits');
      if (his < 4) m.complete('clean');
      else m.failObjective('clean');
      m.flags.sparWon = true;
      m.flags.sparTaken = his;
      m.qteParts.push(U.clamp01(1 - his / 8));
      yield 0.5;
    },
  };

  /**
   * The ascension, which for these two is not a crisis: Trunks does it to win an
   * argument, and Goten does it because Trunks did. The same staged cinematic
   * the rest of the game uses — this time with nothing at stake.
   */
  P.ascend = {
    id: 'ascend',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goten, t = S.trunks;
      m.lock(true);
      clearCombat(b);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 4))), Math.PI);
      place(t, ground(b, FIELD.clone().add(new V3(0, 0, -4))), 0);
      faceTo(g, t.pos);
      faceTo(t, g.pos);
      closeOn(m, t, 2.6);
      m.say('kid_trunks', 'Right. No more playing.', 2.4, { style: 'quiet' });
      yield 2.6;
      t.lockedForms = {};
      yield* SL.data.cinematics.transform(m, { fighter: t, formIndex: formIndex(t, 'ssj'), witness: g, music: 4 });
      closeOn(m, g, 2.4);
      m.say('goten', 'Oh! Me too, me too!', 2.2, { style: 'shout' });
      yield 2.4;
      g.lockedForms = {};
      m.teach(g, 'form:ssj');
      yield* SL.data.cinematics.transform(m, { fighter: g, formIndex: formIndex(g, 'ssj'), witness: t, music: 5 });
      m.flags.kidsAscended = true;
      yield 0.6;
    },
  };

  P.rematch = {
    id: 'rematch',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goten, t = S.trunks;
      sparSetup(m, { difficulty: 'hard', music: 6 });
      for (const f of [g, t]) {
        f.lockedForms = {};
        const i = formIndex(f, 'ssj');
        if (i > 0 && f.formIndex !== i) f.applyForm(i);
        f.ki = Math.max(f.ki, 70);
      }
      m.objective('hits2', 'Land ' + REMATCH_HITS + ' clean hits as a Super Saiyan', { icon: 'fist', target: REMATCH_HITS });
      m.objective('form', 'Stay a Super Saiyan to the end', { icon: 'transform', optional: true });
      let mine = 0;
      const offD = b.on('damage', (e) => {
        if (e.blocked || e.target !== t || e.attacker !== g) return;
        mine++;
        m.progress('hits2', Math.min(REMATCH_HITS, mine));
      });
      yield () => mine >= REMATCH_HITS;
      if (offD) offD();
      m.complete('hits2');
      if (g.form.id === 'ssj') m.complete('form');
      else m.failObjective('form');
      m.flags.rematchWon = true;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.5;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      m.clearObjectives();
      for (const f of b.fighters) f.controller = scripted();
      for (const f of [S.goten, S.trunks]) {
        if (f.formIndex !== 0) f.applyForm(0);
        f.damageTakenMul = 1;
      }
      place(S.goten, ground(b, FIELD.clone().add(new V3(-1.4, 0, 3))), Math.PI * 0.9);
      place(S.trunks, ground(b, FIELD.clone().add(new V3(1.6, 0, 0))), -Math.PI * 0.1);
      S.chichi.setHidden(false);
      place(S.chichi, ground(b, FIELD.clone().add(new V3(8, 0, 9))), Math.PI * 0.75);
      faceTo(S.chichi, S.goten.pos);
      faceTo(S.goten, S.trunks.pos);
      faceTo(S.trunks, S.goten.pos);
      yield* SL.Cinema.play(m, 'kids_after');
      m.lock(true);
      m.endShot();
      m.flags.kidsMissionDone = true;
      m.title('CHAPTER 7 · BUU SAGA', 'TWO CHILDREN', 'The World Tournament is in three days', 3.6);
      yield* m.cine(3.8);
    },
  };

  const def = {
    id: 'buu_kids',
    canon: true,
    chapter: 'CHAPTER 7 · BUU SAGA',
    title: 'Two Children',
    subtitle: 'A field outside the city · Age 774',
    character: 'goten',
    stage: 'plains',
    parTime: 240,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'Two small boys, one field, and a power their fathers nearly died for.',
    rewards: ['Goten playable', 'Trunks (Kid) playable'],
    setup,
    phases: [P.open, P.spar, P.ascend, P.rematch, P.after],
  };

  SL.data.missions[def.id] = def;
})();
