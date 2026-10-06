/*
 * THE DRAGON BALL HUNTS (side content, Main menu → Dragon Balls) and the summoning.
 *
 *   db_hunt_1 … db_hunt_7   one ball each, on a stage the story built (SL.data.dragonBalls.spots):
 *     ARRIVE (scene)       Goku with the radar in his hands; the line for the place
 *     SEARCH (checkpoint)  played: the Dragon Radar on the HUD (SL.DragonBalls.radar), beeping faster as
 *                          he closes in; the ball glints when it is in sight. What is between him and
 *                          it depends on the place — a sleeping dinosaur, a boulder, a spire, two
 *                          treasure hunters, Saibamen in the ground, a village's children
 *     FOUND (scene)        the ball in his hand; how many he has now
 *   db_shenron             all seven: the ring on the grass, the words, the sky going dark, the Eternal
 *                          Dragon rising out of the light, ONE wish (a choice), the balls scattering
 *
 * Side missions (def.side): saved on their own track, never the story's progress.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const D = () => SL.data.dragonBalls;
  const DB = () => SL.DragonBalls;

  const at = (b, x, z, lift = 0) => new V3(x, (b.stage.hasGround ? b.stage.heightAt(x, z) : 0) + lift, z);
  const place = (f, pos, yaw) => SL.Staging.place(f, pos, yaw);
  const faceTo = (f, p) => (f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z));
  const scripted = () => ({ update: () => SL.emptyIntent() });
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  const starName = (n) => D().stars[n - 1];

  /** The tallest standing spire or building near a point (a ball on top of it). */
  function tallest(b, near, within = 95) {
    let best = null;
    for (const o of b.stage.obstacles) {
      if (!o.alive || o.shape !== 'cyl' || o.fixture) continue;
      if (Math.hypot(o.x - near.x, o.z - near.z) > within) continue;
      if (!best || o.top > best.top) best = o;
    }
    return best;
  }

  /** A boulder over the ball: a rough stone that has to be broken (a heavy blow, a blast). */
  function boulder(b, pos) {
    const pr = b.stage.addProp({ kind: 'boulder', pos: pos.clone().add(new V3(0, 1.1, 0)), r: 2.2, hp: 2400, id: 'dbBoulder' });
    pr.static = true;
    pr.rocky = true;
    pr.debrisColor = 0x8a8478;
    const col = b.stage.rockColor || 0x8a8478;
    const rock = new THREE.Mesh(b.stage.track(new THREE.DodecahedronGeometry(2.1, 0)), SL.Toon.mat(col));
    rock.scale.set(1.25, 0.85, 1.1);
    rock.rotation.set(0.2, 0.7, -0.1);
    SL.Toon.addOutline(rock, 2);
    pr.group.add(rock);
    return pr;
  }

  /* ---------------------------------------------------------------- one hunt */
  function huntDef(spot) {
    const P = {};
    const id = 'db_hunt_' + spot.star;

    P.arrive = {
      id: 'arrive',
      run: function* (m) {
        const b = m.battle, S = b.story, p = S.p;
        m.lock(true);
        m.title('DRAGON BALL HUNT', 'THE ' + starName(spot.star).toUpperCase() + '-STAR BALL', spot.where, 3.2);
        p.setState('scripted', { pose: 'lookHands', expression: 'calm' });
        SL.Cinema.shotOn(m, { p }, { subject: 'p', focus: 'upper', angle: 'three' }, 3.4, { cut: true, blendIn: 0, hold: true });
        m.say('goku', spot.line, 3.2);
        yield* m.cine(3.4);
        m.endShot();
      },
    };

    P.search = {
      id: 'search',
      checkpoint: true,
      run: function* (m) {
        const b = m.battle, S = b.story, p = S.p;
        m.lock(true);
        m.clearObjectives();
        p.setState('free');
        const got = { item: null, done: false };
        const collect = () => {
          got.done = true;
          DB().collect(spot.star);
        };
        let ballPos;
        if (spot.kind === 'high') {
          const o = tallest(b, p.pos);
          // on the roof / the top of the spire (a little above the drawn top: fighters stand on the collision's)
          ballPos = o ? new V3(o.x, o.top + 1.6, o.z) : at(b, 30, -30, 16);
        } else ballPos = at(b, spot.ball[0], spot.ball[1]);
        const guards = [];
        const spawnGuards = (hidden) => {
          let i = 0;
          for (const g of spot.guards || []) {
            for (let n = 0; n < g.count; n++, i++) {
              const a = i * 2.1 + 0.4;
              const pos = at(b, ballPos.x + Math.cos(a) * 5, ballPos.z + Math.sin(a) * 5);
              const f = b.spawn({ charId: g.charId, team: 1, pos, startKi: 40 });
              f.controller = scripted();
              f.setState('scripted', { pose: 'idle', expression: 'calm' });
              faceTo(f, p.pos);
              if (hidden) f.setHidden(true);
              guards.push(f);
            }
          }
        };
        const wake = () => {
          for (const f of guards) {
            if (!f.alive) continue;
            if (f.hidden) {
              f.setHidden(false);
              b.vfx.dust(f.pos.clone(), 2, 12, b.stage.def.terrain && b.stage.def.terrain.sand);
              b.sfx('burrow', f);
            }
            f.controller = cpu(b);
            f.target = p;
            f.setState('free');
          }
          if (guards.length) {
            m.objective('guards', 'Deal with whoever is guarding it', { icon: 'fist', optional: true });
            m.music('light_battle', 2);
          }
        };
        let woke = false;
        let dino = null, knocks = 0, rock = null;
        // what stands between him and the ball
        if (spot.kind === 'nest') {
          dino = new SL.Creature(b, SL.data.creatures.trex, { pos: at(b, ballPos.x + 6, ballPos.z - 4), yaw: Math.atan2(p.pos.x - ballPos.x, p.pos.z - ballPos.z), target: p });
          dino.setState('idle');
          m.objective('dino', 'Drive the dinosaur off (heavy blows)', { icon: 'dino', optional: true, target: 3 });
          const offM = b.on('meleeSwing', (e) => {
            if (e.fighter !== p || !dino || dino.state === 'flee' || dino.state === 'stagger') return;
            if (e.sd.kind !== 'heavy' && e.sd.kind !== 'dash') return;
            if (Math.hypot(e.center.x - dino.pos.x, e.center.z - dino.pos.z) > e.r + dino.radius + 1.2) return;
            knocks++;
            m.progress('dino', Math.min(3, knocks));
            dino.knockOver(dino.pos.clone().sub(p.pos));
            b.cameraTraumaAt(dino.pos, 0.4);
            if (knocks >= 3) {
              m.complete('dino');
              m.say('goku', 'Go on, get! Go back to sleep somewhere else!', 2.4, { style: 'shout' });
              dino.sd.then = null;
              b.after(1.2, () => dino.flee(p.pos));
            }
          });
          m.onDispose(offM);
        } else if (spot.kind === 'boulder') {
          rock = boulder(b, ballPos);
          m.prompt('dbRock', 'heavy', 'Break the boulder', { always: true, when: () => rock.alive && p.pos.distanceTo(rock.pos) < 7, until: () => !rock.alive });
        } else if (spot.kind === 'crater') {
          if (b.stage.crater) b.stage.crater(ballPos, 5, 0.6, null);
          ballPos.y = b.stage.heightAt(ballPos.x, ballPos.z);
          spawnGuards(true);
        } else if (spot.kind === 'village') {
          for (let i = 0; i < 2; i++) {
            const k = b.spawn({ charId: 'village_kid', team: 0, pos: at(b, ballPos.x + (i ? 1.6 : -1.4), ballPos.z + 1.2) });
            k.controller = scripted();
            k.untargetable = k.intangible = true;
            k.setState('scripted', { pose: i ? 'ez_wave' : 'vx_idle', expression: 'grin' });
            faceTo(k, p.pos);
            guards.push(k);
          }
        } else spawnGuards(false);
        // the ball: in the open, under the rock, or in the last hunter's hands
        const hiddenBall = spot.kind === 'boulder' || spot.kind === 'hunters';
        got.item = DB().spawn(m, spot.star, ballPos, { hidden: hiddenBall, onCollect: collect, reach: spot.kind === 'high' ? 2.6 : 1.8 });
        DB().radar(b, got.item);
        if (rock) {
          const offR = b.on('propDestroyed', (e) => {
            if (e.prop === rock) {
              got.item.reveal();
              m.say('goku', 'There it is!', 1.6, { style: 'shout' });
            }
          });
          m.onDispose(offR);
        }
        m.objective('ball', 'Find the ' + starName(spot.star) + '-Star Ball', { icon: 'target' });
        // LORE: capsules off the radar's path (src/data/lore.js) — exploration, never required
        const found = (SL.Save.data.lore = SL.Save.data.lore || {});
        const lore = (SL.data.lore || []).filter((l) => l.stage === spot.stage && !found[l.id]);
        if (lore.length) {
          let got2 = 0;
          m.objective('lore', 'Lore capsules hidden nearby', { icon: 'target', optional: true, target: lore.length });
          for (const l of lore) {
            m.pickup(at(b, l.at[0], l.at[1], 0.6), {
              kind: 'capsule', color: 0xf2f0ea, glow: 0x9ad8ff, r: 0.28,
              onCollect: () => {
                found[l.id] = true;
                if (SL.Save.write) SL.Save.write();
                m.progress('lore', ++got2);
                m.say('narrator', 'LORE — ' + l.title + ' (Records → Lore)', 2.6);
                b.emit('loreFound', { id: l.id });
              },
            });
          }
        }
        m.music(spot.kind === 'nest' || spot.kind === 'crater' ? 'ominous' : 'dragon_hunt', 1);
        m.lock(false);
        b.aiLocked = false;
        let villagers = false;
        const watch = () => {
          const d = p.pos.distanceTo(ballPos);
          if (!woke && d < 22) {
            woke = true;
            if (dino) {
              dino.roar();
              dino.sd.then = 'charge';
              m.say('goku', 'Whoa — he\'s awake!', 1.8, { style: 'shout' });
            } else if (spot.kind !== 'village') wake();
          }
          if (spot.kind === 'village' && !villagers && d < 9) {
            villagers = true;
            m.say('village_kid', 'Mister! Is this yours? It glowed all night — we were scared!', 3.2);
          }
          // the hunters had it: the last one down drops it
          if (spot.kind === 'hunters' && got.item.hidden && guards.length && guards.every((f) => !f.alive || f.hp <= 1 || f.state === 'knockdown' && f.hpFrac < 0.05)) {
            const last = guards[guards.length - 1];
            got.item.pos.copy(at(b, last.pos.x, last.pos.z));
            got.item.group.position.copy(got.item.pos);
            got.item.reveal();
            m.complete('guards');
          }
          if (guards.length && spot.kind !== 'village' && woke && guards.every((f) => !f.alive)) m.complete('guards');
        };
        m.tickHooks.push(watch);
        yield () => got.done || m.state !== 'running';
        const i = m.tickHooks.indexOf(watch);
        if (i >= 0) m.tickHooks.splice(i, 1);
        DB().radar(b, null);
        m.complete('ball');
        m.lock(true);
        for (const f of guards) if (f.alive && f.controller && f.team === 1) f.controller = scripted();
        if (dino && dino.state !== 'flee') dino.flee(p.pos);
      },
    };

    P.found = {
      id: 'found',
      run: function* (m) {
        const b = m.battle, S = b.story, p = S.p;
        m.lock(true);
        m.clearObjectives();
        p.setState('scripted', { pose: 'lookHands', expression: 'grin' });
        // the ball in his hands
        const held = DB().model(spot.star, 0.2);
        b.scene.add(held);
        const tick = () => held.position.copy(p.handPos('R').lerp(p.handPos('L'), 0.5)).add(new V3(0, 0.12, 0));
        tick();
        m.tickHooks.push(tick);
        m.onDispose(() => {
          if (held.parent) b.scene.remove(held);
          held.userData.dispose();
        });
        SL.Cinema.shotOn(m, { p }, { subject: 'p', focus: 'upper', angle: 'front' }, 3.2, { cut: true, blendIn: 0, hold: true });
        b.sfx('learn', p);
        const n = DB().count();
        m.say('goku', spot.star === 4 ? 'The four-star ball... Grandpa\'s ball. Hi, Grandpa.' : 'Got it! The ' + starName(spot.star).toLowerCase() + '-star ball!', 3);
        yield* m.cine(3.2);
        m.endShot();
        m.fade('black', 0.8);
        yield* m.cine(0.9);
        m.title('DRAGON BALL HUNT', n >= 7 ? 'ALL SEVEN DRAGON BALLS' : n + ' / 7 DRAGON BALLS', n >= 7 ? 'Summon the Eternal Dragon from the Dragon Balls menu' : 'The radar has ' + (7 - n) + ' more to find', 3.6);
        yield* m.cine(3.8);
      },
    };

    return {
      id,
      side: true,
      hunt: true,
      chapter: 'DRAGON BALL HUNT',
      title: 'The ' + starName(spot.star) + '-Star Ball',
      subtitle: spot.where,
      character: D().hunter,
      stage: spot.stage,
      parTime: 240,
      rules: { allowTransform: true, allowUltimates: true },
      blurb: spot.clue,
      rewards: ['The ' + starName(spot.star) + '-Star Dragon Ball'],
      setup(b) {
        const st = spot.start;
        const p = b.spawn({ charId: D().hunter, player: true, team: 0, pos: at(b, st[0], st[2]), startKi: 60 });
        b.story = { p, spot };
      },
      phases: [P.arrive, P.search, P.found],
    };
  }

  for (const spot of SL.data.dragonBalls.spots) {
    const def = huntDef(spot);
    SL.data.missions[def.id] = def;
  }

  /* ---------------------------------------------------------------- the summoning */
  const SH = {};
  SH.summon = {
    id: 'summon',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.p;
      const EK = SL.data.endzKit;
      m.lock(true);
      m.clearObjectives();
      const centre = at(b, 0, 0);
      S.balls = EK.dragonBalls(b, centre);
      m.onDispose(() => S.balls && S.balls.dispose());
      place(p, at(b, 0, 4.2), Math.PI);
      faceTo(p, centre);
      p.setState('scripted', { pose: 'stand', expression: 'calm' });
      m.title('DRAGON BALLS', 'THE ETERNAL DRAGON', 'Seven balls, one wish', 3.2);
      m.music('mystery', 1);
      // the ring on the grass, from low
      m.shot((t, out) => {
        out.pos.copy(centre).add(new V3(Math.sin(t * 0.6) * 3.2, 0.6, Math.cos(t * 0.6) * 3.2));
        out.look.copy(centre).add(new V3(0, 0.25, 0));
        out.fov = 46;
      }, 4, { cut: true, blendIn: 0, hold: true });
      let k = 0;
      const glow = () => S.balls.glow((k = Math.min(1, k + 1 / 200)));
      m.tickHooks.push(glow);
      yield* m.cine(3.4);
      SL.Cinema.shotOn(m, { p }, { subject: 'p', focus: 'upper', angle: 'front' }, 4, { cut: true, blendIn: 0, hold: true });
      p.setState('scripted', { pose: 'powerUp', expression: 'shout' });
      m.say('goku', 'Eternal Dragon — I call you by your name. Come out, SHENRON!', 3.2, { style: 'shout' });
      yield* m.cine(3.3);
      // the sky goes dark; the light goes up
      b.stage.setMood(0.78, 0x080a16, 1.6);
      SL.Audio.play('rumble', { vol: 1 });
      m.music('shenron', 1);
      b.camera.addTrauma(0.35);
      for (let i = 0; i < 4; i++) b.vfx.skyBolt(centre.clone().add(new V3(Math.sin(i * 1.7) * 20, 0, Math.cos(i * 1.7) * 20 - 10)), 60);
      SL.ScreenFX.flash(0.5, '#ffe8a0');
      b.vfx.ring(centre.clone().add(new V3(0, 0.2, 0)), 6, 0xffd060, 0.8, new V3(0, 1, 0));
      p.setState('scripted', { pose: 'lookAround', expression: 'shock' });
      const base = centre.clone().add(new V3(0, 0.4, -14));
      S.dragon = EK.shenron(b, base, p.pos);
      m.onDispose(() => S.dragon && S.dragon.dispose());
      S.dragon.rise(0);
      S.dragon.eyes(0);
      // the dragon pours up out of the light: the lens climbs with it
      let r = 0;
      const rise = () => S.dragon.rise((r = Math.min(1, r + 1 / 210)));
      m.tickHooks.push(rise);
      // far back and low behind Goku: the whole column climbing out of the light, him small under it
      m.shot((t, out) => {
        const top = S.dragon.headPos();
        const toward = p.pos.clone().sub(base).setY(0).normalize();
        out.pos.copy(base).addScaledVector(toward, 30).add(new V3(toward.z * 7, 3 + t * 6, -toward.x * 7));
        out.look.copy(base).lerp(top, 0.25 + 0.5 * U.easeInOutCubic(t));
        out.fov = 60;
      }, 3.6, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(3.8);
      S.dragon.rise(1);
      S.dragon.eyes(1);
      SL.Audio.play('roar', { pitch: 0.5, vol: 1.2 });
      m.shot((t, out) => {
        const hp = S.dragon.headPos();
        const toward = p.pos.clone().sub(hp).setY(0).normalize();
        out.pos.copy(hp).addScaledVector(toward, 13 - t * 1.5).add(new V3(toward.z * 3, -2.5, -toward.x * 3));
        out.look.copy(hp);
        out.fov = 44;
      }, 30, { cut: true, blendIn: 0.3, hold: true });
      m.say('shenron', 'I am the Eternal Dragon. Speak your wish — I will grant you one.', 4, { style: 'shout' });
      yield* m.cine(4.2);
    },
  };

  SH.wish = {
    id: 'wish',
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.p;
      m.lock(true);
      const opts = DB().wishOptions();
      let pick = null;
      // the choice is the player's (a menu over the frozen moment); headless bots take the first
      if (SL.Screens && SL.Screens.wishes && SL.App && SL.App.battle === b) {
        SL.UI.push(SL.Screens.wishes(opts, (id) => (pick = id)));
        yield () => pick !== null;
      } else pick = opts[0] ? opts[0].id : 'peace';
      const w = SL.data.dragonBalls.wishes.find((x) => x.id === pick);
      p.setState('scripted', { pose: 'stand', expression: 'calm' });
      SL.Cinema.shotOn(m, { p }, { subject: 'p', focus: 'upper', angle: 'front' }, 3, { cut: true, blendIn: 0, hold: true });
      m.say('goku', w ? w.title + '!' : 'A peaceful day.', 2.8, { style: 'shout' });
      yield* m.cine(3);
      m.endShot();
      const text = DB().grant(pick);
      m.flags.wishText = text;
      m.shot((t, out) => {
        const hp = S.dragon.headPos();
        const toward = p.pos.clone().sub(hp).setY(0).normalize();
        out.pos.copy(hp).addScaledVector(toward, 13 - t * 1.5).add(new V3(toward.z * 3, -2.5, -toward.x * 3));
        out.look.copy(hp);
        out.fov = 44;
      }, 30, { cut: true, blendIn: 0, hold: true });
      b.vfx.flash(S.dragon.headPos(), 6, 0xff4040, 0.4, SL.Toon.tex.glow);
      m.say('shenron', pick === 'peace' ? '...Granted. That one is easy. Farewell.' : 'Your wish has been granted. Farewell.', 3.4, { style: 'shout' });
      yield* m.cine(3.6);
      // the dragon goes back into the light; the balls rise and fly apart
      let r = 1, sc = 0;
      const back = () => {
        S.dragon.rise((r = Math.max(0, r - 1 / 120)));
        S.dragon.eyes(r);
        if (r <= 0.3) S.balls.scatter((sc = Math.min(1, sc + 1 / 120)));
      };
      m.tickHooks.push(back);
      b.stage.setMood(0, 0x080a16, 3);
      m.music('hopeful', 1);
      m.shot((t, out) => {
        out.pos.copy(p.pos).add(new V3(2.4, 1, 4.4));
        out.look.copy(at(b, 0, 0).add(new V3(0, U.lerp(4, 30, t), -6)));
        out.fov = 56;
      }, 4.4, { cut: true, blendIn: 0.3, hold: true });
      yield* m.cine(4.4);
      DB().scatter();
      p.setState('scripted', { pose: 'lookAround', expression: 'grin' });
      m.say('goku', 'There they go. See you next time, Shenron!', 2.6);
      yield* m.cine(2.8);
      m.endShot();
    },
  };

  SH.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title('THE DRAGON BALLS SCATTER', 'YOUR WISH HAS BEEN GRANTED', m.flags.wishText || '', 4.4);
      yield* m.cine(4.6);
    },
  };

  SL.data.missions.db_shenron = {
    id: 'db_shenron',
    side: true,
    hunt: true,
    chapter: 'DRAGON BALLS',
    title: 'The Eternal Dragon',
    subtitle: 'Seven balls, one wish',
    character: 'goku',
    stage: 'plains',
    parTime: 120,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'All seven together: call the Eternal Dragon and make one wish. Then they scatter across the world again.',
    rewards: ['One wish'],
    setup(b) {
      const p = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(b, 0, 4.2), startKi: 40 });
      b.story = { p };
    },
    phases: [SH.summon, SH.wish, SH.after],
  };
})();
