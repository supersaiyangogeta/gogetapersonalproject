# Dragon Ball: Saiyan Legacy — Master Specification

> **What this document is.** The permanent, long-term specification of what *Dragon Ball: Saiyan Legacy* is supposed to become. It was extracted from the project owner's original master prompt (a very long design brief covering vision, roster, campaign, production scope, fusion, settings, customization, secrets, polish and presentation) and from the owner's later standing directives (Version 0.2 and 0.3 briefs, the asset-strategy correction, and the first and second human playtest reports). Wording, terminology and priorities are preserved as closely as possible.
>
> **What this document is not.** It is not a status report. Almost everything described here does **not** exist yet. For what exists today read `HANDOFF.md` (current state and next steps) and `STATUS.md` (detailed factual status and test record). For how to run the game read `README.md`.
>
> **Documentation hierarchy**
>
> | File | Answers |
> |---|---|
> | `MASTER_SPEC.md` | What the game is supposed to become. Changes only when the long-term specification itself changes. |
> | `HANDOFF.md` | Where development currently is and what happens next. Changes often. |
> | `STATUS.md` | Detailed factual implementation status and testing record. |
> | `README.md` | How the project is run and used. |
>
> If these documents disagree, inspect the actual source code and tests before deciding which statement is correct.

---

## Contents

