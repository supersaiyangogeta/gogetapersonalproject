# Astra What-If Bible

## Status

**NON-AUTHORITATIVE STORY DESIGN DOCUMENT**  
**STORY DESIGN ONLY — FOR PRIMARY-DEVELOPER REVIEW**  
Prepared 2026-09-23. Claude Code remains the primary developer and architect. MASTER_SPEC.md remains the sole authoritative project specification.

This is a large selection library, not an implementation plan or a request to build every entry. The latest request deliberately broadens the earlier limited shortlist. MASTER_SPEC §16 still favors individually polished scenarios until canon is stable. LARGE and MAJOR routes are retained as future options. No scenario is ranked best or worst.

**Evidence labels:** CONFIRMED EXISTING CONTENT means inspected local definitions, script behavior or source. PLANNED BASELINE means a direction in MASTER_SPEC, not playable content. PROPOSED STORY DESIGN means everything in the idea cards, including objectives, scenes, endings, unlocks and future mechanics. EXPERIMENTAL means an unresolved premise or deliberate departure requiring a design decision. SECRET is a discovery/presentation tag, not a scope.

Scope: SMALL = one compact encounter using established rules; MEDIUM = a substantial mission or two linked encounters with a new objective; LARGE = several authored missions or a substantial subsystem/content requirement; MAJOR = a saga replacement, novel playable body/fusion/world, or dependencies on several unbuilt systems. Counts are design shapes, not estimates in days. A familiar location does not make an unbuilt character or mechanic cheap.

Local inspection only. No external canon reference was used. Later-era details are proposals based on the specification and the user's prompts; exact franchise chronology, fusion rules and wish eligibility need primary-developer validation before selection. This avoids presenting remembered lore as inspected implementation.

## Existing Story Audit

### CONFIRMED EXISTING CONTENT: chronology and player agency

Source map: `src/data/story.js` orders the live campaign. Mission scripts in `src/data/missions/` and scene scripts in `src/data/scenes/` establish the following. Chapter numbering in the current implementation differs from the eventual full chronology in MASTER_SPEC because original Dragon Ball is not implemented here. A selectable chapter labeled “in development” is a functional prototype, not a claim of final quality.

| Current chapter / start | Inspected mission order and playable content | Fixed events, relationships and agency |
|---|---|---|
| Prologue, Age 737 | `prologue_final_stand`: Bardock fights blockade troops, gunners, pods and elites in orbit; final confrontation and staged ending | Bardock's resistance cannot save Planet Vegeta. Destruction, his death, a future vision and the Earth-bound child close the prologue. Combat performance is agency; survival is not an existing branch. |
| 1, Age 761 | `saiyan_brothers`: Goku/Piccolo vs Raditz; tail interruption, charge cover, Gohan outburst, final hold | Kidnapping creates the reluctant alliance. Tail release and Gohan's burst are authored. Piccolo's attack kills Goku and Raditz. Arrival warning establishes one year. A successful hold preserves this intended outcome. |
| 2, Age 761–762 | `saiyan_survival`, `saiyan_snakeway`, `saiyan_kingkai`: Gohan's wilderness, dinosaur escape, Piccolo vs Great Ape Gohan and moon destruction; Goku's run, Bubbles/Gregory and Kaioken training | Mentor bond grows through play. Survival, flight, Masenko and progressively taught Kaioken matter. Goku is dead during training, revived before returning; training success is not a current arrival-time branch. |
| 3, Age 762 | `saiyan_saibamen`, `saiyan_nappa`, `saiyan_vegeta`: Tien/Yamcha opening, party swarm, hold the line, Goku vs Nappa, Vegeta duel/clash, giant survival/tail counter, Krillin/Gohan and playable Great Ape Gohan | Yamcha, Chiaotzu, Tien and Piccolo fall in authored beats. Goku arrives; Vegeta executes defeated Nappa. Vegeta's artificial moon changes the fight. Goku is badly hurt; allies matter. Vegeta survives and retreats after mercy. Tail solutions, party switching and combat performance are meaningful tactics, not persistent plot choices. |
| 4a, Namek arrival | `namek_hunted`, `namek_vegeta`, `namek_zarbon`, `namek_rematch`, `namek_guru` | Krillin/Gohan rescue Dende and evade Dodoria. Vegeta defeats Cui/Dodoria, learns the destruction truth, loses to monster Zarbon, recovers and wins the rematch. Guru's potential release changes Krillin. Rescue/escape, duel and transformed-boss objectives are playable; alliances are authored. |
| 4b, Ginyu Force | `namek_guldo`, `namek_recoome`, `namek_ginyu_pair`, `namek_ginyu`, `namek_frog` | Time-stop pressure; Vegeta then Krillin/Gohan endure Recoome. Goku arrives and overwhelms him. Burter/Jeice fight together; Vegeta finishes Burter; Jeice flees then dies in cleanup. Ginyu steals Goku's body; the player uses the damaged Ginyu body, then intercepts the swap aimed at Vegeta. The frog defeats the last attempt. This is an actual body/ability gameplay change, not just dialogue. |
| 4c, Frieza escalation | `namek_nail`, `namek_frieza1`, `namek_gohan_frieza2`, `namek_frieza2`, `namek_vegeta_end` | Nail delays Frieza, regenerates an arm and merges with Piccolo. Vegeta/party face first and second forms; Gohan's rage is not SSJ. Piccolo fights second form and is outclassed by third; final form follows. Current Vegeta-death mission stages Goku's arrival, the killing beam, last words and burial; do not infer a playable rescue fight from older blurbs. |
| 4d, Namek climax | `namek_goku`, `namek_kaioken20`, `namek_spirit_bomb`, `namek_super_saiyan`, `namek_end`, `namek_aftermath` | Base and progressively higher Kaioken lead to x20's failed beam. Player Piccolo defends the Spirit Bomb charge with Gohan/Krillin; apparent victory fails. Piccolo intercepts a beam and is down, not killed there. Krillin's murder triggers Goku's SSJ; Gohan evacuates Piccolo. Frieza damages the core; 100% duel, eruptions and flight escape follow. Wishes are staged; Frieza's ship fails; Goku seeks a Ginyu pod. No ending choice currently creates a new timeline. |
| 5, Age 764 then 767 | `android_trunks`, `android_warning`, `android_nineteen`, `android_fever`, `android_lab`, `android_road` | Trunks kills Mecha Frieza and Cold, tests Goku and delivers warning/medicine. Goku's virus interrupts Android 19; Vegeta finishes 19; Gero runs. The Fever is intentionally cinematic. Trunks chases Gero and breaks capsules, but cannot avert canonical activation. 17 kills Gero. 18 beats Vegeta; Trunks covers him. Absorbers reward fists, not ki. The chapter's Age 764 label does not date all its missions. |
| 6, Age 767 | `cell_first`, `cell_semi`, `cell_perfect`, `cell_games` | Piccolo pressures regenerating Imperfect Cell, who escapes. 17 is absorbed; Tien buys time. Vegeta allows 18's absorption; Vegeta/Trunks face the result. Cell Games alternates Goku fights, forfeit/senzu, reluctant Gohan, Juniors, 16's death, SSJ2, 18 expelled, self-destruction/Goku sacrifice, Cell return and Father–Son beam. The climax is played; winning earlier does not currently cancel the fixed sequence. |
| 7, Age 774 | `buu_years`, `buu_saiyaman`, `buu_kids` | Gohan flies to school, becomes Saiyaman, restrains robbers around civilians and spars with Videl. Goten/Trunks demonstrate SSJ in play. Videl initially has no flight; her later lesson matters. |
| 8, tournament | `buu_flight`, `buu_junior`, `buu_spopovich`, `buu_kibito` | Learned flight, real bracket/ring-outs, Trunks/Goten and Satan exhibition. Piccolo forfeits to Shin. Videl cannot canonically beat regenerating Spopovich here. Gohan powers up for Kibito; resisting the theft does not stop it. Goku's halo marks a temporary return, not resurrection. |
| 9, wizard | `buu_pursuit`, `buu_puipui`, `buu_yakon`, `buu_dabura`, `buu_majin` | Concealed-power pursuit; Babidi disposes of servants; story petrifications. Vegeta defeats Pui Pui, Goku overloads Yakon, Gohan pushes Dabura until recall. Vegeta accepts the mark; Goku fights him; crowd violence and Buu's awakening are authored. Babidi is a scene/system presence, not an ordinary fighter. This is the current playable endpoint. |

The earlier load-only inspection found 53 registered mission definitions: 51 canonical entries including the prologue, plus two What-Ifs. Namek has 21 ordered missions. Documentation snapshots that report 52 definitions/20 Namek missions lag this inventory. No full game playthrough or test-suite pass was performed for this story-design document.

**Unlock consequences:** `src/data/unlocks.js` actually grants Bardock/orbit/menu scene from the prologue; Raditz/plains/What-If mode from Chapter 1; Kid Gohan/wilderness, King Kai stage, Krillin/Tien/Yamcha, Piccolo/Chiaotzu and Yajirobe across Saiyan chapters; Namek stage; Future Trunks/coast; teen Gohan; adult Gohan, Saiyaman/Satan City, Goten/Kid Trunks, Videl, tournament stage and Dabura. Descriptive mission `rewards` text is not itself a save grant. Story-taught forms/techniques and Free Battle unlocks must not be conflated.

### PLANNED BASELINE, not confirmed playable missions

MASTER_SPEC includes original Dragon Ball (Bulma/Dragon Balls, Roshi/Krillin training, tournaments, King Piccolo, Piccolo Jr.); expanded chamber training; later Buu (Fat/Evil/Super Buu, absorption, Gotenks, Old Kai/Ultimate Gohan, Vegito, inside Buu, Earth destruction, Kai world, Good Buu and final Spirit Bomb); then Battle of Gods, Resurrection of F, Universe 6, Future Trunks/Zamasu and Tournament of Power. Movies/Specials stay outside chronological canon. Android 15 was not established as implemented content in the inspected roster/story; it appears here only as an experimental Movies/Specials-adjacent idea.

## Existing What-If Audit

### Existing 01 — What if Goku defeated Raditz?

**Files:** `src/data/missions/saiyan_raditz.js` (definition `whatif_raditz`), `src/data/story.js`, `src/core/save.js`.

- Trigger/access: clearing `saiyan_brothers` unlocks a separate selectable alternate mission. `branchPoint: hold` describes its story placement; it is not a live canonical branch switch.
- Divergence: recap places the player after Gohan's outburst. Goku's refusal to die is scripted setup, then the player must make the alternative work.
- Play: Goku and allied Piccolo wear injured Raditz down; a real Kamehameha/Double Sunday timing duel follows. Early release is weaker but winnable, flare timing helps, late release is forced point-blank; three actual lost clashes fail. It is not merely a changed death scene.
- Immediate ending: defeated Raditz remains alive and is told to leave. Departure/reformation/recruitment is not demonstrated. Piccolo disagrees with mercy. Vegeta has heard about Dragon Balls; the year-long threat remains.
- Changed cinematic/relationship: refusal replaces the sacrificial hold; aftermath keeps Goku alive and sharpens Piccolo's distrust.
- Progression: no subsequent alternate training or invasion missions. Ending explicitly raises the missing King Kai training. No existing SSJ, Kaioken or Spirit Bomb reward should be inferred.
- Save: completion, clear count and best result go to the What-If track. No unique persistent unlock rule was found for clearing this mission.

### Existing 02 — What if Piccolo survived Nappa?

**Files:** `src/data/missions/whatif_piccolo.js`, `src/data/story.js`, `src/core/save.js`.

- Trigger/access: clear `saiyan_nappa`, then select this separate mission. `branchPoint: sacrifice` is descriptive metadata.
- Divergence/play: Piccolo meets the mouth blast with a short real struggle rather than taking the fatal hit. Failure kills him and fails this alternate mission; it does not jump into canon.
- Changed battle: Piccolo/Gohan party against Nappa, with switching and an optional Light Grenade trap. A one-use joint attack requires Piccolo control, living Gohan and Nappa's broken poise; its beam delivery is staged after the earned activation. This is not a globally learned team technique.
- Ending: Nappa is beaten/kneeling, not confirmed killed. Piccolo lives, praises Gohan; Vegeta mentions Namek's Dragon Balls. No playable Vegeta follow-up or Namek journey is present.
- Character consequences: the mentor survives and their bond is strengthened. Other fallen fighters are not automatically restored. Goku's arrival, Kami/Earth Dragon Ball consequences and Vegeta's later actions need future authoring.
- Save/progression: alternate result only; no unique persistent team-attack unlock rule found. No transformations are granted by this scenario.

### Architecture conclusion

The present implementation supports authored alternate **missions** with their own phases, checkpoints, party composition, objectives and endings. It does not provide an inspected persistent timeline graph that carries survivor lists, body ownership, changed wishes or form-learning history across an alternate saga. Larger routes can reuse encounter machinery, but require explicit route/progression design. “Already supported” never means “all content already exists.”

## Divergence Map

The following chronological families map to the stable idea IDs below. Every entry is PROPOSED STORY DESIGN; source anchors establish only its starting point.

| Era | Divergence families |
|---|---|
| Prologue / planned original DB | P01–P08: escape instead of last stand; rescuing another pod; information surviving; altered first hunt; Roshi/Krillin training; tournament cooperation; Tambourine interception; Piccolo Jr. victory |
| Raditz / training | S01–S10: tail hold, first beam, abduction, Piccolo's goal, withheld scouter information, missing King Kai, arrival time, technique emphasis, mentor cooperation, Great Ape control |
| Invasion / Vegeta | S11–S28: latch survival, rescues, psychic teamwork, Nappa's defeat/survival/betrayal, Piccolo living, moon and tail counterplay, Spirit Bomb transfer, mercy refused, injuries and defeat |
| Namek race | N01–N10: Cui/Dodoria/Zarbon choices, guardian rescue, Guru timing, Dragon Ball theft, premature summoning and wish refusal |
| Ginyu Force | N11–N19: Guldo breathing, Recoome defeat, Jeice/Burter regrouping, arrival timing, body ownership, swap interception and frog reversal |
| Frieza climax | N20–N32: Nail/Piccolo merger, Vegeta rescue, Kaioken cost, true Spirit Bomb victory, changed victim/awakening, early core attack, escape and wishes |
| Androids | C01–C10: Trunks timing/knowledge, Cold escape, virus treatment, absorber tactics, laboratory interception, android cooperation, 16 and civilian priorities |
| Cell | C11–C28: first escape, 17/18 absorption, Tien endurance, Vegeta/Trunks conflict, chamber pairing, senzu, 16, SSJ2 timing, regeneration, sacrifice, beam defeat, future return |
| Buu opening | B01–B12: public identity, Videl training, tournament outcomes, energy theft, pursuit, petrification, ship opponents, refusal of Majin bargain |
| Planned later Buu | B13–B36: sacrifice, SSJ3, Babidi control, Satan/Good Buu, failed/sustained fusion, absorption targets, Ultimate timing, Potara, internal rescue, planet evacuation, wish order and final energy gathering |
| Planned later eras | F01–F12: ritual consent, rivalry, invasion rescue, tournament team tactics, time assassin, sealed enemies, future evacuation and Tournament of Power substitutions |
| Secret / experimental extensions | X01–X12: hidden performance conditions, alternative fusion identities, body-change comedy, unusual android program and bounded challenge worlds |

These families deliberately include related alternatives. Entries are separate selectable premises by default, not a proposal to implement every permutation in one campaign.

## Proposed What-If Scenarios

### Reading the scenario cards

All 156 cards below are **PROPOSED STORY DESIGN**. Their source anchors identify a starting event, not an existing branch implementation. Each card includes a concrete playable premise, an interactive cinematic opportunity, a four-to-five-event consequence chain, a local ending, scope, dependencies and a continuity delta. A chain is not automatically five missions: several beats can fit into one mission.

**Canon timeline → divergence → separate What-If branch → authored ending.** Default: no automatic canon rejoin. A finite alternate ending does not mean a whole replacement franchise chronology has been designed. Rejoin candidates must match survivors, injuries, knowledge, forms, items and wishes; they cannot merely arrive at the same battlefield.

**Reward contract R:** every card proposes a named alternate-clear record using its title and replay of that mission. Optional challenge rematches may use only approved available fighters/stages. No card silently unlocks its story form or character in canonical missions. Cosmetic/gallery rewards remain optional future features, not promises that the current UI supports them.

**Continuity contract L:** each card inherits its ledger below only at the divergence. Explicit changes in its card override that starting state. Unmentioned people do not teleport, resurrect, learn a technique or acquire information. After the proposed chain's endpoint, later canon missions are *not* automatically valid. “Unresolved” identifies an actual design blocker, not permission to assume a convenient answer.

| Ledger | Who/where, injuries and deaths at the starting window | Forms, techniques, information, wishes and mission-order constraints |
|---|---|---|
| L-P | Prologue: Bardock in orbit; planet and child departure belong to the destruction sequence. Planned original-DB concepts use young versions, not current adult kits. | Vision is incomplete, not omniscience. No Bardock SSJ. Early DB has no assumed flight/late transformations. Wish rules and early stages are future work. |
| L-S1 | Raditz encounter: Goku/Piccolo/Gohan/Raditz on Earth; Gohan kidnapped then intervenes; Goku/Raditz die only at the sacrificial ending unless overridden. | No Kaioken, Spirit Bomb, SSJ or IT. Saiyans learn of Dragon Balls through the stated communication; disrupting it changes their knowledge. Goku living means no ordinary dead-Goku training route. |
| L-S2 | Training: Goku dead in Other World, Gohan/Piccolo on Earth. Revival and return precede intervention. | Kaioken starts at taught levels, not x20. Moon/tail states and Piccolo/Kami dependence constrain wishes. Training routes do not provide travel shortcuts without cause. |
| L-S3 | Saibamen/Nappa: roster deaths accumulate in order. Before Yamcha latch he lives; before Chiaotzu sacrifice he lives; before Piccolo sacrifice he lives. Goku arrives only at the designated beat. | Earth fighters have current-era kits. Piccolo's death affects the guardian/Dragon Ball problem. No resurrection between phases unless an authored wish exists. Nappa's execution is later than his defeat. |
| L-S4 | Vegeta fight: Nappa executed in canon; Piccolo/Tien/Chiaotzu/Yamcha fallen; Goku's injuries worsen through the giant sequence; Krillin/Gohan/Yajirobe remain relevant. | Kaioken/Spirit Bomb belong to Goku's training. Artificial moon and Gohan tail govern giant events. Mercy changes Vegeta's later availability. Current route is not a simulation of the whole next saga. |
| L-N1 | Early Namek: Gohan/Krillin/Dende and Vegeta occupy separate routes; Goku is traveling. Cui/Dodoria/Zarbon deaths follow their fights, not beforehand. | No SSJ/IT. Guru potential release is not unlimited power. Track every Dragon Ball owner/location and interpreter; complete possession is insufficient to authorize a wish. |
| L-N2 | Force window: Vegeta/children become badly injured; Goku arrives with finite aid. Burter/Jeice/captain fates depend on exact phase. | No SSJ/IT. Body Change separates mind, body, health and training. Do not grant technique mastery with anatomy; revived Force members require explicit cause. |
| L-N3 | Nail/Frieza forms: Nail critically injured before merger; Piccolo's arrival requires prior revival/transport; Vegeta remains alive until the killing-beam scene. | Nail merger is available only after consent/meeting. Gohan rage is not SSJ. Dende/Guru/wish timing is not fully specified by this document; it must be reconstructed before changing wishes. |
| L-N4 | Post-Vegeta-death / Spirit Bomb: Vegeta dead unless rescued; Goku exhausted; Piccolo/Gohan/Krillin alive during the charge; Piccolo's later beam interception downs him. | Kaioken levels follow actual training. No SSJ until its authored awakening. A successful bomb removes Krillin's death trigger and later core attack unless new events cause them. |
| L-N5 | SSJ/escape: Krillin killed; Goku SSJ; Piccolo injured; Gohan evacuating; Namek's core damaged; Frieza's condition changes through final battle. | No IT learned yet. Escape vessel, passenger capacity and wish recipients cannot be assumed. Current wish scene is a compressed adaptation, not a verified complete wish ledger. |
| L-C1 | Trunks arrival, Age 764: Frieza/Cold arrive on Earth; Trunks from a separate future; Goku returns. | Goku has the return-era technique demonstrated in the arrival scene; Trunks SSJ/sword. Only Trunks initially knows the warning and family facts. Changing this world does not automatically repair his future. |
| L-C2 | Androids, Age 767: Goku ill, then recovering at home; Vegeta/Trunks pursue; 17/18 activated; Gero dies in the laboratory sequence. | 19/20 absorb ki; 17/18 differ mechanically. Medicine is not a senzu. Known laboratory location comes from pursuit/evidence. Cell's independent emergence cannot be erased by merely killing Gero. |
| L-C3 | Cell before Games: Piccolo/Tien/androids face successive absorption risks; 17 is inside Cell after first absorption, 18 after second. | Regeneration persists unless countered. Chamber history must account for elapsed training time. Piccolo/Kami merger details are not established by the focused mission excerpts and must be checked before a merger-based branch. |
| L-C4 | Cell Games: Goku alive until sacrifice, 16 alive until crushed, Gohan's SSJ2 comes at awakening, 18 expelled before self-destruction; return/injuries then change final participants. | Goku knows IT; that does not prove unlimited teleport timing or safe destinations. Absorbed is not dead. A spared Cell senzu is one conserved item. Gohan's SSJ2 cannot be assumed in an earlier branch. |
| L-B1 | Early Buu/tournament: Gohan adult; children SSJ; Videl learns flight in stages; Goku's return has a halo/time limit; theft occurs after power demonstration. | Videl has no Saiyan forms/ki artillery. No fusion lesson yet. Buu knowledge belongs to Kai's disclosure, not every spectator. Tournament ring-out differs from death. |
| L-B2 | Wizard: pursue couriers to locate ship; story petrifications constrain available heroes; Dabura recalled before Majin offer; Goku/Vegeta duel fuels crisis. | Babidi is never an ordinary fighter. Pui Pui gravity, Yakon absorption, Dabura stone and Vegeta's deliberate bargain are distinct mechanics. Captured energy is finite; stopping one source need not undo all others. |
| L-B3 | Later Buu is PLANNED BASELINE. Every selected card needs an authored roster of living, dead, petrified, absorbed, fused and visiting fighters at its precise start. | SSJ3 drain, Old Kai ritual, fusion teachers/items/duration, Buu absorption and wishes are dependencies, not inspected ready features. Card deltas specify proposed outcomes; missing rules are blocked, not silently repaired. |
| L-F | Later Super eras are PLANNED BASELINE; no inspected playable missions establish exact survivor/resource states. | Era-appropriate forms, arena rules, time travel and wish authority must be authored. Experimental conditions are not assertions about franchise rules. |
| L-X | Secret cards inherit their named saga ledger. Cross-era experiments have no valid canonical date and must be separately framed. | No secret unlock rewrites chronology. New fusions and Android 15 require explicit scope approval. A hidden condition should be hinted and replayable, not an unexplained impossible requirement. |

**Interactive cinematic rule:** the card's image is a proposed climax shot. Its preceding player action must earn the beat; afterward control returns to the next stated objective. Where the image is only a brief authored reveal, it is not misrepresented as an already designed QTE. Timed catches, beam redirects, fusion inputs and rescue movement are actual candidate interactions, not menus of dialogue choices.

### Scenario 01 — P01: Bardock Breaks the Blockade

**PROPOSED STORY DESIGN · MAJOR · survival**

- **Canon divergence point / source anchor:** prologue_final_stand. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Abandon the unwinnable beam contest; punch a corridor through escorts while protecting a damaged pod.
- **Player character(s):** Bardock. **New battle(s) / opponent(s):** Frieza's blockade.
- **Stage/environment consequences:** orbit / proposed escape corridor.
- **New interactive cinematic:** The Supernova fills the sky behind the playable escape.
- **Immediate consequence → new story path / mission consequences:** Pod survives → wounded Bardock hides → intercept a patrol for navigation → rescue prisoners → destroy a pursuit flagship and vanish.
- **Character/relationship consequences and continuity check:** Planet Vegeta still dies; Bardock has no SSJ and no reliable knowledge of adult Goku's location. Earth reunion is not granted.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Destroy a pursuit flagship and vanish. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Bardock Breaks the Blockade” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: vehicle escort and travel continuity; a new pursuit commander; survival credibility.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Vehicle escort and travel continuity; a new pursuit commander; survival credibility.

### Scenario 02 — P02: One More Pod

**PROPOSED STORY DESIGN · LARGE · rescue**

- **Canon divergence point / source anchor:** prologue_final_stand. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Alternate between clearing a launch lane and piloting an unarmed survivor through debris.
- **Player character(s):** Bardock / rescued soldier. **New battle(s) / opponent(s):** Frieza troops.
- **Stage/environment consequences:** orbit.
- **New interactive cinematic:** Bardock stays behind as control passes to the departing survivor.
- **Immediate consequence → new story path / mission consequences:** A second pod launches → Bardock still falls → survivor reaches a hostile outpost → steal fuel → broadcast proof of the purge.
- **Character/relationship consequences and continuity check:** Do not assume the survivor reaches Vegeta or knows Kakarot's destination; original planetary deaths stand.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Broadcast proof of the purge. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “One More Pod” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: playable escape vehicle, new survivor identity and outpost.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Playable escape vehicle, new survivor identity and outpost.

### Scenario 03 — P03: The Scouter That Would Not Die

**PROPOSED STORY DESIGN · MEDIUM · information**

- **Canon divergence point / source anchor:** prologue_ending. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Keep a transmitter intact long enough to send a fragmented warning before the final stand.
- **Player character(s):** Bardock. **New battle(s) / opponent(s):** communications squad.
- **Stage/environment consequences:** orbit.
- **New interactive cinematic:** A distant scouter receives only the words “Frieza” and “our world.”
- **Immediate consequence → new story path / mission consequences:** Transmission escapes → Bardock dies → a receiver hunts corroboration → Frieza sends a retrieval squad → proof survives in hiding.
- **Character/relationship consequences and continuity check:** No resurrection or omniscient warning; recipients and travel dates require explicit authoring.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** The challenge centers on the stated objective rather than a new health-bar boss.
- **Ending:** Proof survives in hiding. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Scouter That Would Not Die” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: transmission objective and a short receiver mission; receiver roster undecided.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Transmission objective and a short receiver mission; receiver roster undecided.

### Scenario 04 — P04: The First Wish Is Stolen

**PROPOSED STORY DESIGN · LARGE · wish**

- **Canon divergence point / source anchor:** planned original DB hunt. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Track stolen Dragon Balls through vehicles and ground combat; recover the last ball without breaking its carrier.
- **Player character(s):** Kid Goku / Bulma. **New battle(s) / opponent(s):** wish thieves.
- **Stage/environment consequences:** proposed early-DB landscape.
- **New interactive cinematic:** The dragon appears on the wrong horizon.
- **Immediate consequence → new story path / mission consequences:** Thieves summon → heroes pursue → a selfish limited wish strengthens a local ruler → rescue villagers → defeat the ruler without undoing the wish by fiat.
- **Character/relationship consequences and continuity check:** All early-DB cast, radar/hunt and wish rules are planned, not current; no flight or later forms.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Defeat the ruler without undoing the wish by fiat. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The First Wish Is Stolen” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: early-DB campaign foundation, vehicles, hunt and approved wish limit.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Early-DB campaign foundation, vehicles, hunt and approved wish limit.

### Scenario 05 — P05: Krillin Learns the Wave First

**PROPOSED STORY DESIGN · LARGE · training**

- **Canon divergence point / source anchor:** planned Roshi training. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Krillin earns a short unstable beam; Goku must win sparring through movement and pressure.
- **Player character(s):** Krillin / Kid Goku. **New battle(s) / opponent(s):** training rivals.
- **Stage/environment consequences:** proposed island / tournament.
- **New interactive cinematic:** Krillin's first wave destroys the wrong training target.
- **Immediate consequence → new story path / mission consequences:** Training order changes → rivals adapt → paired qualification challenge → Goku counters at the tournament → friendship survives the upset.
- **Character/relationship consequences and continuity check:** Early techniques only; no Solar Flare or flight assumed without training.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Friendship survives the upset. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Krillin Learns the Wave First” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: early-age fighters and lessons; bounded alternate tournament round.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Early-age fighters and lessons; bounded alternate tournament round.

### Scenario 06 — P06: Tien Breaks the Orders

**PROPOSED STORY DESIGN · LARGE · rivalry**

- **Canon divergence point / source anchor:** planned original tournament. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Turn a rigged match into a rescue and then win without attacking the endangered opponent.
- **Player character(s):** Tien / Yamcha. **New battle(s) / opponent(s):** hostile school rivals.
- **Stage/environment consequences:** tournament / proposed training grounds.
- **New interactive cinematic:** Tien redirects his finishing strike into the trap mechanism.
- **Immediate consequence → new story path / mission consequences:** Refusal exposes sabotage → protect Yamcha → escape retaliation → fight the mentor's champions → choose the honest rematch through play.
- **Character/relationship consequences and continuity check:** Specific conspirators and injuries are proposed, not inspected canon events.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Choose the honest rematch through play. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Tien Breaks the Orders” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: original-DB cast, trap objectives, new mentor encounter.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Original-DB cast, trap objectives, new mentor encounter.

### Scenario 07 — P07: Krillin Walks Out Alive

**PROPOSED STORY DESIGN · LARGE · rescue**

- **Canon divergence point / source anchor:** planned Tambourine attack. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Play the ambush as an escape with a wounded ally, then pursue the attacker together.
- **Player character(s):** Krillin / Kid Goku. **New battle(s) / opponent(s):** Tambourine.
- **Stage/environment consequences:** proposed tournament outskirts.
- **New interactive cinematic:** Goku arrives to a moving battle instead of a body.
- **Immediate consequence → new story path / mission consequences:** Krillin survives injured → attacker escapes → heroes follow evidence → evacuate the next target → fight a coordinated demon assault.
- **Character/relationship consequences and continuity check:** No later revival debt erased retroactively; Tambourine's identity/knowledge must be learned on-screen.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Fight a coordinated demon assault. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Krillin Walks Out Alive” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: demon cast, early-DB stages, injured-party encounter.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Demon cast, early-DB stages, injured-party encounter.

### Scenario 08 — P08: Piccolo Takes the Ring

**PROPOSED STORY DESIGN · MAJOR · villain victory**

- **Canon divergence point / source anchor:** planned Piccolo Jr. final. Baseline L-P; Prologue / original DB (partly planned).
- **What the player does / objective / special gameplay mechanic:** Win the final as Piccolo, then defend the prize against fighters refusing his rule; switch to a rescue squad.
- **Player character(s):** Piccolo Jr. / Goku. **New battle(s) / opponent(s):** Goku / resisting martial artists.
- **Stage/environment consequences:** tournament / proposed occupied island.
- **New interactive cinematic:** The champion's victory pose becomes a demand for submission.
- **Immediate consequence → new story path / mission consequences:** Goku loses but lives → spectators escape → Piccolo attempts control → rivals form a resistance → Goku earns a rematch with evacuation stakes.
- **Character/relationship consequences and continuity check:** A tournament win does not grant world domination; Kami link and Dragon Balls remain unresolved dependencies.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Goku earns a rematch with evacuation stakes. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Piccolo Takes the Ring” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: original campaign, political consequences kept playable, Piccolo Jr. identity.
- **Reusable existing systems:** Phases, flight, waves, scenes; original-DB foundation still needed.
- **New systems/content required / important risks:** Original campaign, political consequences kept playable, Piccolo Jr. identity.

### Scenario 09 — S01: Don't Let Go

**PROPOSED STORY DESIGN · MEDIUM · counterfactual victory**

- **Canon divergence point / source anchor:** saiyan_brothers tail. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Maintain the tail restraint while steering Raditz away from Gohan; switch to Piccolo to line up a safe shot.
- **Player character(s):** Goku / Piccolo. **New battle(s) / opponent(s):** Raditz.
- **Stage/environment consequences:** plains.
- **New interactive cinematic:** The Special Beam Cannon passes beside Goku rather than through him.
- **Immediate consequence → new story path / mission consequences:** Raditz falls → Goku lives → Piccolo demands training → no King Kai visit → the invasion needs a different defense.
- **Character/relationship consequences and continuity check:** Raditz dies only if the shot lands; Goku has no Kaioken/Spirit Bomb/IT. End before invasion rather than silently using canon.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** The invasion needs a different defense. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Don't Let Go” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: directional restraint and safe-fire geometry; local alternate endpoint.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Directional restraint and safe-fire geometry; local alternate endpoint.

### Scenario 10 — S02: The First Cannon Hits

**PROPOSED STORY DESIGN · MEDIUM · early victory**

- **Canon divergence point / source anchor:** saiyan_brothers onslaught. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Force Raditz into Piccolo's first firing lane using stagger and interception rather than sacrifice.
- **Player character(s):** Goku / Piccolo. **New battle(s) / opponent(s):** Raditz.
- **Stage/environment consequences:** plains.
- **New interactive cinematic:** Raditz's dodge meets Goku's shoulder and the beam catches him.
- **Immediate consequence → new story path / mission consequences:** Early kill → Gohan misses his rage breakthrough → Piccolo tests his potential differently → Goku remains alive → defenders must train together.
- **Character/relationship consequences and continuity check:** Gohan cannot inherit the skipped confidence event; scouter warning must be shown if retained.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Defenders must train together. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The First Cannon Hits” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: coordinated firing window and altered training epilogue.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Coordinated firing window and altered training epilogue.

### Scenario 11 — S03: The Child Leaves Earth

**PROPOSED STORY DESIGN · MAJOR · villain victory**

- **Canon divergence point / source anchor:** saiyan_brothers. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Win Raditz's extraction, then play Gohan escaping confinement while Piccolo pursues a stolen navigation trail.
- **Player character(s):** Raditz / Gohan / Piccolo. **New battle(s) / opponent(s):** Earth defenders / Saiyan jailers.
- **Stage/environment consequences:** plains / proposed carrier.
- **New interactive cinematic:** Control shifts from triumphant Raditz to the frightened child inside the pod.
- **Immediate consequence → new story path / mission consequences:** Abduction succeeds → Goku survives wounded → Piccolo follows coordinates → Gohan sabotages a base → rescue collides with Vegeta's orders.
- **Character/relationship consequences and continuity check:** No child SSJ; departure needs a vessel and travel time for pursuers; Raditz loyalty is not redemption.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Rescue collides with Vegeta's orders. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Child Leaves Earth” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: space travel, captivity objectives, carrier and changed invasion calendar.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Space travel, captivity objectives, carrier and changed invasion calendar.

