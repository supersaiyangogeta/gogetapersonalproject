/*
 * SCENES — Chapter 11: The Room of Spirit and Time.
 *
 *   tc_arrival     Super Buu comes down out of the sky onto the Lookout; Piccolo asks for an hour
 *   tc_extinction  bored: one hand to the sky and thousands of beams over the horizon; a street in
 *                  Satan City full of people, then empty; "all gone" (world state: humanExtinction)
 *   tc_enter       the palace door; the Room of Spirit and Time; Gotenks waiting
 *   tc_secret      beaten as a Super Saiyan, Gotenks laughs: he has not shown the real thing yet
 *   tc_door        Super Buu growing back again and again; Piccolo destroys the only way out
 *   tc_scream      the scream that tears the dimension open; Buu goes through; they follow
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const FX = () => SL.data.buuChamberFX;
  const TC = () => SL.data.timeChamber;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const ground = (ctx, v, lift = 0) => {
    const p = v.clone();
    if (ctx.b.stage.hasGround) p.y = ctx.b.stage.heightAt(p.x, p.z) + lift;
    return p;
  };
  const faceTo = (f, p) => {
    f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
  };
  const pt = (ctx, name, v) => {
    ctx.cast[name] = { pos: v.clone() };
  };
  const K = () => SL.data.buuKit;

  S.tc_arrival = {
    id: 'tc_arrival',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      // a pink shape coming down out of the blue
      {
        call: (ctx) => {
          const st = story(ctx);
          K().watcher(st.piccolo, 'armsCrossed', 'grit');
          st.piccolo.setPosition(ground(ctx, new V3(-3, 0, 10)));
          faceTo(st.piccolo, st.sup.pos);
        },
        pose: [{ who: 'sup', pose: 'flyDown', face: 'grin', speed: 6 }],
        cam: { from: { at: 'piccolo', local: [1.2, 0.2, -2.4] }, look: { at: 'sup' }, fov: 46 },
        move: { who: 'sup', at: [0, 0, 4], seconds: 2.4, ease: 'out' },
        hold: 0.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.sup.grounded = true;
          ctx.b.vfx.dust(st.sup.pos, 3, 16, 0xe0d8c6);
          faceTo(st.sup, st.piccolo.pos);
        },
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'grin', speed: 5 }],
        sfx: { name: 'groundImpact', who: 'sup' },
        shake: { at: 'sup', amount: 0.4 },
        cam: { from: { at: 'sup', local: [0.5, 0.4, 2.6] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: 'I was told there were fighters here. Strong ones. Where are they?', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'piccolo', local: [0.6, 0.35, 2.2] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'They are not ready. Give them an hour. Then you can have your fight.', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'sup', pose: 'sb_sit', face: 'smirk', speed: 4 }],
        cam: { from: { at: 'sup', local: [2.4, 0.6, 3.4] }, look: { at: 'sup', off: [0, -0.4, 0] }, fov: 42 },
        say: { who: 'sup', line: 'An hour. Fine. I can wait an hour.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.sup.setPosition(ground(ctx, new V3(0, 0, 4)));
      st.sup.grounded = true;
      faceTo(st.sup, st.piccolo.pos);
      st.sup.setState('scripted', { pose: 'sb_sit', expression: 'smirk' });
      ctx.m.flags.superBuuArrived = true;
    },
  };

  S.tc_extinction = {
    id: 'tc_extinction',
    cast,
    clearMood: false,
    events: [
      {
        title: { chapter: '', title: 'A LITTLE LATER', subtitle: '', duration: 1.8 },
        pose: [{ who: 'sup', pose: 'sb_sit', face: 'angry', speed: 3 }],
        cam: { from: { at: 'sup', local: [0.4, 0.3, 2.2] }, look: { at: 'sup:head' }, fov: 36 },
        say: { who: 'sup', line: '...Boring. Waiting is BORING.', duration: 2.4 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'grin', speed: 5 }],
        say: { who: 'sup', line: 'I know. Let\'s play a game while I wait.', duration: 2.6 },
        hold: 2.8,
      },
      // one hand to the sky: the light gathering over it
      {
        pose: [{ who: 'sup', pose: 'sb_skyW', face: 'grin', speed: 6 }],
        mood: { amount: 0.3, color: 0x3a0a28, seconds: 2 },
        sfx: { name: 'beamCharge', who: 'sup', vol: 1 },
        cam: { from: { at: 'sup', local: [1.6, -0.6, 4.2] }, look: { at: 'sup', off: [0, 2.6, 0] }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const top = st.sup.chest().add(new V3(0, 2.4, 0));
          pt(ctx, 'handTop', top);
          ctx.b.vfx.streamInward(top, 2 + t, 0xff6ac4, 3, 0.14, 0.4);
          if (ctx.b.frame % 8 === 0) ctx.b.vfx.flash(top, 0.8 + t * 0.6, 0xff8ad0, 0.2, SL.Toon.tex.glow);
        },
        hold: 2.2,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'shock', speed: 6 }],
        cam: { from: { at: 'piccolo', local: [0.5, 0.35, 2] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'What is he— no. NO! Not the people—', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      // thousands of them, up and over the horizon in every direction
      {
        sfx: { name: 'beamFire', who: 'sup', pitch: 1.4, vol: 1.2 },
        shake: { at: 'sup', amount: 0.5 },
        cam: { from: { at: 'sup', local: [-6, 3, 14] }, look: { at: 'sup', off: [0, 12, 0] }, fov: 60 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const from = st.sup.chest().add(new V3(0, 2.6, 0));
          FX().extinction(ctx.b, st, from, t, 3);
          if (ctx.b.frame % 20 === 0) ctx.b.sfx('kiBlast', null, { at: from, pitch: 1.6 + Math.random() * 0.4, vol: 0.5 });
        },
        hold: 3.4,
      },
      // from above the clouds: the horizon lighting up all the way round
      {
        cam: { from: { at: 'sup', off: [30, 40, 60] }, look: { at: 'sup', off: [0, -20, -120] }, fov: 58 },
        tick: (ctx, t) => {
          const st = story(ctx);
          FX().extinction(ctx.b, st, st.sup.chest().add(new V3(0, 2.6, 0)), 3.4 + t, 3);
        },
        hold: 2.6,
      },
      // a street in Satan City
      {
        fade: { to: 'black', seconds: 0.3 },
        hold: 0.35,
      },
      {
        call: (ctx) => {
          const b = ctx.b, st = story(ctx);
          for (const f of [st.sup, st.piccolo]) f.setHidden(true);
          b.changeStage('satan_city');
          ctx.m.endShot();
          const K = SL.data.buuKit;
          st.civilians = [];
          for (let i = 0; i < 7; i++) {
            const c = b.spawn({ charId: 'civilian', team: 0, pos: K.ground(b, new V3(-6 + i * 2, 0, 20 + (i % 3) * 1.6)) });
            K.watcher(c, i % 2 ? 'idle' : 'cv_cower', i % 2 ? 'calm' : 'shock');
            c.yaw = c.prevYaw = (i % 2 ? 0.4 : -0.3) + Math.PI;
            st.civilians.push(c);
          }
          pt(ctx, 'street', K.ground(b, new V3(0, 0, 21)));
          ctx.m.fade('clear', 0.4);
        },
        cam: { from: { at: 'street', off: [3, 2.2, -10] }, look: { at: 'street', off: [0, 1.4, 0] }, fov: 48 },
        hold: 1.4,
      },
      {
        cam: { from: { at: 'street', off: [3, 2.4, -12] }, look: { at: 'street', off: [0, 2.6, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const b = ctx.b, st = story(ctx);
          st.civilians.forEach((c, i) => {
            const at = 0.3 + i * 0.22;
            const top = c.chest().add(new V3(8 - i * 2, 40, -6));
            if (t > at - 0.4 && t < at) {
              const k = (t - (at - 0.4)) / 0.4;
              b.vfx.trail(top.clone().lerp(c.chest(), k), 0xff6ac4, 0.8, 0.25);
            }
            if (t >= at && !c.hidden) {
              b.vfx.flash(c.chest(), 2.6, 0xff6ac4, 0.3, SL.Toon.tex.glow);
              b.vfx.sparks(c.chest(), 0xffb0d8, 10, 6, 0.08);
              b.sfx('kiBlast', null, { at: c.pos, pitch: 1.3, vol: 0.5 });
              c.setHidden(true);
            }
          });
        },
        hold: 2.4,
      },
      // and then nothing: an empty street, a breeze
      {
        cam: { from: { at: 'street', off: [-4, 1.4, -7] }, look: { at: 'street', off: [2, 1, 6] }, fov: 50 },
        sfx: { name: 'wind', vol: 0.7 },
        music: { song: null },
        tick: (ctx) => {
          if (ctx.b.frame % 20 === 0) {
            const p = story(ctx).civilians.length ? story(ctx).civilians[0].pos : new V3();
            ctx.b.vfx.dust(p.clone().add(new V3(Math.random() * 6 - 3, 0, Math.random() * 4)), 1.2, 4, 0xc8c0b0);
          }
        },
        hold: 3,
      },
      {
        fade: { to: 'black', seconds: 0.4 },
        hold: 0.45,
      },
      // back on the Lookout
      {
        call: (ctx) => {
          const b = ctx.b, st = story(ctx);
          for (const c of st.civilians) if (b.fighters.includes(c)) b.remove(c);
          st.civilians = [];
          b.changeStage('lookout');
          ctx.m.endShot();
          const K = SL.data.buuKit;
          st.sup.setHidden(false);
          st.piccolo.setHidden(false);
          K.place(st.sup, K.ground(b, new V3(0, 0, 4)));
          K.place(st.piccolo, K.ground(b, new V3(-3, 0, 10)));
          faceTo(st.sup, st.piccolo.pos);
          faceTo(st.piccolo, st.sup.pos);
          ctx.m.fade('clear', 0.5);
        },
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'grin', speed: 5 }],
        mood: { amount: 0.2, color: 0x2a0a20, seconds: 0.1 },
        cam: { from: { at: 'sup', local: [0.6, 0.4, 2.6] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: 'Hehehe. All gone. Now I\'m not bored any more.', duration: 3 },
        flag: { humanExtinction: true },
        hold: 3.2,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 3 }],
        cam: { from: { at: 'piccolo', local: [0.6, 0.35, 2.1] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: '...Follow me. Your opponent is waiting. In there.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const b = ctx.b, st = story(ctx), K = SL.data.buuKit;
      for (const c of st.civilians) if (b.fighters.includes(c)) b.remove(c);
      st.civilians = [];
      if (b.stage.def.id !== 'lookout') b.changeStage('lookout');
      st.sup.setHidden(false);
      st.piccolo.setHidden(false);
      ctx.m.fade('clear', 0.3);
      K.place(st.sup, K.ground(b, new V3(0, 0, 4)));
      st.sup.setState('scripted', { pose: 'sb_idle', expression: 'grin' });
      ctx.m.flags.humanExtinction = true;
      // the world remembers it (the story reads this flag from here on)
      if (SL.Save && SL.Save.data && SL.Save.data.flags) SL.Save.data.flags.humanExtinction = true;
    },
  };

  S.tc_enter = {
    id: 'tc_enter',
    cast,
    music: { song: 'vision', level: 1 },
    events: [
      {
        fade: { to: 'black', seconds: 0.6 },
        hold: 0.7,
      },
      {
        call: (ctx) => {
          const b = ctx.b, st = story(ctx);
          b.changeStage('timechamber');
          ctx.m.endShot();
          FX().chamberState(b);
          const K = SL.data.buuKit, D = TC().DOOR;
          K.place(st.sup, K.ground(b, D.clone().add(new V3(-1, 0, 14))));
          K.place(st.gotenks, K.ground(b, new V3(0, 0, 6)));
          faceTo(st.sup, st.gotenks.pos);
          faceTo(st.gotenks, st.sup.pos);
          K.toForm(st.gotenks, 'ssj');
          pt(ctx, 'door', K.ground(b, D));
          ctx.m.fade('clear', 1.2);
        },
        pose: [
          { who: 'sup', pose: 'sb_idle', face: 'calm', speed: 3 },
          { who: 'gotenks', pose: 'gk_idle', face: 'grin', speed: 3 },
        ],
        // white, endless, silent: the building at the door the only thing in it
        cam: { from: { at: 'door', off: [26, 14, 40] }, to: { at: 'door', off: [14, 6, 26] }, look: { at: 'door', off: [0, 3, 0] }, look2: { at: 'door', off: [0, 2, 8] }, fov: 50, fov2: 44, ease: 'inOut' },
        hold: 4.4,
      },
      {
        cam: { from: { at: 'sup', local: [0.6, 0.4, 2.4] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: 'What is this place? There is nothing here.', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [{ who: 'gotenks', pose: 'gk_pose', face: 'grin', speed: 8 }],
        cam: { from: { at: 'gotenks', local: [0.5, 0.3, 2.4] }, look: { at: 'gotenks:head' }, fov: 38 },
        say: { who: 'gotenks', line: 'There\'s ME, pinkie. Took you long enough!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
    ],
    end(ctx) {
      const b = ctx.b, st = story(ctx), K = SL.data.buuKit;
      if (b.stage.def.id !== 'timechamber') b.changeStage('timechamber');
      FX().chamberState(b);
      ctx.m.fade('clear', 0.3);
      K.toForm(st.gotenks, 'ssj');
      ctx.m.flags.inChamber = true;
    },
  };

  S.tc_secret = {
    id: 'tc_secret',
    cast,
    events: [
      {
        pose: [
          { who: 'gotenks', pose: 'gk_uhoh', face: 'hurt', speed: 5 },
          { who: 'sup', pose: 'sb_idle', face: 'smirk', speed: 4 },
        ],
        cam: { from: { at: 'sup', local: [0.8, 0.3, 2.6] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: 'Is that all? You talk a lot for something so small.', duration: 3 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'gotenks', pose: 'gk_pose', face: 'grin', speed: 6 }],
        cam: { from: { at: 'gotenks', local: [0.6, 0.3, 2.3] }, look: { at: 'gotenks:head' }, fov: 38 },
        say: { who: 'gotenks', line: 'Heh... hahaha! That was a warm-up! I haven\'t even shown you my SECRET yet!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'shock', speed: 5 }],
        cam: { from: { at: 'piccolo', local: [0.5, 0.35, 2.1] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'A secret? What did those two do in here...?', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      story(ctx).gotenks.setState('scripted', { pose: 'gk_idle', expression: 'grin' });
    },
  };

  S.tc_door = {
    id: 'tc_door',
    cast,
    events: [
      {
        pose: [
          { who: 'sup', pose: 'sb_roar', face: 'angry', speed: 6 },
          { who: 'gotenks', pose: 'gk_pose', face: 'grin', speed: 5 },
        ],
        sfx: { name: 'regrow', who: 'sup' },
        cam: { from: { at: 'sup', local: [0.6, 0.6, 2.8] }, look: { at: 'sup:head' }, fov: 40 },
        say: { who: 'sup', line: 'Stop — making — FUN of me!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'grit', speed: 4 }],
        cam: { from: { at: 'piccolo', local: [0.6, 0.35, 2.2] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'He grows back from anything. We can\'t finish him — but we can keep him in here.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const d = ground(ctx, TC().DOOR);
          pt(ctx, 'door', d);
          faceTo(st.piccolo, d);
        },
        pose: [{ who: 'piccolo', pose: 'blastR', face: 'angry', speed: 10 }],
        cam: { from: { at: 'piccolo', local: [1.4, 0.6, -3] }, look: { at: 'door', off: [0, 2, 0] }, fov: 46 },
        say: { who: 'piccolo', line: 'Nobody leaves.', duration: 1.6, style: 'quiet' },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const b = ctx.b, d = ground(ctx, TC().DOOR).add(new V3(0, 2, 2));
          b.vfx.explosion(d, 4, 0xffd080);
          b.cameraTraumaAt(d, 0.7);
          if (b.stage.destroyChamberDoor) b.stage.destroyChamberDoor();
        },
        sfx: { name: 'explosionHuge', vol: 1 },
        cam: { from: { at: 'door', off: [10, 5, 18] }, look: { at: 'door', off: [0, 2, 0] }, fov: 48 },
        flag: { doorDestroyed: true },
        hold: 2.2,
      },
      {
        pose: [{ who: 'gotenks', pose: 'gk_uhoh', face: 'shock', speed: 8 }],
        cam: { from: { at: 'gotenks', local: [0.5, 0.3, 2.3] }, look: { at: 'gotenks:head' }, fov: 38 },
        say: { who: 'gotenks', line: 'HEY! How are WE supposed to get out?!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'piccolo', local: [0.5, 0.3, 2.1] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'We don\'t.', duration: 1.6, style: 'quiet' },
        hold: 2,
      },
    ],
    end(ctx) {
      if (ctx.b.stage.destroyChamberDoor) ctx.b.stage.destroyChamberDoor();
      ctx.m.flags.doorDestroyed = true;
    },
  };

  S.tc_scream = {
    id: 'tc_scream',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [{ who: 'sup', pose: 'sb_roar', face: 'shout', speed: 5 }],
        cam: { from: { at: 'sup', local: [0.5, 0.6, 2.6] }, look: { at: 'sup:head' }, fov: 38 },
        say: { who: 'sup', line: 'You think... you can keep ME... in HERE?!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      // the scream: the air shakes, the picture shakes, the sound goes wrong
      {
        call: (ctx) => {
          const st = story(ctx);
          const fwd = st.sup.forward.clone().setY(0).normalize();
          const at = st.sup.chest().addScaledVector(fwd, 5).add(new V3(0, 1.6, 0));
          st.portal = FX().portal(ctx.m, at);
          st.portal.face(st.sup.chest());
          pt(ctx, 'hole', at);
        },
        pose: [
          { who: 'gotenks', pose: 'gk_uhoh', face: 'hurt', speed: 6 },
          { who: 'piccolo', pose: 'p_standHurt', face: 'grit', speed: 6 },
        ],
        sfx: { name: 'roar', who: 'sup', pitch: 0.6, vol: 1.4 },
        mood: { amount: 0.4, color: 0x1a0624, seconds: 2 },
        cam: { from: { at: 'sup', local: [3.4, -0.2, 6.4] }, look: { at: 'sup', off: [0, 1.2, 0] }, fov: 54 },
        tick: (ctx, t) => {
          const b = ctx.b, st = story(ctx);
          b.cameraTraumaAt(st.sup.pos, 0.25 + Math.min(0.5, t * 0.2));
          if (b.frame % 30 === 0) b.sfx('roar', st.sup, { pitch: 0.5 + Math.random() * 0.2, vol: 0.9 });
          if (SL.Audio && SL.Audio.setDream) SL.Audio.setDream(Math.min(0.8, t / 3));
          if (SL.ScreenFX && SL.ScreenFX.vision) SL.ScreenFX.vision(Math.min(0.5, t / 5));
          st.portal.setSize(U.easeInOutCubic(Math.min(1, t / 3.4)));
          st.portal.update(1 / 60);
          if (b.frame % 6 === 0) b.vfx.streamInward(st.portal.group.position, 6, 0xc080ff, 3, 0.16, 0.5);
          // the room itself bends: the building wobbles like something seen through heat
          const G = b.stage.chamber && b.stage.chamber.group;
          if (G) {
            const k = Math.min(1, t / 2);
            G.scale.set(1 + Math.sin(t * 23) * 0.03 * k, 1 + Math.sin(t * 17) * 0.05 * k, 1 + Math.cos(t * 19) * 0.03 * k);
            G.rotation.z = Math.sin(t * 11) * 0.025 * k;
          }
        },
        hold: 3.6,
      },
      // a hole in the world
      {
        cam: { from: { at: 'hole', off: [0, 1, 9] }, look: { at: 'hole' }, fov: 46 },
        tick: (ctx) => {
          const st = story(ctx);
          st.portal.setSize(1);
          st.portal.update(1 / 60);
        },
        hold: 1.8,
      },
      {
        pose: [{ who: 'sup', pose: 'flyForward', face: 'grin', speed: 8 }],
        cam: { from: { at: 'hole', off: [5, 1.4, 6] }, look: { at: 'hole' }, fov: 50 },
        move: { who: 'sup', at: 'hole', seconds: 1.2, ease: 'in', ground: false },
        tick: (ctx) => story(ctx).portal.update(1 / 60),
        hold: 0.1,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const G = ctx.b.stage.chamber && ctx.b.stage.chamber.group;
          if (G) {
            G.scale.set(1, 1, 1);
            G.rotation.z = 0;
          }
          st.sup.setHidden(true);
          ctx.b.vfx.flash(st.portal.group.position, 6, 0xc060ff, 0.3, SL.Toon.tex.glow);
          if (SL.Audio && SL.Audio.setDream) SL.Audio.setDream(0);
          if (SL.ScreenFX && SL.ScreenFX.vision) SL.ScreenFX.vision(0);
        },
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'shout', speed: 6 }],
        cam: { from: { at: 'piccolo', local: [0.5, 0.35, 2.1] }, look: { at: 'piccolo:head' }, fov: 36 },
        say: { who: 'piccolo', line: 'He screamed his way OUT— the hole is closing! After him!', duration: 2.8, style: 'shout' },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.portal.setSize(1 - Math.min(0.35, t * 0.1));
          st.portal.update(1 / 60);
        },
        hold: 2.8,
      },
      {
        pose: [
          { who: 'gotenks', pose: 'flyForward', face: 'grit', speed: 8 },
          { who: 'piccolo', pose: 'flyForward', face: 'grit', speed: 8 },
        ],
        cam: { from: { at: 'hole', off: [-4, 2, 8] }, look: { at: 'hole' }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const hole = st.portal.group.position;
          for (const f of [st.gotenks, st.piccolo]) {
            const p = f.pos.clone().lerp(hole, Math.min(1, t / 1.6) * 0.08);
            f.setPosition(p);
            if (f.pos.distanceTo(hole) < 1.6 && !f.hidden) {
              f.setHidden(true);
              ctx.b.vfx.flash(hole, 4, 0xc060ff, 0.25, SL.Toon.tex.glow);
            }
          }
          st.portal.setSize(Math.max(0, 0.65 - t * 0.12));
          st.portal.update(1 / 60);
        },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.portal.setSize(0);
          ctx.b.vfx.flash(st.portal.group.position, 8, 0xffffff, 0.35, SL.Toon.tex.glow);
          SL.ScreenFX.flash(0.7, '#e8d0ff');
        },
        sfx: { name: 'teleport', pitch: 0.5, vol: 1 },
        cam: { from: { at: 'hole', off: [0, 2, 14] }, look: { at: 'hole' }, fov: 50 },
        hold: 2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.portal) st.portal.setSize(0);
      const G = ctx.b.stage.chamber && ctx.b.stage.chamber.group;
      if (G) {
        G.scale.set(1, 1, 1);
        G.rotation.z = 0;
      }
      if (SL.Audio && SL.Audio.setDream) SL.Audio.setDream(0);
      if (SL.ScreenFX && SL.ScreenFX.vision) SL.ScreenFX.vision(0);
      for (const f of [st.sup, st.gotenks, st.piccolo]) {
        f.setHidden(true);
        f.untargetable = f.intangible = true;
        f.controller = SL.data.buuKit.scripted();
      }
      ctx.m.flags.dimensionTorn = true;
    },
  };
})();
