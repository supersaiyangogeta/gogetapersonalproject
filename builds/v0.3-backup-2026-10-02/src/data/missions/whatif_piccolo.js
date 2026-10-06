/*
 * WHAT IF · CHAPTER 3 — "What if Piccolo survived Nappa?"   (NOT CANON)
 *
 * Branches from "Nappa Attacks" at the moment Nappa's Mouth Blast is fired at
 * Gohan. In canon Piccolo shields him with his body and dies. Here the player,
 * as Piccolo, holds the blast back and throws it aside — and Piccolo and Gohan
 * take Nappa on together, master and student, with a combined attack.
 *
 * Saved on the separate What-If track (flag `whatIf`, `branchOf`); clearing it
 * never changes canon story progress.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const ARENA = new V3(0, 0, 0);

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function ground(b, v, lift = 0) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  }
  function place(f, pos, yaw) {
    f.setPosition(pos);
    f.yaw = yaw;
    f.prevYaw = yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = true;
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, ARENA, 40);
    const vegeta = b.spawn({ charId: 'vegeta', team: 1, pos: ground(b, new V3(-26, 0, -34)), cannotDie: true, infiniteHp: true, tags: { cinematic: true } });
    vegeta.controller = scripted();
    vegeta.untargetable = true;
    const nappa = b.spawn({ charId: 'nappa', team: 1, pos: ground(b, new V3(0, 0, -12)), tags: { boss: true, priority: true } });
    nappa.controller = scripted();
    nappa.cannotDie = true;
    const piccolo = b.spawn({ charId: 'piccolo', player: true, team: 0, pos: ground(b, new V3(3, 0, 8)), startKi: 80 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, new V3(0, 0, 10)), startKi: 60 });
    gohan.controller = scripted();
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, new V3(-22, 0, 22)) });
    krillin.controller = scripted();
    krillin.untargetable = true;
    faceTo(vegeta, ARENA);
    for (const f of [piccolo, gohan, krillin]) faceTo(f, nappa.pos);
    faceTo(nappa, gohan.pos);
    b.story = { vegeta, nappa, piccolo, gohan, krillin };
  }

  /** Master and student fire together: Special Beam Cannon wrapped in a Masenko. */
  function* teamAttack(m) {
    const b = m.battle, S = b.story, n = S.nappa, pc = S.piccolo, g = S.gohan;
    m.lock(true);
    b.emit('teamAttack', { fighters: [pc, g], target: n });
    n.setState('stagger', { frames: 400, poiseBreak: true });
    if (pc.state !== 'free') pc.setState('free');
    const side = new V3(-n.forward.z, 0, n.forward.x);
    place(pc, ground(b, n.pos.clone().addScaledVector(n.forward, 16).addScaledVector(side, 3)), 0);
    place(g, ground(b, n.pos.clone().addScaledVector(n.forward, 16).addScaledVector(side, -3)), 0);
    faceTo(pc, n.pos);
    faceTo(g, n.pos);
    pc.target = g.target = n;
    pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'shout' });
    g.setState('scripted', { pose: 'kg_masenkoCharge', expression: 'shout' });
    pc.aura.target = 1;
    g.aura.target = 1;
    m.shot((t, out) => {
      const mid = pc.chest().lerp(g.chest(), 0.5);
      camAt(out, mid.clone().addScaledVector(pc.forward, -3.2).add(new V3(0, U.lerp(0.4, 1.2, t), 0)), n.chest(), 44);
    }, 1.8, { cut: true, blendIn: 0 });
    m.say('piccolo', 'Now, Gohan! Together!', 1.6);
    yield* m.cine(1.6);
    const sbc = pc.def.specials.ultimate;
    const mas = g.def.specials.special1;
    pc.setState('scripted', { pose: 'p_sbcFire', expression: 'shout' });
    g.setState('scripted', { pose: 'kg_masenkoFire', expression: 'shout' });
    const beamA = b.projectiles.spawnBeam(pc, Object.assign({}, sbc, { cinematic: false }), 1);
    const beamB = b.projectiles.spawnBeam(g, Object.assign({}, mas, { damage: [2200, 3400] }), 1);
    b.sfx('beamFire', pc, { vol: 1.3 });
    b.sfx('beamFire', g, { vol: 1.1, pitch: 1.2 });
    m.shot((t, out) => camAt(out, n.chest().addScaledVector(side, 9).add(new V3(0, 2, 0)).addScaledVector(n.forward, 6), n.chest(), 52), 2.2, { cut: true, blendIn: 0 });
    const hp0 = n.hp;
    yield* m.cine(2);
    beamA.stop();
    beamB.stop();
    pc.aura.target = 0;
    g.aura.target = 0;
    // guarantee the combined attack lands its weight even if a beam grazed
    if (hp0 - n.hp < n.hpMax * 0.18) n.hp = Math.max(n.hpMax * 0.04, hp0 - n.hpMax * 0.18);
    m.endShot();
    n.setState('knockdown', { frames: 60 });
    pc.setState('free');
    g.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  const W = {};

  W.recap = {
    id: 'recap',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, g = S.gohan, pc = S.piccolo;
      m.lock(true);
      m.music('finale', 0);
      n.setState('scripted', { pose: 'n_mouthCharge', expression: 'grin' });
      g.setState('scripted', { pose: 'kg_scared', expression: 'hurt' });
      pc.setState('scripted', { pose: 'p_stance', expression: 'angry' });
      m.title('WHAT IF...?', m.def.title.toUpperCase(), 'A branch from Chapter 3 · Not canon', 4.2);
      m.shot((t, out) => camAt(out, ground(b, new V3(U.lerp(-20, -12, t), 0, U.lerp(24, 16, t)), U.lerp(10, 5, t)), ground(b, new V3(0, 0, -2), 1.5), 46), 4.4, { cut: true, blendIn: 0 });
      yield* m.cine(4.4);
      m.say('narrator', 'Nappa aimed his blast at Gohan. In the story you know, Piccolo threw himself in front of it and gave his life for his student.', 5);
      yield* m.cine(5);
      m.say('narrator', 'But what if Piccolo had been strong enough to stop it?', 3);
      yield* m.cine(3);
    },
  };

  W.deflect = {
    id: 'deflect',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, g = S.gohan, pc = S.piccolo;
      m.lock(true);
      clearCombat(b);
      place(n, ground(b, new V3(0, 0, -12)), 0);
      place(g, ground(b, new V3(0, 0, 10)), Math.PI);
      place(pc, ground(b, new V3(0, 0, 7)), Math.PI);
      faceTo(n, g.pos);
      n.target = g;
      g.setState('scripted', { pose: 'kg_scared', expression: 'hurt' });
      pc.setState('scripted', { pose: 'guard', expression: 'shout' });
      m.shot((t, out) => {
        const c = pc.chest();
        camAt(out, c.clone().addScaledVector(pc.forward, 2.8).add(new V3(1.2, 0.4, 0)), n.chest(), 46);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('piccolo', "Not while I'm standing!", 1.6);
      // the Mouth Blast is real; its head is held at Piccolo's crossed arms while the player pushes back
      const spec = Object.assign({}, n.def.specials.special1, { range: 60, sustain: 999 });
      n.setState('scripted', { pose: 'n_mouthFire', expression: 'shout' });
      const beam = b.projectiles.spawnBeam(n, spec, 1);
      beam.hitSet.add(pc);
      beam.hitSet.add(g);
      b.sfx('beamFire', n, { vol: 1.3, pitch: 0.8 });
      const hold = pc.chest().addScaledVector(pc.forward, 0.8);
      m.tickHooks.push(() => {
        beam.headOverride = hold;
        b.vfx.sparks(hold, 0xffe07a, 3, 10, 0.12);
        pc.vel.set(0, 0, 0);
      });
      yield* m.cine(0.8);
      const res = yield* m.struggle({ start: 0.45, drain: 0.34, duration: 3.2, label: 'HOLD IT BACK', canFail: true, keepInput: false, onTick: (t, grip) => b.cameraTraumaAt(hold, 0.04 + (1 - grip) * 0.08) });
      m.tickHooks.length = 0;
      if (res.failed) {
        beam.headOverride = null;
        beam.stop();
        pc.cannotDie = false;
        pc.hp = 1;
        pc.takeHit(n, { type: 'beam', damage: 99999, knock: 'heavy', impact: 5 });
        yield 1.4;
        m.fail('piccoloFell');
        yield () => false;
      }
      m.qteParts.push(U.clamp01(res.avg * 1.4));
      // thrown aside into the sky
      beam.headOverride = null;
      beam.dir.set(0.3, 1, 0.2).normalize();
      beam.stop();
      pc.setState('scripted', { pose: 'p_chop', expression: 'shout' });
      b.vfx.ring(hold, 5, 0xffe07a, 0.5);
      b.sfx('guardBreak', pc, { pitch: 0.7, vol: 1.4 });
      b.cameraTraumaAt(hold, 0.7);
      b.emit('deflectedBlast', { fighter: pc });
      m.shot((t, out) => camAt(out, pc.chest().add(new V3(-5, 1, 5)), n.chest(), 50), 2.2, { cut: true, blendIn: 0 });
      m.say('nappa', 'WHAT?! He knocked it away?!', 2);
      yield* m.cine(2.2);
      m.shot((t, out) => {
        const c = g.chest();
        camAt(out, c.clone().addScaledVector(g.forward, 2).add(new V3(0.5, 0.1, 0)), pc.chest(), 42);
      }, 2.4, { cut: true, blendIn: 0 });
      g.setState('scripted', { pose: 'kg_ready', expression: 'angry' });
      m.say('kid_gohan', 'Mister Piccolo! I will fight with you!', 2.2);
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  W.together = {
    id: 'together',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, g = S.gohan, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(n, ground(b, new V3(0, 0, -10)), 0);
      place(pc, ground(b, new V3(3, 0, 9)), Math.PI);
      place(g, ground(b, new V3(-3, 0, 10)), Math.PI);
      n.hp = n.hpMax;
      n.mech.phase = Math.max(n.mech.phase, 1);
      n.bossPhaseCap = undefined;
      n.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      n.cannotDie = true;
      g.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
      // Gohan is the other half of the team attack: in this branch he can be beaten down but not killed
      // (Nappa now turns on him too, and leaves him once he is badly hurt — see Battle.bossAttention)
      g.cannotDie = true;
      if (b.player !== pc) b.switchPlayer(pc, { force: true });
      b.setParty([pc, g]);
      pc.target = g.target = n;
      n.target = pc;
      for (const f of [n, pc, g]) f.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('nappa', 'Defeat Nappa with Gohan', { icon: 'fist' });
      const team = m.objective('team', 'Land the team attack', { icon: 'ultimate', optional: true });
      const trap = m.objective('mine', 'Catch Nappa in a Light Grenade', { icon: 'ball', optional: true });
      b.on('mineTriggered', (e) => {
        if (e.victim === n && !trap.done) m.complete('mine');
      });
      let teamUsed = false;
      m.prompt('teamAttack', 'ultimate', 'TEAM ATTACK', { required: true, always: true, when: () => n.poise.broken > 0 && g.alive && !teamUsed && b.player === pc, until: () => teamUsed || n.poise.broken <= 0 });
      // contextual ability: it also appears on the radial skill wheel while it is available
      b.contextActions = [{ id: 'teamAttack', label: 'Team Attack', icon: 'ultimate', when: () => n.poise.broken > 0 && g.alive && !teamUsed && b.player === pc, run: () => {
        teamUsed = true;
        m.flags.team = true;
      } }];
      m.tickHooks.push(() => {
        // pressing Ultimate while Nappa's poise is broken turns Piccolo's beam into the combined attack
        if (teamUsed || !g.alive || n.poise.broken <= 0 || b.player !== pc) return;
        if (pc.state === 'beamCharge' && pc.sd.slot === 'ultimate') {
          teamUsed = true;
          pc.setState('free');
          m.flags.team = true;
        }
      });
      for (;;) {
        yield () => m.flags.team || n.hpFrac <= 0.05 || !b.partyAlive().length;
        if (!b.partyAlive().length) return;
        if (m.flags.team) {
          m.flags.team = false;
          yield* teamAttack(m);
          m.complete('team');
          continue;
        }
        break;
      }
      m.complete('nappa');
      yield 0.6;
    },
  };

  W.ending = {
    id: 'ending',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, g = S.gohan, pc = S.piccolo, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      n.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      m.shot((t, out) => {
        const c = n.chest();
        camAt(out, c.clone().add(new V3(-2.4, 0.2, 3.2)), c, 42);
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('nappa', 'Beaten... by a Namekian and a brat...', 2.4);
      yield* m.cine(2.4);
      m.shot((t, out) => {
        const c = v.chest();
        camAt(out, c.clone().add(new V3(2, 0.3, 2.8)), c, 38);
      }, 3, { cut: true, blendIn: 0 });
      v.setState('scripted', { pose: 'v_scouterTap', expression: 'angry' });
      m.say('vegeta', 'Pathetic, Nappa. But this Namekian... interesting. Namek is where the Dragon Balls come from.', 3);
      yield* m.cine(3);
      m.shot((t, out) => {
        const mid = pc.chest().lerp(g.chest(), 0.5);
        camAt(out, mid.clone().addScaledVector(pc.forward, 3.6).add(new V3(0, 0.4, 0)), mid, 42);
      }, 3, { cut: true, blendIn: 0 });
      pc.setState('scripted', { pose: 'idle', expression: 'smirk' });
      g.setState('scripted', { pose: 'kg_victory', expression: 'grin' });
      m.say('piccolo', "Don't get used to me saving you, kid. ...You fought well.", 3);
      yield* m.cine(3);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('WHAT IF...?', 'PICCOLO LIVES', 'An alternate ending · Not canon', 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'whatif_piccolo',
    whatIf: true,
    branchOf: 'saiyan_nappa',
    branchPoint: 'sacrifice',
    chapter: 'WHAT IF · CHAPTER 3',
    title: 'What if Piccolo survived Nappa?',
    subtitle: 'Earth · Age 762 · Alternate timeline',
    character: 'piccolo',
    stage: 'wasteland',
    parTime: 240,
    qteLabel: 'Hold the blast back',
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'The blast that killed Piccolo in the story you know — this time he holds it back. Master and student face Nappa together.',
    rewards: ['An alternate ending', 'Team attack: Special Beam Cannon + Masenko'],
    setup,
    phases: [W.recap, W.deflect, W.together, W.ending],
  };

  SL.data.missions[def.id] = def;
})();
