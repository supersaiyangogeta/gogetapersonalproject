/*
 * SCENES — Chapter 13: Inside Buu.
 *
 *   in_trap    the bait; the sheet torn off his shoulder; the barrier (a cue); swallowed
 *   in_split   inside: the barrier drops, the Potara give out — Goku and Vegeta; the crushed earring
 *   in_pods    Buuhan's face in the wall; tear them free (a cue); the fat Buu's pod; everything heaves
 *   in_out     out through the steam: outside, the body shrinking — and something small standing up
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.buuKit;
  const VK = () => SL.data.vegitoKit;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const ground = (ctx, v, lift = 0) => K().ground(ctx.b, v, lift);
  const faceTo = (f, p) => K().faceTo(f, p);
  const pt = (ctx, name, v) => {
    ctx.cast[name] = { pos: v.clone() };
  };

  S.in_trap = {
    id: 'in_trap',
    cast,
    music: { song: 'finale', level: 3 },
    events: [
      {
        pose: [
          { who: 'bh', pose: 'bh_pant', face: 'hurt', speed: 4 },
          { who: 'vegito', pose: 'vg_armsStand', face: 'calm', speed: 4 },
        ],
        cam: { from: { at: 'vegito', local: [-0.8, 0.5, -2.2] }, look: { at: 'bh', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'vegito', line: '(One blast and he\'s gone... and Gohan, the boys and Piccolo go with him.)', duration: 3.8, style: 'dual quiet' },
        hold: 4,
      },
      {
        cam: { from: { at: 'vegito', local: [0.3, 0.3, 1.4] }, look: { at: 'vegito:head' }, fov: 32 },
        say: { who: 'vegito', line: '(Then I\'ll just have to go in and get them.)', duration: 2.6, style: 'dual quiet' },
        hold: 2.8,
      },
      // the aura sinks; the arms fold; the bait
      {
        call: (ctx) => {
          const v = story(ctx).vegito;
          v.aura.setStyle({ color: 0xffe69a, core: 0xfff6d8, particles: 0xfff0c0, speed: 0.6, sharp: 0 });
        },
        pose: [{ who: 'vegito', pose: 'vg_invite', face: 'cocky', speed: 4 }],
        cam: { from: { at: 'vegito', local: [1.2, 0.3, 3.2] }, look: { at: 'vegito', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'vegito', line: 'Is that really all you\'ve got? What a disappointment. You might as well just absorb me like you did the others.', duration: 4.4, style: 'dual' },
        hold: 4.6,
      },
      {
        pose: [
          { who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 4 },
          { who: 'bh', pose: 'bh_loom', face: 'wicked', speed: 6 },
        ],
        cam: { from: { at: 'bh', local: [0.3, 0.3, 1.8] }, look: { at: 'bh:head' }, fov: 36 },
        say: { who: 'buuhan', line: '...Absorb you? Heh. Heheheh... GLADLY!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
      // the sheet torn off his own shoulder
      {
        call: (ctx) => {
          const st = story(ctx);
          const sh = st.bh.model.joints.shoulderR.getWorldPosition(new V3()).sub(st.bh.object.position).add(st.bh.pos);
          ctx.sh = sh;
          ctx.b.sfx('clothTear', st.bh, { pitch: 0.5, vol: 1.2 });
        },
        pose: [{ who: 'bh', pose: 'bh_tear', face: 'wicked', speed: 8 }],
        cam: { from: { at: 'bh', local: [1.6, 0.4, 2.2] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 40 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 1.2);
          st.sheet.sheet.visible = true;
          st.sheet.sheet.position.copy(ctx.sh).add(new V3(0.2, 0, 0.3));
          st.sheet.sheet.scale.set(0.2 + k * 0.5, 0.15 + k * 0.4, 0.2 + k * 0.5);
        },
        hold: 1.3,
      },
      // flung down, sliding round behind him through the dirt
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          st.sheet.sheet.visible = false;
          const behind = v.pos.clone().addScaledVector(v.forward.clone().setY(0).normalize(), -1.4);
          const side = st.bh.pos.clone().lerp(v.pos, 0.5).add(new V3(3, 0, 0));
          st.sheet.path.length = 0;
          for (const p of [ground(ctx, st.bh.pos.clone().add(new V3(0.6, 0, 0.6))), ground(ctx, side), ground(ctx, behind)]) st.sheet.path.push(p);
          pt(ctx, 'behind', behind);
        },
        pose: [{ who: 'bh', pose: 'bh_fling', face: 'wicked', speed: 12 }],
        cam: { from: { at: 'behind', off: [3, 1.6, 4] }, look: { at: 'vegito', off: [0, -0.4, 0] }, fov: 44 },
        tick: (ctx, t) => story(ctx).sheet.crawl(Math.min(1, t / 1.4), t),
        sfx: { name: 'stretch', at: { at: 'behind' }, pitch: 0.6, vol: 1 },
        hold: 1.5,
      },
      // it rears up round him
      {
        pose: [{ who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 4 }],
        cam: { from: { at: 'vegito', local: [2.4, 0.4, 2.6] }, look: { at: 'vegito', off: [0, 0.4, 0] }, fov: 42 },
        tick: (ctx, t) => story(ctx).sheet.wrap(story(ctx).vegito, Math.min(0.55, t / 1.4)),
        hold: 0.9,
      },
      { cam: { from: { at: 'vegito', local: [3.4, 0.9, 4.2] }, look: { at: 'vegito', off: [0, 0.4, 0] }, fov: 42 }, tick: (ctx) => story(ctx).sheet.wrap(story(ctx).vegito, 0.55), cue: { key: 'guard', label: 'Barrier', auto: 5, slow: 0.2 } },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.barrier.set(1);
          const sm = st.sheet.sheet.material;
          sm.transparent = true;
          sm.opacity = 0.45;
          sm.depthWrite = false;
          for (const ch of st.sheet.sheet.children) if (ch.userData.isOutline) ch.visible = false;
          ctx.b.vfx.flash(st.vegito.chest(), 2.4, 0xb8ffd8, 0.3, SL.Toon.tex.glow);
          ctx.b.sfx('perfectGuard', st.vegito, { pitch: 0.8 });
        },
        pose: [{ who: 'vegito', pose: 'vg_barrier', face: 'cocky', speed: 10 }],
        cam: { from: { at: 'vegito', local: [2.6, 0.7, 3.4] }, look: { at: 'vegito', off: [0, 0.3, 0] }, fov: 40 },
        tick: (ctx, t) => story(ctx).sheet.wrap(story(ctx).vegito, 0.55 + Math.min(0.45, t / 1.2)),
        say: { who: 'vegito', line: '(Perfect... hook, line and sinker.)', duration: 2.4, style: 'dual quiet' },
        hold: 2.4,
      },
      // swallowed
      {
        call: (ctx) => {
          const st = story(ctx);
          const sm = st.sheet.sheet.material;
          sm.opacity = 1;
          sm.transparent = false;
          sm.depthWrite = true;
          for (const ch of st.sheet.sheet.children) if (ch.userData.isOutline) ch.visible = true;
          ctx.from = st.vegito.chest();
          st.vegito.untargetable = st.vegito.intangible = true;
        },
        cam: { from: { at: 'bh', local: [2.6, 0.4, 4.6] }, look: { at: 'bh', off: [0, 0.6, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx);
          if (ctx.pulled) return;
          const k = Math.min(1, t / 1.1);
          st.sheet.pull(ctx.from, st.bh.chest(), k, st.vegito);
          if (k >= 1) {
            ctx.pulled = true;
            st.vegito.setHidden(true);
            st.sheet.hide();
            st.barrier.set(0);
            ctx.b.sfx('regrow', st.bh, { pitch: 0.6, vol: 1.2 });
          }
        },
        hold: 1.3,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_laugh', face: 'wicked', speed: 8 }],
        cam: { from: { at: 'bh', local: [1, -0.4, 3.2] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 44 },
        tick: (ctx) => VK().steam(ctx.b, story(ctx).bh, 0.6),
        say: { who: 'buuhan', line: 'HAHAHAHA! I did it! Now NOTHING can touch me!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.sheet.hide();
      st.barrier.set(0);
      st.vegito.setHidden(true);
      st.vegito.untargetable = st.vegito.intangible = true;
      ctx.m.flags.absorbedOnPurpose = true;
    },
  };

  S.in_split = {
    id: 'in_split',
    cast,
    music: { song: 'vision', level: 2 },
    events: [
      // floating in the dark wet red, inside a bubble of ki
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          v.setHidden(false);
          K().hover(ctx.b, v, new V3(0, 0, 2), 2.6);
          faceTo(v, new V3(0, 0, -20));
          st.barrier.set(1);
        },
        pose: [{ who: 'vegito', pose: 'vg_floatArms', face: 'calm', speed: 4 }],
        cam: { from: { at: 'vegito', off: [6, 1, 8] }, to: { at: 'vegito', off: [3, 0.6, 4] }, look: { at: 'vegito' }, fov: 46 },
        say: { who: 'vegito', line: 'So this is what the inside of Buu looks like. Charming.', duration: 3, style: 'dual' },
        hold: 3.2,
      },
      // the barrier down; the air presses in
      {
        pose: [{ who: 'vegito', pose: 'vg_armsStand', face: 'calm', speed: 4 }],
        cam: { from: { at: 'vegito', local: [0.5, 0.4, 2] }, look: { at: 'vegito:head' }, fov: 36 },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.barrier.set(Math.max(0, 1 - t / 1));
          if (t > 1 && ctx.b.frame % 6 === 0) ctx.b.camera.addTrauma(0.1);
        },
        say: { who: 'vegito', line: 'Now then... where are they— hm?', duration: 2.4, style: 'dual' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_barrier', face: 'shock', speed: 12 }],
        cam: { from: { at: 'vegito', local: [0.4, 0.3, 1.4] }, look: { at: 'vegito:head' }, fov: 32 },
        tick: (ctx) => {
          const st = story(ctx), v = st.vegito;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.flash(v.chest(), 1.6, 0xffffff, 0.12, SL.Toon.tex.glow);
          if (ctx.b.frame % 4 === 0) ctx.b.camera.addTrauma(0.15);
        },
        say: { who: 'vegito', line: 'What—?! Something\'s pulling us apart—!', duration: 2, style: 'dual shout' },
        hold: 1.8,
      },
      // the flash: two again
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          const at = v.chest();
          SL.ScreenFX.flash(1, '#ffffff');
          ctx.b.vfx.explosion(at, 3, 0xfff4c0, { smoke: false });
          ctx.b.sfx('transformBurst', null, { at, pitch: 1.4 });
          st.barrier.set(0);
          if (st.fusion && st.fusion.active) SL.Fusion.defuse(ctx.b, st.fusion, { silent: true, to: st.vegeta });
          for (const f of [st.goku, st.vegeta]) {
            f.setState('scripted', { pose: 'lookHands', expression: 'shock' });
            VK().earOn(f, f === st.goku ? 1 : -1);
          }
          if (!st.vegetaHalo) st.vegetaHalo = SL.Cinema.halo(ctx.b, st.vegeta);
          pt(ctx, 'pair', st.goku.pos.clone().lerp(st.vegeta.pos, 0.5));
        },
        cam: { from: { at: 'pair', off: [0, 1.2, 4.4] }, look: { at: 'pair', off: [0, 0.9, 0] }, fov: 44 },
        hold: 1.8,
      },
      // the earrings crack
      {
        call: (ctx) => {
          const st = story(ctx);
          for (const [f, s] of [[st.goku, 1], [st.vegeta, -1]]) {
            const e = VK().ear(f, s);
            ctx.b.vfx.sparks(e, 0xfff0a0, 8, 3, 0.05);
            ctx.b.vfx.flash(e, 0.5, 0xffffff, 0.15, SL.Toon.tex.glow);
          }
          ctx.b.sfx('clothTear', null, { at: ctx.cast.pair.pos, pitch: 2, vol: 0.5 });
        },
        cam: { from: { at: 'goku', local: [0.5, 0.3, 1.5] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'We split up?! But the Old Kai said it was permanent...!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      // the broken earring, off the ear, crushed
      {
        call: (ctx) => VK().earOff(story(ctx).vegeta),
        pose: [{ who: 'vegeta', pose: 'crushFist', face: 'angry', speed: 6 }],
        cam: { from: { at: 'vegeta', local: [0.4, 0.4, 1.4] }, look: { at: 'vegeta', local: [0, 0.4, 0.3] }, fov: 34 },
        tick: (ctx, t) => {
          const v = story(ctx).vegeta;
          if (t > 0.6 && !ctx.dust) {
            ctx.dust = true;
            const h = v.model.joints.handR.getWorldPosition(new V3()).sub(v.object.position).add(v.pos);
            ctx.b.vfx.sparks(h, 0xf2c82a, 10, 2, 0.04);
            ctx.b.sfx('boneCrack', v, { pitch: 1.8, vol: 0.5 });
          }
        },
        hold: 1.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 5 }],
        cam: { from: { at: 'vegeta', local: [0.3, 0.3, 1.5] }, look: { at: 'vegeta:head' }, fov: 32 },
        say: { who: 'vegeta', line: 'I told you, Kakarot. I am never fusing with you again! Now let\'s go find our sons!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.barrier.set(0);
      if (st.fusion && st.fusion.active) SL.Fusion.defuse(ctx.b, st.fusion, { silent: true, to: st.vegeta });
      VK().earOff(st.goku);
      VK().earOff(st.vegeta);
      ctx.m.flags.defused = true;
    },
  };

  S.in_pods = {
    id: 'in_pods',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      // his face grows out of the wall
      {
        call: (ctx) => {
          const st = story(ctx), f = st.inner;
          f.setHidden(false);
          const wall = ground(ctx, new V3(6, 0, -30));
          f.setPosition(wall.clone().add(new V3(0, 3, 0)));
          f.grounded = false;
          faceTo(f, st.vegeta.pos);
          const s = f.model.baseScale * (f.model._lookScale || 1) * 3.6;
          f.model.root.scale.set(s, s, s);
          pt(ctx, 'wall', f.pos.clone().add(new V3(0, 4, 0)));
          ctx.b.stage.setMood(0.4, 0x3a0818, 1);
        },
        pose: [{ who: 'inner', pose: 'bh_loom', face: 'wicked', speed: 4 }],
        cam: { from: { at: 'vegeta', local: [-0.6, 0.6, -2.4] }, look: { at: 'wall' }, fov: 50 },
        tick: (ctx) => VK().steam(ctx.b, story(ctx).inner, 1),
        say: { who: 'buuhan', line: 'So THIS is what you were after. You\'re not taking them. They\'re MINE!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 5 }],
        cam: { from: { at: 'vegeta', local: [0.4, 0.3, 1.5] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'Kakarot — rip them out. All of them. NOW!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      { cam: { from: { at: 'vegeta', local: [-0.6, 0.6, -2.4] }, look: { at: 'wall' }, fov: 50 }, cue: { key: 'heavy', label: 'Tear them free', auto: 6 } },
      {
        call: (ctx) => {
          const st = story(ctx);
          for (const pod of st.innards.pods.slice(0, 4)) {
            pod.open = true;
            pod.mesh.visible = false;
            pod.stalk.visible = false;
            ctx.b.vfx.explosion(pod.pos, 1.6, 0xffb0d0, { smoke: true });
            if (pod.fighter) {
              pod.fighter.setPosition(ground(ctx, pod.pos));
              pod.fighter.grounded = true;
              pod.fighter.setState('scripted', { pose: 'lieBack', expression: 'ko' });
            }
          }
          ctx.b.sfx('clothTear', null, { at: ctx.cast.wall.pos, pitch: 0.6, vol: 1.2 });
          ctx.b.cameraTraumaAt(ctx.cast.wall.pos, 0.6);
        },
        pose: [{ who: 'inner', pose: 'bh_scream', face: 'shout', speed: 10 }],
        cam: { from: { at: 'wall', off: [8, -2, 14] }, look: { at: 'wall', off: [0, -2, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const f = story(ctx).inner;
          const s = f.model.baseScale * (f.model._lookScale || 1) * 3.6 * Math.max(0.01, 1 - t / 1.8);
          f.model.root.scale.set(s, s, s);
          VK().steam(ctx.b, f, 1);
          if (ctx.b.frame % 5 === 0) ctx.b.camera.addTrauma(0.2);
        },
        say: { who: 'buuhan', line: 'NO— NOOOO!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
      // one pod left: the fat one
      {
        call: (ctx) => {
          const st = story(ctx);
          st.inner.setHidden(true);
          const pod = st.innards.pods[4];
          pt(ctx, 'fatPod', pod.pos);
          faceTo(st.goku, pod.pos);
          faceTo(st.vegeta, pod.pos);
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 5 }],
        cam: { from: { at: 'fatPod', off: [3, 0.6, 5] }, look: { at: 'fatPod' }, fov: 42 },
        say: { who: 'goku', line: 'That\'s the fat Buu — the one Mr. Satan made friends with. If we pull him out too... Vegeta, wait—', duration: 4, style: 'quiet' },
        hold: 4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const pod = st.innards.pods[4];
          pod.open = true;
          pod.mesh.visible = false;
          pod.stalk.visible = false;
          ctx.b.vfx.explosion(pod.pos, 2, 0xffb0d0, { smoke: true });
          if (pod.fighter) {
            pod.fighter.setPosition(ground(ctx, pod.pos));
            pod.fighter.grounded = true;
            pod.fighter.setState('scripted', { pose: 'lieBack', expression: 'ko' });
          }
        },
        pose: [{ who: 'vegeta', pose: 'snatch', face: 'angry', speed: 12 }],
        cam: { from: { at: 'vegeta', local: [0.4, 0.3, 1.6] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'Who cares what happens to him?! Let\'s go!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      // everything heaves
      {
        mood: { amount: 0.55, color: 0x3a0818, seconds: 0.6 },
        cam: { from: { at: 'goku', off: [5, 3, 6] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 50 },
        tick: (ctx) => {
          if (ctx.b.frame % 3 === 0) ctx.b.camera.addTrauma(0.2);
          if (ctx.b.frame % 4 === 0) VK().steam(ctx.b, story(ctx).goku, 1);
        },
        sfx: { name: 'rumble', who: 'goku', vol: 1.2, pitch: 0.6 },
        say: { who: 'goku', line: 'The whole body\'s changing! Grab everyone and get out!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.inner.setHidden(true);
      for (const pod of st.innards.pods) {
        pod.open = true;
        pod.mesh.visible = false;
        pod.stalk.visible = false;
      }
      ctx.m.flags.podsFreed = true;
    },
  };

  S.in_out = {
    id: 'in_out',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 2 },
    events: [
      {
        call: (ctx) => {
          SL.ScreenFX.flash(0.8, '#ffe0ec');
          ctx.m.fade('black', 0.4);
        },
        hold: 0.6,
      },
      // outside: the canyon, steam pouring off a body that is shrinking
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          b.changeStage('rocky_canyon');
          ctx.m.endShot();
          SL.data.princeMission.canyonSet(ctx.m);
          ctx.m.fade('clear', 0.6);
          st.bh.setHidden(false);
          st.bh.untargetable = st.bh.intangible = true;
          st.bh.setPosition(ground(ctx, new V3(0, 0, -6)));
          st.bh.grounded = true;
          for (const [f, x] of [[st.goku, -3], [st.vegeta, -1.8], [st.gohan, 3], [st.goten, 4.4], [st.trunks, 5.2], [st.piccolo, 6.4]]) {
            f.setHidden(false);
            f.setPosition(ground(ctx, new V3(x, 0, 18)));
            f.grounded = true;
            faceTo(f, st.bh.pos);
            f.setState('scripted', { pose: f === st.goku || f === st.vegeta ? 'idle' : 'lieBack', expression: f === st.goku || f === st.vegeta ? 'shock' : 'ko' });
          }
          st.fat.setHidden(true);
          b.stage.setMood(0.35, 0x24081a, 0.5);
          pt(ctx, 'buu', st.bh.pos);
        },
        pose: [{ who: 'bh', pose: 'bh_regen', face: 'hurt', speed: 10 }],
        cam: { from: { at: 'buu', off: [7, 1.4, 12] }, look: { at: 'buu', off: [0, 1.2, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), f = st.bh;
          const k = Math.min(1, t / 3);
          VK().steam(ctx.b, f, 1.4);
          if (ctx.b.frame % 2 === 0) VK().steam(ctx.b, f, 1.4);
          const s = f.model.baseScale * (f.model._lookScale || 1) * (1 - k * 0.45);
          f.model.root.scale.set(s, s * (1 - k * 0.1), s);
          if (ctx.b.frame % 6 === 0) ctx.b.camera.addTrauma(0.15);
        },
        sfx: { name: 'steam', who: 'bh', vol: 1.4 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 5 }],
        cam: { from: { at: 'goku', local: [0.4, 0.35, 1.6] }, look: { at: 'goku:head' }, fov: 34 },
        tick: (ctx) => VK().steam(ctx.b, story(ctx).bh, 1.4),
        say: { who: 'goku', line: 'Buu\'s ki... it\'s dropping — no. It\'s CHANGING.', duration: 2.8 },
        hold: 3,
      },
      // in the steam, something small stands up
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bh.setState('scripted', { pose: 'eb_idle', expression: 'grin' });
          ctx.b.stage.setMood(0.7, 0x0a0208, 1.2);
        },
        cam: { from: { at: 'buu', off: [0, 0.6, 7] }, look: { at: 'buu', off: [0, 0.6, 0] }, fov: 40 },
        tick: (ctx) => {
          const st = story(ctx);
          VK().steam(ctx.b, st.bh, 1.6);
          if (ctx.b.frame % 40 === 0) ctx.b.vfx.flash(SL.data.superVegito.headPoint(st.bh, 0, 0.1, 1), 0.3, 0xff2030, 0.3, SL.Toon.tex.glow);
        },
        say: { who: 'vegeta', line: '...Kakarot. Whatever that is — it isn\'t the one we just fought.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (ctx.b.stage.def.id !== 'rocky_canyon') ctx.b.changeStage('rocky_canyon');
      ctx.m.flags.kidBuuTease = true;
    },
  };
})();
