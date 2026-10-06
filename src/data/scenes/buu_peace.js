/*
 * SCENES — Chapter 15: "Peace" (the end of the Buu Saga, the owner's epilogue brief and beat sheet, 2026-10-03).
 *
 *   pe_quiet     the Sacred World after the Super Spirit Bomb: smoke and embers over the glassed crater, the
 *                wind; Goku sitting where his legs gave out, laughing without breath, trying to stand and
 *                sitting straight back down; Mr. Satan: "Is it... over?"; Kai Kai — the Kais and Dende;
 *                Dende's run across the scorched ground (a low tracking lens); the green light on Vegeta
 *   pe_heal      Vegeta's eyes snap open; he comes up off his back gasping; "You took your time"; Goku
 *                won't be healed before Buu; the fat one wakes up hungry
 *   pe_crisis    Vegeta's palm comes up at the fat one; Mr. Satan throws himself over him, weeping; the
 *                player's cue — Goku's hand on the wrist, the arm brought down; "Vegeta, let it go..." /
 *                "Hmph. Do whatever you want."; Mr. Satan bawling, Buu laughing at his face
 *   pe_rivals    sunset at the crater's rim: "Thanks." / "...For what?" / "For that minute."; "Don't get
 *                used to it, Kakarot..."; a hand up — and the prince hauls him to his feet, lets go at once
 *   pe_home      Kami's Lookout: Instant Transmission home; Chi-Chi's arms round his neck; Bulma's round a
 *                stiff, red-faced prince; fists in the air; Piccolo's small smile; cake for Buu
 *   pe_memory    the Dragon Balls; the sky goes dark; Shenron; "erase the memory of Majin Buu..."; the
 *                light over the planet; Mr. Satan's idea; MISTER BUU
 *   pe_world     the Earth given back: a dawn street, people coming back into it one soft light at a time, a
 *                mother and her child; the plaza chanting SA-TAN; Dende watching from the Lookout's edge
 *   pe_sense     night on the Lookout, Goku alone at the edge; something, far to the south; a hut in a
 *                village at the end of the world, a mother, a newborn, a breath of pink light;
 *                "...I'll be waiting."; on his back under the stars
 *
 * Show, don't tell: no line says "reincarnation". The farewell said "come back as someone good"; the
 * player sees the rest.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const EK = () => SL.data.endzKit;
  const K = () => SL.data.buuKit;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const gy = (b, x, z) => SL.Staging.groundY(b, x, z);
  const at = (b, x, z, lift = 0) => new V3(x, gy(b, x, z) + lift, z);
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));
  let RNG = null;
  const rnd = () => (RNG || (RNG = SL.util.mulberry32(774)))();

  /* ---------------------------------------------------------------- places (the Sacred World after the bomb) */
  const PC = (SL.data.peace = {
    C: new V3(0, 0, -4), // the crater's middle
    RIM: new V3(4.5, 0, 7.5), // where Goku's legs gave out
    VEG: new V3(-9.6, 0, 8.4), // Vegeta on his back beside the outcrop
    SAT: new V3(-11.4, 0, 9.8), // Mr. Satan against the rock
    FAT: new V3(-6.6, 0, 11.2), // Good Buu asleep in the grass
    ARRIVE: new V3(-1.5, 0, 3.8), // where the Kai Kai sets them down
    SEAT: new V3(10, 0, 5.5), // the rock on the rim at sunset
    LOOK: new V3(0, 0, 3), // the Lookout: where Instant Transmission puts them down
    /** The glassed crater the Super Spirit Bomb left (on top of the Spirit Bomb chapter's field). */
    scar(b) {
      const st = b.stage;
      if (!st.hasGround || st.__peaceScar) return;
      st.__peaceScar = true;
      if (st.crater) st.crater(PC.C, 12, 3.2, null);
    },
  });

  /* ---------------------------------------------------------------- small effects */
  /** Grey smoke rising out of the crater, and embers. */
  function smoke(ctx, spread = 9) {
    const b = ctx.b;
    if (b.frame % 7 === 0) {
      const a = rnd() * Math.PI * 2, d = rnd() * spread;
      const p = new V3(PC.C.x + Math.cos(a) * d, 0, PC.C.z + Math.sin(a) * d);
      p.y = gy(b, p.x, p.z) + 0.4;
      b.vfx.dust(p, 2.4, 2, 0x5c5a62);
    }
    if (b.frame % 5 === 0) {
      const p = new V3(PC.C.x + (rnd() - 0.5) * spread * 2, 0, PC.C.z + (rnd() - 0.5) * spread * 2);
      p.y = gy(b, p.x, p.z) + rnd() * 3;
      b.vfx.trail(p, rnd() < 0.6 ? 0xffc870 : 0xff8a4a, 0.1, 1.6);
    }
  }
  /** Dende's green light on somebody: soft motes rising off the body, a slow glow. */
  function healGlow(ctx, f) {
    const b = ctx.b;
    if (!f || f.hidden) return;
    const c = f.chest();
    if (b.frame % 3 === 0) b.vfx.trail(c.clone().add(new V3((rnd() - 0.5) * 0.7, rnd() * 0.4, (rnd() - 0.5) * 0.7)), 0x8aff9a, 0.16, 0.6);
    if (b.frame % 24 === 0) b.vfx.flash(c, 1.6, 0x6aff8a, 0.4, SL.Toon.tex.glow);
  }
  /** Gold gathering in a palm (Vegeta's right hand). */
  function palmKi(ctx, f, big) {
    const b = ctx.b, j = f.model.joints.handR;
    if (!j) return;
    f.model.root.updateMatrixWorld(true);
    const p = j.getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
    if (b.frame % 3 === 0) b.vfx.sparks(p, 0xffe27a, big ? 4 : 2, big ? 5 : 3, 0.06);
    if (b.frame % 10 === 0) b.vfx.flash(p, big ? 0.9 : 0.55, 0xffd84a, 0.2, SL.Toon.tex.glow);
  }

  /* ================================================================================ THE QUIET */
  S.pe_quiet = {
    id: 'pe_quiet',
    cast,
    music: { song: 'aftermath', level: 0 },
    clearMood: false,
    events: [
      // the crater from high and far: smoke going straight up out of it, nothing moving
      {
        call: (ctx) => pt(ctx, 'crater', at(ctx.b, PC.C.x, PC.C.z)),
        cam: { from: { at: 'crater', off: [30, 16, -32] }, to: { at: 'crater', off: [36, 19, -38] }, look: { at: 'crater', off: [-4, 1, 6] }, fov: 50, raw: true },
        sfx: { name: 'wind', vol: 0.6 },
        tick: (ctx) => smoke(ctx),
        hold: 4.4,
      },
      // the outcrop: Mr. Satan slumped against the rock beside the prince on his back, the fat one asleep in the grass
      {
        cam: { subject: 'satan', with: 'vegeta', focus: 'full' },
        tick: (ctx) => smoke(ctx),
        hold: 3,
      },
      // the rim: where his legs gave out
      {
        pose: [{ who: 'goku', pose: 'pe_slumpSit', face: 'soft', speed: 2 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three', side: -1 },
        tick: (ctx) => smoke(ctx),
        hold: 2.6,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'Heh... heh heh...', duration: 2.2, style: 'quiet' },
        hold: 2.6,
      },
      // he tries to get up...
      {
        pose: [{ who: 'goku', pose: 'pe_tryStand', face: 'grit', speed: 3 }],
        cam: { subject: 'goku', focus: 'medium', angle: 'low' },
        hold: 1.5,
      },
      // ...and sits straight back down, grinning about it
      {
        pose: [{ who: 'goku', pose: 'pe_slumpSit', face: 'grin', speed: 9 }],
        vfx: { kind: 'dust', at: 'goku:feet', radius: 1, count: 6 },
        cam: { subject: 'goku', focus: 'medium', angle: 'low' },
        say: { who: 'goku', line: 'Whoa... Nope. Not yet.', duration: 2.2, style: 'quiet' },
        hold: 2.6,
      },
      // Mr. Satan looking round at a world with nobody trying to kill him in it
      {
        pose: [{ who: 'satan', pose: 'pe_satanSit', face: 'shock', speed: 3 }],
        cam: { subject: 'satan', focus: 'closeup', angle: 'front' },
        say: { who: 'mr_satan', line: 'Is it... over? Is it really over?', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // Kai Kai: the Kais, and Dende
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const A = PC.ARRIVE;
          for (const [f, dx, dz] of [[st.dende, 0, 0], [st.kai, 1.4, -0.9], [st.elder, -1.3, -1]]) {
            f.setHidden(false);
            ctx.m.space(f, 'ground', { pos: new V3(A.x + dx, 0, A.z + dz), face: st.goku.pos });
          }
          EK().kaiKai(b, [st.dende, st.kai, st.elder]);
        },
        pose: [
          { who: 'dende', pose: 'idle', face: 'shock' },
          { who: 'kai', pose: 'idle', face: 'calm' },
          { who: 'elder', pose: 'idle', face: 'calm' },
        ],
        cam: { subject: 'dende', with: 'kai', focus: 'full' },
        say: { who: 'dende', line: 'Goku-san! Vegeta-san!', duration: 1.8, style: 'shout' },
        hold: 2.1,
      },
      {
        cam: { subject: 'elder', focus: 'upper', angle: 'three' },
        say: { who: 'elder_kai', line: 'Hmph. Well, I\'ll be. They actually pulled it off.', duration: 3 },
        hold: 3.2,
      },
      // DENDE'S RUN: a low lens tracking beside him across the scorched ground to the prince
      {
        call: (ctx) => {
          const v = story(ctx).vegeta;
          pt(ctx, 'healAt', v.chest().clone().setY(0).add(new V3(1.1, 0, -0.5)));
          faceTo(story(ctx).dende, v.pos);
        },
        pose: [{ who: 'dende', pose: 'run', face: 'shout', speed: 1.3 }],
        cam: { subject: 'dende', focus: 'full', angle: 'side', dist: 4.4, height: -0.3, fov: 50 },
        tick: (ctx) => {
          const b = ctx.b, d = story(ctx).dende;
          if (b.frame % 6 === 0) b.vfx.dust(d.pos.clone().add(new V3(0, 0.15, 0)), 0.5, 2, 0x6a6a5a);
        },
        move: { who: 'dende', at: 'healAt', seconds: 2.8, ease: 'linear', face: 'vegeta' },
      },
      // palms out over the prince's chest: the green light
      {
        call: (ctx) => faceTo(story(ctx).dende, story(ctx).vegeta.chest()),
        pose: [{ who: 'dende', pose: 'pe_heal', face: 'calm', speed: 3 }],
        cam: { subject: 'dende', with: 'vegeta', focus: 'full' },
        sfx: { name: 'kiUp', who: 'dende', vol: 0.4, pitch: 1.4 },
        tick: (ctx) => healGlow(ctx, story(ctx).vegeta),
        hold: 2.4,
      },
    ],
    end(ctx) {
      const st = story(ctx), A = PC.ARRIVE;
      for (const [f, dx, dz] of [[st.kai, 1.4, -0.9], [st.elder, -1.3, -1]]) {
        f.setHidden(false);
        if (f.pos.distanceTo(new V3(A.x + dx, f.pos.y, A.z + dz)) > 0.5) ctx.m.space(f, 'ground', { pos: new V3(A.x + dx, 0, A.z + dz), face: st.vegeta.pos });
      }
      st.dende.setHidden(false);
      const v = st.vegeta;
      const hp = new V3(v.chest().x + 1.1, 0, v.chest().z - 0.5);
      if (st.dende.pos.distanceTo(new V3(hp.x, st.dende.pos.y, hp.z)) > 0.4) ctx.m.space(st.dende, 'ground', { pos: hp });
      faceTo(st.dende, v.chest());
      st.dende.setState('scripted', { pose: 'pe_heal', expression: 'calm' });
      st.goku.setState('scripted', { pose: 'pe_slumpSit', expression: 'soft' });
      ctx.m.flags.kaisArrived = true;
    },
  };

  /* ================================================================================ THE HEALING */
  S.pe_heal = {
    id: 'pe_heal',
    cast,
    music: { song: 'aftermath', level: 1 },
    clearMood: false,
    events: [
      // the light on him, and nothing — then the eyes
      {
        cam: { subject: 'vegeta', focus: 'closeup' },
        tick: (ctx) => healGlow(ctx, story(ctx).vegeta),
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const v = story(ctx).vegeta;
          if (v.model.setBattered) v.model.setBattered(false);
        },
        pose: [{ who: 'vegeta', pose: 'lieBack', face: 'shock', speed: 20 }],
        cam: { subject: 'vegeta', focus: 'face' },
        sfx: { name: 'kiUp', who: 'vegeta', vol: 0.5, pitch: 1.2 },
        hold: 0.9,
      },
      // up off his back, gasping
      {
        pose: [
          { who: 'vegeta', pose: 'pe_sitUpGasp', face: 'grit', speed: 8 },
          { who: 'dende', pose: 'idle', face: 'soft', speed: 4 },
        ],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Hah...! Hah...!', duration: 1.6, style: 'quiet' },
        hold: 2.1,
      },
      // Goku standing over him (he made it here on his own two feet), grinning
      {
        pose: [{ who: 'goku', pose: 'exhausted', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'full' },
        say: { who: 'goku', line: 'Hey. Welcome back.', duration: 2, style: 'quiet' },
        hold: 2.3,
      },
      {
        pose: [{ who: 'vegeta', pose: 'pe_sitUpGasp', face: 'angry', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...Hmph. You took your time.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'dende', pose: 'idle', face: 'calm', speed: 3 }],
        cam: { subject: 'dende', focus: 'upper', angle: 'three' },
        say: { who: 'dende', line: 'Goku-san, you\'re next — hold still.', duration: 2.4 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'scratchHead', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Nah, I\'m alright. Heal Buu first.', duration: 2.4 },
        hold: 2.6,
      },
      // the fat one in the grass, the green light on his belly
      {
        call: (ctx) => {
          const st = story(ctx), f = st.fat;
          const p = f.chest().clone().setY(0).add(new V3(-1.2, 0, -0.4));
          ctx.m.space(st.dende, 'ground', { pos: p });
          faceTo(st.dende, f.chest());
        },
        pose: [{ who: 'dende', pose: 'pe_heal', face: 'calm', speed: 3 }],
        cam: { subject: 'fat', with: 'dende', focus: 'full' },
        tick: (ctx) => healGlow(ctx, story(ctx).fat),
        hold: 2.4,
      },
      // one eye, then the other
      {
        pose: [{ who: 'fat', pose: 'bu_sit', face: 'calm', speed: 4 }],
        cam: { subject: 'fat', focus: 'upper', angle: 'front' },
        say: { who: 'majin_buu', line: '...Buu... hungry.', duration: 2.2, style: 'quiet' },
        hold: 2.5,
      },
      // Mr. Satan on his feet and running over
      {
        call: (ctx) => pt(ctx, 'bySatan', story(ctx).fat.pos.clone().add(new V3(-1.6, 0, 0.9))),
        pose: [{ who: 'satan', pose: 'run', face: 'grin', speed: 1.3 }],
        cam: { subject: 'satan', focus: 'full', angle: 'three' },
        say: { who: 'mr_satan', line: 'BUU! You\'re okay!', duration: 1.8, style: 'shout' },
        move: { who: 'satan', at: 'bySatan', seconds: 1.4, face: 'fat' },
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.vegeta.model.setBattered) st.vegeta.model.setBattered(false);
      st.vegeta.setState('scripted', { pose: 'pe_sitUpGasp', expression: 'angry' });
      st.fat.setState('scripted', { pose: 'bu_sit', expression: 'calm' });
      st.dende.setState('scripted', { pose: 'idle', expression: 'calm' });
      st.goku.setState('scripted', { pose: 'exhausted', expression: 'grin' });
      const p = st.fat.pos.clone().add(new V3(-1.6, 0, 0.9));
      if (st.satan.pos.distanceTo(new V3(p.x, st.satan.pos.y, p.z)) > 0.4) ctx.m.space(st.satan, 'ground', { pos: p });
      faceTo(st.satan, st.fat.pos);
      st.satan.setState('scripted', { pose: 'idle', expression: 'grin' });
      ctx.m.flags.healed = true;
    },
  };

  /* ================================================================================ THE FAT BUU CRISIS */
  S.pe_crisis = {
    id: 'pe_crisis',
    cast,
    music: { song: 'mystery', level: 1 },
    clearMood: false,
    events: [
      // on his feet, looking past all of them at the fat one
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.vegeta, 'ground', { pos: st.vegeta.pos.clone(), face: st.fat.pos });
        },
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 4 }],
        cam: { subject: 'fat', angle: 'ots', over: 'vegeta', focus: 'full' },
        hold: 2.3,
      },
      // the palm comes up; the gold gathers in it
      {
        pose: [{ who: 'vegeta', pose: 'pe_palmAim', face: 'angry', speed: 6, aura: 0.5 }],
        cam: { subject: 'vegeta', focus: 'medium', angle: 'three', side: -1 },
        sfx: { name: 'kiUp', who: 'vegeta', vol: 0.6 },
        say: { who: 'vegeta', line: 'Step aside. That thing is still Majin Buu.', duration: 2.8 },
        tick: (ctx) => palmKi(ctx, story(ctx).vegeta, false),
        hold: 3,
      },
      // Mr. Satan throws himself over him
      {
        call: (ctx) => {
          const st = story(ctx), f = st.fat, v = st.vegeta;
          const d = v.pos.clone().sub(f.pos).setY(0).normalize();
          ctx.m.space(st.satan, 'ground', { pos: f.pos.clone().addScaledVector(d, 1.1), face: v.pos });
          if (st.satan.setRage) st.satan.setRage(true, 0.3);
        },
        pose: [
          { who: 'satan', pose: 'pe_shieldBuu', face: 'hurt', speed: 10 },
          { who: 'fat', pose: 'bu_sit', face: 'shock', speed: 6 },
        ],
        cam: { subject: 'satan', focus: 'upper', angle: 'front' },
        say: { who: 'mr_satan', line: 'No! Don\'t kill him! He helped us! He fought against the bad Buu!', duration: 3.6, style: 'shout' },
        tick: (ctx) => palmKi(ctx, story(ctx).vegeta, false),
        hold: 3.8,
      },
      {
        cam: { subject: 'fat', focus: 'closeup', angle: 'three' },
        say: { who: 'majin_buu', line: 'Mister... Satan...', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      // the glare; the gold brighter
      {
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        tick: (ctx) => palmKi(ctx, story(ctx).vegeta, true),
        hold: 1.6,
      },
      // THE PLAYER: Goku's hand
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'full' },
        tick: (ctx) => palmKi(ctx, story(ctx).vegeta, true),
        cue: { key: 'guard', label: 'Stop Vegeta', auto: 5 },
      },
      // the hand on his wrist, the arm brought down
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, g = st.goku;
          const fwd = v.forward.clone().setY(0).normalize();
          const right = new V3(fwd.z, 0, -fwd.x);
          ctx.m.space(g, 'ground', { pos: v.pos.clone().addScaledVector(right, -0.75).addScaledVector(fwd, 0.15), face: v.chest() });
          v.setState('scripted', { pose: 'pe_armLowered', expression: 'angry', aura: 0 });
          if (v.aura) v.aura.target = 0;
        },
        pose: [
          { who: 'goku', pose: 'pe_wristLower', face: 'calm', speed: 4 },
          { who: 'vegeta', pose: 'pe_armLowered', face: 'angry', speed: 3, aura: 0 },
        ],
        cam: { subject: 'goku', with: 'vegeta', focus: 'upper' },
        say: { who: 'goku', line: 'Vegeta, let it go. Without Buu and Satan, we never would have won this fight. He\'s one of us now.', duration: 5.2 },
        hold: 5.4,
      },
      // the stare
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three', side: -1 },
        hold: 1.8,
      },
      // the sigh, the head turning away
      {
        pose: [{ who: 'vegeta', pose: 'v_turnAway', face: 'calm', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'vegeta', line: 'Hmph. Do whatever you want.', duration: 2.4, style: 'quiet' },
        hold: 2.7,
      },
      // the relief: Mr. Satan bawling into the fat one's belly, Buu laughing
      {
        pose: [
          { who: 'satan', pose: 'pe_shieldBuu', face: 'grin', speed: 4 },
          { who: 'fat', pose: 'bu_laugh', face: 'grin', speed: 5 },
        ],
        cam: { subject: 'satan', with: 'fat', focus: 'full' },
        say: { who: 'mr_satan', line: 'Waaah! Buu! You hear that?! You get to live!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        cam: { subject: 'fat', focus: 'upper', angle: 'front' },
        say: { who: 'majin_buu', line: 'Hee hee! Mister Satan has a funny face!', duration: 2.4 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.satan.setRage) st.satan.setRage(false);
      if (st.vegeta.aura) st.vegeta.aura.target = 0;
      st.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'calm', aura: 0 });
      st.fat.setState('scripted', { pose: 'bu_sit', expression: 'grin' });
      st.satan.setState('scripted', { pose: 'idle', expression: 'grin' });
      st.goku.setState('scripted', { pose: 'stand', expression: 'soft' });
      ctx.m.flags.buuSpared = true;
    },
  };

  /* ================================================================================ TWO RIVALS AT SUNSET */
  S.pe_rivals = {
    id: 'pe_rivals',
    cast,
    music: { song: 'pride', level: 1 },
    events: [
      // the rim, late: the two of them small against the crater and a low sun, a long way apart
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.stage.setMood(0.38, 0xff8a3a, 1.6);
          const seat = at(b, PC.SEAT.x, PC.SEAT.z);
          if (!st.seat) {
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62, 0), SL.Toon.mat(0x8a8a76));
            rock.scale.set(1.2, 0.55, 1);
            SL.Toon.addOutline(rock, 1.4);
            b.scene.add(rock);
            st.seat = rock;
            ctx.m.onDispose(() => rock.parent && rock.parent.remove(rock));
          }
          st.seat.position.copy(seat).add(new V3(0, 0.12, 0));
          st.seat.visible = true;
          ctx.m.space(st.goku, 'ground', { pos: seat, face: PC.C });
          // Vegeta a few steps off along the rim, his back half to him
          const away = at(b, PC.SEAT.x - 1.2, PC.SEAT.z - 4.2);
          ctx.m.space(st.vegeta, 'ground', { pos: away });
          faceTo(st.vegeta, away.clone().add(new V3(-3, 0, -6)));
          pt(ctx, 'pair', seat.clone().lerp(away, 0.5));
        },
        pose: [
          { who: 'goku', pose: 'pe_rockSit', face: 'soft', speed: 2 },
          { who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 2 },
        ],
        cam: { from: { at: 'pair', off: [8, 2.6, 9] }, to: { at: 'pair', off: [9.5, 3, 11] }, look: { at: 'pair', off: [-3, 1, -6] }, fov: 46, subject: 'goku', focus: 'wide' },
        hold: 4,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Hey, Vegeta...', duration: 1.8, style: 'quiet' },
        hold: 2.2,
      },
      // the prince's face, turned away from him
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: '...Thanks.', duration: 1.6, style: 'quiet' },
        hold: 2,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...For what?', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'For that minute. I couldn\'t have done it without you.', duration: 3.2, style: 'quiet' },
        hold: 3.5,
      },
      // nothing for a long moment; then the corner of his mouth
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 1 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        hold: 2.6,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'Don\'t get used to it, Kakarot.', duration: 2.2 },
        hold: 2.5,
      },
      {
        cam: { subject: 'vegeta', angle: 'ots', over: 'goku', focus: 'upper' },
        say: { who: 'vegeta', line: 'Next time, it\'ll be just the two of us. And I\'ll be the one left standing.', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'goku', pose: 'pe_rockSit', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Ha ha! You\'re on!', duration: 2 },
        hold: 2.3,
      },
      // a hand up, to be pulled to his feet
      {
        pose: [{ who: 'goku', pose: 'pe_reachUp', face: 'grin', speed: 5 }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'full' },
        hold: 2.3,
      },
      // the prince looks at the hand
      {
        call: (ctx) => faceTo(story(ctx).vegeta, story(ctx).goku.pos),
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three', side: -1 },
        hold: 1.8,
      },
      // ...takes it, and hauls him up in one pull
      {
        call: (ctx) => {
          const st = story(ctx), g = st.goku, v = st.vegeta;
          const d = v.pos.clone().sub(g.pos).setY(0).normalize();
          const stand = g.pos.clone().addScaledVector(d, 0.4);
          ctx.m.space(g, 'ground', { pos: stand });
          ctx.m.space(v, 'ground', { pos: stand.clone().addScaledVector(d, 1.15), face: stand });
          faceTo(g, v.pos);
          if (st.seat) st.seat.visible = true;
        },
        pose: [
          { who: 'vegeta', pose: 'pe_haul', face: 'smirk', speed: 9 },
          { who: 'goku', pose: 'stand', face: 'grin', speed: 9 },
        ],
        cam: { subject: 'goku', with: 'vegeta', focus: 'full' },
        sfx: { name: 'punchLight', who: 'vegeta', vol: 0.4, pitch: 0.8 },
        hold: 1.5,
      },
      // and lets go at once, and turns away
      {
        call: (ctx) => {
          const v = story(ctx).vegeta;
          faceTo(v, v.pos.clone().add(new V3(-3, 0, -6)));
        },
        pose: [
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 4 },
          { who: 'goku', pose: 'scratchHead', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'goku', with: 'vegeta', focus: 'full' },
        say: { who: 'vegeta', line: 'Hmph.', duration: 1.2 },
        hold: 2.2,
      },
      // side by side, closer than they have ever stood, looking at the same sky
      {
        call: (ctx) => {
          const st = story(ctx), g = st.goku, v = st.vegeta;
          const fwd = v.forward.clone().setY(0).normalize();
          const right = new V3(fwd.z, 0, -fwd.x);
          ctx.m.space(g, 'ground', { pos: v.pos.clone().addScaledVector(right, -1.3) });
          g.yaw = g.prevYaw = v.yaw;
          const mid = g.pos.clone().lerp(v.pos, 0.5);
          pt(ctx, 'two', mid);
          pt(ctx, 'twoLens', mid.clone().addScaledVector(fwd, -6.5).add(new V3(0, 1.7, 0)));
          pt(ctx, 'twoLens2', mid.clone().addScaledVector(fwd, -9).add(new V3(0, 2.4, 0)));
          pt(ctx, 'sky', mid.clone().addScaledVector(fwd, 30).add(new V3(0, 5, 0)));
        },
        pose: [
          { who: 'goku', pose: 'stand', face: 'soft', speed: 2 },
          { who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 2 },
        ],
        cam: { from: { at: 'twoLens' }, to: { at: 'twoLens2' }, look: { at: 'sky' }, fov: 50, raw: true },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.seat) st.seat.visible = false;
      ctx.b.stage.setMood(0, 0xff8a3a, 0.5);
      ctx.m.flags.rivals = true;
    },
  };

  /* ================================================================================ HOME (THE LOOKOUT) */
  const LOOKOUT_CAST = ['chichi', 'bulma', 'gohan', 'videl', 'goten', 'trunks', 'piccolo', 'krillin'];
  const SPOTS = { chichi: [-1, 9], bulma: [2.4, 9.4], gohan: [-2.8, 10.4], videl: [-3.8, 9.6], goten: [-0.4, 10.8], trunks: [0.8, 11], piccolo: [4.4, 10.8], krillin: [3.4, 8.8] };
  /** To the Lookout: everyone who waited there, and the ones Goku brought home (SL.data.peace.toLookout). */
  PC.toLookout = function (m, arrived) {
    const b = m.battle, st = b.story;
    if (b.stage.def.id !== 'lookout') {
      b.changeStage('lookout');
      m.endShot();
    }
    for (const k of Object.keys(st)) if (st[k] && st[k].setHidden) st[k].setHidden(true);
    for (const k of LOOKOUT_CAST) {
      const f = st[k];
      if (!f) continue;
      f.setHidden(false);
      m.space(f, 'ground', { pos: new V3(SPOTS[k][0], 0, SPOTS[k][1]), face: PC.LOOK });
    }
    if (arrived) {
      const L = PC.LOOK;
      for (const [k, dx, dz] of [['goku', 0, 0], ['vegeta', 1.6, -0.6], ['dende', -1.4, -0.4], ['satan', 2.6, -1.8], ['fat', 4.2, -2.2]]) {
        const f = st[k];
        f.setHidden(false);
        m.space(f, 'ground', { pos: new V3(L.x + dx, 0, L.z + dz), face: new V3(0, 0, 10) });
      }
    }
  };

  S.pe_home = {
    id: 'pe_home',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // the Lookout from above: the people who could not go, waiting
      {
        call: (ctx) => PC.toLookout(ctx.m, false),
        pose: [
          { who: 'chichi', pose: 'cc_worried', face: 'sad' },
          { who: 'bulma', pose: 'bu_idle', face: 'sad' },
          { who: 'gohan', pose: 'idle', face: 'calm' },
          { who: 'videl', pose: 'vd_idle', face: 'calm' },
          { who: 'goten', pose: 'gt_idle', face: 'calm' },
          { who: 'trunks', pose: 'kt_idle', face: 'calm' },
          { who: 'piccolo', pose: 'armsCrossed', face: 'calm' },
          { who: 'krillin', pose: 'idle', face: 'calm' },
        ],
        cam: { subject: 'chichi', focus: 'wide', angle: 'high', room: 6 },
        sfx: { name: 'wind', vol: 0.4 },
        hold: 3.2,
      },
      {
        cam: { subject: 'chichi', focus: 'closeup', angle: 'three' },
        say: { who: 'chichi', line: 'Goku...', duration: 1.6, style: 'quiet' },
        hold: 2,
      },
      // INSTANT TRANSMISSION: home
      {
        call: (ctx) => {
          const st = story(ctx);
          PC.toLookout(ctx.m, true);
          for (const k of ['goku', 'vegeta', 'dende', 'satan', 'fat']) EK().instant(ctx.b, st[k]);
        },
        pose: [
          { who: 'goku', pose: 'twoFingers', face: 'grin', speed: 8 },
          { who: 'vegeta', pose: 'armsCrossed', face: 'calm' },
          { who: 'dende', pose: 'idle', face: 'soft' },
          { who: 'satan', pose: 'idle', face: 'shock' },
          { who: 'fat', pose: 'bu_idle', face: 'grin' },
          { who: 'chichi', pose: 'cc_idle', face: 'shock' },
        ],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        hold: 1.6,
      },
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'We\'re back!', duration: 1.6, style: 'shout' },
        hold: 1.9,
      },
      {
        pose: [
          { who: 'goten', pose: 'gt_cheer', face: 'grin', speed: 5 },
          { who: 'trunks', pose: 'kt_cheer', face: 'grin', speed: 5 },
        ],
        cam: { subject: 'goten', with: 'trunks', focus: 'full' },
        say: { who: 'goten', line: 'Dad!! You did it!', duration: 1.8, style: 'shout' },
        hold: 2.1,
      },
      // Chi-Chi runs to him
      {
        call: (ctx) => {
          const g = story(ctx).goku, c = story(ctx).chichi;
          faceTo(g, c.pos);
          pt(ctx, 'toGoku', g.pos.clone().addScaledVector(c.pos.clone().sub(g.pos).setY(0).normalize(), 0.42));
        },
        pose: [{ who: 'chichi', pose: 'run', face: 'sad', speed: 1.2 }],
        cam: { subject: 'chichi', focus: 'full', angle: 'side' },
        move: { who: 'chichi', at: 'toGoku', seconds: 1.3, face: 'goku' },
      },
      // ...and throws her arms round his neck
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.chichi.pos);
          faceTo(st.chichi, st.goku.pos);
          if (st.chichi.setRage) st.chichi.setRage(true, 0.3);
        },
        pose: [
          { who: 'chichi', pose: 'pe_hugNeck', face: 'sad', speed: 6 },
          { who: 'goku', pose: 'pe_hugged', face: 'grin', speed: 6 },
        ],
        cam: { subject: 'goku', with: 'chichi', focus: 'upper' },
        say: { who: 'chichi', line: 'You big dummy... You came back... Waaah!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'Heh heh... Hey, Chi-Chi. I\'m home.', duration: 2.4, style: 'quiet' },
        hold: 2.7,
      },
      // Bulma round a prince who has no idea what to do with his arms
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegeta, bu = st.bulma;
          const p = v.pos.clone().add(new V3(0.2, 0, 0.45));
          ctx.m.space(bu, 'ground', { pos: p });
          faceTo(bu, v.pos);
          faceTo(v, bu.pos);
          if (v.model.setBlush) v.model.setBlush(true);
        },
        pose: [
          { who: 'bulma', pose: 'pe_hugChest', face: 'grin', speed: 6 },
          { who: 'vegeta', pose: 'pe_stiff', face: 'angry', speed: 6 },
        ],
        cam: { subject: 'vegeta', with: 'bulma', focus: 'upper' },
        say: { who: 'bulma', line: 'Vegeta! You\'re alive! You\'re really alive!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'vegeta', line: 'W-woman! Not in front of everyone!', duration: 2.4, style: 'shout' },
        hold: 2.7,
      },
      // fists in the air
      {
        pose: [
          { who: 'gohan', pose: 'pe_fistUp', face: 'grin', speed: 4 },
          { who: 'krillin', pose: 'pe_fistUp', face: 'grin', speed: 4 },
          { who: 'videl', pose: 'pe_fistUp', face: 'grin', speed: 4 },
          { who: 'goten', pose: 'gt_cheer', face: 'grin', speed: 5 },
          { who: 'trunks', pose: 'kt_cheer', face: 'grin', speed: 5 },
        ],
        cam: { subject: 'gohan', with: 'krillin', focus: 'full' },
        say: { who: 'krillin', line: 'We did it! We actually did it!', duration: 2.2, style: 'shout' },
        hold: 2.5,
      },
      // Piccolo: arms crossed, the smallest smile
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'soft', speed: 2 }],
        cam: { subject: 'piccolo', focus: 'closeup', angle: 'three' },
        hold: 1.9,
      },
      // Mr. Satan and a stack of cakes
      {
        call: (ctx) => {
          const st = story(ctx);
          if (!st.sweets) st.sweets = EK().hold(st.fat, 'sweets');
          faceTo(st.satan, st.fat.pos);
        },
        pose: [
          { who: 'fat', pose: 'bu_eat', face: 'grin', speed: 4 },
          { who: 'satan', pose: 'ms_peace', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'fat', with: 'satan', focus: 'full' },
        say: { who: 'majin_buu', line: 'Mmm! Cake! Buu loves cake!', duration: 2.4 },
        hold: 2.6,
      },
      // everybody, together
      {
        cam: { subject: 'goku', focus: 'wide', angle: 'high', room: 6 },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.vegeta.model.setBlush) st.vegeta.model.setBlush(false);
      if (st.chichi.setRage) st.chichi.setRage(false);
      if (st.sweets) {
        st.sweets.dispose();
        st.sweets = null;
      }
      if (ctx.b.stage.def.id !== 'lookout') PC.toLookout(ctx.m, true);
      for (const k of ['goku', 'vegeta', 'dende', 'satan', 'fat']) st[k].setHidden(false);
      st.goku.setState('scripted', { pose: 'stand', expression: 'grin' });
      st.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
      st.chichi.setState('scripted', { pose: 'cc_idle', expression: 'soft' });
      st.bulma.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      ctx.m.flags.home = true;
    },
  };

  /* ================================================================================ THE LAST WISH */
  S.pe_memory = {
    id: 'pe_memory',
    cast,
    music: { song: 'mystery', level: 1 },
    events: [
      // the seven balls on the floor; Dende's arms up
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (b.stage.def.id !== 'lookout') PC.toLookout(ctx.m, true);
          const c = at(b, 0, -2);
          if (!st.balls) {
            st.balls = EK().dragonBalls(b, c);
            ctx.m.onDispose(() => st.balls && st.balls.dispose());
          }
          ctx.m.space(st.dende, 'ground', { pos: new V3(0, 0, 0.6), face: c });
          // everybody else in a loose half-ring behind him
          const ring = ['goku', 'vegeta', 'chichi', 'bulma', 'gohan', 'videl', 'goten', 'trunks', 'piccolo', 'krillin', 'satan', 'fat'];
          ring.forEach((k, i) => {
            const a = -1.25 + (i / (ring.length - 1)) * 2.5;
            const r = 4.6 + (i % 2) * 1.3;
            const f = st[k];
            f.setHidden(false);
            ctx.m.space(f, 'ground', { pos: new V3(Math.sin(a) * r, 0, 0.6 + Math.cos(a) * r), face: c });
          });
          pt(ctx, 'balls', c);
        },
        pose: [{ who: 'dende', pose: 'sb_handsUp', face: 'shout', speed: 4 }],
        cam: { subject: 'dende', focus: 'full', angle: 'low' },
        say: { who: 'dende', line: 'Arise, Eternal Dragon! Grant my wish!', duration: 2.6, style: 'shout' },
        tick: (ctx, t) => story(ctx).balls && story(ctx).balls.glow(0.5 + 0.5 * Math.sin(t * 8)),
        hold: 2.9,
      },
      // the sky goes black; he comes up out of the balls
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.stage.setMood(0.82, 0x0a0a1a, 1);
          b.sfx('rumble', null, { vol: 1, pitch: 0.5 });
          const base = ctx.cast.balls.pos.clone().add(new V3(0, 0, -7));
          if (!st.shenron) {
            st.shenron = EK().shenron(b, base, st.dende.pos);
            ctx.m.onDispose(() => st.shenron && st.shenron.dispose());
          }
          st.shenron.rise(0);
          st.shenron.eyes(0);
          pt(ctx, 'coil', base);
        },
        // low behind the group, far enough back to see the whole coil climb out of the balls
        cam: { from: { at: 'balls', off: [7, 2.6, 26] }, look: { at: 'coil', off: [0, 13, 0] }, fov: 64, raw: true },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (st.shenron) st.shenron.rise(t / 2.8);
          if (st.balls) st.balls.glow(1);
          if (b.frame % 40 === 0) b.vfx.skyBolt(ctx.cast.coil.pos.clone().add(new V3((rnd() - 0.5) * 40, 0, -20)), 60, 0xeaf6ff);
        },
        hold: 3.1,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.shenron.rise(1);
          st.shenron.eyes(1);
          pt(ctx, 'dragon', st.shenron.headPos());
        },
        cam: { from: { at: 'dragon', off: [9, -9, 20] }, look: { at: 'dragon' }, fov: 40, raw: true },
        say: { who: 'shenron', line: 'I am the Eternal Dragon. State your wish — I will grant one.', duration: 3.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'calm', speed: 2 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'If everybody remembers what Buu did, he\'ll never get to live here like a normal guy.', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'bulma', pose: 'bu_idle', face: 'calm', speed: 2 }],
        cam: { subject: 'bulma', focus: 'upper', angle: 'three' },
        say: { who: 'bulma', line: 'So we make them forget.', duration: 2.1 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'dende', pose: 'sb_handsUp', face: 'shout', speed: 3 }],
        cam: { subject: 'dende', focus: 'closeup', angle: 'low' },
        say: { who: 'dende', line: 'Eternal Dragon — erase the memory of Majin Buu from every person on Earth... except the people standing here!', duration: 4.4, style: 'shout' },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'dragon', off: [5, -3, 12] }, look: { at: 'dragon' }, fov: 36, raw: true },
        say: { who: 'shenron', line: 'It shall be done.', duration: 2 },
        tick: (ctx, t) => story(ctx).shenron && story(ctx).shenron.eyes(0.7 + 0.3 * Math.sin(t * 12)),
        hold: 2.3,
      },
      // the light going out over the whole planet
      {
        call: (ctx) => {
          const st = story(ctx);
          st.earth = K().earthView(ctx.b);
          st.earth.show();
          pt(ctx, 'earth', st.earth.centre);
          SL.ScreenFX.flash(0.5, '#ffffff');
          ctx.b.sfx('gong', null, { vol: 0.8, pitch: 0.8 });
        },
        cam: { from: { at: 'earth', off: [0, 200, 1000] }, to: { at: 'earth', off: [0, 220, 1100] }, look: { at: 'earth', off: [0, 40, 0] }, fov: 36, raw: true },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (st.earth && b.frame % 6 === 0) b.vfx.ring(st.earth.centre.clone(), 160 + t * 120, 0xffffff, 0.3);
        },
        hold: 3,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.earth) {
            st.earth.dispose();
            st.earth = null;
          }
        },
        cam: { from: { at: 'dragon', off: [9, -9, 20] }, look: { at: 'dragon' }, fov: 40, raw: true },
        say: { who: 'shenron', line: 'Your wish has been granted. Farewell.', duration: 2.8 },
        hold: 3,
      },
      // he goes; the balls scatter into the sky; the daylight comes back
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          SL.ScreenFX.flash(0.6, '#fff4d8');
          if (st.shenron) {
            st.shenron.dispose();
            st.shenron = null;
          }
          b.stage.setMood(0, 0x0a0a1a, 1.6);
        },
        cam: { subject: 'dende', focus: 'wide', angle: 'low', room: 5 },
        tick: (ctx, t) => story(ctx).balls && story(ctx).balls.scatter(Math.min(1, t / 1.8)),
        hold: 2.4,
      },
      // Mr. Satan has an idea
      {
        pose: [{ who: 'satan', pose: 'pe_idea', face: 'grin', speed: 4 }],
        cam: { subject: 'satan', focus: 'upper', angle: 'front' },
        say: { who: 'mr_satan', line: 'Wait a minute... If nobody remembers the monster... then as far as the world knows, the one who saved them all was... ME!', duration: 5 },
        hold: 5.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...Unbelievable.', duration: 1.8, style: 'quiet' },
        hold: 2.1,
      },
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Ha ha ha! Fair\'s fair — he did save us!', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [
          { who: 'satan', pose: 'ms_peace', face: 'grin', speed: 4 },
          { who: 'fat', pose: 'bu_dance', face: 'grin', speed: 4 },
        ],
        cam: { subject: 'satan', with: 'fat', focus: 'full' },
        say: { who: 'mr_satan', line: 'And you, Buu — from now on, you\'re my apprentice! MISTER BUU!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        cam: { subject: 'fat', focus: 'closeup', angle: 'front' },
        say: { who: 'majin_buu', line: 'Mister... Buu! Buu like that!', duration: 2.4 },
        hold: 2.7,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      for (const k of ['shenron', 'earth', 'balls']) {
        if (st[k]) {
          st[k].dispose();
          st[k] = null;
        }
      }
      b.stage.setMood(0, 0x0a0a1a, 0.5);
      st.fat.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      st.satan.setState('scripted', { pose: 'idle', expression: 'grin' });
      ctx.m.flags.memoryWish = true;
      if (SL.Save && SL.Save.data && SL.Save.data.flags) SL.Save.data.flags.buuForgotten = true;
    },
  };

  /* ================================================================================ THE WORLD GIVEN BACK */
  /** Satan City: the people Shenron's and Porunga's wishes gave back (spawned the first time they are needed). */
  function toCity(ctx) {
    const b = ctx.b, st = story(ctx);
    b.changeStage('satan_city');
    ctx.m.endShot();
    for (const k of Object.keys(st)) if (st[k] && st[k].setHidden) st[k].setHidden(true);
    if (!st.people) {
      st.people = [];
      for (let i = 0; i < 10; i++) {
        const c = b.spawn({ charId: i === 7 ? 'village_kid' : 'civilian', team: 0, pos: at(b, -8 + i * 1.6, 24) });
        K().watcher(c, 'idle', 'calm');
        c.cannotDie = true;
        st.people.push(c);
      }
      st.camera = b.spawn({ charId: 'tv_cameraman', team: 0, pos: at(b, 6, 6) });
      K().watcher(st.camera, 'idle', 'calm');
      st.bee = new SL.Creature(b, SL.data.creatures.bee, { pos: at(b, 1, 1), yaw: 0 });
      st.bee.object.visible = false;
    }
    for (const c of st.people) c.setHidden(true);
    st.camera.setHidden(true);
    // the street: people where the wishes put them back
    st.people.forEach((c, i) => ctx.m.space(c, 'ground', { pos: new V3(-7 + (i % 5) * 3.2, 0, 22 + Math.floor(i / 5) * 3.4), face: new V3(0, 0, 40) }));
    pt(ctx, 'street', at(b, 0, 24));
  }

  S.pe_world = {
    id: 'pe_world',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // the Earth, whole, in the sun
      {
        call: (ctx) => {
          const st = story(ctx);
          st.earth = K().earthView(ctx.b);
          st.earth.show();
          pt(ctx, 'earth', st.earth.centre);
        },
        cam: { from: { at: 'earth', off: [-300, 160, 980] }, to: { at: 'earth', off: [-200, 140, 1020] }, look: { at: 'earth' }, fov: 36, raw: true },
        hold: 3.2,
      },
      // a street at dawn, empty
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.earth) {
            st.earth.dispose();
            st.earth = null;
          }
          toCity(ctx);
          ctx.b.stage.setMood(0.25, 0xffa860, 1);
        },
        cam: { from: { at: 'street', off: [3, 0.6, -12] }, to: { at: 'street', off: [2, 0.8, -9] }, look: { at: 'street', off: [0, 1.6, 4] }, fov: 48, raw: true },
        sfx: { name: 'wind', vol: 0.4 },
        hold: 2.8,
      },
      // ...and then people in it: a soft light, and somebody standing there looking at his own hands
      {
        call: (ctx) => {
          ctx.revealed = 0;
          ctx.revealT = 0;
        },
        cam: { from: { at: 'street', off: [6, 2.4, -10] }, to: { at: 'street', off: [4, 2, -7] }, look: { at: 'street', off: [0, 1, 2] }, fov: 52, raw: true },
        tick: (ctx) => {
          const st = story(ctx), b = ctx.b;
          ctx.revealT += 1 / 60;
          if (ctx.revealed < st.people.length && ctx.revealT > 0.45) {
            ctx.revealT = 0;
            const c = st.people[ctx.revealed++];
            c.setHidden(false);
            c.setState('scripted', { pose: ctx.revealed % 2 ? 'lookHands' : 'lookAround', expression: 'shock' });
            b.vfx.flash(c.chest(), 1.6, 0xfff6e0, 0.35, SL.Toon.tex.glow);
            b.vfx.ring(c.pos.clone().add(new V3(0, 0.05, 0)), 1.2, 0xffffff, 0.4, new V3(0, 1, 0));
          }
        },
        hold: 5.2,
      },
      // a mother and her child, finding each other
      {
        call: (ctx) => {
          const st = story(ctx);
          for (const c of st.people) c.setHidden(false);
          const mom = st.people[2], kid = st.people[7];
          ctx.m.space(kid, 'ground', { pos: mom.pos.clone().add(new V3(0.2, 0, 0.55)) });
          faceTo(kid, mom.pos);
          faceTo(mom, kid.pos);
          ctx.cast.mom = mom;
          ctx.cast.child = kid;
        },
        pose: [
          { who: 'mom', pose: 'kneelReceive', face: 'soft', speed: 4 },
          { who: 'child', pose: 'pe_hugNeck', face: 'soft', speed: 4 },
        ],
        cam: { subject: 'mom', with: 'child', focus: 'full' },
        hold: 2.8,
      },
      // the plaza: everyone, and Mr. Satan up on a crate with the fat one beside him
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.stage.setMood(0, 0xffa860, 0.8);
          const P0 = at(b, 0, 0);
          if (!st.crate) {
            const crate = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 2.2), SL.Toon.mat(0x9a6a3a));
            SL.Toon.addOutline(crate, 1.4);
            b.scene.add(crate);
            st.crate = crate;
            ctx.m.onDispose(() => crate.parent && crate.parent.remove(crate));
          }
          st.crate.position.copy(P0).add(new V3(0, 0.6, 0));
          st.crate.visible = true;
          for (const k of ['satan', 'fat']) st[k].setHidden(false);
          ctx.m.space(st.satan, 'air', { pos: P0.clone().add(new V3(-0.7, 0, 0)), height: 1.2, face: new V3(0, 0, 20), pose: 'ms_peace' });
          ctx.m.space(st.fat, 'air', { pos: P0.clone().add(new V3(0.9, 0, 0.1)), height: 1.2, face: new V3(0, 0, 20), pose: 'bu_dance' });
          st.people.forEach((c, i) => {
            const a = -1.1 + (i / (st.people.length - 1)) * 2.2;
            const r = 7 + (i % 3) * 1.6;
            ctx.m.space(c, 'ground', { pos: new V3(Math.sin(a) * r, 0, Math.cos(a) * r), face: P0 });
            c.setState('scripted', { pose: 'pe_fistUp', expression: 'grin', speed: 3 + (i % 3) });
          });
          st.camera.setHidden(false);
          ctx.m.space(st.camera, 'ground', { pos: new V3(4.5, 0, 5), face: P0 });
          st.bee.object.visible = true;
          st.bee.pos.copy(at(b, 1.4, 1.6));
          st.bee.prevPos.copy(st.bee.pos);
          st.bee.setState('wag', {});
          pt(ctx, 'plaza', P0);
        },
        pose: [
          { who: 'satan', pose: 'ms_peace', face: 'grin', speed: 4 },
          { who: 'fat', pose: 'bu_dance', face: 'grin', speed: 4 },
        ],
        cam: { subject: 'satan', focus: 'wide', angle: 'low', room: 5 },
        say: { who: 'crowd', line: 'SA-TAN! SA-TAN! SA-TAN!', duration: 3, style: 'shout' },
        hold: 3.3,
      },
      {
        cam: { subject: 'satan', focus: 'upper', angle: 'low' },
        say: { who: 'mr_satan', line: 'Yes! Yes! The monster is gone — beaten by me, Hercule! With the help of my new apprentice... MISTER BUU!', duration: 4.6, style: 'shout' },
        hold: 4.8,
      },
      {
        cam: { subject: 'fat', focus: 'upper', angle: 'front' },
        say: { who: 'crowd', line: 'MIS-TER BUU! MIS-TER BUU!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      // Bee, wagging at the foot of the crate; Buu gathers him up
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bee.setState('held', { by: st.fat });
        },
        pose: [{ who: 'fat', pose: 'bu_cradle', face: 'grin', speed: 3 }],
        cam: { subject: 'fat', focus: 'medium', angle: 'three' },
        say: { who: 'majin_buu', line: 'Bee! Buu famous!', duration: 2 },
        hold: 2.4,
      },
      // the Lookout's edge: Dende watching all of it from above the clouds
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (st.crate) st.crate.visible = false;
          st.bee.object.visible = false;
          st.bee.setState('stay', {});
          b.changeStage('lookout');
          ctx.m.endShot();
          for (const k of Object.keys(st)) if (st[k] && st[k].setHidden) st[k].setHidden(true);
          for (const c of st.people) c.setHidden(true);
          // the rim of the platform, looking out
          const E = new V3(0, 0, 30);
          for (const [k, dx, dz] of [['dende', 0, 0], ['goku', -2, -1.6], ['vegeta', 2.2, -1.8]]) {
            st[k].setHidden(false);
            ctx.m.space(st[k], 'ground', { pos: new V3(E.x + dx, 0, E.z + dz), face: new V3(E.x + dx, 0, 60) });
          }
        },
        pose: [
          { who: 'dende', pose: 'pe_watchEarth', face: 'soft', speed: 2 },
          { who: 'goku', pose: 'stand', face: 'soft' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'calm' },
        ],
        cam: { subject: 'dende', focus: 'upper', angle: 'front' },
        say: { who: 'dende', line: 'They\'re celebrating... The whole world is cheering for Mr. Satan.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...Of course they are.', duration: 1.8 },
        hold: 2.1,
      },
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Ha ha ha! Good for him. He earned it.', duration: 2.6 },
        hold: 2.9,
      },
    ],
    end(ctx) {
      const st = story(ctx), b = ctx.b;
      if (st.earth) {
        st.earth.dispose();
        st.earth = null;
      }
      if (st.crate) st.crate.visible = false;
      if (st.bee) {
        st.bee.object.visible = false;
        st.bee.setState('stay', {});
      }
      for (const c of st.people || []) c.setHidden(true);
      if (st.camera) st.camera.setHidden(true);
      if (b.stage.def.id !== 'lookout') {
        b.changeStage('lookout');
        ctx.m.endShot();
      }
      b.stage.setMood(0, 0xffa860, 0.4);
      ctx.m.flags.worldBack = true;
    },
  };

  /* ================================================================================ SOMETHING, FAR TO THE SOUTH */
  /** Night on the Lookout: Goku alone at the edge (the rest of them asleep in the palace). */
  function nightLookout(ctx) {
    const st = story(ctx), b = ctx.b;
    if (b.stage.def.id !== 'lookout') {
      b.changeStage('lookout');
      ctx.m.endShot();
    }
    for (const k of Object.keys(st)) if (st[k] && st[k].setHidden) st[k].setHidden(true);
    for (const c of st.people || []) c.setHidden(true);
    if (st.mother) st.mother.setHidden(true);
    b.stage.setMood(0.86, 0x0a1430, 0.01);
    if (!st.stars) {
      st.stars = EK().stars(b);
      ctx.m.onDispose(() => st.stars && st.stars.dispose());
    }
    st.stars.points.visible = true;
    const g = st.goku;
    g.setHidden(false);
    ctx.m.space(g, 'ground', { pos: new V3(21, 0, 24), face: new V3(42, 0, 48) });
    pt(ctx, 'edge', at(b, 21, 24));
  }

  S.pe_sense = {
    id: 'pe_sense',
    cast,
    clearMood: false,
    events: [
      // the Lookout under the stars; one small figure at the edge
      {
        call: (ctx) => {
          SL.Music.stop && SL.Music.stop(2);
          nightLookout(ctx);
        },
        pose: [{ who: 'goku', pose: 'pe_sitEdge', face: 'calm', speed: 2 }],
        cam: { from: { at: 'edge', off: [-16, 7, -14] }, to: { at: 'edge', off: [-14, 6, -11] }, look: { at: 'edge', off: [8, 1, 10] }, fov: 50, subject: 'goku', focus: 'wide' },
        sfx: { name: 'wind', vol: 0.5 },
        hold: 4.2,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        hold: 2.6,
      },
      // something: the eyes open, the head turns
      {
        call: (ctx) => ctx.b.sfx('kiUp', null, { vol: 0.3, pitch: 1.7 }),
        pose: [{ who: 'goku', pose: 'pe_sitTurn', face: 'shock', speed: 6 }],
        cam: { subject: 'goku', focus: 'face', angle: 'three' },
        hold: 1.8,
      },
      // past his shoulder, out over the sea of cloud: a pinprick of pink light, very far away
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku;
          const B = SL.Cinema.body(g);
          const dir = (B.faceDir || g.forward).clone().setY(0).normalize();
          const far = g.pos.clone().addScaledVector(dir, 420);
          far.y = -18;
          if (!st.ping) {
            st.ping = EK().ping(b, far);
            ctx.m.onDispose(() => st.ping && st.ping.dispose());
          }
          st.ping.sprite.position.copy(far);
          st.ping.sprite.visible = true;
          pt(ctx, 'far', far);
          pt(ctx, 'shoulder', B.head.clone().addScaledVector(dir, -1.1).add(new V3(0, 0.35, 0)));
        },
        cam: { from: { at: 'shoulder' }, look: { at: 'far' }, fov: 40, raw: true },
        tick: (ctx, t) => story(ctx).ping && story(ctx).ping.pulse(t),
        hold: 3.4,
      },
      // THE SOUTH: a hut at the end of the world, a lamp in the doorway, a mother and a newborn
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (st.ping) st.ping.sprite.visible = false;
          if (st.stars) st.stars.points.visible = false;
          b.changeStage('south_village');
          ctx.m.endShot();
          st.goku.setHidden(true);
          b.stage.setMood(0.78, 0x0a1430, 0.01);
          if (!st.mother) {
            st.mother = b.spawn({ charId: 'uub_mother', team: 0, pos: at(b, -12, -8) });
            K().watcher(st.mother, 'pe_cradle', 'soft');
            st.mother.cannotDie = true;
          }
          st.mother.setHidden(false);
          // at the doorway of the hut by the square (the hut at -14,-12), facing out
          const door = new V3(-14, 0, -12).add(new V3(14, 0, 12).normalize().multiplyScalar(3.4));
          ctx.m.space(st.mother, 'ground', { pos: door, face: new V3(0, 0, 0) });
          if (!st.baby) st.baby = EK().hold(st.mother, 'bundle');
          if (!st.lamp) {
            st.lamp = new THREE.PointLight(0xffb060, 1.4, 9, 2);
            b.scene.add(st.lamp);
            ctx.m.onDispose(() => st.lamp && st.lamp.parent && st.lamp.parent.remove(st.lamp));
          }
          st.lamp.visible = true;
          st.lamp.position.copy(st.mother.chest()).add(new V3(0.4, 0.8, 0.3));
          ctx.cast.mother = st.mother;
        },
        music: { song: 'uub_theme', level: 0 },
        pose: [{ who: 'mother', pose: 'pe_cradle', face: 'soft', speed: 2 }],
        cam: { subject: 'mother', focus: 'medium', angle: 'three' },
        sfx: { name: 'wind', vol: 0.3 },
        hold: 3.2,
      },
      // the bundle in her arms: a breath of pink light, and gone
      {
        cam: { subject: 'mother', focus: 'closeup', angle: 'front' },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (!st.baby) return;
          const p = st.baby.group.getWorldPosition(new V3()).sub(st.mother.object.position).add(st.mother.pos);
          if (t > 0.8 && t < 1.6 && b.frame % 4 === 0) b.vfx.flash(p, 0.5, 0xff9ad0, 0.35, SL.Toon.tex.glow);
          if (t > 0.8 && t < 1.8 && b.frame % 6 === 0) b.vfx.trail(p.clone().add(new V3(0, 0.1, 0)), 0xffc0e0, 0.08, 0.8);
        },
        hold: 3,
      },
      // back on the Lookout: the slowest smile
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.lamp) st.lamp.visible = false;
          if (st.baby) {
            st.baby.dispose();
            st.baby = null;
          }
          nightLookout(ctx);
        },
        pose: [{ who: 'goku', pose: 'pe_sitTurn', face: 'soft', speed: 3 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: '...I\'ll be waiting.', duration: 2.6, style: 'quiet' },
        hold: 3.2,
      },
      // on his back, hands behind his head, under the stars
      {
        pose: [{ who: 'goku', pose: 'pe_lieStars', face: 'soft', speed: 2 }],
        cam: { subject: 'goku', focus: 'wide', angle: 'high', room: 5 },
        hold: 3.4,
      },
      { fade: { to: 'black', seconds: 1.4 }, hold: 1.6 },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const k of ['stars', 'ping', 'baby']) {
        if (st[k]) {
          st[k].dispose();
          st[k] = null;
        }
      }
      if (st.lamp) st.lamp.visible = false;
      if (st.mother) st.mother.setHidden(true);
      ctx.m.flags.sensed = true;
    },
  };
})();
