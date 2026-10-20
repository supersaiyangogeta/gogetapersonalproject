/*
 * CHAPTER 18 · UNIVERSE 6 — Round 5: "Iron and Magma" (Vegeta vs Magetta).
 * Owner's combat storyboard row 5: SCALE → HEAT + LAVA → FINAL FLASH → TEARS + RING-OUT.
 *
 *   OPEN *    (scene u6r5_open)  the scale: Super Saiyan Vegeta up to Magetta's chest; steam from the stack
 *   FURNACE * (play)             a real fight with readable pressure: Magetta's mouth glows (a red ring on the ring
 *                                where it will land) and he spits MAGMA — the pool burns while you stand in it. After
 *                                three spits he OVERHEATS: steam roars out of his stack and he takes heavy damage for a
 *                                few seconds — that is the opening. A knockout or ring-out is a DEFEAT (retry). Ends on
 *                                his story floor
 *   FLASH     (struggle)         his magma stream against the FINAL FLASH: mash to push it back (Mission.struggle);
 *                                the flash wins and Magetta reels, scorched and smoking
 *   TEARS     (staged + cue)     Vegeta's words — "a pile of scrap" — land; the steel giant's eyes run (the storyboard's
 *                                TEARS: his weakness established first), he sags back; one push (Heavy) and over the edge
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const UK = () => SL.data.u6Kit;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';
  // TUNING: magma timing and burn, the overheat window, story floor and damage
  const TU = {
    spitEvery: 5.5, tell: 1.1, poolSeconds: 6, poolRadius: 2.4, burnPerSec: 520, spitsToOverheat: 3,
    ventSeconds: 4, ventTaken: 2.6, baseTaken: 0.55, floor: 0.4, magettaDealt: 0.5,
  };

  SL.data.scenes.u6r5_open = {
    id: 'u6r5_open',
    cast: (m) => SL.data.brolyKit.cast(m),
    music: { song: 'battle', level: 1 },
    auraCap: 0,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K.place(S.vegeta, UK().at(b, UK().RING.a), Math.PI);
          K.place(S.magetta, UK().at(b, UK().RING.c), 0);
          K.faceTo(S.vegeta, S.magetta.pos);
          K.faceTo(S.magetta, S.vegeta.pos);
          K.toForm(S.vegeta, 'ssj');
          // the storyboard's SCALE: low behind Vegeta, the steel giant towering over him
          ctx.m.shot((t, o) => {
            const d = S.magetta.pos.clone().sub(S.vegeta.pos).setY(0).normalize();
            o.pos.copy(S.vegeta.pos).addScaledVector(d, -3.2).add(new V3(1.2, 0.5, 0));
            o.look.copy(S.magetta.headPos ? S.magetta.headPos() : S.magetta.chest());
            o.fov = 50;
          }, 3.7, { cut: true, blendIn: 0 });
        },
        tick: (ctx, s) => {
          if (Math.round(s * 60) % 24 === 0) {
            const mg = ctx.cast.magetta;
            ctx.b.vfx.dust((mg.headPos ? mg.headPos() : mg.chest()).add(new V3(0, 0.5, 0)), 0.6, 4, 0xd8d8e0);
          }
        },
        title: { chapter: CHAPTER, title: 'IRON AND MAGMA', subtitle: 'Round 5 · Vegeta vs Magetta', duration: 3.6 },
        hold: 3.7,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'A walking furnace. Fine — let\'s see if you melt.', duration: 2.8 },
        hold: 2.9,
      },
      {
        cam: { subject: 'magetta', focus: 'upper', angle: 'low' },
        say: { who: 'magetta', line: '...', duration: 1.6 },
        hold: 1.7,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.cast;
      K.place(S.vegeta, UK().at(b, UK().RING.a), Math.PI);
      K.place(S.magetta, UK().at(b, UK().RING.c), 0);
      K.toForm(S.vegeta, 'ssj');
    },
  };

  /** A molten pool on the ring: a glowing disc that burns whoever stands in it. Returns { pos, until, dispose }. */
  function pool(b, at) {
    const geo = new THREE.CircleGeometry(TU.poolRadius, 24);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.85, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(at).add(new V3(0, 0.05, 0));
    b.scene.add(mesh);
    return {
      pos: at.clone(), until: b.frame + TU.poolSeconds * 60, mesh,
      dispose() {
        if (mesh.parent) mesh.parent.remove(mesh);
        geo.dispose();
        mat.dispose();
      },
    };
  }

  function stage(m, place) {
    const b = m.battle, S = b.story;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    UK().ring(m, { place });
    K.toForm(S.vegeta, 'ssj');
  }

  const P = {};
  P.open = { id: 'open', checkpoint: true, run: function* (m) {
    stage(m, true);
    yield* SL.Cinema.play(m, 'u6r5_open');
  } };

  /** The furnace: magma spits with a tell, burning pools, and the overheat window. */
  P.furnace = { id: 'furnace', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, mg = S.magetta;
    stage(m, true);
    v.hp = v.hpMax;
    v.ki = Math.max(v.ki, v.kiMax * 0.6);
    mg.hp = mg.hpMax;
    const sf = m.storyFight({ floors: [{ f: mg, at: TU.floor }], dealt: [{ f: mg, mul: TU.magettaDealt }], taken: [{ f: mg, mul: TU.baseTaken }] });
    m.title(CHAPTER, 'ROUND 5', 'Super Saiyan Vegeta vs Magetta', 2.4);
    m.objective('fight', 'Watch for the glow, stay out of the magma — hit him when he vents', { icon: 'fist' });
    m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
    const pools = [];
    const clear = () => {
      for (const p of pools.splice(0)) p.dispose();
    };
    m.onDispose(clear);
    let t = 0, next = TU.spitEvery, spits = 0, aim = null, tellUntil = 0, ventUntil = 0, said = 0;
    const hook = () => {
      if (b.inputLocked) return;
      t += 1 / 60;
      const mouth = () => (mg.headPos ? mg.headPos() : mg.chest()).addScaledVector(mg.forward, 0.3);
      // venting: steam roars from the stack, he is open
      if (b.frame < ventUntil) {
        if (b.frame % 4 === 0) b.vfx.dust((mg.headPos ? mg.headPos() : mg.chest()).add(new V3(0, 0.6, 0)), 1, 6, 0xeeeef4);
        mg.damageTakenMul = TU.ventTaken;
        return;
      }
      mg.damageTakenMul = TU.baseTaken;
      // the tell: his mouth glows, a red ring where it will land
      if (!aim && t >= next) {
        aim = v.pos.clone();
        aim.y = b.stage.heightAt(aim.x, aim.z);
        tellUntil = b.frame + TU.tell * 60;
        b.emit('telegraph', { pos: aim.clone(), radius: TU.poolRadius, frames: TU.tell * 60 });
        b.vfx.ring(aim.clone().add(new V3(0, 0.1, 0)), TU.poolRadius, 0xff3a1a, TU.tell, new V3(0, 1, 0));
      }
      if (aim && b.frame % 5 === 0) b.vfx.flash(mouth(), 0.6, 0xff7a2a, 0.15, SL.Toon.tex.glow);
      if (aim && b.frame >= tellUntil) {
        // the spit: a stream of magma from his mouth to the mark, and the pool
        b.vfx.slash(mouth(), aim.clone().add(new V3(0, 0.3, 0)), 0xff7a1a, 0.4, 0.25);
        b.vfx.explosion(aim.clone().add(new V3(0, 0.4, 0)), 0.8, 0xff7a2a, { smoke: true });
        b.sfx('explosionSmall', mg, { pitch: 0.7 });
        pools.push(pool(b, aim));
        aim = null;
        spits++;
        next = t + TU.spitEvery;
        if (spits % TU.spitsToOverheat === 0) {
          ventUntil = b.frame + TU.ventSeconds * 60 + 40;
          b.after(40, () => b.sfx('kiUp', mg, { pitch: 0.5 }));
          m.say('vegeta', said++ ? 'Venting again — NOW!' : 'He\'s overheating — the steam! Hit him now!', 2.2, { style: 'shout' });
        }
      }
      // the pools burn and fade
      for (const p of pools.slice()) {
        if (b.frame > p.until) {
          p.dispose();
          pools.splice(pools.indexOf(p), 1);
          continue;
        }
        p.mesh.material.opacity = 0.85 * Math.min(1, (p.until - b.frame) / 60);
        if (b.frame % 8 === 0) b.vfx.sparks(p.pos.clone().add(new V3(U.rand(-1, 1), 0.2, U.rand(-1, 1))), 0xff9a3a, 2, 2, 0.08);
        if (v.pos.distanceTo(p.pos) < TU.poolRadius && v.pos.y - p.pos.y < 1) {
          v.hp = Math.max(1, v.hp - TU.burnPerSec / 60);
          if (b.frame % 12 === 0) b.vfx.flash(v.pos.clone().add(new V3(0, 0.4, 0)), 0.8, 0xff6a1a, 0.15, SL.Toon.tex.glow);
        }
      }
    };
    m.tickHooks.push(hook);
    const r = yield* UK().bout(m, { ringOut: [v], ai: { aggression: 0.5 }, during: () => (sf.floored(mg) ? { pause: true, how: 'story' } : null) });
    K.unhook(m, hook);
    clear();
    sf.off();
    mg.damageTakenMul = 1;
    if (m.state !== 'running' || !r.pause) return;
    m.complete('fight');
    m.complete('ring');
  } };

  /** The storyboard's FINAL FLASH: his magma stream against Vegeta's beam; mash to push it back. */
  P.flash = { id: 'flash', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, mg = S.magetta;
    stage(m, false);
    v.controller = K.scripted();
    mg.controller = K.scripted();
    K.place(v, UK().at(b, [0, 7]), 0);
    K.place(mg, UK().at(b, [0, -6]), 0);
    K.faceTo(v, mg.pos);
    K.faceTo(mg, v.pos);
    v.setState('scripted', { pose: 'v_finalFlashCharge', expression: 'shout' });
    mg.setState('scripted', { pose: 'mg_idle', expression: 'angry' });
    m.say('vegeta', 'Take this... FINAL FLASH!', 2, { style: 'shout' });
    const hand = () => (v.handPos ? v.handPos('R') : v.chest());
    const mouth = () => (mg.headPos ? mg.headPos() : mg.chest()).addScaledVector(mg.forward, 0.3);
    m.shot((t, o) => {
      const mid = hand().lerp(mouth(), 0.5);
      o.pos.copy(mid).add(new V3(11, 2, 0));
      o.look.copy(mid);
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    v.setState('scripted', { pose: 'beamFire', expression: 'shout' });
    let k = 0.5;
    const draw = () => {
      const a = hand(), c = mouth();
      const meet = a.clone().lerp(c, U.clamp(k, 0.1, 0.9));
      if (b.frame % 2 === 0) {
        b.vfx.slash(a, meet, 0xfff27a, 0.1, 0.35);
        b.vfx.slash(c, meet, 0xff6a1a, 0.1, 0.3);
        b.vfx.flash(meet, 1.4, 0xffe0a0, 0.1, SL.Toon.tex.glow);
      }
      b.camera.trauma = Math.max(b.camera.trauma, 0.15);
    };
    m.tickHooks.push(draw);
    b.sfx('beamFire', v, { pitch: 0.9, vol: 1.2 });
    const res = yield* m.struggle({
      start: 0.5, drain: 0.12, duration: 12, label: 'FINAL FLASH — push it back!',
      until: (t, grip) => grip >= 0.98,
      onTick: (t, grip) => (k = 0.25 + grip * 0.7),
    });
    K.unhook(m, draw);
    m.qteParts.push(res.avg);
    // the flash wins: Magetta reels, scorched and smoking
    b.vfx.explosion(mouth(), 2.2, 0xfff0a0, { smoke: true });
    b.sfx('explosionBig', mg);
    mg.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 14 });
    K.place(mg, UK().at(b, [0, -10]), 0);
    b.cameraTraumaAt(mg.chest(), 0.7);
    m.lock(true);
    yield* m.cine(1.2);
    m.endShot();
  } };

  /** TEARS + RING-OUT: the weakness first, then the push. */
  P.tears = { id: 'tears', run: function* (m) {
    const b = m.battle, S = b.story, v = S.vegeta, mg = S.magetta;
    stage(m, false);
    const st = UK().staged(m);
    v.controller = K.scripted();
    mg.controller = K.scripted();
    if (UK().edgeDist(mg) > 6) K.place(mg, UK().at(b, [0, -10]), 0);
    K.place(v, K.ground(b, mg.pos.clone().add(new V3(0, 0, 2.6))), 0);
    K.faceTo(v, mg.pos);
    K.faceTo(mg, v.pos);
    mg.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
    v.setState('scripted', { pose: 'armsCrossed', expression: 'cocky' });
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Look at you. A pile of scrap that leaks steam. Somebody should melt you down for spare parts.', 3.6);
    yield* st.wait(3.6);
    // the storyboard's TEARS: the giant's yellow eyes run
    SL.Cinema.shotOn(m, S, { subject: 'magetta', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
    const tears = () => {
      if (b.frame % 6 === 0) {
        const h = mg.headPos ? mg.headPos() : mg.chest();
        for (const s of [-1, 1]) b.vfx.trail(h.clone().addScaledVector(mg.forward, 0.18).add(new V3(s * 0.08 * Math.cos(mg.yaw), -0.05 - Math.random() * 0.2, -s * 0.08 * Math.sin(mg.yaw))), 0x7ac8ff, 0.06, 0.6);
      }
    };
    m.tickHooks.push(tears);
    mg.setState('scripted', { pose: 'stagger', expression: 'sad', speed: 3 });
    b.sfx('kiUp', mg, { pitch: 0.4, vol: 0.5 });
    yield* st.wait(2.4);
    SL.Cinema.shotOn(m, S, { subject: 'whis', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('whis', 'Oh dear. I believe he\'s... crying. Metalmen are rather sensitive.', 3);
    yield* st.wait(3);
    // the push
    SL.Cinema.shotOn(m, S, { subject: 'vegeta', with: 'magetta', focus: 'full', angle: 'side' }, 999, { cut: true, blendIn: 0, hold: true });
    v.setState('scripted', { pose: 'v_gutW', expression: 'cold', speed: 14 });
    const r = yield* st.cue('heavy', 'Push him out (Heavy)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    v.setState('scripted', { pose: 'v_gut', expression: 'cold', speed: 28 });
    b.vfx.impact(mg.chest(), 2, 0xffe27a);
    b.sfx('punchHeavy', mg, { pitch: 0.6 });
    yield* UK().ringOutTo(m, mg, mg.pos.clone().sub(v.pos), { height: 1.5, ms: 1200, pose: 'tumble' });
    K.unhook(m, tears);
    mg.setState('scripted', { pose: 'knockdown', expression: 'sad' });
    v.setState('scripted', { pose: 'armsCrossed', expression: 'cold' });
    b.emit('matchEnd', { winner: v, loser: mg, how: 'ringout' });
    yield* SL.Tournament.announce(m, 'ringout', { winner: v, loser: mg }, { seconds: 3 });
    SL.Cinema.shotOn(m, S, { subject: 'champa', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
    K.watcher(S.champa, 'ch6_shout', 'angry');
    m.say('champa', 'Three down?! Cabba! You\'re up — and don\'t you dare lose!', 3, { style: 'shout' });
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
    yield* UK().close(m, CHAPTER, 'ROUND 5 · VEGETA WINS');
  } };

  SL.data.u6Magetta = { TU };
  SL.data.missions.u6_magetta = {
    id: 'u6_magetta', canon: true, chapter: CHAPTER, title: 'Iron and Magma', character: 'vegeta', stage: 'u6_arena',
    subtitle: 'Universe 6 tournament · Round 5 · Vegeta vs Magetta', parTime: 480, qteLabel: 'The flash',
    blurb: 'Universe 6 sends out a Metalman built like a furnace. Vegeta needs a way to beat something that spits magma.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' } },
    lockForms: { vegeta: SL.data.characters.vegeta.forms.filter((x) => !['base', 'ssj'].includes(x.id)).map((x) => x.id) },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Vegeta clears the way to Cabba'],
    setup: (b) => SL.data.u6Kit.setup(b, 'vegeta', 'magetta'),
    phases: [P.open, P.furnace, P.flash, P.tears],
  };
})();
