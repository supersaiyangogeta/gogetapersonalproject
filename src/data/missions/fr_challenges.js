/*
 * MOVIE: FUSION REBORN — CHALLENGES (optional replays, apart from the film; story.js movies[].challenges).
 * Each opens after the film mission it borrows from. Same stages, characters and systems as the film.
 *
 *   fr_x_fat    FAT JANEMBA, ALL THE WAY: Super Saiyan 3 Goku against the child at "hard", no story beat
 *               to stop it — read the doors, go round him, finish it
 *   fr_x_earth  EARTH INVASION: Gohan and Videl hold a street for 90 seconds while the dead keep coming
 *               through the rift (Frieza's soldiers and the Dictator's riflemen)
 *   fr_x_dance  THE PERFECT DANCE: three flawless Fusion Dances in a row, with a narrower window
 *   fr_x_super  SUPER JANEMBA, NO FUSION: Goku and Vegeta (switch) against him with no power gap — beatable,
 *               barely. He still punishes the predictable.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;
  const cpu = (b, difficulty) => new SL.AIController(b, { difficulty: difficulty || 'hard' });
  const base = { movie: 'fusion_reborn', challenge: true, chapter: 'CHALLENGE · FUSION REBORN', lockForms: FR.LOCKS, rules: { allowTransform: true, allowUltimates: true } };

  /* ------------------------------------------------------------ Fat Janemba, all the way */
  SL.data.missions.fr_x_fat = Object.assign({}, base, {
    id: 'fr_x_fat',
    title: 'Challenge: Fat Janemba',
    subtitle: 'Super Saiyan 3 Goku · hard',
    character: 'goku',
    stage: 'other_world',
    parTime: 240,
    blurb: 'The child at full strength and nothing in the story to stop the fight early. Read the portal, go round him, finish it.',
    rewards: ['Challenge clear'],
    setup(b) {
      FR.warped(b);
      const field = FR.lm(b, 'field');
      const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: FR.at(b, field.x, field.z + 7), startKi: 100 });
      const jb = b.spawn({ charId: 'janemba', team: 1, pos: FR.at(b, field.x, field.z - 5), startKi: 100 });
      K.toForm(goku, 'ssj3');
      K.faceTo(goku, jb.pos);
      K.faceTo(jb, goku.pos);
      FR.halo(b, goku);
      b.story = { goku, janemba: jb };
    },
    phases: [
      {
        id: 'fight',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, S = b.story;
          m.lock(true);
          FR.warped(b);
          S.janemba.controller = cpu(b);
          // hard AI, all his tricks, a little less weight behind each blow than in the film (it is a full fight, not a beat)
          S.janemba.damageDealtMul = 0.6;
          S.janemba.target = S.goku;
          S.goku.target = S.janemba;
          b.switchPlayer(S.goku, { force: true });
          m.title(base.chapter, 'FAT JANEMBA', 'All the way', 2.6);
          m.music('janemba_theme', 3);
          m.objective('win', 'Defeat Fat Janemba', { icon: 'fist' });
          m.objective('clean', 'Never hit yourself through a portal', { icon: 'guard', optional: true });
          const off = b.on('portalRedirect', (e) => e.attacker === S.goku && m.failObjective('clean'));
          m.onDispose(off);
          m.lock(false);
          yield () => !S.janemba.alive || m.state !== 'running';
          off();
          if (m.state !== 'running') return;
          m.complete('win');
          if (!m.objectives.find((o) => o.id === 'clean').failed) m.complete('clean');
          m.lock(true);
          yield* m.cine(1.5);
        },
      },
    ],
  });

  /* ------------------------------------------------------------ Earth invasion survival */
  SL.data.missions.fr_x_earth = Object.assign({}, base, {
    id: 'fr_x_earth',
    title: 'Challenge: Earth Invasion',
    subtitle: 'Gohan and Videl · hold the street',
    character: 'adult_gohan',
    stage: 'satan_city',
    parTime: 120,
    blurb: 'The dead keep coming through the rift. Ninety seconds, one street, and Videl at your side.',
    rewards: ['Challenge clear'],
    setup(b) {
      const gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: FR.at(b, -1.4, 6), startKi: 100 });
      const videl = b.spawn({ charId: 'videl', team: 0, pos: FR.at(b, 1.6, 6.5), startKi: 80 });
      b.story = { gohan, videl };
    },
    phases: [
      {
        id: 'survive',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, S = b.story;
          m.lock(true);
          FR.skyRift(b, new V3(0, 40, -30), 14);
          b.switchPlayer(S.gohan, { force: true });
          b.setParty([S.gohan], {});
          S.videl.controller = cpu(b, 'normal');
          S.videl.cannotDie = true;
          S.videl.storyAllyMul = 1.4;
          let n = 0;
          m.spawner({
            every: 3.2,
            delay: 1,
            maxAlive: 7,
            spawn: () => {
              n++;
              const a = n * 2.4;
              const id = n % 3 === 0 ? 'dead_soldier' : 'frieza_soldier';
              const f = m.spawn({ charId: id, pos: FR.at(b, Math.cos(a) * 16, -14 + Math.sin(a) * 6), startKi: 40 });
              f.controller = cpu(b, 'normal');
              f.target = n % 2 ? S.gohan : S.videl;
              FR.halo(b, f);
            },
          });
          m.title(base.chapter, 'EARTH INVASION', 'Hold the street for 90 seconds', 2.6);
          m.music('battle', 3);
          m.objective('hold', 'Hold the street', { icon: 'clock' });
          m.objective('kills', 'Send 15 of them back', { icon: 'fist', target: 15, optional: true });
          const clk = FR.clock(m, { seconds: 90, storyMinutes: 1.5, label: 'HOLD', color: '#5fd0ff' });
          m.lock(false);
          yield () => {
            m.progress('kills', Math.min(15, m.kills));
            return clk.done || m.state !== 'running';
          };
          clk.stop();
          for (const sp of m.spawners) sp.stop();
          if (m.state !== 'running') return;
          m.complete('hold');
          m.lock(true);
          yield* m.cine(1.2);
        },
      },
    ],
  });

  /* ------------------------------------------------------------ the perfect dance */
  SL.data.missions.fr_x_dance = Object.assign({}, base, {
    id: 'fr_x_dance',
    title: 'Challenge: The Perfect Dance',
    subtitle: 'Three flawless Fusion Dances in a row',
    character: 'goku',
    stage: 'other_world',
    parTime: 120,
    qteLabel: 'Timing',
    blurb: 'Three Fusion Dances in a row without a single step out of time — with a narrower window than the film gives you.',
    rewards: ['Challenge clear'],
    setup(b) {
      const hide = FR.lm(b, 'spikeBehind');
      const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: FR.at(b, hide.x - 1.7, hide.z), startKi: 100 });
      const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: FR.at(b, hide.x + 1.7, hide.z), startKi: 100 });
      K.watcher(vegeta, 'idle', 'determined');
      FR.halo(b, goku);
      FR.halo(b, vegeta);
      b.story = { goku, vegeta };
    },
    phases: [
      {
        id: 'dance',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, S = b.story;
          m.lock(true);
          FR.warped(b);
          const hide = FR.lm(b, 'spikeBehind');
          const at = (dx) => FR.at(b, hide.x + dx, hide.z);
          const STEPS = SL.data.fusionDance.STEPS;
          m.title(base.chapter, 'THE PERFECT DANCE', 'Three in a row', 2.4);
          m.music('fusion_theme', 2);
          m.objective('row', 'Flawless dances in a row', { icon: 'transform', target: 3 });
          let row = 0, tries = 0;
          while (row < 3 && tries < 9) {
            tries++;
            K.place(S.goku, at(-1.7), Math.PI);
            K.place(S.vegeta, at(1.7), Math.PI);
            for (const f of [S.goku, S.vegeta]) {
              f.controller = K.scripted();
              f.setState('scripted', { pose: f === S.goku ? 'fd_stepBR' : 'fd_stepB', expression: 'determined' });
              f.yaw = f.prevYaw = Math.PI;
            }
            b.switchPlayer(S.goku, { force: true });
            m.shot((t, out) => {
              const mid = S.goku.chest().lerp(S.vegeta.chest(), 0.5);
              out.pos.set(mid.x, mid.y + 0.15, mid.z - 5);
              out.look.copy(mid);
              out.fov = 44;
            }, 999, { hold: true, cut: true, blendIn: 0 });
            yield* m.cine(0.8);
            const res = yield* m.rhythm(STEPS.map((s) => ({ key: 'light', label: s.label })), {
              beat: 0.78, window: 0.12, perfect: 0.06, lead: 1,
              onBeat: (i) => {
                const st = STEPS[i];
                S.goku.setState('scripted', { pose: st.pose + 'R', expression: 'determined', speed: 18 });
                S.vegeta.setState('scripted', { pose: st.pose, expression: 'determined', speed: 18 });
                if (st.id.startsWith('step')) {
                  const k = Number(st.id.slice(4));
                  const gap = U.lerp(1.7, 0.55, k / 3);
                  K.place(S.goku, at(-gap), Math.PI);
                  K.place(S.vegeta, at(gap), Math.PI);
                }
              },
            });
            m.endShot();
            const flawless = !res.hits.some((h) => h.grade === 'miss');
            row = flawless ? row + 1 : 0;
            m.progress('row', row);
            m.qteParts.push(res.score);
            b.vfx.flash(S.goku.chest().lerp(S.vegeta.chest(), 0.5), flawless ? 3 : 1.2, flawless ? 0xfff0b0 : 0xffffff, 0.3, SL.Toon.tex.glow);
            m.say(flawless ? 'goku' : 'vegeta', flawless ? (row === 3 ? 'Perfect. Every time.' : 'That\'s it — again!') : 'Out of step! From the top!', 1.8);
            yield* m.cine(1.6);
          }
          if (row < 3) {
            m.fail('the dance');
            return;
          }
          m.complete('row');
        },
      },
    ],
  });

  /* ------------------------------------------------------------ Super Janemba, no fusion */
  SL.data.missions.fr_x_super = Object.assign({}, base, {
    id: 'fr_x_super',
    title: 'Challenge: Super Janemba',
    subtitle: 'Goku and Vegeta · no fusion',
    character: 'vegeta',
    stage: 'other_world',
    parTime: 360,
    blurb: 'What if they never had to dance? No power gap this time: beat Super Janemba as two — if you can stop being predictable.',
    rewards: ['Challenge clear'],
    setup(b) {
      FR.warped(b);
      const field = FR.lm(b, 'field');
      const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: FR.at(b, field.x - 2.5, field.z + 6), startKi: 100 });
      const goku = b.spawn({ charId: 'goku', team: 0, pos: FR.at(b, field.x + 2.5, field.z + 7), startKi: 100 });
      const sj = b.spawn({ charId: 'super_janemba', team: 1, pos: FR.at(b, field.x, field.z - 5), startKi: 100 });
      for (const f of [vegeta, goku]) K.faceTo(f, sj.pos);
      K.faceTo(sj, vegeta.pos);
      FR.halo(b, goku);
      FR.halo(b, vegeta);
      b.story = { vegeta, goku, sj };
    },
    phases: [
      {
        id: 'fight',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, S = b.story;
          m.lock(true);
          FR.warped(b);
          b.switchPlayer(S.vegeta, { force: true });
          b.setParty([S.vegeta, S.goku], { allyDifficulty: 'normal' });
          S.sj.controller = cpu(b);
          S.sj.damageDealtMul = 0.3;
          S.sj.damageTakenMul = 1.3;
          S.sj.target = S.vegeta;
          for (const f of [S.vegeta, S.goku]) f.target = S.sj;
          m.title(base.chapter, 'SUPER JANEMBA', 'Goku and Vegeta · no fusion', 2.6);
          m.music('super_janemba', 3);
          m.objective('win', 'Defeat Super Janemba', { icon: 'fist' });
          m.objective('vary', 'Never let him Phantom Shift behind you', { icon: 'transform', optional: true });
          const off = b.on('phantomEvade', (e) => e.fighter === S.sj && m.failObjective('vary'));
          m.onDispose(off);
          m.lock(false);
          yield () => !S.sj.alive || m.state !== 'running';
          off();
          if (m.state !== 'running') return;
          m.complete('win');
          if (!m.objectives.find((o) => o.id === 'vary').failed) m.complete('vary');
          m.lock(true);
          yield* m.cine(1.5);
        },
      },
    ],
  });
})();
