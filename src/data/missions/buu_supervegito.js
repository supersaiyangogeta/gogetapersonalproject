/*
 * CHAPTER 13 — BUU SAGA: VEGITO
 * Mission "Super Vegito" (canon; played as Vegito). Not a boss fight: a demonstration. Buuhan is
 * the strongest thing Buu has ever been, and Super Vegito takes him apart piece by piece until he
 * does something desperate — which is exactly what Vegito wants.
 *
 *   RISE      (scene)       Buuhan, powered up: "show me". "Don't blink."
 *   ASCEND    (checkpoint)  THE transformation: hold Charge through it — the wide stance, the fists
 *                           at the hips, the ground cracking, stones rising, the aura white-blue and
 *                           then gold, the lightning — then the form's own sequence: the hair snaps
 *                           up (the bangs stay), teal eyes, the kiai. "And this is... SUPER VEGITO!"
 *   SPEED     (checkpoint)  the speed display: Buuhan swings, and on the beat (Dodge) Vegito is
 *                           somewhere else — left, right, left, right, behind — then a tap on the
 *                           shoulder (Light). Buuhan throws a tantrum of blasts at nothing.
 *   ARMS      (checkpoint)  arms folded, and they stay folded: kicks only (the moveset is swapped,
 *                           the arms held by the animator override), every one of Buuhan's blows
 *                           slipped by a lean of the head. "You haven't even made me use my hands."
 *   SWORD     (checkpoint)  Buuhan goes underground; sense him (Charge), the Spirit Sword (Special 1),
 *                           drive it down (Heavy), lift him on it — and detonate it (Blast). He grows back.
 *   BANSHEE   (checkpoint)  five pink ghost replicas; five golden shots, one from each finger, on the
 *                           beat (Blast x5)
 *   SHOUT     (checkpoint)  the Vice Shout tears the sky: fly into it against the pull, and shut his
 *                           mouth (Heavy)
 *   CANDY     (checkpoint)  the Transmutation Beam: Vegito is a coffee candy — and still Vegito. Fly
 *                           the candy into his nose, his eyes, his stomach, then down his throat and out
 *                           of the back of his neck. He changes you back himself.
 *
 * Tuning knobs: SL.data.superVegito.SV.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const VK = SL.data.vegitoKit;
  const VM = () => SL.data.vegitoMoves;

  const SV = {
    ascendSeconds: 5,
    speedBeat: 1.5, // slow enough for the camera to trade points of view on every dodge (owner)
    kicks: 12, // kicks that have to land in the arms-crossed beatdown
    vegitoDealt: 1.4,
    buuDealt: 0.2,
    buuTaken: 0.9,
    armsSeconds: 60, // after this the story goes on anyway
    bansheeBeat: 0.34,
    shoutPull: 0.92, // the scream drags Vegito back at this fraction of his own top speed (in gusts)
    shoutReach: 7, // close enough: the punch closes the rest in one step
    shoutSeconds: 30,
    candyTargets: ['nose', 'eyeL', 'eyeR', 'stomach'],
    candyReach: 0.45,
    candyCooldown: 0.55, // after a hit the candy bounces off before it can hit again
    candySpeed: 1.7, // moveScale while he is a candy
    candySeconds: 50,
  };
  const HERE = new V3(0, 0, 2); // the middle of the canyon floor
  const SWORD_BIG = { id: 'spiritSwordBig', shape: 'kiBlade', joint: 'handR', pos: [0, -0.06, 0], rot: [Math.PI, 0, 0], length: 8, width: 0.22, color: 0xffd84a, core: 0xfffbe0 };

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const vegito = b.spawn({ charId: 'vegito', player: true, team: 0, pos: at(0, 4), startKi: 160 });
    const bh = b.spawn({ charId: 'buuhan', team: 1, pos: at(0, -4), startKi: 240, tags: { boss: true, priority: true } });
    K.watcher(bh, 'bh_idle', 'wicked');
    bh.mech.maxReforms = Infinity;
    bh.cannotDie = vegito.cannotDie = true;
    vegito.lockedForms = { ssj: true };
    b.story = { vegito, bh, owned: false };
  }

  function own(m) {
    const b = m.battle, S = b.story;
    if (S.owned) return;
    S.owned = true;
    SL.data.princeMission.canyonSet(m);
    S.ghosts = VK.ghosts(m, 5);
    S.rift = VK.rift(m, new V3());
    S.candy = VK.candy(m);
    // the glow of a ki moving under the ground
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xff7ab8, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 }));
    glow.scale.setScalar(3);
    glow.visible = false;
    b.scene.add(glow);
    S.underGlow = glow;
    // the markers on Buuhan's face while Vegito is a candy
    S.marks = {};
    for (const id of SV.candyTargets.concat(['mouth'])) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: id === 'mouth' ? 0xff4040 : 0xffe060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 }));
      s.scale.setScalar(0.5);
      s.visible = false;
      b.scene.add(s);
      S.marks[id] = s;
    }
    m.onDispose(() => {
      b.scene.remove(glow);
      glow.material.dispose();
      for (const s of Object.values(S.marks)) {
        b.scene.remove(s);
        s.material.dispose();
      }
    });
  }

  /** Put the pair back where a checkpoint wants them: Vegito super, Buuhan whole, both clean. */
  function restage(m, opts = {}) {
    const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
    K.clearCombat(b);
    if (opts.super !== false) K.toForm(v, 'ssj');
    v.lockedForms = {};
    v.anim.override = null;
    v.movesOverride = null;
    v.moveScale = 1;
    v.setHidden(false);
    v.untargetable = v.intangible = false;
    bh.setHidden(false);
    bh.untargetable = bh.intangible = false;
    bh.hp = Math.max(bh.hp, bh.hpMax * 0.7);
    if (bh.mech.apart && bh.mech.reform) bh.mech.reform();
    v.model.setPropFill && v.model.setPropFill('spiritSwordBig', 0);
    S.candy.hide();
    S.rift.set(0);
    for (const s of Object.values(S.marks)) s.visible = false;
    for (const g of S.ghosts) g.group.visible = false;
    SL.ScreenFX.vision(0);
    b.stage.clearMood(0.4);
    if (b.player !== v) b.switchPlayer(v, { force: true });
    bh.controller = K.scripted();
    v.target = bh;
    bh.target = v;
  }

  /** Head-frame point on a fighter (for the candy's targets): local x right(+ his left), y up, z forward. */
  function headPoint(f, x, y, z) {
    const R = f.model.b.headR;
    f.model.root.updateMatrixWorld(true);
    return f.model.joints.head.localToWorld(new V3(x * R, R * 0.95 + y * R, z * R)).sub(f.object.position).add(f.pos);
  }
  function targetPos(bh, id) {
    if (id === 'nose') return headPoint(bh, 0, -0.05, 1.15);
    if (id === 'eyeL') return headPoint(bh, 0.38, 0.12, 1.0);
    if (id === 'eyeR') return headPoint(bh, -0.38, 0.12, 1.0);
    if (id === 'mouth') return headPoint(bh, 0, -0.45, 1.05);
    return bh.chest().addScaledVector(bh.forward.clone().setY(0).normalize(), 0.45).add(new V3(0, -0.25, 0));
  }

  const P = {};

  P.rise = {
    id: 'rise',
    run: function* (m) {
      own(m);
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'sv_rise');
    },
  };

  /** Hold Charge: the power-up of the brief, then the form's own sequence. */
  P.ascend = {
    id: 'ascend',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      restage(m, { super: false });
      K.toForm(v, 'base');
      v.lockedForms = { ssj: true };
      K.place(v, K.ground(b, HERE));
      K.place(bh, K.ground(b, HERE.clone().add(new V3(0, 0, -8))));
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      bh.setState('scripted', { pose: 'bh_idle', expression: 'wicked' });
      m.music('vegito_theme', 4);
      m.objective('ascend', 'Power up', { icon: 'transform' });
      const stones = (S.stones = S.stones || VK.stones(m, v, 16));
      let rise = 0, rising = false;
      const hook = () => {
        if (rising) rise = Math.min(1, rise + 1 / 150);
        stones.rise(rise);
      };
      m.tickHooks.push(hook);
      const t = yield* SL.data.cinematics.ascend(m, {
        fighter: v,
        form: 'ssj',
        seconds: SV.ascendSeconds,
        label: 'Hold to power up',
        meter: 'SUPER VEGITO',
        witness: bh,
        witnessLine: 'Wh-what IS this...?!',
        music: 6,
        dust: false,
        beats: [
          // the ground gives first: cracks under the boots
          { at: 0.12, run: (mm, f) => (b.stage.crater(f.pos, 2.4, 0.2, null), b.sfx('rockBreak', f, { vol: 0.8, pitch: 0.7 }), b.camera.addTrauma(0.2)) },
          // the stones lift off it
          { at: 0.28, run: () => (rising = true) },
          // white-blue
          { at: 0.5, run: (mm, f) => (f.aura.setStyle({ color: 0xbfe0ff, core: 0xffffff, particles: 0xdff0ff, speed: 1.4, sharp: 0.4 }), b.sfx('kiUp', f)) },
          // the blue lightning starts
          { at: 0.7, run: (mm, f) => (b.vfx.skyBolt(f.pos.clone().add(new V3(3, 0, -2)), 40), b.sfx('lightning', f)) },
          { at: 0.9, run: (mm, f) => (b.vfx.skyBolt(f.pos.clone().add(new V3(-3, 0, 2)), 40), b.stage.crater(f.pos, 4, 0.35, null)) },
        ],
      });
      K.unhook(m, hook);
      stones.drop();
      m.complete('ascend');
      m.flags.ascendSeconds = Math.round(t * 10) / 10;
      yield* SL.Cinema.play(m, 'sv_named');
    },
  };

  /** Left, right, left, right, behind: on the beat. */
  P.speed = {
    id: 'speed',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      restage(m);
      K.hover(b, bh, HERE.clone().add(new V3(0, 0, -3)), 1.6);
      K.hover(b, v, HERE.clone().add(new V3(0, 0, 0.2)), 1.6);
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      v.setState('scripted', { pose: 'vg_floatArms', expression: 'cocky' });
      bh.setState('scripted', { pose: 'bh_fight', expression: 'angry' });
      yield* SL.Cinema.play(m, 'sv_speedIn');
      m.objective('speed', 'Stay ahead of him (Dodge on the beat)', { icon: 'teleport' });
      // the spots, round Buuhan's own frame
      const fwd = v.pos.clone().sub(bh.pos).setY(0).normalize();
      const right = new V3(fwd.z, 0, -fwd.x);
      const spot = (side, ahead) => bh.pos.clone().addScaledVector(right, side * 2.4).addScaledVector(fwd, ahead);
      const plan = [
        { at: spot(-1, 0.4), bh: 'sb_jab', say: null },
        { at: spot(1, 0.4), bh: 'sb_kick', say: ['vegito', 'Over here!'] },
        { at: spot(-1, 0.2), bh: 'sb_jab', say: ['buuhan', 'DAMN YOU!'] },
        { at: spot(1, 0.2), bh: 'bh_swat', say: ['vegito', 'Nope! Too slow! I\'m over here now!'] },
        { at: spot(-1, 0.3), bh: 'bh_search', say: ['buuhan', 'GRRR... WHERE ARE YOU?!'] },
        { at: bh.pos.clone().addScaledVector(fwd, -1.3), bh: 'bh_search', tap: true, say: ['vegito', 'Are you even trying? You\'re swinging at shadows.'] },
      ];
      let side = 1;
      const res = yield* m.rhythm(
        [
          { key: 'dodge', label: 'VANISH' },
          { key: 'dodge', label: 'LEFT' },
          { key: 'dodge', label: 'RIGHT' },
          { key: 'dodge', label: 'LEFT' },
          { key: 'dodge', label: 'RIGHT' },
          { key: 'light', label: 'TAP HIS SHOULDER' },
        ],
        {
          beat: SV.speedBeat,
          window: 0.24,
          perfect: 0.09,
          lead: 1.4,
          onBeat(i) {
            const p = plan[i];
            // where he WAS: the fist goes through the afterimage left there
            const oldChest = v.chest();
            // he swings at where Vegito WAS
            K.faceTo(bh, v.pos);
            bh.setState('scripted', { pose: p.bh, expression: 'shout' });
            bh.setPosition(bh.pos.clone().lerp(v.pos, 0.25));
            b.sfx('swing', bh, { pitch: 0.8 });
            VK.vanishTo(b, v, p.at, { face: bh.pos, pitch: 1.1 + i * 0.05 });
            v.setState('scripted', { pose: p.tap ? 'vg_tap' : i % 2 ? 'vg_floatArms' : 'vg_armsStand', expression: 'cocky' });
            if (p.tap) {
              K.faceTo(bh, v.pos.clone().addScaledVector(fwd, -4)); // still looking the wrong way
              b.sfx('punchLight', v, { vol: 0.3, pitch: 1.8 });
            }
            b.slowmo(0.4, 0.18);
            if (p.say) m.say(p.say[0], p.say[1], 1.6, { style: p.say[0] === 'vegito' ? 'dual' : 'shout' });
            // TWO POINTS OF VIEW A BEAT (owner): over Buuhan's shoulder as his fist goes through the afterimage
            // where Vegito was — then Vegito's face, somewhere else, not even looking worried. Slow drifts, hard cuts.
            side = -side;
            const toOld = oldChest.clone().sub(bh.chest()).setY(0).normalize();
            const bhRight = new V3(toOld.z, 0, -toOld.x).multiplyScalar(side);
            const cutAt = 0.46;
            m.shot((t, out) => {
              if (t < cutAt) {
                const k = t / cutAt;
                const pos = bh.chest().addScaledVector(toOld, -U.lerp(1.7, 1.3, k)).addScaledVector(bhRight, 0.8).add(new V3(0, 0.42, 0));
                K.camAt(out, pos, oldChest.clone().lerp(bh.chest(), 0.15), 38);
              } else {
                const k = (t - cutAt) / (1 - cutAt);
                const head = SL.Cinema.actorPoint({ cast: { v } }, 'v:head');
                const fwd = v.forward.clone().setY(0).normalize();
                const right = new V3(fwd.z, 0, -fwd.x).multiplyScalar(side);
                const pos = head.clone().addScaledVector(fwd, U.lerp(1.05, 0.9, k)).addScaledVector(right, U.lerp(0.75, 0.6, k)).add(new V3(0, -0.06, 0));
                K.camAt(out, pos, head.clone().addScaledVector(right, 0.12).add(new V3(0, -0.04, 0)), 36);
              }
            }, SV.speedBeat + 0.25, { cut: true, blendIn: 0 });
          },
        }
      );
      m.complete('speed');
      m.flags.speedScore = Math.round(res.score * 100) / 100;
      m.qteParts.push(res.score);
      m.endShot();
      yield* SL.Cinema.play(m, 'sv_tantrum');
    },
  };

  /** Arms folded. Kicks only. Every blow he throws goes past a lean of the head. */
  P.arms = {
    id: 'arms',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      restage(m);
      K.place(v, K.ground(b, HERE));
      K.place(bh, K.ground(b, HERE.clone().add(new V3(0, 0, -4))));
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      m.music('vegito_theme', 6);
      const ARMS = Object.assign({ hands: ['fist', 'fist'] }, VM().ARMS);
      v.anim.override = ARMS;
      v.movesOverride = VM().ARMS_CROSSED_MOVES;
      m.objective('kicks', 'Land kicks — the arms stay folded', { icon: 'fist', target: SV.kicks });
      m.objective('axe', 'Finish something with the axe kick', { icon: 'fist', optional: true });
      m.limits({ s1: false, s2: false, ult: false, blast: false, transform: false, charge: false, guard: false });
      let kicks = 0, axe = false;
      const offD = b.on('damage', (e) => {
        if (e.attacker !== v || e.target !== bh || e.blocked) return;
        m.progress('kicks', Math.min(SV.kicks, ++kicks));
        const st = v.sd && v.sd.move;
        if (st && st.id === 'vxAxe') axe = true;
      });
      // the slips: whenever Buuhan swings within reach, Vegito's head is somewhere else
      let slipUntil = 0, prevState = null, slips = 0;
      const slipPoses = ['vg_slipA', 'vg_slipB', 'vg_slipC'];
      const hook = () => {
        v.intangible = true;
        const swinging = ['attack', 'dash', 'rush', 'throw'].includes(bh.state);
        if (swinging && prevState !== bh.state && v.distTo(bh) < 4 && v.state === 'free') {
          slipUntil = b.frame + 16;
          const pose = slipPoses[slips++ % 3];
          m.flags.slips = slips;
          v.setState('scripted', { pose, expression: 'cocky' });
          const right = new V3(v.forward.z, 0, -v.forward.x);
          const off = right.multiplyScalar(pose === 'vg_slipA' ? 0.45 : pose === 'vg_slipB' ? -0.45 : 0).addScaledVector(v.forward, pose === 'vg_slipC' ? -0.4 : 0);
          b.vfx.ghost(v.model, 0xfff0a0, 0.3, 0.5);
          v.setPosition(v.pos.clone().add(off));
          b.sfx('dodge', v, { pitch: 1.3 });
          if (slips === 3) m.say('vegito', 'Too slow.', 1.4, { style: 'dual' });
          if (slips === 7) m.say('vegito', 'Is that really everything?', 1.8, { style: 'dual' });
        }
        prevState = bh.state;
        if (v.state === 'scripted' && b.frame >= slipUntil && slipUntil) {
          slipUntil = 0;
          v.setState('free');
        }
      };
      m.tickHooks.push(hook);
      if (b.player !== v) b.switchPlayer(v, { force: true });
      v.target = bh;
      bh.target = v;
      v.damageDealtMul = SV.vegitoDealt;
      bh.damageDealtMul = SV.buuDealt;
      bh.damageTakenMul = SV.buuTaken;
      bh.controller = new SL.AIController(b, { difficulty: 'hard' });
      v.setState('free');
      bh.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.say('vegito', 'Go on. I\'ll keep my arms folded. Maybe it\'ll help you.', 3, { style: 'dual' });
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => kicks >= SV.kicks || t > SV.armsSeconds || b.skipRequested;
      K.unhook(m, hook);
      K.unhook(m, clock);
      offD();
      m.complete('kicks');
      if (axe) m.complete('axe');
      else m.failObjective('axe');
      m.flags.kicks = kicks;
      m.flags.slips = slips;
      m.limits(null);
      m.lock(true);
      K.clearCombat(b);
      bh.controller = K.scripted();
      if (bh.mech.apart) yield () => !bh.mech.apart;
      v.intangible = false;
      if (v.state !== 'free') v.setState('free');
      yield* SL.Cinema.play(m, 'sv_hands');
      v.anim.override = null;
      v.movesOverride = null;
    },
  };

  P.sword = {
    id: 'sword',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito;
      m.lock(true);
      m.clearObjectives();
      restage(m);
      K.place(v, K.ground(b, HERE));
      K.place(S.bh, K.ground(b, HERE.clone().add(new V3(0, 0, -6))));
      if (!v.model.props.spiritSwordBig) v.model.addProp(SWORD_BIG);
      m.music('vegito_theme', 5);
      yield* SL.Cinema.play(m, 'sv_sword');
    },
  };

  P.banshee = {
    id: 'banshee',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      restage(m);
      K.place(v, K.ground(b, HERE));
      K.place(bh, K.ground(b, HERE.clone().add(new V3(0, 0, -12))));
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      yield* SL.Cinema.play(m, 'sv_ghosts');
      // five ghosts drifting in; one shot per finger, on the beat
      const gs = S.ghosts;
      const hook = () => {
        for (const g of gs) {
          if (!g.alive) continue;
          const to = v.chest().sub(g.pos);
          const d = to.length();
          if (d > 2.5) g.pos.addScaledVector(to.normalize(), 1.6 / 60);
          g.pos.y += Math.sin(b.frame * 0.1 + g.phase) * 0.01;
          g.group.lookAt(v.chest());
        }
      };
      m.tickHooks.push(hook);
      m.objective('banshee', 'Banshee Rapid Fire (Blast on the beat)', { icon: 'ball' });
      v.setState('scripted', { pose: 'vg_fingers', expression: 'cocky' });
      // over his shoulder, down the line of his hand at the five of them
      const over = SL.Cinema.overShoulder(v, bh, { side: 0.9, back: 2.4, height: 0.7, fov: 50, lookUp: 0.6 });
      m.shot((t, out) => K.camAt(out, over.pos, over.look, over.fov), 30, { cut: true, blendIn: 0 });
      const res = yield* m.rhythm(
        gs.map((g, i) => ({ key: 'blast', label: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i] })),
        {
          beat: SV.bansheeBeat,
          window: 0.14,
          perfect: 0.06,
          lead: 1.6,
          onBeat(i) {
            const g = gs[i];
            if (!g || !g.alive) return;
            // a golden line from one fingertip to one ghost
            const h = v.model.joints.handR.getWorldPosition(new V3()).sub(v.object.position).add(v.pos);
            const tip = h.add(new V3((i - 2) * 0.05, 0, 0));
            for (let k = 0; k <= 10; k++) b.vfx.trail(tip.clone().lerp(g.pos, k / 10), 0xffd84a, 0.22, 0.25);
            b.vfx.flash(g.pos, 2.4, 0xffe890, 0.3, SL.Toon.tex.glow);
            b.vfx.explosion(g.pos, 2, 0xff8ac4, { smoke: false });
            b.sfx('kiBlast', v, { pitch: 1.3 + i * 0.08 });
            g.alive = false;
            g.group.visible = false;
          },
        }
      );
      K.unhook(m, hook);
      m.endShot();
      for (const g of gs) {
        g.alive = false;
        g.group.visible = false;
      }
      m.complete('banshee');
      m.flags.bansheeScore = Math.round(res.score * 100) / 100;
      m.qteParts.push(res.score);
      yield* SL.Cinema.play(m, 'sv_ghostsDone');
    },
  };

  /** The Vice Shout: fly into the tear against its pull, and close his mouth for him. */
  P.shout = {
    id: 'shout',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      restage(m);
      K.hover(b, v, HERE.clone().add(new V3(0, 0, 26)), 3);
      K.hover(b, bh, HERE.clone().add(new V3(0, 0, -16)), 3);
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      yield* SL.Cinema.play(m, 'sv_shoutIn');
      // the scream holds: the tear behind him, the world bending, the pull
      bh.setState('scripted', { pose: 'bh_scream', expression: 'shout' });
      b.stage.setMood(0.55, 0x2a0a4a, 0.8);
      SL.ScreenFX.vision(0.45);
      m.objective('reach', 'Fly into the scream — reach him', { icon: 'rush' });
      m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, transform: false, charge: false, guard: false, dodge: false });
      v.target = bh;
      v.setState('free');
      m.lock(false);
      b.aiLocked = true;
      let t = 0;
      const hook = () => {
        t += 1 / 60;
        const behind = bh.chest().add(bh.forward.clone().multiplyScalar(-6)).add(new V3(0, 3, 0));
        S.rift.set(1 + Math.sin(t * 3) * 0.05, v.chest());
        S.rift.group.position.copy(behind);
        // level, away from him (a vertical part would throw anybody who got above him into the sky);
        // weaker in the eye of it, right in front of his mouth
        const away = v.pos.clone().sub(bh.pos).setY(0);
        const near = U.clamp01((away.length() - SV.shoutReach) / 10);
        away.normalize();
        // the pull comes in gusts (push through in the lulls) and eases off with time so nobody is
        // ever stuck here; it is measured against Vegito's own homing speed, not a fixed number
        const top = SL.Rules.SPEED.homing * v.mult().speed;
        const gust = 0.85 + 0.15 * Math.sin(t * 2.4);
        const pull = top * SV.shoutPull * gust * near * Math.max(0.25, 1 - t / SV.shoutSeconds);
        v.pos.addScaledVector(away, pull / 60);
        if (b.frame % 4 === 0) {
          b.camera.addTrauma(0.08);
          b.vfx.streamInward(behind, 8, 0xb070ff, 2, 0.3, 0.5);
        }
        if (b.frame % 20 === 0) b.vfx.ring(bh.chest(), 4 + (b.frame % 60) / 10, 0xd070ff, 0.5);
      };
      m.tickHooks.push(hook);
      m.prompt('shout_boost', 'boost', 'Push through', { required: true, until: () => v.distTo(bh) < SV.shoutReach });
      yield () => v.distTo(bh) < SV.shoutReach || t > SV.shoutSeconds + 5 || b.skipRequested;
      K.unhook(m, hook);
      m.limits(null);
      m.complete('reach');
      m.flags.shoutSeconds = Math.round(t);
      m.lock(true);
      yield* SL.Cinema.play(m, 'sv_jaw');
    },
  };

  /** The world's strongest coffee candy. */
  P.candy = {
    id: 'candy',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.clearObjectives();
      restage(m);
      K.hover(b, v, HERE.clone().add(new V3(0, 0, 3)), 2);
      K.hover(b, bh, HERE.clone().add(new V3(0, 0, -3)), 2);
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      yield* SL.Cinema.play(m, 'sv_candyBeam');
      // Vegito, as a candy: his own body flies (hidden), the candy is drawn where it is
      v.setHidden(true);
      v.intangible = true;
      v.untargetable = false;
      v.moveScale = SV.candySpeed;
      v.target = bh;
      v.setState('free');
      bh.setState('scripted', { pose: 'bh_swat', expression: 'angry' });
      m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, transform: false, charge: false, guard: false, dodge: false });
      const left = SV.candyTargets.slice();
      m.objective('candy', 'Hit him where it hurts: nose, eyes, stomach', { icon: 'target', target: left.length });
      m.lock(false);
      b.aiLocked = true;
      const ouch = { nose: 'MY NOSE!', eyeL: 'GWAH! My eye!', eyeR: 'The other eye?!', stomach: 'Hrrgh—!' };
      const hitPose = { nose: 'hitHeavy', eyeL: 'hitSideL', eyeR: 'hitSideR', stomach: 'hitBody' };
      let t = 0, done = 0, stun = 0, mouthOpen = false, cool = 0;
      const base = bh.pos.clone();
      const hook = () => {
        t += 1 / 60;
        const c = v.pos.clone().add(new V3(0, v.height * 0.5, 0));
        S.candy.set(c, v.vel.length());
        // Buuhan turns after it, weaves, and swats at the air
        K.faceTo(bh, c);
        if (stun <= 0 && !mouthOpen) {
          const side = new V3(bh.forward.z, 0, -bh.forward.x);
          bh.setPosition(base.clone().addScaledVector(side, Math.sin(t * 0.9) * 2.2).add(new V3(0, Math.sin(t * 1.7) * 0.4, 0)));
          bh.prevPos.copy(bh.pos);
        }
        if (cool > 0) cool -= 1 / 60;
        if (stun > 0) stun -= 1 / 60;
        else if (bh.sd.pose !== 'bh_swat' && !mouthOpen) bh.setState('scripted', { pose: 'bh_swat', expression: 'angry' });
        for (const id of left) {
          const p = targetPos(bh, id);
          const mk = S.marks[id];
          mk.visible = true;
          mk.position.copy(p);
          mk.scale.setScalar(0.4 + Math.sin(t * 8) * 0.08);
          if (cool <= 0 && c.distanceTo(p) < SV.candyReach) {
            cool = SV.candyCooldown;
            left.splice(left.indexOf(id), 1);
            mk.visible = false;
            done++;
            m.progress('candy', done);
            b.vfx.impact(p, 2, 0xffd890);
            b.vfx.sparks(p, 0xffe0a0, 12, 8, 0.1);
            b.cameraTraumaAt(p, 0.4);
            b.sfx('punchHeavy', bh, { pitch: 1.4 });
            b.slowmo(0.4, 0.15);
            bh.setState('scripted', { pose: hitPose[id], expression: 'hurt' });
            stun = 0.6;
            m.say('buuhan', ouch[id], 1.4, { style: 'shout' });
            // knocked back off his mark: the candy bounces off, fast
            v.vel.addScaledVector(v.pos.clone().sub(bh.pos).normalize(), 18);
            break;
          }
        }
        if (!left.length && !mouthOpen) {
          mouthOpen = true;
          m.complete('candy');
          m.objective('mouth', 'Now: down his throat', { icon: 'target' });
          m.say('buuhan', 'GRAAAAH— HOLD STILL!!', 1.8, { style: 'shout' });
          m.say('vegito', 'Say "ahh"!', 1.6, { style: 'dual' });
        }
        if (mouthOpen) {
          bh.setState('scripted', { pose: 'bh_scream', expression: 'shout' });
          const p = targetPos(bh, 'mouth');
          const mk = S.marks.mouth;
          mk.visible = true;
          mk.position.copy(p);
          mk.scale.setScalar(0.5 + Math.sin(t * 10) * 0.1);
        }
      };
      m.tickHooks.push(hook);
      m.prompt('candy_fly', 'boost', 'Fly into him', { required: true, until: () => mouthOpen });
      // a camera for something the size of a sweet: close behind it, on the line to his face
      // (render-only: the candy steers relative to Buuhan, its locked target, not to the camera)
      m.shot((tt, out) => {
        const c = S.candy.pos.clone(), face = targetPos(bh, 'nose');
        const back = c.clone().sub(face).setY(0);
        if (back.lengthSq() < 0.01) back.set(0, 0, 1);
        back.normalize();
        out.pos.copy(c).addScaledVector(back, 2.6).add(new V3(0, 0.8, 0));
        out.look.copy(c).lerp(face, 0.55);
        out.fov = 52;
      }, SV.candySeconds + 10, { cut: true, blendIn: 0 });
      yield () => (mouthOpen && S.candy.pos.distanceTo(targetPos(bh, 'mouth')) < SV.candyReach) || t > SV.candySeconds || b.skipRequested;
      K.unhook(m, hook);
      m.endShot();
      m.limits(null);
      m.complete('mouth');
      for (const s of Object.values(S.marks)) s.visible = false;
      m.flags.candyHits = done;
      m.flags.candySeconds = Math.round(t);
      m.lock(true);
      v.moveScale = 1;
      yield* SL.Cinema.play(m, 'sv_throat');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'SUPER VEGITO', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_supervegito',
    canon: true,
    chapter: 'CHAPTER 13 · BUU SAGA',
    title: 'Super Vegito',
    subtitle: 'Earth · Age 774 · the strongest there has ever been',
    character: 'vegito',
    stage: 'rocky_canyon',
    parTime: 600,
    rules: { allowTransform: true, allowUltimates: false },
    blurb: 'Buuhan has Gohan\'s power and Buu\'s body, and he has never been so strong. That is about to stop mattering.',
    rewards: ['Form: Super Vegito', 'Technique: Spirit Sword', 'Technique: Banshee Rapid Fire'],
    setup,
    phases: [P.rise, P.ascend, P.speed, P.arms, P.sword, P.banshee, P.shout, P.candy, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.superVegito = { SV, HERE, SWORD_BIG, targetPos, headPoint, restage };
})();
