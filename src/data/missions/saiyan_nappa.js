/*
 * CHAPTER 3 — SAIYAN SAGA: THE SAIYANS ARRIVE
 * Mission "Nappa Attacks" (canon). The Nappa boss fight.
 *
 * Canon beats: Nappa tears through the Z Fighters. Chiaotzu clings to his back
 * and self-destructs — it barely scratches him. Tien throws everything into
 * a Tri-Beam and collapses. The others hold on, waiting for Goku. Nappa aims a
 * blast at Gohan and Piccolo takes it for him. Goku arrives, beats Nappa
 * without breaking a sweat, and Vegeta finishes off his own useless partner.
 *
 * Playable: Piccolo with Krillin, Gohan, Tien and Chiaotzu as a switchable party
 * (survive Nappa's Toying and Angry phases), then Goku alone against the full
 * three-phase Nappa (Kaioken capped at x2, no Instant Transmission yet).
 * The boss is beaten by reading telegraphs and breaking poise, not by a huge
 * health bar.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const ARENA = new V3(0, 0, 0);
  const VEGETA_ROCK = new V3(-26, 0, -34);

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
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function clearCombat(b) {
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  function knockOut(f, hide) {
    if (f.alive) {
      f.cannotDie = false;
      f.infiniteHp = false;
      f.invuln = 0;
      f.hp = 0;
      f._ko(null, { dir: new V3(0, 1, 0) });
    }
    if (hide) f.setHidden(true);
  }
  function bossAI(b) {
    return new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  }

  function setup(battle) {
    const b = battle;
    // the ring of rock where the Saibamen fell: keep a few pillars at the edge to be smashed
    clearArea(b, ARENA, 38);
    const vegeta = b.spawn({ charId: 'vegeta', team: 1, pos: ground(b, VEGETA_ROCK), cannotDie: true, infiniteHp: true, tags: { cinematic: true } });
    vegeta.controller = scripted();
    vegeta.untargetable = true;
    faceTo(vegeta, ARENA);
    const nappa = b.spawn({ charId: 'nappa', team: 1, pos: ground(b, ARENA.clone().add(new V3(0, 0, -12))), tags: { boss: true, priority: true } });
    nappa.controller = scripted();
    faceTo(nappa, ARENA);
    const piccolo = b.spawn({ charId: 'piccolo', player: true, team: 0, pos: ground(b, ARENA.clone().add(new V3(2, 0, 10))), startKi: 60 });
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, ARENA.clone().add(new V3(-4, 0, 11))), startKi: 50 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, ARENA.clone().add(new V3(6, 0, 12))), startKi: 40 });
    const tien = b.spawn({ charId: 'tien', team: 0, pos: ground(b, ARENA.clone().add(new V3(-8, 0, 9))), startKi: 100 });
    const chiaotzu = b.spawn({ charId: 'chiaotzu', team: 0, pos: ground(b, ARENA.clone().add(new V3(-11, 0, 11))), startKi: 80 });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: ground(b, ARENA.clone().add(new V3(0, 0, 60))), startKi: 60 });
    goku.controller = scripted();
    goku.setHidden(true);
    goku.untargetable = true;
    // Goku after King Kai: Kaioken up to x2 and the Spirit Bomb; no Instant Transmission, no Super Saiyan
    goku.lockedSlots = { special2: true };
    goku.lockedForms = { ssj: true };
    goku.formCaps = { kaioken: 0 };
    const heroes = [piccolo, krillin, gohan, tien, chiaotzu];
    for (const h of heroes) {
      if (h !== piccolo) h.controller = scripted();
      faceTo(h, nappa.pos);
    }
    b.story = { vegeta, nappa, piccolo, krillin, gohan, tien, chiaotzu, goku, heroes };
  }

  const P = {};

  P.intro = {
    id: 'intro',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa;
      m.lock(true);
      m.music('battle', 1);
      for (const h of S.heroes) h.setState('scripted', { pose: 'idle', expression: 'angry' });
      S.vegeta.setState('scripted', { pose: 'v_chinUp', expression: 'smirk' });
      n.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      m.shot((t, out) => {
        const c = n.chest();
        camAt(out, c.clone().add(new V3(U.lerp(-4, -2.6, t), U.lerp(-1, 0.4, t), U.lerp(6, 4, t))), c.clone().add(new V3(0, 0.6, 0)), 44);
      }, 3.8, { cut: true, blendIn: 0 });
      yield* m.cine(3.6);
      // a real roar: the shockwave shoves the heroes back
      b.aiLocked = false;
      n.setState('free');
      const roar = n.def.boss.techniques.roar;
      SL.Techniques.bossRoar.start(n, roar, 'boss', 0);
      for (const h of S.heroes) h.setState('free');
      m.shot((t, out) => camAt(out, ground(b, ARENA.clone().add(new V3(14, 0, 16)), 4), n.chest(), 50), 1.6, { cut: true, blendIn: 0 });
      m.say('nappa', 'Which one of you wants to break first?', 2.4);
      yield () => n.state !== 'bossRoar';
      b.aiLocked = true;
      yield* m.cine(0.8);
      m.endShot();
    },
  };

  P.holdLine = {
    id: 'holdLine',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      const party = [S.piccolo, S.krillin, S.gohan, S.tien, S.chiaotzu].filter((h) => h.alive && !h.mech.vaporized);
      party.forEach((h, i) => {
        place(h, ground(b, ARENA.clone().add(new V3(-8 + i * 4, 0, 9))), Math.PI);
        h.setState('free');
        // in canon everyone here survives this part: a hero who drops is out of the fight, not dead
        h.cannotDie = true;
        h.benched = false;
        h.untargetable = false;
      });
      place(n, ground(b, ARENA.clone().add(new V3(0, 0, -10))), 0);
      n.controller = bossAI(b);
      n.bossPhaseCap = 1;
      n.cannotDie = true;
      n.setState('free');
      if (b.player !== S.piccolo && S.piccolo.alive) b.switchPlayer(S.piccolo, { force: true });
      b.setParty(party);
      for (const h of party) h.target = n;
      n.target = b.player;
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      const HOLD = 75;
      const t0 = m.time;
      m.objective('hold', 'Hold out until Goku arrives', { icon: 'clock', target: HOLD });
      const breakObj = m.objective('poise', "Break Nappa's poise", { icon: 'fist', optional: true });
      const discObj = m.objective('disc', 'Cut Nappa with the Destructo Disc', { icon: 'ball', optional: true });
      b.on('poiseBreak', (e) => {
        if (e.fighter === n && !breakObj.done) m.complete('poise');
      });
      b.on('special', (e) => {
        if (e.fighter === S.krillin && e.slot === 'special2') S.discThrown = b.frame;
      });
      b.on('damage', (e) => {
        if (e.target === n && e.attacker === S.krillin && e.type === 'ki' && S.discThrown && b.frame - S.discThrown < 200 && !discObj.done) m.complete('disc');
      });
      // read the boss: prompts only when the moment calls for it
      m.prompt('slamJump', 'ascend', 'Jump over it', { always: true, when: () => n.state === 'bossSlam' && n.sd.phase === 'air', until: () => n.state !== 'bossSlam' });
      m.prompt('poiseHit', 'light', 'He is open!', { always: true, when: () => n.poise && n.poise.broken > 0 && b.player.distTo(n) < 12, until: () => !(n.poise && n.poise.broken > 0) });
      m.prompt('switchHero', 'partyNext', 'Switch hero', { when: () => m.time - t0 > 10 && b.player.hpFrac < 0.4 && b.canSwitchTo(b.nextPartyMember(1)), until: () => SL.Input.pressed('partyNext') });
      let triBeamDone = !S.tien.alive;
      let chiaotzuDone = !S.chiaotzu.alive || S.chiaotzu.mech.vaporized;
      m.tickHooks.push(() => {
        // Nappa is only toying with them: he cannot be finished here
        if (n.hpFrac < 0.4) n.hp = n.hpMax * 0.4;
        for (const h of party) {
          if (h.benched || !h.alive || h.hp > 1 || h === S.tien || h === S.chiaotzu) continue;
          h.benched = true;
          h.untargetable = true;
          h.controller = scripted();
          h.setState('knockdown', { frames: 99999 });
          b.emit('heroDown', { fighter: h });
          if (h === b.player) {
            const next = b.nextPartyMember(1);
            if (next) b.switchPlayer(next, { force: true });
          }
        }
        if (!b.partyAlive().length) m.fail('defeated');
        m.progress('hold', Math.floor(m.time - t0));
      });
      yield () => m.time - t0 >= 12 || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      if (!chiaotzuDone) yield* m.def.chiaotzuSacrifice(m);
      chiaotzuDone = true;
      b.setParty(party.filter((h) => h.alive && !h.mech.vaporized));
      yield () => m.time - t0 >= 24 || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      if (!triBeamDone && S.tien.alive) yield* m.def.triBeam(m);
      triBeamDone = true;
      yield () => m.time - t0 >= HOLD || !b.partyAlive().length;
      if (!b.partyAlive().length) return;
      m.progress('hold', HOLD);
      m.tickHooks.length = 0;
      yield 0.4;
    },
  };

  /**
   * Chiaotzu flies onto Nappa's back and self-destructs. This is the real latch
   * technique (with survive: false): Nappa struggles, the fuse runs, the blast
   * lands — and Nappa shrugs it off.
   */
  function* chiaotzuSacrifice(m) {
    const b = m.battle, S = b.story, n = S.nappa, c = S.chiaotzu, t = S.tien;
    m.lock(true);
    clearCombat(b);
    if (b.player === c) {
      const next = b.nextPartyMember(1);
      if (next) b.switchPlayer(next, { force: true });
    }
    for (const h of b.party || []) if (h.alive && h !== c) h.setState('scripted', { pose: 'idle', expression: 'hurt' });
    c.benched = false;
    c.untargetable = false;
    c.setState('free');
    c.hp = Math.max(c.hp, c.hpMax * 0.3);
    place(c, ground(b, n.pos.clone().add(new V3(-3, 0, 9))), Math.PI);
    faceTo(c, n.pos);
    place(n, n.pos.clone(), n.yaw);
    n.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
    m.shot((tt, out) => {
      const p = c.chest();
      camAt(out, p.clone().addScaledVector(c.forward, 2.2).add(new V3(0.8, 0.3, 0)), p, 40);
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('chiaotzu', 'Tien... goodbye.', 2.2);
    yield* m.cine(1.8);
    if (t.alive) {
      m.shot((tt, out) => {
        const p = t.chest();
        camAt(out, p.clone().addScaledVector(t.forward, 2.2).add(new V3(-0.6, 0.2, 0)), p, 40);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('tien', 'Chiaotzu? What are you doing? Chiaotzu!', 2.2);
      yield* m.cine(1.8);
    }
    // the real latch, story version: he does not walk away from this one
    const spec = Object.assign({}, c.def.specials.ultimate, { survive: false, fuse: 150, cpuEscape: 0 });
    c.target = n;
    n.setState('free');
    b.aiLocked = false;
    n.controller = scripted();
    c.controller = scripted();
    m.shot((tt, out) => camAt(out, ground(b, n.pos.clone().add(new V3(9, 0, 9)), 3.5), n.chest(), 48), 999, { hold: true, cut: true, blendIn: 0 });
    SL.Techniques.latch.start(c, spec, 'story', 0);
    yield () => c.state === 'latchCling' || (c.state !== 'latchCrouch' && c.state !== 'latchLeap') || m.time > 999;
    if (c.state === 'latchCling') {
      n.setState('held', { by: c, frames: 99999, latched: true });
      m.say('nappa', 'Get off me, you little pest!', 2);
      // Nappa claws at his back while the fuse runs
      yield () => !c.alive || c.state !== 'latchCling';
    }
    const hp0 = n.hp;
    yield 0.2;
    n.hp = Math.max(n.hpMax * 0.45, Math.min(n.hp, hp0 - n.hpMax * 0.03));
    if (n.state === 'held') n.setState('free');
    yield* m.cine(1.2);
    m.shot((tt, out) => {
      const p = n.chest();
      camAt(out, p.clone().add(new V3(2.2, 0.4, 3.2)), p.clone().add(new V3(0, 0.5, 0)), 42);
    }, 2.6, { cut: true, blendIn: 0 });
    n.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
    m.say('nappa', 'Heh. What a waste of a good explosion.', 2.4);
    yield* m.cine(2.4);
    if (t.alive) m.say('tien', "He didn't even... Chiaotzu!", 2.2);
    n.controller = bossAI(b);
    m.endShot();
    for (const h of b.party || []) if (h.alive && h !== c) h.setState('free');
    n.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  /** Tien pours his life into a Tri-Beam. It barely scratches Nappa. */
  function* triBeam(m) {
    const b = m.battle, S = b.story, n = S.nappa, t = S.tien;
    m.lock(true);
    clearCombat(b);
    for (const h of b.party || []) if (h.alive && h !== t) h.setState('scripted', { pose: 'idle', expression: 'hurt' });
    place(t, ground(b, n.pos.clone().add(new V3(4, 0, 18))), 0);
    faceTo(t, n.pos);
    n.setState('scripted', { pose: 'guard', expression: 'grit' });
    t.target = n;
    t.ki = t.kiMax;
    m.shot((tt, out) => {
      const c = t.chest();
      camAt(out, c.clone().addScaledVector(t.forward, 2.6).add(new V3(0.6, 0.2, 0)), c, 40);
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.say('tien', 'Everyone get back. Tri-Beam!', 2);
    b.aiLocked = false;
    t.setState('free');
    const hpBefore = n.hp;
    t.controller = { update: () => Object.assign(SL.emptyIntent(), t.state === 'free' && !t._fired ? { ult: true, ultHeld: true } : { ultHeld: true }) };
    yield () => t.state === 'beamCharge' || t.stateFrame > 30;
    t._fired = true;
    yield () => t.state === 'beamFire';
    m.shot((tt, out) => camAt(out, ground(b, n.pos.clone().add(new V3(-10, 0, 8)), 4), n.chest(), 50), 999, { hold: true, cut: true, blendIn: 0 });
    yield () => t.state !== 'beamFire' && t.state !== 'beamCharge';
    b.aiLocked = true;
    n.hp = Math.max(n.hpMax * 0.45, Math.min(n.hp, hpBefore - n.hpMax * 0.08));
    yield* m.cine(0.6);
    m.shot((tt, out) => {
      const c = n.chest();
      camAt(out, c.clone().add(new V3(2.4, 0.6, 3.4)), c.clone().add(new V3(0, 0.5, 0)), 42);
    }, 2.4, { cut: true, blendIn: 0 });
    n.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
    m.say('nappa', "Heh. That tickled. My turn!", 2.2);
    yield* m.cine(2.2);
    // the effort costs Tien everything
    t.controller = scripted();
    knockOut(t, false);
    m.endShot();
    for (const h of b.party || []) if (h.alive) h.setState('free');
    n.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  P.sacrifice = {
    id: 'sacrifice',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, pc = S.piccolo, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      // the camera and HUD follow Gohan through this scene (Piccolo is about to fall)
      if (b.player !== g) b.switchPlayer(g, { force: true });
      for (const h of S.heroes) {
        h.benched = false;
        h.untargetable = false;
      }
      g.hp = Math.max(g.hp, g.hpMax * 0.2);
      for (const h of [S.krillin, S.tien]) if (h.alive) h.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      place(g, ground(b, ARENA.clone().add(new V3(0, 0, 10))), Math.PI);
      place(n, ground(b, ARENA.clone().add(new V3(0, 0, -12))), 0);
      n.target = g;
      // the scene stages all of it: the boy alone, the hand coming up, Piccolo seeing it,
      // Piccolo in the path with his arms out, the wave on him, the fall, the last words
      // (owner, playtest round 2: "Piccolo's death is currently represented mostly as dialogue")
      n.controller = scripted();
      pc.controller = scripted();
      yield* SL.Cinema.play(m, 'piccolo_shields_gohan');
      m.lock(true);
      b.aiLocked = true;
      clearCombat(b);
      n.setState('scripted', { pose: 'n_laugh', expression: 'grin' });
      // Gohan's grief erupts into a Masenko that Nappa swats aside
      place(g, g.pos.clone(), Math.atan2(n.pos.x - g.pos.x, n.pos.z - g.pos.z));
      SL.Mechanics.hiddenPotential.unleash(g);
      g.setState('scripted', { pose: 'kg_masenkoCharge', expression: 'shout' });
      m.shot((t, out) => {
        const c = g.chest();
        camAt(out, c.clone().addScaledVector(g.forward, 2.2).add(new V3(0.4, 0.1, 0)), c, 40);
      }, 1.6, { cut: true, blendIn: 0 });
      m.say('kid_gohan', 'MASENKO!', 1.4);
      yield* m.cine(1.5);
      const from = g.chest();
      b.projectiles.spawnBlast(g, from, n.chest().sub(from).normalize(), { kind: 'ball', speed: 90, radius: 1.2, damage: 0, color: 0xffe25a, core: 0xffffff, explode: 2, knock: 'flinch', impact: 1, life: 0.5 });
      g.setState('scripted', { pose: 'kg_masenkoFire', expression: 'shout' });
      n.setState('scripted', { pose: 'punchR', expression: 'grit' });
      m.shot((t, out) => camAt(out, n.chest().add(new V3(-5, 1, 5)), n.chest(), 46), 1.4, { cut: true, blendIn: 0 });
      yield* m.cine(1.4);
      m.endShot();
    },
  };

  P.goku = {
    id: 'goku',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, gk = S.goku;
      m.lock(true);
      clearCombat(b);
      gk.setHidden(false);
      place(gk, ground(b, ARENA.clone().add(new V3(0, 0, 14))), Math.PI);
      gk.setState('scripted', { pose: 'g_resolve', expression: 'angry' });
      b.vfx.explosion(gk.chest(), 1.5, 0xffffff, { smoke: false });
      b.vfx.dust(gk.pos, 3, 16);
      b.sfx('dash', gk, { vol: 1.4 });
      b.camera.addTrauma(0.3);
      n.setState('scripted', { pose: 'idle', expression: 'angry' });
      faceTo(n, gk.pos);
      m.shot((t, out) => camAt(out, gk.chest().add(new V3(U.lerp(-1.2, -0.8, t), U.lerp(-0.9, -0.5, t), -2.8)), gk.chest().add(new V3(0, 0.3, 0)), 40), 2.8, { cut: true, blendIn: 0 });
      m.music('battle', 2);
      m.say('goku', 'Sorry I took so long. Leave the rest to me.', 2.6);
      yield* m.cine(2.8);
      m.shot((t, out) => {
        const c = S.vegeta.chest();
        camAt(out, c.clone().add(new V3(2.2, 0.3, 2.6)), c, 40);
      }, 2.2, { cut: true, blendIn: 0 });
      S.vegeta.setState('scripted', { pose: 'v_scouterTap', expression: 'angry' });
      m.say('vegeta', 'His power level is climbing... Nappa, be careful.', 2.2);
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, gk = S.goku;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.setParty([]);
      b.party = null;
      // the others are out of this fight
      for (const h of S.heroes) if (h.alive) {
        h.untargetable = true;
        h.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
        h.controller = scripted();
        place(h, ground(b, ARENA.clone().add(new V3(h.pos.x > 0 ? 26 : -26, 0, 26))), 0);
      }
      gk.setHidden(false);
      gk.untargetable = false;
      if (b.player !== gk) b.switchPlayer(gk, { force: true });
      // the gap: what flattened the others does not move Goku
      m.powerGap(gk, { from: [n], mul: 0.15, lines: [{ at: 2, who: 'nappa', line: 'Wh-what?! He didn\'t even move!', style: 'shout' }] });
      // resumed from this checkpoint: the ones who fell before Goku came stay fallen
      // (after the switch: knocking out the fighter still under control would fail the mission)
      for (const h of [S.piccolo, S.tien, S.chiaotzu]) if (h.alive) knockOut(h, true);
      m.flags.piccoloFell = true;
      place(gk, ground(b, ARENA.clone().add(new V3(0, 0, 10))), Math.PI);
      place(n, ground(b, ARENA.clone().add(new V3(0, 0, -10))), 0);
      // a fresh start for the real fight: every phase is back on the table
      n.hp = n.hpMax;
      n.mech.phase = 0;
      n.bossPhaseCap = undefined;
      n.poise.value = n.poise.max;
      n.poise.broken = 0;
      n.cannotDie = true;
      n.controller = bossAI(b);
      n.target = gk;
      gk.target = n;
      // a year of training under ten times gravity: Goku is simply stronger than Nappa now (canon)
      gk.damageDealtMul = 1.15;
      n.damageDealtMul = 0.8;
      gk.hp = gk.hpMax;
      gk.ki = 60;
      gk.setState('free');
      n.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('nappa', 'Defeat Nappa', { icon: 'fist' });
      const breaks = m.objective('breaks', "Break Nappa's poise 3 times", { icon: 'fist', optional: true, target: 3 });
      const noKaio = m.objective('noKaioken', 'Win without Kaioken', { icon: 'transform', optional: true });
      let nBreaks = 0;
      b.on('poiseBreak', (e) => {
        if (e.fighter !== n) return;
        nBreaks++;
        m.progress('breaks', nBreaks);
      });
      b.on('formChanged', (e) => {
        if (e.fighter === gk && e.form.id === 'kaioken' && !noKaio.done) m.failObjective('noKaioken');
      });
      m.prompt('slamJump2', 'ascend', 'Jump over it', { always: true, when: () => n.state === 'bossSlam' && n.sd.phase === 'air' && Math.hypot(gk.pos.x - n.sd.land.x, gk.pos.z - n.sd.land.z) < 10, until: () => n.state !== 'bossSlam' });
      m.prompt('bomberRun', 'boost', 'Get clear', { always: true, when: () => n.state === 'bossBomber' && n.sd.phase === 'charge' && gk.distTo(n) < 16, until: () => n.state !== 'bossBomber' });
      m.prompt('poiseHit2', 'light', 'He is open!', { always: true, when: () => n.poise.broken > 0 && gk.distTo(n) < 14, until: () => n.poise.broken <= 0 });
      m.prompt('kaioken', 'transform', 'Kaioken', { when: () => m.time > 20 && gk.hpFrac < 0.55 && gk.form.id === 'base' && gk.strain < 40, until: () => gk.form.id === 'kaioken' });
      yield () => n.hpFrac <= 0.06 || !gk.alive;
      if (!gk.alive) return;
      m.complete('nappa');
      if (!noKaio.failed) m.complete('noKaioken');
      yield* m.cine(0.2);
    },
  };

  P.finale = {
    id: 'finale',
    run: function* (m) {
      const b = m.battle, S = b.story, n = S.nappa, gk = S.goku, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (gk.form.id !== 'base') gk.applyForm(0);
      gk.cannotDie = true;
      gk.invuln = 60 * 20;
      b.slowmo(0.35, 1);
      // the knee to the spine that ends it
      place(n, ground(b, gk.pos.clone().addScaledVector(gk.forward, 1.4)), gk.yaw + Math.PI);
      n.setState('scripted', { pose: 'hitHeavy', expression: 'ko' });
      gk.setState('scripted', { pose: 'g_flyingKnee', expression: 'angry' });
      b.vfx.impact(n.chest(), 4, 0xffffff);
      b.sfx('punchHeavy', gk, { vol: 1.6, pitch: 0.7 });
      b.camera.addTrauma(0.6);
      m.shot((t, out) => camAt(out, n.chest().add(new V3(3, 0.8, 3)), n.chest(), 40), 1.8, { cut: true, blendIn: 0 });
      yield* m.cine(1.8);
      n.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      // the execution is its own scene: the hand, the throw, the blast that cannot miss
      // (owner, playtest round 2: two disconnected actors, and a blast that could fly past)
      n.controller = scripted();
      v.controller = scripted();
      yield* SL.Cinema.play(m, 'vegeta_executes_nappa');
      m.lock(true);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 3', 'NEXT: VEGETA', 'The Saiyan prince is coming', 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'saiyan_nappa',
    canon: true,
    chapter: 'CHAPTER 3 · SAIYAN SAGA',
    title: 'Nappa Attacks',
    subtitle: 'Earth · hold the line',
    character: 'goku',
    stage: 'wasteland',
    parTime: 360,
    qteLabel: 'Composure',
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'A mountain of a Saiyan who treats the fight as a game. Survive him — then make him pay.',
    rewards: ['Nappa boss fight (replayable)', 'Story continues: The Saiyan Prince'],
    setup,
    triBeam,
    chiaotzuSacrifice,
    phases: [P.intro, P.holdLine, P.sacrifice, P.goku, P.duel, P.finale],
  };

  SL.data.missions[def.id] = def;
})();
