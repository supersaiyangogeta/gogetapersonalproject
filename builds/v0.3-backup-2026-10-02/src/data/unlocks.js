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
    { id: 'mode_whatif', type: 'modes', target: 'whatif', condition: { missionComplete: 'saiyan_brothers' }, title: 'WHAT IF? MODE', hint: 'Clear Chapter 1' },
    // Version 0.3 — Chapter 2
    { id: 'char_kid_gohan', type: 'characters', target: 'kid_gohan', condition: { missionComplete: 'saiyan_survival' }, title: 'KID GOHAN (PROTOTYPE)', hint: 'Clear "Alone in the Wild"' },
    { id: 'stage_wilderness', type: 'stages', target: 'wilderness', condition: { missionComplete: 'saiyan_survival' }, title: 'WILDERNESS CANYON', hint: 'Clear "Alone in the Wild"' },
    // Version 0.3 — Chapter 3
    { id: 'char_krillin', type: 'characters', target: 'krillin', condition: { missionComplete: 'saiyan_saibamen' }, title: 'KRILLIN (PROTOTYPE)', hint: 'Clear "The Saibamen"' },
    { id: 'char_tien', type: 'characters', target: 'tien', condition: { missionComplete: 'saiyan_saibamen' }, title: 'TIEN (PROTOTYPE)', hint: 'Clear "The Saibamen"' },
    { id: 'char_yamcha', type: 'characters', target: 'yamcha', condition: { missionComplete: 'saiyan_saibamen' }, title: 'YAMCHA (PROTOTYPE)', hint: 'Clear "The Saibamen"' },
    { id: 'char_piccolo', type: 'characters', target: 'piccolo', condition: { missionComplete: 'saiyan_nappa' }, title: 'PICCOLO (PROTOTYPE)', hint: 'Clear "Nappa Attacks"' },
    { id: 'char_yajirobe', type: 'characters', target: 'yajirobe', condition: { missionComplete: 'saiyan_vegeta' }, title: 'YAJIROBE (PROTOTYPE)', hint: 'Clear "The Saiyan Prince"' },
    { id: 'char_chiaotzu', type: 'characters', target: 'chiaotzu', condition: { missionComplete: 'saiyan_nappa' }, title: 'CHIAOTZU (PROTOTYPE)', hint: 'Clear "Nappa Attacks"' },
    { id: 'stage_kingkai', type: 'stages', target: 'kingkai', condition: { missionComplete: 'saiyan_kingkai' }, title: "KING KAI'S PLANET", hint: 'Clear "Ten Times Gravity"' },
    // Namek foundation (in development in the Version 0.3 folder)
    { id: 'stage_namek', type: 'stages', target: 'namek', condition: { missionComplete: 'namek_vegeta' }, title: 'NAMEK', hint: 'Clear "A Prince on Namek"' },
    // Chapters 5 and 6 (in development)
    { id: 'char_future_trunks', type: 'characters', target: 'future_trunks', condition: { missionComplete: 'android_trunks' }, title: 'FUTURE TRUNKS (PROTOTYPE)', hint: 'Clear "The Stranger"' },
    { id: 'stage_coast', type: 'stages', target: 'coast', condition: { missionComplete: 'android_trunks' }, title: 'COASTAL FLATS', hint: 'Clear "The Stranger"' },
    { id: 'char_teen_gohan', type: 'characters', target: 'teen_gohan', condition: { missionComplete: 'cell_fatherson' }, title: 'GOHAN, AGE 11 (PROTOTYPE)', hint: 'Clear "Father-Son Kamehameha"' },
    // Buu Saga
    { id: 'char_adult_gohan', type: 'characters', target: 'adult_gohan', condition: { missionComplete: 'buu_years' }, title: 'GOHAN, AGE 18 (PROTOTYPE)', hint: 'Clear "Seven Years"' },
    { id: 'char_great_saiyaman', type: 'characters', target: 'great_saiyaman', condition: { missionComplete: 'buu_saiyaman' }, title: 'THE GREAT SAIYAMAN (PROTOTYPE)', hint: 'Clear "The Great Saiyaman"' },
    { id: 'stage_satan_city', type: 'stages', target: 'satan_city', condition: { missionComplete: 'buu_saiyaman' }, title: 'SATAN CITY', hint: 'Clear "The Great Saiyaman"' },
    { id: 'char_goten', type: 'characters', target: 'goten', condition: { missionComplete: 'buu_kids' }, title: 'GOTEN (PROTOTYPE)', hint: 'Clear "Two Children"' },
    { id: 'char_kid_trunks', type: 'characters', target: 'kid_trunks', condition: { missionComplete: 'buu_kids' }, title: 'KID TRUNKS (PROTOTYPE)', hint: 'Clear "Two Children"' },
    { id: 'char_gotenks', type: 'characters', target: 'gotenks', condition: { missionComplete: 'buu_fusion' }, title: 'GOTENKS (PROTOTYPE)', hint: 'Clear "Fusion"' },
    { id: 'char_videl', type: 'characters', target: 'videl', condition: { missionComplete: 'buu_flight' }, title: 'VIDEL (PROTOTYPE)', hint: 'Clear "Learning to Fly"' },
    { id: 'stage_tournament', type: 'stages', target: 'tournament', condition: { missionComplete: 'buu_junior' }, title: 'WORLD TOURNAMENT', hint: 'Clear "Junior Division"' },
    { id: 'char_dabura', type: 'characters', target: 'dabura', condition: { missionComplete: 'buu_dabura' }, title: 'DABURA (PROTOTYPE)', hint: 'Clear "The Demon King"' },
    { id: 'char_vegito', type: 'characters', target: 'vegito', condition: { missionComplete: 'buu_vegito' }, title: 'VEGITO (PROTOTYPE)', hint: 'Clear "Vegito"' }
  );
})();
