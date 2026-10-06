/*
 * Data-driven unlock rules evaluated by SL.Save.evaluateUnlocks().
 * type = which unlock list (characters, stages, menuScenes, modes).
 */
(function () {
  'use strict';
  SL.data.unlocks.push(
    { id: 'char_bardock', type: 'characters', target: 'bardock', condition: { missionComplete: 'prologue_final_stand' }, title: 'BARDOCK', hint: 'Complete the Prologue' },
    { id: 'stage_orbit', type: 'stages', target: 'orbit', condition: { missionComplete: 'prologue_final_stand' }, title: 'PLANET VEGETA ORBIT', hint: 'Complete the Prologue' },
    { id: 'menu_bardock', type: 'menuScenes', target: 'bardock', condition: { missionComplete: 'prologue_final_stand' }, title: null, hint: null }
  );
})();
