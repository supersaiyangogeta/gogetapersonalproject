/*
 * CHAPTER 14 — BUU SAGA: KID BUU (Buu Saga priority 11, 2026-10-02)
 * Mission "Pure Evil" (canon; played as Goku). Everything Buu absorbed is out of him — and what is left
 * is the original: no mind, only destruction. He does not fight them. He throws a sun at the planet.
 *
 *   BIRTH   (scene)  the steam, the small thing standing up in it, the scream; a mesa gone for nothing
 *   BURST   (scene)  up into the sky, a ball of light growing over his head; Kibito Kai; "We can't save
 *                    everyone — the Dragon Balls can bring the rest back"
 *   FETCH   (scene)  Instant Transmission to the Lookout (a cue: special 2), Dende and Mr. Satan, and back
 *                    (a cue); everyone holding on to the Kai as the ball comes down
 *   BOOM    (scene)  the Earth from space, and then no Earth; a pink speck in the dark, laughing
 *                    (world state: SL.Save.data.flags.earthDestroyed)
 *   AFTER            the chapter card
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(-3, 18), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(-1.6, 18), startKi: 100 });
    const kid = b.spawn({ charId: 'kid_buu', team: 1, pos: at(0, -6), startKi: 220, tags: { boss: true, priority: true } });
    const kai = b.spawn({ charId: 'kibitoshin', team: 0, pos: at(-5, 21) });
    const dende = b.spawn({ charId: 'dende', team: 0, pos: at(-40, 40) });
    const satan = b.spawn({ charId: 'mr_satan', team: 0, pos: at(-42, 40) });
    // the four they pulled out of Buu, still out cold where they were left
    const gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: at(3, 18), wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } });
    const goten = b.spawn({ charId: 'goten', team: 0, pos: at(4.4, 18) });
    const trunks = b.spawn({ charId: 'kid_trunks', team: 0, pos: at(5.2, 18.4) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(6.4, 18) });
    for (const f of [vegeta, kid, kai, dende, satan, gohan, goten, trunks, piccolo]) {
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
      f.cannotDie = true;
    }
    goku.cannotDie = true;
    for (const f of [gohan, goten, trunks, piccolo]) {
      K.faceTo(f, kid.pos);
      f.setState('scripted', { pose: 'lieBack', expression: 'ko' });
    }
    for (const f of [kai, dende, satan]) f.setHidden(true);
    K.faceTo(goku, kid.pos);
    K.faceTo(vegeta, kid.pos);
    K.faceTo(kid, goku.pos);
    b.story = { goku, vegeta, kid, kai, dende, satan, gohan, goten, trunks, piccolo };
  }

  const P = {};
  const scene = (id, sceneId, title) => ({
    id,
    run: function* (m) {
      m.lock(true);
      if (title) m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      for (const f of m.battle.fighters) if (f !== m.battle.player) f.controller = K.scripted();
      yield* SL.Cinema.play(m, sceneId);
    },
  });
  P.birth = scene('birth', 'kb_birth', true);
  P.burst = scene('burst', 'kb_burst');
  P.fetch = Object.assign(scene('fetch', 'kb_fetch'), { checkpoint: true });
  P.boom = scene('boom', 'kb_boom');
  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'PURE EVIL', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_kidbuu',
    canon: true,
    chapter: 'CHAPTER 14 · BUU SAGA',
    title: 'Pure Evil',
    subtitle: 'The last day of the Earth · Age 774',
    character: 'goku',
    stage: 'rocky_canyon',
    parTime: 180,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Everything Buu ever swallowed is out of him. What is left is the original — and it does not want a fight. It wants the planet gone.',
    rewards: ['Story: Kid Buu', 'Story: the Earth destroyed'],
    setup,
    phases: [P.birth, P.burst, P.fetch, P.boom, P.after],
  };
  SL.data.missions[def.id] = def;
})();
