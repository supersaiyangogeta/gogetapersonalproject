/*
 * SCENES — Chapter 13: Super Vegito.
 *
 *   sv_rise        Buuhan powered up: "show me"; "don't blink"
 *   sv_named       "And this is... SUPER VEGITO!"
 *   sv_speedIn     Buuhan's full-power right hook, coming in
 *   sv_tantrum     blasts at nothing in every direction; Vegito above him, arms folded
 *   sv_hands       "You haven't even made me use my hands yet!"
 *   sv_sword       underground; the burst; sense him (cue), Spirit Sword (cue), drive it down (cue),
 *                  lift him on it, detonate (cue); he grows back
 *   sv_ghosts      five pink ghosts out of his mouth
 *   sv_ghostsDone  five puffs of smoke
 *   sv_shoutIn     the breath in; the Vice Shout; the sky tears
 *   sv_jaw         "Shut up." — the rift closes
 *   sv_candyBeam   the Transmutation Beam: a coffee candy that talks back
 *   sv_throat      down the throat, out of the back of the neck, teeth everywhere; changed back
 *
 * Vegito speaks in two voices at once: subtitle style 'dual'. Dialogue is paraphrased English
 * written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.buuKit;
  const VK = () => SL.data.vegitoKit;
  const SVD = () => SL.data.superVegito;
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
  const handR = (f) => f.model.joints.handR.getWorldPosition(new V3()).sub(f.object.position).add(f.pos);
  /** The Spirit Sword's tip in the world (the prop grows out of the palm: its fill scales it). */
  const bladeTip = (f) => {
    const g = f.model.props.spiritSwordBig;
    if (!g) return handR(f);
    f.model.root.updateMatrixWorld(true);
    const fill = g.userData.fill ? g.userData.fill.scale.y : 1;
    return g.localToWorld(new V3(0, g.userData.tip * fill, 0)).sub(f.object.position).add(f.pos);
  };

  S.sv_rise = {
    id: 'sv_rise',
    cast,
    music: { song: 'vegito_theme', level: 3 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.vegito, st.bh.pos);
          faceTo(st.bh, st.vegito.pos);
        },
        pose: [
          { who: 'bh', pose: 'bh_charge', face: 'wicked', speed: 6 },
          { who: 'vegito', pose: 'vg_idle', face: 'cocky', speed: 4 },
        ],
        cam: { from: { at: 'bh', local: [1.2, -0.4, 3.4] }, look: { at: 'bh', off: [0, 0.8, 0] }, fov: 44 },
        tick: (ctx) => {
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.streamInward(story(ctx).bh.chest(), 3, 0xff8ac4, 2, 0.16, 0.4);
        },
        say: { who: 'buuhan', line: 'Serious? Fine. Show me, you fused freak — show me what you\'ve got!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_smirk', face: 'cocky', speed: 5 }],
        cam: { from: { at: 'vegito', local: [0.35, 0.3, 1.6] }, look: { at: 'vegito:head' }, fov: 34 },
        say: { who: 'vegito', line: 'Alright. But don\'t blink.', duration: 2.2, style: 'dual' },
        hold: 2.4,
      },
    ],
  };

  S.sv_named = {
    id: 'sv_named',
    cast,
    music: { song: 'vegito_theme', level: 6 },
    events: [
      // the dust clears; he straightens; the smirk
      {
        pose: [
          { who: 'vegito', pose: 'vg_settle', face: 'cocky', speed: 4 },
          { who: 'bh', pose: 'bh_fight', face: 'shock', speed: 5 },
        ],
        cam: { from: { at: 'vegito', local: [0.9, -0.3, 3.4] }, to: { at: 'vegito', local: [0.5, 0.1, 2.2] }, look: { at: 'vegito', off: [0, 0.6, 0] }, fov: 40 },
        tick: (ctx) => {
          const v = story(ctx).vegito;
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.bolt(v.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.8, 0.8), U.rand(-0.5, 0.5))), U.rand(0.6, 1.2), 0x8ac8ff);
        },
        say: { who: 'vegito', line: 'And this is...', duration: 2, style: 'dual' },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'vegito', local: [0.3, 0.7, 1.4] }, look: { at: 'vegito:head' }, fov: 32 },
        tick: (ctx) => {
          const v = story(ctx).vegito;
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.bolt(v.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.2, 0.9), U.rand(-0.5, 0.5))), U.rand(0.6, 1.2), 0x8ac8ff);
        },
        say: { who: 'vegito', line: '...SUPER VEGITO!', duration: 2.4, style: 'dual shout' },
        shake: { at: 'vegito', amount: 0.35 },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'bh', local: [0.3, 0.3, 1.5] }, look: { at: 'bh:head' }, fov: 32 },
        tick: (ctx) => {
          const bh = story(ctx).bh;
          if (ctx.b.frame % 25 === 0) ctx.b.vfx.sparks(bh.model.joints.head.getWorldPosition(new V3()).sub(bh.object.position).add(bh.pos).add(new V3(0.1, 0.12, 0.1)), 0xbfe6ff, 3, 2, 0.05);
        },
        say: { who: 'buuhan', line: 'Th-this power... it isn\'t possible...', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      ctx.m.flags.superVegito = true;
    },
  };

  S.sv_speedIn = {
    id: 'sv_speedIn',
    cast,
    music: { song: 'finale', level: 5 },
    events: [
      {
        cam: { from: { at: 'vegito', local: [0.5, 0.3, 2.2] }, look: { at: 'vegito:head' }, fov: 36 },
        say: { who: 'vegito', line: 'Well? Go ahead. Hit me.', duration: 1.8, style: 'dual' },
        hold: 2,
      },
      {
        pose: [{ who: 'bh', pose: 'sb_jabW', face: 'shout', speed: 10 }],
        cam: { from: { at: 'bh', local: [1.4, 0.2, 2.6] }, look: { at: 'bh', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'buuhan', line: 'DON\'T GET COCKY!', duration: 1.4, style: 'shout' },
        hold: 1,
      },
    ],
  };

  S.sv_tantrum = {
    id: 'sv_tantrum',
    cast,
    clearMood: false,
    music: { song: 'buu_theme', level: 5 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.bh, st.bh.pos.clone().add(new V3(0, 0, 5)));
        },
        pose: [{ who: 'bh', pose: 'bh_swat', face: 'shout', speed: 8 }],
        cam: { from: { at: 'bh', off: [7, 3, 8] }, look: { at: 'bh', off: [0, 0.6, 0] }, fov: 48 },
        tick: (ctx, t) => {
          const st = story(ctx), b = ctx.b;
          if (b.frame % 7 === 0) {
            const a = b.frame * 0.9;
            const dir = new V3(Math.cos(a), U.rand(0.05, 0.45), Math.sin(a));
            b.projectiles.spawnBlast(st.bh, st.bh.chest(), dir, { kind: 'ball', speed: 70, radius: 0.32, damage: 1, homing: 0, color: 0xff6ab4, core: 0xffffff, explode: 1.3, knock: 'flinch', impact: 1, life: 1.2 });
            b.sfx('kiBlast', st.bh, { vol: 0.6, pitch: 0.8 });
          }
        },
        say: { who: 'buuhan', line: 'COME OUT! COME OUT AND FIGHT ME!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          K().clearCombat(ctx.b);
          VK().vanishTo(ctx.b, st.vegito, st.bh.pos.clone().add(new V3(0, 5, 0.5)), { face: st.bh.pos });
          st.vegito.grounded = false;
        },
        pose: [
          { who: 'vegito', pose: 'vg_floatArms', face: 'cocky', speed: 6 },
          { who: 'bh', pose: 'bh_pant', face: 'angry', speed: 5 },
        ],
        cam: { from: { at: 'bh', local: [0.8, -0.3, 2] }, look: { at: 'vegito', off: [0, 0.2, 0] }, fov: 44 },
        say: { who: 'vegito', line: '...Done yet?', duration: 1.8, style: 'dual' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      K().clearCombat(ctx.b);
    },
  };

  S.sv_hands = {
    id: 'sv_hands',
    cast,
    music: { song: 'finale', level: 4 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx);
          K().hover(ctx.b, st.vegito, st.bh.pos.clone().add(new V3(0, 0, 4)), 2.2);
          faceTo(st.vegito, st.bh.pos);
          faceTo(st.bh, st.vegito.pos);
          ctx.b.vfx.dust(st.bh.pos, 3, 12, ctx.b.stage.dustColor);
        },
        pose: [
          { who: 'vegito', pose: 'vg_floatArms', face: 'cocky', speed: 5 },
          { who: 'bh', pose: 'bh_regen', face: 'angry', speed: 6 },
        ],
        cam: { from: { at: 'bh', local: [-0.8, -0.2, 2.4] }, look: { at: 'vegito', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'vegito', line: 'What\'s the matter? I thought you were going to destroy me. You haven\'t even made me use my hands yet!', duration: 4.2, style: 'dual' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.armsNeverUncrossed = true;
    },
  };

  S.sv_sword = {
    id: 'sv_sword',
    cast,
    clearMood: false,
    music: { song: 'vegito_theme', level: 5 },
    events: [
      // underground
      {
        call: (ctx) => {
          const st = story(ctx);
          faceTo(st.vegito, st.bh.pos);
          faceTo(st.bh, st.vegito.pos);
          ctx.dig0 = st.bh.pos.clone();
        },
        pose: [
          { who: 'bh', pose: 'bh_fight', face: 'wicked', speed: 6 },
          { who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 4 },
        ],
        cam: { from: { at: 'bh', local: [1.4, 0.2, 3] }, look: { at: 'bh', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'buuhan', line: 'Clever, aren\'t you? Let\'s see you find me, then!', duration: 2.4 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'bh', off: [5, 2, 5] }, look: { at: 'bh', off: [0, 0, 0] }, fov: 44 },
        pose: [{ who: 'bh', pose: 'dive', face: 'wicked', speed: 12 }],
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.8);
          const p = ctx.dig0.clone();
          p.y -= k * 3;
          st.bh.setPosition(p);
          st.bh.grounded = true;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.dust(ctx.dig0, 1.6, 6, ctx.b.stage.dustColor);
          if (k >= 1 && !st.bh.hidden) {
            st.bh.setHidden(true);
            ctx.b.stage.crater(ctx.dig0, 2.2, 0.5, null);
            ctx.b.sfx('burrow', null, { at: ctx.dig0 });
          }
        },
        hold: 1.2,
      },
      // the ground under Vegito bursts
      {
        pose: [{ who: 'vegito', pose: 'vg_armsStand', face: 'calm', speed: 4 }],
        cam: { from: { at: 'vegito', local: [2.4, 0.2, 3] }, look: { at: 'vegito', off: [0, 0.3, 0] }, fov: 44 },
        tick: (ctx) => {
          if (ctx.b.frame % 8 === 0) ctx.b.cameraTraumaAt(story(ctx).vegito.pos, 0.15);
        },
        sfx: { name: 'rumble', who: 'vegito', vol: 0.8 },
        hold: 1.4,
      },
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          const at = v.pos.clone();
          ctx.b.vfx.explosion(at.clone().add(new V3(0, 0.6, 0)), 4.5, 0xff6ab4, { smoke: true });
          ctx.b.stage.crater(at, 4, 0.7, null);
          ctx.b.sfx('explosionBig', null, { at });
          ctx.b.cameraTraumaAt(at, 0.8);
          // he is already up there
          const up = at.clone().add(new V3(0, 5.5, 0)).addScaledVector(v.forward.clone().setY(0).normalize(), -6.5);
          VK().vanishTo(ctx.b, v, up, { face: ctx.dig0 });
          v.grounded = false;
          pt(ctx, 'blast', at);
        },
        pose: [{ who: 'vegito', pose: 'vg_floatArms', face: 'cocky', speed: 8 }],
        cam: { from: { at: 'blast', off: [6, 1.5, 8] }, look: { at: 'vegito', off: [0, -1, 0] }, fov: 50 },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'vegito', local: [0.5, 0.4, 1.8] }, look: { at: 'vegito:head' }, fov: 34 },
        say: { who: 'vegito', line: 'Hiding under the ground? I can feel you, you know.', duration: 2.6, style: 'dual' },
        hold: 2.4,
      },
      { cam: { from: { at: 'vegito', local: [0.4, 0.3, 1.4] }, look: { at: 'vegito:head' }, fov: 32 }, cue: { key: 'charge', label: 'Sense him', auto: 6 } },
      // a pink glow moving under the rock
      {
        call: (ctx) => {
          const st = story(ctx);
          st.underGlow.visible = true;
          ctx.glow = ground(ctx, ctx.dig0.clone().add(new V3(-3, 0, 2)), 0.2);
          st.underGlow.position.copy(ctx.glow);
          pt(ctx, 'glow', ctx.glow);
        },
        cam: { from: { at: 'vegito', local: [1.4, 0.6, -2.2] }, look: { at: 'glow' }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx);
          st.underGlow.material.opacity = 0.5 + Math.sin(t * 8) * 0.25;
          st.underGlow.position.x += Math.sin(t * 2) * 0.02;
        },
        sfx: { name: 'heartbeat', who: 'vegito', vol: 0.6 },
        hold: 1.6,
      },
      // the right hand out, flat: the Spirit Sword
      {
        pose: [{ who: 'vegito', pose: 'vg_swordW', face: 'cocky', speed: 8 }],
        cam: { from: { at: 'vegito', local: [1.6, 0.3, 1.2] }, look: { at: 'vegito', local: [0, 0.3, 1] }, fov: 40 },
        hold: 0.8,
      },
      { cam: { from: { at: 'vegito', local: [1.6, 0.3, 1.2] }, look: { at: 'vegito', local: [0, 0.3, 1] }, fov: 40 }, cue: { key: 's1', label: 'Spirit Sword', auto: 6 } },
      {
        cam: { from: { at: 'vegito', local: [3.6, 0.6, -1.6] }, look: { at: 'vegito', local: [0, 0, 3.5] }, fov: 56 },
        sfx: { name: 'swordDraw', who: 'vegito', pitch: 0.7, vol: 1.2 },
        tick: (ctx, t) => {
          const v = story(ctx).vegito;
          v.model.setPropFill('spiritSwordBig', Math.min(1, t / 0.7));
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.flash(handR(v), 0.8, 0xffe890, 0.12, SL.Toon.tex.glow);
        },
        say: { who: 'vegito', line: 'Spirit Sword.', duration: 1.6, style: 'dual quiet' },
        hold: 1.8,
      },
      { cam: { from: { at: 'vegito', local: [2.6, 0.8, 3.4] }, look: { at: 'vegito', local: [0, 0.2, 5] }, fov: 48 }, cue: { key: 'heavy', label: 'Drive it down', auto: 6, slow: 0.3 } },
      // down through the rock: the glow is where the blade goes
      {
        pose: [{ who: 'vegito', pose: 'vg_swordDown', face: 'angry', speed: 16 }],
        cam: { from: { at: 'glow', off: [7, 2, 7] }, look: { at: 'glow', off: [0, 3, 0] }, fov: 50 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const tip = bladeTip(st.vegito);
          const gy = ctx.b.stage.hasGround ? ctx.b.stage.heightAt(tip.x, tip.z) : 0;
          st.underGlow.position.lerp(new V3(tip.x, gy + 0.2, tip.z), 0.3);
          if (t > 0.35 && !ctx.impaled) {
            ctx.impaled = true;
            ctx.b.vfx.explosion(new V3(tip.x, gy + 0.4, tip.z), 3, 0xffe890, { smoke: true });
            ctx.b.stage.crater(new V3(tip.x, gy, tip.z), 3, 0.6, null);
            ctx.b.sfx('swordSlash', null, { at: tip, pitch: 0.5, vol: 1.3 });
            ctx.b.cameraTraumaAt(tip, 0.7);
            st.underGlow.visible = false;
            st.bh.setHidden(false);
            st.bh.grounded = false;
            st.bh.setState('scripted', { pose: 'pierced', expression: 'hurt' });
          }
          if (ctx.impaled) {
            st.bh.setPosition(tip.clone().sub(new V3(0, st.bh.height * 0.55, 0)));
            st.bh.prevPos.copy(st.bh.pos);
          }
        },
        slow: { scale: 0.4, seconds: 0.6 },
        hold: 1.4,
      },
      // lifted overhead on the blade: the shot
      {
        pose: [{ who: 'vegito', pose: 'vg_swordUp', face: 'cocky', speed: 3 }],
        call: (ctx) => pt(ctx, 'under', ground(ctx, story(ctx).vegito.pos)),
        cam: { from: { at: 'vegito', local: [3, -5, 4.4] }, look: { at: 'vegito', off: [0, 4, 0] }, fov: 54 },
        tick: (ctx) => {
          const st = story(ctx);
          const tip = bladeTip(st.vegito);
          st.bh.setPosition(tip.clone().sub(new V3(0, st.bh.height * 0.55, 0)));
          st.bh.prevPos.copy(st.bh.pos);
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.flash(tip, 1.2, 0xffe890, 0.15, SL.Toon.tex.glow);
        },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'vegito', local: [-0.9, -0.4, -1.8] }, look: { at: 'bh' }, fov: 44 },
        tick: (ctx) => {
          const st = story(ctx);
          const tip = bladeTip(st.vegito);
          st.bh.setPosition(tip.clone().sub(new V3(0, st.bh.height * 0.55, 0)));
          st.bh.prevPos.copy(st.bh.pos);
        },
        say: { who: 'vegito', line: 'Look at you... hanging on for dear life. Is this really the best the almighty Majin Buu can do?', duration: 4, style: 'dual' },
        hold: 4.2,
      },
      { tick: (ctx) => {
          const st = story(ctx);
          const tip = bladeTip(st.vegito);
          st.bh.setPosition(tip.clone().sub(new V3(0, st.bh.height * 0.55, 0)));
          st.bh.prevPos.copy(st.bh.pos);
        }, cam: { from: { at: 'vegito', local: [3.2, -5.5, 5] }, look: { at: 'vegito', off: [0, 5, 0] }, fov: 58 }, cue: { key: 'blast', label: 'Detonate', auto: 6 } },
      {
        call: (ctx) => {
          const st = story(ctx);
          const tip = bladeTip(st.vegito);
          ctx.b.vfx.explosion(tip, 6, 0xffe890, { smoke: true });
          ctx.b.vfx.ring(tip, 8, 0xffffff, 0.5);
          SL.ScreenFX.flash(0.7, '#fff4c0');
          ctx.b.sfx('explosionHuge', null, { at: tip });
          ctx.b.cameraTraumaAt(tip, 1);
          st.bh.setHidden(true);
          st.bh.untargetable = st.bh.intangible = true;
          st.vegito.model.setPropFill('spiritSwordBig', 0);
          ctx.pieces = SL.data.trunksKit.dice(ctx.b, tip, [0xf29ac0, 0xe86a1c, 0x16225a, 0xf4f2ec], { seed: 777, count: 34, height: 2.2, width: 1 });
          pt(ctx, 'tip', tip);
          ctx.m.onDispose(ctx.pieces.dispose);
        },
        pose: [{ who: 'vegito', pose: 'vg_floatArms', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'tip', off: [8, -2, 10] }, look: { at: 'tip' }, fov: 50 },
        tick: (ctx) => ctx.pieces && ctx.pieces.tick(1 / 60),
        hold: 1.8,
      },
      // the pieces fall, gather, and grow back into him
      {
        call: (ctx) => {
          ctx.land = ground(ctx, ctx.cast.tip.pos.clone().setY(0));
          pt(ctx, 'land', ctx.land);
        },
        cam: { from: { at: 'land', off: [4, 1.6, 5] }, look: { at: 'land', off: [0, 0.8, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx), pcs = ctx.pieces;
          if (!pcs) return;
          const k = Math.min(1, t / 1.6);
          pcs.group.position.lerpVectors(ctx.cast.tip.pos, ctx.land.clone().add(new V3(0, 1, 0)), k);
          pcs.group.scale.setScalar(1 - k * 0.7);
          pcs.tick(1 / 60);
          if (k >= 1 && st.bh.hidden) {
            pcs.group.visible = false;
            st.bh.setHidden(false);
            st.bh.untargetable = st.bh.intangible = false;
            st.bh.setPosition(ctx.land);
            st.bh.grounded = true;
            faceTo(st.bh, st.vegito.pos);
            st.bh.setState('scripted', { pose: 'bh_regen', expression: 'angry' });
            ctx.b.sfx('regrow', st.bh);
          }
        },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'bh', local: [0.4, 0.3, 1.8] }, look: { at: 'bh:head' }, fov: 36 },
        tick: (ctx) => VK().steam(ctx.b, story(ctx).bh, 0.5),
        say: { who: 'buuhan', line: 'Y-you... you\'ll pay for that...!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.vegito.model.setPropFill('spiritSwordBig', 0);
      st.underGlow.visible = false;
      if (ctx.pieces) ctx.pieces.group.visible = false;
      st.bh.setHidden(false);
      st.bh.untargetable = st.bh.intangible = false;
      if (ctx.b.stage.hasGround && !st.bh.grounded) {
        st.bh.setPosition(ground(ctx, st.bh.pos));
        st.bh.grounded = true;
      }
      ctx.m.flags.spiritSword = true;
    },
  };

  S.sv_ghosts = {
    id: 'sv_ghosts',
    cast,
    music: { song: 'finale', level: 5 },
    events: [
      {
        pose: [{ who: 'bh', pose: 'gk_ghostW', face: 'wicked', speed: 6 }],
        cam: { from: { at: 'bh', local: [0.8, 0.3, 2.6] }, look: { at: 'bh:head' }, fov: 38 },
        say: { who: 'buuhan', line: 'Let\'s see you deal with THESE — the boy\'s best trick!', duration: 2.8, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'bh', pose: 'gk_ghost', face: 'shout', speed: 10 }],
        cam: { from: { at: 'bh', local: [2.2, 0.6, 5] }, look: { at: 'bh', local: [0, 0.8, 2] }, fov: 46 },
        tick: (ctx, t) => {
          const st = story(ctx), bh = st.bh;
          const mouth = SVD().targetPos(bh, 'mouth');
          const fwd = bh.forward.clone().setY(0).normalize();
          const right = new V3(fwd.z, 0, -fwd.x);
          st.ghosts.forEach((g, i) => {
            const born = i * 0.35;
            if (t < born) return;
            if (!g.group.visible) {
              g.group.visible = true;
              g.alive = true;
              g.pos.copy(mouth);
              ctx.b.sfx('candyPop', bh, { pitch: 1.2 + i * 0.1 });
            }
            const k = Math.min(1, (t - born) / 0.8);
            const spot = mouth.clone().addScaledVector(fwd, 2 + k * 1.5).addScaledVector(right, (i - 2) * 1.4 * k).add(new V3(0, 0.6 + Math.sin(i) * 0.4, 0));
            g.pos.lerp(spot, 0.12);
          });
        },
        say: { who: 'buuhan', line: 'Hee hee hee hee!', duration: 1.6 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_fingers', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'vegito', local: [0.6, 0.4, 1.8] }, look: { at: 'vegito', local: [0, 0.3, 1] }, fov: 38 },
        say: { who: 'vegito', line: 'Five of them? That\'s handy. I\'ve got five fingers.', duration: 2.8, style: 'dual' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      const bh = st.bh;
      const mouth = SVD().targetPos(bh, 'mouth');
      const fwd = bh.forward.clone().setY(0).normalize();
      const right = new V3(fwd.z, 0, -fwd.x);
      st.ghosts.forEach((g, i) => {
        g.group.visible = true;
        g.alive = true;
        if (ctx.skipped) g.pos.copy(mouth.clone().addScaledVector(fwd, 3.5).addScaledVector(right, (i - 2) * 1.4).add(new V3(0, 0.6, 0)));
      });
    },
  };

  S.sv_ghostsDone = {
    id: 'sv_ghostsDone',
    cast,
    music: { song: 'finale', level: 4 },
    events: [
      {
        pose: [{ who: 'bh', pose: 'bh_fight', face: 'shock', speed: 5 }],
        cam: { from: { at: 'bh', local: [0.3, 0.3, 1.6] }, look: { at: 'bh:head' }, fov: 34 },
        say: { who: 'buuhan', line: '...All five?! In one shot?!', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'vegito', pose: 'vg_smirk', face: 'cocky', speed: 5 }],
        cam: { from: { at: 'vegito', local: [0.4, 0.3, 1.6] }, look: { at: 'vegito:head' }, fov: 34 },
        say: { who: 'vegito', line: 'Five shots. You weren\'t counting?', duration: 2.2, style: 'dual' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      for (const g of story(ctx).ghosts) {
        g.alive = false;
        g.group.visible = false;
      }
    },
  };

  S.sv_shoutIn = {
    id: 'sv_shoutIn',
    cast,
    clearMood: false,
    music: { song: 'finale', level: 6 },
    events: [
      {
        pose: [{ who: 'bh', pose: 'bh_charge', face: 'grit', speed: 5 }],
        cam: { from: { at: 'bh', local: [0.5, 0.2, 2.2] }, look: { at: 'bh:head' }, fov: 36 },
        say: { who: 'buuhan', line: 'Enough... ENOUGH! I\'ll tear this whole dimension apart!', duration: 2.8, style: 'shout' },
        hold: 2.8,
      },
      // the scream: the sky tears
      {
        pose: [{ who: 'bh', pose: 'bh_scream', face: 'shout', speed: 10 }],
        mood: { amount: 0.55, color: 0x2a0a4a, seconds: 0.8 },
        cam: { from: { at: 'bh', local: [3, -0.8, 7] }, look: { at: 'bh', off: [0, 2.4, 0] }, fov: 54 },
        sfx: { name: 'roar', who: 'bh', pitch: 0.6, vol: 1.4 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 1.6);
          const behind = st.bh.chest().add(st.bh.forward.clone().multiplyScalar(-6)).add(new V3(0, 3, 0));
          st.rift.set(k, st.vegito.chest());
          st.rift.group.position.copy(behind);
          SL.ScreenFX.vision(k * 0.45);
          if (ctx.b.frame % 3 === 0) ctx.b.camera.addTrauma(0.12);
          if (ctx.b.frame % 10 === 0) ctx.b.vfx.ring(st.bh.chest(), 3 + k * 5, 0xd070ff, 0.5);
        },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'vegito', local: [0.5, 0.3, 1.6] }, look: { at: 'vegito:head' }, fov: 34 },
        tick: (ctx) => {
          if (ctx.b.frame % 3 === 0) ctx.b.camera.addTrauma(0.08);
        },
        say: { who: 'vegito', line: '...Oh, come on. Somebody has to shut him up.', duration: 2.4, style: 'dual' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.rift.set(1, st.vegito.chest());
    },
  };

  S.sv_jaw = {
    id: 'sv_jaw',
    cast,
    clearMood: true,
    music: { song: 'vegito_theme', level: 5 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito, bh = st.bh;
          const front = bh.pos.clone().addScaledVector(bh.forward.clone().setY(0).normalize(), 1.3);
          VK().vanishTo(ctx.b, v, front, { face: bh.pos });
          v.grounded = bh.grounded;
        },
        pose: [{ who: 'vegito', pose: 'vg_jawW', face: 'angry', speed: 20 }],
        cam: { from: { at: 'bh', local: [1.8, 0.2, 2] }, look: { at: 'bh:head' }, fov: 40 },
        hold: 0.3,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          const p = SVD().targetPos(st.bh, 'mouth');
          ctx.b.vfx.impact(p, 3, 0xffffff);
          ctx.b.vfx.flash(p, 3, 0xfff4c0, 0.25, SL.Toon.tex.glow);
          ctx.b.cameraTraumaAt(p, 0.9);
          ctx.b.sfx('punchHeavy', st.bh, { pitch: 0.7, vol: 1.3 });
          SL.ScreenFX.flash(0.5, '#ffffff');
        },
        pose: [
          { who: 'vegito', pose: 'vg_jaw', face: 'angry', speed: 30 },
          { who: 'bh', pose: 'hitHeavy', face: 'ko', speed: 20 },
        ],
        slow: { scale: 0.25, seconds: 0.8 },
        cam: { from: { at: 'bh', local: [2.4, 0.2, 1.4] }, look: { at: 'bh:head' }, fov: 38 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.9);
          st.rift.set(1 - k, st.vegito.chest());
          SL.ScreenFX.vision((1 - k) * 0.45);
        },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          story(ctx).rift.set(0);
          SL.ScreenFX.vision(0);
          ctx.b.silence && ctx.b.silence(0.2, { sfx: true });
        },
        pose: [{ who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'vegito', local: [0.4, 0.3, 1.5] }, look: { at: 'vegito:head' }, fov: 32 },
        say: { who: 'vegito', line: 'Shut up.', duration: 1.6, style: 'dual quiet' },
        hold: 2,
      },
    ],
    end(ctx) {
      story(ctx).rift.set(0);
      SL.ScreenFX.vision(0);
      ctx.m.flags.riftClosed = true;
    },
  };

  S.sv_candyBeam = {
    id: 'sv_candyBeam',
    cast,
    music: { song: 'finale', level: 4 },
    events: [
      {
        pose: [{ who: 'bh', pose: 'bh_candyW', face: 'wicked', speed: 6 }],
        cam: { from: { at: 'bh', local: [1.2, 0.4, 2.6] }, look: { at: 'bh:head' }, fov: 40 },
        tick: (ctx) => {
          const st = story(ctx);
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.flash(SVD().headPoint(st.bh, 0, 1.1, 0.4), 0.6, 0xff7ab8, 0.14, SL.Toon.tex.glow);
        },
        say: { who: 'buuhan', line: 'Fine... then you can be CANDY! Turn into candy and get EATEN!', duration: 3, style: 'shout' },
        hold: 3,
      },
      {
        pose: [
          { who: 'bh', pose: 'bh_candy', face: 'shout', speed: 14 },
          { who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 5 },
        ],
        call: (ctx) => {
          const st = story(ctx);
          const from = SVD().headPoint(st.bh, 0, 1.1, 0.4), to = st.vegito.chest();
          for (let k = 0; k <= 16; k++) ctx.b.vfx.trail(from.clone().lerp(to, k / 16), 0xff6ab4, 0.35, 0.5);
          ctx.b.sfx('beamFire', st.bh, { pitch: 1.4 });
        },
        cam: { from: { at: 'vegito', local: [2.6, 0.4, 2] }, look: { at: 'vegito', off: [0, 0.3, 0] }, fov: 44 },
        hold: 0.6,
      },
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          ctx.b.vfx.flash(v.chest(), 3, 0xff9ad0, 0.4, SL.Toon.tex.glow);
          ctx.b.vfx.explosion(v.chest(), 1.6, 0xffc0e0, { smoke: true });
          ctx.b.sfx('candyPop', v, { pitch: 0.9 });
          st.candy.set(v.chest(), 0);
          v.setHidden(true);
          pt(ctx, 'candy', v.chest());
        },
        cam: { from: { at: 'candy', off: [1.2, 0.3, 1.6] }, look: { at: 'candy' }, fov: 36 },
        tick: (ctx, t) => story(ctx).candy.set(ctx.cast.candy.pos.clone().add(new V3(0, Math.sin(t * 3) * 0.05, 0)), 0),
        hold: 1.4,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_laugh', face: 'wicked', speed: 8 }],
        cam: { from: { at: 'bh', local: [0.6, 0.3, 2] }, look: { at: 'bh:head' }, fov: 38 },
        tick: (ctx, t) => story(ctx).candy.set(ctx.cast.candy.pos.clone().add(new V3(0, Math.sin(t * 3) * 0.05, 0)), 0),
        say: { who: 'buuhan', line: 'HA HA HA HA! Look at you! Nothing but a sweet little treat! I\'m going to EAT you!', duration: 3.6, style: 'shout' },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'candy', off: [0.6, 0.2, 1.1] }, look: { at: 'candy' }, fov: 34 },
        tick: (ctx, t) => story(ctx).candy.set(ctx.cast.candy.pos.clone().add(new V3(0, Math.abs(Math.sin(t * 7)) * 0.12, 0)), 0),
        say: { who: 'vegito', line: 'Hey! What are you laughing at? I\'m not just any candy... I\'m the world\'s strongest coffee candy!', duration: 4, style: 'dual' },
        hold: 4,
      },
      {
        pose: [{ who: 'bh', pose: 'bh_fight', face: 'shock', speed: 6 }],
        cam: { from: { at: 'bh', local: [0.3, 0.3, 1.4] }, look: { at: 'bh:head' }, fov: 32 },
        tick: (ctx, t) => story(ctx).candy.set(ctx.cast.candy.pos, 0),
        say: { who: 'buuhan', line: '...Huh?', duration: 1.2, style: 'quiet' },
        hold: 1.4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.vegito.setHidden(true);
      st.candy.set(st.vegito.chest(), 0);
      ctx.m.flags.candy = true;
    },
  };

  S.sv_throat = {
    id: 'sv_throat',
    cast,
    music: { song: 'finale', level: 5 },
    events: [
      // in through the mouth
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.c0 = st.candy.pos.clone();
          faceTo(st.bh, ctx.c0);
        },
        pose: [{ who: 'bh', pose: 'bh_scream', face: 'shout', speed: 10 }],
        cam: { from: { at: 'bh', local: [0.9, 0.5, 1.5] }, look: { at: 'bh:head' }, fov: 36 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.4);
          const mouth = SVD().targetPos(st.bh, 'mouth');
          st.candy.set(ctx.c0.clone().lerp(mouth, k), 20);
          if (k >= 1 && st.candy.group.visible) {
            st.candy.hide();
            ctx.b.sfx('punchHeavy', st.bh, { pitch: 1.6, vol: 0.7 });
          }
        },
        slow: { scale: 0.4, seconds: 0.4 },
        hold: 0.8,
      },
      // inside him
      {
        pose: [{ who: 'bh', pose: 'bh_regen', face: 'shock', speed: 12 }],
        cam: { from: { at: 'bh', local: [0.3, 0.3, 1.2] }, look: { at: 'bh:head' }, fov: 30 },
        tick: (ctx) => {
          if (ctx.b.frame % 4 === 0) ctx.b.cameraTraumaAt(story(ctx).bh.pos, 0.2);
        },
        sfx: { name: 'rumble', who: 'bh', pitch: 1.4, vol: 0.9 },
        say: { who: 'buuhan', line: 'MMMF?!', duration: 1, style: 'shout' },
        hold: 1,
      },
      // out of the back of his neck, teeth everywhere
      {
        call: (ctx) => {
          const st = story(ctx);
          ctx.out0 = SVD().headPoint(st.bh, 0, -0.9, -1.1);
          ctx.out1 = ctx.out0.clone().addScaledVector(st.bh.forward.clone().setY(0).normalize(), -6).add(new V3(0, 1.5, 0));
          VK().teeth(ctx.b, SVD().targetPos(st.bh, 'mouth'), st.bh.forward.clone());
          ctx.b.vfx.explosion(ctx.out0, 1.2, 0xffc0e0, { smoke: false });
          ctx.b.sfx('punchHeavy', st.bh, { pitch: 0.8, vol: 1.2 });
          pt(ctx, 'out', ctx.out1);
        },
        pose: [{ who: 'bh', pose: 'bh_mouth', face: 'hurt', speed: 16 }],
        cam: { from: { at: 'bh', local: [-2.4, 0.6, -2.6] }, look: { at: 'bh', off: [0, 1, 0] }, fov: 44 },
        tick: (ctx, t) => {
          const st = story(ctx);
          const k = Math.min(1, t / 0.5);
          st.candy.set(ctx.out0.clone().lerp(ctx.out1, k), 20);
        },
        slow: { scale: 0.35, seconds: 0.6 },
        say: { who: 'buuhan', line: 'MY TEEEETH!!', duration: 1.6, style: 'shout' },
        hold: 1.6,
      },
      {
        cam: { from: { at: 'out', off: [0.8, 0.2, 1.2] }, look: { at: 'out' }, fov: 34 },
        tick: (ctx, t) => story(ctx).candy.set(ctx.cast.out.pos.clone().add(new V3(0, Math.sin(t * 4) * 0.05, 0)), 0),
        say: { who: 'vegito', line: 'You should see a dentist about that.', duration: 2.2, style: 'dual' },
        hold: 2.4,
      },
      // he changes him back himself
      {
        pose: [{ who: 'bh', pose: 'bh_candy', face: 'hurt', speed: 10 }],
        call: (ctx) => {
          const st = story(ctx);
          const from = SVD().headPoint(st.bh, 0, 1.1, 0.4), to = ctx.cast.out.pos;
          for (let k = 0; k <= 16; k++) ctx.b.vfx.trail(from.clone().lerp(to, k / 16), 0xff6ab4, 0.35, 0.5);
          ctx.b.sfx('beamFire', st.bh, { pitch: 1.2 });
        },
        cam: { from: { at: 'bh', local: [1.6, 0.3, 2.4] }, look: { at: 'bh:head' }, fov: 40 },
        say: { who: 'buuhan', line: 'CHANGE BACK! JUST CHANGE BACK!', duration: 1.8, style: 'shout' },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx), v = st.vegito;
          st.candy.hide();
          v.setHidden(false);
          v.setPosition(ctx.cast.out.pos.clone().sub(new V3(0, v.height * 0.5, 0)));
          v.grounded = false;
          faceTo(v, st.bh.pos);
          ctx.b.vfx.flash(v.chest(), 3, 0xffe890, 0.3, SL.Toon.tex.glow);
          ctx.b.vfx.ring(v.chest(), 3, 0xffd23a, 0.4);
          ctx.b.sfx('transformBurst', v, { pitch: 1.3, vol: 0.7 });
        },
        pose: [{ who: 'vegito', pose: 'vg_floatArms', face: 'cocky', speed: 6 }],
        cam: { from: { at: 'vegito', local: [0.5, 0.3, 2] }, look: { at: 'vegito:head' }, fov: 36 },
        say: { who: 'vegito', line: 'Ahh. Much better. Thanks.', duration: 2, style: 'dual' },
        hold: 2.2,
      },
      {
        call: (ctx) => {
          const st = story(ctx);
          st.bh.setPosition(ground(ctx, st.bh.pos));
          st.bh.grounded = true;
          K().place(st.vegito, ground(ctx, st.bh.pos.clone().addScaledVector(st.bh.forward.clone().setY(0).normalize(), 4)));
          faceTo(st.vegito, st.bh.pos);
        },
        pose: [
          { who: 'bh', pose: 'bh_pant', face: 'hurt', speed: 5 },
          { who: 'vegito', pose: 'vg_armsStand', face: 'cocky', speed: 4 },
        ],
        cam: { from: { at: 'bh', local: [2.6, 0.2, 3.4] }, look: { at: 'bh', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'buuhan', line: '(Hah... hah... how... how is he THIS strong...?)', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      st.candy.hide();
      st.vegito.setHidden(false);
      st.vegito.intangible = false;
      st.vegito.moveScale = 1;
      ctx.m.flags.teeth = true;
    },
  };
})();
