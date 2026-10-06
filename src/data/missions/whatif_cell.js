/*
 * WHAT IF · CHAPTER 6 — "What if Gohan lost to Cell?"   (NOT CANON)
 *
 * Branches from "Father-Son Kamehameha". In the story you know, his father's voice reaches him and
 * the boy wins with one arm. Here the voice never comes:
 *
 *   INTRO  (scene)       the canon return, Vegeta's rage and the despair (cf_return / cf_rage /
 *                        cf_despair) — then silence. Nobody answers. The aura goes out, the boy
 *                        folds, and Cell lowers his hands: he will finish this one by hand.
 *   GUARD  (checkpoint)  PLAYED as Vegeta: Cell walks toward the fallen boy. Every blow you land
 *                        turns him on you for a few seconds (your blows barely move him — the power
 *                        gap); while he is busy with you, Krillin creeps across the field with the
 *                        last Senzu Bean. Let Cell reach Gohan and it is over. When Vegeta drops,
 *                        Piccolo takes his place (party switch).
 *   SENZU  (scene)       Krillin gets there. The bean; the arm sets; the boy stands up on his own.
 *   DUEL   (checkpoint)  PLAYED as Gohan, two arms, Super Saiyan 2: Super Perfect Cell regenerates
 *                        whenever you stop hitting him — keep the pressure on.
 *   SOLAR  (checkpoint)  Cell flies up to destroy the planet. Answer with a Kamehameha and win the
 *                        clash; Vegeta, Piccolo and Krillin each throw in what they have left.
 *   END    (scene)       the light goes out of the sky; the friends who held the line; "You didn't
 *                        need to hear him."
 *
 * Saved on the What-If track; canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const CK = SL.data.cellKit;
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });

  const GOHAN_AT = [0, 9];
  const KRILLIN_FROM = new V3(-14, 0, 30);
  const CELL_REACH = 2.6;
  const SENZU_SECONDS = 26; // seconds of Cell's attention the run needs

  function setup(battle) {
    const b = battle;
    const S = CK.cast(b, { player: 'gohan' });
    CK.spectate(b, S, ['gohan', 'a16', 'goku']);
    CK.gone(S.a16);
    for (const j of S.juniors || []) CK.gone(j);
    CK.gone(S.goku);
    S.goku.alive = false;
    CK.watch(S.a18, CK.onRing(b, -5, -9), 'knockdown', 'ko');
    CK.toForm(S.gohan, 'ssj2');
    S.gohan.lockedForms = {};
    S.gohan.setRage(true, 1);
    S.gohan.setDamage(2);
    CK.place(S.gohan, CK.onRing(b, 0, 5), Math.PI);
    S.cell.setHidden(true);
    S.satan.setState('scripted', { pose: 'ms_hide', expression: 'shock' });
    CK.watch(S.trunks, CK.onRing(b, 4.5, 8), 'idle', 'calm', CK.onRing(b, 0, 0));
    CK.watch(S.vegeta, CK.onRing(b, -4, 9), 'armsCrossed', 'calm', CK.onRing(b, 0, 0));
  }

  /** The field after the despair, for every checkpoint: Trunks dead, Vegeta down, Gohan on his knees. */
  function restore(m, at) {
    const b = m.battle, S = b.story, c = S.cell;
    CK.gone(S.a16);
    CK.gone(S.goku);
    CK.watch(S.trunks, CK.onRing(b, 4.5, 8), 'knockdown', 'ko');
    S.trunks._dead = true;
    c.setHidden(false);
    c.alive = true;
    CK.toForm(c, 'perfect');
    CK.superAura(c);
    const gh = S.gohan;
    gh.setHidden(false);
    CK.toForm(gh, 'ssj2');
    if (at === 'guard') {
      gh.setTorn(true);
      CK.watch(gh, CK.onRing(b, GOHAN_AT[0], GOHAN_AT[1]), 'knockdownFace', 'ko');
      gh.setRage(false);
    }
  }

  const P = {};

  P.intro = {
    id: 'intro',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'cf_return');
      yield* SL.Cinema.play(m, 'cf_rage');
      yield* SL.Cinema.play(m, 'cf_despair');
      // ...and nobody answers
      const gh = S.gohan, c = S.cell, v = S.vegeta;
      m.music(null, 0);
      gh.setState('scripted', { pose: 'cradleArm', expression: 'hurt', aura: 0.05 });
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'face', angle: 'three' }, 3.6);
      m.say('teen_gohan', 'Someone... anyone... please...', 3, { style: 'quiet' });
      yield* m.cine(3.6);
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'wide', angle: 'high', room: 6 }, 3);
      m.say('narrator', '...', 1.6, { style: 'quiet' });
      yield* m.cine(2.8);
      // the gold goes out of his hair; he folds forward into the dirt
      CK.toForm(gh, 'base');
      gh.setRage(false);
      SL.ScreenFX.flash(0.25, '#1a1a24');
      gh.setState('scripted', { pose: 'knockdownFace', expression: 'ko', aura: 0 });
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'full', angle: 'low', room: 3 }, 2.6);
      yield* m.cine(2.6);
      // Cell lowers his hands
      m.music('ominous', 1);
      c.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
      shot(m, { cell: c }, { subject: 'cell', focus: 'upper', angle: 'low' }, 3.8);
      m.say('cell', 'Look at you. You can\'t even stand. I won\'t waste the planet on a corpse.', 3.6);
      yield* m.cine(3.8);
      CK.place(c, CK.onRing(b, 0, -6), 0);
      CK.faceTo(c, gh.pos);
      c.setState('scripted', { pose: 'cl_idle', expression: 'wicked' });
      shot(m, { cell: c, gohan: gh }, { subject: 'cell', with: 'gohan', focus: 'medium' }, 3.2);
      m.say('cell', 'I\'ll do this with my hands. Slowly.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      // one eye opens in the dirt
      v.setState('scripted', { pose: 'knockdown', expression: 'grit' });
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'face', angle: 'low' }, 2.8);
      m.say('vegeta', '...Tch. Get... away from him.', 2.6, { style: 'quiet' });
      yield* m.cine(2.8);
      CK.place(v, CK.ground(b, new V3(-10, 0, 6)));
      CK.faceTo(v, c.pos);
      v.setHidden(false);
      v.setState('scripted', { pose: 'idle', expression: 'angry' });
      shot(m, { vegeta: v, cell: c }, { subject: 'vegeta', with: 'cell', focus: 'upper', angle: 'three' }, 3);
      m.say('vegeta', 'You want the boy? You go THROUGH me.', 2.8, { style: 'shout' });
      yield* m.cine(3);
      m.endShot();
    },
  };

  /** Vegeta (then Piccolo) keeps Cell busy while Krillin crosses the field with the Senzu. */
  P.guard = {
    id: 'guard',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell, gh = S.gohan, v = S.vegeta, pc = S.piccolo, kr = S.krillin;
      CK.prep(m);
      restore(m, 'guard');
      const gohanAt = CK.onRing(b, GOHAN_AT[0], GOHAN_AT[1]);
      CK.toForm(v, 'ssj');
      CK.place(v, CK.ground(b, new V3(-6, 0, 2)));
      CK.takeControl(b, v);
      v.hp = Math.max(Math.round(v.hpMax * 0.55), Math.min(v.hp, v.hpMax));
      v.ki = Math.max(v.ki, 80);
      CK.watch(pc, CK.ground(b, CK.SPOTS.piccolo), 'armsCrossed', 'grit', gohanAt);
      CK.watch(kr, CK.ground(b, KRILLIN_FROM), 'idle', 'nervous', gohanAt);
      CK.place(c, CK.onRing(b, 0, -6), 0);
      CK.faceTo(c, gohanAt);
      c.hp = c.hpMax;
      c.cannotDie = true;
      // he is toying with them: hard enough to put them down in the end, not in five seconds
      c.damageDealtMul = 0.16;
      c.untargetable = false;
      const brain = CK.cellBrain(b, c, { aggression: 0.7, defense: 0.45, ranged: 0.3, beam: 0.1, preferredRange: 3, hooks: 'boss' });
      // the power gap: he barely feels anything either of them can do
      m.powerGap(c, { mul: 0.12, lines: [{ at: 4, who: 'cell', line: 'Is that supposed to tickle, Vegeta?' }, { at: 14, who: 'cell', line: 'You\'re only delaying it.' }] });
      // ATTENTION: every blow buys a little time; when it runs out he turns back to the boy
      const gs = (m.flags.wcGuard = { attention: 0, run: 0, warned: false, switched: false });
      const provoke = (att) => {
        if (!att || att.team !== 0) return;
        gs.attention = Math.min(420, gs.attention + 100);
      };
      const offN = b.on('noSell', (e) => e.fighter === c && provoke(e.attacker));
      const offD = b.on('damage', (e) => e.target === c && provoke(e.attacker));
      c.controller = {
        update(f) {
          const it = SL.emptyIntent();
          if (b.inputLocked || b.aiLocked) return it;
          if (gs.attention > 0) {
            c.target = b.player;
            return brain.update(f);
          }
          // nobody is bothering him: back to the boy, at a walk
          c.target = gh;
          if (c.state === 'free') it.my = 0.32;
          return it;
        },
      };
      c.target = v;
      c.setState('free');
      CK.goFight(m, ['battle', 5]);
      m.objective('guard', 'Keep Cell away from Gohan', { icon: 'guard' });
      m.objective('senzu', 'Krillin: the last Senzu Bean', { icon: 'target', target: 100 });
      // where the boy and the bean are, on screen or off it
      b.emit('markers', { list: [{ obj: gh, icon: 'guard' }, { obj: kr, icon: 'run' }] });
      m.say('krillin', 'Korin had ONE left... keep him busy, Vegeta, I\'m going for Gohan!', 3, { style: 'shout' });
      // the two who can still fight, in order
      const fight = m.storyFight({
        floors: [
          { f: v, at: 0.12, onFloor: () => (gs.switch = 'piccolo') },
          // the last stretch: if Krillin is nearly there, he makes a run for it
          { f: pc, at: 0.12, onFloor: () => (gs.run >= 0.75 ? (gs.sprint = true) : (gs.lost = 'held')) },
        ],
      });
      const runPath = (k) => KRILLIN_FROM.clone().lerp(new V3(gohanAt.x - 1.2, 0, gohanAt.z + 1.2), k);
      let lastPose = null;
      const hook = () => {
        if (gs.attention > 0) gs.attention--;
        const busy = gs.attention > 0;
        // Krillin moves only while Cell is looking the other way
        if (busy) gs.run = Math.min(1, gs.run + 1 / (SENZU_SECONDS * 60));
        const pos = CK.ground(b, runPath(gs.run));
        kr.setHidden(false);
        CK.place(kr, pos);
        CK.faceTo(kr, gohanAt);
        const want = busy ? 'run' : 'guard';
        if (want !== lastPose) {
          lastPose = want;
          kr.setState('scripted', { pose: want, expression: busy ? 'grit' : 'nervous' });
        }
        m.progress('senzu', Math.floor(gs.run * 100));
        // how close is he to the boy
        const d = Math.hypot(c.pos.x - gohanAt.x, c.pos.z - gohanAt.z);
        if (!busy && d < 7 && !gs.warned) {
          gs.warned = true;
          m.say('krillin', 'He\'s almost on Gohan! HIT HIM!', 2.2, { style: 'shout' });
        }
        if (d >= 9) gs.warned = false;
        // THE FOOT: standing over the boy he raises it — a second and a half to hit him off it
        if (!busy && d < CELL_REACH) {
          if (!gs.stomp) {
            c.setState('scripted', { pose: 'cl_stompUp', expression: 'wicked' });
            m.say('cell', 'Goodbye, Gohan.', 1.4, { style: 'quiet' });
          }
          gs.stomp = (gs.stomp || 0) + 1;
          if (gs.stomp > 90 && !gs.lost) gs.lost = 'reached';
        } else if (gs.stomp) {
          gs.stomp = 0;
          if (c.state === 'scripted') c.setState('free');
        }
      };
      m.tickHooks.push(hook);
      while (gs.run < 1 && !gs.lost) {
        if (gs.sprint && !gs.sprinted) {
          gs.sprinted = true;
          gs.attention = 9999;
          m.say('krillin', 'Hang on, Piccolo — I\'m almost THERE!', 2.2, { style: 'shout' });
        }
        if (gs.switch === 'piccolo' && !gs.switched) {
          gs.switched = true;
          CK.watch(v, v.pos.clone(), 'knockdown', 'hurt', c.pos);
          v.setDamage(2);
          CK.place(pc, CK.ground(b, v.pos.clone().add(new V3(2, 0, 2))));
          pc.cannotDie = true;
          CK.takeControl(b, pc);
          pc.hp = Math.max(Math.round(pc.hpMax * 0.6), pc.hp);
          pc.ki = Math.max(pc.ki, 80);
          gs.attention = 120;
          m.say('piccolo', 'Stay down, Vegeta. My turn.', 2.4);
          m.music('piccolo_theme', 4);
        }
        yield 0.1;
      }
      CK.removeHook(m, hook);
      offN();
      offD();
      fight.off();
      b.emit('markers', { list: [] });
      if (gs.lost) {
        m.failObjective('guard');
        m.fail(gs.lost === 'reached' ? 'Cell reached Gohan' : 'Nobody was left to stop him');
        yield 99;
        return;
      }
      m.complete('guard');
      m.complete('senzu');
      m.flags.piccoloFought = gs.switched;
      yield 0.4;
    },
  };

  P.senzu = {
    id: 'senzu',
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell, gh = S.gohan, v = S.vegeta, pc = S.piccolo, kr = S.krillin;
      CK.clearCombat(b);
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      c.setState('scripted', { pose: 'cl_lookSide', expression: 'shock' });
      const gohanAt = CK.onRing(b, GOHAN_AT[0], GOHAN_AT[1]);
      CK.place(kr, CK.ground(b, gohanAt.clone().add(new V3(-1, 0, 1))));
      CK.faceTo(kr, gohanAt);
      kr.setState('scripted', { pose: 'senzuFlick', expression: 'grit' });
      shot(m, { krillin: kr, gohan: gh }, { subject: 'krillin', with: 'gohan', focus: 'medium', angle: 'three' }, 2.8);
      m.say('krillin', 'Gohan! Eat this — come on, EAT IT!', 2.6, { style: 'shout' });
      yield* m.cine(2.8);
      // the bean: the arm sets, the bruises go, the eyes open
      SL.ScreenFX.flash(0.35, '#e8fff0');
      b.vfx.ring(gh.chest(), 2.4, 0x9affb0, 0.45);
      gh.setTorn(false);
      gh.setDamage(0);
      gh.hp = gh.hpMax;
      gh.ki = gh.kiMax;
      gh.setState('scripted', { pose: 'kneelGrieve', expression: 'shock' });
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'face', angle: 'three' }, 2.6);
      m.say('teen_gohan', '...Krillin? My arm...', 2.4, { style: 'quiet' });
      yield* m.cine(2.6);
      const hero = m.flags.piccoloFought ? pc : v;
      hero.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      shot(m, { hero }, { subject: 'hero', focus: 'face', angle: 'low' }, 3.2);
      if (m.flags.piccoloFought) m.say('piccolo', 'We bought you one more chance, Gohan. Don\'t waste it.', 3);
      else m.say('vegeta', 'Don\'t... thank me, brat. Finish it.', 3);
      yield* m.cine(3.2);
      // he stands on his own — nobody's voice this time
      gh.setState('scripted', { pose: 'stand', expression: 'determined' });
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'upper', angle: 'low' }, 3.4);
      m.say('teen_gohan', 'Nobody had to tell me this time. I know what Dad would say.', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      m.music('gohan_theme', 5);
      CK.toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      b.vfx.ring(CK.ground(b, gh.pos, 0.3), 14, 0xffe25a, 0.8, new V3(0, 1, 0));
      b.cameraTraumaAt(gh.chest(), 0.5);
      SL.Audio.play('transformBurst');
      gh.setState('scripted', { pose: 'powerUp', expression: 'angry' });
      shot(m, { gohan: gh, cell: c }, { subject: 'gohan', with: 'cell', focus: 'medium' }, 3.4);
      m.say('cell', 'Another bean? You only delay the inevitable!', 2.6, { style: 'shout' });
      yield* m.cine(2.8);
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'closeup', angle: 'front' }, 2.6);
      m.say('teen_gohan', 'No more holding back. It ends now.', 2.4);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  /** Gohan, two arms, against Super Perfect Cell, who heals whenever the pressure stops. */
  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell, gh = S.gohan;
      CK.prep(m);
      restore(m, 'duel');
      for (const name of ['vegeta', 'piccolo', 'krillin']) {
        const f = S[name];
        if (f && !f._gone) CK.watch(f, f.pos.clone(), name === 'krillin' ? 'idle' : 'knockdown', 'hurt', c.pos);
      }
      gh.setTorn(false);
      gh.setDamage(0);
      CK.toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      CK.place(gh, CK.onRing(b, 0, 6), Math.PI);
      CK.takeControl(b, gh);
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.8));
      gh.ki = Math.max(gh.ki, 80);
      CK.place(c, CK.onRing(b, 0, -4), 0);
      c.hp = Math.round(c.hpMax * 0.85);
      c.cannotDie = true;
      c.damageDealtMul = 0.7;
      c.damageTakenMul = 0.6; // a boss, not a sprint
      CK.cellBrain(b, c, { aggression: 0.75, defense: 0.6, ranged: 0.3, beam: 0.25, preferredRange: 3, hooks: 'boss' });
      c.target = gh;
      gh.target = c;
      c.setState('free');
      CK.goFight(m, ['gohan_theme', 6]);
      m.objective('duel', 'Bring Cell to his knees', { icon: 'fist', target: 100 });
      m.objective('press', 'Keep the pressure on — he heals when you stop', { icon: 'clock', optional: true });
      const FLOOR = 0.45;
      const gs = { lastHit: b.frame, regen: 0, floor: false };
      const offD = b.on('damage', (e) => {
        if (e.target === c && e.attacker === gh && !e.blocked) gs.lastHit = b.frame;
      });
      const fight = m.storyFight({ floors: [{ f: c, at: FLOOR, onFloor: () => (gs.floor = true) }, { f: gh, at: 0.15 }] });
      const hook = () => {
        // REGENERATION: after two and a half seconds without a clean hit, he starts putting himself back together
        const idle = b.frame - gs.lastHit;
        if (idle > 150 && c.hp < c.hpMax * 0.9 && c.alive && !gs.floor) {
          c.hp = Math.min(c.hpMax * 0.9, c.hp + (c.hpMax * 0.014) / 60);
          gs.regen++;
          if (b.frame % 12 === 0) b.vfx.sparks(c.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(-0.4, 0.6), 0.2)), 0x9affb0, 3, 3, 0.08);
          if (gs.regen === 1 || gs.regen % 600 === 0) m.say('cell', U.pick(['Did you think I\'d just stand here and bleed?', 'Every cell in my body heals, boy.']), 2.4);
        } else gs.regen = 0;
        m.progress('duel', Math.floor(U.clamp01((1 - c.hpFrac) / (1 - FLOOR)) * 100));
      };
      m.tickHooks.push(hook);
      yield () => gs.floor;
      CK.removeHook(m, hook);
      offD();
      fight.off();
      m.complete('duel');
      m.complete('press');
      yield 0.5;
    },
  };

  /** Cell goes up to take the planet with him; the clash is the player's, and the friends throw in what they have. */
  P.solar = {
    id: 'solar',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell, gh = S.gohan;
      CK.prep(m);
      restore(m, 'solar');
      for (const name of ['vegeta', 'piccolo', 'krillin']) {
        const f = S[name];
        if (f && !f._gone) CK.watch(f, f.pos.clone(), name === 'krillin' ? 'idle' : 'knockdown', 'hurt', c.pos);
      }
      gh.setTorn(false);
      CK.toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      CK.place(gh, CK.onRing(b, 0, 9), Math.PI);
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      // the rise: he goes up, and the light goes with him
      CK.placeAir(c, CK.onRing(b, 0, -12).add(new V3(0, 7, 0)), 0);
      CK.faceTo(c, gh.pos);
      c.setState('scripted', { pose: 'cl_superKameCharge', expression: 'wicked', aura: 1 });
      shot(m, { cell: c }, { subject: 'cell', focus: 'upper', angle: 'low' }, 3.6);
      m.say('cell', 'ENOUGH! If I can\'t have this planet, then NOBODY WILL!', 3.2, { style: 'shout' });
      b.cameraTraumaAt(c.chest(), 0.5);
      yield* m.cine(3.6);
      m.endShot();
      // the clash, played (the engine's BeamClash)
      CK.takeControl(b, gh);
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.5));
      gh.ki = gh.kiMax;
      gh.damageTakenMul = 0.5;
      gh.noFlight = true;
      gh.lockedSlots = { special1: true, special2: true, transform: true };
      c.untargetable = false;
      c.hp = Math.round(c.hpMax * 0.45);
      c.cannotDie = false;
      c.noRegen = true;
      c.infiniteHp = false;
      c.damageDealtMul = 0.7;
      c.specOverrides = { ultimate: { chargeMin: 100, chargeMax: 100, name: 'Kamehameha', color: 0x8ad4ff, radius: [1.5, 1.5], speed: 20, range: 80, sustain: 260, poses: { charge: 'cl_superKameCharge', fire: 'beamFire' } } };
      b.clash.maxSeconds = 40;
      const st = { cooldown: 60 };
      c.controller = {
        update() {
          const it = SL.emptyIntent();
          if (b.inputLocked || b.aiLocked) return it;
          c.target = gh;
          if (c.state === 'beamCharge') {
            it.ultHeld = true;
            return it;
          }
          if (c.state !== 'free') return it;
          if (st.cooldown > 0) {
            st.cooldown--;
            return it;
          }
          c.ki = c.kiMax;
          st.cooldown = 150;
          it.ult = true;
          it.ultHeld = true;
          return it;
        },
      };
      c.target = gh;
      gh.target = c;
      c.setState('free');
      CK.goFight(m, ['final_clash', 7]);
      m.objective('clash', 'Answer his beam — and win', { icon: 'ultimate', target: 100 });
      m.prompt('wcKame', 'ultimate', 'Kamehameha', { required: true, when: () => gh.state === 'free', always: true });
      m.prompt('wcPush', 'light', 'Push', { required: true, when: () => !!b.clash.active, always: true });
      const beats = { vegeta: false, piccolo: false, krillin: false };
      let won = false;
      const offS = b.on('clashStart', (e) => {
        if (!((e.a === gh || e.b === gh) && (e.a === c || e.b === c))) return;
        const cl = b.clash.active;
        cl.gohanBeam = cl.a.owner === gh ? cl.a : cl.b;
        cl.cellBeam = cl.a.owner === c ? cl.a : cl.b;
        cl.baseC = cl.cellBeam.power;
        cl.cellBeam.power = cl.baseC * (1.7 - (beats.vegeta ? 0.3 : 0) - (beats.piccolo ? 0.3 : 0) - (beats.krillin ? 0.3 : 0));
      });
      const offE = b.on('clashEnd', (e) => {
        if (e.winner === gh) {
          won = true;
          gh.damageDealtMul = 3.4;
          b.slowmo(0.3, 1.8);
          SL.ScreenFX.flash(0.7, '#e8f6ff');
          m.say('teen_gohan', 'THIS IS FOR ALL OF THEM!', 1.8, { style: 'shout' });
        } else if (e.winner === c) m.say('piccolo', 'Get up, Gohan! Again!', 2.2, { style: 'shout' });
      });
      // one at a time, the friends who are still breathing throw in what they have left
      const helper = (name, line, color, pose) => {
        const f = S[name];
        if (!f || f._gone) return;
        const back = c.chest().sub(gh.chest()).setY(0).normalize();
        const side = new V3(-back.z, 0, back.x).multiplyScalar(name === 'piccolo' ? -1 : 1);
        f.setHidden(false);
        CK.placeAir(f, c.pos.clone().addScaledVector(side, 8).add(new V3(0, 2, 0)));
        CK.faceTo(f, c.pos);
        f.setState('scripted', { pose, expression: 'shout' });
        const from = f.chest();
        for (let s = 0; s <= 10; s++) b.vfx.trail(from.clone().lerp(c.chest(), s / 10), color, 0.5, 0.5);
        b.vfx.explosion(c.chest(), 2.4, color, { smoke: true });
        b.sfx('explosionBig', c, { vol: 1.1 });
        b.cameraTraumaAt(c.chest(), 0.5);
        m.say(name, line, 2.4, { style: 'shout' });
        const cl = b.clash.active;
        if (cl && cl.cellBeam) cl.cellBeam.power *= 0.82;
      };
      const hook = () => {
        const cl = b.clash.active;
        if (!cl || !cl.gohanBeam) {
          m.progress('clash', won ? 100 : 0);
          return;
        }
        const p = b.clash.playerProgress();
        m.progress('clash', Math.floor(p * 100));
        if (!beats.vegeta && p >= 0.3) {
          beats.vegeta = true;
          helper('vegeta', 'Don\'t you DARE lose now, brat!', 0xffe890, 'blastR');
        }
        if (!beats.piccolo && p >= 0.5) {
          beats.piccolo = true;
          helper('piccolo', 'Special Beam Cannon!', 0xfff0a0, 'p_sbcFire');
        }
        if (!beats.krillin && p >= 0.68) {
          beats.krillin = true;
          helper('krillin', 'Take THIS, you freak!', 0xffd0e8, 'blastR');
        }
      };
      m.tickHooks.push(hook);
      yield () => !c.alive || won;
      CK.removeHook(m, hook);
      offS();
      offE();
      m.complete('clash');
      b.clash.maxSeconds = 7;
      gh.lockedSlots = {};
      gh.noFlight = false;
      m.flags.cellBeaten = true;
      yield 0.6;
    },
  };

  P.end = {
    id: 'end',
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell, gh = S.gohan, v = S.vegeta, pc = S.piccolo, kr = S.krillin;
      CK.clearCombat(b);
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      // the light goes out of the sky
      const at = c.chest();
      SL.ScreenFX.flash(0.9, '#ffffff');
      b.vfx.explosion(at, 6, 0x9ad8ff, { smoke: true });
      b.vfx.ring(at, 18, 0xffffff, 0.8);
      b.sfx('explosionHuge', c);
      b.cameraTraumaAt(at, 0.9);
      CK.gone(c);
      c.alive = false;
      yield* m.cine(1.6);
      m.music('hopeful', 1);
      CK.toForm(gh, 'base');
      gh.setRage(false);
      gh.setState('scripted', { pose: 'exhausted', expression: 'soft' });
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'wide', angle: 'high', room: 5 }, 3);
      yield* m.cine(3);
      // the ones who held the line come down to him
      const near = (f, dx, dz) => {
        if (!f || f._gone) return;
        f.setHidden(false);
        CK.place(f, CK.ground(b, gh.pos.clone().add(new V3(dx, 0, dz))));
        CK.faceTo(f, gh.pos);
      };
      near(kr, -1.6, 1.4);
      near(pc, 1.8, 1.2);
      near(v, 3.6, -1.6);
      kr.setState('scripted', { pose: 'idle', expression: 'grin' });
      pc.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
      v.setState('scripted', { pose: 'v_turnAway', expression: 'calm' });
      gh.setState('scripted', { pose: 'stand', expression: 'soft' });
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'face', angle: 'three' }, 3.4);
      m.say('teen_gohan', 'I waited for Dad\'s voice. It never came.', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      shot(m, { piccolo: pc }, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 3.4);
      m.say('piccolo', 'You didn\'t need to hear him. He was right about you — every word.', 3.2);
      yield* m.cine(3.4);
      shot(m, { krillin: kr }, { subject: 'krillin', focus: 'upper', angle: 'front' }, 2.8);
      m.say('krillin', 'Heh. Good thing I hung on to that last bean, huh?', 2.6);
      yield* m.cine(2.8);
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three', side: -1 }, 3.4);
      m.say('vegeta', 'Hmph. Next time, finish it the FIRST time.', 2.6);
      yield* m.cine(2.8);
      m.say('vegeta', '...You fought like a Saiyan, boy.', 2.4, { style: 'quiet' });
      yield* m.cine(2.6);
      shot(m, { gohan: gh }, { subject: 'gohan', focus: 'closeup', angle: 'low' }, 3);
      m.say('teen_gohan', 'Thank you. All of you.', 2.6, { style: 'quiet' });
      yield* m.cine(3);
      m.endShot();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title('WHAT IF...?', 'THEY HELD THE LINE', 'The voice never came — his friends did · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_cell',
    whatIf: true,
    branchOf: 'cell_fatherson',
    branchPoint: 'voice',
    chapter: 'WHAT IF · CHAPTER 6',
    title: 'What if Gohan lost to Cell?',
    subtitle: 'Earth · Age 767 · Alternate timeline',
    character: 'teen_gohan',
    stage: 'cellarena',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'The voice never comes. Gohan folds, and Cell walks toward him to finish it by hand. Vegeta, Piccolo and Krillin have one bean and no chance — and they go anyway.',
    rewards: ['An alternate end to the Cell Games', 'Vegeta and Piccolo hold the line'],
    setup,
    phases: [P.intro, P.guard, P.senzu, P.duel, P.solar, P.end],
  };

  SL.data.missions[def.id] = def;
})();
