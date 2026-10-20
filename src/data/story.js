/*
 * Story structure: the canon timeline (chapters in chronological order) and
 * the What-If branches, kept in separate lists. Missions live in
 * src/data/missions/*.js; this file only orders them and states honestly
 * which chapters exist in this build.
 *
 * status: 'playable' | 'in-development' (shown as a locked, non-selectable card)
 */
(function () {
  'use strict';

  SL.data.story = {
    chapters: [
      {
        id: 'prologue',
        head: 'PROLOGUE · AGE 737',
        title: 'Planet Vegeta',
        status: 'playable',
        missions: ['prologue_final_stand'],
      },
      {
        id: 'saiyan1',
        head: 'CHAPTER 1 · AGE 761',
        title: 'Saiyan Saga: Raditz',
        status: 'playable',
        missions: ['saiyan_brothers'],
        requires: null,
      },
      {
        id: 'saiyan2',
        head: 'CHAPTER 2 · AGE 761–762',
        title: 'Saiyan Saga: One Year',
        status: 'playable',
        missions: ['saiyan_survival', 'saiyan_snakeway', 'saiyan_kingkai'],
      },
      {
        id: 'saiyan3',
        head: 'CHAPTER 3 · AGE 762',
        title: 'Saiyan Saga: The Saiyans Arrive',
        status: 'playable',
        missions: ['saiyan_saibamen', 'saiyan_nappa', 'saiyan_vegeta'],
        blurb: 'Nappa and Vegeta land. The Z Fighters make their stand while Goku races back.',
      },
      {
        id: 'namek1',
        head: 'CHAPTER 4 · AGE 762',
        title: 'Namek Saga: Arrival (in development)',
        status: 'playable',
        missions: ['namek_hunted', 'namek_vegeta', 'namek_zarbon', 'namek_rematch', 'namek_guru', 'namek_guldo', 'namek_recoome', 'namek_ginyu_pair', 'namek_ginyu', 'namek_frog', 'namek_nail', 'namek_frieza1', 'namek_gohan_frieza2', 'namek_frieza2', 'namek_vegeta_end', 'namek_goku', 'namek_kaioken20', 'namek_spirit_bomb', 'namek_super_saiyan', 'namek_end', 'namek_aftermath'],
        blurb: 'Vegeta, Krillin and Gohan race Frieza for the Namekian Dragon Balls.',
      },
      {
        id: 'android1',
        head: 'CHAPTER 5 · AGE 764',
        title: 'Android Saga: The Stranger (in development)',
        status: 'playable',
        missions: ['android_trunks', 'android_warning', 'android_nineteen', 'android_fever', 'android_lab', 'android_road'],
        blurb: 'Frieza comes to Earth in a rebuilt body, and somebody nobody recognises is waiting for him.',
      },
      {
        id: 'cell1',
        head: 'CHAPTER 6 · AGE 767',
        title: 'Cell Saga: The Town That Stopped (in development)',
        status: 'playable',
        missions: ['cell_first', 'cell_semi', 'cell_perfect', 'cell_chamber', 'cell_games', 'cell_gohan', 'cell_rampage', 'cell_goodbye', 'cell_fatherson', 'cell_future'],
        blurb: 'Something else came out of that laboratory, and it has been eating towns.',
      },
      {
        id: 'buu1',
        head: 'CHAPTER 7 · AGE 774',
        title: 'Buu Saga: Seven Years Later (in development)',
        status: 'playable',
        missions: ['buu_years', 'buu_saiyaman', 'buu_kids'],
        blurb: 'Seven quiet years: a student with a secret identity, two children who fight like their fathers, and a wizard nobody has noticed yet.',
      },
      {
        id: 'buu2',
        head: 'CHAPTER 8 · AGE 774',
        title: 'Buu Saga: The World Tournament (in development)',
        status: 'playable',
        missions: ['buu_flight', 'buu_junior', 'buu_spopovich', 'buu_kibito'],
        blurb: 'A flying lesson, a tournament, and a stranger in the draw who is not there for the prize money.',
      },
      {
        id: 'buu3',
        head: 'CHAPTER 9 · AGE 774',
        title: 'Buu Saga: The Wizard (in development)',
        status: 'playable',
        missions: ['buu_pursuit', 'buu_puipui', 'buu_yakon', 'buu_dabura'],
        blurb: "Babidi's ship, Babidi's people, and the one of them he wants most.",
      },
      {
        id: 'buu4',
        head: 'CHAPTER 10 · AGE 774',
        title: 'Buu Saga: Majin (in development)',
        status: 'playable',
        missions: ['buu_majin', 'buu_pride', 'buu_awakening', 'buu_sacrifice'],
        blurb: 'A prince lets a wizard in. Two old rivals finally fight without holding back — and the fight feeds the thing in the ball.',
      },
      {
        id: 'buu5',
        head: 'CHAPTER 11 · AGE 774',
        title: 'Buu Saga: Buying Time (in development)',
        status: 'playable',
        missions: ['buu_ssj3', 'buu_fusion', 'buu_split', 'buu_timechamber'],
        blurb: 'Goku has one day left on Earth and a monster to stall while two boys learn to become one. Out in the wastes, the World Champion makes a friend — and two rifles take him away.',
      },
      {
        id: 'buu6',
        head: 'CHAPTER 12 · AGE 774',
        title: 'Buu Saga: The Ultimate (in development)',
        status: 'playable',
        missions: ['buu_zsword', 'buu_ultimate'],
        blurb: 'On the Kais\' own world a sword that nobody can pull out, and a Kai sealed inside it for seventy-five million years. Gohan comes back to Earth as something new.',
      },
      {
        id: 'buu7',
        head: 'CHAPTER 13 · AGE 774',
        title: 'Buu Saga: Vegito (in development)',
        status: 'playable',
        missions: ['buu_potara', 'buu_earring', 'buu_prince', 'buu_vegito', 'buu_supervegito', 'buu_inside'],
        blurb: 'An old Kai\'s last life, a pair of earrings, and a son who cannot catch. Buu eats the strongest fighter on Earth — and a prince comes back from the dead in time to hate the only plan left.',
      },
      {
        id: 'buu8',
        head: 'CHAPTER 14 · AGE 774',
        title: 'Buu Saga: Kid Buu',
        status: 'playable',
        missions: ['buu_kidbuu', 'buu_sacred', 'buu_spiritbomb'],
        blurb: 'The original Buu: no mind, only destruction. He throws a sun at the Earth, follows the survivors to the Sacred World of the Kai, and a prince buys one minute with everything he has — and then a whole planet raises its hands.',
      },
      {
        id: 'buu9',
        head: 'CHAPTER 15 · AGE 774',
        title: 'Peace',
        status: 'playable',
        missions: ['buu_peace'],
        blurb: 'The smoke clears. The world forgets what Buu did, and is given back.',
      },
      // DRAGON BALL SUPER begins here (Age 778): the chronological place of the Battle of Gods is between the end
      // of the Buu Saga and the 28th World Tournament (Age 784) — the End of Z follows it
      {
        id: 'super1',
        head: 'CHAPTER 16 · AGE 778',
        title: 'Battle of Gods',
        status: 'playable',
        missions: ['bog_awaken', 'bog_kingkai', 'bog_party', 'bog_wrath', 'bog_ritual', 'bog_battle', 'bog_sphere'],
        blurb: 'A god wakes up after thirty-nine years with a dream about another god. He finds Goku on King Kai\'s planet, a party on Bulma\'s ship, a tray of pudding — and six Saiyans who can make a Super Saiyan God.',
      },
      // Resurrection of F (Age 779): the invasion, then Goku vs Frieza — Golden Frieza and Goku's Blue.
      // Then the finale (rof_finale): Vegeta's lasting main-story Blue, Earth destroyed, Whis' rewind, Goku's finish.
      {
        id: 'super_rof',
        head: 'CHAPTER 17 · AGE 779',
        title: 'Resurrection of F',
        status: 'playable',
        missions: ['rof_invasion', 'rof_goku', 'rof_finale'],
        blurb: "Frieza's last soldiers gather the Dragon Balls and wish their emperor back to life. He has trained for the first time in his life — and he has brought a thousand soldiers to Earth.",
      },
      // Universe 6 (Age 780): Champa's tournament — the five early rounds, Vegeta vs Cabba, Vegeta vs Hit, and Goku vs
      // Hit (Blue Kaioken; Goku steps out, Hit withdraws, Universe 7 wins, Zeno arrives)
      {
        id: 'super_u6',
        head: 'CHAPTER 18 · AGE 780',
        title: 'Universe 6',
        status: 'playable',
        // the early rounds in tournament order, then Vegeta vs Cabba and Vegeta vs Hit (cleared saves keep later cards open)
        missions: ['u6_botamo', 'u6_frost_goku', 'u6_frost_piccolo', 'u6_frost_vegeta', 'u6_magetta', 'u6_cabba', 'u6_hit', 'u6_goku_hit'],
        blurb: "Beerus' twin brother wants Earth's food, and the Super Dragon Balls to take it with. Five fighters a side on a nameless planet — and Universe 6 has Saiyans too.",
      },
      // The Future Trunks Saga (2026-10-17, the owner's moveset roadmap §8.18): Trunks' ruined future, Goku Black and
      // Zamasu. Built mission by mission; the chapter grows as they are added
      {
        id: 'super_future',
        head: 'CHAPTER 19 · AGE 780',
        title: 'Future Trunks',
        status: 'playable',
        missions: ['ft_black', 'ft_rose', 'ft_hakai', 'ft_zero', 'ft_genuine', 'ft_scythe', 'ft_vegito', 'ft_hope'],
        blurb: "In Trunks' ruined future a man with Goku's face is hunting the last of humanity — and Trunks has one tank of fuel left to reach the past.",
      },
      // The Assassin (Age 780, after the Future Trunks saga): Hit's contract on Goku
      {
        id: 'super_hit',
        head: 'CHAPTER 20 · AGE 780',
        title: 'The Assassin',
        status: 'playable',
        missions: ['hit_contract'],
        blurb: "Someone has paid the universe's best assassin to kill Son Goku. Goku chooses where — and fires one blast into the night sky before it starts.",
      },
      // Universe Survival (Age 780): Zeno's tournament is announced; Goku builds a team of ten
      {
        id: 'super_survival',
        head: 'CHAPTER 21 · AGE 780',
        title: 'Universe Survival',
        status: 'playable',
        missions: ['us_ranger', 'us_gohan', 'us_frieza'],
        blurb: 'Eight universes, ten fighters each, and the losers erased. Goku goes recruiting — a park ranger who will not leave his island, a son who has to show he can fight seriously again, and a tenth fighter back from Hell for one day.',
      },
      // The Tournament of Power (Age 780): eight universes on one platform in the void
      {
        id: 'super_top',
        head: 'CHAPTER 22 · AGE 780',
        title: 'The Tournament of Power',
        status: 'playable',
        missions: ['top_jiren', 'top_saiyans', 'top_kefla', 'top_toppo', 'top_vegeta', 'top_mui', 'top_finale'],
        blurb: 'Eight universes, ten fighters each, one platform hanging in the void — and every universe that loses is erased. The strongest fighter there is a man called Jiren.',
      },
      {
        id: 'endz',
        head: 'CHAPTER 23 · AGE 784',
        title: 'The End of Z',
        status: 'playable',
        missions: ['endz_village', 'endz_tournament'],
        blurb: 'Ten years after Buu, in a village at the far end of the south, a boy hits a rock — and at the World Tournament, Goku finally finds the one he has been waiting for.',
      },
    ],

    whatIf: [
      {
        id: 'whatif_signal',
        mission: 'whatif_signal',
        branchOf: 'prologue_final_stand',
        unlock: { missionComplete: 'prologue_final_stand' },
        hint: 'Clear the Prologue: "The Final Stand"',
      },
      {
        id: 'whatif_raditz',
        mission: 'whatif_raditz',
        branchOf: 'saiyan_brothers',
        unlock: { missionComplete: 'saiyan_brothers' },
        hint: 'Clear Chapter 1: "A Brother From Space"',
      },
      {
        id: 'whatif_tail',
        mission: 'whatif_tail',
        branchOf: 'saiyan_brothers',
        unlock: { missionComplete: 'saiyan_brothers' },
        hint: 'Clear Chapter 1: "A Brother From Space"',
      },
      {
        id: 'whatif_prince',
        mission: 'whatif_prince',
        branchOf: 'saiyan_vegeta',
        unlock: { missionComplete: 'saiyan_vegeta' },
        hint: 'Clear Chapter 3: "The Saiyan Prince"',
      },
      {
        id: 'whatif_twenty',
        mission: 'whatif_twenty',
        branchOf: 'namek_kaioken20',
        unlock: { missionComplete: 'namek_kaioken20' },
        hint: 'Clear Chapter 4: "Kaio-ken Times Twenty"',
      },
      {
        id: 'whatif_piccolo',
        mission: 'whatif_piccolo',
        branchOf: 'saiyan_nappa',
        unlock: { missionComplete: 'saiyan_nappa' },
        hint: 'Clear Chapter 3: "Nappa Attacks"',
      },
      {
        id: 'whatif_trunks',
        mission: 'whatif_trunks',
        branchOf: 'saiyan_nappa',
        unlock: { missionComplete: 'saiyan_nappa' },
        hint: 'Clear Chapter 3: "Nappa Attacks"',
      },
      {
        id: 'whatif_vegeta',
        mission: 'whatif_vegeta',
        branchOf: 'namek_super_saiyan',
        unlock: { missionComplete: 'namek_super_saiyan' },
        hint: 'Clear Chapter 4: "The Super Saiyan"',
      },
      {
        id: 'whatif_frieza',
        mission: 'whatif_frieza',
        branchOf: 'namek_super_saiyan',
        unlock: { missionComplete: 'namek_super_saiyan' },
        hint: 'Clear Chapter 4: "The Super Saiyan"',
      },
      {
        id: 'whatif_cell',
        mission: 'whatif_cell',
        branchOf: 'cell_fatherson',
        unlock: { missionComplete: 'cell_fatherson' },
        hint: 'Clear Chapter 6: "Father-Son Kamehameha"',
      },
      // the secret battle: Goku and Vegeta finally dance — and fight what they make (unlocks Gogeta)
      {
        id: 'whatif_gogeta',
        mission: 'whatif_gogeta',
        branchOf: 'buu_spiritbomb',
        // the story opens it — or Shenron does ("Show me something that never happened")
        unlock: { any: [{ missionComplete: 'buu_spiritbomb' }, { flag: 'wish_fusion' }] },
        hint: 'Clear Chapter 14: "Goodbye, Buu" — or ask the Eternal Dragon',
        secret: true,
      },
    ],

    /**
     * MOVIES & SPECIALS (MASTER_SPEC "Movies and specials are separate"): never in the canon order,
     * never on the timeline as chronology. Each film is its own list with its own progress
     * (SL.Save track 'movies'). `placedAfter` is the canon mission whose world the film assumes —
     * it opens the film, and it is where the film's fighters stand for form locks and wardrobe eras.
     * A mission opens when every mission in its `after` list is cleared (default: the one before it).
     */
    movies: [
      {
        id: 'fusion_reborn',
        head: 'MOVIE 1 · NOT CANON',
        title: 'Fusion Reborn',
        subtitle: 'Janemba — The Collapse of Dimensions',
        // the film's world: Goku back in the Other World with Super Saiyan 3, Vegeta dead since his
        // sacrifice, the Fusion Dance already shown to the boys, Gohan and Videl together on Earth
        placedAfter: 'buu_fusion',
        unlock: { missionComplete: 'buu_fusion' },
        hint: 'Clear Chapter 11: "Fusion"',
        blurb: 'A young ogre forgets to watch a machine, and the evil it was cleaning out of a million souls becomes a child with the power to fold the afterlife in half. The dead walk on Earth — and two Saiyans who have never agreed on anything have to dance.',
        missions: [
          { id: 'fr_cleansing' },
          { id: 'fr_janemba' },
          // the two Earth missions open together, while the Other World is still falling apart
          { id: 'fr_gohan', after: ['fr_janemba'] },
          { id: 'fr_boys', after: ['fr_janemba'] },
          { id: 'fr_vegeta', after: ['fr_gohan', 'fr_boys'] },
          { id: 'fr_veku' },
          { id: 'fr_gogeta' },
        ],
        // optional replay content, apart from the film itself
        challenges: [
          { id: 'fr_x_fat', after: ['fr_janemba'] },
          { id: 'fr_x_earth', after: ['fr_gohan'] },
          { id: 'fr_x_dance', after: ['fr_gogeta'] },
          { id: 'fr_x_super', after: ['fr_gogeta'] },
        ],
      },
      {
        id: 'super_broly',
        head: 'MOVIE 2 · MOVIE CONTINUITY',
        title: 'Dragon Ball Super: Broly',
        subtitle: 'The Legendary Super Saiyan',
        // the film's world: after the Battle of Gods — Goku and Vegeta trained by Whis, the God forms known.
        // Its forms arrive at the original film checkpoints, independently of canon progress
        // (formGivenBy / formGivenByMovie: Mission._lockUnearnedForms).
        placedAfter: 'bog_sphere',
        unlock: { missionComplete: 'bog_sphere' },
        hint: 'Clear Chapter 16: "My World"',
        blurb: 'A boy exiled to a dead planet for being too strong, and the father who followed him there to make him a weapon. Forty years later Frieza finds them both — and brings them to a glacier on Earth, where two Saiyans who have been training with a god are waiting.',
        // `title` on an entry: a mission of the film not built yet (an honest "in development" card on the Movies
        // screen; the lock chain steps over it, see movieLocked). The film's nine parts, in its own order: part 3
        // ("A Saiyan's Fury") is played in two missions, the first clash and the wrath.
        missions: [
          { id: 'bb_planet' },
          { id: 'bb_vampa' },
          { id: 'bb_clash' },
          { id: 'bb_wrath' },
          { id: 'bb_goku' },
          { id: 'bb_legend' },
          { id: 'bb_alliance' },
          { id: 'bb_fusion' },
          { id: 'bb_gogeta' },
          { id: 'bb_epilogue' },
        ],
        challenges: [],
      },
      {
        id: 'super_hero',
        head: 'MOVIE 3 · MOVIE CONTINUITY',
        title: 'Dragon Ball Super: Super Hero',
        subtitle: 'The Red Ribbon\'s last weapon',
        // (2026-10-17, the owner's moveset roadmap #63) the film after the Tournament of Power: built only as far as the
        // Beast — one mission, Gohan against Cell Max; the rest of the film is not built
        placedAfter: 'top_finale',
        unlock: { missionComplete: 'top_finale' },
        hint: 'Clear Chapter 22: "The Final Battle"',
        blurb: 'The Red Ribbon Army is back with androids of its own and one weapon it should never have woken. Gohan has spent years as a scholar — until Piccolo goes down in front of him.',
        missions: [{ id: 'sh_beast' }],
        challenges: [],
      },
    ],
  };

  /** The film a movie mission (or challenge) belongs to, or null. */
  SL.data.movieOf = function (id) {
    for (const mv of SL.data.story.movies || []) if (mv.missions.some((e) => e.id === id) || (mv.challenges || []).some((e) => e.id === id)) return mv;
    return null;
  };

  /** Every movie mission and challenge that exists in this build, film by film. */
  SL.data.movieOrder = function () {
    const out = [];
    for (const mv of SL.data.story.movies || []) for (const e of mv.missions.concat(mv.challenges || [])) if (SL.data.missions[e.id]) out.push(e.id);
    return out;
  };

  /**
   * Is a movie mission locked? Closed while the film's canon gate is not cleared (gateOpen), then
   * open once every mission in its `after` list is cleared (a mission without one follows the film
   * mission before it). Cleared missions never lock. missionResult(id): SL.Save.missionResult.
   */
  SL.data.movieLocked = function (id, missionResult, gateOpen) {
    if (SL.Dev && SL.Dev.unlockAll()) return false;
    const mv = SL.data.movieOf(id);
    if (!mv) return false;
    const own = missionResult(id);
    if (own && own.completed) return false;
    if (!gateOpen) return true;
    const i = mv.missions.findIndex((e) => e.id === id);
    const entry = i >= 0 ? mv.missions[i] : mv.challenges.find((e) => e.id === id);
    const after = entry.after || (i > 0 ? [SL.data.movieBefore(mv, i)].filter(Boolean) : []);
    return after.some((a) => !(missionResult(a) && missionResult(a).completed));
  };

  /** The last mission before the i-th of a film that exists in this build (a film built out of order skips the rest). */
  SL.data.movieBefore = function (mv, i) {
    for (let k = i - 1; k >= 0; k--) if (SL.data.missions[mv.missions[k].id]) return mv.missions[k].id;
    return null;
  };

  /**
   * WHO GETS WHAT, AND WHEN. The canon mission that hands each transformation over, keyed
   * `<character>:<form>`. Every canon mission BEFORE that one locks the form, whatever the
   * mission's own `lockedForms` says (Mission._lockUnearnedForms) — the owner found the HUD
   * offering Super Saiyan three missions before Goku has ever turned Super Saiyan.
   */
  SL.data.formGivenBy = {
    'goku:ssj': 'namek_super_saiyan',
    'piccolo:nail': 'namek_nail',
    'krillin:potential': 'namek_guru',
    'future_trunks:ssj': 'android_trunks',
    'adult_gohan:ssj2': 'cell_gohan',
    // Gohan at eleven: his first gold in the Room of Spirit and Time, the second when 16 dies
    'teen_gohan:ssj': 'cell_chamber',
    'teen_gohan:ssj2': 'cell_gohan',
    'goten:ssj': 'buu_kids',
    'kid_trunks:ssj': 'buu_kids',
    // Vegeta's first gold: revealed against 19 after three years in space (no Saiyan-Saga or Namek Vegeta has it)
    'vegeta:ssj': 'android_nineteen',
    'vegeta:majin': 'buu_majin',
    'vegeta:ssj2': 'buu_majin',
    'goku:ssj2': 'buu_pride',
    'goku:ssj3': 'buu_ssj3',
    'gotenks:ssj': 'buu_fusion',
    'gotenks:ssj3': 'buu_timechamber',
    'adult_gohan:ultimate': 'buu_zsword',
    'vegito:ssj': 'buu_supervegito',
    // Battle of Gods: the God form from the ritual, its power kept at the edge of space
    'goku:god': 'bog_ritual',
    'goku:godki': 'bog_sphere',
    // Resurrection of F: the main story reveals Goku's Blue and Frieza's Golden form together.
    'goku:blue': 'rof_goku',
    'frieza:golden': 'rof_goku',
    // ...and Vegeta's Blue in the finale, against Golden Frieza (the Broly film keeps its own reveal: formGivenByMovie)
    'vegeta:blue': 'rof_finale',
    // Frieza's 100%: nothing before the dying planet can reach it
    'frieza:full': 'namek_end',
    // MOVIE 2 · Super Broly: forms the FILM hands over (missions outside the canon order) — locked in the whole canon
    // story, every What-If and every other film; inside the film, from the mission that gives them
    'vegeta:god': 'bb_clash',
    'broly:wrath': 'bb_wrath',
    'broly:ssj': 'bb_legend',
    'broly:full': 'bb_gogeta',
    'gogeta:blue': 'bb_gogeta',
    // THE TOURNAMENT OF POWER: Ultra Instinct (the Sign after the Spirit Bomb, the mastered form against Jiren),
    // Vegeta's Blue Evolution against Toppo, Kefla's second level against Goku, Kale's berserk form
    'goku:uiSign': 'top_jiren',
    'goku:mui': 'top_mui',
    'vegeta:blueEvo': 'top_toppo',
    'kefla:ssj2': 'top_kefla',
    'kale:berserk': 'top_saiyans',
    'kale:controlled': 'top_saiyans',
    'caulifla:ssj2': 'top_saiyans',
    // Universe 6: Goku's Kaioken on top of Blue, against Hit
    'goku:blueKaioken': 'u6_goku_hit',
    // Universe 6: Cabba's first gold, found against Vegeta
    'cabba:ssj': 'u6_cabba',
  };

  // Forms also acquired in a separate movie use that movie's own reveal while playing it.
  // Canon and What-If missions still use formGivenBy; saved movie clears never advance their chronology.
  SL.data.formGivenByMovie = {
    'goku:blue': 'bb_legend',
    'frieza:golden': 'bb_fusion',
    'vegeta:blue': 'bb_wrath',
  };

  /**
   * ERAS: the stretches of the canon timeline a character's look belongs to (the wardrobe's
   * canon appearances are keyed by them, see src/data/wardrobe.js). Chronological. An era with
   * `from` begins at that canon mission and runs until the next one begins; an era without
   * `from` has no mission in this build yet (outfits can come from it, no canon mission uses it).
   * Same idea as formGivenBy: boundaries on the existing story order, not a second timeline.
   */
  SL.data.eras = [
    { id: 'prologue', label: 'PLANET VEGETA', from: 'prologue_final_stand' },
    { id: 'early', label: 'EARLY DRAGON BALL', from: null },
    { id: 'turtle', label: 'TURTLE SCHOOL', from: null },
    { id: 'tenkaichi23', label: '23RD WORLD TOURNAMENT', from: null },
    { id: 'saiyan', label: 'SAIYAN SAGA', from: 'saiyan_brothers' },
    // Goku comes back from King Kai's planet with the King Kai mark on his back
    { id: 'saiyan_return', label: 'SAIYAN SAGA', from: 'saiyan_saibamen' },
    { id: 'namek', label: 'NAMEK', from: 'namek_hunted' },
    // Vegeta climbs out of Frieza's healing tank in new armor before the Zarbon rematch
    { id: 'namek_late', label: 'NAMEK · FRIEZA', from: 'namek_rematch' },
    { id: 'android_arrival', label: 'ANDROIDS · AGE 764', from: 'android_trunks' },
    { id: 'android', label: 'ANDROIDS / CELL', from: 'android_nineteen' },
    { id: 'buu', label: 'MAJIN BUU', from: 'buu_years' },
    { id: 'super', label: 'SUPER', from: 'bog_awaken' },
    { id: 'end_z', label: 'END OF Z', from: 'endz_village' },
  ];

  /** The era a canon mission belongs to (a What-If mission: the era of the mission it branches from). */
  SL.data.eraOf = function (missionId) {
    const order = SL.data.storyOrder();
    let i = order.indexOf(missionId);
    if (i < 0) {
      const w = SL.data.story.whatIf.find((x) => x.mission === missionId);
      const mv = !w && SL.data.movieOf(missionId);
      i = w ? order.indexOf(w.branchOf) : mv ? order.indexOf(mv.placedAfter) : -1;
    }
    if (i < 0) return null;
    let era = null;
    for (const e of SL.data.eras) if (e.from && order.indexOf(e.from) >= 0 && order.indexOf(e.from) <= i) era = e.id;
    return era;
  };

  /** Canon missions in timeline order. */
  SL.data.storyOrder = function () {
    const out = [];
    for (const ch of SL.data.story.chapters) if (ch.status === 'playable') for (const id of ch.missions) if (SL.data.missions[id]) out.push(id);
    return out;
  };

  /**
   * Is a canon mission locked on the story screen? It opens once the previous
   * mission is cleared. A mission the player has already cleared is never locked,
   * so a mission added later into the timeline cannot lock existing progress.
   * missionResult(id) returns the saved result (SL.Save.missionResult).
   */
  SL.data.storyLocked = function (id, missionResult) {
    if (SL.Dev && SL.Dev.unlockAll()) return false; // Developer / Test Mode: every mission open
    const order = SL.data.storyOrder();
    const i = order.indexOf(id);
    if (i <= 0) return false;
    const own = missionResult(id);
    if (own && own.completed) return false;
    const prev = missionResult(order[i - 1]);
    return !(prev && prev.completed);
  };
})();
