/*
 * SCENES — MOVIE 2 · DRAGON BALL SUPER: BROLY, the rest of the film (parts 1, 2 and 4–9). Data for SL.Cinema
 * (src/game/cinema.js), the same format as scenes/super_broly.js.
 *
 * Dialogue: original lines written for this project in the characters' voices, following the owner's beat text
 * (a few very short, well-known phrases the owner asked for by name are kept to a word or two).
 * Every dialogue shot is semantic (Cinema FRAMING): the speaker's face, never the ground.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const cast = (m) => SL.data.brolyKit.cast(m);
  const K = () => SL.data.buuKit;
  const BK = () => SL.data.brolyKit;

  /* =================================================================== PART 1 · PLANET VEGETA */
  S.bb_pv_exile = {
    id: 'bb_pv_exile',
    cast,
    music: { song: 'saiyan_home', level: 1 },
    events: [
      // the city from over the plain: domes to the horizon, the palace on its rise, an orange sky
      {
        cam: { from: [-120, 40, -110], to: [-90, 30, -70], look: [10, 10, 100], fov: 54, fov2: 48, ease: 'inOut', raw: true },
        title: { chapter: 'MOVIE · DRAGON BALL SUPER: BROLY', title: 'THE FALL OF PLANET VEGETA', subtitle: 'Planet Vegeta · the Saiyans\' world · Age 737', duration: 4.2 },
        hold: 4.4,
      },
      {
        pose: [{ who: 'king', pose: 'kv_idle', face: 'cold' }],
        cam: { subject: 'king', focus: 'full', angle: 'low' },
        say: { who: 'king_vegeta', line: 'A newborn — and his power is already above my son\'s.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'paragus', pose: 'pg_shout', face: 'shock' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'three' },
        say: { who: 'paragus', line: 'My king, he is a baby! Let me raise him — he will serve the throne!', duration: 3.4, style: 'shout' },
        hold: 3.5,
      },
      {
        pose: [{ who: 'king', pose: 'kv_order', face: 'angry' }],
        cam: { subject: 'king', focus: 'upper', angle: 'front' },
        say: { who: 'king_vegeta', line: 'He will serve on Vampa. The pod leaves today. If you love him so much, follow it.', duration: 3.8 },
        hold: 3.9,
      },
    ],
    end(ctx) {
      ctx.m.flags.exiled = true;
    },
  };

  S.bb_pv_exile2 = {
    id: 'bb_pv_exile2',
    cast,
    events: [
      // the pod streaking away; the father's face
      {
        pose: [{ who: 'paragus', pose: 'pg_afraid', face: 'sad' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'low' },
        hold: 1.8,
      },
      {
        cam: { subject: 'paragus', focus: 'closeup', angle: 'front' },
        say: { who: 'paragus', line: 'Broly... I will find you. And one day, they will pay for this.', duration: 3.4, style: 'quiet' },
        hold: 3.5,
      },
    ],
    end(ctx) {},
  };

  S.bb_pv_plan = {
    id: 'bb_pv_plan',
    cast,
    music: { song: 'frieza_theme', level: 1 },
    events: [
      {
        cam: { subject: 'frieza', focus: 'medium', angle: 'ots', over: 'zarbon' },
        say: { who: 'frieza', line: 'The Saiyans multiply, Zarbon. And every year, they grow a little stronger.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'zarbon', focus: 'upper', angle: 'three' },
        say: { who: 'zarbon', line: 'They are useful soldiers, Lord Frieza.', duration: 2.4 },
        hold: 2.5,
      },
      {
        cam: { subject: 'frieza', focus: 'closeup', angle: 'front' },
        say: { who: 'frieza', line: 'And they have a legend. A Super Saiyan. Useful monkeys are still monkeys.', duration: 3.6 },
        hold: 3.7,
      },
      {
        pose: [{ who: 'dodoria', pose: 'idle', face: 'grin' }],
        cam: { subject: 'frieza', focus: 'upper', angle: 'low', with: 'dodoria' },
        say: { who: 'frieza', line: 'Call every Saiyan home. Every last one. Then we shall see about legends.', duration: 3.8 },
        hold: 3.9,
      },
    ],
    end(ctx) {},
  };

  S.bb_pv_gine = {
    id: 'bb_pv_gine',
    cast,
    music: { song: 'farewell', level: 1 },
    events: [
      {
        pose: [{ who: 'gine', pose: 'gine_idle', face: 'warm' }, { who: 'bardock', pose: 'idle', face: 'serious' }],
        cam: { subject: 'gine', with: 'bardock', focus: 'full' },
        say: { who: 'gine', line: 'Bardock! You\'re back early. What happened?', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { subject: 'bardock', focus: 'upper', angle: 'three' },
        say: { who: 'bardock', line: 'Frieza\'s calling every Saiyan home at once. That doesn\'t happen. Something\'s coming.', duration: 3.6 },
        hold: 3.7,
      },
      {
        pose: [{ who: 'gine', pose: 'gine_cry', face: 'sad' }],
        cam: { subject: 'gine', focus: 'closeup', angle: 'front' },
        say: { who: 'gine', line: '...What do we do?', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'bardock', focus: 'closeup', angle: 'three' },
        say: { who: 'bardock', line: 'We send Kakarot away. Tonight. A little planet called Earth — nobody wants it.', duration: 3.6 },
        hold: 3.7,
      },
      {
        cam: { subject: 'gine', focus: 'upper', angle: 'three' },
        say: { who: 'gine', line: 'Our baby, all alone out there...', duration: 2.4, style: 'quiet' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'gine', pose: 'gine_idle', face: 'soft' }],
        cam: { subject: 'bardock', focus: 'upper', angle: 'ots', over: 'gine' },
        say: { who: 'bardock', line: 'He\'ll be strong enough. He\'s your son.', duration: 2.6 },
        hold: 2.7,
      },
    ],
    end(ctx) {},
  };

  /* =================================================================== PART 2 · VAMPA */
  /** The collar's punishment: the lamp red, sparks over him, a crackle (no wound — the pain is in the pose). */
  const shock = (b, br) => {
    const p = br.model.props && br.model.props.collarLamp;
    const at = p ? p.getWorldPosition(new V3()).sub(br.object.position).add(br.pos) : br.headPos();
    b.vfx.flash(at, 0.8, 0xff3a3a, 0.3, SL.Toon.tex.glow);
    for (let i = 0; i < 5; i++) b.vfx.bolt(br.chest().add(new V3(Math.sin(i * 2) * 0.4, 0.4 + i * 0.12, Math.cos(i * 2) * 0.4)), 0.8, 0xff6a6a);
    b.sfx('lightning', br, { pitch: 1.3, vol: 0.9 });
  };

  S.bb_vp_exile = {
    id: 'bb_vp_exile',
    cast,
    music: { song: 'vampa', level: 1 },
    events: [
      {
        cam: { from: [90, 34, 80], to: [70, 22, 60], look: [20, 2, 30], fov: 54, fov2: 46, ease: 'inOut', raw: true },
        title: { chapter: 'MOVIE · DRAGON BALL SUPER: BROLY', title: 'THE WILD PLANET', subtitle: 'Vampa · a dead world at the edge of the universe', duration: 4.2 },
        hold: 4.4,
      },
      // the father, limping across the grit toward the smoke
      {
        pose: [{ who: 'paragus', pose: 'bb_walk', face: 'hurt', speed: 4 }],
        move: { who: 'paragus', at: [29, 0, 33], seconds: 3.4 },
        cam: { subject: 'paragus', focus: 'full', angle: 'three' },
        hold: 3.5,
      },
      {
        pose: [{ who: 'paragus', pose: 'kneelGrieve', face: 'soft' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'low' },
        say: { who: 'paragus', line: 'Broly... You are alive. I found you.', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        cam: { subject: 'paragus', focus: 'closeup', angle: 'front' },
        say: { who: 'paragus', line: 'They threw you away like refuse. We will survive this place — and one day the king\'s blood will pay for it.', duration: 4.6 },
        hold: 4.7,
      },
      {
        cam: { from: [40, 18, 50], to: [44, 40, 56], look: [20, 6, 28], fov: 56, ease: 'inOut', raw: true },
        title: { chapter: '', title: 'YEARS PASS', subtitle: 'Vampa', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {},
  };

  S.bb_vp_ba = {
    id: 'bb_vp_ba',
    cast,
    music: { song: 'vampa', level: 1 },
    events: [
      // Ba and Broly: the gentle giant and his friend
      {
        call: (ctx) => {
          const S = ctx.b.story;
          if (S.ba) S.ba.mood('eat');
        },
        pose: [{ who: 'broly', pose: 'br_idle', face: 'soft' }],
        cam: { subject: 'broly', focus: 'full', angle: 'three' },
        hold: 2.6,
      },
      {
        cam: { subject: 'broly', focus: 'closeup', angle: 'front' },
        say: { who: 'broly', line: 'Eat, Ba. There is plenty.', duration: 2.4, style: 'quiet' },
        hold: 2.5,
      },
      // the father, the remote
      {
        pose: [{ who: 'paragus', pose: 'pg_remote', face: 'cold' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'low' },
        say: { who: 'paragus', line: 'Enough playing with that animal, Broly. Train.', duration: 2.6 },
        hold: 2.7,
      },
      {
        pose: [{ who: 'broly', pose: 'br_idle', face: 'sad' }],
        cam: { subject: 'broly', focus: 'upper', angle: 'ots', over: 'paragus' },
        say: { who: 'broly', line: '...Father. Ba is hungry too.', duration: 2.4, style: 'quiet' },
        hold: 2.5,
      },
      // the collar
      {
        call: (ctx) => {
          const S = ctx.b.story;
          shock(ctx.b, S.broly);
          if (S.ba) S.ba.mood('flinch');
          ctx.b.after(14, () => shock(ctx.b, S.broly));
        },
        pose: [{ who: 'broly', pose: 'defeatKneel', face: 'hurt', speed: 12 }],
        cam: { subject: 'broly', focus: 'medium', angle: 'high' },
        sfx: { name: 'growl', vol: 0.6 },
        hold: 2.2,
      },
      {
        cam: { subject: 'paragus', focus: 'closeup', angle: 'three' },
        say: { who: 'paragus', line: 'Your power belongs to our revenge. Never forget that.', duration: 3 },
        hold: 3.1,
      },
    ],
    end(ctx) {
      const S = ctx.b.story;
      if (S.ba) S.ba.mood('idle');
    },
  };

  S.bb_vp_arrival = {
    id: 'bb_vp_arrival',
    cast,
    music: { song: 'vampa', level: 1 },
    events: [
      {
        pose: [{ who: 'broly', pose: 'br_idle', face: 'calm' }, { who: 'paragus', pose: 'pg_idle', face: 'cold' }],
        cam: { subject: 'broly', with: 'paragus', focus: 'full', angle: 'three' },
        sfx: { name: 'rumble', vol: 0.4, pitch: 1.4 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'cheelai', pose: 'ch_shock', face: 'shock' }, { who: 'lemo', pose: 'le_watch', face: 'shock' }],
        cam: { subject: 'cheelai', with: 'lemo', focus: 'full' },
        say: { who: 'cheelai', line: 'Whoa — Lemo, look at that reading! Out here?!', duration: 2.8, style: 'shout' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'paragus', pose: 'pg_idle', face: 'serious' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'three' },
        say: { who: 'paragus', line: 'Who are you? Nobody has landed on Vampa in forty years.', duration: 3 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'cheelai', pose: 'ch_idle', face: 'smirk' }],
        cam: { subject: 'cheelai', focus: 'upper', angle: 'front' },
        say: { who: 'cheelai', line: 'Frieza Force. Lord Frieza\'s recruiting strong fighters. You two just qualified.', duration: 3.4 },
        hold: 3.5,
      },
      {
        cam: { subject: 'paragus', focus: 'closeup', angle: 'three' },
        say: { who: 'paragus', line: 'Frieza... Is the prince with him? King Vegeta\'s son?', duration: 3 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'lemo', pose: 'le_idle', face: 'calm' }],
        cam: { subject: 'lemo', focus: 'upper', angle: 'three' },
        say: { who: 'lemo', line: 'Vegeta? Last anyone heard, he was living on a planet called Earth.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'paragus', pose: 'pg_point', face: 'angry' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'low' },
        say: { who: 'paragus', line: 'Then take us to Frieza.', duration: 2.2 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'cheelai', pose: 'ch_point', face: 'warm' }],
        cam: { subject: 'cheelai', focus: 'upper', angle: 'ots', over: 'broly' },
        say: { who: 'cheelai', line: 'You\'re a big one, huh? I\'m Cheelai. What\'s your name?', duration: 3 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'broly', pose: 'br_idle', face: 'soft' }],
        cam: { subject: 'broly', focus: 'closeup', angle: 'three' },
        say: { who: 'broly', line: '...Broly.', duration: 1.8, style: 'quiet' },
        hold: 2.2,
      },
    ],
    end(ctx) {},
  };

  /* =================================================================== PART 5 · BEYOND THE LIMITS */
  S.bb_lg_scheme = {
    id: 'bb_lg_scheme',
    cast,
    music: { song: 'ominous', level: 1 },
    events: [
      // low, close on Frieza's smirk
      {
        pose: [{ who: 'frieza', pose: 'fz_watch', face: 'smirk' }],
        cam: { subject: 'frieza', focus: 'closeup', angle: 'low' },
        say: { who: 'frieza', line: 'He has hit his ceiling against Goku\'s divine form...', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        cam: { subject: 'frieza', focus: 'face', angle: 'three' },
        say: { who: 'frieza', line: 'On Namek, it took a friend dying in front of him to make Goku a Super Saiyan. Perhaps our Broly needs the same push.', duration: 4.6, style: 'quiet' },
        hold: 4.7,
      },
    ],
    end(ctx) {},
  };

  S.bb_lg_lie = {
    id: 'bb_lg_lie',
    cast,
    events: [
      {
        pose: [{ who: 'frieza', pose: 'fz_horror', face: 'shock' }],
        cam: { subject: 'frieza', focus: 'upper', angle: 'three' },
        say: { who: 'frieza', line: 'Broly, look! What a tragedy! It\'s your father — he was killed by a stray blast!', duration: 3.8, style: 'shout' },
        hold: 3.9,
      },
      {
        pose: [{ who: 'broly', pose: 'br_wrathIdle', face: 'shock' }],
        cam: { subject: 'broly', focus: 'upper', angle: 'ots', over: 'frieza' },
        hold: 1.4,
      },
      {
        cam: { subject: 'paragus', focus: 'full', angle: 'high' },
        sfx: { name: 'heartbeat', vol: 0.9 },
        hold: 1.8,
      },
    ],
    end(ctx) {},
  };

  S.bb_lg_after = {
    id: 'bb_lg_after',
    cast,
    music: { song: 'broly_wrath', level: 3 },
    events: [
      {
        pose: [{ who: 'broly', pose: 'br_lsIdle', face: 'shout' }],
        cam: { subject: 'broly', focus: 'full', angle: 'low' },
        hold: 2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'The whole glacier... he melted it down to the rock!', duration: 2.8, style: 'shout' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'goku', pose: 'g_turtleStance', face: 'grit' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        say: { who: 'goku', line: 'And his power just keeps going up...', duration: 2.4 },
        hold: 2.5,
      },
      {
        cam: { subject: 'broly', focus: 'closeup', angle: 'front' },
        sfx: { name: 'roar', vol: 1.2, pitch: 0.55 },
        hold: 1.6,
      },
    ],
    end(ctx) {},
  };

  /* =================================================================== PART 6 · DESPERATE ALLIANCE */
  S.bb_al_together = {
    id: 'bb_al_together',
    cast,
    music: { song: 'ssj_blue', level: 2 },
    events: [
      // low, looking up at the two of them shoulder to shoulder, the blue auras running into each other
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'low' },
        hold: 2.2,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Kakarot! Get out of my way!', duration: 2.2, style: 'shout' },
        hold: 2.3,
      },
      {
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'No way, Vegeta! We have to fight him together!', duration: 2.6, style: 'shout' },
        hold: 2.7,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'Tch... Don\'t drag me into your mess!', duration: 2.2 },
        hold: 2.3,
      },
      {
        cam: { subject: 'broly', focus: 'full', angle: 'ots', over: 'goku' },
        sfx: { name: 'roar', vol: 1, pitch: 0.55 },
        hold: 1.6,
      },
    ],
    end(ctx) {},
  };

  S.bb_al_piccolo = {
    id: 'bb_al_piccolo',
    cast,
    music: { song: 'piccolo_theme', level: 1 },
    events: [
      // from near Piccolo's shoulder, looking down at the two of them in the dirt
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'high' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'serious' }],
        cam: { subject: 'piccolo', focus: 'upper', angle: 'low' },
        say: { who: 'piccolo', line: 'What happened out there? Where is Broly?', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        pose: [{ who: 'goku', pose: 'defeatKneel', face: 'exhausted' }, { who: 'vegeta', pose: 'v_kneelShoulder', face: 'exhausted' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'He\'s way too strong, Piccolo. Neither of us can take him, even together... We gotta use the Fusion Dance!', duration: 4.2 },
        hold: 4.3,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'front' },
        say: { who: 'vegeta', line: 'NO! I am NOT doing that ridiculous dance! I would rather let him tear the planet apart!', duration: 3.8, style: 'shout' },
        hold: 3.9,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'serious' }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'Vegeta. If he gets to Bulma, you\'ll never see her again.', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        sfx: { name: 'growl', vol: 0.5, pitch: 1.4 },
        hold: 1.6,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: '...Fine. Show me the damned dance.', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: 'Then pay attention. You get one chance at this every thirty minutes.', duration: 3.2 },
        hold: 3.3,
      },
    ],
    end(ctx) {},
  };

  /* =================================================================== PART 7 · THE BIRTH OF GOGETA */
  S.bb_fu_lesson = {
    id: 'bb_fu_lesson',
    cast,
    events: [
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'serious' }],
        cam: { subject: 'piccolo', with: 'goku', focus: 'full' },
        say: { who: 'piccolo', line: 'Two fighters of the same size and power, perfectly in step. One mistake and it fails.', duration: 3.6 },
        hold: 3.7,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Just get on with it.', duration: 1.8 },
        hold: 1.9,
      },
      {
        cam: { subject: 'piccolo', focus: 'upper', angle: 'front' },
        say: { who: 'piccolo', line: 'Watch me. Once.', duration: 1.6 },
        hold: 1.7,
      },
    ],
    end(ctx) {},
  };

  S.bb_fu_veku = {
    id: 'bb_fu_veku',
    cast,
    music: { song: 'fusion_theme', level: 1 },
    events: [
      {
        pose: [{ who: 'fused', pose: 'vk_puff', face: 'hurt', speed: 6 }],
        cam: { subject: 'fused', focus: 'full', angle: 'three' },
        sfx: { name: 'puff', vol: 0.6 },
        hold: 1.8,
      },
      {
        cam: { subject: 'fused', focus: 'upper', angle: 'front' },
        say: { who: 'veku', line: 'Huff... huff... why am I... so... round?', duration: 2.6 },
        hold: 2.7,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'angry' }],
        cam: { subject: 'piccolo', focus: 'closeup', angle: 'three' },
        say: { who: 'piccolo', line: '...No. That is not it. Now we wait thirty minutes for it to wear off.', duration: 3.4 },
        hold: 3.5,
      },
      {
        pose: [{ who: 'fused', pose: 'vk_flop', face: 'hurt', speed: 8 }],
        cam: { subject: 'fused', focus: 'full', angle: 'high' },
        sfx: { name: 'boing', vol: 0.6 },
        hold: 1.6,
      },
    ],
    end(ctx) {},
  };

  S.bb_fu_thin = {
    id: 'bb_fu_thin',
    cast,
    events: [
      {
        pose: [{ who: 'fused', pose: 'vk_thinCough', face: 'hurt', speed: 8 }],
        cam: { subject: 'fused', focus: 'full', angle: 'low' },
        hold: 1.8,
      },
      {
        pose: [{ who: 'fused', pose: 'vk_thinWobble', face: 'hurt', speed: 6 }],
        cam: { subject: 'fused', focus: 'upper', angle: 'three' },
        say: { who: 'veku_thin', line: '*cough* ...I feel... very... light...', duration: 2.6, style: 'quiet' },
        hold: 2.7,
      },
      {
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: 'You two were half a beat apart. Thirty more minutes.', duration: 2.8 },
        hold: 2.9,
      },
    ],
    end(ctx) {},
  };

  S.bb_fu_gogeta = {
    id: 'bb_fu_gogeta',
    cast,
    // the Super film's Gogeta has his own music (wave 6), not Fusion Reborn's
    music: { song: 'gogeta_super_rush', level: 1 },
    events: [
      // low, the boots to the face: the vest, the sash, the calm
      {
        pose: [{ who: 'fused', pose: 'gg_rise', face: 'calm', speed: 4 }],
        cam: { subject: 'fused', focus: 'full', angle: 'low', focus2: 'upper', fov2: 40 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'piccolo', pose: 'armsCrossed', face: 'shock' }],
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: '...It worked. And you are...?', duration: 2.2 },
        hold: 2.3,
      },
      {
        pose: [{ who: 'fused', pose: 'gg_armsCrossed', face: 'smirk' }],
        cam: { subject: 'fused', focus: 'closeup', angle: 'three' },
        say: { who: 'gogeta', line: 'Goku and Vegeta, fused. Not just stronger — multiplied. Call me Gogeta.', duration: 3.6 },
        hold: 3.7,
      },
    ],
    end(ctx) {},
  };

  /* =================================================================== PART 9 · A NEW BEGINNING */
  S.bb_ep_defuse = {
    id: 'bb_ep_defuse',
    cast,
    events: [
      {
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Phew... We did it, Vegeta. Gogeta was something else, huh?', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'front' },
        say: { who: 'vegeta', line: 'If you ever tell anybody about that dance, Kakarot, I will end you.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'goku', pose: 'g_neckRub', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Hehe... I wonder where Broly ended up.', duration: 2.6 },
        hold: 2.7,
      },
    ],
    end(ctx) {},
  };

  S.bb_ep_goodbye = {
    id: 'bb_ep_goodbye',
    cast,
    music: { song: 'farewell', level: 1 },
    events: [
      // low on the grit: Goku in front of Broly, Cheelai and Lemo, the house behind them
      {
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }, { who: 'broly', pose: 'br_idle', face: 'calm' }, { who: 'cheelai', pose: 'ch_idle', face: 'warm' }, { who: 'lemo', pose: 'le_idle', face: 'calm' }],
        cam: { subject: 'goku', with: 'broly', focus: 'full', angle: 'low' },
        hold: 2.2,
      },
      {
        pose: [{ who: 'goku', pose: 'g_neckRub', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'I\'ll come back, Broly. Let\'s train together — I can show you how to hold all that power in.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'broly', pose: 'br_idle', face: 'soft' }],
        cam: { subject: 'broly', focus: 'closeup', angle: 'three' },
        say: { who: 'broly', line: '...Train. With you.', duration: 2, style: 'quiet' },
        hold: 2.1,
      },
      // two fingers to his brow
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'calm' }],
        cam: { subject: 'goku', focus: 'medium', angle: 'front' },
        hold: 1.4,
      },
      {
        pose: [{ who: 'cheelai', pose: 'ch_point', face: 'shock' }],
        cam: { subject: 'cheelai', focus: 'closeup', angle: 'three' },
        say: { who: 'cheelai', line: 'Wait! What\'s your name, anyway?', duration: 2.2 },
        hold: 2.3,
      },
      // over his shoulder, the turn and the grin
      {
        pose: [{ who: 'goku', pose: 'g_thumbChest', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'ots', over: 'cheelai' },
        hold: 1.2,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'Son Goku! But you, Broly — you can call me Kakarot.', duration: 3.2 },
        hold: 3.3,
      },
      // pop
      {
        pose: [{ who: 'goku', pose: 'twoFingers', face: 'grin' }],
        cam: { subject: 'broly', with: 'cheelai', focus: 'full', angle: 'three' },
        call: (ctx) => ctx.b.after(30, () => BK().vanish(ctx.b, ctx.cast.goku)),
        hold: 1.6,
      },
      // the small smile
      {
        cam: { subject: 'broly', focus: 'closeup', angle: 'front' },
        pose: [{ who: 'broly', pose: 'br_idle', face: 'warm' }],
        sfx: { name: 'heartbeat', vol: 0.4 },
        hold: 2.4,
      },
      // the lens tilts up to the green sky
      {
        cam: { subject: 'broly', focus: 'wide', angle: 'low', room: 4, fov: 60 },
        music: { song: 'next_journey', level: 2 },
        hold: 3,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goku;
      if (g && !g.hidden) BK().vanish(ctx.b, g);
    },
  };
})();
