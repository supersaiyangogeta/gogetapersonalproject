/*
 * SCENES — MOVIE 2 · DRAGON BALL SUPER: BROLY. Data for SL.Cinema (src/game/cinema.js).
 *
 *   bb_arrive     the glacier: snow falling on a white field, Frieza's ship; Goku and Vegeta in their winter
 *                 coats; Frieza's welcome; Paragus walking his son out; the exile told in two lines; "He's
 *                 mine" — Vegeta's coat comes off; the remote raised; "...Yes, Father."
 *   bb_god_reveal after Vegeta's God transformation: the crimson flame settling, Goku staring, Broly too
 *   bb_crater     the end of the first clash: Broly driven down into the ice; the silence; Paragus shouting; a
 *                 hand moving in the crater, and two eyes lighting amber in the dark (the tease for "Wrath")
 *
 * Dialogue: original lines written for this project in the characters' voices (no film dialogue is used).
 * Every dialogue shot is semantic (Cinema FRAMING): the speaker's face, never the ground.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const BK = () => SL.data.brolyKit;
  const cast = (m) => SL.data.brolyKit.cast(m);
  const lm = (ctx, n) => SL.data.brolyKit.lm(ctx.b, n);
  // where Paragus and his son stop, facing the two Saiyans (bb_clash.js places everybody else)
  const SPOT = { paragus: [-10, 0, 18], broly: [-6, 0, 14] };

  /* =================================================================== THE FIRST CLASH */
  S.bb_arrive = {
    id: 'bb_arrive',
    cast,
    music: { song: 'glacier', level: 1 },
    auraCap: 0,
    events: [
      // the field from high over the ice walls: white to the horizon, the black channel, the ship
      {
        cam: { from: [98, 42, -22], to: [80, 27, -8], look: [-30, 4, 30], fov: 52, fov2: 46, ease: 'inOut', raw: true },
        title: { chapter: 'MOVIE · DRAGON BALL SUPER: BROLY', title: 'THE FIRST CLASH', subtitle: 'The glacier · the far north of Earth', duration: 4.2 },
        hold: 4.4,
      },
      // two figures in winter coats on the snow
      {
        pose: [{ who: 'gokuCoat', pose: 'g_pockets', face: 'grin', speed: 6 }, { who: 'vegetaCoat', pose: 'armsCrossed', face: 'serious' }],
        cam: { subject: 'gokuCoat', with: 'vegetaCoat', focus: 'full' },
        say: { who: 'goku', line: 'Brrr! Of all the places to pick for a fight...', duration: 2.6 },
        hold: 2.7,
      },
      {
        cam: { subject: 'vegetaCoat', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Quiet, Kakarot. Frieza did not come all this way for the scenery.', duration: 3.2 },
        hold: 3.3,
      },
      // Frieza at the foot of his ship, his soldiers lined up behind him
      {
        pose: [{ who: 'frieza', pose: 'fz_watch', face: 'smirk' }],
        cam: { subject: 'frieza', focus: 'medium', angle: 'low' },
        say: { who: 'frieza', line: 'Right on time, monkeys. I brought someone I would very much like you to meet.', duration: 3.6 },
        hold: 3.7,
      },
      // PARAGUS walks out across the snow; his son a step behind him
      {
        pose: [{ who: 'paragus', pose: 'bb_walk', face: 'cold', speed: 6 }, { who: 'broly', pose: 'bb_walk', face: 'calm', speed: 5 }],
        move: { who: 'paragus', at: SPOT.paragus, seconds: 3.2, face: 'vegetaCoat' },
        call: (ctx) => {
          const br = ctx.cast.broly, pg = ctx.cast.paragus;
          ctx.m.shot((t, out) => {
            const mid = pg.pos.clone().lerp(br.pos, 0.5);
            // tracking beside them, a little ahead: the father in front, the son towering behind
            const dir = br.forward.clone().setY(0).normalize(), side = new V3(dir.z, 0, -dir.x);
            out.pos.copy(mid).addScaledVector(dir, 5.5).addScaledVector(side, 3.2).add(new V3(0, 0.9, 0));
            out.look.copy(mid).add(new V3(0, 1.3, 0));
            out.fov = 50;
          }, 3.3, { cut: true, blendIn: 0, subject: pg });
          ctx.flags.walkB = br.pos.clone();
        },
        tick: (ctx, s) => {
          const from = ctx.flags.walkB, br = ctx.cast.broly;
          if (!from) return;
          const to = new V3(SPOT.broly[0], 0, SPOT.broly[2]);
          SL.data.buuKit.place(br, from.clone().lerp(to, Math.min(1, s / 3.2)), Math.atan2(to.x - from.x, to.z - from.z));
        },
        hold: 0.2,
      },
      // BROLY: from low, the size of him against the white sky; the collar, the quiet face
      {
        pose: [{ who: 'broly', pose: 'br_idle', face: 'calm' }, { who: 'paragus', pose: 'pg_idle', face: 'cold' }],
        call: (ctx) => {
          SL.data.buuKit.faceTo(ctx.cast.broly, ctx.cast.vegetaCoat.pos);
          SL.data.buuKit.faceTo(ctx.cast.paragus, ctx.cast.vegetaCoat.pos);
        },
        cam: { subject: 'broly', focus: 'full', angle: 'low', fov: 46 },
        sfx: { name: 'heartbeat', vol: 0.6 },
        hold: 2.6,
      },
      {
        cam: { subject: 'broly', focus: 'closeup', angle: 'front' },
        hold: 1.8,
      },
      {
        cam: { subject: 'vegetaCoat', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'A Saiyan? Here?', duration: 2 },
        hold: 2.1,
      },
      {
        cam: { subject: 'paragus', focus: 'upper', angle: 'three' },
        say: { who: 'paragus', line: 'You would not remember me, Prince Vegeta. Your father threw my son away to a dead planet when he was a baby — because his power frightened him.', duration: 5.2 },
        hold: 5.3,
      },
      {
        pose: [{ who: 'paragus', pose: 'pg_point', face: 'angry' }],
        cam: { subject: 'paragus', focus: 'closeup', angle: 'front' },
        say: { who: 'paragus', line: 'Forty years on Vampa. Today, the son of King Vegeta answers for it.', duration: 3.6, style: 'shout' },
        hold: 3.7,
      },
      {
        cam: { subject: 'gokuCoat', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Whoa... He\'s strong. I can feel it from here — really strong!', duration: 3 },
        hold: 3.1,
      },
      {
        pose: [{ who: 'vegetaCoat', pose: 'armsCrossed', face: 'cocky' }],
        cam: { subject: 'vegetaCoat', focus: 'upper', angle: 'front' },
        say: { who: 'vegeta', line: 'Stay out of it, Kakarot. Revenge for my father\'s mistakes? Fine. I will settle it myself.', duration: 4 },
        hold: 4.1,
      },
      // THE COAT COMES OFF
      {
        call: (ctx) => {
          const S = ctx.b.story;
          SL.data.brolyKit.coat(ctx.m, S.vegetaCoat, S.vegeta, 0x9ad83a);
          S.vegeta.setState('scripted', { pose: 'v_coatOff', expression: 'serious', speed: 10 });
          ctx.b.sfx('clothTear', S.vegeta, { pitch: 0.7, vol: 0.6 });
        },
        cam: { subject: 'vegeta', focus: 'full', angle: 'three' },
        hold: 1.6,
      },
      // the remote raised; the lamp on the collar blinks
      {
        pose: [{ who: 'paragus', pose: 'pg_remote', face: 'cold' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'three' },
        say: { who: 'paragus', line: 'Broly. Fight him.', duration: 2 },
        call: (ctx) => {
          const br = ctx.cast.broly, b = ctx.b;
          b.after(20, () => {
            const p = br.model.props && br.model.props.collarLamp;
            if (p) b.vfx.flash(p.getWorldPosition(new V3()).sub(br.object.position).add(br.pos), 0.5, 0x4aff7a, 0.25, SL.Toon.tex.glow);
          });
        },
        hold: 2.1,
      },
      {
        pose: [{ who: 'broly', pose: 'br_fight', face: 'serious', speed: 6 }],
        cam: { subject: 'broly', focus: 'closeup', angle: 'three' },
        say: { who: 'broly', line: '...Yes, Father.', duration: 2, style: 'quiet' },
        hold: 2.1,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'cocky' }],
        cam: { subject: 'broly', angle: 'ots', over: 'vegeta', focus: 'upper' },
        music: { song: 'broly_theme', level: 1 },
        hold: 1.4,
      },
    ],
    end(ctx) {
      const S = ctx.b.story;
      if (!S.vegetaCoat.hidden) SL.data.brolyKit.coat(ctx.m, S.vegetaCoat, S.vegeta, 0x9ad83a);
      SL.data.buuKit.place(S.paragus, SL.data.brolyKit.at(ctx.b, SPOT.paragus[0], SPOT.paragus[2]), S.paragus.yaw);
      SL.data.buuKit.place(S.broly, SL.data.brolyKit.at(ctx.b, SPOT.broly[0], SPOT.broly[2]), S.broly.yaw);
      SL.data.buuKit.faceTo(S.broly, S.vegeta.pos);
      SL.data.buuKit.faceTo(S.vegeta, S.broly.pos);
      SL.data.buuKit.faceTo(S.paragus, S.vegeta.pos);
      ctx.m.flags.arrived = true;
    },
  };

  S.bb_god_reveal = {
    id: 'bb_god_reveal',
    cast,
    events: [
      {
        pose: [{ who: 'vegeta', pose: 'v_tfPride', face: 'cold' }],
        cam: { subject: 'vegeta', focus: 'full', angle: 'low', focus2: 'upper', fov2: 38 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Vegeta! Since when can you do THAT?', duration: 2.4, style: 'shout' },
        hold: 2.5,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        say: { who: 'vegeta', line: 'You thought you were the only one Whis was training? I hold the power of a god now. Calmly.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'broly', pose: 'br_fight', face: 'shock' }],
        cam: { subject: 'broly', focus: 'upper', angle: 'three' },
        hold: 1.6,
      },
    ],
    end(ctx) {
      const S = ctx.b.story;
      SL.data.buuKit.faceTo(S.vegeta, S.broly.pos);
      SL.data.buuKit.faceTo(S.broly, S.vegeta.pos);
    },
  };

  S.bb_crater = {
    id: 'bb_crater',
    cast,
    music: { song: null, level: 0 },
    events: [
      // the crater from above: the body down in the ice, the snow still falling into it
      {
        cam: { subject: 'broly', focus: 'wide', angle: 'high', room: 3 },
        sfx: { name: 'rumble', vol: 0.5 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cold' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'Hmph. Forty years of hate, and that is all it bought him.', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'paragus', pose: 'pg_shout', face: 'angry' }],
        cam: { subject: 'paragus', focus: 'upper', angle: 'three' },
        say: { who: 'paragus', line: 'Broly! Get up! Remember what they did to us — get UP!', duration: 3.2, style: 'shout' },
        hold: 3.3,
      },
      // silence; a hand in the crater closes into a fist; the eyes light amber in the dark
      {
        call: (ctx) => {
          const br = ctx.cast.broly;
          SL.data.brolyKit.eyes(br, 0.4);
          ctx.b.sfx('heartbeat', br, { vol: 0.9 });
        },
        cam: { subject: 'broly', focus: 'face', angle: 'front' },
        tick: (ctx, s) => SL.data.brolyKit.eyes(ctx.cast.broly, 0.4 + Math.min(1, s / 1.4) * 0.6),
        hold: 1.8,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        say: { who: 'goku', line: 'Vegeta... something\'s wrong. His power — it\'s still climbing.', duration: 3 },
        hold: 3.1,
      },
    ],
    end(ctx) {
      ctx.m.flags.crater = true;
    },
  };
})();
