/*
 * MOVIE: FUSION REBORN (not canon) — mission 6 of 7: "Veku"
 *
 *   DANCE *   (rhythm)          THE FIRST FUSION DANCE, IN MID-AIR UNDER FIRE (the owner's beat sheet): out from
 *                               behind the rock, Super Janemba overhead cutting the air and raining needles, they
 *                               rush it. Played as Goku (Light on every beat — the steps of
 *                               SL.data.fusionDance): matching stances, the side steps, arms out, knees
 *                               mirrored, FU-SION-HA. And on the last beat the lens drops to their hands in
 *                               slow motion: Goku's index finger straight — Vegeta's bent. Whatever you
 *                               pressed, it is already wrong.
 *   BIRTH     (scene)           the light in the air; something drops out of it and bounces: VEKU
 *   SURVIVE * (play)            THIRTY MINUTES (75 seconds of play, the HUD ring and clock show the story's
 *                               time): play Veku and stay alive. He cannot fight — Dodge is a big bouncing hop
 *                               in a direction even he cannot predict (invulnerable in the air), a fast landing
 *                               may trip him, and there is one Panic Puff. Super Janemba gets worse every ten
 *                               minutes: sword swings, then dimensional slashes, then the claw through a portal
 *                               and the Phantom Shift. Half-way, the Kais are watching.
 *   TIMEUP    (scene)           the last seconds: Janemba walks the blimp down; Veku runs, trips, ends on his
 *                               back with the sword going up over him — and the fusion runs out under the blade:
 *                               Goku and Vegeta spring apart, it comes down between them, they dive behind the
 *                               rock. "You mean we turned into that blimp because I bent one lousy finger?!" —
 *                               and neither of them can take him alone: one more dance, done right, while
 *                               Janemba hunts for them over the open ground.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;

  const VK = { beat: 0.82, window: 0.2, perfect: 0.075, survive: 75, kaisAt: 0.5, stages: [0.33, 0.66], dealt: [0.23, 0.3, 0.36] };
  // Vegeta's last step with the finger bent (both hands closed where they should point)
  SL.data.poses.fd_haBent = Object.assign({}, SL.data.poses.fd_ha, { hands: ['fist', 'fist'] });
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  function setup(battle) {
    const b = battle;
    FR.warped(b);
    const hide = FR.lm(b, 'spikeBehind');
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: FR.at(b, hide.x + 1.7, hide.z), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: FR.at(b, hide.x - 1.7, hide.z), startKi: 100 });
    const sj = b.spawn({ charId: 'super_janemba', team: 1, pos: FR.at(b, hide.x + 20, hide.z + 20), startKi: 100 });
    K.watcher(vegeta, 'armsCrossed', 'angry');
    K.watcher(sj, 'sj_idle', 'wicked');
    sj.cannotDie = true;
    sj.setHidden(true);
    const kais = {};
    for (const id of ['king_kai', 'south_kai', 'west_kai', 'east_kai', 'grand_kai']) {
      kais[id] = b.spawn({ charId: id, team: 0, pos: FR.at(b, -60 - Object.keys(kais).length * 2, -60), startKi: 0 });
      K.watcher(kais[id], 'idle', 'calm');
      kais[id].setHidden(true);
    }
    FR.halo(b, goku);
    FR.halo(b, vegeta);
    b.story = Object.assign({ goku, vegeta, sj, veku: null, fusion: null }, kais);
  }

  /** The two of them three paces apart, side by side, facing the lens — in the air over the rock's lee (air: metres). */
  const AIR = 5;
  function lineUp(b, air = AIR) {
    const S = b.story, hide = FR.lm(b, 'spikeBehind');
    const at = (dx) => FR.at(b, hide.x + dx, hide.z).add(new V3(0, air, 0));
    K.place(S.goku, at(-1.7), Math.PI);
    K.place(S.vegeta, at(1.7), Math.PI);
    for (const f of [S.goku, S.vegeta]) {
      f.setHidden(false);
      f.intangible = true;
      f.untargetable = true;
      f.controller = K.scripted();
      f.cannotDie = false;
      f.setState('scripted', { pose: f === S.goku ? 'fd_stepBR' : 'fd_stepB', expression: f === S.goku ? 'grin' : 'angry' });
      f.yaw = f.prevYaw = Math.PI;
    }
    return { at };
  }

  const P = {};

  P.dance = {
    id: 'dance',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      const { at } = lineUp(b);
      b.switchPlayer(S.goku, { force: true });
      // Janemba overhead, cutting the empty air: every cut rains needles past them
      const sj = S.sj, hide = FR.lm(b, 'spikeBehind');
      sj.setHidden(false);
      sj.controller = K.scripted();
      if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
      K.hover(b, sj, hide.clone().add(new V3(5, 0, 6)), AIR + 6);
      K.faceTo(sj, at(0));
      let fire = 0;
      const storm = () => {
        fire++;
        if (fire % 48 === 12) sj.setState('scripted', { pose: (fire / 48) % 2 < 1 ? 'sj_slashW' : 'sj_backW', expression: 'wicked', speed: 18 });
        if (fire % 48 === 30) {
          sj.setState('scripted', { pose: (fire / 48) % 2 < 1 ? 'sj_slash' : 'sj_back', expression: 'wicked', speed: 40 });
          b.sfx('swordSlash', sj, { vol: 0.7 });
          FR.needles(b, sj.chest(), FR.at(b, hide.x, hide.z), { count: 10, spread: 4.5 });
          b.cameraTraumaAt(at(0), 0.12);
        }
      };
      m.tickHooks.push(storm);
      m.onDispose(() => K.unhook(m, storm));
      m.title(FR.CHAPTER, 'THE FUSION DANCE', 'In mid-air, under fire — Light on every beat', 3);
      m.music('fusion_theme', 1);
      m.objective('dance', 'The Fusion Dance: press Light on every beat', { icon: 'transform' });
      const STEPS = SL.data.fusionDance.STEPS;
      m.shot((t, out, el) => {
        const mid = S.goku.chest().lerp(S.vegeta.chest(), 0.5);
        out.pos.set(mid.x + Math.sin(el * 0.08) * 0.5, mid.y + 0.15, mid.z - 5);
        out.look.copy(mid).add(new V3(0, -0.05, 0));
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('vegeta', 'If anybody ever finds out about this, Kakarot...', 2.4, { style: 'shout' });
      yield* m.cine(1.4);
      const res = yield* m.rhythm(STEPS.map((s) => ({ key: 'light', label: s.label })), {
        beat: VK.beat, window: VK.window, perfect: VK.perfect, lead: 1,
        onBeat: (i) => {
          const st = STEPS[i];
          const ha = st.id === 'ha';
          S.goku.setState('scripted', { pose: st.pose + 'R', expression: ha ? 'shout' : 'grin', speed: 18 });
          S.vegeta.setState('scripted', { pose: ha ? 'fd_haBent' : st.pose, expression: ha ? 'shout' : 'angry', speed: 18 });
          // a pulse of light on both at every matched step: they are in sync, almost
          for (const f of [S.goku, S.vegeta]) b.vfx.ring(f.chest(), 1.4, 0xfff0b0, 0.25);
          if (st.id.startsWith('step')) {
            const k = Number(st.id.slice(4));
            const gap = U.lerp(1.7, 0.55, k / 3);
            K.place(S.goku, at(-gap), Math.PI);
            K.place(S.vegeta, at(gap), Math.PI);
          }
          if (st.call) {
            m.say('goku', st.call, 0.8, { style: 'shout' });
            b.sfx('swing', S.goku, { pitch: 1.1, vol: 0.7 });
          }
        },
      });
      m.flags.danceScore = Math.round(res.score * 100) / 100;
      m.qteParts.push(res.score);
      m.complete('dance');
      // the finger: down to their hands in slow motion — straight, and bent
      const gh = S.goku.handPos('L').lerp(S.goku.handPos('R'), 0.5), vh = S.vegeta.handPos('L').lerp(S.vegeta.handPos('R'), 0.5);
      const mid = gh.clone().lerp(vh, 0.5);
      m.shot((t, out, el) => {
        out.pos.set(mid.x + 0.25, mid.y + 0.15, mid.z - 1.5 + el * 0.12);
        out.look.copy(mid);
        out.fov = 34;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      b.slowmo(0.25, 1.8);
      b.sfx('heartbeat', S.vegeta, { vol: 0.8 });
      b.vfx.flash(vh, 0.6, 0xff6a6a, 0.6, SL.Toon.tex.glow);
      m.say('king_kai', 'Wait— Vegeta, your FINGER—!', 1.8, { style: 'shout' });
      yield* m.cine(1.9);
      K.unhook(m, storm);
      m.endShot();
    },
  };

  P.birth = {
    id: 'birth',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      if (!S.veku) {
        lineUp(b);
        const mid = S.goku.pos.clone().lerp(S.vegeta.pos, 0.5);
        b.vfx.flash(mid.clone().add(new V3(0, 0.9, 0)), 5, 0xffffff, 0.6, SL.Toon.tex.glow);
        b.vfx.ring(mid.clone().add(new V3(0, 0.9, 0)), 7, 0xfff4d8, 0.7);
        SL.ScreenFX.flash(0.6, '#fff0d8');
        b.sfx('transformBurst', S.vegeta, { pitch: 1.1 });
        for (const f of [S.goku, S.vegeta]) f.cannotDie = false;
        const h = SL.Fusion.fuse(b, S.goku, S.vegeta, 'veku', { silent: true, hpFrac: 1 });
        S.fusion = h;
        S.veku = h.fused;
        S.veku.controller = K.scripted();
        S.veku.cannotDie = false;
        K.faceTo(S.veku, S.goku.pos.clone().add(new V3(10, 0, 10)));
        b.emit('fusionDance', { id: 'veku', fused: S.veku });
        // something round drops out of the light and bounces on the jellybean ground
        const vk = S.veku, top = vk.pos.clone(), floor = FR.at(b, top.x, top.z);
        vk.setState('scripted', { pose: 'vk_stumble', expression: 'shock', speed: 10 });
        const open = FR.lm(b, 'spikeBehind').sub(FR.lm(b, 'spike')).setY(0).normalize();
        m.shot((t, out) => {
          out.pos.copy(floor).addScaledVector(open, 6.5).add(new V3(0, 2.2, 0));
          out.look.copy(vk.pos).add(new V3(0, 0.4, 0));
          out.fov = 50;
        }, 999, { hold: true, cut: true, blendIn: 0 });
        let fallN = 0;
        const fall = () => {
          fallN++;
          const k = Math.min(1, fallN / 32);
          const p = top.clone().lerp(floor, k * k);
          if (fallN > 32) p.y = floor.y + Math.sin(Math.min(1, (fallN - 32) / 18) * Math.PI) * 0.8;
          vk.setPosition(p);
          if (fallN === 32) {
            b.sfx('boing', vk, { pitch: 0.8 });
            b.vfx.dust(floor.clone(), 1.6, 12, 0xffd8f0);
            b.cameraTraumaAt(floor, 0.3);
          }
        };
        m.tickHooks.push(fall);
        yield* m.cine(1.2);
        K.unhook(m, fall);
        K.place(vk, floor, vk.yaw);
        m.endShot();
      }
      // Janemba finds them
      const sj = S.sj;
      sj.setHidden(false);
      K.place(sj, FR.at(b, S.veku.pos.x + 5, S.veku.pos.z + 5), 0);
      K.faceTo(sj, S.veku.pos);
      K.faceTo(S.veku, sj.pos);
      yield* SL.Cinema.play(m, 'fr_veku_birth');
    },
  };

  /** Half-way: the Kais are watching from the other side of the Other World. */
  function* kaisCut(m) {
    const b = m.battle, S = b.story;
    const keep = new Map();
    for (const f of b.fighters) keep.set(f, { pos: f.pos.clone(), hidden: f.hidden, grounded: f.grounded });
    m.lock(true);
    K.clearCombat(b);
    m.fade('black', 0.4);
    yield* m.cine(0.45);
    for (const f of [S.veku, S.sj]) f.setHidden(true);
    b.changeStage('kingkai');
    m.endShot();
    const ids = ['king_kai', 'south_kai', 'west_kai', 'east_kai', 'grand_kai'];
    ids.forEach((id, i) => {
      const a = (i - 2) * 0.42;
      const f = S[id];
      K.place(f, FR.at(b, Math.sin(a) * 4, -Math.cos(a) * 4 + 8), 0);
      K.faceTo(f, FR.at(b, 0, 30));
      f.setHidden(false);
    });
    m.fade('clear', 0.5);
    yield* SL.Cinema.play(m, 'fr_kais');
    m.fade('black', 0.4);
    yield* m.cine(0.45);
    for (const id of ids) S[id].setHidden(true);
    b.changeStage('other_world');
    FR.warped(b);
    m.endShot();
    for (const [f, k] of keep) {
      if (ids.includes(f.def.id)) continue;
      f.setPosition(k.pos);
      f.prevPos.copy(k.pos);
      f.grounded = k.grounded;
      f.setHidden(k.hidden);
    }
    m.fade('clear', 0.5);
  }

  P.survive = {
    id: 'survive',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, sj = S.sj;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      if (!S.veku || !S.veku.alive) {
        lineUp(b, 0); // a checkpoint start: on the ground
        for (const f of [S.goku, S.vegeta]) f.cannotDie = false;
        const h = SL.Fusion.fuse(b, S.goku, S.vegeta, 'veku', { silent: true, hpFrac: 1 });
        S.fusion = h;
        S.veku = h.fused;
      }
      const vk = S.veku;
      vk.cannotDie = false;
      vk.hp = vk.hpMax;
      b.switchPlayer(vk, { force: true });
      vk.untargetable = false;
      vk.intangible = false;
      sj.setHidden(false);
      if (sj.pos.distanceTo(vk.pos) > 14) K.place(sj, FR.at(b, vk.pos.x + 6, vk.pos.z + 6), 0);
      sj.untargetable = false;
      sj.intangible = false;
      sj.controller = cpu(b);
      sj.target = vk;
      vk.target = sj;
      // he gets worse every ten minutes
      sj.lockedSlots = { special1: true, special2: true, ultimate: true };
      sj.damageDealtMul = VK.dealt[0];
      sj.dimensionOverride = { doors: true };
      vk.setState('free');
      sj.setState('free');
      m.title(FR.CHAPTER, 'THIRTY MINUTES', 'Veku · stay alive', 2.8);
      m.music('super_janemba', 2);
      m.objective('survive', 'Survive until the fusion runs out', { icon: 'clock' });
      m.objective('trips', 'Do not trip more than three times', { icon: 'guard', optional: true });
      m.prompt('frBounce', 'dodge', 'Bounce away', { required: true, when: () => vk.pos.distanceTo(sj.pos) < 4 && vk.state === 'free', until: () => (vk.mech && vk.mech.bounces > 2) });
      let stage = 0, kaisDone = !!m.flags.kaisDone;
      const clk = FR.clock(m, {
        seconds: VK.survive,
        storyMinutes: 30,
        label: 'FUSION',
        onTick: (h) => {
          const k = 1 - h.frac;
          const want = k >= VK.stages[1] ? 2 : k >= VK.stages[0] ? 1 : 0;
          if (want > stage) {
            stage = want;
            sj.damageDealtMul = VK.dealt[stage];
            if (stage === 1) delete sj.lockedSlots.special1;
            if (stage === 2) {
              delete sj.lockedSlots.ultimate;
              delete sj.lockedSlots.special2;
              sj.dimensionOverride = null;
            }
            b.emit('vekuEscalate', { stage });
            m.music('super_janemba', 2 + stage);
          }
          if ((vk.mech && vk.mech.trips) > 3) m.failObjective('trips');
        },
      });
      m.lock(false);
      b.aiLocked = false;
      for (;;) {
        yield () => clk.done || m.state !== 'running' || (!kaisDone && clk.frac <= 1 - VK.kaisAt);
        if (m.state !== 'running') {
          clk.stop();
          return;
        }
        if (clk.done) break;
        // half-way: the spectators (the clock waits while they talk)
        kaisDone = true;
        m.flags.kaisDone = true;
        yield* kaisCut(m);
        m.lock(false);
        b.aiLocked = false;
        vk.setState('free');
        sj.setState('free');
      }
      clk.stop();
      m.complete('survive');
      if (!((vk.mech && vk.mech.trips) > 3)) m.complete('trips');
      m.flags.bounces = vk.mech ? vk.mech.bounces : 0;
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /**
   * THE LAST SECONDS: Janemba walks the blimp down across the open ground. Veku runs for the rock, trips and
   * ends on his back with the sword going up over him — and the fusion runs out under the blade: a pop, Goku
   * and Vegeta spring apart, and the blade comes down between them. Expects the fusion still on.
   */
  function* cornered(m) {
    const b = m.battle, S = b.story, vk = S.veku, sj = S.sj;
    for (const x of [vk, sj]) {
      x.controller = K.scripted();
      x.vel.set(0, 0, 0);
      x.untargetable = true;
      x.intangible = true;
      x.freeze = 0;
      x.setHidden(false);
    }
    if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
    const hide = FR.lm(b, 'spikeBehind'), open = hide.clone().sub(FR.lm(b, 'spike')).setY(0).normalize();
    const side = new V3(open.z, 0, -open.x);
    const out = (d, s = 0) => FR.at(b, hide.x + open.x * d + side.x * s, hide.z + open.z * d + side.z * s);
    const v0 = out(10), v1 = out(4.4), j0 = out(17), j1 = out(7.4);
    K.place(vk, v0, 0);
    K.place(sj, j0, 0);
    K.faceTo(vk, v1);
    K.faceTo(sj, v0);
    vk.setState('scripted', { pose: 'vk_run', expression: 'shock', speed: 14 });
    sj.setState('scripted', { pose: 'sj_idle', expression: 'wicked', speed: 6 });
    // side on and wide: the blimp running for the rock, the demon walking after him, in no hurry
    m.shot((t, o) => {
      const c = vk.pos.clone().lerp(sj.pos, 0.5);
      o.pos.copy(c).addScaledVector(side, 8).add(new V3(0, 1, 0));
      o.look.copy(c).add(new V3(0, 0.8, 0));
      o.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('veku', 'Nonono— stay AWAY from me!', 1.8, { style: 'shout' });
    let n = 0;
    const walk = () => {
      n++;
      const k = Math.min(1, n / 100);
      vk.setPosition(FR.at(b, U.lerp(v0.x, v1.x, k), U.lerp(v0.z, v1.z, k)));
      const kj = Math.min(1, n / 110);
      sj.setPosition(FR.at(b, U.lerp(j0.x, j1.x, kj), U.lerp(j0.z, j1.z, kj)));
      if (n === 100) {
        // the trip: flat on his back, facing what is coming
        K.faceTo(vk, sj.pos);
        vk.setState('scripted', { pose: 'vk_flop', expression: 'shock', speed: 18 });
        b.sfx('boing', vk, { pitch: 0.7 });
        b.vfx.dust(vk.pos.clone(), 0.8, 6, 0xffd8f0);
      }
    };
    m.tickHooks.push(walk);
    yield* m.cine(1.95);
    K.unhook(m, walk);
    // the sword goes up over him: from the ground behind Veku's head, the blade against the sky
    sj.setState('scripted', { pose: 'sj_overheadW', expression: 'wicked', speed: 10 });
    const toJ = sj.pos.clone().sub(vk.pos).setY(0).normalize();
    m.shot((t, o) => {
      o.pos.copy(vk.pos).addScaledVector(toJ, -1.9).addScaledVector(side, 0.9).add(new V3(0, 0.6, 0));
      o.look.copy(sj.chest()).add(new V3(0, 0.55, 0));
      o.fov = 50;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('giggle', sj, { pitch: 0.75, vol: 0.7 });
    yield* m.cine(1.2);
    // it comes down — and the thirty minutes are up
    sj.setState('scripted', { pose: 'sj_overhead', expression: 'wicked', speed: 46 });
    const mid = vk.pos.clone();
    b.vfx.flash(vk.chest(), 1.4, 0xffe8c8, 0.22, SL.Toon.tex.glow);
    b.sfx('capsulePop', vk, { pitch: 0.7, vol: 1.1 });
    SL.Fusion.defuse(b, S.fusion, { to: S.goku, timeUp: true });
    S.fusion = null;
    for (const [x, sgn] of [[S.goku, 1], [S.vegeta, -1]]) {
      x.setHidden(false);
      x.controller = K.scripted();
      x.untargetable = true;
      x.intangible = true;
      K.place(x, FR.at(b, mid.x + side.x * sgn * 2.1, mid.z + side.z * sgn * 2.1), 0);
      K.faceTo(x, sj.pos);
      x.setState('scripted', { pose: 'land', expression: 'shock', speed: 30 });
    }
    b.vfx.slash(sj.handPos('R').add(new V3(0, 0.6, 0)), mid.clone().add(new V3(0, 0.05, 0)), 0xff3a5a, 0.26, 0.14);
    b.vfx.dust(mid.clone(), 1.2, 8, 0xffc8e4);
    b.vfx.ring(mid.clone().add(new V3(0, 0.08, 0)), 2, 0xff8ab0, 0.35, new V3(0, 1, 0));
    SL.Dimension.cubes(b, mid.clone().add(new V3(0, 0.2, 0)), { count: 14, spread: 0.3, speed: 6, life: 44, size: 0.16, colors: [0xff8ad8, 0xffd86a, 0x8ad8ff, 0x6a4a8a], drift: 12 });
    b.sfx('swordSlash', sj, { pitch: 0.8 });
    b.sfx('groundImpact', sj, { vol: 0.9 });
    b.cameraTraumaAt(mid, 0.5);
    m.shot((t, o) => {
      o.pos.copy(mid).addScaledVector(toJ, -5.4).add(new V3(0, 1.3, 0));
      o.look.copy(mid).addScaledVector(toJ, 1.2).add(new V3(0, 0.8, 0));
      o.fov = 54;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('goku', 'The rock — MOVE!', 1.2, { style: 'shout' });
    yield* m.cine(1.25);
    m.endShot();
  }

  P.timeup = {
    id: 'timeup',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      b.aiLocked = true;
      if (S.fusion && S.fusion.active) yield* cornered(m);
      S.fusion = null;
      // behind the spiked rock, both of them; Janemba hunting for them over the open ground
      const hide = FR.lm(b, 'spikeBehind'), open = hide.clone().sub(FR.lm(b, 'spike')).setY(0).normalize();
      for (const [f, dx] of [[S.goku, 1.4], [S.vegeta, -1.4]]) {
        f.setHidden(false);
        f.controller = K.scripted();
        K.place(f, FR.at(b, hide.x + dx, hide.z), 0);
      }
      K.faceTo(S.goku, S.vegeta.pos);
      K.faceTo(S.vegeta, S.goku.pos);
      const sj = S.sj;
      sj.controller = K.scripted();
      sj.setHidden(false);
      K.hover(b, sj, hide.clone().addScaledVector(open, 12), 3);
      const y0 = Math.atan2(hide.x - sj.pos.x, hide.z - sj.pos.z) + 1.2;
      let n = 0;
      // looking for them: the head and the body sweeping the open ground, away from the rock
      const hunt = () => {
        n++;
        sj.yaw = sj.prevYaw = y0 + Math.sin(n * 0.012) * 0.9;
      };
      m.tickHooks.push(hunt);
      m.onDispose(() => K.unhook(m, hunt));
      S.huntStop = () => K.unhook(m, hunt);
      yield* SL.Cinema.play(m, 'fr_veku_timeup');
      K.unhook(m, hunt);
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(FR.CHAPTER, 'VEKU', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'fr_veku',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'Veku',
    subtitle: 'The Other World · not canon',
    character: 'goku',
    stage: 'other_world',
    parTime: 300,
    lockForms: FR.LOCKS,
    qteLabel: 'The dance',
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Two proud Saiyans try the Fusion Dance for the first time. One finger is bent. For thirty minutes, the most powerful being in the afterlife is chasing a blimp.',
    rewards: ['Movie: Veku'],
    setup,
    phases: [P.dance, P.birth, P.survive, P.timeup, P.after],
  };

  SL.data.frVeku = { VK };
  SL.data.missions[def.id] = def;
})();