### Scenario 12 — S04: Piccolo Takes His Shot

**PROPOSED STORY DESIGN · LARGE · rivalry**

- **Canon divergence point / source anchor:** saiyan_brothers hold. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Piccolo wins the sacrifice but immediately tries to claim Gohan; Krillin must extract the child without killing the needed guardian-linked fighter.
- **Player character(s):** Piccolo / Krillin. **New battle(s) / opponent(s):** Raditz / Piccolo.
- **Stage/environment consequences:** plains / wilderness.
- **New interactive cinematic:** Krillin stands between the victor and Gohan.
- **Immediate consequence → new story path / mission consequences:** Goku/Raditz die → custody fight → defensive training splits → Saiyans exploit separation → joint defense is earned mid-battle.
- **Character/relationship consequences and continuity check:** Piccolo's motives are an explicit alternate choice; Earth Dragon Ball dependency forbids casually killing him.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Joint defense is earned mid-battle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Piccolo Takes His Shot” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: nonlethal custody rescue and rival training missions.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Nonlethal custody rescue and rival training missions.

### Scenario 13 — S05: A Silent Scouter

**PROPOSED STORY DESIGN · LARGE · information**

- **Canon divergence point / source anchor:** saiyan_brothers. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Destroy the scouter before Dragon Balls are discussed; win the canonical sacrifice route, then intercept scouts seeking Raditz.
- **Player character(s):** Goku / Piccolo. **New battle(s) / opponent(s):** Raditz / later scouts.
- **Stage/environment consequences:** plains / wasteland.
- **New interactive cinematic:** The broken lens goes dark before the wish is mentioned.
- **Immediate consequence → new story path / mission consequences:** Goku/Raditz die → Vegeta lacks this lead → scouting replaces immediate invasion → heroes gain uncertain training time → face a reconnaissance raid.
- **Character/relationship consequences and continuity check:** No assumption that Saiyans never come; their independent motives remain. Goku still needs revival and return.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Face a reconnaissance raid. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “A Silent Scouter” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: reconnaissance mission and explicit alternate arrival timing.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Reconnaissance mission and explicit alternate arrival timing.

### Scenario 14 — S06: A Year Without King Kai

**PROPOSED STORY DESIGN · LARGE · existing-route extension**

- **Canon divergence point / source anchor:** whatif_raditz aftermath. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Train coordinated interrupts; defend the invasion with team positioning instead of Kaioken and Spirit Bomb.
- **Player character(s):** Goku / Piccolo / Gohan. **New battle(s) / opponent(s):** training partners / Nappa / Vegeta.
- **Stage/environment consequences:** wilderness / wasteland.
- **New interactive cinematic:** Goku tries to match Vegeta's burst and realizes there is no red aura to call on.
- **Immediate consequence → new story path / mission consequences:** Raditz is escorted out under watch → Earth training → Nappa pressure → tail ambush against Vegeta → costly Earth defense ends locally.
- **Character/relationship consequences and continuity check:** Continuation is proposed; existing Raditz departure is not established. No King Kai, IT or SSJ; Piccolo survival changes Namek motivation.
- **Form/transformation consequences:** No King Kai techniques; no SSJ or IT.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Costly Earth defense ends locally. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “A Year Without King Kai” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: three-mission route state, ensemble balance and explicit Raditz departure.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Three-mission route state, ensemble balance and explicit Raditz departure.

### Scenario 15 — S07: One Hour Earlier

**PROPOSED STORY DESIGN · MEDIUM · arrival**

- **Canon divergence point / source anchor:** saiyan_snakeway / saiyan_nappa. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Earn the earlier arrival through a demanding return run; prioritize rescues while Nappa changes targets.
- **Player character(s):** Goku. **New battle(s) / opponent(s):** Nappa / Saibamen.
- **Stage/environment consequences:** snakeway / wasteland.
- **New interactive cinematic:** Goku catches the attack before Piccolo has to step into it.
- **Immediate consequence → new story path / mission consequences:** Goku arrives → Piccolo survives → group corners Nappa → Vegeta fights an organized team → local ending preserves more defenders.
- **Character/relationship consequences and continuity check:** Goku must still finish training and be revived; running faster alone cannot reverse completed deaths.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local ending preserves more defenders. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “One Hour Earlier” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: alternate return clock, rescue tracking and team boss tuning.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Alternate return clock, rescue tracking and team boss tuning.

### Scenario 16 — S08: One Hour Too Late

**PROPOSED STORY DESIGN · LARGE · arrival**

- **Canon divergence point / source anchor:** saiyan_nappa. Baseline L-S2; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Withdraw survivors under fire, hide power and ambush a patrol to reach injured allies before Goku arrives.
- **Player character(s):** Krillin / Gohan / Yajirobe. **New battle(s) / opponent(s):** Nappa / Vegeta.
- **Stage/environment consequences:** wasteland / proposed refuge.
- **New interactive cinematic:** The familiar arrival shot reveals an empty battlefield.
- **Immediate consequence → new story path / mission consequences:** Piccolo's sacrifice stands → survivors retreat → Nappa pursues → Yajirobe creates an escape lane → Goku faces both Saiyans with hostages at risk.
- **Character/relationship consequences and continuity check:** No revived allies; Gohan remains a frightened novice. Villains need a reason to keep prisoners alive.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Goku faces both Saiyans with hostages at risk. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “One Hour Too Late” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: retreat/hostage route and two-boss coordination.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Retreat/hostage route and two-boss coordination.

### Scenario 17 — S09: The Red Aura Costs Too Much

**PROPOSED STORY DESIGN · MEDIUM · training**

- **Canon divergence point / source anchor:** saiyan_kingkai. Baseline L-S2; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Master brief x2 pulses and recovery rather than higher multipliers; survive the Galick contest through ally timing.
- **Player character(s):** Goku. **New battle(s) / opponent(s):** training hazards / Vegeta.
- **Stage/environment consequences:** kingkai / wasteland.
- **New interactive cinematic:** Goku deliberately drops Kaioken before his body gives out.
- **Immediate consequence → new story path / mission consequences:** Training emphasizes restraint → no x3 solution → allies interrupt Galick Gun → Goku stays mobile → final battle uses coordinated beams.
- **Character/relationship consequences and continuity check:** No invented higher form; keeping health requires giving up burst power, not a free buff.
- **Form/transformation consequences:** Only trained Kaioken pulses; higher output deliberately forgone.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final battle uses coordinated beams. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Red Aura Costs Too Much” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: alternate tutorial, constrained form rules and coordinated clash.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Alternate tutorial, constrained form rules and coordinated clash.

### Scenario 18 — S10: The Moon Is a Lesson

**PROPOSED STORY DESIGN · LARGE · giant / training**

- **Canon divergence point / source anchor:** saiyan_survival moon. Baseline L-S2; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Keep Gohan away from settlements and teach response to a voice cue instead of immediately destroying the moon.
- **Player character(s):** Piccolo / Great Ape Gohan. **New battle(s) / opponent(s):** rampaging instincts / Vegeta.
- **Stage/environment consequences:** wilderness / wasteland.
- **New interactive cinematic:** The giant hand stops inches from Piccolo.
- **Immediate consequence → new story path / mission consequences:** Moon survives → training remains dangerous → Saiyan arrival gains lunar stakes → Gohan contests Vegeta as a giant → Piccolo cuts the tail when control fails.
- **Character/relationship consequences and continuity check:** Great Ape control is experimental development, not innate mastery. Tail and moon states must persist; no permanent giant unlock in canon.
- **Form/transformation consequences:** Great Ape control experiment; no new biological form.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Piccolo cuts the tail when control fails. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Moon Is a Lesson” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: giant obedience/collateral objective and moon-state continuity.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Giant obedience/collateral objective and moon-state continuity.

### Scenario 19 — S11: Yamcha Sees the Latch

**PROPOSED STORY DESIGN · SMALL · survivor**

- **Canon divergence point / source anchor:** saiyan_saibamen yamcha. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Read the latch tell, throw the attacker into open ground and clear the remaining pack without approaching fallen enemies.
- **Player character(s):** Yamcha. **New battle(s) / opponent(s):** Saibamen.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** The explosion frames Yamcha standing beyond its edge.
- **Immediate consequence → new story path / mission consequences:** Yamcha lives → helps clear pack → extracts one wounded ally → Nappa approaches → ending stops before a new Nappa outcome.
- **Character/relationship consequences and continuity check:** No automatic survival of the entire invasion; no strength boost.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Ending stops before a new Nappa outcome. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Yamcha Sees the Latch” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** SMALL; 1 mission. Cost/risk: counter-latch finish and short survivor aftermath.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Counter-latch finish and short survivor aftermath.

### Scenario 20 — S12: Krillin Takes the Long Way

**PROPOSED STORY DESIGN · MEDIUM · rescue**

- **Canon divergence point / source anchor:** saiyan_saibamen pack. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Detour around the main swarm to intercept a second latch, then fight while covering Yamcha's retreat.
- **Player character(s):** Krillin / Yamcha. **New battle(s) / opponent(s):** Saibamen.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** A Destructo Disc severs the threat's approach without harming the ally.
- **Immediate consequence → new story path / mission consequences:** Rescue costs time → more Saibamen surround Tien → switch to relief → regroup battered survivors → begin Nappa defense together.
- **Character/relationship consequences and continuity check:** Disk accuracy must be earned; surviving Yamcha is injured, not reset to full health.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Begin Nappa defense together. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Krillin Takes the Long Way” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: multi-target rescue timer and friendly-fire-safe authored shot.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Multi-target rescue timer and friendly-fire-safe authored shot.

### Scenario 21 — S13: Chiaotzu Comes Back

**PROPOSED STORY DESIGN · MEDIUM · sacrifice refused**

- **Canon divergence point / source anchor:** saiyan_nappa holdLine. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Use psychic holds from moving cover, break line of sight before Nappa retaliates and refuse the suicide latch.
- **Player character(s):** Chiaotzu / Tien. **New battle(s) / opponent(s):** Nappa.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Tien catches Chiaotzu after the final exhausted hold.
- **Immediate consequence → new story path / mission consequences:** Chiaotzu lives depleted → Tien spends less life → hold until Goku → Nappa adapts to psychic tells → survivors escape his area burst.
- **Character/relationship consequences and continuity check:** Psychic control cannot immobilize Nappa indefinitely; no flight/ki mastery invented beyond his kit.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Survivors escape his area burst. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Chiaotzu Comes Back” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: paired stamina pressure and hold-break boss response.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Paired stamina pressure and hold-break boss response.

### Scenario 22 — S14: Three Eyes, One Opening

**PROPOSED STORY DESIGN · MEDIUM · teamwork**

- **Canon divergence point / source anchor:** saiyan_nappa holdLine. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Synchronize Solar Flare, a brief Tri-Beam pin and Piccolo's precision attack while protecting exhausted Tien.
- **Player character(s):** Tien / Piccolo / Krillin. **New battle(s) / opponent(s):** Nappa.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Nappa tears through the first pin and the second fighter takes over.
- **Immediate consequence → new story path / mission consequences:** Team injures Nappa → Tien avoids fatal overexertion → Nappa targets support → Gohan rescues Tien → Goku arrives to a survivable field.
- **Character/relationship consequences and continuity check:** Combo success injures rather than implausibly guarantees a kill; Chiaotzu's fate depends on branch start and is explicitly preserved.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Goku arrives to a survivable field. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Three Eyes, One Opening” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: shared support window and boss target escalation.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Shared support window and boss target escalation.

### Scenario 23 — S15: The Guardian Stays

**PROPOSED STORY DESIGN · LARGE · existing-route extension**

- **Canon divergence point / source anchor:** whatif_piccolo aftermath. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Continue the surviving mentor route with a coordinated Galick defense and giant tail rescue.
- **Player character(s):** Piccolo / Gohan / Goku. **New battle(s) / opponent(s):** Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Piccolo shields Goku this time, and Gohan takes the opening.
- **Immediate consequence → new story path / mission consequences:** Nappa remains beaten → Vegeta attacks → Goku joins on a stated arrival beat → coordinated giant fight → Earth survives with its guardian link intact.
- **Character/relationship consequences and continuity check:** Do not assume Nappa is dead; resolve him on-screen. Earlier human casualties remain; Namek journey needs a new reason.
- **Form/transformation consequences:** No new form; surviving Piccolo changes later guardian/merger needs.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Earth survives with its guardian link intact. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Guardian Stays” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: two-mission continuation, guardian/wish ledger and three-way boss timing.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Two-mission continuation, guardian/wish ledger and three-way boss timing.

### Scenario 24 — S16: Nappa Hears the Order

**PROPOSED STORY DESIGN · LARGE · villain alliance**

- **Canon divergence point / source anchor:** saiyan_nappa finale. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** As injured Nappa, evade Vegeta's execution blast; accept temporary cover, then intercept attacks aimed at the child.
- **Player character(s):** Nappa / Gohan. **New battle(s) / opponent(s):** Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Vegeta's discarded soldier blocks his next shot.
- **Immediate consequence → new story path / mission consequences:** Nappa survives crippled → heroes distrust him → Vegeta punishes defiance → Nappa provides a tail opening → surrender replaces instant friendship.
- **Character/relationship consequences and continuity check:** No moral conversion from one rescue; injuries remain severe; Goku has reason to restrain him afterward.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Surrender replaces instant friendship. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Nappa Hears the Order” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: playable injured Nappa, allegiance changes and conditional surrender.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Playable injured Nappa, allegiance changes and conditional surrender.

### Scenario 25 — S17: Nappa Waits for No One

**PROPOSED STORY DESIGN · MEDIUM · boss variation**

- **Canon divergence point / source anchor:** saiyan_nappa holdLine. Baseline L-S3; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Destroy planted seeds while defending Gohan; each missed seed becomes pressure during the boss phase.
- **Player character(s):** Piccolo / Krillin. **New battle(s) / opponent(s):** Nappa with Saibamen.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Nappa laughs as the ground opens behind the defenders.
- **Immediate consequence → new story path / mission consequences:** No courtesy pause → reinforcements split party → Gohan secures retreat → survivors hold a ridge → Goku arrives into a swarm fight.
- **Character/relationship consequences and continuity check:** A seed reserve is explicitly proposed; do not claim it exists in the canon Nappa encounter.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Goku arrives into a swarm fight. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Nappa Waits for No One” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: seed props and add-count objective; existing swarm/boss reuse.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Seed props and add-count objective; existing swarm/boss reuse.

### Scenario 26 — S18: Gohan Chooses His Father

**PROPOSED STORY DESIGN · LARGE · training / rivalry**

- **Canon divergence point / source anchor:** post-Raditz alternate Goku-survival premise. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Train rescue and evasive counters with Goku; later earn Piccolo's respect by returning to save him.
- **Player character(s):** Gohan / Goku / Piccolo. **New battle(s) / opponent(s):** training partners / Nappa.
- **Stage/environment consequences:** plains / wilderness / wasteland.
- **New interactive cinematic:** Gohan runs toward Piccolo instead of away from the battle.
- **Immediate consequence → new story path / mission consequences:** Father trains child → less harsh endurance → Nappa exposes weakness → Gohan saves mentor → joint final defense reconciles both teachers.
- **Character/relationship consequences and continuity check:** Requires a Goku-survives premise; cannot coexist with dead-Goku King Kai year unchanged.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Joint final defense reconciles both teachers. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Gohan Chooses His Father” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: linked lessons and altered technique curriculum; no free Masenko.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Linked lessons and altered technique curriculum; no free Masenko.

### Scenario 27 — S19: The False Moon Shatters

**PROPOSED STORY DESIGN · MEDIUM · giant counter**

- **Canon divergence point / source anchor:** saiyan_vegeta transform. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Identify and intercept the artificial-moon launch while the other fighter keeps Vegeta from shielding it.
- **Player character(s):** Krillin / Goku. **New battle(s) / opponent(s):** Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** A second sun dies before the giant silhouette forms.
- **Immediate consequence → new story path / mission consequences:** No Great Ape → Vegeta spends power defending the failed plan → wounded Goku needs help → base-form pursuit → Vegeta retreats or is captured in a local ending.
- **Character/relationship consequences and continuity check:** Destroying artificial moon is a proposed vulnerability requiring approval; Gohan's later ape beat cannot still occur unchanged.
- **Form/transformation consequences:** Vegeta's giant event prevented; Gohan's dependent giant event needs replacement.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Vegeta retreats or is captured in a local ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The False Moon Shatters” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: targetable moon projectile and rewritten final phase.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Targetable moon projectile and rewritten final phase.

### Scenario 28 — S20: Yajirobe Misses

**PROPOSED STORY DESIGN · MEDIUM · rescue / giant**

- **Canon divergence point / source anchor:** saiyan_vegeta greatApe. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Recover a knocked-away Yajirobe while baiting the giant's tail into a low flight lane for a disk attempt.
- **Player character(s):** Krillin / Gohan. **New battle(s) / opponent(s):** Great Ape Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** The sword falls short; the giant turns toward the hiding place.
- **Immediate consequence → new story path / mission consequences:** First cut fails → giant crush threat rises → rescue Yajirobe → Krillin earns tail shot → exhausted survivors face base Vegeta.
- **Character/relationship consequences and continuity check:** Goku's injuries stand; Krillin's disk is not an automatic giant kill.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Exhausted survivors face base Vegeta. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Yajirobe Misses” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: alternate tail route, rescue staging and giant attention.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Alternate tail route, rescue staging and giant attention.

### Scenario 29 — S21: Gohan Holds the Tail

**PROPOSED STORY DESIGN · MEDIUM · giant / sacrifice**

- **Canon divergence point / source anchor:** saiyan_vegeta gohanApe. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Protect the tail and herd Vegeta away from injured allies rather than winning by uncontrolled collapse.
- **Player character(s):** Great Ape Gohan / Krillin. **New battle(s) / opponent(s):** Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Gohan's giant fist opens to shelter his father.
- **Immediate consequence → new story path / mission consequences:** Tail survives longer → allies evacuate → Vegeta targets the moon → Gohan pins him → voluntary tail cut ends the rampage.
- **Character/relationship consequences and continuity check:** Control remains partial and temporary; surviving tail cannot silently persist into later canon.
- **Form/transformation consequences:** Existing Great Ape used for protection; tail-state exit explicit.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Voluntary tail cut ends the rampage. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Gohan Holds the Tail” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: giant escort objectives and voluntary de-transformation scene.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Giant escort objectives and voluntary de-transformation scene.

### Scenario 30 — S22: The Bomb Changes Hands Twice

**PROPOSED STORY DESIGN · MEDIUM · technique**

- **Canon divergence point / source anchor:** saiyan_vegeta desperate. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Relay the Spirit Bomb through successive deflections while Vegeta actively attacks the intended receiver.
- **Player character(s):** Krillin / Gohan. **New battle(s) / opponent(s):** Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** The glowing sphere returns from an angle Vegeta did not watch.
- **Immediate consequence → new story path / mission consequences:** First throw misses → Gohan redirects → Krillin shields Goku → final rebound hits → Vegeta's escape is stopped locally.
- **Character/relationship consequences and continuity check:** Energy is conserved; no new bomb generated by Krillin, no skipped training assumption for Goku.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Vegeta's escape is stopped locally. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Bomb Changes Hands Twice” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: multi-receiver projectile ownership and readable relay camera.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Multi-receiver projectile ownership and readable relay camera.

### Scenario 31 — S23: The Prince Does Not Leave

**PROPOSED STORY DESIGN · LARGE · mercy refused**

- **Canon divergence point / source anchor:** saiyan_vegeta retreat. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Finish or capture defeated Vegeta through an explicit alternate setup, then fight Namek patrols without his sabotage helping the heroes.
- **Player character(s):** Krillin / Gohan. **New battle(s) / opponent(s):** Vegeta / later Frieza scouts.
- **Stage/environment consequences:** wasteland / Namek premise.
- **New interactive cinematic:** The empty Saiyan pod never lifts off.
- **Immediate consequence → new story path / mission consequences:** Vegeta removed → Earth recovers → Namek expedition faces united Frieza forces → heroes must steal intelligence → escape rather than inherit Vegeta's victories.
- **Character/relationship consequences and continuity check:** Choose death OR custody before authoring; neither version can reuse his Namek kills, discoveries or later family unchanged.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Escape rather than inherit Vegeta's victories. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Prince Does Not Leave” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: major chronology fork, new intelligence encounters and no-Vegeta boss balance.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Major chronology fork, new intelligence encounters and no-Vegeta boss balance.

### Scenario 32 — S24: Goku Cannot Board the Ship

**PROPOSED STORY DESIGN · LARGE · injury**

- **Canon divergence point / source anchor:** post-saiyan_vegeta injuries. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Play the expedition without a last-minute Goku rescue; win through evasion, stolen supplies and separating the Force.
- **Player character(s):** Gohan / Krillin / Piccolo later. **New battle(s) / opponent(s):** Ginyu Force.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The expected landing trail is an empty sky.
- **Immediate consequence → new story path / mission consequences:** Recovery delays Goku → heroes survive patrols → exploit Force rivalry → pursue revival help → escape a captain-level showdown.
- **Character/relationship consequences and continuity check:** Travel and revival timing must be authored; Piccolo is not on Namek until restored/transported; no instant SSJ substitute.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Escape a captain-level showdown. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Goku Cannot Board the Ship” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: alternate Namek entry route, stealth/extraction and wish prerequisites.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Alternate Namek entry route, stealth/extraction and wish prerequisites.

### Scenario 33 — S25: Earth Under the Prince

**PROPOSED STORY DESIGN · MAJOR · villain victory**

- **Canon divergence point / source anchor:** saiyan_vegeta final. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Win as Vegeta, then switch to low-power resistance stealing pods and rescuing prisoners rather than dueling him head-on.
- **Player character(s):** Vegeta / Krillin / Gohan. **New battle(s) / opponent(s):** surviving defenders / Saiyan occupiers.
- **Stage/environment consequences:** wasteland / proposed occupied Earth.
- **New interactive cinematic:** The title victory belongs to the villain; control returns to an injured survivor.
- **Immediate consequence → new story path / mission consequences:** Vegeta captures Earth → Goku is imprisoned alive → Krillin/Gohan evade → sabotage forces Vegeta to expose supplies → final rescue launches resistance off-world.
- **Character/relationship consequences and continuity check:** Piccolo already dead in this baseline; Earth balls unavailable. Vegeta cannot wish immediately. No SSJ/IT for escapees.
- **Form/transformation consequences:** No new form compensates for occupation.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Final rescue launches resistance off-world. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Earth Under the Prince” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: occupation mini-campaign, prison/pod mechanics and explicit casualty ledger.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Occupation mini-campaign, prison/pod mechanics and explicit casualty ledger.

### Scenario 34 — S26: The Wish Comes Late

**PROPOSED STORY DESIGN · MEDIUM · wish / delay**

- **Canon divergence point / source anchor:** saiyan_kingkai wish. Baseline L-S2; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Alternate desperate holding action with Goku's delayed return; rescue thresholds buy playable seconds rather than changing a cutscene timer.
- **Player character(s):** Gohan / Piccolo / Goku. **New battle(s) / opponent(s):** Nappa / return-route hazards.
- **Stage/environment consequences:** wasteland / snakeway.
- **New interactive cinematic:** Goku hears the plea while still carrying a halo.
- **Immediate consequence → new story path / mission consequences:** Revival delayed → allies defend routes out → Goku revives → player races home → final arrival rescues only those actually protected.
- **Character/relationship consequences and continuity check:** Delay reason and Earth Dragon Ball availability must be stated; failure cannot revive earlier dead defenders for convenience.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final arrival rescues only those actually protected. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Wish Comes Late” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: linked timers and survivor-safe checkpoint reconstruction.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Linked timers and survivor-safe checkpoint reconstruction.

### Scenario 35 — S27: Vegeta Refuses the Moon

**PROPOSED STORY DESIGN · MEDIUM · rivalry**

- **Canon divergence point / source anchor:** saiyan_vegeta after clash. Baseline L-S4; Saiyan.
- **What the player does / objective / special gameplay mechanic:** Play a pride-bound rematch with both exhausted and no giant escape hatch; force a clean counter finish.
- **Player character(s):** Vegeta / Goku. **New battle(s) / opponent(s):** Goku / Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Vegeta crushes his own forming power ball.
- **Immediate consequence → new story path / mission consequences:** No giant → rivals fight at low resources → allies intervene to prevent a killing blow → Vegeta concedes escape → rivalry ends with an unpaid debt.
- **Character/relationship consequences and continuity check:** No giant means different Goku injuries and no Gohan-ape win; ending cannot claim identical canon state.
- **Form/transformation consequences:** No giant; exhausted base-form duel.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Rivalry ends with an unpaid debt. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Refuses the Moon” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: dual-perspective duel and resource carryover.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Dual-perspective duel and resource carryover.

### Scenario 36 — S28: Raditz Returns for the Wrong Reason

**PROPOSED STORY DESIGN · LARGE · unexpected cooperation**

- **Canon divergence point / source anchor:** whatif_raditz proposed continuation. Baseline L-S1; Saiyan.
- **What the player does / objective / special gameplay mechanic:** A surviving Raditz returns to steal Gohan but is targeted by his former comrades; protect the child to preserve his own escape route.
- **Player character(s):** Raditz / Piccolo. **New battle(s) / opponent(s):** Nappa / Vegeta.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Piccolo and Raditz brace the same beam and glare at each other.
- **Immediate consequence → new story path / mission consequences:** Raditz returns → Nappa attacks him → temporary alliance → Raditz must choose evacuation over theft through objective play → departs under guard.
- **Character/relationship consequences and continuity check:** Existing route never establishes his departure; author it first. No instant trust, new forms or knowledge of King Kai.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Departs under guard. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Raditz Returns for the Wrong Reason” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: conditional continuation, hostile-to-allied behavior and supervised exit.
- **Reusable existing systems:** Party, bosses, clashes/struggles, flight, giants, checkpoints.
- **New systems/content required / important risks:** Conditional continuation, hostile-to-allied behavior and supervised exit.

### Scenario 37 — N01: Cui's Last Bargain

**PROPOSED STORY DESIGN · MEDIUM · villain alliance**

- **Canon divergence point / source anchor:** namek_vegeta cui. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Spare Cui after disarming his scouter; use his clearance to ambush a supply patrol while preventing a warning transmission.
- **Player character(s):** Vegeta / Cui. **New battle(s) / opponent(s):** Frieza patrol.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Cui raises a hand to his scouter and finds Vegeta already watching.
- **Immediate consequence → new story path / mission consequences:** Cui bargains → supply raid succeeds → loyalty cracks under orders → Vegeta intercepts the betrayal → Cui escapes or accepts captivity.
- **Character/relationship consequences and continuity check:** Neither knows the heroes' private wish plan; Cui remains self-serving. No invented friendship or power increase.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Cui escapes or accepts captivity. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Cui's Last Bargain” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: conditional ally and communications sabotage.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Conditional ally and communications sabotage.

### Scenario 38 — N02: Dodoria Loses the Trail

**PROPOSED STORY DESIGN · MEDIUM · rescue**

- **Canon divergence point / source anchor:** namek_hunted. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Lead Dodoria through false ki trails while Dende guides civilians along a separate route; rescue instead of killing the boss.
- **Player character(s):** Krillin / Gohan. **New battle(s) / opponent(s):** Dodoria.
- **Stage/environment consequences:** Namek villages.
- **New interactive cinematic:** Dodoria smashes an empty shelter as the last child slips beneath it.
- **Immediate consequence → new story path / mission consequences:** Dende escapes with others → survivors guide heroes → Dodoria reports failure → patrols tighten → village defense replaces a solitary getaway.
- **Character/relationship consequences and continuity check:** Saved civilians are explicit new survivors, not the whole population; Dende's knowledge is local.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Village defense replaces a solitary getaway. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Dodoria Loses the Trail” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: decoy trail, evacuation groups and patrol response.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Decoy trail, evacuation groups and patrol response.

### Scenario 39 — N03: Dodoria Keeps One Secret

**PROPOSED STORY DESIGN · LARGE · information / betrayal**

- **Canon divergence point / source anchor:** namek_vegeta dodoria. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Capture Dodoria to extract navigation evidence through raids, not an exposition dump; keep him from signalling Frieza.
- **Player character(s):** Vegeta / Krillin. **New battle(s) / opponent(s):** Dodoria / Frieza enforcers.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** A damaged recording contradicts the official Planet Vegeta story.
- **Immediate consequence → new story path / mission consequences:** Dodoria withholds truth → Vegeta raids archives → heroes contest his prisoner → evidence breaks alliance with Frieza → escape a punitive strike.
- **Character/relationship consequences and continuity check:** Vegeta cannot act on the destruction truth before obtaining evidence; prisoner is not a reliable narrator.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Escape a punitive strike. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Dodoria Keeps One Secret” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: prisoner escort, intelligence props and follow-up raid.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Prisoner escort, intelligence props and follow-up raid.

### Scenario 40 — N04: Zarbon Finishes the Job

**PROPOSED STORY DESIGN · LARGE · villain strategy**

- **Canon divergence point / source anchor:** namek_zarbon aftermath. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Vegeta dies after his first defeat; steal Dragon Balls without his second campaign while avoiding Zarbon's transformation traps.
- **Player character(s):** Krillin / Gohan. **New battle(s) / opponent(s):** Zarbon.
- **Stage/environment consequences:** Namek / proposed ship exterior.
- **New interactive cinematic:** Vegeta's abandoned armor marks a missing future ally.
- **Immediate consequence → new story path / mission consequences:** Vegeta dies → Zarbon controls recovered balls → heroes infiltrate supply route → Ginyu arrives to secure it → extraction beats an army they cannot overpower.
- **Character/relationship consequences and continuity check:** No rematch Zenkai, no Vegeta killing Force members. Resurrection requires an explicit later wish.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Extraction beats an army they cannot overpower. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Zarbon Finishes the Job” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: no-Vegeta route, infiltration and revised Force battle order.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** No-Vegeta route, infiltration and revised Force battle order.

### Scenario 41 — N05: The Beautiful Traitor

**PROPOSED STORY DESIGN · LARGE · villain alliance**

- **Canon divergence point / source anchor:** namek_rematch beg. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Spare Zarbon in exchange for a route to the ship; use elegant and monster forms for stealth breach versus heavy defense.
- **Player character(s):** Vegeta / Zarbon. **New battle(s) / opponent(s):** Frieza retrieval squad / Ginyu.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Zarbon transforms to block fire meant for his temporary partner, furious at the necessity.
- **Immediate consequence → new story path / mission consequences:** Bargain → joint theft → Frieza orders capture → betrayal attempt during extraction → survivors separate with mutual blackmail.
- **Character/relationship consequences and continuity check:** Self-preservation, not redemption; monster form already known. Both need a reason not to kill each other.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Survivors separate with mutual blackmail. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Beautiful Traitor” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: dual villain party, betrayal checkpoint and ship objective.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Dual villain party, betrayal checkpoint and ship objective.

### Scenario 42 — N06: Zarbon Won't Show His Face

**PROPOSED STORY DESIGN · MEDIUM · boss variation**

- **Canon divergence point / source anchor:** namek_rematch. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Fight a Zarbon who refuses to revert and uses terrain to hide rush tells; expose him by destroying cover.
- **Player character(s):** Vegeta. **New battle(s) / opponent(s):** monster Zarbon.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The pleading elegant face never returns.
- **Immediate consequence → new story path / mission consequences:** Zarbon keeps monster form → Vegeta loses his expected opening → terrain breaks → a counter defeats him → battered Vegeta reaches the next encounter late.
- **Character/relationship consequences and continuity check:** No new transformation; prior recovery remains, but extra injuries carry forward within the route.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Battered Vegeta reaches the next encounter late. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Zarbon Won't Show His Face” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: cover-aware boss variant and injury endpoint.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Cover-aware boss variant and injury endpoint.

### Scenario 43 — N07: Guru's Door Holds

**PROPOSED STORY DESIGN · MEDIUM · guardian rescue**

- **Canon divergence point / source anchor:** namek_guru patrol. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Switch between an outside defender and a runner carrying wounded villagers to safety; keep attacks off the elder.
- **Player character(s):** Nail / Krillin. **New battle(s) / opponent(s):** elite patrol.
- **Stage/environment consequences:** Guru's plateau.
- **New interactive cinematic:** Nail catches a blast at the doorway without abandoning his post.
- **Immediate consequence → new story path / mission consequences:** Patrol fails → more survivors arrive → Guru can aid one waiting fighter → Frieza reroutes → guardian chooses evacuation over pursuit.
- **Character/relationship consequences and continuity check:** Guru cannot grant arbitrary infinite power; one approved potential release, not SSJ. Existing encounter does not prove all these civilians exist.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Guardian chooses evacuation over pursuit. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Guru's Door Holds” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: two-front defense and controlled potential-reward choice.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Two-front defense and controlled potential-reward choice.

### Scenario 44 — N08: The Last Ball Moves

**PROPOSED STORY DESIGN · LARGE · wish race**

- **Canon divergence point / source anchor:** Namek Dragon Ball race. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Steal a transported ball, hide its energy signature through terrain, then defend it against both factions without losing the escape vessel.
- **Player character(s):** Gohan / Krillin / Vegeta. **New battle(s) / opponent(s):** Frieza patrols / each other.
- **Stage/environment consequences:** Namek waterways.
- **New interactive cinematic:** Three fighters dive for one enormous ball as the carrier explodes.
- **Immediate consequence → new story path / mission consequences:** Ball stolen → summoning delayed → Vegeta bargains → Force hunts the carrier → heroes escape with a stalemate rather than a wish.
- **Character/relationship consequences and continuity check:** Ball locations/ownership need a new explicit ledger; possession is not language or password knowledge.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Heroes escape with a stalemate rather than a wish. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Last Ball Moves” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: carryable Dragon Ball, three-faction pursuit and inventory state.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Carryable Dragon Ball, three-faction pursuit and inventory state.

### Scenario 45 — N09: The Emperor Reaches Porunga

**PROPOSED STORY DESIGN · MAJOR · wish / villain**

