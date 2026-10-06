# ASTRA REVIEW — independent technical audit

**NON-AUTHORITATIVE — prepared 2026-09-22 for Claude Code, the primary developer and architect.**

`MASTER_SPEC.md` remains the sole authoritative design specification. This review records observations and possible follow-up work; it neither changes the design nor authorizes implementation. No gameplay feature, fix, refactor, dependency, asset, or campaign content was added.

Project reviewed: `C:\Users\NemOK\Documents\coding\saiyan-legacy`.

## Scope and evidence

This is a focused technical audit, not an exhaustive line-by-line certification of the project. The four requested documents were reviewed for design requirements, current architecture, known issues, testing records and operating instructions; historical records were consulted selectively. Source inspection concentrated on shared lifecycle boundaries and representative mission setup. Broad runtime loading is distinguished from direct source review in the file inventory.

Evidence labels used below:

- **REPRODUCED (isolated headless):** observed using the existing local `tests/headless.js` runtime in a fresh Node process with in-memory storage. These probes were supplied through standard input; no probe or test file was created.
- **CONFIRMED (source):** a particular branch or omission is visible in the inspected code. This does not establish its frequency in real play.
- **SUSPECTED:** a plausible consequence needing further validation, explicitly separated from the observed code.
- **KNOWN:** already documented by the project; not presented as a new discovery.

The full test suite was **not run**. No browser was launched, no audio was listened to, and no GPU profiling or human playtest was performed. Existing documented test passes are historical evidence only. The character validator was executed against the loaded registry: **zero schema problems**, and loading produced **zero captured engine errors**. Neither result establishes mission correctness.

Current loaded registry: **53 mission definitions, 51 missions in canon story order (including the prologue), 21 Namek chapter entries, 66 characters, 17 stages and 109 scenes**. These are registry counts, not completion or quality claims.

## Architecture assessment

The current architecture is suitable for an offline prototype: local three.js, classic scripts registered under `SL`, explicit script order in `index.html`, and no required build step. Pure combat rules, character data, technique registration, AI profiles, mission generators and model adapters provide useful separation. Retaining this structure is more appropriate than a wholesale rewrite.

| Area | Observed organization | Main concern |
|---|---|---|
| App and UI | `src/main.js` owns launch, teardown, menu transitions and recovery. UI screens call it. | Global state survives battle replacement unless explicitly reset. |
| Battle | `src/game/battle.js` owns fixed ticks, fighters, targeting, projectiles, party changes and disposal. | Audio state and save destination belong to global services, outside this ownership boundary. |
| Missions/cinema | `mission.js` runs generator phases; `cinema.js` dispatches events and a scene-specific final state. | Timing, generator errors and manually reconstructed checkpoint state require careful contracts. |
| Character/combat | `fighter.js`, `rules.js`, `techniques.js`, `mechanics.js`; forms can change kit and AI. | Numerous mutable locks, multipliers and temporary overrides share the fighter object. |
| AI | `controllers.js` combines delayed observations, profiles, plans and character hooks; battle supplies attack tokens. | Target changes and exceptional control changes need state reset coverage. |
| Saves | Versioned slots, checksum wrapper, backup, corruption copy, separate What-If track and developer slot. | Slot isolation is not tied to the lifetime of the battle that earned a result. |
| Models | Procedural and GLB adapters share the gameplay rig; local checker packages approved assets. | GLB resource teardown and production-scale costs need further proof. |

The large shared files are maintenance concentration points: fighter ~2,841 lines, techniques ~2,249, controllers ~1,587 and battle ~1,357 at inspection. Size alone is not a bug. The observed failures involve ownership and transition contracts, so targeted work at those boundaries should precede any structural refactor.

## Prioritized findings

### HIGH-RISK

#### H1 — A developer-started mission can write a clear into the real save after the mode is disabled

**Evidence: REPRODUCED (isolated headless); CONFIRMED (source).**

Files: `src/core/dev.js:42` (`setEnabled`), `src/core/save.js:90` (`useDevSlot`), `src/game/mission.js:500` (`succeed`), `src/ui/screens_battle.js` (pause Settings), `src/ui/screens_settings.js` (developer toggle).

Observed: disabling Developer / Test Mode immediately switches the global save back to the real slot. It neither ends nor marks the existing battle as developer-originated. Mission completion subsequently calls `Save.completeMission` against the currently active slot. Pause exposes Settings, which exposes the switch.

Probe: create a fresh in-memory real save; enable developer mode; start `saiyan_brothers`; disable developer mode; invoke that existing mission's normal `succeed()` endpoint. The real slot then contains its clear, with no captured engine errors. This probe deliberately invokes completion; it is not a full gameplay playthrough.

