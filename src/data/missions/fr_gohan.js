/*
 * MOVIE: FUSION REBORN (not canon) — mission 3 of 7: "Son of Goku"   (Earth, while Goku fights in the
 * Other World — opens with "The Dictator" once "Janemba" is cleared; play them in either order)
 *
 *   OPEN      (scene fr_earth_open)   the sky over Satan City tears; the dead come through it with halos over
 *                                     their heads; Videl and Gohan ("better than doin' dishes")
 *   MEET      (scene fr_frieza_meet)  FRIEZA, dead, back, and he does not recognise the boy from Namek —
 *                                     "I am son of Goku, guardian of all that is good. Gohan!"
 *   SOLDIERS * (play)                 GOHAN, with Videl beside him, through Frieza's escaped soldiers — they
 *                                     are nothing to him now. Keep the people in the street safe.
 *   FRIEZA *  (play)                  Frieza himself: his blows do nothing to this Gohan (a power gap you can
 *                                     feel), Gohan's hurt. When he breaks — ONE PUNCH (a cue), and ONE BLAST
 *                                     (a cue) sends him back where he came from.
 *   AFTER     (scene fr_frieza_end)   "Something big is going on in the Other World."
 *
 * Short on purpose: a demonstration of what Gohan is in this period, not a long Frieza fight.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;

  const GH = { soldiers: 8, civilians: 4, floor: 0.4, gap: 0.05 };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  function setup(battle) {
    const b = battle;
    const at = (x, z) => FR.at(b, x, z);
    const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: at(-1.4, 10), startKi: 100 });
    const videl = b.spawn({ charId: 'videl', team: 0, pos: at(1.6, 10.5), startKi: 80 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at(0, -10), startKi: 100 });
    K.toForm(frieza, 'final');
    frieza.lockedSlots = { transform: true };
    const soldiers = [];
    for (let i = 0; i < GH.soldiers; i++) {
      const a = (i / GH.soldiers) * Math.PI - Math.PI;
      soldiers.push(b.spawn({ charId: 'frieza_soldier', team: 1, pos: at(Math.cos(a) * 12, -6 + Math.sin(a) * 6), startKi: 40, damageDealtMul: 0.4 }));
    }
    const civilians = [];
    for (let i = 0; i < GH.civilians; i++) civilians.push(b.spawn({ charId: 'civilian', team: 0, pos: at(-14 + i * 9, 16 + (i % 2) * 3), startKi: 0 }));
    for (const f of [videl, frieza, ...soldiers, ...civilians]) K.watcher(f, 'idle', 'calm');
    for (const c of civilians) K.watcher(c, 'cv_cower', 'shock');
    K.watcher(frieza, 'idle', 'smirk');
    frieza.setHidden(true);
    for (const f of [frieza, ...soldiers]) FR.halo(b, f);
    K.faceTo(gohan, frieza.pos);
    K.faceTo(videl, frieza.pos);
    b.story = { gohan, videl, frieza, soldiers, civilians, rift: null };
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      // the dead come through: soldiers dropping out of the rift, people running
      for (const s of S.soldiers) s.setHidden(true);
      yield* SL.Cinema.play(m, 'fr_earth_open');
      for (const [i, s] of S.soldiers.entries()) {
        s.setHidden(false);
        b.vfx.flash(s.chest(), 2.4, 0xd24aff, 0.3, SL.Toon.tex.glow);
        if (i % 3 === 0) b.sfx('portalOpen', s, { vol: 0.5 });
      }
      yield* SL.Cinema.play(m, 'fr_frieza_meet');
      m.flags.frSoldiers = S.soldiers;
    },
  };

  P.soldiers = {
    id: 'soldiers',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      S.frieza.setHidden(false);
      K.watcher(S.frieza, 'armsCrossed', 'smirk');
      for (const s of S.soldiers) {
        if (!s.alive) continue;
        s.setHidden(false);
        s.untargetable = false;
        s.intangible = false;
        s.controller = cpu(b);
        s.setState('free');
      }
      b.switchPlayer(S.gohan, { force: true });
      b.setParty([S.gohan], {});
      S.videl.untargetable = false;
      S.videl.intangible = false;
      S.videl.controller = cpu(b, { difficulty: 'normal' });
      S.videl.storyAllyMul = 1.6;
      S.videl.setState('free');
      S.gohan.setState('free');
      // the soldiers are nothing to him now
      S.gohan.damageTakenMul = 0.35;
      m.music('battle', 2);
      m.objective('soldiers', 'Defeat Frieza\'s soldiers', { icon: 'fist', target: S.soldiers.length });
      m.objective('people', 'Keep the people in the street safe', { icon: 'guard', optional: true });
      m.objective('videl', 'Keep Videl standing', { icon: 'guard', optional: true });
      const offD = b.on('ko', (e) => {
        if (S.civilians.includes(e.fighter)) m.failObjective('people');
        if (e.fighter === S.videl) m.failObjective('videl');
      });
      m.onDispose(offD);
      for (const c of S.civilians) c.cannotDie = false;
      S.videl.cannotDie = true;
      m.lock(false);
      b.aiLocked = false;
      let lineDone = false;
      yield () => {
        const down = S.soldiers.filter((s) => !s.alive).length;
        m.progress('soldiers', down);
        if (!lineDone && down >= 4) {
          lineDone = true;
          m.say('frieza', 'Useless! Every one of them!', 2);
        }
        return down >= S.soldiers.length || m.state !== 'running';
      };
      offD();
      if (m.state !== 'running') return;
      m.complete('soldiers');
      if (!m.objectives.find((o) => o.id === 'people').failed) m.complete('people');
      if (!m.objectives.find((o) => o.id === 'videl').failed) m.complete('videl');
      S.gohan.damageTakenMul = 1;
      m.lock(true);
      K.clearCombat(b);
    },
  };

  P.frieza = {
    id: 'frieza',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      for (const s of S.soldiers) if (s.alive) s.setHidden(true);
      fz.setHidden(false);
      K.place(fz, FR.at(b, gh.pos.x, gh.pos.z - 8), 0);
      K.faceTo(fz, gh.pos);
      K.faceTo(gh, fz.pos);
      K.watcher(S.videl, 'idle', 'determined');
      fz.untargetable = false;
      fz.intangible = false;
      fz.cannotDie = true;
      fz.hp = fz.hpMax;
      fz.controller = cpu(b);
      fz.target = gh;
      gh.target = fz;
      b.switchPlayer(gh, { force: true });
      gh.setState('free');
      fz.setState('free');
      // his blows do nothing to this Gohan
      m.powerGap(gh, { from: [fz], mul: GH.gap, beams: true, lines: [{ at: 3, who: 'frieza', line: 'What...?! Why won\'t you FALL?', duration: 2.2, style: 'shout' }] });
      const fight = m.storyFight({ floors: [{ f: fz, at: GH.floor }] });
      m.music('frieza_theme', 2);
      m.objective('frieza', 'Show Frieza who he is dealing with', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      yield () => fight.floored(fz) || m.state !== 'running';
      if (m.state !== 'running') return;
      m.complete('frieza');
      // ONE PUNCH
      m.lock(true);
      K.clearCombat(b);
      fz.controller = K.scripted();
      fz.setState('scripted', { pose: 'idle', expression: 'angry' });
      K.place(gh, FR.at(b, fz.pos.x + fz.forward.x * 2.2, fz.pos.z + fz.forward.z * 2.2), 0);
      K.faceTo(gh, fz.pos);
      gh.setState('scripted', { pose: 'idle', expression: 'serious' });
      SL.Cinema.shotOn(m, { gohan: gh, frieza: fz }, { subject: 'gohan', with: 'frieza', focus: 'medium' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cue('heavy', 'One punch', { auto: 5, slow: 0.35 });
      gh.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 40 });
      fz.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 30 });
      b.vfx.impact(fz.chest(), 5, 0xffffff);
      b.vfx.ring(fz.chest(), 4, 0xffe8a0, 0.4);
      b.sfx('punchHeavy', fz, { pitch: 0.6, vol: 1.3 });
      b.cameraTraumaAt(fz.chest(), 0.7);
      b.slowmo(0.25, 0.7);
      yield* m.cine(1);
      // ...and one blast
      gh.setState('scripted', { pose: 'blastR', expression: 'determined', speed: 20 });
      SL.Cinema.shotOn(m, { gohan: gh }, { subject: 'gohan', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cue('blast', 'Send him back', { auto: 5 });
      b.vfx.trail(gh.handPos('R'), 0xfff0b0, 0.8, 0.4);
      m.endShot();
      yield* SL.Cinema.play(m, 'fr_frieza_end');
      for (const s of S.soldiers) s.setHidden(true);
      m.qteParts.push(1);
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(FR.CHAPTER, 'SON OF GOKU', 'Meanwhile, Goku is losing in the Other World · ' + m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'fr_gohan',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'Son of Goku',
    subtitle: 'Satan City · not canon',
    character: 'adult_gohan',
    stage: 'satan_city',
    parTime: 300,
    lockForms: FR.LOCKS,
    qteLabel: 'One punch',
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The dead are walking out of the sky, and one of them is Frieza. He does not recognise the boy he fought on Namek. He will.',
    rewards: ['Movie: Earth\'s Chaos'],
    setup,
    phases: [P.open, P.soldiers, P.frieza, P.after],
  };

  SL.data.frGohan = { GH };
  SL.data.missions[def.id] = def;
})();
