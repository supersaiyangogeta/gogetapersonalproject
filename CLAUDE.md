# Saiyan Legacy — Development Rules

Detailed workflow reference: `documentation/AI_DEVELOPMENT_WORKFLOW_AND_CREDIT_OPTIMIZATION.md` (read when planning a session, choosing verification, or writing a checkpoint; not needed every session).

## Hard constraints
- Preserve the browser-based Three.js architecture (`index.html`, `src/`, `vendor/`). No engine migration (e.g. Unity), no restart, no new gameplay unless the brief asks for it.
- Never modify frozen builds: `builds/v0.1/`, `builds/v0.2/`, `builds/v0.3-backup-*`. The main folder is Version 0.3 (in development).
- Preserve existing working systems and uncommitted/unrelated edits. This folder is not a Git repository: no Git/GitHub operations, remote sync, or external asset downloads unless the owner explicitly asks.
- Work within the brief. No unrelated refactors, speculative frameworks, or content beyond the agreed slice.

## Navigating the docs (they are long — do not read them whole)
- `HANDOFF.md`: read the top "Newest" entries every session; jump to headings (`## How To Test`, `## Current Architecture`) only as needed.
- `STATUS.md`: read the header and the sections for the affected feature. It owns durable completion evidence.
- `MASTER_SPEC.md`: intended behavior. Use `## Contents` and read only relevant sections.
- `README.md`: running, controls, save slots. `planning/*.md`: read only the assigned plan (e.g. `BROLY_MOVIE_PLAN.md`).
- If documents disagree, check source and tests, then fix the wrong document.
- Use graphify (below) or targeted search before broad file browsing.

## Reuse before building
- Before implementing a mechanic, inspect its existing implementation and one representative consumer (e.g. a similar mission in `src/data/missions/`). Extend working systems; do not create parallel alternatives.
- Stop discovery once the extension point, dependencies, and verification are known.

## Verification (only repository-confirmed commands)
- Full suite: `node tests/run-tests.js` (slow). `node tests/run-tests.js --fast` skips engine/simulation tests.
- Dev server: `node tools/serve.js` (port 5173; launch config `saiyan-legacy` in `.claude/launch.json`). Other tools and browser checks: `HANDOFF.md` → `## How To Test`.
- Choose checks by risk. Run the full suite for high-risk shared changes (combat, transformations, fusion, progression, saves, shared cinematics) or milestones — not after every edit, and never for documentation-only changes.
- Before running tests, check whether valid evidence already covers the same source state.
- Never weaken assertions to get a pass. Never claim a check passed unless it completed successfully.
- Keep these levels distinct: implemented, automated-verified, browser-verified (by Claude), human-playtested. Only the owner can human-playtest.

## Session boundaries and handoff
- One bounded task per session. Reserve capacity for debugging, documentation, and handoff.
- Before ending: update affected `STATUS.md` entries and the top of `HANDOFF.md` with delivered behavior, changed files, exact checks run (command, source state, result), gaps, and the exact next action. Use the checkpoint template in the workflow document (section 5) when stopping early.
- Report briefly: decisions, blockers, verification outcomes. Do not start another task unasked.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
