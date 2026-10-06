/*
 * CHAPTER 5 — ANDROID SAGA (second mission)
 * Mission "What He Came To Say" (canon; Goku, then Trunks). Rebuilt 2026-09-24 (owner's Future
 * Trunks arrival rebuild).
 *
 * Three hours after the Cold family. The atmosphere changes completely: a group of friends waiting
 * on a rock for a man they thought was dead, and a stranger who knows exactly when he will land.
 *
 *   wait       the Z Fighters and Bulma waiting; Bulma notices the Capsule Corp logo on his jacket
 *   landing    the pod comes down where he said it would; Goku climbs out in Yardrat clothes
 *   yardrat    PLAYED AS GOKU: where he has been — and the player shows them Instant Transmission
 *              (a cue); he comes back from Kame House in Master Roshi's sunglasses
 *   aside      "Could I speak to you alone?" — the two of them walk off; Piccolo's ears
 *   test       CHECKPOINT · PLAYED AS TRUNKS: both turn Super Saiyan, the sword comes out, and every
 *              cut the player throws is stopped on one finger (Fighter.storyBlock)
 *   truth      who he is: Vegeta and Bulma's son
 *   future     what happens: the heart virus, the Androids, everyone, Gohan, and a boy left alone —
 *              seen in his memory (a ruined city, Battle.changeStage), his face in between
 *   medicine   the quiet beat: the player hands it over (a cue)
 *   warning    the date, the time, the place: he draws the map in the sand with the sword tip
 *   depart     the capsule, the Time Machine, a look back, and he is gone
 *   after      Piccolo heard everything; three years start now
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;

  const LANDING = new V3(34, 0, 52); // where the pod comes down, north of the Cold family's crater
  const WAIT = new V3(34 - 14, 0, 52 - 12); // the rocks they wait on (plain numbers: see trunks_kit)
  const ASIDE = new V3(34 + 18, 0, 52 + 26); // far enough that only Piccolo can hear
  const BLOCKS = 8; // cuts stopped before Trunks has seen enough
  const TEST_SECONDS = 40;

  function setup(battle) {
    const b = battle;
    K.clearArea(b, LANDING, 40);
    K.clearArea(b, ASIDE, 20);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: K.ground(b, LANDING), startKi: 70 });
    goku.cannotDie = true;
    goku.infiniteHp = true;
    const trunks = b.spawn({ charId: 'future_trunks', team: 0, pos: K.ground(b, WAIT.clone().add(new V3(3, 0, 2))), startKi: 90 });
    trunks.cannotDie = true;
    const cast = { goku, trunks };
    [['vegeta', 'vegeta'], ['piccolo', 'piccolo'], ['krillin', 'krillin'], ['gohan', 'kid_gohan_764'], ['yamcha', 'yamcha'], ['tien', 'tien'], ['bulma', 'bulma']].forEach(([name, id], i) => {
      const f = b.spawn({ charId: id, team: 0, pos: K.ground(b, WAIT.clone().add(new V3(-4 + (i % 4) * 2.4, 0, -2 + Math.floor(i / 4) * 2.2))), startKi: 40 });
      cast[name] = f;
    });
    // the memory: a future nobody here has lived yet (only ever seen in `trunks_future`)
    [['fgohan', 'future_gohan'], ['a17', 'android_17'], ['a18', 'android_18']].forEach(([name, id]) => {
      const f = b.spawn({ charId: id, team: name === 'fgohan' ? 0 : 1, pos: K.ground(b, LANDING.clone().add(new V3(0, 0, -80))), startKi: 40 });
      f.setHidden(true);
      cast[name] = f;
    });
    for (const f of Object.values(cast)) {
      if (f === goku) continue;
      f.controller = K.scripted();
      f.untargetable = true;
      f.cannotDie = true;
    }
    goku.setHidden(true);
    goku.untargetable = true;
    K.sheathe(trunks, true);
    const pod = K.pod(b, K.ground(b, LANDING).add(new V3(0, 1.1, 0)));
    pod.group.visible = false;
    b.story = Object.assign(cast, { pod, crowd: ['vegeta', 'piccolo', 'krillin', 'gohan', 'yamcha', 'tien', 'bulma'].map((k) => cast[k]), spots: { LANDING, WAIT, ASIDE } });
  }

  function prep(m) {
    const b = m.battle;
    m.lock(true);
    m.clearObjectives();
    m.limits(null);
    K.clearCombat(b);
    for (const f of b.fighters) K.plain(f);
  }
  /** Goku is out of the pod, in Yardrat clothes, the pod sits in its crater. */
  function landed(m) {
    const b = m.battle, S = b.story;
    S.goku.setHidden(false);
    S.goku.untargetable = false;
    S.pod.group.visible = true;
    if (!m.flags.crater) {
      b.stage.crater(K.ground(b, LANDING), 5, 1.2, null);
      m.flags.crater = true;
    }
  }
  /** The two of them off on their own, facing each other. */
  function aside(m) {
    const b = m.battle, S = b.story;
    K.place(S.goku, K.ground(b, ASIDE.clone().add(new V3(0, 0, 3))), Math.PI);
    K.place(S.trunks, K.ground(b, ASIDE.clone().add(new V3(0, 0, -3))), 0);
    K.faceTo(S.goku, S.trunks.pos);
    K.faceTo(S.trunks, S.goku.pos);
    // the others stay back at the landing site; the camera only finds them when the story looks
    S.crowd.forEach((f, i) => {
      K.place(f, K.ground(b, LANDING.clone().add(new V3(-5 + i * 1.8, 0, -7 + (i % 2) * 1.4))));
      K.faceTo(f, ASIDE);
    });
  }

  const P = {};

  P.wait = {
    id: 'wait',
    run: function* (m) {
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'goku_waiting');
    },
  };

  P.landing = {
    id: 'landing',
    run: function* (m) {
      yield* SL.Cinema.play(m, 'goku_lands');
    },
  };

  /** Played as Goku: the player shows them Instant Transmission. */
  P.yardrat = {
    id: 'yardrat',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      b.switchPlayer(S.goku, { force: true });
      yield* SL.Cinema.play(m, 'goku_yardrat');
    },
  };

  P.aside = {
    id: 'aside',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      yield* SL.Cinema.play(m, 'trunks_aside');
    },
  };

  /**
   * THE TEST, played as Trunks: a Super Saiyan with a sword, swinging for real, and every cut stops
   * on the tip of one finger. It is not a fight and nobody can lose it: it ends when Trunks has seen
   * enough (BLOCKS cuts) or after TEST_SECONDS.
   */
  P.test = {
    id: 'test',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, t = S.trunks;
      prep(m);
      landed(m);
      aside(m);
      if (S.goku.model.removeProp) S.goku.model.removeProp('shades');
      yield* SL.Cinema.play(m, 'finger_test_open');
      // the fight part: Trunks free, Goku holding one finger up
      K.takeControl(b, t);
      m.teach(t, 'form:ssj');
      t.lockedForms = {};
      K.toForm(t, 'ssj');
      K.toForm(g, 'ssj');
      K.sheathe(t, false);
      t.hp = t.hpMax;
      t.ki = t.kiMax;
      g.controller = K.scripted();
      // for the length of the test he is on the other side of the sword (blows only land on the other team)
      g.team = 1;
      g.untargetable = false;
      g.infiniteHp = true;
      g.cannotDie = true;
      K.pose(g, 'g_finger', 'calm');
      g.storyBlock = { from: [t], pose: 'g_fingerBlock', count: 0 };
      t.target = g;
      K.faceTo(t, g.pos);
      // a sword test: no ki, no transformations, nothing but the blade
      m.limits({ blast: false, s1: false, s2: false, ult: false, transform: false, charge: false });
      m.lock(false);
      b.aiLocked = true;
      m.music('battle', 4);
      m.prompt('fingerSwing', 'light', 'Swing', { required: true, until: () => (g.storyBlock.count || 0) > 0 });
      let secs = 0, looked = false, faceUntil = 0;
      const st = (S.test = { blocks: 0, seconds: 0, hitsOnGoku: 0 });
      // the camera holds over Trunks' shoulder, square on Goku, so every cut and every stop on the
      // finger is in frame (and forward is still toward him); halfway, a moment on Goku's face
      m.shot((k, out) => {
        if (b.frame < faceUntil) {
          const h = g.chest().add(new V3(0, 0.36, 0));
          const fw = new V3(Math.sin(g.yaw), 0, Math.cos(g.yaw));
          const side = new V3(fw.z, 0, -fw.x);
          K.camAt(out, h.clone().addScaledVector(fw, 1.1).addScaledVector(side, 1.2).add(new V3(0, 0.05, 0)), h, 38);
          return;
        }
        const o = SL.Cinema.overShoulder(t, g, { side: 1.25, back: 2.7, height: 0.55, lookUp: 0.25, fov: 46 });
        K.camAt(out, o.pos, o.look, o.fov);
      }, 999, { hold: true, blendIn: 0.35 });
      const offB = b.on('storyBlock', (e) => {
        if (e.fighter !== g) return;
        st.blocks = g.storyBlock.count;
      });
      const offD = b.on('damage', (e) => {
        if (e.target === g && e.attacker === t && !e.blocked) st.hitsOnGoku++;
      });
      const hook = () => {
        if (b.inputLocked) return;
        secs += 1 / 60;
        st.seconds = secs;
        K.faceTo(g, t.pos);
        // halfway, a look at his face: he is not even trying
        if (!looked && st.blocks >= 3) {
          looked = true;
          faceUntil = b.frame + 60;
          b.slowmo(0.5, 0.5);
        }
      };
      m.tickHooks.push(hook);
      yield () => st.blocks >= BLOCKS || secs >= TEST_SECONDS;
      K.removeHook(m, hook);
      offB();
      offD();
      m.lock(true);
      m.limits(null);
      m.endShot();
      g.storyBlock = null;
      g.team = t.team;
      g.untargetable = true;
      K.clearCombat(b);
      m.flags.testBlocks = st.blocks;
      m.flags.testSeconds = Math.round(secs);
      m.flags.gokuUntouched = st.hitsOnGoku === 0;
      yield* SL.Cinema.play(m, 'finger_test_end');
    },
  };

  P.truth = {
    id: 'truth',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      aside(m);
      K.toForm(S.trunks, 'base');
      K.toForm(S.goku, 'base');
      K.sheathe(S.trunks, true);
      yield* SL.Cinema.play(m, 'trunks_identity');
    },
  };

  /** What happens: told by Trunks, seen in his memory. The world is swapped for his, then back. */
  P.future = {
    id: 'future',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      aside(m);
      K.sheathe(S.trunks, true);
      m.onDispose(() => SL.ScreenFX.vision(0));
      yield* SL.Cinema.play(m, 'trunks_future');
      // back in the present, whatever the memory did to the world
      if (b.stage.def.id !== 'coast') b.changeStage('coast');
      SL.ScreenFX.vision(0);
      S.pod.group.visible = false;
      S.pod = K.pod(b, K.ground(b, LANDING).add(new V3(0, 1.1, 0)));
      b.stage.crater(K.ground(b, LANDING), 5, 1.2, null);
      aside(m);
      for (const k of ['fgohan', 'a17', 'a18']) S[k].setHidden(true);
      m.endShot();
      // one beat for the bodies to take their new places before a face camera reads them
      yield 0.05;
      yield* SL.Cinema.play(m, 'trunks_future_back');
    },
  };

  P.medicine = {
    id: 'medicine',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      aside(m);
      b.switchPlayer(S.trunks, { force: true });
      yield* SL.Cinema.play(m, 'trunks_medicine');
    },
  };

  P.warning = {
    id: 'warning',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      aside(m);
      m.onDispose(() => S.map && S.map.dispose());
      yield* SL.Cinema.play(m, 'trunks_warning');
    },
  };

  P.depart = {
    id: 'depart',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      aside(m);
      yield* SL.Cinema.play(m, 'trunks_departs');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      prep(m);
      landed(m);
      S.trunks.setHidden(true);
      S.trunks.untargetable = true;
      yield* SL.Cinema.play(m, 'three_years');
      m.lock(true);
      m.fade('black', 1.4);
      yield 1.6;
      m.endShot();
      m.flags.clockStarted = true;
      m.title('THREE YEARS UNTIL THE ANDROIDS', 'MAY 12 · AGE 767 · 10:00 AM', m.nextLine(), 4.6);
      yield* m.cine(4.8);
    },
  };

  const def = {
    id: 'android_warning',
    canon: true,
    chapter: 'CHAPTER 5 · ANDROID SAGA',
    title: 'What He Came To Say',
    subtitle: 'Earth · Age 764 · three hours later',
    character: 'goku',
    stage: 'coast',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'The stranger knew exactly where Goku would land, and when. He will not say a word until he is sure who Goku is. After that, he tells him the day everyone dies.',
    rewards: ['Chapter 5 continues'],
    setup,
    phases: [P.wait, P.landing, P.yardrat, P.aside, P.test, P.truth, P.future, P.medicine, P.warning, P.depart, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.trunksWarning = { LANDING, WAIT, ASIDE, BLOCKS, TEST_SECONDS };
})();
