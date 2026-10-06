/*
 * SCENES — Chapter 13: The Prince Returns, Vegito.
 *
 *   pr_alone      who is left? Gokule, imagined; Buuhan starts shooting
 *   pr_escape     the ki far away; Instant Transmission (a cue); the blast where he stood
 *   pr_canyon     Vegeta on his ledge, halo and all; the back turned; the refusal
 *   pr_plea       behind the boulder: Bulma and Trunks; the earring snatched; "right ear"; permanent
 *   vg_potara     the earrings on; the pull; chest to chest; the pillar of light
 *   vg_reveal     Vegito: shoulders, neck, gloves; two voices at once
 *   vg_challenge  Buuhan, furious, on a ledge; "I was just warming up"
 *
 * Vegito's lines use subtitle style 'dual' (the line doubled in Goku's orange and Vegeta's blue):
 * the game has no recorded voices; the two-voices-at-once identity is carried by the text.
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const K = () => SL.data.buuKit;
  const VK = () => SL.data.vegitoKit;
  const PM = () => SL.data.princeMission;
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

  /* ====================================================================== THE PRINCE RETURNS */

  S.pr_alone = {
    id: 'pr_alone',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.setPosition(ground(ctx, new V3(0, 0, 8)));
          st.bh.setPosition(ground(ctx, new V3(0, 0, -30)));
          faceTo(st.goku, st.bh.pos);
          faceTo(st.bh, st.goku.pos);
        },
        pose: [
          { who: 'goku', pose: 'offerPalm', face: 'grit', speed: 4 },
          { who: 'bh', pose: 'bh_idle', face: 'wicked', speed: 3 },
        ],
        mood: { amount: 0.25, color: 0x1a1024, seconds: 1.5 },
        cam: { from: { at: 'goku', local: [0.3, 0.9, 1.1] }, look: { at: 'goku', local: [0.1, 0.1, 0.4] }, fov: 34 },
        say: { who: 'goku', line: '(Both earrings back... and nobody left to wear the other one.)', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'lookAround', face: 'calm', speed: 3 }],
        cam: { from: { at: 'goku', local: [0.5, 0.4, 2.2] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'Who\'s left...? I can feel Dende. And... Mr. Satan?', duration: 3.2 },
        hold: 3.4,
      },
      // what Goku pictures: himself fused with the World Champion
      {
        call: (ctx) => {
          const st = story(ctx);
          st.gokule.setHidden(false);
          st.gokule.setPosition(ground(ctx, new V3(40, 0, 40)));
          faceTo(st.gokule, st.gokule.pos.clone().add(new V3(0, 0, 10)));
          SL.ScreenFX.vision(0.8);
          ctx.b.sfx('visionIn', null, {});
        },
        pose: [{ who: 'gokule', pose: 'g_peace', face: 'grin', speed: 6 }],
        cam: { from: { at: 'gokule', local: [0.4, 0.5, 2.6] }, look: { at: 'gokule', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'gokule', line: 'Hahaha! Gokule, the World Champion of the whole universe!', duration: 3, style: 'shout' },
        hold: 3,
      },
      {
        call: (ctx) => {
          story(ctx).gokule.setHidden(true);
          SL.ScreenFX.vision(0);
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'hurt', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.4, 0.35, 1.6] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: '...Nope. No way. Absolutely not.', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_taunt', face: 'wicked', speed: 5 }],
        cam: { from: { at: 'bh', local: [0.4, 0.4, 2] }, look: { at: 'bh:head' }, fov: 36 },
        say: { who: 'buuhan', line: 'What\'s the matter, Saiyan? Aren\'t you going to fuse? Pick one of those weaklings — it won\'t change the outcome!', duration: 4.2 },
        hold: 4.4,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_blast', face: 'wicked', speed: 10 }],
        cam: { from: { at: 'goku', local: [-0.8, 0.6, -2.6] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 44 },
        call: (ctx) => {
          const st = story(ctx);
          PM().barrage(ctx.m, st.goku.pos.clone().add(new V3(0, 0, 4)), 6, { damage: 1, spread: 8 });
        },
        hold: 1.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.gokule.setHidden(true);
      SL.ScreenFX.vision(0);
      K().clearCombat(ctx.b);
    },
  };

  S.pr_escape = {
    id: 'pr_escape',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      {
        pose: [
          { who: 'goku', pose: 'twoFingers', face: 'angry', speed: 10 },
          { who: 'bh', pose: 'bh_blastW', face: 'wicked', speed: 6 },
        ],
        cam: { from: { at: 'goku', local: [0.3, 0.3, 1.4] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: 'Vegeta... hang on!', duration: 1.6, style: 'shout' },
        hold: 1.2,
      },
      { cam: { from: { at: 'goku', local: [0.3, 0.3, 1.4] }, look: { at: 'goku:head' }, fov: 32 }, cue: { key: 's2', label: 'Instant Transmission', auto: 6, slow: 0.3 } },
      {
        call: (ctx) => {
          const st = story(ctx);
          const where = st.goku.pos.clone();
          ctx.b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
          ctx.b.sfx('teleport', st.goku, { pitch: 1.1 });
          st.goku.setHidden(true);
          pt(ctx, 'spot', where);
        },
        pose: [{ who: 'bh', pose: 'bh_blast', face: 'wicked', speed: 14 }],
        cam: { from: { at: 'spot', off: [6, 3, 6] }, look: { at: 'spot', off: [0, 0.5, 0] }, fov: 46 },
        tick: (ctx, t) => {
          if (t > 0.35 && !ctx.boom) {
            ctx.boom = true;
            ctx.b.vfx.explosion(ctx.cast.spot.pos.clone().add(new V3(0, 1, 0)), 6, 0xff6ab4, { smoke: true });
            ctx.b.stage.crater(ctx.cast.spot.pos, 5, 0.6, null);
            ctx.b.cameraTraumaAt(ctx.cast.spot.pos, 0.8);
            ctx.b.sfx('explosionBig', null, { at: ctx.cast.spot.pos });
          }
        },
        hold: 1.6,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_search', face: 'angry', speed: 6 }],
        cam: { from: { at: 'bh', local: [0.4, 0.4, 2] }, look: { at: 'bh:head' }, fov: 36 },
        say: { who: 'buuhan', line: '...Gone? Tch. You can run, Saiyan. There\'s nowhere on this planet I can\'t find you.', duration: 3.6 },
        hold: 3.8,
      },
    ],
    end(ctx) {
      story(ctx).goku.setHidden(false);
      ctx.m.flags.escaped = true;
    },
  };

  S.pr_canyon = {
    id: 'pr_canyon',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      // the canyon from below; high over it, a man hanging in the air with his arms folded and a halo
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'ledge', K().ground(ctx.b, PM().LEDGE));
          st.goku.setHidden(true);
          faceTo(st.vegeta, st.vegeta.pos.clone().add(new V3(0, 0, 30)));
        },
        pose: [{ who: 'vegeta', pose: 'floatCross', face: 'angry', speed: 4 }],
        cam: { from: { at: 'ledge', off: [9, 1.2, 13] }, to: { at: 'ledge', off: [5, 2.4, 8] }, look: { at: 'vegeta', off: [0, 0.2, 0] }, fov: 46, fov2: 38 },
        hold: 3,
      },
      // Instant Transmission: Goku pops into the air right beside him, delighted - "gotcha!"
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.setHidden(false);
          faceTo(st.goku, st.vegeta.pos);
          ctx.b.vfx.flash(st.goku.chest(), 2, 0xffffff, 0.2, SL.Toon.tex.glow);
          ctx.b.vfx.ring(st.goku.chest(), 2, 0xbfe6ff, 0.3);
          ctx.b.sfx('teleport', st.goku, { pitch: 1.1 });
          // over Vegeta's shoulder: the finger is levelled at him, and at us
          const os = SL.Cinema.overShoulder(st.vegeta, st.goku, { fov: 38, back: 2.1, side: 0.95, height: 0.45, lookUp: 0.15 });
          pt(ctx, 'os', os.pos);
          pt(ctx, 'os2', os.pos.clone().lerp(st.goku.chest(), 0.18));
        },
        pose: [
          { who: 'goku', pose: 'gotcha', face: 'grin', speed: 6 },
          { who: 'vegeta', pose: 'floatCross', face: 'shock', speed: 4 },
        ],
        cam: { from: { at: 'os' }, to: { at: 'os2' }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 38, fov2: 34 },
        say: { who: 'goku', line: 'Vegeta! I knew it was you!', duration: 2.4 },
        hold: 2.6,
      },
      // the back, turned, in mid-air
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.vegeta, st.vegeta.pos.clone().sub(st.goku.pos).add(st.vegeta.pos));
        },
        pose: [{ who: 'vegeta', pose: 'floatCross', face: 'angry', speed: 5 }],
        cam: { from: { at: 'goku', local: [-0.7, 0.5, -2.2] }, look: { at: 'vegeta', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Get away from me, Kakarot.', duration: 2 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'goku', pose: 'floatOffer', face: 'calm', speed: 5 }],
        cam: { from: { at: 'goku', local: [0.4, 0.4, 1.8] }, look: { at: 'goku:head' }, fov: 36 },
        say: { who: 'goku', line: 'Listen — there\'s no time. Put this on your ear. If we fuse—', duration: 2.8 },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.4, 0.3, 1.5] }, look: { at: 'vegeta:head' }, fov: 32 },
        say: { who: 'vegeta', line: 'I saw what you did from the other world. You had Super Saiyan 3 the whole time we fought — and you let me believe we were equals! You humiliate me even when I\'m dead!', duration: 5.2, style: 'shout' },
        hold: 5.4,
      },
      {
        pose: [{ who: 'goku', pose: 'floatPlead', face: 'angry', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.4, 0.35, 1.6] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'None of that matters now! Buu absorbed Gohan, Goten, Trunks and Piccolo! Everyone is gone!', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'floatCross', face: 'angry', speed: 6 }],
        cam: { from: { at: 'vegeta', local: [-1, 0.3, 2.2] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'I don\'t care! I will never fuse with you. I would rather be erased from existence!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      // pink light on the rim above them
      {
        call: (ctx) => {
          const set = PM().canyonSet(ctx.m);
          pt(ctx, 'rim', set.rimTop);
        },
        cam: { from: { at: 'rim', off: [-6, -6, 12] }, look: { at: 'rim', off: [0, 1.4, 0] }, fov: 42 },
        vfx: { kind: 'flash', at: { at: 'rim', off: [0, 1.4, 0] }, size: 5, color: 0xff7ab8 },
        sfx: { name: 'aura', at: { at: 'rim' }, pitch: 0.6, vol: 0.8 },
        say: { who: 'buuhan', line: 'Found you.', duration: 1.6 },
        hold: 1.8,
      },
      // the first blast goes off between them in the air: both drop out of the sky into the canyon
      {
        call: (ctx) => {
          const st = story(ctx);
          const mid = st.goku.chest().lerp(st.vegeta.chest(), 0.5);
          pt(ctx, 'mid', mid);
          ctx.drop = { g0: st.goku.pos.clone(), v0: st.vegeta.pos.clone(), g1: K().ground(ctx.b, PM().LEDGE.clone().add(new V3(5, 0, 6))), v1: PM().canyonSet(ctx.m).ledgeTop.clone() };
          ctx.b.vfx.explosion(mid, 4, 0xff6ab4, { smoke: true });
          ctx.b.sfx('explosionBig', null, { at: mid });
          ctx.b.cameraTraumaAt(mid, 0.8);
          for (const f of [st.goku, st.vegeta]) f.setState('scripted', { pose: 'flyDown', expression: 'shout' });
        },
        cam: { from: { at: 'mid', off: [8, 1, 10] }, look: { at: 'mid', off: [0, -3, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const st = story(ctx), d = ctx.drop, k = Math.min(1, t / 0.9), e = k * k;
          st.goku.setPosition(d.g0.clone().lerp(d.g1, e));
          st.vegeta.setPosition(d.v0.clone().lerp(d.v1, e));
          for (const f of [st.goku, st.vegeta]) f.prevPos.copy(f.pos);
        },
        hold: 1.1,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.goku.setHidden(false);
      // back on the canyon floor for the run to cover (Vegeta on his ledge)
      K().place(st.goku, K().ground(ctx.b, PM().LEDGE.clone().add(new V3(5, 0, 6))));
      st.vegeta.setPosition(PM().canyonSet(ctx.m).ledgeTop.clone());
      st.vegeta.grounded = true;
      ctx.m.flags.vegetaRefused = true;
    },
  };

  S.pr_plea = {
    id: 'pr_plea',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 3 },
    events: [
      // behind the boulder, the valley exploding round them
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.vegeta.pos);
          faceTo(st.vegeta, st.goku.pos);
          pt(ctx, 'pair', st.goku.pos.clone().lerp(st.vegeta.pos, 0.5));
        },
        pose: [
          { who: 'goku', pose: 'shoulderGrab', face: 'shout', speed: 8 },
          { who: 'vegeta', pose: 'idle', face: 'angry', speed: 6 },
        ],
        cam: { from: { at: 'goku', local: [-0.7, 0.4, -1.4] }, look: { at: 'vegeta:head' }, fov: 38 },
        tick: (ctx, t) => {
          if (ctx.b.frame % 26 === 0) {
            const p = ctx.cast.pair.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 8, 0, -6 - (ctx.b.frame % 5)));
            ctx.b.vfx.explosion(ground(ctx, p, 1), 3, 0xff6ab4, { smoke: true });
            ctx.b.sfx('explosionBig', null, { at: p, vol: 0.6 });
            ctx.b.cameraTraumaAt(p, 0.35);
          }
        },
        say: { who: 'goku', line: 'Vegeta, pull yourself together! Bulma was turned into chocolate and eaten! Trunks and Gohan are inside Buu right now!', duration: 4.4, style: 'shout' },
        hold: 4.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock', speed: 8 }],
        cam: { from: { at: 'vegeta', local: [0.3, 0.3, 1.2] }, look: { at: 'vegeta:head' }, fov: 30 },
        tick: (ctx) => {
          if (ctx.b.frame % 30 === 0) ctx.b.cameraTraumaAt(story(ctx).vegeta.pos, 0.3);
        },
        say: { who: 'goku', line: 'If we don\'t fuse right now, he destroys the universe! Do you want Bulma and Trunks gone forever?!', duration: 3.8, style: 'shout' },
        hold: 4,
      },
      // his jaw: clenched; a vein
      {
        pose: [{ who: 'vegeta', pose: 'crushFist', face: 'grit', speed: 6 }],
        cam: { from: { at: 'vegeta', local: [0.2, 0.25, 1] }, look: { at: 'vegeta:head' }, fov: 28 },
        hold: 1.6,
      },
      { pose: [{ who: 'goku', pose: 'offerPalm', face: 'shout', speed: 6 }], cam: { from: { at: 'vegeta', local: [-0.5, 0.4, -1.3] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 38 }, cue: { key: 'light', label: 'Hold out the earring', auto: 6 } },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.goku.model.removeProp('potaraHand');
          st.vegeta.model.addProp(Object.assign({}, PM().HAND_POTARA));
          ctx.b.sfx('punchLight', st.vegeta, { vol: 0.5, pitch: 1.4 });
        },
        pose: [{ who: 'vegeta', pose: 'snatch', face: 'angry', speed: 18 }],
        cam: { from: { at: 'pair', off: [0, 1.2, 2.8] }, look: { at: 'pair', off: [0, 0.9, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Give me that damn thing! Tell me what to do!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.4, 0.35, 1.6] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'Put it on your right ear! Once we put them on, it\'s permanent — there\'s no going back!', duration: 3.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'snatch', face: 'shout', speed: 10 }],
        cam: { from: { at: 'vegeta', local: [0.3, 0.3, 1.3] }, look: { at: 'vegeta:head' }, fov: 32 },
        say: { who: 'vegeta', line: 'PERMANENT?! You fool — why didn\'t you tell me THAT part first?!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.goku.model.removeProp('potaraHand');
      if (!st.vegeta.model.props.potaraHand) st.vegeta.model.addProp(Object.assign({}, PM().HAND_POTARA));
      K().clearCombat(ctx.b);
      ctx.m.flags.vegetaAgreed = true;
    },
  };

  /* ====================================================================== VEGITO */

  S.vg_potara = {
    id: 'vg_potara',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      // the earrings on: Vegeta's right, Goku's left
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.goku, st.vegeta.pos);
          faceTo(st.vegeta, st.goku.pos);
          pt(ctx, 'pair', st.goku.pos.clone().lerp(st.vegeta.pos, 0.5));
        },
        pose: [
          { who: 'vegeta', pose: 'earringR', face: 'angry', speed: 6 },
          { who: 'goku', pose: 'earringL', face: 'calm', speed: 6 },
        ],
        cam: { from: { at: 'vegeta', local: [0.9, 0.4, 1.2] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'If this doesn\'t work, Kakarot, I\'ll kill you myself.', duration: 2.6 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          VK().earOn(st.vegeta, -1);
          st.vegeta.model.removeProp('potaraHand');
          ctx.b.vfx.flash(VK().ear(st.vegeta, -1), 0.5, 0xfff0a0, 0.2, SL.Toon.tex.glow);
          ctx.b.sfx('itPop', st.vegeta, { pitch: 1.6 });
        },
        cam: { from: { at: 'vegeta', local: [-0.7, 0.6, 1.3] }, look: { at: 'vegeta:head' }, fov: 32 },
        hold: 1,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          VK().earOn(st.goku, 1);
          st.goku.model.removeProp('potaraHand');
          ctx.b.vfx.flash(VK().ear(st.goku, 1), 0.5, 0xfff0a0, 0.2, SL.Toon.tex.glow);
          ctx.b.sfx('itPop', st.goku, { pitch: 1.6 });
        },
        cam: { from: { at: 'goku', local: [0.9, 0.35, 0.7] }, look: { at: 'goku:head' }, fov: 28 },
        say: { who: 'goku', line: 'Here we go!', duration: 1.4 },
        hold: 1.2,
      },
      // the pull
      {
        cam: { from: { at: 'pair', off: [0, 1.4, 7] }, to: { at: 'pair', off: [0, 1.6, 5] }, look: { at: 'pair', off: [0, 1.4, 0] }, fov: 46 },
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.sfx('rumble', null, { at: ctx.cast.pair.pos, vol: 0.9, pitch: 1.2 });
          ctx.pull = { a0: st.goku.pos.clone(), c0: st.vegeta.pos.clone(), mid: ctx.cast.pair.pos.clone().add(new V3(0, 1.3, 0)) };
          for (const f of [st.goku, st.vegeta]) f.grounded = false;
        },
        pose: [
          { who: 'goku', pose: 'pulled', face: 'shock', speed: 8 },
          { who: 'vegeta', pose: 'pulled', face: 'shock', speed: 8 },
        ],
        tick: (ctx, t) => {
          const st = story(ctx), p = ctx.pull;
          const k = Math.min(1, t / 1.6), e = k * k * k;
          st.goku.setPosition(p.a0.clone().lerp(p.mid, e * 0.96).add(new V3(0, Math.sin(k * 3) * 0.2, 0)));
          st.vegeta.setPosition(p.c0.clone().lerp(p.mid, e * 0.96).add(new V3(0, Math.sin(k * 3) * 0.2, 0)));
          for (const f of [st.goku, st.vegeta]) f.prevPos.copy(f.pos);
          if (ctx.b.frame % 3 === 0) {
            ctx.b.vfx.flash(VK().ear(st.goku, 1), 0.4 + k * 1.6, 0xfff0a0, 0.12, SL.Toon.tex.glow);
            ctx.b.vfx.flash(VK().ear(st.vegeta, -1), 0.4 + k * 1.6, 0xfff0a0, 0.12, SL.Toon.tex.glow);
          }
          if (k > 0.5 && ctx.b.frame % 2 === 0) for (const f of [st.goku, st.vegeta]) ctx.b.vfx.trail(f.chest(), 0xfff4c0, 0.3 + k * 0.4, 0.3);
          if (k > 0.6) ctx.b.camera.addTrauma(0.05);
        },
        say: { who: 'vegeta', line: 'What the—?!', duration: 1.2, style: 'shout' },
        hold: 1.7,
      },
      // chest to chest; white
      {
        call: (ctx) => {
          const st = story(ctx);
          const at = ctx.pull.mid.clone();
          SL.ScreenFX.flash(1, '#ffffff');
          ctx.b.vfx.explosion(at, 5, 0xfff4c0, { smoke: false });
          ctx.b.vfx.ring(at, 9, 0xffffff, 0.6);
          ctx.b.sfx('transformBurst', null, { at, pitch: 1.1, vol: 1.2 });
          ctx.b.cameraTraumaAt(at, 1);
          for (const f of [st.goku, st.vegeta]) f.setHidden(true);
          const base = ground(ctx, at);
          pt(ctx, 'crater', base);
          VK().pillar(ctx.m, base, { height: 260, radius: 3.5, seconds: 6 });
          ctx.b.stage.crater(base, 7, 0.8, null);
        },
        slow: { scale: 0.4, seconds: 0.5 },
        cam: { from: { at: 'crater', off: [0, 1, 7] }, look: { at: 'crater', off: [0, 2, 0] }, fov: 46 },
        hold: 0.9,
      },
      // from far away: a column of light through the clouds
      {
        cam: { from: { at: 'crater', off: [22, 20, 30] }, to: { at: 'crater', off: [20, 26, 27] }, look: { at: 'crater', off: [0, 26, 0] }, fov: 62 },
        tick: (ctx) => {
          if (ctx.b.frame % 10 === 0) ctx.b.camera.addTrauma(0.1);
        },
        sfx: { name: 'rumble', at: { at: 'crater' }, vol: 1.2, pitch: 0.7 },
        hold: 2.6,
      },
      {
        call: (ctx) => pt(ctx, 'rim', PM().canyonSet(ctx.m).rimTop),
        cam: { from: { at: 'rim', off: [-2, 1.6, 4] }, look: { at: 'crater', off: [0, 12, 0] }, fov: 50 },
        say: { who: 'buuhan', line: '...What is that light?', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      SL.ScreenFX.vision && SL.ScreenFX.vision(0);
      for (const f of [st.goku, st.vegeta]) f.setHidden(true);
      ctx.m.flags.fused = true;
    },
  };

  S.vg_reveal = {
    id: 'vg_reveal',
    cast,
    music: { song: 'finale', level: 4 },
    events: [
      // the light dies down in the crater: the camera starts at a pair of white boots and climbs, slowly,
      // past the gi and the sash to the chest — and the head is bowed, the face under the hair (owner)
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          ctx.cast.vegito = v;
          v.setState('scripted', { pose: 'vg_bowed', expression: 'calm' });
          if (v.model.setExpression) v.model.setExpression('calm');
          // the climb takes 6.2 s; the shot then holds on the bowed head through the breath that follows
          ctx.m.shot((t, out) => {
            const k = SL.util.easeInOutCubic(Math.min(1, (t * 7.4) / 6.2));
            const fwd = new V3(Math.sin(v.yaw), 0, Math.cos(v.yaw));
            const side = new V3(-fwd.z, 0, fwd.x);
            const feet = v.pos.clone();
            const head = SL.Cinema.actorPoint(ctx, 'vegito:head');
            const hy = head.y - feet.y;
            // in front of him, a little to his right, rising from the ankles to just above his brow
            out.pos.copy(feet).addScaledVector(fwd, SL.util.lerp(0.85, 1.15, k)).addScaledVector(side, SL.util.lerp(0.18, 0.1, k));
            out.pos.y = feet.y + SL.util.lerp(0.14, hy + 0.32, k);
            out.look.copy(feet).add(new V3(0, SL.util.lerp(0.12, hy + 0.05, Math.min(1, k * 1.08)), 0)).addScaledVector(fwd, SL.util.lerp(0.05, 0.06, k));
            out.fov = SL.util.lerp(44, 36, k);
          }, 7.4, { cut: true, blendIn: 0 });
        },
        mood: { amount: 0.18, color: 0x1a1620, seconds: 1.2 },
        music: { song: null, level: 0 },
        sfx: { name: 'rumble', vol: 0.4, pitch: 0.6 },
        tick: (ctx) => {
          const st = story(ctx), v = st.vegito;
          if (ctx.b.frame % 8 === 0) ctx.b.vfx.dust(v.pos.clone().add(new V3(Math.sin(ctx.b.frame) * 2.4, 0.05, Math.cos(ctx.b.frame) * 2.4)), 2.2, 2, ctx.b.stage.dustColor);
          if (ctx.b.frame % 14 === 0) ctx.b.vfx.sparks(v.chest(), 0xfff0c0, 2, 1.2, 0.05);
        },
        hold: 6.4,
      },
      // a breath, the head still down
      { sfx: { name: 'heartbeat', who: 'vegito', vol: 0.4, pitch: 0.7 }, hold: 0.7 },
      // the head comes up and the whole of him goes into it: ALRIGHT!
      {
        pose: [{ who: 'vegito', pose: 'vg_yosha', face: 'shout', speed: 16, aura: 0.22 }],
        cam: { from: { at: 'vegito', local: [1.1, 0.15, 2.7] }, to: { at: 'vegito', local: [0.85, 0.1, 2.05] }, look: { at: 'vegito', off: [0, 0.22, 0] }, fov: 40, fov2: 35, ease: 'outCubic' },
        say: { who: 'vegito', line: 'ALRIGHT!', duration: 1.8, style: 'dual shout' },
        sfx: { name: 'transformBurst', who: 'vegito', vol: 0.9, pitch: 1.3 },
        screen: { flash: 0.35, color: '#fff6dc' },
        shake: { at: 'vegito', amount: 0.55 },
        music: { song: 'finale', level: 4 },
        call: (ctx) => {
          const v = story(ctx).vegito;
          ctx.b.vfx.ring(ground(ctx, v.pos, 0.15), 6, 0xffffff, 0.5, new V3(0, 1, 0));
          ctx.b.vfx.dust(v.pos, 4.5, 18, ctx.b.stage.dustColor);
          ctx.b.vfx.flash(v.chest(), 3, 0xfff4d0, 0.25, SL.Toon.tex.glow);
        },
        hold: 2.2,
      },
      // the aura settles back into him; the shoulders roll
      {
        mood: { amount: 0, seconds: 0.8 },
        pose: [{ who: 'vegito', pose: 'vg_shoulders', face: 'cocky', speed: 6, aura: 0 }],
        cam: { from: { at: 'vegito', local: [1.2, 0.3, 2.4] }, look: { at: 'vegito', off: [0, 0.6, 0] }, fov: 38 },
        hold: 1.6,
      },
      // the neck, side to side
      {
        pose: [{ who: 'vegito', pose: 'vg_neck', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'vegito', local: [-0.5, 0.3, 1.4] }, look: { at: 'vegito:head' }, fov: 32 },
        sfx: { name: 'boneCrack', who: 'vegito', pitch: 1.2, vol: 0.5 },
        hold: 1.8,
      },
      // the gloves
      {
        pose: [{ who: 'vegito', pose: 'vg_gloves', face: 'smirk', speed: 10 }],
        cam: { from: { at: 'vegito', local: [0.3, 0.5, 1.2] }, look: { at: 'vegito', local: [0, 0.4, 0.3] }, fov: 34 },
        hold: 2,
      },
      // two voices at once
      {
        pose: [{ who: 'vegito', pose: 'vg_intro', face: 'cocky', speed: 5 }],
        cam: { from: { at: 'vegito', local: [0.35, 0.3, 1.6] }, look: { at: 'vegito:head' }, fov: 32 },
        say: { who: 'vegito', line: 'Well, well, well... look at this. I guess when you combine Vegeta and Kakarot, you get...', duration: 4, style: 'dual' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_smirk', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'vegito', local: [1.4, -0.3, 3.2] }, look: { at: 'vegito', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'vegito', line: '...VEGITO!', duration: 2.2, style: 'dual shout' },
        shake: { at: 'vegito', amount: 0.3 },
        hold: 2.4,
      },
      // Buuhan comes down to see
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bh.setHidden(false);
          st.bh.setPosition(ground(ctx, st.vegito.pos.clone().add(new V3(0, 0, -9))));
          faceTo(st.bh, st.vegito.pos);
          faceTo(st.vegito, st.bh.pos);
          ctx.b.vfx.ring(ground(ctx, st.bh.pos, 0.2), 4, 0xff8ac4, 0.4, new V3(0, 1, 0));
          ctx.b.vfx.dust(st.bh.pos, 3, 10, ctx.b.stage.dustColor);
          ctx.b.sfx('groundImpact', st.bh);
        },
        pose: [{ who: 'bh', pose: 'bh_idle', face: 'wicked', speed: 4 }],
        cam: { from: { at: 'vegito', local: [-0.7, 0.6, -2.2] }, look: { at: 'bh', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'buuhan', line: 'Do you really think a pair of matching earrings makes you a match for me? You\'re still just two dirty Saiyans stuck together!', duration: 4.4 },
        hold: 4.6,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_taunt', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'vegito', local: [0.4, 0.3, 1.8] }, look: { at: 'vegito:head' }, fov: 34 },
        say: { who: 'vegito', line: 'Then come and find out.', duration: 2, style: 'dual' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.bh.setHidden(false);
      ctx.m.flags.vegito = true;
    },
  };

  S.vg_challenge = {
    id: 'vg_challenge',
    cast,
    music: { song: 'finale', level: 4 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.cast.vegito = st.vegito;
          faceTo(st.bh, st.vegito.pos);
          faceTo(st.vegito, st.bh.pos);
        },
        pose: [
          { who: 'bh', pose: 'bh_regen', face: 'angry', speed: 6 },
          { who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 4 },
        ],
        cam: { from: { at: 'bh', local: [0.6, 0.3, 2.6] }, look: { at: 'bh:head' }, fov: 36 },
        tick: (ctx) => VK().steam(ctx.b, story(ctx).bh, 0.6),
        say: { who: 'buuhan', line: 'Grrr... you... you got lucky!', duration: 2.2, style: 'shout' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_smirk', face: 'cocky', speed: 5 }],
        cam: { from: { at: 'vegito', local: [0.4, 0.35, 1.7] }, look: { at: 'vegito:head' }, fov: 34 },
        say: { who: 'vegito', line: 'Lucky? I haven\'t even gotten serious yet.', duration: 2.4, style: 'dual' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_charge', face: 'shout', speed: 8 }],
        cam: { from: { at: 'bh', local: [1.4, -0.5, 4] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 44 },
        tick: (ctx) => {
          const st = story(ctx);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.streamInward(st.bh.chest(), 3, 0xff8ac4, 2, 0.16, 0.4);
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.bolt(st.bh.chest().add(new V3(0.4, 0.3, 0)), 1.2, 0x6a4aff);
        },
        shake: { at: 'bh', amount: 0.4 },
        say: { who: 'buuhan', line: 'Enough games! I\'ll show you what REAL power looks like!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_neck', face: 'cocky', speed: 5 }],
        cam: { from: { at: 'vegito', local: [-0.4, 0.3, 1.5] }, look: { at: 'vegito:head' }, fov: 32 },
        say: { who: 'vegito', line: 'Real power, huh? Funny you should say that.', duration: 2.6, style: 'dual' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.challenged = true;
    },
  };
})();
