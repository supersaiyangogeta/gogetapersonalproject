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
        status: 'in-development',
        blurb: 'Gohan survives in the wilderness under Piccolo. Goku runs Snake Way to King Kai. Not in this build.',
      },
      {
        id: 'saiyan3',
        head: 'CHAPTER 3 · AGE 762',
        title: 'Saiyan Saga: The Saiyans Arrive',
        status: 'in-development',
        blurb: "Nappa and Vegeta land. The Z Fighters make their stand while Goku races back. Not in this build.",
      },
    ],

    whatIf: [
      {
        id: 'whatif_raditz',
        mission: 'whatif_raditz',
        branchOf: 'saiyan_brothers',
        unlock: { missionComplete: 'saiyan_brothers' },
        hint: 'Clear Chapter 1: "A Brother From Space"',
      },
    ],
  };

  /** Canon missions in timeline order. */
  SL.data.storyOrder = function () {
    const out = [];
    for (const ch of SL.data.story.chapters) if (ch.status === 'playable') for (const id of ch.missions) if (SL.data.missions[id]) out.push(id);
    return out;
  };
})();
