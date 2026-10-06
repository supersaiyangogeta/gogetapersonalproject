/*
 * SCENES — the Room of Spirit and Time, Cell Saga (mission cell_chamber, 2026-10-01).
 *
 *   ch_enter   the door; Vegeta out, Goku and Gohan in; the white nothing and the weight of it
 *   ch_anger   "Think about why you fight"
 *   ch_gold    the first gold: his own hair, lifted and golden
 *   ch_calm    months later: Super Saiyan as ordinary as breathing; out through the door
 *
 * Dialogue is paraphrased English written for this project.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const K = () => SL.data.trunksKit;

  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos && s[k].setState) out[k] = s[k];
    return out;
  };
  const story = (ctx) => ctx.b.story;
  const pt = (ctx, name, v) => (ctx.cast[name] = { pos: v.clone() });
  const ground = (ctx, v, lift = 0) => K().ground(ctx.b, v, lift);
  const faceTo = (f, p) => K().faceTo(f, p);

  S.ch_enter = {
    id: 'ch_enter',
    cast,
    auraCap: 0.15,
    music: { song: 'vision', level: 1 },
    events: [
      // the door opens: Vegeta walks out, gold, bigger in the shoulders than he was
      {
        title: { chapter: 'CHAPTER 6 · CELL SAGA', title: 'THE ROOM OF SPIRIT AND TIME', subtitle: 'a year inside is a day outside', duration: 3.6 },
        call: (ctx) => {
          const st = story(ctx), Kt = K();
          Kt.place(st.vegeta, ground(ctx, new V3(-0.6, 0, -22.5)));
          Kt.place(st.trunks, ground(ctx, new V3(0.9, 0, -23)));
          Kt.place(st.goku, ground(ctx, new V3(-1.4, 0, -16)));
          Kt.place(st.gohan, ground(ctx, new V3(1.2, 0, -16)));
          faceTo(st.vegeta, st.goku.pos);
          faceTo(st.trunks, st.goku.pos);
          faceTo(st.goku, st.vegeta.pos);
          faceTo(st.gohan, st.vegeta.pos);
          pt(ctx, 'door', ground(ctx, new V3(0, 0, -24)));
        },
        pose: [
          { who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 3, aura: 0.3 },
          { who: 'trunks', pose: 'ft_armsCrossed', face: 'calm', speed: 3 },
          { who: 'goku', pose: 'idle', face: 'grin', speed: 3 },
          { who: 'gohan', pose: 'tg_idle', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'door', off: [6, 1.6, 10] }, to: { at: 'door', off: [4, 1.4, 7] }, look: { at: 'vegeta', off: [0, 0.4, 0] }, fov: 44 },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.4, 0.3, 1.7] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'Your turn, Kakarot. Don\'t take too long — I\'ve already gone beyond the Super Saiyan.', duration: 4 },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'goku', local: [0.4, 0.3, 1.6] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'Heh. Then we\'d better get started. Come on, Gohan.', duration: 2.8 },
        hold: 3,
      },
      // inside: white in every direction, and the weight of ten Earths on his back
      {
        call: (ctx) => {
          const st = story(ctx), Kt = K();
          for (const f of [st.vegeta, st.trunks]) f.setHidden(true);
          Kt.place(st.goku, ground(ctx, new V3(-1.2, 0, -8)), Math.PI);
          Kt.place(st.gohan, ground(ctx, new V3(1.2, 0, -8)), Math.PI);
          pt(ctx, 'void', ground(ctx, new V3(0, 0, 20)));
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'calm', speed: 3 },
          { who: 'gohan', pose: 'defeatKneel', face: 'hurt', speed: 4 },
        ],
        cam: { from: { at: 'gohan', local: [-1.4, 0.6, -3.4] }, look: { at: 'void', off: [0, 2, 0] }, fov: 54 },
        say: { who: 'teen_gohan', line: 'It\'s so heavy... I can barely breathe...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        cam: { from: { at: 'goku', local: [0.4, 0.3, 1.7] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'Ten times Earth\'s gravity, and thin air. You\'ll get used to it. We\'ve got a whole year.', duration: 3.8 },
        hold: 4,
      },
    ],
    end(ctx) {
      const st = story(ctx);
      for (const f of [st.vegeta, st.trunks]) f.setHidden(true);
      st.gohan.setState('free');
    },
  };

  S.ch_anger = {
    id: 'ch_anger',
    cast,
    auraCap: 0.15,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        call: (ctx) => {
          const st = story(ctx), Kt = K();
          Kt.place(st.gohan, ground(ctx, new V3(0, 0, 3)), Math.PI);
          Kt.place(st.goku, ground(ctx, new V3(0, 0, -3)), 0);
          faceTo(st.gohan, st.goku.pos);
          faceTo(st.goku, st.gohan.pos);
        },
        pose: [
          { who: 'gohan', pose: 'exhausted', face: 'hurt', speed: 4 },
          { who: 'goku', pose: 'armsCrossed', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'goku', local: [0.4, 0.3, 1.7] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'You\'ve got so much power in you, Gohan. You just won\'t let it out. Think about why you fight.', duration: 4.2 },
        hold: 4.4,
      },
      {
        call: (ctx) => {
          SL.ScreenFX.vision(0.5);
          ctx.b.sfx('visionIn', null, {});
        },
        cam: { from: { at: 'gohan:face', local: [0.15, 0.16, 0.85] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 32 },
        say: { who: 'goku', line: 'Piccolo, giving his life for you. Krillin on Namek. Your mom, waiting at home.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        call: () => SL.ScreenFX.vision(0),
        pose: [{ who: 'gohan', pose: 'tg_ssjClench', face: 'grit', speed: 4 }],
        shake: { at: 'gohan', amount: 0.3 },
        cam: { from: { at: 'gohan', local: [0.6, 0.1, 1.8] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 36 },
        say: { who: 'teen_gohan', line: 'I won\'t... let anybody... hurt them again!', duration: 2.8, style: 'shout' },
        hold: 2.8,
      },
    ],
    end() {
      SL.ScreenFX.vision(0);
    },
  };

  S.ch_gold = {
    id: 'ch_gold',
    cast,
    auraCap: 0.15,
    music: { song: 'battle', level: 4 },
    events: [
      {
        pose: [{ who: 'gohan', pose: 'tg_cold', face: 'calm', speed: 3 }],
        cam: { from: { at: 'gohan:face', local: [0.2, 0.20, 0.95] }, to: { at: 'gohan:face', local: [0.12, 0.19, 0.75] }, look: { at: 'gohan:head', off: [0, 0.15, 0] }, fov: 34 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'g_peace', face: 'grin', speed: 4 }],
        cam: { from: { at: 'goku', local: [0.4, 0.3, 1.7] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'You did it! You\'re a Super Saiyan, Gohan!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'gohan', local: [0.4, 0.3, 1.6] }, look: { at: 'gohan:head' }, fov: 34 },
        say: { who: 'teen_gohan', line: 'This is... me?', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
    ],
    end() {},
  };

  S.ch_calm = {
    id: 'ch_calm',
    cast,
    auraCap: 0.15,
    music: { song: 'vision', level: 1 },
    events: [
      {
        title: { chapter: 'MONTHS LATER', title: 'FULL POWER', subtitle: 'the Super Saiyan made ordinary', duration: 3.2 },
        call: (ctx) => {
          const st = story(ctx), Kt = K();
          Kt.toForm(st.goku, 'ssj');
          Kt.toForm(st.gohan, 'ssj');
          Kt.place(st.goku, ground(ctx, new V3(-1, 0, -16)));
          Kt.place(st.gohan, ground(ctx, new V3(1, 0, -16)));
          faceTo(st.goku, st.gohan.pos);
          faceTo(st.gohan, st.goku.pos);
          pt(ctx, 'pair', ground(ctx, new V3(0, 0, -16)));
        },
        pose: [
          { who: 'goku', pose: 'kneelGrieve', face: 'grin', speed: 2, aura: 0 },
          { who: 'gohan', pose: 'kneelGrieve', face: 'soft', speed: 2, aura: 0 },
        ],
        cam: { from: { at: 'pair', off: [3.6, 1.2, 4] }, look: { at: 'pair', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'goku', line: 'That\'s the trick: stay a Super Saiyan all the time — eating, sleeping, everything — until it\'s as easy as breathing.', duration: 5 },
        hold: 5.2,
      },
      {
        cam: { from: { at: 'gohan', local: [0.4, 0.3, 1.6] }, look: { at: 'gohan:head' }, fov: 34 },
        say: { who: 'teen_gohan', line: 'It doesn\'t even feel heavy any more.', duration: 2.6 },
        hold: 2.8,
      },
      // out through the door, a year older
      {
        call: (ctx) => {
          const st = story(ctx), Kt = K();
          Kt.place(st.goku, ground(ctx, new V3(-0.8, 0, -21)), 0);
          Kt.place(st.gohan, ground(ctx, new V3(0.8, 0, -21)), 0);
          faceTo(st.goku, ground(ctx, new V3(0, 0, -40)));
          faceTo(st.gohan, ground(ctx, new V3(0, 0, -40)));
          pt(ctx, 'door', ground(ctx, new V3(0, 0, -24)));
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'grin', speed: 3 },
          { who: 'gohan', pose: 'tg_idle', face: 'calm', speed: 3 },
        ],
        cam: { from: { at: 'door', off: [0, 1.6, -6] }, look: { at: 'gohan', off: [0, 0.4, 0] }, fov: 42 },
        say: { who: 'goku', line: 'Ten days until the Cell Games. Let\'s go home, Gohan.', duration: 3 },
        hold: 3.2,
      },
    ],
    end() {},
  };
})();
