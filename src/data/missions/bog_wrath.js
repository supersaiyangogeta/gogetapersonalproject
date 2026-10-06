/*
 * CHAPTER 16 — BATTLE OF GODS, mission 4: "That's My Bulma!" (canon; the Princess Bulma, GROUND: the deck).
 * The Z Fighters against an angry god — each of them played, each of them handled.
 *
 *   BUU       (scene)          the slap; "Buu... MAD!"; Buu's charge, the poke; Buu down
 *   GOTENKS * (play)           Fu-sion HA! — Super Saiyan Gotenks goes in; every blow slipped...
 *   WRIST     (scene)          ...until the god just takes his wrist, and slaps him across the deck (they come apart)
 *   TRIO *    (play)           Piccolo, with Tien and 18 at his side: three on one, and three slipped at once...
 *   CHOPSTICKS(scene)          a pair of chopsticks to the forehead puts Piccolo down; Tien and 18 bounce off his aura
 *   GOHAN *   (play)           Ultimate Gohan: the fastest of them, and the god actually has to move...
 *   SLAM      (scene)          a hand on his head and down he goes, into Buu
 *   BULMA     (scene)          she marches up and slaps a god; the backhand; she is on the deck. CUT TO VEGETA: the
 *                              silence, the pupils, the teeth, the trembling, the aura, the planks — "THAT'S...
 *                              MY... BULMAAAAA!"
 *   RAGE *    (play)           Super Saiyan 2 Vegeta, out of his mind: his blows LAND (the god takes them, the god
 *                              gets knocked about) while the rage lasts; then the GALICK GUN, played: Vegeta's own
 *                              special, charged and fired by the player (the story fires it only if nobody does)
 *   SMOKE     (scene)          the smoke clears; not a mark; one chop; "I think I've had enough of this planet" —
 *                              and Goku, by Instant Transmission, standing in the way
 *   AFTER
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const BP = () => SL.data.bogParty;
  const S = (SL.data.scenes = SL.data.scenes || {});

  // the fight's middle on the deck (GROUND), and how long each stretch runs
  const W = {
    centre: new V3(0, 0, 8),
    gotenks: { evades: 7, seconds: 26 },
    trio: { evades: 12, seconds: 32 },
    gohan: { evades: 7, seconds: 26 },
    rage: { seconds: 24, hits: 16, vegetaDealt: 1.6, beerusTaken: 0.06, beerusDealt: 0.25 },
  };

  function setup(battle) {
    const b = battle;
    // Goku of the Super era: his own transformation lines, not Namek's
    K().superVoice(b);
    const s = BP().setup(b, { player: 'vegeta', godsHere: true });
    s.gotenks = null;
    s.goku.setHidden(true);
    // Age 778: Vegeta has every level up to the second; Gohan the Ultimate; Gotenks his gold
    s.vegeta.lockedForms = { majin: true, ssj3: true, super_vegeta: true };
    for (const f of Object.values(s)) if (f && f.setState && f !== s.vegeta) f.untargetable = f.intangible = true;
    return s;
  }

  /** The deck cleared for a stretch of the fight: the fight in the middle, everybody else back at the rails. */
  function arena(m, active, extra = {}) {
    const b = m.battle, s = b.story;
    const all = ['bulma', 'chichi', 'krillin', 'c18', 'piccolo', 'gohan', 'videl', 'tien', 'yamcha', 'satan', 'buu', 'goten', 'trunks', 'whis', 'vegeta'];
    const spots = {
      bulma: [-4, -6], chichi: [-6.4, -5.4], krillin: [-11, 2], c18: [-11.2, 5], piccolo: [11.2, 18], gohan: [-10.6, 22], videl: [-10, 25],
      tien: [10.8, 22], yamcha: [10.4, 26], satan: [6.6, -11], buu: [-10, 10.5], goten: [-2, -7], trunks: [0, -7.5], whis: [9.6, 13], vegeta: [3.6, -5.6],
    };
    const support = [];
    const down = s.down || new Set();
    for (const k of all) {
      const f = s[k];
      if (!f || active.includes(f) || f.hidden || f.fusedInto) continue;
      const p = (extra.at && extra.at[k]) || spots[k];
      const ko = down.has(k);
      support.push({ f, at: new V3(p[0], 0, p[1]), pose: (extra.pose && extra.pose[k]) || (ko ? 'knockdown' : k === 'whis' ? 'w_idle' : 'idle'), face: (extra.face && extra.face[k]) || (ko ? 'ko' : 'shock') });
    }
    m.cast({ active, support }, { centre: W.centre.clone(), supportClear: 4 });
  }

  /**
   * A STRETCH OF THE GAUNTLET: `hero` (played) against the god, who slips everything (storyEvade 'god' from every
   * fighter in `from`). Ends after `evades` slipped blows or `seconds`. Allies fight beside the player.
   */
  function* gauntlet(m, hero, cfg, opts = {}) {
    const b = m.battle, s = b.story, bs = s.beerus;
    m.lock(true);
    m.clearObjectives();
    K().clearCombat(b);
    const allies = opts.allies || [];
    arena(m, [hero, bs].concat(allies));
    const C = W.centre;
    m.space(hero, 'ground', { pos: C.clone().add(new V3(0, 0, -4)), face: C });
    m.space(bs, 'ground', { pos: C.clone().add(new V3(0, 0, 3)), face: hero.pos });
    allies.forEach((a, i) => m.space(a, 'ground', { pos: C.clone().add(new V3(i ? 4 : -4, 0, -2)), face: bs.pos }));
    bs.hp = bs.hpMax;
    const se = K().godDodge(bs, { from: [hero].concat(allies), kinds: opts.kinds });
    m.powerGap(bs, { from: [hero].concat(allies), mul: 0, beams: true });
    K().brawl(m, hero, bs, { profile: { aggression: opts.aggression || 0.15, defense: 0.95 }, song: 'beerus_theme', music: 5 });
    bs.controller = K().godBrain(b, bs, Object.assign({ counter: 34, heavy: 0.4, flick: 0.15, any: allies.length > 0 }, opts.brain || {}));
    for (const a of allies) K().ally(m, a, bs);
    const deck = K().keepOnDeck(m, [hero, bs].concat(allies));
    const sf = m.storyFight({ floors: [{ f: hero, at: 0.35 }].concat(allies.map((a) => ({ f: a, at: 0.35 }))), dealt: [{ f: bs, mul: 0.3 }], fighters: [hero, bs].concat(allies), space: 'ground' });
    m.objective('god', opts.objective || 'Hit Beerus', { icon: 'target' });
    let t = 0, said = 0;
    const L = (opts.lines || []).slice().sort((a, c) => a.at - c.at);
    const hook = () => {
      if (b.inputLocked) return;
      t += 1 / 60;
      while (said < L.length && (se.count || 0) >= L[said].at) {
        m.say(L[said].who, L[said].line, L[said].duration || 2.6, { style: L[said].style });
        said++;
      }
    };
    m.tickHooks.push(hook);
    yield () => (se.count || 0) >= cfg.evades || t > cfg.seconds;
    K().unhook(m, hook);
    K().unhook(m, deck);
    sf.off();
    m.failObjective('god');
    m.lock(true);
    K().clearCombat(b);
    bs.storyEvade = null;
    bs.controller = K().scripted();
    for (const f of [hero, bs].concat(allies)) {
      f.setState(f === bs ? 'scripted' : 'free', { pose: 'bs_idle', expression: 'angry' });
      if (f !== hero && f !== bs) f.controller = K().scripted();
    }
    yield* m.cine(0.3);
    return se.count || 0;
  }

  /** Who is already down when a stretch starts (a restart from a checkpoint lays them out again). */
  function downed(m, keys) {
    const s = m.battle.story;
    s.down = new Set(keys);
  }

  const P = {};
  P.buu = K().scene('buu', 'bgw_buu');

  P.gotenks = {
    id: 'gotenks',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story;
      m.lock(true);
      m.clearObjectives();
      downed(m, ['buu']);
      arena(m, [s.goten, s.trunks, s.beerus]);
      yield* SL.Cinema.play(m, 'bgw_fuse');
      const gk = s.gotenks;
      m.flags.gotenksEvaded = yield* gauntlet(m, gk, W.gotenks, {
        objective: 'Gotenks: land a hit on Beerus',
        aggression: 0.12,
        lines: [
          { at: 2, who: 'gotenks', line: 'Hold still, cat-face!', style: 'shout' },
          { at: 4, who: 'beerus', line: 'A fusion. Cute.' },
          { at: 6, who: 'gotenks', line: 'Why can\'t I HIT him?!', style: 'shout' },
        ],
      });
      yield* SL.Cinema.play(m, 'bgw_wrist');
    },
  };

  P.trio = {
    id: 'trio',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story;
      if (s.gotenks && s.gotenks.fusion && s.gotenks.fusion.active) SL.Fusion.defuse(b, s.gotenks.fusion, { silent: true });
      downed(m, ['buu', 'goten', 'trunks']);
      arena(m, [s.piccolo, s.tien, s.c18, s.beerus]);
      yield* SL.Cinema.play(m, 'bgw_trioIn');
      m.flags.trioEvaded = yield* gauntlet(m, s.piccolo, W.trio, {
        allies: [s.tien, s.c18],
        objective: 'Piccolo, Tien and 18: land a hit on Beerus',
        kinds: ['parry', 'sway', 'parry', 'step', 'parry', 'vanish'],
        aggression: 0.18,
        lines: [
          { at: 3, who: 'tien', line: 'He\'s turning every blow aside!', style: 'shout' },
          { at: 6, who: 'android_18', line: 'He\'s not even trying.' },
          { at: 9, who: 'piccolo', line: 'All at once! Don\'t give him an opening!', style: 'shout' },
        ],
      });
      yield* SL.Cinema.play(m, 'bgw_chopsticks');
    },
  };

  P.gohan = {
    id: 'gohan',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story;
      downed(m, ['buu', 'goten', 'trunks', 'piccolo', 'tien', 'c18']);
      arena(m, [s.gohan, s.beerus]);
      yield* SL.Cinema.play(m, 'bgw_gohanIn');
      m.flags.gohanEvaded = yield* gauntlet(m, s.gohan, W.gohan, {
        objective: 'Ultimate Gohan: land a hit on Beerus',
        kinds: ['step', 'vanish', 'parry', 'step', 'vanish'],
        aggression: 0.3,
        lines: [
          { at: 2, who: 'beerus', line: 'Oh? You\'re the quickest one yet.' },
          { at: 5, who: 'adult_gohan', line: 'I can\'t... even touch him...!', style: 'shout' },
        ],
      });
      yield* SL.Cinema.play(m, 'bgw_slam');
    },
  };

  P.bulma = K().scene('bulma', 'bgw_bulma', { before: (m) => {
    const s = m.battle.story;
    downed(m, ['buu', 'goten', 'trunks', 'piccolo', 'tien', 'c18', 'gohan']);
    arena(m, [s.bulma, s.beerus, s.vegeta]);
    if (m.battle.player !== s.vegeta) m.battle.switchPlayer(s.vegeta, { force: true });
  } });

  /**
   * THE RAGE: Super Saiyan 2 Vegeta, out of his mind. His blows land — the god takes them, staggers, is knocked
   * about — for as long as the rage lasts. Then the Galick Gun, on a cue.
   */
  P.rage = {
    id: 'rage',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, veg = s.vegeta, bs = s.beerus, R = W.rage;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      K().toForm(veg, 'ssj2');
      downed(m, ['buu', 'goten', 'trunks', 'piccolo', 'tien', 'c18', 'gohan', 'bulma']);
      arena(m, [veg, bs], { at: { bulma: [-1.4, 2.4] } });
      m.space(veg, 'ground', { pos: W.centre.clone().add(new V3(0, 0, -3)), face: W.centre });
      m.space(bs, 'ground', { pos: W.centre.clone().add(new V3(0, 0, 2)), face: veg.pos });
      s.bulma.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      bs.storyEvade = null;
      bs.storyNoSell = null;
      bs.hp = bs.hpMax;
      // the rage itself: a crimson-gold flame round him
      veg.aura.setStyle({ color: 0xffb020, core: 0xffffff, particles: 0xff4a20, speed: 1.9, sharp: 0.6, lightning: true, flame: [0xff3a1a, 0xffc020, 0xff6a2a, 0xffe060] });
      const auraBack = () => veg.aura.setStyle(veg.form.aura);
      m.onDispose(auraBack);
      K().brawl(m, veg, bs, { profile: { aggression: 0.25, defense: 0.45 }, song: 'pride', music: 6 });
      bs.storyEvade = { mode: 'god', chance: 0.12, gap: 50, kinds: ['parry', 'sway'], swayPose: 'bg_sway', parryPose: 'bg_parry', count: 0 };
      const deck = K().keepOnDeck(m, [veg, bs]);
      const sf = m.storyFight({ floors: [{ f: bs, at: 0.8 }, { f: veg, at: 0.4 }], dealt: [{ f: veg, mul: R.vegetaDealt }, { f: bs, mul: R.beerusDealt }], taken: [{ f: bs, mul: R.beerusTaken }], fighters: [veg, bs], space: 'ground' });
      let hits = 0, rage = 1, t = 0, shown = -1;
      const lines = [[3, 'beerus', 'Oh?'], [6, 'krillin', 'Vegeta\'s... actually hitting him?!'], [9, 'beerus', 'He hit me. He actually hit me!'], [12, 'whis', 'My. He\'s stronger than the one with the long hair.'], [14, 'vegeta', 'HOW DARE YOU! HOW DARE YOU!']];
      let said = 0;
      const offD = b.on('damage', (e) => {
        if (e.target === bs && e.attacker === veg && !e.blocked) {
          hits++;
          b.cameraTraumaAt(bs.pos, 0.18);
        }
      });
      m.onDispose(offD);
      m.objective('rage', 'RAGE  ·  100%');
      m.objective('hits', 'Make him pay', { icon: 'target', target: R.hits });
      m.say('vegeta', 'RRRAAAAAAGH!', 1.6, { style: 'shout' });
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        rage = Math.max(0, 1 - t / R.seconds);
        m.progress('hits', Math.min(R.hits, hits));
        const bars = Math.ceil(rage * 10);
        if (bars !== shown) {
          shown = bars;
          m.objective('rage', 'RAGE  ·  ' + bars * 10 + '%');
        }
        while (said < lines.length && hits >= lines[said][0]) {
          m.say(lines[said][1], lines[said][2], 2.4, { style: lines[said][1] === 'vegeta' ? 'shout' : undefined });
          said++;
        }
        if (b.frame % 6 === 0 && veg.alive) b.vfx.sparks(veg.pos.clone().add(new V3(0, 0.1, 0)), 0xffb040, 3, 3, 0.08);
      };
      m.tickHooks.push(hook);
      yield () => hits >= R.hits || rage <= 0;
      K().unhook(m, hook);
      offD();
      sf.off();
      m.complete('hits');
      m.flags.rageHits = hits;
      // THE GALICK GUN: on a cue, point blank
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      m.lock(true);
      const away = veg.pos.clone().sub(bs.pos).setY(0);
      if (away.lengthSq() < 0.01) away.set(0, 0, -1);
      away.normalize();
      m.space(veg, 'air', { pos: bs.pos.clone().addScaledVector(away, 9), height: 3.5, face: bs.pos, pose: 'v_galickCharge', expr: 'shout' });
      bs.setState('scripted', { pose: 'bs_idle', expression: 'smirk' });
      SL.Cinema.shotOn(m, { vegeta: veg, beerus: bs }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 1.8);
      m.say('vegeta', 'Take THIS!', 1.6, { style: 'shout' });
      yield* m.cine(1.8);
      m.endShot();
      // THE GALICK GUN, PLAYED (the owner: the rage stays playable, the Galick Gun through gameplay): Vegeta's own
      // special — hold to charge, let go to fire — at a god who stands there and lets him
      veg.ki = Math.max(veg.ki, veg.kiMax * 0.9);
      if (veg._playerController) veg.controller = veg._playerController;
      if (b.player === veg && veg.setState) veg.setState('free');
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      for (const k of ['s1', 'mx', 'my', 'up', 'upPressed', 'down', 'guard', 'target', 'charge']) delete lim[k];
      m.limits(lim);
      m.lock(false);
      b.aiLocked = true;
      m.objective('galick', 'Galick Gun — point blank', { icon: 'beam' });
      m.prompt('galickGun', 'special1', 'GALICK GUN — hold to charge, let go to fire', { required: true, always: true, until: () => veg.state === 'beamFire' });
      let fired = false, landed = false, wait = 0;
      const offG = b.on('damage', (e) => {
        if (e.attacker === veg && e.target === bs && e.type === 'beam') landed = true;
      });
      m.onDispose(offG);
      const gHook = () => {
        if (b.inputLocked) return;
        wait += 1 / 60;
        if (veg.state === 'beamFire') fired = true;
        // he stands there and takes it, arms behind his back
        bs.vel.set(0, 0, 0);
        if (veg.ki < 40 && veg.state === 'free') veg.ki = Math.min(veg.kiMax, veg.ki + 1);
      };
      m.tickHooks.push(gHook);
      // played: until the beam reaches him (or has run out); never pressed in 12 s: the story fires it for him
      yield () => (fired && (landed || (veg.state !== 'beamFire' && veg.state !== 'beamCharge'))) || (!fired && wait > 12 && veg.state !== 'beamCharge');
      K().unhook(m, gHook);
      offG();
      m.limits(null);
      m.flags.galick = fired ? 'player' : 'story';
      m.complete('galick');
      K().unhook(m, deck);
      auraBack();
      m.lock(true);
      if (fired) {
        // his beam, all the way into the god: hold on it a moment, then the smoke
        SL.Cinema.shotOn(m, { vegeta: veg, beerus: bs }, { subject: 'beerus', focus: 'wide', angle: 'three', room: 4 }, 1.2);
        yield* m.cine(landed ? 1 : 0.4);
      } else yield* SL.Cinema.play(m, 'bgw_galick');
      bs.controller = K().scripted();
      yield* SL.Cinema.play(m, 'bgw_smoke');
    },
  };

  P.after = K().after('THAT\'S MY BULMA!');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, p) => K().pt(ctx, n, p);

  /* ---------------------------------------------------------------- Buu */
  S.bgw_buu = {
    id: 'bgw_buu',
    cast,
    music: { song: 'beerus_theme', level: 3 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.beerus, 'ground', { pos: new V3(-6.4, 0, 9.4), face: s.buu.pos, pose: 'bg_fury', expr: 'angry' });
          ctx.m.space(s.buu, 'ground', { pos: BP().v('buu'), face: s.beerus.pos, pose: 'bg_hug', expr: 'grin' });
        },
        pose: [{ who: 'beerus', pose: 'bs_backhandW', face: 'angry', speed: 12 }],
        cam: { subject: 'beerus', with: 'buu', focus: 'full', angle: 'three' },
        hold: 0.5,
      },
      // the slap: Buu spins away down the deck
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_backhand', expression: 'angry', speed: 30 });
          b.vfx.flash(s.buu.headPos(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('punchHeavy', s.buu, { pitch: 1.3, vol: 1.2 });
          b.cameraTraumaAt(s.buu.pos, 0.5);
        },
        space: { who: 'buu', mode: 'slide', dir: [1, 0, 0.4], distance: 9, seconds: 0.5, endPose: 'knockdown', expr: 'hurt' },
        cam: { subject: 'buu', focus: 'full', angle: 'three' },
      },
      {
        pose: [{ who: 'buu', pose: 'getup', face: 'angry', speed: 6 }],
        cam: { subject: 'buu', focus: 'closeup', angle: 'front' },
        say: { who: 'majin_buu', to: 'beerus', line: 'You... hit Buu. Buu... MAD!', duration: 2.4, style: 'shout' },
        tick: (ctx) => {
          const s = st(ctx);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.trail(s.buu.headPos().add(new V3(0, 0.45, 0)), 0xf4f4f4, 0.5, 0.6);
        },
        sfx: { name: 'steam', vol: 0.9 },
        hold: 2.6,
      },
      // the charge, and one poke in the belly
      {
        space: { who: 'buu', mode: 'flight', to: { at: 'beerus', off: [1.4, -1.3, 0.4] }, seconds: 0.45, pose: 'dash', endPose: 'dash' },
        pose: [{ who: 'beerus', pose: 'bs_pokeW', face: 'angry', speed: 14 }],
        cam: { subject: 'beerus', with: 'buu', focus: 'full', angle: 'side' },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_poke', expression: 'angry', speed: 30 });
          b.vfx.ring(s.buu.chest(), 2.4, 0xffffff, 0.3);
          b.sfx('punchHeavy', s.buu, { pitch: 0.8, vol: 1.3 });
          b.slowmo(0.3, 0.5);
        },
        space: { who: 'buu', mode: 'groundImpact', to: { at: 'buu', off: [3, 0, 0.5] }, seconds: 0.35, endPose: 'knockdown', expr: 'ko', radius: 1.4, depth: 0.05 },
        cam: { subject: 'buu', focus: 'full', angle: 'high' },
      },
      {
        pose: [{ who: 'satan', pose: 'idle', face: 'shock' }],
        cam: { subject: 'satan', focus: 'upper', angle: 'front' },
        say: { who: 'mr_satan', to: 'buu', line: 'B-BUU! He knocked out BUU with one finger!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.goten, 'ground', { pos: new V3(-1.2, 0, 2.6), face: s.beerus.pos, pose: 'idle', expr: 'angry' });
          ctx.m.space(s.trunks, 'ground', { pos: new V3(0.6, 0, 2.4), face: s.beerus.pos, pose: 'idle', expr: 'angry' });
        },
        cam: { subject: 'trunks', with: 'goten', focus: 'full', angle: 'front' },
        say: { who: 'kid_trunks', to: 'beerus', line: 'Hey! Nobody beats up Buu at OUR party!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      s.buu.setState('scripted', { pose: 'knockdown', expression: 'ko' });
    },
  };

  /* ---------------------------------------------------------------- Gotenks */
  S.bgw_fuse = {
    id: 'bgw_fuse',
    cast,
    events: [
      {
        pose: [{ who: 'goten', pose: 'idle', face: 'determined' }, { who: 'trunks', pose: 'idle', face: 'determined' }],
        cam: { subject: 'goten', with: 'trunks', focus: 'full', angle: 'front' },
        say: { who: 'goten', to: 'trunks', line: 'Trunks! Let\'s do it!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      {
        cam: { subject: 'trunks', with: 'goten', focus: 'full', angle: 'three' },
        say: { who: 'kid_trunks', to: 'goten', line: 'Fu... sion... HA!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      if (!s.gotenks || !s.gotenks.alive || !(s.gotenks.fusion && s.gotenks.fusion.active)) {
        s.goten.setHidden(false);
        s.trunks.setHidden(false);
        const h = SL.Fusion.fuse(b, s.goten, s.trunks, 'gotenks', { form: 'ssj', seconds: 0 });
        s.gotenks = h.fused;
        s.gotenks.cannotDie = true;
        if (b.player !== s.gotenks) b.switchPlayer(s.gotenks, { force: true });
      }
      b.story.gotenks = s.gotenks;
    },
  };

  S.bgw_wrist = {
    id: 'bgw_wrist',
    cast,
    events: [
      // the wrist, caught out of the air
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, gk = s.gotenks;
          const d = gk.pos.clone().sub(s.beerus.pos).setY(0);
          if (d.lengthSq() < 0.01) d.set(0, 0, -1);
          d.normalize();
          ctx.m.space(gk, 'ground', { pos: s.beerus.pos.clone().addScaledVector(d, 1.2), face: s.beerus.pos, pose: 'bg_stoppedPunch', expr: 'shock' });
          ctx.m.space(s.beerus, 'ground', { pos: s.beerus.pos.clone(), face: gk.pos, pose: 'bg_grip', expr: 'calm' });
          b.slowmo(0.25, 0.8);
          b.sfx('block', gk, { pitch: 0.7, vol: 1 });
        },
        cam: { subject: 'gotenks', with: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'gotenks', to: 'beerus', line: 'H-hey! Let go!', duration: 1.6, style: 'shout' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_backhandW', face: 'angry', speed: 14 }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        say: { who: 'beerus', to: 'gotenks', line: 'Brat.', duration: 1, style: 'quiet' },
        hold: 1,
      },
      // the slap: across the deck
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_backhand', expression: 'angry', speed: 30 });
          b.vfx.flash(s.gotenks.headPos(), 2.2, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('punchHeavy', s.gotenks, { pitch: 1.5, vol: 1.3 });
          b.cameraTraumaAt(s.gotenks.pos, 0.6);
          SL.ScreenFX.flash(0.2);
        },
        space: { who: 'gotenks', mode: 'slide', dir: [-1, 0, -0.3], distance: 10, seconds: 0.55, endPose: 'knockdown', expr: 'ko' },
        cam: { subject: 'gotenks', focus: 'full', angle: 'high' },
      },
      // they come apart where they land
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          if (s.gotenks && s.gotenks.fusion && s.gotenks.fusion.active) SL.Fusion.defuse(b, s.gotenks.fusion, { to: s.vegeta });
          for (const k of [s.goten, s.trunks]) k.setState('scripted', { pose: 'knockdown', expression: 'ko' });
          if (b.player !== s.vegeta) b.switchPlayer(s.vegeta, { force: true });
          s.vegeta.setState('scripted', { pose: 'idle', expression: 'shock' });
        },
        cam: { subject: 'goten', with: 'trunks', focus: 'full', angle: 'high' },
        say: { who: 'krillin', line: 'Gotenks — in ONE slap?!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      if (s.gotenks && s.gotenks.fusion && s.gotenks.fusion.active) SL.Fusion.defuse(b, s.gotenks.fusion, { to: s.vegeta, silent: true });
      for (const k of [s.goten, s.trunks]) {
        k.setHidden(false);
        k.controller = K().scripted();
        k.untargetable = k.intangible = true;
        k.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      }
      if (b.player !== s.vegeta) b.switchPlayer(s.vegeta, { force: true });
      s.vegeta.controller = s.vegeta._playerController || s.vegeta.controller;
    },
  };

  /* ---------------------------------------------------------------- Piccolo, Tien, 18 */
  S.bgw_trioIn = {
    id: 'bgw_trioIn',
    cast,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx);
          for (const [f, x, z] of [[s.piccolo, -2.6, 3.2], [s.tien, 0, 2.6], [s.c18, 2.6, 3.2]]) ctx.m.space(f, 'ground', { pos: new V3(x, 0, z), face: s.beerus.pos, pose: 'idle', expr: 'serious' });
        },
        cam: { subject: 'tien', focus: 'wide', angle: 'low', room: 2 },
        say: { who: 'piccolo', to: 'tien', line: 'Tien, 18 — together. Don\'t give him a moment.', duration: 2.8 },
        hold: 2.8,
      },
      {
        cam: { subject: 'c18', focus: 'upper', angle: 'three' },
        say: { who: 'android_18', to: 'krillin', line: 'Krillin, stay back. I mean it.', duration: 2 },
        hold: 2,
      },
    ],
  };

  S.bgw_chopsticks = {
    id: 'bgw_chopsticks',
    cast,
    events: [
      // a pair of chopsticks from the table
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.model.addProp({ id: 'chopsticks', shape: 'box', joint: 'handR', pos: [0, -0.02, 0.04], size: [0.014, 0.34, 0.014], color: 0xd8b07a });
          const d = s.piccolo.pos.clone().sub(s.beerus.pos).setY(0);
          if (d.lengthSq() < 0.01) d.set(0, 0, -1);
          d.normalize();
          ctx.m.space(s.piccolo, 'ground', { pos: s.beerus.pos.clone().addScaledVector(d, 1.5), face: s.beerus.pos, pose: 'guard', expr: 'grit' });
          ctx.m.space(s.beerus, 'ground', { pos: s.beerus.pos.clone(), face: s.piccolo.pos, pose: 'bg_chopsticks', expr: 'calm' });
        },
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.flash(s.piccolo.headPos(), 1.6, 0xffffff, 0.15, SL.Toon.tex.glow);
          b.sfx('punchLight', s.piccolo, { pitch: 2, vol: 0.9 });
        },
        pose: [{ who: 'piccolo', pose: 'hitHeavy', face: 'ko', speed: 20 }],
        cam: { subject: 'piccolo', focus: 'closeup', angle: 'front' },
        say: { who: 'beerus', line: '(tap)', duration: 0.8, style: 'quiet' },
        hold: 0.9,
      },
      {
        pose: [{ who: 'piccolo', pose: 'knockdownFace', face: 'ko', speed: 6 }],
        cam: { subject: 'piccolo', focus: 'full', angle: 'high' },
        sfx: { name: 'groundImpact', vol: 0.6 },
        say: { who: 'krillin', line: 'PICCOLO?! With CHOPSTICKS?!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      // Tien and 18 from both sides: the aura alone throws them off
      {
        space: [
          { who: 'tien', mode: 'flight', to: { at: 'beerus', off: [-1.4, 0, 0.6] }, seconds: 0.35, pose: 'dash', endPose: 'punchR' },
          { who: 'c18', mode: 'flight', to: { at: 'beerus', off: [1.4, 0, 0.6] }, seconds: 0.35, pose: 'dash', endPose: 'kickR' },
        ],
        cam: { subject: 'beerus', focus: 'full', angle: 'front' },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.model.removeProp('chopsticks');
          b.vfx.ring(s.beerus.chest(), 5, 0xc89aff, 0.5);
          b.vfx.flash(s.beerus.chest(), 2.2, 0xd8b0ff, 0.25, SL.Toon.tex.glow);
          b.sfx('perfectGuard', s.beerus, { vol: 1.2 });
          b.cameraTraumaAt(s.beerus.pos, 0.6);
        },
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'calm', aura: 0.9 }],
        space: [
          { who: 'tien', mode: 'slide', dir: [-1, 0, 0.2], distance: 7, seconds: 0.5, endPose: 'knockdown', expr: 'ko' },
          { who: 'c18', mode: 'slide', dir: [1, 0, 0.2], distance: 7, seconds: 0.5, endPose: 'knockdown', expr: 'ko' },
        ],
        cam: { subject: 'beerus', focus: 'wide', angle: 'low', room: 3 },
      },
    ],
    end(ctx) {
      const s = st(ctx);
      s.beerus.model.removeProp('chopsticks');
      for (const f of [s.piccolo, s.tien, s.c18]) {
        f.controller = K().scripted();
        f.untargetable = f.intangible = true;
        f.setState('scripted', { pose: f === s.piccolo ? 'knockdownFace' : 'knockdown', expression: 'ko' });
      }
    },
  };

  /* ---------------------------------------------------------------- Gohan */
  S.bgw_gohanIn = {
    id: 'bgw_gohanIn',
    cast,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.gohan, 'ground', { pos: new V3(0, 0, 3), face: s.beerus.pos, pose: 'idle', expr: 'angry' });
        },
        cam: { subject: 'gohan', focus: 'upper', angle: 'three' },
        say: { who: 'adult_gohan', to: 'beerus', line: 'That\'s enough!', duration: 1.6, style: 'shout' },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().toForm(s.gohan, 'ultimate');
          b.vfx.flash(s.gohan.chest(), 3, 0xffffff, 0.3, SL.Toon.tex.glow);
          b.vfx.ring(s.gohan.pos.clone().add(new V3(0, 0.2, 0)), 6, 0xffffff, 0.5, new V3(0, 1, 0));
          b.sfx('transformBurst', s.gohan, { vol: 0.9 });
          b.cameraTraumaAt(s.gohan.pos, 0.5);
        },
        pose: [{ who: 'gohan', pose: 'charge', face: 'shout', speed: 10, aura: 1 }],
        cam: { subject: 'gohan', focus: 'full', angle: 'low' },
        hold: 1.6,
      },
      {
        pose: [{ who: 'videl', pose: 'idle', face: 'shock' }],
        cam: { subject: 'videl', focus: 'upper', angle: 'front' },
        say: { who: 'videl', to: 'gohan', line: 'Gohan, be careful!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      K().toForm(st(ctx).gohan, 'ultimate');
    },
  };

  S.bgw_slam = {
    id: 'bgw_slam',
    cast,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const d = s.gohan.pos.clone().sub(s.beerus.pos).setY(0);
          if (d.lengthSq() < 0.01) d.set(0, 0, -1);
          d.normalize();
          ctx.m.space(s.gohan, 'ground', { pos: s.beerus.pos.clone().addScaledVector(d, 1.15), face: s.beerus.pos, pose: 'hitHeavy', expr: 'shock' });
          ctx.m.space(s.beerus, 'ground', { pos: s.beerus.pos.clone(), face: s.gohan.pos, pose: 'bg_grip', expr: 'angry' });
          ctx.m.space(s.buu, 'ground', { pos: s.beerus.pos.clone().add(new V3(-6, 0, 2)), face: s.beerus.pos, pose: 'getup', expr: 'angry' });
          b.sfx('block', s.gohan, { pitch: 0.6 });
          b.slowmo(0.3, 0.6);
          pt(ctx, 'buuP', s.buu.pos.clone());
        },
        cam: { subject: 'gohan', with: 'beerus', focus: 'upper' },
        say: { who: 'beerus', to: 'gohan', line: 'Fast. Not fast enough.', duration: 1.8 },
        hold: 1.8,
      },
      // by the head, and down — into Buu, who was just getting up
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_chop', expression: 'angry', speed: 24 });
          b.sfx('punchHeavy', s.gohan, { pitch: 0.7, vol: 1.3 });
        },
        space: { who: 'gohan', mode: 'groundImpact', to: 'buuP', seconds: 0.4, endPose: 'knockdown', expr: 'ko', radius: 2, depth: 0.05 },
        cam: { subject: 'buu', focus: 'wide', angle: 'three', room: 2 },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.buu.setState('scripted', { pose: 'knockdown', expression: 'ko' });
          K().toForm(s.gohan, 'base');
          b.vfx.dust(s.buu.pos, 3, 16);
          b.cameraTraumaAt(s.buu.pos, 0.8);
        },
        cam: { subject: 'gohan', with: 'buu', focus: 'full', angle: 'high' },
        say: { who: 'videl', line: 'GOHAN!', duration: 1.6, style: 'shout' },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      K().toForm(s.gohan, 'base');
      for (const f of [s.gohan, s.buu]) {
        f.controller = K().scripted();
        f.untargetable = f.intangible = true;
        f.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      }
    },
  };

  /* ---------------------------------------------------------------- Bulma — and the prince */
  S.bgw_bulma = {
    id: 'bgw_bulma',
    cast,
    music: { song: null, level: 0 },
    events: [
      // she marches straight up to a god
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.beerus, 'ground', { pos: new V3(0, 0, 4.4), face: new V3(0, 0, -3), pose: 'bs_idle', expr: 'angry' });
          ctx.m.space(s.bulma, 'ground', { pos: new V3(-1, 0, -3.6), face: s.beerus.pos, pose: 'ez_walk', expr: 'angry' });
          ctx.m.space(s.vegeta, 'ground', { pos: new V3(5.4, 0, -4.6), face: s.beerus.pos, pose: 'idle', expr: 'shock' });
        },
        move: { who: 'bulma', at: [-0.6, 0, 2.9], seconds: 2.2, face: 'beerus' },
        cam: { subject: 'bulma', focus: 'full', angle: 'three' },
        say: { who: 'bulma', to: 'beerus', line: 'Hey, YOU! Who do you think you are, wrecking MY party?!', duration: 3 },
      },
      {
        pose: [{ who: 'bulma', pose: 'bg_hips', face: 'angry' }],
        cam: { subject: 'beerus', with: 'bulma', focus: 'full', angle: 'three' },
        say: { who: 'beerus', to: 'bulma', line: 'Step aside, woman. This doesn\'t concern you.', duration: 2.6 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'bulma', pose: 'bg_slapW', face: 'angry', speed: 14 }],
        cam: { subject: 'bulma', focus: 'upper', angle: 'three' },
        say: { who: 'bulma', to: 'beerus', line: 'Doesn\'t CONCERN me? It\'s MY BIRTHDAY!', duration: 2.2, style: 'shout' },
        hold: 1.4,
      },
      // the slap
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.bulma.setState('scripted', { pose: 'bg_slap', expression: 'angry', speed: 30 });
          b.sfx('punchLight', s.beerus, { pitch: 1.6, vol: 1.2 });
          b.vfx.flash(s.beerus.headPos(), 1.2, 0xffffff, 0.12, SL.Toon.tex.glow);
        },
        cam: { subject: 'beerus', focus: 'face', angle: 'three' },
        hold: 1,
      },
      {
        cam: { subject: 'whis', focus: 'closeup', angle: 'front' },
        pose: [{ who: 'whis', pose: 'w_shock', face: 'shock' }],
        say: { who: 'whis', to: 'bulma', line: 'Oh my. She slapped him.', duration: 1.8, style: 'quiet' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_backhandW', face: 'angry', speed: 12 }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'front' },
        hold: 0.7,
      },
      // the backhand: she is on the planks
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_backhand', expression: 'angry', speed: 30 });
          b.sfx('punchHeavy', s.bulma, { pitch: 1.4, vol: 0.9 });
          b.vfx.flash(s.bulma.headPos(), 1.2, 0xffffff, 0.12, SL.Toon.tex.glow);
        },
        space: { who: 'bulma', mode: 'slide', dir: [-0.4, 0, -1], distance: 2.4, seconds: 0.4, endPose: 'knockdown', expr: 'ko' },
        cam: { subject: 'bulma', focus: 'full', angle: 'high' },
        sfx: { name: 'groundImpact', vol: 0.5 },
      },
      // SILENCE. Cut to Vegeta.
      {
        call: (ctx) => {
          ctx.b.silence && ctx.b.silence(0.4, { sfx: false });
        },
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        hold: 2,
      },
      // the pupils go to pinpricks
      {
        call: (ctx) => {
          const v = st(ctx).vegeta;
          v.model._pupilBase = 0.4;
          if (v.model._applyEyes) v.model._applyEyes();
        },
        cam: { subject: 'vegeta', focus: 'face', angle: 'front', dist: 0.85 },
        sfx: { name: 'heartbeat', vol: 0.9 },
        hold: 1.4,
      },
      // the teeth, the fists, the trembling
      {
        pose: [{ who: 'vegeta', pose: 'bg_tremble', face: 'grit', speed: 8 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        sfx: { name: 'heartbeat', vol: 1 },
        hold: 1.6,
      },
      // the aura comes up off him — crimson and gold — and the planks under his feet split
      {
        call: (ctx) => {
          const v = st(ctx).vegeta, b = ctx.b;
          v.aura.setStyle({ color: 0xffb020, core: 0xffffff, particles: 0xff4a20, speed: 1.9, sharp: 0.6, flame: [0xff3a1a, 0xffc020, 0xff6a2a] });
          pt(ctx, 'feet', v.pos.clone());
        },
        pose: [{ who: 'vegeta', pose: 'bg_tremble', face: 'grit', speed: 8, aura: 0.6 }],
        tick: (ctx, t) => {
          const b = ctx.b, v = st(ctx).vegeta;
          if (b.frame % 5 === 0) {
            const a = (b.frame * 0.7) % (Math.PI * 2);
            const p = v.pos.clone().add(new V3(Math.cos(a) * 1.2, 0.05, Math.sin(a) * 1.2));
            b.vfx.rock(p, new V3(Math.cos(a) * 2, 4 + (b.frame % 7), Math.sin(a) * 2), 0.12, 0xb88a54);
            b.vfx.dust(p, 0.6, 2, 0xc89a62);
          }
          b.camera.addTrauma(0.02 + t * 0.02);
        },
        cam: { subject: 'vegeta', focus: 'full', angle: 'low' },
        sfx: { name: 'rumble', vol: 1 },
        hold: 2,
      },
      // THAT'S...
      {
        pose: [{ who: 'vegeta', pose: 'bg_tremble', face: 'shout', speed: 10, aura: 0.8 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', to: 'beerus', line: 'THAT\'S...', duration: 1.2, style: 'shout' },
        hold: 1.2,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', to: 'beerus', line: '...MY...', duration: 1.2, style: 'shout' },
        hold: 1.2,
      },
      // ...BULMAAAAA!: the Super Saiyan 2 burst, the planks blown up round him
      {
        call: (ctx) => {
          const v = st(ctx).vegeta, b = ctx.b;
          K().toForm(v, 'ssj2');
          v.aura.setStyle({ color: 0xffb020, core: 0xffffff, particles: 0xff4a20, speed: 1.9, sharp: 0.6, lightning: true, flame: [0xff3a1a, 0xffc020, 0xff6a2a, 0xffe060] });
          v.model._pupilBase = 1;
          if (v.model._applyEyes) v.model._applyEyes();
          b.vfx.ring(v.pos.clone().add(new V3(0, 0.2, 0)), 14, 0xffc040, 0.8, new V3(0, 1, 0));
          b.vfx.explosion(v.chest(), 1, 0xffd060, { smoke: false });
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            b.vfx.rock(v.pos.clone().add(new V3(Math.cos(a) * 1.4, 0.1, Math.sin(a) * 1.4)), new V3(Math.cos(a) * 7, 7 + (i % 4) * 2, Math.sin(a) * 7), 0.2, 0xb88a54);
          }
          SL.ScreenFX.flash(0.4, '#ffd080');
          b.cameraTraumaAt(v.pos, 1);
          b.sfx('transformBurst', v, { vol: 1.3 });
          b.sfx('roar', v, { vol: 1 });
        },
        pose: [{ who: 'vegeta', pose: 'bg_rageRoar', face: 'shout', speed: 14, aura: 1 }],
        cam: { subject: 'vegeta', focus: 'full', angle: 'low', dist: 5.5 },
        say: { who: 'vegeta', to: 'beerus', line: '...BULMAAAAAAA!!', duration: 2.4, style: 'shout' },
        music: { song: 'pride', level: 6 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      K().toForm(s.vegeta, 'ssj2');
      s.vegeta.model._pupilBase = 1;
      if (s.vegeta.model._applyEyes) s.vegeta.model._applyEyes();
      s.bulma.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      ctx.m.flags.mybulma = true;
    },
  };

  /* ---------------------------------------------------------------- the Galick Gun, the smoke, the chop, Goku */
  S.bgw_galick = {
    id: 'bgw_galick',
    cast,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, v = s.vegeta;
          s.beerus.intangible = true;
          const spec = Object.assign({}, v.specFor ? v.specFor('special1') : v.def.specials.special1, { radius: [1.3, 1.3], speed: 90 });
          SL.Cinema.beam(ctx, v, s.beerus, spec);
          b.sfx('beamFire', v, { vol: 1.4, pitch: 0.8 });
          b.cameraTraumaAt(v.chest(), 0.8);
        },
        pose: [{ who: 'vegeta', pose: 'v_galickFire', face: 'shout', speed: 16, aura: 1 }],
        cam: { from: { at: 'vegeta', local: [1.1, 0.6, -3] }, look: { at: 'beerus', off: [0, 0.4, 0] }, fov: 50 },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xe0b0ff),
        say: { who: 'vegeta', line: '...GUN!!', duration: 1.4, style: 'shout' },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          pt(ctx, 'side', s.vegeta.chest().lerp(s.beerus.chest(), 0.5).add(new V3(14, 2, 4)));
        },
        cam: { from: { at: 'side' }, look: { at: 'beerus' }, fov: 54 },
        tick: (ctx) => {
          SL.Cinema.pinBeam(ctx, 0xe0b0ff);
          ctx.b.camera.addTrauma(0.03);
        },
        hold: 1.4,
      },
    ],
    end(ctx) {
      K().clearCombat(ctx.b);
    },
  };

  /* ---------------------------------------------------------------- the smoke, the chop, Goku */
  S.bgw_smoke = {
    id: 'bgw_smoke',
    cast,
    events: [
      // the smoke
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().clearCombat(b);
          b.vfx.explosion(s.beerus.chest(), 3, 0xe0b0ff, { smoke: true });
          b.vfx.dust(s.beerus.pos, 5, 30, 0xd8d0e0);
          b.sfx('explosionBig', s.beerus, { vol: 1.3 });
          b.cameraTraumaAt(s.beerus.pos, 0.9);
          K().splash(b, s.beerus.pos.clone().add(new V3(18, 0, 0)), 2.5);
        },
        cam: { subject: 'beerus', focus: 'wide', angle: 'three', room: 4 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.vegeta, 'landing', { to: s.vegeta.pos.clone().setY(0), seconds: 0.4, endPose: 'exhausted', expr: 'grit' });
        },
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', to: 'beerus', line: 'Huff... huff... Did I... get him...?', duration: 2.6 },
        hold: 2.6,
      },
      // not a mark on him
      {
        call: (ctx) => {
          st(ctx).beerus.intangible = false;
        },
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'full', angle: 'low' },
        say: { who: 'beerus', to: 'vegeta', line: 'That stung a little. I\'ll give you that.', duration: 2.8 },
        hold: 2.8,
      },
      // he is just there, and the chop comes down
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.afterimage(s.beerus.pos, s.beerus.height, 0xd8b0ff);
          ctx.m.space(s.beerus, 'ground', { pos: s.vegeta.pos.clone().addScaledVector(s.vegeta.forward, -1.2), face: s.vegeta.pos, pose: 'bs_chopW', expr: 'calm' });
          b.sfx('vanish', s.beerus);
        },
        cam: { subject: 'vegeta', with: 'beerus', focus: 'upper' },
        hold: 0.6,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setState('scripted', { pose: 'bs_chop', expression: 'calm', speed: 30 });
          b.sfx('punchHeavy', s.vegeta, { pitch: 1.4, vol: 1.1 });
          K().toForm(s.vegeta, 'base');
          b.vfx.flash(s.vegeta.chest(), 2, 0xffe27a, 0.3, SL.Toon.tex.glow);
        },
        pose: [{ who: 'vegeta', pose: 'knockdownFace', face: 'ko', speed: 10 }],
        cam: { subject: 'vegeta', focus: 'full', angle: 'high' },
        sfx: { name: 'groundImpact', vol: 0.8 },
        hold: 1.8,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Now then. I think I\'ve had quite enough of this planet.', duration: 3 },
        music: { song: 'ominous', level: 2 },
        hold: 3,
      },
      // one finger up: the little sun starts to grow
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.mini = K().sphere(b, s.beerus.handPos('R').add(new V3(0, 0.6, 0)));
          s.mini.set(0.15);
        },
        pose: [{ who: 'beerus', pose: 'bs_sphere', face: 'calm', speed: 8 }],
        tick: (ctx, t) => {
          const s = st(ctx);
          if (!s.mini) return;
          s.mini.set(0.15 + t * 0.35);
          s.mini.group.position.copy(s.beerus.handPos('R').add(new V3(0, 0.3 + s.mini.radius, 0)));
          s.mini.pulse();
        },
        cam: { subject: 'beerus', focus: 'full', angle: 'low' },
        hold: 2,
      },
      // and Goku is standing in front of him: Instant Transmission
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.goku.setHidden(false);
          s.goku.untargetable = s.goku.intangible = true;
          ctx.m.space(s.goku, 'ground', { pos: s.beerus.pos.clone().addScaledVector(s.beerus.forward, 2.4), face: s.beerus.pos, pose: 'twoFingers', expr: 'determined' });
          if (SL.data.endzKit) SL.data.endzKit.instant(b, s.goku);
        },
        cam: { subject: 'goku', with: 'beerus', focus: 'full', angle: 'three' },
        say: { who: 'goku', to: 'beerus', line: 'Hold on, Lord Beerus!', duration: 2, style: 'shout' },
        hold: 2,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.mini) {
            s.mini.dispose();
            s.mini = null;
          }
        },
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'smirk' }],
        cam: { subject: 'krillin', focus: 'upper', angle: 'front' },
        say: { who: 'krillin', line: 'GOKU!', duration: 1.6, style: 'shout' },
        hold: 1.6,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', to: 'goku', line: 'You\'re awake. Good. Then where is my Super Saiyan God?', duration: 3 },
        hold: 3,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.mini) {
        s.mini.dispose();
        s.mini = null;
      }
      K().clearCombat(ctx.b);
      K().toForm(s.vegeta, 'base');
      s.beerus.intangible = false;
      s.goku.setHidden(false);
      ctx.m.flags.gokuArrived = true;
    },
  };

  const def = {
    id: 'bog_wrath',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'That\'s My Bulma!',
    subtitle: 'The wrath of a god · the Princess Bulma',
    character: 'vegeta',
    stage: 'cruise_liner',
    parTime: 480,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'One fusion, three warriors, one Ultimate — and one god with a pair of chopsticks. Then he touches Bulma.',
    rewards: ['Story: the Z Fighters vs Beerus', 'Story: "That\'s my Bulma!"'],
    setup,
    phases: [P.buu, P.gotenks, P.trio, P.gohan, P.bulma, P.rage, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogWrath = { W };
})();
