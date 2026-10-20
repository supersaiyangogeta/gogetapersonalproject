/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 2: "The Wild Planet" (Vampa)
 *
 *   EXILE *    (scene bb_vp_exile)   Vampa: a sickly sky over a dead waste, thorn stalks, acid lakes. A small pod
 *                                    smoking in a crater — and Paragus, limping across the grit to it. "Years pass."
 *   HUNT *     (explore)             BROLY, grown, alone: follow the tremors across the waste to the hunting ground
 *                                    (the ground shakes; the dust lifts toward it). A rockfall blocks the gully —
 *                                    smash through it with your bare hands.
 *   BEAST *    (fight)               the Vampa beast: a giant worm that hunts by the tremor of your steps. It tunnels
 *                                    under a furrow of grit, rises with a red ring under it, lunges, sways — hit its
 *                                    head while it is up. Then: tear it out of the ground (Heavy).
 *   BA         (scene bb_vp_ba)      his friend Ba, the huge gentle beast; the catch shared — and Paragus with the
 *                                    remote. "Enough playing." The collar. Broly on his knees.
 *   TRAINING * (play)                "Again." Break the standing stones Paragus points at, his remote in his hand.
 *   ARRIVAL    (scene bb_vp_arrival) a ship comes down: Cheelai and Lemo, Frieza Force. "Lord Frieza is recruiting."
 *                                    Paragus hears the prince's name. "Take us to Frieza." Broly gives his name.
 *   AFTER                            the title; next: "The First Clash".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;

  const VP = { rockHp: 2200, wormHp: 11000, stoneHp: 2400, trainSeconds: 70, tremorEvery: 160, hits: 2 };

  function setup(battle) {
    const b = battle;
    const L = b.stage.landmarks || {};
    const broly = b.spawn({ charId: 'broly', player: true, team: 0, pos: L.caveMouth ? L.caveMouth.clone() : BK.at(b, -50, 36), startKi: 100 });
    const paragus = b.spawn({ charId: 'paragus', team: 0, pos: BK.at(b, -56, 30), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 1, pos: BK.at(b, 40, -70), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 1, pos: BK.at(b, 43, -70), startKi: 0 });
    K.watcher(paragus, 'pg_idle', 'cold');
    K.watcher(cheelai, 'ch_idle', 'smirk');
    K.watcher(lemo, 'le_idle', 'calm');
    for (const f of [cheelai, lemo]) f.setHidden(true);
    broly.cannotDie = true;
    b.story = { broly, paragus, cheelai, lemo, goal: null, hitProp: null };
  }

  /** A breakable stone: a rocky prop (it shatters into chunks), lockable, with its own health. */
  function stone(m, pos, r, h, color) {
    const b = m.battle, st = b.stage;
    const pr = st.addProp({ kind: 'stone', pos: pos.clone().add(new V3(0, h * 0.45, 0)), r, hp: VP.stoneHp, id: 'stone' });
    pr.rocky = true;
    pr.lockable = true;
    pr.static = true;
    pr.debrisColor = color || 0x6a5a3a;
    pr.explodeColor = 0xb8a878;
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), SL.Toon.mat(color || 0x6a5a3a));
    mesh.scale.set(r, h * 0.55, r * 0.9);
    mesh.rotation.y = pos.x * 0.37;
    mesh.castShadow = true;
    SL.Toon.addOutline(mesh, 1.6);
    pr.group.add(mesh);
    m.onDispose(() => mesh.geometry.dispose());
    return pr;
  }

  /** Where the hunt ends and the beast comes up: open ground, the old ribs in sight beyond it. */
  function huntingGround(b) {
    const L = b.stage.landmarks;
    const p = L.ribs.clone().lerp(L.caveMouth, 0.3);
    return BK.at(b, p.x, p.z);
  }

  const P = {};

  P.exile = {
    id: 'exile',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      S.broly.setHidden(true);
      // the pod in its crater, still smoking
      if (!S.pod) {
        const c = L.crash.clone();
        b.stage.crater(c, 4, 1.2, null);
        const pr = b.stage.addProp({ kind: 'pod', pos: BK.at(b, c.x, c.z, 0.4), r: 1.1, hp: 1e9, id: 'babyPod' });
        pr.lockable = false;
        pr.invulnerable = true;
        pr.static = true;
        pr.group.rotation.set(0.5, 0.3, 0.2);
        S.pod = pr;
        let n = 0;
        b.onTick(() => {
          if (b.disposed || !pr.group.visible) return false;
          if (++n % 10 === 0) b.vfx.smoke.emit(pr.pos.x, pr.pos.y + 0.8, pr.pos.z, 0, 1.2, 0, 0.42, 0.4, 0.36, 0.5, 0.8, 1.8, { grow: 1.6, drag: 0.8 });
          return n < 60 * 90;
        });
      }
      const pg = S.paragus;
      K.place(pg, BK.at(b, L.crash.x + 22, L.crash.z + 14), 0);
      K.faceTo(pg, L.crash);
      yield* SL.Cinema.play(m, 'bb_vp_exile');
      if (S.pod) S.pod.group.visible = false;
    },
  };

  P.hunt = {
    id: 'hunt',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, br = S.broly, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      S.paragus.setHidden(true);
      br.setHidden(false);
      K.place(br, L.caveMouth.clone(), 0);
      K.faceTo(br, L.ribs);
      b.switchPlayer(br, { force: true, quiet: true });
      br.setState('free');
      m.title(BK.CHAPTER, 'THE WILD PLANET', 'Vampa · forty years later', 3.2);
      m.music('vampa', 1);
      // the hunting ground: open grit short of an old kill's ribs; the rockfall in the gully on the way
      const ground = huntingGround(b);
      const mid = L.caveMouth.clone().lerp(ground, 0.55);
      const side = new V3(ground.z - L.caveMouth.z, 0, L.caveMouth.x - ground.x).normalize();
      if (!S.rocks) {
        S.rocks = [-1, 0, 1].map((k) => stone(m, BK.at(b, mid.x + side.x * k * 3.4, mid.z + side.z * k * 3.4), 2.2, 4.4, 0x5a4a30));
        for (const r of S.rocks) r.hp = r.maxHp = VP.rockHp;
      }
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'full', angle: 'low' }, 2.4, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(2.4);
      m.endShot();
      m.objective('tremor', 'Follow the tremors to the hunting ground', { icon: 'run' });
      m.objective('rocks', 'Smash through the rockfall', { icon: 'fist', target: S.rocks.length });
      b.emit('markers', { list: [{ obj: { pos: mid, alive: true }, icon: 'run' }] });
      m.prompt('bbRocks', 'heavy', 'Rocks in the way: Heavy breaks them', { when: () => S.rocks.some((r) => r.alive && r.pos.distanceTo(br.pos) < 6) });
      let t = 0;
      const tremor = () => {
        if (b.inputLocked) return;
        t++;
        if (t % VP.tremorEvery === 0) {
          b.camera.addTrauma(0.22);
          b.sfx('rumble', null, { at: ground, vol: 0.7, pitch: 0.6 });
          b.vfx.dust(BK.at(b, ground.x, ground.z, 0.3), 3, 14, b.stage.def.dust);
        }
        const left = S.rocks.filter((r) => r.alive);
        // the bot (and the HUD) know where to go: the rocks while any stand, then the ground
        if (left.length && br.pos.distanceTo(left[0].pos) < 9) {
          S.goal = null;
          S.hitProp = left[0];
        } else if (left.length) {
          S.goal = mid;
          S.hitProp = null;
        } else {
          S.goal = ground;
          S.hitProp = null;
        }
        if (S.rocksShown !== left.length) m.progress('rocks', S.rocks.length - (S.rocksShown = left.length));
      };
      m.tickHooks.push(tremor);
      m.lock(false);
      b.aiLocked = false;
      let markedGround = false;
      yield () => {
        if (!markedGround && S.rocks.every((r) => !r.alive)) {
          markedGround = true;
          b.emit('markers', { list: [{ obj: { pos: ground, alive: true }, icon: 'run' }] });
        }
        return (S.rocks.every((r) => !r.alive) && br.pos.distanceTo(ground) < 14) || m.state !== 'running';
      };
      K.unhook(m, tremor);
      S.goal = null;
      S.hitProp = null;
      b.emit('markers', { list: [] });
      if (m.state !== 'running') return;
      m.complete('rocks');
      m.complete('tremor');
      m.lock(true);
    },
  };

  P.beast = {
    id: 'beast',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, br = S.broly, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      br.setHidden(false);
      const hg = huntingGround(b);
      if (br.pos.distanceTo(hg) > 30) K.place(br, hg.clone(), 0);
      K.faceTo(br, L.ribs);
      br.hp = Math.max(br.hp, br.hpMax * 0.9);
      b.switchPlayer(br, { force: true, quiet: true });
      // the ground opens: the beast
      const W = BK.worm(m, { at: BK.at(b, br.pos.x + 14, br.pos.z - 10), hp: VP.wormHp, target: () => br, damage: 1400 });
      S.worm = W;
      S.hitProp = () => (W.state === 'sway' || W.state === 'rise' ? W.head : null);
      m.music('broly_theme', 2);
      m.objective('beast', 'Bring down the Vampa beast — hit its head while it is out of the ground', { icon: 'fist' });
      m.objective('clean', 'Do not let its lunge catch you more than twice', { icon: 'guard', optional: true });
      m.prompt('bbWorm', 'dodge', 'A red ring under you: it is coming up there — move!', { required: true, when: () => W.state === 'rise', until: () => W.lunges >= 2 });
      const offL = b.on('wormLunge', (e) => {
        if (e.hit) W.caught = (W.caught || 0) + 1;
        if ((W.caught || 0) > VP.hits) m.failObjective('clean');
      });
      m.onDispose(offL);
      m.say('broly', '...', 1.2);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      yield () => {
        if (!b.inputLocked) t += 1 / 60;
        // nobody is stuck: after a long fight it gives up the ghost on the next good blow
        if (t > 150 && !W.done && W.hp > W.maxHp * 0.2) W.hp = W.maxHp * 0.2;
        return W.done || m.state !== 'running';
      };
      offL();
      S.hitProp = null;
      if (m.state !== 'running') return;
      m.complete('beast');
      if ((W.caught || 0) <= VP.hits) m.complete('clean');
      m.lock(true);
      K.clearCombat(b);
      // it sags over the ground; Broly takes hold of it
      W.hold();
      const head = W.head.pos.clone();
      K.place(br, BK.at(b, head.x + 2.2, head.z + 2.2), 0);
      K.faceTo(br, head);
      br.setState('scripted', { pose: 'br_liftW', expression: 'serious' });
      m.shot((tt, out) => {
        out.pos.copy(br.pos).add(new V3(7, 2.4, -5));
        out.look.copy(br.chest().lerp(head, 0.5));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.objective('tear', 'Tear it out of the ground', { icon: 'fist' });
      const r = yield* m.cue('heavy', 'Tear it out of the ground', { auto: 4, slow: 0.4 });
      m.qteParts.push(r.pressed ? 1 : 0.5);
      m.complete('tear');
      br.setState('scripted', { pose: 'br_slam', expression: 'shout', speed: 16 });
      b.sfx('roar', br, { pitch: 0.6, vol: 1 });
      // the whole length of it comes up and over, and down on the other side
      const from = head.clone(), to = BK.at(b, br.pos.x - (head.x - br.pos.x) * 2.4, br.pos.z - (head.z - br.pos.z) * 2.4, 1.6);
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 24);
        const p = from.clone().lerp(to, k);
        p.y += Math.sin(k * Math.PI) * 9;
        W.head.pos.copy(p);
        W.head.group.position.copy(p);
        W.segs.forEach((s, i) => s.position.lerp(p, 0.12 + i * 0.01));
        return k >= 1;
      };
      b.stage.crater(BK.at(b, to.x, to.z), 5, 1.4, null);
      b.vfx.dust(BK.at(b, to.x, to.z, 0.3), 4, 22, b.stage.def.dust);
      b.vfx.debrisBurst(BK.at(b, to.x, to.z, 0.6), 14, b.stage.def.terrain.dirt, 10, 0.3);
      b.sfx('groundImpact', null, { at: to, vol: 1.4 });
      b.cameraTraumaAt(to, 0.8);
      yield* m.cine(1.2);
      br.setState('scripted', { pose: 'br_idle', expression: 'calm' });
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'upper', angle: 'three' }, 2.2, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  P.ba = {
    id: 'ba',
    run: function* (m) {
      const b = m.battle, S = b.story, br = S.broly, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (S.worm) S.worm.dispose();
      // home, by the cave: Ba waiting, the catch dropped between them
      K.place(br, BK.at(b, L.caveMouth.x + 3, L.caveMouth.z + 4), 0);
      if (!S.ba) S.ba = BK.ba(m, BK.at(b, L.caveMouth.x + 11, L.caveMouth.z + 10), 0);
      const bap = S.ba.group.position;
      K.faceTo(br, bap);
      S.ba.setPos(bap, Math.atan2(br.pos.x - bap.x, br.pos.z - bap.z));
      const pg = S.paragus;
      pg.setHidden(false);
      K.place(pg, BK.at(b, L.caveMouth.x - 9, L.caveMouth.z + 12), 0);
      K.faceTo(pg, br.pos);
      S.baPos = bap.clone();
      yield* SL.Cinema.play(m, 'bb_vp_ba');
    },
  };

  P.training = {
    id: 'training',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, br = S.broly, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (S.worm && !S.worm.done) S.worm.dispose();
      if (!S.ba) S.ba = BK.ba(m, BK.at(b, L.caveMouth.x + 11, L.caveMouth.z + 10), 0);
      const pg = S.paragus;
      pg.setHidden(false);
      const yard = BK.at(b, L.caveMouth.x + 16, L.caveMouth.z - 14);
      K.place(pg, BK.at(b, yard.x - 10, yard.z + 6), 0);
      K.place(br, BK.at(b, yard.x - 4, yard.z + 2), 0);
      K.faceTo(br, yard);
      K.faceTo(pg, yard);
      K.watcher(pg, 'pg_remote', 'cold');
      if (!S.stones) S.stones = [[0, 0], [7, -5], [-6, -8], [4, 9]].map(([x, z], i) => stone(m, BK.at(b, yard.x + x, yard.z + z), 1.5, 6 + i, 0x7a6a44));
      b.switchPlayer(br, { force: true, quiet: true });
      br.setState('free');
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      br.ki = br.kiMax;
      m.music('broly_theme', 1);
      m.say('paragus', 'Again, Broly. Break them. All of them.', 2.6);
      m.objective('stones', 'Paragus\' training: break the standing stones', { icon: 'fist', target: S.stones.length });
      b.emit('markers', { list: S.stones.map((s) => ({ obj: s, icon: 'fist' })) });
      let t = 0, done = -1, said = false;
      const hook = () => {
        if (!b.inputLocked) t += 1 / 60;
        const left = S.stones.filter((s) => s.alive);
        S.hitProp = left.sort((a, c) => a.pos.distanceTo(br.pos) - c.pos.distanceTo(br.pos))[0] || null;
        const n = S.stones.length - left.length;
        if (n !== done) m.progress('stones', (done = n));
        if (!said && n >= 2) {
          said = true;
          m.say('paragus', 'Faster! Your power belongs to our revenge — not to that beast.', 3);
        }
      };
      m.tickHooks.push(hook);
      m.lock(false);
      b.aiLocked = false;
      yield () => S.stones.every((s) => !s.alive) || t > VP.trainSeconds || m.state !== 'running';
      K.unhook(m, hook);
      S.hitProp = null;
      b.emit('markers', { list: [] });
      if (m.state !== 'running') return;
      // anything left standing, he brings down on his father's word
      for (const s of S.stones) if (s.alive) b.stage.damageProp(s, 99999, br);
      m.complete('stones');
      m.lock(true);
      K.clearCombat(b);
      br.setState('scripted', { pose: 'br_idle', expression: 'calm' });
      yield* m.cine(0.8);
    },
  };

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, br = S.broly, L = b.stage.landmarks;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // the ship comes down on the flat beyond the yard
      const land = BK.at(b, L.caveMouth.x + 30, L.caveMouth.z - 30);
      if (!S.ship) S.ship = BK.ship(m, land, Math.atan2(L.caveMouth.x - land.x, L.caveMouth.z - land.z));
      const ship = S.ship;
      let n = 0;
      b.onTick(() => {
        if (b.disposed || n >= 120) return false;
        n++;
        ship.lift(1 - n / 120);
        if (n === 120) {
          b.vfx.dust(land.clone(), 4, 20, b.stage.def.dust);
          b.sfx('groundImpact', null, { at: land, vol: 0.6, pitch: 1.3 });
        }
        return true;
      });
      ship.lift(1);
      const ch = S.cheelai, le = S.lemo, pg = S.paragus;
      for (const f of [ch, le, pg]) f.setHidden(false);
      K.place(ch, BK.at(b, land.x - 5, land.z + 5), 0);
      K.place(le, BK.at(b, land.x - 7, land.z + 3), 0);
      const meet = BK.at(b, L.caveMouth.x + 14, L.caveMouth.z - 12);
      K.place(br, meet.clone(), 0);
      K.place(pg, BK.at(b, meet.x - 3, meet.z + 2), 0);
      K.faceTo(ch, br.pos);
      K.faceTo(le, br.pos);
      K.faceTo(br, ch.pos);
      K.faceTo(pg, ch.pos);
      if (S.ba) S.ba.setPos(BK.at(b, meet.x - 12, meet.z + 9), Math.atan2(ch.pos.x - meet.x, ch.pos.z - meet.z));
      S.shipLand = land;
      yield* SL.Cinema.play(m, 'bb_vp_arrival');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'THE WILD PLANET', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_vampa',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'The Wild Planet',
    subtitle: 'Part 2 · Vampa',
    character: 'broly',
    stage: 'vampa',
    parTime: 420,
    qteLabel: 'The beast',
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'A dead world at the edge of everything. A boy who grew up there with nothing but his father, a remote, and one friend the size of a house.',
    rewards: ['Movie: The Wild Planet'],
    setup,
    phases: [P.exile, P.hunt, P.beast, P.ba, P.training, P.arrival, P.after],
  };

  SL.data.bbVampa = { VP };
  SL.data.missions[def.id] = def;
})();
