/*
 * SCENES — Chapter 11: The Evil in Him (Mr. Satan, Good Buu, Bee, the hunters, Evil Buu, Super Buu).
 *
 *   split_house     the round pink house in the wastes; the champion behind a rock with a present
 *   split_gift      the present goes off in Buu's face, and he wants another
 *   split_massage   "the Satan Special Massage": the champion's hand hurts, and the monster has a friend
 *   split_friends   supper at sundown; "no more killing" and a promise; a hurt puppy, healed: Bee
 *   split_hunters   two rifles on the ridge: a hole in Buu's head that closes, a shot at the dog,
 *                   and the champion angry for somebody else for once
 *   split_shot      the champion turns his back on the second rifle; Buu heals him, and shakes
 *   split_rage      the steam: out of his head, up in a column, gathering into a body — Evil Buu
 *   split_reflect   the Candy Beam, swatted straight back: Good Buu is a bar of chocolate
 *   split_absorb    he eats it; what stands up in the smoke is Super Buu, and it looks at the sky
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const FX = () => SL.data.buuSplitFX;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const ground = (ctx, v) => {
    const p = v.clone();
    if (ctx.b.stage.hasGround) p.y = ctx.b.stage.heightAt(p.x, p.z);
    return p;
  };
  const faceTo = (f, p) => {
    f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
  };
  const beeAt = (ctx, v, state, data) => {
    const bee = story(ctx).bee;
    bee.object.visible = true;
    if (v) {
      bee.pos.copy(ground(ctx, v));
      bee.prevPos.copy(bee.pos);
    }
    if (state) bee.setState(state, data || {});
  };
  // beside Good Buu, on his right: where the steam gathers into the other one
  const evilSpot = (ctx) => {
    const st = story(ctx);
    if (!st.evilSpot) {
      const f = st.buu, fwd = f.forward.clone().setY(0).normalize();
      st.evilSpot = ground(ctx, f.pos.clone().addScaledVector(new V3(-fwd.z, 0, fwd.x), 3.2).addScaledVector(fwd, 0.8));
    }
    return st.evilSpot;
  };
  const buuHead = (f) => {
    f.model.root.updateMatrixWorld(true);
    return f.model.joints.head.getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
  };
  // a cam placed by the story's current positions (pseudo-actor: { pos })
  const pt = (ctx, name, v) => {
    ctx.cast[name] = { pos: v.clone() };
  };

  S.split_house = {
    id: 'split_house',
    cast,
    music: { song: 'adventure', level: 1 },
    events: [
      // the wastes, the round pink house, and its owner sitting outside it eating
      {
        mood: { amount: 0.12, color: 0x7a4a20, seconds: 0.1 },
        pose: [
          { who: 'buu', pose: 'bu_sit', face: 'grin', speed: 4 },
          { who: 'satan', pose: 'ms_hide', face: 'shock', speed: 6 },
        ],
        cam: { from: [22, 10, 16], to: [15, 6, 9], look: [1, 2.2, -13], look2: [1, 1.4, -9], fov: 52, fov2: 46, ease: 'inOut' },
        hold: 4.2,
      },
      // from behind the champion and his rock
      {
        cam: { from: { at: 'satan', local: [0.7, 0.55, -1.7] }, look: { at: 'buu' }, fov: 44 },
        say: { who: 'satan', line: 'There he is. The monster that swallowed half the world... sitting outside his little house, eating cookies.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'satan:face', local: [0.25, 0.05, 1.1] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'satan', line: 'Easy, champ. One present. One little bomb inside it. Then you\'re the man who beat Cell AND Majin Buu.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_sit', face: 'calm', speed: 3 }],
        cam: { from: { at: 'buu', local: [0.9, 0.3, 2.3] }, look: { at: 'buu:head' }, fov: 38 },
        say: { who: 'buu', line: 'Who\'s there? Buu can hear you breathing.', duration: 2.8 },
        hold: 3,
      },
      {
        call: (ctx) => {
          const s = story(ctx).satan;
          s.setPosition(ground(ctx, new V3(-3.2, 0, 4.4)));
          faceTo(s, story(ctx).buu.pos);
        },
        pose: [{ who: 'satan', pose: 'ms_panic', face: 'shock', speed: 14 }],
        cam: { from: [-12, 3, 2], look: [0, 1, -1.8], fov: 50 },
        say: { who: 'satan', line: 'EEP—!', duration: 1, style: 'shout' },
        hold: 1.2,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_nervous', face: 'grin', speed: 6 }],
        say: { who: 'satan', line: 'Ha... hahaha! Just a fan! Your biggest fan! I brought you a present!', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_idle', face: 'grin', speed: 4 }],
        cam: { from: { at: 'buu', local: [1.2, 0.2, 2.8] }, look: { at: 'buu:head' }, fov: 40 },
        say: { who: 'buu', line: 'A present? For Buu? Bring it here!', duration: 2.6 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.satan.setPosition(ground(ctx, new V3(-3.2, 0, 4.4)));
      faceTo(st.satan, st.buu.pos);
      st.satan.setState('scripted', { pose: 'ms_nervous', expression: 'grin' });
      st.buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      ctx.m.flags.houseSeen = true;
    },
  };

  S.split_gift = {
    id: 'split_gift',
    cast,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          st.satan.model.setPropVisible('gift', false);
          if (!st.buu.model.props.gift) st.buu.model.addProp(SL.data.buuSplit.GIFT);
          st.buu.model.setPropVisible('gift', true);
        },
        pose: [
          { who: 'buu', pose: 'bu_cradle', face: 'grin', speed: 8 },
          { who: 'satan', pose: 'ms_nervous', face: 'grin', speed: 8 },
        ],
        cam: { from: { at: 'buu', local: [2.4, 0.3, 1.6] }, look: { at: 'buu', local: [-0.9, 0.2, 0.8] }, fov: 42 },
        say: { who: 'buu', line: 'For Buu! Nobody ever gives Buu presents!', duration: 2.8 },
        hold: 3,
      },
      // the champion leaves at a sensible speed, then at an insensible one
      {
        pose: [{ who: 'satan', pose: 'ms_panic', face: 'shock', speed: 10 }],
        move: { who: 'satan', at: [-5.2, 0, 6.6], seconds: 1.1, ease: 'in' },
        cam: { from: [-10, 2.6, 10], look: [-1, 1.4, -3], fov: 48 },
        hold: 0.2,
      },
      {
        pose: [
          { who: 'satan', pose: 'ms_hide', face: 'grit', speed: 12 },
          { who: 'buu', pose: 'bu_eat', face: 'grin', speed: 6 },
        ],
        cam: { from: { at: 'satan', local: [0.6, 0.5, -1.5] }, look: { at: 'buu' }, fov: 40 },
        say: { who: 'satan', line: 'Three... two... one...', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.buu.model.setPropVisible('gift', false);
          ctx.b.vfx.explosion(st.buu.chest(), 2.4, 0xffa040);
        },
        pose: [{ who: 'buu', pose: 'bu_shock', face: 'shock', speed: 20 }],
        sfx: { name: 'explosionBig', who: 'buu' },
        shake: { at: 'buu', amount: 0.55 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_laugh', face: 'grin', speed: 8 }],
        cam: { from: { at: 'buu', local: [0.6, 0.35, 2.2] }, look: { at: 'buu:head' }, fov: 38 },
        say: { who: 'buu', line: 'Hehehe! It went BOOM! Again! Do it again!', duration: 3 },
        hold: 3.2,
      },
      {
        // up from behind the rock, where he can see
        call: (ctx) => {
          const st = story(ctx);
          st.satan.setPosition(ground(ctx, new V3(-3.3, 0, 4.2)));
          faceTo(st.satan, st.buu.pos);
        },
        pose: [{ who: 'satan', pose: 'ms_panic', face: 'shock', speed: 8 }],
        cam: { from: { at: 'satan', local: [0.3, 0.1, 1.9] }, look: { at: 'satan:head' }, fov: 38 },
        say: { who: 'satan', line: 'He... he LIKED it?!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_flex', face: 'grit', speed: 6 }],
        cam: { from: { at: 'satan', local: [1.4, 0.3, 3] }, look: { at: 'satan' }, fov: 42 },
        say: { who: 'satan', line: 'F-fine! Then prepare yourself for the champion\'s SECRET TECHNIQUE!', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.satan.model.setPropVisible('gift', false);
      if (st.buu.model.props.gift) st.buu.model.setPropVisible('gift', false);
      st.satan.setPosition(ground(ctx, new V3(-3.3, 0, 4.2)));
      faceTo(st.satan, st.buu.pos);
      st.satan.setState('scripted', { pose: 'ms_idle', expression: 'grit' });
      st.buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      ctx.m.flags.giftExploded = true;
    },
  };

  S.split_massage = {
    id: 'split_massage',
    cast,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), buu = st.buu;
          const fwd = buu.forward.clone().setY(0).normalize();
          st.satan.setPosition(ground(ctx, buu.pos.clone().addScaledVector(fwd, 2.4)));
          faceTo(st.satan, buu.pos);
        },
        pose: [
          { who: 'satan', pose: 'ms_sore', face: 'hurt', speed: 8 },
          { who: 'buu', pose: 'bu_laugh', face: 'grin', speed: 8 },
        ],
        cam: { from: { at: 'satan', local: [-1.5, 0.3, 1.3] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'satan', line: 'My hand... it\'s like punching a giant marshmallow...', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'buu', local: [1.4, 0.6, 1.5] }, look: { at: 'buu:head' }, fov: 38 },
        say: { who: 'buu', line: 'That tickles! Mister, what is that called?', duration: 2.6 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_nervous', face: 'grin', speed: 6 }],
        cam: { from: { at: 'satan', local: [2.6, 0.4, 2.6] }, look: { at: 'satan', local: [-1.2, 0.2, 1.4] }, fov: 44 },
        say: { who: 'satan', line: 'That? That\'s... the Satan Special Massage! Only for... close personal friends!', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_dance', face: 'grin', speed: 6 }],
        cam: { from: { at: 'buu', local: [3.2, 0.5, 1.4] }, look: { at: 'buu', local: [0, 0, 0.6] }, fov: 44 },
        say: { who: 'buu', line: 'Friends? Buu and Mister Satan are FRIENDS!', duration: 3 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.friends = true;
    },
  };

  S.split_friends = {
    id: 'split_friends',
    cast,
    music: { song: 'farewell', level: 1 },
    events: [
      // sundown: supper outside the round house
      {
        mood: { amount: 0.32, color: 0x6a2c14, seconds: 0.1 },
        call: (ctx) => {
          const st = story(ctx);
          const mid = st.satan.pos.clone().lerp(st.buu.pos, 0.5);
          const d = st.buu.pos.clone().sub(st.satan.pos).setY(0).normalize();
          const side = new V3(-d.z, 0, d.x);
          if (side.z < 0) side.negate();
          pt(ctx, 'mid', mid);
          pt(ctx, 'midCam', mid.clone().addScaledVector(side, 4.6));
        },
        pose: [
          { who: 'buu', pose: 'bu_sit', face: 'grin', speed: 3 },
          { who: 'satan', pose: 'ms_eat', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'midCam', off: [0, 1.1, 0] }, look: { at: 'mid', off: [0, 0.5, 0] }, fov: 46 },
        say: { who: 'satan', line: 'Say, Buu... can I ask you something? Why do you... you know. Destroy everything.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'buu', local: [0.7, 0.3, 2.2] }, look: { at: 'buu:head' }, fov: 36 },
        say: { who: 'buu', line: 'Everybody runs and screams. It\'s funny.', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_eat', face: 'soft', speed: 2 }],
        cam: { from: { at: 'satan:face', local: [0.3, 0.05, 1.2] }, look: { at: 'satan:head' }, fov: 34 },
        say: { who: 'satan', line: 'It\'s not funny for them, pal. People have families. If we\'re friends... you\'ve got to stop. No more killing. No more wrecking things.', duration: 5.4, style: 'quiet' },
        hold: 5.6,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_sit', face: 'sad', speed: 2 }],
        cam: { from: { at: 'buu', local: [0.5, 0.2, 2] }, look: { at: 'buu:head' }, fov: 34 },
        say: { who: 'buu', line: '...No more?', duration: 1.8, style: 'quiet' },
        hold: 2.2,
      },
      {
        say: { who: 'satan', line: 'Not for me. For a friend.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_sit', face: 'grin', speed: 3 }],
        cam: { from: { at: 'buu', local: [1.6, 0.3, 2.8] }, look: { at: 'buu', local: [-0.8, 0, 0.6] }, fov: 44 },
        say: { who: 'buu', line: '...Okay. Buu promises.', duration: 2.6 },
        flag: { buuPromised: true },
        hold: 3,
      },
      // a whimper, over by the house
      {
        sfx: { name: 'bark', pitch: 0.5, vol: 0.8 },
        cam: { from: { at: 'bee', off: [1.3, 0.7, 1.5] }, look: { at: 'bee', off: [0, 0.15, 0] }, fov: 40 },
        say: { who: 'satan', line: 'Hm? A puppy... his leg\'s hurt.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.buu.setPosition(ground(ctx, st.bee.pos.clone().add(new V3(1.0, 0, 0.35))));
          faceTo(st.buu, st.bee.pos);
          st.satan.setPosition(ground(ctx, st.bee.pos.clone().add(new V3(-1.4, 0, 2.2))));
          faceTo(st.satan, st.bee.pos);
          st.satan.setState('scripted', { pose: 'ms_idle', expression: 'calm' });
        },
        pose: [{ who: 'buu', pose: 'bu_heal', face: 'soft', speed: 5 }],
        cam: { from: { at: 'bee', off: [-1.6, 0.5, -1.6] }, look: { at: 'bee', off: [0.4, 0.3, 0.1] }, fov: 40 },
        sfx: { name: 'kiUp', who: 'buu', pitch: 1.7, vol: 0.5 },
        tick: (ctx, t) => FX().heal(ctx.b, story(ctx).bee.pos.clone().add(new V3(0, 0.35, 0)), t / 3),
        say: { who: 'buu', line: 'Buu can fix.', duration: 2.4, style: 'quiet' },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bee.setState('wag', {});
          ctx.b.vfx.flash(st.bee.pos.clone().add(new V3(0, 0.3, 0)), 1.6, 0xfff0b0, 0.3, SL.Toon.tex.glow);
        },
        pose: [{ who: 'buu', pose: 'bu_laugh', face: 'grin', speed: 8 }],
        sfx: { name: 'bark', vol: 0.9 },
        cam: { from: { at: 'bee', off: [-1.2, 0.5, 1.6] }, look: { at: 'bee', off: [0.5, 0.4, 0] }, fov: 44 },
        say: { who: 'buu', line: 'Hehe! He\'s licking Buu!', duration: 2.6 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'satan', pose: 'ms_idle', face: 'soft', speed: 3 }],
        cam: { from: { at: 'satan', local: [0.6, 0.35, 2.2] }, look: { at: 'satan:head' }, fov: 36 },
        say: { who: 'satan', line: 'Heh. He likes you, big guy.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_dance', face: 'grin', speed: 6 }],
        cam: { from: { at: 'buu', local: [0.8, 0.5, 3.4] }, look: { at: 'buu', off: [0, -0.3, 0] }, fov: 44 },
        say: { who: 'buu', line: 'Buu names him... BEE!', duration: 2.6 },
        flag: { beeHealed: true },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      beeAt(ctx, null, 'follow', { follow: st.buu });
      st.buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      st.satan.setState('scripted', { pose: 'ms_idle', expression: 'grin' });
      ctx.m.flags.buuPromised = true;
      ctx.m.flags.beeHealed = true;
    },
  };

  S.split_hunters = {
    id: 'split_hunters',
    cast,
    music: { song: 'battle', level: 1 },
    events: [
      // on the ridge
      {
        pose: [
          { who: 'g1', pose: 'gm_idle', face: 'angry', speed: 3 },
          { who: 'g2', pose: 'gm_idle', face: 'grin', speed: 3 },
          { who: 'buu', pose: 'bu_idle', face: 'grin', speed: 3 },
          { who: 'satan', pose: 'ms_idle', face: 'calm', speed: 3 },
        ],
        call: (ctx) => {
          // both of them, from down the slope in front
          const st = story(ctx);
          const mid = st.g1.pos.clone().lerp(st.g2.pos, 0.5);
          const toBuu = st.buu.pos.clone().sub(mid).setY(0).normalize();
          pt(ctx, 'ridge', mid);
          pt(ctx, 'ridgeCam', mid.clone().addScaledVector(toBuu, 7.5));
        },
        cam: { from: { at: 'ridgeCam', off: [0, 0.9, 0] }, look: { at: 'ridge', off: [0, 1.1, 0] }, fov: 46 },
        say: { who: 'gunman', line: 'There it is. The pink thing that wiped out the cities.', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'g2', local: [0.6, 0.3, 2.2] }, look: { at: 'g2:head' }, fov: 38 },
        say: { who: 'gunman_b', line: 'And the World Champion\'s having a picnic with it. Some hero.', duration: 3.2 },
        hold: 3.4,
      },
      // down the barrel at the monster
      {
        pose: [{ who: 'g1', pose: 'gm_aim', face: 'angry', speed: 10 }],
        cam: { from: { at: 'g1', local: [0.55, 0.45, -1.8] }, look: { at: 'buu' }, fov: 34 },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          FX().shot(ctx.b, st.g1, buuHead(st.buu));
          ctx.b.vfx.sparks(buuHead(st.buu), 0xff8ac4, 10, 5, 0.08);
        },
        pose: [{ who: 'buu', pose: 'bu_shock', face: 'shock', speed: 22 }],
        hold: 1.1,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_idle', face: 'calm', speed: 4 }],
        sfx: { name: 'regrow', who: 'buu' },
        cam: { from: { at: 'buu', local: [0.7, 0.4, 2.2] }, look: { at: 'buu:head' }, fov: 34 },
        say: { who: 'buu', line: 'Ow...? That tickled.', duration: 2.4 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'g2', pose: 'gm_aim', face: 'angry', speed: 10 }],
        cam: { from: { at: 'g2', local: [1, 0.6, 2.6] }, look: { at: 'g2', local: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'gunman_b', line: 'Then how about the mutt?!', duration: 1.8, style: 'shout' },
        hold: 1.8,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          FX().shot(ctx.b, st.g2, st.bee.pos.clone().add(new V3(0, 0.25, 0)));
          st.bee.setState('hurt', {});
        },
        sfx: { name: 'bark', pitch: 0.45, vol: 1 },
        cam: { from: { at: 'bee', off: [2.4, 1.2, 2.6] }, look: { at: 'bee', off: [0, 0.3, 0] }, fov: 46 },
        hold: 1.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.buu.setPosition(ground(ctx, st.bee.pos.clone().add(new V3(0.9, 0, -0.5))));
          faceTo(st.buu, st.bee.pos);
        },
        pose: [{ who: 'buu', pose: 'bu_heal', face: 'shock', speed: 10 }],
        cam: { from: { at: 'bee', off: [-1.4, 0.5, 1.6] }, look: { at: 'bee', off: [0.4, 0.3, -0.2] }, fov: 42 },
        say: { who: 'buu', line: 'BEE!', duration: 1.4, style: 'shout' },
        tick: (ctx, t) => FX().heal(ctx.b, story(ctx).bee.pos.clone().add(new V3(0, 0.35, 0)), t / 2),
        hold: 2.4,
      },
      {
        call: (ctx) => story(ctx).bee.setState('wag', {}),
        pose: [{ who: 'satan', pose: 'ms_point', face: 'angry', speed: 8 }],
        cam: { from: { at: 'satan', local: [0.7, -0.2, 2.4] }, look: { at: 'satan:head' }, fov: 40 },
        say: { who: 'satan', line: 'HEY! You two! You want to shoot somebody? Then come down here and try the CHAMPION!', duration: 3.8, style: 'shout' },
        flag: { satanStepsUp: true },
        hold: 4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const g of [st.g1, st.g2]) g.setState('scripted', { pose: 'gm_idle', expression: 'angry' });
      beeAt(ctx, null, 'wag');
      st.satan.setState('scripted', { pose: 'ms_idle', expression: 'angry' });
      ctx.m.flags.beeShot = true;
    },
  };

  S.split_shot = {
    id: 'split_shot',
    cast,
    events: [
      {
        pose: [
          { who: 'satan', pose: 'ms_peace', face: 'grin', speed: 6 },
          { who: 'buu', pose: 'bu_cradle', face: 'grin', speed: 4 },
        ],
        cam: { from: { at: 'satan', local: [0.4, 0.3, 3.2] }, look: { at: 'satan', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'satan', line: 'And THAT\'S why they call me the champ! Come on, Buu, let\'s go home—', duration: 3.4 },
        hold: 3.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.satan, st.buu.pos);
          st.satan.setState('scripted', { pose: 'ms_idle', expression: 'grin' });
          faceTo(st.g2, st.satan.pos);
        },
        // behind his back, one of them is up on a knee with the rifle
        pose: [{ who: 'g2', pose: 'gm_aim', face: 'angry', speed: 8 }],
        cam: { from: { at: 'g2', local: [0.6, 0.35, -1.9] }, look: { at: 'satan' }, fov: 36 },
        hold: 1.5,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          FX().shot(ctx.b, st.g2, st.satan.chest());
          ctx.b.vfx.impact(st.satan.chest(), 2, 0xffd0a0);
        },
        pose: [{ who: 'satan', pose: 'knockdown', face: 'ko', speed: 14 }],
        slow: { scale: 0.3, seconds: 0.9 },
        cam: { from: { at: 'buu', local: [2.6, 0.2, 3.6] }, look: { at: 'satan' }, fov: 44 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_shock', face: 'shock', speed: 10 }],
        call: (ctx) => beeAt(ctx, story(ctx).buu.pos.clone().add(new V3(0.9, 0, 0.6)), 'stay'),
        cam: { from: { at: 'buu', local: [0.6, 0.6, 2.2] }, look: { at: 'buu:head' }, fov: 34 },
        say: { who: 'buu', line: '...Mister Satan?', duration: 2, style: 'quiet' },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.buu.setPosition(ground(ctx, st.satan.pos.clone().add(new V3(0.9, 0, 0.9))));
          faceTo(st.buu, st.satan.pos);
          beeAt(ctx, st.satan.pos.clone().add(new V3(-0.8, 0, 0.7)), 'stay');
          faceTo(st.bee, st.satan.pos);
        },
        pose: [{ who: 'buu', pose: 'bu_heal', face: 'sad', speed: 6 }],
        cam: { from: { at: 'satan', off: [-2, 1.2, 2.2] }, look: { at: 'satan', off: [0.4, -0.4, 0.4] }, fov: 42 },
        tick: (ctx, t) => FX().heal(ctx.b, story(ctx).satan.chest(), t / 3),
        say: { who: 'buu', line: 'Buu fixes... Buu fixes you...', duration: 3, style: 'quiet' },
        hold: 3.4,
      },
      {
        pose: [
          { who: 'g2', pose: 'gm_idle', face: 'grin', speed: 4 },
          { who: 'g1', pose: 'gm_idle', face: 'grin', speed: 4 },
        ],
        cam: { from: { at: 'buu', local: [-0.5, 0.6, -1.6] }, look: { at: 'g2' }, fov: 26 },
        say: { who: 'gunman_b', line: 'Ha! Nobody\'s gonna miss THAT fraud!', duration: 2.6 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_rage', face: 'angry', speed: 6 }],
        sfx: { name: 'steam', who: 'buu', vol: 0.6 },
        cam: { from: { at: 'buu', local: [0.3, 0.28, 1.7] }, look: { at: 'buu:head' }, fov: 34 },
        tick: (ctx, t) => FX().steam(ctx.b, story(ctx).buu, Math.min(0.3, t / 6)),
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.satan.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      st.buu.setState('scripted', { pose: 'bu_rage', expression: 'angry' });
      for (const g of [st.g1, st.g2]) g.setState('scripted', { pose: 'gm_idle', expression: 'grin' });
      if (st.buu.pos.distanceTo(st.satan.pos) > 2.5) {
        st.buu.setPosition(ground(ctx, st.satan.pos.clone().add(new V3(0.9, 0, 0.9))));
        faceTo(st.buu, st.satan.pos);
      }
      beeAt(ctx, st.satan.pos.clone().add(new V3(-0.8, 0, 0.7)), 'stay');
      ctx.m.flags.satanShot = true;
    },
  };

  S.split_rage = {
    id: 'split_rage',
    cast,
    music: { song: 'finale', level: 3 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.buu, st.g2.pos);
        },
        pose: [{ who: 'buu', pose: 'bu_rage', face: 'angry', speed: 5 }],
        mood: { amount: 0.4, color: 0x1a0a14, seconds: 2.5 },
        sfx: { name: 'steam', who: 'buu', vol: 0.9 },
        cam: { from: { at: 'buu', local: [0.5, 0.45, 2.1] }, look: { at: 'buu:head' }, fov: 36 },
        say: { who: 'buu', line: 'Buu... promised... no more... but Buu... is so... ANGRY...', duration: 3.6, style: 'quiet' },
        tick: (ctx, t) => {
          const f = story(ctx).buu;
          FX().steam(ctx.b, f, 0.3 + Math.min(0.4, t / 8));
          FX().size(f, 1 + Math.sin(t * 9) * 0.015);
        },
        hold: 3.8,
      },
      // it comes out of him: the scream, and the steam straight up in a column
      {
        pose: [{ who: 'buu', pose: 'bu_scream', face: 'shout', speed: 10 }],
        sfx: { name: 'roar', who: 'buu', pitch: 1.35, vol: 1.1 },
        shake: { at: 'buu', amount: 0.7 },
        cam: { from: { at: 'buu', local: [2.6, -0.6, 6.4] }, look: { at: 'buu', off: [0, 2.2, 0] }, fov: 52 },
        tick: (ctx, t) => {
          const b = ctx.b, f = story(ctx).buu;
          const k = Math.min(1, t / 1.2);
          FX().steam(b, f, 1, 0xd8ccd4);
          const top = buuHead(f).add(new V3(0, 0.4, 0));
          for (let i = 0; i < 3; i++) b.vfx.smoke.emit(top.x + U.rand(-0.3, 0.3), top.y, top.z + U.rand(-0.3, 0.3), U.rand(-0.5, 0.5), 9 + U.rand(0, 5), U.rand(-0.5, 0.5), 0.78, 0.74, 0.8, 0.55, 0.4 + k * 0.5, 1.6, { grow: 2.4, drag: 0.6 });
          // squeezing it out of himself: narrower, taller, shaking
          FX().size(f, 1 - 0.07 * k + Math.sin(t * 40) * 0.01, 1 + 0.04 * k);
          if (b.frame % 30 === 0) b.sfx('steam', f, { vol: 0.8, dur: 1 });
        },
        hold: 3.2,
      },
      // the steam comes down beside him and gathers into something
      {
        cam: { from: { at: 'buu', local: [-3.2, 0.4, 7] }, look: { at: 'buu', local: [1.6, 1, 0.6] }, fov: 50 },
        tick: (ctx, t) => {
          const b = ctx.b, f = story(ctx).buu, spot = evilSpot(ctx);
          FX().steam(b, f, Math.max(0.2, 0.8 - t / 3));
          FX().size(f, 1 - 0.07 * Math.max(0, 1 - t / 3));
          const top = buuHead(f).add(new V3(0, 3, 0));
          const k = Math.min(1, t / 2.6);
          // the column bends over and pours down into the spot
          for (let i = 0; i < 2; i++) {
            const p = top.clone().lerp(spot.clone().add(new V3(0, 1.4, 0)), U.rand(0, 1));
            const v = spot.clone().add(new V3(0, 1.2, 0)).sub(p).multiplyScalar(1.4);
            b.vfx.smoke.emit(p.x, p.y, p.z, v.x, v.y, v.z, 0.72, 0.7, 0.76, 0.5, 0.5, 0.9, { grow: 1.6, drag: 0.4 });
          }
          b.vfx.smoke.emit(spot.x + U.rand(-0.5, 0.5), spot.y + 0.6 + U.rand(0, 1.4) * k, spot.z + U.rand(-0.5, 0.5), U.rand(-0.4, 0.4), U.rand(-0.2, 0.4), U.rand(-0.4, 0.4), 0.62, 0.6, 0.68, 0.5 + k * 0.3, 0.5 + k * 0.7, 1.4, { grow: 1.4, drag: 1.5 });
          if (b.frame % 6 === 0) b.vfx.streamInward(spot.clone().add(new V3(0, 1.2, 0)), 2.2, 0x9a90b8, 3, 0.12, 0.4);
        },
        hold: 3,
      },
      {
        call: (ctx) => {
          const st = story(ctx), spot = evilSpot(ctx);
          st.evil.setHidden(false);
          st.evil.setPosition(spot);
          faceTo(st.evil, st.buu.pos);
          FX().size(st.buu, 1);
          const c = spot.clone().add(new V3(0, 1, 0));
          for (let i = 0; i < 26; i++) {
            const a = (i / 26) * Math.PI * 2;
            ctx.b.vfx.smoke.emit(c.x, c.y, c.z, Math.cos(a) * 4, U.rand(0, 2), Math.sin(a) * 4, 0.62, 0.6, 0.68, 0.6, 0.9, 1.4, { grow: 2, drag: 2.2 });
          }
          ctx.b.vfx.flash(c, 3, 0xb0a8d0, 0.3, SL.Toon.tex.glow);
        },
        pose: [
          { who: 'evil', pose: 'eb_form', face: 'calm', speed: 30 },
          { who: 'buu', pose: 'bu_angry', face: 'shock', speed: 5 },
        ],
        sfx: { name: 'transformBurst', who: 'evil', pitch: 0.7 },
        cam: { from: { at: 'evil', local: [0.8, 0.4, 3.6] }, look: { at: 'evil', off: [0, -0.3, 0] }, fov: 44 },
        hold: 1.6,
      },
      // he unfolds: the long grey body, rising out of a crouch
      {
        pose: [{ who: 'evil', pose: 'eb_idle', face: 'grin', speed: 1.6 }],
        sfx: { name: 'growl', who: 'evil', pitch: 0.8 },
        cam: { from: { at: 'evil', local: [0.5, -0.7, 2.4] }, to: { at: 'evil', local: [0.35, 0.25, 1.9] }, look: { at: 'evil', off: [0, -0.2, 0] }, look2: { at: 'evil:head' }, fov: 40, fov2: 36, ease: 'inOut' },
        hold: 3,
      },
      {
        pose: [{ who: 'evil', pose: 'eb_laugh', face: 'grin', speed: 8 }],
        cam: { from: { at: 'evil:face', local: [0.2, 0, 1.1] }, look: { at: 'evil:head' }, fov: 32 },
        say: { who: 'evil', line: 'Hee... hee hee hee hee...', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [
          { who: 'g1', pose: 'gm_flee', face: 'shock', speed: 8 },
          { who: 'g2', pose: 'gm_flee', face: 'shock', speed: 8 },
        ],
        cam: { from: { at: 'g1', local: [0.5, 0.2, 3] }, look: { at: 'g1', local: [0.6, 0.1, 0] }, fov: 44 },
        say: { who: 'gunman', line: 'W-what IS that?!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
      // one gesture, from behind him: the two of them, and then a crater where they stood
      {
        pose: [{ who: 'evil', pose: 'blastR', face: 'grin', speed: 12 }],
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.evil, st.g1.pos.clone().lerp(st.g2.pos, 0.5));
        },
        cam: { from: { at: 'evil', local: [0.9, 0.5, -3.2] }, look: { at: 'g1' }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx);
          if (t > 0.3 && t < 0.62) FX().beam(ctx.b, st.evil.chest().addScaledVector(st.evil.forward, 0.6), st.g1.chest().lerp(st.g2.chest(), 0.5), (t - 0.3) / 0.3, 0xb070ff);
          if (t >= 0.62 && !st.huntersGone) {
            st.huntersGone = true;
            const at = st.g1.pos.clone().lerp(st.g2.pos, 0.5).add(new V3(0, 0.8, 0));
            ctx.b.vfx.explosion(at, 3.6, 0xb070ff);
            ctx.b.sfx('explosionBig', null, { at });
            ctx.b.cameraTraumaAt(at, 0.5);
            st.g1.setHidden(true);
            st.g2.setHidden(true);
          }
        },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.evil, st.buu.pos);
          faceTo(st.buu, st.evil.pos);
        },
        pose: [
          { who: 'evil', pose: 'eb_idle', face: 'grin', speed: 5 },
          { who: 'buu', pose: 'bu_angry', face: 'angry', speed: 5 },
        ],
        cam: { from: { at: 'evil', local: [-0.6, 0.6, -1.8] }, look: { at: 'buu' }, fov: 40 },
        say: { who: 'buu', line: 'You... are BAD! Buu will beat you!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'evil', pose: 'eb_laugh', face: 'grin', speed: 8 }],
        cam: { from: { at: 'evil', local: [0.6, 0.3, 2.2] }, look: { at: 'evil:head' }, fov: 36 },
        say: { who: 'evil', line: 'Heh.', duration: 1.2, style: 'quiet' },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const st = story(ctx), spot = evilSpot(ctx);
      FX().size(st.buu, 1);
      st.evil.setHidden(false);
      if (st.evil.pos.distanceTo(spot) > 0.5) st.evil.setPosition(spot);
      faceTo(st.evil, st.buu.pos);
      st.evil.setState('scripted', { pose: 'eb_idle', expression: 'grin' });
      st.g1.setHidden(true);
      st.g2.setHidden(true);
      st.huntersGone = true;
      ctx.m.flags.evilBorn = true;
    },
  };

  S.split_reflect = {
    id: 'split_reflect',
    cast,
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          const mid = st.buu.pos.clone().lerp(st.evil.pos, 0.5);
          const d = st.evil.pos.clone().sub(st.buu.pos).setY(0);
          const dir = d.lengthSq() > 0.01 ? d.normalize() : new V3(0, 0, -1);
          st.buu.setPosition(ground(ctx, mid.clone().addScaledVector(dir, -4)));
          st.evil.setPosition(ground(ctx, mid.clone().addScaledVector(dir, 4)));
          faceTo(st.buu, st.evil.pos);
          faceTo(st.evil, st.buu.pos);
        },
        pose: [
          { who: 'buu', pose: 'bu_candyW', face: 'angry', speed: 8 },
          { who: 'evil', pose: 'eb_idle', face: 'grin', speed: 4 },
        ],
        cam: { from: { at: 'buu', local: [0.8, 0.7, -2] }, look: { at: 'evil' }, fov: 42 },
        say: { who: 'buu', line: 'Buu turns you into CANDY!', duration: 2.2, style: 'shout' },
        hold: 1.6,
      },
      { cue: { key: 's1', label: 'Candy Beam', auto: 8, slow: 0.4 } },
      {
        pose: [{ who: 'buu', pose: 'bu_candy', face: 'shout', speed: 18 }],
        sfx: { name: 'kiBlast', who: 'buu', pitch: 1.4 },
        cam: { from: { at: 'buu', local: [4.2, 0.6, 4] }, look: { at: 'buu', local: [0, 0.4, 4] }, fov: 48 },
        tick: (ctx, t) => {
          const st = story(ctx);
          FX().beam(ctx.b, buuHead(st.buu).add(new V3(0, 0.12, 0)), st.evil.chest(), t / 0.45);
        },
        hold: 0.5,
      },
      // the swat: the ray goes straight back the way it came
      {
        pose: [{ who: 'evil', pose: 'eb_reflect', face: 'grin', speed: 26 }],
        sfx: { name: 'punchHeavy', who: 'evil', pitch: 1.2 },
        slow: { scale: 0.35, seconds: 0.8 },
        call: (ctx) => ctx.b.vfx.flash(story(ctx).evil.chest(), 1.8, 0xff6ac4, 0.2, SL.Toon.tex.glow),
        tick: (ctx, t) => {
          const st = story(ctx);
          FX().beam(ctx.b, st.evil.chest(), st.buu.chest(), t / 0.5);
        },
        hold: 0.7,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.vfx.flash(st.buu.chest(), 0.8, 0xff6ac4, 0.18, SL.Toon.tex.glow);
          ctx.b.vfx.sparks(st.buu.chest(), 0xffb0d8, 22, 7, 0.1);
          st.buu.setState('scripted', { pose: 'bu_shock', expression: 'shock' });
          if (st.buu.model.setStone) st.buu.model.setStone(true, 'chocolate');
        },
        sfx: { name: 'candyPop', who: 'buu', pitch: 0.8, vol: 1.2 },
        cam: { from: { at: 'buu', local: [1.3, 0.4, 3.6] }, look: { at: 'buu' }, fov: 40 },
        hold: 1.4,
      },
      // and he shrinks down into what the ray makes of anybody: a bar of chocolate
      {
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = U.easeInOutCubic(Math.min(1, t / 1.1));
          FX().size(st.buu, 1 - 0.9 * k);
          if (t >= 1.1 && !st.buu.hidden) {
            st.buu.setHidden(true);
            FX().size(st.buu, 1);
            FX().bar(ctx.m, st.buu.pos);
            ctx.b.sfx('candyPop', null, { at: st.buu.pos, pitch: 1.5 });
            ctx.b.vfx.dust(st.buu.pos, 1, 8, 0xd8b0c0);
          }
        },
        cam: { from: { at: 'buu', local: [1.6, 0.2, 3.2] }, look: { at: 'buu', off: [0, -0.7, 0] }, fov: 40 },
        hold: 1.5,
      },
      {
        pose: [{ who: 'evil', pose: 'eb_laugh', face: 'grin', speed: 8 }],
        cam: { from: { at: 'evil', local: [0.6, 0.45, 2.3] }, look: { at: 'evil:head' }, fov: 36 },
        say: { who: 'evil', line: 'Hee hee! Chocolate!', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      FX().size(st.buu, 1);
      if (st.buu.model.setStone) st.buu.model.setStone(true, 'chocolate');
      st.buu.setHidden(true);
      st.buu.untargetable = st.buu.intangible = true;
      st.buu.controller = SL.data.buuKit.scripted();
      FX().bar(ctx.m, st.buu.pos);
      st.evil.setState('scripted', { pose: 'eb_idle', expression: 'grin' });
      ctx.m.flags.reflected = true;
      ctx.m.flags.chocolate = true;
    },
  };

  S.split_absorb = {
    id: 'split_absorb',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 4 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'bar', FX().bar(ctx.m, st.buu.pos).position);
        },
        pose: [{ who: 'evil', pose: 'run', face: 'grin', speed: 6 }],
        move: { who: 'evil', at: 'bar', off: [0, 0, 0.9], seconds: 1.6, face: 'bar' },
        cam: { from: { at: 'bar', off: [1.6, 0.4, 1.4] }, look: { at: 'bar', off: [0, 0.3, 0] }, fov: 40 },
        hold: 0.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          if (!st.evil.model.props.chocolate) st.evil.model.addProp(SL.data.buuSplit.CHOCOLATE);
          st.evil.model.setPropVisible('chocolate', true);
          FX().bar(ctx.m, null);
        },
        pose: [{ who: 'evil', pose: 'eb_laugh', face: 'grin', speed: 8 }],
        cam: { from: { at: 'evil', local: [0.7, 0.45, 2.2] }, look: { at: 'evil:head' }, fov: 36 },
        say: { who: 'evil', line: 'Hehehe... good-bye, fat one.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'evil', pose: 'eb_eat', face: 'grin', speed: 8 }],
        cam: { from: { at: 'evil', local: [0.45, 0.45, 1.7] }, look: { at: 'evil:head' }, fov: 36 },
        tick: (ctx, t) => {
          const st = story(ctx);
          if (t > 1.2 && st.evil.model.props.chocolate && st.evil.model.props.chocolate.visible) st.evil.model.setPropVisible('chocolate', false);
          if (ctx.b.frame % 24 === 0) ctx.b.sfx('candyPop', st.evil, { pitch: 0.6, vol: 0.6 });
        },
        hold: 2.2,
      },
      // the change: doubled over, the body fighting what it just took in
      {
        pose: [{ who: 'evil', pose: 'eb_mutate', face: 'shout', speed: 8 }],
        mood: { amount: 0.5, color: 0x3a0a28, seconds: 2 },
        sfx: { name: 'steam', who: 'evil', vol: 1, dur: 3 },
        cam: { from: { at: 'evil', local: [2.6, -0.4, 5.6] }, look: { at: 'evil', off: [0, 0.2, 0] }, fov: 48 },
        tick: (ctx, t) => {
          const b = ctx.b, st = story(ctx), f = st.evil;
          const k = Math.min(1, t / 3.2);
          FX().steam(b, f, 0.4 + k * 0.6, k > 0.5 ? 0xf0b8d4 : 0xc8c0d0);
          FX().size(f, 1 + k * 0.12 + Math.sin(t * 34) * 0.02 * k, 1 + k * 0.05);
          if (b.frame % 8 === 0) b.cameraTraumaAt(f.pos, 0.15 + k * 0.35);
          if (b.frame % 20 === 0) b.vfx.bolt(f.chest().add(new V3(U.rand(-1, 1), U.rand(-0.5, 1), U.rand(-1, 1))), 1.6, 0xff7ab8);
          if (b.frame === 1 || b.frame % 60 === 0) b.sfx('rumble', f, { vol: 0.8, dur: 1.2 });
        },
        hold: 3.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const at = st.evil.pos.clone();
          FX().size(st.evil, 1);
          st.evil.setHidden(true);
          st.sup.setHidden(false);
          st.sup.setPosition(at);
          st.sup.yaw = st.sup.prevYaw = st.evil.yaw;
          ctx.b.vfx.explosion(at.clone().add(new V3(0, 1, 0)), 3.6, 0xff7ab8);
          ctx.b.vfx.dust(at, 5, 30, 0xd8b8c8);
          SL.ScreenFX.flash(0.6, '#ffb0d8');
        },
        pose: [{ who: 'sup', pose: 'sb_roar', face: 'shout', speed: 10 }],
        sfx: { name: 'explosionBig', who: 'sup' },
        shake: { at: 'sup', amount: 1 },
        cam: { from: { at: 'sup', local: [3.2, 0.4, 7.4] }, look: { at: 'sup' }, fov: 50 },
        hold: 1.6,
      },
      {
        sfx: { name: 'roar', who: 'sup', pitch: 0.7, vol: 1.2 },
        shake: { at: 'sup', amount: 0.7 },
        cam: { from: { at: 'sup', local: [0.6, 0, 3.2] }, to: { at: 'sup', local: [0.4, 0.3, 2.4] }, look: { at: 'sup', off: [0, 0.2, 0] }, look2: { at: 'sup:head' }, fov: 42, fov2: 38, ease: 'inOut' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'grin', speed: 4 }],
        cam: { from: { at: 'sup', local: [0.35, 0.5, 1.9] }, look: { at: 'sup:head' }, fov: 34 },
        say: { who: 'sup', line: '...Much better.', duration: 2.2, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'sup', pose: 'sb_idle', face: 'smirk', speed: 3 }],
        cam: { from: { at: 'sup', local: [0.7, 0.2, -1.8] }, look: { at: 'sup', local: [0, 2.2, 4] }, fov: 52 },
        say: { who: 'sup', line: 'Somewhere up there... two little ones who think they can fight. Let\'s go and see.', duration: 3.6 },
        hold: 3.8,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.b.vfx.ring(st.sup.pos.clone().add(new V3(0, 0.1, 0)), 4, 0xff7ab8, 0.5, new V3(0, 1, 0));
          ctx.b.vfx.dust(st.sup.pos, 3, 16, 0xd8b8c8);
        },
        pose: [{ who: 'sup', pose: 'flyUp', face: 'grin', speed: 8 }],
        sfx: { name: 'dash', who: 'sup', pitch: 0.7 },
        move: { who: 'sup', at: 'sup', off: [0, 40, -30], seconds: 1.4, ease: 'in', ground: false },
        cam: { from: { at: 'satan', off: [2, 1.2, 4] }, look: { at: 'satan', off: [0, 6, -6] }, fov: 56 },
        hold: 0.3,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.sup.setHidden(true);
          beeAt(ctx, null, 'held', { by: st.satan });
        },
        pose: [{ who: 'satan', pose: 'ms_kneelHold', face: 'sad', speed: 3 }],
        cam: { from: { at: 'satan', local: [0.5, 0.2, 2.4] }, look: { at: 'satan:head' }, fov: 38 },
        say: { who: 'satan', line: '...Buu? Where\'d you go, pal?', duration: 3, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      FX().size(st.evil, 1);
      FX().bar(ctx.m, null);
      if (st.evil.model.props.chocolate) st.evil.model.setPropVisible('chocolate', false);
      st.evil.setHidden(true);
      st.evil.untargetable = st.evil.intangible = true;
      st.sup.setHidden(true);
      st.sup.untargetable = st.sup.intangible = true;
      st.satan.setState('scripted', { pose: 'ms_kneelHold', expression: 'sad' });
      beeAt(ctx, null, 'held', { by: st.satan });
      ctx.m.flags.goodBuuEaten = true;
      ctx.m.flags.superBuuBorn = true;
    },
  };
})();