Impact: a mission accessed or assisted in developer mode can award real progression after switching off. This contradicts the isolation requirement in MASTER_SPEC §21. Free Battle uses the same global-save pattern through `App._onFreeEnd`/`Save.recordBattle`; that parallel path was inspected but not separately reproduced.

Existing coverage: `tests/playtest2-tests.js:770` verifies clears made while the developer slot remains active, then switching back. It does not cover completion of the same developer-started battle after switching slots.

Suggested acceptance check for Claude: an encounter begun or affected in developer mode must never award real-slot results merely because the setting changes before completion. Choose the intended transition policy before implementation.

### MEDIUM-RISK

#### M1 — Leaving a paused battle leaves global loop audio muted in the next battle

**Evidence: REPRODUCED (isolated headless); audible consequence still needs browser verification.**

Files: `src/game/battle.js:1112`, `:1121`, `:1328`; `src/core/audio.js:214`, `:240`; `src/main.js:190` onward.

Observed: pause calls `Audio.muteLoops(true)` and ducks music. Resume clears both. Disposal stops loop handles but does not reset the global mute flag or the music filter. A new battle does not call resume.

Probe: create battle → pause → dispose → create another battle. Result: new battle `paused === false`, global `Audio.loopsMuted === true`. New loop handle updates therefore pass zero to their underlying voice. The source also suggests the pause low-pass filter remains engaged; that filter was not tested with a real AudioContext.

Likely user path: pause → restart, change setup or quit → start another encounter. Existing pause/resume assertions at `tests/playtest2-tests.js:158` do not cover replacement while paused. Validate both music and charge/beam loops in a real browser.

#### M2 — Developer overrides can remain on the former player after switching heroes

**Evidence: REPRODUCED (isolated headless); additional lock-restoration concern confirmed in source.**

Files: `src/core/dev.js:57`–`restore`; `src/game/battle.js` (`switchPlayer`); `src/game/mission.js:85`.

Observed: developer ticks and restoration address only `battle.player`. Party switching hands the previous player to AI without calling `Dev.restore`.

Probe: apply god mode to the current fighter, switch control to another fighter, disable developer mode, tick the developer service. The old fighter remains non-player with `damageTakenMul === 0` and `_devGod` still present. The probe used a training battle, so its pre-existing `cannotDie` flag is not evidence of a new defect.

Also observed: `allForms` replaces `lockedForms`, `lockedSlots` and `formCaps` with empty objects without keeping a restoration snapshot. `restore` restores only god-mode and damage multipliers. The chronology helper runs at mission start, not whenever developer mode is disabled. Continued access after a particular story transition requires its own gameplay check.

Suggested coverage: toggle off both before and after a hero switch; check every affected fighter and restore the intended story restrictions.

#### M3 — Cinematic waits expire while simulation is paused

**Evidence: REPRODUCED (isolated headless).**

Files: `src/game/mission.js:147` (`cine`), `src/game/cinema.js:232`, `src/game/battle.js:1132`.

Observed: cinematic holds use a `performance.now()` deadline. Pausing prevents battle simulation updates but does not stop that clock.

Probe: start a one-second cinematic wait; pause the battle and advance two seconds of headless wall time. The wait predicate becomes true even though **zero simulation frames** advance. On resume, that hold is already over.

Impact: the paused portion of a shot or line can be lost, and wall-clock completion can diverge from tick-driven movement or effects. This does not prove that an entire scene is skipped or its final state is incorrect. Validate pause/resume during dialogue, movement, fades and slow motion.

#### M4 — A generator exception is logged and swallowed rather than reaching app recovery

**Evidence: REPRODUCED (isolated headless); resulting mission softlock is conditional.**

Files: `src/game/battle.js:34`–`:44` (`Coroutine._next`), `:61` (`stop`); `src/game/mission.js:103`, `:550`; `src/game/cinema.js` (`play`/`finish`); `src/main.js` (`crash`).

Observed: a thrown `gen.next()` error marks the coroutine done and logs the error, but does not propagate or fail the mission. The surrounding mission may remain running with input locked. `Cinema.finish` follows the event loop rather than being guaranteed by a `finally`; `Coroutine.stop` only sets a flag and does not close the generator. Mission disposal does provide explicit cleanup callbacks, which is useful but not equivalent to guaranteed sequence finalization.

Probe: a synthetic throwing generator produced one captured sequence error, `done === true`, and no exception escaped to its caller.

No naturally failing production scene was found or claimed. The concern is recovery if a future data callback or runtime event throws. Claude should determine which owner reports failure and restores locks, audio and scene state exactly once.

#### M5 — Invalid mission phase input records success

**Evidence: REPRODUCED (isolated headless); KNOWN in HANDOFF issue #15.**

Files: `src/main.js:265`, `src/game/mission.js:103`; `src/core/dev.js:120`.

