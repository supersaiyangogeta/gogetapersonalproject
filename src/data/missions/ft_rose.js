/*
 * CHAPTER 19 · FUTURE TRUNKS — "Rosé" (canon; played as Goku). The owner's moveset roadmap §8.18, mission 2
 * (roadmap #37 / #64 scene 2). Goku and Vegeta follow Trunks back to his future; in an abandoned city square Goku
 * meets the man wearing his face. Lines are paraphrased and written for this project.
 *
 *   ARRIVE *   (staged)  the Time Machine lands in the square; the camera circles Goku and Black; Goku goes Super
 *                        Saiyan Blue
 *   DUEL *     (played)  Blue Goku against Goku Black in the streets: Goku has the edge — drive him down to his floor
 *   ROSE       (staged)  Black touches his bangs, and turns Super Saiyan Rosé: pink hair, the rose aura
 *   ROSE FIGHT *(played) Blue Goku against Rosé, on the ground and in the air: now Black is the stronger. Land what you
 *                        can — the stretch ends at his floor, or when he has worn you down
 *   THE BLADE  (staged)  the sudden thrust: the blade drives into Goku's chest and lifts him off his feet, then throws
 *                        him through a building (no wound shown: a flash where it lands, nothing more); Vegeta pulls
 *                        him out and the Time Machine takes them back
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  const TU = {
    duel: { blackFloor: 0.55, gokuFloor: 0.25, blackTaken: 0.75, blackDealt: 0.8 },
    rose: { blackFloor: 0.6, gokuFloor: 0.3, blackTaken: 0.5, blackDealt: 0.95 },
  };
  const SPOT = { goku: [0, -5], black: [0, 7], vegeta: [-4, -9], machine: [-7, -11] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const PINK = 0xff4aa8;

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: at(b, 'goku'), startKi: 80 });
    S.goku._playerController = S.goku.controller;
    S.black = b.spawn({ charId: 'goku_black', team: 1, pos: at(b, 'black'), startKi: 80 });
    S.vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(b, 'vegeta'), startKi: 80 });
    for (const f of Object.values(S)) f.cannotDie = true;
    K.faceTo(S.goku, S.black.pos);
    K.faceTo(S.black, S.goku.pos);
    return S;
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  /** Vegeta waits by the machine, out of the fight (nobody can reach him, he reaches nobody). */
  function benchVegeta(v, hidden) {
    v.controller = K.scripted();
    v.untargetable = v.intangible = true;
    v.setHidden(hidden);
  }

  function blade(f, k) {
    if (f.model && f.model.setPropFill) f.model.setPropFill('blackBlade', k);
  }

  /** A played stretch: Goku under the player, Black under the AI, both full, until a floor. */
  function fight(m, T, ai, space) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black;
    bk.setHidden(false);
    bk.untargetable = bk.intangible = g.untargetable = g.intangible = false;
    blade(bk, 0);
    if (g.pos.distanceTo(bk.pos) < 5) K.place(bk, K.ground(b, g.pos.clone().add(new V3(0, 0, 8))), Math.PI);
    g.hp = g.hpMax;
    bk.hp = bk.hpMax;
    g.ki = Math.max(g.ki, g.kiMax * 0.6);
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    g.target = bk;
    bk.target = g;
    bk.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, bk.def.ai, ai, { transformHp: 0 }) });
    g.setState('free');
    bk.setState('free');
    const sf = m.storyFight({
      floors: [{ f: bk, at: T.blackFloor }], dealt: [{ f: bk, mul: T.blackDealt }], taken: [{ f: bk, mul: T.blackTaken }],
      ease: { foe: bk, hero: g, below: 0.5, min: 0.5 },
      fighters: [g, bk], space,
    });
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    return sf;
  }

  function* endFight(m, sf, T) {
    const b = m.battle, S = b.story;
    yield () => sf.floored(S.black) || S.goku.hpFrac < T.gokuFloor || m.state !== 'running';
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    return sf.floored(S.black);
  }

  /** The city building nearest the square (the one Goku goes through), or null on a stage without one. */
  function wallFor(b) {
    let best = null, bd = Infinity;
    for (const o of b.stage.obstacles || []) {
      if (!o.alive || !o.building) continue;
      const d = Math.hypot(o.x, o.z);
      if (d >= 12 && d < bd) (best = o), (bd = d);
    }
    return best;
  }

  const P = {};

  /*
   * THE PRESENT (Roadmap Three, the owner's Gemini research BT-BLK-02 — staged; a research draft, not checked against
   * the footage): before the trip to the future, the man with Goku's face is dragged through a tear in the sky into the
   * present. Goku goes Super Saiyan 2 to test him; they trade heavy blows, Black matching him with an unhurried grace;
   * Black stops, a hand to his chest, and grins — the fight is feeding this body; then the tear pulls him back. The
   * grassland stands in for the lawn outside Capsule Corporation (no stage of it exists: an approximation). Skip-safe:
   * ARRIVE rebuilds everything in the future.
   */
  P.present = { id: 'present', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, v = S.vegeta;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    if (b.stage.def.id !== 'plains') b.changeStage('plains');
    for (const [f, id] of [[g, 'base'], [bk, 'base'], [v, 'base']]) K.toForm(f, id);
    g.controller = K.scripted();
    bk.controller = K.scripted();
    benchVegeta(v, false);
    blade(bk, 0);
    const G0 = K.ground(b, new V3(0, 0, -4)), B0 = K.ground(b, new V3(0, 0, 6));
    K.place(g, G0, 0);
    K.place(v, K.ground(b, new V3(-5, 0, -8)), 0);
    bk.setHidden(true);
    bk.untargetable = bk.intangible = true;
    K.faceTo(g, B0);
    K.faceTo(v, B0);
    K.pose(g, 'idle', 'serious', 6);
    K.pose(v, 'v_chinUp', 'serious', 6);
    m.music('last_hope', 1);
    m.title(CHAPTER, 'ROSÉ', 'The present · outside Capsule Corporation', 3);
    // the sky tears open over the lawn
    const sky = B0.clone().add(new V3(0, 16, 0));
    m.shot((t, o) => K.camAt(o, g.chest().add(new V3(1.3, -0.2, -2.4)), sky, 54), 999, { cut: true, blendIn: 0, hold: true });
    b.sfx('portalOpen', null, { at: sky, vol: 1 });
    const tear = K.portal(m, sky, g.chest());
    let n = 0;
    yield () => {
      n++;
      tear.set(n / 36);
      if (!b.skipRequested && n % 8 === 0) b.vfx.flash(sky, 4, 0x8a3adf, 0.2, SL.Toon.tex.glow);
      return n >= 70 || b.skipRequested;
    };
    // dragged through it, and down hard on the grass
    bk.setHidden(false);
    K.pose(bk, 'tumble', 'angry', 10);
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 34));
      bk.setPosition(sky.clone().lerp(B0, k));
      bk.vel.set(0, 0, 0);
      return k >= 1;
    };
    tear.set(0.3);
    K.place(bk, B0, 0);
    K.faceTo(bk, g.pos);
    b.vfx.dust(B0.clone(), 3, 14);
    b.sfx('groundImpact', bk, { vol: 1 });
    b.cameraTraumaAt(B0, 0.4);
    K.pose(bk, 'gb_idle', 'calm', 6);
    m.flags.present = true;
    yield* st.wait(0.6);
    // Goku steps up to him, eager, and goes Super Saiyan 2
    shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    m.say('goku', 'So you\'re the guy with my face, huh? Let\'s see what you can do!', 2.6);
    yield* st.wait(2.4);
    K.toForm(g, 'ssj2');
    K.pose(g, 'powerUp', 'shout', 8);
    SL.ScreenFX.flash(0.3, '#fff2b0');
    b.vfx.ring(g.chest(), 4, 0xffe070, 0.4);
    b.sfx('transformBurst', g, { vol: 0.9 });
    b.cameraTraumaAt(g.chest(), 0.35);
    yield* st.wait(0.9);
    K.pose(g, 'idle', 'angry', 6);
    // Black: the head tilted, looking at his own hands with curiosity
    K.pose(bk, 'gb_handStudy', 'calm', 4);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.say('goku_black', 'The original... and so eager. Very well — show me, then.', 2.6, { style: 'quiet' });
    yield* st.wait(2.6);
    // the clash: heavy rights, met blow for blow, side-on
    const mid = G0.clone().lerp(B0, 0.5), dir = B0.clone().sub(G0).setY(0).normalize(), side = new V3(dir.z, 0, -dir.x);
    K.place(g, K.ground(b, mid.clone().addScaledVector(dir, -0.55)), 0);
    K.place(bk, K.ground(b, mid.clone().addScaledVector(dir, 0.55)), 0);
    K.faceTo(g, bk.pos);
    K.faceTo(bk, g.pos);
    b.vfx.afterimage(G0, g.height, 0xffe070);
    b.sfx('dash', g);
    m.music('zamasu_theme', 3);
    m.shot((t, o) => K.camAt(o, mid.clone().addScaledVector(side, 4.4).add(new V3(0, 1.2, 0)), mid.clone().add(new V3(0, 1, 0)), 46), 999, { cut: true, blendIn: 0, hold: true });
    for (let i = 0; i < 6 && !st.skip.on; i++) {
      const [a, d] = i % 2 ? [bk, g] : [g, bk];
      K.pose(a, a === g ? 'g_crossW' : 'gb_chopW', 'angry', 30);
      K.pose(d, 'guard', a === g ? 'smirk' : 'grit', 30);
      yield* st.wait(0.16);
      K.pose(a, a === g ? 'g_cross' : 'gb_chop', 'angry', 30);
      const p = a.chest().lerp(d.chest(), 0.6);
      b.vfx.impact(p, 1.6, 0xfff0c0);
      b.vfx.ring(p, 1.8, 0xffffff, 0.25, dir.clone());
      b.sfx(i % 3 === 2 ? 'punchHeavy' : 'block', d, { vol: 1 });
      b.cameraTraumaAt(p, 0.25);
      yield* st.wait(0.24);
    }
    m.flags.presentClash = true;
    // they break apart; a hand to his chest, and a grin: the fight is feeding this body
    K.place(g, K.ground(b, mid.clone().addScaledVector(dir, -2.6)), 0);
    K.place(bk, K.ground(b, mid.clone().addScaledVector(dir, 2.6)), 0);
    K.faceTo(g, bk.pos);
    K.faceTo(bk, g.pos);
    b.vfx.ring(K.ground(b, mid.clone()).add(new V3(0, 0.2, 0)), 3, 0xffffff, 0.35, new V3(0, 1, 0));
    K.pose(bk, 'hitBody', 'grin', 8);
    K.pose(g, 'guard', 'serious', 8);
    shot(m, { black: bk }, { subject: 'black', focus: 'closeup', angle: 'three' }, 999);
    m.say('goku_black', 'Ha... ha ha! It hurts — and every blow makes this body stronger. Wonderful!', 3, { style: 'quiet' });
    yield* st.wait(3);
    // and the tear pulls him back
    const up = bk.pos.clone().add(new V3(0, 16, 0));
    tear.set(1);
    K.pose(bk, 'gb_idle', 'smirk', 6);
    m.shot((t, o) => K.camAt(o, g.chest().add(new V3(1.6, -0.3, -2.6)), bk.chest(), 50), 999, { cut: true, blendIn: 0, hold: true });
    b.sfx('portalOpen', null, { at: up, vol: 0.8, pitch: 0.8 });
    const b1 = bk.pos.clone();
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 40));
      bk.grounded = false;
      bk.setPosition(b1.clone().lerp(up, k));
      bk.vel.set(0, 0, 0);
      return k >= 1;
    };
    tear.dispose();
    bk.setHidden(true);
    K.pose(g, 'idle', 'serious', 6);
    shot(m, { goku: g, vegeta: v }, { subject: 'goku', with: 'vegeta', focus: 'medium', angle: 'three' }, 999);
    m.say('goku', 'He got stronger the longer we fought... We have to go to Trunks\' future.', 3);
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
  } };

  P.arrive = { id: 'arrive', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, v = S.vegeta;
    stage(m);
    // the future (a checkpoint restart, or the trip from the present)
    if (b.stage.def.id !== 'future_ruins') b.changeStage('future_ruins');
    bk.untargetable = bk.intangible = false;
    const st = SL.data.u6Kit.staged(m);
    K.toForm(g, 'base');
    K.toForm(bk, 'base');
    K.toForm(v, 'base');
    g.controller = K.scripted();
    bk.controller = K.scripted();
    benchVegeta(v, true);
    blade(bk, 0);
    K.place(g, at(b, 'goku'), 0);
    K.place(bk, at(b, 'black'), Math.PI);
    K.place(v, at(b, 'vegeta'), 0);
    g.setHidden(true);
    // the machine comes out of nowhere into the square
    S.machine = K.timeMachine(b, at(b, 'machine'));
    m.onDispose(() => K.propGone(b, S.machine));
    m.music('last_hope', 1);
    const tm = at(b, 'machine');
    m.shot((t, out) => K.camAt(out, tm.clone().add(new V3(9, 1.2, 12)), tm.clone().add(new V3(0, 2, 0)), 54), 999, { cut: true, blendIn: 0, hold: true });
    SL.ScreenFX.flash(0.35, '#e8f4ff');
    b.sfx('timeWarp', null, { at: at(b, 'machine'), vol: 1 });
    m.title(CHAPTER, 'ROSÉ', 'Future · an abandoned square', 3.4);
    yield* st.wait(2.4);
    g.setHidden(false);
    v.setHidden(false);
    K.faceTo(g, bk.pos);
    K.faceTo(v, bk.pos);
    K.pose(g, 'idle', 'serious', 6);
    K.pose(v, 'idle', 'smirk', 6);
    K.pose(bk, 'gb_idle', 'smirk', 4);
    // the camera circles them both, the square empty around them
    const mid = () => g.chest().add(bk.chest()).multiplyScalar(0.5);
    m.shot((t, out) => {
      const c = mid(), a = 0.4 + t * 2.4;
      K.camAt(out, new V3(c.x + Math.sin(a) * 10, c.y + 1.6, c.z + Math.cos(a) * 10), c, 50);
    }, 5.2, { cut: true, blendIn: 0, hold: true });
    m.say('goku_black', 'So the real one comes at last. Son Goku — I have wanted to see that face from the outside.', 3.4);
    yield* st.wait(3.4);
    m.say('goku', 'Yeah, it\'s my face, all right. Nobody ever tell you it\'s rude to take other people\'s stuff?', 3);
    yield* st.wait(2.4);
    shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999);
    m.say('vegeta', 'Go on, Kakarot. Show me what this impostor is made of.', 2.6);
    yield* st.wait(2.6);
    benchVegeta(v, true);
    m.endShot();
    b.skipRequested = false;
    // Super Saiyan Blue, staged the way every story transformation is
    yield* SL.data.cinematics.transform(m, { fighter: g, formIndex: K.formIndex(g, 'blue'), witness: bk, witnessLine: 'Ahh... that divine glow. Splendid.', music: 3 });
    K.toForm(g, 'blue');
    m.endShot();
    b.skipRequested = false;
  } };

  P.duel = { id: 'duel', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m);
    benchVegeta(S.vegeta, true);
    K.toForm(S.goku, 'blue');
    K.toForm(S.black, 'base');
    m.title(CHAPTER, 'ROSÉ', 'Super Saiyan Blue Goku vs Goku Black', 2.4);
    m.objective('duel', 'Drive Goku Black back', { icon: 'fist' });
    m.music('ssj_blue', 4);
    const sf = fight(m, TU.duel, { aggression: 0.7, defense: 0.65 }, 'ground');
    const floored = yield* endFight(m, sf, TU.duel);
    if (m.state !== 'running') return;
    m.flags.duel = floored;
    m.qteParts.push(floored ? 1 : 0.5);
    m.complete('duel');
  } };

  P.rose = { id: 'rose', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    bk.controller = K.scripted();
    K.toForm(g, 'blue');
    K.toForm(bk, 'base');
    blade(bk, 0);
    K.place(g, K.ground(b, g.pos.clone()), 0);
    if (g.pos.distanceTo(bk.pos) < 5 || g.pos.distanceTo(bk.pos) > 14) K.place(bk, K.ground(b, g.pos.clone().add(new V3(0, 0, 8))), Math.PI);
    K.faceTo(g, bk.pos);
    K.faceTo(bk, g.pos);
    K.pose(g, 'idle', 'serious', 6);
    K.pose(bk, 'gb_idle', 'smirk', 4);
    // his face, close: a hand drawn through his bangs, a quiet laugh
    shot(m, { black: bk }, { subject: 'black', focus: 'closeup', angle: 'three' }, 999);
    m.say('goku_black', m.flags.duel ? 'Hah... ha ha. Truly a fine body. Then let me show you what a god does with it.' : 'Enough. Let me show you what a god does with that body.', 3.2, { style: 'quiet' });
    yield* st.wait(3.2);
    m.endShot();
    b.skipRequested = false;
    // the change (Roadmap Three, the owner's Gemini research BT-BLK-03 / BLK-S03 — a research draft, not checked against
    // the footage): close on his face, the eyes shut, a ring of dark violet rising off his feet and spinning up round him;
    // a fast circle round him as the hair goes pink, white rings over his head; then (below) the eyes open on a smile
    const VIOLET = 0x7a2ab0;
    yield* SL.data.cinematics.transform(m, {
      fighter: bk, formIndex: K.formIndex(bk, 'rose'), witness: g, music: 5,
      witnessLine: 'Pink...?! His ki just shot way past where it was!',
      changeShots: [
        // from a little below: the change starts in a crouch, the head down
        { at: 0, free: true, shot: (t, out) => {
          const h = bk.headPos();
          K.camAt(out, h.clone().addScaledVector(bk.forward, 1.45).add(new V3(0.15, -0.45, 0)), h.clone().add(new V3(0, -0.05, 0)), 40);
        } },
        { at: 0.2, shot: (t, out, el) => {
          const c = bk.chest(), a = bk.yaw + 0.5 + el * 5.5;
          K.camAt(out, new V3(c.x + Math.sin(a) * 3.8, c.y + 0.3, c.z + Math.cos(a) * 3.8), c.clone().add(new V3(0, 0.35, 0)), 48);
        } },
      ],
      onFrame: (n) => {
        // the transform state shows sd.expression (Fighter's face rule)
        bk.sd.expression = bk.form.id === 'rose' ? 'smirk' : 'closed';
        if (n % 5 === 0) {
          const k = (n % 35) / 35;
          b.vfx.ring(bk.pos.clone().add(new V3(0, 0.2 + k * 2.6, 0)), 1.3 + k * 1.2, bk.form.id === 'rose' ? PINK : VIOLET, 0.45, new V3(0, 1, 0));
        }
        if (n > 30 && n % 12 === 0) b.vfx.ring(bk.headPos().add(new V3(0, 0.5, 0)), 0.7, 0xffffff, 0.4, new V3(0, 1, 0));
      },
    });
    K.toForm(bk, 'rose');
    m.flags.rose = bk.form.id === 'rose';
    // the eyes open, grey, over a quiet smile; and he gives the colour its name
    if (!b.skipRequested) {
      K.pose(bk, 'gb_idle', 'smirk', 4);
      m.shot((t, out) => {
        const h = bk.headPos();
        K.camAt(out, h.clone().addScaledVector(bk.forward, 1.1).add(new V3(-0.08, 0.04, 0)), h.clone().add(new V3(0, 0.06, 0)), 36);
      }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku_black', 'How beautiful... a colour like this deserves a name. Super Saiyan Rosé.', 3.2, { style: 'quiet' });
      yield* st.wait(3.2);
    }
    m.endShot();
    b.skipRequested = false;
  } };

  P.rosefight = { id: 'rosefight', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m);
    benchVegeta(S.vegeta, true);
    K.toForm(S.goku, 'blue');
    K.toForm(S.black, 'rose');
    m.title(CHAPTER, 'ROSÉ', 'Super Saiyan Blue Goku vs Super Saiyan Rosé', 2.4);
    m.objective('rose', 'Stand up to Rosé — land what you can, in the streets or in the sky', { icon: 'fist' });
    m.music('zamasu_theme', 5);
    // the ground and the air both (the arena table: the streets, then high above the broken towers)
    const sf = fight(m, TU.rose, { aggression: 0.8, defense: 0.7 }, null);
    const floored = yield* endFight(m, sf, TU.rose);
    if (m.state !== 'running') return;
    m.flags.rosefight = floored;
    m.qteParts.push(floored ? 1 : 0.5);
    m.complete('rose');
  } };

  P.blade = { id: 'blade', run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, bk = S.black, v = S.vegeta;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    g.controller = K.scripted();
    bk.controller = K.scripted();
    K.toForm(g, 'blue');
    K.toForm(bk, 'rose');
    // down in the street, the building behind Goku
    const wall = wallFor(b);
    const dir = wall ? new V3(-wall.x, 0, -wall.z).normalize() : new V3(0, 0, 1);
    const gAt = wall ? K.ground(b, new V3(wall.x, 0, wall.z).addScaledVector(dir, Math.min(wall.r + 14, Math.hypot(wall.x, wall.z)))) : at(b, 'goku');
    K.place(g, gAt, 0);
    K.place(bk, K.ground(b, gAt.clone().addScaledVector(dir, 9)), 0);
    K.faceTo(g, bk.pos);
    K.faceTo(bk, g.pos);
    K.pose(g, 'idle', 'grit', 6);
    K.pose(bk, 'gb_bladeW', 'smirk', 6);
    blade(bk, 1);
    b.vfx.flash(bk.handPos('R'), 1.2, PINK, 0.2, SL.Toon.tex.glow);
    b.sfx('swordDraw', bk, { vol: 0.9 });
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'low' }, 999);
    m.say('goku_black', 'Rosé suits me, don\'t you think? Now — hold still.', 2.6, { style: 'quiet' });
    yield* st.wait(2.6);
    const side = new V3(dir.z, 0, -dir.x);
    // the first cut (Roadmap Three, the owner's Gemini research BT-BLK-04 / BLK-S04 — a research draft, not checked
    // against the footage): gone without a warning, behind Goku, the blade coming down; Goku turns into it with his guard
    // up and his aura takes it; the cut goes on past him and a building across the street comes apart
    if (!b.skipRequested) {
      const across = (b.stage.obstacles || []).filter((o) => o.alive && o.building && o !== wall)
        .sort((p, q) => Math.hypot(p.x - gAt.x, p.z - gAt.z) - Math.hypot(q.x - gAt.x, q.z - gAt.z))[0];
      b.vfx.afterimage(bk.pos, bk.height, PINK);
      b.sfx('vanish', bk);
      K.place(bk, K.ground(b, gAt.clone().addScaledVector(dir, -1.5)), 0);
      K.faceTo(bk, g.pos);
      K.pose(bk, 'gb_sweepW', 'smirk', 30);
      // BLK-S04: close beside the two of them, the lens whipping round after the blade from his raised hand to Goku's guard
      const raised = bk.handPos('R');
      m.shot((t, out, el) => {
        const k = U.easeOutCubic(Math.min(1, Math.max(0, el - 0.12) / 0.3));
        K.camAt(out, bk.chest().lerp(g.chest(), 0.4).addScaledVector(side, -2.5).add(new V3(0, 0.45, 0)), raised.clone().add(new V3(0, 0.5, 0)).lerp(g.chest(), k), 56);
      }, 999, { cut: true, blendIn: 0, hold: true });
      m.flags.bladeWhip = true;
      yield* st.wait(0.35);
      // the arc it cuts through the air, from over his head down across Goku
      const over = raised.clone().add(new V3(0, 0.6, 0)), mid = g.headPos().addScaledVector(side, -0.6).add(new V3(0, 0.4, 0));
      const low = g.chest().addScaledVector(side, 0.8).addScaledVector(dir, -0.4).add(new V3(0, -0.6, 0));
      b.vfx.slash(over, mid, PINK, 0.35, 0.12);
      b.vfx.slash(mid, low, PINK, 0.35, 0.12);
      b.vfx.slash(over, low, 0xffe0f4, 0.2, 0.04);
      K.faceTo(g, bk.pos);
      K.pose(g, 'guard', 'grit', 30);
      K.pose(bk, 'gb_sweep', 'angry', 30);
      // and wide again, side-on, as the shock runs on through the street
      m.shot((t, out) => {
        const c = g.chest().add(bk.chest()).multiplyScalar(0.5);
        K.camAt(out, c.clone().addScaledVector(side, -4.2).add(new V3(0, 0.6, 0)), c, 46);
      }, 999, { cut: true, blendIn: 0, hold: true });
      b.vfx.flash(g.chest(), 1.4, 0x8ad8ff, 0.16, SL.Toon.tex.glow);
      b.vfx.ring(g.chest(), 3, PINK, 0.35, dir.clone());
      b.sfx('swordClang', g, { vol: 1 });
      b.cameraTraumaAt(g.chest(), 0.45);
      if (across) {
        m.flags.cutBuilding = true;
        b.stage.destroyPillar(across);
        b.vfx.dust(K.ground(b, new V3(across.x, 0, across.z)), 4, 14);
      }
      m.flags.firstCut = true;
      yield* st.wait(1.1);
      // back where he stood, the blade still out
      b.vfx.afterimage(bk.pos, bk.height, PINK);
      K.place(bk, K.ground(b, gAt.clone().addScaledVector(dir, 9)), 0);
      K.faceTo(bk, g.pos);
      K.faceTo(g, bk.pos);
      K.pose(bk, 'gb_bladeW', 'smirk', 6);
      K.pose(g, 'idle', 'grit', 6);
    }
    // the thrust: one blur across the street, side-on and low
    const lens = (t, out) => {
      const c = g.chest().add(bk.chest()).multiplyScalar(0.5);
      K.camAt(out, c.clone().addScaledVector(side, 4.6).add(new V3(0, -0.5, 0)), c, 44);
    };
    m.shot(lens, 999, { cut: true, blendIn: 0, hold: true });
    K.pose(bk, 'gb_thrust', 'angry', 30);
    const from = bk.pos.clone(), to = gAt.clone().addScaledVector(dir, 1.05);
    let n = 0;
    yield () => {
      n++;
      bk.setPosition(from.clone().lerp(to, Math.min(1, n / 7)));
      bk.vel.set(0, 0, 0);
      return n >= 7;
    };
    if (!b.skipRequested) {
      b.vfx.flash(g.chest(), 1.6, PINK, 0.18, SL.Toon.tex.glow);
      b.vfx.impact(g.chest(), 3, 0xff8ad8);
      b.sfx('swordSlash', g, { vol: 1.1 });
      b.cameraTraumaAt(g.chest(), 0.5);
    }
    K.pose(g, 'hitBody', 'hurt', 30);
    m.flags.stabbed = true;
    // lifted off his feet on it
    const lift0 = g.pos.clone(), b0 = bk.pos.clone();
    n = 0;
    yield () => {
      n++;
      const k = U.easeInOutCubic(Math.min(1, n / 40));
      g.grounded = false;
      g.setPosition(lift0.clone().add(new V3(0, k * 0.35, 0)));
      bk.setPosition(b0);
      g.vel.set(0, 0, 0);
      bk.vel.set(0, 0, 0);
      return n >= 46 || b.skipRequested;
    };
    if (!b.skipRequested) {
      shot(m, { black: bk }, { subject: 'black', focus: 'closeup', angle: 'low' }, 999);
      m.say('goku_black', 'You see? A mortal\'s body, on a god\'s blade.', 2.2, { style: 'quiet' });
      yield* st.wait(2.2);
    }
    // and thrown, through the building behind him
    K.pose(bk, 'gb_sweep', 'angry', 24);
    blade(bk, 0);
    const p0 = g.pos.clone();
    const hitAt = wall ? new V3(wall.x, Math.min(wall.h * 0.35, 5), wall.z).addScaledVector(dir, wall.r * 0.6) : p0.clone().addScaledVector(dir, -18);
    K.pose(g, 'tumble', 'hurt', 20);
    m.shot((t, out) => K.camAt(out, g.chest().addScaledVector(side, 7).add(new V3(0, 1.2, 0)), g.chest(), 52), 999, { cut: true, blendIn: 0, hold: true });
    n = 0;
    const len = 30;
    yield () => {
      n++;
      const k = Math.min(1, n / len);
      const p = p0.clone().lerp(hitAt, k);
      p.y += Math.sin(k * Math.PI) * 1.5;
      g.grounded = false;
      g.setPosition(p);
      g.vel.set(0, 0, 0);
      return n >= len || b.skipRequested;
    };
    if (wall && wall.alive) b.stage.destroyPillar(wall);
    m.flags.building = !!wall && !wall.alive;
    if (!wall) {
      b.vfx.explosion(hitAt, 2, 0xd8a370, { smoke: true });
      b.vfx.dust(hitAt, 3, 14);
    }
    const down = wall ? K.ground(b, new V3(wall.x, 0, wall.z).addScaledVector(dir, wall.r + 2.6)) : K.ground(b, hitAt.clone());
    K.place(g, down, 0);
    K.faceTo(g, bk.pos);
    K.pose(g, 'knockdown', 'hurt', 10);
    if (!b.skipRequested) {
      m.shot((t, out) => K.camAt(out, down.clone().addScaledVector(dir, 16).add(new V3(0, 4, 0)), down.clone().add(new V3(0, 3, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(2);
    }
    // the dust settles; Vegeta drops in beside him
    K.toForm(g, 'base');
    K.pose(g, 'defeatKneel', 'hurt', 6);
    v.setHidden(false);
    K.toForm(v, 'blue');
    K.place(v, K.ground(b, down.clone().addScaledVector(dir, 0.6).addScaledVector(side, -1.8)), 0);
    K.faceTo(v, bk.pos);
    K.pose(v, 'idle', 'angry', 6);
    // from the street side (the rubble is behind him)
    m.shot((t, out) => K.camAt(out, g.chest().addScaledVector(dir, 3.2).addScaledVector(side, 1.1).add(new V3(0, 0.2, 0)), g.chest(), 42), 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Ngh... didn\'t even see that one coming...', 2.4, { style: 'quiet' });
    yield* st.wait(2.4);
    m.shot((t, out) => K.camAt(out, v.chest().addScaledVector(dir, 3).addScaledVector(side, -0.8).add(new V3(0, -0.4, 0)), v.chest(), 42), 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'On your feet, Kakarot. We\'re pulling back — for now.', 2.6, { style: 'shout' });
    yield* st.wait(2.6);
    K.place(bk, K.ground(b, down.clone().addScaledVector(dir, 10)), 0);
    K.faceTo(bk, g.pos);
    K.pose(bk, 'gb_idle', 'smirk', 4);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.say('goku_black', 'Run back to your past. Every time we meet, I will be stronger.', 3, { style: 'quiet' });
    yield* st.wait(3);
    // gone: the flash, the machine, nothing
    SL.ScreenFX.flash(0.5, '#e8f4ff');
    b.sfx('timeWarp', g, { vol: 1.1 });
    g.setHidden(true);
    v.setHidden(true);
    K.propGone(b, S.machine);
    shot(m, { black: bk }, { subject: 'black', focus: 'wide', angle: 'low', room: 8 }, 999);
    yield* st.wait(2);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'ROSÉ', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.ftRose = { TU };
  SL.data.missions.ft_rose = {
    id: 'ft_rose', canon: true, chapter: CHAPTER, title: 'Rosé', character: 'goku', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · the real Goku meets the false one', parTime: 360, qteLabel: 'Standing up to Black',
    blurb: 'Goku follows Trunks into the ruined future and meets the man wearing his face. Super Saiyan Blue has the edge — until Black shows him a colour of his own.',
    lockForms: {
      goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Goku Black reveals Super Saiyan Rosé'],
    setup,
    phases: [P.present, P.arrive, P.duel, P.rose, P.rosefight, P.blade],
  };
})();
