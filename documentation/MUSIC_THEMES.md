# Saiyan Legacy — Dragon Ball song themes (the soundtrack PDF, page 90 onward)

The single catalogue of the music work that follows the owner's soundtrack document. Read this before touching
`src/core/music.js` song ids or a mission's `music(...)` / scene `music: {...}` cue.

## Source

- **Document:** the owner's *Tournament of power ui.pdf* (98 PDF pages; delivered 2026-10-13, attached again
  2026-10-14). Pages 1–89 are the Tournament of Power / Universe Survival cinematic brief (built in Chapters 18–21).
  **The song themes start on PDF page 90** (counted as the PDF's own page index; the document prints no page
  numbers). Earlier documentation recorded them as "left for future planning"; nothing from page 90 on had been
  implemented before 2026-10-14.
- **Pages covered now:** 90–98, every entry (the document ends on page 98).
- **Last completed entry:** page 97–98, "Blizzard".
- **Next entry to implement:** none left in the document. Remaining work is the gaps listed under *Blocked /
  partial* below, and replacing the stand-ins with real recordings if the owner supplies them.

## What "connected" means here

There are **no audio files** in the project (no .mp3/.ogg/.wav anywhere under the project root, frozen builds
excluded) and none were downloaded: the owner's rules forbid downloading or bundling copyrighted music. All music in
the game is the procedural sequencer in `src/core/music.js` (synthesised instruments, original melodies).

So every entry below is connected through an **original stand-in**: a new piece written for the sequencer from the
document's *description* of the cue (tempo, key feel, instruments, how the drop lands, when it plays). No melody,
riff or lyric of the named songs is reproduced; the document's lyric quotes are deliberately not copied anywhere.
The stand-ins use their own ids, so a licensed recording can later replace one through `SL.Music.play(id)` without
touching any mission.

Status words: **CONNECTED (stand-in)** = an original piece plays at the intended moment in the real game ·
**EXISTING (adjusted)** = an older song already covered it and was changed to fit the description · **BLOCKED** =
nothing in the game for it to play over.

## Entries (document order)