- **Canon divergence point / source anchor:** proposed pre-final Namek summoning. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Frieza captures the summoning party; play a rescue and translation-delay objective, then destroy his control of the site.
- **Player character(s):** Dende / Nail / Krillin. **New battle(s) / opponent(s):** Frieza.
- **Stage/environment consequences:** Namek summoning site.
- **New interactive cinematic:** Frieza commands a wish and Porunga waits for someone else to speak.
- **Immediate consequence → new story path / mission consequences:** Capture → language blocks coercion → rescuers cut guards → Frieza attacks the guardian → final escape prevents the intended wish.
- **Character/relationship consequences and continuity check:** Frieza cannot bypass language/password because he holds the balls; immortality is not granted unless a separate approved variant specifies it.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final escape prevents the intended wish. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Emperor Reaches Porunga” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: wish ritual state, coercion/rescue without dialogue-tree dominance.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Wish ritual state, coercion/rescue without dialogue-tree dominance.

### Scenario 46 — N10: Dende Says No

**PROPOSED STORY DESIGN · LARGE · wish refusal**

- **Canon divergence point / source anchor:** proposed Vegeta wish demand. Baseline L-N1; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Protect the interpreter while transporting a ball out of Vegeta's reach; force cooperation through shared danger.
- **Player character(s):** Dende / Gohan / Krillin. **New battle(s) / opponent(s):** Vegeta / approaching Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Dende walks away from Vegeta's demand as Frieza's shadow arrives.
- **Immediate consequence → new story path / mission consequences:** Wish denied → Vegeta attacks → Frieza interrupts → heroes and prince defend the same route → evacuation replaces immortality.
- **Character/relationship consequences and continuity check:** Dende has agency and language knowledge; heroes do not learn the password instantly. Exact remaining wishes unresolved.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Evacuation replaces immortality. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Dende Says No” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: interpreter protection, ritual interruption and temporary three-way battle.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Interpreter protection, ritual interruption and temporary three-way battle.

### Scenario 47 — N11: Guldo Must Breathe

**PROPOSED STORY DESIGN · SMALL · boss counter**

- **Canon divergence point / source anchor:** namek_guldo. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Alternate pressure and cover to deny safe breath windows; rescue a frozen ally and defeat him before Vegeta intervenes.
- **Player character(s):** Krillin / Gohan. **New battle(s) / opponent(s):** Guldo.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Guldo inhales, finds Gohan already at his flank and loses the spell.
- **Immediate consequence → new story path / mission consequences:** Time trap broken → heroes win → Vegeta loses leverage → Recoome steps forward → ending freezes before the next battle.
- **Character/relationship consequences and continuity check:** No immunity to time stop; win comes from recovery windows, not raw power.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Ending freezes before the next battle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Guldo Must Breathe” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** SMALL; 1 mission. Cost/risk: breath-state telegraphs and alternate finisher.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Breath-state telegraphs and alternate finisher.

### Scenario 48 — N12: Recoome Falls Before the Pod

**PROPOSED STORY DESIGN · MEDIUM · upset victory**

- **Canon divergence point / source anchor:** namek_recoome. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Interrupt showboating with a three-part stagger and protect the exhausted finisher from counterattacks.
- **Player character(s):** Vegeta / Krillin / Gohan. **New battle(s) / opponent(s):** Recoome.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The expected finishing pose becomes a face-first fall.
- **Immediate consequence → new story path / mission consequences:** Recoome beaten → party remains hurt → Jeice/Burter attack together → survive their response → Goku arrives to conscious allies.
- **Character/relationship consequences and continuity check:** Victory requires a narrow team opening, not child power parity; senzu supply is finite and explicitly assigned.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Goku arrives to conscious allies. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Recoome Falls Before the Pod” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: team stagger sequence and revised arrival scene.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Team stagger sequence and revised arrival scene.

### Scenario 49 — N13: The Force Regroups

**PROPOSED STORY DESIGN · LARGE · villain team**

- **Canon divergence point / source anchor:** namek_ginyu_pair flight. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Escape as Jeice while extracting Burter, then fight as the regrouped Force using relay attacks against the heroes.
- **Player character(s):** Jeice / Burter / Ginyu. **New battle(s) / opponent(s):** Goku / Vegeta.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The formation has an empty Recoome position but three fighters remain.
- **Immediate consequence → new story path / mission consequences:** Burter rescued → captain recalls survivors → coordinated rematch → body-swap threat forces heroes apart → Force retreats under a costly truce.
- **Character/relationship consequences and continuity check:** Only rescued members survive; no resurrected Guldo/Recoome by default. Loyalty remains Frieza's unless changed on-screen.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Force retreats under a costly truce. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Force Regroups” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: enemy-perspective party, coordinated swap lanes and retreat ending.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Enemy-perspective party, coordinated swap lanes and retreat ending.

### Scenario 50 — N14: Goku Lands Before Recoome

**PROPOSED STORY DESIGN · LARGE · arrival**

- **Canon divergence point / source anchor:** namek_recoome opening. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Choose rescue order through movement; interrupt multiple attacks rather than erase the Force with one cutscene.
- **Player character(s):** Goku / Vegeta. **New battle(s) / opponent(s):** Recoome / Jeice and Burter.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Goku lands between the prince and the first heavy blow.
- **Immediate consequence → new story path / mission consequences:** Early landing → fewer wounds → Vegeta resents rescue → coordinated Force adapts → Ginyu attempts a less convenient swap.
- **Character/relationship consequences and continuity check:** Earlier travel needs an explicit alternate flight premise; no SSJ/IT; spared senzu do not multiply.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Ginyu attempts a less convenient swap. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Goku Lands Before Recoome” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: arrival rescue encounter and recalibrated body-change conditions.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Arrival rescue encounter and recalibrated body-change conditions.

### Scenario 51 — N15: No Pod in the Sky

**PROPOSED STORY DESIGN · MAJOR · arrival / survival**

- **Canon divergence point / source anchor:** namek_recoome arrival. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Escape rather than win, sabotage scouters, obtain local guidance and delay the wish race until transport is possible.
- **Player character(s):** Gohan / Krillin / Vegeta. **New battle(s) / opponent(s):** Ginyu Force / Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The survivors listen for an engine that never comes.
- **Immediate consequence → new story path / mission consequences:** Goku delayed → wounded team evades → steal a ball → rescue an interpreter → desperate extraction from Ginyu replaces the canonical rescue.
- **Character/relationship consequences and continuity check:** No easy victory over the Force; Dende/Guru states need confirmation; Goku's healing/body-change route never occurs.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Desperate extraction from Ginyu replaces the canonical rescue. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “No Pod in the Sky” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: four-to-six mission survival campaign and supply continuity.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Four-to-six mission survival campaign and supply continuity.

### Scenario 52 — N16: The Captain Keeps Goku

**PROPOSED STORY DESIGN · MAJOR · body change**

- **Canon divergence point / source anchor:** namek_ginyu retake. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Fail the retake premise deliberately; play the damaged borrowed body, protect allies and bait a new swap without letting Frieza capture either body.
- **Player character(s):** Goku in Ginyu / Krillin / Vegeta. **New battle(s) / opponent(s):** Ginyu in Goku / Frieza.
- **Stage/environment consequences:** Namek / proposed ship interior.
- **New interactive cinematic:** Goku's familiar face salutes Frieza while the player's hands are purple.
- **Immediate consequence → new story path / mission consequences:** Swap retained → heroes retreat → stolen-body captain overreaches → rival villains clash → staged counter-swap or escape ends the route.
- **Character/relationship consequences and continuity check:** Body does not confer Goku's knowledge/mastery or SSJ. Separate mind, body, injury and allegiance ledgers are mandatory.
- **Form/transformation consequences:** Body changes, not new transformation mastery; no SSJ/IT.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Staged counter-swap or escape ends the route. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Captain Keeps Goku” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: persistent body ownership across missions and techniques keyed to training versus anatomy.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Persistent body ownership across missions and techniques keyed to training versus anatomy.

### Scenario 53 — N17: Vegeta Catches the Beam

**PROPOSED STORY DESIGN · LARGE · body change**

- **Canon divergence point / source anchor:** namek_ginyu retake. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Recover two displaced fighters by herding swap beams through chosen lanes while allies physically shield the wrong targets.
- **Player character(s):** Vegeta in Ginyu / Goku. **New battle(s) / opponent(s):** Ginyu in Vegeta.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Vegeta hears his own voice taunting him from across the field.
- **Immediate consequence → new story path / mission consequences:** Vegeta stolen → broken-body player retreats → Goku regains his body by a new exchange → lure captain into a trap → restore or quarantine the last body.
- **Character/relationship consequences and continuity check:** Write every exchange explicitly; no duplication of souls or free health reset. No SSJ for Vegeta at this date.
- **Form/transformation consequences:** Body ownership changes; no new form or automatic learned technique.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Restore or quarantine the last body. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Catches the Beam” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: multi-body state table and swap-target readability.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Multi-body state table and swap-target readability.

### Scenario 54 — N18: Ginyu Aims Higher

**PROPOSED STORY DESIGN · LARGE · villain alliance**

- **Canon divergence point / source anchor:** namek_ginyu alternate aftermath. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** The captain attempts to steal Frieza; heroes keep both villains in the swap lane long enough to rescue their own bodies.
- **Player character(s):** Ginyu / Goku in borrowed body. **New battle(s) / opponent(s):** Frieza / loyal Force remnants.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Frieza catches the captain preparing an attack meant for his body, not his life.
- **Immediate consequence → new story path / mission consequences:** Ambition exposed → captain hunted → heroes exploit chaos → swap attempt threatens final-form control → evacuation ends before either tyrant is secure.
- **Character/relationship consequences and continuity check:** Frieza anatomy and Ginyu mastery are not interchangeable; successful theft of all forms is experimental, not established.
- **Form/transformation consequences:** Frieza body compatibility unresolved; no automatic access to mastered emperor forms.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Evacuation ends before either tyrant is secure. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Ginyu Aims Higher” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: boss body compatibility, villain distrust and explicit unresolved endpoint.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Boss body compatibility, villain distrust and explicit unresolved endpoint.

### Scenario 55 — N19: The Frog Gets Away

**PROPOSED STORY DESIGN · MEDIUM · SECRET / body change**

- **Canon divergence point / source anchor:** namek_frog lastTry. Baseline L-N2; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Prevent a third body theft without the frog solution: reflect, obstruct or deliberately redirect the lane into a prepared noncombat decoy.
- **Player character(s):** Goku / Vegeta. **New battle(s) / opponent(s):** Ginyu's last swap.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Goku reaches for the frog and catches empty air.
- **Immediate consequence → new story path / mission consequences:** Frog absent → captain prepares again → allies separate → decoy intercepts → Ginyu is contained for the local ending.
- **Character/relationship consequences and continuity check:** Decoy suitability to Body Change is unresolved; inanimate targets are not assumed valid. Use a living approved target or fail safely.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Ginyu is contained for the local ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Frog Gets Away” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: alternate living-target setup and humane containment; rule approval required.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Alternate living-target setup and humane containment; rule approval required.

### Scenario 56 — N20: Nail Stands Beside Piccolo

**PROPOSED STORY DESIGN · LARGE · fusion refused**

- **Canon divergence point / source anchor:** namek_nail fusion. Baseline L-N3; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Refuse merger and win time through alternating regeneration windows while escorting Dende; survival replaces a power contest.
- **Player character(s):** Nail / Piccolo. **New battle(s) / opponent(s):** Frieza second form.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Two Namekians stand where canon gives the player one.
- **Immediate consequence → new story path / mission consequences:** No merger → Piccolo lacks fused strength → protect interpreter → escape second form → wait for Goku rather than challenge third.
- **Character/relationship consequences and continuity check:** Nail is critically wounded; must be stabilized before combat. Neither inherits fusion power or knowledge.
- **Form/transformation consequences:** Nail merger refused; fused power unavailable.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Wait for Goku rather than challenge third. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Nail Stands Beside Piccolo” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: injured dual-party route, healing prerequisite and no-fusion form cap.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Injured dual-party route, healing prerequisite and no-fusion form cap.

### Scenario 57 — N21: Two Guardians, One Delay

**PROPOSED STORY DESIGN · LARGE · fusion earlier**

- **Canon divergence point / source anchor:** proposed earlier Nail/Piccolo meeting. Baseline L-N3; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Earn an earlier merger by reaching Nail before catastrophic injury; hold multiple evacuation lanes with stronger defense but limited time.
- **Player character(s):** Piccolo fused with Nail. **New battle(s) / opponent(s):** Frieza / Ginyu stragglers.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Frieza arrives at the elder's refuge and finds the merged guardian.
- **Immediate consequence → new story path / mission consequences:** Earlier arrival → voluntary merger → villages evacuate → Frieza transforms sooner → merged guardian buys Goku's recovery window.
- **Character/relationship consequences and continuity check:** Piccolo must already be revived and transported; fusion cannot make Dende omnipresent. No Orange form.
- **Form/transformation consequences:** Nail merger earlier only after revived Piccolo arrives.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Merged guardian buys Goku's recovery window. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Two Guardians, One Delay” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: reordered wish/arrival ledger and evacuation battle.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Reordered wish/arrival ledger and evacuation battle.

### Scenario 58 — N22: The Prince Takes One More Breath

**PROPOSED STORY DESIGN · LARGE · rescue**

- **Canon divergence point / source anchor:** namek_vegeta_end beam. Baseline L-N3; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Intercept the killing line, carry Vegeta out and survive Frieza's pursuit while the prince provides a weak covering blast.
- **Player character(s):** Goku / Piccolo / Vegeta. **New battle(s) / opponent(s):** final-form Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Vegeta tries to stand and cannot; Goku turns back to carry him.
- **Immediate consequence → new story path / mission consequences:** Beam diverted → prince lives badly hurt → Frieza hunts rescue party → Vegeta helps expose a firing lane → Spirit Bomb defense gains a fragile ally.
- **Character/relationship consequences and continuity check:** Rescue is newly playable, not currently available. No automatic Zenkai or healing; Dende availability must be settled.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Spirit Bomb defense gains a fragile ally. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Prince Takes One More Breath” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: carry/rescue mechanic, injury persistence and revised bomb defense.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Carry/rescue mechanic, injury persistence and revised bomb defense.

### Scenario 59 — N23: The Prince Turns Gold

**PROPOSED STORY DESIGN · LARGE · transformation / EXPERIMENTAL**

- **Canon divergence point / source anchor:** namek_vegeta_end alternate survival. Baseline L-N3; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** After an explicitly earned survival/recovery route, trigger a brief unstable SSJ surge through protecting another fighter; tag out when control collapses.
- **Player character(s):** Vegeta / Goku. **New battle(s) / opponent(s):** Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Vegeta's gold flickers as he shields the person he once threatened.
- **Immediate consequence → new story path / mission consequences:** Survival → protective choice → unstable awakening → Frieza targets exhaustion → Goku and Vegeta finish a relay battle.
- **Character/relationship consequences and continuity check:** Early Vegeta SSJ is a major alternate premise, not a latent current reward. Needs power/psychology justification and recovery time.
- **Form/transformation consequences:** Earlier unstable Vegeta SSJ: EXPERIMENTAL timing and control.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Goku and Vegeta finish a relay battle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Prince Turns Gold” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: new awakening scene, temporary-form behavior and revised rivalry arc.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** New awakening scene, temporary-form behavior and revised rivalry arc.

### Scenario 60 — N24: Twenty Is Not Enough Time

**PROPOSED STORY DESIGN · MEDIUM · technique cost**

- **Canon divergence point / source anchor:** namek_kaioken20. Baseline L-N4; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Use several short x20 bursts to destroy Frieza's firing positions; then defend a helpless Goku during recovery instead of attempting the giant beam.
- **Player character(s):** Goku / Piccolo. **New battle(s) / opponent(s):** Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The aura dies midair and Piccolo catches Goku before he falls.
- **Immediate consequence → new story path / mission consequences:** Burst plan injures Frieza → Goku collapses → allies buy recovery → bomb plan begins from worse positioning → retreat becomes the alternate ending.
- **Character/relationship consequences and continuity check:** No x50 or SSJ invented; exhausted Goku cannot immediately charge at full strength.
- **Form/transformation consequences:** Existing x20 with stricter recovery consequences.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Retreat becomes the alternate ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Twenty Is Not Enough Time” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: burst/recovery objectives and altered bomb setup.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Burst/recovery objectives and altered bomb setup.

### Scenario 61 — N25: The Spirit Bomb Works

**PROPOSED STORY DESIGN · LARGE · victory / aftermath**

- **Canon divergence point / source anchor:** namek_spirit_bomb impact. Baseline L-N4; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Hold extra exposed charge lanes, land a complete bomb, then rescue scattered villagers from the army's panic withdrawal.
- **Player character(s):** Piccolo / Goku / Krillin. **New battle(s) / opponent(s):** Frieza / surviving occupiers.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Silence after impact is real; a retreating ship opens fire on a village.
- **Immediate consequence → new story path / mission consequences:** Frieza dies → Krillin lives → no SSJ trigger or core attack → occupiers raid survivors → heroes secure an evacuation on an intact world.
- **Character/relationship consequences and continuity check:** Vegeta remains dead unless separately revived; no Mecha Frieza or automatic Yardrat/IT later. Wish state must be rebuilt, not copied.
- **Form/transformation consequences:** No canonical SSJ trigger; no subsequent automatic IT.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Heroes secure an evacuation on an intact world. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Spirit Bomb Works” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: post-victory rescue mission, army withdrawal and alternate wish ledger.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Post-victory rescue mission, army withdrawal and alternate wish ledger.

### Scenario 62 — N26: Krillin Pulls Piccolo Clear

**PROPOSED STORY DESIGN · LARGE · sacrifice / transformation**

- **Canon divergence point / source anchor:** namek_spirit_bomb sacrifice. Baseline L-N4; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Rescue Piccolo from the returned emperor, then survive a targeted execution attempt long enough for Goku to re-enter.
- **Player character(s):** Krillin / Goku. **New battle(s) / opponent(s):** Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** The killing grip closes on empty air because Krillin moved first.
- **Immediate consequence → new story path / mission consequences:** Piccolo stays mobile → Krillin survives → Goku has no canonical rage trigger → team flees a stronger emperor → local escape ends unresolved.
- **Character/relationship consequences and continuity check:** Do not trigger SSJ automatically with the death removed; no claim the team can defeat final Frieza conventionally.
- **Form/transformation consequences:** SSJ not automatically triggered when Krillin survives.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local escape ends unresolved. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Krillin Pulls Piccolo Clear” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: targeted rescue and escape alternative to awakening.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Targeted rescue and escape alternative to awakening.

### Scenario 63 — N27: Goku Is the One Who Falls

**PROPOSED STORY DESIGN · MAJOR · loss / changed survivor**

- **Canon divergence point / source anchor:** namek_spirit_bomb return. Baseline L-N4; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Frieza kills exhausted Goku; escape with survivors, protect the interpreter and deny pursuit rather than inventing an instant equal-power child.
- **Player character(s):** Gohan / Piccolo / Krillin. **New battle(s) / opponent(s):** Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Gohan's scream becomes a burst that opens a route, not a victory.
- **Immediate consequence → new story path / mission consequences:** Goku dies → child rage creates seconds → allies scatter → wish team extracts survivors → Frieza claims a ruined battlefield.
- **Character/relationship consequences and continuity check:** No SSJ2/Beast; Goku's revival eligibility and wishes require review. No canonical SSJ duel remains.
- **Form/transformation consequences:** Gohan rage only; no substitute SSJ2/Beast.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Frieza claims a ruined battlefield. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Goku Is the One Who Falls” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: alternate extraction climax and severe loss continuity.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Alternate extraction climax and severe loss continuity.

### Scenario 64 — N28: Golden for a Moment

**PROPOSED STORY DESIGN · LARGE · transformation delayed**

- **Canon divergence point / source anchor:** namek_super_saiyan awaken. Baseline L-N5; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** SSJ arrives but repeatedly collapses under exhaustion; alternate explosive offense with vulnerable base-form evasion and ally rescue.
- **Player character(s):** Goku / Gohan. **New battle(s) / opponent(s):** Frieza.
- **Stage/environment consequences:** Namek.
- **New interactive cinematic:** Gold disappears during Frieza's counter, exposing the exhausted fighter beneath it.
- **Immediate consequence → new story path / mission consequences:** Awakening → unstable reversal → ally extraction → short final surge → escape before a sustainable victory.
- **Character/relationship consequences and continuity check:** Krillin's death remains. This is a branch-specific instability, not a proposed canon-form nerf.
- **Form/transformation consequences:** Existing SSJ becomes temporarily unstable in this branch.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Escape before a sustainable victory. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Golden for a Moment” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: temporary-state cycling and final route that respects remaining injuries.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Temporary-state cycling and final route that respects remaining injuries.

### Scenario 65 — N29: Frieza Breaks Namek Early

**PROPOSED STORY DESIGN · LARGE · villain strategy**

- **Canon divergence point / source anchor:** namek_frieza2 final reveal. Baseline L-N5; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Frieza attacks the core before Goku is ready; play evacuation while rotating fighters through short diversion bouts.
- **Player character(s):** Piccolo / Gohan / Vegeta. **New battle(s) / opponent(s):** Frieza / collapsing terrain.
- **Stage/environment consequences:** Namek ruin.
- **New interactive cinematic:** The ground burns beneath an unfinished transformation.
- **Immediate consequence → new story path / mission consequences:** Core damaged → healing interrupted → launch routes collapse → heroes steal pods → final defensive clash buys departure.
- **Character/relationship consequences and continuity check:** No SSJ before its trigger; Vegeta alive at this earlier anchor. Goku's treatment cannot finish off-screen without time.
- **Form/transformation consequences:** Frieza core attack early; no early hero SSJ.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final defensive clash buys departure. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Frieza Breaks Namek Early” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: early hazard state, multi-pod evacuation and revised clock.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Early hazard state, multi-pod evacuation and revised clock.

### Scenario 66 — N30: No One Leaves Alone

**PROPOSED STORY DESIGN · MEDIUM · escape / relationship**

- **Canon divergence point / source anchor:** namek_end escape. Baseline L-N5; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** After winning, drag a still-dangerous Frieza toward a pod while parrying betrayal attempts and keeping the exit open.
- **Player character(s):** Goku. **New battle(s) / opponent(s):** Frieza / eruption hazards.
- **Stage/environment consequences:** Namek ruin.
- **New interactive cinematic:** Two mortal enemies reach a hatch sized for one.
- **Immediate consequence → new story path / mission consequences:** Mercy creates burden → Frieza attacks → pod damaged → player abandons or restrains him through a visible action → local rescue-or-solitary escape ending.
- **Character/relationship consequences and continuity check:** Frieza is injured; no healing reset or immediate alliance. Variant endings require distinct route records.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local rescue-or-solitary escape ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “No One Leaves Alone” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: carryable hostile, escape resource tradeoff and two authored endings.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Carryable hostile, escape resource tradeoff and two authored endings.

### Scenario 67 — N31: The Last Wish Is a Corridor

**PROPOSED STORY DESIGN · LARGE · wish / order**

- **Canon divergence point / source anchor:** namek_aftermath wishes proposed alternative. Baseline L-N5; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Use an approved transport wish to evacuate endangered civilians first; remaining fighters must reach a second physical exit.
- **Player character(s):** Dende / Gohan / Goku. **New battle(s) / opponent(s):** Frieza's remnants / hazards.
- **Stage/environment consequences:** Namek / proposed evacuation area.
- **New interactive cinematic:** The crowd vanishes while the fighters remain beneath the dying sky.
- **Immediate consequence → new story path / mission consequences:** Partial evacuation → wish budget spent → fighters rescue stragglers → pods contested → escape preserves survivors without an extra wish.
- **Character/relationship consequences and continuity check:** Exact dragon, eligibility, limits and remaining wishes unresolved; do not copy the current compressed wish dialogue as a full rule system.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Escape preserves survivors without an extra wish. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Last Wish Is a Corridor” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: wish-state ledger, split evacuation and physical escape.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Wish-state ledger, split evacuation and physical escape.

### Scenario 68 — N32: The Emperor Inherits Ash

**PROPOSED STORY DESIGN · MAJOR · villain victory**

- **Canon divergence point / source anchor:** namek_end final duel. Baseline L-N5; Namek / Frieza.
- **What the player does / objective / special gameplay mechanic:** Win as Frieza, then switch to survivors preventing his battered army from following refugees; final objective is rescue, not an implausible revenge win.
- **Player character(s):** Frieza / Gohan / Piccolo. **New battle(s) / opponent(s):** Goku / Frieza occupation force.
- **Stage/environment consequences:** Namek ruin / proposed refuge.
- **New interactive cinematic:** Frieza stands over Goku and realizes his prize is exploding.
- **Immediate consequence → new story path / mission consequences:** Goku dies → Frieza escapes wounded → refugees scatter → resistance steals transport → final convoy defense saves a remnant of Namek.
- **Character/relationship consequences and continuity check:** Krillin already dead at anchor; later resurrection not assumed. No heroic SSJ successor granted; planet loss remains.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final convoy defense saves a remnant of Namek. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Emperor Inherits Ash” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: villain victory plus refugee campaign, ships and explicit casualty/wish continuity.
- **Reusable existing systems:** Namek patterns, party/targeting, bosses, beams/flight; local swap/bomb where relevant.
- **New systems/content required / important risks:** Villain victory plus refugee campaign, ships and explicit casualty/wish continuity.

### Scenario 69 — C01: Trunks Misses the Landing

**PROPOSED STORY DESIGN · LARGE · arrival**

- **Canon divergence point / source anchor:** android_trunks. Baseline L-C1; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Defend civilians and stall two invaders until Goku can arrive; Trunks enters only after the defense has paid a cost.
- **Player character(s):** Piccolo / Vegeta / Goku. **New battle(s) / opponent(s):** Mecha Frieza / King Cold.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** The sword never appears; Piccolo steps into the landing smoke.
- **Immediate consequence → new story path / mission consequences:** Trunks delayed → defenders split invaders → Goku arrives → combined counterattack → warning delivered to a wounded team.
- **Character/relationship consequences and continuity check:** Goku's return/IT must follow the inspected arrival premise; no foreknowledge for defenders. Trunks delay needs a cause.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Warning delivered to a wounded team. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Misses the Landing” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: two-boss defense and altered arrival/warning scenes.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Two-boss defense and altered arrival/warning scenes.

### Scenario 70 — C02: Cold Leaves His Son

**PROPOSED STORY DESIGN · MEDIUM · villain escape**

- **Canon divergence point / source anchor:** android_trunks cold. Baseline L-C1; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Prevent Cold's ship extracting him while he uses troops as shields; decide through targeting whether to save civilians or stop departure.
- **Player character(s):** Future Trunks. **New battle(s) / opponent(s):** King Cold / escort.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** Cold closes the hatch while Frieza's remains lie outside.
- **Immediate consequence → new story path / mission consequences:** Civilian rescue costs pursuit → Cold escapes → heroes seize ship coordinates → intercept a later supply raid → local ending leaves a surviving dynasty.
- **Character/relationship consequences and continuity check:** No invented Cold transformation; escape is not victory over Trunks in a duel.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local ending leaves a surviving dynasty. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Cold Leaves His Son” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: extraction ship objective and follow-up raid.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Extraction ship objective and follow-up raid.

### Scenario 71 — C03: Trunks Tells Everyone

**PROPOSED STORY DESIGN · LARGE · information**

- **Canon divergence point / source anchor:** android_warning truth. Baseline L-C1; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Make the warning public, then play an uneasy family training circuit and coordinated android ambush.
- **Player character(s):** Future Trunks / Vegeta. **New battle(s) / opponent(s):** training rivals / Android 19.
- **Stage/environment consequences:** coast / training grounds.
- **New interactive cinematic:** Vegeta hears the family connection before the private conversation can end.
- **Immediate consequence → new story path / mission consequences:** Secret broken → Vegeta rejects help → joint training earns trust → coordinated first battle → Gero flees into a better-prepared pursuit.
- **Character/relationship consequences and continuity check:** Knowledge changes explicitly; no guarantee the future repairs itself. Bulma's agency is not reduced to a reward.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Gero flees into a better-prepared pursuit. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Tells Everyone” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: family training missions and knowledge ledger.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Family training missions and knowledge ledger.

### Scenario 72 — C04: The Medicine Is Ready

**PROPOSED STORY DESIGN · LARGE · illness**

- **Canon divergence point / source anchor:** android_nineteen virus. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Recognize symptoms and withdraw Goku early; defend a recovery window, then use a coordinated melee assault rather than ki.
- **Player character(s):** Goku / Vegeta. **New battle(s) / opponent(s):** Androids 19 and 20.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** Goku chooses to step back before Android 19 takes his energy.
- **Immediate consequence → new story path / mission consequences:** Treatment begins → Vegeta covers → Goku returns only after credible recovery → Gero's escape is contested → laboratory reached with a team.
- **Character/relationship consequences and continuity check:** Medicine is not instantaneous combat healing; illness still matters. No promise that early use prevents all symptoms.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Laboratory reached with a team. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Medicine Is Ready” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: recovery timing, tag objectives and changed lab approach.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Recovery timing, tag objectives and changed lab approach.

### Scenario 73 — C05: The Future Arrives Anyway

**PROPOSED STORY DESIGN · MAJOR · loss**

- **Canon divergence point / source anchor:** android_fever. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Goku dies despite delayed treatment; defend evacuation routes and hunt Cell while rival adults learn cooperation.
- **Player character(s):** Piccolo / Vegeta / Trunks. **New battle(s) / opponent(s):** Androids / Cell.
- **Stage/environment consequences:** son_house / coast / proposed refuge.
- **New interactive cinematic:** The bedside becomes still while the battle alarm continues outside.
- **Immediate consequence → new story path / mission consequences:** Goku dies → defenders regroup → android threat splits them → Cell hunts weakened resistance → Trunks leads an evacuation climax.
- **Character/relationship consequences and continuity check:** Natural-death wish rules require explicit review; no automatic resurrection. Gohan's later training/SSJ2 cannot be copied unchanged.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Trunks leads an evacuation climax. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Future Arrives Anyway” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: alternate saga, family consequences and no-Goku combat progression.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Alternate saga, family consequences and no-Goku combat progression.

### Scenario 74 — C06: Nineteen Learns Restraint

**PROPOSED STORY DESIGN · MEDIUM · boss counter**

- **Canon divergence point / source anchor:** android_nineteen. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Fight an absorber who stops chasing obvious ki bait; break grasp cycles while preventing Gero from repairing him.
- **Player character(s):** Vegeta. **New battle(s) / opponent(s):** Android 19 with Gero support.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** 19 ignores the glowing blast and grabs Vegeta's wrist instead.
- **Immediate consequence → new story path / mission consequences:** Bait fails → repair loop begins → Vegeta splits the pair → disables the repair link → 19 falls and Gero retreats.
- **Character/relationship consequences and continuity check:** No unearned android evolution; tactical adaptation is the divergence. Goku remains ill.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** 19 falls and Gero retreats. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Nineteen Learns Restraint” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: two-boss support behavior and interruptible repairs.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Two-boss support behavior and interruptible repairs.

### Scenario 75 — C07: Trunks Beats the Door

**PROPOSED STORY DESIGN · LARGE · pursuit**

- **Canon divergence point / source anchor:** android_lab chase. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Catch Gero before activation; disarm traps while keeping dormant android capsules intact for investigation.
- **Player character(s):** Future Trunks / Krillin. **New battle(s) / opponent(s):** Gero / laboratory defenses.
- **Stage/environment consequences:** coast / proposed laboratory interior.
- **New interactive cinematic:** The blade pins Gero's hand inches from the switch.
- **Immediate consequence → new story path / mission consequences:** Switch stopped → lab secured → Cell evidence found → rescue dormant androids from destruction → hunt the already-loose organism.
- **Character/relationship consequences and continuity check:** Stopping Gero does not erase an already active Cell or automatically make 17/18 allies.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Hunt the already-loose organism. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Beats the Door” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: laboratory interior, nonlethal capture and changed Cell search.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Laboratory interior, nonlethal capture and changed Cell search.

### Scenario 76 — C08: Seventeen Opens the Door

**PROPOSED STORY DESIGN · LARGE · android alliance**

- **Canon divergence point / source anchor:** android_lab wake. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Play 17 rejecting both Gero and an indiscriminate attack; protect 18's capsule, then fight alongside a distrustful Trunks.
- **Player character(s):** Android 17 / Future Trunks. **New battle(s) / opponent(s):** Gero's defenses / Cell.
- **Stage/environment consequences:** laboratory / coast.
- **New interactive cinematic:** 17 breaks the control console instead of attacking the nearest hero.
- **Immediate consequence → new story path / mission consequences:** Gero loses control → androids escape together → Trunks tracks them → Cell forces temporary alliance → defensive victory ends the route.
- **Character/relationship consequences and continuity check:** Gero fate must be specified; freeing androids does not erase Trunks's trauma or give him Cell knowledge early.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Defensive victory ends the route. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Seventeen Opens the Door” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: playable mission kit for 17, capsule protection and trust through objectives.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Playable mission kit for 17, capsule protection and trust through objectives.

### Scenario 77 — C09: Sixteen Chooses the Town

**PROPOSED STORY DESIGN · LARGE · rescue**

- **Canon divergence point / source anchor:** planned android/Cell civilian hunt. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Ignore the Goku directive long enough to rescue civilians; use heavy throws to keep Cell out of crowded streets.
- **Player character(s):** Android 16 / Piccolo. **New battle(s) / opponent(s):** Imperfect Cell.
- **Stage/environment consequences:** proposed populated town.
- **New interactive cinematic:** 16 shields a bird and a child with the same damaged arm.
- **Immediate consequence → new story path / mission consequences:** Civilians survive → Cell misses biomass → Piccolo investigates → uneasy android cooperation → Cell forced into an early escape battle.
- **Character/relationship consequences and continuity check:** 16's broader awakening route is not inspected as a playable mission; no human absorption immunity assumed for civilians.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Cell forced into an early escape battle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Sixteen Chooses the Town” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: playable 16 kit, civilian evacuation and biomass-pressure rules.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Playable 16 kit, civilian evacuation and biomass-pressure rules.

### Scenario 78 — C10: Eighteen Accepts the Rematch

**PROPOSED STORY DESIGN · MEDIUM · rivalry**

