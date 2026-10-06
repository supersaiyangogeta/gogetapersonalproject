/*
 * CHAPTER 16 — BATTLE OF GODS, mission 5: "The Super Saiyan God" (canon; the Princess Bulma, GROUND: the deck).
 * Played as GOKU.
 *
 *   DEAL       (scene)         "Give us a little time"; the Dragon Balls were the bingo prize
 *   SUMMON     (scene)         the sky goes dark; Shenron rises out of the sea beside the ship — sees Beerus and
 *                              breaks into a sweat; the ritual: five righteous Saiyans pour their hearts into a sixth
 *   ATTEMPT *  (hold Charge)   Goku, Vegeta, Gohan, Goten, Trunks: the light comes up... wavers... and dies
 *   FIVE       (scene)         Whis counts: five. Not enough.
 *   VIDEL      (scene)         "Does it count if one of them hasn't been born yet?" — Pan
 *   RITUAL *   (hold Charge)   six Saiyans: their hair goes white, cyan light goes up into the clouds, the clouds
 *                              gather and turn from gold to magenta to divine red
 *   GOD        (scene)         the light comes down into him; the mist; the reveal — slimmer, younger, crimson hair,
 *                              red eyes, a flame for an aura; "So this is a god's power"
 *   AFTER
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const BP = () => SL.data.bogParty;
  const S = (SL.data.scenes = SL.data.scenes || {});

  const RIT = { centre: new V3(0, 0, 21), radius: 2.7, dragon: new V3(-27, 0, 24), attemptCap: 0.7, attemptSeconds: 3.2, seconds: 5.2 };
  // the five (and the one inside Videl) round Goku
  const RING = ['vegeta', 'gohan', 'videl', 'goten', 'trunks'];

  function setup(battle) {
    const b = battle;
    const s = BP().setup(b, { player: 'goku', godsHere: true });
    s.goku.lockedForms = { kaioken: true, god: true, godki: true };
    // after the god's temper: a few of them still a little worse for wear
    for (const k of ['vegeta', 'gohan', 'piccolo', 'goten', 'trunks']) if (s[k].setDamage) s[k].setDamage(1);
    for (const f of Object.values(s)) if (f && f.setState && f !== s.goku) f.untargetable = f.intangible = true;
    return s;
  }

  /** The circle: Goku in the middle, the others round him holding hands. GROUND. */
  function circle(m, who) {
    const b = m.battle, s = b.story;
    const list = who.map((k) => s[k]);
    m.space(s.goku, 'ground', { pos: RIT.centre.clone(), face: new V3(0, 0, 40), pose: 'charge', expr: 'focused' });
    list.forEach((f, i) => {
      const a = (i / Math.max(5, list.length)) * Math.PI * 2;
      const p = RIT.centre.clone().add(new V3(Math.sin(a) * RIT.radius, 0, Math.cos(a) * RIT.radius));
      f.setHidden(false);
      m.space(f, 'ground', { pos: p, face: RIT.centre, pose: 'bg_ring', expr: 'closed' });
    });
    // everybody else watches from the rails
    const watch = { bulma: [-8, 14], chichi: [-9.6, 15.6], krillin: [8.6, 14], c18: [9.8, 15.6], piccolo: [10.6, 26], tien: [9.6, 29], yamcha: [7.6, 30],
      satan: [-8.6, 28.6], buu: [-10.2, 26], beerus: [5.4, 11], whis: [7.6, 10.4], videl: [-6, 18], gohan: [-4.6, 17.2], vegeta: [5, 17], goten: [-2, 15], trunks: [2, 15] };
    const support = [];
    for (const k of Object.keys(watch)) {
      const f = s[k];
      if (!f || who.includes(k)) continue;
      support.push({ f, at: new V3(watch[k][0], 0, watch[k][1]), pose: k === 'whis' ? 'w_idle' : k === 'beerus' ? 'bs_idle' : 'idle', face: k === 'beerus' || k === 'whis' ? 'calm' : 'shock' });
    }
    m.cast({ active: [s.goku], support }, { centre: RIT.centre.clone(), supportClear: 3 });
    for (const f of list) f.setState('scripted', { pose: 'bg_ring', expression: 'closed' });
    return list;
  }

  /** White hair and a white glow on the ones pouring their hearts in (k 0 gives them their own back). */
  function whiten(list, on) {
    for (const f of list) {
      const mdl = f.model;
      if (on) {
        const style = mdl.currentHair ? mdl.currentHair.split('|')[0] : mdl.app.hair && mdl.app.hair.style;
        if (style) mdl.setHair(style, 0xf6f8ff);
        f.aura.setStyle({ color: 0xffffff, core: 0xffffff, particles: 0xe8faff, speed: 1.2 });
        f.rimLight = { color: 0xeaf8ff, strength: 0.7 };
      } else {
        mdl.setForm(f.form);
        f.aura.setStyle(f.form.aura || { color: 0xffffff });
        f.rimLight = null;
      }
    }
  }

  /** The dragon and the balls, wherever a restart needs them. */
  function ensureDragon(m) {
    const b = m.battle, s = b.story;
    if (!s.balls) {
      s.balls = SL.data.endzKit.dragonBalls(b, RIT.centre.clone().add(new V3(0, 0, 3.4)));
      m.onDispose(() => s.balls && s.balls.dispose());
    }
    if (!s.shenron) {
      const base = RIT.dragon.clone();
      base.y = b.stage.waterLevel !== undefined ? b.stage.waterLevel - 1 : -8;
      s.shenron = SL.data.endzKit.shenron(b, base, RIT.centre);
      m.onDispose(() => s.shenron && s.shenron.dispose());
    }
    s.balls.glow(1);
    s.shenron.rise(1);
    s.shenron.eyes(0.8);
    b.stage.setMood(0.55, 0x0a0c1c, 0.6);
  }

  const P = {};
  P.deal = K().scene('deal', 'bgr_deal');
  P.summon = K().scene('summon', 'bgr_summon');

  /** THE FIRST TRY: five of them — the light comes up, wavers, dies. */
  P.attempt = {
    id: 'attempt',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku;
      m.lock(true);
      m.clearObjectives();
      ensureDragon(m);
      const ring = circle(m, ['vegeta', 'gohan', 'goten', 'trunks']);
      s.ritual = s.ritual || K().ritual(b, RIT.centre, RIT.radius + 0.5);
      m.onDispose(() => s.ritual && s.ritual.dispose());
      s.ritual.colour(0xffe27a);
      SL.Cinema.shotOn(m, { goku: g, vegeta: s.vegeta }, (t, el) => (el % 6 < 3.4 ? { subject: 'goku', focus: 'wide', angle: 'high', room: 3 } : { subject: 'goku', focus: 'upper', angle: 'front' }), 60);
      m.say('goku', 'Alright — everybody hold hands! Pour it into me!', 2.6);
      m.music('ascend', 3);
      m.objective('ritual', 'The ritual: pour it in', { icon: 'ball' });
      const r = yield* K().hold(m, {
        id: 'attempt', fighter: g, cap: RIT.attemptCap, seconds: RIT.attemptSeconds, meter: 'THE RITUAL', label: 'Hold — take what they give you',
        beats: [
          { at: 0.15, run: () => b.sfx('kiCharge', g, { vol: 0.8 }) },
          { at: 0.35, run: () => m.say('vegeta', 'Hmph. Just this once, Kakarot.', 2.2) },
          { at: 0.55, run: () => m.say('gohan', 'Something\'s... coming!', 2) },
        ],
        tick: (mm, k) => {
          s.ritual.set(k);
          s.ritual.stream();
          g.setState('scripted', { pose: 'charge', expression: 'focused', aura: k });
          for (const f of ring) f.setState('scripted', { pose: 'bg_ring', expression: 'closed', aura: k * 0.6 });
          if (b.frame % 8 === 0) b.camera.addTrauma(0.02 + k * 0.03);
        },
      });
      m.flags.attempt = Math.round(r.k * 100);
      // it wavers... and dies
      m.say('goku', 'Huh? It\'s... slipping away...', 2.2);
      let t = 0;
      const fade = () => {
        t += 1 / 60;
        const k = RIT.attemptCap * Math.max(0, 1 - t / 1.8) * (0.7 + Math.sin(t * 40) * 0.3);
        s.ritual.set(k);
        g.setState('scripted', { pose: 'charge', expression: 'shock', aura: k });
      };
      m.tickHooks.push(fade);
      yield* m.cine(1.9);
      K().unhook(m, fade);
      s.ritual.set(0);
      m.failObjective('ritual');
      m.endShot();
      yield* SL.Cinema.play(m, 'bgr_five');
    },
  };

  P.videl = K().scene('videl', 'bgr_videl');

  /** THE RITUAL: six Saiyans. Their hair goes white; the light goes up; the sky turns. */
  P.ritual = {
    id: 'ritual',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku;
      m.lock(true);
      m.clearObjectives();
      ensureDragon(m);
      const ring = circle(m, RING);
      s.ritual = s.ritual || K().ritual(b, RIT.centre, RIT.radius + 0.5);
      m.onDispose(() => s.ritual && s.ritual.dispose());
      s.ritual.colour(0x8ae8ff);
      m.onDispose(() => whiten(ring, false));
      SL.Cinema.shotOn(m, { goku: g, videl: s.videl, vegeta: s.vegeta }, (t, el) => {
        const c = el % 9;
        return c < 3 ? { subject: 'goku', focus: 'wide', angle: 'high', room: 4 } : c < 6 ? { subject: 'videl', focus: 'upper', angle: 'three' } : { subject: 'goku', focus: 'full', angle: 'three' };
      }, 60);
      m.say('goku', 'Okay. One more time — everybody!', 2.2);
      m.music('ssj_god', 2);
      m.objective('ritual', 'Become the Super Saiyan God', { icon: 'ball' });
      let sky = 0;
      const r = yield* K().hold(m, {
        id: 'ritual', fighter: g, cap: 1, seconds: RIT.seconds, meter: 'SUPER SAIYAN GOD', label: 'Hold — let six hearts into you',
        beats: [
          { at: 0.12, run: () => {
            whiten(ring, true);
            b.sfx('ssjRise', g, { vol: 0.7, pitch: 1.3 });
          } },
          { at: 0.3, run: () => m.say('gohan', 'It\'s working, Dad!', 1.8, { style: 'shout' }) },
          { at: 0.5, run: () => {
            b.sfx('rumble', null, { vol: 0.9 });
            m.say('whis', 'Oh my. Look at the sky.', 2);
          } },
          { at: 0.72, run: () => m.say('beerus', '...So this is it.', 1.8) },
          { at: 0.9, run: () => b.sfx('wind', null, { vol: 1, pitch: 0.6 }) },
        ],
        tick: (mm, k) => {
          s.ritual.set(k);
          s.ritual.stream();
          // the sky: gold storm first, then magenta, then divine red
          sky = k;
          if (k < 0.55) K().skyTo(b, K().SKY.storm, k / 0.55);
          else {
            K().skyTo(b, K().SKY.divine, (k - 0.55) / 0.45);
            s.ritual.colour(new THREE.Color(0x8ae8ff).lerp(new THREE.Color(0xff5a7a), (k - 0.55) / 0.45).getHex());
          }
          g.setState('scripted', { pose: 'charge', expression: 'focused', aura: 0.3 + k * 0.7 });
          for (const f of ring) f.setState('scripted', { pose: 'bg_ring', expression: 'closed', aura: 0.3 + k * 0.6 });
          if (b.frame % 6 === 0) b.camera.addTrauma(0.02 + k * 0.05);
          if (k > 0.6 && b.frame % 20 === 0) b.vfx.skyBolt(RIT.centre.clone().add(new V3(Math.sin(b.frame) * 40, 0, Math.cos(b.frame) * 40)), 90, 0xff8aa0);
        },
      });
      m.flags.ritual = Math.round(r.seconds * 10) / 10;
      m.complete('ritual');
      m.endShot();
      yield* SL.Cinema.play(m, 'bgr_god');
    },
  };

  P.after = K().after('THE SUPER SAIYAN GOD');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, p) => K().pt(ctx, n, p);

  S.bgr_deal = {
    id: 'bgr_deal',
    cast,
    music: { song: 'ominous', level: 1 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          m.space(s.beerus, 'ground', { pos: new V3(0, 0, 9), face: new V3(0, 0, 6), pose: 'bs_idle', expr: 'calm' });
          m.space(s.goku, 'ground', { pos: new V3(0, 0, 6.4), face: s.beerus.pos, pose: 'idle', expr: 'serious' });
          m.space(s.whis, 'ground', { pos: new V3(3.4, 0, 10.4), face: s.goku.pos, pose: 'w_eat', expr: 'calm' });
          m.space(s.bulma, 'ground', { pos: new V3(-3, 0, 5), face: s.goku.pos, pose: 'getup', expr: 'hurt' });
          m.space(s.vegeta, 'ground', { pos: new V3(3, 0, 4.4), face: s.beerus.pos, pose: 'getup', expr: 'hurt' });
        },
        title: { chapter: 'CHAPTER 16 · BATTLE OF GODS', title: 'THE SUPER SAIYAN GOD', subtitle: 'Five righteous Saiyans · the Princess Bulma', duration: 3.8 },
        cam: { subject: 'goku', with: 'beerus', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Lord Beerus — you came looking for a Super Saiyan God, right? Give us a little time.', duration: 3.8 },
        hold: 3.8,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Time? Do you even know what a Super Saiyan God is?', duration: 2.8 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'goku', pose: 'bg_bowScratch', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Nope! But I know somebody who might. The Dragon Balls!', duration: 3 },
        hold: 3,
      },
      {
        pose: [{ who: 'bulma', pose: 'bg_hips', face: 'grin' }],
        cam: { subject: 'bulma', focus: 'upper', angle: 'front' },
        say: { who: 'bulma', line: 'Ha! I\'ve got all seven right here. They were the grand prize for the bingo!', duration: 3.4 },
        hold: 3.4,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...THAT was the prize?', duration: 2 },
        hold: 2,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'front' },
        say: { who: 'beerus', line: 'Fine. Call your dragon. But don\'t keep me waiting.', duration: 2.8 },
        hold: 2.8,
      },
    ],
  };

  /* ---------------------------------------------------------------- the dragon */
  S.bgr_summon = {
    id: 'bgr_summon',
    cast,
    music: { song: 'shenron', level: 1 },
    clearMood: false,
    events: [
      // the balls on the deck, the call
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.balls = s.balls || SL.data.endzKit.dragonBalls(b, RIT.centre.clone().add(new V3(0, 0, 3.4)));
          ctx.m.onDispose(() => s.balls && s.balls.dispose());
          ctx.m.space(s.goku, 'ground', { pos: RIT.centre.clone(), face: s.balls.group.position.clone().add(RIT.centre).multiplyScalar(0.5).add(new V3(0, 0, 3.4)), pose: 'idle', expr: 'determined' });
          K().faceTo(s.goku, RIT.centre.clone().add(new V3(0, 0, 3.4)));
          pt(ctx, 'balls', RIT.centre.clone().add(new V3(0, 0.2, 3.4)));
        },
        cam: { from: { at: 'balls', off: [1.6, 0.5, 2.4] }, look: { at: 'balls' }, fov: 40 },
        say: { who: 'goku', line: 'Come forth, Eternal Dragon — and grant my wish!', duration: 2.8, style: 'shout' },
        tick: (ctx, t) => st(ctx).balls && st(ctx).balls.glow(Math.min(1, t)),
        hold: 2.8,
      },
      // the sky goes dark, a pillar of light into the sea beside the ship
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.stage.setMood(0.62, 0x0a0c1c, 1.2);
          b.sfx('rumble', null, { vol: 1.1, pitch: 0.5 });
          const base = RIT.dragon.clone();
          base.y = b.stage.waterLevel !== undefined ? b.stage.waterLevel - 1 : -8;
          s.shenron = s.shenron || SL.data.endzKit.shenron(b, base, RIT.centre);
          ctx.m.onDispose(() => s.shenron && s.shenron.dispose());
          s.shenron.rise(0);
          s.shenron.eyes(0);
          pt(ctx, 'sea', base.clone());
          pt(ctx, 'deckView', new V3(9, 3, 4));
        },
        tick: (ctx, t) => {
          const s = st(ctx);
          if (!s.shenron) return;
          s.shenron.rise(Math.min(1, t / 3));
          if (ctx.b.frame % 3 === 0) K().splash(ctx.b, ctx.cast.sea.pos, 2.2);
        },
        cam: { from: { at: 'deckView' }, look: { at: 'sea', off: [0, 26, 0] }, fov: 56 },
        hold: 3.4,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          s.shenron.rise(1);
          s.shenron.eyes(1);
          pt(ctx, 'head', s.shenron.headPos());
        },
        cam: { from: { at: 'head', off: [22, -12, -26] }, look: { at: 'head' }, fov: 42 },
        say: { who: 'shenron', line: 'Speak your wish. I will grant you any one wish—', duration: 3 },
        hold: 3,
      },
      // ...and he sees who is standing on the deck
      {
        tick: (ctx, t) => st(ctx).shenron && st(ctx).shenron.eyes(0.6 + Math.sin(t * 22) * 0.4),
        cam: { subject: 'beerus', focus: 'upper', angle: 'low' },
        say: { who: 'beerus', line: 'Oh? It\'s you.', duration: 1.8 },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          // a cold sweat: drops off the dragon's brow
          const h = s.shenron.headPos();
          for (let i = 0; i < 6; i++) b.vfx.rock(h.clone().add(new V3((i - 3) * 1.2, 1, 3)), new V3(0, -2, 1), 0.35, 0xbfe8ff);
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          s.shenron.eyes(0.5 + Math.sin(t * 30) * 0.2);
          if (b.frame % 10 === 0) b.vfx.rock(s.shenron.headPos().add(new V3(Math.sin(t * 9) * 3, 1, 3)), new V3(0, -3, 1), 0.3, 0xbfe8ff);
        },
        cam: { from: { at: 'head', off: [12, -4, -16] }, look: { at: 'head' }, fov: 36 },
        say: { who: 'shenron', line: 'L-L-Lord Beerus! What an unexpected honor... I trust you are... well...?', duration: 3.8 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'whis', pose: 'w_laugh', face: 'smirk' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'My, what a polite dragon.', duration: 2 },
        hold: 2,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'low' },
        say: { who: 'goku', line: 'Shenron! What\'s a Super Saiyan God? How do we make one?', duration: 3 },
        hold: 3,
      },
      {
        cam: { from: { at: 'head', off: [-18, -10, -20] }, look: { at: 'head' }, fov: 40 },
        say: { who: 'shenron', line: 'Five righteous Saiyans must pour their hearts into a sixth...', duration: 3.4 },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'deckView' }, look: { at: 'head' }, fov: 50 },
        say: { who: 'shenron', line: '...to instill the light of a Super Saiyan God within him. Join hands, and give him your power.', duration: 4.2 },
        hold: 4.2,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          for (const [f, x, z] of [[s.vegeta, 2.6, 18], [s.gohan, -2.6, 18], [s.goten, -1.2, 17], [s.trunks, 1.2, 17]]) ctx.m.space(f, 'ground', { pos: new V3(x, 0, z), face: s.goku.pos, pose: 'idle', expr: 'calm' });
        },
        cam: { subject: 'gohan', focus: 'upper', angle: 'three' },
        say: { who: 'adult_gohan', line: 'Righteous Saiyans... Dad, me, Goten, Trunks — and Vegeta!', duration: 3 },
        hold: 3,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '"Righteous." Hmph.', duration: 1.8 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      ensureDragon(ctx.m);
    },
  };

  S.bgr_five = {
    id: 'bgr_five',
    cast,
    clearMood: false,
    events: [
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'It\'s gone... Why didn\'t it work?', duration: 2.4 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'whis', pose: 'w_finger', face: 'calm' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'One, two, three, four... and the one in the middle makes five. Five pour into a sixth — you are one short.', duration: 4.6 },
        hold: 4.6,
      },
      {
        cam: { subject: 'goku', with: 'gohan', focus: 'full', angle: 'front' },
        say: { who: 'goku', line: 'One short? But there aren\'t any other Saiyans!', duration: 2.6 },
        hold: 2.6,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'So there\'s no god after all. What a waste of my time.', duration: 2.8 },
        hold: 2.8,
      },
    ],
  };

  /* ---------------------------------------------------------------- Videl, and Pan */
  S.bgr_videl = {
    id: 'bgr_videl',
    cast,
    clearMood: false,
    music: { song: 'hopeful', level: 1 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.videl, 'ground', { pos: new V3(-4.4, 0, 17.6), face: s.goku.pos, pose: 'idle', expr: 'nervous' });
        },
        move: { who: 'videl', at: [-2.2, 0, 19.2], seconds: 1.6, face: 'goku' },
        pose: [{ who: 'videl', pose: 'ez_walk', face: 'nervous', speed: 6 }],
        cam: { subject: 'videl', focus: 'full', angle: 'three' },
        say: { who: 'videl', line: 'Um... excuse me...', duration: 1.6, style: 'quiet' },
      },
      {
        pose: [{ who: 'videl', pose: 'bg_belly', face: 'soft', speed: 5 }],
        cam: { subject: 'videl', focus: 'upper', angle: 'front' },
        say: { who: 'videl', line: 'Does it count... if one of them hasn\'t been born yet?', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'idle', face: 'shock' }],
        cam: { subject: 'gohan', focus: 'closeup', angle: 'three' },
        say: { who: 'adult_gohan', line: 'Videl...? You mean...?', duration: 2.2 },
        hold: 2.2,
      },
      {
        cam: { subject: 'videl', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'videl', line: 'I\'m pregnant, Gohan. I was going to tell you tonight.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        move: { who: 'chichi', at: [-5, 0, 16.4], seconds: 1, face: 'videl' },
        pose: [{ who: 'chichi', pose: 'run', face: 'grin', speed: 10 }],
        cam: { subject: 'chichi', focus: 'upper', angle: 'front' },
        say: { who: 'chichi', line: 'A GRANDCHILD!', duration: 1.8, style: 'shout' },
      },
      {
        pose: [{ who: 'gohan', pose: 'bg_cheer', face: 'grin', speed: 6 }, { who: 'chichi', pose: 'bg_cheer', face: 'grin', speed: 6 }],
        cam: { subject: 'gohan', with: 'videl', focus: 'full', angle: 'three' },
        say: { who: 'adult_gohan', line: 'I\'m... I\'m going to be a dad!', duration: 2.4 },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.shenron) pt(ctx, 'head', s.shenron.headPos());
          else pt(ctx, 'head', new V3(-27, 40, 24));
        },
        tick: (ctx) => st(ctx).shenron && st(ctx).shenron.eyes(0.9),
        cam: { from: { at: 'head', off: [16, -8, -18] }, look: { at: 'head' }, fov: 40 },
        say: { who: 'shenron', line: 'The child within her is a Saiyan. It will suffice.', duration: 3 },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'g_introPalm', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'Congratulations, you two! Okay — Videl, you\'re with us. Let\'s try that again!', duration: 3.4 },
        hold: 3.4,
      },
    ],
  };

  /* ---------------------------------------------------------------- THE SUPER SAIYAN GOD */
  S.bgr_god = {
    id: 'bgr_god',
    cast,
    clearMood: false,
    music: { song: 'ssj_god', level: 3 },
    events: [
      // from high above: the pillar into the storm, the little ship under it
      {
        call: (ctx) => {
          const s = st(ctx);
          K().skyTo(ctx.b, K().SKY.divine, 1);
          if (s.ritual) s.ritual.set(1);
          pt(ctx, 'circ', RIT.centre.clone());
        },
        tick: (ctx) => st(ctx).ritual && st(ctx).ritual.stream(),
        cam: { from: { at: 'circ', off: [40, 46, 52] }, to: { at: 'circ', off: [30, 58, 40] }, look: { at: 'circ', off: [0, 12, 0] }, fov: 52 },
        sfx: { name: 'wind', vol: 1, pitch: 0.5 },
        hold: 3.2,
      },
      // the hands joined, low
      {
        tick: (ctx) => st(ctx).ritual && st(ctx).ritual.stream(),
        cam: { from: { at: 'circ', off: [3.8, 0.5, 3.8] }, look: { at: 'circ', off: [0, 1.4, 0] }, fov: 50 },
        hold: 2,
      },
      // the faces: the prince, the son, the mother
      { cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' }, hold: 1.3 },
      { cam: { subject: 'gohan', focus: 'closeup', angle: 'front' }, hold: 1.3 },
      { cam: { subject: 'videl', focus: 'closeup', angle: 'three' }, hold: 1.4 },
      // it comes down: the light pours out of the sky into the one in the middle
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.sfx('ssjRise', s.goku, { vol: 1.1, pitch: 0.8 });
          b.cameraTraumaAt(s.goku.pos, 0.6);
        },
        pose: [{ who: 'goku', pose: 'g_godCalm', face: 'closed', speed: 4, aura: 1 }],
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          if (s.ritual) s.ritual.set(1 - t * 0.35);
          const top = s.goku.chest().add(new V3(0, 40 - t * 30, 0));
          for (let i = 0; i < 4; i++) b.vfx.trail(top.clone().lerp(s.goku.chest(), i / 4 + (b.frame % 4) * 0.05), 0xff8aa0, 1.2, 0.35);
          b.camera.addTrauma(0.03);
        },
        cam: { subject: 'goku', focus: 'full', angle: 'low', dist: 6 },
        hold: 2.2,
      },
      // the flash — and a silence full of mist
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          whiten(RING.map((k) => s[k]), false);
          if (s.ritual) s.ritual.set(0);
          K().toForm(s.goku, 'god');
          SL.ScreenFX.flash(0.55, '#ffd0d8');
          b.vfx.ring(s.goku.pos.clone().add(new V3(0, 0.2, 0)), 16, 0xff6a8a, 1, new V3(0, 1, 0));
          // a thin mist round his feet (a thick one at this distance is a white frame)
          b.vfx.dust(s.goku.pos, 2.4, 10, 0xf0d8dc);
          b.sfx('transformBurst', s.goku, { vol: 1.2, pitch: 0.8 });
          for (const k of RING) s[k].setState('scripted', { pose: 'idle', expression: 'shock' });
        },
        pose: [{ who: 'goku', pose: 'g_godCalm', face: 'closed', speed: 4, aura: 0.25 }],
        music: { song: null, level: 0 },
        cam: { subject: 'goku', focus: 'full', angle: 'three', focus2: 'face', dist2: 1.2 },
        hold: 3.6,
      },
      // the eyes open: red
      {
        pose: [{ who: 'goku', pose: 'g_godCalm', face: 'calm', speed: 4, aura: 0.5 }],
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        music: { song: 'ssj_god', level: 4 },
        hold: 2,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.goku, 'ground', { pos: s.goku.pos.clone(), face: s.beerus.pos, pose: 'g_godStance', expr: 'calm' });
        },
        cam: { subject: 'goku', focus: 'wide', angle: 'low', room: 2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'whis', pose: 'w_shock', face: 'smirk' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'My... he\'s really done it.', duration: 2.2 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        say: { who: 'beerus', line: 'So that\'s a Super Saiyan God.', duration: 2.4 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'lookHands', face: 'calm', speed: 5 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'So this is a god\'s power... It\'s so calm. I can feel everything.', duration: 3.4 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '(Kakarot... a god. Of course it\'s you.)', duration: 2.6, style: 'quiet' },
        hold: 2.6,
      },
      // the dragon goes, the balls scatter, the sky comes back
      {
        call: (ctx) => {
          const s = st(ctx);
          pt(ctx, 'head', s.shenron ? s.shenron.headPos() : new V3(-27, 40, 24));
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          if (s.shenron) s.shenron.rise(1 - t / 2);
          if (s.balls) s.balls.scatter(Math.min(1, t / 2));
          K().skyTo(b, K().SKY.divine, 1 - t / 2.2);
        },
        cam: { from: { at: 'head', off: [30, -18, -30] }, look: { at: 'head', off: [0, -16, 0] }, fov: 50 },
        say: { who: 'shenron', line: 'Farewell...', duration: 1.6 },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      whiten(RING.map((k) => s[k]), false);
      K().toForm(s.goku, 'god');
      ctx.m.teach(s.goku, 'form:god');
      if (s.ritual) {
        s.ritual.dispose();
        s.ritual = null;
      }
      if (s.shenron) {
        s.shenron.dispose();
        s.shenron = null;
      }
      if (s.balls) {
        s.balls.dispose();
        s.balls = null;
      }
      K().skyBack(b);
      b.stage.clearMood(1);
      ctx.m.flags.superSaiyanGod = true;
    },
  };

  const def = {
    id: 'bog_ritual',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'The Super Saiyan God',
    subtitle: 'Six Saiyans · the Eternal Dragon',
    character: 'goku',
    stage: 'cruise_liner',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Five righteous Saiyans must pour their hearts into a sixth. They count, and they are one short — until Videl speaks up.',
    rewards: ['Super Saiyan God (Goku)', 'Story: the ritual'],
    setup,
    phases: [P.deal, P.summon, P.attempt, P.videl, P.ritual, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogRitual = { RIT };
})();
