---
name: dbzvisskill
description: Dragon Ball Z/Super anime animation and VFX rules for Saiyan Legacy (Shintani/Yamamuro-style dynamics). Use when adding or tuning poses, hit impact, auras, teleports, sword/strike trails, camera shake or ki-charge effects.
---

# Dragon Ball anime animation & VFX

Keep the anime feel of skeleton animation and Three.js particle effects. Reuse existing systems; do not add parallel ones.

## Rules
1. **Stepped keys, no easing** for aura pops, vanishing/teleport flashes and strike wind-ups. Use linear or held values on bone rotations, not smooth interpolation.
2. **Hit-stop** on heavy hits: freeze attacker and target 3-5 frames (0.05-0.08 s) while the camera gets a small shake. Respect the player settings `hitStop` and `shake` (`src/core/settings.js`, both 0-1 sliders) - scale by them, never bypass.
3. **Smear frames** on fast swings (Trunks' sword, Sword of Hope): do not stretch bones. Spawn a procedural stretched mesh strip along the motion axis.
4. **Ki-charge aura scale**: aura size follows the fighter's ki. At max charge, triple `vfx.specks` density and darken the scene mood.

## Real names in this codebase (verified)
- Per-fighter hit-stop: fighter `freeze` (see `src/data/missions/u6_kit.js`, `u6_hit.js`).
- Camera shake: `b.cameraTraumaAt(point, amount)`; cinematic steps use `shake: 0..1` (`src/data/characters/cell.js`).
- Particles: `b.vfx.specks.emit(...)` (`src/render/vfx.js`; example `src/data/missions/bb_gogeta.js:296`). Aura class: `Aura` in `src/render/vfx.js`. Toon materials: `src/render/toon.js`.
- Scene mood: cinematic step `mood: [intensity, color, ...]` (see `broly_z.js`). Check there before inventing an ambient setter.
- Not found in code, do not assume: `animation.pause()`, `CameraRig.shake`, `world.ambientIntensity`.

## Workflow
Read one existing consumer of the effect first, extend it, and verify with the checks in `HANDOFF.md` -> `## How To Test`.