- **Canon divergence point / source anchor:** android_road turn. Baseline L-C2; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Vegeta withdraws before his arm breaks; a second bout rewards counterplay and ring-style positioning instead of attrition.
- **Player character(s):** Vegeta / Android 18. **New battle(s) / opponent(s):** Android 18 / Vegeta.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** Vegeta lowers his hands and finally watches her stance.
- **Immediate consequence → new story path / mission consequences:** Injury avoided → rematch negotiated by actions → stamina disadvantage remains → objective victory forces disengagement → neither claims a power-scaling miracle.
- **Character/relationship consequences and continuity check:** 18 has effectively inexhaustible resources in the current encounter; positioning win is not a stronger SSJ form.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Neither claims a power-scaling miracle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Eighteen Accepts the Rematch” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: nonlethal objective duel and restrained rival aftermath.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Nonlethal objective duel and restrained rival aftermath.

### Scenario 79 — C11: Piccolo Keeps His Eyes Closed

**PROPOSED STORY DESIGN · MEDIUM · escape denied**

- **Canon divergence point / source anchor:** cell_first escapes. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Anticipate the escape flash through an earned tell; track sound and attacks briefly, then seal retreat paths.
- **Player character(s):** Piccolo. **New battle(s) / opponent(s):** Imperfect Cell.
- **Stage/environment consequences:** coast / proposed town state.
- **New interactive cinematic:** The flash whites out the scene but the player's guard stays raised.
- **Immediate consequence → new story path / mission consequences:** Escape denied → Cell loses regeneration space → civilians emerge → Piccolo secures evidence → Cell is defeated or forced underground in a bounded ending.
- **Character/relationship consequences and continuity check:** Do not grant perfect sensing as immunity; Kami merger is not established here by inspected mission text.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Cell is defeated or forced underground in a bounded ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Piccolo Keeps His Eyes Closed” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: temporary low-visibility combat and route-blocking objective.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Temporary low-visibility combat and route-blocking objective.

### Scenario 80 — C12: Seventeen Steps Back

**PROPOSED STORY DESIGN · LARGE · rescue / alliance**

- **Canon divergence point / source anchor:** cell_semi hold. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** 17 accepts a defensive rotation; bait Cell's tail into a joint counter while 18 evacuates the route.
- **Player character(s):** Piccolo / Android 17. **New battle(s) / opponent(s):** Imperfect Cell.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** The tail closes on a decoy position and two fighters strike it.
- **Immediate consequence → new story path / mission consequences:** 17 survives → Cell lacks semi form → androids cooperate → hunt without human feeding → finish Imperfect Cell as a team.
- **Character/relationship consequences and continuity check:** No 17 absorption, so all later forms/Cell Games require replacement; 18 location and knowledge must be explicit.
- **Form/transformation consequences:** No semi/perfect Cell if 17 is never absorbed.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Finish Imperfect Cell as a team. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Seventeen Steps Back” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: anti-absorption targeting, android party and hunt finale.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Anti-absorption targeting, android party and hunt finale.

### Scenario 81 — C13: Tien Buys an Exit

**PROPOSED STORY DESIGN · LARGE · sacrifice avoided**

- **Canon divergence point / source anchor:** cell_semi tien. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Turn repeated Tri-Beam pins into an actual extraction route; switch to a courier while Tien rests between shots.
- **Player character(s):** Tien / Krillin / Android 18. **New battle(s) / opponent(s):** Semi-Perfect Cell.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** The last pin lands after the evacuees have already crossed the ridge.
- **Immediate consequence → new story path / mission consequences:** 17 still absorbed → 18 escapes → Tien survives depleted → Vegeta meets an incomplete Cell → hunt ends before perfection.
- **Character/relationship consequences and continuity check:** No infinite Tri-Beam; preserve exhaustion and 17's loss. Cell must learn the new hiding place through play.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Hunt ends before perfection. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Tien Buys an Exit” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: support stamina, moving extraction and altered pursuit.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Support stamina, moving extraction and altered pursuit.

### Scenario 82 — C14: Vegeta Finishes It

**PROPOSED STORY DESIGN · MEDIUM · decision**

- **Canon divergence point / source anchor:** cell_perfect semi. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Deny every escape toward 18 and destroy regeneration opportunities before a full-power finishing attack.
- **Player character(s):** Vegeta. **New battle(s) / opponent(s):** Semi-Perfect Cell.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** Vegeta turns his back on the promised challenge and fires.
- **Immediate consequence → new story path / mission consequences:** Cell denied perfection → 18 survives → Trunks confronts his father without fighting → no Cell Games → local ending leaves 17's fate unresolved pending rescue/wish rules.
- **Character/relationship consequences and continuity check:** Killing Cell does not automatically extract 17 alive; no SSJ2 Gohan event.
- **Form/transformation consequences:** No Perfect Cell or Games-earned SSJ2.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local ending leaves 17's fate unresolved pending rescue/wish rules. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Finishes It” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: anti-escape boss phase and explicit absorbed-survivor ending.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Anti-escape boss phase and explicit absorbed-survivor ending.

### Scenario 83 — C15: Trunks Stops His Father

**PROPOSED STORY DESIGN · LARGE · rival turned boss**

- **Canon divergence point / source anchor:** cell_perfect let. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Win a nonlethal interception against Vegeta while protecting 18 from Cell; alternate between both threats.
- **Player character(s):** Future Trunks / Android 18. **New battle(s) / opponent(s):** Vegeta / Semi-Perfect Cell.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** Trunks blocks Vegeta's path while 18 becomes the evacuation lead.
- **Immediate consequence → new story path / mission consequences:** Father delayed → 18 escapes → Cell pursues → Vegeta must choose rescue over pride → joint finishing battle ends the saga locally.
- **Character/relationship consequences and continuity check:** Trunks cannot casually overpower Vegeta and Cell together; victory uses objectives and timing, not a new form.
- **Form/transformation consequences:** No Perfect Cell; Gohan's later SSJ2 not granted.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Joint finishing battle ends the saga locally. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Stops His Father” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: three-sided encounter, neutral protection and father/son aftermath.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Three-sided encounter, neutral protection and father/son aftermath.

### Scenario 84 — C16: Eighteen Runs Toward Cell

**PROPOSED STORY DESIGN · LARGE · android agency**

- **Canon divergence point / source anchor:** cell_perfect before absorption. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Use herself as bait while Krillin prepares escape lanes; sever the grab through a timed team counter rather than waiting to be saved.
- **Player character(s):** Android 18 / Krillin. **New battle(s) / opponent(s):** Semi-Perfect Cell.
- **Stage/environment consequences:** coast.
- **New interactive cinematic:** 18 deliberately enters the tail's shadow and signals Krillin.
- **Immediate consequence → new story path / mission consequences:** Bait nearly fails → tail trap breaks → civilians escape → Vegeta's interference complicates pursuit → 18 chooses departure alive.
- **Character/relationship consequences and continuity check:** No unsupported self-destruction technique or anti-absorption immunity; Krillin's trust is earned.
- **Form/transformation consequences:** Perfection denied if 18 escapes; no new hero form.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** 18 chooses departure alive. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Eighteen Runs Toward Cell” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: tail-grab counter, playable 18 mission and conditional interception.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Tail-grab counter, playable 18 mission and conditional interception.

### Scenario 85 — C17: A Different Year Inside

**PROPOSED STORY DESIGN · LARGE · training**

- **Canon divergence point / source anchor:** planned Hyperbolic Time Chamber. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Pair Gohan with Piccolo for precision and protection drills; face Juniors with control-first tactics instead of rage-first damage.
- **Player character(s):** Gohan / Piccolo. **New battle(s) / opponent(s):** training constructs / Cell Juniors.
- **Stage/environment consequences:** proposed chamber / Cell arena.
- **New interactive cinematic:** Gohan catches an ally before answering Cell's provocation.
- **Immediate consequence → new story path / mission consequences:** Training changes → Piccolo recognizes hesitation → Juniors force rescue decisions → deliberate awakening opportunity → cooperative Cell finale.
- **Character/relationship consequences and continuity check:** Chamber entry schedule/capacity and Goku's training must be resolved; no free SSJ2 for changing teachers.
- **Form/transformation consequences:** Alternate SSJ2 event only after new buildup.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Cooperative Cell finale. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “A Different Year Inside” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: chamber foundation, paired lessons and alternate emotional climax.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Chamber foundation, paired lessons and alternate emotional climax.

### Scenario 86 — C18: Vegeta Trains the Son He Has

**PROPOSED STORY DESIGN · LARGE · training / rivalry**

- **Canon divergence point / source anchor:** planned chamber before cell_perfect. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Train alternating speed/power counters; use Trunks's warnings to avoid the bulky-form trap in a later fight.
- **Player character(s):** Vegeta / Future Trunks. **New battle(s) / opponent(s):** each other / Perfect Cell variant.
- **Stage/environment consequences:** proposed chamber / coast.
- **New interactive cinematic:** Vegeta interrupts the power display to demand one clean hit.
- **Immediate consequence → new story path / mission consequences:** Shared training → better timing → father refuses or regrets perfection → duo fights Cell by relay → Trunks earns recognition through rescue.
- **Character/relationship consequences and continuity check:** Power increase requires time actually spent; no new named transformation. Future and present Trunks stay distinct.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Trunks earns recognition through rescue. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Trains the Son He Has” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: chamber training and duo boss route.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Chamber training and duo boss route.

### Scenario 87 — C19: No Senzu for Cell

**PROPOSED STORY DESIGN · MEDIUM · decision / resource**

- **Canon divergence point / source anchor:** cell_games forfeit. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Withhold the bean in a separate premise; sustain pressure so Cell cannot regenerate while Goku covers Gohan's hesitations.
- **Player character(s):** Gohan / Goku. **New battle(s) / opponent(s):** tired Perfect Cell.
- **Stage/environment consequences:** Cell arena.
- **New interactive cinematic:** Cell holds out a hand and Goku closes his fist around the bean.
- **Immediate consequence → new story path / mission consequences:** No heal → Gohan gains openings → Cell attacks spectators to buy time → rescue divides pressure → joint finish or retreat ends locally.
- **Character/relationship consequences and continuity check:** Fatigue is not automatic victory; Cell regeneration remains. Gohan does not receive SSJ2 merely because the route changes.
- **Form/transformation consequences:** No automatic SSJ2; fatigued Cell retains regeneration.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Joint finish or retreat ends locally. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “No Senzu for Cell” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: persistent boss resource state and protection-versus-pressure objective.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Persistent boss resource state and protection-versus-pressure objective.

### Scenario 88 — C20: Sixteen Speaks Standing

**PROPOSED STORY DESIGN · LARGE · survivor / transformation**

- **Canon divergence point / source anchor:** cell_games sixteen. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Rescue damaged 16 before the crushing blow, then build Gohan's resolve through protecting several friends under pressure.
- **Player character(s):** Gohan / Android 16. **New battle(s) / opponent(s):** Cell / Juniors.
- **Stage/environment consequences:** Cell arena.
- **New interactive cinematic:** 16 delivers the plea while shielding someone, still alive.
- **Immediate consequence → new story path / mission consequences:** 16 survives damaged → Gohan chooses action → SSJ2 may emerge from resolve after an authored buildup → Juniors fall → Cell faces a disciplined opponent.
- **Character/relationship consequences and continuity check:** Alternate awakening is proposed, not an existing second trigger. 16 needs repairs, not a bean. No skipped emotional cost.
- **Form/transformation consequences:** Alternate SSJ2 emotional event proposed, not current implementation.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Cell faces a disciplined opponent. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Sixteen Speaks Standing” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: rescue branch, alternate awakening and mechanical distinction for android injury.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Rescue branch, alternate awakening and mechanical distinction for android injury.

### Scenario 89 — C21: Anger Before the Games

**PROPOSED STORY DESIGN · MEDIUM · transformation earlier**

- **Canon divergence point / source anchor:** planned pre-Games training. Baseline L-C3; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Trigger a brief SSJ2 breakthrough in a protection drill, then learn restraint before using it against Cell.
- **Player character(s):** Gohan / Goku. **New battle(s) / opponent(s):** training partner / Perfect Cell.
- **Stage/environment consequences:** proposed chamber / Cell arena.
- **New interactive cinematic:** Gohan stops his own strike inches from Goku.
- **Immediate consequence → new story path / mission consequences:** Early flash → recovery/control lesson → Cell tests unfamiliar power → Gohan refuses taunting → early decisive battle replaces the torture sequence.
- **Character/relationship consequences and continuity check:** SSJ2 must be earned by new authored events; early mastery is not automatic. No Juniors/16 death needed afterward.
- **Form/transformation consequences:** SSJ2 earlier, brief then trained; no free mastery.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Early decisive battle replaces the torture sequence. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Anger Before the Games” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: new lesson and restrained-power boss encounter.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** New lesson and restrained-power boss encounter.

### Scenario 90 — C22: The Gold Never Sparks

**PROPOSED STORY DESIGN · LARGE · transformation delayed**

- **Canon divergence point / source anchor:** cell_games ascend. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** SSJ2 does not arrive; evacuate allies while taking turns pinning Cell, then mount a coordinated containment strike.
- **Player character(s):** Gohan / Piccolo / Vegeta. **New battle(s) / opponent(s):** Perfect Cell / Juniors.
- **Stage/environment consequences:** Cell arena.
- **New interactive cinematic:** The expected lightning fails and Piccolo takes Gohan's place.
- **Immediate consequence → new story path / mission consequences:** No awakening → Juniors force retreat → Goku alive until any new sacrifice → heroes regroup → containment or costly escape replaces a solo victory.
- **Character/relationship consequences and continuity check:** Do not let SSJ Gohan win the same duel by stat inflation; 16's death alone is not guaranteed power.
- **Form/transformation consequences:** SSJ2 absent; ensemble survival instead.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Containment or costly escape replaces a solo victory. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Gold Never Sparks” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: ensemble survival climax and an approved containment solution.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Ensemble survival climax and an approved containment solution.

### Scenario 91 — C23: Leave Nothing to Grow Back

**PROPOSED STORY DESIGN · MEDIUM · regeneration counter**

- **Canon divergence point / source anchor:** cell_games regrow. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Chain precision blasts after a major wound while allies prevent fragments escaping; sustain the attack at severe ki cost.
- **Player character(s):** Goku / Piccolo. **New battle(s) / opponent(s):** Perfect Cell.
- **Stage/environment consequences:** Cell arena.
- **New interactive cinematic:** A tiny surviving fragment starts moving and the camera gives control back immediately.
- **Immediate consequence → new story path / mission consequences:** Regeneration interrupted → Cell counters to open space → allies close lanes → final beam consumes reserves → local victory preempts Goku's forfeit.
- **Character/relationship consequences and continuity check:** Cell's regeneration rule must be explicitly defined, not contradicted by an arbitrary weak point. No guaranteed anatomical lore claim.
- **Form/transformation consequences:** No new form; continuous finishing pressure.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local victory preempts Goku's forfeit. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Leave Nothing to Grow Back” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: fragment targets, continuous pressure and exhausted victory.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Fragment targets, continuous pressure and exhausted victory.

### Scenario 92 — C24: One Jump Back

**PROPOSED STORY DESIGN · LARGE · sacrifice alternative**

- **Canon divergence point / source anchor:** cell_games sacrifice. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Goku transports Cell, then attempts a narrowly timed return using an explicitly established ki anchor; survivors must hold that anchor steady.
- **Player character(s):** Goku / Gohan. **New battle(s) / opponent(s):** self-destructing Cell / returned Cell.
- **Stage/environment consequences:** Cell arena / proposed remote battlefield.
- **New interactive cinematic:** Two fingers rise a second time before the flash engulfs the remote field.
- **Immediate consequence → new story path / mission consequences:** Teleport → return attempt → Goku survives injured if earned → Cell's possible regeneration remains → father and son fight together.
- **Character/relationship consequences and continuity check:** Destination casualties cannot be hand-waved; teleport timing, sensing range and return anchor need approval. No free instant rescue.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Father and son fight together. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “One Jump Back” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: dual-location timed sequence and coherent IT rules.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Dual-location timed sequence and coherent IT rules.

### Scenario 93 — C25: Trunks Takes the Last Beam

**PROPOSED STORY DESIGN · LARGE · protective reversal**

- **Canon divergence point / source anchor:** cell_games returns. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Trunks intercepts a lethal line, survives wounded and assists Gohan through sword-positioned diversions while Vegeta controls his rage.
- **Player character(s):** Future Trunks / Gohan. **New battle(s) / opponent(s):** returned Cell.
- **Stage/environment consequences:** Cell arena.
- **New interactive cinematic:** Vegeta starts forward and stops because Trunks signals the opening.
- **Immediate consequence → new story path / mission consequences:** Trunks lives injured → Vegeta avoids reckless charge → Gohan's arm remains usable → Cell changes aim → coordinated final beam ends the route.
- **Character/relationship consequences and continuity check:** Altered injury chain must replace the canonical rescue wound; no healed Trunks by scene skip.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Coordinated final beam ends the route. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Takes the Last Beam” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: injury-specific boss targeting and three-fighter finish.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Injury-specific boss targeting and three-fighter finish.

### Scenario 94 — C26: Cell Wins the Broadcast

**PROPOSED STORY DESIGN · MAJOR · villain victory**

- **Canon divergence point / source anchor:** cell_games beam. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Win Cell's beam premise, then rescue survivors from his victory hunt and build an escape route toward the time machine.
- **Player character(s):** Cell / Piccolo / Trunks. **New battle(s) / opponent(s):** Gohan / Cell and Juniors.
- **Stage/environment consequences:** Cell arena / proposed refuge.
- **New interactive cinematic:** The broadcast continues after the hero's beam vanishes.
- **Immediate consequence → new story path / mission consequences:** Gohan dies → Goku remains dead → Cell hunts witnesses → Trunks/Piccolo rescue civilians → final battle protects launch rather than kills Cell.
- **Character/relationship consequences and continuity check:** No SSJ2 successor overnight; Trunks survival and machine location must be established; past intervention creates a separate timeline.
- **Form/transformation consequences:** No unearned successor form replaces fallen Gohan.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final battle protects launch rather than kills Cell. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Cell Wins the Broadcast” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: alternate-loss mini-campaign, civilian rescue and time-machine extraction.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Alternate-loss mini-campaign, civilian rescue and time-machine extraction.

### Scenario 95 — C27: Cell Refuses the Challenge

**PROPOSED STORY DESIGN · LARGE · villain strategy**

- **Canon divergence point / source anchor:** before cell_games. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Cell hunts supply and evacuation routes instead of waiting in a ring; track him through rescues and force a battle away from civilians.
- **Player character(s):** Piccolo / Trunks / Gohan. **New battle(s) / opponent(s):** Perfect Cell.
- **Stage/environment consequences:** coast / proposed populated districts.
- **New interactive cinematic:** The empty arena is bait while smoke rises elsewhere.
- **Immediate consequence → new story path / mission consequences:** Games canceled → supply routes hit → heroes escort civilians → Gohan chooses a stand → final city-edge defense replaces tournament pacing.
- **Character/relationship consequences and continuity check:** Training time changes explicitly; Cell intelligence is learned through evidence, not omniscience.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Final city-edge defense replaces tournament pacing. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Cell Refuses the Challenge” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: roaming threat schedule, investigations and new populated stage state.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Roaming threat schedule, investigations and new populated stage state.

### Scenario 96 — C28: Trunks Brings Back More Than Power

**PROPOSED STORY DESIGN · LARGE · future timeline**

- **Canon divergence point / source anchor:** post-Cell proposed future return. Baseline L-C4; Android / Cell.
- **What the player does / objective / special gameplay mechanic:** Bring evacuation tactics and repair knowledge home; protect a settlement while separating two android bosses before confronting the time-machine threat.
- **Player character(s):** Future Trunks / Future survivors. **New battle(s) / opponent(s):** future Androids / future Cell threat.
- **Stage/environment consequences:** proposed Future Earth.
- **New interactive cinematic:** Trunks lowers his sword to help lift a collapsed doorway.
- **Immediate consequence → new story path / mission consequences:** Future return → civilians organized → split android pair → protect machine from Cell → future earns a survivable peace.
- **Character/relationship consequences and continuity check:** Future versions are distinct records; present android friendships do not imply future cooperation. Future Gohan alive only in an explicit extra branch.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Future earns a survivable peace. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Brings Back More Than Power” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: future stages, versioned cast and separate timeline progression.
- **Reusable existing systems:** Absorbers/regen, pursuit, destructible objectives, party, Cell Games scenes.
- **New systems/content required / important risks:** Future stages, versioned cast and separate timeline progression.

### Scenario 97 — B01: Gohan Keeps the Helmet Off

**PROPOSED STORY DESIGN · MEDIUM · identity / relationship**

- **Canon divergence point / source anchor:** buu_years robbery. Baseline L-B1; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Fight publicly as Gohan with strict collateral limits; escort people drawn into danger by recognizing him.
- **Player character(s):** Adult Gohan / Videl. **New battle(s) / opponent(s):** robbers / copycat criminals.
- **Stage/environment consequences:** Satan City.
- **New interactive cinematic:** A rescued civilian says his name before he can invent an excuse.
- **Immediate consequence → new story path / mission consequences:** Identity exposed → Videl demands accountability → joint rescue → criminals exploit crowds → partnership ends with earned public trust.
- **Character/relationship consequences and continuity check:** No change to Gohan's power; Videl initially lacks flight. Public knowledge is local, not instant global omniscience.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** The challenge centers on the stated objective rather than a new health-bar boss.
- **Ending:** Partnership ends with earned public trust. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Gohan Keeps the Helmet Off” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: crowd attention and paired nonlethal missions.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Crowd attention and paired nonlethal missions.

### Scenario 98 — B02: Videl Learns to Fall

**PROPOSED STORY DESIGN · MEDIUM · training**

- **Canon divergence point / source anchor:** buu_flight. Baseline L-B1; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Add aerial recovery and ring-edge escapes to the lesson, then survive Spopovich by forcing a legal ring-out.
- **Player character(s):** Videl / Gohan. **New battle(s) / opponent(s):** training partner / Spopovich.
- **Stage/environment consequences:** wilderness / tournament.
- **New interactive cinematic:** Videl falls below the rim and rises behind the charging opponent.
- **Immediate consequence → new story path / mission consequences:** Recovery learned → tournament trap baited → Spopovich ringed out alive → Videl avoids grave injury → energy-theft plot remains possible.
- **Character/relationship consequences and continuity check:** Limited learned flight, no ki cannon or power parity; ring rules must permit the exact recovery used.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Energy-theft plot remains possible. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Videl Learns to Fall” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: flight lesson variation and ring-out boss solution.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Flight lesson variation and ring-out boss solution.

### Scenario 99 — B03: Goten Wins the Final

**PROPOSED STORY DESIGN · SMALL · tournament**

- **Canon divergence point / source anchor:** buu_junior final. Baseline L-B1; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Win through aerial feints and controlled throws, then keep the exhibition entertaining without injuring Satan.
- **Player character(s):** Goten. **New battle(s) / opponent(s):** Kid Trunks / Mr. Satan.
- **Stage/environment consequences:** tournament.
- **New interactive cinematic:** Trunks stares at the boundary line from the wrong side.
- **Immediate consequence → new story path / mission consequences:** Goten wins → Trunks demands rematch → exhibition stays safe → rivalry carries into future training → local endpoint.
- **Character/relationship consequences and continuity check:** No deaths, wishes or new forms; changing winner need not change wizard events. Possible rejoin before adult matches.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Local endpoint. **Canon rejoin / alternate timeline:** Potential rejoin before the adult tournament, with the different junior winner explicitly retained. No canon save is advanced.
- **Unlocks:** R — “Goten Wins the Final” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** SMALL; 1 mission. Cost/risk: alternate bracket winner and exhibition perspective.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Alternate bracket winner and exhibition perspective.

### Scenario 100 — B04: Piccolo Tests Shin

**PROPOSED STORY DESIGN · MEDIUM · tournament / knowledge**

- **Canon divergence point / source anchor:** buu_spopovich opening. Baseline L-B1; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Refuse the immediate forfeit; play a restrained diagnostic spar focused on sensing and defense until Shin reveals his purpose.
- **Player character(s):** Piccolo. **New battle(s) / opponent(s):** Shin.
- **Stage/environment consequences:** tournament.
- **New interactive cinematic:** Piccolo stops a strike voluntarily after recognizing the pressure behind it.
- **Immediate consequence → new story path / mission consequences:** Spar exposes difference → private warning earlier → Piccolo watches theft suspects → evacuation prepared → local ending before Gohan's match.
- **Character/relationship consequences and continuity check:** Shin is story-only in current data; needs an authored encounter kit, not an assumed full combat roster. No god-killing objective.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Local ending before Gohan's match. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Piccolo Tests Shin” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: nonlethal story encounter and revised knowledge timing.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Nonlethal story encounter and revised knowledge timing.

### Scenario 101 — B05: The Energy Never Leaves the Ring

**PROPOSED STORY DESIGN · LARGE · rescue**

- **Canon divergence point / source anchor:** buu_kibito ambush. Baseline L-B1; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Intervene only after seeing the theft; disable the carrier while another hero follows an escaping accomplice to avoid losing the trail.
- **Player character(s):** Videl / Krillin / Gohan. **New battle(s) / opponent(s):** Spopovich / Yamu.
- **Stage/environment consequences:** tournament / pursuit route.
- **New interactive cinematic:** Videl kicks the full canister away rather than attacking the invulnerable body.
- **Immediate consequence → new story path / mission consequences:** Theft interrupted → one suspect flees → heroes follow → ship reached with less fuel → seal-defense battle replaces immediate hatch.
- **Character/relationship consequences and continuity check:** No advance knowledge for Videl. Supreme Kai's bait plan must be confronted; cannot both arrest everyone and magically know the ship location.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Seal-defense battle replaces immediate hatch. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Energy Never Leaves the Ring” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: canister possession, split pursuit and explicit energy accounting.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Canister possession, split pursuit and explicit energy accounting.

### Scenario 102 — B06: Yamu Runs the Other Way

**PROPOSED STORY DESIGN · LARGE · villain survival**

- **Canon divergence point / source anchor:** buu_pursuit. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Play the courier recognizing his disposal, steal the canister back and flee while heroes decide through rescue whether to cover him.
- **Player character(s):** Yamu / Gohan. **New battle(s) / opponent(s):** Babidi's minions / Dabura.
- **Stage/environment consequences:** crater / proposed escape ravine.
- **New interactive cinematic:** Babidi raises a hand; Yamu is already running.
- **Immediate consequence → new story path / mission consequences:** Servant defects from fear → pursuit reverses → heroes rescue carrier → Dabura attacks → canister destroyed before delivery.
- **Character/relationship consequences and continuity check:** Temporary cooperation is survival, not redemption; Yamu cannot know later Buu events. Gohan's stolen energy stays finite.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Canister destroyed before delivery. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Yamu Runs the Other Way” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: playable courier kit, hostile pursuit and canister destruction.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Playable courier kit, hostile pursuit and canister destruction.

### Scenario 103 — B07: The Stone Does Not Break

**PROPOSED STORY DESIGN · LARGE · rescue / petrification**

- **Canon divergence point / source anchor:** buu_pursuit ship arrival. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Save a falling petrified ally, carry the statue through hostile terrain and force Dabura into a battle that ends the curse.
- **Player character(s):** Gohan / Vegeta. **New battle(s) / opponent(s):** Dabura.
- **Stage/environment consequences:** crater / demon realm.
- **New interactive cinematic:** A stone hand catches on a ledge; the player must reach it before it slips.
- **Immediate consequence → new story path / mission consequences:** Statue saved → pursuit slows → ship traps activate → defeat Dabura rather than accept recall → allies restored for the next stand.
- **Character/relationship consequences and continuity check:** Stone is not death; restoration condition must follow approved rules. Babidi remains a controlling system, not melee opponent.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Allies restored for the next stand. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Stone Does Not Break” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: statue transport and recall-interception objective.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Statue transport and recall-interception objective.

### Scenario 104 — B08: Piccolo Takes Planet Zoon

**PROPOSED STORY DESIGN · MEDIUM · different opponent**

- **Canon divergence point / source anchor:** buu_puipui proposed non-petrified party. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Face the gravity room with controlled leaps and regeneration tradeoffs while protecting an exhausted companion.
- **Player character(s):** Piccolo. **New battle(s) / opponent(s):** Pui Pui.
- **Stage/environment consequences:** ship Zoon.
- **New interactive cinematic:** Pui Pui's gravity boast meets a fighter who does not need to prove anything.
- **Immediate consequence → new story path / mission consequences:** Different entrant → gravity taxes mobility → weak points exposed → Pui Pui defeated → Piccolo advances with depleted reserves.
- **Character/relationship consequences and continuity check:** Requires preventing/reversing Piccolo's story petrification first; not a plug-in character swap.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Piccolo advances with depleted reserves. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Piccolo Takes Planet Zoon” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: gravity encounter tuning and prerequisite rescue scene.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Gravity encounter tuning and prerequisite rescue scene.

### Scenario 105 — B09: Yakon Saves His Appetite

**PROPOSED STORY DESIGN · MEDIUM · boss strategy**

- **Canon divergence point / source anchor:** buu_yakon. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Yakon refuses overload bait; alternate dark melee, brief light pulses and coordinated flank attacks.
- **Player character(s):** Goku / Vegeta. **New battle(s) / opponent(s):** Yakon.
- **Stage/environment consequences:** ship dark.
- **New interactive cinematic:** The monster closes its mouth at the expected finishing moment.
- **Immediate consequence → new story path / mission consequences:** Overload fails → darkness persists → heroes learn pulse timing → melee finish → less stolen energy reaches the wizard.
- **Character/relationship consequences and continuity check:** No new SSJ tier required; light sensing rules must be readable and accessible.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Less stolen energy reaches the wizard. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Yakon Saves His Appetite” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: absorber AI variation and visibility-safe dark combat.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Absorber AI variation and visibility-safe dark combat.

### Scenario 106 — B10: The Demon King Breaks His Leash

**PROPOSED STORY DESIGN · LARGE · villain cooperation**

- **Canon divergence point / source anchor:** buu_dabura recall. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Prevent recall long enough for Dabura to resist control; protect him while he attacks the ship's bindings.
- **Player character(s):** Dabura / Gohan. **New battle(s) / opponent(s):** Babidi's magic / minions.
- **Stage/environment consequences:** demon realm / ship.
- **New interactive cinematic:** The mark burns as Dabura turns his sword toward the ceiling.
- **Immediate consequence → new story path / mission consequences:** Recall resisted → temporary alliance → bindings broken → imprisoned allies freed → Babidi escapes or the sealed threat remains guarded.
- **Character/relationship consequences and continuity check:** Control resistance is a proposed exception needing approval; no instant moral reform. Babidi never becomes a punchable boss.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Babidi escapes or the sealed threat remains guarded. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Demon King Breaks His Leash” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: control-node system, playable Dabura mission and escape/containment ending.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Control-node system, playable Dabura mission and escape/containment ending.

### Scenario 107 — B11: Vegeta Says No

**PROPOSED STORY DESIGN · LARGE · decision / rivalry**

- **Canon divergence point / source anchor:** buu_majin offer. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Reject the mark through a playable resistance bout against projected temptations, then fight beside Goku without feeding the seal.
- **Player character(s):** Vegeta / Goku / Gohan. **New battle(s) / opponent(s):** Dabura / ship defenses.
- **Stage/environment consequences:** crater / ship.
- **New interactive cinematic:** The forehead remains bare while Vegeta attacks the doorway instead.
- **Immediate consequence → new story path / mission consequences:** Offer refused → duel denied → wizard changes plan → heroes disable energy channels → Buu remains sealed at route endpoint.
- **Character/relationship consequences and continuity check:** No Majin boost; phantom fight is clearly mental/proposed, not a real resurrected enemy. Earlier stolen energy still exists.
- **Form/transformation consequences:** Majin boost absent if offer refused.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Buu remains sealed at route endpoint. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Says No” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: mental arena presentation and non-damage energy-control objectives.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Mental arena presentation and non-damage energy-control objectives.

### Scenario 108 — B12: Vegeta Chooses the Stands

**PROPOSED STORY DESIGN · LARGE · sacrifice / relationship**

- **Canon divergence point / source anchor:** buu_majin price. Baseline L-B2; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Fight the mark's influence while physically intercepting attacks near spectators; Goku protects civilians instead of accepting the duel.
- **Player character(s):** Vegeta / Goku. **New battle(s) / opponent(s):** Babidi control / escaping minions.
- **Stage/environment consequences:** tournament / wasteland.
- **New interactive cinematic:** Vegeta's blast tears upward, missing the crowd by choice.
- **Immediate consequence → new story path / mission consequences:** Crowd survives → rivalry redirected → wizard pushes harder → heroes pursue conduits → alternate hatch is delayed or prevented visibly.
- **Character/relationship consequences and continuity check:** Mark acceptance remains a deliberate prior choice; resisting an order does not absolve it. No silent removal of earlier harm.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Alternate hatch is delayed or prevented visibly. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Chooses the Stands” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: control-pressure encounter and crowd evacuation.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Control-pressure encounter and crowd evacuation.

### Scenario 109 — B13: Final Explosion, First Rescue

**PROPOSED STORY DESIGN · LARGE · sacrifice survived**

- **Canon divergence point / source anchor:** planned Vegeta sacrifice. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Earn an emergency extraction by narrowing the explosion and surviving its reduced effect; Piccolo must retrieve Vegeta while Buu reforms.
- **Player character(s):** Vegeta / Piccolo. **New battle(s) / opponent(s):** Fat Buu.
- **Stage/environment consequences:** proposed Buu battlefield.
- **New interactive cinematic:** The crater still contains a heartbeat—and a reforming enemy.
- **Immediate consequence → new story path / mission consequences:** Vegeta lives ruined → Buu survives → extraction under pressure → father must recover rather than command → next defense led by others.
- **Character/relationship consequences and continuity check:** Survival has a cost and no instant Zenkai; mechanism is experimental, not a canon explanation. Later Buu is unbuilt.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Next defense led by others. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Final Explosion, First Rescue” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: fat Buu foundation, extraction, explosion tradeoff and recovery route.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Fat Buu foundation, extraction, explosion tradeoff and recovery route.

### Scenario 110 — B14: Three Minutes of SSJ3

**PROPOSED STORY DESIGN · LARGE · transformation timing**