| PDF page | Entry (document's title) | Category | Stand-in id (`music.js`) | Local recording | Where it plays | Status |
|---|---|---|---|---|---|---|
| 90–91 | "Ultimate Battle" (Ultra Instinct -Sign-) | transformation / battle | `ui_awakening` + stinger `ui_drop` | none | `top_jiren` ULTRA INSTINCT -SIGN- phase: almost silent (pad and pulse only) until his body first dodges, then the brass drop and the full cue; `top_kefla` phantom dodge; Free Battle: Goku's `uiSign` form (`FORM_THEMES.uiSign`), and `ui_drop` when an Ultra Instinct body makes a blow miss (`Battle._uiDrop`, player only, once in 15 s, never inside a mission) | CONNECTED (stand-in) |
| 91–92 | "Genkai Toppa x Survivor" (DBS opening 2) | saga theme / battle | `limit_survivor` | none | the Tournament of Power missions' battle music (`top_jiren`, `top_saiyans`, `top_kefla`, `top_toppo`, `top_vegeta`, `top_mui` — their phase/scene `music: { song: 'battle' }`); Free Battle against Toppo, Kale, Caulifla, Kefla, Dyspo (`THEMES`) | CONNECTED (stand-in) |
| 92 | "HERO ~Song of Hope~" (Battle of Gods climax) | special moment | `song_of_hope` | none | `bog_battle` GOD KI phase: the red gone from Goku's hair, Super Saiyan with a god's power in space (was `final_clash`) | CONNECTED (stand-in) |
| 93 | "Gohan's Anger" | character / climax | `gohan_anger` | none | `cell_gohan` scene `gh_sixteen`: in under the silence at the pupils (level 2), the timpani and horns at the roar (level 3). The silence for 16's last words and the boot is kept. | CONNECTED (stand-in) |
| 93 | Super Saiyan 3 introduction theme | transformation | `ssj3_theme` (existing) | none | `buu_ssj3` THIRD phase (was `finale`); Free Battle `FORM_THEMES.ssj3` (already pointed here) | EXISTING (adjusted: chugging sub riff, synth lead, drum fills) |
| 93–94 | Vegeta's "I Didn't Care Anymore!" | character / transformation | `vegeta_awakening` | none | `android_nineteen`: his Super Saiyan reveal (scene `vegeta_arrives`), the VEGETA phase, scene `vegeta_rips`; `whatif_vegeta` RISE; Free Battle `FORM_THEMES['vegeta:ssj']` | CONNECTED (stand-in) |
| 94 | "Unmei no Hi ~Tamashii vs Tamashii~" (Gohan SSJ2) | transformation / battle | `fateful_day` | none | `cell_gohan`: the cold stare after the change (scene `gh_sixteen`) and the reveal `gh_ssj2_reveal` (was `finale` / `gohan_theme`); Free Battle `FORM_THEMES['teen_gohan:ssj2']` | CONNECTED (stand-in) |
| 94–95 | Mastered Ultra Instinct ("Clash of the Gods") | transformation / climax | `clash_of_gods` | none | `top_mui` MASTERED ULTRA INSTINCT phase (was `ultra_instinct`); Free Battle `FORM_THEMES.mui` | CONNECTED (stand-in) |
| 95 | The Ginyu Force theme ("Tokusentai!") | villain group | `ginyu_force` | none | `namek_alliance` scene (the five lights); the fights in `namek_guldo`, `namek_recoome`, `namek_ginyu_pair`, `namek_ginyu`; Free Battle against Ginyu, Recoome, Burter, Jeice, Guldo. The shouted chorus is left out (no voices). | CONNECTED (stand-in) |
| 95–96 | The peaceful eyecatch / soft "Cha-La" | quiet moment | stinger `eyecatch`; song `soft_chala` | none | `eyecatch`: as a story mission pauses (the "commercial break"; `SL.App.pauseBattle`, once a minute at most — an interpretation, noted as such); `soft_chala`: Mount Paozu at dawn (`end_z` scene `ez_goku`, was `peaceful`) | CONNECTED (stand-in) |
| 96 | "Looming Threat" (eerie violins) | villain entrance | `looming_threat` | none | Imperfect Cell's empty street (`cell_first` scene `cell_sighting`, still no beat and no roar); Frieza's arrival on Namek (`namek_frieza1` ARRIVAL, was the menu song at level 0) | CONNECTED (stand-in) |
| 96 | Tragic death theme ("Solid State Scouter" / sad strings) | sacrifice / aftermath | `tragic_sacrifice` | none | Piccolo dying for Gohan (`saiyan_saga` scene `piccolo_shields_gohan`, from his last words; the fall stays silent); Trunks after Gohan's death (`android_warning`, "alone", was `vision`) | CONNECTED (stand-in) |
| 96–97 | Goku's Super Saiyan awakening | transformation | `ssj_awakening` | none | `namek_super_saiyan` scene `goku_super_saiyan`: the burst and his eyes (was `finale`; the stillness before it is kept); Free Battle `FORM_THEMES['goku:ssj']` | CONNECTED (stand-in) |
| 97 | The Fusion Dance theme | special moment | stinger `fusion_fanfare` | none | the moment a dance fusion that came out right is made (`SL.Fusion.fuse`, `fusions.gotenks` / `fusions.gogeta` `fanfare: true`): Gotenks in `buu_fusion` and `bog_wrath`, Gogeta in `bb_fusion`, `fr_gogeta`, `whatif_gogeta`. Never the failed fusions. | CONNECTED (stand-in) |
| 97 | Vegito's arrival theme | character entrance | `vegito_theme` (existing) | none | `buu_vegito` (already); now with the mechanical synth arpeggio the document describes | EXISTING (adjusted) |
| 97 | Zamasu's "Justice Orchestra" | villain | `zamasu_theme` (2026-10-15) | none | Free Battle against Zamasu, Fused Zamasu or Goku Black (`THEMES`; they joined the roster 2026-10-15). Still no Future Trunks saga missions to score | CONNECTED (stand-in, Free Battle only) |
| 97–98 | "Blizzard" (Dragon Ball Super: Broly end credits) | ending | `blizzard_credits` | none | `bb_epilogue` CREDITS (was `next_journey`) | CONNECTED (stand-in) |

## How the music system was extended (2026-10-14)

- `src/core/music.js`: thirteen new songs (`SOUNDTRACK WAVE 4`), three stingers (`ui_drop`, `eyecatch`,
  `fusion_fanfare`; a stinger may name its instrument, `type`), `arp16` (a sixteenth-note arpeggio), `ssj3_theme`
  and `vegito_theme` adjusted, `FORM_THEMES` gains Goku's real Ultra Instinct form ids (`uiSign`, `mui` — the old
  `ui` key never matched them, so no form music ever played for them) and character-specific keys
  (`'charId:formId'`), `THEMES` gains the Ginyu Force and the Universe 11 / 6 Tournament fighters.
