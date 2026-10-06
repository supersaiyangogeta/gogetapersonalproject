# Dragon Ball: Saiyan Legacy — Build 0.1 (Vertical Slice)

An unofficial, non-commercial 3D Dragon Ball fan game. It runs in your web browser, so there is nothing to install.

> Dragon Ball © Bird Studio / Shueisha, Toei Animation. This project is not affiliated with or endorsed by Bandai Namco, Toei Animation or Shueisha. See [Legal](#legal).

---

## How to play

1. Open the `saiyan-legacy` folder.
2. Double-click **`index.html`**. It opens in your browser (Chrome or Edge recommended; Firefox works).
3. Press any key.

**Internet on launch:** the 3D engine (three.js r149, about 600 KB) loads from a CDN. To play fully offline, put `three.min.js` (version r149, from `https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js`) into the `vendor` folder. The game uses the local copy first when it exists.

**What you do NOT need:** a game engine, Node.js, Python, a web server, or any build step. Everything is plain HTML, CSS and JavaScript.

### Why a browser game?

You asked for a setup that works from zero. A browser game:

- runs by double-clicking one file,
- can be tested automatically (every system was exercised in a real browser during development),
- is plain text code that AI tools edit well,
- uses three.js, a mature 3D engine with lighting, shadows and GPU particles.

The trade-off: a browser game cannot match the raw asset quality of Unreal Engine. The architecture (data-driven characters, a joint rig that matches standard humanoid skeletons, pluggable mechanics) is built so better models and animations can replace the prototype ones later without rewriting gameplay.

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
- Heavy attacks crush a tired guard. Watch the yellow stamina bar.
- **Dodge** while stunned in a long combo bursts you free (costs half your stamina).
- Two beams that meet head-on start a **Beam Clash**. Mash the button shown (or switch to *Hold* in Settings).
- **Boost** with no direction rushes straight at your target. Heavy strikes can bat simple ki blasts back.

---

## Status report — what exists in Build 0.1

Status words mean exactly this:

- **COMPLETE** — works, tested, polished for this build's scope.
- **FUNCTIONAL PROTOTYPE** — fully works and is tested, but the quality is not final (usually art or audio).
- **PARTIAL** — works, but a planned part is missing.
- **PLANNED** — not built yet. Nothing in the game pretends it exists.
- **BLOCKED BY ASSETS** — needs art, animation or audio that code alone cannot produce well.

### Game modes

| Mode | Status | Notes |
|---|---|---|
| Title screen & main menu | COMPLETE | Live 3D background. The menu changes with progress (Records appears, Story text changes, Bardock joins the background). Hidden interaction: hold *Charge Ki* on the main menu. |
| Story — Prologue: *The Final Stand* (Bardock) | COMPLETE | 5 phases: intro cinematic, blockade waves, attack pods (with an optional timed objective), elite squad, Frieza finale with a playable Supernova struggle, planet destruction and the escaping pod. Checkpoints, retry, rank and score. |
| Story — Chapter 1 onward | PLANNED | Shown on the story timeline as "In Development", not selectable. |
| Free Battle | COMPLETE | Fighter, form, opponent, stage, CPU difficulty, time limit, health, Balanced / Canon power, transformations and ultimates on or off. |
| Training | COMPLETE | Dummy behaviors (idle, guard, dodge, ki blasts, fight back), infinite health / ki / stamina, damage and combo readout, position reset. |
| Records | COMPLETE | Completion %, stats, per-fighter records, best mission rank. |
| Settings | COMPLETE | 7 categories, 50+ options, full keyboard and controller rebinding. Only options that actually do something are listed. |
| Tournament, What-If, Dragon Ball hunt, Customization, Gallery, Boss Rush | PLANNED | Not shown in menus. |

### Playable characters

| Fighter | Status | Identity |
|---|---|---|
| **Goku** (Saiyan Saga) | FUNCTIONAL PROTOTYPE | Fluid 4-hit strings, Kamehameha (chargeable, steerable), Instant Transmission (reappears behind the target; also a combo escape), Spirit Bomb (slow to charge, vulnerable, huge). Forms: **Kaioken** (red, faster, drains health) → **Super Saiyan** (full transformation sequence). Mechanic *Saiyan Instinct*: cheaper vanishes, empowered strikes after perfect defense. AI: adaptive. |
| **Vegeta** (Saiyan Saga) | FUNCTIONAL PROTOTYPE | Compact rushdown, gut punch crumple, Galick Gun, Big Bang Attack, Final Flash. Form: **Super Saiyan**. Mechanic *Pride*: close pressure and counters build damage; at max Pride light hits cannot stagger him. AI: aggressive. |
| **Bardock** | FUNCTIONAL PROTOTYPE (unlocked by the Prologue) | Heavy 3-hit strings, armored shoulder charge, Riot Javelin, Saiyan Assault (rush into a 3-hit beating), Final Spirit Cannon. No transformations (canon). Mechanic *Battle-Hardened*: damage rises as health falls; below 30% he rages. AI: berserker. |
| Frieza Soldier / Gunner / Elite | FUNCTIONAL PROTOTYPE | Story enemies with distinct AI (melee grunt, ranged gunner that keeps distance, armored elite). Group AI shares attack tokens so enemies do not all attack at once. |
| Frieza (First Form, hover pod) | FUNCTIONAL PROTOTYPE | Cinematic character in the Prologue finale. Not playable. |
| The rest of the roster | PLANNED | Architecture is ready (see *Adding a character*). |

**Character art is PROTOTYPE / BLOCKED BY ASSETS.** Fighters are built in code from shapes with cel shading and ink outlines. They are recognizable (hair silhouettes, outfits, scouters, scars, tails, forms) but they are not detailed, sculpted, skinned models. Final-quality models need a 3D artist or properly licensed models. The rig uses standard joint names, so a skinned glTF model can replace a prototype model later.

### Combat and systems

| System | Status | Notes |
|---|---|---|
| Fixed 60 Hz simulation, input buffering | COMPLETE | Presses during hit-stop are buffered, never dropped. |
| Movement, flight, boost, dash, homing rush | COMPLETE | Ground running and jumping, full 3D flight, landing. |
| Light chains, heavy finishers, launchers, chase vanish, throws, dash attacks | COMPLETE | Character-specific move data. |
| Guard, perfect guard, guard break, dodge, vanish counter, burst escape | COMPLETE | Verified by the Combat Lab scenarios. |
| Ki (charge, spend, regen) and stamina | COMPLETE | Charging is interruptible. |
| Ki blasts, charged blasts, deflecting | COMPLETE | |
| Beams, projectiles, rush specials, Spirit Bomb | COMPLETE | |
| Beam clashes with mashing or hold input | COMPLETE | Cinematic camera, struggle meter, grace period, winner overpowers, mutual explosion on a tie. |
| Transformations | COMPLETE | Short "burst" style and full cinematic style (time freezes for others, camera orbit, flash, shockwave, crater). |
| Knockback, ground slams, wall impacts | COMPLETE | Slams dig real craters into the terrain. Rock spires break and stop blocking movement and shots. |
| Enemy AI | COMPLETE for this roster | Reaction delay per difficulty, per-attack defensive rolls, utility-based plans, personalities, reacts to transformations, low health, charging and beams. Difficulty changes behavior, not health. |
| Hit feedback | COMPLETE | Five impact levels: hit-stop, camera shake, flashes, particles, sound, controller rumble. |
| Camera | COMPLETE | Lock-on framing, orbit, terrain and rock avoidance, cinematic shots. |
| Mission framework | COMPLETE | Phases, checkpoints, objectives, optional objectives, spawners, contextual control prompts that disappear once learned. |
| Save system | COMPLETE | Checksum, automatic backup, corruption recovery (a bad save is kept as a copy, never silently erased). |
| Music | FUNCTIONAL PROTOTYPE | Original synthesized tracks with dynamic intensity layers. A real composed soundtrack would be better. |
| Sound effects | FUNCTIONAL PROTOTYPE | Every sound is synthesized in code. Recorded sound design would be better. |
| Voice acting | BLOCKED BY ASSETS | Characters speak through subtitles. All dialogue is original writing. |
| Animation | FUNCTIONAL PROTOTYPE | Pose-based with blending (anticipation and snap on strikes). Each fighter has its own stances, strikes, specials, intro, victory and defeat poses. Hand-keyed or motion-captured animation needs an animator. |
| Facial expressions | FUNCTIONAL PROTOTYPE | Neutral, angry, shouting, hurt, smirk, calm, knocked out. |
| Accessibility | COMPLETE for listed options | Subtitle size and background, reduced flashing, camera shake, speed lines, high contrast, color-blind bars, toggle guard and charge, struggle assist, HUD scale and opacity. |
| Destructible cities, weather, time of day | PLANNED | |
| Fusion, customization, custom character, Dragon Balls and Shenron, What-If | PLANNED | |

### Known limitations in this build

- Character models and animations are prototype quality (see above).
- No voice acting.
- The story currently has one chapter (the Prologue).
- Controller combos use LB as a modifier. Rebinding works, but a radial skill menu would be friendlier (planned).
- Testing so far used a Chromium-based browser on Windows, served over `http://localhost`. Opening `index.html` directly from disk uses the same code path (plain scripts, no modules or file loading), but it has not been checked on Firefox, Safari, Mac or Linux yet.

---

## Testing

### Automated tests (developers only)

These need [Node.js](https://nodejs.org) — you do not need Node.js to play.

```bash
node tests/run-tests.js
```

35 tests cover damage and combo math, guard chip, ki and stamina spending, form and canon-power multipliers, beam clash balance, mission ranks, save round-trips, backup restore, corruption recovery, save migration, settings presets, key rebinding conflicts, and data integrity (every move's pose, hair style and mechanic exists).

### Combat Lab (in-game scenarios)

Open the game, open the browser console (F12) and run:

```js
const s = document.createElement('script'); s.src = 'tools/lab.js'; document.body.appendChild(s);
// after it loads:
SLLab.runAll().then(r => console.table(r));
```

20 deterministic scenarios press buttons on exact frames and check the result: combos, launch and chase, guard break, throws, vanish, perfect guard, burst escape, Instant Transmission, every special and ultimate, transformations, charged blasts, dash attacks and ki charging. All 20 pass in Build 0.1.

### Manual test checklist used for this build

- Title → menu → every menu screen → back, with keyboard, mouse and (where available) controller.
- Free Battle full match to K.O., victory, results, rematch, change characters, main menu.
- AI vs AI soak matches on both stages (the player can be set to autopilot through `SL.debugAutopilot = 'hard'`).
- Story from the start, checkpoint retry, failure screen, lower-difficulty retry, full finale, results and unlocks.
- Pause and resume, settings changes during a battle, graphics preset switching during a battle.

---

## Project structure

```
saiyan-legacy/
├─ index.html              Entry point — double-click to play
├─ css/game.css            All interface styling
├─ vendor/                 Optional local three.min.js for offline play
├─ src/
│  ├─ core/                Engine basics
│  │  ├─ namespace.js      Global SL object, math helpers, event bus
│  │  ├─ settings.js       Defaults, presets, settings schema, bindings
│  │  ├─ save.js           Versioned save with checksum and backup
│  │  ├─ input.js          Keyboard, mouse, gamepad → named actions
│  │  ├─ audio.js          Synthesized sound effects
│  │  └─ music.js          Dynamic synthesized music
│  ├─ render/              Rendering
│  │  ├─ renderer.js       WebGL setup and quality scaling
│  │  ├─ toon.js           Cel shading, ink outlines, generated textures
│  │  ├─ camera.js         Lock-on camera, cinematic shots, shake
│  │  └─ vfx.js            Particles, auras, beams, explosions, screen effects
│  ├─ game/                Gameplay
│  │  ├─ model.js          Procedural character builder (prototype art)
│  │  ├─ animator.js       Pose animation with blending
│  │  ├─ rules.js          Pure combat math (unit tested)
│  │  ├─ mechanics.js      Character mechanics (Pride, Battle-Hardened…)
│  │  ├─ fighter.js        Shared combat state machine
│  │  ├─ controllers.js    Player input and CPU AI
│  │  ├─ projectiles.js    Ki blasts, beams, Spirit Bomb
│  │  ├─ clash.js          Beam clashes
│  │  ├─ stage.js          Terrain, destruction, props
│  │  ├─ battle.js         A fight: flow, targeting, feedback, cinematics
│  │  └─ mission.js        Story mission runner
│  ├─ data/                Content (no engine code)
│  │  ├─ characters/       One file per fighter
│  │  ├─ missions/         One file per story mission
│  │  ├─ hair.js           Hair silhouettes
│  │  ├─ poses_common.js   Shared reaction poses
│  │  ├─ stages.js, dialogue.js, unlocks.js
│  ├─ ui/                  Menus, HUD, settings, results
│  └─ main.js              App loop and screen flow
├─ tests/run-tests.js      Node unit tests
└─ tools/
   ├─ lab.js               In-game Combat Lab scenarios
   ├─ viewer.html          Model and pose viewer (dev tool)
   └─ serve.js             Optional local web server for development
```

---

## Adding a character

1. Copy `src/data/characters/bardock.js` to a new file, for example `piccolo.js`.
2. Change `id`, `name`, `stats`, `appearance` (colors, build, hair style, outfit parts), `forms`, `moves`, `specials`, `ai` and the character's own `poses`.
3. If the character has a unique mechanic, add it to `src/game/mechanics.js` and reference it with `mechanic: { type: '...' }`.
4. Add a hair silhouette to `src/data/hair.js` if needed.
5. Add a `<script>` line for the new file in `index.html` (next to the other characters).
6. Add rival lines to `src/data/dialogue.js` (for example `piccolo_vs_goku`).
7. Add an unlock rule to `src/data/unlocks.js`, or add the id to the starting roster in `src/core/save.js`.
8. Run `node tests/run-tests.js` — the data integrity tests catch missing poses, hair styles and mechanics.
9. Use `tools/viewer.html` (through the dev server) to check the model and poses.

The same pattern applies to stages (`stages.js` plus a builder in `stage.js`) and missions (`src/data/missions/`).

---

## Sharing and packaging

- **Share with a friend:** zip the `saiyan-legacy` folder. They unzip it and double-click `index.html`.
- **Desktop app (.exe):** PLANNED. The project can later be wrapped with Electron or Tauri without code changes.
- Read the legal notes before sharing publicly.

---

## Legal

- This is a fan project for personal, non-commercial use. It is not an official Bandai Namco, Toei Animation or Shueisha product.
- All code, synthesized music, sound effects and dialogue in this folder were written for this project. Character names, designs and story events belong to their owners.
- Distributing fan games that use a franchise's characters can still infringe copyright and trademark, even for free. Rights holders can and do send takedown notices. Keep it personal, do not sell it, do not accept donations for it, and do not add ripped models, music or voice clips from official games or the anime.

---

## Roadmap

Each build stays playable and tested before the next one starts.

| Build | Focus |
|---|---|
| **0.1 (this build)** | Combat foundation, 3 playable fighters, 2 stages, Bardock Prologue, Free Battle, Training, settings, saves, tests. |
| 0.2 | Polish pass on Goku as the quality benchmark (animation curves, more poses, Kamehameha cinematic), controller radial skill menu, first What-If ("What if Bardock survived?"). |
| 0.3 | Initial roster: Piccolo, Gohan, Frieza (playable, multi-form boss), Raditz, Nappa. |
| 0.4 | New stages: Namek, World Tournament arena, destroyed city. |
| 0.5 | Saiyan Saga chapter (Raditz, Saibamen, Nappa, Vegeta with a Great Ape phase). |
| 0.6 | Dragon Radar exploration, Dragon Balls, Shenron wishes. |
| 0.7+ | Namek / Frieza Saga, customization, tournament mode, fusion system, and onward along the timeline. |
| Art track (parallel) | Replace prototype models with skinned glTF models and real animation when art is available. |
