/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY (movie continuity) — "Wrath"
 *
 *   WAKE *    (cues + staged shots)  THE WRATHFUL TRANSFORMATION, the owner's seven shots, played:
 *                                    0  over Vegeta's shoulder into the crater — FIRE (Blast): his volley lands
 *                                       and the smoke rolls up; silence
 *                                    1  close on Broly's face in the smoke: the eyes snap open, glowing amber
 *                                    2  from down on the ice: he rises, towering, the snow sliding off him
 *                                    3  wide: the glacier answers — cracks racing out, the snow lifting in sheets,
 *                                       ice spires shattering, the soldiers and Cheelai thrown off balance
 *                                    4  close on his fists: the muscle swelling, the veins coming up
 *                                    5  a held silence — then the emerald aura erupts, jagged, and he roars
 *                                    6  wide: the shockwave tearing across the field — BRACE (Guard)
 *                                    7  over Vegeta's shoulder: he comes — DODGE — and the fight is yours
 *                                    No white flash: the colour of every burst is the aura's own green.
 *   RAGE *    (play)                 SUPER SAIYAN GOD Vegeta against WRATHFUL Broly: reach, crashing leaps,
 *                                    roars, rams; light blows do not stop him; he reads you in two sightings now;
 *                                    the ice breaks under every crash. Paragus tries the collar once — a free
 *                                    opening while Broly convulses — and it stops working.
 *   OCEAN     (cues + mash)          Vegeta strikes — Broly eats it, takes him by the face and drags him through the
 *                                    ice; break free (mash), the crimson God Ki blast point blank (Blast): Broly into
 *                                    the black sea — and up again out of it in a pillar of green light.
 *   BLUE *    (hold Charge)          SUPER SAIYAN BLUE: "I'm not done yet!"
 *   FURY *    (play)                 Blue Vegeta holds — until Broly SURPASSES him again.
 *   CLASH     (beam clash)           GALICK GUN (Special 1) against the GIGANTIC ROAR. Win it and he walks out of
 *                                    your beam; lose it and it takes you. The story goes on the same way.
 *   END       (staged)               the big hand round Vegeta, the slam into the ice — and Goku's coat comes off.
 * Every phase marked * is a checkpoint.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;

  const WR = {
    rageSeconds: 48, rageMin: 22, rageFloor: 0.45, brolyDealt1: 0.3, brolyTaken1: 0.55, collarAt: 14,
    furySeconds: 55, furyMin: 20, furyFloor: 0.32, brolyDealt2: 0.34, brolyTaken2: 0.7, afterSurpass: 8,
    clashSeconds: 8, blueHold: 3.2,
    braceMiss: 0.06, dodgeMiss: 0.1, // health lost when the cue is not answered
  };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));
  const CR = [0, 0];
  const SPOT = { vegeta: [7, 6], gokuWatch: [24, -26], paragus: [-10, 18], frieza: [-31, 38], cheelai: [-38, 43], lemo: [-41, 40] };

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: at('vegeta'), startKi: 100 });
    const gokuCoat = b.spawn({ charId: 'goku', team: 0, pos: at('gokuWatch'), startKi: 100, wardrobe: { outfit: 'goku_broly_winter', emblem: 'none' } });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: BK.at(b, CR[0], CR[1]), startKi: 100 });
    const paragus = b.spawn({ charId: 'paragus', team: 1, pos: at('paragus'), startKi: 0 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at('frieza'), startKi: 0 });
    const cheelai = b.spawn({ charId: 'cheelai', team: 1, pos: at('cheelai'), startKi: 0 });
    const lemo = b.spawn({ charId: 'lemo', team: 1, pos: at('lemo'), startKi: 0 });
    K.toForm(frieza, 'final');
    const soldiers = [];
    for (let i = 0; i < 4; i++) soldiers.push(b.spawn({ charId: 'frieza_soldier', team: 1, pos: BK.at(b, -27 - i * 3.2, 46 + (i % 2) * 2), startKi: 0 }));
    K.watcher(gokuCoat, 'g_pockets', 'serious');
    K.watcher(paragus, 'pg_shout', 'angry');
    K.watcher(frieza, 'fz_watch', 'smirk');
    K.watcher(cheelai, 'ch_watch', 'nervous');
    K.watcher(lemo, 'le_watch', 'calm');
    for (const s of soldiers) K.watcher(s, 'idle', 'calm');
    K.watcher(broly, 'br_down', 'ko');
    broly.cannotDie = true;
    vegeta.cannotDie = true;
    for (const f of [frieza, cheelai, lemo, ...soldiers, paragus, gokuCoat]) K.faceTo(f, broly.pos);
    // the God form was handed over in the first clash
    BK.give(vegeta, 'god');
    K.toForm(vegeta, 'god');
    b.story = { vegeta, goku: gokuCoat, gokuCoat, broly, paragus, frieza, cheelai, lemo, soldiers };
  }

  /** The crater the first clash left, the fighters round it (checkpoint restarts start here). */
  function stage(m) {
    const b = m.battle, S = b.story;
    if (!m.flags.crater) {
      m.flags.crater = true;
      const c = BK.at(b, CR[0], CR[1]);
      b.stage.crater(c, 8, 1.8, null);
      if (b.stage.iceCrack) b.stage.iceCrack(c, 9);
      BK.react(m);
    }
    K.place(S.gokuCoat, BK.at(b, SPOT.gokuWatch[0], SPOT.gokuWatch[1]), 0);
    K.faceTo(S.gokuCoat, S.broly.pos);
    K.place(S.paragus, BK.at(b, SPOT.paragus[0], SPOT.paragus[1]), 0);
    K.faceTo(S.paragus, S.broly.pos);
  }

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

  /** The Wrathful form, without the event (checkpoints): eyes, veins, build — the form's own look. */
  function wrathNow(br) {
    BK.give(br, 'wrath');
    K.toForm(br, 'wrath');
  }

  /* ======================================================================== THE WRATHFUL TRANSFORMATION */
  const P = {};

  P.wake = {
    id: 'wake',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      if (br.formIndex !== 0) br.applyForm(0);
      BK.give(v, 'god');
      if (v.form.id !== 'god') K.toForm(v, 'god');
      v.hp = Math.max(v.hp, v.hpMax * 0.9);
      v.ki = v.kiMax;
      b.switchPlayer(v, { force: true, quiet: true });
      v.controller = K.scripted();
      br.controller = K.scripted();
      br.untargetable = br.intangible = true;
      const cr = BK.at(b, CR[0], CR[1]);
      K.place(br, cr, 0);
      br.setState('scripted', { pose: 'br_down', expression: 'ko', aura: 0 });
      BK.eyes(br, 0);
      K.hover(b, v, BK.at(b, SPOT.vegeta[0], SPOT.vegeta[1]), 3.4);
      K.faceTo(v, br.pos);
      K.faceTo(br, v.pos);
      v.setState('scripted', { pose: 'flyIdle', expression: 'cold' });
      // skip-safe: one skip runs the rest straight to the same end state
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
      const fw = (f) => f.forward.clone().setY(0).normalize();
      const sd = (f) => {
        const d = fw(f);
        return new V3(d.z, 0, -d.x);
      };
      m.title(BK.CHAPTER, 'WRATH', 'The glacier · the same minute', 2.6);
      m.music(null, 0);

      // 0. OVER VEGETA'S SHOULDER, DOWN INTO THE CRATER — FIRE
      v.auraViewCap = 0.12;
      m.shot((t, out) => {
        const to = br.chest(), from = v.chest();
        const dir = to.clone().sub(from).normalize();
        const side = new V3(dir.z, 0, -dir.x).normalize();
        out.pos.copy(from).addScaledVector(dir, -2.1).addScaledVector(side, -0.85).add(new V3(0, 0.45, 0));
        out.look.copy(to);
        out.fov = 32;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('vegeta', 'Stay down. That is an order from your prince.', 2.6);
      yield* wait(1.4);
      m.objective('fire', 'Finish it: fire into the crater', { icon: 'blast' });
      const fire = yield* cue('blast', 'Fire into the crater', { auto: 4 });
      m.qteParts.push(fire.pressed ? 1 : 0.5);
      m.complete('fire');
      // the volley: eight shots from alternating hands, each landing in the crater
      let shots = 0;
      const volley = () => {
        if (shots >= 8 || b.disposed) return false;
        if (b.frame % 6 !== 0) return true;
        const side = shots % 2 ? 'L' : 'R';
        v.anim.play(side === 'R' ? 'blastR' : 'blastL', 50, { restart: true });
        const from = v.handPos(side), to = br.chest().add(new V3(Math.sin(shots * 2.1) * 0.8, Math.cos(shots * 1.7) * 0.4, Math.cos(shots * 2.9) * 0.8));
        for (let i = 0; i <= 8; i++) b.vfx.trail(from.clone().lerp(to, i / 8), 0xffd0a0, 0.28, 0.22);
        b.after(4, () => {
          b.vfx.explosion(to, 1.3, 0xffb070, { smoke: true });
          b.sfx('explosionSmall', null, { at: to, vol: 0.8 });
        });
        b.sfx('kiBlast', v, { pitch: 1.1 });
        shots++;
        return true;
      };
      b.onTick(volley);
      yield* wait(1.5);
      shots = 8;
      // the smoke rolls up out of the crater
      let puff = 0;
      b.onTick(() => {
        // it billows up and thins out before the eyes open in it
        if (b.disposed || ++puff > 56) return false;
        if (puff % 4 === 0) b.vfx.smoke.emit(cr.x + Math.sin(puff * 2.4) * 1.6, cr.y + 0.4, cr.z + Math.cos(puff * 2.4) * 1.6, Math.sin(puff) * 0.5, 2 + (puff % 5) * 0.3, Math.cos(puff) * 0.5, 0.5, 0.53, 0.58, 0.55, 1.4, 1.9, { grow: 2, drag: 0.6 });
        return true;
      });
      b.cameraTraumaAt(cr, 0.35);
      v.setState('scripted', { pose: 'flyIdle', expression: 'smirk' });
      // the silence: the smoke, the wind, nothing
      SL.Music.stop(0.4);
      v.auraViewCap = null;
      m.shot((t, out, el) => {
        const k = Math.min(1, (el || 0) / 1.6);
        out.pos.copy(cr).add(new V3(7.5 - k * 0.8, 0, 6 - k * 0.6));
        out.pos.y = b.stage.heightAt(out.pos.x, out.pos.z) + 1.1;
        out.look.copy(cr).add(new V3(0, 1.6, 0));
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.sfx('rumble', null, { at: cr, vol: 0.35, pitch: 0.6 });
      yield* wait(1.6);

      // 1. CLOSE ON HIS FACE: THE EYES SNAP OPEN
      m.shot((t, out) => {
        // straight into his face from in front of it (he is on his back: that is from above)
        const F = BK.facePoint(br);
        out.pos.copy(F.face).addScaledVector(F.fwd, 0.72).addScaledVector(F.up, 0.08);
        out.look.copy(F.center).addScaledVector(F.fwd, F.R * 0.5);
        out.fov = 36;
        // rolled so his face reads upright, whichever way his head lies in the ice
        const z = out.pos.clone().sub(out.look).normalize();
        const x = new V3(0, 1, 0).cross(z).normalize(), y = z.clone().cross(x);
        out.roll = -Math.atan2(F.up.dot(x), F.up.dot(y));
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* wait(0.6);
      let ek = 0;
      b.onTick(() => {
        if (b.disposed || ek >= 1) return false;
        ek = Math.min(1, ek + 1 / 14);
        BK.eyes(br, ek);
        return true;
      });
      b.sfx('heartbeat', br, { vol: 1.1 });
      b.sfx('growl', br, { pitch: 0.55, vol: 0.9 });
      br.setState('scripted', { pose: 'br_down', expression: 'angry', aura: 0 });
      yield* wait(1.4);

      // 2. FROM DOWN ON THE ICE: HE RISES, THE SNOW SLIDING OFF HIM
      br.setState('scripted', { pose: 'br_tfRise', expression: 'angry', speed: 4, aura: 0 });
      m.shot((t, out, el) => {
        const p = br.pos.clone(), k = Math.min(1, (el || 0) / 2.2);
        // down in the crater with him (from the rim the lens would be above his head): low, looking up
        out.pos.copy(p).addScaledVector(fw(br), 2.1).addScaledVector(sd(br), 0.8);
        out.pos.y = b.stage.heightAt(out.pos.x, out.pos.z) + 0.32;
        out.look.copy(p).add(new V3(0, 1.0 + k * 1.2, 0));
        out.fov = 58;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const shed = () => {
        if (b.disposed || !m.flags.shedding) return false;
        if (b.frame % 3 === 0 && b.vfx.specks) {
          const c = br.chest();
          b.vfx.specks.emit(c.x + Math.sin(b.frame) * 0.4, c.y + 0.4, c.z + Math.cos(b.frame) * 0.4, 0, -1.6, 0, 0.96, 0.98, 1, 1, 0.06, 0.9, { gravity: 6 });
        }
        return true;
      };
      m.flags.shedding = true;
      b.onTick(shed);
      b.sfx('rumble', br, { vol: 0.7 });
      yield* wait(2.2);
      m.flags.shedding = false;
      br.setState('scripted', { pose: 'br_tfClench', expression: 'grit', speed: 8, aura: 0 });

      // 3. WIDE: THE GLACIER ANSWERS
      m.shot((t, out, el) => {
        const k = Math.min(1, (el || 0) / 2.4);
        const d = fw(br);
        out.pos.copy(cr).addScaledVector(d, 9 - k * 1.5).addScaledVector(sd(br), 7).add(new V3(0, 4.5 - k * 1.2, 0));
        out.look.copy(cr).add(new V3(0, 1.4, 0));
        out.fov = 56;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let ring = 0;
      const cracks = () => {
        if (b.disposed || ring >= 6) return false;
        if (b.frame % 12 !== 0) return true;
        ring++;
        const r = ring * 4;
        for (let i = 0; i < 3; i++) {
          const a = ring * 1.3 + (i / 3) * Math.PI * 2;
          const p = cr.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
          if (b.stage.iceCrack) b.stage.iceCrack(p, 4 + ring);
          b.vfx.dust(BK.at(b, p.x, p.z, 0.2), 1.6, 5, 0xc4d4e2);
        }
        b.vfx.ring(cr.clone().add(new V3(0, 0.3, 0)), r * 1.4, 0x8ab8dc, 0.5, new V3(0, 1, 0));
        b.cameraTraumaAt(cr, 0.25);
        return true;
      };
      b.onTick(cracks);
      b.sfx('rumble', null, { at: cr, vol: 1.2, pitch: 0.7 });
      b.sfx('rockBreak', null, { at: cr, vol: 0.9, pitch: 1.4 });
      // the nearest ice spires come apart
      const near = b.stage.obstacles.filter((o) => o.alive && o.segs && o.segs.length && !o.fixture).sort((a, c) => Math.hypot(a.x, a.z) - Math.hypot(c.x, c.z)).slice(0, 2);
      b.after(30, () => near.forEach((o) => b.stage.destroyPillar && b.stage.destroyPillar(o, { quiet: false })));
      // avalanches off the far walls
      for (let i = 0; i < 6; i++) {
        const a = -1.2 + i * 0.45, d = 175 + (i % 3) * 12;
        const p = new V3(Math.cos(a) * d, 30 + (i % 2) * 10, Math.sin(a) * d);
        b.after(10 + i * 8, () => {
          for (let k = 0; k < 6; k++) b.vfx.rock(p.clone().add(new V3(k * 2, 0, k)), new V3(-Math.cos(a) * 4, -2, -Math.sin(a) * 4), 1.2 + (k % 3) * 0.6, 0xf0f6fc);
          b.vfx.dust(p, 8, 14, 0xc8d8e6);
        });
      }
      for (const s of S.soldiers) s.setState('scripted', { pose: 'stagger', expression: 'shock' });
      S.cheelai.setState('scripted', { pose: 'ch_shock', expression: 'shock' });
      S.lemo.setState('scripted', { pose: 'le_watch', expression: 'shock' });
      yield* wait(2.4);

      // 4. CLOSE ON THE FISTS: THE BODY SWELLING, THE VEINS COMING UP
      m.shot((t, out) => {
        const hand = br.handPos ? br.handPos('R') : br.chest();
        out.pos.copy(hand).addScaledVector(sd(br), -0.7).addScaledVector(fw(br), 0.55).add(new V3(0, 0.12, 0));
        out.look.copy(hand).add(new V3(0, 0.06, 0));
        out.fov = 32;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      for (const vd of br.model.veinDecals || []) vd.visible = true;
      let sw = 0;
      b.onTick(() => {
        if (b.disposed || sw >= 1) return false;
        sw = Math.min(1, sw + 1 / 96);
        if (b.frame % 2 === 0) BK.swell(br, sw, 'wrath');
        BK.eyes(br, 1);
        return true;
      });
      b.sfx('boneCrack', br, { pitch: 0.6, vol: 0.8 });
      b.sfx('growl', br, { pitch: 0.5, vol: 1 });
      yield* wait(0.9);
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* wait(0.9);

      // 5. A HELD SILENCE — THEN THE AURA
      b.silence(0.25, { sfx: true });
      br.auraViewCap = 0.5;
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'medium', angle: 'front' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* wait(0.7);
      wrathNow(br);
      BK.eyes(br, 1);
      br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', speed: 10, aura: 1 });
      b.vfx.ring(br.chest(), 7, 0x3aff6a, 0.45);
      b.vfx.ring(br.pos.clone().add(new V3(0, 0.3, 0)), 12, 0x5aff8a, 0.6, new V3(0, 1, 0));
      for (let i = 0; i < 6; i++) b.vfx.bolt(br.chest().add(new V3(Math.sin(i * 2) * 0.9, Math.cos(i * 3) * 1, 0.3)), 1.4, 0x9affb8);
      SL.ScreenFX.flash(0.22, '#8aff9a');
      b.sfx('roar', br, { pitch: 0.55, vol: 1.4 });
      b.sfx('transformBurst', br, { vol: 1 });
      b.cameraTraumaAt(br.chest(), 0.7);
      m.music('broly_wrath', 3);
      // the lens backs off while the aura settles
      m.shot((t, out, el) => {
        // a three-quarter from a little above: the roar thrown at the sky reads, the aura round all of him
        const c = br.chest(), k = Math.min(1, (el || 0) / 1.8);
        out.pos.copy(c).addScaledVector(fw(br), 3.6 + k * 2.4).addScaledVector(sd(br), 1.8 + k * 0.8).add(new V3(0, 1.1 + k * 0.3, 0));
        out.look.copy(c).add(new V3(0, 0.55 - k * 0.2, 0));
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* wait(1.8);
      br.auraViewCap = null;

      // 6. WIDE: THE SHOCKWAVE ACROSS THE FIELD — BRACE
      br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', speed: 12, aura: 1 });
      K.place(v, BK.at(b, SPOT.vegeta[0], SPOT.vegeta[1]), 0);
      K.faceTo(v, br.pos);
      v.setState('scripted', { pose: 'idle', expression: 'shock' });
      v.auraViewCap = 0.15;
      // from the side, low: the wave crossing the ice between them, both in the frame
      const two = SL.Cinema.twoShot(br, v, { fov: 50, height: 1.6, pad: 2.4 });
      m.shot((t, out, el) => {
        out.pos.copy(two.pos).add(new V3(0, Math.min(1, (el || 0) / 2) * 0.8, 0));
        out.look.copy(two.look);
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.vfx.ring(br.pos.clone().add(new V3(0, 0.4, 0)), 38, 0x9affb8, 0.9, new V3(0, 1, 0));
      b.vfx.ring(br.pos.clone().add(new V3(0, 0.6, 0)), 26, 0x8ab8dc, 0.7, new V3(0, 1, 0));
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        b.vfx.dust(BK.at(b, Math.cos(a) * 7, Math.sin(a) * 7, 0.2), 2.2, 5, 0xc8d8e6);
      }
      b.sfx('explosionBig', null, { at: br.pos, vol: 0.9, pitch: 0.7 });
      m.objective('brace', 'Brace yourself', { icon: 'guard' });
      const brace = yield* cue('guard', 'Brace!', { auto: 3, slow: 0.3 });
      m.qteParts.push(brace.pressed ? 1 : 0.4);
      const away = v.pos.clone().sub(br.pos).setY(0).normalize();
      if (brace.pressed || skip.on) {
        m.complete('brace');
        v.setState('scripted', { pose: 'v_braced', expression: 'grit' });
        K.place(v, v.pos.clone().addScaledVector(away, 3), v.yaw);
        b.vfx.dust(v.pos.clone(), 1.2, 12, 0xa6bccf);
      } else {
        m.failObjective('brace');
        v.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 20 });
        K.place(v, v.pos.clone().addScaledVector(away, 9), v.yaw);
        v.hp = Math.max(v.hpMax * 0.5, v.hp - v.hpMax * WR.braceMiss);
        b.vfx.dust(v.pos.clone(), 1.6, 16, 0xa6bccf);
      }
      b.cameraTraumaAt(v.chest(), 0.5);
      yield* wait(0.9);

      // 7. OVER VEGETA'S SHOULDER: HE COMES — DODGE
      K.faceTo(v, br.pos);
      K.faceTo(br, v.pos);
      v.setState('scripted', { pose: 'idle', expression: 'serious' });
      br.setState('scripted', { pose: 'br_slamCrouch', expression: 'shout', speed: 14, aura: 1 });
      m.shot((t, out) => {
        out.pos.copy(v.chest()).addScaledVector(fw(v), -2.2).addScaledVector(sd(v), 0.9).add(new V3(0, 0.35, 0));
        out.look.copy(br.chest());
        out.fov = 34;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* wait(0.45);
      br.setState('scripted', { pose: 'br_flyForward', expression: 'shout', speed: 12, aura: 1 });
      const from = br.pos.clone(), dest = v.pos.clone();
      let lunge = 0;
      const charge = () => {
        if (b.disposed || lunge >= 1) return false;
        lunge = Math.min(1, lunge + 1 / 40);
        const p = from.clone().lerp(dest, lunge * 0.85);
        p.y = BK.at(b, p.x, p.z).y + Math.sin(lunge * Math.PI) * 1.2;
        br.setPosition(p);
        if (b.frame % 2 === 0) b.vfx.trail(br.chest(), 0x6aff8a, 0.5, 0.3);
        return true;
      };
      b.onTick(charge);
      b.sfx('dash', br, { pitch: 0.6 });
      m.objective('dodge', 'Dodge', { icon: 'guard' });
      const dodge = yield* cue('dodge', 'Dodge!', { auto: 2.5, slow: 0.25 });
      m.qteParts.push(dodge.pressed ? 1 : 0.4);
      lunge = 1;
      K.place(br, BK.at(b, dest.x, dest.z), br.yaw);
      if (dodge.pressed || skip.on) {
        m.complete('dodge');
        b.vfx.afterimage(v.pos, v.height, 0xff7a6a);
        b.sfx('vanish', v);
        K.place(v, BK.at(b, dest.x + sd(br).x * 6, dest.z + sd(br).z * 6), 0);
      } else {
        m.failObjective('dodge');
        v.hp = Math.max(v.hpMax * 0.45, v.hp - v.hpMax * WR.dodgeMiss);
        K.place(v, BK.at(b, dest.x + fw(br).x * 7, dest.z + fw(br).z * 7), 0);
        b.vfx.impact(v.chest(), 4, 0x9affb8);
        b.sfx('punchHeavy', v, { pitch: 0.6, vol: 1.3 });
      }
      b.stage.crater(BK.at(b, dest.x, dest.z), 3.6, 1.1, null);
      b.cameraTraumaAt(dest, 0.6);
      // the end state, watched or skipped: Broly Wrathful and standing, Vegeta facing him, the fight next
      ek = 1;
      sw = 1;
      wrathNow(br);
      BK.eyes(br, 1);
      K.faceTo(v, br.pos);
      K.faceTo(br, v.pos);
      for (const s of S.soldiers) s.setState('scripted', { pose: 'idle', expression: 'shock' });
      S.cheelai.setState('scripted', { pose: 'ch_watch', expression: 'nervous' });
      m.flags.woke = true;
      v.auraViewCap = null;
      m.endShot();
      b.skipRequested = false;
    },
  };

  /** The lines and the collar during the Wrathful fight. */
  function wrathVoices(m) {
    const b = m.battle, S = b.story;
    const offs = [
      b.on('bossSlam', (e) => {
        if (e.fighter !== S.broly) return;
        BK.iceBurst(b, e.pos, 2.4);
        const v = S.vegeta;
        if (v.pos.distanceTo(e.pos) > 9) {
          m.flags.slamsDodged = (m.flags.slamsDodged || 0) + 1;
          m.progress('leap', m.flags.slamsDodged);
        }
      }),
      b.on('brolyRead', (e) => {
        if (e.fighter !== S.broly || m.flags.wrathRead) return;
        m.flags.wrathRead = true;
        m.say('vegeta', 'Even like this... he is still reading me!', 2.4);
      }),
    ];
    const off = () => offs.forEach((o) => o());
    m.onDispose(off);
    return off;
  }

  P.rage = {
    id: 'rage',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(v, 'god');
      if (v.form.id !== 'god') K.toForm(v, 'god');
      wrathNow(br);
      BK.eyes(br, 1);
      if (!m.flags.woke) {
        K.place(br, BK.at(b, CR[0], CR[1]), 0);
        K.place(v, BK.at(b, 9, 8), 0);
      }
      v.hp = Math.max(v.hp, v.hpMax * 0.8);
      v.ki = Math.max(v.ki, v.kiMax * 0.7);
      br.hp = br.hpMax;
      br.legendaryOverride = { stageCap: 3 };
      BK.rageMeter(m, br, false);
      arm(m);
      const fight = m.storyFight({
        floors: [{ f: v, at: WR.rageFloor }, { f: br, at: 0.4 }],
        dealt: [{ f: br, mul: WR.brolyDealt1 }],
        taken: [{ f: br, mul: WR.brolyTaken1 }],
        ease: { foe: br, hero: v, below: 0.7, min: 0.5 },
      });
      wrathVoices(m);
      m.music('broly_wrath', 2);
      m.title(BK.CHAPTER, 'WRATHFUL', 'God Vegeta · his blows barely reach him now', 2.4);
      m.objective('survive', 'Fight the Wrathful Broly', { icon: 'fist' });
      m.objective('leap', 'Stay clear of his crashing leap twice', { icon: 'guard', optional: true, target: 2 });
      m.prompt('bbLeap', 'dodge', 'A red ring on the ice: he is coming down there — fly or dash clear', { always: true, when: () => br.state === 'bossSlam', until: () => (m.flags.slamsDodged || 0) >= 1 });
      let said = 0;
      let t = 0, collar = 0;
      const talk = () => {
        if (said === 0 && t > 4) {
          said = 1;
          m.say('vegeta', 'His power — it is exploding! What IS this?!', 2.6, { style: 'shout' });
        } else if (said === 1 && t > 9) {
          said = 2;
          m.say('frieza', 'Oh my. Paragus — is it supposed to do that?', 2.4);
        }
        // the collar: Paragus' remote, once — a convulsion (an opening), then it stops working
        if (!collar && t > WR.collarAt && br.state === 'free') {
          collar = 1;
          S.paragus.setState('scripted', { pose: 'pg_remote', expression: 'angry' });
          m.say('paragus', 'Broly! That is ENOUGH! Calm down!', 2.4, { style: 'shout' });
          const lamp = br.model.props && br.model.props.collarLamp;
          if (lamp) b.vfx.flash(lamp.getWorldPosition(new V3()).sub(br.object.position).add(br.pos), 0.8, 0xff3a3a, 0.3, SL.Toon.tex.glow);
          for (let i = 0; i < 4; i++) b.vfx.bolt(br.chest().add(new V3(Math.sin(i * 2) * 0.4, 0.5 + i * 0.1, Math.cos(i * 2) * 0.4)), 0.8, 0xff6a6a);
          br.setState('stagger', { frames: 70 });
          b.sfx('lightning', br, { pitch: 1.3, vol: 0.9 });
          b.emit('brolyCollar', { fighter: br });
        } else if (collar === 1 && br.state === 'free') {
          collar = 2;
          br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', speed: 12, aura: 1 });
          b.sfx('roar', br, { pitch: 0.6, vol: 1.2 });
          b.vfx.ring(br.chest(), 6, 0x3aff6a, 0.4);
          m.say('cheelai', 'He\'s not listening to him anymore...!', 2.4);
          b.after(50, () => {
            if (br.state === 'scripted') br.setState('free');
          });
        }
      };
      m.tickHooks.push(talk);
      m.lock(false);
      b.aiLocked = false;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (fight.floored(v) && t > WR.rageMin) || t > WR.rageSeconds || m.state !== 'running';
      K.unhook(m, clock);
      K.unhook(m, talk);
      if (m.state !== 'running') return;
      m.complete('survive');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry' });
      v.setState('scripted', { pose: 'v_tfClench', expression: 'grit' });
      yield* m.cine(0.4);
      m.endShot();
    },
  };

  /**
   * THE OCEAN (the owner's beat text): Vegeta strikes — Broly simply eats it, takes him by the face and drags him
   * through the ice; Vegeta tears free (mash), gathers a crimson God Ki blast between his palms and fires it point
   * blank (Blast): Broly is thrown out over the shore into the black sea. Silence — then a pillar of green light
   * stands up out of the water, and he rises in it.
   */
  P.ocean = {
    id: 'ocean',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      const G = b.stage.def.glacier;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(v, 'god');
      if (v.form.id !== 'god') K.toForm(v, 'god');
      wrathNow(br);
      BK.eyes(br, 1);
      v.controller = K.scripted();
      br.controller = K.scripted();
      b.switchPlayer(v, { force: true, quiet: true });
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
      // squared up on the field, the shore behind Broly
      const c = BK.at(b, 0, -40);
      K.place(br, c.clone(), 0);
      K.place(v, BK.at(b, c.x, c.z + 3), 0);
      K.faceTo(br, v.pos);
      K.faceTo(v, br.pos);
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      v.setState('scripted', { pose: 'punchWindR', expression: 'shout' });
      m.shot((t, out) => {
        const d = br.chest().sub(v.chest()).setY(0).normalize(), sd = new V3(d.z, 0, -d.x);
        out.pos.copy(v.chest()).addScaledVector(d, -1.8).addScaledVector(sd, 0.9).add(new V3(0, 0.3, 0));
        out.look.copy(br.chest()).add(new V3(0, 0.3, 0));
        out.fov = 40;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.objective('strike', 'Strike him', { icon: 'fist' });
      const r1 = yield* cue('heavy', 'Strike!', { auto: 2.4, slow: 0.4 });
      m.qteParts.push(r1.pressed || skip.on ? 1 : 0.5);
      m.complete('strike');
      v.setState('scripted', { pose: 'punchR', expression: 'shout', speed: 30 });
      b.vfx.impact(br.chest(), 1.4, 0xffd0d0);
      b.sfx('punchLight', br, { pitch: 0.5, vol: 0.8 });
      // nothing: he does not even move
      yield* wait(0.5);
      SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'closeup', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'What—?!', 1.2, { style: 'shout' });
      yield* wait(1.1);
      // the hand round his face, and the ice
      br.setState('scripted', { pose: 'br_liftW', expression: 'shout', aura: 1, speed: 20 });
      v.setState('scripted', { pose: 'hitHeavy', expression: 'hurt' });
      b.sfx('roar', br, { pitch: 0.6, vol: 1.2 });
      const hold = () => {
        const h = br.handPos ? br.handPos('R') : br.chest();
        v.setPosition(h.clone().add(new V3(0, -1.25, 0)).addScaledVector(br.forward, 0.35));
        v.vel.set(0, 0, 0);
        v.grounded = false;
      };
      hold();
      // the drag: along the ice toward the shore, through whatever stands there
      const dir = new V3(0.35, 0, -1).normalize();
      const from = br.pos.clone(), to = from.clone().addScaledVector(dir, 38);
      const spires = b.stage.obstacles.filter((o) => o.alive && !o.fixture && o.segs && Math.hypot(o.x - (from.x + to.x) / 2, o.z - (from.z + to.z) / 2) < 30);
      m.shot((t, out) => {
        const sd = new V3(dir.z, 0, -dir.x);
        out.pos.copy(br.chest()).addScaledVector(sd, 8).addScaledVector(dir, 3).add(new V3(0, 0.4, 0));
        out.look.copy(br.chest().lerp(v.chest(), 0.5));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 48);
        K.place(br, BK.at(b, U.lerp(from.x, to.x, k), U.lerp(from.z, to.z, k)), Math.atan2(dir.x, dir.z) + Math.PI);
        hold();
        if (n % 3 === 0) {
          BK.iceBurst(b, v.pos.clone(), 0.9);
          if (b.stage.iceCrack) b.stage.iceCrack(v.pos.clone(), 3);
        }
        for (const o of spires) if (o.alive && Math.hypot(o.x - v.pos.x, o.z - v.pos.z) < o.r + 3) {
          b.stage.destroyPillar(o);
          b.cameraTraumaAt(v.pos, 0.5);
        }
        if (n % 8 === 0) b.camera.addTrauma(0.12);
        return k >= 1 || skip.on;
      };
      K.place(br, BK.at(b, to.x, to.z), br.yaw);
      hold();
      // tear free
      m.objective('free', 'Break free', { icon: 'fist' });
      if (!skip.on) {
        const res = yield* m.struggle({ start: 0.35, drain: 0.12, duration: 2.6, label: 'BREAK FREE', override: (t) => (t > 2.4 ? 1 : null), until: (t, g) => g >= 0.99 });
        m.qteParts.push(1 - Math.min(1, res.t / 2.6) * 0.5);
      }
      m.complete('free');
      b.vfx.afterimage(v.pos, v.height, 0xff6a6a);
      b.sfx('vanish', v);
      const back = br.pos.clone().addScaledVector(br.forward, 7);
      K.hover(b, v, back, 2);
      K.faceTo(v, br.pos);
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      // the crimson cannon: gathered between his palms, fired point blank
      v.setState('scripted', { pose: 'beamChargeSide', expression: 'shout' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      let charge = 0;
      const glow = () => {
        if (b.disposed || charge < 0) return false;
        charge++;
        if (charge % 3 === 0) b.vfx.streamInward(v.handPos ? v.handPos('R') : v.chest(), 2.4, 0xff2a3a, 3, 0.14, 0.35);
        return charge < 300;
      };
      b.onTick(glow);
      b.sfx('kiCharge', v, { pitch: 0.8 });
      m.say('vegeta', 'Then BURN!', 1.4, { style: 'shout' });
      yield* wait(1.2);
      m.objective('fire', 'Fire the God Ki blast', { icon: 'blast' });
      const r2 = yield* cue('blast', 'Fire! (Blast)', { auto: 2.4, slow: 0.4 });
      m.qteParts.push(r2.pressed || skip.on ? 1 : 0.5);
      m.complete('fire');
      charge = -1;
      v.setState('scripted', { pose: 'beamFire', expression: 'shout', speed: 30 });
      const hp = v.handPos ? v.handPos('R') : v.chest();
      for (let i = 0; i <= 10; i++) b.vfx.trail(hp.clone().lerp(br.chest(), i / 10), 0xff3a4a, 0.7 - i * 0.03, 0.4);
      b.vfx.explosion(br.chest(), 2.4, 0xff3a4a, { smoke: true });
      b.vfx.ring(br.chest(), 6, 0xff5a6a, 0.5);
      b.sfx('explosionBig', br, { pitch: 0.8, vol: 1.3 });
      b.cameraTraumaAt(br.chest(), 0.9);
      // out over the shore and into the black water
      const sea = new V3(br.pos.x + dir.x * 30, 0, G.channel.z);
      const p0 = br.pos.clone();
      br.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 16 });
      m.shot((t, out) => {
        out.pos.copy(v.chest()).addScaledVector(dir, -3).add(new V3(2.4, 1.6, 0));
        out.look.copy(br.chest());
        out.fov = 54;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 50);
        const p = p0.clone().lerp(sea, k);
        p.y = U.lerp(p0.y + 1, G.channel.level - 4, k * k) + Math.sin(k * Math.PI) * 12;
        br.setPosition(p);
        br.grounded = false;
        if (n % 2 === 0) b.vfx.trail(br.chest(), 0xff6a6a, 0.6, 0.4);
        return k >= 1 || skip.on;
      };
      const splash = new V3(sea.x, G.channel.level, sea.z);
      br.setPosition(new V3(sea.x, G.channel.floor + 0.5, sea.z));
      br.setHidden(true);
      for (let i = 0; i < 40; i++) {
        const a = i * 2.39996;
        b.vfx.specks.emit(splash.x + Math.cos(a) * 0.6, splash.y + 0.2, splash.z + Math.sin(a) * 0.6, Math.cos(a) * (2 + (i % 5)), 8 + (i % 7), Math.sin(a) * (2 + (i % 5)), 0.85, 0.92, 1, 1, 0.08, 1.6, { gravity: 9 });
      }
      b.vfx.ring(splash.clone().add(new V3(0, 0.1, 0)), 10, 0xc8e4ff, 0.8, new V3(0, 1, 0));
      b.sfx('explosionBig', null, { at: splash, pitch: 0.6, vol: 1 });
      m.say('vegeta', 'Stay down there.', 1.8);
      yield* wait(1.4);
      // the silence over the dark water
      SL.Music.stop(0.6);
      m.shot((t, out) => {
        out.pos.copy(splash).add(new V3(dir.z * 26, 6, 22));
        out.look.copy(splash).add(new V3(0, 4, 0));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let bub = 0;
      b.onTick(() => {
        if (b.disposed || ++bub > 100) return false;
        if (bub % 6 === 0) b.vfx.specks.emit(splash.x + Math.sin(bub) * 2, splash.y, splash.z + Math.cos(bub) * 2, 0, 1.2, 0, 0.9, 0.95, 1, 0.8, 0.06, 0.8, {});
        return true;
      });
      b.sfx('rumble', null, { at: splash, vol: 0.8, pitch: 0.5 });
      yield* wait(1.6);
      // the pillar of green light, and him in it
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 140, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x3aff6a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      pillar.position.copy(splash).add(new V3(0, 70, 0));
      b.scene.add(pillar);
      let pk = 0;
      const pill = () => {
        if (b.disposed || !pillar.parent) return false;
        pk++;
        pillar.material.opacity = pk < 30 ? (pk / 30) * 0.55 : Math.max(0, 0.55 - (pk - 150) / 60);
        pillar.scale.set(1 + Math.sin(pk * 0.3) * 0.05, 1, 1 + Math.cos(pk * 0.3) * 0.05);
        if (pk % 5 === 0) b.vfx.ring(splash.clone().add(new V3(0, 0.3 + (pk % 20), 0)), 7, 0x8affa8, 0.4, new V3(0, 1, 0));
        if (pk > 210) {
          b.scene.remove(pillar);
          pillar.geometry.dispose();
          pillar.material.dispose();
          return false;
        }
        return true;
      };
      b.onTick(pill);
      m.onDispose(() => {
        if (pillar.parent) b.scene.remove(pillar);
      });
      SL.ScreenFX.flash(0.18, '#8aff9a');
      b.sfx('roar', null, { at: splash, pitch: 0.5, vol: 1.4 });
      b.sfx('transformBurst', null, { at: splash, vol: 0.9 });
      b.cameraTraumaAt(splash, 0.8);
      for (let i = 0; i < 30; i++) b.vfx.specks.emit(splash.x, splash.y + 0.5, splash.z, Math.sin(i) * 3, 12 + (i % 6), Math.cos(i) * 3, 0.8, 1, 0.85, 1, 0.1, 1.8, { gravity: 7 });
      br.setHidden(false);
      br.setState('scripted', { pose: 'br_tfRoar', expression: 'shout', aura: 1 });
      m.music('broly_wrath', 3);
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 60);
        br.setPosition(new V3(splash.x, U.lerp(G.channel.floor, splash.y + 7, U.easeOutCubic ? U.easeOutCubic(k) : k), splash.z));
        return k >= 1 || skip.on;
      };
      K.faceTo(br, v.pos);
      SL.Cinema.shotOn(m, { goku: S.gokuCoat }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'He came back up... and he\'s even stronger than before!', 2.6);
      yield* wait(2.6);
      // he comes down on the field across from the prince
      b.vfx.afterimage(br.pos, br.height, 0x6aff8a);
      K.place(br, BK.at(b, v.pos.x + dir.x * 10, v.pos.z + dir.z * 10), 0);
      K.place(v, BK.at(b, v.pos.x, v.pos.z), 0);
      K.faceTo(br, v.pos);
      K.faceTo(v, br.pos);
      BK.iceBurst(b, br.pos.clone(), 1.6);
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
      v.setState('scripted', { pose: 'v_tfClench', expression: 'grit' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegeta', 'Don\'t... you... DARE look down on me! I am not done yet!', 3.2, { style: 'shout' });
      yield* wait(3.3);
      // the end state, watched or skipped
      br.setHidden(false);
      if (br.pos.y < BK.at(b, br.pos.x, br.pos.z).y - 1 || Math.abs(br.pos.z - G.channel.z) < G.channel.half + 2) K.place(br, BK.at(b, 0, -30), 0);
      K.faceTo(br, v.pos);
      m.endShot();
      b.skipRequested = false;
    },
  };

  /** SUPER SAIYAN BLUE: three cuts — the clenched face, the gold going blue round him, the reveal. */
  function blueFilm(m, v) {
    const b = m.battle;
    const fw = () => v.forward.clone().setY(0).normalize();
    const sd = () => {
      const d = fw();
      return new V3(d.z, 0, -d.x);
    };
    return {
      cleanup() {
        v.auraViewCap = null;
      },
      changeShots: [
        { at: 0, free: true, shot: (t, out) => {
          const h = v.headPos();
          out.pos.copy(h).addScaledVector(fw(), 0.9).addScaledVector(sd(), 0.25).add(new V3(0, -0.15, 0));
          out.look.copy(h).add(new V3(0, 0.05, 0));
          out.fov = 38;
        } },
        { at: 0.4, shot: (t, out) => {
          const c = v.chest();
          const a = v.yaw - 0.6 - t * 0.5;
          out.pos.set(c.x + Math.sin(a) * 4, c.y - 0.4, c.z + Math.cos(a) * 4);
          out.look.copy(c).add(new V3(0, 0.4, 0));
          out.fov = 46;
        } },
        { at: 0.8, free: true, shot: (t, out) => {
          const h = v.headPos();
          out.pos.copy(h).addScaledVector(fw(), 1.4).add(new V3(0, 0.3, 0));
          out.look.copy(h).add(new V3(0, 0.2, 0));
          out.fov = 40;
        } },
      ],
      onFrame(fr, burstAt) {
        v.auraViewCap = fr < burstAt ? 0.45 : null;
        if (fr >= 40 && fr % 4 === 0) b.vfx.streamInward(v.chest(), 3, 0x4ab8ff, 3, 0.14, 0.4);
        if (fr === burstAt) {
          b.vfx.ring(v.pos.clone().add(new V3(0, 0.2, 0)), 10, 0x3aa8ff, 0.6, new V3(0, 1, 0));
          BK.iceBurst(b, v.pos.clone(), 1.6);
        }
      },
    };
  }

  P.blue = {
    id: 'blue',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      wrathNow(br);
      BK.eyes(br, 1);
      BK.give(v, 'god');
      if (v.form.id !== 'god') K.toForm(v, 'god');
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 0.6 });
      v.ki = v.kiMax;
      v.setState('free');
      b.switchPlayer(v, { force: true, quiet: true });
      m.objective('blue', 'Super Saiyan Blue: hold Charge', { icon: 'transform' });
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'medium', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      const film = blueFilm(m, v);
      // the hold is shot close: the charge aura thinned so the face and the hair read (no white-out)
      v.auraViewCap = 0.3;
      yield* C.ascend(m, {
        fighter: v, form: 'blue', witness: br, seconds: WR.blueHold,
        label: 'Hold Charge — Super Saiyan Blue', meter: 'SUPER SAIYAN BLUE', music: 2, dust: false,
        transform: film,
      });
      film.cleanup();
      m.complete('blue');
      m.endShot();
    },
  };

  P.fury = {
    id: 'fury',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      stage(m);
      BK.give(v, ['god', 'blue']);
      K.toForm(v, 'blue');
      wrathNow(br);
      BK.eyes(br, 1);
      v.hp = Math.max(v.hp, v.hpMax * 0.75);
      v.ki = Math.max(v.ki, v.kiMax * 0.8);
      br.hp = Math.max(br.hp, br.hpMax * 0.8);
      // he starts over against the Blue — and climbs faster than before
      br.mech.xp = 0;
      br.mech.stage = 0;
      br.legendaryOverride = { stageCap: 3, gain: 1.8 };
      arm(m);
      const fight = m.storyFight({
        floors: [{ f: v, at: WR.furyFloor }, { f: br, at: 0.35 }],
        dealt: [{ f: br, mul: WR.brolyDealt2 }],
        taken: [{ f: br, mul: WR.brolyTaken2 }],
        ease: { foe: br, hero: v, below: 0.6, min: 0.5 },
      });
      wrathVoices(m);
      const offS = b.on('brolyStage', (e) => {
        if (e.fighter !== br) return;
        m.flags.furyStage = e.stage;
        m.flags.furyStageAt = b.frame;
        if (e.stage === 2) m.say('goku', 'Vegeta, watch out — he\'s matching the Blue already!', 2.6);
        if (e.stage === 3) {
          m.say('vegeta', 'Impossible... he is getting stronger in the middle of the fight!', 2.8, { style: 'shout' });
          // SURPASSING: he stops holding anything back
          br.legendaryOverride = Object.assign({}, br.legendaryOverride, { learnAt: 1 });
          br.damageDealtMul = (br.damageDealtMul || 1) * 1.25;
        }
      });
      m.onDispose(offS);
      m.music('ssj_blue', 3);
      m.title(BK.CHAPTER, 'BLUE', 'Super Saiyan Blue Vegeta', 2.2);
      m.objective('fury', 'Hold him off', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (fight.floored(v) && t > WR.furyMin) || t > WR.furySeconds || (m.flags.furyStage >= 3 && b.frame - m.flags.furyStageAt > WR.afterSurpass * 60) || m.state !== 'running';
      K.unhook(m, clock);
      offS();
      if (m.state !== 'running') return;
      m.complete('fury');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
    },
  };

  /** GALICK GUN against the GIGANTIC ROAR: the player fires, he answers, they meet. */
  P.clash = {
    id: 'clash',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      BK.give(v, ['god', 'blue']);
      if (v.form.id !== 'blue') K.toForm(v, 'blue');
      wrathNow(br);
      // apart, in the air, square to each other
      const c = BK.at(b, 0, 0);
      K.hover(b, v, c.clone().add(new V3(8, 0, 4)), 5);
      K.hover(b, br, c.clone().add(new V3(-8, 0, -4)), 5);
      K.faceTo(v, br.pos);
      K.faceTo(br, v.pos);
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_roarCharge', expression: 'shout', aura: 1 });
      v.ki = v.kiMax;
      v.target = br;
      br.target = v;
      b.switchPlayer(v, { force: true, quiet: true });
      v.setState('free');
      b.clash.maxSeconds = WR.clashSeconds;
      v.lockedSlots = { special2: true, ultimate: true, transform: true };
      const lim = Object.assign({}, SL.Mission.ALL_OFF);
      for (const k of ['s1', 's1Held', 'light', 'heavy', 'blast']) delete lim[k];
      m.limits(lim);
      m.music('broly_wrath', 3);
      m.objective('galick', 'GALICK GUN: hold Special 1, release — then mash', { icon: 'beam' });
      m.prompt('bbGalick', 'special1', 'Galick Gun — hold, release', { required: true, always: true, when: () => v.state === 'free' });
      m.shot((t, out) => {
        const mid = v.chest().lerp(br.chest(), 0.5);
        const side = new V3(v.forward.z, 0, -v.forward.x);
        out.pos.copy(mid).addScaledVector(side, 16).add(new V3(0, 2.4, 0));
        out.look.copy(mid);
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: v });
      m.say('vegeta', 'Take THIS! GALICK...', 2);
      let fired = false, waited = 0, result = null;
      const offE = b.on('clashEnd', (e) => {
        result = e.winner === v ? 'won' : e.winner === br ? 'lost' : 'draw';
      });
      m.onDispose(offE);
      const spec = br.resolveSpec(br.specFor('ultimate'));
      const hook = () => {
        if (b.inputLocked && !b.clash.active) return;
        waited += 1 / 60;
        if (b.frame % 3 === 0) b.vfx.streamInward(br.chest(), 2.8, 0x5aff6a, 2, 0.16, 0.35);
        // his answer leaves the moment the Galick Gun does: they meet in the middle
        if (!fired && (b.projectiles.beams.some((bm) => bm.owner === v && !bm.done) || waited >= 9)) {
          fired = true;
          br.setState('scripted', { pose: 'br_roarFire', expression: 'shout', aura: 1 });
          b.projectiles.spawnBeam(br, spec, 1);
          b.sfx('beamFire', br, { pitch: 0.7 });
          b.sfx('roar', br, { pitch: 0.6 });
        }
      };
      m.tickHooks.push(hook);
      m.lock(false);
      b.aiLocked = true;
      yield () => result !== null || (fired && !b.clash.active && waited > 11);
      K.unhook(m, hook);
      offE();
      m.limits(null);
      v.lockedSlots = {};
      b.clash.maxSeconds = 7;
      m.flags.clash = result || 'hit';
      if (result === 'won') m.complete('galick');
      else m.failObjective('galick');
      m.qteParts.push(result === 'won' ? 1 : 0.3);
      yield 0.8;
      m.lock(true);
      K.clearCombat(b);
      m.endShot();
    },
  };

  P.end = {
    id: 'end',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, br = S.broly, g = S.gokuCoat;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      BK.give(v, ['god', 'blue']);
      if (v.form.id !== 'blue') K.toForm(v, 'blue');
      wrathNow(br);
      v.controller = K.scripted();
      br.controller = K.scripted();
      const c = BK.at(b, 0, 0);
      if (m.flags.clash === 'won') {
        // he walks out of the beam that should have finished him
        K.place(br, c.clone().add(new V3(-6, 0, -3)), 0);
        K.place(v, c.clone().add(new V3(6, 0, 3)), 0);
        K.faceTo(br, v.pos);
        K.faceTo(v, br.pos);
        for (let i = 0; i < 10; i++) b.vfx.smoke.emit(br.pos.x + Math.sin(i) * 1.5, br.pos.y + 1, br.pos.z + Math.cos(i) * 1.5, 0, 1, 0, 0.7, 0.62, 0.8, 0.7, 2, 2.4, { grow: 1.6 });
        br.setState('scripted', { pose: 'bb_walk', expression: 'angry', speed: 4, aura: 1 });
        v.setState('scripted', { pose: 'idle', expression: 'shock', aura: 0.2 });
        SL.Cinema.shotOn(m, { broly: br }, { subject: 'broly', focus: 'full', angle: 'low' }, 2.6, { cut: true, blendIn: 0, hold: true });
        m.say('vegeta', 'He walked... straight through it?!', 2.4, { style: 'shout' });
        yield* m.cine(2.6);
      } else {
        K.place(v, c.clone().add(new V3(6, 0, 3)), 0);
        K.place(br, c.clone().add(new V3(-5, 0, -2)), 0);
        K.faceTo(br, v.pos);
        K.faceTo(v, br.pos);
        v.setState('scripted', { pose: 'v_kneelShoulder', expression: 'hurt', aura: 0 });
        br.setState('scripted', { pose: 'br_wrathIdle', expression: 'angry', aura: 1 });
        SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'high' }, 2.4, { cut: true, blendIn: 0, hold: true });
        m.say('vegeta', 'Ngh... this... this can\'t be...', 2.2);
        yield* m.cine(2.4);
      }
      // the big hand round him, and the ice
      br.setState('scripted', { pose: 'br_liftW', expression: 'shout', aura: 1 });
      v.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', aura: 0 });
      K.place(v, br.pos.clone().addScaledVector(br.forward, 1.1).add(new V3(0, 1.6, 0)), v.yaw);
      v.grounded = false;
      m.shot((t, out) => {
        const cc = br.chest();
        out.pos.copy(cc).addScaledVector(br.forward, 5).add(new V3(2, -0.8, 0));
        out.look.copy(cc).add(new V3(0, 0.8, 0));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.sfx('roar', br, { pitch: 0.6, vol: 1.2 });
      yield* m.cine(0.9);
      br.setState('scripted', { pose: 'br_slam', expression: 'shout', aura: 1 });
      const hit = br.pos.clone().addScaledVector(br.forward, 1.6);
      K.place(v, BK.at(b, hit.x, hit.z), v.yaw);
      // beaten out of the Blue
      if (v.formIndex !== 0) v.applyForm(0);
      v.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
      b.stage.crater(BK.at(b, hit.x, hit.z), 4, 1.4, null);
      BK.iceBurst(b, hit, 2.2);
      b.sfx('groundImpact', null, { at: hit, vol: 1.5 });
      b.cameraTraumaAt(hit, 0.8);
      v.hp = Math.max(1, v.hpMax * 0.15);
      yield* m.cine(1.2);
      // and Goku's coat comes off
      K.place(g, BK.at(b, hit.x + 9, hit.z - 6), 0);
      K.faceTo(g, br.pos);
      g.setState('scripted', { pose: 'v_coatOff', expression: 'serious', speed: 10 });
      SL.Cinema.shotOn(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 3, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Okay, Vegeta. Switch with me — my turn.', 2.8);
      b.sfx('clothTear', g, { pitch: 0.7, vol: 0.5 });
      yield* m.cine(3);
      m.endShot();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'THE WRATH OF A SAIYAN', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'bb_wrath',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'Wrath',
    subtitle: "Part 3 · A Saiyan's Fury (II) · the glacier",
    character: 'vegeta',
    stage: 'broly_glacier',
    parTime: 480,
    lockForms: BK.LOCKS,
    qteLabel: 'The wrath',
    rules: { allowTransform: true, allowUltimates: true },
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' } },
    blurb: 'Driven into the ice, Broly gets up — and something that was never meant to wake does. Vegeta goes Blue and it is still not enough.',
    rewards: ['Broly (playable)', 'Broly: Wrathful', 'Vegeta: Super Saiyan Blue'],
    setup,
    phases: [P.wake, P.rage, P.ocean, P.blue, P.fury, P.clash, P.end],
  };

  SL.data.bbWrath = { WR };
  SL.data.missions[def.id] = def;
})();
