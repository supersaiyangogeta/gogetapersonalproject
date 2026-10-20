/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 7: "The Birth of Gogeta" (Piccolo's plateau; the lava wasteland)
 *
 *   LESSON *   (demonstration)   Piccolo shows them the Fusion Dance, step by step, and makes them watch twice.
 *   FIRST *    (rhythm)          the first try (Light on every beat): matched steps — and Vegeta's finger bent on
 *                                the last one. Out of the light drops VEKU, round and wheezing. Piccolo: "No."
 *                                Thirty minutes until it wears off.
 *   FRIEZA *   (play, as Frieza) meanwhile, on the lava: Super Saiyan Broly has found the only target left. Play
 *                                FRIEZA and stay alive; half-way, hold Charge for GOLDEN FRIEZA — it does not help
 *                                much. The hour is told by the clock on the HUD, not waited out.
 *   SECOND     (rhythm)          the second try: both fingers right, the timing half a beat off — a tall, thin,
 *                                coughing Veku. Another thirty minutes.
 *   PERFECT *  (rhythm, judged)  the third: in step, mirror-perfect (a miss means "again"; nobody is stuck: Piccolo
 *                                slows the count). The light goes up into the sky — GOGETA. "Call me Gogeta." Two
 *                                fingers to his brow: Instant Transmission, to Frieza's fading ki.
 *   AFTER                        the title; next: "The Ultimate Fusion".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;
  const C = SL.data.cinematics;

  const FU = { beat: 0.82, window: 0.2, perfect: 0.075, pass: 0.6, tries: 3, assistWindow: 0.32, friezaSeconds: 36, goldenAt: 14, goldenHold: 2.6, brolyDealt: 0.55 };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  function setup(battle) {
    const b = battle;
    const at = (x, z) => BK.at(b, x, z);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(-1.7, 6), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(1.7, 6), startKi: 100 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(0, 0), startKi: 0 });
    const broly = b.spawn({ charId: 'broly', team: 1, pos: at(60, 60), startKi: 100 });
    const frieza = b.spawn({ charId: 'frieza', team: 0, pos: at(64, 64), startKi: 100 });
    K.toForm(frieza, 'final');
    K.watcher(piccolo, 'armsCrossed', 'serious');
    K.watcher(vegeta, 'armsCrossed', 'angry');
    K.watcher(broly, 'br_lsIdle', 'shout');
    K.watcher(frieza, 'idle', 'nervous');
    for (const f of [broly, frieza]) f.setHidden(true);
    for (const f of [goku, vegeta, broly, frieza]) f.cannotDie = true;
    BK.give(broly, ['wrath', 'ssj']);
    K.toForm(broly, 'ssj');
    b.story = { goku, vegeta, piccolo, broly, frieza, fusion: null, fused: null };
  }

  /** The two of them three paces apart, side by side, facing Piccolo and the lens. */
  function lineUp(m, gap = 1.7) {
    const b = m.battle, S = b.story;
    const at = (dx) => BK.at(b, dx, 6);
    K.place(S.goku, at(-gap), Math.PI);
    K.place(S.vegeta, at(gap), Math.PI);
    for (const f of [S.goku, S.vegeta]) {
      f.setHidden(false);
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
      f.yaw = f.prevYaw = Math.PI;
      if (f.formIndex !== 0) f.applyForm(0);
    }
    S.goku.setState('scripted', { pose: 'fd_stepBR', expression: 'grin' });
    S.vegeta.setState('scripted', { pose: 'fd_stepB', expression: 'angry' });
    K.place(S.piccolo, BK.at(b, 0, 0), 0);
    K.faceTo(S.piccolo, S.goku.pos.clone().lerp(S.vegeta.pos, 0.5));
    return at;
  }

  /** The dance on the beat. opts.bent: Vegeta's last step with the finger bent; opts.late: Vegeta half a beat behind. */
  function* dance(m, opts = {}) {
    const b = m.battle, S = b.story;
    const at = lineUp(m);
    // the player's own hands on the beat (the line-up scripted both bodies)
    b.switchPlayer(S.goku, { force: true, quiet: true });
    const STEPS = SL.data.fusionDance.STEPS;
    m.shot((t, out, el) => {
      const mid = S.goku.chest().lerp(S.vegeta.chest(), 0.5);
      out.pos.set(mid.x + Math.sin(el * 0.08) * 0.4, mid.y + 0.1, mid.z - 5.2);
      out.look.copy(mid).add(new V3(0, -0.1, 0));
      out.fov = 46;
    }, 999, { hold: true, cut: true, blendIn: 0 });
    m.music('fusion_theme', 1);
    const res = yield* m.rhythm(STEPS.map((s) => ({ key: 'light', label: s.label })), {
      beat: FU.beat, window: opts.window || FU.window, perfect: FU.perfect, lead: 1,
      onBeat: (i) => {
        const st = STEPS[i];
        const ha = st.id === 'ha';
        S.goku.setState('scripted', { pose: st.pose + 'R', expression: ha ? 'shout' : 'grin', speed: 18 });
        const vegPose = ha && opts.bent ? 'fd_haBent' : st.pose;
        if (opts.late && i > 0) b.after(Math.round(FU.beat * 30), () => S.vegeta.setState('scripted', { pose: vegPose, expression: ha ? 'shout' : 'angry', speed: 18 }));
        else S.vegeta.setState('scripted', { pose: vegPose, expression: ha ? 'shout' : 'angry', speed: 18 });
        for (const f of [S.goku, S.vegeta]) b.vfx.ring(f.chest(), 1.4, 0xfff0b0, 0.25);
        if (st.id.startsWith('step')) {
          const k = Number(st.id.slice(4));
          const gap = U.lerp(1.7, 0.55, k / 3);
          K.place(S.goku, at(-gap), Math.PI);
          K.place(S.vegeta, at(gap), Math.PI);
        }
        if (st.call) {
          m.say('goku', st.call, 0.8, { style: 'shout' });
          b.sfx('swing', S.goku, { pitch: 1.1, vol: 0.7 });
        }
      },
    });
    return res;
  }

  /** The light where they met, and what drops out of it (id: the fusion's character). */
  function fuse(m, id) {
    const b = m.battle, S = b.story;
    const mid = S.goku.pos.clone().lerp(S.vegeta.pos, 0.5);
    b.vfx.flash(mid.clone().add(new V3(0, 0.9, 0)), 5, 0xffffff, 0.6, SL.Toon.tex.glow);
    b.vfx.ring(mid.clone().add(new V3(0, 0.9, 0)), 7, 0xfff4d8, 0.7);
    SL.ScreenFX.flash(0.5, '#fff0d8');
    b.sfx('transformBurst', S.vegeta, { pitch: 1.1 });
    const h = SL.Fusion.fuse(b, S.goku, S.vegeta, id, { silent: true, hpFrac: 1 });
    S.fusion = h;
    S.fused = h.fused;
    S.fused.controller = K.scripted();
    S.fused.untargetable = S.fused.intangible = true;
    K.faceTo(S.fused, S.piccolo.pos);
    b.emit('fusionDance', { id, fused: S.fused });
    return S.fused;
  }

  /** Time passes: the fusion wears off (a pop), and a card says how long it took. */
  function* timeUp(m, card) {
    const b = m.battle, S = b.story;
    m.fade('black', 0.6);
    yield* m.cine(0.7);
    if (S.fusion && S.fusion.active) SL.Fusion.defuse(b, S.fusion, { to: S.goku, silent: true });
    S.fusion = null;
    S.fused = null;
    lineUp(m);
    S.goku.setState('scripted', { pose: 'exhausted', expression: 'exhausted' });
    S.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'angry' });
    m.title('', card, 'The fusion wears off', 2.4);
    yield* m.cine(2.6);
    m.fade('clear', 0.6);
  }

  const P = {};

  P.lesson = {
    id: 'lesson',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, pc = S.piccolo;
      m.lock(true);
      m.clearObjectives();
      if (b.stage.def.id !== 'plains') {
        b.changeStage('plains');
        m.endShot();
      }
      lineUp(m);
      S.goku.setState('scripted', { pose: 'idle', expression: 'serious' });
      S.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'angry' });
      K.faceTo(S.goku, pc.pos);
      K.faceTo(S.vegeta, pc.pos);
      m.title(BK.CHAPTER, 'THE BIRTH OF GOGETA', 'A plateau far from the fight', 3);
      m.music('piccolo_theme', 1);
      yield* SL.Cinema.play(m, 'bb_fu_lesson');
      // the demonstration: every step, Piccolo doing it, its name said
      const STEPS = SL.data.fusionDance.STEPS;
      m.shot((t, out) => {
        out.pos.copy(pc.chest()).add(new V3(0, 0.2, 5.4));
        out.look.copy(pc.chest());
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0, subject: pc });
      K.faceTo(pc, pc.pos.clone().add(new V3(0, 0, 10)));
      for (const st of STEPS) {
        pc.setState('scripted', { pose: st.pose, expression: 'serious', speed: 14 });
        m.say('piccolo', st.call || st.label, 0.9);
        yield* m.cine(FU.beat * 1.15);
      }
      pc.setState('scripted', { pose: 'armsCrossed', expression: 'serious' });
      K.faceTo(pc, S.goku.pos.clone().lerp(S.vegeta.pos, 0.5));
      SL.Cinema.shotOn(m, { piccolo: pc }, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('piccolo', 'The same height, the same power, the fingers touching exactly. Now — you two.', 3.6);
      yield* m.cine(3.6);
      m.endShot();
    },
  };

  P.first = {
    id: 'first',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      b.switchPlayer(S.goku, { force: true, quiet: true });
      m.objective('dance', 'The Fusion Dance: press Light on every beat', { icon: 'transform' });
      m.say('vegeta', 'If you EVER tell anyone about this, Kakarot...', 2.2);
      yield* m.cine(1.2);
      const res = yield* dance(m, { bent: true });
      m.qteParts.push(res.score);
      m.complete('dance');
      // the finger: close on their hands — straight, and bent
      const gh = S.goku.handPos('L').lerp(S.goku.handPos('R'), 0.5), vh = S.vegeta.handPos('L').lerp(S.vegeta.handPos('R'), 0.5);
      const mid = gh.clone().lerp(vh, 0.5);
      m.shot((t, out, el) => {
        out.pos.set(mid.x + 0.25, mid.y + 0.15, mid.z - 1.5 + el * 0.12);
        out.look.copy(mid);
        out.fov = 34;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      b.slowmo(0.3, 1.4);
      b.vfx.flash(vh, 0.6, 0xff6a6a, 0.5, SL.Toon.tex.glow);
      m.say('piccolo', 'Wait — Vegeta, your finger!', 1.6, { style: 'shout' });
      yield* m.cine(1.6);
      // Veku drops out of the light
      const vk = fuse(m, 'veku');
      const top = vk.pos.clone().add(new V3(0, 2, 0)), floor = BK.at(b, vk.pos.x, vk.pos.z);
      vk.setState('scripted', { pose: 'vk_stumble', expression: 'shock', speed: 10 });
      m.shot((t, out) => {
        out.pos.copy(floor).add(new V3(4.5, 1.8, -5));
        out.look.copy(vk.pos).add(new V3(0, 0.4, 0));
        out.fov = 50;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 26);
        const p = top.clone().lerp(floor, k * k);
        if (n > 26) p.y = floor.y + Math.sin(Math.min(1, (n - 26) / 16) * Math.PI) * 0.7;
        vk.setPosition(p);
        if (n === 26) {
          b.sfx('boing', vk, { pitch: 0.8 });
          b.vfx.dust(floor.clone(), 1.4, 10, b.stage.def.terrain.sand);
        }
        return n >= 44;
      };
      K.place(vk, floor, vk.yaw);
      yield* SL.Cinema.play(m, 'bb_fu_veku');
      yield* timeUp(m, 'THIRTY MINUTES LATER');
      m.endShot();
    },
  };

  /** Meanwhile, on the lava: Frieza alone with the monster. Played AS Frieza; half-way, Golden Frieza. */
  P.frieza = {
    id: 'frieza',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, br = S.broly;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (S.fusion && S.fusion.active) SL.Fusion.defuse(b, S.fusion, { to: S.goku, silent: true });
      S.fusion = null;
      m.fade('black', 0.4);
      yield* m.cine(0.45);
      for (const f of [S.goku, S.vegeta, S.piccolo]) f.setHidden(true);
      b.changeStage('broly_lava');
      m.endShot();
      BK.lavaReact(m);
      fz.setHidden(false);
      br.setHidden(false);
      K.toForm(fz, 'final');
      K.toForm(br, 'ssj');
      K.place(fz, BK.at(b, 6, -6), 0);
      K.place(br, BK.at(b, -6, 6), 0);
      K.faceTo(fz, br.pos);
      K.faceTo(br, fz.pos);
      fz.hp = fz.hpMax;
      fz.ki = fz.kiMax;
      fz.untargetable = fz.intangible = false;
      br.untargetable = br.intangible = false;
      b.switchPlayer(fz, { force: true, quiet: true });
      br.controller = cpu(b);
      br.target = fz;
      fz.target = br;
      br.legendaryOverride = { stageCap: 3, learnAt: 2 };
      fz.setState('free');
      br.setState('free');
      m.fade('clear', 0.5);
      m.title(BK.CHAPTER, 'MEANWHILE', 'Frieza · alone with the monster he made', 2.8);
      m.music('broly_wrath', 3);
      const fight = m.storyFight({ floors: [{ f: fz, at: 0.25 }], dealt: [{ f: br, mul: FU.brolyDealt }] });
      m.objective('live', 'Stay alive until the fusion comes', { icon: 'clock' });
      const clk = SL.data.frKit.clock(m, { seconds: FU.friezaSeconds, storyMinutes: 60, label: 'THE HOUR', color: '#ffd23a' });
      m.lock(false);
      b.aiLocked = false;
      yield () => clk.left <= FU.friezaSeconds - FU.goldenAt || m.state !== 'running';
      if (m.state !== 'running') return clk.stop();
      // GOLDEN FRIEZA: hold Charge
      m.lock(true);
      K.clearCombat(b);
      br.controller = K.scripted();
      br.setState('scripted', { pose: 'br_lsIdle', expression: 'shout', aura: 1 });
      SL.Cinema.shotOn(m, { frieza: fz }, { subject: 'frieza', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Enough of this! You will see my true golden form!', 2.6, { style: 'shout' });
      m.objective('golden', 'Golden Frieza: hold Charge', { icon: 'transform' });
      BK.give(fz, 'golden');
      yield* C.ascend(m, { fighter: fz, form: 'golden', witness: br, seconds: FU.goldenHold, label: 'Hold Charge — Golden Frieza', meter: 'GOLDEN', music: 3, dust: true });
      m.complete('golden');
      m.endShot();
      br.controller = cpu(b);
      br.target = fz;
      fz.target = br;
      b.switchPlayer(fz, { force: true, quiet: true });
      fz.setState('free');
      br.setState('free');
      m.say('frieza', 'This... this is still not enough?!', 2.2);
      m.lock(false);
      b.aiLocked = false;
      yield () => clk.done || m.state !== 'running';
      clk.stop();
      fight.off();
      if (m.state !== 'running') return;
      m.complete('live');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      // the mountain wall, and the lava
      fz.controller = K.scripted();
      br.controller = K.scripted();
      K.place(br, BK.at(b, fz.pos.x - 2, fz.pos.z - 1.2), 0);
      K.faceTo(br, fz.pos);
      br.setState('scripted', { pose: 'br_hammerW', expression: 'shout', aura: 1 });
      fz.setState('scripted', { pose: 'fz_tremble', expression: 'shock' });
      SL.Cinema.shotOn(m, { broly: br, frieza: fz }, { subject: 'frieza', with: 'broly', focus: 'full' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(0.6);
      br.setState('scripted', { pose: 'br_hammer', expression: 'shout', aura: 1, speed: 30 });
      const hit = fz.pos.clone();
      fz.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      b.stage.crater(BK.at(b, hit.x, hit.z), 5, 1.6, null);
      if (b.stage.lavaGeyser) b.stage.lavaGeyser(hit.clone(), 10);
      b.sfx('groundImpact', null, { at: hit, vol: 1.5 });
      b.cameraTraumaAt(hit, 0.9);
      yield* m.cine(1.2);
      SL.Cinema.shotOn(m, { frieza: fz }, { subject: 'frieza', focus: 'closeup', angle: 'high' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Hurry up... you wretched monkeys...!', 2.4, { style: 'quiet' });
      yield* m.cine(2.4);
      m.endShot();
      // back to the plateau
      m.fade('black', 0.4);
      yield* m.cine(0.45);
      for (const f of [fz, br]) f.setHidden(true);
      b.changeStage('plains');
      m.endShot();
      S.piccolo.setHidden(false);
      lineUp(m);
      m.fade('clear', 0.5);
    },
  };

  P.second = {
    id: 'second',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      if (b.stage.def.id !== 'plains') {
        b.changeStage('plains');
        m.endShot();
      }
      for (const f of [S.frieza, S.broly]) f.setHidden(true);
      S.piccolo.setHidden(false);
      b.switchPlayer(S.goku, { force: true, quiet: true });
      m.objective('dance', 'The second try: press Light on every beat', { icon: 'transform' });
      m.say('piccolo', 'Again. And this time, Vegeta — the finger.', 2.2);
      yield* m.cine(1.4);
      const res = yield* dance(m, { late: true });
      m.qteParts.push(res.score);
      m.complete('dance');
      m.say('piccolo', 'No — Vegeta, you\'re late!', 1.4, { style: 'shout' });
      yield* m.cine(0.8);
      const vk = fuse(m, 'veku_thin');
      vk.setState('scripted', { pose: 'vk_thinWobble', expression: 'hurt', speed: 6 });
      m.shot((t, out) => {
        out.pos.copy(vk.pos).add(new V3(3.2, 1.6, -4.4));
        out.look.copy(vk.chest()).add(new V3(0, 0.3, 0));
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* SL.Cinema.play(m, 'bb_fu_thin');
      yield* timeUp(m, 'ANOTHER THIRTY MINUTES');
      m.endShot();
    },
  };

  P.perfect = {
    id: 'perfect',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      if (b.stage.def.id !== 'plains') {
        b.changeStage('plains');
        m.endShot();
      }
      if (S.fusion && S.fusion.active) SL.Fusion.defuse(b, S.fusion, { to: S.goku, silent: true });
      S.fusion = null;
      for (const f of [S.frieza, S.broly]) f.setHidden(true);
      S.piccolo.setHidden(false);
      b.switchPlayer(S.goku, { force: true, quiet: true });
      m.objective('dance', 'The last try: in step, mirror-perfect — Light on every beat', { icon: 'transform' });
      m.say('vegeta', 'Third time. If this fails, I am leaving.', 2.2);
      yield* m.cine(1.4);
      let res = null;
      for (let tries = 0; tries < FU.tries; tries++) {
        res = yield* dance(m, { window: tries > 0 ? FU.assistWindow : FU.window });
        m.flags.danceScore = Math.round(res.score * 100) / 100;
        if (res.score >= FU.pass || tries === FU.tries - 1) break;
        m.say('piccolo', tries === 0 ? 'Out of step! Again — slower, listen to the count.' : 'Again! Together!', 2.2, { style: 'shout' });
        yield* m.cine(2.2);
      }
      m.qteParts.push(res ? res.score : 0.5);
      m.complete('dance');
      // the fingertips meet; the light goes up into the sky
      const mid = S.goku.pos.clone().lerp(S.vegeta.pos, 0.5);
      m.shot((t, out) => {
        out.pos.copy(mid).add(new V3(0.2, 1.4, -2.6));
        out.look.copy(mid).add(new V3(0, 1.2, 0));
        out.fov = 38;
      }, 999, { hold: true, cut: true, blendIn: 0, aimFree: true });
      yield* m.cine(0.7);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 200, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      col.position.copy(mid).add(new V3(0, 100, 0));
      b.scene.add(col);
      m.onDispose(() => {
        if (col.parent) b.scene.remove(col);
        col.geometry.dispose();
        col.material.dispose();
      });
      let ck = 0;
      b.onTick(() => {
        if (b.disposed || !col.parent) return false;
        ck++;
        col.material.opacity = ck < 20 ? ck / 20 * 0.6 : Math.max(0, 0.6 - (ck - 60) / 90);
        col.material.color.setHex(ck % 14 < 7 ? 0xbfe8ff : 0xffe8a0);
        if (ck % 8 === 0) b.vfx.ring(mid.clone().add(new V3(0, 0.5, 0)), 4 + ck * 0.15, 0xfff0c0, 0.4, new V3(0, 1, 0));
        if (ck > 160) {
          b.scene.remove(col);
          return false;
        }
        return true;
      });
      SL.ScreenFX.flash(0.4, '#fff4d8');
      b.sfx('transformBurst', S.goku, { pitch: 0.9, vol: 1.2 });
      b.cameraTraumaAt(mid, 0.6);
      m.shot((t, out) => {
        out.pos.copy(mid).add(new V3(14, 6, -18));
        out.look.copy(mid).add(new V3(0, 12, 0));
        out.fov = 56;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      const gg = fuse(m, 'gogeta');
      gg.setState('scripted', { pose: 'gg_arrival', expression: 'calm' });
      yield* m.cine(1.6);
      yield* SL.Cinema.play(m, 'bb_fu_gogeta');
      // two fingers to his brow: Frieza's ki, very faint
      gg.setState('scripted', { pose: 'gg_it', expression: 'smirk' });
      SL.Cinema.shotOn(m, { gogeta: gg }, { subject: 'gogeta', focus: 'upper', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(1.4);
      BK.vanish(b, gg, 0xdff2ff);
      yield* m.cine(0.8);
      m.endShot();
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'THE BIRTH OF GOGETA', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_fusion',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'The Birth of Gogeta',
    subtitle: 'Part 7 · Piccolo\'s plateau',
    character: 'goku',
    stage: 'plains',
    parTime: 420,
    lockForms: BK.LOCKS,
    qteLabel: 'The dance',
    rules: { allowTransform: true, allowUltimates: true },
    appearance: { vegeta: { outfit: 'vegeta_broly', armor: 'armor_v_whis' }, goku: { outfit: 'goku_whis', emblem: 'emblem_whis' }, gogeta: { outfit: 'gogeta_broly' } },
    blurb: 'A green teacher, two proud students, and a dance with a thirty-minute penalty for every mistake. Somewhere far away, Frieza is paying for every one of them.',
    rewards: ['Movie: The Birth of Gogeta', 'Frieza: Golden (story)'],
    setup,
    phases: [P.lesson, P.first, P.frieza, P.second, P.perfect, P.after],
  };

  SL.data.bbFusion = { FU };
  SL.data.missions[def.id] = def;
})();
