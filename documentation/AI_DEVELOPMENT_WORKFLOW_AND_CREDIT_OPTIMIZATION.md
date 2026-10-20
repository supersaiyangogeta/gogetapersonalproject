# SAIYAN LEGACY — AI DEVELOPMENT WORKFLOW AND CREDIT OPTIMIZATION

Use **one bounded task, one verification owner, and one resumable handoff** per session. The current priority is new Dragon Ball Super content. Section 5 records the supplied movie assessment, the owner's playtesting feedback, and the deferred polish backlog. Weekly usage was roughly 74% at the initial request; check the current allowance before choosing the next implementation slice.

I have not inspected game source or run game tests. The current-state information in section 5 comes from the assessment supplied by the owner and the owner's own playtesting report. The remaining main-story roadmap is provisional until its relevant project reports and code are checked.

## 1. Recommended instruction-file architecture

Give each document one responsibility:

| File | Owns | When Claude should read it |
|---|---|---|
| `CLAUDE.md` | Permanent rules, document navigation, reuse requirements, verification honesty, session boundaries | Every session |
| `MASTER_SPEC.md` | Approved game vision, required behavior, architectural constraints, campaign structure, quality expectations | Relevant sections when implementing or changing requirements |
| `HANDOFF.md` | Current work package, incomplete work, settled decisions, verification state, exact next action | Every session; replace stale handoff content |
| `STATUS.md` | Current feature inventory and evidence of implementation/verification | Short summary plus affected rows every session |
| Saga plans | Mission sequence, characters, cinematic beats, dependencies, acceptance criteria | Only the assigned saga or campaign |
| `README.md` | Installation, startup, controls, ordinary project usage | Setup, environment changes, or relevant instructions |
| Optional technical references | Exact testing commands; reusable-system entry points; significant architectural decisions | Only when relevant |

For `STATUS.md`, separate **implementation**, **automated verification**, **browser verification**, and **human playtesting**. A source file existing is insufficient evidence that its feature works.

Create technical references only where existing documents lack that information. Two useful candidates are:

- `docs/TESTING.md`: supported commands, filtering capabilities, environment requirements, browser procedures, and coverage limitations.
- `docs/SYSTEMS.md`: a compact map of each reusable system, its entry points, and one representative existing mission. Avoid copying implementation details.

Keep command definitions in one place and link to them elsewhere. Likewise, `STATUS.md` owns durable completion evidence; `HANDOFF.md` records the active session’s partial, pending, or stale verification.

