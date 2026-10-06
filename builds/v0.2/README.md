# Dragon Ball: Saiyan Legacy — Version 0.2 ("Goku Showcase")

An unofficial, non-commercial 3D Dragon Ball fan game. It runs in your web browser, so there is nothing to install.

> Dragon Ball © Bird Studio / Shueisha, Toei Animation. This project is not affiliated with or endorsed by Bandai Namco, Toei Animation or Shueisha. See [Legal](#legal).

- **Detailed status of every feature:** [`STATUS.md`](STATUS.md)
- **Version 0.1 (first playable build):** preserved in [`builds/v0.1/`](builds/v0.1/) — double-click its `index.html` to play it.
- Development is local only: no git repository, nothing uploaded.

---

## How to play

1. Open the `saiyan-legacy` folder.
2. Double-click **`index.html`**. It opens in your browser (Chrome or Edge recommended; Firefox works).
3. Press any key.

**No internet needed.** The 3D engine (three.js r149) is included in `vendor/three.min.js`.

**What you do NOT need:** a game engine, Node.js, Python, a web server, or any build step. Everything is plain HTML, CSS and JavaScript.

### Why a browser game?

A browser game runs by double-clicking one file, can be tested automatically in a real browser, is plain text code that AI tools edit well, and uses three.js, a mature 3D engine. The trade-off: it cannot match the raw asset quality of Unreal Engine. The architecture (data-driven characters, a joint rig that matches standard humanoid skeletons, pluggable mechanics and AI hooks) is built so better models and animations can replace the prototype ones later without rewriting gameplay. See *How real assets can be added later* in `STATUS.md`.

---

## Controls

Every control can be changed in **Settings → Controls**. Button hints in the game always show your current bindings.

| Action | Keyboard & mouse | Controller |
|---|---|---|
| Move | W A S D | Left stick |
| Camera | Mouse (click the game to capture it) | Right stick |
| Jump / fly up | Space | A |
| Fly down / land | C | Left stick click |
| Boost (hold) / dash (tap with direction) | Left Shift | RT |
| Light attack | Left click or J | X |
| Heavy attack | Right click or K | Y |
| Ki blast (hold to charge) | E or L | B |
| Guard | F or I | LT |
| Dodge / vanish | Q or U | RB |
| Charge ki | R or O | Hold LB |
| Special 1 / Special 2 | 1 / 2 | LB + X / LB + Y |
| Ultimate | 3 | LB + B |
| Transform / power down | T / G | LB + A / LB + D-Down |
| Switch target | Tab | Right stick click |
| Pause | Esc or P | Menu |
| Training: reset positions | Backspace | View |

### Combat in one minute

- **Light ×2 → Heavy** launches the opponent. Press **Heavy** again to vanish after them and smash them down.
- **Light ×4 → Heavy** is a big knockback finisher.
- **Guard** blocks. Press guard *just before* a hit for a **Perfect Guard**: no damage and the attacker staggers.
- **Dodge** *just before* a hit to **vanish** behind the attacker.
- **Guard + Heavy** is a throw. Throws beat guarding.
- **Dodge** while stunned in a long combo bursts you free.
- Two beams that meet head-on start a **Beam Clash**. Mash the button shown (or switch to *Hold* in Settings).

### Goku's techniques (Version 0.2)

| Input | Result |
|---|---|
| Light → Heavy | **Flurry** — rapid multi-hit rush |
| Light ×3 → Heavy | **Meteor Crash** — vanishes above and axe-kicks down (10 ki) |
| Heavy while both of you are in the air | Aerial heavies: hammer, air upper, spin kick |
| Hold **1** | **Kamehameha** — three charge tiers; release to fire, steer with movement |
| **2** (+ direction) | **Instant Transmission** — neutral: behind · forward: in front with a strike · up (Space): above, next Heavy smashes · back: away. Repeated use costs more. |
| **1** right after Instant Transmission | **Instant Kamehameha** |
| **T** | **Kaioken**. Hold **Charge** in Kaioken to raise it to x3 and x4 (more power, more health drain). |
| **T** in Kaioken | **Super Saiyan** transformation event |
| Hold **3** | **Spirit Bomb** — the longer you hold, the bigger it gets. Release to throw. |

---

## What is in Version 0.2

| Area | Contents |
|---|---|
| Modes | Story, **What If?** (unlocks after Chapter 1), Free Battle, Training, Records, Settings |
| Story | **Prologue** *The Final Stand* (Bardock) · **Chapter 1** *A Brother From Space* (Goku + Piccolo vs Raditz) · Chapters 2–3 shown as "In Development" |
| What If | *What if Goku defeated Raditz?* — separate progress track, alternate ending |
| Playable | Goku (showcase), Vegeta, Bardock (Prologue unlock), Raditz (prototype, Chapter 1 unlock) |
| Story only | Piccolo (ally), Kid Gohan (cutscene), Frieza Force, Frieza |
| Stages | Rocky Wasteland, Planet Vegeta Orbit (Prologue unlock), Grassland Hills (Chapter 1 unlock) |

Everything above is described with honest status words (COMPLETE, FUNCTIONAL PROTOTYPE, PLACEHOLDER, PLANNED, BLOCKED BY ASSETS…) in [`STATUS.md`](STATUS.md).

**Character art is still PROTOTYPE / BLOCKED BY ASSETS.** Fighters are built in code from shapes with cel shading, rim light and ink outlines. They are recognizable but not detailed, sculpted, skinned models.

### Save data

Version 0.2 keeps its own save slot. The first time you start it, it copies your Version 0.1 progress; Version 0.1 progress itself is never changed. What-If progress is stored separately from the canon story.

---

## Testing

### Automated tests (developers only)

These need [Node.js](https://nodejs.org) — you do not need Node.js to play.

```bash
node tests/run-tests.js
```

47 tests: damage and combo math (including Kaioken level multipliers), guard chip, ki and stamina, beam clash balance, mission ranks, save round-trips, backup restore, corruption recovery, Version 0.1 save import, What-If save separation, settings presets and rebinding, schema validation of every character, story and What-If structure, Chapter 1 canon restrictions, unlock references.

### Combat Lab (in-game scenarios)

Open the game, open the browser console (F12) and run:

```js
const s = document.createElement('script'); s.src = 'tools/lab.js'; document.body.appendChild(s);
// after it loads:
SLLab.runAll().then(r => console.table(r));
```

37 deterministic scenarios press buttons on exact frames and check the result: the 20 Version 0.1 regression scenarios, 13 Goku showcase scenarios (Flurry, Meteor Crash, aerial heavies, Instant Transmission modes and fatigue, Instant Kamehameha, Kamehameha tiers, Kaioken levels, Super Saiyan event, Spirit Bomb growth, beam-vs-Spirit-Bomb clash, directional hit reactions) and 4 Chapter 1 scenarios (Raditz moves and story-locked techniques). Run only one group with `SLLab.runAll('V0.2')`.

### Other developer tools

- `tools/snap.js` — sets up training scenes, freezes moments and positions the camera for visual checks.
- `SL.dataProblems` — schema problems found at boot (empty = valid).
- `SL.debugAutopilot = 'hard'` — the CPU plays the player's fighter (soak tests).

---

## Project structure

```
saiyan-legacy/
├─ index.html              Entry point — double-click to play
├─ README.md               This file
├─ STATUS.md               Detailed version status, test results, asset workflow
├─ css/game.css            All interface styling
├─ vendor/                 three.js r149 (three.min.js) and its MIT licence
├─ builds/v0.1/            Frozen, playable copy of Version 0.1
├─ src/
│  ├─ core/                namespace, settings, save (v2 slot + v1 import), input, audio, music
│  ├─ render/              renderer, toon shading + rim light, camera, vfx (auras, beams, ghosts)
│  ├─ game/
│  │  ├─ model.js          Procedural character builder (faces, hands, springs)
│  │  ├─ animator.js       Pose animation, sequences, squash & stretch
│  │  ├─ rules.js          Pure combat math (unit tested)
│  │  ├─ mechanics.js      Character mechanics (Pride, Battle-Hardened, Ruthless, Regeneration…)
│  │  ├─ fighter.js        Shared combat state machine (all V0.2 move/special/form features)
│  │  ├─ controllers.js    Player input, CPU AI, AI hooks registry (Goku)
│  │  ├─ projectiles.js    Ki blasts, beams, Spirit Bomb
│  │  ├─ clash.js          Beam clashes and beam-vs-Spirit-Bomb clashes
│  │  ├─ stage.js          Terrain, trees, destruction, sky mood
│  │  ├─ battle.js         A fight: flow, targeting, feedback, cinematic shots, barks
│  │  └─ mission.js        Story mission runner
│  ├─ data/
│  │  ├─ characters/       goku, vegeta, bardock, raditz, piccolo (+ kid gohan), frieza_force
│  │  ├─ missions/         prologue_bardock.js, saiyan_raditz.js (canon + What-If)
│  │  ├─ story.js          Canon timeline and What-If branch list
│  │  ├─ schema.js         Character schema validator
│  │  ├─ hair.js, poses_common.js, stages.js, dialogue.js, unlocks.js
│  ├─ ui/                  Menus, story / What-If screens, HUD, settings, results
│  └─ main.js              App loop and screen flow
├─ tests/run-tests.js      Node unit tests
└─ tools/
   ├─ lab.js               Combat Lab scenarios
   ├─ snap.js              Visual check helper
   ├─ viewer.html          Model and pose viewer (dev tool)
   └─ serve.js             Optional local web server for development
```

---

## Adding a character

1. Copy `src/data/characters/raditz.js` to a new file.
2. Change `id`, `name`, `stats`, `appearance`, `forms`, `moves`, `specials`, `poses`, `sequences`, `barks`, `ai` and `mechanic`.
   Optional V0.2 fields: `moves.airHeavy`, `moves.chase`, `multi` / `finish` / `teleport` on moves, `tiers` / `callout` / `instant` / `formVariants` / `style.rings` on beams, `modes` / `fatigue` on teleports, `levels` and `sequence` on forms, `vfx.ghost`, `audio.strikePitch`, `ai.hooks`.
3. Unique mechanic → `src/game/mechanics.js`. Unique AI behaviour → `SL.AIHooks` in `src/game/controllers.js`.
4. Add a hair silhouette to `src/data/hair.js` if needed, dialogue lines to `src/data/dialogue.js`.
5. Add a `<script>` line in `index.html` next to the other characters, and an unlock rule in `src/data/unlocks.js`.
6. Run `node tests/run-tests.js` — the schema validator names every missing pose, broken special or unknown dialogue line.

---

## Sharing and packaging

- **Share with a friend:** zip the `saiyan-legacy` folder. They unzip it and double-click `index.html`.
- **Desktop app (.exe):** PLANNED (Electron or Tauri wrapper, no code changes needed).
- Read the legal notes before sharing.

---

## Legal

- This is a fan project for personal, non-commercial use. It is not an official Bandai Namco, Toei Animation or Shueisha product.
- All code, synthesized music, sound effects and dialogue in this folder were written for this project (story dialogue paraphrases events; it is not transcribed). Character names, designs and story events belong to their owners.
- three.js is © three.js authors, MIT licence (`vendor/three.LICENSE.txt`).
- Distributing fan games that use a franchise's characters can still infringe copyright and trademark, even for free. Keep it personal, do not sell it, and do not add ripped models, music or voice clips from official games or the anime.

---

## Roadmap

| Version | Focus |
|---|---|
| 0.1 | Combat foundation, 3 fighters, Bardock Prologue, Free Battle, Training, settings, saves, tests. |
| **0.2 (this version)** | Local three.js, Goku showcase, visual foundation, Chapter 1 (Raditz), first What-If, schema validation. |
| 0.3 (proposal) | Chapters 2–3 (One Year, Saibamen, Nappa, Vegeta + Great Ape), playable Piccolo and Gohan prototypes, second What-If, radial skill menu, balance playtest. |
| Later | Namek / Frieza Saga, Dragon Balls and Shenron, tournament, customization, fusion, onward along the timeline. |
| Art track (parallel) | Replace prototype models with skinned glTF models and real animation when art is available (workflow in `STATUS.md`). |
