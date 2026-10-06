/*
 * CHAPTER 6 — CELL SAGA: THE CELL GAMES, PART FOUR (2026-10-01)
 * Mission "Goodbye, Gohan" (canon, intentionally cinematic, with one cue).
 *
 * The owner's frame-by-frame brief for Goku's sacrifice — the most iconic beat of the saga, shown in
 * full instead of a flash and a cut:
 *   BLOAT     Semi-Perfect Cell blown up like a balloon on tiny legs: "Touch me and I explode!"
 *   DESPAIR   Gohan on his knees, fists in the dirt: "It's my fault!"
 *   FAREWELL  Goku turns to his friends on the ridge, calm: "Tell Chi-Chi I'm sorry." Two fingers to his
 *             forehead (the cue: Instant Transmission) — in front of Cell on the broken stone, a palm flat
 *             on the swollen skin, one look back at his son and the warm, goofy smile: "You fought well,
 *             Gohan. I'm proud of you." Gone, both of them.
 *   KING KAI  King Kai's planet: King Kai, Bubbles and Gregory turning round; "GOKU?! WHY DID YOU BRING
 *             HIM HERE?!" — "Sorry, King Kai!" Cell goes white and cracks; the supernova takes the
 *             planet, all of them, in a flash of white.
 *   SILENCE   Back on Earth: an empty sky over the ring, and a boy looking at it.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const CK = SL.data.cellKit;

  function setup(battle) {
    const b = battle;
    const S = CK.cast(b, { player: 'gohan' });
    CK.spectate(b, S, ['gohan', 'a16']);
    CK.gone(S.a16);
    for (const j of S.juniors || []) CK.gone(j);
    for (const name of ['piccolo', 'trunks', 'krillin', 'tien', 'yamcha']) CK.watch(S[name], CK.ground(b, CK.SPOTS[name]), 'idle', 'hurt');
    CK.watch(S.vegeta, CK.ground(b, CK.SPOTS.vegeta), 'armsCrossed', 'hurt');
    CK.toForm(S.goku, 'base');
    CK.watch(S.goku, CK.ground(b, CK.SPOTS.goku), 'idle', 'calm');
    CK.toForm(S.gohan, 'ssj2');
    S.gohan.setRage(true, 1);
    CK.place(S.gohan, CK.onRing(b, 0, 5), Math.PI);
    CK.toForm(S.cell, 'semi_perfect');
    CK.place(S.cell, CK.onRing(b, 0, -3), 0);
    CK.watch(S.a18, CK.onRing(b, -5, -9), 'knockdown', 'ko');
    S.satan.setState('scripted', { pose: 'ms_hide', expression: 'shock' });
    // King Kai's planet, for later: King Kai and Bubbles wait hidden
    S.kingkai = b.spawn({ charId: 'king_kai', team: 0, pos: new V3(0, 0, -60), startKi: 10 });
    S.bubbles = b.spawn({ charId: 'bubbles', team: 0, pos: new V3(2, 0, -60), startKi: 10 });
    for (const f of [S.kingkai, S.bubbles]) {
      f.controller = CK.scripted();
      f.untargetable = f.intangible = true;
      f.cannotDie = true;
      f.setHidden(true);
    }
    // the bloated body: a swollen, veined ball round Cell's middle (owned by the mission)
    S.balloon = makeBalloon(b, S.cell);
  }

  /** Cell's balloon body: a pulsing, veined sphere that follows his chest; set(k) inflates it 0..1. */
  function makeBalloon(b, c) {
    const T = SL.Toon, g = new THREE.Group();
    const skin = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), T.mat(0x9ec86a));
    T.addOutline(skin, 1.6);
    g.add(skin);
    const veins = [];
    for (let i = 0; i < 14; i++) {
      const v = new THREE.Mesh(new THREE.TorusGeometry(1.002, 0.012, 4, 24, 0.9 + (i % 3) * 0.3), new THREE.MeshBasicMaterial({ color: 0x7a3a8a }));
      v.rotation.set(i * 0.7, i * 1.3, i * 0.4);
      g.add(v);
      veins.push(v);
    }
    const spots = new THREE.Mesh(new THREE.SphereGeometry(1.004, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(spots);
    g.visible = false;
    b.scene.add(g);
    let k = 0, n = 0;
    const bal = {
      group: g,
      set(v) {
        k = v;
        g.visible = v > 0.01;
      },
      /** white-hot just before it goes (0..1) */
      glow(v) {
        spots.material.opacity = v;
        skin.material.color.set(0x9ec86a).lerp(new THREE.Color(0xffffff), v);
      },
      dispose() {
        b.scene.remove(g);
        skin.geometry.dispose();
        for (const v of veins) v.geometry.dispose();
      },
    };
    b.onTick(() => {
      if (b.disposed || !g.parent) return false;
      n++;
      g.visible = k > 0.01 && (!c.hidden || bal.free);
      if (!g.visible) return true;
      const pulse = 1 + Math.sin(n * 0.35) * 0.04 * k;
      // the body swells into a ball round his middle; the head stays on top of it
      const r = (0.35 + k * 1.05) * pulse;
      g.scale.set(r, r * 0.9, r);
      g.position.copy(c.chest()).add(new V3(0, -0.12 * k, 0));
      return true;
    });
    if (b.mission) b.mission.onDispose(bal.dispose);
    return bal;
  }

  const P = {};

  P.bloat = {
    id: 'bloat',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      // mission-owned set pieces belong to the arena: hidden while the story is on King Kai's planet
      const b = m.battle, S = b.story;
      const off = b.on('stageChanged', (e) => {
        const here = e.id === 'cellarena';
        if (S.lieRock) S.lieRock.group.visible = here;
      });
      m.onDispose(off);
      yield* SL.Cinema.play(m, 'cb_bloat');
    },
  };

  P.farewell = {
    id: 'farewell',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      if (b.stage.def.id !== 'cellarena') b.changeStage('cellarena');
      S.balloon.set(1);
      yield* SL.Cinema.play(m, 'cb_farewell');
    },
  };

  P.kingkai = {
    id: 'kingkai',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      b.changeStage('kingkai');
      m.endShot();
      yield* SL.Cinema.play(m, 'cb_kingkai');
      b.changeStage('cellarena');
      m.endShot();
      yield* SL.Cinema.play(m, 'cb_silence');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.fade('black', 1.4);
      yield* m.cine(1.6);
      m.endShot();
      m.title(m.def.chapter, 'GOODBYE, GOHAN', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'cell_goodbye',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'Goodbye, Gohan',
    subtitle: 'Earth · Age 767 · one minute left',
    character: 'goku',
    stage: 'cellarena',
    parTime: 240,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Cell has made himself into a bomb that will take the planet with it. There is one place it can go off without hurting anyone — almost.',
    rewards: ['Story: the sacrifice'],
    setup,
    phases: [P.bloat, P.farewell, P.kingkai, P.after],
  };
  SL.data.missions[def.id] = def;
})();
