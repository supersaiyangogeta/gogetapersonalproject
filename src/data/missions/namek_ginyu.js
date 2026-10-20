/*
 * CHAPTER 4 — NAMEK SAGA (ninth mission of the Namek foundation, in development)
 * Mission "The Captain" (canon, played as Goku — and then as Goku in somebody
 * else's body).
 *
 * Canon beats: Jeice comes back with Captain Ginyu. Ginyu fights Goku honestly
 * for as long as that is going well for him, and when it stops going well he
 * takes the only thing he really wants: the body. Goku is left in a wrecked one
 * and has to hold the line with Krillin and Gohan until Ginyu overreaches and
 * goes for Vegeta as well — which is the moment to get in the way.
 *
 * Phases: ARRIVAL (cutscene) → CAPTAIN (checkpoint: a straight fight, with one
 * rule taught: when he opens his chest, be somewhere else) → CHANGE (cutscene:
 * he wounds his own body and takes Goku's) → STOLEN (checkpoint: the player
 * fights on in Ginyu's broken body) → RETAKE (checkpoint: step into the beam he
 * aims at Vegeta) → AFTER (cutscene).
 *
 * The systems under it are `battle.swapBodies` and the `bodyChange` technique;
 * this mission is what they are for.
 *
 * BODY STATE (playtest round 2 made it explicit; m.flags.bodyState):
 *   original  Goku's body + Goku's mind (player)   Ginyu's body + Ginyu's mind (AI)
 *   swapped   Goku's body + Ginyu's mind (AI)      Ginyu's body + Goku's mind (player)
 *   restored  back to original — the retake: Goku steps into the beam aimed at Vegeta
 * Nothing else is allowed: a Body Change that lands during the CAPTAIN fight is deferred
 * (battle.deferBodyChange) and happens inside the change scene, once, staged — never
 * silently mid-air, and never a second swap on top of the first (which is what used to
 * hand the player Goku's own body back while his friends fought the captain in it).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const HOLD_SECONDS = 40;
  const KNOCKDOWNS = 2;

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
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }
  /** The body Goku's mind is in right now (it changes hands twice). */
  function gokuBody(b) {
    return b.fighters.find((f) => b.mindOf(f).id === 'goku') || b.story.goku;
  }
  /** The body Ginyu's mind is in right now. */
  function ginyuBody(b) {
    return b.fighters.find((f) => b.mindOf(f).id === 'ginyu') || b.story.ginyu;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 36);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 12))), startKi: 90 });
    goku.lockedForms = { kaioken: true }; // he is saving it, and the story needs him beaten fairly
    goku.formCaps = { kaioken: 2 }; // x4 is as far as he goes before Frieza
    goku.lockedSlots = { transform: true };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(8, 0, 17))), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-8, 0, 18))), startKi: 60 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(15, 0, 20))), startKi: 60 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    for (const f of [krillin, gohan, vegeta]) {
      f.controller = scripted();
      f.untargetable = true;
      f.cannotDie = true;
    }
    const ginyu = b.spawn({ charId: 'ginyu', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -8))), startKi: 90, tags: { boss: true, priority: true } });
    const jeice = b.spawn({ charId: 'jeice', team: 1, pos: ground(b, FIELD.clone().add(new V3(-7, 0, -12))), startKi: 70 });
    for (const f of [ginyu, jeice]) f.controller = scripted();
    jeice.untargetable = true; // the captain told him to stay out of it
    jeice.cannotDie = true;
    faceTo(goku, FIELD);
    for (const f of [ginyu, jeice]) faceTo(f, goku.pos);
    b.story = { goku, krillin, gohan, vegeta, ginyu, jeice };
  }

  const P = {};

  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, gy = S.ginyu, jc = S.jeice;
      m.lock(true);
      m.music('menu', 0);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      g.setState('scripted', { pose: 'idle', expression: 'calm' });
      jc.setState('scripted', { pose: 'jc_pose', expression: 'smirk' });
      gy.setState('scripted', { pose: 'gy_pose', expression: 'smirk' });
      m.shot((t, out) => {
        const c = gy.chest();
        camAt(out, c.clone().addScaledVector(gy.forward, U.lerp(6.5, 4, t)).add(new V3(1.4, 1.1, 0)), c, 46);
      }, 3.4, { cut: true, blendIn: 0 });
      m.say('jeice', 'That is him, Captain. He did for Burter.', 3);
      yield* m.cine(3.4);
      m.shot((t, out) => camAt(out, gy.chest().clone().addScaledVector(gy.forward, 2.6).add(new V3(-0.8, 0.3, 0)), gy.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('ginyu', 'Captain Ginyu. You have heard of me, I am sure.', 3);
      yield* m.cine(3.2);
      // he reads the scouter, and likes what it says rather more than he should
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, 2.4).add(new V3(0.9, 0.4, 0)), g.chest(), 40), 3.2, { cut: true, blendIn: 0 });
      b.sfx('uiSelect', gy, { pitch: 1.4 });
      m.say('ginyu', 'A fine body. Wasted on you.', 2.8);
      yield* m.cine(3.2);
      m.endShot();
    },
  };

  P.captain = {
    id: 'captain',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, gy = S.ginyu;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (b.player !== g) b.switchPlayer(g, { force: true });
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 10))), Math.PI);
      place(gy, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      place(S.jeice, ground(b, FIELD.clone().add(new V3(-14, 0, -16))), 0);
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      gy.hp = gy.hpMax;
      gy.mech.phase = 0;
      gy.poise.value = gy.poise.max;
      gy.cannotDie = true; // the story needs him standing at the end of this
      // canon: Goku is the stronger of the two — which is exactly why the captain wants his body.
      // (Since playtest round 2 his Milky Cannon actually fires; the edge keeps the fight the story's.)
      g.damageDealtMul = 1.3;
      g.damageTakenMul = 0.65;
      gy.controller = cpu(b);
      gy.target = g;
      g.target = gy;
      g.setState('free');
      gy.setState('free');
      m.lock(false);
      b.aiLocked = false;
      // the Ginyu Force's own theme (soundtrack PDF p.95, an original stand-in: superhero-show brass)
      m.music('ginyu_force', 3);
      m.objective('hurt', 'Make the captain want a different body', { icon: 'fist' });
      m.objective('dodged', 'Never be there when the beam fires', { icon: 'guard', optional: true });
      let attempts = 0, dodged = 0, taken = 0;
      b.on('bodyChangeStart', (e) => {
        if (e.fighter === gy) attempts++;
      });
      b.on('bodyChangeMissed', (e) => {
        if (e.fighter !== gy) return;
        dodged++;
        b.bark(gy, 'missed', true);
      });
      // if the beam reaches Goku during the fight, the swap waits for the scene (it is staged there)
      b.deferBodyChange = (thief, victim) => {
        if (thief !== gy || victim !== g) return false;
        taken++;
        m.failObjective('dodged');
        return true;
      };
      // the rule of the fight, taught exactly where it applies
      m.prompt('gyChange', 'dodge', 'He is opening up — get out of the line', {
        always: true,
        when: () => gy.state === 'bodyChange',
        until: () => gy.state !== 'bodyChange',
      });
      yield () => gy.hpFrac <= 0.4 || !g.alive || taken > 0;
      b.deferBodyChange = null;
      g.damageDealtMul = 1;
      g.damageTakenMul = 1;
      if (!g.alive) return;
      m.complete('hurt');
      if (!taken) m.complete('dodged');
      m.flags.changeAttempts = attempts;
      m.flags.changeDodged = dodged;
      m.flags.changeTakenEarly = taken;
      yield 0.5;
    },
  };

  P.change = {
    id: 'change',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.deferBodyChange = null;
      for (const f of [S.goku, S.ginyu]) f.controller = scripted();
      // telegraph, beam, two souls crossing it, and who is in which body — shown, once
      yield* SL.Cinema.play(m, 'ginyu_takes_goku');
    },
  };

  P.stolen = {
    id: 'stolen',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      // whichever body Goku's mind is in is the one the player holds
      if (gokuBody(b) === S.goku) {
        // reached directly from a checkpoint: stage the swap that the story already made
        b.swapBodies(S.ginyu, S.goku, { penalty: 0.55, penalize: S.goku, silent: true });
      }
      const me = gokuBody(b), him = ginyuBody(b);
      for (const f of [S.krillin, S.gohan]) {
        f.untargetable = false;
        f.controller = null;
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, 60);
        f.cannotDie = true;
      }
      place(me, ground(b, FIELD.clone().add(new V3(0, 0, 9))), Math.PI);
      place(him, ground(b, FIELD.clone().add(new V3(0, 0, -8))), 0);
      place(S.krillin, ground(b, FIELD.clone().add(new V3(5, 0, 13))), Math.PI);
      place(S.gohan, ground(b, FIELD.clone().add(new V3(-5, 0, 14))), Math.PI);
      me.hp = Math.round(me.hpMax * 0.35); // the body he was given is a wreck
      me.ki = Math.max(me.ki, 60);
      me.cannotDie = true;
      him.hp = Math.round(him.hpMax * 0.8);
      him.cannotDie = true;
      him.controller = cpu(b);
      him.target = me;
      if (b.player !== me) b.switchPlayer(me, { force: true });
      b.setParty([me, S.krillin, S.gohan]);
      for (const f of [me, S.krillin, S.gohan]) f.target = him;
      me.setState('free');
      him.setState('free');
      m.flags.bodyState = 'swapped';
      // the one sentence of text the change gets: who you are now, and in what
      m.title('BODY CHANGE', 'YOU ARE GOKU', "in Captain Ginyu's broken body — his moves, his wounds", 3);
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 3);
      m.objective('hold', 'Hold out in the body you were given', { icon: 'clock', target: HOLD_SECONDS });
      const down = m.objective('down', 'Knock your own body down ' + KNOCKDOWNS + ' times', { icon: 'fist', optional: true, target: KNOCKDOWNS });
      let knocked = 0, t = 0;
      b.on('knockdown', (e) => {
        if (e.fighter !== him) return;
        knocked++;
        m.progress('down', Math.min(KNOCKDOWNS, knocked));
      });
      m.prompt('gyWeak', 'special1', 'This body has his moves — use them', { always: true, when: () => t > 4 && t < 12 });
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('hold', Math.min(HOLD_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= HOLD_SECONDS || !b.partyAlive().length;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!b.partyAlive().length) return;
      m.complete('hold');
      if (knocked >= KNOCKDOWNS) m.complete('down');
      else m.failObjective('down');
      m.flags.knockedOwnBody = knocked;
      m.qteParts.push(U.clamp01(b.player.hpFrac));
      yield 0.5;
    },
  };

  P.retake = {
    id: 'retake',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      if (gokuBody(b) === S.goku) b.swapBodies(S.ginyu, S.goku, { penalty: 0.55, penalize: S.goku, silent: true });
      const me = gokuBody(b), him = ginyuBody(b), vg = S.vegeta;
      for (const f of [S.krillin, S.gohan]) {
        f.untargetable = true;
        f.controller = scripted();
      }
      vg.untargetable = false;
      vg.controller = cpu(b);
      vg.hp = vg.hpMax;
      vg.cannotDie = true;
      place(me, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(him, ground(b, FIELD.clone().add(new V3(0, 0, -10))), 0);
      place(vg, ground(b, FIELD.clone().add(new V3(0, 0, 16))), Math.PI);
      me.hp = Math.max(me.hp, Math.round(me.hpMax * 0.3));
      me.hpFloor = 0.12; // he is wrecked, not a corpse that keeps walking
      me.ki = Math.max(me.ki, 70);
      me.cannotDie = true;
      him.hp = Math.round(him.hpMax * 0.65);
      him.cannotDie = true;
      him.controller = cpu(b);
      him.target = vg;
      if (b.player !== me) b.switchPlayer(me, { force: true });
      b.setParty([me]);
      me.target = him;
      me.setState('free');
      him.setState('free');
      vg.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 3);
      m.objective('block', 'Get in the way of the next Body Change', { icon: 'guard' });
      const first = m.objective('firstTry', 'Take it on his first attempt', { icon: 'guard', optional: true });
      let attempts = 0, missed = 0, restored = false, intercepted = false;
      const spec = SL.data.characters.ginyu.boss.techniques.change;
      b.on('bodyChangeStart', () => attempts++);
      b.on('bodyChangeIntercepted', () => (intercepted = true));
      b.on('bodyChangeMissed', () => missed++);
      b.on('bodyChanged', () => {
        if (b.mindOf(S.goku).id === 'goku') restored = true;
      });
      m.prompt('gyLine', 'dash', 'He is aiming at Vegeta — get into the beam', {
        always: true,
        when: () => ginyuBody(b).state === 'bodyChange',
        until: () => ginyuBody(b).state !== 'bodyChange',
      });
      // he keeps trying for Vegeta; Vegeta is told to move, so the only way this
      // ends is somebody stepping into it
      let cd = 90;
      const hook = () => {
        if (b.inputLocked || restored) return;
        const thief = ginyuBody(b);
        // the attempt clock runs whatever he is doing: a captain who never stops
        // punching Vegeta would otherwise never get round to taking his body
        if (thief.state !== 'bodyChange') cd--;
        if (thief.state === 'bodyChange') {
          // Vegeta gets out of the way at the last moment unless the beam has
          // already found somebody closer
          if (thief.stateFrame === spec.startup - 2 && !intercepted && vg.state !== 'dodge') {
            vg.setState('dodge', { dir: new V3(1, 0, 0) });
          }
          return;
        }
        // he has lost interest in the wreck he handed over: everything he does now
        // is aimed at the prince, which is what leaves the player free to move
        thief.target = vg;
        if (cd > 0) return;
        cd = 180;
        // whatever he was in the middle of, the body is what he actually wants
        if (thief.state !== 'free') thief.setState('free');
        intercepted = false;
        SL.Techniques.bodyChange.start(thief, spec, 'boss', 0);
        b.bark(thief, 'change', true);
      };
      m.tickHooks.push(hook);
      yield () => restored || !b.partyAlive().length;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!restored) return;
      m.flags.bodyState = 'restored';
      m.title('BODY CHANGE', 'GOKU IS BACK', 'in his own body', 2.6);
      m.complete('block');
      if (attempts <= 1) m.complete('firstTry');
      else m.failObjective('firstTry');
      m.flags.retakeAttempts = attempts;
      m.flags.vegetaDodges = missed;
      yield 0.5;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, gy = S.ginyu, vg = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, gy, vg]) f.controller = scripted();
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(gy, ground(b, FIELD.clone().add(new V3(0, 0, -2))), 0);
      place(vg, ground(b, FIELD.clone().add(new V3(6, 0, 8))), Math.PI);
      g.setState('scripted', { pose: 'idle', expression: 'calm' });
      gy.setState('scripted', { pose: 'gy_defeat', expression: 'hurt' });
      vg.setState('scripted', { pose: 'idle', expression: 'grit' });
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, 3).add(new V3(0.9, 0.5, 0)), g.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('goku', 'I will take that back, thanks.', 2.6);
      yield* m.cine(3.2);
      m.shot((t, out) => camAt(out, gy.chest().clone().add(new V3(1.8, 0.7, 2.6)), gy.chest(), 44), 3.2, { cut: true, blendIn: 0 });
      b.bark(gy, 'beaten', true);
      yield* m.cine(3.2);
      m.shot((t, out) => camAt(out, vg.chest().clone().addScaledVector(vg.forward, 2.6).add(new V3(-0.9, 0.4, 0)), vg.chest(), 42), 3.2, { cut: true, blendIn: 0 });
      m.say('vegeta', 'He will try it again the moment anyone turns their back. Do not let him speak.', 3);
      yield* m.cine(3.2);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', 'THE CAPTAIN', m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_ginyu',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: 'The Captain',
    subtitle: 'Namek · Goku against Captain Ginyu, and then against his own body',
    character: 'goku',
    stage: 'namek',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Ginyu does not want to beat you. He wants what you are standing in. When he opens his chest, be somewhere else — and when he does it to somebody else, be exactly in the way.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.arrival, P.captain, P.change, P.stolen, P.retake, P.after],
  };

  SL.data.missions[def.id] = def;
})();
