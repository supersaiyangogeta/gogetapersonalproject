/*
 * SCENE — Nail and Piccolo become one (human playtest round 2).
 *
 *   nail_fuses_piccolo   the hand on the chest, the light between them, Nail going into
 *                        him, and the one who is left standing
 *
 * The owner asked to SEE the fusion rather than be told about it. It used to be two lines
 * and a stream of particles, then Nail simply vanished. Now both are in the frame the whole
 * time: Nail offers, Piccolo puts his palm flat on Nail's chest, the light builds at the
 * contact point, the world goes green, Nail turns to light (the translucent spirit material,
 * tinted Namekian green) and pours into Piccolo — and then the staged transformation the
 * mission already used takes over, so the form, its aura and its numbers are the same ones
 * the gameplay uses. end() leaves Nail gone and the form taught, watched or skipped.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;
  const GREEN = 0x9fe08a;

  S.nail_fuses_piccolo = {
    id: 'nail_fuses_piccolo',
    cast: (m) => ({ nail: m.battle.story.nail, piccolo: m.battle.story.piccolo }),
    music: { song: 'menu', level: 0 },
    events: [
      // he explains it, standing, one arm gone
      {
        call: (ctx) => {
          const { nail, piccolo } = ctx.cast;
          const at = nail.pos.clone().addScaledVector(nail.forward, 1.25);
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          piccolo.setPosition(at);
          piccolo.yaw = piccolo.prevYaw = Math.atan2(nail.pos.x - at.x, nail.pos.z - at.z);
          nail.yaw = nail.prevYaw = Math.atan2(at.x - nail.pos.x, at.z - nail.pos.z);
        },
        pose: [{ who: 'nail', pose: 'nl_offer', face: 'calm' }, { who: 'piccolo', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'nail', local: [2.2, 0.3, 1.2] }, look: { at: 'nail', local: [0, 0.1, 0.6] }, fov: 42 },
        say: { who: 'nail', line: 'We are the same people. Put your hand on me, and we will be one — and you will be stronger than either of us.', duration: 4.2 },
        hold: 4.2,
      },
      {
        call: (ctx) => {
          // from Nail's side of the pair, on Piccolo's face (he faces Nail)
          const { piccolo, nail } = ctx.cast;
          const head = SL.Cinema.actorPoint(ctx, 'piccolo:head');
          const toNail = nail.pos.clone().sub(piccolo.pos).setY(0).normalize();
          const side = new THREE.Vector3(toNail.z, 0, -toNail.x);
          ctx.cast.prideCam = { pos: head.clone().addScaledVector(toNail, 1.5).addScaledVector(side, 0.55).add(new THREE.Vector3(0, -0.15, 0)) };
        },
        cam: { from: { at: 'prideCam' }, look: { at: 'piccolo:head', off: [0, -0.1, 0] }, fov: 38 },
        say: { who: 'piccolo', line: 'Your pride stays yours. I only need the strength.', duration: 2.8 },
        hold: 2.8,
      },
      // the hand, flat on his chest
      {
        pose: [{ who: 'piccolo', pose: 'p_palmPress', face: 'calm' }],
        cam: { from: { at: 'piccolo', local: [1.1, 0, 0.7] }, look: { at: 'piccolo', local: [0, 0, 0.7] }, fov: 34 },
        sfx: { name: 'kiUp', who: 'piccolo', pitch: 0.8, vol: 0.9 },
        tick: (ctx, t) => {
          const p = ctx.cast.piccolo;
          const h = p.handPos('R');
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.flash(h, 0.6 + t * 1.2, GREEN, 0.18, SL.Toon.tex.glow);
        },
        hold: 1.8,
      },
      // the light grows between them; the world goes green; the ground lifts
      {
        mood: { amount: 0.55, color: 0x1f3a1a, seconds: 1 },
        shake: { at: 'nail', amount: 0.3 },
        cam: { from: { at: 'nail', local: [3.6, 0.6, 0.6] }, to: { at: 'nail', local: [3, 0.8, 0.6] }, look: { at: 'nail', local: [0, 0.2, 0.6] }, fov: 44, fov2: 40 },
        tick: (ctx, t) => {
          const { nail, piccolo } = ctx.cast;
          const mid = nail.chest().lerp(piccolo.chest(), 0.5);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.streamInward(mid, 3.2, GREEN, 5, 0.14, 0.5);
          if (ctx.b.frame % 6 === 0) ctx.b.vfx.flash(mid, 2 + t * 2, 0xeaffd8, 0.25, SL.Toon.tex.glow);
          if (ctx.b.frame % 12 === 0 && ctx.b.stage.hasGround) {
            const p = nail.pos.clone().add(new V3(U.rand(-3, 3), 0.1, U.rand(-3, 3)));
            ctx.b.vfx.rock(p, new V3(0, U.rand(2, 4), 0), U.rand(0.08, 0.2));
          }
          ctx.b.camera.trauma = Math.max(ctx.b.camera.trauma, 0.08 + t * 0.08);
        },
        hold: 2.2,
      },
      // Nail turns to light and pours into him
      {
        call: (ctx) => {
          const n = ctx.cast.nail;
          n.model.setSpirit(true);
          if (n.model._spiritMat) {
            n.model._spiritMat.color.setHex(0xd8ffc8);
            n.model._spiritMat.emissive.setHex(0x3a8a2a);
          }
          n.model.setSpiritLevel(0.9);
          ctx.b.sfx('transformBurst', n, { pitch: 1.3, vol: 0.8 });
        },
        say: { who: 'nail', line: 'Win.', duration: 1.4, style: 'quiet' },
        cam: { from: { at: 'piccolo', local: [2.4, 0.4, 2.6] }, look: { at: 'piccolo', local: [0, 0.2, 0.6] }, fov: 42 },
        tick: (ctx, t) => {
          const { nail, piccolo } = ctx.cast;
          const k = U.clamp01(t / 2);
          nail.model.setSpiritLevel(0.9 * (1 - k));
          const from = nail.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(-0.6, 0.6), U.rand(-0.3, 0.3)));
          const to = piccolo.chest();
          for (let i = 0; i < 2; i++) ctx.b.vfx.trail(from.clone().lerp(to, Math.random()), GREEN, 0.3, 0.35);
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.flash(to, 1.6, GREEN, 0.15, SL.Toon.tex.glow);
        },
        hold: 2.2,
      },
      {
        call: (ctx) => {
          const n = ctx.cast.nail;
          n.model.setSpiritLevel(0);
          n.setHidden(true);
          ctx.b.emit('nailFused', { piccolo: ctx.cast.piccolo });
        },
        screen: { flash: 0.7, color: '#eaffd8' },
        cam: { from: { at: 'piccolo', local: [0.8, 0.1, 2.2] }, look: { at: 'piccolo', off: [0, 0.2, 0] }, fov: 40 },
        hold: 0.8,
      },
    ],
    end(ctx) {
      const { nail } = ctx.cast;
      if (nail) {
        if (nail.model && nail.model._spiritMats) nail.model.setSpirit(false);
        nail.setHidden(true);
        nail.untargetable = true;
      }
      ctx.m.flags.nailJoined = true;
    },
  };
})();
