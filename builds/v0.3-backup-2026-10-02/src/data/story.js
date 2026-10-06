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
        title: 'Buu Saga: Kid Buu (in development)',
        status: 'playable',
        missions: ['buu_kidbuu', 'buu_sacred'],
        blurb: 'The original Buu: no mind, only destruction. He throws a sun at the Earth, follows the survivors to the Sacred World of the Kai, and a prince buys one minute with everything he has.',
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
    ],
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
    'vegeta:majin': 'buu_majin',
    'vegeta:ssj2': 'buu_majin',
    'goku:ssj2': 'buu_pride',
    'goku:ssj3': 'buu_ssj3',
    'gotenks:ssj': 'buu_fusion',
    'gotenks:ssj3': 'buu_timechamber',
    'adult_gohan:ultimate': 'buu_zsword',
    'vegito:ssj': 'buu_supervegito',
    // Frieza's 100%: nothing before the dying planet can reach it
    'frieza:full': 'namek_end',
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
    { id: 'super', label: 'SUPER', from: null },
    { id: 'end_z', label: 'END OF Z', from: null },
  ];

  /** The era a canon mission belongs to (a What-If mission: the era of the mission it branches from). */
  SL.data.eraOf = function (missionId) {
    const order = SL.data.storyOrder();
    let i = order.indexOf(missionId);
    if (i < 0) {
      const w = SL.data.story.whatIf.find((x) => x.mission === missionId);
      i = w ? order.indexOf(w.branchOf) : -1;
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
