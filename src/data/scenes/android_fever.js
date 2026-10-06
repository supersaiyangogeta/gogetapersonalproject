/*
 * SCENES — Chapter 5: the heart virus, at home.
 *
 *   goku_bed   Goku in bed with the fever, and Chi-Chi beside him
 *
 * A deliberate change of pace after "Ten in the Morning": the loudest fight of
 * the chapter so far stopped because his heart did, and this is where he was
 * taken. Nothing happens in it except a man who cannot get up and the person
 * sitting next to him. The camera stays still and low, the music stays quiet,
 * and it is allowed to be long.
 *
 * Dialogue is paraphrased English written for this project (no Japanese original
 * is claimed for these lines).
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  const cast = (m) => {
    const s = m.battle.story;
    return { goku: s.goku, chichi: s.chichi };
  };

  /** Everybody where the scene needs them: Goku in the bed, Chi-Chi on the stool. */
  function stage(ctx) {
    const b = ctx.b, L = b.stage.landmarks;
    const g = ctx.cast.goku, c = ctx.cast.chichi;
    if (g) {
      g.setPosition(new V3(L.bed.x, L.bed.y, L.bed.z - 0.1));
      g.vel.set(0, 0, 0);
      g.grounded = true;
      // the lying pose runs along the character's facing, and the bed's head is at -z under the window
      g.yaw = g.prevYaw = 0;
      g.setState('scripted', { pose: 'lieFever', expression: 'hurt', speed: 4 });
    }
    if (c) {
      c.setPosition(new V3(L.stool.x, 0, L.stool.z));
      c.vel.set(0, 0, 0);
      c.grounded = true;
      c.yaw = c.prevYaw = Math.atan2(L.bed.x - L.stool.x, L.bed.z - 0.3 - L.stool.z);
      c.setState('scripted', { pose: 'cc_bedside', expression: 'hurt', speed: 3 });
    }
  }

  S.goku_bed = {
    id: 'goku_bed',
    cast,
    music: { song: 'farewell', level: 1 },
    events: [
      // the room: afternoon light through the window, and nobody moving
      {
        call: stage,
        mood: { amount: 0.12, color: 0x2a2018, seconds: 1.2 },
        cam: { from: [3.4, 2.3, 3.2], to: [3, 2.1, 2.4], look: [0, 0.8, -2.4], fov: 52, fov2: 48, ease: 'inOut' },
        hold: 4.6,
      },
      // his face: the fever, the breathing
      {
        // he is lying down: the actor point is a standing chest, so the head is most of a metre below it and toward -z
        cam: { from: { at: 'goku', off: [0.75, -0.37, -0.18] }, to: { at: 'goku', off: [0.6, -0.42, -0.3] }, look: { at: 'goku', off: [0, -0.87, -0.73] }, fov: 34, fov2: 30 },
        sfx: { name: 'heartbeat', who: 'goku', vol: 0.5, pitch: 1.1 },
        hold: 3.6,
      },
      {
        cam: { from: { at: 'chichi', local: [0.7, 0.35, 1.9] }, look: { at: 'chichi', off: [0, 0.05, 0] }, fov: 34 },
        say: { who: 'chichi', line: 'Every time. Every single time the world needs saving, you are the one who comes home like this.', duration: 5, style: 'quiet' },
        hold: 5.2,
      },
      {
        cam: { from: { at: 'goku', off: [0.55, -0.45, -0.12] }, look: { at: 'goku', off: [0, -0.87, -0.73] }, fov: 30 },
        say: { who: 'goku', line: '...the Androids... I have to... get up...', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'chichi', pose: 'cc_bedside', face: 'angry', speed: 4 }],
        cam: { from: { at: 'chichi', local: [0.6, 0.3, 1.6] }, look: { at: 'chichi', off: [0, 0.05, 0] }, fov: 32 },
        say: { who: 'chichi', line: 'You are not getting up. Not today. Let somebody else carry it for once.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      // the long one: both of them in frame, and nothing said
      {
        pose: [{ who: 'chichi', pose: 'cc_bedside', face: 'hurt', speed: 2 }],
        cam: { from: [2.4, 1.6, 0.2], to: [2, 1.4, -0.6], look: [0.4, 0.75, -2.6], fov: 44, fov2: 40, ease: 'inOut' },
        hold: 4.2,
      },
      {
        cam: { from: { at: 'chichi', local: [0.45, 0.28, 1.2] }, look: { at: 'chichi', off: [0, 0.08, 0] }, fov: 26 },
        say: { who: 'chichi', line: 'Just come back to us. That is all I have ever asked you for.', duration: 4.2, style: 'quiet' },
        hold: 4.8,
      },
      {
        fade: { to: 'black', seconds: 2 },
        cam: { from: [0.8, 2.6, 1.2], to: [0.6, 2.8, 0.6], look: [0, 0.8, -2.6], fov: 46, fov2: 50 },
        hold: 2.2,
      },
    ],
    end(ctx) {
      stage(ctx);
      ctx.m.flags.feverScene = true;
    },
  };
})();