Aim for approximately 30–50 lines in the root file. Use ordinary document references rather than automatically importing every long document: Anthropic documents that `@path` imports load into context at startup, so splitting instructions into imports does not reduce their context cost. [Claude Code memory documentation](https://code.claude.com/docs/en/memory)

Suggested root `CLAUDE.md`:

```markdown
# Saiyan Legacy — Development Rules

- Preserve the existing browser-based Three.js architecture and working features.
- At session start, read HANDOFF.md, the STATUS.md summary and relevant entries, and the current implementation brief.
- Read only relevant MASTER_SPEC.md sections, saga plans, and technical references. Expand exploration when evidence requires it.
- MASTER_SPEC.md defines intended behavior; STATUS.md records current evidence; HANDOFF.md defines continuation work. Resolve discrepancies against source and verification.
- Before implementing a mechanic, inspect its existing implementation and a representative consumer. Extend working systems before adding alternatives.
- Work within the brief. Avoid unrelated refactors, speculative frameworks, and expanding content beyond the agreed slice.
- Proceed with routine edits and documented checks within scope. Ask only when a material ambiguity, scope change, or action requiring authorization blocks progress.
- Use repository-supported verification commands. Choose checks according to risk and affected behavior.
- Before running tests, check for an active run or reusable evidence covering the same source state and scope.
- Record the exact verification command or browser scenario, tested source state, result, and limitations.
- Distinguish implemented, automated-verified, browser-verified, and human-playtested. Never claim checks passed unless they completed successfully.
- Keep updates brief: scope decisions, blockers, significant findings, and verification outcomes.
- Update affected STATUS.md entries and HANDOFF.md before ending. Update requirements or technical references only when their contents changed.
- When usage is low, finish a safe stopping point and preserve an actionable checkpoint before starting more work.
```

## 2. Practical session workflow

1. **Start from the checkpoint.** Read the documents above, then establish the current working state and changes since the last tested snapshot. Preserve unrelated edits.
2. **Confirm reuse and scope.** Locate the relevant implementation, a working example, and its tests. Search narrowly first. Record discoveries so the next session does not repeat them.
3. **Choose a finishable slice.** Specify observable completion criteria and the verification needed. Reserve capacity for debugging, documentation, and handoff.
4. **Implement at meaningful boundaries.** Complete a coherent behavior, check it, then continue. Avoid tests after every edit and avoid assembling an entire saga before checking anything.
5. **Verify the final source state.** Reuse valid evidence; run missing or invalidated checks. Investigate failures without suppressing them or weakening assertions merely to obtain a pass.
6. **Close the work package.** Update affected documents and give a short report: behavior delivered, actual verification, remaining gaps, and next action.

Scale the process by risk:

| Change | Planning and execution |
|---|---|
| **Small change** | Inspect affected files and immediate consumers; use a short plan only if needed |
| **Major feature** | Identify dependencies; complete one playable slice before expanding missions, phases, or variations |
| **High-risk architecture** | Map affected consumers and compatibility requirements; establish a relevant baseline and rollback point; change incrementally |

Shared combat, transformation state, fusion ownership, campaign progression, save formats, and common cinematic orchestration can qualify as high risk.

To control usage:

- Stop discovery once you can identify the extension point, dependencies, and verification.
- Keep successful test output summarized; retain failure details needed for diagnosis.
- Report decisions and blockers instead of narrating every file read.
- Continue routine authorized work without repeated approval requests.
- Use additional agents selectively for bounded independent work. Their requests also consume Claude usage, so parallelism is not automatically cheaper. [Claude Code cost documentation](https://code.claude.com/docs/en/costs)
- Resume a session for the same task; use a fresh session plus the handoff when switching to unrelated work.

## 3. Reusable implementation brief

Fill in known references. If an entry point is unknown, ask Claude to locate the existing implementation within the relevant subsystem.

```text
Implement: [mission / character / boss / transformation / cinematic / system]

Objective:
[Observable player-facing outcome.]

Inspect and reuse:
[Relevant saga/spec sections, existing systems, and closest working example.]

Scope:
[Included behavior.]
Exclude: [Unrelated content, refactors, or systems.]

Complete when:
[2–4 observable criteria, including relevant failure/retry behavior.]

Verification:
[Existing targeted checks and required integration/browser scenarios.]
Confirm supported commands first. Report unsupported or deferred checks explicitly.

Documentation:
Update affected STATUS.md entries and HANDOFF.md.
Update saga/spec/reference documents only where their content changes.

Final report:
Delivered behavior; changed files; checks and tested source state;
known gaps or failures; documentation updated; exact next action.

Proceed with routine implementation and verification within this scope.
```

## 4. Testing policy

No game tests were run while preparing or updating this document. The supplied assessment identifies `node tests/run-tests.js` as the existing full-suite command; its reported results are recorded in section 5. When reviewing project evidence, distinguish:

- **Repository-defined:** found in scripts, configuration, or documented tooling.
- **Execution-verified:** actually ran, with its outcome recorded.
- **Suggested:** a practice or capability that has not been confirmed.

Do not assume particular runners, filtering flags, browser automation, debug routes, or locking mechanisms exist.

| Verification | When to use it |
|---|---|
| **Targeted tests** | Changed logic and relevant edge cases; during coherent implementation steps |
| **Integration tests** | Interactions between systems: mission progression, transformation/combat state, boss phases, cinematic handoffs, or saves |
| **Build/static checks** | When supported and affected by the change; follow existing project requirements |
| **Full suite** | Final boundary for high-risk shared changes, release/milestone gates, or unclear regression scope |
| **Browser smoke tests** | Changed rendered behavior, controls, transitions, assets, and playable flows |
| **Human playtesting** | Combat feel, difficulty, pacing, cinematic clarity, readability, and performance |

For major features, use targeted checks during development and integration checks after assembly. Run the full suite when shared impact or the project’s milestone policy requires it—not automatically after every mission edit.

If relevant automated coverage is absent, report the gap. Add a focused regression test where supported and valuable; otherwise use an explicit manual verification scenario.

**Prevent duplicate runs**

Before launching a full suite, check for an existing run and evidence covering the same source state. Assign one verification owner. Other sessions should reuse its result rather than launch another suite.

A manual “verification running” entry in the handoff is a suggested coordination practice; it does not imply the repository already supports automatic locking.

If the full suite already includes targeted checks, do not repeat those checks afterward on unchanged source without a diagnostic reason.

**Tie results to source**

Record:

`command/scenario | source snapshot | scope | outcome | limitations`

A commit identifier alone does not identify uncommitted changes. Include the relevant working changes or another reproducible snapshot identifier.

Keep the tested source stable during a run. If relevant source changes mid-run, mark coverage uncertain and rerun affected verification.

After a passing result:

- Rerun checks affected by subsequent edits.
- Rerun broader integration or full-suite gates when shared contracts changed or required by policy.
- Retain unaffected evidence with a brief explanation.
- Documentation-only changes ordinarily preserve runtime evidence.

**Use focused browser scenarios**

Verify the changed flow and its affected regressions once against the final relevant build. Include entry, interaction, completion, and defeat/retry where applicable. Check save/resume when progression or persistence changed.

An existing debug shortcut may reach an encounter quickly, but it does not prove ordinary campaign access or unlock behavior. Verify those separately when affected.

A smoke test establishes basic operation; human playtesting remains necessary for game quality.

## 5. Proposed roadmap and checkpoint

**Current priority: new content**

The owner wants to move on to new content now. Cell Games rework and Broly presentation polish are deferred. Preserve these requests in the backlog; address them during new-content work only if a specific issue blocks that work or the owner explicitly changes priorities.

**Latest Universe 6 checkpoint — supplied report, 11 October 2026**

- “The Pride of Sadala” (Vegeta versus Cabba) is reported implemented as Chapter 17, after Battle of Gods and before End of Z. It includes the arena/roster opening, base fight, provocation, awakening, flurry, Super Saiyan fight, scripted Blue lesson, ring-out, and aftermath. Defeat and retry are supported in the fights.
- Cabba and his Super Saiyan form, the Nameless Planet arena, and story-only Universe 6 cast were added. Models are reported rough first-pass versions. Cabba and the arena unlock in Free Battle after the encounter.
- The report states that fresh-save End of Z access now waits for this mission; an existing End of Z clear remains accessible. These campaign gates require preservation and relevant regression checks during subsequent progression work.
- Targeted tests passed 7/7. The author reports full-scene bot coverage and six extra successful seeds, with Vegeta ending at 9–69% health. Browser inspection covered every phase through screenshots, not every animation frame. The owner has not yet playtested this new mission; balance and visual approval remain open.
- Other reported missing matches are Goku versus Botamo/Frost, Piccolo versus Frost, Vegeta versus Frost/Magetta, and Vegeta versus Hit. This is one implemented encounter, not a completed Universe 6 arc. Check the approved plan for all remaining rounds and any additional matches.
- Hit's hands are reported resting at his coat rather than clearly inside his pockets. Keep this as a presentation limitation rather than assuming it is finished.
- Test runs left the encounter marked cleared in the in-app browser's save. Use existing supported replay or a separate test save when checking first-clear behavior; do not erase the owner's progress.
- The report identifies Resurrection of F as unbuilt, preceding Universe 6 in the approved spec, and containing Vegeta's first Blue milestone. The current Cabba scene uses a scripted one-second Blue flash; Blue remains locked as a playable main-story form. This preview does not complete the missing prerequisite arc or its unlock milestone.

**Current movie evidence, supplied by the owner**

- The assessment reports all ten Broly `bb_*` missions implemented and completable by bots, across nine film parts. Optional Movie 2 challenges are reported unbuilt and outside the film's scope.
- The owner has playtested both Broly and the Janemba/Fusion Reborn movie. This supersedes the assessment's statement that no human playtesting had happened. Exact playtest coverage and quality sign-off are unspecified.
- Bot completion, browser smoke checks, and owner playtesting are separate evidence. The reported implementation status does not resolve the presentation issues below or establish that every quality criterion has been accepted.

**Deferred owner feedback**

- Cell Games: rework Cell's awkward running return, make the Trunks killing visually clear, and finish Trunks's armor.
- Broly/Gogeta: improve fight length and close-range choreography; reduce the hovering above Broly; include the intended SSJ Gogeta counter and SSB Gogeta energy-ball deflection/toss with “It's futile!” timed to that moment rather than the current punch-dodging presentation.
- These are recorded requests for later work, not changes made in this planning update.

**Current verification evidence**

The older 799-pass/2-failure snapshot and the missing full-suite coverage of the final Broly edits are superseded by the latest reported run. The Universe 6 author checked for other active runs, then ran `node tests/run-tests.js` once on stable source including the final Broly changes. It took 31 minutes and produced **808 passed, 1 failed**. This closes the earlier missing-coverage gap for those Broly changes; it is not a completely passing full-suite result.

The failure was an introduced end-of-mission title containing “(in development)”. The reported correction changed the title to name the existing next mission, “Ten Years Later”. After that change, the affected test file passed **27/27**, Universe 6 tests passed **7/7**, and fast checks passed **51/51**. The full suite was not rerun after the title fix. Do not combine these overlapping counts or state that the complete final-source suite passed.

A repeat 31-minute run is not automatically needed for a title-only correction if the actual diff confirms it was the only post-run change, the affected assertion covers it, and no repository policy requires a new clean full-suite run. If other source changes occurred, reassess their verification impact. Record the full-run snapshot separately from the post-fix targeted results; the exact reproducible source identifier must come from the repository's handoff or revision evidence.

Existing reported facilities include `node tests/run-tests.js`, `tests/universe6-tests.js`, `tests/super-broly-tests.js`, Developer Menu phase lists, the playtest checklist in `STATUS.md`, and tuning parameters such as `SL.data.bbVampa.VP` and `bbFusion.FU`. The exact fast-mode invocation was not supplied. No new testing tooling is proposed.

For the next feature, use supported targeted and integration checks plus relevant browser scenarios. Run another full suite when new shared-system changes, uncertain regression scope, or an explicit repository gate requires it. Check active runs and reusable evidence first. Do not repeat the obsolete “close the Broly gap” task or impose a full run after every content edit. Keep progress reporting sparse during long runs and collect their final results without repeated implementation changes to the tested source.

**Recommended main-story order**

The earlier Universe 6 → Future Trunks → Tournament of Power list was incomplete relative to the newly reported spec prerequisite. A list of target milestones is not authorization to omit required earlier story arcs. The recommendation is now **Resurrection of F → remaining Universe 6 progression → Future Trunks/Fused Zamasu → Tournament of Power**, subject to the owner's chosen priority and confirmation of the relevant project requirements. Preserve the implemented Cabba encounter. Future Trunks and Tournament of Power implementation status remains unknown here.

| Order | Milestone | Dependency gate |
|---|---|---|
| **0** | Select the next new-content slice | Check only relevant status entries, saga plans, registration/progression wiring, and reusable-system consumers. Expand the check only when discrepancies or dependencies require it |
| **1** | Resurrection of F | Confirm the approved plan and required story entry/transformation milestones; implement one complete new playable slice with affected progression and unlock checks |
| **2** | Remaining Universe 6 progression | Preserve Cabba; check and complete spec-required earlier rounds and progression before treating Vegeta versus Hit as the next chronological campaign milestone |
| **3** | Future Trunks / Fused Zamasu | Validate required fusion behavior, boss phases, and cinematic-to-combat transitions before expanding encounters |
| **4** | Tournament of Power | Prove the planned team, elimination, arena, progression, and performance behavior in a small playable encounter before expanding the tournament |
| **Deferred separate track** | Broly movie campaign | Preserve its reported implementation and the owner's playtest feedback. Resume polish or optional challenges only when prioritized; verify affected movie flows after shared-system changes |

Broly should remain its own campaign. Its development can benefit from shared fusion or boss work without making it a main-story progression dependency.

Use this dependency pattern:

**Existing-system inspection → missing required behavior → representative playable encounter → content expansion.**

Avoid building a universal framework before proving its need. Cinematic fusion may need less infrastructure than playable fusion; Universe 6 round progression may supply only part of Tournament of Power’s requirements.

Before finalizing the roadmap, Claude must check:

- Approved mission lists, roster, required forms, fusion behavior, cinematic beats, and tournament rules.
- Campaign registration, unlock gates, progression/save identifiers, placeholders, and actual encounter wiring.
- Existing implementations and representative consumers for every proposed reusable system.
- Supported verification facilities, coverage gaps, failures, tested snapshots, and later edits.
- Missing assets, performance constraints, broken transitions, and unresolved playtesting feedback.
- Any prerequisite arcs required by `MASTER_SPEC.md` but absent from this goal list.

Do not mark a milestone complete solely because its plan or source files exist.

Suggested next Claude instruction:

```text
Prioritize new Dragon Ball Super content. I have playtested Broly and
Janemba/Fusion Reborn. Keep the recorded Cell Games and Broly/Gogeta
polish requests deferred unless a specific issue blocks the new work.

Use the approved Resurrection of F plan for the next new-content task.
Confirm its actual implementation status, prerequisites, story entry,
and transformation milestones from relevant reports and source.
Implement one complete playable mission or encounter from that plan;
do not expand into the whole saga in this session.

Preserve the implemented Cabba encounter and distinguish its scripted
Blue preview from a persistent main-story unlock. Make only progression
or gate adjustments needed by the new slice. Record the required remaining
Universe 6 rounds before treating Vegeta versus Hit as chronological next.

Reuse existing mechanics. Implement one complete playable slice with
observable completion and retry criteria; avoid unrelated refactors.

Use the latest handoff as the verification baseline. The final Broly edits
already received full-suite coverage: 808 passed, 1 title failure, followed
by passing affected checks after the title fix. Do not claim a clean final
full-suite pass or repeat the obsolete missing-Broly-coverage task.
Run supported targeted/integration checks and focused browser scenarios.
Run the full suite only when the new scope or a repository gate requires it;
check active runs and reusable evidence first. Rerun invalidated checks.

Update affected STATUS.md entries and HANDOFF.md with actual results,
tested source state, unresolved failures, and the next implementation step.
```

When usage is low or a session ends early, leave this checkpoint in `HANDOFF.md`:

```markdown
# Current Checkpoint

Objective and completion criteria:
[Current work package.]

Source state:
[Revision/branch if applicable; uncommitted and unrelated changes.]

Completed:
[Working behavior and changed files.]

Incomplete or broken:
[Precise gaps and known failures.]

Reuse and decisions:
[Entry points, representative examples, and settled choices.]

Verification:
[Exact commands/scenarios, snapshots, outcomes, and outstanding checks.]

Running processes:
[Test/server identity, result location, and how to retrieve or stop it.]

Resume here:
[Exact next action, relevant files/symbols, and ordered remaining steps.]

Documentation:
[Updated entries and links to longer evidence.]
```

Save current work and evidence. Commit only within the agreed workflow. If required verification remains unfinished, label the work accordingly and make that verification the next action.

## 6. Before-and-after checklist

Before each Claude session:

- [ ] One bounded objective and explicit exclusions.
- [ ] Current handoff and relevant status entries.
- [ ] Existing systems and closest working example identified.
- [ ] Required verification selected from supported capabilities.
- [ ] Capacity reserved for debugging and checkpointing.

After each Claude session:

- [ ] Final source matches the claimed verification evidence.
- [ ] Failures, deferred checks, and playtesting gaps are explicit.
- [ ] Affected status and planning documents are accurate.
- [ ] Handoff names the exact next action.
- [ ] Running tests and servers have a recorded disposition.
- [ ] Completion claims match the delivered behavior and evidence.
