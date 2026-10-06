/*
 * CHAPTER 6 — CELL SAGA: THE CELL GAMES (rebuilt 2026-10-01 from the owner's brief)
 * Mission "The Cell Games" (canon, played as Goku).
 *
 * The Games are now a chain of missions (cell_games → cell_gohan → cell_rampage → cell_goodbye →
 * cell_fatherson), each one a cinematic with playable stretches between its beats. This is the first:
 *
 *   OPEN      (scene)       the empty valley and the ring Cell carved; the TV crew and the World
 *                           Champion; the Z Fighters landing on the ridge
 *   SATAN     (scene)       the champion goes first: a Dynamite Kick that does nothing at all, and a
 *                           flick of one finger that sends him into a mesa (a power gap you can see)
 *   GOKU *    (play)        Goku against Cell on the ring: testing each other, no beams, no flight
 *   RISE      (scene)       the fight leaves the ground: dead stops in the air, afterimages,
 *                           pressure rings flattening the dust below
 *   AIR *     (play)        the aerial exchange: hits landed while both of them are flying
 *   KAME      (scene)       the Instant Transmission Kamehameha, frame by frame: the climb, "KA...ME...",
 *                           Cell daring him, Piccolo's warning, the charge (hold), "HA!" — two fingers,
 *                           gone, in front of Cell's jaw, point-blank: the top half of him is vapour
 *   REGROW    (scene)       the legs stand there; then the rest of him grows back
 *   FORFEIT   (scene)       "I give up." A Senzu Bean thrown to the enemy; back up on the ridge, lying
 *                           against a rock with his hands behind his head: "It's your turn, Gohan."
 *   AFTER                   the chapter card
 *
 * Staging (spots, the cast, deaths, props, poses) is SL.data.cellKit (cell_kit.js).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const CK = SL.data.cellKit;

  const GOKU_TEST = { dealt: 0.14, taken: 0.35 };
  const AERIAL_HITS = 8;

  function setup(battle) {
    const S = CK.cast(battle, { player: 'goku' });
    CK.spectate(battle, S, []);
    CK.place(S.cell, CK.onRing(battle, 0, 0), 0);
    S.cell.setState('scripted', { pose: 'cl_calm', expression: 'calm' });
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.8);
      yield* SL.Cinema.play(m, 'cg_open');
    },
  };

  P.satan = {
    id: 'satan',
    run: function* (m) {
      m.lock(true);
      yield* SL.Cinema.play(m, 'cg_satan');
    },
  };

  /** Goku against Cell on the ring: both reading the other, on the ground, no beams. */
  P.goku = {
    id: 'goku',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, c = S.cell;
      CK.prep(m);
      CK.spectate(b, S, ['goku']);
      CK.crew(b);
      CK.takeControl(b, g);
      CK.toForm(g, 'ssj');
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      g.damageDealtMul = 1.3;
      g.damageTakenMul = 0.6;
      g.noFlight = true;
      CK.place(g, CK.onRing(b, 0, 7), Math.PI);
      c.setHidden(false);
      c.untargetable = false;
      CK.toForm(c, 'perfect');
      CK.place(c, CK.onRing(b, 0, -7), 0);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.infiniteHp = false;
      c.noRegen = false;
      c.noFlight = true;
      c.damageDealtMul = 0.18;
      CK.cellBrain(b, c, { personality: 'adaptive', aggression: 0.5, defense: 0.7, ranged: 0.08, beam: 0, preferredRange: 2.4, hooks: null });
      c.target = g;
      g.target = c;
      c.setState('free');
      m.limits({ up: false, upPressed: false });
      CK.goFight(m, ['finale', 3]);
      m.objective('test', 'Test each other', { icon: 'fist', target: 100 });
      m.objective('read', 'Land a Perfect Guard', { icon: 'guard', optional: true });
      m.prompt('cgGuard', 'guard', 'Guard', { when: () => c.state === 'attack' && g.distTo(c) < 4 });
      let dealt = 0, taken = 0;
      const offD = b.on('damage', (e) => {
        if (e.blocked) return;
        if (e.target === c && e.attacker === g) dealt += e.amount;
        if (e.target === g && e.attacker === c) taken += e.amount;
      });
      const offP = b.on('perfectGuard', (e) => {
        if (e.fighter === g) m.complete('read');
      });
      const hook = () => m.progress('test', Math.min(100, Math.floor(Math.max(dealt / (c.hpMax * GOKU_TEST.dealt), taken / (g.hpMax * GOKU_TEST.taken)) * 100)));
      m.tickHooks.push(hook);
      yield () => dealt >= c.hpMax * GOKU_TEST.dealt || taken >= g.hpMax * GOKU_TEST.taken;
      CK.removeHook(m, hook);
      offD();
      offP();
      m.complete('test');
      m.failObjective('read');
      m.limits(null);
      g.noFlight = false;
      c.noFlight = false;
      m.flags.stage1 = { dealt: Math.round(dealt), taken: Math.round(taken) };
      yield 0.4;
    },
  };

  P.rise = {
    id: 'rise',
    run: function* (m) {
      const b = m.battle, S = b.story;
      CK.clearCombat(b);
      S.goku.controller = CK.scripted();
      S.cell.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'cg_rise');
    },
  };

  /** The aerial exchange: only blows landed while both are flying count. */
  P.air = {
    id: 'air',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, c = S.cell;
      CK.prep(m);
      CK.spectate(b, S, ['goku']);
      CK.crew(b);
      CK.takeControl(b, g);
      CK.toForm(g, 'ssj');
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.7));
      g.ki = Math.max(g.ki, 80);
      g.damageDealtMul = 1.3;
      g.damageTakenMul = 0.6;
      CK.placeAir(g, CK.onRing(b, 0, 6).add(new V3(0, 11, 0)), Math.PI);
      CK.toForm(c, 'perfect');
      CK.placeAir(c, CK.onRing(b, 0, -6).add(new V3(0, 11, 0)), 0);
      c.hp = Math.max(c.hp, Math.round(c.hpMax * 0.8));
      c.noRegen = false;
      c.damageDealtMul = 0.3;
      CK.cellBrain(b, c, { aggression: 0.85, defense: 0.72, ranged: 0.3, beam: 0.25, preferredRange: 3, hooks: 'boss' });
      c.target = g;
      g.target = c;
      c.setState('free');
      CK.goFight(m, ['finale', 6]);
      m.objective('air', 'Win the exchange in the air', { icon: 'fist', target: AERIAL_HITS });
      let hits = 0;
      const air = (f) => !f.grounded && f.pos.y - b.stage.heightAt(f.pos.x, f.pos.z) > 1.2;
      const off = b.on('damage', (e) => {
        if (e.blocked || e.target !== c || e.attacker !== g) return;
        if (air(g) && air(c)) m.progress('air', Math.min(AERIAL_HITS, ++hits));
      });
      // gravitational stillness: a fighter at rest in the air pushes the dust flat underneath him
      const press = () => {
        if (b.frame % 40 !== 0) return;
        for (const f of [g, c]) {
          if (!air(f) || f.vel.length() > 3) continue;
          const under = CK.ground(b, f.pos, 0.15);
          if (f.pos.y - under.y < 14) b.vfx.ring(under, 2.5, 0xe8f0ff, 0.5, new V3(0, 1, 0));
        }
      };
      m.tickHooks.push(press);
      m.prompt('cgFly', 'ascend', 'Fly Up', { when: () => g.grounded && air(c) });
      yield () => hits >= AERIAL_HITS || g.hpFrac <= 0.25;
      off();
      CK.removeHook(m, press);
      m.complete('air');
      m.flags.aerialHits = hits;
      yield 0.4;
    },
  };

  P.kame = {
    id: 'kame',
    run: function* (m) {
      const b = m.battle, S = b.story;
      CK.prep(m);
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      CK.place(S.goku, CK.onRing(b, 0, 7), Math.PI);
      CK.place(S.cell, CK.onRing(b, 0, -2), 0);
      CK.faceTo(S.cell, S.goku.pos);
      yield* SL.Cinema.play(m, 'cg_kame_a');
      // 00:12 "...HA... ME...": the sphere between his palms swells like a small sun while the player holds
      // Charge; at the halfway mark Cell stops smiling and the stone under him starts to crack
      const g = S.goku, c = S.cell, TK = SL.data.trunksKit;
      const handsAt = () => g.chest().addScaledVector(g.forward, 0.25).add(new V3(0, -0.45, 0));
      S.kameOrb = TK.orb(b, handsAt(), 0.06, 0x8ad4ff, 0xdff4ff);
      m.onDispose(() => S.kameOrb && S.kameOrb.dispose());
      m.shot((t, out) => {
        const p = g.chest();
        out.pos.copy(p).add(new V3(2.6, -3.2, 3.4));
        out.look.copy(p).add(new V3(0, -0.6, 0));
        out.fov = 46;
      }, 60, { cut: true, blendIn: 0 });
      m.say('goku', '...HA... ME...', 3.2, { style: 'shout' });
      yield* SL.data.vegitoKit.hold(m, {
        fighter: g,
        id: 'cgKame',
        seconds: 3.4,
        pose: 'kameDown',
        face: 'shout',
        label: 'Charge the Kamehameha',
        meter: 'KAMEHAMEHA',
        tick: (k) => {
          if (!S.kameOrb) return;
          S.kameOrb.set(0.06 + k * 0.26);
          S.kameOrb.group.position.copy(handsAt());
          S.kameOrb.pulse();
          if (b.frame % 3 === 0) b.vfx.streamInward(handsAt(), 2 + k * 2, 0x8ad4ff, 2, 0.12, 0.35);
          b.camera.addTrauma(0.01 + k * 0.03);
        },
        beats: [
          {
            at: 0.5,
            run: () => {
              c.setState('scripted', { pose: 'cl_lookUp', expression: 'shock' });
              b.stage.crater(c.pos, 4, 0.4, null);
              b.vfx.rock(c.pos.clone().add(new V3(1.4, 0.2, 0.6)), new V3(0, 6, 0), 0.3, b.stage.rockColor);
              b.sfx('rumble', c, { vol: 1, pitch: 0.6 });
              m.say('cell', '(...He isn\'t bluffing.)', 2.2, { style: 'quiet' });
              m.shot((t, out) => {
                const h = SL.Cinema.actorPoint({ cast: { c } }, 'c:head');
                out.pos.copy(h).addScaledVector(c.forward, 2.4).add(new V3(0.6, -0.5, 0));
                out.look.copy(h).add(new V3(0, -0.25, 0));
                out.fov = 40;
              }, 60, { cut: true, blendIn: 0 });
            },
          },
          {
            at: 0.8,
            run: () => {
              m.shot((t, out) => {
                const p = g.chest();
                out.pos.copy(p).add(new V3(2.4, -1.4, 3));
                out.look.copy(p.clone().lerp(handsAt(), 0.5));
                out.fov = 40;
              }, 60, { cut: true, blendIn: 0 });
            },
          },
        ],
      });
      m.flags.kameCharged = true;
      yield* SL.Cinema.play(m, 'cg_kame_b');
    },
  };

  P.regrow = {
    id: 'regrow',
    run: function* (m) {
      m.lock(true);
      yield* SL.Cinema.play(m, 'cg_regrow');
    },
  };

  P.forfeit = {
    id: 'forfeit',
    run: function* (m) {
      m.lock(true);
      yield* SL.Cinema.play(m, 'cg_forfeit');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'THE CELL GAMES', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'cell_games',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'The Cell Games',
    subtitle: 'Earth · Age 767 · a ring in an empty valley',
    character: 'goku',
    stage: 'cellarena',
    parTime: 420,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'He carved a ring out of the rock and invited the planet. Nobody came but the people who had to — and a man with a TV camera.',
    rewards: ['Story: the Cell Games begin'],
    setup,
    phases: [P.open, P.satan, P.goku, P.rise, P.air, P.kame, P.regrow, P.forfeit, P.after],
  };
  SL.data.missions[def.id] = def;
})();
