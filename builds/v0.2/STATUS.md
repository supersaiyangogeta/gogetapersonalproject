# Saiyan Legacy — Version Status

**Current version:** 0.2.0 — "Goku Showcase" (in-game: main menu footer)
**Previous version:** 0.1.0 — First Playable Build, frozen in `builds/v0.1/`
**Last updated:** 2026-09-13

This file is the honest, detailed status of the project. The README explains how to play; this file explains what exists, what does not, and what blocks the next steps.

Everything stays local. There is no git repository, no remote, and nothing is uploaded or published.

---

## Status words

| Word | Meaning |
|---|---|
| **COMPLETE** | Works, is tested, and is polished for this version's scope. |
| **FUNCTIONAL PROTOTYPE** | Fully works and is tested. Quality is not final (usually art, animation or audio). |
| **PARTIALLY IMPLEMENTED** | Works, but a planned part is missing. The missing part is named. |
| **PLACEHOLDER** | Exists only to hold a place (for example an "In Development" card). Not playable. |
| **PLANNED** | Not built. Nothing in the game pretends it exists. |
| **BLOCKED BY ASSETS** | Needs art, animation or audio that code alone cannot produce at good quality. |
| **NEEDS TESTING** | Built, but not yet verified well enough to call working. |

---

## Version history

| Version | Date | Location | Summary |
|---|---|---|---|
| 0.1.0 | 2026-09-13 | `builds/v0.1/` (frozen copy, runs on its own) | Combat foundation, Goku / Vegeta / Bardock, Bardock Prologue, Free Battle, Training, settings, saves, 35 unit tests, 20 Combat Lab scenarios. |
| 0.2.0 | 2026-09-13 | main folder | Local three.js, Goku showcase pass, visual foundation (rim light, faces, hands, secondary motion), Chapter 1 (Raditz), first What-If, Raditz / Piccolo / Kid Gohan, character schema validation, 47 unit tests, 37 Combat Lab scenarios. |

### Version 0.2 save data

Version 0.2 uses its own save slot (`saiyanLegacy.save.v2`). On first launch it copies Version 0.1 progress (`saiyanLegacy.save.v1`) into the new slot and never writes to the old one. Version 0.1 in `builds/v0.1/` keeps working with its own progress.

---

## What changed in Version 0.2

### Local three.js — COMPLETE
- `vendor/three.min.js` (three.js r149, MIT licence in `vendor/three.LICENSE.txt`) is loaded directly. The CDN fallback is gone from `index.html` and `tools/viewer.html`. The game runs with no internet connection.
- If the file is missing, the boot screen says exactly which file is missing and where a spare copy is.

### Goku showcase

| Feature | Status | Details |
|---|---|---|
| Light string (jab, cross, elbow, roundhouse) | COMPLETE | Faster startup than 0.1, follow-through poses. |
| Branching heavies | COMPLETE | Light → Heavy = **Flurry** (5-hit multi-hit rush with a push finisher). Light ×3 → Heavy = **Meteor Crash** (vanishes above the target and axe-kicks down, costs 10 ki). Standalone, launcher and spinning heel finishers kept. |
| Aerial combat | COMPLETE | When both fighters are airborne, heavies use an aerial set: Hammer (smash down), Air Upper (launch), Air Spin kick. Chase follow-ups use Goku's own axe kick and chase kick. |
| Kamehameha | COMPLETE | Three charge tiers (flash, sparks, ring, sound and camera punch at each tier), syllable callouts on screen, energy gathering particles, charge light, camera push-in while charging, traveling energy rings along the beam, beam colour and name change with the form (Kaioken Kamehameha, Super Kamehameha). |
| Instant Kamehameha | COMPLETE | Pressing Special 1 right after Instant Transmission fires a fast, short-charge Kamehameha. The skill card shows **INSTANT** while the window is open. |
| Instant Transmission | COMPLETE | Direction decides where Goku reappears: **neutral = behind**, **forward = in front with an instant strike**, **up = above (next heavy becomes an axe smash)**, **back = away to reset**. A shimmer appears at the destination just before he arrives (readable counterplay; the CPU guards or vanishes against it). Repeated use within 4 seconds costs more ki and has a longer cooldown (shown with red pips). Used during a combo it is an escape to a safe distance. |
| Kaioken | COMPLETE | Burst transformation with a red, sharp, steaming aura and afterimages. Holding Charge in Kaioken raises it to **x3** and **x4** (more damage and speed, much heavier health drain, a callout and a shockwave at each level). The form badge shows the level. |
| Super Saiyan transformation event | COMPLETE (FUNCTIONAL PROTOTYPE art) | Data-driven 2.6-second event: the sky darkens, heartbeat, clenched fists and grit, orbiting low camera, rocks rise, lightning, sky bolts, hair flickers between black and gold, a rage scream, the burst (flash, crater, shockwave that pushes enemies away), then a face reveal shot with teal eyes. The opponent reacts with a voice line. Shortened automatically when cinematic camera is off. |
| Spirit Bomb | COMPLETE | Hold Ultimate to keep gathering energy: the sphere grows (size, damage, blast radius and clash power scale with the charge), the sky darkens, energy streams in from the whole battlefield. Release to throw it; the camera follows the bomb. A beam that meets a flying Spirit Bomb starts a **beam-vs-bomb clash**. |
| Hit reactions | COMPLETE | Directional reactions (front, left, right, from behind), aerial spin reaction, squash and stretch on impacts, launches and landings. |
| Intro, victory, defeat | COMPLETE | Multi-step sequences (stretch, shoulder roll, ready stance; victory hop and peace sign or fist raise; stagger to one knee when the player loses). Vegeta and Bardock also received their own sequences. |
| Voice barks | COMPLETE (text only) | Rate-limited combat lines on long combos, big hits, low health, Spirit Bomb, and reactions to an opponent transforming. |
| Goku AI | COMPLETE | Uses Instant Transmission with intent (punish, above, in front, reset), follows it with Instant Kamehameha or strikes, interrupts charging opponents, climbs Kaioken levels while healthy and pushes to Super Saiyan when Kaioken strain gets dangerous, holds the Spirit Bomb longer when there is room. New *martial* personality. |
| Audio for the showcase | FUNCTIONAL PROTOTYPE | New synthesized sounds: tier up, Instant Transmission pop, Super Saiyan build-up roar, Kaioken boom, a singing Kamehameha charge. |

