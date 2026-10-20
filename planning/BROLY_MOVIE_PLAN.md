# Movie 2 — Dragon Ball Super: Broly — plan and structure

Written 2026-10-10 (the owner's "SAIYAN LEGACY — DRAGON BALL SUPER: BROLY" brief, milestones A–B), extended the same day
for the owner's "COMPLETE THE ENTIRE MOVIE CAMPAIGN" brief. **The whole film is built** (all nine parts, ten missions).
`HANDOFF.md` and `STATUS.md` record what was built, how it was checked and what is still a prototype.

## What already existed and was reused (no parallel systems)

| Need | Existing system |
|---|---|
| Separate film, own progress | `SL.data.story.movies` (+ `movieOf`, `movieOrder`, `movieLocked`, `movieBefore`), Save track `movies` (`def.movie`), Movies screen — built for Fusion Reborn |
| Form chronology | `SL.data.formGivenBy` (entries may name FILM missions) + `Mission._lockUnearnedForms`, `form.freeUnlock`, `form.storyLocked`, `Mission.teach('form:<id>')`, `BK.give` |
| Story-controlled fights | `Mission.storyFight` (floors, dealt/taken, ease, aggression, `space: 'air'`), checkpoints |
| Transformations | `SL.data.cinematics.ascend` (hold Charge) → `cinematics.transform` with `changeShots`/`onFrame` |
| Interactive beats | `Mission.cue`, `Mission.rhythm` (the Fusion Dance), `Mission.struggle`, beam clashes (`SL.Clash`) |
| Two heroes | `Battle.setParty` (party switching, the ally AI) |
| Fusion | `SL.Fusion.fuse/defuse`, `SL.data.fusionDance.STEPS`, Veku (Fusion Reborn), Gogeta |
| Camera | `Cinema` semantic shots, `Cinema.shotOn`, `Mission.shot` (with `out.roll`), the safety pass |
| Destruction | `Stage.crater`, `destroyPillar`, `addProp` (props as combat targets: the FR.armour pattern), `vfx.*` |
| The planet's end | the Bardock prologue's orbit stage and planet effects (`SL.data.cinematics.planetFX`) |
| The dimension | `SL.Dimension` (portals, cubes, prism orb, cosmos) → new `kaleido`, `glassBreak`, `hideWorld` |
| The dragon | `SL.data.endzKit.shenron` |
| Clock for "the hour" | `SL.data.frKit.clock` |

## The film (ten missions, `bb_*`, in this order)

`placedAfter: 'bog_sphere'` (the film's world is after Battle of Gods; it opens when "My World" is cleared).

| Part | Mission | Stage(s) | Played as | Core |
|---|---|---|---|---|
| 1 | `bb_planet` The Fall of Planet Vegeta | `planet_vegeta` → `orbit` | Bardock | exile scene, Frieza's plan, squads fight, Gine, pod launch cue, the planet destroyed |
| 2 | `bb_vampa` The Wild Planet | `vampa` | Broly | exploration, rockfall, the Vampa beast mini-boss, Ba, the collar, training stones, Cheelai & Lemo |
| 3 (I) | `bb_clash` The First Clash | `broly_glacier` | Vegeta | the read/adapt fight, SSJ, SSG, God dominance cues, RAGE, the crater |
| 3 (II) | `bb_wrath` Wrath | `broly_glacier` | Vegeta | the seven-shot Wrathful transformation, the ocean beat, Blue, the Galick clash |
| 4 | `bb_goku` The Legendary Super Saiyan | `broly_glacier` | Goku | the twelve-beat warm-up, base / SSJ / God, God Bind broken |
| 5 | `bb_legend` Beyond the Limits | `broly_glacier` (melts) | Goku | the five-shot Blue, the duel, Paragus, Super Saiyan Broly, the melt |
| 6 | `bb_alliance` Desperate Alliance | `broly_lava` → `plains` | Goku / Vegeta | the barrage, the duo (party), the catch, Instant Transmission, Piccolo |
| 7 | `bb_fusion` The Birth of Gogeta | `plains` ↔ `broly_lava` | Goku, Frieza | the lesson, Fat Veku, Frieza's hour (Golden), Skinny Veku, the perfect dance, Gogeta |
| 8 | `bb_gogeta` The Ultimate Fusion | `broly_lava` + the dimension | Gogeta | stages A–I: weave, SSJ, counter, aerial + clash, Blue, Full Power, Dimension Break, punisher / stardust / soul punisher, return, Kamehameha and the wish |
| 9 | `bb_epilogue` A New Beginning | `broly_lava` → `vampa` | Gogeta, Goku | Frieza stopped, defusion, the visit, the capsule, "call me Kakarot", credits |

## Broly — the evolving boss

One character (`broly`), four forms that change behaviour, not only colour: `base` CONTROLLED (reads and catches
repeated strikes, swats known blasts, copies your string at MATCHING), `wrath` WRATHFUL (reach, leaps, roars, no
flinch from light blows), `ssj` SUPER SAIYAN (faster strings, Eraser blasts), `full` FULL POWER (the chest plate
bursts, arena-scale attacks). Mechanic `legendary` (mechanics.js): the phase follows the FORM (the story), never
health; adaptation WATCHING → LEARNING → MATCHING → SURPASSING; a RAGE meter missions can read.

## Milestones (as delivered)

- **A + B** (first pass): registry, isolation, the glacier, Broly/Paragus/Cheelai/Lemo, Vegeta SSG/SSB, `bb_clash`, `bb_wrath`.
- **The complete film** (second pass, the owner's "complete the entire movie" brief): parts 1, 2 and 4–9, the new beats in
  part 3, Goku and Gogeta Blue, Golden Frieza, God Bind, Planet Vegeta, Vampa, the melt and the Lava Wasteland, the
  Dimension Break, Gine, King Vegeta, Skinny Veku, the film's set pieces, tests and docs.
- **Not built:** optional Movie 2 challenges (the film itself does not need them).

Tests: `tests/super-broly-tests.js` (registry and lock chain, isolation, chronology, God Bind, the melt, the dimension,
the read/adaptation, the Wrathful cues by real buttons, skip-safety, RAGE, all ten missions bot-played with every
scene watched); the sim-tests regression sweep starts every checkpoint of every film mission.

## Next task

**The owner's human playtest of the whole film** (checklist and Developer Menu phase lists: `STATUS.md` → *Movie 2: Dragon
Ball Super: Broly — THE COMPLETE FILM*), then a fix pass on what it finds (framing, timing, difficulty of the Vampa
beast / the barrage / the dance, readability of the dimension). Everything so far is bot-tested and smoke-tested only.
Optional later: Movie 2 challenges.
