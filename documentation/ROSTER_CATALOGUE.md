# Saiyan Legacy — roster catalogue against the owner's visual reference

Source: the owner's **"dbz visual reference.pdf"** (247 PDF pages, attached 2026-10-14): a character board with one
web image per page and short appearance notes (sections 8–15: Saiyans, Namek and the Frieza Force, Androids and Cell,
the Buu saga, Dragon Ball Super, the movies, GT, supporting cast; then the original Dragon Ball, the remaining Z
movies, the Future timelines and the Gogeta family; pages 92–184 repeat pages 1–91 and are not extra characters). The
images are **references only** — nothing from them is in the game; every model is built locally with the procedural
pipeline.

This file is the master checklist of the continuous roster expansion. Keep it current when a character changes state.

## States

| State | Meaning |
|---|---|
| **Missing** | not in the game at all. Nothing is claimed as built. |
| **Planned** | design written down (look, kit, unlock) but no code yet. |
| **Prototype** | code exists but the fighter is not selectable yet (kit or look incomplete). |
| **Story-only** | a model (sometimes a kit) used by story missions or scenes; deliberately not a Free Battle fighter. |
| **Playable** | selectable in Free Battle / Training: three techniques, own moves, AI, intro / victory / defeat, an unlock rule; validated by the schema, smoke-tested in the player slot (headless) and seen in the model viewer by Claude. All are Level 1 procedural prototypes. |
| **Visual pass required** | playable, but the viewer comparison with the board found something the current rig cannot show yet. |
| **Verified** | the owner has playtested it. **No character is in this state** — only the owner can move one here. |

*(ref p.N)* is the board page the look was compared with.

## Quality levels (the visual polish phase, 2026-10-15 →)

Implementation state (above) and visual / gameplay quality are tracked separately. Every character starts at Level 1;
a character moves up only after its actual model has been inspected in the viewer (front, 3/4, side, back and the
face) and its kit checked in play (headless player-slot run and CPU fights). A schema pass or a roster entry alone
never raises a level.

| Level | Meaning |
|---|---|
| **Level 1 — Prototype** | exists and works at a basic level (every fighter not listed below). |
| **Level 2 — Recognizable** | silhouette, major costume details, colours and the basic character-specific gameplay read as the character and work. |
| **Level 3 — Polished** | model, materials, animation, transformations, signature techniques, AI and integration refined and checked. **No character is at Level 3 yet.** |
| **Verified** | a person has played it and confirmed the behaviour. **No character is Verified** — only the owner can do this. |

### Gameplay audit (2026-10-15)

CPU against CPU (normal) against Goku and Vegeta, two seeds, one minute each (`audit.js` in the session scratchpad: every
strike — chained ones included — every technique started, every hit landed, forms, defensive states). Headless fights
hold both fighters at 1 HP, so "results" are where each one stood after a minute, not wins. **CPU fights are not human
balance.**