### Visual foundation (all characters)

| Feature | Status | Details |
|---|---|---|
| Rim light | COMPLETE | Crisp edge light on every character; its colour and strength follow the aura, so ki visibly lights the fighter. |
| Faces | FUNCTIONAL PROTOTYPE | Eyes with whites, pupils, highlights, lash lines and blinking; teeth for shouting and gritting; nine expressions. |
| Hands | FUNCTIONAL PROTOTYPE | Fist, open hand and pointing hand, chosen per pose (open palms for beams, two fingers for Instant Transmission). |
| Secondary motion | COMPLETE | Spring-driven hair sway, belt tails and capes react to movement and turns. |
| Flight banking and lean | COMPLETE | Fighters bank into turns and lean with acceleration. |
| Afterimages | COMPLETE | Ghost copies of the actual pose on dodges, vanishes, teleports, chases and fast flight in powered forms. |
| Contact shadow | COMPLETE | Soft blob shadow that shrinks and fades with altitude. |
| Readable auras and beams | COMPLETE | Aura flames fade toward the body so the fighter stays visible; beam shells keep their colour on bright skies. |
| Gi details | FUNCTIONAL PROTOTYPE | Goku's V-neck undershirt and lapels, thicker trapezius, bicep shaping. |

### Story

| Content | Status | Details |
|---|---|---|
| Prologue: *The Final Stand* | COMPLETE | Content unchanged from 0.1. Regression run in 0.2: every phase through the Supernova struggle, ending and results (the CPU autopilot ignores the pods objective in both 0.1 and 0.2, so pods were destroyed by script during the automated run). |
| Chapter 1: *A Brother From Space* (canon) | FUNCTIONAL PROTOTYPE | Unlocks after the Prologue. Six phases: arrival cinematic, Goku + Piccolo (CPU ally) vs Raditz, the tail grab (mash to hold on; Raditz tricks Goku), keep Raditz busy while Piccolo charges (his first Special Beam Cannon misses), Gohan's outburst breaks Raditz's armor, the full-nelson hold (mash to hold him while he surges to break free) and Piccolo's second shot ending both brothers, with an epilogue. Checkpoints, optional objectives, grip score, rank. Saiyan Saga Goku cannot use Instant Transmission, Spirit Bomb or transformations here (locked and hidden in the HUD). |
| What If: *What if Goku defeated Raditz?* | FUNCTIONAL PROTOTYPE | Separate mission flagged as a branch of Chapter 1, unlocked by clearing it. Recap narration, Goku refuses to sacrifice himself, a final fight against a Raditz with cracked armor, a Kamehameha vs Double Sunday struggle (win the clash or catch him mid-charge), and an alternate ending in which Vegeta hears everything over the scouter. Progress is saved on a separate What-If track and never changes canon progress. |
| What If? menu | COMPLETE | Appears in the main menu once unlocked. Lists branches with the canon mission they come from, plus an honest "In Development" card. |
| Story timeline | COMPLETE | Data-driven (`src/data/story.js`): Prologue and Chapter 1 playable; Chapter 2 (*One Year*) and Chapter 3 (*The Saiyans Arrive*) shown as PLACEHOLDER "In Development" cards. |
| Chapter 2 and later | PLANNED | |

