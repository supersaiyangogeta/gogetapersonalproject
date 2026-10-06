/*
 * CHAPTER 14 — BUU SAGA: THE SUPER SPIRIT BOMB (Buu Saga priority 12, the owner's beat sheets, 2026-10-02)
 * Mission "Goodbye, Buu" (canon; played as Goku, then Good Buu, then Goku). The Sacred World of the Kai.
 *
 *   WISHES    (scene)          New Namek and Porunga: the Earth put back, and everyone Buu killed
 *   CALL      (scene)          high over the crater, arms in a V: "raise your hands"; the Z Fighters give
 *                              it; a star over his head; Satan City refuses — half a sun
 *   BEATING   (scene)          Goku's fury, the thunder; Kid Buu's bug-eyed look up and his laugh; Vegeta
 *                              beaten (sweep, axe drop, the chest as a trampoline, the kick); the blast over
 *                              his head; Mr. Satan steps out; Kid Buu spits Good Buu out
 *   GOODBUU * (play)           Good Buu against Kid Buu, keeping him off Vegeta (still down in the crater)
 *   RALLY     (scene)          "Listen to me, you fools! It's Hercule!"; a sun that blots out the sky
 *   LAUNCH    (cue + scene)    throw it — arms out and down, wrists together; the catch; the trenches
 *   LOCKUP *  (play)           push — in base form he cannot: a struggle the story will not let him win;
 *                              the sun inching back up at him, his arms shaking
 *   WISH      (scene)          Vegeta through King Kai to Dende; the third wish; the green light; the
 *                              breath; the smirk; Super Saiyan in mid-air
 *   PUSH *    (scenes + play)  Vegeta is lying right beside Buu: Mr. Satan runs into the crater and carries
 *                              him out ("Way to go, Satan! You really ARE the savior of the world!"); palms
 *                              flat on it, "I'll be waiting for you..."; the two-finger salute, "Goodbye,
 *                              Buu!"; the push he can win
 *   GOODBYE   (scene)          into the bedrock; the silent scream; the white, the blue haze, the pillar into
 *                              space; embers; the gold going; the bird's-eye view; the glide down; the
 *                              reunion; Goku's thumbs-up — and Vegeta's
 *   AFTER                      the chapter card
 *
 * Where everyone is (SL.data.spiritBomb): Goku high over the crater (air), Kid Buu in it (ground), Vegeta lying
 * beside him until Mr. Satan carries him out, Mr. Satan and Good Buu behind the jagged rocks, Dende and the
 * Kais on New Namek with Porunga, the Z Fighters on the Lookout, the people in Satan City.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const SB = () => SL.data.spiritBomb;

  // the struggles: how long, how hard
  const PUSH = { lockSeconds: 8, pushSeconds: 12, pushStart: 0.35, pushDrain: 0.22 };

  function setup(battle) {
    const b = battle, sb = SB();
    sb.field(b);
    b.on('stageChanged', (e) => {
      if (e.id === 'kai_world') sb.field(b);
    });
    const C = sb.C;
    const p = (x, z) => new V3(C.x + x, 0, C.z + z);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: p(0, 10), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: p(5, 6), startKi: 20 });
    const kid = b.spawn({ charId: 'kid_buu', team: 1, pos: p(0, 0), startKi: 220, tags: { boss: true, priority: true } });
    const fat = b.spawn({ charId: 'majin_buu', team: 0, pos: p(-40, -40) });
    const satan = b.spawn({ charId: 'mr_satan', team: 0, pos: sb.SAT_ROCK.clone().add(new V3(2.6, 0, -2)) });
    const dende = b.spawn({ charId: 'dende', team: 0, pos: p(-60, 30) });
    const kai = b.spawn({ charId: 'kibitoshin', team: 0, pos: p(-62, 30) });
    const elder = b.spawn({ charId: 'elder_kai', team: 0, pos: p(-64, 30) });
    const gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: p(60, -60), wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: p(62, -60) });
    const goten = b.spawn({ charId: 'goten', team: 0, pos: p(64, -60) });
    const trunks = b.spawn({ charId: 'kid_trunks', team: 0, pos: p(66, -60) });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: p(68, -60) });
    const tien = b.spawn({ charId: 'tien', team: 0, pos: p(70, -60) });
    const yamcha = b.spawn({ charId: 'yamcha', team: 0, pos: p(72, -60) });
    const others = [vegeta, kid, fat, satan, dende, kai, elder, gohan, piccolo, goten, trunks, krillin, tien, yamcha];
    for (const f of others) {
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
      f.cannotDie = true;
    }
    for (const f of [fat, satan, dende, kai, elder, gohan, piccolo, goten, trunks, krillin, tien, yamcha]) f.setHidden(true);
    kid.mech.maxReforms = Infinity;
    goku.cannotDie = true;
    goku.lockedForms = { kaioken: true, ssj2: true, ssj3: true };
    if (goku.setDamage) goku.setDamage(2); // the third level and the minute: the gi is in rags
    if (vegeta.setDamage) vegeta.setDamage(2);
    if (vegeta.model.setBattered) vegeta.model.setBattered(true);
    K.faceTo(goku, C);
    K.faceTo(kid, goku.pos);
    vegeta.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
    kid.setState('scripted', { pose: 'kb_idle', expression: 'grin' });
    b.story = { goku, vegeta, kid, fat, satan, dende, kai, elder, gohan, piccolo, goten, trunks, krillin, tien, yamcha };
  }

  /** The sun, wherever the story needs it to be on a restart. */
  function ensureBomb(m, r, at) {
    const S = m.battle.story;
    if (!S.bomb) {
      S.bomb = SB().bomb(m.battle, at);
      m.onDispose(() => S.bomb && S.bomb.dispose());
    }
    S.bomb.set(r);
    S.bomb.group.position.copy(at);
    S.bomb.group.visible = true;
  }
  /** Goku high over the crater, where the call and the throw are made from. */
  function aloft(m, pose) {
    const S = m.battle.story, C = SB().C;
    m.space(S.goku, 'air', { pos: C.clone().add(new V3(0, 0, 10)), height: 34, pose, expr: 'grit', face: C });
  }
  /** Kid Buu in the crater, catching it; the sun on his palms. */
  function caught(m) {
    const S = m.battle.story, sb = SB();
    S.kid.setHidden(false);
    if (S.kid.storySpace !== 'ground') m.space(S.kid, 'ground', { pos: sb.C.clone(), face: S.goku.pos });
    S.kid.setState('scripted', { pose: 'kb_catch', expression: 'wicked' });
    ensureBomb(m, sb.FULL, S.kid.pos.clone().add(new V3(0, 1.15 + sb.FULL, 0)));
  }
  /**
   * Where everyone is for the throw: Vegeta still lying in the crater right beside Kid Buu (which is why
   * Goku cannot drop it until Mr. Satan gets him out), Mr. Satan behind the jagged rocks with Good Buu
   * out cold at his feet, Dende and the Kais away on New Namek.
   */
  function forThrow(m) {
    const S = m.battle.story, sb = SB(), Q = sb.SAT_ROCK;
    m.cast({
      support: [{ f: S.vegeta, pose: 'lieBack', face: 'ko' }],
      background: [
        // on the far side of the outcrop from the crater, clear of the rocks themselves
        { f: S.satan, at: Q.clone().add(new V3(1, 0, 2.6)), pose: 'guard', face: 'shock' },
        { f: S.fat, at: Q.clone().add(new V3(2.4, 0, 3.4)), pose: 'knockdown', face: 'ko' },
      ],
      hidden: [S.dende, S.kai, S.elder],
    }, { centre: sb.C.clone(), supportClear: 0.1 });
    m.space(S.vegeta, 'ground', { pos: sb.VEG.clone(), pose: 'lieBack', expr: 'ko', face: sb.C });
    S.satanOut = S.fatOut = true;
  }

  function brawl(m, hero, kid, opts) {
    const b = m.battle;
    if (b.player !== hero) b.switchPlayer(hero, { force: true });
    hero.untargetable = hero.intangible = false;
    kid.setHidden(false);
    kid.untargetable = kid.intangible = false;
    kid.controller = new SL.AIController(b, { difficulty: 'hard' });
    kid.damageDealtMul = opts.kidDealt;
    hero.target = kid;
    kid.target = hero;
    hero.setState('free');
    kid.setState('free');
    m.lock(false);
    b.aiLocked = false;
    m.music(opts.song || 'buu_theme', opts.music || 6);
  }

  const P = {};
  const scene = (id, sceneId, title) => ({
    id,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      if (title) m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, sceneId);
    },
  });
  P.wishes = scene('wishes', 'sb_wishes', true);
  P.call = scene('call', 'sb_call');
  P.beating = {
    id: 'beating',
    run: function* (m) {
      const S = m.battle.story;
      m.lock(true);
      if (!S.bomb) {
        aloft(m, 'sb_vStrain');
        ensureBomb(m, SB().HALF, S.goku.pos.clone().add(new V3(0, 2.5 + SB().HALF, 0)));
      }
      yield* SL.Cinema.play(m, 'sb_beatdown');
    },
  };

  /** Good Buu, played: keep the small one off Vegeta (still lying in the crater); Mr. Satan cheers from his rock. */
  P.goodbuu = {
    id: 'goodbuu',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, f = S.fat, kid = S.kid, v = S.vegeta, s = S.satan, sb = SB();
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (kid.mech.apart) yield () => !kid.mech.apart;
      // above it all: Kakarot holding half a sun that will not grow
      aloft(m, 'sb_vStrain');
      ensureBomb(m, sb.HALF, S.goku.pos.clone().add(new V3(0, 2.5 + sb.HALF, 0)));
      S.goku.untargetable = S.goku.intangible = true;
      f.setHidden(false);
      s.setHidden(false);
      S.satanOut = S.fatOut = true;
      f.cannotDie = true;
      f.hp = f.hpMax;
      if (b.player !== f) b.switchPlayer(f, { force: true });
      S.goku.controller = K.scripted();
      m.cast({
        active: [f, kid],
        support: [{ f: v, pose: 'lieBack', face: 'ko' }, { f: s, at: sb.SAT_ROCK.clone().add(new V3(2.2, 0, -1.6)), pose: 'victory', face: 'shout' }],
        hidden: [S.dende, S.kai, S.elder],
      }, { centre: sb.C.clone(), supportClear: 0.1 });
      m.space(f, 'ground', { pos: sb.C.clone().add(new V3(-2, 0, 4)), face: sb.C });
      m.space(kid, 'ground', { pos: sb.C.clone().add(new V3(-2, 0, -3)), face: f.pos });
      // Vegeta where the beating left him, beside the middle of the crater
      m.space(v, 'ground', { pos: sb.VEG.clone(), pose: 'lieBack', expr: 'ko' });
      const pulse = () => S.bomb.pulse();
      m.tickHooks.push(pulse);
      brawl(m, f, kid, { kidDealt: 0.8 });
      const sf = m.storyFight({ floors: [{ f, at: 0.25 }, { f: kid, at: 0.4 }], fighters: [f, kid], space: 'ground' });
      m.objective('stand', 'Keep him off Vegeta', { icon: 'guard', target: 25 });
      m.say('mr_satan', 'Go get him, Buu! Show him who\'s boss!', 2.6, { style: 'shout' });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('stand', Math.min(25, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= 25;
      K.unhook(m, hook);
      K.unhook(m, pulse);
      sf.off();
      m.complete('stand');
      m.flags.goodBuuStood = true;
      m.lock(true);
      K.clearCombat(b);
      kid.controller = K.scripted();
      if (kid.mech.apart) yield () => !kid.mech.apart;
      // the fat one is knocked flying toward the rocks; the little one laughs after him
      const toRock = sb.SAT_ROCK.clone().sub(f.pos).setY(0).normalize();
      const fly = m.space(f, 'slide', { dir: toRock, distance: Math.max(2, f.pos.distanceTo(sb.SAT_ROCK) - 3), seconds: 0.6, endPose: 'knockdown', expr: 'ko' });
      m.space(kid, 'ground', { face: f.pos, pose: 'kb_laugh', expr: 'grin' });
      yield () => fly.done();
      m.space(s, 'ground', { pos: sb.SAT_ROCK.clone().add(new V3(2.6, 0, -2)), face: sb.C });
      if (b.player !== S.goku) b.switchPlayer(S.goku, { force: true });
      S.goku.controller = K.scripted();
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
      yield 0.4;
    },
  };

  P.rally = {
    id: 'rally',
    run: function* (m) {
      const S = m.battle.story, sb = SB();
      m.lock(true);
      m.clearObjectives();
      aloft(m, 'sb_vStrain');
      ensureBomb(m, sb.HALF, S.goku.pos.clone().add(new V3(0, 2.5 + sb.HALF, 0)));
      S.satan.setHidden(false);
      S.satanOut = S.fatOut = true;
      if (S.satan.pos.distanceTo(sb.SAT_ROCK) < 2.8) m.space(S.satan, 'ground', { pos: sb.SAT_ROCK.clone().add(new V3(2.6, 0, -2)), face: sb.C });
      yield* SL.Cinema.play(m, 'sb_rally');
    },
  };

  /** THE THROW: the player lets it go; the scene follows it down into his hands. */
  P.launch = {
    id: 'launch',
    run: function* (m) {
      const b = m.battle, S = b.story, sb = SB();
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (b.player !== S.goku) b.switchPlayer(S.goku, { force: true });
      S.goku.controller = K.scripted();
      aloft(m, 'sb_v');
      ensureBomb(m, sb.FULL, S.goku.pos.clone().add(new V3(0, 2.5 + sb.FULL, 0)));
      S.kid.setHidden(false);
      S.kid.controller = K.scripted();
      m.space(S.kid, 'ground', { pos: sb.C.clone(), face: S.goku.pos, pose: 'kb_laugh', expr: 'grin' });
      forThrow(m);
      SL.Cinema.shotOn(m, { goku: S.goku }, { subject: 'goku', focus: 'wide', angle: 'low', room: 8, aim: [0, 8, 0] }, 60);
      const hold = () => S.bomb.pulse();
      m.tickHooks.push(hold);
      m.music('climax', 3);
      const r = yield* m.cue('ult', 'Throw the Spirit Bomb', { auto: 3 });
      K.unhook(m, hold);
      m.flags.thrownBy = r.pressed ? 'player' : 'story'; // a word, not a story flag: watched and skipped agree
      yield* SL.Cinema.play(m, 'sb_launch');
    },
  };

  /**
   * THE LOCK-UP: push — and in base form he cannot. A real struggle, but the story holds the bar: the
   * sun inches back up toward him whatever is pressed; his arms shake; the third wish is the answer.
   */
  P.lockup = {
    id: 'lockup',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, kid = S.kid, sb = SB();
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.toForm(g, 'base');
      if (b.player !== g) b.switchPlayer(g, { force: true });
      g.controller = K.scripted();
      aloft(m, 'sb_throw');
      caught(m);
      forThrow(m);
      const base = S.bomb.pos.clone();
      const g0 = g.pos.clone();
      const k0 = kid.pos.clone();
      const KID = { subject: 'kid', focus: 'full', angle: 'side', dist: 9, height: 0.6, aim: [0, 3, 0], fov: 56 };
      const GOKU = { subject: 'goku', focus: 'upper', angle: 'front' };
      SL.Cinema.shotOn(m, { goku: g, kid }, (t, el) => (el % 5 < 2.6 ? KID : GOKU), 60);
      m.objective('lock', 'Push it down on him', { icon: 'ball', optional: true });
      m.music('desperate', 3);
      let said = 0;
      const r = yield* m.struggle({
        start: 0.7,
        drain: 0.18,
        duration: PUSH.lockSeconds,
        label: 'PUSH! — his arms are giving out',
        // base form, drained: the story keeps the bar going the wrong way whatever is pressed
        override: (t, grip) => Math.min(grip, 0.7 - t * 0.07),
        onTick: (t, grip) => {
          const back = 1 - grip;
          // the sun creeps back up the way it came; Buu's legs straighten under it; Goku is pushed back
          kid.setPosition(k0.clone().add(new V3(0, back * 0.25, 0)));
          kid.prevPos.copy(kid.pos);
          S.bomb.group.position.copy(base).add(new V3(0, back * 0.25, 0));
          g.setPosition(g0.clone().add(new V3(0, back * 3, back * 1.5)));
          g.prevPos.copy(g.pos);
          g.setState('scripted', { pose: 'sb_throw', expression: 'grit', speed: 2 });
          S.bomb.pulse();
          if (b.frame % 4 === 0) b.vfx.trail(g.headPos().add(new V3((Math.random() - 0.5) * 0.3, -0.15, 0.1)), 0xffffff, 0.05, 0.35);
          if (b.frame % 6 === 0) b.camera.addTrauma(0.05);
          if (t >= 3 && said === 0) {
            said = 1;
            m.say('goku', 'Nnngh... I can\'t... push it...!', 2.2, { style: 'shout' });
          }
          if (t >= 5 && said === 1) {
            said = 2;
            m.say('kid_buu', 'KYAHAHAHAHA!', 1.6);
          }
        },
      });
      m.flags.lockup = { grip: r.grip };
      m.failObjective('lock');
      m.endShot();
    },
  };

  P.wish = {
    id: 'wish',
    run: function* (m) {
      const S = m.battle.story;
      m.lock(true);
      m.clearObjectives();
      K.toForm(S.goku, 'base');
      if (S.goku.storySpace !== 'air') aloft(m, 'sb_throw');
      caught(m);
      forThrow(m);
      yield* SL.Cinema.play(m, 'sb_restore');
    },
  };

  /** THE PUSH: Super Saiyan, palms flat on it — the speech, and a struggle he can win. */
  P.push = {
    id: 'push',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, kid = S.kid, sb = SB();
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (b.player !== g) b.switchPlayer(g, { force: true });
      g.controller = K.scripted();
      K.toForm(g, 'ssj');
      if (g.model.setBattered) g.model.setBattered(false);
      caught(m);
      forThrow(m);
      if (g.storySpace !== 'air') aloft(m, 'sb_throw');
      // he cannot drop it with Vegeta lying beside Buu: Mr. Satan's run first, then the farewell
      yield* SL.Cinema.play(m, 'sb_rescue');
      yield* SL.Cinema.play(m, 'sb_farewell');
      const base = S.bomb.pos.clone();
      const k0 = kid.pos.clone();
      const top = () => S.bomb.top().add(new V3(0, 1.3, 1.1));
      const PG = { subject: 'goku', focus: 'upper', angle: 'front' };
      const PK = { subject: 'kid', focus: 'full', angle: 'side', dist: 8, height: 0.5, aim: [0, 2.6, 0], fov: 56, side: -1 };
      SL.Cinema.shotOn(m, { goku: g, kid }, (t, el) => (el % 4 < 2.2 ? PG : PK), 60);
      m.music('climax', 3);
      m.objective('push', 'Push it through him', { icon: 'ball' });
      const r = yield* m.struggle({
        start: PUSH.pushStart,
        drain: PUSH.pushDrain,
        duration: PUSH.pushSeconds,
        label: 'PUSH!',
        until: (t, grip) => grip >= 0.98,
        onTick: (t, grip) => {
          // the sun bearing down: Buu's knees going, his feet sinking, Goku's whole weight behind it
          const d = grip * 0.9;
          kid.setPosition(k0.clone().add(new V3(0, -d, 0)));
          kid.prevPos.copy(kid.pos);
          kid.setState('scripted', { pose: 'kb_catch', expression: grip > 0.7 ? 'shock' : 'wicked', speed: 2 });
          S.bomb.group.position.copy(base).add(new V3(0, -d, 0));
          g.setPosition(top());
          g.prevPos.copy(g.pos);
          g.setState('scripted', { pose: 'sb_push', expression: 'grit', speed: 2, aura: 1 });
          S.bomb.pulse();
          if (b.frame % 5 === 0) b.camera.addTrauma(0.04 + grip * 0.05);
        },
      });
      m.flags.pushed = { grip: r.grip, won: r.grip >= 0.98 };
      m.complete('push');
      m.endShot();
      yield* SL.Cinema.play(m, 'sb_goodbye');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'GOODBYE, BUU', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'buu_spiritbomb',
    canon: true,
    chapter: 'CHAPTER 14 · BUU SAGA',
    title: 'Goodbye, Buu',
    subtitle: 'The Super Spirit Bomb · Age 774',
    character: 'goku',
    stage: 'kai_world',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Half a sun over his head, and a planet that will not raise its hands — until a voice it trusts asks it to.',
    rewards: ['Story: the Super Spirit Bomb', 'Story: Goodbye, Buu'],
    setup,
    phases: [P.wishes, P.call, P.beating, P.goodbuu, P.rally, P.launch, P.lockup, P.wish, P.push, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.superSpiritBomb = { PUSH };
})();
