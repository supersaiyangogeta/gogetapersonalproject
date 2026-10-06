/*
 * CHAPTER 13 — BUU SAGA: VEGITO
 * Mission "The Potara" (canon; played as Goku). On the Sacred World of the Kai, the Kais and a dead
 * man watch Buutenks take Gohan apart in a crystal ball. The Old Kai does the one thing he can.
 *
 *   WATCH  (scene)       the crystal ball: Gohan losing; Goku, with his halo, unable to do anything
 *   LIFE   (checkpoint)  the Old Kai sits down in front of him and gives him his life: hold Charge
 *                        to take it — the gold light crossing, Goku's halo fading off his head and
 *                        coming down on the Old Kai's, who flops back on the grass, delighted
 *   POTARA (scene)       the earrings: what they do, and the demonstration — the Supreme Kai hands
 *                        Kibito one, the magnetic pull, a flash, KIBITOSHIN (and it is permanent)
 *   LEAVE  (checkpoint)  the Old Kai's own pair in Goku's hand; "don't lose them"; two fingers to
 *                        the forehead (a cue): Instant Transmission to Earth
 *
 * Reuses: buuKit (staging, watchers), vegitoKit (hold, magnet, potara, earOn), SL.Cinema.halo.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const VK = SL.data.vegitoKit;

  const PT = {
    lifeSeconds: 3.6, // holding Charge needed to take the Old Kai's life
  };
  const BALL = new V3(0, 0, -5); // the crystal ball on its stand
  const HAND_POTARA = { id: 'potaraHand', shape: 'potara', joint: 'handR', pos: [0, -0.1, 0.035], rot: [0, 0, 0], scale: 1.6 };

  /* ------------------------------------------------ the crystal ball */
  function crystalBall(m) {
    const b = m.battle, T = SL.Toon;
    const g = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.9, 10), T.makeMat(0x6a5a8a, {}));
    stand.position.y = 0.45;
    T.addOutline(stand, 1.4);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.55 }));
    ball.position.y = 1.3;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xff7ab8, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.2 }));
    glow.scale.setScalar(1.6);
    glow.position.y = 1.3;
    g.add(stand, ball, glow);
    g.position.copy(K.ground(b, BALL));
    b.scene.add(g);
    m.onDispose(() => {
      b.scene.remove(g);
      stand.geometry.dispose();
      stand.material.dispose();
      ball.geometry.dispose();
      ball.material.dispose();
      glow.material.dispose();
    });
    return {
      pos: g.position.clone().add(new V3(0, 1.3, 0)),
      /** a blow landing on Earth: the ball flashes pink */
      hit(k = 1) {
        glow.material.opacity = 0.3 + 0.6 * k;
        glow.scale.setScalar(1.6 + k * 1.2);
      },
      tick() {
        glow.material.opacity += (0.2 - glow.material.opacity) * 0.08;
        glow.scale.setScalar(glow.scale.x + (1.6 - glow.scale.x) * 0.08);
      },
    };
  }

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(0, 0), startKi: 100 });
    const elder = b.spawn({ charId: 'elder_kai', team: 0, pos: at(-1.5, -3.1) });
    const shin = b.spawn({ charId: 'supreme_kai', team: 0, pos: at(2.2, -3.4) });
    const kibito = b.spawn({ charId: 'kibito', team: 0, pos: at(3.6, -2.2) });
    const kibitoshin = b.spawn({ charId: 'kibitoshin', team: 0, pos: at(3, -2.8) });
    for (const f of [elder, shin, kibito, kibitoshin]) K.watcher(f, 'idle', 'calm');
    kibitoshin.setHidden(true);
    goku.lockedForms = { ssj: true, ssj2: true, ssj3: true, kaioken: true };
    b.story = { goku, elder, shin, kibito, kibitoshin, owned: false };
  }

  /** Mission-owned set pieces are built once the mission exists (setup runs before it does). */
  function own(m) {
    const S = m.battle.story;
    if (S.owned) return;
    S.owned = true;
    S.ball = crystalBall(m);
    m.tickHooks.push(() => S.ball.tick());
    S.gokuHalo = SL.Cinema.halo(m.battle, S.goku);
    S.elderHalo = SL.Cinema.halo(m.battle, S.elder);
    S.elderHalo.userData.off = true;
  }

  const P = {};

  P.watch = {
    id: 'watch',
    run: function* (m) {
      own(m);
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'pt_watch');
    },
  };

  /** The Old Kai's life, handed over. The player takes it by holding Charge. */
  P.life = {
    id: 'life',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, g = S.goku, ek = S.elder;
      m.lock(true);
      m.clearObjectives();
      K.place(g, K.ground(b, new V3(0, 0, 0)));
      K.place(ek, K.ground(b, new V3(0, 0, -1.5)));
      K.faceTo(g, ek.pos);
      K.faceTo(ek, g.pos);
      S.gokuHalo.userData.off = false;
      S.elderHalo.userData.off = true;
      ek.setState('scripted', { pose: 'prayerSit', expression: 'calm' });
      m.music('vision', 2);
      m.objective('life', 'Take the Old Kai\'s life', { icon: 'aura' });
      m.shot((t, out) => {
        const mid = g.pos.clone().lerp(ek.pos, 0.5);
        const side = new V3(1, 0, 0);
        K.camAt(out, mid.clone().addScaledVector(side, 3.4 - t * 0.6).add(new V3(0, 1.2, 0.4)), mid.clone().add(new V3(0, 0.5, 0)), 42);
      }, 60, { cut: true, blendIn: 0 });
      m.say('elder_kai', 'Don\'t fidget. Just take it.', 2.4);
      let offDone = false;
      yield* VK.hold(m, {
        id: 'life',
        fighter: g,
        seconds: PT.lifeSeconds,
        pose: 'kneelReceive',
        face: 'calm',
        label: 'Hold to take the life',
        meter: 'LIFE',
        tick(k, holding) {
          // the gold light crossing from the old man's hands to Goku
          const from = ek.chest().add(new V3(0, 0.2, 0)), to = g.chest();
          if (b.frame % 3 === 0) b.vfx.trail(from.clone().lerp(to, (b.frame % 30) / 30), 0xffe890, 0.2 + k * 0.3, 0.3);
          if (holding && b.frame % 6 === 0) b.vfx.streamInward(to, 1.6, 0xffe890, 2, 0.12, 0.35);
          if (S.gokuHalo.material) S.gokuHalo.material.transparent = true;
          S.gokuHalo.material.opacity = Math.max(0, 1 - Math.max(0, k - 0.45) * 2.2);
          S.elderHalo.material.transparent = true;
          S.elderHalo.material.opacity = Math.max(0, (k - 0.6) * 2.5);
          if (k > 0.6) S.elderHalo.userData.off = false;
        },
        beats: [
          { at: 0.5, run: () => m.say('goku', 'It\'s... warm.', 1.8, { style: 'quiet' }) },
          {
            at: 1,
            run: () => {
              if (offDone) return;
              offDone = true;
              S.gokuHalo.userData.off = true;
              S.elderHalo.userData.off = false;
              S.elderHalo.material.opacity = 1;
              b.vfx.flash(g.chest(), 3, 0xfff0b0, 0.4, SL.Toon.tex.glow);
              b.vfx.ring(g.chest(), 3, 0xfff0b0, 0.4);
              b.sfx('learn', g);
            },
          },
        ],
      });
      m.complete('life');
      m.flags.revived = true;
      m.endShot();
      yield* SL.Cinema.play(m, 'pt_alive');
    },
  };

  P.potara = {
    id: 'potara',
    run: function* (m) {
      own(m);
      yield* SL.Cinema.play(m, 'pt_potara');
    },
  };

  /** Two fingers to the forehead: Gohan's ki, and he is gone. */
  P.leave = {
    id: 'leave',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      // restaged from a checkpoint: the life already given, the Kais already one
      S.gokuHalo.userData.off = true;
      S.elderHalo.userData.off = false;
      S.elderHalo.material.opacity = 1;
      K.toForm(S.elder, 'bare');
      for (const f of [S.shin, S.kibito]) f.setHidden(true);
      S.kibitoshin.setHidden(false);
      if (!g.model.props.potaraHand) g.model.addProp(HAND_POTARA);
      yield* SL.Cinema.play(m, 'pt_leave');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.fade('black', 1);
      yield* m.cine(1.2);
      m.title(m.def.chapter, 'THE POTARA', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'buu_potara',
    canon: true,
    chapter: 'CHAPTER 13 · BUU SAGA',
    title: 'The Potara',
    subtitle: 'The Sacred World of the Kai · Age 774',
    character: 'goku',
    stage: 'kai_world',
    parTime: 240,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Goku is dead and his son is losing. The oldest Kai there is has one life left to give, and a pair of earrings nobody has ever been allowed to touch.',
    rewards: ['Story: the Potara', 'Character: Kibitoshin (story)'],
    setup,
    phases: [P.watch, P.life, P.potara, P.leave, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.potaraMission = { PT, HAND_POTARA };
})();