Observed: `App.startMission` forwards `startPhase` without validating it as a supported index. The mission runner treats a missing phase as natural completion.

Probe: `headless.mission('saiyan_brothers', {startPhase: 'duel'})` immediately produced `state === 'success'` and a recorded mission clear, without engine errors. The headless launch duplicates this part of the app launch path.

Normal pause/retry controls pass indices, and `Dev.actions.startMission` resolves and bounds-checks named phases. This is a defect in the shared launch contract, not evidence that the ordinary chapter selector currently supplies malformed values. Test negative, fractional, out-of-range and string inputs before declaring the boundary safe.

#### M6 — Save checksums do not validate save structure or supported versions

**Evidence: REPRODUCED (isolated headless); occurrence in existing saves unknown.**

Files: `src/core/save.js:37` (`migrate`), `:57` (`unpack`); `src/core/namespace.js` (`fillDefaults`); `tests/run-tests.js` (save tests).

Observed: migration accepts any object, fills missing defaults and returns it. It does not reject a future version or a wrong non-null type for an existing field.

Probe: packing and unpacking `{version: 999, story: 42}` succeeds and returns those values. This was a synthetic, checksum-valid payload; it was not an existing user's save.

Risk: incompatible or malformed data can pass the load boundary and fail later in consumers rather than triggering backup recovery. Checksums still protect against changed payload bytes; that protection is not disputed.

#### M7 — Failed or unavailable persistent storage can be invisible to the player

**Evidence: CONFIRMED (source); browser failure conditions not reproduced.**

Files: `src/core/settings.js:368` (`safeStorage`), `src/core/save.js:155` (`write`), `:211` (`completeMission`), `src/game/mission.js:500`, `src/main.js`.

Observed: if the localStorage probe fails, `safeStorage` returns an in-memory Map with no persistent/nonpersistent status flag. Saves to it can return success. Separately, `write` catches a write error, emits `save:failed` and returns false; completion does not expose that return value. A source search found no `save:failed` listener in `src/`.

Risk: progress can appear complete and disappear at restart when persistence is unavailable. There is no evidence this happened to the owner. The fallback keeps the game usable, but MASTER_SPEC §21 requires progression failures not to be silent. Confirm the intended player-facing warning and recovery path.

#### M8 — GLB disposal does not release imported textures

**Evidence: REPRODUCED disposal omission; GPU memory growth SUSPECTED, not measured.**

Files: `src/game/model_glb.js:466`; `src/render/glb.js` (`texture`, asynchronous decoding, returned textures/skins); `src/game/battle.js:1328`.

Observed: the adapter disposes materials and mesh geometries, but not `gltf.textures` or skeleton resources. Its root is removed before the battle's remaining-scene geometry traversal. Decoding can also finish asynchronously without a disposed check. No image `close()` or skeleton disposal path was found in `src/`.

Probe: create the existing registered test mannequin, attach disposal-event listeners, call `model.dispose()`. Three mesh geometry disposal events occurred; its one texture produced **zero texture disposal events**. The headless probe does not upload textures or allocate a rendered skeleton's GPU resources.

Risk: repeated imported-character replacement may retain GPU texture/bone resources or decoded images. Verify with renderer memory counters and repeated load/dispose, including disposal before texture readiness. Do not infer a measured leak rate from this probe.

#### M9 — Two-shot framing assumes a fixed aspect ratio

**Evidence: REPRODUCED with three.js projection math; exact story shots at each viewport unverified.**

Files: `src/game/cinema.js:110`, `src/game/battle.js:74`, `:113`; `tests/playtest3-tests.js` (two-shot test).

Observed: `Cinema.twoShot` defaults to aspect **1.6**; the battle camera uses the actual viewport aspect. Located scene call sites omit the aspect argument.

Probe: two points 30 units apart with default `twoShot({fov:42})`. Both project inside a 16:9 camera; at 4:3 their horizontal normalized coordinates are approximately **±1.045**, outside the visible ±1 interval. Square and portrait viewports crop more.

The helper's “guaranteed” framing and gap-only test are insufficient across viewport sizes. This is not a claim that every current scene crops on a 4:3 display. Check real actors, head/body extent, resize and terrain camera adjustments.

#### M10 — Local development server has fragile path and request handling

**Evidence: CONFIRMED (source); path-check weakness reproduced without starting a server.**

File: `tools/serve.js`.

Observed: containment uses `file.startsWith(root)`. A normalized sibling path such as `.../saiyan-legacy-other/example.txt` passes that prefix test despite being outside the project. A direct path-calculation probe confirmed this; no sibling file was accessed. Malformed percent encoding can also throw in `decodeURIComponent` outside a request-level catch. The listener supplies a port but no explicit loopback host.