- **Canon divergence point / source anchor:** planned Goku vs Fat Buu. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Use SSJ3 in brief windows to protect evacuees; every burst shortens remaining intervention time and shifts responsibility to allies.
- **Player character(s):** Goku / Piccolo. **New battle(s) / opponent(s):** Fat Buu.
- **Stage/environment consequences:** proposed city outskirts.
- **New interactive cinematic:** Hair falls back to base while the evacuation counter is still unfinished.
- **Immediate consequence → new story path / mission consequences:** Early burst → civilians saved → Goku's visit time depleted → Piccolo takes over → children inherit a harder defense.
- **Character/relationship consequences and continuity check:** Goku's dead/temporary-return status remains; no permanent revival. SSJ3 rules and time cost must be specified.
- **Form/transformation consequences:** Planned SSJ3 with visit-time cost.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Children inherit a harder defense. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Three Minutes of SSJ3” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: sSJ3/future Buu foundation, shared visit timer and handoff.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** SSJ3/future Buu foundation, shared visit timer and handoff.

### Scenario 111 — B15: Buu Keeps the Wizard

**PROPOSED STORY DESIGN · LARGE · villain strategy**

- **Canon divergence point / source anchor:** planned Fat Buu/Babidi split. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Buu refuses to kill Babidi but cages him; play containment while the wizard manipulates minions and tries to regain control.
- **Player character(s):** Fat Buu / heroes. **New battle(s) / opponent(s):** Babidi's controlled forces.
- **Stage/environment consequences:** proposed ruined city.
- **New interactive cinematic:** The furious wizard bounces inside a harmless-looking prison.
- **Immediate consequence → new story path / mission consequences:** Babidi lives captive → minions attack → heroes distrust Buu → prevent breakout → Buu chooses protection through actions.
- **Character/relationship consequences and continuity check:** Babidi remains a magic-system antagonist. A cage does not automatically block his magic; limitations need approval.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Buu chooses protection through actions. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Buu Keeps the Wizard” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: containment, Buu kit and control-distance rules.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Containment, Buu kit and control-distance rules.

### Scenario 112 — B16: Mr. Satan Reaches Him First

**PROPOSED STORY DESIGN · LARGE · relationship / rescue**

- **Canon divergence point / source anchor:** planned Fat Buu destruction. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Escort civilians using distractions and Buu's protection; success is preventing panic and attacks rather than winning a power contest.
- **Player character(s):** Mr. Satan / Good Buu. **New battle(s) / opponent(s):** armed provocateurs / hazards.
- **Stage/environment consequences:** proposed settlement.
- **New interactive cinematic:** Buu copies Satan's raised hand and stops a falling wall instead of throwing it.
- **Immediate consequence → new story path / mission consequences:** Contact earlier → destruction pauses → provocateurs threaten fragile peace → rescue the vulnerable companion → settlement survives.
- **Character/relationship consequences and continuity check:** Satan cannot tank Buu-level attacks; his gameplay is courage, timing and positioning. Evil split not inevitable without the trigger.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Settlement survives. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Mr. Satan Reaches Him First” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: noncombat bravery objectives, future Buu and civilians.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Noncombat bravery objectives, future Buu and civilians.

### Scenario 113 — B17: The Shot Misses

**PROPOSED STORY DESIGN · LARGE · rescue / split avoided**

- **Canon divergence point / source anchor:** planned Evil Buu trigger. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Detect and interrupt the attack on Buu's companions; protect the aggressor too, preventing anger from becoming a new enemy.
- **Player character(s):** Mr. Satan / Good Buu. **New battle(s) / opponent(s):** attackers / collapsing terrain.
- **Stage/environment consequences:** proposed Buu home.
- **New interactive cinematic:** Buu sees Satan shielding the person who fired.
- **Immediate consequence → new story path / mission consequences:** Victim survives → rage contained → attackers flee → rescue during retaliatory chaos → Good Buu chooses restraint and the split is averted locally.
- **Character/relationship consequences and continuity check:** Exact trigger/victims need baseline authoring; no guarantee evil is permanently erased. No Super/Kid Buu follows unchanged.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Good Buu chooses restraint and the split is averted locally. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Shot Misses” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: good Buu restraint mechanic and reversible anger state.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Good Buu restraint mechanic and reversible anger state.

### Scenario 114 — B18: Thirty Minutes Without Gotenks

**PROPOSED STORY DESIGN · LARGE · fusion failed**

- **Canon divergence point / source anchor:** planned fusion training. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Fail the dance premise, then use a deliberately weak fusion for evasive rescue until the timer expires; separated children cover each other.
- **Player character(s):** Goten / Kid Trunks / failed fusion. **New battle(s) / opponent(s):** Super Buu.
- **Stage/environment consequences:** proposed lookout approaches.
- **New interactive cinematic:** The dramatic smoke clears around the wrong silhouette.
- **Immediate consequence → new story path / mission consequences:** Fusion fails → enemy approaches → rescue learners → de-fuse → successful second attempt earns a defensive finish.
- **Character/relationship consequences and continuity check:** Comic failure is not cruelty; failed form needs its own kit. Goku/Piccolo must have taught the dance first.
- **Form/transformation consequences:** Planned failed fusion identity then proper fusion; new playable content required.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Successful second attempt earns a defensive finish. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Thirty Minutes Without Gotenks” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: fusion foundation, failure fighter and timer-safe checkpoints.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Fusion foundation, failure fighter and timer-safe checkpoints.

### Scenario 115 — B19: The Children Finish the Lesson

**PROPOSED STORY DESIGN · LARGE · fusion earlier**

- **Canon divergence point / source anchor:** planned Gotenks training. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Earn a correct dance earlier, then spend fusion time on rescue rather than chasing a knockout.
- **Player character(s):** Gotenks. **New battle(s) / opponent(s):** Fat Buu / approaching hazards.
- **Stage/environment consequences:** proposed city defense.
- **New interactive cinematic:** The fusion poses to an empty street because everyone needs help elsewhere.
- **Immediate consequence → new story path / mission consequences:** Earlier success → evacuation → Buu adapts → timer runs down → children complete the last rescue separately.
- **Character/relationship consequences and continuity check:** Earlier lesson requires a teacher's presence/time; SSJ3 is not granted with the first successful dance.
- **Form/transformation consequences:** Planned Gotenks earlier; SSJ3 not bundled.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Children complete the last rescue separately. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Children Finish the Lesson” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: fusion foundation, rescue timer and two-body handoff.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Fusion foundation, rescue timer and two-body handoff.

### Scenario 116 — B20: Gotenks Stays Small

**PROPOSED STORY DESIGN · LARGE · fusion resource**

- **Canon divergence point / source anchor:** planned Gotenks vs Super Buu. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Avoid SSJ3 and use traps, ghosts and positional tricks to preserve fusion time long enough for a rescue.
- **Player character(s):** Gotenks. **New battle(s) / opponent(s):** Super Buu.
- **Stage/environment consequences:** proposed chamber / lookout.
- **New interactive cinematic:** Gotenks stops a transformation halfway and grins at a better idea.
- **Immediate consequence → new story path / mission consequences:** Power restrained → longer tactical window → absorption attempt baited → allies released → escape before de-fusion.
- **Character/relationship consequences and continuity check:** Exact form-duration relationship requires design approval; lower form cannot overpower the same enemy by damage inflation.
- **Form/transformation consequences:** Planned lower Gotenks form deliberately retained.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Escape before de-fusion. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Gotenks Stays Small” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: gotenks techniques, fusion timer rules and rescue boss behavior.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Gotenks techniques, fusion timer rules and rescue boss behavior.

### Scenario 117 — B21: The Dance Won't End

**PROPOSED STORY DESIGN · MAJOR · fusion duration / EXPERIMENTAL**

- **Canon divergence point / source anchor:** planned Gotenks de-fusion. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Unexpectedly extended fusion forces a resource-management mission: keep the shared body stable while protecting its two families.
- **Player character(s):** Gotenks / Piccolo. **New battle(s) / opponent(s):** Super Buu / internal instability.
- **Stage/environment consequences:** proposed lookout / training refuge.
- **New interactive cinematic:** The timer hits zero and nothing separates.
- **Immediate consequence → new story path / mission consequences:** Timer fails → instability grows → rescue from Buu → controlled training finds a release → children return with changed trust.
- **Character/relationship consequences and continuity check:** Not established fusion law; explicit game-only anomaly. Extended duration is not free unlimited power.
- **Form/transformation consequences:** Experimental prolonged fusion; no unlimited free power.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Children return with changed trust. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Dance Won't End” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: novel fusion anomaly, two-mind presentation and separation objective.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Novel fusion anomaly, two-mind presentation and separation objective.

### Scenario 118 — B22: The Ghosts Guard Their Maker

**PROPOSED STORY DESIGN · LARGE · absorption denied**

- **Canon divergence point / source anchor:** planned Buu absorbs Gotenks. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Position ghosts to reveal and destroy absorption fragments without detonating near allies; win by controlling space.
- **Player character(s):** Gotenks / Piccolo. **New battle(s) / opponent(s):** Super Buu.
- **Stage/environment consequences:** proposed lookout.
- **New interactive cinematic:** A harmless-looking scrap rises behind Gotenks and meets a waiting ghost.
- **Immediate consequence → new story path / mission consequences:** Absorption fails → Buu switches targets → Piccolo leads rescue → fusion ends safely → Gohan arrives to a different battle.
- **Character/relationship consequences and continuity check:** Ghosts are not automatic omniscient shields; visibility and friendly-safety constraints matter.
- **Form/transformation consequences:** Gotenks remains outside Buu; absorbed form denied.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Gohan arrives to a different battle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Ghosts Guard Their Maker” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: future absorption fragments, ghost control and target-switch boss.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Future absorption fragments, ghost control and target-switch boss.

### Scenario 119 — B23: Buu Takes the Teacher

**PROPOSED STORY DESIGN · MAJOR · alternate absorption**

- **Canon divergence point / source anchor:** planned Super Buu absorption window. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Face a strategically cautious Buu using traps and feints, then enter a rescue route where knowledge of Piccolo's habits reveals openings.
- **Player character(s):** Gohan / Gotenks. **New battle(s) / opponent(s):** Buu with Piccolo-led tactics.
- **Stage/environment consequences:** proposed lookout / Buu interior.
- **New interactive cinematic:** The familiar crossed-arm pose appears on the wrong body.
- **Immediate consequence → new story path / mission consequences:** Piccolo absorbed → Buu becomes tactical → children survive outside → Gohan fights the trap pattern → internal rescue restores teacher.
- **Character/relationship consequences and continuity check:** Absorption must specify who else is inside; no assumed Gotenks power in this variant. Composite knowledge needs rules.
- **Form/transformation consequences:** Proposed Buu composition based on Piccolo, not assumed Buutenks.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Internal rescue restores teacher. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Buu Takes the Teacher” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: absorption foundation, alternate boss composition and internal stage.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Absorption foundation, alternate boss composition and internal stage.

### Scenario 120 — B24: Ultimate Arrives One Battle Earlier

**PROPOSED STORY DESIGN · LARGE · power timing**

- **Canon divergence point / source anchor:** planned Old Kai ritual. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Complete an interactive concentration/protection ritual without interruption, then arrive early enough to protect the children from absorption.
- **Player character(s):** Adult Gohan. **New battle(s) / opponent(s):** Super Buu.
- **Stage/environment consequences:** proposed Kai world / lookout.
- **New interactive cinematic:** Gohan catches the attack while still in his plain, untransformed stance.
- **Immediate consequence → new story path / mission consequences:** Ritual completed → early arrival → children stay free → Buu changes target → precision fight ends with rescue rather than taunting.
- **Character/relationship consequences and continuity check:** Travel/ritual timing explicit; Ultimate is no timed golden SSJ state. No instant ritual skip.
- **Form/transformation consequences:** Planned Ultimate earlier after completed ritual.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Precision fight ends with rescue rather than taunting. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Ultimate Arrives One Battle Earlier” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: old Kai/Ultimate foundation and arrival-dependent boss route.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Old Kai/Ultimate foundation and arrival-dependent boss route.

### Scenario 121 — B25: Gohan Leaves Too Soon

**PROPOSED STORY DESIGN · LARGE · power delayed**

- **Canon divergence point / source anchor:** planned Old Kai ritual. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Interrupt the ritual to answer a rescue alarm; fight with existing SSJ2 and allies while accepting the missing Ultimate advantage.
- **Player character(s):** Gohan / Piccolo / children. **New battle(s) / opponent(s):** Super Buu.
- **Stage/environment consequences:** proposed Kai world / Earth.
- **New interactive cinematic:** The ritual light fades because Gohan stands before it is finished.
- **Immediate consequence → new story path / mission consequences:** Power incomplete → rescue attempt → team retreats → protect return route → finish ritual only after buying real time.
- **Character/relationship consequences and continuity check:** No half-Ultimate invented unless separately approved; existing forms only. Cannot teleport without an established transport helper.
- **Form/transformation consequences:** No Ultimate before completing ritual.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Finish ritual only after buying real time. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Gohan Leaves Too Soon” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: interrupted ritual progression and retreat/return missions.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Interrupted ritual progression and retreat/return missions.

### Scenario 122 — B26: Gohan Catches the Earring

**PROPOSED STORY DESIGN · MAJOR · Potara alternate / EXPERIMENTAL**

- **Canon divergence point / source anchor:** planned Potara crisis. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Earn the catch under attack, fuse and fight a rescue-focused boss whose captives prevent indiscriminate finishing attacks.
- **Player character(s):** proposed Goku–Gohan fusion. **New battle(s) / opponent(s):** absorbing Buu.
- **Stage/environment consequences:** proposed ruined Earth.
- **New interactive cinematic:** The thrown earring lands in Gohan's hand and the silhouette is unfamiliar.
- **Immediate consequence → new story path / mission consequences:** Catch → new fusion → Buu tries to absorb it → precision rescue → defusion or long-term identity ending remains a decision.
- **Character/relationship consequences and continuity check:** New combination conflicts with spec's no-random-fusion rule unless approved for substantive story purpose; Goku/son knowledge and Potara rules need review.
- **Form/transformation consequences:** Entirely new experimental Goku–Gohan fusion, not a canon roster grant.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Defusion or long-term identity ending remains a decision. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Gohan Catches the Earring” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: entire new fighter, rig/kit/identity and approved duration; MAJOR for that reason.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Entire new fighter, rig/kit/identity and approved duration; MAJOR for that reason.

### Scenario 123 — B27: Two Saiyans, No Earrings

**PROPOSED STORY DESIGN · LARGE · fusion refused**

- **Canon divergence point / source anchor:** planned Vegito creation. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Reject Potara and survive through alternating rescue feints, baiting a controlled entry into Buu while neither can win outside.
- **Player character(s):** Goku / Vegeta. **New battle(s) / opponent(s):** Buu with absorbed heroes.
- **Stage/environment consequences:** proposed ruined Earth.
- **New interactive cinematic:** The earring falls between two fighters who finally move together anyway.
- **Immediate consequence → new story path / mission consequences:** Fusion refused → direct fight fails → controlled infiltration → free captives → escape to face the next form.
- **Character/relationship consequences and continuity check:** No Vegito-level stats for the pair; entry/survival mechanism must be authored and risky.
- **Form/transformation consequences:** No Vegito; individual fighters remain outmatched.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Escape to face the next form. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Two Saiyans, No Earrings” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: inside-Buu foundation and dual un-fused infiltration.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Inside-Buu foundation and dual un-fused infiltration.

### Scenario 124 — B28: Vegito Loses the Last Second

**PROPOSED STORY DESIGN · LARGE · fusion expires**

- **Canon divergence point / source anchor:** planned Vegito/internal rescue. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Fusion expires during extraction; separate heroes must carry different captives and coordinate exits without fusion power.
- **Player character(s):** Vegito then Goku / Vegeta. **New battle(s) / opponent(s):** Buu / internal defenses.
- **Stage/environment consequences:** proposed Buu interior.
- **New interactive cinematic:** The Spirit Sword vanishes mid-swing and two smaller fighters fall.
- **Immediate consequence → new story path / mission consequences:** Unexpected separation → rescues split → one exit seals → coordinated internal battle → all earned rescues escape.
- **Character/relationship consequences and continuity check:** Potara duration/cause not assumed canonical; select explicit branch rule. Captives are not automatically freed by boss damage.
- **Form/transformation consequences:** Planned Vegito de-fuses during extraction.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** All earned rescues escape. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegito Loses the Last Second” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: fusion-expiry handoff, multi-carrier rescue and identity-safe checkpoint.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Fusion-expiry handoff, multi-carrier rescue and identity-safe checkpoint.

### Scenario 125 — B29: Vegito Refuses to Be Swallowed

**PROPOSED STORY DESIGN · LARGE · fusion / rescue**

- **Canon divergence point / source anchor:** planned Vegito vs Buu. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Force external release by disabling absorption organs/fragments under a strict no-captive-harm rule rather than intentional absorption.
- **Player character(s):** Vegito. **New battle(s) / opponent(s):** Buu with captives.
- **Stage/environment consequences:** proposed ruined Earth.
- **New interactive cinematic:** Vegito lowers the finishing sword and cuts the escape lane instead.
- **Immediate consequence → new story path / mission consequences:** Entry refused → Buu uses hostages → precision attacks force an opening → captives pulled free → weakened Buu faces a new final fight.
- **Character/relationship consequences and continuity check:** External release is a proposed mechanism, not an established ability. No instant internal knowledge without cues.
- **Form/transformation consequences:** Planned Vegito retained outside; Buu composition changes only through rescue.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Weakened Buu faces a new final fight. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegito Refuses to Be Swallowed” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: external extraction rules, hostage telegraphs and alternate finisher.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** External extraction rules, hostage telegraphs and alternate finisher.

### Scenario 126 — B30: They Free Good Buu First

**PROPOSED STORY DESIGN · MAJOR · rescue order**

- **Canon divergence point / source anchor:** planned inside Buu. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Change rescue order; stabilize corridors while a prematurely released captive changes the whole body's behavior.
- **Player character(s):** Goku / Vegeta / Good Buu. **New battle(s) / opponent(s):** internal defenses / changing Buu.
- **Stage/environment consequences:** proposed Buu interior.
- **New interactive cinematic:** The walls convulse before the other captives are safe.
- **Immediate consequence → new story path / mission consequences:** Good Buu freed first → internal terrain destabilizes → rescue race → incomplete extraction risk → survivors emerge into an altered final confrontation.
- **Character/relationship consequences and continuity check:** Exact absorption/form causality must be approved; do not assert the resulting form from memory. Each captive location tracked.
- **Form/transformation consequences:** Resulting Buu form explicitly unresolved pending rules.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Survivors emerge into an altered final confrontation. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “They Free Good Buu First” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: dynamic internal stage, rescue-order outcomes and composed boss form.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Dynamic internal stage, rescue-order outcomes and composed boss form.

### Scenario 127 — B31: Earth Gets One More Minute

**PROPOSED STORY DESIGN · LARGE · planet rescue**

- **Canon divergence point / source anchor:** planned Kid Buu destroys Earth. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Interrupt the first Planet Burst to create an evacuation minute; move survivors to the transport contact rather than chase damage.
- **Player character(s):** Goku / Vegeta / Gohan. **New battle(s) / opponent(s):** Kid Buu / planet hazards.
- **Stage/environment consequences:** proposed Earth destruction state.
- **New interactive cinematic:** The planet-wide attack bends aside and the timer starts instead of ending.
- **Immediate consequence → new story path / mission consequences:** First burst delayed → evacuation → second attack inevitable → selected survivors escape → final battle moves off Earth.
- **Character/relationship consequences and continuity check:** No global rescue without wish/transport capacity. Gohan participates only if already extracted alive; no planetary durability buff.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Final battle moves off Earth. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Earth Gets One More Minute” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: planet-burst interruption, transport capacity and destruction-state stage.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Planet-burst interruption, transport capacity and destruction-state stage.

### Scenario 128 — B32: Vegeta's Minute Becomes Three

**PROPOSED STORY DESIGN · LARGE · Spirit Bomb / endurance**

- **Canon divergence point / source anchor:** planned Kai-world countdown. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Goku's charge stalls; alternate defenders, manage injuries and use terrain to survive beyond the promised minute.
- **Player character(s):** Vegeta / Good Buu. **New battle(s) / opponent(s):** Kid Buu.
- **Stage/environment consequences:** proposed Sacred World of the Kai.
- **New interactive cinematic:** Vegeta realizes the raised hands behind him are still empty.
- **Immediate consequence → new story path / mission consequences:** Charge delayed → Vegeta nearly falls → Good Buu relieves him → Satan gains contributors → earned final throw ends the stand.
- **Character/relationship consequences and continuity check:** Goku's SSJ3 drain and living-body limits must be established; no infinite healing for defenders.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Earned final throw ends the stand. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta's Minute Becomes Three” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: future final-battle systems, relay endurance and charge feedback.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Future final-battle systems, relay endurance and charge feedback.

### Scenario 129 — B33: No One Believes the Champion

**PROPOSED STORY DESIGN · LARGE · relationship / energy gathering**

- **Canon divergence point / source anchor:** planned final Spirit Bomb. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Satan's first appeal fails; physically rescue broadcast crews and communities while allies hold the boss, earning contributions visibly.
- **Player character(s):** Mr. Satan / defenders. **New battle(s) / opponent(s):** panic / Kid Buu.
- **Stage/environment consequences:** proposed Earth relay / Kai world.
- **New interactive cinematic:** One rescued crowd raises its hands before the rest follow.
- **Immediate consequence → new story path / mission consequences:** Appeal fails → rescue builds trust → relay repaired → energy arrives in waves → Spirit Bomb becomes possible at a cost.
- **Character/relationship consequences and continuity check:** Satan remains vulnerable; cross-world communication/transport require stated means. No invisible universal consent.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Spirit Bomb becomes possible at a cost. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “No One Believes the Champion” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: playable rally objectives, synchronized arenas and staged energy contributions.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Playable rally objectives, synchronized arenas and staged energy contributions.

### Scenario 130 — B34: The Wish Restores Strength First

**PROPOSED STORY DESIGN · MAJOR · wish order**

- **Canon divergence point / source anchor:** planned final wishes. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Spend an approved wish on fighter recovery before restoring Earth; win a brutal battle without humanity's immediate energy contribution.
- **Player character(s):** Goku / Vegeta / Good Buu. **New battle(s) / opponent(s):** Kid Buu.
- **Stage/environment consequences:** proposed Kai world / destroyed-Earth state.
- **New interactive cinematic:** Goku stands restored while the missing planet stays missing.
- **Immediate consequence → new story path / mission consequences:** Strength restored → Earth unavailable → direct battle fails to finish quickly → allies create a seal/containment opening → ending commits to later restoration work.
- **Character/relationship consequences and continuity check:** Wish authority and budget unresolved; cannot also claim the ordinary Earth Spirit Bomb. No resurrection bundled into stamina.
- **Form/transformation consequences:** Restored stamina, not a new form.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Ending commits to later restoration work. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Wish Restores Strength First” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: wish-order ledger, alternative final solution and delayed-restoration ending.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Wish-order ledger, alternative final solution and delayed-restoration ending.

### Scenario 131 — B35: Buu Eats the Victory

**PROPOSED STORY DESIGN · MAJOR · villain victory**

- **Canon divergence point / source anchor:** planned Ultimate Gohan confrontation. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Play Buu winning an absorption trap, then switch to surviving rescuers infiltrating the body before it hunts the remaining heroes.
- **Player character(s):** Buu / Piccolo / survivors. **New battle(s) / opponent(s):** Gohan / absorbed-form Buu.
- **Stage/environment consequences:** proposed ruined Earth / Buu interior.
- **New interactive cinematic:** The player's powerhouse becomes the next mission's boss.
- **Immediate consequence → new story path / mission consequences:** Gohan absorbed → survivors hide → rescue infiltration → disrupt composite techniques from within → escape with Gohan but a living external threat.
- **Character/relationship consequences and continuity check:** Absorbed is not dead; no copied knowledge without a rule; captives' injuries/forms must persist.
- **Form/transformation consequences:** Planned absorption-based Gohan composition.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Escape with Gohan but a living external threat. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Buu Eats the Victory” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: absorption system, composed boss and internal sabotage campaign.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Absorption system, composed boss and internal sabotage campaign.

### Scenario 132 — B36: Good Buu Holds the Last Door

**PROPOSED STORY DESIGN · MAJOR · alternate ending**

- **Canon divergence point / source anchor:** planned Kid Buu finale. Baseline L-B3; Buu (later half planned).
- **What the player does / objective / special gameplay mechanic:** Good Buu chooses a prolonged containment grapple while the others rescue Satan and align a final strike; the player must decide release timing through action.
- **Player character(s):** Good Buu / Vegeta / Goku. **New battle(s) / opponent(s):** Kid Buu.
- **Stage/environment consequences:** proposed Kai world.
- **New interactive cinematic:** Two Buus lock together and the safe firing lane keeps closing.
- **Immediate consequence → new story path / mission consequences:** Grapple → evacuation → containment fails in bursts → timed final beam separates and destroys the hostile form → Good Buu survives only if extracted.
- **Character/relationship consequences and continuity check:** Separation and immunity to the finishing attack cannot be assumed; rescue condition must be explicit, failure is an alternate tragic ending.
- **Form/transformation consequences:** Distinct Good/Kid Buu; no invented merger of them.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Good Buu survives only if extracted. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Good Buu Holds the Last Door” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: buu-vs-Buu distinct kits, containment struggle and survivor-specific endings.
- **Reusable existing systems:** Early-Buu tournament/flight/pursuit/civilians/ship; later foundation PLANNED.
- **New systems/content required / important risks:** Buu-vs-Buu distinct kits, containment struggle and survivor-specific endings.

### Scenario 133 — F01: The God Ritual Waits

**PROPOSED STORY DESIGN · LARGE · ritual / PLANNED**

- **Canon divergence point / source anchor:** planned Battle of Gods. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Delay the ritual until participants are safe; Vegeta buys time through defensive challenges rather than pretending to match Beerus.
- **Player character(s):** Vegeta / Goku. **New battle(s) / opponent(s):** Beerus.
- **Stage/environment consequences:** proposed Capsule Corporation.
- **New interactive cinematic:** The ritual circle breaks to rescue someone outside it.
- **Immediate consequence → new story path / mission consequences:** Ritual interrupted → evacuation → temporary duel → participants regroup → earned God-form test closes the branch.
- **Character/relationship consequences and continuity check:** All foundations unbuilt here; ritual eligibility and participants need explicit baseline. No mortal victory by ordinary damage.
- **Form/transformation consequences:** Planned God ritual delayed.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Earned God-form test closes the branch. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The God Ritual Waits” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: god ritual, Beerus encounter and civilian protection.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** God ritual, Beerus encounter and civilian protection.

### Scenario 134 — F02: Vegeta Takes the Ritual

**PROPOSED STORY DESIGN · LARGE · transformation / PLANNED**

- **Canon divergence point / source anchor:** planned Battle of Gods. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Vegeta becomes the ritual recipient; learn unfamiliar precision while Goku rescues people endangered by the test.
- **Player character(s):** God Vegeta / Goku. **New battle(s) / opponent(s):** Beerus.
- **Stage/environment consequences:** proposed Capsule Corporation / sky.
- **New interactive cinematic:** Red light surrounds the rival who did not expect to need anyone.
- **Immediate consequence → new story path / mission consequences:** Different recipient → unstable control → Beerus escalates → rival relay → Earth spared after a demonstrated lesson.
- **Character/relationship consequences and continuity check:** Spec names God, but this timing/recipient is alternate. No automatic Blue or later mastery.
- **Form/transformation consequences:** Earlier/different God recipient; no automatic Blue.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Earth spared after a demonstrated lesson. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Takes the Ritual” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: alternate God event and Vegeta-specific kit tuning.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Alternate God event and Vegeta-specific kit tuning.

### Scenario 135 — F03: Frieza Comes for the Rescue Ships

**PROPOSED STORY DESIGN · LARGE · villain strategy / PLANNED**

- **Canon divergence point / source anchor:** planned Resurrection of F. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Frieza targets evacuation infrastructure before challenging Goku; heroes split between defense and delaying elite squads.
- **Player character(s):** Krillin / Piccolo / Gohan. **New battle(s) / opponent(s):** Frieza army / Golden Frieza.
- **Stage/environment consequences:** proposed invasion coast.
- **New interactive cinematic:** The emperor ignores the arena and points at the fleeing transports.
- **Immediate consequence → new story path / mission consequences:** Transports attacked → defenders divide → rivals arrive separately → evacuation succeeds under golden pressure → final battle occurs away from Earth assets.
- **Character/relationship consequences and continuity check:** Golden Frieza and era-correct heroes are future content; no assumption current Namek kits suffice.
- **Form/transformation consequences:** Planned Golden Frieza era kits.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Final battle occurs away from Earth assets. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Frieza Comes for the Rescue Ships” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: large invasion, transport objectives and future forms.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Large invasion, transport objectives and future forms.

### Scenario 136 — F04: Vegeta Finishes His Turn

**PROPOSED STORY DESIGN · LARGE · rivalry / PLANNED**

- **Canon divergence point / source anchor:** planned Golden Frieza finale. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Prioritize interrupting planet-targeted attacks over a long victory speech; secure a finisher while guarding the core threat.
- **Player character(s):** Vegeta. **New battle(s) / opponent(s):** Golden Frieza.
- **Stage/environment consequences:** proposed invasion battlefield.
- **New interactive cinematic:** Vegeta abandons a combo to kick the destructive shot skyward.
- **Immediate consequence → new story path / mission consequences:** Finisher delayed → planet attack stopped → Frieza forced to face him → clean victory → rival acknowledges ownership of the win.
- **Character/relationship consequences and continuity check:** No automatic time-rewind safety net; Blue timing must follow planned era, not unlock early canon.
- **Form/transformation consequences:** Planned Blue/Golden era forms only.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Rival acknowledges ownership of the win. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Vegeta Finishes His Turn” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: planet-target interrupts and an alternate ending cinematic.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Planet-target interrupts and an alternate ending cinematic.

### Scenario 137 — F05: Cabba Won't Turn Angry

**PROPOSED STORY DESIGN · LARGE · tournament / PLANNED**

- **Canon divergence point / source anchor:** planned Universe 6 tournament. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Teach transformation through protecting a partner in a staged training premise instead of humiliating him; then win a ring-position duel.
- **Player character(s):** Cabba / Vegeta. **New battle(s) / opponent(s):** Vegeta / next tournament opponent.
- **Stage/environment consequences:** proposed U6 arena.
- **New interactive cinematic:** Cabba's aura rises when he chooses to stand between two fighters.
- **Immediate consequence → new story path / mission consequences:** Lesson changes → trust grows → tournament rematch → tactical ring-out → mentor bond ends without instant mastery.
- **Character/relationship consequences and continuity check:** Alternate lesson requires legal time/place outside bracket; no free SSJ2. All future cast unbuilt here.
- **Form/transformation consequences:** Planned Cabba awakening by a different event.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Mentor bond ends without instant mastery. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Cabba Won't Turn Angry” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: cabba kit, awakening and tournament interlude.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Cabba kit, awakening and tournament interlude.

### Scenario 138 — F06: Hit Uses the Whole Ring

**PROPOSED STORY DESIGN · LARGE · boss adaptation / PLANNED**

- **Canon divergence point / source anchor:** planned Universe 6 Hit battle. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Defeat spatial traps and timed counters with positioning rather than escalating power alone; ring-out is the achievable win.
- **Player character(s):** Goku / Vegeta. **New battle(s) / opponent(s):** Hit.
- **Stage/environment consequences:** proposed U6 arena.
- **New interactive cinematic:** A time-skip strike misses because the player baited the endpoint.
- **Immediate consequence → new story path / mission consequences:** First counter fails → pattern learned → boundaries become threat → feint forces ring-out → rematch promised.
- **Character/relationship consequences and continuity check:** Time-skip rules and visual accessibility must be authored; no unsupported immunity granted.
- **Form/transformation consequences:** No new form necessary for ring-out.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Rematch promised. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Hit Uses the Whole Ring” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: hit/time mechanics, telegraphs and tournament rules.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Hit/time mechanics, telegraphs and tournament rules.

### Scenario 139 — F07: Trunks Evacuates the Future

**PROPOSED STORY DESIGN · MAJOR · rescue / PLANNED**

- **Canon divergence point / source anchor:** planned Goku Black arc. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Prioritize evacuating civilians and defending time-machine fuel over winning every duel; return trips risk leaving people behind.
- **Player character(s):** Future Trunks / Mai. **New battle(s) / opponent(s):** Goku Black / pursuing forces.
- **Stage/environment consequences:** proposed Future Earth.
- **New interactive cinematic:** A launch succeeds while Trunks stays on the ground to hold the corridor.
- **Immediate consequence → new story path / mission consequences:** Evacuation plan → fuel raid → Black interrupts → relay rescues → final departure saves a community, not the entire timeline.
- **Character/relationship consequences and continuity check:** Time-machine capacity, fuel and branching laws need approval; Mai kit is future content; no retroactive erasure claimed.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Final departure saves a community, not the entire timeline. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Trunks Evacuates the Future” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: time travel logistics, future stages and multi-trip survivor records.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Time travel logistics, future stages and multi-trip survivor records.

### Scenario 140 — F08: The Seal Holds for a Minute

**PROPOSED STORY DESIGN · MAJOR · containment / PLANNED**

- **Canon divergence point / source anchor:** planned Zamasu confrontation. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** A temporary seal works but needs protection while civilians escape; defend fragile containment rather than defeating immortality by damage.
- **Player character(s):** Trunks / Goku / Vegeta. **New battle(s) / opponent(s):** Zamasu / Goku Black.
- **Stage/environment consequences:** proposed future ruins.
- **New interactive cinematic:** The container rattles louder than the battle outside.
- **Immediate consequence → new story path / mission consequences:** Temporary seal → partner attacks → escape route defended → seal fractures → survivors withdraw before release.
- **Character/relationship consequences and continuity check:** Technique knowledge, vessel and seal eligibility are unresolved prerequisites; no permanent solution by naming a technique.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Survivors withdraw before release. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Seal Holds for a Minute” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: containment system, immortal boss rules and evacuation.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Containment system, immortal boss rules and evacuation.

### Scenario 141 — F09: Krillin Stays in the Ring

**PROPOSED STORY DESIGN · LARGE · team survival / PLANNED**

