/*
 * SCENES — Chapter 5, Age 767: the morning the Androids arrive.
 *
 *   androids_arrive   two strangers standing in the road, exactly on time
 *   goku_virus        the fight stops because his heart does
 *   vegeta_arrives    the one person nobody wanted to owe a favour
 *   gero_flees        the doctor decides he would rather be somewhere else
 *
 * The turn in this chapter is not a transformation, it is an illness: the
 * biggest moment is Goku putting a hand on his chest and going down in the
 * middle of a fight he was winning.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.androids_arrive = {
    id: 'androids_arrive',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, vegeta: s.vegeta, krillin: s.krillin, a19: s.a19, a20: s.a20 };
    },
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'a19', pose: 'a19_smug', face: 'smirk' },
          { who: 'a20', pose: 'a19_smug', face: 'calm' },
          { who: 'goku', pose: 'idle', face: 'grit' },
          { who: 'krillin', pose: 'idle', face: 'shock' },
        ],
        mood: { amount: 0.24, color: 0x2a3040, seconds: 1.4 },
        cam: { from: { at: 'a19', off: [7, 3.4, 9] }, to: { at: 'a19', off: [5, 2.2, 6.4] }, look: { at: 'a19', off: [0, 1, 0] }, fov: 50, fov2: 42, ease: 'inOut' },
        say: { who: 'krillin', line: 'Ten in the morning. He said ten in the morning and there they are.', duration: 4 },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'a20', local: [1.1, 0.5, 3 ] }, look: { at: 'a20', off: [0, 0.5, 0] }, fov: 42 },
        say: { who: 'android_20', line: 'Son Goku. Twenty-three years of work, and you have not changed a bit.', duration: 4.4 },
        hold: 4.6,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'goku', local: [0.9, 0.5, 2.6] }, to: { at: 'goku', local: [0.7, 0.45, 2.1] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 40, fov2: 34 },
        say: { who: 'goku', line: 'Then let us do this away from the city. Nobody else has to be here.', duration: 4 },
        hold: 4.2,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      for (const k of ['goku', 'a19', 'a20']) if (cast[k]) cast[k].setState('free');
      m.flags.androidsArrived = true;
    },
    clearMood: false,
  };

  S.goku_virus = {
    id: 'goku_virus',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, a19: s.a19, vegeta: s.vegeta, krillin: s.krillin };
    },
    events: [
      // it starts as nothing: a stumble in the middle of an exchange
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'hurt', speed: 3 }],
        music: { song: null, level: 0 },
        sfx: { name: 'heartbeat', who: 'goku', vol: 0.9 },
        cam: { from: { at: 'goku', local: [0.7, 0.5, 2.4] }, to: { at: 'goku', local: [0.55, 0.46, 1.9] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 38, fov2: 32 },
        hold: 2.6,
      },
      {
        sfx: { name: 'heartbeat', who: 'goku', vol: 1.1 },
        shake: { at: { at: 'goku' }, amount: 0.3 },
        screen: { flash: 0.25, color: '#3a0a12' },
        cam: { from: { at: 'goku', local: [0.45, 0.45, 1.5] }, look: { at: 'goku', off: [0, 0.42, 0] }, fov: 28 },
        say: { who: 'goku', line: 'My chest — not now, not now...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'knockdown', face: 'hurt' }],
        sfx: { name: 'groundImpact', who: 'goku', vol: 0.9 },
        vfx: { kind: 'dust', at: { at: 'goku' }, radius: 3, count: 12 },
        mood: { amount: 0.45, color: 0x3a1020, seconds: 1 },
        cam: { from: { at: 'goku', off: [2.6, 1.2, 3.2] }, to: { at: 'goku', off: [2, 0.8, 2.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 44, fov2: 38 },
        say: { who: 'krillin', line: 'Goku! The medicine — it is at home, he left it at home!', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'a19', pose: 'a19_smug', face: 'smirk' }],
        cam: { from: { at: 'a19', local: [1, 0.5, 2.6] }, look: { at: 'a19', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'android_19', line: 'How disappointing. I was enjoying the energy.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const g = cast.goku;
      if (g) {
        g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
        g.untargetable = true;
      }
      if (cast.a19) cast.a19.setState('free');
      m.flags.virusStruck = true;
    },
    clearMood: false,
  };

  S.vegeta_arrives = {
    id: 'vegeta_arrives',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, a19: s.a19, goku: s.goku, krillin: s.krillin };
    },
    music: { song: 'vegeta_theme', level: 4 },
    events: [
      {
        show: 'vegeta',
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk' }],
        sfx: { name: 'dash', who: 'vegeta', vol: 0.9, pitch: 0.8 },
        vfx: { kind: 'dust', at: { at: 'vegeta' }, radius: 4, count: 14 },
        cam: { from: { at: 'vegeta', off: [3.4, 1.8, 4.6] }, to: { at: 'vegeta', off: [2.4, 1.2, 3.2] }, look: { at: 'vegeta', off: [0, 0.8, 0] }, fov: 46, fov2: 38 },
        say: { who: 'vegeta', line: 'Move, Kakarot. You\'re embarrassing both of us.', duration: 3 },
        hold: 3.2,
      },
      // a boot under Goku, and he goes rolling back toward Krillin
      {
        call: (ctx) => {
          const g = ctx.cast.goku, k = ctx.cast.krillin;
          if (!g) return;
          ctx.k0 = g.pos.clone();
          ctx.k1 = k ? k.pos.clone().lerp(g.pos, 0.3) : g.pos.clone().add(new THREE.Vector3(0, 0, 4));
          ctx.b.sfx('punchLight', g, { pitch: 0.8 });
          g.setState('scripted', { pose: 'tumble', expression: 'hurt' });
        },
        pose: [{ who: 'vegeta', pose: 'kickR', face: 'angry', speed: 16 }],
        cam: { from: { at: 'vegeta', local: [2.2, 0.6, 1.2] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const g = ctx.cast.goku;
          if (!g || !ctx.k0) return;
          const k = Math.min(1, t / 0.7);
          g.setPosition(ctx.k0.clone().lerp(ctx.k1, k));
          g.prevPos.copy(g.pos);
          if (k >= 1 && !ctx.rolled) {
            ctx.rolled = true;
            g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
          }
        },
        hold: 1.1,
      },
      {
        pose: [{ who: 'a19', pose: 'a19_smug', face: 'calm' }],
        cam: { from: { at: 'a19', local: [0.6, 0.4, 2.2] }, look: { at: 'a19', off: [0, 0.7, 0] }, fov: 38 },
        say: { who: 'android_19', line: 'Vegeta. Target acquired. Calculating probability of victory... zero percent. For you.', duration: 4.4 },
        hold: 4.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'vegeta:face', local: [0.15, 0.16, 0.95] }, to: { at: 'vegeta:face', local: [0.1, 0.16, 0.75] }, look: { at: 'vegeta:head', off: [0, 0.14, 0] }, fov: 32 },
        say: { who: 'vegeta', line: 'Tell me... does a machine like yourself ever experience fear?', duration: 3.6 },
        hold: 3.8,
      },
      // the stance: feet wide, fists at the hips
      {
        pose: [{ who: 'vegeta', pose: 'powerCrouch', face: 'grit', speed: 8, aura: 0.4 }],
        cam: { from: { at: 'vegeta', local: [1.2, 0, 3] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 40 },
        shake: { at: { at: 'vegeta' }, amount: 0.4 },
        sfx: { name: 'kiUp', who: 'vegeta', vol: 1, pitch: 0.7 },
        vfx: { kind: 'rocks', at: { at: 'vegeta' }, radius: 4, count: 10, lift: 5 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'powerUp', face: 'shout', speed: 10 }],
        screen: { flash: 0.7, color: '#fff0c0' },
        sfx: { name: 'transformBurst', who: 'vegeta', vol: 1.1 },
        vfx: { kind: 'ring', at: { at: 'vegeta' }, radius: 9, color: 0xffd45a, life: 0.6 },
        shake: { at: { at: 'vegeta' }, amount: 0.8 },
        transform: { who: 'vegeta', form: 'ssj' },
        cam: { from: { at: 'vegeta', local: [0.7, 0.5, 2.4] }, to: { at: 'vegeta', local: [0.9, 0.9, 3.6] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 34, fov2: 46 },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'vegeta:face', local: [0.18, 0.16, 0.9] }, look: { at: 'vegeta:head', off: [0, 0.14, 0] }, fov: 32 },
        say: { who: 'vegeta', line: 'Surprised? Kakarot isn\'t the only Super Saiyan any more.', duration: 3.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'a19', pose: 'a19_smug', face: 'shock' }],
        cam: { from: { at: 'a19', local: [1, 0.5, 2.6] }, look: { at: 'a19', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'android_19', line: 'That is... not in my data.', duration: 2.6 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const v = cast.vegeta;
      if (v) {
        v.setHidden(false);
        v.untargetable = false;
        const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
        if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
        v.setState('free');
      }
      if (cast.a19) cast.a19.setState('free');
      m.flags.vegetaArrived = true;
    },
    clearMood: false,
  };

  /**
   * THE FINISH (owner's brief): 19 grabs both wrists to drain him; Vegeta plants both boots on his face
   * and pushes — the arms come off at the elbows in sparks and oil. 19 runs. Vegeta floats up, one arm
   * out straight, the palm flat: BIG BANG ATTACK. What is left is a charred head, rolling.
   */
  S.vegeta_rips = {
    id: 'vegeta_rips',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, a19: s.a19, a20: s.a20, goku: s.goku, krillin: s.krillin };
    },
    music: { song: 'super_saiyan', level: 6 },
    events: [
      // both wrists caught in the absorbing palms
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta, a = ctx.cast.a19, K = SL.data.cellKit;
          K.place(a, v.pos.clone().addScaledVector(v.forward.clone().setY(0).normalize(), 0.95));
          K.faceTo(a, v.pos);
          K.faceTo(v, a.pos);
          ctx.b.sfx('drain', a, { vol: 0.9 });
        },
        pose: [
          { who: 'a19', pose: 'a19_drain', face: 'smirk', speed: 10 },
          { who: 'vegeta', pose: 'guard', face: 'grit', speed: 10 },
        ],
        cam: { from: { at: 'vegeta', local: [2.2, 0.4, 0.5] }, look: { at: 'vegeta', local: [0, 0.4, 0.5] }, fov: 40 },
        tick: (ctx) => {
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(ctx.cast.a19.chest(), 1.4, 0xffe25a, 2, 0.1, 0.3);
        },
        say: { who: 'android_19', line: 'Your energy is mine.', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      // he doesn't pull away: both boots on 19's face
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          v.grounded = false;
          v.setPosition(v.pos.clone().add(new THREE.Vector3(0, 0.5, 0)));
        },
        pose: [{ who: 'vegeta', pose: 'v_twoPalms', face: 'smirk', speed: 12 }],
        cam: { from: { at: 'vegeta', local: [2.4, 0.2, 0.3] }, look: { at: 'vegeta', local: [0, 0.2, 0.5] }, fov: 40 },
        hold: 1,
      },
      // CRACK — the arms tear off at the elbows, sparks and oil everywhere
      {
        call: (ctx) => {
          const b = ctx.b, a = ctx.cast.a19, v = ctx.cast.vegeta, K = SL.data.cellKit;
          a.model.root.updateMatrixWorld(true);
          const cut = K.sever(b, a, ['elbowL', 'elbowR']);
          ctx.cut = cut;
          const back = v.forward.clone().setY(0).normalize().negate();
          cut.limbs.forEach((p, i) => {
            p.vel.copy(back).multiplyScalar(-5).add(new THREE.Vector3((i ? -1 : 1) * 2, 4, 0));
            p.spin.set(4, 2, i ? 3 : -3);
          });
          cut.base.frozen = true;
          for (const p of cut.limbs) {
            b.vfx.sparks(p.pivot.position, 0xffe0a0, 24, 9, 0.08);
            b.vfx.debrisBurst(p.pivot.position, 8, 0x1a1a1a, 5, 0.08);
          }
          b.sfx('boneCrack', a, { vol: 1.4, pitch: 0.6 });
          b.sfx('swordClang', a, { vol: 0.8, pitch: 0.7 });
          b.cameraTraumaAt(a.pos, 0.6);
          // Vegeta flips back off him, landing clear, an arm in each hand
          v.setPosition(v.pos.clone().addScaledVector(back, 2.4));
        },
        pose: [{ who: 'vegeta', pose: 'v_twoPalms', face: 'grin', speed: 30 }],
        slow: { scale: 0.3, seconds: 0.9 },
        cam: { from: { at: 'a19', local: [2.6, 0.6, 1.2] }, look: { at: 'a19', off: [0, 0.6, 0] }, fov: 44 },
        tick: (ctx) => {
          if (ctx.cut) SL.data.cellKit.animatePieces(ctx.b, ctx.cut, { gravity: 16 });
          if (ctx.b.frame % 4 === 0 && ctx.cut) for (const p of ctx.cut.limbs) ctx.b.vfx.sparks(p.pivot.position, 0xffd890, 3, 3, 0.05);
        },
        hold: 1.8,
      },
      // the machine screams and runs
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta, a = ctx.cast.a19, cut = ctx.cut;
          ctx.r0 = cut.base.pivot.position.clone();
          ctx.r1 = ctx.r0.clone().addScaledVector(v.dirTo(a).setY(0).normalize(), 14);
          SL.data.cellKit.place(v, v.pos.clone().setY(ctx.b.stage.heightAt(v.pos.x, v.pos.z)));
        },
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [-1.2, 0.8, -2.6] }, look: { at: 'a19', off: [0, 0.5, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const cut = ctx.cut;
          if (!cut) return;
          SL.data.cellKit.animatePieces(ctx.b, cut, { gravity: 16 });
          const k = Math.min(1, t / 2.2);
          cut.base.pivot.position.copy(ctx.r0.clone().lerp(ctx.r1, k));
          cut.base.pivot.position.y = ctx.r0.y + Math.abs(Math.sin(t * 12)) * 0.08;
        },
        say: { who: 'android_19', line: 'EEEEEE—! Doctor! DOCTOR!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // up into the air: one arm out straight, the palm flat
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          SL.data.cellKit.placeAir(v, v.pos.clone().add(new THREE.Vector3(0, 6, 0)));
          SL.data.cellKit.faceTo(v, ctx.cut.base.pivot.position);
          ctx.cast.target19 = { pos: ctx.cut.base.pivot.position.clone() };
        },
        pose: [{ who: 'vegeta', pose: 'v_bigBangW', face: 'angry', speed: 10 }],
        cam: { from: { at: 'vegeta', local: [1.8, -0.6, 2.4] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 40 },
        tick: (ctx) => {
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(ctx.cast.vegeta.chest().addScaledVector(ctx.cast.vegeta.forward, 0.8), 1.6, 0xbfe4ff, 2, 0.1, 0.3);
        },
        hold: 1.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_bigBang', face: 'shout', speed: 20 }],
        cam: { from: { at: 'vegeta', local: [1.2, 0.2, 1.8] }, look: { at: 'vegeta:head', off: [0, 0.1, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'BIG BANG ATTACK!', duration: 1.8, style: 'shout' },
        hold: 1.2,
      },
      // the sphere goes down; a mushroom of light; a charred head rolling out of the dust
      {
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta, cut = ctx.cut, at = cut.base.pivot.position.clone();
          const from = v.chest().addScaledVector(v.forward, 0.8);
          for (let s = 0; s <= 12; s++) b.vfx.trail(from.clone().lerp(at, s / 12), 0xbfe4ff, 0.6, 0.5);
          b.vfx.explosion(at, 2.2, 0xbfe4ff, { smoke: true });
          b.vfx.ring(at.clone().setY(b.stage.heightAt(at.x, at.z) + 0.2), 8, 0xdff2ff, 0.7, new THREE.Vector3(0, 1, 0));
          for (let i = 0; i < 6; i++) b.vfx.explosion(at.clone().add(new THREE.Vector3(0, 1.5 + i * 1.4, 0)), 1.2 + i * 0.25, 0xffd8a0, { smoke: true });
          b.sfx('explosionHuge', null, { at, vol: 1.3 });
          b.cameraTraumaAt(at, 0.9);
          cut.hide(cut.base);
          for (const p of cut.limbs) cut.hide(p);
          // what is left: the head, blackened, rolling
          const a = ctx.cast.a19;
          a.setHidden(false);
          const head = SL.data.cellKit.sever(b, a, ['head']);
          head.hide(head.base);
          const hp = head.limbs[0];
          hp.pivot.position.copy(at.clone().setY(b.stage.heightAt(at.x, at.z) + 0.3));
          hp.vel.set(3, 2, 1.4);
          hp.spin.set(0, 0, -6);
          hp.rest = 0.2;
          hp.pivot.traverse((o) => {
            if (o.isMesh && o.material && o.material.color) {
              o.material = o.material.clone();
              o.material.color.multiplyScalar(0.25);
            }
          });
          ctx.head = head;
          ctx.cast.boom = { pos: at };
        },
        screen: { flash: 0.3, color: '#dff2ff' },
        cam: { from: { at: 'boom', off: [12, 5, 14] }, look: { at: 'boom', off: [0, 3, 0] }, fov: 50 },
        tick: (ctx) => {
          if (ctx.head) SL.data.cellKit.animatePieces(ctx.b, ctx.head, { gravity: 14 });
        },
        hold: 3,
      },
      {
        cam: { from: { at: 'boom', off: [2.4, 0.8, 2.6] }, look: { at: 'boom', off: [1.6, 0.2, 0.6] }, fov: 42 },
        tick: (ctx) => {
          if (ctx.head) SL.data.cellKit.animatePieces(ctx.b, ctx.head, { gravity: 14 });
        },
        hold: 2,
      },
    ],
    end(ctx) {
      const a = ctx.cast.a19;
      if (a) {
        a.setHidden(true);
        a.untargetable = true;
        a.alive = false;
      }
      if (ctx.cut) ctx.cut.dispose();
      ctx.m.flags.nineteenDown = true;
      ctx.m.flags.bigBang = true;
    },
  };

  S.gero_flees = {
    id: 'gero_flees',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, a20: s.a20, goku: s.goku };
    },
    events: [
      {
        pose: [
          { who: 'a20', pose: 'a19_smug', face: 'shock' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk' },
        ],
        cam: { from: { at: 'a20', off: [2.6, 1.4, 3.4] }, to: { at: 'a20', off: [2, 1.1, 2.6] }, look: { at: 'a20', off: [0, 0.9, 0] }, fov: 44, fov2: 38 },
        say: { who: 'vegeta', line: 'Your turn, doctor. Or do you only build them.', duration: 3.4 },
        hold: 3.6,
      },
      {
        hide: 'a20',
        sfx: { name: 'dash', who: 'a20', vol: 0.8, pitch: 1.2 },
        vfx: { kind: 'dust', at: { at: 'a20' }, radius: 3.4, count: 12 },
        cam: { from: { at: 'vegeta', off: [3.4, 2, 4.4] }, to: { at: 'vegeta', off: [6, 3.4, 8] }, look: { at: 'vegeta', off: [0, 0.9, 0] }, fov: 46, fov2: 54 },
        say: { who: 'vegeta', line: 'Running. Of course he is running.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'knockdown', face: 'hurt' }],
        mood: { amount: 0.3, color: 0x2a3040, seconds: 1.4 },
        cam: { from: { at: 'goku', off: [2.4, 1.2, 3 ] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Take him home. And find whatever the boy gave him.', duration: 3.6 },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const d = cast.a20;
      if (d) {
        d.setHidden(true);
        d.untargetable = true;
      }
      if (cast.vegeta) cast.vegeta.setState('free');
      m.flags.geroFled = true;
    },
  };
})();