- `src/game/battle.js`: `_formTheme` reads `FORM_THEMES[charId + ':' + formId]` first; `_uiDrop` plays `ui_drop`.
- `src/game/fusion.js`: the fanfare for `fanfare: true` dance fusions.
- `src/main.js`: the eyecatch on pausing a story mission.
- Transitions stay musical: `Music.play` returns at once when the same song is already playing (a form that is
  re-applied never restarts its track), intensity changes land on the next bar, a stinger plays over the music
  without changing its state, and a mission's end still silences everything (unchanged).

## Wave 5 — the roster continuation's fighters (2026-10-15)

Four more original pieces (`SOUNDTRACK WAVE 5` in `src/core/music.js`), for fighters the roster continuation added
without music of their own; a Free Battle against one of them plays it (`THEMES`, the opponent's theme wins over the
player's, as before):

| Stand-in id | Written as | Plays for |
|---|---|---|
| `zamasu_theme` | a hymn in D harmonic minor sung by the choir, brass holding the floor, kettle-drum rolls (88 BPM) | Zamasu, Fused Zamasu, Goku Black — the PDF's "Justice Orchestra" entry, no longer blocked |
| `ssj4_theme` | primal and heroic: A minor climbing through F and G to E, a saw lead over brass, driving drums (150 BPM) | Goku, Vegeta and Gogeta (SSJ4) |
| `cooler_theme` | colder and quicker than Frieza's: E Phrygian, staccato brass over a bell (140 BPM) | Cooler, Metal Cooler |
| `phantom_monster` | enormous and slow: F# minor sinking to a diminished chord, a sub bass like footsteps, a low choir, and a flute answering between its phrases (76 BPM) | Hirudegarn |
| `overwhelm` (existing) | — | Omega Shenron |

Checked: every bar sixteen steps and every note parsing (headless); in the browser (Claude) a Free Battle against each
of them started its piece, the bars advanced, pausing kept the song and quitting returned the menu song, with no
console errors. **Nobody has listened to them** — they are data-checked, not ear-checked.

## Wave 6 — Broly's two continuities, the Super film's Gogeta, Bio-Broly (2026-10-15)

| Stand-in id | Written as | Trigger |
|---|---|---|
| `legendary_z` | D minor at 116: a brass line climbing out of the low register that will not resolve, a choir under it, toms rolling into every second bar | Free Battle with or against the Z films' Broly (`THEMES.broly_z`); his two forms (`FORM_THEMES`); **his Legendary change drives it**: the sequence drops the track to intensity 0 as he clutches his head, raises it to 1 as he rises and 2 through the lightning, and lands it at 3 on the burst (`step.music`, `step.song`) — checked in the browser frame by frame: 0 at frame 2, 1 at 52, 2 at 82, 3 at 106 (the burst is at 104) |
| `broly_wrath` | G minor at 132: a low choir chanting over pounding toms, brass stabbing the floor | the Super film's Broly turning Wrathful in Free Battle (`FORM_THEMES['broly:wrath']`); his Super Saiyan and Full Power now stay on `broly_theme` (a generic `ssj` rule had swapped in Goku's Super Saiyan theme) |
| `gogeta_blue_theme` | B major leaning Lydian at 172: a saw lead skating over brass, a restless bass | Free Battle with or against the Super film's Gogeta (`THEMES.gogeta_blue`) — Fusion Reborn's Gogeta keeps `gogeta_theme`, GT's `ssj4_theme` |
| `bio_terror` | C minor slipping a semitone at a time at 92: a wrong-sounding bell, a held choir, a sinking sub bass | Free Battle with or against Bio-Broly (`THEMES.bio_broly`) |

