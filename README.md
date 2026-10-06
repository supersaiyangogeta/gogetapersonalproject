# Dragon Ball: Saiyan Legacy

Main folder: **Version 0.3 "Saiyan Saga" (in development)**. Current frozen playable build: **Version 0.2 "Goku Showcase"** in `builds/v0.2/`.

An unofficial, non-commercial 3D Dragon Ball fan game. It runs in your web browser, so there is nothing to install.

> Dragon Ball © Bird Studio / Shueisha, Toei Animation. This project is not affiliated with or endorsed by Bandai Namco, Toei Animation or Shueisha. See [Legal](#legal).

- **Long-term specification (what the game is meant to become):** [`MASTER_SPEC.md`](MASTER_SPEC.md)
- **Current development state and next steps (start here when continuing development):** [`HANDOFF.md`](HANDOFF.md)
- **Detailed status of every feature and the testing record (automated and human):** [`STATUS.md`](STATUS.md)
- **Version 0.2 (current frozen playable build):** [`builds/v0.2/`](builds/v0.2/) · **Version 0.1 (first playable build):** [`builds/v0.1/`](builds/v0.1/) — double-click their `index.html` to play them. The main folder is Version 0.3 (in development).
- Development is local only: no git repository, nothing uploaded.

---

## How to play

1. Open the `saiyan-legacy` folder.
2. Double-click **`index.html`**. It opens in your browser (Chrome or Edge recommended; Firefox works).
3. Press any key.
4. The first time, choose how you want to experience it: **Cinematic** (recommended — less HUD, fewer interruptions, the fight on screen), **Standard** (full gameplay information) or **Custom** (choose every piece yourself). Change it any time in **Settings → Display & Immersion**.

**No internet needed.** The 3D engine (three.js r149) is included in `vendor/three.min.js`.

**What you do NOT need:** a game engine, Node.js, Python, a web server, or any build step. Everything is plain HTML, CSS and JavaScript.

### Why a browser game?

A browser game runs by double-clicking one file, can be tested automatically in a real browser, is plain text code that AI tools edit well, and uses three.js, a mature 3D engine. The trade-off: it cannot match the raw asset quality of Unreal Engine. The architecture (data-driven characters, a joint rig that matches standard humanoid skeletons, pluggable mechanics and AI hooks) is built so better models and animations can replace the prototype ones later without rewriting gameplay. See `assets/models/README.md` for how real models are imported.

---

## Controls

Every control can be changed in **Settings → Controls**. Button hints in the game always show your current bindings.

| Action | Keyboard & mouse | Controller |
|---|---|---|
| Move | W A S D | Left stick |
| Camera | Mouse (click the game to capture it) | Right stick |
| Jump / fly up (ascend) | Space | A |
| Fly down / land (descend) | C | D-pad down, or left stick click |
| Boost (hold) / dash (tap with direction; with Fly up/down for a vertical dash) | Left Shift | RT |
| Light attack | Left click or J | X |
| Heavy attack | Right click or K | Y |
| Ki blast (hold to charge) | E or L | B |
| Guard (also brakes in flight) | F or I | LT |
| Dodge / vanish | Q or U | RB |
| Charge ki | R or O | Hold LB |
| Special 1 / Special 2 | 1 / 2 | LB + X / LB + Y |
| Ultimate | 3 | LB + B |
| Transform / power down | T / G | LB + A / LB + D-Down |
| Lock-On / Free Camera | Tab or middle mouse button | Right stick click |
| Next target | X or mouse wheel down | D-pad left |
| Previous target | Mouse wheel up | — |
| Nearest target left / right | — | Flick the right stick while locked |
| Switch hero (party battles) | Z | D-pad right |
| Skill menu (hold, point with WASD or the mouse, release) | V | D-pad up (point with either stick) |
| Pause | Esc or P | Menu |
| Training: reset positions | Backspace | View |

### Combat in one minute

- **Light ×2 → Heavy** launches the opponent. Press **Heavy** again to vanish after them and smash them down.
- **Light ×4 → Heavy** is a big knockback finisher.
- **Guard** blocks. Press guard *just before* a hit for a **Perfect Guard**: no damage and the attacker staggers.
- **Dodge** *just before* a hit to **vanish** behind the attacker.
- **Guard + Heavy** is a throw. Throws beat guarding.
- **Dodge** while stunned in a long combo bursts you free. If several enemies pile onto you, you break away automatically with a ki burst.
- Two beams that meet head-on start a **Beam Clash**. Mash the button shown (or switch to *Hold* in Settings).
- **Lock on / unlock.** Locked, the camera and your attacks follow the target (an enemy, or an object such as an attack pod — amber ring); **Next target** cycles through enemies and objects. Unlocked, the camera is free and a small crosshair appears: ki blasts and beams fly where you aim. A small chip under the crosshair says which state you are in (**TARGET LOCKED · Tab Free Camera** / **FREE CAMERA · Tab Lock Target**) until you have toggled it once (lock → free → lock); after that it never comes back unless you reset the control hints. Far targets such as the moon can be locked and shot too. Enemies about to attack from outside your view show a small arrow at the screen edge.
- **Camera.** Moving the mouse right turns the view right. **Settings → Camera → Camera Style**: *Auto* (combat framing while locked on, an adventure camera that follows your run otherwise), *Adventure* or *Free* (never turns on its own); *Invert Horizontal* / *Invert Vertical* are there too.
- **Skill wheel.** Each technique shows what it will hit: → the locked target, → where you aim, all around, or yourself.

### Goku's techniques (Version 0.2)

| Input | Result |
|---|---|
| Light → Heavy | **Flurry** — rapid multi-hit rush |
| Light ×3 → Heavy | **Meteor Crash** — vanishes above and axe-kicks down (10 ki) |
| Heavy while both of you are in the air | Aerial heavies: hammer, air upper, spin kick |
| Hold **1** | **Kamehameha** — three charge tiers; release to fire, steer with movement |
| **2** (+ direction) | **Instant Transmission** — neutral: behind · forward: in front with a strike · up (Space): above, next Heavy smashes · back: away. Repeated use costs more. |
| **1** right after Instant Transmission | **Instant Kamehameha** |
| **T** | **Kaioken**. Hold **Charge** in Kaioken to raise it — x3 and x4 normally, and on Namek the story hands over x10 and x20 (more power, more health drain). |
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

## What is in Version 0.3 (in development)

The main folder is Version 0.3 "Saiyan Saga". It is not frozen yet; `builds/v0.2/` stays the stable build.

| Area | Contents |
|---|---|
| Story | The **Prologue** *The Final Stand* now ends with a full cinematic (Frieza's Supernova, Bardock's vision of his son, the destruction of Planet Vegeta, Kakarot's pod) · Chapter 2 *Alone in the Wild* (Kid Gohan, including the full-moon Great Ape night played as Piccolo), *Snake Way* (Goku runs the serpent road to King Kai: no flight yet, pace the sprint, jump the gaps) and *Ten Times Gravity* (Goku on King Kai's planet) · Chapter 3 *The Saibamen*, *Nappa Attacks* (with Chiaotzu's self-destruct), *The Saiyan Prince* (Vegeta, his Great Ape form, Yajirobe's tail cut, and Great Ape Gohan — played by you) |
| Namek (started, in development) | Chapter 4 *The Hunted*: Krillin and Gohan save the Namekian child Dende and run from Dodoria · *A Prince on Namek*: Vegeta against his rival Cui, then Dodoria · *The Beautiful Monster*: Vegeta against Zarbon, who stops being elegant halfway through · *The Prince Repaid*: the rematch after a Saiyan comes back stronger · *The Eldest Namekian*: Krillin reaches the Grand Elder and has his potential unlocked · *Five Seconds*: the Ginyu Force lands, and Guldo stops time · *Recoome's Show*: a showman who poses mid-fight, and the wait for Goku · *Two Against One*: Goku against Burter, who cannot be hit while he moves, and Jeice, who will not let you close · *The Captain*: Captain Ginyu takes Goku's body, and you have to fight in what he leaves you · *Nothing Like a Frog*: Vegeta closes the Ginyu Force account · *The Warrior*: Nail stalls Frieza, and Piccolo takes what is left of him · *The Emperor*: Frieza arrives, and changes shape · *Two More Shapes*: fight him evenly and he stops pretending, twice · *The Prince's Last Words*: Goku lands, the prince explains what Frieza took from them, and is buried · *The Emperor's True Power*: base Goku, then the Kaioken lit and climbed to x4 · *Kaio-ken Times Twenty*: x10, Frieza's fifty percent, x20, and a Kamehameha he turns away with one hand · *The Spirit Bomb*: Goku gathers it from the stars while you hold Frieza off **as Piccolo** · *The Legendary Super Saiyan*: Krillin, the transformation, and a fight that has changed sides · *Five Minutes*: 100 % Frieza on a planet that is already dying, his own Death Saucer, the mercy he did not deserve, and what he did with it |
| Androids (started, in development) | Chapter 5 ***The Stranger*** (rebuilt 2026-09-24): a machine falls out of the sky, a young man with a sword climbs out and takes Frieza's army apart — every kill a finisher — then turns Super Saiyan, lets Frieza try everything (and catches his Supernova), cuts him to pieces and catches King Cold's blade in his bare hand · ***What He Came To Say*** (rebuilt): Goku's pod, Yardrat and Instant Transmission (with Roshi's sunglasses), a sword test Goku stops with one finger, the future Trunks came from, the medicine, the date drawn in the sand, and **THREE YEARS UNTIL THE ANDROIDS** · *Ten in the Morning*: Androids 19 and 20, ki that feeds them instead of hurting them, and a heart that gives out mid-fight · ***The Fever***: Goku at home with the virus and Chi-Chi beside him (a quiet two-minute scene, no fighting) · *The Laboratory Door*: a race to Gero's lab, then 16, 17 and 18 walking out of it · *The Pair on the Road*: the pair against Vegeta and Trunks, with nothing to outlast |
| Cell (started, in development) | Chapter 6 *The Town That Stopped*: Imperfect Cell stalking an empty city · *Seventeen* · *Let Him Finish* · ***The Cell Games***: rebuilt as a playable recreation of the whole tournament — the ring, Goku vs Cell in four escalating stages, Goku's forfeit and the Senzu Bean, Gohan in base form refusing to fight, the Cell Juniors set on his friends, **Android 16's death**, **Super Saiyan 2**, ***The Difference in Power*** (Super Saiyan 2 Gohan tears through the Juniors: surrounded, a fist caught in one hand, blows from behind felt and answered, an Aura Burst, a finisher for every kill, the ring breaking and his gi wearing through), a Cell who adapts to it, Goku's sacrifice, Cell's return, and the **Father-Son Kamehameha played as a beam struggle you have to win** |
| Buu (started) | Chapter 7 ***Seven Years***: Gohan at seventeen flies into **Satan City** (a new city stage with buildings that come down) and invents a superhero · ***The Great Saiyaman***: a robbery where the bystanders are the objective, then Videl — who fights crime without ki or flight — tests him · ***Two Children***: Goten and Kid Trunks spar and turn Super Saiyan like it is a game · Chapter 8, **the 25th World Tournament**: ***Learning to Fly*** (Videl learns, in stages — she wobbles, stalls and gets better) · ***Junior Division*** (Goku back for one day and Goten jumping into his arms; a real bracket, ring-outs and an announcer; the final played beat by beat — no Super Saiyan, one hand behind Trunks' back, a sleeper hold, Goten going gold, the second hand and a ring-out) · ***Spopovich*** (a match Videl is not meant to win: her kick turns his head all the way round, and he turns it back) · ***The Supreme Kai*** (hold Charge to Super Saiyan 2 for Kibito — then his hand, the pin, and Yamu's siphon filling with it) · Chapter 9, **the wizard**: ***The Pursuit*** (follow them without being felt) · ***Planet Zoon***, ***The Dark Planet*** and ***The Demon King*** (Babidi's ship, one floor each, with Babidi watching from above; Dabura's spit turns people to stone) · Chapter 10, **Majin**: ***The Mark*** (the wizard reaches into Vegeta; hold him out until he stops wanting to — then he blasts the stands and you race to stop the second blast) · ***Prince of Saiyans*** (Goku against Majin Vegeta, ground to sky to ruin; hold Charge to push Super Saiyan 2 through; both gis tear as the fight goes) · ***Majin Buu*** (Gohan against Dabura while the seal breaks; a pink shape in the smoke; punches sink into him, wounds close, he comes apart and reforms) · ***The Prince's Pride*** (Vegeta alone against Buu: blow him apart, the goodbye, then hold everything he has while Buu walks into the light) · Chapter 11, **Buying Time**: ***The Third Level*** (Buu turns a city into candy; Goku stalls him, holds Charge all the way to Super Saiyan 3, and walks away before the body gives out) · ***Fusion*** (on Kami's Lookout: Goku dances the Fusion Dance for the boys and goes; the dance is played on the beat — Light on every step — and comes out fat, then old, then **Gotenks**; a spar with Piccolo, the Super Ghost Kamikaze Attack, and the thirty minutes running out mid-brag) · ***The Evil in Him*** (as Mr. Satan: a bomb for a present, a monster who calls your punches a massage, a promise, a puppy called Bee, two hunters with rifles — then, as Good Buu, the steam that leaves him and becomes **Evil Buu**, the Candy Beam swatted back, and **Super Buu**) · ***The Room of Spirit and Time*** (Super Buu on the Lookout; bored, he sends beams around the whole world — a street full of people, then an empty one; inside the Time Chamber, Gotenks goes **Super Saiyan 3**, takes a regenerating Super Buu apart, Piccolo destroys the door, and Buu screams a hole in the dimension) |
| What If | Four new branches on their own save track, each unlocked by its own canon mission: *What if the warning got out?* (Bardock holds a broadcast open while a squad shoots at the relay) · *What if Goku never let go?* (keep the tail grip, walk Raditz into Piccolo's line) · *What if Vegeta refused the moon?* (**played as Vegeta**: crush your own Power Ball and win the duel with your hands) · *What if x20 never became a Kamehameha?* (spend the Kaioken on Frieza's firing positions, then defend a helpless Goku **as Piccolo**) · plus *What if Piccolo survived Nappa?* |
| Playable (prototypes) | Kid Gohan, Piccolo, Krillin, Tien, Chiaotzu, Yajirobe, Yamcha, Future Trunks, Gohan at eleven, **Gohan at seventeen, the Great Saiyaman, Videl, Goten, Kid Trunks, Dabura**, plus the Version 0.2 roster (each unlocks with the mission that introduces them) |
| Bosses | Nappa (poise, telegraphs, three phases), Great Ape Vegeta and Great Ape Gohan (giants with hit zones and a breakable tail) |
| Controls added | Hold **V** / D-pad up for the skill wheel (point with WASD, the mouse or either stick; it also holds techniques that have no button, such as Piccolo's Explosive Demon Wave) · **Z** / D-pad right switches hero in party battles · **Tab** / middle mouse locks on or unlocks (free aim with a crosshair) · **X** / mouse wheel switches targets, including attack pods · Fly down is also on D-pad down |
| Display & Immersion | A first-launch choice between **Cinematic**, **Standard** and **Custom**, previewed live over the menu scene. Settings → **Display & Immersion**: HUD preset, damage numbers (Off / Important Only / All), player and enemy health (Full / Minimal / Hidden), ki and stamina (Full / Minimal / Contextual), lock-on UI, skill UI, technique names, objectives, tutorial tips (Full / Contextual / Off), notifications, combo counter, **Auto-Hide HUD**, subtitles (On / Dialogue Only / Cinematic Only / Off), UI opacity and HUD scale. In Cinematic the HUD shows information when there is a reason — a hit, a spent technique, a new target, danger — and fades when there is none. Struggles, beam clashes and the inputs a story scene waits for are always shown, and the pause menu always lists the objectives. |
| Customization | Main menu → **Customization**: dress Goku, Vegeta, Bardock, Future Trunks, Gohan at seventeen and Videl from outfits the story has handed over (Goku: Turtle School, Namek, Yardrat, symbol-less Cell and Buu gis, Whis, End of Z and more; Vegeta: Saiyan, Namek, Frieza Force, "Badman", Capsule Corp, Buu, Whis; Future Trunks: the Capsule Corp jacket, worn, torn and unarmed; Gohan: the tournament gi, Orange Star High clothes, the Ultimate gi and hair; Videl: the Satan City T-shirt, the tournament look, the Super look, with pigtails, the short cut or the bob), with armor, the gi's kanji, scouters, a tail and era colour shades — the figure turns in front of you and changes at once (drag to turn, wheel to zoom, Q / E to switch character). Tails are real now: wrapped round the waist (how Saiyan-era Vegeta and Bardock wear it) or loose — adult Goku has none. Bardock has two designs, classic and Super (the Broly movie look), plus a battle-damaged and a movie-armor alternate. Your looks are worn in **Free Battle, Training and the menus**; **story missions always wear the canon look of their era** (Vegeta sheds his hip guards on Namek, his scouter after the healing tank, and his armor in the Buu saga, whatever you picked). New outfits unlock as you clear the story. Everything is a prototype look made from the procedural parts. |
| Namek ending | Plays the way it was built. There is also a **secret** second cut of the betrayal and the Angry Kamehameha — the mode is called Manga Mode, and the Settings screen listens for its name. Find it and a Gameplay row lets you switch between *Classic* and *Manga Version*; same fight, same struggle, same outcome, different film. |
| Buu (Chapter 12) | ***The Z Sword*** (on the Kais' own world: hold Charge to pull the sword out of its rock, swing it until it is yours, break it on the Katchin — and out comes the Old Kai; his ritual, and the unlocking, where you must press **nothing**; Gohan's **Ultimate** — black hair, a white aura, no lightning) · ***Ultimate Gohan*** (a fist caught in one hand; Super Buu taken apart; then the trick, the absorption, and **Buutenks**) |
| Free Battle options | Form Level Limit (for example Kaioken x2 only) · on the **World Tournament** stage the match is played by tournament rules: touch the ground outside the ring and you lose · forms the Buu saga hands over appear on the transformation wheel once the story has given them: Vegeta's Super Saiyan 2 after *The Mark*, Goku's after *Prince of Saiyans*, Super Saiyan 3 after *The Third Level* (it burns ki every second and stops natural ki recovery). **Gotenks** is playable after *Fusion* (his Super Saiyan with it; his Super Saiyan 3 after *The Room of Spirit and Time*); adult Gohan's **Ultimate** after *The Z Sword*. Majin Buu, Evil Buu, Super Buu and Buutenks are story-only for now |

**Asset levels.** Every character body is marked Level 1 *functional prototype*, Level 2 *polished prototype* or Level 3 *production asset*, and the character select card says which. Right now Goku is Level 2 and everyone else is Level 1; nothing is Level 3. The whole campaign is being built with prototype bodies so the game never waits on art; real models can replace them later with `node tools/glb_check.js model.glb --write-js` (see `assets/models/README.md`).

A few things worth knowing when you play: in party battles a boss such as Nappa turns between your heroes instead of hunting only the one you control (the hero it is after has a glowing card in the party strip); on Snake Way, falling off the road puts you back at the last road post you passed and costs a few seconds. As Great Ape Gohan, Special 1 stomps, Special 2 fires the mouth blast, Ultimate roars, Guard + Heavy grabs, and the skill wheel holds the arm sweep; the giant turns slowly, so watch for Vegeta going for your tail. Yamcha's Spirit Ball can be steered: keep Ultimate held after throwing it and curve it with left/right (Fly Up/Down lifts or drops it); a steered ball bursts through its target and snaps back for a second hit. Raditz's throw is a long Tail Grapple (press Heavy when his tail glows to grab it back), Chiaotzu's Telekinesis holds a target while you keep the button held, and Yajirobe carries two Senzu Beans per battle.

Automated tests for Version 0.3: `node tests/run-tests.js` — 663 tests at the last run (0 failed), including every story mission started from every checkpoint, full bot playthroughs, the core-feel checks (camera, lock-on, the Raditz duel, far targets, charge mixing, the flagship cinematics) the second-playtest checks (charge-audio lifecycle, the one-time lock-on hint, returning to the chapter, the Saibamen pack, the staged Namek scenes, Body Change, every technique firing, Developer / Test Mode) and the third-playtest checks (committed Ultimates, cinematic blocking inside the camera frame, the transformation chronology, Vegeta's death and the speech over his grave). Nothing in the core-feel or round-2 passes has been human playtested yet.

**Human playtesting.** In a fourth round (2026-09-23) the owner asked for the whole Goku vs Frieza climax to be rebuilt as paced playable missions — the Kaioken climbing through real fights, the Spirit Bomb bought with Piccolo's life, the Super Saiyan transformation as the flagship moment, and the famous Krillin line kept for the dying planet. That rebuild is finished, and a second pass (2026-09-23) added the ending the fight was missing — the Death Saucers, Frieza cut down by his own attack, the mercy, the betrayal and the gold Angry Kamehameha, with Frieza left alive for Chapter 5. All of it is automated tested and browser-verified by Claude, and **the owner has paused playtesting until he plays it himself**. The Bardock prologue was played by a person, who found three problems (unreliable flight descent, an overwhelming opening fight, no way to unlock the target). All three are fixed and pass automated tests, but they still need a human retest. In a third round (2026-09-19) the owner reported Ultimates being interrupted every time, a line delivered with one of the actors off screen, Vegeta's death being told rather than played, the HUD naming the wrong transformation and a Frieza who never stopped attacking; all of that is fixed and awaits a retest too. In a second round (2026-09-18/19) the owner played the story **from the start through *The Warrior* (Frieza vs Nail)** and reported a charge roar that never stopped, a lock-on hint that kept reappearing, missions that returned to the Prologue, Saibamen that were health sponges, Namek story beats told instead of shown (Piccolo's death, Nappa's execution, Cui, Dodoria, Goku's landing, the Body Change, the frog, the fusion), two techniques that did nothing, a fleeing Frieza and a punishing Zarbon. All of that was fixed in code and checked by automated tests and by Claude in the browser — **none of the fixes has been retested by a person yet**, and nothing after *The Warrior* has been played by a person. Passing automated tests does not mean the game feels good — see the checklists in `STATUS.md`.

### Save data

Each version keeps its own save slot (0.3: `saiyanLegacy.save.v3`, 0.2: `…v2`, 0.1: `…v1`). The first time a newer version starts, it copies the newest older progress once; older progress itself is never changed. What-If progress is stored separately from the canon story. Your Customization choices and the outfits you have unlocked live in the same save (older saves pick up every outfit their progress already earned the first time they load). Developer / Test Mode (below) uses its own slot, `saiyanLegacy.save.v3.dev`, so nothing done in it touches your real progress.

---

## Testing

### Automated tests (developers only)

These need [Node.js](https://nodejs.org) — you do not need Node.js to play.

```bash
node tests/run-tests.js
```

724 tests at the last full run, all passing (several minutes; `--fast` skips the engine and simulation tests): damage and combo math, saves (round-trips, backup restore, corruption recovery, older-version import, What-If separation), settings and rebinding, schema validation of every character, every Combat Lab scenario run headless in the real engine, fighter systems, flight controls, lock-on and free aim, group pressure, every character kit, bosses and giants, telemetry, the `.glb` pipeline, the radial menu, party battles, every story mission started from every checkpoint, story cutscenes compared watched against skipped, the Buu missions played with every scene watched in full (Chapter 10 and *The Third Level* included: torn clothing per outfit, SSJ2/SSJ3 and Majin Vegeta, Majin Buu's body, form unlocks), full story missions played by bots that only send player inputs, the What-If branches (their divergences, alternate endings, unlocks and the separation of their save track from the canon story), Display & Immersion (the first-launch setup and every HUD setting, checked on the real HUD attached to headless battles through a small test DOM, `tests/minidom.js`), and the character-quality pass (Trunks' transformation without hand signs, the cut through Frieza and the finish in the air, no bald crown on any character, how Videl, Gohan at seventeen and Majin Vegeta are built, their clothing damage and story looks), the wardrobe (what each era's canon look actually puts on the body, real tails and no stray geometry behind the hips, every Bardock outfit switching to every other, story continuity against the player's choices, unlocks, save migration, damage and transformations on dressed bodies, `.glb` outfits, and the Customization screen itself).

### Combat Lab (in-game scenarios)

Open the game, open the browser console (F12) and run:

```js
const s = document.createElement('script'); s.src = 'tools/lab.js'; document.body.appendChild(s);
// after it loads:
SLLab.runAll().then(r => console.table(r));
```

59 deterministic scenarios (the same ones also run headless inside `node tests/run-tests.js`) press buttons on exact frames and check the result. The Version 0.2 set: the 20 Version 0.1 regression scenarios, 13 Goku showcase scenarios (Flurry, Meteor Crash, aerial heavies, Instant Transmission modes and fatigue, Instant Kamehameha, Kamehameha tiers, Kaioken levels, Super Saiyan event, Spirit Bomb growth, beam-vs-Spirit-Bomb clash, directional hit reactions) and 4 Chapter 1 scenarios (Raditz moves and story-locked techniques); Version 0.3 added scenarios for the Saibaman, Piccolo, Vegeta, Krillin and Tien. Run only one group with `SLLab.runAll('V0.2')`.

### Other developer tools

- `node tools/encounter_probe.js prologue_final_stand 1 90 1 novice` — plays a story phase with a simple human-like bot and reports how readable the fight is (damage per 10 s, hits from outside the camera view, simultaneous attackers, hit chains, time stunned). In party battles it follows hero switches and reports how the enemies' damage is shared between your hero and the CPU allies.
- `node tools/balance_duel.js goku vegeta 40 normal 1` — CPU-vs-CPU duels with battle telemetry (damage by move, hit and miss rates, time stunned, specials landed, mechanic uptime). Add `--tweak=noMech` (or `mechSwap`, `kitSwap`, `specialsSwap`, `noIT`…) to remove one suspect at a time.
- `node tools/make_test_glb.js` — regenerates the original test mannequin used by the `.glb` pipeline test (`assets/models/`).
- `node tools/glb_check.js model.glb [--write-js]` — checks a real `.glb` character model against the import requirements (joint map, scale, facing, weights, budget, retargeting) and packages it for the game. Details in `assets/models/README.md`.
- Free Battle → **Form Level Limit** caps leveled forms (for example Kaioken x2 only) for both fighters.
- Free Battle results show a short battle report with the reasons behind the result; `SL.Telemetry.history()` in the console lists your last 40 battles (kept only in this browser).

- **Developer / Test Mode** — Settings → **Developer / Test** → switch it on. Off by default and invisible in normal play. While it is on, the game uses a separate test save (a copy of your progress the first time), and you get: unlock everything, cheats (infinite health / ki / stamina, god mode, no cooldowns, no ki cost, one-hit KO, infinite time, all forms and techniques), a debug overlay, and the **Developer Menu** (main menu or Settings) to launch any mission at any phase, Free Battle, Training, back up / restore / reset the test save and reset the control hints. The pause menu gains DEV rows: skip the scene, force a win or loss, restart or skip the phase, next form, reset power, spawn an enemy / ally / target. Switching it off returns to the real save untouched.
- `tools/snap.js` — sets up training scenes, freezes moments and positions the camera for visual checks.
- `SL.dataProblems` — schema problems found at boot (empty = valid).
- `SL.debugAutopilot = 'hard'` — the CPU plays the player's fighter (soak tests).

---

## Project structure

```
saiyan-legacy/
├─ index.html              Entry point — double-click to play
├─ README.md               This file
├─ MASTER_SPEC.md          Long-term master specification (what the game should become)
├─ HANDOFF.md              Current development state, architecture, next task
├─ STATUS.md               Detailed version status, testing record (automated and human)
├─ css/game.css            All interface styling
├─ vendor/                 three.js r149 (three.min.js) and its MIT licence
├─ builds/v0.1/, v0.2/     Frozen, playable copies of earlier versions
├─ assets/models/          Imported .glb bodies (only an original test mannequin) + production requirements
├─ src/
│  ├─ core/                namespace, settings, save (v2 slot + v1 import), input, audio, music
│  ├─ render/              renderer, toon shading + rim light, camera, vfx, glb.js (glTF 2.0 binary reader)
│  ├─ game/
│  │  ├─ model.js          Procedural character builder (faces, hands, springs)
│  │  ├─ model_glb.js      Imported .glb bodies driven by the game rig (retargeting, sockets)
│  │  ├─ telemetry.js      Per-battle statistics and results-screen insights
│  │  ├─ animator.js       Pose animation, sequences, squash & stretch
│  │  ├─ rules.js          Pure combat math (unit tested)
│  │  ├─ mechanics.js      Character mechanics (Pride, Battle-Hardened, Ruthless, Regeneration…)
│  │  ├─ fighter.js        Shared combat state machine (all V0.2 move/special/form features)
│  │  ├─ controllers.js    Player input, CPU AI (personalities, group-aware attacks), AI hooks
│  │  ├─ targeting.js      Lock-on / unlock / free aim, lockable objects
│  │  ├─ techniques.js     Technique registry (grabs, latches, telekinesis, giant and boss moves…)
│  │  ├─ radial.js         Skill wheel
│  │  ├─ projectiles.js    Ki blasts, beams, Spirit Bomb
│  │  ├─ clash.js          Beam clashes and beam-vs-Spirit-Bomb clashes
│  │  ├─ stage.js          Terrain, trees, props, destruction, sky mood
│  │  ├─ wardrobe.js       SL.Wardrobe: what a fighter wears (canon look per era, player looks, validation)
│  │  ├─ battle.js         A fight: flow, targets, group pressure rules, party switching, cinematic shots
│  │  └─ mission.js        Story mission runner (phases, checkpoints, objectives, prompts)
│  ├─ data/
│  │  ├─ characters/       goku, vegeta, bardock, raditz, piccolo, kid_gohan (+ Gohan at nine), future_trunks, cold_force (Mecha Frieza,
│  │  │                    King Cold), future_timeline (Bulma, Future Gohan),
│  │  │                    androids_gero (19, Dr. Gero), androids_pair (16, 17, 18), cell, cell_junior, teen_gohan, majin_buu,
│  │  │                    z_fighters (Krillin, Tien, Yamcha),
│  │  │                    saiyan_allies (Chiaotzu, Yajirobe), nappa, saibaman, great_ape, other_world, frieza_force, test_dummy
│  │  ├─ missions/         prologue_bardock (+ ending), saiyan_raditz (+ What-If), saiyan_training, saiyan_snakeway, saiyan_arrival,
│  │  │                    saiyan_nappa, saiyan_vegeta, whatif_piccolo, and the Namek chapter: namek_vegeta, namek_hunted,
│  │  │                    namek_zarbon, namek_rematch, namek_guru, namek_guldo, namek_recoome, namek_ginyu_pair, namek_ginyu,
│  │  │                    namek_frog, namek_nail, namek_frieza1, namek_gohan_frieza2, namek_frieza2, namek_goku,
│  │  │                    namek_vegeta_end, namek_spirit_bomb, namek_super_saiyan, namek_end, namek_aftermath,
│  │  │                    Chapter 5: android_trunks, android_warning, android_nineteen, android_fever, android_lab, android_road,
│  │  │                    Chapter 6: cell_first, cell_semi, cell_perfect, cell_games (+ cell_purge: its Juniors stretch),
│  │  │                    Chapters 7–9: buu_years, buu_saiyaman, buu_kids, the tournament and the wizard's ship,
│  │  │                    Chapter 10: buu_majin, buu_pride, buu_awakening, buu_sacrifice, Chapter 11: buu_ssj3, buu_fusion, buu_split, buu_timechamber, Chapter 12: buu_zsword, buu_ultimate
│  │  │                    (buu_kit.js / trunks_kit.js: shared staging helpers for the Buu chapters / the Trunks arrival)
│  │  ├─ scenes/           Data-driven cutscenes played by `SL.Cinema` (Namek arrival, Kaioken, Vegeta's end, the Spirit Bomb,
│  │  │                    Gohan's rage, the Krillin line, Super Saiyan, the planet's destruction)
│  │  ├─ story.js          Canon timeline, What-If branch list, eras (for the wardrobe)
│  │  ├─ wardrobe.js       Outfits, armor, emblems, scouters per character; canon looks by era
│  │  ├─ schema.js         Character schema validator
│  │  ├─ hair.js, poses_common.js, stages.js (11 stages, incl. the Cell Games arena, the Son house and Satan City), dialogue.js, unlocks.js
│  ├─ ui/                  Menus, story / What-If screens, HUD, settings, results, Customization (screens_wardrobe.js)
│  └─ main.js              App loop and screen flow
├─ tests/                  run-tests.js (runner), sim-tests.js (engine tests), headless.js (engine in Node)
└─ tools/
   ├─ lab.js               Combat Lab scenarios
   ├─ encounter_probe.js   Story fight readability probe
   ├─ balance_duel.js, balance_boss.js, balance_saibamen.js   CPU balance sims with telemetry
   ├─ mission_brains.js, missionbot.js   Bots that play missions with player inputs
   ├─ glb_check.js, make_test_glb.js     .glb model checker/packager, test mannequin generator
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

## Adding an outfit

Outfits are data: add a piece to `src/data/wardrobe.js` (slot, name, characters, era, kind, status `'prototype'` with a `look` made of the model fields in `src/game/model.js`, or `'planned'` with what it `needs`, and an `unlock` condition), then, if the story should wear it, name it in that character's `canonByEra`. A new character gets a profile there (`default` and `canonByEra`). When a production model exists, the same outfit id takes a `glb` entry (a replacement body, material colours by name, meshes on joint sockets) — no code changes. Run `node tests/run-tests.js`: `SL.Wardrobe.validate()` names unknown ids, missing components or model files, and any canon look from a later era.

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
| **0.2 (current frozen playable build)** | Local three.js, Goku showcase, visual foundation, Chapter 1 (Raditz), first What-If, schema validation. |
| **0.3 (in development, main folder)** | Chapters 2–3 (One Year, Saibamen, Nappa, Vegeta + Great Ape), playable Piccolo, Kid Gohan, Krillin, Tien, Chiaotzu, Yajirobe prototypes, What-If branches (Bardock's broadcast, the tail hold, Vegeta refusing the moon, the x20 bursts, Piccolo surviving Nappa), radial skill menu, balance telemetry, `.glb` pipeline, human-playtest fixes (flight, targeting, group fights), Snake Way run, boss attention in party battles. |
| 0.4 (planned; first mission already in the 0.3 folder) | Namek foundation, continuing chronologically with prototype characters: *A Prince on Namek* (Cui, Dodoria) exists; Zarbon, the Ginyu Force and Frieza are next. |
| Later | Frieza, Androids/Cell, Majin Buu, Super arcs up to the Tournament of Power; Dragon Balls and Shenron, tournament, customization, fusion (see `MASTER_SPEC.md`). |
| Art track (parallel) | Replace prototype bodies with production `.glb` models and real animation when approved art exists (`assets/models/README.md`). |
