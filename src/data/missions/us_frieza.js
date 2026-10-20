/*
 * CHAPTER 21 · UNIVERSE SURVIVAL — "The Tenth Warrior" (canon; played as Goku and as Golden Frieza). Episodes 93–95
 * (Wikipedia's episode list; the Kanzenshuu episode guides for 94 and 95, read 2026-10-19): Majin Buu will not wake,
 * so Goku's tenth fighter is Frieza — brought back from Hell for twenty-four hours by the Fortuneteller Crone at her
 * palace. Universe 9's gods (Sidra, goaded by Universe 4's Quitela, and the Supreme Kai Rou) send a squad of
 * assassins; Frieza goes Golden and slaughters them while Goku protects the area and stops them taking the Crone
 * hostage; their doglike leader's trick with a ball of a god's destruction energy; Frieza turns it on Goku; he calls
 * Universe 9 on an assassin's communicator and offers to change sides; Beerus and Whis arrive; one minute, first
 * punch wins — and they hit each other at the same moment: a tie. After "Father and Son" (episode 90).
 *
 *   REVIVAL *  (staged)  the Crone's arena: Baba brings Frieza back, halo and all; his fist "slips" into Goku's face —
 *                        Goku's slips back (cue: Heavy); the assassins rise out of the lake; Frieza turns Golden
 *   AMBUSH *   (play)    Goku and Frieza together (switch between them): the squad comes over the water; now and then
 *                        one makes a grab for the Crone and carries her off — stop him (the lock-on goes to him) or
 *                        she is taken (a retry). Drive them back
 *   BALL       (cues)    as Frieza: the leader's ball (Dodge), it comes round behind him; the real one rises out of
 *                        the water under him — he takes it and squeezes it small (Charge); Death Beam (Light)
 *   TRAPPED    (struggle) Goku shouts at the rest; Frieza throws the ball at him — a sphere of destruction energy
 *                        closes on him; mash to break out — he cannot (the episode); "who sent you?"
 *   REST *     (play)    as Golden Frieza: the rest of the squad comes at him together
 *   CALL       (staged)  the communicator: Rou and Sidra (voices only); Frieza's offer; Beerus and Whis arrive; the
 *                        communicator crushed; Beerus flicks the energy off Goku
 *   SPAR *     (play)    one minute, Super Saiyan Blue Goku against Golden Frieza: the first blow through wins — and
 *                        whoever lands it, they meet fist to face at the same instant and fall into the lake: a tie
 *   END        (staged)  "the score is far from settled"; off to Capsule Corporation
 *
 * ADAPTATIONS (documented, not hidden): the assassins' designs, number and names are not known from the sources —
 * Level 1 stand-ins (`survival_cast.js`); the Crone, her palace and her arena are Level 1 builds (the stage
 * `crone_palace` is a stand-in); Hell is not shown (the mission opens at the Crone's); Sidra and Rou are voices on the
 * communicator, as in the episode; the torture is not shown (one blast and a line; the non-graphic rule); a beaten
 * assassin falls into the lake. Lines paraphrased, several are the mission's own.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const CHAPTER = 'CHAPTER 21 · UNIVERSE SURVIVAL';
  const VOID = 0x7a2aff, VOID_CORE = 0x2a0a4a;
  // ponytail: provisional (2026-10-19, the owner's batch) — the squad, the grabs, the spar's minute. The owner judges
  const TU = {
    ambush: { kills: 12, maxAlive: 6, every: 2.2, dealt: 0.4, grabFirst: 300, grabEvery: 540, carry: 4, lift: 7, reach: 2.2, speed: 7 },
    trapped: { seconds: 4.5, start: 0.6, drain: 0.12, sag: 0.13 },
    rest: { count: 5, dealt: 0.4 },
    spar: { seconds: 60, floor: 0.5, dealt: 0.5 },
  };
  const SPOT = { goku: [0, -4], frieza: [0, 4], baba: [3, -7], palace: [0, 0, 40], beerus: [-6, -9], whis: [-7.5, -10] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const pose = (f, p, face, speed) => f.setState('scripted', { pose: p, expression: face, speed });
  const TK = () => SL.data.topKit;
  const ORB = (b, pos, r) => SL.data.trunksKit.orb(b, pos, r, VOID, VOID_CORE);
  /** The ball as a cage round him: the shell and the glow, not the solid core (he has to be seen inside it). */
  const cage = (o) => {
    const core = o.group.children[1];
    if (core) core.visible = false;
  };

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: at(b, 'goku'), startKi: 100 });
    S.goku._playerController = S.goku.controller;
    S.frieza = b.spawn({ charId: 'frieza', team: 0, pos: at(b, 'frieza'), startKi: 100 });
    S.baba = b.spawn({ charId: 'fortuneteller_baba', team: 0, pos: at(b, 'baba', 1.4), startKi: 0 });
    S.leader = b.spawn({ charId: 'u9_leader', team: 1, pos: at(b, 'frieza', 30), startKi: 60 });
    S.beerus = b.spawn({ charId: 'beerus', team: 0, pos: at(b, 'beerus'), startKi: 0 });
    S.whis = b.spawn({ charId: 'whis', team: 0, pos: at(b, 'whis'), startKi: 0 });
    for (const f of Object.values(S)) f.cannotDie = true;
    for (const f of [S.frieza, S.leader, S.beerus, S.whis]) bench(f, true);
    bench(S.baba, false);
    floatBaba(b);
    K.toForm(S.frieza, 'final');
    K.faceTo(S.goku, S.baba.pos);
    return S;
  }

  /** Out of the fight: nobody can reach them, they reach nobody. */
  function bench(f, hidden) {
    f.controller = K.scripted();
    f.untargetable = f.intangible = true;
    f.setHidden(hidden);
  }

  /** The Crone on her ball, over the ring's edge. */
  function floatBaba(b, pos) {
    const S = b.story;
    K.hover(b, S.baba, pos || at(b, 'baba'), 1.4);
    pose(S.baba, 'bb_sit', 'calm', 6);
    K.faceTo(S.baba, at(b, 'goku'));
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    b.story.goal = null;
    b.story.hitProp = null;
  }

  /** The squad off the field. */
  function clearSquad(m) {
    for (const f of m.battle.fighters) if (f.tags && ['squad', 'rest'].includes(f.tags.mission)) {
      f.setHidden(true);
      f.untargetable = f.intangible = true;
      f.controller = K.scripted();
    }
  }

  /** A beaten assassin drops into the lake: a splash, and he is gone (non-graphic). */
  function lakeKOs(m) {
    const b = m.battle;
    const off = b.on('ko', (e) => {
      const f = e.fighter;
      if (!f.tags || !['squad', 'rest'].includes(f.tags.mission)) return;
      b.after(50, () => {
        if (b.disposed || f.hidden) return;
        const w = b.stage.water ? b.stage.water.position.y : f.pos.y;
        b.vfx.dust(new V3(f.pos.x, w, f.pos.z), 1.6, 12, 0xd8f0f4);
        b.vfx.ring(new V3(f.pos.x, w + 0.05, f.pos.z), 2.4, 0xe8f8ff, 0.4, new V3(0, 1, 0));
        f.setHidden(true);
        f.untargetable = f.intangible = true;
      });
    });
    m.onDispose(off);
    return off;
  }

  /** The Crone's palace on the shore behind the ring (Level 1: a hall, a dome, two thin towers). */
  function palace(m) {
    const b = m.battle, T = SL.Toon;
    const geos = [], mats = [];
    const mk = (geo, color) => {
      const mat = T.mat(color);
      geos.push(geo);
      mats.push(mat);
      const me = new THREE.Mesh(geo, mat);
      T.addOutline(me, 1.6);
      return me;
    };
    const g = new THREE.Group();
    const hall = mk(new THREE.BoxGeometry(16, 7, 10), 0xe8dcc0);
    hall.position.y = 3.5;
    const dome = mk(new THREE.SphereGeometry(5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0x8a5aa8);
    dome.position.y = 7;
    const tip = mk(new THREE.ConeGeometry(1, 3.2, 12), 0x8a5aa8);
    tip.position.y = 13.2;
    g.add(hall, dome, tip);
    for (const s of [1, -1]) {
      const tower = mk(new THREE.CylinderGeometry(0.9, 1.1, 14, 10), 0xe8dcc0);
      tower.position.set(s * 9.5, 7, 0);
      const cap = mk(new THREE.ConeGeometry(1.3, 2.6, 10), 0x8a5aa8);
      cap.position.set(s * 9.5, 15.3, 0);
      g.add(tower, cap);
    }
    const p = K.ground(b, new V3(SPOT.palace[0], 0, SPOT.palace[2]));
    g.position.set(p.x, Math.max(p.y, b.stage.water ? b.stage.water.position.y : p.y) - 0.3, p.z);
    g.rotation.y = Math.PI;
    b.scene.add(g);
    const dispose = () => {
      b.scene.remove(g);
      for (const x of geos) x.dispose();
      for (const x of mats) x.dispose();
    };
    m.onDispose(dispose);
    return { group: g, dispose };
  }

  const P = {};

  /** REVIVAL: the Crone brings him back; the slip of the hand; the assassins; Golden. */
  P.revival = { id: 'revival', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, bb = S.baba;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    if (!S.palace) S.palace = palace(m);
    g.controller = K.scripted();
    K.toForm(g, 'base');
    K.toForm(fz, 'final');
    K.place(g, at(b, 'goku'), 0);
    floatBaba(b);
    K.faceTo(g, bb.pos);
    pose(g, 'g_handsHips', 'grin', 6);
    m.music('peaceful', 1);
    const cast = { goku: g, frieza: fz, baba: bb };
    m.title(CHAPTER, 'THE TENTH WARRIOR', 'The Fortuneteller Crone\'s palace · Age 780', 3.6);
    shot(m, cast, { subject: 'baba', with: 'goku', focus: 'wide', angle: 'three' }, 999);
    m.say('fortuneteller_baba', 'Twenty-four hours, Goku. When the time is up, he goes straight back where he came from.', 3.8);
    yield* st.wait(3.8);
    m.say('goku', 'Got it, Baba. Thanks!', 1.8);
    yield* st.wait(1.8);
    // the conjuring: her hands over the ball, a column of light on the ring — and he is standing in it
    pose(bb, 'bb_conjure', 'serious', 10);
    const spot = at(b, 'frieza');
    shot(m, cast, { subject: 'goku', focus: 'wide', angle: 'low' }, 999);
    let n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 5 === 0) b.vfx.ring(spot.clone().add(new V3(0, (n % 40) * 0.08, 0)), 1.6, 0xfff2c8, 0.3, new V3(0, 1, 0));
      return n >= 60 || b.skipRequested;
    };
    b.vfx.flash(spot.clone().add(new V3(0, 1.2, 0)), 4, 0xffffff, 0.4, SL.Toon.tex.glow);
    b.sfx('teleport', fz, { vol: 0.9, pitch: 0.8 });
    fz.setHidden(false);
    K.place(fz, spot, Math.PI);
    K.faceTo(fz, g.pos);
    TK().halo(fz);
    pose(fz, 'fz_watch', 'smirk', 6);
    pose(bb, 'bb_sit', 'calm', 6);
    m.flags.revived = true;
    shot(m, cast, { subject: 'frieza', focus: 'upper', angle: 'low' }, 999);
    m.say('frieza', 'A halo. How fitting, for a day pass.', 2.6);
    yield* st.wait(2.6);
    // his hand slips — into Goku's face
    K.place(fz, K.ground(b, g.pos.clone().add(new V3(0, 0, 1.4))), Math.PI);
    K.faceTo(fz, g.pos);
    pose(fz, 'fz_jab', 'smirk', 30);
    pose(g, 'hitHeavy', 'hurt', 30);
    b.vfx.impact(g.headPos(), 1.5, 0xffffff);
    b.sfx('punchHeavy', g, { vol: 1 });
    shot(m, cast, { subject: 'goku', with: 'frieza', focus: 'medium', angle: 'side' }, 999);
    m.say('frieza', 'Oh dear. My hand slipped.', 2);
    yield* st.wait(1.2);
    pose(g, 'g_jabW', 'angry', 14);
    const r = yield* st.cue('heavy', 'Your hand slips too (Heavy)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r.pressed ? 1 : 0.5);
    pose(g, 'g_jab', 'grin', 30);
    pose(fz, 'hitHeavy', 'angry', 30);
    b.vfx.impact(fz.headPos(), 1.5, 0xffffff);
    b.sfx('punchHeavy', fz, { vol: 1 });
    m.say('goku', 'Whoops. Mine too.', 1.8);
    m.flags.punchBack = true;
    yield* st.wait(1.8);
    pose(fz, 'fz_watch', 'cold', 8);
    pose(g, 'g_handsHips', 'grin', 8);
    // the lake stirs: the assassins
    shot(m, cast, { subject: 'goku', with: 'frieza', focus: 'wide', angle: 'three' }, 999);
    m.music('battle', 3);
    m.say('u9_assassin', 'Frieza of Universe 7. You won\'t be seeing any tournament.', 2.8, { style: 'shout' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = new V3(Math.cos(a) * 18, 0, Math.sin(a) * 18);
      if (!b.skipRequested) b.vfx.ring(K.ground(b, p, 2), 3, 0xd04aff, 0.4, new V3(0, 1, 0));
    }
    yield* st.wait(2.8);
    m.say('frieza', 'Universe 9, is it? Then let me show you what I am.', 2.6);
    yield* st.wait(1.4);
    m.endShot();
    b.skipRequested = false;
    BK.give(fz, 'golden');
    yield* SL.data.cinematics.transform(m, { fighter: fz, formIndex: K.formIndex(fz, 'golden'), witness: g, music: 3 });
    K.toForm(fz, 'golden');
    m.flags.golden = fz.form.id === 'golden';
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * AMBUSH: the squad over the lake, Goku and Golden Frieza together. Every so often one makes for the Crone: a red
   * ring over him, the lock-on snaps to him; if he reaches her he carries her up and away — hit him and he lets go;
   * TU.ambush.carry seconds and she is taken (a retry). Ends with TU.ambush.kills driven off.
   */
  P.ambush = { id: 'ambush', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, bb = S.baba, A = TU.ambush;
    stage(m);
    if (!S.palace) S.palace = palace(m);
    BK.give(fz, 'golden');
    K.toForm(fz, 'golden');
    TK().halo(fz);
    fz.setHidden(false);
    floatBaba(b);
    for (const f of [g, fz]) {
      f.untargetable = f.intangible = false;
      f.setState('free');
    }
    if (g.pos.distanceTo(fz.pos) < 3) K.place(fz, K.ground(b, g.pos.clone().add(new V3(3, 0, 2))), 0);
    g.hp = Math.max(g.hp, g.hpMax * 0.8);
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    b.setParty([g, fz], {});
    m.music('battle', 4);
    m.title(CHAPTER, 'THE TENTH WARRIOR', 'Goku and Golden Frieza vs Universe 9\'s assassins', 2.4);
    m.objective('squad', 'Drive back the assassins', { icon: 'fist', target: A.kills });
    m.objective('baba', 'Keep the Crone safe — stop anyone who goes for her', { icon: 'guard' });
    m.objective('switch', 'Fight as Golden Frieza (switch)', { icon: 'target', optional: true });
    const offSw = b.on('playerSwitched', (e) => e.to === fz && m.complete('switch'));
    m.flags.grabs = 0;
    m.flags.saves = 0;
    // the squad, out of the lake
    let sent = 0;
    const sp = m.spawner({
      every: A.every,
      maxAlive: 99,
      while: () => sent < A.kills + 3 && m.alive('squad').length < A.maxAlive,
      spawn: () => {
        sent++;
        const id = sent % 3 === 0 ? 'u9_gunner' : 'u9_assassin';
        const a = U.rand(0, Math.PI * 2);
        const p = K.ground(b, new V3(Math.cos(a) * U.rand(14, 22), 0, Math.sin(a) * U.rand(14, 22)), 3);
        const s = m.spawn({ charId: id, team: 1, pos: p, startKi: 30, tag: 'squad', damageDealtMul: A.dealt, warp: false });
        s.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
        s.storySpace = 'air';
        b.vfx.ring(s.chest(), 2.4, 0xd04aff, 0.3);
      },
    });
    // the grab: one of them makes for the Crone
    let wait = A.grabFirst, grab = null;
    const home = bb.pos.clone();
    const mark = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.65, 24), new THREE.MeshBasicMaterial({ color: 0xff3a3a, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false }));
    mark.visible = false;
    b.scene.add(mark);
    const letGo = (saved) => {
      const x = grab;
      grab = null;
      mark.visible = false;
      if (x.f.alive && !x.f.hidden) x.f.controller = x.ctl;
      wait = A.grabEvery;
      if (saved) {
        m.flags.saves++;
        b.emit('cronesaved', { by: x.f });
        b.vfx.ring(bb.chest(), 2, 0xffffff, 0.3);
        m.say('goku', 'Hands off, you!', 1.4, { style: 'shout' });
      }
    };
    const grabHook = () => {
      if (grab) {
        const f = grab.f;
        mark.position.copy(f.headPos()).add(new V3(0, 0.6, 0));
        mark.quaternion.copy(b.camera.camera.quaternion);
        if (!f.alive || f.hidden) return letGo(true);
        if (grab.phase === 'go') {
          const to = bb.pos.clone().sub(f.pos);
          const d = to.length();
          f.vel.copy(to.normalize().multiplyScalar(A.speed));
          f.yaw = f.prevYaw = Math.atan2(to.x, to.z);
          f.grounded = false;
          if (d < A.reach) {
            grab.phase = 'carry';
            grab.t = 0;
            pose(f, 'grab', 'wicked', 20);
            m.say('u9_assassin', 'The old witch comes with us!', 1.6);
            b.emit('croneGrabbed', { by: f });
          }
          return;
        }
        // carrying her off, up and out over the lake
        grab.t += SL.TICK;
        f.vel.set(0, 0, 0);
        const up = home.clone().add(new V3(0, A.lift * Math.min(1, grab.t / A.carry), 0)).addScaledVector(grab.out, 10 * Math.min(1, grab.t / A.carry));
        f.setPosition(up.clone().add(new V3(0, 0.9, 0)));
        bb.setPosition(up);
        if (grab.t >= A.carry) {
          grab = null;
          mark.visible = false;
          m.failObjective('baba');
          m.say('fortuneteller_baba', 'Goku! Let go of me, you brute!', 2, { style: 'shout' });
          m.fail('They took the Crone.');
        }
        return;
      }
      if (--wait > 0) return;
      const pick = m.alive('squad').filter((f) => !f.hidden && f.state !== 'knockdown').sort((p, q) => p.pos.distanceTo(bb.pos) - q.pos.distanceTo(bb.pos))[0];
      if (!pick) {
        wait = 30;
        return;
      }
      grab = { f: pick, ctl: pick.controller, phase: 'go', t: 0, out: pick.pos.clone().sub(home).setY(0).normalize() };
      if (grab.out.lengthSq() < 0.01) grab.out.set(1, 0, 0);
      pick.controller = K.scripted();
      pick.setState('free');
      mark.visible = true;
      m.flags.grabs++;
      // the lock-on goes to him: the player (and the bot) know who to stop
      if (b.player) b.player.target = pick;
      m.prompt('crone', 'light', 'He\'s going for the Crone — stop him!', { when: () => !!grab, until: () => !grab, required: true });
      b.emit('croneTarget', { by: pick });
    };
    // a hit on the one carrying her (or making for her) makes him let go
    const offH = b.on('damage', (e) => {
      if (!grab || e.target !== grab.f || !e.attacker || e.attacker.team !== 0) return;
      if (grab.phase === 'carry') floatBaba(b, home.clone().setY(0));
      letGo(true);
    });
    m.tickHooks.push(grabHook);
    const offK = lakeKOs(m);
    const off = () => {
      sp.stop();
      offSw();
      offH();
      offK();
      K.unhook(m, grabHook);
      if (mark.parent) mark.parent.remove(mark);
      mark.geometry.dispose();
      mark.material.dispose();
    };
    m.onDispose(off);
    const heroes = m.storyFight({ floors: [{ f: g, at: 0.15 }, { f: fz, at: 0.3 }], fighters: [g, fz], space: 'air' });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => {
      m.progress('squad', Math.min(A.kills, m.killsByTag.squad || 0));
      return ((m.killsByTag.squad || 0) >= A.kills && !grab) || m.state !== 'running';
    };
    off();
    heroes.off();
    if (m.state !== 'running') return;
    m.complete('squad');
    m.complete('baba');
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    clearSquad(m);
    floatBaba(b);
  } };

  /** BALL: as Frieza — the leader's decoy (Dodge); the real one from the water (Charge); Death Beam (Light). */
  P.ball = { id: 'ball', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, ld = S.leader;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    clearSquad(m);
    K.toForm(fz, 'golden');
    TK().halo(fz);
    for (const f of [g, fz]) {
      f.controller = K.scripted();
      f.setHidden(false);
    }
    b.switchPlayer(fz, { force: true, quiet: true });
    fz.controller = K.scripted();
    g.controller = K.scripted();
    K.hover(b, fz, at(b, 'frieza'), 3);
    K.place(g, at(b, 'goku'), 0);
    K.faceTo(g, fz.pos);
    ld.setHidden(false);
    K.hover(b, ld, at(b, 'frieza').add(new V3(0, 0, 14)), 4);
    K.faceTo(ld, fz.pos);
    K.faceTo(fz, ld.pos);
    pose(ld, 'taunt', 'wicked', 8);
    pose(fz, 'fz_watch', 'cold', 8);
    pose(g, 'guard', 'serious', 8);
    const cast = { frieza: fz, leader: ld, goku: g };
    shot(m, cast, { subject: 'leader', focus: 'upper', angle: 'low' }, 999);
    m.say('u9_leader', 'So you\'re the monster they warned us about. Our universe is tougher than yours — dodge this!', 3.4, { style: 'shout' });
    yield* st.wait(2.2);
    // the decoy: a ball thrown straight at him
    pose(ld, 'blastCharged', 'shout', 30);
    const decoy = ORB(b, ld.chest(), 0.6);
    const from = ld.chest(), to = fz.chest();
    let n = 0;
    shot(m, cast, { subject: 'frieza', with: 'leader', focus: 'medium', angle: 'side' }, 999);
    const r1Pending = st.cue('dodge', 'Dodge it (Dodge)', { auto: 2.5, slow: 0.35 });
    // the decoy flies while the cue waits
    const fly = () => {
      n++;
      decoy.pulse();
      decoy.pos.copy(from).lerp(to, Math.min(0.85, n / 40));
    };
    m.tickHooks.push(fly);
    const r1 = yield* r1Pending;
    K.unhook(m, fly);
    m.qteParts.push(r1.pressed ? 1 : 0.5);
    // he is not there: an afterimage, and the ball sails past — then comes round behind him and bursts
    b.vfx.afterimage(fz.pos, fz.height, 0xffd84a);
    fz.setPosition(fz.pos.clone().add(new V3(3, 0.5, 0)));
    pose(fz, 'fz_laugh', 'smirk', 20);
    n = 0;
    const past = to.clone().add(to.clone().sub(from).setY(0).normalize().multiplyScalar(6));
    yield () => {
      n++;
      decoy.pulse();
      const k = n / 40;
      // out past him, then round in an arc back towards him from behind
      decoy.pos.copy(to).lerp(past, Math.min(1, k * 2)).add(new V3(0, Math.sin(Math.min(1, k) * Math.PI) * 3, 0));
      if (k > 0.5) decoy.pos.lerp(fz.chest().add(new V3(-1.5, 0, 0)), (k - 0.5) * 2);
      return n >= 40 || b.skipRequested;
    };
    b.vfx.explosion(decoy.pos.clone(), 2.2, VOID, { smoke: true });
    b.sfx('explosionBig', null, { at: decoy.pos, vol: 0.9 });
    decoy.dispose();
    m.say('frieza', 'A boomerang? How quaint.', 1.8);
    yield* st.wait(1.8);
    // the real one: up out of the lake under him
    const w = b.stage.water ? b.stage.water.position.y : fz.pos.y - 3;
    const real = (S.voidBall = ORB(b, new V3(fz.pos.x, w, fz.pos.z), 0.8));
    m.onDispose(() => real.dispose());
    m.shot((t, o) => {
      // level with him, off to the side: Frieza and the thing coming up at him both in the frame
      o.pos.copy(fz.pos).add(new V3(7, 0.2, 3));
      o.look.copy(fz.chest()).add(new V3(0, -1.4, 0));
      o.fov = 52;
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('u9_leader', 'That was the bait. THIS is a god\'s destruction!', 2.4, { style: 'shout' });
    n = 0;
    yield () => {
      n++;
      real.pulse();
      real.pos.y = U.lerp(w, fz.chest().y - 0.6, Math.min(1, n / 50));
      if (!b.skipRequested && n % 4 === 0) b.vfx.sparks(real.pos, VOID, 3, 4, 0.08);
      return n >= 50 || b.skipRequested;
    };
    pose(fz, 'blastCharged', 'serious', 20);
    const r2 = yield* st.cue('charge', 'Take it — squeeze it down (Charge)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r2.pressed ? 1 : 0.5);
    // it shrinks into his palm
    n = 0;
    yield () => {
      n++;
      real.pulse();
      real.set(U.lerp(0.8, 0.22, Math.min(1, n / 40)));
      const hand = fz.handPos ? fz.handPos('R') : fz.chest();
      real.pos.lerp(hand, 0.2);
      return n >= 40 || b.skipRequested;
    };
    real.set(0.22);
    m.flags.ballHeld = true;
    m.say('frieza', 'Destruction energy... and from a god, no less. I\'ll be keeping this.', 2.8);
    yield* st.wait(2.8);
    // and the leader: one Death Beam
    pose(fz, 'fz_finger', 'cold', 20);
    shot(m, cast, { subject: 'frieza', with: 'leader', focus: 'medium', angle: 'three' }, 999);
    const r3 = yield* st.cue('light', 'Death Beam (Light)', { auto: 3, slow: 0.4 });
    m.qteParts.push(r3.pressed ? 1 : 0.5);
    const tip = fz.handPos ? fz.handPos('R') : fz.chest();
    for (let i = 0; i <= 8; i++) b.vfx.trail(tip.clone().lerp(ld.chest(), i / 8), 0xff5ab0, 0.18, 0.25);
    b.vfx.impact(ld.chest(), 2, 0xff5ab0);
    b.sfx('kiBlast', fz, { pitch: 1.6, vol: 0.9 });
    pose(ld, 'launched', 'shock', 20);
    n = 0;
    const ldFrom = ld.pos.clone();
    yield () => {
      n++;
      ld.setPosition(ldFrom.clone().add(new V3(0, -n * 0.12, n * 0.05)));
      return ld.pos.y <= w || n >= 60 || b.skipRequested;
    };
    b.vfx.dust(new V3(ld.pos.x, w, ld.pos.z), 2.4, 16, 0xd8f0f4);
    b.vfx.ring(new V3(ld.pos.x, w + 0.05, ld.pos.z), 3.4, 0xe8f8ff, 0.4, new V3(0, 1, 0));
    bench(ld, true);
    m.flags.leaderDown = true;
    m.endShot();
    b.skipRequested = false;
  } };

  /** TRAPPED: the ball on Goku — he cannot get out (the episode); "who sent you?" */
  P.trapped = { id: 'trapped', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, T = TU.trapped;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    const real = S.voidBall || (S.voidBall = ORB(b, fz.chest(), 0.22));
    if (!S.voidBall._disposeHooked) {
      m.onDispose(() => real.dispose());
      S.voidBall._disposeHooked = true;
    }
    K.toForm(fz, 'golden');
    TK().halo(fz);
    fz.controller = K.scripted();
    g.controller = K.scripted();
    fz.setHidden(false);
    K.place(g, at(b, 'goku'), 0);
    K.hover(b, fz, at(b, 'frieza'), 3);
    K.faceTo(fz, g.pos);
    pose(g, 'g_resolve', 'shout', 10);
    const cast = { goku: g, frieza: fz };
    shot(m, cast, { subject: 'goku', focus: 'upper', angle: 'low' }, 999);
    m.say('goku', 'Tell whoever sent you: Universe 7 isn\'t running from anybody!', 3, { style: 'shout' });
    yield* st.wait(2.4);
    // while he shouts: the ball, thrown into his back
    pose(fz, 'throwRelease', 'wicked', 30);
    let n = 0;
    const from = real.pos.clone();
    yield () => {
      n++;
      real.pulse();
      real.pos.copy(from).lerp(g.chest(), Math.min(1, n / 14));
      return n >= 14 || b.skipRequested;
    };
    real.set(1.5);
    real.pos.copy(g.chest());
    cage(real);
    pose(g, 'guard', 'grit', 20);
    b.sfx('drain', g, { vol: 1, pitch: 0.5 });
    b.vfx.flash(g.chest(), 3, VOID, 0.3, SL.Toon.tex.glow);
    m.flags.trapped = true;
    shot(m, cast, { subject: 'goku', with: 'frieza', focus: 'medium', angle: 'three' }, 999);
    m.say('frieza', 'You let your guard down, Goku. Go on — get yourself out of it, the way I did.', 3.2);
    yield* st.wait(1.6);
    // the struggle he cannot win: the bar sags whatever you press
    b.switchPlayer(g, { force: true, quiet: true });
    g.controller = K.scripted();
    // the hand-off drops the shot: frame him in the sphere again, from the side, Frieza over his shoulder
    const toFz = fz.pos.clone().sub(g.pos).setY(0).normalize();
    const sideV = new V3(toFz.z, 0, -toFz.x);
    m.shot((tt, o) => {
      o.pos.copy(g.chest()).addScaledVector(sideV, 5.5).addScaledVector(toFz, -2.5).add(new V3(0, 0.8, 0));
      o.look.copy(g.chest()).lerp(fz.chest(), 0.35);
      o.fov = 52;
    }, 999, { cut: true, blendIn: 0, hold: true });
    const r = yield* m.struggle({
      start: T.start, drain: T.drain, duration: T.seconds, label: 'BREAK OUT (mash)',
      override: (t, grip) => (grip > T.start - t * T.sag ? T.start - t * T.sag : undefined),
      onTick: () => {
        real.pulse();
        real.pos.copy(g.chest());
        if (b.frame % 6 === 0) b.vfx.sparks(g.chest(), VOID, 3, 4, 0.08);
      },
    });
    m.qteParts.push(Math.max(0.3, r.avg));
    m.flags.couldNotEscape = true;
    pose(g, 'exhausted', 'grit', 10);
    m.say('goku', 'Ngh... I can\'t... get out...!', 2);
    yield* st.wait(2);
    m.say('frieza', 'Have you grown too strong for your own good? Stay put, then.', 2.6);
    yield* st.wait(2.6);
    m.endShot();
    b.skipRequested = false;
  } };

  /** REST: as Golden Frieza, the rest of the squad comes at him together. */
  P.rest = { id: 'rest', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, R = TU.rest;
    stage(m);
    if (!S.palace) S.palace = palace(m);
    clearSquad(m);
    const real = S.voidBall || (S.voidBall = ORB(b, g.chest(), 1.5));
    if (!S.voidBall._disposeHooked) {
      m.onDispose(() => real.dispose());
      S.voidBall._disposeHooked = true;
    }
    real.set(1.5);
    cage(real);
    // Goku stays in the sphere
    bench(g, false);
    pose(g, 'guard', 'grit', 10);
    K.place(g, at(b, 'goku'), 0);
    const holdBall = () => {
      real.pulse();
      real.pos.copy(g.chest());
    };
    m.tickHooks.push(holdBall);
    m.onDispose(() => K.unhook(m, holdBall));
    BK.give(fz, 'golden');
    K.toForm(fz, 'golden');
    TK().halo(fz);
    fz.setHidden(false);
    fz.untargetable = fz.intangible = false;
    fz.hp = Math.max(fz.hp, fz.hpMax * 0.8);
    if (!fz._playerController) fz._playerController = new SL.PlayerController(b);
    b.switchPlayer(fz, { force: true, quiet: true });
    b.setParty([fz], {});
    bench(g, false);
    pose(g, 'guard', 'grit', 10);
    fz.setState('free');
    const squad = [];
    for (let i = 0; i < R.count; i++) {
      const a = (i / R.count) * Math.PI * 2;
      const p = K.ground(b, fz.pos.clone().add(new V3(Math.cos(a) * 11, 0, Math.sin(a) * 11)), 3);
      const s = m.spawn({ charId: i % 2 ? 'u9_gunner' : 'u9_assassin', team: 1, pos: p, startKi: 40, tag: 'rest', damageDealtMul: R.dealt, warp: false });
      s.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      s.storySpace = 'air';
      squad.push(s);
    }
    m.music('battle', 4);
    m.title(CHAPTER, 'THE TENTH WARRIOR', 'Golden Frieza vs the rest of the squad', 2.2);
    m.say('frieza', 'All of you at once? Good. It saves time.', 2.2);
    m.objective('rest', 'Finish the squad', { icon: 'fist', target: squad.length });
    const offK = lakeKOs(m);
    const fight = m.storyFight({ floors: [{ f: fz, at: 0.2 }], fighters: [fz], space: 'air' });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => {
      const down = squad.filter((s) => !s.alive).length;
      m.progress('rest', down);
      return down >= squad.length || m.state !== 'running';
    };
    offK();
    fight.off();
    if (m.state !== 'running') return;
    m.complete('rest');
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    clearSquad(m);
    m.flags.restDown = true;
  } };

  /** CALL: Universe 9 on the line; Beerus and Whis; the energy blown away. */
  P.call = { id: 'call', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, be = S.beerus, wh = S.whis;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    clearSquad(m);
    const real = S.voidBall || (S.voidBall = ORB(b, g.chest(), 1.5));
    if (!S.voidBall._disposeHooked) {
      m.onDispose(() => real.dispose());
      S.voidBall._disposeHooked = true;
    }
    K.toForm(fz, 'golden');
    TK().halo(fz);
    for (const f of [g, fz]) {
      f.controller = K.scripted();
      f.setHidden(false);
    }
    K.place(g, at(b, 'goku'), 0);
    K.place(fz, K.ground(b, g.pos.clone().add(new V3(5, 0, 4))), 0);
    K.faceTo(fz, g.pos);
    real.set(1.5);
    cage(real);
    real.pos.copy(g.chest());
    const holdBall = () => {
      real.pulse();
      real.pos.copy(g.chest());
    };
    m.tickHooks.push(holdBall);
    pose(g, 'guard', 'grit', 10);
    // the communicator off an assassin, held to his ear
    pose(fz, 'g_neckRub', 'smirk', 8);
    const cast = { frieza: fz, goku: g, beerus: be, whis: wh };
    shot(m, cast, { subject: 'frieza', focus: 'upper', angle: 'three' }, 999);
    m.say('frieza', 'Universe 9\'s gods, I presume. Bring me back to life — for good — and I will fight for you instead.', 4);
    yield* st.wait(4);
    m.say('rou', 'He would betray us the moment it suited him!', 2.4);
    yield* st.wait(2.4);
    m.say('sidra', '...Still, it is tempting.', 2);
    yield* st.wait(2);
    // Beerus and Whis: a flash of Whis' light on the ring
    for (const f of [be, wh]) {
      f.setHidden(false);
      f.controller = K.scripted();
    }
    K.place(be, at(b, 'beerus'), 0);
    K.place(wh, at(b, 'whis'), 0);
    K.faceTo(be, fz.pos);
    K.faceTo(wh, fz.pos);
    pose(be, 'armsCrossed', 'angry', 8);
    pose(wh, 'idle', 'calm', 8);
    b.vfx.flash(wh.chest(), 3, 0xbfe8ff, 0.3, SL.Toon.tex.glow);
    b.sfx('teleport', wh, { vol: 0.8 });
    // the communicator crushed in his fist
    pose(fz, 'fz_watch', 'cold', 12);
    b.vfx.sparks(fz.handPos ? fz.handPos('R') : fz.chest(), 0x8ad8ff, 10, 6, 0.08);
    b.sfx('rockBreak', fz, { vol: 0.5, pitch: 1.6 });
    m.flags.called = true;
    shot(m, cast, { subject: 'beerus', with: 'goku', focus: 'medium', angle: 'three' }, 999);
    // Beerus flicks the energy off him: it bursts high over the lake, harmlessly
    pose(be, 'twoFingers', 'bored', 20);
    const from = real.pos.clone(), high = from.clone().add(new V3(0, 40, 0));
    K.unhook(m, holdBall);
    let n = 0;
    yield () => {
      n++;
      real.pulse();
      real.pos.copy(from).lerp(high, Math.min(1, n / 40));
      return n >= 40 || b.skipRequested;
    };
    b.vfx.explosion(real.pos.clone(), 4, VOID, { smoke: false });
    b.sfx('explosionBig', null, { at: real.pos, vol: 0.7 });
    real.dispose();
    S.voidBall = null;
    m.flags.freed = true;
    pose(g, 'g_neckRub', 'grin', 8);
    m.say('beerus', 'That was a God of Destruction\'s energy. Who were you talking to, Frieza?', 3.2);
    yield* st.wait(3.2);
    m.say('frieza', 'Talking? I have no idea what you mean.', 2.2);
    yield* st.wait(2.2);
    pose(g, 'g_resolve', 'determined', 8);
    shot(m, cast, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    m.say('goku', 'I forgot how rotten you are. Whis — give me one minute with him.', 3);
    yield* st.wait(3);
    m.say('goku', 'First clean punch wins. I win, you fight for Universe 7. You win, you do what you like.', 3.6);
    yield* st.wait(3.6);
    m.say('frieza', 'Agreed.', 1.2);
    yield* st.wait(1.2);
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * SPAR: one minute, Blue against Golden, over the lake. The first blow that gets through a guard (either way), or
   * the minute running out, and they meet fist to face at the same instant and drop into the
   * lake: a tie (the episode). Landing it first is the score.
   */
  P.spar = { id: 'spar', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, T = TU.spar;
    stage(m);
    if (!S.palace) S.palace = palace(m);
    for (const f of [S.beerus, S.whis]) {
      f.setHidden(false);
      bench(f, false);
    }
    K.place(S.beerus, at(b, 'beerus'), 0);
    K.place(S.whis, at(b, 'whis'), 0);
    pose(S.beerus, 'armsCrossed', 'bored', 6);
    pose(S.whis, 'idle', 'calm', 6);
    BK.give(g, 'blue');
    BK.give(fz, 'golden');
    K.toForm(g, 'blue');
    K.toForm(fz, 'golden');
    TK().halo(fz);
    fz.setHidden(false);
    fz.team = 1;
    g.untargetable = g.intangible = fz.untargetable = fz.intangible = false;
    g.hp = g.hpMax;
    fz.hp = fz.hpMax;
    K.place(g, at(b, 'goku'), 0);
    K.place(fz, at(b, 'frieza'), Math.PI);
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    b.setParty([g], {});
    g.target = fz;
    fz.target = g;
    fz.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, fz.def.ai, (fz.form && fz.form.ai) || {}, { aggression: 0.7, transformHp: 0 }) });
    g.setState('free');
    fz.setState('free');
    m.music('battle', 5);
    m.title(CHAPTER, 'THE TENTH WARRIOR', 'One minute · first clean blow wins', 2.4);
    m.objective('spar', 'Land the first blow that gets through', { icon: 'fist' });
    let first = null, t = 0;
    const offD = b.on('damage', (e) => {
      if (first || e.blocked || !e.attacker || !(e.amount > 0)) return;
      if ((e.attacker === g && e.target === fz) || (e.attacker === fz && e.target === g)) first = e.attacker;
    });
    const clock = () => {
      t += SL.TICK;
      b.emit('storyClock', { active: true, frac: Math.max(0, 1 - t / T.seconds), text: Math.max(0, Math.ceil(T.seconds - t)) + 's', label: 'ONE MINUTE', color: '#8ad8ff', urgent: t > T.seconds - 10 });
    };
    m.tickHooks.push(clock);
    const sf = m.storyFight({ floors: [{ f: g, at: T.floor }, { f: fz, at: T.floor }], dealt: [{ f: fz, mul: T.dealt }], fighters: [g, fz], space: 'air' });
    const off = () => {
      offD();
      K.unhook(m, clock);
      b.emit('storyClock', { active: false });
    };
    m.onDispose(off);
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => first || t >= T.seconds || sf.floored(g) || sf.floored(fz) || m.state !== 'running';
    off();
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    m.flags.firstBlow = first === g ? 'goku' : first === fz ? 'frieza' : 'time';
    m.qteParts.push(first === g ? 1 : 0.6);
    m.complete('spar');
    // the tie: at each other, fist to face at the same instant
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    fz.controller = K.scripted();
    const mid = g.pos.clone().lerp(fz.pos, 0.5);
    mid.y = Math.max(mid.y, (b.stage.water ? b.stage.water.position.y : 0) + 4);
    const gFrom = mid.clone().add(new V3(0, 0, -7)), fFrom = mid.clone().add(new V3(0, 0, 7));
    K.hover(b, g, gFrom, 0);
    g.setPosition(gFrom);
    K.hover(b, fz, fFrom, 0);
    fz.setPosition(fFrom);
    K.faceTo(g, fz.pos);
    K.faceTo(fz, g.pos);
    pose(g, 'punchR', 'shout', 30);
    pose(fz, 'fz_jab', 'shout', 30);
    m.shot((tt, o) => {
      o.pos.copy(mid).add(new V3(8, 0.6, 0));
      o.look.copy(mid);
      o.fov = 44;
    }, 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 14);
      g.setPosition(gFrom.clone().lerp(mid.clone().add(new V3(0, 0, -0.75)), k));
      fz.setPosition(fFrom.clone().lerp(mid.clone().add(new V3(0, 0, 0.75)), k));
      if (n % 3 === 0 && !b.skipRequested) {
        b.vfx.afterimage(g.pos, g.height, 0x8ad8ff);
        b.vfx.afterimage(fz.pos, fz.height, 0xffd84a);
      }
      return n >= 14 || b.skipRequested;
    };
    SL.ScreenFX.flash(0.35, '#ffffff');
    b.vfx.impact(g.headPos(), 3, 0xffffff);
    b.vfx.impact(fz.headPos(), 3, 0xffffff);
    b.sfx('punchHeavy', g, { pitch: 0.6, vol: 1.4 });
    b.cameraTraumaAt(mid, 0.8);
    b.slowmo(0.2, 0.6);
    pose(g, 'hitHeavy', 'hurt', 20);
    pose(fz, 'hitHeavy', 'hurt', 20);
    yield* st.wait(0.8);
    // both down into the lake
    const w = b.stage.water ? b.stage.water.position.y : mid.y - 4;
    const gTop = g.pos.clone(), fTop = fz.pos.clone();
    n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 40);
      g.setPosition(gTop.clone().lerp(new V3(gTop.x, w - 0.6, gTop.z - 3), k));
      fz.setPosition(fTop.clone().lerp(new V3(fTop.x, w - 0.6, fTop.z + 3), k));
      return n >= 40 || b.skipRequested;
    };
    for (const f of [g, fz]) {
      b.vfx.dust(new V3(f.pos.x, w, f.pos.z), 2, 14, 0xd8f0f4);
      b.vfx.ring(new V3(f.pos.x, w + 0.05, f.pos.z), 3, 0xe8f8ff, 0.4, new V3(0, 1, 0));
    }
    b.sfx('groundImpact', null, { at: mid, vol: 0.8 });
    m.flags.tie = true;
    shot(m, { whis: S.whis, beerus: S.beerus }, { subject: 'whis', with: 'beerus', focus: 'medium', angle: 'three' }, 999);
    m.say('whis', 'Oh my. A tie.', 1.8);
    yield* st.wait(1.8);
    m.endShot();
    b.skipRequested = false;
  } };

  /** END: up out of the lake; the score far from settled; off to the others. */
  P.end = { id: 'end', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    if (S.voidBall) {
      S.voidBall.dispose();
      S.voidBall = null;
    }
    fz.team = 0;
    for (const f of [g, fz]) {
      f.controller = K.scripted();
      f.setHidden(false);
    }
    K.toForm(g, 'base');
    K.toForm(fz, 'final');
    TK().halo(fz);
    K.place(g, at(b, 'goku'), 0);
    K.place(fz, K.ground(b, g.pos.clone().add(new V3(4, 0, 3))), 0);
    K.faceTo(g, fz.pos);
    K.faceTo(fz, g.pos);
    pose(g, 'g_handsHips', 'grin', 8);
    pose(fz, 'fz_watch', 'smirk', 8);
    const cast = { goku: g, frieza: fz };
    shot(m, cast, { subject: 'goku', with: 'frieza', focus: 'wide', angle: 'three' }, 999);
    m.say('goku', 'Hah... that one doesn\'t count. We\'ll settle it another time.', 3);
    yield* st.wait(3);
    m.say('frieza', 'Oh, we will. For now — let\'s go and meet these teammates of yours.', 3);
    yield* st.wait(3);
    m.flags.joined = true;
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'THE TENTH WARRIOR', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.usFrieza = { TU, SPOT };
  SL.data.missions.us_frieza = {
    id: 'us_frieza', canon: true, chapter: CHAPTER, title: 'The Tenth Warrior', character: 'goku', stage: 'crone_palace',
    subtitle: 'Universe Survival · Frieza, back for a day', parTime: 720, qteLabel: 'The slips, the ball, the beam',
    blurb: 'Buu will not wake, and Universe 7 needs a tenth fighter. Goku\'s choice: Frieza — back from Hell for twenty-four hours. Universe 9 has other plans for him.',
    appearance: { goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    lockForms: {
      goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
      frieza: SL.data.characters.frieza.forms.filter((x) => !['final', 'golden'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Frieza joins the team for the Tournament of Power (for one day)'],
    setup,
    phases: [P.revival, P.ambush, P.ball, P.trapped, P.rest, P.call, P.spar, P.end],
  };
})();
