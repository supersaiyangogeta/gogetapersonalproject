/*
 * SCENE — "Goku takes the Kaioken up against Frieza".
 *
 * Not every Kaioken is a cutscene: the player activates it in gameplay like any
 * other form. This one is the first escalation against something that has been
 * playing with him, so it gets the treatment — pushed back, steadied, a long
 * breath, the red rising, the ground giving up, and then he is gone from the
 * frame before the camera catches him.
 *
 * The form itself is applied by the engine (Fighter transform states), so the
 * scene stages it and the mission teaches the level; a skip lands on the same
 * state: Kaioken unlocked, control returned, Frieza waiting.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});

  S.goku_kaioken_escalation = {
    id: 'goku_kaioken_escalation',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza, krillin: s.krillin, gohan: s.gohan };
    },
    events: [
      // knocked back, and not getting up quickly
      {
        pose: [
          { who: 'goku', pose: 'knockdown', face: 'hurt' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        mood: { amount: 0.4, color: 0x3a1a24, seconds: 0.8 },
        sfx: { name: 'groundImpact', who: 'goku', vol: 1 },
        vfx: { kind: 'dust', at: { at: 'goku' }, radius: 3, count: 16 },
        cam: { from: { at: 'goku', local: [2.2, 0.9, 3.2] }, to: { at: 'goku', local: [1.5, 0.45, 2.4] }, look: { at: 'goku' }, fov: 44, fov2: 38 },
        hold: 2.4,
      },
      {
        cam: { from: { at: 'frieza', local: [1.1, 0.5, 3] }, look: { at: 'frieza' }, fov: 38 },
        say: { who: 'frieza', line: 'Is that all of it? I did hope for more.', duration: 2.6 },
        hold: 2.6,
      },
      // he gets up. Slowly, and with a plan.
      {
        pose: [{ who: 'goku', pose: 'g_kaiokenFlex', face: 'grit', speed: 3 }],
        cam: { from: { at: 'goku', local: [0.7, 0.28, 2.6] }, to: { at: 'goku', local: [0.42, 0.14, 1.7] }, look: { at: 'goku', off: [0, 0.1, 0] }, fov: 40, fov2: 32 },
        say: { who: 'goku', line: 'Then let me try something I have been saving.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // the red: ground cracks, rock lifts, the camera circles him
      {
        music: { level: 4 },
        sfx: { name: 'kiCharge', who: 'goku', vol: 1.1 },
        vfx: { kind: 'stream', at: { at: 'goku' }, radius: 3, count: 12, color: 0xff5a48, life: 0.6 },
        mood: { amount: 0.65, color: 0x40101a, seconds: 0.5 },
        cam: { orbit: { at: 'goku', from: 0, to: Math.PI * 1.2, radius: 4.4, radius2: 2.8, y: 0.2, y2: 0.8 }, look: { at: 'goku', off: [0, 0.3, 0] }, from: { at: 'goku', off: [0, 0.4, 4] }, fov: 44, fov2: 50 },
        hold: 2.6,
      },
      {
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 12, radius: 4.5, lift: 11 },
        shake: { at: { at: 'goku' }, amount: 0.7 },
        hold: 0.9,
      },
      // the burst
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          if (!g) return;
          ctx.b.vfx.ring(g.pos.clone().add(new THREE.Vector3(0, 0.4, 0)), 13, 0xff5a48, 0.8, new THREE.Vector3(0, 1, 0));
          ctx.b.vfx.explosion(g.chest(), 5, 0xff8a70, { smoke: false });
        },
        screen: { flash: 0.6, color: '#ffd8d0' },
        sfx: { name: 'explosionBig', who: 'goku', vol: 1 },
        shake: { at: { at: 'goku' }, amount: 1 },
        cam: { from: { at: 'goku', local: [0.4, 0.45, 3.2] }, to: { at: 'goku', local: [0.2, 1.1, 5.4] }, look: { at: 'goku', off: [0, 0.4, 0] }, fov: 36, fov2: 48 },
        say: { who: 'goku', jp: '界王拳！', line: 'Kaioken!', duration: 2.2, style: 'shout', voice: 'goku_kaioken' },
        hold: 2.4,
      },
      // Frieza notices, which is new
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'shock' }],
        cam: { from: { at: 'frieza', local: [0.9, 0.5, 2.6] }, to: { at: 'frieza', local: [0.7, 0.4, 2] }, look: { at: 'frieza' }, fov: 40, fov2: 34 },
        say: { who: 'frieza', line: 'Where did that come from?', duration: 2.2 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'krillin:head', local: [0.5, -0.2, 1.1] }, look: { at: 'krillin:head' }, fov: 38 },
        say: { who: 'krillin', line: 'He was holding that back. He was holding that back the whole time.', duration: 3, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const { b, m, cast } = ctx;
      const g = cast.goku, fz = cast.frieza;
      if (g) {
        // the escalation the scene was about: the form is unlocked and active
        m.teach(g, 'form:kaioken');
        if (g.formIndex < 1) g.applyForm(1);
        if (g.setFormLevel) g.setFormLevel(Math.min(1, (g.form.levels || []).length - 1));
        g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.45));
        g.ki = Math.max(g.ki, 70);
        g.setState('free');
        g.target = fz;
      }
      if (fz) {
        fz.setState('free');
        fz.target = g;
      }
      m.flags.kaiokenShown = true;
    },
  };
})();
