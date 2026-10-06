/*
 * SCENES — Chapter 15: the End of Z, ten years later (the owner's epilogue brief, the Uub beat sheet and the
 * reference images — Goku and Uub's fists meeting, the Tenkaichi Budokai hall — 2026-10-03).
 *
 *   ez_goku       Mount Paozu, Age 784: Goku in his new clothes, a slow kata at dawn; he stops mid-move and
 *                 looks south; Chi-Chi's voice; a tournament flyer blows into his face; a grin
 *   ez_village    the far south: a boy with a yoke and two water jars, children running round him; his
 *                 mother; the chief and the flyer (ten million zeni); "I'll go. I'll win it. For everyone."
 *   ez_trained    the boulder in pieces, the children cheering, "S-sorry!"; the chief nods
 *   ez_depart     dawn at the village edge: a bundle on a stick, a deep bow, a small figure on a long road
 *   et_arrive     the 28th World Tournament: the hall, the crowd, the announcer; Goku's family and friends
 *                 at the gate; Mr. Satan rigged the draw ("Nobody knows, right?"); Mr. Buu's secret
 *   et_entrance   "From a small village far to the south — UUB!"; the boy shaking on the steps; Goku up
 *                 on the ring; RECOGNITION — for a moment a pink ghost stands where the boy stands;
 *                 "...So it's you."; a polite bow
 *   et_provoke    "Begin!"; the fake villain: "What's the matter, kid? You scared?!..."; the crowd gasps;
 *                 Chi-Chi; Vegeta understands
 *   et_awaken     the eyes; the tears; the fists; the ring's tiles lifting off it; the scream — and the
 *                 pressure that once belonged to Kid Buu; Goku's delighted grin
 *   et_fist       THE FISTS MEET (the owner's reference): lightning between them; Goku's open hand closes on
 *                 the next one; "I'm sorry for those mean things I said about your family!..."
 *   et_offer      down on one knee: the village, the food, the training; "Please... teach me!"; "We're
 *                 both dropping out!"
 *   et_farewell   the wave to the stands; Chi-Chi; Gohan; Mr. Buu; VEGETA'S SMILE — "Don't keep me waiting too
 *                 long."; the two-finger salute
 *   et_flyaway    "Hop on!"; the kick off the stone; up into a clear sky; the boy's fear turning to wonder;
 *                 THE FINAL SHOT — the lens pulls back and away until they are a spark over the world
 *
 * Show, don't tell: nobody says "reincarnation". The ghost, the pressure, Goku's face and Buu's
 * "That boy feels funny" are the explanation.
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
  const rnd = () => (RNG || (RNG = SL.util.mulberry32(784)))();
  const PZ = SL.data.poses;

  // Goku standing at ease, looking off to one side (the south) with his head up
  PZ.ez_lookSouth = (t) => ({
    root: { y: 0 }, spine: [-2, 0, 0], chest: [-2, 10, 0], head: [-10, 34, 0],
    shoulderL: [-6, 0, 10], elbowL: [-20, 0, 0], shoulderR: [-6, 0, -10], elbowR: [-20, 0, 0],
    thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
    hands: ['fist', 'fist'],
  });
  // reading a sheet of paper held in the right hand
  PZ.ez_read = (t) => ({
    // the paper held low, at the belt (held up at the chin it hid his face in the close-up)
    root: { y: 0 }, spine: [6, 0, 0], chest: [4, 0, 0], neck: [12, 0, 0], head: [26, 0, 0],
    shoulderR: [-36, 26, -6], elbowR: [-84, 0, 0], shoulderL: [-8, 0, 10], elbowL: [-20, 0, 0],
    thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
    hands: ['fist', 'open'],
  });
  // his hands behind his head: the walk he has had since he was a boy
  PZ.ez_handsHead = (t) => {
    const b = Math.sin(t * 2);
    return {
      root: { y: b * 0.005 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-8, 0, 0],
      shoulderL: [-160, 0, 60], elbowL: [-140, 0, 0], shoulderR: [-160, 0, -60], elbowR: [-140, 0, 0],
      thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [2, 0, -8], kneeR: [4, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // ...and walking that way
  PZ.ez_strollHead = (t) => {
    const s = Math.sin(t * 6), c = Math.cos(t * 6);
    return {
      root: { y: -0.02 + Math.abs(c) * 0.02 }, spine: [-2, s * 4, 0], chest: [-4, s * 4, 0], head: [-8, -s * 4, 0],
      shoulderL: [-160, 0, 60], elbowL: [-140, 0, 0], shoulderR: [-160, 0, -60], elbowR: [-140, 0, 0],
      thighL: [-s * 26 - 4, 0, 4], kneeL: [12 + Math.max(0, s) * 30, 0, 0], thighR: [s * 26 - 4, 0, -4], kneeR: [12 + Math.max(0, -s) * 30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // a plain walk (the village, the road)
  PZ.ez_walk = (t) => {
    const s = Math.sin(t * 6), c = Math.cos(t * 6);
    return {
      root: { y: -0.02 + Math.abs(c) * 0.02 }, spine: [2, s * 4, 0], chest: [0, s * 5, 0], head: [-4, -s * 4, 0],
      shoulderL: [s * 26, 0, 8], elbowL: [-24, 0, 0], shoulderR: [-s * 26, 0, -8], elbowR: [-24, 0, 0],
      thighL: [-s * 26 - 4, 0, 4], kneeL: [12 + Math.max(0, s) * 30, 0, 0], thighR: [s * 26 - 4, 0, -4], kneeR: [12 + Math.max(0, -s) * 30, 0, 0],
      hands: ['open', 'open'],
    };
  };

  /* ================================================================================ TEN YEARS LATER: GOKU */
  S.ez_goku = {
    id: 'ez_goku',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // a field on the mountain at dawn; a man doing a kata alone
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (b.stage.def.id !== 'plains') {
            b.changeStage('plains');
            ctx.m.endShot();
          }
          for (const k of Object.keys(st)) if (st[k] && st[k].setHidden) st[k].setHidden(true);
          st.goku.setHidden(false);
          ctx.m.space(st.goku, 'ground', { pos: new V3(0, 0, 0), face: new V3(0, 0, 20) });
          b.stage.setMood(0.22, 0xffb070, 0.01);
          pt(ctx, 'field', at(b, 0, 0));
        },
        pose: [{ who: 'goku', pose: 'ez_kata', face: 'calm', speed: 1 }],
        cam: { from: { at: 'field', off: [-14, 4, 16] }, to: { at: 'field', off: [-10, 3, 11] }, look: { at: 'field', off: [0, 1.2, 0] }, fov: 46, subject: 'goku', focus: 'wide' },
        sfx: { name: 'wind', vol: 0.4 },
        hold: 4.2,
      },
      {
        cam: { subject: 'goku', focus: 'medium', angle: 'three' },
        hold: 2.8,
      },
      // mid-move, he stops; the head comes round to the south
      {
        pose: [{ who: 'goku', pose: 'ez_lookSouth', face: 'calm', speed: 4 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        hold: 2.4,
      },
      {
        say: { who: 'chichi', line: 'GOKU! Those fields won\'t plow themselves, you know!', duration: 2.8, style: 'voice' },
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'scratchHead', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Comin\'!', duration: 1.4, style: 'shout' },
        hold: 1.7,
      },
      // ...but he looks south again; and the wind brings him a sheet of paper, flat into his face
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku;
          const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), new THREE.MeshBasicMaterial({ color: 0xf4ecd8, side: THREE.DoubleSide }));
          b.scene.add(sheet);
          ctx.sheet = sheet;
          ctx.sheetFrom = g.headPos().add(new V3(5, 2.6, 6));
          ctx.sheetTo = g.headPos().addScaledVector(g.forward.clone().setY(0).normalize(), 0.16);
        },
        pose: [{ who: 'goku', pose: 'ez_lookSouth', face: 'calm', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        tick: (ctx, t) => {
          if (!ctx.sheet) return;
          const k = Math.min(1, t / 1.6);
          ctx.sheet.position.copy(ctx.sheetFrom).lerp(ctx.sheetTo, k);
          ctx.sheet.position.y += Math.sin(k * Math.PI * 3) * 0.4 * (1 - k);
          ctx.sheet.rotation.set(t * 5, t * 3, t * 2);
        },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          if (ctx.sheet) {
            ctx.sheet.parent.remove(ctx.sheet);
            ctx.sheet.geometry.dispose();
            ctx.sheet.material.dispose();
            ctx.sheet = null;
          }
          const st = story(ctx);
          if (!st.flyer) st.flyer = EK().hold(st.goku, 'paper');
        },
        pose: [{ who: 'goku', pose: 'ez_read', face: 'shock', speed: 6 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Pfff — hey! What\'s... the Twenty-Eighth World Martial Arts Tournament?', duration: 3.4 },
        hold: 3.6,
      },
      // he reads it again, slower; and the grin starts
      {
        pose: [{ who: 'goku', pose: 'ez_read', face: 'grin', speed: 2 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'If he\'s half as strong as he feels... he\'ll be there.', duration: 3.4, style: 'quiet' },
        hold: 3.7,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (ctx.sheet) {
        if (ctx.sheet.parent) ctx.sheet.parent.remove(ctx.sheet);
        ctx.sheet = null;
      }
      if (st.flyer) {
        st.flyer.dispose();
        st.flyer = null;
      }
      ctx.b.stage.setMood(0, 0xffb070, 0.3);
      ctx.m.flags.gokuFelt = true;
    },
  };

  /* ================================================================================ THE VILLAGE */
  const HOME = new V3(-11.3, 0, -9.7); // the doorway of his family's hut
  /** The village and its people, where the story keeps them (SL.data.endz.village). */
  function village(ctx) {
    const st = story(ctx), b = ctx.b;
    if (b.stage.def.id !== 'south_village') {
      b.changeStage('south_village');
      ctx.m.endShot();
    }
    for (const k of Object.keys(st)) if (st[k] && st[k].setHidden) st[k].setHidden(true);
    for (const k of ['uub', 'mother', 'chief', 'kid1', 'kid2', 'kid3']) st[k].setHidden(false);
    ctx.m.space(st.mother, 'ground', { pos: HOME.clone(), face: new V3(0, 0, 0) });
    ctx.m.space(st.chief, 'ground', { pos: HOME.clone().add(new V3(1.4, 0, -0.9)), face: new V3(0, 0, 0) });
  }
  SL.data.endz = { HOME, village };

  S.ez_village = {
    id: 'ez_village',
    cast,
    music: { song: 'uub_theme', level: 1 },
    events: [
      // the far south: the huts, the palms, the dry field, morning
      {
        call: (ctx) => {
          const st = story(ctx);
          village(ctx);
          ctx.m.space(st.uub, 'ground', { pos: new V3(9, 0, 7), face: HOME });
          if (!st.yoke) st.yoke = EK().hold(st.uub, 'pole');
          st.kids = [st.kid1, st.kid2, st.kid3];
          pt(ctx, 'square', at(ctx.b, 0, 0));
        },
        cam: { from: { at: 'square', off: [26, 12, 30] }, to: { at: 'square', off: [20, 9, 24] }, look: { at: 'square', off: [-2, 1.5, -2] }, fov: 50, subject: 'uub', focus: 'wide' },
        sfx: { name: 'wind', vol: 0.4 },
        hold: 3.8,
      },
      // A BOY WITH A YOKE: two jars of water bigger than his head, and children running rings round him
      {
        call: (ctx) => pt(ctx, 'jarsTo', new V3(-6, 0, -3.5)),
        pose: [
          { who: 'uub', pose: 'ub_carry', face: 'calm', speed: 1 },
          { who: 'kid1', pose: 'vx_run', face: 'grin' },
          { who: 'kid2', pose: 'vx_run', face: 'grin' },
          { who: 'kid3', pose: 'vx_run', face: 'grin' },
        ],
        cam: { subject: 'uub', focus: 'full', angle: 'side', dist: 5.5 },
        tick: (ctx, t) => {
          const st = story(ctx), u = st.uub;
          st.kids.forEach((k, i) => {
            const a = t * 2.2 + (i * Math.PI * 2) / 3;
            const p = u.pos.clone().add(new V3(Math.cos(a) * 2.3, 0, Math.sin(a) * 2.3));
            p.y = gy(ctx.b, p.x, p.z);
            k.setPosition(p);
            if (k.prevPos) k.prevPos.copy(p);
            k.yaw = k.prevYaw = Math.atan2(-Math.sin(a), Math.cos(a));
          });
        },
        move: { who: 'uub', at: 'jarsTo', seconds: 5, ease: 'linear', face: 'jarsTo' },
      },
      // his face: a kind, shy boy, a little out of breath
      {
        pose: [{ who: 'uub', pose: 'ub_carry', face: 'soft', speed: 1 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'front' },
        say: { who: 'village_kid', line: 'Uub! Uub! Do the thing with the rock again!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        cam: { subject: 'uub', focus: 'upper', angle: 'three' },
        say: { who: 'uub', line: 'L-later! Mama needs the water first.', duration: 2.4 },
        hold: 2.6,
      },
      // his mother at the door of the hut
      {
        pose: [{ who: 'mother', pose: 'vm_call', face: 'soft', speed: 3 }],
        cam: { subject: 'mother', focus: 'upper', angle: 'three' },
        say: { who: 'uub_mother', line: 'Uub! Come home — the chief is here to see you.', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      // the yoke down; the chief with a sheet of paper
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.yoke) {
            st.yoke.dispose();
            st.yoke = null;
          }
          ctx.m.space(st.uub, 'ground', { pos: HOME.clone().add(new V3(1.8, 0, 2.4)), face: st.chief.pos });
          for (const [k, x, z] of [['kid1', 4.5, 3.6], ['kid2', 3.6, 4.6], ['kid3', 2.4, 5]]) ctx.m.space(st[k], 'ground', { pos: HOME.clone().add(new V3(x, 0, z)), face: st.uub.pos });
          if (!st.paper) st.paper = EK().hold(st.chief, 'paper');
          faceTo(st.chief, st.uub.pos);
          faceTo(st.mother, st.uub.pos);
        },
        pose: [
          { who: 'uub', pose: 'ub_lookUp', face: 'calm', speed: 2 },
          { who: 'chief', pose: 'vc_offer', face: 'calm', speed: 2 },
          { who: 'mother', pose: 'vm_idle', face: 'calm' },
          { who: 'kid1', pose: 'vx_idle', face: 'calm' },
          { who: 'kid2', pose: 'vx_idle', face: 'calm' },
          { who: 'kid3', pose: 'vx_idle', face: 'calm' },
        ],
        cam: { subject: 'chief', angle: 'ots', over: 'uub', focus: 'upper' },
        say: { who: 'village_chief', line: 'Uub. Far in the north there is to be a World Tournament... The champion wins ten million zeni.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        pose: [{ who: 'mother', pose: 'vm_worry', face: 'sad', speed: 2 }],
        cam: { subject: 'mother', focus: 'upper', angle: 'three' },
        say: { who: 'uub_mother', line: 'Ten million... That would feed the whole village for years. But he is only a child.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      // the boy looks at his feet — and then up
      {
        pose: [{ who: 'uub', pose: 'ub_nervous', face: 'nervous', speed: 2 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'front' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'uub', pose: 'ub_lookUp', face: 'calm', speed: 3 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'three' },
        say: { who: 'uub', line: 'I... I\'ll go.', duration: 1.8, style: 'quiet' },
        hold: 2.1,
      },
      {
        pose: [{ who: 'uub', pose: 'ub_idle', face: 'angry', speed: 3 }],
        cam: { subject: 'uub', focus: 'upper', angle: 'low' },
        say: { who: 'uub', line: 'I\'ll win it. For everyone.', duration: 2.4 },
        hold: 2.7,
      },
      // her hand on his head
      {
        call: (ctx) => {
          const st = story(ctx);
          const d = st.uub.pos.clone().sub(st.mother.pos).setY(0).normalize();
          ctx.m.space(st.mother, 'ground', { pos: st.uub.pos.clone().addScaledVector(d, -0.62), face: st.uub.pos });
        },
        pose: [
          { who: 'mother', pose: 'vm_headPat', face: 'soft', speed: 3 },
          { who: 'uub', pose: 'ub_lookUp', face: 'soft', speed: 3 },
        ],
        cam: { subject: 'mother', with: 'uub', focus: 'upper' },
        say: { who: 'uub_mother', line: 'Then train hard, my son. And promise me you\'ll come home.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const k of ['yoke', 'paper']) {
        if (st[k]) {
          st[k].dispose();
          st[k] = null;
        }
      }
      ctx.m.flags.chiefCame = true;
    },
  };

  /* ================================================================================ THE BOULDER */
  S.ez_trained = {
    id: 'ez_trained',
    cast,
    music: { song: 'uub_theme', level: 2 },
    events: [
      // the children going wild
      {
        pose: [
          { who: 'kid1', pose: 'vx_cheer', face: 'grin', speed: 5 },
          { who: 'kid2', pose: 'vx_cheer', face: 'grin', speed: 6 },
          { who: 'kid3', pose: 'vx_cheer', face: 'grin', speed: 4 },
        ],
        cam: { subject: 'kid1', with: 'kid3', focus: 'full' },
        say: { who: 'village_kid', line: 'Whoaaa! Uub broke the big one!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      // ...and him, mortified, a hand on what is left of it
      {
        pose: [{ who: 'uub', pose: 'ub_sorry', face: 'nervous', speed: 3 }],
        cam: { subject: 'uub', focus: 'upper', angle: 'front' },
        say: { who: 'uub', line: 'S-sorry! I didn\'t mean to hit it that hard...!', duration: 2.6 },
        hold: 2.8,
      },
      // the chief, by the hut, has seen it too
      {
        pose: [{ who: 'chief', pose: 'vc_idle', face: 'soft', speed: 2 }],
        cam: { subject: 'chief', focus: 'closeup', angle: 'three' },
        say: { who: 'village_chief', line: 'Hm. Hm hm. That boy...', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      ctx.m.flags.boulder = true;
    },
  };

  /* ================================================================================ THE ROAD NORTH */
  S.ez_depart = {
    id: 'ez_depart',
    cast,
    music: { song: 'uub_theme', level: 2 },
    events: [
      // dawn at the edge of the village, the road going away north
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          village(ctx);
          b.stage.setMood(0.25, 0xffa060, 0.01);
          const R = new V3(0, 0, 28);
          ctx.m.space(st.uub, 'ground', { pos: R.clone(), face: new V3(0, 0, 0) });
          ctx.m.space(st.mother, 'ground', { pos: R.clone().add(new V3(-0.4, 0, -1.6)), face: R });
          ctx.m.space(st.chief, 'ground', { pos: R.clone().add(new V3(1.8, 0, -2.2)), face: R });
          for (const [k, x, z] of [['kid1', -2, -2.4], ['kid2', -1.2, -2.8], ['kid3', 2.8, -1.4]]) ctx.m.space(st[k], 'ground', { pos: R.clone().add(new V3(x, 0, z)), face: R });
          if (!st.sack) st.sack = EK().hold(st.uub, 'sack');
          pt(ctx, 'road', R);
        },
        pose: [
          { who: 'uub', pose: 'ub_idle', face: 'calm', speed: 2 },
          { who: 'mother', pose: 'vm_worry', face: 'soft' },
          { who: 'chief', pose: 'vc_idle', face: 'calm' },
          { who: 'kid1', pose: 'vx_idle', face: 'calm' },
          { who: 'kid2', pose: 'vx_idle', face: 'calm' },
          { who: 'kid3', pose: 'vx_idle', face: 'calm' },
        ],
        cam: { from: { at: 'road', off: [10, 3, 10] }, to: { at: 'road', off: [8, 2.4, 7] }, look: { at: 'road', off: [-1, 1, -2] }, fov: 46, subject: 'uub', focus: 'wide' },
        hold: 3.4,
      },
      // a deep bow to all of them
      {
        pose: [{ who: 'uub', pose: 'ub_bowDeep', face: 'calm', speed: 3 }],
        cam: { subject: 'uub', focus: 'full', angle: 'three' },
        say: { who: 'uub', line: 'I\'ll bring it home. I promise.', duration: 2.4 },
        hold: 2.7,
      },
      {
        pose: [{ who: 'mother', pose: 'vm_idle', face: 'soft', speed: 2 }],
        cam: { subject: 'mother', focus: 'closeup', angle: 'front' },
        say: { who: 'uub_mother', line: 'Just come home, Uub.', duration: 2, style: 'quiet' },
        hold: 2.3,
      },
      // the children waving him off
      {
        call: (ctx) => faceTo(story(ctx).uub, new V3(0, 0, 160)),
        pose: [
          { who: 'kid1', pose: 'vx_cheer', face: 'grin', speed: 5 },
          { who: 'kid2', pose: 'vx_cheer', face: 'grin', speed: 4 },
          { who: 'kid3', pose: 'vx_cheer', face: 'grin', speed: 6 },
          { who: 'uub', pose: 'ub_wave', face: 'grin', speed: 4 },
        ],
        cam: { subject: 'uub', angle: 'ots', over: 'kid2', focus: 'full' },
        say: { who: 'village_kid', line: 'Good luck, Uub! Win it!', duration: 2.2, style: 'shout' },
        hold: 2.5,
      },
      // A SMALL FIGURE ON A LONG ROAD: walking north under a huge sky
      {
        call: (ctx) => pt(ctx, 'north', new V3(0, 0, 58)),
        pose: [{ who: 'uub', pose: 'ez_walk', face: 'calm', speed: 1 }],
        cam: { from: { at: 'road', off: [-3, 1.6, -6] }, to: { at: 'road', off: [-2, 6, -10] }, look: { at: 'north', off: [0, 6, 20] }, fov: 52, subject: 'uub', focus: 'wide', raw: true },
        move: { who: 'uub', at: 'north', seconds: 6, ease: 'linear', face: 'north' },
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.sack) {
        st.sack.dispose();
        st.sack = null;
      }
      ctx.b.stage.setMood(0, 0xffa060, 0.4);
      ctx.m.flags.departed = true;
    },
  };

  /* ================================================================================ THE 28TH WORLD TOURNAMENT */
  // where everyone is: the ring (top at 1.1) in the middle, the hall at -z, the stands on the other three
  // sides; the friends on the yard at the -x side, facing the ring
  const T = {
    GATE: new V3(0, 0, -26),
    UUB: new V3(0, 0, -4.5),
    GOKU: new V3(0, 0, 4.5),
    FRIENDS: {
      vegeta: [-16.5, 6], bulma: [-17.6, 7.4], chichi: [-16.2, 3.2], gohan: [-17.4, 2], videl: [-18.4, 3],
      piccolo: [-19.8, 5.4], krillin: [-18.6, 0.8], satan: [-16, 9.6], fat: [-17.4, 10.8],
      pan: [-16.4, 4.1], goten: [-15.2, -0.8], trunks: [-16.4, -1.6],
    },
    // Pan's exhibition: the same marks as the main match, the near and the far side of the ring
    PAN: new V3(0, 0, 4.5),
    ROCCO: new V3(0, 0, -4.5),
  };
  SL.data.endz.T = T;
  /** The friends on the yard by the ring. */
  function friends(ctx) {
    const st = story(ctx);
    for (const k of Object.keys(T.FRIENDS)) {
      const f = st[k];
      if (!f) continue;
      f.setHidden(false);
      ctx.m.space(f, 'ground', { pos: new V3(T.FRIENDS[k][0], 0, T.FRIENDS[k][1]), face: new V3(0, 0, 0) });
    }
  }
  SL.data.endz.friends = friends;
  const ann = (ctx) => {
    const L = ctx.b.stage.landmarks || {};
    pt(ctx, 'ann', (L.announcer || new V3(14, 0, 5)).clone());
  };

  S.et_arrive = {
    id: 'et_arrive',
    cast,
    music: { song: 'tenkaichi', level: 2 },
    events: [
      // the island, the hall, the crowd
      {
        call: (ctx) => {
          ctx.b.stage.cheer && ctx.b.stage.cheer(1);
          ann(ctx);
          pt(ctx, 'hall', new V3(0, 0, -34));
        },
        cam: { from: [46, 22, 40], to: [30, 12, 26], look: { at: 'hall', off: [0, 5, 0] }, fov: 52, ease: 'inOut', raw: true },
        say: { who: 'announcer', line: 'Ladies and gentlemen — welcome to the Twenty-Eighth World Martial Arts Tournament!', duration: 4, style: 'shout' },
        hold: 4.3,
      },
      // under the name board: the hall's doors, the guardian heads
      {
        cam: { from: { at: 'hall', off: [6, 2.4, 22] }, to: { at: 'hall', off: [3, 4, 17] }, look: { at: 'hall', off: [0, 5.6, 4] }, fov: 44, raw: true },
        hold: 2.8,
      },
      // the gate: the family, ten years older
      {
        call: (ctx) => {
          const st = story(ctx), G = T.GATE;
          const group = [['goku', 0, 0], ['chichi', -1.2, -0.8], ['gohan', 1.3, -0.9], ['videl', 2.3, -1.4], ['pan', 1.8, 0.2], ['vegeta', -2.6, -1.6], ['bulma', -3.6, -2.2], ['goten', -1.6, -2.8], ['trunks', -0.4, -3.2], ['satan', 3.4, -2.6], ['fat', 4.8, -3]];
          for (const [k, x, z] of group) {
            if (!st[k]) continue;
            st[k].setHidden(false);
            ctx.m.space(st[k], 'ground', { pos: new V3(G.x + x, 0, G.z + z), face: new V3(G.x + x, 0, 10) });
          }
          pt(ctx, 'walkTo', new V3(0, 0, -19));
        },
        pose: [
          { who: 'goku', pose: 'ez_strollHead', face: 'grin', speed: 1 },
          { who: 'chichi', pose: 'cc_idle', face: 'calm' },
          { who: 'gohan', pose: 'idle', face: 'calm' },
          { who: 'videl', pose: 'vd_idle', face: 'calm' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'calm' },
          { who: 'bulma', pose: 'bu_idle', face: 'grin' },
          { who: 'satan', pose: 'ms_idle', face: 'grin' },
          { who: 'fat', pose: 'bu_idle', face: 'grin' },
          { who: 'pan', pose: 'pn_wave', face: 'grin' },
          { who: 'goten', pose: 'tg_idle', face: 'grin' },
          { who: 'trunks', pose: 'tt_idle', face: 'calm' },
        ],
        cam: { subject: 'goku', focus: 'full', angle: 'front', dist: 7 },
        move: { who: 'goku', at: 'walkTo', seconds: 3, ease: 'linear', face: 'walkTo' },
      },
      // Goku looking round the crowd for somebody
      {
        pose: [{ who: 'goku', pose: 'lookAround', face: 'calm', speed: 2 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        hold: 2.2,
      },
      // the boys, grown: neither of them entered this year
      {
        when: (ctx) => !!(ctx.cast.goten && ctx.cast.trunks),
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.goten, 'ground', { pos: st.goku.pos.clone().add(new V3(-2.6, 0, -1.4)), face: st.trunks.pos });
          ctx.m.space(st.trunks, 'ground', { pos: st.goku.pos.clone().add(new V3(-3.6, 0, -0.6)), face: st.goten.pos });
          faceTo(st.goten, st.trunks.pos);
          faceTo(st.trunks, st.goten.pos);
        },
        pose: [
          { who: 'goten', pose: 'tg_idle', face: 'grin', speed: 2 },
          { who: 'trunks', pose: 'tt_idle', face: 'smirk', speed: 2 },
        ],
        cam: { subject: 'goten', with: 'trunks', focus: 'upper' },
        say: { who: 'teen_goten', line: 'Dad\'s actually entering? I thought he was "too busy training" to come to anything.', duration: 3.6 },
        hold: 3.7,
      },
      {
        when: (ctx) => !!ctx.cast.trunks,
        pose: [{ who: 'trunks', pose: 'tt_shrug', face: 'smirk', speed: 3 }],
        cam: { subject: 'trunks', focus: 'closeup', angle: 'three' },
        say: { who: 'teen_trunks', line: 'Too busy for us. Never too busy for a fight. You know your dad.', duration: 3.2 },
        hold: 3.3,
      },
      {
        when: (ctx) => !!ctx.cast.goten,
        pose: [{ who: 'goten', pose: 'tg_laugh', face: 'grin', speed: 4 }],
        cam: { subject: 'goten', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'teen_goten', line: 'Ha! Yeah. Same as yours.', duration: 1.9 },
        hold: 2,
      },
      // Pan, four, tugging at her grandfather's trouser leg
      {
        when: (ctx) => !!ctx.cast.pan,
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.pan, 'ground', { pos: st.goku.pos.clone().add(new V3(0.9, 0, 0.9)), face: st.goku.pos });
          faceTo(st.pan, st.goku.pos);
          faceTo(st.goku, st.pan.pos);
        },
        pose: [
          { who: 'pan', pose: 'pn_proud', face: 'grin', speed: 4 },
          { who: 'goku', pose: 'stand', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'pan', focus: 'full', angle: 'front' },
        say: { who: 'pan', line: 'Grandpa Goku! I\'m fighting too! Watch me, okay?!', duration: 2.8, style: 'shout' },
        hold: 2.9,
      },
      {
        when: (ctx) => !!ctx.cast.pan,
        cam: { subject: 'goku', with: 'pan', focus: 'medium' },
        say: { who: 'goku', line: 'You bet, Pan! Go easy on \'em!', duration: 2.2 },
        hold: 2.3,
      },
      // MR. SATAN, out of the side of his mouth
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.satan, 'ground', { pos: st.goku.pos.clone().add(new V3(1.1, 0, -0.3)), face: st.goku.pos });
          faceTo(st.goku, st.satan.pos);
        },
        pose: [
          { who: 'satan', pose: 'ms_nervous', face: 'grin', speed: 3 },
          { who: 'goku', pose: 'ez_handsHead', face: 'grin' },
        ],
        cam: { subject: 'satan', angle: 'ots', over: 'goku', focus: 'upper' },
        say: { who: 'mr_satan', line: 'Goku! I did it, just like you asked — you\'re fighting the kid from the south in the first match.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_nervous', face: 'shock', speed: 4 }],
        cam: { subject: 'satan', focus: 'closeup', angle: 'front' },
        say: { who: 'mr_satan', line: '...Nobody knows I rigged the draw. Right? RIGHT?', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Ha ha! Thanks, Satan! You\'re the best!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      // Mr. Buu has a secret too
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.fat, 'ground', { pos: st.goku.pos.clone().add(new V3(-1.5, 0, -0.5)), face: st.goku.pos });
        },
        pose: [{ who: 'fat', pose: 'bu_dance', face: 'grin', speed: 3 }],
        cam: { subject: 'fat', focus: 'upper', angle: 'front' },
        say: { who: 'mr_buu', line: 'And Buu fights Mister Satan in the final! And Buu loses... for cake!', duration: 3.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_panic', face: 'shock', speed: 6 }],
        cam: { subject: 'satan', with: 'fat', focus: 'full' },
        say: { who: 'mr_satan', line: 'BUU! That\'s a SECRET!', duration: 2, style: 'shout' },
        hold: 2.3,
      },
      // the prince
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'Hmph. What are you up to, Kakarot?', duration: 2.4 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'ez_handsHead', face: 'grin', speed: 2 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'You\'ll see!', duration: 1.6 },
        hold: 1.9,
      },
    ],
    end(ctx) {
      friends(ctx);
      const st = story(ctx);
      st.goku.setHidden(false);
      ctx.m.flags.arrived = true;
    },
  };

  /* ---- Pan's exhibition: a four-year-old against a heavyweight ---- */
  S.et_pan_call = {
    id: 'et_pan_call',
    cast,
    music: { song: 'tenkaichi', level: 1 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          friends(ctx);
          ann(ctx);
          for (const k of ['pan', 'rocco']) st[k].setHidden(false);
          ctx.m.space(st.pan, 'ground', { pos: T.PAN.clone(), face: T.ROCCO });
          ctx.m.space(st.rocco, 'ground', { pos: T.ROCCO.clone(), face: T.PAN });
          ctx.b.stage.cheer && ctx.b.stage.cheer(0.8);
        },
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'Before the first round — an exhibition! The champion\'s own granddaughter... PAN! Age... four?!', duration: 3.8, style: 'shout' },
        hold: 4,
      },
      {
        pose: [
          { who: 'rocco', pose: 'rc_laugh', face: 'grin', speed: 4 },
          { who: 'pan', pose: 'pn_idle', face: 'angry', speed: 3 },
        ],
        cam: { subject: 'rocco', focus: 'upper', angle: 'low' },
        say: { who: 'rocco', line: 'A BABY? They paid me to fight a BABY?', duration: 2.6, style: 'shout' },
        tick: (ctx) => ctx.b.stage.cheer && ctx.b.stage.cheer(0.4),
        hold: 2.7,
      },
      {
        pose: [{ who: 'pan', pose: 'pn_pout', face: 'angry', speed: 5 }],
        cam: { subject: 'pan', focus: 'closeup', angle: 'front' },
        say: { who: 'pan', line: 'I\'m NOT a baby! I\'m FOUR!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_point', face: 'grin', speed: 4 }],
        cam: { subject: 'satan', focus: 'upper', angle: 'three' },
        say: { who: 'mr_satan', line: 'GO GET HIM, PAN! Show him Grandpa\'s moves!', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [
          { who: 'videl', pose: 'vd_idle', face: 'nervous', speed: 3 },
          { who: 'gohan', pose: 'idle', face: 'calm', speed: 2 },
        ],
        cam: { subject: 'videl', with: 'gohan', focus: 'upper' },
        say: { who: 'videl', line: 'Pan — GENTLY! Remember what we said!', duration: 2.4 },
        hold: 2.5,
      },
      {
        pose: [{ who: 'pan', pose: 'pn_idle', face: 'grin', speed: 6 }],
        cam: { subject: 'pan', focus: 'full', angle: 'low' },
        say: { who: 'pan', line: 'Okaaay!', duration: 1.4, style: 'shout' },
        hold: 1.5,
      },
      {
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'BEGIN!', duration: 1.2, style: 'shout' },
        sfx: { name: 'gong' },
        hold: 1.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const k of ['pan', 'rocco']) st[k].setHidden(false);
      ctx.m.flags.panCalled = true;
    },
  };

  S.et_pan_win = {
    id: 'et_pan_win',
    cast,
    music: { song: 'victory_theme', level: 2 },
    events: [
      // the hush
      {
        call: (ctx) => {
          ann(ctx);
          ctx.b.stage.cheer && ctx.b.stage.cheer(0);
        },
        pose: [{ who: 'pan', pose: 'pn_proud', face: 'grin', speed: 3 }],
        cam: { subject: 'pan', focus: 'full', angle: 'low' },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'R-Rocco is... out of the ring?! The winner... PAN!', duration: 3, style: 'shout' },
        tick: (ctx, t) => ctx.b.stage.cheer && ctx.b.stage.cheer(Math.min(1, t * 0.8)),
        hold: 3.1,
      },
      {
        pose: [{ who: 'pan', pose: 'pn_cheer', face: 'grin', speed: 6 }],
        cam: { subject: 'pan', focus: 'upper', angle: 'front' },
        say: { who: 'pan', line: 'Grandpa! Did you SEE?!', duration: 2, style: 'shout' },
        hold: 2.1,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_flex', face: 'grin', speed: 4 }],
        cam: { subject: 'satan', focus: 'closeup', angle: 'three' },
        say: { who: 'mr_satan', line: 'THAT\'S MY GRANDDAUGHTER! She learned EVERYTHING from me!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
      {
        when: (ctx) => !!(ctx.cast.goten && ctx.cast.trunks),
        pose: [
          { who: 'trunks', pose: 'tt_idle', face: 'smirk', speed: 2 },
          { who: 'goten', pose: 'tg_laugh', face: 'grin', speed: 4 },
        ],
        cam: { subject: 'trunks', with: 'goten', focus: 'upper' },
        say: { who: 'teen_trunks', line: 'She\'s got Videl\'s temper.', duration: 1.9 },
        hold: 2,
      },
      {
        when: (ctx) => !!ctx.cast.goten,
        cam: { subject: 'goten', focus: 'closeup', angle: 'three' },
        say: { who: 'teen_goten', line: 'And Gohan\'s punch. Scary.', duration: 1.9 },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'Hmph. Saiyan blood. Obviously.', duration: 2, style: 'quiet' },
        hold: 2.1,
      },
      {
        pose: [{ who: 'goku', pose: 'ez_handsHead', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Ha ha! Way to go, Pan!', duration: 1.8, style: 'shout' },
        hold: 1.9,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.rocco) st.rocco.setHidden(true);
      // back to the yard: in front of her parents, still bouncing
      if (st.pan) {
        st.pan.setHidden(false);
        ctx.m.space(st.pan, 'ground', { pos: new V3(T.FRIENDS.pan[0], 0, T.FRIENDS.pan[1]), face: new V3(0, 0, 0) });
        st.pan.setState('scripted', { pose: 'pn_proud', expression: 'grin' });
      }
      ctx.m.flags.panWon = true;
    },
  };

  /* ---- the ring ---- */
  S.et_entrance = {
    id: 'et_entrance',
    cast,
    music: { song: 'tenkaichi', level: 1 },
    events: [
      // the announcer
      {
        call: (ctx) => {
          const st = story(ctx);
          friends(ctx);
          ann(ctx);
          // the boy at the foot of the steps (the near side of the ring), the man waiting by the far corner
          st.uub.setHidden(false);
          ctx.m.space(st.uub, 'ground', { pos: new V3(0, 0, 18.6), face: new V3(0, 0, 0) });
          st.goku.setHidden(false);
          ctx.m.space(st.goku, 'ground', { pos: new V3(13.6, 0, -6), face: new V3(0, 0, 0) });
          ctx.b.stage.cheer && ctx.b.stage.cheer(0.8);
        },
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'First match! From a small village far to the south... UUB!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      // the boy on the steps: barefoot, shaking, looking at his feet
      {
        pose: [{ who: 'uub', pose: 'ub_nervous', face: 'nervous', speed: 2 }],
        cam: { subject: 'uub', focus: 'full', angle: 'front' },
        say: { who: 'crowd', line: 'He\'s just a little kid! Ha ha ha!', duration: 2.4 },
        tick: (ctx) => ctx.b.stage.cheer && ctx.b.stage.cheer(0.3),
        hold: 2.6,
      },
      {
        call: (ctx) => pt(ctx, 'mark', new V3(T.UUB.x, 1.1, T.UUB.z)),
        pose: [{ who: 'uub', pose: 'ez_walk', face: 'nervous', speed: 0.7 }],
        cam: { subject: 'uub', focus: 'full', angle: 'back', dist: 4 },
        move: { who: 'uub', at: 'mark', seconds: 4.6, ease: 'linear', face: 'mark' },
      },
      {
        call: (ctx) => faceTo(story(ctx).uub, new V3(T.GOKU.x, 0, T.GOKU.z)),
        pose: [{ who: 'uub', pose: 'ub_nervous', face: 'nervous', speed: 2 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'front' },
        hold: 2.2,
      },
      // the other one
      {
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'And his opponent... Son Goku!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.jump = ctx.m.space(st.goku, 'flight', { to: new V3(T.GOKU.x, 1.1 + 2.4, T.GOKU.z + 2), seconds: 0.6, pose: 'jump', endPose: 'jump' });
        },
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        hold: 0.7,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.m.space(st.goku, 'landing', { to: new V3(T.GOKU.x, 0, T.GOKU.z), seconds: 0.35, endPose: 'ez_handsHead' });
          faceTo(st.goku, st.uub.pos);
        },
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        hold: 1.4,
      },
      {
        call: (ctx) => faceTo(story(ctx).goku, story(ctx).uub.pos),
        pose: [{ who: 'goku', pose: 'ez_handsHead', face: 'grin', speed: 2 }],
        cam: { subject: 'uub', angle: 'ots', over: 'goku', focus: 'full' },
        hold: 2,
      },
      // RECOGNITION: Goku's eyes...
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'calm', speed: 3 }],
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        hold: 1.4,
      },
      // ...and for a moment, standing where the boy stands, the pink ghost of something he said goodbye to
      {
        call: (ctx) => {
          const st = story(ctx);
          SL.ScreenFX.flash(0.25, '#ffb8e0');
          ctx.echo = EK().echo(ctx.m, st.uub, st.kid, 0.7, { pose: 'kb_idle', face: 'grin', opacity: 0.5 });
          ctx.b.stage.setMood(0.4, 0x3a0a2a, 0.01);
        },
        cam: { subject: 'uub', focus: 'full', angle: 'front' },
        hold: 0.75,
      },
      {
        call: (ctx) => {
          if (ctx.echo) ctx.echo.end();
          ctx.b.stage.setMood(0, 0x3a0a2a, 0.2);
        },
        pose: [{ who: 'goku', pose: 'stand', face: 'soft', speed: 2 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: '...So it\'s you.', duration: 2, style: 'quiet' },
        hold: 2.3,
      },
      {
        pose: [{ who: 'uub', pose: 'ub_lookUp', face: 'nervous', speed: 3 }],
        cam: { subject: 'uub', focus: 'upper', angle: 'three' },
        say: { who: 'uub', line: 'S-sir? Did you say something?', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'ez_handsHead', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Nope! Let\'s have a good match!', duration: 2 },
        hold: 2.2,
      },
      // the bow of a boy who was taught manners
      {
        pose: [{ who: 'uub', pose: 'ub_bow', face: 'nervous', speed: 3 }],
        cam: { subject: 'uub', focus: 'full', angle: 'three' },
        say: { who: 'uub', line: 'P-pleased to meet you. I\'m Uub.', duration: 2.4 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (ctx.echo) ctx.echo.end();
      st.kid.setHidden(true);
      ctx.b.stage.setMood(0, 0x3a0a2a, 0.2);
      ctx.m.space(st.uub, 'ground', { pos: T.UUB.clone(), face: T.GOKU });
      ctx.m.space(st.goku, 'ground', { pos: T.GOKU.clone(), face: T.UUB });
      st.uub.setState('scripted', { pose: 'ub_nervous', expression: 'nervous' });
      st.goku.setState('scripted', { pose: 'stand', expression: 'grin' });
      ctx.m.flags.recognized = true;
    },
  };

  S.et_provoke = {
    id: 'et_provoke',
    cast,
    music: { song: 'mystery', level: 1 },
    events: [
      {
        call: (ctx) => ann(ctx),
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'Begin!', duration: 1.4, style: 'shout' },
        hold: 1.6,
      },
      // a timid little guard
      {
        pose: [{ who: 'uub', pose: 'ub_idle', face: 'nervous', speed: 2 }],
        cam: { subject: 'uub', angle: 'ots', over: 'goku', focus: 'full' },
        hold: 2,
      },
      // THE FAKE VILLAIN: arms crossed, chin up, walking in on him
      {
        call: (ctx) => pt(ctx, 'loom', T.UUB.clone().add(new V3(0, 1.1, 2.2))),
        pose: [{ who: 'goku', pose: 'ez_scowl', face: 'angry', speed: 3 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'low' },
        say: { who: 'goku', line: 'What\'s the matter, kid? You scared?!', duration: 2.4, style: 'shout' },
        move: { who: 'goku', at: 'loom', seconds: 2.4, ease: 'linear', face: 'uub', ground: false },
      },
      {
        cam: { subject: 'goku', angle: 'ots', over: 'uub', focus: 'upper' },
        say: { who: 'goku', line: 'Your family must be a bunch of weaklings if you\'re this pathetic!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      {
        call: (ctx) => ctx.b.stage.gasp && ctx.b.stage.gasp(0.8),
        cam: { subject: 'goku', focus: 'closeup', angle: 'low' },
        say: { who: 'goku', line: 'Your mother smells like a swamp rat!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      // Chi-Chi on her feet
      {
        pose: [{ who: 'chichi', pose: 'ez_fistShake', face: 'angry', speed: 4 }],
        cam: { subject: 'chichi', focus: 'upper', angle: 'three' },
        say: { who: 'chichi', line: 'GOKU! What are you SAYING?!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      // the prince gets it before anybody else
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...Clever, Kakarot.', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      const p = T.UUB.clone().add(new V3(0, 0, 2.2));
      ctx.m.space(st.goku, 'ground', { pos: p, face: st.uub.pos });
      st.goku.setState('scripted', { pose: 'ez_scowl', expression: 'angry' });
      st.chichi.setState('scripted', { pose: 'cc_idle', expression: 'angry' });
      ctx.m.flags.provoked = true;
    },
  };

  S.et_awaken = {
    id: 'et_awaken',
    cast,
    clearMood: false,
    events: [
      // the eyes
      {
        call: (ctx) => SL.Music.stop && SL.Music.stop(0.4),
        pose: [{ who: 'uub', pose: 'ub_lookUp', face: 'shock', speed: 12 }],
        cam: { subject: 'uub', focus: 'face', angle: 'front' },
        hold: 1.2,
      },
      // the tears
      {
        call: (ctx) => story(ctx).uub.setRage && story(ctx).uub.setRage(true, 0.3),
        pose: [{ who: 'uub', pose: 'ub_clench', face: 'grit', speed: 4 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'three' },
        hold: 1.8,
      },
      // the fists at his sides, and the ring starting to come apart round his feet
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (!st.tiles) {
            st.tiles = EK().tiles(b, st.uub.pos.clone());
            ctx.m.onDispose(() => st.tiles && st.tiles.dispose());
          }
          b.sfx('rumble', null, { vol: 0.8, pitch: 0.7 });
          b.stage.setMood(0.3, 0x2a0a20, 1.2);
        },
        music: { song: 'overwhelm', level: 1 },
        pose: [{ who: 'uub', pose: 'ub_clench', face: 'angry', speed: 5 }],
        cam: { subject: 'uub', focus: 'full', angle: 'low' },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (st.tiles) st.tiles.lift(Math.min(1, t / 2.2));
          if (b.frame % 4 === 0) b.vfx.streamInward(st.uub.chest(), 3, 0xffd6ee, 3, 0.12, 0.4);
          if (b.frame % 6 === 0) b.camera.addTrauma(0.04 + t * 0.02);
        },
        hold: 2.6,
      },
      // the crowd's hair blown back
      {
        cam: { subject: 'gohan', with: 'vegeta', focus: 'full' },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.tiles) st.tiles.lift(1);
          ctx.b.stage.gasp && ctx.b.stage.gasp(0.5);
        },
        hold: 1.4,
      },
      // THE SCREAM: the pressure that belonged to something else, a long time ago
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, u = st.uub;
          SL.ScreenFX.flash(0.55, '#ffe0f0');
          b.vfx.ring(u.pos.clone().add(new V3(0, 0.2, 0)), 14, 0xffd6ee, 0.7, new V3(0, 1, 0));
          b.vfx.ring(u.chest(), 8, 0xffffff, 0.5);
          b.cameraTraumaAt(u.pos, 0.8);
          b.sfx('transformBurst', u, { pitch: 1.3 });
          if (b.stage.ringCrack) b.stage.ringCrack(u.pos.clone(), 3);
          if (SL.Mechanics.hiddenPotential && u.mech) SL.Mechanics.hiddenPotential.unleash(u);
          ctx.echo = EK().echo(ctx.m, u, st.kid, 0.35, { pose: 'kb_scream', face: 'shout', opacity: 0.3, lift: 0 });
        },
        pose: [{ who: 'uub', pose: 'ub_awaken', face: 'shout', speed: 12 }],
        cam: { subject: 'uub', focus: 'full', angle: 'low', dist: 5 },
        say: { who: 'uub', line: 'RRRAAAAAAAAH!!', duration: 2, style: 'shout' },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.tiles) st.tiles.lift(1);
        },
        hold: 2.2,
      },
      // the scowl breaks into the biggest grin of his life
      {
        pose: [{ who: 'goku', pose: 'ez_forearms', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'There it is...!', duration: 1.8 },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.tiles) st.tiles.lift(1);
        },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'stand', face: 'shock', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        hold: 1.4,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_panic', face: 'shock', speed: 5 }],
        cam: { subject: 'satan', with: 'fat', focus: 'upper' },
        say: { who: 'mr_satan', line: 'W-what kind of kid IS that?!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'fat', pose: 'bu_idle', face: 'calm', speed: 2 }],
        cam: { subject: 'fat', focus: 'closeup', angle: 'three' },
        say: { who: 'mr_buu', line: '...Hm? That boy feels funny.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      // the tiles come down; the ring is cracked under him
      {
        call: (ctx) => {
          const st = story(ctx);
          if (st.tiles) st.tiles.drop();
        },
        pose: [{ who: 'uub', pose: 'ub_idle', face: 'angry', speed: 4 }],
        cam: { subject: 'uub', angle: 'ots', over: 'goku', focus: 'full' },
        tick: (ctx) => {
          const st = story(ctx);
          if (st.tiles) st.tiles.tick();
        },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (ctx.echo) ctx.echo.end();
      st.kid.setHidden(true);
      if (st.tiles) {
        st.tiles.dispose();
        st.tiles = null;
      }
      ctx.b.stage.setMood(0, 0x2a0a20, 0.6);
      st.uub.setState('scripted', { pose: 'ub_idle', expression: 'angry' });
      st.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'smirk' });
      ctx.m.flags.awakened = true;
    },
  };

  /* ---- THE FISTS ---- */
  S.et_fist = {
    id: 'et_fist',
    cast,
    clearMood: false,
    events: [
      // the boy's straight right and the man's, meeting halfway: lightning between the knuckles
      {
        call: (ctx) => {
          const st = story(ctx), u = st.uub, g = st.goku;
          const mid = u.pos.clone().lerp(g.pos, 0.5);
          const d = g.pos.clone().sub(u.pos).setY(0).normalize();
          ctx.m.space(u, 'ground', { pos: mid.clone().addScaledVector(d, -0.62) });
          ctx.m.space(g, 'ground', { pos: mid.clone().addScaledVector(d, 1.25) });
          faceTo(u, g.pos);
          faceTo(g, u.pos);
          pt(ctx, 'fists', mid.clone().add(new V3(0, 0.75, 0)));
          const side = new V3(-d.z, 0, d.x);
          pt(ctx, 'clashLens', mid.clone().addScaledVector(side, 4.2).addScaledVector(d, 0.35).add(new V3(0, 1.05, 0)));
          ctx.b.slowmo(0.35, 1.6);
          ctx.b.sfx('punchHeavy', null, { at: mid, vol: 1.2, pitch: 0.7 });
          ctx.b.cameraTraumaAt(mid, 0.6);
          ctx.b.stage.cheer && ctx.b.stage.cheer(1);
        },
        pose: [
          { who: 'uub', pose: 'ub_fistOut', face: 'grit', speed: 20 },
          { who: 'goku', pose: 'ez_fistClash', face: 'grin', speed: 20 },
        ],
        music: { song: 'climax', level: 2 },
        cam: { from: { at: 'clashLens' }, look: { at: 'fists', off: [0, 0.15, 0] }, fov: 44, raw: true },
        tick: (ctx) => {
          const b = ctx.b, p = ctx.cast.fists.pos;
          if (b.frame % 3 === 0) b.vfx.bolt(p.clone().add(new V3((rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.3, 0)), 0.8 + rnd(), 0xf0f6ff);
          if (b.frame % 8 === 0) b.vfx.flash(p, 0.9, 0xffffff, 0.15, SL.Toon.tex.glow);
        },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'fists', off: [0.3, 0.1, 1.6] }, look: { at: 'fists' }, fov: 40, raw: true },
        tick: (ctx) => {
          const b = ctx.b, p = ctx.cast.fists.pos;
          if (b.frame % 3 === 0) b.vfx.bolt(p.clone(), 1 + rnd(), 0xf0f6ff);
        },
        hold: 1.3,
      },
      // ...and the next one stopped dead in his open hand
      {
        pose: [
          { who: 'uub', pose: 'ub_straight', face: 'grit', speed: 14 },
          { who: 'goku', pose: 'ez_catch', face: 'grin', speed: 14 },
        ],
        sfx: { name: 'punchHeavy', who: 'goku', vol: 1, pitch: 0.9 },
        shake: { at: 'goku', amount: 0.4 },
        cam: { subject: 'uub', angle: 'ots', over: 'goku', focus: 'upper' },
        hold: 1.6,
      },
      // the scowl gone as if it was never there
      {
        call: (ctx) => {
          const u = story(ctx).uub;
          if (u.setRage) u.setRage(false);
        },
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'I\'m sorry for those mean things I said about your family! I just needed to see what you could really do. You\'re amazing!', duration: 5.4 },
        hold: 5.6,
      },
      {
        pose: [{ who: 'uub', pose: 'ub_lookUp', face: 'shock', speed: 4 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'front' },
        say: { who: 'uub', line: 'Y-you didn\'t mean it...?', duration: 2 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'goku', pose: 'stand', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', angle: 'ots', over: 'uub', focus: 'upper' },
        say: { who: 'goku', line: 'Not a word of it!', duration: 1.8 },
        hold: 2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.uub.setRage) st.uub.setRage(false);
      st.uub.setState('scripted', { pose: 'ub_lookUp', expression: 'calm' });
      st.goku.setState('scripted', { pose: 'stand', expression: 'grin' });
      ctx.b.stage.setMood(0, 0x000000, 0.4);
      ctx.m.flags.fistsMet = true;
    },
  };

  S.et_offer = {
    id: 'et_offer',
    cast,
    music: { song: 'uub_theme', level: 1 },
    events: [
      // down on one knee, at the boy's height
      {
        call: (ctx) => {
          const st = story(ctx), u = st.uub, g = st.goku;
          const d = g.pos.clone().sub(u.pos).setY(0).normalize();
          ctx.m.space(g, 'ground', { pos: u.pos.clone().addScaledVector(d, 0.95) });
          faceTo(g, u.pos);
          faceTo(u, g.pos);
        },
        pose: [
          { who: 'goku', pose: 'ez_kneelHand', face: 'soft', speed: 4 },
          { who: 'uub', pose: 'ub_lookUp', face: 'calm', speed: 2 },
        ],
        cam: { subject: 'goku', with: 'uub', focus: 'full' },
        say: { who: 'goku', line: 'Listen, Uub. You\'ve got more power inside you than you know what to do with.', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { subject: 'goku', angle: 'ots', over: 'uub', focus: 'upper' },
        say: { who: 'goku', line: 'I\'ll come to your village — I\'ll make sure your family has plenty to eat — and I\'ll train you. So someday, you can protect the whole world.', duration: 6 },
        hold: 6.2,
      },
      {
        cam: { subject: 'uub', angle: 'ots', over: 'goku', focus: 'upper' },
        say: { who: 'uub', line: '...Me?', duration: 1.4, style: 'quiet' },
        hold: 1.7,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'Yeah. You.', duration: 1.6, style: 'quiet' },
        hold: 1.9,
      },
      // he wipes his eyes with his arm — and bows as low as he can
      {
        pose: [{ who: 'uub', pose: 'ub_wipe', face: 'soft', speed: 3 }],
        cam: { subject: 'uub', focus: 'upper', angle: 'three' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'uub', pose: 'ub_bowDeep', face: 'grit', speed: 5 }],
        cam: { subject: 'uub', focus: 'full', angle: 'three', side: -1 },
        say: { who: 'uub', line: 'Please... teach me!', duration: 2.2, style: 'shout' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'ez_kneelHand', face: 'grin', speed: 3 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'Heh heh. Alright!', duration: 1.8 },
        hold: 2,
      },
      // to the announcer, cheerfully ruining his tournament
      {
        call: (ctx) => {
          ann(ctx);
          const st = story(ctx);
          ctx.m.space(st.goku, 'ground', { pos: st.goku.pos.clone(), face: ctx.cast.ann.pos });
        },
        pose: [{ who: 'goku', pose: 'g_wave', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Hey! Sorry — we\'re done! We\'re both dropping out!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'ann', off: [-2.7, 2.35, 1.3] }, look: { at: 'ann', off: [0, 1.4, 0] }, fov: 38, raw: true },
        say: { who: 'announcer', line: 'W-what?! Both of you?!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      ctx.m.space(st.goku, 'ground', { pos: st.goku.pos.clone() });
      st.goku.setState('scripted', { pose: 'stand', expression: 'grin' });
      st.uub.setState('scripted', { pose: 'ub_lookUp', expression: 'soft' });
      ctx.m.flags.offered = true;
    },
  };

  S.et_farewell = {
    id: 'et_farewell',
    cast,
    music: { song: 'journey', level: 1 },
    events: [
      // the wave to the people who came with him
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, new V3(-17, 0, 5));
          faceTo(st.uub, new V3(-17, 0, 5));
        },
        pose: [{ who: 'goku', pose: 'ez_waveBoth', face: 'grin', speed: 4 }],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        say: { who: 'goku', line: 'Sorry, everybody! I\'m gonna be away a while — I\'ll come back and visit!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'chichi', pose: 'ez_fistShake', face: 'angry', speed: 5 }],
        cam: { subject: 'chichi', focus: 'upper', angle: 'three' },
        say: { who: 'chichi', line: 'GOKU! You get back here!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
      {
        pose: [{ who: 'chichi', pose: 'cc_idle', face: 'sad', speed: 2 }],
        cam: { subject: 'chichi', focus: 'closeup', angle: 'three' },
        say: { who: 'chichi', line: '...And you\'d better come home for dinner sometimes!', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        pose: [
          { who: 'gohan', pose: 'idle', face: 'soft', speed: 2 },
          { who: 'videl', pose: 'ez_wave', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'gohan', with: 'videl', focus: 'upper' },
        say: { who: 'adult_gohan', line: 'Take care, Dad.', duration: 1.8, style: 'quiet' },
        hold: 2.1,
      },
      {
        when: (ctx) => !!ctx.cast.pan,
        pose: [{ who: 'pan', pose: 'pn_wave', face: 'grin', speed: 6 }],
        cam: { subject: 'pan', focus: 'full', angle: 'front' },
        say: { who: 'pan', line: 'Bye bye, Grandpa! Bring me something!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
      {
        when: (ctx) => !!(ctx.cast.goten && ctx.cast.trunks),
        pose: [
          { who: 'goten', pose: 'tg_wave', face: 'grin', speed: 4 },
          { who: 'trunks', pose: 'tt_idle', face: 'smirk', speed: 2 },
        ],
        cam: { subject: 'goten', with: 'trunks', focus: 'upper' },
        say: { who: 'teen_goten', line: 'Have fun, Dad! Don\'t worry about Mom — I\'ll... uh... Trunks will handle it.', duration: 3.4 },
        hold: 3.5,
      },
      {
        when: (ctx) => !!ctx.cast.trunks,
        pose: [{ who: 'trunks', pose: 'tt_shrug', face: 'shock', speed: 4 }],
        cam: { subject: 'trunks', focus: 'closeup', angle: 'three' },
        say: { who: 'teen_trunks', line: 'Me?! No way.', duration: 1.5, style: 'shout' },
        hold: 1.6,
      },
      {
        pose: [
          { who: 'fat', pose: 'bu_dance', face: 'grin', speed: 4 },
          { who: 'satan', pose: 'ms_nervous', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'fat', with: 'satan', focus: 'full' },
        say: { who: 'mr_buu', line: 'Bye bye, Goku! Bye bye, boy!', duration: 2.2 },
        hold: 2.4,
      },
      {
        cam: { subject: 'satan', focus: 'upper', angle: 'three' },
        say: { who: 'mr_satan', line: 'And remember, Goku — you never fought me! I would have won!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      // VEGETA'S SMILE
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 2 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Hmph. So that\'s what you were after, Kakarot.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        say: { who: 'vegeta', line: '...Don\'t keep me waiting too long.', duration: 2.4, style: 'quiet' },
        hold: 2.7,
      },
      // the salute across the yard (the one he gave Buu): two fingers from the forehead
      {
        call: (ctx) => faceTo(story(ctx).goku, story(ctx).vegeta.pos),
        pose: [{ who: 'goku', pose: 'ez_salute', face: 'grin', speed: 6 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'See ya, Vegeta!', duration: 1.8 },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'smirk' });
      st.chichi.setState('scripted', { pose: 'cc_idle', expression: 'soft' });
      ctx.m.flags.goodbyes = true;
    },
  };

  /* ================================================================================ THE FLIGHT, AND THE LAST SHOT */
  /** The open country under them (SL.data.endz.sky): the tournament's island is behind, the land ahead. */
  S.et_flyaway = {
    id: 'et_flyaway',
    cast,
    clearMood: false,
    events: [
      // "Hop on!"
      {
        call: (ctx) => {
          const st = story(ctx), u = st.uub, g = st.goku;
          faceTo(g, new V3(0, 0, 40));
          ctx.m.space(u, 'ground', { pos: g.pos.clone().addScaledVector(g.forward.clone().setY(0).normalize(), -1.2), face: g.pos });
        },
        pose: [
          { who: 'goku', pose: 'ez_crouchCarry', face: 'grin', speed: 5 },
          { who: 'uub', pose: 'ub_lookUp', face: 'nervous', speed: 3 },
        ],
        cam: { subject: 'goku', with: 'uub', focus: 'full' },
        say: { who: 'goku', line: 'Hop on!', duration: 1.4, style: 'shout' },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          ctx.riding = true;
          ctx.m.space(story(ctx).goku, 'ground', { pos: story(ctx).goku.pos.clone() });
        },
        pose: [
          { who: 'goku', pose: 'ez_carry', face: 'grin', speed: 4 },
          { who: 'uub', pose: 'ub_piggy', face: 'nervous', speed: 4 },
        ],
        cam: { subject: 'uub', focus: 'upper', angle: 'three' },
        tick: (ctx) => ctx.riding && EK().ride(story(ctx).uub, story(ctx).goku),
        say: { who: 'uub', line: 'W-wait — are we going to... FLY?!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      // the crouch, and the kick off the stone floor
      {
        pose: [{ who: 'goku', pose: 'ez_launch', face: 'grin', speed: 8 }],
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        tick: (ctx) => ctx.riding && EK().ride(story(ctx).uub, story(ctx).goku),
        hold: 0.8,
      },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b, g = st.goku;
          const p0 = g.pos.clone();
          if (b.stage.ringCrack) b.stage.ringCrack(p0.clone(), 2);
          b.vfx.ring(p0.clone().add(new V3(0, 0.1, 0)), 5, 0xffffff, 0.45, new V3(0, 1, 0));
          b.vfx.dust(p0, 2.6, 18, 0xd8d2c4);
          b.cameraTraumaAt(p0, 0.5);
          b.sfx('jump', g, { vol: 1, pitch: 0.7 });
          b.stage.cheer && b.stage.cheer(1);
          ctx.launch = ctx.m.space(g, 'flight', { to: p0.clone().add(new V3(0, 46, 22)), seconds: 2.4, pose: 'ez_carryFly', endPose: 'ez_carryFly' });
          pt(ctx, 'ring', p0);
        },
        pose: [{ who: 'uub', pose: 'ub_piggyFly', face: 'shock', speed: 6 }],
        music: { song: 'next_journey', level: 1 },
        cam: { from: { at: 'ring', off: [3, 0.6, -4] }, look: { at: 'goku' }, fov: 52, raw: true },
        tick: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (ctx.riding) EK().ride(st.uub, st.goku);
          if (b.frame % 2 === 0) b.vfx.trail(st.goku.chest(), 0xffffff, 0.5, 0.4);
        },
        hold: 2.4,
      },
      // the faces in the crowd going up with them
      {
        pose: [
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk' },
          { who: 'chichi', pose: 'ez_wave', face: 'soft', speed: 3 },
          { who: 'fat', pose: 'bu_dance', face: 'grin', speed: 3 },
        ],
        cam: { subject: 'chichi', with: 'vegeta', focus: 'full', height: -0.2 },
        tick: (ctx) => ctx.riding && EK().ride(story(ctx).uub, story(ctx).goku),
        hold: 2.2,
      },
      // OPEN COUNTRY: alongside them, high over the land
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          if (ctx.launch) ctx.launch.finish();
          b.changeStage('plains');
          ctx.m.endShot();
          for (const k of Object.keys(st)) if (st[k] && st[k].setHidden && k !== 'goku' && k !== 'uub') st[k].setHidden(true);
          ctx.m.space(st.goku, 'air', { pos: new V3(-60, 0, -60), height: 40, face: new V3(60, 0, 60), pose: 'ez_carryFly' });
          ctx.flyFrom = st.goku.pos.clone();
          ctx.flyDir = new V3(1, 0, 1).normalize();
          ctx.flyT = 0;
          b.stage.setMood(0.12, 0xffe0a0, 0.6);
        },
        pose: [
          { who: 'goku', pose: 'ez_carryFly', face: 'grin', speed: 1 },
          { who: 'uub', pose: 'ub_piggyFly', face: 'shock', speed: 3 },
        ],
        music: { song: 'next_journey', level: 2 },
        cam: { subject: 'goku', with: 'uub', focus: 'full', pad: 1.2 },
        tick: (ctx) => fly(ctx),
        hold: 3.2,
      },
      // the fear turning into something else
      {
        pose: [{ who: 'uub', pose: 'ub_piggyFly', face: 'calm', speed: 2 }],
        cam: { subject: 'uub', focus: 'closeup', angle: 'side', side: -1 },
        say: { who: 'uub', line: '...Wow...', duration: 1.8, style: 'quiet' },
        tick: (ctx) => fly(ctx),
        hold: 2.4,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Ha ha ha! Hang on, Uub — it\'s a long way to your village!', duration: 3, style: 'shout' },
        tick: (ctx) => fly(ctx),
        hold: 3.2,
      },
      {
        pose: [{ who: 'uub', pose: 'ub_piggyFlyWave', face: 'grin', speed: 3 }],
        cam: { subject: 'uub', with: 'goku', focus: 'full' },
        say: { who: 'uub', line: 'Ha... ha ha! We\'re flying!', duration: 2.4, style: 'shout' },
        tick: (ctx) => fly(ctx),
        hold: 2.6,
      },
      // THE FINAL SHOT: the lens drops back and climbs; the two of them become a spark over the world,
      // heading for the horizon in the sun; the music all the way up
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.lensFrom = st.goku.pos.clone().addScaledVector(ctx.flyDir, -8).add(new V3(2, 1.5, 0));
          ctx.spark = EK().streak(ctx.b);
          ctx.b.stage.setMood(0.34, 0xffc070, 3);
          ctx.m.onDispose(() => ctx.spark && ctx.spark.dispose());
          pt(ctx, 'lens', ctx.lensFrom);
          pt(ctx, 'focus', st.goku.chest());
        },
        music: { song: 'next_journey', level: 3 },
        cam: { from: { at: 'lens' }, look: { at: 'focus' }, fov: 46, raw: true },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          fly(ctx, 3.4);
          // the lens slows, drops back and rises; past the arena's edge the bodies hand over to a spark of light
          const lens = ctx.cast.lens;
          lens.pos.copy(ctx.lensFrom).add(new V3(0, t * 9, 0)).addScaledVector(ctx.flyDir, -t * 5);
          const far = st.goku.pos.distanceTo(new V3(0, st.goku.pos.y, 0)) > 150;
          if (far && !st.goku.hidden) {
            st.goku.setHidden(true);
            st.uub.setHidden(true);
            ctx.sparkAt = st.goku.chest();
          }
          if (ctx.sparkAt) {
            ctx.sparkAt.addScaledVector(ctx.flyDir, 0.9);
            ctx.sparkAt.y += 0.32; // up over the far hills, into the light
            ctx.spark.at(ctx.sparkAt);
          }
          // the lens keeps them in its sights, drifting a little ahead and above as they go
          ctx.cast.focus.pos.copy(ctx.sparkAt || st.goku.chest()).add(new V3(0, t * 2.4, 0));
          if (b.frame % 3 === 0 && !st.goku.hidden) b.vfx.trail(st.goku.chest(), 0xfff6d8, 0.5, 0.6);
        },
        hold: 9,
      },
      { fade: { to: 'white', seconds: 2.2 }, hold: 2.4 },
    ],
    end(ctx) {
      const st = story(ctx);
      ctx.riding = false;
      if (ctx.spark) {
        ctx.spark.dispose();
        ctx.spark = null;
      }
      st.goku.setHidden(true);
      st.uub.setHidden(true);
      ctx.m.flags.flewAway = true;
    },
  };
  /** Goku flies on along ctx.flyDir with Uub on his back; the land goes by underneath. */
  function fly(ctx, speed = 1.4) {
    const st = story(ctx), g = st.goku;
    if (!ctx.flyDir || g.hidden) return;
    ctx.flyT = (ctx.flyT || 0) + 1 / 60;
    const p = g.pos.clone().addScaledVector(ctx.flyDir, speed * 0.1);
    p.y += Math.sin(ctx.flyT * 1.4) * 0.01;
    g.setPosition(p);
    if (g.prevPos) g.prevPos.copy(p);
    g.grounded = false;
    g.yaw = g.prevYaw = Math.atan2(ctx.flyDir.x, ctx.flyDir.z);
    if (ctx.riding) EK().ride(st.uub, g);
  }
})();