Risk depends on whether the optional server is running, network exposure and what sibling files exist. No network access, exploit request or server launch was performed. Claude should review resolved-path containment, malformed-request handling and local-only binding before relying on this tool as a confinement boundary.

### LOW-RISK

#### L1 — AI observation history is not associated with target identity

**Evidence: CONFIRMED (source); gameplay effect SUSPECTED.**

Files: `src/game/controllers.js:142`, `:204`; `src/game/battle.js` (target assignment).

Observed: observation history stores state, state frame, distance and form but no target identity. The delayed sample can therefore describe the old target after `f.target` changes. Reaction keys use attack start frames, not fighter identity. The inspected controller does not reset that history when the target changes.

Possible effect: brief inappropriate reactions or a collision between reaction keys during party or group fights. No failing combat encounter was reproduced. Test a target switch between two fighters in different attack states before deciding whether a change is needed. This is not evidence that all AI reacts unfairly.

#### L2 — Timing contracts differ across prompts, missions and simulation

**Evidence: CONFIRMED (source); noticeable low-frame-rate impact SUSPECTED.**

Files: `src/game/mission.js:267` (`_updatePrompts`), `src/game/battle.js:1132` (`update`).

Observed: prompt elapsed time increments by 1/60 per mission update, while updates occur per rendered frame. Mission time uses frame delta, battle simulation uses fixed ticks, and battle catch-up discards its accumulator after reaching a maximum of five steps. Cinematic holds use wall time as detailed in M3.

Risk: hint dwell time depends on render rate, and severely slow rendering can separate mission timers from simulation progress. The step cap is a deliberate responsiveness tradeoff, not inherently a defect. Validate 30/60/120 Hz, brief stalls and low-frame-rate mission limits rather than changing it blindly.

#### L3 — Documentation presents multiple incompatible “current” states

**Evidence: CONFIRMED against inspected source and runtime registry.**

Files: `HANDOFF.md:29`, `:611`, `:639`; `README.md` (project structure/roadmap); `STATUS.md` (older gap lists); `src/data/story.js`, `src/core/save.js`, `src/core/audio.js:354`, `tests/sim-tests.js`.

Examples:

- HANDOFF's current summary lists 52 missions, 20 Namek missions, 101 scenes and 16 stages; the loaded snapshot has 53, 21, 109 and 17.
- README's structure still labels the save implementation “v2 slot + v1 import”; current code writes v3 and imports v2/v1.
- README's roadmap describes Zarbon, Ginyu and Frieza as next, despite registered missions already extending through Buu.
- HANDOFF's “Not implemented” list includes Namek onward, playable Great Ape and tournaments, conflicting with its own later records and the loaded systems.
- Older STATUS gap tables say `beamFire` is absent; the cue exists at `src/core/audio.js:354`.
- Documentation cites a historical 522-test run, while `tests/sim-tests.js` now includes `playtest4-tests.js`. This audit did not run the suite and does not assert a new passing count.

Historical sections can remain valid as history. The risk is readers mistaking unlabeled stale summaries for today's state. Recent source changes may simply await Claude's documentation pass. No documentation was corrected.

## INFORMATIONAL

### Mission routing and checkpoints

Files: `src/data/story.js`, `src/ui/screens_menu.js`, `src/ui/screens_battle.js`, `src/main.js`, `src/game/mission.js`, `src/core/save.js`.

Canon routing is centralized in chapter order. Already-cleared missions remain selectable after new missions are inserted, and What-If uses a separate progress track. Canon result navigation carries mission focus and can choose the next unlocked mission. These are useful protections, not findings to undo.

Checkpoints store an in-memory phase index. A retry rebuilds a battle and calls mission setup with that index; it is not a serialization of the previous battle. Mission flags, party roles, forms, alive/dead state, scenery and locks must be reconstructed by each mission. The save schema does not persist the current checkpoint, and the quit UI explicitly warns that mission progress will be lost. This is an observed boundary, not automatically a violation of the specification.

The universal checkpoint sweep in `tests/sim-tests.js:2653` advances four seconds, skips scenes and accepts running, success **or failed** states. It proves startup smoke coverage, not completion or full story-state equivalence from every checkpoint. Specialized tests strengthen several missions; their existence does not make the universal sweep exhaustive.

### Cinematic and character/form contracts

Files: `src/game/cinema.js`, `src/game/mission.js`, `src/game/fighter.js`, `src/game/controllers.js`, `src/data/story.js`.

Scene finalizers are the shared watched/skipped end-state mechanism. They are not automatic snapshots of every mutation in an event callback; each scene author must supply its guarantees. Explicit cleanup callbacks are available for disposal. M3 and M4 identify limitations at these boundaries.

