/*
 * CHAPTER 16 — BATTLE OF GODS, mission 6: "Battle of Gods" (canon). Played as SUPER SAIYAN GOD GOKU.
 *
 *   RISE      (scene, GROUND → AIR)   "Somewhere with a little more room"; up off the deck, high over the ocean;
 *                                     divine ki feels like floating in water
 *   SKY *     (play, AIR)             over the ocean: a god's speed; every heavy blow throws the sea up; he is
 *                                     finally interested (God's Whim: ROUSED)
 *   DIVE      (scene, AIR → GROUND)   the fists meet; a kick drives Goku into the sea; down through the blue, and
 *                                     through the roof of a cavern under the sea floor
 *   CAVERN *  (play, GROUND / AIR)    crystals everywhere: they light the fight and they shatter under it
 *   LAUNCH    (scene, → AIR → SPACE)  the clash that breaks the cavern; up through the ocean in a column of water,
 *                                     through the clouds, the sky going black, the Earth below
 *   EDGE *    (play, AIR / SPACE)     at the edge of space, with the God form's time running out
 *   EXPIRE    (scene, SPACE)          the red goes out of his hair — but the power stays in him
 *   GOD KI *  (play, SPACE)           Super Saiyan, with a god's power, still keeping up
 *   AFTER                             ("Next: My World")
 *
 * SPACE, said out loud: the ship's deck is GROUND; the sky over the ocean is AIR (keepAbove: nobody sinks into the
 * sea); the cavern is GROUND with AIR above it under a dome; the stratosphere is a 'space' stage (no ground at all).
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const BP = () => SL.data.bogParty;
  const S = (SL.data.scenes = SL.data.scenes || {});

  const B = {
    sky: new V3(70, 34, 64),         // the middle of the fight over the ocean (world height 34: ~41 m over the water)
    cave: new V3(0, 0, 0),
    edge: new V3(0, 0, 0),
    floors: { sky: 0.72, cave: 0.5, edge: 0.34, godki: 0.22 },
    godSeconds: 50,
    godkiSeconds: 45,
  };

  function setup(battle) {
    const b = battle;
    const s = BP().setup(b, { player: 'goku', godsHere: true });
    for (const f of Object.values(s)) if (f && f.setState && f !== s.goku) f.untargetable = f.intangible = true;
    K().toForm(s.goku, 'god');
    s.goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true, godki: true };
    s.beerus.team = 1;
    return s;
  }

  /** The watchers on the deck, looking up (everybody but the two gods). */
  function watchers(m, pose = 'bg_lookUp') {
    const s = m.battle.story;
    for (const k of Object.keys(s)) {
      const f = s[k];
      if (!f || !f.setState || f === s.goku || f === s.beerus || f.hidden) continue;
      f.controller = K().scripted();
      f.untargetable = f.intangible = true;
      if (f.state !== 'scripted' || pose) f.setState('scripted', { pose: k === 'whis' ? 'w_idle' : pose, expression: 'shock' });
    }
  }
  function hideWatchers(m) {
    const s = m.battle.story;
    for (const k of Object.keys(s)) {
      const f = s[k];
      if (!f || !f.setState || f === s.goku || f === s.beerus) continue;
      f.setHidden(true);
      f.untargetable = f.intangible = true;
      f.controller = K().scripted();
    }
  }

  /** A god fight: real gameplay; the story owns only the floors (who cannot be finished yet) and the space. */
  function godFight(m, opts) {
    const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
    bs.storyNoSell = null;
    bs.storyBlock = null;
    // he can still slip a blow now and then — but now he has to move to do it
    bs.storyEvade = { mode: 'god', chance: opts.evade === undefined ? 0.25 : opts.evade, gap: 45, kinds: ['step', 'vanish', 'parry'], stepPose: 'bg_sidestep', parryPose: 'bg_parry', count: 0 };
    K().brawl(m, g, bs, { profile: { aggression: opts.aggression || 0.78, defense: 0.7 }, song: opts.song || 'ssj_god', music: opts.music || 6 });
    bs.hp = Math.max(bs.hp, bs.hpMax * (opts.from || 1));
    const sf = m.storyFight({
      floors: [{ f: bs, at: opts.floor }, { f: g, at: 0.3 }],
      dealt: [{ f: g, mul: 1.15 }, { f: bs, mul: 0.55 }],
      taken: [{ f: bs, mul: 0.55 }],
      ease: { foe: bs, hero: g, below: 0.5, min: 0.4 },
      fighters: [g, bs],
      space: opts.space || 'air',
    });
    // the shockwave of a god's blow: rings in the air on every heavy hit
    const offShock = b.on('damage', (e) => {
      if (!e || e.blocked || !(e.amount > 1100)) return;
      if (e.target !== g && e.target !== bs) return;
      const p = e.point || e.target.chest();
      b.vfx.ring(p, 7, e.target === bs ? 0xff7a8a : 0xd8b0ff, 0.45);
      b.cameraTraumaAt(p, 0.3);
    });
    m.onDispose(offShock);
    return {
      sf,
      off() {
        sf.off();
        offShock();
      },
      floored: () => sf.floored(bs),
    };
  }

  /** The objective that tells how far he has pushed the god (to the floor). */
  function pushMeter(m, label, floor) {
    const bs = m.battle.story.beerus;
    let shown = -1;
    const top = Math.max(floor + 0.01, bs.hpFrac);
    return () => {
      const k = Math.round(((top - Math.max(floor, bs.hpFrac)) / (top - floor)) * 10);
      if (k !== shown) {
        shown = k;
        m.objective('push', label + '  ·  ' + k * 10 + '%');
      }
    };
  }

  const P = {};
  P.rise = K().scene('rise', 'bgb_rise');

  /** OVER THE OCEAN (AIR). */
  P.sky = {
    id: 'sky',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'cruise_liner') {
        b.changeStage('cruise_liner');
        m.endShot();
      }
      K().toForm(g, 'god');
      watchers(m);
      K().air(m, g, B.sky.x - 5, B.sky.y, B.sky.z, B.sky);
      K().air(m, bs, B.sky.x + 5, B.sky.y + 1, B.sky.z, g.pos);
      const above = K().keepAbove(m, [g, bs]);
      const sea = K().seaReacts(m);
      const fight = godFight(m, { floor: B.floors.sky, evade: 0.3 });
      m.objective('push', 'Battle of Gods');
      const meter = pushMeter(m, 'Push the God of Destruction back', B.floors.sky);
      m.prompt('godDash', 'boost', 'Divine speed', { until: () => g.speed > 26 });
      m.say('beerus', 'Come, Super Saiyan God. Show me.', 2.4);
      const lines = [[0.94, 'goku', 'Whoa — I can see him moving!'], [0.86, 'beerus', 'Ha! NOW this is a fight!'], [0.8, 'whis', '(My, my. He\'s keeping up with Lord Beerus.)'], [0.75, 'goku', 'This is amazing!']];
      let said = 0, t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        meter();
        while (said < lines.length && bs.hpFrac <= lines[said][0]) {
          m.say(lines[said][1], lines[said][2], 2.4, { style: lines[said][1] === 'whis' ? 'quiet' : undefined });
          said++;
        }
      };
      m.tickHooks.push(hook);
      yield () => fight.floored() || t > 100;
      K().unhook(m, hook);
      K().unhook(m, above);
      sea();
      fight.off();
      m.complete('push');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* m.cine(0.3);
      yield* SL.Cinema.play(m, 'bgb_dive');
    },
  };

  /** THE CRYSTAL CAVERN (GROUND, and AIR under the dome). */
  P.cavern = {
    id: 'cavern',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'crystal_cavern') {
        b.changeStage('crystal_cavern');
        m.endShot();
      }
      hideWatchers(m);
      K().toForm(g, 'god');
      if (bs.hpFrac > B.floors.sky + 0.02) bs.hp = bs.hpMax * B.floors.sky;
      K().ground(m, g, -5, -4, new V3(5, 0, 4));
      K().air(m, bs, 6, 5, 5, g.pos, 'bs_flyIdle');
      const fight = godFight(m, { floor: B.floors.cave, evade: 0.22, space: 'free', music: 6 });
      // every blow that lands near the crystals rings through them; a body thrown into them shatters them
      const crystals = b.stage.crystals || [];
      const offC = b.on('damage', (e) => {
        if (!e || !e.target || !(e.amount > 300)) return;
        const p = e.target.pos;
        for (const pr of crystals) {
          if (!pr.alive) continue;
          const d = pr.pos.distanceTo(p);
          if (d < 7) {
            b.stage.damageProp(pr, e.amount * (d < 3 ? 1.2 : 0.35), e.attacker);
            b.vfx.sparks(pr.pos, 0xbff4ff, 5, 4, 0.08);
          }
        }
      });
      m.onDispose(offC);
      let broken = 0;
      const offB = b.on('propDestroyed', (e) => {
        if (!crystals.includes(e.prop)) return;
        broken++;
        b.vfx.sparks(e.prop.pos, 0xe8fbff, 26, 10, 0.12);
        b.sfx('rockBreak', null, { at: e.prop.pos, pitch: 1.6, vol: 1 });
        if (broken === 2) m.say('beerus', 'Pretty, isn\'t it? Pity.', 2.2);
      });
      m.onDispose(offB);
      m.objective('push', 'The crystal cavern');
      const meter = pushMeter(m, 'Drive him through the crystals', B.floors.cave);
      m.say('goku', 'A cave under the sea?! Heh — no holding back down here!', 2.8);
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        meter();
      };
      m.tickHooks.push(hook);
      yield () => fight.floored() || t > 90;
      K().unhook(m, hook);
      offC();
      offB();
      fight.off();
      m.flags.crystalsBroken = broken;
      m.complete('push');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* SL.Cinema.play(m, 'bgb_launch');
    },
  };

  /** THE EDGE OF SPACE (SPACE): the God form's time is running out. */
  P.edge = {
    id: 'edge',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        m.endShot();
      }
      hideWatchers(m);
      b.stage.setAltitude(0.92);
      K().toForm(g, 'god');
      if (bs.hpFrac > B.floors.cave + 0.02) bs.hp = bs.hpMax * B.floors.cave;
      K().air(m, g, -5, 0, 0, B.edge);
      K().air(m, bs, 5, 1.5, 0, g.pos);
      const fight = godFight(m, { floor: B.floors.edge, evade: 0.2, song: 'final_clash', music: 6 });
      m.objective('push', 'The edge of space');
      const meter = pushMeter(m, 'Above the Earth', B.floors.edge);
      let left = B.godSeconds, shown = -1;
      m.say('beerus', 'The view is better up here, don\'t you think?', 2.6);
      const hook = () => {
        if (b.inputLocked) return;
        left = Math.max(0, left - 1 / 60);
        meter();
        const sec = Math.ceil(left);
        if (sec !== shown) {
          shown = sec;
          m.objective('time', 'Super Saiyan God: ' + sec + ' s');
        }
        // the flame starts to gutter in the last seconds
        if (left < 10 && b.frame % 20 === 0) {
          g.aura.setStyle(b.frame % 40 ? g.form.aura : { color: 0xffcc3a, core: 0xffffff, particles: 0xfff0a0 });
          b.vfx.flash(g.headPos(), 0.8, 0xffd040, 0.15, SL.Toon.tex.glow);
        }
      };
      m.tickHooks.push(hook);
      yield () => left <= 0 || (fight.floored() && left < B.godSeconds - 20);
      K().unhook(m, hook);
      g.aura.setStyle(g.form.aura);
      fight.off();
      m.complete('time');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* SL.Cinema.play(m, 'bgb_expire');
    },
  };

  /** SUPER SAIYAN, WITH A GOD'S POWER (SPACE). */
  P.godki = {
    id: 'godki',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        m.endShot();
      }
      hideWatchers(m);
      b.stage.setAltitude(0.95);
      K().toForm(g, 'godki');
      m.teach(g, 'form:godki');
      if (bs.hpFrac > B.floors.edge + 0.02) bs.hp = bs.hpMax * B.floors.edge;
      K().air(m, g, -5, 0, 0, B.edge);
      K().air(m, bs, 5, 1.5, 0, g.pos);
      const fight = godFight(m, { floor: B.floors.godki, evade: 0.25, song: 'final_clash', music: 6 });
      m.objective('push', 'God Ki');
      const meter = pushMeter(m, 'Keep up with a god', B.floors.godki);
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        meter();
      };
      m.tickHooks.push(hook);
      yield () => fight.floored() || t > B.godkiSeconds;
      K().unhook(m, hook);
      fight.off();
      m.complete('push');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* SL.Cinema.play(m, 'bgb_enough');
    },
  };

  P.after = K().after('BATTLE OF GODS');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, p) => K().pt(ctx, n, p);

  /* ---------------------------------------------------------------- up off the deck */
  S.bgb_rise = {
    id: 'bgb_rise',
    cast,
    music: { song: 'ssj_god', level: 2 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().toForm(s.goku, 'god');
          m.space(s.goku, 'ground', { pos: new V3(0, 0, 18), face: new V3(4, 0, 12), pose: 'g_godStance', expr: 'calm' });
          m.space(s.beerus, 'ground', { pos: new V3(4, 0, 12), face: s.goku.pos, pose: 'bs_idle', expr: 'smirk' });
          watchers(m, 'idle');
        },
        title: { chapter: 'CHAPTER 16 · BATTLE OF GODS', title: 'BATTLE OF GODS', subtitle: 'Goku vs Beerus · over the ocean', duration: 3.6 },
        cam: { subject: 'goku', with: 'beerus', focus: 'full', angle: 'three' },
        say: { who: 'beerus', line: 'Shall we go somewhere with a little more room? I\'d hate to sink your friend\'s boat.', duration: 3.8 },
        hold: 3.8,
      },
      // AIR: up off the deck
      {
        space: [
          { who: 'goku', mode: 'flight', to: [B.sky.x - 5, B.sky.y, B.sky.z], seconds: 2.2, pose: 'flyUp', endPose: 'flyIdle' },
          { who: 'beerus', mode: 'flight', to: [B.sky.x + 5, B.sky.y + 1, B.sky.z], seconds: 2.2, pose: 'bs_flyForward', endPose: 'bs_flyIdle' },
        ],
        call: (ctx) => {
          watchers(ctx.m);
          pt(ctx, 'deck', new V3(-2, 1.6, 6));
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          if (b.frame % 2 === 0) {
            b.vfx.trail(s.goku.chest(), 0xff6a6a, 0.8, 0.5);
            b.vfx.trail(s.beerus.chest(), 0xc89aff, 0.8, 0.5);
          }
        },
        cam: { from: { at: 'deck' }, look: { at: 'goku' }, fov: 58 },
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.goku, s.beerus.pos);
          K().faceTo(s.beerus, s.goku.pos);
          pt(ctx, 'mid', B.sky.clone());
        },
        cam: { from: { at: 'mid', off: [46, 12, 60] }, to: { at: 'mid', off: [30, 6, 40] }, look: { at: 'mid' }, fov: 40 },
        sfx: { name: 'wind', vol: 0.8, pitch: 0.6 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'lookHands', face: 'shock', speed: 5 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Whoa... my body feels so light. It\'s like I\'m floating in water.', duration: 3.2 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'That\'s divine ki. Get used to it quickly — I won\'t wait.', duration: 3 },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'grin', speed: 6 }],
        cam: { subject: 'goku', with: 'beerus', focus: 'full', angle: 'low' },
        say: { who: 'goku', line: 'Heh. Then here I come!', duration: 2 },
        hold: 2,
      },
    ],
  };

  /* ---------------------------------------------------------------- into the sea, through the cavern roof */
  S.bgb_dive = {
    id: 'bgb_dive',
    cast,
    clearMood: false,
    events: [
      // the fists meet in the middle of the sky
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          const mid = s.goku.pos.clone().lerp(s.beerus.pos, 0.5);
          if (mid.y < -2) mid.y = 10;
          K().air(m, s.goku, mid.x - 0.9, mid.y, mid.z, mid, 'punchR', 'shout');
          K().air(m, s.beerus, mid.x + 0.9, mid.y, mid.z, mid, 'bs_poke', 'grin');
          b.vfx.ring(mid.clone().add(new V3(0, 1.2, 0)), 12, 0xffffff, 0.6);
          b.vfx.flash(mid.clone().add(new V3(0, 1.2, 0)), 4, 0xffe0e0, 0.3, SL.Toon.tex.glow);
          b.sfx('explosionBig', null, { at: mid, pitch: 0.7 });
          b.cameraTraumaAt(mid, 1);
          b.slowmo(0.25, 0.9);
          K().splash(b, mid, 4);
          pt(ctx, 'clash', mid.clone().add(new V3(0, 1.2, 0)));
        },
        cam: { from: { at: 'clash', off: [0, 1, 7] }, look: { at: 'clash' }, fov: 46 },
        hold: 1.6,
      },
      // the kick, straight down
      {
        pose: [{ who: 'beerus', pose: 'bs_heel', face: 'grin', speed: 24 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.flash(s.goku.chest(), 2.2, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('punchHeavy', s.goku, { pitch: 0.9, vol: 1.3 });
          const lvl = b.stage.waterLevel === undefined ? -7.5 : b.stage.waterLevel;
          pt(ctx, 'sea', new V3(s.goku.pos.x - 2, lvl, s.goku.pos.z));
        },
        space: { who: 'goku', mode: 'flight', to: 'sea', seconds: 0.55, pose: 'tumble', endPose: 'tumble' },
        cam: { from: { at: 'sea', off: [10, 6, 14] }, look: { at: 'goku' }, fov: 56 },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().splash(b, ctx.cast.sea.pos, 5);
          K().splash(b, ctx.cast.sea.pos.clone().add(new V3(2, 0, 1)), 3);
          b.sfx('explosionBig', null, { at: ctx.cast.sea.pos, pitch: 0.5, vol: 1.2 });
          s.goku.setHidden(true);
        },
        cam: { from: { at: 'sea', off: [10, 6, 14] }, look: { at: 'sea', off: [0, 3, 0] }, fov: 52 },
        say: { who: 'beerus', line: 'Hm. Running away?', duration: 1.6 },
        hold: 1.6,
      },
      // he dives after him
      {
        space: { who: 'beerus', mode: 'flight', to: 'sea', seconds: 0.5, pose: 'bs_flyForward', endPose: 'bs_flyForward' },
        cam: { from: { at: 'sea', off: [-8, 3, 10] }, look: { at: 'beerus' }, fov: 54 },
      },
      // the blue: down through the water
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setHidden(true);
          K().splash(b, ctx.cast.sea.pos, 4);
          SL.ScreenFX.flash(0.6, '#2a6ab8');
          ctx.m.fade('black', 0.8);
        },
        sfx: { name: 'wind', pitch: 0.35, vol: 1 },
        hold: 0.9,
      },
      // the CAVERN: through the roof, down onto the floor
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('crystal_cavern');
          m.endShot();
          hideWatchers(m);
          s.goku.setHidden(false);
          s.beerus.setHidden(false);
          SL.Staging._put(s.goku, new V3(-4, 30, -3));
          s.goku.grounded = false;
          s.goku.setState('scripted', { pose: 'tumble', expression: 'grit' });
          SL.Staging._put(s.beerus, new V3(6, 34, 5));
          s.beerus.grounded = false;
          s.beerus.setState('scripted', { pose: 'bs_flyIdle', expression: 'grin' });
          m.fade('clear', 0.4);
          b.stage.setMood(0.25, 0x0a1a3a, 0.2);
          for (let i = 0; i < 20; i++) b.vfx.rock(new V3(-4 + (i % 5) - 2, 32, -3 + Math.floor(i / 5) - 2), new V3((i % 3) - 1, -6, (i % 4) - 1.5), 0.3 + (i % 3) * 0.15, 0x3a3456);
          pt(ctx, 'land', new V3(-4, 0, -3));
          pt(ctx, 'low', new V3(10, 2, 12));
        },
        space: { who: 'goku', mode: 'groundImpact', to: 'land', seconds: 0.5, endPose: 'knockdown', expr: 'grit', radius: 3.5 },
        cam: { from: { at: 'low' }, look: { at: 'goku' }, fov: 60 },
      },
      {
        call: (ctx) => {
          const b = ctx.b, s = st(ctx);
          for (const pr of b.stage.crystals || []) if (pr.alive && pr.pos.distanceTo(s.goku.pos) < 8) b.stage.damageProp(pr, 1e6, s.beerus);
        },
        pose: [{ who: 'goku', pose: 'getup', face: 'grin', speed: 6 }],
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        say: { who: 'goku', line: 'Whoa... where ARE we?', duration: 2 },
        hold: 2,
      },
      {
        space: { who: 'beerus', mode: 'flight', to: [6, 6, 5], seconds: 1, pose: 'bs_flyIdle', endPose: 'bs_flyIdle' },
        cam: { subject: 'beerus', focus: 'wide', angle: 'low', room: 4 },
        say: { who: 'beerus', line: 'A cave under the sea floor. Nobody to get in our way.', duration: 2.8 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      if (b.stage.def.id !== 'crystal_cavern') {
        b.changeStage('crystal_cavern');
        ctx.m.endShot();
      }
      hideWatchers(ctx.m);
      s.goku.setHidden(false);
      s.beerus.setHidden(false);
      ctx.m.fade('clear', 0.3);
    },
  };

  /* ---------------------------------------------------------------- the launch: up through everything */
  S.bgb_launch = {
    id: 'bgb_launch',
    cast,
    clearMood: false,
    events: [
      // the clash in the middle of the cavern: everything shatters
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          K().air(m, s.goku, -0.9, 6, 0, new V3(0, 6, 0), 'punchR', 'shout');
          K().air(m, s.beerus, 0.9, 6, 0, new V3(0, 6, 0), 'bs_poke', 'grin');
          const mid = new V3(0, 7, 0);
          b.vfx.ring(mid, 30, 0xffffff, 0.8);
          b.vfx.ring(mid, 18, 0xff8aa0, 0.6);
          b.vfx.flash(mid, 5, 0xffe0f0, 0.35, SL.Toon.tex.glow);
          b.sfx('explosionHuge', null, { at: mid, pitch: 0.8 });
          b.cameraTraumaAt(mid, 1);
          b.slowmo(0.2, 1);
          for (const pr of b.stage.crystals || []) if (pr.alive) b.stage.damageProp(pr, 1e6, s.goku);
          pt(ctx, 'mid', mid);
        },
        cam: { from: { at: 'mid', off: [9, -3, 12] }, look: { at: 'mid' }, fov: 52 },
        hold: 2,
      },
      {
        tick: (ctx) => {
          const b = ctx.b;
          if (b.frame % 3 === 0) b.vfx.rock(new V3((b.frame % 30) - 15, 30, ((b.frame * 7) % 30) - 15), new V3(0, -10, 0), 0.5, 0x3a3456);
          b.camera.addTrauma(0.04);
        },
        cam: { subject: 'goku', with: 'beerus', focus: 'upper', angle: 'low' },
        say: { who: 'goku', line: 'The whole place is coming down!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // UP: through the roof
      {
        space: [
          { who: 'goku', mode: 'flight', to: [-1, 36, 0], seconds: 0.7, pose: 'flyUp', endPose: 'flyUp' },
          { who: 'beerus', mode: 'flight', to: [1, 37, 0], seconds: 0.7, pose: 'bs_flyForward', endPose: 'bs_flyForward' },
        ],
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.goku.chest(), 0xff6a6a, 1, 0.4);
          b.vfx.trail(s.beerus.chest(), 0xc89aff, 1, 0.4);
        },
        cam: { from: { at: 'mid', off: [6, -6, 6] }, look: { at: 'goku' }, fov: 62 },
      },
      // OUT OF THE SEA: a column of water, two streaks climbing
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('cruise_liner');
          m.endShot();
          hideWatchers(m);
          b.stage.clearMood(0.1);
          const lvl = b.stage.waterLevel;
          const at = new V3(120, lvl, 140);
          SL.Staging._put(s.goku, new V3(at.x - 0.8, lvl + 2, at.z));
          SL.Staging._put(s.beerus, new V3(at.x + 0.8, lvl + 1, at.z));
          s.goku.grounded = s.beerus.grounded = false;
          s.goku.setState('scripted', { pose: 'flyUp', expression: 'grin' });
          s.beerus.setState('scripted', { pose: 'bs_flyForward', expression: 'grin' });
          for (let i = 0; i < 5; i++) K().splash(b, at.clone().add(new V3((i - 2) * 1.5, 0, 0)), 5);
          b.sfx('explosionBig', null, { at, pitch: 0.45, vol: 1.3 });
          pt(ctx, 'out', at);
          pt(ctx, 'outCam', at.clone().add(new V3(-30, 6, 40)));
        },
        space: [
          { who: 'goku', mode: 'flight', to: { at: 'out', off: [-1, 120, 0] }, seconds: 2.2, pose: 'flyUp', endPose: 'flyUp' },
          { who: 'beerus', mode: 'flight', to: { at: 'out', off: [1, 121, 0] }, seconds: 2.2, pose: 'bs_flyForward', endPose: 'bs_flyForward' },
        ],
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.goku.chest(), 0xff6a6a, 1.4, 0.7);
          b.vfx.trail(s.beerus.chest(), 0xc89aff, 1.4, 0.7);
          if (b.frame % 3 === 0) K().splash(b, ctx.cast.out.pos, 3);
          // the sky darkens as they climb
          const k = Math.max(0, Math.min(1, (s.goku.pos.y - 10) / 110));
          K().skyTo(b, K().SKY.high, k);
        },
        cam: { from: { at: 'outCam' }, look: { at: 'goku' }, fov: 58 },
      },
      // through the clouds: white
      {
        call: (ctx) => {
          SL.ScreenFX.flash(0.9, '#ffffff');
          ctx.b.sfx('wind', null, { vol: 1.2, pitch: 0.8 });
        },
        hold: 0.35,
      },
      // THE EDGE OF SPACE: the sky going black, the Earth's curve below
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('stratosphere');
          m.endShot();
          hideWatchers(m);
          b.stage.setAltitude(0.55);
          SL.Staging._put(s.goku, new V3(-0.8, -60, 0));
          SL.Staging._put(s.beerus, new V3(0.8, -59, 0));
          s.goku.setState('scripted', { pose: 'flyUp', expression: 'grin' });
          s.beerus.setState('scripted', { pose: 'bs_flyForward', expression: 'grin' });
          pt(ctx, 'below', new V3(12, -95, 24));
        },
        space: [
          { who: 'goku', mode: 'flight', to: [-5, 0, 0], seconds: 2.6, pose: 'flyUp', endPose: 'flyIdle' },
          { who: 'beerus', mode: 'flight', to: [5, 1.5, 0], seconds: 2.6, pose: 'bs_flyForward', endPose: 'bs_flyIdle' },
        ],
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          b.stage.setAltitude(0.55 + Math.min(1, t / 2.6) * 0.37);
          b.vfx.trail(s.goku.chest(), 0xff6a6a, 1.1, 0.6);
          b.vfx.trail(s.beerus.chest(), 0xc89aff, 1.1, 0.6);
        },
        cam: { from: { at: 'below' }, look: { at: 'goku' }, fov: 64 },
      },
      // the scale of it: two sparks over the curve of the world
      {
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.goku, s.beerus.pos);
          K().faceTo(s.beerus, s.goku.pos);
          pt(ctx, 'far', new V3(0, 0, 0));
        },
        cam: { from: { at: 'far', off: [60, 18, 90] }, to: { at: 'far', off: [40, 10, 64] }, look: { at: 'far', off: [0, -30, 0] }, fov: 52 },
        sfx: { name: 'tinnitus', vol: 0.3 },
        music: { song: 'final_clash', level: 4 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Look at that... the whole Earth, right there.', duration: 2.6, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        ctx.m.endShot();
      }
      hideWatchers(ctx.m);
      b.stage.setAltitude(0.92);
      s.goku.setHidden(false);
      s.beerus.setHidden(false);
    },
  };

  /* ---------------------------------------------------------------- the red goes out — the power does not */
  S.bgb_expire = {
    id: 'bgb_expire',
    cast,
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().air(m, s.goku, -4, 0, 0, new V3(4, 0, 0), 'g_godStance', 'grit');
          K().air(m, s.beerus, 4, 1, 0, s.goku.pos, 'bs_idle', 'calm');
        },
        // the flame gutters: red, gold, red, gold
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const on = Math.floor(t * 5) % 2 === 0 && t < 2;
          K().toForm(s.goku, on ? 'god' : 'godki');
          if (b.frame % 6 === 0) b.vfx.flash(s.goku.headPos(), 0.9, on ? 0xff4a5a : 0xffd040, 0.12, SL.Toon.tex.glow);
        },
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        sfx: { name: 'heartbeat', vol: 0.8 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().toForm(s.goku, 'godki');
          b.vfx.ring(s.goku.chest(), 4, 0xffd040, 0.5);
        },
        pose: [{ who: 'goku', pose: 'lookHands', face: 'shock', speed: 6 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Huh? My hair... the red\'s gone!', duration: 2.4 },
        hold: 2.4,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Your time as a god has run out.', duration: 2.4 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'smirk' }],
        cam: { subject: 'beerus', with: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'beerus', line: '...And yet you\'re still keeping up with me. Your body has absorbed the god\'s power.', duration: 4 },
        hold: 4,
      },
      {
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'grin', speed: 6, aura: 0.9 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'I can still feel it! Alright — let\'s keep going!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      K().toForm(st(ctx).goku, 'godki');
      ctx.m.flags.godExpired = true;
    },
  };

  S.bgb_enough = {
    id: 'bgb_enough',
    cast,
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().air(m, s.goku, -4, 0, 0, new V3(4, 6, 0), 'exhausted', 'grit');
          K().air(m, s.beerus, 4, 6, 0, s.goku.pos, 'bs_idle', 'calm');
        },
        cam: { subject: 'beerus', focus: 'upper', angle: 'low' },
        say: { who: 'beerus', line: 'Hmph. Enough fooling around.', duration: 2.4 },
        hold: 2.4,
      },
      {
        cam: { subject: 'beerus', focus: 'closeup', angle: 'front' },
        say: { who: 'beerus', line: 'Let\'s see if you can protect your planet, Saiyan.', duration: 2.8 },
        music: { song: 'ominous', level: 3 },
        hold: 2.8,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'shock' }],
        hold: 1.4,
      },
    ],
  };

  const def = {
    id: 'bog_battle',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'Battle of Gods',
    subtitle: 'Over the ocean · under the sea · at the edge of space',
    character: 'goku',
    stage: 'cruise_liner',
    parTime: 540,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'A Super Saiyan God against the God of Destruction: over the ocean, through a cavern of crystal, and up until the sky goes black.',
    rewards: ['Story: the Battle of Gods', 'Stages: the Crystal Cavern, the Edge of Space'],
    setup,
    phases: [P.rise, P.sky, P.cavern, P.edge, P.godki, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogBattle = { B };
})();