- **Canon divergence point / source anchor:** planned Tournament of Power. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Save Krillin from an elimination through an earned partner catch, then play trick-based ring-outs while protecting the rescuer.
- **Player character(s):** Krillin / Android 18. **New battle(s) / opponent(s):** opposing tournament pair.
- **Stage/environment consequences:** proposed ToP arena.
- **New interactive cinematic:** The familiar falling silhouette is caught at the boundary.
- **Immediate consequence → new story path / mission consequences:** Elimination prevented → 18 exposed → team rotates cover → enemy pair counters → survivors reach a new late-round matchup.
- **Character/relationship consequences and continuity check:** Arena flight restrictions and elimination rules must be fixed first; no kills/resurrections as ordinary tournament rewards.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Survivors reach a new late-round matchup. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Krillin Stays in the Ring” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: multi-team ring rules and rescue permissions.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Multi-team ring rules and rescue permissions.

### Scenario 142 — F10: Frieza Keeps His Promise

**PROPOSED STORY DESIGN · LARGE · villain alliance / PLANNED**

- **Canon divergence point / source anchor:** planned ToP late rounds. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** Make an apparent betrayal a timed feint requiring both players' positions to align; earn a difficult joint ring-out.
- **Player character(s):** Frieza / Gohan. **New battle(s) / opponent(s):** opposing pair / Jiren encounter.
- **Stage/environment consequences:** proposed ToP arena.
- **New interactive cinematic:** Gohan falls deliberately into Frieza's returning flight path.
- **Immediate consequence → new story path / mission consequences:** Feint → mutual rescue → exhausted alliance → late boss pressure → earned team survival changes the finalists.
- **Character/relationship consequences and continuity check:** Trust remains tactical; no heroic personality overwrite. Future roster and ring rules required.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Earned team survival changes the finalists. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Frieza Keeps His Promise” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: allegiance feint, cooperative counter and late-round route.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Allegiance feint, cooperative counter and late-round route.

### Scenario 143 — F11: No Silver at the Finish

**PROPOSED STORY DESIGN · MAJOR · transformation delayed / PLANNED**

- **Canon divergence point / source anchor:** planned Ultra Instinct climax. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** The expected awakening fails; rotate tired fighters through bait, barrier and ring-position objectives to force a team finish.
- **Player character(s):** Goku / Vegeta / Android 17. **New battle(s) / opponent(s):** Jiren.
- **Stage/environment consequences:** proposed ToP arena.
- **New interactive cinematic:** Goku's aura fades and three allies step forward together.
- **Immediate consequence → new story path / mission consequences:** Awakening absent → failed solo duel → barrier saves team → coordinated displacement → group ring-out decides the outcome.
- **Character/relationship consequences and continuity check:** No equivalent power buff under another name; barriers/flight limits and active survivors need explicit ledger.
- **Form/transformation consequences:** Ultra Instinct absent; team solution.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Group ring-out decides the outcome. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “No Silver at the Finish” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: future character kits and multi-fighter final boss.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Future character kits and multi-fighter final boss.

### Scenario 144 — F12: The Winner Must Stay

**PROPOSED STORY DESIGN · MAJOR · wish / PLANNED**

- **Canon divergence point / source anchor:** planned ToP final wish. Baseline L-F; Super (planned).
- **What the player does / objective / special gameplay mechanic:** An experimental wish consequence requires the winner to anchor restoration while teammates rescue scattered survivors.
- **Player character(s):** Android 17 / surviving team. **New battle(s) / opponent(s):** post-tournament rescue hazards.
- **Stage/environment consequences:** proposed unstable arena / restored worlds.
- **New interactive cinematic:** The restored sky appears, but the winner cannot move.
- **Immediate consequence → new story path / mission consequences:** Wish accepted with stated condition → team gathers survivors → anchor defended → final teammate returns → release closes the alternate ending.
- **Character/relationship consequences and continuity check:** Not asserted Super Dragon Ball lore; explicit game-only wish condition needs approval and cannot rewrite canon rules silently.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Release closes the alternate ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Winner Must Stay” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: restoration scenario, approved wish cost and new environments.
- **Reusable existing systems:** Generic mission/combat/scenes/tournament; era foundation PLANNED.
- **New systems/content required / important risks:** Restoration scenario, approved wish cost and new environments.

### Scenario 145 — X01: No Beam, No Grave

**PROPOSED STORY DESIGN · SMALL · SECRET**

- **Canon divergence point / source anchor:** whatif_raditz finalFight variant. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** A clearly hinted no-beam opening unlocks an optional close-range counter round before the existing-style clash payoff.
- **Player character(s):** Goku. **New battle(s) / opponent(s):** Raditz.
- **Stage/environment consequences:** plains.
- **New interactive cinematic:** Raditz reaches for distance and finds Goku still inside his guard.
- **Immediate consequence → new story path / mission consequences:** Condition earned → extra counter round → rival forced to clash → victory record → return to alternate selector.
- **Character/relationship consequences and continuity check:** An added standalone challenge, not a secret canon rewrite; Goku's survival premise still removes King Kai year.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Return to alternate selector. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “No Beam, No Grave” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** SMALL; 1 mission. Cost/risk: condition tracking and bonus round, no new form.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Condition tracking and bonus round, no new form.

### Scenario 146 — X02: Saibaman Number Seven

**PROPOSED STORY DESIGN · MEDIUM · SECRET**

- **Canon divergence point / source anchor:** saiyan_saibamen optional challenge. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Clear every latch safely, then discover a hidden seed with a coordinated burrowing ambush pattern.
- **Player character(s):** Yamcha / Krillin. **New battle(s) / opponent(s):** camouflaged Saibaman leader.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** The victory silence breaks under the player's feet.
- **Immediate consequence → new story path / mission consequences:** Clean defense → hidden seed found → ambush → rescue partner → secret local victory.
- **Character/relationship consequences and continuity check:** An explicitly invented extra seed/leader; no claim of a canonical seventh opponent or new species.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Secret local victory. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Saibaman Number Seven” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: hidden-condition reveal and burrow boss variant.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Hidden-condition reveal and burrow boss variant.

### Scenario 147 — X03: The Prince Bows Once

**PROPOSED STORY DESIGN · MEDIUM · SECRET**

- **Canon divergence point / source anchor:** whatif_piccolo optional challenge. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Win without using the team attack, then earn a brief optional Vegeta challenge by successfully protecting Gohan again.
- **Player character(s):** Piccolo / Gohan. **New battle(s) / opponent(s):** Vegeta nonlethal test.
- **Stage/environment consequences:** wasteland.
- **New interactive cinematic:** Vegeta lowers his crossed arms and asks to see the defense himself.
- **Immediate consequence → new story path / mission consequences:** Unusual win → prince tests pair → team deflects one attack → he withdraws interest → secret record closes.
- **Character/relationship consequences and continuity check:** Not an actual friendship or Namek recruitment; cannot claim Vegeta bows physically without authored characterization approval.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Secret record closes. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Prince Bows Once” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: hidden performance rule and short alternate boss.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Hidden performance rule and short alternate boss.

### Scenario 148 — X04: Captain of the Pond

**PROPOSED STORY DESIGN · MEDIUM · SECRET / comedy**

- **Canon divergence point / source anchor:** namek_frog optional dream challenge. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Navigate a tiny stealth course, leap between cover and avoid accidental stomps while seeking a valid swap target.
- **Player character(s):** Ginyu in frog. **New battle(s) / opponent(s):** wildlife / patrol boots.
- **Stage/environment consequences:** proposed miniature Namek pond.
- **New interactive cinematic:** The famous battlefield towers above a frog-sized camera.
- **Immediate consequence → new story path / mission consequences:** Frog escapes → crosses patrol lane → almost reaches a body → rescue basket closes → comic ending preserves containment.
- **Character/relationship consequences and continuity check:** Body cannot use humanoid combat/ki by assumption; label bonus fantasy if frog cognition/control rules are not adopted.
- **Form/transformation consequences:** Frog body with creature limits, not a combat transformation.
- **Boss consequences:** The challenge centers on the stated objective rather than a new health-bar boss.
- **Ending:** Comic ending preserves containment. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Captain of the Pond” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: creature traversal, scale-specific camera and pond stage.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Creature traversal, scale-specific camera and pond stage.

### Scenario 149 — X05: The Wrong Pair Mirrors the Dance

**PROPOSED STORY DESIGN · LARGE · EXPERIMENTAL / fusion**

- **Canon divergence point / source anchor:** future fusion-training sandbox. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Attempt a clearly labeled non-canon compatible-pair experiment, then test an unfamiliar reach-and-counter fighter.
- **Player character(s):** Goku / Piccolo / proposed fusion. **New battle(s) / opponent(s):** training opponent.
- **Stage/environment consequences:** proposed training arena.
- **New interactive cinematic:** The silhouette has neither fighter's expected proportions.
- **Immediate consequence → new story path / mission consequences:** Experiment → unstable fusion → controlled spar → rescue teacher from runaway technique → voluntary separation.
- **Character/relationship consequences and continuity check:** Spec disallows random roster-inflating fusions; blocked from adoption absent an explicit exception and compatibility rules.
- **Form/transformation consequences:** New experimental fusion identity; blocked on spec exception.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Voluntary separation. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Wrong Pair Mirrors the Dance” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: entire fighter/rig/kit, fusion compatibility; sandbox only.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Entire fighter/rig/kit, fusion compatibility; sandbox only.

### Scenario 150 — X06: The Emperor Wears the Earrings

**PROPOSED STORY DESIGN · MAJOR · EXPERIMENTAL / fusion boss**

- **Canon divergence point / source anchor:** future non-canon sandbox. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Fight a deliberately impossible-history boss that alternates regeneration and precision barrages, with two readable resource vulnerabilities.
- **Player character(s):** Vegito. **New battle(s) / opponent(s):** proposed Frieza–Cell fusion.
- **Stage/environment consequences:** proposed challenge arena.
- **New interactive cinematic:** Two iconic villains collapse into one unfamiliar shadow.
- **Immediate consequence → new story path / mission consequences:** Museum-like challenge premise → fusion revealed → counter both resources → break stabilization → optional secret victory.
- **Character/relationship consequences and continuity check:** No shared canon date/alive-state established; requires explicit out-of-time sandbox and spec exception. Never insert into Namek/Cell story.
- **Form/transformation consequences:** New experimental villain fusion; sandbox only.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Optional secret victory. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Emperor Wears the Earrings” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MAJOR; 4–6 missions / mini-campaign, or MAJOR new-identity cost. Cost/risk: new fusion villain, anatomy/kit/AI and sandbox framing.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** New fusion villain, anatomy/kit/AI and sandbox framing.

### Scenario 151 — X07: Android Fifteen's Unfinished Delivery

**PROPOSED STORY DESIGN · LARGE · EXPERIMENTAL / movie-adjacent**

- **Canon divergence point / source anchor:** Movies/Specials-adjacent proposal. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Discover an unrelated prototype carrying a failing power core; escort then duel it as its orders conflict.
- **Player character(s):** Trunks / proposed Android 15. **New battle(s) / opponent(s):** rogue android recovery squad.
- **Stage/environment consequences:** proposed industrial site.
- **New interactive cinematic:** The supposed assassin stops to retrieve a part instead of attacking.
- **Immediate consequence → new story path / mission consequences:** Prototype found → escort bargain → recovery squad attacks → core destabilizes → disable rather than destroy the courier.
- **Character/relationship consequences and continuity check:** No Android 15 support found in current story; not inserted into canonical Gero/Cell chain. Origin and kit entirely unresolved.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Disable rather than destroy the courier. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Android Fifteen's Unfinished Delivery” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: new character, movie-category approval and core-carry objectives.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** New character, movie-category approval and core-carry objectives.

### Scenario 152 — X08: Seven Balls, No Wish

**PROPOSED STORY DESIGN · MEDIUM · SECRET / wish**

- **Canon divergence point / source anchor:** future Dragon Ball Hunt. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Collect a complete set but deliberately protect it unused while transporting wounded allies through an ambush.
- **Player character(s):** Krillin / Piccolo. **New battle(s) / opponent(s):** thieves / environmental threats.
- **Stage/environment consequences:** proposed hunt areas.
- **New interactive cinematic:** The dragon remains uncalled while the heroes solve the rescue themselves.
- **Immediate consequence → new story path / mission consequences:** Set gathered → summon deferred → thieves strike → physical rescue succeeds → set preserved for a later need.
- **Character/relationship consequences and continuity check:** Hunt system is planned; no extra wish earned by waiting, no cooldown reset. Exact saga must be fixed before selection.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** The challenge centers on the stated objective rather than a new health-bar boss.
- **Ending:** Set preserved for a later need. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Seven Balls, No Wish” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: hunt foundation, possession ledger and restraint reward.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Hunt foundation, possession ledger and restraint reward.

### Scenario 153 — X09: Two Left Feet Save the Day

**PROPOSED STORY DESIGN · LARGE · SECRET / fusion failure**

- **Canon divergence point / source anchor:** planned Gotenks failure variant. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Use an awkward low-power body to slip through a gap and pull civilians out while Buu ignores it; separated children finish the evacuation.
- **Player character(s):** failed fusion / children. **New battle(s) / opponent(s):** Super Buu.
- **Stage/environment consequences:** proposed city rubble.
- **New interactive cinematic:** A comic failed pose becomes the only body that fits the rescue route.
- **Immediate consequence → new story path / mission consequences:** Failure → enemy dismisses fusion → trapped civilians reached → timer expires → children escape together.
- **Character/relationship consequences and continuity check:** No invincible gag physics; failed fusion's dimensions and timer need authored rules.
- **Form/transformation consequences:** Failed-fusion identity with its own limits.
- **Boss consequences:** New/planned encounter content; kit/targeting and ending require authoring.
- **Ending:** Children escape together. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “Two Left Feet Save the Day” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: failure fighter, narrow-space rescue and timed separation.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Failure fighter, narrow-space rescue and timed separation.

### Scenario 154 — X10: The Senzu Stays in the Bag

**PROPOSED STORY DESIGN · MEDIUM · SECRET / alternate boss**

- **Canon divergence point / source anchor:** cell_games challenge premise. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** A visible no-item condition opens an optional endurance battle with resource carryover, distinct from changing the whole saga.
- **Player character(s):** Goku / Gohan. **New battle(s) / opponent(s):** fatigued Cell.
- **Stage/environment consequences:** Cell arena.
- **New interactive cinematic:** Goku gives Gohan a nod instead of a bean animation.
- **Immediate consequence → new story path / mission consequences:** Condition → endurance round → rescue interval → coordinated finish → standalone challenge record.
- **Character/relationship consequences and continuity check:** Do not confuse with C19's narrative route; this is a replay challenge, not a persistent canon choice.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Standalone challenge record. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Senzu Stays in the Bag” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: condition tracking and separate challenge result.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Condition tracking and separate challenge result.

### Scenario 155 — X11: The Potara Passes Twice

**PROPOSED STORY DESIGN · LARGE · EXPERIMENTAL / fusion**

- **Canon divergence point / source anchor:** planned Buu rescue sandbox. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Defend a dropped earring through a relay of vulnerable carriers, then fuse only after both recipients reach a safe lane.
- **Player character(s):** Goku / Vegeta / approved fused identity. **New battle(s) / opponent(s):** Buu.
- **Stage/environment consequences:** proposed ruined Earth.
- **New interactive cinematic:** The tiny earring changes hands beneath planet-breaking attacks.
- **Immediate consequence → new story path / mission consequences:** Drop → relay → carrier rescue → correct pair reunites → fusion turns the battle.
- **Character/relationship consequences and continuity check:** Default resulting pair remains Goku/Vegeta; alternate recipient would require a separate approved identity. No arbitrary item duplication.
- **Form/transformation consequences:** Default approved Goku/Vegeta fusion after item relay.
- **Boss consequences:** Existing opponent identity; new objective/targeting and ending, as above.
- **Ending:** Fusion turns the battle. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Potara Passes Twice” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** LARGE; 2–3 missions / substantial new mechanic. Cost/risk: physical fusion-item possession and future Potara foundation.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Physical fusion-item possession and future Potara foundation.

### Scenario 156 — X12: The Rematch Nobody Announces

**PROPOSED STORY DESIGN · MEDIUM · SECRET / relationship**

- **Canon divergence point / source anchor:** post-Saiyan alternate survivors' spar. Baseline L-X; Secret / experimental.
- **What the player does / objective / special gameplay mechanic:** Complete a no-casualty alternate invasion route to reveal a quiet team spar focused on rescue counters and support timing.
- **Player character(s):** Yamcha / Tien / Krillin / Chiaotzu. **New battle(s) / opponent(s):** rotating friendly pairs.
- **Stage/environment consequences:** wilderness.
- **New interactive cinematic:** Four fighters stand in training clothes where the player expected memorial silence.
- **Immediate consequence → new story path / mission consequences:** Survival route cleared → invitation → paired spar → support reversal → shared meal implied in a quiet ending.
- **Character/relationship consequences and continuity check:** Requires an authored route actually saving all four; not unlocked merely by a high score in canonical deaths.
- **Form/transformation consequences:** No new form required; era restrictions in the starting ledger apply.
- **Boss consequences:** The challenge centers on the stated objective rather than a new health-bar boss.
- **Ending:** Shared meal implied in a quiet ending. **Canon rejoin / alternate timeline:** Alternate timeline; local endpoint, no automatic rejoin.
- **Unlocks:** R — “The Rematch Nobody Announces” record/replay; no automatic canon grant.
- **Estimated scope / mission structure:** MEDIUM; 1 mission / optional 2 encounters. Cost/risk: survivor-sensitive unlock predicate and friendly team encounter.
- **Reusable existing systems:** Objectives, conditions, party/scenes; future dependencies as stated.
- **New systems/content required / important risks:** Survivor-sensitive unlock predicate and friendly team encounter.

## Potential Multi-Mission What-Ifs

### Mission-count options

| Structure | Candidates and playable breakdown | Scope/dependency meaning |
|---|---|---|
| 1 mission | S11 latch counter → swarm rescue → survivor ending; N11 breath-pressure duel → Force aftermath; B03 final → exhibition; X01 optional counter round → clash | SMALL where existing kits suffice. Local endpoint, not a whole saga rewrite. |
| 2–3 missions | S06 Earth training → Nappa team defense → giant-tail extraction; N25 bomb victory → occupation-force rescue → evacuation; C15 intercept Vegeta → escort 18 → Cell finish | LARGE when consequences replace several encounters; can ship as independent scenario slices first. |
| 2–3 future missions | B05 theft intervention → pursuit → seal defense; B18 failed-fusion rescue → separate-child survival → successful retry; B24 ritual → early arrival → no-absorption boss | LARGE with unbuilt foundations explicitly included in feasibility assessment. |
| 4–6 missions | N16 stolen body → hide/recover → steal transport → bait exchange → boss confrontation → body-resolution ending; C26 defeat → refuge → supply rescue → machine defense → escape | MAJOR: route state, changed cast and persistent outcomes matter. |
| Full alternate mini-campaign | S25 occupied Earth; N32 imperial aftermath; C05 no-Goku Android/Cell; B35 absorbed-Gohan rescue campaign | MAJOR; not a promise to cover every later saga. Requires a declared endpoint and separate campaign record. |

### Total Timeline A — S25: Earth Under the Prince

**Canon timeline:** Goku and allies defeat Vegeta and spare him. **Divergence:** Vegeta wins the final desperate fight. **Branch:** occupied-Earth escape campaign. **Ending:** refugees leave under fire; Earth is not magically liberated. **Rejoin:** none.

- **Survives:** Vegeta, injured captive Goku, fugitives Krillin/Gohan; Yajirobe can survive only if the opening extraction saves him. **Dead:** earlier canonical Yamcha/Tien/Chiaotzu/Piccolo losses remain. Nappa is already executed at this late anchor.
- **Playable:** a short Vegeta victory opener, then Krillin, Gohan and rescued Yajirobe; Goku becomes playable only after extraction, with injury limits.
- **New missions:** win the last duel; evade occupation patrols; steal transport/fuel; free Goku; defend the launch. Enemy reinforcements require an explicit arrival interval; they do not appear instantaneously.
- **Boss fights:** Vegeta's pursuit is a survival encounter; proposed occupation commander controls the launch site; final Vegeta confrontation is timed defense, not a sudden child victory.
- **Forms:** Gohan's rage remains his existing-era potential, not SSJ; no new transformation. Techniques retained only by their trained owners.
- **Relationships:** Vegeta's rule creates reluctant cooperation among surviving humans. Goku must accept rescue rather than win everything himself.
- **Dragon Balls:** Piccolo's death removes the easy Earth-wish solution; no occupation immortality wish without another route. Do not automatically import Namek knowledge.
- **Final battle/ending:** launch defense, interrupted pursuit, wounded survivors aboard a stolen vessel. The next destination is a future design question, not silently Namek canon.
- **Scope/risk:** MAJOR because travel, prisoners, injured cast and occupation must be authored. Reuse pursuit, party defense and boss pressure; new transport/custody systems are required.

### Total Timeline B — N16: The Captain Keeps Goku

**Canon:** Goku regains his body. **Divergence:** that interception fails in the scenario premise. **Branch:** five-mission identity-and-rescue campaign. **Ending:** restore bodies through an earned final exchange, then escape; an unresolved-body ending is a separate variant. **Rejoin:** none without an explicit later-state audit.

- **Starting survivors:** Goku's mind in wounded Ginyu body; Ginyu's mind in Goku body; Vegeta/Krillin/Gohan alive at this window. Prior Force deaths stand unless the precise opening says otherwise.
- **Playable:** Goku-in-Ginyu, Krillin and Vegeta; a brief captain-in-Goku villain mission can teach the stolen body's poor mastery.
- **New missions:** retreat with the broken body; recover supplies without Frieza's notice; steal access to the ship; provoke the captain's ambition; stage a controlled swap under fire.
- **Bosses:** Ginyu-in-Goku has dangerous physical capability but unfamiliar control; Frieza threatens both sides. No automatic SSJ, Kaioken proficiency or perfect Goku personality.
- **Body ledger example:** start A = Goku mind/Ginyu body, B = Ginyu mind/Goku body. Every beam transfers *minds* according to one approved rule; injury stays with the body. Restoring A/B cannot duplicate anyone or erase damage.
- **Climax:** protect a valid intercept lane while controlling a vulnerable receiver. Frieza's intervention makes restoration an objective under pressure, not a dialogue choice.
- **Wishes/knowledge:** no wish casually reverses the theft; language, balls and recipients still need a separate ledger. Heroes learn the captain's location through captured signals, not mind-reading.
- **Scope/risk:** MAJOR for persistent mind/body identity, HUD/voice/technique attribution, multiple injuries and checkpoint reconstruction. Current Body Change proves a local encounter is possible; it does not prove all of this exists.

### Total Timeline C — N25: The Spirit Bomb Works

**Canon:** Frieza survives the bomb, kills Krillin, provokes SSJ and attacks Namek's core. **Divergence:** the expanded defense/charge objective truly finishes him. **Branch:** victory followed by civilian extraction. **Ending:** heroes secure an intact-world evacuation. **Rejoin:** none; no Mecha Frieza/ordinary Yardrat chain assumed.

- **Survives:** Goku, Piccolo, Gohan and Krillin, with charge-defense injuries. **Dead:** Frieza; Vegeta still dead from the prior scene unless an explicit separate rescue premise is selected.
- **Playable/new missions:** Piccolo holds charge lanes; Goku lands the bomb; Krillin/Gohan rescue villagers from a retreating occupation unit; final convoy defense.
- **Bosses:** final-form Frieza for the earned kill, then a proposed extraction commander using transports and hostages rather than emperor-level strength.
- **Forms:** Goku never receives this route's canonical SSJ trigger; no substitute transformation is required. Nail/Piccolo merger remains if this route begins from normal bomb setup.
- **Unexpected consequence:** the victory removes the central tyrant but releases scattered troops to loot fuel and abandon civilians. The next challenge is restraint and logistics.
- **Wishes:** invent no blanket free resurrection. Before selection, reconcile dragon identity, available balls, living interpreters, guardian condition and unused wishes.
- **Scope/risk:** LARGE, three missions. Reuse bomb defense, party play and Namek stage; new withdrawal/rescue objectives. No Namek implementation is changed by this proposal.

### Total Timeline D — C15: Trunks Stops His Father

**Canon:** Vegeta permits perfection. **Divergence:** Trunks physically prevents him reaching 18's escape lane. **Branch:** interception → escort → incomplete-Cell hunt. **Ending:** Cell defeated before Games. **Rejoin:** none.

- **Survives:** Vegeta, Trunks, 18, Piccolo/Tien if their preceding canonical rescue state allows it. **Absorbed:** 17. **Dead at ending:** Cell if finish succeeds; 17's recoverability must be decided explicitly, never assumed.
- **Playable:** Trunks for the nonlethal father encounter, 18 for extraction, Vegeta/Trunks for final hunt.
- **Boss variation:** two threats with different goals: Vegeta wants access, Cell wants absorption. Damage alone cannot solve both. Cell's regeneration/escape becomes the final mechanic.
- **New transformation consequences:** no Perfect/Super Perfect Cell, no automatically earned SSJ2 Gohan, no Games-based Goku death.
- **Relationships:** Vegeta's choice to help rescue Trunks later is an action, not a speech resetting their conflict. 18 helps because she is the target, not because she suddenly joins the family.
- **Wishes/future:** Goku's illness recovery stays on its own schedule. Future Trunks's world is not repaired by a present victory. Later Buu cannot be loaded with the standard seven-year-dead-Goku premise.
- **Scope/risk:** LARGE, three missions; neutral/hostile/allied targeting and absorbed-person ending are the main risks.

### Total Timeline E — C26: Cell Wins the Broadcast

**Canon:** Father–Son beam wins. **Divergence:** Cell wins that struggle. **Branch:** survivors' rescue-and-exit campaign. **Ending:** a refugee launch survives; Cell remains a threat. **Rejoin:** none.

- **Dead:** Gohan from the alternate beam result; Goku already sacrificed; 16 already destroyed. **Survives by authored opening:** Piccolo, Krillin, Vegeta, 18 and a restored/otherwise explicitly living Trunks. If the selected exact baseline has Trunks dead, a *prior additional divergence is required*; the route cannot just spawn him.
- **Playable:** Piccolo and Krillin lead immediate rescues; use Trunks only after resolving the previous sentence. Otherwise Bulma-directed machine defense can be played through surviving fighters.
- **New missions:** pull survivors from the arena; hide civilians; raid supplies; secure Bulma and a working machine; defend departure. Cell's destruction of infrastructure becomes the obstacle.
- **Bosses:** pursuit Cell/Juniors; a final timed defense against Cell. No ordinary fighter is secretly raised to SSJ2-equivalent output.
- **Final battle:** keep the launch zone intact and break pursuit lines long enough to depart. One survivor staying behind can be a visibly earned tragic variant, not a random hidden roll.
- **Timeline safety:** escaping to another date/world creates another branch; it does not delete this world's loss. Wish access is unresolved, not an easy reset button.
- **Scope/risk:** MAJOR; machine capacity, living Trunks eligibility, refugee cast and severe tone require decisions before any implementation.

### Total Timeline F — B05/B11: The Seal Never Opens

**Canon:** theft and duel fuel the awakening. **Divergence:** retrieve stolen energy and refuse the Majin bargain. These are two prerequisites, not one small action that automatically prevents everything. **Branch:** tournament interception → covert pursuit → ship disablement → seal defense. **Ending:** Buu remains sealed under a stated guard arrangement. **Rejoin:** none.

- **Survives:** tournament heroes and civilians saved by the route; Goku remains a time-limited visitor. Courier survival depends on extraction; Dabura remains an enemy until defeated or freed under a separate approved premise.
- **Playable:** Krillin/Videl for the first physical intervention; Gohan for pursuit; Vegeta/Goku for ship defense. Videl never receives Saiyan-level combat power.
- **Bosses:** Spopovich/Yamu as a possession chase, then Pui Pui/Yakon/Dabura with objectives that deny energy transfer. Babidi acts through magic nodes/minions, never a standard punchable fighter.
- **Forms:** no Majin Vegeta if the offer is refused; no new fusion/Ultimate/SSJ3 required merely to finish the seal route.
- **Final battle:** disable remaining channels while surviving Dabura; win when the seal is secured, not when an arbitrary damage bar says all stored energy vanished.
- **Wishes:** optional casualty restoration is a later question. Do not grant a wish to erase the sealed creature unless approved rules permit it.
- **Scope/risk:** MAJOR as a combined campaign, even if B05 and B11 are individually LARGE options. Needs an energy ledger and a credible permanent containment responsibility.

### Total Timeline G — B35: Gohan Becomes the Boss

**Canon/planned:** Ultimate Gohan dominates until absorption changes the fight. **Divergence:** an alternate trap succeeds under player-controlled villain perspective, with a survivor rescue route designed around the result. **Branch:** trap → survivors regroup → internal infiltration → captive release. **Ending:** Gohan rescued but Buu remains outside. **Rejoin:** none until later form/rescue states align.

- **Survives:** absorbed Gohan, outside survivors specified before launch. Absorption is captivity, not death. Do not populate the rescue party with someone already absorbed.
- **Playable:** a short Buu trap mission, then Piccolo/another explicitly outside survivor, then freed Gohan with recovery limits.
- **Bosses:** composite Buu borrows precise Gohan pressure; internal defenses interrupt rescue. The player disables techniques by freeing their source rather than merely reducing health.
- **Forms:** Ultimate belongs to ritual-trained Gohan; Buu's composite use needs the planned absorption system. No free new hero form.
- **Final battle:** multi-captive extraction through changing corridors, followed by a brief escape duel against the weakened composition.
- **Knowledge/wishes:** rescuers need an entry method and way to locate captives. No wish-based remote extraction silently added.
- **Scope/risk:** MAJOR; nearly every major foundation is planned content. This is a future selection option, not current implementation advice.

### Total Timeline H — B34: A World Still Missing

**Canon/planned:** Earth restoration enables humanity's role in the final Spirit Bomb. **Divergence:** spend the available approved wish on fighter recovery first. **Branch:** renewed duel → dwindling defenders → containment finish → restoration quest endpoint. **Ending:** immediate enemy threat contained/defeated by an explicitly approved alternative, Earth restoration still owed. **Rejoin:** none.

- **Survives:** fighters already transported to Kai world and Good Buu/Satan only if their baseline rescues are authored. Earth inhabitants are not secretly alive elsewhere.
- **Playable:** restored Goku, exhausted Vegeta, Good Buu. Restoration of one fighter does not heal the whole party.
- **Bosses:** Kid Buu pressure with escalating terrain denial; final containment/strike needs a concrete rule before selection.
- **Forms:** existing era forms only; replenished stamina is not a new transformation. SSJ3 still has its costs.
- **Wishes:** this scenario is blocked on dragon capacity, remaining wishes and whether the proposed restoration target is legal. The branch cannot spend the same wish twice.
- **Scope/risk:** MAJOR because the final-battle alternative and restoration aftermath are not designed systems yet. The uncertainty is the creative premise's cost, not a hidden continuity repair.

## Potential Alternate Endings

| Ending family | Examples | Required record |
|---|---|---|
| Local survivor ending | S11, S13, N22, C20 | Who lives, injury state, last playable scene; no automatic later campaign change |
| True early victory | S02, N25, C14, C23 | Missing later transformations/villains and cancelled downstream events |
| Costly escape | S25, N15, N32, C26 | Passengers saved, those left behind, vessel and destination |
| Restored identity | N16–N19 | Mind/body mapping and injuries at the final frame |
| Containment | N09, B11, B15, F08 | What holds the threat, who guards it, duration and failure risk |
| Relationship earned in battle | S16, S28, C15, B12, F10 | Action proving cooperation; no instant personality reset |
| Comic but consequential | X04, X09, B18 | Local gag outcome without corrupting canonical chronology |
| Alternate champion/rejoin candidate | B03 | Changed winner and rivalry remain acknowledged; adult plot can potentially continue |

A losing player attempt normally retries the same scenario. A *villain-victory premise* is selected intentionally. Do not surprise a player with permanent canon deaths because they missed an optional challenge.

## What-If Systems Already Supported

**CONFIRMED from source and existing missions:**

- Separate canon and What-If lists/cards, canon-clear access conditions and mission flags. Two actual alternate missions exist.
- Mission phases/generators, objectives, optional objectives, checkpoint retry, timed survival, failure/success, ranks and results.
- Party switching, AI allies and boss pressure; technique-specific struggles and beam clashes; body-change encounter; real giant mechanics.
- Staged scenes can set a final state after skip. This is useful machinery, not a guarantee that new alternate outcomes will reconstruct correctly.
- Character forms, per-mission restrictions and story-taught forms. Canon chronology protection explicitly checks `def.canon`; a What-If needs its own intentional restrictions.
- Versioned save envelope with `story.missions` and `whatIf.missions`. What-If completion leaves canon `story.lastMission` untouched.
- Existing conditions can inspect a mission clear from either track, enabling a simple authored follow-up unlock in principle. Shared unlock lists already exist.
- Tournament ring-out/bracket machinery, flight lessons, pursuit, civilians, regenerators/absorbers, destructible terrain, giant tails and Spirit Bomb defense offer reusable encounter patterns.

The present save is **one physical versioned save with two logical mission tracks**, not a separate physical file for each alternate timeline. Developer mode has a different slot; this is unrelated to What-If timeline ownership.

## What-If Systems Potentially Needed

### Save / progression design analysis — no save changes made

| Concern | Existing support | Conceptual requirement for larger routes |
|---|---|---|
| Canon progression | Ordered canon clears, last mission | Never let alternate completions advance canon order or mark canon scenes seen by accident |
| What-If progression | Per-mission completed/clears/best score/rank, seen flag | Route ID, selected premise, route version and completed nodes if multi-mission stories are chosen |
| Survivors/injuries | Authored mission-local state/checkpoint reconstruction | Explicit route snapshot or deterministic reconstruction; living/dead/down/petrified/absorbed are distinct |
| Forms/techniques | Runtime learning and canonical form gates | Era-specific branch capability list; mastery and temporary access distinct from global unlocks |
| Bodies/fusions | Local body-change example; later fusions planned | Mind/body/owner records, fusion participants/items/timer, safe de-fusion and save restoration |
| Wishes/Dragon Balls | Staged story events; generic flags exist | Dragon identity, ball location/owner, interpreter, prior wishes, eligibility, cooldown and remaining budget |
| Rewards | Shared unlock rules/lists | Idempotent rewards; alternate-clear grants permitted Free Battle access only by an explicit rule |
| Records | Best score/rank and clear count | Distinct ending/survivor records; don't let a high score from one outcome overwrite another |
| Replay | Mission restart and checkpoints | New run state isolated from saved best outcomes; replaying canon must not import alternate survivors |
| Completion percentage | Weights registered mission clears and unlocks across both tracks | Show canon completion and optional library completion separately if huge content is ever added |
| Migration | Versioned saves/import machinery | Safe route-version changes; missing/retired nodes must not silently map to canon IDs |
| Secrets | Conditions/flags available as primitives | Hints, discovery record, separate unlock predicates and deterministic replayability |

