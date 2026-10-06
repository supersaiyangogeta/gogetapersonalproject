/*
 * WHAT IF · CHAPTER 3 — "What if Future Trunks arrived early?"   (NOT CANON)
 *
 * Branches from "Nappa Attacks". In the story you know, Trunks comes back from the future a year
 * later, to kill Frieza. Here the Time Machine overshoots into the middle of the Saiyans' battle:
 * Nappa is standing over Gohan when a capsule falls out of the sky between them.
 *
 *   ARRIVE   (scene)      Nappa over Gohan; a light; the Time Machine; a sword-hand stopping a giant's
 *                         fist; Vegeta's scouter climbing; Trunks seeing his dead master as a child
 *   NAPPA    (checkpoint) played as Trunks, base form: Nappa's blows do nothing (the gap, shown); drive
 *                         him to his knees — and Vegeta does what Vegeta does to a Saiyan who lost
 *   VEGETA   (checkpoint) played as Trunks against the father he never knew: beat him, but do not
 *                         finish him. When Vegeta goes up for the Galick Gun — SUPER SAIYAN (Trunks'
 *                         own transformation), and one button: slap the beam away
 *   AFTER    (scene)      Vegeta flees; the warning, three years early; the Time Machine leaves
 *
 * Alternate team, alternate enemy order, alternate transformation (gold, in the Saiyan Saga), an
 * alternate ending. Saved on the What-If track; canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;

  const ARENA = new V3(0, 0, 0);
  const at = (b, x, z, lift = 0) => K.ground(b, new V3(x, 0, z), lift);
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });

  function setup(battle) {
    const b = battle;
    K.clearArea(b, ARENA, 42);
    const nappa = b.spawn({ charId: 'nappa', team: 1, pos: at(b, 0, -6), tags: { boss: true, priority: true } });
    const vegeta = b.spawn({ charId: 'vegeta', team: 1, pos: at(b, -24, -30), startKi: 100 });
    const trunks = b.spawn({ charId: 'future_trunks', player: true, team: 0, pos: at(b, 0, 40), startKi: 100 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: at(b, 0, 9) });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: at(b, -4, 13) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(b, 5, 12) });
    for (const f of [nappa, vegeta, gohan, krillin, piccolo]) {
      f.controller = K.scripted();
      f.cannotDie = true;
    }
    for (const f of [gohan, krillin, piccolo]) f.untargetable = f.intangible = true;
    trunks.setHidden(true);
    trunks.cannotDie = true;
    K.faceTo(nappa, gohan.pos);
    for (const f of [gohan, krillin, piccolo]) K.faceTo(f, nappa.pos);
    K.faceTo(vegeta, ARENA);
    b.story = { nappa, vegeta, trunks, gohan, krillin, piccolo, ship: null };
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.music('ominous', 1);
      K.pose(S.nappa, 'n_laugh', 'grin', 3);
      K.pose(S.gohan, 'kg_scared', 'shock', 3);
      K.pose(S.piccolo, 'stagger', 'grit', 2);
      K.pose(S.krillin, 'idle', 'shock', 2);
      K.pose(S.vegeta, 'armsCrossed', 'smirk', 2);
      shot(m, { nappa: S.nappa, gohan: S.gohan }, { subject: 'nappa', with: 'gohan', focus: 'full' }, 3.6);
      m.say('nappa', 'The kid first. Then the green one. Then the little bald one.', 3.2);
      yield* m.cine(3.4);
      shot(m, { gohan: S.gohan }, { subject: 'gohan', focus: 'closeup', angle: 'front' }, 2);
      yield* m.cine(1.6);
      // the light, and something falling out of it
      K.pose(S.nappa, 'hammerWind', 'angry', 8);
      SL.ScreenFX.flash(0.7, '#e8f4ff');
      b.sfx('timeWarp', S.gohan, { vol: 1.2 });
      const landAt = at(b, 0, 2);
      S.ship = K.timeMachine(b, landAt.clone().add(new V3(0, 9, 0)));
      m.onDispose(() => K.propGone(b, S.ship));
      let k = 0;
      const fall = () => {
        k = Math.min(1, k + 1 / 50);
        S.ship.pos.copy(landAt).add(new V3(0, 9 * (1 - U.easeOutCubic(k)), 0));
        S.ship.group.position.copy(S.ship.pos);
      };
      m.tickHooks.push(fall);
      shot(m, { gohan: S.gohan }, { subject: 'gohan', focus: 'wide', angle: 'low', room: 7 }, 1.8);
      yield* m.cine(1.8);
      K.removeHook(m, fall);
      b.vfx.dust(landAt.clone(), 4, 18);
      b.cameraTraumaAt(landAt, 0.4);
      // the canopy, and a sword-hand catching the fist that was coming down
      if (S.ship.data.open) S.ship.data.open(1);
      const tr = S.trunks;
      tr.setHidden(false);
      K.place(tr, at(b, 0, 0.6), Math.PI);
      K.faceTo(tr, S.nappa.pos);
      K.place(S.nappa, at(b, 0, -1.6), 0);
      K.faceTo(S.nappa, tr.pos);
      K.pose(tr, 'ft_catchBlade', 'calm', 10);
      K.pose(S.nappa, 'hammer', 'angry', 10);
      b.sfx('punchHeavy', tr, { pitch: 0.7, vol: 1.3 });
      b.vfx.impact(tr.handPos('R'), 2, 0xfff0c0);
      b.cameraTraumaAt(tr.chest(), 0.35);
      shot(m, { trunks: tr, nappa: S.nappa }, { subject: 'trunks', with: 'nappa', focus: 'upper' }, 2.4);
      m.say('nappa', 'Huh?!', 1.2, { style: 'shout' });
      yield* m.cine(1.4);
      shot(m, { trunks: tr }, { subject: 'trunks', focus: 'closeup', angle: 'three' }, 2);
      m.say('future_trunks', 'That\'s enough.', 1.8, { style: 'quiet' });
      yield* m.cine(2);
      // across the field: the scouter
      K.pose(S.vegeta, 'armsCrossed', 'shock', 4);
      b.sfx('scouter', S.vegeta);
      shot(m, { vegeta: S.vegeta }, { subject: 'vegeta', focus: 'closeup', angle: 'three' }, 3);
      m.say('vegeta', 'His power level... it keeps climbing?! Who IS that?!', 2.8, { style: 'shout' });
      yield* m.cine(3);
      // and the boy behind him
      K.faceTo(tr, S.gohan.pos);
      K.pose(tr, 'ft_calm', 'soft', 3);
      K.pose(S.gohan, 'kg_lookUp', 'shock', 3);
      shot(m, { trunks: tr, gohan: S.gohan }, { subject: 'trunks', with: 'gohan', focus: 'upper' }, 3.4);
      m.say('future_trunks', '...Gohan. So this is what you looked like.', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      shot(m, { gohan: S.gohan }, { subject: 'gohan', focus: 'closeup', angle: 'front' }, 2.2);
      m.say('kid_gohan', 'H-how do you know my name?', 2, { style: 'quiet' });
      yield* m.cine(2.2);
      K.faceTo(tr, S.nappa.pos);
      K.pose(tr, 'ft_ready', 'angry', 6);
      shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'low' }, 2);
      m.say('future_trunks', 'Stay back. I\'ll take it from here.', 2, { style: 'quiet' });
      yield* m.cine(2.1);
      m.endShot();
    },
  };

  P.nappa = {
    id: 'nappa',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, tr = S.trunks, n = S.nappa;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      tr.setHidden(false);
      if (!S.ship) {
        S.ship = K.timeMachine(b, at(b, 0, 2));
        m.onDispose(() => K.propGone(b, S.ship));
      }
      K.place(tr, at(b, 0, 0), Math.PI);
      K.place(n, at(b, 0, -6), 0);
      K.faceTo(tr, n.pos);
      K.faceTo(n, tr.pos);
      for (const f of [S.gohan, S.krillin, S.piccolo]) K.pose(f, 'idle', 'shock', 2);
      K.pose(S.vegeta, 'armsCrossed', 'calm', 2);
      if (b.player !== tr) b.switchPlayer(tr, { force: true });
      n.controller = cpu(b);
      n.target = tr;
      tr.target = n;
      tr.lockedForms = Object.assign({}, tr.lockedForms, { ssj: true });
      // the gap, shown: his fists bounce off a boy from the future
      m.powerGap(tr, {
        from: [n],
        mul: 0.05,
        lines: [
          { at: 2, who: 'nappa', line: 'What?! I hit him square!', duration: 2 },
          { at: 5, who: 'nappa', line: 'Stand still and DIE!', duration: 1.8, style: 'shout' },
        ],
      });
      const sf = m.storyFight({ floors: [{ f: n, at: 0.2 }], fighters: [tr, n] });
      tr.setState('free');
      n.setState('free');
      m.music('intense', 2);
      m.objective('nappa', 'Drive Nappa to his knees', { icon: 'fist' });
      m.prompt('wtSword', 'heavy', 'Heavy: the sword', { always: true, until: () => n.hpFrac < 0.8 });
      m.lock(false);
      b.aiLocked = false;
      yield () => sf.floored(n) || m.state !== 'running';
      if (m.state !== 'running') return;
      m.complete('nappa');
      // the prince, cleaning up
      m.lock(true);
      K.clearCombat(b);
      K.pose(n, 'n_winded', 'hurt', 3);
      K.pose(tr, 'ft_ready', 'calm', 3);
      shot(m, { nappa: n }, { subject: 'nappa', focus: 'upper', angle: 'three' }, 2.4);
      m.say('nappa', 'V-Vegeta! Help me up — this one\'s a monster!', 2.4, { style: 'shout' });
      yield* m.cine(2.6);
      K.place(S.vegeta, n.pos.clone().add(new V3(-1.6, 0, -1.2)), 0);
      K.faceTo(S.vegeta, n.pos);
      K.pose(S.vegeta, 'idle', 'smirk', 3);
      shot(m, { vegeta: S.vegeta, nappa: n }, { subject: 'vegeta', with: 'nappa', focus: 'upper' }, 3.2);
      m.say('vegeta', 'A Saiyan who loses to a child is of no use to me, Nappa.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      K.pose(S.vegeta, 'blastR', 'wicked', 10);
      b.vfx.flash(n.chest(), 4, 0xffe0a0, 0.4, SL.Toon.tex.glow);
      b.vfx.explosion(n.chest(), 2.2, 0xffb060, { smoke: true });
      b.sfx('explosionBig', n);
      b.cameraTraumaAt(n.chest(), 0.5);
      n.setHidden(true);
      n.untargetable = n.intangible = true;
      shot(m, { trunks: tr }, { subject: 'trunks', focus: 'closeup', angle: 'front' }, 2.6);
      m.say('future_trunks', '...You haven\'t changed at all. Father.', 2.6, { style: 'quiet' });
      yield* m.cine(2.8);
      shot(m, { vegeta: S.vegeta }, { subject: 'vegeta', focus: 'closeup', angle: 'three' }, 2.2);
      m.say('vegeta', 'What did you just say?', 2, { style: 'quiet' });
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  P.vegeta = {
    id: 'vegeta',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, tr = S.trunks, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      S.nappa.setHidden(true);
      S.nappa.untargetable = S.nappa.intangible = true;
      tr.setHidden(false);
      if (b.player !== tr) b.switchPlayer(tr, { force: true });
      K.place(tr, at(b, 0, 2), Math.PI);
      K.place(v, at(b, 0, -7), 0);
      K.faceTo(tr, v.pos);
      K.faceTo(v, tr.pos);
      tr.lockedForms = Object.assign({}, tr.lockedForms, { ssj: true });
      v.untargetable = v.intangible = false;
      v.controller = cpu(b);
      v.target = tr;
      tr.target = v;
      m.powerGap(tr, { from: [v], mul: 0.3, lines: [{ at: 3, who: 'vegeta', line: 'Why won\'t you go DOWN?!', duration: 2, style: 'shout' }] });
      const sf = m.storyFight({ floors: [{ f: v, at: 0.35 }], fighters: [tr, v] });
      tr.setState('free');
      v.setState('free');
      m.music('vegeta_theme', 2);
      m.objective('father', 'Beat your father — and don\'t finish him', { icon: 'fist' });
      m.objective('clean', 'Keep your health above half', { icon: 'guard', optional: true });
      let clean = true;
      const offD = b.on('damage', (e) => {
        if (e.target === tr && tr.hpFrac < 0.5 && clean) {
          clean = false;
          m.failObjective('clean');
        }
      });
      m.onDispose(offD);
      m.lock(false);
      b.aiLocked = false;
      yield () => sf.floored(v) || m.state !== 'running';
      offD();
      if (m.state !== 'running') return;
      m.complete('father');
      if (clean) m.complete('clean');
      // he will not lose to a boy: up into the sky for the Galick Gun
      m.lock(true);
      K.clearCombat(b);
      K.place(v, at(b, 0, -14, 9), 0);
      v.grounded = false;
      K.faceTo(v, tr.pos);
      K.pose(v, 'v_galickCharge', 'angry', 6);
      b.sfx('beamCharge', v, { pitch: 0.8 });
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 3);
      m.say('vegeta', 'I will NOT be humiliated by some nameless brat! Disappear — along with this whole planet!', 3.2, { style: 'shout' });
      yield* m.cine(3.2);
      shot(m, { trunks: tr }, { subject: 'trunks', focus: 'closeup', angle: 'front' }, 2.4);
      m.say('future_trunks', '...Then let me show you what you\'re going to become.', 2.6, { style: 'quiet' });
      yield* m.cine(2.6);
      // the gold, in the Saiyan Saga (his own transformation; the story locks it here, the branch gives it)
      m.teach(tr, 'form:ssj');
      yield* K.transform(m, {
        fighter: tr,
        watchers: [
          { f: v, line: 'G-gold hair... green eyes... a SUPER SAIYAN?! The legend... is HIM?!', seconds: 3.2, face: 'shock', pose: 'v_galickCharge', style: 'shout' },
          { f: S.gohan, line: 'His hair... it\'s gold!', seconds: 2, face: 'shock', pose: 'kg_lookUp' },
        ],
      });
      // the Galick Gun comes anyway: one button — slap it away
      K.pose(v, 'v_galickFire', 'shout', 12);
      m.say('vegeta', 'GALICK... GUN!!', 1.6, { style: 'shout' });
      tr.intangible = true;
      const spec = Object.assign({}, v.def.specials.special1, { sustain: 200 });
      const beam = b.projectiles.spawnBeam(v, spec, 1);
      const ctx = { b, beam, beamVictim: tr };
      const pin = () => SL.Cinema.pinBeam(ctx, 0xe8c0ff);
      m.tickHooks.push(pin);
      shot(m, { trunks: tr, vegeta: v }, { subject: 'trunks', with: 'vegeta', focus: 'full' }, 30);
      K.pose(tr, 'ft_ready', 'angry', 6);
      yield* m.cine(0.8);
      const res = yield* m.cue('guard', 'Slap it away', { slow: 0.4, auto: 5 });
      K.removeHook(m, pin);
      K.pose(tr, 'ft_palm', 'angry', 14);
      b.sfx('guardBreak', tr, { pitch: 0.7, vol: 1.3 });
      if (!beam.done) beam.dispose();
      // the beam goes off into the mountains
      const away = at(b, 60, -60, 6);
      b.vfx.flash(tr.handPos('R'), 3, 0xe8c0ff, 0.3, SL.Toon.tex.glow);
      b.vfx.explosion(away, 9, 0xd090ff, { smoke: true });
      b.sfx('explosionHuge', null, { at: away });
      b.cameraTraumaAt(tr.chest(), 0.7);
      tr.intangible = false;
      m.qteParts.push(res.pressed ? 1 : 0.5);
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'face', angle: 'front' }, 2.4);
      K.pose(v, 'idle', 'shock', 3);
      m.say('vegeta', '...With ONE HAND?', 2.2, { style: 'quiet' });
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, tr = S.trunks, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // the prince runs — for the first time in his life
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 2.6);
      m.say('vegeta', 'This isn\'t over! Whoever you are — I\'ll be back, and I\'ll be stronger!', 3, { style: 'shout' });
      yield* m.cine(2.6);
      m.space(v, 'flight', { to: v.pos.clone().add(new V3(-40, 30, -60)), seconds: 1.6, pose: 'flyForward' });
      b.vfx.trail(v.chest(), 0xa0c8ff, 1, 0.6);
      yield* m.cine(1.6);
      v.setHidden(true);
      // the boy from the future, powering down; the three of them
      tr.applyForm(0);
      K.sheathe(tr, true);
      K.place(tr, at(b, 0, 6), Math.PI);
      K.faceTo(tr, S.gohan.pos);
      K.pose(tr, 'ft_calm', 'soft', 3);
      K.pose(S.piccolo, 'idle', 'calm', 2);
      K.faceTo(S.piccolo, tr.pos);
      shot(m, { piccolo: S.piccolo }, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 2.6);
      m.say('piccolo', 'Who are you, really? Nobody your age is that strong.', 2.6);
      yield* m.cine(2.8);
      shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'front' }, 6.4);
      m.say('future_trunks', 'I can\'t say. Not yet. When Goku gets here, tell him this: in three years, two monsters will come. Androids. He has to be ready.', 6, { style: 'quiet' });
      yield* m.cine(6.4);
      shot(m, { gohan: S.gohan, trunks: tr }, { subject: 'gohan', with: 'trunks', focus: 'upper' }, 2.6);
      m.say('kid_gohan', 'Will we see you again?', 2.2);
      yield* m.cine(2.4);
      shot(m, { trunks: tr }, { subject: 'trunks', focus: 'closeup', angle: 'three' }, 2.4);
      K.pose(tr, 'ft_calm', 'smirk', 3);
      m.say('future_trunks', 'Sooner than you think... Master.', 2.2, { style: 'quiet' });
      yield* m.cine(2.4);
      // the Time Machine, the light, gone
      SL.ScreenFX.flash(0.6, '#e8f4ff');
      b.sfx('timeWarp', tr, { vol: 1.2 });
      tr.setHidden(true);
      if (S.ship) K.propGone(b, S.ship);
      shot(m, { gohan: S.gohan }, { subject: 'gohan', focus: 'wide', angle: 'low', room: 6 }, 2.4);
      yield* m.cine(2.4);
      m.endShot();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title('WHAT IF...?', 'THE STRANGER CAME EARLY', 'Nappa falls to a boy from the future · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_trunks',
    whatIf: true,
    branchOf: 'saiyan_nappa',
    branchPoint: 'nappa',
    chapter: 'WHAT IF · CHAPTER 3',
    title: 'What if Future Trunks arrived early?',
    subtitle: 'Earth · Age 762 · Alternate timeline',
    character: 'future_trunks',
    stage: 'wasteland',
    parTime: 300,
    qteLabel: 'The Galick Gun',
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The Time Machine overshoots by a year and lands between Nappa and Gohan. A boy from the future against the Saiyan invaders — and against the father he never knew.',
    rewards: ['An alternate Saiyan Saga', 'Future Trunks against Nappa and Vegeta', 'Super Saiyan, a year early'],
    setup,
    phases: [P.arrive, P.nappa, P.vegeta, P.after],
  };

  SL.data.missions[def.id] = def;
})();
