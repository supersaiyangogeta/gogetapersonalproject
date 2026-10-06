/*
 * CHAPTER 5 — ANDROID SAGA (between "Ten in the Morning" and "The Laboratory Door")
 * Mission "The Fever" (canon, intentionally cinematic).
 *
 * Canon beat: Goku went down with the heart virus in the middle of his fight with
 * Android 19 and was flown home. Chi-Chi sits with him while the others go after
 * the Androids. The master specification allows a mission to be intentionally
 * cinematic; this one is, and it is placed here — not inside the Cell Games —
 * because this is where the story puts Goku in that bed.
 *
 * Phases: HOME (scene `goku_bed`) → AFTER (the story moves on).
 *
 * Stage: The Son House (`son_house`, an interior built for this scene).
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const scripted = () => ({ update: () => SL.emptyIntent() });

  function setup(battle) {
    const b = battle;
    const L = b.stage.landmarks;
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: new V3(L.bed.x, 0, L.bed.z), startKi: 0 });
    goku.cannotDie = true;
    goku.untargetable = true;
    goku.controller = scripted();
    const chichi = b.spawn({ charId: 'chichi', team: 0, pos: new V3(L.stool.x, 0, L.stool.z), startKi: 0 });
    chichi.cannotDie = true;
    chichi.untargetable = true;
    chichi.controller = scripted();
    b.story = { goku, chichi };
  }

  const def = {
    id: 'android_fever',
    canon: true,
    chapter: 'CHAPTER 5 · ANDROID SAGA',
    title: 'The Fever',
    subtitle: 'Mount Paozu · Age 767 · the heart virus',
    character: 'goku',
    stage: 'son_house',
    parTime: 90,
    rules: { allowTransform: false, allowUltimates: false },
    cinematic: true,
    blurb: 'He always comes home. This time he came home carried.',
    rewards: [],
    setup,
    phases: [
      {
        id: 'home',
        run: function* (m) {
          const b = m.battle;
          m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
          for (const f of b.fighters) f.controller = scripted();
          yield* SL.Cinema.play(m, 'goku_bed');
        },
      },
      {
        id: 'after',
        run: function* (m) {
          m.lock(true);
          m.endShot();
          m.flags.feverDone = true;
          m.title('CHAPTER 5 · ANDROID SAGA', 'MEANWHILE', 'Vegeta and Trunks go after Dr. Gero', 3.4);
          yield* m.cine(3.6);
        },
      },
    ],
  };

  SL.data.missions[def.id] = def;
})();
