/*
 * CHAPTER 19 · FUTURE TRUNKS — "The Divine Scythe" (canon; played as Goku, then Future Trunks). Roadmap Three, the
 * owner's Goku Black arc research (2026-10-18, `Downloads/Goku black arc research.pdf`): CS-MAF-01 / MAF-S01 (the
 * Mafuba attempt) and CS-SCY-01 / SCY-S01 / CLN-S01 (the Divine Scythe, the tear, the smoke clones). The third trip,
 * between "A Genuine Saiyan" (Vegeta's beatdown) and "Vegito" (the two Zamasu fuse). A research draft: built from the
 * PDF's text and its reference images, not checked against the footage. Lines are paraphrased and written for this
 * project.
 *
 * Where the PDF disagrees with itself, the beat with an ID wins and the other reading is noted (plan 9.22): a clay jar
 * (not a rice cooker), a green burst (not a dark one), a red-and-black crack (not a purple swirl), clones that
 * dissipate and re-form behind whoever struck them (the other account: blows "pass through them or fail to destroy
 * them permanently" — the same thing seen from outside). Mai stands beside Trunks in the reference image; she is not in
 * the cast, so Trunks is alone.
 *
 * THE ORDER IS EPISODE 64's (2026-10-19: documentation/FUSED_ZAMASU_EPISODES_64_67.md beats 1–2, from the Kanzenshuu
 * episode guide; the PDF does not order the two beats, and the mission first kept its section order — the Mafuba
 * first): Black's anger makes the scythe, its cut opens the rift, the smoke makes the clones; then Trunks seals Zamasu
 * with the Mafuba, the talisman is not there, Zamasu breaks out, and Black comes to him (the fusion opens "Vegito").
 *
 *   SCYTHE *   (staged)  the square: Blue Goku and Vegeta before Rosé; Black draws his hand into his chest (SCY-S01:
 *                         close, a whip-pan), and instead of the short blade a towering scythe of dark magenta grows
 *                         out of it in a jagged aura; the horizontal swing that misses both of them on purpose and
 *                         cuts the air — a floating red-and-black crack; dark mist spills out of it and condenses into
 *                         clones of him with hollow silver eyes; the crack opens into a giant rift and he hangs before
 *                         it, arms crossed, the clones flanking him (CLN-S01: extreme wide, static, centre frame)
 *   SWARM *    (played)  Blue Goku (the player) and Blue Vegeta against the clones. Strike one and it comes apart into
 *                         dark smoke and re-forms behind whoever struck it, and strikes again: they cannot be put down.
 *                         Hold out (a count of the seconds); the stretch ends at the count or when Goku is worn down
 *   THE RIFT   (staged)  the swarm closes in round the two of them; CLN-S01 again, Black above it all; to black
 *   MAFUBA *   (staged, one struggle)  elsewhere in the ruins: Zamasu comes down out of the sky for Trunks; the jar on
 *                         the street; the stance, the green spiral round him, wind and grit drawn round in it; MAFUBA! —
 *                         the green lasso takes Zamasu in mid-air, arms pinned, spun inside the tornado (MAF-S01: wide,
 *                         low, tilting up after him; the player mashes to hold the vortex, the story's outcome does not
 *                         change); the funnel into the jar's neck, Zamasu drawn in as a stream; the lid; the hand goes
 *                         for the talisman — it is not there, it never left the past; the jar shakes and bursts in a
 *                         blinding green explosion; Zamasu stands in the shards, shaken, unsealed; Black appears beside
 *                         him (episode 64: he teleports to him; wordless here)
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  // ponytail: provisional story-stretch values (no number in the PDF) — local to this mission, restored at the stretch
  // end. mafuba: the struggle (the vortex's hold drains, mashing keeps it up; the pull is never lost — CS-MAF-01's
  // outcome is fixed); swarm: the played stretch (four clones — the image shows two flanking him, the text "multiple"
  // and "a swarm"; reform: frames of smoke between the blow and the clone standing behind the striker)
  const TU = {
    mafuba: { start: 0.55, drain: 0.38, seconds: 6, minPull: 0.12 },
    swarm: { clones: 4, seconds: 40, gokuFloor: 0.3, cloneDealt: 0.14, reform: 24 },
  };
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const GREEN = 0x5aff8a, PALE_GREEN = 0xd8ffe0, MAGENTA = 0xc23cff;
  // the stage: the scythe in the middle of the square, the Mafuba at its edge (future_ruins: a 30 m plaza)
  const SPOT = { trunks: [-12, -14], goku: [-1.7, -6], vegeta: [1.7, -6], black: [0, 6] };
  const at = (b, k) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]));

  // the poses: Trunks' Mafuba ones in future_trunks.js, the scythe's in goku_black.js, vortexBound and Zamasu's in
  // poses_common.js / zamasu.js (shared with the Free Battle techniques)

  /* ---------------------------------------------------------------- setup and helpers */

  function setup(b) {
    const S = (b.story = {});
    S.trunks = b.spawn({ charId: 'future_trunks', team: 0, player: true, pos: at(b, 'trunks'), startKi: 80 });
    S.trunks._playerController = S.trunks.controller;
    S.zamasu = b.spawn({ charId: 'zamasu', team: 1, pos: K.ground(b, new V3(-12, 0, -2)), startKi: 80 });
    S.goku = b.spawn({ charId: 'goku', team: 0, pos: at(b, 'goku'), startKi: 100 });
    S.vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(b, 'vegeta'), startKi: 100 });
    S.black = b.spawn({ charId: 'goku_black', team: 1, pos: at(b, 'black'), startKi: 100 });
    S.clones = [];
    for (let i = 0; i < TU.swarm.clones; i++) S.clones.push(b.spawn({ charId: 'goku_black', team: 1, pos: K.ground(b, new V3(-6 + i * 4, 0, 10)), startKi: 100 }));
    for (const f of [S.trunks, S.zamasu, S.goku, S.vegeta, S.black].concat(S.clones)) f.cannotDie = true;
    for (const f of [S.goku, S.vegeta, S.black].concat(S.clones)) bench(f, true);
    for (const c of S.clones) c.isClone = true;
    return S;
  }

  /** Out of the fight: nobody can reach them, they reach nobody. */
  function bench(f, hidden) {
    f.controller = K.scripted();
    f.untargetable = f.intangible = true;
    f.setHidden(hidden);
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  const flat = (v) => v.clone().setY(0).normalize();
  /** Pose a fighter and hold the aura at k (a scripted state's sd.aura; a bare pose leaves the form's own flare). */
  const poseAura = (f, pose, face, speed, k) => {
    K.pose(f, pose, face, speed);
    f.sd.aura = k;
  };
  const sideOf = (d) => new V3(d.z, 0, -d.x);
  const rightOf = (f) => {
    const fw = f.forward;
    return new V3(-fw.z, 0, fw.x).normalize();
  };
  /** A fighter's model at k of its own size (the jar takes him in; 1 gives his size back). */
  function sizeTo(f, k) {
    const md = f.model;
    if (!md) return;
    const base = md.baseScale * (f.form && f.form.look && f.form.look.scale ? f.form.look.scale : 1);
    md.root.scale.setScalar(base * k);
  }
  /** Hold a body where the story puts it (in the air too) until released. Returns release(). */
  function pin(m, f, where) {
    const p = where.clone();
    const hook = () => {
      f.grounded = false;
      f.vel.set(0, 0, 0);
      f.setPosition(p);
    };
    m.tickHooks.push(hook);
    const release = () => K.removeHook(m, hook);
    m.onDispose(release);
    return { release, to: (v) => p.copy(v), at: p };
  }
  // the clones' eyes and the mist they come and go in are the Divine Scythe technique's (src/game/techniques.js)
  const SCY = () => SL.Techniques.divineScythe;
  const silverEyes = (b, c, flash) => SCY().silverEyes(b, c, flash && !b.skipRequested);
  const smokeAt = (b, f, big) => !b.skipRequested && SCY().smoke(b, f, big);

  /**
   * THE JAR and THE WIND (CS-MAF-01): the Mafuba technique's own (src/game/techniques.js mafubaJar / mafubaVortex) on
   * the mission's ticks. jar: place(at, lidAside), mouth(), lidOn(on), shake(k), burst(), dispose(); vortex:
   * span(narrow, wide, rNarrow, rWide), set(k), k, dispose().
   */
  const MF = () => SL.Techniques.mafuba;
  function jar(m) {
    const b = m.battle;
    const j = MF().jar(b.scene);
    j.group.userData.ftScythe = j.lid.userData.ftScythe = true; // the test finds what the scene left behind
    const tick = () => j.tick();
    m.tickHooks.push(tick);
    let gone = false;
    const api = {
      group: j.group,
      place: (p, lidAt) => j.place(p, lidAt),
      mouth: () => j.mouth(),
      lidOn: (on) => j.lidOn(on),
      shake: (k) => j.shake(k),
      burst: () => j.burst(b, b.skipRequested),
      dispose() {
        if (gone) return;
        gone = true;
        K.removeHook(m, tick);
        j.dispose();
      },
    };
    m.onDispose(api.dispose);
    return api;
  }
  function vortex(m) {
    const b = m.battle;
    const v = MF().vortex(b.scene);
    v.group.userData.ftScythe = true;
    const tick = () => v.tick(b, b.skipRequested);
    m.tickHooks.push(tick);
    let gone = false;
    const api = {
      span: (narrow, wide, rn, rw) => v.span(narrow, wide, rn, rw),
      set: (k) => v.set(k),
      get k() {
        return v.k;
      },
      dispose() {
        if (gone) return;
        gone = true;
        K.removeHook(m, tick);
        v.dispose();
      },
    };
    m.onDispose(api.dispose);
    return api;
  }

  /**
   * THE DIVINE SCYTHE (CS-SCY-01, SCY-S01, the reference image): a shaft of pink-white light going on from his right
   * fist along the line of the arm, and at its top the Divine Lasso's crescent (the technique's own blade, made large)
   * hanging back down beside it, bowed out to his right with its edge toward him; dark crimson smoke and pink bolts
   * round it (the jagged aura). set(k) grown 0..1; tip(); dispose().
   */
  function scythe(m, f) {
    const b = m.battle;
    const sc = SCY().blade(b.scene, MAGENTA);
    sc.shaft.userData.ftScythe = sc.blade.userData.ftScythe = true; // the test finds what the scene left behind
    const tick = () => sc.follow(f, b.skipRequested ? null : b);
    m.tickHooks.push(tick);
    let gone = false;
    const api = {
      set(v) {
        sc.set(v);
        tick();
      },
      tip: () => sc.tip(),
      dispose() {
        if (gone) return;
        gone = true;
        K.removeHook(m, tick);
        sc.dispose();
      },
    };
    m.onDispose(api.dispose);
    return api;
  }

  /**
   * THE TEAR (CS-SCY-01 / CLN-S01): the Divine Scythe technique's (src/game/techniques.js spaceTear) on the mission's
   * ticks, turned to the lens; set(k), size(w, h), moveTo(p), spill(count), k, dispose().
   */
  function tear(m, centre) {
    const b = m.battle;
    const t = SCY().tear(b.scene, centre);
    t.group.userData.ftScythe = true;
    const tick = () => t.face(b.camera.pos);
    m.tickHooks.push(tick);
    let gone = false;
    const api = {
      group: t.group,
      centre: t.group.position,
      set(v) {
        t.set(v);
        tick();
      },
      size: (w, h) => t.size(w, h),
      moveTo: (p) => t.moveTo(p),
      spill(count = 3) {
        if (!b.skipRequested) t.spill(b, count);
      },
      get k() {
        return t.k;
      },
      dispose() {
        if (gone) return;
        gone = true;
        K.removeHook(m, tick);
        t.dispose();
      },
    };
    m.onDispose(api.dispose);
    return api;
  }

  /** The tear for this battle, made once (a checkpoint restart into SWARM makes it there, open). */
  function rift(m) {
    const b = m.battle, S = b.story;
    if (!S.rift) S.rift = tear(m, riftAt(b));
    return S.rift;
  }
  const riftAt = (b) => K.ground(b, new V3(0, 0, 17)).add(new V3(0, 6.5, 0));
  const hoverAt = (b) => K.ground(b, new V3(0, 0, 12.5)).add(new V3(0, 3.6, 0));
  /** Where the clones stand round him for CLN-S01: two in front flanking him, two behind them. */
  const cloneSpot = (b, i) => K.ground(b, new V3([-4.6, 4.6, -8.5, 8.5][i % 4], 0, [7.5, 7.5, 10.5, 10.5][i % 4]));

  /**
   * THE SWARM RULE (CS-SCY-01): the Divine Scythe technique's (src/game/techniques.js smokeSwarm) — a clone struck by
   * Goku or Vegeta comes apart into smoke and re-forms behind whoever struck it (TU.swarm.reform frames later), never
   * while it is someone's rush victim. Returns { off(), dissolved, reformed }; off with the mission too.
   */
  function swarmRule(m, clones, heroes) {
    const b = m.battle;
    const out = SCY().swarm(b, clones, { reform: TU.swarm.reform, isStriker: (a) => heroes.includes(a), quiet: () => b.skipRequested });
    m.onDispose(out.off);
    return out;
  }

  /** The clones: Rosé, silver-eyed, out of the fight. */
  function clonesReady(b) {
    for (const c of b.story.clones) {
      K.toForm(c, 'rose');
      silverEyes(b, c, false);
    }
  }

  const P = {};

  /* ---------------------------------------------------------------- MAFUBA — CS-MAF-01, MAF-S01 (the last phase:
   * episode 64 has it after the rift; the code keeps its place here) */
  P.mafuba = { id: 'mafuba', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, z = S.zamasu;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    // Trunks the player again (the swarm gave the seat to Goku): handed over first, then the others benched — the
    // hand-over gives the one left behind an ally AI
    b.switchPlayer(tr, { force: true, quiet: true });
    for (const f of [S.goku, S.vegeta, S.black].concat(S.clones)) bench(f, true);
    K.toForm(tr, 'ssj'); // the reference image: the gold hair (the text names no form)
    K.toForm(z, 'base');
    tr.controller = K.scripted();
    z.controller = K.scripted();
    z.untargetable = z.intangible = true;
    tr.untargetable = tr.intangible = false;
    tr.setHidden(false);
    z.setHidden(false);
    sizeTo(z, 1);
    m.onDispose(() => sizeTo(z, 1));
    K.sheathe(tr, true);
    const T = at(b, 'trunks');
    K.place(tr, T, 0);
    const fw = new V3(0, 0, 1), side = sideOf(fw);
    K.faceTo(tr, T.clone().add(fw));
    poseAura(tr, 'ft_ready', 'serious', 6, 0.15);
    // Zamasu comes down out of the sky for him
    const Z0 = T.clone().addScaledVector(fw, 10).add(new V3(0, 5.2, 0));
    const zp = pin(m, z, Z0.clone().add(new V3(0, 14, 2)));
    K.faceTo(z, T);
    K.pose(z, 'flyDown', 'wicked', 6);
    m.music('zamasu_theme', 2);
    m.fade('clear', 0.6); // out of THE RIFT's black (a checkpoint restart starts clear)
    m.title(CHAPTER, 'THE MAFUBA', 'Elsewhere in the ruins', 2.6);
    m.shot((t, o) => K.camAt(o, T.clone().addScaledVector(fw, -3.2).addScaledVector(side, 1.6).add(new V3(0, 0.6, 0)), z.chest(), 54), 999, { cut: true, blendIn: 0, hold: true });
    {
      const from = zp.at.clone();
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 80));
        zp.to(from.clone().lerp(Z0, k));
        return k >= 1;
      };
    }
    K.pose(z, 'zm_idle', 'wicked', 5);
    m.say('zamasu', 'Alone, Trunks? Good. The first sinner should be the first to go.', 3, { style: 'quiet' });
    yield* st.wait(3);

    // the jar on the street, a pace in front of him (close, low on the pavement)
    const J = K.ground(b, T.clone().addScaledVector(fw, 1.5));
    const jr = jar(m);
    S.jar = jr;
    poseAura(tr, 'ft_lid', 'serious', 10, 0);
    jr.place(J, K.ground(b, J.clone().addScaledVector(side, 0.45)));
    m.shot((t, o) => K.camAt(o, J.clone().addScaledVector(fw, 1.3).addScaledVector(side, -0.6).add(new V3(0, 0.3, 0)), J.clone().add(new V3(0, 0.3, 0)).lerp(tr.chest(), 0.25), 44), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) b.sfx('block', tr, { vol: 0.4, pitch: 1.4 });
    m.say('future_trunks', 'Not this time. You\'re not walking away from this.', 2.4);
    yield* st.wait(2.4);
    m.flags.jar = true;

    // the stance: feet wide, both hands out; the green spiral round him, the street's grit drawn round in it
    poseAura(tr, 'ft_mafuba', 'shout', 16, 0.5);
    const hands = () => tr.handPos('L').lerp(tr.handPos('R'), 0.5);
    const vx = vortex(m);
    S.vortex = vx;
    vx.span(hands(), hands().addScaledVector(fw, 0.3), 0.2, 0.3);
    m.shot((t, o, el) => {
      const k = U.easeOutCubic(Math.min(1, el / 1.4));
      K.camAt(o, T.clone().addScaledVector(fw, U.lerp(4.2, 5.4, k)).addScaledVector(side, 2.2).add(new V3(0, 0.5, 0)), tr.chest().add(new V3(0, 0.2, 0)), 52);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.sfx('kiUp', tr, { vol: 1 });
      b.sfx('steam', tr, { vol: 0.6, pitch: 0.6 });
    }
    m.say('future_trunks', 'MAFUBA!', 1.4, { style: 'shout' });
    {
      let n = 0;
      yield () => {
        n++;
        if (!b.skipRequested && n % 5 === 0) {
          const a = n * 0.5;
          const g0 = K.ground(b, T.clone());
          b.vfx.ring(g0.clone().add(new V3(0, 0.25 + (n % 15) * 0.08, 0)), 2 + (n % 20) * 0.12, GREEN, 0.4, new V3(0, 1, 0));
          const r = g0.clone().add(new V3(Math.cos(a) * 3, 0.2, Math.sin(a) * 3));
          b.vfx.rock(r, new V3(-Math.sin(a) * 6, U.rand(1.5, 3.5), Math.cos(a) * 6), U.rand(0.05, 0.1), 0x6a6460);
          b.vfx.dust(r, 0.7, 2);
        }
        return n >= 54 || b.skipRequested;
      };
    }
    m.flags.stance = true;

    // the lasso out to him: Zamasu taken in mid-air, the arms forced to his sides, spun inside it
    K.pose(z, 'vortexBound', 'shock', 30);
    vx.span(hands(), z.chest(), 0.4, 3.2);
    vx.set(b.skipRequested ? 1 : 0.2);
    if (!b.skipRequested) {
      b.sfx('drain', z, { vol: 0.9, pitch: 0.7 });
      b.vfx.flash(z.chest(), 2.2, GREEN, 0.25, SL.Toon.tex.glow);
    }
    m.say('zamasu', 'What is this?! Release me, mortal!', 2.2, { style: 'shout' });
    // MAF-S01: wide and low beside him, tilting up after Zamasu as the funnel drags him to the jar
    m.shot((t, o) => {
      const look = z.chest().lerp(J, 0.25);
      K.camAt(o, T.clone().addScaledVector(fw, -3.6).addScaledVector(side, 2.6).add(new V3(0, 0.35, 0)), look, 60);
    }, 999, { cut: true, blendIn: 0, hold: true });
    const above = J.clone().add(new V3(0, 1.6, 0));
    let pull = 0, spin = z.yaw;
    const drag = (k) => {
      const c = Z0.clone().lerp(above, U.easeInOutCubic(k));
      const a = k * Math.PI * 5;
      c.addScaledVector(side, Math.cos(a) * 0.8 * (1 - k)).add(new V3(0, Math.sin(a) * 0.5 * (1 - k), 0));
      zp.to(c);
      spin += 0.35;
      z.yaw = z.prevYaw = spin;
      vx.span(hands(), z.chest(), 0.4, U.lerp(3.2, 1.6, k));
    };
    b.skipRequested = false;
    const r = yield* m.struggle({
      start: TU.mafuba.start, drain: TU.mafuba.drain, duration: TU.mafuba.seconds, label: 'MAFUBA — hold him in the vortex',
      until: () => pull >= 1,
      onTick: (t, grip) => {
        pull = Math.min(1, pull + (TU.mafuba.minPull + grip * 0.5) / 60);
        vx.set(0.35 + grip * 0.65);
        drag(pull);
      },
    });
    pull = 1;
    drag(1);
    vx.set(1);
    m.qteParts.push(U.clamp01(r.avg * 1.4));
    m.flags.vortex = true;

    // the funnel into the jar's neck: Zamasu drawn down into it as a stream of green light
    poseAura(tr, 'ft_mafubaDown', 'shout', 16, 0.5);
    m.say('zamasu', 'No — NO!', 1.4, { style: 'shout' });
    m.shot((t, o) => K.camAt(o, J.clone().addScaledVector(side, 3.4).addScaledVector(fw, 1.2).add(new V3(0, 1.1, 0)), J.clone().add(new V3(0, 1, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    {
      let n = 0;
      const mouth = jr.mouth();
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 50));
        zp.to(above.clone().lerp(mouth, k));
        spin += 0.5;
        z.yaw = z.prevYaw = spin;
        sizeTo(z, U.lerp(1, 0.04, k));
        vx.span(mouth, z.chest().add(new V3(0, 0.6 * (1 - k), 0)), 0.06, U.lerp(1.6, 0.2, k));
        if (!b.skipRequested && n % 2 === 0) b.vfx.trail(z.chest().lerp(mouth, Math.random()), PALE_GREEN, 0.25, 0.35);
        return k >= 1;
      };
    }
    z.setHidden(true);
    vx.set(0);
    if (!b.skipRequested) {
      b.vfx.flash(jr.mouth(), 0.8, GREEN, 0.3, SL.Toon.tex.glow);
      b.sfx('drain', tr, { vol: 0.8, pitch: 1.6 });
    }
    m.flags.sealedIn = true;

    // the lid on; the hand goes to the jacket for the talisman — and it is not there
    poseAura(tr, 'ft_lid', 'serious', 14, 0);
    jr.lidOn(true);
    if (!b.skipRequested) b.sfx('block', tr, { vol: 0.7, pitch: 0.9 });
    m.shot((t, o) => K.camAt(o, J.clone().addScaledVector(fw, 1.6).addScaledVector(side, 0.9).add(new V3(0, 0.5, 0)), J.clone().add(new V3(0, 0.4, 0)).lerp(tr.headPos(), 0.4), 46), 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.9);
    poseAura(tr, 'ft_search', 'shock', 10, 0);
    m.flags.reached = true;
    yield* st.wait(0.8);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'closeup', angle: 'three' }, 999);
    m.say('future_trunks', 'The talisman... it isn\'t here. It never left the past!', 2.8, { style: 'quiet' });
    yield* st.wait(2.8);
    m.flags.noTalisman = true;

    // the jar shakes, green light leaking at the lid; then it bursts — a blinding green explosion
    m.shot((t, o) => K.camAt(o, J.clone().addScaledVector(fw, 2.2).addScaledVector(side, -1.2).add(new V3(0, 0.35, 0)), J.clone().add(new V3(0, 0.3, 0)), 44), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) b.sfx('rumble', tr, { vol: 0.9, dur: 1.2 });
    {
      let n = 0;
      yield () => {
        n++;
        jr.shake(Math.min(1, n / 40));
        if (!b.skipRequested && n % 6 === 0) b.vfx.flash(jr.mouth(), 0.4 + n / 120, GREEN, 0.15, SL.Toon.tex.glow);
        return n >= 72 || b.skipRequested;
      };
    }
    jr.shake(0);
    const burstAt = J.clone().add(new V3(0, 0.3, 0));
    jr.burst();
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.4, '#c8ffd8');
      b.vfx.explosion(burstAt, 2.2, GREEN, { smoke: false });
      b.vfx.ring(burstAt, 9, PALE_GREEN, 0.6, new V3(0, 1, 0));
      b.vfx.ring(burstAt.clone().add(new V3(0, 0.8, 0)), 6, GREEN, 0.5);
      b.sfx('explosionBig', tr, { vol: 1.1 });
      b.sfx('rockBreak', tr, { vol: 0.8 });
      b.cameraTraumaAt(burstAt, 0.6);
    }
    m.flags.burst = true;
    // Zamasu stands in the shards — shaken, unsealed; Trunks thrown back on his heels
    zp.release();
    z.setHidden(false);
    sizeTo(z, 1);
    z.grounded = true;
    K.place(z, K.ground(b, J.clone().addScaledVector(fw, 1.6)), 0);
    K.faceTo(z, tr.pos);
    K.pose(z, 'zm_shaken', 'grit', 10);
    K.place(tr, K.ground(b, T.clone().addScaledVector(fw, -1.2)), 0);
    K.faceTo(tr, z.pos);
    poseAura(tr, 'guard', 'shock', 14, 0.2);
    m.shot((t, o) => K.camAt(o, J.clone().addScaledVector(side, 4.6).addScaledVector(fw, 0.4).add(new V3(0, 1.2, 0)), J.clone().add(new V3(0, 1.1, 0)), 52), 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(1.2);
    m.flags.unsealed = !z.hidden;
    m.say('zamasu', 'A jar... You meant to shut a god inside a jar.', 2.8, { style: 'quiet' });
    yield* st.wait(2.8);
    K.pose(z, 'zm_idle', 'angry', 6);
    shot(m, { zamasu: z }, { subject: 'zamasu', focus: 'upper', angle: 'low' }, 999);
    m.say('zamasu', 'For that alone, every mortal in this world will suffer twice.', 2.8);
    yield* st.wait(2.8);
    vx.dispose();
    // Black comes to him (episode 64: he teleports to Zamasu — the two of them fuse next, in "Vegito"); wordless
    const bk = S.black;
    bench(bk, false);
    K.toForm(bk, 'rose');
    bk.grounded = true;
    K.place(bk, K.ground(b, z.pos.clone().addScaledVector(side, -1.8)), 0);
    K.faceTo(bk, tr.pos);
    K.pose(bk, 'gb_idle', 'smirk', 5);
    K.pose(z, 'zm_idle', 'wicked', 5);
    if (!b.skipRequested) {
      b.vfx.afterimage(bk.pos, bk.height, 0xff7ad8);
      b.sfx('teleport', bk, { vol: 0.9 });
    }
    const two = z.chest().lerp(bk.chest(), 0.5);
    m.shot((t, o) => K.camAt(o, two.clone().addScaledVector(fw, -5.5).addScaledVector(side, -0.8).add(new V3(0, 0.3, 0)), two, 50), 999, { cut: true, blendIn: 0, hold: true });
    m.flags.blackJoins = !bk.hidden;
    yield* st.wait(1.8);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    // under the black: the jar's shards gone (nothing of the scene left running)
    if (S.jar) S.jar.dispose();
    S.jar = null;
    m.title(CHAPTER, 'THE DIVINE SCYTHE', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  /* ---------------------------------------------------------------- SCYTHE — CS-SCY-01, SCY-S01, CLN-S01 */
  P.scythe = { id: 'scythe', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    if (S.jar) S.jar.dispose();
    // the mission opens on the square: Goku's seat (the HUD his), Trunks out of it until the Mafuba
    b.switchPlayer(g, { force: true, quiet: true });
    bench(S.trunks, true);
    bench(S.zamasu, true);
    for (const c of S.clones) bench(c, true);
    clonesReady(b);
    K.toForm(g, 'blue');
    K.toForm(v, 'blue');
    K.toForm(bk, 'rose');
    for (const f of [g, v, bk]) {
      f.setHidden(false);
      f.controller = K.scripted();
    }
    const G = at(b, 'goku'), Vg = at(b, 'vegeta'), B0 = at(b, 'black');
    K.place(g, G, 0);
    K.place(v, Vg, 0);
    K.place(bk, B0, 0);
    K.faceTo(g, B0);
    K.faceTo(v, B0);
    K.faceTo(bk, G.clone().lerp(Vg, 0.5));
    K.pose(g, 'idle', 'serious', 6);
    K.pose(v, 'armsCrossed', 'smirk', 6);
    K.pose(bk, 'gb_idle', 'angry', 5);
    const bf = flat(G.clone().lerp(Vg, 0.5).sub(B0)), bs = sideOf(bf);
    m.music('zamasu_theme', 3);
    m.title(CHAPTER, 'THE DIVINE SCYTHE', 'Future · the third trip', 3.4);
    // wide across the square: the two Saiyans in Blue, Black before them, still marked from Vegeta's beating
    m.shot((t, o) => K.camAt(o, B0.clone().lerp(G, 0.5).addScaledVector(bs, 13).add(new V3(0, 2, 0)), B0.clone().lerp(G, 0.5).add(new V3(0, 1.2, 0)), 52), 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku_black', 'Mortals. Beaten down, and still you crawl back up — again and again, like a stain.', 3.4, { style: 'quiet' });
    yield* st.wait(3.4);

    // SCY-S01: a whip-pan onto him, close, as he draws his right hand back into his chest; for a breath the short
    // blade, then the scythe grows out of the hand instead
    K.pose(bk, 'gb_scytheDraw', 'angry', 12);
    m.shot((t, o, el) => {
      const k = U.easeOutCubic(Math.min(1, el / 0.3));
      const c = bk.chest();
      const from = G.clone().lerp(Vg, 0.5).add(new V3(0, 1.4, 0));
      K.camAt(o, c.clone().addScaledVector(bf, 2.6).addScaledVector(bs, -1).add(new V3(0, 0.25, 0)), from.lerp(c.clone().add(new V3(0, 0.15, 0)), k), 40);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) b.sfx('kiCharge', bk, { vol: 0.9 });
    const fill = (k) => bk.model && bk.model.setPropFill && bk.model.setPropFill('blackBlade', k);
    {
      let n = 0;
      yield () => {
        n++;
        fill(b.skipRequested ? 0 : Math.min(1, n / 12) * (n < 30 ? 1 : 0));
        return n >= 34 || b.skipRequested;
      };
    }
    fill(0);
    const sc = scythe(m, bk);
    S.scythe = sc;
    K.pose(bk, 'gb_scytheHold', 'grin', 8);
    // from low in front of him, the whole of it towering over him (the reference image)
    m.shot((t, o, el) => {
      const k = U.easeOutCubic(Math.min(1, el / 1.2));
      K.camAt(o, K.ground(b, bk.pos.clone()).addScaledVector(bf, 6.2).addScaledVector(bs, -2.4).add(new V3(0, 0.4, 0)), bk.chest().add(new V3(0, U.lerp(0.4, 1.6, k), 0)), 54);
    }, 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.sfx('swordDraw', bk, { vol: 1, pitch: 0.7 });
      b.sfx('kiUp', bk, { vol: 0.8, pitch: 0.8 });
    }
    {
      let n = 0;
      yield () => {
        n++;
        sc.set(b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 40)));
        return n >= 70 || b.skipRequested;
      };
    }
    sc.set(1);
    m.flags.scythe = true;
    m.say('goku_black', 'Then I will cut more than your bodies. I will cut the world you stand in.', 3.2);
    yield* st.wait(3.2);

    // the swing: wide and side-on, the whole horizontal arc — it passes over them and cuts the air, not the Saiyans
    K.pose(g, 'guard', 'shock', 14);
    K.pose(v, 'guard', 'grit', 14);
    K.pose(bk, 'gb_sweepW', 'angry', 20);
    const mid = bk.chest().lerp(g.chest().lerp(v.chest(), 0.5), 0.4);
    m.shot((t, o) => K.camAt(o, mid.clone().addScaledVector(bs, 15).add(new V3(0, 2.4, 0)), mid.clone().add(new V3(0, 1.2, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
    yield* st.wait(0.35);
    const t0 = sc.tip();
    K.pose(bk, 'gb_sweep', 'angry', 34);
    if (!b.skipRequested) {
      b.sfx('swordSlash', bk, { vol: 1.3, pitch: 0.6 });
      b.sfx('swordClang', bk, { vol: 0.8, pitch: 0.7 });
    }
    yield* st.wait(0.2);
    const t1 = sc.tip();
    if (!b.skipRequested) {
      b.vfx.slash(t0, t1, 0xff7ad8, 0.3, 0.14);
      b.cameraTraumaAt(mid, 0.35);
    }
    // the crack, hanging where the blade went through the air: just behind his shoulder line, high
    const rt = rift(m);
    const crack = bk.pos.clone().addScaledVector(bf, -2).add(new V3(0, 3.4, 0));
    rt.moveTo(crack);
    rt.size(5, 0.9);
    if (!b.skipRequested) {
      b.sfx('portalOpen', bk, { vol: 1, pitch: 0.8 });
      b.sfx('warpShatter', bk, { vol: 0.8 });
    }
    {
      let n = 0;
      yield () => {
        n++;
        rt.set(b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 24)));
        return n >= 30 || b.skipRequested;
      };
    }
    m.flags.tear = true;
    // close on the crack: dark mist spilling out of it
    m.shot((t, o) => K.camAt(o, crack.clone().addScaledVector(bf, 7).addScaledVector(bs, 2.5).add(new V3(0, -1.2, 0)), crack, 46), 999, { cut: true, blendIn: 0, hold: true });
    {
      let n = 0;
      yield () => {
        n++;
        if (n % 3 === 0) rt.spill(3);
        return n >= 70 || b.skipRequested;
      };
    }
    m.flags.mist = true;

    // the crack opens into the giant rift; he lets the scythe go and rises before it, arms crossed; the mist below
    // him condenses into the clones
    sc.dispose();
    S.scythe = null;
    K.pose(bk, 'armsCrossed', 'smirk', 6);
    const H = hoverAt(b), R1 = riftAt(b);
    const bp = pin(m, bk, bk.pos.clone());
    S.blackPin = bp;
    const from = bk.pos.clone(), c0 = crack.clone();
    if (!b.skipRequested) b.sfx('portalOpen', bk, { vol: 1.1, pitch: 0.5 });
    m.shot((t, o) => K.camAt(o, G.clone().lerp(Vg, 0.5).addScaledVector(bf, -2).add(new V3(0, 2.2, 0)), R1.clone().lerp(H, 0.5), 60), 999, { cut: true, blendIn: 0, hold: true });
    {
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 90));
        bp.to(from.clone().lerp(H, k));
        rt.moveTo(c0.clone().lerp(R1, k));
        rt.size(U.lerp(5, 26, k), U.lerp(0.9, 4.2, k));
        if (n % 3 === 0) rt.spill(4);
        return k >= 1;
      };
    }
    rt.moveTo(R1);
    rt.size(26, 4.2);
    S.clones.forEach((c, i) => {
      c.setHidden(false);
      K.place(c, cloneSpot(b, i), 0);
      K.faceTo(c, G.clone().lerp(Vg, 0.5));
      K.pose(c, 'gb_idle', 'calm', 4);
      silverEyes(b, c, true);
      smokeAt(b, c, true);
    });
    if (!b.skipRequested) b.sfx('teleport', bk, { vol: 0.9, pitch: 0.6 });
    m.flags.clones = S.clones.filter((c) => !c.hidden).length;
    yield* st.wait(0.6);

    // CLN-S01: extreme wide, static, centre frame — Black in the air before the giant red rift, the clones flanking him
    K.pose(g, 'idle', 'serious', 6);
    K.pose(v, 'idle', 'grit', 6);
    const lens = G.clone().lerp(Vg, 0.5).addScaledVector(bf, -2.5).add(new V3(0, 1.8, 0)); // ahead of the two: the frame is his
    m.shot((t, o) => K.camAt(o, lens, H.clone().add(new V3(0, 0.6, 0)), 62), 999, { cut: true, blendIn: 0, hold: true });
    m.flags.cln01 = true;
    m.say('goku_black', 'Strike them down as often as you like.', 2.6, { style: 'quiet' });
    yield* st.wait(2.8);
    shot(m, { goku: g, vegeta: v }, { subject: 'goku', with: 'vegeta', focus: 'medium', angle: 'three' }, 999);
    m.say('vegeta', 'Copies? Hmph. Then I\'ll break every last one of them.', 2.6);
    yield* st.wait(2.6);
    m.say('goku', 'Careful, Vegeta. Those eyes... there\'s nothing in them.', 2.6, { style: 'quiet' });
    yield* st.wait(2.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /* ---------------------------------------------------------------- SWARM — played */
  P.swarm = { id: 'swarm', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, bk = S.black;
    stage(m);
    if (S.jar) S.jar.dispose();
    if (S.scythe) S.scythe.dispose();
    bench(S.trunks, true);
    bench(S.zamasu, true);
    K.toForm(g, 'blue');
    K.toForm(v, 'blue');
    K.toForm(bk, 'rose');
    clonesReady(b);
    // a checkpoint restart lands here with the rift open and him before it
    const rt = rift(m);
    rt.moveTo(riftAt(b));
    rt.size(26, 4.2);
    rt.set(1);
    bench(bk, false);
    K.pose(bk, 'armsCrossed', 'smirk', 6);
    if (!S.blackPin) S.blackPin = pin(m, bk, hoverAt(b));
    S.blackPin.to(hoverAt(b));
    K.faceTo(bk, at(b, 'goku').lerp(at(b, 'vegeta'), 0.5));
    for (const f of [g, v]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
      f.hp = f.hpMax;
      f.ki = Math.max(f.ki, f.kiMax * 0.7);
    }
    S.clones.forEach((c, i) => {
      c.setHidden(false);
      c.untargetable = c.intangible = false;
      c.hp = c.hpMax;
      if (c.pos.distanceTo(cloneSpot(b, i)) > 30) K.place(c, cloneSpot(b, i), 0);
    });
    const diff = SL.Settings.data.gameplay.difficulty;
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    v.controller = new SL.AIController(b, { difficulty: diff, profile: Object.assign({}, v.def.ai, v.form.ai || {}, { transformHp: 0 }) });
    for (const c of S.clones) c.controller = new SL.AIController(b, { difficulty: diff, profile: Object.assign({}, c.def.ai, c.form.ai || {}, { aggression: 0.85, transformHp: 0 }) });
    g.target = S.clones[0];
    v.target = S.clones[1];
    S.clones.forEach((c, i) => (c.target = i % 2 ? v : g));
    for (const f of [g, v].concat(S.clones)) f.setState('free');
    m.title(CHAPTER, 'THE DIVINE SCYTHE', 'Blue Goku and Vegeta vs the rift clones', 2.4);
    m.objective('swarm', 'Hold out against the clones — every one you strike re-forms (seconds)', { icon: 'fist', target: TU.swarm.seconds });
    m.music('ssj_blue', 3);
    // Goku's floor is a real story floor: his health stops there and the stretch ends on it (a heavy blow used to carry
    // him a few per cent past it in one tick)
    const sf = m.storyFight({
      floors: [{ f: g, at: TU.swarm.gokuFloor }],
      dealt: S.clones.map((c) => ({ f: c, mul: TU.swarm.cloneDealt })),
      fighters: [g, v].concat(S.clones),
    });
    const rule = swarmRule(m, S.clones, [g, v]);
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    let t = 0;
    const count = () => {
      if (++t % 60 === 0) m.progress('swarm', t / 60);
      if (t % 20 === 0) rt.spill(1);
    };
    m.tickHooks.push(count);
    yield () => t >= TU.swarm.seconds * 60 || sf.floored(g) || m.state !== 'running';
    K.removeHook(m, count);
    rule.off();
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    const held = !sf.floored(g);
    m.flags.swarm = held;
    m.flags.dissolved = rule.dissolved;
    m.flags.reformed = rule.reformed;
    m.qteParts.push(held ? 1 : 0.6);
    m.complete('swarm');
  } };

  /* ---------------------------------------------------------------- THE RIFT — the swarm closes in; CLN-S01 */
  P.rift = { id: 'rift', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    for (const f of [g, v, bk].concat(S.clones)) f.controller = K.scripted();
    for (const c of S.clones) {
      c.setHidden(false);
      c.untargetable = c.intangible = true;
    }
    const rt = rift(m);
    rt.set(1);
    // the two of them back to back in the square, the clones closing round them
    const C = at(b, 'goku').lerp(at(b, 'vegeta'), 0.5).add(new V3(0, 0, 3));
    const toB = flat(hoverAt(b).sub(C)), cs = sideOf(toB);
    g.grounded = v.grounded = true;
    K.place(g, K.ground(b, C.clone().addScaledVector(cs, -0.5)), 0);
    K.place(v, K.ground(b, C.clone().addScaledVector(cs, 0.5)), 0);
    K.faceTo(g, C.clone().addScaledVector(cs, -3));
    K.faceTo(v, C.clone().addScaledVector(cs, 3));
    K.pose(g, 'guard', 'grit', 8);
    K.pose(v, 'guard', 'angry', 8);
    S.clones.forEach((c, i) => {
      const a = (i / S.clones.length) * Math.PI * 2 + 0.4;
      c.grounded = true;
      K.place(c, K.ground(b, C.clone().add(new V3(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6))), 0);
      K.faceTo(c, C);
      K.pose(c, 'gb_idle', 'calm', 4);
    });
    m.shot((t, o, el) => {
      const k = U.easeInOutCubic(Math.min(1, el / 3));
      K.camAt(o, C.clone().addScaledVector(cs, U.lerp(5, 9, k)).addScaledVector(toB, -3).add(new V3(0, U.lerp(1.4, 3.4, k), 0)), C.clone().add(new V3(0, 1, 0)), 54);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Hah... hah... they just keep coming back!', 2.4, { style: 'quiet' });
    yield* st.wait(2.4);
    m.say('vegeta', 'Then keep hitting them, Kakarot!', 2, { style: 'shout' });
    yield* st.wait(2);
    // CLN-S01 once more: he has not moved
    const H = hoverAt(b);
    const lens = C.clone().addScaledVector(toB, -4).add(new V3(0, 1.8, 0));
    m.shot((t, o) => K.camAt(o, lens, H.clone().add(new V3(0, 0.6, 0)), 62), 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku_black', 'Every blow only scatters me. A god\'s will has no end — and neither do I.', 3.4, { style: 'quiet' });
    yield* st.wait(3.4);
    m.flags.rift = rt.k >= 1;
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    // under the black: the rift and his hold let go (nothing of the scene left running); the Mafuba next
    rt.dispose();
    S.rift = null;
    if (S.blackPin) S.blackPin.release();
    S.blackPin = null;
  } };

  SL.data.ftScythe = { TU };
  SL.data.missions.ft_scythe = {
    id: 'ft_scythe', canon: true, chapter: CHAPTER, title: 'The Divine Scythe', character: 'future_trunks', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · the rift, and the Mafuba', parTime: 300, qteLabel: 'The swarm, and the Mafuba held',
    blurb: 'Black cuts the sky open, and the rift pours out copies of him. Then Trunks tries to seal Zamasu away in a jar — without the one thing that would hold him.',
    lockForms: {
      goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
      future_trunks: SL.data.characters.future_trunks.forms.filter((x) => !['base', 'ssj', 'rage'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Black\'s Divine Scythe and the rift clones; the failed Mafuba'],
    setup,
    // episode 64's order (the file keeps MAFUBA first in the code)
    phases: [P.scythe, P.swarm, P.rift, P.mafuba],
  };
})();
