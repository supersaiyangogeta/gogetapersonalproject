/*
 * CHAPTER 19 · FUTURE TRUNKS — "The Dark Goku" (canon; played as Future Trunks). The owner's moveset roadmap §8.18,
 * mission 1 (roadmap #37 / #64 scene 1). Trunks' ruined future: a man with Goku's face is hunting what is left of
 * humanity, and the last tank of fuel for the Time Machine is the only way out. Lines are paraphrased and written for
 * this project.
 *
 *   ARRIVE *   (staged)  the ruined city; Trunks low behind the rubble, sword in hand; dark lightning tears the sky open
 *                        and a man with Goku's face steps down out of it; the pink-violet blade grows out of his hand
 *   HOLD *     (played)  Super Saiyan Trunks against Goku Black — outclassed on purpose (Black shrugs off most of it and
 *                        hits hard). Hold him off: the stretch ends when you have driven him to one knee (his floor) or
 *                        he has you near the end (your floor). Nobody dies here
 *   ESCAPE     (staged)  the blade comes for him; the Time Machine; the jump into the past
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  const TU = { blackFloor: 0.6, trunksFloor: 0.22, blackTaken: 0.45, blackDealt: 0.8 };
  const SPOT = { trunks: [0, -6], black: [0, 8], machine: [-7, -11] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const PURPLE = 0x8a3adf;

  function setup(b) {
    const S = (b.story = {});
    S.trunks = b.spawn({ charId: 'future_trunks', team: 0, player: true, pos: at(b, 'trunks'), startKi: 80 });
    S.trunks._playerController = S.trunks.controller;
    S.black = b.spawn({ charId: 'goku_black', team: 1, pos: at(b, 'black'), startKi: 80 });
    for (const f of Object.values(S)) f.cannotDie = true;
    K.faceTo(S.trunks, S.black.pos);
    K.faceTo(S.black, S.trunks.pos);
    return S;
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  /** The blade of ki out of Black's right hand: 0 (gone) to 1 (full length). */
  function blade(f, k) {
    if (f.model && f.model.setPropFill) f.model.setPropFill('blackBlade', k);
  }

  const portal = K.portal; // the tear in the sky (shared: The Dark Goku, Rosé)

  const P = {};

  P.arrive = { id: 'arrive', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    K.toForm(tr, 'base');
    K.toForm(bk, 'base');
    tr.controller = K.scripted();
    bk.controller = K.scripted();
    K.place(tr, at(b, 'trunks'), 0);
    K.faceTo(tr, at(b, 'black'));
    K.pose(tr, 'ft_kneel', 'serious', 4);
    bk.setHidden(true);
    bk.untargetable = true;
    blade(bk, 0);
    m.music('last_hope', 1);
    // the city, from low among the broken towers, Trunks crouched behind the rubble
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'wide', angle: 'low', room: 10 }, 999);
    m.title(CHAPTER, 'THE DARK GOKU', 'Future · Age 796', 3.6);
    yield* st.wait(3.4);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'three' }, 999);
    m.say('future_trunks', 'That ki... He has found us again.', 2.6, { style: 'quiet' });
    yield* st.wait(2.6);
    // dark lightning: the sky tears open over the street
    const sky = at(b, 'black', 22);
    m.shot((t, o) => {
      o.pos.copy(tr.chest()).add(new V3(1.4, 0.2, -2.2));
      o.look.copy(sky);
      o.fov = 52;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    b.sfx('portalOpen', null, { at: sky, vol: 1 });
    m.music('zamasu_theme', 2);
    const tear = portal(m, sky, tr.chest());
    m.flags.portal = true;
    let n = 0;
    yield () => {
      n++;
      tear.set(n / 40);
      if (n % 6 === 0) b.vfx.ring(sky, 3 + (n / 6) * 0.6, PURPLE, 0.6, new V3(0, -1, 0));
      if (n % 14 === 0) b.vfx.skyBolt(at(b, 'black').add(new V3(U.rand(-6, 6), 0, U.rand(-4, 4))), 24, 0xc89aff);
      if (n % 10 === 0) b.vfx.flash(sky, 4, PURPLE, 0.2, SL.Toon.tex.glow);
      return n >= 90;
    };
    // a man with Goku's face steps down out of it
    bk.setHidden(false);
    const ground = at(b, 'black');
    bk.setState('scripted', { pose: 'gb_idle', expression: 'calm' });
    n = 0;
    yield () => {
      n++;
      const k = U.easeInOutCubic(Math.min(1, n / 70));
      bk.setPosition(sky.clone().lerp(ground, k));
      bk.vel.set(0, 0, 0);
      return n >= 70;
    };
    bk.grounded = true;
    tear.dispose();
    K.faceTo(bk, tr.pos);
    b.vfx.dust(ground.clone(), 2, 12);
    // the reveal (Roadmap Three, the owner's Gemini research, BLK-S01): low in front of him, a slow tilt up from his
    // boots to the face — Goku's face, cold
    const bf = new V3(Math.sin(bk.yaw), 0, Math.cos(bk.yaw));
    m.shot((t, o, el) => {
      const k = U.easeInOutCubic(Math.min(1, el / 1.8));
      o.pos.copy(bk.pos).addScaledVector(bf, 2.4).add(new V3(bf.z * 0.6, 0.25, -bf.x * 0.6));
      o.look.copy(bk.pos).add(new V3(0, U.lerp(0.25, bk.height * 0.92, k), 0));
      o.fov = 40;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    yield* st.wait(0.9);
    // ...and as the lens reaches the face, he sets the Potara in his left ear straight (BLK-S01, research draft)
    bk.setState('scripted', { pose: 'gb_earTouch', expression: 'calm', speed: 6 });
    m.flags.earTouch = true;
    yield* st.wait(1.3);
    bk.setState('scripted', { pose: 'gb_idle', expression: 'calm', speed: 5 });
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'low' }, 999);
    m.say('goku_black', 'Still hiding in the rubble, Trunks? Mortals cling to life so stubbornly.', 3.4);
    yield* st.wait(3.4);
    // the hand study (BLK-S02): a still, close frame — the stolen hand closing and opening before his eyes
    bk.setState('scripted', { pose: 'gb_handStudy', expression: 'calm', speed: 4 });
    m.shot((t, o) => {
      const h = bk.handPos('R'), hd = bk.headPos();
      o.pos.copy(h.clone().lerp(hd, 0.5)).addScaledVector(bf, 1.3).add(new V3(-bf.z * 0.5, 0.05, bf.x * 0.5));
      o.look.copy(h.clone().lerp(hd, 0.45));
      o.fov = 34;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.flags.handStudy = true;
    yield* st.wait(2.4);
    // the blade grows out of his hand
    bk.setState('scripted', { pose: 'gb_bladeW', expression: 'smirk', speed: 6 });
    n = 0;
    yield () => {
      n++;
      blade(bk, Math.min(1, n / 30));
      if (n % 4 === 0) b.vfx.flash(bk.handPos('R'), 0.8, 0xff5ac8, 0.1, SL.Toon.tex.glow);
      return n >= 36;
    };
    b.sfx('swordDraw', bk, { vol: 0.9 });
    shot(m, { black: bk }, { subject: 'black', focus: 'closeup', angle: 'three' }, 999);
    m.say('goku_black', 'Every wound you give me only sharpens me. Come — make me stronger.', 3.6, { style: 'quiet' });
    yield* st.wait(3.6);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'low' }, 999);
    K.toForm(tr, 'ssj');
    b.vfx.flash(tr.chest(), 2.2, 0xffe060, 0.3, SL.Toon.tex.glow);
    b.sfx('transformBurst', tr, { vol: 0.8 });
    K.pose(tr, 'ft_ready', 'angry', 8);
    m.say('future_trunks', 'Then I won\'t give you the chance!', 2.4, { style: 'shout' });
    yield* st.wait(2.4);
    m.endShot();
    b.skipRequested = false;
  } };

  P.hold = { id: 'hold', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, bk = S.black;
    stage(m);
    K.toForm(tr, 'ssj');
    K.toForm(bk, 'base');
    bk.setHidden(false);
    bk.untargetable = bk.intangible = tr.untargetable = tr.intangible = false;
    blade(bk, 0);
    if (tr.pos.distanceTo(bk.pos) < 5) K.place(bk, at(b, 'black'), Math.PI);
    tr.hp = tr.hpMax;
    bk.hp = bk.hpMax;
    tr.cannotDie = true;
    bk.cannotDie = true;
    tr.controller = tr._playerController || (tr._playerController = new SL.PlayerController(b));
    b.switchPlayer(tr, { force: true, quiet: true });
    tr.target = bk;
    bk.target = tr;
    bk.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, bk.def.ai, { aggression: 0.75, defense: 0.7, transformHp: 0 }) });
    tr.setState('free');
    bk.setState('free');
    m.title(CHAPTER, 'THE DARK GOKU', 'Future Trunks vs Goku Black', 2.4);
    m.objective('hold', 'Hold him off — drive him to one knee, or last as long as you can', { icon: 'fist' });
    m.music('zamasu_theme', 4);
    const sf = m.storyFight({
      floors: [{ f: bk, at: TU.blackFloor }], dealt: [{ f: bk, mul: TU.blackDealt }], taken: [{ f: bk, mul: TU.blackTaken }],
      fighters: [tr, bk], space: 'ground',
    });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => sf.floored(bk) || tr.hpFrac < TU.trunksFloor || m.state !== 'running';
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    m.flags.drovehim = sf.floored(bk);
    m.qteParts.push(m.flags.drovehim ? 1 : 0.5);
    m.complete('hold');
  } };

  P.escape = { id: 'escape', run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    tr.controller = K.scripted();
    bk.controller = K.scripted();
    K.toForm(tr, 'ssj');
    K.place(tr, K.ground(b, tr.pos.clone()), 0);
    if (tr.pos.distanceTo(bk.pos) < 4 || tr.pos.distanceTo(bk.pos) > 14) K.place(bk, K.ground(b, tr.pos.clone().add(new V3(0, 0, 8))), Math.PI);
    K.faceTo(tr, bk.pos);
    K.faceTo(bk, tr.pos);
    blade(bk, 1);
    K.pose(tr, 'ft_ready', 'hurt', 6);
    K.pose(bk, 'gb_bladeW', 'smirk', 6);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.say('goku_black', m.flags.drovehim ? 'You drew my blood... Splendid. Then this will hurt all the more.' : 'Is this all the hope your world has left?', 3.2);
    yield* st.wait(3.2);
    // the lunge: the blade, the guard, the sword knocked back
    K.pose(bk, 'gb_thrust', 'angry', 20);
    b.vfx.slash(bk.handPos('R'), tr.chest(), 0xff5ac8, 0.25, 0.12);
    b.vfx.impact(tr.chest(), 3, 0xff8ad8);
    b.sfx('swordClang', tr, { vol: 1 });
    b.cameraTraumaAt(tr.chest(), 0.4);
    K.pose(tr, 'ft_slip', 'hurt', 12);
    yield* st.wait(0.8);
    // the Time Machine, behind him, and the last of the fuel
    S.machine = K.timeMachine(b, at(b, 'machine'));
    m.onDispose(() => K.propGone(b, S.machine));
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'front' }, 999);
    m.say('future_trunks', 'There is still one place you can\'t reach... not yet.', 3, { style: 'quiet' });
    yield* st.wait(3);
    shot(m, { black: bk }, { subject: 'black', focus: 'closeup', angle: 'low' }, 999);
    m.say('goku_black', 'Run to the past if you like. Time itself will not hide you from me.', 3.2, { style: 'quiet' });
    yield* st.wait(3.2);
    // gone: the flash, the machine, nothing
    SL.ScreenFX.flash(0.5, '#e8f4ff');
    b.sfx('timeWarp', tr, { vol: 1.1 });
    tr.setHidden(true);
    K.propGone(b, S.machine);
    shot(m, { black: bk }, { subject: 'black', focus: 'wide', angle: 'low', room: 8 }, 999);
    blade(bk, 0);
    K.pose(bk, 'gb_idle', 'calm', 4);
    yield* st.wait(2.2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'THE DARK GOKU', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.ftBlack = { TU };
  SL.data.missions.ft_black = {
    id: 'ft_black', canon: true, chapter: CHAPTER, title: 'The Dark Goku', character: 'future_trunks', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · a man with Goku\'s face', parTime: 300, qteLabel: 'Holding him off',
    blurb: 'In Trunks\' ruined future, someone with Goku\'s face and a blade of ki is hunting what is left of humanity. Hold him off long enough to reach the Time Machine.',
    appearance: { future_trunks: { outfit: 'ft_super' } },
    lockForms: {
      future_trunks: SL.data.characters.future_trunks.forms.filter((x) => !['base', 'ssj'].includes(x.id)).map((x) => x.id),
      goku_black: ['rose'],
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Trunks escapes to the past'],
    setup,
    phases: [P.arrive, P.hold, P.escape],
  };
})();
