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
    { id: 'mode_dragonballs', type: 'modes', target: 'dragonballs', condition: { missionComplete: 'saiyan_brothers' }, title: 'DRAGON BALL HUNT', hint: 'Clear Chapter 1' },
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
    { id: 'char_vegito', type: 'characters', target: 'vegito', condition: { missionComplete: 'buu_vegito' }, title: 'VEGITO (PROTOTYPE)', hint: 'Clear "Vegito"' },
    // The End of Z
    { id: 'stage_south_village', type: 'stages', target: 'south_village', condition: { missionComplete: 'endz_village' }, title: "UUB'S VILLAGE", hint: 'Clear "Ten Years Later"' },
    { id: 'char_uub', type: 'characters', target: 'uub', condition: { missionComplete: 'endz_tournament' }, title: 'UUB (PROTOTYPE)', hint: 'Clear "The 28th World Tournament"' },
    { id: 'char_pan', type: 'characters', target: 'pan', condition: { missionComplete: 'endz_tournament' }, title: 'PAN (PROTOTYPE)', hint: 'Clear "The 28th World Tournament"' },
    // What If: the secret fusion — beat him and he is yours
    { id: 'char_gogeta', type: 'characters', target: 'gogeta', condition: { missionComplete: 'fr_gogeta' }, title: 'GOGETA (PROTOTYPE)', hint: 'Movie: finish Fusion Reborn' }, // (2026-10-16: a movie fighter, never a What-If reward — the What-If route is gone)
    // Free Battle: the warrior from Universe 11 (Shenron's "warrior" wish can also bring him)
    { id: 'char_jiren', type: 'characters', target: 'jiren', condition: { any: [{ missionComplete: 'endz_tournament' }, { missionComplete: 'top_jiren' }] }, title: 'JIREN (PROTOTYPE)', hint: 'Clear Chapter 22: "The Spirit Bomb"' },
    // Movies & Specials (not canon): the films open once the story reaches their world
    { id: 'mode_movies', type: 'modes', target: 'movies', condition: { missionComplete: 'buu_fusion' }, title: 'MOVIES & SPECIALS', hint: 'Clear "Fusion"' },
    { id: 'char_pikkon', type: 'characters', target: 'pikkon', condition: { missionComplete: 'fr_janemba' }, title: 'PIKKON (PROTOTYPE)', hint: 'Movie: clear "Janemba"' },
    // Movie 2 · Super Broly: the glacier once the first clash is over, Broly once he has shown his wrath
    { id: 'stage_broly_glacier', type: 'stages', target: 'broly_glacier', condition: { missionComplete: 'bb_clash' }, title: 'THE GLACIER', hint: 'Movie: clear "The First Clash"' },
    { id: 'char_broly', type: 'characters', target: 'broly', condition: { missionComplete: 'bb_wrath' }, title: 'BROLY (PROTOTYPE)', hint: 'Movie: clear "Wrath"' },
    { id: 'stage_broly_lava', type: 'stages', target: 'broly_lava', condition: { missionComplete: 'bb_legend' }, title: 'THE LAVA WASTELAND', hint: 'Movie: clear "Beyond the Limits"' },
    // Chapter 18 · Universe 6: the arena and Cabba once Vegeta has taught him
    { id: 'stage_u6_arena', type: 'stages', target: 'u6_arena', condition: { missionComplete: 'u6_cabba' }, title: 'NAMELESS PLANET', hint: 'Clear Chapter 18: "The Pride of Sadala"' },
    { id: 'char_cabba', type: 'characters', target: 'cabba', condition: { missionComplete: 'u6_cabba' }, title: 'CABBA (PROTOTYPE)', hint: 'Clear Chapter 18: "The Pride of Sadala"' },
    // Caulifla and Kefla were added as playable from the start (no story condition yet): an empty condition is met on
    // the first load, without an announcement (title null). Without these rules they stayed locked in every menu
    { id: 'char_caulifla', type: 'characters', target: 'caulifla', condition: null, title: null, hint: null },
    { id: 'char_kefla', type: 'characters', target: 'kefla', condition: null, title: null, hint: null },
    // the Tournament of Power: Kale once her berserk power has shown itself, Toppo once he has become a destroyer
    { id: 'char_kale', type: 'characters', target: 'kale', condition: { missionComplete: 'top_saiyans' }, title: 'KALE (PROTOTYPE)', hint: 'Clear Chapter 22: "The Berserker"' },
    { id: 'char_toppo', type: 'characters', target: 'toppo', condition: { missionComplete: 'top_toppo' }, title: 'TOPPO (PROTOTYPE)', hint: 'Clear Chapter 22: "Pride and Destruction"' },
    { id: 'char_beerus', type: 'characters', target: 'beerus', condition: { any: [{ missionComplete: 'bog_sphere' }, { missionComplete: 'endz_tournament' }] }, title: 'BEERUS (PROTOTYPE)', hint: 'Clear Chapter 16: "My World"' },
    // Roster expansion (2026-10-14): the story's villains and rivals, each playable in Free Battle once the mission
    // that ends their part of the story is cleared (their story fights are unchanged). A save that already cleared
    // the mission gets them on the next load, without an announcement (SL.Save.load ignores what evaluateUnlocks returns)
    { id: 'char_nappa', type: 'characters', target: 'nappa', condition: { missionComplete: 'saiyan_nappa' }, title: 'NAPPA (PROTOTYPE)', hint: 'Clear "Nappa Attacks"' },
    { id: 'char_dodoria', type: 'characters', target: 'dodoria', condition: { missionComplete: 'namek_vegeta' }, title: 'DODORIA (PROTOTYPE)', hint: 'Clear "A Prince on Namek"' },
    { id: 'char_zarbon', type: 'characters', target: 'zarbon', condition: { missionComplete: 'namek_rematch' }, title: 'ZARBON (PROTOTYPE)', hint: 'Clear "The Prince Repaid"' },
    { id: 'char_guldo', type: 'characters', target: 'guldo', condition: { missionComplete: 'namek_guldo' }, title: 'GULDO (PROTOTYPE)', hint: 'Clear "Five Seconds"' },
    { id: 'char_recoome', type: 'characters', target: 'recoome', condition: { missionComplete: 'namek_recoome' }, title: 'RECOOME (PROTOTYPE)', hint: 'Clear "Recoome\'s Show"' },
    { id: 'char_burter', type: 'characters', target: 'burter', condition: { missionComplete: 'namek_ginyu_pair' }, title: 'BURTER (PROTOTYPE)', hint: 'Clear "Two Against One"' },
    { id: 'char_jeice', type: 'characters', target: 'jeice', condition: { missionComplete: 'namek_frog' }, title: 'JEICE (PROTOTYPE)', hint: 'Clear "Nothing Like a Frog"' },
    { id: 'char_ginyu', type: 'characters', target: 'ginyu', condition: { missionComplete: 'namek_frog' }, title: 'CAPTAIN GINYU (PROTOTYPE)', hint: 'Clear "Nothing Like a Frog"' },
    { id: 'char_frieza', type: 'characters', target: 'frieza', condition: { missionComplete: 'namek_end' }, title: 'FRIEZA (PROTOTYPE)', hint: 'Clear "Five Minutes"' },
    { id: 'char_mecha_frieza', type: 'characters', target: 'mecha_frieza', condition: { missionComplete: 'android_trunks' }, title: 'MECHA FRIEZA (PROTOTYPE)', hint: 'Clear "The Stranger"' },
    { id: 'char_king_cold', type: 'characters', target: 'king_cold', condition: { missionComplete: 'android_trunks' }, title: 'KING COLD (PROTOTYPE)', hint: 'Clear "The Stranger"' },
    { id: 'char_android_17', type: 'characters', target: 'android_17', condition: { missionComplete: 'android_road' }, title: 'ANDROID 17 (PROTOTYPE)', hint: 'Clear "The Pair on the Road"' },
    { id: 'char_android_18', type: 'characters', target: 'android_18', condition: { missionComplete: 'android_road' }, title: 'ANDROID 18 (PROTOTYPE)', hint: 'Clear "The Pair on the Road"' },
    { id: 'char_android_16', type: 'characters', target: 'android_16', condition: { missionComplete: 'cell_gohan' }, title: 'ANDROID 16 (PROTOTYPE)', hint: 'Clear "Gohan\'s Turn"' },
    { id: 'char_cell', type: 'characters', target: 'cell', condition: { missionComplete: 'cell_fatherson' }, title: 'CELL (PROTOTYPE)', hint: 'Clear "Father-Son Kamehameha"' },
    { id: 'char_majin_buu', type: 'characters', target: 'majin_buu', condition: { missionComplete: 'buu_sacrifice' }, title: 'MAJIN BUU (PROTOTYPE)', hint: 'Clear "The Prince\'s Pride"' },
    { id: 'char_super_buu', type: 'characters', target: 'super_buu', condition: { missionComplete: 'buu_supervegito' }, title: 'SUPER BUU (PROTOTYPE)', hint: 'Clear "Super Vegito"' },
    { id: 'char_kid_buu', type: 'characters', target: 'kid_buu', condition: { missionComplete: 'buu_spiritbomb' }, title: 'KID BUU (PROTOTYPE)', hint: 'Clear "Goodbye, Buu"' },
    { id: 'char_frost', type: 'characters', target: 'frost', condition: { missionComplete: 'u6_frost_vegeta' }, title: 'FROST (PROTOTYPE)', hint: 'Clear Chapter 18: "One Punch for a Cheat"' },
    { id: 'char_hit', type: 'characters', target: 'hit', condition: { any: [{ missionComplete: 'u6_goku_hit' }, { missionComplete: 'hit_contract' }] }, title: 'HIT (PROTOTYPE)', hint: 'Clear Chapter 18: "The Unfinished Match"' },
    // Roster batch 2 (2026-10-14, the owner's visual reference catalogue): story fighters whose kits were complete
    { id: 'char_cui', type: 'characters', target: 'cui', condition: { missionComplete: 'namek_vegeta' }, title: 'CUI (PROTOTYPE)', hint: 'Clear "A Prince on Namek"' },
    { id: 'char_nail', type: 'characters', target: 'nail', condition: { missionComplete: 'namek_nail' }, title: 'NAIL (PROTOTYPE)', hint: 'Clear "The Warrior"' },
    { id: 'char_future_gohan', type: 'characters', target: 'future_gohan', condition: { missionComplete: 'android_warning' }, title: 'FUTURE GOHAN (PROTOTYPE)', hint: 'Clear "What He Came To Say"' },
    { id: 'char_android_19', type: 'characters', target: 'android_19', condition: { missionComplete: 'android_nineteen' }, title: 'ANDROID 19 (PROTOTYPE)', hint: 'Clear "Ten in the Morning"' },
    { id: 'char_android_20', type: 'characters', target: 'android_20', condition: { missionComplete: 'android_lab' }, title: 'DR. GERO (PROTOTYPE)', hint: 'Clear "The Laboratory Door"' },
    { id: 'char_janemba', type: 'characters', target: 'janemba', condition: { missionComplete: 'fr_janemba' }, title: 'JANEMBA (PROTOTYPE)', hint: 'Movie: clear "Janemba"' },
    { id: 'char_super_janemba', type: 'characters', target: 'super_janemba', condition: { missionComplete: 'fr_gogeta' }, title: 'SUPER JANEMBA (PROTOTYPE)', hint: 'Movie: clear "The Ultimate Fusion"' },
    { id: 'char_dyspo', type: 'characters', target: 'dyspo', condition: { missionComplete: 'top_finale' }, title: 'DYSPO (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    // Roster continuation (2026-10-14): Priority A — kits finished and made playable
    { id: 'char_roshi', type: 'characters', target: 'roshi', condition: { missionComplete: 'top_jiren' }, title: 'MASTER ROSHI (PROTOTYPE)', hint: 'Clear Chapter 22: "The Spirit Bomb"' },
    { id: 'char_tagoma', type: 'characters', target: 'tagoma', condition: { missionComplete: 'rof_invasion' }, title: 'TAGOMA (PROTOTYPE)', hint: 'Clear Chapter 17: "The Thousand Soldiers"' },
    { id: 'char_magetta', type: 'characters', target: 'magetta', condition: { missionComplete: 'u6_magetta' }, title: 'MAGETTA (PROTOTYPE)', hint: 'Clear Chapter 18: "Iron and Magma"' },
    // Priority B — movie and Saiyan-squad fighters (movie continuity: Free Battle only, never in the story order)
    { id: 'char_cooler', type: 'characters', target: 'cooler', condition: { missionComplete: 'namek_end' }, title: 'COOLER (PROTOTYPE)', hint: 'Clear "Five Minutes"' },
    { id: 'char_metal_cooler', type: 'characters', target: 'metal_cooler', condition: { missionComplete: 'namek_end' }, title: 'METAL COOLER (PROTOTYPE)', hint: 'Clear "Five Minutes"' },
    { id: 'char_turles', type: 'characters', target: 'turles', condition: { missionComplete: 'saiyan_vegeta' }, title: 'TURLES (PROTOTYPE)', hint: 'Clear "The Saiyan Prince"' },
    { id: 'char_tora', type: 'characters', target: 'tora', condition: { missionComplete: 'prologue_final_stand' }, title: 'TORA (PROTOTYPE)', hint: 'Complete the Prologue' },
    { id: 'char_fasha', type: 'characters', target: 'fasha', condition: { missionComplete: 'prologue_final_stand' }, title: 'FASHA (PROTOTYPE)', hint: 'Complete the Prologue' },
    { id: 'char_shugesh', type: 'characters', target: 'shugesh', condition: { missionComplete: 'prologue_final_stand' }, title: 'SHUGESH (PROTOTYPE)', hint: 'Complete the Prologue' },
    { id: 'char_gine', type: 'characters', target: 'gine', condition: { missionComplete: 'bb_planet' }, title: 'GINE (PROTOTYPE)', hint: 'Clear "The Fall of Planet Vegeta"' },
    { id: 'char_king_vegeta', type: 'characters', target: 'king_vegeta', condition: { missionComplete: 'bb_planet' }, title: 'KING VEGETA (PROTOTYPE)', hint: 'Clear "The Fall of Planet Vegeta"' },
    { id: 'char_tarble', type: 'characters', target: 'tarble', condition: { missionComplete: 'buu_peace' }, title: 'TARBLE (PROTOTYPE)', hint: 'Clear "Peace"' },
    { id: 'char_goku_black', type: 'characters', target: 'goku_black', condition: { any: [{ missionComplete: 'ft_black' }, { missionComplete: 'hit_contract' }] }, title: 'GOKU BLACK (PROTOTYPE)', hint: 'Clear Chapter 19: "The Dark Goku"' },
    { id: 'char_broly_z', type: 'characters', target: 'broly_z', condition: { missionComplete: 'cell_fatherson' }, title: 'BROLY — Z MOVIES (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_bio_broly', type: 'characters', target: 'bio_broly', condition: { missionComplete: 'cell_fatherson' }, title: 'BIO-BROLY (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_android_13', type: 'characters', target: 'android_13', condition: { missionComplete: 'cell_fatherson' }, title: 'ANDROID 13 (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_android_14', type: 'characters', target: 'android_14', condition: { missionComplete: 'cell_fatherson' }, title: 'ANDROID 14 (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_android_15', type: 'characters', target: 'android_15', condition: { missionComplete: 'cell_fatherson' }, title: 'ANDROID 15 (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_bojack', type: 'characters', target: 'bojack', condition: { missionComplete: 'cell_fatherson' }, title: 'BOJACK (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_zangya', type: 'characters', target: 'zangya', condition: { missionComplete: 'cell_fatherson' }, title: 'ZANGYA (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_garlic_jr', type: 'characters', target: 'garlic_jr', condition: { missionComplete: 'saiyan_vegeta' }, title: 'GARLIC JR. (PROTOTYPE)', hint: 'Clear "The Saiyan Prince"' },
    { id: 'char_lord_slug', type: 'characters', target: 'lord_slug', condition: { missionComplete: 'saiyan_vegeta' }, title: 'LORD SLUG (PROTOTYPE)', hint: 'Clear "The Saiyan Prince"' },
    { id: 'char_dr_wheelo', type: 'characters', target: 'dr_wheelo', condition: { missionComplete: 'saiyan_vegeta' }, title: 'DR. WHEELO (PROTOTYPE)', hint: 'Clear "The Saiyan Prince"' },
    { id: 'char_tapion', type: 'characters', target: 'tapion', condition: { missionComplete: 'buu_peace' }, title: 'TAPION (PROTOTYPE)', hint: 'Clear "Peace"' },
    { id: 'char_hirudegarn', type: 'characters', target: 'hirudegarn', condition: { missionComplete: 'buu_peace' }, title: 'HIRUDEGARN (PROTOTYPE)', hint: 'Clear "Peace"' },
    { id: 'char_zamasu', type: 'characters', target: 'zamasu', condition: { any: [{ missionComplete: 'ft_black' }, { missionComplete: 'hit_contract' }] }, title: 'ZAMASU (PROTOTYPE)', hint: 'Clear Chapter 19: "The Dark Goku"' },
    { id: 'char_fused_zamasu', type: 'characters', target: 'fused_zamasu', condition: { any: [{ missionComplete: 'ft_vegito' }, { missionComplete: 'top_finale' }] }, title: 'FUSED ZAMASU (PROTOTYPE)', hint: 'Clear Chapter 19: "Vegito"' },
    { id: 'char_future_17', type: 'characters', target: 'future_17', condition: { missionComplete: 'cell_fatherson' }, title: 'FUTURE 17 (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_future_18', type: 'characters', target: 'future_18', condition: { missionComplete: 'cell_fatherson' }, title: 'FUTURE 18 (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_super_perfect_cell', type: 'characters', target: 'super_perfect_cell', condition: { missionComplete: 'cell_fatherson' }, title: 'SUPER PERFECT CELL (PROTOTYPE)', hint: 'Clear the Cell Games' },
    // GT (its own continuity) after the last story chapter; the film's Blue Gogeta with the film
    { id: 'char_goku_ssj4', type: 'characters', target: 'goku_ssj4', condition: { missionComplete: 'top_finale' }, title: 'GOKU — SUPER SAIYAN 4 (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    { id: 'char_vegeta_ssj4', type: 'characters', target: 'vegeta_ssj4', condition: { missionComplete: 'top_finale' }, title: 'VEGETA — SUPER SAIYAN 4 (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    { id: 'char_gogeta_ssj4', type: 'characters', target: 'gogeta_ssj4', condition: { missionComplete: 'top_finale' }, title: 'GOGETA — SUPER SAIYAN 4 (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    { id: 'char_baby_vegeta', type: 'characters', target: 'baby_vegeta', condition: { missionComplete: 'top_finale' }, title: 'BABY VEGETA (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    { id: 'char_super_17', type: 'characters', target: 'super_17', condition: { missionComplete: 'top_finale' }, title: 'SUPER 17 (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    { id: 'char_omega_shenron', type: 'characters', target: 'omega_shenron', condition: { missionComplete: 'top_finale' }, title: 'OMEGA SHENRON (PROTOTYPE)', hint: 'Clear Chapter 22: "The Final Battle"' },
    // the original Dragon Ball (no chapters yet): Free Battle after the Saiyan Saga's first chapter, where Goku's past is told
    { id: 'char_king_piccolo', type: 'characters', target: 'king_piccolo', condition: { missionComplete: 'saiyan_brothers' }, title: 'KING PICCOLO (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_piccolo_jr', type: 'characters', target: 'piccolo_jr', condition: { missionComplete: 'saiyan_brothers' }, title: 'PICCOLO JR. (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_tambourine', type: 'characters', target: 'tambourine', condition: { missionComplete: 'saiyan_brothers' }, title: 'TAMBOURINE (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_cymbal', type: 'characters', target: 'cymbal', condition: { missionComplete: 'saiyan_brothers' }, title: 'CYMBAL (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_drum', type: 'characters', target: 'drum', condition: { missionComplete: 'saiyan_brothers' }, title: 'DRUM (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_mercenary_tao', type: 'characters', target: 'mercenary_tao', condition: { missionComplete: 'saiyan_brothers' }, title: 'MERCENARY TAO (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_general_blue', type: 'characters', target: 'general_blue', condition: { missionComplete: 'saiyan_brothers' }, title: 'GENERAL BLUE (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_android_8', type: 'characters', target: 'android_8', condition: { missionComplete: 'saiyan_brothers' }, title: 'ANDROID 8 (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_bora', type: 'characters', target: 'bora', condition: { missionComplete: 'saiyan_brothers' }, title: 'BORA (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_grandpa_gohan', type: 'characters', target: 'grandpa_gohan', condition: { missionComplete: 'saiyan_brothers' }, title: 'GRANDPA GOHAN (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_young_chichi', type: 'characters', target: 'young_chichi', condition: { missionComplete: 'saiyan_brothers' }, title: 'CHI-CHI (YOUNG) (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_launch', type: 'characters', target: 'launch', condition: { missionComplete: 'saiyan_brothers' }, title: 'LAUNCH (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    // the board's further movie additions (built from memory)
    { id: 'char_salza', type: 'characters', target: 'salza', condition: { missionComplete: 'namek_end' }, title: 'SALZA (PROTOTYPE)', hint: 'Clear "Five Minutes"' },
    { id: 'char_dore', type: 'characters', target: 'dore', condition: { missionComplete: 'namek_end' }, title: 'DORE (PROTOTYPE)', hint: 'Clear "Five Minutes"' },
    { id: 'char_neiz', type: 'characters', target: 'neiz', condition: { missionComplete: 'namek_end' }, title: 'NEIZ (PROTOTYPE)', hint: 'Clear "Five Minutes"' },
    { id: 'char_bido', type: 'characters', target: 'bido', condition: { missionComplete: 'cell_fatherson' }, title: 'BIDO (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_bujin', type: 'characters', target: 'bujin', condition: { missionComplete: 'cell_fatherson' }, title: 'BUJIN (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_kogu', type: 'characters', target: 'kogu', condition: { missionComplete: 'cell_fatherson' }, title: 'KOGU (PROTOTYPE)', hint: 'Clear the Cell Games' },
    { id: 'char_hatchiyack', type: 'characters', target: 'hatchiyack', condition: { missionComplete: 'saiyan_vegeta' }, title: 'HATCHIYACK (PROTOTYPE)', hint: 'Clear "The Saiyan Prince"' },
    { id: 'char_king_gurumes', type: 'characters', target: 'king_gurumes', condition: { missionComplete: 'saiyan_brothers' }, title: 'KING GURUMES (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_lucifer', type: 'characters', target: 'lucifer', condition: { missionComplete: 'saiyan_brothers' }, title: 'LUCIFER (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    // the board's further original-series cast (built from memory)
    { id: 'char_master_shen', type: 'characters', target: 'master_shen', condition: { missionComplete: 'saiyan_brothers' }, title: 'MASTER SHEN (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_nam', type: 'characters', target: 'nam', condition: { missionComplete: 'saiyan_brothers' }, title: 'NAM (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_giran', type: 'characters', target: 'giran', condition: { missionComplete: 'saiyan_brothers' }, title: 'GIRAN (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_king_chappa', type: 'characters', target: 'king_chappa', condition: { missionComplete: 'saiyan_brothers' }, title: 'KING CHAPPA (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_devilman', type: 'characters', target: 'devilman', condition: { missionComplete: 'saiyan_brothers' }, title: 'SPIKE THE DEVIL MAN (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_fangs', type: 'characters', target: 'fangs', condition: { missionComplete: 'saiyan_brothers' }, title: 'FANGS THE VAMPIRE (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_bandages', type: 'characters', target: 'bandages', condition: { missionComplete: 'saiyan_brothers' }, title: 'BANDAGES THE MUMMY (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_see_through', type: 'characters', target: 'see_through', condition: { missionComplete: 'saiyan_brothers' }, title: 'MR. SEE-THROUGH (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_colonel_silver', type: 'characters', target: 'colonel_silver', condition: { missionComplete: 'saiyan_brothers' }, title: 'COLONEL SILVER (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_metallitron', type: 'characters', target: 'metallitron', condition: { missionComplete: 'saiyan_brothers' }, title: 'MAJOR METALLITRON (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_ninja_murasaki', type: 'characters', target: 'ninja_murasaki', condition: { missionComplete: 'saiyan_brothers' }, title: 'NINJA MURASAKI (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_staff_officer_black', type: 'characters', target: 'staff_officer_black', condition: { missionComplete: 'saiyan_brothers' }, title: 'STAFF OFFICER BLACK (PROTOTYPE)', hint: 'Clear Chapter 1: "A Brother From Space"' },
    { id: 'char_gogeta_blue', type: 'characters', target: 'gogeta_blue', condition: { missionComplete: 'bb_gogeta' }, title: 'GOGETA — SUPER SAIYAN BLUE (PROTOTYPE)', hint: 'Clear "The Ultimate Fusion"' }
  );
})();
