/*
 * SCENES — CHAPTER 17 · RESURRECTION OF F, "Three Minutes" (rof_finale.js). Data for SL.Cinema.
 *
 *   rof_finale_confront  from "Blue and Gold"'s last picture: Vegeta in front of the spent Golden Frieza; "Krillin — the
 *                        senzu beans": Krillin feeds Goku, who sits up and stands, healed; Gohan takes one to Piccolo,
 *                        who was left down after the beam (never dead) and gets up; Frieza sneers; Vegeta steps forward
 *   rof_finale_after     Frieza gone; Vegeta furious that Kakarot took his kill; Krillin and Goku explain Whis' three
 *                        minutes; Goku's offer to train together, scoffed at; Whis' last word
 *
 * Dialogue: original lines in the characters' voices (the reference's supplied lines paraphrased).
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const K = () => SL.data.buuKit;
  const cast = (m) => SL.data.brolyKit.cast(m);
  const R = () => SL.data.rofFinale;

  S.rof_finale_confront = {
    id: 'rof_finale_confront',
    cast,
    music: { song: 'battle', level: 1 },
    auraCap: 0,
    events: [
      {
        cam: { subject: 'vegeta', with: 'frieza', focus: 'full', angle: 'side' },
        title: { chapter: 'CHAPTER 17 · RESURRECTION OF F', title: 'THREE MINUTES', subtitle: 'Vegeta takes the field', duration: 3.6 },
        say: { who: 'frieza', line: 'Vegeta. You want to die in Son Goku\'s place?', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'Krillin! The senzu beans — one for Kakarot, one for Piccolo. Now!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      // Krillin feeds Goku; Goku sits up, then stands
      {
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'determined' }, { who: 'goku', pose: 'g_kneelOpen', face: 'hurt', speed: 5 }],
        cam: { subject: 'goku', with: 'krillin', focus: 'full', angle: 'three' },
        say: { who: 'krillin', line: 'Here, Goku — eat it. Come on!', duration: 2.4 },
        hold: 2.5,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          g.hp = g.hpMax;
          ctx.b.vfx.flash(g.chest(), 1.6, 0xb8ffb0, 0.4, SL.Toon.tex.glow);
          ctx.b.vfx.sparks(g.chest(), 0xd8ffd0, 10, 3, 0.08);
          K().place(g, K().ground(ctx.b, new V3(-5, 0, -6.5)), 0);
          K().place(ctx.cast.krillin, K().ground(ctx.b, new V3(-6.6, 0, -7.4)), 0);
          K().faceTo(g, ctx.cast.frieza.pos);
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'determined' }, { who: 'krillin', pose: 'idle', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Thanks, Krillin. Whew... that was close.', duration: 2.4 },
        hold: 2.5,
      },
      // Gohan takes a bean to Piccolo, who comes round and gets up
      {
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'determined' }],
        cam: { subject: 'gohan', with: 'piccolo', focus: 'full', angle: 'three' },
        say: { who: 'gohan', line: 'Mister Piccolo, here — eat this!', duration: 2.2 },
        hold: 2.3,
      },
      {
        call: (ctx) => {
          const p = ctx.cast.piccolo;
          p.hp = p.hpMax;
          ctx.b.vfx.flash(p.chest(), 1.6, 0xb8ffb0, 0.4, SL.Toon.tex.glow);
        },
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'serious' }, { who: 'gohan', pose: 'idle', face: 'grin' }],
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: '...I\'m fine, Gohan. Watch Frieza, not me.', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { subject: 'frieza', focus: 'upper', angle: 'three' },
        say: { who: 'frieza', line: 'Beans. How quaint. Nothing you feed them changes what happens next.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cold' }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'Kakarot let you live. I am not Kakarot.', duration: 2.8 },
        hold: 2.9,
      },
    ],
    end(ctx) {
      R().healed(ctx.b);
      const v = ctx.cast.vegeta, f = ctx.cast.frieza;
      K().place(v, K().ground(ctx.b, new V3(0, 0, -2)), 0);
      K().faceTo(v, f.pos);
      K().watcher(v, 'idle', 'cold');
      ctx.m.flags.healed = true;
    },
  };

  S.rof_finale_after = {
    id: 'rof_finale_after',
    cast,
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        call: (ctx) => {
          K().faceTo(ctx.cast.vegeta, ctx.cast.goku.pos);
          K().faceTo(ctx.cast.goku, ctx.cast.vegeta.pos);
        },
        cam: { subject: 'vegeta', with: 'goku', focus: 'full', angle: 'side' },
        say: { who: 'vegeta', line: 'KAKAROT! That was MY kill — I had him on his knees!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
      {
        pose: [{ who: 'goku', pose: 'g_neckRub', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Sorry, Vegeta. You kinda... blew up. With the whole Earth. Whis turned back time three minutes.', duration: 4.2 },
        hold: 4.3,
      },
      {
        cam: { subject: 'krillin', focus: 'upper', angle: 'three' },
        say: { who: 'krillin', line: 'It\'s true! Frieza punched the planet and everything just — went white!', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...Tch.', duration: 1.4 },
        hold: 1.5,
      },
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Hey — next time, how about we train together? We\'d be way stronger as a team!', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cocky' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'Train with you? Don\'t make me laugh. Next time, I finish it myself.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'whis', pose: 'w_laugh', face: 'calm' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'Two Saiyans, one lesson, and still neither of you learned it. Shall we go? Lord Beerus is waiting for dessert.', duration: 4.4 },
        hold: 4.5,
      },
    ],
    end(ctx) {
      ctx.m.flags.after = true;
    },
  };
})();
