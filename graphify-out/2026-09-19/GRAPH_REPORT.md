# Graph Report - saiyan-legacy  (2026-09-19)

## Corpus Check
- 185 files · ~561,080 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .glb 1, .css 1)

## Summary
- 2038 nodes · 3334 edges · 200 communities (108 shown, 92 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 330 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Model
- Saiyan Legacy — Version Status
- Last Completed Work
- buu_ship.js
- balance_saibamen.js
- 21. Save / Progression
- 25. Version Strategy
- 8. Flight and Movement
- tournament.js
- buu_junior.js
- buu_spopovich.js
- buu_kibito.js
- CLAUDE.md
- Dragon Ball: Saiyan Legacy
- dev.js
- The Buu Saga — Milestone A: seven years later (2026-09-18) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**
- What changed in Version 0.2
- playtest2-tests.js
- Testing
- Stage
- feel-tests.js
- Battle
- Human Playtest / Core Feel / Camera Polish pass (2026-09-18) — **AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**
- scenes/namek_ginyu.js
- namek_prince.js
- mission_brains.js
- VFX
- techniques.js
- make_test_glb.js
- SpiritBomb
- Fighter
- Mission
- ui.js
- input.js
- Dragon Ball: Saiyan Legacy — Master Specification
- prologue_ending.js
- The Cell Games, rebuilt (owner directive, 2026-09-17) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**
- hud.js
- missions/cell_games.js
- 3. Chronological Campaign
- GLBModel
- serve.js
- src/main.js
- save.js
- headless.js
- src/core/music.js
- Creature
- saiyan_vegeta.js
- src/game/mechanics.js
- targeting.js
- controllers.js
- CameraRig
- src/render/toon.js
- saiyan_training.js
- Animator
- cinema.js
- glb_check.js
- namek_hunted.js
- saiyan_nappa.js
- BeamClash
- src/game/rules.js
- 20. Audio / VFX / Camera / Environment
- src/core/settings.js
- namek_vegeta.js
- src/data/missions/saiyan_raditz.js
- src/render/renderer.js
- screens_menu.js
- balance_duel.js
- 13. Fusions
- missions/buu_kids.js
- missions/namek_aftermath.js
- namek_ginyu.js
- namek_rematch.js
- saiyan_arrival.js
- saiyan_snakeway.js
- tests/run-tests.js
- 18. Settings / Accessibility
- 19. Show, Don't Tell
- missions/android_lab.js
- android_trunks.js
- missions/android_warning.js
- namek_end.js
- namek_goku.js
- missions/namek_super_saiyan.js
- missions/namek_vegeta_end.js
- whatif_piccolo.js
- Telemetry
- balance_boss.js
- 10. AI
- 4. Character System
- sim-tests.js
- missions/android_nineteen.js
- missions/android_road.js
- missions/buu_majin.js
- missions/cell_first.js
- cell_perfect.js
- cell_semi.js
- namek_frieza1.js
- namek_frieza2.js
- namek_frog.js
- namek_ginyu_pair.js
- namek_gohan_frieza2.js
- namek_guru.js
- namek_nail.js
- namek_recoome.js
- missions/namek_spirit_bomb.js
- namek_zarbon.js
- tools/snap.js
- 12. Transformations
- 22. Testing
- 2. Core Development Philosophy
- buu_saiyaman.js
- parse
- encounter_probe.js
- 24. Scope Management
- buu_years.js
- 17. Main Menu, Modes and Secrets
- 5. Prototype vs Production Assets
- makeNoiseSrc
- src/ui/screens_battle.js
- hold
- Imported character models (.glb)
- src/core/namespace.js
- applyVolumes
- stop
- scenes/android_fever.js
- src/data/schema.js
- missionbot.js
- buu_pursuit.js

## God Nodes (most connected - your core abstractions)
1. `Fighter` - 96 edges
2. `Battle` - 81 edges
3. `Last Completed Work` - 70 edges
4. `Human playtest checklists` - 67 edges
5. `Stage` - 43 edges
6. `Mission` - 39 edges
7. `Model` - 35 edges
8. `Dragon Ball: Saiyan Legacy — Master Specification` - 31 edges
9. `Current Playable Content` - 27 edges
10. `VFX` - 25 edges

## Surprising Connections (you probably didn't know these)
- `What is built` --references--> `tail()`  [INFERRED]
  STATUS.md → src/game/controllers.js
- `Known gaps and bugs` --references--> `Fighter`  [INFERRED]
  STATUS.md → src/game/fighter.js
- `Human playtest checklists` --references--> `bossRoar()`  [INFERRED]
  STATUS.md → src/game/techniques.js
- `Human playtest checklists` --references--> `giantStomp()`  [INFERRED]
  STATUS.md → src/game/techniques.js
- `Human playtest checklists` --references--> `giantSweep()`  [INFERRED]
  STATUS.md → src/game/techniques.js

## Import Cycles
- None detected.

## Communities (200 total, 92 thin omitted)

### Community 0 - "Model"
Cohesion: 0.10
Nodes (7): spiritFollow(), halo(), build(), geo(), Model, Spring, COMPLETED (what was actually implemented)

### Community 1 - "Saiyan Legacy — Version Status"
Cohesion: 0.15
Nodes (13): How real assets can be added later (0.2 plan — superseded), How to test, Human playtest findings, Next development target (Version 0.3 proposal — historical), Saiyan Legacy — Version Status, Status words, Test results (Version 0.2 record), Testing record: AUTOMATED TESTED vs HUMAN PLAYTESTED (+5 more)

### Community 2 - "Last Completed Work"
Cohesion: 0.14
Nodes (29): Current Playable Content, Last Completed Work, afterKrillin(), tailHunter(), deathSaucer(), scatter(), speedOrbit(), show() (+21 more)

### Community 3 - "buu_ship.js"
Cohesion: 0.26
Nodes (8): buildLedge(), clearArea(), clearCombat(), openFight(), perch(), place(), spawnFloor(), stageFloor()

### Community 4 - "balance_saibamen.js"
Cohesion: 0.40
Nodes (4): evTot, g, H, [hero = 'goku', nStr = '1', runsStr = '6']

### Community 5 - "21. Save / Progression"
Cohesion: 0.33
Nodes (6): 21. Save / Progression, Checkpoints, Developer / Test Mode, Progression, Returning to the story, Save system

### Community 6 - "25. Version Strategy"
Cohesion: 0.50
Nodes (4): 25. Version Strategy, Definition of a real release, Planned version ladder, Version discipline

### Community 7 - "8. Flight and Movement"
Cohesion: 0.50
Nodes (4): 8. Flight and Movement, Flight, Interaction with lock-on and camera, Movement (ground and air)

### Community 8 - "tournament.js"
Cohesion: 0.38
Nodes (6): announce(), bracket(), advance(), hideBracket(), match(), showBracket()

### Community 9 - "buu_junior.js"
Cohesion: 0.47
Nodes (3): benches(), place(), play()

### Community 10 - "buu_spopovich.js"
Cohesion: 0.47
Nodes (3): benches(), place(), setup()

### Community 18 - "Dragon Ball: Saiyan Legacy"
Cohesion: 0.15
Nodes (13): Combat in one minute, Controls, Dragon Ball: Saiyan Legacy, Goku's techniques (Version 0.2), How to play, Legal, Project structure, Roadmap (+5 more)

### Community 19 - "dev.js"
Cohesion: 0.10
Nodes (8): init(), nextPhase(), restartPhase(), restore(), setEnabled(), spawn(), startMission(), tick()

### Community 20 - "The Buu Saga — Milestone A: seven years later (2026-09-18) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**"
Cohesion: 0.33
Nodes (6): Adaptation choices (deliberate, documented), Browser verification by Claude (2026-09-18) — **not human playtesting**, Gap report: infrastructure the Buu saga needs that the game does not have yet, Plan for the rest of the saga (not built), Tests, The Buu Saga — Milestone A: seven years later (2026-09-18) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**

### Community 21 - "What changed in Version 0.2"
Cohesion: 0.25
Nodes (8): Architecture, Characters, Goku showcase, Local three.js — COMPLETE, Stages, Story, Visual foundation (all characters), What changed in Version 0.2

### Community 23 - "Testing"
Cohesion: 0.50
Nodes (4): Automated tests (developers only), Combat Lab (in-game scenarios), Other developer tools, Testing

### Community 27 - "Human Playtest / Core Feel / Camera Polish pass (2026-09-18) — **AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**"
Cohesion: 0.29
Nodes (7): BROWSER VERIFIED (by Claude, canvas captures — **not human playtesting**), Future work (recorded, not started), Human playtest checklist (this pass), Human Playtest / Core Feel / Camera Polish pass (2026-09-18) — **AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**, HUMAN PLAYTESTED, Remaining issues (known, not fixed), TESTED

### Community 33 - "mission_brains.js"
Cohesion: 0.09
Nodes (45): AUTOMATED TESTING (2026-09-18, Buu Saga Milestone B), Adaptation choices (deliberate, documented), Architecture audit: what the later Buu milestones need, Costume vs form vs separate character vs story-only (architecture decision), Human playtest checklist (Milestone B — not yet played by a human), Story order, Tests, The Buu Saga — Milestone B: the World Tournament and the wizard (2026-09-18) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED** (+37 more)

### Community 46 - "VFX"
Cohesion: 0.06
Nodes (13): Adding a character, Aura, BeamVisual, flash(), getAuraGeo(), makeAuraMaterial(), makeBeamMaterial(), Particles (+5 more)

### Community 58 - "techniques.js"
Cohesion: 0.06
Nodes (38): AUTOMATED TESTING (2026-09-17, after the Cell Games rebuild), it(), beansLeft(), beltTail(), bodyChange(), bossBomber(), bossEruption(), bossPose() (+30 more)

### Community 62 - "make_test_glb.js"
Cohesion: 0.07
Nodes (38): ref_zlib, accessor(), accessors, addVertex(), animations, B, bin, binBuf (+30 more)

### Community 68 - "SpiritBomb"
Cohesion: 0.10
Nodes (5): Beam, getCoreGeo(), Projectiles, segmentDistance(), SpiritBomb

### Community 74 - "Fighter"
Cohesion: 0.05
Nodes (31): attack(), beamCharge(), beamFire(), blast(), charge(), dash(), dodge(), emptyIntent() (+23 more)

### Community 78 - "Mission"
Cohesion: 0.06
Nodes (9): AUTOMATED TESTING (2026-09-14), AUTOMATED TESTING (2026-09-15), AUTOMATED TESTING (2026-09-16), AUTOMATED TESTING (2026-09-17, Namek climax revision), AUTOMATED TESTING (2026-09-18, Buu Saga Milestone A), AUTOMATED TESTING (2026-09-18, Human Playtest / Core Feel pass), HUMAN PLAYTESTING, Latest Test Results (+1 more)

### Community 79 - "ui.js"
Cohesion: 0.12
Nodes (20): actionRow(), applyStyleSettings(), choiceRow(), confirm(), generateAll(), get(), init(), menuButton() (+12 more)

### Community 87 - "input.js"
Cohesion: 0.11
Nodes (20): _anyDown(), _applyToggle(), bindingLabel(), _code(), exitPointerLock(), _finishCapture(), init(), _isBoundKey() (+12 more)

### Community 89 - "Dragon Ball: Saiyan Legacy — Master Specification"
Cohesion: 0.10
Nodes (21): 11. Bosses, 14. Dragon Balls, 15. Customization, 16. What-If, 1. Project Vision, 23. Performance, 26. Current Asset Philosophy, 7. Combat System (+13 more)

### Community 90 - "prologue_ending.js"
Cohesion: 0.15
Nodes (25): addExtra(), beamFx(), beat(), camAt(), cleanup(), coronaFx(), crackShell(), dropExtra() (+17 more)

### Community 91 - "The Cell Games, rebuilt (owner directive, 2026-09-17) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**"
Cohesion: 0.33
Nodes (6): Browser verification by Claude (2026-09-17) — **not human playtesting**, Canon simplifications (deliberate, documented), How the Father-Son Kamehameha is kept for its moment, Known gaps and bugs, Phases and checkpoints, The Cell Games, rebuilt (owner directive, 2026-09-17) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**

### Community 92 - "hud.js"
Cohesion: 0.13
Nodes (29): _addTransient(), _aimText(), attach(), _buildParty(), _buildSkills(), detach(), fighterPanel(), _onCallout() (+21 more)

### Community 99 - "missions/cell_games.js"
Cohesion: 0.05
Nodes (30): Asset Blockers, Current Architecture, Current Character Asset Levels, Current Controls, Current Development Phase, Current GLB Pipeline, Current Remaining Tasks, Current Version (+22 more)

### Community 101 - "3. Chronological Campaign"
Cohesion: 0.08
Nodes (24): 3. Chronological Campaign, Android Saga, Battle of Gods, Campaign structure, Cell, Chapter 1 — Kid Goku (original Dragon Ball), Chapter 2 — World Tournament, Chapter 3 — King Piccolo (+16 more)

### Community 105 - "GLBModel"
Cohesion: 0.10
Nodes (9): 6. GLB / Real Model Pipeline, How it works, Not supported yet (needed before real characters can fully replace prototypes), Sources, GLBModel, guessJointMap(), sideOf(), skinnedOutlineMat() (+1 more)

### Community 109 - "serve.js"
Cohesion: 0.17
Nodes (11): ref_fs, ref_http, ref_path, fs, H, path, fs, http (+3 more)

### Community 115 - "src/main.js"
Cohesion: 0.23
Nodes (19): crash(), _crashNav(), _hideLoading(), init(), _launch(), _liveSettings(), loop(), _onFreeEnd() (+11 more)

### Community 119 - "save.js"
Cohesion: 0.21
Nodes (18): activeKey(), completeMission(), completion(), conditionMet(), evaluateUnlocks(), fresh(), isUnlocked(), isWhatIf() (+10 more)

### Community 120 - "headless.js"
Cohesion: 0.18
Nodes (10): H, H, create(), fs, makeStub(), path, root, scriptList() (+2 more)

### Community 126 - "src/core/music.js"
Cohesion: 0.26
Nodes (15): attach(), _bass(), _hat(), _kick(), _lead(), noteToMidi(), _pad(), play() (+7 more)

### Community 127 - "Creature"
Cohesion: 0.19
Nodes (5): buildGregory(), buildTrex(), Creature, mat(), part()

### Community 130 - "saiyan_vegeta.js"
Cohesion: 0.21
Nodes (11): apeFalls(), camAt(), clearArea(), clearCombat(), faceTo(), ground(), place(), powerBall() (+3 more)

### Community 132 - "src/game/mechanics.js"
Cohesion: 0.17
Nodes (10): damageIn(), damageOut(), empower(), hud(), init(), on(), phaseOf(), speedMul() (+2 more)

### Community 133 - "targeting.js"
Cohesion: 0.29
Nodes (15): aimTarget(), best(), candidates(), current(), farProp(), flick(), freeAimPoint(), kindOf() (+7 more)

### Community 138 - "controllers.js"
Cohesion: 0.12
Nodes (9): AIController, execute(), get(), mate(), plan(), PlayerController, pre(), scores() (+1 more)

### Community 141 - "src/render/toon.js"
Cohesion: 0.21
Nodes (11): addOutline(), addRim(), flareTexture(), init(), makeGradient(), makeMat(), mat(), outlineMat() (+3 more)

### Community 148 - "saiyan_training.js"
Cohesion: 0.26
Nodes (10): camAt(), clearArea(), fruitTree(), ground(), kkHouse(), kkSetup(), outburst(), place() (+2 more)

### Community 150 - "cinema.js"
Cohesion: 0.12
Nodes (5): cam(), move(), pose(), say(), vfx()

### Community 151 - "glb_check.js"
Cohesion: 0.14
Nodes (11): ab, argv, BUDGET, bytes, file, fs, g, H (+3 more)

### Community 161 - "namek_hunted.js"
Cohesion: 0.23
Nodes (5): clearArea(), faceTo(), ground(), offstage(), setup()

### Community 162 - "saiyan_nappa.js"
Cohesion: 0.39
Nodes (11): bossAI(), camAt(), chiaotzuSacrifice(), clearArea(), clearCombat(), faceTo(), ground(), knockOut() (+3 more)

### Community 164 - "src/game/rules.js"
Cohesion: 0.21
Nodes (5): _baseMult(), beamPower(), comboScale(), computeDamage(), multipliers()

### Community 172 - "20. Audio / VFX / Camera / Environment"
Cohesion: 0.18
Nodes (11): 20. Audio / VFX / Camera / Environment, Animation, Audio, Aura system, Camera, Destruction, Dialogue and faces, Environments (+3 more)

### Community 173 - "src/core/settings.js"
Cohesion: 0.36
Nodes (10): applyPreset(), bind(), get(), load(), resetBindings(), resetCategory(), safeStorage(), save() (+2 more)

### Community 174 - "namek_vegeta.js"
Cohesion: 0.29
Nodes (5): clearArea(), faceTo(), ground(), offstage(), setup()

### Community 175 - "src/data/missions/saiyan_raditz.js"
Cohesion: 0.29
Nodes (8): camAt(), canonEnding(), fireCannon(), ground(), podMesh(), setup(), stage2(), struggle()

### Community 176 - "src/render/renderer.js"
Cohesion: 0.31
Nodes (5): applyQuality(), create(), init(), rebuild(), resize()

### Community 178 - "balance_duel.js"
Cohesion: 0.18
Nodes (7): agg, args, g, H, insightCount, json, TWEAKS

### Community 183 - "13. Fusions"
Cohesion: 0.20
Nodes (10): 13. Fusions, Canon fusions, Combat identity (not summed stats), Conditions, Duration and limits (configurable, not identical for every fusion), Fusion AI, Fusion-exclusive techniques, Methods (mechanically distinct) (+2 more)

### Community 184 - "missions/buu_kids.js"
Cohesion: 0.33
Nodes (7): clearArea(), clearCombat(), faceTo(), ground(), place(), setup(), sparSetup()

### Community 185 - "missions/namek_aftermath.js"
Cohesion: 0.08
Nodes (15): clearArea(), drop(), ground(), setup(), beacon(), clearArea(), faceTo(), ground() (+7 more)

### Community 186 - "namek_ginyu.js"
Cohesion: 0.27
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 188 - "namek_rematch.js"
Cohesion: 0.27
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 189 - "saiyan_arrival.js"
Cohesion: 0.36
Nodes (8): camAt(), clearArea(), clearCombat(), faceTo(), ground(), lastOne(), place(), setup()

### Community 190 - "saiyan_snakeway.js"
Cohesion: 0.28
Nodes (3): roadPoint(), roadPost(), setup()

### Community 191 - "tests/run-tests.js"
Cohesion: 0.20
Nodes (5): fs, path, pendingTests, root, vm

### Community 195 - "18. Settings / Accessibility"
Cohesion: 0.22
Nodes (9): 18. Settings / Accessibility, Accessibility, Audio, Camera, Controls, Gameplay, Graphics, HUD (+1 more)

### Community 196 - "19. Show, Don't Tell"
Cohesion: 0.40
Nodes (5): 19. Show, Don't Tell, Final presentation rule, Preference order, Rules by area, Tutorial popup limit (a last resort)

### Community 197 - "missions/android_lab.js"
Cohesion: 0.31
Nodes (4): capsule(), clearArea(), ground(), setup()

### Community 198 - "android_trunks.js"
Cohesion: 0.28
Nodes (3): clearArea(), ground(), setup()

### Community 199 - "missions/android_warning.js"
Cohesion: 0.28
Nodes (3): clearArea(), ground(), setup()

### Community 200 - "namek_end.js"
Cohesion: 0.31
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 201 - "namek_goku.js"
Cohesion: 0.33
Nodes (5): clearArea(), faceTo(), ground(), landingPod(), setup()

### Community 202 - "missions/namek_super_saiyan.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 203 - "missions/namek_vegeta_end.js"
Cohesion: 0.33
Nodes (5): clearArea(), faceTo(), grave(), ground(), setup()

### Community 204 - "whatif_piccolo.js"
Cohesion: 0.42
Nodes (7): camAt(), clearArea(), faceTo(), ground(), place(), setup(), teamAttack()

### Community 206 - "balance_boss.js"
Cohesion: 0.22
Nodes (6): [boss = 'nappa', heroesArg = 'goku', runsStr = '4', diff = 'normal', driver = 'cpu'], brains, g, H, heroes, tot

### Community 209 - "10. AI"
Cohesion: 0.25
Nodes (8): 10. AI, AI polish, Balance testing, Difficulty, Group behavior, Personality archetypes, What AI considers, What AI does

### Community 210 - "4. Character System"
Cohesion: 0.25
Nodes (8): 4. Character System, Balancing, Character data architecture, Character-specific identities and mechanics (minimum direction), Every fighter is a gameplay identity, Final character quality standard, Presentation per character, Roster (from the original specification; expandable)

### Community 211 - "sim-tests.js"
Cohesion: 0.25
Nodes (7): ref_child_process, fs, H, path, vm, err(), bone()

### Community 212 - "missions/android_nineteen.js"
Cohesion: 0.32
Nodes (3): clearArea(), ground(), setup()

### Community 213 - "missions/android_road.js"
Cohesion: 0.32
Nodes (3): clearArea(), ground(), setup()

### Community 214 - "missions/buu_majin.js"
Cohesion: 0.32
Nodes (3): clearArea(), ground(), setup()

### Community 215 - "missions/cell_first.js"
Cohesion: 0.32
Nodes (3): clearArea(), ground(), setup()

### Community 216 - "cell_perfect.js"
Cohesion: 0.32
Nodes (3): clearArea(), ground(), setup()

### Community 217 - "cell_semi.js"
Cohesion: 0.32
Nodes (3): clearArea(), ground(), setup()

### Community 218 - "namek_frieza1.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 219 - "namek_frieza2.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 220 - "namek_frog.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 221 - "namek_ginyu_pair.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 222 - "namek_gohan_frieza2.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 223 - "namek_guru.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 224 - "namek_nail.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 225 - "namek_recoome.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 226 - "missions/namek_spirit_bomb.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 227 - "namek_zarbon.js"
Cohesion: 0.36
Nodes (4): clearArea(), faceTo(), ground(), setup()

### Community 231 - "12. Transformations"
Cohesion: 0.29
Nodes (7): 12. Transformations, Event structure, Gameplay changes, Kaioken (Version 0.3 brief), Presentation, Story restrictions, Transformations named in the specification

### Community 232 - "22. Testing"
Cohesion: 0.29
Nodes (7): 22. Testing, Automated tests, Final quality pass (before declaring a major milestone complete), Final release checklist, Kinds of testing, Manual / human playtesting, What to test (quality control)

### Community 233 - "2. Core Development Philosophy"
Cohesion: 0.29
Nodes (7): 2. Core Development Philosophy, Development loop, Order of importance (final development philosophy), Polish over checklists, Principles, Technical debt and architecture, The development ladder

### Community 235 - "parse"
Cohesion: 0.52
Nodes (5): decodeBase64(), fromRegistry(), parse(), imageBytes(), texture()

### Community 237 - "encounter_probe.js"
Cohesion: 0.33
Nodes (4): H, [missionId = 'prologue_final_stand', phaseStr = '1', secStr = '60', seedStr = '1', skill = 'novice'], run(), runs

### Community 239 - "24. Scope Management"
Cohesion: 0.33
Nodes (6): 24. Scope Management, Classifying features, Development phases (from the original specification), Production priority, Reuse without looking cheap, Vertical slice first

### Community 247 - "17. Main Menu, Modes and Secrets"
Cohesion: 0.40
Nodes (5): 17. Main Menu, Modes and Secrets, Evolving secret main menu, Main menu, Modes (possible), No fake buttons (important implementation rule)

### Community 248 - "5. Prototype vs Production Assets"
Cohesion: 0.40
Nodes (5): 5. Prototype vs Production Assets, Production pipeline per character, Rules, Three asset quality levels, Why prototypes

### Community 250 - "makeNoiseSrc"
Cohesion: 0.33
Nodes (6): aura(), beam(), beamCharge(), makeNoiseSrc(), wind(), Browser verification by Claude (2026-09-18) — **not human playtesting**

### Community 254 - "hold"
Cohesion: 0.50
Nodes (3): hold(), run(), runAll()

### Community 255 - "Imported character models (.glb)"
Cohesion: 0.50
Nodes (3): How a model is used, Imported character models (.glb), Production model requirements

### Community 267 - "applyVolumes"
Cohesion: 1.00
Nodes (3): applyVolumes(), init(), setMuted()

### Community 268 - "stop"
Cohesion: 0.40
Nodes (5): liveLoops(), _noise(), _osc(), stop(), stopLoops()

### Community 353 - "buu_pursuit.js"
Cohesion: 0.36
Nodes (4): lineUp(), place(), slot(), trailHook()

## Knowledge Gaps
- **280 isolated node(s):** `fs`, `path`, `H`, `H`, `H` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 832 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **92 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Human playtest checklists` connect `Last Completed Work` to `Model`, `mission_brains.js`, `saiyan_vegeta.js`, `Saiyan Legacy — Version Status`, `techniques.js`, `GLBModel`, `Fighter`, `VFX`, `ui.js`, `cinema.js`, `Battle`, `hold`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `Last Completed Work` connect `Last Completed Work` to `mission_brains.js`, `missions/cell_games.js`, `techniques.js`, `src/game/mechanics.js`, `Fighter`, `VFX`, `ui.js`, `cinema.js`, `Stage`, `Battle`, `hold`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `Fighter` connect `Fighter` to `The Cell Games, rebuilt (owner directive, 2026-09-17) — **FUNCTIONAL PROTOTYPE · AUTOMATED TESTED · BROWSER-VERIFIED BY CLAUDE · NOT HUMAN PLAYTESTED**`, `Last Completed Work`, `missions/cell_games.js`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Fighter` (e.g. with `Known Bugs` and `Last Completed Work`) actually correct?**
  _`Fighter` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 69 inferred relationships involving `Last Completed Work` (e.g. with `afterKrillin()` and `tailHunter()`) actually correct?**
  _`Last Completed Work` has 69 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `Human playtest checklists` (e.g. with `afterKrillin()` and `apeFalls()`) actually correct?**
  _`Human playtest checklists` has 66 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fs`, `path`, `H` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._