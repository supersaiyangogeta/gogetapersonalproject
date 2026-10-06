/*
 * Data-driven unlock rules evaluated by SL.Save.evaluateUnlocks().
 * type = which unlock list (characters, stages, menuScenes, modes).
 */
(function () {
  'use strict';
  SL.data.unlocks.push(
    { id: 'char_bardock', type: 'characters', target: 'bardock', condition: { missionComplete: 'prologue_final_stand' }, title: 'BARDOCK', hint: 'Complete the Prologue' },
    { id: 'stage_orbit', type: 'stages', target: 'orbit', condition: { missionComplete: 'prologue_final_stand' }, title: 'PLANET VEGETA ORBIT', hint: 'Complete the Prologue' },
    { id: 'menu_bardock', type: 'menuScenes', target: 'bardock', condition: { missionComplete: 'prologue_final_stand' }, title: null, hint: null },
    // Version 0.2 — Chapter 1
    { id: 'char_raditz', type: 'characters', target: 'raditz', condition: { missionComplete: 'saiyan_brothers' }, title: 'RADITZ (PROTOTYPE)', hint: 'Clear Chapter 1' },
    { id: 'stage_plains', type: 'stages', target: 'plains', condition: { missionComplete: 'saiyan_brothers' }, title: 'GRASSLAND HILLS', hint: 'Clear Chapter 1' },
    { id: 'mode_whatif', type: 'modes', target: 'whatif', condition: { missionComplete: 'saiyan_brothers' }, title: 'WHAT IF? MODE', hint: 'Clear Chapter 1' }
  );
})();
