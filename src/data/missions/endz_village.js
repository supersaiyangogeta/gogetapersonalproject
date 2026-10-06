/*
 * CHAPTER 15 — THE END OF Z: "TEN YEARS LATER" (the owner's epilogue brief, 2026-10-03). Age 784.
 * Played as Uub. The south_village stage (Stage._buildVillage), Mount Paozu (plains) for Goku's opening.
 *
 *   CARD      (title)          TEN YEARS LATER
 *   GOKU      (scene)          Goku in his new clothes, a kata at dawn; he stops and looks south; the flyer
 *   VILLAGE   (scene)          the far south: a boy with a yoke and two water jars; his mother; the chief,
 *                              the tournament, ten million zeni; "I'll win it. For everyone."
 *   TRAIN *   (play)           Uub on the open ground east of the huts: the training posts, then the boulder
 *                              (no ki blasts, no flight — a boy who has only ever hit things); the children
 *                              and his mother watching
 *   TRAINED   (scene)          the boulder in pieces; "S-sorry!"; the chief's "Hm. That boy..."
 *   DEPART    (scene)          dawn at the village edge; a deep bow; a small figure on a long road north
 *   AFTER                      the card
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  function setup(battle) {
    const b = battle;
    const uub = b.spawn({ charId: 'uub', player: true, team: 0, pos: K.ground(b, new V3(9, 0, 7)), startKi: 60 });
    const s = (charId, x, z) => b.spawn({ charId, team: 0, pos: K.ground(b, new V3(x, 0, z)) });
    const story = {
      uub,
      goku: s('goku', 70, 70),
      mother: s('uub_mother', -11.3, -9.7),
      chief: s('village_chief', -10, -10.6),
      kid1: s('village_kid', 6, 6),
      kid2: s('village_kid', 7, 8),
      kid3: s('village_kid', 8, 5),
    };
    for (const k of Object.keys(story)) {
      const f = story[k];
      f.cannotDie = true;
      if (f === uub) continue;
      K.watcher(f, 'idle', 'calm');
    }
    story.goku.setHidden(true);
    // a boy who has only ever hit things: no Village Stomp until the ring gives way under him, no Awakened Fist
    uub.lockedSlots = Object.assign({}, uub.lockedSlots || {}, { special2: true, ultimate: true });
    uub.setState('scripted', { pose: 'ub_idle', expression: 'calm' });
    b.story = story;
  }

  /** The training ground east of the huts: three posts and a boulder taller than he is. */
  function trainingGround(m) {
    const b = m.battle, S = b.story;
    if (S.targets) return S.targets;
    const T = SL.Toon;
    const base = new V3(36, 0, -6);
    const targets = [];
    const posts = [[-3, -3], [-0.5, 2.4], [2.6, -1.2]];
    posts.forEach(([dx, dz], i) => {
      const g0 = K.ground(b, new V3(base.x + dx, 0, base.z + dz));
      const pr = b.stage.addProp({ kind: 'post', pos: g0.clone().add(new V3(0, 0.9, 0)), r: 0.5, hp: 1500, id: 'post' + i });
      pr.static = true;
      pr.rocky = true;
      pr.debrisColor = 0x7a5a32;
      pr.explodeColor = 0xd8b880;
      const post = new THREE.Mesh(b.stage.track(new THREE.CylinderGeometry(0.2, 0.24, 1.8, 10)), T.mat(0x7a5a32));
      post.position.y = -0.0;
      T.addOutline(post, 1.2);
      pr.group.add(post);
      for (const y of [0.35, -0.2]) {
        const rope = new THREE.Mesh(b.stage.track(new THREE.TorusGeometry(0.23, 0.035, 6, 16)), T.mat(0xc8a868));
        rope.rotation.x = Math.PI / 2;
        rope.position.y = y;
        pr.group.add(rope);
      }
      targets.push(pr);
    });
    const bp = K.ground(b, new V3(base.x + 5, 0, base.z + 4));
    const boulder = b.stage.addProp({ kind: 'boulder', pos: bp.clone().add(new V3(0, 1.1, 0)), r: 1.5, hp: 5200, id: 'boulder' });
    boulder.static = true;
    boulder.rocky = true;
    boulder.debrisColor = 0x8a6a4a;
    boulder.explodeColor = 0xd8c8a0;
    const rock = new THREE.Mesh(b.stage.track(new THREE.DodecahedronGeometry(1.6, 0)), T.mat(0x9a7a56));
    rock.scale.set(1.15, 1, 1);
    T.addOutline(rock, 1.8);
    boulder.group.add(rock);
    targets.push(boulder);
    S.targets = targets;
    return targets;
  }

  const P = {};
  const scene = (id, sceneId) => ({
    id,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, sceneId);
    },
  });

  P.card = {
    id: 'card',
    run: function* (m) {
      m.lock(true);
      m.fade('black', 0.01);
      m.music('peaceful', 0);
      yield* m.cine(0.6);
      m.title('AGE 784', 'TEN YEARS LATER', null, 3.6);
      yield* m.cine(3.8);
      m.fade('clear', 1.2);
    },
  };
  P.goku = scene('goku', 'ez_goku');
  P.village = {
    id: 'village',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'ez_village');
    },
  };

  /** TRAINING: as Uub, on the open ground east of the huts — the posts, then the boulder. */
  P.train = {
    id: 'train',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, u = S.uub;
      m.lock(true);
      m.clearObjectives();
      SL.data.endz.village({ b, m, cast: {} });
      if (b.player !== u) b.switchPlayer(u, { force: true });
      const targets = trainingGround(m);
      const base = new V3(36, 0, -6);
      m.space(u, 'ground', { pos: new V3(base.x - 7, 0, base.z), face: base });
      // the children and his mother at the edge of it, watching
      for (const [k, dx, dz, pose] of [['kid1', -6, 6, 'vx_cheer'], ['kid2', -7.2, 5, 'vx_idle'], ['kid3', -5, 7, 'vx_cheer'], ['mother', -9, 6.6, 'vm_idle']]) {
        m.space(S[k], 'ground', { pos: new V3(base.x + dx, 0, base.z + dz), face: base });
        S[k].setState('scripted', { pose, expression: 'grin' });
      }
      u.target = null;
      u.setState('free');
      m.music('uub_theme', 2);
      m.objective('posts', 'Break the training posts', { icon: 'target', target: 3 });
      m.objective('boulder', 'Break the boulder', { icon: 'target' });
      m.prompt('ub_strike', 'light', 'Strike', {});
      m.prompt('ub_straight', 'heavy', 'Straight punch', {});
      let posts = 0, rock = false;
      const off = b.on('propDestroyed', (e) => {
        if (!e.prop || !e.prop.id) return;
        if (e.prop.id.startsWith('post')) {
          posts++;
          m.progress('posts', posts);
          if (posts === 1) m.say('village_kid', 'Wooow! Again!', 1.6, { style: 'shout' });
        }
        if (e.prop.id === 'boulder') {
          rock = true;
          m.complete('boulder');
        }
      });
      m.lock(false);
      b.aiLocked = true;
      yield () => b.skipRequested || (posts >= 3 && rock);
      off();
      // a skip leaves the ground as the story needs it
      for (const pr of targets) if (pr.alive) b.stage.damageProp(pr, 1e6, u);
      m.complete('posts');
      m.complete('boulder');
      m.lock(true);
      K.clearCombat(b);
      u.setState('scripted', { pose: 'ub_idle', expression: 'calm' });
      yield* m.cine(0.6);
      m.flags.trained = { posts, rock };
      yield* SL.Cinema.play(m, 'ez_trained');
    },
  };
  P.depart = scene('depart', 'ez_depart');

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1);
      yield* m.cine(1.2);
      m.endShot();
      m.title(m.def.chapter, 'TEN YEARS LATER', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'endz_village',
    canon: true,
    chapter: 'CHAPTER 17 · THE END OF Z',
    title: 'Ten Years Later',
    subtitle: 'A boy from the south · Age 784',
    character: 'uub',
    stage: 'south_village',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Ten years of peace. In a dry village at the far end of the south, a shy boy carries the water, minds the children — and hits rocks a little too hard.',
    rewards: ['Story: Ten Years Later', 'Stage: Uub\'s Village'],
    setup,
    phases: [P.card, P.goku, P.village, P.train, P.depart, P.after],
  };
  SL.data.missions[def.id] = def;
})();
