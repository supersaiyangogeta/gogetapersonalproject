/*
 * CHAPTER 10 — BUU SAGA: MAJIN
 * Mission "The Prince's Pride" (canon; played as Majin Vegeta). Vegeta against Majin Buu, and
 * the Final Explosion.
 *
 *   ARRIVE   (scene)      the wizard and his creation land; Vegeta answers nobody; one chop
 *   BLOW     (checkpoint) Majin Vegeta against Buu: blow him apart — and watch him put himself
 *                         back together (the camera stays on it: the first time is a scene)
 *   AGAIN    (checkpoint) he is annoyed now: candy, the arm, the ball; Piccolo arrives with the
 *                         boys halfway through. Hold him
 *   FAREWELL (scene)      his son; the first time he ever held him; Piccolo's question
 *   FINAL    (played)     HOLD Charge: everything he has, while Buu walks back across the crater
 *                         laughing (if he gets there first he knocks it out of you — hold again).
 *                         Bulma, Trunks, Kakarot go through his head as it rises. Then the light
 *   AFTER    (scene)      silence, a crater, a statue that crumbles — and the pieces that move
 *
 * Vegeta cannot be beaten before the end (he chose the end); Buu cannot be finished.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const CENTER = new V3(0, 0, 0);
  const AGAIN_SECONDS = 26;
  const FINAL_SECONDS = 6;

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    // the plateau as the last fight left it
    b.stage.devastate(CENTER, { radius: 70, craters: 10, slabs: 18, vents: 7, scorch: 0.45, mood: false });
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: at(0, 2), startKi: 120 });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: at(4, 6), startKi: 60 });
    const buu = b.spawn({ charId: 'majin_buu', team: 1, pos: at(0, -16), startKi: 160, tags: { boss: true, priority: true } });
    const babidi = b.spawn({ charId: 'babidi', team: 1, pos: at(7, -22) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(-20, 12) });
    const goten = b.spawn({ charId: 'goten', team: 0, pos: at(-21, 13.5) });
    const trunks = b.spawn({ charId: 'kid_trunks', team: 0, pos: at(-19, 13.5) });
    vegeta.lockedForms = {};
    K.toForm(vegeta, 'majin');
    K.toForm(goku, 'ssj2');
    vegeta.setDamage(3);
    goku.setDamage(3);
    K.watcher(goku, 'exhausted', 'hurt');
    K.watcher(babidi, 'bb_idle', 'grin');
    for (const f of [piccolo, goten, trunks]) {
      K.watcher(f, 'idle', 'grit');
      f.setHidden(true);
    }
    buu.controller = K.scripted();
    buu.mech.maxReforms = Infinity;
    b.story = { vegeta, goku, buu, babidi, piccolo, goten, trunks };
  }

  function fight(m, g, e) {
    const b = m.battle;
    if (b.player !== g) b.switchPlayer(g, { force: true });
    g.target = e;
    e.target = g;
    e.controller = new SL.AIController(b, { difficulty: 'normal' });
    g.setState('free');
    e.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  function vegetaReady(v) {
    K.toForm(v, 'majin');
    v.setDamage(Math.max(3, v.damageLevel || 0));
    v.cannotDie = true;
    v.auraOff = false;
    if (v.model.setStone) v.model.setStone(false);
    v.setHidden(false);
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      K.faceTo(S.vegeta, S.buu.pos);
      K.faceTo(S.goku, S.buu.pos);
      K.faceTo(S.buu, S.vegeta.pos);
      K.faceTo(S.babidi, S.vegeta.pos);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'sacrifice_arrive');
    },
  };

  /** Blow him apart. He comes back — and the camera makes sure you see it. */
  P.blow = {
    id: 'blow',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      vegetaReady(v);
      S.goku.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      K.place(v, K.ground(b, new V3(0, 0, 0)));
      K.place(buu, K.ground(b, new V3(0, 0, -12)));
      K.faceTo(v, buu.pos);
      K.faceTo(buu, v.pos);
      v.hp = v.hpMax;
      v.ki = 120;
      v.damageDealtMul = 1.1;
      buu.hp = buu.hpMax;
      buu.mech.breakIdx = 0;
      buu.mech.reforms = 0;
      buu.damageDealtMul = 0.5;
      m.music('finale', 6);
      m.objective('blow', 'Blow him apart', { icon: 'fist', target: 50 });
      fight(m, v, buu);
      let apart = false;
      const off = b.on('buuApart', (e) => {
        if (e.fighter === buu) apart = true;
      });
      const hook = () => m.progress('blow', Math.min(50, Math.round((1 - buu.hpFrac) * 100)));
      m.tickHooks.push(hook);
      yield () => apart;
      K.unhook(m, hook);
      off();
      m.complete('blow');
      // the first time is shown, not played through: the pieces, and the man watching them
      m.lock(true);
      K.clearCombat(b);
      v.setState('scripted', { pose: 'v_majinStance', expression: 'grin' });
      m.say('vegeta', 'Hah! Is that all a Majin is?', 2, { style: 'shout' });
      yield* SL.Cinema.play(m, 'sacrifice_reform');
      yield () => !buu.mech.apart;
      m.flags.firstReform = true;
    },
  };

  /** He is annoyed now. Hold him — and the boys arrive. */
  P.again = {
    id: 'again',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      vegetaReady(v);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      buu.setHidden(false);
      buu.intangible = false;
      buu.untargetable = false;
      if (buu.state === 'scripted') buu.setState('free');
      buu.mech.breakIdx = 1; // past his first line: from here, only the end of him breaks him
      buu.hp = Math.max(buu.hp, buu.hpMax * 0.85);
      buu.damageDealtMul = 0.55;
      v.hp = Math.max(v.hp, v.hpMax * 0.7);
      v.damagePlan = null;
      m.objective('again', 'He is angry now. Hold him', { icon: 'clock', target: AGAIN_SECONDS });
      fight(m, v, buu);
      let t = 0, arrived = false;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('again', Math.min(AGAIN_SECONDS, Math.floor(t)));
        if (!arrived && t >= AGAIN_SECONDS * 0.45) {
          arrived = true;
          for (const f of [S.piccolo, S.goten, S.trunks]) {
            f.setHidden(false);
            b.vfx.flash(f.chest(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
          }
          K.faceTo(S.piccolo, v.pos);
          K.faceTo(S.goten, v.pos);
          K.faceTo(S.trunks, v.pos);
          m.say('kid_trunks', 'Dad!', 1.6, { style: 'shout' });
          b.emit('boysArrive', {});
        }
      };
      m.tickHooks.push(hook);
      yield () => t >= AGAIN_SECONDS || v.hpFrac < 0.3;
      K.unhook(m, hook);
      m.complete('again');
      m.flags.againSeconds = Math.round(t);
      m.qteParts.push(U.clamp01(v.hpFrac + 0.3));
      m.lock(true);
      K.clearCombat(b);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      for (const f of [S.piccolo, S.goten, S.trunks]) f.setHidden(false);
      buu.controller = K.scripted();
      buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      K.faceTo(v, S.trunks.pos);
      yield* SL.Cinema.play(m, 'sacrifice_farewell');
    },
  };

  /**
   * FINAL. Everything he has. Hold Charge and it rises; let go and it sinks. Buu walks back
   * across the crater laughing, and if he gets there first he slaps it out of you. The people he
   * is doing this for go through his head as it climbs. Then the light.
   */
  P.final = {
    id: 'final',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      vegetaReady(v);
      // Piccolo took the boys; Goku lies where Vegeta left him, well away from this
      for (const f of [S.piccolo, S.goten, S.trunks, S.goku]) f.setHidden(true);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      K.place(v, K.ground(b, new V3(0, 0, 2)));
      const bFrom = K.ground(b, new V3(0, 0, -26));
      K.place(buu, bFrom);
      K.faceTo(v, buu.pos);
      K.faceTo(buu, v.pos);
      buu.controller = K.scripted();
      buu.setHidden(false);
      buu.setState('scripted', { pose: 'bu_laugh', expression: 'grin' });
      if (b.player !== v) b.switchPlayer(v, { force: true });
      // everything else he could do, gone: only Charge
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      delete lim.charge;
      m.limits(lim);
      let power = 0, t = 0, slaps = 0, beat = 0, visionT = 0;
      m.objective('final', 'Everything you have', { icon: 'ultimate' });
      m.prompt('finalHold', 'charge', 'Hold', { required: true, until: () => power >= 1, always: true });
      m.music('farewell', 2);
      b.stage.setMood(0.3, 0x2a1830, 2);
      // one long shot: low, behind his shoulder, Buu coming across the crater at him
      m.shot((t, out) => {
        const c = v.chest();
        const toB = buu.pos.clone().sub(v.pos).setY(0).normalize();
        const side = new V3(-toB.z, 0, toB.x);
        K.camAt(out, c.clone().addScaledVector(toB, -U.lerp(5, 3.4, t)).addScaledVector(side, 2.4).add(new V3(0, 0.5, 0)), c.clone().addScaledVector(toB, 7), U.lerp(50, 42, t));
      }, 60, { cut: true, blendIn: 0 });
      m.lock(false);
      b.aiLocked = true;
      v.setState('free');
      // the owner's brief: "Trunks... Bulma... I do this for you. And yes... even for you, Kakarot."
      const BEATS = [
        { at: 0.28, who: 'vegeta', line: 'Trunks... Bulma...' },
        { at: 0.55, who: 'vegeta', line: 'I do this for you.' },
        { at: 0.8, who: 'vegeta', line: 'And yes... even for you, Kakarot.' },
      ];
      // the M on his forehead (and the veins under it) burning blood-red as the power gathers
      const red = new THREE.MeshBasicMaterial({ color: 0x120404 });
      const marks = [];
      for (const o of (v.model.headExtraGroup && v.model.headExtraGroup.children) || []) {
        if (o.isMesh && o.geometry && o.geometry.type === 'BoxGeometry') {
          marks.push([o, o.material]);
          o.material = red;
        }
      }
      const unmark = () => {
        for (const [o, mat] of marks) o.material = mat;
        marks.length = 0;
        red.dispose();
      };
      m.onDispose(unmark);
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        const holding = !!(v.intent && v.intent.charge);
        power = U.clamp01(power + (holding ? 1 / (FINAL_SECONDS * 60) : -0.25 / 60));
        // the light gathering in him, and the ground giving way under it
        if (b.frame % 3 === 0) b.vfx.streamInward(v.chest(), 3 + power * 5, 0xfff0c0, 2 + Math.round(power * 3), 0.18, 0.4);
        if (power > 0.35 && b.frame % 7 === 0) {
          const p = v.pos.clone().add(new V3(U.rand(-5, 5), 0.1, U.rand(-5, 5)));
          b.vfx.rock(p, new V3(0, U.rand(3, 8) * power, 0), U.rand(0.15, 0.4), b.stage.rockColor);
        }
        if (power > 0.6 && b.frame % 6 === 0) b.vfx.bolt(v.chest().add(new V3(U.rand(-0.8, 0.8), U.rand(-0.9, 0.9), U.rand(-0.8, 0.8))), U.rand(0.8, 1.6));
        b.camera.addTrauma(0.01 + power * 0.03);
        red.color.setRGB(0.07 + power * (0.55 + Math.sin(t * 9) * 0.2), 0.02, 0.03);
        if (visionT > 0) {
          visionT -= 1 / 60;
          SL.ScreenFX.vision(Math.max(0, visionT) * 0.45);
        }
        while (beat < BEATS.length && power >= BEATS[beat].at) {
          m.say(BEATS[beat].who, BEATS[beat].line, 3.2, { style: 'quiet' });
          b.sfx('visionIn', v, { vol: 0.5 });
          visionT = 1.4;
          beat++;
        }
        // Buu walks back at him, laughing; if he gets there, he slaps the power out of him
        const d = buu.pos.distanceTo(v.pos);
        // he laughs for a moment after each slap; the walk back is always long enough to hold through
        if (power >= 0.85) {
          // he stops: for once he can feel what is in front of him
          if (!buu._hesitated) {
            buu._hesitated = true;
            buu.setState('scripted', { pose: 'bu_idle', expression: 'shock' });
            m.say('majin_buu', '...?', 1.4, { style: 'quiet' });
          }
        } else if (buu._laughUntil && b.frame < buu._laughUntil) {
          // (nothing: he is laughing)
        } else if (d > 2.2) {
          const step = v.pos.clone().sub(buu.pos).setY(0).normalize().multiplyScalar(2.6 / 60);
          const p = buu.pos.clone().add(step);
          p.y = b.stage.heightAt(p.x, p.z);
          buu.setPosition(p);
          K.faceTo(buu, v.pos);
          if (b.frame % 90 === 0) m.say('majin_buu', ['Hee hee!', 'What is that?', 'Buu wants to see!'][((b.frame / 90) | 0) % 3], 1.6);
        } else if (b.frame - (buu._slapAt || -999) > 70) {
          buu._slapAt = b.frame;
          slaps++;
          buu.setState('scripted', { pose: 'bu_slap', expression: 'grin' });
          b.vfx.impact(v.chest(), 3, 0xffffff);
          b.sfx('punchHeavy', v, { pitch: 0.8 });
          power = Math.max(0, power - 0.22);
          const back = v.pos.clone().sub(buu.pos).setY(0).normalize();
          const p = buu.pos.clone().addScaledVector(back, -9);
          p.y = b.stage.heightAt(p.x, p.z);
          buu.setPosition(p);
          buu._laughUntil = b.frame + 60;
          b.emit('finalSlap', { power });
        } else if (buu.state === 'scripted' && b.frame - (buu._slapAt || -999) > 20) buu.setState('scripted', { pose: 'bu_laugh', expression: 'grin' });
        b.emit('struggle', { active: true, progress: 1 - power, rate: 0, label: 'EVERYTHING', action: 'charge' });
      };
      m.tickHooks.push(hook);
      b.skipRequested = false;
      yield () => power >= 1;
      K.unhook(m, hook);
      b.emit('struggle', { active: false });
      SL.ScreenFX.vision(0);
      m.limits(null);
      m.complete('final');
      m.flags.finalSlaps = slaps;
      m.flags.finalSeconds = Math.round(t);
      m.qteParts.push(U.clamp01(1 - slaps * 0.2));
      m.lock(true);
      m.endShot();
      // THE LIGHT: a close face, then the whole plateau from far away as it goes white
      v.setState('scripted', { pose: 'v_finalExplosion', expression: 'shout' });
      buu.setState('scripted', { pose: 'bu_idle', expression: 'shock' });
      // his head is thrown back: the lens comes in from above and in front, onto the eyes and the burning M
      m.shot((t2, out) => {
        const h = v.headPos();
        K.camAt(out, h.clone().addScaledVector(v.forward, U.lerp(0.75, 0.6, t2)).add(new V3(0.1, U.lerp(1.2, 1.0, t2), 0)), h.clone().add(new V3(0, 0.16, 0)), 34);
      }, 1.6, { cut: true, blendIn: 0 });
      red.color.setRGB(0.85, 0.04, 0.06);
      m.say('vegeta', 'HAAAAAAAAAAAH!', 1.6, { style: 'shout' });
      b.sfx('kiCharge', v, { pitch: 0.5, vol: 1.2 });
      yield* m.cine(1.6);
      const origin = v.chest();
      // a golden wash, not a white frame: the dome is what blinds
      SL.ScreenFX.flash(0.6, '#fff0c0');
      b.sfx('explosionHuge', v, { vol: 1.5, pitch: 0.45 });
      b.sfx('rumble', null, { vol: 1.3, dur: 5 });
      SL.Music.stop(0.4);
      if (SL.Audio.setDream) SL.Audio.setDream(0.85);
      m.onDispose(() => SL.Audio.setDream && SL.Audio.setDream(0));
      b.slowmo(0.3, 2.4);
      let grow = 0;
      const blast = () => {
        grow++;
        if (grow % 4 === 0 && grow < 200) {
          const r = Math.min(62, 4 + grow * 0.45);
          b.vfx.ball(origin, r, 0xffe08a, 0.5);
          if (grow % 12 === 0) b.vfx.ring(origin.clone().setY(origin.y - 0.8), r * 1.3, 0xfff0c0, 0.6, new V3(0, 1, 0));
        }
        b.camera.addTrauma(grow < 120 ? 0.25 : 0.05);
      };
      m.tickHooks.push(blast);
      m.shot((t2, out) => K.camAt(out, origin.clone().add(new V3(U.lerp(120, 150, t2), U.lerp(50, 60, t2), U.lerp(140, 170, t2))), origin.clone().add(new V3(0, 8, 0)), 48), 5, { cut: true, blendIn: 0 });
      yield* m.cine(1.2);
      // it takes him apart too
      if (!buu.mech.apart) SL.Mechanics.majinBody._breakApart(buu, buu.def.majin || {});
      if (buu.mech.apart) {
        buu.mech.apart.total = Math.round(15.6 * 60);
        buu.mech.apart.scatterFrac = 0.8;
      }
      b.stage.crater(v.pos, 26, 5, null);
      b.stage.explode(origin, 60, 5e5, true, null);
      yield* m.cine(3.8);
      K.unhook(m, blast);
      if (SL.Audio.setDream) SL.Audio.setDream(0);
      SL.ScreenFX.flash(0.35, '#fff0c0');
      unmark();
      b.vfx.dust(v.pos.clone().add(new V3(0, 1, 0)), 20, 40, b.stage.def.terrain.sand);
      m.endShot();
      b.sfx('tinnitus', null, { vol: 0.9 });
      m.flags.finalExplosion = true;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      b.stage.clearMood(2);
      yield* SL.Cinema.play(m, 'sacrifice_after');
      if (buu.mech.apart) yield () => !buu.mech.apart;
      m.fade('black', 1.6);
      yield* m.cine(1.8);
      m.title(m.def.chapter, "THE PRINCE'S PRIDE", m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'buu_sacrifice',
    canon: true,
    chapter: 'CHAPTER 10 · BUU SAGA',
    title: "The Prince's Pride",
    subtitle: 'Earth · Age 774 · everything he has',
    character: 'vegeta',
    stage: 'majin_wastes',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Vegeta sends Goku to sleep, says goodbye to a son he never once held, and gives Majin Buu everything he has.',
    rewards: ['Chapter 10 cleared'],
    setup,
    phases: [P.arrive, P.blow, P.again, P.final, P.after],
  };

  SL.data.missions[def.id] = def;
})();