A generic `flags` object is not proof of a complete branch-state architecture. Likewise, mission `rewards` labels are not actual grants. The existing What-Ifs do not currently grant a global Raditz-survival campaign or Piccolo/Gohan team-attack skill.

### Future validation questions, not tests added

Selection of any larger route should eventually check canon-save equality before/after alternate play; all checkpoint starts with each survivor outcome; watched/skipped scene parity; failure/retry after an earned rescue; character/form/body ownership after switch; reward idempotence; replay without state leakage; developer-slot lifetime; and migrations with an interrupted branch.

Existing tests inspected include What-If flags/unlocks, canon order, checkpoint sweeps and Piccolo-route save separation. They do not establish correctness of the 156 unimplemented proposals. Historical 522-test claims remain historical; no full suite was run for this pass. The independent ASTRA_REVIEW already records lifecycle risks; this document does not fix or reclassify them.

## Canon Safety / Continuity Notes

1. Canon and alternate selectors must remain visibly distinct. A proposal anchored to a canon mission does not authorize modifying that mission.
2. Every chosen route begins from one precise phase. “Namek-era Vegeta” is insufficient: before Zarbon defeat, after recovery and after Frieza's killing beam are different states.
3. Keep **dead**, **downed**, **petrified**, **absorbed**, **fused**, **body-swapped** and **temporarily visiting from Other World** distinct. Nappa kneeling in an existing alternate ending is not confirmed dead.
4. Knowledge follows witnesses, communications and discoveries. Breaking Raditz's scouter changes information; saving Vegeta before his speech changes what Goku has heard.
5. Techniques require teachers/time or explicit alternate events. Living Goku after Raditz has no ordinary King Kai route; pre-Yardrat Goku has no IT; Videl does not gain ki artillery from flight; early Gohan rage is not SSJ.
6. Wishes require a ledger, not a convenience sentence. Current `src/data/scenes/namek_aftermath.js` compresses resurrection/transport into Porunga dialogue (“everyone Frieza killed” and a second transport wish). This is confirmed script wording, **not independently verified franchise wish mechanics**. Resolve intended adaptation and exact prerequisites with Claude before designing wish-dependent continuations.
7. Namek core damage is causal. If Frieza dies to the Spirit Bomb, eruption escape cannot still happen without a new explicit cause.
8. Saving Piccolo changes the guardian/Dragon Ball problem; no automatic reason for the identical Namek journey. Saving Goku at Cell changes the seven-year-dead-Goku Buu premise.
9. The current Cell excerpts do not establish the whole Kami/chamber chronology; do not silently fill those gaps when a proposal depends on them.
10. Later Buu foundations and Super-era content are planned. A familiar anime event is not a ready project feature. New fusion identities that conflict with MASTER_SPEC's roster rule are retained only as labeled experimental ideas requiring an authoritative decision.
11. Cosmetic/model availability does not prove a character has a complete playable kit. New identities need moves, AI, animation, aura, voice/presentation and checkpoint behavior. No assets are requested or imported here.
12. Rejoin is a state comparison, not a title card. B03 can plausibly rejoin before the adult tournament while retaining a changed junior winner; most other entries intentionally end their own branch.

### Documentation observations relevant to design

The current live mission list and older count snapshots differ. `buu_majin.js`/its scene header still refer to Chapter 7 while live story order places it in Chapter 9. The Android chapter header starts at Age 764 although the android encounter explicitly occurs in Age 767. Adult Gohan's unlock label says age 18 while the Seven Years text describes seventeen. These are observed documentation/data-label inconsistencies, not changes requested by this pass. MASTER_SPEC remains authoritative; ask Claude to settle chosen-route dates rather than letting this bible become a competing specification.

## Character-Centered What-Ifs

These are search views of the same indexed concepts, not extra uncounted scenarios.

| Character question | Different causes and resulting missions |
|---|---|
| WHAT IF VEGETA…? | S16: his execution attempt creates Nappa's rebellion. S27: he refuses the moon and fights exhausted. N01/N05: he bargains with former colleagues. N22/N23: survives and optionally awakens early. C14/C15/C18: finishes Cell, is stopped by Trunks, or trains collaboratively. B11/B12: refuses the mark or protects spectators. F02/F04: becomes the ritual recipient or owns the Frieza finish. |
| WHAT IF PICCOLO…? | S04: pursues his own custody agenda. S10: teaches the ape instead of destroying the moon. S15: survives to defend Earth. N20/N21: refuses or accelerates Nail merger. C11/C12/C17: prevents escape, protects 17, or trains Gohan. B04/B08: tests Shin or reaches Zoon. B23: his tactics become the boss's weapon. |
| WHAT IF GOHAN…? | S03: must escape abduction. S18/S21: chooses a teacher or protects allies as a giant. N27: survives his father's death without a convenient new form. C19–C22: fights a tired Cell, saves 16, awakens early or never awakens. B01/B24/B25: public hero, early Ultimate or rescue before ritual completion. |
| WHAT IF KRILLIN…? | S12/S22/S23: rescues Yamcha, relays the bomb or refuses mercy. N02/N08/N11: rescues villagers, carries the last ball, defeats Guldo. N26: prevents the execution chain. B05: interrupts theft. F09: survives an elimination and supports 18. |
| WHAT IF TRUNKS…? | C01/C03: arrives late or shares his secret. C07/C08: reaches Gero first or cooperates with 17. C15/C18: stops or trains with his father. C25/C28: survives the return beam or brings rescue doctrine home. F07: prioritizes evacuation over repeated duels. Kid Trunks remains a different identity in B03/B18–B22. |
| WHAT IF GOKU…? | S01/S06/S07/S09: lives, loses his teacher, arrives early or limits Kaioken. N24/N25/N28/N30: pays a different technique cost, wins without SSJ, loses stability or rescues Frieza. C04/C19/C24: withdraws for medicine, withholds senzu or attempts return teleport. B14/B27/B29: manages visit time, refuses fusion or refuses absorption. |
| WHAT IF FRIEZA…? | N09: reaches a dragon but lacks authority. N18: becomes Ginyu's target. N29: destroys the core early. N30: is forced to depend on mercy. N32: wins and inherits refugees rather than a usable prize. F03: attacks rescue infrastructure. F10: honors tactical cooperation. |
| WHAT IF CELL…? | C11: loses his escape; C12–C16: loses access to an android; C19/C23: loses free recovery; C22/C26: never provokes SSJ2 or wins the beam; C27: refuses the tournament and hunts logistics. Each changes objectives rather than merely dialogue. |
| WHAT IF BUU…? | B15: keeps Babidi captive. B17: never splits. B22/B23: fails one absorption and seeks another. B30: changes because rescue order changes. B35: wins an absorption trap. B36: Good Buu accepts the final containment role. |
| Other drivers | P01–P03 Bardock; S03/S28 Raditz; S16/S17 Nappa; S11 Yamcha; S13/S14 Tien/Chiaotzu; N07/N20 Nail; N09/N10/N31 Dende; N16–N19 Ginyu; C09/C20 Android 16; B02/B05 Videl; B06 Yamu; B10 Dabura; B16/B17/B33 Satan. |

## Villain What-Ifs

| Villain outcome | Playable difference | IDs / scope |
|---|---|---|
| Wins the fight but not a safe world | Control villain opener, then victims' evacuation; no immediate heroic power equalizer | S03/S25, N32, C26, B35 — MAJOR |
| Escapes instead of dying | Capture transport, protect civilians and decide pursuit cost through play | C02 — MEDIUM; N13 — LARGE |
| Changes strategy | Seeds, coordinated Force, repair links, refusal of overload bait, city hunts | S17 MEDIUM; N13 LARGE; C06 MEDIUM; C27 LARGE; B09 MEDIUM |
| Temporarily cooperates | Shared extraction objective with a credible betrayal risk | S16/S28, N01/N05, B06/B10, F10 |
| Chooses another target | Protect the person/body/item that now matters rather than damage racing | N17/N18, B23, F03 |
| Never reaches expected form | Prevent absorption, deny regeneration or cut ritual supply | C12–C16, B11/B17 |
| Becomes the player's character | Injured Nappa escape; Jeice extraction; stolen-body Ginyu; Dabura resistance; Buu's trap | S16, N13/N18, B10/B35 |
| Plan succeeds and creates a new problem | Earth occupation lacks usable Dragon Balls; stolen Goku body lacks mastery; Cell victory destroys useful society; absorption invites internal rescue | S25, N16, C26, B35 |
| Experimental fusion boss | Counter two compositional resources with a dedicated kit and explicit sandbox framing | X06 — MAJOR / EXPERIMENTAL |

No villain cooperation is shorthand for redemption. The mission objective should expose whether the villain protects an ally, a bargaining chip or merely an escape route.

## Transformation What-Ifs

| Change | Gameplay consequence | Candidates / continuity cost |
|---|---|---|
| Same form, earlier event | Less preparation/control, different opponent response | N23 Vegeta SSJ is experimental; C21 Gohan SSJ2 requires new earned buildup; F02 God recipient changes |
| Same form, later or absent | Team survival replaces solo damage superiority | N25/N26 no canonical Goku SSJ trigger; C22 no SSJ2; F11 no Ultra Instinct |
| Different emotion | Protect or deliberately restrain rather than wait for a death | C20/C21, N23, F05; each needs an authored event, not a hidden stat threshold |
| Temporary access | Burst/recovery rhythm and vulnerable handoffs | N28 unstable SSJ; B14 SSJ3 visit cost; S09 controlled Kaioken |
| Existing giant at a new moment | Protect allies and tail, manage collateral | S10/S21; require moon/tail continuity and imperfect control |
| Fusion form timing | Lower-power tricks preserve a window; premature expiry changes player identity | B20/B21/B28/X09; actual duration rules need approval |
| Villain form prevented | Different kit remains dangerous through strategy | C12/C14/C16, N06 refusing to revert; do not compensate only with inflated HP |
| Ritual not completed | Existing tools and retreat objectives remain necessary | B25; never label incomplete work “half-Ultimate” without approval |

No SSJ Raditz/Nappa, SSJ Krillin, Saiyan Videl, early Beast or early Orange Piccolo is silently introduced. Those could be separate future experiments only if the authoritative scope changes; they are not needed to make the current library varied.

## Fusion What-Ifs

**Established in the project specification as future systems:** Gotenks, Vegito and Gogeta identities; dance/Potara conditions; failed/temporary fusion possibilities; distinct playable fusion kits. **Inspected local fusion-like story event:** Nail joining Piccolo. This does not establish that the general dance/Potara system is implemented.

- **N20 — Refused Namekian merger:** two weakened fighters escort an interpreter; strength deficit drives survival.
- **N21 — Earlier merger:** stronger guardian controls several evacuation lanes; arrival/wish timing is the cost.
- **B18 — Failed dance under attack:** awkward body evades, timer ends, children cover each other.
- **B19 — Earlier successful Gotenks:** time spent rescuing competes with time spent fighting.
- **B20 — Lower-form Gotenks:** ghosts/traps substitute for unsustainable burst power.
- **B21 — Fusion outlasts expectations:** EXPERIMENTAL instability mission; duration is a problem, not a free bonus.
- **B22 — Fusion avoids absorption:** delayed ghosts guard the approach lanes; boss changes targets.
- **B26 — Goku/Gohan Potara:** EXPERIMENTAL new identity, justified by one dramatic catch; requires a spec exception and complete fighter work.
- **B27 — Refused Potara:** two individually outmatched fighters perform a joint infiltration.
- **B28 — De-fusion during rescue:** carry different captives through different exits.
- **B29 — Vegito stays outside:** precision hostage extraction replaces intentional absorption.
- **X05 — Wrong dance partners:** EXPERIMENTAL training sandbox, not canon compatible by default.
- **X06 — Villain fusion boss:** EXPERIMENTAL out-of-time challenge, not a chronological villain resurrection.
- **X09 — Failed fusion saves civilians:** comedy creates a new traversal solution, not invulnerability.
- **X11 — Dropped Potara relay:** ordinary items become high-stakes objectives beneath huge attacks.

The last four are ideas retained for review, not a request to violate MASTER_SPEC's prohibition on random fusions added merely to inflate the roster.

## Dragon Ball / Wish What-Ifs

| Wish divergence | Actual mission consequence | IDs |
|---|---|---|
| First set stolen | Hunt, transport interception, fight consequences of a limited selfish wish | P04 |
| Scouter does not reveal the balls | Different reconnaissance/invasion instead of identical arrival dialogue | S05 |
| Revival delayed | Physical holding action synchronized with the hero's return | S26 |
| Guardian survives | Reevaluate need for Namek; defend Earth with more survivors | S15 |
| Guardian already dead under occupation | Steal a vessel rather than grant the conqueror immediate immortality | S25 |
| Last ball changes hands | Three-faction carry/chase, no instant summon | N08 |
| Villain reaches complete set first | Interpreter rescue; language/password remain obstacles | N09 |
| Interpreter refuses the demanded wish | Protect the refuser while the pursuing emperor forces cooperation | N10 |
| True Frieza victory by heroes changes wish needs | Villager extraction; dead prince remains a separate restoration question | N25 |
| Transport prioritizes civilians | Fighters must physically escape after budget is spent | N31 |
| Restore strength before restoring Earth | Final battle loses immediate access to humanity's contribution | B34 |
| Experimental wish has a stated cost | Winner anchors restoration while teammates perform rescue missions | F12 |
| Complete set deliberately unused | Win a physical rescue without consuming a wish | X08 |

**Resurrection-order variant for selection:** N31 can first restore a required guardian/interpreter instead of a combat powerhouse, changing who fights the escort mission. This is a subvariant of N31, not an extra indexed scenario. It is blocked until Claude confirms the dragon's rules and exact death/resurrection history. Reversing a wish, reusing a consumed wish, restoring a natural-death victim or granting a transformation through a wish must never be assumed.

## “One Small Change” Scenarios

Each starts with a small action but may require LARGE/MAJOR production work. Arrows are consequences, not automatic implementation branches.

- **S01:** Goku keeps his grip ↓ Raditz cannot dodge ↓ Goku survives ↓ no King Kai year ↓ ensemble invasion defense.
- **S02:** Piccolo fires from a slightly different lane ↓ first beam lands ↓ Gohan's rage breakthrough is skipped ↓ training needs another catalyst ↓ a less-tested child protects the mentor.
- **S05:** scouter breaks one sentence earlier ↓ Dragon Balls not overheard ↓ scouts replace the direct wish hunt ↓ defenders face reconnaissance ↓ interception battle changes invasion timing.
- **S11:** Yamcha looks back ↓ latch misses ↓ one fighter survives ↓ another wounded ally can be extracted ↓ a different Nappa opening.
- **S13:** Chiaotzu lets go ↓ no suicide blast ↓ Tien has a living partner ↓ psychic pressure replaces grief-driven overexertion ↓ paired survival until arrival.
- **S16:** Nappa hears Vegeta's tone ↓ dodges execution ↓ needs enemy shelter ↓ attacks his prince to escape ↓ injured villain protects Gohan's route.
- **S19:** a disk meets the artificial moon ↓ giant never forms ↓ Goku is not crushed ↓ base Vegeta must fight mobile allies ↓ exhausted team finish.
- **S22:** Gohan stands one step farther right ↓ bomb returns along another lane ↓ Vegeta cannot punish Krillin's throw ↓ energy relay survives ↓ coordinated rebound finish.
- **N02:** Krillin leaves a false trail ↓ Dodoria misses a shelter ↓ villagers survive ↓ heroes gain guides ↓ evacuation defense replaces a lone chase.
- **N05:** Vegeta pauses before killing Zarbon ↓ bargain survives ↓ ship route becomes available ↓ Frieza notices betrayal ↓ two villains defend an extraction.
- **N08:** one ball rolls into the water ↓ summoning fails ↓ three factions search ↓ an unlikely carrier alliance forms ↓ underwater-edge extraction.
- **N11:** Gohan waits for Guldo's breath ↓ freeze window breaks ↓ no Vegeta rescue needed ↓ prince loses leverage ↓ changed Recoome standoff.
- **N16:** Goku misses one swap lane ↓ captain retains his body ↓ heroes retreat wounded ↓ villain ambition exposes Frieza ↓ contested body-restoration climax.
- **N22:** Goku moves before the killing beam ↓ Vegeta lives injured ↓ prince can provide one covering shot ↓ bomb defense changes ↓ fragile-ally rescue finale.
- **N25:** Piccolo protects one more charge interval ↓ bomb completes ↓ Frieza actually dies ↓ no death-triggered SSJ/core attack ↓ rescue an intact but occupied Namek.
- **N26:** Krillin pulls Piccolo clear ↓ return attack misses ↓ both survive ↓ Goku lacks the usual trigger ↓ escape under final-form pursuit.
- **C03:** Trunks speaks within Vegeta's hearing ↓ secret breaks ↓ training becomes personal ↓ father accepts a tactical lesson ↓ coordinated android interception.
- **C07:** a door remains open a second longer ↓ Gero is caught ↓ android activation is delayed ↓ Cell becomes the independent threat ↓ laboratory-to-city hunt.
- **C15:** Trunks blocks his father's first step ↓ 18 gains distance ↓ perfection is denied ↓ Cell hunts escape routes ↓ incomplete-Cell team finish.
- **C19:** a bean stays in a hand ↓ Cell is not restored ↓ pressure can matter ↓ Cell targets spectators for recovery time ↓ protection-versus-finish climax.
- **C20:** 16 is moved one body-length ↓ crushing blow misses ↓ his plea comes from a living protector ↓ Gohan acts deliberately ↓ controlled SSJ2 confrontation.
- **C24:** a ki anchor stays steady ↓ return jump may be possible ↓ Goku survives at a cost ↓ father and son share the burden ↓ joint returned-Cell battle.
- **B02:** Videl practices one extra recovery ↓ survives the ring edge ↓ Spopovich overcommits ↓ legal upset ↓ uninjured Videl can intervene in the theft.
- **B05:** canister knocked loose ↓ energy delivery delayed ↓ accomplice must be followed ↓ ship receives less fuel ↓ seal-defense finale.
- **B11:** Vegeta does not answer the offer ↓ mark absent ↓ duel denied ↓ wizard reroutes stored power ↓ channel-disabling battle.
- **B17:** a shot strikes stone instead ↓ companion lives ↓ rage has another outlet ↓ split averted locally ↓ Good Buu protects the attacker from retaliation.
- **B20:** Gotenks stops transforming ↓ more tactical time under an approved rule ↓ fragments can be watched ↓ absorption denied ↓ safe de-fusion rescue.
- **B26:** the earring is caught ↓ a new fusion exists ↓ Buu cannot use the same trap ↓ captives dictate precision ↓ unfamiliar fusion's rescue finish.
- **B28:** fusion ends seconds earlier ↓ two bodies carry two burdens ↓ one exit seals ↓ rescue routes split ↓ coordinated escape without Vegito.
- **B31:** Planet Burst is diverted once ↓ evacuation minute earned ↓ transport capacity matters ↓ someone must hold the final lane ↓ off-world last stand with different survivors.
- **F09:** a hand reaches the boundary ↓ Krillin is caught ↓ rescuer becomes vulnerable ↓ pair rotates roles ↓ different late-round team.
- **X12:** one rescue succeeds at every invasion phase ↓ four humans survive ↓ support training replaces memorials ↓ rivals practice together ↓ quiet secret team rematch.

## Playable What-Ifs

The 156 scenario cards are the primary playable-mission library: each has title, divergence, player, opponent, location, objective, special mechanic, cinematic, ending, unlock proposal and scope. The following encounter patterns make selection easier.

| Play pattern | Strongly different player task | Example IDs |
|---|---|---|
| Rescue under boss pressure | Reach and extract a vulnerable body instead of depleting the boss | S12, N22, C20, B07 |
| Nonlethal rival obstruction | Deny access to another target while surviving a stronger rival | C15, S04, B04 |
| Different body | Learn altered reach/health/abilities while pursuing identity restoration | N16–N19, X04 |
| Resource relay | Pass dangerous energy or a fragile item under attack | S22, B05, X11 |
| Evasion as victory | Survive extraction without pretending the weaker hero can kill the tyrant | S25, N15, N32, C26 |
| Civilian-first victory | Limit destructive power while securing routes | N25, C09, B01, B16, F03 |
| Counter a villain habit | Punish breathing, repairs, overload restraint or showboating | N11/N12, C06, B09 |
| Rule-based upset | Ring-out defeats an opponent who cannot be beaten by damage | B02, B03, F06, F09 |
| Form timing | Spend power only when needed, then manage vulnerable handoffs | S09, N28, B14/B20 |
| Failure becomes content | A failed fusion creates a different rescue problem | B18, X09 |
| Interior/exterior linkage | Free a captive to remove a boss technique | B23, B30, B35 |
| Quiet playable aftermath | Win friendly support drills among characters who would have died | X12 |

## What-Ifs With Alternate Bosses

| Boss change | Why this fight exists and how it differs | IDs |
|---|---|---|
| Earlier form instead of expected climax | Deny escape/absorption; incomplete Cell remains lethal through pursuit and regeneration | C12–C16 |
| Familiar ally obstructing an objective | Trunks cannot simply kill Vegeta; victory means time for 18 | C15 |
| Normally defeated villain survives | Cui/Zarbon/Cold use access, transports and betrayal rather than a generic rematch | N01/N05, C02 |
| Two-character boss team | Frieza/Cold split defenders; 19/Gero repair; Jeice/Burter relay | C01/C06, N13 |
| Stolen hero body | Recognizable silhouette with wrong voice, incomplete mastery and swap threat | N16/N17 |
| Monster form retained | Zarbon no longer offers the familiar reversion opening | N06 |
| Earlier planetary threat | Frieza attacks escape capacity; core is the objective | N29 |
| Changed tactics from absorption | Buu with Piccolo prioritizes traps; with Gohan applies precision pressure | B23/B35 |
| Weaker fusion as player | Boss dismisses the player, enabling rescues but remaining overwhelmingly dangerous | B18/X09 |
| Alternate fusion as boss | Deliberately separate sandbox tests combined resources and a full new identity | X06 |
| Rival refuses transformation | Low-resource Vegeta duel replaces giant mechanics | S27 |
| Boss uses terrain/people | Cell hunts districts; Frieza attacks transports; protecting targets forces movement | C27/F03 |
| Deity/time specialist | Meet a survival/ring-position objective rather than imply a crude power win | F01/F06 |

“Stronger boss” should mean new pressure, counters, targets or phase rules. A tenfold health bar alone is not a scenario.

## What-Ifs That Change Character Relationships

| Relationship | Change expressed through play | Candidates |
|---|---|---|
| Goku / Vegeta | Carry the injured rival, fight without the moon, refuse the mark together, rescue without fusion | N22, S27, B11/B27 |
| Goku / Piccolo | Living Goku must accept joint training; Piccolo's custody agenda creates a nonlethal rescue | S06/S04 |
| Goku / Gohan | New teacher path; Goku supports instead of feeding Cell; father survives to share final pressure | S18, C19/C24 |
| Vegeta / Gohan | Injured prince's covering shot helps the child; alternate occupation makes the child resist him | N22, S25 |
| Piccolo / Gohan | Surviving mentor continues defense; controlled ape lesson; different chamber education | S15/S10, C17 |
| Goku / Krillin | Rescue prevents the familiar rage trigger; altered bomb relay makes Krillin a decisive participant | N26, S22 |
| Gohan / Videl | Public accountability, learned aerial defense, direct intervention after witnessing theft | B01/B02/B05 |
| Goten / Trunks | Different champion changes boasting; failed fusion requires separate cooperation; extended fusion tests boundaries | B03/B18/B21 |
| Vegeta / Bulma | Public Trunks revelation gives a reason for joint preparation; occupied-Earth or Cell-loss routes require protecting her technical work, not treating her as an item | C03, S25/C26 |
| Heroes / former enemies | Rescue under a shared threat earns narrow trust without erasing past violence | S16/S28, N05, C08/C12, B10/F10 |

## Replayability

Every performance-dependent ending below is a proposal, not an existing save capability. Meaningful outcomes need explicit records and checkpoint-safe conditions.

| Replay lever | Example | Fairness / consequence |
|---|---|---|
| Different survivor | S12 or N22 rescue achieved/failed | Announce rescue objective; failure can be a separate authored ending, not hidden canon damage |
| Different objective | C15 protect 18 versus merely defeat Vegeta | End only when the correct objective is satisfied |
| Optional rescue | P02 extra pod; N25 villagers | Track actual saved identities/counts without promising a full simulation |
| Time limit | S07 earlier arrival; B31 evacuation minute | Timer tied to a causal event; no arbitrary invisible time threshold |
| No-death route | X12 | Must represent saved characters in every required mission, not a high score that ignores deaths |
| Form restraint | B20 lower-form tactics; S09 Kaioken pulses | Distinct boss behavior/reward, not grind |
| Special finishing condition | N11 breath punish; C23 continuous regeneration denial | Clear tell, accessible input, retry from nearby checkpoint |
| Environmental route | S19 moon interception; N29 pod lanes | Preserve resulting stage state through retry |
| Resource conservation | C19 conserved bean; C06 no feeding absorber | Recorded resources, no refill by scene skip |
| Secret battle | X01/X02/X03 | Hint in visible behavior/records; secret remains optional |
| Ally use | S14 support rotation; N12 team stagger | Avoid requiring perfect unreliable AI; provide readable windows |
| Body restoration variants | N16/N17 | Different ending records, no accidental identity overwrite |
| Fusion failure variant | B18/X09 | Enter intentionally for replay; comic failure remains playable |
| Different rescuer | B07 statue rescue; B28 split captive carries | Ending acknowledges rescuer and burden |
| Villain-perspective opener | S25/N32/C26/B35 | Clear “alternate premise” presentation, not punishment for failing canon |
| Restraint challenge | B01/B16 | Civilians are protected by movement/position, not only by avoiding all attacks |
| Transport capacity | N31/F07 | Disclose capacity and available follow-up routes before commitment |
| Tactical trust | N05/F10 | Betrayal tells can be learned; no random morality dice |
| Tournament legality | B02/B03/F09 | Same rule boundaries for player, ally and enemy |
| Quiet completion | X12 | Meaningful survivor-specific scene, not a generic reward popup |

## Secret / Experimental What-Ifs

X01–X12 are explicitly indexed. N19, N23, B21, B26 and F12 also carry unresolved/experimental premises in their cards. Their inclusion preserves creative possibilities; it does not authorize their rules.

For a menu secret, X04 could be revealed by replaying the frog ending and noticing a moving pond ripple on a **future** records/scene viewer. That discovery method is optional and unimplemented; no new menu feature is assumed. X08 could hint at restraint through an unused complete-set icon in a future Dragon Ball Hunt. These are discovery wrappers for existing indexed ideas, not extra scenarios.

A secret should be memorable because the player plays something surprising—a frog-sized escape, an awkward fusion rescue, or a survivor reunion—not because the condition requires hundreds of arbitrary repetitions.

## Questions for Claude

1. Should selected What-Ifs remain independent mission cards, or should a later milestone introduce a distinct multi-mission route selector?
2. Which current mission phase is authoritative when metadata blurbs and newly staged scenes disagree, especially Vegeta's Namek death?
3. What is the intended Namek wish ledger and adaptation policy? The compressed aftermath dialogue cannot safely serve as the full resurrection/transport specification.
4. Is Kami/Piccolo/chamber continuity already specified elsewhere beyond the inspected mission excerpts, or must it be authored before those branches?
5. Should a canon-clear gate unlock all local alternate premises, or should some require an alternate predecessor clear?
6. How should different endings be recorded when the current save retains only a best mission result?
7. Which route-local forms may grant Free Battle access, and which must remain scenario-only?
8. How should Ginyu mind/body identity interact with techniques, injuries, model/voice, AI and persistent records?
9. What are the authoritative fusion timing/defusion rules for the Buu adaptation? Which experimental identities, if any, deserve an explicit spec exception?
10. How should a “rejoin” preserve small changes such as a different junior champion without overwriting canonical progression?
11. What is the canonical state of Trunks at the exact start of a Cell-victory route? If dead, C26 must use another survivor or declare a preceding divergence.
12. Which later-Buu ideas should wait until their canon systems are implemented and human-tested?
13. Is Android 15 acceptable only in an eventual Movies/Specials category, or entirely outside project scope?
14. Which secret conditions should be hinted visually, and should every secret be directly replayable once discovered?
15. Should optional What-If completion be shown separately from canonical completion if the library expands substantially?
16. Which casualty-heavy scenarios fit the intended tone, and where should the endpoint be escape or containment rather than total defeat?
17. Should the prior ASTRA_REVIEW lifecycle findings be addressed before persistent route state is considered? This document requests no fixes.

## Future Implementation Candidates

These are **selection bins**, not rankings or authorizations.

- **SMALL:** S11, N11, B03, X01. Each can be a bounded alternative outcome with familiar play rules; no persistent campaign graph is necessary.
- **MEDIUM:** S01/S02/S09/S12/S13/S14/S17/S19–S22/S27; N01/N02/N06/N12/N19/N24/N30; C02/C06/C10/C11/C14/C19/C21/C23; B01–B04/B09; selected secret challenges. Check individual card scope; lists describe possible slices and do not downgrade unbuilt prerequisites.
- **LARGE:** joint-training routes, survivor continuations, Namek rescues/body exchanges, android alliances, prevention of perfection, altered ritual/fusion missions. Select an endpoint before splitting into missions.
- **MAJOR:** occupied Earth, lasting stolen body, Frieza/Cell victories, missing-Earth ending, cross-era experimental fusions and future timeline evacuation. Preserve as long-term options until foundations and canon are stable.
- **EXPERIMENTAL/SECRET:** tags can apply at any scope. They should not be disguised as implemented features or elevated to canon because a prototype is entertaining.

Recommended review workflow: select a small *set* by desired gameplay variety; choose exact starting states; resolve card blockers; approve a route synopsis; only then commission implementation separately. There is no “build all 156” recommendation.

## Explicitly Deferred Ideas

Retained but not silently solved: a century-spanning Bardock reunion; permanent Goku/Ginyu identity transfer; restored entire Saiyan civilization through one unverified wish; arbitrary new Super Saiyan humans; early Beast/Orange forms; unexplained immortal villains; arbitrary Potara compatibility; full occupied-Earth society simulation; movie androids inserted into canon; and a graph combining every card into one combinatorial campaign.

The broad library satisfies the idea-generation request without assuming every idea is viable. Experimental cards explicitly record their blockers. Later Buu/Super foundations, new characters, stages and fusion identities require future decisions; nothing is implemented or scheduled here.
## Final Huge Idea Index

156 proposed concepts. Existing `whatif_raditz` and `whatif_piccolo` are audited above and are **not** counted as new ideas.

**Index legend:** New Gameplay / New Cinematic = Y means new authored content is proposed, not implemented. New Boss: V = altered encounter using an established opponent; N = unbuilt/new identity or planned-era boss content; — = no dedicated boss required. New Form: N = unbuilt/planned form or new identity involved; T = timing/availability/control changes to a form; — = none required. New Stage: N = new/planned environment needed; V = existing location with new encounter/stage-state work. Alternate Ending: Y = local alternate endpoint, not necessarily an entire replacement saga. R = reward contract above. Reuse labels refer to actual generic machinery; “future foundation” is not existing support.

