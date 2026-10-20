/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY (movie continuity) — "The First Clash"
 *
 *   ARRIVE *   (scene bb_arrive)  the glacier; Goku and Vegeta in winter coats; Frieza's welcome; Paragus walks his
 *                                 son out; the exile in two lines; Vegeta's coat comes off; "...Yes, Father."
 *   WATCH *    (play)             VEGETA (base) against BROLY (base, CONTROLLED). Vegeta is faster and sharper and
 *                                 lands at will — and Broly watches. A strike he has seen three times is CAUGHT and
 *                                 answered; blasts he has seen enough are swatted away; his adaptation climbs
 *                                 WATCHING → LEARNING → MATCHING, and at MATCHING he throws Vegeta's own most-used
 *                                 strike back at him. Vary your attacks.
 *   GOLD *     (hold Charge)      SUPER SAIYAN, the film's way (the owner's beat text): the hair flickering a pale
 *                                 green before it snaps gold, the ice shattering under his boots.
 *   ADAPT *    (play)             Super Saiyan Vegeta — and Broly catches up again: he reads faster now (two
 *                                 sightings), heavier, more forceful, the ice cracking under every crash.
 *   GOD *      (hold Charge)      SUPER SAIYAN GOD: the gold condensing into a crimson flame, the hair snapping ruby
 *                                 red, the body leaner (scene bb_god_reveal: Goku, "since when?").
 *   DOMINATE   (cues + staged)    God Vegeta does not block: he sways round Broly's wild punches (Dodge), each one
 *                                 faster, catches the fourth in an open hand (Heavy), turns round him and puts him
 *                                 through the ice spires with one god-ki punch.
 *   OVERWHELM *(play)             God Vegeta takes him apart — too fast to read. Broly's meter is RAGE now, and every
 *                                 blow fills it. When it is full, the story takes over.
 *   SMASH      (cue)              above him: "Drive him into the ice" (Heavy) — Broly through the glacier into a
 *                                 crater; scene bb_crater (Paragus shouting; two eyes lighting amber in the dark).
 *   AFTER                         the title; next: "Wrath".
 * Every phase marked * is a checkpoint. Not canon-chronology: the film's own progress (Save track `movies`).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;

  // TUNING (story fight): seconds, floors (fractions of max health), damage multipliers
  const CL = {
    watchSeconds: 85, watchFloor: 0.55, afterCopy: 7, brolyDealt1: 0.42,
    adaptSeconds: 55, adaptMin: 18, adaptFloor: 0.45, afterSurpass: 9, brolyDealt2: 0.4,
    godSeconds: 50, rageGain: 2.4, brolyDealtGod: 0.25, vegetaDealtGod: 1.0, brolyTakenGod: 1.0, brolyFloorGod: 0.2,
    brolyFloor: 0.3,
    ssjHold: 2.6, godHold: 3.4,
  };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  const SPOT = { vegeta: [4, -14], gokuCoat: [8.5, -16], gokuWatch: [24, -26], broly: [-6, 14], paragus: [-10, 18], frieza: [-31, 38], cheelai: [-38, 43], lemo: [-41, 40] };

  function setup(battle) {
    const b = battle;
    const at = (k, lift) => BK.at(b, SPOT[k][0], SPOT[k][1], lift);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: at('vegeta'), startKi: 100 });
    const vegetaCoat = b.spawn({ charId: 'vegeta', team: 0, pos: at('vegeta'), startKi: 0, wardrobe: { outfit: 'vegeta_broly_winter' } });
    const gokuCoat = b.spawn({ charId: 'goku', team: 0, pos: at('gokuCoat'), startKi: 100, wardrobe: { outfit: 'goku_broly_winter', emblem: 'none' } });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: BK.at(b, -26, 30), startKi: 100 });
    const paragus = b.spawn({ charId: 'paragus', team: 1, pos: BK.at(b, -30, 34), startKi: 0 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 1, pos: at('cheelai'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 1, pos: at('lemo'), startKi: 0 });
    K.toForm(frieza, 'final');
    const soldiers = [];
    for (let i = 0; i < 4; i++) soldiers.push(b.spawn({ charId: 'frieza_soldier', team: 1, pos: BK.at(b, -27 - i * 3.2, 46 + (i % 2) * 2), startKi: 0 }));
    for (const f of [gokuCoat, paragus, frieza, cheelai, lemo, ...soldiers]) K.watcher(f, 'idle', 'calm');
    K.watcher(gokuCoat, 'g_pockets', 'grin');
    K.watcher(paragus, 'pg_idle', 'cold');
    K.watcher(frieza, 'fz_watch', 'smirk');
    K.watcher(cheelai, 'ch_idle', 'smirk');
    K.watcher(lemo, 'le_idle', 'calm');
    K.watcher(vegetaCoat, 'armsCrossed', 'serious');
    K.watcher(broly, 'br_idle', 'calm');
    vegeta.setHidden(true);
    broly.cannotDie = true;
    vegeta.cannotDie = true;
    for (const f of [frieza, cheelai, lemo, ...soldiers]) K.faceTo(f, new V3(0, 0, 0));
    K.faceTo(vegetaCoat, broly.pos);
    K.faceTo(gokuCoat, broly.pos);
    b.story = { vegeta, vegetaCoat, goku: gokuCoat, gokuCoat, broly, paragus, frieza, cheelai, lemo, soldiers };
  }

  /** Everybody where the fight needs them (a checkpoint restart starts here). */
  function stage(m) {
    const b = m.battle, S = b.story;
    if (!S.vegetaCoat.hidden) BK.coat(m, S.vegetaCoat, S.vegeta, 0x9ad83a);
    S.vegetaCoat.setHidden(true);
    S.vegeta.setHidden(false);
    const g = S.gokuCoat;
    K.place(g, BK.at(b, SPOT.gokuWatch[0], SPOT.gokuWatch[1]), 0);
    K.watcher(g, 'g_pockets', 'serious');
    K.place(S.paragus, BK.at(b, SPOT.paragus[0], SPOT.paragus[1]), 0);
    K.watcher(S.paragus, 'pg_remote', 'cold');
    if (!m.flags.staged) {
      // the fight starts close (the arrival leaves them thirty metres apart: the cut to the title hides the step)
      K.place(S.vegeta, BK.at(b, 2, -5), 0);
      K.place(S.broly, BK.at(b, -2, 4), 0);
      m.flags.staged = true;
    }
    K.faceTo(S.vegeta, S.broly.pos);
    K.faceTo(S.broly, S.vegeta.pos);
    K.faceTo(g, S.broly.pos);
    K.faceTo(S.paragus, S.broly.pos);
    if (!m.flags.react) {
      m.flags.react = true;
      BK.react(m);
    }
  }

  /** Vegeta the player, Broly his CPU self. */
  function arm(m) {
    const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
    b.switchPlayer(v, { force: true, quiet: true });
    br.controller = cpu(b);
    br.untargetable = br.intangible = false;
    v.untargetable = v.intangible = false;
    br.target = v;
    v.target = br;
    for (const f of [v, br]) f.setState('free');
  }

  /** The lines the fight says while it is being fought (Vegeta, Goku watching, Paragus). */
  function voices(m) {
    const b = m.battle, S = b.story;
    const offs = [
      b.on('brolyRead', (e) => {
        if (e.fighter !== S.broly) return;
        m.flags.reads = (m.flags.reads || 0) + 1;
        if (m.flags.reads === 1) {
          m.say('vegeta', 'What...?! He caught it!', 2, { style: 'shout' });
          b.after(130, () => m.say('goku', 'He\'s learning, Vegeta! Don\'t give him the same punch twice!', 2.8));
        } else if (m.flags.reads === 3) m.say('vegeta', 'Tch... he is reading me.', 2);
      }),
      b.on('brolySwat', (e) => {
        if (e.fighter !== S.broly || m.flags.swatSaid) return;
        m.flags.swatSaid = true;
        m.say('vegeta', 'He swats my blasts away like flies...', 2.4);
      }),
      b.on('brolyStage', (e) => {
        if (e.fighter !== S.broly) return;
        m.flags.stage = e.stage;
        m.flags.stageAt = b.frame;
        if (e.stage === 1 && !m.flags.said1) {
          m.flags.said1 = true;
          m.say('goku', 'Look at his eyes. He\'s watching every move you make...', 2.8);
        }
        if (e.stage === 3 && !m.flags.said3) {
          m.flags.said3 = true;
          m.say('goku', 'He keeps getting stronger, the longer you fight him!', 2.6);
          b.after(160, () => m.say('paragus', 'Yes, Broly. Learn him. Then break him.', 2.6));
        }
      }),
      b.on('brolyCopy', (e) => {
        if (e.fighter !== S.broly) return;
        m.flags.copied = b.frame;
        m.say('vegeta', 'That\'s... MY technique! He copied it!', 2.6, { style: 'shout' });
      }),
    ];
    const off = () => offs.forEach((o) => o());
    m.onDispose(off);
    return off;
  }

  /** The first read teaches the lesson, in every HUD mode: the strike he knows comes back at you. */
  function readTip(m) {
    m.prompt('bbVary', 'light', 'HE LEARNS — a strike seen three times is caught. Vary your attacks.', { required: true, when: () => !!m.flags.reads, until: () => m.flags.reads && m.battle.frame - (m.flags.readTipAt || (m.flags.readTipAt = m.battle.frame)) > 330 });
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      m.clearObjectives();
      yield* SL.Cinema.play(m, 'bb_arrive');
    },
  };

  P.watch = {
    id: 'watch',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      if (v.formIndex !== 0) v.applyForm(0);
      if (br.formIndex !== 0) br.applyForm(0);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 60);
      br.hp = br.hpMax;
      br.legendaryOverride = { stageCap: 2 };
      BK.rageMeter(m, br, false);
      arm(m);
      const fight = m.storyFight({ floors: [{ f: v, at: CL.watchFloor }, { f: br, at: CL.brolyFloor }], dealt: [{ f: br, mul: CL.brolyDealt1 }], ease: { foe: br, hero: v, below: 0.75, min: 0.5 } });
      voices(m);
      readTip(m);
      m.music('broly_theme', 2);
      m.title(BK.CHAPTER, 'VEGETA', 'Base form · Broly is watching', 2.6);
      m.objective('fight', 'Fight Broly', { icon: 'fist' });
      m.objective('vary', 'Land six different strikes', { icon: 'fist', optional: true, target: 6 });
      const landed = new Set();
      const offD = b.on('damage', (e) => {
        if (e.attacker !== v || e.target !== br || v.state !== 'attack' || !v.sd || !v.sd.move) return;
        landed.add(v.sd.move.id);
        m.progress('vary', landed.size);
      });
      m.onDispose(offD);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => fight.floored(v) || t > CL.watchSeconds || (m.flags.copied && b.frame - m.flags.copied > CL.afterCopy * 60) || m.state !== 'running';
      K.unhook(m, clock);
      offD();
      if (m.state !== 'running') return;
      m.complete('fight');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      br.setState('scripted', { pose: 'br_fight', expression: 'serious' });
      v.setState('scripted', { pose: 'idle', expression: 'angry' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', m.flags.copied ? 'Using my own moves against me... Enough. Learn THIS, then.' : 'Enough games. Learn THIS, then.', 3.2);
      yield* m.cine(3.3);
      m.endShot();
    },
  };

  /**
   * SUPER SAIYAN, as the owner's beat text has it: the hair flickers a pale green before it snaps gold, and the ice
   * shatters under his boots. Options for SL.data.cinematics.transform (changeShots, onFrame) plus cleanup().
   * Frames are the form sequence's (vegeta.js ssj: the flicker from 80, the roar at 104, the burst at 132).
   */
  function goldFilm(m, v) {
    const b = m.battle;
    const fw = () => v.forward.clone().setY(0).normalize();
    const sd = () => {
      const d = fw();
      return new V3(d.z, 0, -d.x);
    };
    const look = v.def.forms[K.formIndex(v, 'ssj')].look;
    const base = v.appearance.hair;
    return {
      cleanup() {
        v.auraViewCap = null;
      },
      changeShots: [
        // the boots on the ice: from down at the snow, looking up the length of him
        { at: 0, free: true, shot: (t, out) => {
          const p = v.pos.clone();
          out.pos.copy(p).addScaledVector(fw(), 1.6).addScaledVector(sd(), 0.7).add(new V3(0, 0.25, 0));
          out.look.copy(p).add(new V3(0, 0.9 + t * 0.4, 0));
          out.fov = 50;
        } },
        // the teeth, the brow: close and in front
        { at: 0.42, free: true, shot: (t, out) => {
          const h = v.headPos();
          out.pos.copy(h).addScaledVector(fw(), 0.95).addScaledVector(sd(), 0.25).add(new V3(0, -0.06, 0));
          out.look.copy(h).add(new V3(0, 0.06, 0));
          out.fov = 38;
        } },
        // over the brow, the hair in frame: the green flicker
        { at: 0.62, free: true, shot: (t, out) => {
          const h = v.headPos();
          out.pos.copy(h).addScaledVector(fw(), 1.2).add(new V3(0, 0.55, 0));
          out.look.copy(h).add(new V3(0, 0.22, 0));
          out.fov = 40;
        } },
        // wide and low: the ice going to pieces round him
        { at: 0.86, shot: (t, out) => {
          const c = v.chest();
          out.pos.copy(c).addScaledVector(fw(), 6.5).addScaledVector(sd(), 2.5).add(new V3(0, -0.7, 0));
          out.look.copy(c).add(new V3(0, -0.2, 0));
          out.fov = 50;
        } },
      ],
      onFrame(fr, burstAt) {
        v.auraViewCap = fr < burstAt * 0.86 ? 0.3 : null;
        // the pale green before the gold: this film flickers the hair itself (the form sequence's own flicker,
        // black to gold, is turned off), and the burst snaps it gold
        if (v.state === 'transform' && v.sd && fr < burstAt) v.sd.hairFlicker = false;
        if (fr >= 80 && fr < burstAt && fr % 5 === 0 && v.model.setHair) {
          const on = Math.floor(fr / 5) % 2 === 0;
          v.model.setHair(on ? look.hair.style : base.style, on ? 0xc8f0a8 : base.color);
        }
        // the ice under his boots: cracks, then the shatter
        if (fr % 22 === 0 && fr > 20 && fr < burstAt && b.stage.iceCrack) b.stage.iceCrack(v.pos.clone(), 1.5 + fr / burstAt * 3);
        if (fr === burstAt) {
          BK.iceBurst(b, v.pos.clone(), 2.2);
          b.stage.crater(v.pos.clone(), 3.4, 0.5, null);
        }
      },
    };
  }

  P.gold = {
    id: 'gold',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      if (v.formIndex !== 0) v.applyForm(0);
      br.setState('scripted', { pose: 'br_fight', expression: 'serious' });
      br.controller = K.scripted();
      v.ki = v.kiMax;
      v.setState('free');
      b.switchPlayer(v, { force: true, quiet: true });
      m.objective('gold', 'Super Saiyan: hold Charge', { icon: 'transform' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'full', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      const film = goldFilm(m, v);
      // the hold is shot close: the charge aura thinned so the face and the hair read (no white-out)
      v.auraViewCap = 0.3;
      yield* C.ascend(m, {
        fighter: v, form: 'ssj', witness: br, seconds: CL.ssjHold,
        label: 'Hold Charge — Super Saiyan', meter: 'SUPER SAIYAN', music: 2, dust: false,
        transform: film,
      });
      film.cleanup();
      m.complete('gold');
      m.endShot();
    },
  };

  P.adapt = {
    id: 'adapt',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      K.toForm(v, 'ssj');
      v.hp = Math.max(v.hp, v.hpMax * 0.85);
      v.ki = Math.max(v.ki, v.kiMax * 0.7);
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      // he reads faster now, and he can climb all the way
      br.legendaryOverride = { learnAt: 2, cooldown: 55, stageCap: 3 };
      arm(m);
      const fight = m.storyFight({
        floors: [{ f: v, at: CL.adaptFloor }, { f: br, at: CL.brolyFloor }],
        dealt: [{ f: br, mul: CL.brolyDealt2 }],
        aggression: [{ f: br, value: 0.95 }],
        ease: { foe: br, hero: v, below: 0.7, min: 0.45 },
      });
      voices(m);
      readTip(m);
      m.music('broly_theme', 3);
      m.title(BK.CHAPTER, 'THE LEARNING BEAST', 'Super Saiyan Vegeta', 2.4);
      m.objective('adapt', 'Keep fighting — he is adapting to the Super Saiyan', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (fight.floored(v) && t > CL.adaptMin) || t > CL.adaptSeconds || (br.mech.stage >= 3 && b.frame - (m.flags.stageAt || b.frame) > CL.afterSurpass * 60) || m.state !== 'running';
      K.unhook(m, clock);
      if (m.state !== 'running') return;
      m.complete('adapt');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      br.setState('scripted', { pose: 'br_fight', expression: 'serious' });
      v.setState('scripted', { pose: 'idle', expression: 'angry' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'front' }, 3.6, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'So the brute keeps up with a Super Saiyan... Then let me show you what a god looks like.', 3.6);
      yield* m.cine(3.7);
      m.endShot();
    },
  };

  /**
   * SUPER SAIYAN GOD, the owner's way: the gold aura condensing into a crimson flame, the hair snapping ruby red,
   * the body leaner. Frames are the form sequence's (vegeta.js god: the rise at 84, the burst at 140).
   */
  function godFilm(m, v) {
    const b = m.battle;
    const fw = () => v.forward.clone().setY(0).normalize();
    const sd = () => {
      const d = fw();
      return new V3(d.z, 0, -d.x);
    };
    const gold = new THREE.Color(0xffc81e), red = new THREE.Color(0xff2a48);
    return {
      cleanup() {
        v.auraViewCap = null;
      },
      changeShots: [
        // eyes closed, the calm before it: close, a little below
        { at: 0, free: true, shot: (t, out) => {
          const h = v.headPos();
          out.pos.copy(h).addScaledVector(fw(), 1.0).addScaledVector(sd(), -0.3).add(new V3(0, -0.12, 0));
          out.look.copy(h).add(new V3(0, 0.04, 0));
          out.fov = 38;
        } },
        // the aura drawing in round him: a slow half-circle at mid distance
        { at: 0.32, shot: (t, out) => {
          const c = v.chest();
          const a = v.yaw + 0.5 + t * 0.6;
          out.pos.set(c.x + Math.sin(a) * 4.2, c.y + 0.3, c.z + Math.cos(a) * 4.2);
          out.look.copy(c).add(new V3(0, 0.25, 0));
          out.fov = 44;
        } },
        // the hair: from in front, as it goes red
        { at: 0.78, free: true, shot: (t, out) => {
          const h = v.headPos();
          out.pos.copy(h).addScaledVector(fw(), 1.3).add(new V3(0, 0.2, 0));
          out.look.copy(h).add(new V3(0, 0.18, 0));
          out.fov = 40;
        } },
      ],
      onFrame(fr, burstAt) {
        v.auraViewCap = fr < burstAt ? 0.45 : null;
        // the gold condensing into crimson
        const k = U.clamp01((fr - 30) / Math.max(1, burstAt - 30));
        if (v.aura && v.aura.color) v.aura.color.copy(gold).lerp(red, k);
        if (fr >= 60 && fr % 5 === 0) b.vfx.streamInward(v.chest(), 2.2 + (1 - k) * 2, k > 0.5 ? 0xff4a3a : 0xffc84a, 3, 0.12, 0.4);
        if (fr === burstAt) b.vfx.ring(v.pos.clone().add(new V3(0, 0.2, 0)), 9, 0xff3a4a, 0.6, new V3(0, 1, 0));
      },
    };
  }

  P.god = {
    id: 'god',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      K.toForm(v, 'ssj');
      br.setState('scripted', { pose: 'br_fight', expression: 'serious' });
      br.controller = K.scripted();
      v.ki = v.kiMax;
      v.setState('free');
      b.switchPlayer(v, { force: true, quiet: true });
      m.objective('god', 'Super Saiyan God: hold Charge', { icon: 'transform' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'medium', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      const film = godFilm(m, v);
      // the hold is shot close: the charge aura thinned so the face and the hair read (no white-out)
      v.auraViewCap = 0.3;
      yield* C.ascend(m, {
        fighter: v, form: 'god', witness: br, seconds: CL.godHold,
        label: 'Hold Charge — Super Saiyan God', meter: 'SUPER SAIYAN GOD', music: 2, dust: false,
        transform: film,
      });
      film.cleanup();
      m.complete('god');
      m.endShot();
      K.watcher(S.gokuCoat, 'idle', 'shock');
      yield* SL.Cinema.play(m, 'bb_god_reveal');
    },
  };

  /**
   * GOD VEGETA'S DOMINANCE (the owner's beat text): he hovers, serene. Broly charges with a wild right hook — and
   * Vegeta does not block: he sways (Dodge) round every punch, each one faster; then he catches one (Heavy) in an
   * open hand, turns round him and drives a god-ki punch into his cheek: Broly through the ice spires.
   */
  P.dominate = {
    id: 'dominate',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(v, 'god');
      if (v.form.id !== 'god') K.toForm(v, 'god');
      v.controller = K.scripted();
      br.controller = K.scripted();
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
      // Vegeta just off the ice, calm; Broly across from him
      const c = BK.at(b, 0, 0);
      K.hover(b, v, c.clone().add(new V3(3, 0, -2)), 0.6);
      K.place(br, BK.at(b, -6, 7), 0);
      K.faceTo(v, br.pos);
      K.faceTo(br, v.pos);
      v.setState('scripted', { pose: 'v_tfPride', expression: 'calm' });
      br.setState('scripted', { pose: 'br_fight', expression: 'angry' });
      m.music('ssj_god', 1);
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'medium', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'Come, then.', 1.6);
      yield* wait(1.6);
      // the charge
      br.setState('scripted', { pose: 'br_run', expression: 'shout', speed: 12 });
      b.sfx('roar', br, { pitch: 0.7, vol: 1 });
      const from = br.pos.clone(), dirV = v.pos.clone().sub(br.pos).setY(0).normalize();
      const reach = v.pos.clone().addScaledVector(dirV, -2.3);
      m.shot((t, out) => {
        const mid = br.chest().lerp(v.chest(), 0.5);
        const side = new V3(dirV.z, 0, -dirV.x);
        out.pos.copy(mid).addScaledVector(side, 7).add(new V3(0, 0.6, 0));
        out.look.copy(mid);
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 26);
        K.place(br, BK.at(b, U.lerp(from.x, reach.x, k), U.lerp(from.z, reach.z, k)), br.yaw);
        if (n % 4 === 0) BK.iceBurst(b, br.pos.clone(), 0.3);
        return k >= 1 || skip.on;
      };
      K.place(br, BK.at(b, reach.x, reach.z), br.yaw);
      K.faceTo(br, v.pos);
      // three swings, each faster: he sways round them without raising his hands
      const winds = ['br_hayW', 'br_hookLW', 'br_hayW'], hits = ['br_hay', 'br_hookL', 'br_hay'];
      const sways = ['v_swayL', 'v_swayR', 'v_swayL'];
      const autos = [1.6, 1.3, 1.0];
      for (let i = 0; i < 3; i++) {
        br.setState('scripted', { pose: winds[i], expression: 'shout', speed: 16 + i * 4 });
        // over Broly's shoulder, Vegeta's face in the middle of the frame
        m.shot((t, out) => {
          const d = v.chest().sub(br.chest()).setY(0).normalize();
          const sd = new V3(d.z, 0, -d.x);
          out.pos.copy(br.chest()).addScaledVector(d, -1.6).addScaledVector(sd, i % 2 ? 0.8 : -0.8).add(new V3(0, 0.5, 0));
          out.look.copy(v.chest()).add(new V3(0, 0.25, 0));
          out.fov = 38;
        }, 999, { hold: true, cut: true, blendIn: 0 });
        const r = yield* cue('dodge', i === 0 ? 'Sway — don\'t block (Dodge)' : 'Sway', { auto: autos[i], slow: 0.35 });
        m.qteParts.push(r.pressed || skip.on ? 1 : 0.5);
        br.setState('scripted', { pose: hits[i], expression: 'shout', speed: 30 });
        v.setState('scripted', { pose: sways[i], expression: 'calm', speed: 24 });
        b.vfx.afterimage(v.pos, v.height, 0xff6a6a);
        b.sfx('swing', br, { pitch: 0.6, vol: 1 });
        b.vfx.trail(br.handPos ? br.handPos(i === 1 ? 'L' : 'R') : br.chest(), 0xc8ffd8, 0.5, 0.3);
        yield* wait(0.32 - i * 0.06);
      }
      // the fourth: caught
      br.setState('scripted', { pose: 'br_hayW', expression: 'shout', speed: 26 });
      v.setState('scripted', { pose: 'v_tfPride', expression: 'cold', speed: 20 });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.objective('catch', 'Catch it — and answer', { icon: 'fist' });
      const rc = yield* cue('heavy', 'Catch it — and answer (Heavy)', { auto: 2.2, slow: 0.3 });
      m.qteParts.push(rc.pressed || skip.on ? 1 : 0.5);
      m.complete('catch');
      br.setState('scripted', { pose: 'br_hay', expression: 'shock', speed: 30 });
      v.setState('scripted', { pose: 'v_catch', expression: 'cold', speed: 30 });
      const hand = v.handPos ? v.handPos('L') : v.chest();
      b.vfx.impact(hand, 2, 0xff8a8a);
      b.sfx('punchHeavy', v, { pitch: 0.7 });
      b.slowmo(0.3, 0.5);
      yield* wait(0.45);
      // round him, and into the cheek
      const centre = br.pos.clone(), r0 = v.pos.clone().sub(centre).setY(0), a0 = Math.atan2(r0.x, r0.z), rad = Math.max(1.6, r0.length());
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 12);
        const a = a0 + k * 2.3;
        K.hover(b, v, centre.clone().add(new V3(Math.sin(a) * rad, 0, Math.cos(a) * rad)), 0.4);
        K.faceTo(v, br.pos);
        return k >= 1 || skip.on;
      };
      v.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 30 });
      const away = br.pos.clone().sub(v.pos).setY(0).normalize();
      b.vfx.impact(br.headPos ? br.headPos() : br.chest(), 4, 0xff4a5a);
      b.vfx.ring(br.chest(), 3, 0xff3a4a, 0.4);
      SL.ScreenFX.flash(0.15, '#ff9aa0');
      b.sfx('punchHeavy', br, { pitch: 0.5, vol: 1.4 });
      b.cameraTraumaAt(br.chest(), 0.8);
      // through the ice: every spire near his line goes
      const start = br.pos.clone(), end = start.clone().addScaledVector(away, 44);
      const spires = b.stage.obstacles.filter((o) => {
        if (!o.alive || o.fixture || !o.segs) return false;
        const rel = new V3(o.x - start.x, 0, o.z - start.z);
        const along = rel.dot(away);
        return along > 4 && along < 60 && rel.clone().addScaledVector(away, -along).length() < o.r + 9;
      });
      br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
      m.shot((t, out) => {
        const sd = new V3(away.z, 0, -away.x);
        out.pos.copy(br.chest()).addScaledVector(sd, 9).addScaledVector(away, -4).add(new V3(0, 1.6, 0));
        out.look.copy(br.chest());
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 34);
        const p = start.clone().lerp(end, 1 - Math.pow(1 - k, 2));
        K.place(br, BK.at(b, p.x, p.z, 0.8 + Math.sin(k * Math.PI) * 1.5), br.yaw);
        if (n % 3 === 0) BK.iceBurst(b, br.pos.clone(), 0.5);
        for (const o of spires) if (o.alive && Math.hypot(o.x - br.pos.x, o.z - br.pos.z) < o.r + 2.5) {
          b.stage.destroyPillar(o);
          BK.iceBurst(b, new V3(o.x, br.pos.y, o.z), 1.8);
          b.cameraTraumaAt(br.pos, 0.5);
        }
        return k >= 1 || skip.on;
      };
      for (const o of spires) if (o.alive) b.stage.destroyPillar(o, { quiet: true });
      K.place(br, BK.at(b, end.x, end.z), br.yaw);
      b.stage.crater(BK.at(b, end.x, end.z), 4.5, 1.2, null);
      BK.iceBurst(b, end.clone(), 2.2);
      br.setState('scripted', { pose: 'br_down', expression: 'hurt' });
      v.setState('scripted', { pose: 'armsCrossed', expression: 'cold' });
      K.place(v, BK.at(b, v.pos.x, v.pos.z), v.yaw);
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'Is that all forty years of hatred buys you?', 2.6);
      yield* wait(2.6);
      // he comes back out of the ice, angrier
      K.place(br, BK.at(b, v.pos.x + away.x * 9, v.pos.z + away.z * 9), 0);
      K.faceTo(br, v.pos);
      K.faceTo(v, br.pos);
      br.setState('scripted', { pose: 'br_fight', expression: 'angry' });
      m.endShot();
      b.skipRequested = false;
    },
  };

  P.overwhelm = {
    id: 'overwhelm',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(v, 'god');
      K.toForm(v, 'god');
      v.hp = Math.max(v.hp, v.hpMax * 0.8);
      v.ki = v.kiMax;
      br.hp = Math.max(br.hp, br.hpMax * 0.7);
      br.mech.rage = 0;
      // too fast for him to read: the god is beyond what he has learned — he only gets angrier
      br.legendaryOverride = { learnAt: 0, rageGain: CL.rageGain, rageCool: 0 };
      BK.rageMeter(m, br, true);
      arm(m);
      const fight = m.storyFight({
        floors: [{ f: v, at: 0.4 }, { f: br, at: CL.brolyFloorGod }],
        dealt: [{ f: br, mul: CL.brolyDealtGod }, { f: v, mul: CL.vegetaDealtGod }],
        taken: [{ f: br, mul: CL.brolyTakenGod }],
        aggression: [{ f: br, value: 0.7 }],
      });
      m.music('ssj_god', 2);
      m.title(BK.CHAPTER, 'A GOD\'S POWER', 'Super Saiyan God Vegeta', 2.4);
      m.objective('overwhelm', 'Overwhelm Broly — watch his RAGE', { icon: 'fist' });
      const offR = b.on('brolyRage', (e) => {
        if (e.fighter === br) m.flags.raged = b.frame;
      });
      m.onDispose(offR);
      let talked = 0;
      const talk = () => {
        const r = br.mech.rage;
        if (talked === 0 && r > 30) {
          talked = 1;
          m.say('paragus', 'Broly! What are you doing?! Fight back!', 2.6, { style: 'shout' });
        } else if (talked === 1 && r > 60) {
          talked = 2;
          m.say('frieza', 'My, my. The prince has been busy.', 2.4);
        } else if (talked === 2 && r > 85) {
          talked = 3;
          m.say('cheelai', 'Something\'s wrong with him... Lemo, look at his face!', 2.8);
        }
      };
      m.tickHooks.push(talk);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => m.flags.raged || fight.floored(br) || fight.floored(v) || t > CL.godSeconds || m.state !== 'running';
      K.unhook(m, clock);
      K.unhook(m, talk);
      offR();
      if (m.state !== 'running') return;
      m.complete('overwhelm');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /** One blow staged in the finish: the two of them in the air, Vegeta above. */
  P.smash = {
    id: 'smash',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(v, 'god');
      if (v.form.id !== 'god') K.toForm(v, 'god');
      v.controller = K.scripted();
      br.controller = K.scripted();
      BK.rageMeter(m, br, true);
      // Broly knocked up into the air, Vegeta already over him
      const c = BK.at(b, 0, 0);
      const spot = br.pos.clone().setY(0).lengthSq() < 60 * 60 ? br.pos.clone() : c;
      K.hover(b, br, spot, 6);
      br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 14 });
      b.vfx.afterimage(v.pos, v.height, 0xff7a6a);
      K.hover(b, v, spot.clone().add(new V3(0.6, 0, 0.6)), 9.2);
      K.faceTo(v, br.pos);
      v.setState('scripted', { pose: 'hammerWind', expression: 'shout', speed: 18 });
      b.sfx('vanish', v);
      m.shot((t, out) => {
        const mid = v.chest().lerp(br.chest(), 0.5);
        const sd = new V3(v.forward.z, 0, -v.forward.x);
        out.pos.copy(mid).addScaledVector(sd, 5.5).add(new V3(0, -1.4, 0));
        out.look.copy(mid);
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: v });
      m.objective('smash', 'Drive him into the ice', { icon: 'fist' });
      const r = yield* m.cue('heavy', 'Drive him into the ice', { auto: 4, slow: 0.35 });
      m.qteParts.push(r.pressed ? 1 : 0.4);
      v.setState('scripted', { pose: 'hammer', expression: 'shout', speed: 30 });
      b.vfx.impact(br.chest(), 4, 0xff6a5a);
      b.sfx('punchHeavy', br, { pitch: 0.6, vol: 1.3 });
      b.cameraTraumaAt(br.chest(), 0.6);
      br.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 20 });
      // the fall: fast, straight down, into the ice
      const from = br.pos.clone();
      const ground = BK.at(b, from.x, from.z);
      const lowCam = (t, out) => {
        out.pos.copy(ground).add(new V3(6.5, 0.6, 5.5));
        out.look.copy(br.chest());
        out.fov = 52;
      };
      m.shot(lowCam, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 14);
        br.setPosition(from.clone().lerp(ground, k * k));
        return k >= 1;
      };
      m.complete('smash');
      br.setState('scripted', { pose: 'br_down', expression: 'ko' });
      b.stage.crater(ground.clone(), 8, 1.8, null);
      BK.iceBurst(b, ground.clone(), 2.6);
      b.vfx.explosion(ground.clone().add(new V3(0, 0.6, 0)), 1.2, 0xe8f6ff, { smoke: true });
      b.sfx('groundImpact', null, { at: ground, vol: 1.6 });
      b.sfx('rockBreak', null, { at: ground, pitch: 1.3, vol: 1 });
      b.cameraTraumaAt(ground, 0.9);
      K.place(br, BK.at(b, ground.x, ground.z), br.yaw);
      yield* m.cine(1.4);
      // Vegeta comes down at the rim
      K.place(v, BK.at(b, ground.x + 6, ground.z + 5), 0);
      K.faceTo(v, br.pos);
      v.setState('scripted', { pose: 'armsCrossed', expression: 'cold' });
      m.endShot();
      yield* SL.Cinema.play(m, 'bb_crater');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'SOMETHING IS WAKING UP', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'bb_clash',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'The First Clash',
    subtitle: "Part 3 · A Saiyan's Fury (I) · the glacier",
    character: 'vegeta',
    stage: 'broly_glacier',
    parTime: 540,
    lockForms: BK.LOCKS,
    qteLabel: 'The finish',
    rules: { allowTransform: true, allowUltimates: true },
    // the film's clothes: the fighting armour (the winter coats are spawned explicitly in setup)
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    blurb: 'A Saiyan exiled as a baby, brought to a glacier by Frieza. Vegeta fights him first — and every blow teaches Broly something.',
    rewards: ['Vegeta: Super Saiyan God', 'Stage: The Glacier', 'Outfits: the winter coats, Vegeta\'s movie armour'],
    setup,
    phases: [P.arrive, P.watch, P.gold, P.adapt, P.god, P.dominate, P.overwhelm, P.smash, P.after],
  };

  SL.data.bbClash = { CL };
  SL.data.missions[def.id] = def;
})();
