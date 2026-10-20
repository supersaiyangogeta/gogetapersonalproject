/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 5: "Beyond the Limits" (the glacier, then the lava)
 *
 *   BLUE *     (staged + hold Charge)  GOKU'S BLUE, the owner's five shots: low at knee level, his hands and knees
 *                                      dug into the snow, trembling — he rises slowly, eyes closed, breathing; close on
 *                                      his face as the growl becomes a scream and the hair lifts, flashing emerald for
 *                                      an instant; closer still, the brow and the eyes — a split-second of silver and
 *                                      a high hum; the lens circling him as a column of cyan light tinged magenta stands
 *                                      up under his boots and melts the snow round him (blue light on Broly's face);
 *                                      low, looking up: the aura settles into a deep cobalt, the hair cyan, the stance.
 *   DUEL *     (play)                  Super Saiyan Blue Goku against the Wrathful Broly: fast counters (a guard at the
 *                                      swing, then the answer); ice pillars breaking round them, the field changing.
 *                                      Then the combination: the gut, the gut, the spinning roundhouse (Light, Light,
 *                                      Heavy) — Broly flying.
 *   PARAGUS    (staged)                Frieza on the ice by his ship, remembering Namek: grief makes Super Saiyans.
 *                                      Over his shoulder, Paragus watching the fight — one finger, a needle of light,
 *                                      no sound. Paragus slumps back over a rock, still. When Broly lands nearby, Frieza
 *                                      throws up his hands: "Broly, look — your father!"
 *   LEGEND     (staged transformation) Broly's eyes: the pupils shake, crack and go blank white. The geyser — gold and
 *                                      green — and the glacier MELTS: the snow and ice go to black rock and rivers of
 *                                      lava, the sea burns, the sky turns red. SUPER SAIYAN BROLY.
 *   AFTER                              the title; next: "Desperate Alliance".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project (Frieza's lie follows the
 * owner's beat text).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;

  const LG = { duelSeconds: 46, duelMin: 16, gokuFloor: 0.45, brolyFloor: 0.3, brolyDealt: 0.28, collapseEvery: 11, blueHold: 3.4, meltSeconds: 5 };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));
  const SPOT = { goku: [6, -8], broly: [-6, 6], vegeta: [16, -22], paragus: [-22, 30], frieza: [-40, 50], cheelai: [-46, 54], lemo: [-49, 52], whis: [26, -30] };

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at('goku'), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at('vegeta'), startKi: 0 });
    const whis = b.spawn({ charId: 'whis', team: 0, pos: at('whis'), startKi: 0 });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: at('broly'), startKi: 100 });
    const paragus = b.spawn({ charId: 'paragus', team: 1, pos: at('paragus'), startKi: 0 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 1, pos: at('cheelai'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 1, pos: at('lemo'), startKi: 0 });
    K.toForm(frieza, 'final');
    K.watcher(vegeta, 'v_kneelShoulder', 'hurt');
    K.watcher(whis, 'idle', 'calm');
    K.watcher(paragus, 'pg_remote', 'nervous');
    K.watcher(frieza, 'fz_watch', 'smirk');
    K.watcher(cheelai, 'ch_watch', 'nervous');
    K.watcher(lemo, 'le_watch', 'calm');
    K.watcher(broly, 'br_wrathIdle', 'angry');
    broly.cannotDie = true;
    goku.cannotDie = true;
    BK.give(broly, 'wrath');
    K.toForm(broly, 'wrath');
    for (const f of [whis, vegeta, paragus, frieza, cheelai, lemo]) K.faceTo(f, broly.pos);
    b.story = { goku, vegeta, whis, broly, paragus, frieza, cheelai, lemo };
  }

  function stage(m) {
    const b = m.battle, S = b.story;
    if (!m.flags.react) {
      m.flags.react = true;
      BK.react(m);
      // the field changes under them: every crater takes the ice pillars near it
      const off = b.on('crater', (e) => {
        if ((b.stage._melt || 0) > 0.5) return;
        for (const o of b.stage.obstacles) if (o.alive && !o.fixture && o.segs && Math.hypot(o.x - e.pos.x, o.z - e.pos.z) < o.r + e.radius + 3) b.stage.destroyPillar(o);
      });
      m.onDispose(off);
    }
    K.faceTo(S.vegeta, S.broly.pos);
  }

  const P = {};

  /* ======================================================================== THE BLUE */
  P.blue = {
    id: 'blue',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      if (g.formIndex !== 0) g.applyForm(0);
      g.controller = K.scripted();
      br.controller = K.scripted();
      K.place(g, BK.at(b, SPOT.goku[0], SPOT.goku[1]), 0);
      K.place(br, BK.at(b, SPOT.broly[0], SPOT.broly[1]), 0);
      K.faceTo(g, br.pos);
      K.faceTo(br, g.pos);
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      g.setState('scripted', { pose: 'g_kneesSnow', expression: 'exhausted' });
      g.hp = Math.max(g.hp, g.hpMax * 0.3);
      m.title(BK.CHAPTER, 'BEYOND THE LIMITS', 'The glacier', 2.8);
      SL.Music.stop(0.6);
      const fw = () => g.forward.clone().setY(0).normalize();
      // breath in the cold
      const breath = () => {
        if (b.disposed || !m.flags.breathing) return false;
        if (b.frame % 48 === 0) {
          const hd = g.headPos().addScaledVector(g.forward, 0.18);
          b.vfx.smoke.emit(hd.x, hd.y, hd.z, g.forward.x * 0.4, 0.2, g.forward.z * 0.4, 0.95, 0.97, 1, 0.35, 0.18, 1, { grow: 1.6, drag: 1 });
        }
        return true;
      };
      m.flags.breathing = true;
      b.onTick(breath);
      // 1. low, at knee level: the hands and the knees in the snow, trembling
      m.shot((t, out) => {
        out.pos.copy(g.pos).addScaledVector(fw(), 1.5).add(new V3(0.7, 0.18, 0));
        out.look.copy(g.pos).addScaledVector(fw(), 0.3).add(new V3(0, 0.35, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      b.sfx('heartbeat', g, { vol: 0.8 });
      yield* m.cine(2.2);
      // ...and he rises, slowly, eyes closed
      g.setState('scripted', { pose: 'g_riseSlow', expression: 'closed', speed: 3 });
      m.shot((t, out, el) => {
        const k = Math.min(1, (el || 0) / 2.2);
        out.pos.copy(g.pos).addScaledVector(fw(), 1.9).add(new V3(0.6, 0.25 + k * 0.6, 0));
        out.look.copy(g.chest()).add(new V3(0, 0.1 + k * 0.3, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      yield* m.cine(2.2);
      g.setState('free');
      m.flags.breathing = false;
      // 2–5: the hold
      g.ki = g.kiMax;
      b.switchPlayer(g, { force: true, quiet: true });
      m.objective('blue', 'Beyond the limit: hold Charge', { icon: 'transform' });
      g.auraViewCap = 0.3;
      const look = g.def.forms.find((x) => x.id === 'ssj').look;
      const base = g.appearance.hair;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 90, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x3ab8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      b.scene.add(pillar);
      const dropPillar = () => {
        if (pillar.parent) b.scene.remove(pillar);
      };
      m.onDispose(() => {
        dropPillar();
        pillar.geometry.dispose();
        pillar.material.dispose();
        br.rimLight = null;
      });
      yield* C.ascend(m, {
        fighter: g, form: 'blue', witness: br, seconds: LG.blueHold,
        label: 'Hold Charge — Super Saiyan Blue', meter: 'BEYOND THE LIMIT', music: 2, dust: false,
        transform: {
          changeShots: [
            // the face: the growl swelling into a scream, the hair lifting
            { at: 0, free: true, shot: (t, out) => {
              const hd = g.headPos();
              out.pos.copy(hd).addScaledVector(fw(), 1.05).add(new V3(0.1, -0.08, 0));
              out.look.copy(hd).add(new V3(0, 0.06, 0));
              out.fov = 36;
            } },
            // closer: the brow and the eyes
            { at: 0.36, free: true, shot: (t, out) => {
              const hd = g.headPos();
              out.pos.copy(hd).addScaledVector(fw(), 0.62).add(new V3(0, 0.04, 0));
              out.look.copy(hd).add(new V3(0, 0.05, 0));
              out.fov = 30;
            } },
            // the circle: the column of light, the snow going round him
            { at: 0.58, shot: (t, out) => {
              const c = g.chest(), a = g.yaw + Math.PI * 0.5 + t * Math.PI * 1.6;
              out.pos.set(c.x + Math.sin(a) * 6.5, c.y + 0.6, c.z + Math.cos(a) * 6.5);
              out.look.copy(c).add(new V3(0, 0.6, 0));
              out.fov = 52;
            } },
            // low, looking up: the reveal
            { at: 1.04, shot: (t, out) => {
              const c = g.chest();
              out.pos.copy(g.pos).addScaledVector(fw(), 2.6).add(new V3(0.5, 0.2, 0));
              out.look.copy(c).add(new V3(0, 0.5, 0));
              out.fov = 50;
            } },
          ],
          onFrame: (fr, burstAt) => {
            g.auraViewCap = fr < burstAt ? 0.4 : null;
            if (g.state === 'transform' && g.sd && fr < burstAt) g.sd.hairFlicker = false;
            // the emerald flash: Broly's pressure in the air round him (a few frames)
            if (fr === 40 && g.model.setHair) g.model.setHair(look.hair.style, 0x5aff8a);
            if (fr === 46 && g.model.setHair) g.model.setHair(base.style, base.color);
            // the silver: hair and eyes, a split second, and a high hum
            const sv = Math.round(burstAt * 0.47);
            if (fr === sv && g.model.setHair) {
              g.model.setHair(look.hair.style, 0xd8dce8);
              if (g.model.face && g.model.face.pupilMat) g.model.face.pupilMat.color.set(0xc8ccd8);
              b.sfx('kiUp', g, { pitch: 2.4, vol: 0.7 });
            }
            if (fr === sv + 5 && g.model.setHair) {
              g.model.setHair(base.style, base.color);
              if (g.model.face && g.model.face.pupilMat) g.model.face.pupilMat.color.set(0x141414);
            }
            // the column of cyan, tinged magenta, under his boots; the snow melting round him; Broly lit blue
            const k = U.clamp01((fr - burstAt * 0.55) / (burstAt * 0.3));
            if (fr > burstAt * 0.55) {
              pillar.position.copy(g.pos).add(new V3(0, 45, 0));
              pillar.material.opacity = (fr < burstAt ? k : Math.max(0, 1 - (fr - burstAt) / 40)) * 0.42;
              pillar.material.color.setHex(fr % 12 < 6 ? 0x3ab8ff : 0x8a7aff);
              br.rimLight = { color: 0x4ab8ff, strength: 0.6 * k };
              if (fr % 10 === 0) b.vfx.ring(g.pos.clone().add(new V3(0, 0.3, 0)), 2 + k * 5, fr % 20 ? 0x6ad0ff : 0xff6ad8, 0.4, new V3(0, 1, 0));
              if (fr % 16 === 0 && b.stage.iceCrack) b.stage.iceCrack(g.pos.clone(), 2 + k * 3);
            }
            if (fr === burstAt) {
              b.stage.crater(g.pos.clone(), 5, 0.4, null);
              BK.iceBurst(b, g.pos.clone(), 2.4);
              b.vfx.ring(g.pos.clone().add(new V3(0, 0.2, 0)), 12, 0x2a8aff, 0.7, new V3(0, 1, 0));
            }
          },
        },
      });
      g.auraViewCap = null;
      dropPillar();
      br.rimLight = null;
      m.complete('blue');
      // the stance, the eyes on Broly
      g.controller = K.scripted();
      g.setState('scripted', { pose: 'g_turtleStance', expression: 'determined' });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Sorry for the wait. Let\'s go all out!', 2.4);
      yield* m.cine(2.4);
      m.endShot();
    },
  };

  /** The combination at the end of the duel: the gut, the gut, the spinning roundhouse. */
  function* combo(m) {
    const b = m.battle, S = b.story, g = S.goku, br = S.broly;
    g.controller = K.scripted();
    br.controller = K.scripted();
    K.place(br, BK.at(b, g.pos.x + g.forward.x * 1.9, g.pos.z + g.forward.z * 1.9), 0);
    K.faceTo(br, g.pos);
    K.faceTo(g, br.pos);
    br.setState('scripted', { pose: 'br_hayW', expression: 'shout', aura: 1 });
    const side = () => {
      const d = br.chest().sub(g.chest()).setY(0).normalize();
      return new V3(d.z, 0, -d.x);
    };
    m.shot((t, out) => {
      const mid = g.chest().lerp(br.chest(), 0.5);
      out.pos.copy(mid).addScaledVector(side(), 5.2).add(new V3(0, 0.2, 0));
      out.look.copy(mid);
      out.fov = 44;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    const beats = [['light', 'Gut!', 'g_palmW', 'g_palm'], ['light', 'Again!', 'g_palmW', 'g_palmBoth'], ['heavy', 'Spinning roundhouse!', 'g_spinKickW', 'g_spinKick']];
    for (const [key, label, wind, strike] of beats) {
      g.setState('scripted', { pose: wind, expression: 'shout', speed: 20 });
      const r = yield* m.cue(key, label, { auto: 1.4, slow: 0.35 });
      m.qteParts.push(r.pressed ? 1 : 0.5);
      g.setState('scripted', { pose: strike, expression: 'shout', speed: 30 });
      br.setState('scripted', { pose: key === 'heavy' ? 'hitSideR' : 'hitBody', expression: 'hurt', speed: 30 });
      b.vfx.impact(br.chest(), key === 'heavy' ? 4 : 2.4, 0x8ad8ff);
      b.sfx('punchHeavy', br, { pitch: key === 'heavy' ? 0.55 : 0.8, vol: 1.2 });
      b.cameraTraumaAt(br.chest(), key === 'heavy' ? 0.8 : 0.4);
      yield* m.cine(0.35);
    }
    // he flies
    const away = br.pos.clone().sub(g.pos).setY(0).normalize();
    const s0 = br.pos.clone(), s1 = s0.clone().addScaledVector(away, 30);
    br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
    let n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 26);
      K.place(br, BK.at(b, U.lerp(s0.x, s1.x, k), U.lerp(s0.z, s1.z, k), Math.sin(k * Math.PI) * 3), br.yaw);
      if (n % 3 === 0) BK.iceBurst(b, br.pos.clone(), 0.5);
      return k >= 1 || b.skipRequested;
    };
    K.place(br, BK.at(b, s1.x, s1.z), br.yaw);
    b.stage.crater(BK.at(b, s1.x, s1.z), 5, 1.4, null);
    BK.iceBurst(b, s1.clone(), 2.4);
    br.setState('scripted', { pose: 'br_down', expression: 'hurt' });
    g.setState('scripted', { pose: 'g_turtleStance', expression: 'determined' });
    yield* m.cine(1);
    m.endShot();
    b.skipRequested = false;
  }

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(g, 'blue');
      K.toForm(g, 'blue');
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      BK.eyes(br, 1);
      if (g.pos.distanceTo(br.pos) > 24) K.place(br, BK.at(b, g.pos.x - 9, g.pos.z + 6), 0);
      g.hp = Math.max(g.hp, g.hpMax * 0.8);
      g.ki = Math.max(g.ki, g.kiMax * 0.8);
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      br.legendaryOverride = { stageCap: 2, learnAt: 3 };
      b.switchPlayer(g, { force: true, quiet: true });
      br.controller = cpu(b);
      br.untargetable = br.intangible = false;
      br.target = g;
      g.target = br;
      g.setState('free');
      br.setState('free');
      const h = m.storyFight({
        floors: [{ f: g, at: LG.gokuFloor }, { f: br, at: LG.brolyFloor }],
        dealt: [{ f: br, mul: LG.brolyDealt }],
        taken: [{ f: br, mul: 1.15 }],
        ease: { foe: br, hero: g, below: 0.7, min: 0.45 },
      });
      m.music('ssj_blue', 3);
      m.title(BK.CHAPTER, 'SUPER SAIYAN BLUE', 'Goku · high-speed counters', 2.2);
      m.objective('duel', 'Take the fight to him', { icon: 'fist' });
      m.objective('counter', 'Counter him: guard as he swings, then strike back — three times', { icon: 'guard', optional: true, target: 3 });
      let counters = 0;
      const offC = b.on('counterStrike', (e) => {
        if (e.fighter === g || e.attacker === g) m.progress('counter', ++counters);
      });
      m.onDispose(offC);
      m.prompt('bbCounter', 'guard', 'Guard just as his blow lands — then strike: a counter', { when: () => br.state === 'attack' && g.distTo(br) < 4 });
      // the field breaking up round them: an ice pillar comes down every few seconds
      let t = 0;
      const clock = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        if (Math.floor(t * 60) % Math.round(LG.collapseEvery * 60) === 0 && t > 2) {
          const near = b.stage.obstacles.filter((o) => o.alive && !o.fixture && o.segs && Math.hypot(o.x - g.pos.x, o.z - g.pos.z) < 60).sort((a, c) => Math.hypot(a.x - g.pos.x, a.z - g.pos.z) - Math.hypot(c.x - g.pos.x, c.z - g.pos.z))[0];
          if (near) {
            b.stage.destroyPillar(near);
            BK.iceBurst(b, new V3(near.x, b.stage.heightAt(near.x, near.z), near.z), 2.4);
          }
        }
      };
      m.tickHooks.push(clock);
      m.lock(false);
      b.aiLocked = false;
      yield () => (h.floored(br) && t > LG.duelMin) || (h.floored(g) && t > LG.duelMin) || t > LG.duelSeconds || m.state !== 'running';
      K.unhook(m, clock);
      offC();
      if (m.state !== 'running') return;
      m.complete('duel');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      yield* combo(m);
    },
  };

  P.paragus = {
    id: 'paragus',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly, fz = S.frieza, pg = S.paragus;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      for (const f of [g, br]) f.controller = K.scripted();
      BK.give(g, 'blue');
      K.toForm(g, 'blue');
      // Frieza by his ship; Paragus on the ice below, watching the fight; a rock behind him
      K.place(fz, BK.at(b, SPOT.frieza[0], SPOT.frieza[1]), 0);
      K.place(pg, BK.at(b, SPOT.paragus[0], SPOT.paragus[1]), 0);
      K.faceTo(pg, g.pos);
      K.faceTo(fz, pg.pos);
      fz.setState('scripted', { pose: 'fz_watch', expression: 'smirk' });
      pg.setState('scripted', { pose: 'pg_remote', expression: 'nervous' });
      if (!S.rock) {
        const back = pg.pos.clone().addScaledVector(pg.forward, -1.1);
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), SL.Toon.mat(0x8aa8c4));
        rock.scale.set(1.2, 0.7, 1);
        rock.position.copy(back).add(new V3(0, 0.3, 0));
        SL.Toon.addOutline(rock, 1.2);
        b.scene.add(rock);
        S.rock = rock;
        m.onDispose(() => {
          if (rock.parent) b.scene.remove(rock);
          rock.geometry.dispose();
        });
      }
      yield* SL.Cinema.play(m, 'bb_lg_scheme');
      // the needle: over Frieza's shoulder, one finger
      fz.setState('scripted', { pose: 'fz_aim', expression: 'cold' });
      const d = pg.chest().sub(fz.chest()).normalize();
      m.shot((t, out) => {
        out.pos.copy(fz.headPos()).addScaledVector(d, -1.4).add(new V3(0.5, 0.2, 0));
        out.look.copy(pg.chest());
        out.fov = 34;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(1.2);
      const finger = fz.handPos ? fz.handPos('R') : fz.chest();
      BK.needle(b, finger, pg.chest().addScaledVector(d, 2.6));
      yield* m.cine(0.6);
      // a static wide shot: he gasps, and goes back over the rock, still
      pg.setState('scripted', { pose: 'pg_afraid', expression: 'shock', speed: 20 });
      m.shot((t, out) => {
        const sd = new V3(pg.forward.z, 0, -pg.forward.x);
        out.pos.copy(pg.pos).addScaledVector(sd, 7).addScaledVector(pg.forward, 2).add(new V3(0, 1.1, 0));
        out.look.copy(pg.chest()).add(new V3(0, -0.3, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      SL.Music.stop(0.3);
      yield* m.cine(0.8);
      pg.setState('scripted', { pose: 'pg_slump', expression: 'ko', speed: 6 });
      yield* m.cine(2);
      // Broly comes down near them; Frieza's act
      K.place(br, BK.at(b, pg.pos.x + 7, pg.pos.z - 6), 0);
      K.faceTo(br, fz.pos);
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      b.vfx.dust(br.pos.clone(), 1.6, 12, 0xa6bccf);
      K.faceTo(fz, br.pos);
      yield* SL.Cinema.play(m, 'bb_lg_lie');
    },
  };

  P.legend = {
    id: 'legend',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, br = S.broly, pg = S.paragus;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      for (const f of [g, br]) f.controller = K.scripted();
      BK.give(g, 'blue');
      K.toForm(g, 'blue');
      pg.setState('scripted', { pose: 'pg_slump', expression: 'ko' });
      K.faceTo(br, pg.pos);
      BK.give(br, 'wrath');
      K.toForm(br, 'wrath');
      // the eyes: shaking, cracking, gone white
      m.shot((t, out) => {
        const F = BK.facePoint(br);
        out.pos.copy(F.face).addScaledVector(F.fwd, 0.55).addScaledVector(F.up, 0.05);
        out.look.copy(F.center).addScaledVector(F.fwd, F.R * 0.6);
        out.fov = 30;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.sfx('heartbeat', br, { vol: 1.2 });
      let ek = 0;
      const shake = () => {
        if (b.disposed || ek >= 1) return false;
        ek = Math.min(1, ek + 1 / 80);
        BK.blankEyes(br, ek < 0.7 ? Math.abs(Math.sin(ek * 60)) * 0.25 : (ek - 0.7) / 0.3);
        return true;
      };
      b.onTick(shake);
      yield* m.cine(1.5);
      b.sfx('warpShatter', br, { pitch: 1.8, vol: 0.5 });
      yield* m.cine(0.4);
      // the geyser, and the transformation — the glacier melting under it
      const geyser = new THREE.Mesh(new THREE.CylinderGeometry(5, 8, 160, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8ff6a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      b.scene.add(geyser);
      m.onDispose(() => {
        if (geyser.parent) b.scene.remove(geyser);
        geyser.geometry.dispose();
        geyser.material.dispose();
      });
      let melted = false;
      const idx = K.formIndex(br, 'ssj');
      BK.give(br, 'ssj');
      yield* C.transform(m, {
        fighter: br, formIndex: idx, witness: g, dust: false,
        witnessLine: 'His power... it\'s exploding past anything I\'ve ever felt!',
        changeShots: [
          // the roar, close and low
          { at: 0, shot: (t, out) => {
            const c = br.chest();
            out.pos.copy(c).addScaledVector(br.forward, 4.4).add(new V3(1.2, -0.9, 0));
            out.look.copy(c).add(new V3(0, 0.7, 0));
            out.fov = 48;
          } },
          // wide: the geyser standing up out of the ice
          { at: 0.45, shot: (t, out) => {
            const c = br.pos.clone();
            out.pos.copy(c).add(new V3(42 - t * 6, 18 + t * 8, 38));
            out.look.copy(c).add(new V3(0, 16, 0));
            out.fov = 58;
          } },
          // higher still: the whole glacier going to fire
          { at: 0.95, shot: (t, out) => {
            const c = br.pos.clone();
            out.pos.copy(c).add(new V3(70, 48 + t * 10, 60));
            out.look.copy(c).add(new V3(0, 4, 0));
            out.fov = 60;
          } },
        ],
        onFrame: (fr, burstAt) => {
          const k = U.clamp01(fr / burstAt);
          geyser.position.copy(br.pos).add(new V3(0, 80, 0));
          geyser.material.opacity = fr < burstAt ? k * 0.5 : Math.max(0.15, 0.5 - (fr - burstAt) / 120);
          geyser.material.color.setHex(fr % 16 < 8 ? 0xe8ff6a : 0x6aff5a);
          if (fr % 6 === 0) b.vfx.ring(br.pos.clone().add(new V3(0, 0.5 + (fr % 30) * 0.4, 0)), 6 + k * 8, 0x9aff6a, 0.4, new V3(0, 1, 0));
          if (!melted && fr >= burstAt * 0.6) {
            melted = true;
            BK.melt(m, LG.meltSeconds);
          }
        },
      });
      // whatever was watched or skipped: Super Saiyan, the glacier gone to lava
      if (!melted) BK.melt(m, 0.1);
      if (b.stage.setMelt) b.stage.setMelt(1);
      K.toForm(br, 'ssj');
      BK.lavaReact(m);
      if (geyser.parent) geyser.material.opacity = 0.18;
      yield* SL.Cinema.play(m, 'bb_lg_after');
      if (geyser.parent) b.scene.remove(geyser);
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'BEYOND THE LIMITS', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_legend',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'Beyond the Limits',
    subtitle: 'Part 5 · The glacier → the lava',
    character: 'goku',
    stage: 'broly_glacier',
    parTime: 420,
    lockForms: BK.LOCKS,
    qteLabel: 'The combination',
    rules: { allowTransform: true, allowUltimates: true },
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    blurb: 'Goku gets up out of the snow and goes past every limit he has. Frieza watches him do it — and remembers what made Goku a Super Saiyan in the first place.',
    rewards: ['Goku: Super Saiyan Blue', 'Broly: Super Saiyan', 'Stage: The Lava Wasteland'],
    setup,
    phases: [P.blue, P.duel, P.paragus, P.legend, P.after],
  };

  SL.data.bbLegend = { LG };
  SL.data.missions[def.id] = def;
})();
