/*
 * WHAT IF · CHAPTER 1 — "What if Goku never let go?"   (NOT CANON)
 * Astra What-If Bible, Scenario 09 — S01: "Don't Let Go" (PROPOSED STORY DESIGN · MEDIUM).
 *
 * Branches from "A Brother From Space" at the tail hold. In canon Goku's grip fails,
 * Raditz breaks the lock, and the fight ends with Piccolo's beam killing both brothers.
 * Here the grip holds: the player keeps it (a struggle that has to be kept alive), walks
 * the thrashing Saiyan out of his son's line and into Piccolo's, and then takes over
 * Piccolo to charge the shot and put it through Raditz alone.
 *
 * Divergence → the hold never breaks. Consequence → Raditz dies, Goku lives, and Gohan
 * never has the moment that broke him out of the pod. Ending → the defenders have a year
 * and no dead man to train with King Kai.
 *
 * Phases: HOLD (checkpoint: the grip, as a struggle) → STEER (checkpoint: walk him into
 * the lane and pin him there) → FIRE (as Piccolo: charge it, and Goku ducks) → AFTER.
 *
 * Saved on the separate What-If track (`whatIf`, `branchOf`); canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, 0);
  const LANE_SECONDS = 5; // how long Raditz has to be held in Piccolo's line
  const HOLD_SECONDS = 8;

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
    if (yaw !== undefined) f.yaw = yaw;
    f.prevYaw = f.yaw;
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

  /** Raditz is held: he stays where the grip puts him, thrashing, and cannot act. */
  function pinTo(r, holder, dist = 1.5) {
    const at = holder.pos.clone().addScaledVector(holder.forward, dist);
    at.y = holder.pos.y;
    r.setPosition(at);
    r.vel.set(0, 0, 0);
    r.yaw = r.prevYaw = holder.yaw; // held by the tail: his back is to the man holding him
  }

  function setup(battle) {
    const b = battle;
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 4))), startKi: 40 });
    goku.hp = Math.round(goku.hpMax * 0.4); // he has already been through the whole fight
    goku.lockedSlots = { transform: true };
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: ground(b, FIELD.clone().add(new V3(-12, 0, 12))), startKi: 70 });
    piccolo.hp = Math.round(piccolo.hpMax * 0.45);
    piccolo.controller = scripted();
    piccolo.lockedForms = { nail: true }; // Nail is a Namek-saga event, not this timeline
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(9, 0, 10))), startKi: 20 });
    gohan.controller = scripted();
    gohan.untargetable = true;
    gohan.cannotDie = true;
    const raditz = b.spawn({ charId: 'raditz', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, 1))), startKi: 60, tags: { boss: true, priority: true } });
    raditz.controller = scripted();
    raditz.hp = Math.round(raditz.hpMax * 0.3);
    raditz.cannotDie = true; // the beam kills him, not the grip
    faceTo(goku, raditz.pos);
    b.story = { goku, piccolo, gohan, raditz };
  }

  const P = {};

  /*
   * THE GRIP. Canon is one frame away the whole time: the struggle drains, and if it empties
   * he tears loose and the timeline snaps back (mission failed).
   */
  P.hold = {
    id: 'hold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, r = S.raditz;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 3))), Math.PI);
      place(r, ground(b, FIELD.clone().add(new V3(0, 0, 1.5))), Math.PI);
      faceTo(g, r.pos);
      g.cannotDie = true;
      g.setState('scripted', { pose: 'g_tailGrab', expression: 'grit' });
      r.setState('scripted', { pose: 'hitBody', expression: 'shock' });
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.music('battle', 5);
      m.shot((t, out) => {
        const mid = g.chest().lerp(r.chest(), 0.5);
        camAt(out, mid.clone().add(new V3(3.2, 1.2, 2.6)), mid, U.lerp(46, 40, t));
      }, 3.2, { cut: true, blendIn: 0, hold: true });
      m.say('raditz', 'Let go of my tail, you little — !', 2.6, { style: 'shout' });
      yield* m.cine(3.2);
      m.shot((t, out) => {
        const h = g.chest().add(new V3(0, 0.45, 0));
        camAt(out, h.clone().addScaledVector(g.forward, U.lerp(-1.6, -1.3, t)).add(new V3(0.4, 0.1, 0)), h, 36);
      }, 3, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'No. Not this time. Piccolo — get ready!', 2.8, { style: 'shout' });
      yield* m.cine(3);
      m.endShot();
      // the hold itself
      const pin = () => {
        pinTo(r, g, 1.6);
        r.setState('scripted', { pose: 'hitBody', expression: 'shock' });
        if (b.frame % 12 === 0) b.vfx.dust(r.pos, 1.6, 4);
      };
      m.tickHooks.push(pin);
      const res = yield* m.struggle({
        start: 0.62,
        drain: 0.2,
        duration: HOLD_SECONDS,
        label: 'DO NOT LET GO',
        canFail: true,
        keepInput: false,
        onTick: (t, grip) => b.cameraTraumaAt(r.chest(), 0.02 + (1 - grip) * 0.06),
      });
      m.tickHooks.splice(m.tickHooks.indexOf(pin), 1);
      if (res.failed) {
        // canon reasserts itself: he tears free, and this timeline never happens
        m.lock(true);
        r.setState('scripted', { pose: 'r_elbow', expression: 'angry' });
        g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
        b.cameraTraumaAt(r.chest(), 0.9);
        b.sfx('punchHeavy', r, { vol: 1.3, pitch: 0.8 });
        m.say('raditz', 'You could not even hold on to that.', 2.4);
        yield 2.6;
        m.fail('gripLost');
        yield () => false;
      }
      m.flags.heldOn = true;
      m.qteParts.push(U.clamp01(res.avg * 1.3));
      m.say('goku', 'I have got him! GOHAN, STAY BACK!', 2.4, { style: 'shout' });
      yield 1.2;
    },
  };

  /*
   * STEERING HIM. Still holding, the player walks Raditz out of the line to Gohan and into
   * Piccolo's, and keeps him there while Piccolo charges. Moving is the mechanic: the grip
   * drags him with you.
   */
  P.steer = {
    id: 'steer',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, r = S.raditz, pc = S.piccolo, gh = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(g, { force: true });
      // both hands are on the tail: there is nothing to lock on to, so the stick steers
      // him bodily across the field instead of orbiting a target
      r.untargetable = true;
      SL.Targeting.unlock(b, g, true);
      // the struggle dragged them off to Gohan's side of the field: the corridor to Piccolo
      // is a walk away, which is the phase
      place(g, ground(b, FIELD.clone().add(new V3(9, 0, 3))), Math.PI);
      place(pc, ground(b, FIELD.clone().add(new V3(-14, 0, 14))));
      place(gh, ground(b, FIELD.clone().add(new V3(11, 0, 11))));
      faceTo(pc, FIELD);
      faceTo(gh, FIELD);
      pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'grit' });
      gh.setState('scripted', { pose: 'kg_scared', expression: 'shock' });
      g.setState('free');
      g.cannotDie = true;
      g.lockedSlots = { transform: true, special1: true, special2: true, ultimate: true }; // both hands are busy
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 6);
      m.objective('lane', "Hold him in Piccolo's line", { icon: 'clock', target: LANE_SECONDS });
      m.objective('clear', 'Keep him away from Gohan', { icon: 'guard', optional: true });
      let inLane = 0, nearGohan = 0, said = false;
      const pin = () => {
        if (b.inputLocked) return;
        pinTo(r, g, 1.6);
        r.setState('scripted', { pose: 'hitBody', expression: 'angry' });
        // the lane: the corridor between Piccolo and the far side of the field
        const lane = FIELD.clone().sub(pc.pos).setY(0).normalize();
        const rel = r.pos.clone().sub(pc.pos).setY(0);
        const along = rel.dot(lane);
        const off = rel.clone().addScaledVector(lane, -along).length();
        const ok = along > 6 && off < 3.2;
        if (ok) {
          inLane += 1 / 60;
          m.progress('lane', Math.min(LANE_SECONDS, Math.floor(inLane)));
          if (b.frame % 6 === 0) b.vfx.ring(r.pos.clone().add(new V3(0, 0.2, 0)), 2.6, 0xd8b0ff, 0.25, new V3(0, 1, 0));
          if (!said) {
            said = true;
            m.say('piccolo', 'THAT is it. Keep him exactly there, Goku!', 2.6, { style: 'shout' });
          }
        } else if (inLane > 0) inLane = Math.max(0, inLane - 0.6 / 60);
        if (r.pos.distanceTo(gh.pos) < 6) nearGohan += 1 / 60;
        // Piccolo's charge is visible the whole time
        if (b.frame % 4 === 0) b.vfx.streamInward(pc.handPos('R'), 1.6, 0xd8b0ff, 2, 0.1, 0.3);
      };
      m.tickHooks.push(pin);
      m.prompt('steerHim', 'up', 'Walk him across — the grip drags him with you', { required: true, always: true, when: () => inLane < 1 });
      yield () => inLane >= LANE_SECONDS;
      m.tickHooks.splice(m.tickHooks.indexOf(pin), 1);
      m.complete('lane');
      if (nearGohan < 2) m.complete('clear');
      else m.failObjective('clear');
      m.flags.laneHeld = true;
      m.flags.nearGohan = Math.round(nearGohan);
      m.qteParts.push(U.clamp01(1 - nearGohan * 0.1));
      yield 0.4;
    },
  };

  /* THE SHOT. The player takes Piccolo, charges it, and it goes through one brother only. */
  P.fire = {
    id: 'fire',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, r = S.raditz, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(pc, { force: true });
      b.setParty([pc]);
      pc.setState('scripted', { pose: 'p_sbcCharge', expression: 'shout' });
      pinTo(r, g, 1.6);
      faceTo(pc, r.pos);
      m.music('finale', 5);
      m.shot((t, out) => {
        const h = pc.chest().add(new V3(0, 0.35, 0));
        camAt(out, h.clone().addScaledVector(pc.forward, U.lerp(2.6, 2, t)).add(new V3(0.7, 0.2, 0)), h, 38);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('piccolo', 'Hold him still. This only works once.', 2.6);
      yield* m.cine(2.6);
      const charge = () => {
        pinTo(r, g, 1.6);
        if (b.frame % 3 === 0) b.vfx.streamInward(pc.handPos('R'), 2.2, 0xd8b0ff, 3, 0.12, 0.35);
        b.camera.addTrauma(0.012);
      };
      m.tickHooks.push(charge);
      const res = yield* m.struggle({ start: 0.35, drain: -0.02, duration: 3.6, label: 'CHARGE IT', canFail: false, keepInput: false });
      m.tickHooks.splice(m.tickHooks.indexOf(charge), 1);
      m.flags.chargeAvg = Math.round(res.avg * 100) / 100;
      m.qteParts.push(U.clamp01(res.avg * 1.2));
      // Goku ducks; the beam takes Raditz alone
      m.shot((t, out) => {
        const mid = pc.chest().lerp(r.chest(), 0.55);
        const side = new V3(-(r.pos.z - pc.pos.z), 0, r.pos.x - pc.pos.x).normalize();
        camAt(out, mid.clone().addScaledVector(side, 9).add(new V3(0, 2, 0)), mid, 46);
      }, 4, { cut: true, blendIn: 0, hold: true });
      g.setState('scripted', { pose: 'knockdownFace', expression: 'grit' });
      pc.setState('scripted', { pose: 'p_sbcFire', expression: 'shout' });
      const from = pc.handPos('R'), to = r.chest();
      for (let i = 0; i <= 18; i++) b.vfx.trail(from.clone().lerp(to, i / 18), 0xd8b0ff, 0.35, 0.45);
      b.vfx.flash(to, 3, 0xf0e0ff, 0.4, SL.Toon.tex.glow);
      b.sfx('beamFire', pc, { vol: 1.4, pitch: 1.1 });
      b.cameraTraumaAt(to, 0.8);
      SL.ScreenFX.flash(0.4, '#e8d8ff');
      yield 0.8;
      r.setState('scripted', { pose: 'pierced', expression: 'ko' });
      b.vfx.sparks(r.chest(), 0xd8b0ff, 18, 12);
      m.say('raditz', 'Kakarot... you were supposed to be... one of us...', 3.4, { style: 'quiet' });
      yield* m.cine(3.6);
      r.hp = 0;
      r.alive = false;
      r.setHidden(true);
      b.vfx.dust(r.pos, 3, 14);
      m.flags.raditzDown = true;
      m.endShot();
      yield 0.6;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, pc = S.piccolo, gh = S.gohan;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, pc, gh]) f.controller = scripted();
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 3))), Math.PI);
      place(pc, ground(b, FIELD.clone().add(new V3(-5, 0, 6))));
      place(gh, ground(b, FIELD.clone().add(new V3(3, 0, 7))));
      faceTo(pc, g.pos);
      faceTo(g, pc.pos);
      faceTo(gh, g.pos);
      g.setState('scripted', { pose: 'exhausted', expression: 'hurt' });
      pc.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
      gh.setState('scripted', { pose: 'kg_scared', expression: 'soft' });
      m.music('finale', 3);
      // Goku is alive, and that is the whole difference
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, U.lerp(3, 2.4, t)).add(new V3(-0.8, 0.3, 0)), g.chest(), 40), 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'He is gone. And I am still here. Gohan — you are all right, you are all right...', 4, { style: 'quiet' });
      yield* m.cine(4.2);
      m.shot((t, out) => camAt(out, pc.chest().clone().addScaledVector(pc.forward, 2.6).add(new V3(0.7, 0.3, 0)), pc.chest(), 38), 3.6, { cut: true, blendIn: 0, hold: true });
      m.say('piccolo', 'Your boy never woke up for it this time. Whatever was in him is still in there, asleep.', 4.2);
      yield* m.cine(4.4);
      m.say('piccolo', 'Two more are coming in a year, and they are worse. I am taking the child. You train too, Goku — you are going to need it.', 5);
      yield* m.cine(5.2);
      m.shot((t, out) => camAt(out, g.chest().clone().add(new V3(5, 4, 9)), g.chest().clone().add(new V3(0, 1, -4)), U.lerp(48, 56, t)), 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'A year. No King Kai this time — just us.', 3.2, { style: 'quiet' });
      yield* m.cine(3.6);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('WHAT IF...?', 'THE HOLD NEVER BROKE', 'An alternate timeline · Not canon', 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'whatif_tail',
    whatIf: true,
    branchOf: 'saiyan_brothers',
    branchPoint: 'hold',
    chapter: 'WHAT IF · CHAPTER 1',
    title: 'What if Goku never let go?',
    subtitle: 'Earth · Age 761 · Alternate timeline',
    character: 'goku',
    stage: 'plains',
    parTime: 210,
    qteLabel: 'Keep the grip',
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'The grip that failed in the story you know. Hold it, walk him out of your son\'s line and into Piccolo\'s, and only one brother dies on this field.',
    rewards: ['An alternate ending: the hold never broke', 'Goku lives, and nobody trains with King Kai'],
    setup,
    phases: [P.hold, P.steer, P.fire, P.after],
  };

  SL.data.missions[def.id] = def;
})();
