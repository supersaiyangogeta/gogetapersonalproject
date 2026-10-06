/*
 * CHAPTER 15 — THE END OF Z: "PEACE" (the owner's epilogue brief, 2026-10-03: the end of the Buu Saga as a
 * conclusion, not boss → text → credits). Played as Goku. Age 774.
 *
 *   QUIET     (scene)   the Sacred World after the Super Spirit Bomb; Goku's legs gone; the Kais and Dende
 *   WALK *    (play)    the player walks Goku to Vegeta — and can do nothing else: a third of his speed, no
 *                       flight, no attacks, a stumble on the way. "That was everything I had."
 *   HEAL      (scene)   Vegeta's eyes; "You took your time"; "Heal Buu first"; Buu wakes up hungry
 *   CRISIS    (scene)   Vegeta's palm at the fat one; Mr. Satan over him; the player's cue: Goku's hand on the
 *                       wrist; "Vegeta, let it go..." / "Hmph. Do whatever you want."
 *   RIVALS    (scene)   sunset on the rim: thanks, a promise of the next fight, a hand up
 *   HOME      (scene)   Kami's Lookout: Chi-Chi, Bulma, the boys, Piccolo, cake for Buu
 *   MEMORY    (scene)   Shenron: the world forgets Majin Buu; Mr. Satan's idea; MISTER BUU
 *   WORLD     (scene)   the Earth given back: people coming home, the plaza chanting SA-TAN, Dende watching
 *   SENSE     (scene)   night: Goku feels something far to the south; a newborn; "...I'll be waiting."
 *   AFTER               the chapter card
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const PC = () => SL.data.peace;
  const EK = () => SL.data.endzKit;

  function setup(battle) {
    const b = battle, pc = PC(), sb = SL.data.spiritBomb;
    sb.field(b);
    pc.scar(b);
    b.on('stageChanged', (e) => {
      if (e.id === 'kai_world') {
        sb.field(b);
        pc.scar(b);
      }
    });
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: pc.RIM.clone(), startKi: 0 });
    const s = (charId, x, z, extra) => b.spawn(Object.assign({ charId, team: 0, pos: new V3(x, 0, z) }, extra || {}));
    const story = {
      goku,
      vegeta: s('vegeta', pc.VEG.x, pc.VEG.z, { startKi: 0 }),
      satan: s('mr_satan', pc.SAT.x, pc.SAT.z),
      fat: s('majin_buu', pc.FAT.x, pc.FAT.z),
      dende: s('dende', -40, 40),
      kai: s('kibitoshin', -42, 40),
      elder: s('elder_kai', -44, 40),
      chichi: s('chichi', 60, 60),
      bulma: s('bulma', 62, 60),
      gohan: s('adult_gohan', 64, 60, { wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } }),
      videl: s('videl', 66, 60, { wardrobe: { outfit: 'videl_tournament', hair: 'hair_videl_short' } }),
      goten: s('goten', 68, 60),
      trunks: s('kid_trunks', 70, 60),
      piccolo: s('piccolo', 72, 60),
      krillin: s('krillin', 74, 60),
    };
    for (const k of Object.keys(story)) {
      const f = story[k];
      f.cannotDie = true;
      if (f === goku) continue;
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
    }
    for (const k of ['dende', 'kai', 'elder', 'chichi', 'bulma', 'gohan', 'videl', 'goten', 'trunks', 'piccolo', 'krillin']) story[k].setHidden(true);
    goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true };
    goku.ki = 0;
    // what the fight left on them: Goku's gi in rags, the prince beaten black and blue
    if (goku.setDamage) goku.setDamage(2);
    if (goku.model.setBattered) goku.model.setBattered(true);
    if (story.vegeta.setDamage) story.vegeta.setDamage(2);
    if (story.vegeta.model.setBattered) story.vegeta.model.setBattered(true);
    b.story = story;
    field(b);
  }

  /** The Sacred World as the end of "Goodbye, Buu" left it (every Sacred World phase restages from here). */
  function field(b, m) {
    const S = b.story, pc = PC();
    const put = (f, p, mode, pose, face, look) => {
      if (m) m.space(f, 'ground', { pos: p, face: look });
      else {
        K.place(f, K.ground(b, p));
        if (look) K.faceTo(f, look);
      }
      f.setHidden(false);
      f.setState('scripted', { pose, expression: face });
    };
    put(S.goku, pc.RIM, 'ground', 'pe_slumpSit', 'soft', pc.C);
    put(S.vegeta, pc.VEG, 'ground', 'lieBack', 'ko', pc.C);
    put(S.satan, pc.SAT, 'ground', 'pe_satanSit', 'hurt', pc.C);
    put(S.fat, pc.FAT, 'ground', 'knockdown', 'ko', pc.C);
  }

  /** The Kais and Dende on the field (a phase started past the arrival). */
  function kais(m) {
    const S = m.battle.story, pc = PC(), A = pc.ARRIVE;
    for (const [f, dx, dz] of [[S.dende, 0, 0], [S.kai, 1.4, -0.9], [S.elder, -1.3, -1]]) {
      f.setHidden(false);
      m.space(f, 'ground', { pos: new V3(A.x + dx, 0, A.z + dz), face: S.vegeta.pos });
      f.setState('scripted', { pose: 'idle', expression: 'calm' });
    }
  }

  const P = {};
  const scene = (id, sceneId, prep) => ({
    id,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      if (prep) prep(m);
      yield* SL.Cinema.play(m, sceneId);
    },
  });

  P.quiet = {
    id: 'quiet',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'pe_quiet');
    },
  };

  /** THE WALK: the player has his legs back, barely. Walk to Vegeta; nothing else answers. */
  P.walk = {
    id: 'walk',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      if (!m.flags.kaisArrived) {
        field(b, m);
        kais(m);
        const c = v.chest();
        m.space(S.dende, 'ground', { pos: new V3(c.x + 1.1, 0, c.z - 0.5) });
        K.faceTo(S.dende, c);
        S.dende.setState('scripted', { pose: 'pe_heal', expression: 'calm' });
      }
      if (b.player !== g) b.switchPlayer(g, { force: true });
      g.target = null;
      // he gets up the hard way
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'full', angle: 'three' }, 2);
      g.setState('scripted', { pose: 'pe_tryStand', expression: 'grit' });
      yield* m.cine(1.3);
      g.setState('free');
      m.endShot();
      const off = EK().exhausted(m, g);
      const glow = () => {
        const n = b.frame;
        if (n % 3 === 0) b.vfx.trail(v.chest().add(new V3(Math.sin(n * 1.7) * 0.3, (Math.sin(n * 0.9) + 1) * 0.2, Math.cos(n * 2.3) * 0.3)), 0x8aff9a, 0.14, 0.6);
      };
      m.tickHooks.push(glow);
      m.lock(false);
      b.aiLocked = true;
      m.objective('walk', 'Walk to Vegeta', { icon: 'target' });
      const goal = () => v.pos.clone().setY(g.pos.y);
      const start = Math.max(4, g.pos.distanceTo(goal()));
      // halfway, the knee goes
      yield () => b.skipRequested || g.pos.distanceTo(goal()) < start * 0.55;
      if (!b.skipRequested) {
        m.lock(true);
        g.setState('scripted', { pose: 'pe_stumble', expression: 'hurt' });
        b.vfx.dust(g.pos.clone().add(new V3(0, 0.1, 0)), 0.8, 6);
        b.sfx('jump', g, { vol: 0.5, pitch: 0.7 });
        m.say('goku', 'Hah... hah...', 1.6, { style: 'quiet' });
        yield* m.cine(1.1);
        g.setState('free');
        m.lock(false);
        b.aiLocked = true;
      }
      yield () => b.skipRequested || g.pos.distanceTo(goal()) < 2.6;
      K.unhook(m, glow);
      off();
      m.complete('walk');
      m.lock(true);
      // where he ended up: at Vegeta's feet, looking down at him
      const d = g.pos.clone().sub(v.pos).setY(0);
      if (d.length() > 2.6 || d.length() < 0.8) {
        d.setLength(1.8);
        m.space(g, 'ground', { pos: v.pos.clone().add(d), face: v.pos });
      }
      K.faceTo(g, v.pos);
      g.setState('scripted', { pose: 'exhausted', expression: 'soft' });
      m.flags.walked = true;
    },
  };

  P.heal = scene('heal', 'pe_heal', (m) => {
    const S = m.battle.story;
    if (m.flags.walked) return;
    // started here: Vegeta on his back, Dende at his side, Goku standing over them
    field(m.battle, m);
    kais(m);
    const v = S.vegeta, c = v.chest();
    m.space(S.dende, 'ground', { pos: new V3(c.x + 1.1, 0, c.z - 0.5) });
    K.faceTo(S.dende, c);
    S.dende.setState('scripted', { pose: 'pe_heal', expression: 'calm' });
    m.space(S.goku, 'ground', { pos: v.pos.clone().add(new V3(1.6, 0, 1.4)), face: v.pos });
    S.goku.setState('scripted', { pose: 'exhausted', expression: 'soft' });
  });
  P.crisis = scene('crisis', 'pe_crisis', (m) => {
    const S = m.battle.story;
    if (!m.flags.healed) {
      kais(m);
      if (S.vegeta.model.setBattered) S.vegeta.model.setBattered(false);
      S.vegeta.setState('scripted', { pose: 'idle', expression: 'angry' });
      S.fat.setState('scripted', { pose: 'bu_sit', expression: 'calm' });
      m.space(S.goku, 'ground', { pos: S.vegeta.pos.clone().add(new V3(1.8, 0, -0.6)), face: S.vegeta.pos });
    }
  });
  P.rivals = scene('rivals', 'pe_rivals', (m) => {
    const S = m.battle.story;
    // the others back by the outcrop, out of the shot
    for (const k of ['satan', 'fat', 'dende', 'kai', 'elder']) S[k].setHidden(true);
    if (S.vegeta.model.setBattered) S.vegeta.model.setBattered(false);
  });
  P.home = scene('home', 'pe_home');
  P.memory = scene('memory', 'pe_memory', (m) => {
    if (m.battle.stage.def.id !== 'lookout') PC().toLookout(m, true);
  });
  P.world = scene('world', 'pe_world');
  P.sense = scene('sense', 'pe_sense');

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 0.8);
      yield* m.cine(1);
      m.endShot();
      m.title(m.def.chapter, 'PEACE', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'buu_peace',
    canon: true,
    chapter: 'CHAPTER 15 · PEACE',
    title: 'Peace',
    subtitle: 'After the Storm · Age 774',
    character: 'goku',
    stage: 'kai_world',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Kid Buu is gone. The smoke is still going up out of the crater — and for the first time in a long time, nobody is trying to kill anybody.',
    rewards: ['Story: Peace', 'Story: the last wish'],
    setup,
    phases: [P.quiet, P.walk, P.heal, P.crisis, P.rivals, P.home, P.memory, P.world, P.sense, P.after],
  };
  SL.data.missions[def.id] = def;
})();
