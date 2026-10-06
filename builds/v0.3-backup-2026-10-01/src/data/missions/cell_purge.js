/*
 * THE DIFFERENCE IN POWER — the Cell Games' `purge` stretch, rebuilt (owner's brief, 2026-09-24):
 * Super Saiyan 2 Gohan against the seven Cell Juniors as a hack-and-slash power reveal. It runs
 * as the `purge` checkpoint of `cell_games` (same mission, same place in the story: after the
 * Super Saiyan 2 reveal, before Gohan vs Cell); `cell_games.js` hands it its staging kit.
 *
 * What it is made of — every piece is an existing system, tuned for this stretch:
 *   the squad   SL.JuniorSquad (at most two swinging at him, Known Bugs #36 cap) with a MOOD the
 *               stretch sets as they fall: 'hunt' → 'desperate' → 'last' (behaviour only; no
 *               stat changes), plus hesitation after every kill and a step back after a smash;
 *   Gohan       damage, armour against light blows (storyArmor), a sense for blows from behind
 *               that turns into a one-arm Perfect Guard and an automatic counter (storyEvade
 *               'guard'), and an Aura Burst on the ultimate button (the bomberWave technique);
 *   finishers   every Junior he destroys gets a hit-stop, a short slow-down, lightning off him
 *               and a body reaction chosen by the blow that did it (launched, rocketed upward,
 *               slammed into a crater, spiked down from the air, blown apart); the last one gets
 *               the biggest, and a scene after it;
 *   the world   his big blows crack the ring under them, bodies crater it, the burst scorches it;
 *   the gi      clean at the start, damaged after the second kill, heavily damaged after the
 *               fifth (Fighter.setDamage with the gi's own rips);
 *   beats       purge_open (they surround him; he looks at them), purge_catch (the first blow is
 *               caught — only if he has not already started destroying them), purge_last (dust,
 *               silence, the camera round him). Scenes are in src/data/scenes/cell_games.js.
 * No objective text, no prompts: the stretch ends when the last of them is gone.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const UP = new V3(0, 1, 0);

  // Gohan's burst for this stretch: the aura goes out, everybody close goes the other way. It is shot
  // close by the gameplay camera with three Juniors hit at once, so its look is kept small (no
  // warning dome, a small fireball and ring, a low light and impact) — the reach is the boss one's
  const AURA_BURST = {
    id: 'tg2Burst', name: 'Aura Burst', type: 'bomberWave', kiCost: 34, icon: 'ultimate', cooldown: 300,
    ultimate: false, cinematic: false,
    charge: 12, radius: 6.8, damage: 900, knockSpeed: 34, recovery: 22, impact: 1,
    look: { telegraph: false, color: 0xffe25a, ringColor: 0xfff3c0, aura: 0.55, blast: 0.2, ring: 0.7, light: 1, ground: 0.35, flash: 0.1 },
    poses: { charge: 'tg_ssjClench', release: 'powerUp', winded: 'tg2_stance' },
  };

  /*
   * FINISHERS by the blow that did it. vel: [forward, up] in m/s along the line from Gohan to
   * the body (up negative drives it into the ground); stop: hit-stop frames on both of them;
   * slow: [time scale, real seconds]; boom: an explosion at the body (a ki kill).
   */
  const FINISH = {
    launch: { vel: [34, 8], stop: 9, slow: [0.3, 0.2], trauma: 0.45 },
    rocket: { vel: [3, 30], stop: 9, slow: [0.3, 0.24], trauma: 0.45 },
    slam: { vel: [5, -40], stop: 10, slow: [0.28, 0.22], trauma: 0.6 },
    spike: { vel: [20, -24], stop: 9, slow: [0.3, 0.22], trauma: 0.55 },
    blast: { vel: [26, 10], stop: 7, slow: [0.35, 0.2], trauma: 0.5, boom: 2.2 },
    burst: { vel: [30, 12], stop: 8, slow: [0.3, 0.3], trauma: 0.6, boom: 1.6 },
  };

  const CP = (SL.data.cellPurge = {
    AURA_BURST,
    FINISH,
    CENTRE: new V3(0, 0, 4), // on the ring, the arena itself
    RING: 7.5,
    DEALT: 1.8,
    TAKEN: 0.3,
    SHAKEN: 32, // frames the survivors hold back after one of them is destroyed (plus a stagger each)

    /** Which finisher a killing blow earns. */
    kind(b, j, hit) {
      hit = hit || {};
      if (hit.technique === AURA_BURST.id) return 'burst';
      if (hit.type === 'beam' || hit.type === 'ki' || hit.type === 'explosion') return 'blast';
      if (hit.knock === 'launch') return 'rocket';
      if (hit.knock === 'smash') return 'slam';
      if (j.pos.y - b.stage.heightAt(j.pos.x, j.pos.z) > 1.2) {
        // in the air: from above it goes straight down; a heavy blow sends it across the sky
        const gh = b.story.gohan;
        if (gh && gh.pos.y > j.pos.y + 0.8) return 'slam';
        return hit.knock === 'heavy' || hit.knock === 'crumple' || (hit.impact || 1) >= 3 ? 'launch' : 'spike';
      }
      return 'launch';
    },

    /** The first swing that is about to reach him, if there is one he can catch. */
    catchable(b, gh, juniors) {
      if (!['free', 'guard', 'dash', 'land'].includes(gh.state)) return null;
      return juniors.find((j) => j.alive && j.state === 'attack' && j.target === gh && !j.sd.hit && j.distTo(gh) < 2.8) || null;
    },

    /** Moment A's blow (purge_catch): applied once, watched or skipped. Impact 2: the scene is shot close, and a
     *  bigger impact burst would white out the frame; the scene brings its own shake and slow-down. */
    catchBlow(m, gh, j) {
      const b = m.battle, st = b.story.purge;
      if (!j || !j.alive || (st && st.caught)) return;
      if (st) st.caught = true;
      const dir = j.pos.clone().sub(gh.pos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(Math.sin(gh.yaw), 0, Math.cos(gh.yaw));
      dir.normalize().setY(0.22).normalize();
      j.setState('free');
      j.takeHit(gh, { type: 'melee', damage: 900, knock: 'heavy', knockSpeed: 44, hitstun: 60, impact: 2, dir, point: j.chest(), sfx: 'punchHeavy' });
      b.vfx.ring(j.chest(), 1.5, 0xfff0b0, 0.3);
      b.vfx.bolt(gh.chest().add(new V3(0.2, 0.3, 0)), 1.4, 0xdff6ff);
      b.slowmo(0.3, 0.45);
      b.emit('purgeCatch', { fighter: j });
    },

    *run(m, kit) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell, CG = kit.CG;
      kit.prep(m);
      kit.restoreStory(m, 'purge');
      b.rules.pressure = { melee: 2, ranged: 1, gap: 70, grace: 120 };
      kit.takeControl(b, gh);
      gh.lockedForms = {};
      kit.toForm(gh, 'ssj2');
      gh.setRage(true, 1);
      gh.setDamage(0); // clean going in; the fight is what wears it
      gh.hp = Math.max(gh.hp, Math.round(gh.hpMax * 0.85));
      gh.ki = gh.kiMax;
      gh.stamina = gh.staminaMax;
      gh.winded = false;
      gh.cannotDie = true;
      const juniors = CG.ensureJuniors(m);
      // THE POWER GAP: he hits hard, light blows do not move him, and what comes from behind is felt
      gh.damageDealtMul = CP.DEALT;
      gh.damageTakenMul = CP.TAKEN;
      gh.storyArmor = 1;
      gh.storyEvade = { mode: 'guard', behind: true, chance: 0.75, gap: 90, from: juniors, pose: 'tg2_block' };
      gh.specOverrides = { ultimate: AURA_BURST };
      const centre = CG.onRing(b, CP.CENTRE.x, CP.CENTRE.z);
      CG.place(gh, centre, Math.PI);
      CG.watch(c, CG.onRing(b, 0, -13), 'cl_calm', 'shock');
      // his friends stay where they fell; everybody else watches
      for (const name of ['piccolo', 'vegeta', 'trunks', 'krillin', 'tien', 'goku']) {
        const f = S[name];
        if (!f || !f.alive) continue;
        // from a checkpoint the fight that beat them is not in memory: the canon four are down
        const down = (m.flags.alliesBeatenNames || ['piccolo', 'trunks', 'krillin', 'tien']).includes(name);
        CG.watch(f, CG.ground(b, CG.SPOTS[name]), down ? 'knockdown' : name === 'goku' ? 'idle' : 'armsCrossed', down ? 'ko' : 'shock');
      }
      // all seven round him, facing in
      juniors.forEach((j, i) => {
        if (!j.alive) return;
        const a = (i / juniors.length) * Math.PI * 2 + 0.3;
        j.setHidden(false);
        j.untargetable = false;
        j.cannotDie = false;
        j.keepBody = true; // the destroyed stay where they fell until the stretch is over…
        j.witherAfter = 1e9; // …and do not crumble until the camera goes round him (purge_last)
        j.noFrenzy = true; // losing a sibling does not make them stronger: desperation is behaviour only
        j.hp = j.hpMax;
        const p = CG.onRing(b, centre.x + Math.cos(a) * CP.RING, centre.z + Math.sin(a) * CP.RING);
        CG.place(j, p);
        CG.faceTo(j, centre);
        j.controller = new SL.AIController(b, { difficulty: 'hard' });
        j.target = gh;
        j._shakenUntil = 0;
        j._reelUntil = 0;
        j.setState('free');
      });
      gh.target = juniors.find((j) => j.alive) || null;
      const st = (S.purge = { kills: 0, finishers: [], pending: [], caught: false, senses: 0, counters: 0, lastKillAt: -999, craters: 0, centre: centre.clone() });
      b.juniorMood = 'hunt';
      yield* SL.Cinema.play(m, 'purge_open');
      kit.goFight(m, ['finale', 6]);

      const alive = () => juniors.filter((j) => j.alive).length;
      const offs = [
        b.on('ko', (e) => {
          if (juniors.includes(e.fighter)) CP.finisher(m, e.fighter, e.hit, juniors);
        }),
        b.on('damage', (e) => {
          // his big blows break the ring under them; theirs do not
          if (e.blocked || e.attacker !== gh || !juniors.includes(e.target) || e.amount < 4000) return;
          const j = e.target;
          if (j.pos.y - b.stage.heightAt(j.pos.x, j.pos.z) < 1.5) {
            b.stage.crater(j.pos, 1.4 + Math.min(1.6, e.amount / 8000), 0.3, null);
            st.craters++;
          }
        }),
        b.on('storyEvade', (e) => {
          if (e.fighter !== gh || e.mode !== 'guard') return;
          st.senses++;
          st.sensed = e.attacker;
        }),
      ];
      const hook = () => CP.tick(m, juniors);
      m.tickHooks.push(hook);

      // Moment A: the first blow that reaches him is caught — unless he has already started on them
      yield () => alive() === 0 || st.kills > 0 || !!CP.catchable(b, gh, juniors);
      const foe = st.kills === 0 && alive() > 0 ? CP.catchable(b, gh, juniors) : null;
      if (foe) {
        S.purgeFoe = foe;
        yield* SL.Cinema.play(m, 'purge_catch');
        kit.goFight(m);
      }
      yield () => alive() === 0;
      // the last body flies and lands before the camera goes to it (a body settles within a few
      // seconds; the cap only guards against one caught on something)
      const endAt = b.frame + 300;
      const last = S.purgeLast;
      yield () => !last || (!st.pending.some((p) => p.j === last) && last.grounded && last.vel.length() < 2) || b.frame > endAt;
      kit.removeHook(m, hook);
      for (const off of offs) if (off) off();
      for (const p of st.pending) p.j.vel.set(p.vel.x, p.vel.y, p.vel.z);
      st.pending.length = 0;
      b.juniorMood = null;
      b.rules.pressure = null;
      gh.storyArmor = 0;
      gh.storyEvade = null;
      for (const j of juniors) j.noFrenzy = false;
      yield* SL.Cinema.play(m, 'purge_last');
      m.flags.juniorsDestroyed = true;
    },

    /** Every tick of the stretch: the mood, the counter after a sensed blow, the gi, the pending launches. */
    tick(m, juniors) {
      const b = m.battle, S = b.story, gh = S.gohan, st = S.purge;
      const left = juniors.filter((j) => j.alive).length;
      b.juniorMood = left >= 5 ? 'hunt' : left >= 3 ? 'desperate' : 'last';
      // a body held in the hit-stop is let go
      for (let i = st.pending.length - 1; i >= 0; i--) {
        const p = st.pending[i];
        if (b.frame < p.at) {
          p.j.vel.set(0, 0, 0);
          continue;
        }
        p.j.vel.copy(p.vel);
        p.j.grounded = false;
        st.pending.splice(i, 1);
      }
      // sent flying or knocked down: back up, it keeps its distance for a moment before it comes again
      for (const j of juniors) if (j.alive && (j.state === 'knockback' || j.state === 'knockdown' || j.state === 'getup')) j._reelUntil = b.frame + 45;
      // a blow from behind was felt and turned on one arm: the counter follows by itself
      if (st.sensed && gh.freeze === 0 && gh.counterFrames > 0 && ['free', 'guard'].includes(gh.state)) {
        const att = st.sensed;
        st.sensed = null;
        if (att.alive) {
          gh.target = att;
          if (gh._startCounter('light')) st.counters++;
        }
      } else if (st.sensed && gh.counterFrames <= 0) st.sensed = null;
      // the gi: dirt and the first rips after the second kill, heavily damaged after the fifth
      const want = st.kills >= 5 ? 2 : st.kills >= 2 ? 1 : 0;
      if ((gh.damageLevel || 0) < want) gh.setDamage(want, { burst: true });
    },

    /** One of them is destroyed: hit-stop, a short slow-down, lightning, and a body that goes somewhere. */
    finisher(m, j, hit, juniors) {
      const b = m.battle, S = b.story, gh = S.gohan, st = S.purge;
      st.kills++;
      const left = juniors.filter((o) => o.alive).length;
      const final = left === 0;
      const kind = CP.kind(b, j, hit);
      const F = FINISH[kind];
      const big = final ? 1.25 : 1;
      // the line the body leaves on: away from him, a little to one side each time
      const away = j.pos.clone().sub(gh.pos).setY(0);
      if (away.lengthSq() < 0.01) away.set(Math.sin(gh.yaw), 0, Math.cos(gh.yaw));
      away.normalize();
      const turn = ((st.kills % 3) - 1) * 0.25;
      const dir = new V3(away.x * Math.cos(turn) - away.z * Math.sin(turn), 0, away.x * Math.sin(turn) + away.z * Math.cos(turn));
      const vel = dir.clone().multiplyScalar(F.vel[0] * big).addScaledVector(UP, F.vel[1] * (F.vel[1] > 0 ? big : 1));
      const stop = Math.round(F.stop * (final ? 1.8 : 1));
      // HIT-STOP: both of them hold on the blow for a moment (a body ignores freeze, so it is held here)
      gh.freeze = Math.max(gh.freeze, stop);
      st.pending.push({ j, at: b.frame + stop, vel });
      j.vel.set(0, 0, 0);
      b.slowmo(final ? 0.2 : F.slow[0], final ? 0.7 : F.slow[1]);
      b.camera.addTrauma(F.trauma * big);
      // the blow, the lightning off him, the aura answering it
      const c = j.chest();
      // kept small: the body and Gohan must stay readable through it (no white-screen) — the weight
      // comes from the stop, the slow-down, the lightning and where the body goes, not from glare
      b.vfx.flash(c, 1 * big, 0xfff6d8, 0.12, SL.Toon.tex.glow);
      b.vfx.sparks(c, 0xfff3a0, 18, 12, 0.12);
      const hc = gh.chest();
      b.vfx.bolt(hc.clone().add(new V3(0.25, 0.35, 0)), 1.6, 0xdff6ff);
      b.vfx.bolt(hc.clone().add(new V3(-0.3, 0.1, 0.1)), 1.3, 0xdff6ff);
      b.vfx.ring(gh.pos.clone().add(new V3(0, 0.2, 0)), 2.4 * big, 0xffe25a, 0.4, UP);
      if (F.boom) b.vfx.explosion(c, F.boom * big, 0xffe890, { smoke: true });
      b.sfx(F.boom ? 'explosionSmall' : 'punchHeavy', j, { pitch: final ? 0.5 : 0.65, vol: 1.4 });
      b.sfx('lightning', gh, { vol: 0.55 });
      // the others lose their nerve for a moment — not all at once, and the last one longest
      const twice = b.frame - st.lastKillAt < 90;
      st.lastKillAt = b.frame;
      juniors.forEach((o, i) => {
        if (!o.alive) return;
        const base = left === 1 ? 110 : twice ? 64 : CP.SHAKEN;
        o._shakenUntil = b.frame + stop + base + ((i * 23 + st.kills * 7) % 36);
      });
      if (final) S.purgeLast = j;
      st.finishers.push({ kind, final, frame: b.frame, stop });
      b.emit('purgeFinisher', { fighter: j, kind, final, stop, frame: b.frame });
    },
  });
})();