Forms update the model, aura, multipliers and form-specific pose library. AI rereads its profile on a form-index change. `applyForm` is a low-level setter rather than a story authorization boundary. The chronology table applies locks to fighters present at mission start. Its protection should not be assumed to validate arbitrary later spawns or direct calls to `applyForm`; no existing late-spawn chronology failure is asserted here.

Party switching, Body Change, story staging and developer overrides all manipulate overlapping state. The audit reproduced a developer-override problem (M2); it did not establish a new Body Change bug. Body Change and Namek content were not altered.

### AI/combat coverage and balance limits

Files: `src/game/rules.js`, `src/game/fighter.js`, `src/game/controllers.js`, `src/game/battle.js`, `src/game/techniques.js`, `src/data/schema.js`.

The inspected design includes combo scaling, guard/vanish windows, group-stun escape, melee/ranged attack tokens, difficulty profiles, boss/character hooks, committed-ultimate armor and form-specific combat kits. Technique registration provides state handlers and exit handlers rather than requiring an entirely separate fighter system.

No new damage-formula, projectile collision or boss-balance defect was established by this focused review. Character schema validation reported no problems; that does not verify every state transition or prove the game's balance. CPU-vs-CPU outcomes and bots cannot substitute for the owner's human retest.

One specification question remains: MASTER_SPEC §10 describes difficulty through decision-making rather than statistics, while `Mission.DIFF_RULES` in `src/game/mission.js` also changes damage multipliers (easy player 1.3/enemy 0.6; very hard player 0.9/enemy 1.4). This is a confirmed difference requiring Claude's interpretation of the intended story difficulty policy, not an instruction to rebalance it.

### Audio lifecycle and future voice support

Files: `src/core/audio.js`, `src/core/music.js`, `src/core/voice.js`, `src/game/fighter.js`, `src/game/battle.js`.

Loop handles, fighter exit cleanup, battle silence and teardown are useful existing safeguards. M1 concerns global mute state, not a claim that the earlier charge-loop fix is absent.

The voice module is explicitly a provider hook with no shipped recordings. Its provider interface exposes play but no pause/stop/dispose lifecycle. This is a future integration requirement if voice packs are added, not a current “missing voice” bug or a request to obtain assets. Crash recovery also merits an eventual real-audio check: `App.crash` stops simulation but leaves teardown until recovery.

### Performance and GLB/model pipeline

Files: `src/game/battle.js:1299`, `src/render/vfx.js`, `src/game/model_glb.js`, `src/render/glb.js`, `tools/glb_check.js`, `assets/models/README.md`.

Particle arrays are pooled and afterimage count is bounded. Fighter separation checks pairs; AI and targeting scan fighters/projectiles/props, and effects still allocate vectors and ghost geometry. These are scaling risks for larger encounters, not measured current frame-rate failures.

Imported afterimages bake skinned vertices on the CPU. The model README already estimates substantially higher bake cost at production vertex counts; its mannequin measurements must not be presented as proof of production-model performance. The checker reports budget overruns as warnings. Profile realistic approved models only when available; this audit introduced no asset.

The GLB reader deliberately has a limited support surface and reports unsupported features. Base-color textures, skinning, rig mapping, retargeting and embedded clips have existing tests. Facial morphs, hair swaps, hand shapes, cloth and several material maps remain documented limitations. No claim is made that production characters can already replace procedural bodies without these conventions. M8 is the concrete lifecycle issue found.

### Test and developer-tool assessment

Files: `tests/run-tests.js`, `tests/headless.js`, `tests/sim-tests.js`, `tests/playtest2-tests.js`, `tests/playtest3-tests.js`, `tests/playtest4-tests.js`, and the Cell/Buu test files.

Strengths: real shared simulation code, deterministic seeds, behavior-oriented assertions, character/schema checks, checkpoint starts, watched/skipped comparisons, mission bots, and model-pipeline coverage. Loading gameplay scripts from `index.html` helps the headless runtime follow the current registration order.

Limits relevant to these findings:

- The normal headless loader excludes `src/main.js` and UI screens; selected tests load particular UI files separately. App transitions are not automatically covered by combat tests.
- WebGL, DOM behavior and Web Audio are replaced or stubbed. Audio bookkeeping is testable; actual sound, shader output and GPU memory need browser checks.
- Headless `clearTimeout` is a no-op, `setInterval` does not schedule, and the default frame advances exactly 1/60 second. Timer cancellation, music sequencing and frame-rate variability cannot be inferred from a green simulation suite.
- Default bot runs skip scenes; explicit watched runs are a stronger but selective check.
- The universal checkpoint smoke test checks finite x/y position and health, not z, and accepts failed state. A pass is narrower than complete replay parity.
- Existing developer-mode tests validate a single current player and slot switching separately, explaining why H1/M2 need combined-transition coverage.

