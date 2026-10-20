/*
 * SCENES — What If: "The Ultimate Fusion" (Goku and Vegeta dance; the Sacred World of the Kai).
 *
 *   gg_arrive   peace after Kid Buu: Goku wants to try the dance, Vegeta refuses, the Old Kai
 *               needles him into it
 *   gg_birth    THE REVEAL: the light, a silhouette standing in the smoke, the lens climbing him
 *               from the boots to the face, the eyes opening, the smirk, the stance
 *   gg_echo     the Old Kai gives the fusion's will a body of its own: Goku and Vegeta face
 *               what they would make
 *   gg_serious  half-way: "Not bad. Now it's my turn." (his transformation is gameplay)
 *   gg_after    beaten, on one knee, grinning anyway; he comes apart into light
 *
 * Every dialogue shot is semantic (Cinema FRAMING): the speaker's face, never the ground.
 * Dialogue is original English written for this project (the matchup lines are the owner's).
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    return out;
  };

  S.gg_arrive = {
    id: 'gg_arrive',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // the Kais' world, quiet for once
      {
        cam: { from: [22, 9, 24], to: [12, 5, 14], look: [0, 1.3, 0], fov: 50, fov2: 44, ease: 'inOut' },
        pose: [
          { who: 'goku', pose: 'idle', face: 'grin', speed: 3 },
          { who: 'vegeta', pose: 'armsCrossed', face: 'calm', speed: 2 },
          { who: 'kai', pose: 'ek_idle', face: 'calm', speed: 2 },
        ],
        hold: 3,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Hey, Vegeta. Remember that Fusion Dance? We never got to try it.', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'And we never will. I am NOT dancing, Kakarot.', duration: 2.9 },
        hold: 3,
      },
      {
        pose: [{ who: 'kai', pose: 'ek_point', face: 'smirk', speed: 4 }],
        cam: { subject: 'kai', focus: 'upper', angle: 'front' },
        say: { who: 'kai', line: 'Heh heh. Afraid you\'d look silly, Prince?', duration: 2.6 },
        hold: 2.7,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'shock', speed: 6 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        say: { who: 'vegeta', line: '...Afraid? Of a DANCE?', duration: 1.9, style: 'shout' },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'angry', speed: 4 }],
        cam: { subject: 'vegeta', with: 'goku', focus: 'medium' },
        say: { who: 'vegeta', line: 'Fine. ONCE. And if either of you laughs—', duration: 2.8 },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'goku', line: 'Nobody\'s laughing! Arms out!', duration: 1.9, style: 'shout' },
        hold: 2,
      },
    ],
  };

  S.gg_birth = {
    id: 'gg_birth',
    cast,
    music: { song: 'ascend', level: 1 },
    events: [
      // the light where they met: a figure standing in the smoke, lit from behind
      {
        call: (ctx) => {
          const g = ctx.cast.gogeta;
          if (!g) return;
          ctx.b.vfx.dust(g.pos.clone(), 5, 26, 0xd8d4c8);
          ctx.b.vfx.dust(g.pos.clone(), 3, 16, 0xeeeae0);
        },
        mood: { amount: 0.55, color: 0x0a0c18, seconds: 0.25 },
        pose: [{ who: 'gogeta', pose: 'gg_arrival', face: 'closed', speed: 3 }],
        vfx: { kind: 'flash', at: { at: 'gogeta', local: [0, 1.1, -1.6] }, size: 7, color: 0xfff4d8, life: 1.8 },
        cam: { subject: 'gogeta', focus: 'full', angle: 'low' },
        hold: 1.7,
      },
      // the smoke thins; the lens climbs him from the boots to the face
      {
        mood: { amount: 0, seconds: 2 },
        vfx: { kind: 'dust', at: { at: 'gogeta', off: [0, 0.2, 0] }, radius: 4, count: 12, color: 0xe8e4da },
        cam: { subject: 'gogeta', focus: 'full', focus2: 'face', angle: 'low' },
        hold: 2.6,
      },
      // the eyes open
      {
        pose: [{ who: 'gogeta', pose: 'gg_rise', face: 'focused', speed: 4 }],
        cam: { subject: 'gogeta', focus: 'face', angle: 'front' },
        sfx: { name: 'kiUp', who: 'gogeta', pitch: 0.7, vol: 0.6 },
        hold: 1.3,
      },
      // the smirk
      {
        pose: [{ who: 'gogeta', pose: 'gg_smirk', face: 'smirk', speed: 6 }],
        cam: { subject: 'gogeta', focus: 'closeup', angle: 'three' },
        hold: 1.4,
      },
      // the stance: the aura answers it
      {
        pose: [{ who: 'gogeta', pose: 'gg_fight', face: 'focused', speed: 9 }],
        vfx: { kind: 'ring', at: { at: 'gogeta', off: [0, 0.1, 0] }, radius: 6, color: 0xe8f2ff, life: 0.6 },
        sfx: { name: 'kiCharge', who: 'gogeta', pitch: 1.1 },
        cam: { subject: 'gogeta', focus: 'full', angle: 'three', side: -1 },
        say: { who: 'gogeta', line: 'Heh. So this is what it feels like.', duration: 2.6 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'kai', pose: 'ek_point', face: 'shock', speed: 5 }],
        cam: { subject: 'kai', focus: 'upper', angle: 'front' },
        say: { who: 'kai', line: 'Th-thirty minutes of... THAT? My poor planet...', duration: 2.8 },
        hold: 2.9,
      },
    ],
    end(ctx) {
      const g = ctx.cast.gogeta;
      if (g) g.setState('scripted', { pose: 'gg_fight', expression: 'focused' });
    },
  };

  S.gg_echo = {
    id: 'gg_echo',
    cast,
    music: { song: 'gogeta_z_arrival', level: 0 },
    events: [
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'shock', speed: 4 },
          { who: 'vegeta', pose: 'idle', face: 'shock', speed: 4 },
          { who: 'gogeta', pose: 'gg_idle', face: 'calm', speed: 3 },
        ],
        cam: { subject: 'goku', with: 'gogeta', focus: 'medium' },
        say: { who: 'goku', line: 'Whoa! So that\'s what we\'d look like?', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_smirk', face: 'smirk', speed: 6 }],
        cam: { subject: 'gogeta', focus: 'closeup', angle: 'three' },
        say: { who: 'gogeta', line: 'Pretty much.', duration: 1.5 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Tch. Another fusion.', duration: 1.9 },
        hold: 2,
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_oneHand', face: 'cocky', speed: 5 }],
        cam: { subject: 'gogeta', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'gogeta', line: 'Don\'t worry. I\'ll make it quick.', duration: 2.2 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'kai', pose: 'ek_point', face: 'grin', speed: 4 }],
        cam: { subject: 'kai', focus: 'medium', angle: 'front' },
        say: { who: 'kai', line: 'His will keeps that body until the dance runs out. So — two of you against what you\'d make. Try not to break my world!', duration: 4 },
        hold: 4.1,
      },
      // the three of them, squared up
      {
        pose: [
          { who: 'goku', pose: 'idle', face: 'grin', speed: 6 },
          { who: 'vegeta', pose: 'idle', face: 'angry', speed: 6 },
          { who: 'gogeta', pose: 'gg_fight', face: 'focused', speed: 8 },
        ],
        cam: { subject: 'gogeta', focus: 'wide', angle: 'low', room: 4 },
        music: { song: 'gogeta_z_arrival', level: 1 },
        hold: 1.6,
      },
    ],
  };

  S.gg_serious = {
    id: 'gg_serious',
    cast,
    events: [
      {
        pose: [{ who: 'gogeta', pose: 'gg_shoulderRoll', face: 'smirk', speed: 6 }],
        cam: { subject: 'gogeta', focus: 'upper', angle: 'three' },
        say: { who: 'gogeta', line: 'Not bad.', duration: 1.3 },
        hold: 1.3,
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_power', face: 'serious', speed: 6 }],
        cam: { subject: 'gogeta', focus: 'closeup', angle: 'front' },
        say: { who: 'gogeta', line: 'Now it\'s my turn.', duration: 1.6 },
        hold: 1.5,
      },
    ],
    end(ctx) {
      const g = ctx.cast.gogeta;
      if (g) g.setState('free');
    },
  };

  S.gg_after = {
    id: 'gg_after',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      {
        pose: [{ who: 'gogeta', pose: 'gg_defeat', face: 'exhausted', speed: 4 }],
        cam: { subject: 'gogeta', focus: 'full', angle: 'three' },
        hold: 1.6,
      },
      {
        pose: [{ who: 'gogeta', pose: 'gg_defeatLook', face: 'smirk', speed: 3 }],
        cam: { subject: 'gogeta', focus: 'closeup', angle: 'front' },
        say: { who: 'gogeta', line: 'Heh... not bad... at all.', duration: 2.4, style: 'quiet' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin', speed: 5 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'That was AMAZING! Let\'s do it again!', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 4 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '...Never. Again.', duration: 1.8 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 3 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        say: { who: 'vegeta', line: '...Maybe once.', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      // the thirty minutes are up: he comes apart into light, still grinning
      {
        call: (ctx) => {
          const g = ctx.cast.gogeta;
          if (!g) return;
          ctx.b.vfx.flash(g.chest(), 3, 0xfff4d8, 0.6, SL.Toon.tex.glow);
          ctx.b.vfx.ring(g.chest(), 3.4, 0xffe9b0, 0.7);
          ctx.b.vfx.sparks(g.chest(), 0xfff4d8, 40, 10, 0.2);
          ctx.b.sfx('soulBurst', g, { vol: 0.6 });
          g.setHidden(true);
        },
        cam: { subject: 'goku', with: 'vegeta', focus: 'medium' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'kai', pose: 'ek_idle', face: 'calm', speed: 2 }],
        cam: { subject: 'kai', focus: 'upper', angle: 'front' },
        say: { who: 'kai', line: 'Not on my planet, you won\'t.', duration: 2.2 },
        hold: 2.3,
      },
    ],
    end(ctx) {
      const g = ctx.cast.gogeta;
      if (g) g.setHidden(true);
    },
  };
})();
