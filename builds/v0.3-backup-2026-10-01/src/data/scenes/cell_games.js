/*
 * SCENES — Chapter 6: the Cell Games.
 *
 * The chapter is played as interactive anime: every scene below sits between two
 * stretches of gameplay in mission `cell_games`, and none is entered on a clock.
 *
 *   games_open        the ring, the broadcast, the arrivals, and a man who set the rules himself
 *   cell_measures     the first exchange is over and he stops being polite
 *   cell_blitz        the fight leaves the ground: two afterimages trading in the sky
 *   cell_pressure     the escalation: Goku is spending everything, and it is not enough
 *   cell_regrows      the answer to his threat lands — and he grows the missing half back
 *   goku_forfeits     "I give up", a Senzu Bean thrown to the enemy, and a boy sent into the ring
 *   gohan_refuses     a child who will not fight the way he is being asked to
 *   sixteen_strikes   Cell crushes Gohan; 16 tries to take Cell with him, and pays for it
 *   juniors_born      seven of him, sent at the people Gohan cares about
 *   sixteen_speaks    the last thing 16 says, the silence, the tears, the red line, the scream
 *   ssj2_reveal       eyes, face, the whole shape; and everybody who saw it
 *   purge_open        "The Difference in Power": seven of them round him; he looks at them
 *   purge_catch       the first blow stopped in one hand, a breath, the Junior sent flying
 *   purge_last        after the last of them: dust, the camera round him, the bodies around
 *   cell_spits        one blow to the stomach, and Android 18 comes back out of him
 *   goku_sacrifice    a hand on a shoulder, two fingers, and a flash somewhere else
 *   cell_returns      he comes back; Trunks falls; Vegeta breaks; Gohan's arm is the price
 *   father_son        one arm, one beam, and a voice nobody else can hear
 *   cell_ends         the end of him — and the silence after it
 *   gohan_after       the ring afterwards, and the people standing in it
 *
 * Dialogue is paraphrased English written for this project. Japanese original
 * lines are only added where the project has them verified (none of these scenes
 * carries one yet — see STATUS.md, "Japanese lines to verify").
 *
 * Skip safety: every scene has an `end` that sets the state it guarantees, so a
 * watched scene and a skipped scene hand the mission the same world. The shared
 * staging helpers (spectator spots, the ring height, spawning the Juniors) live in
 * `SL.data.cellGames`, defined by the mission file.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const CG = () => SL.data.cellGames;

  /** Everybody the Cell Games scenes can point a camera at. */
  function everyone(m) {
    const s = m.battle.story;
    const cast = {
      goku: s.goku, gohan: s.gohan, cell: s.cell, a16: s.a16, a18: s.a18,
      piccolo: s.piccolo, vegeta: s.vegeta, trunks: s.trunks, krillin: s.krillin, tien: s.tien,
    };
    (s.juniors || []).forEach((j, i) => (cast['j' + i] = j));
    return cast;
  }

  /** A tick hook that eases several actors to their spots at once (the arrivals). */
  function glideAll(ctx, moves, seconds) {
    const m = ctx.m;
    const list = moves.map(([name, to]) => {
      const f = ctx.cast[name];
      return f ? { f, from: f.pos.clone(), to: to.clone() } : null;
    }).filter(Boolean);
    let t = 0;
    const hook = () => {
      t = Math.min(1, t + 1 / 60 / seconds);
      const k = SL.util.easeInOutCubic(t);
      for (const it of list) {
        it.f.setPosition(it.from.clone().lerp(it.to, k));
        if (it.f.prevPos) it.f.prevPos.copy(it.f.pos);
      }
      if (t >= 1) {
        const i = m.tickHooks.indexOf(hook);
        if (i >= 0) m.tickHooks.splice(i, 1);
      }
    };
    m.tickHooks.push(hook);
  }

  S.games_open = {
    id: 'games_open',
    cast: everyone,
    music: { song: 'finale', level: 2 },
    events: [
      // the ring from the air: small, raised, and nothing else for miles
      {
        call: (ctx) => {
          const cg = CG();
          cg.hideHeroes(ctx.m);
          cg.place(ctx.cast.cell, cg.onRing(ctx.b, 0, 0), 0);
        },
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'calm' }],
        mood: { amount: 0.16, color: 0x303848, seconds: 1.4 },
        cam: { from: [70, 46, 84], to: [36, 24, 46], look: [0, 5, 0], fov: 50, fov2: 44, ease: 'inOut' },
        hold: 4.6,
      },
      // the broadcast: the camera crew and the people who came to watch
      {
        cam: { from: [27, 3.2, 12], to: [25.5, 3, 9.5], look: [0, 6, 0], fov: 46, fov2: 40 },
        say: { who: 'announcer', line: 'Ladies and gentlemen — the whole world is watching. The ring is his. So are the rules.', duration: 4.4 },
        hold: 4.6,
      },
      // Cell, alone in the middle of it, waiting
      {
        cam: { from: { at: 'cell', off: [2.2, -0.6, 4.4] }, to: { at: 'cell', off: [1.6, -0.4, 3.2] }, look: { at: 'cell', off: [0, 0.8, 0] }, fov: 40, fov2: 34 },
        hold: 3.2,
      },
      // they arrive together
      {
        call: (ctx) => {
          const cg = CG();
          const b = ctx.b;
          const moves = [];
          for (const [name, spot] of Object.entries(cg.SPOTS)) {
            const f = ctx.cast[name];
            if (!f) continue;
            const to = cg.ground(b, spot);
            f.setHidden(false);
            f.setPosition(to.clone().add(new V3(0, 24, 16)));
            f.grounded = false;
            f.yaw = f.prevYaw = Math.atan2(-to.x, -to.z);
            f.setState('scripted', { pose: 'flyIdle' });
            moves.push([name, to]);
          }
          glideAll(ctx, moves, 3.4);
        },
        sfx: { name: 'dash', vol: 0.8 },
        cam: { from: [-6, 9, 44], to: [-3, 7, 36], look: [0, 3, 22], fov: 52, fov2: 48 },
        hold: 3.6,
      },
      {
        pose: [
          { who: 'piccolo', pose: 'armsCrossed', face: 'calm' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk' },
          { who: 'trunks', pose: 'idle', face: 'calm' },
          { who: 'krillin', pose: 'idle', face: 'hurt' },
          { who: 'tien', pose: 'armsCrossed', face: 'calm' },
          { who: 'goku', pose: 'idle', face: 'calm' },
          { who: 'gohan', pose: 'tg_scared', face: 'hurt' },
        ],
        cam: { from: { at: 'goku', off: [3.2, 1.2, 4.6] }, to: { at: 'goku', off: [2.4, 0.9, 3.4] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 44, fov2: 38 },
        say: { who: 'krillin', line: 'He has not even moved. He has been standing there the whole time.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, to: { at: 'cell', local: [0.8, 0.52, 2.2] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 42, fov2: 36 },
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk' }],
        say: { who: 'cell', line: 'One at a time, in the ring, until somebody beats me. Then I leave the planet alone.', duration: 4.6 },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'goku', local: [0.9, 0.55, 2.6] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 40 },
        say: { who: 'goku', line: 'And if nobody does?', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'cell', local: [0.8, 0.55, 2.2] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 34 },
        say: { who: 'cell', line: 'Then there will be nobody left to ask.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // Goku steps up onto the stone; the others watch him go
      {
        call: (ctx) => {
          const cg = CG();
          const g = ctx.cast.goku;
          g.setState('scripted', { pose: 'idle', expression: 'calm' });
          glideAll(ctx, [['goku', cg.onRing(ctx.b, 0, 7)]], 2.4);
        },
        pose: [{ who: 'gohan', pose: 'tg_scared', face: 'hurt' }],
        cam: { from: [9, 9, 30], to: [7, 8, 24], look: [0, 5.6, 4], fov: 46, fov2: 42 },
        say: { who: 'piccolo', line: 'Goku first. Then we find out what he is really holding.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      cg.spectate(b, m.battle.story, ['goku', 'gohan']);
      cg.place(cast.goku, cg.onRing(b, 0, 7), Math.PI);
      cg.place(cast.cell, cg.onRing(b, 0, -7), 0);
      cg.watch(cast.gohan, cg.ground(b, cg.GOHAN_SPOT), 'tg_scared', 'hurt');
      for (const k of ['goku', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.gamesOpened = true;
    },
    clearMood: false,
  };

  /** The first exchange is over, and the polite version of him goes away. */
  S.cell_measures = {
    id: 'cell_measures',
    cast: everyone,
    events: [
      {
        pose: [
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
          { who: 'goku', pose: 'idle', face: 'grit' },
        ],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, to: { at: 'cell', local: [0.8, 0.52, 2.2] }, look: { at: 'cell', off: [0, 0.55, 0] }, fov: 42, fov2: 36, ease: 'inOut' },
        say: { who: 'cell', line: 'Good. That was you measuring me. Now measure this.', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_roar', face: 'grit', speed: 8 }],
        screen: { flash: 0.5, color: '#d0ffa0' },
        sfx: { name: 'kiUp', who: 'cell', vol: 1, pitch: 0.75 },
        vfx: { kind: 'ring', at: { at: 'cell' }, radius: 9, color: 0xa8ff6a, life: 0.6 },
        crack: { at: { at: 'cell', off: [0, -1, 0] }, radius: 4, depth: 0.5 },
        shake: { at: { at: 'cell' }, amount: 0.7 },
        cam: { from: { at: 'cell', off: [4.4, 2.2, 5.6] }, to: { at: 'cell', off: [3.2, 1.6, 4.2] }, look: { at: 'cell', off: [0, 0.8, 0] }, fov: 46, fov2: 40 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'goku', local: [0.7, 0.5, 2.2] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'goku', line: 'All right. No more warming up.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['goku', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.cellSerious = true;
    },
    clearMood: false,
  };

  /** The fight leaves the ground: afterimages trading blows faster than the crowd can follow. */
  S.cell_blitz = {
    id: 'cell_blitz',
    cast: everyone,
    events: [
      {
        hide: ['goku', 'cell'],
        sfx: { name: 'teleport', vol: 1 },
        vfx: { kind: 'flash', at: [0, 16, 0], size: 5, color: 0xffffff },
        cam: { from: [14, 9, 24], to: [10, 11, 18], look: [0, 16, 0], fov: 50, fov2: 46 },
        say: { who: 'krillin', line: 'Where did they go? I cannot even see them!', duration: 2.8, style: 'shout' },
        hold: 1.2,
      },
      { vfx: { kind: 'flash', at: [-8, 20, -4], size: 6, color: 0xfff4b0 }, sfx: { name: 'punchHeavy', vol: 1, pitch: 0.8 }, shake: { at: [-8, 20, -4], amount: 0.4 }, hold: 0.45 },
      { vfx: { kind: 'flash', at: [9, 14, 6], size: 6, color: 0xd0ffa0 }, sfx: { name: 'punchHeavy', vol: 1, pitch: 0.9 }, shake: { at: [9, 14, 6], amount: 0.4 }, hold: 0.4 },
      { vfx: { kind: 'ring', at: [2, 24, -10], radius: 6, color: 0xffffff, life: 0.4, flat: false }, sfx: { name: 'punchHeavy', vol: 1.1, pitch: 0.7 }, shake: { at: [2, 24, -10], amount: 0.5 }, hold: 0.4 },
      { vfx: { kind: 'flash', at: [-12, 12, 8], size: 6, color: 0xfff4b0 }, sfx: { name: 'teleport', vol: 0.8 }, hold: 0.35 },
      { vfx: { kind: 'flash', at: [6, 26, 2], size: 7, color: 0xd0ffa0 }, sfx: { name: 'punchHeavy', vol: 1.2, pitch: 0.6 }, shake: { at: [6, 26, 2], amount: 0.6 }, hold: 0.5 },
      {
        pose: [
          { who: 'piccolo', pose: 'armsCrossed', face: 'grit' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'angry' },
        ],
        cam: { from: { at: 'vegeta', local: [0.9, 0.5, 2.4] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Tch. He has been holding back even now.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        call: (ctx) => {
          const cg = CG();
          const b = ctx.b;
          cg.placeAir(ctx.cast.goku, cg.onRing(b, 0, 6).add(new V3(0, 11, 0)), Math.PI);
          cg.placeAir(ctx.cast.cell, cg.onRing(b, 0, -6).add(new V3(0, 11, 0)), 0);
        },
        show: ['goku', 'cell'],
        pose: [
          { who: 'goku', pose: 'flyIdle', face: 'grit' },
          { who: 'cell', pose: 'flyIdle', face: 'smirk' },
        ],
        vfx: { kind: 'ring', at: { at: 'goku' }, radius: 5, color: 0xffe25a, life: 0.5, flat: false },
        cam: { from: { at: 'goku', off: [6, 2, 8] }, to: { at: 'goku', off: [4, 1.4, 6] }, look: { at: 'cell', off: [0, 0.5, 0] }, fov: 48, fov2: 42 },
        hold: 2,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      for (const k of ['goku', 'cell']) if (cast[k]) cast[k].setHidden(false);
      cg.placeAir(cast.goku, cg.onRing(b, 0, 6).add(new V3(0, 11, 0)), Math.PI);
      cg.placeAir(cast.cell, cg.onRing(b, 0, -6).add(new V3(0, 11, 0)), 0);
      for (const k of ['goku', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.inTheAir = true;
    },
    clearMood: false,
  };

  /** The escalation: everything he has, spent, and the man opposite is still standing in it. */
  S.cell_pressure = {
    id: 'cell_pressure',
    cast: everyone,
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [
          { who: 'goku', pose: 'exhausted', face: 'hurt', speed: 3 },
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
        ],
        mood: { amount: 0.3, color: 0x2a1a10, seconds: 1.2 },
        cam: { from: { at: 'goku', local: [0.9, 0.5, 2.6] }, to: { at: 'goku', local: [0.6, 0.47, 1.9] }, look: { at: 'goku', off: [0, 0.44, 0] }, fov: 40, fov2: 32, ease: 'inOut' },
        hold: 3,
      },
      {
        cam: { from: { at: 'cell', local: [0.9, 0.55, 2.6] }, look: { at: 'cell', off: [0, 0.55, 0] }, fov: 38 },
        say: { who: 'cell', line: 'You are breathing hard, Goku. I am not breathing at all.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      // the ring is not where it started
      {
        vfx: { kind: 'dust', at: [0, 5.6, 0], radius: 10, count: 22 },
        sfx: { name: 'rumble', vol: 0.8, pitch: 0.55 },
        cam: { from: [22, 18, 28], to: [16, 12, 20], look: [0, 5.5, 0], fov: 54, fov2: 46, ease: 'inOut' },
        say: { who: 'piccolo', line: 'He is spending everything he has, and Cell is barely scratched.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.5, 0.47, 1.7] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 30 },
        say: { who: 'goku', line: 'Then I will keep going until one of us has to stop.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['goku', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.gokuPressed = true;
    },
    clearMood: false,
  };

  /** The answer landed. He is half gone — and then he is not. */
  S.cell_regrows = {
    id: 'cell_regrows',
    cast: everyone,
    events: [
      {
        call: (ctx) => {
          const cg = CG();
          cg.place(ctx.cast.cell, cg.onRing(ctx.b, 0, -6), 0);
          cg.place(ctx.cast.goku, cg.onRing(ctx.b, 0, 7), Math.PI);
        },
        pose: [
          { who: 'cell', pose: 'knockdown', face: 'ko' },
          { who: 'goku', pose: 'exhausted', face: 'hurt', speed: 3 },
        ],
        music: { song: null, level: 0 },
        vfx: { kind: 'dust', at: { at: 'cell' }, radius: 4, count: 20 },
        cam: { from: { at: 'cell', off: [4, 2.4, 5] }, to: { at: 'cell', off: [3, 1.8, 3.8] }, look: { at: 'cell', off: [0, 0.2, 0] }, fov: 44, fov2: 38 },
        say: { who: 'krillin', line: 'He got him. He actually got him!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_brace', face: 'grit', speed: 5 }],
        vfx: { kind: 'stream', at: { at: 'cell' }, radius: 3, color: 0xa8ff6a, count: 10, size: 0.2, life: 0.6 },
        sfx: { name: 'kiCharge', who: 'cell', vol: 0.9, pitch: 0.7 },
        mood: { amount: 0.3, color: 0x14240e, seconds: 0.8 },
        cam: { from: { at: 'cell', local: [1.2, 0.6, 3] }, to: { at: 'cell', local: [0.9, 0.55, 2.3] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 34 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const c = ctx.cast.cell;
          if (c) c.hp = c.hpMax;
        },
        pose: [{ who: 'cell', pose: 'cl_roar', face: 'shout', speed: 8 }],
        screen: { flash: 0.5, color: '#d0ffa0' },
        vfx: { kind: 'ring', at: { at: 'cell' }, radius: 7, color: 0xa8ff6a, life: 0.5 },
        shake: { at: { at: 'cell' }, amount: 0.5 },
        cam: { from: { at: 'cell', off: [3.6, 1.8, 4.6] }, look: { at: 'cell', off: [0, 0.9, 0] }, fov: 44 },
        say: { who: 'cell', line: 'Piccolo\'s cells. You could have taken all of it, and I would still be standing here.', duration: 4.6 },
        hold: 4.8,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'hurt' }],
        cam: { from: { at: 'piccolo', local: [0.9, 0.55, 2.6] }, look: { at: 'piccolo', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'piccolo', line: 'He regenerated. And Goku has nothing left.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const c = cast.cell;
      if (c) {
        c.hp = c.hpMax;
        c.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
      }
      if (cast.goku) cast.goku.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
      m.flags.cellRegrew = true;
    },
    clearMood: false,
  };

  S.goku_forfeits = {
    id: 'goku_forfeits',
    cast: everyone,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'hurt', speed: 3 },
          { who: 'cell', pose: 'cl_calm', face: 'smirk' },
        ],
        cam: { from: { at: 'goku', local: [0.8, 0.5, 2.4] }, to: { at: 'goku', local: [0.65, 0.48, 2] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 38, fov2: 33 },
        say: { who: 'goku', line: 'I give up. I cannot beat you.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [
          { who: 'krillin', pose: 'idle', face: 'shock' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'angry' },
          { who: 'gohan', pose: 'tg_scared', face: 'shock' },
        ],
        // on the sand below the ring: frame him from his own side, or the platform wall fills the shot
        cam: { from: { at: 'vegeta', local: [1.6, 0.5, 3.4] }, to: { at: 'vegeta', local: [1.2, 0.45, 2.8] }, look: { at: 'vegeta', off: [0, 0.45, 0] }, fov: 42, fov2: 38 },
        say: { who: 'vegeta', line: 'Kakarot — you are handing him the fight?', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'goku', local: [0.9, 0.5, 2.6] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 40 },
        say: { who: 'goku', line: 'I am not handing him anything. Somebody here is stronger than me. Gohan — you are next.', duration: 5, style: 'quiet' },
        hold: 5.2,
      },
      // a Senzu Bean, thrown to the enemy, so nobody can say the fight was not fair
      {
        pose: [{ who: 'goku', pose: 'throwRelease', face: 'calm', speed: 10 }],
        sfx: { name: 'uiMove', vol: 1, pitch: 1.4 },
        vfx: { kind: 'beamLine', at: { at: 'goku' }, to: { at: 'cell' }, color: 0x8ac060, core: 0xd8ffb0, size: 0.18, steps: 10 },
        cam: { from: [22, 9, 1], to: [20, 8.6, 0], look: [0, 6.4, 0], fov: 50, fov2: 48 },
        say: { who: 'piccolo', line: 'A Senzu Bean? To him? Goku, have you lost your mind!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'smirk' }],
        vfx: { kind: 'flash', at: { at: 'cell' }, size: 3, color: 0xa8ff6a },
        cam: { from: { at: 'cell', local: [1, 0.55, 2.6] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'cell', line: 'The child. You are giving me the child.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const cg = CG();
          const gh = ctx.cast.gohan;
          gh.setState('scripted', { pose: 'idle', expression: 'hurt' });
          glideAll(ctx, [['gohan', cg.onRing(ctx.b, 0, 7)], ['goku', cg.ground(ctx.b, cg.SPOTS.goku)]], 3);
        },
        pose: [{ who: 'gohan', pose: 'idle', face: 'hurt' }],
        cam: { from: { at: 'gohan', off: [3, 1.6, 4.2] }, to: { at: 'gohan', off: [2, 1.2, 3] }, look: { at: 'gohan', off: [0, 0.5, 0] }, fov: 44, fov2: 38 },
        say: { who: 'goku', line: 'You are stronger than me, Gohan. You have been for a while. You just do not like it.', duration: 4.8, style: 'quiet' },
        hold: 5,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      const g = cast.goku;
      if (g) {
        cg.watch(g, cg.ground(b, cg.SPOTS.goku), 'exhausted', 'calm');
        g.untargetable = true;
      }
      if (cast.cell) cast.cell.hp = cast.cell.hpMax;
      cg.place(cast.gohan, cg.onRing(b, 0, 7), Math.PI);
      cg.place(cast.cell, cg.onRing(b, 0, -7), 0);
      for (const k of ['gohan', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.forfeited = true;
      m.flags.senzuForCell = true;
    },
    clearMood: false,
  };

  /** He will not fight the way he is being asked to, and that is the problem. */
  S.gohan_refuses = {
    id: 'gohan_refuses',
    cast: everyone,
    events: [
      {
        pose: [
          { who: 'gohan', pose: 'tg_scared', face: 'hurt' },
          { who: 'cell', pose: 'cl_calm', face: 'angry' },
        ],
        cam: { from: { at: 'gohan', local: [0.8, 0.45, 2.4] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 38 },
        say: { who: 'teen_gohan', line: 'I do not want to hurt you. I do not want to hurt anybody.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        cam: { from: { at: 'cell', local: [0.9, 0.55, 2.4] }, to: { at: 'cell', local: [0.7, 0.52, 1.9] }, look: { at: 'cell', off: [0, 0.55, 0] }, fov: 38, fov2: 32 },
        say: { who: 'cell', line: 'Your father says there is something in you. I believe him. So I will go and get it out.', duration: 5, style: 'quiet' },
        hold: 5.2,
      },
      {
        pose: [{ who: 'goku', pose: 'exhausted', face: 'hurt' }],
        cam: { from: { at: 'goku', local: [0.7, 0.5, 2.2] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Gohan — he is not going to stop. Not for asking.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['gohan', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.gohanRefused = true;
    },
    clearMood: false,
  };

  /** Cell crushes him to make him angry; 16 tries to end it with his own body, and cannot. */
  S.sixteen_strikes = {
    id: 'sixteen_strikes',
    cast: everyone,
    events: [
      {
        call: (ctx) => {
          const cg = CG();
          const b = ctx.b, gh = ctx.cast.gohan, c = ctx.cast.cell;
          cg.place(gh, cg.onRing(b, 0, 2), 0);
          cg.place(c, cg.onRing(b, 0, 1.1), 0);
        },
        pose: [
          { who: 'cell', pose: 'grab', face: 'grin' },
          { who: 'gohan', pose: 'hitHeavy', face: 'hurt', speed: 4 },
        ],
        sfx: { name: 'guardBreak', who: 'gohan', vol: 0.9, pitch: 0.7 },
        shake: { at: { at: 'gohan' }, amount: 0.35 },
        cam: { from: { at: 'gohan', local: [1.6, 0.4, 3] }, to: { at: 'gohan', local: [1.2, 0.3, 2.4] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 42, fov2: 36 },
        say: { who: 'cell', line: 'Get angry. Scream. Show me what your father saw.', duration: 3.8 },
        hold: 4,
      },
      {
        call: (ctx) => {
          const cg = CG();
          const a = ctx.cast.a16;
          a.setHidden(false);
          a.setState('scripted', { pose: 'dash' });
          a.setPosition(cg.ground(ctx.b, cg.SPOTS.a16).add(new V3(0, 3, 0)));
          glideAll(ctx, [['a16', ctx.cast.cell.pos.clone().add(new V3(0, 0, -0.9))]], 0.9);
        },
        sfx: { name: 'dash', vol: 1 },
        cam: { from: [8, 8, -6], to: [6, 7, -4], look: [0, 6.2, 0], fov: 48, fov2: 44 },
        hold: 1.1,
      },
      {
        pose: [
          { who: 'a16', pose: 'grab', face: 'calm' },
          { who: 'cell', pose: 'cl_brace', face: 'shock' },
        ],
        cam: { from: { at: 'a16', local: [0.9, 0.55, 2.2] }, look: { at: 'a16', off: [0, 0.55, 0] }, fov: 36 },
        say: { who: 'android_16', line: 'You are coming with me.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        screen: { flash: 0.25, color: '#ffffff' },
        cam: { from: { at: 'cell', local: [0.8, 0.5, 2.2] }, look: { at: 'cell', off: [0, 0.55, 0] }, fov: 36 },
        say: { who: 'cell', line: 'Nothing. They took the bomb out of you, and nobody told you.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        call: (ctx) => {
          const cg = CG();
          const a = ctx.cast.a16, gh = ctx.cast.gohan;
          cg.place(a, cg.onRing(ctx.b, -9, -9), 0.8);
          if (a.setTorn) a.setTorn(true);
          cg.place(gh, cg.onRing(ctx.b, 4, 5), Math.PI);
        },
        pose: [
          { who: 'a16', pose: 'knockdown', face: 'ko' },
          { who: 'gohan', pose: 'knockdown', face: 'hurt' },
          { who: 'cell', pose: 'cl_kame', face: 'angry', speed: 12 },
        ],
        screen: { flash: 0.7, color: '#dfffc0' },
        sfx: { name: 'explosionBig', who: 'cell', vol: 1.1, pitch: 0.9 },
        vfx: { kind: 'explosion', at: [-9, 6, -9], radius: 6, color: 0xa8ff6a },
        crack: { at: [-9, 5.4, -9], radius: 4, depth: 0.6 },
        shake: { at: [-9, 6, -9], amount: 0.8 },
        cam: { from: [-2, 9, 4], to: [-4, 8, 2], look: [-9, 5.6, -9], fov: 48, fov2: 44 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      const a = cast.a16;
      if (a) {
        a.setHidden(false);
        cg.watch(a, cg.onRing(b, -9, -9), 'knockdown', 'ko');
        if (a.setTorn) a.setTorn(true);
      }
      cg.place(cast.gohan, cg.onRing(b, 4, 5), Math.PI);
      cg.place(cast.cell, cg.onRing(b, 0, -4), 0);
      if (cast.gohan) cast.gohan.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      if (cast.cell) cast.cell.setState('scripted', { pose: 'cl_calm', expression: 'angry' });
      m.flags.sixteenStruck = true;
    },
    clearMood: false,
  };

  /** Seven of him, and not one of them aimed at the person who could stop it. */
  S.juniors_born = {
    id: 'juniors_born',
    cast: everyone,
    music: { song: 'battle', level: 5 },
    events: [
      {
        pose: [{ who: 'cell', pose: 'cl_brace', face: 'grit', speed: 6 }],
        mood: { amount: 0.34, color: 0x1a2a1a, seconds: 1 },
        sfx: { name: 'kiCharge', who: 'cell', vol: 1, pitch: 0.6 },
        shake: { at: { at: 'cell' }, amount: 0.5 },
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, to: { at: 'cell', local: [0.8, 0.5, 2.2] }, look: { at: 'cell', off: [0, 0.5, 0] }, fov: 44, fov2: 36 },
        say: { who: 'cell', line: 'You will not fight me. Fine. Watch what my children do to your friends.', duration: 4 },
        hold: 4.2,
      },
      {
        call: (ctx) => {
          const cg = CG();
          const list = cg.ensureJuniors(ctx.m);
          const c = ctx.cast.cell;
          list.forEach((j, i) => {
            const a = (i / list.length) * Math.PI * 2;
            j.setHidden(false);
            cg.place(j, c.pos.clone().add(new V3(Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2)), a + Math.PI);
            j.setState('scripted', { pose: 'cj_crouch', expression: 'grin' });
            ctx.cast['j' + i] = j;
          });
        },
        screen: { flash: 0.65, color: '#d0ffa0' },
        sfx: { name: 'explosionBig', who: 'cell', vol: 1.1, pitch: 1.1 },
        vfx: { kind: 'explosion', at: { at: 'cell' }, radius: 7, color: 0xa8ff6a },
        shake: { at: { at: 'cell' }, amount: 0.8 },
        cam: { from: { at: 'cell', off: [5, 3.4, 7] }, to: { at: 'cell', off: [8, 5, 11] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 48, fov2: 58 },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          for (const j of ctx.m.battle.story.juniors || []) j.setState('scripted', { pose: 'cj_laugh', expression: 'grin', speed: 10 });
        },
        sfx: { name: 'saibaScreech', vol: 0.9, pitch: 1.4 },
        cam: { from: { at: 'cell', off: [-3, 1.2, 5.5] }, look: { at: 'cell', off: [0, 0.4, 0] }, fov: 50 },
        hold: 2.2,
      },
      {
        pose: [
          { who: 'krillin', pose: 'idle', face: 'shock' },
          { who: 'gohan', pose: 'tg_scared', face: 'shock' },
        ],
        cam: { from: { at: 'krillin', local: [0.8, 0.5, 2.2] }, look: { at: 'krillin', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'krillin', line: 'Little Cells... seven of them. Everybody get ready!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      cg.ensureJuniors(m);
      for (const j of b.story.juniors) {
        j.setHidden(false);
        j.setState('free');
      }
      if (cast.gohan) cast.gohan.setState('free');
      m.flags.juniorsBorn = true;
    },
    clearMood: false,
  };

  /**
   * The breaking point. 16 speaks; Cell ends him; and then nothing moves for a
   * long time while a child's face does all of the work: tears first, then the
   * shadow, then the red line across his face, the fists, the ground answering,
   * and only at the very end the scream.
   */
  S.sixteen_speaks = {
    id: 'sixteen_speaks',
    cast: everyone,
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          const cg = CG();
          const a = ctx.cast.a16, gh = ctx.cast.gohan, c = ctx.cast.cell;
          a.setHidden(false);
          cg.watch(a, cg.onRing(ctx.b, -3, 3), 'knockdown', 'calm');
          cg.place(gh, cg.onRing(ctx.b, 0, 6), Math.PI);
          cg.place(c, cg.onRing(ctx.b, 3, -3), -2.4);
          // the Juniors back off behind their father to watch: nothing stands between the camera and Gohan
          let i = 0;
          for (const j of ctx.m.battle.story.juniors || []) {
            if (!j.alive) continue;
            const x = -7.5 + (i++ % 7) * 2.5;
            cg.place(j, cg.onRing(ctx.b, x, -9 - (i % 2) * 1.5), 0);
            j.setState('scripted', { pose: 'cj_idle', expression: 'grin' });
          }
        },
        pose: [{ who: 'gohan', pose: 'tg_scared', face: 'hurt' }],
        mood: { amount: 0.5, color: 0x241c30, seconds: 1.4 },
        cam: { from: { at: 'a16', off: [2.4, -0.2, 2.8] }, to: { at: 'a16', off: [1.8, -0.35, 2.1] }, look: { at: 'a16', off: [0, -0.85, 0] }, fov: 42, fov2: 36 },
        say: { who: 'android_16', line: 'Gohan. It is not wrong to fight for what you love. Let it go.', duration: 5 },
        hold: 5.2,
      },
      // Cell walks over to him, and it is over in a moment
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'calm' }],
        move: { who: 'cell', at: 'a16', off: [1.2, 0, -0.6], seconds: 1.6, face: 'a16' },
        cam: { from: { at: 'gohan', local: [1.4, 0.6, 3.4] }, look: { at: 'cell', off: [0, 0.5, 0] }, fov: 42 },
        say: { who: 'cell', line: 'Noisy machine.', duration: 1.8, style: 'quiet' },
      },
      {
        hide: 'a16',
        pose: [{ who: 'cell', pose: 'cl_tail', face: 'calm', speed: 14 }],
        screen: { flash: 0.7, color: '#ffffff' },
        sfx: { name: 'explosionBig', who: 'cell', vol: 1.2, pitch: 0.8 },
        slow: { scale: 0.3, seconds: 1 },
        shake: { at: { at: 'gohan' }, amount: 1 },
        vfx: { kind: 'explosion', at: { at: 'a16' }, radius: 5, color: 0xffb070 },
        crack: { at: { at: 'a16' }, radius: 3, depth: 0.5 },
        cam: { from: { at: 'gohan', local: [0.7, 0.5, 2.2] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 34 },
        hold: 2.8,
      },
      // stillness: no line, no music, nothing moving. Four seconds of a child's
      // face is a long time on screen, and it is the whole point of the scene.
      {
        pose: [{ who: 'gohan', pose: 'tg_cold', face: 'hurt', speed: 1, aura: 0.05 }],
        vfx: { kind: 'dust', at: { at: 'gohan', off: [0, 3, 0] }, radius: 4, count: 8 },
        cam: { from: { at: 'gohan', local: [0.5, 0.48, 1.7] }, to: { at: 'gohan', local: [0.4, 0.46, 1.35] }, look: { at: 'gohan', off: [0, 0.44, 0] }, fov: 30, fov2: 25 },
        hold: 4,
      },
      // the tears come first, before any of the anger
      {
        rage: { who: 'gohan', amount: 0.3 },
        pose: [{ who: 'gohan', pose: 'tg_cold', face: 'hurt', speed: 1, aura: 0.05 }],
        sfx: { name: 'heartbeat', who: 'gohan', vol: 0.5, pitch: 0.9 },
        cam: { from: { at: 'gohan', local: [0.34, 0.46, 1.25] }, to: { at: 'gohan', local: [0.3, 0.45, 1.1] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 25, fov2: 22 },
        shake: { at: { at: 'gohan' }, amount: 0.12 },
        hold: 3.2,
      },
      // the shadow gathers, the fists close, the breathing goes
      {
        rage: { who: 'gohan', amount: 0.55 },
        pose: [{ who: 'gohan', pose: 'tg_ssjClench', face: 'grit', speed: 3, aura: 0.15 }],
        sfx: { name: 'heartbeat', who: 'gohan', vol: 0.8, pitch: 0.8 },
        shake: { at: { at: 'gohan' }, amount: 0.25 },
        cam: { from: { at: 'gohan', local: [0.9, 0.2, 1.6] }, to: { at: 'gohan', local: [0.7, 0.25, 1.3] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 30, fov2: 26 },
        hold: 2.8,
      },
      // and then the line across his face, and the ring starting to go
      {
        rage: { who: 'gohan', amount: 1 },
        pose: [{ who: 'gohan', pose: 'tg_ssjClench', face: 'angry', speed: 5, aura: 0.35 }],
        screen: { flash: 0.3, color: '#ff3048' },
        sfx: { name: 'kiUp', who: 'gohan', vol: 0.8, pitch: 0.55 },
        vfx: { kind: 'dust', at: { at: 'gohan' }, radius: 3.2, count: 14 },
        mood: { amount: 0.66, color: 0x2a0812, seconds: 0.7 },
        shake: { at: { at: 'gohan' }, amount: 0.5 },
        // from just under his eye line: the clench bends his head forward, and the face is under the fringe
        cam: { from: { at: 'gohan', local: [0.3, 0.12, 1.25] }, to: { at: 'gohan', local: [0.26, 0.16, 1.08] }, look: { at: 'gohan', off: [0, 0.38, 0] }, fov: 24, fov2: 20 },
        hold: 3.4,
      },
      // the arena answers before he does: cracks, rocks lifting, the first lightning
      {
        crack: { at: { at: 'gohan', off: [0, -1, 0] }, radius: 5, depth: 0.6 },
        vfx: { kind: 'rocks', at: { at: 'gohan' }, radius: 6, count: 16, lift: 5 },
        sfx: { name: 'rumble', vol: 0.9, pitch: 0.6 },
        shake: { at: { at: 'gohan' }, amount: 0.7 },
        cam: { from: { at: 'gohan', off: [3.2, 1.6, 4.4] }, look: { at: 'gohan', off: [0, 0.1, 0] }, fov: 44, orbit: { at: { at: 'gohan', off: [0, 0.1, 0] }, from: 0.6, to: 2.6, radius: 4.6, radius2: 3.8, y: 0.7, y2: 0.1 } },
        hold: 3,
      },
      {
        vfx: { kind: 'bolt', at: { at: 'gohan', off: [0.4, 1, 0.2] }, length: 2.4, color: 0xdff6ff },
        crack: { at: { at: 'gohan', off: [2, -1, 1] }, radius: 3, depth: 0.4 },
        sfx: { name: 'lightning', vol: 0.9 },
        shake: { at: { at: 'gohan' }, amount: 0.8 },
        cam: { from: { at: 'gohan', off: [-3.4, 0.4, 3] }, to: { at: 'gohan', off: [-2.6, 0.2, 2.4] }, look: { at: 'gohan', off: [0, 1.1, 0] }, fov: 42, fov2: 38 },
        hold: 1.6,
      },
      // the scream
      {
        pose: [{ who: 'gohan', pose: 'tg_ascend', face: 'shout', speed: 8, aura: 1 }],
        screen: { flash: 0.4, color: '#ffffff' },
        sfx: { name: 'ssjRise', who: 'gohan', vol: 1.2 },
        vfx: { kind: 'ring', at: { at: 'gohan' }, radius: 10, color: 0xffffff, life: 0.6 },
        shake: { at: { at: 'gohan' }, amount: 1 },
        cam: { from: { at: 'gohan', local: [1.2, -0.3, 2.6] }, to: { at: 'gohan', local: [2.6, 0.4, 6.5] }, look: { at: 'gohan', off: [0, 0.5, 0] }, fov: 40, fov2: 50 },
        hold: 2,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const a = cast.a16;
      if (a) {
        a.setHidden(true);
        a.untargetable = true;
        a.alive = false;
      }
      const g = cast.gohan;
      if (g) {
        g.setState('free');
        // watched or skipped, he comes out of this scene wearing it
        if (g.setRage) g.setRage(true, 1);
      }
      m.flags.sixteenGone = true;
      m.flags.gohanRaged = true;
      m.flags.gohanBreaking = true;
    },
    clearMood: false,
  };

  /** After the transformation: the eyes, the face, the whole shape, and everybody who saw it. */
  S.ssj2_reveal = {
    id: 'ssj2_reveal',
    cast: everyone,
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.12, 0.3, 0.75] }, to: { at: 'gohan', local: [0.1, 0.32, 0.62] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 22, fov2: 18 },
        sfx: { name: 'lightning', vol: 0.8 },
        hold: 1.8,
      },
      {
        vfx: { kind: 'bolt', at: { at: 'gohan', off: [0.3, 0.6, 0.2] }, length: 1.6, color: 0xdff6ff },
        cam: { from: { at: 'gohan', local: [0.5, 0.25, 1.4] }, look: { at: 'gohan', off: [0, 0.38, 0] }, fov: 30 },
        hold: 1.8,
      },
      {
        cam: { from: { at: 'gohan', off: [4.6, 0.6, 5.6] }, to: { at: 'gohan', off: [3, 0.4, 4] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 44, fov2: 40, ease: 'outCubic' },
        vfx: { kind: 'dust', at: { at: 'gohan' }, radius: 4, count: 12 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'shock' }],
        cam: { from: { at: 'cell', local: [1, 0.55, 2.6] }, to: { at: 'cell', local: [0.8, 0.52, 2.1] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 34 },
        say: { who: 'cell', line: 'There it is. That is what your father was waiting for.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'soft' }],
        cam: { from: { at: 'goku', local: [0.8, 0.5, 2.3] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'goku', line: 'He did it.', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'shock' }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.5, 2.4] }, look: { at: 'vegeta', off: [0, 0.48, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'That power... he has gone past all of us.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'calm' }],
        cam: { from: { at: 'piccolo', local: [0.9, 0.55, 2.4] }, look: { at: 'piccolo', off: [0, 0.5, 0] }, fov: 36 },
        say: { who: 'piccolo', line: 'Careful, Gohan. Anger that big does not know when to stop.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      if (cast.gohan) {
        cast.gohan.setState('free');
        if (cast.gohan.setRage) cast.gohan.setRage(true, 1);
      }
      if (cast.cell) cast.cell.setState('free');
      m.flags.ssj2Revealed = true;
    },
    clearMood: false,
  };

  /*
   * "The Difference in Power" (the purge; SL.data.cellPurge). Three beats around the fight, all
   * short, no dialogue: the circle closing, the first blow caught, and the stillness after the last.
   */
  const JR = ['j0', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6'];
  const standingJuniors = (ctx) => JR.map((k) => ctx.cast[k]).filter((j) => j && j.alive && !j.hidden);

  /** Seven of them round him, grinning; he looks at them, one at a time. */
  S.purge_open = {
    id: 'purge_open',
    cast: everyone,
    music: { song: 'finale', level: 4 },
    events: [
      {
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 4, aura: 0.7 }].concat(JR.map((k) => ({ who: k, pose: 'cj_crouch', face: 'grin', speed: 6 }))),
        cam: { from: { at: 'gohan', off: [6.5, 1.8, -6.5] }, to: { at: 'gohan', off: [5, 1.3, -5] }, look: { at: 'gohan', off: [0, 0, 0] }, fov: 54, fov2: 48 },
        sfx: { name: 'lightning', vol: 0.5 },
        hold: 2.2,
      },
      {
        // low and in front of him: the one they are all looking at
        cam: { from: { at: 'gohan', local: [0.5, -0.35, 1.9] }, to: { at: 'gohan', local: [0.4, -0.3, 1.55] }, look: { at: 'gohan', off: [0, 0.25, 0] }, fov: 34, fov2: 30 },
        vfx: { kind: 'bolt', at: { at: 'gohan', off: [0.28, 0.4, 0.1] }, length: 1.4, color: 0xdff6ff },
        hold: 1.6,
      },
      {
        pose: [{ who: 'j2', pose: 'cj_laugh', face: 'grin', speed: 8 }, { who: 'j5', pose: 'cj_laugh', face: 'grin', speed: 7 }],
        cam: { from: { at: 'j2', local: [0.55, 0.32, 1.3] }, look: { at: 'j2', off: [0, 0.22, 0] }, fov: 38 },
        hold: 1.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg2_glance', face: 'angry', speed: 4, aura: 0.7 }],
        cam: { from: { at: 'gohan', local: [0.12, 0.34, 0.72] }, to: { at: 'gohan', local: [0.1, 0.36, 0.62] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 22, fov2: 20 },
        vfx: { kind: 'bolt', at: { at: 'gohan', off: [-0.25, 0.5, 0.05] }, length: 1.1, color: 0xdff6ff },
        sfx: { name: 'lightning', vol: 0.35, pitch: 1.3 },
        hold: 1.6,
      },
      {
        // they close in
        call: (ctx) => {
          const gh = ctx.cast.gohan;
          const moves = [];
          for (const k of JR) {
            const j = ctx.cast[k];
            if (!j || !j.alive) continue;
            const d = j.pos.clone().sub(gh.pos).setY(0);
            if (d.lengthSq() < 0.01) continue;
            const to = gh.pos.clone().add(d.setLength(5.2));
            to.y = ctx.b.stage.heightAt(to.x, to.z);
            moves.push([k, to]);
          }
          glideAll(ctx, moves, 1.3);
        },
        cam: { from: { at: 'gohan', off: [0, 7, 9] }, to: { at: 'gohan', off: [0, 5.5, 7.5] }, look: { at: 'gohan', off: [0, -0.2, 0] }, fov: 46, fov2: 42 },
        hold: 1.5,
      },
    ],
    end(ctx) {
      const cg = CG();
      const gh = ctx.cast.gohan;
      // he has not moved: back on his spot, whatever the scripted pose drifted
      const st = ctx.b.story.purge;
      if (st && st.centre) cg.place(gh, st.centre.clone(), gh.yaw);
      // wherever the approach got to: 5.2 m out on its own bearing, facing him, free to move
      for (const j of standingJuniors(ctx)) {
        const d = j.pos.clone().sub(gh.pos).setY(0);
        if (d.lengthSq() > 0.01) cg.place(j, cg.onRing(ctx.b, gh.pos.x + d.x * (5.2 / d.length()), gh.pos.z + d.z * (5.2 / d.length())));
        cg.faceTo(j, gh.pos);
        j.setState('free');
      }
      gh.setState('free');
      ctx.m.flags.purgeOpened = true;
    },
    clearMood: false,
  };

  /** The first blow: stopped in one hand. A breath. Then the Junior leaves the ring the fast way. */
  S.purge_catch = {
    id: 'purge_catch',
    cast: (m) => {
      const c = everyone(m), gh = c.gohan, foe = m.battle.story.purgeFoe;
      c.foe = foe;
      // a point between them whose "forward" is square to the line joining them: local offsets on
      // it give a side-on two-shot of the fist in the hand, wherever the two of them stand
      c.pair = {
        chest: () => gh.chest().lerp(foe.chest(), 0.5),
        get forward() {
          const d = foe.pos.clone().sub(gh.pos).setY(0);
          return d.lengthSq() < 1e-4 ? gh.forward : new V3(d.z, 0, -d.x).normalize();
        },
      };
      return c;
    },
    events: [
      {
        call: (ctx) => {
          const cg = CG(), gh = ctx.cast.gohan, j = ctx.cast.foe;
          const d = j.pos.clone().sub(gh.pos).setY(0);
          if (d.lengthSq() < 0.01) d.set(Math.sin(gh.yaw), 0, Math.cos(gh.yaw));
          d.normalize();
          cg.faceTo(gh, j.pos);
          const at = gh.pos.clone().addScaledVector(d, 1.05);
          at.y = gh.pos.y;
          j.setPosition(at);
          j.prevPos.copy(at);
          j.vel.set(0, 0, 0);
          cg.faceTo(j, gh.pos);
        },
        pose: [
          { who: 'gohan', pose: 'tg2_catch', face: 'angry', speed: 22, aura: 0.35 },
          { who: 'foe', pose: 'cj_slash', face: 'grin', speed: 22 },
        ],
        sfx: { name: 'block', who: 'gohan', pitch: 0.55, vol: 1.3 },
        vfx: { kind: 'flash', at: { at: 'pair' }, size: 0.7, color: 0xfff6d8, life: 0.15 },
        slow: { scale: 0.4, seconds: 0.5 },
        cam: { from: { at: 'pair', local: [0.2, 0.2, 3.4] }, to: { at: 'pair', local: [0.15, 0.18, 3] }, look: { at: 'pair', off: [0, 0.05, 0] }, fov: 30, fov2: 28 },
        hold: 0.8,
      },
      {
        // nothing moves; he looks at it (three-quarter front, a little below his eyes)
        cam: { from: { at: 'gohan', local: [1.25, 0.3, 1.15] }, to: { at: 'gohan', local: [1.1, 0.32, 1] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 26, fov2: 24 },
        vfx: { kind: 'bolt', at: { at: 'gohan', off: [0.2, 0.55, 0] }, length: 1, color: 0xdff6ff },
        hold: 0.9,
      },
      {
        pose: [{ who: 'foe', pose: 'cj_caught', face: 'shock', speed: 10 }],
        // over his shoulder, from outside his aura: the Junior finds out
        cam: { from: { at: 'pair', local: [0.9, 0.25, 1.9] }, look: { at: 'foe', off: [0, 0.28, 0] }, fov: 28 },
        hold: 0.7,
      },
      {
        call: (ctx) => SL.data.cellPurge.catchBlow(ctx.m, ctx.cast.gohan, ctx.cast.foe),
        pose: [{ who: 'gohan', pose: 'tg2_gut', face: 'angry', speed: 20, aura: 0.8 }],
        shake: { at: { at: 'gohan' }, amount: 0.8 },
        cam: { from: { at: 'pair', local: [-0.6, 0.7, -4.4] }, look: { at: 'foe', off: [0, 0, 0] }, fov: 44 },
        hold: 1.4,
      },
    ],
    end(ctx) {
      const gh = ctx.cast.gohan, j = ctx.cast.foe;
      SL.data.cellPurge.catchBlow(ctx.m, gh, j);
      gh.setState('free');
      ctx.m.flags.purgeCaught = true;
    },
    clearMood: false,
  };

  /** After the last of them: dust where it fell, and he comes down onto the ring where it began; the camera goes round him. */
  S.purge_last = {
    id: 'purge_last',
    cast: (m) => {
      const c = everyone(m), st = m.battle.story.purge;
      c.last = m.battle.story.purgeLast || c.gohan;
      // the spot on the ring where the stretch began (the fight may have ended anywhere): facing Cell
      const centre = st && st.centre ? st.centre.clone() : c.gohan.pos.clone();
      c.spot = { chest: () => centre.clone().add(new V3(0, 0.9, 0)), forward: new V3(0, 0, -1), ground: centre };
      return c;
    },
    music: { song: 'finale', level: 2 },
    events: [
      {
        // the last one, where it came down: dust, and nothing else moving (he is out of this shot)
        call: (ctx) => {
          const cg = CG(), gh = ctx.cast.gohan, at = ctx.cast.spot.ground;
          cg.placeAir(gh, at.clone().add(new V3(0, 3.2, 0)), Math.PI);
        },
        cam: { from: { at: 'last', off: [2.2, 2.6, 2.2] }, to: { at: 'last', off: [1.9, 2.3, 1.9] }, look: { at: 'last', off: [0, -0.4, 0] }, fov: 42, fov2: 38 },
        vfx: { kind: 'dust', at: { at: 'last', off: [0, -0.4, 0] }, radius: 3.5, count: 18 },
        hold: 1.4,
      },
      {
        // he comes down onto the ring, low and in front of him
        call: (ctx) => glideAll(ctx, [['gohan', ctx.cast.spot.ground.clone()]], 1),
        pose: [{ who: 'gohan', pose: 'tg2_stance', face: 'angry', speed: 3, aura: 0.8 }],
        cam: { from: { at: 'spot', local: [0.9, -0.55, 3.4] }, look: { at: 'spot', off: [0, 0.9, 0] }, look2: { at: 'spot', off: [0, 0.1, 0] }, fov: 40, fov2: 36 },
        vfx: { kind: 'bolt', at: { at: 'spot', off: [0.3, 2.4, 0.1] }, length: 1.3, color: 0xdff6ff },
        hold: 1.5,
      },
      {
        // slowly round him on the open ring: the aura, the lightning, what is left of them crumbling
        call: (ctx) => {
          for (const k of JR) {
            const j = ctx.cast[k];
            if (j && !j.alive && j.mech) j.witherAfter = j.mech.wither + 30;
          }
        },
        cam: { orbit: { at: { at: 'spot' }, from: 0.6, to: 2.6, radius: 5.2, radius2: 4.4, y: 0.7, y2: 0.4 }, from: { at: 'spot' }, look: { at: 'gohan', off: [0, 0.05, 0] }, fov: 44 },
        tick: (ctx, t) => {
          // a crack of lightning off him every so often (on the shot's own clock, not a dice roll)
          const n = Math.round(t * 60);
          if (n % 50 === 0) ctx.b.vfx.bolt(ctx.cast.gohan.chest().add(new V3(n % 100 ? 0.3 : -0.3, 0.35, 0)), 1.3, 0xdff6ff);
        },
        sfx: { name: 'lightning', vol: 0.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'cell', pose: 'cl_calm', face: 'shock' }],
        cam: { from: { at: 'cell', local: [0.9, 0.3, 2.4] }, look: { at: 'cell', off: [0, 0.35, 0] }, fov: 36 },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const cg = CG(), gh = ctx.cast.gohan;
      // the destroyed are cleared away before the fight with their father
      for (const k of JR) {
        const j = ctx.cast[k];
        if (j && !j.alive) j.setHidden(true);
      }
      cg.place(gh, ctx.cast.spot.ground.clone(), Math.PI);
      gh.setState('free');
      ctx.m.flags.purgeDone = true;
    },
    clearMood: false,
  };

  /** One blow to the stomach, and 18 comes back out of him: the perfect form goes with her. */
  S.cell_spits = {
    id: 'cell_spits',
    cast: everyone,
    events: [
      {
        call: (ctx) => {
          const cg = CG();
          const gh = ctx.cast.gohan, c = ctx.cast.cell;
          cg.place(c, cg.onRing(ctx.b, 0, -2), 0);
          cg.place(gh, cg.onRing(ctx.b, 0, -0.9), Math.PI);
        },
        pose: [
          { who: 'gohan', pose: 'tg2_gut', face: 'angry', speed: 18 },
          { who: 'cell', pose: 'hitBody', face: 'hurt', speed: 12 },
        ],
        screen: { flash: 0.5, color: '#ffffff' },
        sfx: { name: 'punchHeavy', who: 'cell', vol: 1.4, pitch: 0.6 },
        shake: { at: { at: 'cell' }, amount: 0.9 },
        slow: { scale: 0.25, seconds: 1.2 },
        vfx: { kind: 'ring', at: { at: 'cell' }, radius: 5, color: 0xffffff, life: 0.4, flat: false },
        cam: { from: { at: 'cell', local: [2, 0.4, 1.4] }, look: { at: 'cell', off: [0, 0.4, 0] }, fov: 40 },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const cg = CG();
          const a18 = ctx.cast.a18;
          a18.setHidden(false);
          cg.watch(a18, cg.onRing(ctx.b, -5, -6), 'knockdown', 'ko');
        },
        pose: [{ who: 'cell', pose: 'cl_brace', face: 'hurt', speed: 6 }],
        sfx: { name: 'rumble', vol: 0.9, pitch: 0.8 },
        vfx: { kind: 'dust', at: [-5, 5.6, -6], radius: 2.5, count: 10 },
        cam: { from: [4, 8, 2], to: [2, 7.6, 1], look: [-3, 5.6, -5], fov: 46, fov2: 42 },
        say: { who: 'krillin', line: 'Eighteen! She came out of him!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        transform: { who: 'cell', form: 1 },
        screen: { flash: 0.6, color: '#d0ffa0' },
        sfx: { name: 'transformBurst', who: 'cell', vol: 1 },
        vfx: { kind: 'explosion', at: { at: 'cell' }, radius: 5, color: 0x6ad4a8 },
        pose: [{ who: 'cell', pose: 'cl_roar', face: 'shout', speed: 8 }],
        cam: { from: { at: 'cell', off: [4, 2, 5] }, look: { at: 'cell', off: [0, 1, 0] }, fov: 46 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'cell', local: [1, 0.6, 2.8] }, look: { at: 'cell', off: [0, 0.7, 0] }, fov: 40 },
        say: { who: 'cell', line: 'No — NO! You do not get to take this from me!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      const c = cast.cell;
      const semi = c.def.forms.findIndex((f) => f.id === 'semi_perfect');
      if (c.formIndex !== semi) c.applyForm(semi);
      c.setState('free');
      if (cast.a18) cg.watch(cast.a18, cg.onRing(b, -5, -6), 'knockdown', 'ko');
      if (cast.gohan) cast.gohan.setState('free');
      m.flags.eighteenFreed = true;
      m.flags.cellImperfectAgain = true;
    },
    clearMood: false,
  };

  /**
   * The sacrifice. He is beaten, so he takes the planet with him — and the answer
   * is a hand on a shoulder and two fingers, somewhere none of this can reach.
   */
  S.goku_sacrifice = {
    id: 'goku_sacrifice',
    cast: everyone,
    events: [
      {
        call: (ctx) => CG().swell(ctx.m, ctx.cast.cell, 1.5, 4.6),
        pose: [{ who: 'cell', pose: 'cl_brace', face: 'grit', speed: 3 }],
        music: { song: null, level: 0 },
        mood: { amount: 0.55, color: 0x2a2010, seconds: 1.2 },
        sfx: { name: 'kiCharge', who: 'cell', vol: 1.2, pitch: 0.4 },
        shake: { at: { at: 'cell' }, amount: 0.6 },
        cam: { from: { at: 'cell', off: [4, 2.4, 5.6] }, to: { at: 'cell', off: [2.8, 1.8, 3.8] }, look: { at: 'cell', off: [0, 0.8, 0] }, fov: 44, fov2: 36, ease: 'inOut' },
        say: { who: 'cell', line: 'Then none of it was for anything. I will take the planet with me.', duration: 4.6 },
        hold: 4.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg_scared', face: 'shock' }],
        cam: { from: { at: 'gohan', local: [0.6, 0.46, 1.9] }, look: { at: 'gohan', off: [0, 0.44, 0] }, fov: 30 },
        say: { who: 'teen_gohan', line: 'I cannot — there is nothing I can do, he is going to —', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // the quiet one
      {
        call: (ctx) => {
          const cg = CG();
          const g = ctx.cast.goku;
          g.setHidden(false);
          cg.place(g, ctx.cast.cell.pos.clone().add(new V3(1.2, 0, 1.2)), -2.4);
        },
        pose: [{ who: 'goku', pose: 'stand', face: 'soft', speed: 2, aura: 0.1 }],
        screen: { flash: 0.3, color: '#dff2ff' },
        sfx: { name: 'teleport', who: 'goku', vol: 0.8 },
        cam: { from: { at: 'goku', local: [0.45, 0.46, 1.5] }, look: { at: 'goku', off: [0, 0.44, 0] }, fov: 26 },
        say: { who: 'goku', line: 'You did not do anything wrong, son. I am proud of you. Tell your mother I am sorry.', duration: 5.4, style: 'quiet' },
        hold: 5.6,
      },
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'calm', speed: 6 }],
        hide: ['goku', 'cell'],
        screen: { flash: 0.85, color: '#dff2ff' },
        sfx: { name: 'teleport', who: 'goku', vol: 1 },
        vfx: { kind: 'flash', at: { at: 'gohan' }, size: 6, color: 0xdff2ff },
        cam: { from: { at: 'gohan', off: [3, 1.8, 4.4] }, look: { at: 'gohan', off: [0, 0.8, 0] }, fov: 42 },
        hold: 1.8,
      },
      // somewhere else, and then nothing
      {
        screen: { flash: 1, color: '#ffffff' },
        sfx: { name: 'explosionHuge', vol: 1.4, pitch: 0.45 },
        shake: { at: { at: 'gohan' }, amount: 1 },
        slow: { scale: 0.35, seconds: 1.4 },
        mood: { amount: 0.5, color: 0x201828, seconds: 1 },
        cam: { from: { at: 'gohan', off: [8, 9, 12] }, to: { at: 'gohan', off: [14, 16, 20] }, look: { at: 'gohan', off: [0, 10, 0] }, fov: 52, fov2: 62, ease: 'inOut' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg_cold', face: 'hurt', speed: 1 }],
        cam: { from: { at: 'gohan', local: [0.4, 0.46, 1.4] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 26 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const cg = CG();
      cg.swell(m, cast.cell, 1, 0);
      const g = cast.goku;
      if (g) {
        g.setHidden(true);
        g.untargetable = true;
        g.alive = false;
      }
      if (cast.cell) {
        cast.cell.setHidden(true);
        cast.cell.untargetable = true;
      }
      if (cast.gohan) cast.gohan.setState('free');
      m.flags.gokuGone = true;
      m.flags.sacrificed = true;
    },
    clearMood: false,
  };

  /** He comes back. It costs Trunks, it breaks Vegeta, and it takes Gohan's arm. */
  S.cell_returns = {
    id: 'cell_returns',
    cast: everyone,
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          const cg = CG();
          const c = ctx.cast.cell;
          const perfect = c.def.forms.findIndex((f) => f.id === 'perfect');
          if (c.formIndex !== perfect) c.applyForm(perfect);
          c.setHidden(false);
          c.untargetable = true;
          cg.placeAir(c, cg.onRing(ctx.b, 0, -8).add(new V3(0, 30, 0)), 0);
          c.setState('scripted', { pose: 'flyIdle', expression: 'smirk' });
          cg.superAura(c);
        },
        screen: { flash: 0.9, color: '#ffffff' },
        sfx: { name: 'lightning', vol: 1.2 },
        vfx: { kind: 'bolt', at: [0, 30, -8], length: 26, color: 0xdff6ff },
        shake: { at: [0, 10, 0], amount: 0.8 },
        cam: { from: [5, 25, 2], to: [4, 26, 0], look: [0, 30.5, -8], fov: 40, fov2: 36 },
        say: { who: 'krillin', line: 'No. No, no, no — that is his energy!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        move: { who: 'cell', off: [0, 10, -8], seconds: 2.4, ground: false, face: 'gohan' },
        cam: { from: [8, 7, 14], look: { at: 'cell', off: [0, 0.4, 0] }, fov: 44 },
      },
      {
        cam: { from: { at: 'cell', local: [1, 0.55, 2.8] }, to: { at: 'cell', local: [0.8, 0.52, 2.2] }, look: { at: 'cell', off: [0, 0.6, 0] }, fov: 40, fov2: 34 },
        say: { who: 'cell', line: 'I came back. One cell survived the blast, and it rebuilt all of me — and more.', duration: 4.8 },
        hold: 5,
      },
      // the first thing he does with it
      {
        call: (ctx) => {
          const cg = CG();
          const t = ctx.cast.trunks;
          t.setHidden(false);
          cg.watch(t, cg.ground(ctx.b, cg.SPOTS.trunks), 'hitHeavy', 'shock');
        },
        pose: [{ who: 'cell', pose: 'cl_kame', face: 'calm', speed: 16 }],
        vfx: { kind: 'beamLine', at: { at: 'cell' }, to: { at: 'trunks' }, color: 0xff80c0, core: 0xffffff, size: 0.35, steps: 14 },
        sfx: { name: 'kiBlastBig', who: 'cell', vol: 1.1, pitch: 1.4 },
        slow: { scale: 0.35, seconds: 1 },
        cam: { from: { at: 'trunks', local: [1.6, 0.8, 3.4] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 40 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'trunks', pose: 'knockdown', face: 'ko', speed: 6 }],
        cam: { from: { at: 'trunks', off: [2, 2.6, 3] }, look: { at: 'trunks', off: [0, -0.4, 0] }, fov: 40 },
        hold: 2.4,
      },
      // his father, and something breaking in him too
      {
        pose: [{ who: 'vegeta', pose: 'powerUp', face: 'shout', speed: 10 }],
        screen: { flash: 0.4, color: '#e0b0ff' },
        sfx: { name: 'kiUp', who: 'vegeta', vol: 1.1, pitch: 0.7 },
        vfx: { kind: 'ring', at: { at: 'vegeta' }, radius: 6, color: 0xffd33a, life: 0.5 },
        cam: { from: { at: 'vegeta', local: [0.7, 0.5, 2] }, look: { at: 'vegeta', off: [0, 0.48, 0] }, fov: 32 },
        say: { who: 'vegeta', line: 'TRUNKS!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
      {
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta, c = ctx.cast.cell;
          for (let i = 0; i < 8; i++) {
            const at = c.chest().add(new V3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3));
            b.vfx.explosion(at, 2 + Math.random() * 2, 0xffd33a, { smoke: true });
          }
          b.vfx.flash(v.chest(), 3, 0xffd33a, 0.3, SL.Toon.tex.glow);
        },
        pose: [{ who: 'vegeta', pose: 'blastR', face: 'shout', speed: 16 }],
        sfx: { name: 'explosionBig', vol: 1.2 },
        shake: { at: { at: 'cell' }, amount: 0.8 },
        cam: { from: [14, 6, 10], look: { at: 'cell' }, fov: 50 },
        hold: 2.6,
      },
      // the smoke clears on a Cell without a mark on him, and he answers
      {
        pose: [{ who: 'cell', pose: 'cl_kame', face: 'angry', speed: 14 }],
        call: (ctx) => {
          const cg = CG();
          const gh = ctx.cast.gohan, v = ctx.cast.vegeta;
          gh.setPosition(v.pos.clone().add(new V3(0, 1, -1.2)));
          gh.grounded = false;
          gh.yaw = gh.prevYaw = Math.atan2(ctx.cast.cell.pos.x - gh.pos.x, ctx.cast.cell.pos.z - gh.pos.z);
        },
        vfx: { kind: 'beamLine', at: { at: 'cell' }, to: { at: 'gohan' }, color: 0xff80c0, core: 0xffffff, size: 0.6, steps: 16 },
        screen: { flash: 0.8, color: '#ffffff' },
        sfx: { name: 'explosionBig', who: 'gohan', vol: 1.3, pitch: 0.7 },
        slow: { scale: 0.3, seconds: 1.2 },
        shake: { at: { at: 'gohan' }, amount: 1 },
        cam: { from: { at: 'gohan', off: [3, 1.6, 4] }, look: { at: 'gohan', off: [0, 0.6, 0] }, fov: 44 },
        hold: 2.2,
      },
      {
        torn: { who: 'gohan', on: true },
        call: (ctx) => {
          const cg = CG();
          cg.place(ctx.cast.gohan, cg.ground(ctx.b, cg.SPOTS.vegeta).add(new V3(1.6, 0, -1.6)), Math.PI);
          cg.watch(ctx.cast.vegeta, cg.ground(ctx.b, cg.SPOTS.vegeta), 'knockdown', 'ko');
        },
        pose: [{ who: 'gohan', pose: 'tg2_oneArm', face: 'hurt', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.8, 0.46, 2.2] }, to: { at: 'gohan', local: [0.6, 0.45, 1.8] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 36, fov2: 30 },
        say: { who: 'teen_gohan', line: 'My fault. If I had finished him when I could, none of this...', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const { m, cast, b } = ctx;
      const cg = CG();
      const c = cast.cell;
      const perfect = c.def.forms.findIndex((f) => f.id === 'perfect');
      if (c.formIndex !== perfect) c.applyForm(perfect);
      c.setHidden(false);
      c.untargetable = false;
      c.alive = true;
      cg.superAura(c);
      if (cast.trunks) cg.watch(cast.trunks, cg.ground(b, cg.SPOTS.trunks), 'knockdown', 'ko');
      if (cast.vegeta) cg.watch(cast.vegeta, cg.ground(b, cg.SPOTS.vegeta), 'knockdown', 'ko');
      if (cast.gohan) {
        cast.gohan.setTorn(true);
        cast.gohan.setState('free');
      }
      m.flags.cellReturned = true;
      m.flags.trunksDown = true;
      m.flags.gohanArm = true;
    },
    clearMood: false,
  };

  /**
   * The last stand begins. Cell charging above; the boy he is aiming at, one arm hanging,
   * the gi torn, barely standing; the noise of the fight going out of the world; one hand
   * gathering a Kamehameha anyway; a voice only he can hear — and then his father, a
   * spirit with a halo, at his back in the same stance. From here the struggle is played.
   */
  S.father_son = {
    id: 'father_son',
    cast: everyone,
    music: { song: 'finale', level: 5 },
    events: [
      {
        pose: [
          { who: 'cell', pose: 'cl_kameW', face: 'angry', speed: 6 },
          { who: 'gohan', pose: 'tg2_oneArm', face: 'grit', speed: 4 },
        ],
        vfx: { kind: 'stream', at: { at: 'cell' }, radius: 3, color: 0x8ad4ff, count: 10, size: 0.22, life: 0.6 },
        cam: { from: { at: 'cell', local: [2.2, -1.6, 6.5] }, to: { at: 'cell', local: [1.6, -1.2, 5] }, look: { at: 'cell', off: [0, 0.4, 0] }, fov: 46, fov2: 40 },
        say: { who: 'cell', line: 'I will take this whole planet, and everything near it. Stop it with one arm, if you can.', duration: 4.6 },
        hold: 4.8,
      },
      // what is left of him: the arm, the gi, the breathing
      {
        pose: [{ who: 'gohan', pose: 'tg2_oneArm', face: 'hurt', speed: 3 }],
        mood: { amount: 0.35, color: 0x141824, seconds: 1.4 },
        music: { song: 'finale', level: 2 },
        cam: { from: { at: 'gohan', local: [-1.1, -0.1, 2.2] }, to: { at: 'gohan', local: [-0.8, 0.05, 1.7] }, look: { at: 'gohan', off: [0.15, 0.2, 0] }, fov: 40, fov2: 34, ease: 'inOut' },
        sfx: { name: 'heartbeat', who: 'gohan', vol: 0.9, pitch: 0.85 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'tg2_oneKameCharge', face: 'grit', speed: 6 }],
        cam: { from: { at: 'gohan', local: [1.4, 0.6, 3.4] }, to: { at: 'gohan', local: [1, 0.5, 2.6] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 44, fov2: 36 },
        sfx: { name: 'kiCharge', who: 'gohan', vol: 0.8 },
        hold: 2.6,
      },
      // the voice nobody else can hear, in the quiet
      {
        music: { song: null, level: 0 },
        cam: { from: { at: 'gohan', local: [0.5, 0.46, 1.6] }, look: { at: 'gohan', off: [0, 0.44, 0] }, fov: 28 },
        say: { who: 'goku', line: 'Gohan. Do not be afraid of it. Put everything into it — I am right here with you.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      // and he is: at his son's back, a spirit with a halo, in the same stance
      {
        call: (ctx) => CG().spirit(ctx.m.battle, true, 0.15),
        tick: (ctx, t) => ctx.m.battle.story.goku && ctx.m.battle.story.goku.model.setSpiritLevel(0.15 + 0.4 * Math.min(1, t / 1.6)),
        screen: { flash: 0.25, color: '#e8f4ff' },
        sfx: { name: 'visionIn', vol: 0.8 },
        cam: { from: { at: 'gohan', local: [-1.8, -0.2, 3.6] }, to: { at: 'gohan', local: [-1.5, -0.05, 3] }, look: { at: 'gohan', local: [0.3, 0.45, -0.7] }, fov: 44, fov2: 40, ease: 'inOut' },
        say: { who: 'goku', line: 'Together, Gohan.', duration: 2.4, style: 'quiet' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['gohan', 'cell']) if (cast[k]) cast[k].setState('free');
      m.flags.fatherSon = true;
    },
    clearMood: false,
  };

  /** The end of him — played before this, shown here — and the silence after it. */
  S.cell_ends = {
    id: 'cell_ends',
    cast: everyone,
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          const c = ctx.cast.cell;
          if (c) c.setHidden(false);
        },
        pose: [{ who: 'cell', pose: 'hitHeavy', face: 'ko', speed: 4 }],
        screen: { flash: 1, color: '#dff2ff' },
        sfx: { name: 'explosionHuge', vol: 1.4, pitch: 0.7 },
        vfx: { kind: 'explosion', at: { at: 'cell' }, radius: 16, color: 0xdff2ff },
        slow: { scale: 0.3, seconds: 1.6 },
        shake: { at: { at: 'cell' }, amount: 1 },
        cam: { from: { at: 'cell', off: [9, 4, 12] }, to: { at: 'cell', off: [12, 6, 16] }, look: { at: 'cell', off: [0, 0.5, 0] }, fov: 50, fov2: 58 },
        hold: 2.6,
      },
      {
        hide: 'cell',
        vfx: { kind: 'explosion', at: { at: 'cell' }, radius: 24, color: 0xd0ffa0 },
        crack: { at: [0, 5.4, -8], radius: 12, depth: 1 },
        cam: { from: [36, 26, 40], to: [44, 32, 50], look: [0, 6, -6], fov: 52, fov2: 58 },
        hold: 3.2,
      },
      // silence: smoke, dust coming down, nobody speaks
      {
        vfx: { kind: 'dust', at: [0, 6, -4], radius: 14, count: 30 },
        mood: { amount: 0.3, color: 0x3a3a40, seconds: 2 },
        cam: { from: [18, 9, 26], to: [15, 8, 22], look: [0, 5.6, -2], fov: 46, fov2: 42 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'shock' }],
        cam: { from: { at: 'piccolo', local: [0.9, 0.55, 2.4] }, look: { at: 'piccolo', off: [0, 0.5, 0] }, fov: 36 },
        say: { who: 'piccolo', line: 'He is gone. Every last cell of him.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const gh = ctx.cast.gohan;
          if (gh && gh.formIndex !== 0) gh.applyForm(0);
        },
        pose: [{ who: 'gohan', pose: 'defeatKneel', face: 'hurt', speed: 2 }],
        screen: { flash: 0.3, color: '#fff4b0' },
        cam: { from: { at: 'gohan', local: [0.65, 0.05, 1.7] }, to: { at: 'gohan', local: [0.5, 0.02, 1.4] }, look: { at: 'gohan', off: [0, -0.06, 0] }, fov: 34, fov2: 28 },
        say: { who: 'teen_gohan', line: 'Dad... we did it.', duration: 3, style: 'quiet' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const c = cast.cell;
      if (c) {
        c.setHidden(true);
        c.untargetable = true;
        c.alive = false;
      }
      const gh = cast.gohan;
      if (gh) {
        if (gh.formIndex !== 0) gh.applyForm(0);
        gh.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      }
      m.flags.cellGone = true;
    },
    clearMood: false,
  };

  /** The ring afterwards, and the people still standing in it. */
  S.gohan_after = {
    id: 'gohan_after',
    cast: everyone,
    music: { song: 'farewell', level: 4 },
    events: [
      // the arena: what is left of it
      {
        pose: [{ who: 'gohan', pose: 'exhausted', face: 'hurt', speed: 2 }],
        mood: { amount: 0.22, color: 0x2a3044, seconds: 1.8 },
        cam: { from: [40, 30, 46], to: [20, 12, 26], look: [0, 5.4, 0], fov: 56, fov2: 46, ease: 'inOut' },
        hold: 4.4,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'hurt' }],
        cam: { from: { at: 'krillin', local: [0.8, 0.5, 2.2] }, look: { at: 'krillin', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'krillin', line: 'It is over. It is really over... and Goku is not here to see it.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'hurt' }],
        cam: { from: { at: 'piccolo', local: [0.9, 0.55, 2.6] }, look: { at: 'piccolo', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'piccolo', line: 'You won, Gohan. Your father knew you would.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          if (v) v.setState('scripted', { pose: 'idle', expression: 'hurt' });
        },
        pose: [{ who: 'vegeta', pose: 'idle', face: 'hurt' }],
        cam: { from: { at: 'vegeta', local: [1.2, 0.6, 3] }, look: { at: 'vegeta', off: [0, 0.48, 0] }, fov: 40 },
        say: { who: 'vegeta', line: '...', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'gohan', pose: 'defeatKneel', face: 'hurt', speed: 2 }],
        // kneeling: his head is below the actor point, not above it
        cam: { from: { at: 'gohan', local: [0.55, 0.05, 1.6] }, to: { at: 'gohan', local: [0.45, 0.02, 1.35] }, look: { at: 'gohan', off: [0, -0.06, 0] }, fov: 32, fov2: 27 },
        say: { who: 'teen_gohan', line: 'Sixteen asked me to let it go. I did. It cost my father.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'gohan', off: [0.6, 0.2, 2.6] }, to: { at: 'gohan', off: [0.8, 3.6, 6] }, look: { at: 'gohan', off: [0, 8, -10] }, fov: 40, fov2: 50, ease: 'inOut' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const g = cast.gohan;
      if (g) {
        g.setState('free');
        // the rage goes when the fight does
        if (g.setRage) g.setRage(false);
      }
      m.flags.aftermath = true;
    },
  };
})();