The optional local server was inspected, not started. Graphify commands were not used because its query-cache output could violate the user's one-file-only constraint; no graph/index was updated.

## QUESTIONS FOR CLAUDE

1. Should toggling Developer / Test Mode during a battle force a return to menus, defer the switch, or retain a battle-owned save destination? Which rule prevents H1 while keeping testing convenient?
2. Which service should own reset of global loop mute and music ducking when a paused battle is replaced?
3. Should developer overrides attach to the controlled fighter, or be reversible state owned by the battle across all party members and body swaps?
4. Should all cinematic holds pause with simulation, including dialogue and moves? If some use real time intentionally, what is their explicit pause policy?
5. Should coroutine failures fail a mission, open app recovery, or provide a retryable error state? Who guarantees final cleanup when a generator stops?
6. Is the shared mission launcher expected to accept phase IDs, indices only, or both? How should it reject malformed values without recording progress?
7. What save-schema and future-version policy is intended, and how should nonpersistent storage or a failed write be shown to the player?
8. Are runtime-only checkpoints intentional for this prototype, and which canonical story-state fields should every reconstructed checkpoint guarantee?
9. What minimum viewport/aspect range should cinematic framing support?
10. Are story damage modifiers an intentional exception to MASTER_SPEC §10's difficulty principle?
11. Is the Round 4 source currently awaiting documentation? Which historical test count and human-playtest boundary should Claude publish next?
12. Before real GLB characters arrive, who owns textures, decoded images, skeleton resources and the afterimage performance budget?

## POTENTIAL FUTURE TASKS

These are proposed tasks for Claude to assess and prioritize. None was implemented, scheduled or started as gameplay work.

1. **First: protect real progression.** Reproduce H1 through the actual pause/settings UI on disposable test data; define save-destination ownership and cover completion, loss and free-battle results across mode changes.
2. **Transition cleanup pass.** Cover pause → quit/retry/new battle and party switch → developer mode off; assert audio state, damage overrides, form locks and scene state.
3. **Mission/cinema failure contracts.** Validate launch inputs, generator failure recovery, pause-aware timing and finalizer/cleanup behavior. Use existing content as regression material without expanding Namek.
4. **Save robustness pass.** Exercise malformed-but-checksummed payloads, future versions, quota/write failures and unavailable persistence, including user-visible feedback.
5. **Browser verification matrix.** Add or document focused checks for 4:3/square/16:9 framing, real loop/music behavior, pointer-lock transitions and timer cancellation. Separate results from human playtest claims.
6. **GLB lifecycle/performance proof.** Repeatedly load, render and dispose the existing original mannequin; check textures, skeletons and disposal before readiness. Keep production-scale testing conditional on approved assets.
7. **Developer server review.** Check path confinement and malformed input without external exposure; decide whether loopback binding is mandatory.
8. **Coverage refinement.** Strengthen checkpoint parity around the full cast and meaningful post-checkpoint behavior; add target-switch AI checks and variable-frame-rate probes if evidence warrants them.
9. **Documentation reconciliation by Claude.** Update current counts and stale roadmap/gap claims while preserving historical records and MASTER_SPEC authority.
10. **Owner retest.** Use the existing human-playtest checklists to judge combat feel, difficulty, shot readability and audio. No campaign expansion is proposed by this review.

## Verification record

| Local isolated probe | Observed result | What it does not prove |
|---|---|---|
| Developer-originated mission, switch off, call succeed | Real save contains the clear | Full UI/playthrough reproduction |
| Pause, dispose, start another battle | New battle unpaused; global loops still muted | Actual listening result |
| God mode, party control switch, disable | Former player retains zero damage-taken multiplier | Every cheat or body-swap combination |
| String phase ID passed to shared mission path | Immediate success and recorded clear | Ordinary menu supplies invalid phases |
| Synthetic generator throws | Logged, coroutine done, exception not propagated | Existing production scene currently throws |
| One-second cinematic wait, two paused seconds | Predicate expired; zero simulation frames advanced | Every scene's final state is incorrect |
| Checksum-valid save with version 999/story 42 | Invalid shape/version accepted | A current user's save has this shape |
| Two-shot at multiple aspects | 30-unit gap cropped at 4:3, square, portrait | Every actual story composition crops |
| Dispose GLB mannequin | 3 geometry events, 0 texture events | Measured GPU leak size |
| Server sibling path calculation | Sibling prefix passes containment check | A network exploit was attempted |
| Loaded character schema | 0 validation problems, 0 captured load errors | Current full test suite passes |

All probe saves existed only inside newly created in-memory Maps. No browser save, settings file, test file or asset was changed.

## File accounting and limits

