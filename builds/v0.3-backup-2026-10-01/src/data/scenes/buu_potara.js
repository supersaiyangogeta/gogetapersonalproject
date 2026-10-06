/*
 * SCENES — Chapter 13: The Potara, The Earring.
 *
 *   pt_watch     the crystal ball; Gohan losing on Earth; a dead man who cannot help
 *   pt_alive     the halo on the wrong head, and an old Kai flat on his back in the grass, pleased
 *   pt_potara    the earrings explained; the Supreme Kai and Kibito try them: Kibitoshin
 *   pt_leave     "don't lose them" — Instant Transmission (a cue)
 *   er_arrive    Buutenks' ball over Gohan; Goku arrives; Super Saiyan; the Destructo Disc (a cue)
 *   er_disc      cut in half at the waist; a piece spatters off; he pulls himself back together
 *   er_defuse    the thirty minutes run out inside him: Buuccolo in Piccolo's cape and gi
 *   er_fumble    "Gohan! Catch!" (a cue) — and it is gone into the rubble
 *   er_ambush    the piece of him behind Gohan; the sheet; "DAD!"; the cape comes off: Buuhan
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
  const TK = () => SL.data.trunksKit;
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

  /* ====================================================================== THE POTARA */

  S.pt_watch = {
    id: 'pt_watch',
    cast,
    music: { song: 'vision', level: 1 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          for (const f of [st.goku, st.elder, st.shin, st.kibito]) faceTo(f, st.ball.pos);
          pt(ctx, 'ball', st.ball.pos);
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'angry', speed: 4 },
          { who: 'elder', pose: 'ek_idle', face: 'calm', speed: 3 },
          { who: 'shin', pose: 'sk_idle', face: 'shock', speed: 3 },
          { who: 'kibito', pose: 'kb_idle', face: 'angry', speed: 3 },
        ],
        cam: { from: { at: 'ball', off: [2.2, 0.9, -4.2] }, to: { at: 'ball', off: [1.2, 0.5, -3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 46 },
        tick: (ctx, t) => {
          // blows landing a world away: the ball flashes pink with each one
          if (ctx.b.frame % 38 === 0) {
            story(ctx).ball.hit(0.6 + (ctx.b.frame % 3) * 0.2);
            ctx.b.sfx('punchHeavy', null, { at: story(ctx).ball.pos, vol: 0.35, pitch: 0.8 });
          }
        },
        say: { who: 'shin', line: 'Buutenks is... toying with him. Gohan can\'t even touch him now.', duration: 3.6 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'goku', local: [0.5, 0.6, 2.6] }, look: { at: 'goku:head', off: [0, 0.25, 0] }, fov: 38 },
        tick: (ctx) => {
          if (ctx.b.frame % 30 === 0) story(ctx).ball.hit(0.9);
        },
        say: { who: 'goku', line: 'Gohan...! Old man, send me back! I have to help him!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_point', face: 'angry', speed: 6 }],
        cam: { from: { at: 'elder', local: [0.3, 0.2, 1.6] }, look: { at: 'elder:head' }, fov: 38 },
        say: { who: 'elder_kai', line: 'Send you back? Look up, boy. You\'ve got a halo. The dead don\'t get to go back.', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'shin', pose: 'sk_halt', face: 'calm', speed: 5 }],
        cam: { from: { at: 'shin', local: [0.4, 0.3, 1.8] }, look: { at: 'shin:head' }, fov: 38 },
        say: { who: 'shin', line: 'Elder Kai... there is a way. You know there is.', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_idle', face: 'calm', speed: 3 }],
        cam: { from: { at: 'elder', local: [-1.2, 0.5, 2.6] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'elder_kai', line: '...Hmph. Fine. You can have my life. I\'m seventy-five million years old — I\'ve had plenty of it.', duration: 4.2 },
        hold: 4.4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 5 }],
        cam: { from: { at: 'goku', local: [0.5, 0.35, 1.9] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'Your life? But then you\'d be...', duration: 2.2 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.elder.setPosition(ground(ctx, new V3(0, 0, -1.5)));
          st.goku.setPosition(ground(ctx, new V3(0, 0, 0)));
          faceTo(st.elder, st.goku.pos);
          faceTo(st.goku, st.elder.pos);
        },
        pose: [
          { who: 'elder', pose: 'prayerSit', face: 'calm', speed: 5 },
          { who: 'goku', pose: 'kneelReceive', face: 'calm', speed: 5 },
        ],
        cam: { from: { at: 'goku', off: [3.2, 1.4, 1] }, look: { at: 'elder', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'elder_kai', line: 'Dead, yes, yes. Sit down and stop talking.', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.elder.setPosition(ground(ctx, new V3(0, 0, -1.5)));
      st.goku.setPosition(ground(ctx, new V3(0, 0, 0)));
      faceTo(st.elder, st.goku.pos);
      faceTo(st.goku, st.elder.pos);
    },
  };

  S.pt_alive = {
    id: 'pt_alive',
    cast,
    music: { song: 'vision', level: 2 },
    events: [
      {
        pose: [
          { who: 'elder', pose: 'lieBack', face: 'soft', speed: 3 },
          { who: 'goku', pose: 'kneelReceive', face: 'shock', speed: 3 },
        ],
        cam: { from: { at: 'elder', off: [1.6, 1.4, 1.2] }, look: { at: 'elder', off: [0, -0.2, 0] }, fov: 42 },
        say: { who: 'elder_kai', line: 'Ahhh... that\'s better. Being dead is very relaxing. I should have tried it sooner.', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'goku', pose: 'lookHands', face: 'shock', speed: 5 }],
        cam: { from: { at: 'goku', local: [0.3, 0.5, 1.6] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'My halo\'s gone... I\'m alive! I\'m really alive!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.revived = true;
    },
  };

  S.pt_potara = {
    id: 'pt_potara',
    cast,
    music: { song: 'vision', level: 2 },
    events: [
      // the earrings off his ears, into his palm
      {
        call: (ctx) => {
          const st = story(ctx);
          st.elder.setPosition(ground(ctx, new V3(-1.2, 0, -2.4)));
          faceTo(st.elder, st.goku.pos);
          faceTo(st.goku, st.elder.pos);
          K().toForm(st.elder, 'bare');
          st.elder.model.addProp({ id: 'potaraHand', shape: 'potara', joint: 'handR', pos: [0, -0.08, 0.03], scale: 2 });
          st.goku.setState('scripted', { pose: 'idle', expression: 'calm' });
        },
        pose: [
          { who: 'elder', pose: 'offerPalm', face: 'calm', speed: 5 },
          { who: 'goku', pose: 'idle', face: 'calm', speed: 4 },
        ],
        cam: { from: { at: 'elder', local: [0.45, 0.15, 1.4] }, look: { at: 'elder', off: [0, 0.15, 0] }, fov: 38 },
        say: { who: 'elder_kai', line: 'Now listen. These are the Potara — the Kais\' own treasure. No ordinary earrings!', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_point', face: 'angry', speed: 6 }],
        cam: { from: { at: 'elder', local: [1.8, 0.5, 2.2] }, look: { at: 'elder', off: [0, 0.25, 0] }, fov: 44 },
        say: { who: 'elder_kai', line: 'Two people wear them, one on the left ear and one on the right — and they become one. Not added together: multiplied!', duration: 4.6 },
        hold: 4.8,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { from: { at: 'goku', local: [1.0, 0.35, 1.5] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'Whoa! So it\'s like the Fusion Dance?', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_point', face: 'angry', speed: 8 }],
        cam: { from: { at: 'elder', local: [0.25, 0.05, 1.1] }, look: { at: 'elder:head' }, fov: 36 },
        say: { who: 'elder_kai', line: 'It is FAR superior to your silly dance! No poses, no matching power, no thirty minutes. Supreme Kai! Show him.', duration: 4.4, style: 'shout' },
        hold: 4.6,
      },
      // the Supreme Kai takes one of his own off and gives it to Kibito
      {
        call: (ctx) => {
          const st = story(ctx);
          st.shin.setPosition(ground(ctx, new V3(2.8, 0, -1.6)));
          st.kibito.setPosition(ground(ctx, new V3(5.6, 0, -1.6)));
          faceTo(st.shin, st.kibito.pos);
          faceTo(st.kibito, st.shin.pos);
          K().toForm(st.shin, 'oneEar');
          pt(ctx, 'pair', st.shin.pos.clone().lerp(st.kibito.pos, 0.5));
        },
        pose: [
          { who: 'shin', pose: 'offerPalm', face: 'calm', speed: 5 },
          { who: 'kibito', pose: 'earringR', face: 'shock', speed: 5 },
        ],
        cam: { from: { at: 'pair', off: [0, 1.2, 5] }, look: { at: 'pair', off: [0, 0.9, 0] }, fov: 42 },
        say: { who: 'kibito', line: 'M-Master? On my right ear...?', duration: 2.2 },
        hold: 2.4,
      },
      {
        call: (ctx) => VK().earOn(story(ctx).kibito, -1),
        pose: [
          { who: 'shin', pose: 'sk_idle', face: 'calm', speed: 5 },
          { who: 'kibito', pose: 'kb_idle', face: 'calm', speed: 5 },
        ],
        cam: { from: { at: 'kibito', local: [0.6, 0.5, 1.4] }, look: { at: 'kibito:head' }, fov: 34 },
        vfx: { kind: 'flash', at: { at: 'kibito:head' }, size: 0.6, color: 0xfff0a0 },
        sfx: { name: 'itPop', who: 'kibito', pitch: 1.6 },
        hold: 1.2,
      },
      // the pull
      {
        cam: { from: { at: 'pair', off: [0, 1.6, 6.5] }, look: { at: 'pair', off: [0, 1.2, 0] }, fov: 46 },
        call: (ctx) => {
          const st = story(ctx);
          ctx.pull = { a0: st.shin.pos.clone(), c0: st.kibito.pos.clone(), mid: ctx.cast.pair.pos.clone().add(new V3(0, 1, 0)) };
          for (const f of [st.shin, st.kibito]) f.grounded = false;
          ctx.b.sfx('rumble', null, { at: ctx.cast.pair.pos, vol: 0.6, pitch: 1.4 });
        },
        pose: [
          { who: 'shin', pose: 'pulled', face: 'shock', speed: 8 },
          { who: 'kibito', pose: 'pulled', face: 'shock', speed: 8 },
        ],
        tick: (ctx, t) => {
          const st = story(ctx), p = ctx.pull;
          const k = Math.min(1, t / 1.4), e = k * k * k;
          st.shin.setPosition(p.a0.clone().lerp(p.mid, e * 0.96));
          st.kibito.setPosition(p.c0.clone().lerp(p.mid, e * 0.96));
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.flash(st.kibito.chest(), 0.5 + k, 0xfff0a0, 0.12, SL.Toon.tex.glow);
        },
        say: { who: 'shin', line: 'It\'s pulling us—!', duration: 1.4, style: 'shout' },
        hold: 1.5,
      },
      // the flash
      {
        call: (ctx) => {
          const st = story(ctx);
          const at = ctx.pull.mid.clone();
          for (const f of [st.shin, st.kibito]) f.setHidden(true);
          st.kibitoshin.setHidden(false);
          st.kibitoshin.setPosition(ground(ctx, at));
          st.kibitoshin.grounded = true;
          faceTo(st.kibitoshin, st.goku.pos);
          ctx.b.vfx.explosion(at, 4, 0xfff4c0, { smoke: false });
          ctx.b.vfx.ring(ground(ctx, at, 0.2), 8, 0xffffff, 0.6, new V3(0, 1, 0));
          SL.ScreenFX.flash(0.9, '#ffffff');
          ctx.b.sfx('transformBurst', st.kibitoshin, { pitch: 1.3 });
        },
        pose: [{ who: 'kibitoshin', pose: 'lookHands', face: 'shock', speed: 5 }],
        cam: { from: { at: 'kibitoshin', local: [0.6, 0.5, 2.8] }, look: { at: 'kibitoshin', off: [0, 0.3, 0] }, fov: 42 },
        hold: 1.8,
      },
      {
        cam: { from: { at: 'kibitoshin', local: [0.3, 0.3, 1.5] }, look: { at: 'kibitoshin:head' }, fov: 34 },
        say: { who: 'kibitoshin', line: '...It worked. We\'re... one.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 6 }],
        cam: { from: { at: 'goku', local: [1.1, 0.35, 1.4] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'Wow!! Just like that! No dance or anything!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_idle', face: 'grin', speed: 8 }],
        cam: { from: { at: 'elder', local: [0.25, 0.05, 1.1] }, look: { at: 'elder:head' }, fov: 36 },
        say: { who: 'elder_kai', line: 'Hee hee! And it\'s PERMANENT!', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'kibitoshin', pose: 'sk_halt', face: 'shock', speed: 10 }],
        cam: { from: { at: 'kibitoshin', local: [0.3, 0.3, 1.4] }, look: { at: 'kibitoshin:head' }, fov: 34 },
        say: { who: 'kibitoshin', line: 'PERMANENT?!', duration: 1.6, style: 'shout' },
        hold: 1.8,
      },
      // the Old Kai's own pair, into Goku's hand
      {
        call: (ctx) => {
          const st = story(ctx);
          st.elder.model.removeProp('potaraHand');
          st.goku.model.addProp(SL.data.potaraMission.HAND_POTARA);
        },
        pose: [
          { who: 'goku', pose: 'offerPalm', face: 'grin', speed: 5 },
          { who: 'elder', pose: 'ek_point', face: 'angry', speed: 5 },
        ],
        cam: { from: { at: 'goku', local: [1.3, 0.5, 0.7] }, look: { at: 'goku', local: [0.1, 0.15, 0.4] }, fov: 36 },
        say: { who: 'elder_kai', line: 'Here — mine. Find somebody strong, put one on each of you, and for goodness\' sake DON\'T LOSE THEM.', duration: 4.4 },
        hold: 4.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      K().toForm(st.elder, 'bare');
      st.elder.model.removeProp('potaraHand');
      K().toForm(st.shin, 'oneEar');
      for (const f of [st.shin, st.kibito]) f.setHidden(true);
      st.kibitoshin.setHidden(false);
      if (!st.goku.model.props.potaraHand) st.goku.model.addProp(SL.data.potaraMission.HAND_POTARA);
      ctx.m.flags.kibitoshin = true;
    },
  };

  S.pt_leave = {
    id: 'pt_leave',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.setPosition(ground(ctx, new V3(0, 0, 1)));
          faceTo(st.goku, new V3(0, 0, 30));
          pt(ctx, 'sky', st.goku.pos.clone().add(new V3(0, 4, 20)));
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.5, 0.4, 2.2] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'Thanks, old man. I won\'t lose them. Promise!', duration: 2.6 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'calm', speed: 8 }],
        cam: { from: { at: 'goku', local: [0.3, 0.3, 1.3] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: 'Gohan\'s ki... it\'s faint. But I\'ve got it.', duration: 2.4, style: 'quiet' },
        hold: 2.2,
      },
      { cam: { from: { at: 'goku', local: [0.3, 0.3, 1.3] }, look: { at: 'goku:head' }, fov: 32 }, cue: { key: 's2', label: 'Instant Transmission', auto: 8 } },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
          ctx.b.vfx.ring(st.goku.chest(), 2, 0xbfe6ff, 0.3);
          ctx.b.sfx('teleport', st.goku, { pitch: 1.1 });
          st.goku.setHidden(true);
        },
        cam: { from: { at: 'sky', off: [0, -2, -20] }, look: { at: 'elder', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'elder_kai', line: '...He\'s going to lose them. I can feel it.', duration: 2.6 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      story(ctx).goku.setHidden(true);
      ctx.m.flags.leftForEarth = true;
    },
  };

  /* ====================================================================== THE EARRING */

  const EM = () => SL.data.earringMission;

  S.er_arrive = {
    id: 'er_arrive',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      // Buutenks over a beaten boy, a sphere of pink building over his head
      {
        call: (ctx) => {
          const st = story(ctx);
          st.gohan.setPosition(ground(ctx, EM().GOHAN_AT));
          st.bt.setPosition(ground(ctx, EM().BUU_AT.clone().add(new V3(0, 0, 3))));
          faceTo(st.bt, st.gohan.pos);
          faceTo(st.gohan, st.bt.pos);
          st.orb.visible = true;
        },
        pose: [
          { who: 'gohan', pose: 'kneelGrieve', face: 'hurt', speed: 4 },
          { who: 'bt', pose: 'sb_skyW', face: 'grin', speed: 5 },
        ],
        mood: { amount: 0.3, color: 0x1a1024, seconds: 1 },
        cam: { from: { at: 'gohan', local: [1.4, -0.2, -1.6] }, look: { at: 'bt', off: [0, 1.4, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const h = st.bt.model.joints.handR.getWorldPosition(new V3()).sub(st.bt.object.position).add(st.bt.pos);
          st.orb.position.copy(h).add(new V3(0, 1.4 + t * 0.3, 0));
          st.orb.scale.setScalar(0.6 + Math.min(1, t / 3) * 1.2);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.streamInward(st.orb.position, 3, 0xff7ab8, 2, 0.14, 0.4);
        },
        say: { who: 'buutenks', line: 'You were fun for a while, Gohan. Say goodbye!', duration: 3 },
        hold: 3.2,
      },
      // a shimmer beside the boy
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.setHidden(false);
          st.goku.setPosition(ground(ctx, EM().GOHAN_AT.clone().add(new V3(-1.6, 0, 1.2))));
          faceTo(st.goku, st.bt.pos);
          ctx.b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
          ctx.b.vfx.ring(st.goku.chest(), 2, 0xbfe6ff, 0.3);
          ctx.b.sfx('teleport', st.goku, { pitch: 1.1 });
        },
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'angry', speed: 10 }],
        cam: { from: { at: 'goku', local: [0.6, 0.4, 2.2] }, look: { at: 'goku:head' }, fov: 38 },
        hold: 1.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock', speed: 4 }],
        cam: { from: { at: 'gohan', local: [-0.5, 0.1, 1.5] }, look: { at: 'gohan:head' }, fov: 36 },
        say: { who: 'adult_gohan', line: 'D-Dad...? No halo...?', duration: 2 },
        hold: 2.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const i = st.goku.def.forms.findIndex((x) => x.id === 'ssj');
          st.goku.applyForm(i);
          ctx.b.vfx.explosion(st.goku.chest(), 2.4, 0xffd33a, { smoke: false });
          ctx.b.vfx.ring(ground(ctx, st.goku.pos, 0.2), 5, 0xffd33a, 0.5, new V3(0, 1, 0));
          ctx.b.sfx('transformBurst', st.goku);
          SL.ScreenFX.flash(0.5, '#fff4b0');
        },
        pose: [{ who: 'goku', pose: 'powerUp', face: 'shout', speed: 14 }],
        cam: { from: { at: 'goku', local: [1.2, 0.2, 3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 44 },
        hold: 1.2,
      },
      // the disc on the flat of his hand
      {
        pose: [{ who: 'goku', pose: 'discRaise', face: 'angry', speed: 8 }],
        cam: { from: { at: 'goku', local: [1.4, -0.3, 2.6] }, look: { at: 'goku', off: [0, 1.4, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const h = st.goku.model.joints.handR.getWorldPosition(new V3()).sub(st.goku.object.position).add(st.goku.pos);
          st.disc.set(h.add(new V3(0, 0.25, 0)), Math.min(1.1, t * 1.2));
        },
        sfx: { name: 'kiCharge', who: 'goku', pitch: 1.6 },
        say: { who: 'goku', line: 'Get away from my son!', duration: 1.8, style: 'shout' },
        hold: 1.6,
      },
      {
        tick: (ctx) => {
          const st = story(ctx);
          const h = st.goku.model.joints.handR.getWorldPosition(new V3()).sub(st.goku.object.position).add(st.goku.pos);
          st.disc.set(h.add(new V3(0, 0.25, 0)), 1.1);
        },
        cam: { from: { at: 'goku', local: [1.2, -0.2, 2.4] }, look: { at: 'goku', off: [0, 1.3, 0] }, fov: 46 },
        cue: { key: 'blast', label: 'Destructo Disc', auto: 7, slow: 0.3 },
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.goku.setHidden(false);
      const i = st.goku.def.forms.findIndex((x) => x.id === 'ssj');
      if (st.goku.formIndex !== i) st.goku.applyForm(i);
    },
  };

  S.er_disc = {
    id: 'er_disc',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 4 },
    events: [
      // thrown: the disc flies, low and flat, through his waist
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.from = st.goku.model.joints.handR.getWorldPosition(new V3()).sub(st.goku.object.position).add(st.goku.pos).add(new V3(0, 0.25, 0));
          ctx.waist = st.bt.pos.clone().add(new V3(0, st.bt.height * 0.5, 0));
          ctx.past = ctx.waist.clone().add(ctx.waist.clone().sub(ctx.from).setY(0).normalize().multiplyScalar(30));
          ctx.b.sfx('swordSlash', st.goku, { pitch: 0.7, vol: 1.2 });
        },
        pose: [{ who: 'goku', pose: 'discThrow', face: 'angry', speed: 20 }],
        cam: { from: { at: 'bt', local: [3.2, -0.2, 3.4] }, look: { at: 'bt', off: [0, 0.2, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.45);
          const p = ctx.from.clone().lerp(ctx.waist, k);
          p.y = U.lerp(ctx.from.y, ctx.waist.y, Math.min(1, k * 1.4));
          st.disc.set(p, 1.1);
          if (k >= 1 && !st.cut) {
            // the cut: level, through the waist
            st.cut = SL.data.trunksKit.cutInTwo(ctx.b, st.bt, new V3(0, 1, 0), { any: true, at: ctx.waist });
            ctx.b.vfx.slash(ctx.waist.clone().add(new V3(-1.2, 0, 0)), ctx.waist.clone().add(new V3(1.2, 0, 0)), 0xffe890, 0.3, 0.08);
            ctx.b.cameraTraumaAt(ctx.waist, 0.6);
            ctx.b.sfx('clothTear', st.bt, { pitch: 0.6 });
            st.orb.visible = false;
            ctx.b.vfx.explosion(st.orb.position, 1.4, 0xff7ab8, { smoke: false });
          }
        },
        slow: { scale: 0.35, seconds: 0.8 },
        hold: 1.2,
      },
      // the disc goes on; a piece of him spatters off behind the rocks
      {
        call: (ctx) => {
          const st = story(ctx);
          st.disc.hide();
          const land = ground(ctx, EM().PIECE_AT);
          pt(ctx, 'piece', land);
          ctx.spatFrom = ctx.waist.clone();
        },
        cam: { from: { at: 'piece', off: [3, 1.6, 3] }, look: { at: 'piece', off: [0, 0.2, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.8);
          const p = ctx.spatFrom.clone().lerp(ctx.cast.piece.pos, k);
          p.y += Math.sin(k * Math.PI) * 3;
          st.piece.crawl(0, t);
          st.piece.worm.position.copy(p.clone().sub(st.piece.path[0]));
          if (k >= 1 && !ctx.splat) {
            ctx.splat = true;
            st.piece.worm.position.set(0, 0, 0);
            ctx.b.sfx('stretch', null, { at: ctx.cast.piece.pos, pitch: 1.3, vol: 0.8 });
          }
        },
        hold: 1.2,
      },
      // the halves drifting
      {
        cam: { from: { at: 'bt', local: [2.6, 0.2, 4.6] }, look: { at: 'bt', off: [0, 0.2, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 1.2);
          const a = 0.15 + k * 0.45;
          st.cut.set(a, -a, 0);
        },
        say: { who: 'goku', line: 'Gohan! You okay?!', duration: 1.8 },
        hold: 2,
      },
      {
        cam: { from: { at: 'bt', local: [0.8, 1.2, 2.6] }, look: { at: 'bt', off: [0, 1.5, 0] }, fov: 40 },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.cut.set(0.6, -0.6, 0);
        },
        say: { who: 'buutenks', line: 'Hehehe... cut me in half? You think that does anything to ME?', duration: 3 },
        hold: 3.2,
      },
      // back together
      {
        cam: { from: { at: 'bt', local: [2.2, 0.2, 4] }, look: { at: 'bt', off: [0, 0.3, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.9);
          const a = 0.6 * (1 - k * k);
          st.cut.set(a, -a, 0);
          if (k >= 1 && st.cut.halves.length) {
            st.cut.dispose();
            st.bt.setHidden(false);
            ctx.b.sfx('regrow', st.bt);
          }
        },
        hold: 1.3,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      if (st.cut) {
        st.cut.dispose();
        st.cut = null;
      }
      st.disc.hide();
      st.orb.visible = false;
      st.bt.setHidden(false);
      st.piece.crawl(0, 0);
      st.piece.worm.position.set(0, 0, 0);
      ctx.m.flags.bisected = true;
    },
  };

  S.er_defuse = {
    id: 'er_defuse',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      // something wrong inside him
      {
        pose: [{ who: 'bt', pose: 'bt_convulse', face: 'shock', speed: 8 }],
        cam: { from: { at: 'bt', local: [0.6, 0.4, 2.4] }, look: { at: 'bt:head' }, fov: 38 },
        tick: (ctx, t) => {
          const st = story(ctx);
          if (ctx.b.frame % 10 === 0) ctx.b.cameraTraumaAt(st.bt.pos, 0.15);
        },
        say: { who: 'buutenks', line: 'Wh— what? Something\'s... wrong... inside...', duration: 2.6 },
        hold: 2.8,
      },
      // the thirty minutes, up, in his stomach: he heaves, steams, and the shape flickers
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bc.setPosition(st.bt.pos.clone());
          st.bc.yaw = st.bc.prevYaw = st.bt.yaw;
          st.bc.setState('scripted', { pose: 'bc_hurt', expression: 'hurt' });
        },
        sfx: { name: 'steam', who: 'bt', vol: 1, dur: 2.6 },
        cam: { from: { at: 'bt', local: [2.2, 0.1, 4.2] }, look: { at: 'bt', off: [0, 0.4, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 2.4);
          VK().steam(ctx.b, st.bt.hidden ? st.bc : st.bt, 0.6 + k * 0.6);
          VK().flicker(ctx.b, st.bt, st.bc, k);
          if (ctx.b.frame % 8 === 0) ctx.b.cameraTraumaAt(st.bt.pos, 0.2 + k * 0.2);
        },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bt.setHidden(true);
          st.bc.setHidden(false);
          ctx.b.vfx.explosion(st.bc.chest(), 2, 0xffc0e0, { smoke: true });
          ctx.b.sfx('capsulePop', st.bc, { pitch: 0.7 });
        },
        pose: [{ who: 'bc', pose: 'bc_embarrassed', face: 'grit', speed: 6 }],
        cam: { from: { at: 'bc', local: [0.8, 0.6, 3.4] }, look: { at: 'bc', off: [0, 0.4, 0] }, fov: 42 },
        hold: 2,
      },
      // the cape, the gi: close on them
      {
        cam: { from: { at: 'bc', local: [-1.6, 0.8, -2.4] }, look: { at: 'bc', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'goku', line: '...Huh? That\'s Piccolo\'s cape.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'laughPoint', face: 'grin', speed: 8 }],
        cam: { from: { at: 'goku', local: [0.5, 0.4, 2] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'Ha! Look at you! The fusion wore off inside you, didn\'t it?! Your power dropped like a stone — you\'re wearing Piccolo\'s clothes!', duration: 4.4, style: 'shout' },
        hold: 4.6,
      },
      {
        pose: [{ who: 'bc', pose: 'bc_embarrassed', face: 'grit', speed: 8 }],
        cam: { from: { at: 'bc', local: [0.3, 0.4, 1.6] }, look: { at: 'bc:head' }, fov: 34 },
        tick: (ctx) => {
          const st = story(ctx);
          if (ctx.b.frame % 20 === 0) ctx.b.vfx.sparks(st.bc.model.joints.head.getWorldPosition(new V3()).sub(st.bc.object.position).add(st.bc.pos).add(new V3(0.12, 0.1, 0.1)), 0xbfe6ff, 3, 2, 0.05);
        },
        say: { who: 'buuccolo', line: 'Grrr... shut up. SHUT UP!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      // Goku powers down: Gohan can handle this one now — but just in case...
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.applyForm(0);
          ctx.b.vfx.flash(st.goku.chest(), 1.6, 0xfff4b0, 0.2, SL.Toon.tex.glow);
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { from: { at: 'goku', local: [0.6, 0.4, 2.2] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'Gohan doesn\'t even need my help now. But... let\'s make sure.', duration: 3 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.bt.setHidden(true);
      st.bt.untargetable = st.bt.intangible = true;
      st.bc.setHidden(false);
      st.bc.setPosition(ground(ctx, EM().BUU_AT.clone().add(new V3(0, 0, 3))));
      if (st.goku.formIndex !== 0) st.goku.applyForm(0);
      ctx.m.flags.buuccolo = true;
    },
  };

  S.er_fumble = {
    id: 'er_fumble',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 2 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.gohan.pos);
          faceTo(st.gohan, st.goku.pos);
        },
        pose: [
          { who: 'goku', pose: 'offerPalm', face: 'grin', speed: 6 },
          { who: 'gohan', pose: 'idle', face: 'calm', speed: 4 },
        ],
        cam: { from: { at: 'goku', local: [-0.8, 0.5, -2] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Gohan! Catch this! Put it on your LEFT ear!', duration: 2.6, style: 'shout' },
        hold: 2.4,
      },
      { pose: [{ who: 'goku', pose: 'tossW', face: 'grin', speed: 8 }], cam: { from: { at: 'goku', local: [-0.8, 0.5, -2] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 40 }, cue: { key: 'light', label: 'Toss it', auto: 6 } },
      // the toss
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.a = st.goku.chest().add(new V3(0, 0.2, 0));
          ctx.c = st.gohan.chest().add(new V3(0, 0.6, 0));
          st.earring.group.visible = true;
        },
        pose: [
          { who: 'goku', pose: 'toss', face: 'grin', speed: 16 },
          { who: 'gohan', pose: 'reachUp', face: 'shock', speed: 8 },
        ],
        cam: { from: { at: 'gohan', local: [1.6, 0.2, 2.6] }, look: { at: 'gohan', off: [0, 0.8, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 1);
          const p = ctx.a.clone().lerp(ctx.c, k);
          p.y += Math.sin(k * Math.PI) * 2.4;
          st.earring.group.position.copy(p);
          st.earring.group.rotation.y += 0.3;
        },
        hold: 1,
      },
      // through his fingers: slow
      {
        call: (ctx) => {
          ctx.drop0 = story(ctx).earring.group.position.clone();
          ctx.dropTo = ground(ctx, story(ctx).gohan.pos.clone().addScaledVector(story(ctx).gohan.forward, 0.7).add(new V3(0.6, 0, 0)), 0.05);
          pt(ctx, 'drop', ctx.dropTo);
        },
        cam: { from: { at: 'gohan', local: [0.5, 0.2, 0.9] }, look: { at: 'gohan', local: [0, 0.3, 0.4] }, fov: 32 },
        slow: { scale: 0.25, seconds: 1.4 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 1.4);
          st.earring.group.position.copy(ctx.drop0).lerp(ctx.dropTo, k * k);
          st.earring.group.rotation.x += 0.2;
        },
        say: { who: 'adult_gohan', line: 'Ah—!', duration: 1, style: 'shout' },
        hold: 1.5,
      },
      // gone into the rubble
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.vfx.dust(ctx.dropTo, 0.6, 6, ctx.b.stage.dustColor);
          ctx.b.sfx('rockBreak', null, { at: ctx.dropTo, vol: 0.3, pitch: 1.8 });
          st.earring.group.visible = false;
        },
        pose: [{ who: 'gohan', pose: 'digKneel', face: 'shock', speed: 6 }],
        cam: { from: { at: 'drop', off: [1.2, 1.2, 1.6] }, look: { at: 'drop' }, fov: 40 },
        say: { who: 'goku', line: 'Gohan! What are you doing?!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'gohan', local: [0.6, 0.3, 1.6] }, look: { at: 'gohan:head' }, fov: 36 },
        say: { who: 'adult_gohan', line: 'I— I\'m sorry! It\'s in the rocks somewhere! Just a second!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      // behind the rocks, something small and pink starts to move
      {
        call: (ctx) => pt(ctx, 'rocks', ground(ctx, EM().PIECE_AT)),
        cam: { from: { at: 'rocks', off: [1.8, 0.6, 2] }, look: { at: 'rocks', off: [0, 0.1, 0] }, fov: 36 },
        tick: (ctx, t) => story(ctx).piece.crawl(Math.min(0.08, t * 0.02), t),
        sfx: { name: 'stretch', at: { at: 'rocks' }, pitch: 1.6, vol: 0.5 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.earring.group.visible = false;
      if (!st.goku.model.props.potaraHand) st.goku.model.addProp(EM().HAND_POTARA);
      ctx.m.flags.fumbled = true;
    },
  };

  S.er_ambush = {
    id: 'er_ambush',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      {
        pose: [{ who: 'gohan', pose: 'foundIt', face: 'grin', speed: 6 }],
        cam: { from: { at: 'gohan', local: [0.6, 0.6, 1.8] }, look: { at: 'gohan', off: [0, 0.3, 0] }, fov: 38 },
        say: { who: 'adult_gohan', line: 'Got it! Dad, I found it!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // Buu in Piccolo's cape, perfectly still, fingers curling
      {
        pose: [{ who: 'bc', pose: 'bc_control', face: 'grin', speed: 4 }],
        cam: { from: { at: 'bc', local: [0.4, 0.3, 1.8] }, look: { at: 'bc:head' }, fov: 34 },
        say: { who: 'buuccolo', line: '(...Heh.)', duration: 1.4, style: 'quiet' },
        hold: 1.6,
      },
      // the worm behind him rears up
      {
        call: (ctx) => {
          const st = story(ctx);
          EM().routeTo(ctx.m, st.gohan);
          pt(ctx, 'behind', st.piece.path[st.piece.path.length - 1]);
        },
        cam: { from: { at: 'behind', off: [2.4, 0.6, 1.6] }, look: { at: 'gohan', off: [0, 0.1, 0] }, fov: 44 },
        tick: (ctx, t) => story(ctx).piece.crawl(0.85 + Math.min(0.15, t * 0.2), t),
        hold: 1,
      },
      // the sheet (the earring drops out of his hand into the dirt)
      {
        call: (ctx) => {
          const st = story(ctx);
          const at = ground(ctx, st.gohan.pos.clone().addScaledVector(st.gohan.forward, 0.6), 0.05);
          st.earring.group.visible = true;
          st.earring.group.position.copy(at);
          ctx.b.vfx.dust(at, 0.5, 4, ctx.b.stage.dustColor);
        },
        pose: [{ who: 'gohan', pose: 'wrapped', face: 'shout', speed: 12 }],
        cam: { from: { at: 'gohan', local: [1.8, 0.4, 2.6] }, look: { at: 'gohan', off: [0, 0.3, 0] }, fov: 42 },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.piece.wrap(st.gohan, Math.min(1, t / 1.2));
        },
        sfx: { name: 'stretch', who: 'gohan', pitch: 0.7, vol: 1.2 },
        say: { who: 'adult_gohan', line: 'Wha— DAD!!', duration: 1.6, style: 'shout' },
        hold: 1.6,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock', speed: 10 }],
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.6] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'GOHAN!!', duration: 1.2, style: 'shout' },
        hold: 1.2,
      },
      // pulled through the air into Buu
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.from = st.gohan.chest();
          st.gohan.untargetable = st.gohan.intangible = true;
        },
        cam: { from: { at: 'bc', local: [3, 0.4, 5] }, look: { at: 'bc', off: [0, 0.6, 0] }, fov: 48 },
        tick: (ctx, t) => {
          const st = story(ctx);
          if (ctx.pulled) return;
          const k = Math.min(1, t / 1.1);
          st.piece.pull(ctx.from, st.bc.chest(), k, st.gohan);
          if (k >= 1) {
            ctx.pulled = true;
            st.gohan.setHidden(true);
            st.piece.hide();
            ctx.b.sfx('regrow', st.bc, { pitch: 0.7, vol: 1.2 });
          }
        },
        hold: 1.3,
      },
      // the cape comes apart; steam; the change
      {
        pose: [{ who: 'bc', pose: 'bc_hurt', face: 'shout', speed: 8 }],
        sfx: { name: 'steam', who: 'bc', vol: 1.2, dur: 2.6 },
        cam: { from: { at: 'bc', local: [2.2, 0.2, 4.4] }, look: { at: 'bc', off: [0, 0.5, 0] }, fov: 46 },
        call: (ctx) => {
          const st = story(ctx);
          st.bh.setPosition(st.bc.pos.clone());
          st.bh.yaw = st.bh.prevYaw = st.bc.yaw;
          st.bh.setState('scripted', { pose: 'bh_emerge', expression: 'shout' });
        },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 2.4);
          VK().steam(ctx.b, st.bc.hidden ? st.bh : st.bc, 0.8 + k * 0.8);
          if (ctx.b.frame % 12 === 0 && !st.bc.hidden) VK().shreds(ctx.b, st.bc, 0xf4f2ee, 5);
          if (k > 0.35) VK().flicker(ctx.b, st.bc, st.bh, k);
          if (ctx.b.frame % 8 === 0) ctx.b.cameraTraumaAt(st.bc.pos, 0.2 + k * 0.4);
        },
        hold: 2.6,
      },
      // out of the steam
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bc.setHidden(true);
          st.bh.setHidden(false);
          ctx.b.vfx.explosion(st.bh.chest(), 3.2, 0xffc0e0, { smoke: true });
          ctx.b.vfx.ring(ground(ctx, st.bh.pos, 0.2), 10, 0xff8ac4, 0.7, new V3(0, 1, 0));
          SL.ScreenFX.flash(0.6, '#ffd0e8');
          ctx.b.sfx('transformBurst', st.bh, { pitch: 0.7 });
          ctx.b.stage.crater(st.bh.pos, 4, 0.4, null);
        },
        pose: [{ who: 'bh', pose: 'bh_emerge', face: 'wicked', speed: 4 }],
        mood: { amount: 0.35, color: 0x24081a, seconds: 1.2 },
        cam: { from: { at: 'bh', local: [0.8, -0.6, 4.6] }, to: { at: 'bh', local: [0.5, -0.2, 3.2] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 46 },
        hold: 2.4,
      },
      // the face: Gohan's jaw in the pink
      {
        pose: [{ who: 'bh', pose: 'bh_idle', face: 'wicked', speed: 4 }],
        cam: { from: { at: 'bh', local: [0.3, 0.35, 1.5] }, look: { at: 'bh:head' }, fov: 32 },
        say: { who: 'buuhan', line: 'Ahh... Gohan. What a meal. I can feel all of it — every bit of his power.', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_laugh', face: 'wicked', speed: 6 }],
        cam: { from: { at: 'bh', local: [1.6, -0.4, 3.6] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 44 },
        say: { who: 'buuhan', line: 'Now I am the strongest thing in the universe!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      // one earring in Goku's hand, and nobody left to wear the other
      {
        pose: [{ who: 'goku', pose: 'offerPalm', face: 'grit', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.4, 0.8, 0.9] }, look: { at: 'goku', local: [0.1, 0.1, 0.4] }, fov: 34 },
        say: { who: 'goku', line: '(Gohan... His earring is lying right there in the dirt. And there is nobody left to wear it.)', duration: 3.6, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.gohan.setHidden(true);
      st.gohan.untargetable = st.gohan.intangible = true;
      st.piece.hide();
      st.earring.group.visible = false; // Goku picks it up: both are his again
      st.bc.setHidden(true);
      st.bc.untargetable = st.bc.intangible = true;
      st.bh.setHidden(false);
      if (st.bh.pos.distanceTo(st.bc.pos) > 0.5) st.bh.setPosition(st.bc.pos.clone());
      ctx.m.flags.gohanAbsorbed = true;
      ctx.m.flags.buuhan = true;
    },
  };
})();