| Character | What the audit showed | Changed |
|---|---|---|
| Magetta | Molten Ground (a 100-ki ultimate) started 36 times in four minutes; Magma Spit never | **engine:** the `eruption` and `groundSlam` techniques never paid their ki or started their cooldown when started from a button (19 specials across the roster — Magetta's press, Broly's leap, Zarbon's quake, Frieza's Death Storm, Piccolo Jr.'s and Lord Slug's stomps, Shugesh's crash …) — they now do, like every other technique; boss patterns stay free as before. Magetta's AI now spits at anyone outside his reach or charging. After: Molten Ground 3, Spit 14, Press 11 |
| Tagoma | Playing Dead 18 times (a trick used as an opener, from anywhere) | his AI drops only when hurt (under 60 %) with the target walking in close; cooldown 6 → 12 s. After: 2 |
| Master Roshi | palm strings, turtle palm, lunge, Thunder Shock, both Kamehamehas, Max Power reached every fight | — |
| Cooler | varied strings (13 different strikes), Death Beam, Death Chaser, Supernova, the final form reached; the final form's Supernova Cooler never started in these runs | — |
| Turles | nine different strikes, Kill Driver, Calamity Blaster, the fruit eaten and its form reached, Meteor Burst | — |
| Janemba | slaps, belly flops, rolls, Dimension Door (his signature) the most used technique, spheres, the dimension punch | — |
| Gogeta | fourteen different strikes, Instant Transmission with intent, Stardust Fall, Soul Punisher, Blaster Meteor, Big Bang Kamehameha, Super Saiyan reached (Blue is locked until the film) | — |
| Goku Black | varied strings, Energy Blade, Black Kamehameha, Divine Wrath, Rosé reached every fight; the Rosé ultimate never started in these runs | — |
| Hirudegarn, Omega Shenron, Metal Cooler | every pattern / technique used; they out-last base-form Goku and Vegeta (as the backup did) | — |

### Assessed so far

| Character | Quality | What this pass fixed | Remaining issues | Next improvement |
|---|---|---|---|---|
| Goku (SSJ4) | Level 2 | fur: ink fur strokes over the pelt (new `outfit.fur`), ragged opening at the bare chest, ragged fur under the shoulders, above the elbows and over the wristbands; the tail swung out to the side | (2026-10-15: the fur a magenta-leaning crimson; his own intro — feet wide, fists hanging, staring from under the brow — and victory — one fist thrown up — fixed; he borrowed base Goku's) | — |
| Vegeta (SSJ4) | Level 2 | the same fur; a mane down the back under the upright flame (new hair `vegeta_ssj4`); dark-brown hair; tail to the side | (2026-10-15: the gloves lavender; the pelt's V narrowed, `jacket.open` 1.3 → 0.95; his own intro — leaning back, chin up, fists held off his sides — and victory — a finger levelled at the loser — instead of Vegeta's folded arms — fixed; the board has no picture of him, p.79) | — |
| Gogeta (SSJ4) | Level 2 | crimson mane without the gold glow (new hair `gogeta_ssj4`), fur on the arms, blue wristbands | (2026-10-15: the vest dark teal; the torso a pelt under the vest with the chest and belly bare in a painted V — `outfit.vee` on fur, the fur strokes stop at the V — so the flanks inside the vest show fur, the board p.80 — fixed) | — |
| Hirudegarn | Level 2 | **a giant** (3.3 × scale: the giant camera frames him), wing cases with ribs and glassy wings (new wing style `beetle`), segmented purple limbs (new `outfit.ribs`), olive face with fangs, horns, claws and talons, elbow spurs, chest plates, belly ridges; hit on body parts (the wing cases take 0.6 ×, the head 1.3 ×), slow turn, fights on the ground; **Hell's Stomp, Tail Sweep and Crushing Grip** are the Great Ape's telegraphed giant techniques; his CPU runs them as boss patterns (Rampage / Wrath) | (2026-10-15: the wings move — the membranes shiver at rest and buzz as he moves, the wing cases lift off his back with his speed and settle when he stops, `Model.tick` — fixed) no sealed-halves transformation; in CPU-vs-CPU runs he beats normal-difficulty Goku and Vegeta (not human balance) | balance after the owner plays him |
| Cooler | Level 2 | fourth form: violet chest shelf (new `armor.pecs`), shoulder domes, violet bracers and shin bands (real bands of plate, new prop `cuff` — the flat decals read as spots); final form: white pec shelf over a purple ribcage, the two great guards rising off the shoulders behind the head (new prop `arc`), white bracers and shin guards with blue gems, blades curving off the forearms, a white tail spike, a smaller mouth guard; the shoulder domes sink into the purple shoulder (props now follow `forms`) | the viewer's idle shows the fourth form's folded arms in both forms (2026-10-15: the bracers and shin guards flat-sided, six faces — new `sides` on a cuff prop) | flat-sided guards |
| Metal Cooler | Level 2 | teal-green plate over a dark purple-grey frame (face, upper arms), the helmet's visor over the eyes, forearm cuffs, knee caps, plated hands and feet | (2026-10-15, the board p.213: the segmented belly; the visor a band flush across the brow — it stood out like a cap's bill; the metal sheen only on the plate and the jointed tail, the dark frame matte — new `appearance.metalOnly` — fixed) | — |
| Turles | Level 2 | the old-style Saiyan armour in indigo with ribbing (new `outfit.ribs`), tall shoulder flaps, long tassets, white trim; bare arms and legs; white gauntlets; indigo boots with white tops | cape is the shared flat cape (2026-10-15: the fruit form's own look — glowing red-violet veins down the bare arms and thighs, in that form only — new `glow` on a decal — fixed) | — |
| Goku Black | Level 2 | assessed: grey gi over the black turtleneck, red sash, black trousers, white boots, the green earring all match the board | (2026-10-15 defects batch: one shaped skull narrowing to a sharper chin, narrower slanted eyes, a heavier brow — the soft face is fixed) | his own narrower eyes and brow |
| Zamasu, Fused Zamasu | Level 2 | wide square coat shoulders edged in gold (they were round pads), the pale-blue sash falling down the front of the coat | (2026-10-15, the owner's reference: Zamasu's hair a narrow white strip from brow to nape and ONE tall swoop rising off the front, leaning to his right and curling over at the tip — it had become a white bun of two thick locks; the coat's skirt edged in gold, new `hem.trim`, Fused Zamasu's too) **Fused Zamasu re-dressed 2026-10-15 from the board p.236** (found this session — the page had been taken for Zamasu's): Goku Black's dark high-collared gi under a grey coat lined in red, the shoulders drawn out to points with the red showing under them, the coat's skirt to the knee and open at the front (new `hem.open`), a red sash, black baggy trousers, white boots, green Potara earrings — he wore Zamasu's Kai robe ; the Half-Corrupted form (also 2026-10-15): his right arm swallowed by a swollen violet mass of uneven lumps in two shades from the heaped-up shoulder to a fist bigger than his head, a white wrap round the wrist, and the same purple over the right half of his face — form-only props and head extras **Fused Zamasu's barrier of light** (the owner's references, 2026-10-15): a great ring standing behind him from over his head to his waist — outer and inner rings, a beam up and one across, sparkles — new prop shape `barrier`, unlit; shown by default, switched by a story with `model.setPropVisible('halo', on)` (it was a small hoop over the head) | — |
| Future Trunks | Level 2 | the Super-arc outfit is now wearable (wardrobe `ft_super`, after "The Contract"): denim jacket over a black shirt, red scarf and cape, olive strap and boots, dark trousers; **an outfit can now bring its own hair** (`hair` on a wardrobe outfit): the Cell-armour and Super outfits grow his hair to the shoulders (new style `trunks_long`) | (2026-10-15, from memory — no board picture of it: the Super-arc outfit brings its own longer, fuller hair, `trunks_super`: the back past the shoulders, the bangs longer over the brow — fixed) | — |
| Super 17 | Level 2 | long hair to the waist with two locks in front (new hair `super17`; it was 17's length), brown harness straps (the gold ring round the chest is gone), the scarf's knot and tails, red gems in the silver palms | (2026-10-15, the board p.82: brown harness straps down the front to the belt with a gold band and two screws on each, a wide gold X buckle, a dark belt close round the jeans — it was a gold hoop — rips across both thighs, the bandana bunched thick, a gold earring, the front hair locks in front of the chest — fixed) the rips are flat patches | — |
| Baby Vegeta | Level 2 | the silver hair swept up and back into a wide mane (new hair `baby_vegeta`; it was Super Saiyan 2's flame), the white plate over the chest only, the great gold guards rising beside the head with red insides | (2026-10-15, the board p.81: hollow gold shells over the shoulders — new prop `shell`; the red marks painted on the skin; the white plate runs round the front to the armpits only — new `armor.wrap` — with a clean lower edge, the navy collar showing above it; it went round the back as a white ring — fixed) | — |
| Vegito | Level 2 | the hairline rides up to Vegeta's forehead (the cap came down over the brows and eyes), the two bangs shorter and splayed so they frame the eyes; the same for Super Vegito | — | — |
| Gotenks | Level 2 | assessed: hair, vest, pads, sash and trousers as the board | (2026-10-15: a child's proportions — a bigger head over a shorter torso, shorter arms and legs, the hip lowered so the feet stay down; the play scale (`height`) unchanged, so the figure stands a little shorter inside the same hurt box — fixed; the failed fusions inherit the build) | — |
| Perfect Cell, Super Perfect Cell | Level 2 | dark plates over the pecs and shoulders, the belly turned to green carapace in the perfect form only (`look.swap`); **the pastel cast is gone** — `tintAmount: 0` used to fall back to a 0.3 white tint (engine fix, `model.js` and `model_glb.js`) | (2026-10-15: the purple waist band; each shape its own spots — Imperfect a dense scatter of small speckles, Semi-Perfect big blotches, Perfect the medium spots, the board p.34–36; Super Perfect Cell keeps the perfect set — fixed) | — |
| Hit | Level 2 | the two round bumps over the brow that read as ears are now low ridges running back over the crown | (2026-10-15 defects batch: a taller skull raised over the crown, the crest and side ridges set out on it) | a taller cranium |
| Majin Buu | Level 2 | the vest frames the chest from the front (it sat round the back), the wide black belt sits under the belly (it stuck out of his sides like a ring; new `outfit.beltAt` / `beltFit`) with the gold plate in front, the cape knotted at the throat | (2026-10-15: the Majin "M" inked on the gold plate — new `mark: 'majin'` on a triangle prop; Super Buu's and Kid Buu's plates too) | the Majin mark |
| Android 18, Future 18 | Level 2 | the black shirt is striped white across (new `outfit.stripes`) — Future 18 inherits it | — | — |
| Frieza (final, 100 %, Golden) | Level 2 | the chest dome is a shelf over the pecs (it was a breastplate down to the belly; first and later forms share it), real bands of shell round the forearms and shins in the final shapes (were flat decals); Frost keeps his own look | — | — |
| Shugesh | Level 2 | blond hair swept back in thin flames above the ears (two upright cones read as horns), green scouter, blue belly panel, gold straps | — | — |
| Tarble | Level 2 | his own softer hair (new style `tarble`: shorter, wider, a fringe instead of the widow's peak), brown belly and tassets | — | — |
| Dr. Wheelo | Level 2 | three long claws on each hand | — | — |
| Garlic Jr. | Level 2 | dark spots on the skull | — | — |
| Master Roshi (and every fighter in gi trousers over shoes) | Level 2 | **the feet no longer float**: gi trousers over a shoe or an ankle boot left the ankles empty (engine fix in `model.js`; Roshi, Garlic Jr., Uub, Bora, Master Shen and others) | — | — |
| Mr. See-Through | Level 1 (new) | built 2026-10-15 on a new **Invisible** mechanic (`Mechanics.invisible` + `Model.setCloak`): a glassy shimmer (5 % opacity, the rim light glinting at the edge, no ink lines), his shadow and the dust at his feet; every wind-up shows him half-way (the attack is the telegraph); a hit on him lights him up for 40 frames, a blocked or landed blow for 16–20; lock-on, collision and hit detection unchanged. Swift school, Unseen Barrage, Slip Away, Invisible Onslaught | built from memory (no picture on the board); the CPU fights him by position, so only a human opponent feels the cloak; measured over a CPU fight he is unseen about a third of the time, half-seen a fifth, revealed the rest (mostly while being hit) | the owner plays against him: is he readable enough, too readable? |
| Broly (Z movies) | Level 2 — **detail pass 2026-10-15** | **pass 3 (the board p.220):** in the Legendary form the gold chest piece is gone and the neck ring carries the gem (new `look.collar: false`); the neck now rides the top of a swelling chest and the bare-chest pecs swell with it (every heavy form: the chest used to rise over the neck and chin and swallow the pecs). **pass 2 (against the board p.222):** the gold chest piece is now the board's wide chevron lying on the chest, gem in front (a front-only usekh, new `collarArc`; it was a small floating triangle) and it swells with the Legendary chest (collars now follow `look.bulk`); the red sash bunched in rolls over a wide gold belt plate with a big round gem in a gold setting; the red cloth hangs as front and back panels to the knee with the white trousers showing at the sides (new `hem.arc`; the ballooning trousers had pushed through a narrow skirt); slimmer trouser thighs (in Legendary they had grown wider than the torso); one shaped skull with a longer, squarer jaw and smaller eyes; the Legendary form floats upright with the arms out and stalks on the ground (new hover and stride) — his OWN hair now (`broly_z`, `broly_z_ssj`, `broly_lssj` — he wore the Super film's styles): curved, layered locks (new `bend`: `G.lock`); a harder face; every accessory as geometry (circlet gem, gold hoop earrings, choker, V chest piece and gem, gem-set cuffs, gold belt plate and gem, gold shin guards with oval gems over brown boots with pointed gold toes, the trousers ballooning over the knee); restrained Super Saiyan blue-violet (the board p.221), upright, cold; Legendary: the hair thrown UP (the Super film's falls), white eyes, the trapezius swelling round the neck (form-only anatomy), the gold pieces riding out on the swollen body (new `ride`), the cloth widening with the thighs, his own looming stance and grin; the Legendary change plays in full — music drops to its pulse, the sky darkens, the ground cracks, lightning, the circlet breaks off in gold shards at the burst (new `step.debris`) as his theme lands; heavy landings (crack, dust, camera) and a slower turn in that form | from memory where the board has no angle (the back of the hair); the circlet is gone after the change, not seen falling (2026-10-15: the Legendary neck ring and its gem now lie on top of the swollen chest round the base of the neck — the choker had sunk under the chest — fixed) | the owner looks at him in play |
| Bio-Broly | Level 2 | **pass 2 (the board p.223):** a slimed surface — lighter bio-liquid flowing down in drips over a darker olive and a hard wet shine (new `outfit.slime`, `rim.slime` in the toon shader); trapezius heaped up round the neck, one shoulder bigger, a hump on the back, slime hanging off the elbows, forearms and chin — the gold strands thrown out sideways and back from the slimed skull (the board p.223) — not horns, not hanging; heavy landings | (2026-10-15: the drips crawl down, each column at its own slow speed — a shared clock in `rim.slime` — fixed) | — |
| Android 13 / Super 13 | Level 2 | Super 13's cap is gone with the change (it came down over his eyes as orange; new `look.cap: false`), grey plates over his chest and great grey domes on his shoulders (props of the form) | — | — |
| Zangya | Level 2 — **hair finished 2026-10-15** | her own hair (the board p.217): a cloud of curls in mixed sizes heaped high over the crown and spilling down her back to the waist, heavier on her left, a shade deeper in the cascade; corkscrew ringlets beside the face and at the ends of the mane; curled locks swirling over the cloud (new `hair.zangya` — a close cap and two curled locks off the hairline — plus 27 head extras: curl masses and `curl` locks). Before: Jeice's straight strands under 14 round puffs of one size | (2026-10-15: the curls move like hair — new `sway` on head extras: they follow the hair's sway, bounce on a jump or a landing, breathe at rest, and counter-turn when she throws her head back so the cascade keeps hanging — fixed) | — |
| Broly (Super film) | Level 2 — **detail pass 2026-10-15** | **pass 2:** one shaped skull with a longer, heavier jaw and smaller eyes (the round head read as a boy's) — the same silhouettes as layered, curved locks with a second layer of strands (base mane, Super Saiyan, Full Power — whose mane now also falls down the back, unlike the Z Legendary's); the green cloth widens with his growing thighs; heavy landings growing form by form (Wrathful → Super Saiyan → Full Power); his transformations keep his own music in Free Battle (Wrathful's drums, his theme for Super Saiyan and Full Power — a generic rule had swapped in Goku's Super Saiyan theme) | the Full Power armour shatters only through his mechanic in a fight | — |
| Gogeta (Fusion Reborn) | Level 2 | **music (2026-10-15):** his own ominous Z score (`gogeta_z_arrival`), the Super film's Blue Gogeta his own high-speed one (`gogeta_super_rush`), GT's keeps `ssj4_theme` — MUSIC_THEMES → *The two Gogetas*. **roster correction:** a Movie fighter (was filed under What If); his Blue form is story-only on this entry (`form.storyOnly`: the Super film's missions use it), so Free Battle / Training offer Base and Super Saiyan here, Blue as `gogeta_blue`, SSJ4 as `gogeta_ssj4` | — | — |
| Super Janemba | Level 2 — 2026-10-15 | the board p.224: bright lilac-violet armour (it was a dull plum); the two great horns curve out of the sides of the head and sweep up and back in one curved lock each, violet like the helmet (they were two straight bone-white segments each); pointed red ears; white wraps round the upper arms; baggy violet trousers (were red and tight) over white shin wraps and violet hooves; the long red tail with its white point; a longer sword | from memory where the board has no angle (the back of the tail) | — |
| Janemba (fat) | Level 2 | the violet sash sits under the belly instead of floating round it like a hoop | — | — |
| Super Buu | Level 2 — 2026-10-15 | the board p.43: the antenna stands UP off the crown, thick at the root, and hooks back at the tip (it lay back over the skull like Good Buu's — new `curl` on a curved lock keeps its true curve); black forearm bands edged in gold (they were plain gold — new `outfit.wristTrim`); the black belt round the top of the trousers with the gold Majin plate in front (it stood out like a ring); gathered trousers; black boots edged in gold over brown shoes | (2026-10-15 defects batch: one shaped head with a heavy jaw; then, the board p.43: the skull narrows up into the antenna's thick root and stands taller — new `crown` on `face.headShape`; it was a round ball with the antenna on top — and black nails — fixed) | — |
| Kid Buu | Level 2 — 2026-10-15 | the board p.44: the antenna rises and curls back over itself (it lay back over the skull); long black forearm bands edged in gold (he had none); the gold Majin plate on the black belt; ballooning trousers gathered over black boots edged in gold and gold-brown shoes | (2026-10-15: black nails — new `outfit.nails`, every hand shape — fixed) | — |
| Dabura | Level 2 — 2026-10-15 | the board p.38: the great pointed ears sweeping up past the top of the head (he had small elf ears); the jumpsuit's V cut deep, the sleeves puffed; a wide white belt with its plate and a gold segment at his left, worn without the knotted sash under it (new `outfit.beltKnot: false`; it read as a thin white ring) | (2026-10-15: black nails — `outfit.nails` — fixed; the cape stands clear of the back — fixed) | — |
| Jiren | Level 2 — 2026-10-15 | the Pride Trooper suit as the board draws it (Dyspo p.58): black down the middle from the collar, the red coming to a point on the black belly — painted on the body (new `outfit.vee`, `rim.vee` in the toon shader), not plates; plain white boots; his torn state now bares the shoulders too (a long sleeve's shoulder cap stayed red — fixed for every torn long sleeve) | no board page of Jiren himself (checked against Dyspo's suit and the existing stills) | — |
| Toppo | Level 2 — 2026-10-15 | the suit pattern; pointed ears and the short white beard (the board p.56); the moustache slimmer and lower (it covered the eyes); **God of Destruction** now bursts the suit when he takes the form (new `form.wear`: bare to the ragged red band at the waist, as the board) with red diamond marks down the bare sternum (form-only props) and its own music | (2026-10-15, the board p.56: the God of Destruction's hide pale rose washed violet — it was a red-brown stand-in — fixed) | — |
| Dyspo | Level 2 — 2026-10-15 | the board p.58: a stronger lilac; the ears far longer (taller than the head), wider in the middle, narrow at the root, darker inside — they grow from the crown (their lower halves used to stick out under the head beside the neck); a small muzzle; the suit pattern; plain white boots | — | — |
| Omega Shenron | Level 2 | the missing knee spikes; black spikes out of the shoulders (the old black pads are gone), a fan of six off the back, two at the base of the neck; the seven blue gems now on the chest's surface (they sat inside it); blue belly under a white point, blue throat and groin; horns swept far back with blue undersides; black talons | (2026-10-15: black nails — `outfit.nails`; the board p.84 shows no whiskers, so none are added — closed) | — |
| King Piccolo | Level 2 — 2026-10-15 | the board p.205: long thin feelers arching forward off the brow and drooping (they were Piccolo's short straight antennae; `curl` keeps the bend), the old skull ridged across the crown, tan muscle patches down the arms, the 魔 large in the middle of the chest (it sat small on the breast and on the back under the cape) | the cape's dark lining | — |
| Mercenary Tao | Level 2 — 2026-10-15 | the board p.200: the long braid down his back with its red bow tied at the end (a short stub with a dot of red on the head), the 殺 large on the chest, white cuffs | — | — |
| General Blue | Level 2 — 2026-10-15 | the board p.201: a tall peaked officer's cap with its navy peak and the RR badge over the blond hair (it was a skull cap), a black cross strap over the right shoulder (a `strip`), the blue armband on his left arm only (both arms had one), a longer tie | no BLUE lettering on the band | — |
| Android 8 | Level 2 — 2026-10-15 | the board p.199: the head up out of the turtleneck on a thicker neck, a tall flat-top, the stitched scar across the forehead (a round skull cap and a brown smudge, the head sunk in the collar) | the suit's lapels | — |
| Bora | Level 2 — 2026-10-15 | the board p.198: the war paint two painted stripes, across the bridge of the nose and on his left cheek (two raised blobs as wide as the eyes), the cord necklace lying on the chest with five fangs (it sank under the bare chest), the X scar on his right breast | — | — |
| Grandpa Gohan | Level 2 — 2026-10-15 | the board p.197: the vest a deeper red-orange with yellow rings front and back, white frog fastenings down the front (a plain bright orange vest) | the rings are flat marks | — |
| Chi-Chi (young) | Level 2 — 2026-10-16 | the owner's correction of the board p.194 (its LEFT figure is the 23rd World Tournament Chi-Chi, its RIGHT one the child): **two wardrobe outfits, each with its own body** (`profile.bodies`). *Helmet Armour (Child)* `cc_kid`, the default and the early-adventure canon look, rebuilt: a child's proportions (larger head, shorter limbs and neck, narrow shoulders); the helmet a pink dome tipped back off the brow (it was a hair cap with the hair poking through), its silver rim, the round stone with a blue centre on the rim, the curved silver blade a real crescent (new prop `crescent`) standing from the brow over to the back; blunt bangs under the rim and long straight hair down the back (new `hair.chichi_kid`; she wore Android 17's cut); bigger eyes, small cheeks, thin brows; the covered armour fitted — a blue breastplate edged in silver (a V at the neckline, down the middle, along the bottom) over a blue bodysuit, a silver line at the hips (the white strap pads and the waist hoop are gone); long pink gloves past the elbow ending in a teal band; knee boots with a teal top and a blue ankle strap; the teal cape narrower and clear of the body (new `outfit.capeSize`). *23rd World Tournament* `cc_tournament23` (canon look of that era): her grown body (adult proportions, the same size in play), long straight hair with blunt bangs, long side locks and a low tail (new `hair.chichi_long`), no helmet; the blue sleeveless dress with its standing collar and red-edged opening across to her right, the skirt to the knee open at the sides and edged red, the wide red sash, full red trousers gathered under the knee, white lower legs, pink shoes, red wristbands. No third costume kept: the old stylized look was the same helmet armour, now replaced by the rebuilt one | the bikini armour is not reproduced (by design); Helmet Slasher still throws a blade from her head in the tournament dress, where she wears no helmet; the dress is `approximate` (colours read from the board); the child's teal cape, choker and bands confirmed by the owner; the cape is the shared flat cape | owner's review of both looks; a kit for the grown body if it should fight without the helmet throw |
| Launch | Level 2 — 2026-10-15 | the board p.190: her own full wavy hair to the shoulders, puffed at the sides and flipping out at the ends, the same cut blue or blonde (new `hair.launch`; she wore Videl's short cut, and Jeice's mane when blonde), the headband's big red bow | the top still covers the midriff | — |
| Piccolo Jr. | Level 2 — 2026-10-15 | the board p.208: the antennae hidden under the turban, the cape's wide padded shoulders and collar, pink muscle patches down the arms (he wore Z Piccolo's look unchanged) | — | — |
| Goku — Kid Goku (wardrobe) | Level 1 (new) — 2026-10-16 | the owner's collage (the boy with the four-star ball): the two planned young outfits are wearable — *Early Adventure (Kid)* `goku_early` (sleeveless blue gi, white sash and wristbands, brown shoes) and *Turtle School (Kid)* `goku_turtle_young` (the orange gi with no undershirt, 亀) — on a new **young body** (`profile goku`, `bodies.young`): a boy's build (big head and hands, short limbs, narrow shoulders), round open eyes, his hair as big again on the bigger head (`hair.goku_kid`), the red Power Pole across his back, the loose tail; the figure is 0.76 of Goku's size while the fighter keeps Goku's size in play (hurt box, reach) | Free Battle look only (no story: the Original Dragon Ball chronology is still a later pass; the owner confirmed 2026-10-16 that the outfits stay wearable now); the forms work on him (adult Super Saiyan hair on the boy) | the owner's review |
| Goku — god forms | Level 2 — 2026-10-16 | the collage separates them: Super Saiyan God, Ultra Instinct -Sign- and Mastered Ultra Instinct wore base Goku's hair in another colour; now their own shapes (`hair.goku_god` slimmer and a little raised, `goku_ui_sign` half-lifted, `goku_ui` swept up and back as the collage's Mastered form, bangs shorter). **Ultra Instinct's material (second pass, 2026-10-16):** Mastered's silver hair lit from inside (hair `glow`, the base a shaded silver, not flat white), a silver sheen over the whole body (`look.tint`), a calm face at rest (`restFace`); the Sign's near-black hair with a cold blue sheen, a fainter cold cast, a focused face at rest — with the existing auras (pale blue-white for the Sign, silver-white for Mastered) the two read as two states, not one hairstyle in two colours | the aura's own shape is the shared flame aura in their colours | — |
| Vegeta (and every Saiyan / Frieza Force armour) | — 2026-10-16 | **the armour trim** (the band where the chest plate ends) edges the plate's own lower rim, on the chest, and widens with it in bulky forms; it was a ring fixed on the spine a hand above that rim and wider than the body there — a gold hoop floating round Vegeta's Whis armour, and the same on the Frieza Force, Bardock, the Ginyu Force, Future Trunks' Cell-arc armour | — | — |
| Gogeta — Super Saiyan Blue | Level 2 — 2026-10-16 | the collage (him against Broly): the Super film's hair lies swept back and lower, sleeker (`hair.gogeta_blue`); it was Fusion Reborn's gold spires recoloured. Fusion Reborn's Super Saiyan and GT's crimson mane unchanged | — | — |
| Hair caps (adult Gohan / Future Gohan, Kid Trunks, Super Saiyan Future Trunks, Videl, Bulma, teen Trunks) | — 2026-10-16 | the skull showed between the front points in white, rim-lit streaks over the brow (the cap's front too small, or its rim set too high); each cap a size up at the front, adult Gohan's forehead strand stood off the brow, Kid Trunks' fringe pieces wider so they close | other faces swept (Goku family, Goten, teen Goten, Pan, Raditz, Yamcha, Gine, Turles, Vegito, Goku Black, Cabba, King Vegeta) showed none | — |
| Teen Gohan (Cell Games) | Level 2 — 2026-10-16 | the head was a big round ball with a small face set low on it: a smaller cranium shaped down into a jaw and pointed chin (`headShape`), the eyes wider apart and larger, a slighter nose, a longer neck; his Super Saiyan hairline closed; Super Saiyan 2 keeps its own canopy and forehead strand with smaller, colder pupils (`pupilScale`) | headR 0.144 (not lower: the adult-Gohan test pins the boy's head as relatively bigger) | — |
| Kid Gohan | Level 2 — 2026-10-16 | a wardrobe of his own: *Piccolo's Training Gi* `kg_training` (his authored purple gi, **the hat removed** — it belongs to the other era) by default and in the story, and *Raditz Arc (Hat and Tunic)* `kg_raditz` — the yellow tunic nearly to the ankle with its standing collar, green sleeves, the red hat with the four-star ball sitting back on his head, dark shoes, the loose tail through the tail slot. The Raditz mission and its What-If branch dress him in the tunic; training, Nappa, Namek in the gi. Size, health, techniques unchanged | no frog fastenings on the tunic; trouser colour a guess (the panel shows none) | — |
| Gogeta — Super Saiyan Blue (outfit) | Level 2 — 2026-10-16 | the film's own Metamoran clothes: a dark teal vest opened wider, a slimmer gold padded roll lying closer over the shoulders, the teal sash, wraps and boots (he wore Fusion Reborn's black vest, big orange pads, blue sash) | the owner's brief asked for an orange sash; neither the collage nor the film shows one — kept teal, one line to change | — |
| King Cold | Level 2 — 2026-10-16 | the board p.21 (his colours were inverted — a white body under a purple dome): lavender-purple skin, the white crown dome with its blue gem and black horns, the blue chest plate edged white over the orange-brown belly segment, black shorts, the broad pads over a red cape, white bracers and shin guards with pink ribbing (cuff props), bare purple feet and hands with black nails, the long pink tail | the ribbing is a pink band inside each white guard, not panels | — |
| Lord Slug | Level 2 — 2026-10-16 | the board p.211 (image p.210; he wore dark armour and a red cape): the mustard robe open at the front over a purple suit, wide short sleeves, its skirt to the shins parted down the front; the orange scarf gathered round the neck; the orange sash; the brown harness crossing over the chest with the big blue gem in a gold setting (strip and ball props riding the chest); orange knee boots; pink muscle patches down the green arms; a taller Namekian dome, long thin feelers arching forward (King Piccolo's construction), two scars down his left cheek. **Giant Form**: the robe and harness swell with the chest (engine: an open jacket now follows `bulk`, `model.js`) | — | — |
| Drum | Level 2 — 2026-10-16 | the board p.207: a dense scatter of dark spots over the shoulders, arms, flanks and back, the belly's front clear (there were six dots); the orange sash knotted in front with its two ends hanging; lavender wraps round the calves below the trousers' balloon (the old leg bands sat inside it, unseen); blue baggy trousers, blue shoes, blue lips | — | — |
| Turles | Level 2 — 2026-10-16 | the board p.209: **no cape** (it is not on the board); the chest black with the blue ribbed centre panel, rimmed white, running down into the blue belly; blue ribbed gauntlets with a white rim (were white); black boots with white tops over blue ribbed foot guards; the fruit form keeps the same armour and its glowing veins | the long tassets read short | — |
| Tambourine, Cymbal | — 2026-10-16 | **no board image of either — not a reference comparison.** The one clear fault fixed: their wings were two flat triangles sticking straight out of the shoulders like paper fins; now the shared back wings (Cell's construction), two blades off the shoulder blades fanned out and swept down the back with a darker edge (the design notes' "winged demon") | everything else unchanged and unverified against a picture | a reference from the owner |
| Frieza Force armour — Ginyu Force, Zarbon, the soldiers (`padStyle: 'saga'`) | — 2026-10-16 | the board p.12–18: the shoulder pads flat and pointed, wide on the shoulder, reaching well past it and lifting at the tip (a seven-sided cone laid on its side, `model.js`); `saga` had fallen through to the generic small ellipsoid and read as nubs | front-on they read thinner than the board's | — |
| Nail | Level 2 — 2026-10-16 | the board p.19 (he wore a white sleeveless gi top and a brown belt): the bare Namekian torso with the pink belly muscle, the white shawl over the shoulders and round the neck, the light-blue sash with its tails, baggy white trousers gathered at the ankle, brown shoes, pink muscle patches down the arms | — | — |
| Tora | Level 2 — 2026-10-16 | the board p.7: the big pointed shoulder flaps (the new `saga` pads, a little longer) and the long tassets, ribbed blue like the belly — the flaps had been hidden in the shoulders | — | — |
| Botamo (story) | — 2026-10-16 | the board p.50: the red shirt ends at the hips, yellow legs into big red shoes (his legs were red) | — | — |
| Cabba | Level 2 — 2026-10-16 | the board p.52: the magenta waist cloth hanging in panels over the hips (`hem.arc`), pink-violet boots with pale toes | — | — |
| Pikkon | Level 2 — 2026-10-16 | the board p.227: the hood wound round his head under a dark crown (`outfit.turban`); he was bare-headed | no halo (the board's) — Other World's halos are the missions' business | — |
| Checked, unchanged | — 2026-10-16 | Dr. Gero (his hat was there — a cropped view hid it), Android 19 (the sash is his body's own width, not a hoop — a change was made and reverted), Bojack (the board p.216 is his Full Power form, already green), Fasha, Frost, Magetta | — | — |
| Piccolo (Z), Piccolo Jr. | Level 2 — 2026-10-16 | the weighted cape's broad padded shoulders and its collar round the neck on the Z Piccolo (he wore the cape as a bare sheet off his back); the pieces are tagged `cape: true` and go with the cape when he drops it in his intro (`Fighter.onSequenceEvent('dropCape')` — Piccolo Jr.'s pads, which he inherits, used to stay floating after the drop) | — | — |
| Checked, unchanged (sweep) | — 2026-10-16 | Krillin, Tien (third eye), Chiaotzu, Yajirobe (his katana), Raditz, Nappa, Uub, Pan; Saiyan-saga Vegeta's pads tried in the new `saga` style and left as they were (small in canon too) | — | — |
| Magetta (story) | — 2026-10-16 | the board p.51: a machine's face — only the two glowing eyes; the human pupils, brows, nose and mouth that sat under them take the metal's colour and vanish into the dome; the smokestack a rimmed pipe (it was a spike) | faint dots remain where the eye highlights sit | — |
| Android 17 (and Future 18, who shares the cut) | — 2026-10-16 | the `a17` cap a size up at the front (the same white streaks between the fringe's points) | Future 17's centre parting (Kibito's cut) shows skin by design | — |
| Gi wearers (Goku, Gohan, Krillin, Goten, Yamcha, …) | — 2026-10-16 | **the gi's obi** is a broad flat band close round the waist with the knot and two tails hanging to mid-thigh in front of the trousers (it was a round tube standing a fifth of the waist off the body — a hoop — with stub tails); plain trouser belts and sashes lie closer too, and a belt's buckle now sits on the band (Future Trunks' white-and-red buckle had been inside it) | — | — |
| Chi-Chi (Z era, story) | Level 2 — 2026-10-16 | the collage (her with Goku at home): the purple dress — standing collar, skirt to the shins open at the sides — over a pink long-sleeved shirt and pink trousers, gold cuffs and sash; a grown woman's build (her young self's grown body); her hair drawn back into a bun with a gold band, a fringe and a lock by each cheek (new `hair.chichi_bun`). She wore a plain purple gi on a man's build with a big head and a short ragged cap that let the forehead show through in white streaks | colours read from one small panel | — |
| Kid Gohan | Level 2 — 2026-10-16 | his hat sits tipped back on his head, the fringe and eyes showing under it (it came down over his eyes); every cap now sits a little back (`outfit.capTilt`, default 0.28; Grandpa Gohan, Pilaf, Android 13 and 15, the Red Ribbon officers) | he still wears the hat with Piccolo's purple gi (the collage's hat goes with the Raditz-arc tunic) | — |
| Majin Vegeta | Level 2 — 2026-10-16 | the Majin creases under his eyes show (they sat at the eyes' height behind the eye whites) | — | — |
| Gohan (Cell Games), Super Saiyan 2 | Level 2 — 2026-10-16 | the single strand over his forehead shows (it ran down into the forehead) | — | — |
| Mr. Satan (story) | Level 2 — 2026-10-16 | the collage: the afro, a great round mass wider than his face (it was a close bob); the moustache a thick bar under the nose (its halves stood on end as two black ovals over his eyes). Gokule shares the afro (scaled to Goku's head) | — | — |

## The owner's Dragon Ball collage (2026-10-16)

A single image (1125 × 1125, about 150 panels: anime stills, manga pages, a transformation grid, character grids) the owner
sent as extra visual guidance after the board. **References only** — nothing from it is in the game. Panels identified
(many are small; nothing below is claimed from a panel too small to read):

| Panel(s) | What they show | In the game | Outcome |
|---|---|---|---|
| SSJ4 Goku close-up; transformation grid (base → SSJ 1–3, Kaioken, SSJ God, SSJ4) | Goku's forms | Goku's forms; Goku (SSJ4) | God / UI hair given their own shapes; SSJ4 already passed (Level 2) |
| Ultra Instinct from behind | silver hair swept up and back | `mui` | `hair.goku_ui` |
| SSJ Blue Gogeta against Super Broly; Super Broly grid | the film | Gogeta (Blue), Broly (Super) | already passed; unchanged (the Broly and Gogeta work stays as it is) |
| Future Trunks: the manga cover in the Cell-arc armour; the black tank top with the jacket at his elbows; Super-arc Trunks | his outfits | `ft_capsule`, `ft_armor`, `ft_super` | belt lies closer, the buckle shows; the belt's colour in the panel is too small to read — unchanged |
| SSJ God Goku (red); SSJ3 Goku standing; SSJ3 dragon fist | forms | `god`, `ssj3` | God hair; SSJ3 mane matches (long mane down the back, wide at the shoulders) — unchanged |
| SSJ2 Gohan (Cell Games), bloodied; the Kamehameha | the purple gi, the bang | `teen_gohan` SSJ2 | the bang shows; the obi |
| the Goten / Trunks fusion dance (sprite sheet) | the dance | Gotenks' fusion | unchanged (already a sequence) |
| Majin Vegeta (M, creases); bloodied SSJ Vegeta | the Majin face | `vegeta` `majin` | creases fixed |
| Bardock with the energy ball; Goku Black faces; Kid Goku | | Bardock, Goku Black (Level 2), Goku | Kid Goku built (wardrobe); Bardock and Goku Black unchanged |
| SSJ4 Gogeta against Omega Shenron | GT | Gogeta (SSJ4), Omega (Level 2) | unchanged |
| Vegito (SSJ) | the fusion | Vegito (Level 2) | unchanged |
| Frieza (final) and Namek SSJ Goku; Goku's torn Namek gi | Namek | Frieza, `goku_namek` | unchanged |
| Bulma (bunny suit); the manga page with Bulma, Puar, early Yamcha and Kid Goku | the original series | Bulma (story), Yamcha | not changed (the bunny suit is a gag costume; early long-haired Yamcha would be a new look) |
| Goku and Chi-Chi at home | Z-era Chi-Chi | `chichi` | rebuilt |
| Kid Gohan in the hat with the Dragon Ball (Raditz arc, yellow tunic) | | `kid_gohan` | the hat no longer hides his eyes |
| Mr. Satan flexing (afro) | | `mr_satan` | afro and moustache rebuilt |
| Cell against Gohan; Perfect Cell; Frieza's forms grid; Gohan in different eras; adult Gohan and Kid Trunks; Kid Goku and Krillin flying | | | unchanged (already passed or too small to compare) |

## Playable (131)

**Dragon Ball:** King Piccolo (with Rejuvenated, *p.205*), Piccolo Jr. (with Giant, *p.208*), Tambourine, Cymbal,
Drum *(p.207)*, Mercenary Tao *(p.200)*, General Blue *(p.201)*, Android 8 *(p.199)*, Bora *(p.198)*, Grandpa Gohan
(with Masked, *p.197*), Chi-Chi (young, *p.194*), Launch (blue and blonde, *p.190*), and from memory Master Shen, Nam,
Giran, King Chappa, Spike the Devil Man, Fangs the Vampire, Bandages the Mummy, Colonel Silver, Major Metallitron,
Ninja Murasaki, Staff Officer Black (with the Battle Jacket), Mr. See-Through (2026-10-15, the Invisible mechanic), King Gurumes and Lucifer (the first two Dragon Ball films) ·
**Planet Vegeta:** Bardock, Tora *(p.7)*, Fasha *(p.6)*, Shugesh *(p.8)* · **Saiyan Saga:** Goku, Vegeta, Raditz,
Piccolo, Kid Gohan, Krillin, Tien, Yamcha, Chiaotzu, Yajirobe, Nappa · **Namek:** Frieza (six forms), Dodoria, Cui,
Nail *(p.19)*, Zarbon, Captain Ginyu *(p.12)*, Recoome *(p.13)*, Burter *(p.15)*, Jeice *(p.17)*, Guldo *(p.18)* ·
**Android Saga:** Future Trunks, Mecha Frieza, King Cold *(p.21)*, Android 19 *(p.30)*, Dr. Gero *(p.32)*, Androids
17 / 18 / 16 *(p.23–28)*, Cell (Imperfect / Semi-Perfect / Perfect, *p.34–36*) · **Future Timeline:** Future Gohan
(one arm; base and Super Saiyan), Goku Black (base and Super Saiyan Rosé, *p.233*), Zamasu *(p.234)*, Fused Zamasu
(with Half-Corrupted), Future 17 and Future 18 *(p.231–232)* · **Cell Saga:** Gohan (11), Super Perfect Cell *(p.37)* ·
**Buu Saga:** Gohan (18), Great Saiyaman, Goten, Kid Trunks, Videl, Dabura *(p.38)*, Majin Buu *(p.42)*, Gotenks
(with SSJ3), Super Buu *(p.43)*, Kid Buu *(p.44)*, Vegito · **End of Z:** Uub, Pan · **Super:** Jiren, Beerus, Cabba,
Frost *(p.49)*, Hit, Magetta, Caulifla, Kefla, Kale, Dyspo *(p.58)*, Toppo, Master Roshi, Tagoma · **Movies:**
Janemba, Super Janemba (two entries, *p.224*), Pikkon, Broly (Super), Cooler (fourth and final form, *p.66 / p.212*),
Turles *(p.71)*, Tarble (OVA, *p.5*), Gine, King Vegeta, Metal Cooler *(p.67 / p.213)*, Broly (Z movies, base /
Super Saiyan / Legendary, *p.222*), Bio-Broly *(p.224)*, Android 13 (with Super 13, *p.214–215*), Android 14, Android
15, Bojack (with Full Power, *p.216*), Zangya *(p.217)*, Garlic Jr. (with Super Garlic Jr., *p.218*), Lord Slug (with
Giant Form, *p.211*), Dr. Wheelo *(p.219)*, Tapion *(p.225)*, Hirudegarn *(p.226)*, Gogeta (Fusion Reborn: base and Super Saiyan — filed here since 2026-10-15, he was under What If), Gogeta — Super Saiyan Blue (the
film's own entry, *p.240*), and from memory Salza, Dore, Neiz (Cooler's Armored Squadron), Bido, Bujin, Kogu
(Bojack's pirates), Hatchiyack (the OVA) · **GT:** Goku (SSJ4), Vegeta (SSJ4), Gogeta (SSJ4), Baby Vegeta, Super 17, Omega Shenron
*(p.77–84)*. No roster fighter is filed under What If (the What-If missions use the roster's fighters).

Future Trunks gained **Super Saiyan Rage** as a form (locked inside the story; Free Battle after "The Contract").
GT fighters are their own continuity (era 'GT', its own picker group).

Continuity labels: the movie and OVA fighters (Cooler, Metal Cooler, Turles, Tarble, both Brolys, Bio-Broly, the
movie androids, Bojack, Zangya, Garlic Jr., Lord Slug, Dr. Wheelo, Tapion, Hirudegarn, Janemba, Pikkon) and Goku Black are
Free Battle only — none is placed in the canon story order. Gine and King Vegeta are the *Super: Broly* prologue
versions (era 'Movie').

## Progress — the continuation brief (2026-10-14 →)

### Priority A and B (done this continuation)

| Character | State | Forms | Kit — what makes it different | Unlock |
|---|---|---|---|---|
| Master Roshi | Playable | base, Max Power | old master's sway and palm, Max Power body | Chapter 21 "The Spirit Bomb" |
| Tagoma | Playable | base | elite soldier's cannon; **Playing Dead** (drops, comes up with the boot), **Elite Beating** five-blow rush (both Free Battle only) | "The Thousand Soldiers" |
| Magetta | Playable | base | heavy metal body (poise armour); **Magma Spit** from the head, **Molten Ground** eruption columns (both Free Battle only) | "Iron and Magma" |
| Cooler | Playable | Fourth Form, Final Form | faster than Frieza: knee, backhand, Death Beam, Death Chaser rush, Supernova; final form: purple body under white plates, crest, gems, mask — claws, armoured hammer, Death Flasher fan, Nova Crush, Supernova Cooler | "Five Minutes" |
| Turles | Playable | base, Tree of Might Power | Goku's martial arts with Kill Driver (guard-cutting ring); **Fruit of the Tree of Might** heals once; the fruit form unlocks **Meteor Burst**; Calamity Blaster | "The Saiyan Prince" |
| Tora | Playable | base | shoulder-first grappler: Bear Hug throw, Tora Cannon, Shoulder Crush rush, Full-Power Energy Ball | the Prologue |
| Fasha | Playable | base | fastest of the squad: kick strings, Triple Shot fan, Kick Rush, Full-Force Rain | the Prologue |
| Shugesh | Playable | base | slow, armoured (poise), Crash Down body-slam from the air, Heavy Blast, Breaker Wave | the Prologue |
| Tarble | Playable | base | weak and evasive: quick jabs, Sidestep teleport, Prince's Shot, Royal Wave | "Peace" |
| Gine | Playable | base | support: **Saiyan Rations** (two, eaten or thrown to a hurt ally), cleaver chops, For Kakarot rush | "The Fall of Planet Vegeta" |
| King Vegeta | Playable | base | royal blaster, King's Order rush, Imperial Cannon beam | "The Fall of Planet Vegeta" |
| Goku Black | Playable | base, Super Saiyan Rosé | knife-hands and a **ki blade** (Energy Blade, Divine Wrath); Black Kamehameha turns rose in Rosé; Rosé ultimate **Sickle of Sorrow** | "The Contract" |

Shared engine work this batch: a `senzu`-type technique now carries its own count without Yajirobe's mechanic
(Turles' fruit, Gine's rations), and the CPU eats only when hurt and out of reach or to save an ally.

### Movie batch (2026-10-15, done)

| Character | State | Forms | Kit — what makes it different | Unlock |
|---|---|---|---|---|
| Metal Cooler | Playable | base | polished metal (new `appearance.metal` shading), armour, self-repair (regeneration), Relentless Pursuit orbit, Metal Death Beam, Nova Cannon | "Five Minutes" |
| Broly (Z) | Playable | base, Super Saiyan, Legendary | gold jewellery, red cloth, white trousers; Gigantic Lariat, Blaster Shell, Gigantic Meteor; Omega Blaster in the legendary form | the Cell Games |
| Bio-Broly | Playable | base | swollen slime body, regrowth, Bio Spit from the mouth, Bio Slam from the air, Gigantic Bio Blast | the Cell Games |
| Android 13 | Playable | base, Super 13 | trucker cap, open vest; bear hug, Crusher Rush; Super 13: blue skin, red flame hair, S.S. Deadly Bomber | the Cell Games |
| Android 14 | Playable | base | the silent brute: armoured Walking Wall, Demolition | the Cell Games |
| Android 15 | Playable | base | the small gunner: Rapid Fire fan, Slip Away, Endless Barrage | the Cell Games |
| Bojack | Playable | base, Full Power | Grand Smasher, Galactic Tyrant, Galactic Buster | the Cell Games |
| Zangya | Playable | base | kicks, Pirate Fan, Vanish, Storm of Kicks orbit | the Cell Games |
| Garlic Jr. | Playable | base, Super Garlic Jr. | the **Dead Zone** grip (holds and drains), Makyo Blast, Makyo Wave, immortal regrowth | "The Saiyan Prince" |
| Lord Slug | Playable | base, Giant Form | Darkness Eye Beam, Stretching Grab; the giant's Giant Stomp; Darkness Flash | "The Saiyan Prince" |
| Dr. Wheelo | Playable | base | brain dome in the chest; Bio-Missiles, Claw Crush, Power Ball | "The Saiyan Prince" |
| Tapion | Playable | base | sword school (Trunks' cuts), **Hero's Flute** stills the field, Brave Sword Attack, Brave Cannon | "Peace" |
| Hirudegarn | Playable | base | huge and armoured: Hell's Flame from the mouth, Hell's Claw, Hell's Storm | "Peace" |

Android 14 and 15 are built from memory (the board has no picture of them). Henchmen (Salza, Dore, Neiz, Bojack's
other pirates, …) are not built.

### Future, Cell, fusions and GT (2026-10-15, done)

| Character | State | Forms | Kit — what makes it different | Unlock |
|---|---|---|---|---|
| Zamasu | Playable | base | Holy Light, Divine Blade (ki blade), God Splitting Cut; Immortal Body (regeneration) | "The Contract" |
| Fused Zamasu | Playable | base, Half-Corrupted | halo, Blades of Judgment (falling blades), Lightning of Absolution, Holy Wrath; the corrupted form spills purple and grows | Chapter 21 |
| Future 17 | Playable | base | the hunter: Photon Flash through a guard, Hunter's Rush, Super Electric Strike; faster to the kill than the present 17 | the Cell Games |
| Future 18 | Playable | base | her own kicks, Power Blitz, Sadistic Kicks, Destruction Wave | the Cell Games |
| Super Perfect Cell | Playable | base | Perfect Cell's body and kit with lightning in the aura, harder and faster — its own entry, the story's Cell keeps three forms | the Cell Games |
| Future Trunks — SSJ Rage | Playable (form) | Trunks: base, SSJ, **SSJ Rage** | blue lightning, paler hair; Sword of Hope ultimate | "The Contract" (Free Battle); locked inside the story |
| Gogeta — SSJ Blue | Playable | base | the film's Gogeta: Blaster Meteor, Stardust Fall, Ultimate Kamehameha | "The Ultimate Fusion" |
| Goku (SSJ4) | Playable | base | red fur, Kamehameha, Dragon Fist, 10x Kamehameha | Chapter 21 |
| Vegeta (SSJ4) | Playable | base | Big Bang Attack, Prince's Onslaught, Final Shine Attack | Chapter 21 |
| Gogeta (SSJ4) | Playable | base | Big Bang Kamehameha, Meteor Smash, 100x Big Bang Kamehameha | Chapter 21 |
| Baby Vegeta | Playable | base | Revenge Cannon, Parasite Onslaught, Revenge Death Ball | Chapter 21 |
| Super 17 | Playable | base | Photon Flash, Hell Fighter Rush, Super Electric Strike (no absorption — a barrier technique fails the coverage test today) | Chapter 21 |
| Omega Shenron | Playable | base | Dragon Thunder, Dragon Crush, Negative Energy Ball | Chapter 21 |

Fused Zamasu was first built from memory; since 2026-10-15 he is dressed from the board's p.236 (his own page, found then). The Fusion Reborn Gogeta is a **Movie** fighter
(base and Super Saiyan; corrected 2026-10-15 — he was filed under What If). His Blue form stays on that fighter only for
the Super Broly film's own missions (`form.storyOnly`); in Free Battle and Training the Blue Gogeta is `gogeta_blue`, and
the GT Gogeta is `gogeta_ssj4`.

### The original Dragon Ball (2026-10-15, done)

| Character | State | Forms | Kit — what makes it different | Unlock |
|---|---|---|---|---|
| King Piccolo | Playable | base, Rejuvenated | Demon Eye Beam, Stretching Arm, Explosive Demon Wave | Chapter 1 |
| Piccolo Jr. | Playable | base, Giant | Mouth Energy Wave, Demon Hand, Super Explosive Wave (a dome blast); Giant Stomp when giant | Chapter 1 |
| Tambourine | Playable | base | winged ambusher: Demon Blast, Ambush (teleport behind / above), Winged Fury | Chapter 1 |
| Cymbal | Playable | base | winged dive-bomber: Demon Breath from the mouth, Dive Bomb, Sky Talons (built from memory) | Chapter 1 |
| Drum | Playable | base | heavy pressure: Belly Charge, Body Drop, Demon Rampage | Chapter 1 |
| Mercenary Tao | Playable | base | precise counters: Dodon Ray (one finger, through a guard), Sudden Step, Super Dodon Wave | Chapter 1 |
| General Blue | Playable | base | **Paralysis** (a telekinetic hold), Red Ribbon Drill, General's Cannon | Chapter 1 |
| Android 8 | Playable | base | the gentle giant: Eighter Shove, Ground Shake, For My Friends | Chapter 1 |
| Bora | Playable | base | Spear Throw (a javelin of ki), Guardian's Charge, Rain of Spears | Chapter 1 |
| Grandpa Gohan | Playable | base, Masked | Kamehameha, **Jan Ken** (rock, scissors, paper), Full Power Kamehameha; the fox mask and halo | Chapter 1 |
| Chi-Chi (young) | Playable | base | Helmet Slasher (the blade thrown), Ox Princess Combo, Dynamite Kick — in a covered armour (the bikini armour is not reproduced); wardrobe: the child's helmet armour or the grown 23rd World Tournament dress, each with its own body | Chapter 1 |
| Launch | Playable | Blue, Blonde (a sneeze) | blue: Pepper Throw, Run Away, Flustered Flurry; blonde: Submachine Gun, Grenade, Bazooka | Chapter 1 |
| Korin, Ox-King, Upa, Emperor Pilaf, Shu, Mai, Piano, Puar, Oolong | **Support role** (model, not a fighter) | — | story, training and side-content roles, as the board suggests; viewable in the model viewer; not offered in Free Battle | — |

Cymbal, Piano and Oolong are built from memory (the board has no picture of them).

### The board's optional extras (2026-10-15, done — all built from memory, no pictures on the board)

| Character | State | Continuity | Kit | Unlock |
|---|---|---|---|---|
| Salza | Playable | Movie (Cooler's Revenge) | energy blade (Salza Blade), Squadron Shot fan, Salza Cannon | "Five Minutes" |
| Dore | Playable | Movie | brute: Dore Blast, Dore Crusher, Dore Cannon | "Five Minutes" |
| Neiz | Playable | Movie | **Neiz Bind Wave** (electric hold), Neiz Shot, Lightning Storm | "Five Minutes" |
| Bido | Playable | Movie (Bojack Unbound) | Pirate Volley, Pirate Crush, Galactic Wave | the Cell Games |
| Bujin | Playable | Movie | **Psycho Thread** (hold and drain), Pirate's Step, Psycho Rain | the Cell Games |
| Kogu | Playable | Movie | swordsman: Sword Wave, Pirate's Edge, Blade Storm; Sword Guard | the Cell Games |
| Hatchiyack | Playable | OVA (Plan to Eradicate the Saiyans) | Tuffle machine: Revenge Shot, Tuffle Crush, Revenge Cannon | "The Saiyan Prince" |
| King Gurumes | Playable | Dragon Ball film 1 | giant: Ruby Breath (mouth), Royal Stomp, Endless Hunger | Chapter 1 |
| Lucifer | Playable | Dragon Ball film 2 | vampire lord: Devil's Laser, Into the Dark, Moonless Night | Chapter 1 |
| Master Shen | Playable | Dragon Ball | Crane school: Dodon Ray, Crane Step, Super Dodon Wave | Chapter 1 |
| Nam | Playable | Dragon Ball | Heavenly Cross Attack (from the air), Village Fist, For the Village | Chapter 1 |
| Giran | Playable | Dragon Ball | **Merry-Go-Round Gum** (a hold), Tail Whip Rush, Giran's Rage | Chapter 1 |
| King Chappa | Playable | Dragon Ball | **Eight-Arm Fist** (a seven-blow flurry), Palm Shot, Eight-Arm Storm | Chapter 1 |
| Spike the Devil Man | Playable | Dragon Ball | Devil Bolt, Devil's Vanish, Devilmite Beam | Chapter 1 |
| Fangs the Vampire | Playable | Dragon Ball | Bat Swarm, Mist Step, Vampire Bite | Chapter 1 |
| Bandages the Mummy | Playable | Dragon Ball | Mummy's Grip, Tomb Stomp, Ancient Crush | Chapter 1 |
| Colonel Silver | Playable | Dragon Ball | Officer's Shot, Drill Rush, Red Ribbon Fury | Chapter 1 |
| Major Metallitron | Playable | Dragon Ball | robot: Iron Charge, Steel Stomp, Muscle Tower Crush; tireless | Chapter 1 |
| Ninja Murasaki | Playable | Dragon Ball | Throwing Stars, Smoke Step, Shadow Strike | Chapter 1 |
| Staff Officer Black | Playable | Dragon Ball | pistol, Red Ribbon Rush, Jacket Cannon; **Battle Jacket** form with missiles | Chapter 1 |
| Commander Red, General White, Dr. Kochin | Support role | Dragon Ball / Movie | story roles, not fighters | — |

### The queue (continue in this order)

| Area | Character | State | Note |
|---|---|---|---|
| Original DB (further) | Mr. See-Through | Playable (2026-10-15) | Baba's invisible fighter, on the new Invisible mechanic (see *Quality levels*) |
| Visual passes | the "known gap" column below that the *Quality levels* table has not closed yet (Bojack's base outfit) | Visual pass required | Perfect Cell, Hit, Majin Buu, 18, Frieza's chest, Tarble, Shugesh, Garlic Jr., Wheelo: done 2026-10-15 |

### Story-only (exists, not selectable)

Paragus (Super), Grand Elder Guru, Dende, Bulma, Chi-Chi (adult), King Kai, Bubbles, Mr. Satan, Supreme Kai, Kibito,
Kibitoshin, Old Kai, Babidi, Spopovich, Yamu, Pui Pui, Yakon, Evil Buu, the absorbed Buus (Buutenks, Buuccolo,
Buuhan), Whis, Champa, Vados, Botamo, Zeno, the Grand Priest, Android 17 (Tournament of Power self), Saibaman, Cell
Junior, Jaco, Cheelai, Lemo, Sorbet, the Kais, Gotenks' failed fusions, Veku.

### Remaining count

Every character the brief lists now has a state: **0 Missing** — and since 2026-10-15 none of the board's optional
extras is missing either (Mr. See-Through is playable). 131 are playable; nine supporting characters of
the original series (Korin, Ox-King, Upa, Pilaf, Shu, Mai, Piano, Puar, Oolong) are support-role models by design;
both Launches are one fighter with two forms. Still missing are only the board's *optional* extra lists (the further
original-series cast and the movie henchmen, in the queue above) — and no character is **Verified** until the owner
has played it. Story-only characters above are not
counted; promoting any of them is optional.

## Compared with the board (2026-10-14) and changed

| Character | What the board showed | What was wrong | Now |
|---|---|---|---|
| Captain Ginyu (p.12) | dark navy chest, brown plates, bare purple limbs, black shorts, black horns | white chest, blue pads, full dark trousers, pale horns | as the board (new `outfit.thighs` for bare legs under shorts) |
| Recoome (p.13) | red-orange mop, black short sleeves and shorts, bare heavy limbs, brown plates | a soldier's crest, full trousers, red-brown pads | as the board (`hair.recoome`) |
| Burter (p.15) | navy chest, brown plates, black legs, gold head crest, red eyes | white chest, blue pads, pale eyes | as the board |
| Jeice (p.17) | long white mane, black bodysuit and collar, red tights | thin spikes, navy trousers, blue pads | as the board (`hair.jeice` rebuilt) |
| Guldo (p.18) | second eyes on the sides of the head, black baggy suit, pink mouth | second eyes on the forehead, purple pads | as the board |
| Dabura (p.38) | black slicked hair, goatee, yellow eyes, blue jumpsuit, white belt / cape / boots | white mane, black vest, white trousers | as the board |
| Android 19 (p.30) | black cap with an orange point, yellow waistcoat, red sash, orange trousers | black top, yellow trousers, a soldier's crest | as the board (`hair.skullcap`) |
| Dr. Gero (p.32) | tall black hat with a red band, white beard, orange sleeves, black waistcoat, brown trousers | a grey suit | as the board (new `cyl` head-extra shape for the hat) |
| King Cold (p.21) | deep crimson cape | the cape rendered WHITE (an object the cape builder could not read) | crimson |
| Future Trunks (p.229) | Cell Saga armour: blue suit, white armour, gold straps and belly | outfit "planned" only | `ft_armor` outfit (prototype; unlocks after "A Year in a Day"; the shoulder-length hair is not possible per outfit yet) |
| Future Gohan (p.230) | base / Super Saiyan, one arm | he inherited present Gohan's Ultimate form | base and Super Saiyan only |

New fighters compared in the viewer (2026-10-14 / 15), with what the rig cannot show yet:

| Character | Matches the board | Known gap |
|---|---|---|
| Cooler (p.212) | white body / violet domes; final form purple under a white pec shelf, crest, gem, mask, the rising shoulder guards, bracers with blades and shin guards with blue gems (2026-10-15 polish) | see *Quality levels* |
| Turles (p.71) | Goku's hair, darker skin, ribbed indigo armour with tall flaps and long tassets, bare limbs, white gauntlets, white cape, red scouter, indigo boots (2026-10-15 polish) | cape is the shared flat cape |
| Tora (p.7) | black suit, blue pads and belly, bare legs, black boots, green scouter | the bloodied armband is not modelled |
| Fasha (p.6) | short dark bob, magenta suit, green plates, gold belly, green knee bands, white gloves and boots, earring | — |
| Shugesh (p.8) | grey skin, bald with blond hair swept back, navy armour, blue belly, gold straps, green scouter, blue baggy trousers (2026-10-15 polish) | — |
| Tarble (p.5) | his own softer hair, blue suit, white armour, brown pads, belly and tassets, white gloves and boots (2026-10-15 polish) | — |
| Goku Black (p.233) | grey gi over black turtleneck, red sash, black trousers, white boots, green Potara earring in the left ear; Rosé pink hair, grey eyes | — |
| Metal Cooler (p.213) | teal-green plate over a dark frame, the helmet's visor, shoulder domes, forearm cuffs, knee caps, red eyes, mouth plate, tail (2026-10-15 polish) | (2026-10-15: segmented belly) |
| Broly, Z (p.222) | long black hair, gold circlet with gem, choker, chest piece, arm bands, cuffs, red cloth, white trousers, gold shin guards; green-gold legendary hair without the circlet (2026-10-15) | — |
| Bio-Broly (p.224) | olive slime body with lighter drips, red eyes, red openings in the chest, gold strands hanging wet (2026-10-15) | (the drips crawl, 2026-10-15) |
| Android 13 / Super 13 (p.214–215) | white hair under a yellow cap, open olive vest, green trousers, red-brown gloves; Super 13 blue with a red flame of hair, no cap, grey chest plates and shoulder domes (2026-10-15) | — |
| Bojack (p.216) | green skin and red mane in full power, lavender trousers, teal sash, yellow boots | his base outfit is the full-power one |
| Zangya (p.217) | teal skin, a cloud of orange curls, white vest over blue, purple wrap, cream trousers, gold boots, black gloves (curls 2026-10-15) | — |
| Garlic Jr. (p.218) | pale skin, long ears, skull spots, black robe with a red crest, white cape (2026-10-15 polish) | — |
| Dr. Wheelo (p.219) | dark teal bio-mech body, glass dome with the brain in the chest, lavender joints, long claws, tail (2026-10-15 polish) | — |
| Tapion (p.225) | orange spiked hair, gold brow plate, pointed ears, gold coat over green, teal scarf, sword and red scabbard | (2026-10-15: the ocarina a clay egg with its mouthpiece and holes, hung at the belt over the coat — it was a box under it) |
| Hirudegarn (p.226) | olive shell, purple segmented limbs, red crest with two black horns, black segmented tail; wing cases and glassy wings; giant scale (2026-10-15 polish) | (the wings move, 2026-10-15) |
| Zamasu (p.234) | green skin, white crest, pointed ears, earrings, dark robe with wide square gold-edged shoulders, purple sleeves, pale blue sash falling down the front, blue trousers, white boots (2026-10-15 polish) | hair is a crest, not a swoop |
| Future 17 / 18 (p.231–232) | 17: long black hair, scarf, dark shirt, white sleeves, belt with holster, jeans; 18: shoulder-length blonde hair, denim jacket, striped shirt, jeans, brown boots (stripes 2026-10-15) | — |
| SSJ4 Goku / Vegeta / Gogeta (p.77–80) | red fur over arms and back with the chest bare, fur strokes and ragged edges (2026-10-15 polish), gold eyes in red rims (Goku), Vegeta's and Gogeta's manes, sashes, trousers and tails as the board | see *Quality levels* |
| Baby Vegeta (p.81) | silver upswept hair, red marks, navy suit, white chest plate, gold-and-red pads, gold gloves and boots | — |
| Super 17 (p.82) | long black hair to the waist, orange scarf with its knot, navy top under brown straps with gold chest bands, X buckle, yellow forearm bands, silver gloves with red palm gems, torn jeans, navy boots with gold tips (2026-10-15 polish) | — |
| Omega Shenron (p.84) | white body, blue belly / throat / groin, seven gems, horns swept back, black spikes on shoulders, back, knees and neck, talons, red eyes (2026-10-15 polish) | (the board shows none) |

Earlier in the same session (from the board's notes and in-game comparison): Frieza's final forms, Vegeta's
hairline, Androids 16 / 17 / 18, King Cold's face, Mecha Frieza and Frost's domes (see `STATUS.md`).