**Documents directly consulted:** `MASTER_SPEC.md`, `HANDOFF.md`, `STATUS.md`, `README.md`, `CLAUDE.md`, `assets/models/README.md`.

**Source directly reviewed (full files or focused excerpts/search matches):**

- `index.html`; `src/main.js`.
- `src/core/namespace.js`, `settings.js`, `save.js`, `dev.js`, `audio.js`, `music.js`, `voice.js`.
- `src/game/battle.js`, `mission.js`, `cinema.js`, `fighter.js`, `controllers.js`, `rules.js`, `mechanics.js`, `techniques.js`, `projectiles.js`, `targeting.js`, `telemetry.js`, `model_glb.js`, `tournament.js`.
- `src/render/glb.js`, `vfx.js`, and aspect-setting search matches in `camera.js`.
- `src/data/story.js`, `schema.js`, `characters/test_dummy.js`, `missions/saiyan_raditz.js`, `missions/saiyan_training.js`.
- Two-shot call-site search matches in `src/data/missions/namek_frieza1.js`, `src/data/scenes/namek_arrival.js`, `src/data/scenes/namek_vegeta_end.js`; these were read only.
- `src/ui/screens_menu.js`, `screens_battle.js`, `screens_settings.js`.
- `tests/headless.js`, `run-tests.js`, `sim-tests.js`, `playtest2-tests.js`, `playtest3-tests.js`, `playtest4-tests.js`; test declaration searches in `cell-games-tests.js`, `buu-tests.js`, `buu-b-tests.js`, `feel-tests.js` (not full-file review of those suites).
- `tools/glb_check.js`, `tools/serve.js`.

**Additional runtime reads:** the 153 gameplay/vendor/data/asset scripts listed below were read by the existing headless loader from `index.html`. Runtime loading is not a claim that every line or mission was manually audited. A separate integrity scan read the bytes of the 351 pre-existing files for hashes; that too is not semantic review.

**Files created:** exactly `planning/ASTRA_REVIEW.md` (this file).
**Existing files modified:** none by this audit.
**Intentionally not modified:** all `src/`, gameplay/character/mission/cinematic/AI/combat systems, Namek content, all `tests/`, `MASTER_SPEC.md`, `HANDOFF.md`, `STATUS.md`, `README.md`, assets, tools, frozen builds and graph output.
**Namek:** untouched; no Namek development, corrections or content changes.
**Tests:** not modified or added; full suite not run.
**Other constraints:** no Git/GitHub operations, dependency installation, downloads, external assets, remote connectors, uploads or server/browser launch.

**Integrity verification:** SHA-256 comparison before and after the audit write found all **351 pre-existing files unchanged**, with no missing files. The only added file was **planning/ASTRA_REVIEW.md**. The planning directory was created solely to hold this authorized file. The baseline was captured before the in-memory probes and before any project write.

### Runtime-loaded file inventory

