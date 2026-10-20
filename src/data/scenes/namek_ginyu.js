/*
 * SCENES — the Ginyu Force arc, staged (human playtest round 2).
 *
 *   goku_lands_ginyu      Recoome's boot over Gohan; the ship; Goku; one blow
 *   vegeta_finishes_burter  the prince does what Goku would not
 *   ginyu_takes_goku      the Body Change, shown: the telegraph, the beam, two souls
 *                         crossing it, and who is in which body afterwards
 *   frog_intercept        the last try: the frog, the grab, the throw, the beam finding it
 *
 * The owner played the arc and found: no landing for Goku, a Body Change that happened
 * mid-air with no way to tell what had changed, and no frog ever thrown. Each of those is
 * now a scene with the actors in the frame and the physical action on screen. The two
 * body changes go through `battle.swapBodies` inside the scene (never twice: the scene
 * checks whose mind is where first), and every scene's end() leaves the same state
 * whether it was watched or skipped.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  const CHANGE_BEAM = {
    id: 'bodyChangeBeam', name: 'Body Change', type: 'beam', damage: [0, 0], radius: [0.45, 0.45], speed: 70, range: 30, sustain: 60,
    color: 0xd8b8ff, core: 0xffffff, style: { rings: 2, ringColor: 0xf0e4ff, ringSpeed: 1.6 },
  };

  /** Two souls crossing on the beam: a's mind travels to b and b's to a over `seconds`. */
  function soulsTick(ctx, a, b, t, seconds, colA, colB) {
    const k = U.clamp01(t / seconds);
    const e = k * k * (3 - 2 * k);
    const pa = a.chest().lerp(b.chest(), e).add(new V3(0, Math.sin(k * Math.PI) * 0.8, 0));
    const pb = b.chest().lerp(a.chest(), e).add(new V3(0, -Math.sin(k * Math.PI) * 0.5, 0));
    ctx.b.vfx.flash(pa, 1.2, colA, 0.08, SL.Toon.tex.glow);
    ctx.b.vfx.flash(pb, 1.2, colB, 0.08, SL.Toon.tex.glow);
    ctx.b.vfx.trail(pa, colA, 0.35, 0.3);
    ctx.b.vfx.trail(pb, colB, 0.35, 0.3);
  }

  /** Body change inside a scene, never twice: only if `mindId` is still in its own body. */
  function changeOnce(ctx, thief, victim, opts) {
    const b = ctx.b;
    if (b.mindOf(victim).own !== victim || b.mindOf(thief).own !== thief) return false;
    const ok = b.swapBodies(thief, victim, opts);
    if (ok) b.emit('bodyChanged', { ginyuBody: thief, stolenBody: victim, staged: true });
    return ok;
  }

  /* ================================================================ the alliance */
  // Before the Ginyu Force lands: where everyone is, who has which Dragon Ball, and why the
  // prince is suddenly on the same side as two Earthlings (playtest round 2: "Vegeta's
  // connection to Krillin and Gohan's group feels abrupt").
  S.namek_alliance = {
    id: 'namek_alliance',
    cast: (m) => {
      const s = m.battle.story;
      return { krillin: s.krillin, gohan: s.gohan, vegeta: s.vegeta };
    },
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          const { gohan, vegeta } = ctx.cast;
          // the Dragon Ball Gohan is carrying (the one Krillin brought from the Grand Elder)
          ctx.ball = ctx.b.stage.addProp({ kind: 'dragonball', pos: gohan.handPos('R'), r: 0.22, hp: 999999, id: 'gohanBall' });
          ctx.cast.ball = ctx.ball;
          vegeta.setHidden(true);
        },
        pose: [{ who: 'krillin', pose: 'idle', face: 'grit' }, { who: 'gohan', pose: 'kg_lookHands', face: 'calm' }],
        cam: { from: { at: 'gohan', local: [0.9, 0.2, 1.8] }, look: { at: 'ball' }, fov: 38 },
        say: { who: 'krillin', line: 'That is the one the Grand Elder gave us. Vegeta has the rest hidden somewhere, and Frieza wants every one.', duration: 3.6 },
        tick: (ctx) => {
          ctx.ball.pos.copy(ctx.cast.gohan.handPos('R').add(new V3(0, 0.12, 0)));
          ctx.ball.group.position.copy(ctx.ball.pos);
        },
        hold: 3.4,
      },
      // the prince lands in front of them
      {
        call: (ctx) => {
          const { vegeta, krillin } = ctx.cast;
          const at = krillin.pos.clone().addScaledVector(krillin.forward, 4.5).add(new V3(1.5, 0, 0));
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          vegeta.setPosition(at);
          vegeta.yaw = vegeta.prevYaw = Math.atan2(krillin.pos.x - at.x, krillin.pos.z - at.z);
          vegeta.setHidden(false);
          ctx.b.vfx.dust(at, 2.6, 16);
          ctx.b.sfx('groundImpact', vegeta, { vol: 0.9 });
          ctx.b.cameraTraumaAt(at, 0.3);
        },
        pose: [{ who: 'vegeta', pose: 'v_chinUp', face: 'smirk' }, { who: 'krillin', pose: 'guard', face: 'shock' }, { who: 'gohan', pose: 'kg_scared', face: 'shock' }],
        cam: { from: { at: 'krillin', local: [-1, 0.2, -2.2] }, look: { at: 'vegeta', off: [0, 0.3, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Relax. If I wanted that Dragon Ball, it would already be mine.', duration: 2.8 },
        tick: (ctx) => {
          ctx.ball.pos.copy(ctx.cast.gohan.handPos('R').add(new V3(0, 0.12, 0)));
          ctx.ball.group.position.copy(ctx.ball.pos);
        },
        hold: 2.8,
      },
      // five lights cross the sky; the scouter screams
      {
        call: (ctx) => {
          ctx.streaks = [];
          const c = ctx.cast.vegeta.pos;
          for (let i = 0; i < 5; i++) ctx.streaks.push({ from: c.clone().add(new V3(-70 + i * 6, 60 + i * 3, -60)), to: c.clone().add(new V3(20 + i * 8, 25, -140)) });
        },
        sfx: { name: 'scouter', vol: 1 },
        // the elite announce themselves: their theme comes in with the five lights (soundtrack PDF p.95)
        music: { song: 'ginyu_force', level: 2 },
        pose: [{ who: 'vegeta', pose: 'v_scouterTap', face: 'angry' }],
        cam: { from: { at: 'vegeta', local: [-1.2, -0.3, -2] }, look: { at: 'vegeta', local: [0, 14, 30] }, fov: 58 },
        tick: (ctx, t) => {
          const k = Math.min(1, t / 2);
          for (const s2 of ctx.streaks) ctx.b.vfx.trail(s2.from.clone().lerp(s2.to, k), 0xd8b8ff, 1.1, 0.6);
        },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.5, 0.15, 1.7] }, look: { at: 'vegeta', off: [0, 0.25, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'The Ginyu Force. Frieza has called his elite. Fight beside me, or die one at a time.', duration: 3.6 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'krillin', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'krillin', local: [0.5, 0.15, 1.6] }, look: { at: 'krillin', off: [0, 0.2, 0] }, fov: 36 },
        say: { who: 'krillin', line: 'Fighting next to you. Great. For now.', duration: 2.4 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { vegeta, krillin } = ctx.cast;
      if (ctx.ball) {
        ctx.ball.alive = false;
        if (ctx.ball.group) ctx.ball.group.visible = false;
      }
      if (vegeta) {
        vegeta.setHidden(false);
        if (krillin && vegeta.pos.distanceTo(krillin.pos) > 12) {
          const at = krillin.pos.clone().addScaledVector(krillin.forward, 4.5).add(new V3(1.5, 0, 0));
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          vegeta.setPosition(at);
        }
      }
      ctx.m.flags.alliance = true;
    },
  };

  /* ================================================================ Goku lands */
  S.goku_lands_ginyu = {
    id: 'goku_lands_ginyu',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, krillin: s.krillin, gohan: s.gohan, vegeta: s.vegeta, recoome: s.recoome, burter: s.burter, jeice: s.jeice };
    },
    music: { song: null, level: 0 },
    events: [
      // the end of the heroes: Recoome's boot raised over the boy, the others down
      {
        call: (ctx) => {
          const { goku, recoome, gohan } = ctx.cast;
          goku.setHidden(true);
          goku.untargetable = true;
          for (const f of [ctx.cast.krillin, gohan, ctx.cast.vegeta, recoome]) f.untargetable = true;
          ctx.gohanAt = gohan.pos.clone();
          const land = gohan.pos.clone().add(new V3(26, 0, 22));
          land.y = ctx.b.stage.heightAt(land.x, land.z);
          ctx.shipLand = land.clone().add(new V3(0, 3.2, 0));
          ctx.shipFrom = ctx.shipLand.clone().add(new V3(-30, 70, -40));
          ctx.ship = ctx.b.stage.addProp({ kind: 'ccship', pos: ctx.shipFrom, r: 3.4, hp: 999999, id: 'gokuShip' });
          ctx.cast.ship = ctx.ship;
          recoome.setPosition(gohan.pos.clone().add(new V3(0, 0, -1.5)));
          recoome.yaw = recoome.prevYaw = Math.atan2(gohan.pos.x - recoome.pos.x, gohan.pos.z - recoome.pos.z);
        },
        pose: [
          { who: 'gohan', pose: 'knockdown', face: 'hurt' },
          { who: 'krillin', pose: 'knockdown', face: 'hurt' },
          { who: 'vegeta', pose: 'knockdown', face: 'hurt' },
          { who: 'recoome', pose: 'rc_kickW', face: 'grin' },
          { who: 'burter', pose: 'bt_pose', face: 'grin' },
          { who: 'jeice', pose: 'jc_pose', face: 'grin' },
        ],
        // low by the boy's head, looking up at the boot
        cam: { from: { at: 'gohan', off: [1.2, -0.2, 1.6] }, to: { at: 'gohan', off: [1, -0.2, 1.3] }, look: { at: 'recoome', off: [0, 0.6, 0] }, fov: 48, fov2: 44 },
        say: { who: 'recoome', line: 'Recoome... ULTRA... FIGHTING... bomber? No — just the foot. Goodbye, little one!', duration: 3.4 },
        tick: (ctx) => {
          if (ctx.b.frame % 10 === 0) ctx.b.vfx.dust(ctx.cast.gohan.pos, 1.6, 3);
        },
        hold: 3.2,
      },
      // something is coming, and the prince feels it first
      {
        sfx: { name: 'scouter', vol: 0.9 },
        pose: [{ who: 'vegeta', pose: 'kneelGrieve', face: 'shock', speed: 4 }],
        cam: { from: { at: 'vegeta:head', local: [0.55, -0.2, 1.2] }, look: { at: 'vegeta:head', off: [0, -0.05, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'That power... it is still climbing. It cannot be...', duration: 2.4, style: 'quiet' },
        shake: { at: 'vegeta', amount: 0.2 },
        hold: 2.2,
      },
      // the sky: the ship coming down, the engine roaring
      {
        pose: [{ who: 'recoome', pose: 'idle', face: 'shock' }, { who: 'burter', pose: 'idle', face: 'shock' }],
        sfx: { name: 'dash', vol: 1.4, pitch: 0.45 },
        cam: { from: { at: 'krillin', off: [-2, 1.6, -3] }, look: { at: 'ship' }, fov: 58 },
        say: { who: 'burter', line: 'What is that? A ship?', duration: 1.8 },
        tick: (ctx, t) => {
          const k = U.clamp01(t / 2.4);
          const e = 1 - (1 - k) * (1 - k) * (1 - k);
          ctx.ship.pos.lerpVectors(ctx.shipFrom, ctx.shipLand, e);
          ctx.ship.group.position.copy(ctx.ship.pos);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(ctx.ship.pos.clone().add(new V3(0, -3.4, 0)), 0x9fd8ff, 1.4, 0.4);
          ctx.b.camera.trauma = Math.max(ctx.b.camera.trauma, 0.12 * k);
        },
        hold: 2.4,
      },
      // touchdown
      {
        call: (ctx) => {
          ctx.ship.pos.copy(ctx.shipLand);
          ctx.ship.group.position.copy(ctx.shipLand);
          const foot = ctx.shipLand.clone().add(new V3(0, -3.2, 0));
          ctx.b.vfx.dust(foot, 7, 30);
          ctx.b.vfx.ring(foot.clone().add(new V3(0, 0.3, 0)), 12, 0xdfe8ff, 0.8, new V3(0, 1, 0));
          ctx.b.stage.crater && ctx.b.stage.crater(foot, 5, 0.5, null);
          ctx.b.sfx('groundImpact', null, { at: foot, vol: 1.3 });
          ctx.b.cameraTraumaAt(foot, 0.7);
        },
        cam: { from: { at: 'ship', off: [14, -1.5, 12] }, look: { at: 'ship', off: [0, -1.5, 0] }, fov: 50 },
        hold: 1.6,
      },
      // a streak across the field: faster than anyone there can follow
      {
        call: (ctx) => {
          ctx.streakFrom = ctx.shipLand.clone().add(new V3(0, -1.5, 0));
          ctx.streakTo = ctx.gohanAt.clone().add(new V3(0, 1.1, -0.8));
          ctx.b.sfx('dash', null, { at: ctx.streakTo, vol: 1.5, pitch: 1.3 });
        },
        cam: { from: { at: 'gohan', off: [9, 3, 6] }, look: { at: 'gohan', off: [8, 1, 10] }, fov: 58 },
        tick: (ctx, t) => {
          const k = U.clamp01(t / 0.45);
          const p = ctx.streakFrom.clone().lerp(ctx.streakTo, k);
          for (let i = 0; i < 3; i++) ctx.b.vfx.trail(p.clone().add(new V3(0, i * 0.2, 0)), 0xffc070, 0.6, 0.35);
        },
        hold: 0.5,
      },
      // HE IS THERE: between the boot and the boy, and the boot does not come down
      {
        call: (ctx) => {
          const { goku, recoome, gohan } = ctx.cast;
          const at = gohan.pos.clone().lerp(recoome.pos, 0.5);
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          goku.setPosition(at);
          goku.yaw = goku.prevYaw = Math.atan2(recoome.pos.x - at.x, recoome.pos.z - at.z);
          goku.setHidden(false);
          goku.grounded = true;
          ctx.b.vfx.dust(at, 3.5, 18);
          ctx.b.vfx.ring(goku.chest(), 4, 0xffffff, 0.5, new V3(0, 1, 0));
          ctx.b.cameraTraumaAt(at, 0.45);
          recoome.setPosition(at.clone().add(new V3(0, 0, 0)).addScaledVector(goku.forward, 1.7));
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'calm' },
          { who: 'recoome', pose: 'rc_kickW', face: 'shock' },
        ],
        slow: { scale: 0.4, seconds: 1 },
        // low behind Goku: his back, the gi, Recoome towering in front of him
        cam: { from: { at: 'goku', local: [0.5, -0.4, -2.2] }, look: { at: 'recoome', off: [0, 0.4, 0] }, fov: 46 },
        hold: 1.6,
      },
      // the face: calm. Nothing about this worries him.
      {
        cam: { from: { at: 'goku', local: [1.35, -0.05, 0.75] }, to: { at: 'goku', local: [1.15, -0.02, 0.65] }, look: { at: 'goku:head', off: [0, -0.05, 0] }, fov: 34, fov2: 30 },
        music: { song: 'finale', level: 2 },
        hold: 1.8,
      },
      // the others see who it is
      {
        call: (ctx) => {
          const { gohan, goku } = ctx.cast;
          gohan.yaw = gohan.prevYaw = Math.atan2(goku.pos.x - gohan.pos.x, goku.pos.z - gohan.pos.z);
        },
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'soft', speed: 4 }],
        cam: { from: { at: 'gohan:head', local: [0.9, -0.15, 0.8] }, look: { at: 'gohan:head', off: [0, -0.04, 0] }, fov: 38 },
        say: { who: 'gohan', line: 'Dad...!', duration: 1.4, style: 'quiet' },
        hold: 1.4,
      },
      {
        call: (ctx) => {
          const { krillin, goku } = ctx.cast;
          krillin.yaw = krillin.prevYaw = Math.atan2(goku.pos.x - krillin.pos.x, goku.pos.z - krillin.pos.z);
        },
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'grin', speed: 4 }],
        cam: { from: { at: 'krillin:head', local: [0.5, -0.15, 1.2] }, look: { at: 'krillin:head', off: [0, -0.05, 0] }, fov: 38 },
        say: { who: 'krillin', line: 'Goku! You made it!', duration: 1.6 },
        hold: 1.5,
      },
      {
        cam: { from: { at: 'vegeta:head', local: [-0.5, -0.2, 1.15] }, look: { at: 'vegeta:head', off: [0, -0.05, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'Kakarot... What did you do to get this strong?', duration: 2.4, style: 'quiet' },
        hold: 2.2,
      },
      // the line, and the beans
      {
        call: (ctx) => {
          const { goku, gohan, krillin } = ctx.cast;
          for (const f of [gohan, krillin]) {
            const from = goku.handPos('R'), to = f.chest();
            for (let i = 0; i <= 8; i++) ctx.b.vfx.trail(from.clone().lerp(to, i / 8).add(new V3(0, Math.sin((i / 8) * Math.PI) * 1.2, 0)), 0x7ed44a, 0.18, 0.5);
          }
        },
        pose: [{ who: 'goku', pose: 'blastR', face: 'calm' }],
        cam: { from: { at: 'goku', local: [1.6, 0.2, 2.4] }, look: { at: 'goku', off: [0, 0.1, 0] }, fov: 42 },
        say: { who: 'goku', line: 'Sorry I took so long. Eat these — a Senzu Bean each. I will take it from here.', duration: 3.4 },
        hold: 3.2,
      },
      // Recoome, offended, charges — and meets one elbow
      {
        pose: [{ who: 'recoome', pose: 'rc_kickW', face: 'shout' }, { who: 'goku', pose: 'idle', face: 'calm' }],
        say: { who: 'recoome', line: 'Recoome gets a NEW toy!', duration: 1.4, style: 'shout' },
        cam: { from: { at: 'goku', local: [3.4, 0.6, 1.2] }, look: { at: 'goku', local: [0, 0.3, 1] }, fov: 48 },
        hold: 1,
      },
      {
        call: (ctx) => {
          const { goku, recoome } = ctx.cast;
          goku.ghost && goku.ghost(0.3, 0.5);
          ctx.b.vfx.afterimage(goku.pos, goku.height, 0xfff0c0);
          goku.setPosition(recoome.pos.clone().addScaledVector(goku.forward, -0.9));
          ctx.b.vfx.impact(recoome.chest(), 5, 0xffd0a0);
          ctx.b.vfx.ring(recoome.chest(), 5, 0xffffff, 0.5);
          ctx.b.sfx('punchHeavy', goku, { vol: 1.5, pitch: 0.7 });
          SL.ScreenFX.flash(0.5, '#ffffff');
          ctx.b.camera.addTrauma(0.8);
        },
        pose: [{ who: 'goku', pose: 'g_elbow', face: 'calm' }, { who: 'recoome', pose: 'hitHeavy', face: 'ko' }],
        slow: { scale: 0.25, seconds: 1.2 },
        cam: { from: { at: 'goku', local: [1.8, 0.1, 1.6] }, look: { at: 'recoome', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'recoome', pose: 'knockdown', face: 'ko', speed: 6 }],
        sfx: { name: 'groundImpact', who: 'recoome', vol: 1.1 },
        vfx: { kind: 'dust', at: { at: 'recoome' }, radius: 3, count: 16 },
        cam: { from: { at: 'recoome', off: [3.4, 1.4, 3] }, look: { at: 'recoome', off: [0, -0.5, 0] }, fov: 44 },
        hold: 1.3,
      },
      // the other two stop laughing
      {
        call: (ctx) => {
          const { burter, jeice, goku } = ctx.cast;
          for (const f of [burter, jeice]) f.yaw = f.prevYaw = Math.atan2(goku.pos.x - f.pos.x, goku.pos.z - f.pos.z);
        },
        pose: [{ who: 'jeice', pose: 'idle', face: 'shock' }, { who: 'burter', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'jeice', local: [0.9, 0.3, 2.4] }, look: { at: 'jeice', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'jeice', line: 'Recoome... in one hit? Who IS this?', duration: 2.4 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'burter', pose: 'bt_pose', face: 'grit' }],
        cam: { from: { at: 'burter', local: [0.9, 0.3, 2.4] }, look: { at: 'burter', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'burter', line: 'Does not matter. Nobody in this universe is faster than Burter.', duration: 3 },
        hold: 3,
      },
    ],
    end(ctx) {
      const { goku, recoome, gohan, krillin } = ctx.cast;
      if (ctx.ship) {
        ctx.ship.pos.copy(ctx.shipLand);
        ctx.ship.group.position.copy(ctx.shipLand);
      }
      goku.setHidden(false);
      goku.untargetable = false;
      recoome.hp = 1;
      recoome.untargetable = true;
      recoome.setState('scripted', { pose: 'knockdown', expression: 'ko' });
      // the beans: they are back on their feet, watching
      for (const f of [gohan, krillin]) {
        f.hp = f.hpMax;
        f.setState('scripted', { pose: 'idle', expression: 'calm' });
      }
      ctx.m.flags.gokuLanded = true;
    },
  };

  /* ================================================================ Burter, finished */
  S.vegeta_finishes_burter = {
    id: 'vegeta_finishes_burter',
    cast: (m) => ({ goku: m.battle.story.goku, vegeta: m.battle.story.vegeta, burter: m.battle.story.burter }),
    events: [
      {
        call: (ctx) => {
          const { vegeta, burter } = ctx.cast;
          vegeta.setHidden(false);
          const at = burter.pos.clone().add(new V3(3.5, 0, 2.5));
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          vegeta.setPosition(at);
          vegeta.yaw = vegeta.prevYaw = Math.atan2(burter.pos.x - at.x, burter.pos.z - at.z);
          burter.intangible = true;
        },
        pose: [{ who: 'vegeta', pose: 'v_palmExecute', face: 'smirk' }, { who: 'burter', pose: 'bt_defeat', face: 'ko' }],
        cam: { from: { at: 'vegeta', local: [1.4, -0.4, 1.8] }, look: { at: 'vegeta', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'You left him breathing, Kakarot. I will not.', duration: 2.4 },
        hold: 2.2,
      },
      {
        call: (ctx) => {
          const { vegeta, burter } = ctx.cast;
          const from = vegeta.handPos('R'), to = burter.chest();
          for (let i = 0; i <= 12; i++) ctx.b.vfx.trail(from.clone().lerp(to, i / 12), 0x8fc8ff, 0.6, 0.4);
          ctx.b.vfx.explosion(to, 5, 0x8fc8ff, { smoke: true });
          ctx.b.sfx('explosionBig', burter, { vol: 1.1 });
          ctx.b.cameraTraumaAt(to, 0.6);
          burter.setHidden(true);
        },
        screen: { flash: 0.4 },
        cam: { from: { at: 'burter', off: [6, 2.2, 5] }, look: { at: 'burter' }, fov: 48 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'goku', local: [0.4, 0.15, 1.5] }, look: { at: 'goku', off: [0, 0.25, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Vegeta! He was already beaten!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const { burter, vegeta } = ctx.cast;
      if (burter) {
        burter.intangible = false;
        burter.cannotDie = false;
        if (burter.alive) {
          burter.hp = 0;
          burter._ko(vegeta, { dir: new V3(0, 1, 0) });
        }
        burter.alive = false;
        burter.setHidden(true);
        burter.untargetable = true;
      }
      ctx.m.flags.burterFinished = true;
    },
  };

  /* ================================================================ the Body Change */
  S.ginyu_takes_goku = {
    id: 'ginyu_takes_goku',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, ginyu: s.ginyu, krillin: s.krillin, gohan: s.gohan, vegeta: s.vegeta };
    },
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          const { goku, ginyu } = ctx.cast;
          // whatever happened in the fight, the two of them are on the ground, facing, in the open
          const at = goku.pos.clone().addScaledVector(goku.forward, 5.5);
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          ginyu.setPosition(at);
          goku.setPosition(goku.pos.clone().setY(ctx.b.stage.heightAt(goku.pos.x, goku.pos.z)));
          for (const f of [goku, ginyu]) {
            f.grounded = true;
            f.vel.set(0, 0, 0);
          }
          ginyu.yaw = ginyu.prevYaw = Math.atan2(goku.pos.x - ginyu.pos.x, goku.pos.z - ginyu.pos.z);
          goku.yaw = goku.prevYaw = Math.atan2(ginyu.pos.x - goku.pos.x, ginyu.pos.z - goku.pos.z);
        },
        pose: [{ who: 'goku', pose: 'guard', face: 'grit' }, { who: 'ginyu', pose: 'gy_changeW', face: 'angry' }],
        cam: { from: { at: 'ginyu', local: [1, 0.2, 2.6] }, look: { at: 'ginyu', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'ginyu', line: 'You have made this very simple. I do not need to beat that body. I will just take it.', duration: 3.4 },
        hold: 3.2,
      },
      // he wrecks his own body first, so the trade is worth making
      {
        call: (ctx) => {
          const g = ctx.cast.ginyu;
          ctx.b.vfx.impact(g.chest(), 4, 0xc9a0ff);
          ctx.b.sfx('punchHeavy', g, { vol: 1.2 });
          ctx.b.cameraTraumaAt(g.chest(), 0.6);
          g.hp = Math.max(1, Math.round(g.hpMax * 0.3));
        },
        pose: [{ who: 'ginyu', pose: 'hitHeavy', face: 'shout' }],
        cam: { from: { at: 'ginyu', local: [1.6, 0.4, 2.2] }, look: { at: 'ginyu', off: [0, 0.1, 0] }, fov: 40 },
        hold: 1.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'goku', local: [0.35, 0.1, 1.4] }, look: { at: 'goku', off: [0, 0.25, 0] }, fov: 36 },
        say: { who: 'goku', line: 'He hurt himself...? What is he doing?', duration: 2, style: 'quiet' },
        hold: 1.8,
      },
      // THE TELEGRAPH: arms open, the light building in his chest, the world going dark;
      // shot so Goku is standing in the line of it
      {
        pose: [{ who: 'ginyu', pose: 'gy_open', face: 'shout' }],
        mood: { amount: 0.7, color: 0x2a1a3a, seconds: 0.4 },
        sfx: { name: 'beamCharge', who: 'ginyu', vol: 1 },
        cam: { from: { at: 'goku', local: [0.9, 0.5, -2.4] }, to: { at: 'goku', local: [0.8, 0.45, -2] }, look: { at: 'ginyu', off: [0, 0.2, 0] }, fov: 42, fov2: 38 },
        say: { who: 'ginyu', line: 'BODY...', duration: 1.4, style: 'shout' },
        tick: (ctx) => {
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.streamInward(ctx.cast.ginyu.chest(), 2.8, 0xe6d0ff, 4, 0.12, 0.35);
        },
        hold: 1.6,
      },
      // THE BEAM: from his chest to Goku, and it holds him
      {
        call: (ctx) => {
          const { ginyu, goku } = ctx.cast;
          goku.intangible = true;
          SL.Cinema.beam(ctx, ginyu, goku, CHANGE_BEAM);
          ctx.b.sfx('beamFire', ginyu, { pitch: 1.05 });
        },
        pose: [{ who: 'ginyu', pose: 'gy_beam', face: 'shout' }, { who: 'goku', pose: 'hitBody', face: 'shock' }],
        screen: { flash: 0.6, color: '#e8d8ff' },
        slow: { scale: 0.45, seconds: 2.4 },
        say: { who: 'ginyu', line: '...CHANGE!', duration: 1.4, style: 'shout' },
        // wide and square: both bodies and the beam between them
        cam: { from: { at: 'goku', local: [7, 1, 2.6] }, look: { at: 'goku', local: [0, 0.2, 2.7] }, fov: 50 },
        tick: (ctx) => SL.Cinema.pinBeam(ctx, 0xf0e4ff),
        hold: 0.8,
      },
      // two souls cross on it: Goku's gold one to the captain's body, the captain's violet one to Goku's
      {
        tick: (ctx, t) => {
          SL.Cinema.pinBeam(ctx, 0xf0e4ff);
          soulsTick(ctx, ctx.cast.goku, ctx.cast.ginyu, t, 1.4, 0xffd870, 0xc9a0ff);
        },
        hold: 1.5,
      },
      // the exchange
      {
        call: (ctx) => {
          const { ginyu, goku } = ctx.cast;
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
          goku.intangible = false;
          changeOnce(ctx, ginyu, goku, { penalty: 0.55, penalize: goku });
          ctx.b.stage.clearMood && ctx.b.stage.clearMood(0.6);
          ctx.b.emit('bodyChangeStaged', { thief: ginyu, victim: goku });
        },
        screen: { flash: 0.8, color: '#ffffff' },
        pose: [{ who: 'goku', pose: 'hitHeavy', face: 'shock' }, { who: 'ginyu', pose: 'hitHeavy', face: 'shock' }],
        shake: { at: 'goku', amount: 0.6 },
        hold: 1,
      },
      // Goku's body — with the captain behind the eyes
      {
        pose: [{ who: 'goku', pose: 'gy_pose', face: 'grin' }],
        cam: { from: { at: 'goku', local: [0.5, -0.2, 1.8] }, to: { at: 'goku', local: [0.4, -0.2, 1.5] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 38, fov2: 34 },
        say: { who: 'ginyu', line: 'Marvellous. It fits like it was made for me.', duration: 2.8 },
        hold: 2.8,
      },
      // the captain's wrecked body — with Goku behind the eyes, looking at hands that are not his
      {
        pose: [{ who: 'ginyu', pose: 'lookHands', face: 'shock' }],
        cam: { from: { at: 'ginyu', local: [0.6, 0.1, 1.9] }, look: { at: 'ginyu', off: [0, 0.2, 0] }, fov: 38 },
        say: { who: 'goku', line: 'That is... my body. And I am in his. And this one is falling apart!', duration: 3.2 },
        hold: 3.2,
      },
      // the others, working it out
      {
        cam: { from: { at: 'krillin', off: [0.8, 0.5, 1.5] }, look: { at: 'krillin' }, fov: 38 },
        say: { who: 'krillin', line: 'Wait — Goku is THAT one now? The purple one is Goku?!', duration: 2.6 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const { goku, ginyu } = ctx.cast;
      if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
      goku.intangible = false;
      changeOnce(ctx, ginyu, goku, { penalty: 0.55, penalize: goku, silent: true });
      ctx.b.stage.clearMood && ctx.b.stage.clearMood(0.4);
      ctx.m.flags.swapped = true;
      ctx.m.flags.bodyState = 'swapped';
    },
  };

  /* ================================================================ the frog */
  S.frog_intercept = {
    id: 'frog_intercept',
    cast: (m) => {
      const s = m.battle.story;
      return { vegeta: s.vegeta, ginyu: s.ginyu, goku: s.goku, frog: s.frog };
    },
    music: { song: null, level: 0 },
    events: [
      // Goku, wrecked, on one knee — and a frog, hopping about by his hand
      {
        call: (ctx) => {
          const { goku, frog, ginyu, vegeta } = ctx.cast;
          for (const f of [goku, frog, ginyu, vegeta]) {
            f.setHidden(false);
            f.untargetable = true;
          }
          const at = goku.pos.clone().add(new V3(0.9, 0, 0.7));
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          frog.setPosition(at);
          frog.grounded = true;
          frog.yaw = frog.prevYaw = goku.yaw + 1.2;
        },
        pose: [
          { who: 'goku', pose: 'defeatKneel', face: 'hurt' },
          { who: 'frog', pose: 'frog_hop', face: 'calm' },
          { who: 'ginyu', pose: 'gy_changeW', face: 'angry' },
          { who: 'vegeta', pose: 'idle', face: 'smirk' },
        ],
        cam: { from: { at: 'goku', local: [1.4, -0.4, 1.6] }, look: { at: 'frog', off: [0, 0.2, 0] }, fov: 40 },
        sfx: { name: 'uiMove', vol: 0.6, pitch: 0.5 },
        hold: 1.8,
      },
      // the captain has one try left, and the prince is the target
      {
        cam: { from: { at: 'ginyu', local: [1, 0.3, 2.6] }, look: { at: 'ginyu', off: [0, 0.2, 0] }, fov: 42 },
        say: { who: 'ginyu', line: 'Then I shall take the prince instead!', duration: 2.4, style: 'shout' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'ginyu', pose: 'gy_open', face: 'shout' }],
        mood: { amount: 0.7, color: 0x2a1a3a, seconds: 0.4 },
        sfx: { name: 'beamCharge', who: 'ginyu', vol: 1 },
        cam: { from: { at: 'vegeta', local: [0.8, 0.4, -2.4] }, look: { at: 'ginyu' }, fov: 44 },
        tick: (ctx) => {
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.streamInward(ctx.cast.ginyu.chest(), 2.8, 0xe6d0ff, 4, 0.12, 0.35);
        },
        hold: 1.4,
      },
      // Goku sees it — and sees the frog. He grabs it.
      {
        call: (ctx) => {
          const { goku, frog } = ctx.cast;
          goku.yaw = goku.prevYaw = Math.atan2(frog.pos.x - goku.pos.x, frog.pos.z - goku.pos.z);
          ctx.gripped = true;
          ctx.b.sfx('punchLight', goku, { vol: 0.4, pitch: 1.6 });
        },
        pose: [{ who: 'goku', pose: 'grab', face: 'grit' }, { who: 'frog', pose: 'idle', face: 'shock' }],
        // his face and the frog in his hand, both in frame
        cam: { from: { at: 'goku', local: [-1.5, 0.35, 2.0] }, look: { at: 'goku', local: [0, 0.05, 0.35] }, fov: 46 },
        say: { who: 'goku', line: 'Sorry, little guy!', duration: 1.4 },
        tick: (ctx) => {
          const { goku, frog } = ctx.cast;
          if (ctx.gripped) {
            const h = goku.handPos('R');
            frog.setPosition(h.clone().add(new V3(0, -0.15, 0)));
            frog.grounded = false;
          }
        },
        hold: 1.2,
      },
      // the beam fires at Vegeta — and the frog is already in the air, thrown into its path
      {
        call: (ctx) => {
          const { goku, frog, ginyu, vegeta } = ctx.cast;
          ctx.gripped = false;
          ctx.throwFrom = frog.pos.clone();
          // a point on the line from the captain to the prince, a third of the way along
          ctx.throwTo = ginyu.chest().lerp(vegeta.chest(), 0.4);
          ctx.b.sfx('dash', goku, { vol: 0.9, pitch: 1.5 });
          // nobody but the frog can be taken by this beam while it hunts for him
          frog.intangible = goku.intangible = vegeta.intangible = true;
          SL.Cinema.beam(ctx, ginyu, frog, CHANGE_BEAM);
          ctx.b.sfx('beamFire', ginyu, { pitch: 1.05 });
          ctx.b.emit('frogThrown', { from: ctx.throwFrom.clone(), to: ctx.throwTo.clone() });
        },
        pose: [{ who: 'goku', pose: 'throwRelease', face: 'shout' }, { who: 'ginyu', pose: 'gy_beam', face: 'shout' }, { who: 'frog', pose: 'frog_hop', face: 'shock' }],
        say: { who: 'ginyu', line: 'BODY... CHANGE!', duration: 1.4, style: 'shout' },
        slow: { scale: 0.35, seconds: 1.8 },
        // wide and to the side: the captain, the prince, the beam between them, the frog arcing in
        cam: { from: { at: 'ginyu', off: [10, 2.6, 7] }, look: { at: 'ginyu', off: [2, 0.6, 5] }, fov: 56 },
        tick: (ctx, t) => {
          const frog = ctx.cast.frog;
          const k = U.clamp01(t / 0.55);
          const p = ctx.throwFrom.clone().lerp(ctx.throwTo, k);
          p.y += Math.sin(k * Math.PI) * 2.2;
          frog.setPosition(p);
          frog.yaw += 0.3;
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(frog.chest(), 0xa8e070, 0.3, 0.3);
          SL.Cinema.pinBeam(ctx, 0xf0e4ff);
        },
        hold: 0.9,
      },
      // it finds the frog; two souls cross
      {
        tick: (ctx, t) => {
          const frog = ctx.cast.frog;
          frog.setPosition(ctx.throwTo);
          SL.Cinema.pinBeam(ctx, 0xf0e4ff);
          soulsTick(ctx, ctx.cast.ginyu, frog, t, 1.2, 0xc9a0ff, 0xa8e070);
        },
        cam: { from: { at: 'frog', local: [2.2, 0.4, 2.6] }, look: { at: 'frog' }, fov: 44 },
        hold: 1.3,
      },
      {
        call: (ctx) => {
          const { ginyu, frog } = ctx.cast;
          if (ctx.beam && !ctx.beam.done) ctx.beam.stop();
          frog.intangible = false;
          changeOnce(ctx, ginyu, frog, { penalty: 1 });
          ctx.b.stage.clearMood && ctx.b.stage.clearMood(0.6);
          const at = frog.pos.clone();
          at.y = ctx.b.stage.heightAt(at.x, at.z);
          frog.setPosition(at);
          frog.grounded = true;
          ctx.b.emit('frogged', { frog, ginyu });
        },
        screen: { flash: 0.8, color: '#ffffff' },
        pose: [{ who: 'ginyu', pose: 'frogSquat', face: 'shock' }, { who: 'frog', pose: 'idle', face: 'angry' }],
        hold: 0.8,
      },
      // the captain, now a frog
      {
        cam: { from: { at: 'frog', local: [0.2, 0.05, 0.9] }, look: { at: 'frog', off: [0, 0.05, 0] }, fov: 34 },
        say: { who: 'ginyu', line: 'Ribbit— NO! This is not a body! This is an INSULT!', duration: 3 },
        hold: 3,
      },
      // and the frog, in the captain's body
      {
        cam: { from: { at: 'ginyu', local: [1.2, -0.2, 2] }, look: { at: 'ginyu', off: [0, -0.2, 0] }, fov: 40 },
        say: { who: 'namek_frog', line: 'Ribbit.', duration: 1.4, style: 'quiet' },
        hold: 1.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_chinUp', face: 'grin' }],
        cam: { from: { at: 'vegeta', local: [0.5, 0.15, 1.6] }, look: { at: 'vegeta', off: [0, 0.25, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'Hah! The great Captain Ginyu. Enjoy the pond.', duration: 2.6 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { ginyu, frog, goku, vegeta } = ctx.cast;
      if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
      frog.intangible = false;
      if (goku) goku.intangible = false;
      if (vegeta) vegeta.intangible = false;
      changeOnce(ctx, ginyu, frog, { penalty: 1, silent: true });
      const at = frog.pos.clone();
      at.y = ctx.b.stage.heightAt(at.x, at.z);
      frog.setPosition(at);
      frog.grounded = true;
      frog.untargetable = true;
      ginyu.untargetable = true;
      ginyu.setState('scripted', { pose: 'frogSquat', expression: 'shock' });
      ctx.b.stage.clearMood && ctx.b.stage.clearMood(0.4);
      ctx.m.flags.frogged = true;
      ctx.m.flags.bodyState = 'frog';
    },
  };
})();
