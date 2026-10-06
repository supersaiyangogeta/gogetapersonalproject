/*
 * SCENES — Chapter 10: what was in the ball.
 *
 *   buu_ball          the crater, the ball filling with a fight happening somewhere else
 *   buu_hatch         the seal gives: silence, smoke, a shape far too big — and then him
 *   buu_beats_gohan   he stops playing; the demon king who would not kneel; the candy
 *
 * The ball is an actor in the cast ({ chest, pos, forward }), so cameras frame it like anybody.
 * Paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;
  const K = () => SL.data.buuKit;

  function cast(m) {
    const s = m.battle.story;
    const ball = s.ball;
    return Object.assign({}, s, {
      ball: ball ? { chest: () => ball.pos.clone(), pos: ball.pos, forward: new V3(0, 0, 1) } : null,
    });
  }

  S.buu_ball = {
    id: 'buu_ball',
    cast,
    music: { song: 'ominous', level: 2 },
    events: [
      {
        pose: [
          { who: 'babidi', pose: 'bb_cast', face: 'grin' },
          { who: 'gohan', pose: 'ag_fight', face: 'grit' },
          { who: 'dabura', pose: 'db_idle', face: 'smirk' },
        ],
        mood: { amount: 0.28, color: 0x2a1030, seconds: 1.5 },
        sfx: { name: 'magic', vol: 0.8 },
        tick: (ctx) => {
          const b = ctx.b, s = b.story;
          if (s.ball) K().siphonTick(b, s.siphonFrom, s.ball.pos);
        },
        cam: { from: { at: 'gohan', local: [1.4, 1.2, -3.2] }, to: { at: 'gohan', local: [1.1, 1.0, -2.4] }, look: { at: 'ball' }, fov: 46, fov2: 40 },
        say: { who: 'babidi', line: 'Yes... yes! Every blow those two trade fills it! Hee hee hee!', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'kai', pose: 'sk_point', face: 'grit' }],
        cam: { from: { at: 'kai', local: [0.9, 0.4, 2.3] }, look: { at: 'kai', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'supreme_kai', line: "The fight between Goku and Vegeta — he is feeding it to the ball!", duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_fight', face: 'angry' }],
        cam: { from: { at: 'gohan', local: [0.8, 0.4, 2.2] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'adult_gohan', line: 'Then I end it here.', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'dabura', pose: 'db_idle', face: 'smirk' }],
        cam: { from: { at: 'dabura', local: [0.9, 0.3, 2.6] }, look: { at: 'dabura', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'dabura', line: 'The wizard\'s egg is not for you, boy. You and I were not finished.', duration: 3.8 },
        hold: 4,
      },
    ],
    clearMood: false,
  };

  /**
   * The awakening. Not a comedy entrance: the seal splits, the sound goes, pink smoke pours out
   * and climbs, something enormous stands up inside it — and collapses into a round, small,
   * silly shape that stretches, yawns and pats its belly. Then, with no warning at all, the
   * Supreme Kai is flying across the crater.
   */
  S.buu_hatch = {
    id: 'buu_hatch',
    cast,
    events: [
      {
        music: { song: null, level: 0 },
        call: (ctx) => ctx.b.story.ball && ctx.b.story.ball.crack(),
        sfx: { name: 'heartbeat', vol: 1.2 },
        mood: { amount: 0.55, color: 0x2a0a2a, seconds: 1 },
        shake: { at: { at: 'ball' }, amount: 0.3 },
        cam: { from: { at: 'ball', off: [7, 1.5, 9] }, to: { at: 'ball', off: [5.5, 1.2, 7] }, look: { at: 'ball', off: [0, 0.5, 0] }, fov: 44, fov2: 38 },
        hold: 2.6,
      },
      {
        pose: [
          { who: 'gohan', pose: 'ag_fight', face: 'shock' },
          { who: 'kai', pose: 'sk_halt', face: 'shock' },
        ],
        sfx: { name: 'heartbeat', vol: 1.3, pitch: 0.9 },
        cam: { from: { at: 'gohan:face', local: [0.12, -0.04, 1.5] }, look: { at: 'gohan:head' }, fov: 34 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const b = ctx.b, ball = b.story.ball;
          ball.open();
          const top = ball.pos.clone().add(new V3(0, ball.R, 0));
          b.vfx.explosion(top, 7, 0xff9ad0, { smoke: true });
          for (let i = 0; i < 6; i++) b.vfx.flash(top.clone().add(new V3(0, i * 6, 0)), 14 - i, 0xff9ad0, 0.9, SL.Toon.tex.glow);
        },
        screen: { flash: 0.7, color: '#ffc0e0' },
        sfx: { name: 'explosionHuge', vol: 1.3, pitch: 0.55 },
        shake: { at: { at: 'ball' }, amount: 1 },
        tick: (ctx, s) => {
          const b = ctx.b, ball = b.story.ball;
          if (b.frame % 4 === 0) b.vfx.dust(ball.pos.clone().add(new V3(U.rand(-2, 2), ball.R + s * 6, U.rand(-2, 2))), 4 + s * 3, 5, 0xf4a8cc);
        },
        // far enough back that the column of smoke is a shape, not the whole screen
        cam: { from: { at: 'ball', off: [24, 5, 32] }, look: { at: 'ball', off: [0, 9, 0] }, fov: 52 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'babidi', pose: 'bb_cackle', face: 'grin' }],
        tick: (ctx, s) => {
          const b = ctx.b, ball = b.story.ball;
          if (b.frame % 3 === 0) {
            const a = s * 3 + (b.frame % 17);
            b.vfx.dust(ball.pos.clone().add(new V3(Math.cos(a) * (3 + s * 6), 1 + s * 2, Math.sin(a) * (3 + s * 6))), 5, 4, 0xf0a0c8);
          }
        },
        mood: { amount: 0.5, color: 0x5a1a4a, seconds: 2 },
        // the wizard small against the cloud (a camera between him and the ball sat in the smoke)
        cam: { from: { at: 'babidi', local: [1.3, 0.8, 5] }, look: { at: 'babidi', off: [0, 1.6, 0] }, fov: 46 },
        say: { who: 'babidi', line: 'Majin Buu! My father\'s creation! RISE!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        // a shape in the smoke, far too big
        call: (ctx) => {
          const buu = ctx.cast.buu, ball = ctx.b.story.ball;
          buu.setHidden(false);
          buu.setPosition(ball.pos.clone().add(new V3(0, -ball.R * 0.72, 0)));
          buu.model.root.scale.setScalar(buu.model.baseScale * 2.8);
          buu.model.tintColor.set(0x1a0612);
          buu.model.tintAmount = 0.85;
          buu.model._updateEmissive();
          buu.setState('scripted', { pose: 'bu_angry', expression: 'grin' });
        },
        sfx: { name: 'rumble', vol: 1.2, pitch: 0.5 },
        tick: (ctx) => {
          // the smoke rolls behind him (away from Gohan), so the shape stands in front of it
          const b = ctx.b, ball = b.story.ball;
          if (b.frame % 4 !== 0) return;
          const away = ball.pos.clone().sub(ctx.cast.gohan.pos).setY(0).normalize();
          b.vfx.dust(ball.pos.clone().addScaledVector(away, 7).add(new V3(U.rand(-5, 5), U.rand(1, 7), U.rand(-2, 2))), 5, 3, 0xf0a0c8);
        },
        cam: { from: { at: 'gohan', local: [1.5, -0.2, -3] }, look: { at: 'buu', off: [0, 2.6, 0] }, fov: 34 },
        hold: 2.8,
      },
      {
        // and it folds down into him
        tick: (ctx, s) => {
          const buu = ctx.cast.buu;
          const k = U.clamp01(s / 0.7);
          buu.model.root.scale.setScalar(buu.model.baseScale * U.lerp(2.8, 1, k * k));
          buu.model.tintAmount = U.lerp(0.85, 0, k);
          buu.model._updateEmissive();
        },
        sfx: { name: 'stretch', vol: 1, pitch: 0.6 },
        cam: { from: { at: 'buu', local: [0, 0.4, 5.5] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 40 },
        hold: 1,
      },
      {
        call: (ctx) => {
          const buu = ctx.cast.buu;
          buu.model.root.scale.setScalar(buu.model.baseScale);
          buu.model.tintAmount = 0;
          buu.model._updateEmissive();
        },
        pose: [{ who: 'buu', pose: 'bu_stretch', face: 'grin', speed: 4 }],
        mood: { amount: 0.12, color: 0x2a1030, seconds: 1.5 },
        cam: { from: { at: 'buu', local: [0.6, 0.2, 3.4] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 40 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_bellyPat', face: 'grin' }],
        cam: { from: { at: 'buu', local: [-0.8, 0.1, 2.8] }, look: { at: 'buu', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'Hee hee hee!', duration: 1.8 },
        hold: 2,
      },
      {
        cam: { from: { at: 'gohan', local: [0.7, 0.4, 2.1] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'adult_gohan', line: "...That's him?", duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'kai', local: [0.7, 0.35, 2] }, look: { at: 'kai', off: [0, 0.4, 0] }, fov: 36 },
        say: { who: 'supreme_kai', line: 'Do not let the shape fool you. That thing killed four Supreme Kais.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
      {
        pose: [{ who: 'babidi', pose: 'bb_cast', face: 'grin' }],
        cam: { from: { at: 'babidi', local: [0.7, 0.3, 2.2] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'babidi', line: 'Buu! Kill them! Kill all of them!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_idle', face: 'grin' }],
        cam: { from: { at: 'buu', local: [0.4, 0.3, 2.6] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        hold: 1.2,
      },
      {
        // no wind-up: he is beside the Kai, and the Kai is flying
        call: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu, kai = ctx.cast.kai;
          b.vfx.afterimage(buu.pos, buu.height, 0xffb8d8);
          const at = kai.pos.clone().addScaledVector(kai.forward, 1.3);
          at.y = b.stage.heightAt(at.x, at.z);
          buu.setPosition(at);
          K().faceTo(buu, kai.pos);
          ctx.m.flags.kaiFrom = kai.pos.clone();
          b.vfx.impact(kai.chest(), 3, 0xffffff);
        },
        pose: [
          { who: 'buu', pose: 'bu_slap', face: 'grin' },
          { who: 'kai', pose: 'hitHeavy', face: 'hurt' },
        ],
        sfx: { name: 'punchHeavy', vol: 1.3, pitch: 0.7 },
        shake: { at: { at: 'kai' }, amount: 0.8 },
        slow: { scale: 0.35, seconds: 0.6 },
        screen: { flash: 0.4 },
        tick: (ctx, s) => {
          const kai = ctx.cast.kai, from = ctx.m.flags.kaiFrom, buu = ctx.cast.buu;
          if (!from) return;
          const away = from.clone().sub(buu.pos).setY(0).normalize();
          const p = from.clone().addScaledVector(away, 14 * U.clamp01(s / 0.8));
          p.y = ctx.b.stage.heightAt(p.x, p.z) + Math.sin(U.clamp01(s / 0.8) * Math.PI) * 1.5;
          kai.setPosition(p);
        },
        cam: { from: { at: 'gohan', local: [1.6, 0.8, -1.2] }, look: { at: 'kai' }, fov: 50 },
        hold: 1.4,
      },
      {
        pose: [
          { who: 'kai', pose: 'knockdown', face: 'hurt' },
          { who: 'buu', pose: 'bu_laugh', face: 'grin' },
        ],
        cam: { from: { at: 'buu', local: [0.7, 0.3, 2.6] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'majin_buu', line: 'Hee hee! Flew far!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_fight', face: 'angry' }],
        cam: { from: { at: 'gohan', local: [0.8, 0.35, 2.2] }, look: { at: 'gohan', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'adult_gohan', line: 'Get away from him!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      const buu = ctx.cast.buu;
      buu.model.root.scale.setScalar(buu.model.baseScale);
      buu.model.tintAmount = 0;
      buu.model._updateEmissive();
      buu.setHidden(false);
      ctx.m.flags.buuOut = true;
    },
    clearMood: false,
  };

  S.buu_beats_gohan = {
    id: 'buu_beats_gohan',
    cast,
    events: [
      {
        pose: [{ who: 'buu', pose: 'bu_angry', face: 'angry' }],
        tick: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu;
          if (b.frame % 5 === 0) b.vfx.dust(buu.headPos().add(new V3(0, 0.2, 0)), 0.6, 3, 0xf8f0f4);
        },
        sfx: { name: 'kiUp', who: 'buu', pitch: 0.5 },
        cam: { from: { at: 'buu', local: [0.5, 0.3, 2.2] }, look: { at: 'buu', off: [0, 0.6, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'Buu... does not like you.', duration: 2.6 },
        hold: 2.8,
      },
      {
        call: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu, gh = ctx.cast.gohan;
          b.vfx.afterimage(buu.pos, buu.height, 0xffb8d8);
          buu.setPosition(gh.pos.clone().add(new V3(0, 2.4, 0)));
          b.vfx.impact(gh.chest(), 4, 0xffffff);
          b.stage.crater(gh.pos, 4, 1, null);
          b.vfx.dust(gh.pos.clone().add(new V3(0, 0.3, 0)), 4, 16, b.stage.def.terrain.sand);
        },
        pose: [
          { who: 'buu', pose: 'bu_flop', face: 'grin' },
          { who: 'gohan', pose: 'smashed', face: 'hurt' },
        ],
        damage: { who: 'gohan', level: 3, burst: true },
        screen: { flash: 0.6 },
        sfx: { name: 'explosionBig', vol: 1.2, pitch: 0.7 },
        shake: { at: { at: 'gohan' }, amount: 1 },
        slow: { scale: 0.3, seconds: 0.8 },
        cam: { from: { at: 'gohan', off: [3, 5, 4] }, look: { at: 'gohan' }, fov: 46 },
        hold: 1.6,
      },
      {
        call: (ctx) => {
          const buu = ctx.cast.buu, gh = ctx.cast.gohan;
          const p = gh.pos.clone().add(new V3(2.2, 0, 1.2));
          p.y = ctx.b.stage.heightAt(p.x, p.z);
          buu.setPosition(p);
        },
        pose: [
          { who: 'gohan', pose: 'lieBack', face: 'ko' },
          { who: 'buu', pose: 'bu_laugh', face: 'grin' },
        ],
        cam: { from: { at: 'gohan', off: [0.8, 3.2, 1.2] }, look: { at: 'gohan', off: [0, -0.6, 0] }, fov: 40 },
        say: { who: 'supreme_kai', line: 'Gohan...!', duration: 1.8, style: 'shout' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'dabura', pose: 'db_idle', face: 'angry' }],
        cam: { from: { at: 'dabura', local: [0.9, 0.3, 2.6] }, look: { at: 'dabura', off: [0, 0.5, 0] }, fov: 40 },
        say: { who: 'dabura', line: 'A King of Demons does not stand behind a ball of chewing gum.', duration: 3.6 },
        hold: 3.8,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_candy', face: 'grin' }],
        call: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu, db = ctx.cast.dabura;
          K().faceTo(buu, db.pos);
          SL.Cinema.vfx(ctx, { kind: 'beamLine', at: { at: 'buu:head' }, to: { at: 'dabura' }, color: 0xff6ac4, size: 0.3, steps: 18 });
          if (db.model.setStone) db.model.setStone(true, 'candy');
          b.vfx.sparks(db.chest(), 0xff8ac4, 20, 8, 0.12);
        },
        sfx: { name: 'candyPop', vol: 1.2 },
        cam: { from: { at: 'buu', local: [-1.4, 0.5, -2.6] }, look: { at: 'dabura', off: [0, 0.3, 0] }, fov: 44 },
        hold: 1.8,
      },
      {
        cam: { from: { at: 'dabura', local: [0.8, 0.2, 2.4] }, look: { at: 'dabura', off: [0, 0.4, 0] }, fov: 38 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_eat', face: 'grin' }],
        call: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu, db = ctx.cast.dabura;
          const p = db.pos.clone().addScaledVector(db.dirTo(buu).setY(0).normalize(), 1.4);
          p.y = b.stage.heightAt(p.x, p.z);
          buu.setPosition(p);
          K().faceTo(buu, db.pos);
        },
        sfx: { name: 'candyPop', vol: 1, pitch: 0.7 },
        cam: { from: { at: 'buu', local: [1.8, 0.5, 2.2] }, look: { at: 'buu', off: [0, 0.4, 0] }, fov: 42 },
        hold: 1.2,
      },
      {
        hide: 'dabura',
        cam: { from: { at: 'buu', local: [0.6, 0.3, 2.2] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'Mmm! Tasty!', duration: 2 },
        hold: 2.2,
      },
      {
        // with the demon king gone, his spell goes with him
        call: (ctx) => {
          const b = ctx.b;
          for (const f of [ctx.cast.piccolo, ctx.cast.krillin]) {
            if (!f) continue;
            if (f.model.setStone) f.model.setStone(false);
            b.vfx.debrisBurst(f.chest(), 12, 0x9a9690, 10, 0.25);
          }
        },
        pose: [
          { who: 'piccolo', pose: 'guard', face: 'shock' },
          { who: 'krillin', pose: 'guard', face: 'shock' },
        ],
        sfx: { name: 'rockBreak', vol: 1 },
        cam: { from: { at: 'piccolo', local: [1.2, 0.4, 3] }, look: { at: 'piccolo', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'piccolo', line: "The stone's gone... Dabura is dead.", duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'babidi', pose: 'bb_cackle', face: 'grin' }],
        cam: { from: { at: 'babidi', local: [0.7, 0.3, 2.2] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'babidi', line: 'G-good! Very good, Buu! Now — to Vegeta!', duration: 3 },
        hold: 3.2,
      },
      {
        tick: (ctx, s) => {
          for (const f of [ctx.cast.buu, ctx.cast.babidi]) {
            f.pos.y += 0.25;
            f.grounded = false;
          }
        },
        pose: [{ who: 'buu', pose: 'flyUp', face: 'grin' }],
        sfx: { name: 'dash', vol: 1, pitch: 0.7 },
        cam: { from: { at: 'kibito', local: [1, 0.2, -3] }, look: { at: 'buu' }, fov: 54 },
        hold: 1.6,
      },
      {
        hide: ['buu', 'babidi'],
        pose: [{ who: 'kibito', pose: 'kb_heal', face: 'grit' }],
        call: (ctx) => {
          const b = ctx.b, kb = ctx.cast.kibito, gh = ctx.cast.gohan;
          const p = gh.pos.clone().add(new V3(1.1, 0, 0.4));
          p.y = b.stage.heightAt(p.x, p.z);
          kb.setPosition(p);
          K().faceTo(kb, gh.pos);
        },
        mood: { amount: 0.2, color: 0x2a1030, seconds: 2 },
        cam: { from: { at: 'kibito', off: [8, 5, 9] }, look: { at: 'gohan' }, fov: 44 },
        say: { who: 'kibito', line: 'He is still breathing. Stay with me, Gohan.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      ctx.m.flags.gohanBeaten = true;
      ctx.m.flags.daburaEaten = true;
      const db = ctx.cast.dabura;
      if (db) {
        db.setHidden(true);
        db.untargetable = true;
        db.intangible = true;
      }
      for (const f of [ctx.cast.buu, ctx.cast.babidi]) if (f) f.setHidden(true);
      for (const f of [ctx.cast.piccolo, ctx.cast.krillin]) if (f && f.model.setStone) f.model.setStone(false);
      if (ctx.cast.gohan && (ctx.cast.gohan.damageLevel || 0) < 3) ctx.cast.gohan.setDamage(3);
    },
    clearMood: false,
  };
})();