- `vendor/three.min.js`
- `src/core/namespace.js`
- `src/core/settings.js`
- `src/core/voice.js`
- `src/core/save.js`
- `src/core/dev.js`
- `src/core/input.js`
- `src/core/audio.js`
- `src/core/music.js`
- `src/render/toon.js`
- `src/render/renderer.js`
- `src/render/camera.js`
- `src/render/vfx.js`
- `src/render/glb.js`
- `src/game/model.js`
- `src/game/model_glb.js`
- `assets/models/test_dummy.glb.js`
- `src/game/animator.js`
- `src/data/hair.js`
- `src/data/poses_common.js`
- `src/data/characters/goku.js`
- `src/data/characters/vegeta.js`
- `src/data/characters/bardock.js`
- `src/data/characters/frieza_force.js`
- `src/data/characters/raditz.js`
- `src/data/characters/piccolo.js`
- `src/data/characters/kid_gohan.js`
- `src/data/characters/other_world.js`
- `src/data/characters/saibaman.js`
- `src/data/characters/z_fighters.js`
- `src/data/characters/saiyan_allies.js`
- `src/data/characters/nappa.js`
- `src/data/characters/great_ape.js`
- `src/data/characters/namek_force.js`
- `src/data/characters/namek_locals.js`
- `src/data/characters/zarbon.js`
- `src/data/characters/future_trunks.js`
- `src/data/characters/cold_force.js`
- `src/data/characters/androids_gero.js`
- `src/data/characters/androids_pair.js`
- `src/data/characters/cell.js`
- `src/data/characters/cell_junior.js`
- `src/data/characters/chichi.js`
- `src/data/characters/teen_gohan.js`
- `src/data/characters/adult_gohan.js`
- `src/data/characters/great_saiyaman.js`
- `src/data/characters/buu_kids.js`
- `src/data/characters/videl.js`
- `src/data/characters/satan_city.js`
- `src/data/characters/tournament_cast.js`
- `src/data/characters/kai.js`
- `src/data/characters/babidi_force.js`
- `src/data/characters/ginyu_force.js`
- `src/data/characters/test_dummy.js`
- `src/data/stages.js`
- `src/data/dialogue.js`
- `src/data/unlocks.js`
- `src/game/rules.js`
- `src/game/mechanics.js`
- `src/game/controllers.js`
- `src/game/fighter.js`
- `src/game/techniques.js`
- `src/game/radial.js`
- `src/game/targeting.js`
- `src/game/telemetry.js`
- `src/game/projectiles.js`
- `src/game/clash.js`
- `src/game/stage.js`
- `src/game/creature.js`
- `src/game/battle.js`
- `src/game/mission.js`
- `src/game/cinema.js`
- `src/game/tournament.js`
- `src/data/schema.js`
- `src/data/missions/prologue_bardock.js`
- `src/data/missions/prologue_ending.js`
- `src/data/missions/saiyan_raditz.js`
- `src/data/missions/saiyan_training.js`
- `src/data/missions/saiyan_snakeway.js`
- `src/data/missions/saiyan_arrival.js`
- `src/data/scenes/saiyan_saga.js`
- `src/data/missions/saiyan_nappa.js`
- `src/data/missions/saiyan_vegeta.js`
- `src/data/missions/whatif_piccolo.js`
- `src/data/missions/namek_hunted.js`
- `src/data/scenes/namek_prince.js`
- `src/data/missions/namek_vegeta.js`
- `src/data/missions/namek_zarbon.js`
- `src/data/missions/namek_rematch.js`
- `src/data/missions/namek_guru.js`
- `src/data/missions/namek_guldo.js`
- `src/data/missions/namek_recoome.js`
- `src/data/scenes/namek_ginyu.js`
- `src/data/missions/namek_ginyu_pair.js`
- `src/data/missions/namek_ginyu.js`
- `src/data/missions/namek_frog.js`
- `src/data/missions/frieza_cinematics.js`
- `src/data/scenes/namek_nail.js`
- `src/data/missions/namek_nail.js`
- `src/data/missions/namek_frieza1.js`
- `src/data/scenes/namek_arrival.js`
- `src/data/scenes/namek_kaioken.js`
- `src/data/scenes/namek_gohan_rage.js`
- `src/data/missions/namek_gohan_frieza2.js`
- `src/data/missions/namek_frieza2.js`
- `src/data/scenes/namek_vegeta_end.js`
- `src/data/missions/namek_goku.js`
- `src/data/scenes/namek_kaioken20.js`
- `src/data/missions/namek_kaioken20.js`
- `src/data/scenes/namek_spirit_bomb.js`
- `src/data/missions/namek_vegeta_end.js`
- `src/data/scenes/namek_super_saiyan.js`
- `src/data/scenes/namek_rage.js`
- `src/data/missions/namek_spirit_bomb.js`
- `src/data/scenes/namek_destruction.js`
- `src/data/missions/namek_super_saiyan.js`
- `src/data/missions/namek_end.js`
- `src/data/scenes/namek_aftermath.js`
- `src/data/missions/namek_aftermath.js`
- `src/data/scenes/android_arrival.js`
- `src/data/missions/android_trunks.js`
- `src/data/scenes/android_warning.js`
- `src/data/missions/android_warning.js`
- `src/data/scenes/android_nineteen.js`
- `src/data/missions/android_nineteen.js`
- `src/data/scenes/android_fever.js`
- `src/data/missions/android_fever.js`
- `src/data/scenes/android_lab.js`
- `src/data/missions/android_lab.js`
- `src/data/scenes/android_road.js`
- `src/data/missions/android_road.js`
- `src/data/scenes/cell_first.js`
- `src/data/missions/cell_first.js`
- `src/data/scenes/cell_absorb.js`
- `src/data/missions/cell_semi.js`
- `src/data/missions/cell_perfect.js`
- `src/data/scenes/cell_games.js`
- `src/data/missions/cell_games.js`
- `src/data/scenes/buu_era.js`
- `src/data/missions/buu_years.js`
- `src/data/missions/buu_saiyaman.js`
- `src/data/missions/buu_kids.js`
- `src/data/scenes/buu_tournament.js`
- `src/data/missions/buu_flight.js`
- `src/data/missions/buu_junior.js`
- `src/data/missions/buu_spopovich.js`
- `src/data/missions/buu_kibito.js`
- `src/data/scenes/buu_babidi.js`
- `src/data/missions/buu_pursuit.js`
- `src/data/missions/buu_ship.js`
- `src/data/scenes/buu_majin.js`
- `src/data/missions/buu_majin.js`
- `src/data/story.js`
