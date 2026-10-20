/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 9: "A New Beginning" (the lava wasteland; Vampa)
 *
 *   SHIP *     (staged + cue)    Cheelai and Lemo's little ship lifting off — and Golden Frieza, battered, raising
 *                                one finger at it. STOP HIM (Light): Gogeta is beside him, his hand round Frieza's
 *                                wrist, a cold look. Frieza lowers his hand and leaves. The ship goes up into the red
 *                                sky; the fusion runs out — Goku and Vegeta again.
 *   LATER      (title)           "Some days later" — Vampa.
 *   VISIT *    (explore + cue)   Goku arrives by Instant Transmission on the grit of Vampa: find Broly, Cheelai and
 *                                Lemo by the cave; throw the capsule (Light): a Capsule Corporation house, food,
 *                                supplies.
 *   GOODBYE    (scene)           the four of them by the house and Ba; Goku will come back and train with him;
 *                                two fingers to his brow — "Wait! What's your name?" — the grin over his shoulder:
 *                                "Son Goku. But you, Broly — call me Kakarot." Pop. Broly's small smile; the green sky.
 *   CREDITS                      the film's last cards. THE END.
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project, following the owner's
 * beat text.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;

  const SPOT = { frieza: [-30, 30], ship: [-40, 44], gogeta: [-20, 18], fzShip: [-50, 56] };

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const gogeta = b.spawn({ charId: 'gogeta', player: true, team: 0, pos: at('gogeta'), startKi: 100 });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: at('gogeta'), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at('gogeta'), startKi: 100 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 0, pos: at('ship'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 0, pos: at('ship'), startKi: 0 });
    const broly = b.spawn({ charId: 'broly', team: 0, pos: BK.at(b, 60, 60), startKi: 0 });
    BK.give(frieza, 'golden');
    K.toForm(frieza, 'golden');
    BK.give(gogeta, 'blue');
    K.toForm(gogeta, 'blue');
    K.watcher(frieza, 'idle', 'angry');
    K.watcher(goku, 'idle', 'calm');
    K.watcher(vegeta, 'armsCrossed', 'serious');
    K.watcher(cheelai, 'ch_idle', 'warm');
    K.watcher(lemo, 'le_idle', 'calm');
    K.watcher(broly, 'br_idle', 'calm');
    for (const f of [goku, vegeta, broly, cheelai, lemo]) f.setHidden(true);
    for (const f of [gogeta, goku]) f.cannotDie = true;
    // the collar is gone: he is nobody's weapon now
    const P = broly.model && broly.model.props;
    if (P) for (const k of ['collar', 'collarLamp']) if (P[k]) P[k].visible = false;
    b.story = { gogeta, goku, vegeta, frieza, cheelai, lemo, broly, goal: null };
  }

  const P = {};

  P.ship = {
    id: 'ship',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gg = S.gogeta, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      BK.lavaReact(m);
      gg.controller = K.scripted();
      fz.controller = K.scripted();
      const shipAt = BK.at(b, SPOT.ship[0], SPOT.ship[1]);
      if (!S.ship) S.ship = BK.ship(m, shipAt, Math.atan2(-SPOT.ship[0], -SPOT.ship[1]));
      const ship = S.ship;
      ship.lift(0);
      K.place(fz, BK.at(b, SPOT.frieza[0], SPOT.frieza[1]), 0);
      K.faceTo(fz, shipAt);
      if (fz.model && fz.model.setBattered) fz.model.setBattered(true);
      gg.setHidden(true);
      m.title(BK.CHAPTER, 'A NEW BEGINNING', 'The lava wasteland · the end of it', 3);
      m.music('ominous', 1);
      // the little ship going up — and the finger coming up after it
      let lift = 0;
      const rise = () => {
        if (b.disposed || !m.flags.rising) return false;
        lift = Math.min(0.35, lift + 1 / 600);
        ship.lift(lift);
        return true;
      };
      m.flags.rising = true;
      b.onTick(rise);
      m.shot((t, out) => {
        out.pos.copy(fz.chest()).addScaledVector(fz.forward, -2.4).add(new V3(0.8, 0.5, 0));
        out.look.copy(ship.group.position).add(new V3(0, 2, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(1.6);
      fz.setState('scripted', { pose: 'fz_aimW', expression: 'angry' });
      SL.Cinema.shotOn(m, { frieza: fz }, { subject: 'frieza', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Traitors. Nobody steals from me and flies away.', 2.6);
      yield* m.cine(1.8);
      m.objective('stop', 'Stop him', { icon: 'fist' });
      const r = yield* m.cue('light', 'Stop him! (Light)', { auto: 2.6, slow: 0.4 });
      m.qteParts.push(r.pressed ? 1 : 0.6);
      m.complete('stop');
      // he is just there, his hand round Frieza's wrist
      BK.appear(b, gg, BK.at(b, fz.pos.x + fz.forward.x * 0.9 - fz.forward.z * 0.7, fz.pos.z + fz.forward.z * 0.9 + fz.forward.x * 0.7), 0);
      K.faceTo(gg, fz.pos);
      gg.untargetable = gg.intangible = true;
      gg.setState('scripted', { pose: 'gg_catchBlind', expression: 'cold' });
      fz.setState('scripted', { pose: 'fz_aim', expression: 'shock' });
      b.sfx('punchLight', fz, { pitch: 0.6 });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'closeup', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('gogeta', 'Don\'t.', 1.4);
      yield* m.cine(1.6);
      SL.Cinema.shotOn(m, { frieza: fz }, { subject: 'frieza', focus: 'closeup', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', '...Hmph. Very well. I have seen enough for one day.', 3);
      yield* m.cine(3);
      // Frieza withdraws: up and away to his ship
      fz.setState('scripted', { pose: 'flyUp', expression: 'cold' });
      const f0 = fz.pos.clone(), f1 = BK.at(b, SPOT.fzShip[0], SPOT.fzShip[1], 40);
      let n = 0;
      m.shot((t, out) => {
        out.pos.copy(gg.chest()).addScaledVector(gg.forward, -2).add(new V3(0.6, 0.4, 0));
        out.look.copy(fz.chest());
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield () => {
        n++;
        const k = Math.min(1, n / 70);
        fz.setPosition(f0.clone().lerp(f1, k * k));
        fz.grounded = false;
        if (n % 3 === 0) b.vfx.trail(fz.chest(), 0xffd23a, 0.4, 0.4);
        return k >= 1 || b.skipRequested;
      };
      fz.setHidden(true);
      // the ship goes on up into the red sky
      m.flags.rising = false;
      let up = lift;
      const away = () => {
        if (b.disposed || up >= 1) return false;
        up = Math.min(1, up + 1 / 120);
        ship.lift(up);
        return true;
      };
      b.onTick(away);
      gg.setState('scripted', { pose: 'gg_coldStand', expression: 'calm' });
      m.shot((t, out) => {
        out.pos.copy(gg.pos).addScaledVector(gg.forward, 3).add(new V3(0.5, 0.3, 0));
        out.look.copy(ship.group.position);
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.music('farewell', 1);
      yield* m.cine(2.2);
      // the fusion runs out
      const at = gg.pos.clone(), sd = new V3(gg.forward.z, 0, -gg.forward.x);
      b.vfx.flash(gg.chest(), 3, 0xffffff, 0.35, SL.Toon.tex.glow);
      b.sfx('capsulePop', gg, { pitch: 0.8 });
      gg.setHidden(true);
      for (const [f, s] of [[S.goku, 1], [S.vegeta, -1]]) {
        f.setHidden(false);
        K.place(f, BK.at(b, at.x + sd.x * s * 0.9, at.z + sd.z * s * 0.9), gg.yaw);
        f.yaw = f.prevYaw = gg.yaw;
      }
      S.goku.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
      S.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'serious' });
      yield* SL.Cinema.play(m, 'bb_ep_defuse');
    },
  };

  P.later = {
    id: 'later',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1);
      yield* m.cine(1.1);
      for (const f of [S.gogeta, S.vegeta, S.frieza]) f.setHidden(true);
      if (S.ship) S.ship.dispose();
      S.ship = null;
      b.changeStage('vampa');
      m.endShot();
      m.title('', 'SOME DAYS LATER', 'Vampa', 2.6);
      yield* m.cine(2.8);
    },
  };

  /** Vampa, the camp by the cave: Broly (no collar), Cheelai, Lemo, Ba, and the place the house will stand. */
  function camp(m) {
    const b = m.battle, S = b.story, br = S.broly;
    if (b.stage.def.id !== 'vampa') {
      b.changeStage('vampa');
      m.endShot();
    }
    for (const f of [S.gogeta, S.vegeta, S.frieza]) f.setHidden(true);
    const c = b.stage.landmarks.caveMouth.clone();
    const at = (dx, dz) => BK.at(b, c.x + dx, c.z + dz);
    for (const f of [br, S.cheelai, S.lemo]) {
      f.setHidden(false);
      f.untargetable = f.intangible = true;
    }
    K.place(br, at(4, -2), 0);
    K.place(S.cheelai, at(1.5, -3.5), 0);
    K.place(S.lemo, at(6, -4.5), 0);
    if (!S.ba) S.ba = BK.ba(m, at(14, 6), 0);
    if (!S.house) S.house = BK.capsuleHouse(m, at(-2, -11), Math.atan2(2, 11));
    return { camp: c, at };
  }

  P.visit = {
    id: 'visit',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const { camp: c, at } = camp(m);
      // Goku arrives out of nowhere, out on the grit
      const arrive = BK.at(b, c.x + 40, c.z - 34);
      g.setHidden(false);
      g.untargetable = g.intangible = false;
      if (g.formIndex !== 0) g.applyForm(0);
      BK.appear(b, g, arrive, Math.atan2(c.x - arrive.x, c.z - arrive.z));
      for (const f of [br, S.cheelai, S.lemo]) K.faceTo(f, g.pos);
      br.setState('scripted', { pose: 'br_idle', expression: 'calm' });
      S.cheelai.setState('scripted', { pose: 'ch_idle', expression: 'shock' });
      S.lemo.setState('scripted', { pose: 'le_idle', expression: 'calm' });
      b.switchPlayer(g, { force: true, quiet: true });
      g.setState('free');
      m.music('vampa', 1);
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'full', angle: 'three' }, 2, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Whew — what a place. Now, where\'d they go...?', 2.4);
      yield* m.cine(2);
      m.endShot();
      // find them
      const goal = at(2, -6);
      S.goal = goal;
      m.objective('find', 'Find Broly', { icon: 'run' });
      b.emit('markers', { list: [{ obj: { pos: goal, alive: true }, icon: 'run' }] });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      yield () => {
        if (!b.inputLocked) t += 1 / 60;
        // nobody is lost: after a long wander he is walked the rest of the way
        if (t > 90) K.place(g, goal.clone(), g.yaw);
        return g.pos.distanceTo(goal) < 6 || m.state !== 'running';
      };
      S.goal = null;
      b.emit('markers', { list: [] });
      if (m.state !== 'running') return;
      m.complete('find');
      m.lock(true);
      K.clearCombat(b);
      g.controller = K.scripted();
      K.faceTo(g, br.pos);
      g.setState('scripted', { pose: 'g_handsHips', expression: 'grin' });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Hey! I brought you some stuff — Bulma packed it. Watch this!', 2.8);
      yield* m.cine(2.2);
      // the capsule
      m.objective('capsule', 'Throw the capsule', { icon: 'target' });
      g.setState('scripted', { pose: 'throwWind', expression: 'grin' });
      const rc = yield* m.cue('light', 'Throw the capsule (Light)', { auto: 3, slow: 0.6 });
      m.qteParts.push(rc.pressed ? 1 : 0.6);
      g.setState('scripted', { pose: 'throwRelease', expression: 'grin' });
      b.sfx('swing', g, { pitch: 1.3 });
      yield* m.cine(0.4);
      S.house.pop();
      m.complete('capsule');
      m.shot((tt, out) => {
        const h = S.house.group.position;
        out.pos.copy(h).add(new V3(10, 3.6, 9));
        out.look.copy(h).add(new V3(1.5, 1.6, 0));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      S.cheelai.setState('scripted', { pose: 'ch_shock', expression: 'shock' });
      m.say('cheelai', 'A house?! Out of THAT?!', 2);
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  P.goodbye = {
    id: 'goodbye',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // started here directly: the camp first
      if (b.stage.def.id !== 'vampa' || !S.house) {
        camp(m);
        g.setHidden(false);
        if (g.formIndex !== 0) g.applyForm(0);
      }
      g.controller = K.scripted();
      if (S.house && !S.house.group.visible) S.house.pop();
      // all of them by the house, Ba behind them
      const c = br.pos.clone();
      K.place(g, BK.at(b, c.x + br.forward.x * 3.2, c.z + br.forward.z * 3.2), 0);
      K.faceTo(g, br.pos);
      for (const f of [br, S.cheelai, S.lemo]) K.faceTo(f, g.pos);
      yield* SL.Cinema.play(m, 'bb_ep_goodbye');
    },
  };

  P.credits = {
    id: 'credits',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.6);
      // the film's end credits have their own song in the soundtrack PDF (p.97–98, "Blizzard"): an original dance-rock
      // stand-in, at full strength for the cards
      m.music('blizzard_credits', 3);
      yield* m.cine(1.8);
      yield* BK.credits(m, [
        ['', 'DRAGON BALL SUPER: BROLY', 'Saiyan Legacy · Movie 2', 3.6],
        ['', 'An unofficial fan project', 'Based on the film Dragon Ball Super: Broly (2018), from the work of Akira Toriyama', 4],
        ['', 'Every part of the film', 'can be replayed from the Movies screen', 3.4],
        ['MOVIE 2', 'THE END', 'Thank you for playing', 3.6],
      ]);
      b.skipRequested = false;
    },
  };

  const def = {
    id: 'bb_epilogue',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'A New Beginning',
    subtitle: 'Part 9 · The lava wasteland → Vampa',
    character: 'goku',
    stage: 'broly_lava',
    parTime: 300,
    lockForms: BK.LOCKS,
    qteLabel: 'The goodbye',
    rules: { allowTransform: false, allowUltimates: false },
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, gogeta: { outfit: 'gogeta_broly' } },
    blurb: 'Frieza leaves with nothing. A few days later, on the dead planet Broly grew up on, a Saiyan from Earth turns up with a house in his pocket.',
    rewards: ['Movie: A New Beginning', 'Movie 2 complete'],
    setup,
    phases: [P.ship, P.later, P.visit, P.goodbye, P.credits],
  };

  SL.data.missions[def.id] = def;
})();
