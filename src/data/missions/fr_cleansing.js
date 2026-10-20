/*
 * MOVIE: FUSION REBORN (not canon) — mission 1 of 7: "The Spirit Cleansing Machine"
 * The Other World round King Yemma's Check-In Station (stage `other_world`, stage_otherworld.js).
 *
 *   OPEN     (scene fr_open)  Saike Oni dancing in his headphones while the cleansing tank fills with every
 *                             soul's evil: the colour, the strain, the lamps, the gauge, the shaking, nobody
 *                             watching — the explosion, the sludge, Janemba. The warp spreads; the crystal
 *                             closes over the station; King Yemma's warning.
 *   ARRIVE * (play)           GOKU, with Pikkon at his side, flies in from the tournament grounds across the
 *                             warped Other World. Rifts hang over the route: fly into one and the afterlife
 *                             folds you back the way you came (they flicker before they pull — learn to read
 *                             them; it is the language of the whole film).
 *   BARRIER  (play)           reach the crystal and touch it: it answers with light and does not give. Pikkon
 *                             is already there, studying it.
 *   MEET     (scene fr_meet)  the child on top of the dome; "Janemba."; Pikkon backhanded across the field;
 *                             "You really pack a wallop."
 *   AFTER                     the title
 *
 * Saved on the Movies track (def.movie): nothing here moves the canon story.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;

  const CL = {
    rifts: 5, // portals over the route
    riftRadius: 2.4,
    reach: 16, // metres from the barrier's front that count as "arrived"
    touch: 3.2, // how close to the crystal's surface a blow has to land
  };

  function setup(battle) {
    const b = battle;
    const far = FR.lm(b, 'far');
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: FR.at(b, far.x, far.z), startKi: 100 });
    const pikkon = b.spawn({ charId: 'pikkon', team: 0, pos: FR.at(b, far.x + 3, far.z + 1), startKi: 100 });
    const saike = b.spawn({ charId: 'saike_oni', team: 0, pos: FR.lm(b, 'booth'), startKi: 0 });
    const janemba = b.spawn({ charId: 'janemba', team: 1, pos: FR.lm(b, 'booth'), startKi: 100 });
    const yemma = b.spawn({ charId: 'king_yemma', team: 0, pos: FR.lm(b, 'yemma'), startKi: 0 });
    yemma.noCollide = true;
    for (const f of [pikkon, saike, janemba, yemma]) K.watcher(f, 'idle', 'calm');
    K.watcher(saike, 'so_dance', 'grin');
    K.watcher(yemma, 'idle', 'serious');
    yemma.yaw = yemma.prevYaw = 0;
    saike.yaw = saike.prevYaw = 0;
    janemba.setHidden(true);
    FR.halo(b, goku);
    FR.halo(b, pikkon);
    b.story = { goku, pikkon, saike, janemba, yemma, rifts: [] };
  }

  /** Janemba on top of the crystal dome, sitting, legs swinging. */
  function seatJanemba(b) {
    const S = b.story, B = b.stage.barrier;
    const top = B.center.clone().add(new V3(0, B.radius * 0.98, 0));
    S.janemba.setHidden(false);
    S.janemba.setPosition(top);
    S.janemba.grounded = false;
    S.janemba.noCollide = true;
    S.janemba.yaw = S.janemba.prevYaw = 0;
    K.watcher(S.janemba, 'jb_sit', 'grin');
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      for (const f of [S.goku, S.pikkon]) f.setHidden(true);
      yield* SL.Cinema.play(m, 'fr_open');
    },
  };

  P.arrive = {
    id: 'arrive',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      S.saike.setHidden(true);
      seatJanemba(b);
      const far = FR.lm(b, 'far'), front = FR.lm(b, 'barrierFront');
      for (const f of [S.goku, S.pikkon]) f.setHidden(false);
      K.hover(b, S.goku, far, 6);
      K.hover(b, S.pikkon, far.clone().add(new V3(3, 0, 1)), 6);
      K.faceTo(S.goku, front);
      K.faceTo(S.pikkon, front);
      S.goku.setState('free');
      S.goku.target = null;
      b.switchPlayer(S.goku, { force: true });
      S.pikkon.controller = K.scripted();
      // the rifts: hanging over the line from the tournament grounds to the station, a little off it
      for (const r of S.rifts) if (r.portal) r.portal.close();
      S.rifts = [];
      for (let i = 0; i < CL.rifts; i++) {
        const k = (i + 1) / (CL.rifts + 1);
        const p = far.clone().lerp(front, k);
        const side = new V3(front.z - far.z, 0, far.x - front.x).normalize().multiplyScalar(i % 2 ? 5 : -5);
        p.add(side);
        p.y = FR.at(b, p.x, p.z).y + 5 + (i % 3) * 2.5;
        const back = far.clone().lerp(front, Math.max(0, k - 0.18));
        back.y = p.y;
        S.rifts.push({ at: p, back, portal: SL.Dimension.portal(b, p, front.clone().sub(far).setY(0).normalize(), { radius: CL.riftRadius, open: 20, sfx: false }), cool: 0 });
      }
      m.music('janemba_theme', 1);
      m.title(FR.CHAPTER, 'THE CHECK-IN STATION', 'Fly to King Yemma\'s station', 3.2);
      m.objective('reach', 'Reach the Check-In Station', { icon: 'run' });
      m.objective('clean', 'Do not let the rifts fold you back', { icon: 'guard', optional: true });
      b.emit('markers', { list: [{ obj: { pos: front, alive: true }, icon: 'run' }] });
      m.prompt('frFly', 'boost', 'Fly fast', { always: true, until: () => S.goku.pos.distanceTo(far) > 30 });
      m.say('pikkon', 'Whatever happened, it came from the Check-In Station. Stay close, Goku.', 3.2);
      let folds = 0;
      const hook = () => {
        const g = S.goku;
        // Pikkon keeps pace at Goku's right shoulder
        const fwd = g.forward.clone().setY(0).normalize();
        const right = new V3(fwd.z, 0, -fwd.x);
        const want = g.pos.clone().addScaledVector(right, -3.2).addScaledVector(fwd, -1.2);
        want.y = Math.max(want.y, FR.at(b, want.x, want.z).y + 0.5);
        S.pikkon.setPosition(S.pikkon.pos.clone().lerp(want, 0.08));
        S.pikkon.grounded = false;
        S.pikkon.yaw = S.pikkon.prevYaw = g.yaw;
        const moving = g.vel.length() > 6;
        S.pikkon.setState('scripted', { pose: moving ? 'flyForward' : 'flyIdle', expression: 'serious' });
        // the rifts flicker as he nears them, and fold him back if he flies in
        for (const r of S.rifts) {
          if (!r.portal || !r.portal.alive) continue;
          r.cool = Math.max(0, r.cool - 1);
          const d = g.chest().distanceTo(r.at);
          if (d < 9 && b.frame % 10 === 0) b.vfx.streamInward(r.at, CL.riftRadius * 1.6, SL.Dimension.COLORS.rim, 3, 0.12, 0.3);
          if (d < CL.riftRadius + 0.4 && !r.cool && !b.inputLocked) {
            r.cool = 90;
            folds++;
            m.failObjective('clean');
            SL.Dimension.portal(b, r.back.clone(), fwd, { radius: 1.6, life: 30, open: 4 });
            g.setPosition(r.back.clone());
            g.vel.set(0, 0, 0);
            b.vfx.flash(g.chest(), 2.4, SL.Dimension.COLORS.inner, 0.2, SL.Toon.tex.glow);
            b.camera.addTrauma(0.3);
            b.emit('riftFold', { fighter: g });
            if (folds === 1) m.say('pikkon', 'Space itself is folding. Go round those things!', 2.8, { style: 'shout' });
          }
        }
      };
      m.tickHooks.push(hook);
      m.lock(false);
      b.aiLocked = true;
      yield () => S.goku.pos.distanceTo(front) < CL.reach;
      K.unhook(m, hook);
      m.flags.folds = folds;
      m.complete('reach');
      if (!folds) m.complete('clean');
      b.emit('markers', { list: [] });
      for (const r of S.rifts) if (r.portal) r.portal.close();
    },
  };

  P.barrier = {
    id: 'barrier',
    run: function* (m) {
      const b = m.battle, S = b.story, B = b.stage.barrier;
      // Pikkon has gone ahead and stands at the crystal with a hand flat on it
      const front = FR.lm(b, 'barrierFront');
      const toB = B.center.clone().sub(front).setY(0).normalize();
      const pk = front.clone().add(new V3(toB.z, 0, -toB.x).multiplyScalar(4)).addScaledVector(toB, 0.4);
      K.place(S.pikkon, FR.at(b, pk.x, pk.z), 0);
      K.faceTo(S.pikkon, B.center);
      S.pikkon.setState('scripted', { pose: 'pk_study', expression: 'serious' });
      m.objective('touch', 'Inspect the barrier: strike it', { icon: 'fist' });
      m.prompt('frTouch', 'light', 'Strike the barrier', { required: true, when: () => S.goku.pos.distanceTo(B.center) - B.radius < CL.touch + 3, until: () => !!m.flags.touched });
      b.emit('markers', { list: [{ obj: { pos: B.center.clone().addScaledVector(toB, -B.radius), alive: true }, icon: 'fist' }] });
      let seen = null, t = 0;
      const hook = () => {
        t += 1 / 60;
        const g = S.goku;
        if (b.frame % 90 === 0) b.stage.barrierFlash(S.pikkon.handPos('R'), false);
        if (g.state === 'attack' && g.sd !== seen && g.stateFrame >= (g.sd.startup || 0)) {
          if (g.chest().distanceTo(B.center) - B.radius < CL.touch) {
            seen = g.sd;
            b.stage.barrierFlash(g.chest(), true);
            b.sfx('swordClang', g, { pitch: 0.5, vol: 0.9 });
            g.vel.addScaledVector(B.center.clone().sub(g.pos).normalize(), -10);
            m.flags.touched = (m.flags.touched || 0) + 1;
          }
        }
      };
      m.tickHooks.push(hook);
      yield () => m.flags.touched || t > 40;
      K.unhook(m, hook);
      m.complete('touch');
      b.emit('markers', { list: [] });
      m.lock(true);
      K.clearCombat(b);
      m.say('goku', 'It\'s like hitting a mountain made of glass...', 2.6);
      yield* m.cine(2.6);
    },
  };

  P.meet = {
    id: 'meet',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      S.saike.setHidden(true);
      seatJanemba(b);
      const front = FR.lm(b, 'barrierFront');
      for (const f of [S.goku, S.pikkon]) {
        f.setHidden(false);
        f.controller = K.scripted();
      }
      K.place(S.goku, FR.at(b, front.x - 1.6, front.z + 4), Math.PI);
      K.place(S.pikkon, FR.at(b, front.x + 1.8, front.z + 3.2), Math.PI);
      for (const f of [S.goku, S.pikkon]) K.faceTo(f, b.stage.barrier.center);
      S.goku.setState('scripted', { pose: 'idle', expression: 'calm' });
      S.pikkon.setState('scripted', { pose: 'pk_folded', expression: 'serious' });
      yield* SL.Cinema.play(m, 'fr_meet');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(FR.CHAPTER, 'THE SPIRIT CLEANSING MACHINE', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'fr_cleansing',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'The Spirit Cleansing Machine',
    subtitle: 'The Other World · not canon',
    character: 'goku',
    stage: 'other_world',
    parTime: 300,
    lockForms: FR.LOCKS,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'A young ogre in headphones was supposed to be watching a tank full of evil. He was not. Fly with Pikkon to the Check-In Station and see what came out of it.',
    rewards: ['Movie: Fusion Reborn'],
    setup,
    phases: [P.open, P.arrive, P.barrier, P.meet, P.after],
  };

  SL.data.frCleansing = { CL };
  SL.data.missions[def.id] = def;
})();