1. [Project Vision](#1-project-vision)
2. [Core Development Philosophy](#2-core-development-philosophy)
3. [Chronological Campaign](#3-chronological-campaign)
4. [Character System](#4-character-system)
5. [Prototype vs Production Assets](#5-prototype-vs-production-assets)
6. [GLB / Real Model Pipeline](#6-glb--real-model-pipeline)
7. [Combat System](#7-combat-system)
8. [Flight and Movement](#8-flight-and-movement)
9. [Targeting / Lock-On](#9-targeting--lock-on)
10. [AI](#10-ai)
11. [Bosses](#11-bosses)
12. [Transformations](#12-transformations)
13. [Fusions](#13-fusions)
14. [Dragon Balls](#14-dragon-balls)
15. [Customization](#15-customization)
16. [What-If](#16-what-if)
17. [Main Menu, Modes and Secrets](#17-main-menu-modes-and-secrets)
18. [Settings / Accessibility](#18-settings--accessibility)
19. [Show, Don't Tell](#19-show-dont-tell)
20. [Audio / VFX / Camera / Environment](#20-audio--vfx--camera--environment)
21. [Save / Progression](#21-save--progression)
22. [Testing](#22-testing)
23. [Performance](#23-performance)
24. [Scope Management](#24-scope-management)
25. [Version Strategy](#25-version-strategy)
26. [Current Asset Philosophy](#26-current-asset-philosophy)
- [Appendix A — Standing project constraints](#appendix-a--standing-project-constraints)
- [Appendix B — Legal](#appendix-b--legal)
- [Appendix C — Status vocabulary](#appendix-c--status-vocabulary)

---

## 1. Project Vision

*Dragon Ball: Saiyan Legacy* is a **long-term project**: an extremely polished, ambitious, fully playable 3D Dragon Ball fan game that should feel like a professionally developed, high-budget Dragon Ball game — not a simple prototype, tech demo, unfinished fan project or collection of disconnected features.

It is an **interactive Dragon Ball adventure**. The player experiences famous battles and events from the Dragon Ball universe and also has freedom to fight, explore, customize characters, unlock content, collect Dragon Balls and replay encounters. The game must be genuinely enjoyable to **play**, not merely impressive in screenshots.

The finished game is meant to contain:

- **Cinematic combat** — fast, responsive, powerful, skill-based; built around Dragon Ball speed, scale, flight, ki, beam clashes and destruction. Not a generic fighting game with Dragon Ball characters placed on top.
- **Detailed character identities** — a huge, expandable roster in which every major fighter plays, moves, sounds and behaves like themselves.
- **A chronological story** — one continuous campaign beginning with Bardock and the Saiyan history, following Goku from childhood through Dragon Ball, Dragon Ball Z and the major later events, and ultimately reaching the **Tournament of Power** and the major Dragon Ball Super material in §3.
- **Transformations** that are events, **fusions** that are new fighters.
- **Exploration**, **collectible Dragon Balls**, the Dragon Radar and **Shenron wishes**.
- **What-If content** — alternate timelines kept separate from canon.
- **Customization** — costumes, accessories, auras, loadouts and a custom character.
- **Tournaments**, **bosses** with phases and unique mechanics, **destructible environments**.
- **Progression**, **secrets** (an evolving main menu, hidden fights, gallery, 100% completion) and **replayability**.
- **Polished presentation** — excellent animation, VFX, audio, music, camera, menus and settings.

The owner's target experience, in their words: *"Starting with Bardock, I experienced the history of the Saiyans, followed Goku from childhood through his greatest battles, watched the characters grow, fought the major villains myself, unlocked transformations, collected Dragon Balls, explored the world, and eventually participated in the biggest battles in Dragon Ball."*

The campaign is the backbone of the whole game and every other system supports it: combat supports the battles, exploration supports the Dragon Balls, customization supports progression, the roster supports replayability, the gallery preserves the journey, What-If provides alternate possibilities, Free Battle allows experimentation, and Training teaches mastery.

**Ultimate goal:** not "a Dragon Ball prototype", not "a game with many Dragon Ball characters", not "a collection of features", but **a complete, polished, cohesive, playable Dragon Ball experience**. The player should be able to start the game, see a polished main menu, begin the story, follow the chronological timeline, explore, fight iconic battles, control iconic characters, transform, fuse, fly, destroy environments, collect Dragon Balls, unlock secrets, customize characters, master the combat system, replay battles, explore What-If scenarios, discover hidden content, adjust detailed settings, and return to the main menu to see their progress reflected there. And most importantly: **THE GAME SHOULD BE FUN.**

**Final success condition:** it must not feel like an AI-generated collection of systems. It should feel like a deliberately designed game where every button has a purpose, every mechanic has a reason, every character has an identity, every transformation feels special, every fusion feels spectacular, every major battle is memorable, every environment has atmosphere, every menu feels intentional, every reward is worthwhile, every sound reinforces the action, every animation communicates weight and personality, every effect supports readability and spectacle, every setting works, every save is reliable, every secret is rewarding and every story moment matters — *make the player feel like they are actually living through an epic Dragon Ball adventure.*

**This entire game does not exist yet.** It is built incrementally (§2, §24, §25).

---

## 2. Core Development Philosophy

### Principles

- **Quality > quantity.** Ten excellent characters beat fifty broken ones; five (or ten) excellent environments beat thirty (or fifty) empty ones; twenty polished missions beat a hundred repetitive ones; twenty deeply polished systems beat a hundred unfinished ones. A great combat system matters more than a huge character select screen. If forced to choose between 100 mediocre characters and 30 exceptionally polished ones, choose the 30.
- **Gameplay > menus.** Do not polish menus for ten hours while combat is still unpleasant. Do not build lore, menus or placeholder systems before the player can actually fight.
- **Combat feel > visual flash.** Spectacle must enhance gameplay, never destroy readability.
- **Build incrementally.** Never try to generate the whole game in one pass. Every stage must produce something playable and tested.
- **Vertical slice first.** Build a small, complete, fun game first (§24).
- **Do not overbuild.** Do not build systems before they are needed (100 character menus before the character architecture works, inventory before items exist, multiplayer before single-player combat is excellent, open world before basic exploration works, advanced destruction before basic physics is stable, hundreds of cinematics before the first mission works).
- **Do not fake features.** No buttons that do nothing, no placeholder systems that look finished. "I would rather have a smaller genuinely functional game than a massive fake implementation where buttons do nothing."
- **Do not claim unfinished systems are complete.** If a feature is incomplete, say so explicitly ("THIS FEATURE IS CURRENTLY A PLACEHOLDER") and explain what remains. Never hide limitations.
- **Preserve working systems.** Do not restart the project, do not throw away working systems to rewrite them, do not replace functional systems with fake placeholders, do not introduce one feature while silently breaking another.
- **Test everything** — automated tests for regressions, and actual play.
- **Human playtesting matters.** "Automated tests pass" does not mean "the game feels good" (§22).
- **Automated testing matters.** Tests must verify behavior, not merely assert that functions exist.
- **Performance matters** (§23).
- **Build chronologically.** Expand the campaign one saga at a time; do not jump randomly between sagas.
- **Show, don't tell** (§19).
- **Dragon Ball authenticity matters.** Combat, flight, transformations, personalities, humor, rivalries and major battles must feel unmistakably like Dragon Ball. The game must understand the difference between Goku fighting seriously, Vegeta fighting with pride, Frieza mocking an opponent, Piccolo analyzing a situation, Gohan becoming desperate, Gotenks being ridiculous, Jiren remaining composed and Broly losing control.
- **Character personality must appear through gameplay** — through how a fighter moves, attacks, defends and makes decisions, not only through dialogue.
- **Consistency of framework, uniqueness of expression.** UI, combat rules, audio, effects, menus and controls follow consistent design rules; consistency must NOT mean every character feels identical.
- **Always improve the highest-impact problem first.**

### The development ladder

```
ONE GREAT FIGHT
→ ONE GREAT CHARACTER
→ ONE GREAT BOSS
→ ONE GREAT CHAPTER
→ ONE GREAT SAGA
→ ONE GREAT CAMPAIGN
→ ONE GREAT DRAGON BALL GAME
```

(The original prompt phrased the middle step as "ONE GREAT BATTLE"; the Version 0.3 brief phrased it as "ONE GREAT BOSS". Both mean the same ladder.) Every expansion must build on a stable foundation. The objective is not the largest possible feature list but the best possible game within the resources available.

### Order of importance (final development philosophy)

1. Fun 2. Responsive controls 3. Combat feel 4. Character quality 5. AI 6. Camera 7. Animation 8. VFX 9. Audio 10. Environments 11. Story 12. Progression 13. UI/UX 14. Customization 15. Secrets 16. Performance 17. Accessibility 18. Final polish.

These systems interact. Do not create 50 characters while the first character still feels bad. Do not create hundreds of collectibles while core gameplay is unfinished.

### Development loop

```
BUILD → PLAY → OBSERVE → IDENTIFY PROBLEMS → FIX → TEST → POLISH → PLAY AGAIN
```

Do not stop improving a system merely because it technically functions. Leave the architecture clean enough to improve later.

**At every stage** (the "one final rule" of the original prompt): 1) inspect the current project, 2) understand what already exists, 3) do not unnecessarily rewrite working systems, 4) implement the highest-priority missing feature, 5) test it, 6) fix obvious problems, 7) integrate it cleanly, 8) verify existing features still work, 9) improve the presentation, 10) only then move to the next major system. If something is too ambitious for the current stage, implement the best functional version that can reasonably exist now and create a clean architecture for expanding it later. Never sacrifice the whole project's stability for one flashy feature.

Build the foundation first, then the combat, then the characters, then the world, then the campaign, then the progression, then the secrets — then polish everything.

### Polish over checklists

Every feature passes through stages: concept → prototype → functional → playable → tuned → polished → tested → final. A Kamehameha that technically fires is NOT finished; the finished version considers startup, charging animation, hand positioning, facial expression, voice line, aura, camera movement, lighting, particles, beam appearance, sound, impact, screen shake, hit reaction, environment interaction, destruction, recovery, cooldown and balance. Apply this to everything.

Questions to ask of every system: Does it feel good? Responsive? Look good? Sound good? Transition smoothly? Communicate clearly? Feel like Dragon Ball? Would a player notice it as unfinished? Is there unnecessary friction? Anything visually distracting? Does the animation sell the impact? Does the camera make the action more exciting? Does the UI communicate instantly? Does the AI behave intelligently? Does it remain fun after dozens of hours? If not, improve it.

**Fun test:** "Would I voluntarily use this system again?" If not, investigate why. Do not keep a mechanic merely because it technically works.
**"One more fight" test:** combat should make players want to try another character, transformation, fusion, a harder difficulty, another costume, another Dragon Ball, another secret, replay a boss, improve mastery.
**"Feels good" rule:** moving, flying, punching, dodging, blocking, vanishing, charging ki, transforming, fusing, winning, unlocking, exploring, customizing, completing missions and returning to the main menu must all feel good. No major part should feel like an afterthought.
**The final standard:** not "Did we implement everything?" but "Does it feel finished, professional, responsive, exciting, cinematic, authentic, replayable, coherent? Would a player want to keep playing? Would they notice obvious unfinished work?"

### Technical debt and architecture

Prefer modular systems, reusable components, data-driven characters, attacks, transformations, missions and unlocks, centralized settings, reusable VFX, audio and AI systems. Do not duplicate entire systems per character when a shared framework can safely support them — but do not over-engineer tiny features. It must be possible to add a new character, transformation, attack, costume, arena, mission, boss, fusion, secret or What-If scenario without rewriting the game.

Think like a full professional team: game designer, combat designer, gameplay programmer, AI programmer, 3D artist, character artist, animator, VFX artist, UI/UX designer, level designer, audio designer, technical artist, QA tester and producer — coordinated into one coherent project.

---

## 3. Chronological Campaign

The campaign is one **continuous adventure**, not a collection of unrelated missions. The player progresses through the timeline, unlocking characters, transformations, techniques, locations, collectibles, costumes, music and optional content. Important battles must not become fully automatic cutscenes: whenever possible the player **plays** the iconic moments.

Content types across the campaign: cinematic story scenes, fully playable battles, exploration, boss battles, survival, escort, chase and training missions, Dragon Ball collection, character-specific missions, optional side missions, What-If missions, tournament battles, large-scale army battles, major transformation sequences and cinematic finishing sequences.

> **Numbering note.** The chapter numbers below are the original specification's. The current build numbers its chapters differently (its "Chapter 1" is the Raditz battle, which the specification places inside Chapter 5 — Saiyan Saga). See `HANDOFF.md` for what is built and how it maps to this plan. Do not invent a new chronology.

### Campaign structure

Each chapter should have: opening cinematic, story setup, exploration or preparation, main missions, optional missions, boss battles, character unlocks, new abilities, new locations, collectibles, a chapter finale and a closing cinematic. The player should always understand where they are, when events take place, why and whom they are fighting, what the objective is, and what happens afterward.

### Story accuracy and canon

- Do not randomly change major events to create gameplay. Preserve major characters, events, locations, transformations, signature attacks, important dialogue concepts, battle progression and major outcomes.
- The player must still participate meaningfully. If canon has a character lose, the mission can still give a difficult playable battle and then transition to the intended story event; the player must not accidentally break the narrative by winning unless the mode is explicitly an alternate scenario (§16).
- **Canon Story** (intended chronological events) / **Free Battle** (anything goes) / **What-If** (alternate outcomes) are kept distinct.
- **Chronological integrity:** characters do not appear before their introduction except in Free Battle, Training, What-If and Replay. When a character is unlocked, the game makes clear why.
- **Campaign quality rule:** never sacrifice important story moments because implementation is difficult; build a simplified but polished version with an expansion point. Every mission is either fully playable, clearly marked as a prototype, or intentionally cinematic. Never replace a major playable battle with an empty placeholder and claim the campaign is complete.
- **Campaign length:** substantial, but never stretched with repetitive enemy waves. Variety comes from new locations, characters, mechanics, bosses, transformations, objectives, environments and story events.

### Prologue — Before Dragon Ball (Bardock / Saiyan history)

Cinematic introduction of the wider universe without exposition dumps: Saiyan civilization, Planet Vegeta, Saiyan warriors, Frieza's empire, Bardock, young Vegeta, Frieza's growing fear of the Saiyans. Use environmental storytelling, dialogue, cinematics and playable sections.

- **Mission 1 — Bardock.** Bardock is playable on a Saiyan mission: fight enemy soldiers, defeat hostile forces, explore a battlefield, protect Bardock's squad, return to the Saiyan forces. Teaches movement, combat, ki, flight, blocking, dodging.
- **Mission 2 — Bardock's Vision.** Short cinematic visions of Goku, Earth, Frieza and Planet Vegeta's destruction. Not overly long.
- **Mission 3 — Frieza's Army.** Bardock learns Frieza intends to destroy Planet Vegeta. A large-scale playable battle against Frieza soldiers, elite soldiers and multiple waves; Bardock flies through the battlefield and destroys enemy ships, structures and battlefield objects.
- **Mission 4 — Bardock's Last Stand.** Increasingly powerful enemies; his allies fall one by one; the Battle-Hardened/Rage mechanic is introduced; the player feels increasingly overwhelmed.
- **Mission 5 — Bardock vs Frieza.** The major confrontation — not simply a cutscene. The player fights Frieza's forces and participates in the confrontation; the battle ends according to established story with a huge cinematic ending (Planet Vegeta's destruction).

The original prompt also asks that Bardock's sequence "feel like a proper battle rather than a short cutscene": fight soldiers, fly through battlefields, fight multiple enemies, destroy ships, perform combos, use signature attacks, become increasingly overwhelmed, and reach a cinematic final confrontation. A **full Bardock mini-campaign** (the five missions above, with several enemy types, Planet Vegeta, a large battlefield, flight, destruction, Bardock's mechanics, cinematics and a boss encounter) is the intended proving ground before the larger story (Phase 7, §24).

*Added by the first human playtest:* the opening encounter of an introductory mission must be **dangerous and cinematic but readable and learnable** — no endless dogpiling, no volleys of off-screen attacks before the player has learned the controls; the player must have room to identify threats, counter, dodge, vanish, attack, reposition, destroy pods and control the battlefield. This is solved by encounter design, not by making all enemies weak or inflating player health.

### Chapter 1 — Kid Goku (original Dragon Ball)

Transition to Earth. Introduce Goku, Bulma, the Dragon Balls, Shenron, Master Roshi, Yamcha, Oolong, Puar and Krillin.

- **Mission 6 — Goku Meets Bulma.** Playable exploration; teaches walking, jumping, vehicle interaction, basic combat, Dragon Ball discovery.
- **Mission 7 — First Dragon Ball Hunt.** Introduces the Dragon Radar; locate a Dragon Ball; introduces exploration mechanics.
- **Mission 8 — Oolong.** Fight enemies, confront Oolong; humorous dialogue and interactions.
- **Mission 9 — Yamcha.** An actual playable boss fight.
- **Mission 10 — Master Roshi.** Training; unlocks the Kamehameha and ki charging.
- **Mission 11 — Krillin.** Training battle; switch between Goku and Krillin if appropriate.

### Chapter 2 — World Tournament

The World Martial Arts Tournament: registration, training, qualifying matches, bracket, final battles, tournament-specific rules. The player actually fights tournament matches. Major opponents: Krillin, Yamcha, Jackie Chun / Master Roshi, Tien, Chiaotzu.

### Chapter 3 — King Piccolo

Darker tone. Introduce Piccolo Daimao (King Piccolo), Tambourine and demon forces.
- **Tambourine Attack** — fight Tambourine; major characters react to the threat.
- **King Piccolo** — the major confrontation with destruction, cinematic attacks, giant energy attacks and environmental damage; ends with the appropriate story resolution.

### Chapter 4 — Piccolo Jr.

Time skip; Goku is older. The next World Tournament: preparation, new fighters, Piccolo Jr., final battle. **Goku vs Piccolo is playable.**

### Chapter 5 — Saiyan Saga

Begins the Z-era campaign. Introduce Raditz, Piccolo, Gohan, Vegeta, Nappa, Saibamen.
- **Raditz Arrives** — cinematic introduction of Raditz landing on Earth.
- **Goku and Piccolo vs Raditz** — a cooperative-feeling boss encounter: the player controls Goku, Piccolo is AI-controlled; team attacks, character switching where appropriate, enemy targeting.
- **Gohan's Training** — play as Gohan; teaches survival, ki, dodging, exploration. (Version 0.3 brief: aftermath of Raditz, Piccolo taking Gohan, harsh wilderness, survival/exploration, training, combat encounters, learning mechanics organically, Gohan becoming more capable, Piccolo relationship, preparation for the Saiyans — not a giant tutorial full of text boxes.)
- *(Version 0.3 brief)* Goku's King Kai training and **Kaioken acquisition** decided by the story; higher Kaioken levels learned progressively ("do not make x20 available just because the character exists").
- **Saiyan Arrival** — Vegeta and Nappa arrive; large-scale battle.
- **Saibamen** — fight multiple Saibamen; switch between available heroes.
- **Nappa** — major boss; his destruction must be powerful and terrifying.
- **Vegeta** — major multi-phase boss: 1) Base Vegeta 2) Galick Gun sequence 3) Great Ape 4) final desperate battle. **Create a playable Great Ape sequence.**

### Chapter 6 — Namek

Planet Namek. Introduce Namek, Frieza's forces, Vegeta as a temporary antihero, Zarbon, Dodoria, the Ginyu Force and Frieza. Add exploration: Dragon Balls, villages, hidden areas, optional battles, capsules, collectibles.
- **Dodoria** — boss battle.
- **Zarbon** — multi-phase: normal Zarbon, then transformed Zarbon.
- **Vegeta's Namek Campaign** — Vegeta becomes playable with separate missions, so the player understands he is not simply an enemy.

### Ginyu Force

Individual encounters with Guldo, Recoome, Burter, Jeice and Captain Ginyu, using team combat.
**Ginyu Body Change** — a playable sequence: if Ginyu succeeds, change the player's current character, available abilities, animations and health/ki behavior. A memorable gameplay mechanic.

### Frieza

A massive multi-stage confrontation through First, Second, Third, Final and Full Power forms; each phase changes gameplay (§11). Destructible terrain, flight, beam attacks, teleportation, cinematic transitions.
- **Goku Arrives** — a dramatic playable entrance; Goku becomes available; Super Saiyan transformation, Frieza confrontation, major beam/energy attacks.
- **Super Saiyan Goku vs Frieza** — one of the largest battles in the game: multiple phases, environmental destruction, Planet Namek destruction sequence, timed survival, cinematic attacks, final confrontation.

### Android Saga

Return to Earth. Introduce Future Trunks, Android 19, Android 20 (Dr. Gero), Android 17, Android 18, Android 16 and Cell.
- **Future Trunks Arrives** — control Future Trunks; cinematic introduction.
- **Mecha Frieza** — playable Future Trunks battle; his sword combat is unique.
- **Androids** — multiple missions: searching, fighting, protecting civilians, pursuing Androids.

### Cell

Imperfect Cell with a **horror-like atmosphere**: Cell stalks and ambushes characters; city exploration, missing civilians, investigation, Cell encounters.
- **Cell transformations** — playable battles with Imperfect, Semi-Perfect, Perfect and Super Perfect Cell.
- **Hyperbolic Time Chamber** — a playable training section for Goku, Gohan, Vegeta, Trunks and Piccolo, with optional training challenges.
- **Cell Games** — a complete tournament-like sequence: entrance, announcer, arena, Cell Juniors, individual battles, Gohan vs Cell.
- **Gohan vs Cell** — an emotional centerpiece: Super Saiyan, Super Saiyan 2, Cell's transformations, Cell Juniors, Android 16's influence, Father-Son Kamehameha, and a playable beam struggle whose outcome the player controls while the intended story progression is maintained.

### Majin Buu

Time skip. Introduce Adult Gohan, Goten, Trunks, Videl, Supreme Kai, Babidi, Dabura, Majin Buu. A lighter beginning before the threat gradually increases. The player should finish the saga feeling they *experienced* it — fought, flew, transformed, fused, explored, trained, rescued, survived, competed and gathered energy — not that they watched a sequence of cutscenes about it.

- **Seven years later** — the time skip is played, not announced: a new city, a school, a flight across it, and the decision that turns Gohan into the Great Saiyaman. Begin light.
- **Great Saiyaman** — a gameplay identity, not Gohan in a green costume: his own stance, poses, rhythm, attacks, CPU personality, intro and victory; crime-fighting missions where restraint and civilians are the objective; Videl's suspicion shown through gameplay.
- **Goten and Kid Trunks** — children with absurd potential, not small copies of their fathers: different proportions, playful animation, different mechanics, Super Saiyan earned on screen, building toward fusion.
- **World Tournament** — a real tournament system, not a stage: bracket, entrance, announcer, audience, real ring-outs (normal combat must not bypass tournament rules), fighter introductions, results, replay; playable matches introduce Goten, Trunks and Videl. The system is reusable (`SL.Tournament`: bracket, match, announcer; ring-out is an engine rule, `rules.ringOut`), so the endgame tournament and Free Battle use the same rules; a ring-out never counts while a scene holds the game.
- **Videl learns to fly** — flight is a learned skill with stages (a wobbling hover, then control, then sustained flight), failure (stalling when spent, recovering on the ground) and a lasting result (she flies afterwards everywhere), built on the normal flight system rather than beside it.
- **Supreme Kai, Babidi, Dabura** — investigation and encounters rather than exposition; Babidi fights through magic, control and minions; Dabura has his own identity (sword, ki, petrification where appropriate), not a generic melee boss.
  - **Babidi is never a fighter.** He is present as a system: each floor of his ship is a world he conjured, he watches every floor fight in person (adaptation: from a rock above the floor rather than through a crystal ball) and answers what the player does, and he ends fights on his own terms (he recalls Dabura when Dabura starts losing, because he has found Vegeta). Missions where the player must not win (Videl vs Spopovich, the drain on Gohan) say so in their objectives rather than pretending.
  - **Petrification is a state, not a cutscene trick:** a stone hit holds the target, mashing breaks it sooner, and the body becomes stone until it breaks. Characters petrified by the story stay stone until the story frees them.
- **Majin Vegeta** — a dedicated chapter: a data-driven, reversible state connected to Vegeta — the mark, unique aura, new dialogue, enhanced abilities, new attacks, new AI, intro, victory and defeat. Base Vegeta is never permanently changed.
- **Goku vs Majin Vegeta** — a major playable cinematic fight (ground and air, signature attacks, counters, teleportation, beams, escalating damage); both sides playable in replay mode.
- **Majin Buu** — Fat Buu: a strange, elastic, regenerating fighter (regeneration as a visible mechanic, not a timer), destruction missions shown rather than told, civilian rescue, Buu encounters, Babidi missions.
- **Evil Buu → Super Buu** — distinct transformations with their own silhouettes, AI and kits; absorption as a data-driven system (Buutenks, Buuhan) that composes the absorbed fighters' techniques, visuals and behaviour instead of piling up one-off conditionals.
- **Gotenks** — the fusion training sequence is interactive (timing, mirrored input, comic failures): learn the Fusion Dance, then Super Saiyan and Super Saiyan 3. Gotenks is his own fighter, ridiculous but responsive.
- **Ultimate Gohan** — the Old Kai's ritual unlocks a state with no timer, no golden aura spam and no Super Saiyan lightning: power shown through speed, impact, precision and counters. A major boss encounter with Super Buu that respects the player's success.
- **Vegito** — the Potara as a real fusion sequence; Vegito plays like neither Goku nor Vegeta, with his own combos, counters and taunts; Super Vegito is in control until the story moves on through an authored event.
- **Inside Buu** — one of the strangest playable environments in the game: organic, alive, explorable; the rescue is played.
- **Kid Buu** — the final Buu arc: unpredictable but readable AI, Earth destroyed as a stage *state* (the reusable Earth stage is never destroyed), the Sacred World of the Kai, Super Saiyan 3 as a high-output, high-drain resource state, **Vegeta's one-minute survival as a real playable countdown**, Good Buu as a playable interruption, Mr. Satan rallying humanity as a real mechanic, and the Spirit Bomb as the largest interactive struggle in the game.
- The ending is quiet and not rushed. After Buu, unlock endgame systems only as real features; anything not yet built is marked PLANNED with a real expansion point, never a dead button.

### Movies and specials are separate

Dragon Ball movies (Fusion Reborn and Gogeta, Broly, Cooler, Bojack, …) are **never** inserted into the chronological campaign. They live in their own **Movies / Specials** content category, which shares characters, combat, stages, VFX, cinematics, dialogue, saves, unlocks and Free Battle with the rest of the game but has its own list on the story screen and its own progress. Nothing in the canon story order may belong to a movie, and a movie must not appear on the timeline as if it were canon chronology. The same separation already holds for What-If branches, Free Battle, Training and Boss Rush.

### Battle of Gods

Introduce Beerus, Whis and Super Saiyan God: Capsule Corporation events, Beerus exploration, training, the God ritual, Goku vs Beerus. The battle emphasizes enormous power.

### Resurrection of F

Frieza returns. Introduce Golden Frieza, Super Saiyan Blue and Vegeta's major role. A large-scale invasion mission.

### Universe 6

Introduce Champa, Hit, Cabba, Caulifla, Kale and Frost. The Universe 6 tournament with actual tournament progression.

### Future Trunks (Goku Black / Zamasu)

Return to Future Trunks with a darker atmosphere. Introduce Goku Black, Zamasu, Future Mai and Future Earth.
- **Goku Black** — unique encounters using the energy blade, scythe, rifts and teleportation.
- **Fused Zamasu** — a huge multi-phase boss: regeneration, immortality, massive energy attacks, environmental destruction.

### Tournament of Power

A massive tournament campaign with fighters from multiple universes. Major playable fighters: Goku, Vegeta, Gohan, Piccolo, Android 17, Android 18, Frieza, Krillin, Tien, Master Roshi, Hit, Jiren, Toppo, Dyspo, Cabba, Caulifla, Kale, Kefla. Multiple tournament missions.
- **Team battle system** — assemble teams; members assist, switch, rescue, perform team attacks, revive where appropriate and protect one another. Not every mission is a team battle.
- **Goku vs Jiren** — several encounters rather than one giant fight, progressing through Base, Super Saiyan, Super Saiyan God, Super Saiyan Blue, Kaioken, Ultra Instinct Sign and Mastered Ultra Instinct. Ultra Instinct is introduced as a major gameplay event.
- **Frieza and Goku team-up** — a special final sequence of temporary cooperation with team attacks.
- **Finale** — collapsing arena, massive explosions, flying combat, Jiren's final phase, Goku's Ultra Instinct, Frieza, Android 17, final team sequence.

### Post-campaign

Free exploration, Dragon Ball hunting, Boss Rush, Survival, Tournament mode, character challenges, What-If scenarios, special battles, Training, collectibles, Gallery, character mastery.

### Optional side campaigns

Stories that would otherwise be skipped, without confusing the main chronology: **Bardock** (full mini-campaign), **Vegeta** (Saiyan Prince side missions), **Future Trunks** (future timeline), **Piccolo** (Demon King history), **Frieza** (rise through the empire), **Android 17** (ranger-style missions), **Broly** (survival and battles).

### Story presentation rules

- **Mission structure variety.** Defeat the enemy, survive for a time, protect an ally, defeat waves, escape a collapsing area, chase, reach a destination, destroy enemy ships, collect Dragon Balls, rescue a character, win a tournament match, defend a location, interrupt an attack, complete a cinematic sequence. Not every mission is "reduce enemy HP to zero".
- **Mission flow** has rhythm (introduction → exploration → combat → escalation → major encounter → climax → resolution → reward), but not every mission follows the same structure.
- **Pacing** across the game: calm → exploration → training → conflict → escalation → climax → resolution → calm. Not maximum intensity everywhere.
- **"Wow" moments** in every major saga (planet destruction, giant beam clashes, major transformations, fusion, giant bosses, extreme speed combat, environmental destruction, massive ultimates, cinematic team attacks) — saved for moments that deserve them, not every five seconds.
- **Emotional peaks with breathing room**, e.g. Bardock realizing the fate of Planet Vegeta, Goku arriving on Namek, Future Trunks seeing Goku again, Gohan watching Android 16 die, Vegeta sacrificing himself, Goku becoming Super Saiyan God, Future Trunks fighting for his ruined world, Goku reaching Ultra Instinct, Frieza and Goku temporarily cooperating. The player should understand why they matter.
- **Cutscene quality** for key moments: Planet Vegeta's destruction, Goku's first transformation, Future Trunks arriving, Gohan becoming Super Saiyan 2, Majin Vegeta, Buu's transformation, Goku becoming Super Saiyan God, Goku vs Hit, Goku Black's appearance, Ultra Instinct, the Tournament of Power finale. Cutscenes transition smoothly into gameplay.
- **Player control during cinematics:** cinematic (character begins charging a Kamehameha) → gameplay (player aims it) → cinematic (it connects) → gameplay (fight continues).
- **Climax rhythm.** The climax of a saga is *played*, not watched: cutscene → play → cutscene → play → escalation → play → cutscene → play → final event. The famous moments are inserted at the dramatic turning points of a fight the player is already in the middle of, and the fight continues afterwards. A final form, a rage state or a power-up that the story treats as a threat must be a real gameplay state the player fights through, never only a cinematic visual.
- **Cinematics are entered by events, never by a clock.** A scene fires because the fight reached a state — a health threshold, a story flag, a boss phase — so the player feels that what they did caused it. Every scene declares the state it guarantees on exit, so skipping it leaves exactly what watching it leaves, and control returns to the right character in the right form.
- **Checkpoints respect the player's time.** Dying after a major transformation resumes at the fight, not at the cinematics before it, and a checkpoint stages the story state it belongs to (form, damage, who is alive, who is on the field).
- **Opponents are rules, not health bars.** A major enemy should change how the fight is played, and the change should be legible in one exchange: ki that feeds the Androids instead of hurting them, a bio-android who grows back anything you do not follow up, a pair who never tire so outlasting them is not a plan, a boss whose forms are four different fighters. The mission teaches the rule where it happens (a prompt, an optional goal) rather than in a briefing screen.
- **Iconic moments are played, not told.** Major iconic Dragon Ball moments must be represented as playable cinematic sequences rather than being reduced to text or isolated non-interactive cutscenes. The test for any famous beat is: *would this feel wrong as a text box?* If yes, build a cinematic. If it is a combat beat, build a playable sequence. If it is both, build cinematic → gameplay → cinematic. The target is interactive anime: not 90% cutscenes, and not 90% generic combat either.
- **Set-piece arenas are built for their fight.** A location the story remembers — the Cell Games ring, a tournament stage, a room — is modelled as itself rather than as a renamed open battlefield: the right size, readable boundaries, its own surface and silhouette, background presence where practical, and damage that accumulates while the fight goes on. Camera language follows the space (establishing wide, close-ups on dialogue, wide on major attacks, aerial when the fight leaves the ground).
- **Story damage states.** A character can carry a story-specific damaged look — a torn gi, dirt, wear, the red rage line and tears of a character who has just snapped — as a *state* rather than a form or a permanent model change, so it combines with transformations, survives them, and is cleared when the story moves on. A rage or grief look is temporary and removable by design, so a production model can replace it without the story code changing.
- **Realistic story production:** prioritize major battles, major transformations, major character introductions, major emotional scenes and important transitions; use shorter transitions for less important scenes.
- **Story transitions** avoid excessive loading: cinematic and environmental transitions, dialogue, flying sequences, character movement. The world should feel connected.
- **Story map / timeline** shows current saga, completed and locked missions, character unlocks, collectibles, Dragon Balls, optional and What-If missions; any completed mission can be replayed.
- **Story replay** lets completed missions be replayed with customized character, difficulty, costume, team, music and optional modifiers, while canon missions keep their story context.
- **Story collectibles** hidden in missions unlock artwork, music, historical information, concept art, bios, voice clips, costumes and special battles. Dragon Balls stay a separate major system.
- **Story difficulty** (Easy / Normal / Hard / Very Hard / Custom) improves AI reactions, dodging, countering, attack selection, boss behavior, aggression and team coordination — never simply multiplies enemy health.
- **Opening experience:** launching the game should immediately make sense; an exciting opening (potentially a Dragon Ball-style cinematic) before playable gameplay; teach movement, attacks, ki, dodging, blocking, flying, specials and transformations without twenty menus at once.

---

## 4. Character System

### Every fighter is a gameplay identity

Every playable character is a **unique fighter**, not a skin, recolor, or one generic combat controller with a different model, voice and specials. Characters share a common underlying framework where appropriate, but each fighter must be capable of unique combos, attack timing, movement, ki management, specials, ultimates, defensive mechanics, transformation mechanics, counters, vanishes, throws, air and ground attacks, AI behavior, animation sets, intro/victory/defeat animations, dialogue, battle reactions, character-specific interactions, cinematic attacks and passive abilities.

When the player switches from Goku to Vegeta, Piccolo, Frieza, Bardock, Broly, Hit, Jiren or another fighter they must immediately feel *"I am playing a different character"*, not *"the same character with a different model"*. **Shared technology is acceptable; shared identity is not.** The character system is one of the highest-priority parts of the game.

Every meaningful character should eventually have, as appropriate: model, textures, rig (with facial setup), animations, movement identity, combat animations, combo tree, aerial attacks, grabs, defensive mechanics, ki mechanics, stamina mechanics, specials, ultimate, transformations (with conditions and transformation animations), AI profile, personality, dialogue, VFX, audio, intro, victory, defeat, portrait/UI representation, and **story restrictions** (techniques and forms locked until the story has taught them).

### Roster (from the original specification; expandable)

Goku (Kid, Teen, Adult versions), Vegeta, Kid / Teen / Adult / Future Gohan, Piccolo, Krillin, Yamcha, Tien, Chiaotzu, Master Roshi, Yajirobe, Trunks (Kid) and Future Trunks, Goten, Gotenks, Videl, Android 18, 17, 16, 19, Dr. Gero, Cell, Cell Juniors, Frieza, Captain Ginyu, Recoome, Burter, Jeice, Guldo, Zarbon, Dodoria, Raditz, Nappa, Saibaman, Bardock, King Vegeta, Broly, Cooler, Beerus, Whis, Hit, Jiren, Cabba, Caulifla, Kale, Kefla, Zamasu, Goku Black, Majin Buu (forms), Kid Buu, Dabura, Babidi, Supreme Kai, plus other important characters where appropriate (campaign additions include Bulma, Oolong, Puar, Tambourine, King Piccolo, Piccolo Jr., Android 20, Future Mai, Champa, Frost, Toppo, Dyspo, Great Apes). Multiple versions of a character must be meaningfully different (moveset, transformations, techniques, animations, costumes, dialogue, progression). Do not add characters merely to inflate the roster count.

### Character-specific identities and mechanics (minimum direction)

| Character | Identity | Signature kit (from the specification) | Unique mechanic | AI direction |
|---|---|---|---|---|
| **Goku** | Versatile: balanced melee, high mobility, excellent aerial combat, strong ki, teleportation, adaptability, transformation-based power | Fluid martial arts (alternating punches, elbows, knees, sweeps, spinning kicks, heavy downward strikes, launching uppercut, air combos); Kamehameha, Instant Transmission, Kaioken, Spirit Bomb, Meteor Combination, Dragon Fist; forms SSJ, SSJ2, SSJ3, SSG, SSB, Ultra Instinct (each changes stats, aura, animation intensity, ki regen, effects, movement, specials) | **Instant Transmission** is a real mechanic: behind, above, away from attacks, toward projectiles, during combos and cinematics, with readable counterplay (not an infinite escape). **Ultra Instinct**: automatic evasion of certain attacks with sufficient stamina/ki and proper timing. Ultimates: Spirit Bomb, Dragon Fist, UI finisher | Adaptive: experiments, dodges often, transforms intelligently, uses IT defensively, charges when safe, more aggressive when losing, recognizes counter opportunities |
| **Vegeta** | Aggressive, powerful, high-pressure, strong counters, excellent ki, relentless | Rapid punch combos, knees, heavy kicks; Galick Gun, Final Flash, Big Bang Attack, Final Explosion, Dirty Fireworks; forms SSJ, SSJ2, SSG, SSB, SSB Evolution, Ultra Ego | **Vegeta's Pride**: the longer he stays in close combat without retreating, the more his pressure increases; temporary bonuses for countering, perfect dodges, continuing combos and fighting at low health. **Ultra Ego** rewards aggression: damage taken can raise offense temporarily, but reckless damage stays dangerous | Close range, counters, finishers, punishes defensive players, charges when distance opens; rarely passive. Proud, precise, ruthless |
| **Gohan** | Kid: Masenko, headbutt, high-speed melee, rage. Teen: martial arts, SSJ, SSJ2, Father-Son Kamehameha. Adult: Potential Unleashed, Masenko, Kamehameha, high-power melee. Beast: extreme melee, special aura and movement, Beast sequence, special counter and finisher | | **Rage / Potential**: power rises temporarily when allies are defeated or he suffers major damage | Begins relatively defensive, increasingly aggressive when enraged |
| **Piccolo** | Tactical, long-range limbs, regeneration, counters, defensive | Special Beam Cannon (must feel different from Kamehameha: charge, power, readability, cinematic presentation), Demon Elbow, stretching arms, Hellzone Grenade, Light Grenade, Explosive Wave; Potential Unleashed, Orange Piccolo (drastically more size, strength, defense, impact) | **Regeneration**, **extended reach**, **tactical traps** | Analyzes: keeps distance, sets traps, punishes predictable attacks, protects allies, interrupts dangerous attacks |
| **Krillin** | Fast, technical, evasive, trick-based | Destructo Disc (dangerous, unique projectile behavior), Solar Flare, Kamehameha, Afterimage, Scatter Shot | **Solar Flare** temporarily blinds/disorients | Avoids strength contests: dodges, flares, creates distance, projectiles, attacks vulnerable enemies |
| **Yamcha** | Fast wolf-themed melee, mobility | Wolf Fang Fist, Spirit Ball, Sokidan, Afterimage | **Spirit Ball Control**: steer the Spirit Ball briefly after launch | Speed and unpredictable movement |
| **Tien** | Technical, defensive, high-risk energy | Tri-Beam, Dodon Ray, Solar Flare, Multi-Form | **Tri-Beam Overdrive**: dramatically stronger at the cost of stamina/health | Uses it as a high-risk finisher |
| **Chiaotzu** | Listed in the roster and as a World Tournament opponent | No kit specified in the original prompt | — | — |
| **Master Roshi** | Technique-focused, counter-heavy, deceptively powerful | Kamehameha, drunken-style movement, Afterimage, Max Power (visibly changes physique and power) | | Old and playful, extremely dangerous when pressured |
| **Trunks** | Kid Trunks and Future Trunks. Future: sword combat, ki, aggressive mobility | Sword slash combos, Burning Attack, Masenko, Heat Dome, Final Hope Slash; Super Saiyan | **Sword Combat**: a dedicated sword combo tree | Aggressively punishes ranged enemies |
| **Goten** | Fast, playful Saiyan | Kamehameha, Super Saiyan, flying attacks, high-speed combos | | Unpredictable and aggressive |
| **Gotenks** | Deliberately chaotic | Super Ghost Kamikaze Attack, Galactic Donut, charging attacks, Volleyball Fist; SSJ, SSJ3 | **Chaotic Techniques**: unusual trajectories and delayed effects | Unpredictable attacks |
| **Videl** | Human martial artist: fast, technical, limited ki | Martial arts, dodges, counters, aerial attacks | Must not feel like a weaker copy of Goku | |
| **Android 18** | Efficient, relentless, high stamina | Energy blasts, Barrier, powerful melee, team attacks with 17 | **Infinite Energy**: no normal Saiyan-style ki depletion | Constant pressure |
| **Android 17** | Defensive, tactical, barrier-focused | | **Energy Barrier**, barrier counter, defensive positioning | Creates defensive windows |
| **Android 16** | Slow, extremely powerful, heavy, grapple-focused | Rocket Punch, Hell's Flash, ground slam, powerful grabs | **Heavy Frame**: reduced mobility, enormous stagger resistance | |
| **Frieza** | Extremely distinct; elegant, cruel, efficient | Forms First, Second, Third, Final, 100% Full Power, Golden; Death Beam, Death Ball, Telekinesis, tail attacks, Psychokinesis, Supernova | **Cruelty**: bonuses when attacking weakened enemies | Intelligent and arrogant: taunts, keeps distance, ranged attacks, teleports/dashes away, punishes healing/charging, more aggressive when losing |
| **Bardock** | A brutal Saiyan soldier, not "Goku in different clothes": aggressive, military-style, heavy strikes, efficient ki | Riot Javelin, Full Force Energy Blast, brutal melee, shoulder charges, Saiyan assault techniques; a unique rage sequence | **Battle-Hardened**: more aggressive as the battle becomes desperate | Aggressive, prioritizes dangerous opponents |
| **Raditz** | Aggressive early-game Saiyan, grappling | Double Sunday, Saturday Crush, tail attacks, grabs, energy waves | **Tail Grapple**: grabs enemies with his tail | |
| **Nappa** | Heavy, destructive, area damage | Break Cannon, Explosive Wave, ground slam, ki blasts | Destroys terrain more dramatically than most | Heavy and destructive |
| **Saibaman** | Small but dangerous; aggressive and disposable | | **Self-destruct**, **burrowing**, **ambush**, **group attacks**; multiple Saibamen per mission | |
| **Zarbon** | Normal: elegant, technical, ranged. Transformed: heavy, powerful, aggressive | Transformation | | Switches style after transforming |
| **Dodoria** | Heavy bruiser | Charges, body slams, grapples, powerful punches | | Excellent group-battle enemy AI |
| **Captain Ginyu** | | | **Body Change** — a genuine mechanic: swaps bodies under specific conditions, temporarily transferring model, moveset access, health state where appropriate and combat properties. One of the most technically unique mechanics | |
| **Recoome** | Tank | Recoome Eraser Gun, body attacks, charges, high-damage grapples | Huge stagger resistance | |
| **Burter** | Extremely fast | | **Speed Mode**: among the fastest non-teleporting fighters | |
| **Jeice** | Ranged support | Crusher Ball, ki projectiles, team attacks with Burter | | |
| **Guldo** | | | **Time Control**: limited time stops with cooldown, energy cost, clear visual warning and counterplay | |
| **Cell** | Forms Imperfect, Semi-Perfect, Perfect, Super Perfect | Kamehameha, Special Beam Cannon, Solar Flare, Regeneration, Cell Juniors, energy attacks | **Regeneration** under conditions; **Absorption** temporarily or permanently alters capabilities | Highly adaptive; Perfect Cell toys with opponents at higher difficulties |
| **Cell Juniors** | Fast swarm fighters, several at once | Team attacks, ambushes, high mobility | | |
| **Majin Buu** | Forms Fat, Evil, Super, Kid; unpredictable | Candy Beam, Regeneration, elastic attacks, Absorption, chocolate transformation, Planet Burst | **Regeneration**, **Absorption**, **Elastic Body** — survives attacks that incapacitate normal characters | Unpredictable |
| **Dabura** | | Stone spit, sword attacks, dark magic, ki blasts | **Stone Curse**: hit enemies are temporarily immobilized | |
| **Broly** | Enormous and terrifying: massive power, increasing rage, heavy attacks, high durability | Wrathful, Super Saiyan, Legendary-style forms | **Rage**: power increases with damage taken and battle length; at high rage faster and stronger attacks, larger aura, more destruction, reduced stagger | Increasingly aggressive |
| **Cooler** | Final Form, Meta-Cooler | Death Beam, Supernova, energy attacks, heavy melee; Meta-Cooler swarm mechanics possible | | |
| **Beerus** | Extremely powerful, effortless, destructive | Hakai, energy attacks, godly melee, Sphere of Destruction | **Destruction**: certain attacks temporarily erase projectiles or environmental objects; Hakai extremely powerful but carefully balanced | |
| **Whis** | Evasion, time manipulation, effortless counters | | **Autonomous Evasion**: automatically avoids some attacks under conditions | Almost never panics |
| **Hit** | Assassination-style precision; one of the most mechanically unique | | **Time-Skip**: briefly disappear, reposition, counter, freeze an opponent's movement for a very short time, time-skip attacks — with cooldowns and counterplay | Precise |
| **Jiren** | Extremely powerful, minimalistic, defensive, overwhelming; strength from raw power, precision, defense, counters, shockwaves — not hundreds of flashy techniques | | **Overwhelming Power**: resists stagger that interrupts most characters | Calm and extremely difficult |
| **Cabba** | Fast Saiyan | SSJ, SSJ2; rapid combos, energy blasts, defensive movement | | |
| **Caulifla** | Aggressive Saiyan | Fast combos, high mobility, Super Saiyan forms | | |
| **Kale** | | | **Berserk Rage**: size changes, aura grows, attacks stronger, defense up, AI more aggressive as rage rises | |
| **Kefla** | Fusion: Caulifla's speed + Kale's strength | Gigantic Burst, Gigantic Breaker, high-speed combos, massive energy attacks | | |
| **Goku Black** | Elegant, dark, sword-based, energy blades | Energy Blade, Black Kamehameha, Divine Lasso, scythe techniques | **Rift Attacks**: certain attacks create temporary energy rifts | |
| **Zamasu** | Normal and Fused | Fused Zamasu has dramatically different attacks and animations | **Immortality**: regenerates and survives otherwise fatal damage under story/game rules | |
| **Future Gohan** | Experienced, defensive, desperate, high-risk; substantially different from normal Gohan | | **Last Stand**: temporary bonuses when critically injured | |
| **King Vegeta** | Royal Saiyan combat, heavy strikes, traditional Saiyan techniques | Unique armor animations, royal-themed dialogue | | |
| **Yajirobe** | Optional comedic fighter with a legitimate moveset | Sword attacks, sneak attacks, evasive movement | **Senzu Bean**: limited-use healing | |
| **Supreme Kai** | Magical, defensive, telekinetic | Telekinesis, energy attacks, magical barriers, stun abilities | | |
| **Custom Character** | Must not copy Goku; modular (§15) | Species, fighting style, limited starting techniques that expand with progression | | |

### Presentation per character

- **Animation profile per character** — unique idle, walk, run, flight pose, charge pose, light and heavy attacks, dodges, block, hit reactions, knockdown, recovery, transformation, ultimate, victory and defeat. Do not reuse Goku's animation set for every Saiyan. Animation reflects personality: Goku loose, fluid, adaptable; Vegeta compact, aggressive, precise; Piccolo controlled, deliberate, powerful; Frieza elegant, cruel, efficient; Broly heavy, explosive, overwhelming; Hit minimal, precise, economical; Jiren extremely controlled and powerful; Gotenks exaggerated and unpredictable.
- **Introductions** before major fights, skippable and opponent-aware: Goku enters casually with friendly confidence, Vegeta stands proudly with a prideful challenge, Frieza mocks, Broly roars with growing rage, Jiren approaches in silent intimidation, Hit calmly observes and silently prepares, Bardock enters battle-ready.
- **Victories** — multiple, character-specific (Goku smiles and raises his fist, Vegeta crosses his arms, Frieza laughs, Piccolo meditates, Broly roars, Bardock looks toward the battlefield); characters speak, pose, transform back, react to the opponent and story context.
- **Defeats** — character-specific, reflecting personality; no abrupt black screens (reaction, camera framing, dialogue, music, retry prompt).
- **Visible damage** where appropriate (torn clothing, dirt, scratches, bruising, smoke, stylistically suitable blood) without permanently breaking models.
- **Character-specific music** and boss themes; transformations can change music.
- **Personality and dialogue** — rival, villain, transformation, pre- and post-battle, special matchup dialogue. Characters react to opponent, saga, story state, transformation, health and previous events, never contradicting the timeline.
- **Matchup interaction system** (data-driven) — unique intro, mid-battle, transformation, ultimate-reaction, victory and defeat dialogue for pairs such as Goku vs Vegeta, Goku vs Frieza, Goku vs Broly, Gohan vs Cell, Future Trunks vs Frieza, Bardock vs Frieza, Vegeta vs Frieza, Goku vs Jiren; can include unique camera work, animations or attacks.
- **Character select** feels premium: model, name, form, level/mastery, transformations, costume, combat style, specials, ultimate, voice preview, unique selection animations. Character information is short by default (name, style icon, power/speed/defense indicators, transformations, techniques) with an optional Details view.

### Character data architecture

No enormous hard-coded script. Each character is a data definition configuring stats, movement, moves, combos, aerial attacks, grabs, counters, defensive/ki/stamina mechanics, specials, ultimate, transformations and their conditions, AI and personality, animations, audio, effects, dialogue, intro, victory, defeat, special mechanics and story restrictions. Adding a character should mean creating a definition, not rewriting the combat system. Do not over-engineer abstractions that are not needed yet.

**A form is allowed to be a different fighter.** A transformation that the story treats as a turning point — Super Saiyan 2, a final form, a Majin state — may carry its own idle and stance, its own moves and strings, its own Perfect-Guard counters, its own specials, its own AI personality, its own intro and victory, on top of its multipliers and its look. The character definition holds these on the form itself, the animator takes the form's poses when the form is applied, and the AI re-reads the profile when the form changes, so a CPU in that form fights like it. Multipliers and a recolour are the floor, not the target: if the story says *this is not the same fighter any more*, the controls must say it too.

**A costume is either a form or a fighter — never a paint job.** A form can change hair, eyes, horns, size and bulk but not clothing yet, so a costume identity that changes the clothes (the Great Saiyaman) is its own fighter definition that the story swaps in with a cinematic, carrying its own kit, stance, AI, intro and victory. When per-form outfits exist (planned: Buu's absorbed forms, fusion vests), such identities can move back to forms without changing how they play. The four kinds, in order of preference: a **form** (same person and clothes, new power, its own look/kit/AI — Super Saiyan 2, Majin Vegeta), a **separate character** (a different fighting identity *and* body — the Great Saiyaman), a **story-only character** (in scenes and missions, never picked — the Supreme Kai, Kibito, Babidi), and never a costume that is only a colour change.

### Balancing

Characters are not all equally powerful; the game acknowledges power differences. Free Battle offers optional balance modes: **Canon Power** (relative canon strength), **Balanced** (competitive-style), **Custom** (player-defined stats). Do not balance purely around win percentages; combat feel comes first; no fighter should be accidentally overpowered or unusable.

### Final character quality standard

MODEL clean and recognizable · ANIMATION character-specific · COMBAT distinct · SPECIAL MOVES distinct · ULTIMATE spectacular · AI character-specific · TRANSFORMATIONS meaningful · SOUND character-specific · DIALOGUE personality-appropriate · EFFECTS visually impressive · GAMEPLAY actually fun. A character counts as **complete** only when it meets this standard — not when it has only a model, a recolor, a placeholder moveset or generic animations. (A character that plays well on a prototype body is a complete *gameplay* implementation on a prototype *asset*; see §5.)

**Realistic character production.** A complete character may require model, textures, rig, facial setup, animation set, combat animations, specials, effects, audio, dialogue, AI, transformations and their animations, UI portrait, intro, victory, defeat and testing — so prioritize characters by importance. Add large roster groups only after the core works: A core heroes and villains, B supporting characters, C tournament characters, D movie characters, E alternate forms and versions, F special/experimental characters.

**Character models (production target).** Accurate proportions, hairstyles, clothing, facial features and colors; clean topology, high-quality materials, detailed textures, proper rigging, smooth deformation, good hands and faces, correct footwear and accessories, appropriate muscle definition, hair and cloth movement where useful, damage effects where appropriate. Special attention to hair silhouettes, eyes, expressions, gi folds, armor, belts, boots, gloves, scouters, capes, tails and transformation changes. A transformation must visibly alter the character, not only the hair color.

---

## 5. Prototype vs Production Assets

**This section is very important.** It records the corrected asset strategy (owner's correction, 2026-09-14), which supersedes an earlier, too-strict reading of "do not keep making code-made characters".

The strategy has **two stages**:

```
PROTOTYPE ASSETS NOW
→ PRODUCTION ASSETS LATER
```

### Three asset quality levels

| Level | Name | What it is | Status |
|---|---|---|---|
| **1** | **Functional Prototype** | Simple procedural / code-generated model. Enough to develop and test gameplay, rigging, animation, hitboxes, camera, VFX and story. | Not final art |
| **2** | **Polished Prototype** | Improved geometry, proportions, silhouette, clothing, materials, animation and presentation. | Still not final production art |
| **3** | **Production Asset** | A real professionally created 3D model with proper textures, proper rig, facial setup and animation assets as appropriate, imported through the `.glb` pipeline (§6). | Final art |

**Never claim Level 1 or Level 2 is Level 3.** Never describe a procedural body as a finished production model.

### Why prototypes

Prototype characters exist so development can build and test: proportions, silhouettes, clothing, hair, faces, rigs, skeletons, poses, animations, hitboxes, attacks, grabs, movement, flight, transformations, VFX attachment points, cinematics, camera behavior, AI, character-specific mechanics, story and boss battles, character selection, portraits, intros, victories and defeats. They do NOT need to be AAA quality and must not be treated as final. Do not spend huge amounts of time trying to make procedural geometry equivalent to professionally sculpted Dragon Ball models — make them good enough to clearly communicate the character and support gameplay development.

The quality rule is **not** "make every procedural model beautiful" but **"make every character playable, recognizable, mechanically distinct and replaceable."** Example: a prototype Frieza should allow testing Frieza's combat, Death Beam, Death Ball, transformation, telekinesis, AI personality, dialogue, cinematic attacks, hit reactions, flight and story battles — even while visibly a prototype. The same applies to Cell, Majin Buu, Gotenks, Vegito, Beerus, Hit, Goku Black, Zamasu, Jiren, Kefla and every later character.

### Production pipeline per character

```
PROTOTYPE CHARACTER
→ GAMEPLAY IMPLEMENTATION
→ TESTING
→ POLISH
→ REAL PRODUCTION-QUALITY MODEL
→ GLB IMPORT
→ RIG / POSE MAPPING
→ REPLACE PROTOTYPE
```

### Rules

- **The game MUST NOT stop development because production-quality character models are unavailable.** Otherwise development would stop at the Saiyan Saga.
- **Build the entire game with prototype assets** while making the architecture ready for production assets. Reach the full chronological campaign, test all systems, balance characters, build missions, bosses, transformations, fusions, Dragon Ball systems and What-If content; production models progressively replace prototypes later.
- Continue creating prototype characters **chronologically, as the campaign reaches them, and by gameplay importance** — e.g. Saiyan Saga: Gohan, Piccolo, Saibamen, Nappa, Vegeta, Krillin, Tien, Yamcha, Chiaotzu, Yajirobe, Great Ape Vegeta; then Namek/Frieza, Android/Cell, Majin Buu, Battle of Gods, Resurrection of F, Universe 6, Future Trunks, Tournament of Power.
- **Do not make 100 characters simultaneously.** Each new character: functional prototype representation first → gameplay identity → tests → presentation improvements where worthwhile → move forward.
- The `.glb` pipeline and the prototype character system **coexist**. The pipeline is not a reason to stop making prototypes; it is the way to replace them cleanly later.
- Do not build final-quality assets before the production asset pipeline and resources actually exist.
- The general asset rule from the original prompt still holds: be realistic about assets; if an asset cannot legally or technically be generated automatically, explain what is required; never quietly substitute ugly placeholders for supposedly finished assets; clearly separate PROTOTYPE ASSETS from FINAL ASSETS; the final game has a coherent visual style.

Workflow for this stage: `BUILD → PLAY → TEST → FIX → POLISH → NEXT CHARACTER → NEXT BATTLE → NEXT CHAPTER → NEXT SAGA`.

---

## 6. GLB / Real Model Pipeline

Purpose: let a real production model (Level 3) replace a prototype body without rewriting gameplay. The Version 0.3 brief required a technical proof — load a `.glb`, detect meshes and the skeleton, identify joints, map them to the game rig, play an animation, attach VFX, move the character through the combat system, use it in a battle, maintain performance — **using a legally usable test model, never downloaded Dragon Ball models**, and documenting exactly what a production model must match.

This section records the pipeline as designed and built at the time of writing; `STATUS.md` and `assets/models/README.md` hold the detailed, current record.

### How it works

- **Model loading** — `src/render/glb.js` is an in-house glTF 2.0 binary reader (three.js r149 ships no local loader and none was downloaded). It reads the node hierarchy, skinned triangle meshes, materials (base color), skins and TRS animation clips, and rejects bad files, truncated files and required extensions with clear messages. Each `.glb` also gets a base64 `.glb.js` twin so double-clicking `index.html` (file://) still works without a web server.
- **Skeleton detection and joint mapping** — `src/game/model_glb.js` maps the file's bones to the game's **17-joint rig** (hips, spine, chest, neck, head, shoulders, elbows, hands, thighs, knees, feet) by name (conventional, Mixamo- and Blender-style names are recognized) or through an explicit `jointMap`.
- **Pose copying / animation compatibility** — the game keeps animating its own rig; every pose is **retargeted** onto the imported bones with per-segment bind-pose alignment. Existing moves, poses, sequences and cinematics therefore work without new animation data. Embedded clips can also be played (`playClip`).
- **VFX attachment** — sockets on the real bones give hand, head and other positions for beams, props and hit sparks; ink outlines, rim light, hit flash, afterimages (pose baked on the CPU) and the HUD portrait work on imported bodies.
- **Textures** — embedded base color textures (PNG/JPEG) decode in the background onto materials using the file's sampler settings. Normal, emissive, occlusion and metal/roughness maps are ignored and reported (the game uses cel shading).
- **Validation** — `node tools/glb_check.js model.glb [--write-js]` parses a model with the game's own reader, prints a ready-to-paste joint map, checks hierarchy order, left/right sides, limb proportions, scale, feet on the ground, facing, skin weights and budgets, poses the model through every shared pose, and with `--write-js` packages it into `assets/models/`.
- **Character data** — a character uses an imported body with `model: { type: 'glb', asset, height, jointMap }`. Asset Level 3 additionally requires `model.production: true` and is refused for the test mannequin.
- **Model requirements** — documented in `assets/models/README.md`: glTF 2.0 binary with embedded buffers and images, no required extensions, triangles only, Y up / faces +Z, T- or A-pose bind, one skin with bones for the 17 game joints (extra bones allowed), child bones on hands/feet/head, ≤ 4 influences per vertex, suggested budget ≤ 20,000 triangles, ≤ 60 joints, ≤ 4 materials per fighter.
- **Test asset** — `tools/make_test_glb.js` generates an original grey mannequin from code (no download, no likeness of any character), deliberately unlike the game rig to prove the mapping.

### Not supported yet (needed before real characters can fully replace prototypes)

Morph targets (facial expressions, blinking), hair swaps per form (e.g. Super Saiyan), hand shapes (fist / open), stretching limbs (Piccolo), cape and belt cloth springs on imported bodies, and normal / emissive / metal-roughness maps. Each needs a model-side convention (mesh variants, morph targets or extra bones) first.

### Sources

Only models the owner made, commissioned, or that have a licence allowing this use — and only with the owner's explicit approval. Never ripped models from official games or the anime. Every asset used must be listed with its source and licence.

---

## 7. Combat System

Combat is one of the highest priorities of the project: fast, responsive, cinematic, powerful, skill-based, deep, and unmistakably Dragon Ball.

**Ultimates are a commitment, not a wish** (added by the second and third human playtests, where every Ultimate was interrupted). A major technique has a startup you can be punished in — that is the risk, and an enemy who is already on you should win that exchange. Past its commitment point the technique goes off: ordinary strikes and ki blasts land and hurt (more than they otherwise would), and only a beam, a throw, an ultimate-class blow or a broken guard-state stops it. Bosses may carry a specific, readable counter. The answer is never permanent invulnerability, and never AI that cannot see what you are doing.

### Systems

- **Melee** — light attacks, heavy attacks, **combos** that chain naturally, **launchers**, **knockbacks**, **dash attacks**, **rush attacks**, ground combat and **aerial combat**.
- **Launch / chase** — launching an opponent and vanishing after them to continue the combo.
- **Grapples and throws** — throws beat guarding; character-specific grabs (Tail Grapple, Body Change, Android 16's grabs…).
- **Guard**, **Perfect Guard** (precise timing, rewards with an opening), **guard break**.
- **Dodge**, **vanish** (teleport-dodge behind an attacker), **teleportation** (e.g. Instant Transmission), **counters**.
- **Escape** — ways to break out of long combos and group pressure.
- **Ki** — a meter that is charged, spent, recovered and increased through progression where appropriate. Charging has a recognizable Dragon Ball feel and can be interrupted by enemies; different attacks cost different amounts; the player manages ki strategically.
- **Stamina** — governs defensive movement (dodges, vanishes) and exhaustion, communicated visually (§19).
- **Ki blasts** and **charged ki blasts**, **beam attacks**, **ultimate attacks**, **cinematic attacks**.
- **Beam clashes** — a major spectacle: cinematic camera, visible energy collision, environment distortion, screen shake, intense lighting, player interaction with a rapid-input/mashing mechanic where appropriate, skill influencing the result, losing beam pushed back, winning beam overpowering the opponent, a massive explosion at the end.
- **A story beam struggle is shaped by the struggle, not by a script.** The beats a famous clash is remembered for (a voice, an ally's blast, a second wind) fire from how the push is going, so the player causes them; the answer cannot be fired before the opponent's beam is actually out, so the struggle cannot be skipped; winning it is what defeats the opponent, with the damage really dealt; and losing it is survivable and leads back into the same fight. The camera must keep both fighters and the collision point in frame — two full-width beams at close range wash the screen out, so a story clash may narrow its beams and pull the camera back.
- **Quick-time events** used sparingly and intelligently, never replacing gameplay: beam clashes, countering a giant attack, escaping an explosion, catching an enemy, breaking through a wall, winning a struggle, dodging a finishing attack, deflecting an energy blast, surviving an environmental attack, a cinematic reversal.
- **Transformations** during combat when the character and story allow (§12).
- **Team attacks**, assists, switching and rescues in team battles.
- **Environmental attacks and interaction**, **destruction** that influences combat where possible (§20).
- **Character-specific techniques and mechanics** (§4).

### Feel

- **Responsiveness** — inputs register immediately; avoid input delay and sluggish controls.
- Attacks have clear **startup, active frames, impact and recovery**.
- Every hit communicates **"I HIT SOMETHING"** through hit-stop, impact effects, sound, camera movement, character reactions, particles, knockback and animation.
- **Impact hierarchy** — a light punch must not feel like a planet exploding:
  - **Level 1** normal punch/kick: minimal camera effect, small particles, short hit-stop.
  - **Level 2** heavy attack: larger reaction, stronger sound, moderate camera response.
  - **Level 3** special attack: strong VFX, larger reaction, more dramatic sound.
  - **Level 4** ultimate: cinematic camera, major VFX, environmental interaction, large sound design.
  - **Level 5** major story attack: full cinematic treatment, environmental destruction, music transition, dialogue, massive visual impact.
- Readable hit reactions (directional, aerial), crater/dust/debris/shake when slammed into the ground, terrain damage from powerful beams. **The environment tells the story of the fight.**
- **Group encounters** (from the first human playtest) must stay readable: limit simultaneous melee attackers and volleys, telegraph ranged attacks, avoid unseen attacks from outside the camera view for new players, keep stun chains escapable, and give the player escape options against being surrounded — while enemies remain dangerous.

**Special interactions** between certain characters (unique dialogue, camera work, animations or attacks).

---

## 8. Flight and Movement

Flight is a major part of the game and must feel like actual Dragon Ball movement — not like moving a floating capsule through the map.

### Movement (ground and air)

Walking, running, jumping, falling, flying, turning, stopping, accelerating, strafing, dodging, guarding, landing and recovering all feel excellent even when the player is doing nothing complicated. Characters do not snap between movement states unless the ability is intentionally teleportation; use acceleration and deceleration. Different characters can have different movement identities (e.g. Burter's speed, Android 16's heavy frame).

### Flight

Characters capable of flight can:

- fly **vertically** and **horizontally**, **fast** and **slow**;
- **accelerate**, **decelerate / brake**, **dash**, **boost**, change direction and **turn quickly**, **air-strafe**;
- **dodge** and fight in the air (**aerial combat**), fire ki blasts and beams while flying;
- **pursue** and chase enemies through environments (lock-on pursuit);
- crash into terrain and recover from impacts.

**Reliable ASCEND and DESCEND controls are mandatory** (added by the first human playtest, where descending could not be done reliably): ascend, descend, forward, back, strafe, turn, boost, brake and dodge must work consistently on keyboard/mouse and controller, including during and right after combat (recovering from knockback, dashing), and must be covered by regression tests.

Speed feedback: camera behavior, motion and wind effects, camera shake, trails, ki effects, environment movement and reactions, audio. Allow spectacular aerial battles.

### Interaction with lock-on and camera

Movement follows the camera when free and orbits/pursues the target when locked (§9). The camera keeps player and opponent readable during aerial combat and has distinct behaviors for exploration, ground combat and aerial combat (§20).

---

## 9. Targeting / Lock-On

A **reliable** lock-on system. The player should always understand **who** they are targeting, **where** the target is, whether it is **above or below** them, whether it is **behind** them, and whether it is **temporarily unavailable**.

### Target states (required architecture)

```
LOCKED      target selected — attacks, camera and pursuit track it; switch between valid targets
   ↓ unlock
UNLOCKED    free camera and free aiming — shots go where the player looks
   ↓ lock on again
LOCKED      acquire an appropriate target (what the player is looking at)
```

- **Do not remove lock-on.** The player has both precise locked combat and free targeting.
- Works reliably **on the ground and in flight**.
- **Target categories:** enemy fighters, flying enemies, bosses, pods, destructible objects, mission/objective targets.
- Required scenario (first human playtest): **lock onto a Frieza soldier → unlock → freely aim at a pod → destroy the pod → lock onto a soldier again.**
- **Target switching is predictable.** Prioritize by distance, camera direction, threat and current combat context. Allow manual override.
- The lock/unlock state is **visually obvious but unobtrusive** — no tutorial popup. Built as a small chip under the crosshair (**TARGET LOCKED · Tab Free Camera** / **FREE CAMERA · Tab Lock Target**, with the player's real binding) that fades once the toggle has been used a few times; the control is labelled **Lock-On / Free Camera**.
- **Far environmental targets** (the moon, anything beyond the arena): a prop marked `far` is lockable by lock-on, Next Target and free aim, and shots aimed at it travel all the way to it. One reusable path, never a per-mission shortcut; the moon is only destroyed by a shot that reaches it.
- **The skill wheel says what each technique is aimed at**: the locked target, where you aim, all around, or yourself.
- Handle edge cases: target dies while locked (auto-switch or release per setting), target hides or becomes untargetable, target behind the player.
- Settings (see §18): target lock behavior, auto-targeting, manual targeting, lock-on distance, lock-on indicator.

---

## 10. AI

AI must be intelligent, believable and personality-driven — never "run toward the player and repeatedly attack". Different enemy types behave differently.

**Rhythm** (added by the third human playtest: a boss that attacked without pause read as input denial). A fight is a conversation: approach, watch, taunt, attack, reposition, react, punish, escalate. Enemies attack in bursts and then leave readable openings in which the player can attack, dodge, counter, charge, use a technique, transform, recover or reposition. Difficulty comes from what the enemy does, not from never letting the player act; an opening is announced by behaviour (a taunt, circling, a stance) rather than by UI. Nobody reacts to a technique before they could have seen it.

### What AI considers

Distance, health, ki, stamina, transformation state, opponent health and transformation, opponent state (charging, healing, guarding, reeling), available cooldowns, current combo, environmental position, nearby allies, mission and story state, and (for fusions) fusion duration.

### What AI does

Dodge, block, counter, attack strategically, retreat when appropriate, coordinate, use ranged and melee attacks, transform where appropriate, react to player transformations, low health and allies being defeated, pursue flying players, use environmental advantages.

### Personality archetypes

- **Aggressive** — constant pressure.
- **Defensive** — blocks, dodges, counters.
- **Tactical** — creates distance, sets traps.
- **Berserker** — stronger and more aggressive after taking damage.
- **Ranged** — prefers projectiles.
- **Adaptive** — changes strategy based on player behavior.
- **Boss** — phases and special scripted mechanics.
- **Comedic** — unusual attacks, unpredictable behavior.

Every character has a unique AI profile plus **character-specific AI hooks** (e.g. Goku's intentional Instant Transmission, Piccolo's traps, Krillin's Solar Flare, Frieza punishing charging). Enemy personality examples: Saibaman aggressive and disposable, Nappa heavy and destructive, Frieza ranged and calculating, Cell adaptive, Buu unpredictable, Hit precise, Jiren extremely controlled.

### AI polish

No standing motionless, repeating one move, attacking walls, ignoring nearby players, getting stuck indefinitely, spamming one attack, transforming at nonsensical times or ignoring hazards. AI makes occasional mistakes — perfect AI is not fun.

### Difficulty

Difficulty improves decision-making, not statistics: **Easy** slower reactions, more mistakes, less aggression; **Normal** standard; **Hard** better reactions, combos and defensive decisions; **Very Hard** advanced decisions, better punish windows, improved team coordination; **Custom** player-controlled modifiers.

### Group behavior

Groups of enemies coordinate without dogpiling unfairly: attack tokens / turn-taking, telegraphed ranged volleys, respect for what the player can see, flanking and "one latch at a time" style rules for swarm enemies.

### Balance testing

**CPU-vs-CPU testing is useful for detecting broken behavior, but it is not the same as human balance.** Do not blindly tune until a character wins; investigate why (is the AI misbehaving, is the matchup intentionally hard?), add telemetry where useful, and perform human-playable balance testing.

---

## 11. Bosses

Bosses must feel fundamentally different from normal enemies. **Bosses do not simply have huge HP ("10x health").** They use:

- **phases** and **phase transitions** that change gameplay (the player must immediately feel the battle has changed);
- distinct **attack patterns**, **counters** and defensive behavior;
- **transformations** and transformation events;
- unique attacks, animations and **distinct AI**;
- character-specific **dialogue**;
- **environmental interaction** and environmental attacks;
- **cinematic moments** and unique finishing sequences;
- **readable mechanics** and **counterplay opportunities** (telegraphs, punish windows).

Examples: Frieza progresses through forms (Phase 1 ranged pressure → Phase 2 more aggressive movement → Phase 3 faster attacks → Final Form extreme mobility → Full Power high-damage pressure); Cell transforms during battle; Majin Buu alters the battlefield; Broly becomes increasingly aggressive; Jiren grows stronger in later phases. Nappa's strength comes from moveset, pressure, damage, reach, AI and boss mechanics — not enormous HP.

### Giant bosses — Great Ape as reusable architecture

The Great Ape must **not** be a character scaled up 10x. It needs its own scale, camera behavior, movement, huge attacks (stomps, grabs, roar, projectiles), environmental destruction, boss health and phases, appropriate **hit zones** (e.g. a tail weak point), cinematic moments, readable attacks and different AI. The system must be **reusable for other giant enemies and bosses** (Great Ape variants, Orange Piccolo, giant forms, secret giant battles). The Saiyan Saga also calls for a **playable Great Ape sequence**.

### Secret and optional boss content

Hidden battles with unique rewards: giant Great Ape battle, secret Broly encounter, Golden Frieza challenge, Ultra Instinct challenge, Beerus challenge, Whis challenge, legendary fusion challenge, multiple-boss battle, extremely difficult survival battle. Post-game Boss Rush.

---

## 12. Transformations

**Chronology is a rule, not a per-mission promise** (added by the third human playtest, where the HUD offered Super Saiyan three missions before Goku first transformed). Every transformation belongs to the story moment that hands it over; every mission before that moment must not offer it, on the HUD, on the skill wheel or through an input. This is enforced from the story timeline rather than written out mission by mission, so a new mission cannot silently hand a form over early.

**A transformation is an EVENT, not a model swap.** It must never feel like "press button → model changes" or "change hair color + increase stats".

### Transformations named in the specification

Great Ape, Super Saiyan, Super Saiyan 2, Super Saiyan 3, Super Saiyan God, Super Saiyan Blue, Super Saiyan Blue Kaioken, Super Saiyan Blue Evolution, Ultra Instinct (Sign and Mastered), Ultra Ego, Potential Unleashed, Beast, Orange Piccolo, Golden Frieza, Final Form and 100% Full Power Frieza, Full Power forms, Majin forms (Majin Vegeta), Cell's and Buu's forms, Wrathful / Legendary-style Broly, Zarbon's transformation, Max Power Roshi, Kale's Berserk, and fusion forms. **Kaioken** is a real system (see below).

### Event structure

1. Character reaction 2. Energy buildup 3. Environmental response 4. Camera transition 5. Aura 6. Sound escalation 7. Transformation animation 8. Final reveal 9. Gameplay transition.

Include aura changes, hair changes, facial changes, lightning, ki explosions, screen effects, lighting, camera movement, sound design, character-specific animation and environmental reactions. Sequences can be shortened by a setting and when the cinematic camera is reduced.

### Gameplay changes

Transformations meaningfully and strategically change damage, speed, ki (generation and cost), stamina, defense, special attacks, attack effects, movement, animation intensity, AI behavior, aura, voice and UI (HUD state). The player can transform during combat **when the character and the story allow it**.

### Story restrictions

In chronological story missions a character cannot use techniques or forms before learning them; forms with levels are learned progressively (Kaioken x2 before x3, and so on — never x20 simply because it exists). Free Battle may configure access. The HUD and skill menu show locked forms honestly.

### Kaioken (Version 0.3 brief)

Not just a red aura and a multiplier: activation animation, aura/VFX, sound, increased speed, power and movement responsiveness, health/ki/stamina pressure, form-specific attacks, risk/reward, recovery/fatigue, AI understanding, UI feedback and state transitions.

### Presentation

No giant "SUPER SAIYAN UNLOCKED!" text: the story leads into the transformation, the character transforms, music changes, the aura appears, the HUD changes, the form becomes playable; a small unobtrusive notification may confirm it afterward. Different transformations have different aura behavior (§20).

---

## 13. Fusions

A deep, fully playable fusion system. **Fusion is not a cosmetic character swap** — fusions are entirely new fighters with unique models, rigs where necessary, animations, combos, movement, ki attacks, specials, ultimates, voice lines, intro/victory/defeat animations, auras, transformation behavior, AI, personality and combat properties.

### Canon fusions

- **Gotenks**, Super Saiyan Gotenks, Super Saiyan 3 Gotenks
- **Vegito**, Super Saiyan Vegito, Super Saiyan Blue Vegito
- **Gogeta**, Super Saiyan Gogeta, Super Saiyan Blue Gogeta
- **Kefla**, Super Saiyan Kefla, Super Saiyan 2 Kefla

Additional canonical fusions can use the same system. **No random non-canon fusions merely to inflate the roster.**

### Methods (mechanically distinct)

1. **Fusion Dance** — requires compatible characters (Goku + Vegeta, Goten + Trunks), appropriate battle conditions, the correct fusion animation and a timing/input sequence where appropriate. Cinematic but reasonably fast in normal gameplay: characters move together → short cinematic → fusion pose → energy explosion → fusion appears → camera returns → player immediately controls the fusion.
2. **Potara Fusion** — its own activation sequence.

### Conditions

Depending on mode: specific characters, minimum ki, full stamina, story progression, mission conditions, a fusion item, Potara earrings, the Fusion Dance technique, both characters alive. Story missions can force canon fusion moments; Free Battle allows more flexible rules.

### Duration and limits (configurable, not identical for every fusion)

Fusion timer, ki consumption, emergency de-fusion, failure conditions, transformation interaction. E.g. Gotenks is timed; Vegito can have different Potara behavior by story/mode; custom modes can allow unlimited fusion.

### Transformations

Fusions transform independently (Gotenks → SSJ → SSJ3; Vegito → SSJ → SSB; Gogeta → SSJ → SSB; Kefla → SSJ → SSJ2), changing stats, ki generation, damage, speed, aura, attacks, combos, voice, VFX and AI.

### Fusion-exclusive techniques

- **Gotenks:** Galactic Donuts, Super Ghost Kamikaze Attack, Die-Die Missile Barrage, Charging Ultra Volleyball, Super Ghost Kamikaze Army, SSJ3 transformation.
- **Vegito:** Spirit Sword, Final Kamehameha, Savage Strike combinations, Potara-specific techniques.
- **Gogeta:** Stardust Fall, Stardust Breaker, Big Bang Kamehameha, Soul Punisher, Meteor Explosion, unique teleportation chains.
- **Kefla:** Gigantic Burst, Gigantic Ray, Blaster Ball techniques, SSJ2 energy attacks.

Each with unique animations and effects.

### Combat identity (not summed stats)

- **Gogeta:** extremely aggressive, fast, high burst damage, long combo routes, powerful rush attacks, excellent aerial combat.
- **Vegito:** highly technical, counter-focused, balanced offense/defense, advanced sword/energy techniques, strong defense.
- **Gotenks:** unpredictable, trick-based, unusual projectiles, comedic but dangerous, mobility-focused.
- **Kefla:** extremely aggressive, high-pressure offense, fast ki regeneration, powerful close range.

### Fusion AI

Knows it controls a fusion (Gogeta pursues powerful opponents, Vegito counters and punishes, Gotenks uses unusual techniques and movement, Kefla pressures constantly) and understands the timer: when low, prioritize finishing, creating distance, high-damage attacks or defensive survival.

### Team battles, replay and cinematics

Fusions fight alongside other characters (Vegito + Future Trunks, Gogeta + Gohan, Gotenks + Piccolo, Kefla + Cabba) with team assists. Free Battle and Replay allow experimenting with officially supported combinations by default; an optional, clearly non-canon **"Custom Fusion Rules"** mode can allow experimental combinations if feasible. Every major fusion has a high-quality, non-reused sequence (positioning, expressions, dialogue, energy buildup, camera, lighting, aura, transformation effects, final reveal). Fusion availability is shown through icons, compatible portraits, subtle effects, ki requirements and a contextual prompt — not "FUSION AVAILABLE — PRESS BUTTON".

---

## 14. Dragon Balls

**Long-term system — does not exist in the game yet.** Do not claim it exists until it is built and tested.

- **Seven Dragon Balls** discoverable throughout the game.
- **Dragon Radar** — follow radar signals (beeping faster as a ball gets closer, radar display option in the HUD).
- **Exploration** of the world and **hidden locations**; Dragon Balls stay a separate major collectible from story collectibles.
- **Collect** individual balls, **complete the set**, **summon Shenron** in a spectacular sequence.
- **Wishes** that depend on progression: unlock characters, costumes, techniques, gain currency or upgrades, unlock special battles, concept art or alternate scenarios.
- **Rewards and progression** — Dragon Balls feed costumes, custom character abilities and secrets; finding all Dragon Balls can unlock menu content; Shenron can appear in the main menu background afterwards.
- **Presentation** (show, don't tell): the ball appears, a unique sound plays, the character reacts, the radar updates, the collection icon changes (`[Dragon Ball icon] 4 / 7`), a small notification appears — no giant "YOU FOUND A DRAGON BALL!".
- Planned as its own development phase (Phase 10, §24) that works as a complete gameplay loop: radar, seven balls, exploration, hidden locations, collectibles, Shenron, wish selection, unlock rewards. The first Dragon Ball hunt belongs to the original Dragon Ball chapter (§3, Mission 7), and a vertical slice should contain one Dragon Ball collectible.

---

## 15. Customization

Meaningful customization that **respects the source material** — not a generic modern RPG clothing system that destroys Dragon Ball visual identity. Customization must not destroy character identity unless an optional custom-character mode supports it.

- **Costumes** — alternate outfits (Goku outfits, Vegeta armor, Future Trunks outfits, tournament, training, casual, story-specific), unlocked through story, side missions, Dragon Balls, challenges, What-If missions and secret rewards.
- **Accessories** — scouters, swords, Potara earrings, capsule accessories, training gear — never visually breaking the model.
- **Auras** — alternate aura appearances only where appropriate per character (normal, Super Saiyan, God, Blue, Ultra Instinct, Destruction).
- **Ki effects** — alternate visuals for ki blasts, charging, transformation, aura and ultimates; the canon look stays the default.
- **Intentional color variants** — some costumes support alternate colors; random recolors of iconic characters are not complete costumes.
- **Victory poses, emotes, intro and outro animations, presets.**
- **Skill loadouts** — for characters that support them: Special Slot 1, Special Slot 2, Utility Slot, Ultimate Slot. Arbitrary combinations are not allowed in Canon Story mode if they contradict the character or story; Free Battle is more flexible.

### Custom Character

A Dragon Ball-inspired fighter in a separate story or side mode that never replaces the canon story, and must not simply copy Goku.

- **Race / type** — Saiyan, Earthling, Namekian, Majin, Frieza-race / Frost-like alien, other fictional species.
- **Body and face** — body type, height, face, hair and hair color, eyes, skin tone.
- **Outfit** — clothing, gloves, boots, accessories, colors.
- **Aura** and **ki color** where appropriate; **voice** and **personality**.
- **Fighting style** — martial arts, heavy, speed, ki specialist, sword, grappler; **combat archetype** — balanced, rushdown, heavy, technical, ki-focused, defensive, counter-focused.
- **Techniques** — a limited set of starting techniques; **technique slots**: rush attack, ki blast, defensive technique, utility technique, transformation, ultimate; **transformation progression**.
- **Progression / unlocks** — abilities unlocked through training, story, character mastery, Dragon Balls and challenges.
- Avoid using copyrighted character assets as editable templates when the system cannot legally or technically support them.
- A full creator is Tier 3 if too large initially (§24); build it as a later expansion.

### Character mastery

Every character tracks battles, damage dealt, techniques used, transformations, ultimates, wins, perfect wins and fusion usage, unlocking costumes, artwork, music, titles and special challenges — without absurd grinding.

---

## 16. What-If

A mode where the player **can** break canon, clearly separated from the canonical story.

- **Separation** in story data (What-If missions are flagged branches of a canon mission), progression (unlocked by clearing the relevant canon content), **saves** (a separate What-If track that never changes canon progress) and presentation (the player understands when they have left the canonical timeline).
- **Content:** alternate dialogue, different battles, alternate transformations, different character teams, alternate cutscenes, new endings, unique rewards.
- **Replayable and clearly labeled.** Branches are individual polished scenarios, not giant alternate campaigns, until the canon story is stable (Phase 12: data-driven framework for alternate battles, outcomes, teams, encounters, dialogue and rewards).
- **Example scenarios from the specification:** What if Goku defeated Raditz? / Raditz won? · Vegeta defeated Goku? · Gohan fought Cell earlier? / Gohan lost to Cell? · Bardock survived? · Frieza defeated the Saiyans? / Frieza won on Namek? · Future Trunks arrived earlier? · Vegeta became Super Saiyan first? · Goku never returned to Earth? · Piccolo defeated Goku? · Goku and Vegeta fused earlier? · different characters fought each other. The Version 0.3 brief added examples such as "What if Piccolo survived a critical event?" and "What if Gohan's hidden power awakened earlier?".

---

## 17. Main Menu, Modes and Secrets

### Modes (possible)

Story, Free Battle, Arcade, Tournament, What-If, Training, Character Customization, Dragon Ball Hunt, Boss Rush, Survival, Challenge Mode, Gallery, Settings — plus others that make sense (Records, Character Mastery, Music, Archives, Replay).

- **Free Battle** — choose character, transformation, stage, enemy, difficulty, health settings, ki settings, time limit, music and battle rules; fights between characters who never canonically fought.
- **Training** — infinite health, ki and stamina, combo and damage display, frame information where feasible, reset position, enemy behavior, guard, counter and recovery settings, transformation, fusion and beam clash testing; useful information without an ugly interface.
- **Tournament** — brackets: World Tournament, other tournament arenas, custom tournaments, randomized opponents, different rules; exciting presentation.
- **Replay / battle record** — record characters, actions, transformations, camera state and result for replay viewing; a simplified architecture with a clean expansion path if full recording is too expensive.

### Main menu

Polished: animated backgrounds, subtle character movement, music, transitions, polished navigation. It communicates progression visually (silhouettes, unlocked portraits, saga imagery, Dragon Ball count, completion indicators, icons, subtle environmental changes) instead of text.

### Evolving secret main menu

- **Initially limited:** New Game, Continue, Free Battle, Settings.
- **Progressive unlocks:** Characters, Customization, Training, Tournament, Gallery, Dragon Balls, What-If, Boss Rush, Character Mastery, Music, Archives, Secrets.
- **Hidden discovery conditions:** completing a saga, finding all Dragon Balls, defeating a hidden boss, completing a character challenge, discovering a secret location, completing a What-If, maximum mastery, performing a specific fusion, completing missions without losing, finding hidden collectibles. Do not tell the player every secret immediately.
- **Visual evolution:** early game Goku standing in a peaceful environment; later other characters appear; backgrounds change after sagas; boss elements appear after major bosses; a much larger animated menu after the campaign.
- **Secret character appearances:** Goku training, Vegeta meditating, Piccolo standing nearby, Gohan reading, Krillin training, Goten and Trunks playing, Frieza observing, Beerus sleeping, Whis walking around, Shenron after all Dragon Balls.
- **Secret interactions** (not overdone): a button makes Goku power up, repeated selection triggers a unique animation, idling triggers activities, unlocks change the background, selecting a character triggers a voice line, secret combinations trigger hidden interactions.
- **Hidden gallery:** character, story, concept and transformation artwork, music, voice clips, battle records, enemy information, timeline entries, development notes — not revealed all at once.
- **Secret fights** and **secret fusion unlocks** (fusion costumes, music, artwork, mastery challenges, fusion-only ultimate variants, secret fusion stages).
- **Progression secrets** use varied reward types: story → character, Dragon Balls → special reward, hidden collectible → artwork, mastery → costume, What-If ending → alternate music, secret boss → title, fusion challenge → fusion cosmetic, 100% → major secret reward.
- **100% completion** tracks story, side missions, characters, transformations, costumes, Dragon Balls, collectibles, What-If, secret fights, fusion unlocks, mastery, gallery, music and challenges, unlocking more secrets at high percentages; the final reward is genuinely worthwhile.
- **Secret reward philosophy:** never hide basic quality-of-life features behind ridiculous requirements; secrets reward exploration, mastery, replayability, curiosity, completion and skill — "I wonder what happens if I do this."
- **Final menu experience:** by the end the menu is a living archive of the journey (sagas, characters, transformations, Dragon Balls, fusions, secret battles, What-If timelines, mastery, completion).

### No fake buttons (important implementation rule)

A visible menu option must either **work**, **clearly say it is coming later**, or **remain locked until implemented**. Never create dozens of buttons that do nothing. Build incrementally and data-driven: menu architecture → core settings → customization → fusion → secret unlock tracking → advanced menu interactions.

---

## 18. Settings / Accessibility

A large, professional, categorized settings menu — not just volume and resolution. Descriptions stay concise ("Camera Shake [ON] — Controls combat camera shake."). **Only expose settings the engine/platform actually supports.** Every visible setting must be read by some system.

### Gameplay

Difficulty, combat difficulty, enemy AI aggression, enemy reaction level, boss difficulty, damage scaling, player damage, enemy damage, ki regeneration, stamina regeneration, transformation rules, fusion rules, fusion duration, assist frequency, camera shake, screen effects, motion blur, hit-stop intensity, combat speed, QTE difficulty, beam clash difficulty, beam clash button mode (mash / hold), auto-combo, manual combo mode, simplified controls, advanced controls, target lock behavior, auto-targeting, manual targeting, camera distance, camera sensitivity, vibration, combat assistance.

### Accessibility

Subtitle size, background and opacity, speaker names, dialogue text speed, skip cinematics, hold vs toggle controls, button remapping, controller vibration, screen shake intensity, flashing effect reduction, motion blur reduction, camera shake reduction, QTE assistance, beam clash assistance, colorblind-friendly UI options, high-contrast UI, HUD scaling, UI opacity, simplified HUD. Controls fully remappable where the platform allows.

**Player agency:** experienced players can disable tutorial prompts, beginner hints, combat hints, repeated notifications and optional explanations; these preferences are stored in Settings.

### Graphics

Resolution, display mode (windowed / borderless / fullscreen), VSync, frame-rate limit, dynamic resolution, texture, model, shadow, effects, lighting, vegetation, environment, particle and destruction quality, anti-aliasing, ambient occlusion, reflections, volumetric effects, draw distance, crowd density, post-processing, motion blur, depth of field, bloom, film grain, screen-space effects. Presets: Very Low, Low, Medium, High, Very High, Ultra, Custom. (Only those the browser/three.js build can genuinely support may appear.)

### Audio

Master, music, sound effects, dialogue, voice, cinematics, UI and environmental volumes; dynamic range, speaker/headphone mode, surround where supported, audio language, subtitle language.

### Language

If localization is supported: text, voice and subtitle language, independently configurable.

### HUD

HUD visibility, health, ki and stamina bars, transformation meter, fusion timer, lock-on indicator, combo counter, damage numbers, objective markers, minimap, Dragon Radar display, HUD scale and transparency.

### Camera

Camera sensitivity (horizontal / vertical), invert horizontal / vertical, distance, height, lock-on distance, camera shake, combat camera effects, cinematic camera intensity, automatic camera correction, **camera style**. The player can disable excessive cinematic effects.

**Camera modes (built 2026-09-18, one rig, not three cameras):** **Combat** while locked on (player and target framed); **Adventure** out of a fight and in traversal (a little further back; after a short pause in camera input it eases toward the direction of travel, never on a strafe or a small correction); **Free** (never turns on its own). *Camera Style* offers Auto (Combat locked, Adventure otherwise) / Adventure / Free; a mission may choose (*Snake Way* is Adventure). Moving the mouse or stick right always turns the view right unless *Invert Horizontal* is on.

### Controls

Complete controller customization: attack, ki attack, guard, dodge, transformation, fusion and lock-on remapping, character switching, camera controls, menu navigation; keyboard and mouse configurable where supported; key rebinding; sensitivity.

---

## 19. Show, Don't Tell

**An extremely important presentation rule.** The player came here to **PLAY DRAGON BALL**. Let them play.

The game must NOT become mostly text popups, tutorial windows, giant instructions, dialogue boxes, floating explanations, walls of dialogue or exposition boxes. Avoid the feeling of "Press X to do this.", "Now you can do this.", a large paragraph explaining a mechanic, "NEW FEATURE UNLOCKED: PRESS THIS BUTTON TO…", "OBJECTIVE UPDATED: GO TO…", "THIS CHARACTER HAS ARRIVED.", "YOU HAVE FOUND A DRAGON BALL.", "YOUR KI IS LOW." Each of those should be communicated visually or through gameplay whenever reasonably possible.

### Preference order

Gameplay → animation → icons → HUD indicators → world markers → character reactions → environmental storytelling → sound → music → visual effects → camera direction → small contextual prompts — **before** large text explanations.

### Tutorial popup limit (a last resort)

Before creating a popup ask: *Can this be communicated through gameplay?* If yes, use gameplay. If not: *through an icon?* If not: *through a short contextual prompt?* Only then use a larger explanation. If a proposed implementation contains excessive text, redesign it.

### Rules by area

- **Tutorials** — no giant opening manual; teach organically. Goku approaches a small obstacle, a button icon subtly appears, the player jumps. The story reaches a moment where flying is useful, a small indicator appears, the player discovers it.
- **Contextual prompts** — `[Icon] Dodge`, `[Icon] Transform`, `[Icon] Lock On`, `[Icon] Fuse`, `[Icon] Talk`, `[Icon] Pick Up`: small, clear, temporary, non-intrusive, and gone once the player understands the action.
- **One-time hints** (second human playtest: the lock-on hint "appears constantly") — a control hint is taught **once**, remembered in the save, and never shown again in any mission; only resetting the hints (Settings or the developer menu) brings it back.
- **Iconography** — a consistent icon system for ki, stamina, health, Dragon Balls, objectives, characters, transformations, fusion, items, interactions, locations, missions, collectibles, save points, training and challenges.
- **Visual language** — Dragon Ball icon → Dragon Ball objective; red enemy marker → hostile target; character portrait → ally; transformation icon → transformation; fusion icon → fusion available; chest/item icon → collectible; question mark → unknown/optional content. Do not keep explaining symbols the player knows.
- **World-based communication** — show the village in the distance, a subtle marker, NPCs reacting, smoke, character dialogue instead of "GO TO THE VILLAGE TO FIND THE ELDER."
- **Objective UI** — concise: `[ICON] Find the Village Elder`; the why comes through dialogue and gameplay.
- **Mission UI** — `MAIN OBJECTIVE [Icon] Defeat Raditz · OPTIONAL [Icon] Protect Gohan · REWARD [Character icon] Piccolo`; optional Details section for more.
- **Dialogue** — characters speak naturally and never explain mechanics ("your stamina bar is located at the bottom of the screen"); the HUD already shows health.
- **Character information** — short by default; optional Details.
- **HUD philosophy** — bars, icons, rings, meters, symbols, portraits, small indicators, color/state changes and animation instead of explanatory sentences.
- **Health** — health bar, portrait, critical-health feedback, exhausted animation, audio change — never "WARNING! YOUR HEALTH IS VERY LOW!".
- **Ki** — meter, charging animation, aura intensity, animation, sound; never "Your Ki is increasing."
- **Stamina** — meter depletion, movement, exhaustion animation, sound, dodge availability.
- **Transformations** — the story leads in, the character transforms, music changes, aura appears, HUD changes; a small notification afterward at most.
- **Fusion** — icons, fusion indicator, compatible portraits, subtle effects, ki requirement, contextual prompt; the fusion animation itself communicates everything.
- **Dragon Ball discovery and collectibles** — appearance, sound, reaction, radar, collection icon, `4 / 7`, small notification.
- **Secrets** — environmental clues, strange objects, hidden paths, unusual NPC behavior, audio and visual cues, character reactions, unlock animations — never "YOU HAVE FOUND A SECRET AREA!".
- **Menus** — visual and organized (portraits, icons, tabs, categories, symbols, progress indicators, cards, models, animations), no blocks of text. **Settings** may use text, concisely.
- **Loading screens** — artwork, animated backgrounds, short tips, icons, controls, character facts, minimal text; no walls of lore.
- **Cutscenes** — characters look, move, react, fight, point, fly, transform, interact; never narrate what is visually obvious (if Goku transforms, SHOW Goku transforming).
- **Blocking is validated, not assumed** (third human playtest: a line played over an empty field). Whoever is speaking, and whoever is being spoken to, are physically present, placed in relation to each other, facing each other and inside the camera's frame at that beat — checked by test, at a fresh start and from a checkpoint. A camera is built from where the actors actually are (a two-shot that holds both, or an over-the-shoulder when the gap would make them small), never from numbers that assume a distance.
- **Cinematic standard for iconic story beats** (second human playtest: Piccolo's death, Nappa's execution, Cui's and Dodoria's deaths, Goku's landing on Namek, the frog, the Nail fusion were told, not shown). An iconic beat is a staged scene, not a line of dialogue or an AI outcome: every actor is present and placed where the story needs them; a killing attack visibly travels and **cannot miss** (it ends on its victim); the hit, the fall and the aftermath are shown; the faces that carry the moment are framed readably; the camera stays level with the action rather than above it; 5–15 seconds; skippable, with the same end state watched or skipped.
- **Environmental storytelling** — destroyed buildings, abandoned cities, battle scars, broken spacecraft, destroyed villages, training areas, statues, NPC behavior.
- **Audio storytelling** — Dragon Radar beeping faster, boss music beginning, transformation sound, danger cue, low-health audio, hidden-area sound, fusion activation sound.
- **Character reactions** — characters look toward approaching danger, react when enemies power up, the radar reacts to nearby Dragon Balls, characters react to nearly defeated enemies.
- **Minimal interruptions** — not popup → close → tutorial → close → story text → close → gameplay, but gameplay → contextual cue → player acts → gameplay continues.
- **Important story text** is appropriate for important dialogue, character names, mission titles, major story transitions, menu descriptions, optional lore, accessibility, settings and archive entries — kept purposeful.
- **Optional information** hides behind optional interfaces (`[View Details]`).
- **No walls of text** during active gameplay; break complex information into icons, labels, diagrams, meters, visual examples and interactive tutorials.
- **Reward notifications** — a portrait appears, short "VEGITO [NEW]", then continue; never a 30-second explanation.
- **Discovery** — not every mechanic, secret, collectible or character needs a paragraph; curiosity is part of the experience.
- **Immersion rule** — "Would this information naturally exist inside the world?" If yes, show it in the world: a destroyed landscape, smoke and cracked terrain instead of "Planet Namek has been heavily damaged"; characters struggling, massive attacks and destruction instead of "Frieza is extremely powerful"; expression, voice, posture and attacks instead of "Vegeta is angry".
- **Learn by playing** — see, understand, try, master, discover — not read, close, read, close, finally play.

### Final presentation rule

SHOW, DON'T TELL. VISUALS OVER PARAGRAPHS. ICONS OVER WALLS OF TEXT. GAMEPLAY OVER TUTORIALS. ENVIRONMENT OVER EXPOSITION. CHARACTER REACTIONS OVER EXPLANATIONS. SOUND OVER NOTIFICATIONS. DISCOVERY OVER SPOILERS. IMMERSION OVER UI CLUTTER. **Text should support the experience. Text should NOT BE the experience.**

When implementing any new system, UI, mission, mechanic, unlock, character, transformation, fusion, collectible or tutorial, explicitly evaluate whether the information can be communicated visually (icon, animation, sound, VFX, character behavior, environment, HUD, camera, contextual interaction) before adding text.

---

## 20. Audio / VFX / Camera / Environment

### Audio

Audio is a major system. Excellent, varied sound for punches, kicks, impacts, blocks, dodges, vanishes, ki charging, ki blasts, beams, explosions, teleportation, flight, landings, transformations, environmental destruction, character grunts and battle cries, menu and UI sounds. Avoid one generic effect repeated. (Voice acting and recorded sound design require real production assets and must never be ripped from the anime or games.)

**Audio lifecycle** (second human playtest: a charge roar kept playing and polluted the Mission Complete music). Every looping sound has an owner and ends with it: a charge loop stops when the charge ends, is cancelled, the fighter is hit, knocked down or dies, the player switches heroes, a cinematic starts, a checkpoint reloads, the mission ends or the scene changes. Pausing mutes loops and resuming restores them. When a mission ends the battle falls silent so the result music plays alone. This is covered by regression tests.

### Music

A dynamic music system reacting to battle state, health, boss phase, transformation, story progression, location, victory, defeat, fusion and final attacks — normal battle → escalating battle music → boss phase → transformation → climax — transitioning smoothly rather than restarting abruptly. Dramatic boss music; character and boss themes.

### Dialogue and faces

Context-aware battle dialogue (low health "Not yet!", transformation "This ends now!", facing a rival "You haven't changed.", winning "That was close.", losing "I'll get stronger."), reacting to opponent, saga, story state, transformation, health and previous events. Facial expressions — anger, fear, confidence, surprise, determination, sadness, smirking, concentration, exhaustion — during cinematics, transformations, dialogue, major attacks and boss encounters.

### Visual effects

Spectacle without obscuring gameplay: auras, ki particles, lightning, energy trails, beam effects, explosions, smoke, dust, debris, shockwaves, ground cracks, speed lines, motion effects, impact flashes. A consistent visual language for ki, transformations, God ki, destruction energy, Ultra Instinct, fusion energy, regeneration, teleportation, time manipulation, barriers, absorption and giant energy attacks. VFX respond to gameplay: a charging beam grows more intense, a transformation builds energy, a character at low health does not look fully powered.

### Aura system

A proper aura framework with intensity, size, color, particles, lightning, heat distortion, ground effects, hair interaction and environmental lighting; different transformations have different aura behavior — not a glowing particle effect attached to everything.

### Animation

Idle, walking, running, flying, charging, attacking, blocking, dodging, recovering, getting hit, falling, landing, transforming, specials, ultimates, victory and defeat — with anticipation, follow-through, weight, momentum, recovery, facial expressions, body rotation, shoulder, hand and foot movement, airborne momentum. No single generic animation reused for every character (§4).

### Camera

Cinematic but playable. Separate behaviors for exploration, normal combat, aerial combat, beam attacks, ultimates, transformations, boss battles, giant enemies, cutscenes, fusion and destruction sequences. In normal combat keep player and opponent readable, avoid excessive movement, maintain visibility. During specials use cinematic angles, dynamic zoom, projectile following, impact emphasis and slow motion where appropriate. Avoid clipping through terrain, extreme zoom, losing the player, blocking attacks, sudden unnecessary movement, getting stuck behind objects; giant characters must not block the camera. **In intense battles readability beats spectacle.** The player can reduce or disable cinematic effects.

### Environments

Detailed 3D places — Earth, West City, Kame House, the Lookout, Hyperbolic Time Chamber, Capsule Corporation, tournament arenas (World Tournament, Cell Games, Tournament of Power), rocky wastelands, mountains, forests, deserts, Namek, Frieza's spaceship, Planet Vegeta, space, other planets, Hell, Future Earth, destroyed cities. Every major environment feels like a real place: ambient animation, weather, lighting, background activity, wildlife, destructible objects, environmental sound, atmosphere, distant landmarks. Earth feels alive, Namek alien, Planet Vegeta militarized, Future Earth damaged and abandoned, tournament arenas like real venues — never empty boxes.

- **Time of day** — morning, day, evening, night; lighting reinforces tone (softer peaceful scenes, dramatic major battles, darker destroyed environments).
- **Weather** — clear, clouds, rain, storms, dust, smoke, energy storms; atmospheric but never unreadable.

### Destruction

Environments react to combat where technically feasible: rocks break, ground cracks, buildings collapse, trees are destroyed, craters appear, dust clouds form, walls break, objects are thrown, terrain changes, impact marks remain. Characters smash through rocks, destroy buildings, knock enemies into terrain, break arena structures. Destruction is not purely visual — where possible it influences combat. Performance-conscious; prioritized for ultimates, boss attacks, major story events and heavy impacts. Nappa destroys terrain more dramatically than most.

### Transitions

Continuous where possible: exploration → battle → transformation → gameplay → cinematic → gameplay → mission results → world → menu. Avoid unnecessary hard cuts and loading.

---

## 21. Save / Progression

### Progression

Meaningful and rewarding skill and exploration, without excessive grinding. Unlockable: characters, transformations, techniques, costumes, stages, music, art, special missions, What-If scenarios and Dragon Ball wishes. Characters unlock naturally along the chronology; transformations feel earned. Reward feedback is satisfying: character reveal, transformation showcase, costume preview, Dragon Ball animation, special notification for secrets, unique music or cinematic for major unlocks — never just "ITEM UNLOCKED".

### Save system

Reliable and robust. Save:

- story progress and **completed missions** (with best results);
- character unlocks, transformations, techniques;
- **Dragon Balls**, collectibles, **gallery** unlocks;
- **customization** (costumes) and the custom character;
- character mastery;
- **What-If progress** (a separate track from canon);
- secret unlocks and **rewards**;
- **settings**.

Implement autosave, manual save where appropriate, save confirmation, safe loading, recovery and error handling, corruption protection (checksums, backups, never discarding an unreadable save). **Never silently lose progression; do not accidentally erase progress.** Frozen earlier builds keep their own save data untouched.

### Checkpoints

Long missions have sensible checkpoints after meaningful milestones; a loss after a long boss phase must not force replaying unnecessary content. A checkpoint restores the **story state** too: whoever has fallen by that point stays fallen.

### Returning to the story

Finishing a mission returns the player to **its chapter**, on the mission it unlocked (the finished one marked) — never to the top of the list or the Prologue. Retry, Next, Continue, Back to Story and checkpoints keep the player's place (second human playtest).

### Developer / Test Mode

A developer/test mode exists for testing, **not as part of normal gameplay**: hidden unless switched on in Settings, it uses its **own save slot** (a copy of real progress when first switched on) so nothing done in it touches the real save. It may unlock everything, offer cheats (infinite health/ki/stamina, god mode, no cooldowns, no ki cost, one-hit KO, infinite time, all forms), a debug overlay, mission-and-phase select and in-battle tools (skip scene, force win/loss, restart or skip a phase, spawn fighters, reset hints).

---

## 22. Testing

**AUTOMATED TEST PASS ≠ HUMAN PLAYTEST PASS.** Automated tests prove behavior and catch regressions. They do not prove that the game feels good. Never assume "automated tests pass" means "the game feels good".

### Automated tests

Create automated tests for systems that can be tested automatically, verifying actual behavior (not merely that functions exist): health, damage, ki, stamina, transformations, Kaioken, Instant Transmission, beams, beam clashes, Spirit Bomb, fusion, story restrictions, character unlocks, mission completion, rewards, save/load, settings, inventory, Dragon Balls, What-If progression and separation, radial menu, character selection, boss phases, Great Ape, per-character kits.

### Kinds of testing

- **Unit tests** of pure rules (combat math, saves, settings, data validation).
- **Combat Lab** — deterministic scripted scenarios pressing buttons on exact frames.
- **Regression testing** — after every feature, verify previous features still work; do not fix one feature by silently breaking another.
- **Checkpoint testing** — every mission starts cleanly from its beginning and every checkpoint.
- **Bot playthroughs** that only send player inputs, proving missions are completable with normal controls.
- **CPU-vs-CPU** duels and telemetry — for finding broken behavior, not for declaring balance.
- **Encounter probes** — measuring readability (simultaneous attackers, off-screen hits, stun chains) of story fights.
- **Browser testing** — launch, rendering, real input events, console errors, frozen builds still booting.
- **Performance testing** (§23).
- **Human playtesting** — actually playing it (below).

### Manual / human playtesting

After implementing major systems, actually play through them looking for boring sections, repetitive combat, bad camera behavior, unresponsive controls, poor AI, excessive effects, weak impacts, confusing objectives, slow menus, annoying loading and bad pacing — and fix what is found. For gameplay that cannot be automated, create repeatable manual test procedures. **Whenever a new major gameplay system is added, provide a short human-playtest checklist.** Human findings are recorded separately from automated results, and a feature a human reported as broken is only marked fixed after a human retests it (automated verification of the fix is recorded as such).

### What to test (quality control)

Every playable character, major attack, transformation, story mission, boss, menu, setting and collectible; saving/loading; character switching; flight; combat; beam clashes; QTEs; controllers; keyboard; resolution changes; audio and graphics settings.

**Bug prevention — not only the happy path:** winning, losing, restarting, pausing, resuming, saving, loading, quitting, changing characters, transforming, fusing, dying during transformations or cinematics, skipping cinematics, changing settings, returning to menus.

**Edge cases:** transforming at 1 HP, fusing immediately before defeat, boss transforming while being hit, simultaneous ultimates, leaving the combat area, stuck enemies, target dying while locked on, pausing during a cinematic, restarting, saving during mission completion, simultaneous unlocks, completing a secret requirement before the game expects it. Fail gracefully.

**Camera / animation edge cases:** characters clipping through each other, arms through bodies, floating feet, sinking into terrain, camera inside geometry, giant characters blocking the camera, fusion models or weapons clipping, transformation effects persisting after the form ends.

### Final quality pass (before declaring a major milestone complete)

- **Combat:** responsiveness, balance, hit reactions, combos, AI, camera.
- **Characters:** models, animation, VFX, voice, unique mechanics, transformations.
- **Environments:** visual quality, destruction, lighting, audio, exploration.
- **Story:** pacing, dialogue, cinematics, chronology, objectives.
- **UI:** readability, navigation, feedback, controller support.
- **Audio:** music, effects, dialogue, transitions.
- **Performance:** FPS, memory, loading, stability.
- **Progression:** unlocks, rewards, saves, mastery.
- **Polish:** bugs, clipping, camera, animation, transitions.

### Final release checklist

Do NOT declare the game complete until, as far as scope allows: the game launches reliably; main menu, New Game, Continue, save/load, settings, controls, character selection, combat, AI, transformations, fusion (where implemented), story missions, mission completion, rewards, Dragon Balls (where implemented), customization (where implemented), What-If (where implemented), secret unlocks (where implemented), training and replay (where implemented) work; no major progression blockers, crashes, save corruption or softlocks; major characters have appropriate animations; major attacks have appropriate VFX and audio; major transformations are polished; major bosses are tuned; menus are responsive; performance and loading are acceptable; accessibility settings work; difficulty actually changes gameplay; objectives are clear; the player can understand what to do; **the game does not falsely claim unfinished systems are complete.**

---

## 23. Performance

Performance is part of polish. Optimize intelligently; do not create enormous assets or needlessly complex systems for the sake of complexity. The game must remain responsive and must not assume unlimited hardware.

- **Monitor** FPS and frame time, memory, CPU and GPU usage, loading times, object counts, particle counts, animation counts.
- **Use** level of detail (LOD), culling, efficient effects, asset reuse, streaming and level-based loading, asset unloading, sensible texture sizes and texture management, efficient AI, object pooling, proper memory management; prevent memory leaks.
- **Budgets** — per-fighter model budgets (triangles, joints, materials), texture budgets, effect/particle budgets, afterimage costs; many simultaneous enemies used intelligently rather than spawning huge numbers.
- **Scalable graphics** — resolution, texture quality, shadows, effects, view distance, anti-aliasing, post-processing, particle counts. High-end systems get better effects, higher resolution, more destruction, more particles, better shadows; lower-end systems remain playable.
- Do not sacrifice frame rate for unnecessary destruction.

---

## 24. Scope Management

This is an ambitious project. A complete AAA-quality Dragon Ball game cannot be produced instantly. Always distinguish:

1. what can be implemented immediately;
2. what can be implemented after the foundation exists;
3. what requires significant asset production;
4. what requires extensive animation;
5. what requires extensive testing;
6. what should remain an expansion goal.

### Classifying features

Whenever a proposed feature significantly increases complexity, classify it as **CORE**, **IMPORTANT**, **OPTIONAL** or **FUTURE**. Optional features never block core development. If something is too ambitious, create a simplified version (a smaller destructible battlefield instead of a planet-sized one; a few highly differentiated enemy archetypes instead of 100 enemy types; the most important locations first).

The original prompt's content tiers map onto these classes:

- **Tier 1 — Core (must exist):** combat, movement, flight, ki, characters, bosses, story, basic customization, saving, main menu, settings.
- **Tier 2 — Major (should exist if development stays manageable):** Dragon Balls, Shenron, tournament, What-If, destruction, advanced transformations, team battles, training, gallery, character-specific mechanics.
- **Tier 3 — Expansion (never block the core):** massive open world, hundreds of fully unique characters, extremely detailed custom character creator, every location, every minor character, every transformation, fully destructible cities, battles with hundreds of simultaneous characters, cinematic campaigns for every side character, online multiplayer, advanced replay systems, procedurally generated missions.

### Production priority

1. Playable gameplay 2. Combat feel 3. Character quality 4. Enemy AI 5. Environments 6. Story 7. Progression 8. UI 9. Polish 10. Optional features. The game should become fun as early as possible.

**When resources are limited:** 1 core combat, 2 player controls, 3 camera, 4 one excellent character, 5 enemy AI, 6 one excellent environment, 7 boss battle, 8 story framework, 9 save system, 10 additional characters, 11 additional environments, 12 additional story, 13 customization, 14 Dragon Balls, 15 What-If, 16 extra modes, 17 advanced effects, 18 optional experimental mechanics. Never sacrifice the foundation to increase the feature list.

### Vertical slice first

The single most important production rule: **BUILD A SMALL, COMPLETE, FUN GAME FIRST.** It must prove the controls work, combat is fun, characters feel good, AI works, flight works, transformations work, effects work, UI works, saving works, a mission can start and finish, rewards unlock, and the player can return to the menu. Only then should the project become enormous. The original minimum slice: one character, one enemy, one environment, basic movement, flight, combat, ki, one signature attack, one transformation, basic enemy AI, health, UI, one polished battle.

### Development phases (from the original specification)

- **Phase 0 — Technology and project setup.** Choose the stack for someone starting from zero; simple installation; scalable project structure. *(Decision taken: a browser game on local three.js r149 — double-click `index.html`, no install, no build step; see `README.md`.)*
- **Phase 1 — Minimum playable prototype.** One character, enemy, arena; movement, camera, melee, health, ki, one ki attack, blocking, dodging, basic AI, win/lose, basic UI. Goal: "I can launch the game and have a fun fight."
- **Phase 2 — Combat foundation.** Combos, lights, heavies, launchers, air combat, knockbacks, guard, perfect guard, dodge, vanish, ki charging, blasts, specials, ultimates, flight, lock-on, target switching, stamina, basic destruction. Combat should already feel satisfying.
- **Phase 3 — First polished character** (preferably Goku), the quality benchmark: model, rig, animations, complete moveset, Kamehameha, Instant Transmission, transformation and its animation, aura, ultimate, unique AI, victory, defeat, dialogue, effects, sound. Do not create 50 mediocre characters before one is excellent.
- **Phase 4 — Small roster** (e.g. Goku, Vegeta, Piccolo, Gohan, Frieza, Cell, Majin Buu, Bardock), each a complete playable implementation.
- **Phase 5 — A few polished stages** (rocky battlefield, Earth landscape, tournament arena, Namek battlefield, destroyed city), at least one with meaningful destruction.
- **Phase 6 — First vertical slice**: main menu, one story chapter, several playable characters, one boss, one transformation, flight, combat, one Dragon Ball collectible, basic customization, settings, save system, one polished environment, basic progression. The most important milestone.
- **Phase 7 — Bardock mini-campaign** (§3 Prologue), used as the foundation for the larger story.
- **Chronology gap — future work (owner directive, 2026-09-18).** The game goes from the Bardock prologue straight to the Saiyan Saga. The Original Dragon Ball bridge (young Goku, Grandpa Gohan, Bulma, Chi-Chi, Master Roshi, Krillin, the early adventures, the Tenkaichi Budokai, the King Piccolo era, the 23rd Budokai, Goku / Chi-Chi / the Ox-King, the transition into the Saiyan era) is a real requirement, scheduled as a **later chronology-completion pass** after the current Buu Saga, the remaining planned saga systems and broader game completion. It is not built and must not be started early.
- **Phase 8 — Chronological campaign expansion**, one saga at a time: 1 Bardock/Saiyan history, 2 original Dragon Ball, 3 Saiyan Saga, 4 Namek/Frieza, 5 Androids, 6 Cell, 7 Majin Buu, 8 Battle of Gods, 9 Resurrection of F, 10 Universe 6, 11 Future Trunks, 12 Tournament of Power. Finish one chapter to reasonable quality before expanding.
- **Phase 9 — Large roster expansion** in groups A–F (§4).
- **Phase 10 — Dragon Ball system** (§14).
- **Phase 11 — Customization** once the character system is stable (§15).
- **Phase 12 — What-If system** expanded once canon is stable (§16).
- **Phase 13 — Advanced features** once the core is stable: advanced destruction, complex beam clashes, advanced QTEs, large-scale battles, advanced environmental interactions, more sophisticated AI, dynamic music, complex fusion, time manipulation, body swapping, regeneration, absorption, large bosses, giant characters — without destabilizing the core.
- **Phase 14 — Polish**: stop adding major systems; fix bugs, animation, camera, responsiveness, loading, performance, UI consistency, audio mixing, VFX, lighting, environments, AI, save reliability.

### Reuse without looking cheap

Share the combat framework, physics, UI framework, environment systems, VFX infrastructure, animation technology and AI architecture, but avoid obvious visual repetition.

---

## 25. Version Strategy

Development is **incremental**. At the end of every major phase there is a **playable build**. Versions must remain **recoverable and identifiable**; previous working builds are never destroyed (frozen copies live in `builds/`, each with its own save slot).

### Planned version ladder

The original prompt's example checkpoints were: 0.1 basic combat · 0.2 polished Goku · 0.3 initial roster · 0.4 first environments · 0.5 vertical slice · 0.6 Bardock campaign · 0.7 Saiyan Saga · 0.8 Namek · 0.9 Android/Cell · 1.0 core campaign release candidate · later builds expand the game.

The owner's later directives re-sequenced the ladder around the chronological campaign, and this is the ladder in use:

| Version | Focus |
|---|---|
| 0.1 | Combat foundation (first playable build) |
| 0.2 | Goku showcase (first polished character), local three.js, Chapter 1 Raditz, first What-If |
| 0.3 | Saiyan Saga expansion |
| 0.4 | Namek foundation |
| … | Continuing chronologically (Frieza, Androids/Cell, Majin Buu, Super arcs) toward 1.0 |

### Version discipline

- A version is not complete merely because the game launches. A feature is complete only if it actually works in gameplay and survives regression testing.
- Keep V0.1 recoverable, keep earlier versions identifiable, create a clear checkpoint for each version.
- At every stage, report honestly: WHAT EXISTS · WHAT WORKS · WHAT IS BEING BUILT · WHAT IS NEXT · WHAT IS TEMPORARY · WHAT IS NOT YET POSSIBLE · WHAT NEEDS INSTALLING · WHAT FILES WERE CREATED · HOW TO RUN · HOW TO TEST. Never hide limitations; never fake completion.
- Use the status vocabulary in Appendix C.

### Definition of a real release

A release candidate is not complete until: the game launches reliably, the main menu works, a new game starts, a mission can be completed, combat, characters and enemy AI work, saving and loading work, settings work, there are no major progression blockers, major crashes, visual glitches and exploits are fixed, performance is acceptable, controls are responsive, and the game can be packaged into a usable build (desktop packaging is planned; see `README.md`).

---

## 26. Current Asset Philosophy

**The absence of final character models is NOT a reason to stop gameplay development.**

**Build the game with prototypes now. Replace prototypes with production assets later.**

- Keep creating Level 1–2 prototype characters as the chronological campaign needs them.
- Make every character **playable, recognizable, mechanically distinct and replaceable**.
- Never describe a prototype as a production asset (Level 3 only for real production models imported through the `.glb` pipeline).
- Do not spend enormous time turning procedural prototypes into AAA assets.
- Do not download or use outside assets without the owner's explicit approval.

> *"MAKE PROTOTYPES SO WE CAN BUILD THE GAME. REPLACE THEM WITH PRODUCTION ASSETS LATER."*

---

## Appendix A — Standing project constraints

These are permanent owner directives, not preferences:

- Everything stays **LOCAL** in the project folder.
- **No Git.** Do not initialize Git, do not push, do not connect the project to GitHub or any remote.
- **Do not upload** project files or documents anywhere.
- **No external services or connectors.** The Valtown connector in particular is not authorized for this project: never authorize it, sign in, send code, assets, logs or project data to it, or make the project depend on it. Its absence never blocks development.
- **No outside assets** (models, textures, music, sounds, fonts, libraries) without explicit approval. (Approved exception: three.js r149, stored locally in `vendor/`.)
- **Do not download random Dragon Ball models.**
- Keep **V0.1 frozen** and recoverable in `builds/v0.1/`; keep **V0.2** identifiable in `builds/v0.2/`.
- **Do not restart** the project; do not throw away working systems just to rewrite them; do not replace functional systems with fake placeholders.
- **Do not claim** something is complete if it is only a prototype.
- Do not ask the owner to design characters: drawings do not unblock the 3D asset pipeline.
- Make sensible decisions and explain them briefly instead of constantly stopping to ask questions that can reasonably be answered.

## Appendix B — Legal

This is a fan-style, personal, non-commercial Dragon Ball project. It must never claim to be an official Bandai Namco, Toei Animation, Shueisha or Akira Toriyama product. Distributing fan games that use a franchise's characters can infringe copyright and trademark even when free; legal concerns about distribution must be explained clearly. Never add ripped models, music or voice clips from official games or the anime. All code, synthesized audio and paraphrased dialogue are written for this project.

## Appendix C — Status vocabulary

| Word | Meaning |
|---|---|
| **COMPLETE** | Works, is tested, and is polished for the current version's scope. |
| **FUNCTIONAL PROTOTYPE** | Fully works and is tested; quality is not final (usually art, animation or audio). |
| **PARTIALLY IMPLEMENTED** | Works, but a named planned part is missing. |
| **PLACEHOLDER** | Exists only to hold a place; not playable. "THIS FEATURE IS CURRENTLY A PLACEHOLDER." |
| **PLANNED / NOT YET IMPLEMENTED** | Not built; nothing in the game pretends it exists. |
| **BLOCKED BY ASSETS** | Needs art, animation or audio that code alone cannot produce at good quality. |
| **NEEDS TESTING** | Built, but not verified well enough to call working. |
| **AUTOMATED TESTED** | Verified by automated tests, bots or scripted checks. Says nothing about feel. |
| **HUMAN PLAYTESTED** | A person actually played it and reported the result. |

Internal markers for unfinished work may also include: Prototype, Placeholder, Partial, Planned, Blocked, Needs assets, Needs testing. Never hide unfinished systems behind polished menus.
