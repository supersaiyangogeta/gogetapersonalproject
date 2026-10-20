/*
 * CHAPTER 8 — BUU SAGA: THE TOURNAMENT (Age 774)
 * Mission "The Supreme Kai" (canon, played as Gohan).
 *
 * Gohan's match is not a match. Kibito does not want to fight him; he wants to see his full
 * power, in front of the whole stadium. The player gives it to him — Gohan drops into a wide
 * stance and HOLDS CHARGE through Super Saiyan to Super Saiyan 2 (SL.data.cinematics.ascend:
 * the ring cracks, the crowd gets up, lightning finds him) — and that is exactly what Babidi's
 * men were waiting for. Kibito's hand comes up and Gohan cannot move (telekinesis); Spopovich
 * pins him from behind; Yamu drives the siphon's needle into his chest, and the canister fills
 * with his light while the player resists (the struggle meter). Resisting makes it cost them and
 * slows it; the mission says plainly it cannot stop it. The body shows the drain: Super Saiyan 2
 * → Super Saiyan → base, the aura shrinking to nothing. Then the small purple man in the stands
 * stands up.
 *
 * Phases: OPEN (the match is called; scene `kibito_asks`) → POWER (checkpoint: the ascension
 * to Super Saiyan 2) → AMBUSH (the freeze, the pin, the siphon, resisted) → REVEAL (scene
 * `kai_reveal`: the Supreme Kai, Babidi's name, Kibito's healing) → AFTER.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const T = () => SL.Tournament;

  const DRAIN_SECONDS = 9;
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function place(f, pos, yaw) {
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
  }
  const yard = (b, x, z) => new V3(x, b.stage.heightAt(x, z), z);
  const ring = (b, x, z) => new V3(x, b.stage.arena.y, z);
  const formIndex = (f, id) => f.def.forms.findIndex((x) => x.id === id);

  const SPOTS = { piccolo: [-15, 9], krillin: [-15, 3], goku: [-17, 7.5], vegeta: [-17, 4.5], kai: [15, 6], spopovich: [16, -6], yamu: [16, -9] };
  // Yamu's siphon: a grip, a glass canister that fills with what it takes, and a long needle
  const SIPHON = { id: 'siphon', shape: 'drainer', joint: 'handR', pos: [0, -0.05, 0.02], rot: [Math.PI, 0, 0], length: 0.3, scale: 1.8, fillColor: 0xffe27a };

  function setup(battle) {
    const b = battle;
    const S = {};
    S.gohan = b.spawn({ charId: 'adult_gohan', player: true, team: 0, pos: ring(b, 0, 5), startKi: 40 });
    S.gohan.cannotDie = true;
    S.gohan.lockedForms = {};
    S.kibito = b.spawn({ charId: 'kibito', team: 1, pos: ring(b, 0, -5), startKi: 50 });
    for (const [k, id, team] of [['piccolo', 'piccolo', 0], ['krillin', 'krillin', 0], ['goku', 'goku', 0], ['vegeta', 'vegeta', 0], ['kai', 'supreme_kai', 0], ['spopovich', 'spopovich', 1], ['yamu', 'yamu', 1]]) {
      S[k] = b.spawn({ charId: id, team, pos: yard(b, SPOTS[k][0], SPOTS[k][1]), startKi: 50 });
    }
    for (const k of Object.keys(S)) {
      if (k === 'gohan') continue;
      S[k].controller = scripted();
      S[k].untargetable = true;
      S[k].cannotDie = true;
    }
    b.story = S;
  }

  /** Everybody where they watch from; Babidi's two stand apart and wait. */
  function stands(b) {
    const S = b.story;
    for (const k of Object.keys(SPOTS)) {
      const f = S[k];
      f.setHidden(false);
      f.untargetable = true;
      f.controller = scripted();
      place(f, yard(b, SPOTS[k][0], SPOTS[k][1]), Math.atan2(-SPOTS[k][0], -SPOTS[k][1]));
      f.setState('scripted', { pose: k === 'kai' ? 'sk_idle' : k === 'piccolo' || k === 'vegeta' ? 'armsCrossed' : k === 'spopovich' ? 'sp_idle' : 'idle', expression: 'calm' });
    }
    place(S.kibito, ring(b, 0, -5), 0);
    S.kibito.setState('scripted', { pose: 'kb_idle', expression: 'calm' });
  }

  const P = {};

  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of b.fighters) f.controller = scripted();
      stands(b);
      place(S.gohan, ring(b, 0, 5), Math.PI);
      yield* T().announce(m, 'intro', { a: S.gohan, b: S.kibito });
      yield* SL.Cinema.play(m, 'kibito_asks');
    },
  };

  /**
   * He asked for all of it. A wide stance, the fists at the waist, and the player holds Charge:
   * gold, then the sharper gold and the lightning of the form he found at the Cell Games.
   */
  P.power = {
    id: 'power',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan;
      const C = SL.data.cinematics;
      m.lock(true);
      m.clearObjectives();
      stands(b);
      b.switchPlayer(g, { force: true });
      if (g.formIndex !== 0) g.applyForm(0);
      g.hp = g.hpMax;
      g.ki = g.kiMax;
      place(g, ring(b, 0, 5), Math.PI);
      m.objective('full', 'Show him everything', { icon: 'transform', target: 1 });
      const sk = () => (b.stage.cheer && b.stage.cheer(0.6));
      // THE POWER SHOT: low, in front of him, pushing in and tilting up as it rises (the rising is
      // read off his ki bar, so the camera answers the player's hold)
      m.shot((t, out, el) => {
        const c = g.chest();
        const k = SL.util.clamp01(el / 5);
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(c).addScaledVector(g.forward, U.lerp(5.2, 3.1, k)).addScaledVector(side, U.lerp(1.6, 0.9, k)).add(new V3(0, U.lerp(-0.7, -1.05, k), 0));
        out.look.copy(c).add(new V3(0, U.lerp(0.2, 0.55, k), 0));
        out.fov = U.lerp(46, 52, k);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* C.ascend(m, {
        fighter: g, form: 'ssj2', witness: S.kibito, seconds: 4.2, label: 'Power up (hold)', meter: 'POWER', dust: false,
        beats: [
          { at: 0.12, run: () => (b.stage.gasp ? b.stage.gasp(0.4) : sk()) },
          // gold first: the hair lifts and goes, the ring starts to crack under him
          { at: 0.35, run: (mm, f) => {
            const i = formIndex(f, 'ssj');
            if (f.formIndex < i) {
              f.applyForm(i);
              b.vfx.flash(f.chest(), 4, 0xffe060, 0.35, SL.Toon.tex.glow);
              b.sfx('transformBurst', f, { vol: 0.8 });
            }
            sk();
            mm.say('announcer', 'His hair — it\'s gold! Just like the Cell Games!', 2.6, { style: 'shout' });
          } },
          { at: 0.62, run: (mm, f) => {
            // fixed offsets: presentation never draws from the gameplay random stream
            for (const [x, y, z, l] of [[0.6, 0.5, -0.3, 1.2], [-0.7, 0.1, 0.4, 1.5], [0.2, 0.9, 0.6, 1]]) b.vfx.bolt(f.chest().add(new V3(x, y, z)), l, 0xbfe4ff);
            b.sfx('lightning', f);
            b.stage.gasp && b.stage.gasp(1);
            b.cameraTraumaAt(f.chest(), 0.4);
          } },
          { at: 0.85, run: (mm, f) => {
            mm.say('kibito', '...So this is it.', 2, { style: 'quiet' });
          } },
        ],
      });
      m.complete('full');
      m.flags.gohanForm = g.form.id;
      b.stage.cheer && b.stage.cheer(1);
      // the stadium on its feet, and Kibito not moving at all
      g.setState('scripted', { pose: 'ag_ssj2', expression: 'angry', aura: 1 });
      m.shot((t, out) => {
        const c = g.chest();
        out.pos.set(c.x + 2.4, c.y - 0.9, c.z - 3.2 + t * 0.4);
        out.look.copy(c).add(new V3(0, 0.5, 0));
        out.fov = 48;
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('announcer', 'Incredible! The whole stadium is shaking!', 2.2, { style: 'shout' });
      yield* m.cine(2.2);
    },
  };

  /**
   * The ambush. Kibito's hand comes up and Gohan cannot move. Spopovich pins him from behind and
   * Yamu's siphon goes into his chest. The struggle is real — mashing keeps the bar up, which
   * slows the drain and makes it cost them — but it cannot be broken, and the objective says so.
   */
  P.ambush = {
    id: 'ambush',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan, sp = S.spopovich, y = S.yamu, kb = S.kibito;
      const K = SL.data.buuKit;
      m.lock(true);
      m.clearObjectives();
      if (g.formIndex === 0) K.toForm(g, 'ssj2'); // entered from the Developer Menu
      place(g, ring(b, 0, 5), Math.PI);
      place(kb, ring(b, 0, -5), 0);
      // 1. the hand: he freezes him where he stands
      kb.setState('scripted', { pose: 'kb_freeze', expression: 'grit', speed: 10 });
      g.setState('scripted', { pose: 'ag_frozen', expression: 'grit', speed: 20, aura: 0.45 });
      b.sfx('magic', kb, { pitch: 0.55, vol: 1.1 });
      const palm = kb.handPos('R');
      b.vfx.flash(palm, 2, 0xe8d0ff, 0.3, SL.Toon.tex.glow);
      for (let i = 0; i < 3; i++) b.vfx.ring(g.chest(), 1.6 + i * 0.7, 0xe8d0ff, 0.5 + i * 0.1);
      const hold = () => {
        // the psychic grip: a faint shimmer round him while it lasts
        if (b.frame % 10 === 0) b.vfx.ring(g.chest(), 1.4, 0xd8c0ff, 0.35);
      };
      m.tickHooks.push(hold);
      m.shot((t, out) => {
        const c = g.chest();
        out.pos.copy(c).addScaledVector(g.forward, 1.8).add(new V3(0.5, 0.15, 0));
        out.look.copy(c).add(new V3(0, 0.25, 0));
        out.fov = 36;
      }, 2.4, { cut: true, blendIn: 0 });
      m.say('adult_gohan', 'What—? I can\'t... move...!', 2.4);
      yield* m.cine(2.4);
      m.shot((t, out) => {
        const c = kb.chest();
        out.pos.copy(c).addScaledVector(kb.forward, 2.2).add(new V3(-0.6, 0.2, 0));
        out.look.copy(c).add(new V3(0, 0.2, 0));
        out.fov = 36;
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('kibito', 'Forgive me. It has to be taken from you.', 2.2, { style: 'quiet' });
      yield* m.cine(2.2);
      // 2. the two of them come over the ring's edge
      m.shot((t, out) => {
        out.pos.set(8, b.stage.arena.y + 3.2, 13);
        out.look.copy(g.chest());
        out.fov = 50;
      }, 1.2, { cut: true, blendIn: 0 });
      const behind = g.pos.clone().addScaledVector(g.forward, -0.55), front = g.pos.clone().addScaledVector(g.forward, 1.2);
      const legs = [[sp, sp.pos.clone(), ring(b, behind.x, behind.z)], [y, y.pos.clone(), ring(b, front.x, front.z)]];
      for (const [f] of legs) {
        f.grounded = false;
        f.intangible = true; // a hold from behind and a needle in front: close contact, no push-apart
        f.setState('scripted', { pose: 'flyForward', expression: 'grin', speed: 12 });
      }
      g.intangible = true;
      let k = 0;
      const leap = () => {
        k = Math.min(1, k + 1 / 50);
        for (const [f, a, c] of legs) {
          const p = a.clone().lerp(c, U.easeInOutCubic(k));
          p.y += Math.sin(k * Math.PI) * 3;
          f.setPosition(p);
          f.yaw = f.prevYaw = Math.atan2(g.pos.x - f.pos.x, g.pos.z - f.pos.z);
        }
      };
      m.tickHooks.push(leap);
      yield () => k >= 1;
      K.unhook(m, leap);
      for (const [f] of legs) f.grounded = true;
      // Spopovich locks his arms from behind; Yamu has the siphon out
      sp.setState('scripted', { pose: 'sp_nelson', expression: 'grin', speed: 16 });
      g.setState('scripted', { pose: 'ag_drained', expression: 'shout', speed: 16, aura: 1 });
      y.model.addProp(SIPHON);
      y.setState('scripted', { pose: 'ym_ready', expression: 'grin', speed: 10 });
      b.sfx('punchHeavy', sp, { pitch: 0.7 });
      m.shot((t, out) => {
        const c = g.chest();
        out.pos.copy(c).add(new V3(2.8 - t * 0.5, 0.5, -0.8));
        out.look.copy(c);
        out.fov = 40;
      }, 1.6, { cut: true, blendIn: 0 });
      m.say('yamu', 'Hold him still. This will not take long.', 2.2);
      yield* m.cine(1.6);
      // 3. the needle
      y.setState('scripted', { pose: 'ym_plunge', expression: 'grin', speed: 22 });
      b.sfx('guardBreak', g, { pitch: 0.45, vol: 1 });
      b.vfx.flash(g.chest(), 1.4, 0xffffff, 0.2, SL.Toon.tex.glow);
      b.cameraTraumaAt(g.chest(), 0.35);
      g.anim.play('ag_drained', 20, { restart: true });
      m.shot((t, out) => {
        const h = y.handPos('R'), c = g.chest();
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(h).addScaledVector(side, 0.9).add(new V3(0, 0.25, 0)).addScaledVector(g.forward, 0.35);
        out.look.copy(h).lerp(c, 0.5);
        out.fov = 36;
      }, 1.3, { cut: true, blendIn: 0 });
      yield* m.cine(1.3);
      // then the three of them, heads and all: the glass between them filling
      const drainCam = () => m.shot((t, out, el) => {
        const c = g.chest();
        const side = new V3(g.forward.z, 0, -g.forward.x);
        out.pos.copy(c).addScaledVector(side, 3 + el * 0.03).addScaledVector(g.forward, 1.3).add(new V3(0, 0.55, 0));
        out.look.copy(c).lerp(y.handPos('R'), 0.3).add(new V3(0, 0.3, 0));
        out.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      drainCam();
      m.objective('resist', 'Resist — make it cost them (it cannot be stopped)', { icon: 'guard', target: 1 });
      const kiStart = Math.max(1, g.ki);
      let taken = 0, dropped = 0, drone = 0;
      const ssj = formIndex(g, 'ssj');
      const res = yield* m.struggle({
        start: 0.7, drain: 0.32, duration: DRAIN_SECONDS, label: 'RESIST', keepInput: false,
        onTick: (t, grip) => {
          // the more he fights it, the slower it goes — but it goes
          const rate = U.lerp(0.26, 0.09, grip);
          g.ki = Math.max(0, g.ki - (kiStart * rate) / 60 * 1.2);
          g.hp = Math.max(g.hpMax * 0.2, g.hp - (g.hpMax * 0.012 * (1 - grip)) / 60 * 10);
          taken = U.clamp01(t / DRAIN_SECONDS);
          y.model.setPropFill && y.model.setPropFill('siphon', taken);
          // his light, visibly leaving him for the glass
          const tip = y.handPos('R');
          if (b.frame % 3 === 0) SL.data.buuKit.siphonTick(b, g.chest(), tip, 0xffe27a);
          if (b.frame % 4 === 0) b.vfx.streamInward(tip, 1.1, 0xffe27a, 2, 0.1, 0.3);
          // the body gives it up in steps: the second gold, then the first
          if (dropped === 0 && taken >= 0.45 && ssj > 0) {
            dropped = 1;
            g.applyForm(ssj);
            b.vfx.flash(g.chest(), 2.4, 0xffe060, 0.25, SL.Toon.tex.glow);
            b.sfx('kiUp', g, { pitch: 0.5, vol: 0.8 });
            b.emit('drainStep', { fighter: g, form: 'ssj' });
          } else if (dropped === 1 && taken >= 0.85) {
            dropped = 2;
            g.applyForm(0);
            b.vfx.flash(g.chest(), 1.8, 0xffffff, 0.2, SL.Toon.tex.glow);
            b.sfx('kiUp', g, { pitch: 0.35, vol: 0.7 });
            b.emit('drainStep', { fighter: g, form: 'base' });
            g.setState('scripted', { pose: 'ag_drained', expression: 'hurt', speed: 10 });
          }
          // the aura shrinks with it
          g.sd.aura = U.lerp(1, 0, taken);
          if (b.frame % 40 === 0) {
            drone++;
            b.sfx('drain', g, { pitch: 1 + taken * 0.8, vol: 0.8 });
          }
          if (b.frame % 20 === 0) b.cameraTraumaAt(g.chest(), 0.14);
        },
      });
      K.unhook(m, hold);
      m.complete('resist');
      m.flags.resistAvg = Math.round(res.avg * 100) / 100;
      m.flags.siphonFill = Math.round(taken * 100) / 100;
      m.qteParts.push(U.clamp01(res.avg));
      // it is done: he drops, and they are gone with the glass full
      g.ki = 0;
      if (g.formIndex !== 0) g.applyForm(0);
      y.model.setPropFill && y.model.setPropFill('siphon', 1);
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
      kb.setState('scripted', { pose: 'kb_idle', expression: 'calm' });
      for (const f of [g, sp, y]) f.intangible = false;
      m.endShot();
      for (const f of [sp, y]) {
        f.grounded = false;
        f.setState('scripted', { pose: 'flyUp', expression: 'grin' });
      }
      let lift = 0;
      const away = () => {
        lift++;
        for (const f of [sp, y]) f.setPosition(f.pos.clone().add(new V3(0.4, 0.35, -0.6)));
        if (lift > 90) {
          for (const f of [sp, y]) f.setHidden(true);
          return false;
        }
        return true;
      };
      const hook = () => {
        if (!away()) K.unhook(m, hook);
      };
      m.tickHooks.push(hook);
      m.shot((t, out) => {
        const c = y.chest();
        out.pos.set(2, b.stage.arena.y + 2, 10);
        out.look.copy(c);
        out.fov = 50;
      }, 2.2, { cut: true, blendIn: 0 });
      m.say('yamu', 'Full. Back to the master.', 2, { style: 'shout' });
      yield* m.cine(2.2);
      m.flags.drained = true;
    },
  };

  P.reveal = {
    id: 'reveal',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.gohan;
      m.lock(true);
      for (const f of b.fighters) f.controller = scripted();
      g.formIndex !== 0 && g.applyForm(0);
      place(g, ring(b, 0, 2), Math.PI);
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
      place(S.kai, ring(b, -2.6, -2), Math.PI * 0.2);
      place(S.kibito, ring(b, 1.4, 3.4), Math.PI * 0.9);
      for (const [k, x, z] of [['goku', -6, 1], ['vegeta', -6.5, -1.5], ['piccolo', -4, 4], ['krillin', -3.5, 5.4]]) {
        place(S[k], ring(b, x, z), Math.atan2(-x, -z));
        S[k].setHidden(false);
      }
      for (const k of ['spopovich', 'yamu']) S[k].setHidden(true);
      yield* SL.Cinema.play(m, 'kai_reveal');
      g.hp = g.hpMax;
      g.ki = g.kiMax * 0.6;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.endShot();
      m.flags.kaiDone = true;
      m.title('CHAPTER 8 · BUU SAGA', 'THE SUPREME KAI', 'Follow them — without letting them feel you', 3.4);
      yield* m.cine(3.6);
    },
  };

  const def = {
    id: 'buu_kibito',
    canon: true,
    chapter: 'CHAPTER 8 · BUU SAGA',
    title: 'The Supreme Kai',
    subtitle: 'The 25th World Tournament · Son Gohan versus Kibito',
    character: 'adult_gohan',
    stage: 'tournament',
    parTime: 180,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'His opponent does not want a fight. He wants to see something — and so does somebody else.',
    rewards: [],
    setup,
    phases: [P.open, P.power, P.ambush, P.reveal, P.after],
  };

  SL.data.missions[def.id] = def;
})();
