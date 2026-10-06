/*
 * SCENE — "Goku arrives on Namek".
 *
 * Written as data for the cinema runner (src/game/cinema.js): a storyboard of
 * camera moves, poses, lines and world reactions rather than a hand-rolled
 * function. Every beat is here because the moment needs it:
 *
 *   1. the battlefield first, not the hero  — three people who have lost
 *   2. a light in the sky, and the sound before the sight
 *   3. the pod comes down: crater, dust, shockwave, everybody turns
 *   4. the pod opens; he is in silhouette, and he is not in a hurry
 *   5. reaction shots: Krillin, Gohan, Vegeta, and Frieza — four different fears
 *   6. the close-up, and the line: 「待たせたな…みんな」
 *   7. he steps forward, the camera falls in behind him, and the player has him
 *
 * The line is the owner-supplied Japanese, kept exactly; the English underneath
 * is a translation of it, not an invented "iconic quote". Delivery is staged as
 * calm and low: a long hold, no music under it, and the music only returns as he
 * steps past the others.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const U = SL.util;

  /** Store a computed camera as two scene points, so a beat can name them. */
  function shot(ctx, name, s) {
    ctx.cast[name] = { pos: s.pos };
    ctx.cast[name + 'At'] = { pos: s.look };
  }

  S.goku_namek_arrival = {
    id: 'goku_namek_arrival',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza, vegeta: s.vegeta, krillin: s.krillin, gohan: s.gohan, pod: s.pod };
    },
    music: { song: 'menu', level: 0 },
    events: [
      // 1. THE FIELD FIRST, and what has happened to it. Low, level with the ground, with the
      //    prince on his back in the foreground and the man who put him there standing beyond.
      {
        call: (ctx) => {
          const { vegeta, frieza, krillin, gohan, pod } = ctx.cast;
          const b = ctx.b;
          // he is standing over him, not shouting across a field
          const over = vegeta.pos.clone().add(new V3(-1.2, 0, -4));
          over.y = b.stage.heightAt(over.x, over.z);
          frieza.setPosition(over);
          frieza.yaw = frieza.prevYaw = Math.atan2(vegeta.pos.x - over.x, vegeta.pos.z - over.z);
          for (const [f, off] of [[krillin, new V3(5.5, 0, 4)], [gohan, new V3(-4.5, 0, 4.5)]]) {
            if (!f) continue;
            const at = vegeta.pos.clone().add(off);
            at.y = b.stage.heightAt(at.x, at.z);
            f.setPosition(at);
            f.yaw = f.prevYaw = Math.atan2(frieza.pos.x - at.x, frieza.pos.z - at.z);
          }
          // the pod starts high and off to one side; it is a light in the sky before it is a ship
          const land = ctx.m.flags.arrivalPoint ? ctx.m.flags.arrivalPoint.clone() : pod.position.clone();
          ctx.landAt = land.clone();
          ctx.podFrom = land.clone().add(new V3(-26, 96, -34));
          pod.position.copy(ctx.podFrom);
          // a field that has been fought over: dust hanging, ground broken where people fell
          for (const f of [vegeta, krillin, gohan]) {
            if (!f) continue;
            b.vfx.dust(f.pos, 2.6, 6);
            if (b.stage.crater) b.stage.crater(f.pos, 2.4, 0.25, null);
          }
          if (frieza) b.stage.crater && b.stage.crater(frieza.pos.clone().add(new V3(3, 0, 2)), 3, 0.3, null);
          shot(ctx, 'field', SL.Cinema.twoShot(vegeta, frieza, { fov: 44, height: 0.9, pad: 2.6, side: 1, lookUp: 0.5 }));
        },
        pose: [
          { who: 'krillin', pose: 'kneelGrieve', face: 'hurt' },
          { who: 'gohan', pose: 'kneelGrieve', face: 'hurt' },
          { who: 'vegeta', pose: 'lieBack', face: 'hurt' },
          { who: 'frieza', pose: 'idle', face: 'calm' },
        ],
        mood: { amount: 0.3, color: 0x2a2440, seconds: 2 },
        music: { song: null, level: 0 },
        cam: { from: { at: 'field' }, look: { at: 'fieldAt' }, fov: 46 },
        hold: 3,
      },
      // 2. the emperor, from the ground he has put everybody on
      {
        cam: { from: { at: 'frieza', local: [1.1, -1.25, 2.4] }, to: { at: 'frieza', local: [0.9, -1.25, 2] }, look: { at: 'frieza', off: [0, 0.5, 0] }, fov: 40, fov2: 36 },
        hold: 2.2,
      },
      // 3. the prince's condition: close, and he can barely keep his eyes open
      {
        cam: { from: { at: 'vegeta:face', local: [0.2, -0.4, 1] }, to: { at: 'vegeta:face', local: [0.15, -0.35, 0.8] }, look: { at: 'vegeta:face' }, fov: 40, fov2: 34 },
        say: { who: 'vegeta', line: 'Get up. Get up, you...', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      // 4. SOMETHING IN THE SKY. The sound comes first, then the light, then the shape of it.
      {
        call: (ctx) => {
          ctx.b.sfx('dash', null, { at: ctx.landAt, vol: 1.2, pitch: 0.45 });
          shot(ctx, 'sky', { pos: ctx.landAt.clone().add(new V3(7, 1.6, 9)), look: ctx.podFrom.clone(), fov: 46 });
        },
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'shock' }, { who: 'gohan', pose: 'kneelGrieve', face: 'shock' }],
        cam: { from: { at: 'sky' }, look: { at: 'pod' }, fov: 46 },
        say: { who: 'krillin', line: 'Something is coming down.', duration: 2, style: 'quiet' },
        tick: (ctx, t) => {
          const k = U.clamp01(t / 2.4);
          const pod = ctx.cast.pod;
          pod.position.lerpVectors(ctx.podFrom, ctx.landAt.clone().add(new V3(0, 2.4, 0)), k * k);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(pod.position.clone(), 0x9fd8ff, 1.2, 0.45);
        },
        hold: 2.4,
      },
      // 5. IT LANDS. The ground answers for it: crater, ring, dust, and everybody shoved back.
      {
        call: (ctx) => {
          const b = ctx.b;
          const at = ctx.landAt;
          ctx.cast.pod.position.copy(at);
          b.vfx.explosion(at.clone().add(new V3(0, 1, 0)), 7, 0xbfe6ff, { smoke: true });
          b.vfx.ring(at.clone().add(new V3(0, 0.3, 0)), 15, 0xbfe6ff, 0.9, new V3(0, 1, 0));
          b.stage.crater && b.stage.crater(at, 5, 0.5, null);
          b.sfx('groundImpact', null, { at, vol: 1.4 });
          b.cameraTraumaAt(at, 1);
          // level with the ground, off to the side: the ship is seen to arrive, not a white flash
          shot(ctx, 'land', { pos: at.clone().add(new V3(12, 4.5, 11)), look: at.clone().add(new V3(0, 1.6, 0)), fov: 40 });
        },
        vfx: { kind: 'rocks', at: { at: 'pod' }, count: 14, radius: 6, lift: 12 },
        screen: { flash: 0.35, color: '#e8f6ff' },
        cam: { from: { at: 'land' }, look: { at: 'landAt' }, fov: 44 },
        hold: 2.4,
      },
      // 6. the dust, and a shape standing in it — out at his own crater, well away from them
      {
        call: (ctx) => {
          const { goku } = ctx.cast;
          const b = ctx.b;
          // five metres out of the crater, toward the others: the over-the-shoulder shot that
          // follows must not put the camera inside the pod
          const toward = ctx.cast.vegeta.pos.clone().sub(ctx.landAt).setY(0).normalize();
          const at = ctx.landAt.clone().addScaledVector(toward, 5);
          at.y = b.stage.heightAt(at.x, at.z);
          goku.setPosition(at);
          goku.yaw = goku.prevYaw = Math.atan2(ctx.cast.vegeta.pos.x - at.x, ctx.cast.vegeta.pos.z - at.z);
          b.vfx.dust(at, 3.4, 14);
          b.sfx('uiSelect', goku, { pitch: 0.7 });
        },
        show: 'goku',
        pose: [{ who: 'goku', pose: 'idle', face: 'calm' }],
        // in front of him, low: the ship is behind him, where it stays
        cam: { from: { at: 'goku', local: [1.3, -0.35, 3.4] }, to: { at: 'goku', local: [1, -0.3, 2.6] }, look: { at: 'goku', off: [0, 0.45, 0] }, fov: 42, fov2: 38 },
        hold: 2.6,
      },
      // 7. he sees them: over his shoulder, the prince on the ground and the man standing over him
      {
        call: (ctx) => shot(ctx, 'sees', SL.Cinema.overShoulder(ctx.cast.goku, ctx.cast.vegeta, { fov: 34, back: 2.2, side: 0.9, height: 0.55, lookUp: -0.2 })),
        pose: [{ who: 'goku', pose: 'idle', face: 'grit', speed: 2 }],
        cam: { from: { at: 'sees' }, look: { at: 'seesAt' }, fov: 34 },
        hold: 2.4,
      },
      // 8. and crosses the field to him — faster than anybody there can follow
      {
        call: (ctx) => {
          const { goku, vegeta } = ctx.cast;
          const b = ctx.b;
          ctx.crossFrom = goku.pos.clone();
          const to = vegeta.pos.clone().add(new V3(-2, 0, 2.4));
          to.y = b.stage.heightAt(to.x, to.z);
          ctx.crossTo = to;
          const dir = to.clone().sub(ctx.crossFrom).setY(0);
          const side = new V3(-dir.z, 0, dir.x).normalize().multiplyScalar(Math.max(8, dir.length() * 0.45));
          ctx.cast.cross = { pos: ctx.crossFrom.clone().lerp(to, 0.55).add(side).add(new V3(0, 2.2, 0)) };
          b.sfx('dash', goku, { vol: 1.2, pitch: 1.1 });
          b.vfx.dust(ctx.crossFrom, 3, 12);
        },
        pose: [{ who: 'goku', pose: 'flyForward', face: 'grit' }],
        cam: { from: { at: 'cross' }, look: { at: 'goku', off: [0, 0.3, 0] }, fov: 46 },
        tick: (ctx, t) => {
          const k = U.clamp01(t / 1.2);
          const e = 1 - (1 - k) * (1 - k);
          const g = ctx.cast.goku;
          const p = ctx.crossFrom.clone().lerp(ctx.crossTo, e);
          p.y += Math.sin(k * Math.PI) * 2.2;
          g.setPosition(p);
          g.grounded = k >= 1;
          if (ctx.b.frame % 2 === 0 && k < 1) ctx.b.vfx.trail(g.chest(), 0xfff0c0, 0.5, 0.3);
        },
        hold: 1.4,
      },
      // 9. he lands beside the prince, and the ground answers for it
      {
        call: (ctx) => {
          const { goku, frieza } = ctx.cast;
          const b = ctx.b;
          goku.setPosition(ctx.crossTo);
          goku.grounded = true;
          goku.yaw = goku.prevYaw = Math.atan2(frieza.pos.x - goku.pos.x, frieza.pos.z - goku.pos.z);
          b.vfx.dust(goku.pos, 3.2, 16);
          b.vfx.ring(goku.pos.clone().add(new V3(0, 0.25, 0)), 6, 0xfff0d0, 0.5, new V3(0, 1, 0));
          b.cameraTraumaAt(goku.pos, 0.35);
          b.sfx('groundImpact', goku, { vol: 0.9, pitch: 1.1 });
        },
        pose: [{ who: 'goku', pose: 'land', face: 'grit', speed: 4 }],
        cam: { from: { at: 'goku', local: [2.2, -0.2, 2.6] }, look: { at: 'goku', off: [0, 0.2, 0] }, fov: 40 },
        hold: 1.4,
      },
      // 10. four reactions, four different kinds of fear
      {
        cam: { from: { at: 'krillin:head', local: [0.5, -0.15, 1.05] }, look: { at: 'krillin:head' }, fov: 38 },
        pose: [{ who: 'krillin', pose: 'kneelGrieve', face: 'shock' }, { who: 'goku', pose: 'idle', face: 'grit' }],
        say: { who: 'krillin', line: 'Goku...? GOKU!', duration: 2.2, style: 'shout' },
        hold: 2.2,
      },
      {
        cam: { from: { at: 'gohan:head', local: [-0.45, -0.18, 0.9] }, look: { at: 'gohan:head' }, fov: 38 },
        pose: [{ who: 'gohan', pose: 'kneelGrieve', face: 'shock' }],
        say: { who: 'gohan', line: 'Dad!', duration: 1.6, style: 'shout' },
        hold: 1.8,
      },
      {
        cam: { from: { at: 'vegeta:face', local: [0.25, -0.42, 0.95] }, look: { at: 'vegeta:face' }, fov: 38 },
        pose: [{ who: 'vegeta', pose: 'lieBack', face: 'grit' }],
        say: { who: 'vegeta', line: 'Kakarot. Of all the people to walk into this.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'calm' }],
        sfx: { name: 'uiSelect', who: 'frieza', pitch: 1.5 },
        cam: { from: { at: 'frieza:head', local: [0.55, -0.05, 1.2] }, to: { at: 'frieza:head', local: [0.45, -0.05, 1] }, look: { at: 'frieza:head' }, fov: 36, fov2: 33 },
        say: { who: 'frieza', line: 'Another monkey. And this one walks like he owns the field.', duration: 3 },
        hold: 3.2,
      },
      // 11. HIS FACE. Nothing under it: no music, no effects, and time to look at him.
      {
        cam: { from: { at: 'goku:head', local: [0.45, -0.06, 1.35] }, to: { at: 'goku:head', local: [0.3, -0.04, 0.95] }, look: { at: 'goku:head' }, fov: 38, fov2: 32, ease: 'inOut' },
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 3 }],
        music: { level: 0 },
        hold: 2.4,
      },
      {
        say: {
          who: 'goku',
          jp: '待たせたな…みんな',
          line: 'Sorry to have kept you waiting... everyone.',
          duration: 4.2,
          style: 'quiet',
          voice: 'goku_namek_arrival',
        },
        hold: 4.4,
      },
      // 12. the two of them, in one frame, with the prince on the ground between them
      {
        call: (ctx) => shot(ctx, 'face', SL.Cinema.twoShot(ctx.cast.goku, ctx.cast.frieza, { fov: 40, height: 1.1, pad: 1.8, side: -1, lookUp: 0.5 })),
        music: { song: 'finale', level: 2 },
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        cam: { from: { at: 'face' }, look: { at: 'faceAt' }, fov: 40 },
        say: { who: 'frieza', line: 'Another one. You all come to me in the end.', duration: 2.6 },
        hold: 2.8,
      },
    ],
    // guaranteed end state: watched or skipped, the fight starts the same way
    end(ctx) {
      const { b, m, cast } = ctx;
      const g = cast.goku, fz = cast.frieza;
      if (g) {
        if (g.setHidden) g.setHidden(false);
        g.untargetable = false;
        const v = cast.vegeta;
        const at = v ? v.pos.clone().add(new THREE.Vector3(-2, 0, 2.4)) : g.pos.clone();
        if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
        g.setPosition(at);
        g.yaw = g.prevYaw = Math.atan2(fz.pos.x - g.pos.x, fz.pos.z - g.pos.z);
        g.setState('free');
        g.target = fz;
      }
      if (fz) {
        fz.yaw = fz.prevYaw = Math.atan2(g.pos.x - fz.pos.x, g.pos.z - fz.pos.z);
        fz.setState('free');
        fz.target = g;
      }
      if (cast.pod && cast.pod.visible !== undefined) cast.pod.visible = true;
      m.flags.gokuArrived = true;
    },
  };
})();
