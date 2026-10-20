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

  // THE CIRCLE (the owner's ritual brief): the six stand in ONE tight ring facing inward, Goku a link in it like the
  // others, hands reaching to the neighbours — not five round a sixth. radius 1.5 m: close enough for the hands.
  const RIT = { centre: new V3(0, 0, 21), radius: 1.5, dragon: new V3(-27, 0, 24), attemptCap: 0.7, attemptSeconds: 3.2, seconds: 5.2, rise: 9 };
  // round the ring from Goku (at the far side, facing the god across the circle): his sons, Videl, Trunks, Vegeta
  const RING = ['goku', 'goten', 'gohan', 'videl', 'trunks', 'vegeta'];
  const FIVE = ['goku', 'goten', 'gohan', 'trunks', 'vegeta'];
  const DONORS = RING.slice(1);

  function setup(battle) {
    const b = battle;
    // Goku of the Super era: his own transformation lines, not Namek's
    K().superVoice(b);
    const s = BP().setup(b, { player: 'goku', godsHere: true });
    s.goku.lockedForms = { kaioken: true, god: true, godki: true };
    // after the god's temper: a few of them still a little worse for wear
    for (const k of ['vegeta', 'gohan', 'piccolo', 'goten', 'trunks']) if (s[k].setDamage) s[k].setDamage(1);
    for (const f of Object.values(s)) if (f && f.setState && f !== s.goku) f.untargetable = f.intangible = true;
    return s;
  }

  /** The circle: everyone in it evenly round one ring, facing in, hands out to the next. GROUND. */
  function circle(m, who) {
    const b = m.battle, s = b.story;
    const list = who.map((k) => s[k]);
    list.forEach((f, i) => {
      const a = (i / list.length) * Math.PI * 2;
      // the children stand a step further in, so their shorter arms still reach
      const r = RIT.radius * (f === s.goten || f === s.trunks ? 0.88 : 1);
      const p = RIT.centre.clone().add(new V3(Math.sin(a) * r, 0, Math.cos(a) * r));
      f.setHidden(false);
      m.space(f, 'ground', { pos: p, face: RIT.centre, pose: 'bg_ringLink', expr: 'closed' });
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
    for (const f of list) f.setState('scripted', { pose: 'bg_ringLink', expression: 'closed' });
    return list;
  }

  /** THE GLOW: a calm, harmonic blue-white light off each of them — not the jagged gold of a Super Saiyan. */
  function whiten(list, on) {
    for (const f of list) {
      if (on) {
        f.aura.setStyle({ color: 0xcfeeff, core: 0xffffff, particles: 0xe8faff, speed: 0.8 });
        f.rimLight = { color: 0xeaf8ff, strength: 0.7 };
      } else {
        f.model.setForm(f.form);
        f.aura.setStyle(f.form.aura || { color: 0xffffff });
        f.rimLight = null;
      }
    }
  }

  /**
   * VIDEL'S RESONANCE: the child inside her is a Saiyan, and the ki goes through her — her hair stands up and burns
   * gold, a Saiyan's gold aura round a human, the light on her face (on false gives her back her own).
   */
  function resonance(f, on) {
    const mdl = f.model;
    if (on) {
      if (f._ownHair === undefined) f._ownHair = mdl.currentHair ? mdl.currentHair.split('|')[0] : mdl.app.hair && mdl.app.hair.style;
      if (f._ownHair) mdl.setHair(K().spikeHair(f._ownHair), 0xffd23a);
      f.aura.setStyle({ color: 0xffd23a, core: 0xfff6c8, particles: 0xffe27a, speed: 1.3, lightning: false });
      f.rimLight = { color: 0xffe08a, strength: 0.9 };
    } else if (f._ownHair !== undefined) {
      mdl.setForm(f.form);
      f._ownHair = undefined;
      f.aura.setStyle(f.form.aura || { color: 0xffffff });
      f.rimLight = null;
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
      const ring = circle(m, FIVE);
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
          for (const f of ring) f.setState('scripted', { pose: 'bg_ringLink', expression: f === g ? 'focused' : 'closed', aura: k * 0.6 });
          K().chain(b, ring, 0xffe9a8, k);
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
        for (const f of ring) f.setState('scripted', { pose: 'bg_ringLink', expression: f === g ? 'shock' : 'closed', aura: k * 0.5 });
        K().chain(b, ring, 0xffe9a8, k);
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
      s.ritual = s.ritual || K().ritual(b, RIT.centre, RIT.radius + 0.6);
      m.onDispose(() => s.ritual && s.ritual.dispose());
      s.ritual.colour(0x8ae8ff);
      m.onDispose(() => whiten(ring, false));
      m.onDispose(() => resonance(s.videl, false));
      m.onDispose(() => ring.forEach((f) => (f.auraViewCap = null)));
      s.vortex = s.vortex || K().vortex(b, RIT.centre);
      m.onDispose(() => s.vortex && s.vortex.dispose());
      s.vortex.colour(0xffd27a);
      // the circle from above (a clean ring of six), Videl, Goku across from the god
      SL.Cinema.shotOn(m, { goku: g, videl: s.videl, vegeta: s.vegeta }, (t, el) => {
        const c = el % 9;
        return c < 3 ? { subject: 'goku', focus: 'wide', angle: 'high', room: 3 } : c < 6 ? { subject: 'videl', focus: 'upper', angle: 'three' } : { subject: 'goku', focus: 'upper', angle: 'front' };
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
          // the light goes through Videl: the Saiyan inside her answers
          { at: 0.38, run: () => {
            resonance(s.videl, true);
            b.vfx.flash(s.videl.headPos(), 1.6, 0xffe27a, 0.3, SL.Toon.tex.glow);
            b.sfx('kiUp', s.videl, { vol: 0.8, pitch: 1.2 });
            m.say('videl', '...!', 1.2, { style: 'quiet' });
          } },
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
          for (const f of ring) {
            f.setState('scripted', { pose: 'bg_ringLink', expression: f === s.videl && k > 0.38 ? 'shout' : f === g ? 'focused' : 'closed', aura: f === s.videl && k > 0.38 ? 0.55 : 0.15 + k * 0.3 });
            f.auraViewCap = 0.45;
          }
          K().chain(b, ring, k < 0.55 ? 0xdff8ff : 0xffb0c0, k);
          // the storm wheeling over the ship: gold, then magenta, then divine red
          s.vortex.set(Math.max(0, (k - 0.15) / 0.6));
          s.vortex.spin();
          s.vortex.colour(k < 0.55 ? 0xffd27a : new THREE.Color(0xffd27a).lerp(new THREE.Color(0xe0306a), (k - 0.55) / 0.45).getHex());
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
  // (rebuilt 2026-10-06 to the owner's breakdown: the donors lifted off the deck, Goku breaking the chain and rising
  //  into the sky in a sphere of blue-white light, arms and legs spread, his body thinning, his hair going red, the red
  //  storm collapsing into his chest, a flash, silence — and the red eyes opening; then down onto the deck.)
  const GOD_LOOK = () => (SL.data.characters.goku.forms.find((x) => x.id === 'god') || {}).look || {};
  S.bgr_god = {
    id: 'bgr_god',
    cast,
    clearMood: false,
    music: { song: 'ssj_god', level: 3 },
    events: [
      // 1. from high above: the pillar of light into the storm, the red vortex wheeling over the little ship
      {
        call: (ctx) => {
          const s = st(ctx);
          K().skyTo(ctx.b, K().SKY.divine, 1);
          if (s.ritual) s.ritual.set(1);
          if (!s.vortex) s.vortex = K().vortex(ctx.b, RIT.centre);
          s.vortex.set(1);
          s.vortex.colour(0xe0306a);
          ctx.m.onDispose(() => s.vortex && s.vortex.dispose());
          pt(ctx, 'circ', RIT.centre.clone());
        },
        tick: (ctx) => {
          const s = st(ctx);
          if (s.ritual) s.ritual.stream();
          if (s.vortex) s.vortex.spin();
        },
        cam: { from: { at: 'circ', off: [40, 46, 52] }, to: { at: 'circ', off: [30, 58, 40] }, look: { at: 'circ', off: [0, 14, 0] }, fov: 54, raw: true },
        sfx: { name: 'wind', vol: 1, pitch: 0.5 },
        hold: 3,
      },
      // 2. the chain of hands, low across the deck: six of them, the light running from one to the next
      {
        tick: (ctx) => {
          const s = st(ctx);
          if (s.ritual) s.ritual.stream();
          if (s.vortex) s.vortex.spin();
          K().chain(ctx.b, RING.map((k) => s[k]), 0xffb0c0, 1);
        },
        cam: { from: { at: 'circ', off: [3.4, 0.55, 3.4] }, to: { at: 'circ', off: [3.9, 0.5, 2.6] }, look: { at: 'circ', off: [0, 1.15, 0] }, fov: 50, raw: true },
        hold: 2.2,
      },
      // 3. the faces: the prince, the son — and Videl, gold, the light on her face
      { cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' }, tick: (ctx) => st(ctx).vortex && st(ctx).vortex.spin(), hold: 1.2 },
      { cam: { subject: 'gohan', focus: 'closeup', angle: 'front' }, tick: (ctx) => st(ctx).vortex && st(ctx).vortex.spin(), hold: 1.2 },
      { cam: { subject: 'videl', focus: 'closeup', angle: 'three' }, tick: (ctx) => st(ctx).vortex && st(ctx).vortex.spin(), hold: 1.6 },
      // 4. THE LEVITATION: the God Ki warps the weight out of them — the five lift off the planks, white-blue light
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.sfx('rumble', null, { vol: 0.9, pitch: 0.7 });
          b.sfx('kiUp', s.goku, { vol: 0.8, pitch: 0.7 });
        },
        space: DONORS.map((k) => ({ who: k, mode: 'flight', to: { at: k + ':feet', off: [0, 0.9, 0] }, seconds: 1.6, pose: 'bg_ringFloat', endPose: 'bg_ringFloat' })),
        tick: (ctx) => {
          const s = st(ctx);
          if (s.vortex) s.vortex.spin();
          K().chain(ctx.b, RING.map((k) => s[k]), 0xdff8ff, 1);
        },
        cam: { from: { at: 'circ', off: [5.2, 0.45, -5.2] }, look: { at: 'circ', off: [0, 1.7, 0] }, fov: 46, raw: true },
        hold: 0.5,
      },
      // 5. Goku lets go: the chain breaks at his hands
      {
        pose: [{ who: 'goku', pose: 'g_godCalm', face: 'closed', speed: 5, aura: 0.6 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.shell = K().shell(b, s.goku, 0xdff4ff);
          ctx.m.onDispose(() => s.shell && s.shell.dispose());
          s.goku.aura.setStyle({ color: 0xcfeeff, core: 0xffffff, particles: 0xe8faff, speed: 0.8 });
          b.vfx.flash(s.goku.chest(), 2, 0xdff8ff, 0.3, SL.Toon.tex.glow);
        },
        tick: (ctx, t) => {
          const s = st(ctx);
          if (s.vortex) s.vortex.spin();
          if (s.shell) s.shell.set(t / 1.1);
        },
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        hold: 1.1,
      },
      // 6. UP: he rises out of the circle into the sky — the camera on the deck looking up after him
      {
        space: { who: 'goku', mode: 'flight', to: { at: 'circ', off: [0, RIT.rise, 0] }, seconds: 2.6, pose: 'bg_godFloat', endPose: 'bg_godFloat' },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          if (s.vortex) s.vortex.spin();
          if (s.shell) s.shell.set(1);
          if (b.frame % 3 === 0) b.vfx.trail(s.goku.pos.clone(), 0xdff8ff, 0.5, 0.5);
        },
        cam: { from: { at: 'circ', off: [4.6, 1.1, 4.6] }, look: { at: 'goku' }, fov: 48, raw: true },
        sfx: { name: 'ssjRise', vol: 0.9, pitch: 0.7 },
      },
      // 7. from above him: the ship small beneath, the five still floating in their circle of light
      {
        tick: (ctx) => {
          const s = st(ctx);
          if (s.vortex) s.vortex.spin();
        },
        cam: { from: { at: 'goku', off: [2.2, 5.5, -5] }, to: { at: 'goku', off: [2.8, 8, -6.4] }, look: { at: 'circ' }, fov: 52, raw: true },
        hold: 2.2,
      },
      // 8. held up in the light: eyes shut, the hair still black — the divine energy going into him, his body thinning;
      //    the camera turning slowly round him
      {
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          if (s.vortex) s.vortex.spin();
          if (b.frame % 3 === 0) b.vfx.streamInward(s.goku.chest(), 2.6, 0xe8f8ff, 3, 0.16, 0.5);
          K().slim(s.goku, Math.min(0.5, t / 2.8 * 0.5), GOD_LOOK());
        },
        cam: { from: { at: 'goku' }, orbit: { at: 'goku', radius: 3.4, from: 0.4, to: 1.5, y: 0.4, y2: 0.2 }, look: { at: 'goku' }, fov: 42, raw: true },
        hold: 2.8,
      },
      // 9. the change: the hair darkening toward red in three breaths, red light in the white, the body leaner still
      {
        call: (ctx) => {
          ctx.hairSteps = [0x3a1418, 0x7a1424, 0xb8162e];
          ctx.hairAt = 0;
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          if (s.vortex) s.vortex.spin();
          K().slim(s.goku, 0.5 + Math.min(0.5, t / 2.6 * 0.5), GOD_LOOK());
          const step = Math.min(2, Math.floor(t / 0.8));
          if (step >= ctx.hairAt) {
            s.goku.model.setHair('goku', ctx.hairSteps[step]);
            ctx.hairAt = step + 1;
            b.vfx.flash(s.goku.headPos(), 1.4, 0xff5a7a, 0.18, SL.Toon.tex.glow);
          }
          // red energy creeping into the white light
          if (s.shell) s.shell.colour(new THREE.Color(0xdff4ff).lerp(new THREE.Color(0xff6a8a), Math.min(1, t / 2.6)).getHex());
          if (b.frame % 3 === 0) b.vfx.streamInward(s.goku.chest(), 2.4, t > 1.2 ? 0xff5a7a : 0xe8f8ff, 3, 0.16, 0.5);
          if (t > 1.2 && b.frame % 5 === 0) b.vfx.trail(s.goku.chest().add(new V3(Math.sin(t * 9) * 0.5, -0.4, Math.cos(t * 9) * 0.5)), 0xff6a2a, 0.5, 0.4);
        },
        cam: { from: { at: 'goku' }, orbit: { at: 'goku', radius: 3.0, radius2: 2.4, from: 1.5, to: 2.7, y: 0.2, y2: 0.4 }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 40, raw: true },
        sfx: { name: 'heartbeat', vol: 0.9 },
        hold: 2.6,
      },
      // 10. behind him and below: the red storm collapses — the whole vortex drawn down in a funnel onto his chest
      {
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          if (s.vortex) {
            s.vortex.spin();
            s.vortex.collapse(Math.min(1, t / 2), s.goku.chest());
          }
          b.camera.addTrauma(0.02 + t * 0.03);
          if (b.frame % 2 === 0) b.vfx.streamInward(s.goku.chest(), 3.4, 0xff4a6a, 4, 0.2, 0.4);
        },
        cam: { from: { at: 'goku', local: [0.9, -1.2, -3.4] }, look: { at: 'goku', off: [0, 4, 0] }, fov: 52, raw: true },
        sfx: { name: 'rumble', vol: 1.1, pitch: 0.6 },
        hold: 2.1,
      },
      // 11. the flash
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          whiten(DONORS.map((k) => s[k]), false);
          resonance(s.videl, false);
          if (s.ritual) s.ritual.set(0);
          if (s.vortex) {
            s.vortex.dispose();
            s.vortex = null;
          }
          K().toForm(s.goku, 'god');
          SL.ScreenFX.flash(0.95, '#ffd8e8');
          b.vfx.ring(s.goku.chest(), 14, 0xff6a8a, 1, new V3(0, 1, 0));
          b.vfx.flash(s.goku.chest(), 9, 0xffe8f0, 0.6, SL.Toon.tex.glow);
          b.sfx('transformBurst', s.goku, { vol: 1.2, pitch: 0.8 });
          if (s.shell) s.shell.set(0);
        },
        music: { song: null, level: 0 },
        pose: [{ who: 'goku', pose: 'bg_godFloat', face: 'closed', speed: 4, aura: 0.15 }],
        cam: { subject: 'goku', focus: 'full', angle: 'front' },
        hold: 0.5,
      },
      // 12. silence: the light thins away; the camera comes slowly in to his face, the eyes still shut
      {
        pose: [{ who: 'goku', pose: 'g_godCalm', face: 'closed', speed: 3, aura: 0.15 }],
        cam: { subject: 'goku', focus: 'upper', focus2: 'face', angle: 'front', ease: 'inOut' },
        sfx: { name: 'wind', vol: 0.25, pitch: 0.5 },
        hold: 2.6,
      },
      // 13. the eyes open: crimson
      {
        pose: [{ who: 'goku', pose: 'g_godCalm', face: 'calm', speed: 3, aura: 0.3 }],
        call: (ctx) => {
          const s = st(ctx);
          ctx.b.vfx.flash(s.goku.headPos(), 0.7, 0xff2a4a, 0.25, SL.Toon.tex.glow);
          ctx.b.sfx('kiUp', s.goku, { vol: 0.6, pitch: 0.6 });
        },
        cam: { subject: 'goku', focus: 'face', angle: 'front' },
        music: { song: 'ssj_god', level: 4 },
        hold: 1.8,
      },
      // 14. down: the others settle back onto the planks, he drifts down after them — his boots touch the deck, silent
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.shell) {
            s.shell.dispose();
            s.shell = null;
          }
        },
        space: [{ who: 'goku', mode: 'landing', to: { at: 'circ' }, seconds: 2.2, pose: 'g_godCalm', endPose: 'g_godStance', expr: 'calm' }].concat(DONORS.map((k) => ({ who: k, mode: 'landing', to: { at: k + ':feet' }, seconds: 1.2, pose: 'bg_ringFloat', endPose: 'idle', expr: 'shock' }))),
        cam: { from: { at: 'circ', off: [Math.sin(Math.PI / 6) * 2.3, 0.32, Math.cos(Math.PI / 6) * 2.3] }, look: { at: 'circ', off: [0, 0.3, 0] }, fov: 42, raw: true },
      },
      // 15. the Super Saiyan God: slimmer, red hair, red eyes, a flame for an aura — calm
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.ring(s.goku.pos.clone().add(new V3(0, 0.15, 0)), 9, 0xff6a3a, 0.8, new V3(0, 1, 0));
          ctx.m.space(s.goku, 'ground', { pos: s.goku.pos.clone(), face: s.beerus.pos, pose: 'g_godStance', expr: 'calm' });
        },
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'calm', speed: 4, aura: 0.9 }],
        cam: { subject: 'goku', focus: 'full', focus2: 'upper', angle: 'three', ease: 'inOut' },
        hold: 2.6,
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
      resonance(s.videl, false);
      for (const k of RING) s[k].auraViewCap = null;
      for (const k of ['shell', 'vortex']) if (s[k]) {
        s[k].dispose();
        s[k] = null;
      }
      for (const k of DONORS) if (s[k].pos.y > 0.2) ctx.m.space(s[k], 'ground', { pos: s[k].pos.clone(), pose: 'idle', expr: 'shock' });
      if (s.goku.pos.y > 0.2) ctx.m.space(s.goku, 'ground', { pos: RIT.centre.clone(), face: s.beerus.pos, pose: 'g_godStance', expr: 'calm' });
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
