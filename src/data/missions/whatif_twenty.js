/*
 * WHAT IF · CHAPTER 4 — "What if x20 went into the ground instead?"   (NOT CANON)
 * Astra What-If Bible, Scenario 60 — N24: "Twenty Is Not Enough Time" (PROPOSED STORY DESIGN · MEDIUM).
 *
 * Branches from "Kaio-ken Times Twenty" at the moment Goku spends everything on one
 * Kamehameha. In canon Frieza turns that beam aside with one hand. Here Goku spends the
 * multiplier differently: short bursts of x20 aimed at the spires Frieza fires from, so
 * the emperor has to come down and fight in the open. It hurts him. It also finishes Goku.
 *
 * Divergence → the x20 is spent on the ground, not on one beam. Consequence → Frieza is
 * injured, Goku's body gives out mid-air and Piccolo catches him, and the player finishes
 * the mission as Piccolo keeping a helpless Goku alive. Ending → they retreat.
 *
 * Phases: BURSTS (checkpoint: x20 bursts against the firing positions) → COLLAPSE (the
 * aura dies mid-air) → DEFEND (checkpoint: played as Piccolo, over Goku's body) → RETREAT.
 *
 * Saved on the separate What-If track (`whatIf`, `branchOf`); canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const X20 = 4; // Kaioken form level: x2, x3, x4, x10, x20
  const HOLD_SECONDS = 26; // how long Piccolo has to keep Frieza off him

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
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
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
  /** The Kaioken at an exact level (the engine only climbs one level per charge). */
  function kaioken(g, level) {
    if (g.formIndex !== 1) g.applyForm(1);
    g.formLevel = Math.min(level, g.form.levels.length - 1);
    g._applyFormLevel();
  }

  /** A spire Frieza fires from: Namekian rock, and only the Kaioken puts a dent in it. */
  function spire(b, at, i) {
    // the prop's centre sits low on the shard: a hit at chest height has to count
    const pos = ground(b, at, 1.2);
    const pr = b.stage.addProp({ kind: 'boulder', pos, r: 3, hp: 4200, id: 'spire' + i });
    pr.static = true;
    pr.rocky = true;
    pr.requireForm = 'kaioken';
    pr.debrisColor = 0x7a8a5a;
    pr.explodeColor = 0xcfe08a;
    // a leaning shard of Namekian rock, not a smooth cone: the stage's own stone colour,
    // five faces, tilted, with a broken chunk at the base
    const col = b.stage.rockColor || 0x7f8f66;
    const shard = new THREE.Mesh(b.stage.track(new THREE.ConeGeometry(2.3, 8.5, 5, 1)), SL.Toon.mat(col));
    shard.position.y = 3.2;
    shard.rotation.set(U.rand(-0.09, 0.09), U.rand(0, Math.PI), U.rand(-0.09, 0.09));
    SL.Toon.addOutline(shard, 2);
    const base = new THREE.Mesh(b.stage.track(new THREE.DodecahedronGeometry(1.9, 0)), SL.Toon.mat(col));
    base.position.y = 0;
    base.scale.set(1.2, 0.7, 1.1);
    SL.Toon.addOutline(base, 2);
    pr.group.add(shard, base);
    return pr;
  }

  /**
   * Frieza with a body on the ground to get to. He goes for Goku, and only stops to deal
   * with whoever puts himself in the way — which is the whole job of the DEFEND phase.
   */
  function hunter(b, fz, goku, pc, state) {
    const ai = cpu(b);
    return {
      update: (f) => {
        if (b.inputLocked || b.aiLocked) return SL.emptyIntent();
        // anybody standing in the way, or anybody who just hit him, gets dealt with first
        const provoked = state.hitAt !== undefined && b.frame - state.hitAt < 180;
        if (pc.alive && (fz.distTo(pc) < 9 || provoked)) {
          fz.target = pc;
          return ai.update(f);
        }
        // nobody in the way: walk to the body
        fz.target = null;
        const it = SL.emptyIntent();
        const dx = goku.pos.x - fz.pos.x, dz = goku.pos.z - fz.pos.z;
        const d = Math.hypot(dx, dz);
        it.camYaw = Math.atan2(dx, dz);
        if (d > 1.6) {
          it.my = 1;
          it.boost = d > 9;
        } else if (b.frame % 40 === 0) it.light = true;
        return it;
      },
    };
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 26); // the spires stand where the cleared ring ends
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 6))), startKi: 100 });
    goku.hp = Math.round(goku.hpMax * 0.62);
    goku.formCaps = { kaioken: X20 };
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, FIELD.clone().add(new V3(14, 0, 20))), startKi: 70 });
    piccolo.hp = Math.round(piccolo.hpMax * 0.55);
    piccolo.controller = scripted();
    piccolo.untargetable = true;
    piccolo.setHidden(true);
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -7))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    frieza.cannotDie = true; // this branch is not a Frieza kill: it is an escape
    faceTo(goku, frieza.pos);
    faceTo(frieza, goku.pos);
    b.story = { goku, piccolo, frieza, spires: [] };
  }

  const P = {};

  /*
   * THE BURSTS. Same x20, spent differently: light it, break a firing position, put it out
   * before it puts him out. Nothing else on the field can touch the rock.
   */
  P.bursts = {
    id: 'bursts',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -7))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      g.strainScale = 0.001; // the intro is a held pose, not a clock on his body (0 falls back to 1)
      g.strain = 0;
      kaioken(g, X20);
      g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'grit' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.music('finale', 4);
      m.shot((t, out) => camAt(out, g.chest().clone().add(new V3(2.6, 0.8, 3.4)), g.chest(), U.lerp(44, 40, t)), 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'One shot and he swats it away... but he has to be standing somewhere.', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      // the spires he keeps firing from
      const spots = [FIELD.clone().add(new V3(-13, 0, -11)), FIELD.clone().add(new V3(14, 0, -9)), FIELD.clone().add(new V3(1, 0, -17))];
      S.spires = spots.map((p, i) => spire(b, p, i));
      m.shot((t, out) => {
        // along the line from Goku past the nearest spire: his shoulder, their height
        const sp = S.spires[0].pos;
        const back = g.pos.clone().sub(sp).setY(0).normalize();
        camAt(out, sp.clone().addScaledVector(back, U.lerp(13, 10, t)).add(new V3(2.4, 4.2, 0)), sp.clone().add(new V3(0, 2.4, 0)), 46);
      }, 3, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Take away the high ground, and he has to come down here with me.', 3, { style: 'shout' });
      yield* m.cine(3.2);
      m.endShot();
      // played: Frieza fights, but he cannot be finished here
      fz.applyForm(3);
      fz.mech.phase = 3;
      fz.bossPhaseCap = 3;
      fz.cannotDie = true;
      // he is not trying to finish this: he is watching a man burn himself down
      fz.damageDealtMul = 0.35;
      fz.aiPhase = 'dominant';
      fz.aiRhythm = { burst: 40, rest: 210 }; // he strikes, then stands back and watches
      fz.controller = cpu(b);
      fz.target = g;
      g.target = fz;
      g.lockedSlots = { transform: false };
      g.applyForm(0); // he comes off it to decide, and has to light it again for every burst
      g.strain = 0;
      g.strainScale = 0.45; // x20 is survivable in bursts, and only in bursts (about six seconds each)
      g.damageTakenMul = 0.5; // the spires are the fight here, not Frieza's health bar
      g.cannotDie = true;
      for (const f of [g, fz]) f.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 4);
      m.objective('spires', 'Destroy his firing positions', { icon: 'ball', target: S.spires.length });
      m.objective('burst', 'Do it in bursts — power down between them', { icon: 'clock', optional: true });
      m.prompt('goTwenty', 'transform', 'Kaioken — it comes straight back at x20', { required: true, always: true, when: () => g.formIndex !== 1 });
      let broken = 0, overheld = 0, said = false;
      // only the x20 actually breaks the rock: anything less chips it and heals back
      const offDmg = b.on('propDamaged', (e) => {
        if (e.owner !== g) return;
        if (g.formIndex !== 1 || g.formLevel < X20) {
          e.prop.hp = Math.min(e.prop.maxHp, e.prop.hp + e.amount);
          b.emit('propResisted', { prop: e.prop, owner: g });
          if (!said) {
            said = true;
            m.say('goku', 'Not at this power. It has to be twenty.', 2.4, { style: 'quiet' });
          }
        }
      });
      const offDead = b.on('propDestroyed', (e) => {
        if (!S.spires.includes(e.prop)) return;
        broken++;
        m.progress('spires', broken);
        // every position he loses costs him: he has to fight where Goku is standing
        fz.hp = Math.max(Math.round(fz.hpMax * 0.2), fz.hp - Math.round(fz.hpMax * 0.12));
        b.vfx.sparks(fz.chest(), 0xffd0d0, 12, 8);
        b.bark(fz, 'hurt', true);
      });
      const hook = () => {
        if (b.inputLocked) return;
        // his body already knows the way up: every burst comes back at twenty, and the strain
        // arrives with it — the choice is how long he stays there, not how high he goes
        if (g.formIndex === 1 && g.formLevel < X20) {
          g.formLevel = X20;
          g._applyFormLevel();
        }
        // between bursts he gets his breath back, or there is no second burst
        if (g.formIndex === 0 && g.ki < 60) g.ki = Math.min(100, g.ki + 28 / 60);
        // the x20 is what costs him, not a health bar race: he leaves this phase hurt, not dying
        g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.18));
        // holding x20 instead of using it in bursts is the thing the optional objective watches
        if (g.formIndex === 1 && g.formLevel >= X20) overheld += 1 / 60;
        else overheld = Math.max(0, overheld - 0.5 / 60);
        if (overheld > 12) m.failObjective('burst');
      };
      m.tickHooks.push(hook);
      yield () => broken >= S.spires.length;
      m.tickHooks.splice(m.tickHooks.indexOf(hook), 1);
      offDmg();
      offDead();
      m.prompts.delete('goTwenty');
      m.complete('spires');
      if (overheld <= 12) m.complete('burst');
      // the grade for this mission is how disciplined the bursts were, not how long he held x20
      m.qteParts.push(U.clamp01(1 - overheld / 14));
      m.flags.spires = broken;
      m.flags.friezaHurt = Math.round((1 - fz.hpFrac) * 100);
      m.lock(true);
      // he lets the multiplier go the moment the last position falls
      kaioken(g, 0);
      g.applyForm(0);
      g.strain = 60;
      yield 0.8;
      // hurt, still standing: what takes him down next is the story beat, not the health bar
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.22));
    },
  };

  /* THE COLLAPSE. The aura goes out in the air, and somebody has to be under him. */
  P.collapse = {
    id: 'collapse',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      // he is in the air when it happens
      const air = ground(b, FIELD.clone().add(new V3(0, 0, 4)), 9);
      g.setPosition(air);
      g.grounded = false;
      g.vel.set(0, 0, 0);
      g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'shout' });
      // he is in the air until the aura goes out: hold him there, gravity does not get a vote yet
      const hover = () => {
        g.setPosition(air);
        g.vel.set(0, 0, 0);
        g.fallVel = 0;
        g.grounded = false;
      };
      m.tickHooks.push(hover);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -10))), 0);
      faceTo(fz, g.pos);
      fz.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.music('finale', 3);
      m.shot((t, out) => camAt(out, g.chest().clone().add(new V3(3.6, 0.6, 4.2)), g.chest(), U.lerp(44, 38, t)), 2.8, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Three rocks. You spent the last of yourself on three rocks.', 3, { style: 'quiet' });
      yield* m.cine(3);
      // the aura dies
      kaioken(g, 0);
      g.applyForm(0);
      g.strain = 95;
      g.hp = Math.max(1, Math.round(g.hpMax * 0.05));
      g.aura.target = 0;
      g.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
      b.sfx('powerDown', g, { vol: 1.1 });
      b.vfx.sparks(g.chest(), 0xff6a4a, 14, 8);
      m.shot((t, out) => camAt(out, air.clone().add(new V3(0, 1.2, 5.5)), air.clone().add(new V3(0, U.lerp(1, -2.5, t), 0)), 46), 2.4, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'No... not yet... my body will not...', 2.2, { style: 'quiet' });
      yield* m.cine(1.2);
      // and now he falls
      m.tickHooks.splice(m.tickHooks.indexOf(hover), 1);
      // and Piccolo is under him
      pc.setHidden(false);
      pc.untargetable = false;
      place(pc, ground(b, FIELD.clone().add(new V3(0, 0, 4))), 0);
      faceTo(pc, fz.pos);
      pc.setState('scripted', { pose: 'guard', expression: 'grit' });
      b.vfx.dust(pc.pos, 2.4, 10);
      yield* m.cine(1.2);
      const land = ground(b, FIELD.clone().add(new V3(0.9, 0, 4.4)));
      g.setPosition(land);
      g.grounded = true;
      g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      b.vfx.dust(g.pos, 2.2, 10);
      b.cameraTraumaAt(g.chest(), 0.35);
      m.shot((t, out) => {
        const mid = pc.chest().lerp(g.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(3.2, 1.4, 3.4)), mid, 42);
      }, 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('piccolo', 'I have got you. Do not move — do not even breathe hard.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      m.say('frieza', 'How convenient. I was going to have to go and find the green one anyway.', 3.4);
      yield* m.cine(3.6);
      m.flags.caught = true;
      m.endShot();
    },
  };

  /* DEFEND. Played as Piccolo, over a body. Frieza cannot be beaten here — only kept off. */
  P.defend = {
    id: 'defend',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      pc.setHidden(false);
      pc.untargetable = false;
      place(pc, ground(b, FIELD.clone().add(new V3(0, 0, 4))), 0);
      place(g, ground(b, FIELD.clone().add(new V3(0.9, 0, 4.4))), 0);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -10))), 0);
      g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      g.controller = scripted();
      // restarting from this checkpoint puts him back exactly as the collapse left him
      g.applyForm(0);
      g.strain = 95;
      g.hp = Math.max(1, Math.round(g.hpMax * 0.05));
      g.aura.target = 0;
      g.cannotDie = true;
      g.untargetable = true; // Frieza walks to him; he does not snipe him
      b.switchPlayer(pc, { force: true });
      b.setParty([pc]);
      pc.cannotDie = true; // Piccolo goes down, he does not die here
      pc.setState('free');
      fz.infiniteHp = true;
      fz.cannotDie = true;
      fz.damageDealtMul = 0.6;
      const hunted = {};
      const offHit = b.on('damage', (e) => {
        if (e.target === fz && e.attacker === pc) hunted.hitAt = b.frame;
      });
      m.onDispose(offHit);
      fz.controller = hunter(b, fz, g, pc, hunted);
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 4);
      m.objective('hold', 'Keep him off Goku', { icon: 'clock', target: HOLD_SECONDS });
      m.objective('untouched', 'Do not let him reach the body', { icon: 'guard', optional: true });
      let held = 0, breached = 0, warned = false;
      const hook = () => {
        if (b.inputLocked) return;
        held += 1 / 60;
        m.progress('hold', Math.min(HOLD_SECONDS, Math.floor(held)));
        if (fz.distTo(g) < 6) {
          breached += 1 / 60;
          if (!warned) {
            warned = true;
            m.say('piccolo', 'Not one more step towards him!', 2.2, { style: 'shout' });
          }
          if (b.frame % 30 === 0) b.vfx.sparks(g.chest(), 0xff6a4a, 5, 5);
          if (breached > 3.5) {
            // he gets a hand in: Goku pays for it, and the clean run is gone
            if (b.frame % 30 === 0) g.hp = Math.max(Math.round(g.hpMax * 0.03), g.hp - 6);
            m.failObjective('untouched');
          }
        }
      };
      m.tickHooks.push(hook);
      yield () => held >= HOLD_SECONDS;
      m.tickHooks.splice(m.tickHooks.indexOf(hook), 1);
      offHit();
      m.complete('hold');
      if (breached <= 3.5) m.complete('untouched');
      m.qteParts.push(U.clamp01(1 - breached / HOLD_SECONDS));
      m.flags.held = Math.round(held);
      m.flags.breached = Math.round(breached * 10) / 10;
      m.lock(true);
      yield 0.6;
    },
  };

  /* RETREAT. Nobody wins today. They leave with him. */
  P.retreat = {
    id: 'retreat',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz, pc]) f.controller = scripted();
      place(pc, ground(b, FIELD.clone().add(new V3(0, 0, 4))), 0);
      place(g, ground(b, FIELD.clone().add(new V3(0.9, 0, 4.4))), 0);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -12))), 0);
      faceTo(pc, fz.pos);
      faceTo(fz, pc.pos);
      pc.setState('scripted', { pose: 'guard', expression: 'grit' });
      g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      fz.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.music('finale', 3);
      m.shot((t, out) => camAt(out, fz.chest().clone().addScaledVector(fz.forward, U.lerp(3.4, 2.8, t)).add(new V3(0.7, 0.2, 0)), fz.chest(), 40), 3.6, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Look at my planet. Three of my perches gone, and I am bleeding. ...Take him and run, Namekian. I will find you both.', 5);
      yield* m.cine(5.2);
      m.shot((t, out) => {
        const mid = pc.chest().lerp(g.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(3, 1.2, 3.2)), mid, 42);
      }, 4, { cut: true, blendIn: 0, hold: true });
      m.say('piccolo', 'The ship is two valleys out. You are going to live, Goku — that is all today was for.', 4.2);
      yield* m.cine(4.4);
      pc.setState('scripted', { pose: 'flyUp', expression: 'grit' });
      b.vfx.dust(pc.pos, 3, 12);
      b.sfx('powerUp', pc, { vol: 0.9 });
      m.shot((t, out) => camAt(out, FIELD.clone().add(new V3(8, 4, 14)), FIELD.clone().add(new V3(0, U.lerp(2, 20, t), 0)), U.lerp(46, 54, t)), 3.2, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('WHAT IF...?', 'TWENTY WAS NOT ENOUGH TIME', 'No beam, no victory — a wounded emperor and a retreat · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_twenty',
    whatIf: true,
    branchOf: 'namek_kaioken20',
    branchPoint: 'kamehameha',
    chapter: 'WHAT IF · CHAPTER 4',
    title: 'What if x20 never became a Kamehameha?',
    subtitle: 'Namek · Age 762 · Alternate timeline',
    character: 'goku',
    stage: 'namek',
    parTime: 330,
    qteLabel: 'Bursts held',
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'Spend the Kaioken in bursts instead of one beam: break the ground Frieza fires from, pay for it with your body, and finish the mission as Piccolo standing over you.',
    rewards: ['An alternate ending: the retreat', 'Play Piccolo defending a helpless Goku'],
    setup,
    phases: [P.bursts, P.collapse, P.defend, P.retreat],
  };

  SL.data.missions[def.id] = def;
})();
