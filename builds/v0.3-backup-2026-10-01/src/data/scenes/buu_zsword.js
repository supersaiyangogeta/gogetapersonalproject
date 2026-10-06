/*
 * SCENES — Chapter 12: The Z Sword (the Sacred World of the Kai).
 *
 *   zs_arrive    the Sacred World; the Supreme Kai and Kibito; the Z Sword in its rock
 *   zs_pulled    out of the rock, over his head: "It's so heavy..."
 *   zs_cube      the Katchin, the hardest metal there is; "cut it" (a cue)
 *   zs_break     CLANG: half a sword spinning away; smoke; the Old Kai
 *   zs_ritual    five hours of a ritual dance, twenty hours of sitting, the sky going round
 *   zs_ultimate  the Ultimate: a close white aura, black hair, the grass pressed flat; one punch,
 *                and the Katchin in pieces (a cue)
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const Z = () => SL.data.zSword;
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    // whichever body is Gohan now
    if (s.gohan) out.hero = s.changed ? s.gohanU : s.gohan;
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
  const pt = (ctx, name, v) => {
    ctx.cast[name] = { pos: v.clone() };
  };

  S.zs_arrive = {
    id: 'zs_arrive',
    cast,
    music: { song: 'vision', level: 1 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          pt(ctx, 'rock', ground(ctx, Z().ROCK));
          faceTo(st.gohan, Z().ROCK);
          faceTo(st.shin, st.gohan.pos);
          faceTo(st.kibito, st.gohan.pos);
        },
        pose: [
          { who: 'gohan', pose: 'ag_idle', face: 'calm', speed: 3 },
          { who: 'shin', pose: 'sk_idle', face: 'calm', speed: 3 },
          { who: 'kibito', pose: 'kb_idle', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'rock', off: [18, 9, 20] }, to: { at: 'rock', off: [8, 3.5, 10] }, look: { at: 'rock', off: [0, 1.5, 0] }, fov: 50, fov2: 44, ease: 'inOut' },
        hold: 4,
      },
      {
        cam: { from: { at: 'shin', local: [0.5, 0.3, 2.2] }, look: { at: 'shin:head' }, fov: 36 },
        say: { who: 'shin', line: 'The Z Sword. It has been in that rock since before anyone can remember. Whoever pulls it out gains incredible power.', duration: 4.4 },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'kibito', local: [0.5, 0.3, 2.2] }, look: { at: 'kibito:head' }, fov: 36 },
        say: { who: 'kibito', line: 'Nobody has ever managed it. Not one of the Kais.', duration: 3 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'gohan', local: [2.2, 0.35, 0.9] }, look: { at: 'gohan:head' }, fov: 38 },
        say: { who: 'adult_gohan', line: 'If it can help me beat Buu... I have to try.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.kaiWorld = true;
    },
  };

  S.zs_pulled = {
    id: 'zs_pulled',
    cast,
    events: [
      {
        pose: [{ who: 'gohan', pose: 'ag_swordW', face: 'grit', speed: 4 }],
        cam: { from: { at: 'gohan', local: [1.4, 0.2, 3.2] }, look: { at: 'gohan', off: [0, 0.8, 0] }, fov: 44 },
        sfx: { name: 'rumble', who: 'gohan', vol: 0.6 },
        say: { who: 'adult_gohan', line: 'Nnngh... it\'s out! But it\'s so... HEAVY...!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'shin', pose: 'sk_idle', face: 'shock', speed: 5 }],
        cam: { from: { at: 'shin', local: [0.5, 0.3, 2.2] }, look: { at: 'shin:head' }, fov: 36 },
        say: { who: 'shin', line: 'He pulled it out... Now learn to use it. Swing it until it stops swinging you.', duration: 3.6 },
        hold: 3.8,
      },
    ],
    end(ctx) {
      story(ctx).gohan.setState('scripted', { pose: 'ag_idle', expression: 'grit' });
    },
  };

  S.zs_cube = {
    id: 'zs_cube',
    cast,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          st.set.cube.visible = true;
          pt(ctx, 'cube', ground(ctx, Z().CUBE));
          st.gohan.setPosition(ground(ctx, Z().CUBE.clone().add(new V3(0, 0, -2.6))));
          faceTo(st.gohan, Z().CUBE);
          faceTo(st.shin, Z().CUBE);
          ctx.b.vfx.flash(Z().CUBE.clone().add(new V3(0, 1.2, 0)), 3, 0xe0d8ff, 0.3, SL.Toon.tex.glow);
        },
        pose: [
          { who: 'shin', pose: 'sk_palm', face: 'calm', speed: 6 },
          { who: 'gohan', pose: 'ag_idle', face: 'calm', speed: 4 },
        ],
        sfx: { name: 'magic', who: 'shin' },
        cam: { from: { at: 'cube', off: [5, 2.6, 6] }, look: { at: 'cube', off: [0, 1.1, 0] }, fov: 44 },
        say: { who: 'shin', line: 'Katchin — the hardest metal in the universe. With the Z Sword, you should be able to cut it.', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_swordW', face: 'grit', speed: 8 }],
        cam: { from: { at: 'gohan', local: [3.2, 0.6, -1.4] }, look: { at: 'cube', off: [0, 1.2, 0] }, fov: 50 },
        hold: 0.6,
      },
      { cue: { key: 'heavy', label: 'Cut it', auto: 8 } },
    ],
    end(ctx) {
      story(ctx).set.cube.visible = true;
    },
  };

  S.zs_break = {
    id: 'zs_break',
    cast,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          pt(ctx, 'cube', ground(ctx, Z().CUBE));
          const hit = ground(ctx, Z().CUBE).add(new V3(0, 1.8, 0));
          b.vfx.sparks(hit, 0xfff3c0, 30, 10, 0.1);
          b.vfx.flash(hit, 2.5, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.cameraTraumaAt(hit, 0.6);
          if (st.gohan.model.props.zsword) st.gohan.model.setPropVisible('zsword', false);
          // half a sword, spinning away
          st.set.shard.visible = true;
          st.set.shard.position.copy(hit);
          st.shardV = new V3(-3, 9, 4);
        },
        pose: [{ who: 'gohan', pose: 'ag_sword', face: 'shock', speed: 24 }],
        sfx: { name: 'swordClang', who: 'gohan', pitch: 0.7, vol: 1.3 },
        slow: { scale: 0.3, seconds: 1 },
        cam: { from: { at: 'cube', off: [4, 1.8, 4] }, look: { at: 'cube', off: [0, 1.6, 0] }, fov: 44 },
        tick: (ctx) => {
          const st = story(ctx);
          if (!st.shardV) return;
          st.shardV.y -= 22 / 60;
          st.set.shard.position.addScaledVector(st.shardV, 1 / 60);
          st.set.shard.rotation.z += 0.3;
          st.set.shard.rotation.x += 0.2;
          const gy = ctx.b.stage.heightAt(st.set.shard.position.x, st.set.shard.position.z) + 0.1;
          if (st.set.shard.position.y < gy) {
            st.set.shard.position.y = gy;
            st.shardV.set(0, 0, 0);
          }
        },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'gohan', local: [2.2, 0.35, 0.8] }, look: { at: 'gohan:head' }, fov: 36 },
        say: { who: 'adult_gohan', line: 'It... broke.', duration: 1.8, style: 'quiet' },
        pose: [{ who: 'gohan', pose: 'ag_idle', face: 'shock', speed: 4 }],
        hold: 2,
      },
      // a puff of smoke where the pieces lie
      {
        call: (ctx) => {
          const st = story(ctx);
          st.elder.setHidden(false);
          st.elder.setPosition(ground(ctx, st.gohan.pos.clone().add(new V3(-1.9, 0, 0.3))));
          faceTo(st.elder, st.gohan.pos);
          faceTo(st.gohan, st.elder.pos);
          ctx.b.vfx.dust(st.elder.pos, 1.8, 20, 0xe8e4f0);
          ctx.b.vfx.flash(st.elder.chest(), 2, 0xffffff, 0.3, SL.Toon.tex.glow);
        },
        pose: [{ who: 'elder', pose: 'ek_idle', face: 'grin', speed: 4 }],
        sfx: { name: 'capsulePop', who: 'elder', pitch: 0.7, vol: 1.2 },
        cam: { from: { at: 'elder', local: [1.6, 0.5, 1.5] }, look: { at: 'elder:head' }, fov: 38 },
        say: { who: 'elder_kai', line: 'Aaah! FREE! Seventy-five million years in that thing!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_point', face: 'smirk', speed: 6 }],
        say: { who: 'elder_kai', line: 'A Kai sealed me in there because he was afraid of me. You broke it, boy — so I owe you.', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'shin', pose: 'sk_idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'shin', local: [0.5, 0.3, 2.2] }, look: { at: 'shin:head' }, fov: 36 },
        say: { who: 'shin', line: 'The Supreme Kai of fifteen generations ago...!', duration: 2.4 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'elder', pose: 'ek_point', face: 'calm', speed: 4 }],
        cam: { from: { at: 'elder', local: [1.6, 0.5, 1.5] }, look: { at: 'elder:head' }, fov: 38 },
        say: { who: 'elder_kai', line: 'That sword was a toy. There is a power sleeping in you, boy. I can wake all of it. It will take a while.', duration: 4.2 },
        hold: 4.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.set.shard.visible = true;
      st.shardV = null;
      if (st.gohan.model.props.zsword) st.gohan.model.setPropVisible('zsword', false);
      st.elder.setHidden(false);
      ctx.m.flags.swordBroken = true;
      ctx.m.flags.elderFreed = true;
    },
  };

  S.zs_ritual = {
    id: 'zs_ritual',
    cast,
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          st.gohan.setPosition(ground(ctx, new V3(0, 0, 0)));
          faceTo(st.gohan, new V3(0, 0, 5));
          pt(ctx, 'mid', ground(ctx, new V3(0, 0, 0)));
        },
        pose: [{ who: 'gohan', pose: 'ag_idle', face: 'calm', speed: 3 }],
        cam: { from: { at: 'mid', off: [5, 2.4, 6] }, look: { at: 'mid', off: [0, 1, 0] }, fov: 46 },
        say: { who: 'elder_kai', line: 'Stand there. Don\'t move. First, the ritual.', duration: 2.8 },
        hold: 3,
      },
      // the dance: round and round him
      {
        cam: { from: { at: 'mid', off: [-4, 1.6, 6] }, look: { at: 'mid', off: [0, 0.8, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), e = st.elder;
          const a = t * 1.3;
          e.setPosition(ground(ctx, new V3(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8)));
          faceTo(e, st.gohan.pos);
          const want = Math.floor(t * 1.2) % 2 ? 'ek_ritualB' : 'ek_ritualA';
          if (!e.sd || e.sd.pose !== want) e.setState('scripted', { pose: want, expression: 'calm', speed: 6 });
        },
        hold: 4.2,
      },
      {
        title: { chapter: '', title: 'FIVE HOURS LATER', subtitle: '', duration: 2 },
        pose: [{ who: 'kibito', pose: 'kb_idle', face: 'hurt', speed: 3 }],
        cam: { from: { at: 'kibito', local: [0.5, 0.3, 2.2] }, look: { at: 'kibito:head' }, fov: 36 },
        say: { who: 'kibito', line: '...Is he still dancing?', duration: 2.2, style: 'quiet' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.elder.setPosition(ground(ctx, new V3(0, 0, 1.6)));
          faceTo(st.elder, st.gohan.pos);
        },
        pose: [{ who: 'elder', pose: 'ek_sit', face: 'calm', speed: 3 }],
        cam: { from: { at: 'elder', local: [0.6, 0.6, 2.2] }, look: { at: 'elder:head' }, fov: 38 },
        say: { who: 'elder_kai', line: 'The ritual is done. Now I sit here, and you sit there. Twenty hours.', duration: 3.2 },
        hold: 3.4,
      },
      // twenty hours: the sky going round, the Kais bored, the boy in new clothes (the Kais' gift)
      {
        fade: { to: 'black', seconds: 0.5 },
        hold: 0.6,
      },
      {
        call: (ctx) => {
          const b = ctx.b;
          SL.data.zSword.change(b);
          const st = story(ctx);
          ctx.cast.hero = st.gohanU;
          st.gohanU.setPosition(ground(ctx, new V3(0, 0, 0)));
          faceTo(st.gohanU, st.elder.pos);
          ctx.m.fade('clear', 0.6);
        },
        title: { chapter: '', title: 'TWENTY HOURS LATER', subtitle: '', duration: 2.2 },
        pose: [
          { who: 'hero', pose: 'ag_meditate', face: 'calm', speed: 3 },
          { who: 'shin', pose: 'sk_idle', face: 'calm', speed: 2 },
        ],
        cam: { from: { at: 'mid', off: [6, 5, 8] }, look: { at: 'mid', off: [0, 0.4, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const k = Math.min(1, t / 2.4);
          ctx.b.stage.setMood(0.1 + 0.35 * Math.sin(k * Math.PI), 0x221638, 0.05);
        },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      SL.data.zSword.change(ctx.b);
      st.gohanU.setState('scripted', { pose: 'ag_meditate', expression: 'calm' });
      st.elder.setHidden(false);
      st.elder.setState('scripted', { pose: 'ek_palms', expression: 'calm' });
      ctx.m.flags.ritual = true;
    },
  };

  S.zs_ultimate = {
    id: 'zs_ultimate',
    cast,
    music: { song: 'farewell', level: 4 },
    events: [
      // no gold, no lightning: the eyes open, and it is simply there
      {
        pose: [{ who: 'hero', pose: 'ag_meditate', face: 'calm', speed: 2 }],
        cam: { from: { at: 'hero:face', local: [0.1, 0, 0.9] }, look: { at: 'hero:head' }, fov: 32 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx), g = st.gohanU, b = ctx.b;
          SL.data.buuKit.toForm(g, 'ultimate');
          b.vfx.ring(g.pos.clone().add(new V3(0, 0.1, 0)), 12, 0xf2f6ff, 0.9, new V3(0, 1, 0));
          b.vfx.dust(g.pos, 6, 26, 0xc8d8a8);
          b.cameraTraumaAt(g.pos, 0.35);
          b.stage.clearMood(0.6);
        },
        pose: [{ who: 'hero', pose: 'ag_calm', face: 'calm', speed: 2.5 }],
        sfx: { name: 'aura', who: 'hero', vol: 0.9, pitch: 0.8 },
        cam: { from: { at: 'hero', local: [3.2, 0.6, 5] }, look: { at: 'hero', off: [0, 0.2, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const g = story(ctx).gohanU;
          // the grass pressed flat in a ring that keeps widening
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.ring(g.pos.clone().add(new V3(0, 0.05, 0)), 4 + t * 5, 0xe6f0d8, 0.5, new V3(0, 1, 0));
        },
        hold: 3.2,
      },
      {
        pose: [{ who: 'shin', pose: 'sk_idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'shin', local: [0.5, 0.3, 2.2] }, look: { at: 'shin:head' }, fov: 36 },
        say: { who: 'shin', line: 'No golden hair... no lightning... and more power than I have ever felt.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'hero', local: [0.4, 0.35, 2] }, look: { at: 'hero:head' }, fov: 34 },
        say: { who: 'adult_gohan', line: 'It\'s strange. I feel... calm. Like I don\'t need to shout.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.set.cube.visible = true;
          pt(ctx, 'cube', ground(ctx, Z().CUBE));
          st.gohanU.setPosition(ground(ctx, Z().CUBE.clone().add(new V3(0.4, 0, -2.4))));
          faceTo(st.gohanU, Z().CUBE);
        },
        pose: [{ who: 'elder', pose: 'ek_point', face: 'smirk', speed: 5 }],
        cam: { from: { at: 'cube', off: [4.4, 2, 5] }, look: { at: 'cube', off: [0, 1.2, 0] }, fov: 44 },
        say: { who: 'elder_kai', line: 'Try the Katchin again. Without the sword.', duration: 2.6 },
        hold: 2.8,
      },
      { cue: { key: 'light', label: 'One punch', auto: 8 } },
      {
        call: (ctx) => {
          const st = story(ctx), b = ctx.b;
          const c = ground(ctx, Z().CUBE).add(new V3(0, 1.1, 0));
          st.set.cube.visible = false;
          b.vfx.debrisBurst(c, 26, 0x5a5e6a, 12, 0.35);
          b.vfx.impact(c, 4, 0xf2f6ff);
          b.cameraTraumaAt(c, 0.7);
        },
        pose: [{ who: 'hero', pose: 'ag_jab', face: 'calm', speed: 30 }],
        sfx: { name: 'punchHeavy', who: 'hero', pitch: 0.7, vol: 1.4 },
        slow: { scale: 0.3, seconds: 0.8 },
        cam: { from: { at: 'cube', off: [3.4, 1.4, 3.8] }, look: { at: 'cube', off: [0, 1.1, 0] }, fov: 44 },
        hold: 1.8,
      },
      {
        pose: [
          { who: 'hero', pose: 'ag_calm', face: 'calm', speed: 3 },
          { who: 'elder', pose: 'ek_idle', face: 'grin', speed: 4 },
        ],
        cam: { from: { at: 'elder', local: [1.6, 0.5, 1.5] }, look: { at: 'elder:head' }, fov: 38 },
        say: { who: 'elder_kai', line: 'Heh. Better than any sword, eh? Now go. Your world is running out of time.', duration: 3.6 },
        hold: 3.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      SL.data.buuKit.toForm(st.gohanU, 'ultimate');
      st.set.cube.visible = false;
      ctx.m.flags.ultimate = true;
      ctx.m.flags.katchinBroken = true;
    },
  };
})();
