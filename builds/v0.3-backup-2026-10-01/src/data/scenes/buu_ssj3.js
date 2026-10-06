/*
 * SCENES — Chapter 11: Goku buys time.
 *
 *   ssj3_city     Babidi's voice over a city; Buu above the square, turning people into sweets;
 *                 a building comes down; and Goku is suddenly standing in the square
 *   ssj3_offer    "Let me show you something I have been saving"
 *   ssj3_limit    the third level has a price in this body; he tells Buu to wait, and goes
 *   ssj3_babidi   the wizard shouts at the wrong creature
 *
 * Paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;
  const K = () => SL.data.buuKit;
  const cast = (m) => m.battle.story;

  S.ssj3_city = {
    id: 'ssj3_city',
    cast,
    music: { song: null, level: 0 },
    events: [
      {
        mood: { amount: 0.4, color: 0x2a1030, seconds: 1.5 },
        pose: [{ who: 'buu', pose: 'bu_idle', face: 'grin' }],
        sfx: { name: 'magic', vol: 0.9 },
        cam: { from: [0, 30, 60], to: [0, 24, 48], look: [0, 6, 0], fov: 52, fov2: 48 },
        say: { who: 'babidi', line: 'People of Earth! Somewhere among you are two boys, Trunks and Goten. Bring them to me — or your cities disappear one by one!', duration: 5, style: 'shout' },
        hold: 5.2,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_candy', face: 'grin' }],
        call: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu;
          for (const c of ctx.b.story.civilians) {
            SL.Cinema.vfx(ctx, { kind: 'beamLine', at: { at: 'buu:head' }, to: [c.chest().x, c.chest().y, c.chest().z], color: 0xff6ac4, size: 0.25, steps: 14 });
            if (c.model.setStone) c.model.setStone(true, 'candy');
            b.vfx.sparks(c.chest(), 0xff8ac4, 10, 6, 0.1);
          }
          ctx.m.flags.candyPeople = ctx.b.story.civilians.length;
          K().faceTo(buu, ctx.b.story.civilians[0].pos);
        },
        sfx: { name: 'candyPop', vol: 1.2 },
        cam: { from: { at: 'buu', local: [2.6, 0.2, 4.2] }, look: { at: 'buu', off: [0, -1.5, 0] }, fov: 46 },
        hold: 2.4,
      },
      {
        cam: { from: [8, 3, 18], look: [2, 1, 8], fov: 44 },
        say: { who: 'majin_buu', line: 'Hee hee! Candy!', duration: 2 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const b = ctx.b, o = ctx.b.story.tower;
          if (o && o.alive) b.stage.destroyPillar(o);
        },
        pose: [{ who: 'buu', pose: 'bu_ball', face: 'grin' }],
        shake: { at: [0, 1, 0], amount: 0.7 },
        sfx: { name: 'explosionBig', vol: 1.2 },
        cam: { from: [-6, 6, 30], look: { at: 'buu', off: [0, -2, -20] }, fov: 54 },
        hold: 2.6,
      },
      {
        // he is just there
        call: (ctx) => {
          const b = ctx.b, g = ctx.cast.goku;
          g.setHidden(false);
          b.vfx.flash(g.chest(), 2.5, 0xffffff, 0.3, SL.Toon.tex.glow);
          b.vfx.ring(g.chest(), 2.2, 0xffe25a, 0.3);
        },
        sfx: { name: 'teleport', vol: 1 },
        pose: [{ who: 'goku', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'goku', local: [0.9, 0.4, 3.2] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Hey. Down here. Leave the city out of it.', duration: 3.2 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'babidi', pose: 'bb_cackle', face: 'grin' }],
        cam: { from: { at: 'babidi', local: [0.7, 0.3, 2.3] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'babidi', line: 'Goku?! Vegeta did not finish you? Buu — make up for it!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
    ],
    end(ctx) {
      const S = ctx.b.story;
      S.goku.setHidden(false);
      for (const c of S.civilians) if (c.model.setStone) c.model.setStone(true, 'candy');
      ctx.m.flags.candyPeople = S.civilians.length;
      if (S.tower && S.tower.alive) ctx.b.stage.destroyPillar(S.tower, { quiet: true });
      ctx.m.flags.cityOpen = true;
    },
    clearMood: false,
  };

  S.ssj3_offer = {
    id: 'ssj3_offer',
    cast,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'calm' },
          { who: 'buu', pose: 'bu_idle', face: 'grin' },
        ],
        cam: { from: { at: 'goku', local: [0.9, 0.4, 2.6] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'goku', line: "You're strong, Buu. So let me show you something I've been saving.", duration: 3.8 },
        hold: 4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_bellyPat', face: 'grin' }],
        cam: { from: { at: 'buu', local: [0.6, 0.3, 2.6] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'Ooh! Show Buu!', duration: 2 },
        hold: 2.2,
      },
    ],
    clearMood: false,
  };

  S.ssj3_limit = {
    id: 'ssj3_limit',
    cast,
    events: [
      {
        pose: [{ who: 'goku', pose: 'exhausted', face: 'hurt' }],
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (g.formIndex !== 0) g.applyForm(0);
          ctx.b.vfx.flash(g.chest(), 3, 0xffe25a, 0.3, SL.Toon.tex.glow);
        },
        sfx: { name: 'kiUp', who: 'goku', pitch: 0.5 },
        cam: { from: { at: 'goku', local: [0.9, 0.3, 2.4] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'goku', line: "Huff... that eats up more than I thought. This body won't hold it for long.", duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_sulk', face: 'angry' }],
        cam: { from: { at: 'buu', local: [0.6, 0.3, 2.4] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'More! Buu wants more!', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'smirk' }],
        cam: { from: { at: 'goku', local: [0.8, 0.35, 2.2] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'goku', line: 'Wait for it. Somebody is coming who will beat you. Be patient.', duration: 3.6 },
        hold: 3.8,
      },
      {
        call: (ctx) => {
          const b = ctx.b, g = ctx.cast.goku;
          b.vfx.flash(g.chest(), 2.5, 0xffffff, 0.3, SL.Toon.tex.glow);
          g.setHidden(true);
        },
        sfx: { name: 'teleport', vol: 1 },
        cam: { from: { at: 'buu', local: [-1.4, 0.6, 4] }, look: { at: 'buu', off: [0, 0.3, 0] }, fov: 44 },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goku;
      if (g.formIndex !== 0) g.applyForm(0);
      g.setHidden(true);
      ctx.m.flags.gokuLeft = true;
    },
    clearMood: false,
  };

  /** The wizard shouts at the wrong creature. The cut hides it; the silence does not. */
  S.ssj3_babidi = {
    id: 'ssj3_babidi',
    cast,
    events: [
      {
        place: { who: 'babidi', at: 'buu', off: [2.4, 0, 1.2], face: 'buu' },
        pose: [{ who: 'babidi', pose: 'bb_cast', face: 'angry' }],
        cam: { from: { at: 'babidi', local: [1, 0.3, 2.6] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'babidi', line: 'You idiot! You let him walk away! Do that again and I will seal you back in that ball!', duration: 4.2, style: 'shout' },
        hold: 4.4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_angry', face: 'angry' }],
        tick: (ctx) => {
          const b = ctx.b, buu = ctx.cast.buu;
          if (b.frame % 4 === 0) b.vfx.dust(buu.headPos().add(new V3(0, 0.2, 0)), 0.7, 3, 0xf8f0f4);
        },
        music: { song: null, level: 0 },
        cam: { from: { at: 'buu:face', local: [0.1, -0.05, 1.2] }, look: { at: 'buu:head' }, fov: 32 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const b = ctx.b, bb = ctx.cast.babidi;
          b.vfx.impact(bb.chest(), 4, 0xffffff);
          b.vfx.explosion(bb.chest(), 2, 0xffd0e8, { smoke: true });
          bb.setHidden(true);
          ctx.m.flags.babidiDead = true;
        },
        pose: [{ who: 'buu', pose: 'bu_slap', face: 'angry' }],
        screen: { flash: 0.7 },
        sfx: { name: 'punchHeavy', vol: 1.3, pitch: 0.6 },
        cam: { from: { at: 'buu', local: [-3, 1.4, 4.5] }, look: { at: 'buu', off: [1.4, 0.2, 0] }, fov: 46 },
        hold: 1.2,
      },
      {
        sfx: { name: 'tinnitus', vol: 0.5 },
        cam: { from: { at: 'buu', local: [0.7, 0.2, 2.6] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_laugh', face: 'grin' }],
        cam: { from: { at: 'buu', local: [0.8, 0.3, 2.4] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'No more wizard. Now Buu does what Buu wants.', duration: 3.2 },
        hold: 3.4,
      },
    ],
    end(ctx) {
      ctx.cast.babidi.setHidden(true);
      ctx.m.flags.babidiDead = true;
    },
    clearMood: false,
  };
})();