### Characters

| Fighter | Status | Notes |
|---|---|---|
| Goku | FUNCTIONAL PROTOTYPE (showcase) | See above. Art is still prototype. |
| Vegeta | FUNCTIONAL PROTOTYPE | New flight stance, intro / victory / defeat sequences, barks. |
| Bardock | FUNCTIONAL PROTOTYPE | New flight stance, headband intro, barks, improved hair. |
| **Raditz** | FUNCTIONAL PROTOTYPE, playable after Chapter 1 | Brute: long-reach strings, shoulder ram, rising kick, Double Axe smash, Double Sunday beam, Saturday Crush, Shining Friday. Mechanic *Ruthless* (extra damage on reeling opponents, knockdowns feed ki). Waist-length mane, armor, scouter, tail. No transformations. |
| **Piccolo** | FUNCTIONAL PROTOTYPE, story ally only | CPU partner in Chapter 1. Turban, cape, antennae, pointed ears. Explosive Demon Wave, Evil Blast, Special Beam Cannon (spiral rings). Mechanic *Regeneration*. **Not playable** yet: his moveset is not polished enough. |
| **Kid Gohan** | PLACEHOLDER | Cutscene character only (cap with Four-Star Dragon Ball, tail, headbutt pose). |
| Frieza Force, Frieza | FUNCTIONAL PROTOTYPE | Unchanged. |

### Stages

| Stage | Status |
|---|---|
| Rocky Wasteland | COMPLETE (prototype art) |
| Planet Vegeta Orbit | COMPLETE (prototype art) |
| **Grassland Hills** (Chapter 1; unlocked for Free Battle after it) | FUNCTIONAL PROTOTYPE — green terrain, trees, grey spires, rolling hills. |

### Architecture

| Item | Status | Details |
|---|---|---|
| Data-driven character schema | COMPLETE | Characters describe stats, moves (multi-hit windows, teleport strikes, follow-through poses, aerial sets, chase moves), specials (beam tiers, callouts, instant and form variants, teleport modes and fatigue, hold-to-charge Spirit Bomb, clash power), forms (levels, transformation sequences, ghost colours, reaction lines), presentation sequences (intro / victory / defeat), hand shapes, VFX and audio profiles, barks, AI hooks and mechanics. |
| Schema validator | COMPLETE | `src/data/schema.js` checks every character at boot (problems go to the browser console) and in the unit tests. |
| AI hooks registry | COMPLETE | `SL.AIHooks[name]` lets a character add behaviour (pre-checks, score adjustments, custom plans) without touching the shared AI. |
| Story-locked techniques | COMPLETE | `fighter.lockedSlots` hides and blocks techniques a character has not learned at that point in the story. |
| Canon / What-If separation | COMPLETE | Mission flags (`canon`, `whatIf`, `branchOf`, `branchPoint`), separate timeline lists, separate save track. |

---

## What is still a prototype

- **Every character model.** Built in code from primitives with cel shading, rim light and outlines. Recognizable, not detailed.
- **All animation.** Pose-to-pose blending with springs and squash / stretch. No hand-keyed curves or motion capture.
- **All audio.** Synthesized in code. No recorded sound design, no composed soundtrack, no voices (subtitles only).
- **Chapter 1 cinematics.** Staged with the combat models and poses; camera work is scripted but the acting is limited by the models.
- **Piccolo's moveset** (ally only) and Raditz's moveset (playable prototype) have not had the polish pass Goku had.

## What is blocked by assets

| Need | Why code cannot solve it well |
|---|---|
| Skinned, sculpted 3D character models | Faces, muscles, clothing folds and hair volume need a 3D artist. |
| Hand-keyed or motion-captured animation | Weight, overlap and timing at anime quality need an animator. |
| Voice acting | Needs actors (and must not be ripped from the anime or games). |
| Composed music and recorded sound design | Needs a composer and sound designer. |
| Detailed environments (cities, Kame House, Namek) | Needs environment art. |

### How real assets can be added later (workflow — nothing downloaded yet)

