/*
 * SCENES — Chapter 10: a prince's last fight.
 *
 *   sacrifice_arrive    the wizard and his creation land; Vegeta answers nobody; one chop
 *   sacrifice_reform    the first time he comes apart — and does not stay apart
 *   sacrifice_farewell  his son; the first time he ever held him; Piccolo's question
 *   sacrifice_after     silence, a crater, a statue that crumbles — and pink pieces that move
 *
 * The explosion itself is played (see the mission's FINAL phase). Paraphrased English written
 * for this project; no line is taken from a translation.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;
  const K = () => SL.data.buuKit;
  const cast = (m) => m.battle.story;

  S.sacrifice_arrive = {
    id: 'sacrifice_arrive',
    cast,
    music: { song: 'finale', level: 1 },
    events: [
      {
        pose: [
          { who: 'vegeta', pose: 'exhausted', face: 'grit' },
          { who: 'goku', pose: 'exhausted', face: 'hurt' },
          { who: 'buu', pose: 'bu_idle', face: 'grin' },
          { who: 'babidi', pose: 'bb_idle', face: 'grin' },
        ],
        sfx: { name: 'dash', vol: 0.8, pitch: 0.6 },
        cam: { from: { at: 'vegeta', local: [-3.2, 2.8, -6] }, look: { at: 'buu', off: [0, 0.4, 0] }, fov: 44 },
        say: { who: 'babidi', line: 'Vegeta! Kill Goku, then help Buu finish everyone else!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        cam: { from: { at: 'vegeta:face', local: [0.2, -0.04, 1.2] }, look: { at: 'vegeta:head' }, fov: 32 },
        hold: 2,
      },
      {
        cam: { from: { at: 'goku', local: [0.9, 0.3, 2.4] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'goku', line: 'Vegeta... together. Neither of us can take him alone.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.35, 2.4] }, look: { at: 'vegeta', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'Kakarot. One thing.', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      {
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta, g = ctx.cast.goku;
          const p = g.pos.clone().addScaledVector(g.forward, -1.1);
          p.y = b.stage.heightAt(p.x, p.z);
          v.setPosition(p);
          K().faceTo(v, g.pos);
        },
        pose: [{ who: 'vegeta', pose: 'v_chopW', face: 'grit' }],
        cam: { from: { at: 'goku', local: [2.2, 0.4, 1.2] }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 42 },
        hold: 0.5,
      },
      {
        pose: [
          { who: 'vegeta', pose: 'v_chop', face: 'grit' },
          { who: 'goku', pose: 'knockdownFace', face: 'ko' },
        ],
        sfx: { name: 'punchHeavy', vol: 1.1 },
        shake: { at: { at: 'goku' }, amount: 0.4 },
        cam: { from: { at: 'goku', local: [2.2, 0.4, 1.2] }, look: { at: 'goku', off: [0, 0, 0] }, fov: 42 },
        hold: 1.4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_majinStance', face: 'angry' }],
        cam: { from: { at: 'vegeta', local: [1, 0.2, 2.4] }, look: { at: 'vegeta', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'vegeta', line: 'This one is mine.', duration: 2.4 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goku;
      g.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
      ctx.m.flags.gokuDown = true;
    },
    clearMood: false,
  };

  /** The first time: the camera stays on the pieces until he is standing again. */
  S.sacrifice_reform = {
    id: 'sacrifice_reform',
    cast,
    events: [
      {
        cam: { from: { at: 'buu', off: [5, 3.5, 6] }, look: { at: 'buu', off: [0, -0.4, 0] }, fov: 46 },
        hold: 1.4,
      },
      {
        cam: { from: { at: 'buu', off: [3, 1.2, 3.5] }, look: { at: 'buu', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_majinStance', face: 'shock' }],
        cam: { from: { at: 'vegeta:face', local: [0.2, -0.03, 1.1] }, look: { at: 'vegeta:head' }, fov: 32 },
        say: { who: 'vegeta', line: '...He put himself back together.', duration: 2.4, style: 'quiet' },
        hold: 2.4,
      },
    ],
    clearMood: false,
  };

  S.sacrifice_farewell = {
    id: 'sacrifice_farewell',
    cast,
    events: [
      {
        // everything into one blast: Buu thrown into the rocks, laughing
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta, buu = ctx.cast.buu;
          K().faceTo(v, buu.pos);
          SL.Cinema.vfx(ctx, { kind: 'beamLine', at: { at: 'vegeta', off: [0, 0.3, 0] }, to: { at: 'buu' }, color: 0xffd060, size: 0.9, steps: 16 });
          b.vfx.explosion(buu.chest(), 6, 0xffd080, { smoke: true });
          const far = buu.pos.clone().add(buu.pos.clone().sub(v.pos).setY(0).normalize().multiplyScalar(18));
          far.y = b.stage.heightAt(far.x, far.z);
          buu.setPosition(far);
          b.vfx.dust(far.clone().add(new V3(0, 0.5, 0)), 5, 18, b.stage.def.terrain.sand);
        },
        pose: [
          { who: 'vegeta', pose: 'blastR', face: 'shout' },
          { who: 'buu', pose: 'lieBack', face: 'grin' },
        ],
        sfx: { name: 'explosionBig', vol: 1.2 },
        shake: { at: { at: 'vegeta' }, amount: 0.7 },
        cam: { from: { at: 'vegeta', local: [-1.6, 0.6, -2.6] }, look: { at: 'buu' }, fov: 50 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'trunks', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'trunks', local: [0.6, 0.2, 1.8] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'kid_trunks', line: 'Dad! Let us help! Goten and me can fight!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        move: { who: 'vegeta', at: 'trunks', off: [0.9, 0, 0.9], seconds: 1.4, face: 'trunks' },
        pose: [{ who: 'vegeta', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'trunks', local: [3.5, 0.9, 2.5] }, look: { at: 'trunks', off: [0, 0.4, 0] }, fov: 42 },
        hold: 0.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'v_hold', face: 'soft' }],
        music: { song: 'farewell', level: 1 },
        cam: { from: { at: 'vegeta', local: [1.4, 0.2, 1.8] }, look: { at: 'vegeta', off: [0, 0.1, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'Trunks. Take care of your mother.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'trunks:face', local: [0.1, -0.02, 0.9] }, look: { at: 'trunks:head' }, fov: 30 },
        say: { who: 'kid_trunks', line: 'Dad...?', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      {
        cam: { from: { at: 'vegeta:face', local: [0.15, -0.03, 1] }, look: { at: 'vegeta:head' }, fov: 30 },
        say: { who: 'vegeta', line: 'I never once held you. Not even when you were born. ...Let me, now.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      {
        pose: [
          { who: 'vegeta', pose: 'v_chop', face: 'grit' },
          { who: 'trunks', pose: 'knockdownFace', face: 'ko' },
          { who: 'goten', pose: 'knockdownFace', face: 'ko' },
        ],
        sfx: { name: 'punchLight', vol: 1 },
        cam: { from: { at: 'vegeta', local: [2.6, 0.8, 2.2] }, look: { at: 'trunks', off: [0, -0.4, 0] }, fov: 44 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'piccolo', pose: 'idle', face: 'grit' }],
        cam: { from: { at: 'piccolo', local: [0.9, 0.35, 2.4] }, look: { at: 'piccolo', off: [0, 0.4, 0] }, fov: 38 },
        say: { who: 'piccolo', line: 'Vegeta. If you die here — you will not go where Goku goes.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'vegeta', local: [0.8, 0.4, 2.2] }, look: { at: 'vegeta', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'vegeta', line: 'I know. Take them. Far.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        tick: (ctx) => {
          const p = ctx.cast.piccolo;
          p.pos.y += 0.3;
          p.grounded = false;
          for (const k of [ctx.cast.trunks, ctx.cast.goten]) k.setPosition(p.pos.clone().add(new V3(k === ctx.cast.trunks ? 0.5 : -0.5, 0.2, 0)));
        },
        pose: [{ who: 'piccolo', pose: 'flyUp', face: 'grit' }],
        sfx: { name: 'dash', vol: 0.9, pitch: 0.8 },
        cam: { from: { at: 'vegeta', local: [0.6, 0.2, -2.4] }, look: { at: 'piccolo' }, fov: 50 },
        hold: 1.6,
      },
    ],
    end(ctx) {
      for (const k of ['piccolo', 'trunks', 'goten']) if (ctx.cast[k]) ctx.cast[k].setHidden(true);
      ctx.m.flags.farewell = true;
    },
    clearMood: false,
  };

  S.sacrifice_after = {
    id: 'sacrifice_after',
    cast,
    events: [
      {
        music: { song: null, level: 0 },
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          v.setState('scripted', { pose: 'v_acceptMark', expression: 'calm' });
          if (v.model.setStone) v.model.setStone(true);
          v.auraOff = true;
        },
        cam: { from: { at: 'vegeta', off: [26, 10, 20] }, look: { at: 'vegeta', off: [0, -1, 0] }, fov: 42 },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'vegeta', local: [0.7, 0.2, 2.6] }, to: { at: 'vegeta', local: [0.5, 0.25, 2] }, look: { at: 'vegeta:head' }, fov: 34 },
        hold: 2.6,
      },
      {
        // the statue gives: it crumbles into grey dust, and the wind takes it
        call: (ctx) => {
          const b = ctx.b, v = ctx.cast.vegeta;
          for (let i = 0; i < 18; i++) {
            const d = new V3(U.rand(-1, 1), U.rand(0.2, 1.2), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(1.5, 5));
            b.vfx.rock(v.chest().add(new V3(U.rand(-0.3, 0.3), U.rand(-0.8, 0.6), U.rand(-0.3, 0.3))), d, U.rand(0.06, 0.16), 0x9a9690);
          }
          b.vfx.dust(v.pos.clone().add(new V3(0, 0.8, 0)), 2, 20, 0xa8a49c);
          v.setHidden(true);
        },
        sfx: { name: 'rockBreak', vol: 0.8, pitch: 0.7 },
        cam: { from: { at: 'vegeta', off: [4, 1.6, 5] }, look: { at: 'vegeta', off: [0, 0.2, 0] }, fov: 44 },
        hold: 3.4,
      },
      {
        cam: { from: { at: 'buu', off: [6, 3, 7] }, look: { at: 'buu', off: [0, -0.5, 0] }, fov: 46 },
        hold: 3,
      },
      {
        sfx: { name: 'regrow', dur: 2.6, vol: 1 },
        cam: { from: { at: 'buu', off: [3.5, 1.1, 4] }, look: { at: 'buu', off: [0, 0.1, 0] }, fov: 40 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'buu', pose: 'bu_laugh', face: 'grin' }],
        cam: { from: { at: 'buu', local: [0.6, 0.3, 2.4] }, look: { at: 'buu', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'majin_buu', line: 'Hee hee hee! That was a big one!', duration: 2.8 },
        hold: 3,
      },
    ],
    end(ctx) {
      // watched or skipped: nothing of him is left standing
      const v = ctx.cast.vegeta;
      v.auraOff = true;
      v.setHidden(true);
      ctx.m.flags.statue = true;
    },
    clearMood: false,
  };
})();
