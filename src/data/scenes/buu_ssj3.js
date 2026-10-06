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
  const toForm = (ctx, id) => {
    const g = ctx.cast.goku, i = g.def.forms.findIndex((x) => x.id === id);
    if (i >= 0 && g.formIndex !== i) {
      g.applyForm(i);
      ctx.b.vfx.flash(g.chest(), 2.4, 0xffe25a, 0.25, SL.Toon.tex.glow);
      ctx.b.vfx.ring(g.chest(), 3, 0xfff3a0, 0.4, new V3(0, 1, 0));
    }
  };

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
        call: (ctx) => K().faceTo(ctx.cast.babidi, ctx.cast.goku.pos),
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

  // Super Saiyan 3 (the owner's brief, 2026-10-02): the power stance in mid-air, head down, fists at the hips...
  SL.data.poses.g3_stanceDown = (t) => ({
    hands: ['fist', 'fist'],
    root: { y: -0.1 + Math.sin(t * 1.6) * 0.01, rx: 8 }, spine: [10, 0, 0], chest: [8, 0, 0], neck: [14, 0, 0], head: [30, 0, 0],
    shoulderL: [10, 0, 26], elbowL: [-70, 0, 0], shoulderR: [10, 0, -26], elbowR: [-70, 0, 0],
    thighL: [-36, 0, 24], kneeL: [52, 0, 0], footL: [-10, 0, -10], thighR: [-36, 0, -24], kneeR: [52, 0, 0], footR: [-10, 0, 10],
  });
  // ...and the head coming slowly back up, teeth clenched
  SL.data.poses.g3_stanceUp = (t) => ({
    hands: ['fist', 'fist'],
    root: { y: -0.1, rx: 4 }, spine: [6, 0, 0], chest: [4 + Math.sin(t * 40) * 0.8, 0, 0], neck: [2, 0, 0], head: [-4, 0, 0],
    shoulderL: [10, 0, 26], elbowL: [-70, 0, 0], shoulderR: [10, 0, -26], elbowR: [-70, 0, 0],
    thighL: [-36, 0, 24], kneeL: [52, 0, 0], footL: [-10, 0, -10], thighR: [-36, 0, -24], kneeR: [52, 0, 0], footR: [-10, 0, 10],
  });
  // after it: hovering, chest heaving, arms loose
  SL.data.poses.g3_pant = (t) => ({
    hands: ['fist', 'fist'],
    root: { y: Math.sin(t * 1.4) * 0.02, rx: 4 }, spine: [4 + Math.sin(t * 4) * 2, 0, 0], chest: [2 + Math.sin(t * 4) * 3, 0, 0], head: [6, 0, 0],
    shoulderL: [-8, 0, 16], elbowL: [-28, 0, 0], shoulderR: [-8, 0, -16], elbowR: [-28, 0, 0],
    thighL: [-6, 0, 6], kneeL: [26, 0, 0], footL: [34, 0, 0], thighR: [-2, 0, -6], kneeR: [34, 0, 0], footR: [40, 0, 0],
  });
  // Babidi, both hands over his ears, leaning back against the wind
  SL.data.poses.bb_cower = (t) => ({
    hands: ['open', 'open'],
    root: { y: -0.04, rx: -14 + Math.sin(t * 20) * 2 }, spine: [-10, 0, 0], chest: [-8, 0, 0], head: [10, Math.sin(t * 24) * 6, 0],
    shoulderL: [-120, 0, 70], elbowL: [-120, 0, 0], shoulderR: [-120, 0, -70], elbowR: [-120, 0, 0],
    thighL: [-16, 0, 12], kneeL: [26, 0, 0], thighR: [-6, 0, -12], kneeR: [20, 0, 0],
  });
  // Buu, the grin gone, both hands up in front of his face against the light
  SL.data.poses.bu_shield = (t) => ({
    hands: ['open', 'open'],
    root: { y: -0.02, rx: -6 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [8, 0, 0],
    shoulderL: [-110, -30, 20], elbowL: [-80, 0, 0], shoulderR: [-110, 30, -20], elbowR: [-80, 0, 0],
    thighL: [-10, 0, 10], kneeL: [16, 0, 0], thighR: [-6, 0, -10], kneeR: [14, 0, 0],
  });

  /**
   * The demonstrations, in mid-air over the square: a Super Saiyan, a Super Saiyan 2, the wizard
   * mocking it, and then the stance — "Just wait..." — and the line, one shot per piece of it.
   */
  S.ssj3_offer = {
    id: 'ssj3_offer',
    cast,
    events: [
      {
        // he starts from nothing: base form, then each level in turn
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (g.formIndex !== 0) g.applyForm(0);
        },
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
        cam: { from: { at: 'buu', local: [0.7, 0.75, 3.4] }, look: { at: 'buu:head', off: [0, -0.25, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'Ooh! Show Buu!', duration: 2 },
        hold: 2.2,
      },
      // a Super Saiyan: knees bent a little, a soft yell, and the gold
      {
        call: (ctx) => toForm(ctx, 'ssj'),
        pose: [{ who: 'goku', pose: 'g_ssjClench', face: 'grit', speed: 8 }],
        sfx: { name: 'ssjRise', who: 'goku', vol: 0.9 },
        cam: { from: { at: 'goku', local: [1.4, 0.3, 3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 42 },
        hold: 1.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.8, 0.4, 2.2] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'goku', line: 'This is a Super Saiyan.', duration: 2.2 },
        hold: 2.4,
      },
      // ...arms in to his sides, the hair sharper, one bang down, and the blue lightning
      {
        call: (ctx) => {
          toForm(ctx, 'ssj2');
          const g = ctx.cast.goku;
          for (let i = 0; i < 4; i++) ctx.b.vfx.bolt(g.chest().add(new V3(Math.sin(i * 2) * 0.7, i * 0.3 - 0.4, Math.cos(i * 2) * 0.7)), 1.2, 0xbfe4ff);
        },
        pose: [{ who: 'goku', pose: 'g_ssjClench', face: 'shout', speed: 10 }],
        sfx: { name: 'lightning', who: 'goku', vol: 1 },
        cam: { from: { at: 'goku', local: [-1.4, 0.3, 3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 42 },
        hold: 1.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 6 }],
        cam: { from: { at: 'goku', local: [0.8, 0.4, 2.2] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'goku', line: 'And this... is what is known as a Super Saiyan that has ascended past a Super Saiyan. Or, you can just call this Super Saiyan 2.', duration: 5.4 },
        hold: 5.6,
      },
      // the wizard is not impressed
      {
        call: (ctx) => K().faceTo(ctx.cast.babidi, ctx.cast.goku.pos),
        pose: [{ who: 'babidi', pose: 'bb_cackle', face: 'grin', speed: 6 }],
        cam: { from: { at: 'babidi', local: [0.5, 0.3, 1.8] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 38 },
        say: { who: 'babidi', line: 'Hmph! What a useless transformation! All you did was change your hair a little bit!', duration: 3.6 },
        hold: 3.8,
      },
      // the hands down to the hips, fists, a heavy stance in the air, the head down; the lightning stops
      {
        call: (ctx) => SL.Music.stop && SL.Music.stop(0.8),
        pose: [{ who: 'goku', pose: 'g3_stanceDown', face: 'grit', speed: 4, aura: 0.15 }],
        sfx: { name: 'rumble', vol: 0.35, pitch: 0.5 },
        cam: { from: { at: 'goku', local: [1.1, 0.1, 2.6] }, to: { at: 'goku', local: [0.9, 0.05, 2.2] }, look: { at: 'goku', off: [0, 0.25, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Just wait...', duration: 2, style: 'quiet' },
        hold: 2.4,
      },
      {
        call: (ctx) => K().faceTo(ctx.cast.babidi, ctx.cast.goku.pos),
        pose: [{ who: 'babidi', pose: 'bb_idle', face: 'shock', speed: 6 }],
        cam: { from: { at: 'babidi', local: [0.4, 0.3, 1.6] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 36 },
        say: { who: 'babidi', line: 'Has he lost his mind?!', duration: 1.8, style: 'shout' },
        hold: 2,
      },
      // "And this..." — the head coming up, the sky going dark behind him
      {
        call: (ctx) => ctx.b.stage.setMood(0.45, 0x1a1030, 2),
        pose: [{ who: 'goku', pose: 'g3_stanceUp', face: 'grit', speed: 2 }],
        cam: { from: { at: 'goku', local: [0, 0.35, 2.4] }, to: { at: 'goku', local: [0, 0.4, 1.9] }, look: { at: 'goku:head', off: [0, 0.05, 0] }, fov: 38 },
        say: { who: 'goku', line: 'And this...', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      // "...is to go..." — right in on his face; the frame shakes under a sound too low to hear
      {
        call: (ctx) => ctx.b.sfx('rumble', null, { vol: 0.9, pitch: 0.4, dur: 2 }),
        cam: { from: { at: 'goku', local: [0.08, 0.5, 1.15] }, to: { at: 'goku', local: [0.06, 0.5, 0.95] }, look: { at: 'goku:head', off: [0, 0.12, 0] }, fov: 30 },
        tick: (ctx) => ctx.b.camera.addTrauma(0.06),
        say: { who: 'goku', line: '...is to go...', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      // "...EVEN FURTHER BEYOND!" — eyes open, two voices at once
      {
        pose: [{ who: 'goku', pose: 'g3_stanceUp', face: 'shout', speed: 10, aura: 0.6 }],
        sfx: { name: 'kiUp', who: 'goku', vol: 1.2, pitch: 0.6 },
        cam: { from: { at: 'goku', local: [0.25, 0.4, 1.6] }, look: { at: 'goku:head', off: [0, 0.05, 0] }, fov: 34 },
        tick: (ctx) => ctx.b.camera.addTrauma(0.1),
        say: { who: 'goku', line: '...EVEN FURTHER BEYOND!', duration: 2.2, style: 'dual' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      // watched or skipped: he goes into the hold as a Super Saiyan 2, in the stance
      toForm(ctx, 'ssj2');
      ctx.m.flags.ssj3Levels = true;
    },
    clearMood: false,
  };

  /** After the third level lands: the silence, the wizard shaking, and Goku, out of breath. */
  S.ssj3_unveil = {
    id: 'ssj3_unveil',
    cast,
    music: { song: null, level: 0 },
    events: [
      // the wind stops; only the lightning
      {
        pose: [{ who: 'goku', pose: 'g3_pant', face: 'calm', speed: 3 }],
        sfx: { name: 'lightning', who: 'goku', vol: 0.4, pitch: 1.3 },
        cam: { from: { at: 'goku', local: [1.6, -0.8, 3.6] }, to: { at: 'goku', local: [1.2, -0.6, 3] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 44 },
        hold: 2.6,
      },
      {
        call: (ctx) => K().faceTo(ctx.cast.babidi, ctx.cast.goku.pos),
        pose: [{ who: 'babidi', pose: 'bb_cower', face: 'shock', speed: 6 }],
        cam: { from: { at: 'babidi', local: [0.4, 0.3, 1.6] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 36 },
        say: { who: 'babidi', line: 'W-What... what is he?! What kind of monster are you?!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'g3_pant', face: 'calm', speed: 3 }],
        cam: { from: { at: 'goku', local: [0.5, 0.45, 2] }, to: { at: 'goku', local: [0.42, 0.42, 1.7] }, look: { at: 'goku:head', off: [0, 0.1, 0] }, fov: 36 },
        say: { who: 'goku', line: 'I\'m sorry it took so much longer than the others... but I haven\'t had much chance to practice this form.', duration: 4.8, style: 'quiet' },
        hold: 5,
      },
      {
        pose: [{ who: 'goku', pose: 'g2_stance', face: 'angry', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.15, 0.5, 1.3] }, look: { at: 'goku:head', off: [0, 0.1, 0] }, fov: 34 },
        say: { who: 'goku', line: 'This is what I call... Super Saiyan 3.', duration: 3, style: 'dual' },
        hold: 3.2,
      },
      {
        call: (ctx) => K().faceTo(ctx.cast.babidi, ctx.cast.goku.pos),
        pose: [{ who: 'babidi', pose: 'bb_cast', face: 'shock', speed: 8 }],
        cam: { from: { at: 'babidi', local: [0.5, 0.3, 1.8] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 38 },
        say: { who: 'babidi', line: 'S-Super Saiyan 3?! He\'s bluffing! He\'s gotta be bluffing! Buu, don\'t just stand there, destroy him!', duration: 4.2, style: 'shout' },
        hold: 4.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.ssj3Unveiled = true;
    },
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
