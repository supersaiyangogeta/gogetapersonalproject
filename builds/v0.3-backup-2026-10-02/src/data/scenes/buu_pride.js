/*
 * SCENES — Chapter 10: Goku against Majin Vegeta, at last without holding back.
 *
 *   pride_standoff   the wastes: two men and the wind, and what each of them came for
 *   pride_ssj2       Vegeta, after the second level shows itself: "Good."
 *   pride_pride      Babidi in his head mid-fight; the M burning; down on one knee; "There's one thing a
 *                    Saiyan always keeps... His PRIIIIIDE!!!"; Babidi thrown out
 *   pride_fists      the exchange: both charge, the fists meet, and the land answers
 *   pride_galick     he goes back up and gathers everything into a Galick Gun
 *   pride_blast      the beams give way; the light takes the plateau
 *   pride_siphon     their energy leaving them for the horizon — and what it woke up
 *
 * Paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;
  const cast = (m) => m.battle.story;

  S.pride_standoff = {
    id: 'pride_standoff',
    cast,
    music: { song: 'finale', level: 1 },
    events: [
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'calm' },
          { who: 'vegeta', pose: 'v_majinStance', face: 'grin' },
        ],
        sfx: { name: 'rumble', vol: 0.4, pitch: 1.6 },
        call: (ctx) => ctx.b.vfx.dust(ctx.cast.goku.pos.clone().lerp(ctx.cast.vegeta.pos, 0.5).add(new V3(0, 0.4, 0)), 6, 16, ctx.b.stage.def.terrain.sand),
        cam: { from: { at: 'goku', off: [22, 3, 0] }, to: { at: 'goku', off: [16, 2.2, -3] }, look: { at: 'goku', off: [0, 1, -7] }, fov: 34, fov2: 30, ease: 'inOut' },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'vegeta:face', local: [0.3, -0.05, 1.3] }, look: { at: 'vegeta:head' }, fov: 32 },
        say: { who: 'vegeta', line: 'No ring. No rules. No crowd for you to protect.', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'goku:face', local: [-0.3, -0.05, 1.3] }, look: { at: 'goku:head' }, fov: 32 },
        say: { who: 'goku', line: "You didn't need a wizard for this, Vegeta. You only had to ask.", duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'powerUp', face: 'shout', speed: 10 }],
        vfx: { kind: 'ring', at: { at: 'vegeta' }, radius: 7, color: 0xffc83a, life: 0.6 },
        shake: { at: { at: 'vegeta' }, amount: 0.45 },
        sfx: { name: 'kiUp', who: 'vegeta', pitch: 0.7 },
        cam: { from: { at: 'vegeta', local: [1.4, 0.2, 3] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'I asked for seven years. You kept smiling. Now stop smiling!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
    ],
    clearMood: false,
  };

  S.pride_ssj2 = {
    id: 'pride_ssj2',
    cast,
    events: [
      {
        pose: [{ who: 'vegeta', pose: 'v_majinStance', face: 'grin' }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.3, 2.3] }, look: { at: 'vegeta', off: [0, 0.55, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'So you climbed that far too. Good. GOOD!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'g2_stance', face: 'angry' }],
        cam: { from: { at: 'goku', local: [-0.9, 0.2, 2.3] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'goku', line: 'This is what it looks like when I stop holding back.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.ssj2Shown = true;
    },
  };

  /**
   * The exchange. Both charge from where they stand; the fists meet in the middle; the land
   * gives way under them (crater, towers coming down, rock lifting); then the two of them, pushed
   * apart, and what it did to their clothes. The positions are the mission's; this is the film.
   */
  /* ---------------------------------------------------------------- HIS PRIDE */
  // both hands clamped on his skull, bent over it: something is in there with him
  SL.data.poses.v_headGrip = (t) => {
    const s = Math.sin(t * 23) * 3;
    return {
      root: { y: -0.12, rx: 16 }, spine: [18, 0, 0], chest: [12 + s, 0, 0], neck: [10, 0, 0], head: [18, s * 2, 0],
      shoulderL: [-128, 0, 46], elbowL: [-128, 0, 0], shoulderR: [-128, 0, -46], elbowR: [-128, 0, 0],
      thighL: [-34, 0, 14], kneeL: [52, 0, 0], thighR: [-8, 0, -14], kneeR: [40, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the same, down on one knee
  SL.data.poses.v_headGripKneel = (t) => {
    const s = Math.sin(t * 23) * 3;
    return {
      root: { y: -0.46, rx: 18 }, spine: [22, 0, 0], chest: [14 + s, 0, 0], neck: [10, 0, 0], head: [20, s * 2, 0],
      shoulderL: [-128, 0, 46], elbowL: [-128, 0, 0], shoulderR: [-128, 0, -46], elbowR: [-128, 0, 0],
      thighL: [-92, 0, 6], kneeL: [92, 0, 0], thighR: [12, 0, -6], kneeR: [115, 0, 0], footR: [40, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // standing out of it, the hands coming down off his head into fists
  SL.data.poses.v_prideRise = (t) => ({
    root: { y: -0.08, rx: 6 }, spine: [6, 0, 0], chest: [0 + Math.sin(t * 30), 0, 0], head: [10, 0, 0],
    shoulderL: [-30, 0, 26], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -26], elbowR: [-80, 0, 0],
    thighL: [-14, 0, 18], kneeL: [26, 0, 0], thighR: [-14, 0, -18], kneeR: [26, 0, 0],
    hands: ['fist', 'fist'],
  });
  // PRIIIIDE: head back, chest open, fists down and back, the whole body one shout
  SL.data.poses.v_prideRoar = (t) => {
    const s = Math.sin(t * 44) * 2;
    return {
      root: { y: -0.14, rx: -8 }, spine: [-12, 0, 0], chest: [-24 + s, 0, 0], neck: [-12, 0, 0], head: [-26, 0, 0],
      shoulderL: [30, 0, 40 + s], elbowL: [-20, 0, 0], shoulderR: [30, 0, -40 - s], elbowR: [-20, 0, 0],
      thighL: [-10, 0, 28], kneeL: [36, 0, 0], footL: [-10, 0, -14], thighR: [-10, 0, -28], kneeR: [36, 0, 0], footR: [-10, 0, 14],
      hands: ['fist', 'fist'],
    };
  };

  /*
   * THE ONE THING A SAIYAN KEEPS (the owner, 2026-10-02): mid-fight, Babidi reaches into Vegeta's head
   * to make him finish it his way. The M burns, the fight stops, the camera isolates him; he goes down
   * on one knee fighting it; silence; up, quietly — "There's one thing a Saiyan always keeps..." — and
   * then the roar, held, the lens thrown back by it: "His PRIIIIIDE!!!" Babidi's grip snaps, and the next
   * thing Vegeta does is come straight at Kakarot.
   */
  S.pride_pride = {
    id: 'pride_pride',
    cast,
    music: { song: null, level: 0 },
    clearMood: false,
    events: [
      // the fight stops: the M burning, his hands going to his head
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          ctx.burn = SL.data.buuKit.markBurn(v);
          ctx.burn.set(0.6);
          ctx.m.onDispose(() => ctx.burn && ctx.burn.dispose());
          ctx.b.stage.setMood(0.35, 0x1a0408, 0.8);
        },
        pose: [
          { who: 'vegeta', pose: 'v_headGrip', face: 'grit', speed: 10 },
          { who: 'goku', pose: 'guard', face: 'shock', speed: 6 },
        ],
        sfx: { name: 'tinnitus', vol: 0.8 },
        cam: { from: { at: 'vegeta', local: [1.6, 0.1, 2.6] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'babidi', line: 'Vegeta! What are you playing at?! Kill him — finish him NOW! I command you!', duration: 3.2, style: 'shout' },
        tick: (ctx, t) => ctx.burn && ctx.burn.set(0.55 + Math.sin(t * 9) * 0.25),
        hold: 3.2,
      },
      {
        cam: { from: { at: 'goku', local: [0.4, 0.35, 1.6] }, look: { at: 'goku:head', off: [0, 0.06, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Vegeta...?', duration: 1.4, style: 'quiet' },
        hold: 1.5,
      },
      // isolated: down on one knee, the head in his hands, nothing else in the frame
      {
        pose: [{ who: 'vegeta', pose: 'v_headGripKneel', face: 'grit', speed: 6 }],
        cam: { from: { at: 'vegeta', local: [0.9, -0.5, 1.4] }, to: { at: 'vegeta', local: [0.7, -0.45, 1.0] }, look: { at: 'vegeta:head' }, fov: 32 },
        sfx: { name: 'heartbeat', vol: 1 },
        say: { who: 'vegeta', line: 'Get... OUT... of my head...!', duration: 2.4, style: 'quiet' },
        tick: (ctx, t) => {
          if (ctx.burn) ctx.burn.set(0.7 + Math.sin(t * 14) * 0.3);
          ctx.b.camera.addTrauma(0.015);
        },
        hold: 2.6,
      },
      // silence; he stands out of it, slowly, the hands coming down into fists
      {
        pose: [{ who: 'vegeta', pose: 'v_prideRise', face: 'angry', speed: 2.2, aura: 0.25 }],
        cam: { from: { at: 'vegeta', local: [-0.5, -0.2, 1.8] }, to: { at: 'vegeta', local: [-0.35, 0.05, 1.15] }, look: { at: 'vegeta:head' }, fov: 34 },
        tick: (ctx) => ctx.burn && ctx.burn.set(0.5),
        hold: 1.4,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.12, 0.6, 0.6] }, to: { at: 'vegeta', local: [0.1, 0.62, 0.48] }, look: { at: 'vegeta:head', off: [0, 0.03, 0] }, fov: 26 },
        say: { who: 'vegeta', line: 'There\'s one thing a Saiyan always keeps...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // the held breath before it
      {
        cam: { from: { at: 'vegeta', local: [0.1, 0.62, 0.48] }, look: { at: 'vegeta:head', off: [0, 0.03, 0] }, fov: 24 },
        tick: (ctx) => ctx.b.camera.addTrauma(0.01),
        hold: 0.8,
      },
      // HIS PRIIIIIDE!!! — the lens thrown back by it, the ground answering
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta, b = ctx.b;
          const col = (v.form && v.form.aura && v.form.aura.color) || 0xffd23a;
          b.vfx.ring(v.chest(), 8, col, 0.6);
          b.vfx.flash(v.chest(), 2.4, col, 0.3, SL.Toon.tex.glow);
          for (let i = 0; i < 5; i++) b.vfx.bolt(v.chest().add(new V3(Math.sin(i * 1.3) * 0.8, i * 0.2 - 0.4, Math.cos(i * 1.3) * 0.8)), 1.4, 0xffe8a0);
          b.sfx('roar', v, { vol: 1.3, pitch: 0.9 });
          b.sfx('transformBurst', v, { vol: 1 });
        },
        pose: [{ who: 'vegeta', pose: 'v_prideRoar', face: 'shout', speed: 10, aura: 1 }],
        crack: { at: 'vegeta', radius: 4, depth: 0.2 },
        vfx: { kind: 'rocks', at: 'vegeta', count: 12, radius: 3.5 },
        cam: { from: { at: 'vegeta', local: [0.5, 0.3, 1.2] }, to: { at: 'vegeta', local: [2.6, -0.6, 6.5] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 34, fov2: 48, ease: 'outCubic' },
        say: { who: 'vegeta', line: 'His PRIIIIIIDE!!!', duration: 3.2, style: 'shout' },
        tick: (ctx, t) => {
          if (ctx.burn) ctx.burn.set(Math.max(0, 1 - t / 1.4));
          ctx.b.camera.addTrauma(0.05 * Math.max(0, 1 - t / 2.4));
          if (ctx.b.frame % 5 === 0) ctx.b.vfx.streamInward(ctx.cast.vegeta.chest(), 4, 0xffe8a0, 2, 0.18, 0.35);
        },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'goku', local: [-0.4, 0.35, 1.6] }, look: { at: 'goku:head', off: [0, 0.06, 0] }, fov: 36 },
        say: { who: 'babidi', line: 'Aaagh! H-he threw me out?!', duration: 1.8, style: 'quiet' },
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 4 }],
        hold: 1.6,
      },
    ],
    end(ctx) {
      if (ctx.burn) {
        ctx.burn.dispose();
        ctx.burn = null;
      }
      ctx.b.stage.setMood(0, 0x1a0408, 0.6);
      ctx.m.flags.prideDeclared = true;
    },
  };

  S.pride_fists = {
    id: 'pride_fists',
    cast,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'g2_stance', face: 'grit' },
          { who: 'vegeta', pose: 'v_majinStance', face: 'grin' },
        ],
        music: { song: 'finale', level: 5 },
        cam: { from: { at: 'goku', local: [7, 1.8, 7] }, look: { at: 'goku', local: [0, 1, 7] }, fov: 44 },
        sfx: { name: 'kiUp', who: 'goku', pitch: 0.6 },
        hold: 1.2,
      },
      {
        pose: [
          { who: 'goku', pose: 'punchWindR', face: 'shout', speed: 12 },
          { who: 'vegeta', pose: 'punchWindR', face: 'shout', speed: 12 },
        ],
        tick: (ctx, s) => {
          const g = ctx.cast.goku, v = ctx.cast.vegeta;
          const mid = ctx.m.flags.fistPoint;
          if (!mid) return;
          const k = U.clamp01(s / 0.45);
          for (const [f, from] of [[g, ctx.m.flags.fistFromG], [v, ctx.m.flags.fistFromV]]) {
            const to = mid.clone().add(from.clone().sub(mid).setY(0).normalize().multiplyScalar(0.85));
            const p = from.clone().lerp(to, k * k);
            f.setPosition(p);
            if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(f.chest(), 0xffe07a, 0.5, 0.2);
          }
        },
        cam: { from: { at: 'goku', local: [4.5, 1, 4] }, look: { at: 'goku', local: [0, 0.2, 6] }, fov: 50 },
        hold: 0.5,
      },
      {
        pose: [
          { who: 'goku', pose: 'punchR', face: 'shout' },
          { who: 'vegeta', pose: 'punchR', face: 'shout' },
        ],
        call: (ctx) => {
          const b = ctx.b, mid = ctx.m.flags.fistPoint;
          const at = mid.clone().add(new V3(0, 1.2, 0));
          b.vfx.flash(at, 8, 0xffffff, 0.5, SL.Toon.tex.glow);
          b.vfx.ring(at, 18, 0xfff0c0, 0.8);
          b.vfx.ring(mid.clone().add(new V3(0, 0.2, 0)), 26, 0xffe07a, 1, new V3(0, 1, 0));
          b.vfx.explosion(at, 5, 0xfff0c0, { smoke: false });
          b.stage.crater(mid, 9, 1.4, null);
          // the land answers: towers near them come down, and the ground heaves
          b.stage.explode(at, 34, 2e5, true, null);
          SL.Cinema.vfx(ctx, { kind: 'rocks', at: [mid.x, mid.y, mid.z], radius: 10, count: 16, lift: 12 });
          b.vfx.dust(mid.clone().add(new V3(0, 0.5, 0)), 10, 30, b.stage.def.terrain.sand);
        },
        screen: { flash: 0.9, color: '#ffffff' },
        sfx: { name: 'explosionHuge', vol: 1.3, pitch: 0.8 },
        shake: { at: [0, 1, 0], amount: 1 },
        slow: { scale: 0.22, seconds: 1.6 },
        cam: { from: { at: 'goku', local: [1.6, 0.3, 0.4] }, look: { at: 'goku', local: [0, 0.35, 0.9] }, fov: 34 },
        hold: 1.8,
      },
      {
        damage: { who: ['goku', 'vegeta'], level: 2, burst: true },
        tick: (ctx, s) => {
          // the recoil pushes them apart across the new crater
          const g = ctx.cast.goku, v = ctx.cast.vegeta, mid = ctx.m.flags.fistPoint;
          const k = U.clamp01(s / 0.8);
          for (const f of [g, v]) {
            const away = f.pos.clone().sub(mid).setY(0).normalize();
            const to = mid.clone().addScaledVector(away, 1 + 6 * (1 - (1 - k) * (1 - k)));
            to.y = ctx.b.stage.heightAt(to.x, to.z);
            f.setPosition(to);
          }
        },
        pose: [
          { who: 'goku', pose: 'land', face: 'grit' },
          { who: 'vegeta', pose: 'land', face: 'grin' },
        ],
        cam: { from: { at: 'goku', local: [12, 7, 7] }, look: { at: 'goku', local: [0, 0, 7] }, fov: 50 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_majinStance', face: 'grin' }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.25, 2.2] }, look: { at: 'vegeta', off: [0, 0.55, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'YES! THIS! This is what I was waiting for!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.fists = true;
      for (const f of [ctx.cast.goku, ctx.cast.vegeta]) if ((f.damageLevel || 0) < 2) f.setDamage(2);
    },
    clearMood: false,
  };

  S.pride_galick = {
    id: 'pride_galick',
    cast,
    events: [
      {
        pose: [{ who: 'vegeta', pose: 'v_galickCharge', face: 'shout', speed: 8 }],
        sfx: { name: 'kiCharge', who: 'vegeta', pitch: 0.7, vol: 1 },
        vfx: { kind: 'stream', at: { at: 'vegeta' }, radius: 4, color: 0xd070ff, count: 10 },
        mood: { amount: 0.4, color: 0x1a0a2a, seconds: 1 },
        cam: { from: { at: 'vegeta', local: [1.6, -0.6, 3.2] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Take it, Kakarot! Everything I have!', duration: 3, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'goku', pose: 'g_kameCharge', face: 'grit', speed: 8 }],
        cam: { from: { at: 'goku', local: [-1.2, 0.3, 2.6] }, look: { at: 'vegeta', off: [0, 0, 0] }, fov: 46 },
        say: { who: 'goku', line: "If that's how it has to be...", duration: 2.4, style: 'quiet' },
        hold: 2.2,
      },
    ],
    clearMood: false,
  };

  S.pride_blast = {
    id: 'pride_blast',
    cast,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b, mid = ctx.cast.goku.chest().lerp(ctx.cast.vegeta.chest(), 0.5);
          b.vfx.explosion(mid, 22, 0xfff0d0, { smoke: true });
          b.vfx.flash(mid, 30, 0xffffff, 0.8, SL.Toon.tex.glow);
          ctx.m.flags.blastPoint = mid;
        },
        screen: { flash: 1, color: '#ffffff' },
        sfx: { name: 'explosionHuge', vol: 1.4, pitch: 0.5 },
        shake: { at: { at: 'goku' }, amount: 1 },
        slow: { scale: 0.3, seconds: 1.4 },
        cam: { from: { at: 'goku', off: [40, 18, 40] }, look: { at: 'goku', off: [0, 2, 0] }, fov: 56 },
        hold: 2.4,
      },
      {
        music: { song: null, level: 0 },
        sfx: { name: 'tinnitus', vol: 0.6 },
        fade: { to: 'black', seconds: 0.8 },
        hold: 1.2,
      },
    ],
    clearMood: false,
  };

  S.pride_siphon = {
    id: 'pride_siphon',
    cast,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'exhausted', face: 'hurt' },
          { who: 'vegeta', pose: 'exhausted', face: 'grit' },
        ],
        damage: { who: ['goku', 'vegeta'], level: 3 },
        call: (ctx) => ctx.b.stage.clearMood(1),
        cam: { from: { at: 'goku', local: [9, 1.7, 5] }, look: { at: 'goku', local: [0, 0.2, 5] }, fov: 42 },
        hold: 2.6,
      },
      {
        // their energy leaves them, and goes somewhere
        tick: (ctx, s) => {
          const b = ctx.b, far = ctx.m.flags.horizon;
          if (!far || b.frame % 3 !== 0) return;
          for (const f of [ctx.cast.goku, ctx.cast.vegeta]) {
            b.vfx.trail(f.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(0, 0.8), U.rand(-0.4, 0.4))), 0xff7ac8, 0.4, 0.5);
            const p = f.chest().lerp(far, (s * 0.25 + (b.frame % 30) / 30) % 1);
            b.vfx.trail(p, 0xff7ac8, 0.6, 0.4);
          }
        },
        cam: { from: { at: 'goku', local: [2.2, 0.8, 2.4] }, look: { at: 'goku', off: [0, 1.2, 0] }, fov: 44 },
        say: { who: 'goku', line: "My energy... it's being pulled out of me. Somewhere over there.", duration: 3.8 },
        hold: 4,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.9, 0.3, 2.2] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Babidi. He has been feeding our fight to his egg the whole time.', duration: 3.8 },
        hold: 4,
      },
      {
        cam: { from: { at: 'goku', local: [0.8, 0.4, 2.2] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'goku', line: "And you don't care?", duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'vegeta:face', local: [0.2, -0.04, 1.1] }, look: { at: 'vegeta:head' }, fov: 30 },
        say: { who: 'vegeta', line: 'I care about one thing.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        call: (ctx) => {
          const b = ctx.b, far = ctx.m.flags.horizon;
          if (!far) return;
          for (let i = 0; i < 6; i++) b.vfx.flash(far.clone().add(new V3(0, i * 18, 0)), 30 - i * 3, 0xff7ac8, 1.4, SL.Toon.tex.glow);
          b.vfx.explosion(far, 30, 0xff9ad0, { smoke: true });
        },
        mood: { amount: 0.35, color: 0x3a1030, seconds: 1.2 },
        sfx: { name: 'rumble', vol: 1.2, pitch: 0.6 },
        shake: { at: { at: 'goku' }, amount: 0.5 },
        pose: [
          { who: 'goku', pose: 'idle', face: 'shock' },
          { who: 'vegeta', pose: 'idle', face: 'shock' },
        ],
        cam: { from: { at: 'goku', local: [0.9, 0.7, -2.6] }, look: [120, 30, -420], fov: 56 },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku:face', local: [0.1, -0.03, 1.05] }, look: { at: 'goku:head' }, fov: 30 },
        say: { who: 'goku', line: "Vegeta... that's not Babidi. That's what was in the egg.", duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.buuAwake = true;
      // watched or skipped, the fight ends with both of them in rags
      for (const f of [ctx.cast.goku, ctx.cast.vegeta]) if ((f.damageLevel || 0) < 3) f.setDamage(3);
    },
    clearMood: false,
  };
})();