| ID | Title | Saga | Divergence | Player character | Main opponent | Type | Scope | New gameplay? | New cinematic? | New boss? | New form? | New stage? | Alternate ending? | Reusable systems | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P01 | Bardock Breaks the Blockade | Prologue / original DB (partly planned) | prologue_final_stand | Bardock | Frieza's blockade | survival | MAJOR | Y | Y | N | — | N | Y | phases / flight / waves | L-P; see continuity delta; R |
| P02 | One More Pod | Prologue / original DB (partly planned) | prologue_final_stand | Bardock / rescued soldier | Frieza troops | rescue | LARGE | Y | Y | N | — | V | Y | phases / flight / waves | L-P; see continuity delta; R |
| P03 | The Scouter That Would Not Die | Prologue / original DB (partly planned) | prologue_ending | Bardock | communications squad | information | MEDIUM | Y | Y | — | — | V | Y | phases / flight / waves | L-P; see continuity delta; R |
| P04 | The First Wish Is Stolen | Prologue / original DB (partly planned) | planned original DB hunt | Kid Goku / Bulma | wish thieves | wish | LARGE | Y | Y | N | — | N | Y | phases / flight / waves | L-P; see continuity delta; R |
| P05 | Krillin Learns the Wave First | Prologue / original DB (partly planned) | planned Roshi training | Krillin / Kid Goku | training rivals | training | LARGE | Y | Y | V | — | N | Y | phases / flight / waves | L-P; see continuity delta; R |
| P06 | Tien Breaks the Orders | Prologue / original DB (partly planned) | planned original tournament | Tien / Yamcha | hostile school rivals | rivalry | LARGE | Y | Y | N | — | N | Y | phases / flight / waves | L-P; see continuity delta; R |
| P07 | Krillin Walks Out Alive | Prologue / original DB (partly planned) | planned Tambourine attack | Krillin / Kid Goku | Tambourine | rescue | LARGE | Y | Y | N | — | N | Y | phases / flight / waves | L-P; see continuity delta; R |
| P08 | Piccolo Takes the Ring | Prologue / original DB (partly planned) | planned Piccolo Jr. final | Piccolo Jr. / Goku | Goku / resisting martial artists | villain victory | MAJOR | Y | Y | N | — | N | Y | phases / flight / waves | L-P; premise/rules need decision; R |
| S01 | Don't Let Go | Saiyan | saiyan_brothers tail | Goku / Piccolo | Raditz | counterfactual victory | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S02 | The First Cannon Hits | Saiyan | saiyan_brothers onslaught | Goku / Piccolo | Raditz | early victory | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S03 | The Child Leaves Earth | Saiyan | saiyan_brothers | Raditz / Gohan / Piccolo | Earth defenders / Saiyan jailers | villain victory | MAJOR | Y | Y | V | — | N | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S04 | Piccolo Takes His Shot | Saiyan | saiyan_brothers hold | Piccolo / Krillin | Raditz / Piccolo | rivalry | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S05 | A Silent Scouter | Saiyan | saiyan_brothers | Goku / Piccolo | Raditz / later scouts | information | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S06 | A Year Without King Kai | Saiyan | whatif_raditz aftermath | Goku / Piccolo / Gohan | training partners / Nappa / Vegeta | existing-route extension | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S07 | One Hour Earlier | Saiyan | saiyan_snakeway / saiyan_nappa | Goku | Nappa / Saibamen | arrival | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S2; see continuity delta; R |
| S08 | One Hour Too Late | Saiyan | saiyan_nappa | Krillin / Gohan / Yajirobe | Nappa / Vegeta | arrival | LARGE | Y | Y | V | — | N | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S09 | The Red Aura Costs Too Much | Saiyan | saiyan_kingkai | Goku | training hazards / Vegeta | training | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S2; see continuity delta; R |
| S10 | The Moon Is a Lesson | Saiyan | saiyan_survival moon | Piccolo / Great Ape Gohan | rampaging instincts / Vegeta | giant / training | LARGE | Y | Y | V | T | V | Y | party / bosses / clashes / giants | L-S2; premise/rules need decision; R |
| S11 | Yamcha Sees the Latch | Saiyan | saiyan_saibamen yamcha | Yamcha | Saibamen | survivor | SMALL | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S12 | Krillin Takes the Long Way | Saiyan | saiyan_saibamen pack | Krillin / Yamcha | Saibamen | rescue | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S13 | Chiaotzu Comes Back | Saiyan | saiyan_nappa holdLine | Chiaotzu / Tien | Nappa | sacrifice refused | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S14 | Three Eyes, One Opening | Saiyan | saiyan_nappa holdLine | Tien / Piccolo / Krillin | Nappa | teamwork | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S15 | The Guardian Stays | Saiyan | whatif_piccolo aftermath | Piccolo / Gohan / Goku | Vegeta | existing-route extension | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S16 | Nappa Hears the Order | Saiyan | saiyan_nappa finale | Nappa / Gohan | Vegeta | villain alliance | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S17 | Nappa Waits for No One | Saiyan | saiyan_nappa holdLine | Piccolo / Krillin | Nappa with Saibamen | boss variation | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S3; see continuity delta; R |
| S18 | Gohan Chooses His Father | Saiyan | post-Raditz alternate Goku-survival premise | Gohan / Goku / Piccolo | training partners / Nappa | training / rivalry | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| S19 | The False Moon Shatters | Saiyan | saiyan_vegeta transform | Krillin / Goku | Vegeta | giant counter | MEDIUM | Y | Y | V | T | V | Y | party / bosses / clashes / giants | L-S4; premise/rules need decision; R |
| S20 | Yajirobe Misses | Saiyan | saiyan_vegeta greatApe | Krillin / Gohan | Great Ape Vegeta | rescue / giant | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S21 | Gohan Holds the Tail | Saiyan | saiyan_vegeta gohanApe | Great Ape Gohan / Krillin | Vegeta | giant / sacrifice | MEDIUM | Y | Y | V | T | V | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S22 | The Bomb Changes Hands Twice | Saiyan | saiyan_vegeta desperate | Krillin / Gohan | Vegeta | technique | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S23 | The Prince Does Not Leave | Saiyan | saiyan_vegeta retreat | Krillin / Gohan | Vegeta / later Frieza scouts | mercy refused | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S24 | Goku Cannot Board the Ship | Saiyan | post-saiyan_vegeta injuries | Gohan / Krillin / Piccolo later | Ginyu Force | injury | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S25 | Earth Under the Prince | Saiyan | saiyan_vegeta final | Vegeta / Krillin / Gohan | surviving defenders / Saiyan occupiers | villain victory | MAJOR | Y | Y | N | — | N | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S26 | The Wish Comes Late | Saiyan | saiyan_kingkai wish | Gohan / Piccolo / Goku | Nappa / return-route hazards | wish / delay | MEDIUM | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S2; see continuity delta; R |
| S27 | Vegeta Refuses the Moon | Saiyan | saiyan_vegeta after clash | Vegeta / Goku | Goku / Vegeta | rivalry | MEDIUM | Y | Y | V | T | V | Y | party / bosses / clashes / giants | L-S4; see continuity delta; R |
| S28 | Raditz Returns for the Wrong Reason | Saiyan | whatif_raditz proposed continuation | Raditz / Piccolo | Nappa / Vegeta | unexpected cooperation | LARGE | Y | Y | V | — | V | Y | party / bosses / clashes / giants | L-S1; see continuity delta; R |
| N01 | Cui's Last Bargain | Namek / Frieza | namek_vegeta cui | Vegeta / Cui | Frieza patrol | villain alliance | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N02 | Dodoria Loses the Trail | Namek / Frieza | namek_hunted | Krillin / Gohan | Dodoria | rescue | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N03 | Dodoria Keeps One Secret | Namek / Frieza | namek_vegeta dodoria | Vegeta / Krillin | Dodoria / Frieza enforcers | information / betrayal | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N04 | Zarbon Finishes the Job | Namek / Frieza | namek_zarbon aftermath | Krillin / Gohan | Zarbon | villain strategy | LARGE | Y | Y | V | — | N | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N05 | The Beautiful Traitor | Namek / Frieza | namek_rematch beg | Vegeta / Zarbon | Frieza retrieval squad / Ginyu | villain alliance | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N06 | Zarbon Won't Show His Face | Namek / Frieza | namek_rematch | Vegeta | monster Zarbon | boss variation | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N07 | Guru's Door Holds | Namek / Frieza | namek_guru patrol | Nail / Krillin | elite patrol | guardian rescue | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N08 | The Last Ball Moves | Namek / Frieza | Namek Dragon Ball race | Gohan / Krillin / Vegeta | Frieza patrols / each other | wish race | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N09 | The Emperor Reaches Porunga | Namek / Frieza | proposed pre-final Namek summoning | Dende / Nail / Krillin | Frieza | wish / villain | MAJOR | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; see continuity delta; R |
| N10 | Dende Says No | Namek / Frieza | proposed Vegeta wish demand | Dende / Gohan / Krillin | Vegeta / approaching Frieza | wish refusal | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N1; premise/rules need decision; R |
| N11 | Guldo Must Breathe | Namek / Frieza | namek_guldo | Krillin / Gohan | Guldo | boss counter | SMALL | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N12 | Recoome Falls Before the Pod | Namek / Frieza | namek_recoome | Vegeta / Krillin / Gohan | Recoome | upset victory | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N13 | The Force Regroups | Namek / Frieza | namek_ginyu_pair flight | Jeice / Burter / Ginyu | Goku / Vegeta | villain team | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N14 | Goku Lands Before Recoome | Namek / Frieza | namek_recoome opening | Goku / Vegeta | Recoome / Jeice and Burter | arrival | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N15 | No Pod in the Sky | Namek / Frieza | namek_recoome arrival | Gohan / Krillin / Vegeta | Ginyu Force / Frieza | arrival / survival | MAJOR | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N16 | The Captain Keeps Goku | Namek / Frieza | namek_ginyu retake | Goku in Ginyu / Krillin / Vegeta | Ginyu in Goku / Frieza | body change | MAJOR | Y | Y | V | — | N | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N17 | Vegeta Catches the Beam | Namek / Frieza | namek_ginyu retake | Vegeta in Ginyu / Goku | Ginyu in Vegeta | body change | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; see continuity delta; R |
| N18 | Ginyu Aims Higher | Namek / Frieza | namek_ginyu alternate aftermath | Ginyu / Goku in borrowed body | Frieza / loyal Force remnants | villain alliance | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; premise/rules need decision; R |
| N19 | The Frog Gets Away | Namek / Frieza | namek_frog lastTry | Goku / Vegeta | Ginyu's last swap | SECRET / body change | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N2; premise/rules need decision; R |
| N20 | Nail Stands Beside Piccolo | Namek / Frieza | namek_nail fusion | Nail / Piccolo | Frieza second form | fusion refused | LARGE | Y | Y | V | T | V | Y | party / bosses / Namek patterns | L-N3; see continuity delta; R |
| N21 | Two Guardians, One Delay | Namek / Frieza | proposed earlier Nail/Piccolo meeting | Piccolo fused with Nail | Frieza / Ginyu stragglers | fusion earlier | LARGE | Y | Y | V | T | V | Y | party / bosses / Namek patterns | L-N3; see continuity delta; R |
| N22 | The Prince Takes One More Breath | Namek / Frieza | namek_vegeta_end beam | Goku / Piccolo / Vegeta | final-form Frieza | rescue | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N3; see continuity delta; R |
| N23 | The Prince Turns Gold | Namek / Frieza | namek_vegeta_end alternate survival | Vegeta / Goku | Frieza | transformation / EXPERIMENTAL | LARGE | Y | Y | V | T | V | Y | party / bosses / Namek patterns | L-N3; premise/rules need decision; R |
| N24 | Twenty Is Not Enough Time | Namek / Frieza | namek_kaioken20 | Goku / Piccolo | Frieza | technique cost | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N4; see continuity delta; R |
| N25 | The Spirit Bomb Works | Namek / Frieza | namek_spirit_bomb impact | Piccolo / Goku / Krillin | Frieza / surviving occupiers | victory / aftermath | LARGE | Y | Y | N | T | V | Y | party / bosses / Namek patterns | L-N4; see continuity delta; R |
| N26 | Krillin Pulls Piccolo Clear | Namek / Frieza | namek_spirit_bomb sacrifice | Krillin / Goku | Frieza | sacrifice / transformation | LARGE | Y | Y | V | T | V | Y | party / bosses / Namek patterns | L-N4; see continuity delta; R |
| N27 | Goku Is the One Who Falls | Namek / Frieza | namek_spirit_bomb return | Gohan / Piccolo / Krillin | Frieza | loss / changed survivor | MAJOR | Y | Y | V | T | V | Y | party / bosses / Namek patterns | L-N4; see continuity delta; R |
| N28 | Golden for a Moment | Namek / Frieza | namek_super_saiyan awaken | Goku / Gohan | Frieza | transformation delayed | LARGE | Y | Y | V | T | V | Y | party / bosses / Namek patterns | L-N5; see continuity delta; R |
| N29 | Frieza Breaks Namek Early | Namek / Frieza | namek_frieza2 final reveal | Piccolo / Gohan / Vegeta | Frieza / collapsing terrain | villain strategy | LARGE | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N5; see continuity delta; R |
| N30 | No One Leaves Alone | Namek / Frieza | namek_end escape | Goku | Frieza / eruption hazards | escape / relationship | MEDIUM | Y | Y | V | — | V | Y | party / bosses / Namek patterns | L-N5; see continuity delta; R |
| N31 | The Last Wish Is a Corridor | Namek / Frieza | namek_aftermath wishes proposed alternative | Dende / Gohan / Goku | Frieza's remnants / hazards | wish / order | LARGE | Y | Y | V | — | N | Y | party / bosses / Namek patterns | L-N5; premise/rules need decision; R |
| N32 | The Emperor Inherits Ash | Namek / Frieza | namek_end final duel | Frieza / Gohan / Piccolo | Goku / Frieza occupation force | villain victory | MAJOR | Y | Y | V | — | N | Y | party / bosses / Namek patterns | L-N5; see continuity delta; R |
| C01 | Trunks Misses the Landing | Android / Cell | android_trunks | Piccolo / Vegeta / Goku | Mecha Frieza / King Cold | arrival | LARGE | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C1; see continuity delta; R |
| C02 | Cold Leaves His Son | Android / Cell | android_trunks cold | Future Trunks | King Cold / escort | villain escape | MEDIUM | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C1; see continuity delta; R |
| C03 | Trunks Tells Everyone | Android / Cell | android_warning truth | Future Trunks / Vegeta | training rivals / Android 19 | information | LARGE | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C1; see continuity delta; R |
| C04 | The Medicine Is Ready | Android / Cell | android_nineteen virus | Goku / Vegeta | Androids 19 and 20 | illness | LARGE | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C05 | The Future Arrives Anyway | Android / Cell | android_fever | Piccolo / Vegeta / Trunks | Androids / Cell | loss | MAJOR | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C06 | Nineteen Learns Restraint | Android / Cell | android_nineteen | Vegeta | Android 19 with Gero support | boss counter | MEDIUM | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C07 | Trunks Beats the Door | Android / Cell | android_lab chase | Future Trunks / Krillin | Gero / laboratory defenses | pursuit | LARGE | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C08 | Seventeen Opens the Door | Android / Cell | android_lab wake | Android 17 / Future Trunks | Gero's defenses / Cell | android alliance | LARGE | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C09 | Sixteen Chooses the Town | Android / Cell | planned android/Cell civilian hunt | Android 16 / Piccolo | Imperfect Cell | rescue | LARGE | Y | Y | N | — | N | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C10 | Eighteen Accepts the Rematch | Android / Cell | android_road turn | Vegeta / Android 18 | Android 18 / Vegeta | rivalry | MEDIUM | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C2; see continuity delta; R |
| C11 | Piccolo Keeps His Eyes Closed | Android / Cell | cell_first escapes | Piccolo | Imperfect Cell | escape denied | MEDIUM | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C12 | Seventeen Steps Back | Android / Cell | cell_semi hold | Piccolo / Android 17 | Imperfect Cell | rescue / alliance | LARGE | Y | Y | V | T | V | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C13 | Tien Buys an Exit | Android / Cell | cell_semi tien | Tien / Krillin / Android 18 | Semi-Perfect Cell | sacrifice avoided | LARGE | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C14 | Vegeta Finishes It | Android / Cell | cell_perfect semi | Vegeta | Semi-Perfect Cell | decision | MEDIUM | Y | Y | V | T | V | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C15 | Trunks Stops His Father | Android / Cell | cell_perfect let | Future Trunks / Android 18 | Vegeta / Semi-Perfect Cell | rival turned boss | LARGE | Y | Y | V | T | V | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C16 | Eighteen Runs Toward Cell | Android / Cell | cell_perfect before absorption | Android 18 / Krillin | Semi-Perfect Cell | android agency | LARGE | Y | Y | V | T | V | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C17 | A Different Year Inside | Android / Cell | planned Hyperbolic Time Chamber | Gohan / Piccolo | training constructs / Cell Juniors | training | LARGE | Y | Y | V | T | N | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C18 | Vegeta Trains the Son He Has | Android / Cell | planned chamber before cell_perfect | Vegeta / Future Trunks | each other / Perfect Cell variant | training / rivalry | LARGE | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C19 | No Senzu for Cell | Android / Cell | cell_games forfeit | Gohan / Goku | tired Perfect Cell | decision / resource | MEDIUM | Y | Y | V | T | V | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C20 | Sixteen Speaks Standing | Android / Cell | cell_games sixteen | Gohan / Android 16 | Cell / Juniors | survivor / transformation | LARGE | Y | Y | N | T | V | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C21 | Anger Before the Games | Android / Cell | planned pre-Games training | Gohan / Goku | training partner / Perfect Cell | transformation earlier | MEDIUM | Y | Y | V | T | N | Y | regen / absorbers / scenes | L-C3; see continuity delta; R |
| C22 | The Gold Never Sparks | Android / Cell | cell_games ascend | Gohan / Piccolo / Vegeta | Perfect Cell / Juniors | transformation delayed | LARGE | Y | Y | V | T | V | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C23 | Leave Nothing to Grow Back | Android / Cell | cell_games regrow | Goku / Piccolo | Perfect Cell | regeneration counter | MEDIUM | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C24 | One Jump Back | Android / Cell | cell_games sacrifice | Goku / Gohan | self-destructing Cell / returned Cell | sacrifice alternative | LARGE | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C4; premise/rules need decision; R |
| C25 | Trunks Takes the Last Beam | Android / Cell | cell_games returns | Future Trunks / Gohan | returned Cell | protective reversal | LARGE | Y | Y | V | — | V | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C26 | Cell Wins the Broadcast | Android / Cell | cell_games beam | Cell / Piccolo / Trunks | Gohan / Cell and Juniors | villain victory | MAJOR | Y | Y | V | T | N | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C27 | Cell Refuses the Challenge | Android / Cell | before cell_games | Piccolo / Trunks / Gohan | Perfect Cell | villain strategy | LARGE | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| C28 | Trunks Brings Back More Than Power | Android / Cell | post-Cell proposed future return | Future Trunks / Future survivors | future Androids / future Cell threat | future timeline | LARGE | Y | Y | V | — | N | Y | regen / absorbers / scenes | L-C4; see continuity delta; R |
| B01 | Gohan Keeps the Helmet Off | Buu (later half planned) | buu_years robbery | Adult Gohan / Videl | robbers / copycat criminals | identity / relationship | MEDIUM | Y | Y | — | — | V | Y | tournament / pursuit; future foundation | L-B1; see continuity delta; R |
| B02 | Videl Learns to Fall | Buu (later half planned) | buu_flight | Videl / Gohan | training partner / Spopovich | training | MEDIUM | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B1; see continuity delta; R |
| B03 | Goten Wins the Final | Buu (later half planned) | buu_junior final | Goten | Kid Trunks / Mr. Satan | tournament | SMALL | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B1; see continuity delta; R |
| B04 | Piccolo Tests Shin | Buu (later half planned) | buu_spopovich opening | Piccolo | Shin | tournament / knowledge | MEDIUM | Y | Y | N | — | V | Y | tournament / pursuit; future foundation | L-B1; see continuity delta; R |
| B05 | The Energy Never Leaves the Ring | Buu (later half planned) | buu_kibito ambush | Videl / Krillin / Gohan | Spopovich / Yamu | rescue | LARGE | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B1; see continuity delta; R |
| B06 | Yamu Runs the Other Way | Buu (later half planned) | buu_pursuit | Yamu / Gohan | Babidi's minions / Dabura | villain survival | LARGE | Y | Y | V | — | N | Y | tournament / pursuit; future foundation | L-B2; see continuity delta; R |
| B07 | The Stone Does Not Break | Buu (later half planned) | buu_pursuit ship arrival | Gohan / Vegeta | Dabura | rescue / petrification | LARGE | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B2; see continuity delta; R |
| B08 | Piccolo Takes Planet Zoon | Buu (later half planned) | buu_puipui proposed non-petrified party | Piccolo | Pui Pui | different opponent | MEDIUM | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B2; see continuity delta; R |
| B09 | Yakon Saves His Appetite | Buu (later half planned) | buu_yakon | Goku / Vegeta | Yakon | boss strategy | MEDIUM | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B2; see continuity delta; R |
| B10 | The Demon King Breaks His Leash | Buu (later half planned) | buu_dabura recall | Dabura / Gohan | Babidi's magic / minions | villain cooperation | LARGE | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B2; premise/rules need decision; R |
| B11 | Vegeta Says No | Buu (later half planned) | buu_majin offer | Vegeta / Goku / Gohan | Dabura / ship defenses | decision / rivalry | LARGE | Y | Y | V | T | V | Y | tournament / pursuit; future foundation | L-B2; see continuity delta; R |
| B12 | Vegeta Chooses the Stands | Buu (later half planned) | buu_majin price | Vegeta / Goku | Babidi control / escaping minions | sacrifice / relationship | LARGE | Y | Y | V | — | V | Y | tournament / pursuit; future foundation | L-B2; see continuity delta; R |
| B13 | Final Explosion, First Rescue | Buu (later half planned) | planned Vegeta sacrifice | Vegeta / Piccolo | Fat Buu | sacrifice survived | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; premise/rules need decision; R |
| B14 | Three Minutes of SSJ3 | Buu (later half planned) | planned Goku vs Fat Buu | Goku / Piccolo | Fat Buu | transformation timing | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B15 | Buu Keeps the Wizard | Buu (later half planned) | planned Fat Buu/Babidi split | Fat Buu / heroes | Babidi's controlled forces | villain strategy | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; premise/rules need decision; R |
| B16 | Mr. Satan Reaches Him First | Buu (later half planned) | planned Fat Buu destruction | Mr. Satan / Good Buu | armed provocateurs / hazards | relationship / rescue | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B17 | The Shot Misses | Buu (later half planned) | planned Evil Buu trigger | Mr. Satan / Good Buu | attackers / collapsing terrain | rescue / split avoided | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B18 | Thirty Minutes Without Gotenks | Buu (later half planned) | planned fusion training | Goten / Kid Trunks / failed fusion | Super Buu | fusion failed | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B19 | The Children Finish the Lesson | Buu (later half planned) | planned Gotenks training | Gotenks | Fat Buu / approaching hazards | fusion earlier | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B20 | Gotenks Stays Small | Buu (later half planned) | planned Gotenks vs Super Buu | Gotenks | Super Buu | fusion resource | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; premise/rules need decision; R |
| B21 | The Dance Won't End | Buu (later half planned) | planned Gotenks de-fusion | Gotenks / Piccolo | Super Buu / internal instability | fusion duration / EXPERIMENTAL | MAJOR | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; premise/rules need decision; R |
| B22 | The Ghosts Guard Their Maker | Buu (later half planned) | planned Buu absorbs Gotenks | Gotenks / Piccolo | Super Buu | absorption denied | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B23 | Buu Takes the Teacher | Buu (later half planned) | planned Super Buu absorption window | Gohan / Gotenks | Buu with Piccolo-led tactics | alternate absorption | MAJOR | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B24 | Ultimate Arrives One Battle Earlier | Buu (later half planned) | planned Old Kai ritual | Adult Gohan | Super Buu | power timing | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B25 | Gohan Leaves Too Soon | Buu (later half planned) | planned Old Kai ritual | Gohan / Piccolo / children | Super Buu | power delayed | LARGE | Y | Y | N | T | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B26 | Gohan Catches the Earring | Buu (later half planned) | planned Potara crisis | proposed Goku–Gohan fusion | absorbing Buu | Potara alternate / EXPERIMENTAL | MAJOR | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; premise/rules need decision; R |
| B27 | Two Saiyans, No Earrings | Buu (later half planned) | planned Vegito creation | Goku / Vegeta | Buu with absorbed heroes | fusion refused | LARGE | Y | Y | N | T | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B28 | Vegito Loses the Last Second | Buu (later half planned) | planned Vegito/internal rescue | Vegito then Goku / Vegeta | Buu / internal defenses | fusion expires | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B29 | Vegito Refuses to Be Swallowed | Buu (later half planned) | planned Vegito vs Buu | Vegito | Buu with captives | fusion / rescue | LARGE | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B30 | They Free Good Buu First | Buu (later half planned) | planned inside Buu | Goku / Vegeta / Good Buu | internal defenses / changing Buu | rescue order | MAJOR | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B31 | Earth Gets One More Minute | Buu (later half planned) | planned Kid Buu destroys Earth | Goku / Vegeta / Gohan | Kid Buu / planet hazards | planet rescue | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B32 | Vegeta's Minute Becomes Three | Buu (later half planned) | planned Kai-world countdown | Vegeta / Good Buu | Kid Buu | Spirit Bomb / endurance | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B33 | No One Believes the Champion | Buu (later half planned) | planned final Spirit Bomb | Mr. Satan / defenders | panic / Kid Buu | relationship / energy gathering | LARGE | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B34 | The Wish Restores Strength First | Buu (later half planned) | planned final wishes | Goku / Vegeta / Good Buu | Kid Buu | wish order | MAJOR | Y | Y | N | T | N | Y | tournament / pursuit; future foundation | L-B3; premise/rules need decision; R |
| B35 | Buu Eats the Victory | Buu (later half planned) | planned Ultimate Gohan confrontation | Buu / Piccolo / survivors | Gohan / absorbed-form Buu | villain victory | MAJOR | Y | Y | N | N | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| B36 | Good Buu Holds the Last Door | Buu (later half planned) | planned Kid Buu finale | Good Buu / Vegeta / Goku | Kid Buu | alternate ending | MAJOR | Y | Y | N | — | N | Y | tournament / pursuit; future foundation | L-B3; see continuity delta; R |
| F01 | The God Ritual Waits | Super (planned) | planned Battle of Gods | Vegeta / Goku | Beerus | ritual / PLANNED | LARGE | Y | Y | N | N | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F02 | Vegeta Takes the Ritual | Super (planned) | planned Battle of Gods | God Vegeta / Goku | Beerus | transformation / PLANNED | LARGE | Y | Y | N | N | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F03 | Frieza Comes for the Rescue Ships | Super (planned) | planned Resurrection of F | Krillin / Piccolo / Gohan | Frieza army / Golden Frieza | villain strategy / PLANNED | LARGE | Y | Y | N | N | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F04 | Vegeta Finishes His Turn | Super (planned) | planned Golden Frieza finale | Vegeta | Golden Frieza | rivalry / PLANNED | LARGE | Y | Y | N | N | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F05 | Cabba Won't Turn Angry | Super (planned) | planned Universe 6 tournament | Cabba / Vegeta | Vegeta / next tournament opponent | tournament / PLANNED | LARGE | Y | Y | N | N | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F06 | Hit Uses the Whole Ring | Super (planned) | planned Universe 6 Hit battle | Goku / Vegeta | Hit | boss adaptation / PLANNED | LARGE | Y | Y | N | — | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F07 | Trunks Evacuates the Future | Super (planned) | planned Goku Black arc | Future Trunks / Mai | Goku Black / pursuing forces | rescue / PLANNED | MAJOR | Y | Y | N | — | N | Y | generic combat; future foundation | L-F; premise/rules need decision; R |
| F08 | The Seal Holds for a Minute | Super (planned) | planned Zamasu confrontation | Trunks / Goku / Vegeta | Zamasu / Goku Black | containment / PLANNED | MAJOR | Y | Y | N | — | N | Y | generic combat; future foundation | L-F; premise/rules need decision; R |
| F09 | Krillin Stays in the Ring | Super (planned) | planned Tournament of Power | Krillin / Android 18 | opposing tournament pair | team survival / PLANNED | LARGE | Y | Y | N | — | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F10 | Frieza Keeps His Promise | Super (planned) | planned ToP late rounds | Frieza / Gohan | opposing pair / Jiren encounter | villain alliance / PLANNED | LARGE | Y | Y | N | — | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F11 | No Silver at the Finish | Super (planned) | planned Ultra Instinct climax | Goku / Vegeta / Android 17 | Jiren | transformation delayed / PLANNED | MAJOR | Y | Y | N | T | N | Y | generic combat; future foundation | L-F; see continuity delta; R |
| F12 | The Winner Must Stay | Super (planned) | planned ToP final wish | Android 17 / surviving team | post-tournament rescue hazards | wish / PLANNED | MAJOR | Y | Y | N | — | N | Y | generic combat; future foundation | L-F; premise/rules need decision; R |
| X01 | No Beam, No Grave | Secret / experimental | whatif_raditz finalFight variant | Goku | Raditz | SECRET | SMALL | Y | Y | V | — | V | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |
| X02 | Saibaman Number Seven | Secret / experimental | saiyan_saibamen optional challenge | Yamcha / Krillin | camouflaged Saibaman leader | SECRET | MEDIUM | Y | Y | N | — | V | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |
| X03 | The Prince Bows Once | Secret / experimental | whatif_piccolo optional challenge | Piccolo / Gohan | Vegeta nonlethal test | SECRET | MEDIUM | Y | Y | V | — | V | Y | objectives / conditions; stated dependencies | L-X; premise/rules need decision; R |
| X04 | Captain of the Pond | Secret / experimental | namek_frog optional dream challenge | Ginyu in frog | wildlife / patrol boots | SECRET / comedy | MEDIUM | Y | Y | — | — | N | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |
| X05 | The Wrong Pair Mirrors the Dance | Secret / experimental | future fusion-training sandbox | Goku / Piccolo / proposed fusion | training opponent | EXPERIMENTAL / fusion | LARGE | Y | Y | N | N | N | Y | objectives / conditions; stated dependencies | L-X; premise/rules need decision; R |
| X06 | The Emperor Wears the Earrings | Secret / experimental | future non-canon sandbox | Vegito | proposed Frieza–Cell fusion | EXPERIMENTAL / fusion boss | MAJOR | Y | Y | N | N | N | Y | objectives / conditions; stated dependencies | L-X; premise/rules need decision; R |
| X07 | Android Fifteen's Unfinished Delivery | Secret / experimental | Movies/Specials-adjacent proposal | Trunks / proposed Android 15 | rogue android recovery squad | EXPERIMENTAL / movie-adjacent | LARGE | Y | Y | N | — | N | Y | objectives / conditions; stated dependencies | L-X; premise/rules need decision; R |
| X08 | Seven Balls, No Wish | Secret / experimental | future Dragon Ball Hunt | Krillin / Piccolo | thieves / environmental threats | SECRET / wish | MEDIUM | Y | Y | — | — | N | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |
| X09 | Two Left Feet Save the Day | Secret / experimental | planned Gotenks failure variant | failed fusion / children | Super Buu | SECRET / fusion failure | LARGE | Y | Y | N | N | N | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |
| X10 | The Senzu Stays in the Bag | Secret / experimental | cell_games challenge premise | Goku / Gohan | fatigued Cell | SECRET / alternate boss | MEDIUM | Y | Y | V | — | V | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |
| X11 | The Potara Passes Twice | Secret / experimental | planned Buu rescue sandbox | Goku / Vegeta / approved fused identity | Buu | EXPERIMENTAL / fusion | LARGE | Y | Y | V | N | N | Y | objectives / conditions; stated dependencies | L-X; premise/rules need decision; R |
| X12 | The Rematch Nobody Announces | Secret / experimental | post-Saiyan alternate survivors' spar | Yamcha / Tien / Krillin / Chiaotzu | rotating friendly pairs | SECRET / relationship | MEDIUM | Y | Y | — | — | V | Y | objectives / conditions; stated dependencies | L-X; see continuity delta; R |

## File Accounting and Verification

FILES READ:

Direct document review and focused source/excerpt inspection across this continuing story-design pass:

- MASTER_SPEC.md
- HANDOFF.md
- STATUS.md
- README.md
- planning/ASTRA_REVIEW.md
- CLAUDE.md (local instructions; no graph generation/update performed)
- src/data/story.js
- src/data/unlocks.js
- src/core/save.js
- src/game/mission.js
- src/ui/screens_menu.js
- src/data/characters/piccolo.js (focused form/merger checks)
- src/game/mechanics.js (focused mechanics checks)
- src/data/missions/android_fever.js
- src/data/missions/android_lab.js
- src/data/missions/android_nineteen.js
- src/data/missions/android_road.js
- src/data/missions/android_trunks.js
- src/data/missions/android_warning.js
- src/data/missions/buu_flight.js
- src/data/missions/buu_junior.js
- src/data/missions/buu_kibito.js
- src/data/missions/buu_kids.js
- src/data/missions/buu_majin.js
- src/data/missions/buu_pursuit.js
- src/data/missions/buu_saiyaman.js
- src/data/missions/buu_ship.js
- src/data/missions/buu_spopovich.js
- src/data/missions/buu_years.js
- src/data/missions/cell_first.js
- src/data/missions/cell_games.js
- src/data/missions/cell_perfect.js
- src/data/missions/cell_semi.js
- src/data/missions/frieza_cinematics.js
- src/data/missions/namek_aftermath.js
- src/data/missions/namek_end.js
- src/data/missions/namek_frieza1.js
- src/data/missions/namek_frieza2.js
- src/data/missions/namek_frog.js
- src/data/missions/namek_ginyu.js
- src/data/missions/namek_ginyu_pair.js
- src/data/missions/namek_gohan_frieza2.js
- src/data/missions/namek_goku.js
- src/data/missions/namek_guldo.js
- src/data/missions/namek_guru.js
- src/data/missions/namek_hunted.js
- src/data/missions/namek_kaioken20.js
- src/data/missions/namek_nail.js
- src/data/missions/namek_recoome.js
- src/data/missions/namek_rematch.js
- src/data/missions/namek_spirit_bomb.js
- src/data/missions/namek_super_saiyan.js
- src/data/missions/namek_vegeta.js
- src/data/missions/namek_vegeta_end.js
- src/data/missions/namek_zarbon.js
- src/data/missions/prologue_bardock.js
- src/data/missions/prologue_ending.js
- src/data/missions/saiyan_arrival.js
- src/data/missions/saiyan_nappa.js
- src/data/missions/saiyan_raditz.js
- src/data/missions/saiyan_snakeway.js
- src/data/missions/saiyan_training.js
- src/data/missions/saiyan_vegeta.js
- src/data/missions/whatif_piccolo.js
- src/data/scenes/android_arrival.js
- src/data/scenes/android_fever.js
- src/data/scenes/android_lab.js
- src/data/scenes/android_nineteen.js
- src/data/scenes/android_road.js
- src/data/scenes/android_warning.js
- src/data/scenes/buu_babidi.js
- src/data/scenes/buu_era.js
- src/data/scenes/buu_majin.js
- src/data/scenes/buu_tournament.js
- src/data/scenes/cell_absorb.js
- src/data/scenes/cell_first.js
- src/data/scenes/cell_games.js
- src/data/scenes/namek_aftermath.js
- tests/run-tests.js (relevant test definitions)
- tests/sim-tests.js (relevant What-If/checkpoint definitions)
- tests/playtest2-tests.js (relevant casualty/checkpoint definitions)
- tests/headless.js and index.html (load-only registry inspection earlier in the pass)

Whole-file access for filtering/registry loading does not mean every line received a semantic audit. Additional runtime scripts loaded by the existing headless loader were not all directly reviewed in this story pass. Integrity verification reads project files as bytes for hashing; those reads are not claimed as content review. Historical builds were not used as current story authority.

FILES CREATED:
planning/ASTRA_WHAT_IF_BIBLE.md

FILES MODIFIED:
NONE (no pre-existing file changed; this new document is the sole output)

GAMEPLAY CODE MODIFIED:
NO

TESTS MODIFIED:
NO

CANON STORY MODIFIED:
NO

EXISTING WHAT-IFS MODIFIED:
NO

NAMEK IMPLEMENTATION MODIFIED:
NO

MASTER_SPEC MODIFIED:
NO

HANDOFF MODIFIED:
NO

STATUS MODIFIED:
NO

README MODIFIED:
NO

Files intentionally not modified: all pre-existing project files, including src/, tests/, assets/, builds/, existing story/What-If/save data, MASTER_SPEC.md, HANDOFF.md, STATUS.md, README.md and planning/ASTRA_REVIEW.md. Namek implementation was untouched. No dependency installation, external assets, Git/GitHub, uploads or remote connector was used. No scenario was implemented.