1. **Format:** glTF 2.0 (`.glb`), one file per character, exported from Blender.
2. **Rig:** the skeleton must use the joint names the game already animates: `hips, spine, chest, neck, head, shoulderL/R, elbowL/R, handL/R, thighL/R, kneeL/R, footL/R` (character faces +Z, left side is +X). Then every existing pose, move and cinematic works on the new model.
3. **Sources:** only models you made, commissioned, or that have a licence allowing this use. **Never** ripped models from official games or the anime.
4. **Loading problem to solve first:** browsers block `fetch()` of local files when the game is opened by double-clicking `index.html`. Two options: (a) convert each `.glb` to a JavaScript file containing base64 data (a small Node script, keeps double-click play working), or (b) require the local dev server (`node tools/serve.js`) for asset builds.
5. **Integration:** add `three/examples/js/loaders/GLTFLoader.js` (r149, local), add an `appearance.model` field, keep the procedural model as the fallback.
6. **Before any asset is used**, it will be listed in this file with its source and licence.

You do **not** need to design characters for the game right now. A drawing cannot be turned into a rigged 3D model automatically, so drawings would not unblock anything. What would help later: finished `.glb` models following the rig above, or reference sheets for a 3D artist.

## What is not yet implemented

- Chapter 2 onward (Saibamen, Nappa, Vegeta, Great Ape), Namek and later sagas.
- More What-If stories.
- Playable Piccolo, Gohan, Krillin, Nappa, Frieza and the rest of the roster.
- Tournament, Boss Rush, Dragon Ball hunt and Shenron wishes, customization, fusion, gallery.
- Controller radial skill menu.
- Destructible cities, weather, time of day.
- Desktop packaging (.exe).

---

## Test results (Version 0.2)

| Suite | Result |
|---|---|
| Unit tests — `node tests/run-tests.js` | **47 passed, 0 failed** (combat math incl. Kaioken level multipliers, save system incl. v0.1 import and What-If track separation, settings, data integrity, schema validation for every character, story/What-If structure, Chapter 1 canon restrictions, unlock references) |
| Combat Lab — `SLLab.runAll()` | **37 passed, 0 failed** (20 regression scenarios from 0.1, 13 Goku showcase scenarios, 4 Chapter 1 cast scenarios) |
| Schema validation at boot | 0 problems |
| Launch | Loads over http://localhost with the local three.js (r149 reported). The code uses no fetch, XHR or modules, so double-clicking `index.html` uses the same code path; that exact file:// launch could not be exercised from the test browser this session — NEEDS TESTING on your machine (just double-click it). |
| Dev tools | `tools/viewer.html` shows all characters including Raditz, Piccolo and Kid Gohan. |
| AI vs AI soak (hard, Free Battle) | 10 matches (Goku vs Vegeta / Bardock / Raditz, both sides), **0 runtime errors**. Goku lost all of them, as he already did in 0.1 (0.1: lost 4 of 4, opponents left with 44–69% health; 0.2 after tuning: opponents left with 8–65%). Diagnosis: the CPU Goku guards more and gets thrown and pressured by the aggressive CPUs. **Goku AI-vs-AI balance NEEDS TESTING / tuning**; human play was not measured. |
| Chapter 1 canon | Played through every phase with the CPU driving Goku and scripted button mashing: tail struggle, survival phase, first cannon, Gohan, hold struggle (success and failure → checkpoint retry both verified), ending, epilogue, results, unlocks. |
| What If | Played through: recap, refusal, final fight, beam duel (clash win and mid-charge punish both verified), alternate ending, results, separate save track, What If? menu. |
| V0.1 snapshot | `builds/v0.1/index.html` launches and runs offline. |

## How to test

1. Unit tests (needs Node.js): `node tests/run-tests.js`
2. Combat Lab: open the game, press F12, run
   `const s = document.createElement('script'); s.src = 'tools/lab.js'; document.body.appendChild(s);`
   then `SLLab.runAll().then(r => console.table(r))`. Filter with `SLLab.runAll('V0.2')`.
3. Visual checks: `tools/snap.js` (same loading method) sets up training scenes, freezes moments and places the camera (`Snap.setup`, `Snap.freeze`, `Snap.orbit`).
4. Data problems: `SL.dataProblems` in the console lists schema errors (empty means valid).

## Next development target (Version 0.3 proposal)

1. **Chapter 2 and 3:** Piccolo's survival training with Gohan (a playable Gohan prototype), Snake Way / King Kai (Kaioken unlocked in story), Saibamen and Nappa, Vegeta with a Great Ape phase.
2. **Playable Piccolo** after a polish pass like Goku's.
3. **Second What-If** branching from Chapter 3.
4. **Controller radial skill menu** and a move list screen that shows the new Goku branches.
5. **Balance pass** with human playtesting (Goku AI-vs-AI win rate, Chapter 1 survival phase on each difficulty).
6. **Asset pipeline spike:** load one test `.glb` through the rig mapping with the base64 JS approach, without shipping any third-party model.