**Engine (`src/game/fighter.js`):** a transformation's `step.music` used to be undone within half a second by the battle's own dynamic intensity; outside a story the battle now waits a few seconds after it (`musicHold`), so a build-up holds (the adult Gohan and Super-film Broly sequences that already wrote `music: 0` now keep their quiet too). A `step.song` that is already playing raises it to its level instead of doing nothing (the Z Broly picked against an opponent without a theme).

**Checked:** headless — every bar sixteen steps, every note parses, every mapped id exists. Browser (Claude, real game): the Legendary build-up above; the battle theme at the start; pause and resume keep the song; quitting returns the menu song; no console errors. **Nobody has listened to these pieces.**

## Wave 7 — GT's remaining villains (2026-10-15)

| Stand-in id | Written as | Trigger |
|---|---|---|
| `baby_revenge` | F# minor at 126: a cold bell arpeggio that never changes over a sub bass that does, brass entering only to gloat | Free Battle with or against Baby Vegeta (`THEMES.baby_vegeta`) |
| `hell_fighter` | E minor at 150: a saw riff hammering one note, the snare on every beat, a choir under it like a furnace door | Free Battle with or against Super 17 (`THEMES.super_17`) |

**Checked:** headless — every bar sixteen steps, every note in every song of the game parses (a raised E written as E# would not: the parser knows only the usual sharps and flats, so the piece uses F). Browser (Claude, real game): Goku against Baby Vegeta and Vegeta against Baby Vegeta start `baby_revenge`, Goku against Super 17 starts `hell_fighter`; pause and resume keep the song; quitting returns the menu song; no console errors. (Baby Vegeta against Vegeta plays Vegeta's theme: the opponent's theme is chosen first — the existing rule.) **Nobody has listened to these pieces.**

## Wave 8 — the two demon kings (2026-10-15)

| Stand-in id | Written as | Trigger |
|---|---|---|
| `demon_king` | A minor with the raised seventh at 108: an old-fashioned villain's march, brass stepping down over a slow choir, toms like a procession | Free Battle with or against King Piccolo or Piccolo Jr. (his reincarnation inherits it) (`THEMES.king_piccolo`, `THEMES.piccolo_jr`) |
| `dabura_theme` | E Phrygian at 138: the flat second leaning on everything, a saw line cutting like his sword, a choir chanting under it | Free Battle with or against Dabura (`THEMES.dabura`) |

**Checked:** headless — every bar sixteen steps, every note parses, every theme in `THEMES` names a song that exists. Browser (Claude, real game): Goku against King Piccolo and against Piccolo Jr. starts `demon_king`, Vegeta against Dabura starts `dabura_theme`; pause and resume keep the song; quitting returns the menu song (after its fade); no console errors. **Nobody has listened to these pieces.**

## Wave 9 — the Pride Troopers, and the right Gogeta (2026-10-15)

| Stand-in id | Written as | Trigger |
|---|---|---|
| `toppo_destroyer` | D minor at 96 leaning on the tritone (A-flat major under D): a slow choir over pounding toms and a sinking sub bass, brass holding the dissonance | Toppo becoming a God of Destruction: Free Battle (`FORM_THEMES['toppo:god']` — the generic `god` key had been swapping in Goku's Super Saiyan God theme); the story: "Pride and Destruction" — it lands with the violet light in the opening scene and carries the God of Destruction fights |
| `dyspo_theme` | E minor at 184: a saw line running arpeggios faster than the beat, hats on every step, strings holding still | Free Battle with or against Dyspo (`THEMES.dyspo`; he shared the tournament's theme with Toppo) |

**Re-routed (no new composition):** the Super film's Gogeta now plays his own `gogeta_blue_theme` in his missions and his fusion scene ("Gogeta" in the Broly film: four cues that played Fusion Reborn's `gogeta_theme`); Gogeta and Vegito keep their own themes when they go Super Saiyan in Free Battle (the generic `ssj` key swapped in Goku's).

**Checked:** headless — every bar sixteen steps, every note parses, every song named by `THEMES` and `FORM_THEMES` exists (87 songs). Browser (Claude, real game): Toppo as the player transforming into a God of Destruction — the suit bursts and `toppo_destroyer` comes in, pause and resume keep it; Goku against Dyspo starts `dyspo_theme`; "Pride and Destruction" from the start: the tournament's theme, then `toppo_destroyer` at the violet light (8.5 s in), and from its fight checkpoint; the Broly film's "Gogeta" mission from the aerial checkpoint starts `gogeta_blue_theme`; quitting always returned the menu song. **Nobody has listened to these pieces.**

## The two Gogetas, ultimate peaks (2026-10-15, the owner's arena-and-Gogeta brief)

| Stand-in id | Written as | Trigger |
|---|---|---|
| `gogeta_z_arrival` | **Fusion Reborn's Gogeta.** F minor at 84 — cold, controlled, already finished with you. It opens on silence and an arrival motif of its own (a heavy orchestral hit, eight steps of nothing, two quick hits; then a heavy hit and a whole bar of silence): low brass stabs over sub-bass booms and timpani, a hi-hat ticking like a clock. The orchestra arrives around that rhythm — dark low strings (intensity 1), a restrained high string motif that keeps reaching up and stopping (2), low brass holding against it and timpani rolls into the turn (3) | Free Battle with or against the Fusion Reborn entry (`THEMES.gogeta`); his Super Saiyan reveal (the sequence drops the music to the bare hits as the aura rises, brings the string motif in at the scream, the full orchestra at the burst); "Fusion Reborn" — the birth of Gogeta opens on the motif alone and builds; the domination phases; the What-If "The Ultimate Fusion" |
| `gogeta_super_rush` | **The Super film's Gogeta (against Broly).** F# minor at 190 — fast, bright, icy, explosive, built in stages the battle drives: **entry** (0) only a held chord and a glittering sixteenth-note synth arpeggio; **acceleration** (1) the rock kit and a driving octave bass; **full battle** (2) the saw-lead hook with tom rolls into every bar; **peak** (3: transformations, ultimates, the end of a fight) a rapid string ostinato, distorted power chords, orchestral hits at the turnaround; **recovery** — when the hold after a peak runs out the battle's own level brings it back to the loop, never restarting the track | Free Battle with or against Super Saiyan Blue Gogeta (`THEMES.gogeta_blue`); the Broly film's "Gogeta" mission (the air fight, the breakthrough, the last Kamehameha) and its fusion scene (was `gogeta_blue_theme`, which stays in the library unused) |
| stingers `gogeta_finisher`, `gogeta_blue_finisher`, `gogeta_gt_finisher` | one per continuity, over the battle music as the ultimate starts: Fusion Reborn's in the arrival's F minor (low brass, spaced, unhurried); the Super film's in its F# minor (a quick saw run to the top); GT's in E minor (low, heavy brass) | the Big Bang Kamehameha, the Ultimate Kamehameha, the 100x Big Bang Kamehameha (`special.sting`) |

**Engine (opt-in per song, no other song changes):** `song.hits` (per-bar orchestral impacts — a low brass stab on the chord, a sub-bass boom, a timpani stroke; 'X' heavier), `hitLevel`, and `padLevel` / `bassLevel` / `leadLevel` (the intensity each layer comes in at — a theme can open on silence). **Any ultimate** outside a story now lifts the battle music to its peak for a few seconds (`Battle._ultimateMusic`); a mission keeps its own score.

**Routing — the two never replace each other:** the Fusion Reborn entry (`gogeta`) and its Super Saiyan form → `gogeta_z_arrival`; `gogeta_blue` (and the Fusion Reborn entry's story-only Blue form, `FORM_THEMES['gogeta:blue']`) → `gogeta_super_rush`; `gogeta_ssj4` keeps `ssj4_theme`. The Fusion Reborn entry's Super Saiyan reveal brings its song in only outside missions or in the two Z-continuity missions (`formSongs`: "Fusion Reborn", "The Ultimate Fusion") — the Broly film's missions, which use the same fighter, never get the Z score.

**Checked (Claude, browser, real game; nobody has listened):** the synth voices actually scheduled at each intensity (Z: hits only at 0, + low strings and ticking hat at 1, + the string motif at 2, + brass counter and timpani fills at 3; Super: chord and arpeggio at 0, + kit and bass at 1, + the saw hook at 2, + power chords and the string ostinato at 3); Free Battle — Fusion Reborn Gogeta, Blue Gogeta and SSJ4 Gogeta as player and as opponent each start their own score (Fusion Reborn Gogeta against Blue Gogeta plays the opponent's, the existing rule), pause and resume keep it, quitting returns the menu song; the Super Saiyan reveal (0 → 2 at the scream → 3 at the burst) and the finisher stinger; "Fusion Reborn" from the birth of Gogeta (the motif alone at 0, then 1) and from the domination; "The Ultimate Fusion" fight and gold phases; the Broly film's "Gogeta" from the air fight and the breakthrough. Headless: every bar sixteen steps, every note parses, every mapped id exists (89 songs); `fusion-reborn-tests` 4/4; the Broly film bot-played start to finish 1/1. The engine has one scheduler, so two songs never play at once; a stinger (about two seconds) can finish over the next screen. **What the music sounds like has not been judged by a person.**

## Wave 10 — the unthemed groups (2026-10-15, continuation session)

Six original pieces (`SOUNDTRACK WAVE 10` in `src/core/music.js`) for the groups of playable fighters that still had none; a Free Battle with or against one of them plays it (`THEMES`, the opponent's theme first — the existing rule).

| Stand-in id | Written as | Plays for |
|---|---|---|
| `red_ribbon_march` | Bb major at 124: a parade-ground march that takes itself too seriously — brass in front, a piccolo-like flute over it, the snare rolling into every bar, a minor turn where the menace shows | General Blue, Colonel Silver, Major Metallitron, Ninja Murasaki, Staff Officer Black, Android 8 |
| `bojack_pirates` | A minor at 136: a swaggering saw riff strutting up the chord and back, brass holding the floor, a rock kit | Bojack, Zangya, Bido, Bujin, Kogu |
| `android_menace` | C# minor at 144: a glittering sixteenth-note arpeggio, a cold bell playing the chord, a motor of eighth notes in the bass, strings holding still | Androids 13–20, Future 17 and 18 |
| `hero_flute` | D Dorian at 88: a lonely wooden-flute song (the raised sixth on the G chord is the hope in it), strings under it, the drums a far-off march | Tapion |
| `movie_conqueror` | Bb minor at 120: brass stepping up the chord like a herald, a choir under it, toms like a landing | Turles, Lord Slug, Garlic Jr., Dr. Wheelo, Hatchiyack |
| `baba_palace` | E minor at 112: a haunted fairground — a bell slipping up a semitone into every phrase, a low choir, the bass walking down a tritone | Spike the Devil Man, Fangs, Bandages, Mr. See-Through, Grandpa Gohan (Baba's fighters), Lucifer (his castle) |

**Routed to existing pieces (no new composition):** Super Perfect Cell → `cell_theme`; Tambourine, Cymbal, Drum → `demon_king`; Salza, Dore, Neiz → `cooler_theme`; King Cold, Frost, Zarbon, Dodoria, Cui, Tagoma → `frieza_theme`; Bardock, Tora, Fasha, Shugesh, King Vegeta, Gine, Raditz, Nappa → `saiyan_home` (Planet Vegeta); Nam, Giran, King Chappa → `tenkaichi`; Master Shen, Mercenary Tao, Bora → `martial`; young Chi-Chi, Launch → `adventure`. Playable fighters without a theme: 79 → 17 (the heroes — Krillin, Tien, Yamcha, Chiaotzu, Yajirobe, Nail, Future Trunks, Future Gohan, Goten, Kid Trunks, Videl — plus Cabba, Hit, Magetta, Roshi, Tarble, King Gurumes); a fight between two of them plays the stage's music as before.

**Engine fix (`Music.play`):** a battle launched while no music was playing went silent half a second in (the launch's `stop` timer cleared the new song), and a Free Battle retried from the pause menu with the same theme went silent too (the same-song early return left the pending stop running). A new `play` now cancels a pending stop or switch; the same song asked for again is kept and brought back up.

## Wave 11 — the last unthemed fighters (2026-10-16)

Five original pieces (`SOUNDTRACK WAVE 11` in `src/core/music.js`); a Free Battle with or against one of them plays it
(the opponent's theme first, the existing rule). After this wave every playable fighter has a theme.

| Stand-in id | Written as | Plays for |
|---|---|---|
| `last_hope` | E minor at 138: a lone saw line climbing out of the ruins, strings holding under it, a driving kit; the turn to B7 at the end is the refusal to give up | Future Trunks, Future Gohan |
| `hit_assassin` | D minor at 100: a cold bell placing a few notes and waiting, low brass under it, the hi-hat ticking like a clock; every fourth bar the music stops dead on one orchestral hit (the time-skip) | Hit |
| `earth_defenders` | D major at 152: bright brass over a rock kit, strings answering, a busy bass | Krillin, Tien, Yamcha, Chiaotzu, Yajirobe |
| `little_saiyans` | C major at 144: a xylophone-like bell bouncing through the chords, a piano under it, a light kit | Goten, Kid Trunks |
| `u6_arena` | G minor at 132: a brass fanfare, a choir behind it, toms rolling into the turn | Cabba, Magetta |

**Routed to existing pieces:** Videl → `tenkaichi`; Roshi → `martial`; Tarble → `saiyan_home`; Nail → `piccolo_theme`;
King Gurumes → `movie_conqueror`. Playable fighters without a theme: 17 → 0.

**Transformations (2026-10-16, later):** Future Trunks, Future Gohan, Goten, Kid Trunks and Cabba keep their own theme when they go Super Saiyan (character keys in `FORM_THEMES`) — the generic `ssj` used to swap in Goku's piece; the burst pushes their theme to its peak (`Battle.musicBoost`). Goku's and Vegeta's form pieces are unchanged (the soundtrack document's form themes).

**Checks:** every bar 16 steps and every note parses (`musiccheck.js`, scratch: 100 songs, 0 problems; every THEMES /
FORM_THEMES id exists); all five played in the browser pane's real AudioContext (running, the scheduler advancing bar
by bar, the music gain up) with no console errors; `gogeta_z_arrival` and `gogeta_super_rush` still play; Free Battles
built headless and started (`Battle.start`) chose them (Krillin vs Hit → `hit_assassin`, Goten vs Kid Trunks →
`little_saiyans`, Cabba vs Magetta → `u6_arena`, …). **Nobody has listened to them** — the owner should.

## Blocked / partial

- **Real recordings:** none present. If the owner provides licensed local files, they need an audio-file player
  path in `SL.Music` (the sequencer is synthesis only) — the ids above are the hooks.
- **Zamasu:** the character exists (2026-10-15) and his Free Battle theme plays; there is still no story mission for it.
- **Eyecatch placement** is an interpretation (pause = commercial break); move it if the owner prefers another beat.
- **Not human-listened:** the stand-ins were checked for valid data (every bar sixteen steps, every note parses) and
  played headless; nobody has listened to them in a browser yet.
