/*
 * CHAPTER 18 · UNIVERSE 6 — "The Pride of Sadala" (Vegeta vs Cabba, the tournament of Universes 6 and 7)
 * Draft direction: documentation/SUPER_SAGA_VISUAL_REFERENCE.md §1–2, Version B (the owner's default): Base Vegeta's
 * provocation → Cabba's awakening → a brief Blue finishing lesson.
 *
 *   ARENA *     (scene u6_arena)   the ring on the Nameless Planet, the Super Dragon Balls in the void; the gods in
 *                                  their boxes; Vados leads Universe 6 out (Cabba, Frost, Hit, Botamo, Magetta, each
 *                                  shown for what he is); the match called; Cabba's bow
 *   SPAR *      (play)             BASE VEGETA against CABBA, under tournament rules (SL.Tournament.match): ring-out
 *                                  and knock-out are real — Vegeta knocked out or out of the ring is a DEFEAT (retry
 *                                  from this checkpoint). Cabba fights clean and straight; Vegeta is better. When the
 *                                  boy is beaten down (his story floor) the story takes over.
 *   PROVOKE     (scene u6_provoke) Cabba on one knee at the ring's edge; Base Vegeta over him, low, arms crossed: the
 *                                  threat to wipe out Sadala; the close-up of Cabba's eyes
 *   AWAKEN *    (staged)           CABBA'S FIRST SUPER SAIYAN: the eyes trembling (macro), the veins and the grit, the
 *                                  ring cracking round his boots, a jagged golden shockwave; the lens circles him all
 *                                  the way round as the hair snaps up gold (SL.data.cinematics.transform, changeShots)
 *   FLURRY      (staged)           he lunges screaming — a rapid flurry straight into Vegeta's chest, every blow landing
 *                                  — and Vegeta does not dodge: he takes them standing
 *   TEST *      (play)             "Now show me": SUPER SAIYAN CABBA against base Vegeta, tournament rules again (a
 *                                  defeat is real); he is faster and he hits harder now
 *   LESSON      (cues + staged)    Vegeta goes Super Saiyan Blue for one second (Charge) — the cobalt light on Cabba's
 *                                  face — and a restrained jab to the gut (Heavy); Cabba folds, the gold goes out of his
 *                                  hair, Vegeta catches him: "Remember this feeling..."; he carries him to the edge and
 *                                  sets him down outside the ring — the ring-out the announcer calls
 *   AFTER       (scene u6_after)   Cabba's thanks; Hit steps forward (the next match)
 * Every phase marked * is a checkpoint. Canon: Chapter 18 (story.js), between Resurrection of F and the End of Z.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;
  const PO = SL.data.poses;
  const CHAPTER = 'CHAPTER 18 · UNIVERSE 6';

  // TUNING: seconds, story floors (fractions of max health), damage multipliers
  const TU = {
    sparSeconds: 75, sparFloor: 0.32, cabbaDealt1: 0.5, vegetaDealt1: 1.15,
    testSeconds: 36, testMin: 12, testFloor: 0.4, cabbaDealt2: 0.3, vegetaDealt2: 1.0,
  };
  // where everybody stands (x, z): the ring is 30 m square at the origin, Universe 7 at +x, Universe 6 at -x
  const SPOT = {
    ringV: [0, 6], ringC: [0, -6], edge: [0, -12], out: [1.2, -19],
    vegetaWait: [19.5, 3], goku: [20, 6.5], piccolo: [20.5, 10],
    beerus: [31, -1.6], whis: [31.4, 1.8], champa: [-31, 1.6], vados: [-31.4, -1.8],
    cabba: [-19.5, 2.5], frost: [-19.5, -1], hit: [-20, -4.5], botamo: [-21, -8.5], magetta: [-21.5, -13],
  };
  const at = (b, k, lift) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift || 0);

  /* ----- the mission's poses (SL.data.poses) ----- */
  // taking it: upright, the chest out, the fists low at his sides, the chin up — he lets every blow land
  PO.v_tank = (t) => {
    const s = Math.sin(t * 36) * 0.8;
    return {
      root: { y: -0.02 }, spine: [-4, 0, s * 0.3], chest: [-6, 0, 0], head: [-6, 0, 0],
      shoulderL: [-8, 0, 16], elbowL: [-22, 0, 0], shoulderR: [-8, 0, -16], elbowR: [-22, 0, 0],
      thighL: [-14, 0, 12], kneeL: [12, 0, 0], thighR: [8, 0, -12], kneeR: [8, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // the catch: the left arm out low across his body, an open hand under a falling chest
  PO.v_catchBody = { root: { y: -0.08 }, hips: [0, 10, 0], spine: [8, 6, 0], chest: [8, 10, 0], head: [10, -6, 0], shoulderL: [-70, -20, 8], elbowL: [-30, 0, 0], handL: [-20, 0, 0], shoulderR: [-60, 20, -8], elbowR: [-40, 0, 0], thighL: [-24, 0, 12], kneeL: [26, 0, 0], thighR: [10, 0, -12], kneeR: [16, 0, 0], hands: ['open', 'open'] };
  // setting him down: a bend at the waist, both hands low
  PO.v_layDown = { root: { y: -0.26, rx: 24 }, spine: [22, 0, 0], chest: [14, 0, 0], head: [14, 0, 0], shoulderL: [-70, 0, 10], elbowL: [-20, 0, 0], shoulderR: [-70, 0, -10], elbowR: [-20, 0, 0], thighL: [-50, 0, 12], kneeL: [70, 0, 0], thighR: [-10, 0, -12], kneeR: [40, 0, 0], hands: ['open', 'open'] };

  function setup(battle) {
    const b = battle;
    const sp = (charId, k, team, extra) => b.spawn(Object.assign({ charId, team, pos: at(b, k), startKi: 0 }, extra || {}));
    const vegeta = sp('vegeta', 'vegetaWait', 0, { player: true, startKi: 60 });
    const cabba = sp('cabba', 'cabba', 1, { startKi: 60 });
    const goku = sp('goku', 'goku', 0);
    const piccolo = sp('piccolo', 'piccolo', 0);
    const beerus = sp('beerus', 'beerus', 0);
    const whis = sp('whis', 'whis', 0);
    const champa = sp('champa', 'champa', 1);
    const vados = sp('vados', 'vados', 1);
    const frost = sp('frost', 'frost', 1);
    const hit = sp('hit', 'hit', 1);
    const botamo = sp('botamo', 'botamo', 1);
    const magetta = sp('magetta', 'magetta', 1);
    K.watcher(goku, 'g_handsHips', 'grin');
    K.watcher(piccolo, 'armsCrossed', 'serious');
    K.watcher(beerus, 'bs_idle', 'calm');
    K.watcher(whis, 'w_idle', 'calm');
    K.watcher(champa, 'ch6_idle', 'smirk');
    K.watcher(vados, 'w_idle', 'calm');
    K.watcher(frost, 'fr_polite', 'calm');
    K.watcher(hit, 'ht_pockets', 'cold');
    K.watcher(botamo, 'bo_idle', 'calm');
    K.watcher(magetta, 'mg_idle', 'cold');
    K.watcher(cabba, 'cb_idle', 'determined');
    K.watcher(vegeta, 'armsCrossed', 'serious');
    for (const f of [goku, piccolo, beerus, whis, champa, vados, frost, hit, botamo, magetta, cabba, vegeta]) K.faceTo(f, new V3(0, 0, 0));
    // a knockout is a count, not a death (SL.Tournament.match sets the same)
    vegeta.cannotDie = cabba.cannotDie = true;
    b.story = { vegeta, cabba, goku, piccolo, beerus, whis, champa, vados, frost, hit, botamo, magetta };
  }

  /** The ring's two fighters where the story needs them; the gold Cabba has not found yet stays locked. */
  function ready(m, opts = {}) {
    const b = m.battle, S = b.story;
    if (!m.flags.arena) {
      // a checkpoint start: the arena scene's end state (both teams at the ring, the gods in their boxes)
      for (const n of ['vados', 'frost', 'hit', 'botamo', 'magetta']) K.place(S[n], at(b, n), 0);
      for (const n of ['vados', 'frost', 'hit', 'botamo', 'magetta', 'goku', 'piccolo', 'champa', 'beerus', 'whis']) K.faceTo(S[n], new V3(0, 0, 0));
      m.flags.arena = true;
    }
    if (opts.ring) {
      K.place(S.vegeta, at(b, 'ringV'), Math.PI);
      K.place(S.cabba, at(b, 'ringC'), 0);
    }
    S.vegeta.setHidden(false);
    S.cabba.setHidden(false);
    S.vegeta.untargetable = S.vegeta.intangible = false;
    S.cabba.untargetable = S.cabba.intangible = false;
    // Version B: Vegeta fights the whole match in base form; the Blue is one second of the finish
    if (S.vegeta.formIndex !== 0) S.vegeta.applyForm(0);
    if (!opts.gold) {
      if (S.cabba.formIndex !== 0) S.cabba.applyForm(0);
      S.cabba.lockedForms = Object.assign({}, S.cabba.lockedForms, { ssj: true });
    } else {
      K.toForm(S.cabba, 'ssj');
    }
  }

  /** Tournament rules for a stretch of the match; resolves when the story takes it over, or with a defeat. */
  function* bout(m, opts) {
    const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
    const ai = Object.assign({}, c.def.ai, (c.form && c.form.ai) || {}, opts.ai || {});
    const r = yield* SL.Tournament.match(m, {
      a: v, b: c, player: v, intro: false, begin: opts.begin !== false, fresh: false, keepPlaces: !!opts.keepPlaces,
      // only Vegeta can be rung out: Cabba "flies back in" (his loss is the story's to stage)
      ringOut: [v], ai, difficulty: SL.Settings.data.gameplay.difficulty,
      onStart: opts.onStart,
      during: opts.during,
    });
    if (r.pause) return r;
    // the match was decided by the rules: the boy beat the prince
    if (r.loser === v) m.fail(r.how === 'ringout' ? 'ringout' : 'defeated');
    return r;
  }

  const P = {};

  P.arena = {
    id: 'arena',
    checkpoint: true,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, 'u6_arena');
    },
  };

  P.spar = {
    id: 'spar',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      ready(m, { ring: true });
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, v.kiMax * 0.5);
      c.hp = c.hpMax;
      c.ki = Math.max(c.ki, c.kiMax * 0.5);
      const fight = m.storyFight({
        floors: [{ f: c, at: TU.sparFloor }],
        dealt: [{ f: c, mul: TU.cabbaDealt1 }, { f: v, mul: TU.vegetaDealt1 }],
        aggression: [{ f: c, value: 0.7 }],
        ease: { foe: c, hero: v, below: 0.6, min: 0.5 },
      });
      m.music('battle', 2);
      m.title(CHAPTER, 'VEGETA', 'Base form · tournament rules: stay in the ring', 2.6);
      m.objective('spar', 'Test the soldier from Sadala', { icon: 'fist' });
      m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
      m.objective('vary', 'Land five different strikes', { icon: 'fist', optional: true, target: 5 });
      m.flags.sparAt = b.frame;
      const landed = new Set();
      const offD = b.on('damage', (e) => {
        if (e.attacker !== v || e.target !== c || v.state !== 'attack' || !v.sd || !v.sd.move) return;
        landed.add(v.sd.move.id);
        m.progress('vary', landed.size);
        if (landed.size >= 5) m.complete('vary');
      });
      m.onDispose(offD);
      let said = 0;
      const talk = () => {
        if (said === 0 && b.frame - m.flags.sparAt > 90) {
          said = 1;
          m.say('cabba', 'Please don\'t hold back, Prince Vegeta!', 2.4);
        } else if (said === 1 && c.hpFrac < 0.75) {
          said = 2;
          m.say('vegeta', 'Your form is clean. Your fists are a soldier\'s. Where is the Saiyan?', 3);
        } else if (said === 2 && c.hpFrac < 0.55) {
          said = 3;
          m.say('champa', 'Cabba! What are you doing?! Hit him back!', 2.6, { style: 'shout' });
        }
      };
      m.tickHooks.push(talk);
      let t = 0;
      const r = yield* bout(m, {
        during: () => {
          t += 1 / 60;
          return fight.floored(c) || t > TU.sparSeconds ? { pause: true, how: 'story' } : null;
        },
      });
      K.unhook(m, talk);
      offD();
      if (m.state !== 'running' || !r.pause) return;
      m.complete('spar');
      m.complete('ring');
    },
  };

  P.provoke = {
    id: 'provoke',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      ready(m);
      v.controller = K.scripted();
      c.controller = K.scripted();
      // the boy beaten back to the edge of the ring; Vegeta a few steps off
      K.place(c, at(b, 'edge'), 0);
      const vp = c.pos.clone().add(new V3(2.6, 0, 4.4));
      K.place(v, K.ground(b, vp), 0);
      K.faceTo(v, c.pos);
      K.faceTo(c, v.pos);
      c.hp = Math.min(c.hp, c.hpMax * TU.sparFloor);
      yield* SL.Cinema.play(m, 'u6_provoke');
    },
  };

  /**
   * CABBA'S AWAKENING, the owner's shots: the trembling eyes (macro), the veins and the clenched jaw, the jagged golden
   * shockwave cracking the ring round his boots, the lens circling him all the way round as the hair snaps up gold.
   * Frames are the form sequence's (universe6_cast.js: the rise at 0, the scream at 40, the burst at 80).
   */
  function awakenFilm(m, c) {
    const b = m.battle;
    const fw = () => c.forward.clone().setY(0).normalize();
    const sd = () => {
      const d = fw();
      return new V3(d.z, 0, -d.x);
    };
    return {
      changeShots: [
        // the eyes, trembling: right in front of the face
        { at: 0, free: true, shot: (t, out) => {
          const h = c.headPos();
          const j = Math.sin(t * 90) * 0.006;
          out.pos.copy(h).addScaledVector(fw(), 0.62).add(new V3(j, 0.03 + j, 0));
          out.look.copy(h).add(new V3(0, 0.03, 0));
          out.fov = 26;
        } },
        // the brow and the jaw, a little below: the veins, the grit
        { at: 0.3, free: true, shot: (t, out) => {
          const h = c.headPos();
          out.pos.copy(h).addScaledVector(fw(), 0.95).addScaledVector(sd(), 0.35).add(new V3(0, -0.12, 0));
          out.look.copy(h).add(new V3(0, 0.05, 0));
          out.fov = 34;
        } },
        // the full turn: round him once as the aura erupts and the hair goes up
        { at: 0.5, shot: (t, out) => {
          const ch = c.chest();
          const a = c.yaw + t * Math.PI * 2;
          out.pos.set(ch.x + Math.sin(a) * 3.8, ch.y + 0.2, ch.z + Math.cos(a) * 3.8);
          out.look.copy(ch).add(new V3(0, 0.3, 0));
          out.fov = 46;
        } },
        // low and wide on the burst, from his side (Vegeta is in front of him): the ring breaking open round his boots
        { at: 0.97, shot: (t, out) => {
          const p = c.pos.clone();
          out.pos.copy(p).addScaledVector(sd(), 6.2).addScaledVector(fw(), 1.2).add(new V3(0, 0.35, 0));
          out.look.copy(c.chest());
          out.fov = 52;
        } },
      ],
      onFrame(fr, burstAt) {
        // the ring gives under his boots: cracks first, a jagged golden ring on the burst
        if (fr % 18 === 0 && fr > 10 && fr < burstAt && b.stage.crater) b.stage.crater(c.pos.clone(), 1 + (fr / burstAt) * 2.2, 0.2, null);
        if (fr % 10 === 0 && fr > 30 && fr < burstAt) b.vfx.bolt(c.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.8, 0.8), U.rand(-0.6, 0.6))), U.rand(0.5, 1));
        if (fr === burstAt) {
          b.stage.crater(c.pos.clone(), 4.2, 0.4, null);
          b.vfx.ring(c.pos.clone().add(new V3(0, 0.2, 0)), 8, 0xffd23a, 0.5, new V3(0, 1, 0));
          b.vfx.ring(c.pos.clone().add(new V3(0, 0.5, 0)), 12, 0xffe27a, 0.7, new V3(0, 1, 0));
          b.vfx.debrisBurst(c.pos.clone().add(new V3(0, 0.4, 0)), 14, b.stage.def.arena.debris, 9, 0.22);
        }
      },
    };
  }

  P.awaken = {
    id: 'awaken',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      ready(m);
      if (!m.flags.provoked) {
        // a checkpoint start: where the provocation left them
        K.place(c, at(b, 'edge'), 0);
        K.place(v, K.ground(b, c.pos.clone().add(new V3(1.2, 0, 1.3))), 0);
      }
      // Vegeta steps back to watch it (the lens has to go round the boy, not through the prince)
      {
        const away = v.pos.clone().sub(c.pos).setY(0);
        if (away.lengthSq() < 0.01) away.set(0, 0, 1);
        away.normalize();
        K.place(v, K.ground(b, c.pos.clone().addScaledVector(away, 4.6)), 0);
      }
      K.faceTo(v, c.pos);
      K.faceTo(c, v.pos);
      v.controller = K.scripted();
      c.controller = K.scripted();
      v.setState('scripted', { pose: 'armsCrossed', expression: 'cold' });
      // he gets up off his knee for it
      c.hp = Math.max(c.hp, c.hpMax * 0.5);
      c.ki = c.kiMax;
      const idx = K.formIndex(c, 'ssj');
      if (c.lockedForms) delete c.lockedForms.ssj;
      m.music(null, 0);
      yield* C.transform(m, Object.assign({
        fighter: c, formIndex: idx, witness: v, dust: false, music: 3,
        witnessLine: 'Hmph. There it is.',
      }, awakenFilm(m, c)));
      if (c.form.id !== 'ssj') K.toForm(c, 'ssj');
      m.teach(c, 'form:ssj');
      v.setState('scripted', { pose: 'armsCrossed', expression: 'smirk' });
      c.setState('scripted', { pose: 'cb_gold', expression: 'angry' });
    },
  };

  /** He lunges screaming and hits him, again and again, straight in the chest — and Vegeta lets him. */
  P.flurry = {
    id: 'flurry',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      ready(m, { gold: true });
      v.controller = K.scripted();
      c.controller = K.scripted();
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      // three steps apart, facing each other
      const dir = c.pos.clone().sub(v.pos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, -1);
      dir.normalize();
      const cStart = v.pos.clone().addScaledVector(dir, 4.2);
      K.place(c, K.ground(b, cStart), 0);
      K.faceTo(c, v.pos);
      K.faceTo(v, c.pos);
      v.setState('scripted', { pose: 'v_tank', expression: 'calm' });
      c.setState('scripted', { pose: 'cb_scream', expression: 'shout', speed: 8 });
      m.music('ssj_god', 3);
      // the scream: low, Cabba gold against the black sky
      m.shot((t, out) => {
        const f = c.forward.clone().setY(0).normalize();
        out.pos.copy(c.chest()).addScaledVector(f, 2.6).addScaledVector(new V3(f.z, 0, -f.x), 0.6).add(new V3(0, -0.75, 0));
        out.look.copy(c.headPos());
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('cabba', 'RAAAAAAAGH!', 1.4, { style: 'shout' });
      b.sfx('roar', c, { pitch: 1.3, vol: 0.9 });
      yield* wait(1.3);
      // the lunge: side on, both of them in the frame
      const reach = v.pos.clone().addScaledVector(dir, 1.05);
      c.setState('scripted', { pose: 'cb_jabW', expression: 'shout', speed: 14 });
      m.shot((t, out) => {
        const tw = SL.Cinema.twoShot(c, v, { fov: 44, pad: 1.4, lookUp: 0.1 });
        out.pos.copy(tw.pos);
        out.look.copy(tw.look);
        out.fov = tw.fov;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 10);
        K.place(c, K.ground(b, cStart.clone().lerp(reach, k)), c.yaw);
        if (n % 3 === 0) b.vfx.afterimage(c.pos, c.height, 0xffe27a);
        return k >= 1 || skip.on;
      };
      K.place(c, K.ground(b, reach), c.yaw);
      K.faceTo(c, v.pos);
      // the flurry: every blow lands, square in the chest; Vegeta rocks with them and does not give ground
      const HITS = 10;
      for (let i = 0; i < HITS && !skip.on; i++) {
        if (i === 4) {
          // over Cabba's shoulder: Vegeta's face, unmoved
          m.shot((t, out) => {
            const d = v.chest().sub(c.chest()).setY(0).normalize();
            const s = new V3(d.z, 0, -d.x);
            out.pos.copy(c.chest()).addScaledVector(d, -1.3).addScaledVector(s, 0.55).add(new V3(0, 0.38, 0));
            out.look.copy(v.headPos()).add(new V3(0, -0.05, 0));
            out.fov = 34;
          }, 999, { hold: true, cut: true, blendIn: 0 });
        }
        if (i === 8) {
          // behind Vegeta, low: Cabba's screaming face, lit gold
          m.shot((t, out) => {
            const d = c.chest().sub(v.chest()).setY(0).normalize();
            const s = new V3(d.z, 0, -d.x);
            out.pos.copy(v.chest()).addScaledVector(d, -1.2).addScaledVector(s, -0.6).add(new V3(0, -0.2, 0));
            out.look.copy(c.headPos());
            out.fov = 36;
          }, 999, { hold: true, cut: true, blendIn: 0 });
        }
        c.setState('scripted', { pose: i % 2 ? 'cb_flurryR' : 'cb_flurryL', expression: 'shout', speed: 34 });
        const hitAt = v.chest().addScaledVector(dir, 0.18).add(new V3(U.rand(-0.12, 0.12), U.rand(-0.1, 0.12), 0));
        b.vfx.impact(hitAt, i === HITS - 1 ? 2 : 1, 0xffe27a);
        b.sfx(i % 3 === 2 ? 'punchHeavy' : 'punchLight', v, { pitch: 0.9 + (i % 3) * 0.06 });
        b.cameraTraumaAt(v.chest(), 0.12);
        // he rocks a hair's breadth with each one, and stays where he is
        v.setState('scripted', { pose: 'v_tank', expression: i < 6 ? 'calm' : 'smirk', speed: 30 });
        yield* wait(i < 6 ? 0.16 : 0.13);
      }
      c.setState('scripted', { pose: 'cb_gold', expression: 'angry' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'That... is a Saiyan\'s anger. Good. Now show me what it is worth.', 3.4);
      yield* wait(3.4);
      // apart again for the fight
      K.place(c, K.ground(b, v.pos.clone().addScaledVector(dir, 4.5)), 0);
      K.faceTo(c, v.pos);
      K.faceTo(v, c.pos);
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.test = {
    id: 'test',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const fromCheckpoint = !m.flags.provoked;
      ready(m, { gold: true, ring: fromCheckpoint });
      v.hp = Math.max(v.hp, v.hpMax * 0.85);
      v.ki = Math.max(v.ki, v.kiMax * 0.6);
      c.hp = Math.max(c.hp, c.hpMax * 0.85);
      c.ki = c.kiMax;
      const fight = m.storyFight({
        floors: [{ f: c, at: TU.testFloor }],
        dealt: [{ f: c, mul: TU.cabbaDealt2 }, { f: v, mul: TU.vegetaDealt2 }],
        aggression: [{ f: c, value: 0.92 }],
        ease: { foe: c, hero: v, below: 0.5, min: 0.35 },
      });
      m.music('ssj_god', 2);
      m.title(CHAPTER, 'A SAIYAN\'S PRIDE', 'Super Saiyan Cabba · base Vegeta', 2.4);
      m.objective('test', 'Take the measure of a Super Saiyan', { icon: 'fist' });
      m.objective('ring', 'Stay in the ring and on your feet', { icon: 'target' });
      m.objective('hits', 'Land 8 hits on Super Saiyan Cabba', { icon: 'fist', optional: true, target: 8 });
      let hits = 0;
      const offD = b.on('damage', (e) => {
        if (e.attacker !== v || e.target !== c) return;
        hits++;
        m.progress('hits', Math.min(8, hits));
        if (hits >= 8) m.complete('hits');
      });
      m.onDispose(offD);
      let said = 0;
      const talk = () => {
        if (said === 0 && c.hpFrac < 0.75) {
          said = 1;
          m.say('goku', 'Whoa! He\'s a whole different fighter now!', 2.4);
        } else if (said === 1 && c.hpFrac < 0.6) {
          said = 2;
          m.say('cabba', 'I won\'t let you touch Sadala!', 2.4, { style: 'shout' });
        }
      };
      m.tickHooks.push(talk);
      let t = 0;
      const r = yield* bout(m, {
        keepPlaces: !fromCheckpoint,
        // in the gold he wants to hit him, not shoot him: the fight stays close (blasts are rare)
        ai: { beam: 0.12, ranged: 0.2, preferredRange: 2 },
        during: () => {
          t += 1 / 60;
          return (fight.floored(c) && t > TU.testMin) || t > TU.testSeconds ? { pause: true, how: 'story' } : null;
        },
      });
      K.unhook(m, talk);
      offD();
      if (m.state !== 'running' || !r.pause) return;
      m.complete('test');
      m.complete('ring');
    },
  };

  /**
   * THE LESSON (Version B): one second of Super Saiyan Blue — the cobalt light on Cabba's face — and a restrained jab
   * to the gut. Cabba folds, the gold goes out of him, and Vegeta catches him as he falls; then carries him to the
   * edge and sets him down outside the ring.
   */
  P.lesson = {
    id: 'lesson',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      ready(m, { gold: true });
      v.controller = K.scripted();
      c.controller = K.scripted();
      const skip = { on: false };
      const wait = function* (s) {
        if (skip.on) return;
        yield* m.cine(s);
        if (b.skipRequested) skip.on = true;
      };
      const cue = function* (key, label, opts) {
        if (skip.on) return { pressed: false, skipped: true };
        const r = yield* m.cue(key, label, opts);
        if (b.skipRequested) skip.on = true;
        return r;
      };
      // close, on the ring: Cabba charging in for the last time
      let dir = c.pos.clone().sub(v.pos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, -1);
      dir.normalize();
      // the lesson happens in the middle of the ring, whatever the fight left them
      const mid = K.ground(b, new V3(U.clamp(v.pos.x, -6, 6), 0, U.clamp(v.pos.z, -6, 6)));
      K.place(v, mid, 0);
      K.place(c, K.ground(b, mid.clone().addScaledVector(dir, 3)), 0);
      K.faceTo(v, c.pos);
      K.faceTo(c, v.pos);
      dir = c.pos.clone().sub(v.pos).setY(0).normalize();
      v.setState('scripted', { pose: 'v_tank', expression: 'calm' });
      c.setState('scripted', { pose: 'cb_jabW', expression: 'shout', speed: 10 });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'Good. Now remember this.', 2);
      yield* wait(1.4);
      // ONE SECOND OF BLUE
      m.objective('blue', 'One second of Super Saiyan Blue', { icon: 'transform' });
      const r1 = yield* cue('charge', 'One second of Blue (Charge)', { auto: 2.6, slow: 0.4 });
      m.qteParts.push(r1.pressed || skip.on ? 1 : 0.5);
      m.complete('blue');
      BK.give(v, 'blue');
      K.toForm(v, 'blue');
      v.setState('scripted', { pose: 'v_tfPride', expression: 'cold', speed: 20 });
      SL.ScreenFX.flash(0.4, '#8ad8ff');
      b.vfx.ring(v.pos.clone().add(new V3(0, 0.3, 0)), 7, 0x2a9aff, 0.45, new V3(0, 1, 0));
      b.vfx.flash(v.chest(), 3.2, 0x6ad0ff, 0.5, SL.Toon.tex.glow);
      b.sfx('transformBurst', v, { pitch: 1.2, vol: 0.9 });
      b.stage.setMood(0.45, 0x1a5ad8, 0.15);
      // the cobalt light on Cabba's face (over Vegeta's shoulder, the aura in the edge of the frame)
      let light = null;
      try {
        light = new THREE.PointLight(0x5ac0ff, 2.4, 6);
        light.position.copy(v.chest().addScaledVector(dir, 0.6));
        b.scene.add(light);
      } catch (e) {
        light = null;
      }
      const offL = () => {
        if (light && light.parent) light.parent.remove(light);
      };
      m.onDispose(offL);
      c.setState('scripted', { pose: 'cb_jabW', expression: 'shock', speed: 6 });
      m.shot((t, out) => {
        const d = c.chest().sub(v.chest()).setY(0).normalize();
        const s = new V3(d.z, 0, -d.x);
        out.pos.copy(v.chest()).addScaledVector(d, -0.9).addScaledVector(s, 0.5).add(new V3(0, 0.35, 0));
        out.look.copy(c.headPos());
        out.fov = 32;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.slowmo(0.3, 0.8);
      yield* wait(1.0);
      // THE JAB: restrained, into the stomach
      m.objective('jab', 'A restrained jab to the gut', { icon: 'fist' });
      const r2 = yield* cue('heavy', 'A restrained jab (Heavy)', { auto: 2, slow: 0.3 });
      m.qteParts.push(r2.pressed || skip.on ? 1 : 0.5);
      m.complete('jab');
      K.place(c, K.ground(b, v.pos.clone().addScaledVector(dir, 1.0)), c.yaw);
      v.setState('scripted', { pose: 'v_gut', expression: 'cold', speed: 30 });
      c.setState('scripted', { pose: 'cb_fold', expression: 'ko', speed: 30 });
      b.vfx.impact(c.chest(), 2, 0x8ad8ff);
      b.sfx('punchHeavy', c, { pitch: 0.8, vol: 1.1 });
      b.cameraTraumaAt(c.chest(), 0.4);
      m.shot((t, out) => {
        const tw = SL.Cinema.twoShot(v, c, { fov: 40, pad: 1.1, side: -1, lookUp: 0.1 });
        out.pos.copy(tw.pos);
        out.look.copy(tw.look);
        out.fov = tw.fov;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.slowmo(0.25, 0.9);
      yield* wait(0.7);
      // the second is over: both of them back to base — the gold goes out of the boy as he goes limp
      offL();
      b.stage.clearMood(0.5);
      v.applyForm(0);
      c.applyForm(0);
      b.vfx.flash(c.chest(), 1.6, 0xffe27a, 0.3, SL.Toon.tex.glow);
      // he falls — and Vegeta catches him
      v.setState('scripted', { pose: 'v_catchBody', expression: 'calm', speed: 14 });
      const carry = () => {
        const p = v.pos.clone().addScaledVector(v.forward.clone().setY(0).normalize(), 0.5);
        p.y = v.pos.y + 0.12;
        c.setPosition(p);
        c.vel.set(0, 0, 0);
        c.yaw = c.prevYaw = v.yaw + Math.PI / 2;
      };
      carry();
      c.setState('scripted', { pose: 'cb_limp', expression: 'ko' });
      // side on: the boy folded over his arm, Vegeta's face above him
      m.shot((t, out) => {
        const f = v.forward.clone().setY(0).normalize();
        const s = new V3(f.z, 0, -f.x);
        out.pos.copy(v.chest()).addScaledVector(s, 3.4).addScaledVector(f, 0.9).add(new V3(0, 0.1, 0));
        out.look.copy(v.chest()).addScaledVector(f, 0.4).add(new V3(0, 0.1, 0));
        out.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: v });
      m.say('vegeta', 'Remember this feeling. This is Super Saiyan... never forget it.', 4, { style: 'quiet' });
      m.tickHooks.push(carry);
      yield* wait(4.1);
      // to the edge, and down outside the ring: the ring-out
      const edge = K.ground(b, new V3(SPOT.out[0], 0, -14.2));
      const from = v.pos.clone();
      K.faceTo(v, edge);
      v.setState('scripted', { pose: 'bb_walk', expression: 'calm', speed: 5 });
      // from the middle of the ring, looking out past him to the edge
      const lens = K.ground(b, new V3(edge.x - 5, 0, edge.z + 9), 2.4);
      m.shot((t, out) => {
        out.pos.copy(lens);
        out.look.copy(v.chest());
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: v });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 120);
        K.place(v, from.clone().lerp(edge, k), v.yaw);
        return k >= 1 || skip.on;
      };
      K.place(v, edge, v.yaw);
      K.unhook(m, carry);
      v.setState('scripted', { pose: 'v_layDown', expression: 'calm', speed: 6 });
      K.place(c, at(b, 'out'), 0);
      c.yaw = c.prevYaw = v.yaw;
      c.setState('scripted', { pose: 'cb_out', expression: 'ko' });
      c.ringedOut = true;
      yield* wait(1.2);
      v.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
      b.emit('matchEnd', { winner: v, loser: c, how: 'ringout' });
      // the call over the picture that decides it: the boy on the ground outside the ring, the prince at its edge
      m.shot((t, out, el) => {
        const mid = c.pos.clone().lerp(v.pos, 0.5);
        out.pos.copy(mid).add(new V3(7.5 - el * 0.8, 2.2, -1.5));
        out.look.copy(mid).add(new V3(0, 0.4, 0));
        out.fov = 42;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* SL.Tournament.announce(m, 'ringout', { winner: v, loser: c }, { shot: false, seconds: 3.4 });
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cabba;
      m.lock(true);
      m.clearObjectives();
      ready(m);
      v.controller = K.scripted();
      c.controller = K.scripted();
      if (!c.ringedOut) {
        K.place(v, K.ground(b, new V3(SPOT.out[0], 0, -14.2)), Math.PI);
        K.place(c, at(b, 'out'), 0);
      }
      K.faceTo(c, v.pos);
      K.faceTo(v, c.pos);
      yield* SL.Cinema.play(m, 'u6_after');
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      // the next mission in the story order (Hit's match, u6_hit: the scene above is its lead-in)
      m.title(CHAPTER, 'THE PRIDE OF SADALA', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'u6_cabba',
    canon: true,
    chapter: CHAPTER,
    title: 'The Pride of Sadala',
    subtitle: 'The Universe 6 tournament · Vegeta vs Cabba',
    character: 'vegeta',
    stage: 'u6_arena',
    parTime: 420,
    qteLabel: 'The lesson',
    // Version B: Vegeta fights the match in base form (the one second of Blue is the story's)
    rules: { allowTransform: false, allowUltimates: true },
    // the Super-era clothes: Vegeta's suit and white armour, Goku's Whis gi
    appearance: { vegeta: { outfit: 'vegeta_whis', armor: 'armor_v_whis', emblem: 'none' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    blurb: 'Champa\'s tournament on the Nameless Planet. Universe 6 sends a young Saiyan from Planet Sadala — and Vegeta decides to teach him something.',
    rewards: ['Cabba (playable)', 'Cabba: Super Saiyan', 'Stage: Nameless Planet'],
    setup,
    phases: [P.arena, P.spar, P.provoke, P.awaken, P.flurry, P.test, P.lesson, P.after],
  };

  SL.data.u6Cabba = { TU, SPOT };
  SL.data.missions[def.id] = def;
})();
