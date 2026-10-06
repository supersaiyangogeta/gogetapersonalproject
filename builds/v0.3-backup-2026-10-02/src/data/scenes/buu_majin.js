/*
 * SCENES — Chapter 10, Age 774: the mark, and what it costs.
 *
 *   majin_spell     the wizard reaches into a proud heart and finds the door already open
 *   majin_awake     what comes out: a Majin who will not take orders, only a fight
 *   majin_stands    the tournament again — and the blast into the people who came to watch
 *   majin_grab      Goku gets there in time: the second blast goes into the sky
 *   majin_second    Goku does not: a second section of the stands
 *   majin_agree     "Somewhere nobody else can get hurt."
 *
 * The chapter's turn is not a power-up, it is a decision: Vegeta is not possessed so much as
 * given permission, and the scenes are staged to make that the point. Dialogue is paraphrased
 * English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const cast = (m) => m.battle.story;

  S.majin_spell = {
    id: 'majin_spell',
    cast,
    music: { song: 'finale', level: 2 },
    events: [
      {
        pose: [
          { who: 'babidi', pose: 'bb_cast', face: 'grin' },
          { who: 'vegeta', pose: 'armsCrossed', face: 'grit' },
          { who: 'goku', pose: 'idle', face: 'calm' },
        ],
        mood: { amount: 0.3, color: 0x2a1030, seconds: 1.6 },
        sfx: { name: 'magic', who: 'babidi', vol: 0.8 },
        cam: { from: { at: 'goku', local: [-2.6, 1.4, -5.5] }, to: { at: 'goku', local: [-2.2, 1.2, -4.2] }, look: { at: 'babidi', off: [0, 0.6, 0] }, fov: 46, fov2: 40, ease: 'inOut' },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'babidi', local: [0.5, 0.35, 2.6] }, to: { at: 'babidi', local: [0.4, 0.3, 2.1] }, look: { at: 'babidi', off: [0, 0.35, 0] }, fov: 38, fov2: 34 },
        say: { who: 'babidi', line: 'Such a proud heart, and so much darkness in it. I only have to open the door.', duration: 4.4 },
        hold: 4.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_clutchHead', face: 'grit', speed: 8 }],
        sfx: { name: 'heartbeat', vol: 1 },
        vfx: { kind: 'ring', at: { at: 'vegeta:head' }, radius: 1.4, color: 0xff5ab4, life: 0.8, flat: false },
        shake: { at: { at: 'vegeta' }, amount: 0.35 },
        cam: { from: { at: 'vegeta', local: [0.5, -0.75, 1.9] }, to: { at: 'vegeta', local: [0.4, -0.7, 1.5] }, look: { at: 'vegeta:head' }, fov: 40, fov2: 34 },
        say: { who: 'vegeta', line: 'Get... out... of my head!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'goku', local: [0.8, 0.45, 2.6] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 40 },
        say: { who: 'goku', line: "Vegeta! Don't let him in!", duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'kai', pose: 'sk_point', face: 'grit' }],
        cam: { from: { at: 'kai', local: [0.9, 0.4, 2.4] }, look: { at: 'kai', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'supreme_kai', line: 'He is not forcing it. He is finding what is already there.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
    ],
    end(ctx) {
      ctx.m.flags.spellCast = true;
    },
    clearMood: false,
  };

  S.majin_awake = {
    id: 'majin_awake',
    cast,
    events: [
      {
        pose: [{ who: 'babidi', pose: 'bb_cackle', face: 'grin' }],
        cam: { from: { at: 'babidi', local: [0.7, 0.3, 2.4] }, look: { at: 'babidi', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'babidi', line: 'Majin Vegeta! Now — kill them. Kill every one of them!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_majinStance', face: 'grin' }],
        cam: { from: { at: 'vegeta', local: [0.9, -0.1, 2.3] }, look: { at: 'vegeta', off: [0, 0.55, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Be quiet, wizard. I have one fight left to settle, and it is not yours.', duration: 4.2 },
        hold: 4.4,
      },
      {
        place: { who: 'vegeta', at: 'vegeta', face: 'goku' },
        cam: { from: { at: 'vegeta', local: [0.9, 0.7, -2.6] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Kakarot. You and me. No rules, and no crowd for you to hold back for.', duration: 4 },
        hold: 4.2,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'goku', local: [0.8, 0.45, 2.4] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Not here, Vegeta.', duration: 2.2 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'vegeta', local: [1.2, 0.5, 2.8] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 42 },
        say: { who: 'vegeta', line: 'Wizard. Send us back to the tournament.', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [{ who: 'babidi', pose: 'bb_cast', face: 'grin' }],
        sfx: { name: 'magic', who: 'babidi' },
        cam: { from: { at: 'babidi', local: [0.6, 0.2, 2] }, look: { at: 'babidi', off: [0, 0.35, 0] }, fov: 38 },
        say: { who: 'babidi', line: 'Hee hee hee! Whatever my Majin wants!', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.awake = true;
    },
    clearMood: false,
  };

  /** The stands. The blast itself is staged in `call` against the stadium the stage built. */
  S.majin_stands = {
    id: 'majin_stands',
    cast,
    music: { song: 'battle', level: 1 },
    events: [
      {
        pose: [
          { who: 'vegeta', pose: 'v_majinStance', face: 'grin' },
          { who: 'goku', pose: 'idle', face: 'grit' },
        ],
        call: (ctx) => ctx.b.stage.cheer(0.8),
        cam: { from: [0, 22, -34], to: [8, 18, -30], look: [0, 2, 8], fov: 52, fov2: 48 },
        say: { who: 'announcer', line: "They're back! Two of the fighters just appeared on the ring out of nowhere!", duration: 3.2 },
        hold: 3.4,
      },
      {
        place: { who: 'vegeta', at: 'vegeta', face: [0, 3, 40] },
        cam: { from: { at: 'vegeta', local: [1.1, 0.3, 2.2] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Look at them, Kakarot. This is what you have been holding back for.', duration: 3.8 },
        hold: 4,
      },
      {
        pose: [
          { who: 'vegeta', pose: 'blastWind', face: 'grin', speed: 10 },
          { who: 'goku', pose: 'idle', face: 'shock' },
        ],
        sfx: { name: 'kiCharge', who: 'vegeta', pitch: 1.3 },
        vfx: { kind: 'flash', at: { at: 'vegeta', off: [0, 1.2, 0.8] }, size: 1.2, color: 0xffe07a },
        cam: { from: { at: 'goku', local: [0.6, 0.35, 1.9] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 36 },
        say: { who: 'goku', line: 'Vegeta — no!', duration: 1.2, style: 'shout' },
        hold: 1.3,
      },
      {
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta;
          const at = ctx.m.flags.standsA || new V3(0, 4, 36);
          b.vfx.flash(v.handPos('R'), 2, 0xffe07a, 0.3, SL.Toon.tex.glow);
          SL.Cinema.vfx(ctx, { kind: 'beamLine', at: { at: 'vegeta', off: [0, 1.2, 0.6] }, to: [at.x, at.y, at.z], color: 0xffe07a, size: 0.7, steps: 20 });
          b.vfx.explosion(at, 9, 0xffc060, { smoke: true });
          b.vfx.explosion(at.clone().add(new V3(3, 1, 0)), 6, 0xff9040, { smoke: true });
          b.stage.blastStands(at, 8);
          ctx.m.flags.firstBlast = true;
        },
        pose: [{ who: 'vegeta', pose: 'blastR', face: 'grin' }],
        screen: { flash: 0.85, color: '#ffe0b0' },
        sfx: { name: 'explosionHuge', vol: 1.3, pitch: 0.6 },
        shake: { at: { at: 'goku' }, amount: 1 },
        slow: { scale: 0.35, seconds: 1.2 },
        cam: { from: [-6, 9, -6], look: [0, 4, 36], fov: 50 },
        hold: 2.6,
      },
      {
        music: { song: null, level: 0 },
        sfx: { name: 'tinnitus', vol: 1 },
        pose: [{ who: 'goku', pose: 'idle', face: 'angry', speed: 2 }],
        cam: { from: { at: 'goku:face', local: [0.06, -0.02, 1.05] }, to: { at: 'goku:face', local: [0.04, -0.02, 0.8] }, look: { at: 'goku:head' }, fov: 30, fov2: 26 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'goku', local: [0.7, 0.4, 2.2] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'goku', line: 'They came here to watch a tournament.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    clearMood: false,
  };

  /** He got there: Goku's hand on his wrist, and the second blast goes up. */
  S.majin_grab = {
    id: 'majin_grab',
    cast,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'grab', face: 'angry' },
          { who: 'vegeta', pose: 'blastR', face: 'grit' },
        ],
        shake: { at: { at: 'vegeta' }, amount: 0.6 },
        sfx: { name: 'punchHeavy', who: 'goku' },
        cam: { from: { at: 'goku', local: [1.6, 0.5, 1.6] }, look: { at: 'vegeta', off: [0, 0.6, 0] }, fov: 40 },
        say: { who: 'goku', line: 'ENOUGH!', duration: 1.4, style: 'shout' },
        hold: 1.5,
      },
      {
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta;
          const top = v.chest().add(new V3(0, 60, 0));
          SL.Cinema.vfx(ctx, { kind: 'beamLine', at: { at: 'vegeta', off: [0, 1.4, 0] }, to: [top.x, top.y, top.z], color: 0xffe07a, size: 0.7, steps: 22 });
          b.vfx.explosion(top, 12, 0xffd080, { smoke: false });
        },
        screen: { flash: 0.6, color: '#fff0c0' },
        sfx: { name: 'explosionBig', vol: 1.1 },
        cam: { from: { at: 'goku', off: [3, 0.4, 4] }, look: { at: 'vegeta', off: [0, 8, 0] }, fov: 58 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_majinStance', face: 'smirk' }],
        cam: { from: { at: 'vegeta', local: [0.8, 0.45, 2] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'There. That look. That is the one I wanted.', duration: 3 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.savedStand = true;
    },
    clearMood: false,
  };

  /** Too late: a second section. */
  S.majin_second = {
    id: 'majin_second',
    cast,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b;
          const at = ctx.m.flags.standsB || new V3(36, 4, 6);
          SL.Cinema.vfx(ctx, { kind: 'beamLine', at: { at: 'vegeta', off: [0, 1.2, 0.6] }, to: [at.x, at.y, at.z], color: 0xffe07a, size: 0.7, steps: 20 });
          b.vfx.explosion(at, 9, 0xffc060, { smoke: true });
          b.stage.blastStands(at, 8);
        },
        pose: [{ who: 'vegeta', pose: 'blastR', face: 'grin' }],
        screen: { flash: 0.8, color: '#ffe0b0' },
        sfx: { name: 'explosionHuge', vol: 1.2, pitch: 0.6 },
        shake: { at: { at: 'goku' }, amount: 0.9 },
        cam: { from: { at: 'goku', local: [-1.4, 0.8, -3] }, look: [36, 4, 6], fov: 46 },
        hold: 2.4,
      },
      {
        music: { song: null, level: 0 },
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }],
        cam: { from: { at: 'goku:face', local: [0.05, -0.02, 1] }, look: { at: 'goku:head' }, fov: 28 },
        say: { who: 'goku', line: "That's twice, Vegeta.", duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.secondBlast = true;
    },
    clearMood: false,
  };

  S.majin_agree = {
    id: 'majin_agree',
    cast,
    events: [
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'angry' },
          { who: 'vegeta', pose: 'v_majinStance', face: 'smirk' },
        ],
        cam: { from: { at: 'goku', local: [0.7, 0.42, 2.1] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'goku', line: "Fine. You'll get the fight you paid for. Somewhere nobody else can get hurt.", duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.8, 0.45, 2.1] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'That is all I ever wanted.', duration: 2.6 },
        hold: 2.8,
      },
      {
        sfx: { name: 'magic', vol: 1 },
        cam: { from: [0, 16, -26], look: [0, 1.5, 0], fov: 46 },
        say: { who: 'babidi', line: 'Hee hee hee! Then go and play somewhere empty!', duration: 3 },
        hold: 3.2,
      },
    ],
    clearMood: false,
  };
})();
